#!/usr/bin/env node
/* @family. — tools/one-topic.js THE ONE-TOPIC-TREE CHECK (rule 1.75, owner queue item 7, 24 Nov: "questions point at the idea they test, not a
   source's topic name"). A child picking "Mixed numbers" in Find saw Corbettmaths' "Top Heavy Fractions Mixed Numbers" and 1st Class Maths'
   own name as two topics for one idea. Counted site-wide over data/questions.json's maths questions (tools/lib/qideas.js):
     - every maths question has exactly one `idea_id`, an idea of the maths cards (data/textbooks.json), and it is the one
       data/settings/question-ideas.json gives it (written by `node tools/content.js qideas`, never by hand); no other row wears one;
     - the unmapped are exactly the table's `budget`, which may only fall (never above the committed one);
     - data/settings/taxonomy.json Maths.ideaNames is the cards' idea names now, and js/find-finder.js TAXONOMY carries them;
     - in the page, Find's topic question answers each maths question with its idea's name and nothing else (FACET_READ.topic).
   `--prove` breaks each rule and fails unless every break is caught. Run by tools/build.js after `bundle`. */
'use strict';
const cp = require('child_process');
const { ROOT, main, text } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const QI = require('./lib/qideas.js');
const SB = require('./lib/site-browser.js');

const TAX_RE = /const TAXONOMY = (\{[\s\S]*?\});\n/;

/* THE COMMITTED BUDGET (HEAD), the ceiling a budget may never rise above. */
function headBudget() {
  try { return JSON.parse(cp.execFileSync('git', ['show', 'HEAD:' + QI.TABLE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).budget; }
  catch (e) { return null; }
}

/* THE DATA: rows, the table, the cards' names, the taxonomy and the engine's copy; `w` a break applied to them. */
function problems(d) {
  const bad = [], T = d.table, names = QI.names(d.tb), ids = new Set(Object.keys(names));
  const qs = QI.mathsQuestions(d.rows), mq = new Set(qs);
  let unmapped = 0;
  qs.forEach(r => {
    const want = QI.ideaOf(r, T), have = r.idea_id == null ? '' : String(r.idea_id);
    if (have.split(/[\s,]+/).filter(Boolean).length > 1) bad.push(r.row_id + ': more than one idea (' + have + ')');
    if (have && !ids.has(have)) bad.push(r.row_id + ': idea_id ' + have + ' is no idea of the maths cards');
    if (have !== want) bad.push(r.row_id + ': idea_id "' + have + '", but ' + QI.TABLE + ' gives "' + want + '" — run node tools/content.js qideas --apply');
    if (!have) unmapped++;
  });
  d.rows.forEach(r => { if (!mq.has(r) && r.idea_id != null) bad.push(r.row_id + ': not a maths question, and wears idea_id ' + r.idea_id); });
  ['set', 'topic'].forEach(k => Object.keys(T[k] || {}).forEach(x => { if (!ids.has(T[k][x])) bad.push(QI.TABLE + ' ' + k + ' "' + x + '" -> ' + T[k][x] + ', no idea of the maths cards'); }));
  if (unmapped > T.budget) bad.push(unmapped + ' maths questions unmapped, over the budget of ' + T.budget);
  if (unmapped < T.budget) bad.push(unmapped + ' maths questions unmapped, under the budget of ' + T.budget + ' — lower it to ' + unmapped + ' in ' + QI.TABLE);
  if (d.head != null && T.budget > d.head) bad.push('the budget rose from ' + d.head + ' to ' + T.budget + ' — it may only fall');
  const have = (d.tax.Maths || {}).ideaNames || {};
  if (JSON.stringify(have) !== JSON.stringify(names)) bad.push('taxonomy.json Maths.ideaNames is not the cards\' idea names now — run node tools/content.js qideas --apply');
  const m = TAX_RE.exec(d.engine), eng = m ? ((JSON.parse(m[1]).Maths || {}).ideaNames || {}) : {};
  if (JSON.stringify(eng) !== JSON.stringify(have)) bad.push('js/find-finder.js TAXONOMY.Maths.ideaNames is not taxonomy.json\'s — run node tools/taxonomy.js');
  d.count = { questions: qs.length, mapped: qs.length - unmapped, unmapped, ideas: new Set(qs.map(r => r.idea_id).filter(Boolean)).size,
    sourceTopics: new Set([].concat(...qs.map(r => QI.atoms(r.topics)))).size };
  return bad;
}

/* THE PAGE: Find's topic answers for every maths question are exactly its idea's name. */
async function page(brk) {
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => isQ_(x)) && typeof FACET_READ === 'object' });
  try {
    if (brk) await pg.evaluate(brk);
    return await pg.evaluate(() => {
      const names = (TAXONOMY.Maths || {}).ideaNames || {}, by = new Set(Object.values(names)), out = { bad: [], shown: new Set(), n: 0 };
      stuffItemsAll_().filter(x => isQ_(x) && x.row && x.subject === 'Maths').forEach(x => {
        out.n++;
        const v = [].concat(FACET_READ.topic.of(x) || []).filter(Boolean), want = names[x.row.idea_id];
        v.forEach(t => out.shown.add(t));
        if (want ? v.length !== 1 || v[0] !== want : v.length) out.bad.push((x.row.row_id || x.key) + ': Find\'s topic is [' + v.join(', ') + '], not ' + (want || 'none'));
        else v.filter(t => !by.has(t)).forEach(t => out.bad.push((x.row.row_id || x.key) + ': topic "' + t + '" is no idea name'));
      });
      return { bad: out.bad.slice(0, 20), shown: out.shown.size, n: out.n };
    });
  } finally { await pg.close(); }
}

function data() {
  return { rows: SD.json('data/questions.json'), tb: SD.json('data/textbooks.json'), table: SD.json(QI.TABLE), tax: SD.json('data/settings/taxonomy.json'),
    engine: text('js/find-finder.js'), head: headBudget() };
}

/* THE BREAKS --prove makes. */
const BREAKS = [
  { name: 'an idea dropped', d: d => { delete QI.mathsQuestions(d.rows).find(r => r.idea_id).idea_id; } },
  { name: 'an idea that is not one', d: d => { QI.mathsQuestions(d.rows).find(r => r.idea_id).idea_id = 'ma.num.no-such-idea'; } },
  { name: 'two ideas', d: d => { const r = QI.mathsQuestions(d.rows).find(r => r.idea_id); r.idea_id += ', ma.num.rounding'; } },
  { name: 'an idea by hand', d: d => { const r = QI.mathsQuestions(d.rows).find(r => r.idea_id && r.idea_id !== 'ma.num.rounding'); r.idea_id = 'ma.num.rounding'; } },
  { name: 'an English question with an idea', d: d => { const e = new Set(d.rows.filter(r => r.kind === 'document' && r.subject !== 'Maths').map(r => r.paper_id));
    d.rows.find(r => r.kind === 'question' && e.has(r.paper_id)).idea_id = 'ma.num.rounding'; } },
  { name: 'unmapped over budget', d: d => { d.table = Object.assign({}, d.table, { budget: d.table.budget - 1 }); } },
  { name: 'the budget rising', d: d => { d.head = d.table.budget - 1; } },
  { name: 'a stale idea name', d: d => { const t = JSON.parse(JSON.stringify(d.tax)); t.Maths.ideaNames[Object.keys(t.Maths.ideaNames)[0]] = 'Stale'; d.tax = t; } },
  { name: 'Find showing a source topic', page: () => { FACET_READ.topic.of = x => topicAtoms_(x && x.row && x.row.topics); } },
];

async function run() {
  const d = data(), bad = problems(d);
  if (process.argv.indexOf('--prove') > 0) {
    if (bad.length) throw new Error('one-topic --prove: the unbroken site already fails (' + bad[0] + ')');
    const missed = [];
    for (const b of BREAKS) {
      if (b.d) { const x = data(); b.d(x); if (!problems(x).length) missed.push(b.name); }
      else { const p = await page(b.page); if (!p.bad.length) missed.push(b.name); }
    }
    await SB.done();
    if (missed.length) throw new Error('one-topic --prove: missed ' + missed.join(', '));
    console.log('one-topic --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  const p = await page();
  await SB.done();
  const all = bad.concat(p.bad);
  if (!p.n) all.push('the page has no maths question to ask the topic of');
  if (all.length) { console.error('one-topic: ' + all.length + ' problem(s):\n  ' + all.slice(0, 40).join('\n  ')); throw new Error('one-topic check failed'); }
  const c = d.count;
  console.log('one-topic: ' + c.questions + ' maths questions, ' + c.mapped + ' pointing at one idea, ' + c.unmapped + ' unmapped (budget ' + d.table.budget
    + '); ' + c.sourceTopics + ' source topic names became ' + c.ideas + ' ideas; in Find ' + p.n + ' maths questions answer ' + p.shown + ' topics, every one an idea name');
}

main(module, run);
module.exports = { problems, run };
