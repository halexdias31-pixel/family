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
const { read, S, text, srcFiles, report, main, bare } = require('./lib/gen.js');
const OWED = [];
const HELPERS = [
  [/^\s*(?:const|let|var|function)\s+(S|blockInto)\b/m, m => m[1]],
  [/^\s*(?:const|let|var)\s+read\s*=[^\n]*readFileSync/m, () => 'read'],
  [/^\s*(?:(?:const|let|var)\s+walk\s*=|function\s+walk\s*\()[^\n]*(?:\n[^\n]*){0,1}readdirSync/m, () => 'walk'],
  [/require\.main\s*===\s*module\)\s*\{\s*try\b/, () => 'main tail'],
  [/\.replace\(\s*\/\\\/\\\*|\.replace\([^\n]*:BEGIN\[|\.replace\([^\n]*\\\(generated\\\)|^\s*function\s+uncomment|^\s*(?:const|let|var)\s+SHARED_RE\s*=/m, () => 'stripper'],
];

/* THE CHECKS' HARNESSES (UNIFY NEXT 1, 22 Nov) live once in tools/lib/: the backend in a vm (backend-vm.js), the site on a phone (site-browser.js),
   the site's data (site-data.js). A tool that stubs Google and runs the .gs files itself, serves the site to a browser or launches one itself, or
   reads kinds/settings/words/permissions/questions json by hand fails the build. HARNESS_OWED: tools that are not build checks, still on their own. */
const HARNESS_OWED = ['tools/gallery.js', 'tools/wait.js', 'tools/diagram_png.js'];
const HARNESS = [
  ['tools/lib/backend-vm.js', src => /(['"])SpreadsheetApp\1\s*,\s*(['"])DriveApp/.test(src) || (/readdirSync\([^\n]*backend/.test(src) && /\.gs['"]/.test(src) && /vm\.runIn/.test(src)), 'backend vm'],
  ['tools/lib/site-browser.js', src => /http\.createServer/.test(src) && /playwright/.test(src), 'site server'],
  ['tools/lib/site-browser.js', src => /\b(?:chromium|webkit|firefox)\.launch\(|\]\.launch\(/.test(src), 'browser launch'],
  ['tools/lib/site-data.js', src => /(?:readFileSync|require)\([^)\n]*(?:settings\/(?:kinds|settings|words|permissions)|questions)\.json/.test(src), 'data read'],
];
function harnessProblems() {
  const out = [];
  srcFiles('tools', /\.js$/, { deep: true }).filter(f => !/^tools\/lib\//.test(f) && HARNESS_OWED.indexOf(f) === -1).forEach(f => {
    const src = text(f);
    HARNESS.forEach(([lib, hit, name]) => { if (hit(src)) out.push(f + ' rolls its own ' + name + ' (take it from ' + lib + ')'); });
  });
  return out;
}

/* THE ONE IMPORTER (UNIFY NEXT 5, 22 Nov): data/questions.json and data-private/ are written through tools/lib/import.js (writeCards,
   writeWords), the steps tools/content.js runs for every source. A tool that writes either itself fails the build. IMPORT_OWED: the
   one-off row editors from before the importer (run between `library join` and `library split`), printed until each moves onto it. */
const IMPORT_OWED = ['tools/draw-1f-1705-q13.py', 'tools/draw-chem-8462-1F.py', 'tools/draw-figures-q3.py', 'tools/draw-money-coins.py',
  'tools/refine-1f-2406-p1.py', 'tools/set-accept.py', 'tools/set-choices.py', 'tools/set-spec-codes.py', 'tools/typeset-plain-maths.py', 'tools/greek/write.py'];
const IMPORT_LIB = 'tools/lib/import.js';
function writesLibrary(f, src) {
  if (/\.py$/.test(f)) {
    const names = /['"](?:[\w./-]*\/)?questions\.json['"]|['"]questions\.json['"]|['"][^'"\n]*data-private[^'"\n]*['"]/.test(src);
    return names && /open\([^)\n]*['"]w['"]|\.write_text\(|json\.dump\(/.test(src);
  }
  if (/\bwritePrivate\(/.test(src.replace(/function writePrivate\(/g, ''))) return true;
  if (/writeFileSync\([^\n]*(?:questions\.json|def\.file|\bPRIV\b|data-private)/.test(src)) return true;
  return /\bwriteFileSync\(/.test(src) && /\bfileText\(/.test(src);
}
function importProblems() {
  const out = [];
  srcFiles('tools', /\.(js|py)$/, { deep: true }).filter(f => f !== IMPORT_LIB && !/^tools\/lib\/lib-full\.js$/.test(f) && IMPORT_OWED.indexOf(f) === -1).forEach(f => {
    if (writesLibrary(f, /\.js$/.test(f) ? bare(text(f), { comments: 'js' }) : text(f))) out.push(f + ' writes data/questions.json or data-private/ itself (go through ' + IMPORT_LIB + ': node tools/content.js <source>)');
  });
  return out;
}

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
  const h = helperProblems(), x = harnessProblems(), g = groupProblems(), w = importProblems(), bad = h.concat(x, g.bad, w);
  console.log('one-helper: ' + g.groups + ' settings groups from kinds.json setting.cards; ' + h.length + ' tool(s) with their own S/blockInto/read/walk/main tail/stripper'
    + '; ' + x.length + ' check(s) with a harness of their own; ' + w.length + ' tool(s) writing the library past the importer; owed: ' + (OWED.concat(HARNESS_OWED, IMPORT_OWED).join(', ') || 'none'));
  report('one-helper', bad);
}
module.exports = { run };
main(module, run);
