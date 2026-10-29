#!/usr/bin/env node
/* node js/check-missing.js [-v] — WHAT'S MISSING (525): js/missing.js's gaps for a fixture list and covers, and data/settings/expected-papers.json spelled as check/schema.js spells the library. -v prints today's gaps. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const SCHEMA = require('../check/schema.js');
const bad = [];

/* ---------- THE PHONE'S OWN CODE, run in a sandbox with the few helpers it borrows from the files before it ---------- */
const src = fs.readFileSync(path.join(__dirname, 'missing.js'), 'utf8');
function load(code) {
  const ctx = vm.createContext({
    document: { addEventListener() {}, getElementById: () => null }, window: {},
    libIsDoc_: r => !!r && String(r.kind || '').toLowerCase() === 'document',
    libTrue: v => /^(true|yes|1|y|on)$/i.test(String(v == null ? '' : v).trim()),
    esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    loading_: () => '<div class="loading"></div>', rankAtLeast_: () => true,
  });
  vm.runInContext(code + '\n;this.__M = { entry: missingEntry_, gaps: missingGaps_, cover: missingCover_, owns: missingOwns_, is: missingIs_, MISSING, body: missingBody_ };', ctx);
  return ctx.__M;
}
let M;
try { M = load(src); } catch (e) { console.log('! js/missing.js would not load: ' + e.message + ' — NOTHING was checked'); process.exit(1); }

/* ---------- A FIXTURE: what a list asks and which covers are there, and the gaps that must come back ---------- */
const cover = o => Object.assign({ kind: 'document', document_type: 'Past paper', active: 'True' }, o);
const FIX_LIST = [
  { board: 'Edexcel', level: 'A-Level', subject: 'Maths', spec: '9MA0', label: 'Edexcel A-level Maths', papers: ['1', '2', '31', '32'],
    series: ['June'], from: 2018, to: 2019, also: ['November 2020'], skip: [], papers_in: { 'June 2018': ['1', '2', '3'] } },
  { board: 'Edexcel', level: 'GCSE', subject: 'Maths', label: 'Edexcel GCSE Maths', papers: ['1F', '1H'], series: ['June', 'November'], from: 2017, to: 2017 },
  { board: 'AQA', level: 'A-Level', subject: 'Religious Studies', spec: '7062', label: 'AQA RS', papers: ['1', '2'], from: 2022, to: 2022 },
  { board: 'AQA', level: 'A-Level', subject: 'Religious Studies', spec: '7172', label: 'AQA Philosophy', papers: ['1', '2'], from: 2022, to: 2022 },
  { board: 'AQA', level: 'GCSE', subject: 'Geography', label: 'AQA GCSE Geography', papers: ['1', '2', '3'], from: 2022, to: 2023, skip: ['June 2023'] },
  { board: 'Nobody' },
];
const FIX_ROWS = [
  /* June 2018: a single Paper 3, as the list says that sitting had. */
  cover({ paper_id: 'E18-1', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2018', month: '6', paper: '1', name: 'Paper 1 — June 2018', spec_code: '9MA0/01' }),
  cover({ paper_id: 'E18-3', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2018', month: '6', paper: '3', name: 'Paper 3: Statistics and Mechanics — June 2018' }),
  /* PAPER 31 IS FILED AS 3 and named 31; switched off, it is still in the library. */
  cover({ paper_id: 'E19-31', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2019', month: '5', paper: '3', name: 'Paper 31: Statistics — June 2019', active: 'False' }),
  cover({ paper_id: 'E19-1', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2019', month: '6', paper: '1', name: 'Paper 1 — June 2019' }),
  cover({ paper_id: 'E19-2', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2019', month: '6', paper: '2', name: 'Paper 2 — June 2019' }),
  /* AN AS PAPER IS NOT AN A-LEVEL ONE, nor a specimen a past paper, nor a question a cover. */
  cover({ paper_id: 'AS19-32', exam_board: 'Edexcel', level: 'AS', subject: 'Maths', year: '2019', month: '6', paper: '3', name: 'Paper 32 — June 2019' }),
  cover({ paper_id: 'SP-2', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2020', month: '11', paper: '2', name: 'Paper 2', document_type: 'Specimen paper' }),
  { kind: 'question', paper_id: 'E19-2', exam_board: 'Edexcel', level: 'A-Level', subject: 'Maths', year: '2020', month: '11', paper: '1', lib_pending: 'True' },
  /* NO YEAR OR MONTH CELL: the name says November 2017; the tier says H. */
  cover({ paper_id: 'G17-1H', exam_board: 'Edexcel', level: 'GCSE', subject: 'Maths', paper: '1', tier: 'Higher', name: '2017 Paper 1 Thursday 2 November' }),
  /* THE TIER FROM THE SPEC CODE when the cell is blank. */
  cover({ paper_id: 'G17-1F', exam_board: 'Edexcel', level: 'GCSE', subject: 'Maths', year: '2017', month: '6', paper: '1', spec_code: '1MA1/1F', name: 'Paper 1 — June 2017' }),
  /* 7172 IS PHILOSOPHY though filed under RS: it is not RS's Paper 1. */
  cover({ paper_id: 'PH22-2', exam_board: 'AQA', level: 'A-Level', subject: 'Religious Studies', year: '2022', month: '6', paper: '2', spec_code: '7172/2', name: 'Philosophy Paper 2 — June 2022' }),
  cover({ paper_id: 'RS22-1', exam_board: 'AQA', key_stage: 'KS5', subject: 'Religious Studies', year: '2022', month: '6', paper: '1', spec_code: '7062/1', name: 'Paper 1 — June 2022' }),
  cover({ paper_id: 'RS22-2', exam_board: 'AQA', level: 'A-Level', subject: 'Religious Studies', year: '2022', month: '6', paper: '2', spec_code: '7062/2B', name: 'Paper 2B Christianity and dialogues — June 2022' }),
  { kind: 'question', paper_id: 'RS22-2', lib_pending: 'True' }, { kind: 'question', paper_id: 'RS22-2', lib_pending: 'True' },
  /* A BLANK LEVEL IS THE KEY STAGE'S: KS5 is A-level. No spec: RS's (the first line), never Philosophy's Paper 1 too. */
  cover({ paper_id: 'RS-70621-2206', exam_board: 'AQA', key_stage: 'KS5', subject: 'Religious Studies', year: '2022', name: 'Paper 1: Philosophy of religion and ethics — June 2022' }),
];
const want = {
  'Edexcel A-level Maths': { 'June 2018': ['2'], 'June 2019': ['32'], 'November 2020': ['1', '2', '31', '32'] },
  'Edexcel GCSE Maths': { 'June 2017': ['1H'], 'November 2017': ['1F'] },
  'AQA RS': {},
  'AQA Philosophy': { 'June 2022': ['1'] },
  'AQA GCSE Geography': { 'June 2022': ['1', '2', '3'] },
};
const quals = FIX_LIST.map(M.entry);
if (quals[5] !== null) bad.push('an entry with no level, subject, papers or years was read as ' + JSON.stringify(quals[5]));
const got = M.gaps(quals.filter(Boolean), FIX_ROWS);
const shape = {};
got.quals.forEach(g => { shape[g.q.label] = {}; g.gaps.forEach(x => { shape[g.q.label][x.sitting] = x.papers.slice(); }); });
if (JSON.stringify(shape) !== JSON.stringify(want)) bad.push('the fixture\'s gaps came back\n    ' + JSON.stringify(shape) + '\n  and should be\n    ' + JSON.stringify(want));
const geo = got.quals.find(g => g.q.label === 'AQA GCSE Geography');
if (!geo || geo.missing !== geo.want) bad.push('a qualification with no cover is not "none yet" (missing ' + (geo && geo.missing) + ' of ' + (geo && geo.want) + ')');
if (!got.quals.find(g => g.q.label === 'AQA RS') || got.quals.find(g => g.q.label === 'AQA RS').missing) bad.push('a complete qualification has gaps');
/* WAITING IS COUNTED BY COVER: RS22-2's two pending questions are one paper, E19-2's one is another. */
if (got.waiting !== 2) bad.push('papers waiting for their words: ' + got.waiting + ', and the fixture has two covers with pending questions (RS22-2, E19-2)');
const rs = got.quals.find(g => g.q.label === 'AQA RS');
if (!rs || rs.waiting !== 1) bad.push('AQA RS should count one paper waiting, and counted ' + (rs && rs.waiting));

/* ---------- A PRESENT PAPER IS NEVER LISTED — every past-paper cover in the real library, against the real list ---------- */
const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
let list, rows;
try { list = readJson('data/settings/expected-papers.json'); } catch (e) { bad.push('data/settings/expected-papers.json does not parse: ' + e.message); list = []; }
try { rows = readJson('data/questions.json'); } catch (e) { console.log('! data/questions.json does not parse — NOTHING was checked against the library'); process.exit(1); }
if (!Array.isArray(list) || !list.length) bad.push('data/settings/expected-papers.json is not a list with entries — the real gaps were NOT checked');
const quals_ = (Array.isArray(list) ? list : []).map(M.entry).filter(Boolean);
const real = M.gaps(quals_, rows);
let present = 0;
rows.map(M.cover).filter(Boolean).forEach(c => {
  real.quals.forEach(g => {
    if (!M.owns(quals_, g.q, c)) return;
    const listed = (g.gaps.find(x => x.sitting === c.sitting) || { papers: [] }).papers;
    listed.filter(code => M.is(c, code)).forEach(code => bad.push(g.q.label + ' lists ' + code + ' ' + c.sitting + ' as missing, and ' + c.id + ' is that paper'));
    present++;
  });
});
if (!present) bad.push('no cover in data/questions.json belongs to any listed qualification — the "never listed" rule asked nothing');

/* ---------- THE LIST IS SPELLED AS THE LIBRARY SPELLS IT (check/schema.js), or the widget compares against nothing ---------- */
const V = SCHEMA.VOCAB(), TIER_LETTERS = SCHEMA.TIERS().map(t => t.charAt(0));
const KEYS = ['board', 'level', 'subject', 'spec', 'label', 'papers', 'series', 'from', 'to', 'also', 'skip', 'papers_in'];
const SITTING = /^(June|November) (\d{4})$/;
function spelling(e, i) {
  const out = [], at = 'expected-papers.json line ' + (i + 2) + ' (' + ((e && e.label) || '?') + '): ';
  if (!e || typeof e !== 'object' || Array.isArray(e)) return [at + 'not an object'];
  Object.keys(e).forEach(k => { if (KEYS.indexOf(k) === -1) out.push(at + 'unknown key "' + k + '" (' + KEYS.join(', ') + ')'); });
  if (SCHEMA.BOARDS.indexOf(e.board) === -1) out.push(at + 'board ' + JSON.stringify(e.board) + ' is not one of ' + SCHEMA.BOARDS.join(', '));
  if (SCHEMA.LEVELS().indexOf(e.level) === -1) out.push(at + 'level ' + JSON.stringify(e.level) + ' is not one of ' + SCHEMA.LEVELS().join(', '));
  if (V.subject.indexOf(e.subject) === -1) out.push(at + 'subject ' + JSON.stringify(e.subject) + ' is not a subject the library spells');
  if (e.spec !== undefined && !/^[0-9A-Z]{4}$/.test(String(e.spec))) out.push(at + 'spec ' + JSON.stringify(e.spec) + ' is not a four-character code like 9MA0 or H240');
  if (typeof e.label !== 'string' || !e.label.trim()) out.push(at + 'no label');
  const code = p => {
    const m = /^(\d{1,2})([A-Z]?)$/.exec(String(p));
    return !!m && V.paper.indexOf(m[1].charAt(0)) !== -1 && (!m[2] || TIER_LETTERS.indexOf(m[2]) !== -1);
  };
  if (!Array.isArray(e.papers) || !e.papers.length) out.push(at + 'no papers');
  else e.papers.filter(p => !code(p)).forEach(p => out.push(at + 'paper ' + JSON.stringify(p) + ' is not a paper number (' + V.paper.join('–') + ', 31 for Paper 31) with F or H for a tier'));
  if (e.series !== undefined && (!Array.isArray(e.series) || e.series.some(x => x !== 'June' && x !== 'November'))) out.push(at + 'series ' + JSON.stringify(e.series) + ' — only "June" and "November"');
  if (!Number.isInteger(e.from) || !Number.isInteger(e.to) || e.from < 2000 || e.to < e.from) out.push(at + 'from and to must be years, from first');
  ['also', 'skip'].forEach(k => {
    if (e[k] === undefined) return;
    if (!Array.isArray(e[k])) out.push(at + k + ' is not a list');
    else e[k].filter(x => !SITTING.test(String(x))).forEach(x => out.push(at + k + ' ' + JSON.stringify(x) + ' is not a sitting like "June 2022"'));
  });
  if (e.papers_in !== undefined) {
    if (!e.papers_in || typeof e.papers_in !== 'object' || Array.isArray(e.papers_in)) out.push(at + 'papers_in is not an object');
    else Object.keys(e.papers_in).forEach(k => {
      if (!SITTING.test(k)) out.push(at + 'papers_in ' + JSON.stringify(k) + ' is not a sitting like "June 2018"');
      if (!Array.isArray(e.papers_in[k]) || !e.papers_in[k].length || !e.papers_in[k].every(code)) out.push(at + 'papers_in ' + k + ' is not a list of papers');
    });
  }
  /* AND THE PHONE READS IT: a line the check passes and the card cannot read would be counted "not understood". */
  if (!out.length && !M.entry(e)) out.push(at + 'spelled right and still not read by missingEntry_');
  return out;
}
(Array.isArray(list) ? list : []).forEach((e, i) => spelling(e, i).forEach(x => bad.push(x)));
const labels = (Array.isArray(list) ? list : []).map(e => e && e.label);
labels.filter((l, i) => labels.indexOf(l) !== i).forEach(l => bad.push('expected-papers.json names ' + JSON.stringify(l) + ' twice — a fold opens by its label'));
/* THE SPELLING RULE CATCHES A MISSPELLING — asked of three, so a rule that passes everything fails here. */
[{ board: 'Edexcell', level: 'A-Level', subject: 'Maths', label: 'x', papers: ['1'], from: 2018, to: 2019 },
 { board: 'AQA', level: 'A level', subject: 'Maths', label: 'x', papers: ['1'], from: 2018, to: 2019 },
 { board: 'AQA', level: 'GCSE', subject: 'Maths', label: 'x', papers: ['1X'], serie: ['June'], from: 2018, to: 2019 }]
  .forEach((e, i) => { if (!spelling(e, i).length) bad.push('the spelling rule passed a misspelled line: ' + JSON.stringify(e)); });

/* ---------- THE CARD: empty or absent list says so; a list draws a fold per qualification ---------- */
M.MISSING.list = [];
if (!/Nothing listed to expect yet/.test(M.body())) bad.push('an empty list does not say "Nothing listed to expect yet"');

if (require('../check/quiet').VERBOSE) {
  console.log('today: ' + real.waiting + ' papers waiting for their words');
  real.quals.forEach(g => console.log('  ' + g.q.label + ' — ' + (!g.missing ? 'complete' : g.missing === g.want ? 'none yet' : g.missing + ' missing of ' + g.want)
    + (g.gaps.length && g.missing !== g.want ? ': ' + g.gaps.map(x => x.sitting + ' ' + x.papers.join('/')).join('; ') : '')));
}
if (bad.length) { console.log('check-missing: ' + bad.length + ' FAILED'); bad.forEach(b => console.log('  ✗ ' + b)); process.exit(1); }
console.log('check-missing: the fixture\'s gaps, ' + present + ' covers never listed, ' + list.length + ' qualifications spelled as the library spells them');
