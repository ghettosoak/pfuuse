'use strict';
const HN = require('./hn');
const SE = require('./se');

const fetchers = { HN, SE };

async function fetchAll() {
  const keys = Object.keys(fetchers);
  const settled = await Promise.allSettled(keys.map((k) => fetchers[k]()));
  const out = {};
  keys.forEach((k, i) => {
    const r = settled[i];
    if (r.status === 'fulfilled' && Array.isArray(r.value)) out[k] = r.value;
    else {
      console.error(`[${k}] fetch failed:`, r.reason && r.reason.message ? r.reason.message : r.reason);
      out[k] = [];
    }
  });
  return out;
}

module.exports = { fetchAll, fetchers };
