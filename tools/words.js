#!/usr/bin/env node
/* @family. — tools/words.js THE ONE WORDS FILE (foundation 3): data/settings/words.json, read through text_(key, vars) (core.js). */
/* run() copies it into core.js between the WORDS markers; tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, blockInto, writeIfChanged } = require('./lib/gen.js');
const WF = path.join(ROOT, 'data/settings/words.json'), CORE = path.join(ROOT, 'js/core.js');
const words = JSON.parse(fs.readFileSync(WF, 'utf8')).words || {};
const B = '/* WORDS:BEGIN', HEAD = B + ' — a copy of data/settings/words.json, written by `node tools/build.js`; edit the json, never this. */\n';
const E = '/* WORDS:END */', BODY = 'const WORDS_FILE = ' + JSON.stringify(words) + ';\n';
function run() {
  const core = blockInto(fs.readFileSync(CORE, 'utf8'), B, E, BODY, src => src.replace(/\n/, () => '\n' + HEAD + BODY + E + '\n'));
  const wrote = writeIfChanged(CORE, core);
  console.log('words: ' + Object.keys(words).length + (wrote ? ' written into' : ' already in') + ' js/core.js');
}
module.exports = { run };
if (require.main === module) run();
