# 357 — A point put down exactly with a finger

18 Oct 2026. Amends 338 (the finger pen). Builds on 356 (the drawing is on its own figure, in its card).

## What the owner asked

Over Q7 of the June 2024 Foundation paper 1, an empty grid: *"even if it was perfect how are the students
supposed to answer it by using there fingers to draw such a fine line at time? Shouldn't we implement best touch
strategies to make it work? Like magnify or manipulate acceleration when drawing? Idk? But I image you can find
out."*

## The baseline, measured before a line was written

Real touch through CDP at 390x844, DPR 2, 4x CPU. Six taps aimed at grid intersections, each landing at the aim
plus a uniform ±4px wobble on both axes and moving 4-6 more times by the same wobble, 16ms apart:

| Grid | Square | On the intersection |
|---|---|---|
| Q7 (`<line>` with no class) | 17.2px | **0 of 6**, every tap a five-point squiggle, the last point 0.8–5.8px off |
| Q-1MA1-2005-1H-12b (cumulative frequency, `path.grid`) | 3.3px | **0 of 6**, 1–2 squares off |

And only 5 of the 224 grid pads offered a Ruler; Q7 offered the pen alone.

## The research, and what was taken

- **Snapping.** Baudisch et al., Snap-and-go (2005): alignment 138% faster in 1D and 231% in 2D. Fernquist,
  Shoemaker & Booth, Oh Snap (2011), on touch: about 40% better, the object staying under the finger. GeoGebra
  snaps a point to the grid once it is close enough. **Taken**, for placements.
- **A loupe over the finger.** Vogel & Baudisch, Shift (CHI 2007): a callout showing the area under the finger
  with a pointer at the point the lift will keep, escalated only where the target is smaller than the finger
  hides. **Taken**: the loupe.
- **A fixed slow gain.** Benko, Wilson & Baudisch (CHI 2006): X-Menu's "slow 4x" under 5% error for 2px targets in
  every noise condition; US8896561 moves the object at ¼ of the finger. Albinsson & Zhai (CHI 2003),
  Precision-Handle. **Taken**, relative, for fine grids.
- **Declined:** Benko's dual-finger techniques (338: two fingers do nothing — every palm rule rests on it); an
  offset cursor that is always on (Potter et al. 1988; 338 §9: an offset makes a band of the picture
  unreachable, and children expect ink under the finger); a speed-dependent gain or the 1€ filter — a
  fingertip's wobble is independent from one sample to the next, so its instant speed is high and the gain would
  follow the wobble, and Benko warns that a varying cursor speed makes steering hard; pinch-zoom (338 §9) —
  revisit if `plotfine` fails outright at 320 (below).

## The rule: only placements are transformed

A **placement** is a dot (a touch that has gone less than `PAD_DOT_PX`, 12px, from where it landed — the worst
case of ±4px wobble is 11.3px), the ruler's two ends, and the compass's pin and radius. A freehand line is never
transformed: it stays under the finger, every sample is kept, nothing snaps or filters it, and 338's smoothing
draws it round. The board never snaps. `padTrack_` still sees the raw finger, so the palm rules, the two-finger
rule, the 30px hand-over and the race are exactly 338's. Every transformed point is SHOWN before the lift — the
dot on the intersection, a halo round a snap that is holding, the loupe's crosshair — which is 338's "a preview
is a promise of what the lift keeps".

- **The grid** (`padGrid_`, from the picture's markup; `padLattice_` on the screen): level and upright `<line>`s
  and `M`/`L`/`H`/`V` path segments, class or none, each spanning a quarter of the picture, at least 5 evenly
  spaced per axis (the run's spacings within 15%). A bar chart's bars and an axis's ticks are not a grid
  (check-flow asks). 188 of 387 pen pictures with a figure read as a grid, plus every made-up squared surface.
- **Snapping** (`padSnap_`), in 338 §8's order: your own marks (and an earlier part's, `.qpad-was`), then the
  grid's intersections, then the figure's `.pt` centres (none in the library today). Radius = min(cap, 0.45 x the
  nearest neighbour, the grid's square included) — cap 24px for own marks, 20px for the rest; released at 1.25
  radii; targets within 2px merged. Stored as round() of the target: at most 0.6px off on the tallest figure, and
  still whole numbers (check-flow's "unrounded points"). Q7's radius is 7.7px, the made-up grids' 7.3px, and the
  worst radial wobble 5.66px.
- **The ruler** locks level or upright within ±6°, and then only its free end's other coordinate snaps to a grid
  line — how a bar's side lands on the grid.
- **A Ruler on every grid** (`padToolsOf_`, from the picture; `padTools_` unchanged, so check-library's counts of
  what the rows ask for are unchanged).
- **The slow mode** on a grid whose square is under 13px (56 of 196 at 390, 111 at 320): point = anchor +
  gain x (finger − finger's anchor). On for a dot and a pin from the landing, for a moving end once the finger
  has moved under 5px in 120ms; off once the finger is 40px from its anchor; the point never more than 48px from
  the finger. 40px and not the 24 first planned: correcting the worst landing (5.66px) at a fifth needs 28px of
  finger, plus its own wobble.
- **The loupe** (`padLoupe_`, on `<body>`, fixed, `pointer-events: none`, `aria-hidden`): a copy of the picture
  taken once a stroke, 128px across, zoom clamp(2, 12 / square, 4), centred 112px above the finger, beside it near
  the top, never below. Its crosshair is the point to be stored (`data-at`). At once on a grid under 13px and for
  a ruler or compass on any grid; elsewhere after 300ms within 10px at a stroke's start or 400ms within 8px in the
  middle of one. Hidden while held, while two fingers are down, and while the stroke is not known to be the one
  drawing; gone at the lift, a cancel, `padDrop_`, the page going away. Written only in `padFrame_`.

## Tuning the gain (`plotfine`: closed loop on 12b, the finger following the crosshair with ±4px wobble, three seeds)

| Gain | 390 (3.27px squares): exact within 1.5s | mean | 320 (2.12px): exact within 1.5s | mean |
|---|---|---|---|---|
| 0.5 | 1 of 18 | 5,503ms | 0 of 18 | 6,083ms |
| 0.33 | 14 of 18 | 1,233ms | 1 of 18 | 5,653ms |
| 0.25 | 18 of 18 | 756ms | 9 of 18 | 1,940ms |
| **0.2** | **18 of 18** | **712–770ms** | **17–18 of 18** | **944–947ms** |

So `PAD_GAIN` is 0.2. At 320 it is printed, not judged (one run gave 17 of 18): close enough that pinch-zoom is
not yet earned, and the first thing to look at if a phone reading disagrees.

## After

| check/pen.js | Before | After |
|---|---|---|
| plot, Q7 and a made-up grid, 3 seeds | 0 of 6 | 6 of 6, every seed |
| rulersnap: both ends, and a bar 3° off upright | — | exact, stored upright |
| curve: six dots, then a curve through them | — | the finger's own samples, within the wobble + 1.5px, 3px of each dot, sharpest 12px-vertex turn under 40° |
| loupe | — | first frame on a fine grid, not at 150ms and up by 500ms on Q7, follows in 100% of frames, nothing from a second finger |
| samples with the loupe open | — | 0 forced layouts, 2 live writes a frame, 100% painted in the first frame |
| every 338 section | pass | pass, unchanged |

Mutations, each red on its own: snapping off (plot 0 of 6, and check-flow's arithmetic journey), gain 1
(plotfine 0 of 18), a line snapped (curve), the loupe shown while held (loupe), the loupe written inside the
event (samples: 88 of 102 events forced a layout), `.pad-loupe .grid` dropped (check-css).

## What this amends in 338

- §2 and §8, *"the pen never snaps"*: a placement snaps, shown before the lift; a line never does; the board never does.
- §8, *"the grid lattice waits for zoom"*: it does not — a lattice under 13px gets the slow mode and the loupe.
- §9's refusals of *"a tap stored as one point"* and *"a loupe placing a point"* ("changes ink the child saw"):
  the child now sees the one point, and the loupe's point, before the lift, so nothing stored differs from what
  was shown. The offset cursor stays refused: the slow mode is relative and starts under the finger.
