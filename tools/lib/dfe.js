/* @family. — tools/lib/dfe.js THE MATHS TOPIC TREE FROM THE GOVERNMENT'S LISTS (owner, 24–25 Nov: "the library's single source of truth is the
   UK government spec"). data/settings/dfe-maths.json holds the tree (strand › topic › sub-topic) built from the DfE National Curriculum
   programmes of study (KS1–KS3) and the DfE GCSE subject content (2013): every node an id, a plain name, its `src` lines in those documents and,
   for a sub-topic, its levels. Every maths question's `dfe` (data/questions.json, space-separated node ids) is the node(s) it tests, read
   from the table only, in this order: its set (`set`), its idea (`ideas`: the 24 Nov idea tree, tools/lib/qideas.js, mapped onto this one),
   its AQA 8300 `spec_ref` points (AQA numbers its points as the DfE GCSE statements: aqa-8300:N2 is GCSE N2), its source topic names (`topic`,
   else the idea data/settings/question-ideas.json gives that name). An A-Level set is outside these documents and gets none. A worksheet's own
   name goes to the question's `worksheet`, never to a topic. Written by `node tools/content.js qideas --apply`; checked by tools/one-dfe.js. */
'use strict';
const SD = require('./site-data.js');
const { S } = require('./gen.js');
const QI = require('./qideas.js');

const TABLE = 'data/settings/dfe-maths.json';
const table = () => SD.json(TABLE);
const CODE = /^[NARGPS]\d+$/;

/* THE TREE, indexed: node by id, children, each GCSE statement's first sub-topic. */
function index(T) {
  const by = {}, kids = {}, code = {};
  T.nodes.forEach(n => { by[n.id] = n; (kids[n.parent] = kids[n.parent] || []).push(n.id); });
  T.nodes.forEach(n => { if (!kids[n.id]) n.src.forEach(s => { if (s.doc === 'gcse' && CODE.test(s.ref) && !code[s.ref]) code[s.ref] = n.id; }); });
  return { by, kids, code };
}
/* A NODE'S PATH, broad → narrow (ids). */
function path(id, X) { const out = []; for (let n = X.by[id]; n; n = X.by[n.parent]) out.unshift(n.id); return out; }
/* A NODE'S LEVELS: its own, else every level of the sub-topics under it, in the levels' order. */
const LEVELS = ['KS1', 'KS2', 'KS3', 'GCSE Foundation', 'GCSE Higher'];
function levelsOf(id, X) {
  const n = X.by[id]; if (n.levels) return n.levels.slice();
  const all = new Set(); (X.kids[id] || []).forEach(k => levelsOf(k, X).forEach(l => all.add(l)));
  return LEVELS.filter(l => all.has(l));
}

/* THE MATHS SETS: paper_id -> its document row; an A-Level one is outside the DfE lists. */
function docs(rows) { const d = {}; rows.forEach(r => { if (r.kind === 'document') d[r.paper_id] = r; }); return d; }
const aLevel = doc => !!doc && (S(doc.key_stage) === 'KS5' || /a-?level/i.test(S(doc.band_value) + ' ' + S(doc.level)));

/* ONE QUESTION'S NODES (ids), most specific kept: a node whose descendant is also listed goes. */
function nodesOf(r, T, X, D, QT) {
  if (aLevel(D[r.paper_id])) return [];
  const want = [];
  if (T.set[r.paper_id]) want.push(T.set[r.paper_id]);
  if (T.ideas[S(r.idea_id)]) want.push(T.ideas[S(r.idea_id)]);
  S(r.spec_ref).split(/[\s,]+/).forEach(ref => { const m = /^aqa-8300:([NARGPS]\d+)$/.exec(ref); if (m && X.code[m[1]]) want.push(X.code[m[1]]); });
  QI.atoms(r.topics).forEach(t => { const v = T.topic[t] || T.ideas[(QT.topic || {})[t]]; if (v) want.push(v); });
  const u = [...new Set(want)];
  return u.filter(id => !u.some(o => o !== id && path(o, X).includes(id)));
}

/* EVERY MATHS QUESTION GIVEN ITS NODES (`dfe`) AND, FROM A WORKSHEET, ITS `worksheet` NAME; no other row wears either. Returns the counts. */
function assign(rows, T, QT) {
  T = T || table(); QT = QT || QI.table();
  const X = index(T), D = docs(rows), mq = new Set(QI.mathsQuestions(rows));
  const t = { questions: mq.size, tagged: 0, aLevel: 0, changed: 0, untagged: {} };
  rows.forEach(r => {
    const ids = mq.has(r) ? nodesOf(r, T, X, D, QT) : [], want = ids.join(' ');
    const ws = mq.has(r) && /^W-/.test(S(r.paper_id)) && D[r.paper_id] ? S(D[r.paper_id].name || D[r.paper_id].title) : '';
    if (mq.has(r)) {
      if (want) t.tagged++;
      else { const why = aLevel(D[r.paper_id]) ? 'A-Level (outside the DfE KS1–GCSE lists)' : /^P-CBM-5AD/.test(r.paper_id) ? 'Corbettmaths 5-a-day, no topic' : QI.atoms(r.topics).length ? 'source topic ' + QI.atoms(r.topics).join(', ') : 'no topic, idea or spec point';
        t.untagged[why] = (t.untagged[why] || 0) + 1; }
    }
    if (S(r.dfe) !== want) { t.changed++; if (want) r.dfe = want; else delete r.dfe; }
    if (S(r.worksheet) !== ws) { t.changed++; if (ws) r.worksheet = ws; else delete r.worksheet; }
  });
  t.untaggedN = t.questions - t.tagged;
  return t;
}

/* THE TREE AS FIND READS IT (taxonomy.json Maths.dfe): id -> [name, parent]. */
function forFind(T) { const o = {}; (T || table()).nodes.forEach(n => { o[n.id] = [n.name, n.parent]; }); return o; }

module.exports = { TABLE, table, index, path, levelsOf, LEVELS, nodesOf, assign, forFind, aLevel, docs, CODE };
