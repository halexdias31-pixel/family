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

## P4 review fixes (fix-r2-data)

- **A fresh clone was red.** The 95 parts' new words were only in this machine's `data-private/` and the import file, and
  their cards carried no marker. A clone seeds `data-private/` from `LIB_SOURCE_COMMIT`, which holds the old words (no
  cells, `function_verified` computed False), so check-schema (86 cells problems), check-qtypes (27 flags) and the
  fill-in journey went red; importing to the Ledger does not help, since the seed reads git. Fixed the repo's way: the
  98 parts whose words changed carry `lib_pending: "True"`, and `check/lib-full.js` gains `waits(name, row)` — a pending
  row whose words here are not the fields its card's `lib_has` names (missing, or a seed older than the card). check-schema
  (private-field problems), check-qtypes (the flag) and the fill-in journey skip only such rows and print how many; with
  the words here every pending row is checked whole, which check-schema did not do before (it skipped every pending row).
  Proved in a copy of the branch with no `data-private/`: red before, green after, red again when one row loses its marker.
- **The deploy order.** `data/` goes live on push, so the owner imports `lib-import-p4-fill-in-cells.json` (now 98 items)
  in Business **before** the branch is pushed; otherwise the site serves the new cards over the old words and the 126
  folded runs show only their first blank. The import cannot delete: the 126 removed row ids stay as orphan rows in the
  Ledger's `lib_questions` (listed below) and should be deleted there by hand. Nothing reads them, so until then
  they are weight, not a fault.
- **Fill-in wording.** `Write the missing numbers/digits/words/values`, `write … in each box` / `in the boxes` and
  `… go in the boxes` now ask for cells (the singular `Write the missing number` / `in the box` is one blank, the answer
  box). Three parts newly caught got cells (KS2 2024 P2 Q25's a/b table, moved out of its `lead`; a Corbettmaths
  sequence's own table; a four-digit number's four boxes). Four are in `CELLS_EXEMPT` with a reason each: three open
  pairs (`81 and 9` or `36 and 54`; `5 and −5` either way), which cells cannot mark since each cell is marked alone, so
  they keep one box per value; and KS2 2024 P3 Q11, whose digits the transcription lost (no answer to make cells from).
- **Topic aliases were whitelisting drift.** Nothing in the app reads `aliases`, so Find showed `ratio` beside `Ratio &
  Proportion`. The 85 aliases P4 added are gone again; the 330 rows using them were respelt to the label (two where the
  alias meant something else were dropped: `parallel` on a vectors part, `Time` on the invisible-ink practical).
- **The shared-marks note** matched any `marks … all/both`, so `Allow both marks for…` passed. It now matches only the
  two shapes the library writes: `The question's N mark(s) is/are for …` and `The paper gives/prints (its) N mark(s) for
  the whole / all / both / … together / … does not divide them`.
- **`level` in LIST_COLS** looked dead (check-schema stays green without it), but check-library reads VOCAB through it
  per item: without it every `KS3, GCSE` cell is a stray. Kept, with a comment saying who reads it.

The 126 removed row ids (the stem, then its folded parts' suffixes), orphans in `lib_questions`: `Q-9MA031-2206-5` cii/ciii/civ; `Q-1MA1-2406-2H-5` aii/aiii; `Q-1MA1-2406-2H-11` aii/aiii/aiv/av; `Q-1MA1-2406-2F-24` aii/aiii; `Q-1MA1-2406-3F-13` b/c/d/e/f; `Q-STA-KS2-2024-P2-4` b; `Q-STA-KS2-2024-P2-5` b/c; `Q-STA-KS2-2024-P2-8` b; `Q-STA-KS2-2024-P2-11` b; `Q-STA-KS2-2024-P3-9` b/c; `Q-STA-KS2-2024-P3-23` b/c; `Q-STA-KS2-2025-GPS1-38` b; `Q-1CM-direct-and-inverse-proportion-9` aii/bii/cii/dii; `Q-1CM-interpreting-histograms-1` aii/aiii/aiv; `Q-1CM-similar-areas-and-volumes-6` aii; `Q-1CM-standard-form-13` bii; `Q-CBM-sequences-1` b; `Q-CBM-sequences-2` b/c; `Q-CBM-sequences-3` b; `Q-CBM-sequences-4` b; `Q-CBM-sequences-10` b; `Q-CBM-sequences-11` b; `Q-CBM-sequences-12` b; `Q-CBM-sequences-13` b; `Q-1MA1-2005-1H-12` aii/aiii/aiv/av/avi; `Q-1MA1-2006-2H-4` aii/aiii/aiv; `Q-1MA1-1905-1H-1` aii; `Q-1MA1-1905-1H-11` aii/aiii; `Q-1MA1-1906-2H-11` aii/aiii/aiv/av/avi; `Q-AQA-8461-2406-1F-012` ii; `Q-AQA-8461-2406-1F-031` ii; `Q-AQA-8462-2406-1F-043` ii; `Q-AQA-8462-2406-1F-062` ii/iii; `Q-AQA-8462-2406-2F-053` ii; `Q-AQA-8463-2406-2F-032` ii; `Q-STA-KS2-2019-P2-1` b/c; `Q-STA-KS2-2019-P2-5` b/c; `Q-STA-KS2-2019-P2-14` b/c; `Q-STA-KS2-2019-P3-5` b/c; `Q-STA-KS2-2019-P3-7` bii/biii; `Q-STA-KS2-2019-P3-11` b/c; `Q-STA-KS2-2019-P3-12` b; `Q-AQA-8461-2406-1H-072` ii; `Q-CBM-5AD-F-0601-6` aii/aiii/aiv/av/avi; `Q-CBM-5AD-F-0607-5` aii/aiii/aiv; `Q-CBM-5AD-F-0619-3` aii/aiii; `Q-CBM-5AD-F-0620-6` aii; `Q-CBM-5AD-F-0710-2` aii/aiii; `Q-CBM-5AD-F-0726-4` aii/aiii/aiv/av; `Q-CBM-5AD-F-0731-2` aii/aiii; `Q-CBM-5AD-F-0804-3` aii/aiii/aiv; `Q-CBM-5AD-F-0903-3` bii/biii/biv; `Q-CBM-5AD-F-0910-2` aii/aiii/aiv; `Q-CBM-5AD-F-1004-3` aii/aiii; `Q-CBM-5AD-F-1007-2` aii/aiii/aiv; `Q-CBM-5AD-F-1017-4` aii/aiii/aiv/av/avi/avii; `Q-CBM-5AD-F-1025-3` aii/aiii; `Q-AQA-7408-2406-3A-025` ii; `Q-STA-KS1-2026-P2-15` b/c; `Q-STA-KS1-2026-P2-20` b.
