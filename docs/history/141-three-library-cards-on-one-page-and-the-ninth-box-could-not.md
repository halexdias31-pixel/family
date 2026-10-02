## Three library cards on one page, and the ninth box could not have fitted

**Asked for as *"there are many different librarys for library card detais so make it smaller so can
fit in like 3."*** The answer is not a narrower box. Measured in the real app, nine ordinary
`label.field` boxes are **790.2px in a pane that caps at 534.25px** at 320x568 — 283px below the
fold with no scroll and no page to turn to — and the irreducible floor, nine 44px inputs plus 161.5px
of measured card chrome, is **557.5px**. It cannot fit at 320 with zero captions and zero gaps.

**SO THE SHAPE CHANGES RATHER THAN THE SIZE.** Two rows a card — the library and the PIN across, the
number full width beneath — is three boxes in the height of two, and every input keeps its 44px
floor, which is the one measurement in this stylesheet that does not scale.

| at 320x568 | |
|---|---|
| nine stacked boxes | 790.2px, **283 past the fold** |
| three cards, two rows each | shelf **308.5px**, card **504.7 in a 530 pane** |

### One cell, nine boxes, and the precedent was one column along

**`library_card_2` IS WHAT `SCHEMA` ALREADY REFUSES IN WRITING** — the numbered-column fault this
file records under `images`, under `needs` and under the practicals' `equipment_1 … equipment_10`.
So the three cards are one cell: `name:number:pin` items joined by `|`, which is `avatar`'s own
`key:value|…` format **on this same tab**. `libCardsOut` expands it into nine form fields and
`libCardsIn` packs them back — exactly the arrangement `availGridOut`/`availGridIn` already have for
the 77 hour boxes, which is the one precedent this tab has for *a form with many boxes and a sheet
with one cell*.

**`library_pin` IS GONE WITH IT**, and that costs nothing: measured against the live sheet, none of
the three columns has ever been created — `?setup=1` has not been run since they were added — so
there is no data to migrate and no cell anywhere holding a PIN under the old name.

**THE NAME MAY HOLD A COLON AND THE OTHER TWO MAY NOT**, so an item is parsed from the RIGHT: the
last two colon-parts are the number and the PIN, everything before them is the name. `Merton:
Wimbledon` survives. A PIPE typed into a box is stripped rather than escaped — left in, `Merton|
Sutton` comes back as TWO cards on the next load, which is a silent corruption of the one thing this
cell exists to remember.

**AND THE NINE ARE NOT COLUMNS, WHICH `updateProfile` HAD TO BE TOLD TWICE.** They are out of
`wanted` — left in, `lib1_name` would be refused by the very error that exists to catch a field with
no column — and `library_card` is checked for a header explicitly, because with the nine excluded
nothing else would, and `setCell` writes to a header that is not there and loses the value with no
error anywhere.

### `node js/check-people.js` — the packed cells, round-tripped

**NOTHING HAD EVER RUN EITHER PACKER.** `availGridIn` has been the only writer of a tutor's
availability since it was written and no check has opened it. It is the one shape where a fault is
completely silent: a packer that drops a field writes a shorter cell, the form reloads with an empty
box, and the person who typed it assumes they forgot.

**Fourteen cases, each a fault that could happen**: the round trip, a colon inside a name, a pipe
typed into one, a trailing empty card dropped, a gap in the middle KEPT (it is somebody's second slot
left blank on purpose), a ragged cell, and an hour outside the span. It cuts the five functions out
of the `.gs` by name and runs them — not a second implementation, which would agree with itself and
with nothing else. **Proved by mutation**: parsing an item from the left instead of the right names
the colon case and exits 1.

### A caption or a placeholder, never both — and that is the 90px

**`fieldHtml` GAINED ONE OPTION and the argument for it is already in this file**: ten controls in
this app have no text and no `aria-label`, every one carries a placeholder, and **a placeholder IS
the accessible name when there is nothing else** — so adding a label repeating it would be two
strings to keep in step. A caller that asks for one gets a box with no caption and 15px back, six
times over. Every other field keeps its caption, because a form of nine unlabelled boxes is a form
you have to guess at.

**AND AN EMPTY STATUS LINE TOOK EIGHT PIXELS ON EVERY CARD IT SAT ON.** `.me-said` carried an inline
`style="margin:.6rem 0 0"` in two places, so the gap was there whether or not there was anything to
say. Out of the markup and zero while empty — which is the eight pixels that put the shelf inside a
568px phone, and a real repair to six other cards.

### Three faults the lab found, and one of them was the lab

**`max-content` ON A TRACK HOLDING AN `<input>` IS THE INPUT'S IDEA OF ITSELF.** The default `size`
is about twenty characters, so the PIN column took ~250px and the library name was left with **four**
— `<label>.field "Library" is 4x63`, plus eleven sideways scrolls up to 270px, on the first run of
`--screen=settings` that had ever existed. A fixed 7rem track and `min-width: 0` on both.

**AND THE ELEVEN SCROLLS WERE NOT ALL THE APP.** Six of them were an `<input>` whose VALUE is longer
than its box — which is what every text field on every site does, and the one element the platform
tells it may scroll. There is no `overflow-x` on it for the rule to read, so it reported the value
instead of the layout, and it was firing on a library called `Wandsworth Town and Putney` and on
`library_note` holding a sentence. `<input>` is exempt from rule 1 now; `<textarea>` is not, because
it wraps. The box AROUND an input is still measured, which is what caught the 4px track.

**AND `check/cascade.js` CAUGHT MY OWN TWO NEW RULES.** `.lib-shelf label.field` and `.lib-row >
label.field` are both (0,2,1), so which margin the two top boxes got was settled by which line came
later. The **twelfth** conviction of `.price.faint` in this stylesheet, and the first one caught by
the check rather than by a person reading two blocks side by side.

### The lab had nine screens and the app has eleven

**`SCREENS` in `check/ui.js` WAS A LIST WRITTEN BY HAND AND ITS OWN NOTE NAMED THE FAULT**: *"if you
add a screen, add it here — and if you forget, the check still passes, which is the one failure this
file cannot catch by itself."* It was forgotten. `settings` and `saved` have been columns for weeks
and had **never been measured at any width by any visitor** — and `saved` has a declared STATE in
`check/states.js` that had therefore never run once.

**It is derived now**, off the app's own `TABS` after a real boot, which is the repair
`check-doors.js` already made when its hand-kept file list had drifted to three files. A column added
tomorrow is measured tomorrow with nothing here to remember; a boot that fails outright says so
loudly and fails, because a silent fallback to nine is exactly the silence this replaces.
