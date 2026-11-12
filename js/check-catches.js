#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-catches.js EMPTY CATCH BLOCKS MAY ONLY GET FEWER (R6): a new one needs a reason in it or an `oops_` call.
   The count is tools/catches.js's, the one the Optimiser (`catch`) and the Stability score read. */
const { emptyCatches, appFiles } = require('../tools/catches.js');
/* LOWER THIS when the count falls; never raise it. */
const CEILING = 268;
if (!appFiles().length) { console.error('check-catches: no app files — nothing to count'); process.exit(2); }
const found = emptyCatches(), n = found.length, per = {};
found.forEach(c => { per[c.file] = (per[c.file] || 0) + 1; });
if (process.argv.includes('-v') || process.env.VERBOSE) Object.entries(per).sort((a, b) => b[1] - a[1]).forEach(x => console.log('  ' + x[0] + ' ' + x[1]));
if (n > CEILING) {
  console.error('check-catches: ' + n + ' empty catch blocks, the ceiling is ' + CEILING
    + ' — give the new one a reason (a comment inside it) or call oops_(err, where)');
  process.exit(1);
}
console.log('check-catches: ' + n + ' empty catch blocks (ceiling ' + CEILING + (n < CEILING ? '; lower it to ' + n : '') + ')');
