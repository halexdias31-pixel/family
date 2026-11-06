# 1070 — instant phone load, signed in

**Owner:** "when I open the site on my phone it takes longer than I'd like to load", then: "it does load quick upon open, but I hit [a menu] before it can load it all in".

**Measured** (`node tools/live-load.js --local`: the repo served gzipped with ETags like GitHub Pages, the fixture as doGet held 10 s, a signed-in student, 390x844, CPU x4, 150 ms / 1.6 Mbit/s; a third visit is the return, so the service worker's store is full):

| | first visit | return visit |
|---|---|---|
| HTML | 0.2 s | 0.01 s (worker) |
| eager JS in, parsed and run (1.1 MB gzip, 3.1 MB raw, 96 files) | 3.3 s | 0.5 s |
| LATER files (Find is one of them) fetched and run | 8.3 s | 1.1–1.4 s |
| library JSON | 12 s | 4–8 s |
| doGet | 10.5 s | 10.8 s |
| **screen without a loader, Find usable** | **10.5 s** | **10.8 s → 1.4 s** |

What still blocked a signed-in phone: in the flow layout the first column (Feed for a student) sits above Find and showed dots until doGet; its columns and layout come from the payload. Find's own menu was already drawn from `FINDER_TAGS` (1000) once LATER was in, but only one answer deep, so the second tap into a menu met a loader until the library landed.

**Fixes:**
- The last good payload is kept on the device (`payload:kept`, shell-api.js `payloadKeep_`), keyed to the person's id and `BUILD_STAMP`, written 1 s after it lands or on `pagehide`. Token, PIN, password and secret keys are dropped at any depth. `load()` draws it first (`loadOnce_(…, kept)`) and the network's answer, a newer load, replaces it silently through the usual `landRepaint_`. Banners, messages and `profileRefresh_` wait for the real answer. Forgotten on sign-out and first to give way when the store is full (`keepPut_`). An unreadable copy is dropped and the load is a normal one.
- Find is painted with the kept copy even below the fold, and `finderSettled_` stays false while `LIBRARY_LATE`, so the build's answers stand until the cards are in.
- `tools/finder-tags.js` DEPTH 1 → 3: three taps into the menus are answered by the build (js/finder-tags.js 3 KB → 59 KB, 7 KB gzip).
- The library merge waits while a finger is on the build's menus (`libraryQuiet_`, core.js: a tap in the last 1.5 s while `finderTagsAt_` answers, 10 s at most). Before, a second tap that met the library landing stalled 2–9 s.
- **Find is first for everyone** (owner: Posts and Camera stood above Find on the live site). `TAB_ORDER` and data/settings/columns.json start stuff, res, saved, and `TAB_HOME = 'stuff'`. `applyColumns_` puts Find first whatever order a sheet gives. The other columns stay on, below it. `check/find-first.js` asserts that Find's search box is the first thing under the top bar for a visitor, a student and an admin at 390x844. It then moves Feed above Find and the probe must fail.

**After:** signed-in return visit 10.8 s → 1.2–1.3 s to a full first screen and usable Find, the last place back at 2.3–4 s, the slowest of three early menu taps 0.2–0.5 s. Cold signed-in Find usable 10.5 s → 8.3 s, because Find is now on top instead of below a Feed waiting for doGet. The cold first visit is still slow, and mostly because of bytes: 1.1 MB of gzipped JS takes ~5.6 s on 1.6 Mbit/s.

**Not done:** loading secondary LATER files only when their card opens. 720's rule (a LATER name is all-in or none) makes a second batch a real job, and it is the only way to get return below ~1.2 s or cold toward 3 s.

**Check:** `tools/live-load.js --local` writes data/load-health.json; tools/health.js scores return ≤ 1 s, cold ≤ 3 s, each early menu tap ≤ 1 s. Nightly in live.yml.
