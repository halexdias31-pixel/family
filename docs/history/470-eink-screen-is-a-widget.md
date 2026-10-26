# 470 — The e-ink screen is a widget

The owner (26 Oct, by voice):

- "the verse screen opens up a whole nother window. I do not want that at all. Keep it in the widget."
- "you know the icon database, which has a database of the most famous icons? It also needs to carry an SVG or
  something which replicates the icon, so I have the visuals for all the icons. And it needs to work in black and
  white, because a lot of e-ink screens are black and white."
- "the widget itself will pretend to be an e-ink screen so the person can know what it's supposed to look like.
  They're just designing their widget, but then they can, if they choose, sync their widget to an 8-inch screen
  they have. The widget itself is the feature; syncing is a bonus. It's not icon AND verse — you choose whether
  you want icons displayed or verses displayed."

## What changed

- **The widget is the screen.** Tools widget `verse` (js/map.js) is now "E-ink screen", for everyone (no longer
  admin). `paintEink_` (js/records.js) draws an 8-inch 800x600 panel (4:3) in pure black and white — its own
  `--eink-black`/`--eink-white`, no grey. Below it one line, Shows, and a row of tiles: Verse | Icon (one or the
  other, `aria-pressed`), Back, Next, Shuffle, Sync to my screen. The choice is kept per viewer in
  `localStorage` (`eink:pick`). Nothing links to `install.html` any more; `check-eink` fails if anything does.
- **The icon database** is the `icons` tab of the old Library sheet: 81 Orthodox icons (Pantokrator, Hodegetria,
  Vladimir, Rublev's Trinity, the feasts, the saints). It sat in `data/archive/`, which nothing may read, so it
  moved to `data/icons.json`. Every row now carries `svg`: an original 120x160 line drawing of the traditional
  composition (halo, gesture, maphorion, IC XC / MP ΘY), black on white only, written by
  `tools/epaper-verse/icon-svgs.js` from a small kit of parts — nothing traced, nothing copied. Re-run it after
  changing a drawing; `node js/check-eink.js` fails on any colour, grey, transparency, missing drawing or stale svg.
- **Verses** the widget shows are the screen's own: `icon-svgs.js` copies `verse.cpp`'s 79 into
  `data/eink-verses.json`.
- **Syncing, in place.** "Sync to my screen" asks Chrome's own USB picker (Web Serial, Espressif 0x303a) from the
  widget and sends `SHOW VERSE n` or `SHOW ICON n`; the program answers `OK`, keeps it in NVS and draws it, then
  moves on daily from there. If the screen does not answer, an Install tile appears in the widget and writes the
  program with esptool-js exactly as install.html did — still on the same page.
- **Firmware source** (verse.cpp): `listen()` reads that line for 6 s after a plug-in or RESET (never on the daily
  wake); `drawPicture()` draws an icon at 120x160 with its title. `make-icons.js` now also writes `pictures.h`
  (every icon, 1-bit, from its svg). Syntax-checked with g++ against stub headers both ways; **not built** — no
  ESP32 toolchain here, so `epaper-verse.bin` is still the old program, which draws verses but does not listen.
  Until it is rebuilt, Sync gets no answer.
- **The 8-inch screen.** The firmware drives the Waveshare 1.54" panel (200x200). An 8-inch panel needs its own
  GxEPD2 driver line and layout; the widget shows the 8-inch look.
