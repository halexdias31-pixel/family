## A booking may run on several days, and three readers thought it ran on one

**Asked for as "audit the booking system and address any issues to make it more stable."** The state
machine itself came back clean — measured across nine states of the form, in a real browser: **no
throw, no NaN, no card that failed to draw, and `resetBooking_` leaves nothing behind.** What was
wrong is one fact, read three ways, in three files, and all three were written when a booking had
one day.

**The hour grid has let somebody tick hours across several days for a long time.** `bookRuns` folds
those ticks into runs and `bookSpec` joins the days with commas — so `weekday` genuinely reads
`Monday, Friday`, and it has done since the grid was built.

### The days came back alphabetically by their code prefix

**`bookRuns` ended `sort((a, b) => a.day.localeCompare(b.day))` over `m / tu / w / th / f / sa /
su`**, which is **Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday**. Measured: a
Monday-and-Friday booking — the commonest two-day shape there is — came back `Friday, Monday`.

**AND IT IS NOT ONLY THE READING ORDER, because three things are taken from the FIRST run.** The day
list goes on the receipt and into the job's `weekday` cell; `time` is the first run's hour and
becomes `start_time`; `hours` is the first run's length and becomes `hours_per_session`, which
`priceLooksWrong` then measures the total against. So **a Monday 10–12 with a Friday 16–18 recorded
its start as 16:00**, and a Monday 10–12 / Wednesday 15–16 / Friday 09–12 recorded a three-hour
session because Friday sorted first.

**The total is unaffected and that is exactly why nothing caught it**: the money is `hoursPerWeek ×
weeksBooked` and the real session dates, both sums over every run, so every figure on the card was
right while the day and the time beside them were not.

**`blockSay_` ALREADY LEARNED THIS** — *"in the week's own order, off `SLOT_DAYS`, so Sunday cannot
sort to the front"* — on the waiting list's week, written months after this one. One lesson, applied
to one of the two weeks, which is this repository's oldest shape.

### The receipt drew an empty week for every multi-day booking

**`jobGrid_` did `norm(label) === norm(j.weekday)`.** For `Monday, Friday` that is false for Monday
AND for Friday, so **nothing lit**. Measured: **2 cells on a one-day job, 0 on a two-day one, 0 on a
three-day one** — the tallest block on the receipt, dark, on exactly the bookings somebody most
needs to check, and reading as a week with no session in it rather than as a fault. That grid exists,
by its own note, so a family can SEE when their session runs instead of reading it off a line.

**One span, shown on each named day**, because the job row holds one `start_time` and one
`hours_per_session`. Where the runs really differ the row is already a simplification of them, and
lighting the span the receipt states on each of its own days is the honest reading of it. Lighting
nothing was not.

### AND THE SAME CELL SOLD THE SAME HOUR TWICE

**`busyHours` in `backend/booking.gs` did `DAY[norm(j.weekday)]` and then `if (!d) return`.** A
multi-day job is not in that table, so it was **dropped entirely** — and `busyHours` is what greys an
hour on the booking grid. **A tutor already teaching Monday and Friday 10–12 read as free on both**,
so the next family could book the same tutor at the same time. Silently, and only on the multi-day
bookings.

**Of the two ways to be wrong here, one offers an hour that is taken and the other holds an hour that
is free, and only the first sells the same hour twice.** The function's own header said *"one weekday
and one time, repeating"* — true when it was written, and it stopped being true when the grid grew
days.

### Three rules, because a repair to the instance is this file's oldest fault

| | |
|---|---|
| `check-flow.js` | *a booking over several days reads in the week's own order* — the day list AND the start time, over four shapes including Sunday-and-Monday |
| `check-flow.js` | *a receipt lights every day its booking runs on* — 2, 4 and 6 cells |
| `check-booking.js` | *a tutor teaching on two days is busy on both* — and a cancelled session still releases its hours |

**Proved by mutation in both directions**, each against the exact line it replaced.

**`busyHours` is the first function in `check-booking.js` that touches a sheet**, and it is worth its
four stubs: it is the one thing in this subject area whose failure takes money from two people for
one session. **`N` is lifted from `constants.gs` verbatim rather than approximated** — a stub that
rounds differently from the real one proves the wrong thing.

**AND THE FIRST RUN OF THAT RULE REPORTED "nothing" FOR EVERY CASE, INCLUDING THE ONE-DAY ONE THAT
HAS ALWAYS WORKED.** With no events there are no clients, and `jobStatusOf` reads that as
**cancelled** — so the rule was measuring the skip rather than the day mapping. A live roster is
seeded now, and the cancelled case is asserted deliberately beside it, because a guard nothing
measures is a guard that can quietly become the reason a rule passes.

### Two things the audit found in the instruments rather than the app

**`check-flow`'s send-path journey seeded two Kind answers the form has not offered for months** —
`'A session of your own'` and `'A shared class — join the waiting list'`, against the real `Instant
class` / `Waiting list class`. It went on passing because `isWaiting_` is a substring test for "wait"
and the old label happened to carry one, so both branches really were exercised, **by luck, on two
strings nobody can choose.** It reads the step's own `options()` now and refuses if the two do not
take different send paths.

**And `computePrice` is named in two comments and exists nowhere.** The function that walks
`spec.windows` is `priceFrom` in `js/core.js`. **A backtick scan for the whole class of fault is not
shippable and was thrown away rather than committed**: over the four booking files it reports **38
findings and about one real one** — `orderPrints`, `toggleTopicTick`, `pastCard_`, `isClass_`,
`stepIsPanel_` are all things that were deleted and are correctly described in the past tense, which
is the house style. Nothing can tell that from a name that never existed. That is the
`check-rows.js` lesson, and the honest answer is that this one stays a reading job.

**The version stamps are bumped all four together**, because `backend/booking.gs` changed and the
You screen compares the whole stamp.
