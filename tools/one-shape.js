#!/usr/bin/env node
/* @family. — tools/one-shape.js THE ONE-QUESTION-SHAPE CHECK (rule 1.75, owner 23 Nov: "unify questions so a bug can't hide in a
   variant"). Every question row of the library is stem words, then one answer (a typed box, options with their key, a table's cells,
   or the draw canvas) with its key and an optional note. Each way a row strays from that is an oddity kind in tools/lib/shape.js,
   counted site-wide over every row. A kind with a fix (applied on every write of the words) is held at 0; any other kind at its
   BUDGET below, which can only fall: more fails the build, and fewer fails it too until the budget is lowered to match.
   Run by tools/build.js. Mend at the source: node tools/content.js shape --apply. */
'use strict';
const L = require('./lib/lib-full.js'), SH = require('./lib/shape.js');
const { main } = require('./lib/gen.js');

/* THE BUDGETS (23 Nov): each a count of rows that still need their source re-read. Lower them; never raise one. */
const BUDGET = {
  'lettered-list-in-stem': 73,
  'table-in-stem-unkeyed': 110,
  'table-in-note': 5,
  'mark-scheme-in-note': 1887,
  'no-key-note-only': 8098,
  'no-key': 6537,
  'two-keys': 903,
  'key-as-mark-words': 1326,
  'key-as-rule': 4525,
  'second-stem': 422,
  'part-label-form': 12816,
  'words-without-card': 0,
};

function check(words, cards) {
  const found = SH.audit(words, cards), bad = [], lines = [];
  for (const k of SH.KINDS) {
    const n = found[k.id].length, cap = k.fix ? 0 : BUDGET[k.id];
    if (cap === undefined) { bad.push(k.id + ': no budget (add it to BUDGET, at its count ' + n + ')'); continue; }
    lines.push('  ' + String(n).padStart(6) + ' / ' + String(cap).padEnd(6) + k.id + ' — ' + k.say);
    if (n > cap) bad.push(k.id + ': ' + n + ' row(s), budget ' + cap + (k.fix ? ' (node tools/content.js shape --apply)' : '') + ' — e.g. ' + found[k.id].slice(0, 5).join(', '));
    else if (n < cap) bad.push(k.id + ': ' + n + ' row(s), under its budget ' + cap + ' — lower BUDGET in tools/one-shape.js to ' + n);
  }
  return { found, bad, lines };
}

function run() {
  L.needWords('every question row\'s shape');
  const words = L.readPrivate('questions') || {}, cards = {};
  JSON.parse(require('fs').readFileSync(require('path').join(L.ROOT, 'data', 'questions.json'), 'utf8')).forEach(r => { if (r && r.row_id) cards[r.row_id] = r; });
  const { found, bad, lines } = check(words, cards);
  const odd = new Set();
  Object.keys(found).forEach(k => found[k].forEach(id => odd.add(id)));
  const n = Object.keys(words).length;
  console.log('one-shape: ' + (n - odd.size) + '/' + n + ' question rows in the one shape; ' + SH.KINDS.length + ' oddity kinds, '
    + SH.FIXES.length + ' held at 0 by the writer, the rest at a budget that can only fall');
  lines.forEach(l => console.log(l));
  if (bad.length) { bad.forEach(b => console.log('  ' + b)); throw new Error('one-shape: ' + bad.length + ' oddity kind(s) off their budget'); }
}
module.exports = { run, check, BUDGET };
main(module, run);
