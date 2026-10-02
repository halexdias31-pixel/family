## The grid was not wider than the rows; the rows were holding three empty columns

**Reported from a screenshot of the live form: "i dont need that extra text. also gride shouldnt
extend beyond the 1st coloumn like the other fields."** Two things, and the second is the
interesting one because the obvious reading of it is arithmetically impossible.

### The instruction went because the picture now says it

**"Two together is a two-hour session; another day is another session"** was a caption on a control
that could not show what it meant — and then the commit before this one made adjacent ticked hours
**join into one bar**. The shape on screen IS the sentence now, so the line under it is the fault
this file already records where the roster's `name` printed an `<h3>` above every widget's own
heading: two sources for one fact, both drawn at once.

**The waiting-list line stays**, and it is a different kind of sentence. Nothing else on the card
says why a week is drawn and cannot be ticked, and a locked control with no reason beside it is the
invisible mode — the same argument as the reel that was paused with nothing saying so.

### The literal reading breaks the one measurement that must not scale

**Measured at 390px before touching anything: the ROW spans 39→351 and so does the grid.** They
already agree. What stops at **193** is the *dash* — because the multiplier, the rate and the total
are three reserved tracks, **158px of every row**, holding nothing on a booking nobody has priced
yet. So the card had two right edges and the grid was on the correct one.

**Clipping the grid to where the dash ends gives cells of 7.5px at 390 and 5.2px at 320**, against
the 20px floor the note over `.hr` records this block reaching after 222 → 174 → 146px. A week has
seven days and a day has to be pressable; that is the one measurement in this stylesheet that does
not scale.

### So the figure columns go when there are no figures on the card

`bookBreakdown` does `const priced = L ? breakdownRows(L) : []` — until a booking can be costed
there are no figures anywhere on it, and the three columns are 158px of reserved nothing on
eighteen rows. Dropped, the value takes the width they were holding, and the dashes end where the
week ends: **one right edge, in both states.**

| at 390px | before | after |
|---|---|---|
| the value's right edge | **193** | **351** — the grid's own edge |
| the empty form | 700px | **675px** |
| a priced card | totals at 351, dashes at 193 | unchanged |

**PER CARD, NOT PER ROW, and that is the whole care.** `is-bare` collapses a single row, and the
note over it records what that did to a FORM: Subject had no surcharge so its box ran the width of
the card, Venue had one so its box was 4.5em and cut "Sutton Library" to "Sutton Li…" — two
editable fields, one above the other, in two sizes, because which size a field got depended on
whether its answer happened to cost anything. Asked of the CARD, every row answers the same way.

**`:has` reads the card's own totals rather than a flag somebody sets**, so there is no second place
for "is this priced" to be wrong — the fault this stylesheet pays for every time a width is stated
twice. It undoes itself the moment anything is priced, **proved by putting a figure into one
`.bk-t` by hand**: the five tracks come back, the dash returns to 193, and the total's right edge is
the grid's right edge. Nothing moves vertically, which is what `SPINE`'s own objection to a
changing shape is about.

**The harness cannot price a booking and that is worth knowing.** `check/fixture.json` has no
`pricing` key, so `bookPrice()` returns null and the form's money columns are empty on every run
this file has ever made — the same blind spot as the booking receipt and the message thread, one
column along. It is why the priced state above was proved through the DOM rather than through the
app.

**And the basket is excluded by name.** `is-wide` is already two columns — a title and a price — so
hiding its total would take the price off a basket of free things.

#### THIS WAS REVERTED, AND THE THREE SECTIONS ABOVE WENT ON DESCRIBING IT FOR WEEKS

**The figure columns are NOT hidden on an unpriced card.** They were put back on *"what happened to
all the columns I had before for things like multiplier"* — the revert is written up in `style.css`
beside `.bk-row.is-blank`, and **nothing came back here to say so**. So every number in the table
above is wrong about the live card: the value's right edge is 189 of 351 at 390px, not 351, and an
unpriced form carries 145px of empty track on eighteen rows.

**Found by measuring the card while answering a complaint about the week grid**, which is the only
reason it is not still there. That is this file's own recurring fault pointed at itself — the same
shape as `.favwrap.is-fav`, as `resource_type` in `VOCAB` and as the dead `kind === 'paper'` guard:
a confident paragraph that outlived the code under it. **The entry stays** rather than being
deleted, because the arithmetic in it is what the next person needs — and this heading is what
stops them acting on it.
