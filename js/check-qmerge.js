#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-qmerge.js ONE PAGE AND ONE MARKER PER CHECKER (1200): the merged markers mark every library part exactly as
   the per-type ones did. The old ones are frozen below; a difference on any typed answer of any type fails. */
const LIB_FULL = require('../check/lib-full.js');
LIB_FULL.needWords(); // LIB_PRIVATE=absent (CI, 780): skipped and counted, not passed
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const bad = [];

/* qtypes.js, Find and the library's row reader in one box; any other name is a do-nothing (as tools/qengine-health.js). */
const noop = new Proxy(function () { return noop; }, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : noop, apply: () => noop, construct: () => noop });
const box = { console, Math, JSON, String, Number, Array, Object, RegExp, Date, Set, Map, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Infinity, NaN, Error, __OUT: {} };
const P = new Proxy(box, { has: () => true, get: (t, k) => (k in t ? t[k] : k === Symbol.unscopables ? undefined : noop), set: (t, k, v) => { t[k] = v; return true; } });
const src = [fs.readFileSync(path.join(ROOT, 'js', 'qtypes.js'), 'utf8'), require('../tools/find-src.js').findSrc(), fs.readFileSync(path.join(ROOT, 'js', 'library.js'), 'utf8'), fs.readFileSync(path.join(ROOT, 'js', 'working.js'), 'utf8'), fs.readFileSync(path.join(ROOT, 'js', 'qtools.js'), 'utf8')].join('\n;\n');
vm.runInNewContext('with (__P) {' + src + '\n;Object.assign(__OUT, { markPart_, markerOf_, choicePicks_, markOrder_, orderWays_, markAnswer_, markWords_, qType_, libQuestion_, QTYPE_PROTOCOL, QTYPE_ORDER, qtKeys_ }); }', { __P: P }, { timeout: 30000 });
const M = box.__OUT;
/* THE TYPE from qtypes.js alone, as check-qtypes.js reads it: Find's own names must not shadow its words */
M.qType_ = vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'qtypes.js'), 'utf8') + ';qType_', vm.createContext({}));

/* THE OLD MARKER, frozen as it stood before the merge: options and orders were two code paths. */
function oldMarkPart(x, typed) {
  const m = M.markerOf_(x || {});
  if (m.kind === 'choice' || m.kind === 'order') {
    const p = M.choicePicks_(x, typed);
    if (p === null) return null;
    if (m.kind === 'order') return { got: M.markOrder_(p, M.orderWays_(x)) ? 1 : 0, of: 1 };
    const r = (x.choiceRight || []).slice().sort((a, b) => a - b).join(',');
    return { got: p.slice().sort((a, b) => a - b).join(',') === r ? 1 : 0, of: 1 };
  }
  if (m.kind === 'accept') { const v = M.markAnswer_(typed, x.accept); return v === null ? null : { got: v ? 1 : 0, of: 1 }; }
  if (m.kind === 'words') {
    const w = M.markWords_(typed, x.markWords);
    if (!w) return null;
    const of = Math.max(1, Math.min(w.of, Number(x.marks) || w.of));
    return { got: Math.min(w.got, of), of, words: true };
  }
  return String(typed == null ? '' : typed).trim() ? { ai: true } : null;
}
/* THE OLD KEYPAD LAYERS, frozen: which types opened on maths, which on the essay sheet. */
const OLD_MATHS = { value: 1, unit: 1, multi: 1, fraction: 1, coords: 1, expr: 1, measure: 1 };
M.QTYPE_ORDER.forEach(t => {
  const k = M.qtKeys_(t), want = t === 'essay' ? 'sheet' : OLD_MATHS[t] ? 'maths' : 'letters';
  if (k !== want) bad.push(`type ${t} opens the pad on ${k}, it opened on ${want}`);
});

/* WHAT A CHILD MIGHT TYPE: every accepted way, the key words, every option alone, in pairs, all of them, the right ones and backwards. */
function tries(x) {
  const out = ['', '0', '7', 'no', 'xyz'];
  String(x.accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w)).forEach(w => out.push(w, w + ' cm', '-' + w));
  String(x.markWords || '').split(/[;|]/).map(w => w.trim()).filter(Boolean).forEach(w => out.push(w));
  if (x.markWords) out.push(String(x.markWords).replace(/[;|]/g, ' '));
  const n = (x.choices || []).length, L = i => String.fromCharCode(97 + i);
  for (let i = 0; i < n; i++) { out.push(L(i), String(i + 1), String(x.choices[i])); for (let j = 0; j < n; j++) if (j !== i) out.push(L(i) + ',' + L(j)); }
  if (n) out.push([...Array(n).keys()].map(L).join(','), [...Array(n).keys()].map(L).reverse().join(', '));
  [x.choiceRight || []].concat(x.choiceWays || []).forEach(w => { if (w.length) out.push(w.join(','), w.slice().reverse().join(','), w.map(i => L(i - 1)).join(' then ')); });
  return out;
}

let rows = [], parts = 0, typed = 0, keyless = 0;
const seen = {};
try { rows = LIB_FULL.rows('questions'); } catch (e) { bad.push('data/questions.json did not read: ' + e.message); }
rows.forEach(r => {
  if (!r || r.kind === 'document') return;
  let x, t;
  try { t = M.qType_(r); x = M.libQuestion_(r); } catch (e) { if (bad.length < 40) bad.push(r.row_id + ' would not read: ' + e.message); return; }
  parts++;
  seen[t] = (seen[t] || 0) + 1;
  tries(x).forEach(a => {
    typed++;
    let was, now;
    try { was = JSON.stringify(oldMarkPart(x, a)); } catch (e) { was = 'threw ' + e.message; }
    try { now = JSON.stringify(M.markPart_(x, a)); } catch (e) { now = 'threw ' + e.message; }
    /* A KEYLESS CHOOSE (Check says no scheme, never marks): the old set test matched no picks to no key as right; now never right */
    if (was !== now && !M.markerOf_(x).ready && /"got":1/.test(was) && /"got":0/.test(now)) { keyless++; return; }
    if (was !== now && bad.length < 40) bad.push(`${r.row_id} (${t}) "${a}": marked ${now}, was ${was}`);
  });
});
if (process.env.VERBOSE) console.log(JSON.stringify(seen));
if (rows.length && !parts) bad.push('no question parts read — nothing was compared');
const missing = M.QTYPE_ORDER.filter(t => !seen[t]);
if (rows.length && missing.length) bad.push('no part of type ' + missing.join(', ') + ' in the library — that type was not compared');

if (bad.length) { console.log('check-qmerge: FAILED'); bad.forEach(b => console.log('  ✗ ' + b)); process.exit(1); }
console.log(`check-qmerge: ok — ${parts} parts, ${typed} typed answers, every type marked as before (${keyless} keyless-choose answers no longer right, unreachable: their Check says no scheme); pad layers unchanged`);
