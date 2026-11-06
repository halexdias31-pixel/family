#!/usr/bin/env node
/* @family. — tools/philosophy.js (1060): the philosophy's coverage, the owner's inbox file and the one-place report, read by tools/health.js. */
/* node tools/philosophy.js prints all three. Mechanical: it reads docs/philosophy.md, data/settings/owner-questions.json, one-place.json. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const jread = f => { try { return JSON.parse(read(f)); } catch (e) { return null; } };

/* THE PRINCIPLES: each numbered rule and the check ids on its `Checks:` line. */
function principles() {
  const src = read('docs/philosophy.md'), out = [];
  const blocks = src.split(/\n(?=\d+\. \*\*)/).filter(b => /^\d+\. \*\*/.test(b));
  blocks.forEach(b => { const m = /^(\d+)\. \*\*([^*]+)\*\*/.exec(b), c = /Checks:([^\n]*)/.exec(b);
    out.push({ n: Number(m[1]), rule: m[2].trim(), checks: c ? [...c[1].matchAll(/`([\w-]+)`/g)].map(x => x[1]) : [] }); });
  return out;
}
/* A CHECK ID EXISTS when health.js prices it, a check file carries its name (js/check-<id>.js), or it is one of this file's own. */
function coverage(known) {
  const K = new Set(known.concat(['business', 'biz-checker', 'philosophy', 'owner-questions', 'one-place']));
  const isCheck = id => K.has(id) || fs.existsSync(path.join(ROOT, 'js', 'check-' + id + '.js'));
  const P = principles(), work = [], tied = new Set();
  if (!P.length) work.push({ kind: 'philosophy', part: 'code', where: 'docs/philosophy.md', say: 'no numbered principles could be read' });
  P.forEach(p => { const ok = p.checks.filter(isCheck), bad = p.checks.filter(c => !isCheck(c));
    ok.forEach(c => tied.add(c));
    if (!ok.length) work.push({ kind: 'philosophy', part: 'code', where: 'docs/philosophy.md #' + p.n, say: `principle ${p.n} (${p.rule}) names no existing check` });
    bad.forEach(c => work.push({ kind: 'philosophy', part: 'code', where: 'docs/philosophy.md #' + p.n, say: `principle ${p.n} names \`${c}\`, which no check measures` })); });
  return { principles: P.length, work, untied: [...K].filter(k => !tied.has(k)).sort() };
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
/* ONE PLACE (philosophy 1), report-only: each business function is yes when all its evidence is in the code, partly when some, else no. */
function onePlace() {
  const j = jread('data/settings/one-place.json');
  return ((j && j.functions) || []).map(f => { const ev = f.evidence || [], got = ev.filter(([file, has]) => read(file).indexOf(has) >= 0).length;
    return { id: f.id, name: f.name, status: !ev.length || !got ? 'no' : got === ev.length ? 'yes' : 'partly', found: got, of: ev.length }; });
}
module.exports = { principles, coverage, ownerQuestions, onePlace };
if (require.main === module) {
  const c = coverage([]);
  console.log(`${c.principles} principles; ${c.work.length} coverage findings`); c.work.forEach(w => console.log('  ' + w.say));
  const q = ownerQuestions(); console.log(`owner questions: ${q.open} open of ${q.of}; ${q.work.length} findings`);
  onePlace().forEach(f => console.log(`  ${f.status.padEnd(6)} ${f.name} (${f.found}/${f.of})`));
}
