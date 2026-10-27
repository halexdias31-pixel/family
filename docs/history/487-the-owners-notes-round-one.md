# 487 — The owner's notes, round one

The first notes left through 484's Note for Claude tile (Ledger tab `claude_notes`), done together, plus one the owner
said to the coordinator. css 2026-10-27-z2-notes-round1.

## N-1793092566714-752 (on Signed in): tiles a quarter of the size

> "make all tiles everywhere half as tall and half as wide. so in summary a quarter of its size now."

`--tile` 44px → 22px, `--tile-i` 18px → 10px, `--tile-gap` 6px → 3px (style.css `:root`); the busy spinner follows
`--tile-i`. check/tiles.js now wants 22x22 with a 10px mark. **This breaks the house rule that a tap target is 44px**
— the owner's explicit choice, recorded here; keypad keys, multiple-choice options and every other control keep their
44px floor. The search pill's magnifier keeps 18px (it is an icon, not a tile).

## N-1793093387490-240: tiles flow like words

> "change the universal rule for tiles, so that they fill up the space like text in a paragraph, aligned to the left.
> I don't need to separate admin tiles from user tiles as I can already tell it's for admin as it's yellow."

One left-aligned wrapping flow per thing, in the order own, star, padlock, report, admin, note. `tileRow_` no longer
breaks a row into balanced lines (`tileLines_`, `TILE_ROW_MAX` and `.tile-break` gone); `.tile-group.is-admin` is
`display: contents`, so the admin's tiles wrap with the rest; `.tile-pair` (484) is gone; the 467/480 no-orphan
container queries are gone; the question's tick-and-bin row and the padlock column's centred row are left-aligned too.
check/tiles.js: same size, left-aligned (first tile at the left edge, neighbours one gap apart), no overlap, no spill —
the lone-orphan rule is removed. check-flow's "balanced lines" assertions went with it.

## N-1793093232411-362 (on Photographs): one thing needs no opening

> "I shouldn't have to click on it to open it. it should be simpler like some other stuff. this goes for other widgets
> too. it's literally just a widget of one thing so does not need to be opened."

Every `ce-fold` (`ceFold_`, me.js: Photos, Qualifications, At a glance, Venues, Figure, Handle, Extra seat, Picture)
is drawn open, its chevron gone, and a tap on its line does nothing. Left as they are, because each holds a list,
not one thing: the Progress widget's papers (`prog-paper`, arcade.js, one fold per paper) and the many-choice pickers
(`many-d`). Games are untouched (they start on their own).

## N-1793093611113-238 (on Find by handle): the Reels search bar

> "this should look like the search widget near reels"

`searchPill_(attrs, cls)` (tiles.js) is the one search bar: a `<label class="search-pill">`, the magnifier inside a
round box. Reels' video search and the People search both draw it; the CSS is `.search-pill`. check-drafts' two
entries became one, on `searchPill_`.

## N-1793093739150-848 (on Rate and class size): Availability on Tutor settings

> "I can't find the availability tile here in this column."

Not a layout delete. For anyone the Staff hub serves (`hubFor_`: Staff, or an admin holding a tutor row) `hubOwns_`
took the week's fields off the card, because the hub's Hours part (432) was their home — so Tutor settings had no
Available card. The week's one home is now the Available card on Tutor settings (`own:staff:week`): `hubOwns_` keeps
only the rate and seat, the hub's Hours part and `hoursHtml_` are gone (three parts: Terms, Pricing, Statement).
check-flow's hub-hours journey became "Availability on Tutor settings"; check/states lost the hub-hours state.

## Said to the coordinator: the festive card has no Delete

> "that widget above the camera shouldn't even be there. I want to delete it but you haven't given it a delete button."

A thing drawn outside the card columns is an *item*, `item:<col>:<name>` (`itemMark_`, layout.js): for an admin a
row of Delete and Note; deleted, it is in the layout's `deleted` list and gone for everyone (477). The festive cards are
one item, `item:feed:festive` (deleting it removes every festive card, this and future holidays); the Camera is
`item:feed:camera`; Daive's card is `item:dm:daive`. Not left for Claude to delete — the owner will use the bin. Items
are not moved (their column's own code draws them). check/tiles.js now asks, as an admin, that every card on every
column's pages has admin tiles, except a person (a row of people, with Start here), a reel slide (a row of the media
tab), and a column's own empty line.
