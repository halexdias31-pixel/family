require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-spine.js THE BOOKING FORM AND THE RECEIPT ARE ONE DOCUMENT AT TWO MOMENTS, AND NOTHING ENFORCED IT. § */

const fs = require('fs');
const path = require('path');

function run() {
  let src;
  try { src = fs.readFileSync(path.join(__dirname, 'book.js'), 'utf8'); }
  catch (err) { console.log('COULD NOT RUN — no book.js beside this checker'); process.exitCode = 1; return; }

  /* ---------- THE SPINE, READ OFF THE FILE ------------------------------------------------------
     Not copied here. A checker holding its own copy of the list it checks passes for ever the day
     somebody edits the real one. */
  /* ---------- THE SPINE IS BUILT FROM THE FORM NOW, SO IT IS BUILT HERE THE SAME WAY § */
  /* ---------- AND A WEEK STEP CONTRIBUTES SEVEN ROWS, NOT ITS `short` § */
  const week = {};
  /* SCANNED TO THE END OF THE STEP OBJECT, not to the end of the line. § */
  [...src.matchAll(/short: '([^']+)'([\s\S]*?)\},\n/g)].forEach(m => {
    if (/\bweek: true\b/.test(m[2])) week[m[1]] = 1;
  });
  const dayBlock = src.match(/const SLOT_DAYS = \[([\s\S]*?)\];/);
  const DAYS = dayBlock ? [...dayBlock[1].matchAll(/'[a-z]+',\s*'([A-Za-z]+)'/g)].map(m => m[1]) : [];
  const shorts = [...src.matchAll(/short: '([^']+)'/g)].map(m => m[1]);
  const exBlock = src.match(/const SPINE_EXTRA = \[([\s\S]*?)\];/);
  if (!shorts.length || !exBlock) {
    console.log('COULD NOT RUN — BOOK_STEPS or SPINE_EXTRA not found in book.js');
    process.exitCode = 1; return;
  }
  /* A WEEK STEP WITH NO DAYS TO PUT IN ITS PLACE IS A CHECKER THAT CANNOT SEE ITS SUBJECT, which is
     this repository's oldest fault. Said, and failed, rather than quietly checking six-sevenths. */
  if (Object.keys(week).length && DAYS.length !== 7) {
    console.log('COULD NOT RUN — a step is marked `week: true` and SLOT_DAYS did not yield seven names');
    process.exitCode = 1; return;
  }
  const extras = [...exBlock[1].matchAll(/after:\s*'([^']*)',\s*row:\s*'([^']+)'/g)]
    .map(m => ({ after: m[1], row: m[2] }));
  const spine = [];
  shorts.forEach(k => {
    if (week[k]) DAYS.forEach(d => { if (spine.indexOf(d) === -1) spine.push(d); });
    else spine.push(k);
    extras.forEach(x => { if (x.after === k) spine.push(x.row); });
  });
  extras.forEach(x => { if (x.after && spine.indexOf(x.row) === -1) spine.push(x.row); });
  extras.filter(x => !x.after).forEach(x => spine.push(x.row));

  /* AN EXTRA PINNED TO A STEP THAT IS GONE. § */
  const stranded = extras.filter(x => x.after && shorts.indexOf(x.after) === -1);

  const aliasBlock = src.match(/const SPINE_ALIAS = \{([^}]*)\}/);
  const alias = {};
  ((aliasBlock && aliasBlock[1]) || '').split(',').forEach(pair => {
    const m = pair.match(/(\w+)\s*:\s*'([^']*)'/);
    if (m) alias[m[1]] = m[2];
  });

  /* ---------- EVERY LABEL EITHER BUILDER PUSHES § */
  const pushed = new Set();
  (src.match(/push\('([A-Za-z][A-Za-z ]*)'/g) || []).forEach(m => {
    pushed.add(m.slice(6, -1));
  });
  /* ---------- A DAY ROW IS FILLED BY `weekRows_`, NOT BY A `push` § */
  if (Object.keys(week).length) DAYS.forEach(d => pushed.add(d));

  const bad = [];
  const unknown = [...pushed].filter(k => {
    const resolved = alias[k] !== undefined ? alias[k] : k;
    return resolved && spine.indexOf(resolved) === -1;
  });

  unknown.forEach(k => bad.push(
    '"' + k + '" is pushed as a row and is not on the SPINE.\n'
    + '      Either add it to SPINE — and it appears on the form AND the receipt, which is the\n'
    + '      point — or give it an entry in SPINE_ALIAS pointing at the row it really is.'));

  /* ---------- AND THE OTHER DIRECTION § */
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
  if (!process.exitCode) console.log('OK — every row either builder draws is on the spine (' + spine.length + ' rows).');
}

run();
