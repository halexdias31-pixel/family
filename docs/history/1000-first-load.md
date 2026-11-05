# 1000 — Find's first screen no longer waits for doGet

**Seen:** the owner's iPhone, signed in, live: ~16 s of loading dots before Find's front menu. The local health walk said ~5.5 s because it answers doGet from `check/fixture.json`.

**Measured (tools/live-load.js, from a cloud box):** doGet signed out 3.6–11.4 s (cold Apps Script start ~11 s, warm ~3.7 s), 97 KB raw / 14 KB gzip. The library (`data/*.json`) is fetched in parallel and lands in ~2 s; it was never the wait. Find's draw waited on the *whole payload*: `finderScreen_` only ran when `load()` painted after doGet, and showed dots while `LIBRARY_LATE`. A signed-in admin's doGet is heavier than the public one, so cold start + heavy payload ≈ the 16 s.

**Fix:** a `setTimeout` at the end of find.js's load paints Find as soon as the LATER code is in while the payload is still coming; the front menu is the build's own (`FINDER_TAGS`), so it is the final one. `finderScreen_` also draws those answers while the library is late. Writes still wait (`awaiting_()` unchanged). No cached payload was needed, so nothing personal is stored on the device.

Locally, with doGet held 10 s: menu 11.0 s → 1.5 s.

**Check:** `tools/live-load.js` writes `data/live-health.json` (doGet cold/warm ms, KB, Find's first screen on a 390×844, 4x-CPU, 1.6 Mbit/s phone, first and return visit, signed out — no credential is ever sent). `tools/health.js` scores it: return ≤ 3 s, first ≤ 6 s, payload ≤ 100 KB gzip. Run nightly in `.github/workflows/live.yml`.

**Also (the red session-start suite):** `CARD_EXTRAS_` was filled at load by find/hymns/mechanics; the checks run every file as one in `FILES` order, where find.js comes before tiles.js. tiles.js now names those kinds lazily. `customTabsSync_` returns until layout.js has run; check-keyboard knows `FLOW_LAYOUT` (900) binds no ordinary box; check-qtypes gives `verifyTags_` its `isQ_`; finder-tags keys an admin's view apart (People, Settings).
