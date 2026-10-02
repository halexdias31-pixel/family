## The Foundation 5-a-day books, and a letter range that spelled itself like a tens band

**Asked for as "add these 5 a day stuff to database. its foundation", with a Drive folder of seven
monthly books, June to December.** All seven are in: **1,564 rows** — 213 day-documents, the questions
under them, and the shared stems as preambles — through `tools/cbm5ad/`. `common.py` holds the id
scheme and asserts every topic against `data/topics.json`; one `F_MM.py` per month, each written from
the rendered pages; `write.py` replaces every `P-CBM-5AD-F-` row and nothing else, and with no months
present it reproduces the file byte for byte.

**About three quarters of the questions carry an `accept`** and the rest are deliberately without
one, each with a note: drawings, bearings and distances measured off the page, questions with many
right answers, anything asking for simplest form (the rule `check-library.js` enforces), and answers
that are a list or an explanation. A right answer marked wrong is the worse failure, so where a
book's grid does not settle one answer the row goes to a person.

**One book is one Drive file holding a month of documents**, so `check-library.js`'s "one document
transcribed twice" rule — two `paper_id`s on one file — is exempted for `document_type: 5-a-day`
and nothing else. The alternative was a URL per day, which does not exist.

### `2–5` in the paper index promised 1,564 papers and pressing it returned none

**The alphabet grouping keys the paper question on its name, and the 5-a-day books are named
`5-a-day Foundation — …`**, so a range of names starting with digits came out as `2–5`. `bucketHas_`
tests that shape as a TENS BAND first, and a paper id is not an integer, so every one of them was
refused. The numeric branch runs only for a value that is itself an integer now — a tens band is
only ever drawn when every value is one — and the letter-range branch answers everything else.
`check-funnel.js`'s bucket rule named it on the first run after the books landed, which is the
reason that rule walks the real library rather than the fixture.
