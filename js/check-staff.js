#!/usr/bin/env node
/* node js/check-staff.js — THE STAFF HUB (405), through the real doPost: the terms' version flow, pricing refusals,
   a statement that is the asker's own (any tutor's for an admin), and the terms register that is the admin's. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, why, got) => { asked++; if (!ok) bad.push(why + (got !== undefined ? ' — ' + JSON.stringify(got).slice(0, 300) : '')); };
const base = { pin: '0000', verified: 'TRUE', city: 'London', listed: 'TRUE' };
const P = (id, role, first, last, email, more) => Object.assign({ person_id: id, role, first_name: first, last_name: last,
  handle: (first + last).toLowerCase(), email }, base, more || {});

function world() {
  const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
  b.seed('people', [
    P('P-A1', 'admin', 'Hal', 'Boss', 'admin@example.org'),
    P('P-T1', 'tutor', 'Ada', 'Tutor', 'ada@example.org', { rate_per_hour: 20, extra_seat_rate: 0.5 }),
    P('P-T2', 'tutor', 'Ben', 'Teacher', 'ben@example.org', { rate_per_hour: 22 }),
    P('P-C1', 'client', 'Pat', 'Parent', 'pat@example.org'),
    P('P-W1', 'tutor, client', 'Wyn', 'Waiting', 'wyn@example.org', { listed: 'PENDING' }),
  ]);
  /* J1: Ada's, paid, three dates in October and one in November. J2: Ada's, never paid. J3: Ben's, paid. */
  b.seed('jobs', [
    { job_id: 'J1', subject: 'Maths', level: 'GCSE', hours_per_session: 1.5, venue: 'Online', price_total: 200, tutor_pay: 120,
      admin_profit: 40, session_dates: '6/10/2026, 13/10/2026, 20/10/2026, 3/11/2026', for_children: 'Kit, Lou' },
    { job_id: 'J2', subject: 'Physics', level: 'GCSE', hours_per_session: 1, venue: 'Online', price_total: 90, tutor_pay: 60,
      admin_profit: 10, session_dates: '7/10/2026, 14/10/2026' },
    { job_id: 'J3', subject: 'English', level: 'KS3', hours_per_session: 1, venue: 'Online', price_total: 50, tutor_pay: 30,
      admin_profit: 10, session_dates: '8/10/2026' },
  ]);
  const ev = (id, job, actor, role, action, target) => ({ event_id: id, at: '01/10/2026', job_id: job, actor, role, action, target: target || '' });
  b.seed('events', [
    ev('E1', 'J1', 'Ada Tutor', 'tutor', 'Request'), ev('E2', 'J1', 'Pat Parent', 'client', 'Request'),
    ev('E3', 'J1', 'Pat Parent', 'client', 'Accept', 'Ada Tutor'), ev('E4', 'J1', 'Pat Parent', 'client', 'Confirm'),
    ev('E5', 'J2', 'Ada Tutor', 'tutor', 'Request'), ev('E6', 'J2', 'Pat Parent', 'client', 'Request'),
    ev('E7', 'J3', 'Ben Teacher', 'tutor', 'Request'), ev('E8', 'J3', 'Pat Parent', 'client', 'Request'),
    ev('E9', 'J3', 'Pat Parent', 'client', 'Accept', 'Ben Teacher'), ev('E10', 'J3', 'Pat Parent', 'client', 'Confirm'),
  ]);
  const tok = {};
  ['admin', 'ada', 'ben', 'pat'].forEach(k => {
    const d = b.post({ action: 'verifyLogin', email: k + '@example.org', pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + k + ' — ' + d.error);
    tok[k] = d;
  });
  const as = (who, body) => b.post(Object.assign({ token: (tok[who] || {}).token || '', name: (tok[who] || {}).name,
    personId: (tok[who] || {}).personId }, body));
  return { b, tok, as };
}

/* ---------- 1. THE TERMS: A TICK PER VERSION ---------- */
{
  const { b, as } = world();
  const one = as('ada', { action: 'signAgreement', version: 'terms-1' });
  rule(one.success && one.version === 'terms-1' && b.row('P-T1').agreement_version === 'terms-1' && b.row('P-T1').agreement_signed_at,
    'a tutor agreeing to terms-1 was not recorded with its version and time', one);
  const again = as('ada', { action: 'signAgreement', version: 'terms-1' });
  rule(again.success && again.already && again.signedAt === one.signedAt, 'agreeing to the same version twice was not "already"', again);
  const two = as('ada', { action: 'signAgreement', version: 'terms-2' });
  rule(two.success && !two.already && two.version === 'terms-2' && b.row('P-T1').agreement_version === 'terms-2',
    'new terms (terms-2) could not be agreed to over terms-1 — a changed version must ask again', two);
  const prof = as('ada', { action: 'myProfile' });
  rule(prof.agreementVersion === 'terms-2' && !!prof.agreementSignedAt, 'myProfile does not carry the agreed version', prof);
  const none = as('ada', { action: 'signAgreement', version: '' });
  rule(!none.success, 'an agreement with no version was taken', none);
  const client = as('pat', { action: 'signAgreement', version: 'terms-2' });
  rule(!client.success && !b.row('P-C1').agreement_version, 'a client could agree to the tutor terms', client);
  /* THE REGISTER IS THE ADMIN'S. */
  const peek = as('ada', { action: 'listStaff' });
  rule(!peek.success && !peek.staff, 'a tutor was sent the terms register', peek);
  const reg = as('admin', { action: 'listStaff' });
  const ada = (reg.staff || []).find(s => s.personId === 'P-T1'), ben = (reg.staff || []).find(s => s.personId === 'P-T2');
  rule(reg.success && ada && ada.termsVersion === 'terms-2' && ben && ben.termsVersion === '' && !(reg.staff || []).some(s => s.personId === 'P-C1' || s.personId === 'P-W1'),
    'the admin\'s register does not say who agreed to which version (staff only, not a client or a waiting applicant)', reg);
}

/* ---------- 2. PRICING: THE SAVE REFUSES WHAT IS NOT A PRICE, AND TAKES ONE THAT IS ---------- */
{
  const { b, as } = world();
  const save = fields => as('ada', { action: 'updateProfile', target: 'Ada Tutor', targetId: 'P-T1', fields });
  [['abc', 'a word'], ['-5', 'a minus'], ['500', 'past the most an hour may be']].forEach(([v, why]) => {
    const d = save({ rate_per_hour: v });
    rule(!d.success && /rate/i.test(d.error || '') && String(b.row('P-T1').rate_per_hour) === '20', 'a rate of ' + why + ' (' + v + ') was saved', d);
  });
  const seat = save({ rate_per_hour: 24, extra_seat_rate: 3 });
  rule(!seat.success && String(b.row('P-T1').rate_per_hour) === '20', 'an extra seat past twice the rate was saved', seat);
  const cut = save({ extra_seat_cut: 0.1 });
  rule(!cut.success && /Only @family/.test(cut.error || ''), 'a tutor set the business\'s share of an extra seat', cut);
  const ok = save({ rate_per_hour: 24, extra_seat_rate: 0.25 });
  rule(ok.success && Number(b.row('P-T1').rate_per_hour) === 24 && Number(b.row('P-T1').extra_seat_rate) === 0.25 && b.row('P-T1').pricing_changed_at,
    'a good rate and seat (24, 0.25) were not saved through updateProfile', ok);
  const soon = save({ rate_per_hour: 26 });
  rule(!soon.success && /again on/.test(soon.error || '') && Number(b.row('P-T1').rate_per_hour) === 24, 'a second price change inside the month was saved', soon);
  b.ev('clearCache()'); b.ev('clearPayloadCache()');
  const pub = (b.get({}).tutors || []).find(t => t.personId === 'P-T1');
  rule(pub && pub.rate === 24 && pub.extraSeat === 0.25, 'the saved rate is not what the payload now sends', pub);
}

/* ---------- 3. A STATEMENT IS THE ASKER'S OWN; AN ADMIN'S IS ANYBODY'S ---------- */
{
  const { as } = world();
  const mine = as('ada', { action: 'payStatement', month: '2026-10' });
  const rows = mine.sessions || [];
  rule(mine.success && mine.tutorId === 'P-T1' && rows.length === 3 && rows.every(r => r.job === 'J1'),
    'Ada\'s October statement is not her three paid J1 sessions (the unpaid J2 and Ben\'s J3 left out)', mine);
  rule(rows[0] && rows[0].date === '2026-10-06' && rows[0].paid === 50 && rows[0].tutor === 30 && rows[0].business === 10
    && rows[0].hours === 1.5 && rows[0].students === 2, 'a session row does not share the booking over its four dates', rows[0]);
  rule(mine.totals && mine.totals.sessions === 3 && mine.totals.paid === 150 && mine.totals.tutor === 90 && mine.totals.business === 30
    && mine.totals.hours === 4.5, 'the month\'s totals are not the sum of its rows', mine.totals);
  const nov = as('ada', { action: 'payStatement', month: '2026-11' });
  rule(nov.success && (nov.sessions || []).length === 1 && nov.sessions[0].date === '2026-11-03', 'November does not hold the fourth date alone', nov);
  const peek = as('ada', { action: 'payStatement', month: '2026-10', tutorId: 'P-T2' });
  rule(!peek.success && !peek.sessions && peek.why === 'own', 'a tutor was sent another tutor\'s statement', peek);
  const ben = as('ben', { action: 'payStatement', month: '2026-10' });
  rule(ben.success && (ben.sessions || []).length === 1 && ben.sessions[0].job === 'J3', 'Ben\'s statement is not his one session', ben);
  const client = as('pat', { action: 'payStatement', month: '2026-10' });
  rule(!client.success && !client.sessions, 'a client was sent a statement', client);
  const signedOut = as('nobody', { action: 'payStatement', month: '2026-10' });
  rule(!signedOut.success && !signedOut.sessions, 'a statement went to nobody signed in', signedOut);
  const admin = as('admin', { action: 'payStatement', month: '2026-10', tutorId: 'P-T1' });
  rule(admin.success && admin.tutorId === 'P-T1' && (admin.sessions || []).length === 3, 'the admin could not read Ada\'s statement', admin);
  const notTutor = as('admin', { action: 'payStatement', month: '2026-10', tutorId: 'P-C1' });
  rule(!notTutor.success, 'a statement was made for somebody who does not teach', notTutor);
  const month = as('ada', { action: 'payStatement', month: 'October' });
  rule(!month.success, 'a month that is not YYYY-MM was taken', month);
}

/* ---------- 4. THE PHONE'S DEFAULTS MATCH THE SERVER'S ---------- */
{
  const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const phone = /const STAFF_RATE_MAX = (\d+)/.exec(read('js/staff.js'));
  const server = /const RATE_MAX = (\d+)/.exec(read('backend/constants.gs'));
  rule(phone && server && phone[1] === server[1], 'the phone\'s STAFF_RATE_MAX and the server\'s RATE_MAX differ', [phone && phone[1], server && server[1]]);
}

if (bad.length) {
  console.log('check-staff: ' + bad.length + ' of ' + asked + ' FAILED');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
console.log('check-staff: all ' + asked + ' pass — terms by version, pricing refusals, statements own-only, the register admin-only');
