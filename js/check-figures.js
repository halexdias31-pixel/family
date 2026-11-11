#!/usr/bin/env node
/* node js/check-figures.js — A PART THAT NAMES A PICTURE HAS ONE (predicates.js `figUndrawn_`, also the Verified tag).
   Known gaps: data/settings/figure-backlog.json, which only shrinks; --prune drops fixed ones, --list prints all. */
require('../check/lib-full.js').needWords(); // LIB_PRIVATE=absent (CI): skipped and counted, not passed
'use strict';
const fs = require('fs'), path = require('path');
const BACKLOG = path.join(__dirname, '..', 'data', 'settings', 'figure-backlog.json');

let rows = [];
try { rows = require('../check/lib-full.js').rows('questions'); }
catch (e) { console.log('data/questions.json could not be read (' + e.message + '), so NOTHING was checked — not a pass.'); process.exit(1); }

/* THE RULE IS js/predicates.js's, the one the Verified tag reads (`verifyTags_`), so the two can never disagree. */
const P = {};
require('vm').runInNewContext(fs.readFileSync(path.join(__dirname, 'predicates.js'), 'utf8') + ';this.figUndrawn_ = figUndrawn_;', P);

const byId = {}, stems = {};
rows.forEach(r => {
  byId[r.row_id] = r;
  if (r.kind !== 'preamble') return;
  const k = r.paper_id + '|' + (r.question || '');
  (stems[k] || (stems[k] = [])).push(r);
});
const stemsOf = r => (stems[r.paper_id + '|'] || []).concat(r.question ? (stems[r.paper_id + '|' + r.question] || []) : []);

const missing = [];
rows.forEach(r => {
  /* A stem is checked on its own words; a part on its own, so one bare stem is one line, not one per part under it. */
  if (!r || (r.kind !== 'question' && r.kind !== 'preamble') || String(r.active) === 'False') return;
  const up = r.kind === 'preamble' ? [] : stemsOf(r);
  const used = String(r.uses || '').split(/[,\s]+/).filter(Boolean).map(id => byId[id]);
  if (!P.figUndrawn_(r, up.concat(used))) return;
  missing.push(r.row_id);
});

if (process.argv.includes('--list')) { console.log(missing.join('\n')); process.exit(0); }
let backlog = [];
try { backlog = JSON.parse(fs.readFileSync(BACKLOG, 'utf8')).rows || []; }
catch (e) { console.log('data/settings/figure-backlog.json could not be read (' + e.message + ')'); process.exit(1); }
const known = new Set(backlog), now = new Set(missing);
const fresh = missing.filter(id => !known.has(id));
const fixed = backlog.filter(id => !now.has(id));

if (process.argv.includes('--prune') && fixed.length) {
  const doc = JSON.parse(fs.readFileSync(BACKLOG, 'utf8'));
  doc.rows = backlog.filter(id => now.has(id));
  fs.writeFileSync(BACKLOG, JSON.stringify(doc, null, 1) + '\n');
  console.log('pruned ' + fixed.length + ' fixed part(s) from the backlog; ' + doc.rows.length + ' left');
  process.exit(fresh.length ? 1 : 0);
}
const bad = [];
fresh.forEach(id => bad.push(id + ': its words name a picture, and neither it nor its stem carries a drawing or a table'));
if (fixed.length) bad.push(fixed.length + ' backlog part(s) now have their figure — run node js/check-figures.js --prune: ' + fixed.slice(0, 10).join(' '));
if (bad.length) { console.log('check-figures: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-figures: every part that names a picture has one, but for ' + backlog.length + ' in the backlog');
