#!/usr/bin/env node
/* @family. — tools/build.js THE ONE BUILD (owner, 17 Nov): every generator's run(), in the order each reads what the last wrote, then the bundles, then the stamp. */
/* It writes, then its checks (rule 1.75, owner 17 Nov) fail it if a child or parent would notice something wrong. Run it last, after any change to a source. The apps-script workflow runs it before clasp push. */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
/* THE APP WALKS (facet-hues, finder-tags) hold the whole library in jsdom: one re-run with a bigger heap, not a crash at the default. */
const HEAP = '--max-old-space-size=4096';
if (!process.execArgv.some(a => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, [HEAP, __filename, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(r.status === null ? 1 : r.status);
}
const ORDER = [
  'spec-links',   // questions' spec_ref -> data/spec/aqa-846x.json q: links, data/specs.json; fails on a tag that opens no card
  'kinds',        // data/settings/kinds.json, facets.json -> js/kinds.js
  'tiers',        // tiers.json -> shell piece, js/find-finder.js, index.html's LATER/LAZY/OFF
  'aliases_gs',   // question-aliases.json -> js/qaliases.js (cards-gen copies it on)
  'words',        // words.json -> js/core.js (cards-gen copies it on)
  'cards-gen',    // js/ (words, aliases) -> js/core.js and backend/constants.gs SHARED, backend/cards-gen.gs
  'one-form',     // the one-form check (rule 1.75, job G): every form from data/settings, the phone and the backend refusing on the same gaps; fails the build
  'card-fields',  // the card-fields check (rule 1.75, job J): which fields a card shows, in what order and labelled how, only in kinds.json; a hand list fails the build
  'one-role',    // the one-role check (rule 1.75, owner 21 Nov): role words, ranks, the Message table and may_ rules only in settings.json `roles` and data/settings/roles.js; a twin fails the build
  'permissions',  // -> permissions.json and backend/*.gs blocks
  'word-freq',    // data/pdtexts -> data/word-freq.json
  'facet-hues',   // walks the app over every js/ write above -> TAG_OF, data/facet-graph.json
  'finder-tags',  // walks it again, TAG_OF included -> js/finder-tags.js
  'rules',        // rules.json -> docs/rules.md
  'validate-questions', // the questions marked by the site's own marker -> data/question-status.json (ok / tutor / broken)
  'range-keys',   // the range-key check (rule 1.75, owner 20 Nov): a key whose answer states a numeric tolerance carries a range rule or is listed; fails the build
  'marker-cases', // the marker's known traps (rule 1.75, queue 4c): right answers pass, wrong ones fail; a wrong mark fails the build
  'essay-cases',  // the essay check (rule 1.33, 1.75; ESSAYS, DISTILLED): AQA's examiner-marked 8700 exemplars through rule: levels; agreement printed, below 80% within one level fails the build
  'date-cases',   // the date check (rule 1.75, owner 20 Nov): js/core.js dateOf_/todayIso_ and backend/cards-gen.gs's copies on one table (DD/MM, ISO, BST days, London midnight); a wrong day or a disagreement fails the build
  'docket-plan',  // the Now, Next check (rule 1.75, 1.82, owner 20 Nov): js/map.js dkPlan_ on fixed lists keeps the order rules and is deterministic; fails the build
  'one-paper',    // the one-paper check (rule 1.75, 20 Nov): no two active past papers share board, spec, series and paper number; fails the build
  'source-lines', // the source-lines check (rule 1.75, owner 20 Nov): an English row naming "Source X, lines N to M" gets source_lines, shows them off its insert or is withheld; fails the build
  'one-box',      // the one-box check (rule 1.75, owner 20 Nov): every answer face by qtFace_; more than one box outside a table fails the build
  'email-ink',    // the email-ink check (rule 1.75, 20 Nov): the Sunday email's colours equal style.css tokens, its esc and the card maker's cardUnesc_ round-trip; fails the build
  'digest-clip',  // the digest-clip check (rule 1.75, owner 20 Nov): large weeks through the Sunday email's digestRender_; a part over Gmail's clip or a question without its words fails the build
  'bundle',       // js/ in index.html's order -> bundle/*.js
  'one-request',  // the one-request check (rule 1.75, unify H): one fetch to the backend (backendFetch_), every posted action in actions.json, one dispatcher; fails the build
  'one-card',     // the one-card check (rule 1.75): every Find card by the one maker, no CSS of its own; fails the build
  'dead-css',     // the dead-css check (rule 1.75, owner 20 Nov): classes in style.css nothing writes, counted against a budget; a rise fails the build
  'css-tokens',   // the css-tokens check (rule 1.75, unify batch 2): no raw colour (hex, rgb(), a colour keyword) in style.css outside :root; fails the build
  'profile-roles', // the profile-roles check (rule 1.75, queue 4h): each role's Settings cards held against permissions.json's see rows; a card out of place fails the build
  'shared-lists', // the shared-lists check (rule 1.1 by 1.75, owner 20 Nov): every list or limit both sides keep comes from settings.json via SHARED_SETTINGS, and each rank's Message tiles match mayMessage; fails the build
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
