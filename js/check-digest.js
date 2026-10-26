#!/usr/bin/env node
/* node js/check-digest.js — THE SUNDAY PARENT EMAIL AND ITS MARKS, ASKED OF THE REAL BACKEND § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path');
/* THE WORLD — MailApp, ScriptApp, the lock and a London clock over the real backend — is `check-mail-load.js` now, lifted out of this file when the email after a § */
const { world, cfgSet, rowsOf, at, strip, calls, unquote, mentions } = require('./check-mail-load.js');

const bad = [];
let asked = 0;
const REPO = path.resolve(__dirname, '..');

const run = (b, s) => JSON.parse(JSON.stringify(b.ev('clearCache(); digestRun_(new Date(' + at(s) + '))')));
/* THE HTML WITHOUT ITS INLINE STYLES — what the email says, asked apart from how it is dressed. */
const unstyled = h => String(h || '').replace(/ style="[^"]*"/g, '').replace(/<\/?span>/g, '').replace(/^<div>|<\/div>$/g, '');
/* WHAT THE HTML SAYS, IN READING ORDER — its tags gone, its spaces one: the cards (380) asked for their words, not their dress. */
const said = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- THE PEOPLE, THE FAMILIES AND A WEEK OF WORK § */
const SUN = '2026-10-04T17:00:00Z';
function seeded(opts) {
  const w = world(opts);
  const { b } = w;
  /* THE RUN'S OWN LOG LINES — "the question library was NOT fetched", in a world with no network — kept, not
     printed: what a check says is its list of what went wrong. */
  w.logs = [];
  w.G.console = { log: x => w.logs.push(String(x)), warn: x => w.logs.push(String(x)), error: x => w.logs.push(String(x)), info: () => {} };
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  const P = (id, first, last, role, email, extra) => Object.assign({ person_id: id, first_name: first, last_name: last,
    handle: (first + last).toLowerCase(), email: email || '', role: role }, base, extra || {});
  b.seed('people', [
    P('P-A1', 'Hal', 'Admin', 'admin', 'a1@example.org'),
    P('P-S1', 'Ada', 'Pupil', 'student', 's1@example.org'),
    P('P-S2', 'Ben', 'Pupil', 'student', 's2@example.org'),
    P('P-S3', 'Cal', 'Alone', 'student', 's3@example.org'),
    P('P-S4', 'Dee', 'Nomail', 'student', 's4@example.org'),
    P('P-S5', 'Eve', 'Quiet', 'student', 's5@example.org'),
    P('P-C1', 'Pat', 'Parent', 'client', 'pat@example.org'),
    P('P-C2', 'Pam', 'Parent', 'client', 'pam@example.org', { weekly_email: 'no' }),
    P('P-C3', 'Peg', 'Pending', 'client', 'peg@example.org'),
    P('P-C4', 'Rex', 'Refused', 'client', 'rex@example.org'),
    P('P-C5', 'Bo', 'Other', 'client', 'bo@example.org'),
    P('P-C6', 'Nan', 'Noaddress', 'client', ''),
    P('P-C7', 'Yes', 'Please', 'client', 'yes@example.org', { weekly_email: 'yes' }),
  ]);
  const L = (n, parent, child, state) => ({ link_id: 'L' + n, parent_id: parent, child_id: child, child_typed: '', state: state });
  b.seed('family', [
    L(1, 'P-C1', 'P-S1', 'accepted'),
    L(2, 'P-C2', 'P-S1', 'accepted'),       // opted out
    L(3, 'P-C3', 'P-S1', 'asked'),          // never answered
    L(4, 'P-C4', 'P-S1', 'refused'),
    L(5, 'P-C5', 'P-S2', 'accepted'),       // Ben's, and Ben's only
    L(6, 'P-C6', 'P-S4', 'accepted'),       // no address
    L(7, 'P-S1', 'P-S1', 'accepted'),       // a typo linking Ada to herself
    L(8, 'P-C7', 'P-S5', 'accepted'),
  ]);
  /* ONE ROW PER PRESS (SCHEMA.submissions). § */
  b.seed('submissions', [
    S('P-S1', 'q:ADA-1', '2026-09-28', 'Maths · Paper 1 (Calculator) — June 2024 · Q1', 'right'),
    S('P-S1', 'q:ADA-1', '2026-09-30', 'Maths · Paper 1 (Calculator) — June 2024 · Q1', 'right'),
    S('P-S1', 'q:ADA-1', '2026-10-02', 'Maths · Paper 1 (Calculator) — June 2024 · Q1', 'wrong'),
    S('P-S1', 'q:ADA-1', '2026-10-05', 'Maths · Paper 1 (Calculator) — June 2024 · Q1', 'right'),
    S('P-S1', 'q:ADA-SUN', '2026-10-04', 'Fractions & decimals · Q2', 'right'),
    S('P-S1', 'q:ADA-AGAIN', '2026-09-10', '', 'wrong'),
    S('P-S1', 'q:ADA-AGAIN', '2026-10-02', '', 'right'),
    S('P-S1', 'q:ADA-SUN-BEFORE', '2026-09-27', 'The Sunday before'),
    S('P-S1', 'q:ADA-MON-AFTER', '2026-10-05', 'The Monday after'),
    S('P-S2', 'q:BEN-1', '2026-10-01', 'Ben’s own'),
    S('P-S3', 'q:CAL-1', '2026-10-02', 'Cal’s'),
    S('P-S4', 'q:DEE-1', '2026-10-03', 'Dee’s'),
    S('P-S5', 'q:EVE-OLD', '2026-09-20', 'Eve’s, last week'),
  ]);
  return w;
}
/* A PRESS AS THE SHEET HOLDS IT: noon in London (13:00 BST is 12:00Z) on `day` unless `hh` says the hour,
   an answer, a verdict (right by default), a name and words, and an id in the phone's shape. */
let SEQ = 0;
function S(pid, key, day, label, verdict, words, hh, more) {
  return Object.assign({ person_id: pid, key: key, label: label || '', words: words || '', answer: 'an answer',
           verdict: verdict || 'right', submitted_at: new Date(day + 'T' + String(hh == null ? 12 : hh).padStart(2, '0') + ':00:00Z'),
           event_id: (1759000000000 + (++SEQ)) + '-dg' + String(SEQ).padStart(4, '0') }, more || {});
}

/* ---------- 1. WHAT A WEEK IS ------------------------------------------------------------------------- */
{
  const { b } = world();
  const wk = s => { const w = b.ev('digestWeek_(new Date(' + at(s) + '))'); return w.start + '..' + w.end; };
  const ws = s => { const w = b.ev('digestWeekToSend_(new Date(' + at(s) + '))'); return w.start + '..' + w.end; };
  const cases = [
    ['a Sunday evening in summer', wk, SUN, '2026-09-28..2026-10-04'],
    ['a Monday morning', wk, '2026-10-05T09:00:00Z', '2026-10-05..2026-10-11'],
    /* 23:30 UTC on Sunday 18 Oct IS 00:30 ON MONDAY 19 OCT IN LONDON — a new week. */
    ['00:30 on a Monday in summer (still Sunday in UTC)', wk, '2026-10-18T23:30:00Z', '2026-10-19..2026-10-25'],
    /* THE SUNDAY THE CLOCKS GO BACK, 25 Oct 2026: 18:00 GMT, the email's hour, and the week it ends. */
    ['18:00 on the Sunday the clocks go back', wk, '2026-10-25T18:00:00Z', '2026-10-19..2026-10-25'],
    ['00:30 on the Sunday the clocks go back, still BST', wk, '2026-10-24T23:30:00Z', '2026-10-19..2026-10-25'],
    ['00:30 on the Monday after the clocks went back', wk, '2026-10-26T00:30:00Z', '2026-10-26..2026-11-01'],
    /* THE SUNDAY THE CLOCKS GO FORWARD, 29 Mar 2026. 23:30 UTC that night is Monday 00:30 BST. */
    ['18:00 BST on the Sunday the clocks go forward', wk, '2026-03-29T17:00:00Z', '2026-03-23..2026-03-29'],
    ['00:30 on the Monday after the clocks went forward', wk, '2026-03-29T23:30:00Z', '2026-03-30..2026-04-05'],
    /* AND THE WEEK A RUN SENDS: this one on a Sunday, the one just ended on any other day. */
    ['a run on the Sunday', ws, SUN, '2026-09-28..2026-10-04'],
    ['a run by hand on the Monday after', ws, '2026-10-05T09:00:00Z', '2026-09-28..2026-10-04'],
    ['a run by hand at 00:30 on a summer Monday', ws, '2026-10-18T23:30:00Z', '2026-10-12..2026-10-18'],
    ['a run on the Sunday the clocks go back', ws, '2026-10-25T18:00:00Z', '2026-10-19..2026-10-25'],
  ];
  cases.forEach(([what, f, s, want]) => {
    asked++;
    const got = f(s);
    if (got !== want) bad.push('the week for ' + what + ' (' + s + ') is ' + got + ', wanted ' + want
      + ' — Monday 00:00 to Sunday 23:59, London');
  });
}

/* ---------- 2. THE PLAN: ONLY THAT WEEK, PER LEARNER, ONLY TO ACCEPTED PARENTS -------------------------- */
{
  const { b } = seeded();
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const L = id => plan.learners.find(x => x.id === id);
  const ada = L('P-S1');
  const keys = list => (list || []).map(q => q.key).sort().join(', ');
  if (!ada) bad.push('Ada did three things this week and is not in the plan');
  else {
    if (keys(ada.fresh) !== 'q:ADA-1, q:ADA-SUN') bad.push('Ada’s new this week is [' + keys(ada.fresh) + '], wanted q:ADA-1 (the Monday) and q:ADA-SUN (the Sunday) — the week is Monday to Sunday inclusive');
    if (keys(ada.again) !== 'q:ADA-AGAIN') bad.push('Ada’s gone-back-to is [' + keys(ada.again) + '], wanted q:ADA-AGAIN (sent on 10 Sep, again on 2 Oct)');
    /* THE WEEK'S LATEST VERDICT, ONE LINE PER QUESTION: § */
    asked++;
    const a1 = (ada.fresh || []).filter(q => q.key === 'q:ADA-1');
    if (a1.length !== 1) bad.push('q:ADA-1, sent three times in the week, is ' + a1.length + ' items in the plan — one question is one line however often it was sent');
    else if (a1[0].verdict !== 'wrong') bad.push('q:ADA-1’s verdict in the plan is ' + JSON.stringify(a1[0].verdict) + ' — wanted the week’s LAST press, Friday’s wrong; not Monday’s right, not next Monday’s');
    const sun = (ada.fresh || []).find(q => q.key === 'q:ADA-SUN');
    if (!sun || sun.verdict !== 'right') bad.push('q:ADA-SUN, right on the Sunday, is in the plan as ' + JSON.stringify(sun));
    const ag = (ada.again || [])[0];
    if (ag && ag.verdict !== 'right') bad.push('q:ADA-AGAIN’s verdict is ' + JSON.stringify(ag.verdict) + ' — wanted this week’s right, not the wrong from 10 Sep');
    if (/BEFORE|AFTER/.test(keys(ada.fresh) + keys(ada.again))) bad.push('a question from the Sunday before or the Monday after is in Ada’s week');
    /* A ROW WITH NO NAME IS IN THE PLAN BY ITS KEY AND WITH NO LABEL — never the key as its label, which
       is how a key reached a parent's email until the email listed each question with its words. */
    const again = (ada.again || [])[0];
    if (again && (again.label !== '' || !again.hidden || again.key !== 'q:ADA-AGAIN')) bad.push('a row with no label is in the plan as ' + JSON.stringify(again) + ' — wanted key q:ADA-AGAIN, label "", hidden: counted, never printed by its key');
    const first = (ada.fresh || []).find(q => q.key === 'q:ADA-1');
    if (first && first.label !== 'Maths · Paper 1 (Calculator) — June 2024 · Q1') bad.push('the label the phone sent is not the name used: "' + first.label + '"');
    const to = (ada.to || []).map(p => p.id).sort().join(', ');
    if (to !== 'P-C1') bad.push('Ada’s email goes to [' + to + '] — wanted Pat (P-C1) alone: Pam opted out, Peg never answered, Rex was refused, Bo is another family’s, and Ada is not her own parent');
  }
  if (plan.learners.some(x => x.id === 'P-S5')) bad.push('Eve did nothing this week and is in the plan');
  const ben = L('P-S2');
  if (!ben || (ben.to || []).map(p => p.id).join() !== 'P-C5') bad.push('Ben’s email does not go to his own parent alone: ' + JSON.stringify(ben && ben.to));
  const toOf = who => plan.emails.filter(m => m.to === who);
  ['pam@example.org', 'peg@example.org', 'rex@example.org', 's1@example.org', 's2@example.org'].forEach(a => {
    if (toOf(a).length) bad.push('an email is planned to ' + a + ' — ' + toOf(a).map(m => m.subject).join(' | '));
  });
  if (toOf('bo@example.org').some(m => /ADA|Ada/.test(m.text))) bad.push('Bo, Ben’s parent, is sent something about Ada');
  if (plan.emails.length !== 2) bad.push('the plan has ' + plan.emails.length + ' emails, wanted 2 (Pat about Ada, Bo about Ben)');
  const un = id => plan.unreachable.find(u => u.id === id);
  if (!un('P-S3') || !/no parent/i.test(un('P-S3').why)) bad.push('Cal, who has no parent linked, is not listed as unreachable with that reason: ' + JSON.stringify(un('P-S3')));
  if (!un('P-S4') || !/no email address/i.test(un('P-S4').why)) bad.push('Dee, whose one parent has no address, is not listed as unreachable with that reason: ' + JSON.stringify(un('P-S4')));
  if (toOf('s3@example.org').length || toOf('s4@example.org').length) bad.push('an unreachable learner is emailed to themselves');

  const pat = toOf('pat@example.org')[0];
  if (!pat) bad.push('Pat is not sent Ada’s week');
  else {
    if (pat.subject !== 'Ada’s week: 3 questions') bad.push('Pat’s subject is "' + pat.subject + '"');
    /* THE WEEK'S LIST, GROUPED BY PAPER: the paper's name once, then its question with the week's latest
       verdict beside its number; a question with no name is the "1 more", never its key. */
    ['Hi Pat,\n', '28 Sep – 4 Oct', '\nMaths · Paper 1 (Calculator) — June 2024\nQ1 ✗\n', '\nFractions & decimals\nQ2 ✓\n', '\n…and 1 more.\n',
     'Don’t want these any more? Just reply and say so.',
     /* WORDED FOR WHAT THE SHEET KNOWS: a first keystroke is "worked on", not "did"; the run is at 18:00 so
        the week is "up to 6pm"; and the marks the list has are said once, in the lead. */
     'Here’s what Ada worked on this week: 3 questions', '28 Sep – 4 Oct, up to 6pm on Sunday', 'Beside each one is how it went: ✓ right or ✗ not right.'].forEach(s => {
      if (pat.text.indexOf(s) === -1) bad.push('Pat’s email does not say "' + s + '"');
    });
    /* CUT ON 12 OCT — the owner: *"all they need to see are the questions their kids have done this week"*.
       Not the parent's own name, not the new/again split, not a link to the site, not "(again)". */
    asked++;
    ['Hello Pat', 'gone back to', ' new and ', '(again)', 'can see them', 'https://', 'http://'].forEach(x => {
      if ((pat.subject + pat.text + pat.html).indexOf(x) !== -1) bad.push('Pat’s email still says "' + x + '" — the email is the week’s questions and how they went, and nothing else');
    });
    if (/q:ADA/.test(pat.subject + pat.text + pat.html)) bad.push('Pat’s email prints a raw key — a question with no name is counted in "…and N more", never listed by its key: ' + pat.text.split('\n').slice(4, 12).join(' / '));
    if (/\bdid \d/.test(pat.text) || /See them on the site/.test(pat.text)) bad.push('Pat’s email still says the child "did" N questions, or tells the parent to see them — ' + pat.text.split('\n')[2]);
    if (pat.html.indexOf('Fractions\u00a0&amp;\u00a0decimals') === -1) bad.push('the HTML body does not escape a label’s "&"');
    /* ABOUT ONE CHILD, FROM THE BUSINESS: no other child, no tutor, no price. */
    const other = /\b(Ben|Cal|Dee|Eve|Hal)\b|£|\b[Tt]utor\b/;
    if (other.test(pat.subject + pat.text + pat.html)) bad.push('Pat’s email about Ada names another child, a tutor or a price: ' + (pat.text.split('\n').find(x => other.test(x)) || pat.subject));
    if (/<script|Fractions & decimals/.test(pat.html)) bad.push('the HTML body carries a label unescaped');
  }
}

/* ---------- 2a. A PRESS IS IN THE WEEK BY LONDON'S CALENDAR, NOT BY UTC'S § */
{
  const { b } = seeded();
  b.seed('submissions', [
    S('P-S5', 'q:EVE-EARLY', '2026-09-27', 'Maths · Late · Q1', 'right', '', 23),
    S('P-S5', 'q:EVE-LATE', '2026-10-04', 'Maths · Late · Q2', 'right', '', 23),
  ]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const eve = plan.learners.find(x => x.id === 'P-S5');
  const got = eve ? [].concat(eve.fresh || [], eve.again || []).map(q => q.key).sort().join(', ') : '';
  if (got !== 'q:EVE-EARLY') bad.push('Eve’s week is [' + got + '] — wanted q:EVE-EARLY alone: 00:00 on Monday 28 Sep in London is this week, and 00:00 on Monday 5 Oct is next week, whatever UTC says');
}

/* ---------- 2a2. THE WEEK'S LATEST IS BY TIME, NOT BY ROW, AND A TIE IS THE LATER ROW § */
{
  const { b } = seeded();
  const P = iso => ({ pressed_at: iso });
  b.seed('submissions', [
    S('P-S5', 'q:EVE-TIE', '2026-10-01', 'Maths · Ties · Q1', 'wrong'),
    S('P-S5', 'q:EVE-TIE', '2026-10-01', 'Maths · Ties · Q1', 'right'),
    S('P-S5', 'q:EVE-REV', '2026-10-01', 'Maths · Ties · Q2', 'right', '', 14),
    S('P-S5', 'q:EVE-REV', '2026-10-01', 'Maths · Ties · Q2', 'wrong', '', 10),
    S('P-S5', 'q:EVE-PRESS', '2026-10-02', 'Maths · Ties · Q3', 'wrong', '', 12, P("'2026-09-30T09:00:00.000Z")),
    S('P-S5', 'q:EVE-PRESS', '2026-10-02', 'Maths · Ties · Q3', 'right', '', 12, P("'2026-09-29T09:00:00.000Z")),
    S('P-S5', 'q:EVE-PTIE', '2026-10-02', 'Maths · Ties · Q4', 'wrong', '', 12, P("'2026-09-29T09:00:00.000Z")),
    S('P-S5', 'q:EVE-PTIE', '2026-10-02', 'Maths · Ties · Q4', 'right', '', 12, P("'2026-09-29T09:00:00.000Z")),
  ]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const eve = plan.learners.find(x => x.id === 'P-S5');
  const items = eve ? [].concat(eve.fresh || [], eve.again || []) : [];
  const v = k => { const q = items.find(x => x.key === k); return q ? q.verdict : '(not in the plan)'; };
  const want = { 'q:EVE-TIE': 'right', 'q:EVE-REV': 'right', 'q:EVE-PRESS': 'wrong', 'q:EVE-PTIE': 'right' };
  const why = {
    'q:EVE-TIE': 'two presses in one instant — the later row is the latest, as the card has it',
    'q:EVE-REV': 'the later instant is on the earlier row — time decides, not where the row sits',
    'q:EVE-PRESS': 'one flush, so one arrival; Wednesday’s press is later than Tuesday’s on the row below it',
    'q:EVE-PTIE': 'one flush, pressed in one instant — the later row',
  };
  Object.keys(want).forEach(k => { if (v(k) !== want[k]) bad.push(k + '’s mark in the plan is ' + JSON.stringify(v(k)) + ', wanted ' + want[k] + ' — ' + why[k]); });
  /* AND THE CARD SAYS THE SAME: the latest per key `submissionsBuild_` gives Eve, for the same rows. */
  asked++;
  const built = JSON.parse(JSON.stringify(b.ev('clearCache(); submissionsBuild_("P-S5", false)'))).mine || {};
  Object.keys(want).forEach(k => { const m = built[k]; if (!m || m.verdict !== want[k]) bad.push('the card’s latest for ' + k + ' is ' + JSON.stringify(m && m.verdict) + ' and the email’s is ' + JSON.stringify(v(k)) + ' — the parent and the child would read two different answers'); });
  /* AND THE EMAIL PRINTS EACH ONE'S MARK, beside its number. */
  asked++;
  const mail = plan.emails.find(m => m.to === 'yes@example.org');
  const text = mail ? String(mail.text) : '';
  if (!mail) bad.push('Eve’s parent is planned no email for a week with four questions in it');
  else ['Q1 ✓', 'Q2 ✓', 'Q3 ✗', 'Q4 ✓'].forEach(m => { if (text.indexOf(m) === -1) bad.push('Eve’s email does not print “' + m + '”: ' + JSON.stringify(text.split('Maths · Ties')[1] || text).slice(0, 160)); });
}

/* ---------- 2a. WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, NOT THE WEEK IT ARRIVED (review of 10 Oct) § */
{
  const { b } = seeded();
  const C = (key, label, pressed, verdict) => S('P-S5', key, '2026-10-01', label, verdict || 'right', '', 12,
    { event_id: '1791504000000-m' + (key.replace(/[^a-z]/gi, '').toLowerCase() + 'abcdefghijklmn').slice(0, 14), pressed_at: "'" + pressed });
  b.seed('submissions', [
    C('q:EVE-CARRIED', 'Maths · Carried · Q1', '2026-09-22T16:00:00.000Z'),
    C('q:EVE-BOTH', 'Maths · Carried · Q2', '2026-09-23T16:00:00.000Z', 'right'),
    S('P-S5', 'q:EVE-BOTH', '2026-10-01', 'Maths · Carried · Q2', 'wrong', '', 13),
    S('P-S5', 'q:EVE-NEW', '2026-10-01', 'Maths · Carried · Q3', 'right', '', 14),
  ]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const eve = plan.learners.find(x => x.id === 'P-S5');
  const keys = list => (list || []).map(q => q.key).sort().join(', ');
  if (!eve) bad.push('Eve pressed two questions this week and is not in the plan');
  else {
    if (keys(eve.fresh) !== 'q:EVE-NEW') bad.push('Eve’s new questions this week are ' + JSON.stringify(keys(eve.fresh)) + ' — wanted q:EVE-NEW alone: work carried over from before the switch is not this week’s');
    if (keys(eve.again) !== 'q:EVE-BOTH') bad.push('Eve’s questions gone back to are ' + JSON.stringify(keys(eve.again)) + ' — wanted q:EVE-BOTH, carried over and pressed again this week');
    const both = (eve.again || []).find(q => q.key === 'q:EVE-BOTH');
    if (both && both.verdict !== 'wrong') bad.push('q:EVE-BOTH’s mark is ' + JSON.stringify(both.verdict) + ' — wanted this week’s press (✗), not the carried one');
    if (eve.count !== 2) bad.push('Eve’s week counts ' + eve.count + ' questions — wanted 2');
  }
  asked++;
  const mail = plan.emails.find(m => m.to === 'yes@example.org');
  if (!mail) bad.push('Eve’s parent is planned no email for a week with two questions in it');
  else if (/Carried · Q1|Q1 ✓/.test(String(mail.text)) || !/2 questions/.test(String(mail.subject) + String(mail.text))) bad.push('Eve’s email lists the carried-over question as this week’s, or does not count two: ' + JSON.stringify(String(mail.subject)) + ' / ' + JSON.stringify(String(mail.text).slice(0, 240)));
}

/* ---------- 2b. THE QUESTION'S WORDS: CARRIED, REFUSED WHEN THEY ARE A MESSAGE, AND PRINTED § */
{
  const { b } = seeded();
  const W1 = 'A bag holds 3 red and 5 blue counters.\n---\nWork out the probability of red.';
  /* A LINK PAST THE FIRST 120 CHARACTERS — where `digestSafe_` stops looking. */
  const LATE = 'The diagram shows a right-angled triangle with sides of 6 cm and 8 cm, drawn accurately on squared paper below.\n---\nFor the answer, pay at www.pay-family.example';
  const A = (q, label, words, hh) => S('P-S2', q, '2026-10-01', label, 'right', words, hh);
  b.seed('submissions', [
    A('q:BEN-W1', 'Maths · Probability · Q4a', W1),
    /* ONE PRACTICAL'S THREE BOXES: the first with no words, the next two with different ones — the
       `#dv` sent LAST in the day, the `#cv` before it. */
    A('pr:PR-CH02#iv', 'Chemistry · Required practical · Rates of reaction · Worksheet', '', 9),
    A('pr:PR-CH02#dv', '', 'What is the dependent variable?', 15),
    A('pr:PR-CH02#cv', '', 'Name two control variables.', 11),
    /* WORDS THAT ARE A MESSAGE: a link, an address, a bare domain, and a link the label rule cannot see. */
    A('q:BEN-W2', 'Maths · Equations · Q2', 'Solve 2x = 6\n---\nthen go to https://pay-family.example/now'),
    A('q:BEN-W3', 'Maths · Equations · Q3', 'Questions? Write to office.family@example.org'),
    A('q:BEN-W4', 'Maths · Equations · Q4', 'Answers at family-answers.com'),
    /* AN `@` WITH NO DOMAIN AFTER IT — the business's own handle, which reads as the business speaking. */
    A('q:BEN-W6', 'Maths · Equations · Q6', 'NOTICE FROM @family. fees are overdue'),
    A('q:BEN-W5', 'Maths · Pythagoras · Q5', LATE),
    /* A QUESTION NOT PRINTED AT ALL — no name, a key that is a sentence — carries no words to print. */
    A('Tutor says hello', '', 'Work out 7 × 8.'),
  ]);
  const planOf = () => JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  asked++;
  const plan = planOf();
  const ben = plan.learners.find(x => x.id === 'P-S2') || {};
  const items = [].concat(ben.fresh || [], ben.again || []);
  const it = k => items.find(q => q.key === k) || null;
  if (!it('q:BEN-W1') || it('q:BEN-W1').words !== W1) bad.push('the plan carries q:BEN-W1’s words as ' + JSON.stringify(it('q:BEN-W1') && it('q:BEN-W1').words) + ' — wanted them as the sheet holds them, stem, `---` and ask');
  asked++;
  const pr = it('pr:PR-CH02');
  if (!pr || pr.words !== 'What is the dependent variable?') bad.push('a practical’s three boxes carry the words ' + JSON.stringify(pr && pr.words) + ' — wanted the words of the latest press that has any ("What is the dependent variable?", sent at 15:00), not none and not an earlier one');
  asked++;
  [['a link', 'q:BEN-W2', 'Maths · Equations · Q2'], ['an email address', 'q:BEN-W3', 'Maths · Equations · Q3'],
   ['a bare domain', 'q:BEN-W4', 'Maths · Equations · Q4'], ['an @ and no domain', 'q:BEN-W6', 'Maths · Equations · Q6'],
   ['a link past the first 120 characters', 'q:BEN-W5', 'Maths · Pythagoras · Q5']].forEach(([what, k, label]) => {
    const q = it(k);
    if (!q) { bad.push(k + ', whose words hold ' + what + ', is not in the plan at all — a refusal costs the words, never the question'); return; }
    if (q.words) bad.push('words holding ' + what + ' are carried for ' + k + ': ' + JSON.stringify(q.words) + ' — phone text that is a message must not go out under the business’s name');
    if (q.label !== label || q.hidden) bad.push(k + ', whose words hold ' + what + ', is listed as ' + JSON.stringify(q.label) + (q.hidden ? ' (hidden)' : '') + ' — wanted its name, "' + label + '", printed');
  });
  asked++;
  const hid = items.find(q => q.hidden);
  if (!hid) bad.push('the question with no printable name is not in the plan as hidden, so "an item not printed carries no words" was NOT checked');
  else if (hid.words) bad.push('a question not printed carries words: ' + JSON.stringify(hid.words) + ' — only a question listed by its name may have them');
  if (ben.count !== 1 + 1 + 1 + 5 + 1) bad.push('Ben’s count is ' + ben.count + ', wanted 9: his own, the new one, the practical once, the five with refused words and the one not printed — words change nothing counted');

  /* SUNDAY'S EMAIL PRINTS THEM: each question under its paper as "Q4a: <its ask>", the stem above it, in
     the text and in the HTML; a practical's worksheet box by its words. */
  asked++;
  const bo = plan.emails.find(m => m.to === 'bo@example.org');
  if (!bo) bad.push('Bo is not sent Ben’s week, so the words in Sunday’s email were NOT asked');
  else {
    if (bo.text.indexOf('\nMaths · Probability\nA bag holds 3 red and 5 blue counters.\nQ4a ✓: Work out the probability of red.\n') === -1
        || said(bo.html).indexOf('Maths Probability Q4a A bag holds 3 red and 5 blue counters. Work out the probability of red. ✓ Right THEIR ANSWER an answer') === -1)
      bad.push('Sunday’s email does not print a question’s words under its paper — the stem, then "Q4a ✓: <its ask>": ' + bo.text.split('\n').slice(4, 20).join(' / ') + ' — HTML: ' + said(bo.html).slice(0, 900));
    if (bo.text.indexOf('\nChemistry · Required practical · Rates of reaction\nWorksheet ✓: What is the dependent variable?\n') === -1)
      bad.push('a practical’s worksheet is not printed with the first box’s words: ' + bo.text.split('\n').slice(4, 20).join(' / '));
    /* REFUSED WORDS ARE NOT PRINTED, AND THE QUESTION STILL IS — by its number under its paper. */
    asked++;
    if (bo.text.indexOf('\nMaths · Equations\nQ2 ✓, Q3 ✓, Q4 ✓, Q6 ✓\n') === -1 || bo.text.indexOf('\nMaths · Pythagoras\nQ5 ✓\n') === -1
        || said(bo.html).indexOf('Maths Equations Q2 ✓ Right THEIR ANSWER an answer Maths Equations Q3 ✓ Right THEIR') === -1)
      bad.push('questions whose words were refused are not still listed by their numbers under their papers: ' + bo.text.split('\n').slice(4, 20).join(' / '));
    ['pay-family', 'office.family', 'family-answers', 'NOTICE', 'www.', 'For the answer', 'diagram shows'].forEach(x => {
      if (bo.text.indexOf(x) !== -1 || bo.html.indexOf(x) !== -1) bad.push('Sunday’s email prints refused words ("' + x + '") — phone text that is a message must not go out under the business’s name');
    });
    /* A QUESTION WITH NO NAME: neither its key nor its words, and counted in the "more". */
    asked++;
    if (/Work out 7|Tutor says/.test(bo.text + bo.html) || !/Ben worked on this week: 9 questions/.test(bo.text) || bo.text.indexOf('\n…and 1 more.\n') === -1)
      bad.push('a question with no name printed its key or its words, or was not counted in "…and 1 more.": ' + bo.text.split('\n').slice(2, 20).join(' / '));
  }

  /* AND WORDS CHANGE NOTHING BUT THE WORDS — the question this file asked as "byte-identical" while the email listed names. § */
  asked++;
  const g = b.tabs.submissions, wi = g[0].indexOf('words');
  g.slice(1).forEach(r => { r[wi] = ''; });
  const bare = planOf();
  const bo0 = bare.emails.find(m => m.to === 'bo@example.org');
  if (!bo || !bo0) bad.push('Bo is not sent Ben’s week, so Sunday’s email was NOT compared with and without words');
  else {
    if (bo.subject !== bo0.subject || bo.text.split('\n')[2] !== bo0.text.split('\n')[2]) bad.push('the words on the sheet change the subject or the lead: "' + bo.subject + '" / "' + bo0.subject + '"');
    const heads = t => t.split('\n').filter(x => / · /.test(x) || /^Ben’s own/.test(x)).join(' | ');
    if (heads(bo.text) !== heads(bo0.text)) bad.push('the words on the sheet change which papers are listed: ' + heads(bo.text) + ' — without words: ' + heads(bo0.text));
    if (bo0.text.indexOf('\nMaths · Probability\nQ4a ✓\n') === -1 || bo0.text.indexOf('\nChemistry · Required practical · Rates of reaction\nWorksheet ✓\n') === -1
        || /probability of red|dependent variable|---/.test(bo0.text + bo0.html))
      bad.push('with no words on the sheet the email does not list each question by its number alone: ' + bo0.text.split('\n').slice(4, 18).join(' / '));
  }
  if (!(bare.learners.find(x => x.id === 'P-S2') || { fresh: [] }).fresh.every(q => q.words === '')) bad.push('with the words column blank, an item still carries words');
}

/* ---------- 2c. WHAT A QUESTION NEVER SAYS, RULE BY RULE — AND THE WHOLE LIBRARY THROUGH IT § */
{
  const { b } = seeded();
  const safe = s => b.ev('digestWordsSafe_(' + JSON.stringify(s) + ')');
  asked++;
  if (!safe('A bag holds 3 red beads and 5 blue beads.\n---\nFind P(red), e.g. as a fraction.')) bad.push('a plain question’s words are refused, so every refusal below proves nothing');
  [['a domain with one letter before its dot', 'The answers are at x.com'], ['a short link', 'Watch t.co/4bXq before you start'],
   ['a full-width dot', 'The answers are at evil．com'], ['an ideographic full stop', 'The answers are at evil。com'],
   ['a UK mobile', 'Text 07700 900123 for the answers'], ['a UK mobile written +44', 'Text +44 7700 900123 for the answers'],
   ['a London landline, as it is written', 'Ring 020 7946 0018 to pay'], ['a landline written +44', 'Ring +44 20 7946 0018 to pay'],
   ['a landline outside London', 'Ring 0161 496 0000 to pay'], ['an account number', 'Pay into account 31926819'],
   ['a run of more than eight digits', 'Quote reference 1234567890'], ['a sort code', 'Sort code 20-00-00']].forEach(([what, s]) => {
    asked++;
    if (safe(s)) bad.push('words holding ' + what + ' — ' + JSON.stringify(s) + ' — pass digestWordsSafe_, and would go to parents under the business’s name');
  });

  /* THE KEY'S SHAPE: the same safe name and plain words under a key from the library and under a key
     somebody typed. Both are listed by name; only the first carries its words. */
  const A = (q, label, words) => S('P-S2', q, '2026-10-01', label, 'right', words);
  b.seed('submissions', [A('q:BEN-K1', 'Maths · Tables · Q1', 'Work out 7 × 8.'), A('Homework from Sam', 'Maths · Tables · Q2', 'Work out 6 × 9.')]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const items = [].concat(...plan.learners.filter(x => x.id === 'P-S2').map(x => (x.fresh || []).concat(x.again || [])));
  const lib = items.find(q => q.key === 'q:BEN-K1'), typed = items.find(q => q.key === 'Homework from Sam');
  if (!lib || lib.words !== 'Work out 7 × 8.') bad.push('a question under a library key does not carry its words: ' + JSON.stringify(lib) + ' — so the key-shape ask below proves nothing');
  if (!typed) bad.push('the question under an invented key is not in the plan at all — refusing the words must not cost the question');
  else {
    if (typed.words) bad.push('a question under an invented key ("Homework from Sam") carries words: ' + JSON.stringify(typed.words) + ' — only a key in DIGEST_KEY_SHAPE may');
    if (typed.label !== 'Maths · Tables · Q2' || typed.hidden) bad.push('the question under an invented key is listed as ' + JSON.stringify(typed.label) + ' — wanted its safe name, printed');
  }
}
{
  /* EVERY QUESTION AND STEM IN THE LIBRARY, AS THE PHONE SENDS IT — and not one refused. § */
  asked++;
  let plain = null;
  try {
    const { JSDOM } = require('jsdom');
    const src = fs.readFileSync(path.join(REPO, 'js', 'find.js'), 'utf8');
    const i = src.indexOf('const DONE_WORDS_STEM'), f = src.indexOf('function doneWordsPlain_(', i), j = src.indexOf('\n}\n', f);
    if (i !== -1 && f !== -1 && j !== -1) {
      /* ONE ELEMENT, REUSED: the same parse and the same `textContent` as a document per text, measured
         identical over the whole library, in half the time. */
      const div = new JSDOM('').window.document.createElement('div');
      const Parser = function () { return { parseFromString: s => { div.innerHTML = s; return { body: { textContent: div.textContent } }; } }; };
      plain = new Function('DOMParser', src.slice(i, j + 2) + '\nreturn doneWordsPlain_;')(Parser);
    }
  } catch (e) { plain = null; }
  let qs = [];
  try { qs = require('../check/lib-full.js').rows('questions'); } catch (e) { qs = []; }
  const texts = [];
  if (plain) qs.filter(q => q && (q.kind === 'question' || q.kind === 'preamble')).forEach(q => ['html', 'lead'].forEach(f => {
    if (q[f]) texts.push({ id: q.row_id + ' ' + f, text: plain(q[f]) });
  }));
  if (!plain || texts.length < 5000) bad.push('the library’s words could not be made (' + (plain ? texts.length + ' texts' : 'doneWordsPlain_ not found in js/find.js, or no jsdom') + '), so DIGEST_WORDS_REFUSE was NOT measured against it — not a pass');
  else {
    /* HANDED IN AS A GLOBAL, not pasted into the source: nine thousand texts in one `ev` string is a
       megabyte of JavaScript to parse for nothing. */
    const { b, G } = world();
    G.__libTexts = texts.map(t => t.text);
    const which = JSON.parse(JSON.stringify(b.ev('__libTexts.map(t => { const w = attemptWords_(t); const i = DIGEST_WORDS_REFUSE.findIndex(re => re.test(w));'
      + ' return i === -1 ? null : [i, (w.match(DIGEST_WORDS_REFUSE[i]) || [""])[0]]; })')));
    const hit = [];
    which.forEach((x, n) => { if (x) hit.push(texts[n].id + ' (rule ' + x[0] + ': ' + JSON.stringify(x[1]) + ')'); });
    if (hit.length) bad.push(hit.length + ' of the library’s ' + texts.length + ' question and stem texts are refused by DIGEST_WORDS_REFUSE — each would reach parents as a number with no words: ' + hit.slice(0, 5).join('; '));
  }
}

/* ---------- 2d. THE WEEK'S LIST: ONE STEM, ONE LIST, ESCAPED, AT MOST 80, AND UNDER GMAIL'S CLIP § */
{
  const { b, G } = seeded();
  const STEM = 'A bag holds 3 red beads and 5 blue beads.';
  /* EVERY KIND OF MARK: right, wrong, sent (nothing could mark it), and the AI's 2 of 3. */
  const A = (q, label, words, verdict, day) => S('P-S2', q, day || '2026-10-01', label, verdict, words);
  b.seed('submissions', [
    A('q:BEN-P7-3', 'Maths · Paper 7 · Q3', 'Solve x > 3 and x < 7 & "y" for whole numbers x.', 'right'),
    A('q:BEN-P7-5a', 'Maths · Paper 7 · Q5a', STEM + '\n---\nFind P(red).', 'wrong'),
    A('q:BEN-P7-5b', 'Maths · Paper 7 · Q5b', STEM + '\n---\nFind P(blue).', 'sent'),
    A('q:BEN-P7-5c', 'Maths · Paper 7 · Q5c', STEM + '\n---\nTwo beads are taken.\nFind P(both red).', 'ai:2/3'),
    /* SENT A FORTNIGHT BEFORE, AND AGAIN THIS WEEK. */
    A('q:BEN-P7-9', 'Maths · Paper 7 · Q9', 'Expand (x + 2)(x - 3).', 'wrong', '2026-09-14'),
    A('q:BEN-P7-9', 'Maths · Paper 7 · Q9', 'Expand (x + 2)(x - 3).', 'right'),
  ]);
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const m = plan.emails.find(e => e.to === 'bo@example.org') || { text: '', html: '', subject: '' };
  asked++;
  const TA = '\nTheir answer: an answer';
  if (m.text.indexOf('\nMaths · Paper 7\nQ3 ✓: Solve x > 3 and x < 7 & "y" for whole numbers x.' + TA + '\n' + STEM + '\nQ5a ✗: Find P(red).' + TA
      + '\nQ5b not marked: Find P(blue).' + TA + '\nQ5c 2 of 3 marks: Two beads are taken. Find P(both red).' + TA + '\n') === -1)
    bad.push('Paper 7 is not its heading, then "Q3 ✓: <its words>", then the stem its parts share and each part’s own ask, each with its mark — ✓, ✗, not marked, the AI’s 2 of 3 marks: ' + m.text.split('\n').slice(4, 14).join(' / '));
  /* "not marked", NEVER `sent` — the server's word for an answer nothing marked (12 Oct). */
  asked++;
  if (/\bsent\b/i.test(m.subject + m.text + m.html)) bad.push('the email says "sent" — the server’s word; a parent reads "not marked": ' + JSON.stringify(m.text.split('\n').find(x => /\bsent\b/i.test(x))));
  if (m.text.indexOf('Beside each one is how it went: ✓ right, ✗ not right, or the marks an AI marker gave a written answer.') === -1)
    bad.push('the lead does not say what the marks mean — ✓, ✗ and the AI’s marks, once: ' + JSON.stringify(m.text.split('\n')[2]));
  asked++;
  const times = t => t.split(STEM).length - 1;
  if (times(m.text) !== 1 || times(m.html) !== 1
      || said(m.html).indexOf('Q5a ' + STEM + ' Find P(red). ✗ Not right THEIR ANSWER an answer Maths Paper 7 Q5b Find P(blue). Not marked yet THEIR ANSWER an answer'
        + ' Maths Paper 7 Q5c Two beads are taken. Find P(both red). 2 of 3 marks THEIR ANSWER an answer') === -1)
    bad.push('the stem Q5a, Q5b and Q5c share is printed ' + times(m.text) + ' time(s) in the text and ' + times(m.html) + ' in the HTML — wanted once each, above the first of them');
  asked++;
  /* A QUESTION FIRST SENT BEFORE THE WEEK IS STILL A QUESTION DONE THIS WEEK, in the one list, with this
     week's mark — and no "(again)", the site's word and not a parent's (12 Oct). */
  if (m.text.indexOf('\nQ9 ✓: Expand (x + 2)(x - 3).\n') === -1 || said(m.html).indexOf('Q9 Expand (x + 2)(x - 3). ✓ Right THEIR ANSWER') === -1 || /\(again\)/.test(m.text + m.html))
    bad.push('a question first sent before the week is not "Q9 ✓: <its words>" in the one list, with this week’s mark and not the fortnight-old ✗: ' + JSON.stringify(m.text.split('\n').find(x => /^Q9/.test(x))));
  asked++;
  if (m.html.indexOf('>Solve x &gt; 3 and x &lt; 7 &amp; &quot;y&quot; for whole numbers x.<') === -1 || /x < 7 &|"y"/.test(m.html))
    bad.push('the HTML does not escape a question’s words — "<", ">", "&" and quotes came off a phone: ' + JSON.stringify((m.html.match(/Solve x[^<]*/) || [''])[0]));
  /* THE SUMMARY ABOVE THE QUESTIONS (380): every way a question can go — right or not, never how many goes (20 Oct) — in a sentence and in figures; a paper with no tags is its subject. */
  asked++;
  const SUM = '3 right, 1 with part marks, 1 not right and 1 not marked yet.';
  if (m.text.split('\n')[3] !== SUM || m.text.split('\n')[4] !== 'Topics: Maths.'
      || said(m.html).indexOf('Summary of the week ' + SUM + ' Topics: Maths 6 questions 3 right 1 with part marks 1 not right 1 not marked yet Days Thu') === -1
      || said(m.html).indexOf(SUM) > said(m.html).indexOf('Maths Paper 7 Q3'))
    bad.push('the summary is not above the questions — "' + SUM + '" and its figures, then the days: ' + JSON.stringify(m.text.split('\n')[3]) + ' / ' + said(m.html).slice(0, 400));
}
{
  /* THE CAP, THROUGH THE REAL RUN'S PLAN: § */
  const { b } = seeded();
  const MAX = b.ev('DIGEST_WEEK_LIST_MAX');
  asked++;
  if (MAX !== 80) bad.push('DIGEST_WEEK_LIST_MAX is ' + MAX + ' — wanted 80: a week’s work, measured under Gmail’s clip (constants.gs)');
  const rows = [];
  for (let i = 1; i <= 85; i++) rows.push(S('P-S5', 'q:EVE-C' + i, '2026-10-02', 'Maths · Paper 8 · Q' + i, 'right', 'Work out ' + i + ' + ' + i + '.'));
  rows.push(S('P-S5', 'q:EVE-NONAME-1', '2026-10-02', '', 'right', 'Work out 99 × 7.'));
  rows.push(S('P-S5', 'Somebody typed this', '2026-10-02', '', 'right', ''));
  b.seed('submissions', rows);
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const m = plan.emails.find(e => e.to === 'yes@example.org') || { text: '', html: '', subject: '' };
  const listed = m.text.split('\n').filter(x => /^Q\d+ ✓: Work out/.test(x));
  asked++;
  if (listed.length !== 80 || listed[0] !== 'Q1 ✓: Work out 1 + 1.' || listed[79] !== 'Q80 ✓: Work out 80 + 80.' || /\nQ8[1-5] /.test(m.text))
    bad.push('87 questions listed ' + listed.length + ' (' + JSON.stringify([listed[0], listed[listed.length - 1]]) + ') — wanted 80, Q1 to Q80 in number order, and none past');
  asked++;
  if (m.subject !== 'Eve’s week: 87 questions' || !/Eve worked on this week: 87 questions/.test(m.text) || m.text.indexOf('\n…and 7 more.\n') === -1
      || !/<p[^>]*>…and 7 more\.<\/p>/.test(m.html) || /q:EVE|Somebody typed|99 × 7/.test(m.text + m.html))
    bad.push('the cap does not count what it left out — wanted "Eve’s week: 87 questions" and "…and 7 more." (Q81–Q85 and the two with no name, neither printed by key nor by words): subject "' + m.subject + '", ' + JSON.stringify(m.text.split('\n').filter(x => /…and/.test(x))));
}
{
  /* AND 80 OF THE LONGEST A QUESTION CAN BE STILL COME IN UNDER GMAIL'S CLIP: § */
  const { b, G } = world();
  const MAX = b.ev('DIGEST_WEEK_LIST_MAX'), SHOWN = b.ev('DIGEST_WORDS_SHOWN'), STEM_SHOWN = b.ev('DIGEST_STEM_SHOWN');
  const long = (lead, n) => { let t = lead, i = 0; while (t.length < n) t += (++i % 9 ? ' word' + i : ' x < ' + i + ' & y'); return t; };
  const head = i => ('Maths · Paper ' + i + ' (Calculator) — November 2023 (Higher) · Statistics and probability · Set ' + i).slice(0, 110);
  const items = [];
  /* AND THE LONGEST MARK A VERDICT CAN BE, the AI's three digits a side. */
  for (let i = 0; i < MAX + 5; i++) items.push({ key: 'q:L-' + i, label: head(i) + ' · Q' + i + 'a', hidden: false, last: '2026-10-01', verdict: 'ai:999/999',
    words: long('Stem ' + i + ': a scene', STEM_SHOWN + 200) + '\n---\n' + long('Ask ' + i + ': explain', SHOWN + 200) });
  G.__L = { id: 'P-S1', first: 'Ada', fresh: items, again: [] };
  const r = JSON.parse(JSON.stringify(b.ev('digestRender_(__L, { first: "Pat" }, { start: "2026-09-28", end: "2026-10-04" }, { brand: "@family.", site: "https://halexdias31-pixel.github.io/family/", hour: 18 })')));
  const kb = Buffer.byteLength(r.html, 'utf8') / 1024;
  asked++;
  if (!(kb < 102) || kb < 40 || !/<p[^>]*>…and 5 more\.<\/p>/.test(r.html) || !/Just reply and say so/.test(r.html))
    bad.push('80 of the longest questions make ' + kb.toFixed(1) + ' KB of HTML — wanted under Gmail’s ~102 KB clip (and over 40, the words printed at length), "…and 5 more." and the footer after them');
}

/* ---------- 3. THE LABEL submitAnswer KEEPS § */
{
  const { b } = world();
  b.seed('people', [{ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org',
                       role: 'student', pin: '0000', verified: 'TRUE' }]);
  const tok = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' }).token;
  if (!tok) bad.push('could not sign Ada in, so the label was NOT checked');
  let n = 0;
  const send = (key, label) => { asked++; n++;
    return b.post({ action: 'submitAnswer', token: tok, items: [Object.assign({ id: (1758000000000 + n) + '-lb' + String(n).padStart(4, '0'), key: key, answer: '1', verdict: 'right' }, label === undefined ? {} : { label: label })] }); };
  const row = q => rowsOf(b, 'submissions').find(r => r.key === q) || {};
  send('q:L1', '<b>Maths</b>  ·  Paper 1\n· Q3<script>x</script>');
  if (row('q:L1').label !== 'Maths · Paper 1 · Q3 x') bad.push('a label with tags in it was kept as "' + row('q:L1').label + '" — wanted the tags out and the spaces folded');
  send('q:L2', 'x'.repeat(400));
  if (String(row('q:L2').label).length !== 120) bad.push('a 400-character label was kept at ' + String(row('q:L2').label).length + ' — wanted the cap of 120');
  send('q:L3');
  if (row('q:L3').label !== '') bad.push('a press sent with no label has "' + row('q:L3').label + '"');
}

{
  /* A TAB MADE BY HAND WITHOUT THE `label` AND `words` COLUMNS. § */
  const { b } = world();
  b.tabs.submissions[0] = b.tabs.submissions[0].filter(c => c !== 'label' && c !== 'words');
  b.seed('people', [{ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org',
                       role: 'student', pin: '0000', verified: 'TRUE' }]);
  const tok = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' }).token;
  [[{ id: '1758100000001-nl0001', key: 'q:N1', answer: '1', verdict: 'right', label: 'Maths · Q1', words: 'Work out 3 × 5.' }],
   [{ id: '1758100000002-nl0002', key: 'q:N2', answer: '2', verdict: 'wrong' }]].forEach(items => {
    asked++;
    const d = b.post({ action: 'submitAnswer', token: tok, items: items });
    if (!d.success || d.error || !d.saved || !d.saved[items[0].id]) bad.push('with no label column, submitAnswer ' + JSON.stringify(items).slice(0, 80) + ' answered ' + JSON.stringify(d).slice(0, 200) + ' — the press was written and must be reported saved');
  });
  if (rowsOf(b, 'submissions').length !== 2) bad.push('with no label column, ' + rowsOf(b, 'submissions').length + ' presses were written, wanted 2');
}

/* ---------- 3b. WHO MAY NOT BE TOLD, AND WHAT MAY NOT BE PRINTED ------------------------------------------ */
{
  const { b } = seeded();
  /* AN ADDRESS NOBODY CONFIRMED. Quin signed up with a typo (verified=PENDING) and an admin linked him
     to Ada, which writes `accepted` at once: a stranger's inbox, every Sunday. */
  b.seed('people', [{ person_id: 'P-C8', first_name: 'Quin', last_name: 'Typo', handle: 'quintypo', email: 'quin.tpyo@example.org',
                      role: 'client', pin: '0000', verified: 'PENDING' }]);
  b.seed('family', [{ link_id: 'L9', parent_id: 'P-C8', child_id: 'P-S1', child_typed: '', state: 'accepted' }]);
  /* ONE PRACTICAL'S WORKSHEET, THREE BOXES (`guideBox_`): one question, by its name. */
  const A = (pid, q, label) => S(pid, q, '2026-10-01', label || '');
  b.seed('submissions', [
    /* THE CARD'S DURATION IN ONE OF THEM, as the phone sent a practical's name before `doneLabel_`:
       "60 min" reads to a parent as how long their child spent, so it never reaches an email. */
    A('P-S2', 'pr:PR-PH01#iv', 'Physics · AQA required practical · 60 min · Specific heat capacity · Worksheet'),
    A('P-S2', 'pr:PR-PH01#dv', 'Physics · AQA required practical · Specific heat capacity · Worksheet'),
    A('P-S2', 'pr:PR-PH01#cv'),
    /* TEXT OFF A PHONE THAT WOULD READ AS THE BUSINESS SPEAKING: a label with a link, a key that is a
       sentence with an address in it, and a label that is an email address. */
    A('P-S2', 'q:BEN-2', 'NOTICE FROM @family.: fees overdue, pay today at https://pay-family.example/now'),
    A('P-S2', 'Tutor says: no homework needed until half term, see www.example.net'),
    A('P-S2', 'q:BEN-3', 'write to office.family@example.org'),
  ]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  if (plan.emails.some(m => m.to === 'quin.tpyo@example.org')) bad.push('a parent whose address was never confirmed (verified=PENDING) is emailed — a typo’d address is a stranger’s inbox');
  const ada = plan.learners.find(x => x.id === 'P-S1') || {};
  if (!(ada.skipped || []).some(p => p.id === 'P-C8' && /not confirmed/.test(p.why))) bad.push('the unconfirmed parent is not listed as skipped with the reason: ' + JSON.stringify(ada.skipped));
  if (!(ada.to || []).some(p => p.id === 'P-C1')) bad.push('Pat, confirmed, is no longer told about Ada');
  asked++;
  const ben = plan.learners.find(x => x.id === 'P-S2') || {};
  const prs = (ben.fresh || []).filter(q => /^pr:/.test(q.key));
  if (prs.length !== 1 || prs[0].key !== 'pr:PR-PH01' || !/Specific heat capacity · Worksheet/.test(prs[0].label)) bad.push('a practical’s three worksheet boxes are ' + JSON.stringify(prs) + ' — wanted one question, pr:PR-PH01, by its name');
  if (ben.count !== 5) bad.push('Ben’s count is ' + ben.count + ', wanted 5: his own, the practical once, and the three whose text came off his phone');
  asked++;
  if (prs.length && /\d+ min/.test(prs[0].label)) bad.push('a practical’s name keeps the card’s duration, "' + prs[0].label + '" — a parent reads it as time spent');
  asked++;
  const bo = plan.emails.find(m => m.to === 'bo@example.org');
  if (!bo) bad.push('Bo is not sent Ben’s week');
  else {
    ['https://pay', 'NOTICE', 'Tutor says', 'www.example.net', 'office.family@', '#iv', '#dv', '#cv'].forEach(x => {
      if (bo.text.indexOf(x) !== -1 || bo.html.indexOf(x) !== -1) bad.push('Bo’s email prints "' + x + '" — phone text that is a link, an address or a sentence must not go out under the business’s name');
    });
    /* A LABEL TURNED AWAY IS NOT REPLACED BY THE KEY. § */
    if (!/Ben worked on this week: 5 questions/.test(bo.text) || !/\n…and 3 more\.\n/.test(bo.text) || /q:BEN|pr:PR/.test(bo.subject + bo.text + bo.html)
        || bo.text.indexOf('\nPhysics · AQA required practical · Specific heat capacity\nWorksheet ✓\n') === -1)
      bad.push('Bo’s email does not count what it does not print ("Ben worked on this week: 5 questions", the practical by its name, "…and 3 more.", no raw key): ' + bo.text.split('\n').slice(2, 12).join(' / '));
  }
  /* AND THE CHILD'S OWN FIRST NAME, which goes in the subject and is a cell the child edits. */
  asked++;
  const g = b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-S2')[h.indexOf('first_name')] = 'Pay now at www.pay.example';
  b.ev('clearCache()');
  const plan2 = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  const bo2 = plan2.emails.find(m => m.to === 'bo@example.org') || {};
  if (/pay\.example|Pay now/.test(String(bo2.subject) + bo2.text + bo2.html)) bad.push('a first name that is a link went out in the email: "' + bo2.subject + '"');
  if (bo2.subject && !/^Your child’s week/.test(bo2.subject)) bad.push('a first name not fit to print did not fall back to "Your child": "' + bo2.subject + '"');
}

/* ---------- 4. OFF, PREVIEW, SEND, AND SEND AGAIN ----------------------------------------------------------- */
{
  const { b, mail } = seeded();
  /* OFF — and it is the default: no config row at all. */
  asked++;
  const w0 = b.log.writes;
  const off = run(b, SUN);
  if (off.mode !== 'off') bad.push('with no weekly_digest row the mode is "' + off.mode + '", wanted off');
  if (mail.sent.length || rowsOf(b, 'digest_log').length || b.log.writes !== w0) bad.push('off sent ' + mail.sent.length + ' email(s), wrote ' + rowsOf(b, 'digest_log').length + ' log row(s) and ' + (b.log.writes - w0) + ' cell(s) — off must do nothing at all');
  ['yes', 'on', 'SEND IT', 'true'].forEach(v => {
    cfgSet(b, 'weekly_digest', v);
    const r = run(b, SUN);
    if (r.mode !== 'off' || mail.sent.length) bad.push('weekly_digest "' + v + '" ran as ' + r.mode + ' — only the exact words preview and send may do anything');
  });

  /* PREVIEW: the log, and no mail. */
  cfgSet(b, 'weekly_digest', 'preview');
  asked++;
  const pv = run(b, SUN);
  const log = () => rowsOf(b, 'digest_log');
  const st = s => log().filter(r => r.status === s);
  if (mail.sent.length) bad.push('preview sent ' + mail.sent.length + ' email(s)');
  if (st('preview').length !== 2) bad.push('preview wrote ' + st('preview').length + ' preview row(s), wanted 2 (Pat about Ada, Bo about Ben): ' + JSON.stringify(log()));
  const patRow = log().find(r => r.parent_id === 'P-C1');
  if (!patRow || patRow.week_of !== '2026-09-28' || patRow.learner_id !== 'P-S1' || patRow.to !== 'pat@example.org'
      || Number(patRow.questions) !== 3 || !/^Ada’s week/.test(patRow.subject)) bad.push('Pat’s preview row is ' + JSON.stringify(patRow) + ' — wanted week_of 2026-09-28, P-S1, pat@, 3 questions, the subject');
  if (!log().some(r => r.learner_id === 'P-S3' && r.status === 'not sent' && /no parent/.test(r.note))) bad.push('Cal’s week is not in the log as not sent, with why');
  if (!log().some(r => r.learner_id === 'P-S1' && r.parent_id === 'P-C2' && r.status === 'opted out')) bad.push('Pam’s opt-out is not in the log');
  const rows1 = log().length;
  run(b, SUN);
  if (log().length !== rows1) bad.push('a second preview the same week added rows (' + rows1 + ' → ' + log().length + ') — one row per parent per learner per week');
  if (pv.previewed !== 2) bad.push('preview reported ' + pv.previewed + ' previewed, wanted 2');

  /* SEND: one each, and the preview rows become the receipts. */
  cfgSet(b, 'weekly_digest', 'send');
  asked++;
  const s1 = run(b, SUN);
  const tos = mail.sent.map(m => m.to).sort().join(', ');
  if (tos !== 'bo@example.org, pat@example.org') bad.push('send emailed [' + tos + '], wanted bo@ and pat@ once each');
  if (s1.sent !== 2) bad.push('send reported ' + s1.sent + ' sent');
  if (st('sent').length !== 2 || log().length !== rows1) bad.push('after sending the log is ' + JSON.stringify(log().map(r => r.parent_id + ':' + r.status)) + ' — wanted the two preview rows turned to sent, nothing added');
  const m0 = mail.sent.find(m => m.to === 'pat@example.org');
  if (m0 && (!m0.htmlBody || !m0.body || m0.name)) bad.push('the email went without both bodies, or under a sender name (372: no branding): ' + JSON.stringify(Object.keys(m0)));
  /* AND AGAIN, the same Sunday and the Monday after: nothing. */
  asked++;
  const s2 = run(b, SUN);
  const s3 = run(b, '2026-10-05T08:00:00Z');
  if (mail.sent.length !== 2) bad.push('a second run the same week sent ' + (mail.sent.length - 2) + ' more email(s) — the log row is the receipt');
  if (s2.already !== 2 || s3.already !== 2) bad.push('the reruns did not report the two already sent: ' + JSON.stringify([s2, s3]));
  /* PREVIEW AFTER SEND does not turn a receipt back into a preview. */
  cfgSet(b, 'weekly_digest', 'preview');
  run(b, SUN);
  if (st('sent').length !== 2) bad.push('a preview after sending changed a sent row: ' + JSON.stringify(log().map(r => r.status)));
}

/* ---------- 5. THE QUOTA, AND A FAILURE --------------------------------------------------------------------- */
{
  /* ELEVEN LEFT, TEN KEPT BACK: one goes, one is held, and the next run (tomorrow, by hand) sends the held
     one and not the other again. */
  const { b, mail } = seeded({ quota: 11 });
  cfgSet(b, 'weekly_digest', 'send');
  asked++;
  const r1 = run(b, SUN);
  if (mail.sent.length !== 1 || r1.held !== 1) bad.push('with 11 left and 10 reserved the run sent ' + mail.sent.length + ' and held ' + r1.held + ', wanted 1 and 1');
  const first = mail.sent.map(m => m.to);
  mail.quota = 100;
  const r2 = run(b, '2026-10-05T09:00:00Z');
  const all = mail.sent.map(m => m.to).sort().join(', ');
  if (all !== 'bo@example.org, pat@example.org' || r2.sent !== 1) bad.push('the run after the quota came back sent [' + mail.sent.slice(1).map(m => m.to) + '] after [' + first + '] — wanted the held one, once');
  cfgSet(b, 'weekly_digest_reserve', '0');
  mail.quota = 0;
  const r3 = run(b, SUN);
  if (r3.sent || mail.sent.length !== 2) bad.push('with no quota left the run still tried to send');
}
{
  const { b, mail } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  mail.fail = true;
  asked++;
  const r1 = run(b, SUN);
  const failed = rowsOf(b, 'digest_log').filter(r => r.status === 'failed');
  if (r1.failed !== 2 || failed.length !== 2 || !failed.every(r => /Invalid email/.test(r.note))) bad.push('a send that threw is not logged failed with the reason: ' + JSON.stringify(rowsOf(b, 'digest_log').map(r => r.status + ' ' + r.note)));
  mail.fail = false;
  run(b, SUN);
  if (mail.sent.length !== 2) bad.push('a failed row is not sent by the next run: ' + mail.sent.length + ' sent');
  if (mail.unreceipted.length) bad.push('an email went with no `sending` row on the log for it at that moment: ' + mail.unreceipted.join(', ') + ' — the receipt must be written before the send, or a crash between them sends twice');
  if (mail.locked.length) bad.push('an email was sent while the run held the script lock (' + mail.locked.join(', ') + ') — a mailing under the lock refuses the site’s own writes for a minute on Sunday evening');
  /* AND A ROW LEFT `sending` — a run killed between the receipt and the send — is NOT sent again. */
  const { b: b2, mail: mail2 } = seeded();
  cfgSet(b2, 'weekly_digest', 'send');
  b2.seed('digest_log', [{ week_of: "'2026-09-28", learner_id: 'P-S1', parent_id: 'P-C1', to: 'pat@example.org', status: 'sending' }]);
  run(b2, SUN);
  if (mail2.sent.some(m => m.to === 'pat@example.org')) bad.push('a row left `sending` was sent again — at most once');
}
{
  /* THE `sent` WRITE FAILS AFTER THE EMAIL WENT — a sheet timeout on the one cell. § */
  const { b, mail } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  asked++;
  b.ev('(function () { const real = setCells; let once = true; setCells = function (t, row, v) {'
     + ' if (once && v && v.status === "sent") { once = false; throw new Error("Service Spreadsheets timed out"); }'
     + ' return real.apply(this, arguments); }; })()');
  const r1 = run(b, SUN);
  const r2 = run(b, '2026-10-05T08:00:00Z');
  const twice = mail.sent.map(m => m.to).filter((t, i, a) => a.indexOf(t) !== i);
  const log = rowsOf(b, 'digest_log').filter(r => r.parent_id).map(r => r.parent_id + ':' + r.status).sort().join(', ');
  if (twice.length || mail.sent.length !== 2) bad.push('a `sent` write that failed after the email went led to ' + mail.sent.length + ' emails (twice to ' + twice.join(', ') + '); log ' + log + ' — at most once');
  if (r1.failed) bad.push('a send that worked was counted failed because the next sheet write threw: ' + JSON.stringify(r1));
  if (!/sending/.test(log)) bad.push('the email whose `sent` write failed is not left `sending` on the log: ' + log);
}
{
  /* A RUN THAT DID NOT FINISH THROWS. § */
  const thrown = (b, s) => { try { b.ev('clearCache(); weeklyDigestRun({})'); return ''; } catch (e) { return String(e && e.message || e); } };
  const a = seeded(); cfgSet(a.b, 'weekly_digest', 'send'); a.lock.free = false; a.setClock(at(SUN));
  asked++;
  if (!/did not finish/.test(thrown(a.b))) bad.push('weeklyDigestRun with the lock held elsewhere did not throw — the trigger would read "Completed" and nobody be told');
  const h = seeded({ quota: 11 }); cfgSet(h.b, 'weekly_digest', 'send'); h.setClock(at(SUN));
  asked++;
  const why = thrown(h.b);
  if (!/held 1/.test(why)) bad.push('weeklyDigestRun that held an email for the quota did not throw saying so: "' + why + '"');
  const ok = seeded(); cfgSet(ok.b, 'weekly_digest', 'send'); ok.setClock(at(SUN));
  asked++;
  if (thrown(ok.b)) bad.push('weeklyDigestRun threw on a run that sent everything: ' + thrown(ok.b));
  const off = seeded(); off.setClock(at(SUN));
  if (thrown(off.b)) bad.push('weeklyDigestRun threw with the switch off — off is a finished run');
}
{
  /* THE LOCK HELD ELSEWHERE: nothing sent, nothing written. */
  const { b, mail, lock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  lock.free = false;
  asked++;
  const r = run(b, SUN);
  if (mail.sent.length || rowsOf(b, 'digest_log').length || !(r.error || r.busy)) bad.push('with the lock held by another run it sent ' + mail.sent.length + ' and wrote ' + rowsOf(b, 'digest_log').length + ' (' + JSON.stringify(r) + ') — wanted nothing, and the run counted busy');
}
{
  /* THE TRIGGER'S OWN ENTRY POINT, ON THE CLOCK: a Sunday run with no date handed in sends that week. */
  const { b, mail, setClock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  setClock(at(SUN));
  asked++;
  const r = JSON.parse(JSON.stringify(b.ev('clearCache(); weeklyDigestRun({ triggerUid: "t1" })')));
  if (!r.week || r.week.start !== '2026-09-28' || mail.sent.length !== 2) bad.push('weeklyDigestRun on the Sunday clock ran ' + JSON.stringify(r) + ' and sent ' + mail.sent.length);
}

/* ---------- 5b. NO `submissions` TAB IS NOT A QUIET WEEK § */
{
  const { b, mail, setClock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  delete b.tabs.submissions;
  b.ev('clearCache()');
  asked++;
  const w0 = b.log.writes;
  const r = run(b, SUN);
  if (!/submissions tab/.test(String(r.error)) || !/open the site once as an admin/i.test(String(r.error))) bad.push('with no submissions tab the Sunday run answered ' + JSON.stringify(r).slice(0, 200) + ' — wanted an error naming the submissions tab and what adds it (opening the site as an admin)');
  if (mail.sent.length || b.log.writes !== w0) bad.push('with no submissions tab the run sent ' + mail.sent.length + ' and wrote ' + (b.log.writes - w0) + ' cell(s) — it must do neither');
  setClock(at(SUN));
  let threw = '';
  try { b.ev('clearCache(); weeklyDigestRun({})'); } catch (e) { threw = String(e && e.message || e); }
  if (!/submissions tab/.test(threw)) bad.push('weeklyDigestRun with no submissions tab did not throw saying so: "' + threw + '"');
  asked++;
  const tok = b.post({ action: 'verifyLogin', email: 'a1@example.org', pin: '0000' }).token;
  const pv = b.post({ action: 'digestPreview', token: tok });
  if (pv.submissions !== false || !/submissions tab/.test(String(pv.warning))) bad.push('the Preview with no submissions tab answered submissions ' + pv.submissions + ', warning "' + pv.warning + '" — wanted false and the reason');
  /* AND WITH THE TAB, IT SAYS SO THE OTHER WAY. */
  const ok = seeded();
  const tok2 = ok.b.post({ action: 'verifyLogin', email: 'a1@example.org', pin: '0000' }).token;
  const pv2 = ok.b.post({ action: 'digestPreview', token: tok2 });
  if (pv2.submissions !== true || pv2.warning) bad.push('the Preview with a submissions tab answered submissions ' + pv2.submissions + ', warning "' + pv2.warning + '"');
  /* AND THE `attempts` TAB IT LEFT BEHIND IS NOT READ: a week of rows there and none in `submissions` is
     a week nobody sent anything, not a week of attempts. */
  asked++;
  const left = seeded();
  left.b.tabs.submissions.splice(1);
  left.b.tabs.attempts = [['person_id', 'question_key', 'first_done', 'last_done', 'times', 'label', 'words'],
    ['P-S1', 'q:OLD-1', new Date(2026, 9, 1), new Date(2026, 9, 1), 1, 'Maths · Old · Q1', 'From the old tab.']];
  const lp = JSON.parse(JSON.stringify(left.b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')), new Date(' + at(SUN) + '))')));
  if (lp.learners.length || /From the old tab|Old · Q1/.test(JSON.stringify(lp))) bad.push('the plan read the old attempts tab: ' + JSON.stringify(lp.learners).slice(0, 160));
}
/* ---------- 6. BOOKING THE SUNDAY ---------------------------------------------------------------------------- */
{
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  const mine = () => trig.filter(t => t.spec.fn === 'weeklyDigestRun');
  asked++;
  b.ev('installWeeklyDigest_()');
  let t = mine();
  /* 21 SINCE 18 OCT — the owner: *"On Sunday @9pm"* — the code's default, the config row's and its note's, and
     the hour `installWeeklyDigest` writes down for `checkSundayEmail` (Apps Script cannot read it back). */
  if (t.length !== 1 || t[0].spec.weekDay !== 'SUNDAY' || t[0].spec.hour !== 21 || t[0].spec.tz !== 'Europe/London') bad.push('installWeeklyDigest with no hour set booked ' + JSON.stringify(t.map(x => x.spec)) + ' — wanted one Sunday trigger at 21 (9pm), Europe/London');
  asked++;
  const row = JSON.parse(JSON.stringify(b.ev('CONFIG_DEFAULTS.find(r => r[0] === "weekly_digest_hour")')));
  if (!row || row[1] !== 21 || !/blank = 21\b/.test(String(row[2]))) bad.push('CONFIG_DEFAULTS has weekly_digest_hour as ' + JSON.stringify(row) + ' — wanted 21, and a note saying blank = 21');
  if (String(b.props[b.ev('DIGEST_BOOKED')]) !== '21') bad.push('installWeeklyDigest did not record the hour it booked (' + JSON.stringify(b.props[b.ev('DIGEST_BOOKED')]) + ') — wanted "21" in Script Properties');
  cfgSet(b, 'weekly_digest_hour', '7');
  b.ev('installWeeklyDigest_()');
  b.ev('installWeeklyDigest_()');
  t = mine();
  if (t.length !== 1 || t[0].spec.hour !== 7) bad.push('installWeeklyDigest run twice more at hour 7 left ' + JSON.stringify(t.map(x => x.spec)) + ' — wanted exactly one, at 7');
  ['25', 'six', '-1'].forEach(v => {
    cfgSet(b, 'weekly_digest_hour', v);
    b.ev('installWeeklyDigest_()');
    if (mine().length !== 1 || mine()[0].spec.hour !== 21) bad.push('weekly_digest_hour "' + v + '" booked ' + JSON.stringify(mine().map(x => x.spec.hour)) + ' — wanted the fallback, 21');
  });
  if (!trig.some(x => x.spec.fn === 'closeFinishedJobs')) bad.push('installWeeklyDigest deleted somebody else’s trigger');
  const gone = b.ev('removeWeeklyDigest()');
  if (mine().length || gone.removed !== 1 || !trig.some(x => x.spec.fn === 'closeFinishedJobs')) bad.push('removeWeeklyDigest left ' + mine().length + ' Sunday trigger(s), or took another');
}
{
  /* (k) KEPT BOOKED BY ITSELF (361): twice leaves one trigger and books nothing the second time; a new hour re-books. */
  const { b, trig } = seeded();
  const mine = () => trig.filter(t => t.spec.fn === 'weeklyDigestRun');
  asked++;
  const first = b.ev('digestKeepBooked_()'), second = b.ev('digestKeepBooked_()');
  if (!first || second !== null || mine().length !== 1 || mine()[0].spec.hour !== 21) bad.push('digestKeepBooked_ run twice left ' + mine().length + ' Sunday trigger(s), or booked again with nothing to change — wanted one, at 21, and null the second time');
  asked++;
  cfgSet(b, 'weekly_digest_hour', '19');
  b.ev('clearCache(); digestKeepBooked_()');
  if (mine().length !== 1 || mine()[0].spec.hour !== 19) bad.push('digestKeepBooked_ after weekly_digest_hour moved to 19 left ' + JSON.stringify(mine().map(x => x.spec.hour)) + ' — wanted one trigger, at 19');
}
{
  /* (d) 9PM ON THE SUNDAY THE CLOCKS GO BACK (25 Oct 2026, docs/history/457) — the owner: "why was it done at 6pm
     instead of 9pm". The sheet's row kept the old seed's 18, so every admin load kept the trigger at 18. */
  const { b, trig, mail, setClock } = seeded();
  const mine = () => trig.filter(t => t.spec.fn === 'weeklyDigestRun');
  const OLD = 'the hour on Sunday, London time, the weekly parent email goes. 0-23, blank = 18. Run installWeeklyDigest again after changing it';
  const g = b.tabs.config, h = g[0];
  const putRow = (v, note) => { const r = g.find((x, i) => i > 0 && x[h.indexOf('key')] === 'weekly_digest_hour'); r[h.indexOf('value')] = v; if (h.indexOf('what_it_does') >= 0) r[h.indexOf('what_it_does')] = note; b.ev('clearCache()'); };
  asked++;
  cfgSet(b, 'weekly_digest_hour', 18);
  if (h.indexOf('what_it_does') < 0) bad.push('the config tab in the check has no what_it_does column, so the old seed cannot be asked');
  putRow(18, OLD);
  b.ev('installWeeklyDigest_()');
  if (mine()[0].spec.hour !== 18) bad.push('the stale-18 world did not start booked at 18');
  b.ev('clearCache(); seedConfig_()');
  b.ev('clearCache(); digestKeepBooked_()');
  if (mine().length !== 1 || mine()[0].spec.hour !== 21) bad.push('a weekly_digest_hour row still exactly as the old seed wrote it (18) left the Sunday trigger at ' + JSON.stringify(mine().map(x => x.spec.hour)) + ' — wanted it reseeded to 21 and re-booked');
  asked++;
  putRow(18, 'the owner typed this');
  b.ev('clearCache(); seedConfig_(); digestKeepBooked_()');
  if (mine()[0].spec.hour !== 18) bad.push('an 18 the owner typed (note changed) was overwritten — only an untouched old seed is reseeded');
  putRow(21, OLD);
  b.ev('clearCache(); digestKeepBooked_()');
  /* THE DAY ITSELF: the week, the hour said and the next send, either side of the clocks changing. */
  asked++;
  const w = JSON.parse(JSON.stringify(b.ev('digestWeekToSend_(new Date(' + at('2026-10-25T21:00:00Z') + '))')));
  if (w.start !== '2026-10-19' || w.end !== '2026-10-25') bad.push('a run at 21:00 GMT on 25 Oct 2026 sends the week ' + JSON.stringify(w) + ' — wanted 19–25 Oct');
  const next = (s, hr) => new Date(b.ev('digestSendAt_(new Date(' + at(s) + '), ' + hr + ')')).toISOString();
  [['2026-10-25T00:30:00Z', '2026-10-25T21:00:00.000Z', 'the morning the clocks go back (GMT by evening)'],
   ['2026-10-24T20:00:00Z', '2026-10-25T21:00:00.000Z', 'the Saturday before, still BST'],
   ['2026-03-29T00:30:00Z', '2026-03-29T20:00:00.000Z', 'the morning the clocks go forward (BST by evening)']].forEach(([s, want, what]) => {
    if (next(s, 21) !== want) bad.push('the next send from ' + what + ' is ' + next(s, 21) + ' — wanted 21:00 London, ' + want);
  });
  /* AND THE RESERVE ON THAT RUN: a quota at the reserve holds, one above it sends. */
  asked++;
  cfgSet(b, 'weekly_digest', 'send'); cfgSet(b, 'weekly_digest_reserve', '3');
  mail.quota = 3; setClock(at('2026-10-25T21:00:00Z'));
  const held = run(b, '2026-10-25T21:00:00Z');
  if (held.sent || mail.sent.length) bad.push('with the quota at the reserve (3) the 25 Oct run still sent ' + mail.sent.length);
  mail.quota = 100;
  const sentRun = run(b, '2026-10-25T21:05:00Z');
  if (sentRun.held || (sentRun.emails && !sentRun.sent && sentRun.emails !== sentRun.already)) bad.push('with the quota back the 25 Oct run still held: ' + JSON.stringify(sentRun));
}
{
  /* (g) ONE TRIGGER, AND ONLY ONE (18 Oct, docs/history/352) — the owner: § */
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  const fns = () => trig.map(t => t.spec.fn).sort().join(', ');
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest_()')));
  if (fns() !== 'closeFinishedJobs, weeklyDigestRun') bad.push('installWeeklyDigest booked [' + fns() + '] — wanted ONE trigger, the 9pm Sunday email (closeFinishedJobs is somebody else’s, kept)');
  if ('marking' in out || !/the only trigger the email has/.test(String(out.installed))) bad.push('installWeeklyDigest still reports a marking schedule, or does not say the email’s trigger is its only one: ' + JSON.stringify(out));
  asked++;
  b.ev('installWeeklyDigest_()'); b.ev('installWeeklyDigest_()');
  cfgSet(b, 'weekly_digest_hour', '0');
  b.ev('installWeeklyDigest_()');
  const sun = trig.filter(t => t.spec.fn === 'weeklyDigestRun').map(t => t.spec);
  if (fns() !== 'closeFinishedJobs, weeklyDigestRun' || sun[0].weekDay !== 'SUNDAY' || sun[0].hour !== 0 || sun[0].minute !== 0)
    bad.push('installWeeklyDigest run three more times, the last at hour 0, left [' + fns() + '] ' + JSON.stringify(sun) + ' — wanted one Sunday trigger at 0:00 near the hour, and nothing else');
  asked++;
  const gone = JSON.parse(JSON.stringify(b.ev('removeWeeklyDigest()')));
  if (fns() !== 'closeFinishedJobs' || gone.removed !== 1 || Object.keys(gone.retired || {}).length)
    bad.push('removeWeeklyDigest left [' + fns() + '] and said ' + JSON.stringify(gone) + ' — wanted the email gone, nothing retired to find, closeFinishedJobs kept');
}
{
  /* WHAT NOTHING RUNS ANY MORE GOES WHEN THE SUNDAY IS BOOKED — and by the way back too. § */
  const seed = () => {
    const s = seeded();
    s.b.ev('ScriptApp.newTrigger("sessionRecapRun").timeBased().everyHours(1).create()');
    s.b.ev('ScriptApp.newTrigger("sessionRecapRun").timeBased().everyHours(1).create()');
    s.b.ev('ScriptApp.newTrigger("digestMarkRun").timeBased().everyDays(1).atHour(2).create()');
    s.b.ev('ScriptApp.newTrigger("digestMarkRun").timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(20).create()');
    s.b.ev('ScriptApp.newTrigger("digestMarkRun").timeBased().after(60000).create()');
    s.b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
    ['DIGEST_MARKING', 'DIGEST_MARK_TRIED', 'DIGEST_MARK_AGAIN'].forEach(k => { s.b.props[k] = '{}'; });
    return s;
  };
  const { b, trig } = seed();
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest_()')));
  const fns = trig.map(t => t.spec.fn).sort().join(', ');
  if (fns !== 'closeFinishedJobs, weeklyDigestRun') bad.push('after installWeeklyDigest the triggers are [' + fns + '] — wanted the old hourly check and every marking pass gone, closeFinishedJobs kept, one Sunday email');
  if (!/removed 5 old triggers that nothing runs any more: .*sessionRecapRun ×2/.test(String(out.retired)) || !/digestMarkRun ×3/.test(String(out.retired))) bad.push('installWeeklyDigest does not say what old triggers it removed: ' + JSON.stringify(out.retired));
  if (['DIGEST_MARKING', 'DIGEST_MARK_TRIED', 'DIGEST_MARK_AGAIN'].some(k => k in b.props)) bad.push('installWeeklyDigest left the old marking pass’s Script Properties: ' + Object.keys(b.props).filter(k => /DIGEST_MARK/.test(k)).join(', '));
  asked++;
  const again = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest_()')));
  if (!/no old trigger was booked/.test(String(again.retired)) || trig.map(t => t.spec.fn).sort().join(', ') !== 'closeFinishedJobs, weeklyDigestRun')
    bad.push('installWeeklyDigest run again, with no old trigger booked, said ' + JSON.stringify(again.retired) + ' and left [' + trig.map(t => t.spec.fn) + ']');
  asked++;
  const r = seed();
  const gone = JSON.parse(JSON.stringify(r.b.ev('removeWeeklyDigest()')));
  if (r.trig.map(t => t.spec.fn).join(', ') !== 'closeFinishedJobs' || (gone.retired || {}).digestMarkRun !== 3 || (gone.retired || {}).sessionRecapRun !== 2)
    bad.push('removeWeeklyDigest alone left [' + r.trig.map(t => t.spec.fn) + '] and said ' + JSON.stringify(gone) + ' — wanted every old trigger gone too');
}

/* ---------- 7. NOTHING STARTS IT, AND IT ARRIVES OFF ------------------------------------------------------------ */
{
  asked++;
  const dir = path.join(REPO, 'backend');
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.gs')); } catch (e) {}
  if (!files.includes('digest.gs')) { console.log('backend/digest.gs could not be read, so NOTHING was checked — not a pass.'); process.exit(1); }
  const front = fs.readdirSync(path.join(REPO, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f))
    .map(f => ['js/' + f, strip(fs.readFileSync(path.join(REPO, 'js', f), 'utf8'))]);
  const back = files.map(f => ['backend/' + f, strip(fs.readFileSync(path.join(dir, f), 'utf8'))]);
  /* NOT ONE CALL, anywhere, to what books or runs it — its own declarations and the run's one caller aside — AND NOT ONE BARE MENTION, which is a call waiting to § */
  back.concat(front).forEach(([f, src]) => {
    ['installWeeklyDigest_', 'weeklyDigestRun', 'removeWeeklyDigest', 'checkSundayEmail'].forEach(n => {
      const c = Math.max(calls(src, n).length, mentions(src, n).length);
      /* 361: removeWeeklyDigest's one caller is the installer, and the installer's is digestKeepBooked_. */
      const allowed = f === 'backend/digest.gs' && (n === 'removeWeeklyDigest' || n === 'installWeeklyDigest_') ? 1 : 0;
      if (c > allowed) bad.push(f + ' names ' + n + ' outside its declaration — nothing may book or run the Sunday email but digestKeepBooked_');
    });
    if (f !== 'backend/digest.gs' && calls(src, 'digestRun_').length) bad.push(f + ' calls digestRun_() — only the trigger’s weeklyDigestRun may');
    /* AND THE MARKING PASS IS GONE (18 Oct, docs/history/352): nothing declares its handler or its pass again. */
    if (/function\s+(digestMarkRun|digestMarkPass_|digestMarkAgain_)\b/.test(src)) bad.push(f + ' declares the old marking pass (digestMarkRun / digestMarkPass_) — the email marks nothing, and 9pm on Sunday is the only trigger');
    if (f !== 'backend/digest.gs' && /DIGEST_RUN|DIGEST_MARK_RUN|['"](weeklyDigestRun|digestMarkRun)['"]/.test(src) && f !== 'backend/constants.gs') bad.push(f + ' names the Sunday or the marking handler — a second place that could book it');
  });
  const dg = (back.find(([f]) => f === 'backend/digest.gs') || [])[1] || '';
  const nt = [...dg.matchAll(/newTrigger\s*\(/g)];
  const inst = dg.indexOf('function installWeeklyDigest_');
  const instEnd = dg.indexOf('\nfunction ', inst + 1);
  /* ONE, AND IT IS IN installWeeklyDigest (18 Oct): the run-up's one-off went with the marking pass. */
  if (nt.length !== 1 || !(nt[0].index > inst && nt[0].index < instEnd))
    bad.push('digest.gs books ' + nt.length + ' trigger(s) — wanted exactly one newTrigger, the Sunday email’s, in installWeeklyDigest');
  const rn = b => b.ev('Object.keys(typeof RUNNABLE === "object" ? RUNNABLE : {}).join(",")');
  const { b } = world();
  if (/digest|Digest/.test(rn(b))) bad.push('RUNNABLE names a digest function — `?run=` would be a way to start it from a URL');
  /* ITS VALUES TOO: a key called `sunday` holding installWeeklyDigest is the same door with another name. */
  if (b.ev('Object.values(typeof RUNNABLE === "object" ? RUNNABLE : {}).some(f => f === installWeeklyDigest_ || f === digestKeepBooked_ || f === weeklyDigestRun || f === digestRun_'
    + ' || f === checkSundayEmail || /igest|Sunday/.test(String(f && f.name)))'))
    bad.push('a RUNNABLE entry is a digest function under another name — `?run=` would start it from a URL');
  const def = b.ev('(CONFIG_DEFAULTS.find(r => r[0] === "weekly_digest") || [])[1]');
  if (def !== 'off') bad.push('weekly_digest arrives as "' + def + '" on the config tab — it must arrive off');
  if (b.ev('digestMode_(config())') !== 'off') bad.push('an empty config tab is not off');
  const install = b.ev('typeof installTriggers_ === "function" ? installTriggers_.toString() : ""');
  if (/igest|Sunday|DIGEST_MARK/.test(install)) bad.push('installTriggers_ mentions the digest or its marking — /exec?triggers=1 would book it');
  /* AND THE MARKING SWITCH IS GONE WITH ITS PASS (18 Oct) — a row on the config tab that nothing reads is a
     switch the owner would flip and see nothing change. */
  if (b.ev('CONFIG_DEFAULTS.some(r => r[0] === "weekly_digest_marking")')) bad.push('weekly_digest_marking is still a config row — the marking pass it switched is gone');
}

/* ---------- 8. THE ADMIN'S PREVIEW, AND NOBODY ELSE'S ---------------------------------------------------------- */
{
  const { b, mail, trig, setClock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');      // even with send on, a preview sends nothing
  setClock(at(SUN));
  const tok = {};
  ['a1@example.org', 's1@example.org', 'pat@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  asked++;
  const logBefore = rowsOf(b, 'digest_log').length;
  const pv = b.post({ action: 'digestPreview', token: tok['a1@example.org'] });
  if (!pv.success) bad.push('an admin’s digestPreview was refused: ' + JSON.stringify(pv));
  else {
    if (pv.mode !== 'send' || !pv.week || pv.week.start !== '2026-09-28' || pv.week.span !== '28 Sep – 4 Oct') bad.push('the preview says mode ' + pv.mode + ', week ' + JSON.stringify(pv.week));
    const subs = (pv.emails || []).map(m => m.to + ' ' + m.subject).sort();
    if (subs.length !== 2 || !/^bo@example\.org Ben’s week/.test(subs[0]) || !/^pat@example\.org Ada’s week/.test(subs[1])) bad.push('the preview’s emails are ' + JSON.stringify(subs));
    if (!(pv.emails || []).every(m => m.text && m.html)) bad.push('the preview does not carry each email’s bodies');
    if ((pv.unreachable || []).map(u => u.id).sort().join() !== 'P-S3,P-S4') bad.push('the preview’s unreachable list is ' + JSON.stringify(pv.unreachable));
    if (pv.scheduled !== 0) bad.push('the preview says ' + pv.scheduled + ' Sunday trigger(s) are booked — none is');
    /* AND `words: true`, THE DEPLOYED VERSION'S OWN WORD THAT IT PRINTS EACH QUESTION'S WORDS — a version older than that answers without it, and that is the whole § */
    if (pv.words !== true) bad.push('the preview does not answer words: true, so whoever asks would read this backend as one that lists names only');
  }
  if (pv.writes || mail.sent.length || trig.length || rowsOf(b, 'digest_log').length !== logBefore) bad.push('digestPreview wrote ' + pv.writes + ' cell(s), sent ' + mail.sent.length + ', booked ' + trig.length + ' trigger(s) — it must do none of them');
  [['a student', tok['s1@example.org']], ['a parent', tok['pat@example.org']], ['nobody signed in', '']].forEach(([who, t]) => {
    asked++;
    const d = b.post({ action: 'digestPreview', token: t });
    if (d.success || d.emails || !d.error) bad.push(who + ' asked for digestPreview and was answered ' + JSON.stringify(d).slice(0, 160) + ' — it is an admin’s, it carries every address');
  });
}

/* THE STUBBED WORLD OF THE SUNDAY OF 18 OCT (written for the marking pass of 12 Oct, kept for the email's checks): § */
const SUN18 = '2026-10-18T15:55:00Z';               // 16:55 in London (still summer time)
const LIB_ROWS = [
  { row_id: 'TST-PRE', paper_id: 'PX-1', kind: 'preamble', question: '', section: '', html: '<p>Read the source about the river.</p>', active: 'True' },
  { row_id: 'TST-PRE2', paper_id: 'PX-1', kind: 'preamble', question: '2', html: '<p>A sample of river water is heated.</p>', active: 'True' },
  { row_id: 'TST-PRE9', paper_id: 'PX-9', kind: 'preamble', question: '', html: '<p>Another paper altogether.</p>', active: 'True' },
  { row_id: 'TST-1', paper_id: 'PX-1', kind: 'question', question: '1', answer_type: 'explain', marks: '3', subject: 'Biology',
    html: '<p>Explain why the rate increases at 30&deg;C.</p>', answer: 'Particles collide more often &mdash; more kinetic energy.', examiner_note: 'Credit collision theory.', active: 'True' },
  { row_id: 'TST-2', paper_id: 'PX-1', kind: 'question', question: '2', part: 'a', answer_type: 'written', marks: '8', subject: 'English Language',
    html: '<p>Describe the river at dawn.</p>', answer: 'Level 2 (5&ndash;8 marks): clear, varied description.', active: 'True' },
  { row_id: 'TST-3', paper_id: 'PX-1', kind: 'question', question: '3', answer_type: 'calculation', marks: '2', subject: 'Maths',
    html: '<p>Work out 3<sup>2</sup> + 7.</p>', answer: '16 &mdash; 9 + 7', active: 'True' },
  { row_id: 'TST-4', paper_id: 'PX-1', kind: 'question', question: '4', answer_type: 'drawing', marks: '2', html: '<p>Draw the graph.</p>', answer: 'A straight line.', active: 'True' },
  { row_id: 'TST-5', paper_id: 'PX-1', kind: 'question', question: '5', answer_type: 'short', marks: '1', html: '<p>Pick one.</p>', choices: 'A|B|C', answer: '', active: 'True' },
  { row_id: 'TST-6', paper_id: 'PX-1', kind: 'question', question: '6', answer_type: 'short', marks: '1', html: '<p>Say anything.</p>', answer: '', active: 'True' },
  { row_id: 'TST-7', paper_id: 'PX-1', kind: 'question', question: '7', answer_type: 'short', marks: '1', html: '<p>Work out 4 &times; 4.</p>', answer: '16', accept: '16', active: 'True' },
  { row_id: 'TST-8', paper_id: 'PX-1', kind: 'question', question: '8', answer_type: 'explain', marks: '2', html: '<p>An old question.</p>', answer: 'Anything.', active: 'False' },
  { row_id: 'TST-11', paper_id: 'PX-1', kind: 'question', question: '11', answer_type: 'explain', marks: '3', html: '<p>Explain the trend.</p>', answer: 'It rises.', active: 'True' },
];
for (let i = 1; i <= 30; i++) LIB_ROWS.push({ row_id: 'TST-B' + i, paper_id: 'PX-2', kind: 'question', question: String(i), answer_type: 'short',
  marks: '2', subject: 'Biology', html: '<p>Name part ' + i + ' of the cell.</p>', answer: 'The nucleus.', active: 'True' });
const LIB_TEXT = '[\n' + LIB_ROWS.map(r => JSON.stringify(r)).join(',\n') + '\n]\n';

function markWorld(opts) {
  opts = opts || {};
  const w = world();
  const { b, G, lock } = w;
  let now = at(opts.clock || SUN18);
  const tick = ms => { now += ms; w.setClock(now); };
  w.setClock(now);
  const net = { queue: [], asks: [], lib: 0, libUrls: [], per: 0, during: null, logs: [], site: opts.site || LIB_TEXT };
  G.console = { log: s => net.logs.push(String(s)), warn: () => {}, error: () => {}, info: () => {} };
  G.Utilities.sleep = ms => tick(ms);
  G.Logger = { log: s => net.logs.push(String(s)) };
  G.UrlFetchApp = { fetch: (url, o) => {
    if (/generativelanguage/.test(url)) {
      const body = JSON.parse(o.payload);
      const ask = { url: url, model: decodeURIComponent(url.split('/models/')[1].split(':')[0]), at: now, locked: lock.held,
                    system: body.systemInstruction.parts[0].text, text: body.contents[0].parts[0].text, schema: body.generationConfig.responseSchema };
      net.asks.push(ask);
      if (net.during) net.during(ask);
      const r = net.queue.length ? net.queue.shift() : { code: 200, body: { awarded: 2, feedback: 'Good.' } };
      tick(net.per);
      const text = r.code === 200
        ? JSON.stringify(Object.assign({ candidates: [{ content: { parts: [{ text: typeof r.body === 'string' ? r.body : JSON.stringify(r.body) }] } }] }, r.version ? { modelVersion: r.version } : {}))
        : JSON.stringify({ error: { code: r.code, message: 'stubbed ' + r.code } });
      return { getResponseCode: () => r.code, getContentText: () => text };
    }
    if (/data\/questions\.json/.test(url)) {
      net.lib++; net.libUrls.push(url);
      return { getResponseCode: () => 200, getContentText: () => net.site };
    }
    throw new Error('no network: ' + url);
  } };
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  const P = (id, first, last, role, email, handle) => Object.assign({ person_id: id, first_name: first, last_name: last, handle: handle,
    email: email, role: role }, base);
  b.seed('people', [
    P('P-K1', 'Kit', 'Example', 'student', 'kit.e@example.org', 'ke_bright_42'),
    P('P-K2', 'Kit', 'Other', 'student', 'kit.o@example.org', 'ko_calm_17'),
    P('P-S9', 'Sam', 'Learner', 'student', 'sam.l@example.org', 'sl_quick_08'),
    P('P-P1', 'Pat', 'Parent', 'client', 'pat@example.org', 'pp_kind_11'),
    P('P-P2', 'Quinn', 'Noemail', 'client', '', 'qn_warm_22'),
  ]);
  b.seed('family', [
    { link_id: 'M1', parent_id: 'P-P1', child_id: 'P-K1', child_typed: '', state: 'accepted' },
    { link_id: 'M2', parent_id: 'P-P2', child_id: 'P-S9', child_typed: '', state: 'accepted' },
  ]);
  cfgSet(b, 'weekly_digest', opts.mode || 'send');
  if (opts.key !== false) b.props.GEMINI_API_KEY = 'test-key-not-a-real-one';
  return Object.assign(w, { net: net, tick: tick, now: () => now });
}
/* A PRESS AS THE SHEET HOLDS IT, in the week of 12 Oct, by default the Wednesday at noon in London. */
let MSEQ = 0;
const MS = (pid, key, verdict, label, words, answer, day, hh, more) => Object.assign({ person_id: pid, key: key, label: label || '', words: words || '',
  answer: answer == null ? 'an answer' : answer, verdict: verdict, submitted_at: new Date((day || '2026-10-14') + 'T' + String(hh == null ? 11 : hh).padStart(2, '0') + ':00:00Z'),
  event_id: (1760400000000 + (++MSEQ)) + '-mk' + String(MSEQ).padStart(4, '0') }, more || {});
/* ---------- 9. THE EMAIL PRINTS EACH VERDICT AS IT WAS RECORDED, AND MARKS NOTHING (18 Oct, docs/history/352) § */
{
  const w = markWorld({ clock: '2026-10-18T20:02:00Z' });              // 21:02 in London: the email's run
  const { b, net, mail } = w;
  b.seed('submissions', [
    MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'Particles move faster.', '2026-10-13'),
    MS('P-K1', 'q:TST-7', 'right', 'Maths · Paper X · Q7', 'Work out 4 × 4.', '16', '2026-10-16'),
    MS('P-K1', 'q:TST-11', 'ai:1/3', 'Biology · Paper X · Q11', 'Explain the trend.', 'It goes up.', '2026-10-16'),
    MS('P-K1', 'q:TST-B1', 'wrong', 'Biology · Paper Y · Q1', 'Name part 1 of the cell.', 'wall', '2026-10-17'),
    /* SENT AFTER THE OLD RUN-UP WOULD HAVE STOPPED: the old run marked this one first. */
    MS('P-K1', 'q:TST-3', 'sent', 'Maths · Paper X · Q3', 'Work out 3² + 7.', '16', '2026-10-18', 19, { submitted_at: new Date('2026-10-18T19:50:00Z') }),
  ]);
  const before = JSON.stringify(b.tabs.submissions);
  asked++;
  let threw = '';
  try { b.ev('clearCache(); weeklyDigestRun({})'); } catch (x) { threw = String(x && x.message || x); }
  const got = mail.sent.find(m => m.to === 'pat@example.org') || { body: '' };
  if (threw || mail.sent.length !== 1) bad.push('the 9pm run did not send Pat Kit’s week: ' + (threw || mail.sent.length + ' email(s)'));
  asked++;
  ['Q1 · 3 marks\nExplain why the rate increases at 30°C.\nKit: not marked', 'Q7 · 1 mark\nWork out 4 × 4.\nKit: ✓',
   'Q11 · 3 marks\nExplain the trend.\nKit: 1 of 3 marks', 'Name part 1 of the cell.\nKit: ✗', 'Kit: not marked', 'up to 9:02pm on Sunday'].forEach(x => {
    if (got.body.indexOf(x) === -1) bad.push('the 9pm email does not say "' + x + '" — each verdict as it was recorded: ' + got.body.split('\n').filter(l => /^Q|^Kit|worked on/.test(l)).join(' / '));
  });
  if ((got.body.match(/Kit: not marked/g) || []).length !== 2) bad.push('the 9pm email does not say "not marked" for exactly the two answers recorded `sent`: ' + got.body.split('\n').filter(l => /^Kit/.test(l)).join(' / '));
  /* NO GEMINI CALL, EVER, FROM THE EMAIL'S RUN — asked at the wire, and in the source. */
  asked++;
  if (net.asks.length) bad.push('the 9pm run asked Gemini ' + net.asks.length + ' time(s) — the email marks nothing; it prints each verdict as the child’s press recorded it');
  asked++;
  if (JSON.stringify(b.tabs.submissions) !== before) bad.push('the 9pm run changed the submissions tab — it reads the verdicts, it never appends a mark');
  asked++;
  const dgs = strip(fs.readFileSync(path.join(REPO, 'backend', 'digest.gs'), 'utf8'));
  ['aiMarkAsk_', 'aiModels_', 'aiGemini_'].forEach(n => { if (calls(dgs, n).length) bad.push('digest.gs calls ' + n + '() — the Sunday email asks Gemini nothing'); });
  if (/generativelanguage|GEMINI_API_KEY/.test(dgs)) bad.push('digest.gs reaches for Gemini (its address or GEMINI_API_KEY) — the Sunday email asks Gemini nothing');
}

/* ---------- 10. (f) THE EMAIL HOLDS ONLY WHAT A PARENT NEEDS — through the real send § */
{
  const w = markWorld();
  const { b, mail } = w;
  b.seed('submissions', [
    MS('P-K1', 'q:TST-7', 'right', 'Maths · Paper X · Q7', 'Work out 4 × 4.', '16'),
    MS('P-K1', 'q:TST-9', 'wrong', 'Maths · Paper X · Q9', 'Kit Example buys 3 pens at 40p each. How much does he pay?', '£1.10'),
    MS('P-K1', 'q:TST-11', 'ai:2/3', 'Biology · Paper X · Q11', 'Explain the trend.', 'It rises.'),
    MS('P-K1', 'q:TST-6', 'sent', 'Maths · Paper X · Q6', 'Say anything.', 'hello'),
    MS('P-K2', 'q:TST-7', 'right', 'Maths · Paper X · Q7', 'Work out 4 × 4.', '16'),
  ]);
  w.setClock(at('2026-10-18T17:00:00Z'));
  asked++;
  const r = run(b, '2026-10-18T17:00:00Z');
  const sent = mail.sent.find(m => m.to === 'pat@example.org');
  if (!sent || r.sent !== 1) bad.push('Pat was not emailed Kit’s week through the real send: ' + JSON.stringify(r));
  else {
    const all = [sent.subject, sent.body, sent.htmlBody].join('\n');
    [['the handle', /ke_bright_42|ko_calm_17|@[a-z]+_[a-z]+_\d+/], ['an @ or the business’s name (372: no branding)', /@|family\./], ['the surname', /Example|Learner|\bOther\b/],
     ['a person id', /P-[A-Z]\d/], ['the PIN', /0000/], ['the word "sent"', /\bsent\b/i], ['the child’s own address', /kit\.e@|example\.org/],
     ['the parent’s surname or a greeting other than her first name', /Parent|\bPat\b(?!,)|Hello/], ['the other Kit', /ko_calm|Other/], ['"(again)" or "gone back to"', /\(again\)|gone back to/],
     ['a link', /https?:\/\//], ['a library key', /q:TST|TST-/]].forEach(([what, re]) => {
      asked++;
      if (re.test(all)) bad.push('the email Pat is sent carries ' + what + ': ' + JSON.stringify((all.match(new RegExp('.{0,40}' + re.source + '.{0,40}', re.flags.replace('g', ''))) || [''])[0]));
    });
    asked++;
    /* SINCE 18 OCT A QUESTION THE LIBRARY HAS IS PRINTED AS THE SITE DRAWS IT — its number and marks, its words,
       then how the child did; Q9 is not in the library and goes as its words cell, as before. */
    /* AND SINCE 20 OCT (380) WHAT THE CHILD LAST SENT, AND THE RIGHT ANSWER WHERE THE LIBRARY HAS ONE. */
    ['Kit’s week: 4 questions', 'Q7 · 1 mark\nWork out 4 × 4.\nKit: ✓\nTheir answer: 16\nAnswer: 16\n',
     'Q9 ✗: Kit buys 3 pens at 40p each. How much does he pay?\nTheir answer: £1.10\n', 'Q11 · 3 marks\nExplain the trend.\nKit: 2 of 3 marks\nTheir answer: It rises.\nAnswer: It rises.\n',
     'Q6 · 1 mark\nSay anything.\nKit: not marked\nTheir answer: hello\n', '\n1 right, 1 with part marks, 1 not right and 1 not marked yet.\nTopics: Maths and Biology.\n', 'Hi Pat,\n\nHere’s what Kit worked on this week: 4 questions (12 Oct – 18 Oct, up to 6pm on Sunday).'].forEach(x => {
      if ((sent.subject + '\n' + sent.body).indexOf(x) === -1) bad.push('the email Pat is sent does not say "' + x + '": ' + sent.body.split('\n').slice(0, 12).join(' / '));
    });
    const H = said(sent.htmlBody);
    /* EACH CARD'S TAGS FIRST (380, 20 Oct) — the fixture's paper has no document row, so its Paper tag is its id, as on the site. */
    /* EVERY FACET A TAG SINCE 396: What for and What kind first, and the Accuracy tag after the marks. */
    ['Learning Questions PX-1 Q7 1 mark Accuracy unverified Work out 4 × 4. ✓ Right THEIR ANSWER 16 ANSWER 16', 'Maths Paper X Q9 Kit buys 3 pens at 40p each. How much does he pay? ✗ Not right THEIR ANSWER £1.10',
     'Learning Questions PX-1 Q11 3 marks Accuracy unverified Read the source about the river. Explain the trend. 2 of 3 marks THEIR ANSWER It rises. ANSWER It rises.', 'Learning Questions PX-1 Q6 1 mark Accuracy unverified Read the source about the river. Say anything. Not marked yet THEIR ANSWER hello',
     'Summary of the week 1 right, 1 with part marks, 1 not right and 1 not marked yet. Topics: Maths and Biology'].forEach(x => {
      if (H.indexOf(x) === -1) bad.push('the HTML Pat is sent does not carry "' + x + '": ' + H.slice(0, 600));
    });
  }
}

/* ---------- 11. (h) checkSundayEmail SAYS EVERYTHING IT PROMISES AND CHANGES NOTHING ---------------------------------- */
{
  const w = markWorld({ clock: '2026-10-15T09:00:00Z' });
  const { b, mail, trig, net } = w;
  b.seed('submissions', [
    MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat', '2026-10-13'),
    MS('P-K1', 'q:TST-4', 'sent', 'Maths · Paper X · Q4', 'Draw the graph.', 'a line', '2026-10-13'),
    MS('P-S9', 'q:TST-7', 'right', 'Maths · Paper X · Q7', 'Work out 4 × 4.', '16', '2026-10-14'),
  ]);
  /* AND A CHILD WITH A PARENT TO EMAIL AND NOTHING SENT YET — the other Kit, linked to Pat here. */
  b.seed('family', [
    { link_id: 'M1', parent_id: 'P-P1', child_id: 'P-K1', child_typed: '', state: 'accepted' },
    { link_id: 'M2', parent_id: 'P-P2', child_id: 'P-S9', child_typed: '', state: 'accepted' },
    { link_id: 'M3', parent_id: 'P-P1', child_id: 'P-K2', child_typed: '', state: 'accepted' },
  ]);
  b.ev('installWeeklyDigest_()');
  const snap = () => JSON.stringify({ tabs: b.tabs, props: b.props, trig: trig.map(t => t.spec), sent: mail.sent.length });
  const before = snap(), w0 = b.log.writes;
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('clearCache(); checkSundayEmail()')));
  const text = (out.lines || []).join('\n');
  if (snap() !== before || b.log.writes !== w0) bad.push('checkSundayEmail changed something — a cell, a Script Property, a trigger or an email: it must only read');
  if (net.logs.join('\n').indexOf(text) === -1) bad.push('checkSundayEmail did not put its lines in the execution log (Logger.log)');
  if (/test-key-not-a-real-one/.test(text + net.logs.join('\n'))) bad.push('checkSundayEmail printed GEMINI_API_KEY');
  /* THE STAMP AS THE BACKEND HAS IT, never typed here: a literal turned every correct bump of the four
     stamps red (the review of 12 Oct). */
  [[new RegExp('^Backend ' + String(b.ev('BACKEND_VERSION')).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' ', 'm'), 'the backend’s version'],
   [/THE EMAIL: ON — it emails parents \(weekly_digest is "send"\)\. It goes on Sundays at about 21:00, London time\./, 'the mode and the hour'],
   [/THE TRIGGER: the Sunday email is installed, and it is the only trigger the email has\. No old trigger is booked\./, 'the one trigger, installed'],
   [/THE HOUR BOOKED: The setup booked the email for about 21:00 on Sundays, London time \(recorded in Script Properties as DIGEST_BOOKED_HOUR\)\. The config tab says the same\./, 'the hour installWeeklyDigest booked'],
   [/MAIL: 100 emails left in today’s quota; the Sunday run keeps 10 back/, 'the mail quota'],
   [/THE QUESTION LIBRARY: fetched 0\.0 million characters in [\d.]+ s from https:\/\/halexdias31-pixel\.github\.io\/family\/data\/questions\.json\./, 'the library fetched'],
   [/THIS WEEK \(12 Oct – 18 Oct, so far\): 2 learners sent answers; 1 of them will have a parent emailed \(1 email\)\./, 'this week’s reach'],
   [/NOT REACHED — Sam: parent Quinn has no email address\./, 'who will not be reached, and why'],
   [/  NO ANSWERS YET — Kit: a parent can be emailed, but no email goes unless they answer a question by about 21:00 on Sunday\./, 'the reachable child with no work yet'],
   [/Nothing was changed: no row written, no email sent, no trigger booked\./, 'that nothing changed']].forEach(([re, what]) => {
    asked++;
    if (!re.test(text)) bad.push('checkSundayEmail does not say ' + what + ' — it said:\n      ' + text.split('\n').join('\n      '));
  });
  /* NO MARKING LINES, AND NO ASK OF GEMINI (18 Oct): the email asks Gemini nothing, so neither does its check. */
  asked++;
  if (net.asks.length || /AI MARKING|GEMINI|LIVE TEST|NOT MARKED YET|ROOM BEFORE/.test(text)) bad.push('checkSundayEmail still asks Gemini or prints a marking line (' + net.asks.length + ' ask(s)): ' + text.split('\n').filter(l => /MARK|GEMINI|ROOM/.test(l)).join(' / '));
  /* AND AN OLD TRIGGER STILL BOOKED IS A WARNING — it fires into a function that is gone. */
  asked++;
  const stale = markWorld({ clock: '2026-10-15T09:00:00Z' });
  stale.b.ev('installWeeklyDigest_()');
  stale.b.ev('ScriptApp.newTrigger("digestMarkRun").timeBased().everyDays(1).atHour(2).create()');
  const t6 = (JSON.parse(JSON.stringify(stale.b.ev('clearCache(); checkSundayEmail()'))).lines || []).join('\n');
  if (!/THE TRIGGER: the Sunday email is installed, and it is the only trigger the email has\. WARNING: 1 old trigger that nothing runs any more \(sessionRecapRun, digestMarkRun\) is still booked and will fail — the next admin page load removes it\./.test(t6))
    bad.push('checkSundayEmail with an old marking trigger still booked does not WARN:\n      ' + t6.split('\n').slice(0, 4).join('\n      '));
  /* AND WITH NOTHING SET UP: no key, no triggers, the switch off — each said plainly. */
  asked++;
  const bare0 = markWorld({ key: false, mode: 'off' });
  const o2 = JSON.parse(JSON.stringify(bare0.b.ev('clearCache(); checkSundayEmail()')));
  const t2 = (o2.lines || []).join('\n');
  [/THE EMAIL: OFF — nothing is sent/, /Set weekly_digest to send/, /the Sunday email is NOT installed \(the next admin page load books it\), and it is the only trigger the email has/].forEach(re => {
    if (!re.test(t2)) bad.push('checkSundayEmail with nothing set up does not say ' + re + ':\n      ' + t2.split('\n').join('\n      '));
  });
  /* THE HOUR BOOKED AND THE CELL APART (18 Oct): § */
  asked++;
  const moved = markWorld({ clock: '2026-10-18T09:00:00Z' });
  cfgSet(moved.b, 'weekly_digest_hour', '18');
  moved.b.ev('installWeeklyDigest_()');
  cfgSet(moved.b, 'weekly_digest_hour', '21');
  const t3 = (JSON.parse(JSON.stringify(moved.b.ev('clearCache(); checkSundayEmail()'))).lines || []).join('\n');
  if (!/THE HOUR BOOKED: The setup booked the email for about 18:00 on Sundays, London time \(recorded in Script Properties as DIGEST_BOOKED_HOUR\)\. WARNING: weekly_digest_hour on the config tab now says 21, but the email still goes at about 18:00 — the next admin page load moves it to 21:00\./.test(t3)
      || !/It goes on Sundays at about 18:00, London time\./.test(t3))
    bad.push('with the cell moved from 18 to 21 after installing, checkSundayEmail does not print the booked 18:00 and WARN to run installWeeklyDigest again:\n      ' + t3.split('\n').slice(0, 5).join('\n      '));
  asked++;
  moved.b.ev('installWeeklyDigest_()');
  const t4 = (JSON.parse(JSON.stringify(moved.b.ev('clearCache(); checkSundayEmail()'))).lines || []).join('\n');
  if (!/THE HOUR BOOKED: The setup booked the email for about 21:00 on Sundays.*The config tab says the same\./.test(t4) || /WARNING/.test(t4))
    bad.push('installWeeklyDigest run again at 21 did not leave the setup check agreeing, with no warning:\n      ' + t4.split('\n').slice(0, 5).join('\n      '));
  asked++;
  delete moved.b.props[moved.b.ev('DIGEST_BOOKED')];
  const t5 = (JSON.parse(JSON.stringify(moved.b.ev('clearCache(); checkSundayEmail()'))).lines || []).join('\n');
  if (!/THE HOUR BOOKED: NOT recorded — the trigger was booked by an older backend.*WARNING: the next admin page load re-books it at 21:00/.test(t5)
      || /It goes on Sundays at about/.test(t5))
    bad.push('triggers with no recorded hour are not said to be unknown, with the warning to run installWeeklyDigest again:\n      ' + t5.split('\n').slice(0, 5).join('\n      '));
}

/* ---------- 13. EACH QUESTION AS IT IS ON THE SITE, WITH ITS PICTURE (18 Oct, docs/history/351) § */
{
  const crypto = require('crypto');
  const hashOf = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);
  const SITE = 'https://halexdias31-pixel.github.io/family/data/diagrams/';
  const STEM_SVG = '<svg viewBox="0 0 300 120" role="img" aria-label="A ladder leaning on a wall &amp; a 2 m gap"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor"/></svg>';
  const PART_SVG = '<svg viewBox="0 0 340 200" role="img" aria-label="Triangle ABC with the angle at B marked x"><text x="5" y="5" class="lbl">B</text></svg>';
  const longStem = 'A ladder of length 6 m leans against a vertical wall. ' + Array.from({ length: 14 }, (_, i) => 'Sentence ' + (i + 1) + ' of the scene says more about the wall.').join(' ') + ' THE STEM ENDS HERE.';
  const longAsk = 'Work out how far up the wall the ladder reaches. ' + Array.from({ length: 16 }, (_, i) => 'Clause ' + (i + 1) + ' of the ask adds a condition.').join(' ') + ' THE ASK ENDS HERE.';
  const ROWS = [
    { row_id: 'TSA-PRE3', paper_id: 'PX-A', kind: 'preamble', question: '3', html: '<p>' + longStem + '</p>', diagram: STEM_SVG, active: 'True' },
    { row_id: 'TSA-3a', paper_id: 'PX-A', kind: 'question', question: '3', part: 'a', marks: '2', answer_type: 'calculation', accept: '5', active: 'True',
      html: '<p class="faint" style="color:red" onclick="steal()">' + longAsk + '</p>'
        + '<table class="num"><tr><th colspan="2" scope="col">Length</th></tr><tr><td>6 m</td><td>2 m</td></tr></table>'
        + '<p>Give <span class="frac"><span class="frac-n">3</span><span class="frac-d">4</span></span> of it, x &lt; 7 &amp; y &gt; 2, '
        + '<a href="https://evil.example/pay" target="_blank">read more</a><img src="x" onerror="steal()"><script>steal()</script>.</p>' },
    { row_id: 'TSA-3b', paper_id: 'PX-A', kind: 'question', question: '3', part: 'b', marks: '3', answer_type: 'explain', active: 'True',
      lead: '<p>Here is the triangle.</p>', html: '<p>Look at the figure.</p><!--fig--><p>Explain why angle <i>x</i> is 40&deg;.</p>', diagram: PART_SVG },
  ];
  const lib = '[\n' + LIB_ROWS.concat(ROWS).map(r => JSON.stringify(r)).join(',\n') + '\n]\n';
  const w = markWorld({ site: lib });
  const { b, mail } = w;
  b.seed('submissions', [
    MS('P-K1', 'q:TSA-3a', 'right', 'Maths · Paper A · Q3a', 'A cut-down copy of the stem\n---\nWork out how far up the wall…', '5'),
    MS('P-K1', 'q:TSA-3b', 'ai:2/3', 'Maths · Paper A · Q3b', 'A cut-down copy\n---\nExplain why angle x is 40°.', 'Angles in a triangle.'),
    MS('P-K1', 'q:TSA-GONE-4', 'right', 'Maths · Paper A · Q4', 'Work out 12 × 3.', '36'),
    MS('P-K1', 'pr:PR-X1#iv', 'sent', 'Biology · Required practical · Worksheet', 'What is the independent variable?', 'temperature'),
  ]);
  w.setClock(at('2026-10-18T20:00:00Z'));
  const r = run(b, '2026-10-18T20:00:00Z');
  const sent = mail.sent.find(m => m.to === 'pat@example.org') || { body: '', htmlBody: '', subject: '' };
  /* THE ROW'S MARKUP IS THE BODY'S: the dark frame's head and its own classes (380) are the email's, not anything a row brought. */
  const html = String(sent.htmlBody).replace(/^[\s\S]*?<body\b[^>]*>|<\/body><\/html>$/g, '').replace(/ class="(?:kb|kp|kc|gs|gd|gi)"/g, '');
  const text = sent.body, flat = unstyled(html);
  asked++;
  if (r.sent !== 1 || !/as it is on the site/.test(String(r.library))) bad.push('the run did not send Kit’s week with the library fetched: ' + JSON.stringify(r).slice(0, 300));
  /* FULL WORDS, NO TRUNCATION — the stem past DIGEST_STEM_SHOWN and the ask past DIGEST_WORDS_SHOWN, whole. */
  asked++;
  if (text.indexOf(longStem) === -1 || text.indexOf(longAsk) === -1 || flat.indexOf(longStem) === -1 || flat.indexOf(longAsk) === -1
      || /…/.test(text.split('Q4 ✓')[0]) || /cut-down copy/.test(text + html))
    bad.push('a question in the library is not printed whole from its row — the stem and the ask past the old cuts, with no "…" and nothing of the words cell: '
      + JSON.stringify(text.slice(text.indexOf('Maths'), text.indexOf('Maths') + 260)));
  /* AS THE CARD: the shared stem once in the paper, its picture after it; each part's number and marks, its
     words, then the child's mark; the part's picture where `<!--fig-->` stands, after its lead. */
  asked++;
  const stemAt = text.indexOf(longStem), times = text.split(longStem).length - 1;
  const want3a = 'Q3a · 2 marks\n' + longAsk, want3b = 'Q3b · 3 marks\nHere is the triangle.\nLook at the figure.\n[Picture: Triangle ABC with the angle at B marked x]\nExplain why angle x is 40°.\nKit: 2 of 3 marks';
  if (times !== 1 || flat.split(longStem).length !== 2 || text.indexOf('[Picture: A ladder leaning on a wall & a 2 m gap]') < stemAt
      || text.indexOf(want3a) < stemAt || text.indexOf(want3b) === -1 || !/Length \| \n?|Length/.test(text) || text.indexOf('6 m | 2 m') === -1
      || text.indexOf('Give 3/4 of it, x < 7 & y > 2, read more.\nKit: ✓') === -1)
    bad.push('the paper is not drawn as the card draws it — the stem once with its picture, then "Q3a · 2 marks", its words and "Kit: ✓", then Q3b with its picture after its lead: '
      + JSON.stringify(text.slice(stemAt + longStem.length, stemAt + longStem.length + 900)));
  /* THE PICTURE: the PNG twin by hash, the drawing's width, its aria-label as alt; never an attachment. */
  asked++;
  const img = (svg, wd, alt) => '<img src="' + SITE + hashOf(svg) + '.png" width="' + wd + '" alt="' + alt + '" style="display:block;width:100%;max-width:' + wd + 'px;height:auto;border:0">';
  if (html.indexOf(img(STEM_SVG, 300, 'A ladder leaning on a wall &amp; a 2 m gap')) === -1 || html.indexOf(img(PART_SVG, 340, 'Triangle ABC with the angle at B marked x')) === -1
      || /<svg/i.test(html) || sent.attachments || sent.inlineImages)
    bad.push('a question’s picture is not its PNG twin on the site — <img src=".../data/diagrams/<12 hex of its SHA-256>.png" width alt>, no SVG, nothing attached: '
      + JSON.stringify((html.match(/<img[^>]*>/g) || []).concat(sent.attachments ? ['attachments'] : [])));
  /* THE ALLOW-LIST: what the row's markup may bring into an inbox. The email's own frame (380) adds the attributes a mail client's table layout reads, and nothing a row has. */
  asked++;
  const tags = (html.match(/<\/?([a-z0-9]+)/gi) || []).map(t => t.replace(/<\/?/, '').toLowerCase());
  const odd = tags.filter(t => !/^(p|br|b|strong|i|em|sup|sub|ul|ol|li|table|thead|tbody|tr|th|td|span|div|img)$/.test(t));
  const attrs = (html.match(/\s([a-z-]+)=/gi) || []).map(a => a.trim().slice(0, -1).toLowerCase()).filter(a => !/^(style|colspan|rowspan|src|width|alt|role|cellpadding|cellspacing|border|bgcolor|align|valign)$/.test(a));
  if (odd.length || attrs.length || /<(?!table\b|td\b)[a-z]+\b[^>]*\s(?:role|cellpadding|cellspacing|border|bgcolor|align|valign)=/i.test(html) || /evil\.example|onerror|onclick|steal|scope=|class=|target=/.test(html) || html.indexOf('<th colspan="2" style=') === -1
      || flat.indexOf('<sup>3</sup>/<sub>4</sub>') === -1 || flat.indexOf('x &lt; 7 &amp; y &gt; 2') === -1)
    bad.push('the row’s markup reached the email past the allow-list — tags ' + JSON.stringify([...new Set(odd)]) + ', attributes ' + JSON.stringify([...new Set(attrs)])
      + ' (wanted only p, br, b, strong, i, em, sup, sub, ul, ol, li, table, thead, tbody, tr, th, td, span, div; no attribute but colspan/rowspan and its own styles)');
  /* A KEY THE LIBRARY DOES NOT HAVE — a question it dropped, a practical's box — goes as its words cell, as before. */
  asked++;
  if (text.indexOf('\nQ4 ✓: Work out 12 × 3.\n') === -1 || said(html).indexOf('Q4 Work out 12 × 3. ✓ Right') === -1
      || text.indexOf('Worksheet not marked: What is the independent variable?') === -1)
    bad.push('a key missing from the library does not fall back to its words line ("Q4 ✓: <its words>"): ' + JSON.stringify(text.split('\n').filter(l => /Q4|Worksheet/.test(l))));
  /* AND STILL NO LINK A PARENT COULD PRESS: the only address in it is each picture's, on the site's own folder. */
  asked++;
  const links = (html + '\n' + text).match(/https?:\/\/[^\s"<>]+/g) || [];
  if (links.some(u => u.indexOf(SITE) !== 0 || !/^[0-9a-f]{12}\.png$/.test(u.slice(SITE.length))) || /<a\b/i.test(html) || /https?:\/\//.test(text))
    bad.push('the email carries an address other than its pictures’ on the site: ' + JSON.stringify(links.filter(u => u.indexOf(SITE) !== 0)));
  /* THE REAL LIBRARY: a real question with a picture, found by the run's own line scan, names a PNG that is in
     data/diagrams/ — the email's picture and the twin the tool drew are one file. */
  asked++;
  let real = '';
  try { real = require('../check/lib-full.js').text('questions'); } catch (e) { real = ''; }
  const rw = markWorld({ site: real || LIB_TEXT });
  rw.b.seed('submissions', [MS('P-K1', 'q:Q-9MA031-2206-5c', 'right', 'Maths · Paper 31: Statistics — June 2022 · Q5c(i)', '', '481')]);
  rw.setClock(at('2026-10-18T20:00:00Z'));
  run(rw.b, '2026-10-18T20:00:00Z');
  const rm = rw.mail.sent.find(m => m.to === 'pat@example.org') || { htmlBody: '', body: '' };
  const src = (/<img src="https:\/\/halexdias31-pixel\.github\.io\/family\/data\/diagrams\/([0-9a-f]{12})\.png" width="300" alt="Venn diagram of H, R and F[^"]*"/.exec(rm.htmlBody) || [])[1];
  if (!real || !src || !fs.existsSync(path.join(REPO, 'data', 'diagrams', src + '.png')) || rm.body.indexOf('[Picture: Venn diagram of H, R and F') === -1
      || rm.body.indexOf('Using this information, complete the Venn diagram above.') === -1)
    bad.push('a real question with a picture (Q-9MA031-2206-5c) did not go with its words, its alt text and an <img> of a PNG that is in data/diagrams/: ' + JSON.stringify(src || rm.body.slice(0, 200)));
}
{
  /* UNDER GMAIL'S CLIP, EVERY QUESTION KEPT. § */
  const { b, G } = world();
  const CLIP = b.ev('DIGEST_CLIP_BYTES');
  const make = (askLen, stemLen) => {
    const rows = {}, pre = [], items = [];
    for (let i = 0; i < 80; i++) {
      const ask = ('Part ' + i + ' asks: ' + 'explain the step and give a reason. '.repeat(Math.ceil(askLen / 36))).slice(0, askLen) + ' END' + i + '.';
      rows['CL-' + i] = { row_id: 'CL-' + i, paper_id: 'CP-' + i, kind: 'question', question: '1', marks: '4', active: 'True', html: '<p>' + ask + '</p>' };
      pre.push({ row_id: 'CLP-' + i, paper_id: 'CP-' + i, kind: 'preamble', question: '1', active: 'True', html: '<p>' + ('Source ' + i + ' reads: ' + 'the river ran fast. '.repeat(Math.ceil(stemLen / 20))).slice(0, stemLen) + '</p>' });
      items.push({ key: 'q:CL-' + i, label: 'English · Paper ' + i + ' · Q1', words: '', hidden: false, last: '2026-10-01', verdict: 'ai:3/4' });
    }
    G.__L = { id: 'P-S1', first: 'Ada', fresh: items, again: [] };
    G.__LOOK = { brand: '@family.', site: 'https://halexdias31-pixel.github.io/family/', hour: 21, lib: { rows: rows, pre: pre } };
    return JSON.parse(JSON.stringify(b.ev('digestRender_(__L, { first: "Pat" }, { start: "2026-10-12", end: "2026-10-18" }, __LOOK)')));
  };
  asked++;
  /* 200 CHARACTERS A PART, NOT 600, SINCE 20 OCT: each question is a card now (380), whose frame weighs about 0.6 KB of the clip. */
  const m = make(200, 3000);
  const kb = Buffer.byteLength(m.html, 'utf8');
  const marks = m.text.split('\n').filter(l => l === 'Ada: 3 of 4 marks').length;
  if (!(kb <= CLIP) || kb < 40000 || marks !== 80 || m.text.indexOf('(the source text is on the site)') === -1 || !/END79\./.test(m.text)
      || /the question’s words are on the site/.test(m.text) || !/Just reply and say so/.test(m.html) || CLIP > 100000)
    bad.push('a week of 80 parts under long sources is ' + (kb / 1024).toFixed(1) + ' KB with ' + marks + ' marks listed — wanted under DIGEST_CLIP_BYTES (' + CLIP
      + ', short of Gmail’s ~102 KB), all 80 with their whole words and marks, the longest sources said as on the site, and the footer');
  asked++;
  const m2 = make(2000, 200);
  const kb2 = Buffer.byteLength(m2.html, 'utf8');
  const listed = m2.text.split('\n').filter(l => /^Q1 · 4 marks$/.test(l)).length;
  if (!(kb2 <= CLIP) || listed !== 80 || m2.text.split('\n').filter(l => l === 'Ada: 3 of 4 marks').length !== 80
      || m2.text.indexOf('(the question’s words are on the site)') === -1 || !/Just reply and say so/.test(m2.html))
    bad.push('80 long parts made ' + (kb2 / 1024).toFixed(1) + ' KB with ' + listed + ' listed — wanted under the clip with every question still listed by number and mark');
}

/* ---------- 11b. EACH QUESTION IS THE SITE'S CARD (380, 20 Oct): its tags as the card wears them, in its facets' colours, on the black screen § */
{
  const { b, G } = world();
  G.__TXT = require('../check/lib-full.js').text('questions');
  const lib = JSON.parse(JSON.stringify(b.ev('digestLibraryFind_(__TXT, ["Q-1MA1-2406-1F-7", "Q-CBM-perimeter-1"])')));
  const said7 = (lib.tags && lib.tags['Q-1MA1-2406-1F-7'] || []).map(t => t.text).join(' ');
  const saidC = (lib.tags && lib.tags['Q-CBM-perimeter-1'] || []).map(t => t.text).join(' ');
  asked++;
  /* THE SCREENSHOT'S ROWS (docs/history/355), less the page tags: the email draws a part whole. check-funnel holds every question to its card. */
  /* no "Printed sheet" since 385: Q7 is drawn and marked on screen */
  if (said7 !== 'Learning Questions Maths Past paper GCSE KS4 Edexcel Foundation 2024 June Paper 1 Q7 4 marks Non-calculator Accuracy verified'
      || saidC !== 'Learning Questions Maths Worksheet SATs KS2 Year 3 Perimeter Q1 Accuracy unverified Corbettmaths')
    bad.push('the library\'s tags for two real questions are not the card\'s: ' + JSON.stringify([said7, saidC]));
  G.__LIB = lib;
  G.__L = { id: 'P-S1', first: 'Kit', fresh: [
    { key: 'q:Q-1MA1-2406-1F-7', label: 'Maths · Paper 1F (Non-calculator) — June 2024 · Q7', words: '', verdict: 'rule:3/4', answer: 'drawing · 4 marks · #x' },
    { key: 'q:Q-CBM-perimeter-1', label: 'Maths · Perimeter · Q1', words: '', verdict: 'right', answer: '16' }], again: [] };
  const r = JSON.parse(JSON.stringify(b.ev('digestRender_(__L, { first: "Pat" }, { start: "2026-10-12", end: "2026-10-18" }, { site: "https://halexdias31-pixel.github.io/family/", hour: 21, lib: __LIB })')));
  const cards = r.html.split('bgcolor="#0b0b0b" style="border:10px solid #101010').length - 1;
  asked++;
  if (cards !== 2 || r.html.indexOf('<span class="gi" style="color:#ff7b72;border:1px solid;border-radius:9px;padding:0 6px">Q7</span>') === -1
      || r.html.indexOf('>Non-calculator</span>') === -1 || r.html.indexOf('color:#c8a2ff') === -1 || r.html.indexOf('color:#ff7b72;border:1px solid;border-radius:9px;padding:0 6px">4 marks') === -1
      || said(r.html).indexOf('Learning Questions Maths Worksheet SATs KS2 Year 3 Perimeter Q1') === -1 || /Maths · Perimeter/.test(said(r.html))
      || /\b(Ready|Usable|Rough)\b/.test(said(r.html)))
    bad.push('each question is not the site\'s card — two #0b0b0b cards in a #101010 pane, every tag a pill in its facet\'s colour (Q7 and its marks red, the sitting purple — every facet coloured since 396), no health band (383), and no paper heading over them: ' + cards + ' card(s); ' + said(r.html).slice(0, 300));
  asked++;
  /* THE BLACK SCREEN, SAID: the page, the summary's pane and every card fill their own cells, so a dark inbox has nothing to guess. */
  if (!/^<!DOCTYPE html><html lang="en" style="background:#000"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>:root\{color-scheme:dark/.test(r.html)
      || !/<body class="body" bgcolor="#000"[^>]*><table role="presentation" class="kb" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000"/.test(r.html)
      || !/u\+\.body \.gs\{background:#000;mix-blend-mode:screen\}u\+\.body \.gd\{background:#000;mix-blend-mode:difference\}/.test(r.html) || !/<div class="gs"><div class="gd">/.test(r.html) || r.html.indexOf('[data-ogsb] .kb{background-color:#000!important}') === -1
      || r.html.indexOf('class="kp" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#101010"') === -1
      || r.html.indexOf('bgcolor="#1a1a1a" style="border:1px solid #383838') === -1 || /#ffffff|#f4f1e8|#2b2620/.test(r.html))
    bad.push('the email is not the site\'s black screen, said dark to every client — color-scheme dark, the body and every frame cell #000 with Outlook\'s [data-ogsb] defences, the Gmail app\'s inversion undone by screen and difference (457), the page #000, the summary\'s pane #101010, their answer in a dark box, no paper');
}

/* ---------- 12. THE DRY RUN (check/digest-dry.js) STILL RUNS, SENDS NOTHING AND WRITES NOWHERE IT MAY NOT § */
{
  const os = require('os'), { spawnSync } = require('child_process');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'digest-dry-'));
  try {
    const w = markWorld();
    const SC = w.b.ev('SCHEMA');
    const grid = (name, rows) => [SC[name].slice()].concat(rows.map(o => SC[name].map(c => (o[c] === undefined ? '' : o[c]))));
    const P = (id, first, last, role, email) => ({ person_id: id, first_name: first, last_name: last, role: role, email: email, handle: (first + '_x_1').toLowerCase(), pin: '0000', verified: 'TRUE' });
    const dump = { ledger: {
      people: grid('people', [P('P-K1', 'Kit', 'Example', 'student', 'kit.e@example.test'), P('P-P1', 'Pat', 'Example', 'client', 'pat@example.test')]),
      family: grid('family', [{ link_id: 'F1', parent_id: 'P-P1', child_id: 'P-K1', state: 'accepted' }]),
      config: grid('config', [{ key: 'weekly_digest', value: 'off' }]),
      submissions: grid('submissions', [
        { person_id: 'P-K1', key: 'q:TST-1', label: 'Biology · Paper X · Q1', words: 'Explain why the rate increases at 30°C.', answer: "'heat", verdict: 'sent', submitted_at: '14/10/2026 17:10:00', event_id: '1760458200000-dr0001' },
        { person_id: 'P-K1', key: 'q:TST-4', label: 'Maths · Paper X · Q4', words: 'Draw the graph.', answer: "'a line", verdict: 'sent', submitted_at: '2026-10-15T15:00:00Z', event_id: '1760540400000-dr0002' },
      ]),
      digest_log: grid('digest_log', []),
    } };
    fs.writeFileSync(path.join(tmp, 'sheets.json'), JSON.stringify(dump));
    fs.writeFileSync(path.join(tmp, 'lib.json'), LIB_TEXT);
    const go = out => spawnSync(process.execPath, [path.join(REPO, 'check', 'digest-dry.js'), '--sheets', path.join(tmp, 'sheets.json'),
      '--week', '2026-10-14', '--out', out, '--library', path.join(tmp, 'lib.json')], { encoding: 'utf8' });
    asked++;
    const r = go(path.join(tmp, 'out'));
    let one = null;
    try { one = JSON.parse(fs.readFileSync(path.join(tmp, 'out', '01.json'), 'utf8')); } catch (e) { one = null; }
    /* EACH QUESTION AS THE SITE DRAWS IT (18 Oct): the dry run plans with the library as the run does. */
    if (r.status !== 0 || !one || one.to !== 'pat@example.test' || one.text.indexOf('Q1 · 3 marks\nExplain why the rate increases at 30°C.\nKit: not marked') === -1
        || one.text.indexOf('Q4 · 2 marks\nDraw the graph.\nKit: not marked') === -1 || !/nothing was sent/.test(r.stdout) || !/prints each verdict as it was recorded/.test(r.stdout) || !/2 answer\(s\) say "not marked"/.test(r.stdout))
      bad.push('check/digest-dry.js on an invented week did not write Pat’s email with each verdict as recorded ("not marked" for both `sent` answers) (exit ' + r.status + '): ' + (r.stdout + r.stderr).slice(0, 300));
    asked++;
    const inside = go(path.join(REPO, 'check', 'dry-out-should-not-exist'));
    if (inside.status === 0 || fs.existsSync(path.join(REPO, 'check', 'dry-out-should-not-exist')) || !/refusing/.test(inside.stderr))
      bad.push('check/digest-dry.js wrote inside the repository — the emails carry real addresses, and this repository is public');
    /* A FOLDER IN THE REPOSITORY WHOSE NAME STARTS WITH TWO DOTS is still inside it (it was let through). */
    asked++;
    const dots = go(path.join(REPO, '..dry-out-should-not-exist'));
    if (dots.status === 0 || fs.existsSync(path.join(REPO, '..dry-out-should-not-exist')) || !/refusing/.test(dots.stderr))
      bad.push('check/digest-dry.js wrote into a folder inside the repository named "..dry-out-should-not-exist"');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    /* AND WHAT A BROKEN TOOL WROTE WHERE IT MUST NOT, so a red run leaves no invented emails in the tree. */
    fs.rmSync(path.join(REPO, 'check', 'dry-out-should-not-exist'), { recursive: true, force: true });
    fs.rmSync(path.join(REPO, '..dry-out-should-not-exist'), { recursive: true, force: true });
  }
}

/* ---------- 14. "SEND LAST WEEK" — AN ADMIN'S PRESS ON A PARENT'S CARD (378) ----------------------------------- */
{
  const { b, mail, setClock } = seeded();             // weekly_digest is off: the press sends anyway
  setClock(at('2026-10-06T08:00:00Z'));               // a Tuesday, so last week is 28 Sep – 4 Oct
  const tok = {};
  ['a1@example.org', 'pat@example.org'].forEach(e => { tok[e] = b.post({ action: 'verifyLogin', email: e, pin: '0000' }).token; });
  const press = (t, id) => b.post({ action: 'digestSendNow', token: t, targetId: id });
  const log = () => rowsOf(b, 'digest_log');
  asked++;
  const no = press(tok['pat@example.org'], 'P-C1');
  if (no.success || !no.error || mail.sent.length || log().length) bad.push('a parent pressed digestSendNow and was answered ' + JSON.stringify(no).slice(0, 160) + ' — it is an admin’s alone');
  asked++;
  const ok = press(tok['a1@example.org'], 'P-C1');
  if (!ok.success || ok.said !== 'Sent to Pat — 3 questions (28 Sep – 4 Oct)') bad.push('the admin’s press for Pat answered ' + JSON.stringify(ok));
  if (mail.sent.map(m => m.to).join() !== 'pat@example.org' || !/^Ada’s week/.test((mail.sent[0] || {}).subject || '')) bad.push('the press emailed [' + mail.sent.map(m => m.to + ' ' + m.subject) + '], wanted Ada’s week to pat@ only');
  const row = log().find(r => r.parent_id === 'P-C1');
  if (!row || row.status !== 'sent' || row.week_of !== '2026-09-28' || row.learner_id !== 'P-S1' || !/by hand/.test(row.note) || log().length !== 1)
    bad.push('the press logged ' + JSON.stringify(log()) + ' — wanted one row, week 2026-09-28, Ada, sent, "sent by hand"');
  asked++;
  const again = press(tok['a1@example.org'], 'P-C1');
  if (!again.success || mail.sent.length !== 2 || log().length !== 1) bad.push('a second press did not send again over its own receipt (' + mail.sent.length + ' sent, ' + log().length + ' row(s))');
  /* AND THE SUNDAY RUN, switched on, does not send Pat that week a third time. */
  cfgSet(b, 'weekly_digest', 'send');
  const sun = run(b, SUN);
  if (mail.sent.filter(m => m.to === 'pat@example.org').length !== 2 || sun.already !== 1) bad.push('the Sunday run after a press re-sent Pat’s week: ' + JSON.stringify(sun));
  asked++;
  const nomail = press(tok['a1@example.org'], 'P-C6');
  if (nomail.success || nomail.error !== 'Nan has no email address — add it with Edit') bad.push('a parent with no address answered ' + JSON.stringify(nomail));
  asked++;
  const quiet = press(tok['a1@example.org'], 'P-C7');
  if (!quiet.success || quiet.said !== 'Nothing to send: Eve did no questions 28 Sep – 4 Oct') bad.push('a quiet week answered ' + JSON.stringify(quiet));
  const sent = mail.sent.length;
  if (sent !== 3) bad.push('after the presses ' + sent + ' emails went, wanted Pat twice and Bo once (Sunday)');
  if (b.ev('typeof sendLastWeekTo') !== 'function' || b.ev('typeof sendLastWeekToAll') !== 'function') bad.push('the editor’s sendLastWeekTo / sendLastWeekToAll are missing');
  else {
    asked++;
    const r = JSON.parse(JSON.stringify(b.ev('clearCache(); sendLastWeekTo("@patparent")')));
    if (!/^Sent to Pat/.test(r.said || '') || mail.sent.length !== sent + 1) bad.push('sendLastWeekTo("@patparent") answered ' + JSON.stringify(r));
  }
  /* AND A SHORT SPAN INSIDE ONE MONTH. */
  if (b.ev('digestShortSpan_({ start: "2026-10-12", end: "2026-10-18" })') !== '12–18 Oct') bad.push('the toast’s week is not "12–18 Oct"');
}

/* ---------- 15. THEIR ANSWER AND THE RIGHT ANSWER, FOR EVERY KIND OF QUESTION (20 Oct, docs/history/380) ------------------- */
{
  const { b, G } = world();
  const ask = (fn, row, a) => { G.__row = row; G.__a = a; return JSON.parse(JSON.stringify(b.ev(fn + '(__row' + (a === undefined ? '' : ', __a') + ')'))); };
  const KINDS = [
    ['a typed answer the library accepts', { answer: '<b>0.0197</b> &mdash; B1 for the method.', accept: '0.0197 | 0.01967' }, '0.02', '0.02', '0.0197'],
    ['the mark scheme up to its dash', { answer: '<b>Yes</b>: the floor is 68&nbsp;m<sup>2</sup> &mdash; M1 for 68.' }, 'yes', 'yes', 'Yes: the floor is 68 m^2'],
    ['only what it accepts', { accept: '3x(3x + 2) | 3x(2 + 3x)' }, '3x(3x+2)', '3x(3x+2)', '3x(3x + 2)'],
    ['tapped options', { choices: 'Banana | Plum | Apple | Pear', choice_right: '1,4' }, '1,2', 'Banana and Plum', 'Banana and Pear'],
    ['an order', { answer_type: 'order', choices: '0.21 | 0.2 | 0.03', choice_right: '3,2,1', order_ends: 'smallest | largest' }, '2,3,1', '0.2, 0.03, 0.21', '0.03, 0.2, 0.21'],
    ['cells', { cells: 'Top = pentagon ; 2nd = triangle|3 sides' }, 'pentagon ; square', 'Top = pentagon; 2nd = square', 'Top = pentagon; 2nd = triangle'],
    ['a drawing', { answer_type: 'drawing', draw_answer: '{"items":[]}', answer: 'A straight line through (0, 1) &mdash; B1.' }, 'drawing \u00b7 3 marks \u00b7 #ab12', 'a drawing (it is on the site)', 'A straight line through (0, 1)'],
    /* A LONG ONE IS CUT AT A WORD, SAID WITH "…": 400 characters of theirs, 280 of the scheme's. */
    ['a long essay', { answer: 'Any '.repeat(120) }, 'I think '.repeat(80), t => t.length <= 400 && /\S…$/.test(t), t => t.length <= 281 && /\S…$/.test(t)],
  ];
  KINDS.forEach(([what, row, a, theirs, right]) => {
    asked++;
    const T = ask('digestTheirAnswer_', row, a), R = ask('digestRightAnswer_', row);
    const okT = T && (typeof theirs === 'function' ? theirs(T.text) : T.text === theirs), okR = R && (typeof right === 'function' ? right(R.text) : R.text.indexOf(right) === 0);
    if (!okT || !okR || /<b>/.test(R.html))
      bad.push('for ' + what + ' the email says "Their answer: ' + (T && T.text) + '" and "Answer: ' + (R && R.text) + '" — wanted "' + theirs + '" and "' + right + '…"');
  });
  asked++;
  /* A CHILD'S OWN TYPING THAT IS A LINK OR AN ADDRESS GOES AS "ON THE SITE", as a question's words would. */
  ['see pay.example.com', 'mail me at x@y.org'].forEach(a => {
    const T = ask('digestTheirAnswer_', null, a);
    if (!T || /example|@/.test(T.text + T.html)) bad.push('a typed answer that is a link or an address went into the email: ' + JSON.stringify(T));
  });
  asked++;
  if (ask('digestRightAnswer_', { html: '<p>Say anything.</p>' }) !== null || ask('digestTheirAnswer_', null, '  ') !== null)
    bad.push('a row with no answer, or an empty press, printed an "Answer:" or "Their answer:" line');
  /* HOW A QUESTION WENT, the summary's four ways, by the week's last word only — right or not, never how many goes (20 Oct). */
  asked++;
  const how = [['right', 'right'], ['ai:3/3', 'right'], ['ai:2/3', 'part'], ['rule:0/2', 'wrong'], ['wrong', 'wrong'], ['sent', 'open'], ['', 'open']]
    .filter(([v, want]) => b.ev('digestHow_(' + JSON.stringify(v) + ')') !== want);
  if (how.length) bad.push('digestHow_ misreads ' + JSON.stringify(how));
  /* THE TOPICS LINE WHEN THE LIBRARY HAS NO TAGS (the owner, 20 Oct): a Corbettmaths week is its worksheets' names; a paper is never "Paper …", only its subject. */
  asked++;
  const sum = (items, lib) => { G.__i = items; G.__lib = lib; return JSON.parse(JSON.stringify(b.ev('digestSummary_(__i, ["2026-10-14"], __lib, { start: "2026-10-12", end: "2026-10-18" })'))); };
  const cbm = (sheet, n, v) => ({ key: 'q:Q-CBM-' + sheet.toLowerCase().replace(/ /g, '-') + '-' + n, label: 'Maths · ' + sheet + ' · Q' + n, verdict: v });
  const week = [cbm('Perimeter', 1, 'right'), cbm('Perimeter', 2, 'wrong'), cbm('Perimeter', 3, 'right'), cbm('Rounding', 1, 'right'),
                cbm('Rounding', 2, 'right'), cbm('Square Numbers', 1, 'wrong'), Object.assign(cbm('Perimeter', 4, 'right'), { label: 'Maths · Perimeter · Q4 · Worksheet' })];
  const libOf = rows => ({ rows: rows, pre: [] });
  const asRow = (id, name, type, extra) => Object.assign({ row_id: id, kind: 'question', active: 'True', html: '<p>A question.</p>', name: name, subject: 'Maths', document_type: type }, extra || {});
  const C1 = sum(week, null), C2 = sum(week, libOf({ 'Q-CBM-perimeter-1': asRow('Q-CBM-perimeter-1', 'Perimeter', 'Worksheet'), 'Q-CBM-rounding-1': asRow('Q-CBM-rounding-1', 'Rounding', 'Worksheet') }));
  [['labels only', C1], ['library rows with no topics', C2]].forEach(([how, C]) => {
    if (C.lines.indexOf('Topics: Perimeter, Rounding and Square Numbers.') === -1 || C.lines[0] !== '5 right and 2 not right.'
        || said(C.html).indexOf('Summary of the week 5 right and 2 not right. Topics: Perimeter, Rounding and Square Numbers') !== 0)
      bad.push('a Corbettmaths week (' + how + ') does not say "Topics: Perimeter, Rounding and Square Numbers": ' + JSON.stringify(C.lines) + ' / ' + said(C.html).slice(0, 200));
  });
  const papers = [{ key: 'q:Q-PX-7', label: 'Maths · Paper X · Q7', verdict: 'right' }, { key: 'q:Q-1MA1-2406-1F-9a', label: 'Maths · Paper 1F (Non-calculator) — June 2024 · Q9a', verdict: 'wrong' },
                  { key: 'q:Q-CBM-5AD-F-0726-4', label: 'Maths · 5-a-day Foundation — 26 July · Q4', verdict: 'sent' }];
  const P1 = sum(papers, null), P2 = sum(papers, libOf({ 'Q-1MA1-2406-1F-9a': asRow('Q-1MA1-2406-1F-9a', 'Paper 1 (Non-calculator) — June 2024', 'Past paper') }));
  [['labels only', P1], ['a library row with no topics', P2]].forEach(([how, P]) => {
    if (P.lines.indexOf('Topics: Maths.') === -1 || /paper|june|july|2024|5-a-day/i.test(P.lines.join(' ') + said(P.html)))
      bad.push('exam papers with no topics (' + how + ') are not "Topics: Maths", or a paper’s name, month or year reached the summary: ' + JSON.stringify(P.lines));
  });
  /* A TAGGED QUESTION IS ITS TAGS; THE WEEK'S PAPERS THEN ADD NO BARE SUBJECT; AND A WEEK NOTHING NAMES STILL HAS ITS LINE. */
  const M = sum(papers.concat([cbm('Perimeter', 1, 'right')]), libOf({ 'Q-PX-7': asRow('Q-PX-7', 'Paper X', 'Past paper', { topics: 'Types of Angle' }) }));
  const N = sum([{ key: 'q:Q-Z-1', label: '', hidden: true, verdict: 'right' }], null);
  if (M.lines.indexOf('Topics: Perimeter and Types of Angle.') === -1 || N.lines.indexOf('Topics: not recorded.') === -1)
    bad.push('a mixed week is not "Topics: Perimeter and Types of Angle", or a week nothing names has no topics line: ' + JSON.stringify([M.lines, N.lines]));
}

console.log('rules asked: ' + asked);
if (bad.length) {
  console.log('FAILED — ' + bad.length + ' thing(s) the weekly parent email gets wrong:');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — a London week, only that week, only accepted parents; a summary first, then each question as a card with its own words, how it went (✓, ✗, the AI’s marks, "not marked"), their answer and the right one, never a key, a handle or a surname, at most 80 and under Gmail’s clip; off nothing, preview the log, send once each;\n'
  + '     each verdict as the press recorded it, never a Gemini call or a mark appended by the email’s run; ONE trigger, 9pm on Sunday, booked by nobody but the owner, the old marking passes taken away; a setup check that changes nothing; the dry run sends nothing; the preview an admin’s.');
