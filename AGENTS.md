<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Next.js App Router and React. Deploy using Vercel; store durable data in Neon Postgres through Vercel's integration.
- Do not introduce Firebase.
- Preserve Monkeytype typing behavior; use the approved compact MTR roadster logo (12° forward lean, rounded bumpers, plain round wheels) for the brand and Hugeicons for all interface icons and TypeRacer blue as the default design accent. See docs/monkeytype-reference.md for parity details.
- Tests: `pnpm test` for engine units; `pnpm exec playwright test` for browser flows with the app running on port 3002.
- Keep `.env.local` and Vercel credentials out of source control.
- When Quentin asks for a pull request, create it ready for review, never as a draft unless explicitly requested.

- Launch monetization is ad experiments only. Keep the merchandise/store banner removed; do not add ads until their placement and provider are chosen.

- Interface icons use a 2.5 stroke weight through components/icons.tsx; the custom logo uses 4.8 for its outline and plain wheels, and 3.6 for MTR lettering, in its 88-unit viewBox.

- Racing is the homepage; solo Monkeytype modes live at /practice and default to quotes. Preserve guest access, shared quote/start time, corrected typing, private room rematches, and separation of race standings from global practice scores.

- Keep the homepage minimal: a real quote can be typed as a warmup; only the primary "Enter a race" button enters the public queue. Typing must never auto-join. Friend races and practice are quiet secondary links. Avoid marketing headlines and explanatory lists.
