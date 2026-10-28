#!/usr/bin/env node
/* node js/check-working.js — A PHOTO OF THE WORKING (501) through the real doPost: the AI alone marks it, as images, kept only with its mark. */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');
const REPO = path.join(__dirname, '..');
const bad = [];

/* ---------- NO HUMAN-MARKING PATH, IN THE WORDS OR THE ACTIONS ---------- */
const front = fs.readFileSync(path.join(REPO, 'js/working.js'), 'utf8');
const post = fs.readFileSync(path.join(REPO, 'backend/dopost.gs'), 'utf8');
const blk = (post.match(/if \(action === 'markWorking'\)[\s\S]*?\n {4}\}\n/) || [''])[0];
if (!blk) bad.push('dopost.gs has no markWorking handler to check');
const HAND = /tutor to mark|mark(ed|ing)? by hand|hand[- ]?mark|for (a|your) tutor|send to my tutor|awaiting marking|waiting to be marked|queued? for/i;
[['js/working.js', front], ['markWorking in dopost.gs', blk]].forEach(([n, t]) => {
  const m = HAND.exec(t);
  if (m) bad.push(n + ' says "' + m[0] + '" — only the AI marks a photo of the working');
});
if (/verdict:\s*'sent'/.test(blk)) bad.push('markWorking writes a `sent` verdict — a row waiting for a person to mark it');
if (/action === '(markByHand|tutorMark|handMark|gradeWorking|markSubmission)'/.test(post)) bad.push('dopost.gs has an action for a person to mark work');

/* ---------- THROUGH THE BACKEND ---------- */
const files = {};
let n = 0;
const folder = { getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => folder,
  createFile: blob => { const id = 'FILE' + String(++n).padStart(8, '0'); files[id] = blob; return { getId: () => id, setSharing: () => { bad.push('a working photo was shared by link'); } }; } };
const sent = [];
const b = backend({
  UrlFetchApp: { fetch: (url, o) => { sent.push(o); return { getResponseCode: () => 200,
    getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ awarded: 2, feedback: 'Your expansion earns the method mark; the last line is missing.' }) }] } }] }) }; } },
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
  key: 'ans:q1', question: 'Show that (x+1)^2 = x^2+2x+1', scheme: 'expands (1); collects (1); conclusion (1)', marks: 3, answer: '', photos: [pic, pic] }, extra || {}));
const rows = () => b.tabs.submissions.length - 1;

let d = ask();
if (d.success !== false || d.why !== 'ai-off') bad.push('with no key markWorking answered ' + JSON.stringify(d) + ' — wanted a plain "not available" refusal');
if (rows() || Object.keys(files).length) bad.push('with no key a row or a Drive file was made — work kept for a person to mark');
if (!/isn’t available right now/.test(String(d.message))) bad.push('the student was not told plainly marking is not available: ' + d.message);

b.props.GEMINI_API_KEY = 'test-key-not-a-real-one';
d = ask();
if (!d.success || d.awarded !== 2 || d.available !== 3 || !d.feedback) bad.push('marked working came back ' + JSON.stringify(d));
const p = sent.length ? JSON.parse(sent[sent.length - 1].payload) : {};
const parts = (((p.contents || [])[0] || {}).parts) || [];
if (parts.filter(x => x.inlineData && x.inlineData.mimeType === 'image/jpeg' && x.inlineData.data).length !== 2) bad.push('Gemini was not sent the two photos as inline images: ' + JSON.stringify(parts).slice(0, 200));
if (rows() !== 1) bad.push('a marked photo wrote ' + rows() + ' submission rows — wanted 1');
else {
  const h = b.tabs.submissions[0], r = b.tabs.submissions[1];
  if (!/^ai:2\/3$/.test(String(r[h.indexOf('verdict')]))) bad.push('the row\'s verdict is ' + r[h.indexOf('verdict')]);
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
console.log('OK — a photo of the working is marked by the AI only, sent as images, kept with its mark, and read back only by those who may.');
