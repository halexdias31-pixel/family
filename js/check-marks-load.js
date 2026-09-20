/* ==================================================================================================
   @family. — check-marks-load.js

   THE SIX MARKING FUNCTIONS, CUT OUT OF find.js, FOR WHATEVER WANTS TO TEST THEM.

   THERE ARE TWO CHECKS OVER THE MARKING NOW and they ask different questions: `check-marking.js`
   asks whether the FUNCTIONS are fair, and `check-quizzes.js` asks whether the DATA they are
   pointed at can be marked at all. Both have to run the app's own `markAnswer_` rather than a
   second opinion about what a right answer is — that is the whole reason either of them is worth
   running — so the extraction is here once instead of in both.

   THE SECOND COPY IS WHAT THIS AVOIDS, and it had already gone wrong. `check-quizzes.js` was
   written with its own simpler cutter — "to the next top-level declaration" — and it could not find
   `markBare_`, which is a `const` arrow with no block. One extractor that handles both shapes, in
   one place, is this repository's own answer to `documents_()`, `paperIdOf_`, `factsNow_` and
   `childrenOf`.

   BRACE-COUNTED, NOT MATCHED. A regex for "the body of a function" is really a regex for "up to the
   next closing brace at the start of a line", which is a formatting convention rather than a fact
   about the code — and this is the one thing in the app that must not be approximately right.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const NAMES = ['markNorm_', 'markParts_', 'markNum_', 'markBare_', 'markFrac_', 'markRange_',
               'markAnswer_'];

function cutFrom(src, name) {
  let i = src.indexOf('function ' + name + '(');
  if (i < 0) i = src.indexOf('const ' + name + ' =');
  if (i < 0) return null;
  let j = i, depth = 0, seen = false;
  while (j < src.length) {
    const c = src[j];
    if (c === '{') { depth++; seen = true; }
    if (c === '}') { depth--; if (seen && depth === 0) { j++; break; } }
    if (!seen && c === ';') { j++; break; }   /* a `const` arrow with no block */
    j++;
  }
  return src.slice(i, j);
}

/* Returns `{ source, missing }`. A caller that finds anything in `missing` must exit non-zero:
   "I did not check" is not the same answer as "I checked and it was fine", and `check-booking.js`
   printed the second for the first for months. */
function markingSource(root) {
  const src = fs.readFileSync(path.join(root || path.join(__dirname, '..'), 'js', 'find.js'), 'utf8');
  const missing = NAMES.filter(n => !cutFrom(src, n));
  return { source: missing.length ? '' : NAMES.map(n => cutFrom(src, n)).join('\n'), missing: missing };
}

module.exports = { NAMES: NAMES, cutFrom: cutFrom, markingSource: markingSource };
