# 031-checking-your-work (part 2 of 4)

Continues [part 1](031-checking-your-work.md).

### `Library` is out of the backend entirely — all four tabs, both steps

`boxers`, `fights` and `cheatsheet` are the three tabs left in that file, and they pass the same
three-question test `questions` passed. **The one that decides it is the second**: measured,
`read(TAB.boxers)`, `read(TAB.fights)` and `read(TAB.cheatsheet)` appear **exactly once each, all
three in `doget.gs`**, and no `setCell` or `append` anywhere names them. Nothing writes to them, so
code can hold them.

**Both steps are taken and the spreadsheet is unreachable from the code now.** Step 1 built the
machinery with the payload still answering while the files were empty; step 2 exported the rows and
cut the backend. It took two commits because every Google *host* is blocked from this environment by
network policy — but the **Drive MCP connector is not**, and that is what finally reached the sheet.

| | |
|---|---|
| `data/boxers.json`, `data/fights.json`, `data/cheatsheet.json` | **103 + 157 + 77 = 337 rows**, committed |
| `libraryExtras_` in `js/library.js` | the three mappings — now the ONLY implementation |
| `doget.gs` | the three `read(TAB.x)` blocks deleted; `boxers: []`, `fights: []`, `cheatsheet: []` kept in the payload literal |
| `constants.gs` | `SCHEMA`, `TAB` and `WHERE` ×3 deleted, `LIBRARY_ID` and `FILES.library` gone |

**The cutover was proved byte-identical before it was made**, which is the only reason it was safe
to make in one commit. The exported rows were run through `libraryExtras_` and compared cell by cell
against what `doGet` built from the same tabs: **337 rows, 0 cells differ.** Getting there found
three real helper drifts that a "looks the same" reading would have shipped — `ON_` and `libOn`
disagreed about `✓`, `S` trims where `libS` did not, and `N` and `libN` differ on a blank — so the
mappings were made to agree rather than assumed to.

**`SCHEMA` had to go in the SAME commit as the `doGet` blocks, in both directions.** Deleting the
`SCHEMA` entries alone fails `check-columns.js` with 77 findings — every `r.boxer_id` in a block
that still exists, against a tab the code no longer describes. And leaving them behind is worse than
untidy: `ensureSchema` walks `SCHEMA` and **CREATES any tab it cannot find**, so an entry left in
rebuilds an empty `boxers` tab on the next `?setup=1` — right headers, no rows, exactly the decoy
that hid the real resource rows in another file for months. That is the third time this file records
that argument, after `SCHEMA.resources` and `SCHEMA.questions`.

**What the `[]` fallback means now, because it changed and nothing else would say so.** It was *a
file with no rows leaves the payload's copy alone*, which made step 1 incapable of taking anything
dark. There is no payload copy left — `doGet` sends three empty arrays and nothing fills them — so a
file that 404s is now three dark screens rather than a quiet reversion. It stays that shape anyway:
the alternative is a throw on a file that has not deployed yet, and that takes the whole of `load()`
with it. Written down here and in `library.js` so it is not rediscovered as a bug.

**`check-library.js`'s step-2 notice is what confirmed the cut, and it was proved in both
directions.** Putting one `read(TAB.boxers)` back makes it print *"data/boxers.json now has 103
row(s) AND doget.gs still builds payload.boxers"*; the real files print `none`. That rule had been
pushing to an array nothing printed for as long as it existed — it could not fire, because all three
files held `[]` from the day they were committed, so the first run that could say anything was the
run after the export.

**And `installSheetWatch` has to be re-run after this deploys.** It deletes every trigger by handler
name and rebuilds one per id in `FILES`, so a file *removed* from that list keeps its trigger until
somebody runs it again. `Library`'s is still booked against a spreadsheet nothing reads: harmless,
and still a payload rebuild a minute after every edit somebody makes to it.

**The files hold the sheet's own column names** — `boxer_id`, `height_cm`, `part_id` — not the
camelCase the phone reads. A file that is a faithful export is one you can paste a row into without
translating it, and the single place that renames a column is the mapping. Two spellings in two
places is what `r.link` against `source_url` cost: seven silent reads.

**The one-object-per-line shape is enforced on all four files** and for the reason `questions.json`
has it: the next script to append by splitting on newlines.

#### The spreadsheet itself is NOT deleted, and there is a reason to look before it is

Nothing in this project opens `Library` any more, so deleting it breaks no code. **Do not delete it
yet.** It has **16 tabs and 13 of them are read by nothing** — `bible` (31,102 rows), `questions`
(3,913), `P&R` (273×42), `topicstuff` (269), `english-devices` (180), `M&Pformulas` (96), `icons`
(81), `graphemes` (72), `practicals` (41×41), `_mat-components` (17), `orth` (15), `Verbs command`
(12), `_README` (8). Some of that is the old `questions` tab this repository replaced; some of it is
content nobody has looked at, and a deletion is the one thing here that cannot be undone by a
revert.

**And the `questions` tab still carries `ticks_1/2/3`** — 498 non-empty cells across 169 rows, 469
of which look like people's names. This file says those columns were *"stripped at source"*, and
that sentence is true of `data/questions.json` and **false of the spreadsheet it came from**. They
are not published — the sheet is private and this repository holds none of them — but "stripped at
source" reads as *they are gone*, and they are not. The tick rule in `check-library.js` guards the
public file, which is the half that can leak; the sheet is the owner's to decide about.

### `d = libraryInto_(d, …)` had been throwing on every single load

`d` is `const` — `const d = await res.json()` some forty lines above — so that line threw
**"Assignment to constant variable" every time `load()` ran**, and the `try` around it swallowed it.

**Nothing looked wrong, which is why it survived.** `libraryInto_` **mutates** `d` and returns the
same object, so the questions were already written by the time the assignment was attempted; the
throw came *after* the useful work, and the catch's own repair — `d.questions = d.questions || []` —
found the key populated and left it alone. A correct fallback standing over a broken line, which is
the same shape as the `check-flow` stub with no `text()` and as `.mat-out` being "fixed" twice on a
measurement nobody took.

**What it cost was that nothing after that line inside the try could ever run**, and while the line
was last in its block that was invisible. The three extra library tabs were the first code to sit on
the next line and they simply never executed — found by booting the app with a row in
`data/boxers.json` and watching the payload's copy win anyway. The fix is to drop the assignment:
both functions mutate in place, so the return value was never needed.

### `node js/check-const.js` — the rule, not just the instance

Within **one function body**, a name declared `const` and later assigned or incremented. Narrow on
purpose, and the narrowing was learned twice in one sitting:

- **The first version reported ~90 findings and every one was wrong.** It gathered the bodies
  correctly and then walked each with the ordinary walker, which descends into nested functions — so
  the top-level pass collected every `const` and every assignment in the whole file and matched them
  across scopes. It "found" a `const` declared at line 552 assigned at line 153, four hundred lines
  earlier, in a different function. **That is the `check-rows.js` fault exactly**, and CLAUDE.md
  already says what 95 findings with 2 real ones in them is worth.
- **Scoping the walk left three, and all three were still wrong**: `for (let k = 0; …; k++)` beside
  a separate `const k` further down. Different blocks, different bindings. Getting that right
  properly needs a block-level scope tree, so instead **it declines to answer**: if a name is also
  declared `let`/`var` (or is a parameter) anywhere in the same function, it says nothing. A missed
  case is an incomplete check; a false one is a check nobody reads.

**Proved by mutation**, which is the only thing that shows the exemption did not gut it: putting
`d = libraryInto_(…)` back makes it report `shell.js:2021 — d is declared const at line 1967`, and
removing it goes green across 26 files.

### `questions` lives in this repository, not in a spreadsheet

`data/questions.json` — 4,638 rows at the last count, 40 columns, 3.1 MB, one row per line so a
diff names the rows that changed. The count moves with every transcription; the shape does not.
`js/library.js` fetches it and builds `DATA.questions` and `dropdowns.checklists` from it; `doGet`
no longer builds either.

**Why that tab and no other.** Three questions decide where a thing lives, and the first one that
answers wins:

1. **Is it secret?** → a sheet, never here. This repository is **public**; anything committed is
   published, and git history is permanent. PINs, e-mail addresses, dates of birth.
2. **Does the app write to it?** → a sheet. Code cannot be written to at runtime.
3. **Do you edit it, or does Claude?** → `questions` is the one tab nobody hand-edits. It arrives in
   bulk, and every edit went export → CSV → download → File → Import, twice. `brand`, `config`,
   `pricing`, `facets` are the opposite and stay in Settings: you change them, and changing them
   must never need a deploy.

#### Which papers are in, and how a new one gets there

Thirty Edexcel GCSE maths papers are transcribed, **and they are not all named the same way** —
which is the trap, so read both rows of this table before starting a new one.

| ids | what is in them |
|---|---|
| `P-1MA1-<yy><mm>-<n>H` | 24 Higher papers: **2017, 2018 and 2019 complete** (both sittings, six papers each), **summer 2020**, **summer 2023** |
| `RS1786302107764-415…420` | the **June 2024** series, six papers — Foundation AND Higher, Papers 1, 2 and 3 |

**`node js/check-library.js` prints the count, and the list above is the thing that goes stale.**
The two id schemes are why: a session that listed `paper_id` prefixes, saw no `P-1MA1-24…` and
concluded 2024 was missing transcribed June 2024 Paper 1 a second time — 33 rows with fresh ids,
past every check in the suite, because nothing here knew what a real paper WAS. `check-library.js`
knows now; see "the same paper, transcribed twice" in that file.

Still to do: eighteen PDFs in the Drive folder named only by their Edexcel paper code. **Edexcel
took the exam date off the front page in 2021**, so for those a code is all there is — the © line
narrows it to a year and no further, because June and November of the same year both print the same
one.

**What names them is the PDF's own metadata.** `P68721A0128.pdf` carries `dc:title` = *"Question
paper - Paper 1H - November 2022"* and `/Subject` = *"Paper 1H - Non-Calculator (Higher)"*, and so
do its two siblings. Three papers identified from a field nothing in the reading pipeline looks at,
because the pipeline reads pages. **Check `r.metadata` and `r.xmp_metadata` before reading a single
page of a paper you cannot name.**

| code | what it is |
|---|---|
| `P68721A` / `P68723A` / `P68725A` | **November 2022** Higher 1/2/3 — stated in the metadata |
| `P64630A` / `P64632A` / `P64634A` | Higher 1/2/3, ©2021, no metadata title — **which 2021 sitting is not settled** |
| `P66305A` / `P66303A` / `P66381A` | Higher 1/2/3, ©2021, no metadata title — **same** |
| nine `S48…`/`S49…`/`S50…` | not yet opened; `S` is Edexcel's specimen prefix |

**The two ©2021 sets are an open question and guessing would be worse than waiting.** 2021 ran one
GCSE maths series (November); there are two sets. The InDesign version in each PDF's `/Creator`
splits them — 16.0/16.1 for the `P64` set against 17.0 for the `P66` set, and 17.0 was not released
until 26 October 2021 — but that dates the export, not the sitting. Filing thirty questions under
the wrong sitting puts a wrong answer on the funnel's `Sitting` chip and nothing downstream can tell.
The library holds empty document rows for November 2020, November 2021, June 2022 and November 2022,
and **their `source_url`s carry the real exam dates** (`1MA1_1H_que_20211103.pdf`), which is where a
comparison would have to start if the PDFs ever become reachable — they are on revisionmaths.com,
and the agent environment can reach GitHub and nothing else.

**Every number in a transcription is checked against the paper's own stated total**, which is 80 for
every one of these by definition of the qualification — `check-library.js` refuses a paper that does
not sum to it, and the insert script asserts it before writing a row. That single number catches a
dropped part, a misread mark count and a duplicated question, and it is the only end-to-end check
available, because nothing else knows what the paper said.

**The text layer is the enemy and it fails in four different ways**, each recorded here because each
cost a reading:

| | |
|---|---|
| **mangled maths** | fractions and radicals arrive as loose digits: `x x n n + = − − 1 22 4` is `x(n+1) = −2 − 4/x(n)²`, and reads equally well as a cube root |
| **a Caesar-shifted font** | `)DFWRULVH IXOO\` is `Factorise fully`. Obvious, and harmless once seen |
| **the same shift with the digits gone** | November 2017 Paper 2. The prose is readable and every NUMBER has silently vanished: "The pack costs 5" where the paper says £5.64. Nothing looks wrong |
| **a swallowed coefficient** | the worst, because the question still reads sensibly and is now a different question |

So: extract the text, then **render every page and read it**. A rough tell is size — about 13 KB of
text over 20 pages is a clean extraction and anything well under it is thin — but 16.5 KB has lost a
square root before now, and the last two failure modes leave the size untouched. The tell is not a
test.

**A picture that carries data is measured, not eyeballed.** Box plots, cumulative frequency curves,
pie charts drawn to scale: render at scale 5, find the gridlines by their regular spacing, and read
the marks off them. A cumulative-frequency curve read by eye gave 50 at 160 cm where the pixels said
48.1 — one gave the answer 10 and the other 12, and the gap between them was the whole of the mark
scheme's tolerance.

### The funnel is an engine fed by a hand-written loader, and that seam is where it feels arbitrary

Three layers, each half-generalised:

| Layer | The sheet can | The sheet cannot |
|---|---|---|
| **Items** — `stuffItems()` | nothing | everything. 11 hand-written mappers |
| **Kinds** — `KINDS` + the `kinds` tab | rename, regroup, reorder, switch off | **add one** — `card:` is a function |
| **Questions** — `FACETS` + the `facets` tab | relabel, reorder, set coverage, switch off | **add one** — `of:` is a function |

**You can edit the funnel from a spreadsheet; you cannot extend it.** Boxing cost seven places — a
mapper, `boxKind` invented, a `division` facet, `divisionOf_`, `boxerCard_`, a `KINDS` entry and a
comment explaining why the division is not in `subject`. Six of the seven are code. That is the
ducktape, and it is worth knowing it is structural rather than sloppiness.

**The next question is chosen by arithmetic over the current list, not by meaning.** `nextFacet`
offers the first facet with ≥2 distinct answers and ≥50% coverage — so the same data reached two
ways asks two different questions. Narrow to Maths and `Exam board` appears; add Boxing and it does
not, because half the list has no board. Nothing on screen says so, so it reads as the app changing
its mind. **`whyThisQuestion()` in the console prints every facet with its answer count, its
coverage and the reason it was or was not chosen** — the same instrument as `layout()`, pointed at
the funnel instead of the boxes.

### The arithmetic was incomplete, and that is what "the funnel feels unclear" was

`nextFacet` asked two things of a question — **are there at least two answers**, and **can at least
half the list answer it**. It never asked the third: **does answering it actually split anything.**
Three faults had accumulated in that gap, all of them invisible to twenty-two green checks, because
none of them is a crash, a missing name or a malformed row.

| | what it was |
|---|---|
| **`paper` / "Printed?"** | `questionItems` wrote `paper: true` on every item and this facet was its ONLY reader. Measured: **3,753 answered `Printed`, 17 answered `Digital`** — and those 17 were widgets, which have no such field. A literal, drawn as a choice, asked of everybody on every search. |
| **`exam_wave`** | **three spellings of one sitting.** `June 2018` from the old import, `First wave` / `Second wave` from the transcriptions. For 2018 the funnel offered both as separate answers: picking `June 2018` gave 16 questions and hid 151, with nothing on screen saying a second 2018 existed. |
| **`level` vs `stage`** | two columns, one meaning, two facets, **two different answer sets**. `A-Level` gave 135 items or 263 depending which question you were asked first — and it was spelled `Alevel`, `A-Level` and `A-Level` on one screen. |

**`paper` IS THE `cost: 0` FAULT, SECOND OCCURRENCE.** That entry is a few sections up: *"3,262 of
3,265 items answered `Free`, which made that bucket mean everything."* Both were fixed **in the
data** and neither was fixed **in the rule**, so the shape recurred — which is the whole argument
for `ACCEPTED`, for `VOCAB` and for every other list in this repo. A rule applied by hand is not a
rule.

**So the rule is written down now.** `FACET_MIN_MINORITY = 0.02`: unless at least one in fifty of
the items that can answer land somewhere other than the commonest answer, the question cannot
narrow and is skipped. **The test is on the minority, not the biggest answer**, and that distinction
is the whole of it — measured against the real library, `Subject` has Maths at 91.3% and `Level` has
GCSE at 93.9%, and both are worth asking because the 8.7% who want Physics get a real narrowing.
`Printed?` was not, because everything outside its biggest answer was 0.45% of the list.

**A share, not a count, because the list shrinks.** Nineteen-to-one across twenty items is a real
distinction between real things; the same split across four thousand is a rounding error with a
button on it. And it is **self-correcting like the coverage rule** — a question that cannot narrow
the whole library starts being offered the moment the list is small enough for its answers to
matter.

**`always: true` marks the two facets that are DOORS rather than filters**, and nothing else may
carry it. `What for` and `What kind` navigate — they take somebody from the whole app to a
department — and on this library `Learning` holds 99.5%, so the balance rule would have dropped the
app's first question on the floor. It would have been right about the arithmetic and wrong about the
job: hiding the door to the booking form because the question bank got big is the funnel getting
*worse* as you add content. Every other rule still applies to them.

**One sitting, one vocabulary.** `waveOf` already existed to collapse `2018-06-01` and `June 2018`
onto one button — its own comment says *"two ways of writing the same sitting are two DIFFERENT
buttons"* — and then a third spelling arrived that it did not handle. It resolves phase words
through the row's own `month` and `year` now, and **`seriesOf_` names the series rather than the
month**: Edexcel's 2018 summer papers sat on 24 May, 7 June and 12 June, so naming each by its own
month splits one series into `May 2018` and `June 2018`, which is two buttons for three papers every
student thinks of as one thing. Anything outside the two series keeps its own month, because a
January sitting was a real thing until 2013 and collapsing it would invent a fact.

### The series is named for its season, and it used to be named for a month

**Summer months became `June <year>` and autumn months `November <year>`**, because that is what the
boards and every past-paper site print. **Reported as a bug the day the first May paper went in**:
the card read *"Paper 1 (Non-Calculator) — May 2017"* and the filter offering it read *"June 2017"*,
so somebody scanning the Sitting list for their paper concluded it was not there. Measured, and it
is not one odd row — **every Paper 1 of every summer series sits in May and Papers 2 and 3 sit in
June**, so a third of the Edexcel library was disagreeing with its own filter.

**`Summer 2017` is true of a paper sat in May and of one sat in June, and `June 2017` is not.** It
is also the boards' own word for a series when they are not naming a month — JCQ publishes the
summer and the autumn series — so nothing is invented, and a paper arriving in a month nobody
expected still lands on the season its month belongs to rather than opening a thirteenth button.
Measured after: twelve answers, newest first, `Summer 2017` holding 100 questions across five
papers, one of which is the May one.

**Search was the other half and it was already right.** A paper's own name carries its own month, so
`may 2017` finds 34 questions and `june 2017` finds 70 — the season names the BUTTON, not the paper.

**And `check-funnel.js` rule 4 went from a shape to a list, which is the repair.** It was the regex
`^[A-Z][a-z]+ (19|20)\d{2}$` — any capitalised word and a year — so it passed the whole rename
without noticing that the funnel's sitting vocabulary had changed underneath it, and it passes
`Sumer 2017` too. It is a closed list of the fourteen series words now: same argument as `VOCAB` in
`check-library.js`, and the same fault `resource_type` sitting in `VOCAB` after the rename already
cost once. Proved by mutation — `Sumer` fires it, the real file is green.

### "On the app it's just text" — a question whose picture never came across

**Reported with a photograph of the paper beside it.** `Q-1MA1-1705-1H-4` is a square ABCD split
3 cm / *x* cm on two sides, with two dashed lines and four dimension arrows, and the app drew the
sentence *"A square ABCD is divided so that one side is made of a 3 cm piece and an x cm piece."*
That is enough to sit the question from only if you already know what the picture looked like.

**Drawn rather than photographed**, which is the rule this file already carries under `diagram`, and
it has two halves: the drawing takes the page's own ink, so it works on both palettes, offline and
at any zoom — and a photograph of an Edexcel page is their copyright where a figure redrawn from the
data printed on it is not. `diagram_by: family` carries the credit and `figCredit_` prints it.

**Not to scale, and the paper's isn't either.** *x* works out at about 0.16 cm, which drawn to scale
is a hairline nobody can label. The split is 3 : 1.3, the paper's own proportion. Q5's rectangle IS
drawn to scale, because there the shape is the question — seeing the diagonal as the hypotenuse of a
12-5-13 triangle is the method.

**Arrowheads are triangles, not `<marker>`s.** A marker needs an id, and `fillStuffPages` keeps about
five question cards in the DOM at once, so two questions carrying a diagram would put two elements
with the same id on one page and the browser would resolve both to whichever came first.

**A table is not a picture.** `Q-1MA1-1705-1H-13a` carried `figure: 'table'` and the transcription
had turned the printed table into a sentence — *"a table gives y = 9, 2¼, 1 and 9/16 for x = 1, 2, 3
and 4"* — which is four pairs a reader has to re-pair by counting along two lists. `.qsheet table`
has been in the stylesheet since before anything here could produce one.

#### Which ones are safe to draw, and the count of the rest

**Only where the row's own words determine the picture.** Sixteen questions in this one paper are in
this state and they are not one problem. *"The four sides of a 12 m by 5 m rectangle and one
diagonal"* is a drawing instruction — exactly one figure answers it. *"A scatter graph… thirteen of
the points climb steadily from about (9.5, 11.5) to (15, 20)"* is a SUMMARY of fourteen plotted
points, and a drawing made from it would be fourteen points nobody plotted, on a card carrying the
exam's authority. That is the shape this file already records twice: a renderer that printed "not
drawn yet" off the `figure` column and was wrong on ~120 questions, and a curve read by eye that
gave 50 where the pixels said 48.1.

**So `check-library.js` counts them: 485 questions across the library**, worst papers named, with
the answer-space labels (`grid-blank`, `fractions`, `boxes`, `long-method`) excluded because those
questions are complete as they stand — `figure` is two columns under one name and this is why the
rule is a count and not a refusal. Printed, not failed: it is editorial work needing the original
paper open beside you. A number is something somebody can act on; a silence is how 485 of them
accumulated unnoticed.

### An answer is labelled with the shortest form that is still unique

**Reported as "it should say paper 1 paper 2 paper 3".** What it said, six chips deep on Maths ·
GCSE · Higher · Summer 2017, was `Paper 1 (Non-Calculator) — May 2017`, `Paper 2 (Calculator) —
June 2017`, `Paper 3 (Calculator) — June 2017`.

**Every word after the number is something the person has already answered.** They chose the sitting
one question ago, so the date is the funnel reading their own chip back to them three times — and in
the spelling that caused the complaint before this one, because the chip above says `Summer 2017`
and the answers under it say May and June.

**The name is a composite and its separators say where to cut.** `Paper 1 (Non-Calculator) — May
2017` is a number, a qualifier and a date in that order, and so are
`Paper 2A: Study of religion (Christianity) — June 2017` and a venue called `St Mary's Hall
(Room 2)`. `nameForms_` cuts at the spaced em dash and at `:` or `(`, and `shortLabels_` tries the
rungs shortest-first.

**Uniqueness is the only thing that stops it, and it is measured over the answers on screen.**
Measured both ways: narrowed to maths the answers are `Paper 1`, `Paper 2`, `Paper 3`; widen to the
whole of Summer 2017 and the RS papers join them, so `Paper 1` would be two papers on one button and
the rule falls back one rung to `Paper 1 (Non-Calculator)` beside `Paper 1: Philosophy of religion
and ethics`. Same reasoning as `spellShow_` folding within the list: narrowing cannot change which
ITEMS an answer holds, only how short its label can safely be.

**A plain hyphen is not a separator**, deliberately: this library writes `A-Level` and
`Capture-recapture`, and cutting there would offer `A` as an answer. A dash that separates is spaced
and long.

**`value` is untouched, and that is the half that makes it safe.** `filterHit` matches the chip
against `facet.of(x)` through `spellKey_`, so a chip holding a shortened name would find nothing and
narrowing by paper would silently return an empty list. The row carries the full name in
`data-value` and the short one in its text — exactly how `spellShow_` already separates the two.
Measured: pressing the row labelled `Paper 1` stores `Paper 1 (Non-Calculator) — May 2017` and
returns the 31 questions the row counted.

**On every facet, not on the one that prompted it** — the `cost: 0` / `paper: true` lesson twice
recorded. A name with no separator has one form and comes back unchanged, so `Maths`, `Higher` and
`Summer 2017` are untouched by construction.

**`check-funnel.js` test 4b is the guard, and the mutation proves the rung test is load-bearing.**
Forcing the shortest rung regardless of uniqueness collapses `Trigonometry` onto
`Trigonometry (A-Level)`, and three pairs of Corbettmaths worksheets onto one another — real answers
made unreachable with nothing on screen saying so, which is the `Alevel` / `A-Level` fault with the
spelling hidden instead of shown. The real file is green.

### `exam_date` — the day the paper was sat, which nothing had ever drawn

**A series is not a date, and somebody asked for the date.** `exam_date` went into the file, passed
`check-library.js`, and **nothing read it** — a column written and never read, which is this
repository's oldest shape and already recorded here under `figure`, under `orderPrints` and under
the four message actions. `satOn_` draws it under the paper's name: *"sat Thursday 25 May 2017"*,
which is the sentence a tutor sitting down with a student actually says.

**Read by pattern and built in UTC**, never `new Date('2017-05-25')` against the machine's clock — a
paper that is Thursday in London and Wednesday in New York is the `waveOf` timezone fault in a
second column, and that one cost seven buttons.

**On one paper so far, and that is the design.** Edexcel took the exam date off the front page in
2021 and the © line narrows it to a year, so a date is a fact somebody has to know rather than
derive. An absent one draws nothing rather than guessing, and the paper's own name — which always
carries its month — goes on being the subtitle either way. `check-library.js` prints
`1 of 665`, with a denominator for the same reason `total_marks` has one.

#### The URL slug is NOT the exam date, and eight Saturdays are the proof

**41 documents carry a `source_url` with a full date in the filename** — `1MA1_1H_que_20211103.pdf`
— which reads as 41 free exam dates waiting to be copied across, and this file's own note about the
©2021 papers points straight at them. **Eight of the 41 land on a Saturday**: `P-1MA1-2306-1H` on
2023-05-20, four November Paper 2s, and both the 2022 and 2023 summer Paper 1s. Nobody sits a GCSE
on a Saturday, so that slug is a PUBLICATION date at least some of the time — and there is no way
from inside this environment to tell which of the other 33 are exam dates and which are not, because
every exam-board host is blocked by network policy. Bulk-filling from it would have put a confident
wrong day on a third of the library, and a wrong day is worse than no day: a tutor reads "sat
Thursday" and knows it was a Friday.

**The weekend is the one half a checker can settle**, and it is now a rule. The two rules that were
already there compare `exam_date` against the `year` and `month` on the same row — filled in by the
same person in the same sitting, so a date that is simply wrong agrees with both and sails past.
A Saturday needs no timetable to refuse. It cannot tell a Tuesday that is wrong from a Tuesday that
is right — only somebody holding the paper can — but it refuses the whole class of mistake that
produced those eight. Proved by mutation: `2023-05-20` on the June 2023 Higher paper exits 1.

**And nothing in the data needed correcting.** Checked across all 665 documents: **zero** rows whose
name names one month while the `month` column says another. The Edexcel Paper 1s always said May and
always carried `month: 5`; what was wrong was the button above them, and that is the rename in the
section before this one.

**`levelOf_` reads whichever of the two columns has it** — `band_value` where `band_type` is
`stage`, falling back to the `level` column — and normalises the spelling. Naming the code facet
`level` rather than `stage` is what collapses the two questions into one: `facetList` treats a
`facets` row whose field is already declared in code as a *relabel* of that facet and one whose
field is unknown as a *new* question, so renaming it moved the sheet's row from the second pile to
the first. The sheet still owns the label, the order and whether it is asked at all.

### The funnel never asked what the maths was ABOUT, and that is the whole complaint

**Six chips deep it said "Nothing left to narrow" over 193 questions.** What for · Learning, What
kind · Questions, Subject · Maths, Type · Worksheet, Key stage · KS2, School year · Year 4 — and the
193 left were about eleven different things: fractions, area, roman numerals, telling the time.

**Every question on the way down was about where the question CAME FROM.** Subject, level, type, key
stage, school year, exam board, tier, publisher. Not one about what it is OF. That is "I click the
filters and then it just feels like it shows all of them", exactly: each tap took a real bite out of
the list, and none of them took the bite that was wanted.

**The column was already there and nothing read it.** `topics` is on 91.5% of the question rows and
has reached the browser on `row` since `libraryInto_` stopped enumerating columns — see "`row`
carries the whole row" above, which was written about this same shape. `topicOf_` reads it, a
`Topic` facet sits straight after `Subject`, and the comma in a cell is a list the way `keystage`'s
is. **A worksheet transcribed tomorrow is filterable the moment its `topics` cell is filled in**,
with nothing in code to edit and no deploy.

**Nothing new decides when it is asked.** 389 distinct topics is past `FACET_MAX_ANSWERS`, so it is
not offered at the top; almost nothing outside the library carries one, so its coverage is low until
the list IS questions. Both rules that keep it out of the way are the ones that were already there.
Measured, it arrives at the point the funnel used to give up: 193 items, 15 topics, 100% coverage.

**It is in the search box too**, which it had never been. `searchText_` reads the question's own
words, so `fractions` found a question only if the word was printed in it — and on a worksheet whose
every question is a fraction, the one place that says so is the `topics` cell. Measured: `fractions`
176 → 235 hits, `surds` 40 → 55. Built onto the item, not matched per keystroke.

#### The spelling is settled by a vote, because a list would go stale and Title Case invents words

**46 of the 389 topic values differ from another only by case** — `Linear Equations` (81 rows) beside
`linear equations` (4), `Histograms` (20) beside `histograms` (13). Two buttons for one topic is the
`Alevel` / `A-Level` fault in a new column, and `check-funnel.js` fails the build on it.

**Title Case was the obvious fix and it would have been wrong.** `HCF and LCM` title-cased is
`Hcf And Lcm` — a spelling nobody typed, invented by code, printed on a button. So the library
votes: every spelling is counted and the commonest wins for all of them, which can only ever pick a
word somebody actually wrote. **Only the first letter is raised**, because `estimation` outnumbers
`Estimation` in the file and the vote alone put a lower-case button in a column of capitalised ones.

**Not fixed in the data, for the reason `levelOf_` gives**: the rows are bulk-imported and will keep
arriving both ways, so a migration is something the next import undoes — and 4,000 committed content
rows edited to make a filter work is a diff nobody can review. Proved by mutation: switching the
vote off makes `check-funnel.js` name `Simultaneous Equations` / `simultaneous equations` and eleven
more; the real file is green.

#### "Doesn't matter", under every question

**"sometimes i just know its roughly ks2".** `School year` was the only thing on the screen after
Key stage, so somebody who does not care which year had a choice between answering it wrongly and
going no further — and picking Year 4 took 1,093 questions to 193, silently throwing away nine
hundred KS2 questions that were just as relevant.

`{ any: true }` **is a filter that filters nothing**, and that is the entire mechanism: it sits in
`STUFF.filters` so `nextFacet` moves on, and `stuffFind` skips it so nothing is removed. One entry,
two behaviours, no second piece of state. It is a chip like any other, reading `any`, with the same
✕ — a question silently dropped with nothing on screen saying so is the funnel "changing its mind"
again.

**On every facet, not on the one that annoyed somebody.** Every question here was compulsory and a
person narrowing a list knows some things and not others. Writing a rule for `School year` alone is
how the `cost: 0` fault came back as `paper: true`.

#### "Only the first collection" was right about the wrong thing

`stuffQuestion` drew `coll[0]` and nothing else, and the argument was sound: `paper_id` and `name`
are the same 202 papers by two columns, so offering both is offering one thing twice with different
numbers on it. **The rule written from that threw away every other axis as well** — with `Topic` in
the list, papers group harder (227 groups against 343) and won the sort, so the screen offered "the
227 papers these are in" and never "the 343 topics".

**So the folding moved to where it belongs and is measured rather than declared**: two axes are the
same collection when they cut the list the same way — the same number of groups holding the same
numbers of things. `paper_id` and `name` match on that exactly; `Topic` and `Papers` do not. It is a
signature and not a proof, and the cost of being wrong is the old behaviour.

**And "Nothing left to narrow" was not true.** It said it over 1,093 questions with 48 topics in
them, one line under a control offering exactly those 48 topics — the funnel had run out of
QUESTIONS, which is a different claim. It says which of the two it means now.

**What it costs**: the first draw of the Find screen went 65 ms → 88 ms and a search 32 ms → 43 ms,
measured over 4,045 items. That is one extra facet walked twice per filter change, not per keystroke.

---

Continued in [part 3 of 4](031-checking-your-work-3.md).
