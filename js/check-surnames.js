#!/usr/bin/env node
/* ==================================================================================================
   node js/check-surnames.js — NO CHILD'S SURNAME LEAVES THE SERVER, THROUGH THE REAL BACKEND

   THE OWNER, 10 OCT: *"also side note dont show children's last name."*

   A side note that is true only if it is true EVERYWHERE: the people column, a family card, a roster,
   a post, "who reacted", a message, a receipt, the weekly email. A name the phone is sent and told not
   to draw is in the JSON of everybody who opens the network tab, so the question this asks is not "is
   it drawn" but "is it SENT" — of every reply and every payload, for every kind of person who could ask,
   and of every email. `check-flow.js` asks the other half, of the screens, over these same replies.

   THE DECISION THIS HOLDS (people.gs, "A CHILD IS CALLED BY THEIR FIRST NAME"): a child's surname goes
   to NOBODY — not another student, not a parent, not a tutor, not a stranger, and not their own parent
   or an admin either, who have it already and whose screens would only draw it. ONE place it goes: the
   child's own Settings, as `profile.last_name` on their own sign-in reply and `myProfile`, so they can
   see and fix what they typed. The sheet keeps every surname; nothing here writes one away.

   THE CHILD IS `Wren Quorrington` — a surname nobody else here has, so finding it anywhere means only
   one thing — with a SECOND Wren beside her, because two children with one first name are told apart by
   their handles, and that is a rule too. Her name is put where a whole name is STORED as text, the way
   the live sheet has it — an event's actor, a post's author, a booking's children, a typed `children`
   cell — as well as where one is BUILT, because the stored ones are what a rule about building cannot
   reach.

   AND THE CHILDREN THE FIRST VERSION OF THE RULE MISSED (the review of 10 Oct), each with a surname of
   her own so a find means one thing: `Vandersloot`, a child who ticked Tutor in her own Settings and is
   still waiting (to `mainRole` she was a tutor, and her whole name went to a signed-out stranger);
   `Marchbanks`, typed into the sheet as a `pupil`; `Fennimore`, who is only words in her parent's
   `children` cell; and `Brackenridge`, the surname a child had when he booked and has since corrected.
   With them, a grown-up who is learning (the score board says a first name for everybody, as it always
   did), and what comes BACK: text the net shortened, saved again, must not be written over the sheet's.

   Invented people, example.org addresses, and no PIN but the 0000 placeholder.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const REPO = path.resolve(__dirname, '..');
const SUR = 'Quorrington';
/* EVERY CHILD'S SURNAME THAT MUST NOT LEAVE — Wren's, and the four the review found going out. */
const HUNT = [SUR, 'Vandersloot', 'Marchbanks', 'Fennimore', 'Brackenridge'];
const HUNT_RE = new RegExp(HUNT.join('|'), 'i');
const bad = [];
let asked = 0, held = 0;
const S = v => (v === undefined || v === null) ? '' : String(v);
const rule = (ok, what) => { asked++; if (ok) held++; else bad.push(what); return !!ok; };
const has = v => HUNT_RE.test(typeof v === 'string' ? v : JSON.stringify(v));
/* WHERE IN A REPLY THE SURNAME IS, so a failure names the key rather than a wall of JSON. */
const where = (v, at) => {
  at = at || '';
  if (typeof v === 'string') return has(v) ? [at + ' = ' + JSON.stringify(v.length > 120 ? v.slice(0, 120) + '…' : v)] : [];
  if (!v || typeof v !== 'object') return [];
  return [].concat(...Object.keys(v).map(k => (has(k) ? [at + ' has the key ' + JSON.stringify(k)] : [])
    .concat(where(v[k], at + (Array.isArray(v) ? '[' + k + ']' : '.' + k)))));
};
const none = (v, who) => rule(!has(v), who + ' carries a child\'s surname: ' + where(v).slice(0, 4).join(' ; '));

/* ==================================================================================================
   1. THE SOURCE — ONE DOOR OUT FOR A REPLY, ONE FOR AN EMAIL
   ================================================================================================== */
const FILES = fs.readdirSync(path.join(REPO, 'backend')).filter(f => /\.gs$/.test(f));
if (!FILES.length) { console.log('No backend/*.gs could be read, so NOTHING was checked — not a pass.'); process.exit(1); }
const code = f => fs.readFileSync(path.join(REPO, 'backend', f), 'utf8')
  /* COMMENTS OUT — the house style is a comment that says `MailApp.sendEmail` in a bug report. */
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
const SRC = {};
FILES.forEach(f => { SRC[f] = code(f); });
/* THE FUNCTION A LINE IS IN — the nearest `function name(` above it. */
const fnAt = (src, i) => { const m = [...src.slice(0, i).matchAll(/\bfunction\s+(\w+)\s*\(/g)].pop(); return m ? m[1] : ''; };
FILES.forEach(f => {
  const src = SRC[f];
  for (const m of src.matchAll(/\b(MailApp|GmailApp)\s*\.\s*send(Email)?\s*\(/g)) {
    rule(m[1] === 'MailApp' && fnAt(src, m.index) === 'mailOut_', 'backend/' + f + ' sends an email from `' + fnAt(src, m.index)
      + '` with ' + m[1] + ' — every email goes through `mailOut_`, which is what takes a child\'s surname out of it');
  }
  for (const m of src.matchAll(/\bContentService\s*\.\s*createTextOutput\s*\(/g)) {
    const fn = fnAt(src, m.index);
    rule(fn === 'jsonOut' || fn === 'jsonRaw_', 'backend/' + f + ' answers from `' + fn + '` past `jsonOut` — the net that keeps a child\'s surname out of every reply is there');
  }
});
const ALL = FILES.map(f => SRC[f]).join('\n');
rule(/function jsonOut\([\s\S]*?kidNamesOff_\(obj\)[\s\S]*?JSON\.stringify\(obj\)/.test(ALL), '`jsonOut` no longer puts its reply through `kidNamesOff_` before it is written');
rule(/kidNamesOff_\(payload\)[\s\S]{0,400}cachePut_\(/.test(ALL), '`doGet` keeps the payload without putting it through `kidNamesOff_` first — the kept body goes out by `jsonRaw_`, past `jsonOut`');
rule(/function mailOut_\([\s\S]*?kidNamesOff_[\s\S]*?MailApp\.sendEmail\(o\)/.test(ALL), '`mailOut_` sends without putting the email through `kidNamesOff_`');

/* ==================================================================================================
   2. THE PEOPLE, AND WHERE A CHILD'S WHOLE NAME IS ALREADY WRITTEN DOWN
   ================================================================================================== */
const MAIL = [];
const mailApp = { sendEmail(m) { MAIL.push(m); }, getRemainingDailyQuota: () => 100 };
const b = backend({ MailApp: mailApp });
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0 };
const P = (id, role, first, last, email, handle, extra) => Object.assign({ person_id: id, role: role,
  first_name: first, last_name: last, email: email, handle: handle }, base, extra || {});
const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const dmy = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
b.seed('people', [
  P('P-ADM', 'admin',   'Hal',  'Admin',     'admin@example.org',  'hal_kind40'),
  /* HER TUTOR'S HEADLINE NAMES HER — a Settings box that comes back through the net and is saved whole. */
  P('P-TUT', 'tutor',   'Tam',  'Tutor',     'tutor@example.org',  'tam_kind41', { availability: 'm16,m17,sa10,sa11,sa12,sa13,sa14,sa15',
    rate_per_hour: 20, max_students: 4, min_students: 1, age_min: 8, age_max: 16, dbs_checked: true,
    headline: 'Tutor to Wren Quorrington since 2024' }),
  /* HER NOTEPAD NAMES HER WHOLE, as a parent's would — and it comes back to her through the net. */
  P('P-PAR', 'client',  'Pip',  'Ashdown',   'pip@example.org',    'pip_kind42', { children: 'Wren Quorrington',
    notepad: 'Wren Quorrington: dentist on Tuesday' }),
  /* THE CHILD: an email of her own, so what is mailed TO her is asked too; a birthday and an exam, so
     the family's calendar names her; a high score, so the board does. */
  P('P-KID', 'student', 'Wren', SUR,         'wren@example.org',   'wren_kind43', { date_of_birth: '14/03/2014',
    exam_big_date: dmy(day(60)), high_score_flappy: 31 }),
  P('P-KD2', 'student', 'Wren', 'Ollerby',   'wren2@example.org',  'wren_bold44'),
  P('P-STU', 'student', 'Ned',  'Pell',      'ned@example.org',    'ned_kind45'),
  P('P-OTH', 'client',  'Ola',  'Brisk',     'ola@example.org',    'ola_kind46'),
  /* TWO MORE CHILDREN FOR THE NET'S EDGES: one typed into the sheet with a surname and no first name, and
     one whose surname has an apostrophe in it. */
  P('P-SUR', 'student', '',     'Thistlebrook', '',                 'thistle_kind47'),
  P('P-APO', 'student', 'Rue',  "O'Dell",    '',                   'rue_kind48'),
  /* A GROWN-UP WHO SHARES THE NO-FIRST-NAME CHILD'S SURNAME — theirs to see in their own Settings. */
  P('P-ANN', 'client',  'Ann',  'Thistlebrook', 'ann@example.org',  'ann_kind52'),
  /* THE FOUR THE REVIEW FOUND: she ticks Tutor herself below; a `pupil`; a child who books and then
     corrects his surname; and a parent whose only child is words in her `children` cell. */
  P('P-PEN', 'student', 'Juno', 'Vandersloot', 'juno@example.org', 'juno_kind49', { high_score_flappy: 12 }),
  P('P-PUP', 'pupil',   'Kit',  'Marchbanks', 'kit@example.org',   'kit_kind50'),
  P('P-REN', 'student', 'Ivo',  'Brackenridge', 'ivo@example.org', 'ivo_kind53'),
  P('P-TYP', 'client',  'Tess', 'Lowe',      'tess@example.org',   'tess_kind54', { children: 'Sol Fennimore' }),
  /* A GROWN-UP WHO IS ALSO LEARNING: a parent, so not a child — and on the score board by first name,
     as everybody on it always was. */
  P('P-GUS', 'client, student', 'Gus', 'Hartwell', 'gus@example.org', 'gus_kind51', { high_score_flappy: 7 }),
]);
b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAR', child_id: 'P-KID', child_typed: 'Wren ' + SUR, state: 'accepted' }]);
b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
/* HER POST, HER REACTION AND HER WORD ON IT — the author cell as the sheet keeps it, her whole name. */
b.seed('posts', [{ post_id: 'PO-1', author: 'Wren ' + SUR, posted_by: 'Wren ' + SUR, image: 'https://example.org/w.jpg',
  caption: 'Wren ' + SUR + ' and the volcano', approved: 'TRUE', active: 'TRUE', posted_on: dmy(day(-1)) }]);
b.seed('post_reactions', [{ reaction_id: 'R1', post_id: 'PO-1', person_id: 'P-KID', emoji: '👍', reacted_on: dmy(day(-1)) },
                          { reaction_id: 'R2', post_id: 'PO-1', person_id: 'P-KD2', emoji: '👏', reacted_on: dmy(day(-1)) }]);
b.seed('post_comments', [{ comment_id: 'C1', post_id: 'PO-1', person_id: 'P-KID', body: 'thank you', said_on: dmy(day(-1)), active: 'TRUE' }]);
b.seed('exams', [{ exam_id: 'E1', person_id: 'P-KID', subject: 'Maths', label: 'Mock', exam_date: dmy(day(30)), kind: 'mock', active: 'TRUE' }]);
b.seed('orders', [{ order_id: 'O1', person_id: 'P-KID', item: 'Worksheet', cost_pence: 100, state: 'asked', asked_on: dmy(day(-2)) }]);

const tk = {};
const signIn = (who, as) => { const d = b.post({ action: 'verifyLogin', email: who, name: who, pin: '0000' }); if (d && d.success) tk[as] = d; return d; };
[['admin@example.org', 'P-ADM'], ['tutor@example.org', 'P-TUT'], ['pip@example.org', 'P-PAR'], ['wren_kind43', 'P-KID'],
 ['wren2@example.org', 'P-KD2'], ['ned@example.org', 'P-STU'], ['ola@example.org', 'P-OTH'], ['juno@example.org', 'P-PEN'],
 ['kit@example.org', 'P-PUP'], ['ivo@example.org', 'P-REN'], ['tess@example.org', 'P-TYP'], ['ann@example.org', 'P-ANN'],
 ['thistle_kind47', 'P-SUR'], ['gus@example.org', 'P-GUS']].forEach(([w, id]) => signIn(w, id));
if (Object.keys(tk).length < 14) {
  console.log('Only ' + Object.keys(tk).length + ' of 14 invented people could sign in (' + Object.keys(tk).join(', ')
    + '), so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: tk[pid].name, personId: pid }, body));
const get = pid => b.get(pid ? { token: tk[pid].token } : {});

/* SHE BOOKS THE TUTOR HERSELF — and her phone, which calls her `Wren` now, says so in `clientName`. The
   seat must still go down under her WHOLE name: the sheet keeps it, and a seat called `Wren` would answer
   to no row and to every other Wren. */
const slotDay = 'Saturday';
const own = as('P-KID', { action: 'createJob', clientName: 'Wren (@wren_kind43)', requestedTutor: 'Tam Tutor', subject: 'Maths',
  level: 'GCSE', day: slotDay, time: '10:00', slots: 'sa10', location: 'Online', dates: dmy(day(40)), hours: 1, price: 30,
  openToOthers: true });
rule(own && own.success, 'the child could not book the tutor herself, so her seat on a roster was not checked — ' + JSON.stringify(own));
const evH = b.tabs.events[0];
const actors = b.tabs.events.slice(1).map(r => S(r[evH.indexOf('actor')]));
rule(actors.indexOf('Wren ' + SUR) !== -1 && actors.indexOf('Wren (@wren_kind43)') === -1 && actors.indexOf('Wren') === -1,
  'a child\'s own booking did not go into the events under her whole name (the phone\'s `clientName` was taken) — actors: ' + JSON.stringify(actors));
/* SHE INVITES A FRIEND TO SHARE IT. AN INVITATION IS AN HTML EMAIL — she asks a friend to share her session, and her name is in its HTML.
   The only email here with an `htmlBody` that names her, so it is what proves the net reaches the HTML. */
const m2 = MAIL.length;
const inv = as('P-KID', { action: 'sendInvites', jobId: own && (own.jobId || own.id), emails: ['friend@example.org'] });
const invM = MAIL.slice(m2).find(m => m.to === 'friend@example.org');
rule(inv && inv.success && invM && /Wren/.test(S(invM.htmlBody)),
  'her invitation to a friend was not caught with her first name in its HTML, so the HTML was not asked — ' + JSON.stringify(inv));
/* HER PARENT BOOKS FOR HER, AS AN OLD PHONE DID — her whole name in the children ticked. */
const forHer = as('P-PAR', { action: 'createJob', requestedTutor: 'Tam Tutor', subject: 'English', level: 'GCSE', day: slotDay,
  time: '11:00', slots: 'sa11', location: 'Online', dates: dmy(day(41)), hours: 1, price: 30, kids: 'Wren ' + SUR });
rule(forHer && forHer.success, 'the parent could not book for her child, so `for_children` was not checked — ' + JSON.stringify(forHer));
/* BOTH WRENS WRITE TO THE ADMIN — a student may reach the admin and nobody else (`MESSAGING`) — so the
   admin's inbox holds two threads, and the email that says "A message from…" has her name in it. */
const wroteB = as('P-KD2', { action: 'sendMessage', to: 'Hal Admin', toId: 'P-ADM', body: 'And me?' });
rule(wroteB && wroteB.success, 'the other Wren could not write to the admin — ' + JSON.stringify(wroteB));
const m0 = MAIL.length;
const wrote = as('P-KID', { action: 'sendMessage', to: 'Hal Admin', toId: 'P-ADM', body: 'Can we do fractions?' });
rule(wrote && wrote.success, 'the child could not write to the admin — ' + JSON.stringify(wrote));
rule(MAIL.slice(m0).some(m => m.to === 'admin@example.org'), 'no email told the admin about her message, so its wording was not asked');

/* ---------- THE CHILDREN THE FIRST NET MISSED, PUT WHERE THEIR WHOLE NAMES GET STORED ----------------- */
const slotB = (time, slot, d) => ({ action: 'createJob', requestedTutor: 'Tam Tutor', subject: 'Maths', level: 'GCSE', day: slotDay,
  time: time, slots: slot, location: 'Online', dates: dmy(day(d)), hours: 1, price: 30, openToOthers: true });
/* JUNO TICKS TUTOR IN HER OWN SETTINGS. It is a request, not a role: `listed` goes PENDING and the business
   has said nothing — so she is a child still, and must be called one. Then she books and says a word on
   Wren's post, so her whole name is in an event's `actor`, her tutor's roster, the "New request" email,
   a comment and the score board. */
const ticked = as('P-PEN', { action: 'setMyRoles', roles: ['student', 'tutor'] });
rule(ticked && ticked.success && ticked.tutorPending === true && /tutor/.test(S(b.row('P-PEN').role)) && S(b.row('P-PEN').listed) === 'PENDING',
  'the child could not tick Tutor and be left waiting, so a pending tick was not asked — ' + JSON.stringify(ticked) + ' ' + JSON.stringify(b.row('P-PEN').role));
const junoB = as('P-PEN', slotB('12:00', 'sa12', 42));
rule(junoB && junoB.success, 'the child who ticked Tutor could not book, so her seat was not asked — ' + JSON.stringify(junoB));
const said = as('P-PEN', { action: 'addComment', postId: 'PO-1', body: 'great volcano' });
rule(said && said.success, 'the child who ticked Tutor could not comment, so a comment\'s author was not asked — ' + JSON.stringify(said));
const kitB = as('P-PUP', slotB('13:00', 'sa13', 43));
rule(kitB && kitB.success, 'the `pupil` could not book, so a pupil\'s seat was not asked — ' + JSON.stringify(kitB));
/* IVO BOOKS AS IVO BRACKENRIDGE, THEN CORRECTS IT — the events keep the name he booked under. */
const ivoB = as('P-REN', slotB('14:00', 'sa14', 44));
rule(ivoB && ivoB.success, 'Ivo could not book, so a seat under a surname since corrected was not asked — ' + JSON.stringify(ivoB));
const ivoR = as('P-REN', { action: 'updateProfile', targetId: 'P-REN', fields: { last_name: 'Brack' } });
rule(ivoR && ivoR.success && S(b.row('P-REN').last_name) === 'Brack', 'Ivo could not correct his surname — ' + JSON.stringify(ivoR));
rule(/Ivo Brackenridge/.test(S(b.row('P-REN').name_was)), 'the name Ivo had before is not on `name_was`, so nothing can recognise what was stored under it — '
  + JSON.stringify(b.row('P-REN').name_was));
/* TESS BOOKS FOR SOL AS A PHONE SIGNED IN BEFORE 10 OCT DID: the typed cell's whole words in `kids`. */
const tessB = as('P-TYP', Object.assign(slotB('15:00', 'sa15', 45), { kids: 'Sol Fennimore' }));
rule(tessB && tessB.success, 'Tess could not book for Sol, so a typed-only child\'s `for_children` was not asked — ' + JSON.stringify(tessB));

/* ==================================================================================================
   3. NOBODY ELSE IS SENT IT — every payload and every reply, for every kind of person
   ================================================================================================== */
const WHO = { 'a stranger (signed out)': null, 'another student': 'P-STU', 'the other Wren': 'P-KD2', 'another parent': 'P-OTH',
              'her own parent': 'P-PAR', 'her tutor': 'P-TUT', 'an admin': 'P-ADM',
              'Sol\'s parent, who typed her name': 'P-TYP', 'a grown-up who is learning': 'P-GUS' };
Object.keys(WHO).forEach(label => {
  const pid = WHO[label];
  none(get(pid), 'the payload for ' + label);
  /* A SECOND GET IS A CACHE HIT — the kept body, out by `jsonRaw_`, never through `jsonOut`. */
  const again = get(pid);
  rule(again.cached === true, 'the second payload for ' + label + ' was not the kept copy, so the kept copy was not asked (no `cached`)');
  none(again, 'the KEPT payload for ' + label);
  if (!pid) return;
  none(tk[pid], 'the sign-in reply for ' + label);
  none(as(pid, { action: 'myProfile' }), 'myProfile for ' + label);
  none(as(pid, { action: 'messages' }), 'the inbox of ' + label);
});
/* THE ADMIN'S OWN TOOLS — the people list and the weekly email's preview name every child there is. */
none(as('P-ADM', { action: 'listPeople' }), 'the admin\'s listPeople');
none(as('P-ADM', { action: 'diagnosePeople' }), 'the admin\'s diagnosePeople');
none(as('P-ADM', { action: 'digestPreview' }), 'the admin\'s digestPreview');

/* AND WHAT IS SENT IS HER FIRST NAME, NOT A BLANK — a rule that took every name out would pass the above. */
const tut = get('P-TUT');
const job = (tut.clientClasses || []).find(j => (j.slots || []).some(s => /^Wren/.test(S(s.client))));
rule(job, 'her seat is not on the tutor\'s roster at all, so the roster was not asked — ' + JSON.stringify((tut.clientClasses || []).map(j => j.slots)));
const kids = [].concat(...(tut.clientClasses || []).map(j => j.forChildren || []));
rule(kids.indexOf('Wren (@wren_kind43)') !== -1, 'the tutor\'s roster does not name the child the parent booked for as "Wren (@wren_kind43)" — ' + JSON.stringify(kids));
const inbox = as('P-ADM', { action: 'messages' }).messages || [];
const names = [...new Set(inbox.map(m => m.withName))].sort();
rule(JSON.stringify(names) === JSON.stringify(['Wren (@wren_bold44)', 'Wren (@wren_kind43)']),
  'two children called Wren are not two threads told apart by their handles in the admin\'s inbox — ' + JSON.stringify(names));
const ola = get('P-OTH');
const post = (ola.posts || []).find(p => p.id === 'PO-1') || {};
rule(post.author === 'Wren (@wren_kind43)', 'her post is not signed with her first name and handle for another parent — ' + JSON.stringify(post.author));
rule(post.caption === 'Wren (@wren_kind43) and the volcano', 'her whole name typed into a caption was not taken out — ' + JSON.stringify(post.caption));
const by = ((post.reactions || {}).by || []).map(x => x.name).sort();
rule(JSON.stringify(by) === JSON.stringify(['Wren (@wren_bold44)', 'Wren (@wren_kind43)']), '"who reacted" does not tell the two Wrens apart — ' + JSON.stringify(by));
const board = (ola.students || []).filter(s => /^Wren/.test(S(s.name))).map(s => s.name + ' ' + s.handle).sort();
rule(JSON.stringify(board) === JSON.stringify(['Wren wren_bold44', 'Wren wren_kind43']),
  'the score board does not carry the two Wrens by first name, each with the handle the card prints — ' + JSON.stringify(board));
const pip = get('P-PAR');
const card = (pip.family || []).find(x => x.personId === 'P-KID') || {};
rule(card.title === 'Wren' && card.handle === 'wren_kind43', 'her own parent\'s family card is not "Wren" with her handle under it — ' + JSON.stringify(card));
rule((tk['P-PAR'].children || []).indexOf('Wren (@wren_kind43)') !== -1 && (tk['P-PAR'].kids || []).indexOf('Wren (@wren_kind43)') !== -1,
  'the parent\'s sign-in reply does not name her child as "Wren (@wren_kind43)" for the booking form — '
  + JSON.stringify([tk['P-PAR'].children, tk['P-PAR'].kids]));
const ex = (pip.exams || []).map(x => x.who).concat((pip.birthdays || []).map(x => x.name));
rule(ex.length >= 2 && ex.every(n => /^Wren/.test(n)), 'the family calendar does not name her by first name — ' + JSON.stringify(ex));
const adm = get('P-ADM');
const every = (adm.everyone || []).find(x => x.personId === 'P-KID') || {};
rule(every.title === 'Wren', 'the admin\'s people column does not draw her as "Wren" (the card prints her handle) — ' + JSON.stringify(every));

/* THE ONES THE FIRST NET MISSED ARE CALLED BY THEIR FIRST NAMES — not left out. */
const boardOf = (pay, h) => ((pay.students || []).find(s => s.handle === h) || {}).name;
rule(boardOf(ola, 'juno_kind49') === 'Juno', 'the score board does not call the child who ticked Tutor "Juno" — ' + JSON.stringify(boardOf(ola, 'juno_kind49')));
rule(boardOf(ola, 'gus_kind51') === 'Gus', 'the score board calls a grown-up who is learning ' + JSON.stringify(boardOf(ola, 'gus_kind51'))
  + ' — it has always said the first name, for everybody on it');
const juno = ((ola.posts || []).find(p => p.id === 'PO-1') || {}).comments || [];
rule(JSON.stringify(juno).indexOf('Juno') !== -1, 'her comment is not under the post by her first name for another parent — ' + JSON.stringify(juno).slice(0, 200));
const tutorSeats = [].concat(...(tut.clientClasses || []).map(j => (j.slots || []).map(x => S(x.client))));
['Juno', 'Kit', 'Ivo'].forEach(n => rule(tutorSeats.indexOf(n) !== -1, 'the tutor\'s roster does not name ' + n + ' by first name — ' + JSON.stringify(tutorSeats)));
rule(kids.indexOf('Sol') !== -1 && kids.indexOf('Sol Fennimore') === -1,
  'a child who is only words in her parent\'s `children` cell does not reach the tutor as "Sol" — ' + JSON.stringify(kids));
rule(JSON.stringify(tk['P-TYP'].kids) === JSON.stringify(['Sol']), 'Sol\'s parent\'s sign-in reply does not offer her as "Sol" for the booking form — ' + JSON.stringify(tk['P-TYP'].kids));
const jH = b.tabs.jobs[0];
rule(b.tabs.jobs.slice(1).some(r => S(r[jH.indexOf('for_children')]) === 'Sol'), 'the booking for Sol kept the typed cell\'s whole words in `for_children`');

/* ==================================================================================================
   4. SHE IS — HER OWN SETTINGS, AND NOWHERE ELSE
   ================================================================================================== */
const me = tk['P-KID'];
rule(S((me.profile || {}).last_name) === SUR, 'her own sign-in reply does not carry her surname in `profile.last_name`, so her Settings cannot show or fix it — ' + JSON.stringify(me.profile && me.profile.last_name));
rule(me.name === 'Wren (@wren_kind43)', 'her own sign-in reply does not call her by the name every roster calls her — ' + JSON.stringify(me.name));
const mine = Object.assign({}, me); delete mine.profile;
none(mine, 'her own sign-in reply, outside `profile`');
const myP = as('P-KID', { action: 'myProfile' });
rule(S((myP.profile || {}).last_name) === SUR, 'her own myProfile does not carry her surname for Settings');
const myP2 = Object.assign({}, myP); delete myP2.profile;
none(myP2, 'her own myProfile, outside `profile`');
none(get('P-KID'), 'her own payload');

/* ==================================================================================================
   5. EVERY EMAIL — the ones written above, and the ones the family actions send
   ================================================================================================== */
/* ANOTHER PARENT TYPES HER WHOLE NAME TO CLAIM HER, AND SHE SAYS NO — the "declined" email names her. */
const claim = as('P-OTH', { action: 'claimChild', firstName: 'Wren', lastName: SUR });
rule(claim && claim.success, 'another parent could not ask to add her, so the claim emails were not asked — ' + JSON.stringify(claim));
const herClaim = (get('P-KID').claims || [])[0];
const m1 = MAIL.length;
const no = herClaim ? as('P-KID', { action: 'answerClaim', rowIndex: herClaim.rowIndex, accept: false }) : null;
rule(no && no.success && MAIL.slice(m1).some(m => m.to === 'ola@example.org'),
  'her "no" did not reach the parent who asked, so that email\'s wording was not asked — ' + JSON.stringify(no));
/* HER OWN NEW PIN — the "Your PIN was changed" email is to her. BEFORE the parent's New PIN below, which
   signs her out everywhere. */
const ch = as('P-KID', { action: 'changePin', currentPin: '0000', newPin: ['8', '2', '6', '4'].join('') });
rule(ch && ch.success, 'she could not change her own PIN, so that email was not asked — ' + JSON.stringify(ch));
const pin = as('P-PAR', { action: 'resetPin', targetId: 'P-KID' });
rule(pin && pin.success, 'her parent could not give her a new PIN, so that email and reply were not asked — ' + JSON.stringify(pin));
none(pin, 'the New PIN reply to her parent');
const made = as('P-PAR', { action: 'makeChild', firstName: 'Moss', lastName: SUR, pin: ['5', '1', '7', '3'].join('') });
rule(made && made.success, 'her parent could not make her brother\'s account, so that email and reply were not asked — ' + JSON.stringify(made));
none(made, 'the make-child reply');
rule(made && made.name === 'Moss', 'the make-child reply does not name the new child "Moss" — ' + JSON.stringify(made && made.name));
/* AND THE WEEKLY EMAIL'S DOOR, `digestMail_`, with her whole name in the HTML it is handed. */
const m3 = MAIL.length;
b.ev('digestMail_([{ to: "pip@example.org", subject: "This week", text: "Wren Quorrington did 3", html: "<p>Wren Quorrington did 3</p>",'
  + ' count: 3, learner_id: "P-KID", parent_id: "P-PAR" }], { mode: "on", reserve: 0, readLog: digestLog_, brand: "@family.",'
  + ' find: function () { return null; }, put: function (log, row, m, v) { return addRow(log, Object.assign({ week_start: "x",'
  + ' learner_id: m.learner_id, parent_id: m.parent_id }, v)); }, heldNote: "" })');
const dig = MAIL.slice(m3)[0];
rule(dig && /Wren/.test(S(dig.htmlBody)), 'the weekly email\'s door sent nothing with her first name in its HTML, so it was not asked — ' + JSON.stringify(dig));
rule(MAIL.some(m => /^New request/.test(S(m.subject)) && /Juno/.test(S(m.subject))),
  'no "New request" email named the child who ticked Tutor, so its subject was not asked — ' + JSON.stringify(MAIL.map(m => m.subject)));
rule(MAIL.length >= 5, 'only ' + MAIL.length + ' emails were caught, so the mail was hardly asked');
MAIL.forEach((m, i) => none({ subject: m.subject, body: m.body, htmlBody: m.htmlBody },
  'email ' + (i + 1) + ' to ' + m.to + ' ("' + S(m.subject).slice(0, 50) + '")'));

/* ==================================================================================================
   5b. THE NET'S OWN EDGES, asked of the real function in the real scope
   ================================================================================================== */
const off = v => JSON.parse(b.ev('JSON.stringify(kidNamesOff_(' + JSON.stringify(v) + '))'));
const e1 = off({ spaced: 'wren   QUORRINGTON wrote', longer: 'Wren Quorringtonshire Road', alone: 'Thistlebrook',
                 inside: 'be thistlebrook to them', apos: 'Rue O&#39;Dell and Rue O\u2019Dell', key: { ['Wren ' + SUR]: 1 } });
rule(e1.spaced === 'Wren (@wren_kind43) wrote', 'a whole name typed with other spacing and case was not taken out — ' + JSON.stringify(e1.spaced));
rule(e1.longer === 'Wren Quorringtonshire Road', 'the net ate the front of a longer word — ' + JSON.stringify(e1.longer));
rule(e1.alone === '@thistle_kind47', 'a child with no first name, whose whole value is her surname, was not replaced by her handle — ' + JSON.stringify(e1.alone));
rule(e1.inside === 'be thistlebrook to them', 'a no-first-name child\'s surname was taken out of the middle of a sentence, where it is only a word — ' + JSON.stringify(e1.inside));
rule(e1.apos === 'Rue and Rue', 'a surname with an apostrophe, as HTML and as a curly quote, was not taken out — ' + JSON.stringify(e1.apos));
rule(e1.key && Object.keys(e1.key)[0] === 'Wren (@wren_kind43)', 'a name used as an object\'s KEY was not taken out — ' + JSON.stringify(e1.key));
/* A BOX THAT HOLDS ONE PART OF A NAME is not a no-first-name child's whole name, whatever it says. */
const e2 = off({ last_name: 'Thistlebrook', actor: 'Thistlebrook', profile: { first_name: 'Ann', last_name: 'Thistlebrook' } });
rule(e2.last_name === 'Thistlebrook' && e2.profile.last_name === 'Thistlebrook' && e2.actor === '@thistle_kind47',
  'the whole-value rule reached a `last_name` box, or stopped reaching an `actor` — ' + JSON.stringify(e2));
/* AND ON THE WAY BACK IN, asked of the real function: an edit keeps every name it did not touch. */
const back = (stored, sent, f) => {
  try { return b.ev('kidNamesBack_(' + JSON.stringify(stored) + ',' + JSON.stringify(sent) + ',' + JSON.stringify(f || 'body') + ')'); }
  catch (e) { return 'threw: ' + e.message; }
};
const W = 'Wren ' + SUR, WS = 'Wren (@wren_kind43)';
[[W + ' and the volcano', WS + ' and the volcano', W + ' and the volcano', 'sent back as drawn'],
 [W + ' and ' + W, WS + ' and ' + WS + ' again', W + ' and ' + W + ' again', 'a word added after two names'],
 ['Hi ' + W + ', bye', 'Hi Wendy, bye', 'Hi Wendy, bye', 'the name itself rewritten'],
 /* AN EDIT INSIDE THE NAME AS SHOWN takes the whole name into the edit — mapped back alone, its edges
    land inside the surname and the cell reads "Hi Wren Quorrington,4bye". */
 ['Hi ' + W + ', bye', 'Hi Wren (@wren_kind44), bye', 'Hi Wren (@wren_kind44), bye', 'one character changed inside the name as shown'],
 /* A LETTER TYPED AGAINST THE NAME is part of the name's edit, not a letter on the end of the surname. */
 [W + ' and', WS + 's and', WS + 's and', 'a letter typed against the name'],
 [W + ' and the volcano', 'and the volcano', 'and the volcano', 'the name deleted'],
 [W + ' and the volcano', '', '', 'the cell cleared'],
 ['Ivo Brackenridge', 'Ivo Brack, Ivo Brackenridge', 'Ivo Brack, Ivo Brackenridge', 'a value with a whole name in it, worked out by the server'],
 ['no child here', 'no child here at all', 'no child here at all', 'a cell with no child in it']].forEach(([st, se, want, what]) => {
  const got = back(st, se);
  rule(got === want, 'on the way back in (' + what + '): ' + JSON.stringify(se) + ' over ' + JSON.stringify(st) + ' wrote ' + JSON.stringify(got) + ', not ' + JSON.stringify(want));
});

/* ==================================================================================================
   6. NOTHING IS LOST — the sheet keeps every surname
   ================================================================================================== */
rule(S(b.row('P-KID').last_name) === SUR && S(b.row('P-KD2').last_name) === 'Ollerby', 'a surname in the sheet was changed');
const fH = b.tabs.family[0];
rule(b.tabs.family.slice(1).some(r => S(r[fH.indexOf('child_typed')]) === 'Wren ' + SUR), 'the family tab\'s typed name was rewritten');
const poH = b.tabs.posts[0];
rule(S(b.tabs.posts[1][poH.indexOf('author')]) === 'Wren ' + SUR, 'the post\'s author cell was rewritten');

/* ==================================================================================================
   6b. WHAT COMES BACK IS NOT WRITTEN BACK SHORT
   ================================================================================================== */
/* THE ADMIN PINS HER POST. The editor is filled from the payload — the caption as the net left it — and
   Save sends caption and body with the pin. The cell must still hold her whole name. */
const admPost = (adm.posts || []).find(p => p.id === 'PO-1') || {};
rule(S(admPost.caption) === 'Wren (@wren_kind43) and the volcano', 'the admin\'s post editor is not filled with the caption as the net says it — ' + JSON.stringify(admPost.caption));
const pinned = as('P-ADM', { action: 'editPost', id: 'PO-1', fields: { caption: admPost.caption, body: S(admPost.body), pinned: true } });
rule(pinned && pinned.success, 'the admin could not pin her post — ' + JSON.stringify(pinned));
rule(S(b.tabs.posts[1][poH.indexOf('caption')]) === 'Wren ' + SUR + ' and the volcano',
  'pinning her post wrote the shortened caption over the sheet\'s — ' + JSON.stringify(b.tabs.posts[1][poH.indexOf('caption')]));
rule(S(b.tabs.posts[1][poH.indexOf('pinned')]).toUpperCase() === 'TRUE', 'the pin itself did not go in');
/* AND AN EDIT KEEPS THE NAMES IT DID NOT TOUCH. */
const edited = as('P-ADM', { action: 'editPost', id: 'PO-1', fields: { caption: admPost.caption + '!' } });
rule(edited && edited.success && S(b.tabs.posts[1][poH.indexOf('caption')]) === 'Wren ' + SUR + ' and the volcano!',
  'an edit at the end of the caption took her surname out of the start — ' + JSON.stringify(b.tabs.posts[1][poH.indexOf('caption')]));
/* HER PARENT'S NOTEPAD — her sign-in reply carries it as the net says it, and one line is added. */
const pad = S(tk['P-PAR'].notepad);
rule(pad === 'Wren (@wren_kind43): dentist on Tuesday', 'her parent\'s notepad does not come back with her first name — ' + JSON.stringify(pad));
const padS = as('P-PAR', { action: 'saveNotepad', notepad: pad + '\nand milk' });
rule(padS && padS.success && S(b.row('P-PAR').notepad) === 'Wren ' + SUR + ': dentist on Tuesday\nand milk',
  'adding a line to the notepad wrote the shortened lines over the sheet\'s — ' + JSON.stringify(b.row('P-PAR').notepad));
/* HER TUTOR'S SETTINGS: the headline comes back as the net says it, and a Save of the page as drawn changes
   nothing — `setCells`, the row's write, keeps the cell as `setCell` does. */
const tamH = S((tk['P-TUT'].profile || {}).headline);
rule(tamH === 'Tutor to Wren (@wren_kind43) since 2024', 'her tutor\'s own headline does not come back with her first name — ' + JSON.stringify(tamH));
const tamS = as('P-TUT', { action: 'updateProfile', targetId: 'P-TUT', fields: { headline: tamH } });
rule(tamS && tamS.success && tamS.changed === 0 && S(b.row('P-TUT').headline) === 'Tutor to Wren ' + SUR + ' since 2024',
  'a Save of her tutor\'s headline as drawn wrote the shortened text over the sheet\'s — ' + JSON.stringify(tamS && tamS.changed) + ' ' + JSON.stringify(b.row('P-TUT').headline));
/* A GROWN-UP WHO SHARES A NO-FIRST-NAME CHILD'S SURNAME has their own Last name box back as it is, and an
   untouched Save changes nothing. */
const ann = tk['P-ANN'].profile || {};
rule(S(ann.last_name) === 'Thistlebrook', 'a grown-up who shares a no-first-name child\'s surname is sent ' + JSON.stringify(ann.last_name) + ' as their own Last name');
const annS = as('P-ANN', { action: 'updateProfile', targetId: 'P-ANN', fields: { first_name: ann.first_name, last_name: ann.last_name } });
rule(annS && annS.success && annS.changed === 0 && S(b.row('P-ANN').last_name) === 'Thistlebrook',
  'an untouched Save of that grown-up\'s About you changed their row — ' + JSON.stringify(annS && annS.changed) + ' ' + JSON.stringify(b.row('P-ANN').last_name));
/* AND THE NO-FIRST-NAME CHILD HERSELF: her own Settings box is her surname, and saving a first name keeps it. */
const thi = tk['P-SUR'].profile || {};
rule(S(thi.last_name) === 'Thistlebrook', 'a child with no first name is sent ' + JSON.stringify(thi.last_name) + ' as her own Last name — her Settings is where it goes');
const thiS = as('P-SUR', { action: 'updateProfile', targetId: 'P-SUR', fields: { first_name: 'Juniper', last_name: thi.last_name } });
rule(thiS && thiS.success && S(b.row('P-SUR').last_name) === 'Thistlebrook' && S(b.row('P-SUR').first_name) === 'Juniper',
  'saving a first name from her own Settings changed her surname in the sheet — ' + JSON.stringify(b.row('P-SUR').last_name));

/* AND A TUTOR ANSWERING HER SEAT NAMES HER AS THEY WERE SHOWN HER — with Ned on the same session, so
   the name is what picks her out (one client alone is the target without anybody naming them). */
if (own && own.success) {
  const jobId = own.jobId || own.id;
  const ned = as('P-STU', { action: 'move', jobId: jobId, role: 'client', move: 'Request', requestId: 'ned-1' });
  rule(ned && ned.success, 'Ned could not ask to join her session, so naming her among two was not asked — ' + JSON.stringify(ned));
  const say = as('P-TUT', { action: 'move', jobId: jobId, role: 'tutor', move: 'Decline', counterpart: 'Wren (@wren_kind43)', requestId: 'dec-1' });
  const after = b.tabs.events.slice(1).filter(r => S(r[evH.indexOf('job_id')]) === S(jobId) && S(r[evH.indexOf('action')]) === 'Decline');
  rule(say && say.success && after.some(r => S(r[evH.indexOf('target')]) === 'Wren ' + SUR),
    'a tutor declining "Wren (@wren_kind43)" — the name they were shown — did not reach her seat — ' + JSON.stringify(say) + ' ' + JSON.stringify(after));
}

console.log('');
console.log('  ' + asked + ' things asked of the real backend; ' + MAIL.length + ' emails caught; ' + FILES.length + ' backend files read');
if (bad.length) {
  console.log('');
  console.log('A CHILD\'S SURNAME LEFT THE SERVER, OR HER FIRST NAME DID NOT  (' + bad.length + ')');
  bad.forEach(x => console.log('  ✗ ' + x));
  console.log('');
  console.log('FAILED — ' + bad.length + ' of ' + asked + '. The owner: "dont show children\'s last name".');
  process.exit(1);
}
console.log('');
console.log('OK — no payload, reply or email carries a child\'s surname, for a stranger, another student, another parent, her own parent, '
  + 'her tutor or an admin; she is her first name everywhere, with her handle where another child shares it; her own Settings still has it; '
  + 'and the sheet still has every one.');
