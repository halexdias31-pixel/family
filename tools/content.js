#!/usr/bin/env node
/* @family. — tools/content.js THE ONE CONTENT PIPELINE (owner, 17 Nov): every past paper, scheme, figure and card comes in here.
   source → spec → parts → figures → keys → card → import. docs/notes/tools/content.md says how to add a paper. */
const USAGE = `
  node tools/content.js <what> [--stage <name>[,<name>…]] [--out <dir>] [--ledger <dir>]

  <what> is one of
    <module.py>            a transcription module (tools/content/specs/…, or one beside the PDFs): its rows are the spec
    <family>               every module the family's row in data/settings/content.json names (e.g. P-AQA-7408-)
    library:<paper_id>     a paper already in the library, re-run from its card and its words (data-private/)
    <spec.json>            a spec this pipeline wrote before (data-private/specs/)

  stages, in order (all of them when --stage is not given; a later stage runs on what the earlier wrote):
    source   the source documents: the PDF, the zip (unpacked into data-private/sources/), the Drive file
    spec     the paper as rows, written to data-private/specs/<name>.json (words: never into git)
    parts    each row in the question shape (kinds.json): kind, question and part from the row id, marks as text
    figures  figure_from (a PDF clip, tools/pdf_figure.py) and figure_script (a figkit script) drawn into diagram;
             diagram_twin pointed at its PNG in data/diagrams/ when one is drawn (node tools/diagram_png.js draws new ones)
    keys     the scheme left as data: scheme {answer, accept, mark_words, …} onto the row's own fields
    card     the family's card fields (board, subject, level, band) and the cover's onto every row; the qualification
             list (data/settings/expected-papers.json) told of a spec code it has not got
    import   into data/questions.json (the cards) and data-private/questions.json (the words), replacing the paper's
             rows where they were; --out <dir> writes the result there instead and touches nothing; --ledger <dir>
             also writes the libImport_ file (lib-import-<time>.json) for the owner's Drive folder

  node tools/content.js library <split|join|seed|pull|push|status|drive-pack|help> …   the library's private half (397)
`;
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib/lib-full.js');
const SC = require('./lib/library-schema.js');
const LIB = require('./content/library.js');

const ROOT = L.ROOT;
const STAGES = ['source', 'spec', 'parts', 'figures', 'keys', 'card', 'import'];
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'content.json'), 'utf8')).families;
const SPECS = path.join(L.PRIVATE_DIR, 'specs');

const familyOf = pid => TABLE.filter(f => String(pid).startsWith(f.family)).sort((a, b) => b.family.length - a.family.length)[0] || null;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const blank = v => v === undefined || v === null || String(v) === '';

/* ---------- SOURCE: the documents a spec is read from ---------- */
function source(spec) {
  (spec.sources || []).forEach(s => {
    if (s.zip) {
      const dir = path.join(L.PRIVATE_DIR, 'sources', path.basename(s.zip, '.zip'));
      fs.mkdirSync(dir, { recursive: true });
      cp.execFileSync('unzip', ['-o', '-q', s.zip, '-d', dir]);
      s.dir = dir;
      console.log('source: ' + s.zip + ' → ' + path.relative(ROOT, dir));
    } else if (s.drive) console.log('source: Drive file ' + s.drive + ' (https://drive.google.com/file/d/' + s.drive + '/view)');
    else if (s.pdf) console.log('source: ' + s.pdf + (fs.existsSync(s.pdf) ? '' : ' — not on this machine'));
  });
  return spec;
}

/* ---------- SPEC: the paper as rows ---------- */
function joined() {
  const def = L.defs().files.questions;
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, def.file), 'utf8'));
  const words = L.readPrivate('questions') || {};
  return { def, cards, words };
}
function fromLibrary(pid) {
  const { def, cards, words } = joined();
  const rows = cards.filter(r => r.paper_id === pid).map(r => {
    const w = words[L.idOf(def, r)];
    /* A CARD WHOSE WORDS ARE NOT HERE keeps its lib_has, as `library join` does: nothing can be rebuilt from nothing */
    /* WORDS THAT ARE NOT ALL HERE (a lib_pending card the Ledger holds more of) leave the card as it is, as `library join` does */
    const all = String(r.lib_has || '').split(' ').filter(Boolean).every(f => w && has(w, f));
    return all ? Object.assign({}, r, w) : Object.assign({}, r);
  });
  if (!rows.length) throw new Error('no rows with paper_id ' + pid + ' in data/questions.json');
  const doc = rows.find(r => r.kind === 'document');
  /* THE PAPER'S OWN INSERT (an English source booklet: data/inserts.json, for_papers), words and all */
  const idef = L.defs().files.inserts, iwords = L.readPrivate('inserts') || {};
  const inserts = JSON.parse(fs.readFileSync(path.join(ROOT, idef.file), 'utf8'))
    .filter(r => String(r.for_papers || '').split(',').map(x => x.trim()).includes(pid))
    .map(r => Object.assign({}, r, iwords[L.idOf(idef, r)] || {}));
  return { name: pid, from: 'library', inserts, sources: doc && doc.source_url ? [/drive\.google\.com\/file\/d\/([^/]+)/.test(doc.source_url) ? { drive: RegExp.$1 } : { url: doc.source_url }] : [], rows };
}
function fromModule(file) {
  /* a module's rows with kind 'insert' are its paper's inserts (data/inserts.json) */
  const out = cp.execFileSync('python3', [path.join(__dirname, 'content', 'emit.py'), file], { maxBuffer: 512 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const rows = JSON.parse(out);
  const docs = rows.filter(r => r.kind === 'document');
  const sources = [];
  docs.forEach(d => { if (/drive\.google\.com\/file\/d\/([^/]+)/.test(d.source_url || '')) sources.push({ drive: RegExp.$1 }); });
  return { name: path.basename(file, '.py'), from: path.relative(ROOT, path.resolve(file)), sources,
    rows: rows.filter(r => r.kind !== 'insert'), inserts: rows.filter(r => r.kind === 'insert').map(r => { const o = Object.assign({}, r); delete o.kind; return o; }) };
}
function specs(what) {
  if (what.startsWith('library:')) return [fromLibrary(what.slice(8))];
  if (/\.json$/.test(what)) return [JSON.parse(fs.readFileSync(what, 'utf8'))];
  if (/\.py$/.test(what)) return [fromModule(what)];
  const fam = TABLE.find(f => f.family === what);
  if (!fam) throw new Error(what + ' is not a module, a spec, library:<paper_id> or a family in data/settings/content.json');
  if (!fam.specs) throw new Error(what + ' names no transcription modules in data/settings/content.json — re-run its papers as library:<paper_id>');
  const dir = path.join(ROOT, path.dirname(fam.specs)), re = new RegExp('^' + path.basename(fam.specs).replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return fs.readdirSync(dir).filter(f => re.test(f)).sort().map(f => fromModule(path.join(dir, f)));
}
function saveSpec(spec) {
  fs.mkdirSync(SPECS, { recursive: true });
  const f = path.join(SPECS, spec.name + '.json');
  fs.writeFileSync(f, JSON.stringify(spec));
  console.log('spec: ' + spec.rows.length + ' rows → ' + path.relative(ROOT, f));
}

/* ---------- PARTS: the question shape (kinds.json `question`) ---------- */
function parts(spec) {
  spec.rows.forEach(r => {
    if (blank(r.kind)) r.kind = 'question';
    if (r.kind === 'question' && blank(r.question)) {
      const m = /-0*(\d+)([a-z]*)$/.exec(r.row_id || '');
      if (m) { r.question = m[1]; if (m[2]) r.part = m[2]; }
    }
    if (typeof r.marks === 'number') r.marks = String(r.marks);
  });
  return spec;
}

/* ---------- FIGURES: drawn by their script (figkit) or off the PDF (pdf_figure), and pointed at their PNG twin ---------- */
function figures(spec) {
  const twin = require('./diagram_png.js');
  let drawn = 0, twins = 0, waiting = 0;
  spec.rows.forEach(r => {
    if (r.figure_from) {
      const f = r.figure_from;
      const py = 'import json,sys; sys.path.insert(0, "tools"); from pdf_figure import figure; a = json.loads(sys.argv[1]); '
        + 'print(figure(a.pop("pdf"), a.pop("page"), tuple(a.pop("clip")), a.pop("label"), **a), end="")';
      r.diagram = cp.execFileSync('python3', ['-c', py, JSON.stringify(f)], { cwd: ROOT, encoding: 'utf8' });
      delete r.figure_from; r.diagram_by = 'family'; drawn++;
    } else if (r.figure_script) {
      const [script, ...a] = String(r.figure_script).split(' ');
      r.diagram = cp.execFileSync('python3', [path.join(ROOT, script), ...a], { cwd: ROOT, encoding: 'utf8' }).trim();
      delete r.figure_script; r.diagram_by = 'family'; drawn++;
    }
    if (typeof r.diagram !== 'string' || !/^\s*<svg\b/i.test(r.diagram)) return;
    const h = twin.nameOf(r.diagram), png = path.join(twin.OUT, h + '.png');
    if (fs.existsSync(png)) { r.diagram_twin = h; r.diagram_twin_wh = twin.pngWH(png); twins++; } else waiting++;
  });
  console.log('figures: ' + drawn + ' drawn, ' + twins + ' with their PNG twin' + (waiting ? ', ' + waiting + ' to draw (node tools/diagram_png.js, after import)' : ''));
  return spec;
}

/* ---------- KEYS: the mark scheme, left as data ---------- */
function keys(spec) {
  spec.rows.forEach(r => {
    if (!r.scheme || typeof r.scheme !== 'object') return;
    Object.keys(r.scheme).forEach(k => { if (!blank(r.scheme[k])) r[k] = r.scheme[k]; });
    delete r.scheme;
  });
  return spec;
}

/* ---------- CARD: the family's fields, the cover's, and the qualification list ---------- */
function card(spec) {
  const docs = new Map(spec.rows.filter(r => r.kind === 'document').map(r => [r.paper_id, r]));
  spec.rows.forEach(r => {
    const fam = familyOf(r.paper_id);
    if (fam) Object.keys(fam.card).forEach(k => { if (!has(r, k)) r[k] = fam.card[k]; });
    /* and the cover's fields the family's row says its parts carry (`cover`), where a part has not got them */
    const doc = docs.get(r.paper_id);
    if (fam && doc && doc !== r) (fam.cover || []).forEach(k => { if (!has(r, k) && !blank(doc[k])) r[k] = doc[k]; });
  });
  /* THE INSERTS IT IS SAT WITH: its own (for_papers) and the shared sheets its subject and level take (for_subjects/for_levels) */
  const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'inserts.json'), 'utf8')).concat(spec.inserts || []);
  const list = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
  docs.forEach(d => {
    const ins = all.filter(i => list(i.for_papers).includes(d.paper_id)
      || (list(i.for_subjects).includes(d.subject) && list(i.for_levels).includes(d.level) && (!list(i.for_tiers).length || list(i.for_tiers).includes(d.tier))
        && (!list(i.board).length || list(i.board).includes(d.exam_board))));
    if (ins.length) console.log('card: ' + d.paper_id + ' is sat with ' + [...new Set(ins.map(i => i.insert_id))].join(', '));
  });
  /* THE QUALIFICATION LIST: a spec code the list has not got is said, with the line that would add it */
  const exp = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'expected-papers.json'), 'utf8'));
  docs.forEach(d => {
    const fam = familyOf(d.paper_id);
    if (fam && fam.qualification && !exp.some(e => e.label === fam.qualification))
      console.log('card: ' + fam.qualification + ' is not in data/settings/expected-papers.json — add its line there');
  });
  return spec;
}

/* ---------- IMPORT: the cards into data/questions.json, the words into data-private/ ---------- */
function importRows(spec, opt) {
  const { def, cards, words } = joined();
  const pids = new Set(spec.rows.map(r => r.paper_id));
  const map = Object.assign({}, words);
  const before = cards.filter(r => pids.has(r.paper_id)).map(r => Object.assign({}, r, words[L.idOf(def, r)] || {}));
  /* A RE-RUN REPLACES: the paper's rows go, and their words with them, and the new ones take their place */
  const now = new Set(spec.rows.map(r => r.row_id));
  cards.filter(r => pids.has(r.paper_id) && !now.has(r.row_id)).forEach(r => delete map[L.idOf(def, r)]);
  const kept = cards.filter(r => !pids.has(r.paper_id));
  const ids = spec.rows.map(r => r.row_id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error('row ids twice: ' + dup.join(', '));
  const clash = kept.filter(r => ids.includes(r.row_id)).map(r => r.row_id);
  if (clash.length) throw new Error('row ids already used by another paper: ' + clash.slice(0, 8).join(', '));
  /* VALIDATE BEFORE WRITE (R5): the paper's rows against what they were */
  SC.refuse('questions', spec.rows, before, 'tools/content.js import');
  /* a card whose words are not here (lib_has, nothing private) comes back as it was */
  const slim = spec.rows.map(r => LIB.splitRow('questions', Object.assign({}, r), map).row);
  /* EACH ROW WHERE IT WAS: a re-run moves no line; a new row goes after the paper's last, a new paper at the end */
  const byId = new Map(slim.map(r => [r.row_id, r])), placed = new Set();
  let rows = [], last = -1;
  cards.forEach(r => {
    if (!pids.has(r.paper_id)) { rows.push(r); return; }
    const n = byId.get(r.row_id);
    if (n) { rows.push(n); placed.add(r.row_id); }
    last = rows.length;
  });
  const fresh = slim.filter(r => !placed.has(r.row_id));
  rows = last < 0 ? rows.concat(fresh) : rows.slice(0, last).concat(fresh, rows.slice(last));
  const ins = importInserts(spec.inserts || []);
  const mine = {};
  slim.forEach(r => { if (map[r.row_id]) mine[r.row_id] = map[r.row_id]; });
  if (opt.out) {
    fs.mkdirSync(opt.out, { recursive: true });
    fs.writeFileSync(path.join(opt.out, spec.name + '.cards.json'), L.fileText(slim, 'compact'));
    fs.writeFileSync(path.join(opt.out, spec.name + '.words.json'), JSON.stringify(mine));
    if (ins.slim.length) {
      fs.writeFileSync(path.join(opt.out, spec.name + '.inserts.json'), JSON.stringify(ins.slim, null, 1) + '\n');
      fs.writeFileSync(path.join(opt.out, spec.name + '.insert-words.json'), JSON.stringify(ins.mine));
    }
    console.log('import: ' + slim.length + ' rows, ' + ins.slim.length + ' insert(s) → ' + opt.out + ' (data/ untouched)');
    return;
  }
  const raw = fs.readFileSync(path.join(ROOT, def.file), 'utf8');
  fs.writeFileSync(path.join(ROOT, def.file), L.fileText(rows, L.styleOf(raw)));
  L.writePrivate('questions', map);
  if (ins.slim.length) { fs.writeFileSync(ins.file, JSON.stringify(ins.rows, null, 1) + '\n'); L.writePrivate('inserts', ins.map); }
  console.log('import: ' + [...pids].join(', ') + ': ' + slim.length + ' rows (replacing ' + before.length + ')');
  if (opt.ledger) LIB.main(['drive-pack', opt.ledger.endsWith('/') ? opt.ledger : opt.ledger + '/', '--ids', Object.keys(mine).join(','), '--note', spec.name]);
}

/* THE PAPER'S INSERTS: each replaced where it was in data/inserts.json (its own layout, 458), a new one at the end */
function importInserts(list) {
  const def = L.defs().files.inserts, file = path.join(ROOT, def.file);
  const rows = JSON.parse(fs.readFileSync(file, 'utf8')), map = Object.assign({}, L.readPrivate('inserts') || {});
  const slim = list.map(r => LIB.splitRow('inserts', Object.assign({}, r), map).row);
  const mine = {};
  slim.forEach(r => {
    const id = L.idOf(def, r), i = rows.findIndex(x => L.idOf(def, x) === id);
    if (i < 0) rows.push(r); else rows[i] = r;
    if (map[id]) mine[id] = map[id];
  });
  return { file, rows, map, slim, mine };
}

/* ---------- THE RUN ---------- */
async function main(argv) {
  if (argv[0] === 'library') return LIB.main(argv.slice(1));
  const opt = k => { const i = argv.indexOf('--' + k); return i === -1 ? null : argv[i + 1]; };
  const what = argv.find((a, i) => !a.startsWith('--') && !(i && argv[i - 1].startsWith('--')));
  if (!what || what === 'help' || what === '--help') { console.log(USAGE); return; }
  const want = opt('stage') ? opt('stage').split(',') : STAGES;
  const bad = want.filter(s => !STAGES.includes(s));
  if (bad.length) throw new Error('no stage ' + bad.join(', ') + ' — ' + STAGES.join(', '));
  for (let spec of specs(what)) {
    console.log('— ' + spec.name + ' (' + spec.from + ')');
    if (want.includes('source')) source(spec);
    if (want.includes('spec')) saveSpec(spec);
    for (const [s, f] of [['parts', parts], ['figures', figures], ['keys', keys], ['card', card]]) if (want.includes(s)) spec = f(spec);
    if (want.some(s => ['parts', 'figures', 'keys', 'card'].includes(s)) && !want.includes('import')) saveSpec(spec);
    if (want.includes('import')) importRows(spec, { out: opt('out'), ledger: opt('ledger') });
  }
}

if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(String((e && e.message) || e)); process.exit(1); });

module.exports = { STAGES, familyOf, parts, figures, keys, card };
