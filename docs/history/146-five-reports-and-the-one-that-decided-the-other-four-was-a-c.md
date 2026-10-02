## Five reports, and the one that decided the other four was a column with no room in it

**Asked for in one message over three screenshots**: *"i dont like this. this is shit. no pop up
menus. can you see how in screenshot i booked 3 hours? there should be a 3 hour mutultiplier in the
multiplication column, but i can also see theres no space for that. so make the time grid thinner by
scale facter 0.5. i dont care if its really thin now. delete the text "tot the tutor bit". can you
also wipe everything we know about the sharing reciept? I want the feature fully wiped and remade
again. all i want is for when i share a booking/reciept it just shares a pdf of an exact copy of
what they are seeing on the screen."*

### A day's hours are a multiplier, and the week was standing in the column they go in

**The second and third asks are one change and the owner's own sentence says so.** The week spanned
`grid-column: 2 / 4` — the answer column and the multiplier column — on an argument written a
fortnight earlier: *"the two a day row could never fill"*. It fills it. `priceFrom` does
`p *= L.hoursPerWeek`, and hours-a-week is the sum of the seven day rows, so a day's own figure is a
term of the product the card is already read down rather than a label that happens to start with a
`×`.

**COUNTED FROM THE TICKS, NEVER STORED BESIDE THEM.** Three lit cells and a `× 3` that disagree
would be a foot apart on one row, which is this repository's oldest shape with the two copies in
sight of each other. The receipt's week takes its figure off `hours_per_session` instead — a saved
job holds one span — so both documents print the same number because they say the same fact, not
because they share a guess.

| at 320 / 390 / 768 | before | after |
|---|---|---|
| the strip | 98.7 / 125.8 / 133.9px | **56.3 / 75.3 / 80.9** |
| a cell | 8.97 / 11.69 / 12.48 | **4.7 / 6.6 / 7.2** |

**0.53× at every width**, which is as near the half that was asked for as a column edge lands, and
*"i dont care if its really thin now"* is the authority for it. `ACCEPTED_TAP` carries the
arithmetic and says plainly that a fingertip covers about six columns at 320 — what makes it
liveable is unchanged and is the same sentence a Scrabble square gets: a wrong tap costs nothing,
because a lit hour comes straight back off and nothing is sent until Send.

### `.bk-m` IS HIDDEN ON A ROW WITH NO TOTAL, WHICH IS RIGHT ABOUT EVERY OTHER ROW

The figure-collapse rule asks `:has(.bk-t:not(:empty))` — a priced row has a running total, and a
row with no total has no figures. A day row breaks that in one direction only: its `× 3` is a count
of hours and a day has no running total, because the price is a product over the week. **Without the
`:not(.bk-wk)` the markup would have said `× 3` and the card would have shown nothing**, which is
the worst of the three outcomes. Narrowed to the week rather than widened to "any non-empty figure",
because the wider rule also un-hides the `—` a rate multiplier of exactly 1 writes into its own
column — a separate decision about twenty-odd other rows.

### The hour numbers could not survive it, and the header doubled in height carrying them

**`18` IS ABOUT 7.4px OF INK AT `.slot-hh`'s SIZE AND THE COLUMN IS 4.7px.** So every two-digit hour
wrapped onto two lines and the one row of the seven that carries the header went 7.4px tall to 14.8.
Measured in the arrangement that ships: the card went **544 to 551 at 320** — seven pixels for a row
of numbers nobody could read.

**So the hour week says its span and the block week names its columns**, and which of the two is the
caller's to state because it is a fact about the caller's grid: a block's name is a third of the
strip and an hour's is a tenth. `9 – 18` over ten evenly spaced cells is a ruler — you count along
it — and every cell still says its own hour in `title` and `aria-label`, which is more than the
numerals ever gave a screen reader. **Neither an ellipsis nor a shrunk font**: both leave a number on
screen that cannot be read.

**Measured after: the card is back to 544 at 320**, which is exactly where it was before any of
this — the ruler gives back what the multiplier cost, and the 10px that card has been past its pane
at 320 is untouched and is nobody's doing tonight.
