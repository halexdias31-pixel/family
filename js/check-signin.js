#!/usr/bin/env node
/* ==================================================================================================
   node js/check-signin.js — EVERY WAY A CHILD GETS IN, THROUGH THE REAL BACKEND

   ASKED FOR AS *"audit the registration process and so on so all kids can login easily with their
   handle and pin."* Three audits read the sign-up and sign-in code and walked it through the real
   `doPost`, and between them found a child with no email who could not get an account at all, a PIN
   that starts with 0 refused for ever, "Forgotten your PIN?" wiping the PIN of whoever's handle was
   typed into it, and an admin reset that could never run. Every one of those passed every check in
   the suite, because no check asked the question from the child's side.

   THIS ASKS IT FROM THE CHILD'S SIDE, END TO END: a child with no email registered by a parent, the
   same child registering themselves with a grown-up's address, a child typed into the sheet by hand,
   each signing in by handle and PIN and getting a new PIN when they forget it — and the ways a
   classmate who knows their public handle could get in their way.

   NOT A SECOND IMPLEMENTATION. `check-gas-load.js` loads every `.gs` file into one scope over an
   in-memory Ledger whose `setValue` parses a string the way a real sheet does — including dropping
   the 0 off the front of a string of digits, which is the half of this a stub would have hidden.
   Mail is caught, not sent: `MAIL` below records every message, and `MAIL_FAIL` / `QUOTA` make the
   mail service refuse, so "the PIN changed and nobody was sent it" is something this can see.

   THE PINS ARE BUILT, NOT WRITTEN. `check-secrets.js` refuses four digits beside the word, so every
   PIN here but the `0000` placeholder is assembled from its digits. The people are invented and
   their addresses are on example.org.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const S = v => (v === undefined || v === null) ? '' : String(v);
const no = (what, got) => bad.push(what + (got === undefined ? '' : ' — ' + JSON.stringify(got)));

/* A PIN THAT STARTS WITH 0, AND A SECOND ONE, built from their digits. Neither is weak. */
const ZERO = ['0', '7', '3', '9'].join('');
const ZERO2 = ['0', '5', '8', '2', '6'].join('');
const PLACE = '0000';

/* ---------- THE MAIL SERVICE, CAUGHT -------------------------------------------------------------- */
const MAIL = [];
let MAIL_FAIL = false, QUOTA = 100;
const mailApp = {
  sendEmail(m) { if (MAIL_FAIL) throw new Error('Service invoked too many times for one day: email.'); MAIL.push(m); },
  getRemainingDailyQuota: () => QUOTA,
};
const fresh = () => backend({ MailApp: mailApp });
const mailTo = (addr, since) => MAIL.slice(since || 0).filter(m => S(m.to).split(',').indexOf(addr) !== -1);
const pinIn = m => ((S(m && m.body).match(/PIN is (\d{4,8})/) || [])[1] || '');

/* ---------- THE PEOPLE ----------------------------------------------------------------------------- */
const base = { pin: PLACE, verified: 'TRUE', listed: false, xp: 0, credits: 0, city: 'London' };
const person = (id, role, first, last, extra) => Object.assign({}, base,
  { person_id: id, role: role, first_name: first, last_name: last, email: '' }, extra || {});

const rowOf = (b, test) => {
  const h = b.tabs.people[0];
  const r = b.tabs.people.slice(1).find(x => test(Object.fromEntries(h.map((c, i) => [c, x[i]]))));
  return r ? Object.fromEntries(h.map((c, i) => [c, r[i]])) : null;
};
const signIn = (b, who, pin) => { asked++; return b.post({ action: 'verifyLogin', email: who, name: who, pin: pin }); };
const post = (b, body) => { asked++; return b.post(body); };

/* ==================================================================================================
   1. A PIN THAT STARTS WITH 0
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind10' }),
    /* TYPED INTO THE SHEET BY HAND: the placeholder goes in as four characters and the sheet keeps `0`. */
    person('P-HT', 'student', 'Tia', 'Typed', { handle: 'tia_kind11' }),
  ]);
  const cell = rowOf(b, r => r.person_id === 'P-HT').pin;
  if (typeof cell !== 'number') no('the harness kept a hand-typed 0000 as text, so nothing below proves what a real sheet does', cell);
  const typed = signIn(b, 'tia_kind11', PLACE);
  if (!typed.success) no('a PIN typed into the sheet as four noughts, which the sheet keeps as 0, is refused', typed);
  const after = rowOf(b, r => r.person_id === 'P-HT').pin;
  if (after !== PLACE) no('a PIN the sheet had turned into a number was not written back as the text that was typed', after);
  /* A NUMBER CELL ANSWERS TO ITS OWN DIGITS AND NOTHING ELSE. */
  const b2 = fresh();
  b2.seed('people', [person('P-HT2', 'student', 'Tom', 'Typed', { handle: 'tom_kind12' })]);
  const wrong = signIn(b2, 'tom_kind12', '0001');
  if (wrong.success) no('a number cell let a different PIN in');

  /* A PIN CHOSEN WITH A 0 IN FRONT, THROUGH `register`, IS STORED AS THE DIGITS CHOSEN. */
  const reg = post(b, { action: 'register', first_name: 'Zoe', last_name: 'Zero', email: 'zoe@example.org', pin: ZERO });
  if (!reg.success) no('register refused a PIN that starts with 0', reg);
  const z = rowOf(b, r => r.first_name === 'Zoe');
  if (!z || z.pin !== ZERO) no('register stored a PIN that starts with 0 as something else — the sheet would hand back ' + JSON.stringify(z && z.pin));
  if (z) {
    post(b, { action: 'verifyEmail', token: z.verify_token });
    const zin = signIn(b, 'zoe@example.org', ZERO);
    if (!zin.success) no('a child who chose a PIN starting with 0 cannot sign in with it', zin);
    /* AND THROUGH `changePin`, which writes through `authSetPin_`. */
    if (zin.token) {
      const ch = post(b, { action: 'changePin', token: zin.token, currentPin: ZERO, newPin: ZERO2 });
      if (!ch.success) no('changePin refused a new PIN starting with 0', ch);
      if (rowOf(b, r => r.first_name === 'Zoe').pin !== ZERO2) no('changePin stored a PIN starting with 0 without its 0');
      if (!signIn(b, 'zoe@example.org', ZERO2).success) no('the changed PIN, starting with 0, does not sign in');
    }
  }
  /* A PIN THIS BACKEND DRAWS NEVER STARTS WITH 0 AND IS NEVER ONE IT WOULD REFUSE. */
  const drawn = JSON.parse(b.ev('JSON.stringify(Array.from({ length: 3000 }, () => authFreshPin_()))'));
  const zeroLed = drawn.filter(p => /^0/.test(p)).length, odd = drawn.filter(p => !/^\d{6}$/.test(p)).length;
  const weak = drawn.filter(p => b.ev('pinWeak_(' + JSON.stringify(p) + ')')).length;
  if (zeroLed) no(zeroLed + ' of 3000 drawn PINs start with 0 — the sheet drops it and the PIN emailed is not the PIN stored');
  if (odd) no(odd + ' of 3000 drawn PINs are not six digits');
  if (weak) no(weak + ' of 3000 drawn PINs are ones changePin refuses');
  /* ONE RULE FOR AN OBVIOUS PIN, AT EVERY DOOR THAT TAKES ONE. */
  const weakReg = post(b, { action: 'register', first_name: 'Wes', last_name: 'Weak', email: 'wes@example.org', pin: PLACE });
  if (weakReg.success || rowOf(b, r => r.first_name === 'Wes')) no('register accepted four noughts, which changePin refuses', weakReg);
}

/* ==================================================================================================
   2. A PARENT MAKES THEIR CHILD'S ACCOUNT — no email, signed in by handle at once
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind20' }),
    person('P-STU', 'student', 'Sid', 'Student', { email: 'sid@example.org', handle: 'sid_kind21' }),
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind22' }),
  ]);
  const pat = signIn(b, 'pat@example.org', PLACE);
  const sid = signIn(b, 'sid@example.org', PLACE);
  if (!pat.token) no('the parent could not sign in, so making a child\'s account was NOT checked', pat);
  else {
    const m0 = MAIL.length;
    const made = post(b, { action: 'makeChild', token: pat.token, firstName: 'Ivy', lastName: 'Parent', pin: ZERO });
    if (!made.success) no('a parent could not make their child\'s account', made);
    const ivy = rowOf(b, r => r.first_name === 'Ivy');
    if (!ivy) no('makeChild answered but no row was written');
    else {
      if (S(ivy.email)) no('the child made by a parent was given an email address', ivy.email);
      if (!/^[a-z]/.test(S(ivy.handle)) || S(ivy.handle) !== S(made.handle)) no('the child\'s handle is not the one the reply showed the parent', { cell: ivy.handle, said: made.handle });
      if (ivy.pin !== ZERO) no('the PIN the parent chose was not stored as chosen', ivy.pin);
      if (S(ivy.verified).toUpperCase() === 'PENDING') no('a child made by their signed-in parent is waiting on a confirmation nobody will send');
      const link = b.tabs.family.slice(1).find(x => x.indexOf(ivy.person_id) !== -1);
      const fh = b.tabs.family[0];
      if (!link || link[fh.indexOf('parent_id')] !== 'P-PAT' || S(link[fh.indexOf('state')]) !== 'accepted')
        no('the child made by a parent is not on the parent\'s account, accepted', link);
      const kin = signIn(b, '@' + made.handle, ZERO);
      if (!kin.success) no('the child a parent made cannot sign in with the handle and the PIN', kin);
      const famOf = b.get({ token: pat.token }).family || [];
      const card = famOf.find(f => f.personId === ivy.person_id);
      if (!card || card.relation !== 'child' || card.handle !== made.handle) no('the parent\'s family list does not show the child with their handle', famOf);
      const told = mailTo('pat@example.org', m0);
      if (!told.length || told[0].body.indexOf('@' + made.handle) === -1) no('the parent was not emailed the child\'s handle', told);
      if (told.some(m => m.body.indexOf(ZERO) !== -1)) no('the PIN went into the email — one more copy of it, in a mailbox');
    }
    /* REFUSED, AND NOTHING WRITTEN. */
    const n = b.tabs.people.length;
    const weak = post(b, { action: 'makeChild', token: pat.token, firstName: 'Una', lastName: 'Parent', pin: PLACE });
    if (weak.success) no('makeChild accepted four noughts');
    const twice = post(b, { action: 'makeChild', token: pat.token, firstName: 'Ivy', lastName: 'Parent', pin: ZERO2 });
    if (twice.success) no('makeChild made a second Ivy Parent');
    if (sid.token) {
      const kid = post(b, { action: 'makeChild', token: sid.token, firstName: 'Ola', lastName: 'Student', pin: ZERO2 });
      if (kid.success) no('a student made a child\'s account');
    }
    const anon = post(b, { action: 'makeChild', firstName: 'Ana', lastName: 'Nobody', pin: ZERO2 });
    if (anon.success) no('makeChild worked with nobody signed in');
    if (b.tabs.people.length !== n) no('a refused makeChild wrote a row');
  }
}

/* ==================================================================================================
   3. A CHILD WITH NO EMAIL MAKES THEIR OWN ACCOUNT, WITH A GROWN-UP'S ADDRESS
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-MUM', 'client', 'Mia', 'Mum', { email: 'mum@example.org', handle: 'mia_kind30' }),
    /* THE BROTHER WHO REGISTERED WITH MUM'S ADDRESS — on a student row, so it makes him nobody's parent. */
    person('P-ANN', 'student', 'Ann', 'Sib', { email: 'family@example.org', handle: 'ann_kind31' }),
  ]);
  const m0 = MAIL.length;
  const reg = post(b, { action: 'register', first_name: 'Ben', last_name: 'Mum', parent_email: 'mum@example.org', pin: ZERO });
  if (!reg.success) no('a child with no email could not make an account with a grown-up\'s address', reg);
  const ben = rowOf(b, r => r.first_name === 'Ben');
  if (!ben) no('register answered but wrote no row for the child');
  else {
    if (S(ben.email)) no('the grown-up\'s address was written as the child\'s sign-in address — it would lock the grown-up out', ben.email);
    if (S(ben.parent_email) !== 'mum@example.org') no('the grown-up\'s address was not kept for the child', ben.parent_email);
    if (!S(ben.handle) || S(reg.handle) !== S(ben.handle)) no('register did not hand back the handle the child signs in with', { cell: ben.handle, said: reg.handle });
    const sent = mailTo('mum@example.org', m0);
    if (!sent.length || sent[0].body.indexOf(ben.verify_token) === -1) no('the confirmation link did not go to the grown-up', sent);
    else if (sent[0].body.indexOf('@' + ben.handle) === -1) no('the grown-up\'s email does not say the handle the child signs in with');
    const early = signIn(b, ben.handle, ZERO);
    /* THE OWNER, 6 Oct: no waiting on an email to sign in. The child is in before anybody opens it. */
    if (!early.success) no('the child could not sign in before the grown-up opened the link — an email is not a door', early);
    const yes = post(b, { action: 'verifyEmail', token: ben.verify_token });
    if (!yes.success || yes.linkedTo !== 'Mia Mum') no('the grown-up opening the link did not put the child on their account', yes);
    const inn = signIn(b, ben.handle, ZERO);
    if (!inn.success) no('the child who made their own account cannot sign in by handle once the grown-up said yes', inn);
    const mum = signIn(b, 'mum@example.org', PLACE);
    const kids = (mum.token ? b.get({ token: mum.token }).family : []) || [];
    if (!kids.some(k => k.relation === 'child' && k.handle === ben.handle)) no('the child is not on the grown-up\'s family list', kids);
  }
  /* THE SECOND CHILD ON A FAMILY'S ONE ADDRESS — it was "That email is already registered". */
  const cal = post(b, { action: 'register', first_name: 'Cal', last_name: 'Sib', parent_email: 'family@example.org', pin: ZERO2 });
  if (!cal.success) no('a second child on an address a brother already uses could not make an account', cal);
  const calRow = rowOf(b, r => r.first_name === 'Cal');
  if (calRow) {
    const yes = post(b, { action: 'verifyEmail', token: calRow.verify_token });
    if (!yes.success) no('the link for the second child did not confirm them', yes);
    if (yes.linkedTo) no('a brother\'s STUDENT row was made the second child\'s parent', yes.linkedTo);
    if (!signIn(b, calRow.handle, ZERO2).success) no('the second child cannot sign in by handle');
    /* AND A FORGOTTEN PIN REACHES THE GROWN-UP'S ADDRESS, with no parent account at all. */
    const m1 = MAIL.length;
    const fp = post(b, { action: 'forgotPin', who: calRow.handle });
    if (!fp.success || !mailTo('family@example.org', m1).length) no('a forgotten PIN for a self-registered child did not reach the grown-up\'s address', fp);
  }
  /* REFUSED, AND SAID. */
  const neither = post(b, { action: 'register', first_name: 'Dee', last_name: 'None', pin: ZERO });
  if (neither.success) no('register made an account with no address of any kind');
  const weak = post(b, { action: 'register', first_name: 'Eve', last_name: 'Weak', parent_email: 'mum@example.org', pin: PLACE });
  if (weak.success) no('register took four noughts from a child');
  /* AND A SHEET WITH NO `parent_email` COLUMN SAYS SO, WITH NOTHING WRITTEN. */
  const old = fresh();
  const at = old.tabs.people[0].indexOf('parent_email');
  if (at < 0) no('SCHEMA.people has no parent_email column');
  else {
    old.tabs.people[0].splice(at, 1);
    const n = old.tabs.people.length;
    const r = post(old, { action: 'register', first_name: 'Fay', last_name: 'Old', parent_email: 'mum@example.org', pin: ZERO });
    if (r.success || !/parent_email/.test(S(r.error)) || old.tabs.people.length !== n) no('register on a sheet with no parent_email column did not refuse before writing', r);
  }
}

/* ==================================================================================================
   4. "FORGOTTEN YOUR PIN?" — sent beside the old one, honest, and not a way to lock a child out
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind40' }),
    person('P-KIT', 'student', 'Kit', 'Parent', { handle: 'kit_kind41' }),
    person('P-LEE', 'student', 'Lee', 'Alone', { handle: 'lee_kind42' }),
    person('P-OWN', 'student', 'Ola', 'Own', { email: 'ola@example.org', handle: 'ola_kind43' }),
  ]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAT', child_id: 'P-KIT', state: 'accepted' }]);
  const pinCell = () => rowOf(b, r => r.person_id === 'P-KIT').pin;
  const before = pinCell();
  const m0 = MAIL.length;
  const said = post(b, { action: 'forgotPin', who: '@Kit_Kind41' });
  if (!said.success) no('forgotPin for a child with a parent did not answer', said);
  const sent = mailTo('pat@example.org', m0);
  const emailed = pinIn(sent[0]);
  if (!emailed) no('the parent was not sent a PIN', sent);
  if (pinCell() !== before) no('ASKING CHANGED THE PIN — anybody who types a child\'s handle stops their PIN working', { before, after: pinCell() });
  if (!signIn(b, 'kit_kind41', PLACE).success) no('the old PIN stopped working when somebody asked for a new one');
  /* ONCE A QUARTER OF AN HOUR. */
  const again = post(b, { action: 'forgotPin', who: 'kit_kind41' });
  if (!again.success || again.why !== 'already-sent' || mailTo('pat@example.org', m0).length !== 1)
    no('a second press within the quarter hour sent another email', { again, mails: mailTo('pat@example.org', m0).length });
  /* THE EMAILED PIN SIGNS IN, AND BECOMES THE PIN. */
  if (emailed) {
    const inn = signIn(b, 'kit_kind41', emailed);
    if (!inn.success) no('the emailed PIN does not sign in', inn);
    if (S(pinCell()) !== emailed) no('the emailed PIN, once used, did not become the PIN', pinCell());
    if (signIn(b, 'kit_kind41', PLACE).success) no('the old PIN still works after the emailed one was used');
    if (signIn(b, 'kit_kind41', emailed).success !== true) no('the emailed PIN stopped working after it became the PIN');
  }
  /* A MAIL THAT CANNOT GO CHANGES NOTHING, AND SAYS SO. */
  const b2 = fresh();
  b2.seed('people', [person('P-OWN', 'student', 'Ola', 'Own', { email: 'ola@example.org', handle: 'ola_kind44' })]);
  MAIL_FAIL = true;
  const failed = post(b2, { action: 'forgotPin', who: 'ola@example.org' });
  MAIL_FAIL = false;
  if (failed.success || failed.why !== 'no-mail') no('a mail that could not be sent was reported as sent', failed);
  if (Object.keys(b2.props).some(k => /^AUTH_RESET_/.test(k))) no('a PIN that was never sent was kept as a way in');
  if (!signIn(b2, 'ola@example.org', PLACE).success) no('a mail that failed changed the PIN anyway');
  QUOTA = 0;
  const m2 = MAIL.length;
  const spent = post(b2, { action: 'forgotPin', who: 'ola_kind44' });
  QUOTA = 100;
  if (spent.success || spent.why !== 'no-mail' || MAIL.length !== m2) no('with no mail quota left, forgotPin still tried, or said it had sent', spent);
  /* NOBODY TO WRITE TO, AND NO SUCH ACCOUNT, EACH SAID AS ITSELF. */
  const lee = post(b, { action: 'forgotPin', who: 'lee_kind42' });
  if (lee.success || lee.why !== 'no-inbox') no('a child with no address and no parent was told a PIN was on its way', lee);
  const nobody = post(b, { action: 'forgotPin', who: 'nobody_kind99' });
  if (nobody.success) no('forgotPin said it sent a PIN for a handle nobody has', nobody);
  /* A LONG FIRST NAME SPELLED OUT REACHES THE SAME ROW, as at the sign-in box. */
  const b3 = fresh();
  b3.seed('people', [person('P-CHR', 'student', 'Christopher', 'Long', { email: 'chris@example.org', handle: 'christoph_kind45' })]);
  const m3 = MAIL.length;
  const long = post(b3, { action: 'forgotPin', who: 'christopher_kind45' });
  if (!long.success || !mailTo('chris@example.org', m3).length) no('forgotPin by a long first name spelled out found nobody', long);
}

/* ==================================================================================================
   5. A CLASSMATE WITH YOUR HANDLE — the lock, the way out of it, and who is told
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind50' }),
    person('P-KIT', 'student', 'Kit', 'Parent', { handle: 'kit_kind51' }),
    person('P-JO', 'student', 'Jo', 'Parent', { handle: 'jo_kind52' }),
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind53' }),
  ]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAT', child_id: 'P-KIT', state: 'accepted' },
                    { link_id: 'L2', parent_id: 'P-PAT', child_id: 'P-JO', state: 'accepted' }]);
  const m0 = MAIL.length;
  for (let i = 0; i < 11; i++) signIn(b, 'kit_kind51', '9');
  const locked = signIn(b, 'kit_kind51', PLACE);
  if (locked.success) no('eleven wrong PINs did not lock the account — the throttle is not under test');
  /* THE GROWN-UP IS TOLD, because the child has no inbox to tell. */
  if (!mailTo('pat@example.org', m0).some(m => /Too many sign-in attempts/.test(S(m.subject))))
    no('a child with no address was guessed at eleven times and their parent was not told');
  /* THE EMAILED PIN IS THE WAY OUT OF THE LOCK (181). */
  const m1 = MAIL.length;
  post(b, { action: 'forgotPin', who: 'kit_kind51' });
  const out = pinIn(mailTo('pat@example.org', m1)[0]);
  const freed = out ? signIn(b, 'kit_kind51', out) : {};
  if (!freed.success) no('the emailed PIN is refused while the account is locked — the way out of a lockout is locked', freed);
  /* AND FIVE MISSES AT IT, WHILE LOCKED, THROW IT AWAY — or a lock would let a guesser try the
     six-digit code all day without moving the ladder. */
  for (let i = 0; i < 11; i++) signIn(b, 'jo_kind52', '9');
  const m2 = MAIL.length;
  post(b, { action: 'forgotPin', who: 'jo_kind52' });
  const joPin = pinIn(mailTo('pat@example.org', m2)[0]);
  for (let i = 0; i < 5; i++) signIn(b, 'jo_kind52', '1');
  if (joPin && signIn(b, 'jo_kind52', joPin).success) no('five wrong tries at the emailed PIN during a lock left it working');
  /* A QUIET DAY STARTS THE COUNT AGAIN. */
  const key = 'AUTH_TRIES_P-JO';
  const was = JSON.parse(b.props[key] || '{}');
  b.props[key] = JSON.stringify({ n: was.n, until: Date.now() - 1, at: Date.now() - 25 * 36e5 });
  signIn(b, 'jo_kind52', '9');
  const now = JSON.parse(b.props[key] || '{}');
  if (now.n !== 1) no('a day with no wrong answer did not start the count again — one typo after a classmate\'s guesses is an hour\'s wait for ever', now);
  /* AN ADMIN'S `?run=` IS THE SAME LADDER. */
  for (let i = 0; i < 11; i++) { asked++; b.get({ run: 'checkEverything', name: 'Hal Admin', pin: '9' }); }
  asked++;
  const runRight = b.get({ run: 'checkEverything', name: 'Hal Admin', pin: PLACE });
  if (!/Too many wrong PINs/.test(S(runRight.error))) no('eleven wrong PINs at ?run= did not lock it — an unlimited guess at an admin\'s PIN', runRight);
}

/* ==================================================================================================
   6. A NEW PIN FROM A PARENT OR AN ADMIN, AND A ROW TYPED INTO THE SHEET
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind60' }),
    person('P-KIT', 'student', 'Kit', 'Parent', { handle: 'kit_kind61' }),
    /* TYPED BY HAND: no handle. */
    person('P-LEE', 'student', 'Lee', 'Typed', {}),
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind62' }),
    person('P-AD2', 'admin', 'Ida', 'Admin', { email: 'ida@example.org', handle: 'ida_kind63' }),
    /* TYPED BY HAND AFTER THE LAST DEPLOY: no id at all. */
    person('', 'student', 'Noa', 'Noid', { handle: 'noa_kind64' }),
  ]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAT', child_id: 'P-KIT', state: 'accepted' }]);
  const pat = signIn(b, 'pat@example.org', PLACE), adm = signIn(b, 'admin@example.org', PLACE);
  const kitOld = signIn(b, 'kit_kind61', PLACE);
  if (!pat.token || !adm.token) no('the parent or the admin could not sign in, so resetting was NOT checked');
  else {
    for (let i = 0; i < 11; i++) signIn(b, 'kit_kind61', '9');
    const r = post(b, { action: 'resetPin', token: pat.token, targetId: 'P-KIT' });
    if (!r.success || !/^[1-9]\d{5}$/.test(S(r.pin))) no('a parent could not give their own child a new PIN', r);
    else {
      if (!signIn(b, 'kit_kind61', r.pin).success) no('the PIN a parent gave a locked-out child does not sign them in');
      if (signIn(b, 'kit_kind61', PLACE).success) no('the old PIN still works after the parent gave a new one');
      if (kitOld.token && !post(b, { action: 'myProfile', token: kitOld.token }).error) no('the child\'s old session survived the new PIN');
    }
    const notMine = post(b, { action: 'resetPin', token: pat.token, targetId: 'P-LEE' });
    if (notMine.success) no('a parent reset the PIN of a child who is not theirs');
    const leeR = post(b, { action: 'resetPin', token: adm.token, targetId: 'P-LEE' });
    if (!leeR.success) no('an admin could not give a hand-typed child a PIN', leeR);
    else {
      const lee = rowOf(b, x => x.person_id === 'P-LEE');
      if (!S(lee.handle) || S(lee.handle) !== S(leeR.handle)) no('a hand-typed child with no handle was given a PIN and still no handle', lee.handle);
      if (!signIn(b, S(leeR.handle), leeR.pin).success) no('the hand-typed child cannot sign in with the handle and PIN the admin was shown');
    }
    if (post(b, { action: 'resetPin', token: adm.token, targetId: 'P-AD2' }).success) no('an admin reset another admin\'s PIN');
    if (post(b, { action: 'resetPin', token: adm.token, targetId: 'P-ADM' }).success) no('resetPin reset the asker\'s own PIN, without the old one');
    if (kitOld.token && post(b, { action: 'resetPin', token: S(signIn(b, 'kit_kind61', S(r.pin)).token), targetId: 'P-LEE' }).success)
      no('a student reset somebody\'s PIN');
    /* CHANGEPIN IS YOUR OWN ONLY — the admin branch could never run, and is gone. */
    const cp = post(b, { action: 'changePin', token: adm.token, adminName: 'Hal Admin', name: 'Lee Typed', currentPin: '1', newPin: ZERO2 });
    if (cp.success) no('changePin changed somebody\'s PIN without their current one', cp);
  }
  /* A ROW WITH NO ID IS GIVEN ONE, AND THE SESSION IT GETS THEN WORKS. */
  const noid = signIn(b, 'noa_kind64', PLACE);
  if (!noid.success || !S(noid.personId)) no('a row typed in with no person_id signs in with no id', noid);
  else {
    if (S(rowOf(b, x => x.first_name === 'Noa').person_id) !== S(noid.personId)) no('the id a row was given at sign-in was not written to the sheet');
    const me = post(b, { action: 'myProfile', token: noid.token });
    if (!me.success) no('"Signed in", and the first thing pressed is "Signed out" — a row with no id', me);
  }
}

/* ==================================================================================================
   7. WHAT THE PAYLOAD SAYS ABOUT A HANDLE, AND WHAT IT NO LONGER SENDS
   ================================================================================================== */
{
  const b = fresh();
  b.seed('people', [
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind70' }),
    person('P-STU', 'student', 'Sam', 'Student', { email: 'sam@example.org', handle: 'sam_kind71', friends: 'kit_kind72' }),
    person('P-KIT', 'student', 'Kit', 'Typed', {}),
    person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind73' }),
  ]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAT', child_id: 'P-KIT', state: 'accepted' },
                    { link_id: 'L2', parent_id: 'P-PAT', child_id: 'P-STU', state: 'accepted' }]);
  const sam = signIn(b, 'sam@example.org', PLACE), adm = signIn(b, 'admin@example.org', PLACE);
  const pat = signIn(b, 'pat@example.org', PLACE);
  if (!sam.token || !adm.token || !pat.token) no('somebody could not sign in, so the payload was NOT checked');
  else {
    const seen = b.get({ token: sam.token }).students || [];
    if (!seen.length) no('a student was sent no students, so this asked nothing');
    if (seen.some(x => 'siblings' in x || 'friends' in x)) no('every student is sent other children\'s brothers, sisters and friends', seen[0]);
    const kit = seen.find(x => x.name === 'Kit');
    if (kit && kit.handle) no('a child with no handle was sent their first name as a handle, which does not sign in', kit);
    const all = b.get({ token: adm.token }).everyone || [];
    const kitA = all.find(x => x.personId === 'P-KIT');
    if (!kitA) no('the admin\'s list has no hand-typed child in it');
    else if (kitA.handle) no('the admin is shown a first name as a handle', kitA);
    const fam = (b.get({ token: pat.token }).family || []).find(x => x.personId === 'P-KIT');
    if (fam && fam.handle) no('a parent is shown their child\'s first name as a handle', fam);
  }
  /* `ensureSchema` FILLS A BLANK HANDLE AND OVERWRITES NONE. */
  try { b.ev('ensureSchema()'); } catch (e) { no('ensureSchema threw in the harness', String(e && e.message || e)); }
  if (!S(rowOf(b, x => x.person_id === 'P-KIT').handle)) no('ensureSchema left a hand-typed child with no handle');
  if (S(rowOf(b, x => x.person_id === 'P-STU').handle) !== 'sam_kind71') no('ensureSchema changed a handle somebody already had');
  /* AN INVITATION ACCEPTED MAKES A ROW WITH A HANDLE. */
  b.seed('invites', [{ token: 'INV1', job_id: 'J1', from_person: 'Pat Parent', to_email: 'max@example.org' }]);
  const inv = post(b, { action: 'acceptInvite', token: 'INV1', newName: 'Max Invited' });
  const max = rowOf(b, x => x.first_name === 'Max');
  if (!inv.success || !max) no('accepting an invitation made no row', inv);
  else if (!S(max.handle)) no('the row an invitation makes has no handle — every card draws @Max, which does not sign in');
}

/* ==================================================================================================
   8. WHO THE ACCOUNT IS FOR — a parent signs up as a parent, a student as a student, and a student
      still cannot make themself one
   --------------------------------------------------------------------------------------------------
   THE WALK AFTER 273 FOUND IT: a parent who signed up on the phone was written `student`, so Settings
   never offered "Make your child's account" and ticking Client was refused by the rule that stops a
   child promoting themself. The form now asks, and `register` writes the role it was told — and the
   rule stays. Each half is asked of the SHEET afterwards, and then of the next thing the person does.
   ================================================================================================== */
let whoRules = 0;
{
  const b = fresh();
  const rule = (ok, said, got) => { if (ok) whoRules++; else no(said, got); };
  b.seed('people', [
    person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind80' }),
    /* A CHILD WHO ALREADY EXISTS, with a parent of her own — the one a stranger's parent account must
       not be able to reach. */
    person('P-ELLA', 'student', 'Ella', 'Exists', { email: 'ella@example.org', handle: 'ella_kind81' }),
    /* A TUTOR, who is not a parent but MAY tick Client — so is the one a refusal may send there. */
    person('P-TIA', 'tutor', 'Tia', 'Tutor', { email: 'tia@example.org', handle: 'tia_kind82' }),
  ]);
  const P1 = ['5', '8', '2', '7', '1', '4'].join(''), P2 = ['4', '1', '9', '3'].join('');
  const cellOf = (pid, c) => { const r = rowOf(b, x => x.person_id === pid); return r ? r[c] : undefined; };
  const setSheet = (pid, c, v) => {           // the owner typing into the sheet
    const h = b.tabs.people[0];
    const r = b.tabs.people.find((x, i) => i > 0 && x[h.indexOf('person_id')] === pid);
    if (r) r[h.indexOf(c)] = v;
  };

  /* A PARENT, AS A PARENT. */
  const m0 = MAIL.length;
  const reg = post(b, { action: 'register', who: 'parent', first_name: 'Dana', last_name: 'Brook', email: 'dana@example.org', pin: P1 });
  const dana = rowOf(b, r => r.first_name === 'Dana');
  rule(reg.success && dana, 'a parent could not register as a parent', reg);
  if (dana) {
    rule(S(dana.role) === 'client', 'a parent who said they were a parent was written "' + S(dana.role) + '", not client — Settings will not offer to make their child\'s account');
    rule(reg.role === 'parent', 'register\'s reply does not say the account is a parent\'s', reg.role);
    rule(S(dana.verified).toUpperCase() === 'PENDING', 'a parent\'s address counts as confirmed before the link is opened — the digest would mail a typo', dana.verified);
    const mail = mailTo('dana@example.org', m0)[0];
    rule(mail && /Make your child's account/.test(S(mail.body)), 'the parent\'s confirmation email does not say where their child\'s account is made', mail && mail.body);
    post(b, { action: 'verifyEmail', token: dana.verify_token });
    const din = signIn(b, 'dana@example.org', P1);
    rule(din.success, 'the parent could not sign in after opening the link', din);
    if (din.token) {
      /* THE FIRST SIGN-IN SAYS PARENT — the phone's `mayAddChild_` reads exactly these. */
      rule(din.role === 'parent' && (din.roles || []).indexOf('parent') !== -1,
        'the parent\'s first sign-in says role ' + JSON.stringify(din.role) + ' / ' + JSON.stringify(din.roles) + ' — the phone draws no "Make your child\'s account"');
      /* AND THE CARD'S ACTION WORKS ON THAT SAME FIRST SESSION — no reload, no sign-out, no owner. */
      const kid = post(b, { action: 'makeChild', token: din.token, firstName: 'Ivy', lastName: 'Brook', pin: ZERO });
      rule(kid.success, 'a parent who signed up on the phone could not make their child\'s account on their first sign-in', kid);
      /* WHAT A SELF-MADE PARENT CANNOT DO TO A CHILD WHO EXISTS. `makeChild` in her name is refused;
         `claimChild` only asks, and until Ella answers there is no link, no family card and no New PIN. */
      const n = b.tabs.people.length;
      const dup = post(b, { action: 'makeChild', token: din.token, firstName: 'Ella', lastName: 'Exists', pin: ZERO2 });
      rule(!dup.success && b.tabs.people.length === n && S(cellOf('P-ELLA', 'pin')) === '0',
        'a parent\'s makeChild in an existing child\'s name made a row or touched hers', dup);
      const ask = post(b, { action: 'claimChild', token: din.token, firstName: 'Ella', lastName: 'Exists' });
      const fh = b.tabs.family[0];
      const link = b.tabs.family.slice(1).find(x => x[fh.indexOf('child_id')] === 'P-ELLA');
      rule(ask.success && link && link[fh.indexOf('state')] === 'asked', 'claiming an existing child did not stay a question', link);
      const reset = post(b, { action: 'resetPin', token: din.token, targetId: 'P-ELLA' });
      rule(!reset.success && S(cellOf('P-ELLA', 'pin')) === '0', 'a parent whose claim nobody answered could give the child a new PIN', reset);
      const fam = b.get({ token: din.token }).family || [];
      rule(!fam.some(x => x.personId === 'P-ELLA') && fam.some(x => x.title === 'Ivy Brook'),
        'the parent\'s family is not "the child they made, and not the one they only asked for"', fam);
    }
  }

  /* A STUDENT, AS A STUDENT — and the rule that keeps them one. */
  const regS = post(b, { action: 'register', who: 'student', first_name: 'Mo', last_name: 'Learner', email: 'mo@example.org', pin: P2 });
  const mo = rowOf(b, r => r.first_name === 'Mo');
  rule(regS.success && mo && S(mo.role) === 'student' && regS.role === 'kid', 'a student who said they were a student was written ' + JSON.stringify(mo && mo.role) + ' (reply ' + JSON.stringify(regS.role) + ')', regS);
  if (mo) {
    post(b, { action: 'verifyEmail', token: mo.verify_token });
    const min = signIn(b, 'mo@example.org', P2);
    rule(min.success && min.role === 'kid', 'the student\'s first sign-in is not a student\'s', min.role);
    if (min.token) {
      const up = post(b, { action: 'setMyRoles', token: min.token, roles: ['client', 'student'] });
      rule(!up.success && S(cellOf(mo.person_id, 'role')) === 'student',
        'a student who signed up as a student made themself a client — ' + JSON.stringify(up) + ' / ' + cellOf(mo.person_id, 'role'));
      const n = b.tabs.people.length;
      const mk = post(b, { action: 'makeChild', token: min.token, firstName: 'Zed', lastName: 'Learner', pin: ZERO2 });
      rule(!mk.success && b.tabs.people.length === n, 'a student made a child\'s account', mk);
      /* AND THE REFUSAL DOES NOT SEND THEM TO A TICK THEY WERE JUST REFUSED. It said "Tick Parent
         under Your roles" — a word the card does not have, and a tick `setMyRoles` turns a student
         down for two lines above. A student is told who can change it. */
      rule(!/\bTick\b/i.test(S(mk.error)) && /@family\./.test(S(mk.error)),
        'a student\'s makeChild refusal sends them to a tick they cannot have, or not to @family.', mk.error);

      /* ---------- THE STALE ROLE: the owner changes it in the sheet, the phone asks `myProfile` --------
         The walk changed a role in the sheet and the card stayed missing until a sign-out. The phone
         asks `myProfile` once per app open; it has to carry the role the sheet holds NOW. */
      const before = post(b, { action: 'myProfile', token: min.token });
      rule(before.success && before.role === 'kid' && (before.roles || []).join() === 'kid',
        'myProfile does not say what the person is — the phone cannot correct a stale role', { role: before.role, roles: before.roles });
      setSheet(mo.person_id, 'role', 'client');
      const after = post(b, { action: 'myProfile', token: min.token });
      rule(after.role === 'parent' && (after.roles || []).indexOf('parent') !== -1 && after.tutorPending === false,
        'after the owner made the student a client in the sheet, myProfile still says ' + JSON.stringify({ role: after.role, roles: after.roles, tutorPending: after.tutorPending }));
      /* AND IT IS THE ASKER'S OWN ROW — `myProfile` naming the admin's id answers about the asker. */
      const other = post(b, { action: 'myProfile', token: min.token, personId: 'P-ADM' });
      rule(other.personId === mo.person_id && other.role !== 'admin', 'myProfile naming the admin answered with the admin\'s role', other);
    }
  }

  /* A TUTOR MAY TICK CLIENT, SO A TUTOR IS TOLD THE TICK — by the word the card prints. The card's
     labels are read from `ROLE_PICKS` in js/me.js, so a refusal and the card cannot drift apart
     again: "Parent" was the drift, and nothing could see it. */
  const LABELS = [...fs.readFileSync(path.join(__dirname, 'me.js'), 'utf8')
    .matchAll(/\[\s*'(?:tutor|client|student)'\s*,\s*'([^']+)'/g)].map(m => m[1]);
  const tia = signIn(b, 'tia@example.org', PLACE);
  if (!tia.token) no('the tutor could not sign in, so a tutor\'s makeChild refusal was NOT checked', tia);
  else {
    const n = b.tabs.people.length;
    const tk = post(b, { action: 'makeChild', token: tia.token, firstName: 'Tod', lastName: 'Tutor', pin: ZERO2 });
    const named = (S(tk.error).match(/\bTick (\w+) under Your roles/) || [])[1];
    rule(!tk.success && b.tabs.people.length === n && LABELS.length === 3 && named === LABELS[1],
      'a tutor\'s makeChild refusal names the tick ' + JSON.stringify(named) + ', and the card\'s Client tick is '
        + JSON.stringify(LABELS[1]) + ' (card labels read: ' + JSON.stringify(LABELS) + ')', tk);
  }

  /* NO ANSWER (an old phone) IS A STUDENT, AND SO IS ANY WORD BUT `parent`. */
  const old = post(b, { action: 'register', first_name: 'Ola', last_name: 'Old', email: 'ola@example.org', pin: P2 });
  rule(old.success && S(cellOf((rowOf(b, r => r.first_name === 'Ola') || {}).person_id, 'role')) === 'student', 'a register with no choice was not a student', old);
  ['admin', 'tutor', 'client, admin'].forEach((w, i) => {
    const first = ['Sly', 'Tib', 'Cam'][i];
    post(b, { action: 'register', who: w, first_name: first, last_name: 'Sneaky', email: first.toLowerCase() + '@example.org', pin: P2 });
    const r = rowOf(b, x => x.first_name === first);
    rule(r && S(r.role) === 'student', 'register with who "' + w + '" wrote role ' + JSON.stringify(r && r.role), r);
  });
  /* A PARENT WITH ONLY A GROWN-UP'S ADDRESS — refused, nothing written. */
  const n0 = b.tabs.people.length;
  const mix = post(b, { action: 'register', who: 'parent', first_name: 'Kim', last_name: 'Mix', parent_email: 'mum@example.org', pin: P2 });
  rule(!mix.success && b.tabs.people.length === n0 && /own email/.test(S(mix.error)), 'a parent account with only a grown-up\'s address was not refused before writing', mix);
}

/* EVERY ONE OF SECTION 8'S RULES WAS ASKED, or the count says which were not reached — a parent who
   could not sign in would otherwise skip the eight questions behind them and print nothing. */
const WHO_RULES = 26;
if (whoRules !== WHO_RULES && !bad.length) no('only ' + whoRules + ' of ' + WHO_RULES + ' who-the-account-is-for rules were asked');

console.log('\nWRONG  (' + bad.length + ')');
if (!bad.length) console.log('  none');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked + '   emails caught: ' + MAIL.length + '   who-the-account-is-for rules held: ' + whoRules + ' of ' + WHO_RULES);
if (bad.length) {
  console.log('FAILED — a child who cannot get in, or a classmate who can keep them out, is the whole of what the '
            + 'owner asked to be sure of: "all kids can login easily with their handle and pin".');
  process.exitCode = 1;
} else {
  console.log('OK — a child with no email gets an account from a parent or by themselves, signs in by handle and '
            + 'PIN (a 0 in front included), gets a new PIN without anybody else being able to take theirs away, '
            + 'and a parent or an admin can give them one. A parent who signs up as one is a parent from their '
            + 'first sign-in, and a student still cannot make themself one.');
}
