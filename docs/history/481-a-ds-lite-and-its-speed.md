# 481 — A DS Lite, and its speed

Owner, with a screenshot of the live Console playing a DS game: "this just does not look like a ds. also the game
still unstable and lags and slows on my chromebook".

## What the screenshot showed

Still 478's one tall white slab: both screens stacked in one shell with a thin line between, the key list
(`#nes-legend`) shown inside it, and the D-pad and A/B/X/Y far below the touch screen.

**Why the key list showed:** 478 made it hidden by default, but kept the Keys tile's choice in `localStorage`
(`nes-keys`). A "show" saved on that device before 478 still read as "show". The choice is no longer kept: the
key is deleted at load and the list shows only when the Keys tile asks, for that visit. Its markup also starts
`hidden`, so it never shows for a moment before the first paint.

## The look (style.css, "A DS LITE (481)")

- Two halves of one width, each a rounded slab (`.ds-lid`, `.ds-base`), joined by a hinge barrel (`.ds-hinge`)
  that is shorter than the halves, so the gap shows at both ends. Top half: the top screen in its glass with a
  speaker grille either side. Bottom half: the touch screen, the D-pad to its LEFT, A/B/X/Y in a diamond to its
  RIGHT at the screen's height, Select and Start under the diamond, a power slider on the right edge, L and R
  on the base's top corners. No logos.
- Proportions from a DS Lite: each half is 100 x ~54 (the real one is 133 x 74 mm), the screens 52% of the
  width. melonDS's gap between its screens went from 32 rows to 90 (`NES_GAP`), which is the real spacing: the
  lid's lower edge, the hinge and the base's upper edge are drawn over exactly those black rows (`.ds-cover-a`,
  `.ds-cover-b`, `.ds-hinge`), so no game pixel is covered and the pen still lands where it is put (437).
- Every size is a share of the body's width (`cqw`), so a 244-330px card shows the same DS smaller instead of
  moving the buttons under the screen. Each button has an unseen ring that makes it at least 44px to hit.
- The other systems are untouched.

## Speed — what is verified and what is inferred

A public-domain DS test program (a CPU test homebrew, 2D, no 3D) was run in Playwright Chromium against
EmulatorJS 4.2.3 from jsdelivr (reachable this time, as is cdn.emulatorjs.org), with the CPU throttled.
Emulated frames per second, 8 s each:

| core | 1x | 4x | 6x | 6x, threads (COOP + COEP credentialless) |
|---|---|---|---|---|
| melonds | 57-58 | 15.2 | 10.4 | 10.7 |
| desmume2015 | 57 | 14.1-15.1 | 10.3 | 9.5 |
| desmume | - | 15.3 | 10.3 | - |

desmume2015 with `desmume_frameskip` 1 or 2 at 4x: 15.1 / 14.7 — no gain. Gap 90 runs at the same speed as 32.

- **Verified: no core is faster on this program, so melonDS stays.** desmume2015's reputation is for 3D games,
  whose renderer this test does not use; with no 3D game to hand, switching away from the more accurate core,
  whose gap and touch handling are already tuned, is not justified. Inferred: a 3D game may differ.
- **Verified: threads gave nothing here,** and are not enabled. Inferred, and the reason not to try harder:
  `Cross-Origin-Embedder-Policy: credentialless` still blocks cross-origin iframes that do not send COEP
  themselves (YouTube films, maps, Drive) unless each one is made `credentialless`, which logs it out; Safari
  has no `credentialless` at all. A service-worker COOP/COEP would cost the app those embeds for no measured gain.
- **Verified: the emulator itself is the cost.** At 4x it fills about 750-850 ms of every second of the main
  thread on its own. Our page's share, measured in the real app at 1280px with 4x throttle and a 60fps canvas
  loop in the console while "playing": 58.5 fps, 0.17 long tasks a second, 0 DOM mutations, 0 running animations.
- **Changed: EmulatorJS's own extras pinned off** (`EMU_LEAN`): rewind and shaders (already its defaults, now
  written down), and its five-minute "system save" timer, which wrote the battery save mid-game; the Console
  already saves at a pause and on leaving (478's once-a-minute limit is still in force, `CSV_EVERY`).
- **Changed: no blur on neighbouring cards while a game plays** (`body.nes-on .page.soft > .pane`). Inferred
  benefit only; nothing blurred sits behind the console itself.
- **Inferred: what is left is the Chromebook's CPU.** A DS core in wasm on one thread needs a fast core; closing
  other tabs is what the console's own note already says.

## Checks

`console DS (478, 481)` in js/check-flow.js now also asks for the lid, base, hinge, both covers and two grilles,
the D-pad's centre left of the touch screen and the diamond's left edge right of it (read from style.css), both
at the touch screen's height, the base below lid and hinge, the 44px ring, and that no key-list choice is kept.
`console keys` expects the choice not kept. Moving the diamond onto the screen fails it.
