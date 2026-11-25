/* @family. — tools/lib/dfe.js THE TOPIC TREES FROM THE GOVERNMENT'S LISTS (owner, 24–25 Nov: "the library's single source of truth is the
   UK government spec"). One format, one file a subject: data/settings/dfe-maths.json (National Curriculum KS1–KS3 and GCSE subject content,
   2013) and data/settings/dfe-science.json (National Curriculum KS1–KS3, GCSE combined and single science, 2015). Each holds its tree
   (`nodes`: id, plain name, parent, `src` lines in its `docs`, a sub-topic's `levels`) and the maps a question is tagged by. A question's
   `dfe` (data/questions.json, space-separated node ids) is the node(s) it tests, read from its subject's table only, in this order: its set
   (`set`), its idea (`ideas`: the 24 Nov idea trees, tools/lib/qideas.js, mapped onto the government's), its `spec_ref` points (maths: AQA 8300
   numbers its points as the DfE GCSE statements, aqa-8300:N2 is GCSE N2; `spec`: a spec point's longest listed section prefix), its source
   topic names (`topic`, else the idea data/settings/question-ideas.json gives that name). An A-Level set is outside these documents and gets
   none. A worksheet's own name goes to the question's `worksheet`, never to a topic. Written by `node tools/content.js qideas --apply`;
   checked by tools/one-dfe.js. */
'use strict';
const SD = require('./site-data.js');
const { S } = require('./gen.js');
const QI = require('./qideas.js');

/* THE SUBJECTS: each its table, its taxonomy.json key and its questions. */
const SUBJECTS = {
  maths: { table: 'data/settings/dfe-maths.json', tax: 'Maths', questions: rows => QI.mathsQuestions(rows) },
  science: { table: 'data/settings/dfe-science.json', tax: 'Science', questions: rows => QI.scienceQuestions(rows) },
};
const TABLE = SUBJECTS.maths.table;
const table = (k) => SD.json(SUBJECTS[k || 'maths'].table);
const CODE = /^[NARGPS]\d+$/;

/* THE TREE, indexed: node by id, children, each GCSE maths statement's first sub-topic. */
function index(T) {
  const by = {}, kids = {}, code = {};
  T.nodes.forEach(n => { by[n.id] = n; (kids[n.parent] = kids[n.parent] || []).push(n.id); });
  T.nodes.forEach(n => { if (!kids[n.id]) n.src.forEach(s => { if (s.doc === 'gcse' && CODE.test(s.ref) && !code[s.ref]) code[s.ref] = n.id; }); });
  return { by, kids, code };
}
/* A NODE'S PATH, broad → narrow (ids). */
function path(id, X) { const out = []; for (let n = X.by[id]; n; n = X.by[n.parent]) out.unshift(n.id); return out; }
const LEVELS = ['KS1', 'KS2', 'KS3', 'GCSE Foundation', 'GCSE Higher'];
const levelsList = T => T.levels || LEVELS;
function levelsOf(id, X, T) {
  const n = X.by[id]; if (n.levels) return n.levels.slice();
  const all = new Set(); (X.kids[id] || []).forEach(k => levelsOf(k, X, T).forEach(l => all.add(l)));
  return levelsList(T || {}).filter(l => all.has(l));
}

function docs(rows) { const d = {}; rows.forEach(r => { if (r.kind === 'document') d[r.paper_id] = r; }); return d; }
const aLevel = doc => !!doc && (S(doc.key_stage) === 'KS5' || /a-?level/i.test(S(doc.band_value) + ' ' + S(doc.level)));

/* A SPEC POINT'S NODE: maths by its GCSE statement code; else the longest of its section prefixes the table's `spec` lists. */
function specNode(ref, T, X) {
  const m = /^aqa-8300:([NARGPS]\d+)$/.exec(ref);
  if (m) return X.code[m[1]] || '';
  const i = ref.indexOf(':'); if (i < 0 || !T.spec) return '';
  const f = ref.slice(0, i), parts = ref.slice(i + 1).split('.');
  for (let j = parts.length; j > 0; j--) { const v = T.spec[f + ':' + parts.slice(0, j).join('.')]; if (v) return v; }
  return '';
}

/* ONE QUESTION'S NODES (ids), most specific kept: a node whose descendant is also listed goes. */
function nodesOf(r, T, X, D, QT) {
  if (aLevel(D[r.paper_id])) return [];
  const want = [];
  if ((T.set || {})[r.paper_id]) want.push(T.set[r.paper_id]);
  if (T.ideas[S(r.idea_id)]) want.push(T.ideas[S(r.idea_id)]);
  S(r.spec_ref).split(/[\s,]+/).filter(Boolean).forEach(ref => { const v = specNode(ref, T, X); if (v) want.push(v); });
  QI.atoms(r.topics).forEach(t => { const v = (T.topic || {})[t] || T.ideas[(QT.topic || {})[t]]; if (v) want.push(v); });
  const u = [...new Set(want)];
  return u.filter(id => !u.some(o => o !== id && path(o, X).includes(id)));
}

/* ONE SUBJECT'S QUESTIONS GIVEN THEIR NODES (`dfe`) AND, FROM A WORKSHEET, THEIR `worksheet` NAME. Returns the counts. */
function assignOne(rows, k, T, QT, D, seen) {
  T = T || table(k);
  const X = index(T), qs = new Set(SUBJECTS[k].questions(rows));
  const t = { subject: k, questions: qs.size, tagged: 0, changed: 0, untagged: {} };
  /* A QUESTION SHOWN IN A SECOND SET (`same_as`) IS ONE QUESTION: it and its source wear the same nodes, both sets' read together. */
  const ids = new Map(), byId = {};
  rows.forEach(r => { if (qs.has(r)) { ids.set(r, nodesOf(r, T, X, D, QT)); byId[r.row_id] = r; } });
  const root = r => { const seenR = new Set(); while (r && byId[S(r.same_as)] && !seenR.has(r)) { seenR.add(r); r = byId[S(r.same_as)]; } return r; };
  const groups = new Map();
  rows.forEach(r => { if (!qs.has(r) || !byId[S(r.same_as)]) return; const g = root(r); if (!groups.has(g)) groups.set(g, new Set([g])); groups.get(g).add(r); });
  groups.forEach(m => { const u = [...new Set([].concat(...[...m].map(x => ids.get(x))))], v = u.filter(id => !u.some(o => o !== id && path(o, X).includes(id)));
    m.forEach(x => ids.set(x, v)); });
  rows.forEach(r => {
    if (!qs.has(r)) return;
    seen.add(r);
    const want = ids.get(r).join(' ');
    const ws = /^W-/.test(S(r.paper_id)) && D[r.paper_id] ? S(D[r.paper_id].name || D[r.paper_id].title) : '';
    if (want) t.tagged++;
    else { const why = aLevel(D[r.paper_id]) ? 'A-Level (outside the DfE KS1–GCSE lists)' : /^P-CBM-5AD/.test(r.paper_id) ? 'Corbettmaths 5-a-day, no topic'
      : QI.atoms(r.topics).length ? 'source topic ' + QI.atoms(r.topics).join(', ') : 'no topic, idea or spec point';
      t.untagged[why] = (t.untagged[why] || 0) + 1; }
    if (S(r.dfe) !== want) { t.changed++; if (want) r.dfe = want; else delete r.dfe; }
    if (S(r.worksheet) !== ws) { t.changed++; if (ws) r.worksheet = ws; else delete r.worksheet; }
  });
  t.untaggedN = t.questions - t.tagged;
  return t;
}
/* EVERY SUBJECT; no other row wears `dfe` or `worksheet`. `tables`: { maths, science } to use instead of the files. */
function assign(rows, tables) {
  tables = tables || {};
  const D = docs(rows), QT = QI.table(), seen = new Set(), out = {};
  Object.keys(SUBJECTS).forEach(k => { out[k] = assignOne(rows, k, tables[k], QT, D, seen); });
  let stray = 0;
  rows.forEach(r => { if (seen.has(r)) return; if (r.dfe != null) { delete r.dfe; stray++; } if (r.worksheet != null) { delete r.worksheet; stray++; } });
  out.changed = Object.keys(SUBJECTS).reduce((a, k) => a + out[k].changed, stray);
  return out;
}

/* THE TREE AS FIND READS IT (taxonomy.json <Subject>.dfe): id -> [name, parent]. */
function forFind(T) { const o = {}; (T || table()).nodes.forEach(n => { o[n.id] = [n.name, n.parent]; }); return o; }

module.exports = { SUBJECTS, TABLE, table, index, path, levelsOf, levelsList, LEVELS, nodesOf, specNode, assign, forFind, aLevel, docs, CODE };
