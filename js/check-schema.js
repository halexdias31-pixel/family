#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-schema.js THE WHOLE LIBRARY AGAINST ITS ONE SCHEMA (check/schema.js, R4), AND THE GATE EVERY ROW-WRITER
   PASSES (R5). `node js/check-schema.js [-v]`; no port. */
'use strict';
const L = require('../check/lib-full.js');
const SC = require('../check/schema.js');

const fail = [];
const note = [];

/* ---------- THE PINNED COUNTS: what the library breaks today, per file and rule. A count may only go DOWN; P4 rewrites the
   rows and brings every one to 0, then this table goes. Lower a pin when a count falls; never raise one. */
const PINNED = {
  'questions:level': 8237, 'questions:tier': 7828, 'questions:agree': 1255, 'questions:source': 2402,
  'questions:topic': 1258, 'questions:marks': 130, 'questions:answer': 47, 'questions:pending': 284, 'questions:total': 1,
  'textbooks:level': 26, 'textbooks:topic': 5,
  'practicals:level': 43, 'practicals:topic': 10,
  'projects:level': 7,
  'inserts:level': 2, 'inserts:pending': 14,
};

/* ---------- 1. EVERY ROW OF EVERY CARD FILE ---------- */
const counts = {}, first = {};
let rowsSeen = 0;
L.NAMES().forEach(name => {
  let rows;
  try { rows = L.rows(name); } catch (e) { fail.push(name + ': the library could not be read whole (' + e.message + ') — not a pass'); return; }
  rowsSeen += rows.length;
  SC.validateFile(rows, name).forEach(p => {
    const k = name + ':' + p.rule;
    counts[k] = (counts[k] || 0) + 1;
    if (!first[k]) first[k] = p.id + ': ' + p.msg;
  });
});
if (rowsSeen < 20000) fail.push('only ' + rowsSeen + ' library rows were read — the library did not load, which is not a pass');
const keys = [...new Set(Object.keys(PINNED).concat(Object.keys(counts)))].sort();
keys.forEach(k => {
  const n = counts[k] || 0, pin = PINNED[k] || 0;
  console.log('  ' + k.padEnd(20) + String(n).padStart(6) + ' (pinned ' + pin + ')' + (first[k] ? '  e.g. ' + first[k].slice(0, 140) : ''));
  if (n > pin) fail.push(k + ': ' + n + ' row problem(s), pinned at ' + pin + ' — a new one, e.g. ' + first[k]);
  else if (n < pin) note.push(k + ': ' + n + ', below its pin of ' + pin + ' — lower PINNED in js/check-schema.js to ' + n);
});

/* ---------- 2. THE RULES, PROVED ON FIXTURES: each catches what it is for and passes what it is not ---------- */
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
[['KS3–GCSE', ['KS3', 'GCSE']], ['KS2–GCSE', ['SATs', 'KS3', 'GCSE']], ['GCSE–A-level', ['GCSE', 'A-Level']],
 ['KS2–KS3', ['SATs', 'KS3']], ['A-Level, AS', ['A-Level', 'AS']], ['Alevel', ['A-Level']], ['KS2 SATs', ['SATs']],
 ['AS level', ['AS']], ['Functional Skills L2', ['Functional Skills L2']], ['', []]].forEach(([cell, want]) => {
  const got = SC.levelsIn(cell);
  if (!eq(got, want)) fail.push('levelsIn_(' + JSON.stringify(cell) + ') is ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want));
});

const qs = L.rows('questions');
const clean = qs.find(r => r.kind === 'question' && r.tier === 'Higher' && r.level === 'GCSE' && !SC.validate(r, 'questions').length);
if (!clean) fail.push('no clean GCSE Higher question to build the fixtures from — the rules were NOT proved');
else {
  const has = (row, rule) => SC.validate(row, 'questions').some(p => p.rule === rule);
  [['tier', { tier: 'Hgher' }], ['level', { level: 'KS3–GCSE' }], ['level', { level: 'Alevel' }], ['column', { tierr: 'Higher' }],
   ['agree', { key_stage: 'KS2' }], ['source', { company: 'Corbettmaths', exam_board: 'Edexcel' }], ['vocab', { exam_board: 'Edexcl' }]]
    .forEach(([rule, change]) => {
      if (!has(Object.assign({}, clean, change), rule)) fail.push('a row with ' + JSON.stringify(change) + ' broke no `' + rule + '` rule');
    });
  if (has(Object.assign({}, clean, { level: 'GCSE' }), 'level')) fail.push('a row with level GCSE broke the level rule');

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

  /* ---------- 4. AND SO DOES THE SPLIT EVERY OTHER TOOL ENDS WITH (tools/lib-private.js) ---------- */
  const { splitGate } = require('../tools/lib-private.js');
  const prac = L.rows('practicals');
  try { splitGate('practicals', prac, {}, prac); } catch (e) { fail.push('the split refused the practicals as they are: ' + e.message.slice(0, 160)); }
  let refused = '';
  try { splitGate('practicals', prac.map((r, i) => (i ? r : Object.assign({}, r, { level: 'GCSE–A-Levle' }))), {}, prac); } catch (e) { refused = e.message; }
  if (!/refused/.test(refused)) fail.push('tools/lib-private.js split took a practical whose level is "GCSE–A-Levle"');
}

console.log('\n' + rowsSeen + ' library rows against check/schema.js; ' + Object.keys(counts).length + ' file:rule counts, all at or under their pins.');
if (note.length) { console.log('\nWORTH A LOOK — not failures:'); note.forEach(n => console.log('  ' + n)); }
if (fail.length) {
  console.log('\nTHE LIBRARY BREAKS ITS SCHEMA:');
  fail.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('OK — every library row is checked against the one schema, no count rose above its pin, and both writers refuse a bad row.');
