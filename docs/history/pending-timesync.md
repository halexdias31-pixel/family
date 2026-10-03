## The calendar, the timetable and a tutor's hours read one set of facts, and stopped clashing

**Asked for as *"i need to fix how calander and time table and availability and all of that should
work or be set up or synced. it seems they clash"*.** An audit mapped every surface that shows a time
(hour grids, the tutor's card, busy hours, Your week, the Timetable, the Calendar, terms, festive
dates). The principle the owner was given and agreed to: **each fact is written in one place** — a
tutor's hours on `people.availability`, sessions on `jobs`, dates on the terms / holidays tabs and
the computed school year — and every view only reads them. Asked about family busy times, the owner
answered *"tutor with no hours wont be bookable. families dont have the availabilty widget really so
no for that question"* — so there is no family grid and nothing blocks a booking on a family's
times.

### 1. The bugs, each one a fact read two ways

- **Your week lit the first day of a booking.** `norm(j.day).indexOf('mon') === 0` is true for
  `Monday, Friday` and false for Friday — the fault history 124 fixed in `jobGrid_` and `busyHours`
  and not here. `jobDays_` splits the cell the way those two do.
- **Your week drew strangers' lessons.** It read `DATA.liveJobs`, which carries other families'
  OPEN sessions so a family can ask to join. `weekSessions_` goes through `myJobs_`, as
  `liveWidgets_` always has.
- **Nothing had dates.** Your week showed a booking that ended in July; `busyHours` greyed a tutor's
  hours for ever after a term and before one started. A session is on a day now when that date is
  one of its `session_dates` (`jobOn_`); `busyHours(name, from, to)` counts a job only while its
  first-to-last dates overlap the window — today for the grid and the card, the booking's own dates
  for `createJob` (step 2). A job with no dates still counts: of the two ways to be wrong, only
  offering a taken hour sells it twice.
- **Two hour spans.** `AVAIL_HOURS` ran 9–19 and `SLOT_HOURS` 9–18, so a seven o'clock tick was lit
  on the tutor's card (which widened itself to show it) and could never be booked. The owner chose
  *"9-6"* for the booking grid (history 125), so `AVAIL_HOURS` is 9–18 now, the card draws exactly
  `SLOT_HOURS`, and `check-booking.js` holds the two lists equal. An old `m19` in a cell is no longer
  sent and goes at the tutor's next save.
- **A bank holiday was a session.** `computeSessionDates` walked every week of a term, so the Early
  May bank holiday was on the receipt and in the price. `closures()` (booking.gs) sends
  `DATA.closures`: England and Wales bank holidays worked out from Easter and the "first Monday in
  May" rules with gov.uk's substitute days, INSET / closed / one-off bank rows off the holidays tab
  (`kind` = `inset`, `closed` or `bank`), and any festive event the business is running
  (`festiveReady_`, the same test `festiveOffers` uses). `computeSessionDates` steps over them, so
  the dates, the count and the price are the real ones without `priceFrom` changing.

Checked: `check-booking.js` — *a tutor is busy only while a session is running, or across the window
asked about*; *the hours a tutor can tick are the hours a family can book*; *the bank holidays are
the ones gov.uk publishes* (2026, 2027, 2028 — every substitute shape). `check-profile.js` §14 — the
real `doGet` sends Christmas, next New Year's Day on its kept weekday, a typed INSET day and a running
festive event, and not an observance nobody switched on. `check-flow.js` — *your week holds your
sessions only, on every day they run, while their dates are live*; *a closed day inside a term is
stepped over, and the price counts the sessions that run*. Each proved by mutation (first day only;
`DATA.liveJobs` for `myJobs_`; dates ignored; the closed-day skip removed; the date window removed
from `busyHours`; 19 put back on `AVAIL_HOURS`; the Boxing Day substitute removed; every observance
treated as closed; the payload key dropped) — red for the stated reason, green again restored.

### 2. A tutor with no hours is not bookable by name

**The owner's answer: *"tutor with no hours wont be bookable."*** `slotGrid`'s note said an empty
grid meant every hour open, because "nobody has said anything". A tutor who never opened Settings was
offered as free all week. Now, one question (`tutorNoHours_`) and four readers:

- **The tutor dropdown** draws them disabled with *"· hasn't set their hours yet"* beside the name —
  greyed, not absent, for the reason `stepSelect_` gives every option. A generic `off` hook on a
  step does it, and the `book-set` handler refuses an `off` value however it arrives.
- **The hour grid** shuts every hour for a named tutor with no hours and says why. `No preference`
  is untouched; a venue with no hours is still read as open (the owner's sentence was about tutors).
- **The send** stops before `createJob`, and now sends `slots` — every ticked hour code — because
  `day` / `time` / `hours` are only the first run.
- **The card** says *"Hasn't set their hours yet, so they can't be booked by name"* where it drew
  nothing, and to an admin adds where the hours are ticked — the account column draws every tutor
  for an admin, so that is where an admin sees who has not filled their week in.

**And the grey cells stop being advice.** `createJob` asks `tutorHoursRefusal_` of the named tutor's
row before anything is written: no hours at all; an hour outside their ticked week (named back, e.g.
*"does not teach at Sunday 10:00"*); or an hour they are already teaching in the weeks this booking
runs (`busyHours` over the booking's own first-to-last dates). An older phone with no `slots` is
checked off `day` × `time` × `hours`. No tutor named books as before.

Checked: `check-profile.js` §15 through the real `createJob` — eight rules, each a refusal that
writes no job or a booking that goes through; `check-flow.js` *a tutor with no hours is greyed,
shuts the grid and is not sent for; No preference still books*, and the card journey now asks for the
sentence. Mutations: the no-hours refusal, the outside-the-week refusal and the date window removed
on the server; `off`, the handler guard, the grid's `tNone`, the send guard, `slots` and the card's
sentence removed on the phone — each red for its reason, green restored.
