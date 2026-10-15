'use strict';
if (typeof fetch !== 'function') {
  console.error(`Pfuuse needs Node 18 or newer (this is ${process.version}). Try: nvm install 20 && nvm use 20`);
  process.exit(1);
}
// Nightly digest runner. Usage: node backend/digest [--dry-run]
// Env: DIGEST_HN (8), DIGEST_SE (5), DIGEST_EXCERPT_LEN (280).

const fs = require('fs');
const path = require('path');
const { renderHtml, renderText, LABELS } = require('./render');

const CONCURRENCY = 4;
const PRUNE_DAYS = 30;

function intEnv(env, key, def) {
  const n = parseInt(env[key], 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
}

function normUrl(u) {
  try {
    const x = new URL(u);
    x.hash = '';
    return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase();
  } catch (e) { return String(u || '').trim().toLowerCase(); }
}

function itemKey(it) { return normUrl(it.url) || (it.source + ':' + it.id); }

function loadSeen(file) {
  try {
    const d = JSON.parse(fs.readFileSync(file, 'utf8'));
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  } catch (e) { return {}; }
}

function saveSeen(file, seen) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(seen, null, 2));
}

function pruneSeen(seen, now) {
  const cutoff = now - PRUNE_DAYS * 86400000;
  for (const k of Object.keys(seen)) if (!(Date.parse(seen[k]) > cutoff)) delete seen[k];
  return seen;
}

// Run fn over items with at most `limit` in flight; order preserved.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function clip(text, n) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  return cut.replace(/\s+\S*$/, '') + '…';
}

async function getExcerpt(item, deps, len) {
  try {
    if (item.source === 'SE' && deps.question) {
      const q = await deps.question.parse(item);
      const best = (q.answers || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0];
      return clip(stripTags(q.body || (best && best.body)), len);
    }
    if (!item.url) return '';
    const a = await deps.article.parse(item.url);
    return clip(a.excerpt || a.text, len);
  } catch (e) {
    return ''; // title-only fallback
  }
}

function stripTags(s) { return String(s || '').replace(/<[^>]*>/g, ' '); }

function today(now) { return new Date(now).toISOString().slice(0, 10); }

/**
 * Build the digest. deps: { sources, article, question, now?, seenFile, env? }
 * Returns { digest, seen, fetched } without writing digest output.
 */
async function build(deps) {
  const env = deps.env || process.env;
  const now = deps.now || Date.now();
  const len = intEnv(env, 'DIGEST_EXCERPT_LEN', 280);
  const limits = { HN: intEnv(env, 'DIGEST_HN', 8), SE: intEnv(env, 'DIGEST_SE', 5) };

  let all;
  try { all = await deps.sources.fetchAll(); } catch (e) { all = {}; }
  all = all || {};
  const fetched = ['HN', 'SE'].reduce((n, s) => n + ((all[s] || []).length), 0);

  const seen = pruneSeen(loadSeen(deps.seenFile), now);
  const taken = new Set();
  const picks = [];

  for (const source of ['HN', 'SE']) {
    const items = (all[source] || []).slice()
      .sort((a, b) => (b.score == null ? -1 : b.score) - (a.score == null ? -1 : a.score));
    const chosen = [];
    for (const it of items) {
      if (chosen.length >= limits[source]) break;
      if (!it || !it.title) continue;
      const key = itemKey(it);
      if (seen[key] || taken.has(key)) continue;
      taken.add(key);
      chosen.push(Object.assign({}, it, { _key: key }));
    }
    picks.push({ source, label: LABELS[source], items: chosen });
  }

  const flat = [].concat(...picks.map(p => p.items));
  const excerpts = await mapLimit(flat, CONCURRENCY, it => getExcerpt(it, deps, len));
  flat.forEach((it, i) => { it.excerpt = excerpts[i]; });

  const stamp = new Date(now).toISOString();
  for (const it of flat) { seen[it._key] = stamp; delete it._key; }

  return { digest: { date: today(now), sections: picks }, seen, fetched, count: flat.length };
}

/**
 * Full run. opts: { dryRun, env, now, sources, article, question, stateDir, outDir }
 * Returns { code, htmlPath, digest }.
 */
async function run(opts) {
  opts = opts || {};
  const env = opts.env || process.env;
  const stateDir = opts.stateDir || path.join(__dirname, '.state');
  const outDir = opts.outDir || path.join(__dirname, 'out');
  const seenFile = path.join(stateDir, 'seen.json');
  const deps = {
    sources: opts.sources || require('../sources'),
    article: opts.article || require('../article'),
    question: opts.question || require('../question'),
    now: opts.now, env, seenFile
  };

  const { digest, seen, fetched, count } = await build(deps);
  if (fetched === 0) {
    console.error('[digest] every source came back empty; nothing written');
    return { code: 1, digest };
  }

  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, digest.date + '.html');
  fs.writeFileSync(htmlPath, renderHtml(digest));
  fs.writeFileSync(path.join(outDir, digest.date + '.txt'), renderText(digest));
  console.log('[digest] wrote ' + htmlPath + ' (' + count + ' items)');

  if (opts.dryRun) {
    console.log('[digest] dry run: seen-state not updated');
    return { code: 0, htmlPath, digest };
  }

  saveSeen(seenFile, seen);
  return { code: 0, htmlPath, digest };
}

module.exports = { run, build, mapLimit, normUrl, loadSeen, pruneSeen, clip };

if (require.main === module) {
  run({ dryRun: process.argv.includes('--dry-run') })
    .then(r => process.exit(r.code))
    .catch(e => { console.error('[digest] fatal: ' + (e && e.stack || e)); process.exit(1); });
}
