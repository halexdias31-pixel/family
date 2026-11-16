#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-points.js A WORDED ANSWER MARKED BY THE POINTS IT MAKES (`rule: points`, owner 16 Nov): for every question
   whose key is a points rule, real answers of each kind -- a full-mark answer, a padded list of key words (low), partial answers
   and an off-topic one (0) -- and, where the source is on the card, a true and a made-up quotation. The answers are in
   check/fixtures/points-cases.js; the keys are read from the library's private half, so a key that drifts from its cases fails here. */
const LIB = require('../check/lib-full.js');
LIB.needWords(); // LIB_PRIVATE=absent (CI, 780): skipped and counted, not passed
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { markingSource } = require('./check-marks-load.js');

const marks = markingSource(ROOT);
if (marks.missing.length) { console.log('check-points: cannot find ' + marks.missing.join(', ') + ' in find.js — renamed?'); process.exit(1); }
global.DATA = { confusables: JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'confusables.json'), 'utf8')) };
eval(marks.source);

const bad = [];
const ok = (c, say) => { if (!c) bad.push(say); };

/* ---------- THE RULE ITSELF, on a made-up key: stems, typos, word order, negation, the sentence tests, quotations, `first`, `phrases` */
const K = 'rule: points max 3; head ached~hurt / headache; limbs heavy; [2] went bedroom; [q] heat intolerable';
const SRC = { html: '<p>' + 'And then, suddenly, the heat became intolerable. Outside in the bush the cicadas shrilled incessantly, and her head ached; '
  + 'her limbs were heavy and tense. She would get up and go into the bedroom, to examine her clothes, to see if there was anything she could do.</p>' };
const P = (t, k, x) => (markPoints_(t, k || K, x || null) || {}).got;
[
  ['Her head ached.', 1, 'a point in a sentence'],
  ['Her head was aching badly.', 1, 'a stem: aching is ached'],
  ['Her haed ached.', 1, 'the typo rule: haed is head'],
  ['Her limbs were very heavy.', 1, 'words a little apart'],
  ['She found that heavy were her limbs.', 1, 'any word order'],
  ['Her head did not ache.', 0, 'negated is not the point'],
  ['Her limbs were not heavy.', 0, 'negated is not the point'],
  ['head ached limbs heavy went bedroom', 0, 'key words with no sentence earn nothing'],
  ['head, ached, limbs, heavy, went, bedroom', 0, 'a comma list of key words earns nothing'],
  ['Her head ached, limbs heavy, bedroom, went', 0, 'a list with one clause in it is still a list of key words'],
  ['Her head ached, her limbs were heavy, she went to the bedroom, and she lay down', 3, 'commas in real sentences are not a list'],
  ['She went into the bedroom.', 2, 'a [2] point'],
  ['Her head ached. Her limbs were heavy. She went to the bedroom.', 3, 'capped at max'],
  ['', null, 'nothing typed is not a wrong answer'],
  ['Her head ached and nothing else at all happened to her limbs that whole long day, though the bag she carried was heavy.', 1, 'a point needs its words close'],
].forEach(([t, want, say]) => { const g = t ? P(t) : markPoints_(t, K, null); ok(want === null ? g === null : g === want, say + ': ' + JSON.stringify(t) + ' got ' + JSON.stringify(g) + ', want ' + want); });
ok(P('She felt "the heat became intolerable".', K, SRC) === 1, 'a [q] point from a true quotation');
ok(P('She felt "the heat was totally intolerable".', K, SRC) === 0, 'a [q] point from a quotation not in the source earns nothing');
ok(P('She felt the heat was intolerable.', K, SRC) === 0, 'a [q] point is not earned without a quotation');
ok(P('She felt "the heat became intolerable".', K, null) === 0, 'no source, no [q] point');
ok(P('It says "her head was spinning and aching" here.', K, SRC) === 0, 'a made-up quotation is taken out before marking');
ok(P('"And then, suddenly, the heat became intolerable. Outside in the bush the cicadas shrilled incessantly, and her head ached; her limbs were heavy and tense."', 'rule: points max 3; head ached; limbs heavy; heat intolerable', SRC) === 1,
  'a long copied quotation earns one point');
const G = 'rule: points max 2, first 2, phrases; volume solution~acid; size~mass potato; time~minutes solution / same time; type potato';
ok(P('volume of solution, size of potato', G) === 2, '`phrases`: a short phrase is an answer');
ok(P('temperature, light, volume of solution, size of potato, time', G) === 0, '`first 2`: only the first two are read');
ok(P('the volume of solution and the size of the potato pieces', G) === 2, '`phrases`: and parts the answers');
ok(P('volume solution size potato time type', G) === 1, '`phrases`: one point a phrase');
/* AND ONE RESULT, OUT OF THE MAXIMUM, through the one marker */
const part = { accept: K, marks: 3, row: { accept: K } };
const v = markPoints_('Her head ached.', K, part, markOpt_(part));
ok(v && v.got === 1 && v.of === 3 && v.points === true, 'one result, the marks out of the maximum: ' + JSON.stringify(v));
ok(markAnswer_('Her head ached. Her limbs were heavy. She went to the bedroom.', K) === true && markAnswer_('Her head ached.', K) === false, 'as a yes or no, all the marks');

/* ---------- EVERY POINTS KEY IN THE LIBRARY, against its real answers (check/fixtures/points-cases.js) */
const CASES = require('../check/fixtures/points-cases.js');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
const priv = LIB.readPrivate('questions') || {};
const byId = new Map(meta.map(r => [r.row_id, r]));
/* the part as the page builds it: its words and the stems above it in its paper (`preamble_`, find-parts.js) */
const partOf = id => {
  const r = byId.get(id) || {}, w = priv[id] || {};
  const stems = meta.filter(s => s.kind === 'preamble' && s.paper_id === r.paper_id && (!s.question || s.question === r.question)).map(s => ({ html: (priv[s.row_id] || {}).html || '' }));
  return { key: id, accept: w.accept || '', marks: Number(r.marks) || 0, lead: w.lead || '', html: w.html || '', stems, row: Object.assign({}, r, w) };
};
let keys = 0, answers = 0;
const subjects = {};
Object.keys(priv).forEach(id => {
  const acc = (priv[id] || {}).accept || '';
  if (!markIsPoints_(acc)) return;
  keys++;
  const r = byId.get(id) || {};
  subjects[r.subject || '?'] = (subjects[r.subject || '?'] || 0) + 1;
  const c = CASES[id];
  if (!c) { bad.push(id + ': a points key with no answers in check/fixtures/points-cases.js'); return; }
  const x = partOf(id), of = markPtRead_(markPointsWay_(acc)).max;
  ok(of === x.marks, id + ': the key is out of ' + of + ', the question ' + x.marks);
  const mark = t => { answers++; const m = markPart_(x, t); return m && m.got; };
  const got = mark(c.full);
  ok(got === of, id + ': a full-mark answer got ' + got + ' of ' + of + ': ' + c.full);
  const pad = mark(c.pad);
  ok(pad <= Math.floor(of / 4), id + ': a padded list of key words got ' + pad + ' of ' + of + ': ' + c.pad);
  const off = mark(c.off);
  ok(off === 0, id + ': an off-topic answer got ' + off + ': ' + c.off);
  (c.partial || []).forEach(([t, want]) => { const g = mark(t); ok(g === want, id + ': got ' + g + ', want ' + want + ': ' + t); });
  (c.quotes || []).forEach(([t, want]) => { const g = mark(t); ok(g === want, id + ': a quotation got ' + g + ', want ' + want + ': ' + t); });
});
Object.keys(CASES).forEach(id => ok(markIsPoints_((priv[id] || {}).accept), id + ': answers in check/fixtures/points-cases.js but no points key in the library'));

/* markPart_ is Find's, cut in with the marker; the part's own scheme marks it */
function markPart_(x, typed) { return markPoints_(typed, markPointsWay_(x.accept), x, markOpt_(x)); }

if (bad.length) {
  console.log('check-points: ' + bad.length + ' wrong\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('check-points: the points rule, and ' + keys + ' points keys (' + Object.keys(subjects).map(s => s + ' ' + subjects[s]).join(', ') + ') marked on ' + answers + ' real answers — full marks, padding low, off-topic 0');
