#!/usr/bin/env node
/* @family. — tools/marker-cases.js THE MARKER'S KNOWN TRAPS (rule 1.75; queue 4c, 20 Nov): the one marker (js/find-marking.js
   `markAnswer_`), loaded in a vm as tools/validate-questions.js loads the app, asked each case below: a right answer that must pass, a
   wrong one that must fail. Prints "marker-cases: N/M"; any case that goes wrong fails the build. A case the marker cannot yet get right
   is listed with `known: true`, counted apart, and does not fail it; one that starts passing is reported, to drop the flag. Run by tools/build.js. */
'use strict';
const VQ = require('./validate-questions.js');

/* [typed, key, right?, what it guards, known?] */
const CASES = [
  /* named values: each value with its own name, names in any order */
  ['x = 5, y = 9', 'x = 5, y = 9', true, 'named values as keyed'],
  ['y = 9, x = 5', 'x = 5, y = 9', true, 'named values, names swapped with their values'],
  ['x = 9, y = 5', 'x = 5, y = 9', false, 'swapped x/y values'],
  ['y = 5, x = 9', 'x = 5, y = 9', false, 'swapped x/y values, names reordered'],
  ['x = -4, y = 3', 'x = 3, y = -4', false, 'swapped x/y, a negative'],
  ['a = -5, b = 4', 'a = 4, b = -5 | a=4,b=-5', false, 'swapped a/b'],
  ['5, 9', 'x = 5, y = 9', true, 'unnamed values in the key\'s order'],
  ['9, 5', 'x = 5, y = 9', false, 'unnamed values out of the key\'s order'],
  /* a point keeps its order */
  ['(3, -11)', '(3, -11) | (3, −11) | (3,-11)', true, 'a point as keyed'],
  ['(-11, 3)', '(3, -11) | (3, −11) | (3,-11)', false, 'a point reversed'],
  ['-3, 0', '(0, -3) | (0,-3) | 0, -3 | 0,-3', false, 'a point reversed, no brackets'],
  ['0 -3', '(0, -3) | (0,-3)', true, 'a point typed with a space'],
  /* an ordered phrase keeps its order */
  ['X to Y', 'X to Y', true, '"X to Y" as keyed'],
  ['Y to X', 'X to Y', false, 'reversed "X to Y"'],
  ['from Y to X', 'from X to Y', false, 'reversed "from X to Y"'],
  ['kinetic to thermal', 'kinetic to thermal | kinetic energy to thermal energy', true, 'an energy transfer as keyed'],
  ['thermal to kinetic', 'kinetic to thermal | kinetic energy to thermal energy', false, 'an energy transfer reversed'],
  ['B then A', 'A then B', false, 'reversed "A then B"'],
  ['2H2O → 2H2 + O2', '2H2 + O2 → 2H2O', false, 'an equation reversed'],
  ['O2 + 2H2 → 2H2O', '2H2 + O2 → 2H2O', true, 'an equation, one side reordered', true],
  ['16.2 to 16.1', '16.1 to 16.2', true, 'a band of numbers is a band, not an order', true],
  ['16.15', '16.1 to 16.2', true, 'a value inside a band'],
  /* a set stays a set */
  ['10, 5, 2, 1', '1, 2, 5, 10', true, 'a bare list is a set'],
  ['127° and 53°', '53° and 127°', true, 'two angles in any order'],
  ['84, 28, 98', '28, 84, 98 | rule: set 28/84/98', true, 'a rule: set in any order'],
  /* "I do not know" is not an answer */
  ['I do not know', 'rule: points max 1; no~not', false, '"I do not know" against a not/no alternative'],
  ['I don\'t know', 'rule: points max 1; no~not', false, '"I don\'t know" against a not/no alternative'],
  ['no', 'rule: points max 1; no~not', true, 'a plain no'],
  ['I do not know', 'I know', false, '"I do not know" is not "I know"'],
  /* near spellings that are other words */
  ['intracellular', 'intercellular', false, 'intra- is not inter-'],
  ['intercellular', 'intercellular', true, 'inter- as keyed'],
  ['intercelular', 'intercellular', true, 'a slip in inter- still counts'],
  ['amylose', 'amylase', false, 'amylose is not amylase'],
  ['amylase', 'amylase', true, 'amylase as keyed'],
  /* alleles keep their case */
  ['tt', 'Tt', false, 'tt is not Tt'],
  ['TT', 'Tt', false, 'TT is not Tt'],
  ['Tt', 'Tt', true, 'Tt as keyed'],
  ['tT', 'Tt', true, 'tT is Tt'],
  ['TT', 'tT', false, 'TT is not tT'],
  ['tT', 'tT', true, 'tT as keyed'],
  /* genotypes: allele by allele, either order inside one, a list holds exactly the key's */
  ['IAIA, IBIB', 'IAIO, IAIB', false, 'IAIA and IBIB are not IAIO and IAIB'],
  ['IOIO, IAIB', 'IAIO, IAIB', false, 'IOIO is not IAIO'],
  ['IAIO, IAIB', 'IAIO, IAIB', true, 'ABO genotypes as keyed'],
  ['IOIA and IBIA', 'IAIO, IAIB', true, 'alleles in either order'],
  ['IAIB, IAIO', 'IAIO, IAIB', true, 'a list of genotypes in another order'],
  ['IAIO', 'IAIO, IAIB', false, 'one genotype short'],
  ['IAIO, IAIB, IOIO', 'IAIO, IAIB', false, 'one genotype too many'],
  ['iaio, iaib', 'IAIO, IAIB', false, 'genotypes keep their case'],
  ['IOIA', 'IAIO', true, 'IOIA is IAIO'],
  ['IBIO', 'IAIO', false, 'IBIO is not IAIO'],
  ['XʰXᴴ', 'XᴴXʰ', true, 'X alleles in either order'],
  ['XᴴXᴴ', 'XᴴXʰ', false, 'XᴴXᴴ is not XᴴXʰ'],
  ['XhXH', 'XᴴXʰ', false, 'allele symbols must match'],
  ['Tt, tt', 'Tt, tt', true, 'a list of letter genotypes'],
  ['TT, tt', 'Tt, tt', false, 'TT is not Tt in a list'],
  /* the n't trap: n't is a not */
  ['it doesn\'t dissolve', 'rule: points max 1; does not dissolve', true, 'doesn\'t is does not'],
  ['it doesn\'t dissolve', 'rule: points max 1; dissolves~dissolve', false, 'doesn\'t dissolve is not dissolves'],
  ['it isn\'t alive', 'rule: points max 1; alive', false, 'isn\'t alive is not alive'],
  ['doesn\'t dissolve', 'does not dissolve', true, 'doesn\'t is does not, plain key'],
  ['it isn\'t alive', 'it is alive', false, 'isn\'t alive is not "it is alive"'],
  /* single values are untouched */
  ['9', '9', true, 'a single value'],
  ['5', '9', false, 'a single wrong value'],
];

function run() {
  const { ctx, call } = VQ.appCode();
  let pass = 0, known = 0, fixed = [], bad = [];
  for (const [typed, key, want, what, isKnown] of CASES) {
    ctx.__t = typed; ctx.__k = key;
    let got;
    try { got = !!call('markAnswer_(__t, __k)'); } catch (e) { got = 'error ' + e.message; }
    const ok = got === want;
    if (isKnown) { known++; if (ok) fixed.push(what); continue; }
    if (ok) pass++; else bad.push(JSON.stringify(typed) + ' for ' + JSON.stringify(key) + ' (' + what + '): ' + (want ? 'must pass' : 'must fail') + ', marked ' + got);
  }
  const n = CASES.length - known;
  console.log('marker-cases: ' + pass + '/' + n + ' right' + (known ? '; ' + known + ' known-failing' : ''));
  fixed.forEach(f => console.log('  now right, drop its known flag: ' + f));
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('marker-cases: ' + bad.length + ' case(s) marked wrongly');
  return { pass, n, known };
}
module.exports = { run, CASES };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
