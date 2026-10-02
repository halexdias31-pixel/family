## The profile card is chips under captions, and a tutor picks the venues they will teach at

**Asked for as "the years experience should also be a google chip … a smaller rate to the side so
clients can know extra cost for the extra seat … details confirmed shouldnt be a line. enhanced dbs
check shoulnt appear up there. treat it like an extra qualification … tutors should be able to select
the venues they are comfortable tutoring at. remove the city".**

- **Experience, group size and session length are one row of chips** under `At a glance`
  (`profFacts_`); the Experience, Studying (dead — `doGet` always sent `''`), Each extra seat and
  Details confirmed rows are gone, so `profDate_`/`profStale_` went with them.
- **The extra seat sits beside the rate**: `+£15.00/h a seat`, from `seatShare_` — the reader
  `priceFrom` uses — so the card and the booking agree. The old row printed the tutor's FRACTION as
  money (`£0.50/h`), which was wrong.
- **Captions** `Teaches` / `Qualifications` / `Tutors at` over each chip row, because two rows of
  identical pills could not be told apart.
- **No city, no DBS stamp.** `Enhanced DBS` is on the extra-qualifications list, so a tutor who holds
  one ticks it and it is a dashed chip. The card no longer says a DBS is MISSING; checking the
  certificate belongs in business records.
- **`venues_ok` is a pseudo-field over the venues tab's own `tutors_happy_here` column**, not a new
  people column: `venuesFor_` reads it, `venuesWrites_` writes only the cells that change and keeps
  other people's entries, and new entries are the `person_id`. The uncalled `toggleVenueComfort`
  handler — which let anybody name any `body.handle` — is deleted. `doGet` sends `venues` per tutor.
