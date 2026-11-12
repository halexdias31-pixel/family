#!/usr/bin/env node
/* @family. — tools/rules.js (1213): the rulebook's coverage, the owner's inbox file and the one-place report, read by tools/health.js. */
/* node tools/rules.js prints them; --write writes docs/rules.md from data/settings/rules.json, the one source of the rulebook. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const jread = f => { try { return JSON.parse(read(f)); } catch (e) { return null; } };
const ls = d => { try { return fs.readdirSync(path.join(ROOT, d)).filter(f => /\.js$/.test(f)).sort(); } catch (e) { return []; } };

/* THE RULEBOOK AS DATA (owner, 12 Nov: "words drift; codify the philosophy"): core, principles and rules in data/settings/rules.json. */
const SRC = 'data/settings/rules.json', PAGE = 'docs/rules.md';
const book = () => jread(SRC) || { principles: [], rules: [], sweep: [] };
function rules() { return (book().rules || []).map(r => ({ n: r.id, text: r.text || '', checks: r.checks || [] })); }
/* THE PAGE: docs/rules.md is written from the JSON, never edited; the gate fails when it drifts. */
function render() {
  const b = book(), out = ['# The rulebook — the one foundation', '', '<!-- generated — edit data/settings/rules.json, then run: node tools/rules.js --write -->', '',
    '**' + b.core + '**', '', b.about];
  (b.principles || []).forEach(p => { out.push('', '## ' + p.n + '. ' + p.name);
    (b.rules || []).filter(r => r.principle === p.n).forEach(r => out.push('- **' + r.id + '** ' + r.text + ' Checks: ' + (r.checks || []).map(c => '`' + c + '`').join(', '))); });
  out.push('', '## How a sweep works'); (b.sweep || []).forEach((t, i) => out.push((i + 1) + '. ' + t));
  return out.join('\n') + '\n';
}
/* THE CHECK FILES, by id: js/check-<id>.js (check.js is `check`), check/<id>.js, and each journey as flow/NN. */
function checkFiles() {
  const js = ls('js').filter(f => /^check(-|\.js)/.test(f)).map(f => (f === 'check.js' ? 'check' : f.slice(6, -3)));
  return { files: [...new Set(js.concat(ls('check').map(f => f.slice(0, -3))))], flows: ls('check/flow').map(f => 'flow/' + f.split('-')[0]) };
}
/* A RULE'S WORDS, for near-duplicates: lower-case words of four letters or more, code spans left out. */
const words = t => new Set(String(t).toLowerCase().replace(/`[^`]*`/g, ' ').match(/[a-z]{4,}/g) || []);
const overlap = (a, b) => { let n = 0; a.forEach(w => { if (b.has(w)) n++; }); return n / Math.max(1, Math.min(a.size, b.size)); };
/* NEAR-DUPLICATE: two rules sharing more than half the words of the shorter one say one thing twice. */
const SAME = 0.5;
/* COVERAGE: `ids` are the checks tools/health.js scores, `known` every id it knows; a token ending `*` names every check with that stem. */
function coverage(ids, known) {
  const F = checkFiles(), pop = [...new Set((ids || []).concat(F.files, F.flows))].sort();
  const K = new Set(pop.concat(known || [], ['owner-questions', 'rule-checked', 'check-tied', 'rule-once']));
  const hits = tok => (/\*$/.test(tok) ? pop.filter(c => c.startsWith(tok.slice(0, -1))) : K.has(tok) ? [tok] : []);
  const R = rules(), work = [], tied = new Set();
  if (!R.length) work.push({ kind: 'rule-checked', part: 'code', where: SRC, say: 'no rules could be read' });
  if (R.length && read(PAGE) !== render()) work.push({ kind: 'rule-checked', part: 'code', where: PAGE, say: PAGE + ' is stale against ' + SRC + ' — run: node tools/rules.js --write' });
  const seen = new Set(); R.forEach(r => { if (seen.has(r.n)) work.push({ kind: 'rule-once', part: 'code', where: SRC + ' ' + r.n, say: `rule ${r.n} is listed twice` }); seen.add(r.n); });
  let checked = 0;
  R.forEach(r => { const ok = r.checks.filter(t => hits(t).length), bad = r.checks.filter(t => !hits(t).length);
    ok.forEach(t => hits(t).forEach(c => tied.add(c)));
    if (ok.length) checked++; else work.push({ kind: 'rule-checked', part: 'code', where: SRC + ' ' + r.n, say: `rule ${r.n} names no existing check` });
    bad.forEach(t => work.push({ kind: 'rule-checked', part: 'code', where: SRC + ' ' + r.n, say: `rule ${r.n} names \`${t}\`, which no check measures` })); });
  const untied = pop.filter(c => !tied.has(c));
  untied.forEach(c => work.push({ kind: 'check-tied', part: 'code', where: c, say: 'check ' + c + ' serves no rule in ' + SRC }));
  const W = R.map(r => words(r.text)), twin = new Set();
  R.forEach((r, i) => R.forEach((s, j) => { if (j > i && overlap(W[i], W[j]) > SAME) { twin.add(i); twin.add(j);
    work.push({ kind: 'rule-once', part: 'code', where: SRC + ' ' + r.n, say: `rules ${r.n} and ${s.n} say much the same` }); } }));
  return { rules: R.length, checked, checks: pop.length, tied: pop.length - untied.length, once: R.length - twin.size, work, untied };
}
/* THE INBOX FILE: every question has a slug id, words, at least two options and a known status. */
function ownerQuestions() {
  const j = jread('data/settings/owner-questions.json'), work = [];
  if (!j || !Array.isArray(j.questions)) return { open: 0, of: 0, work: [{ kind: 'owner-questions', part: 'code', where: 'data/settings/owner-questions.json', say: 'unreadable or has no questions list' }] };
  const seen = new Set();
  j.questions.forEach((q, i) => { const at = 'owner-questions.json ' + (q.id || '#' + i);
    if (!/^[a-z][a-z0-9-]{1,59}$/.test(q.id || '')) work.push({ kind: 'owner-questions', part: 'code', where: at, say: 'id is not a slug the owner_answers tab accepts' });
    if (seen.has(q.id)) work.push({ kind: 'owner-questions', part: 'code', where: at, say: 'id used twice' }); seen.add(q.id);
    if (!q.question) work.push({ kind: 'owner-questions', part: 'code', where: at, say: 'no question words' });
    if (Object.values(q.options || {}).filter(Boolean).length < 2) work.push({ kind: 'owner-questions', part: 'code', where: at, say: 'fewer than two options (a menu needs two answers)' });
    if (!/^(open|answered)$/.test(q.status || '')) work.push({ kind: 'owner-questions', part: 'code', where: at, say: 'status is not open or answered' }); });
  return { open: j.questions.filter(q => q.status === 'open').length, of: j.questions.length, work };
}
/* ONE PLACE (rule 10.1), report-only: each business function is yes when all its evidence is in the code, partly when some, else no. */
function onePlace() {
  const j = jread('data/settings/one-place.json');
  return ((j && j.functions) || []).map(f => { const ev = f.evidence || [], got = ev.filter(([file, has]) => read(file).indexOf(has) >= 0).length;
    return { id: f.id, name: f.name, status: !ev.length || !got ? 'no' : got === ev.length ? 'yes' : 'partly', found: got, of: ev.length }; });
}
module.exports = { rules, render, checkFiles, coverage, ownerQuestions, onePlace };
if (require.main === module) {
  if (process.argv.includes('--write')) { fs.writeFileSync(path.join(ROOT, PAGE), render()); console.log('rules: wrote ' + PAGE + ' from ' + SRC); }
  let ids = [];
  try { ids = (JSON.parse(read('data/health.json')).rules || []).map(r => r.id); } catch (e) { ids = []; /* no full run yet: files alone */ }
  /* EVERY ID health.js PRICES, read from its source, so a rule it measures but the last full run did not write still counts. */
  const known = ids.concat([...read('tools/health.js').matchAll(/'([a-z][a-z0-9]*(?:-[a-z0-9]+)*)'/g)].map(m => m[1]));
  const c = coverage(ids, known);
  console.log(`${c.rules} rules, ${c.checked} with a check; ${c.checks} checks, ${c.tied} tied to a rule; ${c.once} stated once`);
  c.work.forEach(w => console.log('  ' + w.say));
  const q = ownerQuestions(); console.log(`owner questions: ${q.open} open of ${q.of}; ${q.work.length} findings`);
  onePlace().forEach(f => console.log(`  ${f.status.padEnd(6)} ${f.name} (${f.found}/${f.of})`));
  /* A GATE, NOT A SCORE (owner, 12 Nov): a rule with no check, a check with no rule, or a rule said twice fails. */
  if (c.work.length || c.checked !== c.rules || c.tied !== c.checks) {
    console.log(`FAILED — the rulebook and the checks do not match: ${c.checked}/${c.rules} rules checked, ${c.tied}/${c.checks} checks tied.`); process.exit(1); }
  console.log(`OK — every rule has a check and every check a rule (${c.checked}/${c.rules}, ${c.tied}/${c.checks}).`);
}
