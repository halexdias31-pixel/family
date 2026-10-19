# backend/core.gs

The full text of comments in `backend/core.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 10_core.gs (2 of 8) READING AND WRITING THE SHEET, and the small helpers everything uses.

top level, before `clearCache`

```
/* ==================================================================================================
   @family. — 10_core.gs   (2 of 8)

   READING AND WRITING THE SHEET, and the small helpers everything uses.

   `read`, `setCell` and `addRow` are the only three things in this project that touch a
   spreadsheet cell. Everything else asks them. That is what makes the write-miss check possible:
   one place records a column that is not there, and `jsonOut` — the one exit — turns a request
   that lost a value into an error rather than a success.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */
```

### Drop the per-request cache.

top level, before `clearCache`

```
/**
 * Drop the per-request cache. Reads are cached so doGet doesn't fetch the same tab seven times,
 * but a handler that appends events and then wants to re-fold them needs the fresh rows — and
 * anything holding a stale copy after its own write is the bug class that has bitten this code
 * more than once.
 */
```

### ---------- WHICH FILE, AND WHAT IT IS CALLED IN THERE

top level, before `sheetFor_`

```
/* ---------- WHICH FILE, AND WHAT IT IS CALLED IN THERE --------------------------------------------
   One lookup, used by `read`, `ensureSchema` and `checkTabs`. Those are the only places that turn
   a tab name into an actual sheet, and they have to agree — if `read` fetched venues from the
   settings file while `ensureSchema` looked for them in the ledger, `ensureSchema` would helpfully
   create a second empty `venues` tab back in the database you just moved it out of.

   TWO NAMES, TRIED IN ORDER. The name the code asks for wins; `alsoTry` is the fallback. Renaming
   the tabs in the spreadsheet is therefore something you can do one at a time, in any order, with
   the site up the whole way through — which is the state this was actually in when it was written,
   with one of four renamed and three not. `make` is the name to use if a tab has to be CREATED,
   and it is always the plain one, so nothing new is ever born with a prefix.

   AN UNROUTED NAME RETURNS NO FILE, and that is deliberate. This used to read the two maps `HERE`
   and `ELSEWHERE` and fall back to `SPREADSHEET_ID` for anything in neither — which was right while
   one file held everything, and became a trap the moment there were three: a misspelled key would
   have resolved to a real file, found no tab of that name, and come back as an empty list, which is
   indistinguishable from an empty database. An empty `id` is the same empty list to `read`, but
   `checkTabs()` can see it and name it, and that is the whole difference between the two. */
```

### ---------- `documents_()` WAS HERE, AND THERE IS NOTHING LEFT FOR IT TO READ

top level, before `_open`

```
/* ---------- `documents_()` WAS HERE, AND THERE IS NOTHING LEFT FOR IT TO READ --------------------
   IT WENT THROUGH TWO HOMES IN A FORTNIGHT. `read(TAB.resources)` appeared in nineteen places; the
   resources tab and the questions tab turned out to be one table written twice, so this became the
   `kind === 'paper'` filter over `read(TAB.questions)` and those nineteen callers were otherwise
   untouched. Now the questions tab has left the spreadsheet altogether — 3,913 rows in
   `data/questions.json`, read by js/library.js in the browser — so there is no tab under either
   name and no row for this to hand back.

   ALL SIXTEEN CALLERS ARE GONE RATHER THAN REPOINTED, and that is the honest outcome rather than a
   tidy-up: five of them WROTE to a document row (a relabel, a delete, a page count, a tick, a print
   order), and Apps Script cannot write to a file in git. Repointing them at a fetched copy of the
   JSON would have produced five handlers that read the right data, reported success, and changed
   nothing anybody would ever see. The reading ones — the `resourceInUse` dropdown, the health
   check's page-count tally, `countTicks` — went with them because they described a tab.

   SO A PAPER IS EDITED BY EDITING `data/questions.json` AND PUSHING IT. That is a deploy, which is
   exactly the trade the move was made for: `questions` is the one tab nobody hand-edits. */
```

### ---------- ONE OPEN PER FILE PER REQUEST

top level, before `_open`

```
/* ---------- ONE OPEN PER FILE PER REQUEST ---------------------------------------------------------
   `openById` WAS CALLED ONCE PER TAB. `read` caches its ROWS, so a tab is only read once — but the
   cache is checked after `findSheet_` has already opened the file, and the file is opened again for
   every tab in it. A payload touches about thirty tabs across two spreadsheets, so this was thirty
   opens to reach two documents, and an open is a round trip to Google's servers whether or not
   anything is read afterwards.

   HELD BY ID, NOT BY TAB, which is why it is a second cache and not part of `_cache`: `_cache` is
   keyed on the tab name and there are thirty of those to two files. Cleared with the rest, so a
   handler that writes and re-reads gets a fresh document as it always did. */
```

### NO FILE, OR NO TAB UNDER EITHER NAME, is answered the same way — an empty result.

in `read`

```
/* NO FILE, OR NO TAB UNDER EITHER NAME, is answered the same way — an empty result. That is what
     it is from every caller's point of view: a tab nobody has filled in, a file id not yet set, and
     a tab with no line in `WHERE` all leave the caller with nothing to draw. They are not the same
     FAULT, though, and telling them apart is `checkTabs()`'s job and `check-tabs.js`'s. */
```

### ---------- THE LAST ROW WITH DATA, NOT THE LAST ROW SOMETHING TOUCHED

in `read`

```
/* ---------- THE LAST ROW WITH DATA, NOT THE LAST ROW SOMETHING TOUCHED --------------------------
     `getDataRange()` goes to the furthest cell anything has ever been done to — a paste that
     overshot, an import that filled the grid, a format applied to a whole column. On the posts tab
     that is 998 rows holding 11 posts, so every page load carried twenty-six thousand empty cells
     across the wire for eleven photographs.

     `getLastRow()` and `getLastColumn()` answer the narrower question — where the DATA ends — and
     they are the two calls this should always have used. The rows below are dropped by the filter
     at the bottom of this function anyway, so nothing downstream changes: the only difference is
     that they are no longer fetched first.

     A COMPLETELY EMPTY TAB has a last row of 0, and asking for a range of zero rows throws. That is
     the freshly-created tab, right after `ensureSchema` makes one, so it is the ordinary case on
     the day a feature is added rather than an exotic one. */
```

### ---------- SOME COLUMNS OF A TAB, NOT ALL OF THEM

top level, before `readCols_`

```
/* ---------- SOME COLUMNS OF A TAB, NOT ALL OF THEM ------------------------------------------------
   FOR A TAB THAT GROWS BY A ROW A PRESS AND REPEATS A PARAGRAPH ON EVERY ROW. `submissions` keeps a
   question's words (up to `ATTEMPT_WORDS_MAX`) on each press, and `submitAnswer` read the whole tab
   under the site's only script lock to find one thing — whether this press's id was already written.
   The review of 9 Oct: that read grows without bound, and once it nears the 5 s `tryLock` every other
   write waits on, `saveAnswers`, the AI marking tally and bookings start answering "Busy". So this
   reads the header row and then ONE COLUMN AT A TIME, only the columns asked for: two narrow strips
   where the whole grid was.

   THE SAME SHAPE AS `read` — `{ sheet, headers, rows }`, each row with its `_row` — so `addRow` appends
   to it as it does to a whole tab. NEVER CACHED under the tab's name: a row holding five of nine
   columns handed to a later `read` would be a row with its words missing. A column the tab does not
   have is simply absent from the rows (the caller asks `headers`), and blank rows are dropped as
   `read` drops them. */
```

### ---------- WHAT THE NET SHORTENED ON THE WAY OUT IS NOT WRITTEN BACK SHORT

top level, before `kidNamesKept_`

```
/* ---------- WHAT THE NET SHORTENED ON THE WAY OUT IS NOT WRITTEN BACK SHORT ------------------------
   THE OWNER, 10 OCT: *"dont show children's last name"* — so every reply goes through `kidNamesOff_`
   (people.gs), and a caption, a notepad or a Settings box reaches the phone with a child's surname
   taken out. Saved back as drawn, that text would go over the sheet's, and the surname would be gone
   from the one place that keeps it (the review of 10 Oct: the admin pinned a post and its caption lost
   the name; a parent added a line to her notepad and every line above it lost it). Here because these
   two are the only functions that change a cell, as `jsonOut` is the only door out — a route written
   next year cannot forget. A failure keeps what was sent: this must never cost the write. */
```

### ---------- A STRING THAT STARTS LIKE A FORMULA IS WRITTEN AS TEXT

top level, before `cellSafe_`

```
/* ---------- A STRING THAT STARTS LIKE A FORMULA IS WRITTEN AS TEXT --------------------------------
   `setValue` PARSES A STRING THE WAY TYPING IT INTO THE CELL WOULD. So `+44 7700 900123` — which is
   exactly what `phoneIn` produces — is read as a sum and comes back `#ERROR!`, and anything somebody
   types that starts with `=` becomes a live formula in the owner's spreadsheet: a caption, a message
   or a name reading `=IMPORTXML(…)` would run with the owner's own permissions the next time the
   sheet recalculates. A leading apostrophe is the sheet's own "this is text": it is not stored as
   part of the value, so every reader gets back exactly what was written.
   `-` ONLY WHEN IT IS NOT A NUMBER, because `-5` in a credits cell is a number and must stay one.

   ---------- AND DIGITS THAT START WITH A 0 ARE TEXT, BECAUSE THE 0 IS PART OF THEM ----------------
   THE SAME PARSE TOOK THE 0 OFF A PIN. A string of digits is read as a number, so a child who chose
   a PIN starting with 0 had a cell one digit shorter, a reset PIN starting with 0 (one in ten) was
   refused the moment it was typed, and four noughts became `0`. Nothing that is all digits with a
   leading 0 is ever meant as a number — a PIN, a phone number typed without spaces, a library card —
   so the apostrophe goes on and the sheet keeps what was written. `0` alone and `0.5` are numbers and
   are left alone. See `authPinLost_` in booking.gs for the cells written before this. */
```

### ---------- SEVERAL CELLS OF ONE ROW, IN AS FEW CALLS AS THE COLUMNS ALLOW

top level, before `setCells`

```
/* ---------- SEVERAL CELLS OF ONE ROW, IN AS FEW CALLS AS THE COLUMNS ALLOW ----------------------------
   `setCell` IS ONE `getRange().setValue()` PER CELL, and a Settings page was up to twenty-one of them
   — the Qualifications page writes the packed cell, twelve `qual_N` mirrors and seven `teaches_*` /
   `studying*` cells. Measured with counting stubs: an untouched Qualifications Save was 55 service
   calls and 21 writes; the same Save through this is 9 and 0. The contract is `setCell`'s, for a row:

     · A MISSING HEADER IS `missedWrite_`, exactly as in `setCell`, and that cell is skipped — so
       `jsonOut` goes on turning a lost value into an error.
     · A CELL ALREADY HOLDING WHAT IS BEING WRITTEN IS SKIPPED, compared as text (and a Date against
       its own `dd/mm/yyyy` or `yyyy-mm-dd` spelling). So a Save that changes nothing writes nothing,
       leaves `POST_WROTE` false, and does not retire every visitor's stored payload.
     · ONE `setValues` PER RUN OF ADJACENT COLUMNS BEING WRITTEN, never a span that includes a cell
       nobody asked to change: a span would write values read at the top of this request back over
       anything another request (a game's credits, a notepad save) wrote in between.
     · The in-memory row is updated afterwards, as `setCell`'s last line does. */
```

### Is a cell already holding this value?

top level, before `sameCell_`

```
/* Is a cell already holding this value? Text comparison, deliberately strict: anything that is not
   character-for-character the same is written. A Date is the one exception, because the sheet hands
   back a Date for a cell the form posts as `06/05/1990` or `2027-05-14`. A Date being WRITTEN (a
   stamp) is always written. A number the sheet hands back as `4` against a box's `'4'` is equal as
   text, which is the comparison wanted. */
```

### A TICK TYPED OR WRITTEN AS `TRUE` COMES BACK A BOOLEAN — the sheet coerces it — and the form posts the word.

in `sameCell_`

```
/* A TICK TYPED OR WRITTEN AS `TRUE` COMES BACK A BOOLEAN — the sheet coerces it — and the form posts
     the word. Compared as text, `true` against `TRUE` is a difference, so every Save of the
     qualifications page rewrote every tick and retired the payload with nothing changed.
     `check-profile.js` caught it the moment its seed went through the sheet's own coercion. */
```

### ---------- THE THIRD WAY TO CHANGE A SHEET, AND IT WAS NOT WRITTEN DOWN

top level, before `delRow`

```
/* ---------- THE THIRD WAY TO CHANGE A SHEET, AND IT WAS NOT WRITTEN DOWN --------------------------
   `POST_WROTE`'s OWN NOTE SAYS: "`setCell` and `addRow` are the two functions that put anything into
   a spreadsheet, and the payload is stale if and only if one of them succeeded." That sentence was
   true of everything that ADDS and false of everything that REMOVES. Nine places call
   `t.sheet.deleteRow(row._row)` straight through to the sheet — un-starring a favourite, deleting a
   link, taking a reaction off a post, withdrawing from a class — and not one of them set the flag.

   SO A DELETION NEVER RETIRED THE STORED PAYLOAD. The row went from the sheet and stayed in the
   six-hour copy every phone is served, which on a favourite means the star you just took off comes
   back on the next load: `adoptFavourites_` replaces the local set with the payload's, and the
   payload still has it. Nothing fails, nothing is logged, and it looks like the app ignoring a tap.

   FOUND BY AUDITING FAVOURITES — asked "does it work, and does it work well" — and the answer for
   the star was yes and for the unstar was no, for up to six hours at a time.

   THE FIX IS THE RULE AND NOT THE INSTANCE, which is the argument this repository makes about
   `cost: 0` and `paper: true`: both were repaired in the data and neither in the rule, so the shape
   came back. One function that removes a row, beside the two that write one, all three setting the
   same flag — and nine call sites that can no longer forget.

   IT DROPS THE ROW FROM `t.rows` TOO. `setCell` keeps the in-memory object in step deliberately
   ("read-after-write within this request now sees the truth") and a delete owes the same debt: a
   handler that removes a row and then counts what is left was counting the row it had just removed.
   Every later `_row` shifts up by one when a sheet row goes, so those are corrected as well — the
   nine callers all delete one row and return, which is why nobody had been bitten yet. */
```

### THE ONE EXIT. Every reply in this file goes through here, which is why the check belongs here rather than in fifty handlers that would each have to remember it.

top level, before `POST_WROTE`

```
/**
 * THE ONE EXIT. Every reply in this file goes through here, which is why the check belongs here
 * rather than in fifty handlers that would each have to remember it.
 *
 * A request that tried to write to a column that does not exist did not do what it was asked, so
 * it does not get to say `success`. The value is gone either way; the difference is whether
 * anybody finds out today or in three weeks when somebody notices their avatar keeps resetting.
 */
```

### ---------- SET BY THE WRITES THEMSELVES

top level, before `POST_WROTE`

```
/* ---------- SET BY THE WRITES THEMSELVES ----------------------------------------------------------
   THIS WAS SET AT THE TOP OF `doPost`, ON THE GROUNDS THAT A POST IS A WRITE. It is not. `messages`
   is a POST and reads an inbox; `signOut` is a POST; several more only look things up. Opening the
   messages widget therefore emptied the payload cache, and on a signed-in phone that is a POST on
   the way in — so the cache was cleared about as often as it was filled, and the app was exactly as
   slow as it had been before any of this existed.

   SO IT IS THE WRITE THAT SAYS SO. `setCell` and `addRow` are the two functions that put anything
   into a spreadsheet, and the payload is stale if and only if one of them succeeded. A read-only
   POST now touches neither, and leaves the cache alone.

   READ BY `jsonOut`, which is the one exit every one of `doPost`'s two hundred and fifty returns
   goes through — the same reason the unwritten-column check lives there rather than in fifty
   handlers. */
```

### AFTER the write, not before it.

in `jsonOut`

```
/* AFTER the write, not before it. Emptied at the top of `doPost` instead, a request arriving in
     the gap would rebuild the payload from the sheet as it was a moment BEFORE the change and
     store that — an invalidation that puts back the very thing it removed. */
```

### NO CHILD'S SURNAME LEAVES BY THIS DOOR — the owner, 10 Oct:

in `jsonOut`

```
/* NO CHILD'S SURNAME LEAVES BY THIS DOOR — the owner, 10 Oct: *"dont show children's last name."*
     Every reply goes through here, so the net is here rather than in the two hundred and fifty
     returns that would each have to remember it (`kidNamesOff_` in people.gs). A broken people tab
     names no child, so a failure here has nothing to take out and must not cost the reply. */
```

### WRAPPED AND SERVED AS A SCRIPT, when a callback was asked for.

in `jsonOut`

```
/* WRAPPED AND SERVED AS A SCRIPT, when a callback was asked for. The name is checked rather than
     trusted: it goes into a page as executable code, so anything but a plain identifier is refused
     — a callback of `alert(1)//` would otherwise be a way to run whatever somebody liked inside
     this page. */
```

### THE PAYLOAD CACHE. WHY THE APP IS SLOW, stated plainly:

top level, before `PAYLOAD_TTL`

```
/* ==================================================================================================
   THE PAYLOAD CACHE.

   WHY THE APP IS SLOW, stated plainly: `doGet` rebuilds the whole payload from the spreadsheet on
   every single request. Around thirty tabs, each its own `getValues()` round trip, then the folding
   and the joins on top — fifteen seconds of it, and every visitor pays the full price even though
   the answer they get is, for almost all of them, the answer the last visitor got.

   SO THE FINISHED JSON IS KEPT. Not the rows: the finished, serialised body, exactly as it went out
   last time. That matters — rows hold Date objects, and a cache that serialises rows hands back
   ISO strings that look like dates and are not, which would break `fmtDate` and everything counting
   on it in ways nobody would find for weeks. A string that was already going to be a string cannot
   change type on the way through.

   A HUNDRED KILOBYTES IS THE CEILING on one cache value, and the payload is bigger than that. So it
   is cut into numbered chunks with an index key naming them, and `getAll`/`putAll` move the lot in
   one call each rather than one per chunk. A missing chunk — they expire independently — is treated
   as a miss and the payload is rebuilt, which is the only safe reading of half an answer.

   IT IS NOT STALENESS THE WAY A BROWSER CACHE IS. Nothing is held on anybody's phone; this lives in
   the script, and `clearPayloadCache()` empties it. `doPost` calls that after anything that writes,
   so an edit made in the app is visible on the next load. A change typed straight into the
   spreadsheet is the case a write cannot see, which is what the TTL is for.
================================================================================================== */
```

### SIX HOURS, WHICH IS THE MAXIMUM THE SERVICE ALLOWS, and not a compromise between freshness and speed — a write invalidates immediately, so freshness is not

top level, before `PAYLOAD_TTL`

```
/* SIX HOURS, WHICH IS THE MAXIMUM THE SERVICE ALLOWS, and not a compromise between freshness and
   speed — a write invalidates immediately, so freshness is not what this number controls. It was
   300, and on a site with a few dozen visits a day spread across the hours that meant almost every
   visitor found an expired entry and paid the full rebuild: a cache that never fires, and all of
   the code with none of the benefit.

   THIS SENTENCE USED TO END "the only thing this number delays is an edit typed straight into the
   spreadsheet rather than made in the app", and it said that as though it were a small exception.
   It was the whole fault: an edit typed into a tab was delayed by SIX HOURS, which is not a delay,
   it is a site showing last night's prices while the cell in front of you shows this morning's. A
   trigger on the spreadsheet now retires the stored copy the moment anybody changes it — see
   `onSheetChange` below — so this number once again delays nothing at all. */
```

### WHY THE LAST WRITE FAILED, IF IT DID.

top level, before `CACHE_LAST_ERR`

```
/* WHY THE LAST WRITE FAILED, IF IT DID. A bare `catch {}` on the one operation the whole cache
   depends on means a store that never works looks exactly like a store that works — which is the
   state this spent a day in. Held in a variable rather than logged, so `testCache` can report it. */
```

### RUN THIS AND IT TELLS YOU IN WORDS.

top level, before `testCache`

```
/* ==================================================================================================
   RUN THIS AND IT TELLS YOU IN WORDS.

   EVERY QUESTION ABOUT THIS CACHE HAS BEEN ANSWERED BY TIMING A PAGE LOAD, which is the worst
   instrument available: it cannot tell a cache that is off from a cache that is on and failing, and
   it cannot tell either of those from Google having a slow minute — and Apps Script's own variance
   on the same work has been eighteen, thirty-five and fourteen seconds.

   SO IT ASKS THE CACHE DIRECTLY. Store a payload-sized string, read it back, compare, and say what
   happened. Pick `testCache` in the editor's function dropdown, press Run, and read the answer in
   the execution log. Nothing to install and nothing to measure.
================================================================================================== */
```

### AND THE PART THAT ACTUALLY BREAKS:

in `testCache`

```
/* AND THE PART THAT ACTUALLY BREAKS: whether the key a visitor produces is the same key twice
     running. A cache that works perfectly and is asked a different question each time is a cache
     that never hits, and that failure looks exactly like this one from the outside. */
```

### THE QUESTION THAT MATTERS IS NO LONGER "is the warmer on".

in `testCache`

```
/* THE QUESTION THAT MATTERS IS NO LONGER "is the warmer on". It is whether the spreadsheet tells
     us when you edit it — see `installSheetWatch`. A missing five-minute warmer costs one visitor a
     slow load every six hours; a missing edit watch means the site shows the old sheet for six
     hours, which is not slowness, it is being wrong. So the watch is the warning and the warmer is
     a remark. */
```

### ---------- WHO GETS WHOSE COPY

top level, before `payloadKey_`

```
/* ---------- WHO GETS WHOSE COPY -------------------------------------------------------------------
   THE PAYLOAD IS NOT THE SAME FOR EVERYBODY. `person` decides which posts come back marked as liked
   and which orders are yours; `name` decides `viewerIsAdmin`, which decides whether unlisted tutors,
   deleted posts and the print queue are in there at all. Two people sharing a cache entry across
   that line would be one of them seeing the other's answer, so both go in the key.

   EVERYTHING ELSE IS A DIFFERENT ENDPOINT — `setup`, `run`, `map`, `receipts` and the rest all
   return before the payload is built — so a request carrying one of them is not cached at all
   rather than being given a key it would never hit twice. */
```

### ---------- KEYED ON WHO THE TOKEN SAYS, NEVER ON WHO THE URL SAYS

top level, before `payloadKey_`

```
/* ---------- KEYED ON WHO THE TOKEN SAYS, NEVER ON WHO THE URL SAYS ----------------------------------
   IT WAS `person|name`, OFF THE QUERY STRING, and `doGet` stopped believing either of those for
   identity a while ago — `askedBy_()` resolves the token instead. The cache was never told. So the
   key a stranger produced by typing `?person=P001&name=<the admin's name>` into the address was the
   admin's own key, and the stored body behind it was the ADMIN'S payload: every child in
   `students`, every unlisted tutor, the films. Measured in a harness with a Map-backed cache: a
   stranger with no token got `cached:true`, `students=1`. And the other way round — a stranger asking
   first stored the ANONYMOUS view under the admin's key, and the admin's own signed-in load was then
   handed that. The warmer did the second one every five minutes, because it asked with `person` and
   `name` and no token.
   `viewer` IS THE PERSON ID THE TOKEN RESOLVED TO, or '' for nobody. Person ids are sequential and
   names are printed on screen, so anything in the URL is public knowledge; a token is not. */
```

### THE VERSION AND THE GENERATION ARE BOTH IN IT.

in `payloadKey_`

```
/* THE VERSION AND THE GENERATION ARE BOTH IN IT. The version so a deploy cannot serve a body
     built by the code before it; the generation so `clearPayloadCache` can invalidate everything
     at once without being able to list what it stored. */
```

### ---------- `retirePayloadOf_` WAS HERE — RETIRING A FEW PEOPLE'S PAYLOADS, NOT EVERYBODY'S

top level, before `payloadGen_`

```
/* ---------- `retirePayloadOf_` WAS HERE — RETIRING A FEW PEOPLE'S PAYLOADS, NOT EVERYBODY'S ----------
   ITS ONE CALLER WAS `markDone`, which threw away a child's whole stored payload (and every admin's) for
   one date, so the child's next load anywhere was a cold rebuild. The stored body no longer carries
   `attempts`, nor `submissions` which replaced it — `doGet` adds them fresh for the token's person
   (`payloadWithFresh_` in doget.gs) — so
   there is nothing left that a write to one person's rows makes stale, and nothing to retire by key. */
```

### THE CACHE IS FILLED BEFORE ANYBODY ASKS, NOT BY THE FIRST PERSON TO ASK.

top level, before `webAppUrl_`

```
/* ==================================================================================================
   THE CACHE IS FILLED BEFORE ANYBODY ASKS, NOT BY THE FIRST PERSON TO ASK.

   A CACHE ONLY MOVES WHO PAYS. Somebody still walks the thirty tabs and waits the thirty-five
   seconds — it is just the first visitor after each expiry rather than all of them, and on a site
   with a few dozen visits a day that is often the only visitor of the hour. The one who came to
   read about tutoring is the one who pays for everybody else's speed.

   SO A TRIGGER PAYS INSTEAD. Every five minutes this asks the web app for the payload with `warm=1`,
   which rebuilds it and writes it over the stored copy without reading the old one first — so there
   is never a moment when the entry is missing. The slow rebuild happens to a scheduled job with
   nobody watching, and every real request lands on something already built.

   IT CALLS ITS OWN URL rather than building the payload directly, because the payload is built
   inside `doGet` and nothing else can produce one. Going in through the front door means the warmer
   and the visitor are running the same code by construction, which is the only version of this that
   cannot drift.

   THE ADMIN GETS A COPY TOO. `viewerIsAdmin` changes what is in the payload, so an admin's key is
   not the anonymous key and a warmed anonymous entry does nothing for them. Every person whose role
   is admin is warmed as well — usually one, and it is the account most likely to be waiting on it.
================================================================================================== */
```

### CHECKED, NOT TRUSTED.

in `webAppUrl_`

```
/* CHECKED, NOT TRUSTED. Anything in a property is whatever somebody last typed, and a value
       that is not an address makes `UrlFetchApp` throw inside the warmer — where it is caught, and
       so becomes a refresh that silently never runs. Rejected here it falls through to the address
       the service knows for itself, which is right far more often than a stale typed one. */
```

### THE ANONYMOUS KEY AND NO OTHER.

in `warmPayload`

```
/* THE ANONYMOUS KEY AND NO OTHER. It used to warm one key per admin by asking with `person` and
     `name` — and with the cache keyed on the token now (see `payloadKey_`), a request with no token
     is the anonymous visitor whatever it names, so those asks would only have rebuilt the anonymous
     entry again. Before the key changed they were worse than useless: they stored the ANONYMOUS view
     under the admin's key. So an admin's first load after each write builds, which it effectively
     always did. */
```

### MUTED AND FOLLOWED. Apps Script answers a web app with a 302 to a content address, so the redirect has to be followed or nothing is fetched; and an error here

in `warmPayload`

```
/* MUTED AND FOLLOWED. Apps Script answers a web app with a 302 to a content address, so the
         redirect has to be followed or nothing is fetched; and an error here must not stop the
         other keys being warmed, which is the whole reason each is in its own try. */
```

### AN EDIT TYPED INTO THE SPREADSHEET IS A CHANGE TO THE SITE, AND UNTIL NOW IT WAS NOT.

top level, before `EDIT_WARM_DELAY_MS`

```
/* ==================================================================================================
   AN EDIT TYPED INTO THE SPREADSHEET IS A CHANGE TO THE SITE, AND UNTIL NOW IT WAS NOT.

   THE FAULT, IN ONE SENTENCE: `clearPayloadCache` was called after every write THE APP made, and
   after no write YOU made. Type a price into the pricing tab, open the site, and it shows the old
   price — for up to six hours, because `PAYLOAD_TTL` is six hours and nothing was ever going to
   move the generation number that would retire the stored copy.

   THAT IS INDISTINGUISHABLE FROM THE EDIT NOT HAVING SAVED. The cell is right there with the new
   number in it, the deploy is current, the site answers instantly — and answers with yesterday's
   sheet. Every instinct then says the spreadsheet is not connected to the site at all, which is the
   one thing it is; the only broken part was the sentence "a write invalidates immediately", which
   was true of the app's writes and quietly false of yours.

   SO THE SPREADSHEET TELLS US. `onSheetChange` is an INSTALLABLE trigger on the file itself: Google
   calls it when a person adds a row, deletes one, or changes a cell, and the first thing it does is
   retire the stored payload. From that moment the next request rebuilds from the sheet. There is no
   interval to wait out and nothing to press.

   IT DOES NOT FIRE FOR THE APP'S OWN WRITES, and must not be relied on to: Apps Script does not
   trigger itself. That path is still `POST_WROTE` → `clearPayloadCache`, which is untouched. The
   two cover the two ways a row can change and neither covers the other.

   AND THEN IT REBUILDS, ONCE, A MINUTE LATER.

   Retiring the copy is correctness; it is not speed. The next visitor after an edit would pay the
   full thirty-five-second rebuild, which is the bill this cache exists to stop anybody being
   handed. But rebuilding ON the edit is worse: filling in a row is fifteen edits in ninety seconds,
   so fifteen rebuilds would be queued for a sheet that is still being typed into, and the last one
   is the only one whose answer is worth keeping.

   `scheduleWarmAfterEdit_` COALESCES THEM. The first edit books a single one-off job for a minute
   from now; every edit during that minute finds one already booked and books nothing. Whenever you
   stop typing, one rebuild runs against the finished sheet. A burst of fifty edits costs exactly
   what one edit costs.

   THE MINUTE IS NOT A DELAY YOU WAIT OUT. The generation moved on the first keystroke, so the site
   is already telling the truth throughout — the rebuild only decides whether the truth arrives fast
   or slowly. Open the site a second after an edit and you get the new value and a slow load; open it
   two minutes later and you get the new value instantly.
================================================================================================== */
```

### How long a booked rebuild is believed in.

top level, before `WARM_BOOKING_MS`

```
/* How long a booked rebuild is believed in. Past this the booking is treated as lost and a new one
   is made — a trigger that failed to create, or a run that died before it could tidy up, would
   otherwise block every future rebuild for ever, and the symptom would be the old one exactly:
   edits that are correct but permanently slow. */
```

### SOMEBODY CHANGED THE SPREADSHEET BY HAND.

top level, before `onSheetChange`

```
/**
 * SOMEBODY CHANGED THE SPREADSHEET BY HAND. Installed by `installSheetWatch`.
 *
 * Deliberately tiny and deliberately unconditional. `e.changeType` distinguishes EDIT from
 * INSERT_ROW from REMOVE_ROW and so on, and not one of those distinctions matters here: every one
 * of them can change what the site shows, and the cost of being wrong is a stale site rather than
 * one property write. So it does not ask.
 *
 * NOTHING IN HERE MAY THROW. A trigger that fails is disabled by Google after enough failures, and
 * a disabled trigger is silent — which would put us straight back where we started, with the added
 * cruelty that the fix would appear to be installed.
 */
```

### THE BOOKED REBUILD. Tidies itself away first, then builds.

top level, before `warmAfterEdit`

```
/**
 * THE BOOKED REBUILD. Tidies itself away first, then builds.
 *
 * A one-off time trigger is NOT removed by Google when it fires — it sits in the project's list of
 * twenty for ever. Left there, a week of editing exhausts the quota and then no trigger of any kind
 * can be created, including the nightly ones. So the first thing it does is delete every trigger
 * bearing its own name, this one included, which is allowed and is the only reliable moment to do it.
 *
 * THE BOOKING IS RELEASED BEFORE THE BUILD, NOT AFTER. The build takes about thirty-five seconds and
 * reads the sheet as it is when it starts; an edit made during it is therefore NOT in what gets
 * stored, and must be able to book the next rebuild. Released afterwards, that edit would be
 * swallowed and the stored copy would stay wrong until something else moved.
 */
```

### PUT THE WATCH ON THE SPREADSHEETS.

top level, before `installSheetWatch`

```
/**
 * PUT THE WATCH ON THE SPREADSHEETS. Run once; safe to run again.
 *
 * ONE PER FILE, because a trigger watches a file and the data lives in more than one. A watch on
 * only the ledger means editing the pricing tab changes nothing on the site, which is the original
 * fault surviving in half the sheet and is far harder to spot than the whole of it.
 *
 * SO IT HAS TO BE RE-RUN WHEN `FILES` CHANGES, and that is the sharp edge: this function deletes
 * every trigger by handler name and rebuilds one per id in `FILES`, so a file removed from that
 * list keeps its trigger until somebody runs this again. `Library` left on 2026-09-17 and its
 * trigger is still booked against a spreadsheet nothing reads — harmless, and still a rebuild
 * nobody needs, once a minute, after every edit somebody makes to it.
 *
 * THE IDS ARE DEDUPED. `FILES` maps both names to the same id when everything lives in one file,
 * and two triggers on one spreadsheet means two bumps and two bookings per keystroke.
 *
 * IT REPORTS PER FILE RATHER THAN THROWING. A file the account cannot open should not stop the one
 * it can — and "subjects failed, main installed" is the sentence that names the problem, where a
 * thrown error names only the first thing that went wrong.
 */
```

### Any formula_* row is skipped.

in `config`

```
/* Any formula_* row is skipped. They're no longer seeded, but a sheet that has them from
       before must not have them read as coefficients — a row whose value is the sentence
       "per hour x h x sessions" would otherwise be looked up as a number and come back NaN. */
```

### ---------- THE CONFIG TAB AS A PHONE MAY SEE IT

top level, before `configPublic_`

```
/* ---------- THE CONFIG TAB AS A PHONE MAY SEE IT ---------------------------------------------------
   EVERYTHING BUT `CONFIG_PRIVATE`. `doGet` sends this as `constants.vars` to every visitor; the
   server's own readers go on calling `config()`, which still has every key. A copy rather than a
   delete, because `config()`'s object is the one `filmsRoot_` and the pricing read within the same
   request. */
```

### ---------- `printPrice` AND `canPrint` WERE HERE, AND THE BACKEND NO LONGER PRICES PAPER

top level, before `allOptions`

```
/* ---------- `printPrice` AND `canPrint` WERE HERE, AND THE BACKEND NO LONGER PRICES PAPER ---------
   A PRINT COSTS PAGES x RATE, floored at a minimum, and null rather than £0.00 when nobody has
   counted the pages — because zero pages means uncounted and a free price is the site answering a
   question it has not asked anybody. That argument still holds and the code that holds it still
   exists; it is just not here any more.

   THE THREE CALLERS WENT IN ONE CHANGE. `orderPrints` priced a basket, the health check counted
   what could not be sold, and the `?run` report printed the rate — all three read a document row
   off the `questions` tab, and that tab is `data/questions.json` in this repository now.

   IT IS COMPUTED ON THE PHONE INSTEAD, twice and deliberately: `printPrice` / `canPrint` in
   js/find.js for a card, and `libPrintPrice_` / `libCanPrint_` in js/library.js while the
   checklists are built. Both read `print_rate_per_page` and `print_minimum` off `constants.vars`,
   which is the same config tab this did, so the figure has not moved — only what computes it.

   AND THAT IS A REAL LOSS IF A CHECKOUT IS EVER BUILT. A total worked out on the phone is a total
   the client chose, which is exactly why `orderPrints` re-priced everything server-side and said so
   at length. Whatever takes payment will have to price it somewhere the client cannot reach — and
   the page counts it needs are in a file in git, not in a cell. Worth knowing before, not during.

   `driveIdFrom` in content.gs went the same way and for the same reason: it pulled a file id out of
   a document's `source_url` so a PDF could be counted. The posts folder uses `folderIdFrom`, which
   is a different function and stays. */
```

### `optionList` was here — one named list from the options tab.

top level, before `allOptions`

```
/* `optionList` was here — one named list from the options tab. `allOptions` returns every list in
   a single pass and the payload has used that since it was written, so this read the same tab again
   to answer a smaller question nobody asked. */
```

### WHAT KIND OF THING each option is — academic, sporty, creative, and so on.

top level, before `optionFocus`

```
/**
 * WHAT KIND OF THING each option is — academic, sporty, creative, and so on.
 *
 * Kept beside the lists rather than inside them, because everything that reads a list wants the
 * plain values: a dropdown of subjects should be a dropdown of subjects, not of objects. Anything
 * that wants the focus asks for it separately.
 */
```

### ---------- A PERSON'S OWN ROWS ON A LIST TAB

top level, before `ownRows_`

```
/* ---------- A PERSON'S OWN ROWS ON A LIST TAB -------------------------------------------------------
   THE PEOPLE TAB WAS REDESIGNED so a list is a tab, one row per thing, keyed by `person_id` — see
   the note over `SCHEMA.people`. `qualifications` and `library_cards` are the two, and both are
   read and written the same way, so the reading and the writing are here once.

   READ IN SHEET ORDER, which is the order they show on the card and on the form — so an admin who
   drags a row up in the sheet has reordered it everywhere. `read()` is cached per request, so the
   whole tab is walked once however many people ask. */
```

### AND WRITTEN IN PLACE, NOT DELETED AND APPENDED.

top level, before `writeOwnRows_`

```
/* AND WRITTEN IN PLACE, NOT DELETED AND APPENDED. The first rows this person already has are
   overwritten with the new list in order (`setCells` skips a cell that already holds the value, so
   a Save that changed nothing writes nothing and does not retire the payload); anything more is
   appended, and anything left over is deleted from the BOTTOM UP, because `delRow` shifts every
   row under the one it removes and deleting top-down would delete the wrong ones. Returns how many
   cells or rows actually changed. */
```

### ---------- THE LIBRARY CARDS: ROWS ON `library_cards`, NINE BOXES ON THE FORM

top level, before `libCardsOut`

```
/* ---------- THE LIBRARY CARDS: ROWS ON `library_cards`, NINE BOXES ON THE FORM ----------------------
   The form is unchanged — `lib1_name`, `lib1_no`, `lib1_pin` … — so these turn rows into boxes and
   boxes back into rows. A card with nothing in any of its three boxes is not a card and is not
   written; the order of the rest is kept, so the form comes back as it was typed. */
```

### ---------- THE EXTRA PHOTOGRAPHS: EIGHT BOXES, ONE CELL

top level, before `photosOut`

```
/* ---------- THE EXTRA PHOTOGRAPHS: EIGHT BOXES, ONE CELL -------------------------------------------
   `posts.media`'s shape on the people tab — links joined by ` | ` — so a person's gallery and a
   post's gallery are the same kind of cell. Expanded into `photos_1…8` for the form and packed back
   from them, the library shelf's arrangement with two differences, both because this is a LIST rather
   than a set of slots:
   - A GAP CLOSES UP. `libCardsIn` keeps an empty second card so the third does not move under
     somebody; a photograph has no slot of its own to be in, and a blank in the middle of a gallery
     draws as nothing, so it is simply not kept.
   - THE SAME LINK TWICE IS ONE PHOTOGRAPH. Pasting a link again is the commonest way to get a
     duplicate, and the card would draw the same picture twice side by side.
   A PIPE IN A LINK IS ESCAPED, NOT STRIPPED: `%7C` is what a browser would send for it anyway, so the
   address still works, where a space in its place would break it — and left alone it would split
   one photograph into two on the next read. */
```

### A PHOTOGRAPH IS A LINK, AND ANYTHING ELSE IS REFUSED BY NAME rather than kept.

top level, before `photosRefusal_`

```
/* A PHOTOGRAPH IS A LINK, AND ANYTHING ELSE IS REFUSED BY NAME rather than kept. The card draws each
   one as an `<img>`, and a note typed into the box draws as a broken picture on a public profile;
   dropping it silently is the other half of the same fault — something typed, gone, under a toast
   saying Saved. `doPost` is reachable by anybody with the URL, so the form's own `type="url"` is not
   a reason to trust it. In core.gs beside the packer so something can run it (`check-people.js`). */
```

### THE LIST THE CARD DRAWS:

top level, before `photosList_`

```
/* THE LIST THE CARD DRAWS: the extras, without the face. A link already used as `photo` is left out,
   because the card draws the face at the top and the same picture again in the grid under it is one
   photograph twice. Only addresses — a cell typed straight into the sheet is not checked by the
   refusal above, and an `<img>` pointed at a sentence is a broken picture. */
```

### ---------- THE FACE CELL: A LINK, NOTHING, OR ONE OF ELEVEN TOKENS — AND THIS IS THE ONE PLACE IT IS ASKED

top level, before `photoChoice_`

```
/* ---------- THE FACE CELL: A LINK, NOTHING, OR ONE OF ELEVEN TOKENS — AND THIS IS THE ONE PLACE IT IS ASKED
   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox
   dp selector, which allow you to use your avatar as a dp."* `photo` keeps every link it ever held —
   an uploaded photograph is a Drive address and an admin can still paste one — and gains the tokens
   in `PFP_CHOICES` (constants.gs). Anything else is refused BY NAME, the `photosRefusal_` argument
   above: every reader draws this cell, and a note typed into it is a broken face on a public card.

   `photoChoice_` ANSWERS THE TOKEN OR NOTHING, trimmed and lower-cased, so `PFP:Fox ` from a hand in
   the sheet reads the same as the phone's `pfp:fox` and nothing near-miss is ever kept as one.
   `photoRefusal_` is what `updateProfile` asks of a `photo` it is sent; `savePhoto` asks `photoChoice_`
   directly because its door takes a token and never a link (the picker sends none). One list, two
   doors, one reader — a second regex for "is this a picture token" is the drift this file keeps
   recording. */
```

### ---------- AND WHEN THE FACE IS YOUR FIGURE, THE FIGURE GOES WITH IT, AND NOT OTHERWISE

top level, before `faceFig_`

```
/* ---------- AND WHEN THE FACE IS YOUR FIGURE, THE FIGURE GOES WITH IT, AND NOT OTHERWISE ----------------
   `pfp:avatar` means "draw my wardrobe figure", which the phone cannot do for somebody else without
   that person's `avatar` string. So a row that carries the face (a tutor, a family card, an admin's
   people column, a post's author) carries the figure too — BUT ONLY WHEN IT IS THE FACE. Everybody
   who chose a photograph or a fox sends exactly what they sent before; the only new thing on any
   card is what its owner asked to show, to the people who could already see that person's picture.
   A CHILD'S ROW ON `students` IS NOT ONE OF THESE: it carries no face at all, and nothing here adds one.
   Returned as an object so a caller writes `Object.assign({...}, faceFig_(r))` and an empty answer
   adds no key at all — absent and empty are different facts to the phone (`personFace_`). */
```

### ---------- THE VENUES A TUTOR IS HAPPY TO TEACH AT, WHICH THE VENUES TAB ALREADY RECORDED

top level, before `venuesPersonIs_`

```
/* ---------- THE VENUES A TUTOR IS HAPPY TO TEACH AT, WHICH THE VENUES TAB ALREADY RECORDED ---------
   ASKED FOR AS *"in account setting tutors should be able to select the venues they are comfortable
   tutoring at."* The fact had a home long before the ask: `venues.tutors_happy_here`, a comma list of
   people per venue, sent to every phone as `comfort` and written by a `toggleVenueComfort` handler
   that NOTHING HAS EVER CALLED — the `orderPrints` shape. A `venues_ok` column on `people` would have
   been a second copy of the same fact, the `needs_print` / `print_required` shape that cost 356 rows
   of disagreement. So there is no new column: the settings form reads and writes this one.

   `venues_ok` IS A FORM NAME, NOT A CELL, which is the packed-cell arrangement pointed at another
   tab: `updateProfile` keeps it out of `wanted`, `profileOf_` expands it, and these two functions are
   the only readers and the only writer.

   AN ENTRY NAMES A PERSON BY ANY OF THE WAYS THIS SHEET HAS: the rows already hold a handle, an
   admin typing into the tab will type a name, and a new entry is written as the PERSON_ID, because
   an id is the one of those that survives a randomised handle and a rename. `key` on both sides. */
```

### WHAT EACH VENUE'S CELL SHOULD HOLD once this person has chosen `names`.

top level, before `venuesWrites_`

```
/* WHAT EACH VENUE'S CELL SHOULD HOLD once this person has chosen `names`. Only the cells that change
   are returned, so a Save that moves nothing writes nothing — `setCells`' own rule, one tab along.
   Entries naming somebody else are left exactly as they were. */
```

### IN PLACE, NOT MOVED TO THE END.

in `venuesWrites_`

```
/* IN PLACE, NOT MOVED TO THE END. `others.concat(mine)` re-ordered the cell on every Save, so a
       Save with nothing touched still wrote it and retired the payload. Keep the first entry that is
       this person where it stands; append only when they are not there at all. */
```

### ---------- QUALIFICATIONS: ROWS ON `qualifications`, FORTY BOXES ON THE FORM

top level, before `qualsList_`

```
/* ---------- QUALIFICATIONS: ROWS ON `qualifications`, FORTY BOXES ON THE FORM ------------------------
   ONE ROW PER QUALIFICATION, `person_id, subject, level, grade, institution, completed, teach,
   can_teach` — see `SCHEMA.qualifications`. The form is unchanged: `qual_N`, `qual_N_level`,
   `qual_N_board` (the institution — the slot kept its old name so the page did not move),
   `qual_N_grade`, `qual_N_received` (the year, or `Present`), `qual_N_spec` (the `teach` column:
   the one level a tutor specialises in) and `qual_N_teach` (`can_teach`).

   A RECORD HERE IS `{ subject, level, board, grade, received, teach, spec }`, which is the shape
   every caller already had — `board` is the institution and `received` is `completed` — so the
   readers of this function did not change when the storage did.

   WHAT YOU TEACH IS TAUGHT, AND IT MAY BE SEVERAL LEVELS. It was one on the whole page — the
   phone unticked every other Teach — and that was reported as *"when i tick teach for different
   levels of same subject it unticks the other one. i dont want that"*. So every `teach` row is a
   Teach; the only rule kept is that Teach implies Can teach. */
```

### WHAT A TUTOR TEACHES, AS THE CARD PRINTS IT — `Maths (GCSE)` — derived from the ticks rather than kept in a column of its own.

top level, before `teachPhrase_`

```
/* WHAT A TUTOR TEACHES, AS THE CARD PRINTS IT — `Maths (GCSE)` — derived from the ticks rather than
   kept in a column of its own. It used to be `teaches_1`, `teaches_2` and `teaches_also`, three
   copies of one fact written by `updateProfile` and read by `doGet`; now there is one. The
   specialism first, then everything else taught, deduped. */
```

### ---------- A QUALIFICATION AS ITS PARTS, AND THE SENTENCE OFF THE SAME PARTS

top level, before `QUAL_CERTS`

```
/* ---------- A QUALIFICATION AS ITS PARTS, AND THE SENTENCE OFF THE SAME PARTS ----------------------
   ASKED FOR AS *"for the qualifications bit, should be for example Maths subscript to it is grade and
   super script is the level."* — so the card writes a qualification the way an isotope is written:
   `Maths` with `A-Level` raised and `B` lowered beside it, one over the other. A card cannot draw that
   from `quals`, which is a SENTENCE ("Maths A-Level grade B at Hill Top School (2019)"), and taking the
   sentence apart again on the phone is guessing where `English Language` stops and its level starts.
   So the parts are SENT, as `qualsParts`, beside the sentences rather than instead of them: a phone
   built before this reads `quals` and draws exactly what it drew.

   ONE LIST, BOTH KEYS. `qualsParts_` is the list and `qualSentence_` writes the sentence from one
   entry of it, so the two keys are the same length, in the same order, with the same rows dropped (a
   row with no subject is a level of nothing, and the card has never drawn one). The sentence is
   byte-for-byte what `doGet` wrote inline before it moved here — `check-people.js` holds it to that.

   `kind` IS `cert` FOR A THING HELD RATHER THAN A SUBJECT STUDIED — a PGCE, a DBS, First Aid — and
   the card draws those as plain chips: `DBS` with `Enhanced` raised over nothing is notation for a
   certificate that has no grade to lower. Decided by the subject being one of the certificates the
   shelf offers at the foot of its subject list (`QUAL_SUBJECTS` in me.js), or by the level being one
   of the three a DBS comes at (`QUAL_LEVELS`). Those are the phone's lists and this is a copy of
   their tails, so `check-people.js` reads me.js and fails if a name here is not on the shelf there —
   a certificate renamed on one side and not the other would otherwise turn into notation silently.
   A DEGREE IS NOT A CERTIFICATE: `Maths` at `Bachelor's degree` with a `2:1` is a subject at a level
   with a grade, which is exactly what the notation says. */
```

### WHERE, AFTER THE GRADE:

top level, before `qualSentence_`

```
/* WHERE, AFTER THE GRADE: "Maths A-Level grade B at Hill Top School". The `board` slot holds the
   school, college or university now, not the exam board — see `qualLevel_` in me.js. AND WHEN:
   "studying now" for `Present`, the year otherwise — the studying row the card used to draw is this
   qualification now. Joined on the server so a card and a roster cannot disagree about how a
   qualification is written. */
```

### ---------- A DATE OF BIRTH, AS THREE BOXES AND BACK

top level, before `phoneOut`

```
/* ---------- A DATE OF BIRTH, AS THREE BOXES AND BACK ----------------------------------------------
   `libCardsOut` / `libCardsIn` ONE CELL ALONG, degenerate to a single value. The reason it is the
   same shape rather than three columns is the reason written over `LIBRARY_FIELDS` and over
   `images` and `needs` before it: a column per box is a schema change in the data, the mapping, the
   renderer and the check, and this cell already exists and is already read by four things.

   `sheetDate` RATHER THAN SPLITTING THE STRING, and that is what repairs a live fault on the way
   past. Sheets stores a date typed into a spreadsheet as a real Date, and `profileOf_` sent it with
   `S(r.date_of_birth)` — so the box rendered `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer
   Time)`, the `S(c.said_on)` fault this repository records for comment timestamps, on a field
   somebody is expected to edit. Going through `sheetDate` means a real Date and a `dd/mm/yyyy`
   string both come apart correctly, and the box gets a number either way.

   BLANK IS BLANK. All three empty writes an empty cell rather than `//`, so clearing a birthday
   clears it. A PARTIAL is refused rather than written — see `dobRefusal_` — because `15//1985` is
   `null` to `sheetDate`, which is a birthday that vanishes off the calendar with nothing anywhere
   saying why. */
```

### THE PHONE CELL AS TWO BOXES.

top level, before `phoneOut`

```
/* THE PHONE CELL AS TWO BOXES. `+44 7700 900123` comes apart on the LONGEST code in
   `PHONE_CODES` that prefixes its digits, so `+353…` is Ireland rather than `+3`. A number typed
   before there was a code — `07700 900123` — is read as UK, with the trunk 0 off, because that is
   what every one of those cells in this sheet is; `0044…` is `+44…`. Anything else keeps its
   digits and gets the default code, so nothing typed is ever thrown away. */
```

### A NUMBER TYPED WITH ITS OWN CODE — `+44 7700 900123`, or `0044 …` — had the code put on a second time:

in `phoneIn`

```
/* A NUMBER TYPED WITH ITS OWN CODE — `+44 7700 900123`, or `0044 …` — had the code put on a
     second time: `+44 44 7700 900123`, and `phoneOut` then split that as +44 / `44 7700…`, so the
     doubled form came back on every Save. The chosen code's digits come off the front first. */
```

### ---------- A REAL DATE, OR THE ONE WRITTEN FORM — AND NOTHING ELSE

in `dobOut`

```
/* ---------- A REAL DATE, OR THE ONE WRITTEN FORM — AND NOTHING ELSE --------------------------
     `sheetDate` ENDS IN `new Date(t)`, WHICH IS FAR TOO WILLING. Measured: `sometime in 85` comes
     back as 1 January 1985 — not null, a real Date — so calling it here and trusting the answer
     would draw a confident wrong birthday into three boxes, and the next Save would write it. That
     is the `parseWhen` fault one file along, where an unanchored branch matched first and read
     `2026-09-15` as 26 September 2015.

     SO THIS ASKS THE NARROW QUESTION ITSELF: a real Date object, which is what Sheets stores, or a
     string of the exact shape this app writes. Anything else is somebody's own typing and is KEPT
     rather than blanked — silently emptying a cell because a function could not read it is how a
     birthday is lost by opening a form. The day box carries it, so it is visible and editable.
     `sheetDate` is still the authority on what a date MEANS; what it is not is a test of whether
     a string is one. */
```

### ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE

top level, before `dobRefusal_`

```
/* ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE --------------------------------------
   BESIDE `handleRefusal` AND `pricingRefusal_` IN SHAPE, and for their reason: a rule written
   inline in `updateProfile` is a rule nothing can run. It returns the sentence rather than a
   boolean, because "fill in all three" and "there is no 31st of February" are different things to
   be told and a person given the wrong one argues with the wrong thing.

   A PARTIAL IS THE ONE THAT MATTERS. `15//1985` and `15/9/` are both `null` to `sheetDate`, so
   without this the birthday disappears from the calendar and the form says Saved — this
   repository's oldest shape, on the one field somebody only fills in once. */
```

### THE REAL LENGTH OF THAT MONTH IN THAT YEAR, which is what makes 29/02 right in 2024 and wrong in 2023.

in `dobRefusal_`

```
/* THE REAL LENGTH OF THAT MONTH IN THAT YEAR, which is what makes 29/02 right in 2024 and wrong
     in 2023. `new Date(y, m, 0)` is the last day of month `m`, and it is built from numbers rather
     than from a string so nothing has to guess at a format. */
```

### ---------- A DATE AS `yyyy-mm-dd`, WHICH IS THE ONE FORM A DATE PICKER SPEAKS

top level, before `isoDate_`

```
/* ---------- A DATE AS `yyyy-mm-dd`, WHICH IS THE ONE FORM A DATE PICKER SPEAKS -------------------
   WHY THIS EXISTS BESIDE `dobOut` RATHER THAN INSTEAD OF IT — a real decision, and the opposite one
   on purpose. The note over `DOB_FIELDS` refuses `type="date"` for a birthday and gives four
   reasons; for an exam date three of them fall away and the load-bearing one INVERTS:

     · a birth year is forty years of scrolling on a picker that opens on today. An exam is weeks
       away, so a picker opening on today is the shortest route to it rather than the longest.
     · `inputmode` and `maxlength` are ignored by a date input — irrelevant, there are no boxes.
     · it draws its own chrome this stylesheet cannot reach — still true, and the price of getting a
       real calendar, a weekday, and a value the platform has already validated.
     · its value is ISO rather than the `dd/mm/yyyy` this sheet writes elsewhere — which is what
       this function is for.

   And one argument a birthday could not have: somebody picking an exam date wants to see which day
   of the week it falls on, which only a calendar can say.

   NO `new Date(<string>)` ANYWHERE IN IT, and that is the whole care. `sheetDate` ends in exactly
   that, and `new Date('2027-05-14')` is UTC MIDNIGHT — so in any timezone behind UTC it reads back
   as the 13th, which is the `parseWhen` fault this repository records reading `2026-09-15` as 26
   September 2015. A real Date is read through its own local fields; a string is matched and
   re-spelled, never parsed.

   AN UNREADABLE CELL COMES BACK EMPTY, and that is a stated cost rather than an oversight. `dobOut`
   can keep a value it cannot parse — it puts it in the day box, visible and editable — and a date
   input cannot hold one at all: a non-ISO value is silently rejected by the control. So a hand-typed
   "after half term" in one of these cells draws an empty picker, and the next save of that page
   writes the empty over it. Acceptable here because these two columns are brand new and written by
   one control; it would not be acceptable on a column somebody has been typing into for a year. */
```

### ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE

top level, before `isoRefusal_`

```
/* ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE -----------------------------------------
   BESIDE `dobRefusal_`, `handleRefusal` AND `pricingRefusal_` IN SHAPE, and for their reason: a rule
   written inline in `updateProfile` is a rule nothing can run.

   THE CONTROL CANNOT PRODUCE A BAD VALUE, WHICH IS NOT A REASON TO SKIP THE CHECK. A date input
   yields `yyyy-mm-dd` or nothing — so every refusal here is about a request that did not come from
   the form, and a handler that trusts its own form is a handler that trusts anybody's. The calendar
   test is the same `new Date(y, m, 0)` as the birthday's, and for the same reason: it is what makes
   29/02 right in 2028 and wrong in 2027.

   NO "IS IT IN THE FUTURE" TEST, deliberately. A birthday in the future is always a mistake; an
   exam date in the past is an exam already sat, which is a fact a student's own page may hold for
   months afterwards. */
```

