# js/check-films.js

The full text of comments in `js/check-films.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-films.js — THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER, ASKED OF THE REAL BACKEND

top level, before `backend`

```
/* ==================================================================================================
   node js/check-films.js — THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER, ASKED OF THE REAL BACKEND

   ASKED FOR AS *"Ensure the video searcher is hooked up. Let admin be able to search up films which
   are in the notflix folder on gdrive."* The card was wired; the films tab it reads was empty, and
   nothing filled it from the folder. `filmsSync_` in backend/content.gs does now, and each rule below
   is one that fails QUIETLY if it fails at all — a list that looks complete, a row that lost what the
   owner typed on it, a film that vanished because a pass ran out of time, a student's payload with a
   title in it:

     · A FIRST SYNC ADDS EVERY FILM, SERIES, DOCUMENTARY AND PLACEHOLDER ONCE, read the way the map of
       the folder found it: the audience from level one, film or TV from level two in either case, a
       show as ONE row with its seasons counted from the episodes that exist, the year and the owner's
       note out of the name, three video types and a name with no extension.
     · SUBTITLES, PICTURES, AN EXTRAS FOLDER, A LOOSE EPISODE AND AN EMPTY SHOW MAKE NO ROW.
     · A SECOND SYNC OVER AN UNCHANGED FOLDER WRITES NOTHING AT ALL.
     · WHAT A PERSON TYPED SURVIVES: a director, a note and a corrected title, through a rename and a
       new size — while the machine's columns follow the folder.
     · A RENAMED FILE'S ROW FOLLOWS THE NEW NAME — title, year and note, a note dropped included — in
       every cell nobody typed over (`drive_name` says which those are), and `drive_name` is never sent.
     · A FILE THAT LEAVES IS SWITCHED OFF, NEVER DELETED, and comes back on when it returns; so is a
       show whose every episode left. A row a person typed with no id is not touched — and is ADOPTED
       by the file of that title when it lands.
     · WHICH FOLDER: the one synced before, by its id, renamed or not and never from the bin; by name,
       this account's own over one shared with it, one shared folder alone used, and two that cannot
       be told apart REFUSED before anything is written.
     · A PLACEHOLDER (a Google Doc where a film would be) STAYS A PLACEHOLDER.
     · ONLY AN ADMIN: a student and a stranger cannot run it, are sent no film and no stamp, and their
       load never opens the films tab.
     · `drive_id` NEVER LEAVES THE SERVER, and neither does `films_folder` — the folder's only lock.
     · NO PAYLOAD IS RETIRED: the admin's next load is a cache HIT and still has the new films.
     · THE CLOCK: a pass that does not fit stops between two things, switches nothing off, and the next
       run carries on from where it stopped until the pass is whole.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`, with a Drive whose
   folder tree is INVENTED. This file is in a public repository: every title below is made up, and
   every id is `example-…`. Nothing here is, or may become, the real folder's.
================================================================================================== */
```

### ---------- A DRIVE OF INVENTED THINGS

top level, before `drive`

```
/* ---------- A DRIVE OF INVENTED THINGS ----------------------------------------------------------------
   `spec` is a nested object: a folder is `{ name, files: [...], folders: [...], owner?, trashed? }`, a
   file is `{ name, mime, gb }`. Ids are handed out in order as `example-d-001` / `example-f-001`, so a
   file keeps its id for as long as the same spec object holds it — a rename is a change to `name`, a
   removal is taking the object out of its list, exactly as Drive behaves. `clock.cost` is what one
   `getSize()` costs on the walk's clock: 0 everywhere except the test that asks whether the walk stops.
   THE ACCOUNT IS `me@example.org`: a folder with no `owner` is its own, and `spec.before` /
   `spec.elsewhere` are other folders Drive can see, listed before and after the root by a search. */
```

### ---------- THE FOLDER, IN THE SHAPE THE MAP OF THE REAL ONE FOUND (counts and levels, not names)

top level, before `tree`

```
/* ---------- THE FOLDER, IN THE SHAPE THE MAP OF THE REAL ONE FOUND (counts and levels, not names) ------
   Two audiences named `Notflix <audience>`, `Films`/`films` and `Tv shows`/`tv shows` in different case,
   a `documentaries` folder holding its file directly, one show flat with an owner's note and a name
   with no extension, one in season folders with two empty ones, one mixing release-style names into a
   season, an empty show, an empty kids `tv shows`. Plus everything that must make no row. */
```

### ---------- A FILE RENAMED IN DRIVE: ITS ROW FOLLOWS THE NEW NAME

top level, before `w`

```
/* ---------- A FILE RENAMED IN DRIVE: ITS ROW FOLLOWS THE NEW NAME ---------------------------------------
   The title, year and note were written once and after that only into a blank cell, so a renamed file
   kept its old title for ever: the admin searched for the new name and found nothing, and a film whose
   flag the owner took off once it was mended read as not right for ever (review of 9 Oct). `drive_name`
   is how the sync tells its own cells from a typed one. */
```

### ---------- A SHOW THAT LOSES EVERY EPISODE IS SWITCHED OFF

top level, before `w`

```
/* ---------- A SHOW THAT LOSES EVERY EPISODE IS SWITCHED OFF ------------------------------------------------
   The `if (d.empty)` branch of `filmsUpsert_`: an empty folder makes no row, and a folder whose row exists
   and has emptied switches that row off. Only a show that never had a row was asked before — deleting the
   line that switches it off left this file green (review of 9 Oct). */
```

### ---------- WHICH FOLDER, WHEN MORE THAN ONE IS CALLED NOTFLIX

top level, before `another`

```
/* ---------- WHICH FOLDER, WHEN MORE THAN ONE IS CALLED NOTFLIX ----------------------------------------------
   The name search sees folders SHARED with the account, and listed them in no fixed order, and the first
   was taken: a second folder of that name listed first made the next whole pass switch off every film in
   the right one (review of 9 Oct, reproduced here before the fix: "1 new, 0 updated, 12 switched off"). */
```

### FIVE SECONDS A FILE, so the first show in id order (six episodes) is 30s on its own — past the 20s budget.

top level, before `COST`

```
/* FIVE SECONDS A FILE, so the first show in id order (six episodes) is 30s on its own — past the 20s
     budget. The first thing of a run is given the ceiling, not the budget, so a run always gets one
     thing done; without that a show bigger than the budget would be cut at the same place for ever. */
```

### A LONG SHOW THAT IS NOT THE FIRST THING OF ITS RUN IS CUT AT THE LINE, NOT AT THE END OF ITS FOLDER — forty episodes kept flat, a second each, after a

top level, before `ep`

```
/* A LONG SHOW THAT IS NOT THE FIRST THING OF ITS RUN IS CUT AT THE LINE, NOT AT THE END OF ITS FOLDER —
   forty episodes kept flat, a second each, after a one-episode show: the run stops at the budget with
   the long show undone, and the next run (where it is first) does it whole. */
```

