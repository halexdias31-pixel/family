#!/usr/bin/env node
/* @family. — tools/one-plural.js THE ONE-PLURAL CHECK (rule 1.75, unify batch 5 job R): "1 mark", "2 marks", "0 copies" by one helper. */
/* Every count's word goes through js/core.js `plural_` (copied to backend/cards-gen.gs by tools/cards-gen.js). An inline
   `n === 1 ? '' : 's'` (or `'y' : 'ies'`) in js/ or backend/ fails the build; so does a helper that says a fixed case differently. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const INLINE = /\?\s*''\s*:\s*'e?s'|\?\s*'e?s'\s*:\s*''|\?\s*'y'\s*:\s*'ies'/;
/* THE WORDS THE SITE AND THE EMAIL COUNT, as each read before the helper: [word, many-or-null, the old way]. */
const CASES = [
  ['mark'], ['page'], ['question'], ['part'], ['photo'], ['room'], ['item'], ['paper'], ['credit'], ['seat'], ['hour'], ['day'],
  ['thing'], ['report'], ['note'], ['vote'], ['minute'], ['attachment'], ['spreadsheet'], ['film'], ['trigger'], ['email'],
  ['learner'], ['worksheet'], ['document'],
  ['documentary', 'documentaries', n => 'documentar' + (n === 1 ? 'y' : 'ies')],
  ['copy', 'copies', n => 'cop' + (n === 1 ? 'y' : 'ies')]];
function walk(dir, out) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = dir + '/' + f;
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel, out); else if (/\.(js|gs)$/.test(f)) out.push(rel);
  }
  return out;
}
function run() {
  const bad = [];
  for (const f of walk('js', walk('backend', []))) {
    if (f === 'backend/cards-gen.gs') continue;
    fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((l, i) => {
      if (INLINE.test(l) && !/const plural_ = /.test(l)) bad.push(f + ':' + (i + 1) + ' ' + l.trim().slice(0, 100));
    });
  }
  const src = fs.readFileSync(path.join(ROOT, 'js/core.js'), 'utf8').match(/^const plural_ = .*$/m);
  if (!src) throw new Error('one-plural: js/core.js has no `const plural_ =`');
  const gs = fs.readFileSync(path.join(ROOT, 'backend/cards-gen.gs'), 'utf8');
  if (gs.indexOf(src[0]) === -1) bad.push('backend/cards-gen.gs: its plural_ is not js/core.js\'s (run tools/cards-gen.js)');
  const plural_ = new Function(src[0] + '; return plural_;')();
  let n = 0;
  for (const [w, many, old] of CASES) for (const k of [0, 1, 2]) {
    const was = k + ' ' + (old ? old(k) : w + (k === 1 ? '' : 's')), now = k + ' ' + plural_(k, w, many);
    n++;
    if (was !== now) bad.push('"' + was + '" now reads "' + now + '"');
  }
  if (bad.length) throw new Error('one-plural: ' + bad.length + ' ' + plural_(bad.length, 'problem') + ':\n  ' + bad.join('\n  '));
  console.log('one-plural: one plural_ (js/core.js, copied to the backend); no inline plural in js/ or backend/; ' + n + ' fixed cases read as before');
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
