#!/usr/bin/env node
/* node js/check-booking-journey.js — A BOOKING WALKED END TO END as client, tutor and admin over the real backend:
   seat caps, the tutor's answer, accept/decline/withdraw, Set the room, Mark paid, the receipt. -v for detail. */
'use strict';
require('../check/quiet');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, what) => { asked++; if (!ok) bad.push(what); return !!ok; };
const b = backend();
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, last_name: 'Walktest' };
const WHO = {
  'W-PAR': ['client', 'Barnaby',  'barnaby_wt1',  'wpar@example.org', ''],
  'W-PA2': ['client', 'Cressida', 'cressida_wt2', 'wpa2@example.org', ''],
  'W-TUT': ['tutor',  'Desmond',  'desmond_wt3',  'wtut@example.org', ''],
  'W-BIG': ['tutor',  'Evadne',   'evadne_wt4',   'wbig@example.org', 4],
  'W-ADM': ['admin',  'Fenella',  'fenella_wt5',  'wadm@example.org', ''],
};
const ALL = Object.keys(WHO);
const nameOf = id => WHO[id][1] + ' Walktest';
b.seed('people', ALL.map(id => Object.assign({ person_id: id, role: WHO[id][0], first_name: WHO[id][1],
  handle: WHO[id][2], email: WHO[id][3], max_students: WHO[id][4] }, base)));
b.seed('venues', [{ venue_id: 'WV1', name: 'Walktest Library', town: 'Mitcham', cost_per_hour: 15, max_students: 3 }]);
const tk = {};
ALL.forEach(id => { const d = b.post({ action: 'verifyLogin', email: WHO[id][3], pin: '0000' }); if (d && d.success) tk[id] = d; });
if (Object.keys(tk).length !== ALL.length) {
  console.log('Only ' + Object.keys(tk).length + ' of ' + ALL.length + ' invented people could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}
const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: nameOf(pid), personId: pid }, body));
const status = (jobId, pid) => (b.ev('participantsOf(' + JSON.stringify(jobId) + ')').find(p => p.name === nameOf(pid)) || {}).status || '';
const jobCell = (jobId, col) => {
  const h = b.tabs.jobs[0], row = b.tabs.jobs.find(x => x[h.indexOf('job_id')] === jobId);
  return row ? row[h.indexOf(col)] : undefined;
};
const show = x => JSON.stringify(x).slice(0, 160);

/* THE CURRENT INTERVAL'S WEEKLY BLOCK: four Mondays from the next one, as the form sends them. */
const mondays = (() => {
  const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  const pad = v => String(v).padStart(2, '0'), out = [];
  for (let i = 0; i < 4; i++) {
    const x = new Date(d); x.setDate(d.getDate() + 7 * i);
    out.push(pad(x.getDate()) + '/' + pad(x.getMonth() + 1) + '/' + x.getFullYear());
  }
  return out;
})();
let n = 0;
const ask = (pid, o) => as(pid, Object.assign({ action: 'createJob', subject: 'Maths', level: 'GCSE, A-Level', day: 'Mon',
  time: '16:00', hours: 2, location: 'Walktest Library', interval: 'This term', dates: mondays.join(','), price: 240, n: 1,
  forceItemId: 'WJ' + (++n), requestId: 'wr-' + n, openToOthers: true }, o));

/* ---------- 1. SEAT CAPS: online holds 4, the venue its own 3, a tutor with none set holds 1. */
let r = ask('W-PAR', { location: 'Online', n: 5 });
rule(r && !r.success && /more seats than 4/.test(r.error || ''), 'five seats online were not refused at 4 — ' + show(r));
r = ask('W-PAR', { n: 4 });
rule(r && !r.success && /more seats than 3/.test(r.error || ''), 'four seats at a 3-seat venue were not refused — ' + show(r));
r = ask('W-PAR', { n: 2, requestedTutor: nameOf('W-TUT') });
rule(r && !r.success && /more seats than 1/.test(r.error || ''), 'two seats with a tutor who set no capacity were not refused at 1 — ' + show(r));
rule(b.tabs.jobs.length === 1, 'a refused booking still wrote a job row');

/* ---------- 2. A WEEKLY BLOCK WITH A NAMED TUTOR, mixed levels; the receipt is written at the asking. */
r = ask('W-PAR', { requestedTutor: nameOf('W-TUT') });
const J = (r && r.jobId) || '';
rule(r && r.success && J, 'the weekly block was not booked — ' + show(r));
rule(r && r.receiptId && !r.receiptError, 'no receipt came back with the booking — ' + show(r));
rule(String(jobCell(J, 'session_dates')).split(',').length === 4, 'the block did not keep its four dates');
rule(jobCell(J, 'level') === 'GCSE, A-Level', 'mixed levels were not kept on the booking: ' + show(jobCell(J, 'level')));
rule(status(J, 'W-PAR') === 'Waiting' && status(J, 'W-TUT') === 'Waiting', 'a fresh request is not Waiting on both sides');
const rh = b.tabs.receipts[0];
rule(b.tabs.receipts.some(x => x[rh.indexOf('job_id')] === J && x[rh.indexOf('person_id')] === 'W-PAR'),
  'the receipt was not written to the family who booked');

/* ---------- 3. THE TUTOR ANSWERS; another tutor may not answer for them. */
r = as('W-BIG', { action: 'answerRequest', jobId: J, yes: true });
rule(r && !r.success, 'another tutor answered a request that was not theirs');
r = as('W-TUT', { action: 'answerRequest', jobId: J, yes: true });
rule(r && r.success && status(J, 'W-PAR') === 'Agreed', 'the named tutor accepting did not make the family Agreed — ' + show(r));

/* ---------- 4. SET THE ROOM: the tutor may, another family may not. */
r = as('W-PA2', { action: 'setRoom', jobId: J, room: 'Room 2' });
rule(r && !r.success && jobCell(J, 'room') !== 'Room 2', 'a stranger set the room');
r = as('W-TUT', { action: 'setRoom', jobId: J, room: 'Room 1' });
rule(r && r.success && jobCell(J, 'room') === 'Room 1', 'the tutor could not set the room — ' + show(r));

/* ---------- 5. A FULL SESSION REFUSES A JOIN: the tutor holds 1 seat and it is taken. */
r = as('W-PA2', { action: 'move', jobId: J, move: 'Request', role: 'client', requestId: 'wj-1' });
rule(r && !r.success && /full/i.test(r.error || ''), 'a second family joined a tutor who holds 1 seat — ' + show(r));

/* ---------- 6. MARK PAID: the family may not, the admin may, once. */
r = as('W-PAR', { action: 'markPaid', jobId: J, how: 'cash' });
rule(r && !r.success && status(J, 'W-PAR') === 'Agreed', 'a family marked its own booking paid');
r = as('W-ADM', { action: 'markPaid', jobId: J, how: 'cash', adminName: nameOf('W-ADM') });
rule(r && r.success && status(J, 'W-PAR') === 'Booked', 'the admin could not mark it paid — ' + show(r));
r = as('W-ADM', { action: 'markPaid', jobId: J, how: 'cash', adminName: nameOf('W-ADM') });
rule(r && r.success && r.alreadyPaid, 'marking paid twice was not "already paid"');

/* ---------- 7. NO PREFERENCE: a tutor applies, the admin accepts, the family withdraws; another the admin declines. */
r = ask('W-PA2', {});
const K = (r && r.jobId) || '';
rule(r && r.success, 'a no-preference booking failed — ' + show(r));
r = as('W-BIG', { action: 'move', jobId: K, move: 'Request', role: 'tutor', requestId: 'wk-1' });
rule(r && r.success && status(K, 'W-BIG') === 'Waiting', 'a tutor could not apply to a no-preference booking — ' + show(r));
r = as('W-ADM', { action: 'move', jobId: K, move: 'Accept', role: 'client', adminName: nameOf('W-ADM'), requestId: 'wk-2' });
rule(r && r.success && status(K, 'W-PA2') === 'Agreed' && status(K, 'W-BIG') === 'Agreed', 'the admin accepting did not settle the room — ' + show(r));
r = as('W-PA2', { action: 'move', jobId: K, move: 'Withdraw', role: 'client', requestId: 'wk-3' });
rule(r && r.success && status(K, 'W-PA2') === '', 'the family could not withdraw — ' + show(r));
rule(jobCell(K, 'status') === 'cancelled', 'a booking everyone left is not cancelled: ' + show(jobCell(K, 'status')));
ask('W-PA2', { forceItemId: 'WJD' });
r = as('W-ADM', { action: 'move', jobId: 'WJD', move: 'Decline', role: 'client', adminName: nameOf('W-ADM'), requestId: 'wd-1' });
rule(r && r.success && status('WJD', 'W-PA2') === '', 'the admin declining did not clear the booking — ' + show(r));

/* ---------- 8. NO REFUND INSIDE A PAID BLOCK; a single lesson a week ahead is refunded (the next Monday can be under 24h away on a Sunday). */
const owed = (dates, at) => b.ev('refundOwedPure_(' + JSON.stringify(dates) + ', "16:00", new Date(' + at + '))');
rule(owed(mondays, Date.now()) === false, 'leaving a paid block of four was owed a refund');
rule(owed(mondays.slice(1, 2), Date.now()) === true, 'a single lesson left days ahead was not owed a refund');

if (bad.length) {
  console.log('A BOOKING DOES NOT WALK END TO END  (' + bad.length + ' of ' + asked + ')');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: a booking walks from the ask to paid as client, tutor and admin, inside its seat caps.');
