## The cover said "You must not use a calculator" and 247 questions never said it

**Asked for as "ok great. be thorough and have a look again at the same paper."** The shallow
questions about Maths Foundation Paper 1 Summer 2024 were already answered — 80 marks, 41 of 41
answered, no missing pictures, no gaps in any question's own text. This is what the dimensions
nobody had measured turned up, and the largest of them is not about that paper at all.

### `needsIndex_` read the mapped list, and it is the THIRD function to get that wrong

**`libraryInto_` DROPS EVERY ROW WHOSE `active` CELL IS NOT ON**, so `DATA.questions` holds **174
of the file's 691 document rows**. A paper-level fact — the code on its cover, the name for its
button, whether a calculator is allowed — has to be read off the FILE or it silently knows a
quarter of the library.

**`specIndex_` and `paperLabels_` were each repaired for exactly this**, each with a paragraph
saying why, and each carrying its own copy of the same three lines. `needsIndex_` was handed
`DATA.questions` and nothing compared the three.

| | |
|---|---|
| document rows carrying a `needs` cell | **128** |
| of those, marked inactive and dropped | **77** |
| of THOSE, with questions under them | **7** |
| **questions that never said whether a calculator was allowed** | **247** |

**The seven are the whole June 2024 Edexcel series — both tiers, Papers 1, 2 and 3 — plus June 2023
Higher Paper 1.** On a maths paper that is the first thing a student needs to know, and the one
fact the column exists to carry: four of the seven say `Calculator` and three say `No calculator`,
so a student on Paper 2 was doing it the hard way and a student on Paper 1 was practising wrong.

**AND IT WAS WORSE THAN A SILENCE.** Measured through the app at 320px: **15 of the 41 cards drew
`Printed sheet` and nothing else** — the question's own `needs` — so the strip was present and read
as complete. After: 41 of 41 draw `No calculator · Printed sheet`, outermost first, which is the
order `needsOf_`'s own note describes.

**A THIRD COPY OF THE THREE LINES WOULD HAVE BEEN THE THIRD**, which is this repository's sentence
about `documents_()`, `factsNow_` and `childrenOf`. `libDocRows_` is the one reader and all three go
through it; `libIsDoc_` is the other half, because the file says `kind: 'document'` and the mapped
list says `isDoc`, and a reader that knows one of the two finds nothing whichever list it is handed.

**`check-funnel.js` RULE 6c IS THE RULE, and it is rule 6b's shape one column along**: a paper that
HAS the cell either reaches its questions or something between the cell and the card has come
undone, and the question has exactly one right answer. **On the items, through `asList_`** — the
property rather than the mechanism, so it holds however the index is built; a test on
`needsIndex_`'s arguments would pass on a version that took the file and ignored it. **Proved by
mutation**: the old reader back and it names all seven papers with their exact counts and exits 1.

### Eight right answers were marked wrong, and two of the causes are the rule rather than the row

**This is the one thing in the app that tells a child they are wrong**, so the audit ran every trap
the paper's own answer prose names — *"the answer to watch for"*, *"do not accept"*, *"scores M1
A0"* — and every equivalent the schemes say they accept, through the app's own `markAnswer_`.
**Eight of 22 disagreed with the scheme, every one of them a RIGHT answer marked wrong**, which is
the failure this file calls the worse of the two.

**THE SPACES ROUND AN OPERATOR WERE THE BIG ONE.** A mark scheme prints `4n − 3` and a child types
`4n-3`. The minus has been folded for a long time — `norm` gave `4n - 3` — so the sign matched and
the spacing did not. Measured across the library: **178 of the 1,436 `accept` cells carry a space
round an operator**, and they are precisely the algebra ones, where nobody types the spaces —
`3(2x − 5)`, `5x + 2y`, `2 × 3 × 3 × 5`, `x = 3, y = -4`.

**AND ELEVEN CELLS CARRY A SIGN NO PHONE KEYBOARD HAS.** `x ≤ −4` is this paper's Q28, so a student
who had solved it could not enter the answer at all. `<=` is what a keyboard gives and is not a
legitimate spelling of anything else.

**Both are the ratio rule one class of character along**, and that rule's own argument is the one
that makes them safe: `1 1/6` is 1.17 and `11/6` is 1.83, and the space in a mixed number touches
no operator, so nothing here can reach it. **Proved over the real data rather than argued**: across
the library's **1,144 distinct `accept` alternatives, the fold makes ZERO pairs of different values
equal** — so it cannot mark a wrong answer right. 14 new cases in `check-marking.js`, which is 71
now, and the mutation names six of them.

**The other three were the ROW, and each alternative is one the answer's own prose already
quotes**: Q5 `8` → `8 | -8` (*"the scheme says accept 8 or −8"*), Q10 `2 : 3` → `| 1 : 1.5`
(*"the scheme also accepts 1 : 1.5"*), Q17 `x = 3.5` → `| 3.5`, which then folds `7/2` and `3 1/2`
through `markFrac_`. **Nothing invented** — an accept cell widened past what the scheme says is the
other failure, and it is the one no rule here can catch.

**0 of 23 now, from 8 of 22.**

### The marks were read off the scheme, and the answer prose is what proves it

**The Edexcel `1MA1_1F_2406_MS` is not reachable from this environment** — revisionmaths is blocked
at the proxy and it is not in Drive — so "were the answers read or derived" cannot be settled by
opening it. What CAN be measured is that the answer cells quote the scheme's own **mark codes**,
and whether they add up.

**33 of the 41 rows' codes sum exactly to the row's marks.** The other eight are the scheme's
alternative routes and tolerances restated in prose — Q9c's `M1 C1` written out three ways, Q20's
`B1 only for 4n + k` rungs — and Q19's two are written as *"two independent B1s"*, which the regex
cannot see. **Every one is consistent.**

**And a derived answer cannot carry what these carry**: *"the scheme says ISW"*, *"do not accept 5
across, 4 down"*, *"correct answer with no supportive working scores 0"*, *"0.81 rounded to 1 is
condoned for the process marks but loses the A1"*. Those are readings of a document, not arithmetic.

### Two labels in one drawing were overlapping, and only a screenshot could say so

**Q12 is a triangle and a rectangle side by side**, `14 cm` naming the triangle's third side and
`4 cm` the rectangle's width — and both sat in the 74 units between the two shapes. Measured in the
browser: **their rendered boxes intersected by 7.3 units across and 1.8 down**, so each label was
nearer the other than the shape it names.

**NOTHING ELSE CAN SEE IT.** The svg clips nothing, the card fits its column, and
`check/cards.js`'s four-edge rule asks whether a label leaves its OWN box rather than whether two
labels collide inside it. **Twenty-sixth time this file writes that a screenshot is the last word on
a drawing** — counted off the entries above rather than remembered, because this tally has been
wrong inside its own warning twice.

**Pulled apart in both axes**, because the gap is too narrow for either move alone: 2.7 across and
16.2 down after. **The generator and the cell were changed together and proved identical** — every
shape and every word byte for byte the same, only two coordinates moved — which is the
`libraryExtras_` rule, and is why the script's own run-once guard did not have to be defeated.

### What the rest of the audit found, which is the other half of trusting it

Measured rather than assumed: **48 row ids, unique across the whole library**; six preambles, each
reaching exactly its own parts; parts in order on every question; every closed-vocabulary value in
`VOCAB`; `needs` on the document row and **not** copied onto the questions, which is the
denormalisation hazard avoided; **44 distinct topics, all 44 joining `data/topics.json`**, no row
untagged; and through the app at 320x568 — 41 cards, 80 marks, **0 past the column**, 14 drawing a
preamble, **0 dashed stand-ins**, 3 tables, 9 drawings, 41 answer blocks all shut to a student, 31
Check buttons, 1 pen, no JS errors.

**`active: False` on the document row is harmless and was checked rather than assumed**: all 41
questions and all 6 preambles are `active: True`, and every reader that needs a document row now
reads the file. **The absent `exam_date` is correct** — Edexcel took the date off the front page in
2021, and this file already refuses to fill that column from the URL slug on the evidence of eight
Saturdays.

### And my own instrument was the fault five times in one session

Worth the space, because every one printed a confident finding about the app:

| | |
|---|---|
| **the marking sweep** | compared the whole `answer` cell — answer PLUS the scheme's commentary — against `accept`, and reported **31 of 31 failing** |
| **then its `strip`** | put a `^` before a `<sup>` that the `&frasl;` after it proves is a NUMERATOR — `set-accept.py`'s own recorded fault — and reported 4 |
| **then `r.q`** | read the FILE where the app reads the MAPPED item. `library.js:546` is `q: libS(r.question)`, so I reported a live funnel facet as dead across 5,032 rows |
| **the `needs` probe** | looked for `.qp-needs, .qsheet-needs, .needs` where the class is `.qcard-needs`, and reported 0 cards drawing a strip that 15 were drawing |
| **the run-once grep** | matched `sys.exit` and missed `SystemExit`, so I concluded three scripts had no guard when all three do |

**The common shape is that I measured the file where the app measures the item, and the source
where the app renders the DOM.** Every one was caught by carrying on rather than by the check that
should have caught it — which is this file's own definition of luck, and the reason the entry above
about nearly writing a placeholder over a correct table is one heading up.
