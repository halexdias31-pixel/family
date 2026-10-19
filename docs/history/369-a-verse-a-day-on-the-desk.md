# 369 — A verse a day on the desk

The owner (19 Oct) bought a Waveshare ESP32-S3-ePaper-1.54 (200x200 black/white e-paper, no battery) and
wanted "a different bible quote to me everyday", through Apps Script and a Ledger tab.

- **No verse tab was in `TAB`/`SCHEMA`**, so `backend/verse.gs` holds 79 short KJV verses (≤ 220
  characters), cut from `data/bible/*.json` by reference so the wording is exact, `[italics]` brackets
  removed. A Ledger tab named `verses` (`text`, `ref`) wins when it has rows; it is read by name only and
  kept out of `TAB` so a missing tab is not a schema gap.
- **`doGet ?verse=today`** (or `?verse=YYYY-MM-DD`) is the first line of `doGet`: no
  viewer, no setup, no payload. Tiny JSON `{text, ref, date}` through `jsonOut`. Day n (Europe/London)
  shows `(n * step) mod N`, step coprime to N: N days without a repeat, never yesterday's.
- **`js/check-verse.js`**: every verse short with a reference, 79 consecutive days all different, same
  day same verse, and no sheet opened but `verses` (and `people`, read by `jsonOut`'s surname net — the reply goes through `jsonOut` as `check-surnames` requires). Mutation (always index 0) fails it.
- **`tools/epaper-verse/`**: the owner has only a Chromebook and a phone, so no Arduino IDE. `verse.cpp`
  (GxEPD2 `GxEPD2_154_D67`, pins from Waveshare's demo repo) is compiled here with arduino-cli and
  arduino-esp32 3.0.7 into `epaper-verse.bin` (1.3 MB, unpadded merge, PSRAM off so it fits both board
  versions), installed from `install.html` with ESP Web Tools over Web Serial. Wi-Fi is typed in on a phone
  through WiFiManager's `Verse-Setup` page, which the e-paper itself announces; the backend address is
  built in and editable there. The code lives in `.cpp`, not `.ino`, because the local ctags is not
  Arduino's and its prototype pass broke the `.ino`.
- **Screen:** FreeSerif 12pt, or 9pt when it will not fit, centred; reference in italic under a rule;
  deep sleep until 06:02 UK time from NTP. On failure it retries in 30 min and the last verse (kept in
  flash) stays or is redrawn over the setup screen.
- **Licence:** GxEPD2 is GPL-3.0, so the binary is GPL-3.0 with its source in the folder (`COPYING`);
  the MIT/BSD notices are in `NOTICE.txt`.
- Not yet run on a real board.
- Versions bumped to `2026-10-19-e-verse`.
