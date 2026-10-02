## A line of best fit slid the whole column sideways

**Reported as "when i try draw a line of best fit it slides the whole widget to the left and becomes
hard to do".** Reproduced on the first try with real touch events: a stroke across a scatter graph
with the pen on carried the app from `stuff` to `dm`, and the mark was kept, on the wrong screen.

**`touch-action: none` STOPS THE BROWSER AND NOT THIS APP, and that is the whole of it.**
`.qpad.is-drawing .qpad-ink` has carried it since the pen was written, and the note over that rule
is right about what it does. **The grid's swipe is a `pointermove` listener on the window.** It never
asks the browser for a scroll, so no `touch-action` anywhere can refuse it — and a line of best fit
is precisely the stroke that travels furthest sideways.

**`axisFree` already names the list**: `select, [data-noswipe]`. So the pad says the same sentence to
the app that the stylesheet says to the browser, and it says it in the one place both readers of
that list already look — rather than a third selector for somebody to keep in step.

**Only while the pen is on**, which is the stylesheet's own argument one rule up: a picture you
cannot swipe past is a picture that traps you on it, and every question card carrying a diagram
would become a page with no way off. **Measured both ways**: pen on, the stroke is kept and the
column does not move; pen off, a swipe left over the same picture still changes column.

**And the mode is drawn from `PAD_ON` now rather than left on the element by the press.** A repaint
rebuilds the card, so the class the tap added went with it while the state stayed — leaving the pen
taking the finger with no gold frame, no `touch-action` and no `data-noswipe`. That is the
`REEL_HELD` fault for a second time, on the surface where it is least visible.

### The instrument said nothing, twice, and the second time it was the state

**`check/press.js` has driven real drags since it was written and every one starts on bare card.**
It also drives real TOUCH events, added for the blanket `pan-y` on every textarea — and that pass
walks a named list of surfaces that carry their own touch behaviour. A pad is not on it, because a
pad's problem is not that it keeps a gesture it cannot use; it is that it cannot keep one at all.

**So the contract is the fault's own shape**: press `Draw on it`, stroke across the picture, and want
two things — the stroke is kept and the column has not moved — then turn the pen off and want the
opposite. Proved by mutation: without the attribute it names the column it slid to.

**And the tap that turns the pen off has to be a REAL tap.** `el.click()` reported the pen stuck on,
and the app was right: the stroke before it set `PRESS_MOVED`, and a synthetic click cannot clear
that because nothing sent a `pointerdown` first. On a phone a tap always does. A harness artefact
reported as an app fault is the shape every entry under `check/load.js` already records.
