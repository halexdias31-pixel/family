#!/usr/bin/env node
/* @family. — tools/one-diagram.js THE GENERATED-DIAGRAM CHECK (rule 1.75; owner 26 Nov: a generated question's diagram drawn from its own
   numbers, one mechanism). What a child would notice: a picture whose numbers are not the question's, a picture that gives the answer away, a
   picture that changes when the same question comes back, or a question that promised a picture and shows none. Counted over every
   data/settings/qgen.json template that declares a `diagram` (tools/lib/qgen-draw.js), 200 seeds each:
     - it draws (an <svg> with an aria-label, no NaN), the same seed (and, for a set's seeds, the question's id) draw the same SVG byte for byte;
     - it shows at least one label, every number on it is a number the question's words say, and the answer is not on it unless the words say it;
     - its rows carry `figure` (the kind) and `diagram` in lib_has, and where this machine has the words, each one's `diagram` is that SVG and
       its html places it with `<!--fig-->` (the one figure path, js/find-figures.js figBlocks_).
   `--prove` breaks each and fails unless every break is caught. Run by tools/build.js after `one-gen`. */
'use strict';
const fs = require('fs');
const { main } = require('./lib/gen.js');
const QG = require('./lib/qgen.js');
const DR = require('./lib/qgen-draw.js');
const IM = require('./lib/import.js');
const L = require('./lib/lib-full.js');

const SEEDS = 200;
const nums = s => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

function data() {
  const words = !L.ABSENT && fs.existsSync(L.privatePath('questions')) ? IM.words('questions') : null;
  return { T: JSON.parse(JSON.stringify(QG.table())), words, again: null };
}

function problems(d) {
  const bad = [], out = [], done = new Set();
  const B = QG.bindings(d.T).filter(x => x.b && x.t.diagram);
  B.forEach(({ e, t: t0, b: t }) => {
    if (done.has(t0.id)) return; done.add(t0.id);
    const say = s => bad.push(t0.id + ': ' + s);
    if (!DR.KINDS[t0.diagram.kind]) return say('diagram kind "' + t0.diagram.kind + '" is none tools/lib/qgen-draw.js draws');
    let n = 0;
    for (let s = 1; s <= SEEDS; s++) {
      let q;
      try { q = QG.generate(t, s, e.T); } catch (err) { say('seed ' + s + ': ' + err.message); break; }
      const svg = q.diagram && q.diagram.svg;
      if (!svg || !/^<svg\b[^>]*aria-label="[^"]+"/.test(svg) || /NaN|undefined|Infinity/.test(svg)) { say('seed ' + s + ': no whole drawing'); break; }
      const again = d.again ? d.again(t, s, e.T) : QG.generate(t, s, e.T);
      const back = s <= QG.SET_SIZE ? QG.fromId(q.id, d.T) : again; /* the id read back for the seeds a set uses (it reads every country file) */
      if (!again.diagram || again.diagram.svg !== svg || !back || !back.diagram || back.diagram.svg !== svg) { say('seed ' + s + ': drawn differently the second time'); break; }
      const shown = DR.labels(svg), said = new Set(nums(q.text)), ans = nums(q.key.split('|')[0])[0];
      if (!shown.length) { say('seed ' + s + ': a drawing with no label'); break; }
      const stray = shown.filter(l => nums(l).some(x => !said.has(x)));
      if (stray.length) { say('seed ' + s + ': "' + stray[0] + '" on the drawing is no number of "' + q.text + '"'); break; }
      if (ans != null && !said.has(ans) && shown.some(l => nums(l).includes(ans))) { say('seed ' + s + ': the answer ' + ans + ' is on the drawing'); break; }
      n++;
    }
    out.push(t0.id + ' (' + t0.diagram.kind + ')');
  });
  /* THE ROWS AND WORDS, as tools/gen-questions.js writes them */
  let em;
  try { em = QG.emit(d.T); } catch (err) { bad.push('the question rows: ' + err.message); return { bad, out, rows: 0 }; }
  let rows = 0;
  em.rows.filter(r => r.kind === 'question').forEach(r => {
    const w = em.words[r.row_id], has = /<!--fig-->/.test(w.html) && typeof w.diagram === 'string';
    if (!!r.figure !== has || !!r.figure !== /\bdiagram\b/.test(r.lib_has)) bad.push(r.row_id + ': `figure`, lib_has and its words disagree on the diagram');
    if (r.figure) {
      rows++;
      if (d.words && d.words[r.row_id] && (d.words[r.row_id].diagram !== w.diagram || !/<!--fig-->/.test(d.words[r.row_id].html))) bad.push(r.row_id + ': its words in data-private have not got the drawing (run tools/gen-questions.js)');
    }
  });
  if (!B.length) bad.push('no template declares a diagram');
  return { bad, out, rows };
}

const tpl = (d, id) => d.T.templates.find(t => t.id === id);
const BREAKS = [
  { name: 'a label that is not the question\'s number', d: d => { tpl(d, 'area-rect').diagram.label.w = '{w + 1} cm'; } },
  { name: 'the answer on the drawing', d: d => { tpl(d, 'pythag').diagram.label.hyp = "{leg ? r + ' cm' : r + ' cm'}"; } },
  { name: 'a drawing with no labels', d: d => { tpl(d, 'cuboid').diagram.label = {}; } },
  { name: 'a kind no one draws', d: d => { tpl(d, 'sector').diagram.kind = 'freehand'; } },
  { name: 'a drawing that changes', d: d => { let k = 0; d.again = (t, s, D) => { const q = QG.generate(t, s, D); if (k++ % 2) q.diagram.svg += ' '; return q; }; } },
  { name: 'words without their drawing', d: d => { const id = Object.keys(QG.emit(d.T).words).find(k => /-area-tri-/.test(k)); d.words = Object.assign({}, d.words, { [id]: { html: '<p>x</p>' } }); } },
];

function run() {
  const d = data(), r = problems(d);
  if (process.argv.indexOf('--prove') > 0) {
    if (r.bad.length) throw new Error('one-diagram --prove: the unbroken site already fails (' + r.bad[0] + ')');
    const missed = BREAKS.filter(b => { const x = data(); if (!x.words) x.words = {}; b.d(x); return !problems(x).bad.length; }).map(b => b.name);
    if (missed.length) throw new Error('one-diagram --prove: missed ' + missed.join(', '));
    console.log('one-diagram --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  if (r.bad.length) { console.error('one-diagram: ' + r.bad.length + ' problem(s):\n  ' + r.bad.slice(0, 40).join('\n  ')); throw new Error('one-diagram check failed'); }
  console.log('one-diagram: ' + r.out.length + ' templates draw their diagram from their own numbers (' + SEEDS + ' seeds each: the same SVG again and from its id, '
    + 'every label a number the words say, never the answer); ' + r.rows + ' generated question rows carry it as their figure: ' + r.out.join(', '));
}

main(module, run);
module.exports = { problems, run };
