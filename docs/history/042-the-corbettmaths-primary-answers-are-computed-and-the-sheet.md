## The Corbettmaths primary answers are computed, and the sheet with no mark scheme is the safe case

**Asked for as the Factors sheet and it turned out to be nearly done** — 12 of its 13 questions
already carried an answer. What is actually outstanding is the rest of the primary library:
**708 Corbettmaths questions with no answer at all**, across 69 worksheets.

**Corbettmaths publishes no mark scheme for these, which everywhere else in this file is the state
that stops a transcription.** The 2017 Highers are why: four answers there were subtly wrong
*because they were derived* — a reading off a grid the algebra disagreed with, two single values
where the scheme takes a range. **What makes deriving safe here is that these questions have an
exact inverse.** `XXIV` is 24 or it is not, and `nine thousand and nine` is 9,009 or it is not. So
`tools/cbmnum.py` holds both directions of each conversion and **every answer is round-tripped
against the question's own words before it is written** — convert, convert back, compare. A wrong
answer is a shape that cannot occur rather than one to check for, which is the same move the
fraction sheets already make by keeping the sum and the words in one table.

**The converters are self-tested over their whole range** — all 3,999 Roman numerals and every
number under ten thousand — and then separately against **the sheet's own printed convention**,
which a round trip cannot see: a round trip only proves the two halves agree with each other.
`nine thousand and nine`, `two thousand, three hundred and eighty` — a comma when the part below
carries a hundreds digit, `and` when it does not. That is what is printed on the worksheet, so it
is what a child's answer is marked against.

**The explanation is computed too, not written out.** `roman(38)` and the sentence under it are
built from the same decomposition, so the numeral and "XXX is 30, V is 5, III is 3" cannot
disagree. The subtractive note names **the additive spelling a child actually writes** — `LXXXX`
for `XC`, `IIII` for `IV` — computed by running the same table with the subtractive pairs removed.
The first version invented `IIIIIIIIIX` as the slip for `IX`, which is not a mistake anybody makes;
a sentence generated confidently and wrong is worse than no sentence.

**One row asks two questions and a rule answering only the first would have reported it done.**
Question 7 of the Roman numerals sheet was transcribed with question 6's tail on it. The rule
collects every ask in the row, and a row with more than one gets no `accept` — there is one box on
screen and two answers, exactly as the multi-part Factors rows already do.

### Five rows cannot be answered, and one of them was nearly hidden by the right-sounding label

**A clock face, a matching exercise, a calculator display, and George's four wrong answers.** Each
is a question ABOUT a picture the transcription lost, so each gets a `figure` — which does not
invent the picture; it puts the row into the number `check-library.js` prints every run. **629 →
630**, read off the run.

**`working` was the obvious label for George's answers and it is on `ANSWER_SPACE`.** That list
exempts a row whose figure is somewhere to WRITE — a complete question with a blank beside it —
and George's four printed answers are the opposite: a picture the row needs and does not have.
Filed as `working` the row would have been exempted from the very count it belongs in. **`figure`
is two columns under one name**, and this is the first time a row landed on the wrong side of that
line by being labelled accurately.

**708 left, and the script says so per sheet on every run.** A pass that answered what it
understood and printed nothing about the rest would be this repository's oldest fault for the
sixth time — *I did not manage to look*, reported as *I looked and there was nothing there*.

### The worksheet PDFs are in Drive, and that changes the job from answering to repairing

**`Fraction of Amounts` had no fractions in it.** Fourteen questions reading *"Work out      of
24"* — Corbettmaths sets a fraction as stacked artwork, so the text layer holds the word "of" and
the number and nothing else. **This file already records that fault and fixed it for two sheets**;
this one was never done, and nor were `Fractions: Division`, `Multiplying Fractions`, `Top Heavy
Fractions`, `Equivalent Fractions` or `Fractions, Decimals and Percentages`. A child opening any of
them gets a question with no numbers in it, which reads as the app being broken.

**What makes it repairable is that the PDFs are in Drive** — all 71 of them, in one folder, every
one shared `anyone: reader` (checked before anything was written). So the method this file already
records applies: extract the text, find it is not there, then **render every page and read it**.

**The rows were mis-split as well as empty.** Page 2 of that PDF holds questions 1, 2 and 3 and the
transcription made it ONE row — `Work out of 24 Work out of 18 Work out of 60` — so four row ids
were never created at all. Ten rows become fourteen, and the sheet now matches the paper it is a
transcription of.

**Every answer is computed from the restored question**, so a misread numerator and a wrong answer
cannot come apart: the fraction in the `html` and the `Fraction` in the arithmetic are the same two
numbers, which is the shape the adding-fractions repair already used.

### All 69 Corbettmaths sheets had no link to themselves

**A document row's URL is the point of the row.** It is what a tutor opens to print the sheet, and
every Corbettmaths document in this library was missing it while its PDF sat in Drive, public by
link. 63 of 64 carry one now.

**The match is by name and it refuses to guess.** A Drive title is slugged, the document's own
`name` is slugged, and a row is linked only on an exact match against exactly one file; twelve real
differences are an `ALIAS` table with a reason each (`fdp`, `reverse-fractions`). **A link to the
wrong worksheet is worse than no link**, because it prints the wrong homework — so everything else
is printed rather than resolved: one sheet with no PDF, nine PDFs no sheet claims.

**Five `P-1CMP-…` sheets were deliberately left alone**, and the reason is the one this file
records about the `W-CBM-`/`W-1CM-` mix-up. Their names — `Adding Decimals`, `Area of Squares and
Rectangles`, `Volume of a Cuboid` — match Corbettmaths PDFs exactly, and their ids say `1CM`, which
is this library's prefix for **1st Class Maths**. Both publishers make a sheet on each of those
topics. Their `company` cell is empty, so nothing states which, and attributing them from a name
match is precisely how three duplicate transcriptions got in last time.
