#!/usr/bin/env node
/* ==================================================================================================
   node js/check-digest.js — THE SUNDAY PARENT EMAIL AND ITS MARKS, ASKED OF THE REAL BACKEND

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
     · EACH WITH THE WEEK'S LATEST VERDICT AS A MARK — ✓, ✗, the AI's "3 of 4 marks", "not marked" (it
       printed `sent` until 12 Oct) — the owner's *"Just whether it's right or not"*: the last press of
       the week decides it, a press after the week does not, and a press before it is still this week's,
       in the one list (the plan keeps it apart; the email no longer says "(again)").
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
       paper with no words its line of numbers, one list, escaped, never a raw key, at most
       `DIGEST_WEEK_LIST_MAX` and then "…and N more." — and 80 of the longest under Gmail's clip.
     · `installWeeklyDigest` TAKES AWAY THE REMOVED EMAIL'S HOURLY CHECK (`DIGEST_RETIRED_RUNS`), and
       only that, and says so.
     · `DIGEST_WORDS_REFUSE` RULE BY RULE — a one-letter domain, a dot that is not a full stop, a
       mobile, a landline as it is written, an account number, a sort code — words only under a key in
       the library's shape, and EVERY QUESTION AND STEM IN data/questions.json, as the phone sends it,
       refused by none of them.
     · SINCE 12 OCT (docs/history/348) — *"i want them to see if they got it right too"*:
         THE MARKING PASS (9): a `sent` worded answer of the week marked through Mark with AI's own
         `aiMarkAsk_`, with the question and scheme from the site's library, as one appended row with the
         answer's own arrival and pressed 1 ms after it, the child's card and the email showing it (a);
         never twice, never over a press made meanwhile, one pass at a time (b); no ask started past its
         four minutes, the rest finished by the next pass, 20 a pass (c); the fallback model after a 503,
         "not marked" after a total failure, a throw only for what the owner must mend (d); never the
         child's `ai_marks_per_day`, and off when any of its three switches or the key says so (e).
         THE EMAIL (10, f), as MailApp is handed it: no handle, surname, id, PIN, `sent`, link or key —
         and each question's words with ✓, ✗, "N of M marks" or "not marked".
         THE TRIGGERS (6, g): the email and its two marking passes, once each, and the way back.
         `checkSundayEmail` (11, h): every line it promises, and nothing changed.
         `check/digest-dry.js` (12): an invented week written to a folder, nothing sent, never in the repo.

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
/* THE HTML WITHOUT ITS INLINE STYLES — what the email says, asked apart from how it is dressed. */
const unstyled = h => String(h || '').replace(/ style="[^"]*"/g, '').replace(/<\/?span>/g, '').replace(/^<div>|<\/div>$/g, '');

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
    ['Hello,\n', '28 Sep – 4 Oct', '\nMaths · Paper 1 (Calculator) — June 2024\nQ1 ✗\n', '\nFractions & decimals\nQ2 ✓\n', '\n…and 1 more.\n',
     'To stop these emails',
     /* WORDED FOR WHAT THE SHEET KNOWS: a first keystroke is "worked on", not "did"; the run is at 18:00 so
        the week is "up to 6pm"; and the marks the list has are said once, in the lead. */
     'Ada worked on 3 questions this week', '28 Sep – 4 Oct, up to 6pm on Sunday', 'Beside each one is how it went: ✓ right or ✗ wrong.'].forEach(s => {
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

/* ---------- 2a2. THE WEEK'S LATEST IS BY TIME, NOT BY ROW, AND A TIE IS THE LATER ROW --------------------------
   THE REVIEW OF 9 OCT: every seed above was in time order with no two presses at one moment, so nothing
   pinned "latest" — `ms > J.at` for `>=` (the first of a tie wins) and the verdict taken from sheet order
   both stayed green. A tie is certain in use: one request's items share one `submitted_at`, and that is
   every offline flush and the whole queue a phone held until the backend could take it — wrong then
   right in one batch. The email must say what the child's card says (`submissionsBuild_` in doget.gs):
   the later row of a tie, and otherwise the latest PRESS (`pressed_at`), whatever row it is on. Eve,
   whose only other row is last week's, so these are her whole week:
     q:EVE-TIE    wrong then right, one `submitted_at`, no `pressed_at` (a row from before the column) → ✓
     q:EVE-REV    the later instant on the EARLIER row (right at 14:00, then wrong at 10:00)            → ✓
     q:EVE-PRESS  one flush (one `submitted_at`), pressed in the reverse of row order: wrong on Wednesday
                  on the first row, right on Tuesday on the second                                      → ✗
     q:EVE-PTIE   one flush, pressed in one instant, wrong then right                                   → ✓ */
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
  const plan = JSON.parse(JSON.stringify(b.ev('digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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

/* ---------- 2a. WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, NOT THE WEEK IT ARRIVED (review of 10 Oct) ----------
   `subMigrate_` (js/submit.js) sends what a child had done before 9 Oct as one press per question, once, the
   first time the backend can take it — so those rows ARRIVE the week the backend lands, pressed weeks
   before, under an id made from the person and the key (`1791504000000-m` and fourteen letters). Read by
   arrival, the first email after the update said "Ada worked on 4 questions" with three from September.
   Eve's week here, every row arriving on the Thursday:
     q:EVE-CARRIED   carried over (pressed 22 Sep), nothing since   → not in the email at all
     q:EVE-BOTH      carried over (pressed 23 Sep), pressed again this week → "(again)", this week's mark
     q:EVE-NEW       pressed this week only                          → new */
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
  const plan = JSON.parse(JSON.stringify(b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN) + ')))')));
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
        || unstyled(bo.html).indexOf('<p><b>Maths · Probability</b></p><p><i>A bag holds 3 red and 5 blue counters.</i></p><p><b>Q4a</b> ✓ — Work out the probability of red.</p>') === -1)
      bad.push('Sunday’s email does not print a question’s words under its paper — the stem, then "Q4a ✓: <its ask>": ' + bo.text.split('\n').slice(4, 20).join(' / '));
    if (bo.text.indexOf('\nChemistry · Required practical · Rates of reaction\nWorksheet ✓: What is the dependent variable?\n') === -1)
      bad.push('a practical’s worksheet is not printed with the first box’s words: ' + bo.text.split('\n').slice(4, 20).join(' / '));
    /* REFUSED WORDS ARE NOT PRINTED, AND THE QUESTION STILL IS — by its number under its paper. */
    asked++;
    if (bo.text.indexOf('\nMaths · Equations\nQ2 ✓, Q3 ✓, Q4 ✓, Q6 ✓\n') === -1 || bo.text.indexOf('\nMaths · Pythagoras\nQ5 ✓\n') === -1
        || unstyled(bo.html).indexOf('<p><b>Maths · Equations</b></p><p><b>Q2</b> ✓, <b>Q3</b> ✓, <b>Q4</b> ✓, <b>Q6</b> ✓</p>') === -1)
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
    const heads = t => t.split('\n').filter(x => / · /.test(x) || /^Ben’s own/.test(x)).join(' | ');
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
  const m = plan.emails.find(e => e.to === 'bo@example.org') || { text: '', html: '', subject: '' };
  asked++;
  if (m.text.indexOf('\nMaths · Paper 7\nQ3 ✓: Solve x > 3 and x < 7 & "y" for whole numbers x.\n' + STEM + '\nQ5a ✗: Find P(red).\nQ5b not marked: Find P(blue).\nQ5c 2 of 3 marks: Two beads are taken. Find P(both red).\n') === -1)
    bad.push('Paper 7 is not its heading, then "Q3 ✓: <its words>", then the stem its parts share and each part’s own ask, each with its mark — ✓, ✗, not marked, the AI’s 2 of 3 marks: ' + m.text.split('\n').slice(4, 14).join(' / '));
  /* "not marked", NEVER `sent` — the server's word for an answer nothing marked (12 Oct). */
  asked++;
  if (/\bsent\b/i.test(m.subject + m.text + m.html)) bad.push('the email says "sent" — the server’s word; a parent reads "not marked": ' + JSON.stringify(m.text.split('\n').find(x => /\bsent\b/i.test(x))));
  if (m.text.indexOf('Beside each one is how it went: ✓ right, ✗ wrong, or the marks an AI marker gave a written answer.') === -1)
    bad.push('the lead does not say what the marks mean — ✓, ✗ and the AI’s marks, once: ' + JSON.stringify(m.text.split('\n')[2]));
  asked++;
  const times = t => t.split(STEM).length - 1;
  if (times(m.text) !== 1 || times(m.html) !== 1 || unstyled(m.html).indexOf('<p><i>' + STEM + '</i></p><p><b>Q5a</b> ✗ — Find P(red).</p><p><b>Q5b</b> not marked — Find P(blue).</p>') === -1)
    bad.push('the stem Q5a, Q5b and Q5c share is printed ' + times(m.text) + ' time(s) in the text and ' + times(m.html) + ' in the HTML — wanted once each, above the first of them');
  asked++;
  /* A QUESTION FIRST SENT BEFORE THE WEEK IS STILL A QUESTION DONE THIS WEEK, in the one list, with this
     week's mark — and no "(again)", the site's word and not a parent's (12 Oct). */
  if (m.text.indexOf('\nQ9 ✓: Expand (x + 2)(x - 3).\n') === -1 || unstyled(m.html).indexOf('<b>Q9</b> ✓ — Expand (x + 2)(x - 3).') === -1 || /\(again\)/.test(m.text + m.html))
    bad.push('a question first sent before the week is not "Q9 ✓: <its words>" in the one list, with this week’s mark and not the fortnight-old ✗: ' + JSON.stringify(m.text.split('\n').find(x => /^Q9/.test(x))));
  asked++;
  if (unstyled(m.html).indexOf('<b>Q3</b> ✓ — Solve x &gt; 3 and x &lt; 7 &amp; &quot;y&quot; for whole numbers x.') === -1 || /x < 7 &|"y"/.test(m.html))
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
  /* (g) AND ITS TWO MARKING PASSES (12 Oct, docs/history/348): every night at DIGEST_MARK_NIGHT, and on
     the Sunday an hour before the email, both London, the second near the hour — `atHour` alone fires
     anywhere in the hour, and a pass at 17:58 is not before an email at 18:00. Run again, one of each;
     the hour 0 puts the pass on Saturday at 23; and the way back takes all three and nothing else. */
  const { b, trig } = seeded();
  b.ev('ScriptApp.newTrigger("closeFinishedJobs").timeBased().everyDays(1).atHour(3).create()');
  const marks = () => trig.filter(t => t.spec.fn === 'digestMarkRun').map(t => t.spec);
  const say = xs => JSON.stringify(xs.map(x => [x.everyDays ? 'daily' : x.weekDay, x.hour, x.minute, x.tz]));
  const nightly = xs => xs.filter(x => x.everyDays === 1 && x.hour === 2 && x.minute === 0 && x.tz === 'Europe/London' && !x.weekDay);
  const before = (xs, day, h) => xs.filter(x => x.weekDay === day && x.hour === h && x.minute === 0 && x.tz === 'Europe/London' && !x.everyDays);
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest()')));
  let m = marks();
  if (m.length !== 2 || nightly(m).length !== 1 || before(m, 'SUNDAY', 17).length !== 1)
    bad.push('installWeeklyDigest booked the marking as ' + say(m) + ' — wanted one every day at 2:00 near the hour and one on Sunday at 17:00 near the hour, London');
  if (!/every night at about 2:00 and on Sunday at about 17:00/.test(String(out.marking))) bad.push('installWeeklyDigest does not say when the marking runs: ' + JSON.stringify(out.marking));
  asked++;
  b.ev('installWeeklyDigest()'); b.ev('installWeeklyDigest()');
  m = marks();
  if (m.length !== 2 || nightly(m).length !== 1 || before(m, 'SUNDAY', 17).length !== 1 || trig.filter(t => t.spec.fn === 'weeklyDigestRun').length !== 1)
    bad.push('installWeeklyDigest run three times left ' + say(m) + ' and ' + trig.filter(t => t.spec.fn === 'weeklyDigestRun').length + ' Sunday email trigger(s) — wanted exactly one of each');
  asked++;
  cfgSet(b, 'weekly_digest_hour', '0');
  b.ev('installWeeklyDigest()');
  m = marks();
  if (before(m, 'SATURDAY', 23).length !== 1 || m.length !== 2) bad.push('with the email at midnight the pass before it is ' + say(m) + ' — wanted Saturday at 23:00');
  asked++;
  const gone = JSON.parse(JSON.stringify(b.ev('removeWeeklyDigest()')));
  const left = trig.map(t => t.spec.fn).sort().join(', ');
  if (left !== 'closeFinishedJobs' || gone.removed !== 1 || gone.marking !== 2)
    bad.push('removeWeeklyDigest left [' + left + '] and said ' + JSON.stringify(gone) + ' — wanted the email and both marking passes gone, closeFinishedJobs kept');
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
  if (fns !== 'closeFinishedJobs, digestMarkRun, digestMarkRun, weeklyDigestRun') bad.push('after installWeeklyDigest the triggers are [' + fns + '] — wanted the old hourly check (sessionRecapRun, booked twice) gone, closeFinishedJobs kept, one Sunday and its two marking passes');
  if (!/removed the old after-session email’s hourly check \(2 triggers\)/.test(String(out.oldHourly))) bad.push('installWeeklyDigest does not say it removed the old hourly check: ' + JSON.stringify(out.oldHourly));
  asked++;
  const again = JSON.parse(JSON.stringify(b.ev('installWeeklyDigest()')));
  if (!/no old after-session email check was booked/.test(String(again.oldHourly)) || trig.map(t => t.spec.fn).sort().join(', ') !== 'closeFinishedJobs, digestMarkRun, digestMarkRun, weeklyDigestRun')
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
    ['installWeeklyDigest', 'weeklyDigestRun', 'removeWeeklyDigest', 'digestMarkRun', 'checkSundayEmail'].forEach(n => {
      const c = Math.max(calls(src, n).length, mentions(src, n).length);
      const allowed = f === 'backend/digest.gs' && n === 'removeWeeklyDigest' ? 1 : 0;
      if (c > allowed) bad.push(f + ' names ' + n + ' outside its declaration — nothing may book or run the Sunday email but the owner, by hand');
    });
    if (f !== 'backend/digest.gs' && calls(src, 'digestRun_').length) bad.push(f + ' calls digestRun_() — only the trigger’s weeklyDigestRun may');
    if (f !== 'backend/digest.gs' && calls(src, 'digestMarkPass_').length) bad.push(f + ' calls digestMarkPass_() — only the marking trigger’s digestMarkRun may');
    if (f !== 'backend/digest.gs' && /DIGEST_RUN|DIGEST_MARK_RUN|['"](weeklyDigestRun|digestMarkRun)['"]/.test(src) && f !== 'backend/constants.gs') bad.push(f + ' names the Sunday or the marking handler — a second place that could book it');
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
  if (b.ev('Object.values(typeof RUNNABLE === "object" ? RUNNABLE : {}).some(f => f === installWeeklyDigest || f === weeklyDigestRun || f === digestRun_'
    + ' || f === digestMarkRun || f === digestMarkPass_ || f === checkSundayEmail || /igest|Sunday/.test(String(f && f.name)))'))
    bad.push('a RUNNABLE entry is a digest function under another name — `?run=` would start it from a URL');
  const def = b.ev('(CONFIG_DEFAULTS.find(r => r[0] === "weekly_digest") || [])[1]');
  if (def !== 'off') bad.push('weekly_digest arrives as "' + def + '" on the config tab — it must arrive off');
  if (b.ev('digestMode_(config())') !== 'off') bad.push('an empty config tab is not off');
  const install = b.ev('typeof installTriggers === "function" ? installTriggers.toString() : ""');
  if (/igest|Sunday|DIGEST_MARK/.test(install)) bad.push('installTriggers mentions the digest or its marking — /exec?triggers=1 would book it');
  /* AND THE MARKING SWITCH ARRIVES WITH A NOTE AND ON — on is safe because it is the second switch: nothing
     runs while weekly_digest is off (asked in section 9). */
  const mk = b.ev('CONFIG_DEFAULTS.find(r => r[0] === "weekly_digest_marking") || []');
  if (mk[1] !== 'on' || !/weekly_digest is preview or send/.test(String(mk[2])) || !/GEMINI_API_KEY/.test(String(mk[2])))
    bad.push('weekly_digest_marking is not on the config tab as on with its note: ' + JSON.stringify(mk));
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

/* ==================================================================================================
   9. THE MARKING PASS (12 Oct, docs/history/348) — *"i want them to see if they got it right too"*

   THROUGH THE REAL BACKEND, with Gemini, the site's library and the clock stubbed: `UrlFetchApp` answers
   the library's URL with an invented library in the file's own one-row-a-line layout, and Gemini's with
   a queue of replies (`net.queue`) or a mark of 2; every ask is recorded with the moment it started and
   whether the script lock was held; `Utilities.sleep` moves the clock instead of waiting. The week is the
   one the owner asked about — Mon 12 to Sun 18 Oct 2026 — and the pass runs at 16:55 on the Sunday, the
   hour before the email. Every person is invented and every PIN is 0000.
================================================================================================== */
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
const pass = w => JSON.parse(JSON.stringify(w.b.ev('clearCache(); digestMarkPass_(new Date())')));
const subsOf = w => rowsOf(w.b, 'submissions');
const marksOf = w => subsOf(w).filter(r => /^\d{10,16}-ai[a-z0-9]{10}$/.test(String(r.event_id)));
const latest = (w, pid) => JSON.parse(JSON.stringify(w.b.ev('clearCache(); submissionsBuild_(' + JSON.stringify(pid) + ', false)'))).mine || {};
const planOf18 = w => JSON.parse(JSON.stringify(w.b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date(' + at(SUN18) + ')))')));

/* ---------- 9a. A `sent` ANSWER OF THE WEEK IS MARKED, AND THE EMAIL SHOWS ITS MARK --------------------------- */
{
  const w = markWorld();
  const { b, net } = w;
  const kit = [
    MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'Particles move faster.', '2026-10-13'),
    MS('P-K1', 'q:TST-2', 'sent', 'English · Paper X · Q2a', 'Describe the river at dawn.', 'Mist lay on the water like a held breath.', '2026-10-14'),
    MS('P-K1', 'q:TST-3', 'sent', 'Maths · Paper X · Q3', 'Work out 3² + 7.', '16', '2026-10-15'),
    MS('P-K1', 'q:TST-4', 'sent', 'Maths · Paper X · Q4', 'Draw the graph.', 'a line', '2026-10-15'),
    MS('P-K1', 'q:TST-5', 'sent', 'Maths · Paper X · Q5', 'Pick one.', '2', '2026-10-15'),
    MS('P-K1', 'q:TST-6', 'sent', 'Maths · Paper X · Q6', 'Say anything.', 'hello', '2026-10-15'),
    MS('P-K1', 'q:TST-8', 'sent', 'Maths · Paper X · Q8', 'An old question.', 'old', '2026-10-15'),
    MS('P-K1', 'pr:PR-X1#iv', 'sent', 'Chemistry · Practical · Worksheet', 'What is the independent variable?', 'temperature', '2026-10-16'),
    MS('P-K1', 'q:TST-7', 'right', 'Maths · Paper X · Q7', 'Work out 4 × 4.', '16', '2026-10-16'),
    /* MARKED BY A PRESS OF MARK WITH AI — the child's own mark, left as it is. */
    MS('P-K1', 'q:TST-11', 'ai:1/3', 'Biology · Paper X · Q11', 'Explain the trend.', 'It goes up.', '2026-10-16'),
    /* SENT LAST WEEK, and the Sunday pass is this week's (a Monday's would reach it). */
    MS('P-K1', 'q:TST-B1', 'sent', 'Biology · Paper Y · Q1', 'Name part 1 of the cell.', 'nucleus', '2026-10-09'),
    /* CARRIED OVER FROM BEFORE THE SWITCH — history, never marked by the pass. */
    MS('P-K1', 'q:TST-B2', 'sent', 'Biology · Paper Y · Q2', 'Name part 2 of the cell.', 'wall', '2026-10-14', 11,
       { event_id: '1791504000000-mabcdefghijklmn', pressed_at: "'2026-09-20T10:00:00.000Z" }),
  ];
  b.seed('submissions', kit);
  const before = subsOf(w).length, props0 = JSON.stringify(b.props);
  asked++;
  const r = pass(w);
  if (r.marked !== 3 || r.asked !== 3) bad.push('the pass marked ' + r.marked + ' after ' + r.asked + ' asks — wanted the three worded `sent` answers of the week (Q1, Q2a, Q3): ' + JSON.stringify(r));
  const cannot = JSON.stringify(r.cannot);
  ['a drawing', 'a pick from a list with no right answer', 'no mark scheme', 'no longer in the library', 'a practical’s worksheet box, which has no mark scheme'].forEach(x => {
    if (!(x in (r.cannot || {}))) bad.push('the pass does not count "' + x + '" among what it cannot mark: ' + cannot);
  });
  if (net.lib !== 1 || net.libUrls[0].indexOf('https://halexdias31-pixel.github.io/family/data/questions.json?v=') !== 0)
    bad.push('the library was fetched ' + net.lib + ' time(s), from ' + JSON.stringify(net.libUrls) + ' — wanted once, from the site’s own data/questions.json');
  asked++;
  const m = marksOf(w);
  const byKey = k => m.find(x => x.key === k) || null;
  const src = k => subsOf(w).find(x => x.key === k && x.verdict === 'sent') || {};
  [['q:TST-1', 'ai:2/3'], ['q:TST-2', 'ai:2/8'], ['q:TST-3', 'ai:2/2']].forEach(([k, v]) => {
    const row = byKey(k), s0 = src(k);
    if (!row) { bad.push('no mark row for ' + k); return; }
    if (row.verdict !== v) bad.push(k + '’s mark is ' + row.verdict + ', wanted ' + v + ' — out of the question’s own marks');
    if (row.person_id !== 'P-K1' || String(row.answer) !== String(s0.answer) || row.label !== s0.label || row.words !== s0.words)
      bad.push(k + '’s mark row does not repeat the answer it marks (person, answer, label, words): ' + JSON.stringify(row).slice(0, 200));
    /* THE ANSWER'S OWN ARRIVAL — the raw cells, not `rowsOf`'s day — and pressed one millisecond after it. */
    const g = b.tabs.submissions, h = g[0], cell = (rw, c) => rw[h.indexOf(c)];
    const rawMark = g.find(rw => cell(rw, 'event_id') === row.event_id), rawSrc = g.find(rw => cell(rw, 'key') === k && cell(rw, 'verdict') === 'sent');
    const came = +new Date(cell(rawSrc, 'submitted_at'));
    if (+new Date(cell(rawMark, 'submitted_at')) !== came) bad.push(k + '’s mark has submitted_at ' + cell(rawMark, 'submitted_at') + ', the answer ' + cell(rawSrc, 'submitted_at') + ' — a mark written on Monday must not move a question into the new week');
    if (Date.parse(String(cell(rawMark, 'pressed_at')).replace(/^'/, '')) !== came + 1) bad.push(k + '’s mark is pressed at ' + cell(rawMark, 'pressed_at') + ' — wanted one millisecond after the answer it marks (' + new Date(came).toISOString() + ')');
  });
  if (m.some(x => /TST-(4|5|6|7|8|11|B1|B2)|PR-X1/.test(x.key))) bad.push('the pass wrote a mark for ' + m.filter(x => /TST-(4|5|6|7|8|11|B1|B2)|PR-X1/.test(x.key)).map(x => x.key).join(', ') + ' — a drawing, a pick, no scheme, a question gone from the library, the phone’s own Check, a press’s own AI mark, last week’s or carried-over work');
  if (subsOf(w).length !== before + 3) bad.push('the submissions tab went from ' + before + ' to ' + subsOf(w).length + ' rows — wanted three marks appended and nothing else changed');
  /* WHAT GEMINI WAS GIVEN — the question as the phone builds it (the paper's preamble, then the question's,
     then its ask, entities as characters, a power written out), the scheme with the examiner's note, and
     an essay asked as one. */
  asked++;
  const ask = k => net.asks.find(a => a.text.indexOf(kit.find(x => x.key === k).answer) !== -1) || null;
  const a1 = ask('q:TST-1'), a2 = ask('q:TST-2'), a3 = ask('q:TST-3');
  if (!a1 || a1.text.indexOf('<question>\nRead the source about the river.\n\nExplain why the rate increases at 30°C.\n</question>') === -1
      || a1.text.indexOf('<mark_scheme marks="3">\nParticles collide more often — more kinetic energy.\nExaminer’s note: Credit collision theory.\n</mark_scheme>') === -1
      || /A sample of river water|Another paper/.test(a1.text))
    bad.push('Gemini was not given Q1 as the phone gives it — the paper’s preamble, its ask, its scheme and note, and nothing of another question or paper: ' + JSON.stringify(a1 && a1.text).slice(0, 400));
  if (!a2 || a2.text.indexOf('Read the source about the river.\n\nA sample of river water is heated.\n\nDescribe the river at dawn.') === -1 || !/extended writing/.test(a2.system) || !(a2.schema.properties || {}).parts)
    bad.push('the eight-mark English answer was not asked as an essay with its preambles outermost first: ' + JSON.stringify(a2 && a2.text).slice(0, 300));
  if (!a3 || a3.text.indexOf('Work out 3^(2) + 7.') === -1 || /extended writing/.test(a3.system)) bad.push('the maths answer was not asked as a short answer with its power written out: ' + JSON.stringify(a3 && a3.text).slice(0, 200));
  if (net.asks.some(x => x.locked)) bad.push('Gemini was asked while the pass held the script lock — every child’s saved answer waits on that lock');
  /* THE CHILD'S CARD HAS THE MARK, and their phone's cached copy is told to rebuild (`SUBS_AT:<pid>`). */
  asked++;
  const mine = latest(w, 'P-K1');
  if (!mine['q:TST-1'] || mine['q:TST-1'].verdict !== 'ai:2/3' || !mine['q:TST-3'] || mine['q:TST-3'].verdict !== 'ai:2/2')
    bad.push('the child’s card does not show the marks as the latest: ' + JSON.stringify({ q1: mine['q:TST-1'], q3: mine['q:TST-3'] }));
  if (mine['q:TST-11'].verdict !== 'ai:1/3') bad.push('the child’s own Mark with AI press was replaced: ' + JSON.stringify(mine['q:TST-11']));
  if (!b.props['SUBS_AT:P-K1'] || JSON.parse(props0)['SUBS_AT:P-K1'] === b.props['SUBS_AT:P-K1']) bad.push('the pass did not move SUBS_AT:P-K1, so the child’s phone keeps its cached "Sent"');
  /* AND THE EMAIL READS THEM — and says "not marked" for what could not be marked. */
  asked++;
  const pat = planOf18(w).emails.find(e => e.to === 'pat@example.org') || { text: '', html: '' };
  ['Q1 2 of 3 marks: Explain why the rate increases at 30°C.', 'Q2a 2 of 8 marks: Describe the river at dawn.', 'Q3 2 of 2 marks: Work out 3² + 7.',
   'Q4 not marked: Draw the graph.', 'Q6 not marked: Say anything.', 'Q7 ✓: Work out 4 × 4.', 'Q11 1 of 3 marks: Explain the trend.',
   'Worksheet not marked: What is the independent variable?'].forEach(x => {
    if (pat.text.indexOf(x) === -1) bad.push('Pat’s email does not say "' + x + '" after the pass: ' + pat.text.split('\n').filter(l => /^Q|^Worksheet/.test(l)).join(' / '));
  });
}

/* ---------- 9b. NOTHING MARKED TWICE, AND A PRESS IS NEVER WRITTEN OVER ------------------------------------------
   A second pass asks nothing and writes nothing. Two passes at once: the second finds the first one's claim
   and does nothing. And the race: Sam presses Mark with AI on the very answer the pass is asking Gemini
   about — his press is the newer word, and the pass's mark is not written. */
{
  const w = markWorld();
  const { b, net } = w;
  b.seed('submissions', [
    MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'KIT-ANSWER'),
    MS('P-S9', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'SAM-ANSWER'),
  ]);
  net.during = ask => {
    if (ask.text.indexOf('SAM-ANSWER') === -1) return;
    b.seed('submissions', [MS('P-S9', 'q:TST-1', 'ai:3/3', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'SAM-ANSWER, better', '2026-10-18', 15,
      { pressed_at: "'" + new Date(w.now()).toISOString() })]);
  };
  asked++;
  const r1 = pass(w);
  if (r1.marked !== 1 || r1.newer !== 1) bad.push('with Sam pressing Mark with AI while the pass asked about his answer, the pass reported ' + JSON.stringify(r1) + ' — wanted Kit’s marked and Sam’s left to his own press');
  if (marksOf(w).some(x => x.person_id === 'P-S9')) bad.push('the pass wrote a mark for Sam over the press he made while it was asking');
  if ((latest(w, 'P-S9')['q:TST-1'] || {}).verdict !== 'ai:3/3') bad.push('Sam’s own press is not his latest after the pass: ' + JSON.stringify(latest(w, 'P-S9')['q:TST-1']));
  net.during = null;
  asked++;
  const rows = subsOf(w).length, asks = net.asks.length;
  const r2 = pass(w);
  if (r2.asked || r2.marked || subsOf(w).length !== rows || net.asks.length !== asks) bad.push('a second pass asked ' + r2.asked + ' and wrote ' + (subsOf(w).length - rows) + ' — nothing may be marked twice');
  asked++;
  b.seed('submissions', [MS('P-K1', 'q:TST-3', 'sent', 'Maths · Paper X · Q3', 'Work out 3² + 7.', '16')]);
  b.props.DIGEST_MARKING = JSON.stringify({ id: 'another', until: w.now() + 60000 });
  const r3 = pass(w);
  if (r3.asked || !/another marking pass/.test(String(r3.why))) bad.push('a pass while another holds the claim answered ' + JSON.stringify(r3) + ' — two passes at once would ask Gemini twice for one answer');
  /* A CLAIM OLDER THAN ANY RUN CAN BE IS A PASS APPS SCRIPT STOPPED, and is taken over; the pass gives its own back. */
  b.props.DIGEST_MARKING = JSON.stringify({ id: 'stopped', until: w.now() - 1 });
  const r4 = pass(w);
  if (r4.marked !== 1 || 'DIGEST_MARKING' in b.props) bad.push('a stale claim was not taken over, or the pass did not give its own back: ' + JSON.stringify(r4) + ' ' + JSON.stringify(b.props.DIGEST_MARKING));
}

/* ---------- 9c. INSIDE ITS TIME, AND THE NEXT PASS FINISHES THE REST -------------------------------------------
   Gemini taking 70 s an answer: asks at 0, 82 and 164 s (12 s apart), and none started past the four-minute
   budget, so three are marked and three are left; the next pass marks those. And the cap: 25 quick answers,
   20 a pass. */
{
  const w = markWorld();
  const { b, net } = w;
  const rows = [];
  for (let i = 1; i <= 6; i++) rows.push(MS('P-K1', 'q:TST-B' + i, 'sent', 'Biology · Paper Y · Q' + i, 'Name part ' + i + '.', 'part ' + i, '2026-10-1' + (i % 5 + 2)));
  b.seed('submissions', rows);
  net.per = 70000;
  const t0 = w.now();
  asked++;
  const r1 = pass(w);
  const late = net.asks.filter(a => a.at - t0 > b.ev('DIGEST_MARK_BUDGET_MS'));
  if (r1.marked !== 3 || r1.left !== 3 || r1.stopped !== 'time' || late.length)
    bad.push('with Gemini taking 70 s an answer the pass reported ' + JSON.stringify(r1) + ' with asks at ' + JSON.stringify(net.asks.map(a => (a.at - t0) / 1000)) + ' s — wanted 3 marked, 3 left, none started past 240 s');
  const r2 = pass(w);
  const r3 = pass(w);
  if (r2.marked !== 3 || r3.waiting !== 0 || marksOf(w).length !== 6) bad.push('the next pass did not finish the rest: ' + JSON.stringify([r2.marked, r3.waiting, marksOf(w).length]));
  asked++;
  const w2 = markWorld();
  const many = [];
  for (let i = 1; i <= 25; i++) many.push(MS('P-K1', 'q:TST-B' + i, 'sent', 'Biology · Paper Y · Q' + i, 'Name part ' + i + '.', 'part ' + i));
  w2.b.seed('submissions', many);
  const m1 = pass(w2), m2 = pass(w2);
  if (m1.marked !== 20 || m1.stopped !== 'max' || m2.marked !== 5) bad.push('25 answers were marked ' + m1.marked + ' (' + m1.stopped + ') then ' + m2.marked + ' — wanted 20 a pass (DIGEST_MARK_MAX), then the other 5');
  const gaps = w2.net.asks.slice(1, 20).map((a, i) => a.at - w2.net.asks[i].at);
  if (gaps.some(g => g < 12000)) bad.push('asks were made closer than DIGEST_MARK_GAP_MS apart: ' + JSON.stringify(gaps.slice(0, 5)));
}

/* ---------- 9d. A FULL FIRST MODEL FALLS BACK AS MARK WITH AI DOES; A TOTAL FAILURE LEAVES "not marked" ------- */
{
  const w = markWorld();
  const { b, net } = w;
  b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat')]);
  const first = b.ev('AI_MODEL'), back = b.ev('AI_MODEL_FALLBACK');
  net.queue = [{ code: 503 }, { code: 503 }, { code: 503 }, { code: 200, body: { awarded: 3, feedback: 'Yes.' }, version: back }];
  asked++;
  const r = pass(w);
  const models = net.asks.map(a => a.model);
  if (r.marked !== 1 || r.model !== back || models.join() !== [first, first, first, back].join() || (marksOf(w)[0] || {}).verdict !== 'ai:3/3')
    bad.push('a 503 from the first model did not fall back as Mark with AI does: asked ' + JSON.stringify(models) + ', reported ' + JSON.stringify(r));
  asked++;
  const w2 = markWorld();
  w2.b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat'),
                            MS('P-K1', 'q:TST-3', 'sent', 'Maths · Paper X · Q3', 'Work out 3² + 7.', '16')]);
  for (let i = 0; i < 12; i++) w2.net.queue.push({ code: 503 });
  const f = pass(w2);
  let threw = '';
  try { w2.b.ev('clearCache(); digestMarkRun({})'); } catch (e) { threw = String(e && e.message || e); }
  const pat = planOf18(w2).emails.find(e => e.to === 'pat@example.org') || { text: '' };
  if (f.marked || f.stopped !== 'busy' || f.left !== 2 || marksOf(w2).length || threw)
    bad.push('with Gemini full on both models the pass reported ' + JSON.stringify(f) + (threw ? ' and the trigger threw "' + threw + '"' : '') + ' — wanted nothing written, both left for the next pass, and no failure email for a busy Gemini');
  if (pat.text.indexOf('Q1 not marked: Explain why') === -1 || pat.text.indexOf('Q3 not marked: Work out') === -1)
    bad.push('after a total failure the email does not say "not marked": ' + pat.text.split('\n').filter(l => /^Q/.test(l)).join(' / '));
  /* REFUSED — the key or the account — is the owner's: the trigger throws, so Google emails them. */
  asked++;
  const w3 = markWorld();
  w3.b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat')]);
  w3.net.queue = [{ code: 400 }];
  let why = '';
  try { w3.b.ev('clearCache(); digestMarkRun({})'); } catch (e) { why = String(e && e.message || e); }
  if (!/Gemini refused to mark/.test(why) || !/checkSundayEmail/.test(why) || marksOf(w3).length) bad.push('a 400 from Gemini did not make the marking trigger throw for the owner: "' + why + '"');
  /* A REPLY WITH NO MARK IN IT is about that answer: asked again next pass, then left after two. */
  asked++;
  const w4 = markWorld();
  w4.b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat')]);
  w4.net.queue = [{ code: 200, body: 'not json at all' }, { code: 200, body: 'still not' }];
  const n1 = pass(w4), n2 = pass(w4), n3 = pass(w4);
  if (n1.nomark !== 1 || n2.nomark !== 1 || n3.asked !== 0 || !('Gemini gave no mark for it, twice' in (n3.cannot || {})))
    bad.push('a reply with no mark was not asked again once and then left: ' + JSON.stringify([n1.nomark, n2.nomark, n3.asked, n3.cannot]));
}

/* ---------- 9e. THE CHILD'S ai_marks_per_day IS NOT SPENT, AND OFF IS OFF ------------------------------------------- */
{
  const w = markWorld();
  const { b, net } = w;
  b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why the rate increases at 30°C.', 'heat'),
                         MS('P-K1', 'q:TST-3', 'sent', 'Maths · Paper X · Q3', 'Work out 3² + 7.', '16')]);
  b.props.AI_MARKS = JSON.stringify({ day: '2026-10-18', n: { 'P-K1': 19 } });
  const tally = b.props.AI_MARKS;
  asked++;
  const r = pass(w);
  if (r.marked !== 2 || b.props.AI_MARKS !== tally) bad.push('the pass changed the day’s AI_MARKS tally (' + tally + ' → ' + b.props.AI_MARKS + ') — a child at 19 of 20 would be told their marks are used up for work they never pressed');
  /* OFF — weekly_digest off, the marking switch off, ai_marks_per_day 0, no key — asks nothing, fetches
     nothing and writes nothing. */
  [['weekly_digest', 'off', /weekly_digest/], ['weekly_digest_marking', 'off', /weekly_digest_marking/], ['ai_marks_per_day', '0', /ai_marks_per_day/]].forEach(([k, v, re]) => {
    asked++;
    const x = markWorld();
    x.b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why.', 'heat')]);
    cfgSet(x.b, k, v);
    const w0 = x.b.log.writes;
    const o = pass(x);
    if (o.did !== 'nothing' || !re.test(String(o.why)) || x.net.asks.length || x.net.lib || x.b.log.writes !== w0) bad.push(k + ' = ' + v + ' did not stop the pass before it fetched or asked anything: ' + JSON.stringify(o));
  });
  asked++;
  const nk = markWorld({ key: false });
  nk.b.seed('submissions', [MS('P-K1', 'q:TST-1', 'sent', 'Biology · Paper X · Q1', 'Explain why.', 'heat')]);
  const o = pass(nk);
  if (o.did !== 'nothing' || !/GEMINI_API_KEY/.test(String(o.why)) || nk.net.asks.length || nk.net.lib) bad.push('with no GEMINI_API_KEY the pass did not stop first: ' + JSON.stringify(o));
  /* AND THE REAL LIBRARY: the line scan finds a real question and its preamble in data/questions.json as it
     is, so the layout the pass relies on is asked every run (check-library.js holds it too). */
  asked++;
  let real = '';
  try { real = fs.readFileSync(path.join(REPO, 'data', 'questions.json'), 'utf8'); } catch (e) { real = ''; }
  if (!real) bad.push('data/questions.json could not be read, so the pass was NOT asked against the real library — not a pass');
  else {
    const rl = markWorld();
    rl.net.site = real;
    rl.b.seed('submissions', [MS('P-K1', 'q:Q-1MA1-2406-1H-5b', 'sent', 'Maths · Paper 1H — June 2024 · Q5b', '', 'An underestimate, because she drove faster.')]);
    const rr = pass(rl);
    const a0 = rl.net.asks[0] || { text: '' };
    if (rr.marked !== 1 || a0.text.indexOf('Sophie drives a distance of 513 kilometres') === -1 || /&[a-z]+;|<\/?[a-z]/i.test(a0.text.split('<question>')[1].split('</mark_scheme>')[0].replace(/<\/?(question|mark_scheme)[^>]*>/g, '')))
      bad.push('a real question from data/questions.json was not found and asked with its preamble as text: ' + JSON.stringify(rr) + ' ' + JSON.stringify(a0.text.slice(0, 300)));
  }
}

/* ---------- 10. (f) THE EMAIL HOLDS ONLY WHAT A PARENT NEEDS — through the real send ---------------------------------
   The owner: *"they dont need to see usernames or whatever, all they need to see are the questions their kids
   have done this week ... i want them to see if they got it right too."* The message MailApp is handed —
   after `mailOut_`'s net, which on a screen turns a child's whole name into "Kit (@handle)" when two children
   share a first name. Kit's week has a question whose words name him in full, and there is another Kit. */
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
    [['the handle', /ke_bright_42|ko_calm_17|@[a-z]+_[a-z]+_\d+/], ['an @ that is not the business’s name', /@(?!family\.)/], ['the surname', /Example|Learner|\bOther\b/],
     ['a person id', /P-[A-Z]\d/], ['the PIN', /0000/], ['the word "sent"', /\bsent\b/i], ['the child’s own address', /kit\.e@|example\.org/],
     ['the parent’s name', /\bPat\b|Parent/], ['the other Kit', /ko_calm|Other/], ['"(again)" or "gone back to"', /\(again\)|gone back to/],
     ['a link', /https?:\/\//], ['a library key', /q:TST|TST-/]].forEach(([what, re]) => {
      asked++;
      if (re.test(all)) bad.push('the email Pat is sent carries ' + what + ': ' + JSON.stringify((all.match(new RegExp('.{0,40}' + re.source + '.{0,40}', re.flags.replace('g', ''))) || [''])[0]));
    });
    asked++;
    ['Kit’s week: 4 questions', 'Q7 ✓: Work out 4 × 4.', 'Q9 ✗: Kit buys 3 pens at 40p each. How much does he pay?', 'Q11 2 of 3 marks: Explain the trend.',
     'Q6 not marked: Say anything.', 'Kit worked on 4 questions this week (12 Oct – 18 Oct, up to 6pm on Sunday).'].forEach(x => {
      if ((sent.subject + '\n' + sent.body).indexOf(x) === -1) bad.push('the email Pat is sent does not say "' + x + '": ' + sent.body.split('\n').slice(0, 12).join(' / '));
    });
    if (unstyled(sent.htmlBody).indexOf('<b>Q9</b> ✗ — Kit buys 3 pens') === -1 || unstyled(sent.htmlBody).indexOf('<b>Q6</b> not marked — Say anything.') === -1)
      bad.push('the HTML Pat is sent does not carry each question with its mark: ' + unstyled(sent.htmlBody).slice(0, 300));
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
  b.ev('installWeeklyDigest()');
  const snap = () => JSON.stringify({ tabs: b.tabs, props: b.props, trig: trig.map(t => t.spec), sent: mail.sent.length });
  const before = snap(), w0 = b.log.writes;
  asked++;
  const out = JSON.parse(JSON.stringify(b.ev('clearCache(); checkSundayEmail()')));
  const text = (out.lines || []).join('\n');
  if (snap() !== before || b.log.writes !== w0) bad.push('checkSundayEmail changed something — a cell, a Script Property, a trigger or an email: it must only read');
  if (net.logs.join('\n').indexOf(text) === -1) bad.push('checkSundayEmail did not put its lines in the execution log (Logger.log)');
  if (/test-key-not-a-real-one/.test(text + net.logs.join('\n'))) bad.push('checkSundayEmail printed GEMINI_API_KEY');
  [[/^Backend 2026-10-12-t-sunday/m, 'the backend’s version'],
   [/THE EMAIL: ON — it emails parents \(weekly_digest is "send"\)\. It goes on Sundays at about 18:00, London time\./, 'the mode and the hour'],
   [/THE TRIGGERS: the Sunday email is installed; the AI marking passes are installed \(every night at about 2:00, and on Sunday at about 17:00\)\./, 'the triggers, installed'],
   [/AI MARKING: on\. GEMINI_API_KEY is set in Script Properties\. Marking asks \S+, then \S+/, 'the switch, the key and the models'],
   [/LIVE TEST OF THE MARKER \(a made-up question, "Work out 2 \+ 3\.", answered "5"\): Gemini answered — 2 of 1 mark|LIVE TEST OF THE MARKER .*: Gemini answered — 1 of 1 mark/, 'the live ask of the marker'],
   [/MAIL: 100 emails left in today’s quota; the Sunday run keeps 10 back/, 'the mail quota'],
   [/THE QUESTION LIBRARY: fetched 0\.0 million characters in [\d.]+ s from https:\/\/halexdias31-pixel\.github\.io\/family\/data\/questions\.json\./, 'the library fetched'],
   [/THIS WEEK \(12 Oct – 18 Oct, so far\): 2 learners sent answers; 1 of them will have a parent emailed \(1 email\)\./, 'this week’s reach'],
   [/NOT REACHED — Sam: parent Quinn has no email address\./, 'who will not be reached, and why'],
   [/NOT MARKED YET \(sent since 2026-10-05\): 2 answers\. The marking pass can mark 1; it cannot mark 1 \(a drawing\) — the email says "not marked" beside those\./, 'what is still unmarked'],
   [/Nothing was changed: no row written, no email sent, no trigger booked\./, 'that nothing changed']].forEach(([re, what]) => {
    asked++;
    if (!re.test(text)) bad.push('checkSundayEmail does not say ' + what + ' — it said:\n      ' + text.split('\n').join('\n      '));
  });
  /* THE ASK IT MADE WAS THE MADE-UP QUESTION, never a learner's work. */
  asked++;
  if (net.asks.length !== 1 || net.asks[0].text.indexOf('Work out 2 + 3.') === -1 || /heat|a line/.test(net.asks[0].text)) bad.push('checkSundayEmail’s live test sent Gemini something other than its made-up question: ' + JSON.stringify(net.asks.map(a => a.text.slice(0, 80))));
  /* AND WITH NOTHING SET UP: no key, no triggers, the switch off — each said plainly. */
  asked++;
  const bare0 = markWorld({ key: false, mode: 'off' });
  const o2 = JSON.parse(JSON.stringify(bare0.b.ev('clearCache(); checkSundayEmail()')));
  const t2 = (o2.lines || []).join('\n');
  [/THE EMAIL: OFF — nothing is sent/, /Set weekly_digest to send/, /the Sunday email is NOT installed \(run installWeeklyDigest\); the AI marking passes are NOT installed/,
   /AI MARKING: OFF — weekly_digest on the config tab is off/, /GEMINI_API_KEY is NOT set/, /LIVE TEST OF THE MARKER: not asked/].forEach(re => {
    if (!re.test(t2)) bad.push('checkSundayEmail with nothing set up does not say ' + re + ':\n      ' + t2.split('\n').join('\n      '));
  });
  if (bare0.net.asks.length) bad.push('checkSundayEmail asked Gemini with no key');
}

/* ---------- 12. THE DRY RUN (check/digest-dry.js) STILL RUNS, SENDS NOTHING AND WRITES NOWHERE IT MAY NOT ---------
   The lead runs it on the real sheet before a Sunday; a tool nobody runs between Sundays is a tool that has
   rotted by the next one. An invented dump and the invented library above, in the system's temp folder. */
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
    if (r.status !== 0 || !one || one.to !== 'pat@example.test' || one.text.indexOf('Q1 1 of 3 marks: Explain why') === -1
        || one.text.indexOf('Q4 not marked: Draw the graph.') === -1 || !/nothing was sent/.test(r.stdout) || !/would mark 1/.test(r.stdout))
      bad.push('check/digest-dry.js on an invented week did not write Pat’s email with the stub’s mark and "not marked" (exit ' + r.status + '): ' + (r.stdout + r.stderr).slice(0, 300));
    asked++;
    const inside = go(path.join(REPO, 'check', 'dry-out-should-not-exist'));
    if (inside.status === 0 || fs.existsSync(path.join(REPO, 'check', 'dry-out-should-not-exist')) || !/refusing/.test(inside.stderr))
      bad.push('check/digest-dry.js wrote inside the repository — the emails carry real addresses, and this repository is public');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    /* AND WHAT A BROKEN TOOL WROTE WHERE IT MUST NOT, so a red run leaves no invented emails in the tree. */
    fs.rmSync(path.join(REPO, 'check', 'dry-out-should-not-exist'), { recursive: true, force: true });
  }
}

console.log('rules asked: ' + asked);
if (bad.length) {
  console.log('FAILED — ' + bad.length + ' thing(s) the weekly parent email gets wrong:');
  bad.forEach(x => console.log('  ' + x));
  process.exit(1);
}
console.log('OK — a London week, only that week, only accepted parents; each question with its own words and how it went (✓, ✗, the AI’s marks, "not marked"), never a key, a handle or a surname, at most 80 and under Gmail’s clip; off nothing, preview the log, send once each;\n'
  + '     every unmarked worded answer marked by the server before it goes — once, in its time, never over a press, never from a child’s cap; one Sunday trigger and its two marking passes, booked by nobody but the owner; a setup check that changes nothing; the dry run sends nothing; the preview an admin’s.');
