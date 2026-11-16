#!/usr/bin/env node
/* @family. — tools/rules.js: writes docs/rules.md from data/settings/rules.json, the one source of the rulebook, and prints the owner's inbox file and the one-place report. No checks (rule 1.75). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const jread = f => { try { return JSON.parse(read(f)); } catch (e) { return null; } };

const SRC = 'data/settings/rules.json', PAGE = 'docs/rules.md';
const book = () => jread(SRC) || { principles: [], rules: [], sweep: [] };
function rules() { return (book().rules || []).map(r => ({ n: r.id, text: r.text || '' })); }
/* THE PAGE: docs/rules.md is written from the JSON, never edited. */
function render() {
  const b = book(), out = ['# The rulebook — the one foundation', '', '<!-- generated — edit data/settings/rules.json, then run: node tools/rules.js --write -->', '',
    '**' + b.core + '**', '', b.about];
  (b.principles || []).forEach(p => { out.push('', '## ' + p.n + '. ' + p.name);
    (b.rules || []).filter(r => r.principle === p.n).forEach(r => out.push('- **' + r.id + '** ' + r.text)); });
  out.push('', '## How a sweep works'); (b.sweep || []).forEach((t, i) => out.push((i + 1) + '. ' + t));
  return out.join('\n') + '\n';
}
/* THE INBOX FILE: the owner's open questions. */
function ownerQuestions() {
  const j = jread('data/settings/owner-questions.json');
  const q = (j && j.questions) || [];
  return { open: q.filter(x => x.status === 'open').length, of: q.length };
}
/* ONE PLACE (rule 1.63), report-only: each business function is yes when all its evidence is in the code, partly when some, else no. */
function onePlace() {
  const j = jread('data/settings/one-place.json');
  return ((j && j.functions) || []).map(f => { const ev = f.evidence || [], got = ev.filter(([file, has]) => read(file).indexOf(has) >= 0).length;
    return { id: f.id, name: f.name, status: !ev.length || !got ? 'no' : got === ev.length ? 'yes' : 'partly', found: got, of: ev.length }; });
}
module.exports = { rules, render, ownerQuestions, onePlace };
if (require.main === module) {
  if (process.argv.includes('--write')) { fs.writeFileSync(path.join(ROOT, PAGE), render()); console.log('rules: wrote ' + PAGE + ' from ' + SRC); }
  console.log(rules().length + ' rules');
  const q = ownerQuestions(); console.log(`owner questions: ${q.open} open of ${q.of}`);
  onePlace().forEach(f => console.log(`  ${f.status.padEnd(6)} ${f.name} (${f.found}/${f.of})`));
}
