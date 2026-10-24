# 407 — Library updates through the owner's Drive

**Asked for as** an import route for the library's private half that a Claude session can feed. Since 397 the words,
answers, content-card words/points/formulas and practical methods live only in the Ledger. A session cannot reach Apps
Script and holds no admin token, so `node tools/lib-private.js push` is out of its reach — but it can create files in the
owner's Google Drive through a Drive connector. The first use: the five drawn-matching rows of 402
(`Q-CBM-2d-shapes-3`, `Q-CBM-roman-numerals-10`, `Q-CBM-nets-2`, `Q-CBM-parts-of-the-circle-5`, `Q-STA-KS2-2024-P3-1`),
whose new `draw_answer` and removed `cells` were converted on a session's machine and never reached the Ledger.

### The flow

1. **Claude prepares**: `node tools/lib-private.js drive-pack <out.json|dir/> [--ids a,b] [--private <dir>] [--note "…"]`.
   Without `--ids`, every item of `data-private/` that differs from the Ledger *as this machine knows it* — the pinned
   commit (`LIB_SOURCE_COMMIT`) with `.pushed.json` on top (`pull` now records what it fetched there too, so after a pull
   the base is the Ledger itself). Each item goes whole, with `null` for a field the base had and this copy has not, so
   merging it is replacing it. An id the base has not got carries its public card in `cards`. It refuses to write inside
   the repository (public) other than under `data-private/`.
2. **Uploads** it to the Drive folder **`family-library-imports`**, named `lib-import-<timestamp>.json`
   (`/^lib-import-[A-Za-z0-9._:-]{1,80}\.json$/`). The backend makes the folder the first time Business is opened.
3. **The owner taps** *Import library updates (N)* on the **Library updates** card in Business (it glows through
   `bizNeed_` while files wait), or opens `?run=libImportDrive&name=…&pin=…`.

### The file

```json
{ "version": 1, "note": "why", "files": { "questions": [{ "id": "Q-…", "draw_answer": "…", "cells": null }],
  "textbooks": [], "practicals": [], "projects": [] }, "cards": { "practicals": [{ "practical_id": "P-NEW", "…": "…" }] } }
```

Per id: a field given replaces that field, `null` deletes it, a field left out is kept; an id the tab has not got is
added at the foot. Only `LIB_FILES` private fields, only text or numbers (as `libImport`). An id must already be a row of
the tab, or a card in the site's file (`SITE_URL` + the file, then GitHub's raw main), or listed in the file's `cards` —
new public cards still come by git; `cards` only vouches that an id the site has not got yet is meant.

### The backend — `libImportList`, `libImportDrive` (both `admin`)

- Only a folder and files **owned by the script's own account** are read (`libDriveMine_`): a stranger sharing a folder of
  the same name, or dropping a file into ours, is ignored — an import overwrites private content.
- Under the script lock; files oldest name first; a press stops starting files after four minutes and says how many are left.
- **Each file whole or not at all**: everything is planned (shape, fields, ids, sizes) before a cell is touched; then the
  rows are written with the copy's own code (`libRowOut_`: `~` cells, cut at 40,000 characters into up to six) and read
  back with its check (the id, the stored checksum, the checksum of what the cells hold). Any row that does not read back
  puts every row that file wrote back to its previous cells (a new row blanked) and the file stays in the folder.
- A file that went in moves to `family-library-imports/imported`, gets a `lib_log` line (`person_id` `library-import` —
  never a person, so the day's cap never reads it — the admin's handle, the counts and the note), and the press bumps the
  library generation, so no cached item or index outlives it. The last press's report is kept (`LIB_IMPORT_LAST`) and
  shown on the card, a line a file. A Google Doc made of an upload is exported as plain text rather than refused.
- No nightly trigger: manual only (the tile and the `?run=` URL).

### Checks

`js/check-library-ledger.js` section 7, over the real `doPost` with a fake Drive (folders and files with owners) and the
in-memory Ledger: a student refused both; the first list makes the folder; only our own `lib-import-*` file is listed (a
stranger's folder of the same name, a stranger's file in ours and `notes.txt` ignored); one file replaces a question's
html, deletes its answer and keeps its accept, adds an id the site's file has, merges a content card's words, adds a
practical vouched for by `cards`; moved to `imported`; `libItems` serves the new words past its cache; a `lib_log` line
under the admin's handle; an unknown id or a public field refuses the whole file untouched; a cell spoilt between write
and read-back puts every row back (the new one too) and leaves the file; the same file then imports clean by
`?run=libImportDrive`. Proved by mutation: no put-back, no generation bump, no owner check, `libImportDrive` opened to
`self`, the read-back checksum off, `null` not deleting — each fails it.

`check-flow`'s Business journey: thirteen pages now; with two files waiting the Library updates card glows "2 files
wait" and its tile is a live *Import library updates (2)*; the press posts `libImportDrive` as the admin, and the card
stops glowing, counts 0 and says what each file did; `libImportList` asked once. Proved by mutation (the glow removed).

### Deploying

`backend/*.gs` (merge, GitHub Assistant ↓, Deploy → New version) and `js/records.js` (push). Drive scope is already in
`appsscript.json`. Stamps `2026-10-24-h-library-import` (all four); css unchanged.
