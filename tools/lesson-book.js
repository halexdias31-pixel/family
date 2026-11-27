#!/usr/bin/env node
/* @family. — tools/lesson-book.js BOOKING IS ADDING A LESSON TO THE ONE LIST (rule 1.39, 1.75; owner 27 Nov: BOOKING IS ADDING TO THE ONE LIST,
   NO ACCEPT/DECLINE, MONEY decided). backend/post-booking.gs addLesson / cancelLesson / lessons and backend/access.gs bookingsToLessons27NovRun_ in
   the backend vm, on made-up people (a parent, her child, a tutor with Wednesday 17:00-19:00 free, a stranger, an admin), the clock 20 Nov 2026:
   a lesson inside the tutor's free time is booked at once (nobody accepts), weekly to the end of the term it starts in, a holiday or closed day
   skipped, a different first one kept (RDATE), paid up front for the term (owed until paid; the next term is a new payment); outside the free
   time, or clashing, it is refused; a child cannot book, nor anyone for a child not theirs; a child is sent the lesson with no price, a stranger
   nothing; a tutor's cancellation refunds that one lesson only, once, and an unpaid one nothing; a live booking moves to its learner's lessons
   (backup first, paid stays paid, a re-run a no-op); the request/accept/decline path is gone; the Docket's Add asks the kind. Each rule proved by
   breaking the result (--prove prints it). No real names or text, by design. Run by tools/build.js. */
'use strict';
const { report, main, text } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');

const P = (id, role, first, x) => Object.assign({ person_id: id, role, first_name: first, last_name: 'Madeup', email: id.toLowerCase() + '@example.test' }, x || {});
/* WEDNESDAYS 17:00-19:00 (w17, w18) and Saturday 14:00-15:00 (sa14). */
const PEOPLE = () => [P('P-PAR', 'client', 'Pat'), P('P-KID', 'student', 'Kit'), P('P-TUT', 'tutor', 'Tam', { availability: 'w17,w18,sa14' }),
  P('P-STR', 'client', 'Sam'), P('P-ADM', 'admin', 'Ada'), P('P-T2', 'tutor', 'Tia', { availability: 'w17,w18' })];
const PENCE = 2500;

function world(jobs) {
  const ctx = load({ at: true, console: { log() {}, warn() {}, error() {} } }), B = book(), told = [];
  /* BOOKINGS ARE ITEMS OF KIND booking (storeMoved_), as people are of kind person. */
  const J = jobs ? jobs.slice(1).map(r => Object.fromEntries(jobs[0].map((h, i) => [h, r[i]]))) : [];
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1']].concat(PEOPLE().map(p => [p.person_id, 'person', JSON.stringify(p)]), J.map(j => [j.job_id, 'booking', JSON.stringify(j)])));
  B.tabs.items.getParent = () => B.ss;
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  Object.assign(ctx, {
    jsonOut: o => o, deliver_: (to, kind, m) => { told.push({ to: String(to && to.person_id || to), kind, m }); return {}; }, notify: (to, subj) => { told.push({ to, subj, mail: true }); },
    acceptedLinks: () => [{ parent_id: 'P-PAR', child_id: 'P-KID', state: 'accepted' }],
    lessonPrice_: (b, t, dates) => ({ totalPence: PENCE * dates.length, perLessonPence: PENCE, tutorPayPence: 1500 * dates.length }),
  });
  const cell = id => { const r = B.tabs.items.v.find(x => x[0] === id); return JSON.parse(r[2]).lessons || ''; };
  const call = (fn, body) => { ctx.clearCache(); let o; try { o = ctx[fn](body, '', Date.now()); } catch (e) { o = { threw: String(e && e.stack || e) }; } return o; };
  return { ctx, B, told, cell, call };
}
const lessonsIn = (w, id) => { const c = w.cell(id); return c ? JSON.parse(c).lessons : []; };

function scene() {
  const w = world();
  const m = {};
  /* (1) BOOKED AT ONCE: Wednesdays 17:30 for an hour, from 25 Nov, for her child. */
  m.add = w.call('postAddLesson_', { personId: 'P-PAR', learnerId: 'P-KID', tutorId: 'P-TUT', start: '2026-11-25T17:30', minutes: 60, rrule: 'FREQ=WEEKLY', subject: 'Maths' });
  m.kidCell = lessonsIn(w, 'P-KID');
  m.toldTutor = w.told.filter(t => t.to === 'P-TUT' || /Tam/.test(String(t.to)));
  m.plan = w.ctx.lessonPlanPure_({ start: '2026-11-25T17:30', rrule: 'FREQ=WEEKLY' }, w.ctx.termsFor(2026), ['2026-12-02']);
  m.terms = w.ctx.termsFor(2026).filter(t => t.kind === 'term').map(t => w.ctx.$('lsDay_')(t.start) + '..' + w.ctx.$('lsDay_')(t.end));
  /* (2) A DIFFERENT FIRST ONE: Saturday 28 Nov 14:00 once, then Wednesdays 18:00, for the parent herself with the second tutor? no: the first tutor. */
  m.rdate = w.ctx.lessonOccurPure_({ start: '2026-12-02T18:00', rrule: 'FREQ=WEEKLY', rdate: ['2026-11-28T14:00'], moved: ['2026-12-09T18:00=2026-12-10T18:00'] }, '2026-12-16');
  /* (3) REFUSED: outside the free time; a clash with the first; a child booking; a stranger booking for the child. */
  m.outside = w.call('postAddLesson_', { personId: 'P-PAR', learnerId: 'P-KID', tutorId: 'P-TUT', start: '2026-11-26T17:30', minutes: 60, rrule: 'FREQ=WEEKLY' });
  m.clash = w.call('postAddLesson_', { personId: 'P-PAR', learnerId: 'P-KID', tutorId: 'P-T2', start: '2026-11-25T18:00', minutes: 60, rrule: 'FREQ=WEEKLY' });
  m.child = w.call('postAddLesson_', { personId: 'P-KID', tutorId: 'P-T2', start: '2026-11-25T17:00', minutes: 30 });
  m.stranger = w.call('postAddLesson_', { personId: 'P-STR', learnerId: 'P-KID', tutorId: 'P-T2', start: '2026-11-25T17:00', minutes: 30 });
  /* (4) WHO SEES WHAT. */
  m.seen = {}; ['P-PAR', 'P-KID', 'P-TUT', 'P-STR', 'P-ADM'].forEach(id => { const o = w.call('postLessons_', { personId: id }); m.seen[id] = (o && o.lessons) || []; });
  /* (5) THE TUTOR CANCELS ONE: unpaid first (nothing back), then paid (that one back, once). */
  const id = m.kidCell[0] && m.kidCell[0].id, d0 = m.kidCell[0] && m.kidCell[0].dates[0], d1 = m.kidCell[0] && m.kidCell[0].dates[1];
  m.cancelUnpaid = w.call('postCancelLesson_', { personId: 'P-TUT', lessonId: id, date: d0 });
  w.ctx.lessonPaid_(id, '');
  m.cancelStranger = w.call('postCancelLesson_', { personId: 'P-STR', lessonId: id, date: d1 });
  m.cancelPaid = w.call('postCancelLesson_', { personId: 'P-TUT', lessonId: id, date: d1 });
  m.cancelAgain = w.call('postCancelLesson_', { personId: 'P-TUT', lessonId: id, date: d1 });
  m.after = lessonsIn(w, 'P-KID')[0];
  /* (6) THE NEXT TERM IS A NEW PAYMENT: booked from January, it pays January's term only. */
  m.next = w.call('postAddLesson_', { personId: 'P-PAR', tutorId: 'P-T2', start: '2027-01-13T17:00', minutes: 60, rrule: 'FREQ=WEEKLY' });
  /* (7) THE MOVE: two live bookings (one paid, for the child; one awaiting a tutor's answer, for the parent), one cancelled, one past. */
  const H = ['job_id', 'kind', 'subject', 'level', 'start_time', 'session_dates', 'hours_per_session', 'venue', 'price_total', 'tutor_pay', 'for_children', 'term_name'];
  const J = [H, ['J1', '', 'Made-up A', 'GCSE', '17:00', '02/12/2026, 09/12/2026', 1, 'Room Z', 60, 30, 'Kit', 'Autumn'],
    ['J2', '', 'Made-up B', '', '18:00', '03/12/2026', 1.5, '', 40, 20, '', 'Autumn'],
    ['J3', '', 'Made-up C', '', '18:00', '03/12/2026', 1, '', 40, 20, '', ''], ['J4', '', 'Made-up D', '', '18:00', '01/10/2026', 1, '', 40, 20, '', '']];
  const v = world(J);
  const parts = { J1: [{ name: 'Pat Madeup', role: 'client', status: 'Booked' }, { name: 'Tam Madeup', role: 'tutor', status: 'Booked' }],
    J2: [{ name: 'Pat Madeup', role: 'client', status: 'Waiting' }, { name: 'Tia Madeup', role: 'tutor', status: 'Waiting' }], J3: [], J4: [{ name: 'Pat Madeup', role: 'client', status: 'Booked' }, { name: 'Tam Madeup', role: 'tutor', status: 'Booked' }] };
  v.ctx.participantsOf = jid => parts[jid] || [];
  const run = () => { v.ctx.clearCache(); try { return v.ctx.bookingsToLessons27NovRun_(); } catch (e) { return 'threw ' + e.stack; } };
  m.moveSaid = run(); m.movedKid = lessonsIn(v, 'P-KID'); m.movedPar = lessonsIn(v, 'P-PAR'); m.backup = v.B.tabs.backup_bookings_lessons_27nov;
  m.backupN = m.backup ? m.backup.v.length : 0;
  m.again = run(); m.movedKidAgain = lessonsIn(v, 'P-KID'); m.backupAgain = m.backup ? m.backup.v.length : 0;
  return m;
}
const err = o => !!(o && (o.error || o.threw));
const MONEY = ['totalPence', 'perLessonPence', 'pay', 'refunds', 'tutorPayPence'];
const RULES = [
  ['inside the tutor\'s free time a lesson is booked at once, nobody asked to accept', m => m.add && m.add.success === true && m.kidCell.length === 1 && m.kidCell[0].tutorId === 'P-TUT' && m.kidCell[0].payerId === 'P-PAR'],
  ['the tutor is told, not asked', m => m.toldTutor.length >= 1 && !m.toldTutor.some(t => /accept|decline|request/i.test(JSON.stringify(t)))],
  ['it is every Wednesday to the end of the term it starts in, paid up front for all of them', m => { const L = m.kidCell[0]; const end = m.terms.find(t => t.split('..')[0] <= '2026-11-25' && t.split('..')[1] >= '2026-11-25');
    return !!L && !!end && L.dates.length >= 3 && L.dates.every(d => /T17:30$/.test(d) && new Date(d + 'Z').getUTCDay() === 3 && d.slice(0, 10) <= end.split('..')[1])
      && L.dates[L.dates.length - 1].slice(0, 10) > '2026-12-' + '01' && L.totalPence === PENCE * L.dates.length && L.pay === 'owed'; }],
  ['a closed day inside the term is skipped (and in its exdate)', m => m.plan.dates.indexOf('2026-12-02T17:30') < 0 && m.plan.skipped.indexOf('2026-12-02T17:30') >= 0 && m.plan.dates.indexOf('2026-12-09T17:30') >= 0],
  ['a different first one (RDATE) and one moved occurrence are kept', m => m.rdate.join('|') === '2026-11-28T14:00|2026-12-02T18:00|2026-12-10T18:00|2026-12-16T18:00'],
  ['outside the tutor\'s free time it is refused', m => err(m.outside) && /not free/.test(m.outside.error || '')],
  ['a clash with a lesson already booked is refused', m => err(m.clash) && /clash/.test(m.clash.error || '')],
  ['a child cannot book, nor a stranger for a child not theirs', m => err(m.child) && err(m.stranger) && lessonsIn.length >= 0],
  ['the parent sees the lesson and its price', m => m.seen['P-PAR'].length === 1 && m.seen['P-PAR'][0].totalPence > 0],
  ['the child sees her lesson with no price anywhere', m => m.seen['P-KID'].length === 1 && MONEY.every(k => !(k in m.seen['P-KID'][0])) && !/Pence|"pay"/.test(JSON.stringify(m.seen['P-KID']))],
  ['the tutor sees it without the family\'s money; a stranger sees nothing; an admin sees it', m => m.seen['P-TUT'].length === 1 && !('totalPence' in m.seen['P-TUT'][0]) && m.seen['P-STR'].length === 0 && m.seen['P-ADM'].length === 1],
  ['a tutor cancelling an unpaid lesson refunds nothing; it leaves the list', m => m.cancelUnpaid && m.cancelUnpaid.success && m.cancelUnpaid.refundedPence === 0 && m.after.exdate.indexOf(m.after.dates[0]) >= 0],
  ['only its tutor (or an admin) cancels', m => err(m.cancelStranger)],
  ['a tutor cancelling a paid lesson refunds that one lesson only, once', m => m.cancelPaid && m.cancelPaid.refundedPence === PENCE && err(m.cancelAgain) && m.after.refunds.length === 1 && m.after.refunds[0].pence === PENCE],
  ['the next term is a new payment: booked from January it pays January\'s term only', m => m.next && m.next.success && m.next.lesson.dates.every(d => d >= '2027-01-13') && m.next.lesson.dates.length >= 3 && m.next.lesson.dates.length <= 16
    && m.next.lesson.totalPence === PENCE * m.next.lesson.dates.length],
  ['every live booking is a lesson for its learners: paid stays paid, the awaited one owed, nobody asked', m => m.movedKid.length === 1 && m.movedKid[0].pay === 'paid' && m.movedKid[0].dates.join('|') === '2026-12-02T17:00|2026-12-09T17:00'
    && m.movedKid[0].totalPence === 6000 && m.movedPar.length === 1 && m.movedPar[0].pay === 'owed' && m.movedPar[0].tutorId === 'P-T2' && m.movedPar[0].minutes === 90],
  ['the cancelled and the past are not moved', m => !m.movedPar.concat(m.movedKid).some(l => /J3|J4/.test(l.fromJob))],
  ['the backup holds each moved booking\'s whole row first', m => m.backupN === 2 && JSON.parse(m.backup.v[0][2]).job_id === 'J1'],
  ['a re-run of the move is a no-op', m => /nothing to do/.test(m.again) && m.movedKidAgain.length === 1 && m.backupAgain === 2],
];
function prove(m) {
  const cp = o => JSON.parse(JSON.stringify(o));
  const breaks = [x => { x.kidCell = []; }, x => { x.toldTutor = [{ m: 'please accept' }]; }, x => { x.kidCell[0].dates.pop(); x.kidCell[0].totalPence += 1; }, x => { x.kidCell[0].pay = 'paid'; },
    x => { x.plan.dates.push('2026-12-02T17:30'); }, x => { x.rdate.shift(); }, x => { x.rdate[2] = '2026-12-09T18:00'; }, x => { x.outside = { success: true }; }, x => { x.clash = {}; },
    x => { x.child = { success: true }; }, x => { x.stranger = {}; }, x => { x.seen['P-PAR'][0].totalPence = 0; }, x => { x.seen['P-KID'][0].totalPence = 1; }, x => { x.seen['P-STR'] = [{}]; },
    x => { x.seen['P-TUT'][0].totalPence = 1; }, x => { x.cancelUnpaid.refundedPence = PENCE; }, x => { x.cancelStranger = { success: true }; }, x => { x.cancelAgain = { success: true }; },
    x => { x.next.lesson.dates.unshift('2026-12-16T17:00'); }, x => { x.movedKid[0].pay = 'owed'; }, x => { x.movedPar = []; }, x => { x.movedKid.push({ fromJob: 'J4' }); },
    x => { x.backupN = 0; }, x => { x.movedKidAgain.push({}); }];
  return breaks.map((b, i) => { const x = cp(m); x.backup = m.backup; b(x);
    return RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
}
function run() {
  const bad = [], checks = [];
  let m = null; try { m = scene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['the lesson actions ran', () => false]);
  else {
    RULES.forEach(([n, f]) => checks.push([n, () => f(m)]));
    checks.push(['every break of the result caught', () => { const missed = prove(m);
      if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (missed.length ? 'break(s) missed: ' + missed.join(',') : 'every break caught'));
      return !missed.length; }]);
  }
  const acc = text('backend/access.gs'), actions = text('data/settings/actions.json'), tiles = text('js/tiles-jobs.js'), rec = text('js/receipt.js'), map = text('js/map.js'), pb = text('backend/post-booking.gs');
  checks.push(['MIGRATIONS runs the move, retried until it works', () => /\{ id: 'bookings-lessons-27nov',\s*retry: true,[\s\S]*?run: \(\) => bookingsToLessons27NovRun_\(\) \}/.test(acc)]);
  checks.push(['the request/accept/decline path is gone (no answerRequest or createJob; no Accept, Decline, Apply or Choose tile)', () => !/answerRequest|"createJob"/.test(actions) && !/postAnswerRequest_|function postCreateJob_/.test(pb)
    && !/job-request-answer|job-answer|job-apply|job-choose/.test(tiles + rec) && /act === ACT\.ACCEPT \|\| act === ACT\.DECLINE\) return jsonOut/.test(pb)]);
  checks.push(['the booking form adds a lesson and goes straight to paying', () => /action: 'addLesson'/.test(rec) && /action: 'createCheckout', lessonId/.test(rec)]);
  checks.push(['the Docket\'s Add asks the kind: task, event, lesson', () => /DK_ADD_KINDS = \[\{ kind: 'task'[\s\S]*?kind: 'event'[\s\S]*?kind: 'lesson'/.test(map) && /on\('dk-qevent'/.test(map) && /on\('dk-qlesson'/.test(map)]);
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('lesson-book: ' + checks.length + ' rules' + (m ? ' (move: ' + String(m.moveSaid).slice(0, 120) + ')' : '') + '; ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  if (bad.length && m && process.argv.includes('--why')) console.log(JSON.stringify({ add: m.add, terms: m.terms, plan: m.plan, outside: m.outside, clash: m.clash, child: m.child, stranger: m.stranger, seen: m.seen,
    cu: m.cancelUnpaid, cp: m.cancelPaid, ca: m.cancelAgain, next: m.next, moved: m.moveSaid, mk: m.movedKid, mp: m.movedPar, again: m.again }, null, 1).slice(0, 6000));
  report('lesson-book', bad, 'lesson booking rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
