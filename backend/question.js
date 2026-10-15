'use strict';
const { fetchJson, decodeEntities, cleanHtml } = require('./sources/util');

const API = 'https://api.stackexchange.com/2.3';

function locate(item) {
  if (item && typeof item.id === 'string' && /^[a-z0-9.]+:\d+$/i.test(item.id)) {
    const [site, id] = item.id.split(':');
    return { site, id };
  }
  const m = item && item.url && String(item.url).match(/^https?:\/\/([a-z0-9.-]+)\/(?:questions|q)\/(\d+)/i);
  if (!m) throw new Error('Cannot determine Stack Exchange site/question id');
  const host = m[1].toLowerCase();
  const site = host.endsWith('.stackexchange.com') ? host.replace(/\.stackexchange\.com$/, '') : host.replace(/\.com$/, '');
  return { site, id: m[2] };
}

async function parse(item) {
  const { site, id } = locate(item);
  const q = `site=${encodeURIComponent(site)}&filter=withbody`;
  try {
    const [qr, ar] = await Promise.all([
      fetchJson(`${API}/questions/${id}?${q}`),
      fetchJson(`${API}/questions/${id}/answers?${q}&order=desc&sort=votes&pagesize=5`),
    ]);
    const question = qr.items && qr.items[0];
    if (!question) throw new Error('Question not found');
    return {
      title: decodeEntities(question.title),
      body: cleanHtml(question.body),
      answers: (ar.items || []).slice(0, 5).map((a) => ({ body: cleanHtml(a.body), score: a.score })),
    };
  } catch (err) {
    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) throw new Error('Timed out fetching question');
    throw new Error(`Could not fetch question: ${err.message}`);
  }
}

module.exports = { parse };
