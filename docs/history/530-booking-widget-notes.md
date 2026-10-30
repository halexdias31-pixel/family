# 530 — The booking widget's notes of 29 October: fewer lines, one dropdown, the interval we are in

**Reported** through Suggest a change on the Booking widget (the admin's booking card), ten notes in one pass.

1. *"What is status for? I already have all those bits above status which kind of tell you the status."* — the `Status`
   row went from the spine (`SPINE_EXTRA`), the form and the saved session's receipt (`jobStatusSaid_` with it). The five
   ticks are where a booking is.
2. *"should just be 1 line which says discount. If I put 30 in that field then it's just 30 percent off."* — one row,
   `Discount`, a number box (`discountRow_`). `bookSpec` sends `%`; `bookMoney_` now takes a percentage off **what the
   client pays** (`gross`, the room included), not off the teaching alone. The `£` type survives in `bookMoney_` for
   promo-code rows the backend still validates, but nothing on the card asks it.
3. *"Code or reason … delete that line. Same with absorbed by"* — gone. The business absorbs (`by: 'Business'`), so the
   tutor's payout is whole.
4. *"Client pays line should be treated like the stuff above"* — an admin's priced form has no total bar: `payRow_`
   draws `Client pays` with `receiptRow`, the same six cells as Discount above it. A parent keeps the `Cost` bar.
5. *"Forget the charged, discount, venue, tutor payout and card fees … Also delete net profit."* — `formMoney_` returns
   no rows; the `.rc-money` styles went. **Storage is unchanged:** `bookMoneySend_` still sends gross, payout, venue,
   card fees and net, and the job row keeps them (353's freeze). `price` is what the client pays after the discount.
6. *"The term drop down needs to work like the drop downs above. As does every drop down here. Also I should be able to
   select the current academic interval too, which is October half term."* — Subject, Term and Child were a button that
   opened ticks under the row on a computer and a `<select multiple>` on a phone (498). Each is now Level's own select
   (`stepPick_`): the chosen answers are the words over it, a pick adds one, a pick of a ticked one (✓) takes it off, in
   the one `book-set` handler. The ticked-list code (`stepMulti_`, `stepManyList_`, `book-many`, `book-many-pick`,
   `book-many-set`, `.bk-many-list`) went. **The current interval:** `operatingWindow` (booking.gs) started every window
   on the next Monday and ended it on the last Sunday, so on Thursday 29 Oct in October half term (Sat 24 Oct – Sun 1 Nov)
   no whole week was left and `doGet` dropped it. An interval under way now opens on this week's Monday and, in its last
   week, runs to its last day; the phone books from today on (`computeSessionDates`). Backend: the four stamps bumped.
7. *"Again child drop down should behave like the above drop downs."* — the same `stepPick_`.
8. *"If the client picks client house then the space field is redundant"* — at a client's own house (`atClientHome_`, the
   rule the seat floor and the hour grid already use: `At home`, `Client House`) the Space step offers nothing, so it is
   text, `Yes — no room hire`; an earlier `No` is cleared and `bookSpec` says hosted.
9. *"2 different clients' children are showing up in the children field. It's because I changed the client"* — changing
   the client keeps only the children the Child question now offers (`bookKidsFor_`).
10. *"Hope you can see the filled-out fields"* — Suggest a change on the Booking widget appends `Fields: …` to the note
    (`bookFieldsSaid_`, sent by `rep-send`): every question's answer, the client and children as initials, the split as a
    count of addresses, the discount and the figure, the note itself not copied (it is the family's words).

## Proof

`check-flow`: *"an admin's booking form ends on Discount, one percentage, and Client pays …"* (one box, 30 → 70%, the
next row Client pays with six cells, no total bar or money lines, the createJob price and `%`/30/Business; a parent sees
none of it); *"every several-answer question … is the same dropdown as the ones above"* (Subject, Term, Child against
Level's control on a computer and a phone; pick, pick, pick again); *"with the client's house as the venue the Space row
cannot be filled in"*; *"changing the client on a booking leaves only that client's children"*; *"Suggest a change on the
Booking widget sends the filled-in fields"*; the Status row in *"a booking you just asked for is still on the screen"*.
`check-booking`: *"the interval we are in is always offered"* (every day of a year, the real `operatingWindow` over the
real `doGet` block; 29 Oct 2026 offers October Half Term) and 30% off a booking with a room. Each failed on its mutant.
