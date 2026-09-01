/* ==================================================================================================
   @family. — check-spine.js

   THE BOOKING FORM AND THE RECEIPT ARE ONE DOCUMENT AT TWO MOMENTS, AND NOTHING ENFORCED IT.

   They were built by two functions — `bookBreakdown` for the form, `jobRows` for the receipt — that
   had drifted apart line by line over months. The form said `Seats`, the receipt said `Students`.
   The form said `Space`, the receipt said `Host`. The receipt had `Running`, `Weeks left` and
   `About`; the form had `Kind`, `Class`, `Split` and `When free`. Their orders disagreed. Every fix
   made all evening had to be made twice, and at least twice it was made once.

   `SPINE` IN book.js IS NOW THE ONE ORDER and `spineRows_` imposes it on both. This is what stops
   that being undone: it reads the file, finds every row label either builder emits, and fails if
   one of them is not on the spine.

   WHY A CHECKER AND NOT JUST THE SHARED FUNCTION. Sharing `spineRows_` makes the two AGREE about
   order. It cannot stop somebody adding `push('Deposit', …)` to one builder and not the other — the
   row would simply fall to the end of one document and be absent from the other, silently, which is
   exactly the failure this whole exercise is about. A label that is not on the spine is either a
   row that belongs on both and has not been added, or a row that belongs on neither.

   RUN IT:  node js/check-spine.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

function run() {
  let src;
  try { src = fs.readFileSync(path.join(__dirname, 'book.js'), 'utf8'); }
  catch (err) { console.log('COULD NOT RUN — no book.js beside this checker'); process.exitCode = 1; return; }

  /* ---------- THE SPINE, READ OFF THE FILE ------------------------------------------------------
     Not copied here. A checker holding its own copy of the list it checks passes for ever the day
     somebody edits the real one. */
  /* ---------- THE SPINE IS BUILT FROM THE FORM NOW, SO IT IS BUILT HERE THE SAME WAY --------------
     It used to be a literal array and this read it. It is now derived: every `short` on
     `BOOK_STEPS`, in order, with the non-question rows pinned after the step they belong with. So
     this replays that — which also means the checker fails if the derivation stops matching, rather
     than checking a list that no longer exists. */
  const shorts = [...src.matchAll(/short: '([^']+)'/g)].map(m => m[1]);
  const exBlock = src.match(/const SPINE_EXTRA = \[([\s\S]*?)\];/);
  if (!shorts.length || !exBlock) {
    console.log('COULD NOT RUN — BOOK_STEPS or SPINE_EXTRA not found in book.js');
    process.exitCode = 1; return;
  }
  const extras = [...exBlock[1].matchAll(/after:\s*'([^']*)',\s*row:\s*'([^']+)'/g)]
    .map(m => ({ after: m[1], row: m[2] }));
  const spine = [];
  shorts.forEach(k => {
    spine.push(k);
    extras.forEach(x => { if (x.after === k) spine.push(x.row); });
  });
  extras.forEach(x => { if (x.after && spine.indexOf(x.row) === -1) spine.push(x.row); });
  extras.filter(x => !x.after).forEach(x => spine.push(x.row));

  /* AN EXTRA PINNED TO A STEP THAT IS GONE. It still reaches the spine — it is appended rather than
     dropped — but at the end, nowhere near where it was meant to be, which on a document read by
     position is as good as wrong. Said plainly rather than left to be noticed. */
  const stranded = extras.filter(x => x.after && shorts.indexOf(x.after) === -1);

  const aliasBlock = src.match(/const SPINE_ALIAS = \{([^}]*)\}/);
  const alias = {};
  ((aliasBlock && aliasBlock[1]) || '').split(',').forEach(pair => {
    const m = pair.match(/(\w+)\s*:\s*'([^']*)'/);
    if (m) alias[m[1]] = m[2];
  });

  /* ---------- EVERY LABEL EITHER BUILDER PUSHES -------------------------------------------------
     `push('Subject', …)` in both functions. Read by pattern rather than by running the code,
     because running it would need a whole booking and a whole payload — and the point of this
     checker is that it costs nothing to run. */
  const pushed = new Set();
  (src.match(/push\('([A-Za-z][A-Za-z ]*)'/g) || []).forEach(m => {
    pushed.add(m.slice(6, -1));
  });

  const bad = [];
  const unknown = [...pushed].filter(k => {
    const resolved = alias[k] !== undefined ? alias[k] : k;
    return resolved && spine.indexOf(resolved) === -1;
  });

  unknown.forEach(k => bad.push(
    '"' + k + '" is pushed as a row and is not on the SPINE.\n'
    + '      Either add it to SPINE — and it appears on the form AND the receipt, which is the\n'
    + '      point — or give it an entry in SPINE_ALIAS pointing at the row it really is.'));

  /* ---------- AND THE OTHER DIRECTION ------------------------------------------------------------
     A spine row nothing ever pushes is a row that prints a dash on every document for ever. That is
     not an error — `Asked for` is legitimately blank until a job exists — but a spine full of rows
     nothing fills is a spine nobody trusts, so it is reported as something to look at. */
  const never = spine.filter(k => {
    if (pushed.has(k)) return true ? false : false;
    return ![...pushed].some(p => (alias[p] !== undefined ? alias[p] : p) === k);
  });

  console.log('ONE SPINE, TWO DOCUMENTS  (' + spine.length + ' rows)');
  if (bad.length) {
    bad.forEach(b => console.log('  ✗ ' + b));
    process.exitCode = 1;
  } else {
    console.log('  every row either builder draws is on the spine.');
  }
  if (stranded.length) {
    stranded.forEach(x => console.log('  ✗ "' + x.row + '" is pinned after "' + x.after
      + '", which is not a step on the form any more — it has fallen to the end of both documents.'));
    process.exitCode = 1;
  }
  if (never.length) {
    console.log('  rows nothing fills yet (they print a dash on both): ' + never.join(', '));
  }
}

run();
