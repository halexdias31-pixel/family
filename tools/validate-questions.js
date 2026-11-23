#!/usr/bin/env node
/* @family. — tools/validate-questions.js: EVERY QUESTION A STUDENT CAN REACH, MARKED BY THE SITE'S OWN MARKER AGAINST ITS OWN KEY (owner, 17 Nov).
   Pure node, no network. Reads data/questions.json joined with data-private/questions.json (and each paper's card, as libJoinPaper_ does),
   loads the app's own functions (library.js libQuestion_, find-marking.js mark_, find-pen.js DRAW_MARK ...) out of js/ into a vm, and gives each
   active question row one verdict:
     ok      MARKABLE: a mechanical key, its own model answer (answer text / the key's own example / the key's own drawing) scores full marks,
             and a clearly wrong answer scores less.
     tutor   UNMARKED BY DESIGN: a level-marked essay or long answer (6+ marks, or a levels mark scheme) with a model answer; marked by the tutor.
     broken  no key, the key fails its own model answer (or passes a wrong one), a figure it needs is missing, or no question text.
   Writes data/question-status.json (public: ids and verdicts only, never content) — the site reads it (js/library.js libStatus_) and
   never offers a broken question to a student. Prints the counts by subject and paper. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, read, S } = require('./lib/gen.js');
const OUT = path.join(ROOT, 'data', 'question-status.json');

/* ---------- THE APP'S OWN CODE: every top-level declaration in index.html's files, run into the vm the first time something names it */
function appCode() {
  const acorn = require(path.join(ROOT, 'node_modules', 'acorn'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...(/window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html)[1]).matchAll(/'([^']+)'/g)].map(m => 'js/' + m[1] + '.js');
  const decl = {};
  for (const f of files) {
    let src; try { src = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { continue; }
    let ast; try { ast = acorn.parse(src, { ecmaVersion: 2022 }); } catch (e) { continue; }
    for (const n of ast.body) {
      if (n.type === 'FunctionDeclaration') decl[n.id.name] = src.slice(n.start, n.end);
      else if (n.type === 'VariableDeclaration') n.declarations.forEach(d => { if (d.id.type === 'Identifier' && !(d.id.name in decl)) decl[d.id.name] = 'var ' + src.slice(d.start, d.end) + ';'; });
    }
  }
  const DATA = { confusables: (read('data/settings/confusables.json') || []).map(r => ({ words: S(r.words) })) };
  const peel = read('data/settings/peel.json'); if (peel) DATA.peel = peel;
  const marking = read('data/settings/marking.json'); if (marking) DATA.marking = marking;
  /* the word ranks the typo rule reads (find-marking.js markRealWord_), as the page fetches them */
  const freq = read('data/word-freq.json'); if (freq && Array.isArray(freq.words)) DATA.wordFreq = freq.words;
  const ctx = vm.createContext({ console: { log() {}, warn() {}, error() {} }, DATA });
  const loaded = new Set(), missing = new Set();
  const retry = run => {
    for (let i = 0; i < 400; i++) {
      try { return run(); } catch (e) {
        const m = /^(\w+) is not defined/.exec(e && e.message);
        if (!m) throw e;
        if (!need(m[1])) missing.add(m[1]), vm.runInContext('var ' + m[1] + ' = undefined', ctx);
      }
    }
    throw new Error('validate-questions: too many missing names');
  };
  function need(name) {
    if (loaded.has(name) || !decl[name]) return false;
    loaded.add(name);
    retry(() => vm.runInContext(decl[name], ctx));
    return true;
  }
  /* every app name the tool's own expressions name, kept so run() can hold them to its list of entry points (VERDICT_FROM) */
  const asked = new Set();
  const call = (expr, preload) => {
    if (!preload) identsOf(acorn, expr).forEach(n => { if (n in decl) asked.add(n); });
    return retry(() => vm.runInContext(expr, ctx));
  };
  return { ctx, call, decl, loaded, missing, files, asked, acorn };
}
/* the identifiers a piece of code names as variables (not a property after a dot, not an object key): the edges of the verdict path */
function identsOf(acorn, src) {
  const out = new Set();
  let ast; try { ast = acorn.parse(src, { ecmaVersion: 2022 }); } catch (e) { return null; }
  (function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Identifier') out.add(n.name);
    for (const k in n) {
      if (k === 'type' || (n.type === 'MemberExpression' && k === 'property' && !n.computed) || ((n.type === 'Property' || n.type === 'MethodDefinition' || n.type === 'PropertyDefinition') && k === 'key' && !n.computed)) continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v);
    }
  })(ast);
  return out;
}

/* ---------- THE ROWS A STUDENT CAN REACH: active questions, public joined with private, each with its paper's card */
function rowsOf() {
  const pub = read('data/questions.json') || [], priv = read('data-private/questions.json') || {};
  const rows = pub.map(r => Object.assign({}, r, priv[r.row_id] || {}));
  const join = ((((read('data/settings/kinds.json') || {}).kinds || {}).question || {}).sheet || {}).lib;
  const j = join && join.joined;
  if (j && Array.isArray(j.fields)) {
    const card = new Map();
    rows.forEach(r => { if (r.kind === j.from) card.set(r[j.by], r); });
    rows.forEach(r => {
      const c = r.kind !== j.from && card.get(r[j.by]);
      if (c) j.fields.forEach(f => { if (r[f] === null) delete r[f]; else if (r[f] === undefined && c[f] !== undefined) r[f] = c[f]; });
    });
  }
  /* a part's stem may hold the figure: the preamble rows of the same question number, by paper */
  return rows;
}

const plain = h => S(h).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WRONG = 'zzqx wrong 98765';
/* LEVEL-MARKED: a long answer, or a mark scheme written in levels / indicative content */
const LEVELS = /\blevel\s*[1-4]\b|levels? of response|indicative content|\bAO[1-4]\b|level-marked|levels-based/i;

/* ---------- THE MODEL ANSWERS: everything the key itself says is right */
function models(r) {
  const out = [];
  /* the key's letters on a pick, its numbers on an ordering (ONE ANSWER FORMAT, js/library.js choiceKeys_) */
  const key = S(r.choice_right).split('|')[0].split(',').map(t => (t = t.trim(), /^[A-Z]$/.test(t) ? t.charCodeAt(0) - 64 : +t));
  if (S(r.choice_right)) out.push(key.map(n => L[n - 1] || '?').join(', '));
  /* and the options' own words, as a child types them where the options are letters already (find-marking.js choiceList_) */
  if (S(r.choice_right) && S(r.choices)) { const o = S(r.choices).split('|').map(c => c.replace(/<[^>]*>/g, '').trim());
    out.push(key.map(n => o[n - 1] || '?').join(', ')); }
  if (S(r.cells)) out.push(S(r.cells).split(';').map(c => (c.split('=').pop() || '').split('|')[0].trim()).join(' ; '));
  if (S(r.mark_words)) out.push(S(r.mark_words).split(';').map(p => p.split('|')[0].replace(/\+/g, ' ')).join(' '));
  if (S(r.accept)) {
    const parts = S(r.accept).split('|').map(s => s.trim()).filter(Boolean);
    parts.filter(s => !/^rule:/i.test(s)).slice(0, 4).forEach(w => out.push(w));
    /* a points rule's own example: one way of every point */
    parts.filter(s => /^rule:\s*points/i.test(s)).forEach(s => {
      const pts = s.replace(/^rule:\s*points[^;]*;?/i, '').split(';').map(p => p.trim()).filter(Boolean);
      if (pts.length) out.push(pts.map(p => p.split('/')[0].split(/\s+/).map(w => w.split('~')[0]).join(' ')).join('. ') + '.');
    });
  }
  const ans = plain(r.answer);
  if (ans) out.push(ans);
  return out;
}

function figureMissing(r, stemHasFig) {
  if (/not transcribed|not reproduced|figure (is )?missing|diagram (is )?missing|image not available/i.test(S(r.examiner_note))) return 'figure not transcribed';
  const words = plain(r.html) + ' ' + plain(r.question) + ' ' + plain(r.lead);
  const has = S(r.diagram) || S(r.diagram_twin) || S(r.images) || S(r.figure) || stemHasFig || /<svg|<img/i.test(S(r.html) + S(r.lead));
  if (/\b(Figure|Fig\.)\s*\d/i.test(words) && !has) return 'refers to a Figure with no diagram';
  return '';
}

/* ---------- THE CACHE (queue step 2, 22 Nov: the build waited 35 minutes here). A verdict depends only on the question's joined row (public +
   private + its paper's card), its stem's figure, and the code that marks it; so each verdict is kept under a hash of exactly those, and only a
   question whose hash is new is marked again. THE CODE'S HASH: this tool, tools/lib/gen.js, the settings appCode reads, index.html's file list,
   the question's sheet join in kinds.json, and the source of every app declaration on the verdict path (verdictNames, below); any change there
   marks everything again. The cache holds hashes
   and verdicts only, in a git-ignored file; missing or unreadable, it is a full run, and --full ignores it. tools/validate-cache.js checks it. */
const CACHE = path.join(ROOT, '.cache', 'validate-questions.json');
/* THE VERDICT PATH (22 Nov: a card-drawing change marked all 38,000 questions again, 35 minutes). Its entry points are the app names this tool's
   own expressions call (held to this list at run time: a new one fails the run). From them, the path is every name reached through the names each
   declaration's source mentions (acorn), among the names a run really loaded or found missing: so a page-only name loaded up front (cardDraw_,
   CARD_BLOCKS, as the page has them) is in only if marking code mentions it, and a card body no marking code names (referenceBody_, renderCard)
   never is. A name is kept, never pruned, when it is mentioned at all, behind a `typeof` or in a branch never taken; and if any declaration on the
   path reaches names by string (eval, new Function, window[...]), every loaded name is kept. */
const VERDICT_FROM = ['qtMarker_', 'workRow_', 'libQuestion_', 'markerOf_', 'markIsLevels_', 'levelsRow_', 'markLevelsRead_', 'padSurface_',
  'surfaceSvg_', 'drawFig_', 'DRAW_MARK', 'cellsOf_', 'markIsPeel_', 'mark_'];
const BY_STRING = /\beval\s*\(|\bFunction\s*\(|\b(window|globalThis|self|this)\s*\[/;
function verdictNames(app, pool) {
  const seen = new Set(), todo = VERDICT_FROM.slice();
  let byString = false;
  while (todo.length) {
    const n = todo.pop();
    if (seen.has(n)) continue;
    seen.add(n);
    const src = app.decl[n];
    if (src === undefined) continue;
    const ids = identsOf(app.acorn, src);
    if (!ids || BY_STRING.test(src)) { byString = true; continue; }
    ids.forEach(x => { if (pool.has(x) && !seen.has(x)) todo.push(x); });
  }
  return [...(byString ? new Set([...pool, ...seen]) : seen)].sort();
}
const sha = s => require('crypto').createHash('sha256').update(s).digest('hex');
function codeHash(app, names, salt) {
  const parts = [salt || ''];
  ['tools/validate-questions.js', 'tools/lib/gen.js', 'data/settings/confusables.json', 'data/settings/peel.json', 'data/settings/marking.json',
    'data/word-freq.json', 'node_modules/acorn/package.json'].forEach(f => {
    let t; try { t = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { t = '\u0000missing'; }
    parts.push(f + '\u0000' + t);
  });
  /* of kinds.json, only the question's sheet join rowsOf reads (the marker's vm never sees kinds.json): the card shapes it also holds draw, they do not mark */
  parts.push('kinds.question.sheet\u0000' + JSON.stringify(((((read('data/settings/kinds.json') || {}).kinds || {}).question || {}).sheet) || null));
  parts.push(app.files.join(','));
  names.forEach(n => parts.push(n + '\u0000' + (app.decl[n] === undefined ? '\u0000none' : app.decl[n])));
  return sha(parts.join('\u0001'));
}
function cacheRead(file) {
  try { const c = JSON.parse(fs.readFileSync(file, 'utf8')); if (c && c.v === 1 && typeof c.code === 'string' && Array.isArray(c.names) && c.rows && typeof c.rows === 'object') return c; } catch (e) { /* a full run */ }
  return null;
}

/* opts, for tools/validate-cache.js: rows (joined rows, made up), out, cache (paths), salt (stands in for a code change), touch (below), full, quiet */
function run(opts) {
  opts = opts || {};
  const t0 = Date.now();
  const OUTF = opts.out || OUT, CACHEF = opts.cache || CACHE, log = opts.quiet ? () => {} : console.log;
  /* WITHOUT THE PRIVATE HALF (a CI checkout) every answer is missing: the file already written stands */
  if (!opts.rows && !fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'))) { console.log('validate-questions: no data-private/questions.json here, data/question-status.json left as it is'); return null; }
  const rows = opts.rows || rowsOf();
  const app = appCode();
  /* opts.touch, for tools/validate-cache.js: { name: src => src } edits an app declaration's source as a change to its file would */
  Object.entries(opts.touch || {}).forEach(([n, f]) => { app.decl[n] = f(app.decl[n]); });
  const { ctx, call } = app;
  const was = opts.full || process.argv.includes('--full') ? null : cacheRead(CACHEF);
  const codeWas = !!was && codeHash(app, was.names, opts.salt) === was.code;
  const kept = codeWas ? was.rows : {};
  let readied = false;
  const ready = () => {
    if (readied) return;
    readied = true;
    call('qtMarker_(workRow_({row:{}}))');
    /* names the app reaches only behind a `typeof` (drawFig_'s padGrid_) or inside a try that swallows the miss (cardBlock_'s CARD_BLOCKS,
       cardDraw_ for a made-up surface): neither throws here, so they are loaded up front, as the page has them */
    call('padGrid_', true); call('CARD_BLOCKS', true);
    call('cardDraw_({ el: "svg", a: { viewBox: "0 0 1 1" }, kids: [{ el: "line", a: { x1: 1 } }, { el: "text", a: { x: 1 }, text: "1" }] })', true);
  };
  /* figures held by a question's preamble rows (same paper, same question number) */
  const stemFig = new Set(), stemSvg = new Map();
  rows.forEach(r => {
    if (r.kind !== 'preamble') return;
    const k = S(r.paper_id) + '#' + S(r.question);
    if (S(r.diagram) || S(r.diagram_twin) || S(r.images) || S(r.figure) || /<svg|<img/i.test(S(r.html))) stemFig.add(k);
    if (S(r.diagram) && !stemSvg.has(k)) stemSvg.set(k, S(r.diagram));
  });
  const status = {}, why = {};
  const tally = {};
  const add = (r, v, reason) => {
    status[r.row_id] = v;
    const subj = (S(r.key_stage) || '?') + ' ' + (S(r.subject) || '?');
    const t = tally[subj] || (tally[subj] = { ok: 0, tutor: 0, broken: 0, papers: {} });
    t[v]++;
    const p = t.papers[S(r.paper_id) || '-'] || (t.papers[S(r.paper_id) || '-'] = { ok: 0, tutor: 0, broken: 0 });
    p[v]++;
    if (v === 'broken') why[reason] = (why[reason] || 0) + 1;
  };
  const verdict = (x, a) => { ctx.__a = a; try { return call('mark_(__x, __a)'); } catch (e) { return { verdict: 'error', why: e.message }; } };
  /* ONE QUESTION'S VERDICT, [ok | tutor | broken, why] */
  const judge = r => {
    /* words still only in the Ledger (`lib_has`, 397): the site fetches them later, but nothing here can see or check them */
    /* ONLY IN THE LEDGER: not hidden for that alone (owner's call, 17 Nov) -- kept when the Ledger says it holds a key, so a question that works is never hidden for being unchecked here. */
    if (!plain(r.html) && !plain(r.lead) && !S(r.diagram) && !S(r.choices)) {
      if (/\b(accept|cells|draw_answer|choice_right|mark_words|order_ends)\b/.test(S(r.lib_has))) return ['ok', 'words and key only in the Ledger (not checked here)'];
      /* AND ONE WHOSE LEDGER HOLDS AN ANSWER BUT NO KEY: the tutor's, as below (owner, 18 Nov). */
      if (/\banswer\b/.test(S(r.lib_has)) && /\bhtml\b/.test(S(r.lib_has))) return ['tutor', 'answer only in the Ledger, no key yet'];
      return ['broken', S(r.lib_has) ? 'words only in the Ledger, no key listed' : 'no question text']; }
    const fig = figureMissing(r, stemFig.has(S(r.paper_id) + '#' + S(r.question)));
    if (fig) return ['broken', fig];
    ready();
    ctx.__r = r;
    const x = call('__x = libQuestion_(__r)');
    const kind = call('markerOf_(libQuestion_(__r)).kind');
    if (kind === 'save') {
      const marks = Number(r.marks) || 0;
      /* AN ANSWER WITH NO KEY IS THE TUTOR'S TO MARK, NOT HIDDEN (owner, 18 Nov: a part vanished mid-question on Finley's
         Waves worksheet). The child answers, sees the scheme's answer, and the tutor marks it; a key makes it the site's later. */
      if (plain(r.answer)) return ['tutor', marks >= 6 || LEVELS.test(S(r.answer)) || /essay/i.test(S(r.answer_type)) ? '' : 'no mechanical key yet'];
      return ['broken', 'no key and no answer'];
    }
    /* A LEVELS KEY (rule 1.33) marks by its question type's distilled rubric, held to AQA's examiner-marked exemplars by tools/essay-cases.js:
       the site's to mark once that rubric is in data/settings/marking.json */
    if (call('markIsLevels_(__x.accept)')) return [call('levelsRow_(markLevelsRead_(__x.accept).type).length') ? 'ok' : 'broken', 'levels key names no rubric'];
    let right = false, wrongOk = false;
    if (kind === 'draw') {
      ctx.__x = x;
      /* the pad's figure: the part's own, else its stem's (qtPenOpen_), read as the pad reads it (drawFig_) */
      ctx.__svg = S(x.diagram) || stemSvg.get(S(r.paper_id) + '#' + S(r.question)) || call('padSurface_(__x) ? surfaceSvg_(padSurface_(__x)) : ""');
      const fig = call('drawFig_(__svg)');
      ctx.__f = fig;
      let ex = []; try { ex = call('DRAW_MARK.example(__x.drawAnswer, __f)') || []; } catch (e) { ex = []; }
      const v = ex.length ? verdict(x, { strokes: ex, fig }) : null;
      right = !!v && v.verdict === 'right';
      const w = verdict(x, { strokes: [[170, 170, 171, 171]], fig });
      wrongOk = w.verdict !== 'right';
      if (!ex.length) return ['broken', 'drawing key has no example drawing'];
    } else {
      /* a table's blanks are typed in the one box, in order with commas (22 Nov): the key's own first way in each */
      const cellModel = kind === 'cells' ? [call('cellsOf_(__x).filter(c => c.ways).map(c => c.ways.split("|")[0].trim()).join(", ")')] : [];
      right = cellModel.concat(models(r)).some(a => verdict(x, a).verdict === 'right');
      const wrongs = kind === 'choice' || kind === 'order'
        ? [(x.choiceRight || []).length ? L[((x.choiceRight[0] || 1) % Math.max(2, (x.choices || []).length))] : 'Z']
        : kind === 'cells' ? [call('cellsOf_(__x).filter(c => c.ways).map(c => ' + JSON.stringify(WRONG) + ').join(", ")')] : [WRONG];
      /* PEEL marks an essay by its levels: its model is a band descriptor, not an essay, so it is the tutor's to mark */
      if (!right && call('markIsPeel_(__x.accept)') && plain(r.answer)) return ['tutor', ''];
      wrongOk = wrongs.every(a => verdict(x, a).verdict !== 'right');
    }
    if (!right && process.env.VQ_DEBUG) console.log('FAIL', r.row_id, kind, JSON.stringify(models(r)).slice(0, 300), '| choices', S(r.choices).slice(0, 80), S(r.choice_right), '| cells', S(r.cells).slice(0, 120));
    if (!right && (kind === 'choice' || kind === 'order') && !S(r.choice_right)) return ['broken', 'options with no key'];
    if (!right) return ['broken', 'key fails its own model answer (' + kind + ')'];
    if (!wrongOk) return ['broken', 'key accepts a wrong answer (' + kind + ')'];
    return ['ok', ''];
  };
  /* each active question: its kept verdict while its hash stands, else marked now */
  const fresh = {}, rechecked = [];
  for (const r of rows) {
    if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
    const k = S(r.paper_id) + '#' + S(r.question);
    const h = sha(JSON.stringify([r, stemFig.has(k), stemSvg.get(k) || '']));
    let got = kept[h] || fresh[h];
    if (!got) { got = judge(r); rechecked.push(r.row_id); }
    fresh[h] = got;
    add(r, got[0], got[1]);
  }
  const ids = Object.keys(status).sort();
  const file = { say: 'Generated by tools/validate-questions.js — do not edit. ok: marked by the site; tutor: level-marked, marked by your tutor; broken: not offered to students.', status: {} };
  ids.forEach(id => { file.status[id] = status[id]; });
  fs.writeFileSync(OUTF, JSON.stringify(file));
  /* the names this run loaded or found missing, with the last run's while its code stands */
  const strays = [...app.asked].filter(n => !VERDICT_FROM.includes(n));
  if (strays.length) throw new Error('validate-questions: the tool now calls ' + strays.join(', ') + ': add it to VERDICT_FROM, or its code is not in the cache\'s hash');
  const names = verdictNames(app, new Set([...(codeWas ? was.names : []), ...app.loaded, ...app.missing]));
  try {
    fs.mkdirSync(path.dirname(CACHEF), { recursive: true });
    fs.writeFileSync(CACHEF, JSON.stringify({ v: 1, code: codeHash(app, names, opts.salt), names, rows: fresh }));
  } catch (e) { log('validate-questions: cache not written (' + e.message + ')'); }
  const n = { ok: 0, tutor: 0, broken: 0 };
  ids.forEach(id => n[status[id]]++);
  log('validate-questions: ' + ids.length + ' questions — ' + n.ok + ' markable, ' + n.tutor + ' marked by tutor, ' + n.broken + ' broken; ' + rechecked.length + ' marked afresh'
    + (codeWas ? '' : was ? ', the code changed' : ', no cache') + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
  Object.keys(tally).sort().forEach(s => { const t = tally[s]; log('  ' + s.padEnd(30) + ' ok ' + String(t.ok).padStart(5) + '  tutor ' + String(t.tutor).padStart(5) + '  broken ' + String(t.broken).padStart(5)); });
  log('  broken because:');
  Object.entries(why).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log('    ' + String(v).padStart(6) + '  ' + k));
  if (process.argv.includes('--papers')) Object.keys(tally).sort().forEach(s => Object.entries(tally[s].papers).forEach(([p, t]) => log(s + '\t' + p + '\t' + t.ok + '\t' + t.tutor + '\t' + t.broken)));
  return { status, tally, why, rechecked, full: !codeWas };
}
module.exports = { run, appCode, rowsOf, verdictNames };
if (require.main === module) run();
