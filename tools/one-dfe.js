#!/usr/bin/env node
/* @family. — tools/one-dfe.js THE GOVERNMENT-TREE CHECK (rule 1.75, owner 24–25 Nov: "the @family library's single source of truth is the UK
   government spec"). A child picking a maths or science topic in Find must see the DfE's own topics, broad → narrow, with every source's
   questions on one thing under one topic, and never a worksheet's title as a topic. Counted site-wide, per subject (tools/lib/dfe.js):
     - every node of data/settings/dfe-<subject>.json has an id, a name, a parent in the tree and at least one source line in a DfE document the
       table names (a gov.uk address); maths: a GCSE statement code is a real one, and every GCSE statement (N1–S6) is cited by a sub-topic;
     - every sub-topic has its levels, each one of the table's levels;
     - every question's `dfe` is the one the table gives (never by hand), and a worksheet question's `worksheet` is its set's name; the
       untagged are exactly the table's `budget`, which may only fall; the coverage is printed;
     - taxonomy.json <Subject>.dfe is the tree now, and js/find-finder.js TAXONOMY carries it;
     - in the page, every topic Find shows for a maths or science question is a DfE node name (never a worksheet title).
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `one-topic`. */
'use strict';
const cp = require('child_process');
const { ROOT, main, text } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const DF = require('./lib/dfe.js');
const SB = require('./lib/site-browser.js');

const TAX_RE = /const TAXONOMY = (\{[\s\S]*?\});\n/;
const GCSE = { N: 16, A: 25, R: 16, G: 25, P: 9, S: 6 };
const KEYS = Object.keys(DF.SUBJECTS);
const ALEVEL = 'A-Level (outside the DfE KS1–GCSE lists)';

function headBudget(k) {
  try { return JSON.parse(cp.execFileSync('git', ['show', 'HEAD:' + DF.SUBJECTS[k].table], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).budget; }
  catch (e) { return null; }
}

function treeProblems(k, T, bad) {
  const file = DF.SUBJECTS[k].table, ids = new Set(), docs = T.docs || {}, LV = new Set(DF.levelsList(T));
  Object.keys(docs).forEach(x => { if (!/^https:\/\/www\.gov\.uk\//.test(docs[x].url || '')) bad.push(file + ': document ' + x + ' has no gov.uk address'); });
  T.nodes.forEach(n => { if (ids.has(n.id)) bad.push('node ' + n.id + ' twice'); ids.add(n.id); });
  const X = DF.index(T), cited = new Set();
  T.nodes.forEach(n => {
    if (!n.id || !String(n.name || '').trim()) bad.push('node ' + (n.id || '?') + ' has no id or name');
    if (n.parent && !ids.has(n.parent)) bad.push('node ' + n.id + ': parent ' + n.parent + ' is no node');
    if (!(n.src || []).length) bad.push('node ' + n.id + ' (' + n.name + ') cites no DfE source');
    (n.src || []).forEach(s => {
      if (!docs[s.doc]) bad.push('node ' + n.id + ': source document "' + s.doc + '" is none of the DfE documents');
      if (!String(s.ref || '').trim()) bad.push('node ' + n.id + ': a source with no section or statement');
      if (s.doc === 'gcse' && DF.CODE.test(s.ref)) { if (+s.ref.slice(1) > GCSE[s.ref[0]]) bad.push('node ' + n.id + ': GCSE ' + s.ref + ' is no statement'); if (!X.kids[n.id]) cited.add(s.ref); }
    });
    if (!X.kids[n.id]) { if (!(n.levels || []).length) bad.push('sub-topic ' + n.id + ' has no level'); (n.levels || []).forEach(l => { if (!LV.has(l)) bad.push('sub-topic ' + n.id + ': level "' + l + '" is none'); }); }
  });
  if (k === 'maths') Object.keys(GCSE).forEach(c => { for (let i = 1; i <= GCSE[c]; i++) if (!cited.has(c + i)) bad.push('GCSE statement ' + c + i + ' is cited by no sub-topic'); });
  ['ideas', 'set', 'topic', 'spec'].forEach(m => Object.keys(T[m] || {}).forEach(x => { if (!ids.has(T[m][x])) bad.push(file + ' ' + m + ' "' + x + '" -> ' + T[m][x] + ', no node'); }));
  return ids;
}

function problems(d) {
  const bad = [], ids = {};
  KEYS.forEach(k => { ids[k] = treeProblems(k, d.tables[k], bad); });
  /* THE QUESTIONS: what the tables give, worksheets named apart. */
  const copy = d.rows.map(r => Object.assign({}, r)), t = DF.assign(copy, d.tables), all = new Set([].concat(...KEYS.map(k => [...ids[k]])));
  let diff = 0;
  d.rows.forEach((r, i) => {
    const w = copy[i];
    if (String(r.dfe || '') !== String(w.dfe || '') && diff++ < 20) bad.push(r.row_id + ': dfe "' + (r.dfe || '') + '", but the DfE table gives "' + (w.dfe || '') + '" — run node tools/content.js qideas --apply');
    if (String(r.worksheet || '') !== String(w.worksheet || '') && diff++ < 20) bad.push(r.row_id + ': worksheet "' + (r.worksheet || '') + '", not its set\'s name "' + (w.worksheet || '') + '"');
    String(r.dfe || '').split(/\s+/).filter(Boolean).forEach(id => { if (!all.has(id)) bad.push(r.row_id + ': dfe ' + id + ' is no node'); });
  });
  const m = TAX_RE.exec(d.engine), eng = m ? JSON.parse(m[1]) : {};
  KEYS.forEach(k => {
    const T = d.tables[k], c = t[k], file = DF.SUBJECTS[k].table, tk = DF.SUBJECTS[k].tax;
    if (c.untaggedN > T.budget) bad.push(c.untaggedN + ' ' + k + ' questions with no DfE node, over the budget of ' + T.budget);
    if (c.untaggedN < T.budget) bad.push(c.untaggedN + ' ' + k + ' questions with no DfE node, under the budget of ' + T.budget + ' — lower it in ' + file);
    if (d.head[k] != null && T.budget > d.head[k]) bad.push('the ' + k + ' budget rose from ' + d.head[k] + ' to ' + T.budget + ' — it may only fall');
    if (JSON.stringify((d.tax[tk] || {}).dfe || {}) !== JSON.stringify(DF.forFind(T))) bad.push('taxonomy.json ' + tk + '.dfe is not the DfE tree now — run node tools/content.js qideas --apply');
    if (JSON.stringify((eng[tk] || {}).dfe || {}) !== JSON.stringify((d.tax[tk] || {}).dfe || {})) bad.push('js/find-finder.js TAXONOMY.' + tk + '.dfe is not taxonomy.json\'s — run node tools/taxonomy.js');
  });
  d.count = t;
  return bad;
}

/* THE PAGE: every topic Find shows for a maths or science question is a DfE node's name. */
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
        v.forEach(t => { out.shown.add(t); if (!names.has(t) && out.bad.length < 20) out.bad.push((x.row.row_id || x.key) + ': Find shows topic "' + t + '"' + (t === x.row.worksheet ? ', its worksheet\'s title' : '') + ', no DfE topic'); });
      });
      return { bad: out.bad, n: out.n, shown: out.shown.size, tagged: out.tagged };
    });
  } finally { await pg.close(); }
}

function data() {
  const tables = {}, head = {};
  KEYS.forEach(k => { tables[k] = SD.json(DF.SUBJECTS[k].table); head[k] = headBudget(k); });
  return { rows: SD.json('data/questions.json'), tables, tax: SD.json('data/settings/taxonomy.json'), engine: text('js/find-finder.js'), head };
}

const first = (d, f) => d.rows.find(r => r.kind === 'question' && f(r));
const BREAKS = [
  { name: 'a node citing nothing', d: d => { d.tables.maths.nodes[5].src = []; } },
  { name: 'a science node citing nothing', d: d => { d.tables.science.nodes[7].src = []; } },
  { name: 'a source in no DfE document', d: d => { d.tables.science.nodes[6].src = [{ doc: 'bbc-bitesize', ref: 'Cells' }]; } },
  { name: 'a GCSE statement uncited', d: d => { d.tables.maths.nodes.forEach(n => { n.src = n.src.filter(s => s.ref !== 'G23'); if (!n.src.length) n.src = [{ doc: 'gcse', ref: 'G22' }]; }); } },
  { name: 'a sub-topic with no level', d: d => { delete d.tables.science.nodes.find(n => n.levels).levels; } },
  { name: 'a level that is none', d: d => { d.tables.science.nodes.find(n => n.levels).levels = ['GCSE Foundation']; } },
  { name: 'a question untagged', d: d => { delete first(d, r => /^dfe\.ma\./.test(r.dfe || '')).dfe; } },
  { name: 'a science question untagged', d: d => { delete first(d, r => /^dfe\.sc\./.test(r.dfe || '')).dfe; } },
  { name: 'a node by hand', d: d => { first(d, r => r.dfe && r.dfe !== 'dfe.sc.p.space.redshift').dfe = 'dfe.sc.p.space.redshift'; } },
  { name: 'a worksheet name dropped', d: d => { delete first(d, r => r.worksheet).worksheet; } },
  { name: 'untagged over budget', d: d => { d.tables.science.budget--; } },
  { name: 'the budget rising', d: d => { d.head.maths = d.tables.maths.budget - 1; } },
  { name: 'a stale tree in Find', d: d => { const t = JSON.parse(JSON.stringify(d.tax)); const k = Object.keys(t.Science.dfe)[3]; t.Science.dfe[k] = ['Stale', t.Science.dfe[k][1]]; d.tax = t; } },
  { name: 'Find showing a worksheet title', page: () => { const of = FACET_READ.topic.of; FACET_READ.topic.of = x => (x && x.row && x.row.worksheet ? [x.row.worksheet + ' (worksheet)'] : of(x)); } },
  { name: 'Find showing a science source topic', page: () => { const of = FACET_READ.topic.of; FACET_READ.topic.of = x => (x && x.subject === 'Biology' && x.row && x.row.dfe ? ['Cell Biology (source)'] : of(x)); } },
];

async function run() {
  const d = data(), bad = problems(d);
  if (process.argv.indexOf('--prove') > 0) {
    if (bad.length) throw new Error('one-dfe --prove: the unbroken site already fails (' + bad[0] + ')');
    const missed = [];
    for (const b of BREAKS) {
      if (b.d) { const x = data(); b.d(x); if (!problems(x).length) missed.push(b.name); }
      else { const p = await page(b.page); if (!p.bad.length) missed.push(b.name); }
    }
    await SB.done();
    if (missed.length) throw new Error('one-dfe --prove: missed ' + missed.join(', '));
    console.log('one-dfe --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  const p = await page();
  await SB.done();
  const all = bad.concat(p.bad);
  if (!p.n) all.push('the page has no maths or science question to ask the topic of');
  if (all.length) { console.error('one-dfe: ' + all.length + ' problem(s):\n  ' + all.slice(0, 40).join('\n  ')); throw new Error('one-dfe check failed'); }
  const line = KEYS.map(k => {
    const T = d.tables[k], c = d.count[k], X = DF.index(T), roots = T.nodes.filter(n => !n.parent).length, leaves = T.nodes.filter(n => !X.kids[n.id]);
    const lv = DF.levelsList(T).map(l => l + ' ' + leaves.filter(n => (n.levels || []).includes(l)).length).join(', ');
    return k + ': ' + T.nodes.length + ' DfE nodes (' + roots + ' strands, ' + (T.nodes.length - leaves.length - roots) + ' topics, ' + leaves.length + ' sub-topics: ' + lv + '), every one citing the DfE; '
      + c.tagged + ' of ' + c.questions + ' questions tagged (' + (100 * c.tagged / c.questions).toFixed(1) + '%; ' + (100 * c.tagged / (c.questions - (c.untagged[ALEVEL] || 0))).toFixed(1) + '% of KS1–GCSE), '
      + c.untaggedN + ' not (budget ' + T.budget + '): ' + Object.keys(c.untagged).map(u => c.untagged[u] + ' ' + u).join('; ');
  });
  console.log('one-dfe: ' + line.join(' | ') + ' | in Find ' + p.tagged + ' of ' + p.n + ' maths and science questions answer ' + p.shown + ' topics, every one a DfE topic');
}

main(module, run);
module.exports = { problems, run };
