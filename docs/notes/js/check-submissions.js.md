# js/check-submissions.js

The full text of comments in `js/check-submissions.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-submissions.js — EVERY ANSWER SENT IS AN EVENT, ASKED OF THE REAL BACKEND

top level, before `fs`

```
/* ==================================================================================================
   node js/check-submissions.js — EVERY ANSWER SENT IS AN EVENT, ASKED OF THE REAL BACKEND

   THE OWNER, 9 OCT: *"I just want system to record each submition. So like if they submit a correct
   answer then change it and submit an incorrect answer, that's 2 events. And it will leave the latest
   event up, so they would see incorrect answer there next time they login. Simple. Instead of each
   question just saving number of attempts."*

   The phone half is js/submit.js and `check-flow.js` presses it; this is the half that writes a
   learner's record and decides who may read it, and every rule below fails quietly if it fails at all:

     · A ROW PER PRESS, APPENDED. Right then wrong is two rows, and the latest — the later one — is what
       every load says. Nothing is ever updated or deleted.
     · A RETRIED PRESS IS ONE ROW. The same id sent twice, in one request or two, is written once and
       answered both times as saved, with the row's own time.
     · THE PERSON IS THE TOKEN'S. A body claiming another child writes the sender's row. No token, no row.
     · WHAT IS REFUSED IS REFUSED WHOLE: a verdict outside the vocabulary, an id not in the phone's shape,
       an empty answer, one over `ANSWER_TEXT_MAX` — never cut — and the reply leaves each out of `saved`.
     · THE ANSWER IS TEXT: 3/4, 0.50, 2,4 and =1+1 come back exactly as sent. The name and the words
       are kept by the email's own rules (tags out, capped). The time is the server's.
     · WHO IS SENT WHAT: yourself, your latest per question; an admin also everybody's summary and no
       answer of anybody's; another learner and a stranger nothing of anybody else's.
     · NO PAYLOAD IS RETIRED, the generation is untouched, the stored body carries no submissions, and a
       cache HIT has the press just made. The per-person copy of `mine` is read again after a press and
       after an edit typed into the sheet, and not on every load.
     · NOTHING READS OR WRITES `attempts` ANY MORE — not the backend, not the phone — and `markDone` is
       refused at the gate. (One read, named: `subMigrate_` reads an OLD backend's `DATA.attempts` once,
       to carry what a child did before the switch across. See section 6.)
     · THE LATEST IS THE LATEST PRESSED, NOT THE LAST TO ARRIVE (`pressed_at`, review of 9 Oct): the
       iPad's older "wrong" sent after the computer's newer "right" does not become the latest; a
       phone's clock ahead of the server's is held to the server's; a row from before the column falls
       back to `submitted_at`.
     · A PRESS DOES NOT READ THE WHOLE TAB UNDER THE LOCK (review of 9 Oct): `submitAnswer` reads the
       person and id columns alone, and a load never reads `label` or `words`.
     · THE OWNER UPDATES IN PLACE (10 Oct): `ensureSchema` over a live Ledger adds `pressed_at` to a
       `submissions` tab that lacks it, and touches no row of the options tab an owner has edited —
       it adds the code's missing values and nothing else, and a second run adds nothing. And it gets
       past a `people` tab with not one spare column, which is how the 4 Oct import left the live one.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`. The people are
   invented and their PINs are 0000.
================================================================================================== */
```

### THE TAB IS READ ONCE PER PERSON PER PRESS, NOT ONCE PER LOAD:

top level, before `count`

```
/* THE TAB IS READ ONCE PER PERSON PER PRESS, NOT ONCE PER LOAD: a second load with nothing new reads it
     not at all, a press makes the next load read it, and an edit typed into the sheet (the generation
     bumped by the edit watch) does too. */
```

### ONE READ IS MEANT, AND IS NAMED:

top level, before `MIGRATE`

```
/* ONE READ IS MEANT, AND IS NAMED: `subMigrate_` in js/submit.js reads `DATA.attempts` — sent only by a
     backend from before 9 Oct — once per person per device, to turn each question done before the switch
     into a submission (decided 10 Oct: no child loses their progress). It is cut out before the rules
     run, and asked of on its own: it reads, it never writes `DATA.attempts`, and it posts nothing. */
```

### ---------- 7. THE LATEST IS THE LATEST PRESSED, NOT THE LAST TO ARRIVE

top level, before `b`

```
/* ---------- 7. THE LATEST IS THE LATEST PRESSED, NOT THE LAST TO ARRIVE ------------------------------------
   THE REVIEW OF 9 OCT: between the front end going live and the owner's Apps Script steps every press is
   queued on its device. "Wrong" on the iPad at T1, "right" on the computer at T2; the computer loads first
   after the deploy and sends its press; the iPad's arrives after it. Ordered by arrival, the iPad's older
   "wrong" became the latest, and the computer's next load wrote it over the box that had sent "right". */
```

### A ROW FROM BEFORE THE COLUMN:

top level, before `at`

```
/* A ROW FROM BEFORE THE COLUMN: blank `pressed_at`, so its arrival stands in — here half an hour ago,
     which is later than a press made an hour ago that sits ABOVE it in the sheet. Read as no time at
     all, the older press would win. */
```

### ---------- 8. A PRESS DOES NOT READ THE WHOLE TAB UNDER THE LOCK

top level, before `b`

```
/* ---------- 8. A PRESS DOES NOT READ THE WHOLE TAB UNDER THE LOCK -----------------------------------------
   THE REVIEW OF 9 OCT: every press held the site's only script lock while `read(TAB.submissions)` fetched
   every column of every row ever sent — a question's words on each — to find whether one id was there.
   Each `getValues` on the submissions tab is recorded here, by its shape. */
```

### ---------- 9. THE OWNER UPDATES IN PLACE: ensureSchema ADDS, AND TOUCHES NO ROW OF THEIRS

top level, before `b`

```
/* ---------- 9. THE OWNER UPDATES IN PLACE: ensureSchema ADDS, AND TOUCHES NO ROW OF THEIRS ----------------
   DECIDED 10 OCT, from a count-only read of the live Ledger: no replacement spreadsheet. The owner pulls
   backend/, runs `ensureSchema`, and makes a new version. So `ensureSchema` must add what is missing and
   leave every row as it is — and `seedOptions`, which it calls, REWROTE the options tab (145 rows the
   owner has edited today): the code's four lists rebuilt, every other row closed up, and the `focus`
   column left where it was while the rows moved under it. */
```

### ---------- 9b. AND THE LIVE `people` TAB HAS NOT ONE SPARE COLUMN (review of 10 Oct)

top level, before `b`

```
/* ---------- 9b. AND THE LIVE `people` TAB HAS NOT ONE SPARE COLUMN (review of 10 Oct) -----------------------------
   SECTION 9 PASSED AND THE OWNER'S STEP WOULD STILL HAVE FAILED. The 4 Oct xlsx import sized `people` to its
   content — a grid of exactly 61 columns — and `ensureSchema` writes a missing header with `getRange`, which
   refuses a range past the grid. So it threw on `people`, the FIRST name in SCHEMA, and nothing after it ran:
   no `submissions`, no `answers`, no config row, and the sheet looked merely untouched. This harness could not
   see it, because its tabs had no edge; `grid()` gives `people` the one the import left. Asked here because
   this is the section that says the owner updates in place. */
```

### ---------- 10. A DEVICE'S CLOCK ERROR IS TAKEN OUT, NOT ONLY A FAST ONE HELD (review of 10 Oct)

top level, before `b`

```
/* ---------- 10. A DEVICE'S CLOCK ERROR IS TAKEN OUT, NOT ONLY A FAST ONE HELD (review of 10 Oct) --------------------
   `pressed_at` was clamped to the server's now, and a SLOW clock went through as it was: the computer's "15"
   an hour ago, then an iPad two hours behind changing it to "16" and pressing now — stored two hours ago,
   so the account's latest was the earlier answer and the iPad's next load wrote it back over its own box.
   The phone sends its own clock as it sends (`sent`); now less that is the device's error, and every press
   in the request moves by it. A phone that sends none is held as before. */
```

### ---------- 11. THE ADMIN'S PEOPLE LINE DATES CARRIED-OVER WORK BY WHEN IT WAS DONE (review of 10 Oct)

top level, before `b`

```
/* ---------- 11. THE ADMIN'S PEOPLE LINE DATES CARRIED-OVER WORK BY WHEN IT WAS DONE (review of 10 Oct) ------------------
   A row `subMigrate_` sent (`1791504000000-m…`) arrives the day the backend lands; by arrival, every
   learner's "last" moved to that day. */
```

### ---------- 12. THE OWNER'S STEPS RUN ensureSchema WHERE IT IS THE NEW CODE, AND SAY IT HAS TO BE RUN (review of 10 Oct)

top level, before `dirH`

```
/* ---------- 12. THE OWNER'S STEPS RUN ensureSchema WHERE IT IS THE NEW CODE, AND SAY IT HAS TO BE RUN (review of 10 Oct) ----------
   308's step 2 offered `/exec?setup=1` before step 3 (New version). Until then /exec is the deployed web app —
   the live code, a week old — and its `ensureSchema` rewrote an owner-shaped options tab (Art's and PE's
   `focus` left beside status rows, "On hold" removed) and made no `submissions` tab: the very rewrite the
   10 Oct `seedOptions` change exists to keep off the owner's 145 rows. 309's step 3 said there was nothing
   to run because "the first request after the new version runs ensureSchema by itself", which doGet has not
   done since the schema work came off the page load. Asked of every owner section in docs/history, and of
   the code the corrected sentences describe. */
```

