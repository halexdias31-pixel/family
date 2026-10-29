#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-schema.js THE WHOLE LIBRARY AGAINST ITS ONE SCHEMA (check/schema.js, R4), AND THE GATE EVERY ROW-WRITER
   PASSES (R5). `node js/check-schema.js [-v]`; no port. */
'use strict';
const L = require('../check/lib-full.js');
const SC = require('../check/schema.js');

const fail = [];
const note = [];

/* ---------- 1. EVERY ROW OF EVERY CARD FILE: no problem at all (P4 rewrote the rows; the pinned counts are gone) ---------- */
/* A private field of a lib_pending row is not counted: whether its words are here depends on the last pull (history 523). */
const counts = {}, first = {};
let rowsSeen = 0, unsure = 0;
L.NAMES().forEach(name => {
  let rows;
  try { rows = L.rows(name); } catch (e) { fail.push(name + ': the library could not be read whole (' + e.message + ') — not a pass'); return; }
  rowsSeen += rows.length;
  const def = L.defs().files[name];
  const priv = new Set(def.private || []);
  const pend = new Set(rows.filter(r => /^true$/i.test(String(r.lib_pending || '').trim())).map(r => L.idOf(def, r)));
  SC.validateFile(rows, name).forEach(p => {
    if (priv.has(p.col) && pend.has(p.id)) { unsure++; return; }
    const k = name + ':' + p.rule;
    counts[k] = (counts[k] || 0) + 1;
    if (!first[k]) first[k] = [];
    if (first[k].length < 5) first[k].push(p.id + ': ' + p.msg);
  });
});
if (rowsSeen < 20000) fail.push('only ' + rowsSeen + ' library rows were read — the library did not load, which is not a pass');
Object.keys(counts).sort().forEach(k => {
  console.log('  ' + k.padEnd(20) + String(counts[k]).padStart(6) + '  e.g. ' + first[k][0].slice(0, 140));
  fail.push(k + ': ' + counts[k] + ' row problem(s) — ' + first[k].join('; ') + (counts[k] > first[k].length ? '; …' : ''));
});

/* THE FILL-IN STANDARD, COUNTED: every live part whose words (here) ask to fill something in has cells — a silence is no pass. */
const qWhole = L.rows('questions');
const asks = qWhole.filter(r => r.kind === 'question' && r.active !== 'False' && SC.fillIn(r.html));
const withCells = asks.filter(r => String(r.cells || '').trim()).length;
console.log('  fill-in parts with their words here: ' + asks.length + ', ' + withCells + ' of them with cells');
if (asks.length < 100) fail.push('only ' + asks.length + ' parts ask to fill something in — the words did not load, so the fill-in rule was not asked');

/* ---------- 2. THE RULES, PROVED ON FIXTURES: each catches what it is for and passes what it is not ---------- */
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
[['KS3–GCSE', ['KS3', 'GCSE']], ['KS2–GCSE', ['SATs', 'KS3', 'GCSE']], ['GCSE–A-level', ['GCSE', 'A-Level']],
 ['KS2–KS3', ['SATs', 'KS3']], ['A-Level, AS', ['A-Level', 'AS']], ['Alevel', ['A-Level']], ['KS2 SATs', ['SATs']],
 ['AS level', ['AS']], ['Functional Skills L2', ['Functional Skills L2']], ['', []],
 ['KS2-KS3', ['SATs', 'KS3']], ['GCSE-A-Level', ['GCSE', 'A-Level']], ['GCSE/A-Level', ['GCSE', 'A-Level']],
 ['AS – A-Level', ['AS', 'A-Level']], ['11+ to KS3', ['11+', 'KS3']], ['AS-level', ['AS']], ['A-Level', ['A-Level']],
 ['N/A', ['N/A']], ['Year 7-9', ['Year 7-9']]].forEach(([cell, want]) => {
  const got = SC.levelsIn(cell);
  if (!eq(got, want)) fail.push('levelsIn_(' + JSON.stringify(cell) + ') is ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want));
});

/* THE SUNDAY EMAIL'S COPY (backend/digest.gs `digestLevelsIn_`) READS EVERY LEVEL CELL IN THE LIBRARY AS find.js DOES. */
try {
  const b = require('./check-gas-load.js').backend();
  const cells = new Set(['KS3–GCSE', 'KS2–GCSE', 'GCSE–A-level', 'KS2-KS3', 'GCSE/A-Level', 'AS – A-Level', '11+ to KS3', 'N/A', 'KS1 SATs', 'sats']);
  L.NAMES().forEach(name => {
    const f = SC.FILES[name];
    L.rows(name).forEach(r => [f.level, f.forLevels, f.keystage, 'band_value'].forEach(c => { if (c && r[c]) cells.add(String(r[c])); }));
  });
  const differ = [...cells].filter(c => !eq(b.ev('digestLevelsIn_(' + JSON.stringify(c) + ')'), SC.levelsIn(c)));
  console.log('  the email\'s level copy: ' + cells.size + ' cells, ' + differ.length + ' read differently');
  if (cells.size < 20) fail.push('only ' + cells.size + ' level cells were compared with the email\'s copy — not a pass');
  differ.slice(0, 5).forEach(c => fail.push('backend/digest.gs reads level ' + JSON.stringify(c) + ' as ' + JSON.stringify(b.ev('digestLevelsIn_(' + JSON.stringify(c) + ')')) + ', find.js as ' + JSON.stringify(SC.levelsIn(c))));
} catch (e) { fail.push('the email\'s level copy could not be compared with find.js: ' + e.message + ' — not a pass'); }

const qs = L.rows('questions');
const clean = qs.find(r => r.kind === 'question' && r.tier === 'Higher' && r.level === 'GCSE' && S(r.topics) && !SC.validate(r, 'questions').length);
function S(v) { return (v === undefined || v === null ? '' : String(v)).trim(); }
if (!clean) fail.push('no clean GCSE Higher question to build the fixtures from — the rules were NOT proved');
else {
  /* EVERY RULE, BOTH WAYS: a change that must break it, and one beside it that must not. A rule switched off goes red here. */
  const has = (row, rule) => SC.validate(row, 'questions').some(p => p.rule === rule);
  const topic = S(clean.topics).split(',')[0].trim();
  [['tier', { tier: 'Hgher' }, { tier: 'Foundation' }],
   ['level', { level: 'KS3–GCSE' }, { level: 'GCSE' }],
   ['level', { level: 'Alevel' }, { level: 'GCSE' }],
   ['level', { band_type: 'stage', band_value: 'Grade 4' }, { band_type: 'stage', band_value: 'GCSE' }],
   ['column', { tierr: 'Higher' }, { tier: 'Higher' }],
   ['agree', { key_stage: 'KS2' }, { key_stage: 'KS4' }],
   ['agree', { band_type: 'stage', band_value: 'KS3', key_stage: '', tier: '' }, { band_type: 'stage', band_value: 'GCSE', key_stage: '', tier: '' }],
   ['source', { company: 'Corbettmaths', exam_board: 'Edexcel' }, { company: 'Corbettmaths', exam_board: '' }],
   ['board', { document_type: 'Past paper', company: '', exam_board: 'Edexcel' }, { document_type: 'Past paper', company: 'Edexcel', exam_board: 'Edexcel' }],
   ['board', { document_type: 'Specimen paper', company: 'AQA', exam_board: '' }, { document_type: 'Worksheet', company: '', exam_board: '' }],
   ['vocab', { exam_board: 'Edexcl' }, { exam_board: 'AQA' }],
   ['vocab', { key_stage: 'KS9' }, { key_stage: 'KS4' }],
   ['vocab', { answer_type: 'essayy' }, { answer_type: 'short' }],
   ['topic', { topics: topic + ', Not A Topic Anywhere' }, { topics: topic }],
   ['marks', { marks: '2.5' }, { marks: '2' }],
   ['marks', { total_marks: 'eighty' }, { total_marks: '80' }],
   ['answer', { answer_type: 'calculation', answer: 'x squared', accept: '' }, { answer_type: 'calculation', answer: '12', accept: '' }],
   ['answer', { answer_type: 'calculation', answer: '<b>random</b> &mdash; 2 ways', accept: 'random' },
              { answer_type: 'calculation', answer: '<b>(a + b)(a &minus; b)</b> &mdash; a difference of squares', accept: '' }],
   ['cells', { kind: 'question', active: 'True', html: '<p>Complete the table.</p>', cells: '' },
             { kind: 'question', active: 'True', html: '<p>Complete the table.</p>', cells: '(i) = 4 ; (ii) = 9' }],
   ['cells', { kind: 'question', active: 'True', html: '<p>What number goes in box <b>(a)</b>?</p>', cells: '' },
             { kind: 'question', active: 'True', html: '<p>Reflect shape A in the y-axis. Label the image shape C.</p>', cells: '' }],
   ['cells', { kind: 'question', active: 'True', html: '<p>Fill in the missing square numbers.</p>', cells: '' },
             { kind: 'question', active: 'True', html: '<p>Fill in the missing number: 5/8 = ?/24</p>', cells: '' }],
   ['cells', { kind: 'question', active: 'True', html: '<p>Match each tissue to its feature.</p>', cells: '' },
             { kind: 'question', active: 'True', html: '<p>Complete the pie chart. Label each sector.</p>', cells: '' }],
   ['answer', { answer_type: 'order', html: 'Put these in order.', choices: '', choice_right: '' },
              { answer_type: 'order', html: 'Put these in order.', choices: '1|2|3', choice_right: '3|1|2' }]]
    .forEach(([rule, bad, good]) => {
      if (!has(Object.assign({}, clean, bad), rule)) fail.push('a row with ' + JSON.stringify(bad) + ' broke no `' + rule + '` rule');
      if (has(Object.assign({}, clean, good), rule)) fail.push('a row with ' + JSON.stringify(good) + ' broke the `' + rule + '` rule');
    });

  /* THE TWO CROSS-ROW RULES, through validateFile: a preamble over no question, and a cover whose total its parts miss. */
  const fx = (pid, more) => [{ row_id: 'D-' + pid, paper_id: pid, kind: 'document', total_marks: '5' }].concat(more);
  const rulesIn = rows => SC.validateFile(rows, 'questions').map(p => p.rule);
  const q = (pid, n, marks) => ({ row_id: pid + '-Q' + n, paper_id: pid, kind: 'question', question: String(n), marks: String(marks) });
  const pre = (pid, n) => ({ row_id: pid + '-P' + n, paper_id: pid, kind: 'preamble', question: String(n) });
  if (rulesIn(fx('FX1', [pre('FX1', 9), q('FX1', 1, 5)])).indexOf('preamble') === -1) fail.push('a preamble over question 9, which its paper lacks, broke no `preamble` rule');
  if (rulesIn(fx('FX2', [pre('FX2', 1), q('FX2', 1, 5)])).indexOf('preamble') !== -1) fail.push('a preamble over its own question broke the `preamble` rule');
  if (rulesIn(fx('FX3', [q('FX3', 1, 2), q('FX3', 2, 2)])).indexOf('total') === -1) fail.push('a paper of 5 marks whose parts sum to 4 broke no `total` rule');
  if (rulesIn(fx('FX4', [q('FX4', 1, 2), q('FX4', 2, 3)])).indexOf('total') !== -1) fail.push('a paper of 5 marks whose parts sum to 5 broke the `total` rule');
  /* A SWITCHED-OFF PART IS STILL ON THE PAPER: its marks count towards the cover's total. */
  if (rulesIn(fx('FX5', [q('FX5', 1, 2), Object.assign(q('FX5', 2, 3), { active: 'False' })])).indexOf('total') !== -1) fail.push('a paper of 5 marks whose live and switched-off parts sum to 5 broke the `total` rule');
  /* A PAST-PAPER PART WITH NO MARKS: wrong alone; right when a later part of its question carries the run's marks and says so. */
  const pq = (pid, part, marks, note) => Object.assign({ row_id: pid + '-Q1' + part, paper_id: pid, kind: 'question', question: '1', part: part,
    active: 'True', document_type: 'Past paper', marks: marks }, note === undefined ? {} : { examiner_note: note });
  const shared = 'The paper gives 2 marks for the two values together.';
  if (rulesIn([pq('FX6', 'a', '', ''), pq('FX6', 'b', '2', '')]).indexOf('marks') === -1) fail.push('a past-paper part with no marks, its next part saying nothing of sharing, broke no `marks` rule');
  if (rulesIn([pq('FX7', 'a', '', ''), pq('FX7', 'b', '2', shared)]).indexOf('marks') !== -1) fail.push('a past-paper run whose last part carries the marks for both, and says so, broke the `marks` rule');
  if (rulesIn([pq('FX8', 'a', '2', shared), pq('FX8', 'b', '', '')]).indexOf('marks') === -1) fail.push('a past-paper part with no marks and no later part broke no `marks` rule');
  if (rulesIn(fx('FX9', [pq('FX9', 'a', '', ''), pq('FX9', 'b', '5', shared)])).indexOf('total') !== -1) fail.push('a paper of 5 marks whose one run shares its 5 broke the `total` rule');
  if (rulesIn(fx('FX10', [pq('FX10', 'a', '', ''), pq('FX10', 'b', '4', shared)])).indexOf('total') === -1) fail.push('a paper of 5 marks whose one run shares 4 broke no `total` rule');

  /* ---------- 3. THE IMPORTER REFUSES A BAD ROW AND WRITES NOTHING (tools/add-past-paper.js, in memory) ---------- */
  const { importPapers } = require('../tools/add-past-paper.js');
  const def = L.defs().files.questions;
  const meta = JSON.parse(require('fs').readFileSync(require('path').join(L.ROOT, def.file), 'utf8'));
  const priv = L.readPrivate('questions') || {};
  const pid = clean.paper_id;
  const mine = qs.filter(r => r.paper_id === pid && r.kind !== 'document');
  const spec = rows => ({ paper_id: pid, meta: {}, doc: {}, rows: rows });
  const before = JSON.stringify(meta.filter(r => r.paper_id === pid));
  try { importPapers(meta, priv, [spec(mine.map(r => Object.assign({}, r)))]); }
  catch (e) { fail.push('the importer refused paper ' + pid + ' re-imported as it is: ' + e.message.split('\n').slice(0, 2).join(' ')); }
  let threw = '';
  try { importPapers(meta, priv, [spec(mine.map(r => Object.assign({}, r, r.row_id === clean.row_id ? { tier: 'Hgher' } : {})))]); }
  catch (e) { threw = e.message; }
  if (!/tier "Hgher"/.test(threw)) fail.push('tools/add-past-paper.js took a row with tier "Hgher"' + (threw ? ' (it threw: ' + threw.slice(0, 120) + ')' : ''));
  if (JSON.stringify(meta.filter(r => r.paper_id === pid)) !== before) fail.push('the importer changed the rows it was given while refusing them');

  /* A BRAND-NEW PAPER EXACTLY AS tools/paperspec.py WRITES IT — every row lib_pending, its words on it — onto an empty cover. */
  const NEW = 'RFIX01';
  const cover = { row_id: 'D-' + NEW, paper_id: NEW, kind: 'document', active: 'False', name: '2017 Paper 1', subject: 'Maths',
                  tier: 'Higher', exam_board: 'Edexcel', level: 'GCSE', paper: '1', document_type: 'Past paper', source_id: NEW };
  const pmeta = { paper_id: NEW, name: '2017 Paper 1', subject: 'Maths', key_stage: 'KS4', band_type: 'stage', band_value: 'GCSE',
                  tier: 'Higher', trackable: 'True', printable: 'True', company: 'Edexcel', exam_board: 'Edexcel', exam_wave: 'First wave',
                  year: '2017', level: 'GCSE', paper: '1', month: '11', document_type: 'Past paper', source_id: NEW };
  const prow = r => Object.assign({}, pmeta, r, { lib_pending: 'True' });
  const fresh = [prow({ row_id: 'Q-FIX-1', question: '1', kind: 'preamble', active: 'True', html: 'Here is a table.' }),
                 prow({ row_id: 'Q-FIX-1a', question: '1', part: 'a', kind: 'question', marks: '2', answer_type: 'calculation',
                        needs_print: 'False', active: 'True', topics: topic, html: 'Work out 3 × 4.', answer: '12', verified: 'True' }),
                 prow({ row_id: 'Q-FIX-1b', question: '1', part: 'b', kind: 'question', marks: '3', answer_type: 'short',
                        needs_print: 'False', active: 'True', topics: topic, html: 'Name it.', answer: 'a table', verified: 'True' })];
  try { importPapers(meta.concat([cover]), priv, [{ paper_id: NEW, meta: pmeta, doc: { exam_date: '2017-11-02', spec_code: '1MA1/1H', total_marks: '5' }, rows: fresh }]); }
  catch (e) { fail.push('the importer refused a brand-new paper shaped as tools/paperspec.py writes it: ' + e.message.split('\n').slice(0, 3).join(' ')); }

  /* ---------- 4. AND SO DOES THE SPLIT EVERY OTHER TOOL ENDS WITH (tools/lib-private.js) ---------- */
  const { splitGate } = require('../tools/lib-private.js');
  const prac = L.rows('practicals');
  try { splitGate('practicals', prac, {}, prac); } catch (e) { fail.push('the split refused the practicals as they are: ' + e.message.slice(0, 160)); }
  let refused = '';
  try { splitGate('practicals', prac.map((r, i) => (i ? r : Object.assign({}, r, { level: 'GCSE–A-Levle' }))), {}, prac); } catch (e) { refused = e.message; }
  if (!/refused/.test(refused)) fail.push('tools/lib-private.js split took a practical whose level is "GCSE–A-Levle"');

  /* A NEW CONTENT CARD WITH lib_pending AND ITS WORDS ON IT (411): what a content tool hands the split; it passes. */
  const tb = L.rows('textbooks');
  const base = tb.find(r => !/^true$/i.test(S(r.lib_pending)) && L.privateOf(L.defs().files.textbooks, r) && !SC.validate(r, 'textbooks').length);
  if (!base) fail.push('no clean content card to build the new-card fixture from — not proved');
  else {
    const card = Object.assign({}, base, { chapter: '9999', title: 'A new chapter', lib_pending: 'True' });
    try { splitGate('textbooks', tb.concat([card]), {}, tb); }
    catch (e) { fail.push('the split refused a new lib_pending content card with its words: ' + e.message.split('\n').slice(0, 2).join(' ')); }
  }
}

console.log('\n' + rowsSeen + ' library rows against check/schema.js, ' + Object.keys(counts).length + ' file:rule(s) with a problem; '
  + unsure + ' problem(s) in the words of lib_pending rows not counted (they depend on what this machine last pulled).');
if (note.length) { console.log('\nWORTH A LOOK — not failures:'); note.forEach(n => console.log('  ' + n)); }
if (fail.length) {
  console.log('\nTHE LIBRARY BREAKS ITS SCHEMA:');
  fail.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('OK — every library row (' + rowsSeen + ') keeps the one schema, every fill-in part (' + asks.length + ') has cells, and both writers refuse a bad row.');
