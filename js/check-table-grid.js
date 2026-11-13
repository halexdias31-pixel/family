#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-table-grid.js EVERY TABLE IN THE LIBRARY IS A TRUE GRID (owner, 13 Nov: an isotope table's percentages sat a row low): § */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const lib = require(path.join(ROOT, 'check', 'lib-full.js'));
lib.needWords('table grids', { fixture: ['questions'] });
const file = lib.fixture() ? path.join(ROOT, 'check', 'fixtures', 'lib', 'questions.json') : path.join(ROOT, 'data-private', 'questions.json');

/* ONE TABLE'S ROWS, each its width counted the way a browser lays it out: a rowspan holds its columns open in the rows below. */
function widths(t) {
  const rows = [...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => m[1]);
  const held = [];
  return rows.map((r, ri) => {
    let w = held[ri] || 0;
    [...r.matchAll(/<(td|th)\b([^>]*)>/gi)].forEach(c => {
      const cs = +((/colspan\s*=\s*"?(\d+)/i.exec(c[2]) || [])[1] || 1), rs = +((/rowspan\s*=\s*"?(\d+)/i.exec(c[2]) || [])[1] || 1);
      w += cs;
      for (let a = 1; a < rs; a++) held[ri + a] = (held[ri + a] || 0) + cs;
    });
    return w;
  });
}
const fails = [];
let n = 0;
const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
const each = Array.isArray(rows) ? rows.map((r, i) => [r.key || r.id || String(i), r]) : Object.entries(rows);
each.forEach(([id, r]) => ['html', 'lead', 'answer'].forEach(f => {
  const s = String((r && r[f]) || '');
  [...s.matchAll(/<table\b[\s\S]*?<\/table>/gi)].forEach((m, ti) => {
    n++;
    const w = widths(m[0]);
    if (!w.length) return;
    if (w.some(x => x !== w[0])) fails.push(id + ' ' + f + ' table ' + (ti + 1) + ': row widths ' + w.join(','));
  });
}));
/* THE BUILDER TOO: `cellsTable_` must keep an empty corner as the corner, never fill it or drop it. */
const src = fs.readFileSync(path.join(ROOT, 'js', 'find-cells.js'), 'utf8');
const corner = /const cellCorner_ = (t => [^\n]*);/.exec(src);
// eslint-disable-next-line no-eval
const cornerFn = corner ? eval(corner[1]) : null;
const iso = '<table><tr><th></th><th>Mass number</th><th>Percentage (%) abundance</th></tr><tr><td>Isotope 1</td><td>10</td><td>20</td></tr></table>';
if (!cornerFn || !cornerFn(iso)) fails.push('find-cells.js cellCorner_ does not see the empty corner of the isotope table');
if (!n) fails.push('no table found in ' + path.relative(ROOT, file) + ', so nothing was checked');
if (fails.length) {
  console.log('FAIL — check-table-grid: ' + fails.length + ' table(s) not a true grid of ' + n);
  fails.slice(0, 40).forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('check-table-grid: ' + n + ' library tables, every row the same width');
