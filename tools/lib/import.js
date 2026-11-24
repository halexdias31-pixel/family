/* @family. — tools/lib/import.js THE IMPORTER'S SHARED STEPS (UNIFY NEXT 5, 22 Nov): every source that reaches data/questions.json,
   data/inserts.json or data-private/ comes through tools/content.js, and the steps it is made of live once, here. A source is a step
   list in data/settings/content.json `sources` (papers: source → spec → parts → figures → card → import; mark schemes: cells →
   answers → words; key packs: validate → apply; inserts: sheets → write). A tool that writes data/questions.json or data-private/
   itself fails tools/one-helper.js: it takes cards()/writeCards()/words()/writeWords() here.
   Words stay in data-private and the PDFs outside the repository (docs/library.md). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib-full.js');
const ROOT = L.ROOT, TOOLS = path.join(ROOT, 'tools');

/* ---------- READ AND WRITE: the public cards (data/<file>.json, in their own layout) and the private words ---------- */
const fileOf = name => path.join(ROOT, L.defs().files[name].file);
/* A library file's public rows, its text, its layout and its definition. */
function cards(name) {
  const def = L.defs().files[name], raw = fs.readFileSync(fileOf(name), 'utf8');
  return { def, raw, rows: JSON.parse(raw), style: L.styleOf(raw) };
}
/* WRITES THE CARDS in the layout the file has (`style`: compact or spaced, one row a line; `indent` for a file kept indented, data/inserts.json). */
/* ONE ATTACHMENT KIND (queue item 6, owner 23 Nov): every row of data/inserts.json is an attachment -- a title, its sheet or text, the sets
   it belongs to -- and `of` is only its tag: `source` (a paper's reading text, `for_papers`) or `sheet` (formulae, equations, a periodic table). */
const attachmentRow = r => { const o = {}; Object.keys(r).forEach(k => { if (k !== 'of') o[k] = r[k]; if (k === 'insert_id') o.of = String(r.for_papers || '').trim() ? 'source' : 'sheet'; }); return o; };
const SHAPE = { inserts: attachmentRow };
function writeCards(name, rows, style) {
  if (SHAPE[name]) rows = rows.map(SHAPE[name]);
  const s = style || L.styleOf(fs.readFileSync(fileOf(name), 'utf8'));
  fs.writeFileSync(fileOf(name), s === 'indent' ? JSON.stringify(rows, null, 1) + '\n' : L.fileText(rows, s));
}
const words = name => L.readPrivate(name) || {};
const writeWords = (name, map) => L.writePrivate(name, map);
/* A DRY RUN'S RESULT (--out <dir>): the cards, the words and any inserts as files there, and data/ untouched. */
function writeOut(dir, name, o) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name + '.cards.json'), L.fileText(o.cards, 'compact'));
  fs.writeFileSync(path.join(dir, name + '.words.json'), JSON.stringify(o.words));
  if (o.inserts && o.inserts.length) {
    fs.writeFileSync(path.join(dir, name + '.inserts.json'), JSON.stringify(o.inserts, null, 1) + '\n');
    fs.writeFileSync(path.join(dir, name + '.insert-words.json'), JSON.stringify(o.insertWords));
  }
}
/* THE CARDS WITH THEIR WORDS for one file: what the importer replaces and the checks compare against. */
function joined(name) {
  const c = cards(name);
  return Object.assign(c, { cards: c.rows, words: words(name) });
}

/* ---------- FETCH: a source's documents ---------- */
function fetch(s) {
  if (s.zip) {
    const dir = path.join(L.PRIVATE_DIR, 'sources', path.basename(s.zip, '.zip'));
    fs.mkdirSync(dir, { recursive: true });
    cp.execFileSync('unzip', ['-o', '-q', s.zip, '-d', dir]);
    s.dir = dir;
    return 'source: ' + s.zip + ' → ' + path.relative(ROOT, dir);
  }
  if (s.drive) return 'source: Drive file ' + s.drive + ' (https://drive.google.com/file/d/' + s.drive + '/view)';
  if (s.pdf) return 'source: ' + s.pdf + (fs.existsSync(s.pdf) ? '' : ' — not on this machine');
  return '';
}
const driveOf = url => (/drive\.google\.com\/file\/d\/([^/]+)/.exec(url || '') || [])[1] || null;

/* ---------- PYTHON STEPS: one way to run a tools/ script and read what it prints ---------- */
function py(args, opt) {
  return cp.execFileSync('python3', args, Object.assign({ cwd: ROOT, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'inherit'] }, opt || {}));
}
/* SPLIT A TRANSCRIPTION MODULE INTO ROWS (tools/content/emit.py). */
const moduleRows = file => JSON.parse(py([path.join(TOOLS, 'content', 'emit.py'), file]));
/* A FIGURE OFF THE PDF (tools/pdf_figure.py): {pdf, page, clip, label, …} → the SVG. */
function figure(f) {
  const code = 'import json,sys; sys.path.insert(0, "tools"); from pdf_figure import figure; a = json.loads(sys.argv[1]); '
    + 'print(figure(a.pop("pdf"), a.pop("page"), tuple(a.pop("clip")), a.pop("label"), **a), end="")';
  return py(['-c', code, JSON.stringify(f)]);
}
/* A FIGURE BY ITS OWN SCRIPT (figkit): "tools/x.py arg …" → the SVG. */
function script(line) {
  const [s, ...a] = String(line).split(' ');
  return py([path.join(ROOT, s), ...a]).trim();
}
/* AN AQA MARK SCHEME'S QUESTION CELLS (tools/aqa-ms-cells.py), read once a file. */
const CELLS = {};
const cells = pdf => CELLS[pdf] || (CELLS[pdf] = JSON.parse(py([path.join(TOOLS, 'aqa-ms-cells.py'), pdf], { stdio: ['ignore', 'pipe', 'ignore'] })));
/* THE INSERT SHEETS (tools/inserts.py --rows): our own setting of the formulae sheets, as rows. */
const insertSheets = () => JSON.parse(py([path.join(TOOLS, 'inserts.py'), '--rows']));

/* ---------- PACK FOR THE LEDGER: the one pack maker is tools/content/library.js packsOf; this asks it ---------- */
function pack(ledger, ids, note) {
  const LIB = require('../content/library.js');
  return LIB.main(['drive-pack', ledger.endsWith('/') ? ledger : ledger + '/', '--ids', ids.join(','), '--note', note || '']);
}
/* ---------- VALIDATE A PACK: the backend's own libPackCheck_ (backend/library-drive.gs), in the vm — never a second validator ---------- */
function checkPack(pack) {
  const B = require('./backend-vm.js').load({ console: { log() {}, warn() {}, error() {} } });
  return B.$('libPackCheck_')(JSON.stringify(pack));
}

/* ---------- RUN A SOURCE'S STEP LIST: data/settings/content.json `sources` ---------- */
const SOURCES = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'content.json'), 'utf8')).sources || {};
async function run(source, steps, ctx, only) {
  const list = (SOURCES()[source] || {}).steps;
  if (!list) throw new Error('no source ' + source + ' in data/settings/content.json sources — ' + Object.keys(SOURCES()).join(', '));
  const bad = (only || []).filter(s => !list.includes(s));
  if (bad.length) throw new Error(source + ' has no step ' + bad.join(', ') + ' — ' + list.join(', '));
  for (const s of list) {
    if (only && only.length && !only.includes(s)) continue;
    if (!steps[s]) throw new Error(source + ': step ' + s + ' has no code');
    ctx = (await steps[s](ctx)) || ctx;
  }
  return ctx;
}

module.exports = { ROOT, fileOf, cards, writeCards, attachmentRow, words, writeWords, writeOut, joined, fetch, driveOf, py, moduleRows, figure, script, cells, insertSheets, pack, checkPack, SOURCES, run };
