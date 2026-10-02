## The funnel's own order was half in a spreadsheet, and four of that spreadsheet's rows named fields that no longer exist

**Reported as *"please have a look at finder to make sure its as sleek as possible. the other day i
saw that it wasnt uniform. like i saw somehthing like biology paper 1 as one category when it should
be like biology then paper 1 … also have a good flow of categories which go from each thing to the
next."*** Three asks, and the first move was to measure the funnel rather than read it — which is
where the largest finding came from.

### `check-funnel.js` HAS NEVER ONCE MEASURED THE FUNNEL THE APP DRAWS

**Its fetch stub answered `questions.json` and `practicals.json` from disk and EVERYTHING ELSE with
`check/fixture.json`.** That one line was written to fix the practicals blindness and its own note
says the shape out loud — *"every other url fell through to the fixture"* — and two more files fall
through it:

| | |
|---|---|
| `data/topics.json` | the topic tree. `topicAreaOf_` is its only reader, so `DATA.topicTree` was empty and **`Topic area` resolved to nothing on all 5,119 items** — a declared question with 13 answers and 84% coverage, invisible to every rule in the file |
| `data/settings/facets.json` | **the funnel's own labels and order** |

**So the check was green over a funnel nobody sees.** Measured with the files served, the live
funnel's order was:

```
What for · What kind · Subject · Boxers or fights · Division · Experiment or build · Key stage ·
Topic area · Exam board · Topic · Tier · Exam wave · Decade · Grade · Type · Paper code · Where ·
School year · Category · Level · Question number · Question part · What you need · Paper
```

**`Type` FOURTEENTH AND `Level` TWENTIETH**, `Exam board` before `Topic`, `Decade` after
`Exam wave` — which is "not uniform" and "the flow doesn't go from each thing to the next", exactly.
**The stub serves any `data/**.json` from disk now**, and the fixture answers only what is not a file:
a rule rather than a third line, because the one-line-per-file version needed fixing three times.

### The sheet had gone stale, and a rename moves a row from one pile to the other in silence

`facetList` sorts a `facets` row into one of two piles: a field the code declares is a RELABEL of
that question, and a field the code has never heard of is a NEW question read off the column. **A
rename moves a row from the first pile to the second with nothing anywhere saying so** — the fault
this file already records for `resource_type` in `VOCAB` and for `isEdexcelGcseMaths`, third
occurrence, in the one file that decides what every question is called.

| the row | what it did |
|---|---|
| `resourceType`, order 40, label `Type` | the column has been `document_type` since the rename. The row invented a dead question; the real `documentType` facet, having no row, fell wherever its index in the code's array landed it — **fourteenth** |
| `stage`, order 100 | renamed to `level` in code *for this exact reason* and the sheet kept the old name. **`Level` was twentieth**, after `Question number` |
| `paper`, label `Printed or digital` | the retired facet. `RETIRED_FACETS` blocked it, which is the guard working — and a row that can only ever be blocked is still a row somebody reads as live |
| `company`, label **`Paper code`** | over the answers `1st Class Maths`, `AQA`, `Edexcel`, `Corbettmaths`, `Standards & Testing Agency`. The row's own note says why it was typed — *"holds 9MA0/01 more often than a publisher; split the column when you can"* — and the column **was** split: `spec_code` has held the codes since the AQA RS papers went in |
| `examWave`, label `Exam wave` | the code says `Sitting` with a note saying nobody outside this repo says wave. The sheet overruled it back |

**AND THE NUMBERING SCHEMES COLLIDE BY CONSTRUCTION.** A code facet with no row takes
`at = (index + 1) * 10`, and the sheet's own orders ran 10 to 180 — the same range. So a code facet
at position 7 and the sheet's `tier` at 70 fought over one slot, and which won was the sort's
business. **Every facet has a row with a declared order now**, so the flow is stated in one place
instead of half-stated in two.

**`data/settings/facets.json` is an export of a tab that no longer exists** — the Settings
spreadsheet was deleted — so this is the source of truth rather than a copy of one, and the owner
still changes any label or order in it with no deploy.

### `node js/check-funnel.js` — a row naming a field nothing answers is a dead row

**Its first version asked only "does any item answer this" and named `slot` and `afford`** — two real
code facets whose subject is the shop and the wardrobe, which `check/fixture.json` has no priced rows
for. This file's own header says why that cannot be a failure: the fixture supplies everything that is
not the library, so a facet measured thin here is thin in the HARNESS.

**A CODE FACET IS NEVER A DEAD ROW.** Its `of` is a function somebody wrote and the row only relabels
it. What is dead is a row naming a field the code does not declare **and** nothing anywhere answers —
which is precisely what a rename leaves behind. **Proved by mutation**: the four stale rows put back
name `resourceType`, `stage` and `paper` and exit 1; and the run prints the funnel's whole order on
one line, so the flow is something a person reads rather than something they reconstruct.

### `qNumber` and `qPart` were described in the past tense and are two live questions

**`FACETS` said "nothing sets either field now".** `questionItems` writes
`qNumber: r.q, qPart: r.part || ''` on every question item, so `facetFromSheet_` reads both off the
item and the sheet carries a row for each. Two questions in the funnel, described as deleted — the
`.favwrap.is-fav` shape, found while auditing the order.

**THEY ARE GOOD QUESTIONS BECAUSE OF WHERE THEY SIT, and that is the whole of it.**
`FACET_NEEDS_FIRST` holds `qNumber` behind `paperId` and `qPart` behind `qNumber`, so both are only
ever asked inside ONE paper — which is what stops `Question part` offering one paper's `a, b, c`
beside another's `1, 2, 3`. Measured: 20 distinct part values across the library, 83 papers carry
parts, and the only mixing inside a paper is a letter with the roman sub-parts under it, which is what
an exam paper prints. Their rows sit at 142 and 144, immediately after `Paper`, which is where their
gating already put them.
