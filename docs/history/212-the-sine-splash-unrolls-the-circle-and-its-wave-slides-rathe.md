## The sine splash unrolls the circle, and its wave slides rather than draws

**Asked for as "refine animation for sin circle thing".** `#splash-sine` was one period revealed by
`stroke-dashoffset`, which repaints the path every frame and restarts with a jump from a full wave to
an empty one. `tools/sine.py` now writes both the `<svg>` and its keyframes, like `tools/galton.py`:
the wave's x axis is the circle **unrolled** (one period is 2πr, so a point d to the right shows the
height the dot had d/r radians ago), the path is sampled from `sin()` and slides right by exactly one
period per turn, so the loop has no seam. A dashed guide carries the dot's height to where the wave
leaves the circle, a teal leg inside the circle draws sin θ where it lives, and everything moves by
`transform` alone. The un-animated geometry is the frame at θ = 60°, so reduced motion shows a
finished picture. Screenshotted at seven points in the 4s turn; `npm run splash` has it moving in
31 of 31 frames.
