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
     · ONLY THAT WEEK'S SUBMISSIONS (since 9 Oct — `attempts` before), one line per question however many
       times it was sent, grouped per learner, new and gone-back-to apart, with the name the phone sent —
       and never the key in its place: a question with no name is counted, not listed.
     · EACH WITH THE WEEK'S LATEST VERDICT AS A MARK — ✓, ✗, `sent`, the AI's `3/4` — the owner's *"Just
       whether it's right or not"*: the last press of the week decides it, a press after the week does
       not, and a press before it makes the question "(again)".
     · ONLY THE LEARNER'S ACCEPTED PARENTS WITH AN ADDRESS. Not a pending link, not a refused one, not
       another family's parent, not the learner; a parent whose `weekly_email` says no is skipped; a
       learner nobody can be told about is listed with the reason and emailed to nobody.
     · OFF DOES NOTHING. PREVIEW WRITES THE LOG AND SENDS NOTHING. SEND SENDS ONE PER PARENT PER LEARNER,
       AND A SECOND RUN SENDS NONE — the log row is the receipt. The daily quota keeps its reserve, and
       what it held back goes on the next run, once.
     · `installWeeklyDigest` LEAVES EXACTLY ONE SUNDAY TRIGGER AT THE CONFIGURED HOUR, London, however
       many times it is run, and touches no other trigger. NOTHING CALLS IT, or the run, from anywhere.
     · `digestPreview` IS AN ADMIN'S, and writes, sends and books nothing.
     · `submitAnswer` KEEPS THE LABEL: tags out, capped — and a tab made without the column still takes
       the press.
     · THE PLAN CARRIES EACH QUESTION'S WORDS (SCHEMA.submissions `words`): a practical's latest box that
       has any, none that hold a link, an address or a domain anywhere in them — the question still
       listed by its name — and none on an item not printed.
     · AND THE EMAIL PRINTS THEM, since the owner made it the one parents get (*"should be at the end
       of the week that it send to parents all they done that week"*): each question under its paper
       as "Q4a: <its ask>", the stem its parts share once, refused words gone and the number kept, a
       paper with no words its line of numbers, "(again)", escaped, never a raw key, at most
       `DIGEST_WEEK_LIST_MAX` and then "…and N more." — and 80 of the longest under Gmail's clip.
     · `installWeeklyDigest` TAKES AWAY THE REMOVED EMAIL'S HOURLY CHECK (`DIGEST_RETIRED_RUNS`), and
       only that, and says so.
     · `DIGEST_WORDS_REFUSE` RULE BY RULE — a one-letter domain, a dot that is not a full stop, a
       mobile, a landline as it is written, an account number, a sort code — words only under a key in
       the library's shape, and EVERY QUESTION AND STEM IN data/questions.json, as the phone sends it,
       refused by none of them.

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
  /* ONE ROW PER PRESS (SCHEMA.submissions). Ada sent q:ADA-1 three times in the week — right on the
     Monday and the Wednesday, wrong on the Friday — and once more, right, on the Monday after, which is
     next week's: the week's mark is the Friday's ✗, neither the week's first press nor next week's.
     q:ADA-SUN was right on the Sunday afternoon, before the 18:00 run. */
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
function S(pid, key, day, label, verdict, words, hh) {
  return { person_id: pid, key: key, label: label || '', words: words || '', answer: 'an answer',
           verdict: verdict || 'right', submitted_at: new Date(day + 'T' + String(hh == null ? 12 : hh).padStart(2, '0') + ':00:00Z'),
           event_id: (1759000000000 + (++SEQ)) + '-dg' + String(SEQ).padStart(4, '0') };
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
    if (keys(ada.again) !== 'q:ADA-AGAIN') bad.push('Ada’s gone-back-to is [' + keys(ada.again) + '], wanted q:ADA-AGAIN (sent on 10 Sep, again on 2 Oct)');
    /* THE WEEK'S LATEST VERDICT, ONE LINE PER QUESTION: q:ADA-1 was sent three times in the week and once
       the Monday after — one item, the Friday's `wrong`; never the week's first press, Monday's `right`,
       and never next week's `right`. */
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
    ['Hello Pat,', '28 Sep – 4 Oct', '\nMaths · Paper 1 (Calculator) — June 2024\nQ1 ✗\n', '\nFractions & decimals\nQ2 ✓\n', '\n…and 1 more.\n',
     '— 2 new and 1 gone back to.', 'https://halexdias31-pixel.github.io/family/', 'To stop these emails',
     /* WORDED FOR WHAT THE SHEET KNOWS: a first keystroke is "worked on", not "did"; the run is at 18:00 so
        the week is "up to 6pm"; and it is the child, not the parent, who can see them on the site. */
     'Ada worked on 3 questions', '28 Sep – 4 Oct, up to 6pm on Sunday', 'Ada can see them on the site'].forEach(s => {
      if (pat.text.indexOf(s) === -1) bad.push('Pat’s email does not say "' + s + '"');
    });
    if (/q:ADA/.test(pat.subject + pat.text + pat.html)) bad.push('Pat’s email prints a raw key — a question with no name is counted in "…and N more", never listed by its key: ' + pat.text.split('\n').slice(4, 12).join(' / '));
    if (/\bdid \d/.test(pat.text) || /See them on the site/.test(pat.text)) bad.push('Pat’s email still says the child "did" N questions, or tells the parent to see them — ' + pat.text.split('\n')[2]);
    if (pat.html.indexOf('Fractions &amp; decimals') === -1) bad.push('the HTML body does not escape a label’s "&"');
    /* ABOUT ONE CHILD, FROM THE BUSINESS: no other child, no tutor, no price. */
    const other = /\b(Ben|Cal|Dee|Eve|Hal)\b|£|\b[Tt]utor\b/;
    if (other.test(pat.subject + pat.text + pat.html)) bad.push('Pat’s email about Ada names another child, a tutor or a price: ' + (pat.text.split('\n').find(x => other.test(x)) || pat.subject));
    if (/<script|Fractions & decimals/.test(pat.html)) bad.push('the HTML body carries a label unescaped');
  }
}

/* ---------- 2a. A PRESS IS IN THE WEEK BY LONDON'S CALENDAR, NOT BY UTC'S --------------------------------------
   `submitted_at` is an instant, and in summer London is an hour ahead of it: 23:00 UTC on Sunday 4 Oct is
   midnight starting Monday 5 Oct in London — next week's — and 23:00 UTC on Sunday 27 Sep is the first
   minute of Monday 28 Sep, this week's. Eve's only other row is the week before. */
{
  const { b } = seeded();
  b.seed('submissions', [
    S('P-S5', 'q:EVE-EARLY', '2026-09-27', 'Maths · Late · Q1', 'right', '', 23),
    S('P-S5', 'q:EVE-LATE', '2026-10-04', 'Maths · Late · Q2', 'right', '', 23),
  ]);
  asked++;
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
  const eve = plan.learners.find(x => x.id === 'P-S5');
  const got = eve ? [].concat(eve.fresh || [], eve.again || []).map(q => q.key).sort().join(', ') : '';
  if (got !== 'q:EVE-EARLY') bad.push('Eve’s week is [' + got + '] — wanted q:EVE-EARLY alone: 00:00 on Monday 28 Sep in London is this week, and 00:00 on Monday 5 Oct is next week, whatever UTC says');
}

/* ---------- 2b. THE QUESTION'S WORDS: CARRIED, REFUSED WHEN THEY ARE A MESSAGE, AND PRINTED ---------------------
   *"emails all parents on work their child has done with the exact questions for each"*, and then *"should
   be at the end of the week that it send to parents all they done that week"* — so Sunday's email prints
   each question's `words`, and it gets them from this plan: this is where a practical's three boxes become
   one question's words and where phone text is turned away. The refusal is `digestWordsSafe_`, over the
   WHOLE text: `digestSafe_` reads `attemptLabel_(s)`, which is the first 120 characters, and a question
   with a link on its second line passes it. A refusal costs the words and never the question: it is still
   listed, by its number under its paper, and still counted.

   THIS ASKED, UNTIL 8 OCT, THAT SUNDAY'S EMAIL WAS THE SAME TO THE BYTE WITH AND WITHOUT WORDS — it listed
   names then. What that protected still holds and is asked below in its new shape: words never change
   what is counted, which questions are listed or under which paper — they only add what each one asked. */
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
  const planOf = () => JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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
        || bo.html.indexOf('<p><b>Maths · Probability</b></p><p><i>A bag holds 3 red and 5 blue counters.</i></p><p><b>Q4a ✓</b> — Work out the probability of red.</p>') === -1)
      bad.push('Sunday’s email does not print a question’s words under its paper — the stem, then "Q4a ✓: <its ask>": ' + bo.text.split('\n').slice(4, 20).join(' / '));
    if (bo.text.indexOf('\nChemistry · Required practical · Rates of reaction\nWorksheet ✓: What is the dependent variable?\n') === -1)
      bad.push('a practical’s worksheet is not printed with the first box’s words: ' + bo.text.split('\n').slice(4, 20).join(' / '));
    /* REFUSED WORDS ARE NOT PRINTED, AND THE QUESTION STILL IS — by its number under its paper. */
    asked++;
    if (bo.text.indexOf('\nMaths · Equations\nQ2 ✓, Q3 ✓, Q4 ✓, Q6 ✓\n') === -1 || bo.text.indexOf('\nMaths · Pythagoras\nQ5 ✓\n') === -1
        || bo.html.indexOf('<p><b>Maths · Equations</b><br>Q2 ✓, Q3 ✓, Q4 ✓, Q6 ✓</p>') === -1)
      bad.push('questions whose words were refused are not still listed by their numbers under their papers: ' + bo.text.split('\n').slice(4, 20).join(' / '));
    ['pay-family', 'office.family', 'family-answers', 'NOTICE', 'www.', 'For the answer', 'diagram shows'].forEach(x => {
      if (bo.text.indexOf(x) !== -1 || bo.html.indexOf(x) !== -1) bad.push('Sunday’s email prints refused words ("' + x + '") — phone text that is a message must not go out under the business’s name');
    });
    /* A QUESTION WITH NO NAME: neither its key nor its words, and counted in the "more". */
    asked++;
    if (/Work out 7|Tutor says/.test(bo.text + bo.html) || !/Ben worked on 9 questions/.test(bo.text) || bo.text.indexOf('\n…and 1 more.\n') === -1)
      bad.push('a question with no name printed its key or its words, or was not counted in "…and 1 more.": ' + bo.text.split('\n').slice(2, 20).join(' / '));
  }

  /* AND WORDS CHANGE NOTHING BUT THE WORDS — the question this file asked as "byte-identical" while the
     email listed names. With the column blank: the same subject, the same lead, the same papers and the
     same question numbers, each paper back to its line of numbers. */
  asked++;
  const g = b.tabs.submissions, wi = g[0].indexOf('words');
  g.slice(1).forEach(r => { r[wi] = ''; });
  const bare = planOf();
  const bo0 = bare.emails.find(m => m.to === 'bo@example.org');
  if (!bo || !bo0) bad.push('Bo is not sent Ben’s week, so Sunday’s email was NOT compared with and without words');
  else {
    if (bo.subject !== bo0.subject || bo.text.split('\n')[2] !== bo0.text.split('\n')[2]) bad.push('the words on the sheet change the subject or the lead: "' + bo.subject + '" / "' + bo0.subject + '"');
    const heads = t => t.split('\n').filter(x => / · /.test(x) || x === 'Ben’s own').join(' | ');
    if (heads(bo.text) !== heads(bo0.text)) bad.push('the words on the sheet change which papers are listed: ' + heads(bo.text) + ' — without words: ' + heads(bo0.text));
    if (bo0.text.indexOf('\nMaths · Probability\nQ4a ✓\n') === -1 || bo0.text.indexOf('\nChemistry · Required practical · Rates of reaction\nWorksheet ✓\n') === -1
        || /probability of red|dependent variable|---/.test(bo0.text + bo0.html))
      bad.push('with no words on the sheet the email does not list each question by its number alone: ' + bo0.text.split('\n').slice(4, 18).join(' / '));
  }
  if (!(bare.learners.find(x => x.id === 'P-S2') || { fresh: [] }).fresh.every(q => q.words === '')) bad.push('with the words column blank, an item still carries words');
}

/* ---------- 2c. WHAT A QUESTION NEVER SAYS, RULE BY RULE — AND THE WHOLE LIBRARY THROUGH IT ---------------------
   `DIGEST_WORDS_REFUSE` is wider than the name's rule, because the words are ten times longer and printed
   under "@family." in a parent's inbox: a domain with one letter before its dot, a dot that is not a full
   stop, a phone number, an account number, a sort code. Each one asked by itself, in the shape a person
   types it. And words go out only under a key in the library's own shape — an invented key is somebody
   typing into the sheet, and its "question" is whatever they typed. */
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
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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
  /* EVERY QUESTION AND STEM IN THE LIBRARY, AS THE PHONE SENDS IT — and not one refused. The comment over
     `DIGEST_WORDS_REFUSE` says each rule was measured so; this measures it every run, so a rule widened
     tomorrow cannot quietly cost real questions their words in every parent's email. The text is the
     phone's own: `doneWordsPlain_` and the constants above it, read out of js/find.js and run over jsdom,
     then `attemptWords_`, as submitAnswer keeps it — the html and the lead of every question and preamble. */
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
  try { qs = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'questions.json'), 'utf8')); } catch (e) { qs = []; }
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

/* ---------- 2d. THE WEEK'S LIST: ONE STEM, "(again)", ESCAPED, AT MOST 80, AND UNDER GMAIL'S CLIP ----------------
   `digestQuestions_` (backend/digest.gs) is the list, and these are its rules asked of the email a parent
   opens. A question's parts share a scene, printed ONCE above them, so Q5a, Q5b and Q5c read as the paper
   prints them rather than as one scene three times. A question first done before the week says "(again)".
   What came off a phone is escaped in the HTML and printed as written in the text. A week is up to seven
   days of this, so the list stops at `DIGEST_WEEK_LIST_MAX` (80) with "…and N more." — which counts the
   questions past the cap and the ones with no name alike — and 80 of the longest a question can be still
   come in under the ~102 KB of HTML past which Gmail clips a message and hides the footer that says how to
   stop. Read at the backend's own limits. */
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
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
  const m = plan.emails.find(e => e.to === 'bo@example.org') || { text: '', html: '' };
  asked++;
  if (m.text.indexOf('\nMaths · Paper 7\nQ3 ✓: Solve x > 3 and x < 7 & "y" for whole numbers x.\n' + STEM + '\nQ5a ✗: Find P(red).\nQ5b sent: Find P(blue).\nQ5c 2/3: Two beads are taken. Find P(both red).\n') === -1)
    bad.push('Paper 7 is not its heading, then "Q3 ✓: <its words>", then the stem its parts share and each part’s own ask, each with its mark — ✓, ✗, sent, the AI’s 2/3: ' + m.text.split('\n').slice(4, 14).join(' / '));
  asked++;
  const times = t => t.split(STEM).length - 1;
  if (times(m.text) !== 1 || times(m.html) !== 1 || m.html.indexOf('<p><i>' + STEM + '</i></p><p><b>Q5a ✗</b> — Find P(red).</p><p><b>Q5b sent</b> — Find P(blue).</p>') === -1)
    bad.push('the stem Q5a, Q5b and Q5c share is printed ' + times(m.text) + ' time(s) in the text and ' + times(m.html) + ' in the HTML — wanted once each, above the first of them');
  asked++;
  if (m.text.indexOf('\nQ9 (again) ✓: Expand (x + 2)(x - 3).\n') === -1 || m.html.indexOf('<b>Q9 (again) ✓</b> — Expand (x + 2)(x - 3).') === -1)
    bad.push('a question first sent before the week is not "Q9 (again) ✓: <its words>", with this week’s mark and not the fortnight-old ✗: ' + JSON.stringify(m.text.split('\n').find(x => /^Q9/.test(x))));
  asked++;
  if (m.html.indexOf('<b>Q3 ✓</b> — Solve x &gt; 3 and x &lt; 7 &amp; &quot;y&quot; for whole numbers x.') === -1 || /x < 7 &|"y"/.test(m.html))
    bad.push('the HTML does not escape a question’s words — "<", ">", "&" and quotes came off a phone: ' + JSON.stringify((m.html.match(/<b>Q3<\/b>[^<]*/) || [''])[0]));
}
{
  /* THE CAP, THROUGH THE REAL RUN'S PLAN: Eve (whose only other row is last week's) did 85 named questions
     and 2 with no name. 80 are listed, in number order, and "…and 7 more." counts the five past the cap
     and the two that were never printable. */
  const { b } = seeded();
  const MAX = b.ev('DIGEST_WEEK_LIST_MAX');
  asked++;
  if (MAX !== 80) bad.push('DIGEST_WEEK_LIST_MAX is ' + MAX + ' — wanted 80: a week’s work, measured under Gmail’s clip (constants.gs)');
  const rows = [];
  for (let i = 1; i <= 85; i++) rows.push(S('P-S5', 'q:EVE-C' + i, '2026-10-02', 'Maths · Paper 8 · Q' + i, 'right', 'Work out ' + i + ' + ' + i + '.'));
  rows.push(S('P-S5', 'q:EVE-NONAME-1', '2026-10-02', '', 'right', 'Work out 99 × 7.'));
  rows.push(S('P-S5', 'Somebody typed this', '2026-10-02', '', 'right', ''));
  b.seed('submissions', rows);
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
  const m = plan.emails.find(e => e.to === 'yes@example.org') || { text: '', html: '', subject: '' };
  const listed = m.text.split('\n').filter(x => /^Q\d+ ✓: Work out/.test(x));
  asked++;
  if (listed.length !== 80 || listed[0] !== 'Q1 ✓: Work out 1 + 1.' || listed[79] !== 'Q80 ✓: Work out 80 + 80.' || /\nQ8[1-5] /.test(m.text))
    bad.push('87 questions listed ' + listed.length + ' (' + JSON.stringify([listed[0], listed[listed.length - 1]]) + ') — wanted 80, Q1 to Q80 in number order, and none past');
  asked++;
  if (m.subject !== 'Eve’s week: 87 questions' || !/Eve worked on 87 questions/.test(m.text) || m.text.indexOf('\n…and 7 more.\n') === -1
      || m.html.indexOf('<p>…and 7 more.</p>') === -1 || /q:EVE|Somebody typed|99 × 7/.test(m.text + m.html))
    bad.push('the cap does not count what it left out — wanted "Eve’s week: 87 questions" and "…and 7 more." (Q81–Q85 and the two with no name, neither printed by key nor by words): subject "' + m.subject + '", ' + JSON.stringify(m.text.split('\n').filter(x => /…and/.test(x))));
}
{
  /* AND 80 OF THE LONGEST A QUESTION CAN BE STILL COME IN UNDER GMAIL'S CLIP: each on its own paper of 110
     characters, its own stem past `DIGEST_STEM_SHOWN` and its own ask past `DIGEST_WORDS_SHOWN`, with a
     sprinkling of what `digestEsc_` grows. Rendered by the real `digestRender_`. Over ~102 KB of HTML Gmail
     shows "[Message clipped]" and the footer that says how to stop is behind it. The floor beside it is
     that the words really were printed at length — a render that dropped them would pass the ceiling. */
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
  if (!(kb < 102) || kb < 40 || r.html.indexOf('<p>…and 5 more.</p>') === -1 || !/To stop these emails/.test(r.html))
    bad.push('80 of the longest questions make ' + kb.toFixed(1) + ' KB of HTML — wanted under Gmail’s ~102 KB clip (and over 40, the words printed at length), "…and 5 more." and the footer after them');
}

/* ---------- 3. THE LABEL submitAnswer KEEPS -------------------------------------------------------------
   The name a parent reads came off a phone, so the row keeps it by the email's own rule (`attemptLabel_`):
   tags out, spaces folded, capped. It was `markDone`'s to keep until 9 Oct, with a rule for filling a
   blank cell on a day already covered; a press is a row of its own now, written once with whatever name
   came with it, so that rule went with the upsert. */
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
  /* A TAB MADE BY HAND WITHOUT THE `label` AND `words` COLUMNS. `addRow` reports every key with no column
     and `jsonOut` makes that an error, so a name written regardless would answer "Nothing was saved for:
     submissions.label" over a row that was in fact written. The name and the words are the email's; the
     press must still save, and say it did. */
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
    /* A LABEL TURNED AWAY IS NOT REPLACED BY THE KEY. This fell back to a key in the library's shape
       (q:BEN-2) while the email listed names; with each question's words a raw key reads to a parent as
       a fault. The three whose text came off the phone — two labels and a key that is a sentence — are
       not printed at all, and are the "3 more". */
    if (!/Ben worked on 5 questions/.test(bo.text) || !/\n…and 3 more\.\n/.test(bo.text) || /q:BEN|pr:PR/.test(bo.subject + bo.text + bo.html)
        || bo.text.indexOf('\nPhysics · AQA required practical · Specific heat capacity\nWorksheet ✓\n') === -1)
      bad.push('Bo’s email does not count what it does not print ("Ben worked on 5 questions", the practical by its name, "…and 3 more.", no raw key): ' + bo.text.split('\n').slice(2, 12).join(' / '));
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

/* ---------- 5b. NO `submissions` TAB IS NOT A QUIET WEEK ---------------------------------------------------------
   THE OWNER'S LEDGER HAD NO `attempts` TAB UNTIL 6 OCT, and `read` answers a missing tab with no rows —
   so the run planned nothing, wrote nothing, and the Preview said "Nobody has done a question yet this
   week" over a sheet that had never been told what anybody did. The same is true of `submissions`
   until `ensureSchema` makes it: the run must stop and say why, send nothing, write nothing, and throw
   from the trigger so the owner is emailed the reason. */
{
  const { b, mail, setClock } = seeded();
  cfgSet(b, 'weekly_digest', 'send');
  delete b.tabs.submissions;
  b.ev('clearCache()');
  asked++;
  const w0 = b.log.writes;
  const r = run(b, SUN);
  if (!/submissions tab/.test(String(r.error)) || !/setup=1/.test(String(r.error))) bad.push('with no submissions tab the Sunday run answered ' + JSON.stringify(r).slice(0, 200) + ' — wanted an error naming the submissions tab and /exec?setup=1');
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
  const lp = JSON.parse(JSON.stringify(left.b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
  if (lp.learners.length || /From the old tab|Old · Q1/.test(JSON.stringify(lp))) bad.push('the plan read the old attempts tab: ' + JSON.stringify(lp.learners).slice(0, 160));
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
{
  /* THE REMOVED EMAIL'S HOURLY CHECK GOES WHEN THE SUNDAY IS BOOKED. The email after each session was
     booked from the editor as an hourly trigger on `sessionRecapRun`, and that function is gone
     (docs/history/295): left booked, it fails every hour and Google emails the owner each failure. The
     owner runs `installWeeklyDigest` anyway, so it takes those away — by that exact handler name, written
     out here rather than read from `DIGEST_RETIRED_RUNS`, so a misspelling there is red — touches no other
     trigger, and its log line says so. Run again with none booked, it says there was none. */
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("sessionRecapRun").timeBased().everyHours(1).create()');
  b.ev('ScriptApp.newTrigger("sessionRecapRun").timeBased().everyHours(1).create()');
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest()')));
  const fns = trig.map(t => t.spec.fn).sort().join(', ');
  if (fns !== 'closeFinishedJobs, weeklyDigestRun') bad.push('after installWeeklyDigest the triggers are [' + fns + '] — wanted the old hourly check (sessionRecapRun, booked twice) gone, closeFinishedJobs kept, one Sunday');
  if (!/removed the old after-session email’s hourly check \(2 triggers\)/.test(String(out.oldHourly))) bad.push('installWeeklyDigest does not say it removed the old hourly check: ' + JSON.stringify(out.oldHourly));
  asked++;
  const again = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest()')));
  if (!/no old after-session email check was booked/.test(String(again.oldHourly)) || trig.map(t => t.spec.fn).sort().join(', ') !== 'closeFinishedJobs, weeklyDigestRun')
    bad.push('installWeeklyDigest run again, with no old check booked, said ' + JSON.stringify(again.oldHourly) + ' and left [' + trig.map(t => t.spec.fn) + ']');
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
     and `unquote` are check-mail-load.js's. */
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
    /* AND THAT IT IS THE BACKEND THAT PRINTS THE WORDS — the card tells an older deployed version apart by it. */
    if (pv.words !== true) bad.push('the preview does not answer words: true, so the card would tell this backend it lists names only');
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
console.log('OK — a London week, only that week, only accepted parents; each question with its own words, never a key, at most 80 and under Gmail’s clip; off nothing, preview the log, send once each; one Sunday trigger, booked by nobody but the owner, and the old hourly check taken away; the preview an admin’s.');
