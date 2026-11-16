#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/fig-shown.js NO ACTIVE QUESTION SAYS "Figure not drawn yet." (owner, 15 Nov: "that should never happen").
   The site's own test (`FIG_NAMED`, `figWanted_` in js/find-figures.js), run over every active part and stem as the card would:
   a part or stem whose words name a figure, when neither it, its question, its section nor its paper carries a drawing (inline,
   its PNG twin or a photo), a surface to draw on, a part it `uses`, or a stem printing it as a table. Any such row fails unless
   data/settings/figure-backlog.json already lists it — that list only shrinks (js/check-figures.js), so a new one cannot ship. */
const LF = require('./lib-full.js');
LF.needWords();
const fs = require('fs'), path = require('path');
const { cutFrom } = require('../js/check-marks-load.js');

const src = require('../tools/find-src.js').findSrc();
const cut = ['FIG_NAMED', 'figWanted_'].map(n => cutFrom(src, n));
if (cut.some(c => !c)) { console.log('fig-shown: FIG_NAMED or figWanted_ is gone from js/find-figures.js — renamed? NOTHING was checked.'); process.exit(1); }
const figWanted_ = new Function(cut.join('\n') + '\nreturn figWanted_;')();

const rows = LF.rows('questions');
const known = new Set((JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'figure-backlog.json'), 'utf8')).rows) || []);
const S = v => String(v == null ? '' : v).trim();
/* DRAWN: the inline SVG, its twin (the card shows it whenever the SVG is not here, js/library.js `libTwinSvg_`), or a photo. */
const drawn = r => !!(S(r.diagram) || /^[0-9a-f]{12}$/.test(S(r.diagram_twin)) || S(r.images));
const tabled = r => /<table\b/i.test(S(r.html));
const at = {};
rows.forEach(r => {
  if (!r || (r.kind !== 'question' && r.kind !== 'preamble')) return;
  const q = S(r.question), k = r.kind === 'question' || q ? 'q|' + r.paper_id + '|' + q : r.section ? 's|' + r.paper_id + '|' + r.section : 'p|' + r.paper_id;
  if (drawn(r)) (at[k] = at[k] || {}).fig = true;
  if (r.kind === 'preamble' && tabled(r)) (at[k] = at[k] || {}).table = true;
});
const scope = (r, what) => { const q = S(r.question);
  return !!((at['q|' + r.paper_id + '|' + q] || {})[what] || (r.section && (at['s|' + r.paper_id + '|' + r.section] || {})[what]) || (at['p|' + r.paper_id] || {})[what]); };

const shown = [];
rows.forEach(r => {
  if (!r || (r.kind !== 'question' && r.kind !== 'preamble') || S(r.active) === 'False' || drawn(r)) return;
  if (r.kind === 'question' && (S(r.uses) || S(r.surface) || S(r.cells))) return;
  const figured = scope(r, 'fig') || (r.kind === 'question' && scope(r, 'table'));
  const words = r.kind === 'question' ? S(r.lead) + ' ' + S(r.html) : S(r.html);
  if (figWanted_(words, figured)) shown.push(r.row_id);
});
const fresh = shown.filter(id => !known.has(id));
console.log(`fig-shown: ${shown.length} active part(s)/stem(s) would say "Figure not drawn yet." — ${shown.length - fresh.length} already in the shrinking backlog, ${fresh.length} new`);
if (fresh.length) {
  console.log('FAILED — these name a figure nobody has drawn. Draw it (`diagram`, then tools/diagram_png.js for its twin) before it ships:\n  ' + fresh.join('\n  '));
  process.exit(1);
}
console.log('OK — no active question shows "Figure not drawn yet." outside the known backlog.');
