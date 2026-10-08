#!/usr/bin/env node
/* ==================================================================================================
   node js/check-recap.js — THE DAILY EMAIL TO PARENTS, ASKED OF THE REAL BACKEND WHILE IT IS SWITCHED OFF

   ASKED FOR AS *"like 2 hours after the end of each session is done it will send an automated email to
   them of the questions they got done."* — and on 8 Oct *"so it emails all parents on work their child
   has done with the exact questions for each"*. Nothing has ever sent one, which is why it is checked:
   the first real run is an evening with families on the other end, and every rule below fails by
   emailing — too early, about the wrong child, to the wrong parent, twice, or about a lesson nobody
   paid for.

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
     · EVERY OTHER DAY OF WORK IS THE NEXT MORNING'S EMAIL (8 Oct) — at `session_recap_morning` (7)
       London, inside its own 24 hours, right either side of a clock change; never a second email for a
       day that has a session, whatever that session's email did; and only about a CHILD, somebody a
       parent has accepted — never the tutor's, an admin's or a parent's own questions. (§17)
     · EACH QUESTION WITH ITS OWN WORDS — under its paper, the stem its parts share once, each cut to
       what a phone shows, a link or an address never printed, a paper with no words still its line of
       numbers, no raw key, and the HTML escaped. (§18)
     · A SESSION DAY'S NEXT-MORNING FOLLOW-UP — only what its email did not carry, at the morning hour
       or an hour after that email's due, its own receipt; never beside an email still to go, never in
       its hour, never a note of its own; and the Preview shows one only behind a receipt. (§19)

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
   one on 29 Sep, an earlier session's day.

   SINCE 8 OCT THOSE OTHER DAYS ARE EMAILS OF THEIR OWN — the next morning at 07:00 London (§17). So
   Ada's Monday is due at 07:00 on the Tuesday and the first run of every Tuesday world below sends Pat
   that too; the other Ada's Tuesday is her own email, to Ola, at 07:00 on the Wednesday; and a Ben with
   no Booked seat has his Tuesday at 07:00 on the Wednesday. They stay in the world on purpose: a session
   email that swept in Monday's question, or a receipt that could not tell Monday's row from Tuesday's,
   is caught in every section. See `about` below for how each ask keeps to the session it is about. */
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
/* `slot_codes` IS WHAT `createJob` WRITES NOW — every hour the grid ticked. A row without it is a row
   from before, and section 2 asks those separately. */
const J1 = { job_id: 'J-1', status: 'active', subject: 'Maths', service: 'Tuition', weekday: 'Tuesday', start_time: '16:00',
  hours_per_session: 2, venue: 'Online', session_dates: '22/09/2026, 29/09/2026, 06/10/2026, 13/10/2026',
  for_children: 'Ada Pupil, Someone else', kind: '', slot_codes: 'tu16,tu17' };
const E = (job, actor, role, action, target) => ({ event_id: 'e-' + job + '-' + actor + '-' + action, job_id: job, actor: actor,
  role: role, action: action, target: target || '', message: '' });
const booked = (job, client) => [E(job, client, 'client', 'Request'), E(job, 'Sam Tutor', 'tutor', 'Accept', client),
                                 E(job, client, 'client', 'Confirm')];
/* `words` IS WHAT THE PHONE SENDS SINCE 8 OCT (SCHEMA.attempts): the question as a parent reads it. The
   rows here have none unless an ask gives them some — rows marked before the phone sent them, which is
   every row on the live sheet today, and the old line of numbers (§6). §18 asks the words. */
const A = (pid, q, first, last, label, words) => ({ person_id: pid, question_key: q, first_done: first, last_done: last, times: 1,
  label: label || '', words: words || '' });
const PAPER1 = 'Maths · Paper 1 (Calculator) — June 2024';
const ADA = [
  A('P-S1', 'q:ADA-AGAIN', '2026-09-29', '2026-10-06', PAPER1 + ' · Q7'),
  A('P-S1', 'q:ADA-NEW', '2026-10-06', '2026-10-06', PAPER1 + ' · Q3'),
  /* AS THE PHONE SENT IT BEFORE `doneLabel_`: the practical card's own line, minutes and all. A
     parent reads "60 min" as how long the child spent, so it never reaches an email. */
  A('P-S1', 'pr:PR-BI01#iv', '2026-10-06', '2026-10-06', 'Biology · Required practical · 60 min · Osmosis · Worksheet'),
  A('P-S1', 'pr:PR-BI01#dv', '2026-10-06', '2026-10-06', 'Biology · Required practical · 60 min · Osmosis · Worksheet'),
  A('P-S1', 'q:ADA-MON', '2026-10-05', '2026-10-05', 'Maths · Paper 2 · Q1'),
  A('P-S1', 'q:ADA-WED', '2026-10-07', '2026-10-07', 'Maths · Paper 2 · Q9'),
  A('P-S1', 'q:ADA-SEP', '2026-09-29', '2026-09-29', 'Maths · Paper 2 · Q4'),
  /* THE OTHER ADA DID SOMETHING THAT DAY TOO, so picking her by name would be an email to Ola. */
  A('P-S9', 'q:OLA-ADA', '2026-10-06', '2026-10-06', 'Maths · Paper 3 · Q8'),
];
const BEN = A('P-S2', 'q:BEN-1', '2026-10-06', '2026-10-06', 'Maths · Paper 4 · Q2');
/* FOR AN ASK THAT A RUN SENDS AND WRITES NOTHING AT ALL — which a day of work due that hour would
   answer, rightly, with an email. At 20:05 on the Tuesday only Monday's is due, so `TUESDAY` leaves it
   out; a day later the other Ada's Tuesday is due too, so `ADA_ONLY` leaves her out as well. Neither
   row did anything in these worlds before 8 Oct: the session's day, and its strictness, are as they were. */
const TUESDAY = ADA.filter(r => r.question_key !== 'q:ADA-MON');
const ADA_ONLY = TUESDAY.filter(r => r.person_id === 'P-S1');

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
/* THE EMAILS AND ROWS ABOUT ONE DAY. An ask about Tuesday's session reads what was sent about Tuesday —
   `about(w, TUE)` — so it bites exactly as it did before Monday's homework had an email of its own, and
   what that email says is §17's to ask. By the subject, which names the day the email is about ("Ada’s
   session on Tue 6 Oct: 3 questions") whichever rule made it; the log's rows by their `day`. */
const MON = 'Mon 5 Oct', TUE = 'Tue 6 Oct', MON_ = '2026-10-05', TUE_ = '2026-10-06', PAT = 'pat@example.org';
const about = (w, d) => w.mail.sent.filter(m => String(m.subject).indexOf(' on ' + d + ':') !== -1);
const toOn = (w, addr, d) => about(w, d).filter(m => m.to === addr);
const logOn = (w, day) => log(w).filter(x => x.day === day);
const preview = w => JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
/* A WALL-CLOCK STRING PLUS HOURS, as `recapWall_` moves one — for "inside its 24 hours". */
const later = (wall, h) => new Date(Date.parse(String(wall).replace(' ', 'T') + ':00Z') + h * 36e5).toISOString().slice(0, 16).replace('T', ' ');
/* THE LAST LINE OF EVERY EMAIL. One switch stops both kinds, so it no longer says "after sessions". */
const FOOT = 'You get this because you are Ada’s parent on @family. To stop these emails, reply to this one and say so.';

/* ---------- 1. WHEN IT IS DUE: LONDON, TWO HOURS AFTER THE END ---------------------------------------- */
{
  const w = seeded();
  run(w, EARLY);
  ask('at 19:59 London, a minute before due, the run sent ' + about(w, TUE).length + ' email(s) about Tue 6 Oct or wrote its rows — too early',
    !about(w, TUE).length && !logOn(w, TUE_).length);
  const r = run(w, DUE);
  ask('at 20:05 London (19:05 UTC) on 6 Oct the run sent [' + about(w, TUE).map(m => m.to) + '] about Tue 6 Oct (' + JSON.stringify(r).slice(0, 200) + ') — wanted Pat, once',
    about(w, TUE).length === 1 && toOn(w, PAT, TUE).length === 1);
  /* FOUND BY ITS JOB, so the day is still asked: Monday's receipt for Pat is the one with no job. */
  const row = log(w).find(x => x.parent_id === 'P-C1' && x.job_ids) || {};
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
  const w = seeded({ job: { weekday: 'Sunday', start_time: '14:00', session_dates: '25/10/2026', slot_codes: 'su14,su15' },
                     attempts: [A('P-S1', 'q:BACK', '2026-10-25', '2026-10-25', 'Maths · Paper 5 · Q2')] });
  run(w, '2026-10-25T17:30:00Z');
  ask('on the day the clocks go back the run sent at 17:30 UTC — 17:30 GMT, before an 18:00 due', !w.mail.sent.length);
  run(w, '2026-10-25T18:05:00Z');
  ask('on the day the clocks go back the run did not send at 18:05 UTC', w.mail.sent.length === 1);
}
{
  /* A LESSON ENDING AT 22:00 IS DUE AT MIDNIGHT, and the email names the day it was on, not "today".
     A row from before `slot_codes` — its own start, later than the grid's last end, is the end. */
  const w = seeded({ job: { start_time: '20:00', session_dates: '06/10/2026', slot_codes: '' } });
  run(w, '2026-10-06T22:55:00Z');
  ask('a lesson ending at 22:00 London was emailed at 23:55, before midnight', !about(w, TUE).length);
  run(w, '2026-10-06T23:05:00Z');
  const m = about(w, TUE)[0] || {};
  ask('a lesson ending at 22:00 was not emailed at 00:05 the next day, or its email does not name Tue 6 Oct: ' + JSON.stringify(m.subject),
    about(w, TUE).length === 1 && /^Ada’s session on Tue 6 Oct:/.test(m.subject) && /Tuesday 6 October, 8pm to 10pm/.test(m.body) && !/\btoday\b/i.test(m.body));
}
{
  /* THE DELAY. 5 hours: due 23:00 London = 22:00 UTC. With 2 the email would already have gone at 21:05 UTC. */
  const w = seeded();
  cfgSet(w.b, 'session_recap_delay', '5');
  run(w, '2026-10-06T21:05:00Z');
  ask('with session_recap_delay 5 the run sent 3 hours after the lesson', !about(w, TUE).length);
  run(w, '2026-10-06T22:05:00Z');
  ask('with session_recap_delay 5 the run did not send 5 hours after', about(w, TUE).length === 1);
  [['', 2], ['25', 2], ['six', 2], ['-1', 2], ['0', 0], ['12', 12], ['13', 2]].forEach(([v, want]) => {
    const got = w.b.ev('recapDelay_({ session_recap_delay: ' + JSON.stringify(v) + ' })');
    ask('session_recap_delay "' + v + '" reads as ' + got + ', wanted ' + want, got === want);
  });
}

/* ---------- 2. WHEN A DAY'S TEACHING ENDS: THE HOURS TICKED, OR THE LATEST IT COULD BE ------------------------ */
{
  /* MONDAY 10-12 AND FRIDAY 16-18, AS `createJob` KEEPS IT NOW: the row's start is the Monday's, and
     `slot_codes` holds both runs. Each day ends when its own hours do, and says so. */
  const w = seeded({ job: { weekday: 'Monday, Friday', start_time: '10:00', session_dates: '05/10/2026, 09/10/2026',
                            slot_codes: 'm10,m11,f16,f17' },
                     attempts: [A('P-S1', 'q:FRI', '2026-10-09', '2026-10-09', 'Maths · Paper 6 · Q1'),
                                A('P-S1', 'q:MON', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q2')] });
  run(w, '2026-10-05T13:05:00Z');
  const mon = w.mail.sent[0] || {};
  ask('the Monday of a Monday-and-Friday booking with its hours kept was not emailed at 14:05 London with its time: ' + JSON.stringify(mon.body && mon.body.split('\n')[2]),
    w.mail.sent.length === 1 && /Monday 5 October, 10am to 12pm\./.test(mon.body));
  run(w, '2026-10-09T18:30:00Z');
  ask('the Friday (16-18 by its own hours) was emailed at 19:30 London — before its 20:00 due', w.mail.sent.length === 1);
  run(w, '2026-10-09T19:05:00Z');
  const fri = w.mail.sent[1] || {};
  ask('the Friday was not emailed at 20:05 London with its own time, 4pm to 6pm: ' + JSON.stringify(fri.body && fri.body.split('\n')[2]),
    w.mail.sent.length === 2 && /Ada had Maths on Friday 9 October, 4pm to 6pm\./.test(fri.body));
}
{
  /* TWO RUNS ON ONE DAY — the grid lets a family tick Monday 10 and Monday 16-17, and `bookSpec` names
     the session by the first: `weekday` Monday, `start_time` 10:00, one hour. The day ends at 18:00, so
     the email is due at 20:00 London; read off the three cells it went at 13:00 saying "10am to 11am",
     and the afternoon's questions never went at all. Two runs are not one span: no time is printed. */
  const w = seeded({ job: { weekday: 'Monday', start_time: '10:00', hours_per_session: 1, session_dates: '05/10/2026',
                            slot_codes: 'm10,m16,m17' },
                     attempts: [A('P-S1', 'q:AM', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q4'),
                                A('P-S1', 'q:PM', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q5')] });
  run(w, '2026-10-05T12:05:00Z');
  run(w, '2026-10-05T18:05:00Z');
  ask('a Monday booked 10-11 and 16-18 was emailed at ' + (w.mail.sent.length ? 'or before 19:05' : '—') + ' London, before the afternoon’s 20:00 due', !w.mail.sent.length);
  run(w, '2026-10-05T19:05:00Z');
  const m = w.mail.sent[0] || { body: '' };
  ask('a Monday booked 10-11 and 16-18 was not emailed at 20:05 London, or its email states one run as the day: ' + JSON.stringify(m.body.split('\n')[2]),
    w.mail.sent.length === 1 && /Ada had Maths on Monday 5 October\./.test(m.body) && !/10am to 11am/.test(m.body) && !/\d(am|pm) to /.test(m.body)
    && /worked on 2 questions/.test(m.body));
  /* AND THE SAME ROW FROM BEFORE `slot_codes`: nothing says there was only one run, so it is not due
     before the grid's last possible end, 19:00, plus two — 21:00 London. */
  const old = seeded({ job: { weekday: 'Monday', start_time: '10:00', hours_per_session: 1, session_dates: '05/10/2026', slot_codes: '' },
                       attempts: [A('P-S1', 'q:AM', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q4')] });
  run(old, '2026-10-05T12:05:00Z');
  run(old, '2026-10-05T19:30:00Z');
  ask('a Monday 10-11 row with no hours kept was emailed before 21:00 London — a second run that day could end as late as 19:00', !old.mail.sent.length);
  run(old, '2026-10-05T20:05:00Z');
  ask('a Monday 10-11 row with no hours kept was not emailed at 21:05 London', old.mail.sent.length === 1);
}
{
  /* MONDAY AND FRIDAY ON A ROW FROM BEFORE `slot_codes`: the row keeps one start, the first run's. On
     the Monday it is known (not due before 19:00 + 2h); on the Friday it is not, so the end is 18:00 + 2h
     and the email is due at 22:00 London — at 10:00 + 2h + 2h it would go at 14:00 with the Friday lesson
     not yet begun. */
  const w = seeded({ job: { weekday: 'Monday, Friday', start_time: '10:00', session_dates: '05/10/2026, 09/10/2026', slot_codes: '' },
                     attempts: [A('P-S1', 'q:FRI', '2026-10-09', '2026-10-09', 'Maths · Paper 6 · Q1'),
                                A('P-S1', 'q:MON', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q2')] });
  run(w, '2026-10-05T13:05:00Z');
  ask('the Monday of a row with no hours kept was emailed at 14:05 London — 10:00 + 2h + 2h, as if nothing could follow it', !w.mail.sent.length);
  run(w, '2026-10-05T20:05:00Z');
  const mon = w.mail.sent[0] || {};
  ask('the Monday (the first day the booking names, start known) was not emailed at 21:05 London with its time: ' + JSON.stringify(mon.body && mon.body.split('\n')[2]),
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
     Tuesday 16:00 and a date is a Wednesday, which no ticked hour names either. Nothing says when that
     Wednesday's lesson was, if there was one: the latest it could end, and no time in the email. */
  const w = seeded({ job: { session_dates: '06/10/2026, 07/10/2026' },
                     attempts: [A('P-S1', 'q:WEDNESDAY', '2026-10-07', '2026-10-07', 'Maths · Paper 6 · Q3')] });
  run(w, '2026-10-07T20:30:00Z');
  ask('a Wednesday date on a row that names Tuesday was emailed at 21:30 London — its 16:00 start is the Tuesday’s', !w.mail.sent.length);
  run(w, '2026-10-07T21:05:00Z');
  ask('a Wednesday date on a row that names Tuesday was not emailed at 22:05 London, or states a time', w.mail.sent.length === 1 && !/\d(am|pm) to /.test(w.mail.sent[0].body));
}
{
  const w = seeded({ job: { start_time: '', slot_codes: '' } });
  run(w, '2026-10-06T20:30:00Z');
  ask('a lesson with no start time was emailed at 21:30 London — before 18:00 + 2h + 2h', !about(w, TUE).length);
  run(w, '2026-10-06T21:05:00Z');
  ask('a lesson with no start time was not emailed at 22:05 London, or says a time', about(w, TUE).length === 1 && !/\d(am|pm) to /.test(about(w, TUE)[0].body));
}
{
  /* THE SHEET'S OWN SHAPES: a time-of-day Date (on a row with no hours kept, so it is the start that is
     read — due 19:00 + 2h), a two-digit year, and a single date the sheet made a Date. */
  const w = seeded({ job: { start_time: new Date(1899, 11, 30, 16, 0), slot_codes: '' } });
  run(w, '2026-10-06T19:55:00Z'); run(w, '2026-10-06T20:05:00Z');
  ask('start_time as a time-of-day Date did not read as 16:00: ' + about(w, TUE).length + ' sent',
    about(w, TUE).length === 1 && /4pm to 6pm/.test(about(w, TUE)[0].body));
  const y2 = seeded({ job: { session_dates: '29/09/26, 06/10/26' } });
  run(y2, DUE);
  ask('session_dates written dd/mm/yy was not read', about(y2, TUE).length === 1 && /^Ada’s session/.test(about(y2, TUE)[0].subject));
  const one = seeded({ job: { session_dates: '06/10/2026' } });
  ask('the harness did not make a lone date a Date, so the single-Date cell was NOT checked', one.b.tabs.jobs[1][one.b.tabs.jobs[0].indexOf('session_dates')] instanceof Date);
  run(one, DUE);
  ask('a session_dates cell holding one Date was not read', about(one, TUE).length === 1 && /^Ada’s session/.test(about(one, TUE)[0].subject));
}
{
  /* WHAT `createJob` KEEPS, THROUGH THE REAL HANDLER: every hour ticked, as sent; nothing for an older
     phone that sent none (the three cells' reading would claim the first run is the only one); and an
     Edit that moves the day and the time takes the old hours away with it. */
  const w = seeded();
  const { b } = w;
  b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
  const tok = (b.post({ action: 'verifyLogin', email: 'pat@example.org', pin: '0000' }) || {}).token;
  const job = extra => {
    const d = b.post(Object.assign({ action: 'createJob', token: tok, name: 'Pat Parent', personId: 'P-C1', requestedTutor: 'No preference',
      subject: 'Maths', level: 'GCSE', location: 'Online', day: 'Monday', time: '10:00', hours: 1, price: 90,
      dates: '05/10/2026', kids: 'Ada Pupil' }, extra));
    const row = rowsOf(b, 'jobs').find(r => r.job_id === d.jobId) || {};
    return { d, row };
  };
  const ticked = job({ slots: 'm10,M16, m17,zz9,m99,m16' });
  ask('createJob did not keep the hours ticked as `slot_codes`: ' + JSON.stringify(ticked.d).slice(0, 160) + ' / ' + JSON.stringify(ticked.row.slot_codes),
    ticked.d.success && ticked.row.slot_codes === 'm10,m16,m17');
  const older = job({});
  ask('createJob from a phone that sent no slots stored ' + JSON.stringify(older.row.slot_codes) + ' — wanted blank, not the first run claimed as the whole day',
    older.d.success && older.row.slot_codes === '');
  /* A LIVE JOBS TAB FROM BEFORE THE COLUMN — the hours between a deploy and the `?setup=1` that adds it.
     A write to a column that is not there turns the reply into an error, for a row that WAS appended:
     every family pressing Ask would be told it failed, and ask again. The hours are let go instead. */
  {
    const v = seeded();
    v.b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
    const g = v.b.tabs.jobs, ci = g[0].indexOf('slot_codes');
    g.forEach(r => r.splice(ci, 1));
    v.b.ev('clearCache()');
    const vt = (v.b.post({ action: 'verifyLogin', email: 'pat@example.org', pin: '0000' }) || {}).token;
    const n0 = g.length;
    const d = v.b.post({ action: 'createJob', token: vt, name: 'Pat Parent', personId: 'P-C1', requestedTutor: 'No preference',
      subject: 'Maths', level: 'GCSE', location: 'Online', day: 'Monday', time: '10:00', hours: 1, price: 90,
      dates: '05/10/2026', kids: 'Ada Pupil', slots: 'm10,m16,m17' });
    ask('on a jobs tab with no slot_codes column yet, createJob answered ' + JSON.stringify(d).slice(0, 200) + ' — a booking must not fail over the hours it could not keep',
      d.success && !d.error && g.length === n0 + 1);
    v.mail.sent.length = 0; v.mail.unreceipted.length = 0; v.mail.locked.length = 0;
  }
  /* THE EDIT MOVE, while the family is still agreeing terms. A day or a time changed with no hours
     sent: the old hours no longer describe it. New hours sent: those. */
  const moved = job({ slots: 'm10,m11' });
  const edit = b.post({ action: 'move', token: tok, jobId: moved.d.jobId, role: 'client', name: 'Pat Parent', move: 'Edit',
    edits: { day: 'Wednesday', time: '15:00' } });
  const after = rowsOf(b, 'jobs').find(r => r.job_id === moved.d.jobId) || {};
  ask('an Edit that moved the day and time left the old hours in slot_codes: ' + JSON.stringify(edit).slice(0, 160) + ' / ' + JSON.stringify(after.slot_codes),
    !edit.error && after.weekday === 'Wednesday' && after.slot_codes === '');
  const edit2 = b.post({ action: 'move', token: tok, jobId: moved.d.jobId, role: 'client', name: 'Pat Parent', move: 'Edit',
    edits: { day: 'Thursday', time: '14:00', slots: 'th14,th15' } });
  const after2 = rowsOf(b, 'jobs').find(r => r.job_id === moved.d.jobId) || {};
  ask('an Edit that sent its hours did not keep them: ' + JSON.stringify(edit2).slice(0, 160) + ' / ' + JSON.stringify(after2.slot_codes), !edit2.error && after2.slot_codes === 'th14,th15');
  const say = b.post({ action: 'move', token: tok, jobId: moved.d.jobId, role: 'client', name: 'Pat Parent', move: 'Edit',
    edits: { price: 95 } });
  ask('an Edit that moved neither the day nor the time touched slot_codes', !say.error && (rowsOf(b, 'jobs').find(r => r.job_id === moved.d.jobId) || {}).slot_codes === 'th14,th15');
  /* AND THE JOB `createJob` WROTE IS EMAILED AFTER THE AFTERNOON, not the morning. The mail the
     handlers above sent ("Booking received") is theirs, not this email's, and is set aside. */
  w.mail.sent.length = 0; w.mail.unreceipted.length = 0; w.mail.locked.length = 0;
  b.seed('events', [E(ticked.d.jobId, 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent'), E(ticked.d.jobId, 'Pat Parent', 'client', 'Confirm')]);
  b.seed('attempts', [A('P-S1', 'q:NEWJOB', '2026-10-05', '2026-10-05', 'Maths · Paper 6 · Q6')]);
  run(w, '2026-10-05T13:05:00Z');
  ask('the booking createJob just wrote (Monday 10, and 16-17) was emailed at 14:05 London, before its afternoon', !w.mail.sent.length);
  run(w, '2026-10-05T19:05:00Z');
  ask('the booking createJob just wrote was not emailed at 20:05 London, after its afternoon: ' + w.mail.sent.map(m => m.subject),
    w.mail.sent.length === 1 && /^Ada’s session on Mon 5 Oct/.test(w.mail.sent[0].subject));
}

/* ---------- 3. NO BACKFILL ---------------------------------------------------------------------------------- */
{
  /* THE FIRST RUN EVER, at 20:05 on the Tuesday, reaches Tuesday's session and — since 8 Oct — Monday's
     homework, due at 07:00 that morning: nothing about 22 or 29 Sep, the earlier lessons' days, and no
     row for anything whose 24 hours are not running now. */
  const w = seeded();
  run(w, DUE);
  const subj = w.mail.sent.map(m => m.subject).sort();
  ask('the first run emailed about another day than Tue 6 Oct’s session and Mon 5 Oct’s work: ' + subj.join(' | '),
    subj.join(' | ') === 'Ada’s session on Tue 6 Oct: 3 questions | Ada’s work on Mon 5 Oct: 1 question');
  const now = '2026-10-06 20:05';
  ask('the first run wrote rows for 22 or 29 Sep, an earlier lesson’s days, or for something outside its 24 hours: ' + JSON.stringify(log(w).map(x => x.day + ' due ' + x.due)),
    log(w).length && log(w).every(x => x.day >= MON_ && x.due <= now && now < later(x.due, 24)));
}
{
  /* SWITCHED ON A DAY LATE: 20:30 London on 7 Oct is due + 24.5h. Nothing — and nothing about Ada's
     Tuesday as a day of work either, though one would be due at 07:00 that morning: a session out of its
     window still has its day (§17). `ADA_ONLY`: the other Ada's Tuesday is her own email, rightly due now. */
  const w = seeded({ attempts: ADA_ONLY });
  const w0 = weight(w.b);
  run(w, '2026-10-07T19:30:00Z');
  ask('a run 24.5 hours after due sent ' + w.mail.sent.length + ' and wrote ' + (weight(w.b) - w0) + ' — past the window is nothing', !w.mail.sent.length && weight(w.b) === w0);
}
{
  const seedHeld = w => w.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', job_ids: "'J-1",
    due: "'2026-10-06 20:00", to: 'pat@example.org', status: 'held', note: 'daily mail quota' }]);
  const late = seeded({ attempts: ADA_ONLY }); seedHeld(late);
  run(late, '2026-10-07T19:30:00Z');
  ask('a held email past its 24 hours was sent', !late.mail.sent.length && (log(late)[0] || {}).status === 'held');
  const still = seeded({ attempts: ADA_ONLY }); seedHeld(still);
  run(still, '2026-10-07T18:00:00Z');
  const patRows = log(still).filter(x => x.parent_id === 'P-C1');
  ask('a held email at due + 23h was not sent, once: ' + JSON.stringify(patRows), still.mail.sent.length === 1 && patRows.length === 1 && patRows[0].status === 'sent');
}

/* ---------- 4. ONLY BOOKED SEATS -------------------------------------------------------------------------- */
{
  const w = seeded({ events: [E('J-1', 'Pat Parent', 'client', 'Request')], attempts: TUESDAY });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a request nobody agreed to sent ' + w.mail.sent.length + ' and wrote ' + (weight(w.b) - w0) + ' — wanted neither', !w.mail.sent.length && weight(w.b) === w0);
  w.setClock(at('2026-10-06T19:30:00Z'));
  const pv = preview(w);
  const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
  ask('the Preview does not say the unanswered request is "not agreed": ' + JSON.stringify(day.sessions), (day.sessions || []).some(s => /not agreed/.test(s.state)));
  /* AND SINCE 8 OCT ADA'S TUESDAY IS A DAY OF WORK — no lesson counted, so the next morning's email,
     which names no lesson. */
  run(w, '2026-10-07T06:05:00Z');
  const m = toOn(w, PAT, TUE)[0] || { subject: '', body: '' };
  ask('a day whose lesson nobody agreed to did not go as a day of work at 07:05 the next morning, naming no lesson: ' + JSON.stringify(m.subject),
    toOn(w, PAT, TUE).length === 1 && m.subject === 'Ada’s work on Tue 6 Oct: 3 questions' && !/Maths on|session/.test(m.body));
}
{
  /* AGREED WITH SAM AND NOT PAID, ON A DAY ADA DID QUESTIONS. No email names the lesson, and the row
     says why — but since 8 Oct that day's questions are the next morning's email whatever happens to the
     lesson, so the row says they go "either way" and promises no send (`recapJobNotes_` is handed every
     group, the day-of-work ones too). Marked paid inside the window, the session's own email goes
     instead, and the next morning does not add a second. */
  const w = seeded({ events: [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent')], attempts: TUESDAY });
  run(w, DUE);
  const rows = logOn(w, TUE_);
  ask('agreed with Sam but not paid, on a day Ada did questions: wanted one job row saying her questions go "either way", not "mark it paid", and no email — got '
    + JSON.stringify(rows) + ' and ' + w.mail.sent.length + ' sent',
    !w.mail.sent.length && rows.length === 1 && rows[0].learner_id === '' && rows[0].job_ids === 'J-1' && rows[0].status === 'not sent'
    && /agreed with the tutor/.test(rows[0].note) && /either way/.test(rows[0].note) && !/mark it paid|next hourly check sends/.test(rows[0].note));
  /* IN THESE WORDS: "until it is marked paid", because marking it paid inside the window is what names
     it — and "to the parents", because since 8 Oct that day is an email whether the child had one or not.
     The old row said the questions were "in the child’s email", which is two claims nobody can keep. */
  ask('the unpaid lesson’s row does not say it is unnamed only until it is marked paid, and that day’s questions go to the parents either way: ' + JSON.stringify(rows[0] && rows[0].note),
    rows.length === 1 && rows[0].note === 'Maths: agreed with the tutor but nobody’s seat is Booked — so until it is marked paid it is not named in the email; that day’s questions go to the parents either way');
  w.b.seed('events', [E('J-1', 'Pat Parent', 'client', 'Confirm')]);
  run(w, '2026-10-06T20:05:00Z');
  ask('marked paid within the window, the next hourly check did not send the session’s email: ' + w.mail.sent.map(m => m.subject),
    w.mail.sent.length === 1 && toOn(w, PAT, TUE).length === 1 && /^Ada’s session on Tue 6 Oct/.test(w.mail.sent[0].subject));
  run(w, '2026-10-07T06:05:00Z');
  ask('the morning after the session’s email went, Ada’s Tuesday went again as a day of work: ' + toOn(w, PAT, TUE).map(m => m.subject),
    toOn(w, PAT, TUE).length === 1);
}
{
  /* "MARK IT PAID" IS STILL THE ROW WHEN NOTHING ELSE WILL TELL PAT ABOUT THAT DAY. Ada's Tuesday
     questions are on her phone, done offline, at 20:05 — no day of work to email — so the row says to
     mark it paid. She opens the app and they arrive; Pat marks it paid; the next hourly check sends it. */
  const onTue = r => r.first_done === TUE_ || r.last_done === TUE_;
  const w = seeded({ events: [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent')],
                     attempts: TUESDAY.filter(r => !onTue(r)) });
  run(w, DUE);
  const rows = log(w);
  ask('agreed with Sam but not paid, nothing else to tell Pat that day: wanted one job row saying "mark it paid" and no email, got ' + JSON.stringify(rows) + ' and ' + w.mail.sent.length + ' sent',
    !w.mail.sent.length && rows.length === 1 && rows[0].learner_id === '' && rows[0].job_ids === 'J-1' && rows[0].status === 'not sent' && /mark it paid/.test(rows[0].note));
  w.b.seed('events', [E('J-1', 'Pat Parent', 'client', 'Confirm')]);
  w.b.seed('attempts', TUESDAY.filter(onTue));
  run(w, '2026-10-06T20:05:00Z');
  ask('marked paid within the window, the next hourly check did not send it', toOn(w, PAT, TUE).length === 1 && /^Ada’s session/.test(toOn(w, PAT, TUE)[0].subject));
}
[['cancelled before paying', [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Pat Parent', 'client', 'Withdraw')]],
 ['paid, then withdrew as the only seat', booked('J-1', 'Pat Parent').concat([E('J-1', 'Pat Parent', 'client', 'Withdraw')])]].forEach(([what, events]) => {
  const w = seeded({ events: events, attempts: TUESDAY });
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
  ask('with Bo’s paid seat withdrawn, the run emailed [' + about(w, TUE).map(m => m.to) + '] about Tue 6 Oct — wanted Pat alone', about(w, TUE).length === 1 && toOn(w, PAT, TUE).length === 1);
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
  ask('a job whose kind is "session" is not treated as a lesson', about(w, TUE).length === 1 && /^Ada’s session/.test(about(w, TUE)[0].subject));
}
['waitlist', 'festive'].forEach(k => {
  const w = seeded({ job: { kind: k }, attempts: TUESDAY });
  const w0 = weight(w.b);
  run(w, DUE);
  ask('a ' + k + ' job sent ' + w.mail.sent.length + ' or wrote ' + (weight(w.b) - w0), !w.mail.sent.length && weight(w.b) === w0);
});

/* ---------- 5. WHO THE SESSION IS ABOUT ----------------------------------------------------------------------- */
{
  const w = seeded({ job: { for_children: 'Someone else' }, attempts: TUESDAY });
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
  ask('a name on the booking that is nobody’s child is not a job row naming it: ' + JSON.stringify(logOn(w, TUE_)),
    !about(w, TUE).length && logOn(w, TUE_).some(x => x.learner_id === '' && x.job_ids === 'J-1' && /Zed Nobody/.test(x.note)));
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
  ask('Ben, who booked his own seat, was not the learner: sent [' + about(w, TUE).map(m => m.to + ' ' + m.subject) + '] about Tue 6 Oct',
    about(w, TUE).length === 1 && toOn(w, 'bo@example.org', TUE).length === 1 && /^Ben’s session/.test(about(w, TUE)[0].subject));
}
{
  const one = seeded({ job: { for_children: '' } });
  run(one, DUE);
  ask('a booking naming nobody, by a parent with one child, was not about that child', about(one, TUE).length === 1 && toOn(one, PAT, TUE).length === 1);
  const two = seeded({ job: { for_children: '' }, moreFamily: [L(9, 'P-C1', 'P-S2', 'accepted')], moreAttempts: [BEN] });
  run(two, DUE);
  ask('a booking naming nobody, by a parent with two children, guessed: sent ' + about(two, TUE).length + ' about Tue 6 Oct, log ' + JSON.stringify(logOn(two, TUE_)),
    !about(two, TUE).length && logOn(two, TUE_).some(x => x.job_ids === 'J-1' && /which of Pat Parent’s children/.test(x.note)));
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
  const pat = toOn(w, PAT, TUE), bo = toOn(w, 'bo@example.org', TUE);
  ask('a booking split between two families did not send each family its own child: Pat ' + pat.map(m => m.subject) + ', Bo ' + bo.map(m => m.subject),
    pat.length === 1 && bo.length === 1 && /^Ada’s/.test(pat[0].subject) && /^Ben’s/.test(bo[0].subject));
  ask('in a split booking one family was told about the other’s child', !/Ada/.test((bo[0] || {}).body || '') && !/Ben/.test((pat[0] || {}).body || ''));
}
{
  const w = seeded({ job: { for_children: 'Ada' } });
  run(w, DUE);
  ask('a first name on the booking, unique among the booker’s children, was not matched', toOn(w, PAT, TUE).length === 1);
}

/* A FAMILY THAT JOINS AN OPEN CLASS. `for_children` is the booker's answer, and a family that came in
   later by Ask to join was asked nothing — so its seat reads as a booking that named nobody: its only
   child, or a row saying which of its children, never silence. Bo joins the way the lobby does it:
   Request, Sam accepts him, he pays. */
const joins = (job, who) => [E(job, who, 'client', 'Request'), E(job, 'Sam Tutor', 'tutor', 'Accept', who), E(job, who, 'client', 'Confirm')];
{
  const w = seeded({ job: { for_children: 'Ada Pupil' }, moreAttempts: [BEN], events: booked('J-1', 'Pat Parent').concat(joins('J-1', 'Bo Other')) });
  run(w, DUE);
  ask('Bo joined Pat’s class and paid; the run emailed [' + about(w, TUE).map(m => m.to + ' ' + m.subject) + '] — wanted Pat about Ada and Bo about Ben',
    toOn(w, PAT, TUE).length === 1 && /^Ada’s session/.test(toOn(w, PAT, TUE)[0].subject)
    && toOn(w, 'bo@example.org', TUE).length === 1 && /^Ben’s session/.test(toOn(w, 'bo@example.org', TUE)[0].subject));
}
{
  const w = seeded({ job: { for_children: 'Someone else' }, moreAttempts: [BEN], events: booked('J-1', 'Pat Parent').concat(joins('J-1', 'Bo Other')) });
  run(w, DUE);
  ask('Pat booked for "Someone else" and Bo joined; Bo was not emailed about Ben, his only child: [' + about(w, TUE).map(m => m.to) + ']',
    about(w, TUE).length === 1 && toOn(w, 'bo@example.org', TUE).length === 1 && /^Ben’s session/.test(about(w, TUE)[0].subject));
  w.setClock(at(DUE));
  const pv = preview(w);
  const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
  ask('the Preview does not put Ben on the session Bo joined: ' + JSON.stringify(day.sessions), (day.sessions || []).some(s => (s.learners || []).indexOf('Ben Pupil') !== -1));
}
{
  /* BO WITH TWO CHILDREN joins, and nothing says which: a row, not silence. */
  const w = seeded({ job: { for_children: 'Ada Pupil' }, people: [P('P-S4', 'Dot', 'Other', 'student', 's4@example.org')],
    moreFamily: [L(11, 'P-C5', 'P-S4', 'accepted')], moreAttempts: [BEN], events: booked('J-1', 'Pat Parent').concat(joins('J-1', 'Bo Other')) });
  run(w, DUE);
  ask('Bo, with two children, joined and nothing said which; wanted a "which of Bo Other’s children" row and Pat’s email alone: ' + JSON.stringify(log(w).filter(x => x.job_ids === 'J-1')),
    log(w).some(x => x.learner_id === '' && x.job_ids === 'J-1' && /which of Bo Other’s children/.test(x.note))
    && !to(w, 'bo@example.org').length && toOn(w, PAT, TUE).length === 1);
}
{
  /* WHO BOOKED IS THE FIRST CLIENT TO ASK — `createJob`'s own Request — not whichever seat the roster
     lists first. Pat asked, stepped out before paying and came back after Bo had joined and paid, so
     the roster now lists Bo first; the booking's "Someone else" is still Pat's word, not his. */
  const w = seeded({ job: { for_children: 'Someone else' }, moreAttempts: [BEN],
    events: [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Pat Parent', 'client', 'Withdraw')].concat(joins('J-1', 'Bo Other'),
            [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent'), E('J-1', 'Pat Parent', 'client', 'Confirm')]) });
  run(w, DUE);
  ask('with Bo first on the roster, the booker’s "Someone else" was read as Bo’s: [' + about(w, TUE).map(m => m.to) + ']',
    toOn(w, 'bo@example.org', TUE).length === 1 && !toOn(w, PAT, TUE).length);
}

/* ---------- 6. THAT DAY'S QUESTIONS, AND WHAT MAY BE PRINTED ---------------------------------------------------- */
{
  const w = seeded();
  run(w, DUE);
  const m = toOn(w, PAT, TUE)[0] || { body: '', htmlBody: '' };
  ask('Pat’s email does not count 3 that day, 2 of them new: ' + m.body.split('\n')[2], /That day Ada worked on 3 questions, 2 of them for the first time\./.test(m.body));
  ask('Pat’s email lists a question from another day (Paper 2)', !/Paper 2/.test(m.body));
  /* AND MONDAY'S QUESTION IS IN MONDAY'S EMAIL, which has none of Tuesday's. */
  const mon = toOn(w, PAT, MON)[0] || { body: '' };
  ask('Monday’s email to Pat does not list Monday’s question alone: ' + JSON.stringify(mon.body),
    mon.body.indexOf('Maths · Paper 2\nQ1\n') !== -1 && !/Paper 1|Paper 3|Biology|Q9/.test(mon.body));
  /* NO WORDS ON THESE ROWS, so the paper is still its line of numbers — §18 asks the words. */
  ask('Pat’s email does not group by paper with the again marker: ' + JSON.stringify(m.body), m.body.indexOf(PAPER1 + '\nQ3, Q7 (again)') !== -1);
  ask('a practical’s two boxes are not one question, by its name, once', (m.body.match(/Worksheet/g) || []).length === 1 && /Biology · Required practical · Osmosis\nWorksheet/.test(m.body));
  ask('a practical’s heading carries the card’s duration, which a parent reads as time spent: ' + JSON.stringify((m.body.match(/Biology[^\n]*/) || [''])[0]),
    !/\d+ min/.test(m.body + m.htmlBody));
  /* THE FOOTER IS BOTH EMAILS' SINCE 8 OCT — one switch, `session_email`, stops both. */
  ['Hello Pat,', 'Ada had Maths on Tuesday 6 October, 4pm to 6pm.', 'Ada can see them on the site: https://halexdias31-pixel.github.io/family/', FOOT].forEach(s => {
    ask('Pat’s email does not say "' + s + '"', m.body.indexOf(s) !== -1);
  });
  ask('Pat’s email still says the emails it stops are "after sessions"', !/after sessions/.test(m.body + m.htmlBody));
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
  const m = toOn(w, PAT, TUE)[0] || { body: '', htmlBody: '' };
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
  const ada = logOn(w, TUE_).find(x => x.learner_id === 'P-S1' && x.parent_id === '') || {};
  ask('a due learner with nothing that day was emailed, or has no "nothing done" row saying why: ' + JSON.stringify(ada),
    !toOn(w, PAT, TUE).length && ada.status === 'nothing done' && /signed in as Ada Pupil/.test(ada.note));
  ask('the nothing-done note does not name the tutor’s account and the 9 questions on it: ' + ada.note, /9 were marked that day on Sam Tutor’s account \(the tutor\)/.test(ada.note));
  ask('an email mentions the tutor’s name or account', about(w, TUE).length === 1 && !w.mail.sent.some(m => /Sam/.test(m.body + m.htmlBody + m.subject)));
  const w0 = weight(w.b);
  run(w, '2026-10-06T19:35:00Z');
  ask('a second hourly run rewrote ' + (weight(w.b) - w0) + ' cell(s) that said the same thing', weight(w.b) === w0);
  w.b.seed('attempts', [A('P-S1', 'q:LATE', '2026-10-06', '2026-10-06', 'Maths · Paper 7 · Q1')]);
  run(w, '2026-10-06T20:05:00Z');
  ask('attempts that arrived within the window were not sent at the next run', toOn(w, PAT, TUE).length === 1);
  /* AND THE TUTOR'S NINE ARE NOT A DAY OF WORK OF THEIR OWN the next morning — Sam is nobody's child (§17). */
  run(w, '2026-10-07T06:05:00Z');
  ask('the morning after, the nine questions on the tutor’s own account made an email or a row: ' + JSON.stringify(log(w).filter(x => x.learner_id === 'P-T1')),
    !log(w).some(x => x.learner_id === 'P-T1') && !w.mail.sent.some(m => /Sam/.test(m.body + m.subject)));
}

/* ---------- 8. WHO IS TOLD ------------------------------------------------------------------------------------- */
{
  const w = seeded();
  run(w, DUE);
  ask('Pat was not emailed', toOn(w, PAT, TUE).length === 1);
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
  ask('a parent whose weekly_email says no and session_email is blank was not emailed after the session', toOn(w, PAT, TUE).length === 1);
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
  /* ONE A DAY: Tuesday's session and Monday's work are one email each to the shared mailbox. */
  const w = seeded({ people: [P('P-C6', 'Pip', 'Parent', 'client', 'pat@example.org')], moreFamily: [L(10, 'P-C6', 'P-S1', 'accepted')] });
  run(w, DUE);
  ask('two parents on one address got ' + toOn(w, PAT, TUE).length + ' emails about Tue 6 Oct and ' + toOn(w, PAT, MON).length + ' about Mon 5 Oct, wanted one each',
    toOn(w, PAT, TUE).length === 1 && toOn(w, PAT, MON).length === 1 && to(w, PAT).length === 2);
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
  const w = seeded({ jobs: [Object.assign({}, J1, { job_id: 'J-2', subject: 'Physics', start_time: '10:00', slot_codes: 'tu10,tu11' })],
                     events: booked('J-1', 'Pat Parent').concat(booked('J-2', 'Pat Parent')) });
  run(w, '2026-10-06T13:05:00Z');
  ask('with Physics 10-12 and Maths 16-18, an email went at 14:05 London — after the first session, not the last', !about(w, TUE).length);
  run(w, DUE);
  const m = about(w, TUE)[0] || { body: '', subject: '' };
  ask('two sessions in a day were not one email naming both: ' + about(w, TUE).length + ' sent, ' + JSON.stringify(m.body.split('\n')[2]),
    about(w, TUE).length === 1 && /Ada had two sessions on Tuesday 6 October: Physics, 10am to 12pm, and Maths, 4pm to 6pm\./.test(m.body)
    && /^Ada’s sessions on Tue 6 Oct/.test(m.subject));
  ask('the receipt for two sessions does not name both jobs', (logOn(w, TUE_).find(x => x.parent_id === 'P-C1') || {}).job_ids === 'J-1,J-2');
  run(w, '2026-10-06T19:35:00Z');
  ask('the rerun sent again', about(w, TUE).length === 1);
}

{
  /* A PAID MORNING AND AN AFTERNOON AGREED BUT NOT PAID. The afternoon holds the day back — one email
     after it ends, with every question of the day — and its row does not promise an email that marking
     it paid could no longer send: the day's receipt is spent by then. */
  const w = seeded({ jobs: [Object.assign({}, J1, { job_id: 'J-2', subject: 'Physics', start_time: '10:00', slot_codes: 'tu10,tu11' })],
                     events: booked('J-2', 'Pat Parent').concat([E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent')]) });
  run(w, '2026-10-06T13:05:00Z');
  ask('with Physics 10-12 paid and Maths 16-18 agreed but unpaid, an email went at 14:05 London, before the afternoon', !about(w, TUE).length);
  run(w, DUE);
  const m = about(w, TUE)[0] || { body: '' };
  ask('the paid morning and unpaid afternoon were not one email at 20:05 London, naming the paid lesson: ' + about(w, TUE).length + ' sent, ' + JSON.stringify(m.body.split('\n')[2]),
    about(w, TUE).length === 1 && /Ada had Physics on Tuesday 6 October, 10am to 12pm\./.test(m.body) && /worked on 3 questions/.test(m.body));
  const j1 = log(w).find(x => x.learner_id === '' && x.job_ids === 'J-1') || {};
  ask('the unpaid afternoon’s row promises a send it cannot make, or is missing: ' + JSON.stringify(j1.note),
    j1.status === 'not sent' && /agreed with the tutor/.test(j1.note) && /not named in the email/.test(j1.note) && !/next hourly check sends it/.test(j1.note));
  w.b.seed('events', [E('J-1', 'Pat Parent', 'client', 'Confirm')]);
  run(w, '2026-10-06T20:05:00Z');
  ask('marking the afternoon paid after the day’s email sent a second one', about(w, TUE).length === 1);
}

/* ---------- 10. OFF, PREVIEW, SEND --------------------------------------------------------------------------- */
{
  /* `TUESDAY`: every count here is "the one email", the session's. */
  const w = seeded({ mode: null, attempts: TUESDAY });
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

/* ---------- 11. THE SHARED ENGINE: QUOTA, FAILURES, AT MOST ONCE, THE LOCK -------------------------------------
   `TUESDAY` throughout: the counts are of the session's emails, and Monday's would take a quota place. */
const split = { job: { for_children: 'Ada Pupil, Ben Pupil' }, attempts: TUESDAY, moreAttempts: [BEN],
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
  const w = seeded({ attempts: TUESDAY });
  w.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', to: 'pat@example.org', status: 'sending' }]);
  run(w, DUE);
  ask('a row left `sending` was sent again', !w.mail.sent.length);
}
{
  /* THE 23 HOURS AFTER IT WENT. Every hourly check inside the window plans the email again, and
     `digestMail_` takes the script lock to re-read the log for it — 24 times a day per email, with
     `markDone` waiting on the same lock. So what the log ALREADY says is sent or `sending` is counted off
     the copy read without the lock (`recapRun_`'s pre-filter), and the one lock an hour takes is the
     notes'. Counted by wrapping the world's own lock; and in `preview`, a row the same as last hour's is
     not written again, which a fresh `at` on every claim would be. */
  const locks = w => {
    let n = 0;
    const L0 = w.G.LockService, real = L0.getScriptLock;
    L0.getScriptLock = () => { const l = real(); return { tryLock: x => { n++; return l.tryLock(x); }, waitLock: x => { n++; return l.waitLock(x); },
                                                         releaseLock: () => l.releaseLock() }; };
    return () => n;
  };
  const w = seeded({ attempts: ADA_ONLY });
  run(w, DUE);
  const n = locks(w), w0 = weight(w.b), rows0 = JSON.stringify(w.b.tabs.recap_log);
  const r = run(w, '2026-10-06T20:05:00Z');
  ask('the hour after Pat’s email went took the lock ' + n() + ' time(s), wrote ' + (weight(w.b) - w0) + ' (' + JSON.stringify(r).slice(0, 160) + ') — wanted once, for the notes, nothing written, and the email counted already',
    n() === 1 && r.already === 1 && weight(w.b) === w0 && JSON.stringify(w.b.tabs.recap_log) === rows0 && w.mail.sent.length === 1);
  const s = seeded({ attempts: ADA_ONLY });
  s.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', job_ids: "'J-1", due: "'2026-10-06 20:00", to: PAT, status: 'sending' }]);
  const sn = locks(s);
  const rs = run(s, DUE);
  ask('a row left `sending` was claimed under the lock again (' + sn() + ' lock(s)) or not counted already: ' + JSON.stringify(rs).slice(0, 160),
    sn() === 1 && rs.already === 1 && !s.mail.sent.length && (log(s).find(x => x.parent_id === 'P-C1') || {}).status === 'sending');
  const p = seeded({ attempts: ADA_ONLY, mode: 'preview' });
  run(p, DUE);
  const pn = locks(p), pw = weight(p.b);
  const rp = ['2026-10-06T19:35:00Z', '2026-10-06T20:05:00Z', '2026-10-06T21:05:00Z', '2026-10-06T22:05:00Z'].map(x => run(p, x));
  ask('four more hourly checks in preview wrote ' + (weight(p.b) - pw) + ' cell(s) over a preview row that had not changed, and took the lock ' + pn() + ' time(s) — wanted nothing written and one lock an hour, the notes’',
    weight(p.b) === pw && pn() === 4 && rp.every(x => x.previewed === 1) && !p.mail.sent.length);
}
{
  const w = seeded({ attempts: TUESDAY });
  w.b.ev('(function () { const real = setCells; let once = true; setCells = function (t, row, v) {'
       + ' if (once && v && v.status === "sent") { once = false; throw new Error("Service Spreadsheets timed out"); }'
       + ' return real.apply(this, arguments); }; })()');
  const r1 = run(w, DUE);
  run(w, '2026-10-06T20:05:00Z');
  ask('a `sent` write that failed after the email went led to ' + w.mail.sent.length + ' emails; log ' + JSON.stringify(log(w).map(x => x.status)),
    w.mail.sent.length === 1 && !r1.failed && log(w).some(x => x.status === 'sending'));
}
{
  const w = seeded({ attempts: TUESDAY });
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
  const quiet = seeded({ attempts: TUESDAY }); quiet.setClock(at(EARLY));
  ask('sessionRecapRun threw with nothing due: ' + thrown(quiet), !thrown(quiet));
  const clean = seeded({ attempts: TUESDAY }); clean.setClock(at(DUE));
  ask('sessionRecapRun threw on a clean run: ' + thrown(clean), !thrown(clean) && clean.mail.sent.length === 1);
  const held = seeded({ quota: 5, attempts: TUESDAY }); held.setClock(at(DUE));
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
{
  /* AND THE TWO COLUMNS THE DAILY EMAIL ADDED, BY NAME. A Ledger synced before `ensureSchema` ran has
     both tabs and neither `attempts.words` (every email a line of numbers) nor `recap_log.question_keys`
     (no session day ever has a follow-up). Nothing errors without them — that is the point of both
     guards — so the admin's Preview is the one place that says so, and names which. */
  const dropCol = (w, tab, col) => { const g = w.b.tabs[tab], i = g[0].indexOf(col); if (i >= 0) g.forEach(r => r.splice(i, 1)); w.b.ev('clearCache()'); };
  const words = seeded(); dropCol(words, 'attempts', 'words'); words.setClock(at(DUE));
  const pw = preview(words);
  ask('the Preview with no attempts.words column warns ' + JSON.stringify(pw.warning) + ' — wanted that column named, and /exec?setup=1',
    pw.success && /attempts\.words/.test(pw.warning) && !/question_keys/.test(pw.warning) && /setup=1/.test(pw.warning));
  const keys = seeded(); dropCol(keys, 'recap_log', 'question_keys'); keys.setClock(at(DUE));
  const pk = preview(keys);
  ask('the Preview with no recap_log.question_keys column warns ' + JSON.stringify(pk.warning) + ' — wanted that column named, and /exec?setup=1',
    pk.success && /recap_log\.question_keys/.test(pk.warning) && !/attempts\.words/.test(pk.warning) && /setup=1/.test(pk.warning));
  const both = seeded(); dropCol(both, 'attempts', 'words'); dropCol(both, 'recap_log', 'question_keys'); both.setClock(at(DUE));
  const pb = preview(both);
  ask('the Preview missing both columns warns ' + JSON.stringify(pb.warning) + ' — wanted both named, and "add them"',
    /attempts\.words/.test(pb.warning) && /recap_log\.question_keys/.test(pb.warning) && /add them\./.test(pb.warning));
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
  /* AND WHETHER IT CAN STILL GO, so the sheet does not say "not on the log yet" over one past its 24 hours. */
  ask('the Preview’s email does not say whether it is due, still to come or past: ' + pat.state, pat.state === 'due');
  ask('the Preview does not list Pam as opted out', (day.nobody || []).some(n => /Pam Parent/.test(n.name) && /session_email/.test(n.why)));
  ask('the Preview prints an unsafe label', !/pay\.example/.test(JSON.stringify(pv)));
  /* AND SINCE 8 OCT THE DAYS OF WORK BESIDE THE SESSIONS — Monday's email under Monday, due 7am on the
     Tuesday and due now; Tuesday's day has the session's email for Pat and no second one — and the
     morning hour, which the card says and whose absence it reads as an old backend (js/digest.js). */
  ask('the recapPreview reply does not carry the morning hour: ' + pv.morning, pv.morning === 7);
  const mon = (((pv.days || [])[1] || {}).emails || []).filter(m => m.to === 'pat@example.org');
  ask('the Preview does not list Monday’s day of work with Pat’s email, due 7am on Tue 6 Oct: ' + JSON.stringify(mon).slice(0, 240),
    (pv.days || [])[1] && pv.days[1].day === '2026-10-05' && mon.length === 1 && mon[0].subject === 'Ada’s work on Mon 5 Oct: 1 question'
    && mon[0].dueSaid === '7am on Tue 6 Oct' && mon[0].state === 'due' && !(pv.days[1].sessions || []).length);
  ask('the Preview lists two emails to Pat about Tue 6 Oct', (day.emails || []).filter(m => m.to === 'pat@example.org').length === 1);
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

/* ---------- 16. THE PREVIEW check/ui.js MEASURES IS ONE THE SERVER CAN SEND --------------------------------
   "A fixture must send what doGet really sends." `check/states.js` draws the preview sheet from a reply
   written by hand, so the layout is measured against whatever that reply says — and it had put "agreed
   with the tutor … mark it paid" on a SESSION line, where the server never sends it: that reason is
   written to the log, so it is a job-level row under "Nobody to tell". Asked of the server first — a
   reason the log is told is never a session line — and then of the fixture, against the reasons the
   real preview put under "Nobody to tell". */
{
  const logged = [];
  [{ events: [E('J-1', 'Pat Parent', 'client', 'Request'), E('J-1', 'Sam Tutor', 'tutor', 'Accept', 'Pat Parent')] },
   { job: { for_children: '' }, moreFamily: [L(9, 'P-C1', 'P-S2', 'accepted')] },
   { job: { for_children: 'Zed Nobody' } }].forEach(o => {
    const w = seeded(o);
    w.setClock(at(DUE));
    const pv = JSON.parse(JSON.stringify(w.b.ev('clearCache(); recapPreviewOut_(new Date())')));
    const day = (pv.days || []).find(d => d.day === '2026-10-06') || {};
    const jobRows = (day.nobody || []).filter(n => /\(J-/.test(n.name)).map(n => n.why);
    logged.push(...jobRows);
    ask('the Preview put a reason the log is told on a session line: ' + JSON.stringify(day.sessions),
      jobRows.length && !(day.sessions || []).some(x => jobRows.some(why => String(x.state).indexOf(why.split(' — ')[0]) === 0)));
  });
  const src = fs.readFileSync(path.join(REPO, 'check', 'states.js'), 'utf8');
  const from = src.indexOf("name: 'the email after each session, previewed'");
  const block = from === -1 ? '' : src.slice(from, src.indexOf('wants:', from));
  const at0 = block.indexOf('sessions: [{');
  const sess = at0 === -1 ? '' : block.slice(at0, block.indexOf('emails:', at0));
  const states = [...sess.matchAll(/state: '([^']*)'/g)].map(m => m[1]);
  ask('check/states.js has no "the email after each session, previewed" state with session lines to read, so its fixture was NOT checked', states.length >= 2);
  const opening = why => why.split(' ').slice(0, 4).join(' ');
  states.filter(x => ['upcoming', 'due', 'past'].indexOf(x) === -1).forEach(x => {
    ask('check/states.js puts "' + x + '" on a session line of the previewed sheet — the server sends that reason only under "Nobody to tell", so the layout was measured against a reply it never makes',
      !logged.some(why => x.indexOf(opening(why)) === 0));
  });
}

/* ---------- 17. EVERY OTHER DAY OF WORK: THE NEXT MORNING ------------------------------------------------------
   *"emails all parents on work their child has done with the exact questions for each"* (8 Oct). A day a
   child did questions and had no session is an email too — `recapWorkGroups_` — due the next morning at
   `session_recap_morning` (7) London, because the sheet keeps days and not times: an evening hour would
   spend the day's receipt before the homework done after it. Asked: the hour and both edges of its 24
   hours, a set hour, both clock changes; one email a child a day, whichever rule made it; only a child;
   what the email says; and the Preview. `NOLESSON` dates J-1 next week only, so no day here has a session. */
const NOLESSON = { job: { session_dates: '13/10/2026' } };
const setJob = (w, col, v) => { const g = w.b.tabs.jobs; g[1][g[0].indexOf(col)] = v; w.b.ev('clearCache()'); };
{
  const w = seeded(NOLESSON);
  run(w, '2026-10-06T05:55:00Z');
  ask('Ada’s Monday of questions was emailed or written at 06:55 London on the Tuesday — before the 07:00 it is due: ' + w.mail.sent.map(m => m.subject),
    !w.mail.sent.length && !log(w).length);
  run(w, '2026-10-06T06:05:00Z');
  ask('Ada’s Monday was not emailed to Pat, alone and once, at 07:05 London the next morning: [' + w.mail.sent.map(m => m.to + ' ' + m.subject) + ']',
    w.mail.sent.length === 1 && toOn(w, PAT, MON).length === 1);
  const row = log(w).find(x => x.parent_id === 'P-C1') || {};
  ask('the receipt for a day of work is ' + JSON.stringify(row) + ' — wanted day 2026-10-05, due 2026-10-06 07:00, no job, 1 question, sent',
    row.day === MON_ && row.due === '2026-10-06 07:00' && row.job_ids === '' && Number(row.questions) === 1 && row.status === 'sent' && row.learner_id === 'P-S1');
  ask('Pam (session_email no) has no "opted out" row for the day of work — one switch is both emails’: ' + JSON.stringify(logOn(w, MON_)),
    logOn(w, MON_).some(x => x.parent_id === 'P-C2' && x.status === 'opted out' && /session_email/.test(x.note)) && !to(w, 'pam@example.org').length);

  /* WHAT IT SAYS: there is no session to name, so the day leads, and the subject says "work". */
  const m = toOn(w, PAT, MON)[0] || { subject: '', body: '', htmlBody: '' };
  ask('the day-of-work subject is ' + JSON.stringify(m.subject) + ' — wanted "Ada’s work on Mon 5 Oct: 1 question"', m.subject === 'Ada’s work on Mon 5 Oct: 1 question');
  ask('the day-of-work email does not lead with its day: ' + JSON.stringify(m.body.split('\n')[2]),
    m.body.split('\n')[2] === 'On Monday 5 October Ada worked on 1 question.' && m.htmlBody.indexOf('<p>On Monday 5 October Ada worked on 1 question.</p>') !== -1);
  ask('the day-of-work email speaks of a session that was not: ' + JSON.stringify(m.body), !/session|lesson|\bhad\b|That day/i.test(m.body + m.htmlBody));
  ask('the day-of-work email does not end with the footer both emails share: ' + JSON.stringify(m.body.split('\n').slice(-1)[0]),
    m.body.split('\n').slice(-1)[0] === FOOT && m.htmlBody.indexOf('<p><small>' + FOOT + '</small></p>') !== -1);

  run(w, '2026-10-06T19:05:00Z'); run(w, '2026-10-07T05:55:00Z');
  ask('by 06:55 London on the Wednesday a day of work had gone twice, or Tuesday’s before its 07:00: ' + w.mail.sent.map(x => x.subject), w.mail.sent.length === 1);
  run(w, '2026-10-07T06:05:00Z');
  const tue = toOn(w, PAT, TUE);
  ask('Ada’s Tuesday — two new questions, one again, a practical in two boxes — was not Pat’s email at 07:05 London on the Wednesday: '
    + tue.map(x => x.subject + ' / ' + x.body.split('\n')[2]),
    tue.length === 1 && tue[0].subject === 'Ada’s work on Tue 6 Oct: 3 questions' && to(w, PAT).length === 2
    && tue[0].body.split('\n')[2] === 'On Tuesday 6 October Ada worked on 3 questions, 2 of them for the first time.');
  const ola = to(w, 'ola@example.org');
  ask('the other family’s Ada’s Tuesday did not go to her own parent, Ola, alone, about her own question: ' + ola.map(x => x.subject),
    ola.length === 1 && ola[0].subject === 'Ada’s work on Tue 6 Oct: 1 question' && /Paper 3/.test(ola[0].body) && !!tue[0] && !/Paper 3/.test(tue[0].body));
}
{
  /* THE FAR EDGE OF ITS 24 HOURS, switched on late: at 06:55 on the Wednesday Monday's is due + 23h55 and
     goes; at 07:05 it is past, and nothing about it is sent or written — while Tuesday's, due then, goes. */
  const last = seeded(NOLESSON);
  run(last, '2026-10-07T05:55:00Z');
  ask('switched on at 06:55 London on the Wednesday, Monday’s day of work — 23h55 after it fell due — was not sent: ' + last.mail.sent.map(m => m.subject),
    toOn(last, PAT, MON).length === 1 && !about(last, TUE).length);
  const gone = seeded(NOLESSON);
  run(gone, '2026-10-07T06:05:00Z');
  ask('switched on at 07:05 London on the Wednesday, Monday’s day of work — past its 24 hours — was sent or written: ' + gone.mail.sent.map(m => m.subject),
    !about(gone, MON).length && !logOn(gone, MON_).length && toOn(gone, PAT, TUE).length === 1);
}
{
  /* THE HOUR IS THE OWNER'S: 9 is 09:00 London, and 0 is midnight — the first minute of the next day. */
  const w = seeded(NOLESSON);
  cfgSet(w.b, 'session_recap_morning', '9');
  run(w, '2026-10-06T07:55:00Z');
  ask('with session_recap_morning 9 a day of work went at 08:55 London', !w.mail.sent.length);
  run(w, '2026-10-06T08:05:00Z');
  ask('with session_recap_morning 9 a day of work was not sent at 09:05 London, due 09:00: ' + JSON.stringify((log(w).find(x => x.parent_id === 'P-C1') || {}).due),
    toOn(w, PAT, MON).length === 1 && (log(w).find(x => x.parent_id === 'P-C1') || {}).due === '2026-10-06 09:00');
  const mid = seeded(NOLESSON);
  cfgSet(mid.b, 'session_recap_morning', '0');
  run(mid, '2026-10-05T22:55:00Z');
  ask('with session_recap_morning 0 a Monday of work went at 23:55 London that Monday — before it was over', !mid.mail.sent.length);
  run(mid, '2026-10-05T23:05:00Z');
  ask('with session_recap_morning 0 a Monday of work was not sent at 00:05 London on the Tuesday, due at midnight',
    toOn(mid, PAT, MON).length === 1 && (log(mid).find(x => x.parent_id === 'P-C1') || {}).due === '2026-10-06 00:00');
  [['', 7], ['24', 7], ['seven', 7], ['-1', 7], ['7.5', 7], ['0', 0], ['07', 7], ['9', 9], ['10', 7], ['23', 7]].forEach(([v, want]) => {
    const got = w.b.ev('recapMorning_({ session_recap_morning: ' + JSON.stringify(v) + ' })');
    ask('session_recap_morning "' + v + '" reads as ' + got + ', wanted ' + want, got === want);
  });
  /* NOT LATER THAN 9, IN THE RUN TOO: a question from yesterday done again before the email goes leaves
     yesterday's email, so a 10 is the 7 it would have been — not a 10:00 that loses the morning's repeats. */
  const ten = seeded(NOLESSON);
  cfgSet(ten.b, 'session_recap_morning', '10');
  run(ten, '2026-10-06T06:05:00Z');
  ask('with session_recap_morning 10, past the 9 it stops at, a day of work was not sent at 07:05 London, due 07:00: ' + JSON.stringify((log(ten).find(x => x.parent_id === 'P-C1') || {}).due),
    toOn(ten, PAT, MON).length === 1 && (log(ten).find(x => x.parent_id === 'P-C1') || {}).due === '2026-10-06 07:00');
  ask('session_recap_morning does not arrive as 7 on the config tab', w.b.ev('(CONFIG_DEFAULTS.find(r => r[0] === "session_recap_morning") || [])[1]') === 7);
  ask('no session_recap_morning row is not 7', w.b.ev('recapMorning_({})') === 7);
}
{
  /* THE CLOCKS GO BACK ON SUNDAY 25 OCT 2026: Saturday's work is due at 07:00 GMT = 07:00 UTC, and a
     backend still on summer time sends at 06:00 UTC. FORWARD ON SUNDAY 28 MAR 2027: due at 07:00 BST =
     06:00 UTC, and a backend still on winter time waits until 08:00 London. */
  const back = seeded({ job: NOLESSON.job, attempts: [A('P-S1', 'q:SAT-BACK', '2026-10-24', '2026-10-24', 'Maths · Paper 5 · Q3')] });
  run(back, '2026-10-25T06:30:00Z');
  ask('on the morning the clocks go back a day of work went at 06:30 UTC — 06:30 GMT, before its 07:00', !back.mail.sent.length);
  run(back, '2026-10-25T07:05:00Z');
  ask('on the morning the clocks go back a day of work was not sent at 07:05 UTC, due 07:00: ' + JSON.stringify(back.mail.sent.map(m => m.subject)),
    toOn(back, PAT, 'Sat 24 Oct').length === 1 && (log(back).find(x => x.parent_id === 'P-C1') || {}).due === '2026-10-25 07:00');
  const fwd = seeded({ job: NOLESSON.job, attempts: [A('P-S1', 'q:SAT-FWD', '2027-03-27', '2027-03-27', 'Maths · Paper 5 · Q4')] });
  run(fwd, '2027-03-28T05:55:00Z');
  ask('on the morning the clocks go forward a day of work went at 06:55 BST, before its 07:00', !fwd.mail.sent.length);
  run(fwd, '2027-03-28T06:05:00Z');
  ask('on the morning the clocks go forward a day of work was not sent at 07:05 BST (06:05 UTC): ' + JSON.stringify(fwd.mail.sent.map(m => m.subject)),
    toOn(fwd, PAT, 'Sat 27 Mar').length === 1);
}

/* ONE CHILD, ONE DAY, ONE EMAIL, WHICHEVER RULE MADE IT. A day with a session is the session's email —
   two hours after it, sent or not, in its window or past it — and a day of work never adds a second;
   and the receipt's key is the day, the child and the parent, so a day that changes rule after its
   email went is not emailed again. */
{
  /* THE SESSION'S WENT AT 20:05; at 07:05 the next morning, when a day of work would fall due, nothing. */
  const w = seeded();
  run(w, DUE);
  run(w, '2026-10-07T06:05:00Z');
  const pats = logOn(w, TUE_).filter(x => x.parent_id === 'P-C1');
  ask('the morning after Tuesday’s session email, Ada’s Tuesday was emailed again as a day of work: ' + toOn(w, PAT, TUE).map(m => m.subject) + ' ' + JSON.stringify(pats),
    toOn(w, PAT, TUE).length === 1 && /^Ada’s session/.test(toOn(w, PAT, TUE)[0].subject) && pats.length === 1 && pats[0].job_ids === 'J-1');
  /* SWITCHED ON THAT MORNING: the session's email is still in its 24 hours, and it is the session's that
     goes — "Ada had Maths" — not a day of work that happens to be due at the same hour. */
  const morn = seeded();
  run(morn, '2026-10-07T06:05:00Z');
  const s = toOn(morn, PAT, TUE);
  ask('switched on at 07:05 London the morning after, Ada’s Tuesday did not go once, as the session’s email: ' + s.map(m => m.subject),
    s.length === 1 && /^Ada’s session on Tue 6 Oct/.test(s[0].subject) && /Ada had Maths on Tuesday 6 October/.test(s[0].body)
    && (logOn(morn, TUE_).find(x => x.parent_id === 'P-C1') || {}).job_ids === 'J-1');
  /* PAST ITS 24 HOURS: nothing about Tuesday at all — the day of work it displaced is not let in. */
  const past = seeded({ attempts: ADA_ONLY });
  run(past, '2026-10-07T19:30:00Z');
  ask('a session out of its 24 hours let its day through as a day of work: ' + about(past, TUE).map(m => m.subject) + ' ' + JSON.stringify(logOn(past, TUE_)),
    !about(past, TUE).length && !logOn(past, TUE_).length);
}
{
  /* THE DAY OF WORK WENT FIRST, THEN THE OWNER DATED THE LESSON (`session_dates`): its email is due and
     in its window, and the day's receipt is already spent. */
  const w = seeded(NOLESSON);
  run(w, '2026-10-07T06:05:00Z');
  setJob(w, 'session_dates', '06/10/2026');
  run(w, '2026-10-07T07:05:00Z');
  ask('a lesson dated after its day’s email went was emailed again: ' + toOn(w, PAT, TUE).map(m => m.subject),
    toOn(w, PAT, TUE).length === 1 && /^Ada’s work/.test(toOn(w, PAT, TUE)[0].subject));
  /* AND THE OTHER WAY: the session's email went, then the date came out — a lesson that did not happen. */
  const v = seeded();
  run(v, DUE);
  setJob(v, 'session_dates', '13/10/2026');
  run(v, '2026-10-07T06:05:00Z');
  ask('a date taken out after its session’s email went was emailed again as a day of work: ' + toOn(v, PAT, TUE).map(m => m.subject),
    toOn(v, PAT, TUE).length === 1 && /^Ada’s session/.test(toOn(v, PAT, TUE)[0].subject));
}
{
  /* ONLY A CHILD — somebody a parent has accepted. The tutor working questions on her own phone, an admin
     trying a paper, a parent doing one beside their child, a student nobody has linked, one linked only to
     herself, one whose parent only asked: rows on the attempts tab, and nobody's child to email about —
     no email, no row on the log, nothing in the Preview. */
  const NOT = [['P-T1', 'Sam, the tutor'], ['P-A1', 'Hal, an admin'], ['P-C1', 'Pat, a parent'], ['P-S3', 'Cal, a student with no parent'],
               ['P-S5', 'Eve, linked only to herself'], ['P-S6', 'Gil, whose parent only asked']];
  const w = seeded(Object.assign({}, NOLESSON, {
    people: [P('P-S5', 'Eve', 'Self', 'student', 's5@example.org'), P('P-S6', 'Gil', 'Asked', 'student', 's6@example.org')],
    moreFamily: [L(12, 'P-S5', 'P-S5', 'accepted'), L(13, 'P-C3', 'P-S6', 'asked')],
    moreAttempts: NOT.map(([id], i) => A(id, 'q:OWN-' + i, MON_, MON_, 'Maths · Paper 6 · Q' + (i + 1))) }));
  run(w, '2026-10-06T06:05:00Z');
  NOT.forEach(([id, who]) => ask(who + ': their own questions on a Monday made an email or a row: ' + JSON.stringify(log(w).filter(x => x.learner_id === id)),
    !log(w).some(x => x.learner_id === id)));
  ask('with grown-ups’ and unlinked students’ rows beside Ada’s, the morning’s run did not send Pat’s email about Ada alone: ' + w.mail.sent.map(m => m.to + ' ' + m.subject),
    w.mail.sent.length === 1 && toOn(w, PAT, MON).length === 1 && !/Paper 6/.test(w.mail.sent[0].body));
  w.setClock(at('2026-10-06T06:30:00Z'));
  const day = (preview(w).days || []).find(d => d.day === MON_) || {};
  ask('the Preview lists an email or a "nobody to tell" for somebody who is nobody’s child: ' + JSON.stringify([day.emails, day.nobody]).slice(0, 400),
    (day.emails || []).length === 1 && day.emails[0].learner === 'Ada Pupil'
    && !(day.nobody || []).some(n => /Sam Tutor|Hal Admin|Cal Alone|Eve Self|Gil Asked|^Pat Parent|about Pat/.test(n.name)));
}
{
  /* AND EVEN WITH A PARENT WHO ACCEPTED THEM — which none of the six above has, so an accepted link was
     all it took. A tutor who was once somebody's pupil keeps that family row (Bo is Sam's); an admin can
     be linked the same way (Ola is Hal's); and a family of three generations makes Pat both Ada's parent
     and Gwen's child. Staff are never anybody's child to email about, and somebody with an accepted child
     of their own is a parent here (`recapHasParent_`) — so Gwen hears nothing about Pat's own questions,
     and Pat still hears about Ada's. */
  const w = seeded(Object.assign({}, NOLESSON, {
    people: [P('P-G1', 'Gwen', 'Gran', 'client', 'gwen@example.org')],
    moreFamily: [L(14, 'P-C5', 'P-T1', 'accepted'), L(15, 'P-C9', 'P-A1', 'accepted'), L(16, 'P-G1', 'P-C1', 'accepted')],
    moreAttempts: [A('P-T1', 'q:SAM-OWN', MON_, MON_, 'Maths · Paper 6 · Q1'), A('P-A1', 'q:HAL-OWN', MON_, MON_, 'Maths · Paper 6 · Q2'),
                   A('P-C1', 'q:PAT-OWN', MON_, MON_, 'Maths · Paper 6 · Q3')] }));
  run(w, '2026-10-06T06:05:00Z');
  [['P-T1', 'Sam, a tutor', 'bo@example.org'], ['P-A1', 'Hal, an admin', 'ola@example.org'],
   ['P-C1', 'Pat, Ada’s parent and Gwen’s child', 'gwen@example.org']].forEach(([id, who, addr]) => {
    ask(who + ', whose own parent accepted them, was emailed about or written down: ' + to(w, addr).map(m => m.subject) + ' ' + JSON.stringify(log(w).filter(x => x.learner_id === id)),
      !to(w, addr).length && !log(w).some(x => x.learner_id === id));
  });
  ask('with staff and a grandparent’s child working beside her, Ada’s Monday was not Pat’s one email: ' + w.mail.sent.map(m => m.to + ' ' + m.subject),
    w.mail.sent.length === 1 && toOn(w, PAT, MON).length === 1 && !/Paper 6/.test(w.mail.sent[0].body));
}
{
  /* A PRACTICAL'S BOXES ARE ONE QUESTION FOR "WHICH DAYS" TOO. Its worksheet was started on Saturday and
     finished on Monday, and one box was filled on the Sunday between; joined, the question's days are
     Saturday and Monday, which is all the email can know. A day made off the Sunday box alone would be
     a group the join then has nothing for — a "nothing done" row about a child who did something. */
  const w = seeded(Object.assign({}, NOLESSON, { attempts: [
    A('P-S1', 'pr:PR-CH02#iv', '2026-10-03', MON_, 'Chemistry · Required practical · Rates · Worksheet'),
    A('P-S1', 'pr:PR-CH02#dv', '2026-10-04', '2026-10-04', 'Chemistry · Required practical · Rates · Worksheet')] }));
  run(w, '2026-10-05T06:05:00Z');
  ask('a practical’s box done on the Sunday between its first and last days made a day of its own: ' + JSON.stringify(log(w)) + ' ' + w.mail.sent.map(m => m.subject),
    !log(w).length && !w.mail.sent.length);
  run(w, '2026-10-06T06:05:00Z');
  ask('the practical finished on the Monday was not Monday’s email, once: ' + w.mail.sent.map(m => m.subject),
    w.mail.sent.length === 1 && toOn(w, PAT, MON).length === 1 && /: 1 question$/.test(w.mail.sent[0].subject));
}
{
  /* THE PREVIEW: every day of work under its day, with its email as it would read, when it falls due and
     whether that is past, now or to come — and no session line, because there was none. And the hour. */
  const w = seeded(NOLESSON);
  w.setClock(at('2026-10-07T06:30:00Z'));
  const w0 = weight(w.b);
  const pv = preview(w);
  const dayOf = d => (pv.days || []).find(x => x.day === d) || {};
  const pat = d => (dayOf(d).emails || []).filter(m => m.to === PAT);
  ask('the Preview does not answer the morning hour: ' + pv.morning, pv.morning === 7);
  const mon = pat(MON_)[0] || {}, tue = pat(TUE_)[0] || {}, wed = pat('2026-10-07')[0] || {};
  ask('the Preview does not list Monday’s day of work with its email, due 7am on Tue 6 Oct and past: ' + JSON.stringify(mon).slice(0, 240),
    pat(MON_).length === 1 && mon.subject === 'Ada’s work on Mon 5 Oct: 1 question' && mon.due === '2026-10-06 07:00' && mon.dueSaid === '7am on Tue 6 Oct'
    && mon.state === 'past' && /On Monday 5 October Ada worked on 1 question\./.test(mon.text));
  ask('the Preview does not list Tuesday’s day of work, due now: ' + JSON.stringify(tue).slice(0, 240),
    pat(TUE_).length === 1 && tue.subject === 'Ada’s work on Tue 6 Oct: 3 questions' && tue.dueSaid === '7am on Wed 7 Oct' && tue.state === 'due');
  ask('the Preview does not list Wednesday’s day of work, still to come: ' + JSON.stringify(wed).slice(0, 240),
    pat('2026-10-07').length === 1 && wed.subject === 'Ada’s work on Wed 7 Oct: 1 question' && wed.dueSaid === '7am on Thu 8 Oct' && wed.state === 'upcoming');
  ask('a day of work has a session line in the Preview', [MON_, TUE_, '2026-10-07'].every(d => !(dayOf(d).sessions || []).length));
  ask('the Preview does not list Pam as opted out of a day of work', (dayOf(MON_).nobody || []).some(n => /Pam Parent/.test(n.name) && /session_email/.test(n.why)));
  ask('the Preview of days of work wrote ' + (weight(w.b) - w0) + ' or sent ' + w.mail.sent.length, weight(w.b) === w0 && !w.mail.sent.length);
  cfgSet(w.b, 'session_recap_morning', '9');
  const pv9 = preview(w);
  const tue9 = (((pv9.days || []).find(x => x.day === TUE_) || {}).emails || []).find(m => m.to === PAT) || {};
  ask('with session_recap_morning 9 the Preview answered ' + pv9.morning + ' and put Tuesday’s at ' + tue9.dueSaid + ', ' + tue9.state,
    pv9.morning === 9 && tue9.dueSaid === '9am on Wed 7 Oct' && tue9.state === 'upcoming');
}

/* ---------- 18. EACH QUESTION WITH ITS OWN WORDS --------------------------------------------------------------
   *"with the exact questions for each"*. The phone sends what it draws (`doneWords_`, SCHEMA.attempts
   `words`): the stem a question's parts share, a `---` line, the part's own ask. Under its paper's
   heading each question is "Q3: <its ask>", the shared stem printed ONCE above its parts, each cut with
   "…" to what a phone shows; words with a link or an address are not printed and the number still is;
   a paper with no words at all is its old line of numbers; a question with no name is counted and never
   printed, words or not; and the HTML escapes what came off a phone. Read at the backend's own limits. */
{
  const K = world().b;
  const SHOWN = K.ev('RECAP_WORDS_SHOWN'), STEM_SHOWN = K.ev('RECAP_STEM_SHOWN'), MAX = K.ev('ATTEMPT_WORDS_MAX');
  const longText = (lead, n) => { let t = lead, i = 0; while (t.length < n) t += ' line' + (++i); return t; };
  const P7 = 'Maths · Paper 7', STEM = 'A bag holds 3 red beads and 5 blue beads.';
  const ASK_LONG = longText('Explain', SHOWN + 200), STEM_LONG = longText('Read the extract', STEM_SHOWN + 100);
  const EXACT = longText('Show', SHOWN + 10).slice(0, SHOWN - 1) + '.';
  ask('the limits are not numbers with room between them (RECAP_WORDS_SHOWN ' + SHOWN + ', RECAP_STEM_SHOWN ' + STEM_SHOWN + ', ATTEMPT_WORDS_MAX ' + MAX
    + '), so the cut was NOT checked', SHOWN > 50 && STEM_SHOWN > 50 && ASK_LONG.length < MAX && STEM_LONG.length + 40 < MAX);
  const WORDED = [
    A('P-S1', 'q:W3', MON_, MON_, P7 + ' · Q3', 'Solve x > 3 and x < 7 for whole numbers x.'),
    A('P-S1', 'q:W5a', MON_, MON_, P7 + ' · Q5a', STEM + '\n---\nFind P(red).'),
    A('P-S1', 'q:W5b', MON_, MON_, P7 + ' · Q5b', STEM + '\n---\nFind P(blue).'),
    A('P-S1', 'q:W5c', MON_, MON_, P7 + ' · Q5c', STEM + '\n---\nTwo beads are taken.\nFind P(both red).'),
    A('P-S1', 'q:W10', MON_, MON_, P7 + ' · Q10', ASK_LONG),
    A('P-S1', 'q:W11', MON_, MON_, P7 + ' · Q11', STEM_LONG + '\n---\nWhat does the last line suggest?'),
    A('P-S1', 'q:W12', MON_, MON_, P7 + ' · Q12', 'Watch the video at https://evil.example/x first.'),
    A('P-S1', 'q:W13', MON_, MON_, P7 + ' · Q13', 'Send your working to tutor@evil.example'),
    A('P-S1', 'q:W14', MON_, MON_, P7 + ' · Q14', 'Simplify <script>alert(1)</script> & "show" 2 < 3 <b>now</b>'),
    A('P-S1', 'q:W15', MON_, MON_, P7 + ' · Q15', EXACT),
    /* THE LINK PAST THE FIRST 120 CHARACTERS, which is all `digestSafe_` is asked of a label. */
    A('P-S1', 'q:W16', MON_, MON_, P7 + ' · Q16', longText('Read the passage', 140) + '\nThen open www.evil.example/answers'),
    A('P-S1', 'q:N3', MON_, MON_, 'Maths · Paper 8 · Q3'),
    A('P-S1', 'q:N7', '2026-09-29', MON_, 'Maths · Paper 8 · Q7'),
    A('P-S1', 'q:NONAME', MON_, MON_, '', 'The words of a question nobody named.'),
    A('P-S1', 'q:SOLO', MON_, MON_, 'Times tables', 'What is 7 × 8?'),
  ];
  const w = seeded(Object.assign({}, NOLESSON, { attempts: WORDED }));
  run(w, '2026-10-06T06:05:00Z');
  const m = toOn(w, PAT, MON)[0] || { body: '', htmlBody: '' };
  const lines = m.body.split('\n'), html = m.htmlBody;
  ask('the email with words was not sent, or does not count 15 with one again and one unprinted: ' + JSON.stringify(lines[2]) + ' … ' + JSON.stringify(lines.slice(-5)),
    toOn(w, PAT, MON).length === 1 && lines[2] === 'On Monday 5 October Ada worked on 15 questions, 14 of them for the first time.' && /\n…and 1 more\.\n/.test(m.body));
  ask('the questions are not printed under their paper as "Q3: <its words>", the shared stem once above its parts: ' + JSON.stringify(lines.slice(4, 11)),
    m.body.indexOf(P7 + '\nQ3: Solve x > 3 and x < 7 for whole numbers x.\n' + STEM + '\nQ5a: Find P(red).\nQ5b: Find P(blue).\nQ5c: Two beads are taken. Find P(both red).\n') !== -1);
  ask('the stem Q5a, Q5b and Q5c share is printed ' + (m.body.split(STEM).length - 1) + ' times in the text and ' + (html.split(STEM).length - 1) + ' in the HTML, wanted once each',
    m.body.split(STEM).length === 2 && html.split(STEM).length === 2 && html.indexOf('<p><i>' + STEM + '</i></p><p><b>Q5a</b> — Find P(red).</p>') !== -1);
  const q10 = (lines.find(x => /^Q10: /.test(x)) || '').slice(5);
  ask('words longer than RECAP_WORDS_SHOWN (' + SHOWN + ') are not cut with "…" at a word: ' + q10.length + ' chars, ' + JSON.stringify(q10.slice(-30)),
    q10.length <= SHOWN && q10.length > SHOWN - 20 && /…$/.test(q10) && ASK_LONG.indexOf(q10.slice(0, -1) + ' ') === 0);
  const q11 = lines.indexOf('Q11: What does the last line suggest?'), stem11 = q11 > 0 ? lines[q11 - 1] : '';
  ask('a stem longer than RECAP_STEM_SHOWN (' + STEM_SHOWN + ') is not cut with "…" above its question: ' + stem11.length + ' chars, ' + JSON.stringify(stem11.slice(-30)),
    stem11.length <= STEM_SHOWN && stem11.length > STEM_SHOWN - 20 && /…$/.test(stem11) && STEM_LONG.indexOf(stem11.slice(0, -1) + ' ') === 0);
  ask('words exactly RECAP_WORDS_SHOWN long were cut', lines.indexOf('Q15: ' + EXACT) !== -1);
  ask('words with a link or an address — anywhere in them — were printed, or took their question’s number with them: ' + JSON.stringify(lines.filter(x => /^Q1[236]/.test(x))),
    lines.indexOf('Q12') !== -1 && lines.indexOf('Q13') !== -1 && lines.indexOf('Q16') !== -1
    && !/evil\.example|video at|your working|Read the passage/.test(m.body + html) && html.indexOf('<p><b>Q12</b></p><p><b>Q13</b></p>') !== -1);
  ask('a paper with no words is not its old line of numbers: ' + JSON.stringify(m.body.slice(m.body.indexOf('Maths · Paper 8'), m.body.indexOf('Maths · Paper 8') + 40)),
    m.body.indexOf('\nMaths · Paper 8\nQ3, Q7 (again)\n') !== -1 && html.indexOf('<p><b>Maths · Paper 8</b><br>Q3, Q7 (again)</p>') !== -1);
  ask('a name of one segment, which has no number, prints its words as anything but their own line: ' + JSON.stringify(lines.slice(lines.indexOf('Times tables'), lines.indexOf('Times tables') + 2)),
    m.body.indexOf('\nTimes tables\nWhat is 7 × 8?\n') !== -1 && !lines.some(x => /^:|^ \(again\)/.test(x)) && html.indexOf('<p>What is 7 × 8?</p>') !== -1);
  ask('a raw key, or the words of a question with no name, went in the email', !/\bq:|\bpr:|nobody named/.test(m.body + html + m.subject));
  ask('the HTML does not escape what came off a phone, or a tag survived into either body: ' + JSON.stringify((html.match(/Q14<\/b>[^<]*/) || [''])[0]),
    html.indexOf('<b>Q3</b> — Solve x &gt; 3 and x &lt; 7 for whole numbers x.') !== -1
    && html.indexOf('<b>Q14</b> — Simplify alert(1) &amp; &quot;show&quot; 2 &lt; 3 now</p>') !== -1
    && !/<script|<\/?b>now|&lt;b&gt;|&lt;script/i.test(m.body + html));
  ask('"x < 7" lost its inequality on the way — a bare "<" read as a tag: ' + JSON.stringify(lines.find(x => /^Q3: /.test(x))),
    lines.indexOf('Q3: Solve x > 3 and x < 7 for whole numbers x.') !== -1 && lines.indexOf('Q14: Simplify alert(1) & "show" 2 < 3 now') !== -1);
  /* AND AFTER A SESSION THE SAME: one question with words and one without under the one paper. */
  const s = seeded({ attempts: TUESDAY.map(r => (r.question_key === 'q:ADA-NEW' ? Object.assign({}, r, { words: 'Work out 15% of 80.' }) : r)) });
  run(s, DUE);
  const sm = toOn(s, PAT, TUE)[0] || { body: '' };
  ask('the session’s email does not print a question’s words under its paper, beside one with none: ' + JSON.stringify(sm.body.slice(sm.body.indexOf(PAPER1), sm.body.indexOf(PAPER1) + 120)),
    sm.body.indexOf(PAPER1 + '\nQ3: Work out 15% of 80.\nQ7 (again)\n') !== -1);
}

/* ---------- 19. A SESSION DAY'S NEXT-MORNING FOLLOW-UP: ONLY WHAT CAME AFTER ------------------------------------
   The session's email goes two hours after the lesson and its receipt is the day's — so the homework set
   at the lesson and done that evening was in nobody's email, the very work the owner asked to hear about.
   `recapLaterGroups_`: the next morning at `session_recap_morning`, or an hour after the session's own due
   when that is later, a second, shorter email with only what the first did not carry (its receipt's
   `question_keys`), under a receipt of its own (`job_ids` = `later`). Asked: when, what it says, its
   receipt; nothing new is nothing at all; none beside a session email that has not gone (held, failed,
   never sent), which still carries everything when it goes; a "nothing done" is the whole day; an old
   receipt with no keys is none; never in the hour the day's own email goes; no note of its own; the column
   only where the tab has it; a `preview` row as sent in preview; and the admin's Preview. `ADA_ONLY`, so
   no other email is due in these hours; `EVENING` is two questions marked on the Tuesday after 20:05. */
const EVENING = [A('P-S1', 'q:ADA-EVE1', TUE_, TUE_, 'Maths · Paper 6 · Q2'), A('P-S1', 'q:ADA-EVE2', TUE_, TUE_, 'Maths · Paper 6 · Q5')];
const LATER = (w, addr) => w.mail.sent.filter(m => (!addr || m.to === addr) && /’s work after the session on /.test(m.subject));
const laterRows = w => log(w).filter(x => x.job_ids === 'later');
const keysOf = row => String((row && row.question_keys) || '').split(',').filter(Boolean).sort().join(',');
{
  const w = seeded({ attempts: ADA_ONLY });
  run(w, DUE);
  const sess0 = JSON.stringify(log(w).find(x => x.parent_id === 'P-C1' && x.job_ids === 'J-1') || null);
  ask('the session’s receipt does not say which questions it carried, so no follow-up could leave them out: ' + sess0,
    keysOf(JSON.parse(sess0)) === 'pr:PR-BI01,q:ADA-AGAIN,q:ADA-NEW');
  w.b.seed('attempts', EVENING);
  run(w, '2026-10-07T05:55:00Z');
  ask('the follow-up went at 06:55 London, before session_recap_morning’s 07:00: ' + LATER(w).map(m => m.subject), !LATER(w).length && !laterRows(w).length);
  run(w, '2026-10-07T06:05:00Z');
  const m = LATER(w, PAT)[0] || { subject: '', body: '', htmlBody: '' };
  ask('the two questions marked after Tuesday’s session email were not Pat’s follow-up, alone and once, at 07:05 London the next morning: ' + toOn(w, PAT, TUE).map(x => x.subject),
    LATER(w).length === 1 && LATER(w, PAT).length === 1 && toOn(w, PAT, TUE).length === 2);
  ask('the follow-up’s subject is ' + JSON.stringify(m.subject) + ' — wanted "Ada’s work after the session on Tue 6 Oct: 2 more questions"',
    m.subject === 'Ada’s work after the session on Tue 6 Oct: 2 more questions');
  ask('the follow-up does not lead with what came after the session, and only that: ' + JSON.stringify(m.body.split('\n')[2]),
    m.body.split('\n')[2] === 'After the session on Tuesday 6 October, Ada worked on 2 more questions.'
    && m.htmlBody.indexOf('<p>After the session on Tuesday 6 October, Ada worked on 2 more questions.</p>') !== -1);
  ask('the follow-up carries what the session’s email already did, or not the two that came after: ' + JSON.stringify(m.body),
    m.body.indexOf('\nMaths · Paper 6\nQ2, Q5\n') !== -1 && !/Paper 1|Biology|Ada had|Maths on/.test(m.body + m.htmlBody) && m.body.split('\n').slice(-1)[0] === FOOT);
  const rec = laterRows(w);
  ask('the follow-up’s receipt is ' + JSON.stringify(rec) + ' — wanted one row for Pat: day 2026-10-06, job_ids later, due 2026-10-07 07:00, 2 questions, its own two keys, sent',
    rec.length === 1 && rec[0].parent_id === 'P-C1' && rec[0].learner_id === 'P-S1' && rec[0].day === TUE_ && rec[0].due === '2026-10-07 07:00'
    && Number(rec[0].questions) === 2 && rec[0].status === 'sent' && keysOf(rec[0]) === 'q:ADA-EVE1,q:ADA-EVE2');
  ask('the follow-up rewrote the session’s own receipt: ' + JSON.stringify(log(w).filter(x => x.parent_id === 'P-C1' && x.job_ids !== 'later')),
    JSON.stringify(log(w).find(x => x.parent_id === 'P-C1' && x.job_ids === 'J-1') || null) === sess0);
  /* PAM OPTED OUT: the row that says so is the session's — and the session's email, still inside its 24
     hours, keeps it current — never the follow-up's, which would take it over as `later`. */
  ask('the follow-up wrote a note — Pam’s opted-out row taken over, or a second one: ' + JSON.stringify(log(w).filter(x => x.parent_id !== 'P-C1')),
    log(w).filter(x => x.parent_id === 'P-C2').length === 1 && log(w).find(x => x.parent_id === 'P-C2').job_ids === 'J-1'
    && !log(w).some(x => x.job_ids === 'later' && x.parent_id !== 'P-C1'));
  run(w, '2026-10-07T07:05:00Z'); run(w, '2026-10-07T18:05:00Z');
  ask('the hours after the follow-up went sent it again', LATER(w).length === 1);
}
{
  /* NOBODY TO TELL BY THE NEXT DAY: Pat's address is gone, Pam has opted out, Quin never confirmed his.
     Who could not be told, and why, is the day's own email's to say — and it said it. Asked once the
     session's 24 hours are over, so the follow-up is all the run plans: not an email, not a cell. */
  const w = seeded({ attempts: ADA_ONLY });
  run(w, DUE);
  const g = w.b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-C1')[h.indexOf('email')] = '';
  w.b.seed('attempts', EVENING);
  const w0 = weight(w.b), rows0 = JSON.stringify(log(w));
  run(w, '2026-10-07T19:05:00Z');
  ask('a follow-up nobody could be told wrote a note of its own, or rewrote the day’s: ' + JSON.stringify(log(w).filter(x => x.parent_id !== 'P-C1' || x.job_ids === 'later')),
    weight(w.b) === w0 && JSON.stringify(log(w)) === rows0 && w.mail.sent.length === 1);
}
{
  /* NOTHING MARKED AFTER THE SESSION'S EMAIL: no follow-up, and not a cell written for one. */
  const w = seeded({ attempts: ADA_ONLY });
  run(w, DUE);
  const w0 = weight(w.b);
  run(w, '2026-10-07T06:05:00Z');
  ask('with nothing marked after the session’s email, the next morning sent ' + LATER(w).length + ' follow-up(s) and wrote ' + (weight(w.b) - w0) + ' cell(s) — wanted neither: ' + JSON.stringify(laterRows(w)),
    !LATER(w).length && weight(w.b) === w0 && !laterRows(w).length);
}
{
  /* THE LATER OF THE TWO: an hour after the session's own email when that is after the morning hour.
     Morning 0 (midnight) and a delay of 6: the session's email is due at 00:00 London on the Wednesday,
     and the follow-up at 01:00 — at midnight it would be planned beside the email it follows. */
  const w = seeded({ attempts: ADA_ONLY });
  cfgSet(w.b, 'session_recap_morning', '0'); cfgSet(w.b, 'session_recap_delay', '6');
  run(w, '2026-10-06T23:05:00Z');
  ask('with a delay of 6 the session’s email did not go at 00:05 London: ' + about(w, TUE).map(m => m.subject),
    about(w, TUE).length === 1 && /^Ada’s session on Tue 6 Oct/.test(about(w, TUE)[0].subject));
  w.b.seed('attempts', EVENING);
  run(w, '2026-10-06T23:35:00Z');
  ask('with morning 0 and a delay of 6 the follow-up went at 00:35 London, within the hour of the email it follows', !LATER(w).length);
  run(w, '2026-10-07T00:05:00Z');
  ask('with morning 0 and a delay of 6 the follow-up was not sent at 01:05 London, due 01:00 — an hour after its session’s email: ' + JSON.stringify(laterRows(w).map(x => x.due)),
    LATER(w, PAT).length === 1 && laterRows(w).length === 1 && laterRows(w)[0].due === '2026-10-07 01:00');
}
/* NO FOLLOW-UP BESIDE A SESSION EMAIL THAT HAS NOT GONE — held for the quota, failed, or never sent at all
   (switched on after its 24 hours). Asked the evening after, once the session's own window has closed: a
   follow-up then would be the whole day sent as an afterthought, about a day nobody was ever told of. */
[['held for the mail quota', w => { w.mail.quota = 5; run(w, DUE); w.mail.quota = 100; }, 'held'],
 ['failed', w => { w.mail.fail = true; run(w, DUE); w.mail.fail = false; }, 'failed'],
 ['never sent — switched on after its 24 hours', () => {}, '']].forEach(([what, before, st]) => {
  const w = seeded({ attempts: ADA_ONLY });
  before(w);
  const pat = log(w).find(x => x.parent_id === 'P-C1') || {};
  ask('the session’s email was not ' + what + ' to begin with, so the ask below was NOT asked: ' + JSON.stringify(pat), st ? pat.status === st : !log(w).length);
  w.b.seed('attempts', EVENING);
  run(w, '2026-10-07T19:05:00Z');
  ask('with the session’s email ' + what + ', a follow-up went the evening after: ' + about(w, TUE).map(m => m.subject) + ' ' + JSON.stringify(laterRows(w)),
    !about(w, TUE).length && !laterRows(w).length);
});
{
  /* "NOTHING DONE" — the session's email found no question at 20:05 (on the tutor's phone, or not yet
     synced) — has nothing to subtract, so a follow-up is the whole day. Asked once the session's own 24
     hours are over: inside them the session's email goes instead (below). */
  const onTue = r => r.first_done === TUE_ || r.last_done === TUE_;
  const w = seeded({ attempts: ADA_ONLY.filter(r => !onTue(r)) });
  run(w, DUE);
  ask('with nothing marked by 20:05 the session left no "nothing done" row, so the ask below was NOT asked: ' + JSON.stringify(logOn(w, TUE_)),
    !w.mail.sent.length && logOn(w, TUE_).some(x => x.learner_id === 'P-S1' && x.status === 'nothing done'));
  w.b.seed('attempts', ADA_ONLY.filter(onTue));
  run(w, '2026-10-07T19:05:00Z');
  const f = LATER(w, PAT);
  ask('after a "nothing done", the day’s three questions marked later were not the follow-up, whole: ' + w.mail.sent.map(m => m.subject),
    w.mail.sent.length === 1 && f.length === 1 && f[0].subject === 'Ada’s work after the session on Tue 6 Oct: 3 more questions'
    && laterRows(w).length === 1 && keysOf(laterRows(w)[0]) === 'pr:PR-BI01,q:ADA-AGAIN,q:ADA-NEW');
}
{
  /* NEVER IN THE HOUR THE DAY'S OWN EMAIL GOES. "Nothing done" at 20:05; the questions arrive overnight;
     at 08:05 the session's email is still inside its 24 hours and goes with all three — and a follow-up
     planned the same hour, off a log that still says "nothing done", would send all three again. */
  const onTue = r => r.first_done === TUE_ || r.last_done === TUE_;
  const w = seeded({ attempts: ADA_ONLY.filter(r => !onTue(r)) });
  run(w, DUE);
  w.b.seed('attempts', ADA_ONLY.filter(onTue));
  run(w, '2026-10-07T07:05:00Z');
  const t = toOn(w, PAT, TUE);
  ask('at 08:05 the session’s email and a follow-up went in the same hour: ' + t.map(m => m.subject),
    t.length === 1 && t[0].subject === 'Ada’s session on Tue 6 Oct: 3 questions' && !laterRows(w).length);
  run(w, '2026-10-07T08:05:00Z');
  ask('the hour after the session’s email went with all three, a follow-up repeated them: ' + toOn(w, PAT, TUE).map(m => m.subject),
    toOn(w, PAT, TUE).length === 1 && !laterRows(w).length);
}
{
  /* A RECEIPT FROM BEFORE `question_keys` says how many and not which: no follow-up, rather than a
     second copy of the whole day. */
  const w = seeded({ attempts: ADA_ONLY.concat(EVENING) });
  w.b.seed('recap_log', [{ day: "'2026-10-06", learner_id: 'P-S1', parent_id: 'P-C1', job_ids: "'J-1", due: "'2026-10-06 20:00", to: PAT,
    subject: 'Ada’s session on Tue 6 Oct: 3 questions', questions: 3, status: 'sent' }]);
  run(w, '2026-10-07T06:05:00Z');
  ask('behind a sent receipt with no question_keys, a follow-up went: ' + w.mail.sent.map(m => m.subject) + ' ' + JSON.stringify(laterRows(w)),
    !w.mail.sent.length && !laterRows(w).length);
}
{
  /* A LIVE recap_log FROM BEFORE THE COLUMN: the email is sent and its receipt written, and nothing is
     written to a column that is not there — `WRITE_MISSES`, which `setup` reports as "a value went
     nowhere". With no keys on the receipt that day has no follow-up. */
  const w = seeded({ attempts: ADA_ONLY });
  const g = w.b.tabs.recap_log, ci = g[0].indexOf('question_keys');
  ask('the recap_log tab has no question_keys column to take away, so the ask below was NOT asked', ci !== -1);
  g.forEach(r => r.splice(ci, 1));
  w.b.ev('clearCache(); WRITE_MISSES = []');
  const r = run(w, DUE);
  const missed = w.b.ev('WRITE_MISSES.map(x => x.tab + "." + x.field).join(", ")');
  ask('with no question_keys column the session’s email answered ' + JSON.stringify(r).slice(0, 160) + ', wrote to [' + missed + '] — wanted it sent, its receipt sent, and nothing written past the columns there are',
    r.sent === 1 && !r.failed && !r.error && toOn(w, PAT, TUE).length === 1 && (log(w).find(x => x.parent_id === 'P-C1') || {}).status === 'sent' && !missed);
  w.b.seed('attempts', EVENING);
  run(w, '2026-10-07T06:05:00Z');
  ask('with no question_keys column a follow-up went — the day twice: ' + LATER(w).map(m => m.subject), !LATER(w).length && !laterRows(w).length);
}
{
  /* IN PREVIEW, A `preview` ROW IS THE SESSION'S EMAIL SENT — so the log shows what the follow-up would
     really add, under its own row, and nothing is sent. */
  const w = seeded({ attempts: ADA_ONLY, mode: 'preview' });
  run(w, DUE);
  w.b.seed('attempts', EVENING);
  run(w, '2026-10-07T06:05:00Z');
  const rec = laterRows(w);
  ask('in preview the follow-up was not written as its own preview row behind the session’s: ' + JSON.stringify(rec) + ', ' + w.mail.sent.length + ' sent',
    !w.mail.sent.length && rec.length === 1 && rec[0].status === 'preview' && rec[0].parent_id === 'P-C1'
    && rec[0].subject === 'Ada’s work after the session on Tue 6 Oct: 2 more questions' && Number(rec[0].questions) === 2);
}
{
  /* THE ADMIN'S PREVIEW: a follow-up only behind a receipt. Before the session's email went, the
     Preview shows that email and nothing beside it; after it went and two more were marked, the
     follow-up under the same day, with what it adds, when it falls due and that it has not gone. */
  const w = seeded({ attempts: ADA_ONLY });
  const tue = pv => (((pv.days || []).find(d => d.day === TUE_) || {}).emails || []).filter(m => m.to === PAT);
  w.setClock(at('2026-10-06T19:30:00Z'));
  const before = tue(preview(w));
  ask('before the session’s email went, the Preview showed a follow-up beside it: ' + before.map(m => m.subject).join(' | '),
    before.length === 1 && !before[0].later && /^Ada’s session on Tue 6 Oct/.test(before[0].subject));
  run(w, DUE);
  w.b.seed('attempts', EVENING);
  w.setClock(at('2026-10-07T06:30:00Z'));
  const after = tue(preview(w));
  const f = after.find(m => m.later) || {};
  ask('behind the session’s receipt the Preview does not show the follow-up, due 7am the next morning and not yet gone: ' + JSON.stringify(after.map(m => [m.subject, m.dueSaid, m.state, m.status])),
    after.length === 2 && f.subject === 'Ada’s work after the session on Tue 6 Oct: 2 more questions' && f.dueSaid === '7am on Wed 7 Oct'
    && f.state === 'due' && f.status === '—' && /^After the session on Tuesday 6 October, Ada worked on 2 more questions\./m.test(f.text)
    && after.some(m => !m.later && m.status === 'sent'));
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
  console.log('FAILED — ' + bad.length + ' thing(s) the daily email to parents gets wrong:');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — due on London’s clock after the last session, Booked seats only, the child’s own day, accepted parents with this email’s opt-out; every other day of work the next morning, one email a child a day, only a child; each question with its own words; a session day’s follow-up with only what came after; off nothing, preview the log, send once; one hourly trigger, booked by nobody but the owner; the preview an admin’s.');
