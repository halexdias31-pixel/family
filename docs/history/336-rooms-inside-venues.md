## Rooms inside a venue: a blank cell is the venue's, and every reader that prices a room asks one function

**The owner, 10 Oct:** *"Also I forgot to database even the rooms within venues. For example colliers
would library has 3 rooms within it. 2 are same size and one is large. And 2 have capacity for 4 kids
and large one has capacity for 10 kids."*

### What was there

The `rooms` tab already existed — in `TAB`, `WHERE` and `SCHEMA`, and on the live Ledger with a header
and no rows. doGet sent each venue's rooms, `bookableSpaces` (js/core.js) turned them into the booking
form's spaces as `"Venue — Room"`, the venue card drew one line per room, and `capacityFor` narrowed a
"Venue — Room" to the room's own `max_capacity`. Nobody had ever put a row in it, so none of that had
run against a real one.

### What the owner's rows would have done

**The owner gave sizes and no prices**, so the rows have a blank `rate_per_hour` — and a blank was sent
as `N('') = 0`. Zero on this site means FREE:

- the venue card said **"up to 4 · free"**, and `priceFrom` priced the room at nothing;
- `isHome` read the zero as "nobody pays for this room", so *"Are you providing the space?"* was
  locked to Yes;
- `priceLooksWrong` looked the WHOLE label "Colliers Wood Library — Large room 1" up on the venues
  tab, found nothing, and judged the room free as well — measured: £25 for two hours in the large room
  was accepted, against a floor of (15 + 14) × 2;
- `travelCost` made the same whole-label lookup, so a booking in any room was charged no travel;
- `waitlistPrice` made it too, and `payload.waitlistSeat` was keyed by the building alone — once a
  venue has rooms the form offers only its rooms, so **entering the rooms switched off the venue's
  waiting lists**, on the phone ("not priceable") and on the server ("no price set");
- a room's blank `availability` was sent as `null`, leaving the fallback to `slotGrid`, which looks
  the venue up by the booking's location — "Venue — Room" again — and so offered every hour of the
  week whatever the building's hours.

### What it does now

**`roomTerms_(room, venue)` in backend/booking.gs, and nowhere else.** A blank cell is the venue's:
rate → `cost_per_hour`, minimum → `min_students` (one is the floor), capacity → `max_students`, hours
→ the venue's `availability`. **An explicit 0 rate stays 0** — free on purpose is a thing a person can
type, a blank is a thing nobody did, and `S()` tells them apart where `N()` cannot. Concession is not
inherited: it is a second price on the one room and a venue has no column for it.

`spaceOf_(label)` splits the phone's "Venue — Room" into the venue row, the room row and the room's
terms, and **every reader that prices or caps a room goes through it**: the rooms doGet sends,
`capacityFor`, `priceLooksWrong` (so `createJob`'s check), `travelCost` (the building's travel, whichever
room) and `waitlistPrice`. doGet sends a waiting-list seat under each room's label as well as the
building's. `fields` still carries the cells as typed, so a blank stays blank to whoever edits it.

All four stamps went to `2026-10-10-j-rooms`.

### The rows, and two departures from the brief

Three rows for Colliers Wood Library: capacities 4, 4 and 10, `active` TRUE, notes saying the two small
rooms are the same size, and rate, concession, minimum and hours **blank** — so each is £15 an hour and
keeps the building's hours until somebody types otherwise.

- **Names from `ROOM_SLOTS`, not invented.** The brief said "Room 1", "Room 2", "Large room".
  constants.gs fixes the names a room may have — *"asking someone to invent names produces "Room 2",
  "room2" and "Small Rm" across eleven venues"* — and `saveRoom` finds a room by venue + name, so a
  row named off that list is one the room editor, when it is wired, would not find and would duplicate.
  So: **Small room 1, Small room 2, Large room 1.**
- **Ids in `saveRoom`'s shape**, `'R' + Date.now()`, rather than R001–R003. Nothing reads `room_id`.

### What still caps the large room at four

**`max_students_per_job` is 4 on the live config tab** — the business's own limit on a class, which
`seatLimits` applies on top of the room (*"your limit"*), and which `createJob` writes as the job's
`max_students`. `waitlist_seats` is 4 too. So until those cells are raised, the large room's ten is a
line on the venue card and nothing more: a booking there still offers four seats. That is deliberate
(booking.gs: *"a hall that holds thirty does not mean you want thirty children in one session"*), so
it was left for the owner to decide rather than changed here.

### Deploy the backend before the rows

The live backend is `2026-10-10-g-schema-grid`. Over these rows it sends rate 0 for all three rooms,
hours `null`, no room waiting-list prices, and accepts £25 for two hours — measured by running the
pre-branch backend over the Ledger copy with the rows in. **Push and pull the backend first, check the
You screen reads `j-rooms`, then paste the rows.**

### Checks

`js/check-rooms.js` (on the roster): the owner's three rooms and an invented building's free-on-purpose
and own-rate rooms, through the real doGet and doPost — the payload, `capacityFor` 4/4/10, the floor, a
`createJob` refused at £25 and taken at £60 with the building's travel, the waiting list's seats and
labels — and **the fixture's rooms rebuilt from their own cells through the real doGet**, which must
come back identical. `check/fixture.json`'s venue has the three rooms (two at the venue's 12 with no
rate typed, one at its own 20), and a `check-flow` journey asks the phone about them: the three spaces
and not the building, ten seats in the large room and four in a small one, the blank one priced at the
venue's rate and not taken for a home, "No/Yes" on hosting, a waiting-list price in each room, one card
line per room, and the live house cap of four still winning. Each was turned red by a mutation and the
real files went green again.
