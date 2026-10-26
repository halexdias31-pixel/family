# 463 — Layout tiles: an admin moves or deletes a widget from tiles on the widget itself

## What the owner said

- *"Let's change this. Remove the whole edit layout system you just made. What I want are tiles which admin can click
  to move widgets. Like a delete tile so I can delete widgets."*

## What was removed (from 462)

The whole board: `#layout-board`, its Edit layout / Reset / Done bar, the jiggle (and the reduced-motion outline), the
hold-and-drag, the edge-turn, the column chips and the column ◀ ▶, the Move to select, Hide and Show, the key guard,
their CSS, the two `FIXED_OK` entries (`.layout-board`, `.lay-ghost`) in check-surfaces.js, and the three
"edit layout (462)" journeys. **Columns no longer move**: `applyColumns_` is as it was before 462 (the sheet's
`columns` tab, else the code's `TAB_ORDER`), and a stored `columns` or `hidden` is dropped on both sides
(`layoutSane_` in layout.js, `layoutClean_` in core.gs), so a 462 value still loads and keeps its widget order and
deleted list.

## What was kept

The storage and the apply path: config row `layout` (`LAYOUT_KEY`), the admin-only `layoutSave`, `layoutClean_`, doGet
sending it once as `layout`, `layoutWidgets_` inside `widgetsOf_`, the device copy (`familyLayout`), and every
fallback (unknown ids ignored, missing ones appended in the code's order, rubbish ignored). The value is now
`{ v, widgets: {col: [ids]}, deleted }`.

## How it works now

- **On every widget, for an admin only**, one admin-toned row under its own tiles (`layoutTiles_`, drawn by
  `widgetOnColumn_` when it is on its own column — not on Saved): ▲ Move up, ▼ Move down, ◀ Move to previous
  column, ▶ Move to next column (the widget columns Reels, Tools, Shop, Games in the order the columns stand), and
  Delete. A move steps over widgets the admin cannot see, so every press visibly does something.
- **Each press saves at once**: one `layoutSave` with the whole layout, drawn optimistically (`layoutRelayout_`:
  every column stale, `repaint`); if the sheet refuses, the old layout is put back and the reason is a toast.
- **Delete asks twice, in place**: the first tap turns the tile into "Tap again to delete" for three seconds, never a
  pop-up. The **Basket** (`cart`) has no Delete (`LAYOUT_KEEP`); settings and profiles are not widgets.
- **The Layout card on Business** keeps only *Deleted widgets* (a native select) with *Add back* (to its own default
  column) and *Reset layout*.
- A non-admin sees nothing new; their `layoutSave` is refused by the backend anyway.

## Checks

- `js/check-layout.js` — as 462, and a stored `columns`/`hidden` is cleaned out.
- check-flow, three "layout tiles (463)" journeys: the admin row and its five tiles, move down / up / to the next
  column each one post and redrawn, reload keeps it, a refusal puts it back, Reset restores, no board left; Delete
  asks twice, not drawn or paged, the basket has no Delete, Saved has no admin row, Add back on Business; a member
  sees no tiles and cannot post; a stale, 462-shaped or garbled layout falls back.
