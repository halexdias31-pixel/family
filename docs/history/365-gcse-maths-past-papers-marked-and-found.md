# GCSE Maths past papers, Foundation and Higher: every typed part marked by machine, and found by its words

The owner, 19 Oct: *"Ok just continue on making the finder experience as best as possible for users.
Corbetmaths primary for now and maths past papers for foundation and higher."* Corbettmaths primary
was 360 and 362; this is the second half.

The set: every GCSE Maths past paper whose questions reach Find — 33 papers, all Edexcel 1MA1 (the
library holds no other board's GCSE Maths with questions): Higher 29 (2017–2024), Foundation 4 (May 2017
Paper 1 and the June 2024 three). Seven of them (June 2024 ×6, June 2023 1H) have their cover row
switched off and their questions on; Find lists them all the same, so they are measured here. Measured
with `paperHealth_` (354, 359); the script that measured it reads the papers by their cover rows.

| tier | papers | mean Faithful | mean Answerable | A Ready / Usable / Rough | parts | machine-marked |
|---|---|---|---|---|---|---|
| Higher, before | 29 | 98.8 | 79.2 | 0 / 7 / 22 | 922 | 66.8% |
| Higher, after | 29 | 98.8 | 95.2 | 5 / 24 / 0 | 922 | 92.1% |
| Foundation, before | 4 | 98.3 | 74.8 | 0 / 1 / 3 | 173 | 71.7% |
| Foundation, after | 4 | 98.3 | 94.0 | 0 / 4 / 0 | 173 | 90.2% |

Answerable faults 355 → 90: worded with no rule 183 → 0, typed with nothing to check 55 → 2, printed
sheet only 51 → 0, drawn 66 → 88 (the printed-sheet drawings counted as what they are, below).

## The parts (tools/answer-gcse-maths.py)

Every value is read off the row's own `answer` — the mark scheme the library holds — and check-marking
proves each rule against it. 287 rows:

- **`mark_words`** on ~220 worded parts: "Is X correct?" as the verdict plus the figure that decides it
  (`no; 5.10; 1.70`), "Compare" as an average point and a spread point, "underestimate or overestimate"
  as the word and its reason, and "show that" / "prove" as the steps the scheme gives method marks for
  (`1000|990; 122; 61 495`). A point a mark, where the marks allow it.
- **`accept`** on the typed answers that had none: ratios, mixed numbers (`rule: count 1, mixed`),
  readings off a graph as the scheme's band (`12 to 17`), coordinates, inequalities, a listing
  (`rule: set hhh/hht/…`), three primes (`rule: count 3, distinct, each prime over 20 under 40`), and an
  HCF pair (below).
- **`cells`** on two tables to fill (Nov 2022 1H Q9a, Q13).
- **`rule: expr` / `eqn`** beside the written ways of 22 algebraic answers (below).

## Four things the engine learned

- **An algebraic answer marked by its value** (find.js `markExpr_`). `rule: expr R` parses what was typed
  — `x²`, `√`, `∛`, `π`, implied multiplication, brackets — and compares it with R at six sample points;
  `v = R` wants v as the subject (named or not, and nowhere on the right); `eqn A = B` takes any equation
  a constant multiple of it (`4y + 3x + 11 = 0` for `y = −¾x − 11/4`); `nobracket` makes "expand" mean
  multiplied out. Only on the rows that ask for it: a "simplify" or "factorise" answer is about its form,
  and stays matched as written. `1/3x` reads as x/3, the way the schemes write it — which is why
  May 2018 1H Q14 (`y = 100/9x^4`, meaning 100/(9x⁴)) has no rule.
- **`at N <tests>` and `hcf N`** in `rule:` — a value's own condition by its place, and a highest common
  factor. Nov 2022 1H Q8 ("m a multiple of 5, n even, HCF 7") is `count 2, hcf 7, at 1 mult 5, at 2 even`.
- **Key words**: a word ending a sentence kept its full stop and matched nothing ("No." was not "no",
  "the same." not "same"); and "No, the powers of 10 …" negated "powers". A No stopped by its own
  punctuation is now the verdict. A No inside a sentence still negates (check-marking has both).
- **Cells**: a blank of four `&nbsp;` was not a blank, so the two Nov 2022 tables could not hold cells.

## Answerable, read as the card is drawn (library.js `ableOf_`)

The card gives every part its box whether or not the paper is also printed (`needs_print` only adds the
Printed sheet tag). So a printed-sheet part with key words, cells or choices is marked like any other, and
a drawing on a printed paper is drawn under the pen and sent (362) — counted as drawn, not as "printed
sheet only".

## Finding a paper

Walked in the real funnel: Subject → Type → Tier → Year → Month → Paper, five taps to the first question,
questions in paper order (Q1a(i), Q1a(ii), Q1b …). Month is asked even with one answer — a folder, the
owner's design — and Paper 1 of a summer series sits under May because that is when it was sat.

Search was the clumsy part. "june 2024 foundation paper 1", "gcse maths higher 2019 paper 2" and
"edexcel maths foundation calculator" found **nothing**: the haystack held the card's name, paper,
subject and text, and no tier, board or level. It now holds the item's own tags too. And "paper 2" was two
words, so the 2 matched every Q2 and every 2024: it is one word now. The first query finds the four
June 2024 Foundation Paper 1s (Maths and the three sciences), the second the two Higher Paper 2s of 2019.
check-funnel 6c types every past paper's level, subject, tier and name and wants it found, with no other
numbered paper beside it.

## Left, and why

- **88 drawn parts**, sent for marking: graphs drawn or sketched 19, transformations 9, box plots 8,
  histograms 6, plans and elevations 6, cumulative frequency 5, regions 5, tree diagrams 5, Venn 5,
  frequency polygons 4, charts 4, constructions 2, number line 1, other 9. Determinate on paper, but
  marking them needs the strokes read in the figure's own units (359's next step; 362 left 73 the same way).
- **June 2024 1H Q6b / 1F Q25b**, "a line parallel to M": any `y = 5x + c` but M's own c. No rule says
  "not this one" yet.
- **Mixed numbers**: a written way beside `mixed` lets the top-heavy fraction through (`28/5` for
  `5 3/5`), as it does in 360's rows — check-marking wants a worked example in front of every rule.
- **Faithful** is unchanged at 98–99: 42 parts whose marks the paper prints once for the whole question
  (Q3a–c with the 2 on Q3d), 8 pictures not drawn, and Nov 2019 1H Q8 (a scale drawing to measure),
  switched off when it was transcribed — the gap and the 75 of 80.
