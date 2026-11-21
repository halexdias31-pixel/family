#!/usr/bin/env node
/* @family. — tools/kinds.js: writes js/kinds.js, the browser's copy of data/settings/kinds.json (every kind, and the front doors in order) and facets.json (every facet's label and order). */
/* Edit the JSON, never js/kinds.js. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
function run() {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8'));
  /* THE FRONT DOORS ARE SAID ONCE (rule 1.75, batch 6): every `find.under` (a kind's or an entry's) is a `doors` name, each named once,
     so Find's first menu never shows a door out of the owner's order. */
  const doors = (j.doors || []).map(d => d && d.name), bad = [];
  doors.forEach((d, i) => { if (!d || doors.indexOf(d) !== i) bad.push('doors[' + i + '] ' + JSON.stringify(d) + ' is blank or twice'); });
  const under = (k, f) => String((f && f.under) || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => { if (doors.indexOf(t) < 0) bad.push(k + ': under ' + t + ' is not in kinds.json doors'); });
  Object.keys(j.kinds || {}).forEach(k => { const f = (j.kinds[k] || {}).find; under(k, f); Object.keys((f && f.entries) || {}).forEach(e => under(k + '.' + e, f.entries[e])); });
  if (bad.length) throw new Error('kinds: FAILED\n  ' + bad.join('\n  '));
  const want = '/* @family. — js/kinds.js: WRITTEN BY tools/kinds.js FROM data/settings/kinds.json and facets.json; edit those. */\n'
    + 'const ITEM_KINDS = ' + JSON.stringify({ kinds: j.kinds, doors: j.doors, facets: JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/facets.json'), 'utf8')) }) + ';\n';
  const file = path.join(ROOT, 'js/kinds.js');
  let have = '';
  try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
  if (have !== want) fs.writeFileSync(file, want);
  return have !== want;
}
module.exports = { run };
if (require.main === module) { try { console.log('kinds: ' + (run() ? 'wrote' : 'unchanged') + ' js/kinds.js; every find.under is one of kinds.json doors'); } catch (e) { console.error(e.message); process.exit(1); } }
