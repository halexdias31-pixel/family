## The way into somebody else's session is a line and a tile on its receipt, not a block under it

**Asked for as "the session booking thing at the bottom of reciept should be a line in the booking"**
(5 October), in the same week as *"it should all be tiles"*. The thing was `joinBlock` in book.js,
which `jobPage_` appended after the receipt on a session you are not on: "2 seats left on this
class. £19.00 a seat." (or "3 seats going on this one. The family who booked it are happy to
share."), the waiting list's when-could-you-come tally, a full-width gold `Take a seat` / `Ask to
join` button, and a faint paragraph about when anybody is charged. All of it on black, under a card
it plainly belonged to — the fault *"no floating tiles for already booked sessions"* had already
moved the tiles off once, for the people booked on a session. This was the same fault for the people
who are not.

**Each piece went where its kind goes, and two of them were already there.**

- **The seats are the `Sharing` row.** It was already the receipt's line about them on a waiting
  list (`Open — 2 seats free`). On an ordinary session it said **"Just you"** — on the very page
  whose block said "3 seats going" — because `splitEmails` is sent only to the family who typed the
  addresses, so for anybody else the fallback spoke. It now says `Open — N seats free` whenever no
  list of names is sent and the session is open with a seat going (every ordinary session is
  written `open_to_others`; the seats decide). "Just you" is kept for the one case it is true:
  nothing going and nobody named.
- **The seat price is the total row**, `Your seat £19.00`, which already said it. Not repeated —
  a figure on two lines of one document is what the `Total` alias in `SPINE_ALIAS` was written to
  remove. On an ordinary session there is no seat price to state: what a joiner pays is agreed when
  the family says yes, and the form says so when they get there.
- **The action is a tile in the receipt's foot**, first, before Share — where Pay sits for somebody
  on the session. `joinTile_` in tiles.js, reached through `jobTiles_`, which now answers "what can
  you do with this session" for a stranger as well as for a member. One mark (the person-with-a-plus
  `Make an account` already uses), two words: `Take a seat` → `job-take-seat` on a list, `Ask to
  join` → `job-join` on a family's session. `canAsk` (the server's) is the gate. The faint sentence
  is the tile's note: *charged once it fills*, *the family say yes first*.
- **The tally is a `Can come` row** — see below.

### `whenCouldHtml` is not a form, and it was hidden from the people it was for

It was asked whether the when-could-you-come piece is "a form the joiner fills". **It is not.** It
is `waitlistWhen`'s count of the answers OTHER families already gave on their own booking forms (the
`When could you come?` step); a joiner gives theirs the same way, on the form `Take a seat` turns
to. So it is a fact about the class, and a fact goes on the class's paper.

**And it was only ever shown to the wrong half.** Drawn inside the join block, it appeared only for
somebody `canAsk` let in — i.e. everybody NOT on the list. The tutor, whose one open question it
answers (`doGet`'s own note beside `whenCould`), and the families who gave the answers never saw it.
As a receipt row it is on everybody's copy of the list.

**Where:** `{ after: 'When free', row: 'Can come', only: 'receipt' }` in `SPINE_EXTRA` — pinned to
the step it tallies, so it lands under the empty week a list has not got yet. Receipt only, because
the form is where one family answers and the receipt is where the answers are counted.

**How it is drawn:** `r.tally` is markup in the answer cell (the `strip` / `sel` distinction), and
`.bk-row.bk-tally .bk-v { grid-column: 2 / -1 }` gives the bars the three figure tracks the row has
nothing to put in. Measured first in the answer column alone: 71px at 390, 58 at 320, and `Monday
evening` was clipped to `Monda…` by its own bar. The bars start where every answer starts; `check/ui.js`
exempts the tally's RIGHT edge from the column rule exactly as it exempts the week's, and still asks
its LEFT edge (proved: a `margin-left: -2rem` mutant is named). The heading `When the 2 of them can
come` went — the row's label says what the bars are, and every count says out of how many. `.wc-say`
was also the one PAPER colour in that group, on a card that is not paper.

### What proves it

- `check-flow`: *a class with seats offers Take a seat as a tile on its receipt, and its seats as a
  line* and *a session a family booked offers Ask to join as a tile, and says its seats are open* —
  no `.join`, no control outside `.rc`, the tile first in `.rc .rc-tiles` and pressed through the
  tile itself, `Sharing` saying the seats, the tally a `Can come` row a MEMBER of the list sees too,
  and "Just you" still where it is true. `W-LIST` now carries the `whenCould` `doGet` sends.
- `check/states.js`: *a class with seats, seen by a family not on it* and *a session with seats,
  seen by a family not on it*, entered as a parent — `doGet` never sends `canAsk` to an admin, so
  seeding it under the lab's admin would measure Take a seat beside Accept/Decline/Delete, a card
  nobody can be shown. `check/press.js` presses `job-take-seat` and `job-join` for the first time.
- `check/share.js`: the class receipt is shared at 320 and 390 too (seven pictures). 0.424% wrong at
  320 — glyph rows a device pixel out, the residue that file describes — under its 0.5% bound. The
  picture must also carry the `Can come` row's three bars and the `Sharing` line, because the pixel
  compare alone passes a card that lost them on the screen AND in the picture (proved: hiding
  `.bk-tally` under `.rc-snap` came back 0.207% wrong and was caught only by the new assertion).

Mutations, each red for its own reason and green again on the real files: `joinTile_` drawing
nothing; the Sharing fallback back to "Just you"; the tally gated on `canAsk` again; the tile drawn
in its own row under the paper (the older take-a-seat journey passed this one — it asked only that
the act was offered somewhere); the tally's left edge moved; the tally left off the picture.

### Not done, and worth a decision

- **The waiting list's week is still seven empty rows on its receipt.** The tally is the closest
  thing a list has to a week; drawing it AS the week (blocks lit by how many families offered them)
  would be "the same grid, answered" and would remove a row. A bigger change than this one.
- **A stranger looking at an ordinary session reads `It would come to £240.00`** — the booking
  family's whole price, not theirs. Unchanged here; what a joiner pays is worked out on the form.
