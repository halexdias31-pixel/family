#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-quizzes.js

   THE QUIZZES, AND WHETHER ANY OF THEM CAN TELL A CHILD THEY ARE WRONG WHEN THEY ARE NOT.

   THIS IS THE ONLY SURFACE IN THE APP THAT MARKS. `check-marking.js` owns the FUNCTIONS that do it
   and proves they are fair; this owns the DATA they are pointed at, which is the other half. A
   perfect marker fed an answer that is not one of the choices marks every attempt wrong — every
   one, for ever — and it reads as the student being wrong rather than the row being broken. That is
   the failure CLAUDE.md calls the worse of the two: a right answer marked wrong is a student who
   stops trusting the marking and then stops using it.

   `tools/quizwrite.py` ASSERTS ALL OF THIS AT THE WRITING END AND THAT IS NOT ENOUGH. A file can be
   hand-edited, appended to by another script, or written by a version of that tool that has since
   changed — and a rule that lives only in the thing that produced the data is a rule nothing
   enforces about the data. Same argument as `check-library.js` sitting over the insert scripts that
   already assert their own totals.

   AND IT PRINTS THE MATRIX. 27 science topics across three levels is 81, and the count is read off
   the run rather than typed into a sentence — the fault this repository records as "all 18 checks
   pass", "one of the eighteen names", and the prose over `CARD_W`. A subject that is half done is a
   number here, not a silence.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fail = [];
const note = [];

/* The same line-at-a-time parse every data file in this repository gets, and for the reason
   `check-library.js` records: a whole file flattened onto one line still ends in `}`, so the shape
   test has to parse each line rather than check the last character. */
function readLines(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { fail.push(rel + ' does not exist'); return []; }
  const lines = fs.readFileSync(p, 'utf8').replace(/\n$/, '').split('\n');
  if (lines[0].trim() !== '[') fail.push(rel + ' line 1 is not a bare [');
  if (lines[lines.length - 1].trim() !== ']') fail.push(rel + ' does not end with a bare ]');
  const rows = [];
  lines.slice(1, -1).forEach((raw, i) => {
    const s = raw.trim().replace(/,$/, '');
    if (!s) return;
    try { rows.push(JSON.parse(s)); }
    catch (e) { fail.push(rel + ' line ' + (i + 2) + ' does not parse — ' + e.message.slice(0, 60)); }
  });
  return rows;
}

const rows = readLines('data/quizzes.json');
const tree = readLines('data/topics.json');

/* ---------- WHAT THE TREE ANSWERS TO -------------------------------------------------------------
   Label, alias, and the id read as words — the three `check-practicals.js` uses, for its reason: a
   topic written by hand into a file under review can be held to naming the branch outright, where
   the funnel's containment pass deliberately cannot. */
const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

/* ---------- THE CLOSED LISTS ----------------------------------------------------------------------
   `VOCAB` IN `check-library.js` IS THE ARGUMENT AND IT IS THE SAME ONE. `level` and `tier` are
   FACETS — `levelOf_` reads them and every distinct value becomes a button somebody is offered — so
   `KS3` beside `Key Stage 3` is two answers for one meaning and a filter that reads as arbitrary.
   A new value has to be added here deliberately, by somebody who has just read what is in use.

   THESE ARE THE LIBRARY'S OWN SPELLINGS, not new words: `Foundation` and `Higher` are what `tier`
   already holds on 1,158 question rows, and a third spelling would be the `needs_print` /
   `print_required` fault, which cost 356 rows of disagreement. */
const LEVEL = new Set(['KS3', 'GCSE']);
const TIER = new Set(['', 'Foundation', 'Higher']);
const KIND = new Set(['choice', 'typed']);

/* ---------- ROW BY ROW ---------------------------------------------------------------------------- */
const seen = new Set();
const quizzes = new Map();

rows.forEach((r, i) => {
  const at = 'row ' + (i + 1) + (r.quiz_id ? ' (' + r.quiz_id + ' #' + r.n + ')' : '');
  const id = String(r.quiz_id || '').trim();
  const n = String(r.n || '').trim();
  if (!id) { fail.push(at + ' has no quiz_id'); return; }
  if (!n) { fail.push(at + ' has no n'); return; }

  /* A REPEAT SILENTLY REPLACES A QUESTION, which is `check-library.js`'s rule about `row_id` and the
     same consequence: the app groups by `quiz_id` and keys answers by `#q<n>`, so two rows sharing
     both would share one answer drawer and one of them would never be marked. */
  const k = id + '#' + n;
  if (seen.has(k)) fail.push(at + ' repeats a question id already used');
  seen.add(k);

  if (!LEVEL.has(String(r.level))) fail.push(at + ' has level "' + r.level + '", which is not in LEVEL');
  if (!TIER.has(String(r.tier == null ? '' : r.tier))) {
    fail.push(at + ' has tier "' + r.tier + '", which is not in TIER');
  }
  if (!KIND.has(String(r.kind))) fail.push(at + ' has kind "' + r.kind + '", which is not choice or typed');

  const topic = String(r.topic || '').trim();
  if (!topic) fail.push(at + ' has no topic');
  /* A COMMA IN A TOPIC NAME IS A SECOND TOPIC. `topics` is a comma-list read by `asList_`, so
     `Bonding, Structure and the Properties of Matter` — AQA's own heading for unit 4.2 — arrives as
     two topics and neither joins the tree. Recorded in CLAUDE.md, and an assertion rather than a
     thing to remember. */
  else if (topic.indexOf(',') >= 0) fail.push(at + ' has a comma in its topic: a comma is a second topic');
  else if (!known.has(key(topic))) {
    fail.push(at + ' names topic "' + topic + '", which is not a label or alias in data/topics.json');
  }

  if (!String(r.ask || '').trim()) fail.push(at + ' has no question');
  /* EVERY QUESTION SAYS WHY, and that is the feature rather than a nicety. A quiz that says
     "correct" and nothing else teaches nothing, and one that says "not quite" and nothing else is
     worse — it has told a child they are wrong and given them no way forward. */
  if (!String(r.why || '').trim()) fail.push(at + ' has no explanation');

  const answer = String(r.answer == null ? '' : r.answer);
  if (!answer.trim()) fail.push(at + ' has no answer');

  if (r.kind === 'choice') {
    const ch = String(r.choices || '').split('|').map(s => s.trim()).filter(Boolean);
    /* ---------- THE RULE THIS FILE EXISTS FOR ---------------------------------------------------
       `quizRight_` COMPARES THE STORED CHOICE AGAINST `answer` AS A STRING, character for
       character, and that is safe ONLY because of this line. An answer cell that is not one of the
       choices cannot be reached by any press, so the question marks every attempt wrong for ever —
       silently, with valid markup, and reading as the student's fault. */
    if (ch.indexOf(answer) < 0) {
      fail.push(at + ' has an answer that is not one of its choices — every attempt would mark wrong');
    }
    if (ch.length < 3) fail.push(at + ' offers fewer than three choices');
    if (new Set(ch).size !== ch.length) fail.push(at + ' offers the same choice twice');
    if (String(r.accept || '').trim()) fail.push(at + ' is a choice question carrying an accept list');
  } else if (r.kind === 'typed') {
    const acc = String(r.accept || '').split('|').map(s => s.trim()).filter(Boolean);
    /* A TYPED QUESTION MUST SAY WHAT IT ACCEPTS, because `markAnswer_` marks against `accept` and
       nothing else — an empty one refuses every answer including the printed one. */
    if (!acc.length) fail.push(at + ' is typed and accepts nothing, so no answer can ever be right');
    if (String(r.choices || '').trim()) fail.push(at + ' is a typed question carrying choices');
  }

  if (!quizzes.has(id)) quizzes.set(id, []);
  quizzes.get(id).push(r);
});

/* ---------- AND A QUIZ IS A SET, NOT A PILE ------------------------------------------------------- */
quizzes.forEach((qs, id) => {
  const names = new Set(qs.map(r => String(r.name || '')));
  if (names.size > 1) fail.push(id + ' has ' + names.size + ' different names across its questions');
  const asks = new Set(qs.map(r => String(r.ask || '').trim()));
  if (asks.size !== qs.length) fail.push(id + ' asks the same thing twice');
  if (qs.length < 3) fail.push(id + ' has only ' + qs.length + ' question(s)');
});

/* ---------- THE ANSWER A TYPED QUESTION PRINTS HAS TO BE ONE IT ACCEPTS ---------------------------
   THE CARD SHOWS `answer` WHEN SOMEBODY GETS IT WRONG. If the marker would not accept that exact
   string, the quiz has just printed an answer it would itself refuse — which is the two-readers
   fault with the disagreement made visible to a child.

   IT LOADS `markAnswer_` OUT OF find.js rather than reimplementing the comparison, which is what
   `check-marking.js` does and for the reason recorded there: a second implementation here would be
   a second thing to keep in step, and the whole point is to test the one the app uses.

   THROUGH `check-marks-load.js`, WHICH IS THE ONE EXTRACTOR. The first version of this file had its
   own simpler cutter — "to the next top-level declaration" — and it could not find `markBare_`,
   which is a `const` arrow with no block. It reported `js/find.js no longer declares markBare_`
   about a file that declares it on line 3420: a check wrong about its own subject, in the
   flattering-to-nobody direction. */
const { markingSource } = require('./check-marks-load.js');
const marks = markingSource(root);
let markAnswer_ = null;
if (marks.missing.length) {
  fail.push('js/find.js no longer declares ' + marks.missing.join(', ') + ' — renamed?');
} else {
  try { markAnswer_ = new Function(marks.source + '\nreturn markAnswer_;')(); }
  catch (e) { fail.push('could not run the marking functions out of find.js — ' + e.message); }
}
if (markAnswer_) {
  rows.filter(r => r.kind === 'typed').forEach((r, i) => {
    if (markAnswer_(String(r.answer || ''), String(r.accept || '')) !== true) {
      fail.push(r.quiz_id + ' #' + r.n + ' prints an answer its own accept list would refuse: "'
        + r.answer + '"');
    }
  });
}

/* ---------- THE MATRIX, AS A NUMBER ---------------------------------------------------------------
   PRINTED AND NOT FAILED, which is the `figure` count's argument and the practicals' blank `needs`:
   a subject nobody has written yet is a backlog, and a backlog somebody can act on is a number
   rather than a silence. What WOULD be a failure is a quiz that exists and cannot mark. */
const bySub = new Map();
quizzes.forEach((qs) => {
  const r = qs[0];
  const sub = String(r.subject || '?');
  if (!bySub.has(sub)) bySub.set(sub, { topics: new Set(), quizzes: 0, qs: 0 });
  const e = bySub.get(sub);
  e.topics.add(String(r.topic || ''));
  e.quizzes++;
  e.qs += qs.length;
});
console.log('');
[...bySub.keys()].sort().forEach(sub => {
  const e = bySub.get(sub);
  const want = e.topics.size * 3;
  console.log('  %s — %d topics, %d of %d quizzes (%d questions)%s',
    sub.padEnd(10), e.topics.size, e.quizzes, want, e.qs,
    e.quizzes === want ? '' : '  ← ' + (want - e.quizzes) + ' still to write');
});
const typed = rows.filter(r => r.kind === 'typed').length;
console.log('  %d quizzes, %d questions — %d multiple choice, %d typed',
  quizzes.size, rows.length, rows.length - typed, typed);

/* EVERY TOPIC THE TREE HAS FOR A SUBJECT THAT IS BEING COVERED. A subject with quizzes on six of
   its seven branches is the shape nobody notices, because six looks like a lot. */
const subRoot = new Map();
tree.forEach(t => { if (t && t.label) subRoot.set(t.topic_id, t); });
[...bySub.keys()].forEach(sub => {
  const rootRow = tree.find(t => t && t.label === sub);
  if (!rootRow) return;
  const kids = tree.filter(t => t && t.parent_id === rootRow.topic_id).map(t => t.label);
  const have = bySub.get(sub).topics;
  const missing = kids.filter(l => !have.has(l));
  if (missing.length) {
    note.push(sub + ' has no quiz for ' + missing.length + ' of its ' + kids.length
      + ' branches: ' + missing.join(', '));
  }
});

note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.slice(0, 40).forEach(f => console.log('  ' + f));
  if (fail.length > 40) console.log('  … and ' + (fail.length - 40) + ' more');
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/quizzes.json above.');
  process.exit(1);
}
console.log('\nOK — every quiz question has an answer that can be reached, an explanation, and a\n'
  + '     topic that names a real branch of the tree.');
