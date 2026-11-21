#!/usr/bin/env node
/* @family. — tools/aqa-ms-answers.js EACH AQA QUESTION'S ANSWER FROM ITS OWN MARK-SCHEME CELL (21 Nov).
   The AQA science rows imported 28 Oct (8462, 8464) took their `answer` from the scheme's text split at each question number's
   line. AQA prints that number in the vertical middle of its cell, so the split gave the top half of every cell to the question
   before it and cut long cells at the page: answers that were half another part's, or stopped after one line. This re-reads a row's
   answer from its cell as tools/aqa-ms-cells.py bounds it by the table's own rules, in the same "point | note; point" form.

   node tools/aqa-ms-answers.js <ids file> <pdf dir> [--overrides f.json] [--out lib-import.json] [--apply]
     ids file   row ids, one a line (Q-AQA-8462-1906-1F-104 is 8462 June 2019 1F, question 10.4)
     pdf dir    the schemes as <spec>-<yymm>-<paper>.pdf (8462-1906-1F.pdf)
     overrides  {row_id: answer} for a cell that is a picture (a matching diagram's lines), read off the scheme by eye
     --out      a lib-import file of {id, answer} for the Ledger;  --apply also writes them into data-private/questions.json
   Words stay in data-private and the PDFs outside the repository (docs/library.md). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), flag = n => { const i = args.indexOf(n); return i < 0 ? null : args.splice(i, 2)[1]; };
const apply = args.includes('--apply'); if (apply) args.splice(args.indexOf('--apply'), 1);
const over = flag('--overrides'), outF = flag('--out');
const [idsF, pdfDir] = args;
if (!idsF || !pdfDir) { console.log('usage: node tools/aqa-ms-answers.js <ids file> <pdf dir> [--overrides f.json] [--out f.json] [--apply]'); process.exit(1); }
const ids = fs.readFileSync(idsF, 'utf8').split(/\s+/).filter(Boolean);
const overrides = over ? JSON.parse(fs.readFileSync(over, 'utf8')) : {};
const PRIV = path.join(ROOT, 'data-private', 'questions.json');
const priv = JSON.parse(fs.readFileSync(PRIV, 'utf8'));

const cache = {};
const cellsOf = f => cache[f] || (cache[f] = JSON.parse(cp.execFileSync('python3', [path.join(__dirname, 'aqa-ms-cells.py'), f],
  { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 })));

/* A CELL'S PRINTED LINES AS POINTS: a new point where the Mark column has a number, at a bullet, an "any n from", an "or",
   an "(improvement)"-style heading, or after a line that ends a sentence; any other line continues the one above. A note in the
   Extra information column starts at allow / ignore / do not / max / if / must …, else continues the note above. The table's own
   header words, repeated on a page a cell runs onto, are dropped. */
const NOTE = /^(allow |ignore |do not |accept |reject |max |if |must |dependent|MP\d|or$|an answer|scores |the mark|alternative|approach|correct |ecf|award|credit)/i;
const HEAD = /^(Answers|Extra|information|Mark|Marks|AO|\/|Spec\.|Ref\.|Extra information|\s)*$/;
function flow(rows) {
  const pts = [];
  let cur = null;
  for (let [a, e, m] of rows) {
    a = a.replace(/\s*\bAnswers$/, '').trim();
    e = e.replace(/\s*\b(Extra information|Extra|information)$/, '').replace(/^(Extra information|information)$/, '').trim();
    if (HEAD.test(a) && HEAD.test(e) && HEAD.test(m || '')) continue;
    if (a) {
      const fresh = !cur || /^\d/.test((m || '').trim()) || /^(•|any |or$|either|approach|alternative|\(\w+\):?$)/i.test(a) || /[.:]$/.test(cur.a);
      if (fresh) { cur = { a, e: [] }; pts.push(cur); } else cur.a += ' ' + a;
    }
    if (e) {
      if (!cur) { cur = { a: '', e: [] }; pts.push(cur); }
      if (!cur.e.length || NOTE.test(e)) cur.e.push(e); else cur.e[cur.e.length - 1] += ' ' + e;
    }
  }
  return pts.map(p => [p.a, ...p.e].filter(Boolean).join(' | ')).join('; ')
    .replace(/\( +/g, '(').replace(/ +\)/g, ')').replace(/\s+/g, ' ').trim();
}

const out = [], miss = [];
for (const id of ids) {
  const m = /^Q-AQA-(\w+)-(\d{4})-(\d\w)-(\d\d)(\d)$/.exec(id);
  if (!m) { miss.push(id + ' (id not in the <spec>-<yymm>-<paper>-<qq><p> form)'); continue; }
  let answer = overrides[id];
  if (answer == null) {
    const f = path.join(pdfDir, m[1] + '-' + m[2] + '-' + m[3] + '.pdf'), q = m[4] + '.' + m[5];
    if (!fs.existsSync(f)) { miss.push(id + ' (no ' + path.basename(f) + ')'); continue; }
    const c = cellsOf(f)[q];
    if (!c) { miss.push(id + ' (no cell ' + q + ')'); continue; }
    answer = flow(c);
  }
  if (!answer) { miss.push(id + ' (empty cell)'); continue; }
  out.push({ id, answer, was: (priv[id] || {}).answer || '' });
}
const changed = out.filter(r => r.answer !== r.was);
console.log('aqa-ms-answers: ' + out.length + ' cells read, ' + changed.length + ' differ from the stored answer' + (miss.length ? ', ' + miss.length + ' not read:' : ''));
miss.forEach(x => console.log('  ' + x));
if (outF) {
  fs.writeFileSync(outF, JSON.stringify({ version: 1, made: new Date().toISOString(),
    note: 'AQA 8462/8464 answers re-read from each question\'s own mark-scheme cell (tools/aqa-ms-answers.js): the 28 Oct split gave the top half of a cell to the question before it.',
    files: { questions: changed.map(r => ({ id: r.id, answer: r.answer })) } }, null, 1));
  console.log('  wrote ' + outF);
}
if (apply) {
  changed.forEach(r => { priv[r.id] = Object.assign(priv[r.id] || {}, { answer: r.answer }); });
  fs.writeFileSync(PRIV, '{\n' + Object.keys(priv).map(k => JSON.stringify(k) + ':' + JSON.stringify(priv[k])).join(',\n') + '\n}\n');
  console.log('  applied ' + changed.length + ' to data-private/questions.json');
}
