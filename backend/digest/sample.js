'use strict';
// Generates a sample digest from stub data: node backend/digest/sample.js
const path = require('path');
const { run } = require('./index');
const mk = (s, titles) => titles.map((t, i) => ({ id: s + i, source: s, title: t, url: `https://example.com/${s}/${i}`,
  commentsUrl: `https://example.com/discuss/${s}/${i}`, score: 300 - i * 40, comments: 120 - i * 25 }));
run({
  dryRun: true, outDir: path.join(__dirname, 'out'), stateDir: path.join(require('os').tmpdir(), 'pfuuse-sample'),
  sources: { fetchAll: async () => ({
    HN: mk('HN', ['The strange mathematics of knitting', 'A tiny database written in 500 lines', 'Why <clocks> drift & what to do']),
    SE: mk('SE', ['Why is the sky dark at night if stars are everywhere?', 'How did medieval bell founders tune bells?'])
  }) },
  article: { parse: async u => ({ excerpt: 'A quietly absorbing read about a small, odd corner of the world, and the people who spend their evenings thinking about it. ' + u }) },
  question: { parse: async () => ({ body: '<p>Olbers\' paradox has a surprisingly deep answer involving the finite age of the universe.</p>', answers: [] }) }
}).then(r => process.exit(r.code));
