# A drawn answer is marked by its geometry

The owner, 19 Oct, on the drawn answers 362 left "sent for marking": *"I don't want a person to mark
them. It should all be able to be marked like that other stuff. Especially corbet maths stuff should be."*

## What changed

Check now stands under the pen wherever the row has `draw_answer`, and marks the strokes there and then:
a verdict and marks, recorded like a typed answer (`right`/`wrong`, or `rule:got/of`, said "· by the
drawing"). A drawing-only part without `draw_answer` keeps 362's Send.

- **The figure's frame** (find.js `drawFig_`, `frameOf`). The strokes are stored in the pen's 340 × 340
  space over the figure's viewBox. Figure units come from the figure itself: each axis by its own numeric
  labels (a least-squares line, the step rounded to 1, 2, 2.5 or 5 a square, snapped to the grid lines;
  a y label's baseline sits about 3.5 units under its line, and an x-axis label is never read as a y one);
  an axis with no numbers counts grid squares from the bottom-left (y up); no grid, the viewBox's own units.
  `draw_answer.frame` overrides it (`{o, u}`, `"vb"`, `"grid"`) — 12 rows needed one, where a figure's
  labels sit off its ticks or name too few lines.
- **The ink** (`inkOf`): each stroke a polyline, its corners (Ramer–Douglas–Peucker) snapped to the grid's
  intersections within 0.22 of a square — 357's snap read back.
- **The kinds** (`drawMarker_`'s `KIND`), tolerances in grid squares (0.3 by default; 20 viewBox units a
  "square" off a grid): `pts` (crosses, dots, or `onink`), `segs` (segments, a closed `poly`, a `path`
  curve; `move` anywhere, `turn` any way round, `fity` a sketch's height fitted, `head` a vector's
  arrowhead, `cover` for a dashed line, `also` for ink allowed on given lines), `line` (a line of symmetry),
  `cells` (shading, by the ink inside each cell: a count, an exact set, `given`, `touch` for shared sides),
  `radius`/diameter, `dir` (a direction to a given line, a length), `pair` (two parallel lines), `angle`,
  `polygon` (sides, kite, scalene, isosceles, right, acute, equilateral, square, two lines of symmetry,
  diagonals perpendicular or not, area, SAS at any size, corners on dots — a lattice as two steps),
  `cuboid` (isometric outline, a·b·c = volume), `clock`, `dial`, `scale`, `pie`, `hist` (bars, `fx`/`fy`
  when the axis has no numbers, `seq` for a bar chart), `box` (box plot at any height), `interval`
  (number line, circles filled or open), `area` (pictogram symbols), `curves` (construction arcs),
  `sketch` (rising, above the axis, crossing, asymptotes), `inside` (a region shaded or labelled), `any`.
- **Marks**: each item has `m`; its `or` is what the scheme gives fewer for (the right shape in the wrong
  place, three of four vertices, the points plotted but not joined). Ink no item accounts for costs a mark
  unless `loose` (labels, regions, pie charts).
- **Health**: `ableOf_` counts a part with `draw_answer` as machine-marked.
- A drawing with `mark_words` is marked by its box: `answerKinds_` ignored `mark_words`, so 1706 2H Q9
  showed only the pen and Send.

`tools/draw-answers.js` writes every row's `draw_answer` from its mark scheme (safe to re-run), and the
field changes for the parts better typed.

## Counts

| | Corbettmaths primary | GCSE Maths F & H |
|---|---|---|
| drawn, sent for marking — before | 73 | 88 |
| marked by geometry — after | 72 | 74 |
| made a box — after | 1 (a net's six numbers, `rule: pairs prod 100`) | 14 (5 Venn diagrams and 6 tree diagrams as cells; a sketch's numbers ×2 and a solid's name and size as cells; a choice of five places for brackets) |
| drawn, sent for marking — after | 0 | 0 |

## What the screen cannot be, and what is lenient

- **Lengths without a scale**: the full-size triangles (Corbettmaths angles 14, 15) and the pyramid's
  front elevation are marked as the right shape at any size — two sides' ratio and the angle between
  them. "Draw a 5 cm line" now draws on a 1 cm grid and says so. The 4 cm square is marked as a square.
- **Written labels are not read.** A mark the scheme gives for a label (a pie chart's sectors, a bar
  chart's key, R, the vector's name, 2ˣ's (0, 1)) is given with the geometry it labels.
- The dual bar chart (2406 1F Q7) is marked as a dual bar chart; the scheme's other charts are not read.
- The turned cube (Corbettmaths nets 7) reads the answer's own words for which halves are shaded.

## Proof

check-marking: 81 drawing cases over 25 kinds (a right drawing, a near miss, both edges of a tolerance),
the frame read off a numbered grid, and `pairs prod`. check-flow: Reflections Q7 drawn by hand in the
real card is Correct and recorded; reflected in the wrong axis it is Not yet; every row with
`draw_answer` marks its own right drawing (`example`) in full in the card; no drawing-only part in either
set has Send; the boxes made from drawings mark their own scheme right.
