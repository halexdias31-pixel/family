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
    + '\n;({ qType_, qtIncomplete_, qtMachine_, qtMarker_, qtDrawn_, qtFigureOf_, QTYPE_PROTOCOL, QTYPE_ORDER, QT_SHARED_FIGURE })', vm.createContext({}));
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
  /* NO "PRINT ONLY" (round 3): a part once sent to paper is typed like any other, and drawn on screen */
  ['value', { answer_type: 'calculation', html: '<p>Find g(x).</p>', needs_print: 'True' }],
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

let rows = [], lib = [];
const LFq = require('../check/lib-full.js');
try {
  lib = LFq.rows('questions');
  rows = lib.filter(r => r.kind === 'question');
} catch (e) { broken.push('data/questions.json did not read: ' + e.message); }

/* ---------- EVERY DRAWN PART REACHES ONE FIGURE (381): its own, its stem's, or a made-up grid -- never words pointing at a figure it has not got */
/* the stems a part sits under, by find.js `stemIndex_`'s scopes: the paper, its section, its question, its part letter */
const preAt = {}, has = v => v !== undefined && v !== null && v !== '', bareP = v => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
lib.forEach(r => { if (r.kind === 'preamble') (preAt[r.paper_id] = preAt[r.paper_id] || []).push(r); });
const stemsOf = r => (preAt[r.paper_id] || []).filter(p => {
  if (has(p.question)) return String(p.question) === String(r.question) && (!/^[a-z]$/.test(bareP(p.part)) || bareP(r.part)[0] === bareP(p.part));
  return p.section ? p.section === r.section : true;
});
const figs = {};
if (Q) rows.forEach(r => {
  if (!Q.qtDrawn_(r)) return;
  const f = Q.qtFigureOf_(r, stemsOf(r));
  figs[f] = (figs[f] || 0) + 1;
  if (f === 'none') broken.push(`${r.row_id} is drawn, its words point at a figure, and it has none and no stem with one`);
  if (f === 'ambiguous') broken.push(`${r.row_id} is drawn under two stems with a figure each: which one it draws on is not said`);
});
if (Q && !(figs.stem > 50)) broken.push('only ' + (figs.stem || 0) + ' drawn parts reach a stem\'s figure — wanted the library\'s 80-odd; is the stem index reading the file?');
if (Q && Object.keys(Q.QT_SHARED_FIGURE || {}).length !== 3) broken.push('QT_SHARED_FIGURE does not say what a drawn part, a typed part and Check get');
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

/* ---------- EVERY PART HAS ONE MARKER, NEVER A PERSON (the owner: "a human never marks"): qtypes.js `qtMarker_` */
/* in the order choice_right, cells, draw_answer, accept, mark_words, else the AI against the scheme -- counted by marker */
const MARKERS = ['choice', 'order', 'cells', 'draw', 'accept', 'words', 'ai'];
const byMarker = {};
MARKERS.forEach(k => { byMarker[k] = 0; });
if (Q) {
  if (typeof Q.qtMarker_ !== 'function') broken.push('qtypes.js has no qtMarker_ — no part\'s marker was checked');
  else rows.forEach(r => {
    let k = null;
    try { k = Q.qtMarker_(r); } catch (e) { broken.push(r.row_id + ': its marker threw ' + e.message); return; }
    if (MARKERS.indexOf(k) === -1) { broken.push(r.row_id + ' is marked by ' + JSON.stringify(k) + ' — every part is marked by a rule or the AI, never a person'); return; }
    byMarker[k]++;
    /* the marker's own field is what chose it, in the owner's order */
    const S = v => String(v == null ? '' : v).trim();
    const want = S(r.choices) && S(r.choice_right) ? (S(r.answer_type).toLowerCase() === 'order' ? 'order' : 'choice')
      : S(r.cells) ? 'cells' : S(r.draw_answer) ? 'draw' : S(r.accept) ? 'accept' : S(r.mark_words) ? 'words' : 'ai';
    if (k !== want) broken.push(r.row_id + ' is marked by ' + k + ', its fields say ' + want);
  });
  /* the fixture, one row a marker */
  [['choice', { choices: 'A | B', choice_right: '1' }], ['order', { answer_type: 'order', choices: '1 | 2', choice_right: '2,1' }],
   ['cells', { cells: '6 ; 12', accept: '6' }], ['draw', { draw_answer: '{"items":[]}', accept: '7' }], ['accept', { accept: '7', mark_words: 'x' }],
   ['words', { mark_words: 'no; 16' }], ['ai', { answer_type: 'drawing', html: '<p>Draw it</p>' }], ['ai', { choices: 'A | B' }]].forEach(([want, r]) => {
    if (typeof Q.qtMarker_ === 'function' && Q.qtMarker_(r) !== want) broken.push('fixture ' + JSON.stringify(r) + ' is marked by ' + Q.qtMarker_(r) + ', wanted ' + want);
  });
}
/* AND NO PATH IN THE APP SENDS A PART TO A PERSON: no pad-send handler, no marker named for a person, no "waiting to be marked" */
{
  const HAND = /waiting to be marked|tutor to mark|mark(ed|ing)? by hand|hand[- ]?mark|send to my tutor|awaiting marking/i;
  fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
    const t = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    if (/on\(\s*'pad-send'/.test(t)) broken.push('js/' + f + ' handles pad-send — a drawing sent for a person to mark');
    if (/kind\s*[=!]==?\s*'person'|return\s+'person'/.test(t)) broken.push('js/' + f + ' names a marker "person"');
    const m = HAND.exec(t.replace(/\/\*[\s\S]*?\*\//g, ''));
    if (m) broken.push('js/' + f + ' says "' + m[0] + '" — only a rule or the AI marks');
  });
}

/* ---------- EVERY PART CARRIES BOTH VERIFIED TAGS (388): find.js's own `verifyTags_`, run on every row */
const tags = { acc: 0, fn: 0, waiting: 0 };
if (Q) {
  const find = fs.readFileSync(path.join(ROOT, 'js', 'find.js'), 'utf8');
  const lib = fs.readFileSync(path.join(ROOT, 'js', 'library.js'), 'utf8');
  const src = (/^function verifyTags_\([\s\S]*?\n}\n/m.exec(find) || [])[0], tru = (/^const libTrue = [\s\S]*?\n};\n/m.exec(lib) || [])[0];
  /* AND WHAT IT READS WHILE A ROW'S WORDS ARE STILL IN THE LEDGER (397): `libWaits_` and the `libS` under it. */
  const waits = ['libS', 'libWaits_'].map(n => (new RegExp('^const ' + n + ' = .*\\n', 'm').exec(lib) || [''])[0]).join('');
  ['accuracy', 'function'].forEach(f => { if (!new RegExp("\\{ field: '" + f + "',").test(find)) broken.push('find.js FACETS has no ordinary `' + f + '` tag'); });
  /* ASKED BEFORE THE QUESTIONS THAT PICK ONE QUESTION (owner, 29 Oct; 526): after Paper, Question and Part one question is left, so a tag sorted after them was never asked. */
  const so = {};
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'facets.json'), 'utf8')).forEach(f => { if (f.active !== false) so[f.field] = Number(f.sort_order); });
  ['accuracy', 'function'].forEach(f => ['paperId', 'qNumber', 'qPart', 'qSub', 'qPage', 'marks'].forEach(g => {
    if (!(so[f] < so[g])) broken.push('the facets tab asks ' + g + ' (' + so[g] + ') before ' + f + ' (' + so[f] + ') — by then one question is left and ' + f + ' is never offered');
  }));
  if (!src || !tru) broken.push('find.js `verifyTags_` or library.js `libTrue` not found — no tag was checked');
  else {
    const ctx = vm.createContext({ qtIncomplete_: Q.qtIncomplete_, qtMachine_: Q.qtMachine_ });
    const vt = vm.runInContext(waits + tru + src + '\n;verifyTags_', ctx);
    rows.forEach(r => {
      const t = vt({ kind: 'question', row: r });
      /* THE FILE'S `function_verified` (397), what the card says before its words arrive, is what the whole row says. */
      /* A PENDING CARD WHOSE WORDS HERE ARE MISSING OR OLDER THAN IT (`waits`, docs/library.md) has nothing to hold its flag to. */
      if (LFq.waits('questions', r)) { if (r.function_verified !== undefined) tags.waiting++; }
      else if (r.function_verified !== undefined) {
        const early = vt({ kind: 'question', row: Object.assign({}, r, { lib_has: 'html' }) }).fn;
        if (early !== t.fn) broken.push(r.row_id + ': function_verified says ' + early + ' but the whole row is ' + t.fn + ' — run node tools/lib-private.js split');
      }
      if (!/^Accuracy (un)?verified$/.test(t.accuracy) || !/^Function (un)?verified$/.test(t.fn)) broken.push(r.row_id + ' lacks a verified tag: ' + JSON.stringify(t));
      if (t.accuracy === 'Accuracy verified') tags.acc++;
      if (t.fn === 'Function verified') tags.fn++;
    });
  }
}

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
console.log('parts by marker: ' + MARKERS.map(k => k + ' ' + byMarker[k]).join(', ') + ' — none by a person');
console.log('drawn parts by where their figure is: ' + Object.keys(figs).map(k => k + ' ' + figs[k]).join(', '));
const all = Q.QTYPE_ORDER.reduce((s, t) => s + per[t].n, 0), done = Q.QTYPE_ORDER.reduce((s, t) => s + per[t].complete, 0);
console.log(`OK — ${all} parts, each one of ${Q.QTYPE_ORDER.length} types and one marker, never a person (${MARKERS.map(k => k + ' ' + byMarker[k]).join(', ')}); ${pc(done, all)} meet their protocol (gaps reported, not failed); fixture ${FIX.length} typed right; tags: accuracy verified ${tags.acc}, function verified ${tags.fn} of ${rows.length}; ${tags.waiting} pending card flag(s) not held, their words here missing or older.`);
