## The @family. textbook is a resource in Find, and GCSE Statistics is the first

**Asked for as "the @family textbook should be bare bones for now and the textbooks will be in the
resources tag in the finder. first one can be gcse statistics."** Earlier on the same list: "custom
books, make me a custom book" and "Knowledge organisers" — which is what a bare-bones chapter is.

### What was built

- **`data/textbooks.json`** — one row per chapter, one object per line, the sheet's own column names:
  `book_id`, `chapter`, `title`, `summary`, `subject`, `level`, `board`, `spec`, `tier`, `topics`,
  `words`, `formulas`, `points`, `active`. The row with `chapter: 0` is the book's **title page**
  (name, summary, subject, level, board, spec) so a book's own facts are written once rather than on
  sixteen rows that could disagree. `words`, `formulas` and `points` are pipe lists, each item
  `name — text` (an em dash with spaces); a leading `[H] ` marks Higher tier only, and a chapter that
  is Higher all through says `tier: Higher` instead. Maths is stored as typed — `Σfx / Σf`, `x^2`,
  `Q₁` — and drawn by the app.
- **GCSE Statistics**, sixteen chapters in the topic order of the **Edexcel GCSE (9–1) Statistics
  1ST0** specification: enquiry cycle, types of data, sampling, collecting data, tables, charts for
  categories, charts for numbers, averages, spread, comparing and skewness, correlation, time series,
  index numbers and rates, estimation and quality assurance, probability, probability distributions.
  121 key words, 44 formulas, 70 worked lines, 45 lines marked Higher, one chapter Higher all
  through. Written here, not copied. Chapter titles are ours, not the specification's numbering.
- **`js/library.js`** — `textbooks` is the eighth `LIB_EXTRA` file; the mapper groups chapters into
  one object per book, sorts them by number, and reads `[H]` and `name — text` once.
- **`js/find.js`** — a `textbook` kind (Learning, `Resources`, beside the boxers and bouts), its
  mapper (every word of every chapter in the search haystack; the chapters' topics are the book's),
  `textbookCard_` (the contents), `textbookPart_` (one page per chapter: key words, formulas, worked
  lines, topics), `pageParts_` giving `ch1`…`chN`, and two facets: **`shelf`** (`Shelf`, `always`)
  and **`book`** (`Book`). `Statistics` joined the `Maths` row of `SUBJECT_BUCKET`.
- **Formulas through `typeset_`**, the library's own fraction and power drawing: `tbMath_` escapes the
  cell, turns `/` into the `&frasl;` `typeset_` reads, and turns Unicode subscripts into `<sub>`
  (the mono face drew `P₉₀` as `P∘∘` at 320px).
- **`backend/doget.gs`** — `textbooks: []`, the line every phone-filled key has, for `check-payload`.
- **`data/settings/facets.json`** — `shelf` at 24 and `book` at 26.

### Why a Shelf door, and why `always`

`Resources` was 260 rows of boxing. Every question asked there was a boxing question, and a book
answers none of them — so the book was reachable by search and nothing else. The owner's route has
a third rung, "Learning → Resources → @family. textbooks → GCSE Statistics", and `shelf` is that
rung. One book against 260 boxers is a 0.4% split, which `FACET_MIN_MINORITY` refuses — right for a
filter, wrong for a door — so it carries `always` like `What for` and `What kind`. The coverage rule
still applies, so it is never asked of the questions; and every resource has to name a shelf, which
is why boxers and bouts now say `Boxing` (a boxer with no shelf vanishes the moment a shelf is pressed
— the journey checks exactly that). Boxing costs one more tap: Resources → Boxing → Boxers or fights.

`book` is a plain question. With one book it has one answer and is not asked — the list IS the book,
so the route's last rung is the card itself. The second book makes it a question with no deploy.

### Why one file and not one per book

A file is a name in `LIB_EXTRA` and a name there is a deploy. The second book should be rows.

### Why Edexcel 1ST0 and not AQA 8382

Edexcel's is the more widely sat GCSE Statistics, and the library already leans Edexcel for maths.
The two cover nearly the same content; the order and a few Higher-only lines differ.

### What the library joins to

Chapters name topics from `data/topics.json` (Sampling, Histograms, Box Plots & Quartiles, Tree
Diagrams …). **The library has no GCSE Statistics (1ST0) questions**: its 68 `Paper 31: Statistics`
rows are A-level 9MA0, a different qualification, and are not joined. `check-textbooks.js` prints,
per chapter, how many GCSE questions already share its topics (133 on the averages topics, 0 on
correlation and time series).

### Checks

- `js/check-textbooks.js` (in `check-all.js`) — ids, a title page per book, chapters 1…N in file
  order, at least three key words each `name — text`, three to five short worked lines, every
  formula and worked line through the REAL `typeset_` with no slash or caret left unset and no
  fraction that stacks one word of a phrase (`frequency / class width`), the `[H]` mark exact and
  never inside a Higher chapter, topics that join, subject and level placed, and Find's half read
  out of the source: the kind wears `Resources`, `Resources` is in `KIND_BUCKET`, `LIB_EXTRA` fetches
  the file, `shelf` is `always`, the book is on its shelf and the boxers and bouts on theirs.
  It caught a real fault while being written: the stem-and-leaf key `3 | 7` split one worked line
  into two at the pipe.
- `js/check-flow.js` journey — the real file through the real mapper, with the real boxers, bouts
  and projects beside it; the route pressed on the real answer buttons; the list is the book; a
  contents card and a page per chapter in order; stacked fractions; the Higher marks; `frequency
  density` finds it; the Save tile keeps it on Saved; and no resource is left off a shelf.
- `check/states.js` — `a textbook chapter`, on Measures of spread (the widest page: a root over a
  stacked fraction), so `check/ui.js` and `check/press.js` measure it and its neighbours.

### For the owner to confirm

Tier assignments and the chapter order were written from knowledge of the 1ST0 specification, not
read off the PDF: in particular capture–recapture, chain base index numbers, standardised rates,
the equation of a line of best fit, the SD-based control limits, and binomial and normal
distributions are marked Higher. Worth one read against the spec before a student relies on it.
