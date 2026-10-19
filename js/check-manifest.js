#!/usr/bin/env node
/* @family. — check-manifest.js backend/files.json HAS TO NAME EVERY FILE IN backend/, AND NOTHING ELSE. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const fs = require('fs');
const path = require('path');

/* Beside js/, then in backend/ — the same search every other check here does, for the same reason:
   these files have moved once already and three checks did not notice. */
const WHERE = [path.join(__dirname, '..', 'backend'), path.join(__dirname, 'backend'),
               path.join(__dirname, '..'), __dirname];
const dir = WHERE.find(w => fs.existsSync(path.join(w, 'files.json')))
         || WHERE.find(w => fs.existsSync(w) && fs.readdirSync(w).some(f => f.endsWith('.gs')));

if (!dir) {
  console.log('FAILED — could not find backend/ at all. Looked in:\n  ' + WHERE.join('\n  '));
  process.exit(1);
}

const manifestPath = path.join(dir, 'files.json');
if (!fs.existsSync(manifestPath)) {
  console.log('FAILED — backend/files.json does not exist.');
  console.log('sync.gs needs it to know which files to fetch; without it a pull falls back to a');
  console.log('list baked into sync.gs, which is exactly the staleness this file exists to stop.');
  process.exit(1);
}

let listed;
try {
  listed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.log('FAILED — backend/files.json is not valid JSON: ' + err.message);
  process.exit(1);
}
if (!Array.isArray(listed)) {
  console.log('FAILED — backend/files.json must be an array of filenames.');
  process.exit(1);
}

const onDisk = fs.readdirSync(dir)
  .filter(f => /\.(gs|json|html)$/i.test(f) && f !== 'files.json')
  .sort();

const missing = onDisk.filter(f => listed.indexOf(f) === -1);       // the dangerous direction
const ghosts  = listed.filter(f => onDisk.indexOf(f) === -1);
const selfRef = listed.indexOf('files.json') !== -1;

const say = (title, list, note) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(f => console.log('  ' + f));
  if (note) console.log('  → ' + note);
};

say('IN backend/ AND NOT IN THE MANIFEST', missing,
    'a pull would DELETE these from the live Apps Script project');
say('IN THE MANIFEST AND NOT IN backend/', ghosts,
    'a pull would fail on these — loud, but still broken');

if (selfRef) {
  console.log('');
  console.log('files.json LISTS ITSELF  (1)');
  console.log('  → it is repo metadata, not project source; remove it from the list');
}

console.log('');
console.log('files in backend/: ' + onDisk.length + '   named in the manifest: ' + listed.length);

const bad = missing.length + ghosts.length + (selfRef ? 1 : 0);
console.log(bad
  ? 'FAILED — regenerate backend/files.json so it matches the folder.'
  : 'OK — the manifest names every backend file and nothing else.');
process.exit(bad ? 1 : 0);
