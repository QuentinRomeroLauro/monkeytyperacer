# Book quote library

English solo practice, public/private races, and homepage warmups now use excerpts from twelve public-domain novels and story collections. Every excerpt displays its book and author. `book-quote-sources.json` records each edition, source URL, SHA-256, and excerpt count.

Regenerate with `python3 scripts/import-book-quotes.py`. Downloads are cached outside Git in `/tmp/monkeytyperacer-book-sources`. Importing keeps complete paragraphs, normalizes punctuation and whitespace, removes duplicates, and excludes headers, numerical footnotes, and common offensive historical terms. It is an automated selection, not a full editorial review. Underlying works are public domain in the United States; edition links preserve provenance. No Project Gutenberg branding or license boilerplate is included in typing passages.

Practice includes 45–700-character paragraphs to support all length selectors. Races use 140–300 characters for the existing three-minute limit. The homepage samples twelve distinct race excerpts per request on the server, giving refreshes a random starting quote while keeping the full library out of the client JavaScript bundle. Non-English quote collections are unchanged.

## TypeRacer reference investigation (2026-10-11)

The publicly accessible HTML search form at `https://data.typeracer.com/pit/texts` uses GET parameters `q`, `type` (including `book`), and `language` (including `english`). Results link to `/pit/text_info?id=<numeric ID>` and paginate using an opaque `cursor` parameter. Text detail pages expose a passage, source title/type/author, and language, alongside user score data. Example public-domain reference: Pride and Prejudice, text ID 4060197.

This is a public HTML interface, not a verified documented JSON/bulk export API. No authentication or access controls were bypassed. We did not enumerate or clone TypeRacer's copyrighted collection or collect its user scores. The actual imported corpus comes directly from the public-domain source editions above.
