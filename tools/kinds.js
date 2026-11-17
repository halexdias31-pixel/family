#!/usr/bin/env node
/* @family. — tools/kinds.js: writes js/kinds.js, the browser's copy of data/settings/kinds.json (every kind) and facets.json (every facet's label and order). */
/* Edit the JSON, never js/kinds.js. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
function run() {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8'));
  const want = '/* @family. — js/kinds.js: WRITTEN BY tools/kinds.js FROM data/settings/kinds.json and facets.json; edit those. */\n'
    + 'const ITEM_KINDS = ' + JSON.stringify({ kinds: j.kinds, facets: JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/facets.json'), 'utf8')) }) + ';\n';
  const file = path.join(ROOT, 'js/kinds.js');
  let have = '';
  try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
  if (have !== want) fs.writeFileSync(file, want);
  return have !== want;
}
module.exports = { run };
if (require.main === module) console.log('kinds: ' + (run() ? 'wrote' : 'unchanged') + ' js/kinds.js');
