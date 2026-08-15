#!/usr/bin/env node
/* ==================================================================================================
   check-canvas.js — DOES ANYTHING ON THE SHARED PICTURE OVERLAP ANYTHING ELSE?

   THE RATE COLUMN SAT ON TOP OF THE MULTIPLIER BY A HUNDRED UNITS, on every row that had both, and
   nothing said so. It could not: the picture is drawn on a canvas, so there is no DOM to inspect,
   no CSS to contradict itself, and every existing checker reads markup. A canvas is the one place
   in this app where a layout fault is invisible to everything except a person looking at it.

   SO THE COLUMN GEOMETRY IS RECOMPUTED HERE from the same numbers the file uses, and every column
   is checked against its neighbour with the longest string it can hold. Monospace makes this exact:
   every glyph is 0.6em, so a width is a character count and not an estimate.
================================================================================================== */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/receipt.js', 'utf8');

const num = (re, what) => {
  const m = re.exec(src);
  if (!m) { console.log('  could not find ' + what + ' in receipt.js'); process.exit(1); }
  return parseFloat(m[1]);
};
const S = num(/const S = (\d+), W =/, 'the scale');
const Wu = num(/W = (\d+) \* S/, 'the width');
const PADu = num(/PAD = (\d+) \* S/, 'the padding');
const totC = num(/totW = (\d+) \* CH/, 'the total column');
const rateC = num(/rateW = (\d+) \* CH/, 'the rate column');
const mulC = num(/mulW = (\d+) \* CH/, 'the multiplier column');
const GAPu = num(/GAP = (\d+) \* S/, 'the gap');
const FONT = num(/const CH = ([\d.]+) \* S \* 0\.6/, 'the table font');

const W = Wu * S, PAD = PADu * S, CH = FONT * S * 0.6, GAP = GAPu * S;
const totR = W - PAD;
const rateR = totR - totC * CH - GAP;
const mulR = rateR - rateC * CH - GAP;
const valR = mulR - mulC * CH - GAP;
const labelX = PAD + 26 * S;

/* the widest thing each column can hold, taken from what the app actually produces */
const WORST = {
  total: '£1,234.56', rate: '+ £100.00/h', mul: '× 1.01',
  label: 'February Half Term', value: '(Single) Physics, Further Maths',
};

const bad = [];
const check = (aName, aRight, aText, bName, bRight, bText) => {
  const aEnd = aRight, bStart = bRight - bText.length * CH;
  if (bStart < aEnd) bad.push(aName + ' runs into ' + bName + ' by '
    + Math.round(aEnd - bStart) + ' units (' + aText + ' / ' + bText + ')');
};
check('multiplier', mulR, WORST.mul, 'rate', rateR, WORST.rate);
check('rate', rateR, WORST.rate, 'total', totR, WORST.total);

const labEnd = labelX + WORST.label.length * CH;
const valStart = valR - WORST.value.length * CH;
if (valStart < labEnd) bad.push('the label runs into the value by '
  + Math.round(labEnd - valStart) + ' units (' + WORST.label + ' / ' + WORST.value + ')');

/* and the value must have room worth having, or the clash is only hidden by cutting the content */
const room = Math.floor((valR - labEnd - GAP) / CH);
if (room < 18) bad.push('only ' + room + ' characters left for a value beside the longest label — '
  + 'long answers will be trimmed, which hides a clash rather than fixing it');

console.log('');
console.log('THE SHARED PICTURE — ' + Wu + ' units wide');
console.log('  columns  value ' + Math.round(valR / S) + '   mul ' + Math.round(mulR / S)
  + '   rate ' + Math.round(rateR / S) + '   total ' + Math.round(totR / S));
console.log('  room for a value beside the longest label: ' + room + ' characters');
console.log('');
console.log('OVERLAPPING COLUMNS  (' + bad.length + ')');
if (!bad.length) console.log('  none');
bad.forEach(b => console.log('  ' + b));
console.log('');
console.log(bad.length ? 'FAILED — these are drawn on top of each other.'
                       : 'OK — nothing on the picture overlaps anything else.');
process.exit(bad.length ? 1 : 0);
