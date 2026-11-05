#!/usr/bin/env node
/* @family. — tools/qengine-health.js THE ONE QUESTION PAGE'S PROGRESS (roadmap 7, 920), data/qengine-health.json. About 3 s. */
/* Per qtype: its checker (data/settings/qengine.json), moved or not, and how many of its questions carry an answer field the */
/* checker can read. Per checker: a proof over sample inputs, run on js/find.js's own markers in a node vm box.                */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'qengine-health.json');
const t0 = Date.now();
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qengine.json'), 'utf8'));

/* find.js AND qtypes.js IN ONE BOX; any other name is a do-nothing (as tools/answer-health.js). */
const noop = new Proxy(function () { return noop; }, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : noop, apply: () => noop, construct: () => noop });
const box = { console, Math, JSON, String, Number, Array, Object, RegExp, Date, Set, Map, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Infinity, NaN, Error, __OUT: {} };
const P = new Proxy(box, { has: () => true, get: (t, k) => (k in t ? t[k] : k === Symbol.unscopables ? undefined : noop), set: (t, k, v) => { t[k] = v; return true; } });
const src = ['qtypes', 'find'].map(f => fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')).join('\n;\n');
vm.runInNewContext('with (__P) {' + src + '\n;Object.assign(__OUT, { markAnswer_, markExpr_, markOrder_, markWords_, qType_, QTYPE_PROTOCOL }); }', { __P: P }, { timeout: 20000 });
const M = box.__OUT;

/* THE PROOFS: [typed, want, expected]. A checker with no marker yet proves nothing and says so. */
const PROOF = {
  number: { run: (t, w) => M.markAnswer_(t, w), cases: [['15', '15', true], ['16', '15', false], ['15.0', '15', true], ['fifteen', '15', true],
    ['0.5', '1/2', true], ['x = 9', '9', true], ['3 cm', '3 cm', true], ['', '15', null]] },
  expression: { run: (t, w) => M.markExpr_(t, w), cases: [['2x+1', '2x+1', true], ['1+2x', '2x+1', true], ['2(x+1)', '2x+2', true], ['2x-1', '2x+1', false], ['two x plus one', '2x+1', true]] },
  choice: { run: (t, w) => M.markOrder_(t, w), cases: [['2,1,3', '2,1,3', true], ['1,2,3', '2,1,3', false], ['2, 1, 3', '2,1,3', true]] },
  words: { run: (t, w) => { const r = M.markWords_(t, w); return r ? r.got === r.of : r; }, cases: [['the force is balanced', 'balanced', true], ['it speeds up', 'balanced', false], ['', 'balanced', null]] },
  points: { run: null, cases: [] },
};
const proofs = {};
Object.keys(PROOF).forEach(k => { const p = PROOF[k], fails = [];
  if (!p.run) { proofs[k] = { cases: 0, pass: 0, fails: ['no shared points checker yet'] }; return; }
  p.cases.forEach(([t, w, want]) => { let got; try { got = p.run(t, w); } catch (e) { got = 'threw ' + e.message; }
    if (got !== want) fails.push(`"${t}" against "${w}" gave ${got}, wanted ${want}`); });
  proofs[k] = { cases: p.cases.length, pass: p.cases.length - fails.length, fails }; });

/* ANSWER FIELDS IN DATA: what each checker reads today; `answer_areas`, the page's own column, counted apart (none yet). */
const READS = { number: ['accept', 'cells'], expression: ['accept'], points: ['draw_answer'], choice: ['choices', 'choice_right'], words: ['mark_words'], none: [] };
let rows = [], skipped = '';
try { rows = JSON.parse(require('../check/lib-full.js').text('questions')); } catch (e) { skipped = String(e.code || e.message).slice(0, 120); }
const has = v => v !== undefined && v !== null && String(v).trim() !== '';
const types = {};
Object.keys(M.QTYPE_PROTOCOL).forEach(t => { const m = map.types[t] || { checker: 'none', moved: false };
  types[t] = { checker: m.checker, moved: !!m.moved, questions: 0, withAnswer: 0, withAreas: 0 }; });
rows.forEach(r => { let t; try { t = M.qType_(r); } catch (e) { t = ''; } const T = types[t]; if (!T) return;
  T.questions++; if (READS[T.checker] && READS[T.checker].some(f => has(r[f]))) T.withAnswer++; if (has(r.answer_areas)) T.withAreas++; });
const all = Object.keys(types), moved = all.filter(t => types[t].moved);
const out = { moved: moved.length, of: all.length, unmapped: all.filter(t => types[t].checker === 'none'), proofs, types, skipped: skipped || undefined, ms: Date.now() - t0 };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`qengine-health: ${moved.length}/${all.length} qtypes on the one page; proofs ` + Object.keys(proofs).map(k => `${k} ${proofs[k].pass}/${proofs[k].cases}`).join(', ') + ` (${out.ms} ms)`);
