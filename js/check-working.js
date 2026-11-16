#!/usr/bin/env node
/* node js/check-working.js — A PHOTO OF THE WORKING (501) through the real doPost: saved to Drive on a `sent` row, marked by nobody and no AI (owner, 16 Nov). */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');
const REPO = path.join(__dirname, '..');
const bad = [];

/* ---------- NO MARKING PATH AT ALL (owner, 16 Nov: marking is mechanical only): no person, no AI ---------- */
const front = fs.readFileSync(path.join(REPO, 'js/working.js'), 'utf8');
const post = fs.readFileSync(path.join(REPO, 'backend/dopost.gs'), 'utf8');
const PA = require('../tools/post-actions.js'), psrc = PA.postSrc(REPO);
const blk = PA.postHandler(psrc, 'markWorking');
if (!blk) bad.push('dopost.gs has no markWorking handler to check');
const HAND = /tutor to mark|mark(ed|ing)? by hand|hand[- ]?mark|for (a|your) tutor|send to my tutor|awaiting marking|waiting to be marked|queued? for/i;
[['js/working.js', front], ['markWorking in dopost.gs', blk]].forEach(([n, t]) => {
  const m = HAND.exec(t);
  if (m) bad.push(n + ' says "' + m[0] + '" — a photo of the working is saved, and nobody marks it');
});
if (/aiGemini_|aiMarkAsk_|GEMINI_API_KEY|UrlFetchApp/.test(blk || '')) bad.push('markWorking still reaches for Gemini — a photo of the working is saved, never marked');
if (PA.postActionNames(psrc).some(a => /^(aiMark|markByHand|tutorMark|handMark|gradeWorking|markSubmission)$/.test(a))) bad.push('dopost.gs has an action that marks work by AI or by a person');

/* NOT TUTORS (owner, 28 Oct): the working photos are the student's, their parents' and the admin's only. */
{ const may = (/function workingMaySee_[\s\S]*?\n\}/.exec(post) || [''])[0];
  if (!may) bad.push('workingMaySee_ is not in dopost.gs, so who sees the photos was NOT checked');
  else if (/rankAtLeast_\(me, '(staff|client|student)'\)/.test(may)) bad.push('workingMaySee_ lets a rank below admin (a tutor) see the working photos'); }

/* ---------- THROUGH THE BACKEND ---------- */
const files = {};
let n = 0;
const folder = { getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => folder,
  createFile: blob => { const id = 'FILE' + String(++n).padStart(8, '0'); files[id] = blob; return { getId: () => id, setSharing: () => { bad.push('a working photo was shared by link'); } }; } };
const sent = [];
const b = backend({
  UrlFetchApp: { fetch: (url, o) => { sent.push(o); return { getResponseCode: () => 500, getContentText: () => '' }; } },
  DriveApp: { getFolderById: () => folder, getFileById: id => ({ getBlob: () => ({ getBytes: () => [1, 2, 3] }) }), Access: {}, Permission: {} },
});
const U = b.ev('Utilities');
if (!U.base64Decode) U.base64Decode = s => Array.from(Buffer.from(String(s), 'base64'));
if (!U.base64Encode) U.base64Encode = a => Buffer.from(a).toString('base64');
const base = { pin: '0000', verified: 'TRUE', role: 'student', city: 'London' };
b.seed('people', [Object.assign({ person_id: 'P-S1', first_name: 'Ann', last_name: 'Aa', handle: 'anna', email: 's1@example.org' }, base),
                  Object.assign({ person_id: 'P-S2', first_name: 'Bob', last_name: 'Bb', handle: 'bobb', email: 's2@example.org' }, base)]);
b.seed('config', [{ key: 'posts_folder', value: 'FOLDER123456789' }]);
const tok = {};
['s1@example.org', 's2@example.org'].forEach(e => { const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' }); tok[e] = d.token; });
const pic = 'data:image/jpeg;base64,' + Buffer.from('a jpeg, near enough').toString('base64');
const ask = extra => b.post(Object.assign({ action: 'markWorking', token: tok['s1@example.org'], personId: 'P-S1', id: Date.now() + '-abc123',
  key: 'ans:q1', answer: '', photos: [pic, pic] }, extra || {}));
const rows = () => b.tabs.submissions.length - 1;

/* WITH A GEMINI KEY IN PLACE TOO: the key is the assistant's, and the photos are still only saved */
b.props.GEMINI_API_KEY = 'test-key-not-a-real-one';
const d = ask();
if (!d.success || d.saved !== true || d.awarded !== undefined || d.feedback !== undefined) bad.push('saved working came back ' + JSON.stringify(d));
if (sent.length) bad.push('saving a photo of the working asked Gemini ' + sent.length + ' time(s)');
if (rows() !== 1) bad.push('a saved photo wrote ' + rows() + ' submission rows — wanted 1');
else {
  const h = b.tabs.submissions[0], r = b.tabs.submissions[1];
  if (String(r[h.indexOf('verdict')]) !== 'sent') bad.push('the row\'s verdict is ' + r[h.indexOf('verdict')] + ' — wanted `sent`, saved and not marked');
  if (String(r[h.indexOf('photos')]).split(' ').length !== 2) bad.push('the row does not name its two photos: ' + r[h.indexOf('photos')]);
}
if (JSON.stringify(d).indexOf('drive.google') !== -1) bad.push('a Drive link reached the phone');

const other = b.post({ action: 'workingOf', token: tok['s2@example.org'], personId: 'P-S2', of: 'P-S1' });
if (other.success !== false || other.work) bad.push('another student read the photos: ' + JSON.stringify(other).slice(0, 160));
const own = b.post({ action: 'workingOf', token: tok['s1@example.org'], personId: 'P-S1', of: 'P-S1' });
if (!own.success || !own.work || own.work.length !== 1 || own.work[0].photos.length !== 2) bad.push('the student could not read back their own photos: ' + JSON.stringify(own).slice(0, 160));
const g = JSON.stringify(b.get({}));
if (/FILE0000|working-P-S1/.test(g)) bad.push('the photos or their links are in doGet');

if (bad.length) { bad.forEach(x => console.log('  ✗ ' + x)); console.log('FAILED — a photo of the working: ' + bad.length + ' problem(s).'); process.exit(1); }
console.log('OK — a photo of the working is saved, marked by nobody and no AI, and read back only by those who may.');
