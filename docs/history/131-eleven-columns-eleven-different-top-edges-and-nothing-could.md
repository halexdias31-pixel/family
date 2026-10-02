## Eleven columns, eleven different top edges, and nothing could see it because nothing looked across

**Reported as "Navigation is a bit buggy. When I swipe left and right on certain things I see the
edge are slid up or down at times. Happens with games and tools widget too."** Measured at 390×844
before anything was touched — the top edge of each column's current card:

| | | | | | | | | | | |
|---|---|---|---|---|---|---|---|---|---|---|
| make | tools | account | booking | reel | games | settings | stuff | feed | dm | saved |
| 98 | 108.5 | 117 | 125.5 | 167.5 | 199 | 223.5 | 255 | 286.5 | 322.5 | **343** |

**A 245px spread**, and screenshotted mid-swipe it is exactly the report: the calculator and the
chess card side by side with ninety pixels between their top edges.

### It is static, which is the half worth proving before changing anything

**"At times" reads as a drift and it is not one.** Sampled every frame of a real drag: every
column's `translateY` is constant through the whole gesture. Sampled for three seconds after
landing: unchanged. Four round trips between Tools and Games: the same two numbers, eight times.
What varies is WHICH PAIR of columns you are between — `stuff → feed` is 31px and reads as fine,
`settings → saved` is 120px and reads as broken.

**THE CAUSE IS THE CENTRING.** `columnShift_` was `boxH / 2 - (offsetTop + offsetHeight / 2)` — each
column centred on its OWN card — and the cards are different heights. Measured, every card's CENTRE
is at 422px, exactly half of 844. The centres agreed perfectly; the edges never could, and the edge
is the only part of a neighbour you can see.

### The line the tops agree on is the stylesheet's own reserve, not a number I picked

**`.pane` is capped at `100dvh − var(--bar) − var(--safe-bottom) − 2.5rem`**, so the stylesheet
already keeps a strip of the screen clear. The whole of that strip goes ABOVE the card, and two
things fall out of that choice:

- **the tallest card a pane may hold still fits** — its bottom lands exactly on the bottom of the
  screen. Proved at 320×568, where a card really is at the cap: bottom edge **568 of 568**. A line
  chosen by eye could not promise that at every screen height.
- **it leaves a sliver of the card above** — 20.7px at 390×844 against the 23px of the column beside
  it. The two axes peek by the same amount without either number being told the other.

**SPLITTING THE RESERVE WAS WRITTEN FIRST AND MEASURED.** Half above and half below — which is what
centring a cap-height card gives — puts every column on **18.5px**, and 18.5 minus the column's own
16px gap is **two and a half pixels of the card above**. Aligned, and the vertical affordance gone.
The reserve is small because the cap is generous, so halving it halves almost nothing.

| | tops: min | max | spread | tallest card's bottom edge |
|---|---|---|---|---|
| 390×844 | 36.7 | 37 | **0.3px** | 663.8 of 844 |
| 320×568 | 33.3 | 33.8 | **0.5px** | **568 of 568** |
| 768×1024 | 38.8 | 39.1 | **0.3px** | 683.5 of 1024 |

**WHAT IT COSTS, said rather than buried**: a card much shorter than the screen no longer floats in
the middle of it. The one-page columns are where that shows — Saved's card was at 343 and is on the
same line as everything else now, with the space below it rather than split above and below. That
is the price of a row of columns reading as a row, and it is one `return` to put back.

**And the peek ABOVE was the same fault down the other axis.** It was `top − 16px`, so it varied by
the same 245px: 92px of the previous card on Tools, 327px on Saved. It is 21px on every screen now.

### `COLUMNS OUT OF LINE` — the rule, because nothing here measures between screens

**Every geometry rule in `check/ui.js` measures ONE screen**, and this is a fault BETWEEN screens:
each column was individually perfect. So the question is asked once per width and visitor, after
every screen has been visited — there is no per-screen pass this could have been a line in.

**The tolerance is 2px and it is sub-pixel layout and nothing else**: the spread is 0.3–0.5px across
the three sizes, which is `offsetTop` rounding. A column with no page is skipped rather than counted
as zero — a screen this visitor cannot reach is not a column out of line.

**Proved by mutation**: the old centring back and it names six findings, at every width and both
visitors, worst **258.5px apart across 11 columns — dm at 373, stuff at 114.5** at 320px, and exits
1. The real files report nothing.

**And three notes described the centring in the present tense.** `columnShift_`'s own header, the
camera's note in `posts.js` and the state's note in `check/states.js` all said "centres"; the
mechanism the last two describe — a card that grows after its column was placed is a card the
placement never saw — is unchanged, and only the word was wrong. Corrected in all three rather than
in the one I happened to be editing, which is this file's own sentence about `cost: 0`.

### And the tap-target rule had been one translate away from thirteen false findings

**The first clean run of the aligned columns reported `TAP TARGET (13)`, every one of them printing
a size that passes.** `<button>.mc-btn.fn "sin" is 51x44` — flagged for being under a floor of 44 by
a report that says it is 44. A finding nobody can act on, which is the tell.

**Measured at full precision it is `43.99998474121094`.** `offsetHeight` is 44, `min-height` is
`44px`, `height` computes to `44px`. The control is 44px. What is not 44 is
`getBoundingClientRect`, which on an element inside a translated ancestor is the floating-point sum
of its layout position and the column's `translateY` — and the top and the bottom round the other
way from each other.

**SO IT IS THE INSTRUMENT AND NOT THE APP, and it has been one translate away since the rule was
written.** The columns were sliding by 108.5px, which happens to sum exactly; they slide by 33.8
now, and thirteen controls that had not changed by a pixel started failing. Proved by taking the old
`columnShift_` back — the thirteen go, and the six `COLUMNS OUT OF LINE` come back.

**Half a pixel, not a rounding.** `Math.round` would wave a real 43.5px control through. Everything
genuinely under the floor in this app is 38, 40, 20 or 13, so half a pixel is nowhere near any of
them and is below what a screen can draw or a stylesheet can mean. **Proved by mutation**: forcing
`.mc-btn.fn` to 43px names all of them and exits 1.
