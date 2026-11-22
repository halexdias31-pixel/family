#!/usr/bin/env node
/* @family. — tools/aqa-ms-answers.js EACH AQA QUESTION'S ANSWER FROM ITS OWN MARK-SCHEME CELL (21 Nov): now the importer's `markscheme`
   source (cells → answers → words, data/settings/content.json sources), kept as the name the docs use.
   node tools/aqa-ms-answers.js <ids file> <pdf dir> [--overrides f.json] [--apply]  =  node tools/content.js markscheme … */
'use strict';
require('./content.js').main(['markscheme', ...process.argv.slice(2)]).catch(e => { console.error(String((e && e.message) || e)); process.exit(1); });
