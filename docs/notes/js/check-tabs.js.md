# js/check-tabs.js

The full text of comments in `js/check-tabs.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-tabs.js EVERY TAB THE BACKEND READS, AGAINST THE FILE IT SAYS THAT TAB IS IN.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-tabs.js

   EVERY TAB THE BACKEND READS, AGAINST THE FILE IT SAYS THAT TAB IS IN.

   WHY THIS EXISTS. `read(name)` resolves a tab through `sheetFor_`, which looks the name up in
   `WHERE` to decide which of the three spreadsheets to open. A name with no line in `WHERE` gets no
   file, finds no sheet, and comes back as `{ rows: [] }` — and every caller in the app treats an
   empty list as an empty list. Not an error. Not a warning. A funnel with no questions in it, a
   shop with nothing for sale, a library of no past papers, each looking exactly like a database
   somebody has not filled in yet.

   THAT IS NOT HYPOTHETICAL. It was two maps and a default: `ELSEWHERE` for tabs in the subjects
   file, `HERE` for tabs renamed in the main one, and anything in neither fell through to
   `SPREADSHEET_ID`. The default is what hid it — every name resolved to a real file, so a tab that
   was never routed and a tab that was routed correctly were the same shape of nothing. Five tabs
   the backend reads (`resources`, `herd`, `map`, `landmark_parts`, `post_votes`) did not exist in
   any file at all, and the only reason anybody found out was reading all four spreadsheets by hand.

   Splitting one database into three removed the default — there is no main file to fall back to —
   so the fault moves from silent to visible, and this is the thing that makes it visible BEFORE a
   deploy rather than after one.

   WHAT IT CHECKS, all of it read out of the source rather than assumed:

     1. Every tab in `TAB` has a line in `WHERE`.       A tab the app asks for and cannot reach.
     2. Every tab in `SCHEMA` has a line in `WHERE`.    `ensureSchema` would skip it forever.
     3. Every `WHERE` line names a file in `FILES`.     A typo'd file key is a blank id.
     4. Every file in `FILES` has an id that is a       Both ids were `.xlsx` uploads once, and
        plausible Drive id, not a URL and not blank.    `openById` cannot read a cell of one.
     5. Nothing in `WHERE` is unknown to `TAB`/`SCHEMA`. Routing for a tab nothing reads — harmless,
                                                        so it prints and does not fail.
     6. Every tab in `REQUIRED_TABS` is routed AND     doGet answers with an ERROR rather than a
        described. It is the fourth place that         payload when one is missing, so an
        names tabs and nothing was reading it.         unreachable name here is the whole site.

   WHAT IT CANNOT CHECK, and this matters: whether the tab is actually in that spreadsheet. That
   needs the file, and this runs in Node with no Drive. `checkTabs()` in the backend answers it from
   the other side, with the documents open. The two together cover it; neither does alone.

     node js/check-tabs.js
================================================================================================== */
```

### THE CONSTANTS FILE, WHEREVER IT IS.

top level, before `dir`

```
/* THE CONSTANTS FILE, WHEREVER IT IS. Three checks each hand-rolled this and all three looked
   beside `js/` rather than in `backend/` — see CLAUDE.md. Directories in order of what is true
   today, then the spellings, because `constants.gs` is one name to a person and another to a
   filesystem. */
```

### ---------- READING A TOP-LEVEL OBJECT OUT OF THE SOURCE

top level, before `objectAfter_`

```
/* ---------- READING A TOP-LEVEL OBJECT OUT OF THE SOURCE -------------------------------------------
   Brace-counting rather than a regex, because every one of these objects has comments in it with
   braces and apostrophes in the prose. Comments are stripped from the SLICE, not from the whole
   file, so a `/*` inside a string elsewhere cannot shift the boundaries of this one. */
```

### A WORD BOUNDARY, because `indexOf` matches a PREFIX.

in `objectAfter_`

```
/* A WORD BOUNDARY, because `indexOf` matches a PREFIX. `const REQUIRED_TABS` is inside
     `const REQUIRED_TABS_RENAMED`, so a rename that should have failed this check silently
     handed it the renamed object instead — the same substring trap that has bitten this repo
     wherever one name contains another. */
```

### 4 — THE FAULT THAT COST THE MOST.

top level, before `DOGET`

```
/* 4 — THE FAULT THAT COST THE MOST. Both ids pointed at .xlsx uploads for months; every section
   loaded empty, which is what a blank database looks like. Nothing here can tell an upload from a
   Sheet — that needs Drive — but it can catch the shapes that are certainly wrong: a blank id, a
   whole URL pasted in, and the `file/d` spelling that IS the upload, which is the one case where
   the id itself gives the fault away. */
```

### 5 — routing for a tab nothing reads.

top level, before `DOGET`

```
/* 5 — routing for a tab nothing reads. Harmless: it is a line that does nothing, not a feature that
   does nothing. Same argument as "sent and never read" in check-payload.js — it prints, it does not
   fail, because a report that fails on things that are fine is a report nobody reads. */
```

### 6 — THE FOURTH PLACE THAT NAMES TABS, and the one that was checked by nothing.

top level, before `DOGET`

```
/* 6 — THE FOURTH PLACE THAT NAMES TABS, and the one that was checked by nothing.

   `doGet` holds `REQUIRED_TABS`: the tabs whose absence it treats as "the database is not
   connected", and it answers with an ERROR INSTEAD OF A PAYLOAD when one is missing. So a name in
   there that cannot be reached is not a thin section of the site — it is the whole site dark, for
   every visitor, until somebody edits that line.

   THAT IS NOT HYPOTHETICAL EITHER. `links` sat in that list after the links moved into the
   repository and `WHERE` stopped routing the tab, so `read('links')` could never find a sheet
   again and the live payload was an error object. It shipped, because the list is typed out in a
   fourth file and `TAB`, `WHERE` and `SCHEMA` all agreed with each other perfectly without it.

   Two questions, and they fail for different reasons:
     · not routed in `WHERE`   — `read()` gets a blank id and can never find the sheet.
     · not described in `SCHEMA` — `ensureSchema` will never create it, so `?setup=1` cannot fix it.

   What it cannot ask is whether the tab is actually in the file. That is `checkTabs()`'s half, with
   the documents open — so a name added here still takes the site down until `?setup=1` has run. */
```

