# js/core.js

The full text of comments in `js/core.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — core.js ONE FILE, SPLIT.

top level, before `norm`

```
/* ==================================================================================================
   @family. — core.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   core.js is number 1 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### THE RULES. Carried over whole.

top level, before `norm`

```
/* ================================================================================================
   THE RULES.

   Carried over whole. Not one line of this knew what a sticky note was — it is all data in, answer
   out — which is exactly why it survived: the pricing chain, the seat limits, who may sit where,
   the status words, the chess engine, the feed.

   Months of work, and none of it needed changing. What burned was the markup that sat on top.
================================================================================================ */
```

### The small things everything above leans on.

top level, before `norm`

```
/* The small things everything above leans on. Taken WITH the rules rather than left behind —
   the first pass carried the pricing chain and not the function it compares names with, which
   parsed perfectly and threw the moment anything ran. */
```

### A ROW: A LABEL ON THE LEFT, A VALUE ON THE RIGHT

top level, before `row`

```
/* ==================================================================================================
   A ROW: A LABEL ON THE LEFT, A VALUE ON THE RIGHT

   THE MOST REPEATED FOUR LINES IN THIS APP. Thirty-nine of them, written out by hand across eight
   files, and no two files agreeing about the details — the value carried `v mono` in fourteen of
   them and a bare `v` in ten. Nobody chose that. It is what happens when the same small thing is
   typed out afresh each time: every copy is a chance to leave something off, and none of them is
   wrong enough to notice.

   A NUMBER IS MONOSPACED, A WORD IS NOT, and that is the rule those thirty-nine were groping
   towards. Figures in a column want to line up — `£15.00` above `£1.00` above `£286.00` reads as a
   column of money only if the digits are the same width — and a name or a place does not, because
   monospaced prose looks like a receipt when it is meant to look like a sentence.

   IT IS DECIDED HERE RATHER THAN ASKED FOR. Every caller passing `mono` by hand is every caller
   able to forget, which is exactly what the fourteen-against-ten was. If it looks like a number,
   it is set like one.

   Anything genuinely different says so: `big` for a total, `gold` for something you can act on,
   `bad` for a warning. Those are decisions; the typeface is not.
================================================================================================== */
```

### MONEY, A COUNT, A DATE, A PERCENTAGE — anything whose characters want to line up under one another.

in `row`

```
/* MONEY, A COUNT, A DATE, A PERCENTAGE — anything whose characters want to line up under one
     another. A dash is here because it is what a blank value shows, and a lone dash in the middle
     of a column of figures should sit where the figures sit. */
```

### THE SAME ROW, WITH THE VALUE ALREADY MARKED UP — a link, a coloured word, a small drawing.

top level, before `rowHtml`

```
/* THE SAME ROW, WITH THE VALUE ALREADY MARKED UP — a link, a coloured word, a small drawing. `row`
   escapes its value, which is right for text somebody typed and wrong for markup somebody built,
   so the two cases are two functions rather than one with a flag. A flag would be a way to turn
   the escaping off, and a way to turn escaping off is a way to forget it is on. */
```

### ---------- THE TWO SHAPES THE FIRST TWO COULD NOT MAKE

top level, before `rowLive`

```
/* ---------- THE TWO SHAPES THE FIRST TWO COULD NOT MAKE -------------------------------------------
   `row` and `rowHtml` covered most of a sheet and not all of it, so the rest were written out by
   hand — and a row written by hand is a row that can be spelt differently. Thirty-six of them were,
   across seven files, while the helper that existed was called by nobody.

   These two close the gap. Every label-and-value line in the app is now one of four calls, which
   means a new sheet cannot invent a fifth kind by accident and the four can be changed in one
   place. */
```

### A VALUE THAT CHANGES WHILE YOU WATCH — a clock ticking down, a score going up.

top level, before `rowLive`

```
/* A VALUE THAT CHANGES WHILE YOU WATCH — a clock ticking down, a score going up. It needs a name so
   something can find it and write to it, and that is the only thing separating it from `row`.
   The id is the LAST argument because it is the rarest: almost no value moves. */
```

### A ROW WITH NO LABEL — a name in a list, a line of a basket.

top level, before `rowValue`

```
/* A ROW WITH NO LABEL — a name in a list, a line of a basket. It is a row because it sits in a
   column of rows and must line up with them; it has no label because the heading above already said
   what these are, and repeating that on every line is noise.
   Its own function rather than `row('', x)`, because an empty string as a label is a thing somebody
   forgot to fill in, and a reader cannot tell which. */
```

### ---------- THE DAYS NOBODY IS TAUGHT, AS A LOOKUP

top level, before `CLOSED_`

```
/* ---------- THE DAYS NOBODY IS TAUGHT, AS A LOOKUP ---------------------------------------------
   `DATA.closures` IS `closures()` in booking.gs — the England and Wales bank holidays worked out, the
   INSET and closed days off the holidays tab, and any festive event the business is running — one
   `{ date: 'dd/mm/yyyy', name, kind }` per day. Turned into a set of midnight times once per payload
   rather than parsed again for every week of every term. Keyed on the array itself, so a new payload
   (which REPLACES `DATA`) is a new set without anybody remembering to clear one. */
```

### ---------- AND THE WEEKS THEY FALL IN STILL COUNT AS WEEKS

top level, before `computeSessionDates`

```
/* ---------- AND THE WEEKS THEY FALL IN STILL COUNT AS WEEKS -----------------------------------------
   A BANK HOLIDAY WAS A SESSION. This walked every week from the first day to the last and returned
   each one, so the Early May bank holiday — always inside Summer 1 — was a date on the receipt, a
   session in the count and a share of the price, on a day the library is shut and nobody teaches.
   The half terms were already out (they are between the windows, not inside one); the single days
   were not. Now a closed date is stepped over, so the dates, the count and the price are the real
   ones by construction: `priceFrom` bills `sessionDates.length` and has nothing to change. */
```

### ---------- AND A THIRD THING BOUNDS A SEAT COUNT: WHERE THE SESSION IS

top level, before `seatLimits`

```
/* ---------- AND A THIRD THING BOUNDS A SEAT COUNT: WHERE THE SESSION IS -------------------------
   ASKED FOR AS *"if its at clients house, then it should minimum 3 extra seats. there should be no
   option for 1 extra seat."* Three extra is four chairs including the booker's own, which is what
   `BOOKING.n` counts — see the note over the `n` step for why the stored number is the total and the
   drawn one is the total minus yours. So the second sentence is what the first one already means:
   with a floor of four, 1, 2 and 3 are not offered at all, and nothing has to forbid 1 separately.

   `loc` RATHER THAN `hosting`, AND THEY ARE NOT THE SAME QUESTION. "At the client's house" is where
   the session happens; `hosting` is who provides the room, and a family that books a hall themselves
   answers yes to that while being nowhere near their own front room.

   AND NOT `isHome`, WHICH WAS THE FIRST VERSION AND WAS WRONG. `isHome` answers "does anybody pay
   for this room", so it is true of every venue that costs nothing — `Online`, and every free
   library — and a floor of four chairs landed on a one-to-one video call and on a table in Sutton
   Library. That is the right question for `hosting` and the wrong one here. `atClientHome_` reads
   the NAME and nothing else: the literal `At home` the question offers first, and a venue row
   whose own title says it is a house. A free room is a free room; only a house is a house.

   AN EMPTY `loc` IS NOT A HOME. The venue is asked AFTER the seats, so this runs with nothing chosen
   on the way down and must not impose a floor on a question whose answer cannot yet be known.
   `isHome('')` is already false — no name matches, no space and no venue resolve — and it is guarded
   anyway, because that answer falls out of three lookups rather than being stated.

   SO THE FLOOR ARRIVES WHEN THE VENUE DOES, and the row says so rather than resetting itself: the
   `loc` step's own note records that decision for the maximum — *"the seat count is already chosen
   by now, so a room too small says so rather than quietly resetting it"* — and `n`'s `why` reads the
   CURRENT `BOOKING.loc`, so a booking for one that becomes a home visit grows a gold line under the
   seats row naming the minimum. Reordering the two questions would be the tidier fix and it moves a
   row on both documents for everybody, which is not this rule's to do. */
```

### A CELL WITH A CODE FALLBACK, which is this app's pattern for every editorial number — the `brand(k, or)` argument.

in `seatLimits`

```
/* A CELL WITH A CODE FALLBACK, which is this app's pattern for every editorial number — the
     `brand(k, or)` argument. Four is what was asked for, so an empty config tab enforces it; a 1 in
     that cell turns the floor off without a deploy. */
```

### THE EIGHT THAT WERE NEVER CARRIED OVER.

top level, before `OPEN_RATE`

```
/* ================================================================================================
   THE EIGHT THAT WERE NEVER CARRIED OVER.

   Each of these is referenced by the rules above and was not declared anywhere — so eight separate
   features would have thrown a ReferenceError the first time their path ran, and every one of them
   is on a path nothing has called yet. `node --check` cannot see any of it: a name that does not
   exist is perfectly good syntax right up until the line executes.

   All eight are restored from the pre-rewrite file rather than reinvented, because a plausible
   guess at OPEN_RATE is a wrong price, and a plausible guess at jobStatus is a booking in the
   wrong state. Where the original had a comment explaining itself, the comment came too.
================================================================================================ */
```

### R is the hourly rate, and it is the tutor's own.

top level, before `OPEN_RATE`

```
/* R is the hourly rate, and it is the tutor's own. A job nobody has claimed yet cannot be priced
   from the rate of a tutor who has not taken it, so an unclaimed one uses this.
   There is no minimum-wage floor and no markup: a tutor names their price, and what they are paid
   is what they charged. Your margin comes from B — your share of what an extra seat is worth —
   which is the only part of the price that is not the tutor's work. */
```

### An admin is a tutor with extra powers, so everywhere gated on "tutor" admits an admin too.

top level, before `tutorHeld_`

```
/* An admin is a tutor with extra powers, so everywhere gated on "tutor" admits an admin too.
   Written once rather than as `USER.role === 'tutor'` at each site, which is how an admin came to
   be refused by half the checks and allowed by the other half. */
```

### AND NOT A TUTOR WHO HAS ONLY TICKED THE BOX.

top level, before `tutorHeld_`

```
/* AND NOT A TUTOR WHO HAS ONLY TICKED THE BOX. The roles card in Settings lets anybody tick Tutor,
   and the server holds that tick for the admin (`tutorPending` on the sign-in reply — see
   `LISTED_PENDING` in constants.gs). This is the app's STAFF test — the open mark scheme, the
   tutor-only widgets — so a student ticking Tutor to see the answers must get the student's view
   until somebody has said yes. `tutorHeld_` is the other question, "did they ask", which the
   agreement card and the roles card want. */
```

### THE FOUR WORDS A JOB'S STATUS CAN BE, and nothing else.

top level, before `JOB_STATUSES`

```
/* THE FOUR WORDS A JOB'S STATUS CAN BE, and nothing else.
     unsent       built, not sent to anyone
     unconfirmed  created, nobody has paid — it exists on paper only
     active       at least one family is booked in and paying
     cancelled    everybody left
   Anything older in the sheet — Requested, Negotiating, Accepted, Unstarted — maps onto these, so
   rows written before the rename still read correctly rather than falling through to a default. */
```

### `jobStatus` was here — a booking's status worked out on the phone.

top level, before `promoApplies`

```
/* `jobStatus` was here — a booking's status worked out on the phone. The backend folds it from the
   events and sends it, and a second opinion computed from a partial copy of the data is exactly the
   kind of duplication that disagrees quietly. */
```

### DOES THIS PROMOTION APPLY to this booking?

top level, before `promoApplies`

```
/**
 * DOES THIS PROMOTION APPLY to this booking?
 *
 * Returns false for anything it does not recognise, which is the safe direction: an unknown promo
 * type that defaulted to true would silently discount every booking on the site, and the first
 * anybody would know of it is the money.
 */
```

### THE RUNNING TOTAL after a given row has applied.

top level, before `runningAfter`

```
/**
 * THE RUNNING TOTAL after a given row has applied.
 *
 * The last column used to hold each row's own contribution — "+ £3.08" — which made reading the
 * card an addition problem: to know what a booking costs after the level surcharge you had to sum
 * everything above it. A running figure answers that directly, and the last one IS the total, so
 * the column ends where the price ends.
 *
 * Walks the same order the card renders in, so the number beside a row is the price with that row
 * and everything above it applied, and nothing below.
 */
```

### The venue always ADDS its rate and hosting TAKES IT BACK on the row below.

in `runningAfter`

```
/* The venue always ADDS its rate and hosting TAKES IT BACK on the row below. Folding the hosting
     into the venue row meant that row said "+ £15.00/h" while the running total beside it did not
     move, and the Host row showed nothing at all — the deduction happened between two rows with
     neither of them reporting it. Each row moves the figure by exactly what it says it does. */
```

### ---------- ONE READER FOR THE SUBJECT MULTIPLIERS

top level, before `subjectMult`

```
/* ---------- ONE READER FOR THE SUBJECT MULTIPLIERS -----------------------------------------------
   There were two, and they did not agree.

   `priceFrom` read `m.subjectsEta`. `subjectRows`, which draws the subject cards, read
   `m.subjects || m.subjectsEta` — the other order. The backend happens to send the same table
   under both names, so today they land on the same number and the disagreement is invisible. The
   day one of those keys changes, the price a client is quoted and the surcharge printed on the
   card stop matching, and nothing anywhere will say so.

   Two names for one table is the backend's business and it can keep them. What must not be
   duplicated is the RULE for reading it: which name wins, and what a blank or a zero means. That
   is one fact, so it is written once.

   A blank or a zero is 1, which is "no effect" — the same rule `sur()` uses for levels, days and
   times inside `priceFrom`. These are multipliers; nothing in this table may ever zero a price. */
```

### ---------- AND ONE READER FOR THE LEVEL MULTIPLIERS

top level, before `levelMult`

```
/* ---------- AND ONE READER FOR THE LEVEL MULTIPLIERS ---------------------------------------------
   THE SAME FAULT SUBJECTS HAD, one table along. The rule for reading the level surcharge lived
   inside `priceFrom` as a closure, so nothing outside `priceFrom` could ask what a level costs
   without writing the rule out a second time — which is exactly how `subjectMult` came to exist.
   `levelRows` needs that number for the card, so it is written once, here, beside its twin.

   A blank or a zero is 1. Same rule, same reason: these are multipliers and nothing in this table
   may ever zero a price. `sur()` inside `priceFrom` now calls through to this for levels, so the
   figure on the card and the figure in the quote are one number rather than two that agree. */
```

### WHETHER A LEVEL HAS ACTUALLY BEEN PRICED, which `levelMult` cannot say — it answers 1 for a level set to 1 on purpose and 1 for a level nobody has ever

top level, before `levelPriced`

```
/* WHETHER A LEVEL HAS ACTUALLY BEEN PRICED, which `levelMult` cannot say — it answers 1 for a
   level set to 1 on purpose and 1 for a level nobody has ever entered, and those are different
   facts. The pricing tab is mostly the second: the comment in `priceFrom` below says most levels
   have never been given a multiplier, and a card that prints "no surcharge" over a blank cell is
   reporting a decision that was never made. */
```

### ---------- WHAT ONE EXTRA SEAT ADDS, AS A FRACTION OF THE RATE

top level, before `seatShare_`

```
/* ---------- WHAT ONE EXTRA SEAT ADDS, AS A FRACTION OF THE RATE -----------------------------------
   LIFTED OUT OF `priceFrom` so the tutor's card can print the same number the quote charges — *"a
   smaller rate to the side so clients can know extra cost for the extra seat"*. The card computing
   it again from the same three cells would be the second reader this repository keeps finding, and
   the two would disagree the first time `asFraction`'s bounds moved.
   `c` and `B` are passed in by `priceFrom`, which has already read them; the card asks with neither
   and they are read here the same way.

   AND THE BUSINESS'S CUT IS THE TUTOR'S OWN NOW, WHEN THEY HAVE ONE (docs/history/345). The owner, 12 Oct:
   *"Your cut off extra child for tutors should be editable on thir card. Like they can edit that small
   number to the right of their normal rate"*. So `B` — one config number for everybody, Settings' old
   "Your cut of an extra child" — is the DEFAULT, and `extraSeatCut` on the tutor's row (`extra_seat_cut`,
   set by an admin on the tutor's card) wins over it. `seatCutOf_` (below) tells the two answers apart that
   matter: a blank cell, or a backend too old to send the key, is NaN — the default, so every tutor is priced
   exactly as before until somebody sets theirs — and a nought is 0, which is no cut at all: the tutor keeps
   the whole of the seat. ONE READER, so the card's `+£X/h a seat`, the quote, the receipt's split and the
   editor's live preview cannot disagree about which cut applies. `bRaw` and `cutOwn` say which won, for the
   admin's line in the breakdown (`seatSource`); `seatOwn` says the same of the tutor's own part, for the
   card editor, whose pound boxes draw a part only where this function would use it (`cardSeatShown_`) —
   it drew a stored nought as "0.00" while this priced it at the config `c`, two boxes that did not add up
   to the seat printed under them (the review of docs/history/345). */
```

### ---------- A TUTOR'S OWN CUT, READ THE ONE WAY THE SERVER SENDS IT (`seatCutOut_`, people.gs)

top level, before `seatCutOf_`

```
/* ---------- A TUTOR'S OWN CUT, READ THE ONE WAY THE SERVER SENDS IT (`seatCutOut_`, people.gs) ----------
   A PLAIN DECIMAL FROM 0 TO 2, OR NOTHING — NaN, the default. It was `num`, which reads "10%" as 0.1, "1/10"
   as 0.1 and "0x1" as nought, while the server tested with `Number()` and sent with `parseFloat`: a tutor's
   crafted "0x1" over a cut of 1 passed the server's "has it moved?" as 1 and went to every phone as 0, no cut
   (the review of docs/history/345). One spelling on both sides now, the same pattern and the same bounds, so
   the cell the phone previews, the cell the server lets through and the number `doGet` sends are one answer.
   Out of range is the default too, never "no cut": "10" typed by hand meaning ten per cent must not take the
   business's margin to nothing. The phone's own copy because the phone also reads the RAW cell — the card
   editor's hidden box and `cardPatchRow_` — before any `doGet` has shaped it. */
```

### ---------- WHAT KIND OF SESSION, AND WHAT IT BRINGS WITH IT (docs/history/353)

top level, before `BOOK_FORMATS`

```
/* ---------- WHAT KIND OF SESSION, AND WHAT IT BRINGS WITH IT (docs/history/353) ----------------------
   THREE FORMATS, ONE TEACHING PRICE. "Tutoring" is what every booking was; a "Practical" adds the kit
   from `data/practicals.json`, a "Trip" adds tickets and travel from the trips tab and has no room to
   hire. Anything else — blank, an older draft, a typo — is Tutoring, because that is the format every
   row before this one was, and reading silence as a practical would bill somebody for kit. */
```

### ---------- THE ONE SUM FROM CHARGED TO NET

top level, before `bookMoney_`

```
/* ---------- THE ONE SUM FROM CHARGED TO NET ----------------------------------------------------------
   PURE: numbers in, numbers out, no DATA and no DOM, so `check-booking.js` runs the real thing over the
   owner's own examples. Whole-booking figures throughout; `priceFrom` divides by the split afterwards.
     materials  (kit per child per run × children × runs + setup once) × markup — at cost when the
                markup is blank, because the owner has not chosen one, and the difference is the
                business's margin on the kit
     tickets    child ticket × children + the tutor's own adult ticket, per run, at cost
     travel     per child per run, at cost
     discount   an admin's alone (the server refuses it from anybody else — `discountRefusal_`).
                A PERCENT comes off the teaching and never off kit, tickets or travel, which are money
                passed straight through; POUNDS come off the total. "Business" (the default) leaves
                the tutor's payout whole, so it comes out of the seat cut and the kit margin first and
                past them takes the net below nought — said in so many words on the Money block.
                "Shared with tutor" scales the tutor's payout and the business's teaching share by
                the same fraction, so each gives up their own proportion of it.
     card fees  `card_fee_pct` of what is charged plus `card_fee_fixed`, both blank = nought, so a
                sheet that has never heard of them prices exactly as before.
   A NEGATIVE NET IS AN ANSWER, NOT A FAULT. Nothing here clamps it: a booking that costs the business
   money must say so, which is the point of working it out. */
```

### A SURCHARGE IS A MULTIPLIER, so the neutral value is 1.

in `priceFrom`

```
/* A SURCHARGE IS A MULTIPLIER, so the neutral value is 1. It returned 0 — and everything in the
     hourly bracket is multiplied together, so ONE missing entry took the whole tuition to nothing
     and the client was charged room hire and no teaching.

     It was reachable on a perfectly ordinary booking: the level multipliers live in the pricing
     tab, most levels have never been given one, and a blank cell and an unlisted level are the
     same thing here. Days and times escaped it only because `worstOf` happens to end in `|| 1`,
     and subjects because they carry their own guard — so the same fault existed three times over
     and two of them had already been patched at the call site rather than here.

     Zero and blank both mean "no effect", which for a multiplier is 1. There is no value of this
     that should ever be able to zero a price. */
```

### LEVELS GO THROUGH `levelMult`, which is this same rule lifted out so the subject cards and the level cards can ask the question too.

in `priceFrom`

```
/* LEVELS GO THROUGH `levelMult`, which is this same rule lifted out so the subject cards and the
     level cards can ask the question too. Everything else still reads its table here. Two callers,
     one rule — the arrangement `subjectMult` already has. */
```

### A TRIP HAS NO ROOM TO HIRE (docs/history/353):

in `priceFrom`

```
/* A TRIP HAS NO ROOM TO HIRE (docs/history/353): the children are at the museum, and what the place
     costs is its tickets, priced below beside the teaching. So V is nought on a trip whatever `loc`
     still holds from before the format changed — the form hides Venue and Space on a trip, and this is
     the half that makes a hidden answer cost nothing rather than trusting it was cleared. */
```

### THE PRICING FORMULA ================== P =

in `priceFrom`

```
/* ================== THE PRICING FORMULA ==================
     P = ( [ rate x (Σ Sᵢ)/k x L x D x T ]     ← £/hour/child, all MULTIPLIED
           · [ 1 + s(k−1) ]                     ← subject-count
           · [ 1 + (c+B)(n−1) ]                 ← extra children (c = tutor's, B = yours: the tutor's
                                                   own extra_seat_cut when set, else the config default)
           · [ 1 − b(W−1) ]                     ← bulk discount
           · [ 1 − a(A−1) ]                     ← advance-booking discount
         + V ) · h · W                          ← venue is £/hour (not per child)
     Every symbol comes from the sheet; set a rate to 0 to switch that effect off. ============ */
```

### THE PER-HOUR MULTIPLIERS.

in `priceFrom`

```
/* --- THE PER-HOUR MULTIPLIERS. Blank in the sheet means 1, which is "no effect". ---
     THEY ARE MULTIPLIERS, NOT AMOUNTS, and the whole of this file agrees on that — `sur()` above
     returns 1 for a blank cell, which is the identity for multiplying and would be an invisible
     +£1 an hour if these were added. The formula above says so and `baseHourly` below does it.

     THE SPREADSHEET DID NOT AGREE. Its column was `surcharge_per_hour` and the note on every row
     it created said "added to the hourly rate when chosen" — so somebody typing 5 into the GCSE
     row, meaning five pounds an hour more, would have multiplied every GCSE booking by five. It
     has never fired because every value is still 0, and a 0 is read as 1 and does nothing.
     The column is now `multiplier` on the pricing tab, which is what it has always been here. */
```

### WHAT THE CLIENT PAYS PER HOUR, before any multiplier.

in `priceFrom`

```
/* WHAT THE CLIENT PAYS PER HOUR, before any multiplier.
     A tutor sets ONE number: their charge-out rate — what an hour with them costs. That replaced
     setting their pay and letting a markup do the rest, which meant nobody could see their own
     headline rate without doing the sum.
     Minimum wage is fixed and is not a rate: it's the floor the tutor is paid from, and the only
     thing it does here is tell you when a charge-out rate has dropped below what it costs to pay
     someone legally. */
```

### Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the patch that hid this fault for days and times, and a patch that is no

in `worstOf`

```
/* Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the
       patch that hid this fault for days and times, and a patch that is no longer load-bearing is
       one somebody will remove for tidiness and reintroduce the bug with. */
```

### No fallback. An unchosen length is 0, not the configured default — a default here put 'x 2 hrs' on the card beside a control still reading '———', which is the

in `priceFrom`

```
/* No fallback. An unchosen length is 0, not the configured default — a default here put
     'x 2 hrs' on the card beside a control still reading '———', which is the site answering on the
     client's behalf and then showing them the answer as though they'd given it. */
```

### The ACTUAL sessions that will run, across EVERY run in the booking.

in `priceFrom`

```
/* The ACTUAL sessions that will run, across EVERY run in the booking. A lesson on Monday and
     Tuesday has two sessions a week, so its dates — and its price — are both runs' dates put
     together. Reading only the first weekday was what made a second slot free. */
```

### One date per DAY, not per run.

in `priceFrom`

```
/* One date per DAY, not per run.
     Dates were generated per run, so two separate blocks on the same Monday — 10-11 and 14-15 —
     produced Monday twice and multiplied the whole booking by two Mondays. A date is a date the
     class meets; how many blocks it holds is already counted in the hours. */
```

### ---------- ONE WINDOW PER TERM, NOT ONE ACROSS ALL OF THEM

in `priceFrom`

```
/* ---------- ONE WINDOW PER TERM, NOT ONE ACROSS ALL OF THEM -------------------------------
     THE TERM QUESTION TAKES SEVERAL ANSWERS NOW, and the difference between walking each term and
     walking from the first start to the last end is a holiday: Autumn 1 ends, the October half term
     runs a week, Autumn 2 begins. An outer span puts a session in that week and charges for it.

     ONE WINDOW IS STILL ONE WINDOW. `spec.windows` absent — a live job, the backend's own spec, an
     older saved form — falls back to the single pair this has always used, so nothing that was
     working changes.

     DEDUPED ON THE DAY, because two terms must not overlap and the terms tab has had rows that did:
     `doGet`'s own note records four rows, two named the same thing and one ending before it starts.
     A date counted twice is a session charged twice, which is the one arithmetic error here that
     reaches somebody's bank. */
```

### Sessions come from the actual dates.

in `priceFrom`

```
/* Sessions come from the actual dates. Before days are ticked there are none — and "|| 1" was
     inventing one, which is where a single phantom session and its totals came from.
     The weeks remaining in an interval is a DIFFERENT number: a booking may run once a week or
     three times, so it can be reported but never counted from. */
```

### The tutor's own extra-seat fraction when they've set one, the config default otherwise.

in `priceFrom`

```
/* The tutor's own extra-seat fraction when they've set one, the config default otherwise. Only
     THEIR share is theirs: B stays yours, so a tutor deciding a second student is worth 20% more
     of their time can't move your margin while doing it. B IS PER TUTOR NOW (docs/history/345) — their
     own `extraSeatCut` when an admin has set one, the config B when it is blank — and still not the
     tutor's to move: only an admin may write it (`seatCutRefusal_`, people.gs). */
```

### A per-seat share is a FRACTION of the rate:

in `priceFrom`

```
/* A per-seat share is a FRACTION of the rate: 0.3 means a second student adds 30%, and 1 means
     it adds the full rate again. 1 is a real setting, so it's honoured — the old guard rejected
     anything at or above 1 as a leftover pound figure and threw away a deliberate choice without
     saying so.
     What's still rejected is a value large enough to be unmistakably an amount rather than a
     fraction: nobody means "a second student costs five times the first". */
```

### Both discounts count units BEYOND the first:

in `priceFrom`

```
/* Both discounts count units BEYOND the first: the first session and the first week earn
     nothing. That count cannot go below zero — booking for this week is not a reason to charge
     more, and (A−1) with A=0 turned a 2% discount into a 2% surcharge. */
```

### Three discounts, all counting units BEYOND the first, all clamped at zero — a discount that goes negative becomes a surcharge, which is how booking for this

in `priceFrom`

```
/* Three discounts, all counting units BEYOND the first, all clamped at zero — a discount that
     goes negative becomes a surcharge, which is how booking for this week once ADDED 2%.
       bulk    rewards volume: how many sessions in total
       ahead   rewards notice: how far off the first one is
       consec  rewards commitment: unbroken weeks, which is what makes a slot worth holding
     Bulk and consec differ on a term with gaps — ten sessions scattered over fifteen weeks earns
     the bulk discount and not the consecutive one, which is the distinction worth paying for. */
```

### A block discount — cheaper per hour for a longer unbroken session — was asked for and isn't here, deliberately.

in `priceFrom`

```
/* A block discount — cheaper per hour for a longer unbroken session — was asked for and isn't
     here, deliberately. It can't be a factor on the whole booking the way these are, because it's
     a property of each SESSION: Monday 13-17 earns it and Tuesday 10-11 doesn't, and no single
     number is true of both. Building it properly means pricing each run and summing, which is a
     different shape of formula. See NOTES.md. */
```

### ---------- BILLED BY THE SESSIONS THAT EXIST, NOT THE WEEKS THAT REMAIN

in `priceFrom`

```
/* ---------- BILLED BY THE SESSIONS THAT EXIST, NOT THE WEEKS THAT REMAIN ------------------------
     THIS PREFERRED `weeksLeft` AND THAT IS A DIFFERENT NUMBER. `weeksLeft` is how many weeks are
     left in the interval; `slots` is how many session dates were actually found in it. They agree
     most of the time, which is why this survived — and when they differ the card contradicts
     itself in public: the multiplier row said "x 3" while the line under it listed two dates, and
     the total charged for the three.

     A booking cannot cost more than the sessions it contains. `slots` is the count of real dates,
     so the arithmetic and the list of dates now come from one number instead of two.

     THE DIVISION STAYS, for a booking that has slots but no dates yet — two days a week over
     eleven weeks is twenty-two sessions and eleven weeks, and hours-a-week multiplies the second. */
```

### The per-hour figure is real as soon as a rate is known — it does not need a length or a term.

in `priceFrom`

```
/* The per-hour figure is real as soon as a rate is known — it does not need a length or a term.
     The TOTAL does: without hours there is nothing to total, and showing £0.00 there reads as a
     price rather than as an unanswered question. So they are computed separately and the card is
     told which is which. */
```

### SPLITTING DIVIDES BOTH FIGURES.

in `priceFrom`

```
/* SPLITTING DIVIDES BOTH FIGURES.
     The share was computed and then never used — the card showed the whole price with a "÷ 2" row
     beside it, so the number a client was actually being asked for appeared nowhere. And an hourly
     rate that ignores the split is the wrong rate for every person reading it: three families
     sharing a £30/h booking each pay £10/h, and that is the figure they need.
     Both the rate and the total are per person now, which is who the card is addressed to. */
```

### The tutor is paid their own rate, with every surcharge that belongs to teaching — subject, level, day, time.

in `priceFrom`

```
/* The tutor is paid their own rate, with every surcharge that belongs to teaching — subject,
     level, day, time. All of it is their work, so all of it is theirs.
     Your share is B alone — this tutor's own cut, or the default (`seatShare_`): what an extra seat
     is worth to you, which is the one part of the price that isn't hours taught. Both carry the same multipliers, so the two still add to exactly what
     the client pays. */
```

### ---------- WHAT THE BOOKING EARNS, AFTER EVERYTHING IT COSTS (docs/history/353)

in `priceFrom`

```
/* ---------- WHAT THE BOOKING EARNS, AFTER EVERYTHING IT COSTS (docs/history/353) ----------------------
     `tutorPay + venueTotal` was all this knew about cost, so an admin saw "Admin earns £12" on a
     practical whose kit cost £9 and on a trip whose tickets cost £34 — a margin that was the seat cut
     and nothing else. `bookMoney_` is the one sum: what the client is charged (teaching and venue as
     before, plus materials, tickets and travel), less any admin discount, less every outgoing — tutor,
     venue, materials at cost, tickets and travel at cost, card fees. Teaching itself is priced exactly
     as it was above; nothing here touches a rate.
     THE OWNER KNOWS A ONE-CHILD SESSION EARNS NOTHING — *"I am aware of no profit for me when only 1
     kid"*, 18 Oct — so there is no markup here to make it earn: the business's share stays the seat cut
     (B, or the tutor's own) plus the materials margin, and a net of £0.00 on one child is the answer. */
```

### THE TOTAL IS THE CHARGED FIGURE NOW, still per family.

in `priceFrom`

```
/* THE TOTAL IS THE CHARGED FIGURE NOW, still per family. Tutoring with no discount comes out exactly
     where `teachTotal` did — `mo.charged` is that whole figure plus nothing — so every booking that
     was priced yesterday is priced the same today. */
```

