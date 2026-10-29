# 522 — one library schema, and a gate on every row-writer (finder stabilisation P3)

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
  `levelsIn_` reads a cell (a comma list; `X–Y` is every rung between), `levelsOf_` an item, `levelOf_` gives the facet
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
  (21,549 in all): a count may only fall. P4 rewrites the rows and brings each pin to 0.

## Left for P4 (the data)

`Alevel` → `A-Level` (8,209 cells), tier `A-Level`/`AS` (7,828), GCSE rows marked KS3 or KS2 (1,255), makers' sheets
carrying a board (2,402), topics not spelt as data/topics.json (1,273), ranges (50), 130 past-paper parts with no marks,
47 calculations whose answer has no digit, 298 stale `lib_pending`, one paper whose parts sum to 75 of its 80.
