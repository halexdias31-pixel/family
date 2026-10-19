require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-health.js — EVERY PAPER'S HEALTH SCORE, WORST FIRST. § */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const argFile = process.argv.slice(2).find(a => !a.startsWith('--'));
const FILE = argFile || path.join(ROOT, 'data', 'questions.json');
const ALL = process.argv.includes('--all');
const broken = [];

let paperHealth_ = null, HEALTH_BANDS = null;
try {
  const got = vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'library.js'), 'utf8')
    + '\n;({ paperHealth_: typeof paperHealth_ === "function" ? paperHealth_ : null,'
    + ' HEALTH_BANDS: typeof HEALTH_BANDS !== "undefined" ? HEALTH_BANDS : null })', vm.createContext({ console }));
  paperHealth_ = got.paperHealth_;
  HEALTH_BANDS = got.HEALTH_BANDS;
} catch (e) { broken.push('js/library.js did not load in a vm: ' + e.message); }
if (!paperHealth_) broken.push('js/library.js has no `paperHealth_` — the finder and this report have nothing to read');

/* ---------- THE FIXTURE: ONE PAPER WITH THREE KNOWN FAULTS, AND ONE WITH NONE § */
const FIX_BASE = { active: 'True', subject: 'Maths', document_type: 'Past paper', pages_checked: 'True' };
const fixRows = [
  Object.assign({}, FIX_BASE, { row_id: 'D-HX', paper_id: 'HX', kind: 'document', name: 'Fixture — broken', total_marks: '80' }),
  Object.assign({}, FIX_BASE, { row_id: 'HX-1', paper_id: 'HX', kind: 'question', question: '1', marks: '40', html: '<p>Work out 3 + 4.</p>', answer: '7', accept: '7' }),
  Object.assign({}, FIX_BASE, { row_id: 'HX-2', paper_id: 'HX', kind: 'question', question: '2', marks: '30', html: '<p>Work out 6 × 7.</p>' }),
  Object.assign({}, FIX_BASE, { row_id: 'HX-3', paper_id: 'HX', kind: 'question', question: '3', marks: '6', html: '<p>Find the angle x in the triangle shown.</p>', answer: '40°', accept: '40' }),
  Object.assign({}, FIX_BASE, { row_id: 'D-HY', paper_id: 'HY', kind: 'document', name: 'Fixture — clean', total_marks: '5' }),
  Object.assign({}, FIX_BASE, { row_id: 'HY-1', paper_id: 'HY', kind: 'question', question: '1', marks: '2', html: '<p>Work out 3 + 4.</p>', answer: '7', accept: '7' }),
  Object.assign({}, FIX_BASE, { row_id: 'HY-2', paper_id: 'HY', kind: 'question', question: '2', marks: '3', html: '<p>Find x in the triangle shown.</p>', diagram: '<svg viewBox="0 0 10 10"></svg>', answer: '40°', accept: '40' }),
];
if (paperHealth_) {
  try {
    const f = paperHealth_(fixRows);
    const bad = f.HX, good = f.HY;
    const kinds = bad ? bad.fails.map(x => x.ref + ':' + x.kind).sort().join(', ') : '(no score)';
    const want = 'Paper:total, Q2:answer, Q3:picture';
    if (kinds !== want) broken.push('the fixture paper lists ' + kinds + ' — wanted exactly ' + want);
    if (!bad || bad.band === 'Ready') broken.push('the fixture paper with three faults scores ' + (bad ? bad.pct + '% ' + bad.band : 'nothing') + ' — wanted below Ready');
    const ab = bad && bad.able ? bad.able.fails.map(x => x.ref + ':' + x.kind).join(', ') : '(no answerable score)';
    if (ab !== 'Q2:mark') broken.push('the fixture paper\'s Answerable faults are ' + ab + ' — wanted exactly Q2:mark');
    if (!good || !good.able || good.able.pct !== 100) broken.push('the clean fixture paper is ' + (good && good.able ? good.able.pct : '?') + '% Answerable — wanted 100');
    if (!good || good.pct !== 100 || good.fails.length) broken.push('the clean fixture paper scores ' + (good ? good.pct + '% with ' + good.fails.map(x => x.why).join(', ') : 'nothing') + ' — wanted 100% and no faults');
  } catch (e) { broken.push('paperHealth_ threw on the fixture: ' + e.message); }
}

let H = {};
if (paperHealth_) {
  try { H = paperHealth_(JSON.parse(fs.readFileSync(FILE, 'utf8'))); }
  catch (e) { broken.push('paperHealth_ could not score ' + path.relative(ROOT, FILE) + ': ' + e.message); }
}
const ids = Object.keys(H).sort((a, b) => H[a].pct - H[b].pct || a.localeCompare(b));
if (!broken.length && !ids.length) broken.push('the library scored no papers at all — the instrument is not seeing it');

const KIND_SAY = { words: 'no words', standin: 'stand-in words', answer: 'no answer', picture: 'no picture', described: 'picture in words',
                   marks: 'no marks', gap: 'number gap', total: 'marks total', unchecked: 'unchecked' };
const kindsOf = h => {
  const k = {};
  h.fails.forEach(f => { k[f.kind] = (k[f.kind] || 0) + 1; });
  return Object.keys(k).map(n => (KIND_SAY[n] || n) + ' ' + (n === 'total' ? h.marks + '/' + h.total : k[n])).join(', ');
};

console.log("\nEVERY PAPER'S TWO HEALTHS, WORST FAITHFUL FIRST  (F = Faithful, the paper reproduced; A = Answerable here and marked without AI — js/library.js, paperHealth_)\n");
const shown = ALL ? ids : ids.slice(0, 40);
shown.forEach(id => {
  const h = H[id];
  console.log(`  F ${String(h.pct).padStart(3)}% ${h.band.padEnd(6)}  A ${String(h.able.pct).padStart(3)}% ${h.able.band.padEnd(6)}  ${id.padEnd(28)} ${String(h.name || '').slice(0, 44).padEnd(44)}  ${kindsOf(h)}`);
});
if (shown.length < ids.length) console.log(`  … and ${ids.length - shown.length} more (--all prints every one)`);

const bands = {}, faults = {}, ables = {}, ableWhy = {};
(HEALTH_BANDS || []).forEach(b => { bands[b[0]] = 0; ables[b[0]] = 0; });
ids.forEach(id => {
  bands[H[id].band] = (bands[H[id].band] || 0) + 1;
  ables[H[id].able.band] = (ables[H[id].able.band] || 0) + 1;
  H[id].able.fails.forEach(f => { ableWhy[f.why] = (ableWhy[f.why] || 0) + 1; });
  H[id].fails.forEach(f => { faults[f.kind] = (faults[f.kind] || 0) + 1; });
});
console.log('\nfaults by kind, across the library:');
Object.keys(faults).sort((a, b) => faults[b] - faults[a])
  .forEach(k => console.log(`  ${String(faults[k]).padStart(5)}  ${KIND_SAY[k] || k}`));
console.log('\nanswerable faults, across the library:');
Object.keys(ableWhy).sort((a, b) => ableWhy[b] - ableWhy[a]).forEach(k => console.log(`  ${String(ableWhy[k]).padStart(5)}  ${k}`));
console.log(`\npapers scored: ${ids.length}   Faithful ` + Object.keys(bands).map(b => b + ' ' + bands[b]).join('   ')
  + '   (Ready 98+, Usable 85–97, Rough under 85)');

if (broken.length) {
  console.log('\nTHE INSTRUMENT IS BROKEN — the numbers above cannot be trusted:');
  broken.forEach(b => console.log('  ✗ ' + b));
  process.exit(1);
}
console.log('fixture: three faults found, scored below Ready; the clean paper 100%  — the instrument sees');
console.log('OK — ' + ids.length + ' papers: Faithful ' + Object.keys(bands).map(b => b + ' ' + bands[b]).join(', ')
  + '; Answerable ' + Object.keys(ables).map(b => b + ' ' + ables[b]).join(', ') + '; the fixture\'s faults are seen.');
