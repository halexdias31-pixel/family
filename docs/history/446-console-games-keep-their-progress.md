# 446 — Console games keep their progress

**Asked (owner):** "when a user plays a game and they're logged in, it will save their progress. I want that to
also be happening with the Mario games or any of the emulators."

## What changed

- **Per game file, by a hash of its bytes** (`csvHash_`, js/games.js): SHA-256 (first 32 hex) where the
  browser has `crypto.subtle`, a 24-hex double FNV otherwise. The game file itself is never stored with a save
  nor sent anywhere; the file keeps living only in the Console's own IndexedDB (399), as before.
- **What is kept:** for EmulatorJS games (SNES, GB/GBC, GBA, N64, DS) the battery save (`gameManager.getSaveFile()`,
  the cartridge SRAM — Mario's save file) and a save state (`gameManager.getState()`, when `supportsStates()`);
  for NES (jsnes) `nes.toJSON()` as the state. Names checked against the pinned `@emulatorjs/emulatorjs@4.2.3`
  `GameManager.js`.
- **When:** at every pause (`emuPause_`, and `nesStop_` for a running NES game — which covers leaving the
  screen and the app going to the background, both of which pause) and when the game is ended (`emuEnd_`,
  read before EmulatorJS exits).
- **Where:** first on the device (IndexedDB `family-console-saves`, one record per hash, try/catch, any failure
  is "nothing kept"); then, signed in, on the account: `consoleSave` (doPost, `ACTION_ACCESS` `self`) with the
  two parts gzipped (`CompressionStream`) and base64'd. A save identical to the last one sent is not re-sent.
- **The backend** (`consoleSave_`/`consoleLoad_`, backend/content.gs) keeps ONE file per person and game,
  `cs-<person_id>-<hash>.json`, in the script account's Drive folder `family console saves` (id in the script
  property `CONSOLE_SAVES_FOLDER`, made on first save). Not the sheet, so no tab, TAB/SCHEMA/WHERE unchanged.
  The person is the token's row (the gate overwrites `personId`), so nobody reads or writes another's file.
  Only two base64 strings, a known system and a hex hash are accepted: no other upload rides along, which is
  why a child's account may use it (it is their own game progress). **Cap 2 MB packed per game**; over it the
  backend refuses with a reason (`why: 'too-big'`), and the phone checks first and does not send — the line
  says it is kept on this device only.
- **Restoring** (`csvBegin_`): when a game starts the device's and the account's saves are both read and the
  newer wins; the battery file is written where the core reads it (`FS.writeFile(getSaveFilePath())`,
  `loadSaveFiles()`), then the state is loaded — the game resumes where it was left (auto-resume).
- **UI:** one quiet line under the console, `#nes-kept`: "Saved 2 min ago to your account" / "on this device",
  or why it could not be. No pop-ups. No sixth tile: the row is five tiles always (419), so resume is automatic
  rather than a "Load my save" tile.

## Checks

- `js/check-console-saves.js` (in check-all): the real doPost over a fake Drive — signed in only, a child may,
  latest only, owner only whatever `personId` is posted, the 2 MB cap both sides of it, save data only.
- check-flow `console saves (446)`: a stand-in EmulatorJS with its own method names — a pause posts the packed
  save keyed by hash and not the file, a repeat is not re-sent, the same file again gets SRAM then state back,
  another file is another key, over 2 MB is not sent and the line says so.
