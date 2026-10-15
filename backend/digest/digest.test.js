'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { run, build, normUrl, mapLimit } = require('./index');
const { renderHtml, renderText } = require('./render');

const mk = (source, n, extra) => Array.from({ length: n }, (_, i) => Object.assign({
  id: source + i, source, title: source + ' title ' + i, url: `https://example.com/${source}/${i}`,
  commentsUrl: `https://example.com/c/${source}/${i}`, score: 100 - i, comments: i
}, extra));

const stubSources = data => ({ fetchAll: async () => data });
const stubArticle = { parse: async url => ({ title: 't', text: 'text of ' + url, excerpt: 'excerpt of ' + url }) };
const stubQuestion = { parse: async item => ({ title: item.title, body: '<p>body</p>', answers: [] }) };
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'digest-'));
const base = (data, extra) => Object.assign({
  sources: stubSources(data), article: stubArticle, question: stubQuestion,
  stateDir: tmp(), outDir: tmp(), env: {}, now: Date.parse('2026-03-10T06:30:00Z')
}, extra);

test('render escapes all text and rejects unsafe links', () => {
  const d = { date: '2026-03-10', sections: [{ source: 'HN', items: [{
    title: '<script>alert(1)</script>', url: 'javascript:alert(1)', commentsUrl: 'https://x.com/?a=1&b="2"',
    excerpt: '<img src=x onerror=1> & "q"', score: 5, comments: 2 }] }] };
  const html = renderHtml(d);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&amp;b=&quot;2&quot;'));
  assert.ok(html.includes('prefers-color-scheme:dark'));
  assert.match(renderText(d), /5 points \| 2 comments/);
});

test('render handles empty digest', () => {
  assert.match(renderHtml({ date: '2026-03-10', sections: [] }), /Nothing new/);
});

test('default limits 8/5 and cross-source URL dedupe', async () => {
  const data = { HN: mk('HN', 12), SE: mk('SE', 9) };
  data.SE[0].url = data.HN[0].url + '/#frag'; // same story, other source
  const { digest } = await build(base(data));
  const counts = digest.sections.map(s => s.items.length);
  assert.deepStrictEqual(counts, [8, 5]);
  const urls = [].concat(...digest.sections.map(s => s.items.map(i => normUrl(i.url))));
  assert.strictEqual(new Set(urls).size, urls.length);
});

test('env overrides limits', async () => {
  const { digest } = await build(base({ HN: mk('HN', 10), SE: [] }, { env: { DIGEST_HN: '3' } }));
  assert.strictEqual(digest.sections[0].items.length, 3);
});

test('seen-state: not repeated next night, pruned after 30 days', async () => {
  const data = () => ({ HN: mk('HN', 3), SE: [] });
  const o = base(data());
  let r = await run(o);
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.digest.sections[0].items.length, 3);
  const next = Object.assign({}, o, { sources: stubSources(data()), now: o.now + 86400000 });
  r = await run(next);
  assert.strictEqual(r.digest.sections[0].items.length, 0);
  const later = Object.assign({}, o, { sources: stubSources(data()), now: o.now + 31 * 86400000 });
  r = await run(later);
  assert.strictEqual(r.digest.sections[0].items.length, 3);
  const seen = JSON.parse(fs.readFileSync(path.join(o.stateDir, 'seen.json')));
  assert.strictEqual(Object.keys(seen).length, 3);
});

test('dry run writes output but not seen-state', async () => {
  const o = base({ HN: mk('HN', 2), SE: [] }, { dryRun: true });
  const r = await run(o);
  assert.ok(fs.existsSync(path.join(o.outDir, '2026-03-10.html')));
  assert.ok(!fs.existsSync(path.join(o.stateDir, 'seen.json')));
  assert.strictEqual(r.code, 0);
});

test('real run saves seen-state', async () => {
  const o = base({ HN: mk('HN', 2), SE: [] });
  const r = await run(o);
  assert.strictEqual(r.code, 0);
  assert.ok(fs.existsSync(path.join(o.stateDir, 'seen.json')));
});

test('per-item failure isolation falls back to title-only', async () => {
  const article = { parse: async url => { if (url.endsWith('/1')) throw new Error('boom'); return { excerpt: 'ok' }; } };
  const { digest } = await build(base({ HN: mk('HN', 3), SE: mk('SE', 1) }, {
    article, question: { parse: async () => { throw new Error('nope'); } } }));
  const hn = digest.sections[0].items;
  assert.strictEqual(hn.length, 3);
  assert.strictEqual(hn.find(i => i.url.endsWith('/1')).excerpt, '');
  assert.strictEqual(hn.find(i => i.url.endsWith('/0')).excerpt, 'ok');
  assert.strictEqual(digest.sections[1].items[0].excerpt, '');
});

test('SE excerpt comes from question body with tags stripped', async () => {
  const { digest } = await build(base({ HN: [], SE: mk('SE', 1) }));
  assert.strictEqual(digest.sections[1].items[0].excerpt, 'body');
});

test('concurrency bounded at 4', async () => {
  let cur = 0, max = 0;
  await mapLimit(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
    cur++; max = Math.max(max, cur);
    await new Promise(r => setTimeout(r, 5)); cur--;
  });
  assert.strictEqual(max, 4);
});

test('all sources empty -> non-zero, nothing written', async () => {
  const o = base({ HN: [], SE: [] });
  const r = await run(o);
  assert.strictEqual(r.code, 1);
  assert.strictEqual(fs.readdirSync(o.outDir).length, 0);
});

test('fetchAll throwing is treated as empty', async () => {
  const r = await run(base(null, { sources: { fetchAll: async () => { throw new Error('x'); } } }));
  assert.strictEqual(r.code, 1);
});
