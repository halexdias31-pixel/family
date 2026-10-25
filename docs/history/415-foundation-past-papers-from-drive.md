# 415 — eight Edexcel Foundation past papers from the owner's Drive, card in git, words for the Ledger

**Asked for as** "finish adding maths past papers", from the owner's Drive folder of Edexcel 1MA1 question papers (QP) and
mark schemes (MS). The library had every Higher paper those files hold already; the Foundation papers of the same sittings
were cover rows with no questions (inactive placeholders `D-RS1786302107764-4xx`).

## What the folder holds

Read through the Drive connector (the listing pages repeat, so the folder was swept by creation time and by name) and
identified by each PDF's own cover — paper reference and date — not by its file name.

| Files | What they are | In the library before | Now |
|---|---|---|---|
| `1MA1_{1,2,3}{F,H}_{QP,MS}.pdf` and `(1)`, `(2)` | November 2017, all six papers and schemes (P49347A, P49360A, P49386A; P49308A…) | H: P-1MA1-1711-1H/2H/3H; F: empty covers | **1F, 2F, 3F added** |
| the same names `(3)`, `(5)`, `(7)` | June 2018 (sat 24 May – 12 June; P48527A, P48863A, P48862A; P48861A…) | H: 1805-1H, 1806-2H/3H; F: empty covers | **1F, 2F, 3F added** |
| the same names `(4)`, `(6)`, `(8)` | June 2017 (P48134A, P48855A, P50548A; P48147A…) | H all three; F: Paper 1 only (RS-481) | **2F, 3F added** |
| `1MA1_1H_que_20201104.pdf` | the May 2020 1H paper (P62277RA), sat in November 2020 | P-1MA1-2005-1H | duplicate |
| `GCE.pdf` ×3 (different sizes) | November 2020 mark schemes for 1H, 2H, 3H | — | not used (see below) |
| `P5…_GCSE_Maths_1MA1_{1,2,3}H_Jun19.pdf`, `Microsoft Word - 1MA1_*H_msc_20190822.pdf` | June 2019 Higher papers and schemes | 1905-1H, 1906-2H/3H | duplicate |
| `GCSE-9-1-Maths-Specimen-Papers-Set-2.pdf` ×3, `GCSE-Mathematics-2015-SAM.pdf` ×3 | Edexcel specimen sets, six papers each with schemes | — | left |
| `1GK0_*`, `Question paper_ … ALevel.pdf`, `6592883.pdf` (65 MB) | not GCSE Maths | — | not ours |

Each of the 18 QP/MS pairs is stored three times (base name and the `(n)` copies, byte-identical by size).

## What went in

**315 question parts and 38 shared stems over 8 papers, 640 marks**, every paper summing to its 80. Every part's answer
was read off its official scheme, so every part is `verified: "True"` (Accuracy verified, 388); **314 of 315 are
Function verified** — machine-marked with a complete protocol. The one not: June 2018 2F Q4, "a 6-digit number with 4
as its thousands digit and no other 4", which no `rule:` test can state yet.

The parts each paper shares with its Higher paper (the last third of a Foundation paper is the first third of the
Higher) take the Higher row's words, figure and drawn-answer geometry, so a shared figure is one drawing and one PNG twin;
their answers are rewritten from the Foundation scheme, which marks them its own way.

- **Typed answers** carry the scheme's bands (a reading off a graph `2.5 to 2.7`, a measured length `67.6 to 70.8`) and
  its alternatives; a pair of graph readings that the marker sorts before comparing is the nine pairs from the two bands.
- **Worded answers** (explain, show that, prove) carry `mark_words`, a point a mark, each proved by check-marking against
  the scheme's own answer.
- **Tables to fill** (two-way tables, frequency trees, a table of values, a stem and leaf with its key, a pictogram's
  key and counts, the Venn diagram) are `cells`.
- **Drawings** carry `draw_answer`: graphs and lines by their points, pie charts by their sector angles (in the figure's
  viewBox), a rotation and a rectangle by their corners, a bar by its edges, a construction's point by where the
  bisector meets the arc.
- **Measuring on a screen.** Three questions are measured on the paper (the tennis court at 1 : 200, the island map, the
  points 2.5 cm apart). A screen has no centimetres, so each figure has a centimetre ruler drawn under it at the figure's
  own scale, as 2406 2F Q7a did; angles survive scaling, so a protractor reads the bearing.

## How the figures were drawn — `tools/pdf_figure.py`

Every figure on these papers is vector line-work, so it is taken from the PDF itself (`page.get_drawings`, with each
path's clip — a hatched bar is lines clipped to the bar), scaled to the library's one width (`svgplot.W`), strokes in
`currentColor`, thin rulings as `.grid`, labels as `.num` / `.lbl` text with the anchor inline. Edexcel's 2017–18 papers
set some words and numbers in a font whose codes sit 29 below the characters, a degree sign as `q` and a minus as `í`;
`unshift` and `degrees` put them back. A label is 13px on a phone, larger than the paper's own type, so where the paper
sets a label in a gap the type no longer fits, the figure says so (`nudge`, `font`, a key moved under its chart with
`moves`); check/diagrams.js measured every new drawing, and every one passes.

## Card in git, words for the Ledger — `lib_pending`

The words are private (397): the paper scripts that hold them live beside the PDFs, outside the repository, and write a
rows file; `tools/add-past-paper.js` puts a paper's rows in after its cover row, brings the cover up to the paper (name,
month — Paper 1 of a summer series sits under May, as the Higher papers do — date, `active`), and splits them, so
`data/questions.json` gains cards and `data-private/` the words. The new cards carry `lib_pending: "True"`, which
docs/library.md now describes: `check/lib-full.js` lets a fresh clone (seeded from the pinned commit, older than these
rows) keep them as cards, `check-qtypes` does not hold a wordless pending card's `function_verified` to its missing
words, and a pending card whose words the Ledger has not got says **Coming soon.** The same mechanism is being added for
the A-level book (`fix-anim-alevel`); the two are written to merge.

The words go to the Ledger as one import file, `{version: 1, files: {questions: [{id, …}]}, cards: {questions: […]}}`,
for the Drive import (407) — 353 items. Until it is imported, the eight papers appear in Find with their tags and say
Coming soon.

## Left

- **The two specimen sets** (Set 2 and the 2015 SAM, twelve papers with schemes) — "Specimen paper" is a document type the
  library already has; the PDFs are whole booklets and would need cutting by page.
- **November 2020 Higher schemes** (`GCE.pdf`): their papers are the May/June 2020 rows already in the library, which
  were not marked `verified`; reading them against these schemes would make three more papers Accuracy verified.
- June 2018 2F Q4, above.
