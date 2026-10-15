'use strict';
const test = require('node:test');
const assert = require('node:assert');

const realFetch = global.fetch;
const json = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });
test.afterEach(() => { global.fetch = realFetch; });

const Sources = require('./index');

test('HN preserves order, falls back to discussion url, decodes entities', async () => {
  global.fetch = async () => json({ hits: [
    { objectID: '1', title: 'A &amp; B', url: 'https://a.com', points: 10, num_comments: 3 },
    { objectID: '2', title: 'Ask HN', url: null, points: 5, num_comments: 0 },
  ] });
  const hn = await Sources.fetchers.HN();
  assert.deepStrictEqual(hn.map((i) => i.id), ['1', '2']);
  assert.strictEqual(hn[0].title, 'A & B');
  assert.strictEqual(hn[1].url, 'https://news.ycombinator.com/item?id=2');
  assert.strictEqual(hn[0].source, 'HN');
  assert.strictEqual(hn[0].score, 10);
});

test('SE maps hot questions across sites', async () => {
  global.fetch = async (u) => json({ items: [{ question_id: 7, title: 'Q &quot;x&quot;', link: 'https://s.com/q/7', score: 4, answer_count: 2 }] });
  const se = await Sources.fetchers.SE();
  assert.ok(se.length > 0);
  assert.match(se[0].id, /^[a-z]+:7$/);
  assert.strictEqual(se[0].title, 'Q "x"');
  assert.strictEqual(se[0].comments, 2);
});

test('fetchAll never throws; failing source yields []', async () => {
  global.fetch = async (u) => {
    if (String(u).includes('algolia')) return json({ hits: [{ objectID: '1', title: 't', url: 'https://x.com' }] });
    return new Response('nope', { status: 500 });
  };
  const all = await Sources.fetchAll();
  assert.strictEqual(all.HN.length, 1);
  assert.deepStrictEqual(all.SE, []);
});
