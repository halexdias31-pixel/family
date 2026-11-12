# 031-checking-your-work (part 4 of 4)

Continues [part 3](031-checking-your-work-3.md).

### The `facets` tab can now INVENT a question, not just rename one

**A facet is two things and only one of them is logic.** "What it is called, when it is asked,
whether it is asked" has been editorial for a while. "How to READ the value off a thing" is `of:`,
a function — and for **ten of the twenty-one** facets that function is literally `x => x.subject`.
Reading a named field is not logic; it is a field name.

**So a `facets` row naming a field the code has never heard of becomes a question**, with the reader
derived by `facetFromSheet_`: look on the item, then on `row` — the original spreadsheet row every
item carries. That second half is the unlock. **A column added to `venues` is filterable the same
afternoon, with no mapper edit**, because the row is already on the item. A comma in the cell is a
list, the way `keystage` already does it in code.

**No deploy needed.** `doget.gs` already passed unknown facet rows through — its comment says so —
so this is a phone change only.

Proved against the real data: three rows added at runtime gave
`answerType` (a real column no facet had ever read) **3 answers, 85% coverage, chosen as the next
question**; `nonsense` (a typo) **0%, reported, not silent**; and `name` **212 answers, refused**.

**That refusal is a new rule the sheet made necessary.** `FACET_MAX_ANSWERS = 40` — there was never
an upper bound because every facet was written by somebody looking at the data, and `field: name`
is 212 answers presented as multiple choice. The rule applies to the code's own facets too: a
question past forty answers has stopped narrowing anything, whoever wrote it. `Subject` is about
twenty and `Division` seventeen, so nothing real is near it.

**And `name` having exactly 212 answers is the collection showing through** — 212 distinct paper
names across 3,265 questions. That is the `contains` idea from the audit, visible in the data.

### And the `kinds` tab can invent a kind — which is where the hand-written part ends

**The same gap, the same three-line fix.** `kindMap_` walked `Object.keys(KINDS)` and overlaid the
sheet onto each, so a `kinds` row for a kind the code does not declare was read and thrown away.
The backend already sent those rows through.

**What makes it three lines rather than a project is that the card already fell back.**
`(kindOf_(x).card || thingCard_)(x, credits)` has always been the call — a kind with no card draws
as an ordinary thing: name, subtitle, picture, price. Proved: a `podcast` row that exists nowhere in
the code came back `group: Learning, label: Podcasts` and **drew a card**.

**The old fallback was wrong and silent.** `kindOf_` answers `{ group: 'Shop', label: 'Things' }`
for an unknown kind, so an unrouted kind did not vanish — it appeared under Shop labelled Things,
which is worse than vanishing because it looks deliberate.

**So adding a domain is now: one mapper in `stuffItems`, and rows.** That mapper is the honest
floor — something has to say "boxers live on `DATA.boxers` and a boxer is called `name`". Everything
after it is editorial.

**I dropped the source-table idea from the audit.** It would have turned an 8-line mapper into a
4-line config entry, and that is moving code rather than removing a cost. The facet and the kind
were the real costs and they are gone.

### `row` carries the whole row, because an enumeration goes stale

`libraryInto_` names 29 of `data/questions.json`'s 44 columns, so `topics` (2,918 rows),
`description`, `level`, `pages`, `source_url` and nine more reached the browser inside
`LIBRARY_ROWS` and stopped there.

**That became a fault the moment the sheet could invent a facet.** `facetFromSheet_` falls back to
`x.row[field]`, and `row` was the payload object rather than the file row — so `field: topics` found
nothing: 0% coverage, question never offered, nothing anywhere saying why. Attaching the row fixed
it in one line and `topics` came back **11 answers, 77% coverage**. It is a reference, not a copy:
`LIBRARY_ROWS` holds those rows for the life of the page anyway.

**Fifteen fields of ceremony hid one that decided a filter.** Every mapper wrote
`bandType: '', bandValue: '', keystage: '', …, paper: false` — ten identical blocks. All of it was
ceremony: `asList_` cannot tell `''` from `undefined`, so writing them and omitting them are the
same behaviour. **`cost: 0` was not ceremony.** The Price facet tests `x.cost === 0` strictly, so
every unpriced thing — a subject, a level, a link, a friend, a timer, a question — claimed to be
FREE. Measured: **3,262 of 3,265 items answered `Free`**, which made that bucket mean "everything".

`priced_` now tells an unset rate from a rate of zero, and no `cost` means no answer to the
question rather than a claim of free. `cost: 0` still means free, because a shop item priced at
nought is. **One load-bearing line among fifteen decorative ones is exactly what makes a funnel feel
arbitrary**, and the blanks are gone so the next one cannot hide the same way.

### Sixteen widgets were unsearchable and the filter looked deliberate

`stuffItems()` read `.filter(wgt => (!wgt.admin || isAdmin()) && wgt.groups)` and **the second test
was always false**. Measured: 16 widgets in `WIDGETS`, **0 carry `groups`** — the only thing that has
ever set it is `liveWidgets_` in book.js, one per session you are in. So `stuffItems()` returned
**zero** items of kind `tool` or `game`, and typing `calculator` into the search box found nothing.

**The argument for the filter was good and its premise was wrong.** It said tools and games have
columns of their own, so the funnel need not carry the plain ones — and that `Tools` and `Games`
vanish as answers "because nothing answers them". That second half is the tell: the two answers
disappearing was read as the design working, and it was the filter emptying the list.

It looked like a widget that had gone missing, because the widget was two swipes away on Tools the
whole time. What had gone missing was the search. `wgt.admin` stays — that test is real.

### A collection is a SHAPE IN THE DATA, not a row in a sheet

**What tells a paper from a subject is arithmetic.** Measured over the 3,271 question rows:

| column | distinct | rows each | what it is |
|---|---|---|---|
| `row_id` | 3,271 | 1.0 | **identifies a row** |
| `paper_id` | 202 | 16.2 | **a collection** |
| `name` | 196 | 16.7 | the same collection, by name |
| `subject` | 5 | 654 | **a category** — a question |
| `tier` | 3 | 1,090 | a category |

**And the boundary between "question" and "collection" already existed.** `FACET_MAX_ANSWERS = 40`
was added for an unrelated reason — the `facets` tab can invent a question now, and `field: name`
would have offered 212 answers as multiple choice. "Too many answers to be a question" turns out to
be the definition of a collection. One threshold, two jobs, no new number to argue about.

**Nothing is declared and nothing is stored.** No `isCollection` column, no `kind: 'paper'` row to
keep in step. A paper that gains a question is a bigger collection on the next load. The card is
derived from its members: the name they share, how many there are, and the facts they all agree on —
so a collection *cannot* disagree with its contents, which is exactly what went wrong when a paper
was a row (538 of 642 carried `active: FALSE` while their questions were live).

**One flag, and it is worth being honest about which half is automatic.** Counting tells you whether
grouping by a field is *useful*. It cannot tell you that `P-1MA1-2306-1H` is an IDENTITY and
`Higher` is a CATEGORY — both are just strings that repeat. So `collect: true` on a facet says
"this field names a thing", `nextFacet` skips it (its answers are ids, unreadable as a question) and
only `collectionAxes_` looks at it. Everything else is counted.

**The list is never both.** That was the fault the paper card died of three drawings deep.
`stuffFiltered` *replaces* rather than appends, so "2,935 questions or 176 papers" is always exactly
one of them. Measured: press the control → 176 items, `every(x => x.kind === 'group')` true; open
one → 36 questions, matching its stated count exactly; press again → 2,935 back.

**A collection comes back as an ITEM**, which is why nothing downstream changed. Same shape, same
paging, same card — `stuffPageCount`, `fillStuffPages` and `stuffPageHtml` cannot tell the
difference. `kind: 'group'` has no `KINDS` entry and needs none, because
`(kindOf_(x).card || thingCard_)` falls back. Opening one sets the same filter `facet-pick` sets,
so "show me the papers, then open one" and "narrow by paper" end in the same state with the same
removable chip.

**`n / 2`, not `< n`, and I caught that measuring.** `html` is 3,028 distinct over 3,267 rows — not
equal to the row count, so `< n` let it through as a "collection" of 1.08 questions each. A
collection whose groups average fewer than two members is the list again with a heading on every
item.

**It works on anything.** Fights collect by boxer, sessions by tutor — none of that is written down.
What is written down is the shape.

### The funnel lists QUESTIONS, and the collections are derived from them.

**Three goes at drawing a past paper card, and the card was never the problem.** A document and the
questions inside it answer the *same* facets — the paper's board, tier, year and wave are copied
onto every question row on purpose — so the list returned two kinds of thing for one search, and
each fix made it worse in a new way:

1. the paper drawn once as a cover **and** again once per question;
2. then the cover with the **whole paper printed under it**, on every card in the results list — 47
   parts and 47 answer boxes between one cover and the next;
3. then a cover you had to **open**, which is a search result you cannot read without a tap.

Every one of those was found by looking at a screenshot, and (2) shipped with a comment arguing
"the funnel has already done the narrowing a list needs, so by the time you are looking at one paper
there is nothing else on the page." The funnel is a paged **list**. Five covers on a page is
ordinary.

**So the collection is gone.** `stuffItems()` spreads `questionItems()` — one item per part, 3,265
of them — and `questionCard_` draws the whole question: reference and marks in the header row, the
paper name as the subtitle, then stem, lead, part, diagram, and the mark scheme shut underneath.

| Deleted | What it was |
|---|---|
| `allTopics`, `topicBy` | the 642 documents, built from `dropdowns.checklists` unioned with a derivation |
| `paperCard`, `paperish_` | the exam cover, and the test for whether a row earned one |
| `paperInline_`, `openPaper_`, `on('paper-read')` | attempts (2) and (3) |
| `paperBody_`, `paperRows` | the whole paper typeset end to end |
| `topicTiles_` | `Read` and `Paper` — both took the document behind the card |
| `paperText_`, `paperPages_`, `canPrint`, `paperMismatches` | document-level helpers with nothing to help |
| the `paperName` facet | "which paper", which existed to keep a paper card beside its questions |
| the checklists build in `libraryInto_` | `allTopics` was its only reader |

**Nothing that was being used is lost.** Subject, key stage, tier, exam board, year and exam wave
are all on the question rows, so the funnel narrows to a paper exactly as before and then keeps
going. `searchText_` matches each question's own words plus its stem's, which is what `paperText_`
was faking at the document level.

**`ansBox_` came back one commit later, and the reason it went is worth keeping.** It was deleted
with `paperBody_` on the argument that a textarea per question means 3,271 textareas. It does not:
`fillStuffPages` fills the pages you are near and empties the rest, so about five exist at any
moment and the whole strip holds 140 nodes — measured. **I reasoned about the DOM instead of asking
it**, which is the same mistake as `.mat-out` and the seven dead custom properties. The key is the
`row_id` now rather than paper + question + part, because a row id is unique across the library and
does not move when a paper is relabelled.

**What IS lost, and it is the print line.** You cannot print one question — a print is a whole
paper, priced per page — and no surface lists a whole paper now. `printPrice` and `laminatePrice`
remain for a basket saved before the change; nothing creates a `print` line. Selling paper again
means a surface that lists documents, deliberately, somewhere that is not the funnel.

**Measured before committing, because 3,265 items is the thing that would break it.** Typing one
common word gives 2,397 results: 213 ms to filter (memoised after), **56 ms** to insert 2,398 result
pages, **15 ms** a page turn, and 134 live nodes — `fillStuffPages` only fills the pages you are
near, which is what makes the count harmless. The old comment warning that ~3,500 sections stalled
the screen predates that lazy fill.

**The rows themselves are still in `data/questions.json`**, `kind: 'paper'`, carrying the link, the
page count and the print flag. Nothing reads them. Anything that lists documents again reads them
from there — and `source_url` on 2,073 question rows is the real PDF on the exam board's own site,
which is what a "open the original" control should point at rather than a rebuilt paper.

**`diagram` is a column and `figure` is not.** `figure` has been on the payload since it was
written and nothing has ever drawn it — it is 253 one-word labels (`venn`, `scatter`, `grid-blank`,
31 of them) saying which KIND of picture a row wants. `diagram` holds the picture, as inline SVG:
committed beside the question so the two cannot separate, where a URL is a second thing that has to
stay alive and cannot take the page's own ink. `style.css` has had `.qpaper figure svg` and the
label classes (`.lbl`, `.num`, `.axis`, `.grid`, `.pt`) since before anything could produce one.
Two rows carry a diagram — both were already inline SVG inside their `html` and were moved, or they
would draw twice.

**Do not read `figure` as "a diagram is missing here".** It is two columns under one name and the
labels do not say which: `venn`, `scatter`, `pie-chart` mean the paper had a picture nobody
transcribed; `grid-blank` (20), `fractions` (30), `boxes` (10), `long-method` (7) mean the paper had
somewhere to WRITE THE ANSWER, and those questions are complete as they stand. A first version of
the renderer printed "not drawn yet" off that column and was wrong on about 120 questions — a
screenshot caught it and no check could have. Sorting them apart is editorial work on 253 rows.

**Three columns did not come.** `ticks_1`, `ticks_2`, `ticks_3` — 529 cells holding the handles of
real people, most of them children. They are stripped at source. A tick is a fact about a PERSON and
a document; it was never library data, and if it returns it returns in `Ledger`.

#### And then the tab itself was deleted, which took eleven things with it

**The tab can only be deleted once nothing in the code names it**, and the sharp edge is
`SCHEMA`: `ensureSchema` walks it and CREATES any tab it cannot find, so an entry left behind
rebuilds an empty `questions` tab on the next `?setup=1` — a decoy with the right headers and no
rows, which is exactly the shape of the fault that hid the real resource rows in another file for
months. `SCHEMA.questions`, `TAB.questions` and `WHERE.questions` are all gone, and `documents_()`
with them. **Only `questions` left.** `cheatsheet`, `boxers` and `fights` are still tabs of
`Library` and still read by `doGet`.

**Sixteen callers, and they were deleted rather than repointed.** Five of them WROTE to a document
row — and Apps Script cannot write to a file in git, so a repointed version would read the right
data, report success, and change nothing anybody could see. That is the worst outcome available
here, and it is the one "keep it working" would have produced.

| Gone | What it was | Why it could not survive |
|---|---|---|
| `updateResource`, `editResource`, `deleteResource` | the admin relabel form, both lookups and the soft delete | wrote a cell; a relabel is a commit now |
| `toggleTopicTick` + `tickRow`/`myTicks`/`tickCount` | three passes per document, stored as handles | the columns were stripped at source — see above |
| `redeem` + `countTicks` | a printed paper for 1,000 ticks | priced in something nobody can accumulate any more |
| `orderPrints` | priced a basket of prints server-side | **nothing ever called it** — see below |
| `refreshPageCounts`, `pdfPageCount`, `driveIdFrom` | the nightly page-count sweep and its trigger | wrote `pages` on a document row |
| `printPrice`, `canPrint` (backend) | what a print costs | the phone computes it; see the loss below |
| `ensureResourceIds`, `seedPastPapers`, `seedALevelPapers`, `dropOldALevelPapers` | 120 papers and every id | CLAUDE.md already said do not seed that tab |
| `resourceInUse`, `resourceFields`, `RESOURCE_GROUPS/OPTIONS/EDITABLE` | the form and the dropdown values it offered | the form is gone; one list, two readers, both gone |

**`orderPrints` was a door with no handle on either side, and that took measuring to find out.**
It was access-listed, priced from the sheet deliberately — *a total posted by a browser is a total
the client chose* — and published in `doGet`'s feature list. No version of the app has ever posted
to it: `cart-send` in `resource.js` is `toast('Checkout is the next thing to build')`. So the
basket is untouched by all of this. It is local, it still totals, and what is missing is a
checkout, which was missing before.

**What is actually lost, and it is worth knowing before rather than during.** A price computed on
the phone is a price the client can choose. `printPrice` lives in `find.js` and `library.js` now,
reading the same two config keys off `constants.vars`, so the figure has not moved — but whatever
takes payment will have to re-price server-side, and **the page counts it would need are in a file
in git, not in a cell.** Separately: a new paper arrives with no page count and cannot be priced
for print until somebody types one in, and a `?run=rename` no longer reaches the library at all —
that is now two jobs, the sheets and a find-and-replace over `data/questions.json`.

**`RENAMEABLE` lost its `questions` entry and the note is longer than the line was.** Leaving it in
would have been worse than removing it: `renameValue` does `read(TAB[name] || name)`, an unrouted
name comes back `{ rows: [] }`, and the rename would have reported success, changed the options
list, and left every paper spelling it the old way.

**Three migration ids stay spent.** `edexcel-maths-past-papers`, `drop-empty-alevel-papers` and
`edexcel-alevel-maths-past-papers` are remembered in script properties, so a NEW job given one of
those names would be marked already-done and never run — invisibly.

**The nightly trigger is still NAMED in `installTriggers`**, in the delete list only. A project that
already installed `refreshPageCounts` needs it removed; installing it again would book a nightly run
against a function that no longer exists.

**What was checked before publishing**, because the decision is irreversible: every Library tab
scanned against the Ledger's handles (only the tick columns matched), and the 1,508 Drive links
sampled for sharing — `anyone: reader`, already public by link, and already served to anonymous
visitors by the payload. Publishing the ids exposes nothing the site did not.

**`libraryInto_` is not a second `doGet`.** It is the same two blocks, moved: the rows they read no
longer reach the backend at all, so there is one implementation. The shapes are exact down to the
key names, because `allTopics`, `paperBody_`, `paperText_` and every facet were written against them.

**The payload went 3.6 MB → 452 KB**, measured, and the file it replaces is cacheable where a
payload never is. `index.html` starts both requests in parallel; `load()` merges them before `DATA`
is wrapped, so `missingKeys()` is not told about two keys on every load.

**The fixture no longer holds `questions` or `checklists`.** `check/ui.js` serves the repo, so the
real file wins and anything a fixture said about them was overwritten a moment later — a fixture key
that silently does nothing is the fault the suite exists to catch. The library is committed data
now, so it is as fixed as the fixture ever was.

The ids are in `FILES` in `constants.gs`, and `WHERE` says which file each tab is in. The tab
colours inside each spreadsheet say the same thing a third time — green written by the app, gold
read by it, grey read by nobody — so a tab whose colour and whose file disagree is visible without
opening it.

**`WHERE` replaced two maps and a default, and the default was the bug.** It was `ELSEWHERE` for
tabs in the subjects file, `HERE` for tabs renamed in the main one, and anything in neither fell
through to `SPREADSHEET_ID`. That is fine with one main file and a trap with three: a name nobody
routed still resolved to a real file, found no tab, and came back `{ rows: [] }`. **Five tabs the
backend reads existed in no file at all** — `resources`, `herd`, `map`, `landmark_parts`,
`post_votes` — and nothing anywhere said so. They are created now, empty, with headers from
`SCHEMA`, so they read as an empty tab rather than a missing one.

`sheetFor_` returns a blank id for an unrouted name on purpose. `read()` cannot tell that from any
other empty result and does not try; `check-tabs.js` and `checkTabs()` are what tell them apart.

### There is no `resources` tab. A document is a kind of row.

The resources tab held one row per document; `questions` held the questions inside 99 of them and
already carried about twenty columns copied off the document. They were one table written twice, so
they are one table now. **`kind` says which a row is** — `paper` is the document, `part` and `stem`
are the questions in it. 3,913 rows: 3,271 questions and **642 documents**, 202 with questions under
them and 440 with none yet, which is not a gap but the backlog written down.

**`documents_()` in `core.gs` WAS the filter, in one place.** `read(TAB.resources)` appeared in
**19 places** and every one of them called that instead, otherwise unchanged — it returned `read`'s
own shape, and `setCell` writes through `t.sheet` and `row._row`, so handing back a subset of the
rows still landed a write on the row it came from. Nineteen copies of `.filter(r => r.kind ===
'paper')` would have been nineteen chances to forget it and treat a question as a document. **It is
gone now** along with all sixteen callers that were left — see the deletion table above; there is no
tab under either name for it to read. Everything below this line is the history of how the two
tables became one, which is still the shape of `data/questions.json`.

**The ticks live on the `paper` row and only there.** Everything else about a document is immutable
and copies down to its questions safely — exam board, year, link, page count, 4,963 blanks filled.
A tick was not: it is a fact about a person and a document, `toggleTopicTick` wrote one cell, and
copying those columns down would give `P-1MA1-2306-1H` 31 rows that must agree while one of them is
written. **That difference is the whole reason `kind: 'paper'` is a row rather than a convention** —
it gives a document exactly one row to be written to, which is what it had when it was a tab.

**Documents are keyed on `paper_id`, and keying them on `resource_id` was a real bug in the build.**
Two id systems meet on this tab: 29 papers have a `paper_id` that IS a `resource_id`, the rest use
the `R0001` series and match only through the URL. Keying on the resource put a covered paper's
document row under the resource's id while its questions carried `paper_id` — **93 papers ended up
with questions and no document row** to hang a link or a tick on. The questions decide the key,
because they are what points at it.

**`SCHEMA.resources` was deleted rather than left empty, on purpose.** `ensureSchema` walks `SCHEMA`
and CREATES any tab it cannot find, so an entry left behind would quietly rebuild an empty
`resources` tab on the next `?setup=1` — a decoy with the right headers and no rows, which is the
exact shape of the fault that hid the real rows in another file for months.

`doGet`'s questions push skips `kind: 'paper'`, or 642 documents arrive on the Find screen as
questions with no text, no marks and no answer. They reach the app as the checklists instead —
which went from **0 topics to 101 for a student and 642 for an admin**, having built nothing from
nothing for as long as the tab was empty.

`check-columns` caught `day` on the way through: it lived only in `SCHEMA.resources` and the
checklist still reads it. Kept as a column rather than dropped from the read — a past paper is often
a month and a year with no day at all.

**It did NOT catch `link`, and that is a gap in the check rather than bad luck.** The resources tab
called the URL `link` and the questions tab calls it `source_url`. Folding the two left **seven**
reads of `r.link` on rows that no longer have one — the checklist push in `doget.gs`, the page
counter in `content.gs`, five places in `setup.gs`. Every checklist topic would have arrived with no
link on it, which is the entire point of a resource, and nothing would have thrown.

`check-columns.js` compares every `r.<name>` against the **union of every tab's columns**, not
against the columns of the tab that row came from. `venues` and `trips` both have a `link`, so
`r.link` is a known column somewhere and the check was satisfied. The seven now read `source_url` —
one tab, one name for the URL.

### `node js/check-rows.js` — the same question, asked of one tab at a time

Built because of those seven. It parses the `.gs` files with acorn instead of matching them, binds
each row identifier back to the `read(TAB.x)` it came from (and to `documents_()`, while that
existed), and checks every
`r.<name>` against **that** tab. Both checks are worth running: **the union catches a column NO tab
has; this catches a column the WRONG tab has**, and the second is the commoner fault.

**The first thing it found was a live bug nothing else could see.** `avatarCatalogue()` in
`people.gs` read `r.price` off a **shop** row. The shop tab prices in three currencies —
`price_pence`, `price_ticks`, `price_coins` — and has never had a bare `price`, so `N(r.price)` was
`N(undefined)`, which is 0, on every row. **Every avatar item arrived costing nothing and flagged
`free`, including the seven that carry a `price_coins` of 15, 20 or 30.** Paid items, given away,
silently. `check-columns` was right not to report it: `price` IS a column — on `resources`, where it
means something else entirely.

**Scope is what makes it trustworthy, and the first version did not have it.** One binding map per
FILE reported **95 findings, nearly all wrong**: `dopost.gs` binds `r` to a `family` row in one
handler and a `people` row in the next, so the first binding was still standing when the second was
walked. Two fixes took it to 2, and both of those were real:

- **A scope chain**, pushed per function, so a binding made inside one dies with it.
- **A declaration always writes a binding, even when the right-hand side is unrecognised.**
  `const r = findPerson(…)` does not make `r` a row of anything — but leaving no entry lets the
  lookup walk outwards and answer with the handler above's row. "Nearest declaration made it
  something I do not recognise" is an answer, not an absence.

That second one is the subtle half and it is the difference between a check and a noise generator:
95 findings with 2 real ones in them is worse than no check at all, because the seven `r.link` reads
would have been sitting in that list indistinguishable from the rest. What it cannot trace — a row
arriving as a function argument — it does not report, and the summary says how many rows it managed
to trace (210) and how many reads it checked (888) rather than implying it looked at everything.

**How it was found, which is the part worth keeping.**
A fifth spreadsheet called "full pdf datbase" — set aside as "trash, disregard it" — turned out to
be the resources tab: 27 columns that are this tab's columns almost exactly, and **every one of the
166 `resource_id`s that `ticks` points at is in it**, with no orphans left over. The checklist
builder in `doget.gs` walks `TAB.resources` to build `dropdowns.checklists`, so it had been
producing nought checklists from nought rows for as long as the tab has been empty.

Three of its columns were new and are now on `questions`: `description` (a paragraph under the
`name`), `level` (GCSE / AS / Alevel — **not** `level_required`, which `doget.gs` reads with `N()`
as a membership NUMBER, and merging the two would have read "GCSE" as 0 and shown a paywalled paper
to everybody), and `paper` (which paper of the set — 1, 2 or 3). One column was dropped: `html`,
empty on all 559 rows.

**`resource_id` on a question was the join, and it was already there unseen.** Every one of the 99
distinct `source_url`s on the questions tab is also a `link` in that file; no link points at two
documents and no paper resolves to two of them. 1,745 of 3,271 question rows resolve, 102 of 202
papers — which is what made folding the two tables together an observation rather than a guess.

**538 of the 559 rows came across with `active` FALSE**, and `doget.gs` does `if (!live &&
!viewerIsAdmin) return;`. The 21 that are true are the most recently added, so this reads as a stale
default rather than a decision — but it is data, not a bug, and flipping it is editorial. A student
currently sees 101 documents (those 21, plus the 80 papers whose questions are live) against an
admin's 642.

Also empty, in case any are meant not to be: `kinds`, `widgets`, `laws`, `rooms`, `trips`, `orders`,
`invites`, `messages`, `exams`.

**`shop` was never broken, and I said it was.** There is a `HERE` map — now folded into `WHERE` as
`alsoTry` — that resolved `shop` to the tab actually called `items&shop`. I checked `TAB` and
`ELSEWHERE`, found no `shop` tab, and reported 62 rows of stock as unreachable. They were always
reachable. **A resolution path has three maps in it and reading two of them is not reading it**;
`check-tabs.js` exists partly so that this question is answered by something that reads all of them.

### SCHEMA against the LIVE SHEET is a third question, and it found two things

`check-columns` asks "is this a column of any tab". `check-rows` asks "is it a column of THIS tab",
against `SCHEMA`. Neither can ask the one that matters most: **is it a column of the actual
spreadsheet**. `SCHEMA` is the code's belief about a tab and the tab is the thing that is true —
this file already says so about `SCHEMA.questions`, and it happened twice more.

**`landmarks` is broken and has been.** The code reads `r.width_m` (×4), `r.depth_m` (×4),
`r.height_m` (×3), `r.colour` (×6), `r.shape` (×2), `r.landmark_id` (×2) and `r.roof` — **not one
of those is a column of the sheet.** The tab has `w`, `d`, `height`, `wall_colour`, `roof_colour`,
`id`, `form` and `roof_shape`, and the code reads none of them except `id`. So every landmark
arrives with width 0, depth 0, height 0 and no colour. Both checks pass, because `SCHEMA.landmarks`
faithfully describes a tab that does not exist. **The sheet is right and the schema is the thing to
change** — 22 reads and one schema entry, not a spreadsheet edit.

**`terms` is two different tabs sharing a name, and it degrades quietly rather than breaking.**
`SCHEMA.terms` describes SCHOOL terms — `term_name`, `start_date`, `end_date`, `last_sunday`. The
tab in Settings holds LEGAL documents — `docid`, `audience`, `version`, `mustsign`. I first read
this as the booking calendar being empty. **It is not**: `termsFor(y)` COMPUTES the year's terms and
uses the tab only to override them, `have[norm(c.name)] || c`. With the wrong tab `have` is empty
and every term falls back to its computed default, which is why nobody has noticed. What is lost is
the ability to correct a term's dates by hand.

**So do not run `?setup=1` against `terms` without thinking.** `ensureSchema` only ever ADDS, which
is normally what makes it safe — here it would add nine school-term columns to a legal-documents
tab and leave something that is neither.

Smaller, and all the same shape: `facts` is missing `sort_order` and `notes`; `jobs`, `boxers` and
`links` carry columns (`tutor_a_status`, `client_1`, `image_credit`, `visibility`) that `SCHEMA` has
never heard of. The last kind is harmless — the sheet knowing more than the code costs nothing.

**`SCHEMA.questions` was ten columns behind the real tab** — `source_url`, `pages`, `price`,
`currency`, `level_required`, `trackable`, `printable`, `pages_checked`, `company`, `topics`, all
present in the sheet with values in them. Two things fell out of that. `company` is read by
`allTopics` to build the `Company` facet and `doGet` was never sending it, so every worksheet in the
library looked like it came from nowhere; it sends it now. And `topics` is a column I asserted did
not exist while writing something else — **the schema in the code is a description of the tab, and
the tab is the thing that is true.**

**`backend/people.gs` declared `childrenOf` twice and it is fixed.** Line 248 took a person row and
returned NAMES; line 282 took a parent id and returned ROWS; the second silently won. The two
callers wanted different halves — `doget.gs` passed an id, `dopost.gs` passed a row — so
`out.kids` had been an empty list for every parent on every sign-in, for as long as both existed.
Nothing failed and nothing said so. The row version is `childNamesOf` now, named for what it returns
rather than what it takes, because two functions one letter apart would be the same trap with a
longer fuse.

**Six actions identified a person by their display name alone**, and `node js/check-post.js` is the
instrument. `findPerson(nameOrId, altId)` prefers the id and falls back to matching the NAME — the
fallback is right, it is what finds a row typed into the sheet before anybody has an id, and it is
why leaving the id out is invisible: everything works, for one person, until two share a name or
somebody renames themselves. `addPost`, `changePin`, `reactPost`, `saveScore`, `toggleTopicTick`
(since removed) and
`votePoll` all had `USER.personId` to hand and were not sending it. `changePin` was the sharp one:
the PIN you typed is checked against the OTHER person's, and you are told "That is not your current
PIN" — confidently wrong about the one thing you are certain of, with no way to change yours. Not a
way in, since the current PIN is still required; a denial rather than a breach.

The check asks **one** question it can be certain about: a handler that reads `body.personId` must
be sent one. A first version compared every posted key against every `body.x` in both directions,
the way `check-payload.js` does for `DATA`, and found twenty "read but never sent" of which most
were fine — a POST field is usually optional and the handler copes. A report that is mostly noise is
a report nobody reads.

`node js/check-backend.js` is the instrument for the scope, and it is the backend's `check.js`:
Apps Script loads
every `.gs` into one scope exactly as the browser concatenates `js/`, so a name declared twice is a
name declared once and the loader decides which. A redeclared `function` is quietly wrong; a
redeclared top-level `const` is a SyntaxError that takes the whole project down at load, so the two
are reported apart. 164 functions and 90 values, each declared once.

---
