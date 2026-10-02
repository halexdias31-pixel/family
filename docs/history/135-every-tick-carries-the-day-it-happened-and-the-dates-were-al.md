## Every tick carries the day it happened, and the dates were already on the phone

**Asked for as "The tick boxes have a date for when it got requested. When other things get ticked
they should also have a date."**

**`doGet` HAS PUT `events: eventsForJob(jobId)` ON EVERY JOB SINCE THE ROSTER WAS DERIVED FROM THE
LOG** — six fields a row, `at` among them — and the only reader anywhere in `js/` was nothing at all.
This repository's oldest shape once more, and it means the dates for `Accepted` and `Paid` needed no
backend change: they are days the job's own log already records.

| | its date | from |
|---|---|---|
| **Requested** | the job's own `created_at`, or the first `Request` if that cell predates the column | a cell, then the log |
| **Accepted** | the **last** `Accept` | the predicate needs EVERY seat agreed |
| **Paid** | the **first** `Confirm` on a session, the **last** on a full waiting list | `jobStage_` needs one booked seat, or the whole house |
| **Started** | `startDate` | the dates the tick is read from |
| **Completed** | `endDate` | the same |

**THE TWO RULES ARE OPPOSITE ENDS OF THE LIST AND THAT IS NOT A PREFERENCE** — each is taken to match
its own predicate, which is the only rule that stays right when the predicates differ. `paidNeeds_`
is `jobStage_`'s own arithmetic rather than a second reading of it.

**THE LAST `Accept` IS EXACT FOR EVERY STATE THE APP CAN REACH, and that took checking.** Two things
could have broken it. An `Edit` drops everybody un-booked back to Waiting, so a re-Accept follows —
and the last Accept IS that re-Accept, which is the right day. And the admin's Accept writes one
event per participant on every press, so a second press would move the date with nothing having
changed — except that `bmActionsFor` withholds `ACT.ACCEPT` from a seat already at `Agreed`, and
`check-flow.js` already asserts an admin is only offered it on a booking that is waiting.

**`at` IS DAY-GRANULAR** — `eventsForJob` puts it through `fmtDate`, so the time `logEvent` wrote is
thrown away. Right as a label and useless as a sort key, so nothing sorts by it: the log is
append-only and **array order is the order things happened in**.

### One date format, because the three sources spell a day three ways

`createdAt` and an event's `at` both go through the backend's `fmtDate` and arrive as `dd/mm/yyyy`;
`startDate` and `endDate` are cut straight out of the `session_dates` cell and are whatever somebody
typed. So **`Accepted 25/09/2026` sat above `Started 06/10/26`** — one column, two spellings, on a
document read by running your eye down it. The app's own `fmtDate` is the format the `Dates` row
three lines up already speaks, applied where the value is built so no `when` has to remember.

### An un-ticked stage shows no date, and `Started` is why that is a rule

`Started` and `Completed` are read off the PLANNED calendar, so their dates are known in advance and
could be shown before the tick. **They are not.** The value column everywhere else means *the day
this became true*; a future date in it would make one column mean two things, told apart only by
whether the box beside it is filled. The plan is already on the card — `Dates` prints the range and
the count.

**And a ticked stage with no event draws the tick and nothing else.** Printing a dash or the word
unknown is content where a blank is skimmed past; reaching for a nearby event's date is the `cost: 0`
shape on a document somebody keeps.

### The rule tests the arithmetic, not the rendering

A wrong end of the list is the kind of thing that is subtly wrong for years, so the journey runs
`stageRows_` over a log where **two families move four days apart** — the two right answers are the
two INNER dates, the second `Accept` and the first `Confirm`, never the first Accept or the last
Confirm. A log where everybody moved on one day would pass whichever way round they were read. The
same log with `kind: 'waitlist'` must move `Paid` to the LAST Confirm, which is one rule giving two
answers. And the chain is asserted from the other side: a stage below an un-ticked one carries
neither a tick nor a date.

**Proved by mutation in four directions** — the first `Accept`, the last `Confirm`, the chain removed
so a date appears under an empty box, and a job with no log. All four are named; the real files pass
all 32 journeys.

### And the state was seeding a receipt with no log at all

`check/states.js` seeded no `events`, so `Accepted` and `Paid` could tick with no date and **the lab
could not tell that from a date that failed to draw**. It seeds a real log now, with the two families
moving on different days, and `createdAt` in the long form the server actually sends so the card's
shortening is measured rather than assumed. Third time in two commits that a state was found stating
a shape `doGet` does not send.
