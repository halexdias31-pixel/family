# 477 — The layout has no undo

Owner: "there is no such thing as reset layout or undo. remove that widget. when i delete a widget it's
because i really didn't want it and it's gone. also when i move a widget up or down, that's how it is now
for everyone and that's that. like iOS when moving apps. iOS doesn't save your original layout, your
current layout is THE layout."

## What went

- The Business "Layout" card (`layoutCard_`, registry id `biz:layout`, me.js `adminPages_`), with its
  deleted-picker, Add back (`lay-w-undel`) and Reset layout (`layout-reset`).
- The "Deleted cards (N)" foot line on Business (`layoutFoot_`, 465) that stood in when the Layout card was deleted.
- The "Layout back to the default" toast; `layoutSave_(null)` now does nothing.
- Backend: `layoutSave`'s `reset` branch. An empty or missing layout is refused, never written as an empty
  cell. Version stamps bumped together (`2026-10-26-r-no-undo`).

## What stayed

- Delete is two taps in place (arm, then confirm), no pop-up — and final. `deleted` is the record that
  keeps an item from being drawn again, not a bin to restore from.
- A widget or card added in code later, never named in the layout, still appears in its own column.
- `LAYOUT_KEEP` (the basket): it protects Shop's one place to pay, not the Layout card, so it stays.

## Checks

- `js/check-layout.js` part 4: a reset is refused and the kept layout is unchanged.
- `js/check-flow.js`: the 463/465 journeys no longer use Add back or Reset and assert no way back is drawn;
  new journey "no undo (477)": a delete stays gone for the admin and a client after reload, and a move keeps for a client.
