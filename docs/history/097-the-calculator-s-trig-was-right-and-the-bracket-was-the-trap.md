## The calculator's trig was right and the bracket was the trap

**Reported as "calulator sin cos and tan doesnt really work".** Measured before changing anything:
`sin(30)` is 0.5, `cos(60)` is 0.5, `tan(45)` is 1 — all correct, in degrees, which is what a GCSE
paper wants. **`sin(30` with no closing bracket is `Error`**, and that is the whole complaint: the
`sin` key puts in `sin(` and every calculator anybody has held closes it for them. Press sin, 3, 0,
= on a Casio and you get 0.5.

**Only at `=`, and only the ones left open**, so nothing is added to what is on screen while it is
being typed and a balanced expression is untouched. Measured after: `sin(30` → 0.5, `sqrt(16` → 4,
`2 × sin(30` → 1.

**AND `window.math` IS NEVER LOADED BY ANYTHING HERE.** Measured across `index.html` and every file
in `js/`: nothing fetches a maths library, so the `if (window.math)` branch has never run once and
the hand-rolled fallback is what the calculator has always been. The branch stays — it is the right
thing to use if one is ever added, and deleting it would leave the fallback looking like a fallback
for nothing — but it is written down, because a live-looking branch that cannot run is the shape
this file records under `resource_type` in `VOCAB` and the dead `kind === 'paper'` guard.
