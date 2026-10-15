'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Article = require('./article');

test('article.parse blocks non-http and private addresses', async () => {
  for (const u of ['file:///etc/passwd', 'ftp://x.com', 'http://127.0.0.1/', 'http://localhost:5000/', 'http://169.254.169.254/', 'http://[::1]/', 'http://10.0.0.1/', 'http://[::ffff:7f00:1]/', 'nonsense']) {
    await assert.rejects(Article.parse(u), /Could not parse article/, u);
  }
});

test('isPrivateIP', () => {
  assert.ok(Article.isPrivateIP('192.168.1.1'));
  assert.ok(Article.isPrivateIP('fd00::1'));
  assert.ok(!Article.isPrivateIP('8.8.8.8'));
});
