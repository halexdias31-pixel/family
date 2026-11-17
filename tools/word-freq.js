#!/usr/bin/env node
/* tools/word-freq.js — writes data/word-freq.json, the Rewrite coach's word ranks, counted from the public-domain texts in data/pdtexts (554). tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'data/pdtexts'), OUT = path.join(ROOT, 'data/word-freq.json');
const KEEP = 20000, MIN = 3;   // the ranks the coach grades by; a word seen fewer than MIN times is noise, not a rank

function build() {
  const n = new Map(), files = fs.readdirSync(DIR).filter(f => /^TX-\d+\.json$/.test(f)).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const text = [j.cards || []].flat(Infinity).filter(x => typeof x === 'string').join('\n').toLowerCase().replace(/’/g, "'");
    for (const m of text.match(/[a-z]+(?:'[a-z]+)?/g) || []) {
      const w = m.replace(/'s$/, '');
      if (w.length > 1 || w === 'a' || w === 'i') n.set(w, (n.get(w) || 0) + 1);
    }
  }
  const words = [...n].filter(([, c]) => c >= MIN).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, KEEP).map(([w]) => w);
  return JSON.stringify({
    about: 'Words ranked by how often they occur, commonest first. Counted by tools/word-freq.js; docs/history/554.',
    source: 'data/pdtexts (' + files.length + ' public-domain texts, see data/pdtexts/LICENSE)',
    licence: 'Public domain (counted from public-domain texts; the counts are this repo\'s own)',
    words }) + '\n';
}
function run() {
  const out = build(), now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (now !== out) fs.writeFileSync(OUT, out);
  console.log('word-freq: ' + (now !== out ? 'wrote' : 'unchanged') + ' data/word-freq.json, ' + JSON.parse(out).words.length + ' words');
}
module.exports = { run };
if (require.main === module) run();
