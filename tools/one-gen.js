#!/usr/bin/env node
/* @family. — tools/one-gen.js THE GENERATED-QUESTION CHECK (rule 1.75; owner queue item 6, first slice). A child given a made-up maths
   question must get one that reads whole (no NaN, no undefined, no blank), is marked right when they type the right answer and wrong when
   they slip, and sits under a real DfE topic. Counted over every template of data/settings/qgen.json (tools/lib/qgen.js):
     - every template has an id, a whole-number version, ids unique by version, an answer_type and marks as data/questions.json has them, and
       cites a DfE sub-topic of data/settings/dfe-maths.json taught at GCSE Foundation;
     - 200 seeds each: text, key and typed forms whole; the id makes the same question again; at least half the questions different;
     - every typed form marked right and the near miss marked wrong by the site's own marker (js/find-marking.js markAnswer_, in a vm);
     - nothing the site loads (js/, index.html) reads qgen.json yet: this slice is invisible to children.
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `one-dfe`. */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, main } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const QG = require('./lib/qgen.js');
const DF = require('./lib/dfe.js');
const VQ = require('./validate-questions.js');

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
  const bad = [], seen = new Set(), X = DF.index(d.dfe), mark = marker(), out = [];
  const types = new Set(d.types);
  d.gen.templates.forEach(t => {
    const name = (t.id || '?') + '.v' + t.v, say = s => bad.push(name + ': ' + s);
    if (!t.id || !Number.isInteger(t.v) || t.v < 1) say('no id or whole-number version');
    if (seen.has(name)) say('twice'); seen.add(name);
    if (!types.has(t.answer_type)) say('answer_type "' + t.answer_type + '" is none data/questions.json uses');
    if (!(Number(t.marks) >= 1)) say('no marks');
    const n = X.by[t.dfe];
    if (!n) return say('cites "' + t.dfe + '", no DfE node');
    if (X.kids[t.dfe]) say(t.dfe + ' is a topic, not a sub-topic');
    if (!(n.levels || []).includes('GCSE Foundation')) say(t.dfe + ' is not taught at GCSE Foundation');
    const ids = new Set();
    let fails = 0, firstQ = null;
    for (let s = 0; s < SEEDS && fails < 3; s++) {
      let q;
      try { q = QG.generate(t, s); } catch (e) { say('seed ' + s + ': ' + e.message); fails++; continue; }
      firstQ = firstQ || q;
      ids.add(q.id);
      const words = [q.text, q.key].concat(q.typed, q.wrong == null ? [] : [q.wrong]);
      if (words.some(w => !String(w).trim() || BAD_TEXT.test(w))) { say(q.id + ' reads "' + q.text + '" / key "' + q.key + '"'); fails++; continue; }
      if (!q.typed.length || q.wrong == null) { say('no typed answer or near miss'); fails++; continue; }
      let again; try { again = QG.fromId(q.id, d.gen); } catch (e) { again = null; }
      if (!again || again.text !== q.text || again.key !== q.key) { say(q.id + ': the id does not make the same question again'); fails++; continue; }
      q.typed.forEach(ty => { if (!mark(ty, q.key)) { say(q.id + ' "' + q.text + '": "' + ty + '" marked wrong against key "' + q.key + '"'); fails++; } });
      if (mark(q.wrong, q.key)) { say(q.id + ' "' + q.text + '": the near miss "' + q.wrong + '" marked right against key "' + q.key + '"'); fails++; }
    }
    if (ids.size < SEEDS / 2) say('only ' + ids.size + ' different questions in ' + SEEDS + ' seeds');
    out.push({ name, dfe: t.dfe, node: n.name, distinct: ids.size, sample: firstQ });
  });
  if (/qgen/.test(d.site)) bad.push('the site (js/ or index.html) reads qgen already: this slice must stay invisible');
  d.out = out;
  return bad;
}

function data() {
  const types = new Set();
  SD.json('data/questions.json').forEach(r => { if (r.answer_type) types.add(r.answer_type); });
  return { gen: SD.json(QG.TABLE), dfe: SD.json(DF.TABLE), types: [...types], site: siteText() };
}

const tpl = (d, id) => d.gen.templates.find(t => t.id === id);
const BREAKS = [
  { name: 'a NaN in the answer', d: d => { tpl(d, 'frac-amount').let.ans = 'n * k / 0 * 0'; } },
  { name: 'an undefined in the text', d: d => { tpl(d, 'hcf').text = 'Find the HCF of {a} and {b}. {g > 99 ? g : undefined}'; } },
  { name: 'a node that is none', d: d => { tpl(d, 'expand').dfe = 'dfe.ma.a.expr.nothing'; } },
  { name: 'a topic, not a sub-topic', d: d => { tpl(d, 'expand').dfe = d.dfe.nodes.find(n => n.id === 'dfe.ma.a.expr.expand').parent; } },
  { name: 'a node with no GCSE Foundation', d: d => { tpl(d, 'expand').dfe = 'dfe.ma.n.place.roman'; } },
  { name: 'a new answer type', d: d => { tpl(d, 'lcm').answer_type = 'generated'; } },
  { name: 'the same question every seed', d: d => { const t = tpl(d, 'area-rect'); t.vars = { w: [3, 3], h: [5, 5] }; t.where = []; } },
  { name: 'a key the marker rejects', d: d => { tpl(d, 'linear-eq').key = 'x = {x + 2}'; } },
  { name: 'a near miss marked right', d: d => { tpl(d, 'pct-amount').wrong = '{ans}'; } },
  { name: 'a blank question', d: d => { tpl(d, 'stdform').text = ' '; } },
  { name: 'a version twice', d: d => { d.gen.templates.push(JSON.parse(JSON.stringify(tpl(d, 'hcf')))); } },
  { name: 'the site reading qgen', d: d => { d.site += '\nfetch("data/settings/qgen.json")'; } },
];

function run() {
  const d = data(), bad = problems(d);
  if (process.argv.indexOf('--prove') > 0) {
    if (bad.length) throw new Error('one-gen --prove: the unbroken site already fails (' + bad[0] + ')');
    const missed = [];
    BREAKS.forEach(b => { const x = data(); b.d(x); if (!problems(x).length) missed.push(b.name); });
    if (missed.length) throw new Error('one-gen --prove: missed ' + missed.join(', '));
    console.log('one-gen --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  if (bad.length) { console.error('one-gen: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('one-gen check failed'); }
  console.log('one-gen: ' + d.out.length + ' templates x ' + SEEDS + ' seeds, each whole, its id making it again, marked right as typed and its near miss wrong: '
    + d.out.map(o => o.name + ' (' + o.node + ', ' + o.distinct + ' different)').join('; '));
}

main(module, run);
module.exports = { problems, run };
