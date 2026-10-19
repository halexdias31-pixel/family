# js/check-marks-load.js

The full text of comments in `js/check-marks-load.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-marks-load.js THE SIX MARKING FUNCTIONS, CUT OUT OF find.js, FOR WHATEVER WANTS TO TEST THEM.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-marks-load.js

   THE SIX MARKING FUNCTIONS, CUT OUT OF find.js, FOR WHATEVER WANTS TO TEST THEM.

   SEVERAL CHECKS RUN THE MARKING and they ask different questions: `check-marking.js` asks whether
   the FUNCTIONS are fair, `check-library.js` whether the DATA they are pointed at can be marked at
   all. Each has to run the app's own `markAnswer_` rather than a second opinion about what a right
   answer is — that is the whole reason any of them is worth running — so the extraction is here
   once instead of in each.

   THE SECOND COPY IS WHAT THIS AVOIDS, and it had already gone wrong. A check (since deleted with
   the feature it served) was written with its own simpler cutter — "to the next top-level declaration" — and it could not find
   `markBare_`, which is a `const` arrow with no block. One extractor that handles both shapes, in
   one place, is this repository's own answer to `documents_()`, `paperIdOf_`, `factsNow_` and
   `childrenOf`.

   BRACE-COUNTED, NOT MATCHED. A regex for "the body of a function" is really a regex for "up to the
   next closing brace at the start of a line", which is a formatting convention rather than a fact
   about the code — and this is the one thing in the app that must not be approximately right.
================================================================================================== */
```

### Returns `{ source, missing }`.

top level, before `markingSource`

```
/* Returns `{ source, missing }`. A caller that finds anything in `missing` must exit non-zero:
   "I did not check" is not the same answer as "I checked and it was fine", and `check-booking.js`
   printed the second for the first for months. */
```

