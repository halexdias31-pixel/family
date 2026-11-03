# 620 — The rate, the extra seat, @family.'s share and the class size: three cards, one home each

**Reported** from the owner's screenshot, 2 Nov. The "Rate and class size" settings card showed two rows: "@FAMILY.'S
SHARE OF AN EXTRA SEAT, 0–2 (BLANK = THE USUAL)", editable and holding 15, and STUDENTS 1 – 2. Save said *"Only
@family. sets its share of an extra seat. Nothing was saved."*

## Cause

1. **Two homes.** `hubOwns_` (me.js, 444) took `rate_per_hour` and `extra_seat_rate` off the card whenever the Staff
   hub was showing (a tutor, or an admin who tutors), because the hub's Pricing also saved them. The rate was gone
   from the card, so the person typed their rate (15) into the only money box left.
2. **The cut was drawn editable.** With the rate missing, `cardRateHtml_` fell back to plain `fieldRows_`, and the card
   editor's `box` made a field read-only only if it was in `DATA.profileReadonly`. The rule "the cut is read-only
   unless you are an admin" lived only in `settingsCards_` and in the pounds path, so this path drew a typeable cut
   box for everyone. The backend's rule (`seatCutRefusal_`, admin only) was right, and it refused. That is why a
   tutor could type into a box the server would never take. The site and the server already agreed on who is an
   admin: the site's `isAdmin()` is `rankAtLeast_('admin')` on the `rank` the server sends (`rankOf`), and
   `hasRole(me, 'admin')` gives the same answer, since no alias maps to admin. `updateProfile` now asks
   `rankAtLeast_` as well, so the two are one rule written twice. An admin's own card gets the cut box, and the
   server takes it.
3. **One refusal blocked the card.** `updateProfile` returned the first refusal, so the class size sent with the cut
   was dropped too.

## Fix

- **Three cards, one home each** (the owner, through the coordinator): *Rate and extra seat* (the rate x and the
  tutor's share k), *@family.'s share* (g, a box for an admin and words for everybody else), *Class size* (min and
  max). Each card shows what it does in pounds: +£k·x/h for each extra student to the tutor, +£g·x/h to @family.,
  and what one student and a full class pay an hour. `hubOwns_` is gone. The hub's Pricing is now only a place to try
  numbers, with no Save; its tile *Set it* opens the card (`price-card`).
- **The price, one formula:** n students pay `x + k·x·(n−1) + g·x·(n−1)` an hour. `priceFrom` (core.js) already
  works this out: `fSeats = 1 + (cUsed + bUsed)·(n − 1)`, applied to `R = x·subject·level·day·time`. So both shares
  sit inside the multipliers and the discount brackets. With one subject and neutral multipliers it is exactly the
  owner's sum, and `rateRange_` (cards.js) shows that same group total for `maxStudents`.
- **Partial saves:** a refused group (the pricing group or the cut) is left out, the rest is written, and the reply
  carries `refused` and `said: "Saved — the rest. Not saved: …"`. If nothing is left to save, the reply is the old
  error, ending "Nothing was saved." The card does the same for a seat part past its top.
- **Seat cap:** the tutor's share k is at most 1 (`SEAT_RATE_MAX`, constants.gs, and `STAFF_SEAT_MAX`, core.js;
  check-staff checks that both are 1). An extra seat never costs more than the first student. `seatShare_` prices an
  older share above 1 as 1. @family.'s g keeps its 0 to 2 range.

Checks: check-staff (1.5 refused, partial save, the two caps agree), check-handles (1 allowed, 1.5 refused),
check-flow's `rate card (620)` and Staff hub pricing journeys, and check/states.js's admin card.
