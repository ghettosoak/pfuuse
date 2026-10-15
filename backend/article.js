'use strict';
const dns = require('node:dns').promises;
const net = require('node:net');
const { JSDOM, VirtualConsole } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { cleanHtml, TIMEOUT_MS, UA } = require('./sources/util');

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

function isPrivateIPv4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

function isPrivateIP(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase().split('%')[0];
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  const mappedHex = v6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16), lo = parseInt(mappedHex[2], 16);
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return v6 === '::' || v6 === '::1' || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || /^ff/.test(v6);
}

async function assertSafeUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error('Invalid URL'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http(s) URLs are allowed');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost')) throw new Error('Blocked host');
  const addrs = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true }).catch(() => { throw new Error(`Could not resolve ${host}`); });
  if (!addrs.length || addrs.some((a) => isPrivateIP(a.address))) throw new Error('Blocked: private or loopback address');
  return u;
}

async function readCapped(res) {
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BYTES) { await reader.cancel(); throw new Error('Page too large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchHtml(startUrl) {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let current = startUrl;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const u = await assertSafeUrl(current);
    const res = await fetch(u, {
      redirect: 'manual',
      signal,
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), u).href;
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching article`);
    const type = res.headers.get('content-type') || '';
    if (type && !/html|xml/i.test(type)) throw new Error(`Unsupported content type: ${type}`);
    return { html: await readCapped(res), finalUrl: u.href };
  }
  throw new Error('Too many redirects');
}

async function parse(url) {
  try {
    const { html, finalUrl } = await fetchHtml(url);
    const vc = new VirtualConsole(); // swallow jsdom CSS noise
    const dom = new JSDOM(html, { url: finalUrl, virtualConsole: vc });
    const art = new Readability(dom.window.document).parse();
    if (!art || !art.content) throw new Error('No readable content found');
    const text = (art.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      title: art.title || '',
      content: cleanHtml(art.content),
      text,
      excerpt: (art.excerpt || text.slice(0, 200)).trim(),
      byline: art.byline || null,
      url: finalUrl,
    };
  } catch (err) {
    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new Error(`Timed out fetching ${url}`);
    }
    throw new Error(`Could not parse article: ${err.message}`);
  }
}

module.exports = { parse, isPrivateIP };
