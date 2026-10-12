# Copyright and third-party notices

Copyright © 2026 Quentin Romero Lauro and contributors. Monkeytype-derived portions are copyright Miodec and the Monkeytype contributors.

Monkeytype Racer is a modified work distributed under GNU GPL version 3; see [LICENSE](LICENSE). You may use, modify, and redistribute the covered work under that license, including commercially. It is provided WITHOUT ANY WARRANTY, including MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE, to the extent permitted by law. Separately licensed assets retain their own terms; public-domain texts are not made exclusively GPL by inclusion here.

Modified on 2026-10-11: rebuilt the typing application in Next.js/React, added multiplayer racing, independent accounts and Neon storage, custom roadster branding, and selected book passages. Subsequent changes are dated in the public Git history. Source: https://github.com/QuentinRomeroLauro/monkeytyperacer. The site's `/licenses` page links the source revision used for that build.

## Monkeytype

Upstream: https://github.com/monkeytypegame/monkeytype, version 26.32.0, commit `cbaa65cce81a95eb753308cece40ea8c34a20787`, GPLv3. Credits include Miodec, the project contributors, and Montydrei for the original Monkeytype name suggestion. Original theme, sound, language, and quote files retain their content and embedded notices. `docs/asset-provenance.json` records file hashes and comparisons with upstream. This establishes provenance, not independent clearance of every third-party contribution.

This application is not affiliated with or endorsed by Monkeytype or TypeRacer. TypeRacer inspired the multiplayer quote-racing experience; it is not the source of the custom roadster logo. The GPL is not a trademark permission. Product-name and domain clearance remains unresolved.

## Fonts

`public/licenses/fonts.json` identifies each of the 41 currently bundled fonts, its SHA-256, embedded copyright and license metadata, full license, and individual notice file. Those notices are served at `/licenses/` and linked from the app.

- Most fonts: SIL Open Font License 1.1, with author notices and any Reserved Font Names preserved.
- Roboto, Roboto Mono, Coming Soon: Apache License 2.0, as identified by these binaries' metadata (not assumed from a newer release's license).
- Ubuntu and Ubuntu Mono: Ubuntu Font Licence 1.0.
- Hack: MIT and Bitstream Vera terms, with the embedded DejaVu public-domain acknowledgment.
- Cascadia Mono: the binary's embedded notice is retained in full, alongside Microsoft's upstream OFL license. Its generic Microsoft introductory wording should be considered alongside that explicit grant.
- The README wordmark outlines glyphs from Space Grotesk; its copyright and OFL notice are included. No font binary was modified here.

Gallaudet was removed from the current tree on 2026-10-11 because redistribution permission could not be established. Earlier commits still contain it; removal does not resolve historic distribution rights.

## Language lists

Embedded source comments are preserved in each file and collected in `/licenses/word-list-sources.json`.

The four Norwegian Bokmål/Nynorsk expanded lists credit Norsk ordbank, Språkbanken Nasjonalbiblioteket; the source notices specify CC-BY 4.0 and upstream modifications. See the source URLs and dates in those notices and `/licenses/CC-BY-4.0.txt`. This application retains those files unchanged. Santali's notice credits O Foundation, 2021, under CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/).

`danish_1k` and `danish_10k` were removed on 2026-10-11: their notices expressly require permission from Dansk Sprog- og Litteraturselskab, and no permission was established for this project. Earlier commits still contain them. Basic Danish remains available.

Other lists refer to Wikipedia/Wiktionary, dictionaries, corpora, and external word-list sites. Their retained attributions do not establish that every required license or database permission has been obtained. The detailed audit records this outstanding review.

## Quotes and books

The 87 inherited Monkeytype quote files remain available at the project owner's request. Attribution to a book, film, song, website, or speaker does not establish redistribution permission. Their underlying text rights are UNRESOLVED; the repository GPL is not a blanket license from those authors or publishers.

English book practice, warmups, and race passages are derived from twelve older works whose underlying English text is public domain in the United States. Authors, edition URLs, source hashes, and excerpt counts are in `docs/book-quote-sources.json`. All twelve cached edition hashes were checked during this audit. The import script removes ebook headers, footers, and branding and normalizes the selected text; it does not distribute the publisher's branded ebook packages. Outside the United States, local copyright terms require separate review.

Source acknowledgment: Project Gutenberg (https://www.gutenberg.org/). It does not endorse this application. Its policy distinguishes references in acknowledgments from use of its trademark to brand a distributed ebook: https://www.gutenberg.org/policy/license.html.

## Software dependencies

Hugeicons React and Core Free Icons are MIT licensed. Full notices for them, React, Next.js, and other installed production dependencies (including bundled dependency notices) are in `public/licenses/dependencies/`, indexed by `public/licenses/dependencies.json`. The lockfile pins dependency versions; these remain under their respective licenses.

The inventory includes build/server dependencies as well as browser dependencies. For example, caniuse-lite uses CC-BY 4.0, and the installed sharp libvips package uses LGPL-3.0-or-later. No new license is imposed on those components. Distributing packaged server binaries or containers requires a separate check of the applicable binary/source obligations, including platform-specific dependencies; this project currently distributes its source and hosts the service on Vercel.

## Audit scope

See `docs/license-audit.md` for evidence, unresolved rights, and deployment verification. These notices do not claim that every third-party right is cleared.
