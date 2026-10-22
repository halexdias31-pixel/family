## 393 — a profit formula and a visualiser on the Business column (2026-10-22)

**Asked for as** "In the Business column (admin only), show a formula for my total profit, and a
visualiser too. I can manipulate the formula there — change the values of the constants/variables."

**What it is.** The Business column (`biz`, admin only) now opens on two pages before the five records
cards: **Profit** (the formula written out, a period selector, the figures term by term, a waterfall of
revenue → each cost → profit, and a line of profit against one chosen term with today's value marked)
and **Profit · the terms** (the result again, one slider + number box per term, a Reset to actual tile).
`profitCards_` in `js/records.js`; `bizPages_` puts them first, so the column is eight pages.

**The formula is the site's own money model**, not a generic one — `priceFrom` and `bookMoney_` in
`js/core.js`. The tutor is paid the first seat's rate plus `c` of every extra seat; the business keeps
`B` of every extra seat; the room is passed through; a % discount comes off teaching and (by default) out
of the business's share; card fees are `card_fee_pct`% of what is charged plus `card_fee_fixed` a payment.

```
Profit  = Revenue − Tutor − Room − Fees − Other
Revenue = N·h·(P·(1 + (c + B)(n − 1))·(1 − d%) + V)
Tutor   = N·h·P·(1 + c(n − 1))        Room = N·h·V
Fees    = f%·Revenue + f₀·q·weeks      Other = O × months
N       = S × weeks in the period (week 1, month 52/12, year 52)
```

S sessions a week · h hours a session · n seats a session · P rate an hour for the first seat · c, B the
tutor's and the business's share of each extra seat · V room hire an hour · d discount % · f card fee % ·
f₀ card fee per payment · q payments a week · O other costs a month. Practicals' materials and trips'
tickets are left out: they are charged at cost × markup and do not change the shape of the sum.

**Where each starting value comes from**, said beside each control:
- *this month* — `profitActual_` reads the admin's `clientClasses` (only an admin is sent `tutorPay` and
  `adminKeeps`, doget.gs), takes each non-waitlist, non-cancelled job's dates in this calendar month and
  shares its price, tutor pay and admin profit over them. S = sessions ÷ weeks in the month, n = mean
  seats, h = mean hours, q = jobs whose first date is this month ÷ weeks. P is backed out of tutor £/h =
  P(1 + c(n − 1)); V is what is left per hour after the tutor and the business.
- *config* — c, B, card_fee_pct, card_fee_fixed (and h with no bookings) from `DATA.constants.vars`.
- *tutors' rates* / *venues' rates* / *open rate* — with no bookings this month, P is the mean of the
  tutors' rates (else `OPEN_RATE`) and V the mean venue `bestRate`.
- *placeholder* — d and O (0), and S, n, q with no bookings. No business figure is in the repository.

**A what-if, on this device.** Moving a value writes `profit:whatif` to localStorage (with the period and
the chosen x-axis term) through `keepPut_` as a quiet convenience; nothing is sent and nothing reaches
the sheet. A moved term says *what-if* in gold. Reset to actual drops them all. The cards are redrawn
in place as a value moves (`profitRedraw_`), not repainted, so the slider stays under the finger; the
sliders carry `data-noswipe` so a sideways drag moves the value rather than the column.

**Two pages, not one.** As one card it was ~1,300px on a 390px phone and `paneReach_` shrank it under
70%; split, the sum page draws at ~97% and the terms at ~88%. The term captions are `<p>`, not
`<label for>`: a label is a tap target and the layout check measured twelve 13px-tall ones.

**No backend change.** Everything needed was already in an admin's payload; the version stamps are
untouched and nothing needs deploying beyond `git push`.

**Checks.**
- check-flow *profit: …* — an admin's column opens on Profit then its terms; the formula, two charts and
  12 controls are drawn; with one booking this month and c = B = 0.25, n, h, P, V, c, B start at 2, 1, 10,
  6.25, 0.25, 0.25 and say *this month* / *config*; moving n changes Profit on both pages, is kept in
  `profit:whatif`, posts nothing; Reset puts it back; `profitCards_()` and `bizPages_()` draw nothing for
  a signed-out visitor, a tutor, a parent or a student. Mutation: the `isAdmin` line removed from the
  cards → red (client and student were drawn it); restored → green.
- `BIZ_NAMED_` now also matches `data-profit`, `data-pf`, `pf-…` and `profit-reset`, so the existing
  "no Business column for anybody else" and sign-out journeys also prove no profit markup is in their page.
- The admin business journey wants eight pages (Profit, its terms, five records, the verse screen).
- check-drafts lists the twelve boxes under KEPT (`profitKeep_`).
