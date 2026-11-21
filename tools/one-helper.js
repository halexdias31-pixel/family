#!/usr/bin/env node
/* @family. — tools/one-helper.js THE ONE-HELPER CHECK (rule 1.75, unify batch 4 lane E).
   A child would notice a settings menu whose names drift from another copy, so the settings groups live once, in
   data/settings/setting-for.json's `type:` rows (col, label, admin); a list of them anywhere in js/ or backend/ fails the build.
   The tools' shared helpers live once, in tools/lib/gen.js; a tool defining its own S or blockInto fails the build.
   OWED lists the files another lane is still moving onto gen.js; each is printed, and dropping off the list is the goal. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, read, S } = require('./lib/gen.js');
const OWED = ['tools/permissions.js', 'tools/lib/library-schema.js'];
const HELPER_RE = /^\s*(?:const|let|var|function)\s+(S|blockInto)\b/m;

function walk(dir, ext, out) {
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach(e => {
    const f = dir + '/' + e.name;
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(f, ext, out); } else if (ext.test(e.name)) out.push(f);
  });
  return out;
}

function helperProblems() {
  return walk('tools', /\.js$/, []).filter(f => f !== 'tools/lib/gen.js' && OWED.indexOf(f) === -1)
    .map(f => [f, (fs.readFileSync(path.join(ROOT, f), 'utf8').match(HELPER_RE) || [])[1]]).filter(p => p[1])
    .map(([f, n]) => f + ' defines its own ' + n + ' (take it from tools/lib/gen.js)');
}

function groupProblems() {
  const rows = (read('data/settings/setting-for.json') || []).filter(r => /^type:/.test(S(r.card)));
  const cols = rows.map(r => S(r.col)).filter(Boolean), bad = [];
  if (!cols.length) bad.push('data/settings/setting-for.json has no type: rows with a col');
  rows.filter(r => S(r.col) && !S(r.label)).forEach(r => bad.push('data/settings/setting-for.json ' + r.card + ' has no label'));
  const esc = c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  walk('js', /\.js$/, []).concat(walk('backend', /\.gs$/, [])).forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/\bSETTING_(GROUPS|TYPES_FALLBACK)\b/.test(src)) bad.push(f + ' keeps a settings-group list by name');
    const hit = cols.filter(c => new RegExp("(?:\\bid:\\s*|\\[\\s*'[A-Z][a-z]+',\\s*)'" + esc(c) + "'").test(src));
    if (hit.length >= 3) bad.push(f + ' lists settings groups (' + hit.join(', ') + ') outside setting-for.json');
  });
  return { bad, groups: cols.length };
}

function run() {
  const h = helperProblems(), g = groupProblems(), bad = h.concat(g.bad);
  console.log('one-helper: ' + g.groups + ' settings groups from setting-for.json; ' + h.length + ' tool(s) with their own S/blockInto'
    + '; owed: ' + OWED.join(', '));
  if (bad.length) { bad.forEach(b => console.log('  ' + b)); throw new Error('one-helper: ' + bad.length + ' problem(s)'); }
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
