## 419 — the Console: why a DS game lags on a laptop, steadier controls, and keys (2026-10-24)

**Asked for as** three things: New Super Mario Bros (a DS file) lags on a laptop; the on-screen controls jump
and should feel fixed; on a laptop the keyboard should work properly (arrows and WASD, a sensible mapping per
system, a key list, no page scrolling) and the touch pad should get out of the way.

### Why it lags — what was found

1. **The DS core itself, on one thread.** melonDS emulates two ARM CPUs and draws the DS's 3D in software, in
   WebAssembly with no JIT, on the page's one thread, sixty times a second. NSMB draws Mario and the levels in
   3D. This is most of the cost and the site cannot make it smaller.
2. **No threads on GitHub Pages.** WebAssembly threads need `SharedArrayBuffer`, which needs a cross-origin
   isolated page (COOP/COEP headers). GitHub Pages sends no such headers, so `crossOriginIsolated` is false and
   EmulatorJS loads the non-threaded build (`melonds-wasm.data`). Unpacked and read: the non-threaded build has no
   `melonds_threaded_renderer` option and no OpenGL renderer; the threaded build has the threaded renderer (3D on
   a second thread). The options the running core reports (asked of it in the test) are console mode, boot
   directly, firmware settings, language, MAC, DSi SD card, mic, audio bitrate, audio interpolation (already
   `None`), touch mode, screen swap/layout/gap, hybrid screen — nothing that trades accuracy for speed, and no
   frameskip. RetroArch has no frameskip for it either.
   *Not done:* a service worker that fakes isolation (coi-serviceworker) would let the threaded build run, but
   COEP across the whole site breaks YouTube embeds, Google sign-in's popup and cross-origin images. The
   code now asks (`emuThreads_`): should the page ever be isolated, the threaded build and the threaded renderer
   are taken by themselves.
3. **The rest of the app kept working underneath.** While a game played: the draw-ahead builder kept painting
   whole columns in idle time (a paint is tens of milliseconds on a slow laptop — one dropped game frame each);
   other widgets whose cards were on the glass kept their loops; looping CSS animations (the loading dots, the
   caret) kept running in parked columns; **EmulatorJS's own controller poll ran every 10 ms** (`GamepadHandler`,
   a `setTimeout` loop) although its controls are switched off and the Console polls once a frame; and a
   **blocking `touchmove`/`wheel` listener sat on the document all the time**, so every scroll anywhere in the app
   waited for the page's thread.
4. **Sound.** RetroArch's 64 ms of audio buffer runs dry at the first slow frame of a DS game, which is heard as
   crackle and felt as stutter.
5. **Frame pacing.** RetroArch runs its loop on `requestAnimationFrame` with vsync on, so a frame that takes a
   little longer than one refresh waits for the next one: a laptop that could do 45 frames' work a second shows
   30. Left as it is — turning vsync off removes the limiter, and on a fast machine games would run too fast;
   it could not be measured here.
6. **The canvas.** RetroArch sizes its canvas to device pixels (a `ResizeObserver` on
   `devicePixelContentBoxSize`, read in the core's glue). Drawing it at fewer pixels and scaling it up would
   break the DS pen, whose position RetroArch reads against that size, so the canvas is left at device pixels;
   the stage is now never taller than the screen (below), which is what keeps it from being bigger than needed.

### What changed

- **The app holds still while a game plays** (`nesRun_` → `nesQuiet_`, games.js): the builder is held
  (`window.__aheadHold`, taken and given back only by the Console), every other widget is stopped and none is
  started (`widgetsLater_` waits, arcade.js), and `body.nes-on` pauses every looping animation outside the
  console. Pause gives it all back (the builder kicked, the column's widgets woken).
- **EmulatorJS's 10 ms poll is gone** and DS/N64 get 128 ms of sound (`emuQuiet_`, patching
  `GamepadHandler.prototype.loop` and `EJS_GameManager.prototype.getRetroArchCfg` once the scripts load).
- **The document's blocking listener only exists while the console is locked or full screen** (`nesHoldPage_`).
- **The DS line** says plainly that DS games need a fast device (`NES_SLOW`).

**Steadier controls.**

- The console card is no longer drawn smaller to fit its pane (`paneReach_`, find.js, beside the tapped-options
  rule): it was zoomed down to 0.7, its pad keys fell to 31px, and every line it showed or hid re-zoomed the whole
  console under a thumb. It scrolls instead (Lock still holds it).
- The touch pad shows from the first paint on a touch device, not when the game starts, at a fixed height per
  system (`--nes-pad-h`, every system in the same three rows so the widest fits a phone's card at 44px keys);
  a held key is lit by colour, never by size.
- The stage is never taller than the screen less the room for the pad or key list (`--nes-room`, `--nes-ar`),
  so a tall DS picture fits a laptop's screen. A kept file sets its system's shape when the console is drawn,
  so Play changes nothing.
- The tile row is always five: Forget greyed with nothing kept; Lock on touch, Keys on keys.
- Each finger is its own entry, captured by the pad: two held buttons stay held while a third comes and goes,
  and a finger slid from one face button to another presses the new one. No selection, magnifier or
  double-tap zoom under a thumb (`touchstart` refused on the pad, `touch-action`, tap highlight off).

**Keys** (`NES_KEYMAP`, by `e.code` so WASD is where WASD is on any layout; by letter when a browser sends no
code):

| | Move | B | A | Y | X | L / R | Start | Select |
|---|---|---|---|---|---|---|---|---|
| NES, GB, GBC | arrows, WASD | Z, K | X, L, Space | | | | Enter | Shift |
| GBA | arrows, WASD | Z, K | X, L, Space | | | Q / E | Enter | Shift |
| SNES, DS | arrows, WASD | Z, K | X, L, Space | C, J | V, I | Q / E | Enter | Shift |

N64: stick on arrows/WASD, A on X/Space, B on Z, Z trigger on C/Shift, L/R on Q/E, C buttons on I/J/K/L, Start
on Enter. A key with Ctrl, Alt or Cmd is left to the browser; Z let go while K still holds B leaves B held; a
window switch lets go of everything. While a game plays the arrows and Space never scroll the page.

**Touch or keys** (`nesMode_`): a coarse pointer starts on the touch pad, a fine one on keys; a key while
playing swaps the pad for the key list, a finger on the console swaps it back. The key list (`#nes-legend`) sits
under the picture, gold keys on black; the Keys tile hides and shows it, kept on the device (`nes-keys`).

### Checks

- `node js/check.js` green.
- A check-flow journey, "console keys…" (`FLOW_ONLY='console keys'`): the map for every system, the key list's
  words, keys taken only while playing, arrows/Space not left to scroll, Ctrl+W left alone, two keys on one
  button, the Keys tile and its memory, the builder held and other widgets stopped while playing and given back
  at Pause, a finger bringing the pad back with Lock in Keys' place. Proved by mutation (W mapped to down, the
  builder not held → six failures; restored → green). check-flow runs `inApp` for it: an expression read in the
  app's own scope, where its `const`s are.
- Playwright smoke test (headless Chromium, SwiftShader, the CDN served from the npm tarballs of the pinned
  versions, the synthetic DS cartridge from 399), at 390x844 touch and 1280x800 mouse: see the results below.

**Results.** At 390x844 (touch): the pad shows before a game; picking the DS file reshapes the stage once and
the core's start then moves nothing (stage, pad and tiles to the pixel); while playing the builder is held,
`body.nes-on` is set, EmulatorJS's poll is off and only the console runs; D-pad right and A held together, a
third finger adds B, lifting it leaves right and A held and lit; nothing scrolls; a key swaps the pad for the
key list; Pause gives the app back; full screen fits both screens. At 1280x800 (mouse): the key list instead of
the pad; every key of the NES/SNES/DS map holds its button and lets go; arrows and Space do not scroll; Z/K both
on B; the Keys tile hides and shows the list; the whole console, tiles included, is on the screen (stage
265x397, tiles ending at 763px). The canvas measured at the stage's size at device pixel ratio 1. No page
errors besides the two known test-only ones (399). Speed on a real laptop with a real DS game could not be
measured here: headless SwiftShader on an overloaded machine says nothing about it, and that is the owner's to
try.
