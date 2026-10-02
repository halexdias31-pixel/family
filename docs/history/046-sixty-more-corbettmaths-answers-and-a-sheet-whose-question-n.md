## Sixty more Corbettmaths answers, and a sheet whose question numbers were off by one

**`Substitution`, `Think of a Number`, `Equations`, `Using Calculations`, `Inequality Signs`,
`Proportion` and `Sequences`** — 60 answers, each computed from the transcribed question and then
**checked back by putting it through the question it came from**: a substitution evaluated, a
think-of-a-number run forwards through its own steps, an equation substituted into itself, a
sequence generated. A misread number and a wrong answer cannot come apart.

**Two answers look wrong and are not, and both were verified against the PDF before being
written.** `Think of a Number` question 8 works back to **minus one**, and `Equations` question 9
comes out at **7.5** on a sheet where every other answer is a whole number. Both are exactly what
Corbettmaths prints — rendered and read, because an answer that surprises you is the one place a
silent transcription error hides. The card says so out loud: *"If you got −1 and assumed you had
gone wrong, you had not."* A child who distrusts a correct answer is the same failure as one who
distrusts the marking.

### The inequality sheet had five rows for six questions and nothing could have seen it

**The row numbers were off by one from question 2 onwards.** What the library called row 3 held
question **2** — the three four-digit comparisons — with question 3's *instruction* stuck on the
end of it, and question 3 itself, the right-or-wrong statements, **was never transcribed at all**.
Every one of those rows is valid markup with plausible content. Only the paper shows the gap, which
is the fourth sheet this week whose SHAPE was wrong rather than its content.

**And question 6's pairs were scrambled.** The paper prints two columns, `left ☐ right`, four rows
down; the transcription read the left column and then the right, so the row held eight true
expressions in an order that pairs none of them correctly — and an answer worked from that row
would have been wrong four times out of four. `2 − 3` is **minus one** and `20 − 30` is minus ten,
so the bigger-looking subtraction is the smaller number, which is the whole point of the question.

### What is NOT answered says why, per row

`Proportion` prints its recipes as artwork and `Sequences` prints its sequences as a row of boxes,
so 14 rows arrived with the question's words and none of its numbers. `cbmwrite` refuses to let a
script finish while a row is blank without a reason, so each carries a note naming what the text
layer dropped — and `Sequences` question 5 gets the most careful one, because its row runs the
sequence and the answer line together and it is **not recoverable from the row** whether the last
number printed is a term or an answer that has leaked in.

**Corbettmaths answers outstanding: 517 → 457.**

### And two more sheets whose fractions were the question

`Fractions: Division` had **twelve rows that read `÷ 3`, `÷ 2`, `÷ 5` and nothing else** — the
divisor is ordinary text and the fraction is artwork, so the text layer of every page is exactly
the divisors. `Fractions: Finding the Original Amount` lost six of its eight the same way: *"Jackson
is of Sam's age"*, *"of the children in a class have brown hair"*, where the missing word is the
fraction the whole question turns on. Both restored from the rendered pages and answered, 20 more.

**The working for a division names WHICH of the two methods the numbers allow**, because that is
the thing being taught: 9/10 ÷ 3 divides the top, and 1/3 ÷ 2 cannot, so it cuts every part in two
and multiplies the bottom. Which branch applies is decided by the numbers rather than written out.

**Corbettmaths answers outstanding: 457 → 437.**

### `Multiples`, `Square`, `Cube` and `Prime Numbers` — 27 more, every list generated

**"Write down all the square numbers between 40 and 110" is a filter over a generated list**, not
four numbers typed out, and every other answer on these four sheets is built the same way: the
squares, cubes, primes and multiples are produced and the question's own condition applied to them.
The mistake that catches is the one nobody re-reads — a list that is right except for the last
entry. It also settles the ones where the answer is *whether there is another*: 2, 7 and 31 is the
**only** set of three different primes adding to 40, and the script knows that because it looked.

**A third of the rows are not answered and each says why.** These sheets lean on sorting diagrams,
number cards and a speech bubble, none of which came across. Two notes are worth reading:

- `Square Numbers` question 15 starts with four numbers its own question never mentions — they are
  question 14's sorting cards, **leaked across the row boundary**. The note on 14 says so, which is
  the only place a reader of 15 would find out why it opens with `12 21 36 40`.
- `Cube Numbers` question 10 holds the fragment `9² + 2³ = 100`, and **81 + 8 is 89**. Whatever the
  question asked about that sum did not come with it, so answering it would mean inventing the
  question — which is the fault this file records under the scatter graph and the curve read by eye.

**Corbettmaths answers outstanding: 437 → 410.**

### `Money`, `Percentages of Amounts`, `Order of Operations` and `The Mean` — 33 more

**Everything on the money sheet is worked in PENCE and converted once at the end.** Money is where
binary floating point would be believed: 0.1 + 0.2 is not 0.3, and a price is exactly the kind of
number nobody re-checks. Nothing here is a float.

**Question 15 is solved by SEARCH rather than by cleverness.** Five coins, three of them adding to
£1.40, three to £2.40, all five to £3.60: the script enumerates every five-coin combination of real
UK coins and keeps the ones that satisfy all three. It finds exactly one — three 20p, a £1 and a £2
— which is what makes *"and it is the only answer"* a statement rather than a hope.

**And the first version GENERATED the percentage method, which produced nonsense.** *"10% of 152 is
76/5"* — a tenth of 152 is not a whole number and a `Fraction` printed itself. The value was right
and the sentence was arithmetic rather than English, which is worse than no sentence: the point of
the working is the ROUTE. The method is named per question now — *"50% is a half, and half of 152
is 76"* — and only the value is computed.

**Corbettmaths answers outstanding: 410 → 377.**

### The two decimals sheets, powers of ten, and `Parts of the Circle` — 25 more

**Every decimal goes through `Fraction`, never a float.** 4.99 + 3.45 + 4.80 is 13.24 exactly and
13.240000000000002 in binary, and a money answer is the last place anybody would notice the
difference — this library's insert scripts have already had two true assertions refused by that.

**And `Parts of the Circle` question 9 is the one worth reading**: £6 of 2p coins laid in a line.
Each coin lies on its DIAMETER, not its radius, so the answer is 7.8 m and not 3.9 — the card says
which of the two the trap is, because a student who gets 3.9 has done every step right except the
one the question is about.

**Corbettmaths answers outstanding: 377 → 352**, and what is left is now mostly genuinely blocked:
the angle, area, perimeter, coordinate and bar-chart sheets print their numbers ON the diagram, so
answering them means transcribing the pictures first.
