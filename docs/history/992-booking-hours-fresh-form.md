# 992 — every hour toggles, every form is fresh, nine till nine (12 Nov 2026)

The owner, as admin, could not change the hours on a new Instant class at Client House. There were two causes.

1. **The venue's hours locked the grid.** The live Client House row had no `takes_all_seats`, but it did have one
   stray availability cell (`w15`). `slotGrid` shut every hour the venue did not list, so only Wed 15:00 could be
   tapped. That went against 488, which says a week is a guide. Now only a booked room (`sp.busy`) shuts a
   cell. A venue's usual hours are given as a reason ("venue usually closed — we check") and the cell stays
   open.
2. **The previous form came back.** The booking form was kept as a synced draft (317). Its ticked Wed/Sun
   17–18 hours came back on the next form, drawn shut, and looked "already booked". Owner: each new form is
   a fresh form. `bookKeep_` now drops the draft and `bookBack_` reads nothing. The four journeys that
   checked the draft survived a sign-out or reload were taken out (21, 22 ×2, and the booking half of 23's
   317 journey). `check/flow/37-booking-hours.js` checks the opposite.

The owner also asked for one span for every hour grid: 9:00 to 21:00. `SLOT_HOURS` (9–20, the last cell
starts at 20:00) and `AVAIL_HOURS` moved together. The codes were extended (`m19`, `m20`) and none were
renumbered. The version stamps were bumped.
