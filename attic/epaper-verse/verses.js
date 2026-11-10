/* verses.js - verse.cpp's verses into data/eink-verses.json, the list the widget reads (470); never edit that file by hand. */
// node tools/epaper-verse/verses.js
'use strict';
const fs = require('fs'), path = require('path');
const VFILE = path.join(__dirname, '..', '..', 'data', 'eink-verses.json');
const versesText = () => JSON.stringify([...fs.readFileSync(path.join(__dirname, 'verse.cpp'), 'utf8').matchAll(/^\s*\{ "(.*)", "(.*)" \},$/gm)]
  .map(m => ({ text: m[1], ref: m[2] })), null, 0).replace(/\},\{/g, '},\n{') + '\n';
module.exports = { versesText };
if (require.main === module) { fs.writeFileSync(VFILE, versesText()); console.log('data/eink-verses.json written'); }
