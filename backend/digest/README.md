# Pfuuse digest

Builds a one-page digest (HTML + plain text) of the top Hacker News and Stack Exchange items, with a short
excerpt for each. Output goes to `backend/digest/out/YYYY-MM-DD.{html,txt}`.

    npm run digest        # write today's digest; remembers items so they aren't repeated
    npm run digest:dry    # write output only, seen-state untouched
    node --test backend/digest

- Limits: `DIGEST_HN` (8), `DIGEST_SE` (5), `DIGEST_EXCERPT_LEN` (280). Deduped by URL.
- `.state/seen.json` remembers shown items for 30 days.
- Exit code 1 if every source came back empty.
- Optional nightly run via cron: `30 6 * * * cd /path/to/pfuuse && node backend/digest >> /var/log/pfuuse-digest.log 2>&1`
