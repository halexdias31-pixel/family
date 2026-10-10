## A tutor's week is the days they work: the card leaves out a day with nothing ticked, and so does the booking form once a tutor is named

**The owner, 10 Oct:** *"availability of tutors should just show the days they have an availibility
up. no need to display monday if they dont have any hours on monday."*

### What it was

Both weeks drew all seven days. A day with nothing on it was a thin `is-shut` row:

- **The tutor's card** (`profAvail_`, js/cards.js, drawn with `weekGrid_`). The fixture's Ada ticks
  Monday, Tuesday, Wednesday and Saturday, so her card had three thin rules of nothing for Thursday,
  Friday and Sunday. Note 249 chose this for the booking grid's reason: "a missing Wednesday and a
  Wednesday nobody works are different facts".
- **The booking form** (`stepWeekRows_` → `weekRows_`, js/book.js). `slotGrid` drew every day and
  every hour, *"the ones nobody is free for greyed rather than removed"*, so a family that had chosen
  a tutor who works two days still had five thin rows of grey.

The owner's sentence is about the first argument, so it went: a day the tutor does not work is not
drawn.

### What it is

**The card** draws a day when it has an hour the tutor ticked inside the bookable span (9 to 18),
whether the hour is lit or already taught. A taught hour keeps its day, because the tutor still works
that day and the grey says the hour is gone. Days stay in the week's order, and the `9 … 18` header
sits over whichever day comes first. The screen-reader sentence already listed only days with free
hours.

Two cases had no week before and still have none:

- **Nothing ticked:** the existing *"Hasn't set their hours yet, so they can't be booked by name."*
- **Ticks, but none inside the span:** for example a 19:00 tick left over from when the Settings grid
  ran to seven. Now that empty days are dropped, this tutor would have got a caption over a header row
  with no day under it. Instead the card prints, in the warning ink, the words the week's
  `aria-label` already used: *"No free hours this week."* An admin also sees that the ticked hours are
  all outside 9:00–18:00. The sentence carries the `prof-nofree` class rather than `prof-nohours`,
  because "hasn't set their hours" would not be true of this tutor.

**The booking form, once a tutor is named**, draws only the days that tutor has ticked hours on. The
rule lives in `slotGrid`. It returns `days` (what the week draws) beside `rows` (still all seven, for
every reader that looks a day up by its code). `stepWeekRows_` draws `g.days`. Choosing a venue never
moves a row, and an hour is still greyed, not removed.

- **No tutor, or `No preference`: all seven days, as before.** No tutor's week is being shown; the
  family is saying when they can come. `tutorRow_()` is null in both cases.
- **A day the tutor works but where every hour is taken, or the venue is shut, STAYS**, collapsed as
  before (`shut`). That is a different fact from not working that day, and it is the one worth trying
  a different week for.
- **A named tutor with no day to draw gets all seven**, greyed, as before. This covers nothing ticked
  (`tNone`) and ticks only outside the span. `weekRows_` puts the week's reason (`why`) under the last
  row, so an empty week would lose the sentence that explains it.

**A tick on a day that disappears.** Choosing a tutor never removed a ticked hour, and that is how the
form already handles any hour that stops being bookable. Say Monday 10:00 is ticked under No
preference and then Ada is chosen, who does not teach Mondays. The code stays in `BOOKING.slots`. The
cell is drawn lit and greyed (`hr on shut`, disabled) with the title `not available`. The day's `× 1`
and the When answer still count it, and `createJob`'s `tutorHoursRefusal_` refuses it by name at the
send. Dropping Monday's row would hide a tick the price still multiplied by. So **a day that holds a
tick stays drawn**, whether or not the tutor works it, exactly as before.

**The spine would have put the days back.** Monday to Sunday are `SPINE` rows, and `spineRows_` adds a
dash for any spine row neither builder drew, so a day the week left out would have come back as
`Monday —`. `bookBreakdown` now reads which day rows the week actually drew (`strip` rows) and passes
the others to `spineRows_` as already accounted for (`said`). If no day row was drawn (no week on this
branch), nothing is marked. The receipt (`jobWeekRows_`, `fill: false`) is untouched.

**A tutor's own Settings week (`availGrid_`, js/me.js) keeps all seven days.** That is where a day gets
its hours, and a Monday left out there would be a Monday nobody could tick.

### What went with it

With the card no longer passing `shut`, no caller of `weekGrid_` drew a collapsed day, so that support
was removed along with three CSS rules: `.slot-row.is-shut .hr`, `.prof-week .slot-row.is-shut .hr`
and `.prof-week .slot-row.is-shut .slot-day`. The form's thin day is `.bk-row.bk-wk.is-shut` and is
unchanged. `--css-version` is now `2026-10-10-tutor-week-days-they-work`.

Nothing changed about which cells can be pressed, what is saved, the receipt or the booking state
machine.

### Checks

- `js/check-flow.js`
  - **New:** *a tutor's card draws only the days they work, and ticks outside the span say no free
    hours*:
    - Tuesday and Thursday hours draw exactly `Tue Thu`, with nothing collapsed and the right sentence
      read aloud.
    - A Thursday whose only ticked hour is taught stays.
    - A tutor ticked only at 19:00 gets "No free hours" and no week, and is not told they "haven't set
      their hours".
  - **New:** *the booking week shows all seven days with no tutor, and only the chosen tutor's days once
    one is named*:
    - Seven days with no tutor and with No preference; `Tuesday Thursday` with Tia chosen.
    - No day comes back as a spine dash.
    - Her fully taught Thursday stays, collapsed.
    - A Monday tick made before choosing her keeps Monday drawn, lit and greyed, and `BOOKING.slots`
      is unchanged.
    - A named tutor with no hours keeps seven days and the week's own sentence.
  - **Changed:** the card journey from note 249 now wants `Mon Sat Sun` and nothing collapsed, where it
    wanted seven rows with four collapsed.
- `check/states.js`
  - *a tutor's hours on their card* now wants `Mon Tue Wed Sat` and no `is-shut`.
  - **New** booking state, *a tutor chosen, and only their days*: Ada chosen with Tuesday 10 and 11
    ticked; it wants Ada's four days, no day dash, and two lit cells. `check/ui.js` measures both
    states at all five widths.

### Proved by mutation

Each mutation turned its check red, and every check was green again on the real files:

| Mutation | Red in | What it reported |
|---|---|---|
| Card's day filter removed | both card journeys, and the card state at 390 | seven days drawn |
| Card's no-days sentence removed | card journey | the 19:00 tutor drawn with an empty week |
| Card filters on lit hours only | card journey | the taught Thursday disappears |
| Form draws `g.rows` | form journey, and the booking state at 390 | seven days with Tia chosen |
| Left-out days not passed to the spine | form journey, and the booking state | dashes for Monday, Wednesday, Friday, Saturday, Sunday |
| Kept-tick clause removed | form journey | the Monday tick's day disappears |
| A worked day counts only while it has an open hour | form journey | the taught Thursday disappears |
| The fallback to seven removed | form journey | no tutor and No preference draw nothing |
| Only the named-tutor fallback removed | form journey | Nia's week is empty and loses its sentence |

Looked at in `check/ui.js --shots` at 320 and 390:

- **The card** shows four rows under the hour header (Mon, Tue, Wed, Sat) and Monday 17 greyed. At 320
  it was already at the 70% floor and still scrolls inside its pane.
- **The form with Ada chosen** shows Monday, Tuesday (`× 2`), Wednesday and Saturday between Space and
  Term, with no Thursday, Friday or Sunday line. At 320 it now fits without being drawn smaller.
