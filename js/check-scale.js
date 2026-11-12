#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-scale.js THE FIXED SCALE (owner, 11 Nov): § */
/* The reading is tools/css-scale.js, the one the Optimiser scores (font-, space-, radius-scale, colourlit): this gates its hard set. */
const { cssScale } = require('../tools/css-scale.js');
const S = cssScale(), bad = S.missing.map(t => `the token ${t} is not defined in :root`);
for (const k of ['font', 'space', 'radius', 'tap', 'colour']) bad.push(...S.measure[k].hard);
if (S.blocks < 500) bad.push(`only ${S.blocks} rules read from style.css — the reader has broken`);
if (bad.length) {
  console.log(`check-scale: ${bad.length} size, corner, space or colour outside the fixed scale:`);
  bad.forEach(b => console.log('  ' + b));
  process.exit(1);
}
console.log(`check-scale: ${S.blocks} rules, every size, corner, space and colour on the fixed scale`);
