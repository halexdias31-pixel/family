## A child is shown no price, and a parent books

**The owner, 23 Oct:** *"Kids' profiles shouldn't be able to see tutors' prices."*

### Who counts as a child

The backend's `isChild_` (people.gs): a `student` (or `pupil`/`kid`) whose acting role is still student —
not also a parent (`client`), an admin, or a tutor somebody has said yes to. A student who ticked Tutor and
is waiting is still a child. The phone's half is `childView_()` (core.js): `student` held, `client` not, and
not `isTutorRole()`. Parents, tutors, admins and signed-out visitors are unchanged.

### The rule, server-side — `kidPricesOff_` (people.gs)

`netViewerSet_` now records `child: isChild_(row)` next to `admin`. `kidPricesOff_` runs wherever the
surname net runs: in `jsonOut` (every doGet and doPost reply, the sign-in reply included) and on the doGet
body before it is kept in the cache (the kept copy goes out by `jsonRaw_` and never meets `jsonOut`; it is
kept per viewer, so a child's kept body is a child's). It walks the reply and, for a child only:

- empties every key in `KID_PRICE_KEYS` wherever it sits — an array to `[]`, an object to `{}`, a figure
  deleted, so every `|| []` and `(DATA.multipliers || {}).levels || {}` on the phone still holds:
  tutors' `rate`, `extraSeat`, `extraSeatCut`; venues' `bestRate`; rooms' `rate`, `concession`; sessions'
  `price`, `tutorPay`, `adminKeeps`; trips' `pricePerChild`, `ticketChild`, `ticketAdult`, `travelPerChild`;
  `waitlistSeat`, `multipliers`, `pricingRows`, `promoCodes`; the per-seat figures a waitlist reply carries;
  and the raw sheet columns inside the `fields` objects (`cost_per_hour`, `rate_per_hour`, `price_total`…);
- drops a tag with a `£` in it (a venue's `+£15/h` is a tag);
- deletes the money rows from `constants.vars` (`KID_PRICE_VARS`: the seat and subject fractions, the
  discounts, `open_tutor_rate`, `waitlist_extra_seat`, card fees, materials markup);
- leaves the `shop` alone — coins and the business's own stock, not a tutor's price;
- leaves her OWN `profile` whole (the sign-in reply and `myProfile`, where `personId` is hers): a Settings
  form opened without a field writes it back blank on Save (`check-profile` caught this).

`?receipts=1` sends a child an empty list: a receipt is nothing but money.

### Booking: a parent books and pays — the option chosen

Before this, a child could ask for a session herself. But a request is priced on the phone (`bookPrice`)
and sent as `price`, and a child's phone now has no rates to price it from — so either the server prices a
child's request on its own, or a child does not send one. The simplest consistent rule: **a child does not
spend money.** doPost refuses `createJob`, `createCheckout`, `finalizePayment`, `joinWaitlist`,
`joinFestive`, and `move` with `Request` or `Pay`, for a child, with one sentence (`KID_ASK_PARENT`):
*"A parent books and pays for sessions — ask yours to book this one. Nothing was booked."* Nothing is written.
`Withdraw` and everything else she could do before is unchanged.

### What a child now sees

- **Tutor cards** (Find, Find 2, Spotlight, anywhere `findCard` draws a tutor): no price box at all — not
  an empty one.
- **Venue cards**: "up to 4" without "· £15/h"; a room with neither says nothing rather than "free".
- **The booking form**: every question as before, no figure columns, no `× +/h +` header, no total row, and
  in place of "Ask for it" the line *"A parent books and pays for sessions — ask yours to book this one."*
  Share stays — it is how she shows a parent.
- **Her sessions**: the paper without `Total`, `About … × £`, or a total row; no Pay and confirm tile; on a
  session she is not in, no Join or Take a seat tile.
- **Festive events**: no "Per child" row, and "Ask a parent to sign you up." in place of Come along.
- `isHome` no longer reads "no rate" as "a home" for a child (her phone has no rates).

### Not changed, and why

- **Signed-out visitors** still see prices: the public listing is how a parent shops, and the owner's words
  were about kids' profiles.
- **The shop** (coins, wearables, the business's own priced items) — not a tutor's price.
- **Practical kit costs** on library practical cards come from `data/practicals.json`, not the payload — a
  materials figure for running a science practical, not a tutor's rate.
- **DMs and posts** carry whatever people type; nothing structured in them is a price.
- **The Sunday email** goes to parents only.

### Checks

- `js/check-kid-prices.js` (in check-all): the real doGet/doPost as a child — payload, kept payload,
  sign-in reply, receipts, myProfile, getProfile of a tutor, messages — carries no money key with a value
  and no `£` + digit outside the shop; each money action is refused with the parent sentence and writes
  nothing; a parent, a student-who-is-a-parent, the tutor, the admin and a stranger still see the £27/h
  (which proves the scan sees a price at all). Its key list is its own, not imported from the backend.
- check-flow: *a child sees a tutor card, the booking form and her session without any £, and is told to
  ask a parent* — the same surfaces drawn for a parent must show £ first.
- `check-profile`, `check-surnames` and the surname journey in check-flow booked as a child; they now book
  as a parent or as the admin under the child's whole name (the admin's `clientName`), which keeps every
  name-net question they asked.

Stamps `2026-10-23-a-kid-prices`, all four.
