#!/usr/bin/env node
/* @family. — tools/one-curriculum.js THE CURRICULUM CHECK (rule 1.75, owner 24–25 Nov: "the @family library's single source of truth is the
   government spec"; 25 Nov: adding a country is ONE data file). A child picking a maths or science topic in Find must see their curriculum's own
   topics, broad → narrow, with every source's questions on one thing under one topic, and never a worksheet's title as a topic. Counted
   site-wide, over every country file data/settings/curriculum/<country>/<subject>.json (tools/lib/curriculum.js), none named here:
     - every node has an id (unique across every country), a name, a parent in the tree and at least one source line in a document its file
       names (an https address; the file's `doc_url` pattern where it gives one, the UK's gov.uk); where the file numbers `statements` (UK
       maths: GCSE N1–S6), a code is a real one and every statement is cited by a sub-topic;
     - every sub-topic has its levels, each one of the file's levels; every map (`ideas`, `set`, `topic`, `spec`) points at a node;
     - every `templates` entry maps a node of the file to skills data/settings/qgen.json has;
     - every question's `dfe` is the one the files give (never by hand), and a worksheet question's `worksheet` is its set's name; the
       untagged are exactly the subject's `budget` (in the first country file that gives one), which may only fall; the coverage is printed;
     - taxonomy.json <Subject>.dfe is every country's tree now, and js/find-finder.js TAXONOMY carries it;
     - in the page, every topic Find shows for a maths or science question is a curriculum node name (never a worksheet title);
     - ONE FILE IS A COUNTRY: the made-up tools/fixtures/curriculum/xx/maths.json, added beside the live files, passes the same tree checks,
       makes its generated questions, tags them with its nodes and puts its tree in Find, while every UK row, tag and topic stays as it is;
       and nothing of it ships (no fixture node, set or question in data/).
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `one-topic`. */
'use strict';
const cp = require('child_process');
const { ROOT, main, text } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const CU = require('./lib/curriculum.js');
const QG = require('./lib/qgen.js');
const SB = require('./lib/site-browser.js');

const TAX_RE = /const TAXONOMY = (\{[\s\S]*?\});\n/;
const FIXTURE = 'tools/fixtures/curriculum';
const ALEVEL = 'A-Level (outside the DfE KS1–GCSE lists)';

function headBudget(file) {
  try { return JSON.parse(cp.execFileSync('git', ['show', 'HEAD:' + file], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).budget; }
  catch (e) { return null; }
}
/* THE SUBJECT'S BUDGET: the first country file of it that gives one. */
const budgetOf = (E, k) => CU.ofSubject(E, k).find(e => e.T.budget != null) || null;
const subjects = E => Object.keys(CU.SUBJECTS).filter(k => CU.ofSubject(E, k).length);

function treeProblems(e, gen, bad, all) {
  const T = e.T, file = e.file, ids = new Set(), docs = T.docs || {}, LV = new Set(CU.levelsList(T)), st = CU.stmt(T), re = CU.codeRe(T);
  if (!CU.SUBJECTS[e.subject]) bad.push(file + ': "' + e.subject + '" is no subject (' + Object.keys(CU.SUBJECTS).join(', ') + ')');
  if (!Array.isArray(T.nodes) || !T.nodes.length) { bad.push(file + ': no nodes'); return ids; }
  const urlRe = new RegExp(T.doc_url || '^https://');
  if (!Object.keys(docs).length) bad.push(file + ': names no document');
  Object.keys(docs).forEach(x => { if (!urlRe.test(docs[x].url || '')) bad.push(file + ': document ' + x + ' has no address matching ' + urlRe.source); });
  T.nodes.forEach(n => { if (ids.has(n.id) || all.has(n.id)) bad.push(file + ': node ' + n.id + ' twice'); ids.add(n.id); all.add(n.id); });
  const X = CU.index(T), cited = new Set();
  T.nodes.forEach(n => {
    if (!n.id || !String(n.name || '').trim()) bad.push(file + ': node ' + (n.id || '?') + ' has no id or name');
    if (n.parent && !ids.has(n.parent)) bad.push(file + ': node ' + n.id + ': parent ' + n.parent + ' is no node');
    if (!(n.src || []).length) bad.push(file + ': node ' + n.id + ' (' + n.name + ') cites no document');
    (n.src || []).forEach(s => {
      if (!docs[s.doc]) bad.push(file + ': node ' + n.id + ': source document "' + s.doc + '" is none of the file\'s documents');
      if (!String(s.ref || '').trim()) bad.push(file + ': node ' + n.id + ': a source with no section or statement');
      if (st && s.doc === st.doc && re.test(s.ref)) { if (+s.ref.slice(1) > (st.counts || {})[s.ref[0]]) bad.push(file + ': node ' + n.id + ': ' + s.ref + ' is no statement'); if (!X.kids[n.id]) cited.add(s.ref); }
    });
    if (!X.kids[n.id]) { if (!(n.levels || []).length) bad.push(file + ': sub-topic ' + n.id + ' has no level'); (n.levels || []).forEach(l => { if (!LV.has(l)) bad.push(file + ': sub-topic ' + n.id + ': level "' + l + '" is none'); }); }
  });
  if (st) Object.keys(st.counts || {}).forEach(c => { for (let i = 1; i <= st.counts[c]; i++) if (!cited.has(c + i)) bad.push(file + ': statement ' + c + i + ' is cited by no sub-topic'); });
  ['ideas', 'set', 'topic', 'spec'].forEach(m => Object.keys(T[m] || {}).forEach(x => { if (!ids.has(T[m][x])) bad.push(file + ' ' + m + ' "' + x + '" -> ' + T[m][x] + ', no node'); }));
  const skills = new Set(((gen || {}).templates || []).map(t => t.id));
  Object.keys(T.templates || {}).forEach(node => {
    if (!ids.has(node)) bad.push(file + ' templates "' + node + '": no node');
    const list = [].concat(T.templates[node]);
    if (!list.length) bad.push(file + ' templates "' + node + '": no skill');
    list.forEach(id => { if (!skills.has(id)) bad.push(file + ' templates "' + node + '" -> ' + id + ', no template of data/settings/qgen.json'); });
  });
  if (T.gen && T.gen.set_prefix && !String(T.gen.set_prefix).startsWith(QG.SET_PREFIX)) bad.push(file + ': gen.set_prefix ' + T.gen.set_prefix + ' does not start ' + QG.SET_PREFIX);
  return ids;
}

function problems(d) {
  const bad = [], all = new Set(), E = d.entries;
  E.forEach(e => treeProblems(e, d.gen, bad, all));
  /* THE QUESTIONS: what the files give, worksheets named apart. */
  const copy = d.rows.map(r => Object.assign({}, r)), t = CU.assign(copy, E);
  let diff = 0;
  d.rows.forEach((r, i) => {
    const w = copy[i];
    if (String(r[CU.FIELD] || '') !== String(w[CU.FIELD] || '') && diff++ < 20) bad.push(r.row_id + ': dfe "' + (r[CU.FIELD] || '') + '", but the curriculum files give "' + (w[CU.FIELD] || '') + '" — run node tools/content.js qideas --apply');
    if (String(r.worksheet || '') !== String(w.worksheet || '') && diff++ < 20) bad.push(r.row_id + ': worksheet "' + (r.worksheet || '') + '", not its set\'s name "' + (w.worksheet || '') + '"');
    String(r[CU.FIELD] || '').split(/\s+/).filter(Boolean).forEach(id => { if (!all.has(id)) bad.push(r.row_id + ': dfe ' + id + ' is no node'); });
  });
  const m = TAX_RE.exec(d.engine), eng = m ? JSON.parse(m[1]) : {};
  subjects(E).forEach(k => {
    const c = t[k], b = budgetOf(E, k), tk = CU.SUBJECTS[k].tax, budget = b ? b.T.budget : 0;
    if (c.untaggedN > budget) bad.push(c.untaggedN + ' ' + k + ' questions with no curriculum node, over the budget of ' + budget);
    if (c.untaggedN < budget) bad.push(c.untaggedN + ' ' + k + ' questions with no curriculum node, under the budget of ' + budget + ' — lower it in ' + b.file);
    if (b && d.head[b.file] != null && budget > d.head[b.file]) bad.push('the ' + k + ' budget rose from ' + d.head[b.file] + ' to ' + budget + ' — it may only fall');
    if (JSON.stringify((d.tax[tk] || {}).dfe || {}) !== JSON.stringify(CU.forFind(k, E))) bad.push('taxonomy.json ' + tk + '.dfe is not the curriculum tree now — run node tools/content.js qideas --apply');
    if (JSON.stringify((eng[tk] || {}).dfe || {}) !== JSON.stringify((d.tax[tk] || {}).dfe || {})) bad.push('js/find-finder.js TAXONOMY.' + tk + '.dfe is not taxonomy.json\'s — run node tools/taxonomy.js');
  });
  fixture(d, bad);
  d.count = t;
  return bad;
}

/* A QUESTION'S FIND TOPICS, as js/find-aloud.js dfeNamesOf_ reads them: every node's path, broad → narrow, names once each. */
function findNames(row, tree) {
  const w = [];
  String(row[CU.FIELD] || '').split(/\s+/).filter(Boolean).forEach(id => { const p = []; for (let n = id; n && tree[n]; n = tree[n][1]) p.unshift(tree[n][0]); p.forEach(x => { if (!w.includes(x)) w.push(x); }); });
  return w;
}

/* ONE FILE IS A COUNTRY: the fixture beside the live files, in memory only. */
function fixture(d, bad) {
  const say = s => bad.push('fixture ' + FIXTURE + ': ' + s), F = d.fixture;
  if (!F.length) return say('no country file found');
  const ids = new Set(); d.entries.forEach(e => e.T.nodes.forEach(n => ids.add(n.id)));
  const fb = []; F.forEach(e => treeProblems(e, d.gen, fb, ids)); fb.forEach(s => say(s));
  const E2 = d.entries.concat(F);
  let live, both;
  try { live = QG.emit(d.gen, d.entries); both = QG.emit(d.gen, E2); } catch (x) { return say('emit: ' + x.message); }
  const liveIds = new Set(live.rows.map(r => r.row_id));
  /* EVERYTHING THE UK MAKES IS UNCHANGED. */
  const kept = both.rows.filter(r => liveIds.has(r.row_id));
  if (JSON.stringify(kept) !== JSON.stringify(live.rows)) say('adding it changed a live generated row');
  const added = both.rows.filter(r => !liveIds.has(r.row_id)), aq = added.filter(r => r.kind === 'question');
  const want = F.reduce((a, e) => a + Object.keys(e.T.templates || {}).reduce((b, n) => b + [].concat(e.T.templates[n]).length, 0), 0) * QG.SET_SIZE;
  if (aq.length !== want) say(aq.length + ' generated questions, not the ' + want + ' its skills make');
  const fnodes = new Set([].concat(...F.map(e => e.T.nodes.map(n => n.id))));
  aq.forEach(r => { if (!fnodes.has(r[CU.FIELD])) say(r.row_id + ' is not tagged with a fixture node'); });
  added.filter(r => r.kind === 'document').forEach(r => { if (!QG.setNode(r.paper_id, F)) say(r.paper_id + ' is read back as no fixture node'); });
  /* ITS QUESTIONS ARE TAGGED, AND THE UK'S TAGS STAY. */
  const rows = d.rows.map(r => Object.assign({}, r)).concat(added.map(r => Object.assign({}, r))), t2 = CU.assign(rows, E2);
  const base = d.rows.map(r => Object.assign({}, r)); CU.assign(base, d.entries);
  base.forEach((r, i) => { if (String(r[CU.FIELD] || '') !== String(rows[i][CU.FIELD] || '') && bad.length < 200) say(r.row_id + ': its tags changed when the fixture was added'); });
  /* FIND: the fixture's tree beside the UK's, the UK's unchanged; each of its questions answers its nodes' names. */
  F.forEach(e => {
    const tree = CU.forFind(e.subject, E2), ukTree = CU.forFind(e.subject, d.entries);
    Object.keys(ukTree).forEach(k => { if (JSON.stringify(tree[k]) !== JSON.stringify(ukTree[k])) say('Find\'s ' + e.subject + ' tree changed at ' + k); });
    e.T.nodes.forEach(n => { if (!tree[n.id]) say('Find has no topic for ' + n.id); });
    rows.filter(r => r.kind === 'question' && fnodes.has(r[CU.FIELD])).forEach(r => {
      const nm = findNames(r, tree);
      if (!nm.length || !e.T.nodes.some(n => n.name === nm[nm.length - 1])) say(r.row_id + ': Find shows [' + nm.join(', ') + '], not its fixture topic');
    });
    d.fixtureCount = { questions: aq.length, sets: added.length - aq.length, tagged: rows.filter(r => fnodes.has(r[CU.FIELD])).length, nodes: e.T.nodes.length, tagsUK: t2 };
  });
  /* NOTHING OF IT SHIPS. */
  if (d.entries.some(e => e.country === F[0].country)) say('a live country file has its country code');
  const pids = new Set(added.map(r => r.paper_id));
  if (d.rows.some(r => pids.has(r.paper_id) || fnodes.has(String(r[CU.FIELD] || '').split(/\s+/)[0]))) say('data/questions.json carries it');
  subjects(F).forEach(k => { const tk = CU.SUBJECTS[k].tax; if (Object.keys((d.tax[tk] || {}).dfe || {}).some(id => fnodes.has(id))) say('taxonomy.json carries it'); });
}

/* THE PAGE: every topic Find shows for a maths or science question is a curriculum node's name. */
async function page(brk) {
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => isQ_(x)) && typeof FACET_READ === 'object' });
  try {
    if (brk) await pg.evaluate(brk);
    return await pg.evaluate(() => {
      const D = {}, subs = [];
      Object.keys(TAXONOMY).forEach(k => { const t = TAXONOMY[k] || {}; if (t.dfe) { Object.assign(D, t.dfe); subs.push(...(t.subjects || [t.subject])); } });
      const names = new Set(Object.keys(D).map(k => D[k][0])), out = { bad: [], n: 0, shown: new Set(), tagged: 0 };
      stuffItemsAll_().filter(x => isQ_(x) && x.row && subs.includes(x.subject)).forEach(x => {
        out.n++;
        const v = [].concat(FACET_READ.topic.of(x) || []).filter(Boolean);
        if (v.length) out.tagged++;
        v.forEach(t => { out.shown.add(t); if (!names.has(t) && out.bad.length < 20) out.bad.push((x.row.row_id || x.key) + ': Find shows topic "' + t + '"' + (t === x.row.worksheet ? ', its worksheet\'s title' : '') + ', no curriculum topic'); });
      });
      return { bad: out.bad, n: out.n, shown: out.shown.size, tagged: out.tagged };
    });
  } finally { await pg.close(); }
}

function data() {
  const entries = CU.entries(), head = {};
  entries.forEach(e => { head[e.file] = headBudget(e.file); });
  return { rows: SD.json('data/questions.json'), entries, fixture: CU.entries(FIXTURE), gen: SD.json(QG.TABLE), tax: SD.json('data/settings/taxonomy.json'), engine: text('js/find-finder.js'), head };
}

const first = (d, f) => d.rows.find(r => r.kind === 'question' && f(r));
const tb = (d, k) => CU.ofSubject(d.entries, k)[0].T;
const BREAKS = [
  { name: 'a node citing nothing', d: d => { tb(d, 'maths').nodes[5].src = []; } },
  { name: 'a science node citing nothing', d: d => { tb(d, 'science').nodes[7].src = []; } },
  { name: 'a source in no listed document', d: d => { tb(d, 'science').nodes[6].src = [{ doc: 'bbc-bitesize', ref: 'Cells' }]; } },
  { name: 'a document off gov.uk', d: d => { const D = tb(d, 'maths').docs; D[Object.keys(D)[0]].url = 'https://example.org/'; } },
  { name: 'a GCSE statement uncited', d: d => { tb(d, 'maths').nodes.forEach(n => { n.src = n.src.filter(s => s.ref !== 'G23'); if (!n.src.length) n.src = [{ doc: 'gcse', ref: 'G22' }]; }); } },
  { name: 'a sub-topic with no level', d: d => { delete tb(d, 'science').nodes.find(n => n.levels).levels; } },
  { name: 'a level that is none', d: d => { tb(d, 'science').nodes.find(n => n.levels).levels = ['GCSE Foundation']; } },
  { name: 'a mapped template that is none', d: d => { const M = tb(d, 'maths').templates; M[Object.keys(M)[0]].push('no-such-skill'); } },
  { name: 'templates on a node that is none', d: d => { tb(d, 'maths').templates['dfe.ma.nothing'] = ['hcf']; } },
  { name: 'a question untagged', d: d => { delete first(d, r => /^dfe\.ma\./.test(r.dfe || '')).dfe; } },
  { name: 'a science question untagged', d: d => { delete first(d, r => /^dfe\.sc\./.test(r.dfe || '')).dfe; } },
  { name: 'a node by hand', d: d => { first(d, r => r.dfe && r.dfe !== 'dfe.sc.p.space.redshift').dfe = 'dfe.sc.p.space.redshift'; } },
  { name: 'a worksheet name dropped', d: d => { delete first(d, r => r.worksheet).worksheet; } },
  { name: 'untagged over budget', d: d => { tb(d, 'science').budget--; } },
  { name: 'the budget rising', d: d => { const b = budgetOf(d.entries, 'maths'); d.head[b.file] = b.T.budget - 1; } },
  { name: 'a stale tree in Find', d: d => { const t = JSON.parse(JSON.stringify(d.tax)); const k = Object.keys(t.Science.dfe)[3]; t.Science.dfe[k] = ['Stale', t.Science.dfe[k][1]]; d.tax = t; } },
  { name: 'a fixture node citing nothing', d: d => { d.fixture[0].T.nodes[1].src = []; } },
  { name: 'a fixture skill that is none', d: d => { const M = d.fixture[0].T.templates; M[Object.keys(M)[0]] = ['no-such-skill']; } },
  { name: 'a fixture node id the UK has', d: d => { d.fixture[0].T.nodes[1].id = tb(d, 'maths').nodes[0].id; } },
  { name: 'a fixture that is gone', d: d => { d.fixture = []; } },
  { name: 'the fixture shipped', d: d => { d.tax = JSON.parse(JSON.stringify(d.tax)); d.tax.Maths.dfe['xx.ma'] = ['Mathematics (XX)', '']; } },
  { name: 'Find showing a worksheet title', page: () => { const of = FACET_READ.topic.of; FACET_READ.topic.of = x => (x && x.row && x.row.worksheet ? [x.row.worksheet + ' (worksheet)'] : of(x)); } },
  { name: 'Find showing a science source topic', page: () => { const of = FACET_READ.topic.of; FACET_READ.topic.of = x => (x && x.subject === 'Biology' && x.row && x.row.dfe ? ['Cell Biology (source)'] : of(x)); } },
];

async function run() {
  const d = data(), bad = problems(d);
  if (process.argv.indexOf('--prove') > 0) {
    if (bad.length) throw new Error('one-curriculum --prove: the unbroken site already fails (' + bad[0] + ')');
    const missed = [];
    for (const b of BREAKS) {
      if (b.d) { const x = data(); b.d(x); if (!problems(x).length) missed.push(b.name); }
      else { const p = await page(b.page); if (!p.bad.length) missed.push(b.name); }
    }
    await SB.done();
    if (missed.length) throw new Error('one-curriculum --prove: missed ' + missed.join(', '));
    console.log('one-curriculum --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  const p = await page();
  await SB.done();
  const all = bad.concat(p.bad);
  if (!p.n) all.push('the page has no maths or science question to ask the topic of');
  if (all.length) { console.error('one-curriculum: ' + all.length + ' problem(s):\n  ' + all.slice(0, 40).join('\n  ')); throw new Error('one-curriculum check failed'); }
  const line = subjects(d.entries).map(k => {
    const c = d.count[k], b = budgetOf(d.entries, k);
    const per = CU.ofSubject(d.entries, k).map(e => {
      const T = e.T, X = CU.index(T), roots = T.nodes.filter(n => !n.parent).length, leaves = T.nodes.filter(n => !X.kids[n.id]);
      const lv = CU.levelsList(T).map(l => l + ' ' + leaves.filter(n => (n.levels || []).includes(l)).length).join(', ');
      return e.country + ' ' + T.nodes.length + ' nodes (' + roots + ' strands, ' + (T.nodes.length - leaves.length - roots) + ' topics, ' + leaves.length + ' sub-topics: ' + lv + ')';
    }).join(', ');
    return k + ': ' + per + ', every one citing its document; ' + c.tagged + ' of ' + c.questions + ' questions tagged (' + (100 * c.tagged / c.questions).toFixed(1) + '%; '
      + (100 * c.tagged / (c.questions - (c.untagged[ALEVEL] || 0))).toFixed(1) + '% of KS1–GCSE), ' + c.untaggedN + ' not (budget ' + (b ? b.T.budget : 0) + '): '
      + Object.keys(c.untagged).map(u => c.untagged[u] + ' ' + u).join('; ');
  });
  const f = d.fixtureCount || {};
  console.log('one-curriculum: ' + d.entries.length + ' country file(s) | ' + line.join(' | ') + ' | in Find ' + p.tagged + ' of ' + p.n + ' maths and science questions answer '
    + p.shown + ' topics, every one a curriculum topic | one file is a country: ' + FIXTURE + ' (' + f.nodes + ' nodes) made ' + f.questions + ' questions in ' + f.sets
    + ' sets, tagged and in Find, every UK row, tag and topic unchanged, none of it shipped');
}

main(module, run);
module.exports = { problems, run };
