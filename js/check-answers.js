#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-answers.js

   IS THE ANSWER A PERSON SEES SHORT.

   ASKED FOR AS "make answers breaifer", and, offered the choice between shorter written answers and
   hiding the working behind a tap: "i want shorter answers." Measured before the change: 4,309
   answers, median 88 characters, 1,019 over 200 and the longest 1,677 -- a card whose answer was a
   page of prose, with the result somewhere inside it.

   THE ANSWER IS TWO THINGS NOW. `answerParts_` in find.js draws the RESULT -- what comes before the
   first spaced dash, with the mark-scheme codes taken off -- and folds the explanation and any
   examiner's note under "Why". tools/answer-brief.py put every long answer into that shape. This
   holds the line on both halves:

     1  `answerParts_` itself, on the cases that shaped it: the spaced dash and only the spaced one,
        a dash inside a table left alone, codes off the result and kept where a sentence needs
        them, an entity's own semicolon kept, a bold opened before the dash closed on each side.
     2  every answer in data/questions.json, drawn through the REAL function, shows a result of
        LIMIT characters or fewer -- unless ACCEPTED names it, with one written reason.
     3  the split never costs a fraction or a power: `typeset_` over the two halves draws as many
        stacked fractions and raised powers as it does over the whole.
     4  a name on ACCEPTED that is no longer over the limit fails too: a reason nobody needs is a
        line that will one day excuse something else.

   WHY 120. Measured on the drawn results after the rewrite: median 7 characters, 95th percentile
   89. Before it, the 90th percentile was 154 -- so 120 is above every result that is a result and
   below every one that was a paragraph. At the root size a 390px phone draws (14.82px), 120
   characters is about three lines of the card: the most that reads as one answer at a glance.

   IT RUNS THE REAL FUNCTIONS, CUT OUT OF find.js BY NAME with `check-marks-load.js`'s cutter, the
   way `check-typeset.js` runs `typeset_`: a copy here would be a second opinion about where an
   answer ends, and the day the two drifted this would pass while the cards grew back.

   PRINTS A COUNT EVERY RUN, the distribution and the five longest -- a silence is not a count.

     node js/check-answers.js
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { cutFrom } = require('./check-marks-load.js');

const ROOT = path.join(__dirname, '..');
const LIMIT = 120;

/* ---------- ANSWERS THAT ARE LONG AND ARE ALLOWED TO BE, ONE REASON EACH ---------------------------
   Still printed every run. The point of the list is that a NEW long answer fails loudly instead of
   joining a count nobody reads -- the same contract as ACCEPTED in check-payload.js. */
const ACCEPTED = {
  'Q-CBM-cube-numbers-15': 'the result IS the long thing: a 677-digit number the sheet asked for, '
    + 'which no rewording can shorten and no fold should hide',
};

const src = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');
const missing = ['answerParts_', 'typeset_'].filter(n => !cutFrom(src, n));
if (missing.length) {
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO -- "I did not check" is not "I checked
     and it was fine". */
  console.log('check-answers: cannot find ' + missing.join(', ') + ' in find.js — renamed?');
  process.exit(1);
}
const answerParts_ = eval('(' + cutFrom(src, 'answerParts_') + ')');
const typeset_ = eval('(' + cutFrom(src, 'typeset_') + ')');

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"' };
/* WHAT A READER COUNTS: tags gone, an entity one character, runs of space one space. */
const seen = s => String(s || '').replace(/<[^>]*>/g, '').replace(/&(#?\w+);/g, (m, e) => ENT[e] || 'x')
  .replace(/\s+/g, ' ').trim();

const fail = [];

/* ---------- 1. THE FUNCTION, ON THE CASES THAT SHAPED IT -------------------------------------------
   `[answer, result drawn, why drawn (or a RegExp it must match), what it is]`. */
const CASES = [
  ['<b>18&nbsp;000</b> &mdash; B1, cao, and nothing else scores.', '<b>18&nbsp;000</b>',
   'Nothing else scores.', 'the result, and a code run opening the why taken off with its "and"'],
  ['<b>50&deg;</b> &mdash; <b>M1</b> for 360 &minus; 220 &minus; 90, <b>A1</b> for 50 cao.', '<b>50&deg;</b>',
   /^<b>M1<\/b> for 360 &minus; 220 &minus; 90, <b>A1<\/b> for 50\.$/,
   '"M1 for" keeps its code, a lone "cao" closing a clause goes, and &deg; keeps its semicolon'],
  ['12 &divide; 4 = 3 &mdash; that is 3. B1, cao. The sign rule is tested.', '12 &divide; 4 = 3',
   'That is 3. The sign rule is tested.', 'a code run opening a sentence goes without leaving ".."'],
  ['8&ndash;9 hours, by the graph', '8&ndash;9 hours, by the graph', '',
   'an UNSPACED dash is a range, not the end of the result'],
  ['No – the two are not equal', 'No', 'The two are not equal', 'a spaced en dash is the same punctuation'],
  ['<table><tr><td>a &mdash; b</td></tr></table>', '<table><tr><td>a &mdash; b</td></tr></table>', '',
   'a dash inside a table is the cell\'s business, so nothing is split'],
  ['<b>18 &mdash; B1</b>', '<b>18</b>', '', 'a bold open across the dash is closed on the result (and a why of codes only is no why)'],
  ['<p>Yes &mdash; because <i>x</i> = 3 is a vertical line.</p>', '<p>Yes</p>',
   '<p>Because <i>x</i> = 3 is a vertical line.</p>', 'a paragraph reopened on the why; a sentence capitalised'],
  ['B1 &mdash; the scheme accepts 8 or &minus;8', 'B1', 'The scheme accepts 8 or &minus;8',
   'a result that is nothing but codes keeps them rather than drawing an empty line'],
  ['<i>x</i> = 3 is the line &mdash; <i>x</i> = 3 means vertical', '<i>x</i> = 3 is the line',
   '<i>x</i> = 3 means vertical', 'a why opening on a variable is not given a capital X'],
  ['Gomeisa (1 mark; condone it) &mdash; B class', 'Gomeisa (1 mark; condone it)', 'B class',
   'a bracket that is more than a mark count is left alone'],
  ['More thyroxine (1), from the thyroid (1) &mdash; or adrenaline', 'More thyroxine, from the thyroid',
   'Or adrenaline', 'the A-level "(1)" mark counts come off the result'],
  ['1.1(1) × 10³ MeV &mdash; mass', '1.1(1) × 10³ MeV', 'Mass',
   'a bracket with no space before it is a significant figure, not a mark'],
  ['<b>8</b> B1 cao &mdash; and &minus;8 is accepted', '<b>8</b>', 'And &minus;8 is accepted',
   'codes written into the result itself come off it'],
  ['', '', '', 'an empty answer is an empty result'],
];
CASES.forEach(([inp, head, why, what]) => {
  const p = answerParts_(inp);
  const whyOk = why instanceof RegExp ? why.test(p.why) : p.why === why;
  if (p.head !== head || !whyOk) {
    fail.push(`answerParts_ on ${what}:\n      in   ${inp}\n      got  head ${JSON.stringify(p.head)}  why ${JSON.stringify(p.why)}\n      want head ${JSON.stringify(head)}  why ${why instanceof RegExp ? String(why) : JSON.stringify(why)}`);
  }
});

/* ---------- 2 AND 3. THE LIBRARY, DRAWN ------------------------------------------------------------ */
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
const answered = rows.filter(r => r && String(r.answer || '').trim());
const lens = [];
const over = [];
const lost = [];
const coded = [];
/* THE CODES AN EXAMINER APPORTIONS MARKS WITH, which a child reads as part of the answer. The
   library carries them in 122 rows, all Edexcel 2024; none may reach a drawn result. */
const CODE = /\b(?:[BMAPC][1-5]|cao|oe|isw|awrt)\b/;
const count = (html, re) => (String(html).match(re) || []).length;
answered.forEach(r => {
  const p = answerParts_(r.answer);
  const n = seen(p.head).length;
  lens.push(n);
  if (n > LIMIT) over.push({ id: r.row_id, n, head: seen(p.head) });
  if (CODE.test(seen(p.head))) coded.push(`${r.row_id}  ${seen(p.head).slice(0, 80)}`);
  /* A FRACTION OR A POWER THE SPLIT COST. Typeset whole and typeset in halves must agree. */
  const whole = typeset_(r.answer);
  const halves = typeset_(p.head) + typeset_(p.why);
  const f0 = count(whole, /class="frac"/g), f1 = count(halves, /class="frac"/g);
  const s0 = count(whole, /<sup>/g), s1 = count(halves, /<sup>/g);
  if (f1 < f0 || s1 < s0) lost.push(`${r.row_id}  ${f0} fractions and ${s0} powers whole, ${f1} and ${s1} split`);
});
lens.sort((a, b) => a - b);
const pct = q => lens[Math.min(lens.length - 1, Math.floor(q * lens.length))] || 0;

console.log(`answers drawn: ${answered.length}   result length — median ${pct(0.5)}, 90th ${pct(0.9)}, `
  + `95th ${pct(0.95)}, longest ${lens[lens.length - 1] || 0} characters   limit ${LIMIT}`);
console.log(`\nOVER ${LIMIT} CHARACTERS  (${over.length})`);
over.sort((a, b) => b.n - a.n).forEach(o => console.log(`  ${String(o.n).padStart(4)}  ${o.id}${
  ACCEPTED[o.id] ? '  [accepted: ' + ACCEPTED[o.id] + ']' : ''}  ${o.head.slice(0, 70)}${o.head.length > 70 ? '…' : ''}`));
if (!over.length) console.log('  none');
console.log('\nTHE FIVE LONGEST RESULTS UNDER THE LIMIT');
answered.map(r => ({ id: r.row_id, h: seen(answerParts_(r.answer).head) }))
  .filter(o => o.h.length <= LIMIT).sort((a, b) => b.h.length - a.h.length).slice(0, 5)
  .forEach(o => console.log(`  ${String(o.h.length).padStart(4)}  ${o.id}  ${o.h.slice(0, 80)}${o.h.length > 80 ? '…' : ''}`));

over.filter(o => !ACCEPTED[o.id]).forEach(o => fail.push(
  `${o.id} draws a ${o.n}-character result — put it in "result — why" form (tools/answer-brief.py), `
  + 'or name it in ACCEPTED with a reason'));
Object.keys(ACCEPTED).filter(id => !over.some(o => o.id === id)).forEach(id => fail.push(
  `${id} is on ACCEPTED and its result is no longer over ${LIMIT} — take the line off`));
lost.forEach(l => fail.push('the split lost maths: ' + l));
coded.forEach(c => fail.push('a mark-scheme code is drawn in the result: ' + c));

if (fail.length) {
  console.log(`\nFAIL  (${fail.length})`);
  fail.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log(`\nOK — ${CASES.length} cases of the split behave, every result drawn is ${LIMIT} characters or`
  + `\n     fewer (${Object.keys(ACCEPTED).length} accepted, named above), and no fraction or power was lost to the fold.`);
