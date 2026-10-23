#!/usr/bin/env node
/* node js/check-kid-prices.js — NO PRICE REACHES A CHILD, through the real doGet and doPost (398). No flags; -v for
   the detail. Exits non-zero if an invented person cannot sign in. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, what) => { asked++; if (!ok) bad.push(what); return !!ok; };
const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, last_name: 'Pricetest' };
/* id, role, first name, handle, email. `K-SP` is a student who is ALSO a parent: a parent, so she sees prices. */
const WHO = {
  'K-KID': ['student',         'Ottoline', 'ottoline_kp1', 'kid@example.org'],
  'K-PAR': ['client',          'Barnabas', 'barnabas_kp2', 'par@example.org'],
  'K-SP':  ['student, client', 'Clementine', 'clementine_kp3', 'sp@example.org'],
  'K-TUT': ['tutor',           'Desmond',  'desmond_kp4',  'tut@example.org'],
  'K-ADM': ['admin',           'Eugenia',  'eugenia_kp5',  'adm@example.org'],
};
const ALL = Object.keys(WHO);
b.seed('people', ALL.map(id => Object.assign({ person_id: id, role: WHO[id][0], first_name: WHO[id][1],
  handle: WHO[id][2], email: WHO[id][3] }, base,
  id === 'K-TUT' ? { rate_per_hour: 27, extra_seat_rate: 0.2, availability: 'sa10' } : {})));
b.seed('family', [{ link_id: 'KL1', parent_id: 'K-PAR', child_id: 'K-KID', child_typed: '', state: 'accepted' }]);
b.seed('config', [{ key: 'max_open_requests', value: 20 }, { key: 'open_tutor_rate', value: 14 },
  { key: 'waitlist_seats', value: 4 }, { key: 'waitlist_extra_seat', value: 3 }, { key: 's', value: 0.15 }]);
b.seed('venues', [{ venue_id: 'KV1', name: 'Kidtest Library', town: 'Mitcham', cost_per_hour: 15, max_students: 4 }]);
b.seed('pricing', [{ kind: 'level', label: 'GCSE', surcharge_per_hour: 2 }]);
b.seed('trips', [{ trip_id: 'KT1', name: 'Kidtest Museum', price_per_child: 12, ticket_child: 5, ticket_adult: 7,
  travel_per_child: 2, active: 'TRUE', date: '01/12/2026' }]);
/* A SESSION THE CHILD IS ON (an old booking), open to others, priced. */
b.seed('jobs', [{ job_id: 'KJ1', subject: 'Maths', level: 'GCSE', weekday: 'Mon', start_time: '16:00', venue: 'Kidtest Library',
  price_total: 240, tutor_pay: 120, admin_profit: 60, max_students: 4, open_to_others: 'TRUE', kind: '' }]);
b.seed('events', [{ event_id: 'KE1', at: '01/10/2026', job_id: 'KJ1', actor: 'Ottoline Pricetest', role: 'client', action: 'Request' },
  { event_id: 'KE2', at: '01/10/2026', job_id: 'KJ1', actor: 'Desmond Pricetest', role: 'tutor', action: 'Request' }]);
b.seed('receipts', [{ receipt_id: 'KR1', kind: 'session', job_id: 'KJ1', person_id: 'K-KID', person_name: 'Ottoline Pricetest',
  issued_on: '01/10/2026', total_pence: 24000, currency: 'GBP', lines: '[{"k":"Tutor","v":"£27.00/h"}]' }]);

const tk = {};
ALL.forEach(id => { const d = b.post({ action: 'verifyLogin', email: WHO[id][3], pin: '0000' }); if (d && d.success) tk[id] = d; });
if (Object.keys(tk).length !== ALL.length) {
  console.log('Only ' + Object.keys(tk).length + ' of ' + ALL.length + ' invented people could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: tk[pid].name, personId: pid }, body));
const get = (pid, more) => b.get(Object.assign(pid ? { token: tk[pid].token } : {}, more || {}));

/* ---------- WHAT COUNTS AS A PRICE — written here, not imported from the backend's list, so a key the
   backend forgets is still caught. The shop is coins and the business's stock, and is left out (398). */
const MONEY_KEY = /^(rate|extraSeat|extraSeatCut|bestRate|concession|price|tutorPay|adminKeeps|pricePerChild|ticketChild|ticketAdult|travelPerChild|perHour|perSession|perSeat|perSeatHour|perSeatSession|chargePerHour|hourlyWhole|baseRate|surcharge_per_hour|cost_per_hour|rate_per_hour|extra_seat_rate|extra_seat_cut|price_per_child|ticket_child|ticket_adult|travel_per_child|price_total|tutor_pay|admin_profit|total_pence|open_tutor_rate|waitlist_extra_seat)$/;
const MONEY_TABLE = /^(multipliers|pricingRows|promoCodes|waitlistSeat|receipts)$/;
const empty = v => v === '' || v == null || (Array.isArray(v) && !v.length)
  || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
function moneyIn(v, at, out) {
  out = out || [];
  if (typeof v === 'string') { if (/£\s?\d/.test(v)) out.push(at + ' = "' + v.slice(0, 60) + '"'); return out; }
  if (Array.isArray(v)) { v.forEach((x, i) => moneyIn(x, at + '[' + i + ']', out)); return out; }
  if (!v || typeof v !== 'object') return out;
  Object.keys(v).forEach(k => {
    if (k === 'shop') return;
    const x = v[k], here = at + '.' + k;
    if ((MONEY_KEY.test(k) || MONEY_TABLE.test(k)) && !empty(x)) { out.push(here + ' = ' + JSON.stringify(x).slice(0, 60)); return; }
    moneyIn(x, here, out);
  });
  return out;
}
const none = (label, v) => { const m = moneyIn(v, label); rule(!m.length, label + ' carries money: ' + m.slice(0, 4).join('; ')); };

/* ---------- THE CHILD ---------- */
const kidGet = get('K-KID');
rule((kidGet.tutors || []).some(t => t.personId === 'K-TUT'), 'the child is not sent the tutor at all — "no price" must not mean "no tutor"');
rule((kidGet.venues || []).some(v => v.title === 'Kidtest Library'), 'the child is not sent the venue');
rule((kidGet.jobs || []).some(j => j.id === 'KJ1'), 'the child is not sent her own session');
none('the child\'s doGet', kidGet);
/* A SECOND GET IS THE KEPT COPY (`payloadWithFresh_`), which goes out by `jsonRaw_` and never meets `jsonOut`. */
const kidAgain = get('K-KID');
none('the child\'s doGet (kept copy' + (kidAgain.cached ? '' : ', NOT served from the cache') + ')', kidAgain);
none('the child\'s sign-in reply', tk['K-KID']);
none('the child\'s receipts', get('K-KID', { receipts: '1' }));
none('the child\'s myProfile', as('K-KID', { action: 'myProfile' }));
none('the child\'s getProfile of the tutor', as('K-KID', { action: 'getProfile', target: 'Desmond Pricetest' }));
none('the child\'s messages', as('K-KID', { action: 'messages' }));

/* HER MONEY ACTIONS: refused with the parent sentence, nothing written. */
const ASK = /ask yours to book/i;
[['createJob', { subject: 'Maths', level: 'GCSE', location: 'Kidtest Library', price: '30', hours: 1, dates: '01/12/2026' }],
 ['createCheckout', { jobId: 'KJ1' }],
 ['joinWaitlist', { venue: 'Kidtest Library', level: 'GCSE' }],
 ['joinFestive', { offerId: 'x' }],
 ['move', { jobId: 'KJ1', move: 'Request', role: 'client' }],
 ['move', { jobId: 'KJ1', move: 'Pay', role: 'client' }]].forEach(([action, body]) => {
  const d = as('K-KID', Object.assign({ action: action, requestId: 'kp-' + action + Math.random() }, body));
  rule(d && !d.success && ASK.test(String(d.error || '')), 'a child\'s ' + action + (body.move ? ' ' + body.move : '')
    + ' was not refused with the ask-a-parent sentence — ' + JSON.stringify(d).slice(0, 160));
  rule(d && d.writes === 0, 'a child\'s refused ' + action + ' still wrote ' + (d && d.writes) + ' cell(s)');
  none('the reply to a child\'s ' + action, d);
});

/* ---------- EVERYBODY ELSE, UNCHANGED — and the proof the scan can see a price at all ---------- */
const rateFor = d => ((d.tutors || []).find(t => t.personId === 'K-TUT') || {}).rate;
[['K-PAR', 'the parent'], ['K-SP', 'a student who is also a parent'], ['K-TUT', 'the tutor'], ['K-ADM', 'the admin'], [null, 'a stranger']]
  .forEach(([pid, who]) => {
    const d = get(pid);
    rule(rateFor(d) === 27, who + ' no longer sees the tutor\'s £27/h — got ' + JSON.stringify(rateFor(d)));
    rule(moneyIn(d, 'x').length > 0, 'the money scan finds nothing in ' + who + '\'s payload, so it proves nothing about the child\'s');
  });
const par = as('K-PAR', { action: 'createJob', subject: 'Maths', level: 'GCSE', location: 'Kidtest Library', price: '30', hours: 1,
  dates: '01/12/2026', requestId: 'kp-par' });
rule(!ASK.test(String(par && par.error || '')), 'a parent\'s createJob was turned away as a child\'s — ' + JSON.stringify(par).slice(0, 160));

if (bad.length) {
  console.log('A PRICE REACHES A CHILD  (' + bad.length + ' of ' + asked + ')');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: a child is sent no rate, price or £ and her money actions ask a parent; parents, tutors, admins and strangers unchanged.');
