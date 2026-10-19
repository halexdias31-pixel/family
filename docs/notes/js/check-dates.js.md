# js/check-dates.js

The full text of comments in `js/check-dates.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-dates.js AN ISO DATE WAS READ BACKWARDS AND THE ANSWER LOOKED FINE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-dates.js

   AN ISO DATE WAS READ BACKWARDS AND THE ANSWER LOOKED FINE.

   `parseWhen` in data.js is the one place this app turns a written date into a Date, and every
   timestamp anybody sees goes through it: `ago()` on a post, on a comment, on a session. Its
   day-month-year match was NOT ANCHORED, so on a four-digit year the regex engine simply started
   later in the string — `\d{1,2}` cannot take `2026`, so it slid along to `26-09-15` and read day
   26, month 9, year 15.

   `2026-09-15` CAME OUT AS 26 SEPTEMBER 2015, and `2017-05-25` as 17 May 2025. A plausible date, a
   confident sentence, and wrong by eleven years — the shape this repository keeps recording, where
   the failure looks exactly like a success. Nothing threw and nothing could have noticed.

   WHY A CHECK AND NOT JUST THE FIX. This is the `cost: 0` sentence for the seventh time: a fault
   repaired in the instance and not in the rule comes back. The two date forms this app actually
   carries — the ISO one a sheet cell and a data file hold, and the `15/09/26 18:20` one
   `fmtDateTime` sends — are both here, so a future edit to that regex has to keep both.

   THE FUNCTION IS CUT OUT AND RUN ON ITS OWN, which is `check-marking.js`'s method and is safe for
   the same reason: `parseWhen` touches nothing else in the app. A second implementation here would
   be a second thing to keep in step, which is the fault this repository records under `childrenOf`,
   under `link`/`source_url` and under `factsNow_`.

   RUN IT:  node js/check-dates.js
================================================================================================== */
```

### ---------- EVERY CASE IS A FORM THIS APP ACTUALLY CARRIES

top level, before `CASES`

```
/* ---------- EVERY CASE IS A FORM THIS APP ACTUALLY CARRIES ----------------------------------------
   Written as local wall-clock rather than as a timestamp, because that is the question: a date is
   built field by field precisely so it does not move across midnight with the machine's zone. */
```

### A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO.

in `run`

```
/* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. "I did not check" is not the same
       answer as "I checked and it was fine", and exit 0 says the second one to everything that
       reads it — which is the `check-booking.js` fault this repository has now recorded five ways. */
```

