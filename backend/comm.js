'use strict';
if (typeof fetch !== 'function') {
  console.error(`Pfuuse needs Node 18 or newer (this is ${process.version}). Try: nvm install 20 && nvm use 20`);
  process.exit(1);
}
require('dotenv').config({ quiet: true });
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const List = require('./list');
const Article = require('./article');
const Question = require('./question');

const app = express();

app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(express.static(path.join(__dirname, '..', 'www')));

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  console.error(`${req.method} ${req.path} failed:`, err.message);
  if (!res.headersSent) res.status(500).json({ error: err.message });
});

app.get('/api/list', wrap(async (req, res) => {
  const l = await List.getList(); // scraped live on every request
  res.json({ ...l, SO: l.SE, updatedAt: new Date().toISOString() }); // SO kept as alias for the old frontend
}));

app.post('/api/view', wrap(async (req, res) => {
  const url = req.body && req.body.url;
  if (typeof url !== 'string') return res.status(400).json({ error: 'url required' });
  const origin = String(req.body.origin || '').toLowerCase();
  const isSE = origin === 'se' || origin === 'so';
  try {
    // article.js rejects non-http(s) and private/loopback targets
    const content = isSE ? await Question.parse({ id: req.body.id, url }) : await Article.parse(url);
    res.json(content);
  } catch (err) {
    console.error('view failed:', err.message);
    res.status(502).json({ error: err.message });
  }
}));

app.use((err, req, res, next) => { // body-parse errors etc.
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message });
});

function start(port = process.env.PORT || 5050) {
  const server = app.listen(port, '127.0.0.1', () => {
    console.log('Hello from http://%s:%s', server.address().address, server.address().port);
  });
  return server;
}

if (require.main === module) start();

module.exports = { app, start };
