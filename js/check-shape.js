#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-shape.js EVERY ITEM IN THE ONE SHAPE {id, kind, title, tags, text, picture, tiles} (decision 82a). Reports only for now: the count is the migration's worklist. */
'use strict';
const fs = require('fs'), path = require('path');
const O = path.join(__dirname, '..');
const SHAPE = ['id', 'kind', 'title', 'tags', 'text', 'picture', 'tiles'];
/* Health reports and settings are not items. */
const SKIP = /-health\.json$|^health|^stability|^settings|LICENSE/;
const json = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };

const lists = [];
const fx = json(path.join(O, 'check/fixture.json')) || {};
Object.keys(fx).forEach(k => { if (Array.isArray(fx[k])) lists.push(['fixture.' + k, fx[k]]); });
const dd = path.join(O, 'data');
(fs.existsSync(dd) ? fs.readdirSync(dd) : []).filter(f => f.endsWith('.json') && !SKIP.test(f)).forEach(f => {
  const j = json(path.join(dd, f));
  if (Array.isArray(j)) lists.push(['data/' + f, j]);
  else if (j && typeof j === 'object') Object.keys(j).forEach(k => { if (Array.isArray(j[k])) lists.push(['data/' + f + '.' + k, j[k]]); });
});

let items = 0, whole = 0;
const rows = [];
lists.forEach(([name, arr]) => {
  const objs = arr.filter(x => x && typeof x === 'object' && !Array.isArray(x));
  if (!objs.length) return;
  const miss = {};
  let ok = 0;
  objs.forEach(o => { const m = SHAPE.filter(k => !(k in o)); m.forEach(k => { miss[k] = (miss[k] || 0) + 1; }); if (!m.length) ok++; });
  items += objs.length; whole += ok;
  if (ok < objs.length) rows.push('  ' + name + ': ' + (objs.length - ok) + '/' + objs.length + ' lack ' + Object.keys(miss).map(k => k + '×' + miss[k]).join(' '));
});
console.log('ITEMS NOT YET IN THE ONE SHAPE  (' + rows.length + ' lists)');
console.log(rows.length ? rows.join('\n') : '  none');
console.log('');
/* Phase 0 reports and passes; once the Tidy migration lands this exit becomes the fail. */
console.log('OK (report only) — ' + whole + ' of ' + items + ' items in ' + lists.length + ' lists have all of ' + SHAPE.join(', ') + '.');
