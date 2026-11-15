#!/usr/bin/env node
/* @family. — tools/words.js THE ONE WORDS FILE (foundation 3): data/settings/words.json, read through text_(key, vars) (core.js). */
/* `--write` copies it into core.js between the WORDS markers; else it fails on a stale copy, an unknown key, or an unused word. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const WF = path.join(ROOT, 'data/settings/words.json'), CORE = path.join(ROOT, 'js/core.js');
const words = JSON.parse(fs.readFileSync(WF, 'utf8')).words || {};
const block = '/* WORDS:BEGIN — a copy of data/settings/words.json, written by `node tools/words.js --write`; edit the json, never this. */\n'
  + 'const WORDS_FILE = ' + JSON.stringify(words) + ';\n/* WORDS:END */';
const RE = /\/\* WORDS:BEGIN[\s\S]*?\/\* WORDS:END \*\//;
let core = fs.readFileSync(CORE, 'utf8');
if (process.argv.includes('--write')) {
  core = RE.test(core) ? core.replace(RE, () => block) : core.replace(/\n/, () => '\n' + block + '\n');
  fs.writeFileSync(CORE, core);
  console.log('words: ' + Object.keys(words).length + ' written into js/core.js');
  process.exit(0);
}
const bad = [];
const m = RE.exec(core);
if (!m || m[0] !== block) bad.push('js/core.js carries an old copy of data/settings/words.json — node tools/words.js --write');
const used = new Set();
fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check|^_/.test(f)).forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  for (const x of src.matchAll(/\btext_\('([^']+)'/g)) {
    used.add(x[1]);
    if (!(x[1] in words)) bad.push(`js/${f}: text_('${x[1]}') names no word in data/settings/words.json`);
  }
});
Object.keys(words).forEach(k => { if (!used.has(k)) bad.push(`data/settings/words.json: "${k}" is used by nothing`); });
if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); console.log('words: ' + bad.length + ' problem(s)'); process.exitCode = 1; }
else if (process.env.VERBOSE || process.argv.includes('-v')) console.log('words: ok — ' + Object.keys(words).length + ' words, every one used, one copy');
