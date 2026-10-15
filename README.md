# Pfuuse

A small reader for Hacker News and Stack Exchange. An Express server scrapes the sources **on demand**
(every `GET /api/list` fetches live; nothing is cached or scheduled) and extracts readable article text.
There is also an optional [digest script](backend/digest/README.md).

## Requirements
- Node.js 18 or newer (20 recommended)
- Outbound HTTPS access (Algolia HN API, api.stackexchange.com, and whatever sites the articles live on)

## Run it
```sh
git clone https://github.com/ghettosoak/pfuuse.git && cd pfuuse
npm ci --omit=dev
cp .env.example .env     # optional; only PORT and USE_FAKE exist
npm start                # listens on 127.0.0.1:5000
```
Check it: `curl localhost:5000/api/list`

## API
| Route | Description |
|---|---|
| `GET /api/list` | `{HN: [...], SE: [...], SO: [...same as SE], updatedAt}`. Items: `{id, source, title, url, commentsUrl, score, comments}`. Takes a few seconds; a failing source returns `[]`. |
| `POST /api/view` | JSON `{url, origin, id}`. `origin: "so"`/`"se"` returns `{title, body, answers}`; anything else returns `{title, content, text, excerpt, byline, url}` via Readability. |

## Configuration (`.env`)
- `PORT` (default 5000). The server binds to `127.0.0.1` only.
- `USE_FAKE=1` serves the bundled fixtures instead of live data.

## Keep it running (systemd)
`/etc/systemd/system/pfuuse.service`:
```ini
[Service]
WorkingDirectory=/opt/pfuuse
ExecStart=/usr/bin/node backend/comm.js
Restart=on-failure
User=pfuuse
[Install]
WantedBy=multi-user.target
```
`sudo systemctl enable --now pfuuse`

## Expose it
The server only listens on localhost. Put a reverse proxy in front for outside access, for example nginx:
`location /api/ { proxy_pass http://127.0.0.1:5000; }`
There is no authentication, and `/api/view` fetches arbitrary URLs for the caller. It blocks private and
loopback addresses, but don't expose it publicly without adding auth (basic auth at the proxy is enough).

## Notes
- Stack Exchange's unauthenticated limit is about 300 requests/day per IP. Each list call uses 6. If you hit it,
  register a free key and add it to the requests in `backend/sources/se.js`.
- Paywalled or JavaScript-only articles fail to parse and `/api/view` returns 502.
- Tests: `npm test`.
