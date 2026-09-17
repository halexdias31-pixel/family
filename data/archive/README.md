# The rest of the `Library` spreadsheet, so it can be deleted

Nothing in this app reads a single one of these files. They are here so that the `Library`
spreadsheet can be deleted without losing anything, which is the only reason they exist.

**The three tabs the app DOES use are not here.** `boxers`, `fights` and `cheatsheet` are in
`data/` beside `questions.json`, read by `libraryExtras_` in `js/library.js`. Do not move them
here, and do not wire anything to a file in this folder without moving it out first — the
distinction this folder draws is exactly "read by the app" against "kept so it is not lost".

## What is in each

| file | tab | rows | what it is |
|---|---|---|---|
| `bible.json` | `bible` | **31,102** | the complete KJV — all 66 books, and 31,102 is the canonical verse count, so it is whole |
| `p-and-r.json` | `P&R` | 273 | Philosophy & Religion concepts for A-level RS — the ontological argument, a priori, ethics. 42 columns |
| `topicstuff.json` | `topicstuff` | 269 | a maths topic TREE — 269 labels under 50 parents, with aliases. **See below** |
| `english-devices.json` | `english-devices` | 180 | literary and language devices, core / extended / specialist |
| `m-and-p-formulas.json` | `M&Pformulas` | 96 | maths and physics formulae, with which boards give them and which must be learnt |
| `icons.json` | `icons` | 81 | Orthodox iconography — Christ Pantokrator, the Theotokos, feasts, by tradition |
| `graphemes.json` | `graphemes` | 72 | phonics: graphemes, their IPA, and the Letters-and-Sounds phase each is taught in |
| `practicals.json` | `practicals` | 41 | the AQA required practicals, 41 columns including feasibility and group size |
| `mat-components.json` | `_mat-components` | 17 | **an older, smaller `cheatsheet`.** The live tab has 77 rows; this has 17. Kept because it is not obviously a subset, and deciding that is editorial |
| `orth.json` | `orth` | 15 | Orthodox prayers and hymns — the Trisagion, the Lord's Prayer |
| `verbs-command.json` | `Verbs command` | 12 | exam command words — Examine, Evaluate, Analyse — and what each board means by them |
| `library-readme.json` | `_README` | 8 | the tab-colour guide that sat at the front of the spreadsheet |

## `topicstuff` is the one with obvious live value

CLAUDE.md records that the funnel's `Topic` facet reads a free-text `topics` cell with **389
distinct values, 46 of which differ from another only by case**, folded by a spelling vote at
runtime because the rows keep arriving both ways. This tab is the curated version of that: 269
labels, a `parent_id` tree fifty deep, and an `aliases` column — which is a vote's worth of
guessing replaced by a fact somebody wrote down. Nothing reads it. Wiring it up is a real
change with a real design behind it, not a tidy-up, which is why it is written here rather
than done.

## The shape, and what was taken out

**One object per line**, the same rule `questions.json` has and for the same reason: the next
script to append by splitting on newlines. Every cell is a **string**, which is what
`data/boxers.json` already does — `libS`, `libN` and `libOn` normalise it back, so one
convention across `data/` beats a more faithful second one. That is the `r.link` /
`source_url` lesson: two spellings in two places cost seven silent reads.

**`ticks_1`, `ticks_2` and `ticks_3` are not here and must never be.** They are on the
spreadsheet's `questions` tab — 498 cells across 169 rows — and every distinct value in them
is a real person in `Ledger`. This repository is public and git history is permanent, so a
tick column arriving here is not untidy, it is a leak. `check-library.js` fails on one in any
spelling.

**The `questions` tab is not here either, and that is not an omission.** `data/questions.json`
already holds it, already stripped, and holds *more* — 4,807 rows against the spreadsheet's
3,913, because papers have been transcribed since the tab stopped being the source. Exporting
the tab over it would have been a migration backwards.
