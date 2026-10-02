## Four asks, and the one that took the most care is the one that changes nothing on screen

**Asked for as "there should be a multipler for the number of dates bit. also remember if its at
clients house, then it should minimum 3 extra seats. there should be no option for 1 extra seat.
also make it so tutors cant update their maximum number of kids willing to work with more then once
a month. also yes pdf be a copy of whats on screen."** The fourth is the confirmation of the print
share shipped the night before and needed nothing; the other three touch three subsystems.

### The count was taken off this card a day ago, on an argument that named the wrong number

**"Remove the 36 sessions at the bottom next to the price" was answered with *"the count is the
MULTIPLIER on the row that does the arithmetic, where it is doing a job somebody can follow"*.**
That sentence is in this file one heading up and it is **wrong about which number**: the `Time
interval` row multiplies by `weeksBooked`, so three days a week over twelve weeks draws `× 12` and
the thirty-six sessions the booking actually is were **nowhere on either document**. Which is
exactly what has been asked for back.

**IT IS NOT A LINK IN THE CHAIN AND THE CARD SAYS SO BY GIVING IT NO TOTAL.** The `×` column holds
two kinds of thing: a factor the running total is multiplied by, which carries a rate and a total,
and a count of what the row lists, which carries neither. The day rows have been the second kind
since `× 3` went on them — so this is that shape one row along rather than a new one, and a reader
running down the `+` column is never handed 36 to multiply by.

**And it is honest arithmetic rather than decoration**: the price is rate × hours-a-session ×
sessions, which is the same product the card already shows decomposed the other way as hours-a-week
× weeks. 36 is a factor of the total in its own right; it is simply not the factor the row above it
uses. **Silent on one date**, because `× 1` is the multiplier this app already declines to print.

**THE COLLAPSE RULE WOULD HAVE WRITTEN IT AND PAINTED NOTHING**, which is what happened to `× 3`
the first time and took a browser to find: `.bk-m` is hidden on any row with no running total.
`:not(:has(.bk-dates))` rather than a new class, because `dates: true` already marks that row and
nothing else. **Proved by mutation in a browser**: with the exemption removed the markup says `× 6`
and the card shows `display: none`, 0px wide; with it, 46.2px at 390.

**And the count must not set the height of the row it counts.** `.bk-m` is `--mono` at the row's
own size, so its line box added **one pixel at 320 and 390 and two at 768** to a receipt already
listing every date. `line-height: 1`, which is the rule the day rows paid eight pixels for a commit
ago and this is its second subject. Measured before and after against `HEAD`: **537 / 686 at 320,
606 / 650 at 390, 630 / 680 at 768 — identical to the pixel**, with `× 6` drawn.

**Still refused: the general rule.** `:not(:has(.bk-m:not(:empty)))` would cover both exceptions and
un-hide something else — and that something is worth recording. `out.mul = '—'` on a `rate-mult`
whose multiplier is exactly 1 is written deliberately, under a comment saying *"it read as a blank
row, which looks like a value that failed to load"* — and such a row has **no total**, so the
collapse rule hides it on every card. **Nobody has ever seen that dash.** A real finding on
twenty-odd rows, named where the rule is, and not this commit's to act on.

### Three extra seats at a client's house, which is a floor the one function that decides floors never had

**`BOOKING.n` IS THE TOTAL**, so "minimum 3 extra" is a floor of four chairs and the second sentence
— *"there should be no option for 1 extra seat"* — is what the first one already means: 1, 2 and 3
are not offered at all, and nothing has to forbid 1 separately.

**`loc`, NOT `hosting`, AND THEY ARE DIFFERENT QUESTIONS.** "At the client's house" is where the
session happens; `hosting` is who provides the room, and a family that books a hall themselves
answers yes to that while being nowhere near their own front room. `isHome` is the app's one reader
of the first question and already handles the literal `At home` and a venue that costs nothing.

**THE FLOOR EXISTED AND THE OPTION LIST IGNORED IT.** `seatLimits` has had a `min` since it was
written — a venue with a minimum party size sets one — and the seats step looped `for (i = 1; i <=
min(4, lim.max))` whatever it said. **So the refusal one line below was refusing numbers the list
had just offered.** Four options from the floor rather than four from one: at a paid venue 1, 2, 3,
4 exactly as before, at a home 4, 5, 6, 7. Measured in a browser, all four widths.

**AND THE FLOOR IS ALWAYS OFFERED, even above the ceiling.** A tutor who takes two students and a
home visit that needs four is a real contradiction, and an empty option list is how `stepLocked_`
greys a row — the exact fault this step was reported for a week ago. One option and a gold line
saying what is wrong beats a dead control saying nothing.

**A CELL WITH A CODE FALLBACK**, `min_seats_at_home`, because *how many* is exactly the sort of
number an owner changes without wanting a deploy. Four is what was asked for, so an empty config tab
enforces it; a 1 turns the floor off.

**THE VENUE IS ASKED AFTER THE SEATS, and the floor arrives when it does.** That is the `loc` step's
own recorded decision for the maximum — *"the seat count is already chosen by now, so a room too
small says so rather than quietly resetting it"* — and `n`'s `why` reads the CURRENT `BOOKING.loc`,
so a booking for one that becomes a home visit grows a gold line under the seats row. Reordering the
two questions is the tidier fix and moves a row on both documents for everybody, which is not this
rule's to do.

**AND THE REFUSAL WAS SPEAKING THE OTHER UNIT.** `lim.min` is a total and the row draws extras, so
the sentence would have read *"needs 4"* under a control offering 0, 1, 2 and 3 — one fact in two
units an inch apart, which is the `needs_print` / `print_required` shape. It reads *"a session at
your own home needs 3 extra seats"*. **Reachable before this commit too**, on any venue with a
minimum party size; nothing here has one, which is why nobody had ever read the sentence.

### A month on the seat cap, and the rule is a function so that something can run it

**A tutor's `max_students` is not a preference**: it is what `seatLimits` offers a family, and every
booking already taken was priced and seated against whatever it said on the day. `handle_changed_at`
is the precedent and `max_students_changed_at` is the same shape — **one date, no counter**, so the
rule is *has a month passed* rather than a tally to keep in step, and a row that has never changed
has no cell and is free. There is no `max_students_was` beside it: a previous handle is a
safeguarding fact about a person and a previous seat count is not.

**`SEATS_COOLDOWN_DAYS` IS ITS OWN THIRTY AND DELIBERATELY NOT `HANDLE_COOLDOWN_DAYS`.** The two
rules answer different questions and could honestly diverge — one is a brake on an arms race, the
other is about bookings already taken — and folding them onto one name makes a change to either a
change to both.

**ONLY WHEN THE NUMBER ACTUALLY MOVES, and that is the half that would have broken the form.** The
Group size page posts `max_students` AND `min_students` every time it is saved, touched or not, so a
rule firing on the field being PRESENT would refuse a save of the row beside it for a month over a
number nobody edited — the fault this handler already paid for, where a blank box was written back
over every profile field on the first press of Save.

**AND THE TEST HAS TO BE READ BEFORE THE WRITE.** `setCell` ends with `row[field] = value`, under a
comment saying *"read-after-write within this request now sees the truth"* — so asking the same
question after `wanted.forEach(setCell)` compares the new value against itself, which is always
equal, and the stamp would never be written: the clock would never start and the cooldown would
never fire once. Caught by reading `setCell` rather than by a check, which is the only thing that
could have.

**`seatCapRefusal_` LIVES IN `people.gs` BESIDE `handleRefusal` SO THAT SOMETHING CAN RUN IT.**
Written inline in `updateProfile` it is six lines nothing here can reach — a rule with no check is
the shape this repository records every time an instrument could not see its subject. Same file,
same three arguments, so the two read alike. **`check-handles.js` gains seven cases** and its roster
line stops saying *"what a person may call themselves"*, which had stopped being all of it.

**Proved by mutation three ways**: firing on presence names the two unchanged-number cases; removing
the admin exemption names the admin case; reading a missing stamp as now names the never-changed
case. The real file is green, and the sentence is not repeated on the phone — `me-save` prints
whatever the server said, which is what `MESSAGING` and `changeHandle` both record.

### What was measured and not fixed

**The receipt hides 216px below its pane on a 320×568 phone**, and the lab cannot see it: `check/ui.js`
gives every width a viewport 844px tall, so the 320 column is measured in a pane a real iPhone SE
does not have. It is **pre-existing** — measured identical at `HEAD` — and it is the price of the
every-date list, which is the owner's own decision recorded two headings up. Written down rather
than acted on, because shortening that row is undoing what was asked for.

**Two new journeys, four mutants.** `the dates row says how many dates it lists` asserts the count
comes from the array the row is built from, so a row listing six and counting five cannot occur;
`a session at the client's own home cannot be booked for one` asserts the floor, the option list,
the refusal's units, and that none of it leaks onto a booking with no venue chosen yet. 37 journeys,
all 38 checks pass.
