#!/usr/bin/env node
/* node js/check-work-file.js — WORK ON FILE through the real doPost: an upload is stored, the list shows it, another student cannot see it. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');
const bad = [];

const files = {}, trashed = [];
let n = 0;
const mkFolder = () => {
  const subs = {}, id = 'FOLDER' + String(++n).padStart(8, '0');
  return {
    getId: () => id,
    getFoldersByName: nm => ({ hasNext: () => !!subs[nm], next: () => subs[nm] }),
    createFolder: nm => (subs[nm] = mkFolder()),
    createFile: () => { const f = 'FILE' + String(++n).padStart(8, '0'); files[f] = true;
      return { getId: () => f, setSharing: () => { bad.push('a work-on-file page was shared by link'); } }; },
  };
};
const top = mkFolder();
const b = backend({
  DriveApp: { createFolder: () => top, getFolderById: () => top, Access: {}, Permission: {},
    getFileById: id => { if (!files[id]) throw new Error('no file'); const blob = { getBytes: () => [1, 2, 3], getContentType: () => 'image/jpeg' };
      return { getBlob: () => blob, getThumbnail: () => blob, setTrashed: () => trashed.push(id) }; } },
});
const U = b.ev('Utilities');
if (!U.base64Decode) U.base64Decode = s => Array.from(Buffer.from(String(s), 'base64'));
if (!U.base64Encode) U.base64Encode = a => Buffer.from(a).toString('base64');
const base = { pin: '0000', verified: 'TRUE', role: 'student', city: 'London' };
b.seed('people', [Object.assign({ person_id: 'P-S1', first_name: 'Ann', last_name: 'Aa', handle: 'anna', email: 's1@example.org' }, base),
                  Object.assign({ person_id: 'P-S2', first_name: 'Bob', last_name: 'Bb', handle: 'bobb', email: 's2@example.org' }, base)]);
b.seed('work_files', []);
const tok = {};
['s1@example.org', 's2@example.org'].forEach(e => { tok[e] = b.post({ action: 'verifyLogin', email: e, pin: '0000' }).token; });
const as = (who, pid, x) => b.post(Object.assign({ token: tok[who], personId: pid }, x));
const pic = 'data:image/jpeg;base64,' + Buffer.from('a jpeg, near enough').toString('base64');

/* ---------- UPLOAD STORES ---------- */
let d = as('s1@example.org', 'P-S1', { action: 'workFileSave', title: 'Fractions homework', subject: 'Maths', pages: [pic, pic] });
if (!d.success || d.pages !== 2) bad.push('the upload was not stored: ' + JSON.stringify(d).slice(0, 160));
const tab = b.tabs.work_files || [];
if (tab.length !== 2) bad.push('the upload wrote ' + Math.max(0, tab.length - 1) + ' work_files rows — wanted 1');
else {
  const h = tab[0], r = tab[1];
  if (r[h.indexOf('person_id')] !== 'P-S1' || r[h.indexOf('uploaded_by')] !== 'P-S1') bad.push('the row is not filed under the student who sent it');
  if (String(r[h.indexOf('pages')]).split(' ').length !== 2) bad.push('the row does not name its two pages');
}
if (Object.keys(files).length !== 2) bad.push(Object.keys(files).length + ' Drive files were made — wanted 2');
if (JSON.stringify(d).indexOf('drive.google') !== -1) bad.push('a Drive link reached the phone');
d = as('s1@example.org', 'P-S1', { action: 'workFileSave', pages: ['data:text/html;base64,PGI+'] });
if (d.success) bad.push('a page that is not a JPEG was saved');

/* ---------- THE LIST SHOWS IT ---------- */
const own = as('s1@example.org', 'P-S1', { action: 'workFilesOf', of: 'P-S1' });
const w = own.work || [];
if (!own.success || w.length !== 1 || w[0].title !== 'Fractions homework' || w[0].pages !== 2 || !/^data:image\//.test(w[0].thumb || '') || w[0].by !== 'you')
  bad.push('the student\'s list did not show the upload: ' + JSON.stringify(own).slice(0, 200));
const id = w[0] ? w[0].id : '';
const open = as('s1@example.org', 'P-S1', { action: 'workFileOpen', id });
if (!open.success || (open.pages || []).length !== 2) bad.push('the student could not open their own scan');

/* ---------- ANOTHER STUDENT CANNOT ---------- */
const other = as('s2@example.org', 'P-S2', { action: 'workFilesOf', of: 'P-S1' });
if (other.success !== false || other.work) bad.push('another student read the list: ' + JSON.stringify(other).slice(0, 160));
const otherOpen = as('s2@example.org', 'P-S2', { action: 'workFileOpen', id });
if (otherOpen.success !== false || otherOpen.pages) bad.push('another student opened the pages');
const otherDel = as('s2@example.org', 'P-S2', { action: 'workFileDelete', id });
if (otherDel.success !== false || trashed.length) bad.push('another student deleted the scan');
const otherSave = as('s2@example.org', 'P-S2', { action: 'workFileSave', of: 'P-S1', pages: [pic] });
if (otherSave.success !== false) bad.push('another student filed pages on someone else\'s account');
const theirs = as('s2@example.org', 'P-S2', { action: 'workFilesOf' });
if (!theirs.success || (theirs.work || []).length) bad.push('the other student\'s own list is not empty: ' + JSON.stringify(theirs).slice(0, 160));
if (/FILE0000|Fractions homework/.test(JSON.stringify(b.get({})))) bad.push('the scans or their titles are in doGet');

/* ---------- THE OWNER DELETES ---------- */
d = as('s1@example.org', 'P-S1', { action: 'workFileDelete', id });
if (!d.success || trashed.length !== 2) bad.push('the owner could not delete their scan: ' + JSON.stringify(d).slice(0, 160));
if ((as('s1@example.org', 'P-S1', { action: 'workFilesOf' }).work || []).length) bad.push('a deleted scan is still listed');

if (bad.length) { bad.forEach(x => console.log('  ✗ ' + x)); console.log('FAILED — work on file: ' + bad.length + ' problem(s).'); process.exit(1); }
console.log('OK — work on file: an upload is stored in Drive, the list shows it, another student cannot see, open, add to or delete it.');
