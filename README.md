# Monkeytype Racer

An independent Monkeytype-style typing app built with **Next.js App Router, React, Vercel Functions, and Neon Postgres**. There is no Firebase, MongoDB, Redis, or separate API server.

## Run locally

```sh
pnpm install
vercel env pull .env.local
pnpm db:migrate
pnpm dev --port 3002
```

Open http://localhost:3002. Without `DATABASE_URL`, typing tests, themes, settings, and device-local result history still work; accounts and cloud saves require Neon.

## Current functionality

- Time (15/30/60/120/custom), words (10/25/50/100/custom), quotes by length, zen, and custom text with optional randomization.
- Original Monkeytype language lists, quotes, fonts, color themes, and logo. Punctuation and number generation.
- Smooth caret, scrolling word window, error/correction handling, backtracking, normal/expert/master difficulty, confidence mode, stop-on-error, minimum speed/accuracy, and pace caret.
- Live speed/accuracy, timer options, keyboard display, sound controls, custom colors, theme/font selection, and an escape-key command palette.
- WPM, raw speed, accuracy, character breakdown, consistency, timeline charts, personal bests, repeat tests, missed-word practice, and word history.
- Device-local history, JSON result download, CSV export, settings import/export, and responsive layouts.
- Email/password accounts, persistent secure sessions, Postgres result storage, cloud preferences, personal progress, account deletion, and fresh all-time/daily project leaderboards.

## Hosting and database

The project is linked to `tryinspector/monkeytyperacer` on Vercel. `monkeytyperacer-db` is provisioned by the Neon integration through Vercel Marketplace, using the existing Launch plan. The integration supplies `DATABASE_URL` to Development, Preview, and Production.

```sh
pnpm build
vercel --prod --yes
```

The schema lives in `lib/schema.sql`. Run `pnpm db:migrate` before deploying schema changes. Database access uses parameterized Neon queries over HTTP, suitable for Vercel Functions. Authentication uses bcrypt password hashes, random session tokens (stored as SHA-256 hashes), HTTP-only cookies, origin checks, and database-backed rate limits.

The current Vercel environments connect to this project's database; preview branches do not create isolated databases automatically.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm exec playwright test
```

Browser tests assume the app is running at port 3002; override with `TEST_URL`. The account test creates and deletes its own test user against the configured database. The typing-engine suite covers timing, WPM, accuracy after corrections, difficulty, skipped/extra characters, backtracking, word generation, and zen behavior.

## Scope and next phase

This is a functional Next.js recreation of the core Monkeytype experience, not a claim of exhaustive parity with every feature on monkeytype.com. The independent accounts and leaderboards start empty. The official service's historical scores, social graph, subscriptions, and integrations are not copied.

Still outside this first foundation: Monkeytype's full funbox/challenge library, every advanced keyboard/layout option, OAuth and password-recovery email, friends, achievements/XP, and competition-grade anti-cheat. Scores are currently client-reported. Public quote races and private invite rooms are implemented. Practice scores remain client-reported; race progress and finish times are derived by the server from sequenced input, with basic plausibility checks. This is not competition-grade anticheat.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSE](LICENSE) for attribution and GPL-3.0 terms. This project is not affiliated with the official Monkeytype service.

## Behavioral reference and design

See [Monkeytype source audit](docs/monkeytype-reference.md) for pinned upstream references, parity gaps, and the racing implementation sequence. The default design uses TypeRacer blue and Hugeicons throughout.


## Multiplayer races

The homepage offers public racing, friend rooms, and solo practice (`/practice`, quotes by default). Public rooms start a seven-second countdown at two players, allow up to five, and stop accepting joins two seconds before the start. Private hosts start when at least two players are ready. Players correct mistakes to complete the same server-selected English quote. The first finish opens a 30-second grace period; races have a three-minute maximum. Standings use server receipt time, not rounded WPM. Private hosts can rematch with a new quote in the same room; an absent host transfers to an active player.

`POST /api/race` runs on Vercel Functions and uses Neon HTTP queries. Each room is a versioned JSON document; compare-and-swap retries serialize concurrent changes. A partial unique index provides one open public matchmaking slot. Clients exchange updates about every 900ms, with immediate final-input submission and sequenced acknowledgments for retries. Progress animation interpolates between snapshots. Guest seat secrets are hashed and never returned in the roster.

Rooms expire for access after 24 hours; stored room records are not automatically deleted yet. No paid realtime provider or Firebase has been added. At larger traffic volumes, budget for polling queries and migrate transport to a managed realtime service if needed. Server receipt-based finish timing includes network latency; these races are casual and do not feed the global practice leaderboard. Rate limits currently protect queue/room creation; stronger per-route abuse controls and retention automation remain launch-hardening work.

Race tests cover two independent browsers, invite/ready/start, equal quotes, corrected input, offline recovery, standings, reload, rematch, public matching, capacity races, and host authorization. `pnpm exec playwright test tests/browser/racing.spec.ts` uses the configured Neon database. It creates temporary rooms and leaves them afterward.
