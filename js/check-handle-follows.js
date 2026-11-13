#!/usr/bin/env node
/* node js/check-handle-follows.js — THE HANDLE FOLLOWS THE FIRST NAME (`handleFollow_`), asked of the real backend.
   A rename moves it, the old one signs in, a clash takes a counter, the backfill repeats safely. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const rule = (ok, why) => { if (!ok) bad.push(why); };
const base = { pin: '0000', verified: 'TRUE', role: 'student', joined_on: '2026-01-05', date_of_birth: new Date(1990, 2, 4) };
const b = backend({});
b.seed('people', [
  Object.assign({}, base, { person_id: 'P-F1', first_name: 'Fenna', last_name: 'Testrow', handle: 'fena2026', email: 'f1@example.org' }),
  Object.assign({}, base, { person_id: 'P-F2', first_name: 'Finney', last_name: 'Otherrow', handle: 'fiey2026', joined_on: '2026-01-01', email: 'f2@example.org' }),
  Object.assign({}, base, { person_id: 'P-F3', first_name: 'Odo', last_name: 'Wrongrow', handle: 'zz2026', email: 'f3@example.org' }),
  Object.assign({}, base, { person_id: 'P-AD', first_name: 'Ida', last_name: 'Adminrow', handle: 'ia2026', email: 'ad@example.org', role: 'admin' }),
]);
const signIn = who => b.post({ action: 'verifyLogin', email: who, pin: '0000' });
const tok = e => signIn(e).token;

/* 1. A RENAME BY THE PERSON: Fenna to Finley, but fiey2026 is an earlier joiner's, so a counter (fiey20262). */
const me = tok('f1@example.org');
const ed = b.post({ token: me, action: 'updateProfile', targetId: 'P-F1', fields: { first_name: 'Finley' } });
const f1 = b.row('P-F1');
rule(ed.success && f1.handle === 'fiey20262', 'renaming to Finley beside fiey2026 gave ' + f1.handle + ' ' + JSON.stringify(ed));
rule(String(f1.handle_was).split(',')[0].trim() === 'fena2026' && !!f1.handle_changed_at, 'the old handle was not kept at the front of handle_was: ' + f1.handle_was);
rule(signIn('fiey20262').success, 'the new handle does not sign in');
rule(signIn('fena2026').success, 'the old handle no longer signs in');
rule(b.ev('clearCache(); findPerson("fena2026").person_id') === 'P-F1', 'findPerson does not resolve the old handle');
/* A SAVE THAT KEEPS THE NAME moves nothing. */
b.post({ token: me, action: 'updateProfile', targetId: 'P-F1', fields: { first_name: 'Finley' } });
rule(b.row('P-F1').handle === 'fiey20262', 'saving the same first name moved the handle');

/* 2. AN ADMIN RENAME takes the same rule. */
const ad = tok('ad@example.org');
const sv = b.post({ token: ad, personId: 'P-AD', action: 'personSave', targetId: 'P-F2', firstName: 'Tessa', lastName: 'Otherrow', roles: ['student'], email: 'f2@example.org' });
rule(sv.success && b.row('P-F2').handle === 'tesa2026', 'an admin rename to Tessa gave ' + b.row('P-F2').handle + ' ' + JSON.stringify(sv));
rule(signIn('fiey2026').success, 'the admin-renamed person\'s old handle no longer signs in');

/* 3. THE BACKFILL: the stray handle moves, every handle stays unique, and a second run moves nothing. */
const once = b.ev('clearCache(); JSON.stringify(renameHandles_())');
rule(b.row('P-F3').handle === 'oddo2026', 'the backfill gave Odo ' + b.row('P-F3').handle + ' ' + once);
const hs = b.tabs.people.slice(1).map(r => r[b.tabs.people[0].indexOf('handle')]);
rule(new Set(hs).size === hs.length, 'two people share a handle: ' + hs.join(' '));
rule(JSON.parse(b.ev('clearCache(); JSON.stringify(renameHandles_())')).renamed === 0, 'the backfill is not idempotent');
rule(b.ev('MIGRATIONS.some(m => m.id === "handles-follow-first-name")') === true, 'no handles-follow-first-name migration');

if (bad.length) { console.log('FAILED — the handle does not follow the first name:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — a renamed first name moves the handle, the old one still signs in, clashes stay unique, the backfill repeats safely.');
