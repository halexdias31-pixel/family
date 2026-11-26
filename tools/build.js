#!/usr/bin/env node
/* @family. — tools/build.js THE ONE BUILD (owner, 17 Nov): every generator's run(), in the order each reads what the last wrote, then the bundles, then the stamp. */
/* It writes, then its checks (rule 1.75, owner 17 Nov) fail it if a child or parent would notice something wrong. Run it last, after any change to a source. The backend deploys one way only: pullFromGitHub (backend/sync.gs) from main (tools/one-import.js). */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
/* THE APP WALKS (facet-hues, finder-tags) hold the whole library in jsdom: one re-run with a bigger heap, not a crash at the default. */
const HEAP = '--max-old-space-size=4096';
if (!process.execArgv.some(a => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, [HEAP, __filename, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(r.status === null ? 1 : r.status);
}
const ORDER = [
  'gen-questions', // data/settings/qgen.json + every data/settings/curriculum/<country>/<subject>.json -> data/questions.json: each mapped template's fixed ten as @family questions, one set per country sub-topic (owner 25 Nov), words in data-private; first, so every later step sees them
  'spec-links',   // questions' spec_ref -> data/spec/aqa-846x.json q: links, data/specs.json; fails on a tag that opens no card
  'kinds',        // data/settings/kinds.json, facets.json -> js/kinds.js
  'tiers',        // tiers.json -> shell piece, js/find-finder.js, index.html's LATER/LAZY/OFF
  'aliases_gs',   // question-aliases.json -> js/qaliases.js (cards-gen copies it on)
  'words',        // words.json -> js/core.js (cards-gen copies it on)
  'cards-gen',    // js/ (words, aliases) -> js/core.js and backend/constants.gs SHARED, backend/cards-gen.gs
  'one-form',     // the one-form check (rule 1.75, job G): every form from data/settings, the phone and the backend refusing on the same gaps; fails the build
  'card-fields',  // the card-fields check (rule 1.75, job J): which fields a card shows, in what order and labelled how, only in kinds.json; a hand list fails the build
  'one-contact', // the one-contact check (rule 1.75, lane D, 21 Nov): phone split, '+44', handle and email rules only in js/form.js; a twin or a site/backend disagreement fails the build
  'one-refusal', // the one-refusal check (rule 1.75, unify batch 6 lane A): a refusal written once (words.json err-*, refuse_), a site link built once (siteLink_); a repeated hand error or a hand SITE_URL link fails the build
  'one-role',    // the one-role check (rule 1.75, owner 21 Nov): role words, ranks and may_ rules only in settings.json `roles` and data/settings/roles.js; a twin fails the build
  'permissions',  // -> permissions.json and backend/*.gs blocks
  'word-freq',    // data/pdtexts -> data/word-freq.json
  'taxonomy',     // the one-taxonomy check (rule 1.75, owner 21 Nov): data/settings/taxonomy.json -> js/find-finder.js TAXONOMY; a History paper or topic part outside it, or a subject case in the engine, fails the build
  'one-idea',     // the one-idea check (rule 1.75, owner 22 Nov: queue step 10; science, item 8, 24 Nov): every maths and GCSE science content card has a topics.json part_of and an idea_id, each group of data/settings/taxonomy.json Maths.ideas one id; fails the build
  'facet-readers', // the facet-readers check (rule 1.75, batch 4 lane B): a one-column facet reads by its facets.json `read`; a hand one-line reader in FACET_READ fails the build
  'facet-hues',   // walks the app over every js/ write above -> TAG_OF, data/facet-graph.json
  'finder-tags',  // walks it again, TAG_OF included -> js/finder-tags.js
  'cards-gen',    // again (26 Nov): facet-hues/finder-tags just rewrote TAG_OF, which backend/cards-gen.gs copies; one-twin failed on the stale copy
  'rules',        // rules.json -> docs/rules.md
  'validate-questions', // the questions marked by the site's own marker -> data/question-status.json (ok / tutor / broken), marking again only questions whose row or marker code changed
  'validate-cache', // the questions' cache check (rule 1.75, queue step 2): on made-up questions a cached verdict equals a fresh one, a changed key or the marker's code marks again; fails the build
  'range-keys',   // the range-key check (rule 1.75, owner 20 Nov): a key whose answer states a numeric tolerance carries a range rule or is listed; fails the build
  'marker-cases', // the marker's known traps (rule 1.75, queue 4c): right answers pass, wrong ones fail; a wrong mark fails the build
  'essay-cases',  // the essay check (rule 1.33, 1.75; ESSAYS, DISTILLED): AQA's examiner-marked 8700 exemplars through rule: levels; agreement printed, below 80% within one level fails the build
  'date-cases',   // the date check (rule 1.75, owner 20 Nov): js/core.js dateOf_/todayIso_ and backend/cards-gen.gs's copies on one table (DD/MM, ISO, BST days, London midnight); a wrong day or a disagreement fails the build
  'docket-onelist', // the one-list Docket (rule 1.75, 1.82, owner 25 Nov night): js/map.js dkSort_ keeps Overdue, Now (8h), dated, undated, Done, an 8h item back each third, and docketOneList25NovRun_ in the backend vm merges the two lists into one, names only, backup first, a re-run a no-op; proved by mutation; fails the build
  'docket-inbox', // the docket inbox check (rule 1.75, owner 25 Nov; one list 25 Nov night): docketInboxRun_ in the backend vm puts docket_inbox rows into the one list as undated one-offs (title only), skips dupes, replaces and delete-only rows remove, backs up, clears the rows, an empty tab a no-op; proved by mutation; fails the build
  'docket-fresh', // the fresh-Docket check (rule 1.75, owner 25 Nov): a save on a stale todo cell is refused and the cell unchanged, the Docket opened with a stale cache draws the server's lists, no save before a fresh read; proved by mutation; fails the build
  'docket-address', // the private address check (rule 1.75, owner 21 Nov; one list 25 Nov night): the plain-text ?docket= address refuses a wrong or missing token, says the card's order, ticks "done shower" and adds "add milk" to the one list; fails the build
  'backend-loads', // the backend loads (22 Nov: the site was down): every .gs file run in Apps Script's A–Z order with Google's services stubbed; a top-level line reading a later file's name fails the build
  'eink',       // the e-ink check (rule 1.75, owner 21 Nov): ?eink's page shows the Docket's open items in the card's order (dkSort_); fails the build
  'one-paper',    // the one-paper check (rule 1.75, 20 Nov): no two active past papers share board, spec, series and paper number; fails the build
  'one-set',      // the one-set check (rule 1.75, owner 23 Nov: UNIFY item 3, ONE QUESTION SET): set kinds = 1 (Question set), every question in exactly one set, no kind word on a question, a family card or a kind test in code; each break proved caught; fails the build
  'one-status',   // the one-status check (rule 1.75, owner 23 Nov: UNIFY items 4 and 5): one status set (not tried / right / part right / wrong, hidden) worded once, said the same on cards, Find, history and the Sunday email; one mark result { marks, outOf, verdict, why } from every marker; proved by mutation
  'one-paper-fact', // the one-paper-fact check (rule 1.75, owner 21 Nov): a question keeps none of its paper's facts byte-identical (kinds.json sheet.lib.joined), no source_id equal to its paper_id, and the backend and client join from one list; fails the build
  'source-lines', // the source-lines check (rule 1.75, owner 20 Nov): an English row naming "Source X, lines N to M" gets source_lines, shows them off its insert or is withheld; fails the build
  'one-box',      // the one-box check (rule 1.75, owner 20 Nov): every answer face by qtFace_; more than one box fails the build
  'vertex-letters', // the corner-letters check (rule 1.75, owner 25 Nov): every figure whose question names corner letters (triangle ABC, side AB) draws them, Corbettmaths and First Class Maths owing none but those listed, other sets on a falling budget; --prove; fails the build
  'three-faces',  // the three-faces check (rule 1.75, owner 22 Nov: queue step 4): every active question's face by qtFace_ is type, pick or draw, every qengine type's too, no camera or photo code; fails the build
  'one-cells',    // the fill-a-table check (rule 1.75, owner 23 Nov): a table a box a cell, rows written whole in any order, the rest by place; fails the build
  'email-ink',    // the email-ink check (rule 1.75, 20 Nov): the Sunday email's colours equal style.css tokens, its esc and the card maker's cardUnesc_ round-trip; fails the build
  'digest-clip',  // the digest-clip check (rule 1.75, owner 20 Nov): large weeks through the Sunday email's digestRender_; a part over Gmail's clip or a question without its words fails the build
  'one-email',    // the one-email check (rule 1.75, queue step 8, 22 Nov): every email the backend builds, MailApp stubbed, through one card (email.gs emailOf_) with the same recipients, words and links as before (tools/data/one-email.json); fails the build
  'bundle',       // js/ in index.html's order -> bundle/*.js
  'all-buttons',  // the all-buttons check (rule 1.75, 1.83, owner 23 Nov): every question part shows every qengine.json buttons tile, the same set in the same order (qtools-row.js qtAll_), and no More or ⋯ hides actions anywhere; fails the build
  'one-canvas',   // the one-canvas check (rule 1.75, owner 23 Nov: ONE DRAWING CANVAS): one draw type, every drawn key in the one form (a frame, pieces), a tap-script of each sampled key across the 8 old setups Right on a phone and an iPad and a wrong drawing not; --prove breaks each; fails the build
  'one-attachment', // the one-attachment check (rule 1.75, owner 23 Nov, queue item 6): source texts, sheets and tables one kind (data/inserts.json, `of` a tag), every question's attachments resolve, each opened by the one Insert tile (attachOpen_ by openStep_) on a phone and an iPad; fails the build
  'one-fact',     // the one-fact check (rule 1.75, owner 20 Nov: @FAMILY SCIENCE QUESTIONS FROM THE LIBRARY): every AQA 8461/2/3 Foundation fact an id for life (data/facts.json), asked by at least one @family question, each question's key backed by the facts it tests, a changed one a new version with the old kept; proved by mutation; fails the build
  'one-topic',    // the one-topic-tree check (rule 1.75, owner queue item 7, 24 Nov): every maths and science question points at one idea or is unmapped within budget (idea_id from data/settings/question-ideas.json, tools/lib/qideas.js), Find's topic for it is that idea's name, unmapped held at a budget that may only fall; fails the build
  'spec-tree',    // the spec reader (owner 26 Nov: a country's spec in, the tree out mechanically): data/settings/curriculum/<country>/sources (the gov.uk PDFs' stored text, layouts as data) -> <country>/headings.json, the generated tree sources/tree-<subject>.json, docs/curriculum-diff-<country>.md (switched live only if tagging and generated questions do not fall) and docs/curriculum-gaps.md (statements rules.json matches to no generator); the stored text its manifest's, the same bytes twice and in a fresh process, every statement matched or listed; --prove breaks each; fails the build
  'one-curriculum', // the curriculum check (rule 1.75, owner 24–25 Nov: the library's one source of truth is the government spec; 25 Nov: a country is one file): every node of every data/settings/curriculum/<country>/<subject>.json cites its document, every GCSE statement a sub-topic, every mapped template exists; the made-up tools/fixtures/curriculum/xx makes its questions, tags and Find topics with nothing else changed and never ships; every maths question's dfe from the files (coverage counted, untagged on a falling budget); Find's maths topics curriculum names only, never a worksheet title; --prove breaks each; fails the build
  'one-gen',      // the generated-question check (rule 1.75, owner queue item 6; owner 25 Nov): the version a fingerprint of the template and its country node, the rows in data/questions.json emit()'s; every data/settings/qgen.json template mapped by a country to a sub-topic (the UK's at GCSE Foundation), 200 seeds each read whole, its id makes the same question again, typed answers marked right and a near miss wrong by the site's own marker; nothing the site loads reads qgen.json; --prove breaks each; fails the build
  'one-shown',    // the one-shown check (rule 1.75, owner 26 Nov): settings.json library.show "generated" lets only the @family generated sets' questions into Find (no other question, no insert), "all" brings every one back; a break is made and caught each run; fails the build
  'one-opening',  // the one-opening check (rule 1.75, owner queue item 9, 24 Nov): Find opens on one question (What kind), its answers the kinds.json doors, none asked twice, and every chip on the page named from the phrasebook (only PIN dots a bare *); --prove breaks each; fails the build
  'one-answer-card', // the one-answer-card check (rule 1.75, owner 23 Nov: "uniformalize the answers"): each answer face's (pick, number, table, essay) answer card has its question card's parts, order, tags and button row (greyed only where it writes or marks), its answer in the question's own box read-only, and the email's answer in their answer's box; --prove breaks each; fails the build
  'one-order',    // the one-order check (rule 1.75, owner 24 Nov: general before specific): Find's tags in one fixed order per door whatever was tapped, never a tag before one it nests in, and every Practice and Library item reachable by forward taps (counted); --prove breaks each; fails the build
  'paper-cards',  // the paper-cards check (rule 1.75, owner 23 Nov): a child on an iPad taps Find down to one exam paper (a sample across boards and subjects, words made up) and its question cards are drawn under the chips; a blank page fails the build
  'keypad-taps',  // the keypad check (rule 1.75, owner 23 Nov: "Hegarty Maths always worked"): each maths form and a sample of every answer type tapped on the one pad's keys and marked Right, on a 390px phone and an iPad; a key that turns the pad over, a key off the screen or a glaring/full-width answer box fails the build
  'one-sheet',    // the one-sheet check (rule 1.75, owner 24 Nov): every active part drawn on exactly one answer sheet, its lines from its data, no answer element outside it, no face or face-swap tile; `--prove` breaks it four ways; fails the build
  'one-profile-save', // the one-profile-save check (rule 1.75, unify batch 9 job A): one profile send (profileSave_), one fieldReadonly_; fails the build
  'one-request',  // the one-request check (rule 1.75, unify H): one fetch to the backend (backendFetch_), every posted action in actions.json, one dispatcher; fails the build
  'one-door-same', // the same-answer check (rule 1.75, queue step 6, 22 Nov): every merged action, by its old name and by the item door, answers made-up rows as it did before the cut (tools/data/one-door-same.json); fails the build
  'one-ledger-kinds', // the nothing-lost check (rule 1.75, queue step 7, 22 Nov): each one-off migration moving kinds out of the Ledger's items tab, run on made-up rows, keeps every row in its backup tab, leaves every other reader the same, and does nothing the second time; fails the build
  'one-action-roles', // the no-widening check (rule 1.75, owner 22 Nov: queue step 6): every old action name, alias of a kind:verb item or not, may be called by no tier it could not before (tools/data/action-roles-before.json); fails the build
  'one-import',   // the one-import check (rule 1.75, unify K): one pack validator and applier (libPackCheck_, libPackApply_), one pack maker, one deploy (pullFromGitHub), the emptying guard on fixed cases; fails the build
  'one-list',     // the one-list check (rule 1.75, UNIFY NEXT 2, 22 Nov): each list in data/settings/*.json written once, named elsewhere (role tiers, a content family's qualification); fails the build
  'one-word',     // the one-word check (rule 1.75, unify batch 6 lane B): a js literal of 12+ characters equal to a words.json value is read through text_(key); another lane's owed file is printed as owed; fails the build
  'one-plural',   // the one-plural check (rule 1.75, unify batch 5 job R): every count's word by js/core.js plural_ (copied to the backend); an inline n === 1 ? '' : 's' or a changed fixed case fails the build
  'one-price',    // the one-price check (rule 1.75, owner 21 Nov): one price formula and one open rate (config open_tutor_rate) in js/core-price.js; a hand rate or second sum fails the build
  'one-lock',     // the one-lock check (rule 1.75, unify batch 7): the backend's write lock, "Nothing was saved." and Drive file links only in backend/write-lock.gs; fails the build
  'one-table',    // the one-table check (rule 1.75, unify batch 7): keep-booked jobs, digest skip reasons and the site-then-raw fetch each live once; fails the build
  'one-wrapper',  // the one-wrapper check (rule 1.75, unify batch 8): one IndexedDB wrapper, one tile-row wrap, one spelling of the pointer queries; fails the build
  'one-helper',   // the one-helper check (rule 1.75, unify batch 4): settings groups only in kinds.json setting.cards, tool helpers only in tools/lib/gen.js; fails the build
  'one-twin',     // the one-twin check (rule 1.75, unify batch 7): no backend twin of a site function cards-gen.gs copies, the copies current; fails the build
  'share-picture', // the share-picture check (rule 1.75, owner 22 Nov): Share on a sample of question types on an iPhone 13 (WebKit and Chromium); a picture almost all one colour fails the build
  'one-step',     // the one-step check (rule 1.75, owner 22 Nov: UNIFY NEXT 3): every opener one step by openStep_, Back pops one to the same scroll; old openers fail the build
  'timetable-clash', // the timetable-clash check (rule 1.75, owner 26 Nov, owner-only): js/form.js clashOf_ and its backend copy; an overlap the same day refused and named on the phone and in itemWrite_, touching ends, another day, another term and an edit in place allowed; mutations caught
  'docket-look',  // the Docket like Google Tasks (owner 25 Nov night, owner-only): one card, sorted Overdue/Now/dated/undated, each line tick + title, a tap shows only Edit and Delete, ticked fold into Done (n), quick add; fails the build
  'one-list-kind', // the one-list-kind check (rule 1.75, owner 22 Nov: UNIFY NEXT 6): Docket, Assignments, Tasks and Food one list kind (kinds.json `list`), saved through listTidy_ and drawn as one Item; fails the build
  'one-card',     // the one-card check (rule 1.75): every Find card by the one maker, no CSS of its own; fails the build
  'one-answer',   // the one-answer-format check (rule 1.75, owner 23 Nov: UNIFY AFTER 7): every pick question's key choice_right in its options' letters, its working a note in answer; any other key fails the build
  'one-shape',    // the one-question-shape check (rule 1.75, owner 23 Nov): every question row stem + one answer + its key + a note; each oddity kind (tools/lib/shape.js) held at 0 or a budget that can only fall; off budget fails the build
  'one-question-card', // the one-question-card check (rule 1.75, owner 22 Nov): the Sunday email's question card has the site card's parts in its order (kinds.json card.question.parts), a pick question's options marked and its answer as the site says it; fails the build
  'one-email-card', // the one-email-card check (rule 1.75, owner 23 Nov, UNIFY AFTER 5): every email card's parts and order are its site card's (kinds.json card.record/card.tags, said by card.letter.words; the question card by one-question-card), no email-only list, no price to a child or with prices off; fails the build
  'one-tag-set',  // the one-tag-set check (rule 1.75, owner 23 Nov, UNIFY AFTER 6): every Find card and Sunday-email question card wears only data/settings/tags.json's kinds, one of each, at most its max; fails the build
  'one-settings-card', // the one-settings-card check (rule 1.75, owner 22 Nov): every Settings card the one card, its rows text, field or item (kinds.json setting.cardType, setting.rows); fails the build
  'dead-css',     // the dead-css check (rule 1.75, owner 20 Nov): classes in style.css nothing writes, counted against a budget; a rise fails the build
  'dead-fn',      // the dead-fn check (rule 1.75, unify batch 6 lane E): a top-level function in js/ that nothing in js/, index.html, backend/, tools/ or data/ names fails the build
  'css-tokens',   // the css-tokens check (rule 1.75, unify batch 2): no raw colour (hex, rgb(), a colour keyword) in style.css outside :root; fails the build
  'profile-roles', // the profile-roles check (rule 1.75, queue 4h): each role's Settings cards held against permissions.json's see rows; a card out of place fails the build
  'hist-db',      // the one-history-shape check (rule 1.75, unify batch 4): the four history kinds come from js/library.js HIST_DB and labels.json hist-link/hist-kind; a prefix list, kind label or link-column list written elsewhere fails the build
  'shared-lists', // the shared-lists check (rule 1.1 by 1.75, owner 20 Nov): every list or limit both sides keep comes from settings.json via SHARED_SETTINGS; fails the build
  'build-stamp',  // everything served -> index.html's BUILD_STAMP; last
];
(async () => {
  const t0 = Date.now();
  /* ONE SERVER AND ONE BROWSER PER ENGINE for every browser check (tools/lib/site-browser.js), closed once at the end. */
  const SB = require('./lib/site-browser.js');
  SB.share();
  for (const name of ORDER) {
    const file = path.join(__dirname, name + '.js');
    if (!fs.existsSync(file)) { console.log(name + ': gone, skipped'); continue; }
    const t = Date.now();
    await require(file).run();
    console.log('  (' + name + ' ' + ((Date.now() - t) / 1000).toFixed(1) + 's)');
  }
  await SB.closeAll();
  console.log('build: done in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  process.exit(0);
})().catch(e => { console.error('build: ' + (e && e.stack || e)); process.exit(1); });
