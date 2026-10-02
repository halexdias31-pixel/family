## The six fraction sheets, and a text layer that dropped the numbers on ninety questions

**Four Corbettmaths sheets and one 1st Class Maths sheet, repaired against their own PDFs.**
`Multiplying Fractions` had **3 rows in the library and 17 questions on the paper**; `Top Heavy
Fractions Mixed Numbers` had 7 and 15; `Equivalent Fractions Simplifying Fractions` had sixteen
rows of which twelve read *"Find the missing number"* with no fraction anywhere; `Fractions,
Decimals and Percentages` had fourteen of twenty-five with no numbers in them and thirteen with no
answer; `Ordering Fractions` had twelve questions that all read *"Here are four fractions"* and
named none of them.

**Twenty-four rows were never created at all**, because Corbettmaths sets three questions to a page
and the text layer of that page reads `1. 2. 3. Write as a mixed number Write as a mixed number
Write as a mixed number` — so the transcription made the page ONE row. That is the `Fraction of
Amounts` fault again, on four more sheets, and the fix is the same: extract, find the maths is not
there, then **render every page and read it**.

### The 1st Class Maths sheet DOES put its fractions in the text layer, and reading order still loses them

**A numerator and its denominator are two separate words on two lines**, interleaved with the
question numbers — so question 1 reads `1 2 13 20 3 5 3 4 1`, which is four fractions and a
question number in an order nothing can recover. **Extracted by POSITION instead**: four fractions
on one line at four x positions, and within each position the higher word is the numerator. Same
method this file already records for the Edexcel papers whose text layer flattened the maths, and
it was then **checked against all four rendered pages before anything was written** — a mis-paired
numerator is a wrong question that still reads perfectly.

### Every answer is computed from the transcribed question, and each kind has its own inverse

| | |
|---|---|
| a product | `Fraction`, exactly — and the working shows the uncancelled form first, because that is the step the sheet is teaching |
| a mixed number | **round-tripped** back to the top-heavy fraction it came from, the move `tools/cbmnum.py` already makes for Roman numerals |
| an equivalence | the missing number is the one that makes the two fractions equal, checked back against the pair |
| an ordering | the SORT, rendered from `sorted(...)` rather than remembered, with the common denominator computed as the LCM |

**The first version of the multiplying working went straight from `30 × 1½` to "30 × 3 = 90".**
There is no 3 anywhere in that question. A working holding a number the child cannot find is worse
than no working, so a mixed number is now turned top-heavy out loud before it is used.

### Three pictures were counted rather than guessed, and the rest are declared

`Equivalent Fractions` question 16 is a shaded rectangle: its cell edges are 36 px apart over
288 × 216, which is **8 columns by 6 rows = 48 squares**, and the question itself says 14 are
shaded, so the answer is 7/24. The FDP sheet's question 15 grid is 4 across and 5 down with
fourteen shaded, and its question 14 triangle is 1 + 3 + 5 + 7 = 16 small ones. All three are
asserted rather than trusted. **Nine rows carry `figure`** so the count of pictures that never came
across went 711 → 720 rather than the prose hiding them.

### An ordering has no `accept`, and that is the fairness rule rather than a gap

`markAnswer_` compares ONE number. The answer to "write these four in order" is four fractions in
an order, so an `accept` value would tell a child who typed the right list that it was wrong —
which is the failure this file calls the worse of the two, because a student who stops trusting the
marking stops using it. The same rule already governs a row with more than one ask, and it is why
`Top Heavy` question 15 became two rows: two answer boxes on the paper, two answers, one row.

**Corbettmaths answers: 708 outstanding before this week, 517 now**, and the count is printed per
sheet on every run.
