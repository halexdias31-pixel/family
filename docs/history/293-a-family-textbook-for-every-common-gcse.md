## An @family. textbook for every common GCSE, bare bones, beside Statistics

**Asked for as** *"Add a maths and English language+lit gcse text book in like the stats one. Make it
bare bones. Do physics and chemistry and biology too. Do geography too. Do any other common gcse
subjects too. Keep bare bones for now. Just so we have it set up."*

### What was built

- **23 books** in `data/textbooks.json` after GCSE Statistics, each in the Statistics book's own
  shape (see 257): a title page, then chapters in the specification's order, each chapter its key
  words, its formulas where the subject has them, and three to five worked lines.

  | Book | Board · spec | Chapters |
  |---|---|---|
  | Maths | Edexcel 1MA1 | 20 |
  | English Language | AQA 8700 | 12 |
  | English Literature | AQA 8702 | 11 |
  | Biology, Chemistry, Physics | AQA 8461, 8462, 8463 | 12 each |
  | Geography | AQA 8035 | 14 |
  | History | AQA 8145 | 10 |
  | Religious Studies | AQA 8062 | 11 |
  | French, Spanish, German | AQA 8652, 8692, 8662 (first examined 2026) | 14 each |
  | Psychology, Sociology | AQA 8182, 8192 | 8 each |
  | Business | Edexcel 1BS0 | 10 |
  | Computer Science | OCR J277 | 12 |
  | Design and Technology | AQA 8552 | 10 |
  | Food Preparation and Nutrition | AQA 8585 | 8 |
  | Art and Design | AQA 8201 | 8 |
  | Music | AQA 8271 | 9 |
  | Drama | AQA 8261 | 8 |
  | Media Studies | Eduqas C680QS | 10 |
  | Physical Education | AQA 8582 | 9 |

  1,817 key words, 235 formulas, 1,307 worked lines, 183 lines marked Higher across all 24 books.
  The file is 421 KB (the library it sits beside is 13.6 MB).
- **Options named, not pretended away.** History covers Germany 1890–1945, Conflict and tension
  1918–1939, Health and the people and Elizabethan England; RS covers Christianity, Islam and themes
  A, B, D and E; Geography covers coasts, rivers and hot deserts; English Literature the most-taught
  set texts. Each book's summary says which.
- **Topics join where the tree has a branch** — Maths, the three sciences and English Language's
  technical-accuracy chapters. The other subjects have no branch in `data/topics.json` yet, so their
  chapters carry none, which `check-textbooks.js` allows.

### How it was written

One agent wrote each book against the brief and the real `check-textbooks.js` (run on that book
beside Statistics by a validator, before it could finish). A second, independent agent then read the
book line by line as an examiner would, re-worked every calculation, checked the chapter list and the
tier marks against the specification, and fixed what it found in place. Examples of what the second
pass caught: an "index" defined as how many times a number is multiplied by itself (off by one), a
congruence list missing AAS, quadratic sequences marked Higher when only their nth term is.

**Copyright.** The repository is public. No passage of an in-copyright text is quoted (Priestley,
Russell and most of the anthology poets are named, not copied); Shakespeare, Dickens and Stevenson
are quoted a few words at a time.

### Find

- `SUBJECT_BUCKET` places every subject a book carries, grouped as an options booklet groups them:
  Maths, English, Science, Humanities (Geography, History, Religious Studies — which was a row of its
  own while it was the only humanity), Languages, Social sciences, Business, Technology, Arts,
  Physical Education, Boxing.
- **Subject before Book.** `book` moved from 26 to 31 in `data/settings/facets.json` and after
  `subject` in the code's `FACETS`, so the shelf asks Maths / English / Science … first, and a
  subject with one book ends on it. The code order matters too: the app's own journeys boot without
  the settings file and asked Book first, with all 24 titles — which is also what a phone would do if
  that file ever failed to load.
- The textbook journey walks Learning → Resources → @family. textbooks → Maths → Statistics; the two
  textbook states name GCSE Statistics and add its Book chip.

### For the owner to confirm

Written from knowledge of each specification, not read off the PDFs. The reviewers' open doubts are
mostly tier lines (dependent events and set notation at Foundation; direct and inverse proportion
formulas) and a few exam details (Spoken Language moderation; AQA's minutes per question). Worth one
read per subject before a student relies on a Higher mark.
