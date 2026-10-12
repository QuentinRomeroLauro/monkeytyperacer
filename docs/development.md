# Build and run the source

Use Node.js 22 and pnpm 10. The repository contains application source, public assets, a dependency lockfile, the database schema, and build scripts. No credentials or existing user data are needed to modify and build it.

```sh
pnpm install --frozen-lockfile
pnpm dev --port 3002
```

Open http://localhost:3002. Solo practice works without a database. For accounts and racing, provision your own Neon Postgres database, copy `.env.example` to `.env.local`, set `DATABASE_URL`, and run `pnpm db:migrate`. Do not commit credentials. The schema is `lib/schema.sql`.

```sh
pnpm licenses:check
pnpm test
pnpm lint
pnpm build
pnpm start --port 3002
```

Browser flows use `pnpm exec playwright test` with the app running on port 3002. Install its browser with `pnpm exec playwright install chromium` first. Account/race tests need your own test database and create records.

## Deployment and corresponding source

Deploy using Vercel with the Neon integration or your own `DATABASE_URL`. Build a clean checkout of a commit already available in the public repository. Vercel Git builds supply `VERCEL_GIT_COMMIT_SHA`; a CLI deployment from an exported checkout must explicitly supply `SOURCE_COMMIT_SHA` as a build environment variable. The Next.js config validates and embeds that public identifier; `/licenses` uses it for immutable source and download links.

Do not deploy uncommitted application changes while claiming the current Git commit represents them. For CLI releases, export the committed tree to a clean temporary directory (`git archive`), link that directory to the Vercel project, and deploy it with `--build-env SOURCE_COMMIT_SHA=<full-public-commit>`. Never include `.env.local`, database dumps, or credentials in the export. Keep the referenced public commit available.

The build is reproducible from its source and locked dependency graph in the practical build/install sense; byte-for-byte reproduction of Vercel-generated output is not claimed. Independently packaged server binaries/containers need their own dependency license review.

## License inventory maintenance

`public/licenses/fonts.json` contains exact font metadata and hashes, with full license files and preserved author notices. `docs/asset-provenance.json` records upstream comparisons and removed files. When changing fonts or imported datasets, update these records and review their actual licenses before publishing. `pnpm licenses:check` rejects missing notices, unexpected font files, changed inventoried assets, and a stale dependency inventory.

To refresh dependency evidence, use `pnpm licenses list --prod --json`, preserve each package's LICENSE/NOTICE files (including bundled files), and update `public/licenses/dependencies.json` without local filesystem paths. Review platform-specific dependencies for deployment/distribution changes.
