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

  the other sources (data/settings/content.json sources: each a step list; the steps' shared parts are tools/lib/import.js)
  node tools/content.js markscheme <ids file> <pdf dir> [--overrides f.json] [--apply]   cells → answers → words (AQA schemes)
  node tools/content.js keypack <lib-import.json> [--apply]                             validate → apply (a key pack onto the words)
  node tools/content.js insert                                                          sheets → write (tools/inserts.py's sheets)
  node tools/content.js drawkeys [--apply]                                              one drawing canvas: each draw_answer as its frame and pieces (tools/lib/draw-key.js)
  node tools/content.js picks [--apply]                                                 one answer format: each pick question's key as its letters, its working a note (tools/lib/pick-key.js)
  node tools/content.js shape [--apply]                                                 one question shape: no second way to say a stem, an option or a key (tools/lib/shape.js; held by tools/one-shape.js)
  node tools/content.js ideas [--out <dir>]                                             measure → merge → tag (one maths card per idea; part_of, specs, idea_id; tools/lib/ideas.js)

  node tools/content.js sets [--apply]                                                  one question set: every paper, worksheet, exercise, 5-a-day a set (tools/lib/sets.js; held by tools/one-set.js)
  node tools/content.js qideas [--apply]                                                one topic tree: each maths question's idea_id from data/settings/question-ideas.json (tools/lib/qideas.js; held by tools/one-topic.js)
  node tools/content.js sciideas [--review <file>]                                     measure → merge → tag (one science card per idea: an AQA spec point; tools/lib/sci-ideas.js)
  node tools/content.js family [--apply] [--ledger <dir>]                                facts → questions → write → pack (@family questions from the library: fact ids, one set per idea; tools/lib/family-q.js; held by tools/one-fact.js)
  node tools/content.js speccode [--apply]                                              derive → write (spec_code from a paper's own columns)

  node tools/content.js library <split|join|seed|pull|push|status|drive-pack|help> …   the library's private half (397)
`;
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib/lib-full.js');
const SC = require('./lib/library-schema.js');
const LIB = require('./content/library.js');
const IM = require('./lib/import.js');

const ROOT = L.ROOT;
const STAGES = ['source', 'spec', 'parts', 'figures', 'keys', 'card', 'import'];
/* A FAMILY WITH A QUALIFICATION TAKES ITS BOARD, SUBJECT AND LEVEL FROM THAT LINE OF expected-papers.json, and its key stage from */
/* settings.json `levels` (UNIFY NEXT 2, 22 Nov): content.json never copies them; a field it does write wins. */
const TABLE = (() => {
  const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', f), 'utf8'));
  const exp = {}; rd('expected-papers.json').forEach(e => { exp[e.label] = e; });
  const stage = {}; rd('settings.json').levels.list.forEach(l => { stage[l.level] = l.stages[0]; });
  return rd('content.json').families.map(f => {
    const e = f.qualification && exp[f.qualification];
    if (!e) return f;
    const from = { subject: e.subject, level: e.level, exam_board: e.board, company: e.board };
    if (stage[e.level]) from.key_stage = stage[e.level];
    return Object.assign({ board: e.board }, f, { card: Object.assign(from, f.card) });
  });
})();
const SPECS = path.join(L.PRIVATE_DIR, 'specs');

const familyOf = pid => TABLE.filter(f => String(pid).startsWith(f.family)).sort((a, b) => b.family.length - a.family.length)[0] || null;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const blank = v => v === undefined || v === null || String(v) === '';

/* ---------- SOURCE: the documents a spec is read from ---------- */
function source(spec) {
  (spec.sources || []).forEach(s => { const said = IM.fetch(s); if (said) console.log(said); });
  return spec;
}

/* ---------- SPEC: the paper as rows ---------- */
const joined = () => IM.joined('questions');
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
  /* EACH ROW WEARS ITS PAPER'S CARD again (owner, 17 Nov): the file keeps it once, on the paper's own row */
  L.joinPaper(rows);
  const doc = rows.find(r => r.kind === 'document');
  /* THE PAPER'S OWN INSERT (an English source booklet: data/inserts.json, for_papers), words and all */
  const { def: idef, rows: irows, words: iwords } = IM.joined('inserts');
  const inserts = irows
    .filter(r => String(r.for_papers || '').split(',').map(x => x.trim()).includes(pid))
    .map(r => Object.assign({}, r, iwords[L.idOf(idef, r)] || {}));
  return { name: pid, from: 'library', inserts, sources: doc && doc.source_url ? [IM.driveOf(doc.source_url) ? { drive: IM.driveOf(doc.source_url) } : { url: doc.source_url }] : [], rows };
}
function fromModule(file) {
  /* a module's rows with kind 'insert' are its paper's inserts (data/inserts.json) */
  const rows = IM.moduleRows(file);
  const sources = rows.filter(r => r.kind === 'document' && IM.driveOf(r.source_url)).map(d => ({ drive: IM.driveOf(d.source_url) }));
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
      r.diagram = IM.figure(r.figure_from);
      delete r.figure_from; r.diagram_by = 'family'; drawn++;
    } else if (r.figure_script) {
      r.diagram = IM.script(r.figure_script);
      delete r.figure_script; r.diagram_by = 'family'; drawn++;
    }
    if (typeof r.diagram !== 'string' || !/^\s*<svg\b/i.test(r.diagram)) return;
    /* THE CORNER LETTERS ITS QUESTION NAMES, put back where the drawing's own words say (tools/lib/vertex-labels.js; owner, 25 Nov) */
    r.diagram = require('./lib/vertex-labels.js').mend(r.diagram, r.html);
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
  const all = IM.cards('inserts').rows.concat(spec.inserts || []);
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
  const before = L.joinPaper(cards.filter(r => pids.has(r.paper_id)).map(r => Object.assign({}, r, words[L.idOf(def, r)] || {})));
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
  /* AND THE PAPER'S CARD STORED ONCE (owner, 17 Nov): a question keeps only the card fields that differ from its paper's row */
  const slim = L.stripPaper(spec.rows.map(r => LIB.splitRow('questions', Object.assign({}, r), map).row));
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
    IM.writeOut(opt.out, spec.name, { cards: slim, words: mine, inserts: ins.slim, insertWords: ins.mine });
    console.log('import: ' + slim.length + ' rows, ' + ins.slim.length + ' insert(s) → ' + opt.out + ' (data/ untouched)');
    return;
  }
  IM.writeCards('questions', rows);
  IM.writeWords('questions', map);
  if (ins.slim.length) { IM.writeCards('inserts', ins.rows, 'indent'); IM.writeWords('inserts', ins.map); }
  console.log('import: ' + [...pids].join(', ') + ': ' + slim.length + ' rows (replacing ' + before.length + ')');
  if (opt.ledger) IM.pack(opt.ledger, Object.keys(mine), spec.name);
}

/* THE PAPER'S INSERTS: each replaced where it was in data/inserts.json (its own layout, 458), a new one at the end */
function importInserts(list) {
  const { def, rows, words } = IM.joined('inserts'), map = Object.assign({}, words);
  const slim = list.map(r => LIB.splitRow('inserts', Object.assign({}, r), map).row);
  const mine = {};
  slim.forEach(r => {
    const id = L.idOf(def, r), i = rows.findIndex(x => L.idOf(def, x) === id);
    if (i < 0) rows.push(r); else rows[i] = r;
    if (map[id]) mine[id] = map[id];
  });
  return { rows, map, slim, mine };
}

/* ---------- MARK SCHEMES: each AQA row's answer from its own cell (21 Nov; tools/aqa-ms-answers.js is the alias) ----------
   The AQA science rows imported 28 Oct took their `answer` from the scheme's text split at each question number's line; AQA prints
   that number in the vertical middle of its cell, so the split gave the top half of every cell to the question before it. This reads
   a row's answer from its cell as tools/aqa-ms-cells.py bounds it by the table's own rules, in the same "point | note; point" form. */
/* A CELL'S PRINTED LINES AS POINTS: a new point where the Mark column has a number, at a bullet, an "any n from", an "or",
   an "(improvement)"-style heading, or after a line that ends a sentence; any other line continues the one above. A note in the
   Extra information column starts at allow / ignore / do not / max / if / must …, else continues the note above. The table's own
   header words, repeated on a page a cell runs onto, are dropped. */
const NOTE = /^(allow |ignore |do not |accept |reject |max |if |must |dependent|MP\d|or$|an answer|scores |the mark|alternative|approach|correct |ecf|award|credit)/i;
const HEAD = /^(Answers|Extra|information|Mark|Marks|AO|\/|Spec\.|Ref\.|Extra information|\s)*$/;
function flow(rows) {
  const pts = [];
  let cur = null;
  for (let [a, e, m] of rows) {
    a = a.replace(/\s*\bAnswers$/, '').trim();
    e = e.replace(/\s*\b(Extra information|Extra|information)$/, '').replace(/^(Extra information|information)$/, '').trim();
    if (HEAD.test(a) && HEAD.test(e) && HEAD.test(m || '')) continue;
    if (a) {
      const fresh = !cur || /^\d/.test((m || '').trim()) || /^(•|any |or$|either|approach|alternative|\(\w+\):?$)/i.test(a) || /[.:]$/.test(cur.a);
      if (fresh) { cur = { a, e: [] }; pts.push(cur); } else cur.a += ' ' + a;
    }
    if (e) {
      if (!cur) { cur = { a: '', e: [] }; pts.push(cur); }
      if (!cur.e.length || NOTE.test(e)) cur.e.push(e); else cur.e[cur.e.length - 1] += ' ' + e;
    }
  }
  return pts.map(p => [p.a, ...p.e].filter(Boolean).join(' | ')).join('; ')
    .replace(/\( +/g, '(').replace(/ +\)/g, ')').replace(/\s+/g, ' ').trim();
}

const MS = {
  cells(c) {
    c.out = []; c.miss = [];
    for (const id of c.ids) {
      const m = /^Q-AQA-(\w+)-(\d{4})-(\d\w)-(\d\d)(\d)$/.exec(id);
      if (!m) { c.miss.push(id + ' (id not in the <spec>-<yymm>-<paper>-<qq><p> form)'); continue; }
      if (c.overrides[id] != null) { c.out.push({ id, answer: c.overrides[id] }); continue; }
      const f = path.join(c.pdfDir, m[1] + '-' + m[2] + '-' + m[3] + '.pdf'), q = m[4] + '.' + m[5];
      if (!fs.existsSync(f)) { c.miss.push(id + ' (no ' + path.basename(f) + ')'); continue; }
      const cell = IM.cells(f)[q];
      if (!cell) { c.miss.push(id + ' (no cell ' + q + ')'); continue; }
      c.out.push({ id, cell });
    }
  },
  answers(c) {
    c.out.forEach(r => { if (r.cell) { r.answer = flow(r.cell); delete r.cell; } });
    c.out = c.out.filter(r => { if (!r.answer) c.miss.push(r.id + ' (empty cell)'); return !!r.answer; });
    c.priv = IM.words('questions');
    c.changed = c.out.filter(r => r.answer !== ((c.priv[r.id] || {}).answer || ''));
    console.log('aqa-ms-answers: ' + c.out.length + ' cells read, ' + c.changed.length + ' differ from the stored answer' + (c.miss.length ? ', ' + c.miss.length + ' not read:' : ''));
    c.miss.forEach(x => console.log('  ' + x));
  },
  words(c) {
    if (!c.apply) return;
    c.changed.forEach(r => { c.priv[r.id] = Object.assign(c.priv[r.id] || {}, { answer: r.answer }); });
    IM.writeWords('questions', c.priv);
    console.log('  applied ' + c.changed.length + ' to data-private/questions.json');
  },
};

/* ---------- KEY PACKS: a version-1 pack (lib-import-*.json) onto this machine's words, as the Ledger's libPackApply_ takes it ---------- */
const KEYS = {
  validate(c) {
    const plan = IM.checkPack(c.pack);
    if (plan.error) throw new Error(c.file + ': ' + plan.error);
    c.plan = plan.plan;
    const n = Object.keys(c.plan).reduce((t, k) => t + c.plan[k].length, 0);
    console.log('keypack: ' + c.file + ' — ' + n + ' item(s) in ' + Object.keys(c.plan).join(', ') + (c.apply ? '' : ' (checked; --apply sets them)'));
  },
  apply(c) {
    if (!c.apply) return;
    Object.keys(c.plan).forEach(name => {
      const map = IM.words(name);
      c.plan[name].forEach(({ id, set }) => {
        const w = Object.assign(map[id] || {}, set);
        Object.keys(set).forEach(k => { if (set[k] === null) delete w[k]; });
        map[id] = w;
      });
      IM.writeWords(name, map);
      console.log('keypack: ' + c.plan[name].length + ' set in data-private/' + name + '.json');
    });
  },
};

/* ---------- INSERTS: our own formulae and equation sheets (tools/inserts.py), beside the reading inserts it does not write ---------- */
const INSERT = {
  sheets(c) { c.rows = IM.insertSheets(); },
  write(c) {
    const mine = new Set(c.rows.map(r => r.insert_id));
    const rows = c.rows.concat(IM.cards('inserts').rows.filter(r => !mine.has(r.insert_id)));
    IM.writeCards('inserts', rows, 'indent');
    console.log('inserts: ' + rows.length + ' written to data/inserts.json');
  },
};

/* SPEC CODES (was tools/set-spec-codes.py, UNIFY AFTER 2, 23 Nov): spec_code on the papers whose code their own columns determine, so a
   tutor holding a paper can type the code on its cover. A cell already typed from a cover wins, and one that disagrees is a fault, not
   overwritten. Every Edexcel GCSE maths past paper with questions must come out with a 1MA1 code, or the rule found fewer than exist. */
const SPEC_AQA = { 'P-AQA-8463-2306-1H': '8463/1H', 'P-AQA-8463-2306-2H': '8463/2H', 'P-AQA-8464P-2306-1H': '8464/P/1H' };
const SPEC_TIER = { Higher: 'H', Foundation: 'F' };
const edexcelMaths = r => r.exam_board === 'Edexcel' && r.subject === 'Maths' && r.level === 'GCSE' && !/specimen/i.test(r.name || '');
function specWanted(r) {
  if (SPEC_AQA[r.paper_id]) return SPEC_AQA[r.paper_id];
  const n = String(r.paper || '').trim(), t = SPEC_TIER[r.tier || ''];
  return edexcelMaths(r) && /^[123]$/.test(n) && t ? '1MA1/' + n + t : '';
}
const SPECCODE = {
  derive(c) {
    c.q = IM.cards('questions');
    const withQ = new Set(c.q.rows.filter(r => r.kind === 'question' && r.paper_id).map(r => r.paper_id));
    const docs = c.q.rows.filter(r => r.kind === 'document' && withQ.has(r.paper_id));
    c.filled = 0; let kept = 0, skipped = 0;
    docs.forEach(r => {
      const want = specWanted(r), have = String(r.spec_code || '').trim();
      if (!want) { skipped++; return; }
      if (have) { if (have !== want) throw new Error(r.paper_id + ' already says spec_code ' + have + ' and this rule would write ' + want); kept++; return; }
      r.spec_code = want; c.filled++;
    });
    const lost = docs.filter(r => edexcelMaths(r) && !/^1MA1\//.test(String(r.spec_code || '')));
    if (lost.length) throw new Error('an Edexcel GCSE maths past paper came out with no 1MA1 code: ' + lost.map(r => r.paper_id).join(', '));
    console.log('spec_code: ' + c.filled + ' filled, ' + kept + ' already right, ' + skipped + ' papers this rule cannot name' + (c.apply ? '' : ' (--apply writes them)'));
  },
  write(c) {
    if (!c.apply || !c.filled) return;
    IM.writeCards('questions', c.q.rows, c.q.style);
    console.log('spec_code: written to data/questions.json');
  },
};

/* ONE TOPIC TREE, MATHS (UNIFY THE LIBRARY AND PRACTICE, item 7): each maths question's idea_id from data/settings/question-ideas.json, and the
   ideas' names for Find (tools/lib/qideas.js). */
const QIDEAS = {
  measure(c) {
    c.QI = require('./lib/qideas.js');
    c.q = IM.cards('questions');
    const tb = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'data', 'textbooks.json'), 'utf8'));
    c.t = c.QI.assignAll(c.q.rows, tb);
    c.names = c.QI.names(tb);
    c.sciNames = c.QI.sciNames(tb);
    /* THE DfE TREE (owner 24–25 Nov): each maths question's `dfe` nodes and `worksheet` name (tools/lib/dfe.js), after its idea. */
    c.DFE = require('./lib/dfe.js');
    c.d = c.DFE.assign(c.q.rows);
    c.t.changed += c.d.changed;
    console.log('dfe: ' + c.d.questions + ' maths questions, ' + c.d.tagged + ' given a DfE node, ' + c.d.untaggedN + ' not: ' + JSON.stringify(c.d.untagged));
    console.log('qideas: ' + c.t.questions + ' maths questions, ' + c.t.mapped + ' given an idea, ' + c.t.unmapped + ' unmapped; ' + c.t.changed + ' row(s) changed; '
      + Object.keys(c.names).length + ' idea names; science: ' + c.t.science.questions + ' questions, ' + c.t.science.mapped + ' given an idea, ' + c.t.science.unmapped + ' unmapped; ' + Object.keys(c.sciNames).length + ' idea names');
  },
  write(c) {
    if (!c.apply) { console.log('(a dry run: --apply writes data/questions.json and taxonomy.json Maths.ideaNames)'); return; }
    if (c.t.changed) IM.writeCards('questions', c.q.rows, c.q.style);
    const file = path.join(L.ROOT, 'data', 'settings', 'taxonomy.json'), tax = JSON.parse(fs.readFileSync(file, 'utf8'));
    tax.Maths = Object.assign(tax.Maths || {}, { ideaNames: c.names, dfe: c.DFE.forFind() });
    tax.Science = Object.assign(tax.Science || {}, { ideaNames: c.sciNames });
    fs.writeFileSync(file, JSON.stringify(tax, null, 1) + '\n');
    console.log('qideas: written to data/questions.json and data/settings/taxonomy.json');
  },
};

/* ONE QUESTION SET (UNIFY THE LIBRARY AND PRACTICE, item 3): every grouping of questions one kind (tools/lib/sets.js). */
const SETS = {
  measure(c) {
    c.SE = require('./lib/sets.js');
    c.q = IM.cards('questions');
    const m = c.SE.measure(c.q.rows);
    console.log('sets: ' + m.sets + ' sets, kinds ' + m.kinds.join(' / ') + '; ' + m.orphans.length + ' question row(s) in no set, ' + m.wearing.length + ' wearing a kind of their own');
  },
  convert(c) {
    const r = c.SE.unify(c.q.rows, L.defs().files.questions.joined.fields);
    c.q.rows = r.rows; c.t = r.t;
    /* AND EACH QUESTION SHOWN IN A SECOND SET (`same_as`) WEARS ITS SOURCE'S CARD, copied afresh */
    const s = c.SE.same(c.q.rows, L.defs().files.questions.joined.fields, true);
    console.log('sets: ' + s.links + ' question(s) shown in a second set, ' + s.fixed + ' card(s) copied afresh from their source' + (s.dangling.length ? ', ' + s.dangling.length + ' naming no question: ' + s.dangling.slice(0, 5).join(', ') : ''));
    const m = c.SE.measure(c.q.rows);
    console.log('sets: ' + r.t.kinds + ' set(s) given the one kind, ' + r.t.dropped + ' question kind word(s) dropped, ' + r.t.made.length + ' set row(s) made ('
      + r.t.made.join(', ') + '), ' + r.t.moved + ' paper fact(s) moved onto them; now kinds ' + m.kinds.join(' / ') + ', ' + m.orphans.length + ' in no set');
  },
  write(c) {
    if (!process.argv.includes('--apply')) { console.log('(a dry run: --apply writes data/questions.json)'); return; }
    IM.writeCards('questions', c.q.rows, c.q.style);
    console.log('sets: written to data/questions.json');
  },
};

/* ONE CARD PER IDEA, MATHS (queue step 10, then step 3, 22 Nov): measure the groups, merge each into one card (tools/lib/ideas.js merge: levels as
   tags, broad chapters split by point, every word kept), measure again and write the report into data/settings/taxonomy.json Maths, then the three
   fields onto the maths cards of data/textbooks.json. The words go to data-private/ (a drive-pack takes them to the Ledger). --out <dir> writes
   the result there and touches nothing. */
const IDEAS = {
  measure(c) {
    c.ID = require('./lib/ideas.js');
    c.tb = IM.cards('textbooks');
    c.m = c.ID.measure(c.tb.rows);
    c.file = path.join(ROOT, 'data', 'settings', 'taxonomy.json');
    c.tax = JSON.parse(fs.readFileSync(c.file, 'utf8'));
    console.log('ideas: ' + c.m.cards.length + ' maths cards, ' + c.m.groups.length + ' ideas, ' + c.m.groups.filter(g => g.cards.length > 1).length + ' groups of the same idea');
  },
  merge(c) {
    const words = c.words = IM.words('textbooks'), out = argOut();
    /* TO A FIXED POINT: a card kept takes its idea's name, which can make it the same idea as another (GCSE and A-Level Vectors). */
    const r = { merged: {}, moved: 0, unruled: 0, gone: 0, anims: 0 };
    for (let i = 0; i < 5 && c.m.groups.some(g => g.cards.length > 1); i++) {
      const x = c.ID.merge(c.tb.rows, words, c.m);
      Object.assign(r.merged, x.merged); r.moved += x.moved; r.unruled += x.unruled; r.gone += x.gone; r.anims += x.anims;
      c.m = c.ID.measure(c.tb.rows);
    }
    const merged = Object.assign({}, ((c.tax.Maths || {}).ideas || {}).merged || {}, r.merged);
    /* A KEY MERGED BEFORE INTO ONE MERGED NOW names the card kept now. */
    Object.keys(merged).forEach(k => { let t = merged[k].to; while (merged[t]) t = merged[t].to; merged[k].to = t; });
    c.merged = merged;
    const n = out ? 0 : c.ID.relink(merged);
    if (out) IM.writeOut(out, 'textbooks', { cards: c.tb.rows, words });
    else if (r.gone || r.moved) IM.writeWords('textbooks', words);
    c.m = c.ID.measure(c.tb.rows);
    const m = c.m, files = m.cards.map(x => ({ board: x.board, spec: x.spec, level: x.level })).filter(x => x.board && x.spec);
    const boards = ['AQA', 'Edexcel', 'OCR'].filter(b => files.some(x => x.board === b)).map(b => ({ board: b,
      specs: [...new Set(files.filter(x => x.board === b).map(x => x.spec))].map(code => ({ code, level: files.find(x => x.board === b && x.spec === code).level,
        spec: (m.cards.find(x => x.board === b && x.spec === code).specs[0] || '').split(':')[0] })) }));
    /* THE QUESTIONS' IDEA NAMES (qideas) ARE KEPT; tools/one-topic.js says when they are stale. */
    c.tax.Maths = { subject: c.ID.SUBJECT, ideaNames: (c.tax.Maths || {}).ideaNames, cards: { levels: ['part_of', 'idea_id'], tree: 'data/topics.json', boards }, ideas: Object.assign(c.ID.report(m), { merged }) };
    const text = JSON.stringify(c.tax, null, 1) + '\n';
    if (out) { fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'taxonomy.json'), text); }
    else fs.writeFileSync(c.file, text);
    console.log('ideas: merged ' + r.gone + ' card(s) into the card kept, ' + r.moved + ' item move(s) from broad cards to their idea (' + r.unruled + ' by score alone, with no verdict in data/settings/idea-places.json), ' + r.anims
      + ' animation(s) moved, ' + n + ' spec link(s) pointed on; now ' + m.cards.length + ' cards, ' + m.groups.length + ' ideas, '
      + m.groups.filter(g => g.cards.length > 1).length + ' groups of more than one card');
  },
  tag(c) {
    const n = c.ID.tag(c.tb.rows, c.m), out = argOut();
    if (out) IM.writeOut(out, 'textbooks', { cards: c.tb.rows, words: c.words || {} });
    else IM.writeCards('textbooks', c.tb.rows, c.tb.style);
    console.log('ideas: ' + n + ' field(s) set on ' + c.m.cards.length + ' maths cards' + (out ? ' (in ' + out + ')' : ''));
  },
};
/* ONE IDEA PER CARD, SCIENCE (UNIFY THE LIBRARY AND PRACTICE, item 8, 24 Nov): tools/lib/sci-ideas.js — an idea is one AQA spec point; a broad
   GCSE chapter's items go each to the point card it reads most like, every word kept; the report into data/settings/taxonomy.json Science.ideas
   (merged: old key -> card kept), then part_of, specs and idea_id onto the science cards. --review <file> writes where each broad item went. */
const SCIIDEAS = {
  measure(c) {
    c.X = require('./lib/sci-ideas.js');
    c.tb = IM.cards('textbooks');
    c.m = c.X.measure(c.tb.rows);
    c.file = path.join(ROOT, 'data', 'settings', 'taxonomy.json');
    c.tax = JSON.parse(fs.readFileSync(c.file, 'utf8'));
    console.log('sciideas: ' + c.m.cards.length + ' science cards, ' + c.m.groups.length + ' ideas, ' + c.m.groups.filter(g => g.cards.length > 1).length + ' groups of the same idea');
  },
  merge(c) {
    const words = c.words = IM.words('textbooks'), log = [];
    const r = c.m.groups.some(g => g.cards.length > 1) ? c.X.merge(c.tb.rows, words, c.m, log) : { merged: {}, moved: 0, unruled: 0, gone: 0, anims: 0 };
    const merged = Object.assign({}, ((c.tax[c.X.KEY] || {}).ideas || {}).merged || {}, r.merged);
    Object.keys(merged).forEach(k => { let t = merged[k].to; while (merged[t]) t = merged[t].to; merged[k].to = t; });
    const n = require('./lib/ideas.js').relink(merged);
    const empty = c.X.dropEmpty(c.tb.rows, words);
    if (r.gone || r.moved || empty.length) IM.writeWords('textbooks', words);
    const rv = process.argv.indexOf('--review');
    if (rv > 0) fs.writeFileSync(process.argv[rv + 1], JSON.stringify(log, null, 1) + '\n');
    c.m = c.X.measure(c.tb.rows);
    const old = c.tax[c.X.KEY] || {};
    c.tax[c.X.KEY] = { subject: c.X.KEY, subjects: Object.keys(c.X.SUBJECTS), ideaNames: old.ideaNames,
      cards: { levels: ['part_of', 'idea_id'], tree: 'data/topics.json' }, ideas: Object.assign(c.X.report(c.m), { merged, books_gone: [...new Set((((old.ideas || {}).books_gone) || []).concat(empty))] }) };
    fs.writeFileSync(c.file, JSON.stringify(c.tax, null, 1) + '\n');
    console.log('sciideas: merged ' + r.gone + ' card(s) into the card kept, ' + r.moved + ' item move(s) from broad cards (' + r.unruled + ' by score alone), '
      + r.anims + ' animation(s) moved, ' + n + ' spec link(s) pointed on; now ' + c.m.cards.length + ' cards, ' + c.m.groups.length + ' ideas, '
      + c.m.groups.filter(g => g.cards.length > 1).length + ' groups of more than one card');
  },
  tag(c) {
    const n = c.X.tag(c.tb.rows, c.m);
    IM.writeCards('textbooks', c.tb.rows, c.tb.style);
    console.log('sciideas: ' + n + ' field(s) set on ' + c.m.cards.length + ' science cards');
  },
};
/* ---------- @FAMILY QUESTIONS FROM THE LIBRARY (owner, 20 Nov; queue item 11 of UNIFY): fact ids (tools/lib/facts.js) → questions made from
   them (tools/lib/family-q.js) → one @family set per idea in data/questions.json, the words in data-private/questions.json, data/facts.json
   the ids, versions and templates, data/settings/question-ideas.json science.set each set's idea; --ledger <dir> packs the words for the Drive. ---------- */
const FAMILY = {
  facts(c) {
    c.F = require('./lib/facts.js'); c.Q = require('./lib/family-q.js');
    c.regFile = path.join(ROOT, c.F.FILE);
    c.reg = fs.existsSync(c.regFile) ? JSON.parse(fs.readFileSync(c.regFile, 'utf8')) : {};
    c.tb = IM.cards('textbooks');
    c.cards = c.F.cardsOf(c.tb.rows, IM.words('textbooks'));
    c.a = c.F.assign(c.reg, c.cards);
    c.text = {}; c.a.facts.forEach(f => { c.text[f.id] = f.text; });
    console.log('family: ' + c.a.facts.length + ' facts on ' + c.cards.length + ' cards; ' + c.a.made.length + ' new id(s), ' + c.a.moved.length + ' moved or edited, ' + c.a.retired.length + ' retired');
  },
  questions(c) {
    c.qs = c.Q.make(c.a.facts);
    c.v = c.Q.version(c.reg, c.qs, id => c.text[id]);
    const k = {}; c.qs.forEach(q => { k[q.kind] = (k[q.kind] || 0) + 1; });
    console.log('family: ' + c.qs.length + ' questions (' + Object.keys(k).map(x => k[x] + ' ' + x).join(', ') + '); ' + c.v.made + ' new, ' + c.v.bumped + ' new version(s), ' + c.v.gone + ' gone');
  },
  write(c) {
    const apply = process.argv.includes('--apply');
    const q = IM.cards('questions'), mine = r => S(r.paper_id).startsWith('P-FAM-AQA-');
    const old = {}; q.rows.filter(mine).forEach(r => { old[r.row_id] = r; });
    const name = {}, sub = {};
    c.cards.forEach(x => { if (!name[x.idea]) { name[x.idea] = x.title; sub[x.idea] = x.subject; } });
    const rows = c.Q.rowsOf(c.qs, name, sub, c.reg, old);
    c.rows = rows;
    const sets = rows.filter(r => r.kind === 'document').length;
    console.log('family: ' + sets + ' set(s), ' + rows.filter(r => r.kind === 'question' && r.active === 'True').length + ' live question row(s)' + (apply ? '' : ' (a dry run: --apply writes)'));
    if (!apply) return;
    q.rows = q.rows.filter(r => !mine(r)).concat(rows);
    IM.writeCards('questions', q.rows, q.style);
    const words = IM.words('questions');
    c.qs.forEach(x => { words[x.id] = x.words; });
    IM.writeWords('questions', words);
    c.reg.about = 'FACT IDS AND @FAMILY QUESTIONS (owner, 20 Nov): written by `node tools/content.js family --apply` (tools/lib/facts.js, tools/lib/family-q.js), '
      + 'held by tools/one-fact.js. facts: id -> [card, field, line, hash of its words]; next: the last number given in each idea; retired: ids never given again; '
      + 'questions: base id -> {v version, h hash of its words, kind, idea, tests (fact ids), t its template: words pointing at facts}. No words here.';
    const out = { about: c.reg.about, facts: c.reg.facts, next: c.reg.next, retired: c.reg.retired, questions: c.reg.questions };
    fs.writeFileSync(c.regFile, JSON.stringify(out, null, 0).replace(/,"(?=[^"]+":\[")/g, ',\n"').replace(/\},"(Q-FAM-)/g, '},\n"$1') + '\n');
    const tf = path.join(ROOT, 'data', 'settings', 'question-ideas.json'), T = JSON.parse(fs.readFileSync(tf, 'utf8'));
    const st = T.science.set;
    Object.keys(st).forEach(k => { if (k.startsWith('P-FAM-AQA-')) delete st[k]; });
    rows.filter(r => r.kind === 'document').forEach(r => { st[r.paper_id] = c.qs.find(x => c.Q.SET(x.idea) === r.paper_id).idea; });
    fs.writeFileSync(tf, JSON.stringify(T, null, 1) + '\n');
    console.log('family: wrote data/questions.json, data-private/questions.json, ' + c.F.FILE + ', data/settings/question-ideas.json science.set');
  },
  pack(c) {
    const i = process.argv.indexOf('--ledger'), dir = i === -1 ? null : process.argv[i + 1];
    if (!dir) return;
    IM.pack(dir, c.qs.map(x => x.id), '@family science questions from the library: AQA 8461/8462/8463 Foundation, one set per idea (' + c.qs.length + ' questions)');
  },
};
const { S } = require('./lib/gen.js');
const argOut = () => { const i = process.argv.indexOf('--out'); return i === -1 ? null : process.argv[i + 1]; };

/* ---------- THE RUN: a source's step list (data/settings/content.json sources) ---------- */
async function main(argv) {
  if (argv[0] === 'library') return LIB.main(argv.slice(1));
  const opt = k => { const i = argv.indexOf('--' + k); return i === -1 ? null : argv[i + 1]; };
  const pos = argv.filter((a, i) => !a.startsWith('--') && !(i && /^--(stage|out|ledger|overrides)$/.test(argv[i - 1])));
  const what = pos[0];
  if (!what || what === 'help' || what === '--help') { console.log(USAGE); return; }
  const only = opt('stage') ? opt('stage').split(',') : null;
  if (what === 'markscheme') {
    if (!pos[1] || !pos[2]) throw new Error('usage: node tools/content.js markscheme <ids file> <pdf dir> [--overrides f.json] [--apply]');
    const over = opt('overrides');
    return IM.run('markscheme', MS, { ids: fs.readFileSync(pos[1], 'utf8').split(/\s+/).filter(Boolean), pdfDir: pos[2],
      overrides: over ? JSON.parse(fs.readFileSync(over, 'utf8')) : {}, apply: argv.includes('--apply') }, only);
  }
  if (what === 'keypack') {
    if (!pos[1]) throw new Error('usage: node tools/content.js keypack <lib-import.json> [--apply]');
    return IM.run('keypack', KEYS, { file: pos[1], pack: JSON.parse(fs.readFileSync(pos[1], 'utf8')), apply: argv.includes('--apply') }, only);
  }
  if (what === 'insert') return IM.run('insert', INSERT, {}, only);
  if (what === 'ideas') return IM.run('ideas', IDEAS, {}, only);
  if (what === 'sciideas') return IM.run('sciideas', SCIIDEAS, {}, only);
  if (what === 'family') return IM.run('family', FAMILY, {}, only);
  /* ONE ANSWER FORMAT (UNIFY AFTER 7): the words as they are, put in the one format; writeWords does the same on every write. */
  if (what === 'picks') {
    const map = IM.words('questions'), t = {};
    require('./lib/pick-key.js').normaliseMap(map, t);
    console.log('picks: ' + (t.picks || 0) + ' pick questions, ' + (t.keys || 0) + ' key(s) put in letters, ' + (t.notes || 0) + ' note(s) cleared of the letter, '
      + (t.not || []).length + ' not convertible' + ((t.not || []).length ? ': ' + t.not.join(', ') : ''));
    if (argv.includes('--apply')) IM.writeWords('questions', map); else console.log('(a dry run: --apply writes data-private/questions.json)');
    return;
  }
  /* ONE DRAWING CANVAS (owner, 23 Nov): the words as they are, every draw_answer in the one form (tools/lib/draw-key.js); writeWords does the same on every write. */
  if (what === 'drawkeys') {
    const map = IM.words('questions'), t = {};
    require('./lib/draw-key.js').normaliseMap(map, t);
    console.log('drawkeys: ' + (t.keys || 0) + ' drawn key(s) put in the one form, ' + (t.not || []).length + ' not convertible' + ((t.not || []).length ? ': ' + t.not.join(', ') : ''));
    if (argv.includes('--apply')) IM.writeWords('questions', map); else console.log('(a dry run: --apply writes data-private/questions.json)');
    return;
  }
  /* ONE QUESTION SHAPE (owner, 23 Nov): the words as they are, put in the one shape (tools/lib/shape.js); writeWords does the same on
     every write. --apply also writes the lib_has of each card it changed, so a phone knows which words are coming. */
  if (what === 'shape') {
    const SH = require('./lib/shape.js'), map = IM.words('questions'), t = {};
    const c = IM.cards('questions'), byId = {};
    c.rows.forEach(r => { byId[r.row_id] = r; });
    const def = L.defs().files.questions, hasOf = w => def.private.filter(f => w && w[f] !== undefined && w[f] !== null && String(w[f]).trim() !== '').join(' ');
    const was0 = {}, had = {};
    Object.keys(map).forEach(id => { was0[id] = JSON.stringify(map[id]); had[id] = hasOf(map[id]); });
    SH.normaliseMap(map, byId, t);
    const changed = Object.keys(map).filter(id => was0[id] !== JSON.stringify(map[id]));
    /* only a card whose fields this changed (options moved into `choices`): a lib_has already stale is not this tool's to touch */
    const moved = new Set(changed.filter(id => had[id] !== hasOf(map[id])));
    console.log('shape: ' + (Object.keys(t).map(k => t[k] + ' ' + k).join(', ') || 'every row in the one shape already'));
    if (!argv.includes('--apply')) { console.log('(a dry run: --apply writes data-private/questions.json and the changed cards\' lib_has)'); return; }
    IM.writeWords('questions', map);
    const now = IM.words('questions');
    let n = 0;
    c.rows.forEach(r => {
      if (!r || !moved.has(r.row_id) || !Object.prototype.hasOwnProperty.call(r, 'lib_has') || !now[r.row_id]) return;
      r.lib_has = hasOf(now[r.row_id]); n++;
    });
    if (n) IM.writeCards('questions', c.rows, c.style);
    console.log('shape: words written, ' + changed.length + ' row(s) changed; ' + n + ' card(s) lib_has brought up to date');
    return;
  }
  if (what === 'sets') return IM.run('sets', SETS, {}, only);
  if (what === 'qideas') return IM.run('qideas', QIDEAS, { apply: argv.includes('--apply') }, only);
  if (what === 'speccode') return IM.run('speccode', SPECCODE, { apply: argv.includes('--apply') }, only);
  const want = only || STAGES;
  const bad = want.filter(s => !STAGES.includes(s));
  if (bad.length) throw new Error('no stage ' + bad.join(', ') + ' — ' + STAGES.join(', '));
  /* A PAPER'S STEPS: a transform asked for without `import` leaves its spec in data-private/specs/ */
  const PAPER = {
    source, spec: saveSpec, parts, figures, keys, card,
    import(spec) {
      if (['parts', 'figures', 'keys', 'card'].some(s => want.includes(s)) && !want.includes('import')) saveSpec(spec);
      if (want.includes('import')) importRows(spec, { out: opt('out'), ledger: opt('ledger') });
    },
  };
  for (const spec of specs(what)) {
    console.log('— ' + spec.name + ' (' + spec.from + ')');
    await IM.run('paper', PAPER, spec, want.includes('import') ? want : want.concat(['import']));
  }
}

if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(String((e && e.message) || e)); process.exit(1); });

module.exports = { STAGES, familyOf, parts, figures, keys, card, flow, main };
