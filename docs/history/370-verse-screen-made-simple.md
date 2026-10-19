# 370 — The verse screen, made simple

The owner (19 Oct), not technical, with a Chromebook and a phone: "make the whole process for the
waveshare thing even more user friendly … simple and minimal", then "update the whole code to be even
more simple and minimal and intuitive".

- **Wi-Fi is typed into the install page.** The firmware speaks Improv Wi-Fi serial (`improv.h`, ~50
  lines, no library), so after Install the same page asks for the Wi-Fi name and password. No phone,
  no `Verse-Setup` network. WiFiManager, the editable backend address and the BOOT-hold setup are gone:
  one Wi-Fi path, the built-in `API` address.
- **Our own installer, not ESP Web Tools.** Trying it, the owner saw "3 or 4 devices listed" and too many
  screens. ESP Web Tools takes no port filter, so `install.js` (esptool-js 0.6.1) asks Chrome for
  Espressif's USB id 0x303a only, writes the `.bin` at 0 (USB-JTAG reset into download mode), resets,
  reopens the port (it may come back as a new one) and shows two boxes for the Wi-Fi. No erase prompt, no
  logs, no versions; `manifest.json` is gone. Failures in plain words: nothing chosen → "Try a different
  cable"; port open elsewhere (`NetworkError`/`InvalidStateError`) → "Close other tabs"; no download mode →
  "Hold BOOT, unplug and replug, then press Install again".
- **`verse.cpp` is one line of events:** wake → Wi-Fi → fetch → draw → sleep. Woken by hand (plug-in,
  RESET, a fresh install) it says what is happening in one plain sentence and listens on USB for Improv:
  20 s for saved Wi-Fi, then 10 min for the page, then 2 min more so Install can offer "Change Wi-Fi". The
  morning alarm does none of that. The verse copy kept in flash went: e-paper keeps its picture.
  Screens: "Connecting to Wi-Fi...", "Now type your Wi-Fi name and password on the Chromebook.", "That
  Wi-Fi did not work. Try the name and password again.", "No Wi-Fi. Plug me into the Chromebook and press
  Install.", "No verse yet. I will try again soon."
- **`backend/verse.gs`:** the Ledger `verses` tab and the coprime-step rotation went; day n shows verse
  n mod 79 (still 79 days without a repeat, never yesterday's). `check-verse` now allows only `people`.
- **Install page:** three numbered steps with tiny drawings, one Install button, a progress bar, "needs Chrome on a
  Chromebook or computer", a one-line "if it doesn't show up". Found from the admin area: a **Verse screen
  · set up** tile under the business cards (`verseCard_`, records.js), an `href` tile.
- **Proof without a board:** `tools/epaper-verse/test/improv-test.js` compiles `improv.h` into a harness
  with g++ and plays ESP Web Tools' packets (state, info, good and bad Wi-Fi, noise, bad checksum). It
  was also run against the real improv-wifi-serial-sdk 2.8.1 `ImprovSerial` over a fake port: detected,
  wrong password rejected `UNABLE_TO_CONNECT`, right one provisioned. `test/install-test.js` drives the
  page in Chromium with a pretend `navigator.serial` and esptool-js: the filter, the write at 0, the reset,
  a wrong then right password, and the three failures (a wrong vendor id fails it). The Business flow
  journey now wants six pages, the last holding the tile; dropping the tile fails it. The firmware compiles (1.2 MB);
  not yet run on a real board.
- Lines: verse.cpp 234 → 193 (+ improv.h 51), verse.gs 117 → 92, install.html 40 → 52 (+ install.js 114), README 59 → 31.
- Versions bumped to `2026-10-19-g-verse-simple`.
