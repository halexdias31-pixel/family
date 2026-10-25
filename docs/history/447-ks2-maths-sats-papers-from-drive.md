# 447 — nine KS2 maths SATs papers from the owner's Drive, card in git, words for the Ledger

**Asked for as** "have a look here, I need to add maths SATs papers to my finder", with a Drive folder of STA key stage 2
mathematics papers and mark schemes. Done the way 415 added the Edexcel Foundation papers.

## What the folder holds (20 files, swept to the last page)

| Year | Files | In the library before | Now |
|---|---|---|---|
| 2019 | P1, P2, P3, mark schemes | P-STA-KS2-2019-P1/P2/P3 | already there |
| 2024 | P1, P2, P3, mark schemes | P-STA-KS2-2024-P1/P2/P3 | already there |
| 2022 | P1, P2, P3, one scheme for all three | — | **added** |
| 2023 | P1, P2, P3, mark schemes | — | **added** |
| 2025 | P1, P2, P3, one scheme for all three | — | **added** |

## What went in

Nine cover rows (`D-P-STA-KS2-{2022,2023,2025}-P{1,2,3}`, month 5, the Drive copy as `source_url`) and **267 question parts
plus 17 shared stems, 330 marks** — each paper sums to its 40 or 35. Every answer was read off that year's official scheme,
so every part is `verified: "True"`, and **all 267 are Function verified**: typed values with the scheme's bands and
alternatives (a fraction by value, `rule: count 1, each eq …`; "two cards" fractions by `lowest`), `choices` for circle/tick
questions, `order` for ordering, `cells` for matching, tables and missing digits, `mark_words` for the five explanations, and
`draw_answer` for the four drawings (two reflections, a symmetry pair, a bar, a net's missing face by `inside`).

Figures are the papers' own vector line-work through `tools/pdf_figure.py`; a chart whose labels sat on its rulings (2022 P3
Q6), a 2022 grid (P2 Q25, `coord_grid`, numbers along its edges) and the 2022 P2 Q21 shapes are drawn by the script instead.
Coins (2025 P2 Q3) are said in words. `check/diagrams.js` passes on all 43; their PNG twins are in `data/diagrams/`.

**`pdf_figure.py` fix:** a filled shape made of curves came out as one sub-path per curve, so a circle or a pie sector filled
as lenses round an empty middle. A segment that starts where the last ended now continues it, after a curve as after a line.

## Card in git, words for the Ledger

The paper scripts (`tools/paperspec.py` with a KS2 subclass) live outside the repository with the PDFs; `tools/add-past-paper.js`
put the rows in and split them, so the cards carry `lib_pending` and the words went to `data-private/` and to one import file
of 284 items made with `drive-pack --ids`. Until it is imported the nine papers show in Find and say Coming soon.
