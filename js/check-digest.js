#!/usr/bin/env node
/* ==================================================================================================
   node js/check-digest.js — THE WEEKLY PARENT EMAIL, ASKED OF THE REAL BACKEND WHILE IT IS SWITCHED OFF

   ASKED FOR AS *"something which triggers every sunday. it checks what the student has done that week
   and records the questions and send it in an email to parents. for now dont actually make it but make
   the infrastructure"*. So nothing here has ever emailed anybody, and that is exactly why it needs a
   check: the first time it runs for real is a Sunday evening with forty families on the other end, and
   every rule below fails by sending — to the wrong person, twice, or at all when it was meant not to.

     · A WEEK IS MONDAY TO SUNDAY IN LONDON, including the two Sundays the clocks change, and a run on a
       Monday sends the week that just ended rather than starting one with nothing in it.
     · ONLY THAT WEEK'S ATTEMPTS, grouped per learner, new and done-again apart, with the name the phone
       sent (and the key when it sent none).
     · ONLY THE LEARNER'S ACCEPTED PARENTS WITH AN ADDRESS. Not a pending link, not a refused one, not
       another family's parent, not the learner; a parent whose `weekly_email` says no is skipped; a
       learner nobody can be told about is listed with the reason and emailed to nobody.
     · OFF DOES NOTHING. PREVIEW WRITES THE LOG AND SENDS NOTHING. SEND SENDS ONE PER PARENT PER LEARNER,
       AND A SECOND RUN SENDS NONE — the log row is the receipt. The daily quota keeps its reserve, and
       what it held back goes on the next run, once.
     · `installWeeklyDigest` LEAVES EXACTLY ONE SUNDAY TRIGGER AT THE CONFIGURED HOUR, London, however
       many times it is run, and touches no other trigger. NOTHING CALLS IT, or the run, from anywhere.
     · `digestPreview` IS AN ADMIN'S, and writes, sends and books nothing.
     · `markDone` KEEPS THE LABEL: tags out, capped, set where the row is written anyway — and a day
       already covered still writes nothing.

   THROUGH THE REAL BACKEND on `check-gas-load.js`, with MailApp, ScriptApp and the clock stubbed so
   that nothing here can reach a mailbox, a project or the time of day. The people are invented and
   their PINs are 0000.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
/* THE WORLD — MailApp, ScriptApp, the lock and a London clock over the real backend — is
   `check-mail-load.js` now, lifted out of this file when the email after a session needed the same
   one. The weekly receipt (`digest_log`, keyed by `week_of`) is its default. */
const { world, cfgSet, rowsOf, at, strip, calls, unquote, mentions } = require('./check-mail-load.js');

const bad = [];
let asked = 0;
const REPO = path.resolve(__dirname, '..');

const run = (b, s) => JSON.parse(JSON.stringify(b.ev('clearCache(); digestRun_(new Date(' + at(s) + '))')));

/* ---------- THE PEOPLE, THE FAMILIES AND A WEEK OF WORK ----------------------------------------------
   THE WEEK IS MON 28 SEP – SUN 4 OCT 2026, and the run is that Sunday at 18:00 in London (17:00 UTC —
   it is still summer time). Ada did five things around it: two new inside it (the Monday-after-the-
   Sunday-before and the Sunday itself), one done again inside it, one entirely the week before, and one
   on the Monday after. Her family is every kind of link there is. */
const SUN = '2026-10-04T17:00:00Z';
function seeded(opts) {
  const w = world(opts);
  const { b } = w;
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
  const A = (pid, q, first, last, label, times) => ({ person_id: pid, question_key: q, first_done: first, last_done: last,
    times: times || 1, label: label || '' });
  b.seed('attempts', [
    A('P-S1', 'q:ADA-1', '2026-09-28', '2026-09-28', 'Maths · Paper 1 (Calculator) — June 2024 · Q1'),
    A('P-S1', 'q:ADA-SUN', '2026-10-04', '2026-10-04', 'Fractions & decimals · Q2'),
    A('P-S1', 'q:ADA-AGAIN', '2026-09-10', '2026-10-02', '', 3),
    A('P-S1', 'q:ADA-SUN-BEFORE', '2026-09-27', '2026-09-27', 'The Sunday before'),
    A('P-S1', 'q:ADA-MON-AFTER', '2026-10-05', '2026-10-05', 'The Monday after'),
    A('P-S2', 'q:BEN-1', '2026-10-01', '2026-10-01', 'Ben’s own'),
    A('P-S3', 'q:CAL-1', '2026-10-02', '2026-10-02', 'Cal’s'),
    A('P-S4', 'q:DEE-1', '2026-10-03', '2026-10-03', 'Dee’s'),
    A('P-S5', 'q:EVE-OLD', '2026-09-20', '2026-09-20', 'Eve’s, last week'),
  ]);
  return w;
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
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
  const L = id => plan.learners.find(x => x.id === id);
  const ada = L('P-S1');
  const keys = list => (list || []).map(q => q.key).sort().join(', ');
  if (!ada) bad.push('Ada did three things this week and is not in the plan');
  else {
    if (keys(ada.fresh) !== 'q:ADA-1, q:ADA-SUN') bad.push('Ada’s new this week is [' + keys(ada.fresh) + '], wanted q:ADA-1 (the Monday) and q:ADA-SUN (the Sunday) — the week is Monday to Sunday inclusive');
    if (keys(ada.again) !== 'q:ADA-AGAIN') bad.push('Ada’s done-again is [' + keys(ada.again) + '], wanted q:ADA-AGAIN (first done 10 Sep, again 2 Oct)');
    if (/BEFORE|AFTER/.test(keys(ada.fresh) + keys(ada.again))) bad.push('a question from the Sunday before or the Monday after is in Ada’s week');
    const again = (ada.again || [])[0];
    if (again && again.label !== 'q:ADA-AGAIN') bad.push('a row with no label reads "' + again.label + '" — wanted the key, q:ADA-AGAIN');
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
    ['Hello Pat,', '28 Sep – 4 Oct', 'Maths · Paper 1 (Calculator) — June 2024 · Q1', 'q:ADA-AGAIN', 'New this week', 'Gone back to',
     'https://halexdias31-pixel.github.io/family/', 'To stop these emails',
     /* WORDED FOR WHAT THE SHEET KNOWS: a first keystroke is "worked on", not "did"; the run is at 18:00 so
        the week is "up to 6pm"; and it is the child, not the parent, who can see them on the site. */
     'Ada worked on 3 questions', '28 Sep – 4 Oct, up to 6pm on Sunday', 'Ada can see them on the site'].forEach(s => {
      if (pat.text.indexOf(s) === -1) bad.push('Pat’s email does not say "' + s + '"');
    });
    if (/\bdid \d/.test(pat.text) || /See them on the site/.test(pat.text)) bad.push('Pat’s email still says the child "did" N questions, or tells the parent to see them — ' + pat.text.split('\n')[2]);
    if (pat.html.indexOf('Fractions &amp; decimals') === -1) bad.push('the HTML body does not escape a label’s "&"');
    if (/<script|Fractions & decimals/.test(pat.html)) bad.push('the HTML body carries a label unescaped');
  }
}

/* ---------- 3. THE LABEL MARKDONE KEEPS ------------------------------------------------------------------ */
{
  const { b } = world();
  b.seed('people', [{ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org',
                       role: 'student', pin: '0000', verified: 'TRUE' }]);
  const tok = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' }).token;
  if (!tok) bad.push('could not sign Ada in, so the label was NOT checked');
  const done = items => { asked++; return b.post({ action: 'markDone', token: tok, items: items }); };
  const row = q => rowsOf(b, 'attempts').find(r => r.question_key === q) || {};
  done([{ key: 'q:L1', day: '2026-09-29', label: '<b>Maths</b>  ·  Paper 1\n· Q3<script>x</script>' }]);
  if (row('q:L1').label !== 'Maths · Paper 1 · Q3 x') bad.push('a label with tags in it was kept as "' + row('q:L1').label + '" — wanted the tags out and the spaces folded');
  done([{ key: 'q:L2', day: '2026-09-29', label: 'x'.repeat(400) }]);
  if (String(row('q:L2').label).length !== 120) bad.push('a 400-character label was kept at ' + String(row('q:L2').label).length + ' — wanted the cap of 120');
  done([{ key: 'q:L3', day: '2026-09-29' }]);
  if (row('q:L3').label !== '') bad.push('a question sent with no label has "' + row('q:L3').label + '"');
  const same = done([{ key: 'q:L3', day: '2026-09-29', label: 'Late name' }]);
  if (same.writes !== 0) bad.push('a label arriving for a day already covered wrote ' + same.writes + ' cell(s) — that day must still write nothing');
  done([{ key: 'q:L3', day: '2026-09-30', label: 'Late name' }]);
  if (row('q:L3').label !== 'Late name') bad.push('the next day’s send did not fill a blank label: "' + row('q:L3').label + '"');
  done([{ key: 'q:L3', day: '2026-10-01', label: 'A different name' }]);
  if (row('q:L3').label !== 'Late name') bad.push('a label already on the row was overwritten with "' + row('q:L3').label + '"');
}

{
  /* A LIVE TAB FROM BEFORE THE `label` COLUMN — synced, the version stamps unmoved, so `autoMigrate`
     has not added it. `addRow` reports every key with no column and `jsonOut` makes that an error, so
     every `markDone` came back "Nothing was saved for: attempts.label", labelled or not, with the row
     in fact written. The name is a nicety; the day must still save, and say it did. */
  const { b } = world();
  b.tabs.attempts[0] = b.tabs.attempts[0].filter(c => c !== 'label');
  b.seed('people', [{ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org',
                       role: 'student', pin: '0000', verified: 'TRUE' }]);
  const tok = b.post({ action: 'verifyLogin', email: 's1@example.org', pin: '0000' }).token;
  [[{ key: 'q:N1', day: '2026-09-29', label: 'Maths · Q1' }], [{ key: 'q:N2', day: '2026-09-29' }],
   [{ key: 'q:N2', day: '2026-09-30', label: 'Maths · Q2' }]].forEach(items => {
    asked++;
    const d = b.post({ action: 'markDone', token: tok, items: items });
    if (!d.success || d.error) bad.push('with no label column, markDone ' + JSON.stringify(items) + ' answered ' + JSON.stringify(d).slice(0, 200) + ' — the day was written and must be reported saved');
  });
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
  const A = (pid, q, label) => ({ person_id: pid, question_key: q, first_done: '2026-10-01', last_done: '2026-10-01', times: 1, label: label || '' });
  b.seed('attempts', [
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
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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
    /* A LABEL TURNED AWAY FALLS BACK TO THE KEY WHEN THE KEY IS THE LIBRARY'S SHAPE (q:BEN-2); the key
       that is a sentence is not printed at all, and is the "1 more". */
    if (!/Ben worked on 5 questions/.test(bo.text) || !/…and 1 more\./.test(bo.text) || !/- q:BEN-2\n/.test(bo.text)) bad.push('Bo’s email does not count what it does not print ("Ben worked on 5 questions", "- q:BEN-2", "…and 1 more."): ' + bo.text.split('\n').slice(2, 9).join(' / '));
  }
  /* AND THE CHILD'S OWN FIRST NAME, which goes in the subject and is a cell the child edits. */
  asked++;
  const g = b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-S2')[h.indexOf('first_name')] = 'Pay now at www.pay.example';
  b.ev('clearCache()');
  const plan2 = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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
  if (m0 && (!m0.htmlBody || !m0.body || m0.name !== '@family.')) bad.push('the email went without both bodies or the business’s name: ' + JSON.stringify(Object.keys(m0)));
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
  /* THE `sent` WRITE FAILS AFTER THE EMAIL WENT — a sheet timeout on the one cell. It was inside the
     same `try` as the send, so the `catch` wrote `failed` over the receipt and the next run emailed the
     parent again. It must leave `sending`, and a rerun must count that as sent. */
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
  /* A RUN THAT DID NOT FINISH THROWS. Google throws a trigger's return value away and emails the owner
     only on an exception, so a busy lock or a held email returned quietly was a run marked
     "Completed" — and a held email nobody noticed by next Sunday is never sent. */
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

/* ---------- 5b. NO `attempts` TAB IS NOT A QUIET WEEK ------------------------------------------------------------
   THE OWNER'S LEDGER HAD NO `attempts` TAB UNTIL 6 OCT, and `read` answers a missing tab with no rows —
   so this run planned nothing, wrote nothing, and the Preview said "Nobody has done a question yet this
   week" over a sheet that had never been told what anybody did. It must stop and say why, send nothing,
   write nothing, and throw from the trigger so the owner is emailed the reason. */
{
  const { b, mail, setClock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  delete b.tabs.attempts;
  b.ev('clearCache()');
  asked++;
  const w0 = b.log.writes;
  const r = run(b, SUN);
  if (!/attempts tab/.test(String(r.error)) || !/setup=1/.test(String(r.error))) bad.push('with no attempts tab the Sunday run answered ' + JSON.stringify(r).slice(0, 200) + ' — wanted an error naming the attempts tab and /exec?setup=1');
  if (mail.sent.length || b.log.writes !== w0) bad.push('with no attempts tab the run sent ' + mail.sent.length + ' and wrote ' + (b.log.writes - w0) + ' cell(s) — it must do neither');
  setClock(at(SUN));
  let threw = '';
  try { b.ev('clearCache(); weeklyDigestRun({})'); } catch (e) { threw = String(e && e.message || e); }
  if (!/attempts tab/.test(threw)) bad.push('weeklyDigestRun with no attempts tab did not throw saying so: "' + threw + '"');
  asked++;
  const tok = b.post({ action: 'verifyLogin', email: 'a1@example.org', pin: '0000' }).token;
  const pv = b.post({ action: 'digestPreview', token: tok });
  if (pv.attempts !== false || !/attempts tab/.test(String(pv.warning))) bad.push('the Preview with no attempts tab answered attempts ' + pv.attempts + ', warning "' + pv.warning + '" — wanted false and the reason');
  /* AND WITH THE TAB, IT SAYS SO THE OTHER WAY. */
  const ok = seeded();
  const tok2 = ok.b.post({ action: 'verifyLogin', email: 'a1@example.org', pin: '0000' }).token;
  const pv2 = ok.b.post({ action: 'digestPreview', token: tok2 });
  if (pv2.attempts !== true || pv2.warning) bad.push('the Preview with an attempts tab answered attempts ' + pv2.attempts + ', warning "' + pv2.warning + '"');
}
{
  /* TWO EMAILS, TWO "STOP"s. A parent who stopped the email after each session (`session_email` = no,
     backend/recap.gs) has not stopped Sunday's — `weekly_email` is blank on Pat's row, which is on. */
  const { b, mail } = seeded();
  const g = b.tabs.people, h = g[0];
  g.find((r, i) => i > 0 && r[h.indexOf('person_id')] === 'P-C1')[h.indexOf('session_email')] = 'no';
  cfgSet(b, 'weekly_digest', 'send');
  asked++;
  run(b, SUN);
  if (!mail.sent.some(m => m.to === 'pat@example.org')) bad.push('Pat, whose session_email says no and weekly_email is blank, was not sent the weekly email — the two opt-outs are separate');
}

/* ---------- 6. BOOKING THE SUNDAY ---------------------------------------------------------------------------- */
{
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  const mine = () => trig.filter(t => t.spec.fn === 'weeklyDigestRun');
  asked++;
  b.ev('installWeeklyDigest()');
  let t = mine();
  if (t.length !== 1 || t[0].spec.weekDay !== 'SUNDAY' || t[0].spec.hour !== 18 || t[0].spec.tz !== 'Europe/London') bad.push('installWeeklyDigest with no hour set booked ' + JSON.stringify(t.map(x => x.spec)) + ' — wanted one Sunday trigger at 18, Europe/London');
  cfgSet(b, 'weekly_digest_hour', '7');
  b.ev('installWeeklyDigest()');
  b.ev('installWeeklyDigest()');
  t = mine();
  if (t.length !== 1 || t[0].spec.hour !== 7) bad.push('installWeeklyDigest run twice more at hour 7 left ' + JSON.stringify(t.map(x => x.spec)) + ' — wanted exactly one, at 7');
  ['25', 'six', '-1'].forEach(v => {
    cfgSet(b, 'weekly_digest_hour', v);
    b.ev('installWeeklyDigest()');
    if (mine().length !== 1 || mine()[0].spec.hour !== 18) bad.push('weekly_digest_hour "' + v + '" booked ' + JSON.stringify(mine().map(x => x.spec.hour)) + ' — wanted the fallback, 18');
  });
  if (!trig.some(x => x.spec.fn === 'closeFinishedJobs')) bad.push('installWeeklyDigest deleted somebody else’s trigger');
  const gone = b.ev('removeWeeklyDigest()');
  if (mine().length || gone.removed !== 1 || !trig.some(x => x.spec.fn === 'closeFinishedJobs')) bad.push('removeWeeklyDigest left ' + mine().length + ' Sunday trigger(s), or took another');
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
  /* NOT ONE CALL, anywhere, to what books or runs it — its own declarations and the run's one caller
     aside — AND NOT ONE BARE MENTION, which is a call waiting to happen: `sunday: installWeeklyDigest,`
     in RUNNABLE calls nothing in the text and books the Sunday from `?run=sunday`. `calls`, `mentions`
     and `unquote` are check-mail-load.js's, shared with check-recap.js. */
  back.concat(front).forEach(([f, src]) => {
    ['installWeeklyDigest', 'weeklyDigestRun', 'removeWeeklyDigest'].forEach(n => {
      const c = Math.max(calls(src, n).length, mentions(src, n).length);
      const allowed = f === 'backend/digest.gs' && n === 'removeWeeklyDigest' ? 1 : 0;
      if (c > allowed) bad.push(f + ' names ' + n + ' outside its declaration — nothing may book or run the Sunday email but the owner, by hand');
    });
    if (f !== 'backend/digest.gs' && calls(src, 'digestRun_').length) bad.push(f + ' calls digestRun_() — only the trigger’s weeklyDigestRun may');
    if (f !== 'backend/digest.gs' && /DIGEST_RUN|['"]weeklyDigestRun['"]/.test(src) && f !== 'backend/constants.gs') bad.push(f + ' names the Sunday handler — a second place that could book it');
  });
  const dg = (back.find(([f]) => f === 'backend/digest.gs') || [])[1] || '';
  const nt = [...dg.matchAll(/newTrigger\s*\(/g)];
  const inst = dg.indexOf('function installWeeklyDigest');
  const instEnd = dg.indexOf('\nfunction ', inst + 1);
  if (nt.length !== 1 || nt[0].index < inst || nt[0].index > instEnd) bad.push('digest.gs books a trigger outside installWeeklyDigest');
  const rn = b => b.ev('Object.keys(typeof RUNNABLE === "object" ? RUNNABLE : {}).join(",")');
  const { b } = world();
  if (/digest|Digest/.test(rn(b))) bad.push('RUNNABLE names a digest function — `?run=` would be a way to start it from a URL');
  /* ITS VALUES TOO: a key called `sunday` holding installWeeklyDigest is the same door with another name. */
  if (b.ev('Object.values(typeof RUNNABLE === "object" ? RUNNABLE : {}).some(f => f === installWeeklyDigest || f === weeklyDigestRun || f === digestRun_ || /igest/.test(String(f && f.name)))'))
    bad.push('a RUNNABLE entry is a digest function under another name — `?run=` would start it from a URL');
  const def = b.ev('(CONFIG_DEFAULTS.find(r => r[0] === "weekly_digest") || [])[1]');
  if (def !== 'off') bad.push('weekly_digest arrives as "' + def + '" on the config tab — it must arrive off');
  if (b.ev('digestMode_(config())') !== 'off') bad.push('an empty config tab is not off');
  const install = b.ev('typeof installTriggers === "function" ? installTriggers.toString() : ""');
  if (/igest/.test(install)) bad.push('installTriggers mentions the digest — /exec?triggers=1 would book it');
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
  }
  if (pv.writes || mail.sent.length || trig.length || rowsOf(b, 'digest_log').length !== logBefore) bad.push('digestPreview wrote ' + pv.writes + ' cell(s), sent ' + mail.sent.length + ', booked ' + trig.length + ' trigger(s) — it must do none of them');
  [['a student', tok['s1@example.org']], ['a parent', tok['pat@example.org']], ['nobody signed in', '']].forEach(([who, t]) => {
    asked++;
    const d = b.post({ action: 'digestPreview', token: t });
    if (d.success || d.emails || !d.error) bad.push(who + ' asked for digestPreview and was answered ' + JSON.stringify(d).slice(0, 160) + ' — it is an admin’s, it carries every address');
  });
}

console.log('rules asked: ' + asked);
if (bad.length) {
  console.log('FAILED — ' + bad.length + ' thing(s) the weekly parent email gets wrong:');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — a London week, only that week, only accepted parents; off nothing, preview the log, send once each; one Sunday trigger, booked by nobody but the owner; the preview an admin’s.');
