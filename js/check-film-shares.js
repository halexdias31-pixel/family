#!/usr/bin/env node
/* node js/check-film-shares.js — A FILM IS SEEN BY WHOM ITS DRIVE FILE IS SHARED WITH (450), over a fake Drive:
   shared sent, unshared not, revoked gone after the keep, admin told who; no date of birth is underage. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const rule = (ok, msg) => { if (!ok) bad.push(msg); };

/* THE FAKE DRIVE: id → { viewers, editors }; a missing id throws as DriveApp does. */
const SHARES = {
  'DRV-TOY3': { viewers: ['george@example.org'], editors: [] },
  'DRV-SCARY': { viewers: [], editors: [] },
  'DRV-SHOW': { viewers: [], editors: ['Mia@Example.org'] },
};
let reads = 0;
const item = id => {
  reads++;
  const s = SHARES[id];
  if (!s) throw new Error('No item with the given ID could be found.');
  const u = e => ({ getEmail: () => e });
  return { getViewers: () => s.viewers.map(u), getEditors: () => s.editors.map(u) };
};
const DriveApp = { getFileById: item, getFolderById: item };
const b = backend({ DriveApp });
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
b.seed('people', [
  Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
  Object.assign({ person_id: 'P-G1', first_name: 'Geo', last_name: 'Kid', handle: 'geokid', email: 'george@example.org', role: 'student' }, base),
  Object.assign({ person_id: 'P-M1', first_name: 'Mia', last_name: 'Kid', handle: 'miakid', email: 'mia@example.org', role: 'student', date_of_birth: '2000-01-01' }, base),
  Object.assign({ person_id: 'P-N1', first_name: 'Ned', last_name: 'Kid', handle: 'nedkid', email: 'ned@example.org', role: 'client' }, base),
]);
const row = (id, title, drive, kind) => ({ film_id: id, title, kind: kind === 'folder' ? 'series' : 'film', drive_id: drive,
  drive_url: kind === 'folder' ? 'https://drive.google.com/drive/folders/' + drive : 'https://drive.google.com/file/d/' + drive + '/view',
  file_kind: kind || 'file', active: true });
b.seed('films', [
  row('FM001', 'Invented Toy Film 3', 'DRV-TOY3'),
  row('FM002', 'Invented Scary Film', 'DRV-SCARY'),
  row('FM003', 'Invented Show', 'DRV-SHOW', 'folder'),
  row('FM004', 'Invented Lost Film', 'DRV-GONE'),
]);
if (!b.tabs.films) { console.log('There is no films tab in TAB/SCHEMA, so NOTHING was checked — not a pass.'); process.exit(1); }
const tok = {};
['a1', 'george', 'mia', 'ned'].forEach(e => {
  const r = b.post({ action: 'verifyLogin', email: e + '@example.org', pin: '0000' });
  if (!r.success) { console.log('could not sign in ' + e + ' — ' + r.error + '; NOTHING was checked.'); process.exit(1); }
  tok[e] = r.token;
});
const get = who => { b.ev('clearCache()'); return b.get(who ? { token: tok[who] } : {}); };
const titles = g => (g.films || []).map(f => f.title).sort().join(' | ');
const raw = g => JSON.stringify(g);

/* TWICE EACH: a built body, then the kept one with the films laid on fresh. */
[0, 1].forEach(pass => {
  const p = pass ? ' (kept copy)' : '';
  const g = get('george');
  rule(titles(g) === 'Invented Toy Film 3', 'george, shared Toy Film 3 on Drive, sees ' + (titles(g) || 'nothing') + p);
  rule(!/DRV-SCARY|DRV-SHOW|DRV-GONE/.test(raw(g)), 'george was sent the address of a film not shared with him' + p);
  rule(!(g.films || []).some(f => 'sharedWith' in f), 'george was sent who a film is shared with' + p);
  const m = get('mia');
  rule(titles(m) === 'Invented Show', 'mia, an editor of the show folder (her email in other case), sees ' + (titles(m) || 'nothing') + p);
  const n = get('ned');
  rule(titles(n) === '', 'ned, shared nothing, sees ' + titles(n) + p);
  const o = get('');
  rule(titles(o) === '' && !/DRV-/.test(raw(o)), 'a signed-out visitor was sent films' + p);
  const a = get('a1');
  const by = t => (a.films || []).find(f => f.title === t) || {};
  rule((a.films || []).length === 4, 'the admin does not see all four films: ' + titles(a) + p);
  rule(by('Invented Toy Film 3').sharedWith === 'george@example.org', 'the admin is not told Toy Film 3 is shared with george: ' + JSON.stringify(by('Invented Toy Film 3').sharedWith) + p);
  rule(by('Invented Scary Film').sharedWith === '', 'the admin is not told the scary film is shared with nobody' + p);
  rule(/could not be read/.test(by('Invented Lost Film').sharedWith || ''), 'the admin is not told a film Drive cannot open is unknown' + p);
});

/* REVOKED ON DRIVE: still kept for the ten minutes, then gone; nothing asks Drive again inside them. */
SHARES['DRV-TOY3'].viewers = [];
const before = reads;
rule(titles(get('george')) === 'Invented Toy Film 3', 'a revoked share vanished before the keep ended — the cache is not being used');
rule(reads === before, 'Drive was asked again inside the ten minutes (' + (reads - before) + ' reads)');
rule(b.ev('FILMS_SHARE_TTL_S') <= 600, 'the share keep is longer than ten minutes: ' + b.ev('FILMS_SHARE_TTL_S'));
[...b.cache.keys()].filter(k => k.indexOf(b.ev('FILMS_SHARE_PREFIX')) === 0).forEach(k => b.cache.delete(k));
rule(titles(get('george')) === '', 'george still sees Toy Film 3 after his Drive access was removed and the keep ended');
SHARES['DRV-TOY3'].viewers = ['george@example.org'];
[...b.cache.keys()].filter(k => k.indexOf(b.ev('FILMS_SHARE_PREFIX')) === 0).forEach(k => b.cache.delete(k));
rule(titles(get('george')) === 'Invented Toy Film 3', 'george does not see Toy Film 3 once it is shared again');

/* NO DATE OF BIRTH IS UNDERAGE (450), whatever the rank: george (a student) and ned (a client) get no rated video; mia (born 2000) does. */
const cap = pid => b.ev("mediaAgeCap_(findPerson('', '" + pid + "'))");
rule(cap('P-G1') === 0 && cap('P-N1') === 0, 'no date of birth is not underage: student ' + cap('P-G1') + ', client ' + cap('P-N1'));
rule(cap('P-M1') >= 18, 'a person born in 2000 is capped at ' + cap('P-M1'));
rule(b.ev('mediaAgeCap_(null)') === 0, 'a signed-out visitor is not underage');

console.log('');
console.log('A FILM IS SEEN BY WHOM ITS DRIVE FILE IS SHARED WITH  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
if (bad.length) { console.log('FAILED'); process.exit(1); }
console.log('OK — shared on Drive is seen, unshared is not even sent, a revoked share goes when the ten-minute keep ends, the admin sees who each is shared with, no date of birth is underage.');
