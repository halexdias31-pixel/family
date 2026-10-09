## The films are whatever is in the Notflix folder: a sync from Drive, asked for by the videos card

**The owner, 9 Oct:** *"Ensure the video searcher is hooked up. Let admin be able to search up films
which are in the notflix folder on gdrive."*

### Why an admin found nothing

**THE SEARCHER WAS HOOKED UP AND THE LIST UNDER IT WAS EMPTY.** The videos card (js/games.js) reads
`DATA.films`; `doGet` builds that inside `if (viewerIsAdmin)` and sends nobody else a row (note 068).
All of that worked. But the Ledger's `films` tab had its headers and not one row: note 068's rows were
typed once, by hand, into a Ledger that was later replaced, and nothing anywhere knew where the films
actually live. So the admin's card said "No videos listed yet." — which is exactly what an empty
database says, and no check could tell the two apart.

**AND A LAPTOP COULD NOT TYPE A TWO-WORD TITLE.** Flappy Bird flaps on Space. Its key handler sat on
`document`, stayed on once the Games column had been drawn, and asked only whether its canvas existed —
so after one visit to Games, "two words" typed into the videos box became "twowords" and found nothing.
Find's box the same. Measured in Chromium by the audit; the jsdom journey set `q.value` directly, so it
could never have seen it.

### What was built

**THE FOLDER IS THE SOURCE OF THE TAB.** `filmsSync_` (backend/content.gs) walks the folder and upserts
the `films` tab by `drive_id`:

| | |
|---|---|
| a new file or show | a new row: title, year and the owner's note read from the name; `kind` film, series or documentary; `audience` from the folder; `drive_id`, `drive_url`, `file_kind` (file \| folder), `size_gb`, `seasons` |
| a row that exists | **the machine's columns** (`kind`, `audience`, `drive_name`, `drive_url`, `file_kind`, `size_gb`, `seasons`, `placeholder`, `active`) follow the folder; **a person's** (`title`, `year`, `notes`) follow a rename while they still say what the last name said (`drive_name` is that name), and are never written over once somebody typed something else — a corrected title survives a rename. `director` and `lead` are never written |
| a row typed with no id | not touched; and when a file of that title arrives, the typed row is **adopted** (given the id) rather than duplicated — note 068's film asked for by name |
| a file that left | `active` FALSE, the row kept; back on if the file returns. Only a **whole pass** switches anything off, and a listing of nothing switches nothing off (the wrong folder, not a deleted one) |
| a Google Doc where a film would be | a placeholder row, "Not in the drive yet" (none is in the folder today) |
| subtitles, pictures, shortcuts, an extras folder, an empty show | no row, counted |

A series is ONE row, its folder (068). Its seasons are counted from the episodes that exist — by the
`sN` folder or the `S.E` in the name — and never from the folders: one show has five season folders and
three with anything in them. **Episodes are never rows**, so the four release-style episode names that
carry a show's real name and a release group are read for a season number and stored nowhere.

**THE SHAPE IT READS** (levels only — this repository is public and no title from the folder is in it):
level 1 is the audience (`Notflix adults` / `Notflix kids` → `adults` / `kids`), with `documentaries`
beside them as a kind that holds its file directly; level 2 is film or TV, matched in either case
(`Films`/`films`, `Tv shows`/`tv shows`); level 3 under TV is one folder per show. A video is anything
whose type starts `video/` or whose name ends in a video extension — three different video types are in
the folder, and an exact match on one Matroska spelling would have dropped eight films.

**WHICH FOLDER.** `films_folder` in the config tab — an id or a pasted folder URL — and a wrong id is
said, never fallen back from. Blank uses the folder the last run used, by its id, while it opens and is
not in the bin (renamed or not); failing that, the folder whose name is exactly `notflix` in any case —
one this account owns before any shared with it, one found whoever owns it, and **two that cannot be
told apart refused** with a sentence naming `films_folder`, before anything is listed or written.
**The config tab goes to every phone as `constants.vars`, and this id is the folder's only lock** (068:
the folder is "anyone with the link"), so `CONFIG_PRIVATE` names it and `configPublic_` takes it out
before anything is sent. The reply names the folder it used, by name.

**WHEN IT RUNS.** Three doors, one function: the videos card posts `filmsSync` (`ACTION_ACCESS` admin,
and the handler asks again) for an admin when the last whole pass is a day old or part-way; a silver
**Sync from Drive** tile on the card does it by hand, with the line beside it saying when it last ran;
and `syncFilms` in the editor's function dropdown (or `?run=syncFilms`) runs it with the editor's budget.

**BOUNDED BY A CLOCK.** Things are taken in id order until the budget is spent (20s from the phone,
4½ minutes from the editor, 5½ the ceiling no run crosses); what was done is written, the place is kept
in Script Properties (`FILMS_SYNC`), and the next run carries on. Every run does at least one thing, and
the clock is asked at every episode, so a flat sixty-episode show cannot run a minute past the line. The
card asks again, up to six times, while a pass says `more`. **The Drive walk holds no lock; the write
does** — the script lock is the one every answer and booking waits on, and twenty seconds of Drive under
it would refuse a child's Check for nothing.

**NO COLD REBUILD.** `markDone`'s move from note 296: the stored payload body no longer carries the films
(or the new `filmsSync` stamp), and `doGet` lays them on fresh for an admin, hit or miss
(`payloadWithFresh_`) — `[]` for everybody else, without opening the tab. So a sync retires nobody's
payload, and its own reply carries the list, so the card and Find are current the moment it answers.

**THE CARD.** Placeholders are listed and say "not in the Drive yet" (they were dropped, so the card said
"Nothing matches that." where Find says "Not in the drive yet"); rows say Film, Series or Documentary
(every one said Film); a plural finds its singular (`films`, `documentaries`); forty rows and then a line
saying how many more. A blank `active` is on, as every other `active` in this project reads (`ON_`); it was
`TRUE_`, so a hand-typed row with the cell left empty vanished. The roster name lost "films, reels and" —
it was the one word on a student's screen that said films exist.

### For the owner — in Apps Script, after this is merged

1. **Pull** `backend/` into the project (the GitHub Assistant's ↓, route 1 in CLAUDE.md).
2. **Run `ensureSchema`** once. It adds the `films_folder` row to the config tab and a `drive_name`
   column at the end of the films tab. Until it has run, a sync answers "Nothing was saved for:
   films.drive_name … run ensureSchema" — loudly, as every unwritten column in this project does.
3. **Run `syncFilms`** once from the function dropdown. The log line says which folder it used and what it
   found; from the map of the folder on 9 Oct that should be 13 films, 4 series and 1 documentary — 18
   rows, against 068's 22 (at least four of those files are no longer in the folder).
4. **Deploy → Manage deployments → edit → Version: New version.** The web app runs the version it was
   deployed at; until then the phone's Sync tile says the backend does not have `filmsSync` yet.
5. *Optional:* put the Notflix folder's id (or its URL) in `films_folder` on the config tab — in the sheet,
   never in this repository. Blank works today because exactly one folder has that name, and after the
   first sync the folder is remembered by its id. **To move the films to a different folder, put that
   one in `films_folder`** (or bin the old one): a blank cell keeps using the folder synced before.
6. **Open the site as an admin → Games → Videos.** The line beside the tile says when it last synced and
   how many are in the folder; type a word of a title, a year, `kids`, `series` or `documentary`.

Directors and leads arrive blank — a name says neither, and a wrong director is a fact nobody re-checks
(068). Type them into the tab; the sync will never write over them.

### Checked

- **`js/check-films.js`**, new, on check-all's roster: the real `doPost` and `doGet` over an invented Drive
  in the folder's shape — the names one pattern at a time; a first sync makes every film, show,
  documentary and placeholder once; a second writes **0 cells**; typed cells survive a rename; a file
  that leaves goes off (not deleted) and comes back; a typed title is adopted; an empty listing switches
  nothing off; a student and a stranger cannot run it, are sent no film and no stamp, and their load never
  opens the tab; no `drive_id` and no `films_folder` in any payload; no payload retired and the admin's
  next load a cache HIT with the new film; the clock — at five seconds a file a pass takes five runs,
  nothing switched off part-way, and a forty-episode show begun mid-run is cut at the line.
  **Twenty mutations**, each red, then green on the real files: the admin guard, a typed title
  overwritten, a part-way switch-off, delete for switch-off, films in the stored body, the config
  unfiltered, one exact video type, seasons by folders, the access table, both gates, the write flag
  kept, no adoption, an empty listing switching off, no progress guarantee, `TRUE_` for `active`, no
  budget stop, the note in the title, `drive_id` sent, extras not skipped, the machine's columns frozen,
  and the clock asked once a folder.
- **`check-flow.js`**, five journeys: an admin finds by title, year, `kids`, `films kids`, `series`,
  `documentaries`; a film is a link out, a placeholder says so; a never-synced card syncs once, finishes
  a part-way pass, tells Find, does not sync again that visit; the tile is busy while it asks and refuses
  a second press; a reply after sign-out is dropped; a failed sync is said once and not re-posted on
  every return; a student's and a stranger's card has no tile, no admin row and no word "film", "drive"
  or "sync"; a Space in the search box is a Space, and still flaps outside it. **Thirteen mutations**,
  each red. All 191 journeys pass.
- `check-columns.js` now reads the keys of a `setCells(t, row, { … })` literal (it read only `setCell`
  and `addRow`), and the sync names every column it writes in its `addRow` literal so it can be seen.
  `check-payload.js` sees `filmsSync` sent and read. `check-access`, `check-post`, `check-backend`,
  `check-tabs`, `check-rows`: each proved by a mutation on the films code.
- `check/ui.js` serves a signed-out visitor what `doGet` sends one — no films, no stamp — where it had
  served the admin's fixture to both; two states, the admin's card and nobody's. Games: 210
  combinations, nothing new; the 320 and 390 shots of both looked at.

### Not done, and worth knowing

- **Older notes still hold details note 068 says should be private**; they are listed for the owner
  separately, not here. Two comments in js/find.js that named real people and a real title now say
  what they meant without them. Taking anything out of the files does not take it out of git's history,
  and that is the owner's call.
- A note on an **episode** is stored nowhere: episodes are not rows.
- The reply's sizes are Drive's own GB (1024³), to two places.

### After review (9 Oct)

- **SIGNING OUT LEFT AN ADMIN'S FILMS ON THE DEVICE.** `signedOut_` cleared every per-person key but
  `DATA.films` and `DATA.filmsSync`, and nothing that draws the films asks whose they are — the payload
  was the only gate, and signing out does not reload it. So after an admin signed out, Games → Videos
  and Find still listed every film with its Drive link, and a child signing in after them saw them
  until their own payload landed. The journey written for the late reply had even asserted it: it
  signed out with `USER(null)` and wanted all seven films still in `DATA`. Now `signedOut_` takes the
  films, the stamp, the typed search and the sync in flight; a sync's end clears only its own
  `asking`. A new journey goes through the real Sign out and through `signedIn_` for a student while
  their payload is held.
- **THE TEST FILMS WERE TOO CLOSE TO THE REAL ONES.** Some fixtures carried a real file's year, note,
  type and size to two places, under a title one synonym away. They are plainly invented now, with
  round sizes, invented years, an invented tag, invented episode numbers and an invented note word;
  the commit was amended before anything was pushed, so the first version is in no public history.
- **WHICH FOLDER** — see above. It took the first of several folders named Notflix, and Drive lists in
  no fixed order and includes folders shared with the account: reproduced, a second one listed first
  made the next pass switch off all twelve.
- **A RENAMED FILE NEVER CHANGED ITS ROW** — see the table. `drive_name` is new, written on every pass,
  and never sent.
- **TWO RULES NOTHING ASKED**: an emptied show switched off (its line deleted, check-films stayed green),
  and the once-a-day sync (its age test deleted, every journey stayed green). Both asked now.
- **Proved by mutation, each red and then green on the real files.** check-films, twelve: no remembered
  root, `found[0]` taken, ownership ignored, a binned root still used, one shared folder refused, the old
  blank-only rule, every cell always overwritten, `drive_name` never refreshed, `drive_name` not on a
  new row, an emptied show left on, `drive_name` sent to the admin, and (check-columns) `drive_name`
  missing from SCHEMA. check-flow, eight: `signedOut_` keeping the films, keeping the stamp, keeping the
  sync in flight, keeping the typed search; a late reply clearing the next admin's `asking`; a late reply
  adopted for nobody; no age test; always due. Dropping Find's memo in `signedOut_` is NOT provable today
  — the memo's key names the person, so a sign-out rebuilds it anyway; it is kept for the day it does not.
  All 193 journeys pass; check/ui.js on Games, 210 combinations, nothing new.
