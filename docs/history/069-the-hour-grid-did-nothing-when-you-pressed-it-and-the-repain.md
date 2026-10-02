## The hour grid did nothing when you pressed it, and the repaint was aimed at another screen

**Reported as "grid not working when click"**, with a screenshot of the Booking column. Reproduced
on the first try and the app's own press log named the cause in one line.

**`clicks()` EXISTS FOR EXACTLY THIS AND IT EARNED ITS KEEP.** Its note lists the four causes of
"nothing happens when I click" and says they look identical from outside: the scripts never loaded,
nothing carries a `data-do`, the name in the markup and the name in `on()` disagree, or **the
handler ran and did nothing**. Measured: `pressed: BUTTON.hr, nearestAction: book-slot,
handlerRegistered: true` — the fourth one. The press landed on the right element, the handler ran,
`BOOKING.slots` came back `["m10"]`, and `.hr.on` was still **0**.

**So the state was right and the redraw was aimed somewhere else.**

```js
function paintBook_() {
  if (typeof paintStuff === 'function' && $('s-stuff')) paintStuff(true);
}
```

**It repaints `s-stuff` and nothing else, and that was right for exactly as long as the form lived
only inside the funnel.** `bookingPages_` answers `What for · Booking` there — and it also builds
the Booking COLUMN, `screen('booking', …)`. Same markup, two hosts, and this knew about one.
**Measured: with the fixture the funnel draws no booker at all** (`pageCount('stuff')` is 1 and
`#bookr` is not on it), so `s-stuff` was not merely the wrong host, it was a **dead** one — which is
why the grid was completely inert rather than half-working. Confirmed by the sharpest fact
available: after `drawBooker()` the cell was **the same DOM node**, so nothing had been rebuilt.

**AND IT WAS NEVER ONLY THE GRID.** Every `drawBooker()` caller is on that path — the edit row, the
undo, every dropdown. **A `<select>` shows its own new value natively with no help from anybody**,
so the answers appeared to work while the grid and the running cost did not: the half that needed no
repaint was the half that looked fine, which is why this read as "the grid is broken" rather than
"the form does not redraw". The screenshot shows it exactly — Kind, Subject and Level all answered,
`COST —` blank, and the week empty.

**Asked of the DOM rather than remembered.** `#bookr` is the form's own wrapper and `.screen` is
whatever section it is in, so "where is this drawn" is answered by where it IS. Same move as
`msg-send` walking up to its nearest `.msg-form` and `me-save` to its own container — both written
after an id handed the wrong element to the right handler. A flag naming the host would be a third
thing to keep in step with the two that already exist.

**The funnel keeps `paintStuff(true)`**, which is not the same call: a plain `paint` would throw
away the strip of result pages and which one you are on. So the old path is preserved exactly where
it applies and nothing regresses.

**Measured after, on the column**: three presses give three lit cells, Monday 12 and 13 **joined
into one bar** — the adjacent-hours bridge doing its job for the first time on a press anybody made
— and the When row reads back *"Monday 12:00–14:00, Wednesday 15:00–16:00"*. 32 checks pass.

### Why no check caught it, which is the part worth keeping

**`check/ui.js` MEASURES WHETHER A CONTROL CAN BE READ AND HIT, NOT WHETHER PRESSING IT DOES
ANYTHING.** It reported the booking column clean at four widths on every run — correctly, by its own
question: the cells are 24×20 inside a 20px floor that `ACCEPTED_TAP` records with a reason, the
labels are there, nothing overflows. **A dead control measures perfectly.**

**And `check-flow.js` drives bookings through `BOOKING` and the send paths rather than through the
markup**, so it proves the state machine and never presses a cell. Both were right about what they
ask. What neither asks is the question the owner asked: *press this — did the screen change?*
