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

### What the large room's ten does, and what it does not

**One booking is four seats in any room, by the form's design, and this note first said otherwise.** It
said `max_students_per_job` (4 on the live config tab) was what held the large room to four, and that
"until those cells are raised ... a booking there still offers four seats". Review drove the form at 390
over the fixture, which has no house cap at all: `seatLimits` gave the large room `max: 10`, and the
Extra seats list still offered 0, 1, 2 and 3 — `BOOK_STEPS`' `n` step is **four options from the floor**,
the owner's *"change this to be extra seats, then options are 0,1,2,3"*, and `seatLimits` only trims that
window from above. The check-flow journey was titled "the large one seats ten" and had only ever asked
the refusal (`why('10')`, which is silent on ten), never the list.

So, measured rather than supposed:

- **One family books 1–4 chairs** in the large room exactly as in a small one, whatever the room or
  `max_students_per_job` says. Raising that cell does not change it; lowering it below four would.
- **`max_students_per_job` is how big a class can grow**, not one booking: `createJob` writes it as the
  job's `max_students`, and a family asking to join an open class is refused once the job is full —
  the lower of `capacityFor` (the room's ten) and that `max_students`. At 4 a class in the large room
  stops at four; at 10 it could take ten.
- **`waitlist_seats` is a waiting list's size** — `waitlistPrice` seats a list at the lower of the room
  and that cell, so at 4 the large room's list has four seats and its price is divided by four.
- **The ten is on the venue card**, one line a room, and in `seatLimits`' ceiling (a saved or carried-over
  count above four is not refused in the large room).

If the owner wants ONE family to be able to book ten in the large room, that is the `n` step's
four-option window, which is the owner's decision and was not changed. The journey now asks the list —
`["1","2","3","4"]` in the large room and in a small one — so this note and the form cannot part again
(mutation: the window widened to nine options turns it red).

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
and not the building, a ceiling of ten in the large room and four in a small one (and the seats list
four options in both), the blank one priced at the
venue's rate and not taken for a home, "No/Yes" on hosting, a waiting-list price in each room, one card
line per room, and the live house cap of four still winning. Each was turned red by a mutation and the
real files went green again.

### Review, 10 Oct: three findings, each reproduced

1. **The large room's ten** — the section above, rewritten. It was a wrong claim in this note and in the
   report, not a fault in the code.
2. **Nothing proved a room's own rate prices its waiting list.** All three Colliers Wood rooms have no rate
   typed, so the room's rate IS the venue's 15, and `waitlistPrice` reading the venue's `cost_per_hour`
   past the room passed every rule (39 of 39). `check-rooms.js` now prices the invented building's two
   rooms whose rate differs from it — Medium room 1 at its own 25 (9 a seat-hour, where the building's 20
   gives 8.17) and Small room 1 at its typed 0 (6.67, not 13.33) — and rule 6 asks that the fixture's
   room entries in `waitlistSeat`, which `check-flow` believes as they stand, are what the real doGet
   sends for the same cells (the config worked back from the fixture's own building entry). The
   mutation now fails three rules; a hand-edited fixture seat fails one.
3. **You could not tell which room was chosen.** A select cannot wrap, and the three rooms are one string
   until the last word: at 390 every one read "Colliers …" on the Venue row, on the form and in the
   picture the Share tile makes, so only the rate beside it said which. Putting the room first would not
   have saved it — "Small room 1" and "Small room 2" are both "Small roo…" in 81px. **The row draws its
   answer as words that wrap, with the select laid exactly over them** (`wrap: true` on the `loc` step,
   the foot of `stepSelect_`; `.bk-face` in style.css): the select is still the control under the finger
   and the `<label for>`'s target, its arrow is drawn, and only its own letters are unpainted
   (`-webkit-text-fill-color`, which no other rule sets and the share clone copies). At 390 the large
   room is five lines — the same five the saved receipt already wraps it to. Opt-in rather than every
   row: the other answers are told apart by how they start. `check/states.js` has **"a room chosen,
   named whole on its row"** (the words are the option's whole text, uncut, and the select covers them,
   at five widths), `check/share.js` photographs the form in that state and asks the room is in the
   picture as the row's words, and the check-flow journey asks the markup for each room. All three were
   red with book.js and style.css put back as they were, and green after.
