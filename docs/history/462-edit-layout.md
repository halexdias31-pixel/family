# 462 — Edit layout: an admin moves, hides and deletes widgets and moves columns, for everybody

**Replaced by 463** (`463-layout-tiles.md`): the board, drag and column moving below are gone; widgets now carry admin tiles.

## What the owner said

- *"Make it so I can move each widget to edit the layout of the website like how iPhone lets you move apps. I can do this as admin. Or I can swap entire columns around."*
- *"Allow me to also be able to delete widgets, not just hide them."*

## How it works

- **The way in** is one home: a **Layout** card on **Business** (admin only, so the tile can only be seen by
  somebody allowed to use it): *Edit layout*, and *Reset layout* when a layout is in force (`layoutCard_`, layout.js,
  drawn by `adminPages_`, me.js).
- **Edit layout is a mode, not a pop-up**: `#layout-board` covers the whole app with its own bar (Reset, Done). Nothing
  behind it can be pressed, swiped, padlocked or turned by a key (its pointer, touch and wheel events stop at the board;
  arrow and page keys are held in a window-capture listener). Every widget and column name jiggles; with
  `prefers-reduced-motion` they hold still and wear a dashed gold outline instead.
- **Columns** are a row of names at the top. Hold one and drag it over another to reorder; or pick it and use the ◀ ▶
  tiles. Every column may move; none can be deleted. `feed` stays `TAB_HOME` wherever it stands; `biz` stays
  admin-only (`columnsFor_` still drops it for anybody else).
- **Widgets** are the four columns that draw widgets: Reels, Tools, Games, Shop (`LAYOUT_COL`). Pick a column and its
  widgets are listed. Hold one and drag it over another to take its place, onto another column's name to move it there,
  or to the board's left or right edge and hold (450 ms) to turn to the neighbouring widget column, as an iPhone turns
  pages. The same moves without dragging: ▲ ▼ (in its column), ◀ ▶ (to the neighbouring widget column), and a
  *Move to* native select. *Hide* takes it off its column (it stays in the editor, dimmed, with *Show*).
- **Delete** asks twice in place: the first tap turns the tile into "Tap again to delete" for three seconds, never a
  pop-up. A deleted widget's id goes in the layout's `deleted` list: the code stays, so nothing breaks, but it is never
  drawn, started or counted by the pager, because every column reads its widgets through `widgetsOf_`, which now asks
  `layoutWidgets_`. A **Deleted widgets** line (one select and *Add back*) returns one to its own default column; Reset
  layout returns them all.
- **What cannot be deleted**: settings and profiles are not widgets — they are the cards of the six settings and profile
  columns (461), and every setting keeps its one home — so they have no Delete tile; their columns can be moved but not
  removed. Among widgets only the **Basket** (`cart`) is kept (`LAYOUT_KEEP`): it is the one place a shop order is paid,
  and `cart-open` lands on it.
- **Done** sends one `layoutSave` and draws the result at once (`layoutRelayout_`: `applyColumns_`, every column stale,
  `repaint`). If the sheet refuses, the old layout is put back with the reason as a toast.

## Where it is stored

One JSON value on the **config** tab, row `layout` (`LAYOUT_KEY`): `{ v, columns, widgets: {col: [ids]}, hidden, deleted }`.
`layoutSave` is `ACTION_ACCESS` admin and checks rank again (`rankAtLeast_`); `layoutClean_` (core.gs) keeps only the
shape and ids that look like ids, refuses rubbish, and caps it at 8000 characters (`LAYOUT_MAX`); a reset empties the
cell. `doGet` sends it parsed as `layout` (null when empty or broken) and `configPublic_` leaves it out of
`constants.vars`, so it is sent once.

The site lays it over the code's order (and the sheet's `columns` tab) with full fallbacks: unknown ids are ignored,
anything the layout does not name is appended in the code's order, a broken value is ignored, and a phone keeps a copy
(`familyLayout`) so the first paint before the payload is already arranged. `TAB_ORDER` and
`data/settings/columns.json` stay the defaults, and check-doors still guards them.

## Checks

- `js/check-layout.js` — through the real backend: admin only (parent, tutor, no token, a parent naming the admin's id
  all refused), cleaned, rubbish and size refused, reset, and doGet sends it once.
- check-flow, three journeys "edit layout (462)": enter from Business, move within a column and to another, swap two
  columns, Done posts once and draws, a reload keeps it, Reset restores; delete asks twice, the deleted widget is not
  drawn or paged from the payload, Add back returns it, a member has no tile and cannot post; a stale or garbled layout
  falls back cleanly.
- Real touch (Playwright, CDP touches, 390 × 844): a hold-and-drag in a column, onto the Games name, to the edge, a
  column name dragged, delete twice, reload, reduced motion.

## What went wrong on the way

A phone cancels the pointer of a long press (`pointercancel`), so a finger's drag is carried by its touch events — and
those are heard on the element the finger first touched, because the board redraws under the finger and a detached
element's touches never bubble to the board (`layoutTouchOn_`).
