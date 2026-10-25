# 447 — The verse screen with a picture

The owner (25 Oct): "can you make an icon version of the bible verses thing you made for e ink screen. you
already have a database of icons."

- **What it is:** the 371 firmware built with `-DVERSE_ICONS` draws one of the site's icons (`TILE_ICONS`,
  js/tiles.js) large above the verse, the reference at the foot. Same offline life: `clearScreen`, draw,
  deep-sleep 24 h, index in NVS. Without the flag it is the plain verse screen, byte for byte the same code path.
- **Which icon:** `tools/epaper-verse/make-icons.js` picks one per verse by meaning (`RULES`, first match
  wins: light → the sun-ray mark, word/law → book, truth/free → unlock, hills/earth/heaven → the picture
  with a hill and sun, refuge/fortress → lock, pray/ask → speech bubble, faith/sight → eye…). The set has
  55 marks at this ref (not ~400) and no heart or sheep: love falls to the spark, the shepherd to the person.
  18 marks are used across the 79 verses.
- **The bitmaps** are rasterised by Chromium from the site's own SVG paths at 96/64/40/20 px, 1-bit, into the
  generated `icons.h` — never drawn by hand. The firmware takes the biggest icon that leaves the verse room
  at 12 pt, then 9 pt; a verse too long for even 40 px gets the 20 px icon beside its reference, so text is
  never shrunk below the plain screen's 9 pt.
- **Install page:** one native select ("Verse" / "Verse with a picture"), shown only when
  `epaper-verse-icons.bin` exists beside the page, so nothing half-built is offered.
- **Not built yet:** this session had no arduino-cli / ESP32 toolchain, so `epaper-verse-icons.bin` does not
  exist and the select stays hidden. Build steps are in tools/epaper-verse/README.md. `verse.cpp` was
  syntax-checked both ways with g++ against stub headers; previews come from `make-icons.js --preview`
  (Chromium serif standing in for FreeSerif, so line breaks are close, not exact).
