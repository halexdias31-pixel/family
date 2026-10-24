## 399 — the Console plays DS files too (2026-10-24)

**Asked for as** "DS games in the Console": same rules as 389 and 391 — bring your own file; the repo holds no
game file, game name or artwork.

**Core.** EmulatorJS 4.2.3 already lists `nds: melonds, desmume, desmume2015`. Both `@emulatorjs/core-melonds`
and `@emulatorjs/core-desmume2015` exist at 4.2.3 (about 1.2 MB and 1.0 MB packed). **melonDS** is used
(`EMU_CORE.nds`): with no BIOS or firmware in its system folder it logs "Missing bios/firmware … Using FreeBIOS",
generates a default firmware and boots the cartridge directly. Nothing is asked of the person and no BIOS is
fetched. desmume2015 was the fallback had melonDS needed a BIOS; it was not needed. Loaded like the others
(`emuLib_`): jsdelivr, unpkg as the mirror, exact version, only when a DS file is played.

**Licences.** melonDS is GPL-3.0 (FreeBIOS is built into the core build; nothing of it is in the repo); EmulatorJS
GPL-3.0. Loaded from a CDN, nothing copied into the repo. (desmume, not used, is GPL-2.0.)

**Detection** (`nesDs_`): the logo checksum 0xCF56 at 0x15C *and* the header's own CRC-16 (MODBUS, init 0xFFFF,
over 0x000-0x15D) at 0x15E; then the `.nds` extension. Checked before every other system.

**Screens.** The core's default layout is top above bottom, one 256x384 picture, so `NES_DIMS.nds` is
[256, 384] and the stage, the full-screen fit and the pad all follow from that. The touch pad sits below the
stage in the flow (portrait full screen subtracts its height, as before), so it never covers the bottom
screen; in landscape full screen the pad's d-pad and buttons sit at the sides of the tall picture. Side by
side in landscape was optional and is not done.

**Touch.** The core reads the mouse on its canvas (`supportsMouse`), so a mouse already works. A finger did
not (the test held a touch on the bottom screen and the game saw no pen): `emuTouch_` passes the first finger
on the canvas on as mousedown/move/up at the same point, and stops the page scrolling under it.
EmulatorJS turns on pointer lock for mouse cores, which would capture the cursor at the first click; it is
turned off at start (`enableMouseLock = false`) for every system.

**Controls by position**, as 391: DS is a four-button system (`NES_FOUR`), right A, bottom B, top X, left Y,
LB/RB = L/R, Start/Select; keys as before (Z B, X A, A Y, S X, Q/W L/R, Enter/Shift). Touch pad: L/R and the
X/Y/A/B diamond, as SNES. The microphone is not mapped.

**Big files.** A DS file can be 256 MB. The picked file goes to IndexedDB without a second copy first
(`put` copies as it is called). A failed keep that was the quota (`QuotaExceededError`, remembered as
`NES_.fullDb` by `nesDb_`) says "This device hasn't room to keep the file — pick it each time.", clears the
kept slot so an older game is not left behind, and the game plays from the picked file anyway. Battery
saves are EmulatorJS's, as 391 (`/data/saves/melonDS/game-<hash>-<size>.sav`).

**Checks.** check-secrets fails on `.nds .srl .dsi` by name and on the DS header (logo checksum + valid
header CRC). Proved by mutation: a synthetic DS file copied in as `js/zz-mut.bin` → "has a DS cartridge
header", exit 1; empty `zz.nds`, `zz.srl`, `zz.dsi` → "by name", exit 1; removed → green.

**Smoke test** (Playwright, headless Chromium with SwiftShader, CDN URLs served from the npm tarballs of the
same pinned versions, as 391). The test cartridge is synthetic, made by a script outside the repo: a header
with a valid CRC and no logo image, ARM9 code that turns the top screen red, or green while KEYXY says the pen
is down, and ARM7 code that copies KEYXY to main RAM. At 390x844 (touch) and 1280x800 (mouse): melonDS
fetched, started with FreeBIOS, top screen red; a finger (390) or mouse (1280) held on the bottom screen turned
it green and lifting turned it red; no pointer lock; key A held Y; a stubbed pad's top button gave X; Lock,
Full screen (both screens fit, pad below), Pause and Play worked; the file was kept; with `put` stubbed to
throw `QuotaExceededError` the message showed, nothing was kept and the game still started. Page errors seen
only in the test: "Failed to fetch" (EmulatorJS's update check, localhost only) and "Wake Lock permission
request denied" (headless). A real DS game on a real phone is the owner's to try.
