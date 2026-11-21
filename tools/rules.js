#!/usr/bin/env node
/* @family. — tools/rules.js: writes docs/rules.md from data/settings/rules.json, the one source of the rulebook, and prints the one-place report. No checks (rule 1.75). */
'use strict';
const { ROOT, read, text } = require('./lib/gen.js');
const fs = require('fs'), path = require('path');

const SRC = 'data/settings/rules.json', PAGE = 'docs/rules.md';
const book = () => read(SRC) || { principles: [], rules: [], sweep: [] };
function rules() { return (book().rules || []).map(r => ({ n: r.id, text: r.text || '' })); }
/* THE PAGE: docs/rules.md is written from the JSON, never edited. */
function render() {
  const b = book(), out = ['# The rulebook — the one foundation', '', '<!-- generated — edit data/settings/rules.json, then run: node tools/build.js -->', '',
    '**' + b.core + '**', '', b.about];
  (b.principles || []).forEach(p => { out.push('', '## ' + p.n + '. ' + p.name);
    (b.rules || []).filter(r => r.principle === p.n).forEach(r => out.push('- **' + r.id + '** ' + r.text)); });
  out.push('', '## How a sweep works'); (b.sweep || []).forEach((t, i) => out.push((i + 1) + '. ' + t));
  return out.join('\n') + '\n';
}
/* ONE PLACE (rule 1.63), report-only: each business function is yes when all its evidence is in the code, partly when some, else no. */
function onePlace() {
  const j = read('data/settings/one-place.json');
  return ((j && j.functions) || []).map(f => { const ev = f.evidence || [], got = ev.filter(([file, has]) => text(file, '').indexOf(has) >= 0).length;
    return { id: f.id, name: f.name, status: !ev.length || !got ? 'no' : got === ev.length ? 'yes' : 'partly', found: got, of: ev.length }; });
}
function run() { fs.writeFileSync(path.join(ROOT, PAGE), render()); console.log('rules: wrote ' + PAGE + ' from ' + SRC); }
module.exports = { rules, render, onePlace, run };
if (require.main === module) {
  run();
  console.log(rules().length + ' rules');
  onePlace().forEach(f => console.log(`  ${f.status.padEnd(6)} ${f.name} (${f.found}/${f.of})`));
}
