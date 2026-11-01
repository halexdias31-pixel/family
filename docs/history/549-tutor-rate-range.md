# 549 — A tutor's rate is shown as a range

**Asked** in notes N-1793311389215-83215 (first part) and N-1793312162669-96959: wherever a tutor's
hourly rate is displayed, show "£min–£max/hour".

- **min** is the first-seat rate (one student); **max** is that plus the extra-seat rate × (max seats − 1).
  The extra-seat rate is `profSeat_` (cards.js): the rate × (tutor's share c + business's share b), the
  same "+£x/h a seat" the card already printed.
- Max seats 1, blank, or no extra-seat rate → the single rate. No rate → nothing (the old fallback).
- **One function**, `rateRange_(t)` in cards.js, used by the tutor card (Find and the staff profile
  column), the shared profile picture (`tpngRate_`, posts.js) and booking's tutor choice (`label_` of the
  `tutor` step, book.js; hidden from a child as every price is, 398).
- **Display only.** `priceFrom` and everything that charges are untouched.

Check: check-flow "a tutor's rate shows as £first-seat–£full-class/hour…" — units (10 + 3 × 3 →
£10–19/hour; one seat → £10/hour; no max → £10/hour; no rate → ''), the drawn card, the picture and
booking's label. Proven by mutation (max reduced to the first-seat rate turns it red).
