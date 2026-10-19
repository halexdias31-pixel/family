# 371 — The verse screen goes offline: no Wi-Fi, ever

The owner (19 Oct), after 370's firmware: the e-paper still showed the old "Wi-Fi setup" screen.
"I did WiFi setup earlier. Now I don't know why it's like that. Should be like refresh. To keep it blank
and fresh and simple. Please. All I want is the most stable, least possible way for things to go wrong
and everything is just bang good."

- **Why the old picture stayed:** e-paper keeps its last image with the power off. A firmware that never
  reaches its draw (stuck joining Wi-Fi, waiting on the page, or never flashed) leaves whatever was there,
  so a 369 "Wi-Fi setup" screen outlived two rewrites.
- **Decision: nothing that can fail at runtime except power.** Wi-Fi, the backend fetch, NTP and Improv
  are gone. The firmware carries the 79 verses that were in `backend/verse.gs` (exact KJV, brackets and
  the `# ` paragraph marks removed, all ASCII, longest 202 characters). Every wake: `clearScreen()` (a full
  refresh to white — the old picture is wiped first), draw verse `i`, deep-sleep 24 h on the RTC timer.
  `i` is in NVS (`Preferences`); only the timer wake advances it (wraps at 79), so plugging in, RESET or a
  fresh install redraws the current verse — never blank, never stale. Unplugged, it resumes at the next
  verse. No messages on the screen at all.
- **Install page:** two steps, one button, the Espressif-filtered picker, write at 0, hard reset, "Done.
  Your verse is on the screen." The Wi-Fi boxes, the probe/reopen and all Improv code went; the three plain
  error lines stayed. `improv.h` and its g++ test are deleted; `test/install-test.js` keeps the page cases
  (no board in the list, port busy, no download mode, happy path with the filter, write at 0, reset, done,
  and no input on the page).
- **Backend:** `?verse=` had no other user, so `verse.gs`, its `doGet` line, `check-verse` and the
  check-gas-load entry went. Versions bumped to `2026-10-19-h-verse-offline`; after the next deploy the
  old `?verse=` URL answers the normal payload, which nothing asks for.
- The admin **Verse screen · set up** tile stays.
- verse.cpp 217 → 171 lines (79 of them the verses), improv.h 51 → 0, install.js 125 → 37; `.bin` 515 KB
  (was 1.2 MB with Wi-Fi). Compiled, not yet run on a real board.
