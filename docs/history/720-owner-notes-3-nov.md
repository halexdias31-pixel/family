# 720 — owner notes of 3 November

## 1. "WIDGETS is not defined (screen reel)" — a half-loaded app (N-1793715702255-43865)

670 moved 41 files into `window.LATER`, appended by `laterFiles_` (data.js) as `<script src async=false>`.
They ran in `FILES` order, one by one, each as it arrived. In `FILES`, `find` comes before `map`. So for the
moment between find.js running and map.js arriving, `allWidgets` (find.js) existed and `WIDGETS` (map.js) did
not. Arriving on Reels in that window, `startScreen_` → `toolsStart_('reel')` → `widgetsOf_` asked
`typeof allWidgets === 'function'` — true — and `allWidgets()` read `WIDGETS`: a ReferenceError, reported.

The guard was checking the wrong name, and every `typeof laterThing_ === 'function'` guard in the eager files
(hundreds) had the same hole: a guard proves its own name is in, not the names that name reads.

**The rule:** a LATER name is all-in or none. `laterFiles_` now fetches the 41 files side by side and runs
them as inline scripts (with `//# sourceURL`) in one synchronous loop, then sets `LATER_IN` in the same
task. No timer, frame or tap can run between the first and the last, so no screen can see one LATER file
without the others, and a `typeof` guard on any LATER name is a true answer for all of them.

**The check:** `check/later.js` holds every LATER file at the server, goes to and starts every column in
`TAB_ORDER` (no ReferenceError may reach the console or the error report), then lets the files go one at a
time in run order; after each, no function a LATER file declares may be readable until the last is in.
With the old loader it fails at the first file (`pseudoMoves`, games.js).
