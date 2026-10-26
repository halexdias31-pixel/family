# 466 — No syncing: a plain calendar, Term dates and Countdowns on Tools, a Newspaper on Reels

The owner, 26 Oct 2026:

> "I've decided there will be no syncing — it complicates things. Clients book and this does not update
> their availability; their availability is not affected by anything. They choose their availability in
> their settings. Their rota is not affected by anything, their calendar is not affected by anything. The
> calendar is currently in sync with the academic interval (term) dates — remove it. It's a plain calendar.
> Make a widget in the Tools column telling the user the end dates of the next 3 academic intervals.
> Countdown widget should be available for everyone under Tools. Make a newspaper widget in the Reels
> column as a placeholder for now."

## What was coupled, and what was decoupled

Searched `js/` and `backend/` for availability, rota, timetable, calendar, terms/intervals.

- **Availability** — nothing wrote to it. `availGrid_` (me.js) draws only the person's own `people`
  hour cells; `PROFILE_READONLY` greys only `dbs_checked` and `role`; no booking or job writes to the
  availability cells (`createJob` writes `slot_codes` on the job row, not on the person). Left as it is.
  Booking still *checks* a named tutor's hours (`tutorHoursRefusal_`, booking.gs) and a room's taken hours
  (`spaceBusy`) so a seat is not double-booked; those read, they never write back.
- **Rota (the Timetable tool)** — *was* synced: `tmtHtml_` (games.js) merged this week's booked sessions
  (`weekSessions_`, book.js) into the written week as locked green rows (`tmtBooked_`), and a Saturday
  booking forced the weekend open. Removed: the timetable is only its own lessons; the weekend shows only
  when its box is ticked. `weekSessions_`, `tmtBooked_` and `.tmt-row.is-booked` are gone.
- **Calendar** — *was* synced: `calendarMarks` laid terms (start/end), half terms, sessions (`myJobs_`),
  exams, birthdays, bank holidays/closures and events on the month, with a key (`calKey_`, `CAL_KINDS`)
  and a day sheet (`cal-day`). Removed all of it: a plain month, today in gold, nothing else; marked
  `pure` (it draws the same for everyone). The calendar never had entries of the person's own.
- **Backend** — unchanged, so no version stamps were bumped. `intervals` is still sent: booking needs it.

## Added

- **Term dates** (Tools, `termdates`): the end date of each of the next three terms/half terms
  (`intervals_()`, holidays skipped, ended ones dropped), one line each; "No term dates yet." when none.
- **Countdowns** (Tools, `countdowns`): moved off Student settings — one home. For everyone: the next
  holiday needs no account; your exam lines (About you, school year) when signed in. Same data and
  config keys as before (`progressCountdownRows_`); a saved exam date repaints it (`progressRedraw_`).
- **Newspaper** (Reels, `newspaper`): a placeholder, its title alone.

The admin's layout tiles (463) reach the three new widgets like any other.

Journeys: `466:` calendar plain, timetable without bookings, term dates, newspaper; the countdowns and
"your exams" journeys read the Tools widget. Removed: "your week holds your sessions…" (`weekSessions_`).
