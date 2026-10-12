# Monkeytype reference audit and our design direction

Reviewed 2026-10-11 against Monkeytype 26.32.0, commit `cbaa65cce81a95eb753308cece40ea8c34a20787`. This is a behavioral reference, not a claim of complete feature parity. Our implementation remains Next.js/React on Vercel with Neon Postgres; upstream UI/backend modules cannot simply be dropped into this stack.

## Design decisions implemented

- Use Hugeicons Free Stroke throughout navigation, typing controls, results, settings, account, modals, notifications, with the approved compact MTR roadster symbol (12° lean, rounded bumpers, plain round wheels) for the brand. Static named imports live in `components/icons.tsx`. Chart paths remain data graphics.
- TypeRacer's live navigation/practice blue, measured at https://play.typeracer.com on the review date, is `#005894`. Reserve it with white text for filled brand surfaces. The merchandise banner has been removed; launch monetization will be ad experiments. Dark-surface interactive text, caret and WPM series use `#4da8e8`, a readable tint (approximately 4.9:1 against `#323437`).
- New default is `typeracer_dark`. Legacy unversioned Serika default settings upgrade once. Other themes and custom palettes remain intact. A deliberately selected Serika theme after this upgrade remains selectable and persists. We cannot distinguish an old deliberate Serika selection from the old default, so both upgrade once.
- Custom palette main color now also controls the caret. Theme selection, errors, focus, and hover retain semantic colors.

## Behavioral findings and implementation priorities

| Area | Upstream behavior / evidence | Current implementation and remaining work |
| --- | --- | --- |
| Caret | Position updates use debounced animation frames. Off/slow/medium/fast map to 0/150/100/85ms, with `inOut(1.25)` easing. Position and line/tape margins have separate animation queues. | Our caret already retargets from its displayed position and uses 100ms animation with reduced-motion support. Remaining: speed choices, exact easing, separate pace-caret style, tape mode and configurable line-scroll behavior. |
| Graphs | Chart.js defaults use line tension 0.5 and zero general animation duration; result tooltip uses index mode, no intersection requirement, and 250ms animation. | Our SVG graph uses monotone cubic curves, full-area nearest-sample hover, animated markers/tooltips and keyboard navigation. Curve mathematics intentionally differ to avoid overshoot. Remaining: burst series, PB/average overlays, configurable axes, word highlighting from hover, replay. |
| Timing | Start-relative `performance.now()` boundaries; early callbacks reschedule the remainder; missed ticks catch up without repeated heavy UI work; finishing has an async duplication guard. | Our clock uses elapsed time but samples through a 100ms interval. Add an event-backed ideal-second grid and catchup handling before competitive use. Test stalls, background tabs, fractional endings, and finish-once behavior. |
| Input | Expert fails on committing a wrong word; master on wrong character; zen bypasses these failures. Quick-end requires exact target length and both stop-on-error and delete-on-error off. Finish also depends on all words being generated. | Core modes/difficulty exist, but add exact interaction fixtures for quick-end + stop-on-error, empty separators, deletion across words, composition and Unicode. Current engine mixes code-point iteration and UTF-16 indexing; it needs normalization before broad language parity. |
| Statistics | WPM is characters / 5 / elapsed minutes. Accuracy derives from correctness-bearing input events (correct / all); no events yields 0. Event data preserves historical errors independently of corrected text. | Our attempts/hits counters and current-word character counts are simpler. Validate raw WPM, completed-word rules, corrected errors, final partial words, spaces and consistency against upstream fixtures. Never infer raw/accuracy only from final displayed text. |
| Chart sampling | Ideal second boundaries are rebuilt from wall-clock end time; catchup buckets can be labeled LAG. Non-timed tests add a fractional tail for a remainder of at least half a second. Zen/bailout have specific trailing idle trimming. | Our samples do not yet model all of these cases. Preserve timestamps and event order first, then derive samples and final totals from the same source. |
| Settings | Default schema includes delete-on-error, composition display, typo indication, independent live speed/accuracy/burst styles, keymap layouts, tape mode, min burst, result-saving rules, quote arrays and speed units. | Our supported subset is functional. Treat upstream defaults/metadata as an inventory: expose settings only when their behavior is implemented, and validate local/cloud versions. Existing boolean caret and restart choices are less expressive. |
| Command palette | Multiword prefix matching over display words and aliases, punctuation removal, availability checks, match-count/strength ranking, and a leading `>` single-list mode. | Current search is simpler. Port matching as pure tested logic, add context availability and aliases, and share commands with settings rather than duplicate actions. |
| Results/account | Upstream includes result tags, filters/presets, PB tables, per-result retrieval, replay and account history/activity/histogram charts. | Local/cloud results and a project leaderboard exist; detailed filtering, replay, tags, comparisons and account chart parity remain work. Sign-in settings hydration also deserves a dedicated regression test (currently auth/me handles hydration on mount). |
| Result trust | Backend checks include hashes, result/key validation and key timing statistics; optional anticheat module may be unavailable. | Current saved client results are not competition-grade verified. Public source alone does not supply complete production anticheat. Add server validation, abuse limits and authoritative race state; hashes alone do not establish trust. |

## Pinned source map

- Caret motion: [frontend/src/ts/elements/caret.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/elements/caret.ts)
- Finish and failure rules: [frontend/src/ts/input/helpers/fail-or-finish.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/input/helpers/fail-or-finish.ts)
- Timer scheduling: [frontend/src/ts/test/test-timer.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/test/test-timer.ts)
- Statistics and sample boundaries: [frontend/src/ts/test/events/stats.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/test/events/stats.ts)
- WPM formula: [frontend/src/ts/utils/numbers.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/utils/numbers.ts)
- Global chart defaults: [frontend/src/ts/components/common/ChartJs.tsx](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/components/common/ChartJs.tsx)
- Result chart interactions: [frontend/src/ts/components/pages/test/result/ResultChart.tsx](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/components/pages/test/result/ResultChart.tsx)
- Default configuration: [frontend/src/ts/constants/default-config.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/constants/default-config.ts)
- Settings metadata: [frontend/src/ts/config/metadata.tsx](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/config/metadata.tsx)
- Command matching: [frontend/src/ts/commandline/filter.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/commandline/filter.ts)
- Result collection: [frontend/src/ts/collections/results.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/collections/results.ts)
- Result filters: [frontend/src/ts/states/result-filters.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/states/result-filters.ts)
- Personal best rules: [frontend/src/ts/test/result-pb.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/frontend/src/ts/test/result-pb.ts)
- Backend result validation: [backend/src/api/controllers/result.ts](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/backend/src/api/controllers/result.ts)

## Implementation sequence

1. **Correctness first:** add input-event capture and parity fixtures for Unicode/IME, correction, word boundaries and finish rules; derive metrics and sample timing consistently. Keep caret rendering isolated from the per-second clock.
2. **Interaction completeness:** richer caret settings, tooltip/replay/word-history integration, command ranking, settings dependencies and missing result filters. Verify pointer, keyboard, touch, narrow screens, focus and reduced motion.
3. **Racing foundation:** Neon tables for rooms, participants, shared text/seed, scheduled start and progress sequence numbers; server-issued race IDs and immutable finishes. Use Vercel route handlers for room lifecycle and persistence. Choose a managed realtime transport when racing is implemented: do not assume Vercel Functions are a persistent WebSocket server. No Firebase dependency is needed.
4. **Race integrity:** enforce participant membership, monotonic progress, elapsed-time bounds and idempotent finish transactions; separate practice results from ranked verified results. Handle reconnect, stale messages, spectators and abandoned rooms explicitly.
5. **Account depth:** expand saved result schema with migrations, add filtered history/PBs/replay and recovery flows. Use Neon indexes and bounded queries, not client-side fetching of all history.

## Regression acceptance checklist

- First keystroke starts exactly once; timer finishing and input finishing cannot both save a result.
- Backspace, word deletion, expert/master, quick-end, stop-on-error, composition and emoji/non-Latin input have deterministic expected outcomes.
- A stalled or hidden tab cannot invent speed, drop duration, or silently fabricate per-second data.
- Caret stays aligned after resize/font load/line wrap; repeated input retargets smoothly without lag accumulating.
- Hover reaches every graph sample, respects actual SVG coordinates, and remains inside mobile bounds; keyboard and reduced motion remain supported.
- Fresh settings use blue; upgraded defaults use blue; explicit alternate/custom themes and a later Serika selection survive reload/cloud sync.
- Icons inherit size/color and are decorative where controls already have accessible labels; tree-shaking keeps unused library icons out of production.
- Race results require server validation before appearing in a ranked leaderboard.

Retain Monkeytype GPL attribution and asset notices. This project is independent of both Monkeytype and TypeRacer.
