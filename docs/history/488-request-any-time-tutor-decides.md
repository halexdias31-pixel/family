# 488 — Ask any tutor for any hour; the tutor decides

The owner, in a Note for Claude (Ledger `claude_notes`, 27 Oct 2026):

> "also i want to limit syncage as it complicates things. let clients be able to request bookings with
> tutors regardless of availability. tutors can choose to accept or deny anyway."

## The flow now

1. **A client asks** (`createJob`, Client rank and up — a child is already refused by `KID_MONEY_ACTIONS`).
   Any day and hour, any tutor, including one who has set no hours. Only the **room** can still refuse
   (`roomClashRefusal_`, venue closed or room already booked): that is a building, not a person's choice.
2. **The request is pending on the tutor.** A named tutor is logged as `Request` only — no longer also
   `Accept` on their behalf ("chosen by the family at booking"). The job is `stealable: FALSE`, so
   no other tutor can take it, and the family cannot accept the tutor for them (`move` refuses
   "Waiting for … to accept or decline.").
3. **The tutor (or an admin) answers in place** on the session's receipt: `Accept request` /
   `Decline request` tiles (`jobTiles_`, `requestAsked_`, tiles.js). Decline opens one optional line
   for why under the row. Both post `answerRequest` (dopost.gs; `self` in `ACTION_ACCESS`; script lock;
   only the asked tutor, Staff rank, or an admin).
   - **Accept** logs the tutor's `Accept` on each client — mutual, as the lobby's Accept always was — so
     the family is Agreed and gets **Pay and confirm** (the existing `createCheckout` route; money is
     frozen by `jobMoneyFreeze_` exactly as `move` does). Payment rules are unchanged.
   - **Decline** logs the tutor declining themselves with the reason as the message. The tutor leaves
     the job; the family keeps it and reads "Declined by Ada: “reason”" (`requestSaid_`).
4. **Both sides read the status** in one paragraph under the tile row: "Waiting for Ada to accept or
   decline." / "Accepted by Ada." / "Declined by Ada: …". Mail goes through the existing `notify`
   (category `booked`): the tutor on the request ("may be outside your usual hours"), the family on the
   answer. No new service.
5. **Who sees it** is `doGet`'s existing rule (`iAmIn`): the family on it, the tutor on it, an admin.
   Another family sees it only if it was opened to others; another tutor never.

## "Limit syncage" — what tied availability to booking, and what was switched off

466 had already removed the calendar and timetable syncing; no calendar import/export or auto-blocking
exists in `js/` or `backend/`. What was left coupling a tutor's hours to booking:

- **Off:** `tutorHoursRefusal_` (booking.gs) — the server refusing a named tutor with no hours, an hour
  outside their week, or an hour they already teach. Deleted.
- **Off:** the booking grid greying cells by the tutor's week or their busy hours (`slotGrid`), and
  hiding days the tutor does not work. Every day and hour is drawn open; the cell's title says
  "outside their usual hours — they decide". Under the week a guide: "Ada is usually free Mon 16–18.
  Any other hour can be asked; they accept or decline."
- **Off:** a tutor with no hours greyed in the Tutor list and stopped at Send (`tutorNoHours_`, book.js
  and receipt.js). Deleted; their card now says "Hasn’t set usual hours yet — ask for any hour".
- **Off:** naming a tutor auto-confirming them (the `Accept` logged for them at booking).
- **Kept:** a room's hours and bookings (`roomClashRefusal_`, `spaceBusy`) — a room cannot be in two
  places; the tutor's `busy` still reaches the phone, as a hint only. The GitHub code sync (sync.gs),
  the films sync and Google Tasks (475) are unrelated to booking and untouched.

Checks: check-profile 15 is the backend journey (ask outside hours → pending; strangers blind; the family
cannot accept for the tutor; tutor accepts → Agreed both sides; tutor declines with a reason → family
sees it, tutor no longer holds it; admin declines for a tutor). check-rooms 7 now expects Ada's busy hour
to be asked, not refused. check-flow: the week, the no-hours tutor, Client House and the request tiles.
Backend 2026-10-27-z8-booking-requests (all four stamps).
