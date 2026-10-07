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
| `english-devices.json` | `english-devices` | 180 | literary and language devices, core / extended / specialist |
| `m-and-p-formulas.json` | `M&Pformulas` | 96 | maths and physics formulae, with which boards give them and which must be learnt |
| `icons.json` | `icons` | 81 | Orthodox iconography — Christ Pantokrator, the Theotokos, feasts, by tradition |
| `graphemes.json` | `graphemes` | 72 | phonics: graphemes, their IPA, and the Letters-and-Sounds phase each is taught in |
| `practicals.json` | `practicals` | 41 | the AQA required practicals, 41 columns including feasibility and group size |
| `mat-components.json` | `_mat-components` | 17 | **an older, smaller `cheatsheet`.** The live tab has 77 rows; this has 17. Kept because it is not obviously a subset, and deciding that is editorial |
| `orth.json` | `orth` | 15 | Orthodox prayers and hymns — the Trisagion, the Lord's Prayer |
| `verbs-command.json` | `Verbs command` | 12 | exam command words — Examine, Evaluate, Analyse — and what each board means by them |
| `library-readme.json` | `_README` | 8 | the tab-colour guide that sat at the front of the spreadsheet |

## `bible.json` STAYS HERE AND IS THE SOURCE OF `data/bible/`

Asked for as *"i want to add the bible to resources as a book. but only admin can see the bible."*
The app still reads nothing in this folder: `tools/bible-split.py` reads `bible.json` and writes
`data/bible/` — one compact file per book (`{book, testament, chapters: [[verse, …], …]}`, one
chapter per line) and a 15 KB `index.json` — and that is what an admin's Find fetches, a book at a
time. The ten megabytes here stay as the source; re-run the script after any change to it.
`js/check-bible.js` compares every one of the 31,102 verses between the two, in order.

Each book's line in `index.json` carries two fields the archive does not have as columns, both
worked out by the script: **`group`** — Torah, History, Poetry & Wisdom, Major Prophets, Minor
Prophets, Gospels, Church History, Pauline Epistles, General Epistles, Prophecy (`GROUPS` in the
script says why each book is where it is) — and **`chapterVerses`**, how many verses each chapter
holds. Find asks Translation → Testament → Group → Book → Chapter → Verse, and names every verse
from those two before its book is downloaded (see docs/history/291).

The text is copied as it is. `[was]` marks the KJV's italic (supplied) words, which the reader
draws in italics, and a leading `# ` is the 1611 pilcrow, where the reader starts a paragraph.

## `topicstuff` HAS LEFT THIS FOLDER — it is `data/topics.json` now

CLAUDE.md recorded that the funnel's `Topic` facet read a free-text cell with **389 distinct
values, 46 differing only by case**, folded by a spelling vote at runtime — and that 343 of them
could land on one card. This tab was the curated answer to that question and it was sitting here
unread.

It is wired up now: `data/topics.json`, loaded by `libraryExtras_`, read by `topicAreaOf_`, and
offered as the **Topic area** facet one question before `Topic`. Measured, it resolves **4,112 of
the library's 4,257 topic cells (96.6%)** into ten areas, of which a maths question only ever sees
seven. Which is exactly what a card has room for.

**And then the question went.** The owner, 6 Oct: *"why is there a topic area menu? like im fin
with names of pdfs which are the names of the topics themselves right?"* `Topic area` is retired,
`topicAreaOf_` and the boot's fetch of the file went after it, and nothing on the phone reads the
tree now. The file stays in `data/` rather than coming back here, because three checks
(`check-practicals`, `check-projects`, `check-textbooks`) hold a hand-written topic to its labels
and aliases — a vocabulary that is read, just not by the app.

**So this folder is what is kept, not what is unusable.** A tab in here is unread today; that is
not the same as unusable, and `topicstuff` is the proof.

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
