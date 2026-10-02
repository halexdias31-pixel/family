## AQA Physics 8463/2H, and the check that could not see inside a drawing

**43 questions against `Mark scheme (Higher)_ Paper 2 - June 2024`**, read rather than derived. The
cover says 100 and the scheme's own `Total Question n` lines say 13, 14, 16, 14, 9, 8, 18, 8; both
are asserted in `tools/insert-aqa-physics-8463-2H.py` before a row is written. So are the numbers
the scheme prints back inside its own working — ½ × 56 × 220 = 6160, 56 × 380 = 21 280, 36 ÷ 120 =
0.3, 110 000 000 ÷ (1026 × 9.8) = 10 940, 3.6 × 10¹⁷ ÷ 3.0 × 10⁸ — because a scheme can be
mis-READ, and a number mistyped into the script now fails there instead of shipping.

**Four figures are drawn and seven are described, and the line between them is the one this file
already draws twice.** Figure 2 IS Table 1 plotted, Figure 7 is one triplet of absorption lines at
three shifts, Figure 9 is four letters at 45°, 90°, 135° and 180° round a circle, and Figure 12 is
five coordinates the mark scheme quotes back — each is a drawing instruction with exactly one
answer. The baby walker, the gears, the submarine, the headlight, the trolley runway, the ammeter
demonstration and the microphone are apparatus photographs: they carry `figure` so
`check-library.js` counts them, and what they show is said in prose. **Figure 7 is built from one
base triplet and two offsets** rather than nine independent lines, because "the lines have the same
pattern" is the question's own first sentence and a picture whose patterns did not match would
contradict it.

### `check/cards.js` was measuring inside the drawings, and CLAUDE.md already said why that is wrong

**It reported 5 rows up to 21px past the column and every one was a false alarm.** A y-axis label is
written once and rotated into place — `<text x="12" … transform="rotate(-90 12 98)">` — so its
LAYOUT box runs from x = −51 while the glyphs it paints sit at x ≈ 12. **That is this file's own
entry under `.mat-out`**: *"a transform is invisible to `scrollWidth`"*, which cost two wrong fixes
the first time and would have cost the axis labels this time.

**And nothing inside an `<svg>` can push the page sideways at all.** The outermost `<svg>` clips to
its viewport — the UA default, not a rule this repository set. So the rule is narrow and provable:
the `<svg>` is an ordinary replaced element in the HTML flow and is still measured; its descendants
are not. **Proved by mutation in both directions** — forcing `.qsheet figure svg { width: 400px }`
still fires, on the `<svg>`, at +104px across 66 rows.

**`className` on an SVG element is an `SVGAnimatedString`, not a string**, so every finding inside a
drawing printed as `[object Object]` — one grouping key for every cause, in the one report whose
grouping exists so that fifty rows with one cause are one line.

### A screenshot caught two more, and neither measured wrong

**`text-anchor` as an attribute lost a specificity race it did not look like it was in.**
`.qsheet .num` sets `text-anchor: middle`, and **CSS beats an SVG presentation attribute** — so
`text-anchor="end"` on the y-axis numbers did nothing and all ten sat centred on the axis line.
Same shape as `.price.faint`: it reads as a decision and behaves as nothing. Inline `style` now.

**The same fault clipped the Earth's own layer names.** `Liquid outer core` is the widest text in
Figure 9; anchored `middle` instead of `end` it ran off the left of the viewBox and the `<svg>`
clipped it to `quid outer core`. The Earth sits right of centre now so the three names have room to
read leftwards off their leader lines. **Seventh time this file writes that a screenshot is the last
word on a drawing.**

**And a plot is sized by how many labels it has to carry.** Ten values up a 136-unit axis at the
13px this stylesheet sets for `.num` is ten labels in the space of ten labels, which came out as a
grey smear. Both graphs go through one `axes()` now — one scale placing the marks, the ticks and the
labels — and the box height is derived from the label count rather than guessed.
