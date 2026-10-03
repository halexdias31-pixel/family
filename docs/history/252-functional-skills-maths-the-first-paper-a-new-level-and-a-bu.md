## Functional Skills maths: the first paper, a new Level, and a bucket rule that had no guard

**The owner's words:** "also add the funcitonal maths past papers. they are in my drive."

**What Drive holds.** I searched by title and full text for functional, Functional Skills, FS, Level 1/2,
Entry Level, PRAC and the boards (Pearson/Edexcel, City & Guilds, NCFE, Highfield, Open Awards). Two files
turned up, both uploaded on 2026-10-03, and they are one paper: Pearson Edexcel Functional Skills Mathematics
Level 2, *Practice exam paper for first teaching September 2019*, PRACL2/01. Section A is non-calculator,
16 marks (S64037A). Section B is calculator, 48 marks (S64039A). The paper is 64 marks in total. Drive has
**no mark scheme** for it and no Entry Level or Level 1 papers. The `L1` folder that came up holds something else.

**The PDFs have no text layer.** Every page is an image and the only text is the barcode. So unlike the KS1
papers, nothing here was read off a text layer. I rendered each page with PyMuPDF and transcribed it by eye.
`tools/insert-fs-maths-l2-prac1.py` asserts every answer in the arithmetic beside it, and asserts each
section's total. The three tables are typed in full (Q6, Q7, Q12). The dot diagram (Q10) is given as its counts.
The conversion graph (B Q1) and the scatter diagram (B Q3) are marked `figure`, so they land in the picture
count. For the scatter, I listed its eight points from the printed grid. Where the paper's diagram is a plain
shape (a triangle, a house-shaped pentagon, two cuboids, a circle), I described it in words and said so in
`examiner_note`.

**Without a mark scheme, the KS1 rule applies.** A computed answer gets `accept`. A graph reading, a line of
best fit, a reverse-calculation check and every "is X correct?" get a worked answer and no `accept`, so a
person marks them. Q11 accepts 2034–2036. π can come from the button or be taken as 3.14, and flowers come
in whole numbers, so all three are correct finishes. The row says so.

**Specimen paper, not Past paper. The owner should confirm this.** The cover says it is a practice paper for
first teaching. Nobody sat it in September 2019. `waveFromDoc_` already refuses a sitting to anything that is
not a past paper, and its comment says why: "a specimen is not a sitting". So these papers have no Year →
Month folders. They are reached by Questions → Maths → Specimen paper → Paper, or by Level → Functional
Skills. If the owner wants them under Past paper, change `document_type` on the 32 rows and add `month: 9`.
The month list in check-library's VOCAB would then also need `'9'`.

**The Level is new.** The band value is `Functional Skills L2`, under a new `LEVEL_BUCKET` row,
`Functional Skills`, placed between GCSE and A-Level. Entry Level and L1 are already listed in that row, so
they will fall under it when they arrive. `exam_board` is `Edexcel`, which was already in the vocabulary, so
no closed list grew.

**The fault this exposed.** Before the bucket row existed, the six Section A questions alone turned the whole
Level question into letter ranges: `A (618) | F (6) | G (4752) | K (353)`. That is `bucketLabels_`'s
"every value or none" rule doing what it is meant to do. Nothing failed, because the leak rule in check-funnel
only looks at a facet whose drawn labels belong to its own table. Once the table stood down, the rule stood down
with it. check-funnel now fails when any value cannot be placed by a written-out bucket table, and the message
names the value. I tested it by removing `Functional Skills L2` from the table: it failed for exactly that
reason, and passed again once the table was restored.

**At 320px**, the Q7 table has six columns, and the 18 column scrolls inside its own box. I shortened its
headers to `Label` and `True size` (with a colspan) so that the other five columns fit. At 390px it fits whole.
