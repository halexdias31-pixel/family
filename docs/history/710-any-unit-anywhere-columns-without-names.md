# 710 — Any unit anywhere, and columns without names

The owner, from a screenshot of the layout editor: ◀ on the first column made a new column (600) and showed a
"COLUMN NAME: New column" card with Rename and Delete column. "There shouldn't really be a name distinguisher for the
column. Each widget is one unit and can move left and right, up or down, ANYWHERE, ANY widgets. (Some widgets are
distinct, like posts: all posts in the feed move together as one thing.)"

## What changed (js/layout.js)

- **One set of columns for every unit.** `hostCols_` is the widget columns (Reels, Tools, Shop, Games), the card columns
  (the three settings, the three profiles, Business, Site) and an admin's own. A widget, a settings card, a profile card or
  a tool moves ◀ ▶ to the neighbouring one whatever it holds (`layAcross_`), and ▲ ▼ past the neighbouring unit of either
  kind (`layUpDown_`). Both tile rows are built by `acrossTiles_`. Business and Site still take only their own cards (491).
- **One order per column.** A widget's column is still the `widgets` key that lists it, now any column; a card's the
  `cards` key. When a column holds a card, `cards[col]` is its whole order and may name widgets (`colOrderSet_`);
  `colEntries_` sorts the column's widgets and cards by it. `cardsOf_` draws every column, and `widgetColumn_` (arcade.js)
  asks it once layout.js has loaded. A widget on a card column is started there: the card columns and every custom
  column are in `WIDGET_COLS`, `widgetsOn_` answers for them and `paint` (shell.js) wakes them.
- **No column names.** The Column name card, Rename and Delete column are gone (an empty column already goes). A custom
  column is `{id}` plus where it stands: `first` (new, ◀ past the first column a unit stands on: before Reels), `left`
  (600, before Parent settings), `admin` (508, after Site), else before Business. The tab and pager still need a word, so
  `customTitle_` names the column for its first unit. A layout saved with a `title` loads; the title is dropped.
- **Grouped units.** A merged card (480) and a profiles list (`ppl:*:all`, one card mark over every person's page) were
  already one unit and move whole. A merge is of one kind: a widget never merges with a card.

## Backend

`layoutClean_` (core.gs) keeps `first`, drops `title`, lets `cards` name the widget columns, and keeps up to 40 `widgets`
keys. All four version stamps bumped.

## Limits

- The feed's posts, the reels, the shop's items and the finders are drawn by their own columns' code, not by the layout:
  they do not move, and nothing moves onto Feed, DMs, Find, Find 2, Saved, Book or Apprentice. Moving the posts as one
  unit needs the feed's camera page and paging (`feedCamAt_`) to stop assuming the feed column.
- A widget column's pager names (`widgetColNames_`, shell.js) leave a card's page unnamed.

Journeys: `layout engine (466, 710)` and `layout engine (710): any unit anywhere` in check-flow.

## The others make room

The owner: "When I move a widget, I should see the other widgets moving out of the way to make space for the new one."
`layMoveShow_` reads every unit's box on the column before the save (`layUnitsAt_`) and glides each one that moved from
where it was (`layMakeRoom_`), beside the moved unit's own glide; Less motion skips it.

## Still open (owner's notes of the same day)

- Whole columns movable, by a tile on the column (not a name card): needs a saved column order laid over `TAB_ORDER`.
- Spotlight and Board games movable like every widget; the feed moved by its top post with the rest following.
