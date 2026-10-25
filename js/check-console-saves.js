#!/usr/bin/env node
/* node js/check-console-saves.js — A CONSOLE GAME'S PROGRESS ON THE ACCOUNT (446), by the real backend over a fake Drive. No flags, no port. */
/* Proves: signed in only, a child may, one file per person and game kept as the latest, the 2 MB cap refused politely, nothing but save data, owner-only reads. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const ok = (cond, rule, msg) => { asked++; if (!cond) bad.push(rule + ' — ' + msg); };

const files = new Map();
let n = 0;
const fileOf = id => { const f = files.get(id);
  return { getId: () => id, isTrashed: () => false, setContent: s => { f.body = s; f.writes++; }, getBlob: () => ({ getDataAsString: () => f.body }) }; };
const folder = { getId: () => 'example-folder', isTrashed: () => false,
  getFilesByName: name => { const hit = [...files.keys()].filter(k => files.get(k).name === name); let i = 0; return { hasNext: () => i < hit.length, next: () => fileOf(hit[i++]) }; },
  createFile: (name, body) => { const id = 'example-save-' + (++n); files.set(id, { name, body, writes: 1 }); return fileOf(id); } };
let folders = 0;
const DriveApp = { createFolder: () => { folders++; return folder; }, getFolderById: id => { if (id !== 'example-folder') throw new Error('No item'); return folder; },
  createFile: () => { throw new Error('a save must go in its folder'); }, getFileById: id => fileOf(id) };
const b = backend({ DriveApp });
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
b.seed('people', [
  Object.assign({ person_id: 'P-C1', first_name: 'Cal', last_name: 'Parent', handle: 'calparent', email: 'c1@example.org', role: 'client' }, base),
  Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
]);
const tok = {};
['c1@example.org', 's1@example.org'].forEach(e => { tok[e] = b.post({ action: 'verifyLogin', email: e, pin: '0000' }).token; });
const H = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const save = (who, more) => b.post(Object.assign({ action: 'consoleSave', token: tok[who], hash: H, sys: 'snes', at: Date.now(), sram: 'QUJD', state: 'REVG' }, more || {}));
const load = (who, more) => b.post(Object.assign({ action: 'consoleLoad', token: tok[who], hash: H }, more || {}));

/* 1. NOT SIGNED IN: refused, nothing written. */
const anon = b.post({ action: 'consoleSave', hash: H, sys: 'snes', sram: 'QUJD' });
ok(anon.error && !files.size, 'signed in only', 'a save with no token was ' + JSON.stringify(anon));
ok(b.post({ action: 'consoleLoad', hash: H }).error, 'signed in only', 'a load with no token was answered');

/* 2. A CHILD'S OWN PROGRESS IS KEPT, and read back as sent. */
const kid = save('s1@example.org');
ok(kid.success && files.size === 1 && folders === 1, 'a child may', 'the student\'s save: ' + JSON.stringify(kid) + ', ' + files.size + ' file(s)');
const back = load('s1@example.org').save || {};
ok(back.sram === 'QUJD' && back.state === 'REVG' && back.sys === 'snes', 'read back', 'got ' + JSON.stringify(back));

/* 3. THE LATEST ONLY: a second save overwrites the one file. */
save('s1@example.org', { state: 'WFla' });
ok(files.size === 1 && (load('s1@example.org').save || {}).state === 'WFla', 'one per game', files.size + ' files after a second save');

/* 4. OWNER ONLY: another account neither reads it nor overwrites it, whatever personId it names. */
const other = load('c1@example.org', { personId: 'P-S1' });
ok(other.success && other.save === null, 'owner only', 'the parent read the child\'s save: ' + JSON.stringify(other));
save('c1@example.org', { personId: 'P-S1', state: 'T1RIRVI=' });
ok((load('s1@example.org').save || {}).state === 'WFla' && files.size === 2, 'owner only', 'a save naming another personId reached their file');

/* 5. THE CAP: over 2 MB packed is refused with a reason, and nothing is written. */
const before = JSON.stringify([...files.values()]);
const big = save('s1@example.org', { hash: 'ffffffffffffffff', state: 'A'.repeat(2 * 1024 * 1024 * 4 / 3 + 8) });
ok(big.error && big.why === 'too-big' && /device/.test(big.error) && JSON.stringify([...files.values()]) === before, '2 MB cap', 'over the cap: ' + JSON.stringify(big).slice(0, 200));
const fits = save('s1@example.org', { hash: 'eeeeeeeeeeeeeeee', state: 'A'.repeat(2 * 1024 * 1024 * 4 / 3 - 8) });
ok(fits.success, '2 MB cap', 'just under the cap was refused: ' + JSON.stringify(fits).slice(0, 200));

/* 6. SAVE DATA ONLY: a data URL, a strange system or a hash that is a path are refused. */
ok(save('s1@example.org', { state: 'data:image/png;base64,AAAA' }).error, 'save data only', 'a data URL was kept');
ok(save('s1@example.org', { sys: 'pc' }).error, 'save data only', 'an unknown system was kept');
ok(save('s1@example.org', { hash: '../../etc' }).error, 'save data only', 'a path for a hash was kept');
ok(save('s1@example.org', { sram: '', state: '' }).error, 'save data only', 'an empty save was kept');

if (bad.length) { console.log('check-console-saves: FAILED\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-console-saves: ' + asked + ' asked, all hold — owner-only, a child may, latest only, 2 MB cap, save data only');
