#!/usr/bin/env node
/* @family. — tools/one-dfe.js THE GOVERNMENT-TREE CHECK (rule 1.75, owner 24–25 Nov: "the @family library's single source of truth is the UK
   government spec"). A child picking a maths topic in Find must see the DfE's own topics, broad → narrow, with Corbettmaths, First Class Maths
   and AQA questions on one thing under one topic, and never a worksheet's title as a topic. Counted site-wide (tools/lib/dfe.js):
     - every node of data/settings/dfe-maths.json has an id, a name, a parent in the tree and at least one source line in a DfE document the
       table names (a gov.uk address); a GCSE statement code is a real one, and every GCSE statement (N1–S6) is cited by a sub-topic;
     - every sub-topic has its levels (KS1, KS2, KS3, GCSE Foundation, GCSE Higher);
     - every maths question's `dfe` is the one the table gives (never by hand), and a worksheet question's `worksheet` is its set's name; the
       untagged are exactly the table's `budget`, which may only fall; the coverage is printed;
     - taxonomy.json Maths.dfe is the tree now, and js/find-finder.js TAXONOMY carries it;
     - in the page, every topic Find shows for a maths question is a DfE node name (never a worksheet title).
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `one-topic`. */
'use strict';
const cp = require('child_process');
const { ROOT, main, text } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const DF = require('./lib/dfe.js');
const SB = require('./lib/site-browser.js');

const TAX_RE = /const TAXONOMY = (\{[\s\S]*?\});\n/;
const GCSE = { N: 16, A: 25, R: 16, G: 25, P: 9, S: 6 };
const LEVELS = new Set(DF.LEVELS);

function headBudget() {
  try { return JSON.parse(cp.execFileSync('git', ['show', 'HEAD:' + DF.TABLE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).budget; }
  catch (e) { return null; }
}

function problems(d) {
  const bad = [], T = d.table, ids = new Set(), docs = T.docs || {};
  Object.keys(docs).forEach(k => { if (!/^https:\/\/www\.gov\.uk\//.test(docs[k].url || '')) bad.push('document ' + k + ' has no gov.uk address'); });
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
    if (!X.kids[n.id]) { if (!(n.levels || []).length) bad.push('sub-topic ' + n.id + ' has no level'); (n.levels || []).forEach(l => { if (!LEVELS.has(l)) bad.push('sub-topic ' + n.id + ': level "' + l + '" is none'); }); }
  });
  Object.keys(GCSE).forEach(k => { for (let i = 1; i <= GCSE[k]; i++) if (!cited.has(k + i)) bad.push('GCSE statement ' + k + i + ' is cited by no sub-topic'); });
  ['ideas', 'set', 'topic'].forEach(k => Object.keys(T[k] || {}).forEach(x => { if (!ids.has(T[k][x])) bad.push(DF.TABLE + ' ' + k + ' "' + x + '" -> ' + T[k][x] + ', no node'); }));
  /* THE QUESTIONS: what the table gives, worksheets named apart. */
  const copy = d.rows.map(r => Object.assign({}, r)), t = DF.assign(copy, T);
  let diff = 0;
  d.rows.forEach((r, i) => {
    const w = copy[i];
    if (String(r.dfe || '') !== String(w.dfe || '') && diff++ < 20) bad.push(r.row_id + ': dfe "' + (r.dfe || '') + '", but ' + DF.TABLE + ' gives "' + (w.dfe || '') + '" — run node tools/content.js qideas --apply');
    if (String(r.worksheet || '') !== String(w.worksheet || '') && diff++ < 20) bad.push(r.row_id + ': worksheet "' + (r.worksheet || '') + '", not its set\'s name "' + (w.worksheet || '') + '"');
    String(r.dfe || '').split(/\s+/).filter(Boolean).forEach(id => { if (!ids.has(id)) bad.push(r.row_id + ': dfe ' + id + ' is no node'); });
  });
  if (t.untaggedN > T.budget) bad.push(t.untaggedN + ' maths questions with no DfE node, over the budget of ' + T.budget);
  if (t.untaggedN < T.budget) bad.push(t.untaggedN + ' maths questions with no DfE node, under the budget of ' + T.budget + ' — lower it in ' + DF.TABLE);
  if (d.head != null && T.budget > d.head) bad.push('the budget rose from ' + d.head + ' to ' + T.budget + ' — it may only fall');
  const want = JSON.stringify(DF.forFind(T));
  if (JSON.stringify((d.tax.Maths || {}).dfe || {}) !== want) bad.push('taxonomy.json Maths.dfe is not the DfE tree now — run node tools/content.js qideas --apply');
  const m = TAX_RE.exec(d.engine);
  if (JSON.stringify(m ? ((JSON.parse(m[1]).Maths || {}).dfe || {}) : {}) !== JSON.stringify((d.tax.Maths || {}).dfe || {})) bad.push('js/find-finder.js TAXONOMY.Maths.dfe is not taxonomy.json\'s — run node tools/taxonomy.js');
  d.count = t;
  return bad;
}

/* THE PAGE: every topic Find shows for a maths question is a DfE node's name; none is a worksheet's title that is not also one. */
async function page(brk) {
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => isQ_(x)) && typeof FACET_READ === 'object' });
  try {
    if (brk) await pg.evaluate(brk);
    return await pg.evaluate(() => {
      const D = (TAXONOMY.Maths || {}).dfe || {}, names = new Set(Object.keys(D).map(k => D[k][0])), out = { bad: [], n: 0, shown: new Set(), tagged: 0 };
      stuffItemsAll_().filter(x => isQ_(x) && x.row && x.subject === 'Maths').forEach(x => {
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
  return { rows: SD.json('data/questions.json'), table: SD.json(DF.TABLE), tax: SD.json('data/settings/taxonomy.json'), engine: text('js/find-finder.js'), head: headBudget() };
}

const first = (d, f) => d.rows.find(r => r.kind === 'question' && f(r));
const BREAKS = [
  { name: 'a node citing nothing', d: d => { d.table.nodes[5].src = []; } },
  { name: 'a source in no DfE document', d: d => { d.table.nodes[6].src = [{ doc: 'corbettmaths', ref: 'Fractions' }]; } },
  { name: 'a GCSE statement uncited', d: d => { d.table.nodes.forEach(n => { n.src = n.src.filter(s => s.ref !== 'G23'); if (!n.src.length) n.src = [{ doc: 'gcse', ref: 'G22' }]; }); } },
  { name: 'a sub-topic with no level', d: d => { delete d.table.nodes.find(n => n.levels).levels; } },
  { name: 'a question untagged', d: d => { delete first(d, r => r.dfe).dfe; } },
  { name: 'a node by hand', d: d => { first(d, r => r.dfe && r.dfe !== 'dfe.ma.n.acc.round').dfe = 'dfe.ma.n.acc.round'; } },
  { name: 'a worksheet name dropped', d: d => { delete first(d, r => r.worksheet).worksheet; } },
  { name: 'untagged over budget', d: d => { d.table.budget--; } },
  { name: 'the budget rising', d: d => { d.head = d.table.budget - 1; } },
  { name: 'a stale tree in Find', d: d => { const t = JSON.parse(JSON.stringify(d.tax)); const k = Object.keys(t.Maths.dfe)[3]; t.Maths.dfe[k] = ['Stale', t.Maths.dfe[k][1]]; d.tax = t; } },
  { name: 'Find showing a worksheet title', page: () => { const of = FACET_READ.topic.of; FACET_READ.topic.of = x => (x && x.row && x.row.worksheet ? [x.row.worksheet + ' (worksheet)'] : of(x)); } },
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
  if (!p.n) all.push('the page has no maths question to ask the topic of');
  if (all.length) { console.error('one-dfe: ' + all.length + ' problem(s):\n  ' + all.slice(0, 40).join('\n  ')); throw new Error('one-dfe check failed'); }
  const c = d.count, T = d.table, X = DF.index(T), leaves = T.nodes.filter(n => !X.kids[n.id]), by = {};
  DF.LEVELS.forEach(l => { by[l] = leaves.filter(n => (n.levels || []).includes(l)).length; });
  console.log('one-dfe: ' + T.nodes.length + ' DfE nodes (' + T.nodes.filter(n => !n.parent).length + ' strands, ' + (T.nodes.length - leaves.length - T.nodes.filter(n => !n.parent).length)
    + ' topics, ' + leaves.length + ' sub-topics: ' + DF.LEVELS.map(l => l + ' ' + by[l]).join(', ') + '), every one citing the DfE; ' + c.tagged + ' of ' + c.questions + ' maths questions tagged ('
    + (100 * c.tagged / c.questions).toFixed(1) + '%; ' + (100 * c.tagged / (c.questions - (c.untagged['A-Level (outside the DfE KS1–GCSE lists)'] || 0))).toFixed(1) + '% of KS1–GCSE), ' + c.untaggedN + ' not (budget ' + T.budget + '): '
    + Object.keys(c.untagged).map(k => c.untagged[k] + ' ' + k).join('; ') + '; in Find ' + p.tagged + ' of ' + p.n + ' maths questions answer ' + p.shown + ' topics, every one a DfE topic');
}

main(module, run);
module.exports = { problems, run };
