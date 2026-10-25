require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* node js/check-calc.js — THE CALCULATOR ENGINE, RUN: exact fractions, roots, powers, trig in degrees, DEL as a unit. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, 'arcade.js'), 'utf8');
const a = src.indexOf('/* ---------- THE CALCULATOR: KEYS AND ENGINE'), b = src.indexOf('/* ---------- END OF THE CALCULATOR ENGINE');
if (a < 0 || b < 0) { console.log('FAILED: could not find the calculator engine in arcade.js — nothing was checked, not a pass'); process.exit(1); }
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src.slice(a, b) + '\nthis.api = { calcNew, calcKey, calcHtml, calcText, CALC_KEYS, CALC_SHIFT };', ctx);
const { calcNew, calcKey, calcHtml, calcText, CALC_KEYS, CALC_SHIFT } = ctx.api;

const bad = [];
let n = 0;
const press = (keys, st = calcNew()) => { keys.forEach(k => calcKey(st, k)); return st; };
/* Keys, then '=': what the answer reads as text (fraction first; `dec` presses S⇔D). */
const sum = (label, keys, want, dec) => {
  n++;
  const st = press(keys.concat('='));
  if (dec) calcKey(st, 'sd');
  const got = st.err || (st.val == null ? '(nothing)' : calcText(st.val, st.dec));
  if (got !== want) bad.push(label + ': got ' + got + ', wanted ' + want);
};
const K = s => [...s];

sum('1/2 + 1/3, exact', ['frac', '1', 'down', '2', 'right', '+', 'frac', '1', 'down', '3'], '5/6');
sum('S⇔D on 5/6', ['frac', '5', 'down', '6'], '0.8333333333', true);
sum('0.1 + 0.2 is exactly 0.3', K('0.1+0.2'), '3/10');
sum('0.1 + 0.2 as a decimal', K('0.1+0.2'), '0.3', true);
sum('7 ÷ 2', K('7÷2'), '7/2');
sum('6 ÷ 3', K('6÷3'), '2');
sum('precedence', K('2+3×4'), '14');
sum('brackets', K('(2+3)×4'), '20');
sum('open bracket closed for you', K('2×(3+4'), '14');
sum('−3² is −9', ['neg', '3', 'sq'], '−9');
sum('(−3)²', ['(', 'neg', '3', ')', 'sq'], '9');
sum('2 to the 10', ['2', 'pow', '1', '0'], '1024');
sum('2 to the −2', ['2', 'pow', '−', '2'], '1/4');
sum('4 to the ½', ['4', 'pow', 'frac', '1', 'down', '2'], '2');
sum('x⁻¹ of 4', ['4', 'inv'], '1/4');
sum('x³ by SHIFT x²', ['3', 'shift', 'sq'], '27');
sum('√16', ['sqrt', '1', '6'], '4');
sum('√(9/4)', ['sqrt', 'frac', '9', 'down', '4'], '3/2');
sum('√2', ['sqrt', '2'], '1.414213562');
sum('3√2 implied ×', ['3', 'sqrt', '2'], '4.242640687');
sum('∛27 by SHIFT √', ['shift', 'sqrt', '2', '7'], '3');
sum('∛−8', ['shift', 'sqrt', 'neg', '8'], '−2');
sum('√−1', ['sqrt', 'neg', '1'], 'Math ERROR');
sum('sin 30 (degrees)', ['sin', '3', '0', ')'], '1/2');
sum('cos 60', ['cos', '6', '0'], '1/2');
sum('tan 45', ['tan', '4', '5'], '1');
sum('sin 90', ['sin', '9', '0'], '1');
sum('cos 90 is 0', ['cos', '9', '0'], '0');
sum('tan 90', ['tan', '9', '0'], 'Math ERROR');
sum('sin 40', ['sin', '4', '0'], '0.6427876097');
sum('sin⁻¹ 0.5 by SHIFT', ['shift', 'sin', '0', '.', '5'], '30');
sum('cos⁻¹ ½', ['shift', 'cos', 'frac', '1', 'down', '2'], '60');
sum('tan⁻¹ 1', ['shift', 'tan', '1'], '45');
sum('2sin(30) implied ×', ['2', 'sin', '3', '0', ')'], '1');
sum('π', ['pi'], '3.141592654');
sum('2π', ['2', 'pi'], '6.283185307');
sum('e by SHIFT π', ['shift', 'pi'], '2.718281828');
sum('log 1000', ['log', '1', '0', '0', '0'], '3');
sum('ln e', ['ln', 'shift', 'pi'], '1');
sum('3×10⁴', ['3', 'e10', '4'], '30000');
sum('2.5×10⁻³', ['2', '.', '5', 'e10', '−', '3'], '1/400');
sum('a big number', ['9', 'pow', '2', '0'], '1.215766546×10^19');
sum('division by zero', K('1÷0'), 'Math ERROR');
sum('a stray operator', K('2×'), 'Syntax ERROR');
sum('two points', K('1.2.3'), 'Syntax ERROR');
sum('an empty box', ['frac', '1', 'down'], 'Syntax ERROR');

/* Ans and carrying on from an answer. */
n++;
{ const st = press(K('3+4').concat('=', '×', '2', '='));
  if (calcText(st.val) !== '14') bad.push('× after an answer should carry on from Ans: got ' + calcText(st.val)); }
n++;
{ const st = press(K('3+4').concat('=', '5', '='));
  if (calcText(st.val) !== '5') bad.push('a digit after an answer should start a new sum: got ' + calcText(st.val)); }
n++;
{ const st = press(K('6').concat('=', 'Ans', 'sq', '='));
  if (calcText(st.val) !== '36') bad.push('Ans² after 6: got ' + calcText(st.val)); }

/* DEL: a function is one unit, an empty template one unit, the cursor moves through boxes. */
const shows = (label, keys, want) => {
  n++;
  const st = press(keys);
  const txt = calcHtml(st).input.replace(/<span class="mc-caret"><\/span>/g, '|').replace(/<span class="mc-box">/g, '[')
    .replace(/<[^>]+>/g, '');
  if (txt !== want) bad.push(label + ': the display reads ' + JSON.stringify(txt) + ', wanted ' + JSON.stringify(want));
};
shows('sin( is one token', ['2', 'sin', 'del'], '2|');
shows('cos⁻¹( is one token', ['shift', 'cos', 'del'], '|');
shows('an empty √ goes in one DEL', ['5', 'sqrt', 'del'], '5|');
shows('an empty fraction goes in one DEL', ['frac', 'del'], '|');
shows('x² goes in one DEL', ['3', 'sq', 'del'], '3|');
shows('insert at the cursor', ['1', '3', 'left', '2'], '12|3');
shows('DEL at the cursor', ['1', '2', '3', 'left', 'del'], '1|3');
shows('x² draws a raised 2, never ^2', ['3', 'sq'], '32|');
shows('√ draws a radical, never sqrt(', ['sqrt', '2'], '√2|');
n++;
{ const h = calcHtml(press(['sqrt', '2'])).input;
  if (!/class="mc-sqrt"/.test(h) || /sqrt\(/.test(h)) bad.push('√ is not drawn as a radical: ' + h); }
n++;
{ const h = calcHtml(press(['3', 'sq'])).input;
  if (!/<sup class="mc-sup">2<\/sup>/.test(h) || /\^/.test(h)) bad.push('x² is not drawn as a superscript: ' + h); }
n++;
{ const h = calcHtml(press(['frac', '1', 'down', '2'])).input;
  if (!/mc-num">1<\/span><span class="mc-den">2<span class="mc-caret">/.test(h)) bad.push('the fraction is not stacked with the cursor in its denominator: ' + h); }
n++;
{ const st = press(['frac', '1', 'down', '2', 'up', 'del']);   // ▲ to the numerator, DEL its digit
  if (calcText(press(['frac', '9', 'down', '4', 'up', 'right', 'right', '='], calcNew()).val) !== '9/4') bad.push('▲ then ▶ out of a fraction lost its place');
  if (JSON.stringify(st.root[0].n) !== '[]') bad.push('▲ from a denominator did not reach the numerator'); }
n++;
{ const st = press(['sqrt', '4', 'left', 'del']);   // DEL at the start of a box: the √ goes, the 4 stays
  if (st.root.length !== 1 || st.root[0].v !== '4') bad.push('DEL at the start of √ should unwrap it and keep the 4: ' + JSON.stringify(st.root)); }
n++;
{ const st = press(['2', 'pow', '3', 'right', '+', '1', '=']);   // ▶ leaves the exponent box
  if (calcText(st.val) !== '9') bad.push('▶ out of the exponent box: 2³+1 gave ' + calcText(st.val)); }
n++;
{ const keys = CALC_KEYS.map(k => k[0]);
  for (const k of ['shift', 'frac', 'sqrt', 'sq', 'pow', 'sin', 'cos', 'tan', 'del', 'C', 'sd', 'Ans', 'e10', '=', 'left', 'right', 'up', 'down', 'ok', 'pgup', 'pgdn', 'log', 'x', 'var'])
    if (!keys.includes(k)) bad.push('the keypad has no ' + k + ' key');
  const shifted = Object.keys(CALC_SHIFT).filter(k => keys.includes(k)).map(k => CALC_SHIFT[k]);
  for (const k of ['inv', 'pi', 'e', 'neg', 'approx', 'asin', 'cbrt', 'ln'])
    if (!shifted.includes(k)) bad.push('no key reaches ' + k + ' by SHIFT');
  if (keys.filter(k => !/^(on|home|set|back|up|left|ok|right|down|pgup|pgdn|shift|var|func|cat|tools)$/.test(k)).length !== 6 * 2 + 5 * 4)
    bad.push('the keypad is not the ClassWiz face: two rows of six function keys, four rows of five'); }

/* The ClassWiz's own keys: SHIFT legends as printed, FORMAT, EXE, ≈, OK and the scroll keys. */
sum('π by SHIFT 7', ['2', 'shift', '7'], '6.283185307');
sum('e by SHIFT 8', ['shift', '8'], '2.718281828');
sum('(−) by SHIFT −', ['shift', '−', '5', '+', '8'], '3');
sum('■⁻¹ by SHIFT ■^■', ['4', 'shift', 'pow'], '1/4');
sum('ln by SHIFT log', ['shift', 'log', 'shift', '8'], '1');
sum('OK is EXE', ['frac', '1', 'down', '4', 'ok'], '1/4');
sum('FORMAT is S⇔D', ['frac', '1', 'down', '4'], '0.25', true);
n++;
{ const st = press(['frac', '1', 'down', '8', 'shift', '=']);
  if (calcText(st.val, st.dec) !== '0.125') bad.push('SHIFT EXE (≈) should give the decimal: got ' + calcText(st.val, st.dec)); }
n++;
{ const st = press(K('2+3').concat('=', 'C', 'pgup'));
  if (calcHtml(st).input.replace(/<[^>]+>/g, '') !== '2+3') bad.push('the scroll key did not bring back the last sum'); }
n++;
{ const st = press(['7', 'shift', '4']);
  if (!/SHIFT A is not on this calculator/.test(calcHtml(st).output) || st.root.length !== 1) bad.push('SHIFT 4 (A) should say so and type nothing: ' + calcHtml(st).output); }
n++;
{ const st = press(['cat']);
  if (!/CATALOG is not on this calculator/.test(calcHtml(st).output)) bad.push('CATALOG should say it is not here'); }

/* Nothing typed is ever evaluated as code. */
n++;
if (/\bFunction\s*\(|\beval\s*\(/.test(src.slice(a, b))) bad.push('the engine calls eval or Function');

if (bad.length) { bad.forEach(x => console.log('  FAIL ' + x)); console.log('FAILED — ' + bad.length + ' of ' + n + ' calculator cases'); process.exit(1); }
console.log('OK — the calculator: ' + n + ' cases (fractions, roots, powers, degrees, Ans, DEL, drawing) as the Casio gives them');
