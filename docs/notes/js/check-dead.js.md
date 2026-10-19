# js/check-dead.js

The full text of comments in `js/check-dead.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-dead.js FUNCTIONS NOTHING CALLS, on both sides of the app.

top level, before `path`

```
/* ==================================================================================================
   @family. — check-dead.js

   FUNCTIONS NOTHING CALLS, on both sides of the app.

   WHY THIS IS A CHECK AND NOT A TIDY-UP. Dead code is not untidy, it is MISLEADING. `arrive()` cost
   four rounds of chasing a swipe bug because it looked like the thing animating the swipe and had
   no CSS at all. `bmConfirmPayment` read as the rule that stops a button reaching a paid booking,
   and nothing consulted it. A function that is never called still gets read, still gets trusted,
   and still gets maintained.

   IT HAS TO BE RUN TO A FIXED POINT. Removing one dead function uncovers the ones it was holding
   up — `chessTap` was the only caller of `bestMove`, so the first pass found one of them and the
   second found the other. Run it, delete what it names, run it again, until it says none twice.

   WHAT IT DELIBERATELY KEEPS. Anything reached from outside the source: `doGet` and `doPost`, which
   Apps Script calls; the maintenance jobs, picked from the editor's dropdown or a `?run=` URL; and
   the console tools a person types. None has a caller in the code and all of them are alive. That
   list is below and adding to it is the price of adding one of those.

     node check-dead.js

   Paths are relative to this file, so it runs from anywhere.
================================================================================================== */
```

### THE BACKEND FILES, UNDER WHATEVER THEY ARE CALLED.

top level, before `gsF`

```
/* THE BACKEND FILES, UNDER WHATEVER THEY ARE CALLED. Numbered in one place, plain in another, and
   this refused to run rather than look — so the backend half of this check has never once run
   against the real project. A checker that only works against a naming convention is a checker
   that does not work.
   Anything genuinely absent is skipped rather than fatal: the frontend half is worth having on its
   own, and half a report beats an exit code. */
```

### `backend/` FIRST. This looked only beside the project and the .gs files moved into backend/, so the second half of this check — dead functions in the BACKEND

in `gsF`

```
/* `backend/` FIRST. This looked only beside the project and the .gs files moved into backend/,
       so the second half of this check — dead functions in the BACKEND — has been skipped on every
       run since, printing "no .gs files found beside the project" where a result should be. The
       same mistake check-booking, check-columns and check-access each made separately. */
```

### AND THE TWO RULES ABOUT HEADINGS, which are not style but structure.

top level, before `CARD`

```
/* ==================================================================================================
   AND THE TWO RULES ABOUT HEADINGS, which are not style but structure.

   `<h2>` DOES TWO JOBS. It is a section heading inside a sheet — "Digital", "Printed", "Admin" —
   and it is what `split_` cuts a column of cards on. So an `<h2>` written INSIDE a card does not
   look like a heading in a card: it cuts that card in half, and the bottom of it becomes a separate
   page you have to swipe to.

   That has happened. A heading inside the You card split it, and it took a screenshot to notice —
   nothing threw, and the two halves looked like two cards somebody had meant.

   `<h3>` is the card's own title and cuts nothing. The rule is: a heading inside a card is an h3, a
   heading between cards is an h2. It held everywhere when this was written, and it held by nobody
   enforcing it, which is the reason for enforcing it.
================================================================================================== */
```

