# Verse screen

A new Bible verse every morning on the little Waveshare e-paper screen.

1. On a **Chromebook**, open **https://atfamily.co.uk/tools/epaper-verse/install.html** in Chrome
   (or: the site, admin area, **Verse screen · set up**). Plug the screen in with its USB-C cable.
2. Press **Install** and choose the screen (it is the only thing in the list). About a minute.
3. Type your **Wi-Fi name and password** in the boxes that appear. Today's verse appears.

Then plug it into any phone charger. It changes every morning at about 6am.

- **Not in the list?** Try another cable, or hold **BOOT** while you plug it in (press **RESET** after).
- **New Wi-Fi?** The screen says "No Wi-Fi". Plug it into the Chromebook and do the three steps again.

---

## Technical notes

- `verse.cpp` is the whole program (the `.ino` only names it for the Arduino tools): wake, join Wi-Fi,
  fetch `?verse=today` from the Apps Script backend, draw, deep-sleep until 06:02 UK time (30 min on failure).
  When woken by hand (plug-in or RESET) it listens on USB for 2 minutes so Install can change the Wi-Fi.
- `install.html` + `install.js` are our own installer on esptool-js 0.6.1 (unpkg): the Chrome list is
  filtered to Espressif's USB id 0x303a, the `.bin` is written at 0, then the Wi-Fi goes over **Improv
  Wi-Fi serial** (`improv.h`, about 50 lines); the chip keeps it. Tests, no board needed:
  `node tools/epaper-verse/test/improv-test.js` (g++) and `node tools/epaper-verse/test/install-test.js` (Playwright).
- Verses: `backend/verse.gs`, 79 short KJV verses; day n shows verse n mod 79.
- Build: arduino-esp32 3.0.7, libraries GxEPD2 and ArduinoJson. ESP32S3 Dev Module, USB CDC On Boot,
  QIO 80MHz 4MB, Huge APP, PSRAM off. Then
  `esptool --chip esp32s3 merge-bin -o epaper-verse.bin --flash-mode keep --flash-freq keep --flash-size keep 0x0 epaper-verse.ino.bootloader.bin 0x8000 epaper-verse.ino.partitions.bin 0xe000 <core>/tools/partitions/boot_app0.bin 0x10000 epaper-verse.ino.bin`.
  Bump `VERSION` in `verse.cpp`.
- Pins (Waveshare demo `github.com/waveshareteam/ESP32-S3-ePaper-1.54`): DC 10, CS 11, SCK 12, MOSI 13,
  RST 9, BUSY 8, panel power GPIO 6 (low = on). Panel: GxEPD2 `GxEPD2_154_D67`.
- Licence GPL-3.0 (`COPYING`), as GxEPD2; other notices in `NOTICE.txt`.
