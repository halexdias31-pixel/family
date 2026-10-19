# Corbettmaths primary: the irregular questions answered and marked by machine

The owner, 19 Oct: *"Can you check corbetmaths primary make it good especially irregular questions and do
health checks on them if you haven't already"*.

The set: every Corbettmaths paper with a KS1 or KS2 row, 71 worksheets (the Corbettmaths 5-a-day in the
library are all KS4). Measured with `paperHealth_` (354, 359).

| | papers | mean Faithful | mean Answerable | A Ready | A Usable | A Rough |
|---|---|---|---|---|---|---|
| before | 71 | 98.9 | 91.3 | 35 | 22 | 14 |
| after | 71 | 98.9 | 95.6 | 51 | 12 | 8 |

Answerable faults 146 → 77: drawn 80 → 73, typed with nothing to check 47 → 1, worded with no rule 12 → 3,
on the printed sheet only 7 → 0.

## `rule:` — an answer with many right forms (find.js `markRule_`)

"Write three factors of 40 that are also factors of 30", "which coins could Daniel choose", "two numbers
4 apart that round 100 apart", "list all the combinations": one right answer cannot be listed in `accept`.
A way in `accept` that starts `rule:` is now tested, not matched — the numbers typed are read (fractions,
mixed numbers, pence and pounds, negatives; a number with a power or a letter glued to it is not read) and
the clauses must all hold:

`count N`, `distinct` (as written), `mixed` (written as a mixed number), `each` with `mult/notmult/factor/
notfactor N`, `prime`, `notprime`, `square`, `cube`, `odd`, `even`, `over/under/eq/ne V`; `sum V` or
`sum A..B`; `diff V`; `rounddiff R V`; `from a/b/…` (a sub-multiset: each coin used once). `set a+b/c+d`
marks a list of word groups as a set, each group's words in any order, `~` between a word and its other
spellings (`head~h`).

Every `rule:` in the library has a worked example in front of it (`4, 12, 18 | rule: …`), and check-marking
proves each example is marked right by the rule alone, plus 16 right/wrong cases. The keypad ignores a
`rule:` way when choosing keys. A cell holding a list (`24, 68`) gets the text keyboard, which has a comma.

## Data, by kind (data/questions.json)

- **Many right answers → `rule:`** (33): factors, multiples, primes, the mean, coins, rounding, adding
  fractions, equivalent fractions, square/cube numbers, the angles of a scalene triangle, the 5 listing
  questions (`set`), and the 7 mixed-number questions (`mixed` — 7/3 is no longer right for "as a mixed number").
- **One answer typed → `accept`**: who bought the most, the three "which shape above", the two bracket
  questions, 81 + 9, the second isosceles triangle.
- **Venn diagrams and matchings → labelled `cells`** (10): `Even only = 24, 68 ; Both = 8 ; …`;
  `Top = pentagon ; …`; the bar chart's missing labels.
- **"Circle/tick the …" over a picture → `choices`** (4), positions as options, two to pick where the sheet asks two.
- **Worded, decided by a number or word → `mark_words`** (14): `17`, `38`, `180`, `2`, a counter-example to
  "squaring makes it bigger", `115|scale|inner|outer`, …
- **Translations** were `print_required` with a grid figure each; drawn on their figure like Reflections now.

## Left, and why

- **73 drawings** (reflect, translate, draw lines of symmetry, draw an angle/triangle/square, plot points,
  clock hands, scale arrows, pie charts, shade a fraction): drawn on their figure, marked by a person or AI.
  A machine check from strokes (corners of a transformed shape, a shaded count, a line's length) needs the
  pen's strokes read in the figure's units and is not small; 359's next step still stands.
- **Worded, no determinate word**: Rosie's rectangles (area/perimeter), "words and figures" 21a and 21c
  (the mistake is about the word *and*, which a key-word rule cannot see).
- **2D shapes 5b** "measure the longest side": a screen is not full size.
- **Faithful**: 69 papers are not marked checked against their PDF; Proportion has no Q12; Time Q18 "what
  time is shown on Connor's watch" is a false "needs a picture" (`HEALTH_SAYS_PIC` reads "shown").
