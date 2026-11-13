#!/usr/bin/env node
/* node js/check-insert-parts.js — ONE ITEM PER SHEET AND PER PART (4.12): no two inserts or two parts with the same content. */
/* Every line is a part with an id from its sheet; a formula shared by sheets is one part; no whole-sheet card is drawn (owner, 13 Nov). */
'use strict';
require('../check/quiet');
const fs = require('fs');
const path = require('path');

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'inserts.json'), 'utf8'));
const bad = [];
const ids = new Set(rows.map(r => r.insert_id));
const sheet = {}, part = {};
rows.forEach(r => {
  const body = JSON.stringify([(r.sections || []).map(s => [s.head, (s.lines || []).map(l => [l.name, l.math, l.note || ''])]), r.table || '', r.elements || [], r.for_papers || '']);
  if ((r.sections || []).length || (r.elements || []).length) {
    if (sheet[body]) bad.push(r.insert_id + ' has the same content as ' + sheet[body] + ': make it one item tagged with both boards');
    else sheet[body] = r.insert_id;
  }
  (r.sections || []).forEach(s => (s.lines || []).forEach(l => {
    if (!l.id) { bad.push(r.insert_id + ': a line with no part id (' + (l.name || s.head) + ')'); return; }
    if (!ids.has(l.id.replace(/-\d+\.\d+$/, ''))) bad.push(l.id + ' (on ' + r.insert_id + ') names no parent sheet');
    const c = JSON.stringify([l.name, l.math, l.note || '']);
    if (part[c] && part[c] !== l.id) bad.push(l.id + ' has the same content as ' + part[c]);
    else part[c] = l.id;
  }));
});
const find = ['js/find-aloud.js', 'js/find-history.js'].map(f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n');
if (!/DATA\.inserts \|\| \[\]\)\.filter\(insReading_\)\.map\(insertItem_\)/.test(find)) bad.push('find-aloud.js lists whole formula sheets: only reading inserts are whole, a sheet is its parts');
if (!/-table'/.test(find)) bad.push("find-history.js insertParts_ no longer makes a sheet's table its own part");
if (bad.length) { console.log('FAILED — insert parts:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — ' + rows.length + ' inserts, ' + Object.keys(part).length + ' parts, each once with a parent');
