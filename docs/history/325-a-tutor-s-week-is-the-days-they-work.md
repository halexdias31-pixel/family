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
that day. Days stay in the week's order, and the `9 … 18` header sits over whichever day comes first.
A taught hour is drawn hatched in gold, with a key under the week, so a day kept only for a taught
hour is not a row of empty cells (see *Found in review* below). The screen-reader sentence lists the
days with free hours, then the taught hours.

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
unchanged. `--css-version` was bumped to `2026-10-10-tutor-week-days-they-work`, and again to
`2026-10-10-tutor-week-taught-hour` for the taught-hour look below.

Nothing changed about which cells can be pressed, what is saved, the receipt or the booking state
machine.

### Found in review

**1. A day kept for a taught hour was a row of nothing.** The first cut said, in `profAvail_`'s
comment and in this note, that "the grey says the hour is gone". There was no grey. A taught hour was
`hr shut is-busy`, and `.prof-week .hr.is-busy` had no rule anywhere in style.css. So it was the same
dark cell, at `.hr.shut`'s 0.28 opacity, as an hour never ticked. The difference was only in the
cell's `title`, which a phone never shows. This had been true of Ada's Monday 17 since note 249, but it
cost little while every day was drawn anyway. Once a day is drawn *because* of its ticked hours, it
cost a whole row.

The review's screenshot showed it: a tutor ticked Thursday 16 and Friday 10, already teaching
Thursday 16. The card showed `Thu` with ten identical empty cells, then `Fri` with one lit cell, and
the `aria-label` said only "Available Friday 10:00". That is exactly the row the owner asked to drop,
kept on purpose and explaining itself to nobody.

The fix keeps the spec's decision (a taught hour keeps its day) and makes the hour look taught:

- **`.prof-week .hr.is-busy`** has its own look: a gold edge, hatched across in gold, at full
  opacity. Gold says "one of their hours" and the hatching says "already taken". The rule is three
  classes deep, so it beats `.hr.shut` by weight and not by coming later in the file. It is scoped to
  the card. The booking form's taught hour is unchanged, because there the day is drawn anyway and the
  week carries its own sentence.
- **A key under the week**, `<p class="prof-key">` with a swatch that is itself an `.hr.is-busy`
  cell and the words *already teaching*. It is drawn only when the week has a taught hour, because a
  pattern nobody has been told about is just a different kind of guess.
- **The sentence read aloud** now ends with the taught hours, for example *"Available Friday 10:00.
  Already teaching Thursday 16:00"*. The week is `role="img"`, so the key's words are not read and the
  label has to carry them.
- The comments in `profAvail_` and over `.prof-week` in style.css now say what is on the screen.

**2. Only half of "taken, or the venue is shut" was proved.** The booking journey ran with no venue
chosen, so a `works` test that also asked the venue (`tAvail[h.code] && (!haveV || vAvail[h.code])`)
stayed green while it dropped a Thursday the venue shuts. The real code was already right: `works`
reads only the tutor's ticks. The journey now picks a hall of its own, open every hour except on
Thursdays and given a rate so `isHome` does not read it as the client's house. With Tia chosen, it
asserts the week is still `Tuesday Thursday`, Thursday is collapsed and Tuesday is not.

### Checks

- `js/check-flow.js`
  - **New:** *a tutor's card draws only the days they work, and ticks outside the span say no free
    hours*:
    - Tuesday and Thursday hours draw exactly `Tue Thu`, with nothing collapsed and the right sentence
      read aloud.
    - A Thursday whose only ticked hour is taught stays. Its cell is `hr shut is-busy` and an
      unticked cell next to it is not `is-busy`. The `already teaching` key is drawn, with an
      `.hr.is-busy` swatch, and a week with nothing taught has no key. The sentence read aloud is
      `Available Tuesday 10:00. Already teaching Thursday 16:00`. style.css has a
      `.prof-week .hr.is-busy` rule that sets `opacity: 1` and a background.
    - A tutor ticked only at 19:00 gets "No free hours" and no week, and is not told they "haven't set
      their hours".
  - **New:** *the booking week shows all seven days with no tutor, and only the chosen tutor's days once
    one is named*:
    - Seven days with no tutor and with No preference; `Tuesday Thursday` with Tia chosen.
    - No day comes back as a spine dash.
    - Her fully taught Thursday stays, collapsed.
    - At a hall shut on Thursdays, her Thursday stays, collapsed, and her Tuesday stays open.
    - A Monday tick made before choosing her keeps Monday drawn, lit and greyed, and `BOOKING.slots`
      is unchanged.
    - A named tutor with no hours keeps seven days and the week's own sentence.
  - **Changed:** the card journey from note 249 now wants `Mon Sat Sun` and nothing collapsed, where it
    wanted seven rows with four collapsed.
- `check/states.js`
  - *a tutor's hours on their card* now wants `Mon Tue Wed Sat` and no `is-shut`. It also asks the
    browser that taught Monday 17 *computes* differently from unticked Monday 9 (opacity, background
    image, border colour), and that the `already teaching` key is under the week. That half is asked
    of a real browser because jsdom applies rules in sheet order rather than by weight, and drops
    values it cannot parse.
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
| *Found in review:* `works` also asks the venue | form journey (it was green before) | Tia at the Thursday-shut hall draws `[Tuesday]` |
| *Found in review:* `is-busy` taken off the card's cell | card journey, and the card state at 390 | the taught Thursday 16:00 is drawn `hr shut` |
| *Found in review:* the `.prof-week .hr.is-busy` rule deleted | card journey, and the card state at 390 | no rule, and in the browser Monday 17 computes the same as Monday 9 |
| *Found in review:* the same rule renamed `.is-busy-gone` | card journey | no rule (the first regex let `-gone` through and stayed green, so it now ends at the class name) |
| *Found in review:* the key not drawn | card journey, and the card state at 390 | no key saying what the taught cell means |
| *Found in review:* the taught hours left out of the `aria-label` | card journey | reads "Available Tuesday 10:00" |

Looked at in `check/ui.js --shots` at 320 and 390:

- **The card** shows four rows under the hour header (Mon, Tue, Wed, Sat), Monday 17 hatched between
  the lit 16 and 18, and the `already teaching` key under Saturday. At 320 it was already at the 70%
  floor and still scrolls inside its pane. Photographed separately with the review's extra tutors, the
  one with Thursday 16 taught and Friday 10 free now shows `Thu` with one hatched cell at 16 and `Fri`
  with one lit cell at 10, then the key, at both 320 and 390.
- **The form with Ada chosen** shows Monday, Tuesday (`× 2`), Wednesday and Saturday between Space and
  Term, with no Thursday, Friday or Sunday line. At 320 it now fits without being drawn smaller.

**On a shared machine at a load average of 15 to 30:**

- `check/cascade.js` took more than ten minutes in one call. It was run in two halves by screen (95
  states, then the other 85), and both halves were green.
- `js/check-flow.js` also took more than ten minutes in one call. It was run in four slices by journey
  number, and all 274 journeys passed.
- `check/press.js` crashed four times when the memory cgroup's OOM killer took a Chrome renderer.
- In some of the full runs, the games swipe chain missed one to three times. That test sends a second
  flick 20 to 400ms after the first, timed on the wall clock. The review saw the same misses on the
  commit before this one. The chain landed every time in two runs (`--screen=booking` and
  `--screen=reel`), so the misses are load, not this change.
