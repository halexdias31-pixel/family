## The cheat sheet maker fits a phone, its sheets go in the basket to be laminated, and the basket reads like a receipt

**What the owner asked**, three notes from the 2 October list:

- *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to make it fit on
  screen without scrolling"* and *"the cheat sheet maker should not have a scroll thing"* (tools-4).
- *"add an upgrade to lamination for cheat sheet orders that are added to cart."* (shop-1)
- *"refine basket to look nicer."* (shop-13)

### The cheat sheet maker, a topic at a time

**Measured before**, with Playwright on `check/fixture.json`: the tool opened on Maths · Every level,
57 rows in two columns, a card of 1206px in a 532px pane at 320x568. `paneReach_` hit its 0.7 floor
and the pane still scrolled. GCSE Higher was 34 rows (825px against 532). Every Maths level except
the Y1/Y2 mocks scrolled at 320, and Every subject · Every level was 80 rows. The scroller inside
the card had already gone (history 230), so the card was simply as long as the library.

**A third select, the topic**, cuts the list. `MAT_GROUPS` in `js/mat.js` files every piece:
Number, Fractions & %, Algebra, Graphs & rates, Geometry, Area & volume, Trigonometry, Data &
chance, Calculus (Maths); Spelling, Grammar, Writing, Reading (English); Chemistry (Science). The
ruler is in every topic, as it is in every subject. The topic cuts the LIST, not the paper. Ticks
are kept across topics and print whichever topic is showing, and each topic's option says how many
of its pieces are ticked (`Algebra · 3✓`). The word "ticked" was tried first, but at 320 the select
shows about eighteen characters and cut it to `Trigonometry · 2 t…`. That is also why the names are
short.

**Eight rows at most, not the audit's twelve.** Measured: twelve rows (six lines) drew the card at
about 0.79. Ten drew at 0.858 signed out but **0.798 signed in**, because a signed-in card carries
its star tile and is 60px taller. Eight rows clears 0.85 for both visitors: 0.858 / 0.859 at 320x568
as the worst case. At 390x844 every view fits unzoomed. To get there, a piece's note ("given in the
exam", "prints at true size") moved inside the row's 44px under the face instead of taking a grid
line of its own (15px a note). The select gap, the exam box's padding and the gauge line's margin
gave up 12px between them.

**Opens on the student's own level when known.** Nothing on a person's row says their level, so
`matOwnLevel_` reads it off the newest session they are the CLIENT of (a tutor's teaching is not
their own study). It takes the subject from it too when the booked name contains one ("English
Language" → English). It asks `USER.level` first in case a login reply ever carries one. A
stranger, or anybody without a matching session, opens on Every level as before.

### A cheat sheet in the basket, and laminating it

A cart **tile beside "Print the sheet"** (`mat-cart`) puts the sheet in as a `print` line:
`{ kind: 'print', key: 'mat:<subject>|<level|tier>|<sorted ids>', name: 'Cheat sheet — Maths ·
GCSE Higher (5 pieces)', pages: 1, parts: [piece names] }`. As a print line it gets everything the
basket already does for papers. Its print price comes from `print_rate_per_page`, and the existing
`+ laminate` switch from `laminate_rate_per_page`, both Ledger config cells. **No rate is written in
the front end.** The same sheet twice is one line, and a changed sheet is a new one. The trolley
fills while this exact sheet is in the basket. It is refused (and greyed) on an empty or over-full
sheet, the rule Print already follows. Signed out it says "Sign in first" and goes to sign in, as
`cart-add` does.

**The order message lists the pieces** (`orderLine_`), in both the full and the short build. The key
means nothing to a person, and the owner has to rebuild the sheet from the message. All 77 piece
names together are about 1,400 characters, under the 2,000 cap, and a real sheet is nearer 20. The
line also says "1 page", no longer "1 pages".

**Laminating is still switched off live.** The Ledger's `laminate_rate_per_page` is 0, and 0 means
"not offered". The owner chose **£1.00 per laminated A4 page** and will type it into that cell. Until
then the switch does not draw, on papers or sheets.

### The basket

Measured by the audit at 390 with the live payload and a mixed basket:

- every one-word shop line was 72px tall, its ✕ alone on a second row;
- the dashed rule under a name stopped three quarters of the way across;
- the head wrapped (`1430 credits · you have 5 · 1 to price when sent`);
- a 30p pencil read `30 cr` and a £14 calculator `1400 cr`, so Send read "1425 more credits needed".

**Changed, keeping the receipt shape from history 154:**

- The value cell is `display: contents`, so the line's three parts sit on the row's own two
  columns. The name and a **dotted leader run to the price** on one line, with the ✕ at the end of
  the leader beside the figure. The strip under the name is drawn **only when it holds a laminate
  switch**, and then it spans the row, so its ✕ sits under the price. A shop line, or a paper while
  laminating is off, is one line.
- The head is one short line: `3 cr of your 5 · 1 tbc`.
- **A pence price is money.** `cart-add` now reads the `unit` `doGet` sends (`cartPrice_`): `p` goes
  into `money` in pounds, everything else stays in `cost`. `cartUnits_` re-reads a shop line saved
  the old way when the basket is drawn, but only from a shop row that says `p`, never by guessing.

**Not fixed here, and worth knowing.** Ticks-priced items (sticker sheet, gel pens) are still drawn
as credits and checked against `USER.credits`, although ticks are a separate balance. The shop card
and its tile (`find.js` mapper, `tiles.js` `shopTiles_`) still print pence prices as credits. Both
are the shop's, outside the basket, and belong with the Shop column work.

### Checks, and the mutations that proved them

- `check/states.js` **"the cheat sheet maker, every subject, level and topic"** walks every view
  through the selects' own `change` events. At 320x568 and 390x844 it asks `paneReach_` to fit the
  pane and fails on any scroll, any zoom under 0.85 or more than eight rows. `window.MAT_FIT_MISS`
  names the first view that failed. Mutation: `.mat-pick` gap .3rem → 1.2rem turned it red at 320
  (signed in, Maths · Every level · Number at 0.825). Restored, it went green.
- `check-flow` **"…a topic at a time, eight rows at most, and keeps ticks across topics"**. Mutations:
  Data & chance folded into Number (16 rows, red); the group filter taken off the list (red: the tick
  count and the row still listed). Green again.
- `check-flow` **"…opens on the signed-in student's own level…"**. Mutation: own level ignored (red).
- `check-flow` **"a cheat sheet goes into the basket, laminates, and the order names its pieces"**.
  Mutations: piece list dropped from `orderLine_` (red); signed-out guard removed (red).
- `check-flow` **"a pence-priced shop item goes in the basket as money, on one line"**. Mutations:
  `cartPrice_` ignoring the unit (red), the strip always drawn (red), the old head (red, 53
  characters).
- `check/states.js` **"the basket"** now holds a bundle, a cheat sheet, a pence item and a credits
  item. It asserts that the pencil is one line with a visible leader. Mutation: leader at zero
  width, red.

The "five pieces ticked" state used to tick five boxes in one view. No GCSE topic holds five, so it
now ticks across topics and returns to Number, where its negative-number-line assertion lives.
