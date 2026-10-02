## The loading screen does not stutter, and four of them stop

**Asked for on the whiteboard as "make animations more stable for loading".** There were two
candidate answers and the measurement says one of them is not true, which is the half worth writing
down first.

### The one that is not true, and it had a convincing diagnosis behind it

**`index.html`'s case for the splash is that *"the animation is CSS, so it runs even while the main
thread is busy parsing eighteen files"*.** That is true of `transform` and `opacity` — the
compositor runs those on its own thread — and false of a `background`, a `box-shadow`, a colour or a
`width`, which the MAIN thread recomputes and repaints. The same thread parsing 566KB of JavaScript
and decoding a 3.4MB library at exactly that moment.

**Asked of the browser via `getKeyframes()`, 23 of the 39 splashes animate at least one property the
compositor cannot run**, and the worst — the times table — runs **47 `background`-and-`box-shadow`
animations at once**. That reads exactly like a diagnosis.

**It is not one.** Measured at the moment of boot, with the payload never answering so the splash
stays up, and the CPU throttled to 6x and then to 20x: **every splash moved in every frame** — the
47-animation one exactly as much as the pure-`transform` one, 44 of 44, at both throttles. There is
nothing to fix, and writing the fix on the strength of the property list would have been the
`.mat-out` mistake for a third time: two rules changed on a reading nobody had taken.

### The one that is: four of them hold a still picture

**Measured at full speed, where nothing is competing for anything:**

| | identical to the frame before | longest hold |
|---|---|---|
| `is-sf` | **55%** | 1000ms |
| `is-tri` | **42%** | 1250ms |
| `is-cent` | 35% | 500ms |
| `is-half3` | 35% | 500ms |

**`index.html` has already deleted a splash for exactly this** and its own sentence is the standard:
*"it read as a tartan square holding still, which is a picture rather than an animation, and a
loading screen that looks frozen reads as an app that has."*

**A hold is not automatically a fault, which is why this prints and does not fail.** `is-sf` is
standard form: the decimal point hops five places and the exponent counts up with it, and the last
third of the cycle is the answer being held for somebody to read. That beat is the point of the
animation. Shortening it means clearing the exponent as the point hops back, or the splash shows
`3.42 × 10⁴` with the point at the start — **wrong maths on a teaching screen, which is worse than a
still one**. Which of these four is a rhythm and which is a freeze is a judgement about the
animation, and the pool is the sheet's: `splashOff` is read by the picker in `index.html` before it
picks, so retiring one is a row rather than a deploy.

### `npm run splash` — and the first version of it measured the wrong splash

**It sets the pool rather than the element.** The first version set `#splash`'s class from a
`DOMContentLoaded` handler, which runs AFTER index.html's own inline picker and its replay loop — so
the replay had already captured the animations of whatever the coin chose, and the run reported
`is-trick` frozen for 5.75 of 8 seconds with 0 restarts. **Both numbers were the harness.** Seeded
through `splashOff`, which the picker reads before it picks, `is-trick` is still for 250ms and its
replay fires 20 times in 10 seconds — it was the one splash working exactly as written.

**Identical PNG bytes is the whole test**, and it is the only question that can tell a compositor
animation from a main-thread one: a page can be busy and still be moving, and a page can be idle and
be a photograph.

**Not in `npm run check`**, for `check/load.js`'s reason: it drives a real browser for six minutes
and its answer moves with what else the machine is doing. `npm run splash`, and a person reads it.
