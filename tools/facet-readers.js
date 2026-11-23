#!/usr/bin/env node
/* @family. — tools/facet-readers.js THE FACET-READERS-AS-DATA CHECK (rule 1.75; unify batch 4, lane B).
   A facet that only reads one column says so in data/settings/facets.json (`read`: {by, col}), read by js/find-finder.js's one
   table FACET_BY_READ_; a hand reader for it in FACET_READ is a second place to forget one, and a child would see a menu that
   answers differently from its twin. This fails the build if a one-line column reader (writingAt_/histCol_/mechFit_/mechOwn_ of a
   quoted column, a plain `x.col || ''`, a bout's trimmed row column, or one helper's answer `x => helper_(x)` / `helper_(x).key`) comes
   back in FACET_READ, an `fn` names a helper missing from the explicit registry FACET_FN (batch 6), a `read` names an unknown `by`, or a facet is read twice. */
'use strict';
const { text, report, main } = require('./lib/gen.js');
const ENGINE = 'js/find-finder.js';
const BYS = ['row', 'writing', 'hist', 'mech', 'own', 'fight', 'fn'];
function run() {

const src = text(ENGINE);
const facets = JSON.parse(text('data/settings/facets.json'));
const bad = [];
const m = /\nconst FACET_READ = \{\n([\s\S]*?)\n\};\n/.exec(src);
if (!m) bad.push(ENGINE + ': FACET_READ not found');
if (!/const FACET_BY_READ_ = \{/.test(src) || !/\.\.\.facetReadData_\(\)/.test(src)) bad.push(ENGINE + ': the generic reader table (FACET_BY_READ_, facetReadData_) is gone');
const ONE_LINE = [
  /^\s+(\w+): \{ of: x => (?:writingAt_|histCol_|mechFit_|mechOwn_)\(x(?:, '[^']*')+\)(?:, tagOf: x => mechFitTag_\(x, '[^']*'\))? \},?$/,
  /^\s+(\w+): \{ of: x => \(?x\.\w+ \|\| ''\)? \},?$/,
  /^\s+(\w+): \{ of: x => \(?isFight_\(x\) && x\.row && String\(x\.row\.\w+ \|\| ''\)\.trim\(\)\)? \|\| '' \},?$/,
  /^\s+(\w+): \{ of: x => \w+_\(x\)(?:\.\w+)?(?:, tagOf: \(\) => '')?(?:, choose: true)? \},?$/,
];
const hand = new Set();
const reg = /\nconst FACET_FN = \{\n([\s\S]*?)\n\};\n/.exec(src), fns = new Set();
if (!reg) bad.push(ENGINE + ': the helper registry FACET_FN is gone');
else reg[1].split('\n').forEach(l => { const k = /^  (\w+): x => (\w+)\(x\),$/.exec(l); if (k && k[1] === k[2]) fns.add(k[1]); else if (l.trim()) bad.push(ENGINE + ': FACET_FN line is not `name_: x => name_(x),`: ' + l.trim()); });
if (m) m[1].split('\n').forEach(l => {
  const k = /^  (\w+):/.exec(l); if (k) hand.add(k[1]);
  ONE_LINE.forEach(re => { const h = re.exec(l); if (h) bad.push(ENGINE + ': FACET_READ.' + h[1] + ' is a one-line column reader; give its facets.json row a "read" instead'); });
});
facets.forEach(f => {
  if (!f.read) return;
  if (BYS.indexOf(f.read.by) < 0 || !f.read.col) bad.push('facets.json ' + f.field + ': read ' + JSON.stringify(f.read) + ' (by one of ' + BYS.join('|') + ', and a col)');
  if (f.read.by === 'own' && !/^\w+\.\w+$/.test(f.read.col)) bad.push('facets.json ' + f.field + ': an "own" col is table.column');
  if (f.read.by === 'fn' && !fns.has(f.read.col.split('.')[0])) bad.push('facets.json ' + f.field + ': fn ' + f.read.col + ' is not in FACET_FN');
  if (hand.has(f.field)) bad.push(ENGINE + ': ' + f.field + ' is read by facets.json and again by hand in FACET_READ');
});
/* ONE FACET A QUESTION (UNIFY AFTER 3, 23 Nov): What sort was seven facets and Brand two, each a kind's own copy of one question, so a parent
   saw the same question with different answers by where they stood. Each of these labels is one facet now; a second fails the build. A
   taxonomy level (data/settings/taxonomy.json library.levels: histKind, its own question in the History tree) is the taxonomy's, not a copy. */
const ONE_LABEL = ['What sort', 'Brand'];
const tax = JSON.parse(text('data/settings/taxonomy.json')), levels = new Set();
Object.keys(tax).forEach(k => (((tax[k] || {}).library || {}).levels || []).forEach(l => levels.add(l.facet)));
const live = facets.filter(f => f.active !== false && !levels.has(f.field));
ONE_LABEL.forEach(lb => { const on = live.filter(f => f.label === lb).map(f => f.field); if (on.length > 1) bad.push('facets.json: ' + on.length + ' facets ask "' + lb + '" (' + on.join(', ') + '); one facet, read across kinds (a fn or `or`)'); });
report('facet-readers', bad, 'problem(s) — FAILED');
console.log('facet-readers: ok — ' + facets.filter(f => f.read).length + ' facets read as data, no one-line column reader in FACET_READ; '
  + ONE_LABEL.map(lb => lb + ' ' + live.filter(f => f.label === lb).length).join(', ') + ' facet(s)');
}
module.exports = { run };
main(module, run);
