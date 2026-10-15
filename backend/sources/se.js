'use strict';
const { fetchJson, decodeEntities } = require('./util');

const SITES = ['stackoverflow', 'serverfault', 'superuser', 'askubuntu', 'unix', 'english'];
const PER_SITE = 8;

async function fetchSite(site) {
  const u = `https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=${site}&pagesize=${PER_SITE}`;
  const data = await fetchJson(u);
  return (data.items || []).map((q) => ({
    id: `${site}:${q.question_id}`,
    source: 'SE',
    title: decodeEntities(q.title),
    url: q.link,
    commentsUrl: q.link,
    score: typeof q.score === 'number' ? q.score : null,
    comments: typeof q.answer_count === 'number' ? q.answer_count : null,
  }));
}

async function fetchSE() {
  const results = await Promise.allSettled(SITES.map(fetchSite));
  const items = [];
  let failures = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
    else { failures++; console.error('[SE] site failed:', r.reason && r.reason.message); }
  }
  if (!items.length && failures) throw new Error('all Stack Exchange sites failed');
  return items.sort((a, b) => (b.score || 0) - (a.score || 0));
}

module.exports = fetchSE;
