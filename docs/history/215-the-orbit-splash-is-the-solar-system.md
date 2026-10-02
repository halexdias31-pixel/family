## The orbit splash is the solar system

**Asked for as "refine the orbit animation around the circle. maybe make it the solar system."**
`#splash-orbit` was one orange dot on one ring. It is now the Sun and the eight planets in order,
drawn by `tools/solar.py` from one table into both the `<svg>` in index.html and the block in
style.css — edit the table and re-run it, as with `galton.py` and `sine.py`.

**The periods are real ratios and the radii are not.** Each period is Kepler's T ∝ a^1.5 off the real
semi-major axis, scaled so Earth's year is 4s: Mercury 0.96s, Mars 7.5s, Jupiter 47s, Neptune 660s,
so the inner four visibly go round and the outer four barely move, which is true. Orbits are evenly
spaced so all eight fit in 11rem. Each planet is drawn at its own starting angle and its `<g>` turns
anticlockwise about the Sun, so every orbit is its own seamless loop, it moves by `rotate` only, and
reduced motion shows that spread (`.or-p, .or-ring` are on the shared reduced-motion list). Saturn's
ring counter-turns about the planet so it keeps its tilt, back half behind the planet and front half
across it. `npm run splash -- is-orbit`: moved in 23 of 23 frames.
