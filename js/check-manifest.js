#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-manifest.js

   backend/files.json HAS TO NAME EVERY FILE IN backend/, AND NOTHING ELSE.

   WHY IT EXISTS. `sync.gs` pulls the backend into Apps Script from raw.githubusercontent.com, and a
   CDN cannot list a directory — it can only hand over a file you name. So the repo carries the list
   itself, in `backend/files.json`.

   A LIST KEPT BY HAND IS A LIST THAT GOES STALE, and this one goes stale silently in the direction
   that matters most: add a .gs, forget the manifest, and the next pull writes a project WITHOUT it.
   The Apps Script API replaces every file at once, so a name missing from the manifest is not a file
   left alone — it is a file deleted from the live backend. That is how this list, left unchecked,
   takes the site down.

   THE OTHER DIRECTION IS LOUD AND HARMLESS. A name in the manifest with no file behind it fails the
   download, `fetchBackend_` throws, and nothing is sent. Reported here anyway, because a check that
   only catches the dangerous half teaches you it catches everything.

   `files.json` IS NOT IN ITS OWN LIST. It is repo metadata telling `sync.gs` what to fetch, not a
   file the Apps Script project should contain — pushing it would put a stray `files` JSON into the
   editor next to the code.

     node js/check-manifest.js
================================================================================================== */
'use strict';

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
