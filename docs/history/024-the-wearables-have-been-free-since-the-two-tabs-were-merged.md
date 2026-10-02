## The wearables have been free since the two tabs were merged

**"Shop items should be updated to price you think would be reasonable"** — and for the wearables the
price is not a judgement anybody has to make. It is in `AVATAR_ITEMS`, in this repository, and has
been since the wardrobe was built: bunches 15 coins, curls 20, beanie 20, shades 15, backpack 30,
football 25, wand 40.

**`seedAvatarItems`'s own note diagnosed this and then said what it could not do about it**:
*"ALREADY-SEEDED ROWS ARE NOT REPAIRED BY THIS. The guard two lines above returns early once any
avatar row exists, so a sheet that has run this before keeps its empty prices and needs `price_coins`
and `acquire` filling in by hand."* **A repair described in a comment and left for somebody to do by
hand is a repair that does not happen** — the same argument this file already makes about
`geocodeVenues` being a URL somebody had to assemble.

**`acquire` is the half that actually breaks it**, not the price. `doGet` reads that word to decide
which of the three price columns to look in, so an empty one falls through to `price_coins ||
price_pence` — both blank — and sends `price: ''`. Writing the coins without the word would still
leave a level-gated hat looking purchasable; the two go together or neither is worth writing.

**`repairShopPrices` is the machine doing it.** Matched on `art_id` + `slot` rather than on a name
somebody can edit, writing only into cells that are empty — so a price the owner typed survives it,
and a second run reports how many it left alone. On the migration ledger as `price-the-wearables` and
on `?run=priceWearables`. **The physical stock is not touched**: those rows are the owner's, typed
into the sheet, and this environment cannot reach a Google host to read them.

**And the app claimed a price nobody had typed.** `Number(x.price) || 0` on the shop mapper made a
blank cell a price of nought, under a comment defending the zero: *"a shop row is the one place `0`
genuinely means free — it is priced, and the price is nought."* True of a cell holding `0`, false of
a cell holding nothing. **This is the `cost: 0` fault on the one mapper that was exempted from the
fix**, because the exemption was written about the value and the bug is about the blank. `priced_`
tells them apart now, and `thingCard_` gained the fourth state its own comment listed three of.
Measured on four rows: a blank price reads *not priced yet* where it used to read *free*, 15 coins
reads *15 credits*, a level-gated crown *Level 10*, a real `0` *free*.

**`.price.faint` was the first attempt at that state and did nothing.** `.faint` and `.price` are
both one class, so the cascade settles it on which comes later in `style.css`, and `.price` does. A
class that silently loses a specificity race is the `--fly-ink` fault wearing a different hat — it
reads as a decision and behaves as nothing. Its own class instead.
