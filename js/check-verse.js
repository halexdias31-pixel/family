/* @family. — check-verse.js: ?verse= answers a short verse, a different one each day, never the same twice in a cycle, and builds no payload (369). */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load');

const b = backend();
const fails = [];
/* EVERY SHEET OPENED IS COUNTED: the verse may look at the Ledger's `verses` tab, and `people` for `jsonOut`'s surname net, nothing else. */
b.ev(`(function(){ const o = SpreadsheetApp.openById; globalThis.OPENED_ = [];
  SpreadsheetApp.openById = id => { const bk = o(id), g = bk.getSheetByName.bind(bk);
    return Object.assign(Object.create(bk), { getSheetByName: n => { OPENED_.push(n); return g(n); } }); }; })()`);
const ask = d => { const v = b.get({ verse: d }); return v.text && v.ref ? v.text + '\n' + v.ref : JSON.stringify(v); };
const N = b.ev('VERSES.length');
if (N < 30) fails.push('only ' + N + ' verses');
b.ev('VERSES').forEach(v => { if (v[0].length > 220 || !v[1]) fails.push('too long or no reference: ' + v[1]); });

const seen = new Set();
let prev = null;
for (let i = 0; i < N; i++) {
  const d = new Date(Date.UTC(2026, 9, 19 + i)).toISOString().slice(0, 10);
  const t = ask(d), lines = t.split('\n');
  if (lines.length !== 2 || !lines[0] || !lines[1]) fails.push(d + ': not "verse\\nref": ' + t);
  if (t === prev) fails.push(d + ': same as the day before');
  if (seen.has(t)) fails.push(d + ': repeats inside one cycle of ' + N);
  seen.add(t); prev = t;
}
if (ask('2026-10-19') !== ask('2026-10-19')) fails.push('not the same verse for the same day');
if (!ask('today').includes('\n')) fails.push('?verse=today gave nothing');
const opened = b.ev('OPENED_').filter(n => n !== 'verses' && n !== 'people');
if (opened.length) fails.push('opened tabs besides `verses` (a payload being built?): ' + opened.join(', '));

if (fails.length) { console.log('FAILED — ?verse=\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('check-verse: ' + N + ' verses, ' + N + ' days without a repeat, no payload');
