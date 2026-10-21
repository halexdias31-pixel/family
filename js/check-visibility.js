#!/usr/bin/env node
/* node js/check-visibility.js — WHO SEES WHOM, THROUGH THE REAL doGet AND doPost (docs/history/386). § */
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
  'V-PA':  ['client',  'Albrecht', 'albrecht_vis1', 'pa@example.org'],
  'V-PB':  ['client',  'Brunhild', 'brunhild_vis2', 'pb@example.org'],
  'V-K1':  ['student', 'Cosimo',   'cosimo_vis3',   'k1@example.org'],
  'V-K2':  ['student', 'Delphine', 'delphine_vis4', 'k2@example.org'],
  'V-FR':  ['student', 'Ezequiel', 'ezequiel_vis5', 'fr@example.org'],
  'V-UN':  ['student', 'Fiorella', 'fiorella_vis6', 'un@example.org'],
  'V-PO':  ['client',  'Gottfried', 'gottfried_vis7', 'po@example.org'],
  'V-TU':  ['tutor',   'Hyacinth', 'hyacinth_vis8', 'tu@example.org'],
  'V-AD':  ['admin',   'Ignatius', 'ignatius_vis9', 'ad@example.org'],
};
const ALL = Object.keys(WHO);
b.seed('people', ALL.map(id => Object.assign({ person_id: id, role: WHO[id][0], first_name: WHO[id][1], last_name: 'Vistest',
  handle: WHO[id][2], email: WHO[id][3] }, base, id === 'V-K1' ? { friends: 'ezequiel_vis5, albrecht_vis1' } : {},
  id === 'V-TU' ? { rate_per_hour: 20, availability: 'sa10' } : {})));
/* TWO PARENTS, TWO CHILDREN, every link accepted — and an unrelated parent linked to nobody. */
b.seed('family', [['V-PA', 'V-K1'], ['V-PA', 'V-K2'], ['V-PB', 'V-K1'], ['V-PB', 'V-K2']].map(([p, c], i) =>
  ({ link_id: 'VL' + i, parent_id: p, child_id: c, child_typed: '', state: 'accepted' })));
b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
/* AN ADMIN'S POST that everybody said something under — the author is staff, so it is public. */
b.seed('posts', [{ post_id: 'VP1', author: 'Ignatius Vistest', image: 'https://example.org/v.jpg', caption: 'hello',
  approved: 'TRUE', active: 'TRUE', posted_on: '01/10/2026' }]);
b.seed('post_comments', ALL.map((id, i) => ({ comment_id: 'VC' + i, post_id: 'VP1', person_id: id, body: 'hi', said_on: '02/10/2026', active: 'TRUE' })));
b.seed('post_reactions', ALL.map((id, i) => ({ reaction_id: 'VR' + i, post_id: 'VP1', person_id: id, emoji: '👍', reacted_on: '02/10/2026' })));
/* THREADS ALREADY ON THE SHEET, some with somebody now hidden — a child and an unrelated child, two co-parents. */
b.seed('messages', [['V-K1', 'V-UN'], ['V-K1', 'V-AD'], ['V-PA', 'V-PB'], ['V-PA', 'V-TU'], ['V-K1', 'V-PA']].map(([f, t], i) =>
  ({ message_id: 'VM' + i, from_id: f, to_id: t, sent_at: '01/10/2026', body: 'old' })));

const tk = {};
ALL.forEach(id => { const d = b.post({ action: 'verifyLogin', email: WHO[id][3], pin: '0000' }); if (d && d.success) tk[id] = d; });
if (Object.keys(tk).length !== ALL.length) {
  console.log('Only ' + Object.keys(tk).length + ' of ' + ALL.length + ' invented people could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: tk[pid].name, personId: pid }, body));
const get = pid => b.get(pid ? { token: tk[pid].token } : {});
/* WHO IS IN A REPLY: anybody whose first name or handle appears in it. The viewer's own Settings name them, so a tutor is staff. */
const seenIn = v => { const j = JSON.stringify(Object.assign({}, v, { friends: '' })); return ALL.filter(id => j.indexOf(WHO[id][1]) !== -1 || j.indexOf(WHO[id][2]) !== -1); };
const STAFF = ['V-TU', 'V-AD'];
const expect = (label, got, want) => {
  const g = got.slice().sort().join(' '), w = want.slice().sort().join(' ');
  rule(g === w, label + ' sees [' + g + '], should be [' + w + ']');
};
/* WHAT EACH VIEWER MAY SEE (staff are public listings, and staff in a thread or under a post). */
const RULE = {
  'V-K1': ['V-K1', 'V-K2', 'V-FR'],    // himself, his sister, his friend — not his parents, though he "friended" one
  'V-K2': ['V-K2', 'V-K1'],
  'V-FR': ['V-FR'],                    // friending is one-way: Cosimo friended him, he did not friend Cosimo
  'V-UN': ['V-UN'],
  'V-PA': ['V-PA', 'V-K1', 'V-K2'],    // her children — not her co-parent
  'V-PB': ['V-PB', 'V-K1', 'V-K2'],
  'V-PO': ['V-PO'],
};
Object.keys(RULE).forEach(pid => {
  const want = RULE[pid].concat(STAFF);
  expect(pid + ' (doGet)', seenIn(get(pid)), want);
  rule(seenIn(tk[pid]).every(x => want.indexOf(x) !== -1), pid + '\'s sign-in reply names somebody hidden: ' + seenIn(tk[pid]).filter(x => want.indexOf(x) === -1).join(' '));
  rule(seenIn(as(pid, { action: 'myProfile' })).every(x => want.indexOf(x) !== -1), pid + '\'s myProfile names somebody hidden: '
    + seenIn(as(pid, { action: 'myProfile' })).filter(x => want.indexOf(x) === -1).join(' '));
  const inbox = as(pid, { action: 'messages' });
  rule(inbox && inbox.success, pid + ' could not read their messages — ' + JSON.stringify(inbox));
  rule(seenIn(inbox).every(x => want.indexOf(x) !== -1), pid + '\'s messages name somebody hidden: ' + seenIn(inbox).filter(x => want.indexOf(x) === -1).join(' '));
});
/* THE FAMILY CARDS: a child gets siblings and no parent; a parent children and no co-parent. */
const rel = pid => (get(pid).family || []).map(x => x.relation + ':' + x.personId).sort().join(' ');
rule(rel('V-K1') === 'sibling:V-K2', 'Cosimo\'s family cards are "' + rel('V-K1') + '", should be his sister only');
rule(rel('V-PA') === 'child:V-K1 child:V-K2', 'Albrecht\'s family cards are "' + rel('V-PA') + '", should be her two children only');
rule(!(tk['V-K1'].parents || []).length && (tk['V-K1'].siblings || []).length === 1, 'Cosimo\'s sign-in reply names parents, or not his sister — '
  + JSON.stringify([tk['V-K1'].parents, tk['V-K1'].siblings]));
/* THE THREADS: Cosimo keeps the admin's and loses the unrelated child's and his parent's; Albrecht keeps her child's and the tutor's, not her co-parent's. The friends cell is the viewer's own typing. */
const withs = pid => (as(pid, { action: 'messages' }).messages || []).map(m => m.withId).sort().join(' ');
rule(withs('V-K1') === 'V-AD', 'Cosimo\'s threads are with "' + withs('V-K1') + '", should be the admin only');
rule(withs('V-PA') === 'V-K1 V-TU', 'Albrecht\'s threads are with "' + withs('V-PA') + '", should be her child and the tutor, not her co-parent');
rule(withs('V-AD') === 'V-K1', 'the admin\'s threads changed: "' + withs('V-AD') + '"');
/* AND THE UNCHANGED: an admin sees everybody; a tutor and a stranger see the staff listing, and no child. */
expect('the admin (doGet)', seenIn(get('V-AD')), ALL);
const stranger = get(null);
rule(seenIn(stranger).indexOf('V-TU') !== -1 && !seenIn(stranger).some(x => /K1|K2|FR|UN/.test(x)), 'a stranger sees ' + seenIn(stranger).join(' ') + ' — the tutors list, and no child');
/* FRIENDING: a child's handle is accepted from a phone that does not hold it; a parent's is refused. */
const addUn = as('V-K2', { action: 'saveFriends', friends: 'fiorella_vis6' });
rule(addUn && addUn.success, 'Delphine could not friend a child whose handle her phone was never sent — ' + JSON.stringify(addUn));
rule(seenIn(get('V-K2')).indexOf('V-UN') !== -1, 'Delphine friended Fiorella and is still not sent her');
const addPar = as('V-K2', { action: 'saveFriends', friends: 'fiorella_vis6, gottfried_vis7' });
rule(addPar && !addPar.success, 'a child could put a parent\'s handle on her friends list — ' + JSON.stringify(addPar));
/* AND A DM TO SOMEBODY HIDDEN IS REFUSED — a parent to her co-parent. */
const dm = as('V-PA', { action: 'sendMessage', toId: 'V-PB', body: 'hello' });
rule(dm && !dm.success, 'a parent could message her co-parent — ' + JSON.stringify(dm));

if (bad.length) {
  console.log('WHO SEES WHOM IS WRONG  (' + bad.length + ' of ' + asked + ')');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: a child sees siblings and friends, never a parent; a parent her children, never a co-parent; staff and admin unchanged.');
