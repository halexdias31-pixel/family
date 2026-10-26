# Verse screen

A Bible verse a day on the little Waveshare e-paper screen. No Wi-Fi, nothing to set up.

1. On a **Chromebook**, open **https://atfamily.co.uk/tools/epaper-verse/install.html** in Chrome
   (or: the site, admin area, **Verse screen · set up**). Plug the screen into the Chromebook.
2. Press **Install** and choose the screen (it is the only thing in the list). About a minute.
   "Done. Your verse is on the screen."

The screen has two buttons: **☀ (BOOT)** and **⏻ (PWR)**.

- **Sync** (what the widget on Tools shows): plug the screen into the computer, tap **Sync**, choose "@family. screen".
  If it is not in the list, press **⏻ once** and tap Sync again. It stays awake while plugged into a computer.
- **First install, or "old software"**: unplug; hold **☀**; plug in while holding ☀, let go; tap **Install** and choose
  the screen (in this mode Chrome calls it "USB JTAG/serial debug unit"); when it says Installed, press **⏻** once.

On a charger or battery it draws, waits a minute, then sleeps and shows the next verse every 24 hours.

The owner (26 Oct): "it connects but then doesn't respond… the steps and instructions seem vague and should use the symbols of the buttons too."

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
- **Build (482): `tools/epaper-verse/build.sh`** (PlatformIO, `platformio.ini`; `PIO=` and `OUT=` choose the pio binary and
  the cache dir) builds and merges bootloader 0x0, partitions 0x8000, boot_app0 0xe000, app 0x10000 into `epaper-verse.bin`.
  Re-run it whenever `verse.cpp`, `pictures.h` or `icons.h` change. Built 26 Oct 2026 with PlatformIO Core 6.2.0, platform
  espressif32 8.0.0, framework-arduinoespressif32 4.30312.261024 = arduino-esp32 3.3.12 on ESP-IDF 5.5.5 (3.0.7 is not
  in the PlatformIO registry), xtensa gcc 14.2.0, GxEPD2 1.6.9, Adafruit GFX 1.13.0, BusIO 1.17.4, esptool 5.6.0 (merge).
  Board esp32-s3-devkitc-1, flash 8MB QIO 80MHz, huge_app.csv, PSRAM unused, `ARDUINO_USB_MODE=0` (TinyUSB, so the
  USB name is "@family. screen") with `ARDUINO_USB_CDC_ON_BOOT=1`. Result: 724,336 bytes,
  sha256 `b6a803d69f5a38eb19fecab0c42a883d3eff332e82134e41b06d515c5ee8138f`. Not yet tried on a board.
- **Awake for USB** (482): deep sleep switches the S3's USB off, so the computer saw the screen and lost it. Now after a
  plug-in, RESET or ⏻ it draws, then listens 60 s, and for as long as a computer has it mounted (`tud_mounted()`);
  each `SHOW` redraws and restarts the minute; `HELLO` gets `READY epaper-verse 482`. The daily timer wake listens 3 s.
- **The widget's pixels** (482): `gfx-fonts.js` copies verse.cpp's three fonts into `data/eink-fonts.json`; `einkPage_`
  (js/records.js) is `drawVerse`/`drawPicture` line for line on a 200x200 canvas. `check-eink` holds the two together.
- **Picture version** (447): the same program built with `-DVERSE_ICONS` draws one of the site's icons
  (`TILE_ICONS`, js/tiles.js) large above the verse. `node tools/epaper-verse/make-icons.js` picks the icon
  per verse by meaning (its `RULES`) and writes `icons.h` (1-bit, 96/64/40/20 px, Chromium-rasterised);
  `--preview DIR` writes PNGs of chosen days. Build it by adding
  `-DVERSE_ICONS` to `build_flags`, run build.sh, rename the result to `epaper-verse-icons.bin` and put it beside `install.html`: the page then offers "Verse with a picture".
- Pins (Waveshare demo `github.com/waveshareteam/ESP32-S3-ePaper-1.54`): DC 10, CS 11, SCK 12, MOSI 13,
  RST 9, BUSY 8, panel power GPIO 6 (low = on). Panel: GxEPD2 `GxEPD2_154_D67`.
- **Sync from the site** (470): the Tools widget "E-ink screen" sends `SHOW VERSE n` or `SHOW ICON n` over Web
  Serial (115200); `listen()` in verse.cpp reads it while awake (above), answers `OK`, keeps it in NVS.
  Icon mode draws `pictures.h` (every row of data/icons.json at 120x160, written by `make-icons.js`) with its title.
  The widget also installs the `.bin` in place.
- Licence GPL-3.0 (`COPYING`), as GxEPD2; other notices in `NOTICE.txt`.
