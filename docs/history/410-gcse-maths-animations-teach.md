## 410 — GCSE Maths animations that teach: seventeen new, two rebuilt (2026-10-24)

**Asked for as** "Make content better for learning; elaborate animations; refine old boring ones. GCSE
maths." KS2 and A-level were done on other branches at the same time, so this touched only GCSE Maths
rows. The chapters' words are private in the Ledger (397) and were not changed; animation rows are
public, and every new drawing hangs on a word, formula or worked line the chapter already has.

### What GCSE Maths had

Twenty-one drawings across chapters 1–19 (304's table). Chapters 5, 8, 9, 14, 18 and 20 had none,
and the big Higher topics — circle theorems beyond the centre angle, the sine and cosine rules,
vectors, trees, cumulative frequency, transformations — had nothing to watch. Each existing one was
drawn at 320 px, eight frames over its loop, and looked at:

- **Sine wave**: a dot going round once every 4 s under a caption that only said "sin θ". No scale,
  no values. Rebuilt (below).
- **Fibonacci**: eight squares popping in at once, unlettered, and a static line of numbers. The
  squares ran once (`fb-in` had no `infinite`), so after the first loop only the spiral moved. Rebuilt.
- **Pythagoras, index laws, the centre angle, circle area, the sieve, Venn**: already told a story
  step by step, with captions. Left as they are; `check-splash-loops` holds four of them to their
  centring and loop, and a "refinement" that changed nothing a learner sees was not worth that risk.
- **y = mx + c** and **standard form** already cover two topics on the list; no second drawing.

### The two rebuilt

- **Sine** (`tools/sine.py`): one turn every 8 s; the guide lands on an upright axis marked 1 and −1,
  with faint lines at those heights across the wave; the caption reads the value off as the dot passes
  each quarter (sin 90° = 1, 180° = 0, 270° = −1, 360° = 0; the still says sin 60° ≈ 0.87). One
  caption leaves before the next comes — the first build crossfaded them and the frames showed two
  numbers printed through each other, which is the Venn lesson of 304 again.
- **Fibonacci** (`tools/fib.py`): one loop told a term at a time — each square arrives with its number
  in it (from 5 up; the smaller ones are too small to letter at phone width), joins the line below, and
  its sum is said (1 + 1 = 2 … 8 + 13 = 21); then the spiral; then 21 ÷ 13 = 1.615 against 1.618.

Both scripts wrote only fragments before, so part of each drawing (the caption, a rule or two) lived
only in the row. They now write the whole markup and every rule; the row was replaced wholesale once
and each re-run since leaves it byte for byte.

### The seventeen new

Each is a script `tools/g_<topic>.py` writing a row through `tools/anim_row.py`; the id starts with
`g` and so does every class and keyframe (the id is the prefix), so nothing can collide with KS2's or
A-level's.

| id | title | chapter | about | what it shows |
|---|---|---|---|---|
| `gsurd` | Simplifying a surd | 2 | Surds | 48 squares regrouped as three 4 × 4: √48 = √16 × √3 = 4√3, checked |
| `gcomp` | Compound interest | 3 | Compound interest | £2000 at 3%: each bar last year's amount carried across with a growing gold slab; × 1.03⁴; simple interest's line |
| `gexp` | Expanding brackets | 5 | Like terms | (x + 3)(x + 2) as an area, four cells named, like terms collected |
| `gfac` | Factorising with tiles | 5 | Factorise | x² + 5x + 6 as tiles sliding into one rectangle, sides x + 2 and x + 3 |
| `gquad` | Roots and turning point | 7 | Roots and turning point | y = x² − 4x + 3 traced (one exact quadratic Bézier), roots, intercept, symmetry, (2, −1) |
| `gbal` | The balance | 8 | 5x − 3 = 2x + 9 | bags and ±1 tiles on a level beam: −2x, +3 with zero pairs, ÷ 3, x = 4, checked |
| `gsim` | Two lines meet | 8 | Simultaneous equations | 3x + 2y = 16 and x − 2y = 0 drawn, meeting at (4, 2); "add them" |
| `gsimi` | Scale factor k, k², k³ | 14 | Similar areas and volumes | a square and an isometric cube at × 1, 2, 3, counted: 1 4 9 and 1 8 27 |
| `grot` | Rotation | 14 | Rotation | a traced copy turning 90° clockwise about (0, 0), a corner's arc, the full description |
| `genl` | Enlargement | 14 | Enlargement | rays from (1, 1) through each corner to twice the distance |
| `gsemi` | Angle in a semicircle | 15 | Semicircle | C at four places, the angle square each time; then the proof with OC, a, a, b, b |
| `gpyr` | Pythagoras, rearranged | 17 | Pythagoras | four triangles in an (a + b) square slide (translations only) from c² to a² + b² and back |
| `gsoh` | SOH CAH TOA | 17 | SOH CAH TOA | hyp, opp, adj named; each ratio lights its two sides; 10 × sin 35° = 5.74 |
| `grule` | Sine and cosine rules | 17 | Sine rule, Cosine rule | sides paired with the angles they face; then b = 5, c = 7 with A at 60°, 90° (Pythagoras), 120° |
| `gvec` | Tip to tail | 18 | Resultant | a = (3, 2), b = (1, −4) from its tip, a + b = (4, −2); b first then a, to the same point |
| `gtree` | Probability tree | 19 | 5 red and 3 blue | branches without replacement, the red-red path multiplied, every outcome out of 56 |
| `gcf` | Cumulative frequency | 20 | Interquartile range | running totals, a monotone curve, median and quartiles read off it, a box plot under them, IQR |

All of them: SVG plus CSS keyframes, opacity and transform except where a line is drawn
(`stroke-dashoffset` on `pathLength="1"`); a caption stack under the drawing, one step at a time, at
the size of the app's text, two short lines at most so nothing wraps at 320 px; one seamless loop that
ends where it starts; and a still for reduced motion that is the lesson's last
picture with its answer (the base styles are the still, and `animation: none` reveals them).

`data/settings/splashes.json` has a row for each (kind `proof`), so the sheet can retire any of them
from the loading screen like the others.

### Things learnt on the way

- **A new row must exist before its script can write it** (`anim_row` only replaces what is there).
  Each was inserted once, under its chapter, from a scratch copy of the script's first output; the
  script is the source from then on. Adding a rule later means putting it in the row first, the same
  rule 304 states for the old ones.
- **`check-anims` finds a script by `write_anim('<literal id>'`**. The first drafts passed the id as a
  variable and were silently not checked at all; they call it with the id written out now.
- **A caption class and a drawing class with the same name** (`gpyr-c2` was both the third caption and
  the c² shading) share one keyframe, and the shading followed the caption. Caught on the frames.
- **A dash of no length still paints its round cap**: every line about to be drawn showed a dot at its
  end. They are hidden until their draw begins.

### The loading screen's budget

The device keeps a copy of every drawing for the splash, capped by `SPLASH_CACHE_MAX`. The 46 rows
now come to about 323 000 characters, past the old 200 000, so the cap is 400 000 — still under a
fifth of a 5 MB store, and the copy gives way whole to a child's answer whatever its size (304's
"after the review"). The reason is in `docs/notes/js/shell.js.md`. **KS2's and A-level's branches add
drawings too and may raise the same line**: merge to the larger number, and `check-anims` will say if
the sum passes it.

### Checked

`node js/check.js`, `node js/check-all.js --fast`, and `check-flow` in four parts; `check/anims.js` on
the nineteen changed rows (each in its chapter at 320 and 390, six moments, inside its card, and still
under reduced motion), whose stills were looked at; and every drawing shot at 320 px over its loop,
looked at, and fixed where it was unclear (labels on lines, a box plot's zero-length drop lines, an
arrow off the grid, a caption that wrapped mid-sum, tick labels under a dot).

## Later: one widget per thing (the merge with 409)

Two drawings of one thing on one chapter, judged frame by frame when 409 and 410 met:

- **Chapter 8, the balance**: 409's `bal` and this note's `gbal`. `gbal` stays (negatives, zero pairs and
  a check are the chapter's level); `bal` went (see 409).
- **Chapter 17, Pythagoras**: `pyth` (3-4-5: the 9 and 16 squares pour into the 25) and `gpyr` (four
  triangles rearranged, c² = a² + b² with no numbers). Same theorem, same chapter. `pyth` stays: it puts
  the numbers a learner works with into each square, and `check-splash-loops`, `check/states.js` and
  check-flow hold it; `gpyr` and `tools/g_pyproof.py` were deleted. No other chapter teaches the theorem.

The other chapters these two notes share (1, 2, 3, 14) were looked at too: place value beside standard
form, the number line beside fractions-decimals-percentages, and translation beside rotation and
enlargement each show a different thing, so they stay.
