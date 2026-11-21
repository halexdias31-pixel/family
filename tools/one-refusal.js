#!/usr/bin/env node
/* @family. — tools/one-refusal.js THE ONE-REFUSAL CHECK (rule 1.75, unify batch 6, lane A): a refusal a parent or child reads is written once,
   as a words.json `err-*` key sent by refuse_(key, why, vars) / errOf_ (backend/core.gs), and a link to the site is built once, by
   siteLink_(param, value). Counted site-wide over backend/*.gs: a whole `error: '…'` message written by hand in two places, or a hand-built
   SITE_URL + '?…' link outside siteLink_, fails the build. A literal followed by `+` is a fragment of a built message and is not counted. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'backend');

function run() {
  const seen = {}, bad = [];
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.gs')).sort()) {
    const lines = fs.readFileSync(path.join(DIR, f), 'utf8').split('\n');
    lines.forEach((line, i) => {
      const at = 'backend/' + f + ':' + (i + 1);
      for (const m of line.matchAll(/\berror:\s*(['"])((?:\\.|(?!\1).)*)\1(?!\s*\+)/g)) {
        if (m[2]) (seen[m[2]] = seen[m[2]] || []).push(at);
      }
      if (/SITE_URL\s*\+\s*['"`]\?/.test(line) && !/function siteLink_\(/.test(line)) bad.push(at + ': a hand-built SITE_URL link (use siteLink_)');
    });
  }
  for (const t in seen) if (seen[t].length > 1) bad.push('"' + t + '" written ' + seen[t].length + ' times (' + seen[t].join(', ') + ') — give it an err-* key and use refuse_');
  if (bad.length) throw new Error('one-refusal:\n  ' + bad.join('\n  '));
  console.log('one-refusal: ' + Object.keys(seen).length + ' hand messages, none repeated; every site link through siteLink_');
}
module.exports = { run };
if (require.main === module) {
  try { run(); } catch (e) { console.error(e.message); process.exit(1); }
}
