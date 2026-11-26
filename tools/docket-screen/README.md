# Docket screen

What is due now on the Docket, on the little Waveshare e-paper screen on the desk. It looks again every 10 minutes.

The screen has two buttons: **☀ (BOOT)** and **⏻ (PWR)**.

1. On a **Chromebook** or computer, open **https://atfamily.co.uk/tools/docket-screen/install.html** in Chrome.
2. **Install.** Unplug the screen. Hold **☀**, plug it in while holding ☀, let go. Press **Install** and choose the screen
   (in this mode Chrome calls it "USB JTAG/serial debug unit"). About a minute. "Installed."
3. **Unplug the screen and plug it back in.** It says "Plug in to set up".
4. **Wi-Fi and Docket.** On the site, open the Docket and copy its private address. On the install page type the Wi-Fi
   name and password, paste the address, press **Send to the screen** and choose "@family. screen". If it is not in the
   list, press **⏻ once** and press Send again. "Done. Your Docket is on the screen."
5. Unplug it and put it on its charger or battery. It shows the first six things due, in the Docket's order.

On the screen: a black band saying **Docket**, then one row per thing: an empty tick box and its title (a long one is cut with
"..."). A thick box is overdue. **+3 more** in the band means three more did not fit. **offline** in the band means it could not
reach the Docket this time and is showing the last list it got. "All done" when nothing is open.

New Wi-Fi, or a new private address (after renewing it on the Docket): plug the screen in, press ⏻ once, and do step 4 again.

---

## Technical notes

- **Secrets are never in the repo or the .bin.** The Wi-Fi name, its password and the private address (it holds the Docket token)
  are typed into `install.html`, sent over the USB cable (Web Serial, 115200) and kept only in the board's NVS
  (`Preferences`, namespace `docket`: `ssid`, `pass`, `url`, plus `last`, the last good list). The page does not store them
  (no localStorage, no cookie, `autocomplete="off"`, the password field is emptied after sending). The board never says them back.
  `FORGET` over serial wipes the namespace. `test/install-test.js` also checks the .bin holds no private address.
- **Serial lines** (`docket.cpp` `hear()`, while the screen is awake): `HELLO` → `READY docket-screen 1`; `WIFI <name>`,
  `PASS <password>` (empty for an open network), `URL <private address>` → `OK`; `SAVE` → `SAVED`, then a fetch and
  `DRAWN fresh` or `DRAWN offline`; `REFRESH` → `DRAWN …`; `FORGET` → `FORGOTTEN`.
- **What it fetches:** the private address with `&do=list` added (`backend/post-account.gs` `docketAnswer_`): the line
  `docket-list`, then one open item per line in the card's order (`dkNowNextOf_`, so `dkSort_`): `! title` overdue, `- title`
  the rest. Apps Script answers through a redirect, which the screen follows. HTTPS is not certificate-pinned (`setInsecure`):
  the link is still encrypted; the token can be renewed on the Docket. Anything that is not a list (a refusal, a sign-in page)
  counts as a failed fetch: the last good list is drawn with "offline". `tools/docket-address.js` checks `do=list` against the site's order.
- **Each wake** (`docket.cpp`): Wi-Fi (20 s at most), GET (15 s), draw, keep, then deep sleep 10 minutes on the RTC timer.
  After a plug-in, RESET or ⏻ it stays awake 60 s, and as long as a computer has it mounted, listening (deep sleep turns its USB off);
  a timer wake listens 3 s. Board code (pins, panel power GPIO 6, battery latch GPIO 17, USB name "@family. screen", reset after
  install) is from `attic/epaper-verse` (482, 485).
- **Fitting** (`fit.h`, pure C++): FreeSans 12 pt rows of 29 px under a 26 px band, so 6 rows; titles are made ASCII (curly quotes,
  dashes, accents; an emoji dropped), then cut to 170 px with "...", at a word when one ends in the last third.
  Test, no board: `sh tools/docket-screen/test/fit-test.sh` (g++, a pretend font).
- **Installer test**, no board: `node tools/docket-screen/test/install-test.js` (Playwright, a pretend board and a pretend esptool-js):
  install, then the settings step (order sent, kept, drawn, offline, old verse program, a wrong address refused before sending).
- **Build: `tools/docket-screen/build.sh`** (PlatformIO, `platformio.ini`; `PIO=` and `OUT=` choose the pio binary and the cache dir),
  then commit `docket-screen.bin` and `docket-screen.md5` (the installer reads the flash back against it). Built 26 Nov 2026 with
  PlatformIO Core 6.2.0, espressif32 8.0.0, arduino-esp32 3.3.12, GxEPD2 1.6.9, Adafruit GFX 1.13.0, BusIO 1.17.4, esptool 5.4.0 (merge):
  1,302,528 bytes. **Not yet tried on a board.**
- The verse program stays in `attic/epaper-verse`; this folder does not offer it.
- Licence GPL-3.0 (`COPYING`), as GxEPD2; other notices in `NOTICE.txt`.
