#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-practicals.js

   THE PRACTICALS, AND WHETHER THE THING THEY ARE JOINED TO EXISTS.

   WHY THIS IS NOT PART OF `check-library.js`. That one owns `data/questions.json` — ids, the 80-mark
   rule, the closed facet vocabulary. This owns a different file with a different shape and, more to
   the point, ONE question that file cannot ask: does a practical's topic name anything real.

   THAT QUESTION IS THE WHOLE FEATURE. The export shipped one topic per practical and the trundle
   wheel's was `Perimeter and area` — a phrase that reads perfectly and matched exactly ONE question
   in a library holding ninety-four about perimeter and area under other spellings. A join that
   silently reaches nothing is this repository's oldest shape: `figure`, `orderPrints`, the four
   message actions, `exam_date`. Here it would be worse than silent, because "Practicals" would be
   an answer in the funnel that quietly returned the wrong ones.

   SO A TOPIC HAS TO BE A LABEL OR AN ALIAS IN `data/topics.json`, and that is checkable where free
   text never is. The tree is the one place that says what a topic is called; a practical naming a
   spelling the tree has never heard of is either a typo or a branch somebody needs to add, and
   both are things a person should be told about rather than a filter that comes back empty.
================================================================================================== */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fail = [];
const note = [];

/* ---------- THE SHAPE, PARSED A LINE AT A TIME ---------------------------------------------------
   The same rule `data/questions.json` has and for the same reason: the next script to append by
   splitting on newlines. `check-library.js` records why each line is parsed on its own rather than
   the file's last character checked — a whole file flattened onto one line still ends in `}`. */
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

const rows = readLines('data/practicals.json');
const tree = readLines('data/topics.json');

/* ---------- WHAT THE TREE ANSWERS TO -------------------------------------------------------------
   Label, alias, and the id read as words — the same three `topicIndex_` in find.js builds its map
   from. Deliberately NOT the containment pass: that one resolves "scatter graphs" inside "Scatter
   Graphs & Correlation" and is right to, but a practical's topic is written by hand into a file
   under review, so it can be held to the stricter standard of naming the branch outright. */
const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

const COMPLIANCE = new Set([
  'AQA required practical',
  'AQA-aligned, not a required practical',
  'Not assessed — enrichment',
]);

/* The numbered columns this file exists to have replaced. A returning `equipment_11` is not untidy,
   it is the fault coming back — the same argument `RETIRED_FACETS` makes about a deleted facet. */
const NUMBERED = /^(equipment|step|topic)_\d+$/;

const seen = new Set();
let joined = 0, topicLinks = 0, required = 0;
const unknownTopics = new Map();

rows.forEach(r => {
  const id = String((r && r.practical_id) || '').trim();
  if (!id) { fail.push('a row has no practical_id'); return; }
  if (seen.has(id)) fail.push(id + ' appears twice — a repeat silently replaces a practical');
  seen.add(id);

  Object.keys(r).forEach(k => {
    if (NUMBERED.test(k)) {
      fail.push(id + ' carries `' + k + '` — the numbered columns were folded into `equipment`, '
        + '`steps` and `topics`, and one coming back is the fault returning');
    }
  });

  const c = String(r.compliance || '').trim();
  if (!COMPLIANCE.has(c)) {
    fail.push(id + ' has compliance "' + c + '", which is not one of the three written down. '
      + 'Add it to COMPLIANCE here deliberately, or fix the row.');
  }
  /* EXACTLY THE ONE VALUE. `AQA-aligned, not a required practical` CONTAINS the words
     "required practical", so a substring test counted five extras as required — found here,
     by this count disagreeing with the one the transform printed. */
  if (c === 'AQA required practical') required++;

  /* Both list columns: present, and no value carrying the separator that splits them. */
  ['equipment', 'steps'].forEach(col => {
    const v = String(r[col] || '').trim();
    if (!v) { fail.push(id + ' has no ' + col); return; }
    v.split('|').forEach(part => {
      if (!part.trim()) fail.push(id + ' has an empty item in ' + col + ' — a doubled pipe');
    });
  });

  const topics = String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  if (!topics.length) {
    fail.push(id + ' names no topics, so nothing in the library can reach it');
  }
  topicLinks += topics.length;
  let ok = 0;
  topics.forEach(t => {
    if (known.has(key(t))) { ok++; return; }
    if (!unknownTopics.has(t)) unknownTopics.set(t, []);
    unknownTopics.get(t).push(id);
  });
  if (ok) joined++;

  /* The shop join. Nothing reads it yet — the stock lives in the Settings spreadsheet — so this
     only asks that what is there is shaped like an id list and not like a name. */
  const items = String(r.item_ids || '').trim();
  if (items && !/^I\d+(\s*,\s*I\d+)*$/.test(items)) {
    fail.push(id + ' has item_ids "' + items + '", which is not a comma list of I-numbers');
  }
});

unknownTopics.forEach((ids, t) => {
  fail.push('topic "' + t + '" (on ' + ids.join(', ') + ') is not a label, alias or id in '
    + 'data/topics.json — so nothing in the library shares it and the join is decoration. '
    + 'Either it is a typo, or the tree needs that branch.');
});

/* ---------- SAY IT ------------------------------------------------------------------------------ */
console.log('\nTHE PRACTICALS  —  ' + rows.length + ' experiments, ' + required + ' AQA required, '
  + (rows.length - required) + ' extra');
console.log('topic links: ' + topicLinks + ' across ' + rows.length + ' practicals ('
  + (rows.length ? (topicLinks / rows.length).toFixed(1) : 0) + ' each), '
  + joined + ' reaching at least one branch of the topic tree');

const noItems = rows.filter(r => !String(r.item_ids || '').trim()).length;
if (noItems) {
  note.push(noItems + ' of ' + rows.length + ' name no shop items yet — a backlog, not a fault: '
    + 'the stock rows live in the Settings spreadsheet and this column is the join waiting for them');
}
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/practicals.json above.');
  process.exit(1);
}
console.log('\nOK — every practical has an id, a compliance the code knows, kit, steps, and topics\n'
  + '     that name real branches of the tree.');
