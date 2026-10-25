# 443 — The Ledger imports itself

**Asked:** the Drive import (407) waited for an admin to tap *Import library updates*. A session can leave
files in `family-library-imports` at any hour; they should go in without anybody.

## What changed

- `libImportHourly()` (backend/content.gs) is an hourly time-driven trigger handler. It calls the same
  `libImportDrive_` the tap calls, with `auto` set: every waiting file, oldest name first, per-field merge,
  checksums read back, a failed file left whole in the folder, a done file moved to `imported`, one
  `lib_log` line per file (handle `hourly`), the cache generation bumped when anything was written.
- **An empty folder writes nothing**: no folder is made (the auto path finds, never creates), no
  `imported` subfolder, no report, no log, no generation. A missing folder is the same as an empty one.
- **Booked by the admin-load setup (361)**: `setupOnAdminLoad_`'s ten-minute block calls
  `libImportKeepBooked_()`, which leaves exactly one `libImportHourly` trigger (none or several → all
  removed, one made). A failure is kept as `FAILED_library-import-hourly` and shown on the setup card.
- **Alongside a tap**: both run under the script lock, and the pending list is read inside it, so a file
  can be imported only once. The hourly run waits 5 s for the lock and gives way quietly when busy (next
  hour picks it up); a tap during an hourly run answers *Busy* and writes nothing; a tap after it finds
  the files already moved.
- The last automatic import that found files is kept in Script Property `LIB_IMPORT_AUTO`;
  `libImportList` sends it as `auto`, and the Business card's *Library updates* says when it ran and what
  each file did.
- **Split-up imports**: nothing new was needed — every `lib-import-<name>.json` is its own import, so a
  large update goes up as `lib-import-books-part-01-of-40.json` … (each `{version: 1, files, cards}` with
  the cards for its own items); name order is part order.
- Version stamps: `2026-10-25-auto-import`.

## Checks

`js/check-library-ledger.js` §8 (fake Drive): setup run three times books one trigger; an empty-folder
run changes no property, file, folder or log row; three parts import in order and move; a tap fired
mid-run is turned away as busy; a tap afterwards imports nothing; `libImportList.auto` reports 3; a held
lock makes the hourly run give way.
