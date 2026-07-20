# SiteScout

A working SEO audit platform. Enter any URL, get a real technical + content
audit, a weighted 0–100 score, AI-style prioritized recommendations, a
downloadable PDF report, and a live competitor comparison — no mocked audit
data anywhere.

## What's real vs. what's simplified

This was built in one project, so scope was intentionally chosen to make the
**hard, valuable part — the audit engine — fully real**, while the parts that
would normally need a team-week of backend work are simplified honestly
rather than faked:

| Feature | Status |
|---|---|
| Page fetch, HTML parsing, all 20+ checks | **Real.** Live `fetch()` against the URL you enter, parsed with `cheerio`. |
| SEO scoring (0–100, 9 weighted categories) | **Real.** Deterministic scoring logic in `src/lib/audit/scoring.ts` — no random/mock numbers. |
| Recommendations engine | **Real.** Rule-based, generated from your actual audit data in `src/lib/audit/recommendations.ts`. |
| Content analysis (readability, keywords, FAQ/heading suggestions) | **Real.** Computed from the page's actual visible text (Flesch reading ease, term frequency, etc.) |
| Broken link checking | **Real**, capped to the first 15 internal links per audit to keep audits fast. |
| Site Speed / Core Web Vitals | **Real.** Calls the [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) — the exact engine behind pagespeed.web.dev — for both mobile and desktop, in parallel. Returns real Lighthouse lab metrics (LCP, CLS, FCP, TBT, Speed Index, performance score) plus real-user Field Data (CrUX) when Google has enough traffic data for the URL. Falls back to a simple fetch-timing heuristic (clearly labeled) only if the PSI call fails or times out. Works without an API key on Google's shared quota, or set `PAGESPEED_API_KEY` for higher limits — see `.env.example`. |
| PDF export | **Real.** Generated server-side with `pdf-lib` from live audit data — not a screenshot. |
| Competitor comparison | **Real.** Runs full live audits on every URL you enter and diffs the results. |
| Audit history / Dashboard / Reports | **Real, but local-only.** Stored in `localStorage` in your browser — there's no database in this build (see below). |
| Authentication | **Not implemented.** The login/register page simulates a local session so the rest of the app is reachable. No password is checked or stored anywhere. |
| Database (Postgres/Prisma) | **Not implemented.** Wiring this in is straightforward (see "Extending") but wasn't built to avoid shipping a schema/migrations nobody can actually run without a database URL. |

Nothing above is hidden in the UI — pages that use local-only or estimated
data say so.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment
variables or database are required to run the app as-is.

## Project structure

```
src/
  app/
    page.tsx              Landing page
    audit/page.tsx         Audit results (reads ?url=)
    dashboard/page.tsx      Score history + stats (localStorage)
    reports/page.tsx        PDF export + share links
    compare/page.tsx        Competitor snapshot
    settings/page.tsx       Local preferences
    pricing/page.tsx        "It's free" page — no paid plans, no Stripe
    login/page.tsx          Mock auth
    api/
      audit/route.ts        POST — runs a full audit, returns JSON
      audit/pdf/route.ts    GET  — runs a full audit, returns a PDF
  components/
    audit/                 Results UI (score gauge, recs, breakdown)
    dashboard/, reports/, compare/, layout/, ui/
  lib/
    audit/
      engine.ts             Orchestrates the full audit pipeline
      fetcher.ts             Network layer (page fetch, timing, HEAD checks)
      parser.ts               HTML parsing (meta, headings, images, links, OG, schema)
      technical.ts             robots.txt, sitemap, security headers, broken links
      content.ts                Readability, keywords, FAQ/heading suggestions
      scoring.ts                 Weighted 0–100 scoring per category
      recommendations.ts          Rule-based recommendation generator
      pdf.ts                       PDF report generation
    history.ts               localStorage-backed audit history
  types/audit.ts            Shared TypeScript types for the whole pipeline
```

## How the score is calculated

Nine categories are each scored 0–100 independently, then combined by weight:

| Category | Weight |
|---|---|
| Technical SEO (HTTPS, robots.txt, sitemap, headers) | 20% |
| Meta tags (title, description, canonical) | 15% |
| Content quality | 15% |
| Headings | 10% |
| Performance (real PageSpeed Insights score, mobile-weighted) | 10% |
| Images | 8% |
| Links | 8% |
| Social tags | 7% |
| Structured data | 7% |

See `src/lib/audit/scoring.ts` for the exact per-category logic.

## Extending this into a full production build

The scope was deliberately capped for a single build. To take this further:

1. **Database** — add Prisma + Postgres, add a schema for `User`, `Audit`,
   `Report`, migrate `src/lib/history.ts`'s localStorage calls to real API
   routes backed by the DB.
2. **Auth** — swap the mock session in `src/app/login/page.tsx` for Clerk or
   Supabase Auth; gate `/dashboard`, `/reports`, `/settings` server-side.
3. **Scheduled re-audits** — add a cron (Vercel Cron or a queue) that re-runs
   `runAudit()` for saved URLs and stores results to the DB.
4. **Smarter (not rule-based) recommendations/content suggestions** —
   swap `recommendations.ts` and the content-suggestion functions in
   `content.ts` for calls to an LLM API, passing the structured audit
   JSON as context.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

No environment variables are required for the current feature set. If you
add Prisma/Clerk/Supabase per "Extending" above, set `DATABASE_URL`,
`CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel
project settings.

**Note on `maxDuration`:** the audit and PDF API routes set
`export const maxDuration = 90` — mobile + desktop PageSpeed Insights calls
run in parallel but can each take 15-30s on their own. This requires a
Vercel Pro plan (Hobby caps functions at 10s). On the free (Hobby) plan,
either upgrade, or reduce scope to fit 10s by trimming
`checkBrokenLinks`'s `maxToCheck` in `technical.ts` and skipping the
`fetchPageSpeed()` call in `engine.ts` (the UI already falls back cleanly to
the estimated performance figures when `pageSpeed` is `null`).

### IONOS (or any Node-capable host)

1. Build the app: `npm run build`
2. Ship the whole project directory (or just `.next/`, `public/`,
   `package.json`, `next.config.ts`, and `node_modules` after a production
   `npm ci --omit=dev`) to your server.
3. Start it: `npm run start` (defaults to port 3000 — set `PORT=xxxx` to
   change it, and put a reverse proxy like Nginx in front of it for TLS).
4. Make sure outbound HTTPS requests are allowed from the server — the audit
   engine needs to reach whatever URLs your users enter.

## Known limitations

- Broken-link checking is capped at the first 15 internal links per audit to
  keep response times reasonable — this is disclosed in the UI copy, not
  hidden.
- Some sites block automated `fetch()` requests (bot protection, WAFs). When
  that happens the audit surfaces a clear error rather than silently
  returning empty/fake data.
- Site Speed / Core Web Vitals come from the live PageSpeed Insights API, so
  a run is only as fast/reliable as Google's API that moment. If it fails or
  times out, the UI and JSON response fall back to a directional estimate
  from raw fetch timing (clearly labeled, see `performance.note` and
  `performance.pageSpeedMobileError` / `pageSpeedDesktopError`).
- Field Data (real Chrome-user CrUX metrics) is only available for URLs
  Google has enough traffic data for — low-traffic pages will show Lab Data
  (simulated Lighthouse run) only, same as pagespeed.web.dev does.
- Without a `PAGESPEED_API_KEY`, PSI calls share Google's public quota and
  may get rate-limited under heavy use — set the key (see `.env.example`)
  for production use.
