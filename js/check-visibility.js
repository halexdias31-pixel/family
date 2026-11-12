#!/usr/bin/env node
/* node js/check-visibility.js — WHO SEES WHOM, THROUGH THE REAL doGet AND doPost (docs/decisions.md, 10 Nov). § */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, what) => { asked++; if (!ok) bad.push(what); return !!ok; };
const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0 };
/* id, role, first name (unique), handle (unique), email */
const WHO = {
  'V-PA':  ['client',  'Albrecht',  'albrecht_vis1',  'pa@example.org'],   // family A, co-parents
  'V-PB':  ['client',  'Brunhild',  'brunhild_vis2',  'pb@example.org'],
  'V-K1':  ['student', 'Cosimo',    'cosimo_vis3',    'k1@example.org'],   // family A's children
  'V-K2':  ['student', 'Delphine',  'delphine_vis4',  'k2@example.org'],
  'V-PC':  ['client',  'Gottfried', 'gottfried_vis7', 'pc@example.org'],   // family B
  'V-K3':  ['student', 'Ezequiel',  'ezequiel_vis5',  'k3@example.org'],
  'V-UN':  ['student', 'Fiorella',  'fiorella_vis6',  'un@example.org'],   // a student with no parent, booked herself
  'V-PO':  ['client',  'Leopold',   'leopold_vis10',  'po@example.org'],   // a parent linked to nobody, booked nothing
  'V-T1':  ['tutor',   'Hyacinth',  'hyacinth_vis8',  't1@example.org'],
  'V-T2':  ['tutor',   'Jolyon',    'jolyon_vis11',   't2@example.org'],
  'V-AD':  ['admin',   'Ignatius',  'ignatius_vis9',  'ad@example.org'],
};
const ALL = Object.keys(WHO);
const full = id => WHO[id][1] + ' Vistest';
/* THE OLD FRIENDS CELL IS KEPT ON THE SHEET (no data loss) and must open nobody. */
b.seed('people', ALL.map(id => Object.assign({ person_id: id, role: WHO[id][0], first_name: WHO[id][1], last_name: 'Vistest',
  handle: WHO[id][2], email: WHO[id][3] }, base, id === 'V-K1' ? { friends: 'ezequiel_vis5, fiorella_vis6, albrecht_vis1' } : {},
  /^V-T/.test(id) ? { rate_per_hour: 20, availability: 'sa10' } : {})));
b.seed('family', [['V-PA', 'V-K1'], ['V-PA', 'V-K2'], ['V-PB', 'V-K1'], ['V-PB', 'V-K2'], ['V-PC', 'V-K3']].map(([p, c], i) =>
  ({ link_id: 'VL' + i, parent_id: p, child_id: c, child_typed: '', state: 'accepted' })));
b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
/* THE BOOKINGS: A books Cosimo with Hyacinth and Delphine with Jolyon; B's Ezequiel shares a class with Fiorella, Jolyon teaching. */
const JOBS = [['VJ1', 'V-PA', 'Cosimo', 'V-T1'], ['VJ2', 'V-PA', 'Delphine', 'V-T2'], ['VJ3', 'V-PC', 'Ezequiel', 'V-T2'], ['VJ3', 'V-UN', '', '']];
b.seed('jobs', [...new Set(JOBS.map(j => j[0]))].map(id => ({ job_id: id, subject: 'Maths', level: 'GCSE', weekday: 'Mon', start_time: '16:00',
  venue: '', max_students: 4, price_total: 100, open_to_others: 'FALSE', kind: '',
  for_children: JOBS.filter(j => j[0] === id).map(j => j[2]).filter(Boolean).join(', ') })));
let ev = 0;
b.seed('events', JOBS.flatMap(([job, client, , tutor]) => [
  { event_id: 'VE' + (ev++), at: '01/10/2026', job_id: job, actor: full(client), role: 'client', action: 'Request' },
].concat(tutor ? [{ event_id: 'VE' + (ev++), at: '01/10/2026', job_id: job, actor: full(tutor), role: 'tutor', action: 'Accept' }] : [])));
/* AN ADMIN'S POST that everybody said something under, and a child's own post. */
b.seed('posts', [{ post_id: 'VP1', author: full('V-AD'), image: 'https://example.org/v.jpg', caption: 'hello', approved: 'TRUE', active: 'TRUE', posted_on: '01/10/2026' },
  { post_id: 'VP2', author: full('V-UN'), image: 'https://example.org/w.jpg', caption: 'mine', approved: 'TRUE', active: 'TRUE', posted_on: '01/10/2026' }]);
b.seed('post_comments', ALL.map((id, i) => ({ comment_id: 'VC' + i, post_id: 'VP1', person_id: id, body: 'hi', said_on: '02/10/2026', active: 'TRUE' })));
b.seed('post_reactions', ALL.map((id, i) => ({ reaction_id: 'VR' + i, post_id: 'VP1', person_id: id, emoji: '👍', reacted_on: '02/10/2026' })));
/* THREADS ALREADY ON THE SHEET, many with somebody the viewer may no longer see. */
const THREADS = [['V-K1', 'V-UN'], ['V-K1', 'V-AD'], ['V-PA', 'V-PB'], ['V-PA', 'V-T1'], ['V-K1', 'V-PA'], ['V-K1', 'V-T1'],
  ['V-K1', 'V-T2'], ['V-T1', 'V-K3'], ['V-T1', 'V-T2'], ['V-T2', 'V-PC'], ['V-PO', 'V-T1']];
b.seed('messages', THREADS.map(([f, t], i) => ({ message_id: 'VM' + i, from_id: f, to_id: t, sent_at: '01/10/2026', body: 'old' })));

const tk = {};
ALL.forEach(id => { const d = b.post({ action: 'verifyLogin', email: WHO[id][3], pin: '0000' }); if (d && d.success) tk[id] = d; });
if (Object.keys(tk).length !== ALL.length) {
  console.log('Only ' + Object.keys(tk).length + ' of ' + ALL.length + ' invented people could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: tk[pid].name, personId: pid }, body));
const get = pid => b.get(pid ? { token: tk[pid].token } : {});
const STAFF = ['V-T1', 'V-T2', 'V-AD'];
const PRIVATE = ALL.filter(id => STAFF.indexOf(id) === -1);
/* WHO IS IN A REPLY: anybody whose first name or handle appears in it. */
const seenIn = (v, among) => { const j = JSON.stringify(v); return (among || ALL).filter(id => j.indexOf(WHO[id][1]) !== -1 || j.indexOf(WHO[id][2]) !== -1); };
const list = a => a.slice().sort().join(' ');
const expect = (label, got, want) => rule(list(got) === list(want), label + ' is [' + list(got) + '], should be [' + list(want) + ']');

/* ---------- THE MATRIX: whom each viewer may see (`seesWhom_`), and whom they may message (`sendMessage`'s gate). Admin: everyone. */
const MAY = {
  'V-K1': ['V-K1', 'V-T1'],                                   // himself and his tutor — no sister, no parent, no "friend"
  'V-K2': ['V-K2', 'V-T2'],
  'V-K3': ['V-K3', 'V-T2'],                                   // shares a class with Fiorella and still does not see her
  'V-UN': ['V-UN', 'V-T2'],
  'V-PA': ['V-PA', 'V-K1', 'V-K2', 'V-T1', 'V-T2'],           // her children and their tutors — not her co-parent
  'V-PB': ['V-PB', 'V-K1', 'V-K2', 'V-T1', 'V-T2'],
  'V-PC': ['V-PC', 'V-K3', 'V-T2'],
  'V-PO': ['V-PO'],
  'V-T1': ['V-T1', 'V-K1', 'V-PA', 'V-PB'],                   // the student booked with him and that student's parents
  'V-T2': ['V-T2', 'V-K2', 'V-K3', 'V-UN', 'V-PA', 'V-PB', 'V-PC'],
};
const REACH = {
  'V-K1': ['V-T1', 'V-AD'], 'V-K2': ['V-T2', 'V-AD'], 'V-K3': ['V-T2', 'V-AD'], 'V-UN': ['V-T2', 'V-AD'],
  'V-PA': ['V-T1', 'V-T2', 'V-AD'], 'V-PB': ['V-T1', 'V-T2', 'V-AD'], 'V-PC': ['V-T2', 'V-AD'], 'V-PO': ['V-AD'],
  'V-T1': ['V-K1', 'V-PA', 'V-PB', 'V-AD'], 'V-T2': ['V-K2', 'V-K3', 'V-UN', 'V-PA', 'V-PB', 'V-PC', 'V-AD'],
  'V-AD': ALL.filter(x => x !== 'V-AD'),
};
/* WHO MUST BE THERE, so an empty payload is not a pass: a parent's children; a tutor's booked students. */
const MUST = { 'V-PA': ['V-K1', 'V-K2'], 'V-PB': ['V-K1', 'V-K2'], 'V-PC': ['V-K3'], 'V-T1': ['V-K1'], 'V-T2': ['V-K2', 'V-K3', 'V-UN'] };

const seesSet = pid => { const v = b.ev('JSON.stringify(seesWhom_(findPerson("", ' + JSON.stringify(pid) + ')))'); return v === 'null' ? null : Object.keys(JSON.parse(v)); };
const gate = (from, to) => !!b.ev('(function(){ const m = findPerson("", ' + JSON.stringify(from) + '), t = findPerson("", ' + JSON.stringify(to) + ');'
  + ' return mayMessage(actingRole_(m), actingRole_(t)) && seesPerson_(seesWhom_(m), t); })()');

rule(seesSet('V-AD') === null, 'the admin is not "sees everybody" (seesWhom_ gave a set)');
Object.keys(MAY).forEach(pid => {
  const want = MAY[pid];
  expect(pid + '\'s seesWhom_', seesSet(pid) || ALL, want);
  /* EVERY PERSON-CARRYING REPLY: private people only from the set (tutors are public listings, and the admin is the business). */
  const wantPriv = want.filter(x => PRIVATE.indexOf(x) !== -1);
  const pay = get(pid);
  const inPay = seenIn(pay, PRIVATE);
  rule(inPay.every(x => wantPriv.indexOf(x) !== -1), pid + '\'s doGet names somebody hidden: ' + inPay.filter(x => wantPriv.indexOf(x) === -1).join(' '));
  (MUST[pid] || []).concat(PRIVATE.indexOf(pid) !== -1 ? [pid] : []).forEach(x => rule(inPay.indexOf(x) !== -1, pid + '\'s doGet does not name ' + x + ', whom they must see'));
  [['sign-in reply', tk[pid]], ['myProfile', as(pid, { action: 'myProfile' })], ['messages', as(pid, { action: 'messages' })]].forEach(([what, v]) => {
    const hid = seenIn(v).filter(x => want.indexOf(x) === -1 && x !== 'V-AD');
    rule(!hid.length, pid + '\'s ' + what + ' names somebody hidden: ' + hid.join(' '));
  });
  rule(!('friends' in tk[pid]), pid + '\'s sign-in reply still carries a friends list');
  /* AND THE THREADS SENT: only with somebody they may still see, or the admin. */
  const withs = (as(pid, { action: 'messages' }).messages || []).map(m => m.withId);
  const had = THREADS.filter(t => t.indexOf(pid) !== -1).map(t => t[0] === pid ? t[1] : t[0]);
  expect(pid + '\'s threads', withs, had.filter(x => want.indexOf(x) !== -1 || x === 'V-AD'));
});
expect('the admin (doGet)', seenIn(get('V-AD')), ALL);
/* WHOM EACH MAY MESSAGE — the very gate `sendMessage` asks. */
Object.keys(REACH).forEach(pid => expect(pid + ' may message', ALL.filter(x => x !== pid && gate(pid, x)), REACH[pid]));
/* AND THROUGH THE REAL ACTION: a refusal changes nothing; one allowed send each. */
[['V-K1', 'V-K2'], ['V-K1', 'V-T2'], ['V-K1', 'V-PA'], ['V-PA', 'V-PB'], ['V-T1', 'V-K3'], ['V-T1', 'V-T2'], ['V-T2', 'V-K1']].forEach(([f, t]) => {
  const d = as(f, { action: 'sendMessage', toId: t, body: 'hello' });
  rule(d && !d.success, f + ' could message ' + t + ' — ' + JSON.stringify(d));
});
[['V-K1', 'V-T1'], ['V-T2', 'V-UN']].forEach(([f, t]) => {
  const d = as(f, { action: 'sendMessage', toId: t, body: 'hello' });
  rule(d && d.success, f + ' could not message ' + t + ', whom they may — ' + JSON.stringify(d));
});
/* THE FAMILY CARDS: a child gets none; a parent children and no co-parent. */
const rel = pid => (get(pid).family || []).map(x => x.relation + ':' + x.personId).sort().join(' ');
rule(rel('V-K1') === '', 'Cosimo\'s family cards are "' + rel('V-K1') + '", should be none');
rule(rel('V-PA') === 'child:V-K1 child:V-K2', 'Albrecht\'s family cards are "' + rel('V-PA') + '", should be her two children only');
rule(!(tk['V-K1'].parents || []).length && !(tk['V-K1'].siblings || []).length, 'Cosimo\'s sign-in reply names parents or siblings — '
  + JSON.stringify([tk['V-K1'].parents, tk['V-K1'].siblings]));
/* A STRANGER: the tutors list, and nobody private. */
const stranger = seenIn(get(null));
rule(stranger.indexOf('V-T1') !== -1 && !stranger.some(x => PRIVATE.indexOf(x) !== -1), 'a stranger sees ' + stranger.join(' ') + ' — the tutors list, and nobody private');
/* NO FRIENDING: the action is unanswered and the old cell is left as it was. */
const fr = as('V-K2', { action: 'saveFriends', friends: 'fiorella_vis6' });
rule(fr && !fr.success, 'saveFriends is still answered — ' + JSON.stringify(fr));
const cell = b.ev('S(findPerson("", "V-K1").friends)');
rule(cell === 'ezequiel_vis5, fiorella_vis6, albrecht_vis1', 'the friends cell was changed — it is kept, unread: ' + cell);

if (bad.length) {
  console.log('WHO SEES WHOM IS WRONG  (' + bad.length + ' of ' + asked + ')');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: a student sees themself and their tutors; a parent their children; a tutor their booked students and their parents; the admin everyone — in every reply and every message.');
