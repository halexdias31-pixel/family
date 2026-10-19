# js/check-columns.js

The full text of comments in `js/check-columns.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-columns.js EVERY COLUMN THE BACKEND TOUCHES, AGAINST THE ONES THAT EXIST.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-columns.js

   EVERY COLUMN THE BACKEND TOUCHES, AGAINST THE ONES THAT EXIST.

   WHY THIS IS THE FAULT THAT KEEPS HAPPENING. `setCell` writing to a column that is not there
   returns false and says nothing; `read` handing back a row with no such key gives `undefined`,
   which `S()` turns into an empty string and `N()` turns into zero. Neither throws. The value goes
   nowhere, or comes back blank, and the feature simply does not work — the avatar that reset every
   time, the four pricing fields lost four times over, `job.tutor` that never existed and left every
   invitation without a tutor's name in it.

   The write side has been checked by hand more than once. This checks BOTH, and keeps checking.

   WHAT IT KNOWS NOT TO REPORT, because a check that is mostly wrong is a check nobody reads:

     CONFIG KEYS ARE ROWS. The config tab is key and value, so `cfg.print_minimum` reads a ROW
     called print_minimum. It is not a column and never was — four of those were reported the first
     time this ran and none of them was a fault.

     NOT EVERY DOT IS A ROW. `d.payment_status` is Stripe's reply, `x.tab` is a write-miss record,
     `e.parameter` is the request. Only the names this file actually uses for a sheet row are read.

     node check-columns.js
================================================================================================== */
```

### THE BACKEND FILES, IN LOAD ORDER, UNDER WHATEVER THEY ARE CALLED.

top level, before `ORDER_`

```
/* THE BACKEND FILES, IN LOAD ORDER, UNDER WHATEVER THEY ARE CALLED.
   Apps Script joins these into one scope before anything runs, and the ORDER matters — every
   top-level `const` lives in the constants file and everything else holds functions only, so the
   constants file has to come first. The ORDER here is that order, and it is not alphabetical:
   alphabetically `booking` comes before `constants`, which is the arrangement the headers warn is
   a dead site with an error nobody can place.

   TWO SPELLINGS ACCEPTED, because the files are called one thing in the Apps Script editor and were
   once called another here. Numbered names are self-documenting about the order; plain ones are
   what is actually on disk. Rather than make somebody rename eight files to satisfy a checker, the
   checker looks for both — a tool that only runs against a naming convention is a tool that does
   not run. */
```

### `digest` LAST — the weekly parent email (backend/digest.gs) reads `submissions`, `people` and writes `digest_log`, and a column it named wrong would be an

top level, before `ORDER_`

```
/* `digest` LAST — the weekly parent email (backend/digest.gs) reads `submissions`, `people` and writes
   `digest_log`, and a column it named wrong would be an email that silently says nothing. (A tenth
   file came after it for two days, the email after each session; it was removed — docs/history/295.) */
```

### AND IN `backend/`, WHICH IS WHERE THEY ARE.

top level, before `WHERE`

```
/* AND IN `backend/`, WHICH IS WHERE THEY ARE. The .gs files were moved there and this went on
   looking beside itself, so every run printed "missing backend files: constants, core, people,
   booking, content, setup" and stopped. That at least exited 1 and was therefore visible, unlike
   `check-booking.js`, which made the same mistake and called it a pass. Directories in order of
   what is true today. */
```

### AND THE KEYS OF AN `addRow` OBJECT, which the comment above has always claimed and the code did not do.

top level, before `m`

```
/* AND THE KEYS OF AN `addRow` OBJECT, which the comment above has always claimed and the code did
   not do. `openWaitlist` wrote `term`, `client` and `note` — none of which the jobs tab has — and
   this passed clean, because every one of them arrived as an object key rather than a `setCell`
   argument. Three values dropped on every waiting list opened, reported only by a warning in the
   sheet that nobody was reading at the time.
   The block is found by walking braces from `addRow(`, so a nested object inside the row does not
   end the search early. */
```

### AND THE KEYS OF A `setCells` OBJECT, the third way a row is written (`setCells(t, row, { … })`, one call per run of columns) and the one this file was written

top level, before `m`

```
/* AND THE KEYS OF A `setCells` OBJECT, the third way a row is written (`setCells(t, row, { … })`, one
   call per run of columns) and the one this file was written before. Same walk as `addRow`'s. A
   `setCells` handed a variable cannot be read here — which is why the films sync names every column it
   writes in its `addRow` literal, where this can. */
```

