#!/usr/bin/env node
/* node js/check-posts.js — POSTS WAIT FOR APPROVAL, AND PICTURES ARE FILES (413), through the real doPost and doGet.
   The whole list of rules is in docs/history/413. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, why, got) => { asked++; if (!ok) bad.push(why + (got !== undefined ? ' — ' + JSON.stringify(got).slice(0, 300) : '')); };

/* A DRIVE THAT KEEPS WHAT IT IS GIVEN — every file made is counted, so "refused before anything was kept" can be asked. */
function drive(made) {
  const folder = {
    getId: () => 'POSTS', getName: () => 'posts', getFiles: () => ({ hasNext: () => false }), getFolders: () => ({ hasNext: () => false }),
    getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => folder,
    createFile: blob => {
      const f = { id: 'F' + made.length + 'xAbCdEfGhIjKlMnOpQrStUv', blob, shared: '' };
      made.push(f);
      return { getId: () => f.id, getName: () => String((blob && blob.name) || ''), setSharing: (a, p) => { f.shared = a + '/' + p; },
               setTrashed: () => {} };
    },
  };
  return { getFolderById: () => folder, getFileById: () => { throw new Error('No item with the given ID could be found.'); },
           Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' }, Permission: { VIEW: 'VIEW' } };
}

/* INVENTED PEOPLE — this repository is public. */
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
const PEOPLE = [
  { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Boss', handle: 'halboss', email: 'admin@example.org' },
  { person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor', handle: 'adatutor', email: 'ada@example.org', listed: 'TRUE',
    photo: 'pfp:fox' },
  { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent', handle: 'patparent', email: 'pat@example.org',
    avatar: 'v1:3.2.1.0.0.0.0.0' },
  { person_id: 'P-K1', role: 'student', first_name: 'Kit', last_name: 'Child', handle: 'kitchild47', email: '',
    photo: 'https://drive.google.com/file/d/KIDPHOTOxxxxxxxxxxxxxxxxx/view', avatar: 'v1:1.1.1.0.0.0.0.0' },
].map(p => Object.assign({}, base, p));

const made = [];
const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 }, DriveApp: drive(made) });
b.ev(`Utilities.newBlob = (bytes, type, name) => ({ type: type, name: name, size: (bytes || []).length });`);
b.seed('people', PEOPLE);
b.seed('family', [{ link_id: 'L1', parent_id: 'P-C1', child_id: 'P-K1', child_typed: 'Kit Child', state: 'accepted' }]);
b.seed('config', [{ key: 'posts_folder', value: 'POSTSPOSTSPOSTS' }]);
const tok = {};
[['admin@example.org', 'P-A1'], ['ada@example.org', 'P-T1'], ['pat@example.org', 'P-C1'], ['kitchild47', 'P-K1']].forEach(([w, id]) => {
  const d = b.post({ action: 'verifyLogin', email: w, name: w, pin: '0000' });
  if (d && d.success) tok[id] = d; else bad.push('could not sign ' + w + ' in — ' + JSON.stringify(d).slice(0, 200));
});
if (Object.keys(tok).length < 4) { console.log('FAILED — not everybody could sign in, so NOTHING was checked:\n  ' + bad.join('\n  ')); process.exit(1); }
const as = (pid, body) => b.post(Object.assign({ token: tok[pid].token, name: tok[pid].name, personId: pid }, body));
const feed = pid => { b.ev('clearCache()'); return (b.get(pid ? { token: tok[pid].token } : {}).posts || []); };
const H = () => b.tabs.posts[0];
const rowOf = id => { const h = H(); const r = b.tabs.posts.slice(1).find(x => x[h.indexOf('post_id')] === id) || []; const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; };
const JPG = 'data:image/jpeg;base64,' + Buffer.alloc(3000, 7).toString('base64');

/* ---------- 1. A STAFF MEMBER'S POST WAITS, SEEN BY ITS AUTHOR AND AN ADMIN ONLY ---------- */
const up = as('P-T1', { action: 'addPost', data: JPG, caption: 'The volcano', postAs: 'brand' });
rule(up.success && up.pending === true, 'a tutor\'s post did not go in as waiting', up);
const pid = (b.tabs.posts.slice(1).map(r => r[H().indexOf('post_id')]).pop()) || '';
rule(rowOf(pid).approved === 'PENDING', 'the waiting post\'s row is not PENDING', rowOf(pid).approved);
/* THE BUSINESS IS AN ADMIN'S TO POST AS: a tutor asking for it is the tutor. */
rule(rowOf(pid).author === 'Ada Tutor', 'a tutor who asked to post as the business was put up under another name', rowOf(pid).author);
const mineT = feed('P-T1').find(p => p.id === pid);
rule(mineT && mineT.waiting === true && mineT.mine === true, 'its author is not sent their waiting post, marked waiting and theirs', mineT);
const admS = feed('P-A1').find(p => p.id === pid);
rule(admS && admS.waiting === true && admS.mine === false, 'an admin is not sent the waiting post to decide on', admS);
rule(!feed('P-C1').some(p => p.id === pid), 'a parent was sent somebody else\'s waiting post');
rule(!feed('P-K1').some(p => p.id === pid), 'a child was sent somebody else\'s waiting post');
rule(!feed(null).some(p => p.id === pid), 'a stranger was sent a waiting post');

/* ---------- 2. WHILE IT WAITS, ITS AUTHOR MAY CHANGE THE WORDS; NOBODY ELSE MAY ---------- */
const e1 = as('P-T1', { action: 'editPost', id: pid, fields: { caption: 'The volcano, again' } });
rule(e1.success && rowOf(pid).caption === 'The volcano, again', 'its author could not change the caption while it waited', e1);
const e2 = as('P-C1', { action: 'editPost', id: pid, fields: { caption: 'Mine now' } });
rule(!e2.success && rowOf(pid).caption === 'The volcano, again', 'somebody else changed a waiting post', e2);
const e3 = as('P-A1', { action: 'editPost', id: pid, fields: { caption: 'The admin\'s words' } });
rule(!e3.success, 'an admin rewrote somebody\'s waiting post — Approve or Decline is the admin\'s part', e3);
const e4 = as('P-T1', { action: 'editPost', id: pid, fields: { author: 'Someone Else' } });
rule(!e4.success && rowOf(pid).author === 'Ada Tutor', 'its author changed whose name is on it', e4);

/* ---------- 3. APPROVE PUBLISHES IT, AND THEN IT IS FINAL ---------- */
const no = as('P-T1', { action: 'approvePost', id: pid, on: 'TRUE' });
rule(!no.success && rowOf(pid).approved === 'PENDING', 'a tutor approved their own post', no);
const yes = as('P-A1', { action: 'approvePost', id: pid, on: 'TRUE' });
rule(yes.success && rowOf(pid).approved === '', 'the admin\'s Approve did not put it up', yes);
const pub = feed('P-C1').find(p => p.id === pid);
rule(pub && pub.waiting === false, 'once approved, a parent is not sent it as an ordinary post', pub);
rule(feed(null).some(p => p.id === pid), 'once approved, a stranger is not sent it');
const e5 = as('P-T1', { action: 'editPost', id: pid, fields: { caption: 'Changed after' } });
rule(!e5.success && /cannot be changed once it is up/.test(e5.error || '') && rowOf(pid).caption === 'The volcano, again',
  'its author changed a post that is up', e5);
const e6 = as('P-A1', { action: 'editPost', id: pid, fields: { caption: 'Changed by the admin' } });
rule(!e6.success && rowOf(pid).caption === 'The volcano, again', 'an admin changed the words of a post that is up', e6);
const pin = as('P-A1', { action: 'editPost', id: pid, fields: { pinned: true } });
rule(pin.success && String(rowOf(pid).pinned).toUpperCase() === 'TRUE', 'an admin could not pin a post that is up', pin);

/* ---------- 4. DELETE: ITS AUTHOR, OR AN ADMIN; NOBODY ELSE, AND ONLY AN ADMIN PUTS ONE BACK ---------- */
const d1 = as('P-C1', { action: 'deletePost', id: pid, on: false });
rule(!d1.success && String(rowOf(pid).active).toUpperCase() === 'TRUE', 'a parent deleted a tutor\'s post', d1);
const d2 = as('P-T1', { action: 'deletePost', id: pid, on: false });
rule(d2.success && String(rowOf(pid).active).toUpperCase() === 'FALSE', 'its author could not delete their own post', d2);
const d3 = as('P-T1', { action: 'deletePost', id: pid, on: true });
rule(!d3.success && String(rowOf(pid).active).toUpperCase() === 'FALSE', 'its author put a deleted post back — that is the admin\'s', d3);
const p2 = as('P-C1', { action: 'addPost', data: JPG, caption: 'Sports day' });
const pid2 = b.tabs.posts.slice(1).map(r => r[H().indexOf('post_id')]).pop();
const d4 = as('P-A1', { action: 'deletePost', id: pid2, on: false });
rule(p2.success && d4.success && String(rowOf(pid2).active).toUpperCase() === 'FALSE', 'an admin could not delete a parent\'s post', d4);

/* ---------- 5. DECLINE KEEPS IT FROM EVERYBODY BUT THE ADMIN ---------- */
as('P-C1', { action: 'addPost', data: JPG, caption: 'A second try' });
const pid3 = b.tabs.posts.slice(1).map(r => r[H().indexOf('post_id')]).pop();
const dec = as('P-A1', { action: 'approvePost', id: pid3, on: 'FALSE' });
rule(dec.success && rowOf(pid3).approved === 'REFUSED', 'Decline did not mark it refused', dec);
rule(!feed('P-C1').some(p => p.id === pid3) && !feed(null).some(p => p.id === pid3), 'a declined post is still sent to somebody who is not the admin');
const e7 = as('P-C1', { action: 'editPost', id: pid3, fields: { caption: 'Edited after no' } });
rule(!e7.success, 'a declined post was edited', e7);

/* ---------- 6. PICTURES ARE FILES, NEVER LINKS ---------- */
const link = as('P-A1', { action: 'addPost', image: 'https://example.org/somewhere.jpg', caption: 'A link' });
rule(!link.success && /not links/.test(link.error || ''), 'a post was made from a link', link);
const linkM = as('P-C1', { action: 'addPost', data: JPG, media: ['https://drive.google.com/file/d/ABCDEFGHIJKLMNOPQRSTUV/view'] });
rule(!linkM.success, 'a link was slipped into a post\'s list of pictures', linkM);
const huge = as('P-C1', { action: 'addPost', data: 'data:image/jpeg;base64,' + 'A'.repeat(Math.ceil((8 * 1048576 + 3000) / 3) * 4) });
rule(!huge.success && /over 8MB/.test(huge.error || ''), 'a picture over 8MB was kept — the phone redraws one at 1600px', huge);

/* ---------- 7. THE BUSINESS AS AUTHOR IS AN ADMIN'S, AND AN ADMIN'S POST GOES STRAIGHT UP ---------- */
const brandUp = as('P-A1', { action: 'addPost', data: JPG, caption: 'Open day', postAs: 'brand' });
const bid = b.tabs.posts.slice(1).map(r => r[H().indexOf('post_id')]).pop();
const brandName = b.ev('brandName()');
rule(brandUp.success && brandUp.pending === false && rowOf(bid).approved === '', 'an admin\'s post did not go straight up', brandUp);
rule(rowOf(bid).author === brandName && rowOf(bid).posted_by === 'Hal Boss', 'an admin posting as the business is not signed by the business, with the admin kept as who pressed it', rowOf(bid));
const bOut = feed(null).find(p => p.id === bid);
rule(bOut && bOut.author === brandName, 'the business\'s post is not sent under the brand\'s name', bOut);
as('P-A1', { action: 'addPost', data: JPG, caption: 'My own', postAs: 'me' });
const mid = b.tabs.posts.slice(1).map(r => r[H().indexOf('post_id')]).pop();
rule(rowOf(mid).author === 'Hal Boss', 'an admin posting as themselves was signed by the business', rowOf(mid).author);
const mineA = feed('P-A1').find(p => p.id === bid);
rule(mineA && mineA.mine === true, 'an admin\'s business post is not marked as theirs on their own phone', mineA);

/* ---------- 8. A CHILD UPLOADS NOTHING: a post, a message's file, a profile photo ---------- */
const before = made.length;
const kPost = as('P-K1', { action: 'addPost', data: JPG, caption: 'Mine' });
rule(!kPost.success && /grown-up/.test(kPost.error || ''), 'a child\'s post with a picture was not refused', kPost);
const kMsg = as('P-K1', { action: 'sendMessage', to: 'Hal Boss', toId: 'P-A1', body: 'look',
  files: [{ name: 'me.jpg', type: 'image/jpeg', data: JPG }] });
rule(!kMsg.success && kMsg.why === 'files', 'a child\'s message with a picture was not refused as a file refusal (Words only)', kMsg);
const kPic = as('P-K1', { action: 'savePhoto', data: JPG });
rule(!kPic.success, 'a child uploaded a profile photo', kPic);
rule(made.length === before, (made.length - before) + ' file(s) were kept in Drive for a child');
const kChoice = as('P-K1', { action: 'savePhoto', choice: 'pfp:owl' });
rule(kChoice.success && b.row('P-K1').photo === 'pfp:owl', 'a child could not choose one of the ten pictures', kChoice);
b.ev(`(function(){ const t = read(TAB.people); const r = t.rows.find(x => S(x.person_id) === 'P-K1'); setCell(t, r, 'photo', 'https://drive.google.com/file/d/KIDPHOTOxxxxxxxxxxxxxxxxx/view'); clearCache(); })()`);

/* ---------- 9. A MESSAGE WITH A PICTURE, AND EACH HEAD'S FACE ---------- */
const m1 = as('P-C1', { action: 'sendMessage', to: 'Ada Tutor', toId: 'P-T1', body: 'From sports day',
  files: [{ name: 'day.jpg', type: 'image/jpeg', data: JPG }] });
rule(m1.success && (m1.attachments || []).length === 1, 'a parent\'s message with a picture was not kept', m1);
const tIn = as('P-T1', { action: 'messages' });
const got = (tIn.messages || []).find(m => m.id === m1.id) || {};
const att = (got.attachments || [])[0] || {};
rule(/^image\//.test(att.type || '') && /drive\.google\.com\/file\/d\//.test(att.url || ''), 'the tutor is not sent the picture as an image to draw inline', got.attachments);
/* PAT CHOSE NO PICTURE AND DRESSED A FIGURE: the head draws the figure. */
rule(got.withFace && got.withFace.pic === 'pfp:avatar' && got.withFace.avatar === 'v1:3.2.1.0.0.0.0.0',
  'a correspondent with no picture chosen and a figure is not drawn by their figure', got.withFace);
const cIn = as('P-C1', { action: 'messages' });
const back = (cIn.messages || []).find(m => m.id === m1.id) || {};
rule(back.withFace && back.withFace.pic === 'pfp:fox', 'a correspondent\'s chosen picture is not their message head', back.withFace);
/* A CHILD'S OWN PHOTOGRAPH, WITH A FIGURE TO STAND IN FOR IT, STAYS OFF OTHER PEOPLE'S SCREENS — the post face's rule. */
const k2 = as('P-A1', { action: 'sendMessage', to: 'Kit Child', toId: 'P-K1', body: 'Well done today' });
const aIn = as('P-A1', { action: 'messages' });
const toKid = (aIn.messages || []).find(m => m.id === k2.id) || {};
rule(k2.success && toKid.withFace && toKid.withFace.pic === 'pfp:avatar', 'a child\'s own photograph is sent as her message head', [k2, toKid.withFace]);

/* ---------- 10. A MESSAGE REPORTED: by whoever it was sent to (a child too), seen and closed on the admin's Reports ---------- */
const mrow = id => { const g = b.tabs.messages, h = g[0]; const r = g.slice(1).find(x => x[h.indexOf('message_id')] === id) || []; const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; };
const notMine = as('P-C1', { action: 'flagMessage', messageId: k2.id, reason: 'Unkind or bullying' });
rule(!notMine.success && !/^true$/i.test(String(mrow(k2.id).flagged)), 'a parent reported a message that was not sent to her', notMine);
const kFlag = as('P-K1', { action: 'flagMessage', messageId: k2.id, reason: 'It makes me feel unsafe — a few words' });
/* SINCE 486 A REPORT IS A ROW OF `reports` (kind message), and the message itself is left as it was. */
const repRow = () => { const g = b.tabs.reports || [[]], h = g[0]; return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; }).find(o => o.item_id === k2.id) || {}; };
rule(kFlag.success && repRow().kind === 'message' && /unsafe/.test(repRow().note) && !/^true$/i.test(String(mrow(k2.id).flagged)), 'a child could not report a message sent to her', [kFlag, repRow()]);
const reps = as('P-A1', { action: 'listReports' });
const seen = (reps.reports || []).find(m => m.itemId === k2.id);
rule(seen && /unsafe/.test(seen.note) && seen.from === 'Hal Boss' && /^Kit\b/.test(seen.to) && seen.to.indexOf('Child') < 0 && /Well done/.test(seen.body), 'the admin\'s Reports do not list the reported message with who, to whom and why', reps.reports);
rule(!as('P-T1', { action: 'listReports' }).success, 'a tutor was shown the reports');
const close = as('P-A1', { action: 'setReportStatus', id: seen && seen.id, status: 'fixed' });
rule(close.success && !(as('P-A1', { action: 'listReports' }).reports || []).some(m => m.itemId === k2.id),
  'Fixed did not take the message off the Reports card', close);
/* A MESSAGE FLAGGED BEFORE 486 is still read from its own row and closed there. */
b.ev("(function(){ const t = read(TAB.messages); const r = t.rows.find(x => S(x.message_id) === '" + k2.id + "'); setCell(t, r, 'flagged', 'TRUE'); setCell(t, r, 'flag_reason', 'old'); clearCache(); })()");
const old = as('P-A1', { action: 'listReports' });
rule((old.messages || []).some(m => m.id === k2.id), 'a message flagged before 486 is no longer on the Reports card', old.messages);
const oclose = as('P-A1', { action: 'setReportStatus', id: k2.id, status: 'fixed', kind: 'message' });
rule(oclose.success && String(mrow(k2.id).flagged) === 'CLEARED', 'Dealt with did not close an old flagged message', oclose);

if (bad.length) {
  console.log('FAILED — ' + bad.length + ' of ' + asked + ':\n  ✗ ' + bad.join('\n  ✗ '));
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: a post waits for its author and an admin, Approve puts it up for good, '
  + 'no links, a child uploads nothing, the business is an admin\'s, a message\'s picture, each head\'s face, a message reported.');
