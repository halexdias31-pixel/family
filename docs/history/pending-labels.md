## Every label in every drawing is measured against its own lines, and the Venn's P and Q are outside their circles

Reported by the owner, tutoring from Edexcel GCSE Maths June 2024 Paper 1 Foundation: *"the Venn
diagram was a bit off. Like P and Q was clashing with lines."* Q23's preamble (`Q-1MA1-2406-1F-23`)
put P at (97.2, 47.2) and Q at (240.5, 46.7), on the rims of two circles of radius 64.3 — so each set
letter had its circle running through it. A printed paper puts a Venn's letters outside their
circles, by the upper left and upper right. They are there now: P at (84.3, 43.2), Q at (254.0, 43.2).

**Nothing in the suite could see it, and each check was right about what it asks.** `check/cards.js`
asks whether a label is inside its own `<svg>`, and a letter on a rim is. `check/ui.js` measures
screens. A label against its own drawing's lines was a third question with no instrument, so the
334 drawings in `data/*.json` had each been looked at once, by whoever drew them, at whatever width
they happened to look at. Fixing the Venn alone would have left the rule unasked.

### `check/diagrams.js` — the rule

Every inline `<svg>` in any string cell of any `data/*.json` (today 256 cells in `questions.json`
and 77 in `practicals.json`, one of them holding two drawings), laid out in the real stylesheet in
the card the app draws it in (`.qsheet` for a question's figure, `.gd` for a practical's), at **320
and 390px, at a device pixel ratio of 3**. For every `<text>`:

1. **no inked stroke runs into its glyphs** — line, polyline, polygon, path, circle, ellipse and
   rect, sampled every half screen pixel along the geometry, through each element's own CTM;
2. **its glyphs do not overlap another label's**;
3. **its glyphs are inside the viewBox**.

**Glyphs, not the text box.** Each character is measured on its own — canvas `measureText` in the
computed font of the element that draws it (a `<tspan>` subscript included) for the INK box, placed
at `getStartPositionOfChar` — so a capital P's empty descender does not "touch" the line under it,
and a line that passes between the minus and the 2 of "−2" is correctly not through either.

**Tolerance: half a screen pixel**, the same for all three. Anti-aliasing, a glyph not filling its
rectangle, and sub-pixel placement are each under a pixel; half a pixel is below anything a person
sees as touching and above the rounding.

**Two things the rule had to learn by measuring, both written in the file:**

- **the answer moves with pixel density.** Chromium hints SVG glyph advances at the size it will
  rasterise them, so the same label against the same line came out up to half a pixel apart at 1x
  and 3x — the size of the tolerance. 2x and 3x agree; 1x named seven fewer drawings. So it runs at 3x.
- **and a little with width.** With every finding at 320 fixed, 390 named one more label, 360
  another and 414 a third, each exactly at the half-pixel line. So it runs at two widths, and all
  three were moved too.

**What is NOT a collision, decided by a rule rather than by naming rows:**

- **graph paper.** A stroke counts only when at least half of it is painted (opacity down the
  ancestor chain × `stroke-opacity` × the colour's alpha). `.grid` is 0.3, so writing on the squares
  is writing on paper. Proved: darken `.grid` to 0.8 and the check names 357 collisions in 16 drawings. Major rulings
  drawn at 0.5–0.6 DO count — a vertical ruling through a "1" makes a different glyph.
- **a knockout.** A stroke point covered by a LATER opaque fill is not painted, so it cannot touch a
  label. That is this library's own convention for a number on a line — `Q-1MA1-1706-3H-13` sets its
  tick numbers on `fill: var(--raised)` rectangles. Proved: remove the one under the y-axis 4 and it
  is named against the ruling at y = 22.

**`ACCEPTED`** — `'ROW|label|line'`, one written reason each, printed on every run, stale entries
fail. Four entries, one reason (below). The line is part of the key so forgiving a ruling does not
forgive the same label landing on a curve later.

`--shots=DIR [--rows=A,B]` writes 3x pictures with each finding ringed red (an accepted one amber);
`--face="DejaVu Serif"` measures another serif; `--width=`, `--dpr=` one setting alone. On the roster
in `js/check-all.js`; `npm run check:diagrams`. No port to collide on: `DIAGRAMS_PORT` unset is 0
and the OS picks one.

### What it found, and what was done

| | collisions | drawings |
|---|---|---|
| found, at 320 + 390, 3x | **124** | **55** |
| — a line through a label | 108 | |
| — two labels overlapping | 14 | |
| — a label past its viewBox | 2 | |
| — in `questions.json` / `practicals.json` | 98 / 26 | 42 / 13 |
| **cleared by moving the label** | **124** | **55** |
| left, ACCEPTED with a reason | 4 (new, see the key below) | 2 |

**Only labels moved.** In `questions.json`: 43 rows, 95 `<text>` tags, x / y / `text-anchor`
and nothing else (one of them, `Q-1MA1-1711-1H-7`, for a touch only a 414px phone showed) — edited line by line (`json.loads` the line, change `diagram`, `json.dumps` with
the file's own separators), with every untouched line asserted byte-identical and every touched row
asserted identical with `diagram` put back. In `practicals.json`: 13 drawings, 28 tags, moved in
**`tools/draw-practicals.py`** — the only writer of that column, which refuses to write a changed
drawing without `--redraw` — and the file redrawn from it, so the generator and the data agree.

**Mutations, against the real files, each red for its own reason and green again after:** P back on
its rim (named against circle P, 3.1px); 15 laid over 12 (label overlap); E pushed off the box
(2.8px past the viewBox); the knockout under a tick removed; the graph paper darkened; an
`ACCEPTED` entry removed (the key's label named); an `ACCEPTED` entry for nothing (stale).

### Decisions the owner should confirm

- **247 was in the wrong region, not just on a line.** On the A-level Venn (`Q-9MA031-2206-5`) it
  sat on F's rim, reading as H only. 247 is 65% of the 380 professionals in area B — professional
  (F), working from home (H), not area A (not R) — so it belongs in the H-and-F lens, and is there
  now. The nearest clear spot, which a search proposed first, was H only. **Every Venn move was
  checked against its own numbers for this reason.**
- **Tick numbers on two ruled grids** (`Q-1MA1-2406-2F-24b`, `S-P-1MA1-1706-2H-q20`) sat centred on
  major rulings at 0.55–0.6, so "1" read as a line. With no knockout allowed, each now sits in a
  corner of its intersection, the same corner all along an axis: on 2F-24b every y number just
  above its ruling and every x number, O included, at the lower right; on q20 the y numbers upper
  left and the x numbers lower left beside an O that stays where the paper prints it. **Tried and
  undone on 2F-24b:** all of them lower left, like O — the bottom −4 cannot go below the grid's
  edge (its glyphs fit the viewBox but its line box ran 2px out, which `check/cards.js` measures —
  the two checks are deliberately not the same box), and lifting just that one crammed −3 and −4
  into one square. The real fix is the knockout convention.
- **O beside the origin, not below-left,** where a line through the origin cut it: lower right on
  `Q-1MA1-1706-3H-13`, and `0` lower right with the y-axis `−1` right of the axis on
  `Q-STA-KS2-2019-P3-10`. (On 2F-24b O went lower right with its x numbers, for the −1 above it.)
- **The voltmeter's wire runs straight through the meter** on three AQA chemistry figures
  (`…1F-072`, `…1F-073`, `…1H-061`). V now sits below the wire inside the circle; the drawing
  fault — a wire through a meter symbol — is the owner's.
- **The AQA 7408/3A key** (`…3A-034`, `…3A-035`) had no `text-anchor`, so `.qsheet .lbl` centred
  "experiment 1/2" on top of their own sample lines. Start, as written; but at about 63 units each
  label crosses a major ruling wherever it sits in 45.7-unit squares. **ACCEPTED; owner action: one
  `fill: var(--raised)` box behind each key**, which is a drawing change. "principal axis"
  (`…3BA-011`) had the same missing anchor and is fixed outright.
- **Labels wider than their slot:** "Negative carbon" (`Q-AQA-8464C-2406-1H-063`) is centred with
  under half a unit either side; "pencil line" (PR-CH06), "spring" (PR-PH06) and the wool label
  (PR-HM17) now sit above or over their pointers rather than across the beaker wall, the stand and
  a person. Shorter words would be the better fix.
- **Android.** Chromium's `serif` here is Liberation Serif — Times metrics, what an iPhone draws and
  what every drawing was laid out against. Android's Noto Serif is wider: `--face="DejaVu Serif"`
  (a face of about that width) named **381 collisions in 136 drawings** before this work and still
  names **304 in 129** after it, **116 of them a word past its box**. That is a
  font decision for the drawings (a bundled serif), not label placement, so it is a flag and not a
  failure.

No backend change, no sheet column, no stylesheet change. Pictures: before/after at 320 and 390 of
the Venn, the 247 Venn, both ruled grids, Earth–Moon, the 3A key, principal axis, the voltmeter, the
KS2 grid, and PR-FN02 / PR-CH07 / PR-HM17 — looked at, every one.
