#!/usr/bin/env node
/* node js/check-pay-return.js — THE WAY BACK FROM STRIPE BOOKS ONCE, through the real createCheckout and finalizePayment over
   a fake Stripe (430). No flags; -v for the detail. Exits non-zero if an invented person cannot sign in. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, what) => { asked++; if (!ok) bad.push(what); return !!ok; };

/* A FAKE STRIPE: a session it made, and whether it says that session was paid. Every call is counted. */
const stripe = { made: 0, asked: 0, paid: {} };
const mails = [];
const b = backend({
  MailApp: { sendEmail(o) { mails.push(o); }, getRemainingDailyQuota: () => 100 },
  UrlFetchApp: { fetch(url, o) {
    const m = /checkout\/sessions\/?(.*)$/.exec(String(url));
    const reply = v => ({ getContentText: () => JSON.stringify(v), getResponseCode: () => 200 });
    if (m && o && o.method === 'post') { stripe.made++; const id = 'cs_test_' + stripe.made; return reply({ id, url: 'https://checkout.example/' + id }); }
    if (m && m[1]) { stripe.asked++; return reply({ id: m[1], payment_status: stripe.paid[m[1]] ? 'paid' : 'unpaid' }); }
    throw new Error('no network: ' + url);
  } },
});
b.props.STRIPE_TEST_KEY = 'sk_test_fake';
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, last_name: 'Paytest' };
const WHO = {
  'R-PAR': ['client',  'Barnabas', 'barnabas_pr1', 'par@example.org'],
  'R-KID': ['student', 'Ottoline', 'ottoline_pr2', 'kid@example.org'],
  'R-TUT': ['tutor',   'Desmond',  'desmond_pr3',  'tut@example.org'],
};
const ALL = Object.keys(WHO);
b.seed('people', ALL.map(id => Object.assign({ person_id: id, role: WHO[id][0], first_name: WHO[id][1],
  handle: WHO[id][2], email: WHO[id][3] }, base)));
b.seed('family', [{ link_id: 'RL1', parent_id: 'R-PAR', child_id: 'R-KID', child_typed: '', state: 'accepted' }]);
b.seed('venues', [{ venue_id: 'RV1', name: 'Paytest Library', town: 'Mitcham', cost_per_hour: 15, max_students: 4 }]);
/* AN AGREED SESSION: the parent asked, the tutor is confirmed, the business accepted — what Pay is offered on. */
b.seed('jobs', [{ job_id: 'RJ1', subject: 'Maths', level: 'GCSE', weekday: 'Mon', start_time: '16:00', venue: 'Paytest Library',
  price_total: 240, tutor_pay: 120, admin_profit: 60, max_students: 4, kind: '' }]);
b.seed('events', [
  { event_id: 'RE1', at: '01/10/2026', job_id: 'RJ1', actor: 'Barnabas Paytest', role: 'client', action: 'Request' },
  { event_id: 'RE2', at: '01/10/2026', job_id: 'RJ1', actor: 'Desmond Paytest', role: 'tutor', action: 'Request' },
  { event_id: 'RE3', at: '01/10/2026', job_id: 'RJ1', actor: 'Admin', role: 'admin', action: 'Accept', target: 'Barnabas Paytest' },
  { event_id: 'RE4', at: '01/10/2026', job_id: 'RJ1', actor: 'Admin', role: 'admin', action: 'Accept', target: 'Desmond Paytest' }]);
b.seed('receipts', [{ receipt_id: 'RR1', kind: 'session', job_id: 'RJ1', person_id: 'R-PAR', person_name: 'Barnabas Paytest',
  issued_on: '01/10/2026', total_pence: 24000, currency: 'GBP', lines: '[]' }]);

const tk = {};
ALL.forEach(id => { const d = b.post({ action: 'verifyLogin', email: WHO[id][3], pin: '0000' }); if (d && d.success) tk[id] = d; });
if (Object.keys(tk).length !== ALL.length) {
  console.log('Only ' + Object.keys(tk).length + ' of ' + ALL.length + ' invented people could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token }, body));
const confirms = () => b.tabs.events.slice(1).filter(r => r[b.tabs.events[0].indexOf('action')] === 'Confirm').length;
const statusOf = () => b.ev('participantsOf("RJ1")').find(p => p.name === 'Barnabas Paytest') || {};

/* THE SESSION MUST BE PAYABLE, or every rule below is asked of nothing. */
const before = statusOf();
if (before.status !== b.ev('BM.AGREED')) {
  console.log('The invented session is "' + before.status + '", not Agreed, so nothing could be paid for — NOTHING was checked, not a pass.');
  process.exit(1);
}

/* ---------- 1. CHECKOUT, THEN A RETURN BEFORE STRIPE SAYS PAID: refused, nothing written, and it can still finish. */
const co = as('R-PAR', { action: 'createCheckout', jobId: 'RJ1', requestId: 'pr-1' });
rule(co && co.success && /checkout\.example/.test(co.url || ''), 'createCheckout did not hand back the fake Stripe page — ' + JSON.stringify(co).slice(0, 160));
const ref = Object.keys(b.props).find(k => /^PAY-\d+-\d+$/.test(k)) || '';
if (!rule(!!ref, 'createCheckout kept no ref in Script Properties')) { report(); }
const early = as('R-PAR', { action: 'finalizePayment', ref });
rule(early && !early.success && /not been paid/i.test(early.error || ''), 'an unpaid session was not refused — ' + JSON.stringify(early).slice(0, 160));
rule(confirms() === 0, 'an unpaid return wrote ' + confirms() + ' Confirm event(s)');
rule(!!b.props[ref], 'an unpaid return threw the ref away, so the real return could never finish');

/* ---------- 2. PAID: one Confirm, Booked, the job id handed back, the ref spent. */
stripe.paid[b.props[ref + '_session']] = true;
mails.length = 0;
const first = as('R-PAR', { action: 'finalizePayment', ref });
rule(first && first.success && !first.alreadyDone, 'the paid return did not succeed — ' + JSON.stringify(first).slice(0, 160));
rule(first && first.jobId === 'RJ1', 'the paid return handed back job ' + JSON.stringify(first && first.jobId) + ', not RJ1 — the phone cannot open its receipt');
rule(confirms() === 1, 'the paid return wrote ' + confirms() + ' Confirm events, wanted 1');
rule(statusOf().status === b.ev('BM.BOOKED'), 'after paying the parent is "' + statusOf().status + '", not Booked');
rule(!b.props[ref] && !b.props[ref + '_session'], 'the ref outlived the payment it was for');
const mailed = mails.length;
rule(mailed >= 1, 'nobody was told the payment arrived');

/* ---------- 3. THE SAME RETURN AGAIN — a refresh, the back button: no second Confirm, no second mail, no second ask of Stripe. */
const asked0 = stripe.asked;
const again = as('R-PAR', { action: 'finalizePayment', ref });
rule(again && again.success && again.alreadyDone, 'a second return of a paid ref was not "already done" — ' + JSON.stringify(again).slice(0, 160));
rule(again && again.jobId === 'RJ1', 'a second return handed back job ' + JSON.stringify(again && again.jobId) + ', not RJ1');
rule(confirms() === 1, 'a second return wrote another Confirm (' + confirms() + ' now)');
rule(mails.length === mailed, 'a second return mailed again');
rule(stripe.asked === asked0, 'a second return asked Stripe again');

/* ---------- 4. THE PROPERTY DELETE LOST (a timeout after the Confirm): the Confirm event is the guard, not the property. */
b.props[ref] = JSON.stringify({ jobId: 'RJ1', payer: 'Barnabas Paytest' });
b.props[ref + '_session'] = 'cs_test_1';
const third = as('R-PAR', { action: 'finalizePayment', ref });
rule(third && third.success && third.alreadyDone && confirms() === 1, 'a ref still in Properties after its Confirm booked twice — ' + JSON.stringify(third).slice(0, 160));
rule(!b.props[ref], 'the stale ref was not cleared by the second return');

/* ---------- 5. A REF NOBODY ISSUED is not "success": the phone would say "you're booked" for a typed address. */
const typed = as('R-PAR', { action: 'finalizePayment', ref: 'PAY-1-1' });
rule(typed && !typed.success && typed.error, 'an invented ref was answered ' + JSON.stringify(typed).slice(0, 160));
rule(confirms() === 1, 'an invented ref wrote a Confirm');

/* ---------- 6. A CHILD NEVER REACHES IT (398), and nobody signed out does. */
const kid = as('R-KID', { action: 'finalizePayment', ref });
rule(kid && !kid.success && /ask yours/i.test(kid.error || '') && kid.writes === 0, 'a child\'s finalizePayment was not refused with the parent sentence — ' + JSON.stringify(kid).slice(0, 160));
const nobody = b.post({ action: 'finalizePayment', ref });
rule(nobody && !nobody.success && nobody.why === 'signed-out', 'a signed-out finalizePayment was not refused — ' + JSON.stringify(nobody).slice(0, 160));

report();
function report() {
  if (bad.length) {
    console.log('THE WAY BACK FROM STRIPE IS WRONG  (' + bad.length + ' of ' + asked + ')');
    bad.forEach(x => console.log('  ✗ ' + x));
    process.exit(1);
  }
  console.log('OK — ' + asked + ' rules: a card payment books once through finalizePayment, a refresh or a lost delete does not book twice, a typed ref, a child and nobody are refused.');
  process.exit(0);
}
