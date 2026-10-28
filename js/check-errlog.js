#!/usr/bin/env node
/* node js/check-errlog.js — THE ERROR LOG (O5) of the real `doPost`: one counted row per distinct error, one claude_notes line each,
   scrubbed, throttled per device and day, listed for an admin alone. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');
const bad = [];
const b = backend();
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
b.seed('people', [
  Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'aa2026', email: 's1@example.org', role: 'student' }, base),
  Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'hl2026', email: 'a1@example.org', role: 'admin' }, base),
]);
b.seed('client_errors', []);
b.seed('claude_notes', []);
const tok = e => { const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' }); if (!d.success) bad.push('could not sign in ' + e); return d.token; };
const ADA = tok('s1@example.org'), HAL = tok('a1@example.org');
const tab = name => {
  const g = b.tabs[name];
  if (!g) return [];
  return g.slice(1).map(r => { const o = {}; g[0].forEach((c, i) => { o[c] = r[i]; }); return o; });
};
const m = more => Object.assign({ action: 'clientError', message: 'x is null near s9@example.org 12345678', where: 'draw:feed', version: 'v1', screen: 'feed', device: 'D1' }, more || {});

[m(), m(), m({ device: 'D2' })].forEach(x => { const d = b.post(x); if (!d.success) bad.push('a report was refused: ' + JSON.stringify(d)); });
let rows = tab('client_errors');
if (rows.length !== 1) bad.push('three of one error made ' + rows.length + ' rows, want 1');
else {
  if (Number(rows[0].count) !== 3) bad.push('its count is ' + rows[0].count + ', want 3');
  if (/@|12345678/.test(rows[0].message)) bad.push('an address or a long number was kept: ' + rows[0].message);
}
b.post(m({ where: 'act:x' }));
rows = tab('client_errors');
if (rows.length !== 2) bad.push('a second where made ' + rows.length + ' rows in all, want 2');
const notes = tab('claude_notes').filter(n => /^\[error\]/.test(n.note || ''));
if (notes.length !== 2) bad.push(notes.length + ' claude_notes lines for 2 distinct errors, want 2');

let thr = 0;
for (let i = 0; i < 30; i++) if (b.post(m({ device: 'D9', message: 'flood ' + i })).throttled) thr++;
if (!thr) bad.push('thirty reports from one device in a day were all kept');

if (!b.post({ action: 'listClientErrors', token: ADA }).error) bad.push('a student was shown the error log');
if (!b.post({ action: 'listClientErrors' }).error) bad.push('nobody signed in was shown the error log');
const l = b.post({ action: 'listClientErrors', token: HAL });
if (!l.success || !Array.isArray(l.errors) || !l.errors.length) bad.push('the admin was not shown the error log: ' + JSON.stringify(l).slice(0, 200));

if (bad.length) { console.error('check-errlog: ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-errlog: one row per distinct error, counted; one note each; scrubbed; throttled (' + thr + ' of 30); admin-only list');
