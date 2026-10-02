## I nearly wrote a placeholder over a correct table, because my sweep read two of the four columns

**Asked "is maths foundation paper 1 2024 summer all complete now"**, and the honest way to answer
is to measure rather than to remember — so the first move was a sweep for a row whose own words name
a thing the card does not hold. **It reported Q7 as a gap**: *"The table shows the number of hours
that Lena and Pavel worked on each of four days last week"*, four marks, and no `<table>` in `html`
or in `diagram`.

**IT IS IN `lead`, WHICH `questionCard_` DRAWS AS `.qsheet-lead`, AND MY SWEEP NEVER LOOKED AT IT.**
The table is there, correct, and checks against its own mark scheme: 6+7=13, 9+6=15, 8+5=13, 6+6=12,
which are the four daily totals the scheme prints as an alternative for the third mark. I had already
searched Drive and the source host for the paper, concluded the eight values were unrecoverable, and
was one edit from writing a `placeholder: 'True'` stand-in over the real thing — **degrading a good
row on the strength of an instrument that could not reach its subject.** The same afternoon I had
also told the owner the paper had "3 tables" and then "corrected" myself to 1; the first number was
right, and both errors are the same missing column.

**A ROW HAS FOUR COLUMNS A CARD CAN DRAW** — `html`, `lead`, `diagram` and `images` — on the row AND
on every preamble above it, because a table a paper prints over three parts belongs on the preamble,
which is where the six on that paper now live. A rule that reads two of the four reports a fault
about the two it did not read.

### `check-library.js` counts them now, and 54 were in no count at all

| | |
|---|---|
| questions naming a table their card does not hold | **96** |
| already in the picture count (`figure: 'table'`) | 37 |
| the table IS the answer space, so the row is complete | 5 |
| **recorded nowhere** | **54** |

**The 54 are the silence.** `Q-1CM-averages-from-tables-2` is five marks and reads *"The table shows
the number of bedrooms for 50 new houses being built. Number of Bedrooms Frequency (a) Find the
modal number of bedrooms"* — **the table's headers flattened into the prose and not one frequency
anywhere on the row.** No `lead`, no `diagram`, no `figure`, so neither existing count could see it.
That is the Corbettmaths fraction-sheet fault on a second publisher, and the worst five papers are
all 1st Class Maths with their PDFs in Drive, so they are repairable by the method this file already
records: extract the text, find the table is not there, then render every page and read it.

**PRINTED, NOT FAILED, AND WIDE ON PURPOSE.** Narrowing it to a table introduced as carrying data —
*"the table SHOWS"* — drops 36, and the dropped set is full of real faults: *"Complete the table of
values for y = x² − x"* with no table is as unanswerable as a missing data table, and the repair is
simply a different one (draw the blank). Left wide it also catches rows that are fine — *"Here is a
list of numbers 6 8 11 14"* prints its list in the prose, and one KS2 grammar question is about the
word "space" in *"Make space on the table for the laptop"*. Those are the price of not dropping the
other 36, and they are why this is a number somebody reads rather than a build failure — the same
argument the picture count beside it makes about `figure` being two columns under one name. Once the
54 are repaired they want an accepted-list with one written reason each, and then it can refuse.

**Proved by mutation, and the mutation is my own mistake.** With `DRAWN_COLS` cut back to `html` and
`diagram` the count goes 96 → 97, and the row it adds is **exactly `Q-1MA1-2406-1F-7`** — the one I
nearly wrote over. The real columns exonerate it.

### And the paper itself is finished

Measured off the file rather than remembered: 41 questions, **80 marks against the 80 on its cover**,
41 of 41 answered, 31 with a Check, 6 preambles carrying a shared stem onto 14 parts, 9 drawings,
3 tables, **0 questions whose picture never came across and 0 whose own words name something the card
does not hold.**

**And the ten without a Check are correctly without one, read off the rows rather than remembered** —
because the first draft of this paragraph said "an explain, a show-that, two draw-a-chart" and the
paper says otherwise. Five ask for a REASON in prose (*"Give a reason for your answer"*, *"What
mistake has Kevin made?"*, *"Does this affect your answer to part (a)?"*, *"Is your answer an
underestimate or an overestimate?"*, *"Describe fully the single transformation"*); one is a
show-that; one draws a chart; one is a comparison of two distributions; one asks where to put a pair
of brackets, which is a placement rather than a value; and one is the infinite family of lines
parallel to M. `markAnswer_` compares one value, so an `accept` on any of them would tell a child
who wrote the right thing that it was wrong — the failure this repository calls the worse of the two.
