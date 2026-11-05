# 1020 — static controls: a tap never adds, removes or moves another control

Owner (screenshot of the 2D Shapes Q1 card): after tapping the pen's Straight line tile, Undo and Clear
appeared above the question near the figure, the stem's words and figure jumped into part (a), the Line tile
stayed lit with no clear way back, and the card's foot looked different. "Make it less dynamic — dynamic =
instability; the health checker should be scouring for this."

## The rule

Pressing a tile never adds, removes, moves or reorders any other control. Every control a card can have is
drawn from the start in its fixed place; a tile's state shows only by its own look (pressed / disabled).

## What changed

- `padSource_` (find.js): a part with its own figure, or the first part under a stem's one figure
  (`padStemFirst_`), is a pad from the start. Before, the first Pen/Line tap redrew the whole card
  (`qtRedraw_`), which carried the stem onto the part and added the pad's bar. A passage's grid
  (`surface: text`) is still made on its first tap — the one place left.
- Undo and Clear moved out of the pad's own bar (`padBar_`, still used by the whiteboard and board) into the
  part's one tool row (`qtUndo_`, qtools.js), dimmed while there is nothing to take back. They find their
  pad by `data-k` (`padOfTile_`); `padDim_` lights them on every save and repaint (a stroke used to leave
  them dim until a repaint).
- Tapping the tool already in hand puts it down (`padToolPick_`): one obvious way back to no tool.
- The phone's Tools fold (`qt-fold`, `QT_OPEN`) is gone: it added and removed a row of tiles on a tap. All
  tools are drawn from the start; the row wraps to two lines at 390.
- Drawing tools are offered only where the pad is already on the card (`qtRow_`), so parts (b), (c) under a
  shared stem figure no longer offer a pen that would redraw the card.

## The check

`check/qcard.js` stable-controls: on a question card, Settings and Find, every control's (act, x, y, w, h)
and the scope's height are recorded; each tile is tapped (and again); anything that appears, goes, moves
more than 2px, or a height change over 2px, other than the tapped tile itself, is a finding.
static-controls: an `on()` handler whose lines insert/remove tile rows (`insertAdjacentHTML`, `outerHTML =`,
`.remove()` near tile/row/bar). Budgets (structure-budgets.json, qcard): stable-controls 12 (all in
Settings: card-cancel closes the open report form, me-save/lay-split/pin-save add a line), static-controls 5
(card-share, job-request-answer, tal-size, seen-open). Ideal 0; the question card is at 0.
