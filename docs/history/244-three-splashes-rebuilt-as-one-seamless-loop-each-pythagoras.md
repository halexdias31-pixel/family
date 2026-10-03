## Three splashes rebuilt as one seamless loop each: Pythagoras, the π circle, the index laws

**Asked for as "refine the pythagoras animation", "refine the pi circle animation. make it better."
and "refine indicies loading animation".** None of the three had changed since 19 September, and
each was measured on the real page before anything was touched.

### Pythagoras (`#splash-pyth`, now `tools/pyth.py`)

**What was wrong.** The three squares grew once and then an idle ran a dash round the triangle: a
dash 12 long on a perimeter 12 long, so once every 2.6s the triangle the proof is about was wiped
out completely. Because that idle was infinite, index.html's replay loop (which leaves alone any
splash with something endless in it) never replayed the build, so after about three seconds the
wipe was the only thing moving. The viewBox ran -1.2..12.2 round content at 0..10, so the drawing
sat about 9px left of its caption.

**What it is now.** A generated splash, like sine, venn and galton: `python3 tools/pyth.py` writes
the `<div>` in index.html and the rules in style.css from one triangle. The squares on the legs are
unit cells, 3 x 3 and 4 x 4, and the square on the hypotenuse is an empty 5 x 5 grid. The 9 cells
fly into the corner of it they already touch, the 16 fill the L that is left (5² − 3² is a band two
wide), and only when the last cell lands does the 25 appear, in the picture and in the sum under it.
Then they fly home. Which cell goes to which slot is a minimum-total-travel assignment, so no cell
crosses the square past one going the other way. Every cell moves the way `#splash-ang`'s corners
do: drawn at (0,0), `transform-box: view-box`, one translate-then-rotate string per cell for
`--from` and `--to`. One 7.6s timeline, every animation infinite, and the loop starts and ends on
the same frame. Nothing touches the triangle. The big square is the app's `--gold`; the two small
ones are the drawing's own teal and blue, named on `#splash-pyth`. Reduced motion is the base
styles: the 25 cells in the big square, the sum complete.

**Measured.** Frames at 0, 1, 2, 3, 4.5, 5.5, 6.5 and 7.6s at 320 and 390 wide: the 0s and 7.6s
PNGs are byte-identical at both widths, and the splash box has 41.6px either side at 320 and 61.6px
at 390 — centred, nothing clipped.

### The π circle (`#splash-area`, now `tools/area.py`)

**What was wrong.** It was a 3s opacity cross-fade between a drawn 10-slice circle and a drawn strip:
no slice ever moved, so the rearrangement that IS the proof never happened, and mid-fade (0.9s,
2.8s) both pictures overlapped as a muddy double exposure. The slices were shaded alternately, so
nothing said which arcs became the top edge, and "half the circumference = πr" was never shown. The
circle sat at x = 30 in a 96-wide viewBox, about 44px left of the caption. A comment in the svg
forbade moving slices because a hand-made transform had once broken.

**What it is now.** `python3 tools/area.py` writes the svg and its rules. 12 slices, the top half
`--gold` and the bottom half teal. They TRAVEL — each pivoting on its own point, the short way round
— from the circle down into the interlocking strip: gold arcs along the top, teal along the bottom,
peeled from 9 o'clock so the circle's top edge is read left to right as the strip's. When the last
slice lands, `r` appears up the strip's end and `πr` over the gold edge, in gold; they go as the
slices leave. A faint ring and faint slots stay where the slices are not, so either picture says
where the pieces belong. Moving the slices was made safe the way `#splash-ang` did it: drawn with
the point at (0,0), `transform-box: view-box`, one generated translate-then-rotate per slice. The
generator asserts the interlock (each gold point on the end of a teal arc) and that circle and strip
share the box's middle. One 6.4s timeline; reduced motion is the strip with r and πr marked; the
caption is `A = πr × r = πr²` with πr in the gold it measures. The second pass with twice the
slices (the audit's optional step) was not built: at 320 wide 24 slices are 4px chords and the
point of the picture, which half went where, is already carried by the colours.

**Measured.** Frames at 0, 0.7, 1.2, 2.5, 4.6, 5.2 and 6.4s at 320 and 390: 0s and 6.4s
byte-identical at both widths, 45.3px either side at 320 and 69px at 390, nothing clipped.

### The index laws (`#splash-index`, now `tools/index.py`)

**What was wrong**, measured frame by frame: (a) two clocks — the tiles lit from 3.44s to 5.04s on
a delayed 4s cycle, but the groups were joined only from 1.76s to 4.0s, so tiles 4 and 5 lit after
the groups had parted again, with the × back between them; (b) a snap at the seam — `ix-close` and
`ix-go` had no return leg, so at 4.0s the second group jumped 22px right and the × popped from 0 to
1 in one frame; (c) the join moved only the second group, by a fixed 1.5rem that ignored the ×'s
width: 1.1px between tiles 3 and 4 against 4.4px elsewhere, and the row 11px left of centre; (d)
a⁵ was in the caption from the first frame, so the 5 was never reached. It also had no
reduced-motion rule at all, and lit the tiles by animating `border-color` and `color`.

**What it is now.** `python3 tools/index.py` writes the markup and the rules from one list of times,
and asserts the count sits inside the join. One 6s loop: open, the groups close (each by half the
exact distance, 2·gap-beside-× + × − gap-between-tiles, all four custom properties) as the × fades;
then, joined, the tiles are counted 1 to 5 at 0.4s steps, each lit by a gold ring fading in over it
with its numeral under it; a⁵ is written in the caption as the fifth is counted; held; everything
clears together; the groups part and the × comes back, ending on the first frame. Opacity and
transform only. Reduced motion shows the joined row, counted, with a⁵ written. Kept to the
multiplication law only, the audit's default: three laws cycling in one box would need captions
that change every two seconds on a screen that is up for about two.

**Measured** in the browser at 320 and 390: every gap between tiles 4.05px (320) / 4.44px (390)
once joined, including between 3 and 4; the row's centre 0.01px from the viewport's at both; at
5999, 6000 and 6001ms the gaps and the ×'s opacity are identical (no snap). Frames at 0, 0.8, 1.5,
2.3, 3.4, 4.8, 5.6 and 6s: 0s and 6s byte-identical at both widths.

### The check

`js/check-splash-loops.js`, in `npm run check`. `npm run splash` asks only whether the picture
changes between frames, and a wipe, a snap and a cross-fade all change the picture — so it passed
every fault in this note. This reads the keyframes instead, for each rebuilt splash: every
animation infinite and on the splash's one duration; every keyframe's 100% says what its 0% said;
only `transform` and `opacity` animate; no `stroke-dash*`; every animated selector switched off
under reduced motion; the drawing centred in its viewBox and inside it. Then one sentence per
splash. Pythagoras: 9 + 16 cells landing on 25 different places, and the triangle never animated.
The circle: every slice ends somewhere other than where it starts, the slices' keyframes never touch
opacity (the cross-fade), and every gold slice lands arc-up and every teal one arc-down, the same
number of each. Run against the old files it reports "nothing travels". The index laws: the
distance is the formula and the gaps are the variables it is built from; every tile's light, from
starting to rise to fully gone, sits inside the stretch where both groups are fully joined; a⁵ is
written no earlier than the fifth tile; five tiles numbered 1 to 5. Against the old files it
reports the border-colour animation, both seams, the missing reduced-motion rule and the fixed
1.5rem; a light moved past the join, the old 1.5rem distance and a⁵ timed with the first tile are
each red on their own.
Proved by putting the dash wipe back, dropping the 100% stop, restoring the old viewBox and landing
two cells on one slot — each red for its own reason, green again on the real files.
