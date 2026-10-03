## The coin looks like a coin, the sieve works prime by prime, and somebody bumps the blocks

**Asked for as "make the coin look more like a coin in coin animaiton", "refine what is left is
prime animation." and "refine super mario animation".** Three splashes, rebuilt together, and each
had failed in one of the same three ways: a one-shot with an `infinite` glow after it (so
index.html's replay loop, which leaves anything infinite alone, never ran the story again), a
property the compositor cannot run, or a still that was not the answer.

### The coin (`tools/coin.py`, `.cn-*`)

The toss was right and the object was not: gold on one face, MINT on the other, both on one plane,
so edge-on it was a hairline. Now both faces are one metal — a milled edge from a repeating conic,
a raised rim (a bevelled border lit top-left), a field with a specular highlight, a ring of dots,
and the H and T embossed by a light and a dark text-shadow. No head, no date, no legend: nothing a
real currency would carry. Thickness is six discs stacked in Z inside the `preserve-3d` coin, so
edge-on it is a gold band about .3rem deep; they ride the toss that was already there. The toss
keyframes are byte-for-byte unchanged. The tally keeps its teal T — it is a code, not the coin.

**And the reduced-motion still was never the still.** `coin.py` wrote `style="animation-name: …"`
on twenty elements, and an inline declaration beats `animation: none` in the stylesheet — so with
less movement asked for, the coin stood still and the tally and the count kept animating. Measured:
`getComputedStyle(.cn-m).animationName` was `cn-m0` under `prefers-reduced-motion: reduce`. The
generators now write `--kf: name` and one rule says `animation-name: var(--kf)`; it reads `none`.
**`#splash-gal` still does it** (16 inline names, `tools/galton.py`) and is not in this area.

### The sieve (`tools/sieve.py`, `.sv-*`)

It struck 4, 6, 8, 9, 10 … in position order at a fixed step, so the method was never shown; the
strike overhung each digit by 8% and grew `width`, so 8-9-10 and 14-15-16 merged into one red bar;
the fade animated `color`; it ran once in 1.2s and then pulsed. Now, in one 7.2s loop on the same
single line: 2 is ringed and its multiples struck in 2's colour (gold), then 3 and its multiples in
3's (blue) — 9 and 15 struck, 6 and 12 given a second, lower line because 3's walk lands on them
too — then it stops (5 × 5 = 25 > 17) and 5, 7, 11, 13, 17 are ringed in green. The caption steps:
*multiples of 2*, *multiples of 3*, *what is left is prime*. Then it clears, so 100% is 0%. Each
strike is its own `<s>`, digit-wide, drawn by `scaleX` from its left end; digits fade by opacity.
At 320px the row is one line, right edge at 292px.

### The blocks (`tools/blocks.py`, `.mb-*`)

Measured before touching it: the coin filled BACKWARDS onto the row for its 1.45s delay; it was
pinned to the stage at `left: 50%` + 6.2rem while flexbox centred the blocks, so it rose between
blocks 7 and 8; the letters painted over the face (a child over its parent's background); nothing
hit the blocks; and `mb-idle` hovered for ever on `box-shadow`, so the bumps never replayed.

Now there is a runner — **our own**, a student in a gold mortarboard, 8 × 11 pixels in two SVGs
with `crispEdges`, in the app's gold, paper, coral, dim and ink. No plumber, no ? block, no pipe,
nothing of Nintendo's. It runs in, hops under each block with the apex on the bump — the old .17s
rhythm, shifted .35s later to give it room to run in — and runs off. Measured at the third bump:
its head meets the block's underside within 0.04px and its centre is within 0.05px of the block's,
at 320 and at 390. The coin lives inside the eighth block (centre offset 0), behind the face. The
face is `.mb-block::before` with `z-index: 1`, so letters come out from behind it. The whole thing
is one 6s loop: run, bump, spell, coin, hold, letters drop back in left to right, repeat. The
stage is `overflow: hidden` so the runner enters and leaves by its edges. The orphaned description
comment, 600 lines above the markup, moved down to it. Reduced motion shows the spelt row with the
runner standing under the full stop.

**The replay hack in index.html stays.** It is generic and other one-shot splashes still use it;
what went is this splash's own workaround for it, the infinite hover.

### What holds it

`js/check-css.js` section 9, a registry of splashes built as one loop (`coin`, `sieve`, `blocks`):
keyframes animate only transform and opacity, every animation is `infinite`, there is a
reduced-motion rule, and no keyframe name is set inline. Then one rule each: the coin's faces set no
colour of their own and it holds ≥4 edge discs; the sieve's markup IS a sieve (each composite struck
by its smallest prime factor, primes ringed, nothing above 3, the second line only where a later
prime divides) and the run says `nowrap`; the coin sits in the last block, `.mb-block` paints no
background, its face has a positive z-index, and the runner exists. Run against the old files it
reports 26 faults for coin and sieve and 10 for the blocks, each the bug above. `npm run splash`:
coin 27/31 frames moved, sieve 27/31, blocks 23/31 (the longest still is the 1s the name is held).
