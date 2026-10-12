# Product analytics

PostHog is integrated through `lib/analytics.ts`. Set the public project ingestion token in `NEXT_PUBLIC_POSTHOG_KEY` and the region ingestion host in `NEXT_PUBLIC_POSTHOG_HOST` in Vercel, then rebuild. Never use a personal PostHog API key in the browser. Leave the token unset for ordinary local development and preview builds; analytics becomes a no-op.

## Events

| Event | Meaning / properties |
| --- | --- |
| `$pageview` | App navigation, sanitized page category |
| `warmup_started`, `warmup_completed` | Homepage first input and completion; quote length / aggregate WPM, accuracy, duration |
| `race_action_requested`, `race_action_succeeded`, `race_action_failed` | Queue, create, join, ready, start, rematch, leave; action, kind, request latency, sanitized error category |
| `race_lobby_entered` | A player observed in a room; kind, round, player count |
| `race_started` | Client observes an active race; wait seconds, kind, player count |
| `race_completed` | Client observes its finish or timeout; completed_quote, WPM, accuracy, progress |
| `invite_link_copied` | Successful invite copy; kind |
| `race_replay_played` | Playback started/resumed (no recording content) |
| `race_share_opened`, `race_result_shared` | Share dialog and successful copy/download/native share |
| `practice_started`, `practice_completed`, `practice_result_saved`, `practice_result_shared` | Solo practice funnel and saved/shared outcomes |
| `account_created`, `account_signed_in`, `account_signed_out`, `account_deleted`, `account_auth_failed` | Authentication outcomes, never credentials |
| `app_error` | Unhandled client error count, no raw message/stack/content |

Every event includes product, schema_version, environment, and sanitized page. Client lifecycle events are deduplicated in session storage by local room/round/player identifiers. These identifiers are not sent. Counts describe observed client activity, not an authoritative server ledger; blocked analytics, closed tabs, and disconnected clients can reduce counts. No server event stream is configured.

## Privacy and performance

No autocapture, PostHog session recording, surveys, or feature-flag requests. The site's own typing replay stays separate. No per-keystroke analytics. Only aggregate typing metrics are emitted. Emails, names, passwords, typed text, invite IDs/URLs, URL queries, and referrers are excluded. URLs use `/race/:id` instead of room IDs. Nested SDK URL defaults are scrubbed before delivery. Signed-in identity uses only the internal account ID, with identity reset after sign-out/deletion. The privacy page exposes a persistent opt-out; Do Not Track also disables initialization/capture. SDK failures never block typing or race requests.

## Launch dashboard

Project: [Monkeytype Racer](https://us.posthog.com/project/659519).
Dashboard: [Monkeytype Racer · Launch](https://us.posthog.com/project/659519/dashboard/2198974).


- Visitors: unique users of `$pageview`, daily, by page.
- Race funnel: `race_action_requested` (action=queue) → `race_lobby_entered` → `race_started` → `race_completed` (completed_quote=true).
- Matchmaking: median and 95th-percentile wait_seconds on `race_started`, filtered to public races.
- Return usage: retention from `race_started` to `race_started`.
- Friend racing: create/join actions and `invite_link_copied`.
- Practice: `practice_started` → `practice_completed` → `practice_result_saved`.
- Reliability: `race_action_failed` by action; `app_error` trend.

Filter production dashboards to environment=production. Validate with a synthetic browser session before launch; do not send test names, emails, or actual typing content. The dedicated US Cloud project and launch dashboard are configured. The ingestion token and host are set in Vercel production.

## Browser verification

Build with `NEXT_PUBLIC_POSTHOG_KEY=phc_integration_test NEXT_PUBLIC_POSTHOG_HOST=https://posthog-test.invalid pnpm build`, start on port 3004, then run `TEST_URL=http://localhost:3004 TEST_ANALYTICS=1 pnpm exec playwright test tests/browser/analytics.spec.ts`. This intercepts ingestion locally, checks sanitized delivery and deduplication, and verifies opt-out across navigation. It emulates a human browser only inside the test because PostHog excludes automated browsers. Never deploy this test build.
