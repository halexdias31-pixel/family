#!/usr/bin/env node
/* ==================================================================================================
   node js/check-prefs.js — WHAT EVERYBODY HAS CHOSEN TO BE EMAILED, HONOURED BY EVERY SENDER

   ASKED FOR AS *"Also let parents select their communication preferences like notification. And kids
   and tutors too I guess"* (the owner, 9 Oct). The site sends email and nothing else, so a preference is
   a yes or no per KIND of email — `NOTIFY_KINDS` in backend/constants.gs — kept on the person's row
   (`weekly_email` and five more beside it, blank is on), written by `setNotify` and read by `wants_`.

   A SWITCH IS ONLY AS GOOD AS THE SENDER THAT FORGETS TO ASK IT. There were 22 `notify(` calls and 8
   direct `MailApp.sendEmail`s on the day this was written, and the next one added is the one that will
   not ask. So this check asks three things, and each is a different way of being wrong:

     1. THE TABLE. Every kind has a label and a note for the card and roles it reaches; an optional kind
        has a column on the people tab (`SCHEMA.people`), an essential one says why it cannot be turned
        off. The weekly email's old opt-out IS one of them — folded in, not a second mechanism.
     2. THE SOURCE. Every `notify(` in backend/ names a kind that is in the table — a literal, or a
        conditional of two literals, so it can be read here — and every `MailApp.sendEmail` sits in a
        place this file names, either essential with a reason, or asking `wants_` for its kind. A new
        sender fails here before it can mail somebody who said no. Every optional kind has a sender, or
        its switch would be a tick that does nothing. Nothing reads one of the columns but `wants_`.
     3. THE BEHAVIOUR, THROUGH THE REAL `doPost` — check-gas-load.js, MailApp stubbed: for every
        optional kind a real sender, switched off sends that person nothing and writes a line in the log
        (`notifyHeld_`), switched on sends; the essentials still go when every column on every row says
        `no`; the TOKEN decides whose row `setNotify` writes, by `resetPin`'s rule for a child; a stranger
        reads and writes nobody's; and a row from before the columns, or a sheet without them, is on.

   The people are invented, their addresses are on example.org and every PIN is 0000.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('acorn');
const { backend } = require('./check-gas-load.js');
const { world, cfgSet, rowsOf, at } = require('./check-mail-load.js');

const REPO = path.resolve(__dirname, '..');
const bad = [];
let asked = 0;
const rule = (ok, said) => { asked++; if (!ok) bad.push(said); return !!ok; };

/* ---------- 1. THE TABLE ---------------------------------------------------------------------------------- */
const ROLES = ['client', 'student', 'tutor', 'admin'];
const b0 = backend();
const KINDS = JSON.parse(JSON.stringify(b0.ev('NOTIFY_KINDS')));
const PEOPLE_COLS = b0.ev('SCHEMA').people.slice();
const OPTIONAL = Object.keys(KINDS).filter(k => !KINDS[k].essential);
const ESSENTIAL = Object.keys(KINDS).filter(k => KINDS[k].essential);
rule(OPTIONAL.length >= 1 && ESSENTIAL.length >= 1, 'NOTIFY_KINDS has ' + OPTIONAL.length + ' optional and ' + ESSENTIAL.length + ' essential kinds — wanted some of each');
Object.keys(KINDS).forEach(k => {
  const K = KINDS[k];
  rule(typeof K.label === 'string' && K.label.trim() && typeof K.note === 'string' && K.note.trim(),
    'NOTIFY_KINDS.' + k + ' has no label or no note, and the card draws both');
  rule(Array.isArray(K.roles) && K.roles.length && K.roles.every(r => ROLES.indexOf(r) !== -1),
    'NOTIFY_KINDS.' + k + ' reaches ' + JSON.stringify(K.roles) + ' — wanted some of ' + ROLES.join(', '));
  if (K.essential) {
    rule(!K.col, 'NOTIFY_KINDS.' + k + ' is essential and has a column (' + K.col + ') — a column is a switch');
    rule(typeof K.why === 'string' && K.why.trim(), 'NOTIFY_KINDS.' + k + ' is essential and does not say why');
  } else {
    rule(PEOPLE_COLS.indexOf(K.col) !== -1, 'NOTIFY_KINDS.' + k + "'s column `" + K.col + '` is not in SCHEMA.people, so ensureSchema never adds it');
    rule(OPTIONAL.filter(o => KINDS[o].col === K.col).length === 1, 'NOTIFY_KINDS.' + k + ' shares its column ' + K.col + ' with another kind');
  }
});
rule(KINDS.weekly && KINDS.weekly.col === 'weekly_email',
  'the weekly email\'s choice is not `weekly_email` — the parents who already typed `no` there would be emailed again');

/* ---------- 2. THE SOURCE ----------------------------------------------------------------------------------
   Parsed, not grepped: the house style is that a comment is a bug report, so `notify(` and `MailApp` are all
   over the prose. A tiny walker with the ancestor chain, because which function a send sits in is the
   question. */
const FILES = fs.readdirSync(path.join(REPO, 'backend')).filter(f => /\.gs$/.test(f));
if (!FILES.length) { console.log('No backend/*.gs could be read, so NOTHING was checked — not a pass.'); process.exit(1); }
const walk = (node, up, fn) => {
  if (!node || typeof node.type !== 'string') return;
  fn(node, up);
  const next = up.concat([node]);
  Object.keys(node).forEach(k => {
    const v = node[k];
    if (Array.isArray(v)) v.forEach(x => walk(x, next, fn));
    else if (v && typeof v.type === 'string') walk(v, next, fn);
  });
};
/* WHERE A CALL IS: the nearest named function, and inside `doPost` the action whose `if` it is in. */
const placeOf = up => {
  let fnName = '';
  for (let i = up.length - 1; i >= 0; i--) {
    const n = up[i];
    if (n.type === 'FunctionDeclaration' && n.id) { fnName = n.id.name; break; }
  }
  if (fnName !== 'doPost') return fnName;
  for (let i = up.length - 1; i >= 0; i--) {
    const t = up[i].type === 'IfStatement' && up[i].test;
    if (t && t.type === 'BinaryExpression' && t.left.type === 'Identifier' && t.left.name === 'action'
        && t.right.type === 'Literal') return 'doPost:' + t.right.value;
  }
  return 'doPost';
};
const isKind = n => n && n.type === 'Literal' && typeof n.value === 'string' && Object.prototype.hasOwnProperty.call(KINDS, n.value);
const kindsOf = n => (isKind(n) ? [n.value]
  : n && n.type === 'ConditionalExpression' && isKind(n.consequent) && isKind(n.alternate) ? [n.consequent.value, n.alternate.value]
  : null);

/* THE DIRECT SENDERS, BY WHERE THEY ARE. `essential` names the kind and the reason is the table's `why`;
   `asks` is an optional kind whose sender must call `wants_(…, '<kind>')` in the function named `in`. A
   send somewhere not listed fails, and so does a listed place that no longer sends — a stale row here
   would be a sender this check believes is covered. */
const DIRECT = {
  notify:              { asks: 'any', in: 'notify', why: 'the shared sender: asks `wants_` with the kind its caller names' },
  linkMail_:           { essential: 'access', why: 'the confirmation link proves the address; it is how the account is reached at all' },
  moveMail_:           { essential: 'access', why: 'the link that proves a NEW address before it replaces the old one' },
  authWrong_:          { essential: 'security', why: 'too many wrong PINs, to a no-email child\'s grown-ups' },
  'doPost:register':   { essential: 'access', why: 'a no-email child\'s grown-up confirming the account' },
  'doPost:forgotPin':  { essential: 'access', why: 'a new PIN, or a child\'s, to the proved grown-ups' },
  'doPost:makeChild':  { essential: 'access', why: 'the only written copy of the child\'s sign-in handle' },
  sendInvite:          { asks: 'bookings', in: 'sendInvite', why: 'an invitation typed for an address that is already a member' },
  digestMail_:         { asks: 'weekly', in: 'digestPlan_', why: 'the Sunday email: `digestPlan_` drops a parent who said no before anything is rendered' },
};
const srcOf = {};
const fnSrc = {};
const usedKinds = new Set();
const directSeen = {};
let notifyCalls = 0;
FILES.forEach(f => {
  const src = fs.readFileSync(path.join(REPO, 'backend', f), 'utf8');
  srcOf[f] = src;
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true }); }
  catch (e) { bad.push('backend/' + f + ' does not parse: ' + e.message); return; }
  walk(ast, [], (n, up) => {
    if (n.type === 'FunctionDeclaration' && n.id) fnSrc[n.id.name] = src.slice(n.start, n.end);
    if (n.type !== 'CallExpression') return;
    const c = n.callee;
    const line = src.slice(0, n.start).split('\n').length;
    if (c.type === 'Identifier' && c.name === 'notify') {
      notifyCalls++;
      const ks = kindsOf(n.arguments[3]);
      if (rule(ks, 'backend/' + f + ':' + line + ' calls notify() without a kind from NOTIFY_KINDS as its fourth argument — '
        + 'it would send whatever the person chose (a literal, or `cond ? \'a\' : \'b\'` of two)')) ks.forEach(k => usedKinds.add(k));
    }
    if (c.type === 'MemberExpression' && c.object.type === 'Identifier' && (c.object.name === 'MailApp' || c.object.name === 'GmailApp')
        && c.property && (c.property.name === 'sendEmail' || c.property.name === 'send')) {
      const at_ = placeOf(up);
      directSeen[at_] = (directSeen[at_] || 0) + 1;
      rule(c.object.name === 'MailApp', 'backend/' + f + ':' + line + ' sends through GmailApp — the senders here are MailApp, and this one asks nobody');
      rule(DIRECT[at_], 'backend/' + f + ':' + line + ' sends an email from `' + at_ + '`, which this check does not know — '
        + 'name its kind in DIRECT here: essential with a reason, or asking `wants_` for its kind');
    }
  });
});
rule(notifyCalls >= 20, 'only ' + notifyCalls + ' notify() calls were found in backend/ — the parse is not reading what it should');
Object.keys(DIRECT).forEach(p => {
  const D = DIRECT[p];
  rule(directSeen[p], 'DIRECT names `' + p + '` and nothing there sends any more — take it out, or this check believes a sender is covered that is not');
  if (D.essential) { rule(KINDS[D.essential] && KINDS[D.essential].essential, '`' + p + '` is listed as essential `' + D.essential + '`, which is not an essential kind'); usedKinds.add(D.essential); }
  if (D.asks && D.asks !== 'any') {
    const body = fnSrc[D.in] || '';
    rule(new RegExp("\\bwants_\\(\\s*\\w+\\s*,\\s*'" + D.asks + "'\\s*\\)").test(body),
      '`' + D.in + '` does not ask wants_(…, \'' + D.asks + '\') — `' + p + '` would email somebody who switched ' + D.asks + ' off');
    usedKinds.add(D.asks);
  }
});
rule(/\bwants_\(\s*p\s*,\s*kind\s*\)/.test(fnSrc.notify || ''), '`notify` no longer asks wants_(p, kind) — no notify() call honours anything');
Object.keys(KINDS).forEach(k => rule(usedKinds.has(k), 'nothing sends a `' + k + '` email — its line on the card describes mail that never comes'));
/* ONE READER: no sender reads a choice column itself. `ON_(p.weekly_email)` in digest.gs was the second
   reader, and is the reason this line exists. */
const COLS = OPTIONAL.map(k => KINDS[k].col);
FILES.forEach(f => {
  const code = srcOf[f].replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1').replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, "''");
  COLS.forEach(c => {
    const hits = code.match(new RegExp('\\.' + c + '\\b|\\[\\s*\'' + c + '\'\\s*\\]', 'g')) || [];
    rule(!hits.length, 'backend/' + f + ' reads `' + c + '` off a row ' + hits.length + ' time(s) itself — every choice is read through wants_');
  });
});

/* ---------- 3. THE BEHAVIOUR, THROUGH THE REAL doPost -------------------------------------------------------- */
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London' };
const P = (id, first, last, role, email, extra) => Object.assign({ person_id: id, first_name: first, last_name: last,
  handle: (first + last).toLowerCase(), email: email, role: role }, base, extra || {});
const PEOPLE = [
  P('P-A1', 'Hal', 'Admin', 'admin', 'admin@example.org'),
  P('P-A2', 'Ivy', 'Admin', 'admin', 'ivy@example.org'),
  P('P-T1', 'Ada', 'Tutor', 'tutor', 'tutor@example.org', { availability: 'm09,m10,tu15,sa11', rate_per_hour: 20,
    max_students: 4, min_students: 1, age_min: 8, age_max: 16, dbs_checked: true }),
  P('P-C1', 'Pat', 'Parent', 'client', 'parent@example.org', { referral_code: 'PATPARENT10' }),
  P('P-C2', 'Sid', 'Stranger', 'client', 'stranger@example.org'),
  P('P-C3', 'Peg', 'Pending', 'client', 'pending@example.org', { verified: 'PENDING' }),
  P('P-S1', 'Sam', 'Student', 'student', 'student@example.org'),
  P('P-S2', 'Nell', 'Nomail', 'student', ''),
  P('P-S3', 'Kit', 'Asked', 'student', 'asked@example.org'),
  P('P-S4', 'Pip', 'Waiting', 'student', 'pip@example.org'),
  P('P-O1', 'Old', 'Row', 'client', 'old@example.org'),
];
const LINKS = [
  { link_id: 'L1', parent_id: 'P-C1', child_id: 'P-S1', state: 'accepted' },
  { link_id: 'L2', parent_id: 'P-C1', child_id: 'P-S2', state: 'accepted' },
  { link_id: 'L3', parent_id: 'P-C1', child_id: 'P-S3', state: 'asked' },
  { link_id: 'L4', parent_id: 'P-C3', child_id: 'P-S4', state: 'accepted' },
];
/* A PIN `register` AND `changePin` WILL TAKE — 0000 is refused as too easy to guess (`pinWeak_`) — built in
   pieces, as check-signin builds its own, so `check-secrets.js` does not read a PIN literal in a public
   repository. Invented, and nobody's. */
const FRESH = ['4', '8', '2', '6'].join('');
const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const dmy = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();

function make(opts) {
  opts = opts || {};
  const sent = [], logs = [];
  const MailApp = { sendEmail(m) { sent.push(m); }, getRemainingDailyQuota: () => 100 };
  const con = Object.assign(Object.create(console), { log: (...a) => logs.push(a.map(String).join(' ')) });
  const DriveApp = { getFolderById: () => ({ getId: () => 'FOLDER', createFile: () => ({ getId: () => 'F', setSharing() {} }) }),
                     getFileById: () => null, Access: {}, Permission: {} };
  const b = backend({ MailApp, console: con, DriveApp });
  /* A LIVE SHEET FROM BEFORE THE COLUMNS: the people tab's header without the five that came with this. */
  if (opts.oldSheet) b.tabs.people[0] = b.tabs.people[0].filter(c => COLS.indexOf(c) === -1 || c === 'weekly_email');
  b.seed('people', opts.people || PEOPLE);
  b.seed('family', LINKS);
  b.seed('config', [{ key: 'max_open_requests', value: 20 }, { key: 'posts_folder', value: 'FOLDERIDFOLDERID' }]);
  const tk = {};
  (opts.people || PEOPLE).forEach(p => {
    const d = b.post({ action: 'verifyLogin', email: p.email || p.handle, name: p.email || p.handle, pin: '0000' });
    if (d && d.success) tk[p.person_id] = d;
  });
  const as = (pid, body) => b.post(Object.assign({ token: (tk[pid] || {}).token, name: (tk[pid] || {}).name, personId: pid }, body));
  const cell = (pid, c) => { const v = b.row(pid)[c]; return v === undefined ? undefined : String(v); };
  const mark = () => sent.length;
  const to = (addr, since, re) => sent.slice(since || 0).filter(m => String(m.to).split(',').indexOf(addr) !== -1
    && (!re || re.test(String(m.subject))));
  const typed = (pid, col, v) => { b.ev("(function(){ const t = read(TAB.people); setCell(t, t.rows.find(r => r.person_id === "
    + JSON.stringify(pid) + "), " + JSON.stringify(col) + ", " + JSON.stringify(v) + "); clearCache(); })()"); };
  return { b, sent, logs, tk, as, cell, mark, to, typed };
}

const W = make();
rule(Object.keys(W.tk).length === PEOPLE.length, 'only ' + Object.keys(W.tk).length + ' of ' + PEOPLE.length
  + ' invented people could sign in, so most of this would check nobody — ' + PEOPLE.filter(p => !W.tk[p.person_id]).map(p => p.person_id).join(', '));
if (!W.tk['P-C1'] || !W.tk['P-T1'] || !W.tk['P-S1'] || !W.tk['P-A1']) {
  console.log(bad.join('\n'));
  console.log('The parent, the tutor, the student or the admin could not sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}

/* 3a. WHAT THE CARD IS TOLD, PER ROLE — the sign-in reply's profile, which is `profileOf_`. The owner's ask,
   written out: a parent's, a kid's, a tutor's and an admin's, and nothing of anybody else's. */
const WANT = {
  'P-C1': { opt: ['weekly', 'messages', 'bookings', 'posts', 'referrals'], must: ['access', 'security', 'family', 'booked'] },
  'P-S1': { opt: ['messages', 'posts', 'referrals'], must: ['access', 'security', 'family'] },
  'P-T1': { opt: ['messages', 'bookings', 'posts', 'referrals'], must: ['access', 'security', 'booked'] },
  'P-A1': { opt: ['messages', 'bookings', 'referrals', 'approvals'], must: ['access', 'security', 'reported'] },
};
Object.keys(WANT).forEach(pid => {
  const n = (W.tk[pid].profile || {}).notify;
  if (!rule(n && Array.isArray(n.kinds), pid + ': the sign-in reply\'s profile carries no notify list — ' + JSON.stringify(n))) return;
  const opt = n.kinds.filter(k => !k.essential).map(k => k.kind), must = n.kinds.filter(k => k.essential).map(k => k.kind);
  rule(JSON.stringify(opt) === JSON.stringify(WANT[pid].opt), pid + ' is offered switches for ' + JSON.stringify(opt) + ', wanted ' + JSON.stringify(WANT[pid].opt));
  rule(JSON.stringify(must) === JSON.stringify(WANT[pid].must), pid + ' is told ' + JSON.stringify(must) + ' are always sent, wanted ' + JSON.stringify(WANT[pid].must));
  rule(n.kinds.every(k => k.essential ? !('on' in k) : k.on === true), pid + ': an untouched row is not on for every switch — ' + JSON.stringify(n.kinds));
  rule(n.to === PEOPLE.find(p => p.person_id === pid).email && n.held === false, pid + ': notify.to/held is ' + JSON.stringify([n.to, n.held]));
});
{
  const wk = (W.tk['P-C1'].profile.notify.kinds.find(k => k.kind === 'weekly') || {});
  rule(/not being sent/i.test(String(wk.idle || '')), 'the weekly email is off on the config tab and the parent\'s card is not told — ' + JSON.stringify(wk));
  const nm = (W.tk['P-S2'] || {}).profile;
  rule(nm && nm.notify && nm.notify.to === '', 'a child with no email of their own is not told notify.to is blank — ' + JSON.stringify(nm && nm.notify));
  const pg = (W.tk['P-C3'] || {}).profile;
  rule(pg && pg.notify && pg.notify.held === true, 'a parent whose address nobody has proved is not told it is held — ' + JSON.stringify(pg && pg.notify));
}

/* 3b. WHOSE ROW `setNotify` WRITES — THE TOKEN'S, OR A CHILD'S BY resetPin'S RULE. */
{
  const { as, cell, b } = W;
  const set = (pid, kind, on, extra) => as(pid, Object.assign({ action: 'setNotify', kind: kind, on: on }, extra || {}));
  const no = (d, w, said) => rule(d && !d.success && d.error && !d.writes && !d.notify, said + ' — ' + JSON.stringify(d) + (d && d.writes ? ' (' + d.writes + ' cell(s) written)' : ''));

  let d = set('P-C1', 'messages', false);
  rule(d.success && d.on === false && cell('P-C1', 'messages_email') === 'no', 'a parent turning Messages off did not write `no` on their row — ' + JSON.stringify(d) + ' / ' + cell('P-C1', 'messages_email'));
  rule(d.notify && d.notify.kinds.find(k => k.kind === 'messages').on === false, 'the reply\'s list does not show Messages off — ' + JSON.stringify(d.notify));
  d = set('P-C1', 'messages', false);
  rule(d.success && d.changed === 0 && !d.writes, 'turning off what is already off wrote ' + d.writes + ' cell(s)');
  /* A REQUEST THAT LIES ABOUT WHO IT IS: the gate overwrites the id, so it is still Pat's row. */
  d = W.b.post({ action: 'setNotify', token: W.tk['P-C1'].token, name: 'Ada Tutor', personId: 'P-T1', kind: 'posts', on: false });
  rule(d.success && cell('P-C1', 'posts_email') === 'no' && cell('P-T1', 'posts_email') === '',
    'a request naming the tutor wrote ' + JSON.stringify({ parent: cell('P-C1', 'posts_email'), tutor: cell('P-T1', 'posts_email') }) + ' — the token decides whose row');
  no(W.b.post({ action: 'setNotify', personId: 'P-C1', name: 'Pat Parent', kind: 'bookings', on: false }), 0, 'setNotify with no token was not refused');
  no(W.b.post({ action: 'setNotify', token: 'not-a-token', personId: 'P-C1', kind: 'bookings', on: false }), 0, 'setNotify with a made-up token was not refused');
  /* AN ESSENTIAL KIND IS REFUSED AS ESSENTIAL — with its reason, not by luck of having no column. */
  ['security', 'booked'].forEach(k => {
    const e = set('P-C1', k, false);
    no(e, 0, 'an essential kind (' + k + ') was switched off');
    rule(/always sent/.test(String(e.error)), 'switching off ' + k + ' was refused, but not as an email that is always sent — "' + e.error + '"');
  });
  no(set('P-C1', 'everything', false), 0, 'a kind that is not in NOTIFY_KINDS was accepted');
  no(set('P-C1', 'constructor', false), 0, 'a kind named after an Object property was accepted');
  no(set('P-S1', 'weekly', false), 0, 'a student turned off the weekly email about themselves — a cell that means nothing');
  no(set('P-T1', 'approvals', false), 0, 'a tutor turned off an admin\'s email');
  /* A CHILD'S, BY THE FAMILY RULE. */
  d = set('P-C1', 'messages', false, { targetId: 'P-S1' });
  rule(d.success && cell('P-S1', 'messages_email') === 'no' && cell('P-C1', 'messages_email') === 'no' && d.personId === 'P-S1',
    'a parent could not choose for the child who accepted them — ' + JSON.stringify(d));
  no(set('P-C1', 'messages', false, { targetId: 'P-S3' }), 0, 'a parent chose for a child who has only been ASKED, not accepted');
  no(set('P-C2', 'messages', true, { targetId: 'P-S1' }), 0, 'a stranger chose for somebody else\'s child');
  no(set('P-T1', 'messages', true, { targetId: 'P-S1' }), 0, 'a tutor chose for a child');
  d = set('P-C3', 'messages', false, { targetId: 'P-S4' });
  no(d, 0, 'a parent whose own address nobody has proved chose for a child');
  rule(d.why === 'unconfirmed', 'the unproved parent was not told why (`why: unconfirmed`) — ' + JSON.stringify(d));
  no(set('P-C1', 'messages', false, { targetId: 'P-A1' }), 0, 'a parent chose for the admin');
  no(set('P-A1', 'messages', false, { targetId: 'P-A2' }), 0, 'an admin chose for another admin');
  d = set('P-A1', 'messages', true, { targetId: 'P-S1' });
  rule(d.success && cell('P-S1', 'messages_email') === '', 'an admin could not put a child\'s messages back on, or on did not write a blank — ' + JSON.stringify(d) + ' / "' + cell('P-S1', 'messages_email') + '"');
  /* READING: your own, whoever you claim to be; nobody else's. */
  let r = W.b.post({ action: 'myProfile', personId: 'P-C1', name: 'Pat Parent' });
  rule(!r.success && !r.profile, 'myProfile with no token answered with a profile');
  r = W.b.post({ action: 'myProfile', token: W.tk['P-C2'].token, personId: 'P-C1', name: 'Pat Parent' });
  rule(r.success && r.personId === 'P-C2' && r.profile.notify.kinds.find(k => k.kind === 'messages').on === true,
    'a stranger asking for the parent\'s profile was given ' + (r.personId || 'nothing') + '\'s, with messages ' + JSON.stringify(r.profile && r.profile.notify.kinds.find(k => k.kind === 'messages')));
  r = W.b.post({ action: 'getProfile', token: W.tk['P-C2'].token, personId: 'P-C2', target: 'P-C1' });
  rule(!r.success && !r.profile, 'a non-admin read somebody else\'s profile through getProfile');
  /* AND IT SURVIVES SIGNING IN AGAIN — the sheet holds it, not the reply. */
  const again = W.b.post({ action: 'verifyLogin', email: 'parent@example.org', pin: '0000' });
  rule(again.success && again.profile.notify.kinds.find(k => k.kind === 'posts').on === false,
    'signing in again did not bring back Posts off — ' + JSON.stringify(again.profile && again.profile.notify));
  /* PUT BACK for the senders below. */
  ['messages', 'posts'].forEach(k => set('P-C1', k, true));
}

/* 3c. EVERY OPTIONAL KIND, THROUGH A REAL SENDER: off sends that person nothing and is logged; on sends. */
const proved = {};
const both = (kind, pid, addr, send, re) => {
  const w = W;
  const offSet = w.as(pid, { action: 'setNotify', kind: kind, on: false });
  if (!rule(offSet.success, kind + ': ' + pid + ' could not turn it off — ' + JSON.stringify(offSet))) return;
  const m0 = w.mark(), l0 = w.logs.length;
  const r1 = send();
  const got = w.to(addr, m0, re);
  const logged = w.logs.slice(l0).some(l => l.indexOf('notify held: ' + kind) !== -1 && l.indexOf(pid) !== -1);
  rule(!got.length, kind + ' OFF: ' + addr + ' was still sent ' + JSON.stringify(got.map(m => m.subject)) + ' — ' + JSON.stringify(r1));
  rule(logged, kind + ' OFF: the held email to ' + pid + ' was not logged (`notifyHeld_`) — logs: ' + JSON.stringify(w.logs.slice(l0)));
  rule(r1 && r1.success !== false && !r1.error, kind + ': the action itself failed with it off — ' + JSON.stringify(r1));
  w.as(pid, { action: 'setNotify', kind: kind, on: true });
  const m1 = w.mark();
  const r2 = send();
  const got2 = w.to(addr, m1, re);
  if (rule(got2.length === 1, kind + ' ON: ' + addr + ' was sent ' + got2.length + ' matching email(s), wanted 1 — ' + JSON.stringify(r2))) proved[kind] = (proved[kind] || 0) + 1;
};
const clearMessages = () => { W.b.tabs.messages.length = 1; W.b.ev('clearCache()'); };
/* MESSAGES: the tutor writes to the parent. */
both('messages', 'P-C1', 'parent@example.org', () => { clearMessages(); return W.as('P-T1', { action: 'sendMessage', to: 'Pat Parent', toId: 'P-C1', body: 'See you Monday.' }); }, /^A message from/);
/* POSTS: the admin puts up the student's post. */
let postN = 0;
both('posts', 'P-S1', 'student@example.org', () => {
  const id = 'PO-T' + (++postN);
  W.b.seed('posts', [{ post_id: id, author: 'Sam Student', posted_by: 'Sam Student', image: 'https://example.org/p.jpg', approved: 'PENDING', active: 'TRUE' }]);
  return W.as('P-A1', { action: 'approvePost', id: id, on: true });
}, /^Your post/);
/* REFERRALS: somebody registers with the parent's code. */
let regN = 0;
both('referrals', 'P-C1', 'parent@example.org', () => {
  regN++;
  return W.b.post({ action: 'register', who: 'parent', first_name: 'New' + 'abcdefgh'[regN], last_name: 'Family',
    email: 'new' + regN + '@example.org', pin: FRESH, ref: 'PATPARENT10' });
}, /joined through you/);
/* APPROVALS: a tutor posts; the admin is told it waits. */
both('approvals', 'P-A1', 'admin@example.org', () => W.as('P-T1', { action: 'addPost', image: 'https://example.org/t.jpg', caption: 'A worksheet' }), /waiting for you/);
/* BOOKINGS — a note on a session (`move` Say), from the parent to the tutor already on it. */
const book = W.as('P-C1', { action: 'createJob', requestedTutor: 'Ada Tutor', subject: 'Maths', level: 'GCSE', day: 'Saturday',
  time: '11:00', slots: 'sa11', location: 'Online', dates: dmy(day(40)), hours: 1, price: 30 });
const jobId = book && (book.jobId || book.id);
if (rule(book && book.success && jobId, 'the parent could not book the tutor, so the booking senders were not reached — ' + JSON.stringify(book))) {
  let say = 0;
  both('bookings', 'P-T1', 'tutor@example.org', () => W.as('P-C1', { action: 'move', jobId: jobId, role: 'client', move: 'Say',
    text: 'Could we start at five past?', requestId: 'say-' + (++say) }), /left a note/);
  /* …and an INVITATION typed for a member's address: held, and the invites tab says why. */
  both('bookings', 'P-C2', 'stranger@example.org', () => W.as('P-C1', { action: 'sendInvites', jobId: jobId, emails: ['stranger@example.org'] }), /share a tutoring session/);
  const inv = rowsOf(W.b, 'invites').filter(r => r.to_email === 'stranger@example.org');
  rule(inv.length === 2 && /not emailed/.test(String(inv[0].notes)) && !String(inv[1].notes),
    'the held invitation is not marked in invites.notes (or the sent one is) — ' + JSON.stringify(inv.map(r => r.notes)));
  const m0 = W.mark();
  W.as('P-C1', { action: 'sendInvites', jobId: jobId, emails: ['nobody-yet@example.org'] });
  rule(W.to('nobody-yet@example.org', m0).length === 1, 'an invitation to an address with no account was not sent — nobody there has chosen anything');
}
/* WEEKLY — the real Sunday run, in send mode, over the real people rows. Its own world, because its mail
   stub is the one that knows about the digest_log receipt. */
{
  const SUN = '2026-10-04T17:00:00Z';
  const runWith = off => {
    const w = world();
    const b = w.b;
    b.seed('people', PEOPLE);
    b.seed('family', LINKS);
    b.seed('attempts', [{ person_id: 'P-S1', question_key: 'q:SAM-1', first_done: '2026-10-01', last_done: '2026-10-01', times: 1,
      label: 'Maths · Paper 1 (Calculator) — June 2024 · Q1' }]);
    cfgSet(b, 'weekly_digest', 'send');
    const tk = b.post({ action: 'verifyLogin', email: 'parent@example.org', pin: '0000' });
    if (off) {
      const d = b.post({ action: 'setNotify', token: tk.token, personId: 'P-C1', kind: 'weekly', on: false });
      rule(d.success, 'weekly: the parent could not turn the weekly email off — ' + JSON.stringify(d));
    }
    const out = JSON.parse(JSON.stringify(b.ev('clearCache(); digestRun_(new Date(' + at(SUN) + '))')));
    return { sentTo: w.mail.sent.map(m => m.to), log: rowsOf(b, 'digest_log'), out };
  };
  const off = runWith(true), on = runWith(false);
  rule(off.sentTo.indexOf('parent@example.org') === -1, 'weekly OFF: the Sunday run still emailed the parent — ' + JSON.stringify(off.out));
  rule(off.log.some(r => r.parent_id === 'P-C1' && r.status === 'opted out'), 'weekly OFF: the digest_log has no "opted out" row for the parent — ' + JSON.stringify(off.log));
  if (rule(on.sentTo.indexOf('parent@example.org') !== -1, 'weekly ON: the Sunday run did not email the parent — ' + JSON.stringify(on.out))) proved.weekly = 1;
}
OPTIONAL.forEach(k => rule(proved[k], 'no real sender proved `' + k + '` on and off here — a switch nobody has seen work'));

/* 3d. THE ESSENTIALS GO WHEN EVERY COLUMN ON EVERY ROW SAYS `no` — typed into the sheet by hand. */
{
  const E = make();
  PEOPLE.forEach(p => COLS.forEach(c => E.typed(p.person_id, c, 'no')));
  const sentTo = (addr, re, fn, said) => { const m = E.mark(); const d = fn();
    rule(E.to(addr, m, re).length >= 1, 'ESSENTIAL ' + said + ' was not sent with every column saying no — ' + JSON.stringify(d)); return d; };
  const job = sentTo('parent@example.org', /Booking received/, () => E.as('P-C1', { action: 'createJob', requestedTutor: 'Ada Tutor',
    subject: 'Maths', level: 'GCSE', day: 'Saturday', time: '11:00', slots: 'sa11', location: 'Online', dates: dmy(day(47)), hours: 1, price: 30 }),
    'booked: the parent\'s booking receipt');
  rule(E.to('tutor@example.org', 0, /New request/).length === 1, 'ESSENTIAL booked: the tutor the family booked (their own Accept is logged) was not told');
  sentTo('student@example.org', /added you to their account/, () => E.as('P-C2', { action: 'claimChild', firstName: 'Sam', lastName: 'Student' }), 'family: "Someone has added you"');
  sentTo('tutor@example.org', /new @family\. PIN|new .* PIN/i, () => E.b.post({ action: 'forgotPin', who: 'tutor@example.org' }), 'access: "Your new PIN"');
  /* REPORTED: the admin writes to the student (held — the student said no to messages), who reports it. */
  const m0 = E.mark();
  const msg = E.as('P-A1', { action: 'sendMessage', to: 'Sam Student', toId: 'P-S1', body: 'Hello from the office.' });
  rule(msg.success && !E.to('student@example.org', m0, /A message from/).length, 'the admin\'s message reached a student whose messages_email says no — ' + JSON.stringify(msg));
  sentTo('admin@example.org', /was reported/, () => E.as('P-S1', { action: 'flagMessage', messageId: msg.id, reason: 'test' }), 'reported: "A message was reported"');
  /* AND THE `move` ACTS THAT DECIDE: a Withdraw by the family is the tutor's `booked`. */
  const jid = job && (job.jobId || job.id);
  if (jid) sentTo('tutor@example.org', /withdrew from/, () => E.as('P-C1', { action: 'move', jobId: jid, role: 'client', move: 'Withdraw', requestId: 'w-1' }),
    'booked: the tutor told the family withdrew');
  /* LAST, because a new PIN ends the sessions it was changed for — the child's, and the parent's own
     (`changePin` hands back another). */
  sentTo('student@example.org', /PIN was changed/, () => E.as('P-C1', { action: 'resetPin', targetId: 'P-S1' }), 'security: a child\'s "Your PIN was changed"');
  sentTo('parent@example.org', /PIN was changed/, () => E.as('P-C1', { action: 'changePin', currentPin: '0000', newPin: FRESH }), 'security: the parent\'s "Your PIN was changed"');
}

/* 3e. A ROW FROM BEFORE THE COLUMNS, AND A SHEET WITHOUT THEM: on. */
{
  const m0 = W.mark();
  W.b.tabs.messages.length = 1; W.b.ev('clearCache()');
  W.as('P-T1', { action: 'sendMessage', to: 'Old Row', toId: 'P-O1', body: 'Hello.' });
  rule(W.to('old@example.org', m0, /A message from/).length === 1, 'a row with every choice cell blank was not sent a message');
  const O = make({ oldSheet: true });
  rule(O.b.tabs.people[0].indexOf('messages_email') === -1, 'the old sheet still has the new columns, so this asked nothing');
  const n = (O.tk['P-C1'].profile || {}).notify;
  rule(n && n.kinds.filter(k => !k.essential).every(k => k.on), 'on a sheet without the columns the parent\'s card is not all on — ' + JSON.stringify(n));
  const m1 = O.mark();
  O.as('P-T1', { action: 'sendMessage', to: 'Pat Parent', toId: 'P-C1', body: 'Hello.' });
  rule(O.to('parent@example.org', m1, /A message from/).length === 1, 'on a sheet without the columns a message was not sent');
  const d = O.as('P-C1', { action: 'setNotify', kind: 'messages', on: false });
  rule(!d.success && /Run ensureSchema\(\)/.test(String(d.error)) && !d.writes, 'on a sheet without the column, setNotify did not refuse with the ensureSchema sentence, or wrote — ' + JSON.stringify(d));
}

/* ---------- THE VERDICT ------------------------------------------------------------------------------------ */
console.log('');
console.log('  ' + Object.keys(KINDS).length + ' kinds (' + OPTIONAL.length + ' optional: ' + OPTIONAL.join(', ') + '; '
  + ESSENTIAL.length + ' always sent: ' + ESSENTIAL.join(', ') + ')');
console.log('  ' + notifyCalls + ' notify() calls and ' + Object.values(directSeen).reduce((a, x) => a + x, 0) + ' direct MailApp sends, each with its kind');
console.log('  ' + Object.keys(proved).length + ' optional kinds proved off and on through a real sender; ' + asked + ' things asked');
console.log('');
if (bad.length) {
  bad.forEach(x => console.log('  ✗ ' + x));
  console.log('');
  console.log('FAILED — ' + bad.length + ' of ' + asked + '. Somebody who said no would be emailed, or somebody who needs an email would not be.');
  process.exit(1);
}
console.log('OK — every sender names its kind and asks; off is held and logged, on is sent, the essentials always go, '
  + 'the token decides whose choices are written, and a row or a sheet from before the columns is on.');
