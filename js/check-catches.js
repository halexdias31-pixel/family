#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-catches.js EMPTY CATCH BLOCKS MAY ONLY GET FEWER (R6): a new one needs a reason in it or an `oops_` call. */
const fs = require('fs'), path = require('path');
/* LOWER THIS when the count falls; never raise it. */
const CEILING = 530;
const dir = __dirname;
const EMPTY = /catch\s*(\([^)]*\))?\s*\{\s*\}/g;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !/^check/.test(f));
if (!files.length) { console.error('check-catches: no app files under js/ — nothing to count'); process.exit(2); }
const per = files.map(f => [f, (fs.readFileSync(path.join(dir, f), 'utf8').match(EMPTY) || []).length]).filter(x => x[1]);
const n = per.reduce((t, x) => t + x[1], 0);
if (process.argv.includes('-v') || process.env.VERBOSE) per.sort((a, b) => b[1] - a[1]).forEach(x => console.log('  ' + x[0] + ' ' + x[1]));
if (n > CEILING) {
  console.error('check-catches: ' + n + ' empty catch blocks, the ceiling is ' + CEILING
    + ' — give the new one a reason (a comment inside it) or call oops_(err, where)');
  process.exit(1);
}
console.log('check-catches: ' + n + ' empty catch blocks (ceiling ' + CEILING + (n < CEILING ? '; lower it to ' + n : '') + ')');
