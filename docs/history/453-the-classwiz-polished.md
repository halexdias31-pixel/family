# 453 — The ClassWiz, polished

Owner, on the first drawing (447): "could be better, looks a bit off".

- **Legends:** every key has one fixed legend slot above it (`.mc-alt`, always drawn, empty or not), centred on
  its key, one small size; rows are separated by one gutter (`--calc-gut`). Superscripts in a legend are lifted
  by position, not `vertical-align`, which a flex slot ignored.
- **Key faces:** the ■/□ placeholders are small SVG line drawings (`MK_*` in arcade.js) at the weight of the
  type, never solid blocks: fraction, √□, □^□, □², log□□, ×10□ and the SHIFT legends ∛, □⁻¹, □³, mixed fraction.
- **Top block:** a grid of half-rows: captioned keys take three, D-pad keys two, so the pad (a cross, as on the
  device, not a disc) sits clear; SHIFT/VARIABLE/FUNCTION/CATALOG/TOOLS are their own row below it.
- **LCD:** a status row (S lit with SHIFT, D, Math, ▲ once there is history) drawn from `data-i` by CSS so it is
  never part of the sum's text (check-flow reads it); an empty display shows the caret and a 0.
- **Header:** the device is the card, with no case inside the case, under a quiet uppercase name with its star.
