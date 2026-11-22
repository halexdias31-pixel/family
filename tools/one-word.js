#!/usr/bin/env node
/* @family. — tools/one-word.js THE ONE-WORD CHECK (rule 1.75, unify batch 6 lane B): every word a child or parent reads is a key in
   data/settings/words.json, read through text_(key). A string literal of 12+ characters in js/ that equals a words.json value, outside a
   generated BEGIN…END block, is the same text written twice and fails the build. OWED lists the other lanes' files still to do; printed as owed. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const { bare } = require('./lib/gen.js');
const ROOT = path.join(__dirname, '..');
const MIN = +process.env.ONE_WORD_MIN || 12; // 12+ characters: shorter words (Open, Tutor) are too often data
const OWED = ['find-bundles.js', 'find-finder.js', 'find-doors.js', 'find-pages.js', 'find-facets.js', 'find-quick.js', 'find-history.js', 'cards-make.js', 'draw.js', 'find-figures.js'];

/* COMMENTS BLANKED (strings kept) by gen.js bare, so a word quoted in a comment is not a second copy. */
function scan() {
  const words = SD.words();
  const byText = new Map();
  for (const [k, v] of Object.entries(words)) if (typeof v === 'string' && v.length >= MIN && !byText.has(v)) byText.set(v, k);
  const hits = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).sort()) {
    const raw = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    if (/^\/\*[^\n]*WRITTEN BY tools\//.test(raw)) continue; // a generated file is its json's copy
    const src = bare(raw, { generated: true, comments: 'js' });
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\$]|\\.)*)`/g; let m;
      while ((m = re.exec(line))) {
        let s = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3];
        try { s = JSON.parse('"' + s.replace(/\\'/g, "'").replace(/"/g, '\\"').replace(/\\\\"/g, '\\"') + '"'); } catch (e) {}
        if (s.length >= MIN && byText.has(s)) hits.push({ f, line: i + 1, key: byText.get(s), s });
      }
    });
  }
  return hits;
}

async function run() {
  const hits = scan();
  const owed = hits.filter(h => OWED.includes(h.f)), bad = hits.filter(h => !OWED.includes(h.f));
  const per = {}; owed.forEach(h => (per[h.f] = (per[h.f] || 0) + 1));
  console.log('one-word: ' + hits.length + ' literal(s) repeat words.json; owed by other lanes: ' + (Object.entries(per).map(([f, n]) => f + ' ' + n).join(', ') || 'none'));
  if (bad.length) {
    bad.forEach(h => console.log('  js/' + h.f + ':' + h.line + ' ' + JSON.stringify(h.s) + ' is text_(\'' + h.key + '\')'));
    throw new Error('one-word: ' + bad.length + ' literal(s) repeat a words.json value — read them through text_(key)');
  }
}
module.exports = { run, scan };
if (require.main === module) run().catch(e => { console.error(e.message); process.exit(1); });
