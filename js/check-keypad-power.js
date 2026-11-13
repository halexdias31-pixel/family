#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-keypad-power.js THE POWER KEY TYPES LIKE A CASIO (owner, 13 Nov: "On my Casio I never get issues with powers"): § */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const { cutFrom, markingSource } = require('./check-marks-load.js');
const findSrc = require('../tools/find-src.js').findSrc(ROOT);
const typeset_ = require('../tools/typeset-src.js').typesetFn(findSrc, cutFrom);
const kp = require('../tools/piece-src.js').pieceSrc('keypad', ROOT);
const bad = [];
if (!typeset_) { console.log('FAIL — check-keypad-power: typeset_ not found'); process.exit(1); }

/* THE KEYPAD'S EDITING, cut out by name and run on a stand-in box that keeps a value and a caret, as an <input> does. */
const KP_NAMES = ['KP_HOLE', 'KP_SEL_A', 'KP_VEC_A', 'kpVecStep_', 'kpPartner_', 'kpLineStart_', 'kpLineEnd_',
  'kpPowAt_', 'kpPowOut_', 'kpEdit_', 'kpTypeset_'];
const kpParts = KP_NAMES.map(n => [n, cutFrom(kp, n)]);
kpParts.filter(p => !p[1]).forEach(p => bad.push('keypad: ' + p[0] + ' not found in js/keypad-*.js'));
const ctx = { typeset_, esc: require('./check-esc.js').esc,
  vecHtml_: s => s, kpSite_: () => false, kpUndoNote_: () => {}, Event: function () {}, console };
vm.createContext(ctx);
vm.runInContext(kpParts.filter(p => p[1]).map(p => p[1].replace(/^const /, 'var ')).join('\n'), ctx);
/* THE MARKER, as check-marking.js runs it */
const marks = markingSource(ROOT);
if (marks.missing.length) bad.push('marking: ' + marks.missing.join(', ') + ' not found');
const mctx = { console };
vm.createContext(mctx);
vm.runInContext(marks.source + '\nthis.markAnswer_ = markAnswer_;', mctx);
/* THE CALCULATOR, as check-calc.js runs it */
const csrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-engine.js'), 'utf8');
const ca = csrc.indexOf('/* ---------- THE CALCULATOR: KEYS AND ENGINE'), cb = csrc.indexOf('/* ---------- END OF THE CALCULATOR ENGINE');
const cctx = {};
vm.createContext(cctx);
/* THE KEYPAD'S TEXT PRESSED AS CALCULATOR KEYS (owner, 13 Nov): the stored 10^(−14), 2³, 6.02×10^23, 1e-14 and 2**3 pressed and worked; null when it is no sum. */
const CALC_SUPS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
function calcTextVal(text) {
  let s = String(text == null ? '' : text).replace(/<sup>(.*?)<\/sup>/g, '^($1)').replace(/\s+/g, '').replace(/\*\*/g, '^')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, m => '^(' + [...m].map(c => CALC_SUPS[c]).join('') + ')')
    .replace(/(\d)[eE]([-+−]?\d+)/g, '$1×10^($2)').replace(/(\d)[xX](?=\d)/g, '$1×').replace(/\*/g, '×').replace(/\//g, '÷')
    .replace(/\^([-+−]?[\d.]+)/g, '^($1)').replace(/[-‐–]/g, '−');
  if (!s || /[^0-9.+−×÷()^π]/.test(s)) return null;
  const st = calcNew(), shut = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '^' && s[i + 1] === '(') { calcKey(st, 'pow'); shut.push(true); i++; }
    else if (c === '(') { calcKey(st, '('); shut.push(false); }
    else if (c === ')') calcKey(st, shut.pop() ? 'right' : ')');
    else if (c === '^') return null;
    else calcKey(st, c === 'π' ? 'pi' : c);
  }
  calcKey(st, '=');
  return st.err || st.val == null ? null : cF(st.val);
}
vm.runInContext(csrc.slice(ca, cb) + '\nconst CALC_SUPS = ' + JSON.stringify(CALC_SUPS) + ';\n' + calcTextVal + '\nthis.api = { calcNew, calcKey, calcText, calcTextVal };', cctx);

function box() {
  return { value: '', selectionStart: 0, selectionEnd: 0, tagName: 'INPUT',
    getAttribute: k => (k === 'data-kp' ? 'maths' : null), setSelectionRange(a, b) { this.selectionStart = a; this.selectionEnd = b; },
    dispatchEvent() {}, classList: { contains: () => false } };
}
/* A KEY AS THE PAD SENDS IT: '^' the power key, '²' '³' the squared and cubed keys, '→' '←' the arrows, '⌫' delete, '−' the minus key. */
const KEY = { '^': '!pow', '→': '!right', '←': '!left', '⌫': '!back', '−': '-', '√': '!sqrt' };
function press(seq) {
  const b = box();
  [...seq].forEach(k => ctx.kpEdit_(b, KEY[k] || k));
  return b;
}
const drawn = b => ctx.kpTypeset_(b.value, -1).replace(/<span class="kp-hole"><\/span>/g, '□');
const near = (a, b) => a != null && b != null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
const valOf = t => { try { return cctx.api.calcTextVal(t); } catch (e) { return 'threw ' + (e.calc || e.message); } };

/* keys, the stored text, the drawing, the value. */
const SEQ = [
  ['2^3', '2^(3)', '2<sup>3</sup>', 8],
  ['2^3→+1', '2^(3)+1', '2<sup>3</sup>+1', 9],
  ['2^3+1', '2^(3)+1', '2<sup>3</sup>+1', 9],
  ['2^3×4', '2^(3)×4', '2<sup>3</sup>×4', 32],
  ['2^12', '2^(12)', '2<sup>12</sup>', 4096],
  ['(2+3)^2', '(2+3)^(2)', '(2+3)<sup>2</sup>', 25],
  ['2^(1+2)→+1', '2^((1+2))+1', '2<sup>(1+2)</sup>+1', 9],
  ['2^(1+2)', '2^((1+2))', '2<sup>(1+2)</sup>', 8],
  ['x^n+1', 'x^(n+1)', 'x<sup>n+1</sup>', null],
  ['2^3^2', '2^(3^(2))', '2<sup>3<sup>2</sup></sup>', 512],
  ['10^−14', '10^(-14)', '10<sup>&minus;14</sup>', 1e-14],
  ['10^−14→+1', '10^(-14)+1', null, 1 + 1e-14],
  ['6.02×10^23', '6.02×10^(23)', '6.02×10<sup>23</sup>', 6.02e23],
  ['1.6×10^−19', '1.6×10^(-19)', '1.6×10<sup>&minus;19</sup>', 1.6e-19],
  ['5²', '5²', '5²', 25],
  ['2³+1', '2³+1', '2³+1', 9],
  ['2^3⌫4', '2^(4)', '2<sup>4</sup>', 16],
  ['2^3⌫⌫', '2', '2', 2],
  ['2^⌫', '2', '2', 2],
  ['2^3→⌫', '2^(3)', null, 8],
  ['2^3→⌫⌫5', '2^(5)', '2<sup>5</sup>', 32],
  ['2^3→+1←←←7', '2^(37)+1', null, Math.pow(2, 37) + 1],
  ['2^→1', '2^()1', null, null],
];
SEQ.forEach(([keys, text, html, val]) => {
  const b = press(keys);
  if (b.value !== text) bad.push('keys ' + keys + ': stored "' + b.value + '", wanted "' + text + '"');
  const d = drawn(b).replace(/−/g, '&minus;');
  if (html != null && d !== html) bad.push('keys ' + keys + ': drawn ' + d + ', wanted ' + html);
  if (val != null) {
    const v = valOf(b.value);
    if (!near(v, val)) bad.push('keys ' + keys + ': the calculator reads "' + b.value + '" as ' + v + ', wanted ' + val);
    const m = mctx.markAnswer_(b.value, String(val));
    if (m !== true && Math.abs(val) < 1e15) bad.push('keys ' + keys + ': "' + b.value + '" marked ' + m + ' against ' + val);
  }
});
/* THE CARET IN A RAISED BOX is drawn inside the <sup>, so the child sees where the next digit goes. */
{
  const b = press('2^');
  const h = ctx.kpTypeset_(b.value, b.selectionStart);
  if (!/<sup>[^]*kp-caret[^]*<\/sup>/.test(h)) bad.push('after 2 then the power key the caret is not drawn in the raised box: ' + h);
}

/* EVERY WAY A POWER IS WRITTEN MARKS AS THE SAME NUMBER: typed, keypad-stored, superscript, e-notation. */
const SAME = [
  ['8', ['2^3', '2**3', '2³', '2^(3)', '2<sup>3</sup>']],
  ['2^3', ['8', '2**3', '2³', '2^(3)']],
  ['10^-14', ['1e-14', '1×10^-14', '1x10^-14', '1 × 10⁻¹⁴', '10⁻¹⁴', '10^(-14)', '10^(−14)', '1 × 10^(−14)', '1.0×10^-14']],
  ['1×10^-14', ['10^(-14)', '1e-14', '10⁻¹⁴']],
  ['6.02×10^23', ['6.02×10^(23)', '6.02x10^23', '6.02e23', '6.02 × 10²³', '6.02*10^23', '602000000000000000000000']],
  ['1.6×10^-19', ['1.6×10^(-19)', '1.6e-19', '1.6 × 10⁻¹⁹', '1.6x10^-19']],
  ['9', ['2³+1', '2^(3)+1']],
];
SAME.forEach(([want, ways]) => ways.forEach(w => {
  const m = mctx.markAnswer_(w, want);
  if (m !== true) bad.push('marking: "' + w + '" against "' + want + '" is ' + m + ', wanted right');
}));
/* A MINUS IN AN EXPONENT IS NEVER A SUBTRACTION FROM THE BASE, nor a wrong power right. */
[['10^-14', ['10-14', '-4', '10^14', '1×10^14']], ['1.6×10^-19', ['1.6×10^19', '1.6-19']], ['8', ['2^4', '2³+1']]]
  .forEach(([want, ways]) => ways.forEach(w => {
    const m = mctx.markAnswer_(w, want);
    if (m === true) bad.push('marking: "' + w + '" against "' + want + '" is marked right, wanted wrong');
  }));
[['10^(-14)', 1e-14], ['10^(−14)', 1e-14], ['1×10^(-14)', 1e-14], ['1e-14', 1e-14], ['2³', 8], ['10⁻¹⁴', 1e-14], ['2^(3^(2))', 512]]
  .forEach(([t, v]) => { const got = valOf(t); if (!near(got, v)) bad.push('calculator: "' + t + '" read as ' + got + ', wanted ' + v); });

if (bad.length) {
  console.log('FAIL — check-keypad-power: ' + bad.length + ' problem(s)');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('check-keypad-power: ' + SEQ.length + ' key sequences and ' + SAME.reduce((n, s) => n + s[1].length, 0) + ' written forms, typed, drawn, worked and marked as a Casio would');
