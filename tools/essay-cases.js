#!/usr/bin/env node
/* @family. — tools/essay-cases.js THE LEVELS MARKER AGAINST THE EXAMINERS (rule 1.33, 1.75; queue ESSAYS, DISTILLED, 20 Nov): every AQA 8700
   exemplar with a known examiner level (data-private/essay-exemplars.json: mark-scheme Indicative Standards and the 2026 answers and
   commentaries; AQA's copyright, so private) is marked by the one marker (`mark_` through `rule: levels`, js/find-marking.js), loaded in a vm
   as tools/validate-questions.js loads the app, against its row's own key and its paper's extract. Prints exact and within-one-level agreement
   and the mean mark difference (the examiner mark taken as the middle of the level), site-wide and per question type; fails the build if
   within-one-level agreement falls below 80%. Without the private files (a CI checkout) it says so and passes. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const VQ = require('./validate-questions.js');
const ROOT = path.join(__dirname, '..');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
const FLOOR = 0.8;

function run() {
  const ex = read('data-private/essay-exemplars.json'), ins = read('data-private/inserts.json');
  if (!ex || !ins) { console.log('essay-cases: no private exemplars here, not checked'); return null; }
  const insA = Array.isArray(ins) ? ins : Object.values(ins);
  const rows = new Map(VQ.rowsOf().map(r => [r.row_id, r]));
  const { ctx, call } = VQ.appCode();
  ctx.DATA.wordFreq = (read('data/word-freq.json') || {}).words || [];
  const res = [], miss = [];
  for (const e of ex.exemplars || []) {
    const r = rows.get(e.row);
    if (!r || !/rule:\s*levels\b/i.test(String(r.accept || ''))) { miss.push(e.id); continue; }
    const it = insA.find(i => i.id === 'INS-AQA-8700-' + r.paper_id);
    ctx.__x = { marks: r.marks, accept: r.accept, row: { source_lines: r.source_lines }, sourceLines: r.source_lines, levelsSource: it ? it.source_text : '' };
    ctx.__t = e.text;
    const v = call('markLevels_(__t, __x.accept, __x)');
    if (!v || !v.levels) { miss.push(e.id); continue; }
    const type = /rule:\s*levels\s+(\w+)/i.exec(r.accept)[1];
    v.levels.each.forEach(a => res.push({ q: type + (v.levels.each.length > 1 ? ' ' + a.ao : ''), want: e.level, got: a.level,
      dm: Math.abs(a.mark - Math.round((e.level - 0.5) * a.of / 4)) }));
  }
  const agg = l => ({ n: l.length, exact: l.filter(r => r.got === r.want).length / l.length, one: l.filter(r => Math.abs(r.got - r.want) <= 1).length / l.length,
    mad: l.reduce((a, r) => a + r.dm, 0) / l.length });
  const say = (name, l) => { const a = agg(l); return name.padEnd(12) + ' n ' + String(a.n).padStart(3) + '  exact ' + (100 * a.exact).toFixed(0).padStart(3) + '%  within one level '
    + (100 * a.one).toFixed(0).padStart(3) + '%  mean mark difference ' + a.mad.toFixed(2); };
  if (!res.length) throw new Error('essay-cases: no exemplar could be marked (no `rule: levels` keys on their rows?)');
  const all = agg(res);
  console.log('essay-cases: ' + say('all', res).replace(/^all\s+/, ''));
  [...new Set(res.map(r => r.q))].sort().forEach(q => console.log('  ' + say(q, res.filter(r => r.q === q))));
  if (miss.length) console.log('  ' + miss.length + ' exemplar(s) not marked (their row has no levels key): ' + miss.slice(0, 6).join(', '));
  if (all.one < FLOOR) throw new Error('essay-cases: within-one-level agreement ' + (100 * all.one).toFixed(0) + '% is below ' + 100 * FLOOR + '%');
  return all;
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
