#!/usr/bin/env node
/* @family. — tools/one-paper.js THE ONE-PAPER CHECK (rule 1.75, 20 Nov): a child sees one card per sitting of a paper, never two copies of it.
   Counted site-wide over every active past-paper document row in data/questions.json: no two share a board, specification, series (year and
   season: May/June is summer, Oct-Dec is November) and paper number (and tier). A second copy is retired (active False) and its part ids aliased in
   data/settings/question-aliases.json, so saved answers follow the kept one. Prints the count; a pair fails the build. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const S = v => String(v == null ? '' : v).trim();

function season(m) { m = +m; return m >= 4 && m <= 7 ? 'summer' : m >= 10 ? 'november' : m ? 'm' + m : ''; }
function keyOf(d) {
  const board = S(d.exam_board || d.company);
  const spec = S(d.spec_code).split('-')[0] || S(d.paper_code).split('/')[0] || [S(d.key_stage), S(d.subject)].join(' ');
  const paper = S(d.paper_code).split('/')[1] || S(d.paper) || ((/^Paper\s+([\w]+)/i.exec(S(d.name)) || [])[1] || '');
  if (!board || !S(d.year) || !paper) return null;
  return [board, spec, S(d.year), season(d.month), paper.toUpperCase(), S(d.tier)].join(' | ');
}
function find() {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
  const by = {};
  let n = 0;
  for (const d of rows) {
    if (!d || d.kind !== 'document' || S(d.active) !== 'True' || (S(d.document_type) && S(d.document_type) !== 'Past paper')) continue;
    const k = keyOf(d);
    if (!k) continue;
    n++;
    (by[k] = by[k] || []).push(S(d.paper_id));
  }
  return { n, twins: Object.entries(by).filter(([, v]) => v.length > 1) };
}
function run() {
  const { n, twins } = find();
  console.log('one-paper: ' + n + ' active past papers, ' + twins.length + ' sitting(s) with two copies');
  twins.slice(0, 20).forEach(([k, v]) => console.log('  ' + k + ': ' + v.join(', ')));
  if (twins.length) throw new Error('one-paper: ' + twins.length + ' sitting(s) carried by more than one active paper; keep one, retire the other (active False) and alias its part ids');
}
module.exports = { run, find };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
