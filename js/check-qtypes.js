#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-qtypes.js — EVERY QUESTION PART HAS ONE INTERACTION TYPE, AND EVERY TYPE A PROTOCOL (375).
   Fails on a part with no type, a protocol missing a field, or a fixture typed wrong. Gaps are a report. */
/* Flags: --type=<id> lists that type's incomplete parts; --all lists every one. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] || '';
const broken = [];

/* ---------- THE FILE ALONE IN A VM: it must read nothing declared elsewhere, so Node and the page share it */
let Q = null;
try {
  Q = vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'qtypes.js'), 'utf8')
    + '\n;({ qType_, qtIncomplete_, qtMachine_, QTYPE_PROTOCOL, QTYPE_ORDER })', vm.createContext({}));
} catch (e) { broken.push('js/qtypes.js did not load alone in a vm: ' + e.message); }

/* ---------- EVERY PROTOCOL SAYS EVERY THING */
const FIELDS = ['label', 'surface', 'tiles', 'marked', 'tolerance', 'wrong', 'right', 'phone', 'pc', 'need'];
if (Q) Q.QTYPE_ORDER.forEach(t => {
  const p = Q.QTYPE_PROTOCOL[t];
  FIELDS.forEach(f => { if (!p[f] || (Array.isArray(p[f]) && !p[f].length)) broken.push(`protocol ${t} has no ${f}`); });
  /* one Check per card (368): never two */
  if (p.tiles.filter(x => /^Check/.test(x)).length > 1) broken.push(`protocol ${t} lists Check twice`);
});

/* ---------- THE FIXTURE: one row of each kind the data spells differently, and the type it must get */
const FIX = [
  ['value', { answer_type: 'calculation', html: '<p>Work out 3 + 4</p>', accept: '7' }],
  ['unit', { answer_type: 'calculation', html: '<p>Find the area.</p>', accept: '78 | 78 cm²' }],
  ['multi', { answer_type: 'calculation', html: '<p>Write three factors of 40.</p>', accept: '4, 8, 10 | rule: count 3, each factor 40' }],
  ['fraction', { answer_type: 'calculation', html: '<p>Work out 2/3 + 2/3</p>', accept: '1 1/3' }],
  ['coords', { answer_type: 'short', html: '<p>Write the coordinates of P.</p>', accept: '(−3, −1) | (-3, -1)' }],
  ['expr', { answer_type: 'calculation', html: '<p>Expand 4(x + 3)</p>', accept: '4x + 12 | 12 + 4x' }],
  ['choose1', { answer_type: 'short', choices: 'A | B | C', choice_right: '2' }],
  ['chooseN', { answer_type: 'short', choices: 'A | B | C', choice_right: '1,3' }],
  ['order', { answer_type: 'order', choices: '3 | 1 | 2', choice_right: '2,3,1', order_ends: 'smallest | largest' }],
  ['table', { answer_type: 'short', html: '<p>Complete the table.</p>', cells: '6 ; 12' }],
  ['match', { answer_type: 'short', html: '<p>Match each shape to its name.</p>', cells: 'A = kite ; B = square' }],
  ['words', { answer_type: 'short', html: '<p>Which colour is most common?</p>', accept: 'green' }],
  ['reason', { answer_type: 'explain', marks: '2', html: '<p>Is Megan correct? Give a reason.</p>', mark_words: 'no; 16' }],
  ['essay', { answer_type: 'written', marks: '12', subject: 'English Language', answer: 'AO1 …' }],
  ['hand', { answer_type: 'drawing', html: '<p>Show the time twenty to six on the clock.</p>' }],
  ['shape', { answer_type: 'drawing', html: '<p>Reflect shape A in the y-axis.</p>', draw_answer: '{"items":[{"k":"segs"}]}' }],
  ['points', { answer_type: 'drawing', html: '<p>Plot the points A and B.</p>', draw_answer: '{"items":[{"k":"pts"}]}' }],
  ['graph', { answer_type: 'annotate', html: '<p>On the grid, draw a histogram.</p>' }],
  ['construct', { answer_type: 'drawing', html: '<p>Use a ruler and compasses to construct the bisector.</p>' }],
  ['numline', { answer_type: 'drawing', html: '<p>On the number line, show x &gt; 3</p>' }],
  ['shade', { answer_type: 'drawing', html: '<p>Shade 3/4 of the shape.</p>' }],
  ['measure', { answer_type: 'calculation', html: '<p>Measure the size of this angle.</p>', accept: '65 to 69' }],
  ['print', { answer_type: 'calculation', html: '<p>Find g(x).</p>', needs_print: 'True' }],
  /* a drawing answered in its box (a bearing typed) is the box's type, and a card item is read through its row */
  ['unit', { answer_type: 'annotate', html: '<p>Find the bearing.</p>', accept: '303 | 303°' }],
  ['choose1', { row: { answer_type: 'short', choices: 'A | B', choice_right: '1' } }],
];
if (Q) FIX.forEach(([want, r]) => {
  const got = Q.qType_(r);
  if (got !== want) broken.push(`fixture ${JSON.stringify(r).slice(0, 80)} typed ${got}, wanted ${want}`);
});
if (Q) {
  const missed = Q.QTYPE_ORDER.filter(t => !FIX.some(f => f[0] === t));
  if (missed.length > 3) broken.push('the fixture leaves out ' + missed.join(', '));
}

/* ---------- THE COLLECTIONS, the first two first (the owner's: Corbettmaths primary, GCSE Maths F & H) */
const COLLECTIONS = [
  ['Corbettmaths primary', r => r.company === 'Corbettmaths' && /KS1|KS2/.test(r.key_stage || '')],
  ['GCSE Maths Foundation', r => r.subject === 'Maths' && r.document_type === 'Past paper' && r.key_stage === 'KS4' && r.tier === 'Foundation'],
  ['GCSE Maths Higher', r => r.subject === 'Maths' && r.document_type === 'Past paper' && r.key_stage === 'KS4' && r.tier === 'Higher'],
  ['Corbettmaths 5-a-day', r => r.company === 'Corbettmaths'],
  ['1st Class Maths', r => r.company === '1st Class Maths'],
  ['KS1/KS2 SATs', r => r.company === 'Standards & Testing Agency'],
  ['A-Level Maths', r => r.subject === 'Maths' && r.key_stage === 'KS5'],
  ['GCSE sciences', r => /Physics|Chemistry|Biology|Combined Science/.test(r.subject || '')],
  ['Other', () => true],
];
const collOf = r => COLLECTIONS.find(c => c[1](r))[0];

let rows = [];
try {
  rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8')).filter(r => r.kind === 'question');
} catch (e) { broken.push('data/questions.json did not read: ' + e.message); }
if (Q && !rows.length) broken.push('no question parts read — the check has nothing to type');

const per = {}, coll = {}, untyped = [], lists = {};
if (Q) {
  Q.QTYPE_ORDER.forEach(t => { per[t] = { n: 0, machine: 0, complete: 0, why: {} }; lists[t] = []; });
  rows.forEach(r => {
    let t = null;
    try { t = Q.qType_(r); } catch (e) { untyped.push(r.row_id + ' threw ' + e.message); return; }
    if (!per[t]) { untyped.push(r.row_id + ' typed ' + JSON.stringify(t)); return; }
    const c = collOf(r), miss = Q.qtIncomplete_(r);
    const p = per[t];
    p.n++;
    if (Q.qtMachine_(r)) p.machine++;
    if (!miss.length) p.complete++;
    miss.forEach(m => { p.why[m] = (p.why[m] || 0) + 1; });
    coll[c] = coll[c] || { n: 0, gaps: {} };
    coll[c].n++;
    if (miss.length) { coll[c].gaps[t] = (coll[c].gaps[t] || 0) + 1; lists[t].push(c + '  ' + r.row_id + '  needs ' + miss.join(', ')); }
  });
}
untyped.forEach(u => broken.push('a part with no type: ' + u));

const pc = (a, b) => (b ? Math.round(100 * a / b) : 0) + '%';
if (Q) {
  console.log('type        parts  machine  complete  missing');
  Q.QTYPE_ORDER.forEach(t => {
    const p = per[t];
    console.log(`  ${t.padEnd(10)}${String(p.n).padStart(6)}  ${pc(p.machine, p.n).padStart(7)}  ${pc(p.complete, p.n).padStart(8)}  `
      + Object.keys(p.why).map(k => k + ' ' + p.why[k]).join(', '));
  });
  console.log('\nincomplete parts by collection (type count):');
  COLLECTIONS.forEach(([c]) => {
    const g = coll[c];
    if (!g) return;
    const n = Object.keys(g.gaps).reduce((s, k) => s + g.gaps[k], 0);
    console.log(`  ${c.padEnd(22)} ${String(g.n).padStart(5)} parts, ${String(n).padStart(4)} incomplete  `
      + Object.keys(g.gaps).sort((a, b) => g.gaps[b] - g.gaps[a]).map(k => k + ' ' + g.gaps[k]).join(', '));
  });
  const want = arg('type');
  Q.QTYPE_ORDER.filter(t => process.argv.includes('--all') || t === want).forEach(t => {
    console.log(`\n${t}: ${lists[t].length} incomplete`);
    lists[t].forEach(l => console.log('  ' + l));
  });
}

if (broken.length) {
  console.log('\nFAIL:');
  broken.forEach(b => console.log('  ✗ ' + b));
  process.exit(1);
}
const all = Q.QTYPE_ORDER.reduce((s, t) => s + per[t].n, 0), done = Q.QTYPE_ORDER.reduce((s, t) => s + per[t].complete, 0);
console.log(`OK — ${all} parts, each one of ${Q.QTYPE_ORDER.length} types; ${pc(done, all)} meet their protocol (gaps reported, not failed); fixture ${FIX.length} typed right.`);
