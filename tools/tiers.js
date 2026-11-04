#!/usr/bin/env node
/* @family. — tools/tiers.js writes data/settings/tiers.json into the code (860): shell.js's TIER_* lists and index.html's LATER and OFF. Turning a widget on is its line in tiers.json, then this. `--check` only compares. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/tiers.json'), 'utf8'));
const of = (sec, t) => Object.keys(T[sec] || {}).filter(k => T[sec][k] === t);
/* A FILE IS OFF when every widget it serves is off (`widgetFiles`); its code stays in the repo and in FILES, and is never fetched. */
const offFiles = Object.keys(T.widgetFiles || {}).filter(f => [].concat(T.widgetFiles[f]).every(w => (T.widgets || {})[w] === 'off'));
const q = a => a.map(x => `'${x}'`).join(', ');
const later = (T.later || []).filter(f => offFiles.indexOf(f) === -1);
const want = {
  'js/shell.js': [
    [/const TIER_CORE_WIDGETS = \[[^\]]*\];/, `const TIER_CORE_WIDGETS = [${q(of('widgets', 'core'))}];`],
    [/const TIER_OFF_WIDGETS = \[[^\]]*\];/, `const TIER_OFF_WIDGETS = [${q(of('widgets', 'off'))}];`],
    [/const TIER_CORE_KINDS = \[[^\]]*\];/, `const TIER_CORE_KINDS = [${q(of('kinds', 'core'))}];`],
  ],
  'index.html': [
    [/window\.LATER = \[[^\]]*\];/, `window.LATER = [${q(later)}];`],
    [/window\.OFF = \[[^\]]*\];/, `window.OFF = [${q(offFiles)}];`],
  ],
};
let stale = [];
Object.keys(want).forEach(f => {
  const p = path.join(ROOT, f);
  let s = fs.readFileSync(p, 'utf8');
  const was = s;
  want[f].forEach(([re, line]) => { if (!re.test(s)) stale.push(f + ' has no ' + re.source.split(' =')[0]); s = s.replace(re, line); });
  if (s !== was) { stale.push(f); if (!process.argv.includes('--check')) fs.writeFileSync(p, s); }
});
if (process.argv.includes('--check')) {
  if (stale.length) { console.log('FAILED — tiers.json is not what the code says: ' + stale.join(', ') + '. Run node tools/tiers.js'); process.exit(1); }
  console.log('OK — shell.js and index.html are what data/settings/tiers.json says (' + offFiles.length + ' files off).');
} else console.log('wrote the tiers into ' + (stale.join(', ') || 'nothing (already current)') + '; off files: ' + offFiles.join(', '));
