#!/usr/bin/env node
/* node js/check-media.js — AN ADMIN'S REELS AND VIDEOS (404), through the real doPost and doGet: added, edited, hidden,
   deleted; a student and a bad link refused with nothing written; the payload carries what the site merges. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const rule = (ok, msg) => { if (!ok) bad.push(msg); };
const b = backend({});
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
b.seed('people', [
  Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
  Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
]);
const tok = {};
['a1@example.org', 's1@example.org'].forEach(e => {
  const r = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
  if (!r.success) { console.log('could not sign in ' + e + ' — ' + r.error + '; NOTHING was checked.'); process.exit(1); }
  tok[e] = r;
});
const as = (e, body) => b.post(Object.assign({ token: tok[e].token, personId: tok[e].personId || (tok[e].person && tok[e].person.personId) }, body));
const A = 'a1@example.org', P = 's1@example.org';
const rows = () => (b.tabs.media || []).length - 1;
const get = who => { b.ev('clearCache()'); b.ev('try { CacheService.getScriptCache().removeAll && 0 } catch (e) {}'); return b.get(who ? { token: tok[who].token } : {}); };

if (!b.tabs.media) { console.log('There is no media tab in TAB/SCHEMA, so NOTHING was checked — not a pass.'); process.exit(1); }

/* REFUSED, AND NOTHING WRITTEN */
rule(!as(P, { action: 'mediaSave', kind: 'reel', url: 'https://youtube.com/shorts/abcdefghijk', title: 'x' }).success && rows() === 0, 'a student added a reel');
rule(!b.post({ action: 'mediaSave', kind: 'reel', url: 'https://youtube.com/shorts/abcdefghijk', title: 'x' }).success && rows() === 0, 'nobody signed in added a reel');
rule(!as(A, { action: 'mediaSave', kind: 'reel', url: 'https://example.org/shorts/abcdefghijk', title: 'x' }).success && rows() === 0, 'a link that is not YouTube was saved');
rule(!as(A, { action: 'mediaSave', kind: 'reel', url: 'https://youtu.be/short', title: 'x' }).success && rows() === 0, 'a bad YouTube id was saved');
rule(!as(A, { action: 'mediaSave', kind: 'film', url: 'https://youtu.be/abcdefghijk', title: 'x' }).success && rows() === 0, 'a kind that is neither reel nor video was saved');
rule(!as(A, { action: 'mediaSave', kind: 'reel', url: 'https://youtu.be/abcdefghijk', title: 'x'.repeat(201) }).success && rows() === 0, 'a 201-character title was saved');
rule(!as(A, { action: 'mediaSave', kind: 'reel', url: 'https://youtu.be/abcdefghijk', title: 'x', thumb: 'https://evil.example/p.jpg' }).success && rows() === 0, 'a picture from anywhere was saved');

/* ADDED, EDITED, HIDDEN, SHOWN, DELETED */
const add = as(A, { action: 'mediaSave', kind: 'reel', url: 'https://youtube.com/shorts/abcdefghijk?feature=share', title: 'Fractions in a minute', channel: 'A Channel', thumb: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg', subject: 'Maths' });
rule(add.success && add.id === 'abcdefghijk' && rows() === 1, 'an admin could not add a reel: ' + JSON.stringify(add));
const v = as(A, { action: 'mediaSave', kind: 'video', url: 'https://www.youtube.com/watch?v=ZYXWVUTSRQP&t=3', title: 'Long one', tags: 'maths gcse', vkind: 'clip' });
rule(v.success && rows() === 2, 'an admin could not add a video');
const ed = as(A, { action: 'mediaSave', kind: 'reel', url: 'https://youtu.be/abcdefghijk', title: 'Fractions, fast', subject: 'Maths' });
rule(ed.success && rows() === 2, 'an edit made a second row rather than changing the first');
let g = get(P);
const reel = (g.media || []).find(m => m.kind === 'reel' && m.id === 'abcdefghijk');
rule(reel && reel.title === 'Fractions, fast' && reel.url === 'https://youtube.com/shorts/abcdefghijk', 'the payload does not carry the edited reel: ' + JSON.stringify(g.media));
rule((g.media || []).some(m => m.kind === 'video' && m.id === 'ZYXWVUTSRQP' && m.tags === 'maths gcse'), 'the payload does not carry the video');
rule(!as(P, { action: 'mediaHide', kind: 'reel', id: 'abcdefghijk' }).success, 'a student hid a reel');
rule(as(A, { action: 'mediaHide', kind: 'reel', id: 'abcdefghijk' }).success, 'an admin could not hide a reel');
g = get(P);
const hid = (g.media || []).find(m => m.id === 'abcdefghijk');
rule(hid && hid.hidden === true && !hid.title, 'a hidden reel is not sent as hidden, id alone: ' + JSON.stringify(hid));
/* A REPOSITORY ITEM (no row yet) IS HIDDEN BY A NEW ROW */
rule(as(A, { action: 'mediaHide', kind: 'reel', id: 'jD2Yy_wCBLE' }).success && rows() === 3, 'a repository reel could not be hidden');
rule(as(A, { action: 'mediaHide', kind: 'reel', id: 'abcdefghijk', hidden: false }).success, 'a hidden reel could not be shown again');
rule(!as(P, { action: 'mediaDelete', kind: 'video', id: 'ZYXWVUTSRQP' }).success && rows() === 3, 'a student deleted a video');
rule(as(A, { action: 'mediaDelete', kind: 'video', id: 'ZYXWVUTSRQP' }).success && rows() === 2, 'an admin could not delete a video');
rule(!as(A, { action: 'mediaDelete', kind: 'video', id: 'ZYXWVUTSRQP' }).success, 'deleting what is not there said it worked');
g = get();
rule(!(g.media || []).some(m => m.id === 'ZYXWVUTSRQP'), 'a deleted video is still in the payload');

console.log('');
console.log("AN ADMIN'S REELS AND VIDEOS, THROUGH THE REAL doPost AND doGet  (" + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
if (bad.length) { console.log('FAILED'); process.exit(1); }
console.log('OK — added, edited in place, hidden (a repository one too), shown, deleted; a student, nobody, a bad link, a long title and a foreign picture refused with nothing written; the payload carries it.');
