#!/usr/bin/env node
/* @family. — tools/one-import.js THE ONE-IMPORT CHECK (rule 1.75, unify K, 21 Nov): a library update reaches a child's card one way, and
   the backend reaches the site one way, so a half-applied or doubly-applied import cannot show. Fails the build on:
   - a pack validator or row applier other than backend/library-drive.gs `libPackCheck_` and `libPackApply_` (a second `version` 1
     test, a second write of `libRowOut_` rows, a zip unpacked, a new *Import* function the list below has not been told of);
   - a pack made anywhere but tools/content/library.js `packsOf`, or a `libImport` post from anywhere else;
   - a second deploy route: only .github/workflows/apps-script.yml (clasp, on every release) pushes the backend; no tool pushes code
     (pullFromGitHub stays as the by-hand fallback from the editor);
   - THE EMPTYING GUARD: `libMayEmpty_` is run here on fixed cases. The importer empties Ledger rows whose ids the live public file
     lacks, so it must never empty while the repository holds public rows the site has not released. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, text, srcFiles, report, main } = require('./lib/gen.js');
const ONE = 'backend/library-drive.gs';
/* EVERY *Import* FUNCTION THE BACKEND MAY HAVE: the library's doors into the one importer, and two that are not the library's
   (a docket, rows of its own tab). A new one is a second importer until it is listed here. */
const IMPORTS = new Set(['libImport_', 'libImportList_', 'libImportDrive_', 'libImportHourly', 'libImportKeepBooked_', 'runLibImportDrive_',
  'postLibImport_', 'postLibImportList_', 'postLibImportDrive_', 'postDocketImport_']);

/* WHICH FUNCTION A LINE IS IN, for a top-level `function name(` file. */
function owners(src) {
  let cur = '';
  return src.split('\n').map(l => { const m = l.match(/^function (\w+)\s*\(/); if (m) cur = m[1]; return cur; });
}

function guardCases() {
  const src = text(ONE);
  const fn = (src.match(/^function libMayEmpty_\([\s\S]*?\n}\n/m) || [])[0];
  const min = (src.match(/^const LIB_EMPTY_MIN = (\d+);/m) || [])[1];
  if (!fn || !min) return [ONE + ': no libMayEmpty_ (or LIB_EMPTY_MIN) — the emptying guard must stay explicit'];
  const ctx = vm.createContext({});
  vm.runInContext('const LIB_EMPTY_MIN = ' + min + ';\n' + fn + ';this.may = libMayEmpty_;', ctx);
  /* [live ids, the repository's ids the pack declares, unreleased cards in the pack, rows that would go, may it empty?] */
  const cases = [
    [5000, 5000, 0, 3, true, 'released, a few rows gone'],
    [5000, 5012, 0, 3, false, 'the repository holds 12 public rows the live site has not released'],
    [5000, 5000, 4, 3, false, 'the pack vouches for 4 unreleased cards'],
    [5000, undefined, 0, 3, false, 'a pack that does not say what the repository holds (a hand-written pack)'],
    [0, 5000, 0, 3, false, 'the live file did not read'],
    [40, 40, 0, 1, false, 'a live file too small to trust whole'],
    [5000, 5000, 0, 400, false, 'too many rows at once'],
    [5100, 5000, 0, 2, true, 'the live site is ahead of this checkout'],
  ];
  const bad = [];
  cases.forEach(([live, declared, unreleased, gone, may, said]) => {
    const why = ctx.may(live, declared, unreleased, gone);
    if (!why !== may) bad.push('libMayEmpty_ ' + (may ? 'refuses' : 'allows') + ' emptying when ' + said + (why ? ' (' + why + ')' : ''));
  });
  /* AND THE APPLIER ASKS IT before every emptying write. */
  const apply = (src.match(/^function libPackApply_\([\s\S]*?\n}\n/m) || [''])[0];
  const empty = apply.indexOf('counts[key].emptied'), ask = apply.indexOf('libMayEmpty_(');
  if (empty === -1 || ask === -1 || ask > empty) bad.push(ONE + ': libPackApply_ empties rows without asking libMayEmpty_ first');
  return bad;
}

function run() {
  const bad = [];
  let checks = 0, applies = 0;
  /* ---- THE BACKEND: one validator, one applier, both in library-drive.gs ---- */
  for (const p of srcFiles('backend', /\.gs$/)) {
    const src = text(p), lines = src.split('\n'), who = owners(src);
    lines.forEach((l, i) => {
      const at = p + ':' + (i + 1) + ' (' + (who[i] || 'top') + ')';
      const def = l.match(/^function (\w+)\s*\(/);
      if (def) {
        if (def[1] === 'libPackCheck_') checks++;
        if (def[1] === 'libPackApply_') applies++;
        if (/import/i.test(def[1]) && !IMPORTS.has(def[1])) bad.push(at + ': a function named for importing that tools/one-import.js does not know — a second importer?');
      }
      if (/\.version\)?\s*!==?\s*1\b|version\s*===?\s*1\b/.test(l) && !(p === ONE && who[i] === 'libPackCheck_')) bad.push(at + ': a pack version test outside libPackCheck_ — a second pack validator');
      if (/libRowOut_\(/.test(l) && !(p === ONE && who[i] === 'libPackApply_') && !/^function libRowOut_/.test(l) && !/libCopy_/.test(who[i])) bad.push(at + ': library rows written outside libPackApply_ — a second place that applies rows');
      if (/Utilities\.unzip\b/.test(l)) bad.push(at + ': a zip unpacked — packs come one file at a time');
      if (/script\.googleapis\.com\/v1\/projects/.test(l) && p !== 'backend/sync.gs') bad.push(at + ': the project written outside backend/sync.gs pullFromGitHub — a second deploy');
    });
  }
  if (checks !== 1) bad.push(ONE + ': ' + checks + ' libPackCheck_ (the one pack validator), not one');
  if (applies !== 1) bad.push(ONE + ': ' + applies + ' libPackApply_ (the one place rows are applied), not one');
  /* ---- THE TOOLS: one pack maker, one poster ---- */
  const MAKER = 'tools/content/library.js';
  let makers = 0;
  for (const p of srcFiles('tools', /\.(js|py|sh|mjs|cjs)$/, { deep: true, skip: ['data', 'greek'] })) {
    if (p === 'tools/one-import.js') continue;
    const src = text(p);
    if (p === MAKER) makers = (src.match(/^function packsOf\(/mg) || []).length;
    src.split('\n').forEach((l, i) => {
      const at = p + ':' + (i + 1);
      if (/\bversion:\s*1\b/.test(l) && !(p === MAKER && /pack = \{ version: 1/.test(l))) bad.push(at + ': a pack made outside ' + MAKER + ' packsOf');
      if (/action:\s*'libImport'/.test(l) && p !== MAKER) bad.push(at + ': a libImport post outside ' + MAKER);
      if (/\bclasp\b|script\.googleapis\.com/.test(l)) bad.push(at + ': a tool that pushes backend code — the one deploy is .github/workflows/apps-script.yml');
    });
  }
  if (makers !== 1) bad.push(MAKER + ': ' + makers + ' packsOf (the one pack maker), not one');
  /* ---- DEPLOY: no workflow that pushes the backend ---- */
  const wf = path.join(ROOT, '.github/workflows');
  if (fs.existsSync(wf)) for (const f of fs.readdirSync(wf)) {
    if (f !== 'apps-script.yml' && /\bclasp\b|script\.googleapis\.com/.test(text('.github/workflows/' + f))) bad.push('.github/workflows/' + f + ': a second deploy route — the one is .github/workflows/apps-script.yml');
  }
  if (!fs.existsSync(path.join(wf, 'apps-script.yml'))) bad.push('.github/workflows/apps-script.yml: missing — the backend would never reach Apps Script');
  {
  }
  if (!/^function pullFromGitHub\(/m.test(text('backend/sync.gs'))) bad.push('backend/sync.gs: no pullFromGitHub — the one deploy');
  /* ---- THE GUARD ---- */
  const guard = guardCases();
  bad.push(...guard);
  console.log('one-import: ' + checks + ' pack validator, ' + applies + ' applier, ' + makers + ' pack maker, 1 deploy (apps-script.yml); emptying guard on 8 cases' + (guard.length ? '' : ', all held'));
  report('one-import', bad, 'second path(s) or broken guard', console.error);
}
module.exports = { run };
main(module, run);
