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

/* ==================================================================================================
   9. AN ADDRESS NOBODY HAS PROVED — it signs in, it holds no child, and its owner can always take it
   --------------------------------------------------------------------------------------------------
   THE OWNER, 6 Oct: *"dont make them have to need to verify their email to login"*, and that stays —
   every PENDING row below signs in. What the PR #130 review found is what the sign-in refusal had been
   hiding: a PIN on a self-made row proves who REGISTERED, not who owns the address. Round one held the
   mail back and ended the squatter's sessions while the row was PENDING; the review of round one found
   the squatter back in by their own PIN after Google, still in after the owner had opened the link and
   then used an emailed PIN, and a typo'd address's owner still taking the parent's child. So this is the
   design now, and each part is asked here through the real backend:
   (a) A CHILD IS TIED TO AN ACCOUNT ONLY THROUGH A CONFIRMED ADDRESS — `makeChild`, `claimChild`, a
       child's yes in `answerClaim`, a grown-up's link in `verifyEmail`, a parent's `resetPin` and an
       admin's `linkChild` each refuse while the parent is PENDING, and the parent's own doors work once
       the address is confirmed;
   (b) THE ADDRESS'S OWNER CAN ALWAYS TAKE IT BACK — the emailed PIN used ends every other session,
       PENDING or not; Google on a PENDING row ends them AND takes the registrant's PIN; opening your own
       link signs nobody out;
   (c) NOTHING BUT THE LINK AND THE FORGOTTEN-PIN PIN IS MAILED TO AN UNPROVED ADDRESS — `notify`, the
       guesses warning and a child's forgotten PIN skip a PENDING parent and a PENDING child's typed
       grown-up; an account's OWN pending address still gets its forgotten PIN;
   (d) "SEND THE LINK AGAIN" mails only the row's own pending address, a fresh link, once a quarter hour.
   ROUND THREE OF THE REVIEW found each of those stepped round by a door none of them watched, so:
   (e) A NEW ADDRESS TYPED IN SETTINGS is proved by the ACCOUNT before it is trusted — it waits beside a
       confirmed row and only that account, signed in, can open its link; a PENDING row's corrected
       address gets a fresh link and the old one (and any PIN mailed to the old address) dies;
   (f) WHEN AN ADDRESS'S OWNER TAKES A PENDING ROW BACK, the children the registrant put on it — links
       from before (a) — are `held`, and only an admin settles them; opening your own link holds none;
   (g) A SQUATTER TYPING WRONG PINS CANNOT KEEP THE OWNER OUT — the mail to an account's own address
       carries a sign-in link no miss can use up.
   ================================================================================================== */
let proofRules = 0;
{
  const rule = (ok, said, got) => { if (ok) proofRules++; else no(said, got); };
  const P1 = ['6', '2', '9', '4', '1'].join(''), P2 = ['3', '8', '1', '5'].join('');
  const famRow = (b, parent, child) => {
    const fh = b.tabs.family[0];
    const r = b.tabs.family.slice(1).find(x => x[fh.indexOf('parent_id')] === parent && x[fh.indexOf('child_id')] === child);
    return r ? Object.fromEntries(fh.map((c, i) => [c, r[i]])) : null;
  };
  const live = (b, token) => !!token && !post(b, { action: 'myProfile', token: token }).error;
  const pinOf = (b, pid) => S(rowOf(b, r => r.person_id === pid).pin);
  /* ONE MILLISECOND APART. `register` names a row 'P' + Date.now(), so two sign-ups inside one
     millisecond — which this harness does and a phone never would — are ONE PERSON to every session and
     every family link: the stranger's `resetPin` on the child was refused as "your own PIN", which
     passed the rule for the wrong reason, and only on a fast run. Measured on the unfixed backend. */
  const register = (b, body) => {
    const was = Date.now();
    while (Date.now() === was) { /* wait for the clock */ }
    return post(b, Object.assign({ action: 'register' }, body));
  };
  const PENDING = r => S(r && r.verified).toUpperCase() === 'PENDING';

  /* ---------- (a) A CHILD WAITS ON THE PARENT'S ADDRESS BEING PROVED ------------------------------------
     Jo's address is a typo, jsmith1@ for jsmith@. Seeded PENDING with a token, as `register` leaves it.
     Ned is a child put on Jo by hand before this rule existed (an accepted link to a PENDING row — the
     shape round one's `verifyEmail` and main's both wrote); Pia has an unanswered claim from Jo. */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind90' }),
      person('P-JO', 'client', 'Jo', 'Smith', { email: 'jsmith1@example.org', handle: 'jo_kind94',
                                                verified: 'PENDING', verify_token: 'Vjo-link' }),
      person('P-NED', 'student', 'Ned', 'Smith', { handle: 'ned_kind95' }),
      person('P-PIA', 'student', 'Pia', 'Smith', { email: 'pia@example.org', handle: 'pia_kind96' }),
      person('P-EVA', 'student', 'Eva', 'Exists', { email: 'eva@example.org', handle: 'eva_kind97' }),
      /* A PARENT FROM BEFORE CONFIRMATION EXISTED: `verified` blank, which is confirmed. */
      person('P-OLD', 'client', 'Ora', 'Legacy', { email: 'ora@example.org', handle: 'ora_kind91', verified: '' }),
    ]);
    b.seed('family', [{ link_id: 'L-NED', parent_id: 'P-JO', child_id: 'P-NED', state: 'accepted' },
                      { link_id: 'L-PIA', parent_id: 'P-JO', child_id: 'P-PIA', state: 'asked' }]);
    const jo = signIn(b, 'jsmith1@example.org', PLACE);
    rule(jo.success && jo.pendingEmail === 'jsmith1@example.org',
      'a PENDING parent could not sign in, or the sign-in reply does not say which address is waiting — the phone cannot draw the held card', { success: jo.success, pendingEmail: jo.pendingEmail });
    if (!jo.token) no('the PENDING parent could not sign in, so (a) was NOT checked', jo);
    else {
      const n = b.tabs.people.length, f = b.tabs.family.length, m = MAIL.length;
      const kid = post(b, { action: 'makeChild', token: jo.token, firstName: 'Lu', lastName: 'Smith', pin: ZERO });
      rule(!kid.success && kid.why === 'unconfirmed' && /jsmith1@example\.org/.test(S(kid.error))
           && b.tabs.people.length === n && b.tabs.family.length === f,
        'makeChild made a child on an account whose address nobody has proved — the typo\'s owner takes it with "Forgotten your PIN?"', kid);
      const ask = post(b, { action: 'claimChild', token: jo.token, firstName: 'Eva', lastName: 'Exists' });
      rule(!ask.success && ask.why === 'unconfirmed' && !famRow(b, 'P-JO', 'P-EVA'),
        'claimChild asked a child to join an account whose address nobody has proved', ask);
      const before = pinOf(b, 'P-NED');
      const reset = post(b, { action: 'resetPin', token: jo.token, targetId: 'P-NED' });
      rule(!reset.success && !reset.pin && pinOf(b, 'P-NED') === before,
        'a PENDING parent reset their child\'s PIN — the last step of every takeover the review found', reset);
      const pia = signIn(b, 'pia@example.org', PLACE);
      /* THE ROW NUMBER `answerClaim` IS SENT — the array index plus one, the header being row 1. */
      const claimRow = b.tabs.family.findIndex(x => x[b.tabs.family[0].indexOf('link_id')] === 'L-PIA') + 1;
      const yes = pia.token ? post(b, { action: 'answerClaim', token: pia.token, rowIndex: claimRow, accept: true }) : {};
      rule(!yes.success && S(famRow(b, 'P-JO', 'P-PIA').state) === 'asked',
        'a child\'s yes put them on an account whose address nobody has proved', yes);
      rule(!mailTo('jsmith1@example.org', m).length, 'a refused child-binding action mailed the PENDING address anyway');
      /* NOR BY AN ADMIN: the admin vouches for the person, and the account is whoever proves its address. */
      const hal = signIn(b, 'admin@example.org', PLACE);
      const byAdmin = hal.token ? post(b, { action: 'linkChild', token: hal.token, parentId: 'P-JO', childId: 'P-EVA' }) : {};
      rule(!byAdmin.success && !famRow(b, 'P-JO', 'P-EVA'), 'an admin\'s linkChild put a child on an account whose address nobody has proved', byAdmin);

      /* ONCE CONFIRMED, EVERY ONE OF THEM WORKS — the rule is the address, not the person. */
      post(b, { action: 'verifyEmail', token: 'Vjo-link' });
      const me = post(b, { action: 'myProfile', token: jo.token });
      rule(me.success && me.pendingEmail === '', 'myProfile still says the address is waiting after its link was opened', me.pendingEmail);
      const kid2 = post(b, { action: 'makeChild', token: jo.token, firstName: 'Lu', lastName: 'Smith', pin: ZERO });
      rule(kid2.success && !!kid2.handle, 'a parent whose address is confirmed could not make their child\'s account', kid2);
      const ask2 = post(b, { action: 'claimChild', token: jo.token, firstName: 'Eva', lastName: 'Exists' });
      rule(ask2.success && S((famRow(b, 'P-JO', 'P-EVA') || {}).state) === 'asked', 'a confirmed parent could not ask to add a child', ask2);
      const reset2 = post(b, { action: 'resetPin', token: jo.token, targetId: 'P-NED' });
      rule(reset2.success && !!reset2.pin, 'a confirmed parent could not give their child a new PIN', reset2);
      const yes2 = pia.token ? post(b, { action: 'answerClaim', token: pia.token, rowIndex: claimRow, accept: true }) : {};
      rule(yes2.success && S(famRow(b, 'P-JO', 'P-PIA').state) === 'accepted', 'a child could not say yes to a confirmed parent', yes2);
    }

    /* A GROWN-UP'S LINK AND A PARENT ROW SOMEBODY ELSE MADE ON THAT ADDRESS — round one's (a), kept:
       Ben names mum@, a stranger registers a parent row on mum@ first, mum opens Ben's link. */
    register(b, { first_name: 'Ben', last_name: 'Kid', parent_email: 'mum@example.org', pin: ZERO });
    register(b, { who: 'parent', first_name: 'Eve', last_name: 'Other', email: 'mum@example.org', pin: P1 });
    const ben = rowOf(b, r => r.first_name === 'Ben'), eve = rowOf(b, r => r.first_name === 'Eve');
    if (!ben || !eve || ben.person_id === eve.person_id)
      no('the child or the stranger\'s parent row was not made, or both have one id, so the link rule was NOT checked', { ben: ben && ben.person_id, eve: eve && eve.person_id });
    else {
      const ein = signIn(b, 'mum@example.org', P1);
      const link = post(b, { action: 'verifyEmail', token: ben.verify_token });
      rule(link.success && !link.linkedTo && link.parentPending === true && !famRow(b, eve.person_id, ben.person_id)
           && !PENDING(rowOf(b, r => r.first_name === 'Ben')),
        'the grown-up\'s link put the child on a parent row whose own address nobody confirmed (or did not confirm the child alone, or did not say so)', link);
      const take = ein.token ? post(b, { action: 'resetPin', token: ein.token, targetId: ben.person_id }) : { success: true };
      rule(!take.success && !take.pin && signIn(b, ben.handle, ZERO).success,
        'the PENDING parent row reset the child\'s PIN, or the child held back from it cannot sign in', take);
    }
    /* AND A LEGACY PARENT, BLANK `verified`, IS CONFIRMED — the link still puts the child on. */
    register(b, { first_name: 'Cal', last_name: 'Kid', parent_email: 'ora@example.org', pin: ZERO2 });
    const cal = rowOf(b, r => r.first_name === 'Cal');
    const calYes = cal ? post(b, { action: 'verifyEmail', token: cal.verify_token }) : {};
    rule(calYes.linkedTo === 'Ora Legacy' && !calYes.parentPending && !!famRow(b, 'P-OLD', cal && cal.person_id),
      'a parent from before confirmation existed (verified blank) was treated as pending and not given the child', calYes);
  }

  /* ---------- (b) THE SQUATTER, AND THE OWNER TAKING THE ADDRESS BACK ---------------------------------- */
  {
    const b = fresh();
    b.seed('people', [person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind92' })]);
    const m0 = MAIL.length;
    register(b, { who: 'parent', first_name: 'Sam', last_name: 'Squat', email: 'vic@example.org', pin: P1 });
    const confirm = mailTo('vic@example.org', m0)[0];
    rule(confirm && /did not make this account/.test(S(confirm.body)) && /Forgotten your PIN\?/.test(S(confirm.body)),
      'the confirmation email does not tell the address\'s owner how to take back an account they did not make', confirm && confirm.body);
    const squat = signIn(b, 'vic@example.org', P1);
    if (!live(b, squat.token)) no('the squatter could not sign in, so (b) was NOT checked', squat);
    else {
      const m1 = MAIL.length;
      post(b, { action: 'forgotPin', who: 'vic@example.org' });
      const emailed = pinIn(mailTo('vic@example.org', m1)[0]);
      rule(!!emailed, '"Forgotten your PIN?" sent nothing to a PENDING address — it is how its owner proves it and takes it back');
      const vic = emailed ? signIn(b, 'vic@example.org', emailed) : {};
      const row = rowOf(b, r => r.email === 'vic@example.org');
      rule(vic.success && !PENDING(row) && !S(row.verify_token) && vic.pendingEmail === '',
        'the emailed PIN typed back did not confirm the address it proved', { vic: vic.success, verified: row.verified, pendingEmail: vic.pendingEmail });
      rule(!live(b, squat.token) && !signIn(b, 'vic@example.org', P1).success,
        'the squatter is still in after the owner used the emailed PIN on a PENDING row — by their session or their PIN');
      rule(live(b, vic.token), 'the owner\'s own new session did not survive the sessions being ended');
    }

    /* THE ROUTE ROUND ONE LEFT OPEN: the owner opens the confirmation link FIRST. The row goes TRUE with
       the squatter still signed in (opening a link signs nobody out — that is right), and THEN she uses
       "Forgotten your PIN?". The emailed PIN must end their session whatever state the row is in now. */
    register(b, { who: 'parent', first_name: 'Sol', last_name: 'Squat', email: 'wen@example.org', pin: P1 });
    const sq2 = signIn(b, 'wen@example.org', P1);
    const wenRow = rowOf(b, r => r.email === 'wen@example.org');
    post(b, { action: 'verifyEmail', token: wenRow && wenRow.verify_token });
    if (!live(b, sq2.token) || PENDING(rowOf(b, r => r.email === 'wen@example.org')))
      no('the squatter was not signed in on a confirmed row before the owner acted, so the link-first route was NOT checked', sq2);
    else {
      const m2 = MAIL.length;
      post(b, { action: 'forgotPin', who: 'wen@example.org' });
      const emailed = pinIn(mailTo('wen@example.org', m2)[0]);
      const wen = emailed ? signIn(b, 'wen@example.org', emailed) : {};
      rule(wen.success && live(b, wen.token), 'the owner could not sign in with the emailed PIN on a confirmed row', wen);
      rule(!live(b, sq2.token), 'the squatter\'s session outlived the owner\'s emailed PIN because the link had been opened first — round one\'s open route');
      rule(!signIn(b, 'wen@example.org', P1).success, 'the squatter\'s PIN still signs in after the owner used the emailed one');
    }

    /* OPENING YOUR OWN LINK SIGNS NOBODY OUT — it is the registrant confirming their own account. */
    register(b, { who: 'parent', first_name: 'Rita', last_name: 'Real', email: 'rita@example.org', pin: P2 });
    const rita = signIn(b, 'rita@example.org', P2);
    const ritaRow = rowOf(b, r => r.first_name === 'Rita');
    post(b, { action: 'verifyEmail', token: ritaRow && ritaRow.verify_token });
    rule(!PENDING(rowOf(b, r => r.first_name === 'Rita')) && live(b, rita.token),
      'opening their own confirmation link signed the registrant out of the phone they made the account on');
  }

  /* ---------- (b) THE SAME BY GOOGLE — and the registrant's PIN goes with the sessions ------------------- */
  {
    let gmail = 'val@example.org';
    const google = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify(
      { sub: 'g-1', aud: 'cid-check', email_verified: 'true', email: gmail }) }) };
    const b = backend({ MailApp: mailApp, UrlFetchApp: google });
    b.seed('config', [{ key: 'google_client_id', value: 'cid-check' }]);
    b.seed('people', [person('P-CON', 'client', 'Cy', 'Confirmed', { email: 'cy@example.org', handle: 'cy_kind98' })]);
    register(b, { who: 'parent', first_name: 'Sid', last_name: 'Squat', email: 'val@example.org', pin: P1 });
    const squat = signIn(b, 'val@example.org', P1);
    /* A CHILD ON THE SQUATTED ROW from before the rule — Google taking it back holds them, as the PIN does. */
    const sid = rowOf(b, r => r.email === 'val@example.org');
    b.seed('people', [person('P-GKD', 'student', 'Gus', 'Kid', { handle: 'gus_kind109' })]);
    b.seed('family', [{ link_id: 'L-GKD', parent_id: sid && sid.person_id, child_id: 'P-GKD', state: 'accepted' }]);
    if (!live(b, squat.token)) no('the squatter could not sign in, so the Google half of (b) was NOT checked', squat);
    else {
      /* A PIN MAILED BEFORE GOOGLE PROVED THE ADDRESS — the squatter pressing "Forgotten your PIN?" is
         enough to put one there — goes with the registrant's PIN: the reply names Google and a FRESH one
         as the only ways in, and `googleLogin` drops it (`authResetDrop_`). Nothing else held this. */
      const m0 = MAIL.length;
      post(b, { action: 'forgotPin', who: 'val@example.org' });
      const early = mailTo('val@example.org', m0)[0];
      const earlyPin = pinIn(early), earlyLink = (S(early && early.body).match(/\?signin=(\w+)/) || [])[1] || '';
      const g = post(b, { action: 'googleLogin', credential: 'a-google-token' });
      const row = rowOf(b, r => r.email === 'val@example.org');
      rule(g.success && !PENDING(row) && g.pendingEmail === '', 'signing in with Google did not confirm the PENDING address',
        { success: g.success, error: g.error, verified: row.verified, pendingEmail: g.pendingEmail });
      rule(!live(b, squat.token), 'the squatter\'s session outlived the owner signing in with Google');
      rule(!signIn(b, 'val@example.org', P1).success,
        'the registrant\'s PIN still signs in after Google proved the address — the squatter is straight back in (review round two, A4)');
      rule(g.pinCleared === true && /PIN/.test(S(g.message)), 'the Google reply does not say the PIN the account was made with no longer works',
        { pinCleared: g.pinCleared, message: g.message });
      const gus = famRow(b, sid && sid.person_id, 'P-GKD');
      rule(gus && S(gus.state) === 'held' && g.childrenHeld === 1 && /taken off/.test(S(g.message)),
        'Google taking a PENDING row back left the registrant\'s child on it, or did not say so', { state: gus && gus.state, childrenHeld: g.childrenHeld });
      rule(live(b, g.token), 'the Google sign-in\'s own session did not survive the others being ended');
      rule(!!earlyPin && !!earlyLink && !signIn(b, 'val@example.org', earlyPin).success && !post(b, { action: 'pinLink', key: earlyLink }).success,
        'a PIN (or its link) mailed before Google took the row back still signs in afterwards', { earlyPin: !!earlyPin, earlyLink: !!earlyLink });
      /* AND A FRESH EMAILED PIN IS STILL A WAY IN — the owner is not left with Google as the only door. */
      const m = MAIL.length;
      post(b, { action: 'forgotPin', who: 'val@example.org' });
      const fresh2 = pinIn(mailTo('val@example.org', m)[0]);
      rule(!!fresh2 && signIn(b, 'val@example.org', fresh2).success, 'after Google cleared the PIN, "Forgotten your PIN?" no longer gets the owner in');
    }
    /* A CONFIRMED ROW IS LEFT ALONE: its PIN was proved, and Google must not sign its owner out elsewhere. */
    gmail = 'cy@example.org';
    const cyPhone = signIn(b, 'cy@example.org', PLACE);
    const cg = post(b, { action: 'googleLogin', credential: 'a-google-token' });
    rule(cg.success && !cg.pinCleared && live(b, cyPhone.token) && signIn(b, 'cy@example.org', PLACE).success,
      'Google on an already-confirmed account cleared its PIN or signed its owner out of their other phone',
      { success: cg.success, pinCleared: cg.pinCleared, error: cg.error });
  }

  /* ---------- (c) NOTHING BUT THE LINK AND THE FORGOTTEN-PIN PIN TO AN UNPROVED ADDRESS ---------------------
     Jo's address is the typo again, PENDING. Lu is Jo's child (a link from before the rule). Bo has no
     email and typed gran1@ for his grown-up — a typo too — and has not been confirmed; Pat is a
     confirmed parent who has Bo through an answered claim. */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind93' }),
      person('P-JO', 'client', 'Jo', 'Smith', { email: 'jsmith1@example.org', handle: 'jo_kind99',
                                                verified: 'PENDING', verify_token: 'Vjo-c' }),
      person('P-LU', 'student', 'Lu', 'Smith', { handle: 'lu_kind100' }),
      person('P-BO', 'student', 'Bo', 'Typed', { handle: 'bo_kind101', parent_email: 'gran1@example.org',
                                                 verified: 'PENDING', verify_token: 'Vbo-c' }),
      person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind102' }),
      person('P-AVA', 'student', 'Ava', 'Alone', { handle: 'ava_kind107', parent_email: 'gran2@example.org',
                                                   verified: 'PENDING', verify_token: 'Vava-c' }),
    ]);
    b.seed('family', [{ link_id: 'L-LU', parent_id: 'P-JO', child_id: 'P-LU', state: 'accepted' },
                      { link_id: 'L-BO', parent_id: 'P-PAT', child_id: 'P-BO', state: 'accepted' }]);
    /* EACH STEP COUNTED FROM ITS OWN MARK, and counted before its rule is asked (not inside an `&&`
       that may never reach it), so a break names the one path that mailed and not every rule after it. */
    let m = MAIL.length;
    const to = addr => { const n = mailTo(addr, m).length; return n; };
    const mark = () => { m = MAIL.length; };

    /* A CHILD'S HANDLE NEVER BRINGS A PENDING PARENT A PIN — variant C. */
    mark();
    const lu = post(b, { action: 'forgotPin', who: 'lu_kind100' });
    rule(!to('jsmith1@example.org') && !lu.success && lu.why === 'no-inbox',
      '"Forgotten your PIN?" on a child\'s handle mailed the child\'s PIN to a parent whose address nobody proved', lu);
    /* A PENDING CHILD WHOSE ONLY GROWN-UP IS THE TYPED ADDRESS is told that grown-up has a link to open,
       not "we have no email" — and nothing is mailed to it. */
    mark();
    const ava = post(b, { action: 'forgotPin', who: 'ava_kind107' });
    rule(!ava.success && ava.why === 'grown-up-pending' && !to('gran2@example.org'),
      'a PENDING child with only a typed grown-up was mailed there, or not told the grown-up has a link to open', ava);
    /* NOR THE GROWN-UP'S ADDRESS A PENDING CHILD TYPED — variant B. Pat, confirmed, is sent it. */
    mark();
    const bo = post(b, { action: 'forgotPin', who: 'bo_kind101' });
    rule(!to('gran1@example.org') && bo.success && to('pat@example.org') === 1,
      '"Forgotten your PIN?" for a PENDING child went to the grown-up\'s address they typed, or not to their confirmed parent', { bo, gran: to('gran1@example.org'), pat: to('pat@example.org') });
    /* AND TYPING BACK THE PIN PAT WAS SENT CONFIRMS NOTHING ABOUT BO'S ROW — it would launder gran1@. */
    const boPin = pinIn(mailTo('pat@example.org', m)[0]);
    const boIn = boPin ? signIn(b, 'bo_kind101', boPin) : {};
    const boNow = rowOf(b, r => r.person_id === 'P-BO');
    rule(boIn.success && PENDING(boNow) && S(boNow.verify_token) === 'Vbo-c',
      'a no-email child signing in with the PIN sent to their parent confirmed the child, or retired the grown-up\'s link', { verified: boNow.verified });
    /* NOR DOES PAT'S "NEW PIN" — that was `resetPin` confirming the child, which made gran1@ count. */
    const pat = signIn(b, 'pat@example.org', PLACE);
    const np = pat.token ? post(b, { action: 'resetPin', token: pat.token, targetId: 'P-BO' }) : {};
    rule(np.success && PENDING(rowOf(b, r => r.person_id === 'P-BO')),
      'a parent\'s New PIN confirmed the child, and with it the grown-up\'s address the child typed, which nobody opened', np);

    /* THE TOO-MANY-GUESSES WARNING: to neither the PENDING parent nor the PENDING child's typed grown-up. */
    mark();
    for (let i = 0; i < 11; i++) signIn(b, 'lu_kind100', '9');
    for (let i = 0; i < 11; i++) signIn(b, 'bo_kind101', '9');
    rule(!to('jsmith1@example.org') && !to('gran1@example.org') && to('pat@example.org') >= 1,
      'the too-many-guesses warning named a child\'s handle to an address nobody proved, or did not reach the confirmed parent',
      { jo: to('jsmith1@example.org'), gran: to('gran1@example.org'), pat: to('pat@example.org') });

    /* `notify` — "PIN changed" and a direct call — skips the PENDING address. */
    const jo = signIn(b, 'jsmith1@example.org', PLACE);
    mark();
    const ch = jo.token ? post(b, { action: 'changePin', token: jo.token, currentPin: PLACE, newPin: P2 }) : {};
    const said = b.ev('notify("Jo Smith", "A booking", "Tuesday at four")');
    rule(ch.success && said === false && !to('jsmith1@example.org'), '"Your PIN was changed" or notify() mailed a PENDING address', { ch, said });

    /* AND "FORGOTTEN YOUR PIN?" FOR THE PENDING ACCOUNT ITSELF STILL GOES — the owner's way back. */
    mark();
    const own = post(b, { action: 'forgotPin', who: 'jsmith1@example.org' });
    rule(own.success && to('jsmith1@example.org') === 1, '"Forgotten your PIN?" stopped reaching an account\'s own PENDING address', own);

    /* CONFIRMED, THE SAME MAILS GO — the rule is the address. Bo's grown-up opens Bo's link. */
    post(b, { action: 'verifyEmail', token: 'Vjo-c' });
    post(b, { action: 'verifyEmail', token: 'Vbo-c' });
    rule(b.ev('notify("Jo Smith", "A booking", "Tuesday at four")') === true, 'notify() refused an address once it was confirmed');
    mark();
    post(b, { action: 'forgotPin', who: 'bo_kind101' });
    rule(to('gran1@example.org') === 1, 'once the grown-up opened the child\'s link, a forgotten PIN still does not reach them');
  }

  /* ---------- (d) "SEND THE LINK AGAIN" ------------------------------------------------------------------ */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind103' }),
      person('P-KAY', 'client', 'Kay', 'Waiting', { email: 'kay@example.org', handle: 'kay_kind104',
                                                    verified: 'PENDING', verify_token: 'Vkay-old' }),
      person('P-ROY', 'client', 'Roy', 'Done', { email: 'roy@example.org', handle: 'roy_kind105' }),
      person('P-KID', 'student', 'Kit', 'Nomail', { handle: 'kit_kind106', parent_email: 'gran@example.org',
                                                    verified: 'PENDING', verify_token: 'Vkit-old' }),
    ]);
    const kay = signIn(b, 'kay@example.org', PLACE), roy = signIn(b, 'roy@example.org', PLACE), kit = signIn(b, 'kit_kind106', PLACE);
    if (!kay.token || !roy.token || !kit.token) no('somebody could not sign in, so "Send the link again" was NOT checked', { kay, roy, kit });
    else {
      let m = MAIL.length;
      /* WHATEVER THE REQUEST NAMES, it goes to the row the token is — and only to its own address. */
      const one = post(b, { action: 'resendLink', token: kay.token, personId: 'P-ROY', email: 'roy@example.org', to: 'roy@example.org' });
      const sent = MAIL.slice(m);
      const now = rowOf(b, r => r.person_id === 'P-KAY');
      rule(one.success && sent.length === 1 && S(sent[0].to) === 'kay@example.org',
        '"Send the link again" mailed somewhere other than the row\'s own pending address, or more than once', sent.map(x => x.to));
      rule(S(now.verify_token) && S(now.verify_token) !== 'Vkay-old' && sent[0] && S(sent[0].body).indexOf('?verify=' + S(now.verify_token)) !== -1,
        'the link sent again is not a fresh token written to the row', { token: now.verify_token });
      rule(sent[0] && /did not make this account/.test(S(sent[0].body)) && /Make your child's account/.test(S(sent[0].body)),
        'the link sent again does not say what the first one did (the takeover line, the parent\'s next step)');
      const oldLink = post(b, { action: 'verifyEmail', token: 'Vkay-old' });
      rule(!oldLink.success && PENDING(rowOf(b, r => r.person_id === 'P-KAY')), 'the link from before "Send the link again" still confirms the address', oldLink);
      /* ONE A QUARTER OF AN HOUR. */
      m = MAIL.length;
      const two = post(b, { action: 'resendLink', token: kay.token });
      rule(two.success && two.why === 'already-sent' && MAIL.length === m, 'a second press inside the quarter hour sent another link', two);
      /* NOTHING TO A CONFIRMED ROW, AND NOTHING FROM A CHILD WITH NO ADDRESS OF THEIR OWN. */
      m = MAIL.length;
      const done = post(b, { action: 'resendLink', token: roy.token });
      const kidAsk = post(b, { action: 'resendLink', token: kit.token });
      const anon = post(b, { action: 'resendLink', personId: 'P-KAY' });
      rule(MAIL.length === m && done.why === 'confirmed' && !kidAsk.success && !anon.success,
        '"Send the link again" mailed a confirmed row, a child\'s grown-up, or answered with nobody signed in', { done, kidAsk, anon, mailed: MAIL.slice(m).map(x => x.to) });
      /* AND THE NEW LINK WORKS. */
      const yes = post(b, { action: 'verifyEmail', token: S(now.verify_token) });
      rule(yes.success && !PENDING(rowOf(b, r => r.person_id === 'P-KAY')), 'the link sent again does not confirm the address', yes);
    }
  }

  /* ---------- (e) A NEW ADDRESS TYPED IN SETTINGS IS PROVED BY THE ACCOUNT BEFORE IT IS TRUSTED ------------
     Round three of the review, older than every round: Settings → Contact → email wrote the address
     straight in and left `verified` as it was. Jo is CONFIRMED on jsmith@ with Lu on her account; she
     types jsmith1@. Measured on round two's backend: the row kept TRUE, `notify` mailed jsmith1@, its
     owner's "Forgotten your PIN?" got Jo's account and `resetPin` handed them Lu. Now the new address
     waits beside the row (`authMove*_`), and only Jo, signed in, can open its link. */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind110' }),
      person('P-JO', 'client', 'Jo', 'Smith', { email: 'jsmith@example.org', handle: 'jo_kind111' }),
      person('P-LU', 'student', 'Lu', 'Smith', { handle: 'lu_kind112' }),
      person('P-STR', 'client', 'Stu', 'Ranger', { email: 'stu@example.org', handle: 'stu_kind113' }),
      /* PENDING ON AN ADDRESS OF ITS OWN, with a forgotten PIN already mailed there — block D. */
      person('P-KAY', 'client', 'Kay', 'Typo', { email: 'kay1@example.org', handle: 'kay_kind114',
                                                 verified: 'PENDING', verify_token: 'Vkay-e' }),
    ]);
    b.seed('family', [{ link_id: 'L-LU', parent_id: 'P-JO', child_id: 'P-LU', state: 'accepted' }]);
    const jo = signIn(b, 'jsmith@example.org', PLACE);
    if (!jo.token) no('Jo could not sign in, so (e) was NOT checked', jo);
    else {
      let m = MAIL.length;
      const save = post(b, { action: 'updateProfile', token: jo.token, targetId: 'P-JO', fields: { email: 'jsmith1@example.org' } });
      const row = rowOf(b, r => r.person_id === 'P-JO');
      const sent = MAIL.slice(m);
      rule(save.success && row.email === 'jsmith@example.org' && !PENDING(row) && save.movingEmail === 'jsmith1@example.org'
           && save.profile && save.profile.email_moving === 'jsmith1@example.org',
        'a new address typed in Settings went straight onto a confirmed row, or the reply does not say it is waiting',
        { success: save.success, error: save.error, email: row.email, verified: row.verified, moving: save.movingEmail });
      rule(sent.length === 1 && S(sent[0].to) === 'jsmith1@example.org' && /\?verify=M/.test(S(sent[0].body))
           && !/Jo|Smith|jo_kind111/.test(S(sent[0].body)),
        'the new address was not sent exactly one link, or the link names the account to an inbox nobody has proved',
        sent.map(x => ({ to: x.to, body: x.body })));
      /* NOTHING ELSE REACHES THE TYPO: not notify, not "Forgotten your PIN?", not Google. */
      m = MAIL.length;
      const said = b.ev('notify("Jo Smith", "A booking", "Tuesday at four")');
      const fp = post(b, { action: 'forgotPin', who: 'jsmith1@example.org' });
      rule(said === true && mailTo('jsmith@example.org', m).length === 1 && !mailTo('jsmith1@example.org', m).length && !fp.success,
        'a notice or a forgotten PIN reached the new address before it was proved, or the proved one stopped getting notices',
        { said, fp, mailed: MAIL.slice(m).map(x => x.to) });
      /* A SAVE OF THE SAME PAGE AGAIN posts the waiting address again: no second mail. */
      m = MAIL.length;
      const again = post(b, { action: 'updateProfile', token: jo.token, targetId: 'P-JO', fields: { email: 'jsmith1@example.org', phone_no: '' } });
      rule(again.success && MAIL.length === m, 'saving the Contact page again mailed the waiting address again', { again, mailed: MAIL.slice(m).map(x => x.to) });
      /* "SEND THE LINK AGAIN" FOR A WAITING ADDRESS: its quarter hour counts from the Save that sent the
         first, then a FRESH link to the waiting address only, and the first link stops working. */
      const soon = post(b, { action: 'resendLink', token: jo.token });
      b.props['AUTH_LINK_P-JO'] = String(Date.now() - 20 * 60000);
      m = MAIL.length;
      const re = post(b, { action: 'resendLink', token: jo.token });
      const reMail = MAIL.slice(m);
      const first = (S(sent[0] && sent[0].body).match(/\?verify=(M\w+)/) || [])[1] || '';
      const key = (S(reMail[0] && reMail[0].body).match(/\?verify=(M\w+)/) || [])[1] || '';
      rule(soon.why === 'already-sent' && re.success && re.movingEmail === 'jsmith1@example.org'
           && reMail.length === 1 && S(reMail[0].to) === 'jsmith1@example.org' && !!key && key !== first
           && !post(b, { action: 'verifyEmail', token: first, session: jo.token }).success,
        '"Send the link again" for a waiting address was not throttled from the Save, went elsewhere, or left the first link working',
        { soon, re, mailed: reMail.map(x => x.to) });
      /* THE LINK, OPENED BY WHOEVER OWNS jsmith1@ — not signed in, or signed in as somebody else. */
      const bare = post(b, { action: 'verifyEmail', token: key });
      const stu = signIn(b, 'stu@example.org', PLACE);
      const other = post(b, { action: 'verifyEmail', token: key, session: stu.token });
      const still = rowOf(b, r => r.person_id === 'P-JO');
      rule(!bare.success && bare.why === 'sign-in-first' && !other.success && still.email === 'jsmith@example.org',
        'the new address\'s link moved the account for somebody not signed in to it — the typo\'s owner takes it', { bare, other, email: still.email });
      /* THE ACCOUNT'S OWN PARENT DOOR STILL WORKS THROUGHOUT — nothing proved was taken away. */
      const np = post(b, { action: 'resetPin', token: jo.token, targetId: 'P-LU' });
      rule(np.success && !!np.pin, 'a confirmed parent who typed a new address lost their child\'s New PIN while it waits', np);
      /* AND JO, SIGNED IN, MOVES IT. */
      const mine = post(b, { action: 'verifyEmail', token: key, session: jo.token });
      const moved = rowOf(b, r => r.person_id === 'P-JO');
      rule(mine.success && mine.moved && moved.email === 'jsmith1@example.org' && !PENDING(moved) && live(b, jo.token),
        'the account, signed in, could not finish moving to its new address (or was signed out by it)', { mine, email: moved.email });
      rule(!post(b, { action: 'verifyEmail', token: key, session: jo.token }).success, 'the move link worked twice');
      /* TYPING THE OLD ADDRESS BACK, while one waits, keeps the old one and kills the link. */
      post(b, { action: 'updateProfile', token: jo.token, targetId: 'P-JO', fields: { email: 'jo.new@example.org' } });
      const k2 = (S((mailTo('jo.new@example.org').slice(-1)[0] || {}).body).match(/\?verify=(M\w+)/) || [])[1] || '';
      const keep = post(b, { action: 'updateProfile', token: jo.token, targetId: 'P-JO', fields: { email: 'JSMITH1@example.org' } });
      const dead = post(b, { action: 'verifyEmail', token: k2, session: jo.token });
      rule(!!k2 && keep.success && !(keep.profile || {}).email_moving && !dead.success && rowOf(b, r => r.person_id === 'P-JO').email === 'jsmith1@example.org',
        'typing the current address back did not cancel the waiting one', { k2: !!k2, keep, dead });
      /* AN ADDRESS SOMEBODY ELSE HAS TAKEN WHILE IT WAITED is refused at the link, not put on two rows. */
      post(b, { action: 'updateProfile', token: jo.token, targetId: 'P-JO', fields: { email: 'jo.clash@example.org' } });
      const k3 = (S((mailTo('jo.clash@example.org').slice(-1)[0] || {}).body).match(/\?verify=(M\w+)/) || [])[1] || '';
      register(b, { who: 'parent', first_name: 'Cla', last_name: 'Sh', email: 'jo.clash@example.org', pin: P2 });
      const clash = k3 ? post(b, { action: 'verifyEmail', token: k3, session: jo.token }) : { success: true };
      rule(!!k3 && !clash.success && rowOf(b, r => r.person_id === 'P-JO').email === 'jsmith1@example.org'
           && b.tabs.people.slice(1).filter(x => x[b.tabs.people[0].indexOf('email')] === 'jo.clash@example.org').length === 1,
        'a waiting address that another account took in the meantime was moved onto this one as well', clash);
      /* AN ADMIN TYPING SOMEBODY'S ADDRESS IS HELD THE SAME — the classic typo, and the person proves it. */
      const hal = signIn(b, 'admin@example.org', PLACE);
      const byAdmin = hal.token ? post(b, { action: 'updateProfile', token: hal.token, targetId: 'P-STR', fields: { email: 'stu2@example.org' } }) : {};
      rule(byAdmin.success && rowOf(b, r => r.person_id === 'P-STR').email === 'stu@example.org' && byAdmin.movingEmail === 'stu2@example.org',
        'an admin\'s edit put an unproved address straight onto somebody\'s confirmed row', byAdmin);
    }

    /* BLOCK D: A PENDING ROW CORRECTED. Nothing on it was proved, so the address is simply replaced — and
       the old link, mailed to the old address, must not confirm the row holding the new one. Nor may a
       PIN mailed to the old address still open it. */
    const kay = signIn(b, 'kay1@example.org', PLACE);
    post(b, { action: 'forgotPin', who: 'kay1@example.org' });
    const oldPin = pinIn(mailTo('kay1@example.org').slice(-1)[0]);
    let m = MAIL.length;
    const fix = kay.token ? post(b, { action: 'updateProfile', token: kay.token, targetId: 'P-KAY', fields: { email: 'kay@example.org' } }) : {};
    const k = rowOf(b, r => r.person_id === 'P-KAY');
    const fixMail = MAIL.slice(m);
    rule(fix.success && k.email === 'kay@example.org' && PENDING(k) && S(k.verify_token) && S(k.verify_token) !== 'Vkay-e'
         && fixMail.length === 1 && S(fixMail[0].to) === 'kay@example.org' && S(fixMail[0].body).indexOf('?verify=' + S(k.verify_token)) !== -1,
      'a PENDING row\'s corrected address kept the old link, or was not sent a fresh one', { fix, verified: k.verified, token: k.verify_token, mailed: fixMail.map(x => x.to) });
    const oldLink = post(b, { action: 'verifyEmail', token: 'Vkay-e' });
    rule(!oldLink.success && PENDING(rowOf(b, r => r.person_id === 'P-KAY')),
      'the link mailed to the OLD address confirmed the row while it holds the new one (review round three, block D)', oldLink);
    rule(!!oldPin && !signIn(b, 'kay@example.org', oldPin).success,
      'a PIN mailed to the address the row has since left still signs in to it', { oldPin: !!oldPin });
  }

  /* ---------- (f) LINKS MADE BEFORE THE RULE GO TO `held` WHEN THE ADDRESS'S OWNER TAKES THE ROW BACK ----------
     Round three: Jo PENDING on the typo jsmith1@ with Ned accepted (a link from before `confirmFirst_`)
     and a claim to Pia unanswered. The stranger who owns jsmith1@ presses "Forgotten your PIN?", types
     the PIN back, and the row is confirmed — measured on round two: resetPin on Ned, signed in as Ned. */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind120' }),
      person('P-JO', 'client', 'Jo', 'Smith', { email: 'jsmith1@example.org', handle: 'jo_kind121',
                                                verified: 'PENDING', verify_token: 'Vjo-f' }),
      /* NED MADE HIS OWN ACCOUNT WITH jsmith1@ AS HIS GROWN-UP'S, and that link has not been opened. */
      person('P-NED', 'student', 'Ned', 'Smith', { handle: 'ned_kind122', parent_email: 'jsmith1@example.org',
                                                   verified: 'PENDING', verify_token: 'Vned-f' }),
      person('P-PIA', 'student', 'Pia', 'Smith', { email: 'pia@example.org', handle: 'pia_kind123' }),
      person('P-RAY', 'client', 'Ray', 'Real', { email: 'ray@example.org', handle: 'ray_kind124',
                                                 verified: 'PENDING', verify_token: 'Vray-f' }),
      person('P-ROB', 'student', 'Rob', 'Real', { handle: 'rob_kind125' }),
    ]);
    b.seed('family', [{ link_id: 'L-NED', parent_id: 'P-JO', child_id: 'P-NED', state: 'accepted' },
                      { link_id: 'L-PIA', parent_id: 'P-JO', child_id: 'P-PIA', state: 'asked' },
                      { link_id: 'L-ROB', parent_id: 'P-RAY', child_id: 'P-ROB', state: 'accepted' }]);
    const m = MAIL.length;
    post(b, { action: 'forgotPin', who: 'jsmith1@example.org' });
    const pin = pinIn(mailTo('jsmith1@example.org', m)[0]);
    const stranger = pin ? signIn(b, 'jsmith1@example.org', pin) : {};
    if (!stranger.token) no('the typo\'s owner could not sign in with the emailed PIN, so (f) was NOT checked', stranger);
    else {
      const ned = famRow(b, 'P-JO', 'P-NED'), pia = famRow(b, 'P-JO', 'P-PIA');
      rule(S(ned.state) === 'held' && S(pia.state) === 'held' && stranger.childrenHeld === 2 && /taken off/.test(S(stranger.message)),
        'taking a PENDING row back left the registrant\'s children (or their unanswered claim) on it, or did not say so',
        { ned: ned.state, pia: pia.state, childrenHeld: stranger.childrenHeld, message: stranger.message });
      const before = pinOf(b, 'P-NED');
      const take = post(b, { action: 'resetPin', token: stranger.token, targetId: 'P-NED' });
      rule(!take.success && pinOf(b, 'P-NED') === before, 'the typo\'s owner reset the PIN of a child the registrant had put on the account', take);
      const piaIn = signIn(b, 'pia@example.org', PLACE);
      const claimRow = b.tabs.family.findIndex(x => x[b.tabs.family[0].indexOf('link_id')] === 'L-PIA') + 1;
      const yes = piaIn.token ? post(b, { action: 'answerClaim', token: piaIn.token, rowIndex: claimRow, accept: true }) : {};
      const ask = post(b, { action: 'claimChild', token: stranger.token, firstName: 'Ned', lastName: 'Smith' });
      /* AND NOT BY THE CHILD'S OWN LINK EITHER, which the typo's owner holds: it confirms Ned and links nothing. */
      const nedLink = post(b, { action: 'verifyEmail', token: 'Vned-f' });
      rule(!yes.success && !ask.success && nedLink.success && !nedLink.linkedTo
           && S(famRow(b, 'P-JO', 'P-PIA').state) === 'held' && S(famRow(b, 'P-JO', 'P-NED').state) === 'held',
        'a held link was turned back into a link by the child\'s yes, the new owner asking again, or the child\'s grown-up link', { yes, ask, nedLink });
      /* ONLY AN ADMIN SETTLES IT. */
      const hal = signIn(b, 'admin@example.org', PLACE);
      const settle = hal.token ? post(b, { action: 'linkChild', token: hal.token, parentId: 'P-JO', childId: 'P-NED' }) : {};
      rule(settle.success && S(famRow(b, 'P-JO', 'P-NED').state) === 'accepted', 'an admin could not settle a held link', settle);
    }
    /* THE REGISTRANT OPENING THEIR OWN LINK HOLDS NOTHING — the ordinary way a parent is confirmed. */
    post(b, { action: 'verifyEmail', token: 'Vray-f' });
    rule(S(famRow(b, 'P-RAY', 'P-ROB').state) === 'accepted' && !PENDING(rowOf(b, r => r.person_id === 'P-RAY')),
      'opening your own confirmation link took your child off your account');
  }

  /* ---------- (g) A SQUATTER TYPING WRONG PINS CANNOT KEEP THE OWNER OUT ----------------------------------------
     Round three: the squatter keeps their session and types wrong PINs at the address — eleven lock
     it, five more used to throw away the PIN Vic had just been mailed, for every new one she asked
     for. The typed PIN is still retired (a guesser gets five), and the link in the same mail is not. */
  {
    const b = fresh();
    b.seed('people', [
      person('P-ADM', 'admin', 'Hal', 'Admin', { email: 'admin@example.org', handle: 'hal_kind130' }),
      person('P-PAT', 'client', 'Pat', 'Parent', { email: 'pat@example.org', handle: 'pat_kind131' }),
      person('P-KIT', 'student', 'Kit', 'Parent', { handle: 'kit_kind132' }),
    ]);
    b.seed('family', [{ link_id: 'L-KIT', parent_id: 'P-PAT', child_id: 'P-KIT', state: 'accepted' }]);
    register(b, { who: 'parent', first_name: 'Sam', last_name: 'Squat', email: 'vic@example.org', pin: P1 });
    const squat = signIn(b, 'vic@example.org', P1);
    let m = MAIL.length;
    post(b, { action: 'forgotPin', who: 'vic@example.org' });
    const mail = mailTo('vic@example.org', m)[0];
    const emailed = pinIn(mail);
    const link = (S(mail && mail.body).match(/\?signin=(\w+)/) || [])[1] || '';
    rule(!!emailed && !!link, 'the forgotten-PIN mail to an account\'s own address carries no sign-in link', mail && mail.body);
    /* ELEVEN TO LOCK IT AND FIVE MORE AT THE EMAILED PIN, with a few over, as the review typed them. */
    for (let i = 0; i < 20; i++) signIn(b, 'vic@example.org', '9');
    const typed = emailed ? signIn(b, 'vic@example.org', emailed) : {};
    rule(!typed.success && /sign-in link/.test(S(typed.error)),
      'the typed PIN survived twenty wrong tries (past a guesser\'s budget), or the owner refused is not pointed at the link', typed);
    /* A KEY THAT WAS NEVER SENT, tried while a real one waits, opens nothing and spends nothing. */
    const forged = link ? post(b, { action: 'pinLink', key: link.slice(0, -1) + (link.slice(-1) === 'a' ? 'b' : 'a') }) : { success: true };
    const vic = link ? post(b, { action: 'pinLink', key: link }) : {};
    const row = rowOf(b, r => r.email === 'vic@example.org');
    rule(vic.success && live(b, vic.token) && !live(b, squat.token) && !PENDING(row),
      'the link in the mail did not get the owner in past the squatter\'s wrong PINs, or left the squatter in',
      { vic: vic.success, error: vic.error, squatterIn: live(b, squat.token), verified: row && row.verified });
    rule(!signIn(b, 'vic@example.org', P1).success && signIn(b, 'vic@example.org', emailed).success,
      'after the link, the squatter\'s PIN still works or the mailed PIN is not the PIN');
    rule(!forged.success && !post(b, { action: 'pinLink', key: link }).success,
      'a key that was never sent signed in while a real one waited, or a sign-in link worked twice', forged);
    /* A LINK TO AN ADDRESS THE ROW HAS SINCE LEFT OPENS NOTHING — here the address changed by hand in the
       sheet, the one way round `updateProfile`, which drops the mailed PIN itself. */
    b.seed('people', [person('P-UNA', 'client', 'Una', 'Moved', { email: 'una@example.org', handle: 'una_kind133' })]);
    m = MAIL.length;
    post(b, { action: 'forgotPin', who: 'una@example.org' });
    const unaLink = (S((mailTo('una@example.org', m)[0] || {}).body).match(/\?signin=(\w+)/) || [])[1] || '';
    const ph = b.tabs.people[0], ur = b.tabs.people.find(x => x[ph.indexOf('person_id')] === 'P-UNA');
    if (ur) ur[ph.indexOf('email')] = 'una.new@example.org';
    const una = unaLink ? post(b, { action: 'pinLink', key: unaLink }) : { success: true };
    rule(!!unaLink && !una.success, 'a sign-in link mailed to an address the account has since left still signed in to it', una);
    /* A CHILD'S PIN MAILED TO THEIR GROWN-UP CARRIES NO LINK — it would sign the grown-up's phone in as the child. */
    m = MAIL.length;
    post(b, { action: 'forgotPin', who: 'kit_kind132' });
    const kitMail = mailTo('pat@example.org', m)[0];
    rule(!!pinIn(kitMail) && !/\?signin=/.test(S(kitMail && kitMail.body)), 'a child\'s forgotten PIN, mailed to a grown-up, carried a sign-in link', kitMail && kitMail.body);
  }
}
const PROOF_RULES = 77;
if (proofRules !== PROOF_RULES && !bad.length) no('only ' + proofRules + ' of ' + PROOF_RULES + ' unproved-address rules were asked');

console.log('\nWRONG  (' + bad.length + ')');
if (!bad.length) console.log('  none');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked + '   emails caught: ' + MAIL.length + '   who-the-account-is-for rules held: ' + whoRules + ' of ' + WHO_RULES
          + '   unproved-address rules held: ' + proofRules + ' of ' + PROOF_RULES);
if (bad.length) {
  console.log('FAILED — a child who cannot get in, or a classmate who can keep them out, is the whole of what the '
            + 'owner asked to be sure of: "all kids can login easily with their handle and pin".');
  process.exitCode = 1;
} else {
  console.log('OK — a child with no email gets an account from a parent or by themselves, signs in by handle and '
            + 'PIN (a 0 in front included), gets a new PIN without anybody else being able to take theirs away, '
            + 'and a parent or an admin can give them one. A parent who signs up as one is a parent from their '
            + 'first sign-in, and a student still cannot make themself one. An address nobody has proved signs in '
            + 'and holds no child until it is proved, is mailed nothing but its link and its own forgotten PIN, '
            + 'and its owner can always take it back: the emailed PIN, its link or Google signs everybody else out '
            + 'and holds the children the registrant put on it. A new address typed in Settings is proved by the '
            + 'account, signed in, before anything is trusted to it.');
}
