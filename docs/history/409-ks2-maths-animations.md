## 409 — KS2 maths animations: ten new, four rebuilt, one clock to write them all (2026-10-24)

**Asked for as:** "Make the content better for learning; animations where appropriate; refine old
terrible/boring animations; go elaborate. Start with maths: SATs (KS2)."

### What there was

The KS2 book (`TB-KS2-MATHS`) has one chapter, *How many fit? Dividing by measuring*, and one drawing,
`fit` (349). Every other drawing a Year 5–6 child would meet hangs on a GCSE Maths or Statistics chapter.
Each was rendered at 390 px and frame-stepped (Playwright, `Animation.currentTime`), and rated for what it
teaches, how it moves, what it labels and its palette:

| drawing | chapter | verdict |
|---|---|---|
| `fit` How many fit? | KS2 1 | strong — counted, labelled, held to its sums by check-css; kept |
| `mean` The mean | Stats 8 | weak — five unlabelled bars scale to one height and back; no numbers, no why. **Rebuilt** |
| `half3` Half, three ways | Maths 3 | weak — half a bar, then ½ / 0.5 / 50% swapped under it in a glyph a speck wide. **Replaced** by `fdp` |
| `line` Number line | Maths 3 | weak — a dot slides along one line over "0 · ¼ · ½ · ¾ · 1"; never says ½ and 2/4 are one point. **Rebuilt** |
| `prot` Protractor | Maths 13 | weak — an arm sweeps a half-circle with five ticks and the word "degrees"; no scale to read. **Rebuilt** |
| `ang` Angles | Maths 13 | fair — the triangle's corners torn off and laid on a line, labelled a, b, c and 180°; kept |
| `sf` Standard form | Maths 2 | fair for GCSE (moves the point); `pv` now stands beside it with the KS2 picture, digits moving |
| `clock` Clock | Maths 11 | fair — ratio of the hands, GCSE; kept |

### Where they hang, and why not on KS2 chapters

A drawing hangs under a chapter and its `about` must name one of that chapter's key words, formulas or
the opening of a worked line (`check-textbooks`). Those are the card's **words, private in the Ledger**
(397), and this work changes no private field. So a drawing goes where a chapter already teaches its
topic: long division under the KS2 chapter (it is How Many Fit?'s measuring, in big handfuls), the rest
under the GCSE Maths chapter that covers the KS2 topic, each `about` picking the line it explains. When
the KS2 book grows chapters (place value, fractions, ratio, …, words written in the Ledger and pushed),
moving a drawing is one line in its script's `place=`: book, chapter, about.

| new | script | hangs on | about |
|---|---|---|---|
| Place value | `tools/pv.py` | Maths 2 | Standard form |
| Long division | `tools/bus.py` | KS2 1 | Quotient, Remainder, Remainder as a fraction |
| Long multiplication | `tools/lmul.py` | Maths 1 | Multiple |
| Adding fractions | `tools/fadd.py` | Maths 3 | 3/4 + 1/6 (its worked line) |
| Fractions, decimals, percentages | `tools/fdp.py` | Maths 3 | Equivalent |
| Area and perimeter | `tools/peri.py` | Maths 16 | Triangle and trapezium, 1 m² |
| Translation and reflection | `tools/trans.py` | Maths 14 | Translation, Reflection |
| Ratio | `tools/ratio.py` | Maths 11 | Ratio, Share £60 in the ratio 2 : 3 |
| Balancing equations | `tools/bal.py` | Maths 8 | 5x − 3 = 2x + 9 |
| Negative numbers | `tools/neg.py` | Maths 1 | −3 × −5 |

Rebuilt, each now a script: `mean` (about adds the chapter's 4, 7, 7, 9, 13), `line` (now *Fractions on a
number line*), `prot`; `half3` is gone, its row and its splashes row, `fdp` in its place. **Not drawn:**
time and the 24-hour clock — no chapter in any book has a word or a line it could be about.

### What each one teaches

Every one is three or four worked examples on one loop of 30–39 s, each opening on its question, moving
one step at a time with the step said in words at the foot, and ending on the sum with the answer gold.

- **Place value** — a chart headed 100, 10, 1, 1/10, 1/100; the digits slide (slowly, 1.8 s) one or two
  columns, the gold point never moves, and a blue 0 pops into an empty place: 34 × 10, 5.6 × 100, 47 ÷ 10,
  3 ÷ 100.
- **Long division** — chunking under a bus stop: 432 ÷ 12 (30 × 12, then 6 × 12), 487 ÷ 15 (32 r 7, then
  32 7/15), and 744 ÷ 6 digit by digit with each remainder carried, small and coral.
- **Long multiplication** — 24 × 36 as a grid (cells sized to their area, each product popping in, row
  sums, 864), then the column (24 × 6 with its carry, the 0 for × 30, 24 × 3, the add), then both side by
  side with each row joined to its twin: "the column is the grid, short".
- **Adding fractions** — bar models: 2/5 + 1/5 (same parts, count); 1/2 + 1/3 ringed coral "not the same
  size", both cut into sixths, the parts slid into an answer bar keeping their colours; 3/4 + 1/6 into
  twelfths, the chapter's own line.
- **Fractions, decimals, percentages** — a hundred square shaded a row at a time while the right column
  writes 1/2, 50/100, 0.5, 50% ("top and bottom × 50", "50 hundredths", "per cent: out of 100"); also 1/4,
  1/10, 3/5.
- **Area and perimeter** — one 6 × 4 rectangle: the first row's squares counted 1–6, then rows with a
  running total 6, 12, 18, 24; then each side drawn gold with the running total to 20 cm; then the
  diagonal cut and the cut half turned about the middle onto the other: ½ × 6 × 4 = 12 cm².
- **Translation and reflection** — a point walks across then up to (3, 2), then left (coral) and up to
  (−2, 4); a triangle slides 5 right then 2 up from its dashed ghost, one corner followed; an L-shape folds
  over the y-axis, corners joined across with their equal distances.
- **Ratio** — equal boxes: £60 in 2 : 3 (£12 dropped in each box, £24 and £36); 4 : 6 paired off into
  2 : 3; 2 : 5 with B's £35 known, so a box is £7 and A gets £14.
- **Balancing equations** — x + 2 = 5 with cubes taken off one side only and the beam TIPS ("not level",
  coral), put back, then off both; 2x + 3 = 11; 3x + 2 = x + 10. What is about to go is ringed on both
  pans at once.
- **Negative numbers** — a thermometer whose level and pointer move in two stages, to 0 and then past it,
  with the arrows beside the scale blue to zero and green past it: 4 − 7, −5 + 8, and the difference from
  −6 to 4.
- **The mean** (rebuilt) — towers of blocks; blocks above the mean move one at a time onto the short
  towers and turn paper so the moves can be counted; every number under the towers becomes 8 and a gold
  level line is drawn; then 2, 6, 3, 5 (16 ÷ 4); then the total first and all the moves at once,
  total ÷ count.
- **Fractions on a number line** (rebuilt) — number lines 0 to 1 stacked, cut into halves, quarters,
  eighths and decimals; a gold line drops through ½ and rings every mark it meets: "one point, 4 names";
  then ¾ = 6/8 = 0.75, and 2/3 = 4/6 = 8/12 on thirds, sixths and twelfths (every other twelfth named).
- **Protractor** (rebuilt) — both scales drawn, the one to read gold: 40° acute and 90° (with its square)
  from the 0 on the right, then 130° obtuse from an arm on the left, so the other scale.

Colours as every drawing since 349: the screen's paper on the card's black, gold for the answer, coral for
wrong or negative, the app's green, and one blue of the drawing's own defined on its root. Text is never
under 10 units in a 240-wide view box; captions are kept to 31 characters so they fit at 320 px.

### One clock, in `anim_row`

`fit.py` moves everything on one clock: shared keyframes switching at H, each part carrying `--d`, holding
its new state for HOLD seconds, past its scene's end, and snapping back unseen. The new scripts share it as
`anim_row.Loop` — `st(a, t0=…, o=…)` for a part's switch, `step(a, b, …)` for a caption shown from a to b,
`scene(k, …)`, `frac(…)`, and `css()` for the scene cross-fades, the six shared keyframes (`-in`, `-out`,
`-mv`, `-mvs`, `-fly`, `-pop`; transform and opacity only) and the reduced-motion block. HOLD is half the
loop, so every scene must be shorter than half the loop less its fade (asserted). A move is "from `--t0`
to where it is drawn", so with less movement the base styles ARE the still: the first scene finished.

A script that owns its whole row calls `write_anim(id, html=…, css=…, whole=True, place={book_id,
chapter, title, about})`: `place` makes the row, or moves it, straight under its chapter after that
chapter's other drawings, and `whole` writes markup and stylesheet as given. Before, `anim_row` could only
rewrite what a row already had (304), which suited scripts that took over hand-made rows; these have no
hand-made past. check-anims runs each one on a copy and the copy does not change, as for the others.

### The ceiling on the kept copy: 200 000 → 400 000

The 38 drawings come to about 317 000 characters. `SPLASH_CACHE_MAX` was 200 000, and 349 said a failure
there should slim a row, not raise the cap. Slimming could not get 125 000 characters of new drawings under
it (the mean's static blocks were already folded into one path, 12.5 K → 9.4 K). It is raised in the open:
the copy already gives way, whole, to any child's write the store refuses (`splashGiveWay_`, 304), so the
ceiling bounds a decoration's share of the store, not whether an answer fits; check-anims' full-device case
still passes. Say so if the owner would rather keep the splash to fewer drawings.

### Checked

Each drawing frame-stepped at 390 px and looked at: overlaps, clipped captions and labels on the baseline
were found that way and fixed (long division's sum and fraction collided; ratio's £35 ran off the edge;
the balance drew a second level beam under the tipping one; the thermometer's level jumped straight to
the answer while the arrows went in two stages; the translation's second dot sat at the origin during the
first walk; the protractor's end labels sat under the arms). Reduced motion shows each first scene's
finished state. `node js/check.js`, `node js/check-all.js --fast`, and `FLOW_PART=k/4 node js/check-flow.js`
for k = 1–4.
