## A day is a question, so the week stopped being a picture beside one

**Asked for as "get rid of When and instead have the day names be the field questions. So it becomes
Monday field Tuesday field Wednesday field."** It is the fourth round of one complaint and the only
answer that is not a trade.

**THE THREE ROUNDS BEFORE IT WERE ALL THE SAME TWO BAD CHOICES.** The week was a block hanging under
a `When` row. Indent it to the answer column and its left edge lines up and its right edge cannot —
eleven pressable cells need 240px and the answer column beside three figure tracks is 78px, a
five-pixel cell. Collapse the figure columns to make room and the form loses `× +/h +`, which
is what *"now there's only 2 columns again"* was. Written, reverted, written, reverted; the
arithmetic is in `style.css` either side of `.bk-open`.

**A DAY IS A QUESTION.** *"Monday · which hours"* is a field with a label, exactly like *"Subject ·
which one"* — so it belongs on a row of the card rather than inside a picture drawn beside one. The
day name moves out of the grid's own 1.5rem gutter and into the label column every other question
uses; the eleven hours become that row's answer. Nothing is nested, nothing is indented, and *"the
grid is in the input column"* stops needing a rule to enforce it: the hours ARE in it, because they
are what the row answers.

**AND THE CELLS GOT BIGGER, WHICH NO VERSION OF THE OLD SHAPE COULD DO.** The `.slot-day` gutter is
24px that the label column was already paying for.

| | 320px | 390px | 768px |
|---|---|---|---|
| indented block, last commit | 13.6px | 17.6px | 18.7px |
| **a day as a row** | **15.8px** | **20px** | **21.2px** |

20px is the floor the note over `.hr` sets from a fingertip, reached for the first time since the
week was indented. The waiting-list card went 762px to **594px** and its blocks are 78.6px wide.

### The figure columns collapse per ROW now, not per card

**That is the whole difference between this and the rule reverted yesterday.** That one asked whether
the CARD was priced and collapsed every row when it was not — so an unpriced form lost its column
names entirely. This asks the question of the ROW, so the header keeps all five names on every card
and a row simply uses the width it is not spending. Measured at 390: **every dash and every day
strip share `111 → 351`**, which is the single right edge three screenshots were about.

**THE COST IS ON A PRICED CARD AND IT IS REAL.** `Venue` carries a surcharge and `Subject` does not,
so their two dropdowns come out 78px and 240px — the *"two editable fields, one above the other, in
two sizes"* the note over `is-bare` records from the last time this was tried. What is different is
that the columns are NAMED: a short value with `× +/h +` over the space beside it reads as a
row that has figures, which is what it is.

### One builder, three surfaces, and `short` stopped being a label

**`weekRows_` returns row objects rather than markup**, and the form, the waiting list and the
receipt all call it — so a week restyled once is restyled on all three. `stepGrid_`, `blockWeek_`
and `jobGrid_` are gone; `stepWeekRows_`, `blockWeekRows_` and `jobWeekRows_` replace them, and
`stepRows_` is a `flatMap` because one step is no longer one row.

**`short: 'When'` IS AN ANCHOR NOW AND NAMES NO ROW.** `SPINE` holds Monday to Sunday in that step's
place — **once**, deduped, because both week steps answer the same seven questions and only one of
them is ever on a card. What `short` still does is hold the position: `SPINE_EXTRA`'s
`{ after: 'When', row: 'Per session' }` pins itself to it, so that row still lands after Sunday
without naming a day.

**The hour numbers ride on Monday's own answer cell**, above its strip — one fact about eleven
columns, drawn once, which is `slotHead_`'s own argument for taking them out of seventy-seven cells.
A row of their own would need a name, a place in `SPINE` and a label column holding nothing. **And a
screenshot caught the one thing that went with it**: top-aligned, `Monday` sat level with the
NUMBERS rather than with its own boxes — the one row of seven where the eye could pair the wrong two
things. `align-self: end`, off `:has(.wk-hh)` rather than a class the builder has to remember.

### Two journeys failed and both were right to

**`every question the form asks has a row on the paper`** looked for a row called `When`. The
invariant is unchanged and what satisfies it is seven rows rather than one, read off `SLOT_DAYS`
through the harness — a list of day names written into the check would be a second copy to keep in
step.

**`the paper keeps the same rows whatever is answered`** tests that an `only:` step's row is on its
own branch and off the other. **A week step's rows are on BOTH by design**: `avail` is `only: 'wait'`
and draws Monday to Sunday, which is exactly what `slots` draws on the other branch. So week steps
are exempt from that one assertion, with the reason written in — and what still governs them is that
`stepWeekRows_` returns `[]` on the wrong branch, which the shape comparison covers. Every non-week
`only:` step is tested exactly as before.

### Nine till six, and the two spans had disagreed at both ends since the grid was written

**Asked for as "make it go from 9-6 instead of 10- to 8".** One line — `SLOT_HOURS` is written once and
everything derives from it, which is what the note over it was for — and the two ends were not
equally free to move.

**`AVAIL_HOURS` IN `constants.gs` IS `[9 … 19]`.** That is the span a tutor's own availability grid
offers and the cells `slotGrid` looks a booking code up in. The booking grid was `10 … 20`. So the
two disagreed at **both** ends, silently, for as long as both have existed:

| | |
|---|---|
| **hour 20** | no availability cell exists, so `tAvail['m20']` is `undefined` for everybody — **any tutor who had ticked a single hour was unavailable at eight in the evening, on every day, for ever.** The column was drawn, looked pressable, and was permanently grey |
| **hour 9** | had a cell and nothing could book it. A tutor ticking nine o'clock was recording a fact the form never asked about |

**Nine to eighteen sits inside `AVAIL_HOURS` at both ends**, so the disagreement is gone rather than
moved — and that is the rule rather than luck: anything wider than the sheet's own span comes up
grey for everyone the moment they set any hours at all, so `AVAIL_HOURS` has to move first. Written
where `SLOT_HOURS` is.

**Six is included, as eight was** — a session starting at six is a session. Ten columns rather than
eleven, and the cells go **17.6 / 22.2 / 23.5px** at 320 / 390 / 768, past the 20px floor at two of
the three widths. The morning block gains an hour by derivation with nothing to edit, which is
exactly the hypothetical that note was written as: `Morning 9, 10, 11 · Afternoon 12–16 · Evening
17, 18`.
