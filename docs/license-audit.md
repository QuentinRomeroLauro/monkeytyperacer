# License and branding audit — 2026-10-11

## Finding

The repository is public and the application provides GPL terms and corresponding-source links. This is NOT a declaration of complete legal compliance. The inherited quote rights, some third-party word-list rights, historical distribution, and product-name/domain clearance remain unresolved.

## Completed remediation

- Added `/licenses`, reachable from every page's footer and from About/Terms. It contains copyright, modification date, redistribution rights, warranty disclaimer, full GPL text, per-build source browser/download links, and asset/dependency notices.
- Added build/install instructions with source and dependency lockfile. Vercel builds require a valid commit identifier; release procedure uses a clean, committed source export. User credentials and data are not part of the source distribution.
- Preserved metadata and full license references for all 41 retained WOFF2 fonts. Licenses are OFL 1.1, Apache 2.0, Ubuntu Font Licence 1.0, and Hack's MIT/Bitstream terms, rather than a blanket OFL claim. Copyright/RFN metadata remains in the binaries and is also exposed in readable notices. Additional author license files were retrieved from the authors' GitHub repositories; their blob IDs are in `public/licenses/fonts.json`.
- Recorded 67 installed production dependency packages and 226 discovered license/notice files, including Next.js bundled notices. This is a macOS installed-dependency inventory; platform-specific deployment dependencies and redistributed server binaries need separate review. It is not a license certification of every optional platform package.
- Compared 782 imported assets byte-for-byte with Monkeytype commit `cbaa65cce81a95eb753308cece40ea8c34a20787`: 446 language lists, 87 legacy quote files, 155 sounds, 52 themes, and 42 fonts. All matched. One additional book-quote file is our generated dataset. SHA-256 hashes, upstream paths, and current/removed status are in `asset-provenance.json`.
- Removed unused Gallaudet (no established redistribution grant; conflicting third-party listings). Removed the two expanded Danish lists whose embedded notice explicitly requires permission from Dansk Sprog- og Litteraturselskab. Basic Danish remains; saved preferences for removed lists migrate to it. These removals do NOT erase copies in older commits/deployments or establish permission for past distribution.
- Preserved source comments from 38 retained word lists. Four expanded Norwegian lists expressly identify CC-BY 4.0, their source organization/URLs, and upstream modification; full CC-BY text is included. Santali expressly identifies CC0. Other third-party comments require review as below.
- Checked all twelve cached book edition hashes against `book-quote-sources.json`. They match. The selected English texts are older works public domain in the US; the importer removes headers, footers, and ebook branding. This is not worldwide copyright clearance or an independent legal examination of every edition.
- Added `pnpm licenses:check` to catch missing/stale notices, changed font/imported-asset hashes, unreviewed new assets, and changed direct dependency versions. This verifies inventory consistency, not permission.

## Unresolved matters

### Inherited quotes — retained by owner's instruction

The 87 files under `public/quotes/` inherited from Monkeytype include third-party quotations. No per-passage grant was established. GPL attribution to the upstream repository cannot grant rights its contributors did not own. Quentin explicitly chose to retain these collections and document unresolved rights on 2026-10-11. Non-English quote practice remains available. Next action: obtain relevant permissions, establish a defensible exception with qualified counsel, or replace/remove the affected passages.

### Word lists and sound provenance

The language audit exposed source comments pointing to Wikipedia/Wiktionary, dictionaries, academic corpora, LibreOffice-derived lists, and third-party sites. Some may require licenses or database attributions beyond the upstream GPL. The audit preserves these pointers in `public/licenses/word-list-sources.json`; it does not assert that the comments alone satisfy those sources' terms. The two explicitly permission-restricted Danish lists were removed. Next action: resolve source/license/version chains for the remaining externally sourced lists, including any share-alike or database conditions.

Sound files and themes exactly match the upstream GPL repository, with no separate license files found in the pinned tree. That supports the upstream GPL provenance; authorship/permission for every original sound recording has not been independently established. No TypeRacer assets were identified among those imports.

### Branding

Reviewed the pinned upstream LICENSE, README, font/language contribution guides, About source, and the published [Monkeytype Terms of Service](https://monkeytype.com/terms-of-service), plus searches for fork/branding guidelines. No explicit license to use “Monkeytype” as a new product name or in `monkeytyperacer.com` was found. Absence of a published policy is not permission. The service terms prohibit falsely associating oneself with Monkeytype; they govern use of that service and are not an additional software license.

The project uses its own roadster logo and displays an independence disclaimer. Those measures do not decide likelihood of confusion or trademark rights. No comprehensive trademark-register search or legal clearance was performed. Search results for a similarly named font business were not treated as proof of the typing service's trademark registration.

Next action: obtain written permission from the relevant rights holder or obtain qualified trademark advice about the name/domain; otherwise choose a distinct name. No outreach was sent and no rename was made during this audit.

### Historical copies and deployment scope

Removing files from the latest release does not remove them from public Git history, source archives, or immutable old Vercel deployments. No destructive history rewrite or deployment deletion was performed. Historical rights/remediation require a separate decision.

The previous production deployment was `dpl_EZADczneVNLtTHvf6HkW3ey2cghS` (`monkeytyperacer-itye8mtd2-tryinspector.vercel.app`); `vercel inspect --json` did not supply usable Git metadata, so its exact correspondence was not certified retroactively. The new release procedure exports the public commit and embeds its SHA; `/licenses` is the source of truth for that release. See the completion report for the verified deployment and commit.

## Evidence

- [Pinned Monkeytype license](https://github.com/monkeytypegame/monkeytype/blob/cbaa65cce81a95eb753308cece40ea8c34a20787/LICENSE), plus upstream Git tree/blob hashes in `asset-provenance.json`.
- Font binary name tables and original author license files: `../public/licenses/fonts.json` and adjacent notice files.
- [Project Gutenberg policy](https://www.gutenberg.org/policy/license.html): distinguishes unbranded underlying text from branded ebook distribution, allows acknowledgment references, and cautions about non-US law.
- `book-quote-sources.json`: edition URLs, authors, hashes, counts, and normalization notes.
- `../public/licenses/word-list-sources.json`: retained verbatim source comments.
- `../public/licenses/dependencies.json`: installed dependency versions, license identifiers, authors, and notice paths.

## Validation before release

`pnpm licenses:check` passed (41 fonts, 780 current inventoried assets, 67 dependency records); all 32 unit tests passed, including migration away from the removed Danish lists. TypeScript and targeted ESLint passed. React Doctor reported no issues in the changed files. The local `/licenses` page was checked in Yab for rendered content and source/notice links.

Full-project ESLint still reports unrelated errors in the existing homepage's render-time random selection and CommonJS brand-generation scripts (including local untracked design files). Those were not represented as passing and were not included in this compliance change.
