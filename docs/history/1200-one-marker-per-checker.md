# 1200 — one page and one marker per checker (qpage merge)

The health checker counted 24 question types, each "its own page and marker" (variety-qpage, −6.6). Underneath, the page
was already one (`qtRow_`, one typed box, the pen where there is a figure) and marking was keyed on the row's fields
(`qtMarker_`), not its type. What still varied per type in code:

- **The keypad layer**: `QT_MATHS` (a list of type names) and an `=== 'essay'` test in `keypad-keys.js`. Now each
  `QTYPE_PROTOCOL` row carries `padLayer` (`maths`, `sheet`; else letters) and `qtKeys_(type)` reads it.
- **Choose and order** were two code paths in `markPart_`. Now one: the picks against the key with `markOrder_`, sorted
  for a choose (a set), in sequence for an order.
- **Points** had no proof: `tools/qengine-health.js` now proves the pen's `DRAW_MARK` (an example right, a far cross
  wrong, no ink unmarked).

`data/settings/qengine.json` marks 20 types moved; coords is a typed pair marked by `markAnswer_` (checker number), hand
is drawn (checker points). `js/check-qmerge.js` marks every library part with every likely typed answer by the frozen
old marker and the new one: identical, except 106 answers on keyless choose parts that the old set test called right
(no picks = no key). Those parts' Check says "no mark scheme" and never marks, so no child sees it.

Left: table, match, label (cells: their own surface and `qp-cells-check`) and essay (AI only, no checker).
Noticed: inside a vm box with Find loaded, `qType_` types differently from qtypes.js alone (a Find name shadows one of
its own); `tools/qengine-health.js` counts questions with that box, so its per-type counts are off. check-qmerge types
with qtypes.js alone.
