#!/usr/bin/env node
/* @family. — tools/build.js THE ONE BUILD (owner, 17 Nov): every generator's run(), in the order each reads what the last wrote, then the bundles, then the stamp. */
/* It writes; it never gates (rule 1.75). Run it last, after any change to a source. The apps-script workflow runs it before clasp push. */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
/* THE APP WALKS (facet-hues, finder-tags) hold the whole library in jsdom: one re-run with a bigger heap, not a crash at the default. */
const HEAP = '--max-old-space-size=4096';
if (!process.execArgv.some(a => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, [HEAP, __filename, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(r.status === null ? 1 : r.status);
}
const ORDER = [
  'kinds',        // data/settings/kinds.json, facets.json -> js/kinds.js
  'tiers',        // tiers.json -> shell piece, js/find-finder.js, index.html's LATER/LAZY/OFF
  'aliases_gs',   // question-aliases.json -> js/qaliases.js (cards-gen copies it on)
  'words',        // words.json -> js/core.js (cards-gen copies it on)
  'cards-gen',    // js/ (words, aliases) -> js/core.js and backend/constants.gs SHARED, backend/cards-gen.gs
  'columns_gs',   // columns.json + LAYOUT_COL -> backend/constants.gs (may be gone)
  'permissions',  // -> permissions.json and backend/*.gs blocks
  'word-freq',    // data/pdtexts -> data/word-freq.json
  'facet-hues',   // walks the app over every js/ write above -> TAG_OF, data/facet-graph.json
  'finder-tags',  // walks it again, TAG_OF included -> js/finder-tags.js
  'rules',        // rules.json -> docs/rules.md
  'bundle',       // js/ in index.html's order -> bundle/*.js
  'build-stamp',  // everything served -> index.html's BUILD_STAMP; last
];
(async () => {
  const t0 = Date.now();
  for (const name of ORDER) {
    const file = path.join(__dirname, name + '.js');
    if (!fs.existsSync(file)) { console.log(name + ': gone, skipped'); continue; }
    const t = Date.now();
    await require(file).run();
    console.log('  (' + name + ' ' + ((Date.now() - t) / 1000).toFixed(1) + 's)');
  }
  console.log('build: done in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  process.exit(0);
})().catch(e => { console.error('build: ' + (e && e.stack || e)); process.exit(1); });
