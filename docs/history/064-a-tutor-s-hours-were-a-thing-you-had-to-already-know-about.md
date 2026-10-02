## A tutor's hours were a thing you had to already know about

**Asked for as "i think i need to make a widget for tutors in its own coloumn. its where they can
select their availability"** — and the first move was to look rather than to build. **It already
existed and worked end to end.** A week of tick-boxes, saved by `me-save` into the `availability`
column, and `slotGrid()` has read it since it was written: an hour nobody has ticked comes up
greyed in the booking week with *"not available"* beside it.

**What was missing was the door.** It sat inside *Your details*, below About you, Where and
Contact, so reaching it meant knowing it was there. That is the sentence this file already writes
about the calculator: **a tool is not a thing you FIND, it is a thing you OPEN**, and the Tools
column is where the sixteen of them live. This is the seventeenth.

**Not a tenth screen, and the flag is why.** A column of its own is a screen every parent and every
student swipes past holding something only a tutor may use. `widgetsOf_` already gated the flyer
maker on `admin: true`; `tutor: true` is that one role along, reading `isTutorRole()` — which is
"tutor or admin", the shape every other staff test in this app uses. **Two flags rather than one
`staff`**, because a single one would have put the business’s own stationery in front of every
tutor to save declaring a word. Measured: a tutor sees 9 tools and an admin 10; a parent sees 8 and
the widget is not in their roster at all.

**And it stays in the details sheet too**, which is not a second copy: `fieldsHtml` and the widget
both call `availGrid_`, one grid, one save. A tutor who goes looking where it used to be finds it.

### `weekGrid_` — there were three of these, and a comment forbidding the drift did not stop it

**`availGrid_` carried this note**: *"the same grid the booker uses — because it is the same
question … answering it in two different shapes would be two things to learn."* It was right, and
it was a second piece of markup wearing the same class names. **The hour header proved it by
breaking it**: two of the three grids gained one row of numbers along the top and a joined bar for
a run of ticked hours, and the tutor’s went on printing seventy-seven numbers with a gutter
between every tick. Exactly two shapes for one question, under a paragraph saying there must not
be.

**What differs between the three is the CELL and nothing else** — a button you press, a button you
cannot, a label wrapping the checkbox `me-save` reads. So the cell is the argument to `weekGrid_`
and everything round it is written once: the header, the day label, the row, which days collapse.
**The cutover was proved neutral before it was kept**: the booking form and the receipt measured
755px / 162px grid / 20px cell and 418px / 80px / 9.5px before and after, to the pixel.

**The columns line up by construction on all three.** `slotGrid()` builds one hour span and every
day maps over it; the receipt counts 10 to 20; and `availGridOut` in `core.gs` walks
`AVAIL_DAYS × AVAIL_HOURS`, so a tutor’s codes are that same span grouped by prefix. One header
can name the columns for seven rows because no day can have a different set.

### One save, two surfaces, and the DOM says which

`me-save` read `#sheet-body [data-me]` and called `closeSheet()` — both right while the details
sheet was the only place those boxes could be. It gathers its own container now
(`el.closest('#sheet-body') || el.closest('.widget-slot')`) and closes the sheet only when it is in
one, **which is exactly what `msg-send` already does with `form.closest('#sheet')`**. A second
handler would have been a second copy of the whole round trip.

**And the status line is a class, not an id.** Two surfaces carrying `id="me-said"` is two elements
with one id and `$()` handing both Save buttons the first of them — the `$('msg-text')` bug this
file already records, which would have written "Saving…" onto the wrong card. **Proved on the
wire**: ticking one hour and pressing Save posts `updateProfile` with all 77 hour fields and
exactly seven `TRUE` — the six already on the row plus the one just ticked — with no sheet opened
or closed.

### `.hr input` said `width: 0; height: 0` and the element measured 24 × 44

**The declared state found it on its first run**: `label.hr overflows by 4px`, at 320px, 306 times.

`input, select, textarea` sets `min-height: max(44px, 2.9rem)` and `padding: .7rem .75rem` on every
input in this stylesheet, and **neither of those is `width` or `height`**: a `min-height` clamps a
height of zero back up to 44, and `box-sizing: border-box` will not take a width below its own
padding. So the rule read as *take no room* and the box was a fingertip tall and twenty-four wide,
invisible, for as long as it has existed.

**Nothing could see it until the bridge arrived.** It is `position: absolute`, so it laid out
against whatever positioned ancestor it found — a card or a pane, wide enough to swallow it.
Giving `.hr` `position: relative` for the joined-bar bridge made the CELL that ancestor, and the
cell’s own `scrollWidth` saw it. **The `.price.faint` shape for a fifth time**: a declaration that
reads as a decision and behaves as nothing, found the moment something finally measured it.

### The fixture had no hour codes, so the widget could only ever have drawn its empty state

`check/fixture.json` sent `profileFields: []`, which is not what `doGet` sends — so the one state
the lab could reach was the *"the hours have not arrived from the server yet"* card. **That is this
file’s own recurring fault pointed at a new surface**, the same as the booking receipt the fixture
could not reach and the message thread it could not carry. The fixture holds the real
`AVAIL_DAYS × AVAIL_HOURS` span now, which is what the payload holds.

**And the flyer state was right by luck.** It found its page with
`allWidgets().filter(kind === 'tool')` while the column draws `widgetsOf_('tool')` — the same list
with the gated ones removed. The two agreed for an admin, who is gated out of nothing; the first
widget an admin does not see would have put every index after it one page off with nothing saying
so. Both states read the list the column is built from now. **Two readings of one list** is the
sentence this file writes about `documents_()`, `factsNow_` and `reelPages_`.
