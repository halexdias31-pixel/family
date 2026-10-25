#!/usr/bin/env node
/* @family. — tools/add-past-paper.js ONE PAST PAPER'S ROWS INTO THE LIBRARY: CARD IN data/, WORDS IN data-private/ (415). */
/* node tools/add-past-paper.js <rows.json> …  — rows from a paper script (tools/paperspec.py); a re-run replaces. docs/library.md */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('../check/lib-full.js');

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/add-past-paper.js <rows.json> […]'); process.exit(1); }
const FILE = path.join(L.ROOT, 'data', 'questions.json');
const def = L.defs().files.questions;

let raw = fs.readFileSync(FILE, 'utf8');
let rows = JSON.parse(raw);
if (rows.some(r => L.privateOf(def, r))) throw new Error('data/questions.json holds words (a join?) — split it first');
const priv = L.readPrivate('questions');
if (!priv) throw new Error('no data-private/questions.json — run node tools/lib-private.js seed (or pull) first');

const added = [];
files.forEach(f => {
  const spec = JSON.parse(fs.readFileSync(f, 'utf8'));
  const pid = spec.paper_id;
  const docAt = rows.findIndex(r => r.row_id === 'D-' + pid);
  if (docAt < 0) throw new Error('no document row D-' + pid + ' in data/questions.json');
  /* THE COVER, brought up to the paper it now holds. */
  const doc = rows[docAt];
  ['name', 'month', 'year', 'paper', 'tier', 'exam_wave', 'band_type', 'band_value', 'company'].forEach(k => {
    if (spec.meta[k]) doc[k] = spec.meta[k];
  });
  Object.keys(spec.doc).forEach(k => { if (spec.doc[k]) doc[k] = spec.doc[k]; });
  doc.active = 'True';
  /* A RE-RUN REPLACES: this paper's question and preamble rows go, and their words with them. */
  const mine = new Set(spec.rows.map(r => r.row_id));
  const gone = rows.filter(r => r.paper_id === pid && r.kind !== 'document').map(r => r.row_id);
  gone.forEach(id => { if (!mine.has(id)) delete priv[id]; });
  rows = rows.filter(r => !(r.paper_id === pid && r.kind !== 'document'));
  const at = rows.findIndex(r => r.row_id === 'D-' + pid);
  /* THE PAPER'S OWN PRINTED COPY, as its cover names it, on every row (a card links to it). */
  spec.rows.forEach(r => { if (!r.source_url && doc.source_url) r.source_url = doc.source_url; });
  rows.splice(at + 1, 0, ...spec.rows);
  spec.rows.forEach(r => added.push(r.row_id));
  console.log(pid + ': ' + spec.rows.length + ' rows' + (gone.length ? ' (replacing ' + gone.length + ')' : ''));
});
const dup = added.filter((id, i) => added.indexOf(id) !== i);
if (dup.length) throw new Error('row ids twice: ' + dup.join(', '));
const clash = rows.filter(r => added.indexOf(r.row_id) !== -1).length - added.length;
if (clash) throw new Error(clash + ' row id(s) already used by another paper');
/* the new rows' words replace whatever data-private held for those ids (a whole row is the truth) */
added.forEach(id => { delete priv[id]; });
L.writePrivate('questions', priv);
fs.writeFileSync(FILE, L.fileText(rows, L.styleOf(raw)));
/* SPLIT: the words out into data-private/, lib_has and function_verified worked out, as for any tool. */
cp.execFileSync('node', [path.join(L.ROOT, 'tools', 'lib-private.js'), 'split', 'questions'], { stdio: 'inherit' });
