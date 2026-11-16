#!/usr/bin/env node
/* @family. — tools/kinds.js: writes js/kinds.js, the browser's copy of data/settings/kinds.json (the one description of every kind). */
/* Edit the JSON, never js/kinds.js. build-stamp.js runs this first. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
function run() {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8'));
  const want = '/* @family. — js/kinds.js: WRITTEN BY tools/kinds.js FROM data/settings/kinds.json; edit that. */\n'
    + 'const ITEM_KINDS = ' + JSON.stringify({ kinds: j.kinds }) + ';\n';
  const file = path.join(ROOT, 'js/kinds.js');
  let have = '';
  try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
  if (have !== want) fs.writeFileSync(file, want);
  return have !== want;
}
module.exports = { run };
if (require.main === module) console.log('kinds: ' + (run() ? 'wrote' : 'unchanged') + ' js/kinds.js');
