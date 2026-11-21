#!/usr/bin/env node
/* @family. — tools/one-twin.js THE ONE-TWIN CHECK (rule 1.75, unify batch 7): the Sunday email tags a question as the site's card does,
   because the site's readers are copied into backend/cards-gen.gs (tools/cards-gen.js TAKE), never ported by hand.
   Fails the build when: a backend file other than cards-gen.gs declares a name cards-gen.gs copies (a second, hand-kept twin); a retired
   hand port (RETIRED) comes back; a kept wrapper (WRAPPERS) stops calling its site function or grows past WRAP_MAX lines; or
   backend/cards-gen.gs is not what tools/cards-gen.js builds from the site today (the copies drifted). Counted site-wide. tools/build.js runs it. */
'use strict';
const path = require('path');
const { ROOT, text, srcFiles, report, main } = require('./lib/gen.js');
const CARDS = 'backend/cards-gen.gs';
/* THE HAND PORTS THIS CHECK RETIRED, each beside the site function that now stands for it in cards-gen.gs. */
const RETIRED = [
  ['digestLevelsIn_', 'levelsIn_'], ['digestLevels_', 'LEVEL_TABLE'], ['digestTagSats_', 'satsStagesOf_'], ['digestTagStages_', 'keyStagesOf_'],
  ['digestTagYearOf_', 'yearOf'], ['digestTagSeries_', 'seriesOf_'], ['digestTagMonthAt_', 'waveOf'], ['DIGEST_MONTHS', 'MONTH_NAMES'],
  ['DIGEST_ROMAN', 'ROMAN_ONLY'],
];
/* THE BACKEND NAMES KEPT AS THIN WRAPPERS: [file, name, the site function it must call]. */
const WRAPPERS = [
  ['backend/digest-tags.gs', 'digestTagLevel_', 'levelsOf_'], ['backend/digest-tags.gs', 'digestTagKeystage_', 'satsStagesOf_'],
  ['backend/digest-tags.gs', 'digestTagWave_', 'waveOf'], ['backend/digest-tags.gs', 'digestTagSplit_', 'partSplit_'],
  ['backend/core.gs', 'rulesClean_', 'rulesSane_'],
];
const WRAP_MAX = 8;
/* A file's top-level `function NAME` / `const|let|var NAME`, each with its source text (acorn, so a function nested in another is not one). */
function decls(src) {
  const acorn = require(path.join(ROOT, 'node_modules', 'acorn')), out = {};
  acorn.parse(src, { ecmaVersion: 2022 }).body.forEach(n => {
    if (n.type === 'FunctionDeclaration') out[n.id.name] = src.slice(n.start, n.end);
    else if (n.type === 'VariableDeclaration') n.declarations.forEach(d => { if (d.id.type === 'Identifier') out[d.id.name] = src.slice(n.start, n.end); });
  });
  return out;
}
function problems() {
  const bad = [], gen = require('./cards-gen.js');
  const copied = Object.keys(decls(text(CARDS)));
  const want = gen.build();
  if (text(CARDS) !== want) bad.push(CARDS + ' is not what tools/cards-gen.js builds from the site today (run `node tools/cards-gen.js`; never edit the copy)');
  const at = {};
  srcFiles('backend', /\.gs$/).filter(f => f !== CARDS).forEach(f => { at[f] = decls(text(f)); });
  Object.keys(at).forEach(f => {
    copied.forEach(n => { if (at[f][n]) bad.push(f + ' declares `' + n + '`, which cards-gen.gs copies from the site: call the copy'); });
    RETIRED.forEach(([n, site]) => { if (at[f][n]) bad.push(f + ' brings back `' + n + '`, a hand port of the site\'s `' + site + '` (cards-gen.gs has it)'); });
  });
  WRAPPERS.forEach(([f, n, site]) => {
    const body = (at[f] || {})[n];
    if (copied.indexOf(site) === -1) bad.push('tools/cards-gen.js TAKE no longer copies `' + site + '`, which ' + f + ' `' + n + '` wraps');
    if (!body) return;
    if (!new RegExp('\\b' + site.replace(/\$/g, '\\$') + '\\(').test(body)) bad.push(f + ' `' + n + '` no longer calls the site\'s `' + site + '`');
    const lines = body.split('\n').length;
    if (lines > WRAP_MAX) bad.push(f + ' `' + n + '` is ' + lines + ' lines: a wrapper of `' + site + '` stays under ' + WRAP_MAX);
  });
  return { bad, copied: copied.length, files: Object.keys(at).length };
}
function run() {
  const r = problems();
  report('one-twin', r.bad, 'hand-kept twin(s) of the site\'s code in backend/ (tools/cards-gen.js copies them)');
  console.log('one-twin: ' + r.copied + ' copied names, none re-declared in ' + r.files + ' backend files; ' + WRAPPERS.length + ' wrappers thin; cards-gen.gs current');
}
module.exports = { run, problems };
main(module, run);
