# 376 — GCSE Maths F & H and Corbettmaths primary: every part complete

19 Oct 2026. Closes the gaps 375 ranked first and second, for the two collections the owner named.

| collection | parts | incomplete before | after |
|---|---|---|---|
| Corbettmaths primary | 1,358 | 4 (99.7% complete) | 0 (100%) |
| GCSE Maths Foundation | 173 | 8 (95.4%) | 0 (100%) |
| GCSE Maths Higher | 924 | 23 (97.5%) | 0 (100%) |

Overall, from `node js/check-qtypes.js`: 79% → 80% of 8,010 parts meet their protocol.

## The engine (find.js, the marking functions only)

- **`parallel` and `not E`** beside `rule: eqn`. `parallel` takes any straight line in x and y with the given line's
  gradient (`markExprGrad_`: linear checked at three points, then −a/b). `not E` refuses anything equal to E, in the
  rule's own sense. So "a line parallel to M" (M is y = 5x) is `y = 5x + 1 | rule: eqn y = 5x + 1, parallel, not y = 5x`:
  `5x − y + 1 = 0` and `y − 7 = 5x` are right, and `y = 5x`, `2y = 10x`, `y = 4x + 1`, `y = 5x² + 1` and `x = 5` are wrong.
- **`fn g`**: `g(` is a call to a function, not g times a bracket. Each letter gets a fixed curve that is neither odd
  nor even. Without it, `y = −g(x)` (a reflection in the x-axis) equals `y = g(−x)` as a product, and would be marked right.
- **The mixed-number leak (360, 365).** Beside a `mixed` rule, a written way was matched by value, so `28/5` was
  marked right for `5 3/5`. Now, when such a rule fails, the written ways count only as written. This covers all 10
  `mixed` rows: Corbettmaths top-heavy fractions ×7 and GCSE ×3, and the two below.

check-marking has 15 new cases, a right and a wrong answer for each clause. check-marks-load lists `markExprGrad_`.

## The data

- **GCSE (`tools/answer-gcse-maths.py`, re-runnable)**:
  - **`rule: expr`/`eqn` on 21 parts**: sequences, lines, change of subject, proportion, vectors.
  - **May 2018 2H Q12** (match proportionality to graph): it is now `cells` `B ; D ; A ; C` in its table's four
    blanks, like May 2017 2H Q14, and its `accept` is removed. The tool can now delete a field.
  - **Nov 2018 1H Q2b**: the ways are bracketed, `(v^2 − u^2)/(2a)`. `/2a` reads as "/2 times a" (1/3x is x/3, 365),
    so the rule could not prove the old spelling.
  - **Nov 2018 1H Q18b** `y = g(−x)` uses `fn g`.
  - **Nov 2020 1H Q11c** "as a power of 3" is a form question. `QT_FORM` (qtypes.js) now includes "as a power of",
    so it is matched as written.
  - **June 2024 1H Q6b / 1F Q25b** use the parallel rule above.
  - **June 2023 1H Q2, Nov 2022 1H Q2a** have `rule: count 1, mixed, each eq 39/8` (and 77/20).
  - **Nov 2019 1H Q8(i), (ii)** were a scale drawing at 1 cm to 4 km. They take the scheme's 21.6 km and 322°, within the
    usual ±2 mm (±0.8 km) and ±2°: `21.6 km | 20.8 to 22.4`, `322° | 320 to 324`. The library's scheme only says
    "a little either side", so that band is ours. The question stays switched off, as 365 left it.
- **Corbettmaths primary**: choose-one, via `tools/set-choices.py tools/data/choices-376.json`. A second run
  refuses Rosie, because her `strip` is already gone.
  - **Rosie's rectangles**: the sheet's "Circle Yes or No" plus the reason, as four options. The right one is
    No with the 1×12 / 3×4 counter-example. The others are Yes, "never the same", and a false Yes example.
  - **Words and figures 21a, 21c**: the mistake, as four options. A key word cannot see the word *and*
    (`and` is a stop word), and choosing the mistake is fully determinate.
  - **2D shapes 5b**, "measure the longest side": the figure is drawn to scale (8.6 cm is 232 units, so the
    bottom side is 3.8 cm), but it has no printed scale. It is now four lengths to choose from: 3.8, 5.2, **8.6**
    and 12.4 cm. On paper, the measurement picks one. On screen, the shape's proportions do.

## Left

Nothing incomplete in the three collections. Two parts are marked a little narrower than their scheme:
- **"Any letter counts"** for the nth term (`4x − 3`): the rule wants n.
- **Nov 2018 1H Q2b** wants `/(2a)` bracketed.
