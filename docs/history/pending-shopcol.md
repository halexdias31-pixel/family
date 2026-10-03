## The shop is a column, the basket is its first page, and Find has no Shop door

**Asked for as** *"Get rid of booking places. Get rid of shop tag. I will make a new coloumn for shop
stuff. So finder now will become just learning stuff."* Asked whether the Shop door should come off
Find before the column existed, the owner chose to **build the Shop column now, with the basket in
it, and take the Shop door off Find in the same change**. The venue half of the same sentence went
in a batch earlier; this is the Shop half.

**And nine item notes, answered "For sale":** *"add hour glass to list of items."*, *"3d print stuff
add this to items."*, *"gooey louis add this gae to item"*, *"stack game. add this item to item
list"*, *"tape measure add that to items."*, *"Goggles resealable packets. Chemicals add this stuff to
items."*, *"add Glass chamber tall and pump to items"*, *"Resealable packets for lego and stuff"*.

### Why the door and the column are one commit

Measured before anything moved: 62 shop rows, 22 wearables (the wardrobe on Settings reaches those)
and **forty Things whose only way onto a screen was `What for · Shop`**. Taking the door out first
would have been forty products deleted from view by a tidy-up. So `FUNNEL_NOT_FOR` became
`['Booking', 'Shop']` in the same commit that registered `screen('shop')`, and the test became
"every group the item is in is one of these" — the array rule the Booking note already defends, so
a kind in Shop *and* Learning would still answer Learning.

`stuffItemsRaw_` is untouched, so a **starred** shop thing stays on Saved (`collItems_` reads
`stuffItemsAll_`). The one side effect: `kindOf_` files a kind it does not know under
`Shop · Things`, so an unrouted kind now leaves Find instead of turning up under Shop. Measured in
the browser on the fixture plus the real shop and the real library: **0 items with an unrouted kind**,
7,337 items held, 7,261 offered by Find, **0 of them shop things**.

### Where the column goes, and why

**Right of Booking.** The basket was a tool, but nothing about it is one: it is a list of things you
are about to pay for, a total and a Send — which `cartCard_`'s own note calls "the same document" as
the booking receipt one column along. The two money columns sit together, two swipes from the front
door (`feed`); the bundle tile on Find that fills the basket (`cart-open`) is three swipes away
whether the shop sits by Booking or by Tools, so Tools would have bought nothing.

Every place a screen is named was edited, which is the list the `make` removal and the Settings
column each wrote down: `TABS` (appended, it is append-only), `TAB_ORDER`, `PAGER`, `PAGE`, the
`<section>` in index.html, the row in `data/settings/columns.json` (renumbered: the shop is 4), and
`startScreen_`/the stop line, because the basket is a widget whose `start` draws its lines.
`check/ui.js` and `check/press.js` read `TABS`, so they measured the new column with nothing added;
`SCREENS_FALLBACK` learned it anyway.

### What is on it

**Page 0 is the basket** — the same widget, moved rather than copied: the `cart` row of the roster in
map.js went from `kind: 'tool'` to `kind: 'shop'`. `widgetsOf_('shop')` draws it here,
`widgetsOf_('tool')` stops drawing it on Tools, and `cartPaint_` writes by class, so nothing else had
to learn where it went. `cart-open` goes to the Shop column. `savedWidgets_` takes `shop` too, so a
basket starred while it was a tool stays on Saved. First rather than last because the things run to
13–20 pages, and a basket at the bottom of them is a swipe per page to check what you just added.

**Then the things, three to a page under their group's `<h2>`** (an h2 *between* cards, which is
`check-dead.js`'s rule), drawn by `stuffCard` exactly as Find drew them, tiles and all. Groups come
from the sheet's `kind` (`kindRaw` in the payload): Bundles, Games, Kits, Equipment, Stationery,
Consumables, Made to order, and any other word after those under its own name.

**Who sees what, decided on the column.** `doGet` has always sent `audience` and `inStock` and
nothing in js/ read either, so a signed-out visitor was offered the toner cartridge and the tutors'
iPad as "Add to basket · free". The column now hides a row whose `active` is FALSE, shows a `tutor`
row to tutors and the admin (`isTutorRole`), an `admin` row to the admin, and everything else to
everybody. Not done in the shared mapper, because a starred row still belongs on Saved.

**Measured at 320×568** over the real shop (the 62-row export plus the twelve additions): a visitor
and a student see 13 pages, an admin 20, and **no page is shrunk by `paneReach_`**. The first walk
had one that was — three two-line names on a page, zoom 0.893, tiles at 39px — and the fix was the
names ("White vinegar", "Resealable bags") rather than two to a page.

### The new rows

`data/shop-additions.json` — every `SCHEMA.shop` column — and `data/shop-additions.csv` in the tab's
order, to paste into the Ledger `shop` tab, since nothing in the repo writes the Ledger and
`data/settings/shop.json` is a stale export nothing reads. Twelve rows, **I041–I044 and I046–I053**:
**I045 is skipped** because the practicals already name it for the cones. All `audience all`,
`acquire buy`, `active TRUE`, and **every price blank**, so each card reads "not priced yet":

Sand timer (hourglass); Custom 3D print (made to order) — kind `service`, quoted per order in
Messages; Gooey Louie (board game); Stacking blocks game (generic, not the brand); Tape measure
(5 m, pocket) — I026, the 30 m tape, is the tutors' loan kit and stays; Safety goggles; Resealable
bags — one row for both notes that asked for them; White vinegar, Bicarbonate of soda, Washing-up
liquid, Food colouring — household-safe only; Tall glass bell jar (vacuum chamber) with hand pump.

**Hydrogen peroxide is not a row.** Practical PR-HM01 uses 6%, but at that strength it is an
irritant that burns skin and eyes, and this is a shop a child can add to a basket. It stays the
tutor's own kit for a supervised practical.

`check-library.js` holds the file to the schema (no missing column, no extra one), unique ids that
the shop does not already have, no I045, **no price written**, `active` true, a name on every row, and
the CSV cell for cell against the JSON in the tab's column order.

### Checks, and that each one fires

- **check-flow**, one journey for both halves: Shop right of Booking; page 0 is the basket and Tools
  has none; Find offers no shop thing and has no Shop door; signed out, no tutor, admin, withdrawn or
  wearable row; an admin sees the kit; Gooey Louie under a Games heading; a starred shop thing on
  Saved; `cart-open` lands on the basket. Mutated three ways — `FUNNEL_NOT_FOR` back to Booking alone,
  admin rows shown to anybody, the cart widget back to `kind: 'tool'` — each red for its own reason,
  green again on the real files.
- **check/states.js**: a `shop` entry — the first shelf, and the full basket moved from `tools`.
- **check-library**: a price on I041, I042 renamed I040, `slot` removed from a row — each red, green
  again.
- **check-bundle** caught the move on its first run: it went to Tools for the Send button. It goes to
  the Shop column now.
- `check/fixture.json` sends ten shop rows shaped as `doGet` sends them (no wearable, so the wardrobe
  is measured as before). It sent none, which is why no check had ever drawn a shop card.

### Not done, and seen

**Pence prices still read as credits on the card**: "Scientific calculator · 1400 credits". The
Find mapper keeps `priced_(x.price)` and drops `unit`, and `thingCard_` and `shopTiles_` print
credits. The Shop column draws the card as Find drew it, so it inherits this. A later batch fixed
the basket line (`cart-add` reads `unit`); the card is the same fix one function earlier.
