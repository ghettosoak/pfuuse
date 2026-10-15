'use strict';
const Sources = require('./sources');

const KEYS = ['HN', 'SE'];

function fakeItems() {
  const hn = require('./fake/HN_fakeresults.js').results;
  const se = require('./fake/SO_fakeresults.js').results;
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  return {
    HN: hn.map((h, i) => ({ id: `fake-hn-${i}`, source: 'HN', title: clean(h.title), url: h.url, commentsUrl: h.url, score: null, comments: null })),
    SE: se.map((q) => {
      const m = String(q.url).match(/\/questions\/(\d+)/);
      return { id: m ? `${q.id}:${m[1]}` : String(q.id), source: 'SE', title: clean(q.title), url: q.url, commentsUrl: q.url, score: null, comments: null };
    }),
  };
}

// Fetch everything fresh. Concurrent callers share one in-flight scrape.
// Sources never throw (a failing one yields []), so this always resolves.
let inflight = null;
function getList() {
  if (!inflight) {
    inflight = (async () => {
      const fresh = process.env.USE_FAKE === '1' ? fakeItems() : await Sources.fetchAll();
      const list = {};
      for (const k of KEYS) list[k] = Array.isArray(fresh[k]) ? fresh[k] : [];
      console.log('LIST FETCHED', KEYS.map((k) => `${k}:${list[k].length}`).join(' '));
      return list;
    })().finally(() => { inflight = null; });
  }
  return inflight;
}

module.exports = { getList };
