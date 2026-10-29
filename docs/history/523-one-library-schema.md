# 523 — one library schema, and a gate on every row-writer (finder stabilisation P3)

**Found by** the October audit of the library (everything but the Writings): the same facts were spelt many ways across
the five card files, so the funnel split one answer into several and missed items. Questions said `key_stage`,
`exam_board` and `Alevel`; the content cards `keystage`, `board`, `KS1`, `11+`, `All`; the practicals and projects
stored ranges (`KS3–GCSE` on 10 practicals, `KS2–GCSE` on 19, `KS2–KS3` on 12 and 5 projects, `GCSE–A-level` on 2),
and `levelOf_` passed a range through whole, so 31 practicals were never found under GCSE. 1st Class Maths sheets
(2,366 rows) said Edexcel as their board; Corbettmaths 23 times. Nothing validated a row before a tool wrote it:
`tools/add-past-paper.js` copied a spec's fields straight in. `VOCAB` in check-library guarded questions.json alone.

## The owner's decisions

- O1: a range is every level it covers — separate tags, the item under each. Level is stored as a list of real levels.
- O3: worksheet makers (Corbettmaths, 1st Class Maths, Access Tuition) are a **Source**, not an exam board.
- O6: a paper cover with no questions is hidden until its questions are imported.

## What changed

- `LEVEL_TABLE` (js/find.js): each real level, its key stages and tiers, the other spellings a cell uses, and its rung.
  `levelsIn_` reads a cell (a comma list; `X–Y`, `X to Y` or `X-Y` is every rung between; `X/Y`, or a range with an end
  off the ladder like AS, is just the two), `levelsOf_` an item, `levelOf_` gives the facet
  one value or a list. `ksLevel_` (and so `ksFallback_`) reads the table too. `check/schema.js` runs the same literal
  and the same function, extracted from find.js, so there is one copy.
- `LIB_SOURCES` (js/find.js) and the `source` facet ("Source"). `boardOf_`: a maker's sheet answers no Exam board. The
  Publisher facet (`company`) is retired — it was the exam board said twice, or the maker. backend/digest.gs mirrors both
  (`DIGEST_SOURCES`); check-funnel compares every question's email tags with its card.
- `libraryInto_` (js/library.js) drops a cover none of whose questions is live: one rule, not a flag per row.
- `check/schema.js`: one column list per card file, which column holds each idea (level, key stage, tier, board, topics),
  the closed vocabularies (moved out of check-library), and `validate(row, file)` / `validateFile(rows, file)`.
- `tools/add-past-paper.js` (now `importPapers`, pure) and `tools/lib-private.js split` (`splitGate`) refuse any row
  problem the same rows did not already have — new rows strictly, old rows on what they had at HEAD — and write nothing.
- `js/check-schema.js` runs the schema over the whole library with a count per file and rule pinned at today's figure
  (21,251 in all): a count may only fall. P4 rewrites the rows and brings each pin to 0. A problem in a private field
  (the `answer` rule) of a `lib_pending` row is not counted: whether its words are here depends on the last seed or pull.
  Every rule is proved both ways on a fixture row — one change that must break it, one that must not — the two cross-row
  rules (preamble, total) through `validateFile`, so a rule switched off goes red and not merely to a lower count.

## Review fixes

- A first draft had a rule "`lib_pending` on a row whose words are here is stale". It contradicted docs/library.md (the
  marker stays on once the words arrive) and `tools/paperspec.py`, which writes `lib_pending: "True"` with the words on
  every row: the gate refused every new past paper and every new pending content card, and the pinned counts moved with
  whatever `pull` had fetched. The rule is gone; check-schema imports a brand-new paper shaped exactly as paperspec writes
  it, and splits a new pending content card with its words, and both must pass.
- `backend/digest.gs` copies `LEVEL_TABLE`/`levelsIn_` as `DIGEST_LEVELS`/`digestLevelsIn_`, so the email says `A-Level`
  for `Alevel` and `GCSE` for `KS4` as the card does; check-schema asks both copies every level cell in the library.
- Still the owner's to confirm: a KS2 range end is placed under SATs (the old `ksLevel_` mapping), so a KS2–GCSE practical
  (19 of them, and 5 projects) is found under SATs even in a subject with no SATs. 11+ is off the ladder, never in a range.

## Left for P4 (the data)

`Alevel` → `A-Level` (8,209 cells), tier `A-Level`/`AS` (7,828), GCSE rows marked KS3 or KS2 (1,255), makers' sheets
carrying a board (2,402), topics not spelt as data/topics.json (1,273), ranges (50), 130 past-paper parts with no marks,
47 calculations whose answer has no digit, one paper whose parts sum to 75 of its 80.

## P4: the data rewritten, and the counts at zero (fix-r2-data)

One-off scripts outside the repository made every change; `js/check-schema.js` now fails on any problem at all (the
pinned table and check/schema.js's `LEGACY` lists are gone), and `level` is a list column in the closed vocabulary.

- **Levels (O1).** `Alevel` → `A-Level` (8,189 question rows, 18 content cards, 2 inserts' `for_levels`); `KS1`/`KS2`
  books → `SATs`; Study Skills `All` → `KS3, GCSE, A-Level`; every range a list (43 practicals, 7 projects). A GCSE sheet a
  KS3 key stage names is `KS3, GCSE` (1,255 rows, so it is found under both, as its key stage already was). The two 1st
  Class Maths sheets whose parts carried another sheet's `KS2`/year band (similar shapes, translations) take their cover's.
  The Oxford Reading Tree `Stage 1`–`5` bands are a `grade` band, not a level (48 rows): they are found under SATs.
- **Tier.** `A-Level` and `AS` were never tiers: dropped (7,828). **Board (O3).** A maker's sheet carries no `exam_board`
  (2,402); a board's own past or specimen paper names the board as its `company` too (131 filled) — a new `board` rule.
- **Topics.** Case variants respelt to their label; 80 spellings added as aliases of the label they mean; compound tags
  (`circles and Pythagoras`) split into the two labels; 37 English Literature set texts and clusters added under a new
  area; OCR H472's essay prompts (stored as topics, split on their commas) became `Drama and Poetry pre-1900`.
- **Answer types.** 103 `calculation` parts answered by a word or a letter (`F`, `random`, `cuboid`) retyped `short`,
  `explain` or `proof`. The rule now reads algebra (`(a + b)(a − b)`, `b − a`) as maths, since the keypad types it.
- **Marks.** The 130 unmarked past-paper parts were runs: the paper prints one mark for several boxes, and the last part
  carries it with an examiner note saying so. The rule is now that: a part with no marks is fine when a later part of
  its question has the marks and its note says they are for the parts together. One part the paper gives no mark for
  alone (KS2 2019 P2 Q18a, circling the prime) is `0`. The total counts a switched-off part, which is still on the
  paper (1MA1 Nov 2019 1H Q8, 5 of its 80).
- **The fill-in standard** (the owner: the diagram is never the answer box; anything filled in is a cells table laid out
  like the paper's, printed values pre-filled and locked; labelled places as lettered boxes). A new `cells` rule: a live
  part whose words ask to complete a table, grid, Venn diagram or tree, fill in missing numbers or boxes, ask what goes in
  box (a), label a figure's parts, or match, has `cells`. 95 parts were given them, from their mark schemes: tables whose
  `(i)` placeholders became blanks in the card's own table, Venn regions and tree branches as a table of their own under
  the figure, printed probabilities filled in, and labelled boxes `(a)`, `(b)` where the boxes are printed in a stem or a
  figure. Of the library's 101 fill-in parts (with their words here), 72 hold their cells in a table on the card, 29 as
  labelled boxes. 126 rows that split one table into a part per blank were folded into their first part, which carries the
  run's marks. A matching is its items' table with a letter cell each and its options lettered in a list above it. Not
  in the rule: one missing number (the answer box does it), a label on one's own drawing (`Label the image shape C`), a
  Punnett square (a cell's marking folds case, so `rr` would pass for `RR`). check-flow renders every fill-in part in the
  library, types its own answers into its cells and wants "Correct — every cell".
- **Not done, on purpose.** "Stale `lib_pending`" (284 rows with words here) was not cleared: none of the 284 is in the
  pinned commit, so a fresh clone's seed lacks their words and clearing the marker would make lib-full call them lost
  (docs/library.md). Preambles with no question: 0 by the time this ran.
- **The Ledger.** The 95 parts' new words (html, cells, answer; accept, choices and choice_right sent as null) went as an
  import file; a machine with an older `data-private/` needs `pull` after the owner imports it, or check-schema finds
  those parts without cells.
