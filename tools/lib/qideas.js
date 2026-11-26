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
  /* A GENERATED @family SET (owner, 25 Nov): its sub-topic's idea, the one its country file's `ideas` maps to it (tools/lib/qgen.js), or none. */
  const g = require('./qgen.js').ideaOfSet(r.paper_id);
  if (g != null) return g;
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

/* SCIENCE (item 8, 24 Nov): a Biology, Chemistry or Physics question points at the idea of the AQA spec point it tests. Read, in order:
   the table's science.set (a whole single-point set), the question's own `spec_ref` (data/questions.json, `aqa-8461:4.1.1.2`, the first that
   is an idea's), else the one data/spec/aqa-846x.json point whose `q:` links name it (the first in spec order). A point's idea is the card
   that teaches it (data/textbooks.json `specs`, tools/lib/sci-ideas.js) — the cards are the one truth, never a guess. A question with no
   point (an A-Level or OCR paper, a whole-chapter topic) stays unmapped, held at science.budget, which may only fall. */
const SX = () => require('./sci-ideas.js');
function scienceQuestions(rows) {
  const subs = SX().SUBJECTS, sci = new Set(rows.filter(r => r.kind === 'document' && subs[r.subject]).map(r => r.paper_id));
  return rows.filter(r => r.kind === 'question' && sci.has(r.paper_id));
}
/* THE POINTS' IDEAS (from the cards) and THE SPEC FILES' q: LINKS (question -> its points, spec order). */
function sciIndex(tb) {
  const point = {}, links = {};
  SX().cardsOf(tb).forEach(c => { if (c.row.idea_id) S(c.row.specs).split(/\s+/).filter(Boolean).forEach(ref => { point[ref] = point[ref] || c.row.idea_id; }); });
  ['8461', '8462', '8463', '8464'].forEach(k => { const f = SD.json('data/spec/aqa-' + k + '.json');
    (f ? f.points : []).forEach(p => (p.links || []).forEach(l => { if (l.startsWith('q:')) (links[l.slice(2)] = links[l.slice(2)] || []).push(f.id + ':' + p.id); })); });
  return { point, links };
}
function sciIdeaOf(r, T, X) {
  const st = (T.science || {}).set || {};
  if (st[r.paper_id]) return st[r.paper_id];
  const own = S(r.spec_ref).split(/\s+/).filter(Boolean).find(ref => X.point[ref]);
  if (own) return X.point[own];
  /* a question shown in a second set (`same_as`) is linked where the row it is was */
  const l = (X.links[r.row_id] || X.links[S(r.same_as)] || []).find(ref => X.point[ref]);
  if (l) return X.point[l];
  /* LAST, ITS SET'S: a topic set (Physics & Maths Tutor's sub-topic papers) names the idea its questions test when they name none */
  return ((T.science || {}).fallback || {})[r.paper_id] || '';
}
function sciNames(tb) {
  const out = {};
  SX().cardsOf(tb).forEach(c => { if (c.row.idea_id) out[c.row.idea_id] = S(c.row.title).trim(); });
  return Object.keys(out).sort().reduce((o, k) => (o[k] = out[k], o), {});
}
/* MATHS AND SCIENCE TOGETHER: every question's idea_id as the table and the cards say; no other row wears one. */
function assignAll(rows, tb, T) {
  T = T || table();
  const mq = new Set(mathsQuestions(rows)), sq = new Set(scienceQuestions(rows)), X = sciIndex(tb);
  const t = { questions: mq.size, mapped: 0, unmapped: 0, science: { questions: sq.size, mapped: 0, unmapped: 0 }, changed: 0 };
  rows.forEach(r => {
    const want = mq.has(r) ? ideaOf(r, T) : sq.has(r) ? sciIdeaOf(r, T, X) : '';
    if (mq.has(r)) want ? t.mapped++ : t.unmapped++;
    if (sq.has(r)) want ? t.science.mapped++ : t.science.unmapped++;
    if (S(r.idea_id) !== want) { t.changed++; if (want) r.idea_id = want; else delete r.idea_id; }
  });
  return t;
}

module.exports = { TABLE, table, mathsQuestions, names, ideaOf, assign, atoms, scienceQuestions, sciIndex, sciIdeaOf, sciNames, assignAll };
