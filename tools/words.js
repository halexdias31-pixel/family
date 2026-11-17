#!/usr/bin/env node
/* @family. — tools/words.js THE ONE WORDS FILE (foundation 3): data/settings/words.json, read through text_(key, vars) (core.js). */
/* run() copies it into core.js between the WORDS markers; tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const WF = path.join(ROOT, 'data/settings/words.json'), CORE = path.join(ROOT, 'js/core.js');
const words = JSON.parse(fs.readFileSync(WF, 'utf8')).words || {};
const block = '/* WORDS:BEGIN — a copy of data/settings/words.json, written by `node tools/build.js`; edit the json, never this. */\n'
  + 'const WORDS_FILE = ' + JSON.stringify(words) + ';\n/* WORDS:END */';
const RE = /\/\* WORDS:BEGIN[\s\S]*?\/\* WORDS:END \*\//;
function run() {
  let core = fs.readFileSync(CORE, 'utf8');
  const was = core;
  core = RE.test(core) ? core.replace(RE, () => block) : core.replace(/\n/, () => '\n' + block + '\n');
  if (core !== was) fs.writeFileSync(CORE, core);
  console.log('words: ' + Object.keys(words).length + (core !== was ? ' written into' : ' already in') + ' js/core.js');
}
module.exports = { run };
if (require.main === module) run();
