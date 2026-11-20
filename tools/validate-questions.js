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
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'question-status.json');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
const S = v => String(v == null ? '' : v).trim();

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
  const ctx = vm.createContext({ console: { log() {}, warn() {}, error() {} }, DATA });
  const loaded = new Set();
  const retry = run => {
    for (let i = 0; i < 400; i++) {
      try { return run(); } catch (e) {
        const m = /^(\w+) is not defined/.exec(e && e.message);
        if (!m) throw e;
        if (!need(m[1])) vm.runInContext('var ' + m[1] + ' = undefined', ctx);
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
  return { ctx, call: expr => retry(() => vm.runInContext(expr, ctx)) };
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
  if (S(r.choice_right)) out.push(S(r.choice_right).split('|')[0].split(',').map(n => L[+n - 1] || '?').join(', '));
  /* and the options' own words, as a child types them where the options are letters already (find-marking.js choiceList_) */
  if (S(r.choice_right) && S(r.choices)) { const o = S(r.choices).split('|').map(c => c.replace(/<[^>]*>/g, '').trim());
    out.push(S(r.choice_right).split('|')[0].split(',').map(n => o[+n - 1] || '?').join(', ')); }
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

function run() {
  const t0 = Date.now();
  /* WITHOUT THE PRIVATE HALF (a CI checkout) every answer is missing: the file already written stands */
  if (!fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'))) { console.log('validate-questions: no data-private/questions.json here, data/question-status.json left as it is'); return null; }
  const rows = rowsOf();
  const { ctx, call } = appCode();
  call('qtMarker_(workRow_({row:{}}))');
  /* names the app reaches only behind a `typeof` (drawFig_'s padGrid_) or inside a try that swallows the miss (cardBlock_'s CARD_BLOCKS,
     cardDraw_ for a made-up surface): neither throws here, so they are loaded up front, as the page has them */
  call('padGrid_'); call('CARD_BLOCKS');
  call('cardDraw_({ el: "svg", a: { viewBox: "0 0 1 1" }, kids: [{ el: "line", a: { x1: 1 } }, { el: "text", a: { x: 1 }, text: "1" }] })');
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
  for (const r of rows) {
    if (r.kind !== 'question' || !(r.active === true || /^true$/i.test(S(r.active)))) continue;
    /* words still only in the Ledger (`lib_has`, 397): the site fetches them later, but nothing here can see or check them */
    /* ONLY IN THE LEDGER: not hidden for that alone (owner's call, 17 Nov) -- kept when the Ledger says it holds a key, so a question that works is never hidden for being unchecked here. */
    if (!plain(r.html) && !plain(r.lead) && !S(r.diagram) && !S(r.choices)) {
      if (/\b(accept|cells|draw_answer|choice_right|mark_words|order_ends)\b/.test(S(r.lib_has))) { add(r, 'ok', 'words and key only in the Ledger (not checked here)'); continue; }
      /* AND ONE WHOSE LEDGER HOLDS AN ANSWER BUT NO KEY: the tutor's, as below (owner, 18 Nov). */
      if (/\banswer\b/.test(S(r.lib_has)) && /\bhtml\b/.test(S(r.lib_has))) { add(r, 'tutor', 'answer only in the Ledger, no key yet'); continue; }
      add(r, 'broken', S(r.lib_has) ? 'words only in the Ledger, no key listed' : 'no question text'); continue; }
    const fig = figureMissing(r, stemFig.has(S(r.paper_id) + '#' + S(r.question)));
    if (fig) { add(r, 'broken', fig); continue; }
    ctx.__r = r;
    const x = call('__x = libQuestion_(__r)');
    const kind = call('markerOf_(libQuestion_(__r)).kind');
    if (kind === 'save') {
      const marks = Number(r.marks) || 0;
      /* AN ANSWER WITH NO KEY IS THE TUTOR'S TO MARK, NOT HIDDEN (owner, 18 Nov: a part vanished mid-question on Finley's
         Waves worksheet). The child answers, sees the scheme's answer, and the tutor marks it; a key makes it the site's later. */
      if (plain(r.answer)) add(r, 'tutor', marks >= 6 || LEVELS.test(S(r.answer)) || /essay/i.test(S(r.answer_type)) ? '' : 'no mechanical key yet');
      else add(r, 'broken', 'no key and no answer');
      continue;
    }
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
      if (!ex.length) { add(r, 'broken', 'drawing key has no example drawing'); continue; }
    } else {
      /* a table's blanks are typed one per cell: the key's own first way in each */
      const cellModel = kind === 'cells' ? [call('cellsOf_(__x).map(c => c.ways ? c.ways.split("|")[0].trim() : "")')] : [];
      right = cellModel.concat(models(r)).some(a => verdict(x, a).verdict === 'right');
      const wrongs = kind === 'choice' || kind === 'order'
        ? [(x.choiceRight || []).length ? L[((x.choiceRight[0] || 1) % Math.max(2, (x.choices || []).length))] : 'Z']
        : kind === 'cells' ? [call('cellsOf_(__x).map(c => c.ways ? ' + JSON.stringify(WRONG) + ' : "")')] : [WRONG];
      /* PEEL marks an essay by its levels: its model is a band descriptor, not an essay, so it is the tutor's to mark */
      if (!right && call('markIsPeel_(__x.accept)') && plain(r.answer)) { add(r, 'tutor'); continue; }
      wrongOk = wrongs.every(a => verdict(x, a).verdict !== 'right');
    }
    if (!right && process.env.VQ_DEBUG) console.log('FAIL', r.row_id, kind, JSON.stringify(models(r)).slice(0, 300), '| choices', S(r.choices).slice(0, 80), S(r.choice_right), '| cells', S(r.cells).slice(0, 120));
    if (!right && (kind === 'choice' || kind === 'order') && !S(r.choice_right)) add(r, 'broken', 'options with no key');
    else if (!right) add(r, 'broken', 'key fails its own model answer (' + kind + ')');
    else if (!wrongOk) add(r, 'broken', 'key accepts a wrong answer (' + kind + ')');
    else add(r, 'ok');
  }
  const ids = Object.keys(status).sort();
  const file = { say: 'Generated by tools/validate-questions.js — do not edit. ok: marked by the site; tutor: level-marked, marked by your tutor; broken: not offered to students.', status: {} };
  ids.forEach(id => { file.status[id] = status[id]; });
  fs.writeFileSync(OUT, JSON.stringify(file));
  const n = { ok: 0, tutor: 0, broken: 0 };
  ids.forEach(id => n[status[id]]++);
  console.log('validate-questions: ' + ids.length + ' questions — ' + n.ok + ' markable, ' + n.tutor + ' marked by tutor, ' + n.broken + ' broken (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
  Object.keys(tally).sort().forEach(s => { const t = tally[s]; console.log('  ' + s.padEnd(30) + ' ok ' + String(t.ok).padStart(5) + '  tutor ' + String(t.tutor).padStart(5) + '  broken ' + String(t.broken).padStart(5)); });
  console.log('  broken because:');
  Object.entries(why).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('    ' + String(v).padStart(6) + '  ' + k));
  if (process.argv.includes('--papers')) Object.keys(tally).sort().forEach(s => Object.entries(tally[s].papers).forEach(([p, t]) => console.log(s + '\t' + p + '\t' + t.ok + '\t' + t.tutor + '\t' + t.broken)));
  return { status, tally, why };
}
module.exports = { run, appCode, rowsOf };
if (require.main === module) run();
