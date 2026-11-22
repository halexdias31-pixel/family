#!/usr/bin/env node
/* @family. — tools/one-paper-fact.js THE ONE-PAPER-FACT CHECK (rule 1.75, owner 21 Nov): a question says its paper's facts (name, year, tier,
   spec code …) once, on the paper's own row, so a child never sees a question disagree with its paper by a copy left behind.
   Counted site-wide over data/questions.json: a question row that keeps a kinds.json `sheet.lib.joined` field byte-identical to its paper's
   (kind document, same paper_id), or a source_id equal to its paper_id (read as `source_id || paper_id`), fails; so does a backend join list
   (backend/cards-gen.gs LIB_FILES) or a client one (js/kinds.js) that is not kinds.json's. tools/content.js import strips them (L.stripPaper). */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, main } = require('./lib/gen.js');

const want = j => JSON.stringify({ from: j.from, by: j.by, fields: j.fields });
function lists() {
  const kinds = SD.json('data/settings/kinds.json');
  const src = want(kinds.kinds.question.sheet.lib.joined);
  const ctx = file => { const c = vm.createContext({}); vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/^const (\w+) =/gm, 'this.$1 ='), c); return c; };
  const back = /^const LIB_FILES = (.*);$/m.exec(fs.readFileSync(path.join(ROOT, 'backend/cards-gen.gs'), 'utf8'));
  const site = ctx('js/kinds.js').ITEM_KINDS;
  return { src, back: back ? want(JSON.parse(back[1]).questions.joined || {}) : 'none',
    site: site ? want(((site.kinds.question || {}).sheet || {}).lib.joined || {}) : 'none', join: kinds.kinds.question.sheet.lib.joined };
}
function find() {
  const L = lists(), J = L.join;
  const rows = SD.questions();
  const card = new Map();
  rows.forEach(r => { if (r && r.kind === J.from) card.set(r[J.by], r); });
  const copies = {}, eg = [];
  let n = 0, own = 0;
  rows.forEach(r => {
    if (!r) return;
    if (r.source_id !== undefined && r.source_id === r.paper_id) { own++; if (eg.length < 10) eg.push(r.row_id + ' source_id = its paper_id'); }
    const c = r.kind !== J.from && card.get(r[J.by]);
    if (!c) return;
    n++;
    J.fields.forEach(f => {
      if (r[f] === undefined || r[f] === null || r[f] !== c[f]) return;
      copies[f] = (copies[f] || 0) + 1;
      if (eg.length < 10) eg.push(r.row_id + ' ' + f + ' = its paper\'s');
    });
  });
  const lists_ = [];
  if (L.back !== L.src) lists_.push('backend/cards-gen.gs LIB_FILES.questions.joined is not kinds.json\'s (run node tools/cards-gen.js)');
  if (L.site !== L.src) lists_.push('js/kinds.js question joined is not kinds.json\'s (run node tools/kinds.js)');
  return { n, fields: J.fields.length, copies, own, eg, lists: lists_ };
}
function run() {
  const r = find(), total = Object.values(r.copies).reduce((a, b) => a + b, 0) + r.own;
  console.log('one-paper-fact: ' + r.n + ' rows joined to their paper by ' + r.fields + ' fields, ' + total + ' copied fact(s)'
    + (r.lists.length ? ', ' + r.lists.length + ' join list(s) out of step' : ', one join list'));
  Object.keys(r.copies).forEach(f => console.log('  ' + f + ': ' + r.copies[f]));
  if (r.own) console.log('  source_id equal to paper_id: ' + r.own);
  r.eg.forEach(x => console.log('  e.g. ' + x));
  r.lists.forEach(x => console.log('  ' + x));
  if (total || r.lists.length) throw new Error('one-paper-fact: ' + total + ' question copy(ies) of a paper fact, ' + r.lists.length
    + ' join list(s) out of step; a question keeps a joined field only where it differs (tools/content.js import strips the rest)');
}
module.exports = { run, find };
main(module, run);
