# 463 — Trips and practicals are shop items, not a kind of booking

## What the owner said

- *"Trips should become items in shop, not an extra option in the drop-down list for booking. Also remove practicals as the extra option in the booking. This leaves the line redundant in the booking, so delete that line in the booking widget. Trips and practicals are just going to be items — that's how they manifest in the web app. It doesn't need a distinction."*

## What changed

- **The booking form** lost its `Format` line (Tutoring / Practical / Trip) and the `Practical` and `Trip` lines
  under it (353). A booking is teaching and a room again: `bookOn_` is `wait` or `book, tutoring`; Venue and Space are
  always asked; no Materials, Tickets or Travel rows; no trip seat cap on Extra seats. `BOOK_FORMATS`,
  `bookFormat_`, `bookPractical_`, `bookTrip_` and `tripCap_` are gone, and `bookMoney_` sums teaching, venue,
  discount and card fees only.
- **The send** no longer carries `format`, `practicalId`, `tripId`, `materialsCharge`, `materialsCost`,
  `ticketsCost`. `createJob` ignores them if an older phone sends them; the `jobs` columns stay (SCHEMA unchanged) so a
  past booking's row keeps its figures, and `booking.gs` still subtracts `materials_cost`/`tickets_cost` from an old
  row's net.
- **Trips are shop items.** `doGet` no longer sends `trips`; each active row of the `trips` tab (Ledger) joins
  `payload.shop` as an ordinary thing: name (with ` · date` when the row has one), `price_per_child` sent as pence
  (unit `p`, so the basket takes it as money, `cartPrice_`), description with place and `up to N children`, photo.
  It is bought through the Basket like any shop row. The `trips` tab stays in TAB/SCHEMA/WHERE — it is where an admin
  writes a trip; nothing in the sheet moves. `rowIndex: 0` so no shop editor treats it as a `shop` row.
- **Practicals** were already library cards in Find (`data/practicals.json`); their kit costs are private Ledger
  fields with no sale price, so they are not mapped automatically. A practical sold as kit is a `shop` row like
  anything else.
- Checks: `check-booking` drops the practical/trip quotes and proves an old draft's `format: 'Trip'` prices as
  tutoring; the flow journey "the booking form shows an admin what a booking earns" now fails if Format, Practical,
  Trip, Materials, Tickets or Travel rows come back, or the job sends those fields.
- Version stamps `2026-10-26-f-trips-are-items`.
- **A pence-priced shop card said "1200 credits"** while the basket took it as £12.00 (`cartPrice_`). The shop
  mapper now carries `pence`, and `thingCard_` says `money(cost / 100)` for it (no "can afford" colour, which is about
  credits). The pence journey checks the card says £0.30.
