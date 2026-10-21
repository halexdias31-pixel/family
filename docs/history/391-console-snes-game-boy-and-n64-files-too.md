## 391 — the Console plays SNES, Game Boy / Color / Advance and N64 files too (2026-10-21)

**Asked for as** "Mario Kart": the same Console (389, 390) should also play the person's own SNES, Game
Boy, Game Boy Color, Game Boy Advance and N64 files. Still bring your own file: the repo holds no game
file, game name or artwork, and the "Use a game file you own" note stays.

**Engine.** jsnes keeps the NES. Everything else runs on **EmulatorJS 4.2.3** (`@emulatorjs/emulatorjs`,
GPL-3.0) with its libretro cores from npm, all at 4.2.3: `core-snes9x` (SNES), `core-gambatte` (Game Boy and Color;
mGBA refused the synthetic GB file with an FS error), `core-mgba` (Advance), `core-mupen64plus_next` (N64; `core-parallel_n64` on iPhone/iPad, as EmulatorJS itself picks there).
Loaded by `emuLib_` from jsdelivr with unpkg as the mirror, exact versions, and only when such a file is
played: seven `data/src/*.js` scripts (no loader.js, no emulator.css), then the one core `.data` (about
1-2 MB, a 7z EmulatorJS unpacks itself, cached in its own IndexedDB `EmulatorJS-core`).
Alternatives looked at: Nostalgist.js (MIT, nice API) takes its cores from a GitHub path, not npm; a
one-release npm core bundle was too new to trust.

**Licences.** EmulatorJS GPL-3.0; mupen64plus-next and parallel-n64 GPL-2.0; mGBA MPL-2.0, Gambatte GPL-2.0 — all fine to
load from a CDN, nothing is copied into the repo. **snes9x is under its own non-commercial licence**, not
GPL: free for personal, non-commercial use. The Console is a free page for signed-in family members, not
something sold, but if the site ever charges for it the SNES core should be revisited.

**How it is driven.** `new EmulatorJS('#emu-host', config)` inside `#nes-stage`, with `startOnLoad`, no
controls (`defaultControllers` all empty, so its own keyboard and gamepad mapping do nothing),
`noAutoFocus`, `disableLocalStorage`, and every piece of its UI hidden by CSS (`.emu-host`), so only its
canvas shows. The Console's tiles call `play(true)`/`pause(true)`; inputs go through
`gameManager.simulateInput` in RetroPad numbering (`EMU_IDX`), sticks as half-axes 16-23. The game is
handed over as bytes with a made-up name `game-<hash>-<size>.<ext>` (`emuName_`), never the file's own.
A screen redraw (draw-ahead repaints the Games column) moves EmulatorJS's box into the new stage.

**System detection** (`nesSys_`): bytes first — iNES; N64 in all three byte orders; GBA (fixed 0x96 at
0xB2, branch as the first word); Game Boy header checksum (0x143 bit 7 = Color); SNES LoROM/HiROM
checksum + complement (with or without a 512-byte copier header) — then the extension
(.sfc .smc .gb .gbc .gba .z64 .n64 .v64). The kind is kept with the bytes (`kind` key) so a SNES file with
a bad checksum still plays next time.

**Controls by position.** Controller (standard mapping): right face A, bottom B, top X, left Y on SNES and
N64 (on N64 that lands as A = bottom, B = left, the usual layout, because the core follows RetroPad);
two-button systems fold top/left onto A/B as before. LB/RB = L/R, LT/RT = L2/R2 (Z on N64), sticks
analogue (right stick = C buttons on N64), d-pad = d-pad; on N64 the left stick is not folded into the
d-pad. Keys: arrows, Z = B, X = A, A = Y, S = X, Q/W = L/R, E/R = L2/R2, I/J/K/L = right stick (C buttons),
Enter/Shift; on N64 arrows and the touch D-pad steer the stick. Touch pad per system (`nesPadHtml_`):
L/R on SNES and GBA, an X/Y/A/B diamond on SNES, and L/Z/R, A/B and four C buttons on N64.

**Kept on the device.** The file: `family-console` IndexedDB, one kept file (the last one, any system).
Battery saves: EmulatorJS writes the cartridge memory to its own IndexedDB (`/data/saves`, IDBFS) every
60 s and at every pause; named by the bytes' hash, so two games never share one. Forget file forgets the
game; its battery save stays. No save states (optional; not added). Nothing is uploaded.

**N64** shows one line, "older phones may stutter"; nothing is blocked.

**Checks.** check-secrets' no-game-file rule now also fails on .sfc .smc .fig .swc .gb .gbc .sgb .gba .agb
.z64 .n64 .v64 by name and on the N64 and GBA header magic. Smoke test (Playwright, Chromium 390×844,
synthetic files with no game in them: a SNES LoROM that turns the backdrop red, writes SRAM and loops; GB
and GBC headers with valid checksums and a `jr` loop; a GBA header with a `b .` loop; an N64 header with a
loop where boot code would be; the 389 NES file). The CDNs are blocked in this container, so the test
serves the CDN URLs from the npm tarballs of the same pinned versions — the same files jsdelivr/unpkg
serve. Results: NES, SNES, GB, GBC and GBA each started, ran ~30 frames per 0.5 s, and showed none of
EmulatorJS's own UI; the SNES picture was the red backdrop, in place and in full screen (390x341); Pause
held the frame count, Play resumed; a stubbed pad by position sent A/X/L/R2, stick and right stick, key A
sent Y; SNES SRAM came back as 0x42 under /data/saves; the kept GBA file played after a reload; Forget
removed it and the engine. N64: the mupen64plus-next core downloaded, unpacked and started, then the
synthetic file (no real boot code, so no video interrupt) froze the tab — expected for a fake cartridge,
not shown with a real one; a real N64 file is the owner's to try. Console noise seen only in the test:
"Failed to fetch" is EmulatorJS's update check, which it runs on localhost only; an ErrnoError when
switching system is the old instance's exit unmounting its save folder. A real CDN load from a phone is
left for the owner.
