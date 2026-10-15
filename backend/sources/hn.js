'use strict';
const { fetchJson, decodeEntities } = require('./util');

const URL_ = 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50';

async function fetchHN() {
  const data = await fetchJson(URL_);
  return (data.hits || []).map((h) => {
    const commentsUrl = `https://news.ycombinator.com/item?id=${h.objectID}`;
    return {
      id: String(h.objectID),
      source: 'HN',
      title: decodeEntities(h.title),
      url: h.url || commentsUrl,
      commentsUrl,
      score: typeof h.points === 'number' ? h.points : null,
      comments: typeof h.num_comments === 'number' ? h.num_comments : null,
    };
  });
}

module.exports = fetchHN;
