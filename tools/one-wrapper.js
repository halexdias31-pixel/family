#!/usr/bin/env node
/* @family. — tools/one-wrapper.js THE ONE-WRAPPER CHECK (rule 1.75, unify batch 8 lane D).
   A child would notice a kept game, save or library copy that one wrapper forgets differently, a row of tiles spaced unlike the others,
   or a hover that works on one card and not the next. So: IndexedDB is opened once, in js/library.js `idbTx_`; a `.tile-row` around
   `tile_(…)` is written once, in js/tiles.js `tileWrap_`; the pointer queries are spelled once, in js/shell-click.js (CAN_HOVER_, COARSE_).
   Any second copy in js/ fails the build. tools/build.js runs it. */
'use strict';
const { text, srcFiles, report, main } = require('./lib/gen.js');

const RULES = [
  { what: 'an IndexedDB open (use idbTx_)', re: /indexedDB\.open\s*\(/g, home: 'js/library.js', max: 1 },
  { what: 'hand tile-row markup around tile_ (use tileWrap_)', re: /<div class="tile-row[^"]*">\$\{tile_\(/g, home: 'js/tiles.js', max: 0 },
  { what: 'a pointer media query literal (use CAN_HOVER_/COARSE_)', re: /['"`]\((?:hover: hover|pointer: (?:fine|coarse))\)/g, home: 'js/shell-click.js', max: 2 },
];

function run() {
  const bad = [], seen = RULES.map(() => 0);
  srcFiles('js', /\.js$/, { deep: true }).forEach(f => {
    const src = text(f);
    RULES.forEach((r, i) => {
      const n = (src.match(r.re) || []).length;
      if (!n) return;
      if (f === r.home) { seen[i] += n; if (n > r.max) bad.push(f + ' has ' + n + ' × ' + r.what + ', at most ' + r.max); }
      else bad.push(f + ' has ' + r.what);
    });
  });
  RULES.forEach((r, i) => { if (r.max && !seen[i]) bad.push(r.home + ' no longer holds ' + r.what.replace(/ \(.*/, '') + ': move the check with it'); });
  console.log('one-wrapper: ' + RULES.map((r, i) => r.home + ' ' + seen[i]).join(', ') + '; ' + bad.length + ' copy(ies) elsewhere');
  report('one-wrapper', bad);
}
module.exports = { run };
main(module, run);
