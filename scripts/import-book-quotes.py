"""Build reproducible typing excerpts from public-domain books (US).
Downloads only the listed Project Gutenberg text editions; caches sources outside Git.
"""
import hashlib, json, re, urllib.request
from pathlib import Path
BOOKS = [
 (1342, 'Pride and Prejudice', 'Jane Austen', 'It is a truth universally acknowledged'),
 (158, 'Emma', 'Jane Austen', 'Emma Woodhouse, handsome, clever, and rich'),
 (161, 'Sense and Sensibility', 'Jane Austen', 'The family of Dashwood had long been settled'),
 (11, "Alice's Adventures in Wonderland", 'Lewis Carroll', 'Alice was beginning to get very tired'),
 (12, 'Through the Looking-Glass', 'Lewis Carroll', 'One thing was certain'),
 (55, 'The Wonderful Wizard of Oz', 'L. Frank Baum', 'Dorothy lived in the midst'),
 (113, 'The Secret Garden', 'Frances Hodgson Burnett', 'When Mary Lennox was sent to Misselthwaite Manor'),
 (45, 'Anne of Green Gables', 'L. M. Montgomery', 'Mrs. Rachel Lynde lived just where'),
 (120, 'Treasure Island', 'Robert Louis Stevenson', 'Squire Trelawney, Dr. Livesey'),
 (1661, 'The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'To Sherlock Holmes she is always the woman'),
 (289, 'The Wind in the Willows', 'Kenneth Grahame', 'The Mole had been working very hard'),
 (84, 'Frankenstein', 'Mary Shelley', 'You will rejoice to hear'),
]
ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/monkeytyperacer-book-sources'); CACHE.mkdir(exist_ok=True)
TRANSLATE = str.maketrans({'“':'"','”':'"','‘':"'",'’':"'",'—':' - ','–':' - ','…':'...','\ufeff':''})
def normalize(text):
 return re.sub(r'\s+', ' ', text.translate(TRANSLATE).replace('_','')).strip()
quotes=[]; sources=[]; seen=set()
for book_id,title,author,start in BOOKS:
 path=CACHE/f'{book_id}.txt'
 url=f'https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt'
 if not path.exists():
  with urllib.request.urlopen(url,timeout=45) as response: path.write_bytes(response.read())
 raw=path.read_text(encoding='utf-8-sig').replace('\r\n','\n')
 body=re.split(r'\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n',raw,flags=re.I)[-1]
 body=re.split(r'\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',body,flags=re.I)[0]
 paragraphs=[normalize(p) for p in re.split(r'\n\s*\n',body)]
 first=next((i for i,p in enumerate(paragraphs) if start.casefold() in p.casefold()),None)
 if first is None: raise ValueError(f'Cannot find book opening: {title}')
 count=0
 for text in paragraphs[first:]:
  if not 45 <= len(text) <= 700: continue
  if not re.match(r'^["\']?[A-Z]',text) or not re.search(r'[.!?]["\']?$',text): continue
  if not text.isascii() or re.search(r'\d|[\[\]{}*<>]|gutenberg|transcriber|illustration|contents',text,re.I): continue
  if re.search(r'\b(nigger\w*|negro\w*|savages?|redskins?)\b',text,re.I): continue
  key=text.casefold()
  if key in seen: continue
  seen.add(key)
  quotes.append({'text':text,'source':f'{title} — {author}','length':len(text),'id':len(quotes)+1,'bookId':book_id})
  count+=1
 sources.append({'id':book_id,'title':title,'author':author,'editionUrl':f'https://www.gutenberg.org/ebooks/{book_id}','textUrl':url,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'excerpts':count,'rights':'Underlying text public domain in the United States'})
 print(f'{title}: {count}',flush=True)
practice={'language':'english','groups':[0,100,300,600,9999],'quotes':quotes}
# Race lengths fit the shared three-minute limit; keep complete paragraphs.
races=[q for q in quotes if 140 <= q['length'] <= 300]
(ROOT/'public/quotes/books-english.json').write_text(json.dumps(practice,ensure_ascii=False,indent=2)+'\n')
warmups=[next(q for q in races if q['bookId']==book_id) for book_id, *_ in BOOKS]
(ROOT/'lib/warmup-quotes.json').write_text(json.dumps([{'text':q['text'],'source':q['source'].rsplit(' — ',1)[0],'author':q['source'].rsplit(' — ',1)[1]} for q in warmups],ensure_ascii=False,indent=2)+'\n')
(ROOT/'lib/race-quotes.json').write_text(json.dumps([{'text':q['text'],'source':q['source'],'bookId':q['bookId']} for q in races],ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/book-quote-sources.json').write_text(json.dumps({'sources':sources,'practiceQuotes':len(quotes),'raceQuotes':len(races),'selection':'Complete paragraphs; whitespace and typographic punctuation normalized; duplicates and boilerplate removed.'},ensure_ascii=False,indent=2)+'\n')
print(f'TOTAL practice={len(quotes)} race={len(races)}',flush=True)
