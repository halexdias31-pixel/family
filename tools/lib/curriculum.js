/* @family. — tools/lib/curriculum.js THE TOPIC TREES, ONE FILE A COUNTRY AND SUBJECT (owner, 24–25 Nov: "the library's single source of truth
   is the government spec"; 25 Nov: adding a country is ONE data file). Every file found at data/settings/curriculum/<country>/<subject>.json is
   read, none named here: the UK's are uk/maths.json (National Curriculum KS1–KS3 and GCSE subject content, 2013) and uk/science.json (KS1–KS3,
   GCSE combined and single science, 2015). Each holds its tree (`nodes`: id, plain name, parent, `src` lines in its `docs`, a sub-topic's
   `levels`), the maps a question is tagged by (`ideas`, `set`, `topic`, `spec`), and `templates` (node -> data/settings/qgen.json skill ids,
   tools/lib/qgen.js). A question's `dfe` (data/questions.json, space-separated node ids; the field keeps its first name so no stored question
   changes) is the node(s) it tests in every country's tree of its subject, each read in this order: its set (`set`), its idea (`ideas`: the
   24 Nov idea trees, tools/lib/qideas.js), its `spec_ref` points (`statements`: a spec whose points are the document's numbered statements,
   aqa-8300:N2 is GCSE N2; `spec`: a spec point's longest listed section prefix), its source topic names (`topic`, else the idea
   data/settings/question-ideas.json gives that name). An A-Level set is outside these documents and gets none. A worksheet's own name goes to
   the question's `worksheet`, never to a topic. Written by `node tools/content.js qideas --apply`; checked by tools/one-curriculum.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, S } = require('./gen.js');
const SD = require('./site-data.js');
const QI = require('./qideas.js');

const DIR = 'data/settings/curriculum';
/* A COUNTRY'S DOCUMENT HEADINGS (<country>/headings.json, 26 Nov): every section heading of each document its subject files cite, exact, as
   { <subject>: { <doc>: { cite, groups, skills } } } (tools/one-curriculum.js holds every `ref` to it). Not a subject file. */
const HEADINGS = 'headings';
function headings(e) {
  const f = path.join(ROOT, path.dirname(e.file), HEADINGS + '.json');
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, 'utf8'))[e.subject] || null) : null;
}
const headingsOf = e => { Object.defineProperty(e, 'H', { value: headings(e), enumerable: false, writable: true, configurable: true }); return e; };
/* THE FIELD a question's nodes are written to, for every country (its first name, so the stored questions stay as they are). */
const FIELD = 'dfe';
/* THE SUBJECTS a country file may be for: its taxonomy.json key and its questions. */
const SUBJECTS = {
  maths: { tax: 'Maths', questions: rows => QI.mathsQuestions(rows) },
  science: { tax: 'Science', questions: rows => QI.scienceQuestions(rows) },
};

/* EVERY COUNTRY FILE IN `dir` (default the live folder): [{ country, subject, file, T }], countries A–Z, subjects in SUBJECTS order. */
function entries(dir) {
  dir = dir || DIR;
  const abs = path.join(ROOT, dir), out = [];
  if (!fs.existsSync(abs)) return out;
  fs.readdirSync(abs).sort().forEach(c => {
    const cd = path.join(abs, c); if (!fs.statSync(cd).isDirectory()) return;
    const files = fs.readdirSync(cd).filter(f => /\.json$/.test(f)).map(f => f.replace(/\.json$/, '')).filter(f => f !== HEADINGS);
    const order = Object.keys(SUBJECTS).filter(k => files.includes(k)).concat(files.filter(f => !SUBJECTS[f]).sort());
    order.forEach(k => { const file = dir + '/' + c + '/' + k + '.json'; out.push(headingsOf({ country: c, subject: k, file, T: SD.json(file) })); });
  });
  return out;
}
const ofSubject = (E, k) => (E || entries()).filter(e => e.subject === k);
/* ONE SUBJECT'S TABLE IN ONE COUNTRY (default: the first country that has it). */
function table(k, country, E) { const e = ofSubject(E, k || 'maths').find(x => !country || x.country === country); return e ? e.T : null; }

/* A COUNTRY'S NUMBERED STATEMENTS (`statements`: the document, the code pattern, the spec whose points are the codes, how many of each). */
const stmt = T => (T && T.statements) || null;
const codeRe = T => (stmt(T) ? new RegExp(stmt(T).pattern) : null);

/* THE TREE, indexed: node by id, children, each numbered statement's first sub-topic. */
function index(T) {
  const by = {}, kids = {}, code = {}, st = stmt(T), re = codeRe(T);
  T.nodes.forEach(n => { by[n.id] = n; (kids[n.parent] = kids[n.parent] || []).push(n.id); });
  if (st) T.nodes.forEach(n => { if (!kids[n.id]) n.src.forEach(s => { if (s.doc === st.doc && re.test(s.ref) && !code[s.ref]) code[s.ref] = n.id; }); });
  return { by, kids, code };
}
/* A NODE'S PATH, broad → narrow (ids). */
function path_(id, X) { const out = []; for (let n = X.by[id]; n; n = X.by[n.parent]) out.unshift(n.id); return out; }
const LEVELS = ['KS1', 'KS2', 'KS3', 'GCSE Foundation', 'GCSE Higher'];
const levelsList = T => T.levels || LEVELS;
function levelsOf(id, X, T) {
  const n = X.by[id]; if (n.levels) return n.levels.slice();
  const all = new Set(); (X.kids[id] || []).forEach(k => levelsOf(k, X, T).forEach(l => all.add(l)));
  return levelsList(T || {}).filter(l => all.has(l));
}

function docs(rows) { const d = {}; rows.forEach(r => { if (r.kind === 'document') d[r.paper_id] = r; }); return d; }
const aLevel = doc => !!doc && (S(doc.key_stage) === 'KS5' || /a-?level/i.test(S(doc.band_value) + ' ' + S(doc.level)));

/* A SPEC POINT'S NODE: by its statement code where the spec numbers its points so; else the longest of its section prefixes `spec` lists. */
function specNode(ref, T, X) {
  const i = ref.indexOf(':'), st = stmt(T);
  if (st && i > 0 && ref.slice(0, i) === st.spec && codeRe(T).test(ref.slice(i + 1))) return X.code[ref.slice(i + 1)] || '';
  if (i < 0 || !T.spec) return '';
  const f = ref.slice(0, i), parts = ref.slice(i + 1).split('.');
  for (let j = parts.length; j > 0; j--) { const v = T.spec[f + ':' + parts.slice(0, j).join('.')]; if (v) return v; }
  return '';
}

/* ONE QUESTION'S NODES IN ONE COUNTRY'S TREE (ids), most specific kept: a node whose descendant is also listed goes. */
function nodesOf(r, e, X, D, QT, others) {
  const T = e.T;
  if (aLevel(D[r.paper_id])) return [];
  /* A GENERATED @family SET (tools/lib/qgen.js, owner 25 Nov) is one country's sub-topic, read from its id: that node alone there, none elsewhere. */
  const QG = require('./qgen.js');
  const g = QG.nodeOfSet(r.paper_id, e); if (g) return [g];
  if ((others || []).some(o => QG.nodeOfSet(r.paper_id, o))) return [];
  const want = [];
  if ((T.set || {})[r.paper_id]) want.push(T.set[r.paper_id]);
  if ((T.ideas || {})[S(r.idea_id)]) want.push(T.ideas[S(r.idea_id)]);
  S(r.spec_ref).split(/[\s,]+/).filter(Boolean).forEach(ref => { const v = specNode(ref, T, X); if (v) want.push(v); });
  QI.atoms(r.topics).forEach(t => { const v = (T.topic || {})[t] || (T.ideas || {})[(QT.topic || {})[t]]; if (v) want.push(v); });
  const u = [...new Set(want)];
  return u.filter(id => !u.some(o => o !== id && path_(o, X).includes(id)));
}

/* ONE COUNTRY'S NODES FOR A SUBJECT'S QUESTIONS: a question shown in a second set (`same_as`) is one question, it and its source wearing the
   same nodes, both sets' read together. */
function idsIn(rows, qs, e, QT, D, others) {
  const X = index(e.T), ids = new Map(), byId = {};
  rows.forEach(r => { if (qs.has(r)) { ids.set(r, nodesOf(r, e, X, D, QT, others)); byId[r.row_id] = r; } });
  const root = r => { const seenR = new Set(); while (r && byId[S(r.same_as)] && !seenR.has(r)) { seenR.add(r); r = byId[S(r.same_as)]; } return r; };
  const groups = new Map();
  rows.forEach(r => { if (!qs.has(r) || !byId[S(r.same_as)]) return; const g = root(r); if (!groups.has(g)) groups.set(g, new Set([g])); groups.get(g).add(r); });
  groups.forEach(m => { const u = [...new Set([].concat(...[...m].map(x => ids.get(x))))], v = u.filter(id => !u.some(o => o !== id && path_(o, X).includes(id)));
    m.forEach(x => ids.set(x, v)); });
  return ids;
}

/* ONE SUBJECT'S QUESTIONS GIVEN THEIR NODES (every country's, countries in order) AND, FROM A WORKSHEET, THEIR `worksheet` NAME. Returns the counts. */
function assignOne(rows, k, es, QT, D, seen) {
  const qs = new Set(SUBJECTS[k].questions(rows));
  const t = { subject: k, questions: qs.size, tagged: 0, changed: 0, untagged: {} };
  const per = es.map(e => idsIn(rows, qs, e, QT, D, es.filter(o => o !== e)));
  rows.forEach(r => {
    if (!qs.has(r)) return;
    seen.add(r);
    const want = [...new Set([].concat(...per.map(m => m.get(r))))].join(' ');
    const ws = /^W-/.test(S(r.paper_id)) && D[r.paper_id] ? S(D[r.paper_id].name || D[r.paper_id].title) : '';
    if (want) t.tagged++;
    else { const why = aLevel(D[r.paper_id]) ? 'A-Level (outside the DfE KS1–GCSE lists)' : /^P-CBM-5AD/.test(r.paper_id) ? 'Corbettmaths 5-a-day, no topic'
      : QI.atoms(r.topics).length ? 'source topic ' + QI.atoms(r.topics).join(', ') : 'no topic, idea or spec point';
      t.untagged[why] = (t.untagged[why] || 0) + 1; }
    if (S(r[FIELD]) !== want) { t.changed++; if (want) r[FIELD] = want; else delete r[FIELD]; }
    if (S(r.worksheet) !== ws) { t.changed++; if (ws) r.worksheet = ws; else delete r.worksheet; }
  });
  t.untaggedN = t.questions - t.tagged;
  return t;
}
/* EVERY SUBJECT IN EVERY COUNTRY; no other row wears the field or `worksheet`. `E`: entries() to use instead of the files. */
function assign(rows, E) {
  E = E || entries();
  const D = docs(rows), QT = QI.table(), seen = new Set(), out = {};
  const keys = Object.keys(SUBJECTS).filter(k => ofSubject(E, k).length);
  keys.forEach(k => { out[k] = assignOne(rows, k, ofSubject(E, k), QT, D, seen); });
  let stray = 0;
  rows.forEach(r => { if (seen.has(r)) return; if (r[FIELD] != null) { delete r[FIELD]; stray++; } if (r.worksheet != null) { delete r.worksheet; stray++; } });
  out.changed = keys.reduce((a, k) => a + out[k].changed, stray);
  return out;
}

/* A SUBJECT'S TREES AS FIND READS THEM (taxonomy.json <Subject>.dfe): id -> [name, parent], every country's, countries in order. */
function forFind(k, E) { const o = {}; ofSubject(E, k || 'maths').forEach(e => e.T.nodes.forEach(n => { o[n.id] = [n.name, n.parent]; })); return o; }

module.exports = { DIR, HEADINGS, headings, FIELD, SUBJECTS, entries, ofSubject, table, index, path: path_, levelsOf, levelsList, LEVELS, nodesOf, specNode, assign, forFind, aLevel, docs, stmt, codeRe };
