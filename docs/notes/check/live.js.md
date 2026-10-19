# check/live.js

The full text of comments in `check/live.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/live.js THE REAL BACKEND, RUN AGAINST THE REAL DATABASE, HERE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/live.js

   THE REAL BACKEND, RUN AGAINST THE REAL DATABASE, HERE.

   WHY THIS EXISTS. Every check in this repo measures the app against `check/fixture.json` — four
   question rows, fifteen people, a handful of venues, all hand-written. That is the right thing for
   most of them: a fixture is stable, and a check that changes its answer when somebody edits a
   spreadsheet is a check nobody can act on.

   BUT IT MEANS NOTHING HAS EVER SEEN THE ACTUAL DATA. Three faults in one week came from exactly
   that gap, and no fixture would have caught any of them, because the fixture was written from the
   same belief as the code:

     `SCHEMA.landmarks` named seven columns the sheet has never had, so every building came through
     with width 0, depth 0 and no colour;
     `allTopics()` hardcoded `link: ''` with a comment explaining no PDF existed, while 328 rows
     carried one;
     past papers were drawn twice — once as a paper and once per question — which nobody could see
     until the fixture had a paper WITH questions in it.

   THIS IS NOT A SECOND IMPLEMENTATION. It loads the `.gs` files themselves and calls the real
   `doGet`. The only things replaced are the eight Apps Script globals the payload build touches,
   and `SpreadsheetApp` is backed by a dump of the real spreadsheets. If `doget.gs` is wrong about a
   column, this is wrong in exactly the same way — which is the point.

   ---------------------------------------------------------------------------------------------
   THE DUMP IS NEVER COMMITTED, and this is not a style preference. `Ledger` holds people's PINs,
   e-mail addresses, phone numbers and dates of birth, and this repository is PUBLIC. The dump path
   is in `.gitignore` and this file refuses to write one into the working tree.

   To make one, export the two spreadsheets and flatten them to:

     { "ledger": { "<tab>": [[row], [row], …] }, "settings": { … } }

   IT WAS THREE. `Library` held the questions, the cheat sheet components, the boxers and the
   bouts; all four are files in `data/` now and no backend code opens that spreadsheet, so a dump
   of it would be three keys this cannot use. A dump made before that change still works — an
   extra key is ignored.

   first row = headers, every cell a string, number or boolean. Then:

     node check/live.js --sheets /path/to/sheets.json --out /tmp/payload.json

   ---------------------------------------------------------------------------------------------
   WHAT IT CANNOT DO. It builds the payload; it does not prove the deployed version serves it. A
   push is not a deploy — see CLAUDE.md — and nothing here can see which version `/exec` is running.
   Every Google host is blocked from this environment by the network policy, so the deployed answer
   has to come from somebody opening the URL.
================================================================================================== */
```

### ---------- THE SHEET, AS APPS SCRIPT SEES IT

top level, before `sheetOf`

```
/* ---------- THE SHEET, AS APPS SCRIPT SEES IT ----------------------------------------------------
   `read()` in core.gs uses getLastRow, getLastColumn, getRange().getValues() and getSheetByName, and
   `setCell` uses getRange().setValue(). That is the whole surface, so that is the whole stub. A
   write lands in the dump in memory and is thrown away with the process — this reads the database,
   it does not edit it. */
```

### The ids in constants.gs, mapped back to the keys in the dump.

top level, before `constants`

```
/* The ids in constants.gs, mapped back to the keys in the dump. Read out of the source rather than
   typed here, so renaming a file in `FILES` cannot silently point this at nothing — and so that
   removing one, as `Library` was, fails here loudly rather than resolving to a file that is not in
   the dump. */
```

### `boxers`, `fights`, `cheatsheet` and `questions` are deliberately NOT in this list.

top level, before `k`

```
/* `boxers`, `fights`, `cheatsheet` and `questions` are deliberately NOT in this list. The payload
   still carries those keys as empty arrays — see the note in doget.gs — and printing `boxers: 0`
   here would say "the boxers are empty" about 103 rows that are simply somewhere else. That is the
   fault this repository records five times over: I did not look, reported as I looked and there was
   nothing there. js/check-library.js is what counts those files. */
```

