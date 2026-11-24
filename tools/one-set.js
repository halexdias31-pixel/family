#!/usr/bin/env node
/* @family. — tools/one-set.js THE ONE-SET CHECK (rule 1.75, owner 23 Nov: UNIFY THE LIBRARY AND PRACTICE, item 3, ONE QUESTION SET):
   exam papers, worksheets, First Class Maths exercises, Corbettmaths topics and 5-a-days, Access Tuition sets and SATs papers are one
   kind, a set (tools/lib/sets.js): counted site-wide over data/questions.json, the set kinds are exactly 1 (every set row's
   document_type is SET_KIND), every question and preamble belongs to exactly one set (its paper_id names one set row), no question
   carries a kind word of its own, every content.json family card says SET_KIND, and no site, backend or tool code tests a set's kind
   word (a set is told apart by its tags: board, source, year, paper). Each break is then made in memory and must fail it (proved by mutation, every run).
   Run by tools/build.js. Converted at the source by node tools/content.js sets --apply. */
'use strict';
const fs = require('fs'), path = require('path');
const SD = require('./lib/site-data.js');
const SETS = require('./lib/sets.js');
const { ROOT, S, main } = require('./lib/gen.js');

/* A KIND TEST IN CODE: document_type (or documentType) compared to, or matched against, a word. */
const KIND_TEST = /(document_?[tT]ype[^;\n]{0,40}(===|!==|==|!=)\s*['"]|\/[^/\n]*\/[a-z]*\.test\([^)\n]*document_?[tT]ype)/;
const CODE_DIRS = ['js', 'backend', 'tools', 'tools/lib'];
const SKIP = new Set(['js/kinds.js', 'js/finder-tags.js', 'tools/one-set.js']);

function codeFiles() {
  const out = [];
  CODE_DIRS.forEach(d => fs.readdirSync(path.join(ROOT, d)).filter(f => /\.(js|gs)$/.test(f)).forEach(f => {
    const rel = d + '/' + f;
    if (!SKIP.has(rel)) out.push({ rel, text: fs.readFileSync(path.join(ROOT, rel), 'utf8') });
  }));
  return out;
}

function find(rows, families, code) {
  const m = SETS.measure(rows);
  const bad = [];
  if (m.kinds.length !== 1 || m.kinds[0] !== SETS.SET_KIND) bad.push('set kinds are ' + m.kinds.length + ' (' + m.kinds.join(' / ') + '), not 1 (' + SETS.SET_KIND + ')');
  if (m.twice.length) bad.push(m.twice.length + ' set(s) with two set rows: ' + m.twice.slice(0, 5).join(', '));
  if (m.orphans.length) bad.push(m.orphans.length + ' question row(s) in no set: ' + m.orphans.slice(0, 5).join(', '));
  if (m.wearing.length) bad.push(m.wearing.length + ' question row(s) wearing a set kind of their own: ' + m.wearing.slice(0, 5).join(', '));
  const fam = families.filter(f => f.card && f.card.document_type !== undefined && f.card.document_type !== SETS.SET_KIND);
  if (fam.length) bad.push(fam.length + ' content.json family card(s) naming another kind: ' + fam.slice(0, 5).map(f => f.family + ' ' + f.card.document_type).join(', '));
  const tests = [];
  code.forEach(c => c.text.split('\n').forEach((l, i) => { if (KIND_TEST.test(l)) tests.push(c.rel + ':' + (i + 1)); }));
  if (tests.length) bad.push(tests.length + ' kind test(s) in code (tell a set by its tags): ' + tests.slice(0, 5).join(', '));
  return { m, bad };
}

const families = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'content.json'), 'utf8')).families || [];

function run() {
  const rows = SD.questions(), fams = families(), code = codeFiles();
  const { m, bad } = find(rows, fams, code);
  const q = rows.filter(r => !SETS.isSet(r)).length;
  console.log('one-set: ' + m.kinds.length + ' set kind (' + m.kinds.join(' / ') + '), ' + m.sets + ' sets, ' + (q - m.orphans.length) + '/' + q + ' question rows in exactly one set');
  bad.forEach(b => console.log('  ' + b));
  prove(rows, fams, code);
  if (bad.length) throw new Error('one-set: ' + bad.length + ' fault(s); convert at the source: node tools/content.js sets --apply');
}

/* PROVED BY MUTATION: each break, made in memory, must fail the check. */
function prove(rows, fams, code) {
  const clone = () => rows.map(r => Object.assign({}, r));
  const firstQ = rs => rs.find(r => !SETS.isSet(r));
  const breaks = {
    'a second set kind': () => { const r = clone(); r.find(SETS.isSet).document_type = 'Worksheet'; return [r, fams, code]; },
    'a question in no set': () => { const r = clone(); firstQ(r).paper_id = 'P-NO-SUCH-SET'; return [r, fams, code]; },
    'a set row twice': () => { const r = clone(); r.push(Object.assign({}, r.find(SETS.isSet))); return [r, fams, code]; },
    'a question wearing a kind': () => { const r = clone(); firstQ(r).document_type = 'Past paper'; return [r, fams, code]; },
    'a family card of another kind': () => [rows, fams.concat([{ family: 'P-ZZ-', card: { document_type: 'Past paper' } }]), code],
    'a kind test in code': () => [rows, fams, code.concat([{ rel: 'js/zz.js', text: "if (String(r.document_type || '') !== 'Past paper') return;" }])],
  };
  const missed = Object.keys(breaks).filter(k => !find(...breaks[k]()).bad.length);
  console.log('one-set proved: ' + (Object.keys(breaks).length - missed.length) + '/' + Object.keys(breaks).length + ' breaks caught');
  if (missed.length) throw new Error('one-set proved: not caught: ' + missed.join(', '));
}
module.exports = { run, find };
main(module, run);
