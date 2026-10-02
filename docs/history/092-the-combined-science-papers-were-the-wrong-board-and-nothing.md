## The combined-science papers were the wrong board, and nothing in the data was wrong

**Asked as "can you audit the science gcse combined papers. see if i have them all nicely", and then
"did you say edexcel? its supposed to be aqa?"** Both halves of that are worth writing down, because
the audit was right and the answer to the second question is still yes.

**Seven papers carried `subject: Combined Science` and six of them had no questions at all.** The six
Edexcel 1SC0 June 2024 Higher stubs are the best-made rows in the library — spec code, paper number,
tier, the exam date off the cover, 60 marks, the kit off the cover, and a live Drive link — and
`check-library.js` lists all six at the head of its transcription queue. **The blocker is the mark
schemes**: all six question papers are in `newbatch` and there is no scheme for any of them, which is
what stops a transcription rather than merely slowing it. The 2017 Highers are the reason.

**The seventh is `P-AQA-8464P-2306-1H`, and it cannot mark.** 31 questions summing to exactly 70,
which is the paper's own total, so the structure is sound — and **not one of the 31 has an answer**.
Measured through the app: the card draws an answer box, **no Check, no mark scheme**. No `topics`, so
it cannot answer the Topic question; no `month` and no `exam_wave`, so `examWave` comes back `""` and
it cannot answer the Sitting question either. Those are the two facets the funnel narrows to a paper
through. It is one of an older June-2023 AQA batch of three — `P-AQA-8463-2306-1H` and `-2H` are
identical in shape — **116 questions with no answers between them**, none with a source PDF in Drive.

**THE BOARD WAS THE THING NOBODY HAD CHECKED.** Every other science row in this library is AQA — 8461,
8462, 8463, both tiers, and the 41 required practicals — and the six stubs are Edexcel. Read off the
cover rather than the filename, which is the rule that has now caught something three times:
*"Pearson Edexcel Level 1/Level 2 GCSE (9–1) · Friday 10 May 2024 · Paper reference 1SC0/1BH ·
Combined Science PAPER 1 · Higher Tier · The total mark for this paper is 60."* So nothing in the data
is mislabelled; the upload was the wrong qualification. **AQA 8464 Trilogy is six papers of 70 marks
numbered within each subject; Edexcel 1SC0 is six of 60 numbered straight through.** A student on one
sitting the other gets a paper that is not theirs.

### Three AQA 8464 rows, and half a series is not a set

`tools/add-aqa-8464-2406-higher.py` writes the document rows for **June 2024**, every field off the
front cover. **Four of six** at the last upload — Biology 1H and 2H, Chemistry 1H and 2H — with both
physics papers and **a mark scheme for none of them** still outstanding. So this is CLAUDE.md's own
move under *"AQA Chemistry, as two document rows and nothing else yet"*: the paper row is the part
that can be right before anything is transcribed, and it arms the 70-mark rule before there is
anything to check. The run prints how many of the six it holds rather than reporting whatever
arrived as a series, **and a row already in the file is left alone** — the papers come one upload at
a time, and a generator that rewrites what is already there is the fault
`add-aqa-english-skeletons.py` records in full.

**THE FIRST VERSION ASSERTED FRIDAY.** All three covers in front of me said Friday, so the weekday
rule said Friday — and Chemistry Paper 2H is a **Tuesday**, which broke it on the next upload. A rule
written from the instance, which is this file's own sentence about `cost: 0` and `isEdexcelGcseMaths`
for the eleventh time. The table carries **the cover's own day name** now and the date is checked
against that, which is a stronger test than a weekday rule and still refuses a weekend, because no
cover has ever named one.

**`paper` is what the cover calls it**, which is the rule `total_marks` already follows. AQA numbers
within the subject (`Chemistry Paper 1`) and Edexcel numbers straight through the six (`1SC0/1CH` is
*"PAPER 2"*), so the two boards' chemistry papers carry different numbers for one sitting. Both are
true of their own cover, which is the only thing that column can honestly mean.

### And two different papers were drawn on one button

**`Biology Paper 1 — June 2024` is a true name of an 8464/B/1H and of a 1SC0/1BH.** `paperLabels_`
appends *only what differs* — the subject, then the tier — and these two agree on **both**, so it
appended `· Higher` to each and produced **one label over two different papers**. That is the
`Alevel` / `A-Level` fault with the spelling hidden instead of shown, and it would have shipped in
the same commit as the rows that caused it.

**The board is the next rung, and each rung is now pushed only where it cuts the field.** The old
code appended the tier whenever the subject did not settle it, *whether or not the tiers differed* —
noise that still named two things. Three columns in order, each narrowing the field for the one
below. **Diffed over the whole library before it was kept: 2 labels changed of 690**, both of them
the pair that caused it, and the collision is gone.

**It earned itself again on the next upload.** `Chemistry Paper 2 — June 2024` is AQA's 8464/C/2H
*and* Edexcel's 1SC0/1CH, which the 1SC0 covers number as Paper 2 of six — same name, same subject,
same tier, second time. The count stayed at 17 rather than going to 19. And `Chemistry Paper 1` and
`Biology Paper 2` are still drawn as their bare names, because nothing else in the library shares
them: only what differs.

**`check-funnel.js` gained the count, because its existing rule cannot reach these papers.** That one
asks whether pressing a Paper answer leaves questions from one paper — measured on the ITEMS, so a
paper with no questions yet produces none and is invisible to it. 428 papers are in that state.
**Printed, not failed, and the 17 it prints are why**: thirteen are an `RS…` stub beside its own
transcription, which `check-library.js` already counts as the intended state, and four are English
Language stubs carrying no year and, on two of them, **`subject: Maths` on an English paper** — rows
to repair rather than a rule to enforce. What guards the class of fault is the rung. **Proved by
mutation**: the old rungs put back take the count 17 → 18 and name the pair.

**`paperLabels_` had to be exported to the harness**, and the guard is what said so: the first run
printed *"`paperLabels_` is not declared, so paper labels cannot be checked — not a pass"* rather
than a silent zero. A check that cannot reach its subject must say so, which is this file's oldest
sentence about its own instruments.
