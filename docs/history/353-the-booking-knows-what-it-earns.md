## The booking knows what it earns: a Money block for an admin, a Format for every booking, an admin's discount, and the figures frozen when the job is agreed

**The owner, 18 Oct**, approving the plan for the booking form:

> *"Yes ok let's go. By the way I am aware of no profit for me when only 1 kid."*

So there is **no platform markup**. A one-child session earns the business nothing and the Money block says
£0.00; the business's share stays the seat cut on extra seats (`B`, or the tutor's own `extra_seat_cut`,
docs/history/345) plus any margin on practical kit.

### What was there

- `priceFrom` (core.js) priced the teaching and the room and split it into `tutorPay`, `profitTotal` and
  `venueTotal`. An admin's form showed `Client pays / Tutor earns / Admin earns` (`formMoney_`).
- Nothing knew about kit, tickets, travel, card fees or a discount, so "Admin earns" was the seat cut and
  nothing else — on a practical whose kit had eaten most of it, too.
- The job row kept `price_total`, `tutor_pay`, `admin_profit` as the phone sent them. Nothing recorded what a
  booking was agreed to earn.

### What it is now

**1. `bookMoney_` (core.js) is the one sum**, pure, called at the end of `priceFrom` and returned as `L.earn`
(with `L.format`). Teaching is priced exactly as before, in every format; `L.total` is unchanged for a
tutoring booking with no discount.

| term | how |
|---|---|
| materials | (practical `cost_per_run_gbp` × children × sessions + `setup_cost_gbp` once) × config `materials_markup` — blank = 1, at cost |
| tickets | (`ticket_child` × children + the tutor's `ticket_adult`) × sessions, at cost |
| travel | `travel_per_child` × children × sessions, at cost |
| discount | `%` off the **teaching** only (never kit, tickets, travel); `£` off the total |
| card fees | `card_fee_pct` % of what is charged + `card_fee_fixed` — both blank = 0 |
| net | charged − tutor payout − venue − materials cost − tickets & travel − card fees |

A discount absorbed by **Business** (the default) leaves the tutor's payout whole, so it comes out of the seat
cut and the kit margin first and past them takes the net negative. **Shared with tutor** scales the tutor's
payout and the business's teaching share by the same fraction. A negative net is never clamped.

Per **session** (`slots`), not per booking, for kit, tickets and travel: a term of practicals runs the kit
each week; the set-up is once. A trip is normally one session, so the difference rarely shows.

**The Money block** (admin only, `formMoney_`, under COST): Charged · Discount (business / shared) ·
Materials (charged in the label, cost as the figure) · Venue · Tickets & travel · Tutor payout · Card fees ·
Net profit with its margin. A row appears where its format or figure makes it a fact; Charged, Tutor payout,
Card fees and Net always. Net is red when negative, with one sentence: *"This booking costs you £X."* The
detail sits in the **label**, never the figure: the first screenshot at 390 had `£53.00 − £10.00 = £43.00`
and `£9.00 / £9.00` in the figure column, which pushed the card 60px past its edge and cut the answers off.

**2. Format — a new question, not "Kind" renamed.** `Kind` is instant class against waiting list (when it
runs); Format is what it is. They are independent, so one field could not hold both. `format` (Tutoring /
Practical / Trip, fallback Tutoring) is asked on an instant class only. `bookOn_` now returns
`book, <format>` and `onlyHas_` asks whether any word matches, so `only: 'practical'` hides a row the way
`only: 'wait'` always did:

- **Practical** asks *Which practical?* from `data/practicals.json` (all 82; the 65 with no cost say "not
  costed" in the Money block rather than £0.00) and draws a `Materials` row under it.
- **Trip** asks *Which trip?* from the trips tab — empty today, so the row says **None yet** — hides Venue
  and Space (`only: 'wait, tutoring, practical'`, and the `venue` price row's `show`), sets V = 0 in
  `priceFrom` whatever `loc` still holds, draws `Tickets` and `Travel`, and caps the seats at `max_children`
  (`tripCap_`). Trips gain `trip_id, place, ticket_child, ticket_adult, travel_per_child, ratio` in SCHEMA
  and TRIP_GROUPS; `doGet` sends them. `ratio` is kept, not enforced.

**3. An admin's discount**, one line directly above COST (`discountRow_`): `%` or `£`, how much, a code or a
reason (a datalist of the new **`promo_codes`** tab: `code, type, value, absorbed_by, max_uses, used,
expires, active, notes` — in TAB, SCHEMA and WHERE, sent by `doGet` to an admin alone), and who absorbs it.
Picking a code fills its terms. COST reads `COST · £X − £D =` with £Y as the figure. A FORM has controls:
two selects, two boxes, 44px. The boxes are kept as typed (`bookKeep_`, check-drafts lists them).

**The server refuses it from anybody else** — `discountRefusal_` (booking.gs), the `seatCutRefusal_` shape,
asked in `createJob` before anything is written, against the token's own row. A code is held to its row every
time: switched off, expired, used `max_uses` times, or sent with a different type or value is refused; a
good one has `used` counted up after the job is written. The pricing tab's `promotions` are untouched.

**4. Frozen when agreed.** `createJob` writes the new jobs columns as sent (`gross` = what the client is
charged, the discount already off; `tutor_payout, venue_cost, materials_charge, materials_cost,
tickets_cost, card_fees, discount_type, discount_value, discount_code, discount_absorbed_by, net_profit,
format, practical_id, trip_id`), `priced_at` blank. On the `move` whose Accept leaves everybody at Agreed or
past it (`jobAgreed_`), `jobMoneyFreeze_` works the card fees out from that day's config, writes the net as
the row's own subtraction, and stamps `priced_at`. A row with `priced_at` is never written by it again, so a
fee or markup changed later rewrites no old booking. **Run `ensureSchema` once after the sync** (`?setup=1`):
`doGet` does not, and until then the new columns are missed writes (docs/history/345 has the same step).

### Proved

`check-booking.js` loads core.js whole over its own DATA (tutor £30, c 0.5, B 0.2) and lifts the freeze and
the guard from booking.gs: tutoring 1 child 2h £60 / £60 / £0; 2 children £102 / £90 / £12; practical
(£2 kit, £5 set-up, ×1.25) £11.25 materials, £113.25, net £14.25 (blank markup: at cost, £9); trip 3
children 4h £337 / £240 / £48 with V = 0 at a £15 room; £10 business £92 / £90 / £2; 10% shared £91.80 /
£81 / £10.80; 10% off a practical takes £10.20, never the kit; £20 off one child nets −£20; card fees 1.5% +
20p on £102 = £1.73, net £10.27; the freeze at 1.5% (£1.53, £10.47) survives a change to 3% + £1; a parent's
discount refused; a used-up, expired, switched-off or inflated code refused.
`check-flow.js` — *the booking form shows an admin what a booking earns, and a parent nothing of it*, and
the Money block in *each person sees their own figure*: the admin gets the discount line directly above
COST and every Money row; a parent with the same draft sees none of it, is priced without the discount and
sends no discount field; a trip draws no Venue or Space and says None yet. *The paper keeps the same rows*
reads `only:` as a list of words now.

Every rule was broken once and went red, and green again restored: % off the total, shared not scaled,
markup ignored, a trip hiring the room, card fees not subtracted, no adult ticket, a frozen row re-frozen, a
non-admin's discount let through, `max_uses` ignored, the Money block, the discount line or the discount
price given to a parent, the Venue price row on a trip, and `onlyHas_` answering yes to everything.

### Left

- The saved receipt (`jobRows`) does not print Format, Materials or the frozen figures yet: `doGet` does not
  send the new jobs columns to the phone. They are on the sheet.
- An `Edit` after agreement changes `price_total` and not the frozen breakdown — the frozen figures are what
  was agreed; re-pricing an edited booking is a decision for the owner.
- Materials and tickets are charged to the family in COST like any other line; `materials_markup` and the
  card fee are the owner's to choose and are blank.
