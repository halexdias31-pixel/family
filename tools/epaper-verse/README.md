# Verse screen

A Bible verse a day on the little Waveshare e-paper screen. No Wi-Fi, nothing to set up.

1. On a **Chromebook**, open **https://atfamily.co.uk/tools/epaper-verse/install.html** in Chrome
   (or: the site, admin area, **Verse screen · set up**). Plug the screen into the Chromebook.
2. Press **Install** and choose the screen (it is the only thing in the list). About a minute.
   "Done. Your verse is on the screen."

Then plug it into any phone charger and **leave it on USB power**. It shows the next verse every 24 hours.
If it is unplugged, it carries on from the next verse when plugged back in. Pressing RESET just redraws today's.

- **Not in the list?** Try another cable, close other tabs, or hold **BOOT** while you plug it in (press **RESET** after).

---

## Technical notes

- `verse.cpp` is the whole program (the `.ino` only names it for the Arduino tools). Every wake: full
  refresh to white (`clearScreen`, wipes any old picture), draw verse `i`, deep-sleep 24 h on the RTC
  timer. `i` lives in NVS (`Preferences`, namespace `verse`); only the timer wake advances it, so plug-in,
  RESET or a fresh install redraws the same verse. 79 short KJV verses, brackets removed, built in.
  No Wi-Fi, no NTP, no backend.
- `install.html` + `install.js` are our own installer on esptool-js 0.6.1 (unpkg): the Chrome list is
  filtered to Espressif's USB id 0x303a, the `.bin` is written at 0, then a hard reset. Test, no board
  needed: `node tools/epaper-verse/test/install-test.js` (Playwright, a pretend board).
- Build: arduino-esp32 3.0.7, library GxEPD2. ESP32S3 Dev Module, USB CDC On Boot,
  QIO 80MHz 4MB, Huge APP, PSRAM off. Then
  `esptool --chip esp32s3 merge-bin -o epaper-verse.bin --flash-mode keep --flash-freq keep --flash-size keep 0x0 epaper-verse.ino.bootloader.bin 0x8000 epaper-verse.ino.partitions.bin 0xe000 <core>/tools/partitions/boot_app0.bin 0x10000 epaper-verse.ino.bin`.
- **Picture version** (447): the same program built with `-DVERSE_ICONS` draws one of the site's icons
  (`TILE_ICONS`, js/tiles.js) large above the verse. `node tools/epaper-verse/make-icons.js` picks the icon
  per verse by meaning (its `RULES`) and writes `icons.h` (1-bit, 96/64/40/20 px, Chromium-rasterised);
  `--preview DIR` writes PNGs of chosen days. Build it with
  `arduino-cli compile --fqbn <as above> --build-property compiler.cpp.extra_flags=-DVERSE_ICONS`, merge as
  above to `epaper-verse-icons.bin` and put it beside `install.html`: the page then offers "Verse with a picture".
- Pins (Waveshare demo `github.com/waveshareteam/ESP32-S3-ePaper-1.54`): DC 10, CS 11, SCK 12, MOSI 13,
  RST 9, BUSY 8, panel power GPIO 6 (low = on). Panel: GxEPD2 `GxEPD2_154_D67`.
- Licence GPL-3.0 (`COPYING`), as GxEPD2; other notices in `NOTICE.txt`.
