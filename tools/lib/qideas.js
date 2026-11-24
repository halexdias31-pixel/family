/* @family. — tools/lib/qideas.js ONE TOPIC TREE, MATHS (UNIFY THE LIBRARY AND PRACTICE, item 7, 24 Nov): a maths question points at the idea it
   tests — `idea_id` on its data/questions.json row, an idea of the maths cards (data/textbooks.json idea_id, tools/lib/ideas.js) — not at its
   source's own topic name ("Top Heavy Fractions Mixed Numbers", a 1st Class Maths sheet's topic, a spec point). Which idea is read from one data
   table, data/settings/question-ideas.json (`set`: a whole single-topic set; `topic`: a source topic name), never guessed per run. The idea's name
   is its card's title with the spec code off, written to data/settings/taxonomy.json Maths.ideaNames, which Find's topic question reads.
   Run by `node tools/content.js qideas` (data/settings/content.json sources.qideas); checked by tools/one-topic.js. */
'use strict';
const SD = require('./site-data.js');
const { S } = require('./gen.js');
const ID = require('./ideas.js');

const TABLE = 'data/settings/question-ideas.json';
const CODE = /^\s*(?:[A-Z]{1,2}\d+[a-z]?|\d+(?:\.\d+)+|L\d)\s+/;
const table = () => SD.json(TABLE) || { set: {}, topic: {}, budget: 0 };
const atoms = v => S(v).split(',').map(s => s.trim()).filter(Boolean);

/* THE MATHS QUESTIONS: question rows whose set is a maths set. */
function mathsQuestions(rows) {
  const maths = new Set(rows.filter(r => r.kind === 'document' && r.subject === ID.SUBJECT).map(r => r.paper_id));
  return rows.filter(r => r.kind === 'question' && maths.has(r.paper_id));
}

/* THE IDEAS THERE ARE, and each one's name (its card's title, the spec code off). */
function names(tb) {
  const out = {};
  ID.cardsOf(tb).filter(ID.inScope).forEach(c => { if (c.row.idea_id) out[c.row.idea_id] = S(c.row.title).replace(CODE, '').trim(); });
  return Object.keys(out).sort().reduce((o, k) => (o[k] = out[k], o), {});
}

/* ONE QUESTION'S IDEA, from the table only: its set's, else its first topic's that the table names. */
function ideaOf(r, T) {
  if (T.set[r.paper_id]) return T.set[r.paper_id];
  const a = atoms(r.topics).find(t => T.topic[t]);
  return a ? T.topic[a] : '';
}

/* EVERY MATHS QUESTION GIVEN ITS IDEA (or none: no idea_id); no other row wears one. Returns the counts. */
function assign(rows, T) {
  T = T || table();
  const qs = new Set(mathsQuestions(rows));
  let mapped = 0, changed = 0;
  rows.forEach(r => {
    const want = qs.has(r) ? ideaOf(r, T) : '';
    if (want) mapped++;
    if (S(r.idea_id) !== want) { changed++; if (want) r.idea_id = want; else delete r.idea_id; }
  });
  return { questions: qs.size, mapped, unmapped: qs.size - mapped, changed };
}

module.exports = { TABLE, table, mathsQuestions, names, ideaOf, assign, atoms };
