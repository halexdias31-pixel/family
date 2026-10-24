## A-level Maths: a content book, seventeen teaching animations, and `lib_pending`

**The owner**: *"Make content better for learning; elaborate animations; refine old boring ones. A-level maths."*

### What was there

Nothing to refine. `data/textbooks.json` held 25 books, all GCSE plus one KS2, and not one A-level or AS chapter, in the
repository or in `data-private/`. A-level maths was 232 A-level and 15 AS questions, and an animation can only hang
under a chapter (`check-textbooks`: directly under it, `about` naming one of its key words). The old drawings (`bayes`,
`gal`, `mxc`, `orbit`, `fit`) are on GCSE and KS2 chapters, which other branches were working on, so none was touched here.

### The book

`TB-ALEVEL-MATHS`, "A-level Maths", level `Alevel`, KS5, in the order of Edexcel 9MA0 — eighteen chapters:

| | chapter | animations |
|---|---|---|
| 1 | Proof | `aroot2` √2 is irrational |
| 2 | Algebra and functions | |
| 3 | Coordinate geometry and parametric equations | `aparam` A curve from a parameter |
| 4 | Sequences, series and binomial expansion | `apascal` Pascal and (a + b)ⁿ, `ageom` Summing to infinity |
| 5 | Trigonometry and radians | `aunit` Radians and the unit circle |
| 6 | Exponentials and logarithms | `aexp` eˣ and its mirror, ln x |
| 7 | Differentiation | `afirst` From chord to tangent |
| 8 | Further differentiation | `achain` The chain rule |
| 9 | Integration | `ariemann` Rectangles to an integral |
| 10 | Numerical methods | |
| 11 | Vectors | `avec3` A vector in three dimensions |
| 12 | Data, sampling and correlation | |
| 13 | Probability and the binomial distribution | `abinom` The shape of B(n, p) |
| 14 | The normal distribution | `anormal` Area under the normal curve |
| 15 | Hypothesis testing | `ahyp` Finding the critical region |
| 16 | Kinematics and projectiles | `aproj` A projectile, in two parts |
| 17 | Forces and Newton's laws | `aincline` Resolving on a slope, `apulley` Two masses, one string |
| 18 | Moments | `amoment` Balancing moments |

The cards are public. The words, formulas and worked lines (4–6 key words, 2–5 formulas and 4 worked lines per chapter)
are private: they were written whole through `join`/`split`, are in `data-private/`, and go to the Ledger by an import
file the owner opens in Business, made outside the repository. Topics are spelled as `data/topics.json` spells them. The
tree had no A-level statistics or mechanics, so it gained two roots, `Statistics (A-Level)` (Statistical Sampling, Data
Presentation & Interpretation, Correlation & Regression, Binomial Distribution, Normal Distribution, Hypothesis Testing)
and `Mechanics` (Kinematics, Projectiles, Forces & Newton's Laws, Moments).

### A card newer than the pinned commit: `lib_pending`

A fresh clone seeds `data-private/` from `LIB_SOURCE_COMMIT`, which predates this book, so `check/lib-full.js` would
have thrown "run pull" on every run of every check. Each new chapter carries `lib_pending: "True"`: `lib-full` treats a
pending row with no words here as a card, `check-textbooks` skips the word minimums and the animation `about` rule for
it and prints the count it skipped, and the site says "Coming soon." when the Ledger answers `missing` for one. With
`data-private/` holding the words, everything is checked as before. docs/library.md has the rule.

Proved both ways. With the A-level words taken out of `data-private/`, `check-textbooks` is green and says "18 pending
card(s) and 17 animation(s) on them were NOT checked for words", and `check-anims` is green too. Taking `lib_pending` off
chapter 1 in that state throws "have words in the Ledger and none in data-private". With the words put back, all of it
is green.

### The animations

Seventeen scripts, `tools/a_<name>.py`, each writing the row `a<name>`. They never lived in `index.html`, so they do not
merge into a row the way the move's thirteen do: `anim_row.write_anim(id, html=, css=, whole={book_id, chapter, title,
about})` writes the whole row, and creates it straight under its chapter the first time. `check-anims` re-runs each one
on a copy of the books like the others, and they are on the `WRITTEN BY A SCRIPT` line. Helpers in `anim_row.py`:
`kf` (keyframes from seconds), `fade`, `captions` (a caption grid whose lines take turns, the last one being the still),
`still_block` and `sine_stops`.

The same rules hold for every one of them:

- **The base style is the lesson's last frame.** Under reduced motion, `.an-<id>, .an-<id> *` set `animation: none`, so
  each drawing stops on its conclusion: the tangent, the integral, the balanced plank. That rule only wins if every
  animated selector is a single class, which is why there are no `.x > .y` animations. The first version of the chord's
  captions was `.afp-say > .afp-c2`; it beat the still rule and flickered under the global `.01ms`.
- **A sine is a handful of stops, not dozens.** x = 2 cos t, y = sin 2t, the unit circle's height and the projectile's
  height move on eased keyframes at their turning points (`sine_stops`: `cubic-bezier(.37, 0, .63, 1)` between turns).
  A parabola's halves are exactly `cubic-bezier(.33, .67, .67, 1)` and `(.33, 0, .67, .33)`, and so is the pulley's
  s ∝ t². Nested groups move x and y separately. This took the seventeen from 219 000 characters to 162 000.
- **Scaled lines.** A 1-unit line stretched by `scale` takes its round caps with it, which drew gold spikes on eˣ, and
  it blurs at the ends. Bars and slider fills are rects, and dashed guides use `vector-effect="non-scaling-stroke"`.
- **CSS beats presentation attributes**: `text-anchor="end"` on an element whose class sets `text-anchor: middle` is
  ignored (the moments' "in N m" label), and `fill="var(--gold)"` is not a value at all. Both are set by class.
- **A child counts, not its parent's opacity**: `check/anims.js` measures every element by its own computed opacity, so
  the √2 steps sliding in from −8px were 8px past the card while still invisible. They rise 5px instead.

`SPLASH_CACHE_MAX` goes from 200 000 to 500 000: the books' drawings now total about 352 000 characters. That is a tenth
of a 5-million-character store, and `check-anims`' full-device cases still prove the copy gives way to a child's answer.

### Seen

Every drawing was screenshotted at 390 px at four to six moments, and as its reduced-motion still, using a harness that
pauses every animation at chosen times. Then all seventeen were run in their chapters through `check/anims.js --shots`
at 320 and 390. That pass fixed: the readout over the y-axis label and the h label over P (chord); the chain-rule bar
falling through its line's name; the 3D projection that hid z behind the resultant (`EX, EY` changed so the box reads);
the Sₙ readout over the asymptote; the pulley's 3 kg rising into the wheel; the moments readout crowding one line; and
the slider and ruler fills blurring.
