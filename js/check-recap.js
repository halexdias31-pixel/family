#!/usr/bin/env node
/* ==================================================================================================
   node js/check-recap.js — THE EMAIL AFTER A SESSION, ASKED OF THE REAL BACKEND WHILE IT IS SWITCHED OFF

   ASKED FOR AS *"like 2 hours after the end of each session is done it will send an automated email to
   them of the questions they got done."* Nothing has ever sent one, which is why it is checked: the
   first real run is an evening with families on the other end, and every rule below fails by emailing
   — too early, about the wrong child, to the wrong parent, twice, or about a lesson nobody paid for.

     · DUE IS LONDON'S CLOCK. Two hours after the end, in BST and in GMT and on the day the clocks go
       back; a session ending at 22:00 is due at midnight and still says the day it was on.
     · A START NOBODY KNOWS FOR THAT DATE IS THE LATEST IT COULD BE — a multi-day booking stores one
       start, and using it on the other day sends during the lesson.
     · NO BACKFILL. Only inside 24 hours of due; switching on cannot email about last week.
     · ONLY BOOKED SEATS, and children resolved through the booking family's own accepted links —
       never a search of the people tab, never another family's child of the same name.
     · ONLY THAT DAY'S QUESTIONS, a practical once, nothing unsafe and no raw key printed.
     · NOTHING DONE IS NO EMAIL, and a note saying whose account the questions went on instead.
     · THE WEEKLY EMAIL'S PARENTS, THIS EMAIL'S OPT-OUT (`session_email`, not `weekly_email`).
     · OFF NOTHING, PREVIEW THE LOG, SEND ONCE — through the shared `digestMail_`, never under the lock,
       never before the receipt — and a run that did not finish throws.
     · A MISSING `attempts` OR `recap_log` TAB IS AN ERROR ONCE SOMETHING IS DUE, NEVER A QUIET DAY.
     · ONE HOURLY TRIGGER, BOOKED BY NOBODY BUT THE OWNER. THE PREVIEW AN ADMIN'S, AND A READ.

   THROUGH THE REAL BACKEND on `check-mail-load.js` (MailApp, ScriptApp, the lock and a London clock
   stubbed over `check-gas-load.js`), receipts looked for on `recap_log`. The people are invented —
   Ada and Ben Pupil, Pat and Pam Parent, Sam Tutor — their addresses are example.org, and every PIN
   is 0000. One of them is a second "Ada Pupil" in another family, put FIRST on the people tab, so a
   name looked up across the whole tab finds her and not ours.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { world, cfgSet, rowsOf, at, REPO, strip, calls, mentions } = require('./check-mail-load.js');

const bad = [];
let asked = 0;
const worlds = [];

/* ---------- THE PEOPLE, THE FAMILIES, ONE BOOKING AND A FEW DAYS OF WORK --------------------------------
   J-1 IS MATHS ON TUESDAYS, 16:00 FOR TWO HOURS, booked by Pat for Ada (and "Someone else"), Sam
   agreed, Pat paid. On Tue 6 Oct 2026 (BST) it ends at 18:00 London and the email is due at 20:00 —
   19:00 UTC. Ada did three things that day: one new, one first done on 29 Sep and done again, and a
   practical's worksheet in two boxes. Around it: a question on the Monday, one on the Wednesday, and
   one on 29 Sep, an earlier session's day. */
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
const P = (id, first, last, role, email, extra) => Object.assign({ person_id: id, first_name: first, last_name: last,
  handle: (first + last).toLowerCase(), email: email || '', role: role }, base, extra || {});
const PEOPLE = [
  P('P-S9', 'Ada', 'Pupil', 'student', 's9@example.org', { handle: 'adapupil9' }),   // ANOTHER family's Ada, first
  P('P-A1', 'Hal', 'Admin', 'admin', 'a1@example.org'),
  P('P-S1', 'Ada', 'Pupil', 'student', 's1@example.org'),
  P('P-S2', 'Ben', 'Pupil', 'student', 's2@example.org'),
  P('P-S3', 'Cal', 'Alone', 'student', 's3@example.org'),
  P('P-C1', 'Pat', 'Parent', 'client', 'pat@example.org'),
  P('P-C2', 'Pam', 'Parent', 'client', 'pam@example.org', { session_email: 'no' }),
  P('P-C3', 'Peg', 'Pending', 'client', 'peg@example.org'),
  P('P-C4', 'Rex', 'Refused', 'client', 'rex@example.org'),
  P('P-C8', 'Quin', 'Typo', 'client', 'quin.tpyo@example.org', { verified: 'PENDING' }),
  P('P-C5', 'Bo', 'Other', 'client', 'bo@example.org'),
  P('P-C9', 'Ola', 'Other', 'client', 'ola@example.org'),
  P('P-T1', 'Sam', 'Tutor', 'tutor', 'sam@example.org'),
];
const L = (n, parent, child, state) => ({ link_id: 'L' + n, parent_id: parent, child_id: child, child_typed: '', state: state });
const FAMILY = [
  L(1, 'P-C1', 'P-S1', 'accepted'),
  L(2, 'P-C2', 'P-S1', 'accepted'),     // opted out of this email
  L(3, 'P-C3', 'P-S1', 'asked'),        // never answered
  L(4, 'P-C4', 'P-S1', 'refused'),
  L(5, 'P-C8', 'P-S1', 'accepted'),     // an address nobody confirmed
  L(6, 'P-C5', 'P-S2', 'accepted'),     // Ben's, and Ben's only
  L(7, 'P-C9', 'P-S9', 'accepted'),     // the other Ada's
  L(8, 'P-S1', 'P-S1', 'accepted'),     // a typo linking Ada to herself
];
const J1 = { job_id: 'J-1', status: 'active', subject: 'Maths', service: 'Tuition', weekday: 'Tuesday', start_time: '16:00',
  hours_per_session: 2, venue: 'Online', session_dates: '22/09/2026, 29/09/2026, 06/10/2026, 13/10/2026',
  for_children: 'Ada Pupil, Someone else', kind: '' };
const E = (job, actor, role, action, target) => ({ event_id: 'e-' + job + '-' + actor + '-' + action, job_id: job, actor: actor,
  role: role, action: action, target: target || '', message: '' });
const booked = (job, client) => [E(job, client, 'client', 'Request'), E(job, 'Sam Tutor', 'tutor', 'Accept', client),
                                 E(job, client, 'client', 'Confirm')];
const A = (pid, q, first, last, label) => ({ person_id: pid, question_key: q, first_done: first, last_done: last, times: 1, label: label || '' });
const PAPER1 = 'Maths · Paper 1 (Calculator) — June 2024';
const ADA = [
  A('P-S1', 'q:ADA-AGAIN', '2026-09-29', '2026-10-06', PAPER1 + ' · Q7'),
  A('P-S1', 'q:ADA-NEW', '2026-10-06', '2026-10-06', PAPER1 + ' · Q3'),
  A('P-S1', 'pr:PR-BI01#iv', '2026-10-06', '2026-10-06', 'Biology · Required practical · Osmosis · Worksheet'),
  A('P-S1', 'pr:PR-BI01#dv', '2026-10-06', '2026-10-06', 'Biology · Required practical · Osmosis · Worksheet'),
  A('P-S1', 'q:ADA-MON', '2026-10-05', '2026-10-05', 'Maths · Paper 2 · Q1'),
  A('P-S1', 'q:ADA-WED', '2026-10-07', '2026-10-07', 'Maths · Paper 2 · Q9'),
  A('P-S1', 'q:ADA-SEP', '2026-09-29', '2026-09-29', 'Maths · Paper 2 · Q4'),
  /* THE OTHER ADA DID SOMETHING THAT DAY TOO, so picking her by name would be an email to Ola. */
  A('P-S9', 'q:OLA-ADA', '2026-10-06', '2026-10-06', 'Maths · Paper 3 · Q8'),
];
const BEN = A('P-S2', 'q:BEN-1', '2026-10-06', '2026-10-06', 'Maths · Paper 4 · Q2');

function seeded(o) {
  o = o || {};
  const w = world({ quota: o.quota, receipt: { tab: 'recap_log', keyCol: 'day' } });
  const { b } = w;
  b.seed('people', PEOPLE.concat(o.people || []));
  b.seed('family', (o.family || FAMILY).concat(o.moreFamily || []));
  b.seed('jobs', [Object.assign({}, J1, o.job || {})].concat(o.jobs || []));
  b.seed('events', o.events || booked('J-1', 'Pat Parent'));
  b.seed('attempts', (o.attempts || ADA).concat(o.moreAttempts || []));
  if (o.mode !== null) cfgSet(b, 'session_recap', o.mode || 'send');
  worlds.push(w);
  return w;
}
const run = (w, s) => JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapRun_(new Date(' + at(s) + '))')));
const log = w => rowsOf(w.b, 'recap_log');
const to = (w, addr) => w.mail.sent.filter(m => m.to === addr);
/* EVERY WRITE, AN APPENDED ROW INCLUDED — the harness counts `setValue`, and `appendRow` adds a row
   without one, so "wrote nothing" is both. */
const weight = b => b.log.writes + Object.keys(b.tabs).reduce((n, k) => n + b.tabs[k].length, 0);
const thrown = w => { try { w.b.ev('clearCache(); sessionRecapRun({})'); return ''; } catch (e) { return String(e && e.message || e); } };
const ask = (what, ok) => { asked++; if (!ok) bad.push(what); };
const DUE = '2026-10-06T19:05:00Z', EARLY = '2026-10-06T18:59:00Z';

/* ---------- 1. WHEN IT IS DUE: LONDON, TWO HOURS AFTER THE END ---------------------------------------- */
{
  const w = seeded();
  run(w, EARLY);
  ask('at 19:59 London, a minute before due, the run sent ' + w.mail.sent.length + ' email(s) — too early', !w.mail.sent.length && !log(w).length);
  const r = run(w, DUE);
  ask('at 20:05 London (19:05 UTC) on 6 Oct the run sent [' + w.mail.sent.map(m => m.to) + '] (' + JSON.stringify(r).slice(0, 200) + ') — wanted Pat, once',
    w.mail.sent.length === 1 && to(w, 'pat@example.org').length === 1);
  const row = log(w).find(x => x.parent_id === 'P-C1') || {};
  ask('Pat’s receipt is ' + JSON.stringify(row) + ' — wanted day 2026-10-06, due 2026-10-06 20:00, job J-1, 3 questions, sent',
    row.day === '2026-10-06' && row.due === '2026-10-06 20:00' && row.job_ids === 'J-1' && Number(row.questions) === 3 && row.status === 'sent' && row.learner_id === 'P-S1');
}
{
  /* GMT: Tue 3 Nov, the same lesson, due 20:00 GMT = 20:00 UTC. A backend still on summer time sends at 19:30 UTC. */
  const w = seeded({ job: { session_dates: '27/10/2026, 03/11/2026' }, attempts: [A('P-S1', 'q:NOV', '2026-11-03', '2026-11-03', 'Maths · Paper 5 · Q1')] });
  run(w, '2026-11-03T19:30:00Z');
  ask('in November (GMT) the run sent at 19:30 UTC, half an hour before due', !w.mail.sent.length);
  run(w, '2026-11-03T20:05:00Z');
  ask('in November (GMT) the run did not send at 20:05 UTC', to(w, 'pat@example.org').length === 1);
}
{
  /* THE SUNDAY THE CLOCKS GO BACK, 25 Oct 2026: a 14:00 lesson ends 16:00 GMT, due 18:00 GMT = 18:00 UTC. */
  const w = seeded({ job: { weekday: 'Sunday', start_time: '14:00', session_dates: '25/10/2026' },
                     attempts: [A('P-S1', 'q:BACK', '2026-10-25', '2026-10-25', 'Maths · Paper 5 · Q2')] });
  run(w, '2026-10-25T17:30:00Z');
  ask('on the day the clocks go back the run sent at 17:30 UTC — 17:30 GMT, before an 18:00 due', !w.mail.sent.length);
  run(w, '2026-10-25T18:05:00Z');
  ask('on the day the clocks go back the run did not send at 18:05 UTC', w.mail.sent.length === 1);
}
{
  /* A LESSON ENDING AT 22:00 IS DUE AT MIDNIGHT, and the email names the day it was on, not "today". */
  const w = seeded({ job: { start_time: '20:00', session_dates: '06/10/2026' } });
  run(w, '2026-10-06T22:55:00Z');
  ask('a lesson ending at 22:00 London was emailed at 23:55, before midnight', !w.mail.sent.length);
  run(w, '2026-10-06T23:05:00Z');
  const m = w.mail.sent[0] || {};
  ask('a lesson ending at 22:00 was not emailed at 00:05 the next day, or its email does not name Tue 6 Oct: ' + JSON.stringify(m.subject),
    w.mail.sent.length === 1 && /on Tue 6 Oct:/.test(m.subject) && /Tuesday 6 October, 8pm to 10pm/.test(m.body) && !/\btoday\b/i.test(m.body));
}
{
  /* THE DELAY. 5 hours: due 23:00 London = 22:00 UTC. With 2 the email would already have gone at 21:05 UTC. */
  const w = seeded();
  cfgSet(w.b, 'session_recap_delay', '5');
  run(w, '2026-10-06T21:05:00Z');
  ask('with session_recap_delay 5 the run sent 3 hours after the lesson', !w.mail.sent.length);
  run(w, '2026-10-06T22:05:00Z');
  ask('with session_recap_delay 5 the run did not send 5 hours after', w.mail.sent.length === 1);
  [['', 2], ['25', 2], ['six', 2], ['-1', 2], ['0', 0], ['12', 12], ['13', 2]].forEach(([v, want]) => {
    const got = w.b.ev('recapDelay_({ session_recap_delay: ' + JSON.stringify(v) + ' })');
    ask('session_recap_delay "' + v + '" reads as ' + got + ', wanted ' + want, got === want);
  });
}

/* ---------- 2. A START NOBODY KNOWS FOR THAT DATE IS THE LATEST IT COULD BE ---------------------------------- */
{
  /* MONDAY 10-12 AND FRIDAY …: the row keeps one start, the first run's. On the Friday it is not known,
     so the end is 18:00 + 2h and the email is due at 22:00 London; at 10:00 + 2h + 2h it would go at 14:00
     with the Friday lesson not yet begun. On the Monday it is known. */
  const w = seeded({ job: { weekday: 'Monday, Friday', start_time: '10:00', session_dates: '05/10/2026, 09/10/2026' },
                     attempts: [A('P-S1', 'q:FRI', '2026-10-09', '2026-10-09', 'Maths · Paper 6 · Q1'),
                                A('P-S1', 'q:MON', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q2')] });
  run(w, '2026-10-05T13:05:00Z');
  const mon = w.mail.sent[0] || {};
  ask('the Monday (the first day the booking names, start known) was not emailed at 14:05 London with its time: ' + JSON.stringify(mon.body && mon.body.split('\n')[2]),
    w.mail.sent.length === 1 && /Monday 5 October, 10am to 12pm\./.test(mon.body));
  run(w, '2026-10-09T20:30:00Z');
  ask('the Friday of a Monday-and-Friday booking was emailed at 21:30 London — the first run’s 10:00 start used on another day', w.mail.sent.length === 1);
  run(w, '2026-10-09T21:05:00Z');
  const fri = w.mail.sent[1] || {};
  ask('the Friday was not emailed at 22:05 London, or its email states a time nobody knows: ' + JSON.stringify(fri.body && fri.body.split('\n')[2]),
    w.mail.sent.length === 2 && /Ada had Maths on Friday 9 October\./.test(fri.body) && !/\d(am|pm) to /.test(fri.body));
}
{
  /* AN EDIT MOVE rewrites `weekday` and `start_time` and leaves `session_dates` — so the row says
     Tuesday 16:00 and a date is a Wednesday. Nothing says when that Wednesday's lesson was, if there
     was one: the latest it could end, and no time in the email. */
  const w = seeded({ job: { session_dates: '06/10/2026, 07/10/2026' },
                     attempts: [A('P-S1', 'q:WEDNESDAY', '2026-10-07', '2026-10-07', 'Maths · Paper 6 · Q3')] });
  run(w, '2026-10-07T20:30:00Z');
  ask('a Wednesday date on a row that names Tuesday was emailed at 21:30 London — its 16:00 start is the Tuesday’s', !w.mail.sent.length);
  run(w, '2026-10-07T21:05:00Z');
  ask('a Wednesday date on a row that names Tuesday was not emailed at 22:05 London, or states a time', w.mail.sent.length === 1 && !/\d(am|pm) to /.test(w.mail.sent[0].body));
}
{
  const w = seeded({ job: { start_time: '' } });
  run(w, '2026-10-06T20:30:00Z');
  ask('a lesson with no start time was emailed at 21:30 London — before 18:00 + 2h + 2h', !w.mail.sent.length);
  run(w, '2026-10-06T21:05:00Z');
  ask('a lesson with no start time was not emailed at 22:05 London, or says a time', w.mail.sent.length === 1 && !/\d(am|pm) to /.test(w.mail.sent[0].body));
}
{
  /* THE SHEET'S OWN SHAPES: a time-of-day Date, a two-digit year, and a single date the sheet made a Date. */
  const w = seeded({ job: { start_time: new Date(1899, 11, 30, 16, 0) } });
  run(w, EARLY); run(w, DUE);
  ask('start_time as a time-of-day Date did not read as 16:00 (due 20:00): ' + w.mail.sent.length + ' sent',
    w.mail.sent.length === 1 && /4pm to 6pm/.test(w.mail.sent[0].body));
  const y2 = seeded({ job: { session_dates: '29/09/26, 06/10/26' } });
  run(y2, DUE);
  ask('session_dates written dd/mm/yy was not read', y2.mail.sent.length === 1);
  const one = seeded({ job: { session_dates: '06/10/2026' } });
  ask('the harness did not make a lone date a Date, so the single-Date cell was NOT checked', one.b.tabs.jobs[1][one.b.tabs.jobs[0].indexOf('session_dates')] instanceof Date);
  run(one, DUE);
  ask('a session_dates cell holding one Date was not read', one.mail.sent.length === 1);
}

/* ---------- 3. NO BACKFILL ---------------------------------------------------------------------------------- */
{
  const w = seeded();
  run(w, DUE);
  ask('the first run emailed about another day than 6 Oct: ' + w.mail.sent.map(m => m.subject), w.mail.sent.length === 1 && /Tue 6 Oct/.test(w.mail.sent[0].subject));
  ask('the first run wrote rows for 22 or 29 Sep, an earlier lesson’s days: ' + JSON.stringify(log(w).map(x => x.day)), !log(w).some(x => x.day !== '2026-10-06'));
}
{
  /* SWITCHED ON A DAY LATE: 20:30 London on 7 Oct is due + 24.5h. Nothing. */
  const w = seeded();
  const w0 = weight(w.b);
  run(w, '2026-10-07T19:30:00Z');
  ask('a run 24.5 hours after due sent ' + w.mail.sent.length + ' and wrote ' + (weight(w.b) - w0) + ' — past the window is nothing', !w.mail.sent.length && weight(w.b) === w0);
}
{
  const seedHeld = w => w.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', job_ids: "'J-1",
    due: "'2026-10-06 20:00", to: 'pat@example.org', status: 'held', note: 'daily mail quota' }]);
  const late = seeded(); seedHeld(late);
  run(late, '2026-10-07T19:30:00Z');
  ask('a held email past its 24 hours was sent', !late.mail.sent.length && (log(late)[0] || {}).status === 'held');
  const still = seeded(); seedHeld(still);
  run(still, '2026-10-07T18:00:00Z');
  const patRows = log(still).filter(x => x.parent_id === 'P-C1');
  ask('a held email at due + 23h was not sent, once: ' + JSON.stringify(patRows), still.mail.sent.length === 1 && patRows.length === 1 && patRows[0].status === 'sent');
}

/* ---------- 4. ONLY BOOKED SEATS -------------------------------------------------------------------------- */
{
  const w = seeded({ events: [E('J-1', 'Pat Parent', 'client', 'Request')] });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a request nobody agreed to sent ' + w.mail.sent.length + ' and wrote ' + (weight(w.b) - w0) + ' — wanted neither', !w.mail.sent.length && weight(w.b) === w0);
  w.setClock(at('2026-10-06T19:30:00Z'));
  const pv = JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
  const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
  ask('the Preview does not say the unanswered request is "not agreed": ' + JSON.stringify(day.sessions), (day.sessions || []).some(s => /not agreed/.test(s.state)));
}
{
  const w = seeded({ events: [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent')] });
  run(w, DUE);
  const rows = log(w);
  ask('agreed with Sam but not paid: wanted one job row saying "mark it paid" and no email, got ' + JSON.stringify(rows) + ' and ' + w.mail.sent.length + ' sent',
    !w.mail.sent.length && rows.length === 1 && rows[0].learner_id === '' && rows[0].job_ids === 'J-1' && rows[0].status === 'not sent' && /mark it paid/.test(rows[0].note));
  w.b.seed('events', [E('J-1', 'Pat Parent', 'client', 'Confirm')]);
  run(w, '2026-10-06T20:05:00Z');
  ask('marked paid within the window, the next hourly check did not send it', to(w, 'pat@example.org').length === 1);
}
[['cancelled before paying', [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Pat Parent', 'client', 'Withdraw')]],
 ['paid, then withdrew as the only seat', booked('J-1', 'Pat Parent').concat([E('J-1', 'Pat Parent', 'client', 'Withdraw')])]].forEach(([what, events]) => {
  const w = seeded({ events: events });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a lesson ' + what + ' sent ' + w.mail.sent.length + ' and wrote ' + (weight(w.b) - w0), !w.mail.sent.length && weight(w.b) === w0);
});
{
  /* TWO FAMILIES, ONE STILL BOOKED: only that family's child. */
  const w = seeded({ job: { for_children: 'Ada Pupil, Ben Pupil' }, moreAttempts: [BEN],
    events: booked('J-1', 'Pat Parent').concat([E('J-1', 'Bo Other', 'client', 'Request'), E('J-1', 'Bo Other', 'client', 'Confirm'),
                                                E('J-1', 'Bo Other', 'client', 'Withdraw')]) });
  run(w, DUE);
  ask('with Bo’s paid seat withdrawn, the run emailed [' + w.mail.sent.map(m => m.to) + '] — wanted Pat alone', w.mail.sent.length === 1 && to(w, 'pat@example.org').length === 1);
  ask('Ben, whose family’s seat was withdrawn, is logged as "not a child linked to anyone" — he is, the seat is the reason: ' + JSON.stringify(log(w)),
    !log(w).some(x => /Ben Pupil/.test(x.note)));
  w.setClock(at(DUE));
  const pv = JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
  const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
  ask('the Preview does not say Ben’s family’s seat is Withdrawn: ' + JSON.stringify(day.sessions), (day.sessions || []).some(s => /Bo Other’s seat is Withdrawn, not Booked/.test(s.state)));
}
{
  /* `session` IS THE ORDINARY BOOKING TOO — SCHEMA.jobs says blank or `session`. */
  const w = seeded({ job: { kind: 'session' } });
  run(w, DUE);
  ask('a job whose kind is "session" is not treated as a lesson', w.mail.sent.length === 1);
}
['waitlist', 'festive'].forEach(k => {
  const w = seeded({ job: { kind: k } });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a ' + k + ' job sent ' + w.mail.sent.length + ' or wrote ' + (weight(w.b) - w0), !w.mail.sent.length && weight(w.b) === w0);
});

/* ---------- 5. WHO THE SESSION IS ABOUT ----------------------------------------------------------------------- */
{
  const w = seeded({ job: { for_children: 'Someone else' } });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a booking only for "Someone else" sent ' + w.mail.sent.length + ' or wrote ' + (weight(w.b) - w0), !w.mail.sent.length && weight(w.b) === w0);
  w.setClock(at(DUE));
  const pv = JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
  const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
  ask('the Preview does not say the booking is for someone not on the site: ' + JSON.stringify(day.sessions), (day.sessions || []).some(s => /someone not on the site/.test(s.state)));
}
{
  const w = seeded({ job: { for_children: 'Zed Nobody' } });
  run(w, DUE);
  ask('a name on the booking that is nobody’s child is not a job row naming it: ' + JSON.stringify(log(w)),
    !w.mail.sent.length && log(w).some(x => x.learner_id === '' && x.job_ids === 'J-1' && /Zed Nobody/.test(x.note)));
  /* TWO SUCH NAMES ARE ONE ROW SAYING BOTH — not two rows under one key, the second over the first. */
  const two = seeded({ job: { for_children: 'Zed Nobody, Yan Nobody' } });
  run(two, DUE);
  const rows = log(two).filter(x => x.job_ids === 'J-1');
  ask('two names nobody can place are not one row naming both: ' + JSON.stringify(rows), rows.length === 1 && /Zed Nobody/.test(rows[0].note) && /Yan Nobody/.test(rows[0].note));
}
{
  /* A STUDENT WHO BOOKED THEIR OWN SEAT IS THE LEARNER — and his parent is told. */
  const w = seeded({ job: { for_children: '' }, events: booked('J-1', 'Ben Pupil'), moreAttempts: [BEN] });
  run(w, DUE);
  ask('Ben, who booked his own seat, was not the learner: sent [' + w.mail.sent.map(m => m.to + ' ' + m.subject) + ']',
    w.mail.sent.length === 1 && to(w, 'bo@example.org').length === 1 && /^Ben’s session/.test(w.mail.sent[0].subject));
}
{
  const one = seeded({ job: { for_children: '' } });
  run(one, DUE);
  ask('a booking naming nobody, by a parent with one child, was not about that child', one.mail.sent.length === 1 && to(one, 'pat@example.org').length === 1);
  const two = seeded({ job: { for_children: '' }, moreFamily: [L(9, 'P-C1', 'P-S2', 'accepted')], moreAttempts: [BEN] });
  run(two, DUE);
  ask('a booking naming nobody, by a parent with two children, guessed: sent ' + two.mail.sent.length + ', log ' + JSON.stringify(log(two)),
    !two.mail.sent.length && log(two).some(x => x.job_ids === 'J-1' && /which of Pat Parent’s children/.test(x.note)));
}
{
  const w = seeded();
  run(w, DUE);
  ask('the other family’s Ada Pupil, first on the people tab, was emailed about: ' + w.mail.sent.map(m => m.to), !to(w, 'ola@example.org').length);
  ask('the email to Pat carries the other Ada’s question', !w.mail.sent.some(m => /Paper 3/.test(m.body)));
}
{
  const w = seeded({ job: { for_children: 'Ada Pupil, Ben Pupil' }, moreAttempts: [BEN],
                     events: booked('J-1', 'Pat Parent').concat([E('J-1', 'Bo Other', 'client', 'Request'), E('J-1', 'Bo Other', 'client', 'Confirm')]) });
  run(w, DUE);
  const pat = to(w, 'pat@example.org'), bo = to(w, 'bo@example.org');
  ask('a booking split between two families did not send each family its own child: Pat ' + pat.map(m => m.subject) + ', Bo ' + bo.map(m => m.subject),
    pat.length === 1 && bo.length === 1 && /^Ada’s/.test(pat[0].subject) && /^Ben’s/.test(bo[0].subject));
  ask('in a split booking one family was told about the other’s child', !/Ada/.test((bo[0] || {}).body || '') && !/Ben/.test((pat[0] || {}).body || ''));
}
{
  const w = seeded({ job: { for_children: 'Ada' } });
  run(w, DUE);
  ask('a first name on the booking, unique among the booker’s children, was not matched', to(w, 'pat@example.org').length === 1);
}

/* ---------- 6. THAT DAY'S QUESTIONS, AND WHAT MAY BE PRINTED ---------------------------------------------------- */
{
  const w = seeded();
  run(w, DUE);
  const m = to(w, 'pat@example.org')[0] || { body: '', htmlBody: '' };
  ask('Pat’s email does not count 3 that day, 2 of them new: ' + m.body.split('\n')[2], /That day Ada worked on 3 questions, 2 of them for the first time\./.test(m.body));
  ask('Pat’s email lists a question from another day (Paper 2)', !/Paper 2/.test(m.body));
  ask('Pat’s email does not group by paper with the again marker: ' + JSON.stringify(m.body), m.body.indexOf(PAPER1 + '\nQ3, Q7 (again)') !== -1);
  ask('a practical’s two boxes are not one question, by its name, once', (m.body.match(/Worksheet/g) || []).length === 1 && /Biology · Required practical · Osmosis\nWorksheet/.test(m.body));
  ['Hello Pat,', 'Ada had Maths on Tuesday 6 October, 4pm to 6pm.', 'Ada can see them on the site: https://halexdias31-pixel.github.io/family/',
   'You get this because you are Ada’s parent on @family. To stop the emails after sessions, reply to this one and say so.'].forEach(s => {
    ask('Pat’s email does not say "' + s + '"', m.body.indexOf(s) !== -1);
  });
  ask('Pat’s email names the tutor, the venue or a price', !/Sam|Online|£/.test(m.body + m.htmlBody));
  ask('the email went without both bodies or the business’s name', !!m.htmlBody && m.name === '@family.');
}
{
  const extra = [
    A('P-S1', 'q:ADA-URL', '2026-10-06', '2026-10-06', 'Pay at https://pay.example/now'),
    A('P-S1', 'q:ADA-KEY', '2026-10-06', '2026-10-06', 'q:ADA-KEY'),
    A('P-S1', 'q:ADA-BARE', '2026-10-06', '2026-10-06', ''),
    A('P-S1', 'q:P9-10', '2026-10-06', '2026-10-06', 'Maths · Paper 9 · Q10'),
    A('P-S1', 'q:P9-2', '2026-10-06', '2026-10-06', 'Maths · Paper 9 · Q2'),
    A('P-S1', 'q:AMP', '2026-10-06', '2026-10-06', 'Fractions & "decimals" · Q2<script>x</script>'),
  ];
  const w = seeded({ moreAttempts: extra });
  run(w, DUE);
  const m = to(w, 'pat@example.org')[0] || { body: '', htmlBody: '' };
  ask('unprintable questions were not counted: ' + m.body.split('\n')[2], /worked on 9 questions/.test(m.body) && /…and 3 more\./.test(m.body));
  ask('an unsafe label, a label that is its key, or a raw key was printed', !/Pay at|pay\.example|q:ADA|q:P9/.test(m.body + m.htmlBody));
  ask('Q2 does not sort before Q10 under its paper', m.body.indexOf('Maths · Paper 9\nQ2, Q10') !== -1);
  ask('the HTML does not escape a label’s & and quotes, or carries a tag: ' + m.htmlBody.slice(0, 600),
    m.htmlBody.indexOf('Fractions &amp; &quot;decimals&quot;') !== -1 && !/<script/i.test(m.htmlBody));
}
{
  const many = [];
  for (let i = 1; i <= 35; i++) many.push(A('P-S1', 'q:M-' + i, '2026-10-06', '2026-10-06', 'Maths · Paper 8 · Q' + i));
  const w = seeded({ attempts: many });
  run(w, DUE);
  const m = to(w, 'pat@example.org')[0] || { body: '' };
  const listed = (m.body.split('\n').find(x => /^Q1, /.test(x)) || '').split(', ');
  ask('35 questions did not list 30 then "…and 5 more.": ' + listed.length + ' listed', listed.length === 30 && listed[29] === 'Q30' && /…and 5 more\./.test(m.body));
}
{
  const w = seeded({ attempts: [A('P-S1', 'q:U1', '2026-10-06', '2026-10-06', ''), A('P-S1', 'q:U2', '2026-10-06', '2026-10-06', '')] });
  run(w, DUE);
  const m = to(w, 'pat@example.org')[0] || { body: '' };
  ask('with nothing printable the email still has a list, a "more", or says "see them": ' + JSON.stringify(m.body),
    /worked on 2 questions/.test(m.body) && !/…and/.test(m.body) && /Ada can see which ones on the site/.test(m.body) && !/q:U/.test(m.body));
}

/* ---------- 7. NOTHING DONE IS NO EMAIL — AND A NOTE SAYING WHERE THE QUESTIONS WENT --------------------------- */
{
  const nine = [];
  for (let i = 1; i <= 9; i++) nine.push(A('P-T1', 'q:SAM-' + i, '2026-10-06', '2026-10-06', 'Maths · Paper 1 (Calculator) — June 2024 · Q' + i));
  const w = seeded({ attempts: ADA.filter(r => r.person_id !== 'P-S1' || !/2026-10-06/.test(r.first_done + r.last_done)).concat(nine, [BEN]),
    job: { for_children: 'Ada Pupil, Ben Pupil' },
    events: booked('J-1', 'Pat Parent').concat([E('J-1', 'Bo Other', 'client', 'Request'), E('J-1', 'Bo Other', 'client', 'Confirm')]) });
  run(w, DUE);
  const ada = log(w).find(x => x.learner_id === 'P-S1' && x.parent_id === '') || {};
  ask('a due learner with nothing that day was emailed, or has no "nothing done" row saying why: ' + JSON.stringify(ada),
    !to(w, 'pat@example.org').length && ada.status === 'nothing done' && /signed in as Ada Pupil/.test(ada.note));
  ask('the nothing-done note does not name the tutor’s account and the 9 questions on it: ' + ada.note, /9 were marked that day on Sam Tutor’s account \(the tutor\)/.test(ada.note));
  ask('an email mentions the tutor’s name or account', w.mail.sent.length === 1 && !w.mail.sent.some(m => /Sam/.test(m.body + m.htmlBody + m.subject)));
  const w0 = weight(w.b);
  run(w, '2026-10-06T19:35:00Z');
  ask('a second hourly run rewrote ' + (weight(w.b) - w0) + ' cell(s) that said the same thing', weight(w.b) === w0);
  w.b.seed('attempts', [A('P-S1', 'q:LATE', '2026-10-06', '2026-10-06', 'Maths · Paper 7 · Q1')]);
  run(w, '2026-10-06T20:05:00Z');
  ask('attempts that arrived within the window were not sent at the next run', to(w, 'pat@example.org').length === 1);
}

/* ---------- 8. WHO IS TOLD ------------------------------------------------------------------------------------- */
{
  const w = seeded();
  run(w, DUE);
  ask('Pat was not emailed', to(w, 'pat@example.org').length === 1);
  ask('Pam (session_email no) has no "opted out" row: ' + JSON.stringify(log(w)), log(w).some(x => x.parent_id === 'P-C2' && x.status === 'opted out' && /session_email/.test(x.note)));
  ['pam@example.org', 'peg@example.org', 'rex@example.org', 'quin.tpyo@example.org', 's1@example.org', 'sam@example.org', 'bo@example.org']
    .forEach(a => ask('an email went to ' + a, !to(w, a).length));
}
{
  /* THIS EMAIL'S OPT-OUT, NOT SUNDAY'S: weekly_email no, session_email blank, is told. */
  const w = seeded({ people: [], family: FAMILY });
  const g = w.b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-C1')[h.indexOf('weekly_email')] = 'no';
  run(w, DUE);
  ask('a parent whose weekly_email says no and session_email is blank was not emailed after the session', to(w, 'pat@example.org').length === 1);
}
{
  /* PAT, WHO BOOKED, HAS NO ADDRESS; QUIN, THE OTHER PARENT, NEVER CONFIRMED HIS. Nobody can be told,
     and the reason names both. */
  const w = seeded({ family: [L(1, 'P-C1', 'P-S1', 'accepted'), L(5, 'P-C8', 'P-S1', 'accepted')] });
  const g = w.b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-C1')[h.indexOf('email')] = '';
  run(w, DUE);
  ask('Ada, whose one addressed parent never confirmed it, has no "not sent … not confirmed" row: ' + JSON.stringify(log(w)),
    !w.mail.sent.length && log(w).some(x => x.learner_id === 'P-S1' && x.parent_id === '' && x.status === 'not sent'
      && /Quin Typo: email not confirmed/.test(x.note) && /Pat Parent: no email address/.test(x.note)));
}
{
  const w = seeded({ people: [P('P-C6', 'Pip', 'Parent', 'client', 'pat@example.org')], moreFamily: [L(10, 'P-C6', 'P-S1', 'accepted')] });
  run(w, DUE);
  ask('two parents on one address got ' + to(w, 'pat@example.org').length + ' emails, wanted one', to(w, 'pat@example.org').length === 1);
}
{
  const w = seeded({ job: { for_children: '' }, events: booked('J-1', 'Cal Alone'),
                     attempts: [A('P-S3', 'q:CAL', '2026-10-06', '2026-10-06', 'Maths · Paper 4 · Q9')] });
  run(w, DUE);
  ask('Cal, who booked himself and has no parent, has no "not sent" row with the reason: ' + JSON.stringify(log(w)),
    !w.mail.sent.length && log(w).some(x => x.learner_id === 'P-S3' && x.status === 'not sent' && /no parent/.test(x.note)));
}

/* ---------- 9. TWO SESSIONS IN ONE DAY ARE ONE EMAIL, AFTER THE LATER ------------------------------------------ */
{
  const w = seeded({ jobs: [Object.assign({}, J1, { job_id: 'J-2', subject: 'Physics', start_time: '10:00' })],
                     events: booked('J-1', 'Pat Parent').concat(booked('J-2', 'Pat Parent')) });
  run(w, '2026-10-06T13:05:00Z');
  ask('with Physics 10-12 and Maths 16-18, an email went at 14:05 London — after the first session, not the last', !w.mail.sent.length);
  run(w, DUE);
  const m = w.mail.sent[0] || { body: '', subject: '' };
  ask('two sessions in a day were not one email naming both: ' + w.mail.sent.length + ' sent, ' + JSON.stringify(m.body.split('\n')[2]),
    w.mail.sent.length === 1 && /Ada had two sessions on Tuesday 6 October: Physics, 10am to 12pm, and Maths, 4pm to 6pm\./.test(m.body)
    && /^Ada’s sessions on Tue 6 Oct/.test(m.subject));
  ask('the receipt for two sessions does not name both jobs', (log(w).find(x => x.parent_id === 'P-C1') || {}).job_ids === 'J-1,J-2');
  run(w, '2026-10-06T19:35:00Z');
  ask('the rerun sent again', w.mail.sent.length === 1);
}

/* ---------- 10. OFF, PREVIEW, SEND --------------------------------------------------------------------------- */
{
  const w = seeded({ mode: null });
  const w0 = weight(w.b);
  const r = run(w, DUE);
  ask('with no session_recap row the run is ' + r.mode + ' and wrote ' + (weight(w.b) - w0) + ' — off must do nothing', r.mode === 'off' && weight(w.b) === w0 && !w.mail.sent.length);
  ['yes', 'on', 'true', 'SEND IT'].forEach(v => {
    cfgSet(w.b, 'session_recap', v);
    const x = run(w, DUE);
    ask('session_recap "' + v + '" ran as ' + x.mode, x.mode === 'off' && !w.mail.sent.length);
  });
  cfgSet(w.b, 'session_recap', 'preview');
  const pv = run(w, DUE);
  const st = s => log(w).filter(x => x.status === s);
  ask('preview sent ' + w.mail.sent.length + ' or wrote ' + st('preview').length + ' preview row(s), wanted 0 and 1 (' + JSON.stringify(pv).slice(0, 160) + ')',
    !w.mail.sent.length && st('preview').length === 1 && pv.previewed === 1);
  const n1 = log(w).length;
  run(w, '2026-10-06T19:35:00Z');
  ask('a second preview added rows', log(w).length === n1);
  cfgSet(w.b, 'session_recap', 'send');
  run(w, '2026-10-06T20:05:00Z');
  ask('send did not turn the preview row into the receipt: ' + JSON.stringify(log(w).map(x => x.parent_id + ':' + x.status)),
    w.mail.sent.length === 1 && st('sent').length === 1 && log(w).length === n1);
  run(w, '2026-10-06T20:06:00Z'); run(w, '2026-10-06T21:05:00Z');
  ask('a rerun and the next hour sent again', w.mail.sent.length === 1);
  cfgSet(w.b, 'session_recap', 'preview');
  run(w, '2026-10-06T21:10:00Z');
  ask('a preview after sending changed the receipt', st('sent').length === 1);
}

/* ---------- 11. THE SHARED ENGINE: QUOTA, FAILURES, AT MOST ONCE, THE LOCK ------------------------------------- */
const split = { job: { for_children: 'Ada Pupil, Ben Pupil' }, moreAttempts: [BEN],
                events: booked('J-1', 'Pat Parent').concat([E('J-1', 'Bo Other', 'client', 'Request'), E('J-1', 'Bo Other', 'client', 'Confirm')]) };
{
  const w = seeded(Object.assign({ quota: 11 }, split));
  const r1 = run(w, DUE);
  ask('with 11 left and 10 kept back the run sent ' + w.mail.sent.length + ' and held ' + r1.held + ', wanted 1 and 1', w.mail.sent.length === 1 && r1.held === 1);
  w.mail.quota = 100;
  const r2 = run(w, '2026-10-06T20:05:00Z');
  const all = w.mail.sent.map(m => m.to).sort().join(', ');
  ask('the next hour did not send the held one, once: ' + all, all === 'bo@example.org, pat@example.org' && r2.sent === 1);
}
{
  const w = seeded(split);
  w.mail.fail = true;
  const r1 = run(w, DUE);
  ask('a send that threw is not logged failed with the reason: ' + JSON.stringify(log(w).map(x => x.status + ' ' + x.note)),
    r1.failed === 2 && log(w).filter(x => x.status === 'failed' && /Invalid email/.test(x.note)).length === 2);
  w.mail.fail = false;
  run(w, '2026-10-06T20:05:00Z');
  ask('a failed email was not sent by the next hour', w.mail.sent.length === 2);
}
{
  const w = seeded();
  w.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', to: 'pat@example.org', status: 'sending' }]);
  run(w, DUE);
  ask('a row left `sending` was sent again', !w.mail.sent.length);
}
{
  const w = seeded();
  w.b.ev('(function () { const real = setCells; let once = true; setCells = function (t, row, v) {'
       + ' if (once && v && v.status === "sent") { once = false; throw new Error("Service Spreadsheets timed out"); }'
       + ' return real.apply(this, arguments); }; })()');
  const r1 = run(w, DUE);
  run(w, '2026-10-06T20:05:00Z');
  ask('a `sent` write that failed after the email went led to ' + w.mail.sent.length + ' emails; log ' + JSON.stringify(log(w).map(x => x.status)),
    w.mail.sent.length === 1 && !r1.failed && log(w).some(x => x.status === 'sending'));
}
{
  const w = seeded();
  w.lock.free = false;
  const r = run(w, DUE);
  ask('with the lock held elsewhere the run sent ' + w.mail.sent.length + ' (' + JSON.stringify(r).slice(0, 160) + ') — wanted nothing, counted busy',
    !w.mail.sent.length && r.busy > 0 && !log(w).length);
  w.setClock(at(DUE));
  ask('sessionRecapRun with the lock held did not throw', /did not finish/.test(thrown(w)));
}
{
  const off = seeded({ mode: 'off' }); off.setClock(at(DUE));
  ask('sessionRecapRun threw with the switch off: ' + thrown(off), !thrown(off));
  const quiet = seeded(); quiet.setClock(at(EARLY));
  ask('sessionRecapRun threw with nothing due: ' + thrown(quiet), !thrown(quiet));
  const clean = seeded(); clean.setClock(at(DUE));
  ask('sessionRecapRun threw on a clean run: ' + thrown(clean), !thrown(clean) && clean.mail.sent.length === 1);
  const held = seeded({ quota: 5 }); held.setClock(at(DUE));
  ask('sessionRecapRun that held an email for the quota did not throw saying so', /held 1/.test(thrown(held)));
}

/* ---------- 12. A MISSING TAB IS AN ERROR ONCE SOMETHING IS DUE, NEVER A QUIET DAY ----------------------------- */
{
  const w = seeded();
  delete w.b.tabs.attempts;
  w.b.ev('clearCache()');
  const w0 = weight(w.b);
  const quiet = run(w, EARLY);
  ask('with no attempts tab and nothing due the run answered an error: ' + JSON.stringify(quiet), !quiet.error);
  const r = run(w, DUE);
  ask('with no attempts tab and a session due the run answered ' + JSON.stringify(r).slice(0, 200) + ' — wanted an error naming the tab and /exec?setup=1',
    /attempts tab/.test(String(r.error)) && /setup=1/.test(String(r.error)));
  ask('with no attempts tab the run sent or wrote something', !w.mail.sent.length && weight(w.b) === w0);
  w.setClock(at(DUE));
  ask('sessionRecapRun with no attempts tab did not throw saying so', /attempts tab/.test(thrown(w)));
  const pv = JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
  ask('the Preview with no attempts tab answered attempts ' + pv.attempts + ', warning "' + pv.warning + '"', pv.attempts === false && /attempts tab/.test(pv.warning));
}
{
  const w = seeded();
  delete w.b.tabs.recap_log;
  w.b.ev('clearCache()');
  const r = run(w, DUE);
  ask('with no recap_log tab and a session due the run answered ' + JSON.stringify(r).slice(0, 160), /recap_log/.test(String(r.error)) && !w.mail.sent.length);
}

/* ---------- 13. BOOKING THE HOURLY CHECK -------------------------------------------------------------------- */
{
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  b.ev('ScriptApp.newTrigger("weeklyDigestRun").timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(18).create()');
  b.ev('installSessionRecap()'); b.ev('installSessionRecap()');
  const out = JSON.parse(JSON.stringify(b.ev('installSessionRecap()')));
  const mine = trig.filter(t => t.spec.fn === 'sessionRecapRun');
  ask('installSessionRecap run three times left ' + JSON.stringify(mine.map(t => t.spec)) + ' — wanted exactly one, every hour',
    mine.length === 1 && mine[0].spec.everyHours === 1 && Object.keys(mine[0].spec).length === 2 && out.replaced === 1);
  ask('installSessionRecap touched somebody else’s trigger', trig.some(t => t.spec.fn === 'closeFinishedJobs') && trig.some(t => t.spec.fn === 'weeklyDigestRun'));
  const gone = b.ev('removeSessionRecap()');
  ask('removeSessionRecap left its own or took another', gone.removed === 1 && !trig.some(t => t.spec.fn === 'sessionRecapRun') && trig.length === 2);
}

/* ---------- 14. NOTHING STARTS IT, AND IT ARRIVES OFF --------------------------------------------------------- */
{
  const dir = path.join(REPO, 'backend');
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.gs')); } catch (e) {}
  if (!files.includes('recap.gs')) { console.log('backend/recap.gs could not be read, so NOTHING was checked — not a pass.'); process.exit(1); }
  const front = fs.readdirSync(path.join(REPO, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f))
    .map(f => ['js/' + f, strip(fs.readFileSync(path.join(REPO, 'js', f), 'utf8'))]);
  const back = files.map(f => ['backend/' + f, strip(fs.readFileSync(path.join(dir, f), 'utf8'))]);
  back.concat(front).forEach(([f, src]) => {
    ['installSessionRecap', 'sessionRecapRun', 'removeSessionRecap', 'recapRun_'].forEach(n => {
      const c = Math.max(calls(src, n).length, mentions(src, n).length);
      /* recap.gs's own: the installer clears the old one first, and the trigger's handler runs the run. */
      const allowed = f === 'backend/recap.gs' && (n === 'removeSessionRecap' || n === 'recapRun_') ? 1 : 0;
      ask(f + ' names ' + n + ' outside its declaration — nothing may book or run the email after sessions but the owner, by hand', c <= allowed);
    });
    if (f !== 'backend/recap.gs' && f !== 'backend/constants.gs') ask(f + ' names the hourly handler — a second place that could book it', !/RECAP_RUN|['"]sessionRecapRun['"]/.test(src));
  });
  const rc = (back.find(([f]) => f === 'backend/recap.gs') || [])[1] || '';
  const nt = [...rc.matchAll(/newTrigger\s*\(/g)];
  const inst = rc.indexOf('function installSessionRecap'), instEnd = rc.indexOf('\nfunction ', inst + 1);
  ask('recap.gs books a trigger outside installSessionRecap', nt.length === 1 && nt[0].index > inst && nt[0].index < instEnd);
  ask('recap.gs has a top-level const or let — Apps Script may read it before it exists', !/^(const|let)\s/m.test(rc));
  const { b } = world();
  ask('RUNNABLE names a recap function — `?run=` would start it from a URL',
    !/recap/i.test(b.ev('Object.keys(typeof RUNNABLE === "object" ? RUNNABLE : {}).join(",")')));
  ask('a RUNNABLE entry is a recap function under another name',
    !b.ev('Object.values(typeof RUNNABLE === "object" ? RUNNABLE : {}).some(f => f === installSessionRecap || f === sessionRecapRun || f === recapRun_ || /ecap/i.test(String(f && f.name)))'));
  ask('installTriggers mentions the email after sessions — /exec?triggers=1 would book it',
    !/ecap/i.test(b.ev('typeof installTriggers === "function" ? installTriggers.toString() : ""')));
  ask('session_recap does not arrive off on the config tab', b.ev('(CONFIG_DEFAULTS.find(r => r[0] === "session_recap") || [])[1]') === 'off');
  ask('an empty config tab is not off', b.ev('recapMode_(config())') === 'off');
}

/* ---------- 15. THE ADMIN'S PREVIEW, AND NOBODY ELSE'S ---------------------------------------------------------- */
{
  const w = seeded({ moreAttempts: [A('P-S1', 'q:ADA-URL', '2026-10-06', '2026-10-06', 'Pay at https://pay.example/now')] });
  const { b, mail, trig } = w;
  w.setClock(at('2026-10-06T19:30:00Z'));
  const tok = {};
  ['a1@example.org', 's1@example.org', 'pat@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    ask('could not sign in ' + e + ' — ' + d.error, d.success);
    tok[e] = d.token;
  });
  const w0 = weight(b);
  const pv = b.post({ action: 'recapPreview', token: tok['a1@example.org'] });
  ask('an admin’s recapPreview was refused: ' + JSON.stringify(pv).slice(0, 200), pv.success);
  const day = (pv.days || [])[0] || {};
  ask('the Preview is not 7 days, newest first: ' + (pv.days || []).map(d => d.day), (pv.days || []).length === 7 && day.day === '2026-10-06' && day.label === 'Tue 6 Oct' && pv.days[6].day === '2026-09-30');
  const s = (day.sessions || [])[0] || {};
  ask('the Preview’s session line is ' + JSON.stringify(s), s.subject === 'Maths' && s.time === '4pm–6pm' && s.dueSaid === '8pm' && s.state === 'due' && (s.learners || []).join() === 'Ada Pupil');
  const pat = (day.emails || []).find(m => m.to === 'pat@example.org') || {};
  ask('the Preview does not render Pat’s email as it would go: ' + JSON.stringify(pat).slice(0, 200), /^Ada’s session on Tue 6 Oct: 4 questions/.test(pat.subject) && /Hello Pat,/.test(pat.text) && pat.status === '—');
  ask('the Preview does not list Pam as opted out', (day.nobody || []).some(n => /Pam Parent/.test(n.name) && /session_email/.test(n.why)));
  ask('the Preview prints an unsafe label', !/pay\.example/.test(JSON.stringify(pv)));
  ask('recapPreview wrote ' + (weight(b) - w0) + ' cell(s), sent ' + mail.sent.length + ', booked ' + trig.length + ' — with send on it must do none of them',
    weight(b) === w0 && !mail.sent.length && !trig.length && pv.scheduled === 0 && pv.mode === 'send' && pv.attempts === true && !pv.warning);
  run(w, DUE);
  const after = b.post({ action: 'recapPreview', token: tok['a1@example.org'] });
  const pat2 = (((after.days || [])[0] || {}).emails || []).find(m => m.to === 'pat@example.org') || {};
  ask('after the send the Preview does not say Pat’s is sent: ' + pat2.status, pat2.status === 'sent' && !!pat2.at);
  [['a student', tok['s1@example.org']], ['a parent', tok['pat@example.org']], ['nobody signed in', '']].forEach(([who, t]) => {
    const d = b.post({ action: 'recapPreview', token: t });
    ask(who + ' asked for recapPreview and was answered ' + JSON.stringify(d).slice(0, 160) + ' — it is an admin’s, it carries every address', !d.success && !d.days && !!d.error);
  });
}

/* ---------- AND ACROSS EVERY WORLD ABOVE: NEVER BEFORE THE RECEIPT, NEVER UNDER THE LOCK -------------------- */
{
  const unreceipted = [].concat(...worlds.map(w => w.mail.unreceipted)), locked = [].concat(...worlds.map(w => w.mail.locked));
  ask('an email went with no `sending` row on recap_log for it at that moment: ' + unreceipted.join(', ') + ' — the receipt must be on the sheet before the send', !unreceipted.length);
  ask('an email was sent while the run held the script lock: ' + locked.join(', '), !locked.length);
  const sent = worlds.reduce((n, w) => n + w.mail.sent.length, 0);
  ask('the worlds above sent ' + sent + ' email(s) in all, so the two rules just asked were NOT tested', sent > 20);
}

console.log('rules asked: ' + asked);
if (bad.length) {
  console.log('FAILED — ' + bad.length + ' thing(s) the email after a session gets wrong:');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — due on London’s clock after the last session, Booked seats only, the child’s own day, accepted parents with this email’s opt-out; off nothing, preview the log, send once; one hourly trigger, booked by nobody but the owner; the preview an admin’s.');
