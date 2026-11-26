#!/usr/bin/env node
/* @family. — tools/gen-questions.js THE GENERATED QUESTIONS, WRITTEN (owner, 25 Nov: "generated questions are first-class @family questions").
   data/settings/qgen.json and every country file data/settings/curriculum/<country>/<subject>.json -> data/questions.json: each bound
   template's fixed set (tools/lib/qgen.js emit) as ordinary rows, one @family question set per country sub-topic (P-FAM-GEN-*), the words in data-private/questions.json where this machine has it.
   A pure function of the two tables: run twice, nothing changes; edit a template or its node and its questions get new ids; revert and the
   old ids come back. A question no longer made stays, inactive (and its words stay), so an answer saved under it keeps what the child saw.
   Run first by tools/build.js; held by tools/one-gen.js. */
'use strict';
const fs = require('fs');
const { main } = require('./lib/gen.js');
const L = require('./lib/lib-full.js');
const IM = require('./lib/import.js');
const QG = require('./lib/qgen.js');

const mine = r => String(r.paper_id || '').startsWith(QG.SET_PREFIX);

/* THE FILE'S ROWS WITH THE GENERATED ONES PUT AFRESH: the rest untouched and in place, then the sets, then any old question kept inactive. */
function merged(rows, made) {
  const now = new Set(made.map(r => r.row_id));
  const old = rows.filter(r => mine(r) && !now.has(r.row_id)).map(r => Object.assign({}, r, { active: 'False' }));
  return rows.filter(r => !mine(r)).concat(made, old);
}

function run() {
  const q = IM.cards('questions'), e = QG.emit();
  const rows = merged(q.rows, e.rows);
  const before = JSON.stringify(q.rows), after = JSON.stringify(rows);
  if (before !== after) IM.writeCards('questions', rows, q.style);
  let wrote = 0;
  if (!L.ABSENT && fs.existsSync(L.privatePath('questions'))) {
    const words = IM.words('questions');
    Object.keys(e.words).forEach(id => { if (JSON.stringify(words[id]) !== JSON.stringify(e.words[id])) { words[id] = e.words[id]; wrote++; } });
    if (wrote) IM.writeWords('questions', words);
  }
  const qs = e.rows.filter(r => r.kind === 'question');
  console.log('gen-questions: ' + qs.length + ' generated questions in ' + (e.rows.length - qs.length) + ' @family sets, '
    + rows.filter(r => mine(r) && r.active === 'False' && r.kind === 'question').length + ' older one(s) kept inactive; '
    + (before === after ? 'data/questions.json unchanged' : 'data/questions.json written') + (wrote ? ', ' + wrote + ' word entr(ies) written' : ''));
}

main(module, run);
module.exports = { run, merged, mine };
