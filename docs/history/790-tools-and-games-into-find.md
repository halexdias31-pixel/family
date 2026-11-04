# 790 — Tools and Games go into Find (stage 1 of 4)

The owner (notes N-1793746015031-79336 and later): simplify the site by moving things into Find. Stage 1 moves
the Games column and the Tools column into Find, under the answers "Games" and "Tools". The Basket stays a column
(Shop), and so do Reels' lead widgets.

## A widget is a Find card

- No per-widget or per-facet rule. Every widget already had a kind (`tool`, `game`) and `KINDS` (find.js) already
  filed those kinds under the groups `Tools` and `Games` — the entries had been kept for exactly this (see the § note
  "THESE TWO STAY IN THE TABLE"). `stuffItemsRaw_` now lists each widget `findWidgetList_()` (arcade.js) returns, as an
  ordinary item: kind, name, `what` as its sub-line, its words as `text`. The funnel asks it the normal way: the first
  question (`forLabel`) answers Tools or Games, the second collapses on one answer, then its own name.
- Its card (`widgetCard_`) is the card its column drew, `widgetOnColumn_(w, false)`: the slot, the star, the padlock
  and Suggest (486). It has no `key`, so `stuffCard` does not add a second star row.
- Started and stopped the way a column's are. `WIDGET_COLS` holds `stuff` and `res` instead of `tools` and `games`;
  `widgetsOn_` asks `finderWidgets_(col)` — the widget slots that finder's filled pages hold (Find fills only the pages
  near the glass). `startScreen_`'s general branch (710's "a widget moved onto a card column is started there") wakes
  them on arrival, `widgetsGlass_` stops what leaves the glass, and `stuffFillOne_` asks `finderWake_` to wake a card
  filled while you are on the finder (a timer, so it captures its finder's id).
- Deleted: the old single-widget path in find.js from before Tools was a column (`showingWidgets`, the
  `widget-full` page, `startWidget_`/`stopWidget_`/`drawWidget_`/`WIDGET_ON`), and tiles.js's `widgetTiles_` and
  `widget-open` Open tile. The `.widget-full` rules in style.css are left for now (no markup uses them).
- A session's live widget (`liveWidgets_`, book.js) lost `groups: 'Booking'`: Booking is not offered by the funnel,
  and its only home was the Tools column. It is under Tools now.

## Which widgets: data

`data/settings/widgets-in-find.json`, read with the other settings files (`settingsInto_` → `DATA.widgetsInFind`).
A row is `{widget, find}`: `widget` is a kind (`tool`, `game`) or one widget's id, and an id's row wins over its
kind's. Before the file comes (or if it is empty) every tool and game is in Find (`FIND_WIDGET_KINDS`). Stage 4's
"Move into Find / Move out of Find" tool only has to write an id row with `find` TRUE or FALSE; `widgetInFind_`
already reads it. A widget moved out of Find has no column to go to yet: that is stage 4's to decide.

## The columns went

- `tools` and `games` left `TABS`, `TAB_ORDER`, `data/settings/columns.json`, index.html's sections and the two
  `screen()` calls; `tools/columns_gs.js` re-wrote constants.gs's block, so the four stamps were bumped.
- `LAYOUT_COL` is `{ reel, shop }`: a tool or game has no layout home and no ▲ ▼ ◀ ▶, Merge, Start here or Front door —
  the funnel places a Find card. It keeps the admin tiles that are the widget's own: Edit words, Who sees this and
  Delete (`layoutTiles_`'s first branch); Deleted on Business names it and puts it back (`anyWidgetOf_`). A saved layout that
  names `tools` or `games` still loads — `layoutSane_` drops a column it does not know, `frontGo_` ignores a front
  door on a column that is not there — and the widgets it placed are found in Find. A widget it had moved onto a
  card column is in Find too.
- Lazy loading unchanged (670, 720): no file joined or left `FILES` or `LATER`.

## Checks

The journeys that opened the Tools and Games columns now reach the same widgets through Find › Tools and
Find › Games; a new journey plays a game from Find › Games and works the Calculator from Find › Tools.

## Second pass (after the container restarted)

- A sheet's `find` is a string, so `"FALSE"` was truthy and kept a widget in Find; `widgetInFind_` reads TRUE/YES/1.
- Typing held, as it was on Tools: a library card with typing in it holds Find's repaint and restart
  (`settingsKeep_`, `startScreen_` ask `stuff` and `res` as they asked `saved`), and a payload landing keeps a widget's
  box on a Find card (`typingBox_` left out every box on a finder, because the finder's own search box is held by
  `findKeep_`; a box inside a `.widget-slot` is not the finder's).
- Journeys: the ones that asked the admin's moves, merges, doors and pager names of a tool now ask them of the Reels
  widgets, the columns that still arrange widgets; the merge journey asks that a Find card has no Merge and that a
  layout saved with tools merged, or with a `tools`/`games` list, still loads. Draw-ahead journeys set Find to Tools
  (or Find 2 beside Saved) before leaving it, since Find draws ahead only the cards it has filled. Find is for members
  (400), so `findGroup` stands a member in when nobody is signed in; the journeys that asked a signed-out Tools ask
  the list instead.
