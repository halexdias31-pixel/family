# 447 — The calculator is a ClassWiz

Owner, sending a photo of the fx-83GT CW: "this is more what I was looking for".

The Tools calculator (engine and tree from the Casio rebuild) is now drawn as that device: a charcoal
rounded body, a pale grey-green LCD with dark ink and a faint dot matrix, the site's name letter-spaced
where the model name sits (no maker's name or trademark), a top block of dark round keys (ON, HOME,
SETTINGS, back), a D-pad on a dark disc with OK, a scroll rocker, SHIFT in blue, VARIABLE / FUNCTION /
CATALOG / TOOLS, two rows of six oval function keys and four rows of five big round keys, with the blue
SHIFT legends printed as on the case.

- A device, not paper: its colours are `--calc-*` tokens on `.calc` itself, nowhere else.
- `CALC_KEYS` (arcade.js) is the face, in order: `[key, label, class, legend, name]`. `CALC_SHIFT` says what a
  key is after SHIFT (7 π, 8 e, − (−), ■^■ ■⁻¹, log ln, √ ∛, ■² ■³, sin⁻¹…, EXE ≈). A printed legend with no
  meaning here (A–F, x y z, QR, INS, OFF, °′″, ",") and VARIABLE, FUNCTION, CATALOG, TOOLS, SETTINGS and x say
  "… is not on this calculator" on the answer line and type nothing — never a silent key.
- OK is EXE, ON and HOME clear, back is DEL, the rocker scrolls the history, FORMAT is S⇔D, ≈ is EXE then decimal.
- Five across, always: the whole grid cell is the button (the drawn cap sits inside it), the card's own padding
  is dropped for this widget, and the body's side padding shrinks with the viewport, so a key is about 40px
  wide at 360px and the keypad never re-flows to four.
- check-calc: the face is two rows of six and four of five, SHIFT reaches π, e, (−), ■⁻¹, ln, ∛, sin⁻¹, ≈, and the
  new keys behave (77 cases).
