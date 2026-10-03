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
