# 439 — the maths folder finished: both specimen sets, the November 2020 schemes, 2F Q4, the last diagram runs

**Asked for as** finishing the owner's Drive folder of Edexcel 1MA1 papers after 415, which left four things: the two
specimen booklets, the November 2020 Higher schemes (`GCE.pdf`), June 2018 2F Q4 (no marking rule could state it), and
nine drawings that never got a clean run of check/diagrams.js.

## The specimen sets — twelve papers, 436 parts, 960 marks

`GCSE-9-1-Maths-Specimen-Papers-Set-2.pdf` (September 2015) and `GCSE-Mathematics-2015-SAM.pdf` (issue 2, June 2015)
are whole booklets: for each paper its question paper, then its scheme. They were cut by page at each cover ("Paper
Reference … Tier") and at the scheme's first page ("Paper 1MA1: 1F"), so every figure is taken from a paper whose page
numbers are its own. Neither set was in the library, so each paper got a cover row (`D-P-1MA1-SAM-1F` …
`D-P-1MA1-SP2-3H`, document type **Specimen paper**, year 2015, its own `S…A` reference as `source_id`, 80 marks).
They have no `month` and no `exam_wave` (check-library's closed vocabulary has no September, and a specimen was never
sat) and no `source_url`: all six papers of a set are one PDF, and check-library rightly calls six papers sharing one
file "one document transcribed six times".

| Paper | Parts | Stems | Marks | Drawings |
|---|---|---|---|---|
| SAM 1F / 2F / 3F | 37 / 36 / 40 | 4 / 2 / 7 | 80 each | 10 / 9 / 8 |
| SAM 1H / 2H / 3H | 31 / 30 / 34 | 5 / 5 / 5 | 80 each | 8 / 10 / 6 |
| Set 2 1F / 2F / 3F | 40 / 46 / 44 | 4 / 7 / 8 | 80 each | 5 / 9 / 11 |
| Set 2 1H / 2H / 3H | 29 / 38 / 31 | 1 / 6 / 4 | 80 each | 6 / 12 / 11 |

As in 415: the words are private and live in the scratchpad scripts (one per paper number, writing the Foundation and
Higher papers together); the questions the two tiers share (Foundation 21–28 are Higher 1–8, and so on) are written
once and take the Higher paper's figure, so a shared drawing is one drawing and one PNG twin. Every answer was read off
the paper's own scheme (**435 of 436 Accuracy verified**) and **all 436 are Function verified**. The one not verified:
SAM 2F Q1 ("the value of the 3 in 4376", 300) — this issue's scheme prints 6.66 there, the answer to an older first
question. Two more places the schemes are wrong and the rows say so: SAM 2H Q19(b) gives the top of −f(x) + 3 as
(−2, 2) where the curve's lowest point is (−2, 0), so (−2, 3); and SAM 2H Q21(a) prints 130 above an A1 for 22.5 to 22.6
(the area is 22.55).

What the screen needed that the paper did not: SAM 1H Q14's box-plot grid and SAM 2F Q12's kilometres axis have no
numbers, so each got a scale (`add` labels) and says so; the map in SAM 2F Q15 has a centimetre ruler at its own scale
(415's); sketches and tables to complete became cells where 366 did the same (a solid's dimensions, the possibility
space, two weights); "describe your layout" for the carpet-tile sketch. Figure clips now warn when they cut a path
(figure() drops a path it does not wholly hold — Set 2's grids run their rulings out to the axis arrows) and when a
short label sits just outside them (a lost `Z`, `b`, axis titles).

## Marking rules added to find.js (`markRule_`, `SHAPE`)

- **`digits ##4###`** — each number a whole number whose digits fit the pattern (`#` any digit, no leading 0) — and
  **`once D`** — that digit exactly once. June 2018 2F Q4 is now `564000 | rule: count 1, digits ##4###, once 4`, so
  415's last unmarked part is Function verified. A thousands space (104 567) is one number (markNorm_ already joins it).
- **`lowest`** — written as a fraction in its lowest terms. A simplest-form question whose accept was a bare fraction
  marked 75/1000 right by value (check-library refuses that row); with `lowest`, like `mixed` and `decimal`, a written
  way counts only as written.
- **`parallelogram`** in the polygon shapes — both pairs of opposite sides parallel (Set 2 3F Q4). The example drawer (`example`) has no polygon branch, so that row carries its own `eg`; so does Set 2 3H Q14(a), whose blank grid read at its major squares scaled the made-up histogram off the grid.

check-marking holds each with right and wrong cases. Every `rule:` keeps a plain worked example in front of it, as
check-marking requires.

## November 2020 Higher schemes against the 2020 Higher rows

The three `GCE.pdf` files are the November 2020 schemes for the papers the library holds as May/June 2020
(P-1MA1-2005-1H, 2006-2H, 2006-3H). Read row by row:

- **1H Q19**: the stem had f(x) = 12/x; the paper prints 12/√x. With the root restored gf(9) = g(4) = **27**, not 11.
- **3H Q16(a)**: the scheme's answer is a band, 129 to 160; the row accepted four values only.
- **2H Q12(a)** (−0.1 to −0.08, as a rule, since check-marking reads a band with a negative end as an expression),
  2H Q5, 7, 8b, 13, 14, 19 and 3H Q9, 18 took the scheme's bands; 2H Q1a its 2 × 2 × 3 × 7; 1H Q12c and 2H Q3 the
  scheme's alternative figures in their mark words.

Every other answer agreed, and all 105 parts are now `verified: "True"`.

## The nine drawings

check/diagrams.js measured the whole library under `NODE_OPTIONS=--max-old-space-size=1200`, the nine 415 could not
(1805-1F-9a, 9b, 1806-2F-12, 1806-3F-21, 1711-1F-6, 8, 1711-3F-24, 1706-2F-19, 1706-1F-14a) among them: no collisions.
With the specimen drawings in, 23 drawings touched a line at first (labels set in a gap the 13px type outgrew, two zeros
at an origin); after nudges, skips and an 11px face on four crowded grids every drawing passes.

## Running the PNG tool

`tools/diagram_png.js` reads `data/*.json`, which since 397 holds cards without words: run on its own it found no
drawings and removed all 1410 twins. It must run between `lib-private.js join` and `split`, as CLAUDE.md says for any
row-reading tool; that way it drew the 86 new twins.

## Into the Ledger

`import-papers-finish.json` (`drive-pack --ids`) carries the 506 specimen rows, June 2018 2F Q4 and the 105 changed 2020
rows for the Drive import (407). Until it is imported the specimen papers show in Find with their tags and say Coming
soon.
