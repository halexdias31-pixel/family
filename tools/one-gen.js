#!/usr/bin/env node
/* @family. — tools/one-gen.js THE GENERATED-QUESTION CHECK (rule 1.75; owner queue item 6; owner 25 Nov: first-class @family questions). A
   child given a made-up maths question must get one that reads whole (no NaN, no undefined, no blank), is marked right when they type the right
   answer and wrong when they slip, sits under a real curriculum topic, and is the same question every time. Counted over every template of
   data/settings/qgen.json bound to each node a country file maps to it (data/settings/curriculum/<country>/<subject>.json `templates`, tools/lib/qgen.js):
     - every template has a unique id and no hand version (its version is the fingerprint), an answer_type and marks as data/questions.json
       has them, and is mapped by some country; each node it is bound to is a sub-topic, taught at one of the country's `gen.level` levels where it names any;
     - 200 seeds each: text, key and typed forms whole; the id makes the same question again; at least half the questions different;
     - every typed form marked right and the near miss marked wrong by the site's own marker (js/find-marking.js markAnswer_, in a vm);
     - THE FINGERPRINT: the same template and node give the same questions; an edit to either gives other ids; a revert the same ids again;
     - data/questions.json's live generated rows are exactly emit()'s (tools/gen-questions.js, never by hand), and where this machine has the
       words, each one's words are emit()'s;
     - nothing the site loads (js/, index.html) reads qgen.json: children get the questions through the one question file, like any other.
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `one-curriculum`. */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, main } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const QG = require('./lib/qgen.js');
const CU = require('./lib/curriculum.js');
const VQ = require('./validate-questions.js');
const L = require('./lib/lib-full.js');

const SEEDS = 200;
const BAD_TEXT = /NaN|undefined|null|Infinity|\[object|\{|\}/;

let app = null;
function marker() {
  if (!app) app = VQ.appCode();
  return (typed, key) => { app.ctx.__t = typed; app.ctx.__k = key; try { return app.call('markAnswer_(__t, __k)') === true; } catch (e) { return false; } };
}

/* WHAT THE SITE LOADS: index.html and js/. */
function siteText() {
  const dir = path.join(ROOT, 'js');
  return fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') + fs.readdirSync(dir).filter(f => /\.js$/.test(f)).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}

function problems(d) {
  const bad = [], seen = new Set(), mark = marker(), out = [];
  const types = new Set(d.types), B = QG.bindings(d.gen, d.entries), used = new Set(B.map(x => x.t && x.t.id));
  d.gen.templates.forEach(t => {
    const name = t.id || '?', say = s => bad.push(name + ': ' + s);
    if (!t.id) say('no id');
    if ('v' in t) say('a hand version "v": the version is the fingerprint (tools/lib/qgen.js), never written');
    if (seen.has(name)) say('twice'); seen.add(name);
    if (!types.has(t.answer_type)) say('answer_type "' + t.answer_type + '" is none data/questions.json uses');
    if (!(Number(t.marks) >= 1)) say('no marks');
    if (!used.has(t.id)) say('no country file maps a node to it (`templates`), so it makes no question');
  });
  B.forEach(({ e, node, t: t0, b: t }) => {
    if (!t) return;
    const name = t0.id + ' @ ' + e.country, say = s => bad.push(name + ': ' + s), X = CU.index(e.T), lv = QG.cfg(e).levels;
    const n = X.by[node];
    if (!n) return say('bound to "' + node + '", no node of ' + e.file);
    if (X.kids[node]) say(node + ' is a topic, not a sub-topic');
    if (lv.length && !lv.some(l => (n.levels || []).includes(l))) say(node + ' is not taught at ' + lv.join(' or '));
    const ids = new Set();
    let fails = 0, firstQ = null;
    for (let s = 0; s < SEEDS && fails < 3; s++) {
      let q;
      try { q = QG.generate(t, s, e.T); } catch (e) { say('seed ' + s + ': ' + e.message); fails++; continue; }
      firstQ = firstQ || q;
      ids.add(q.id);
      const words = [q.text, q.key].concat(q.typed, q.wrong == null ? [] : [q.wrong]);
      if (words.some(w => !String(w).trim() || BAD_TEXT.test(w))) { say(q.id + ' reads "' + q.text + '" / key "' + q.key + '"'); fails++; continue; }
      if (!q.typed.length || q.wrong == null) { say('no typed answer or near miss'); fails++; continue; }
      let again; try { again = QG.fromId(q.id, d.gen, d.entries); } catch (e) { again = null; }
      if (!again || again.text !== q.text || again.key !== q.key) { say(q.id + ': the id does not make the same question again'); fails++; continue; }
      q.typed.forEach(ty => { if (!mark(ty, q.key)) { say(q.id + ' "' + q.text + '": "' + ty + '" marked wrong against key "' + q.key + '"'); fails++; } });
      if (mark(q.wrong, q.key)) { say(q.id + ' "' + q.text + '": the near miss "' + q.wrong + '" marked right against key "' + q.key + '"'); fails++; }
    }
    if (ids.size < SEEDS / 2) say('only ' + ids.size + ' different questions in ' + SEEDS + ' seeds');
    out.push({ name, node: n.name, distinct: ids.size, sample: firstQ });
  });
  if (/qgen/.test(d.site)) bad.push('the site (js/ or index.html) reads qgen.json: a child gets generated questions through data/questions.json only');
  fingerprint(d, bad);
  /* THE ROWS AND WORDS ARE emit()'s, written by tools/gen-questions.js. */
  let e = null; try { e = QG.emit(d.gen, d.entries); } catch (x) { bad.push('emit: ' + x.message); }
  if (e) {
    const live = d.rows.filter(r => String(r.paper_id || '').startsWith(QG.SET_PREFIX) && r.active !== 'False');
    const want = new Map(e.rows.map(r => [r.row_id, JSON.stringify(r)])), have = new Map(live.map(r => [r.row_id, JSON.stringify(r)]));
    let off = 0;
    want.forEach((v, k) => { if (have.get(k) !== v && off++ < 5) bad.push(k + ': data/questions.json ' + (have.has(k) ? 'has it otherwise than' : 'lacks it, though') + ' tools/lib/qgen.js emit() makes it — run node tools/gen-questions.js'); });
    have.forEach((v, k) => { if (!want.has(k) && off++ < 5) bad.push(k + ': a live generated row emit() does not make — run node tools/gen-questions.js'); });
    if (d.words) Object.keys(e.words).forEach(k => { if (JSON.stringify(d.words[k]) !== JSON.stringify(e.words[k]) && off++ < 5) bad.push(k + ': its words are not emit()\'s — run node tools/gen-questions.js'); });
    d.emitted = e;
  }
  d.out = out;
  return bad;
}

/* THE FINGERPRINT, on the first bound template: same input, same ids; the template edited, other ids; its node edited, other ids; reverted, the same. */
function fingerprint(d, bad) {
  const x0 = QG.bindings(d.gen, d.entries).find(x => x.b); if (!x0) return;
  const t0 = x0.b, D0 = x0.e.T;
  const fx = d.fx || QG.fixed, clone = x => JSON.parse(JSON.stringify(x));
  const ids = (t, D) => { try { return fx(t, D).map(q => q.id).join(' '); } catch (e) { return 'error ' + e.message; } };
  const base = ids(clone(t0), clone(D0)), again = ids(clone(t0), clone(D0));
  if (base !== again) bad.push('fingerprint: the same template and node gave different questions');
  const te = clone(t0); te.text = te.text + ' '; 
  if (ids(te, clone(D0)) === base) bad.push('fingerprint: an edit to template ' + t0.id + ' left its questions the same');
  const De = clone(D0), n = De.nodes.find(x => x.id === t0._node); if (n) n.name = n.name + ' (edited)';
  if (ids(clone(t0), De) === base) bad.push('fingerprint: an edit to node ' + t0._node + ' left ' + t0.id + '\'s questions the same');
  if (ids(clone(t0), clone(D0)) !== base) bad.push('fingerprint: template ' + t0.id + ' reverted did not give its questions back');
}

function data() {
  const types = new Set();
  const rows = SD.json('data/questions.json');
  rows.forEach(r => { if (r.answer_type) types.add(r.answer_type); });
  let words = null; if (!L.ABSENT) try { words = L.readPrivate('questions'); } catch (e) { words = null; }
  return { gen: SD.json(QG.TABLE), entries: CU.entries(), types: [...types], site: siteText(), rows, words };
}

const tpl = (d, id) => d.gen.templates.find(t => t.id === id);
const uk = d => d.entries.find(e => e.T.templates);
/* MOVE a skill to another node of the first country file that maps skills. */
const remap = (d, id, node) => { const M = uk(d).T.templates; Object.keys(M).forEach(k => { M[k] = M[k].filter(x => x !== id); if (!M[k].length) delete M[k]; }); (M[node] = M[node] || []).push(id); };
const BREAKS = [
  { name: 'a NaN in the answer', d: d => { tpl(d, 'frac-amount').let.ans = 'n * k / 0 * 0'; } },
  { name: 'an undefined in the text', d: d => { tpl(d, 'hcf').text = 'Find the HCF of {a} and {b}. {g > 99 ? g : undefined}'; } },
  { name: 'a node that is none', d: d => { remap(d, 'expand', 'dfe.ma.a.expr.nothing'); } },
  { name: 'a topic, not a sub-topic', d: d => { remap(d, 'expand', uk(d).T.nodes.find(n => n.id === 'dfe.ma.a.expr.expand').parent); } },
  { name: 'a node at no generated level', d: d => { remap(d, 'expand', 'dfe.ma.n.place.roman'); } },
  { name: 'a template no country maps', d: d => { const M = uk(d).T.templates; Object.keys(M).forEach(k => { M[k] = M[k].filter(x => x !== 'expand'); if (!M[k].length) delete M[k]; }); } },
  { name: 'a new answer type', d: d => { tpl(d, 'lcm').answer_type = 'generated'; } },
  { name: 'the same question every seed', d: d => { const t = tpl(d, 'area-rect'); t.vars = { w: [3, 3], h: [5, 5] }; t.where = []; } },
  { name: 'a key the marker rejects', d: d => { tpl(d, 'linear-eq').key = 'x = {x + 2}'; } },
  { name: 'a near miss marked right', d: d => { tpl(d, 'pct-amount').wrong = '{ans}'; } },
  { name: 'a blank question', d: d => { tpl(d, 'stdform').text = ' '; } },
  { name: 'an id twice', d: d => { d.gen.templates.push(JSON.parse(JSON.stringify(tpl(d, 'hcf')))); } },
  { name: 'a hand version', d: d => { tpl(d, 'hcf').v = 2; } },
  { name: 'a fingerprint blind to the node', d: d => { d.fx = t => QG.fixed(t); } },
  { name: 'a draw that is not the same each time', d: d => { let k = 0; d.fx = (t, D) => QG.fixed(t, D).slice(k++ % 2); } },
  { name: 'a fingerprint blind to the template', d: d => { const keep = {}; d.fx = (t, D) => { const v = keep[t.id] = keep[t.id] || QG.fixed(t, D); return v; }; } },
  { name: 'a generated row edited by hand', d: d => { const r = d.rows.find(x => String(x.paper_id).startsWith(QG.SET_PREFIX) && x.kind === 'question'); r.dfe = 'dfe.ma.n.place.roman'; } },
  { name: 'a generated row missing', d: d => { const i = d.rows.findIndex(x => String(x.paper_id).startsWith(QG.SET_PREFIX) && x.kind === 'question'); d.rows.splice(i, 1); } },
  { name: 'the site reading qgen', d: d => { d.site += '\nfetch("data/settings/qgen.json")'; } },
];

function run() {
  const d = data(), bad = problems(d);
  const fq = d.emitted ? d.emitted.rows.filter(r => r.kind === 'question').length : 0;
  if (process.argv.indexOf('--prove') > 0) {
    if (bad.length) throw new Error('one-gen --prove: the unbroken site already fails (' + bad[0] + ')');
    const missed = [];
    BREAKS.forEach(b => { const x = data(); b.d(x); if (!problems(x).length) missed.push(b.name); });
    if (missed.length) throw new Error('one-gen --prove: missed ' + missed.join(', '));
    console.log('one-gen --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  if (bad.length) { console.error('one-gen: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('one-gen check failed'); }
  console.log('one-gen: ' + fq + ' generated questions in data/questions.json as emit() makes them, fingerprinted (same in, same out; edit, new ids; revert, the same); '
    + d.out.length + ' templates x ' + SEEDS + ' seeds, each whole, its id making it again, marked right as typed and its near miss wrong: '
    + d.out.map(o => o.name + ' (' + o.node + ', ' + o.distinct + ' different)').join('; '));
}

main(module, run);
module.exports = { problems, run };
