## A waiting list picks blocks on the week, and the five phrases go

**Asked for as "I want the grid blocks to form into chunks for morning, afternoon, evening ect."**
What was there was a multi-select of five phrases — `Weekday mornings`, `Weekday afternoons`,
`Weekday evenings`, `Weekends`, `Flexible — whatever suits` — with the hour week above it **greyed
out whole** and a line saying why it could not be ticked.

**The old note is right about WHY the answer must be broad and wrong about its shape.** *"Asking a
family to tick specific hours for a session that may run in six weeks is asking them to promise
something nobody can promise"* — so the columns are blocks. But a week is a SHAPE you read, which is
the argument the hour grid has carried since it was written, and `Weekdays` as one word cannot say
that Tuesday is the one evening that does not work.

**Three columns, seven rows, `weekGrid_`'s own builder.** That function's note says what differs
between this app's grids is THE CELL and nothing else, and it holds: the header, the day letters,
the row and the gold bar that joins Monday morning to Monday afternoon are all its.

**Nothing is greyed, and that is the question being asked.** The hour week greys an hour the tutor
does not work — right, because it offers hours that can be BOOKED. This asks when the FAMILY can
come, of a class with no tutor, no room and no day yet; greying a block by whoever happens to be
selected now would be answering a different question with the first question's data.

**One week on the card, not two.** The greyed hour week is not drawn on this branch at all. Measured:
a 44px block week is 330px against the hour week's 162, and 527px of week on a card whose pane caps
at about 800 is most of the paper spent on one question with half of it unanswerable. The sentence
the greyed week carried went with it — the row above still asks *"When could you come?"* and the
Kind row's own note still says the class *"runs once enough others take a seat"*.

**No backend change.** `waitlistWhen` splits the joining event's message on commas and tallies the
phrases, so any phrase works — and the cell carries the phrase it stands for, so there is no second
place for "Monday morning" to be spelled. `Mon–Fri evenings · 4 of 4` is the tutor reading the
answer rather than decoding a code.

### 44px was measured and refused, and the card had three pixels

**Three columns CAN pay the tap-target rule where eleven cannot.** `ACCEPTED_TAP` carries the hour
cells at 20px with the arithmetic beside them — eleven fingertips need 484px and no phone is that
wide — and three need 132 against about 280. So it was written as `.hr.blk { min-height: 44px }`.

**Then it was measured.** The waiting-list card is **803px in an 807px pane at 390**, `under: 3`.
At 44px the block week takes it **216px past the pane's own fold** — content nobody can reach, on
the question the card exists to ask. At 20px the two weeks are the same height and it fits.

**So there is no rule at all, which is the better answer for a second reason**: the blocks are the
same control as the week above them at the same size, one `ACCEPTED_TAP` entry covers both, and a
94×20 cell is 1,880 square pixels of target against a 44×44's 1,936 — the half that rule cannot
express.

### The row's own summary is grouped, because a list of phrases grew a line per tap

**`Monday evening, Tuesday evening, Wednesday evening` is what the grid writes** and it is the wrong
thing to print on a receipt line: measured at 390px with two blocks ticked that row was **62px —
three wrapped lines in an 81px value column** — and it grew by a line with every press. A row whose
height depends on how much of the week suits you is the card changing shape under the thumb
answering it, which is what `SPINE` objects to about folding.

**`blockSay_` groups by block and collapses runs of days**: `Mon–Fri evenings`, `Sat · Sun mornings`.
Three phrases at most, because there are three blocks. **The stored list is untouched** — the same
split the hour grid already makes between `m13, m14` and `Monday 13:00–15:00`, and it has to be:
`waitlistWhen` counts the phrases, and a grouped string would be one vote for a thing nobody ticked.

**And the row above a grid spans now.** `is-bare` collapses a row to two columns and deliberately
refuses to do it for a QUESTION, because two editable fields in two widths is the fault that note
records. A grid's heading has no field — its own note says the dashed underline goes *because "the
answer goes in the week below it"* — so nothing can come out a different size from a control that is
not there. It buys both grid summaries one line instead of two, and the waiting-list card came back
inside its pane at 390.

### `booking · a waiting list` — the branch nothing had ever put on a screen

**`isWaiting_()` changes six rows and the whole week**, and until this state existed the lab had only
ever seen the other branch: `check/ui.js` measured the form, the receipt and the basket, all
ordinary. Same hole the receipt and the message thread were each in, on the app's most control-dense
card. Seeded through `BOOKING.how` and `drawBooker()`, which is what the Kind dropdown's own
`change` handler does.

**Two things it found on its first run, and both were already there.**

**A note explaining how to use a control that cannot be used.** Subject is locked on a waiting list
— a class's subject is settled by whoever opens it — and directly under the greyed dash sat *"Pick
as many as apply — choosing again adds one, and a ticked one comes back off."* That is the caption
this file already removed from over the week grid, in a new place: a sentence about an action,
printed where the action is not available. A `note` is not drawn on a locked step now, and it took
**28px off the ordinary form too** — so there were locked steps with notes on that branch as well.

**And the waiting-list form has been past its pane at 768 and 1280 for as long as it has existed.**
33px, and the block week is not the cause — that grid is 162px at every width, exactly what the hour
week costs. It is the ROWS: they are set in `rem` off a 16px root there against 14.8 at 390, so a
card that fits on a phone does not on a tablet. The note took 27 of it and `.bk-open`'s surround the
last 4 — **the space either side of the dashed rule under the grid, above a row that carries a
dashed underline of its own.** Measured after: 771px at 390 and 797px at 768, `under: 0` at both.
**Proved by mutation**: the old surround back and it names 4px at 768 and 1280.

### And the week is a cell of its row now, so the blocks start where the answers do

**Asked as "is it possible to have the grid be in the 2nd column like the other stuff."** The week
was a SIBLING of its row, so it began at the card's left edge — under the label column, where no
other answer on the card starts, while every value beside it begins two thirds of an inch further
in. One left edge for the answers is most of what makes this card read as a document.

**Yes for three columns and no for eleven**, and it is the same arithmetic the note over `.hr`
records this block reaching after 222 → 174 → 146px. Measured across the value column each week
would have, at three widths, after the day letters and the gaps come off:

| | 320px | 390px | 768px |
|---|---|---|---|
| **blocks** | 56px a cell | 71px | 75px |
| hours | **15px** | **19px** | 20px |

**The floor is 20px** and the hour week is under it at both phone widths — 15px at 320 is a cell you
cannot reliably hit, which is the whole reason that grid is full-bleed and the reason this was
refused the first time it was asked. The block week loses 94px a cell for 71 and is nowhere near it.

**They are never on one card.** `stepGrid_` draws exactly one week per branch — hours for a session,
blocks for a waiting list — so this is not two shapes for one question on a screen somebody is
reading. It is one week, indented as far as its own cells allow.

**Placed by the grid rather than measured again.** The obvious version is `margin-left: 6.2em` on
the week, which is the label column's own floor written in a second place — and that column is
`minmax(6.2em, max-content)`, so a long label widens it and the margin would not follow. `.bk-open`
is the last child of `.bk-row` now, which is a grid: `1 / -1` is exactly the full width it already
had and `2 / -1` is the value column, computed by the browser. One declaration is the whole
difference between the two weeks.

**And a note on a grid row sits under the week now** rather than between the row and it. No grid step
carries one today so nothing moved, and it is the better order if one ever does.
