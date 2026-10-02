## A profile picture picker, a tutor's hours on their card, and a heat map you can read

### The heat map

**Asked for as *"make the heat map a bit clearer."*** Two things made it unclear, and both were
measured on a stand-in tile in OpenStreetMap's own colours, because this container cannot load the
real tiles (403):

- **The streets were gone.** `.heat-tiles` was `invert(1) hue-rotate(180deg) brightness(.85)
  contrast(.9) saturate(.4)`. White minor roads on `#f2efe9` land came out `rgb(13,13,13)` on
  `rgb(26,25,23)`, which is 1.11:1. The two colours are 5% apart, and inverting keeps them 5% apart at
  the dark end. Turning the contrast up after an invert only clips both to black (measured: 1.00:1).
  The filter is now `brightness(.46) contrast(4) saturate(.5) sepia(.25)`. The stretch comes first, so
  the narrow light band the tiles live in is spread across the dark half of the range, and streets stay
  LIGHTER than the blocks round them, as on any dark map. Minor roads now measure 1.62:1 on open land
  and 2.46:1 on residential grey (`#e0dfdf`, which is most of London at these zooms). Water is 1.85:1,
  and place labels come out dark rather than white.
- **Seven venues were one blob.** Colliers Wood, Sutton, Wimbledon, Tooting, Mitcham, Balham and
  Morden merge into a single patch with 80px glows. That is right for a heat map, but it meant three
  venues looked the same as seven. Each venue now has a 10px gold core with a dark ring, on its own
  `.heat-core` layer above the glows. The core is placed by the same `pos()` call as the glow, so the
  two position strings are identical.
- **No text was added.** The owner asked for a map *"instead of the tutors at showing names of all
  places"*.

The account state `a tutor card, the five captions and the area map` now also asserts that there is
one core per venue (`data-dots`) and that the cores' `background-position` list equals the glows'.
Proved by placing the core at `pos(p[0], p[1], D, D)`, half a dot off its glow: the state reported
"was entered and shows no … gold core on its centre" at every width. It went green again once the
change was put back.

**The phone has the last word on the filter.** Every screenshot here was taken over a stand-in tile.
If it is too dark or too bright, tune the two numbers. Do not change the order.

### A tutor's hours on their card

**Asked for as *"tutors availability should appear on their card."*** `doGet` has always sent `avail`
on every tutor. It is `availGridOut`'s 77 codes, `{ m09: 'TRUE', m10: '' … }`, and `busy` uses the
same codes for hours the tutor is already teaching. `findCard` never read either one.
`profAvail_` (cards.js) now draws an **Available** caption after `Tutors at`, with a read-only week
under it, built by `weekGrid_` like the booking form, the receipt and the Settings week:

- A ticked hour is lit gold. A ticked hour they are already teaching is greyed (`shut`, with
  `is-busy`), because offering it as open would be a promise the booking grid then breaks. Its
  title says "already teaching".
- A day with nothing ticked collapses to a thin row. A tutor with nothing ticked gets **no caption
  and no week**. 77 grey cells would read as "never available", and `slotGrid` treats an unfilled
  grid as "nobody has said".
- The span is the booking's 9 to 18, widened to any hour the tutor ticked (their own grid runs to 19).
- **Spans, not the receipt's `<button disabled>`.** The first version used buttons, and
  `check/ui.js` listed all 77 as 17x12 tap targets: 210 "known" rows at 320 alone, for cells nobody
  presses. A screen reader now gets one sentence for the whole week (`role="img"`).

**The fixture lied about the shape.** `check/fixture.json`'s tutor had `avail: []` and `busy: []`, so
the lab could not draw availability at all. It now holds the 77-code object with nine hours on
(Mon 16–18, Tue 10–11, Wed 16, Sat 10–12) and `busy: { m17: 'Maths' }`. The booking screen's
`check/ui.js` pass is unchanged by it.

**Owner's five captions.** In note 210 the owner asked for exactly five captions. `Available` is a
sixth, so the heat-map state now allows it only as the last caption.

Checks:
- A check-flow journey covers lit hours, the busy hour greyed, collapsed days, no control in the
  week, the spoken sentence, and no week when nothing is ticked.
- A `check/states.js` state, `a tutor's hours on their card`, covers four widths.

Proved:
- Lighting busy hours turned both the journey and the state red at all four widths.
- Dropping the empty-grid guard turned the journey red ("drawn with a week anyway").
- Buttons in place of spans turned it red ("is a control").

Each check went green again after the change was restored.

Cost: on the 390 lab card, the tutor card is drawn at 84% where it was 98%. At 320 it was already
at the 70% floor and scrolls inside its pane. Nothing is out of reach.
