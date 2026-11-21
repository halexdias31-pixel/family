#!/usr/bin/env node
/* @family. — tools/facet-readers.js THE FACET-READERS-AS-DATA CHECK (rule 1.75; unify batch 4, lane B).
   A facet that only reads one column says so in data/settings/facets.json (`read`: {by, col}), read by js/find-finder.js's one
   table FACET_BY_READ_; a hand reader for it in FACET_READ is a second place to forget one, and a child would see a menu that
   answers differently from its twin. This fails the build if a one-line column reader (writingAt_/histCol_/mechFit_/mechOwn_ of a
   quoted column, or a plain `x.col || ''`) comes back in FACET_READ, a `read` names an unknown `by`, or a facet is read twice. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ENGINE = 'js/find-finder.js';
const BYS = ['row', 'writing', 'hist', 'mech', 'own'];

const src = fs.readFileSync(path.join(ROOT, ENGINE), 'utf8');
const facets = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/facets.json'), 'utf8'));
const bad = [];
const m = /\nconst FACET_READ = \{\n([\s\S]*?)\n\};\n/.exec(src);
if (!m) bad.push(ENGINE + ': FACET_READ not found');
if (!/const FACET_BY_READ_ = \{/.test(src) || !/\.\.\.facetReadData_\(\)/.test(src)) bad.push(ENGINE + ': the generic reader table (FACET_BY_READ_, facetReadData_) is gone');
const ONE_LINE = [
  /^\s+(\w+): \{ of: x => (?:writingAt_|histCol_|mechFit_|mechOwn_)\(x(?:, '[^']*')+\)(?:, tagOf: x => mechFitTag_\(x, '[^']*'\))? \},?$/,
  /^\s+(\w+): \{ of: x => \(?x\.\w+ \|\| ''\)? \},?$/,
];
const hand = new Set();
if (m) m[1].split('\n').forEach(l => {
  const k = /^  (\w+):/.exec(l); if (k) hand.add(k[1]);
  ONE_LINE.forEach(re => { const h = re.exec(l); if (h) bad.push(ENGINE + ': FACET_READ.' + h[1] + ' is a one-line column reader; give its facets.json row a "read" instead'); });
});
facets.forEach(f => {
  if (!f.read) return;
  if (BYS.indexOf(f.read.by) < 0 || !f.read.col) bad.push('facets.json ' + f.field + ': read ' + JSON.stringify(f.read) + ' (by one of ' + BYS.join('|') + ', and a col)');
  if (f.read.by === 'own' && !/^\w+\.\w+$/.test(f.read.col)) bad.push('facets.json ' + f.field + ': an "own" col is table.column');
  if (hand.has(f.field)) bad.push(ENGINE + ': ' + f.field + ' is read by facets.json and again by hand in FACET_READ');
});
if (bad.length) { console.error('facet-readers: FAILED\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('facet-readers: ok — ' + facets.filter(f => f.read).length + ' facets read as data, no one-line column reader in FACET_READ');
