## Console: an NES player, and the game file is the person's own

**Asked for as** an NES console player in the games area for signed-in people. The site ships only the
emulator engine — never a game file, a game's name, logo or artwork. Play asks for a `.nes` file from
the person's own device and runs it, on a PC, an iPad or a phone, with keys, touch or a controller.

**What it is:** the `console` widget (js/map.js, kind `game`), drawn by `nesPaint_` at the foot of
js/games.js. Signed out it says *Sign in to use the console.* and fetches nothing.

- **Engine** — jsnes 2.1.0 (Apache-2.0), loaded by `nesLib_` from jsdelivr with unpkg as the mirror,
  exact version pinned, and only when Play or Choose file is pressed. `jsnes.NES` core only; the app
  draws, times and reads input itself, so pausing is ours.
- **Screen** — a 256x240 canvas scaled with `image-rendering: pixelated`. The loop is rAF with an
  accumulator at 60.0988 Hz, so a 120 Hz screen does not run the game double speed.
- **Sound** — an `AudioContext` made inside the tap (`nesAudio_`, iOS refuses one made later) feeding a
  ring buffer through a ScriptProcessor; the engine runs at the context's sample rate.
- **File** — `<input type=file>` accepting `.nes` and anything (iOS Files often does not type one).
  `nesValid_` wants `NES` + 0x1A and one 16 KB bank, else a plain sentence. The bytes are kept in this
  device's IndexedDB (`family-console`, key `last`) so next time Play starts without picking; *Forget
  file* deletes it. Nothing is uploaded or sent to the backend.
- **Controls** — keys (arrows, Z = B, X = A, Enter = Start, Shift = Select) only while a game runs,
  caught before the column's own arrow keys; a touch D-pad, A, B, Start and Select on touch screens,
  hidden while a controller is connected; the Gamepad API polled each frame with the standard mapping
  (Chrome Android, Safari iOS/iPadOS): button 0 = A, 2 = B, 9 = Start, 8 = Select, 12-15 and the left
  stick for the D-pad. Every source is OR-ed and only changes reach the engine (`nesSync_`).
- **Pausing** — the widget's `stop` (the column slides away) and a hidden tab pause; Play carries on.
- **Full screen** — the Fullscreen API where there is one; on iPhone, which has none for a page, the
  `.nes-full` class fills the window, with an × to leave. In landscape the pad lies over the picture.

**Tiles, not buttons** for Play/Pause, Choose file, Forget file and Full screen; the pad's keys are
the console's own keys, like the keypad's. A `pause` mark was added to `TILE_ICONS`.

**Checks:** `check-secrets.js` now also fails on any file named `.nes`/`.fds`/`.unf`/`.unif` or starting
with the iNES header. The widget is on check-widgets' roster (not `pure`: it draws differently signed
in and out). A smoke test with a synthetic iNES file (header, 16 KB PRG of `JMP $8000` with all three
vectors at $8000, 8 KB blank CHR) ran ~80 frames in 1.5 s, held A on X, kept and forgot the file, and
paused on Pause and on sliding away.

**The `*/*` in `accept`** is written `*&#47;*`: check-doors and check-dead strip comments with a regex,
and a literal `*/*` opened one that swallowed the rest of games.js.

## 390 — full screen, a padlock, and controllers that work (2026-10-21)

The owner (iPhone Safari + an Xbox pad over Bluetooth; wants any device × any pad): "Full screen feature isn't
really working", "needs a padlock tile to keep it in the same place", "controller doesn't seem to work".

Root causes:
- **Controller:** pads were polled only inside the game loop, so nothing read them before Play, and the
  "controller connected" state never appeared. Safari exposes a pad only after a button press while the page
  is focused and fires no reliable `gamepadconnected`. A controller's Start could not begin play. The mapping
  read A from button 0 and B from button 2, so an Xbox pad's B (1) did nothing.
- **Full screen:** the fallback `position: fixed` sat inside a sliding column; a transformed ancestor pins
  `fixed` to itself, so the "full" player filled the column, not the window. The stage rules shared a
  selector list with `:fullscreen`, which an older Safari drops whole. No `webkitfullscreenchange` handling.

Fix (games.js, end): `nesPadWatch_` polls `navigator.getGamepads()` every frame while the console widget is
started (draw-ahead runs nothing — check-widgets); the game loop polls while playing. Nintendo positions:
right face (1, and 3) = NES A, bottom face (0, and 2) = NES B, 9/8 Start/Select (7/6 too on non-standard),
d-pad 12–15, left stick (deadzone 0.25 for drift; 0.5 to count), and a hat on axis 9 for non-standard pads. Start with a kept game begins play; the first press of any button wakes the audio. Keyboard, touch and pad are OR'd in `nesSync_`, so none overwrites another.
"Controller connected" shows and the touch pad hides. Full screen moves `#nes-wrap` to `<body>` (put back
on exit), tries `requestFullscreen`/`webkitRequestFullscreen` on the wrapper, and otherwise stays the fixed
full-window mode (iPhone). Black, canvas sized by `nesFit_` (whole-number scale when it fills 90%, else fit;
256:240), recomputed on resize/rotate/fullscreenchange; × or Escape exits. The Lock tile sets `SWIPE.lock`,
which `axisFree` (overworld.js: swipes and wheel) and the arrow-key turn (shell.js) honour, and stops
touchmove/wheel on the console; full screen locks too. Tested with Playwright stubbing `getGamepads`
(standard and non-standard with a hat), full screen at 390×844, 844×390 and 1280×800 including rotation.
