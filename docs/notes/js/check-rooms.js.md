# js/check-rooms.js

The full text of comments in `js/check-rooms.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-rooms.js — A ROOM'S BLANK CELL IS ITS VENUE'S, ASKED OF THE REAL BACKEND

top level, before `fs`

```
/* ==================================================================================================
   node js/check-rooms.js — A ROOM'S BLANK CELL IS ITS VENUE'S, ASKED OF THE REAL BACKEND

   *"Also I forgot to database even the rooms within venues. For example colliers would library has 3
   rooms within it. 2 are same size and one is large. And 2 have capacity for 4 kids and large one has
   capacity for 10 kids."* — the owner, 10 Oct.

   THE ROWS AS THE OWNER DESCRIBED THEM HAVE NO PRICE, and a blank rate used to be sent as 0 — which
   this site reads as FREE: "free" on the venue card, the room priced at nothing, `isHome` calling it
   somebody's house. `roomTerms_` in backend/booking.gs is the one place a room's blank cell becomes
   its venue's, and every reader that prices or caps a room asks it. Each rule below is one that fails
   QUIETLY — a price that looks plausible, a seat count that looks like a decision:

     1. THE PAYLOAD. A blank rate is the venue's `cost_per_hour`; a blank minimum the venue's
        `min_students`; a blank capacity the venue's `max_students`; blank hours the venue's grid. An
        explicit 0 rate stays 0 — free on purpose is a thing a person can type. `fields` keeps the
        cells as typed, so a blank is still visibly blank to whoever edits it.
     2. THE SEAT CAP. `capacityFor` gives each room its own capacity — 4, 4 and 10 — the building's for
        a bare name, and the building's for a room with no capacity typed.
     3. THE PRICE FLOOR. `priceLooksWrong` judges a room booking with the room's rate (the venue's,
        for a blank one) — it looked the whole "Venue — Room" label up, found nothing, and judged every
        room as free. A free-on-purpose room is still judged as free.
     4. A BOOKING, THROUGH doPost. `createJob` refuses a room booking priced below the room and the
        teaching, takes one that covers them, and charges the BUILDING's travel for a booking in any
        of its rooms.
     5. THE WAITING LIST. `waitlistPrice` prices a room's list with the room's rate and seats it by the
        room's capacity, and doGet sends a seat price under each room's label — the label the booking
        form looks it up by — so a venue with rooms still has waiting lists. Asked of rooms whose rate is
        NOT their venue's too (an own 25, a typed 0): a blank-rate room cannot tell the two apart.
     6. THE FIXTURE SENDS WHAT doGet SENDS. `check/fixture.json`'s venue rooms are rebuilt from their
        own `fields` through the real doGet and must come back identical, and so must their entries in
        `waitlistSeat`: the phone-side checks (`check-flow`, `check/ui.js`) lean on those rows, and a
        fixture written from belief is how three faults hid in one week.

   THROUGH THE REAL `doGet` AND `doPost`, over `check-gas-load.js`. The venue is a public library and
   its rooms are the owner's description; every person is invented and `example.org`.
================================================================================================== */
```

### ---------- AND A ROOM WHOSE RATE IS NOT ITS VENUE'S

top level, before `own`

```
/* ---------- AND A ROOM WHOSE RATE IS NOT ITS VENUE'S -------------------------------------------
     THE TWO ABOVE CANNOT TELL THE ROOM'S RATE FROM THE BUILDING'S. All three Colliers Wood rooms have
     no rate typed, so the room's rate IS the venue's 15 — and `waitlistPrice` reading the venue's
     `cost_per_hour` straight past the room answered both rules exactly as right. Found by review:
     that mutation in `waitlistPrice` left this file 39 of 39 green. So the two rooms of the invented
     building whose rate differs from it: Medium room 1's own 25 and Small room 1's typed 0, against
     the building's 20.

     (25 room + 14 open tutor + 3 x 5 extra seats) / 6 — six because the room has no capacity typed
     and the building holds six, under the config's eight — is 9 a seat-hour; read as the building,
     (20 + 14 + 15) / 6 is 8.17. And (0 + 14 + 3 x 2) / 3 for the free room is 6.67, where the
     building's 20 would make it 13.33 — free on purpose priced as somebody else's hall. */
```

### ---------- AND SO ARE ITS ROOMS' WAITING-LIST SEATS

top level, before `seat`

```
/* ---------- AND SO ARE ITS ROOMS' WAITING-LIST SEATS ----------------------------------------------
     `check-flow` READS `fx.waitlistSeat` AS IT STANDS, so a room's seat price written into the fixture
     by hand would be believed by every phone-side check — and review found nothing asked whether those
     entries were what doGet sends. They are asked here, for the same cells as above.

     THE CONFIG IS THE ONE THE FIXTURE'S OWN BUILDING ENTRY IMPLIES. A payload does not carry
     `open_tutor_rate` or `waitlist_seats`, so they are worked back from the building's seat: its seats
     ARE `waitlist_seats` (the building holds more), its hours ARE `h`, and with no extra-seat charge its
     whole hour less the building's rate IS the teaching. One equation, so the building's own entry
     comes back by construction — the rooms' do not: a room priced as the building, or seated by the
     building, comes back different. */
```

