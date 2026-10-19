# js/check-booking.js

The full text of comments in `js/check-booking.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-booking.js THE STATE MACHINE, RUN.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-booking.js

   THE STATE MACHINE, RUN. Not read.

   WHY THIS FILE EXISTS. Every fault that has cost real money in this project has been in the same
   fifty lines: `participantsOf`, folding an append-only event log into who is in a session and what
   state they are in. Three found in one afternoon, and all three were invisible to every other
   checker because they are not missing names, dead rules or absent columns — they are a correct
   program computing the wrong answer.

     · a paid client who EDITED anything wiped their own payment. Booked became Waiting, the job
       went back to unconfirmed, and Stripe would sell them the same session again.
     · a paid client who WITHDREW vanished from the roster entirely. Job read cancelled, nothing
       anywhere said a refund was owed, and the only trace was a Confirm nothing reads.
     · the fix for the second had a hole the same shape: the mark was erased by the next event to
       arrive, including an edit by somebody else.

   THE THIRD IS THE POINT OF THIS FILE. Two of those were old bugs; one was mine, introduced while
   fixing another, and found only because I happened to test the fix rather than trust it. A
   throwaway script found each of them and was thrown away each time — so the next change gets no
   help from any of it. This is that script, kept.

   HOW IT WORKS. The fold and the lobby are lifted straight out of `booking.gs` and `constants.gs`
   and run in Node. No Google, no sheet, no network — the functions are pure, which is the property
   that makes this possible and is worth protecting.

     node check-booking.js

   ADDING A CASE IS ONE LINE in `SEQUENCES`. Every sequence somebody can actually perform is worth
   one, and the ones involving money are worth two.
================================================================================================== */
```

### ---------- LIFTING THE REAL CODE

top level, before `WHERE`

```
/* ---------- LIFTING THE REAL CODE ----------------------------------------------------------------
   The point is to test what actually runs, so nothing here is a copy. `booking.gs` is read from
   disk and the functions are cut out by brace-matching — if somebody renames one, this fails loudly
   rather than testing a stale duplicate. */
```

### ---------- WHERE THE BACKEND ACTUALLY IS

top level, before `WHERE`

```
/* ---------- WHERE THE BACKEND ACTUALLY IS --------------------------------------------------------
   THIS LOOKED IN ONE PLACE AND THE FILES ARE IN ANOTHER, and the cost of that was the whole file.

   It read `../booking.gs`. The .gs files were moved into `backend/` — a good move, and nothing told
   this — so `backendFile` returned null, the guard below printed "nothing to check", and the
   process exited ZERO. Every run since has been a pass. `check-all.js` counted it as a pass. The
   one checker standing between this project and the three money bugs described at the top of this
   file has been switched off for as long as `backend/` has existed, and it reported success the
   entire time.

   SO IT SEARCHES, and the list is ordered by what is true today first. */
```

### ---------- AND IF THEY ARE NOT THERE, THAT IS A FAILURE

top level, before `fn`

```
/* ---------- AND IF THEY ARE NOT THERE, THAT IS A FAILURE --------------------------------------
   IT USED TO EXIT 0 HERE, which is the actual reason the broken path went unnoticed for months. A
   checker that cannot find the thing it checks has not checked it, and "I did not check" is not the
   same answer as "I checked and it was fine" — but exit 0 says the second one to every caller.

   Anything automated reads the exit code and nothing reads the prose. `check-all.js` printed a tick
   beside this file. `sync.js` pushed. The one signal that would have said otherwise was being
   deliberately suppressed by the file that had the most to lose from it. */
```

### AND THE TERM LIST, WHICH PUT A BOOKING IN TWO ACADEMIC YEARS AT ONCE.

top level, before `doget`

```
/* ==================================================================================================
   AND THE TERM LIST, WHICH PUT A BOOKING IN TWO ACADEMIC YEARS AT ONCE.

   REPORTED AS *"why is it coming out to so much?"* over a card totalling £1024.59 whose Dates row
   listed eighteen sessions across September 2026 AND September 2027 for one ticked term. `doget.gs`
   sends the term list and `bookSpec` FILTERS it by name, so a name sent twice gave one ticked button
   two windows a year apart: three sessions became ten and £60 became £200.

   THE FILTER'S OWN COMMENT CLAIMED OTHERWISE — that once terms which have ENDED are dropped *"each
   name appears once inside the next twelve months"*. It holds for most of the year and fails every
   autumn: on 25/09/2026 the current `Autumn 1` has not ended and the next one starts four days inside
   the 370-day cut-off, so both are sent. A sentence that is true in March and false in September is
   exactly the kind of claim a check is for.

   IT RUNS THE REAL BLOCK, cut out of `doget.gs`, over a whole year of "todays" — because one date
   proves one date, and the fault is a date range. `Date` is shadowed in the sandbox rather than the
   source being edited, so what is measured is the code that ships.

   `termsFor` IS THE COMPUTED SCHOOL YEAR, which is what it returns when nobody has typed the dates
   into the sheet — the case that ships, and the only one reachable from here.
================================================================================================== */
```

### THE ONE PLACE THE YEAR IS DECIDED, AND THE BLOCK THAT FILTERS IT, cut rather than copied:

top level, before `src`

```
/* THE ONE PLACE THE YEAR IS DECIDED, AND THE BLOCK THAT FILTERS IT, cut rather than copied: a copy
     would agree with itself and with nothing else.

     NOTE FOR THE NEXT READER — NO BACKTICKS IN THIS TEMPLATE. The house style writes a name in
     backticks and this is a template literal, so one here ends the string and the syntax error lands
     four hundred lines away from the comment. The same trap `js/map.js` records for widget markup. */
```

### UP TO THE NEXT STATEMENT, not to a closing brace.

in `src`

```
/* UP TO THE NEXT STATEMENT, not to a closing brace. The first version ended the cut at the
       dedupe filter's own '});' — so removing that filter, which is the one mutation worth making
       here, took the cut to some unrelated brace and the check failed with 'missing ) after argument
       list'. A guard firing for a fault in its own cutter teaches nothing. */
```

### ---------- WHAT SHOULD HAPPEN

top level, before `REQUEST`

```
/* ---------- WHAT SHOULD HAPPEN -------------------------------------------------------------------
   Each case is a list of events and what the roster and the job should read afterwards. Written as
   the sentence somebody would say about it, so a failure names a situation rather than a variable.

   `who` is checked as a set of `name=status`; `job` is the folded job status; `refund` is who is
   owed money back. Anything not stated is not checked, so a case stays readable. */
```

### ---------- AND THE LOBBY ITSELF

top level, before `RULES`

```
/* ---------- AND THE LOBBY ITSELF -----------------------------------------------------------------
   Separate from the fold: these are about what somebody is ALLOWED to do, which is the other half of
   the machine and the half that decides whether money can move. */
```

### ---------- AND THE HOURS A TUTOR IS ALREADY TEACHING

top level, before `what`

```
/* ---------- AND THE HOURS A TUTOR IS ALREADY TEACHING ------------------------------------------
   `busyHours` IS WHAT GREYS AN HOUR ON THE BOOKING GRID, so a job it cannot see is an hour offered
   to a second family while the first already has it. That is the one fault in this file's subject
   area that takes money from two people for one session.

   IT READ THE WHOLE `weekday` CELL AS ONE DAY NAME. The form has let somebody tick hours across
   several days for a long time and `bookSpec` joins them, so a real cell reads `Monday, Friday` —
   `DAY['monday, friday']` is undefined, the `if (!d) return` dropped the job, and BOTH of its days
   stayed open. Silently, and only on multi-day bookings.

   ONE SPAN ON EACH NAMED DAY, because the job row holds one `start_time` and one
   `hours_per_session`. Of the two ways to be wrong, one offers an hour that is taken and the other
   holds an hour that is free; only the first sells the same hour twice. */
```

### A LIVE ROSTER, because `busyHours` skips a job `jobStatusOf` reads as cancelled — and with no events at all there are no clients, which IS cancelled.

in `check`

```
/* A LIVE ROSTER, because `busyHours` skips a job `jobStatusOf` reads as cancelled — and with no
       events at all there are no clients, which IS cancelled. Seeding nothing measured the skip
       rather than the day mapping, and reported "nothing" for every case including the one-day one
       that has always worked. */
```

### AND A CANCELLED SESSION RELEASES ITS HOURS, which is what `jobStatusOf` is consulted for — asserted here because the case above leans on it, and a guard

in `check`

```
/* AND A CANCELLED SESSION RELEASES ITS HOURS, which is what `jobStatusOf` is consulted for —
       asserted here because the case above leans on it, and a guard nothing measures is a guard
       that can quietly become the reason a rule passes. */
```

### ---------- THE BANK HOLIDAYS, WORKED OUT, AGAINST THE ONES gov.uk PUBLISHED

top level, before `what`

```
/* ---------- THE BANK HOLIDAYS, WORKED OUT, AGAINST THE ONES gov.uk PUBLISHED ------------------------
   `bankHolidays` IS WHAT `computeSessionDates` STEPS OVER, so a wrong date here is a session charged
   on a day nobody is taught, or one skipped that should run. Checked against England and Wales as
   gov.uk lists them — three years with every substitute shape in them: 2026 (Boxing Day on a
   Saturday), 2027 (both on the weekend) and 2028 (New Year's Day on a Saturday). A one-off like a
   jubilee is the holidays tab's job, not the formula's, and is not asked here. */
```

### ---------- ONE SPAN OF HOURS, IN BOTH LANGUAGES

top level, before `what`

```
/* ---------- ONE SPAN OF HOURS, IN BOTH LANGUAGES ---------------------------------------------------
   `AVAIL_HOURS` (constants.gs) IS WHAT A TUTOR CAN TICK and `SLOT_HOURS` (js/book.js) IS WHAT A FAMILY
   CAN BOOK, and they disagreed: nine to seven against nine to six, so a seven o'clock tick was drawn
   lit on the tutor's card and could never be booked. Two files in two languages cannot share a
   constant, so the next best thing is this: both are read off the real source and must be the same
   list. Widen both or neither. */
```

### ---------- AND ONLY WHILE ITS DATES ARE LIVE

top level, before `what`

```
/* ---------- AND ONLY WHILE ITS DATES ARE LIVE ----------------------------------------------------
   `busyHours` HAD NO DATES, so a session that ended in July greyed its hours on every booking grid for
   ever, and one booked for next term was busy today. A job counts from its first session date to its
   last; `from`/`to` asks about a window instead of today, which is what `createJob` does with the
   booking's own dates. A job with no dates counts whatever the window — see the note on the function. */
```

### WHAT A BOOKING EARNS, RUN WITH THE OWNER'S OWN NUMBERS (docs/history/353)

top level, before `coreJs`

```
/* ==================================================================================================
   WHAT A BOOKING EARNS, RUN WITH THE OWNER'S OWN NUMBERS (docs/history/353)

   THE PHONE'S SUM IS `bookMoney_` INSIDE `priceFrom` (js/core.js) AND THE SERVER'S IS THE FREEZE AND THE
   DISCOUNT GUARD (booking.gs). Both are run here, not read: core.js is loaded whole with a DATA of our own
   — one tutor at £30, c 0.5, B 0.2 — and the cases are the ones the plan was approved with on 18 Oct, so a
   change that moves any of them moves a figure the owner has already agreed to.
================================================================================================== */
```

