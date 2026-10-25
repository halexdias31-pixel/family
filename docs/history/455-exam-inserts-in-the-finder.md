## Exam inserts are a kind in the finder, and a tile on every paper that uses one

**Asked for as "add inserts to finder, like maths formula sheet."** Six inserts, `data/inserts.json`, written by
`tools/inserts.py` (change the script and re-run it):

| id | what | boards | checked |
|---|---|---|---|
| INS-GCSE-MATHS-F / -H | GCSE Maths formulae sheet, Foundation and Higher (2025 to 2027) | AQA, Edexcel, OCR | not yet |
| INS-GCSE-PHYSICS | GCSE Physics equation sheet (the DfE equations; H and "Physics only" marked) | AQA, Edexcel, OCR | not yet |
| INS-GCSE-PERIODIC | GCSE Chemistry periodic table (106's insert, now drawn, elements 1-57, 72-89) | AQA | yes |
| INS-ALEVEL-MATHS | A level Maths formulae booklet, main formulas | Edexcel, AQA, OCR | not yet |
| INS-ALEVEL-PHYSICS | A level Physics data and formulae, key constants and equations | AQA | not yet |

**Why a kind of its own, not a document row and not a content card.** 106 says why a `kind: 'document'` row is
invisible. A content card's `formulas` are a library private field (397), so the sheet would read "Coming soon" until an
import, and a formula list cannot draw a periodic table. An insert is a fact every candidate is handed, nothing private,
so it is public whole like an animation row, in its own file on `LIB_EXTRA`; `doGet` declares `inserts: []` so
check-payload sees the key. Its item carries the ordinary facet fields (subject, level, examBoard, tier, documentType
`Insert`) and no flag: the one rule (396) asks it like a paper.

**The paper link** is `insertsFor_`: a question whose Type is a paper and whose subject, level, tier and board are in the
insert's `for_*` lists gets an `Insert` tile beside the figure tile (`figTile_`), opening the sheet over the page. In the
fixture: 1115 Higher and 731 Foundation maths questions, 470 physics, 389 chemistry, 154 A level maths, 341 A level physics.

**Accuracy.** The board PDFs could not be fetched from the build machine (proxy). The GCSE maths list was checked
against Ofqual's 2024 decision as boards' guides and the Edexcel June 2025 exam aid state it; physics against the DfE
equation list; constants are standard three-figure values. Each sheet says "Not yet checked" until someone compares it
with the official PDF and sets `verified='True'` in the script. Our own wording and layout throughout; every sheet has
Official tiles to the board's page or PDF, and a Print tile (paper palette, `printing-insh`, as `stmt-print`).

The class prefix is `insh-` because `ins-` belongs to the insertion-sort animation (check-anims).
