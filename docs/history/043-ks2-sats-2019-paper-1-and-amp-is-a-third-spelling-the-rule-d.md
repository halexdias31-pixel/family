## KS2 SATs 2019 Paper 1, and `&amp;` is a third spelling the rule did not fold

**36 questions read off the 2019 mark scheme**, not derived — the 2017 Highers are why that is the
rule. The paper is out of 40 and 32 one-mark questions plus four two-mark long multiplications and
divisions is 40, asserted before a row is written.

**Fourteen questions are artwork.** The text layer gives `16 3 3 =` for 3 cubed and
`22 13 7 − 4 7 =` for 1³⁄₇ − ⁴⁄₇ — loose digits, the failure mode this file already records four
ways. Every one was recovered by rendering its page and looking at it.

**And this one CAN be reproduced**, where an exam board's cannot. The paper's own copyright page
says it is Crown copyright under the Open Government Licence v3.0 and contains no third-party
content, which is exactly the opposite of the AQA English insert a few sections up. The licence
asks for attribution and the document row carries it.

### The check that exists to catch two spellings did not catch mine

**I wrote `Multiplying &amp; Dividing Fractions` into the insert script** — an HTML entity, in a
column that is not HTML — beside the 22 rows already saying `Multiplying & Dividing Fractions`.
Two buttons for one topic, which is the `and` against `&` fault one section up, wearing an escape.

**The rule folded `&` onto `and` and left `&amp;` alone**, so it passed. That is this repository's
own sentence about `cost: 0` and `paper: true` for the fifth time: the fault was repaired in the
data and the rule that was supposed to stop it could not see the new spelling. Entities are
unescaped before the fold now, and the insert script asserts the same thing at the other end so a
topic cannot leave a writer carrying one. **Proved by mutation in both directions.**

### Papers 2 and 3, and a backlog count that counted the wrong rows

**46 more questions, 70 more marks**, read off the same scheme. The SATs student now has two full
years — 2024 and 2019, six papers, 178 questions.

**The first pass of Paper 2 marked seventeen rows as needing a picture. Five do.** The other twelve
have their content in the row: the multiplication grid is reproduced as a `<table>`, the five
temperatures are in the prose, the cuboid's three dimensions are stated. Filing those as missing
pictures puts twelve questions nobody has to fix into the library's backlog — **which is the mirror
of a silence, and this file has only ever recorded the other direction.** A number that counts work
that does not exist stops meaning anything just as surely as a number nobody prints.

**So the rule is the one `figure` already had, applied properly**: an `ANSWER_SPACE` label is what
the column means when the paper printed somewhere to WRITE, and a counting label is for a picture
the row genuinely lacks. Five on Paper 2 — a shape to reflect, a measuring container, shopping
scales, a hexagon beside a square, a card marked with grid lines. Six on Paper 3 — a pictogram whose
symbols ARE the data, a coordinate grid with three points already on it, six triangles arranged into
a rectangle, and the labelled corners of ABDE.

**And the script prints the number `check-library.js` will count**, not "rows with a figure". Those
are different questions, and the first version printed the second while meaning the first.

**Question 21 of Paper 3 is the one worth reading twice.** The text layer gives `(25, 30) (40, 22)
A B E D C` — seven tokens with no geometry in them — and the scheme answers B = (55, 30) and
D = (55, 14). Those two facts together settle which point is which: if A is (25, 30) and C at
(40, 22) is the CENTRE, the corner opposite A is (2×40−25, 2×22−30) = (55, 14). The script asserts
it, so the reading is checked rather than assumed.
