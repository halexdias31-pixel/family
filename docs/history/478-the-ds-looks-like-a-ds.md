# 478 — The DS looks like a DS

Owner, with a screenshot of the Console playing a DS game: "this looks [awful]. also the game starts lagging and
crashing LIKE CRAZY. make it actually look like a ds."

## What the screenshot showed

A tall white box with one black pane holding both screens, a thin pale band for a hinge, and the key-list panel
(`#nes-legend`) under it. On a fine pointer the console was in keys mode, and below 18rem of container width the
drawn buttons beside the screen (`.nes-deco`) are hidden, so the DS had no buttons at all — just the key list.

## The look

- The DS always wears its own pad (`nesPadShow_`: `NES_.sys === 'nds'` or touch), on keys as on touch; a mouse
  presses it as a finger does. Its drawn side buttons (`.nes-deco`) are never shown on a DS.
- A white clamshell (style.css, "THE DS LOOKS LIKE A DS"): top screen in the upper shell, a hinge band the full
  width of the body over melonDS's 32 gap rows (glass, shell edge, cylinder, shell edge, glass — so no game pixel
  is covered and the pen still lands where it is put, 437), the touch screen in the lower shell, D-pad left,
  A/B/X/Y right in a diamond, round Start and Select under them, L and R on the top corners. The picture stays
  256x(192+32+192), `image-rendering: pixelated`. Colours are the component's own, on `.nes-wrap[data-sys="nds"]`.
- The key list is hidden until the Keys tile asks, on every system (`nesLegendOn_`: `NES_.legend === true`).
- The other systems are unchanged (GBA screenshot taken to confirm).

## Lag and crashes — what is verified and what is inferred

No DS file is in the repo and the EmulatorJS CDN is not reachable from the build machine, so melonDS itself was
not run here. Measured in Chromium at 390px with the CPU throttled 4x:

- **Verified: the widget was redrawn under a running game.** `consoleStill_` → `nesPaint_` rewrote the tiles
  (`nesTiles_`) and the stage every call: 200 calls took 186 ms and 1800 DOM mutations. `nesPaint_` now returns at
  once while a game runs and its markup is there: 200 calls, about 5–19 ms and 0 mutations. (How often the builder
  asked for that repaint during play is not measured; `__aheadHold` already held most of it.)
- **Verified by journey: saves were taken at every pause.** A DS state is megabytes; each pause read it, gzipped it,
  turned it to base64 in a string loop and posted it, all on the page's one thread. Now at most one save a minute
  (`CSV_EVERY`), and leaving (the page hidden, the game ended) always saves at once. Base64 is the browser's own
  (`FileReader.readAsDataURL`) where it can be.
- **New: off the screen is paused.** An `IntersectionObserver` on `#nes-wrap` pauses a running game scrolled or slid
  out of view, so the core never runs for nobody.
- **Inferred, not changed: one thread.** EmulatorJS's threaded melonDS needs `crossOriginIsolated`, which GitHub
  Pages cannot give by headers. A coi-serviceworker in `sw.js` could add COOP/COEP to the page's responses, but
  `require-corp` (and on Safari even `credentialless`) blocks the app's cross-origin iframes (YouTube films, the map
  tiles, Drive), so it is not safe for the whole app and was not done.
- **Inferred: memory.** A DS file can be hundreds of MB; EmulatorJS copies it into its own file system, so a big
  game on a phone can still be killed by the browser for memory. Nothing here can lower that but a smaller file.
- **No frame skip or internal resolution to lower:** the wasm melonDS draws with its software renderer at native
  256x192, and EmulatorJS 4.2.3 offers no frame-skip option we could verify.

## Checks

`console DS (478)` in js/check-flow.js: the body says nds, the picture is two 256x192 screens and the gap, the
hinge is there, the pad shows on keys with exactly D-pad/A/B/X/Y/L/R/Start/Select, each pad button reaches its
RetroPad number and lets go, `consoleStill_` mutates nothing while playing, four pauses inside a minute take one
save, a pause a minute later takes another and a forced (leaving) pause always does. Mutating out the repaint guard
and the minute fails it. `console keys` now expects the key list hidden until the Keys tile.
