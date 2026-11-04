#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-answers.js IS THE ANSWER A PERSON SEES SHORT. § */
const fs = require('fs');
const path = require('path');
const { cutFrom } = require('./check-marks-load.js');

const ROOT = path.join(__dirname, '..');
const LIMIT = 120;

/* ---------- ANSWERS THAT ARE LONG AND ARE ALLOWED TO BE, ONE REASON EACH § */
const ACCEPTED = {
  'Q-AQA-8464B-2406-1H-014': 'two enzymes, each with where it is made and what it makes, is the question: '
    + 'cutting "small intestine" to "gut" to fit would be wrong in the mark scheme\'s own terms',
};

const src = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');
const missing = ['answerParts_', 'typeset_', 'answerBlock_'].filter(n => !cutFrom(src, n));
if (missing.length) {
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO -- "I did not check" is not "I checked
     and it was fine". */
  console.log('check-answers: cannot find ' + missing.join(', ') + ' in find.js — renamed?');
  process.exit(1);
}
const answerParts_ = eval('(' + cutFrom(src, 'answerParts_') + ')');
const typeset_ = eval('(' + cutFrom(src, 'typeset_') + ')');
/* `answerBlock_` NEEDS `esc` FOR THE KIND'S LABEL, and data.js's is the whole of it: five characters
   escaped. Written here rather than cut, because data.js is not find.js and the label is not what
   this measures. */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const answerBlock_ = eval('(' + cutFrom(src, 'answerBlock_') + ')');

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
const rows = require('../check/lib-full.js').rows('questions');
const answered = rows.filter(r => r && String(r.answer || '').trim());
const lens = [];
const over = [];
const lost = [];
const coded = [];
const extra = [];
const bare = [];
/* A RESULT THAT SAYS THE WORK WAS DONE AND NOT WHAT IT CAME TO. With the why gone from the page,
   "Shown" is all a reader gets. Printed, not failed -- see the header. */
const SAYS_NOTHING = /^(?:shown|proof|proven|as shown|see (?:below|above|working)|ao\d)\.?$/i;
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
  if (SAYS_NOTHING.test(seen(p.head))) bare.push(r.row_id);
  /* 5. WHAT THE PAGE DRAWS: the head, typeset, and nothing of the why or the note. A why's words are
     looked for by a run of them long enough not to be in the head by chance. */
  const drawn = answerBlock_({ answer: r.answer, answerType: r.answer_type, examinerNote: r.examiner_note });
  const whyWords = seen(p.why).split(' ').filter(t => t.length > 3).slice(0, 4).join(' ');
  if (/<details|qans-why|qans-more|qans-note/.test(drawn)
      || drawn.indexOf(typeset_(p.head)) < 0
      || (r.examiner_note && seen(drawn).indexOf(seen(esc(r.examiner_note)).slice(0, 40)) >= 0)
      || (whyWords.split(' ').length >= 3 && seen(drawn).indexOf(whyWords) >= 0 && seen(p.head).indexOf(whyWords) < 0)) {
    extra.push(`${r.row_id}  ${seen(drawn).slice(0, 90)}`);
  }
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
extra.slice(0, 10).forEach(e => fail.push('the answer page draws more than the result: ' + e));
if (extra.length > 10) fail.push(`... and ${extra.length - 10} more answers drawn with more than their result`);
console.log(`\nRESULTS THAT SAY THE WORK WAS DONE, NOT WHAT IT CAME TO  (${bare.length})  — being rewritten in the data`);
console.log(bare.length ? '  ' + bare.slice(0, 8).join(', ') + (bare.length > 8 ? ', …' : '') : '  none');

if (fail.length) {
  console.log(`\nFAIL  (${fail.length})`);
  fail.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log(`\nOK — ${CASES.length} cases of the split behave, every result drawn is ${LIMIT} characters or`
  + `\n     fewer (${Object.keys(ACCEPTED).length} accepted, named above), no fraction or power was cut by the split,`
  + `\n     and all ${answered.length} answers are drawn as their result and nothing else.`);
