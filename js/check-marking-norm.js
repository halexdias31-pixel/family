#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-marking-norm.js ONE VALUE, EVERY SPELLING (R2, R3): every accept in the whole library is marked right against itself
   and the spellings a child types for it, and its near misses stay wrong. -v for the counts. */
const path = require('path');
const { markingSource } = require('./check-marks-load.js');

const marks = markingSource(path.join(__dirname, '..'));
if (marks.missing.length) {
  console.log('check-marking-norm: cannot find ' + marks.missing.join(', ') + ' in find.js — renamed?');
  process.exit(1);
}
eval(marks.source + '\nglobalThis.markBare_ = markBare_;');

const bad = [];
const n = { self: 0, dot: 0, sup: 0, order: 0, list: 0, deg: 0, pct: 0, sign: 0, shift: 0, coef: 0 };
const want = (id, typed, accept, right, why) => {
  let got;
  try { got = markAnswer_(typed, accept); } catch (e) { got = 'threw ' + e.message; }
  if (got !== right) bad.push(id + ': ' + JSON.stringify(typed) + ' against ' + JSON.stringify(accept) + ' (' + why + ') is ' + got);
};

/* ---------- THE NAMED CASES: the spellings answering-1..3 found marked wrong */
const CASES = [
  ['.5', '0.5', true, 'a leading dot'], ['-.25', '-0.25', true, 'a negative leading dot'], ['.5', '5', false, 'a leading dot is not the digit'],
  ['5 degrees', '5°', true, 'degrees spelt out'], ['5 deg', '5°', true, 'deg'], ['5°', '5 degrees', true, 'and the other way'],
  ['25%', '0.25', true, 'a percentage against a decimal (O2)'], ['0.5', '50%', true, 'a decimal against a percentage'],
  ['25 per cent', '25%', true, 'per cent spelt out'], ['25%', '0.25|rule: decimal', false, 'not where the row asks for a decimal'],
  ['3\n4', '3, 4', true, 'a list on two lines'], ['3; 4', '3, 4', true, 'a list split by semicolons'],
  ['4x^2-7x-10+x^3', 'x^3+4x^2-7x-10', true, 'algebra in another order (O4)'], ['x²+2x', 'x^2+2x', true, 'a superscript square'],
  ['2x+x^2', 'x²+2x', true, 'reordered, and the cell wrote the superscript'], ['3yx', '3xy', true, 'the letters of a term in either order'],
  ['y=3+2x', 'y=2x+3', true, 'an equation with its terms reordered'],
  ['x+x+3', '2x+3', false, 'unsimplified is not simplified'], ['(x+2)(x+3)', 'x^2+5x+6', false, 'factorised is not expanded'],
  ['x^2+6x+5', 'x^2+5x+6', false, 'swapped coefficients'], ['2x-3', '2x+3', false, 'a sign flipped'],
  ['3+2x', '2x+3|rule: expr 2x+3, nobracket', true, 'a rule row still marks by its rule'],
];
CASES.forEach(c => want('case', c[0], c[1], c[2], c[3]));

/* ---------- NEVER A THROW, NEVER A HANG */
['😀', '🙂 12 😀', 'x'.repeat(5000), '1,'.repeat(2500), '\n\n\n', '3\n\n4\n', '.', ';;;', '(((((', '^^^', '²³'].forEach(t => {
  ['0.5', 'x^2+2x', '3, 4', '5°', '25%', '1 to 3'].forEach(a => {
    const t0 = Date.now();
    try { markAnswer_(t, a); } catch (e) { bad.push('throws on ' + JSON.stringify(t.slice(0, 20)) + ': ' + e.message); }
    if (Date.now() - t0 > 400) bad.push('took ' + (Date.now() - t0) + ' ms on ' + JSON.stringify(t.slice(0, 20)));
  });
});

/* ---------- THE WHOLE LIBRARY */
const LIB = require('../check/lib-full.js').rows('questions')
  .filter(r => r && r.kind === 'question' && String(r.accept || '').trim());
LIB.forEach(r => {
  const acc = String(r.accept);
  const ruled = /(^|\|)\s*rule:/i.test(acc);
  const ways = acc.split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  const norms = ways.map(markNorm_);
  const anyIs = v => ways.some(x => markNum_(markBare_(x)) === markNum_(markNorm_(v)));
  norms.forEach((w, i) => {
    const id = r.row_id;
    n.self++; want(id, ways[i], acc, true, 'itself');
    if (/^-?0\.\d+$/.test(w)) { n.dot++; want(id, w.replace('0.', '.'), acc, true, 'with no leading 0'); }
    if (/\^[23](?!\d)/.test(w)) { n.sup++; want(id, w.replace(/\^2(?!\d)/g, '²').replace(/\^3(?!\d)/g, '³'), acc, true, 'in superscripts'); }
    if (/^-?\d+(?:\.\d+)?(?:,\s*-?\d+(?:\.\d+)?)+$/.test(w)) {
      n.list++; want(id, w.replace(/,\s*/g, '\n'), acc, true, 'one a line'); want(id, w.replace(/,\s*/g, '; '), acc, true, 'by semicolons');
    }
    const dg = /^(-?\d+(?:\.\d+)?)°$/.exec(w);
    if (dg) { n.deg++; want(id, dg[1] + ' degrees', acc, true, 'degrees spelt out'); }
    const pc = /^(\d+(?:\.\d+)?)%$/.exec(w);
    if (pc && !ruled) { n.pct++; want(id, (Number(pc[1]) / 100).toPrecision(12).replace(/\.?0+$/, ''), acc, true, 'as a decimal'); }
    const terms = markTerms_(w);
    if (terms && !ruled && !/=/.test(w)) {
      /* the last top-level term moved to the front */
      const m = /^(.*[^\^*\/(])([+-][^+\-()]+)$/.exec(w);
      if (m && !/\(/.test(w)) { n.order++; want(id, m[2].replace(/^\+/, '') + (/^[+-]/.test(m[1]) ? m[1] : '+' + m[1]), acc, true, 'its terms in another order'); }
      const c = /\d/.exec(w);
      if (c) {
        const v = w.slice(0, c.index) + ((Number(c[0]) + 1) % 10) + w.slice(c.index + 1);
        if (!norms.some(x => markTerms_(x) === markTerms_(v)) && !ways.some(x => markExpr_(v, x))) { n.coef++; want(id, v, acc, false, 'a coefficient changed'); }
      }
    }
    if (/^-?\d+(?:\.\d+)?$/.test(w) && Number(w) !== 0 && !/[±]|plus or minus/i.test(acc)) {
      const flip = w[0] === '-' ? w.slice(1) : '-' + w;
      if (!anyIs(flip)) { n.sign++; want(id, flip, acc, false, 'its sign flipped'); }
      const shift = String(Number(w) * 10);
      if (!ruled && !anyIs(shift) && !/\bto\b|[–—]/.test(acc)) { n.shift++; want(id, shift, acc, false, 'a digit shifted'); }
    }
  });
});

const say = Object.keys(n).map(k => n[k] + ' ' + k).join(', ');
if (bad.length) {
  bad.slice(0, 60).forEach(x => console.log('  ' + x));
  if (bad.length > 60) console.log('  … and ' + (bad.length - 60) + ' more');
  console.log('check-marking-norm: ' + bad.length + ' wrong (' + CASES.length + ' cases, ' + LIB.length + ' rows: ' + say + ')');
  process.exit(1);
}
console.log('OK — ' + CASES.length + ' cases and ' + LIB.length + ' library rows, every spelling of one value marked alike (' + say + ').');
