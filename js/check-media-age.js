#!/usr/bin/env node
/* node js/check-media-age.js — HOW OLD YOU HAVE TO BE TO WATCH IT (406), through the real doPost and doGet: a child, an
   unknown-age student and nobody get only what their age allows (too old = a veil); adults and the admin all. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const rule = (ok, msg) => { if (!ok) bad.push(msg); };
const b = backend({});
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
const now = new Date();
const born = years => '15/01/' + (now.getFullYear() - years - (now.getMonth() === 0 && now.getDate() < 15 ? 1 : 0));
b.seed('people', [
  Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin', date_of_birth: born(9) }, base),
  Object.assign({ person_id: 'P-K1', first_name: 'Kit', last_name: 'Young', handle: 'kityoung', email: 'k1@example.org', role: 'student', date_of_birth: born(10) }, base),
  Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
  Object.assign({ person_id: 'P-T1', first_name: 'Tia', last_name: 'Teen', handle: 'tiateen', email: 't1@example.org', role: 'student', date_of_birth: born(16) }, base),
  Object.assign({ person_id: 'P-C1', first_name: 'Cal', last_name: 'Parent', handle: 'calparent', email: 'c1@example.org', role: 'client' }, base),
]);
const tok = {};
['a1', 'k1', 's1', 't1', 'c1'].forEach(e => {
  const r = b.post({ action: 'verifyLogin', email: e + '@example.org', pin: '0000' });
  if (!r.success) { console.log('could not sign in ' + e + ' — ' + r.error + '; NOTHING was checked.'); process.exit(1); }
  tok[e] = r;
});
if (!b.tabs.media) { console.log('There is no media tab in TAB/SCHEMA, so NOTHING was checked — not a pass.'); process.exit(1); }
const as = (e, body) => b.post(Object.assign({ token: tok[e].token, personId: tok[e].personId || (tok[e].person && tok[e].person.personId) }, body));
const fresh = () => { b.ev('clearCache()'); };
const get = who => b.get(who ? { token: tok[who].token } : {});

const save = (kind, id, age, title) => {
  const r = as('a1', { action: 'mediaSave', kind, url: kind === 'reel' ? 'https://youtube.com/shorts/' + id : 'https://youtu.be/' + id, title, age });
  rule(r.success, 'an admin could not save ' + title + ': ' + JSON.stringify(r));
  return r;
};
save('reel', 'AAAAAAAAAAA', '', 'For everyone');
save('reel', 'BBBBBBBBBBB', '12+', 'Twelve and up');
save('reel', 'CCCCCCCCCCC', '15', 'Fifteen and up');
save('video', 'DDDDDDDDDDD', '18', 'Eighteen and up');
const last = save('reel', 'jD2Yy_wCBLE', 'PG', 'A repository reel, rated');
save('reel', 'jD2Yy_wCBLE', '15', 'A repository reel, rated');
const ageCell = id => { const t = b.tabs.media || [[]]; const r = t.find(x => x[2] === id); return r ? String(r[t[0].indexOf('age')]) : 'no row'; };
rule(ageCell('BBBBBBBBBBB') === '12' && ageCell('jD2Yy_wCBLE') === '15' && ageCell('AAAAAAAAAAA') === '', 'the age was not written as whole years: ' + ageCell('BBBBBBBBBBB') + ', ' + ageCell('jD2Yy_wCBLE'));
rule(Array.isArray(last.media) && last.media.every(m => m.id), "the admin's own reply veiled a row");

const ids = g => (g.media || []).filter(m => m.id && !m.hidden).map(m => m.id).sort().join(',');
const veils = g => (g.media || []).filter(m => m.veil).length;
const ALL = 'AAAAAAAAAAA,BBBBBBBBBBB,CCCCCCCCCCC,DDDDDDDDDDD,jD2Yy_wCBLE';
const TWELVE = 'AAAAAAAAAAA,BBBBBBBBBBB';

/* EACH VIEWER, FROM A BUILT BODY AND THEN FROM THE KEPT ONE (the cache is per viewer, 398) */
const cases = [
  ['k1', 'AAAAAAAAAAA', 4, 'a ten-year-old student'],
  ['s1', TWELVE, 3, 'a student with no date of birth'],
  ['', TWELVE, 3, 'a signed-out visitor'],
  ['t1', 'AAAAAAAAAAA,BBBBBBBBBBB,CCCCCCCCCCC,jD2Yy_wCBLE', 1, 'a sixteen-year-old'],
  ['c1', ALL, 0, 'a client with no date of birth'],
  ['a1', ALL, 0, 'the admin (whose date of birth says nine)'],
];
fresh();
[0, 1].forEach(pass => cases.forEach(([who, want, nVeil, say]) => {
  const g = get(who);
  rule(ids(g) === want, say + (pass ? ' (kept copy)' : '') + ' sees ' + ids(g) + ', not ' + want);
  rule(veils(g) === nVeil, say + (pass ? ' (kept copy)' : '') + ' got ' + veils(g) + ' veils, not ' + nVeil);
  const leak = JSON.stringify(g.media || []);
  if (want !== ALL) rule(!/DDDDDDDDDDD/.test(leak), say + ' was sent the id of an 18 video');
}));
/* THE VEIL IS FNV-1a OF kind:id — the phone's `mediaVeil_` (games.js) sums the same; 957cb7b5 is check-flow's fixed answer. */
const gk = get('k1');
rule((gk.media || []).some(m => m.veil === '957cb7b5'), 'the rated repository Short does not come to the child as veil 957cb7b5: ' + JSON.stringify(gk.media));
fresh();
const ga = get('a1');
const r15 = (ga.media || []).find(m => m.id === 'CCCCCCCCCCC');
rule(r15 && r15.age === '15', 'the admin is not sent the age: ' + JSON.stringify(r15));

console.log('');
console.log('HOW OLD YOU HAVE TO BE TO WATCH IT, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
if (bad.length) { console.log('FAILED'); process.exit(1); }
console.log('OK — a ten-year-old, an unknown-age student and nobody see only what their age allows, built and kept; adults and the admin see all, with ages.');
