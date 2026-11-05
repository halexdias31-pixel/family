#!/usr/bin/env node
/* @family. — tools/answer-health.js EVERY VERIFIED ANSWER MARKS ITSELF RIGHT AND A WRONG ONE WRONG (920), data/answer-health.json. */
/* Runs js/find.js's own markers (markAnswer_, markOrder_) in node, no browser: each verified question's first accepted way typed */
/* must mark true, a nonsense answer must mark false. LIB_PRIVATE=absent: nothing to type, so it writes a skip with its count. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'answer-health.json');
const LIB = require('../check/lib-full.js');
const t0 = Date.now();
let rows;
try { rows = JSON.parse(LIB.text('questions')); }
catch (e) {
  fs.writeFileSync(OUT, JSON.stringify({ skipped: true, why: String(e.code || e.message).slice(0, 200), checked: 0, wrong: [] }, null, 1) + '\n');
  console.log('answer-health: skipped — the answers are not here (' + (e.code || 'no words') + ')'); process.exit(0);
}
/* find.js IN A BOX: any name it reaches for that is not its own is a harmless do-nothing, so only its pure markers are trusted. */
const noop = new Proxy(function () { return noop; }, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : noop, apply: () => noop, construct: () => noop });
const box = { console, Math, JSON, String, Number, Array, Object, RegExp, Date, Set, Map, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Infinity, NaN, Error, __OUT: {} };
const P = new Proxy(box, { has: () => true, get: (t, k) => (k in t ? t[k] : k === Symbol.unscopables ? undefined : noop), set: (t, k, v) => { t[k] = v; return true; } });
const src = fs.readFileSync(path.join(ROOT, 'js', 'find.js'), 'utf8');
try { vm.runInNewContext('with (__P) {' + src + '\n;__OUT.markAnswer_ = markAnswer_; __OUT.markOrder_ = markOrder_; }', { __P: P }, { timeout: 20000 }); }
catch (e) { console.error('answer-health: find.js would not load in the box — ' + e.message); process.exit(2); }
const { markAnswer_ } = box.__OUT;
/* THE MARKER PROVES ITSELF FIRST: a box that turned it into a do-nothing would pass every question. */
if (markAnswer_('5', '5') !== true || markAnswer_('7', '5') !== false) { console.error('answer-health: the boxed markAnswer_ does not mark (5 vs 5, 7 vs 5)'); process.exit(2); }
const yes = v => /^(true|yes|1)$/i.test(String(v || '').trim());
const WRONG = 'qzx 98765.4321 nonsense';
const out = { skipped: false, checked: 0, untestable: 0, wrong: [] };
rows.filter(r => r && yes(r.verified) && String(r.accept || '').trim()).forEach(r => {
  const ways = String(r.accept).split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  if (!ways.length) { out.untestable++; return; }
  out.checked++;
  let right, wrong;
  try { right = markAnswer_(ways[0], r.accept); } catch (e) { right = 'threw: ' + e.message; }
  try { wrong = markAnswer_(WRONG, r.accept); } catch (e) { wrong = 'threw: ' + e.message; }
  if (right !== true) out.wrong.push({ id: r.row_id, why: 'its own accepted answer "' + ways[0].slice(0, 40) + '" marks ' + right });
  if (wrong === true) out.wrong.push({ id: r.row_id, why: 'a nonsense answer marks right' });
});
out.ms = Date.now() - t0;
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`answer-health: ${out.checked} verified answers typed, ${out.wrong.length} mark wrongly, ${out.untestable} only by rule (${out.ms} ms)`);
