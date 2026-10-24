# 434 — every booked hour, and a room that can be busy

Steps 1 and 2 of `docs/time-design.md` (findings A and B): the two that let money go wrong.

## What was wrong

**Only the first run was stored.** The booking grid lets a family tick Monday 10–12 and Friday 16–18, and the phone has
sent every ticked code as `slots` since the grid became a grid. `createJob` wrote `weekday: "Monday, Friday"`, one
`start_time` (the first run's) and one `hours_per_session` (the first run's length). 124 called that "an honest
simplification", but `busyHours` reads the row back: it greyed **Friday 10–12**, which nobody booked, and left
**Friday 16–18**, which somebody had, free for the next family. Two runs on one day (Mon 10–11 and Mon 14–15) collapsed
to one. `tutorHoursRefusal_` already checked every *asked* hour against the tutor's busy hours; it was the *held* hours
that were wrong.

**Rooms were never busy.** `busyHours` is per tutor. Two families could book the same room at the same hour with two
different tutors, or with No preference, and both were accepted. `capacityFor` caps the seats inside one job, not
overlapping jobs.

**And the test and the write were apart.** `createJob` asked its refusals and then wrote the row with no lock, and a
job only holds an hour once its `request` event exists (`jobStatusOf` reads a job nobody is in as cancelled). Two phones
pressing Book in the same second could both pass.

## What it does now

- **`jobs.slot_codes`** (new column, SCHEMA, so `ensureSchema_` adds it on the next admin page load): every booked hour
  as the grid's codes, `m10,m11,f16,f17`. `createJob` writes `bookingCodes_(body)` — the sent `slots`, or for an older
  phone the day + time + hours it sent. `weekday`, `start_time` and `hours_per_session` are still written for the
  readers that use them (receipt, Calendar label, `weekSessions_`).
- **`jobCodes_(j)`** (booking.gs) is the one reader: `slot_codes` when the row has them, else the old weekday + start +
  length. `busyHours` reads it.
- **`spaceBusy(label, from, to)`** — the hours a room is already taken, derived from `jobs` the same way (live roster,
  dates overlapping the window, `jobCodes_`). Only a label that names a real `rooms` row counts. A bare venue, a home and
  Online are not one space: whether a venue with no rooms should be treated as a single space is an owner decision
  (time-design §6), and refusing there could stop bookings the business relies on.
- **`roomClashRefusal_(body)`** — `createJob` refuses a booking whose hours land on a room already taken in those weeks:
  *"Colliers Wood Library — Small room 1 is already booked at Monday 17:00 in those weeks. Pick other hours, or another
  room."* Through `jsonOut({ error })`, so the phone shows it where it shows every other refusal (`book-send`'s error
  path, receipt.js). The tutor's refusal (`tutorHoursRefusal_`) is unchanged and now sees every held hour.
- **One hold.** The two refusals, the row, the promo-code count and the roster events are written under the script lock,
  after a `clearCache()`, so the second of two simultaneous bookings sees the first.
- **The grid says so first.** `doGet` sends each room's `busy` (`spaceBusy` for today), `bookableSpaces` carries it,
  and `slotGrid` shuts that hour with the reason *room booked* — as it already did *teaching …* for a busy tutor.
- **The backfill.** MIGRATIONS `jobs-slot-codes` (`backfillSlotCodes_`, retry) fills a blank `slot_codes` from the row's
  weekday + start + length, on the self-running setup (361). Only blank cells are written, so a second run writes nothing;
  a row with no day or time is left blank and counted (`noHours`). An old multi-day row is filled with what it always
  meant to the code — the true second run was never stored and cannot be recovered; such a booking needs its
  `slot_codes` typed by hand from the receipt.

Stamps `2026-10-24-i-booked-hours` (all four). After deploying: Apps Script ↓, Deploy → New version, open the site once
as an admin; the Setup card on You should show `jobs-slot-codes` ran.

## Proved by

- `check-booking.js`: a row with `slot_codes: m10,m11,f16,f17` is busy exactly there (not Friday 10–11); an old row with
  none still reads from weekday + start + length.
- `check-rooms.js` §7, through the real `doPost`/`doGet`: a two-hour booking writes `m16,m17` and makes the room busy at
  both; `doGet` sends that room's `busy`; a booking over the second hour is refused and writes no row; the same hours in
  another room are taken; Mon 16 + Fri 17 with a named tutor stores both runs, and the room's Friday 17 and the tutor's
  Friday 17 are both refused while the tutor's Friday 16 (the hour the old row wrongly held) is free. §8: the backfill
  fills an old row, leaves a filled one and a dayless one alone, writes nothing the second time, and is a MIGRATIONS entry.
- `check-flow.js` *a room already booked at an hour greys that hour on the grid, for that room only*.
- Mutations, each red then green again: no `slot_codes` write (6 rules), `jobCodes_` ignoring `slot_codes` (4 + 3),
  the room refusal off (4), `createJob` skipping it (4), the migration unhooked (2), the payload's `busy` dropped (3),
  `slotGrid` ignoring room busy (the journey).

## Left for later (time-design steps)

`weekSessions_`, the Calendar label, `jobWeekRows_` and `payStatement_` on the phone still read weekday + start +
length, so the Timetable and receipt of a two-time booking still show the first run on every day — step 1's front-end
half. Exceptions (away weeks), venue-as-one-space and admin overrides are steps 3, 9 and 10.
