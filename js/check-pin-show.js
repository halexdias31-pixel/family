#!/usr/bin/env node
/* node js/check-pin-show.js — "SHOW PIN" ON A PERSON'S CARD (452), through the real backend: `pinShow` answers an
   admin with the named person's PIN, "No PIN" for an empty cell, and refuses everybody else. -v for the detail. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const base = { pin: '0000', verified: 'TRUE', listed: true };
const PEOPLE = [
  Object.assign({}, base, { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'admin@example.org' }),
  Object.assign({}, base, { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent', handle: 'patparent', email: 'parent@example.org' }),
  Object.assign({}, base, { person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor', handle: 'adatutor', email: 'tutor@example.org' }),
  /* A CELL THE SHEET MADE A NUMBER: 0000 arrives as 0 and must be said as four digits. */
  Object.assign({}, base, { person_id: 'P-S1', role: 'student', first_name: 'Sam', last_name: 'Student', handle: 'samstudent', email: 'student@example.org', pin: 0 }),
  Object.assign({}, base, { person_id: 'P-N1', role: 'student', first_name: 'Nell', last_name: 'Nopin', handle: 'nellnopin', email: 'nopin@example.org', pin: '' }),
];

const bad = [];
let asked = 0;
const b = backend();
b.seed('people', PEOPLE);
const tok = {};
['P-A1', 'P-C1', 'P-T1'].forEach(id => {
  const p = PEOPLE.find(x => x.person_id === id);
  const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
  if (d.success) tok[id] = d.token; else bad.push(id + ' could not sign in — ' + d.error);
});
if (!tok['P-A1']) { console.log('check-pin-show: the admin could not sign in, so NOTHING was checked — not a pass.'); process.exit(1); }
const ask = (who, target, extra) => b.post(Object.assign({ action: 'pinShow', token: tok[who], targetId: target }, extra || {}));

/* 1. NOBODY BUT AN ADMIN — a parent, a tutor, no token, and a non-admin naming the admin's id as their own. */
['P-C1', 'P-T1'].forEach(id => {
  asked++;
  const d = ask(id, 'P-C1');
  if (d.success || 'pin' in d || !d.error) bad.push(id + ' asked pinShow and was answered ' + JSON.stringify(d));
});
asked++;
{ const d = b.post({ action: 'pinShow', targetId: 'P-C1' });
  if (d.success || 'pin' in d) bad.push('pinShow with no token answered ' + JSON.stringify(d)); }
asked++;
{ const d = ask('P-C1', 'P-T1', { personId: 'P-A1', name: 'Hal Admin', adminName: 'Hal Admin' });
  if (d.success || 'pin' in d) bad.push('a parent claiming the admin\'s id was answered ' + JSON.stringify(d)); }

/* 2. AN ADMIN GETS THE NAMED PERSON'S PIN, AND "No PIN" FOR AN EMPTY CELL. */
asked++;
{ const d = ask('P-A1', 'P-C1'); if (!d.success || d.pin !== '0000') bad.push('the admin asked for Pat\'s PIN and got ' + JSON.stringify(d)); }
asked++;
{ const d = ask('P-A1', 'P-S1'); if (!d.success || d.pin !== '0000') bad.push('a PIN cell held as the number 0 was answered ' + JSON.stringify(d) + ', not "0000"'); }
asked++;
{ const d = ask('P-A1', 'P-N1'); if (!d.success || d.pin || d.said !== 'No PIN') bad.push('an empty PIN cell was answered ' + JSON.stringify(d) + ', not "No PIN"'); }
asked++;
{ const d = ask('P-A1', 'P-ZZ'); if (d.success || 'pin' in d) bad.push('an id nobody has was answered ' + JSON.stringify(d)); }
asked++;
{ const d = ask('P-A1', ''); if (d.success || 'pin' in d) bad.push('no id at all was answered ' + JSON.stringify(d)); }

/* 3. ACCESS IS THE TABLE'S, ONE WORD. */
asked++;
if (b.ev('ACTION_ACCESS.pinShow') !== 'admin') bad.push('ACTION_ACCESS.pinShow is ' + JSON.stringify(b.ev('ACTION_ACCESS.pinShow')) + ', not admin');

console.log('pin-show: ' + asked + ' asked, ' + bad.length + ' wrong');
bad.forEach(x => console.log('  ' + x));
if (bad.length) { console.log('FAILED — a PIN shown to anybody but an admin, or the wrong person\'s, is a way into their account.'); process.exit(1); }
console.log('OK — pinShow answers an admin with the named person\'s PIN or "No PIN", and refuses everybody else.');
