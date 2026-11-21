#!/usr/bin/env node
/* @family. — tools/one-helper.js THE ONE-HELPER CHECK (rule 1.75, unify batch 4 lane E).
   A child would notice a settings menu whose names drift from another copy, so the settings groups live once, in
   the settings registry's `type:` rows (data/settings/kinds.json setting.cards: col, label, admin); a list of them anywhere in js/ or backend/ fails the build.
   The tools' shared helpers live once, in tools/lib/gen.js; a tool defining its own S, blockInto, file read (`read`), file walk (`walk`
   over readdirSync) or run-it-myself tail (`require.main === module` with its own try/exit) fails the build: take text, srcFiles and main.
   So does its own stripper (unify batch 8): a comment or BEGIN/END/(generated) block blanked by an inline regex, an uncomment
   function or a SHARED_RE of its own; take bare() and the block regexes.
   OWED lists the files another lane is still moving onto gen.js; each is printed, and dropping off the list is the goal. tools/build.js runs it. */
'use strict';
const { read, S, text, srcFiles, report, main } = require('./lib/gen.js');
const OWED = [];
const HELPERS = [
  [/^\s*(?:const|let|var|function)\s+(S|blockInto)\b/m, m => m[1]],
  [/^\s*(?:const|let|var)\s+read\s*=[^\n]*readFileSync/m, () => 'read'],
  [/^\s*(?:(?:const|let|var)\s+walk\s*=|function\s+walk\s*\()[^\n]*(?:\n[^\n]*){0,1}readdirSync/m, () => 'walk'],
  [/require\.main\s*===\s*module\)\s*\{\s*try\b/, () => 'main tail'],
  [/\.replace\(\s*\/\\\/\\\*|\.replace\([^\n]*:BEGIN\[|\.replace\([^\n]*\\\(generated\\\)|^\s*function\s+uncomment|^\s*(?:const|let|var)\s+SHARED_RE\s*=/m, () => 'stripper'],
];

function helperProblems() {
  const out = [];
  srcFiles('tools', /\.js$/, { deep: true }).filter(f => f !== 'tools/lib/gen.js' && OWED.indexOf(f) === -1).forEach(f => {
    const src = text(f);
    HELPERS.forEach(([re, name]) => { const m = src.match(re); if (m) out.push(f + ' defines its own ' + name(m) + ' (take it from tools/lib/gen.js)'); });
  });
  return out;
}

function groupProblems() {
  const REG = 'data/settings/kinds.json setting.cards';
  const rows = ((((read('data/settings/kinds.json') || {}).kinds || {}).setting || {}).cards || []).filter(r => /^type:/.test(S(r.id)));
  const cols = rows.map(r => S(r.col)).filter(Boolean), bad = [];
  if (!cols.length) bad.push(REG + ' has no type: rows with a col');
  rows.filter(r => S(r.col) && !S(r.label)).forEach(r => bad.push(REG + ' ' + r.id + ' has no label'));
  const esc = c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  srcFiles('js', /\.js$/, { deep: true }).concat(srcFiles('backend', /\.gs$/, { deep: true })).forEach(f => {
    const src = text(f);
    if (/\bSETTING_(GROUPS|TYPES_FALLBACK)\b/.test(src)) bad.push(f + ' keeps a settings-group list by name');
    const hit = cols.filter(c => new RegExp("(?:\\bid:\\s*|\\[\\s*'[A-Z][a-z]+',\\s*)'" + esc(c) + "'").test(src));
    if (hit.length >= 3) bad.push(f + ' lists settings groups (' + hit.join(', ') + ') outside kinds.json setting.cards');
  });
  return { bad, groups: cols.length };
}

function run() {
  const h = helperProblems(), g = groupProblems(), bad = h.concat(g.bad);
  console.log('one-helper: ' + g.groups + ' settings groups from kinds.json setting.cards; ' + h.length + ' tool(s) with their own S/blockInto/read/walk/main tail/stripper'
    + '; owed: ' + (OWED.join(', ') || 'none'));
  report('one-helper', bad);
}
module.exports = { run };
main(module, run);
