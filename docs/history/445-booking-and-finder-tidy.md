## 445 — the booking grid at a client's house, and a tidier Finder (2026-10-25)

Four of the owner's asks in one pass.

**1. Client House showed no hours.** Owner: "the client house doesn't seem to have any lessons or availability … I would
like you to change that." With Venue `Client House` the week grid was empty and said "The tutor's hours and the venue's
do not overlap." The venue row (`data/settings/venues.json`, the sheet's `venues` tab) carried one stray cell, `w15`, so
`slotGrid` (book.js) read the house as open one hour a week. A venue with no hours was already no restriction (`!haveV`);
the rule now also says a client's own house keeps no hours of its own: `atClientHome_(loc)` (core.js, by name — the
same reading the seat floor uses) gives `vAvail = {}`, so the grid is exactly the tutor's hours, whatever the row says.
`isHome` was not used because it also counts a free room (a library at no rate), which does keep hours. Online keeps
its row (09–19 every day), which narrows a tutor only at the edges, so it was left alone. Journey: "with Client House
chosen the week grid shows exactly the tutor's hours, whatever stray hours its row carries" — fails on the old rule.

**2. The icons left Find.** Owner: "you've added icons … not necessary … get rid of the icons thing." 403's admin-only
Icons kind went: `iconItems_`, `ICON_GROUPS`, `iconUses_`, `iconCard_`, `icon-none` (tiles.js), the `icon` kind, the
`iconGroup` facet and its `TAG_OF` colour (find.js), the facets.json row and the `.icon-*` styles. The marks themselves
(`TILE_ICONS`, `tileIcon_`) are untouched — every tile still draws them. A kept `Icons` / `iconGroup` chip is dead:
`iconGroup` is in `RETIRED_FACETS`, `Icons` in `RETIRED_SHELVES` and `RETIRED_ANSWERS.kindLabel`. **The sheet's facets
tab may still have an `iconGroup` row**; it is ignored as retired, and can be deleted.

**3. Resources went into Content.** Owner: "resources only has boxes and fights … no reason for the resources
distinction. Boxes and fights can go under content, and then this resources tag can kind of get deleted." The `boxer`,
`fight` and (admin-only) `bible` kinds are labelled `Content` now; no item says Resources. The Find 2 column (`res`) is
still the second finder — only the tag went. The Boxing and Books shelves stay. A side effect of the one rule (396): in a
payload with no questions (the flow fixtures), What kind is now lopsided (Content outweighs Projects) and is passed
over; the journeys that walked Learning → Resources walk Learning → Content and pass a rung the rule holds back as
lopsided rather than failing. With the real library's questions What kind is asked as before. `check-bible` wants
Learning · Content.

**4. A fight is tagged like a question.** Owner: "each fighter's name could be a tag … formatted like the questions in
Finder … Jack Johnson is just a tag. James J. Jeffries is just a tag. July is a tag. 1910 is a tag. Heavyweight is a tag.
Four, as in the fourth (round), can be a tag. TKO is a tag … with the image at the bottom, like with the questions."
Five ordinary facets (no flag; FACET_KEYS unchanged): `fighter` (Fighter — a bout's two corners, and a boxer's own name
so his name finds him and his bouts), `boutMonth` (Month), `boutYear` (Year), `boutRound` (Round — `Round 15`), and
`boutMethod` (Result — KO, TKO, RTD …), placed in facets.json around `decade` and `division` so a card reads fighters,
month, year, decade, weight, round, result. `fightCard_` dropped the date / division line and the method · round line
(the tags say them); a decision that went the distance still says its length. The two faces and their credits are last,
under the tags (`.fight-faces` lost its `order: -1`). The boxer-fights journey asks for the seven tags and the picture at
the foot. **The sheet's facets tab wants the five rows** (fighter 34.1, boutMonth 34.2, boutYear 34.3, boutRound 36.1,
boutMethod 36.2); without them the code places them by its own order.
