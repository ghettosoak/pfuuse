'use strict';
// Renders a digest to a self-contained HTML page and a plain-text alternative.
// Input: { date: 'YYYY-MM-DD', sections: [{source, label, items:[{title,url,commentsUrl,score,comments,excerpt}]}] }

const LABELS = { HN: 'Hacker News', SE: 'Stack Exchange' };

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Only allow http(s) links; anything else (javascript:, data:) is dropped.
function safeUrl(u) {
  return /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : null;
}

function meta(item) {
  const parts = [];
  if (typeof item.score === 'number') parts.push(item.score + ' points');
  if (typeof item.comments === 'number') parts.push(item.comments + ' comments');
  return parts;
}

function longDate(date) {
  const d = new Date(date + 'T12:00:00Z');
  if (isNaN(d)) return date;
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const CSS = `
:root{--bg:#faf8f4;--fg:#222;--muted:#76706a;--rule:#e4dfd6;--accent:#9a3b1f;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#161514;--fg:#e8e4dc;--muted:#a09a90;--rule:#2d2b28;--accent:#e58b6b;--card:#1d1c1a}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:18px/1.6 Georgia,'Iowan Old Style','Times New Roman',serif}
.wrap{max-width:640px;margin:0 auto;padding:40px 20px 64px}
header{border-bottom:2px solid var(--fg);padding-bottom:16px;margin-bottom:8px}
h1{font-size:34px;line-height:1.15;margin:0;font-weight:normal;letter-spacing:-.01em}
.date{color:var(--muted);font-style:italic;margin-top:6px}
h2{font:600 13px/1 -apple-system,Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;color:var(--accent);margin:40px 0 4px}
article{padding:18px 0;border-bottom:1px solid var(--rule)}
h3{font-size:21px;line-height:1.3;margin:0 0 6px;font-weight:600}
h3 a{color:var(--fg);text-decoration:none}
h3 a:hover{color:var(--accent)}
p.ex{margin:6px 0 8px;color:var(--fg)}
p.meta{margin:0;font:13px/1.4 -apple-system,Helvetica,Arial,sans-serif;color:var(--muted)}
p.meta a{color:var(--accent)}
footer{margin-top:40px;color:var(--muted);font-size:14px;font-style:italic}
`;

function renderHtml(digest) {
  const sections = (digest.sections || []).filter(s => s.items && s.items.length);
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  let body = '';
  for (const s of sections) {
    body += `<section>\n<h2>${esc(s.label || LABELS[s.source] || s.source)}</h2>\n`;
    for (const it of s.items) {
      const url = safeUrl(it.url);
      const title = url
        ? `<a href="${esc(url)}" style="color:inherit;text-decoration:none">${esc(it.title)}</a>`
        : esc(it.title);
      const bits = meta(it).map(esc);
      const disc = safeUrl(it.commentsUrl);
      if (disc) bits.push(`<a href="${esc(disc)}" style="color:#9a3b1f">discussion</a>`);
      body += `<article style="padding:18px 0;border-bottom:1px solid #e4dfd6">\n<h3 style="font-size:21px;margin:0 0 6px">${title}</h3>\n`;
      if (it.excerpt) body += `<p class="ex" style="margin:6px 0 8px">${esc(it.excerpt)}</p>\n`;
      if (bits.length) body += `<p class="meta">${bits.join(' &middot; ')}</p>\n`;
      body += `</article>\n`;
    }
    body += `</section>\n`;
  }
  if (!total) body = '<p>Nothing new tonight.</p>';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Pfuuse digest ${esc(digest.date)}</title>
<style>${CSS}</style></head>
<body><div class="wrap">
<header><h1>Pfuuse</h1><div class="date">${esc(longDate(digest.date))} &middot; ${total} curiosit${total === 1 ? 'y' : 'ies'}</div></header>
${body}<footer>Gathered overnight from the quieter corners of the web.</footer>
</div></body></html>
`;
}

function renderText(digest) {
  const sections = (digest.sections || []).filter(s => s.items && s.items.length);
  let out = `PFUUSE - ${digest.date}\n`;
  if (!sections.length) return out + '\nNothing new tonight.\n';
  for (const s of sections) {
    const label = (s.label || LABELS[s.source] || s.source).toUpperCase();
    out += `\n${label}\n${'='.repeat(label.length)}\n`;
    s.items.forEach((it, i) => {
      out += `\n${i + 1}. ${it.title}\n`;
      if (it.excerpt) out += `   ${it.excerpt}\n`;
      const bits = meta(it);
      if (bits.length) out += `   ${bits.join(' | ')}\n`;
      if (safeUrl(it.url)) out += `   ${it.url}\n`;
      if (safeUrl(it.commentsUrl) && it.commentsUrl !== it.url) out += `   Discussion: ${it.commentsUrl}\n`;
    });
  }
  return out;
}

module.exports = { renderHtml, renderText, esc, safeUrl, LABELS };
