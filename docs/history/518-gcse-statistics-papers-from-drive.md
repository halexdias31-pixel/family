# 518 — eleven AQA GCSE Statistics Foundation papers from the owner's Drive, card in git, words for the Ledger

**Asked for as** "here is the folder for statistics past paper. i want you to add it too", with a Drive folder of AQA GCSE
Statistics (8382) Foundation question papers and mark schemes. Done the way 415 and 447 added past papers.

## What the folder holds (24 files, both listing pages swept)

| Sitting | Papers | Note |
|---|---|---|
| June 2019 | Paper 2 only | no Paper 1 in the folder |
| November 2020 | 1F, 2F | the June 2020 papers, sat in November; named as the owner's files name them |
| November 2021 | 1F, 2F | the June 2021 papers; each scheme is in the folder twice |
| June 2022, June 2023, June 2024 | 1F, 2F | |

## What went in

Statistics is its own subject here, spelt as the GCSE Statistics content cards already spell it (`TB-GCSE-STATS`), so
`check-library`'s subject vocabulary gains `Statistics`. Eleven cover rows `D-P-8382-<yymm>-<n>F` (AQA, Foundation, KS4, the Drive
copy as `source_url`) and **517 question parts plus 160 shared stems, 880 marks** — each paper sums to its 80. Every answer was read
off that sitting's scheme, so every part is `verified: "True"`; **461 of 517 are Function verified** (typed values with the
scheme's alternatives and bands, `choices` for circle/tick questions, `mark_words` for every worded part). The rest are drawings
(pie charts, bar charts, cumulative frequency graphs, box plots, stem-and-leaf diagrams), which carry the scheme's answer and
`needs_print`, and a few parts with no fixed value (a reading off the candidate's own line).

Topics are the existing statistics atoms (Averages & Range, Sampling, Box Plots & Quartiles, Charts & Diagrams …), never the
Maths-only `Statistics` topic.

## Figures

The Drive connector reads a PDF's text but cannot hand over the PDF itself here, so no figure was drawn. Where the paper's own
data are in its text, or recoverable from the scheme (a Venn diagram's regions, a bar chart's frequencies, a tree's branches), they
are written into the stem as a table or a sentence. 52 stems and parts whose figure could not be recovered (a scatter diagram, a
map, a published graph, the 2022 Paper 1 Data Sheet) say so and point at the printed paper on the card.

## Card in git, words for the Ledger

The paper scripts (`tools/paperspec.py` with an AQA 8382 subclass) live outside the repository; `tools/add-past-paper.js` put the
rows in and split them, so the cards carry `lib_pending` and say Coming soon until the words are imported. The words went to
`data-private/` and to one import file of 677 items made with `drive-pack --ids`.
