# 421 — the KS2 Maths book, written out (2026-10-24)

**Asked for as:** complete the KS2 Maths book (`TB-KS2-MATHS`) to cover the KS2 SATs curriculum, each chapter its key
words, points, formulas and worked examples, topics spelled as the library spells them; no animations (409 has them).

### What there was

One chapter, *How many fit? Dividing by measuring* (349), and its drawing `fit`. 409 drew thirteen more KS2 pictures and
had to hang all but long division on GCSE Maths chapters, because no KS2 chapter had a word for them to be about.

### What there is: chapters 2–19

Chapter 1 keeps its number: its words are in the Ledger as `TB-KS2-MATHS#1`, and renumbering would orphan them. The
new chapters follow it in teaching order:

| ch | title | topics |
|---|---|---|
| 2 | Place value and rounding | Place Value & Ordering, Rounding, Reading & Writing Numbers |
| 3 | Negative numbers | Negative Numbers |
| 4 | Adding and subtracting | Addition, Subtraction |
| 5 | Multiplying and dividing: factors, primes and powers | Multiplication, Division, Factors & Multiples, Primes & Prime Factorisation, Squares & Square Roots, Cubes & Cube Roots, Order of Operations |
| 6 | Long multiplication and long division | Long Multiplication, Long Division |
| 7 | Fractions: equivalent, simplest and in order | Equivalent & Simplifying Fractions, Ordering Fractions, Mixed Numbers |
| 8 | Adding, subtracting and multiplying fractions | Adding & Subtracting Fractions, Multiplying & Dividing Fractions, Fractions of an Amount |
| 9 | Decimals | Calculating with Decimals, Ordering Decimals, Decimals |
| 10 | Percentages | Percentage of an Amount, Fraction Decimal Percentage Conversion, Percentages |
| 11 | Ratio and proportion | Ratio Problems, Sharing in a Ratio, Direct Proportion, Scale Drawings & Maps |
| 12 | Algebra: missing numbers, formulae and sequences | Substitution, Linear Equations, Term-to-Term Rules, Function Machines, Formulae |
| 13 | Measurement: units, time and money | Units & Measures |
| 14 | Perimeter, area and volume | Perimeter, Area of 2-D Shapes, Compound Shapes, Volume & Surface Area |
| 15 | Angles | Angles, Types of Angle, Angles at a Point & on a Line, Angles in Triangles & Quadrilaterals |
| 16 | Properties of shapes | 2-D Shapes, 3-D Shapes, Parts of a Circle, Properties of Shapes |
| 17 | Position and direction | Coordinates, Translations, Reflections |
| 18 | Tables, bar charts and line graphs | Bar Charts & Pictograms, Line Graphs & Time Series, Charts & Diagrams |
| 19 | Pie charts and the mean | Pie Charts, Mean, Averages & Range |

95 key words, 49 formulas, 85 worked lines. Every worked line was worked again by hand: the column sums, the exchanges, the
24-hour clock, the change from £20. Each uses the examples 409's drawing for it shows (34 × 10, 4 − 7, 24 × 36,
432 ÷ 12, £60 in 2 : 3, x + 2 = 5, a 6 × 4 rectangle, 4, 7, 7, 9, 13), so the page and the picture tell one story.

### The words are private, so the cards are `lib_pending`

The words are written whole through `join`/`split` and sit in `data-private/`; the card rows carry `lib_pending: "True"`
(docs/library.md), as A-level Maths does on its branch (411). This base lacked the support, so the same minimal support
came with it: `check/lib-full.js` keeps a pending row with no words as a card, `check-textbooks` skips its word rules and
says how many it skipped, and the site says "Coming soon." until the Ledger has them. The words go to the Ledger by an
import file made by `drive-pack --ids TB-KS2-MATHS#2,…,#19` (eighteen items, their cards under `cards`), outside the repo.

### Where 409's drawings move to

Each moves by changing `place=` in `tools/<id>.py` and re-running it; every `about` below is a key word (or a worked
line's opening) of its new chapter, checked against the words before this was written.

| drawing | chapter | about |
|---|---|---|
| `pv` | 2 | Place value |
| `neg` | 3 | Negative number |
| `lmul` | 6 | Long multiplication |
| `bus` | 6 | Long division (or stay on 1) |
| `line` | 7 | Equivalent fractions |
| `fadd` | 8 | Common denominator |
| `fdp` | 10 | Per cent |
| `ratio` | 11 | Ratio |
| `bal` | 12 | Equation |
| `peri` | 14 | Perimeter, Area |
| `prot` | 15 | Protractor |
| `trans` | 17 | Translation, Reflection |
| `mean` | 19 | Mean |
| `fit` | 1 | Measuring (stays) |

Chapter 13 gives time and the 24-hour clock a home at last (409 drew nothing for it, for want of one).
