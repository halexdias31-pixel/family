#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-tag-cards.js EVERY TAG IS A CARD (owner, 13 Nov, rule 5.6): each facet value is the name of exactly one card in Find. */
/* Counts tags with no card and tags with two; the counts sit in check/tag-cards-ratchet.json and only go down (`--lower`). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), RATCHET = path.join(ROOT, 'check/tag-cards-ratchet.json');
const VERBOSE = process.argv.includes('-v') || process.env.VERBOSE === '1';

(async () => {
  const t0 = Date.now();
  const { app, tick } = require('../check/jsdom-app.js');
  const A = await app(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')));
  const ev = s => A.w.__ev(s);
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('check-tag-cards: the app never settled in 240s — NOT checked'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  /* A CARD NAMES A TAG when its name, spelt as Find spells it, is the tag's value; every facet's every value is a tag. */
  const by = JSON.parse(ev(`(() => inFinder_(FINDERS.stuff, () => {
    USER = Object.assign({ name: 'T', personId: 'P-T' }, { role: 'Admin', roles: ['admin'] });
    STUFF.filters = []; STUFF.admit = null;
    const items = stuffItemsAll_(), k = s => spellKey_(String(s == null ? '' : s)), names = {};
    items.forEach(x => { const n = k(x.name || x.title || x.key); if (n) names[n] = (names[n] || 0) + 1; });
    const out = {};
    facetList().forEach(f => { let vals = []; try { vals = facetValues(items, f); } catch (e) { return; }
      const o = out[f.label + ' (' + f.field + ')'] = { tags: 0, missing: [], twice: [] };
      vals.forEach(v => { const n = names[k(v.value)] || 0; o.tags++; if (!n) o.missing.push(String(v.value)); else if (n > 1) o.twice.push(String(v.value)); }); });
    return JSON.stringify(out); }))()`));
  const facets = Object.keys(by).sort((a, b) => by[b].missing.length - by[a].missing.length);
  const now = { missing: 0, twice: 0, tags: 0 };
  facets.forEach(f => { now.missing += by[f].missing.length; now.twice += by[f].twice.length; now.tags += by[f].tags; });
  let was = null; try { was = JSON.parse(fs.readFileSync(RATCHET, 'utf8')); } catch (e) { was = null; /* none yet: --lower writes it */ }
  if (process.argv.includes('--lower')) {
    if (was && (now.missing > was.missing || now.twice > was.twice)) { console.log(`FAILED — will not raise the ratchet: missing ${was.missing}→${now.missing}, twice ${was.twice}→${now.twice}`); process.exit(1); }
    const per = {}; facets.forEach(f => { if (by[f].missing.length || by[f].twice.length) per[f] = { missing: by[f].missing.length, twice: by[f].twice.length }; });
    fs.writeFileSync(RATCHET, JSON.stringify({ say: 'Tags with no card, and tags with two. Only goes down: node js/check-tag-cards.js --lower', tags: now.tags, missing: now.missing, twice: now.twice, per }, null, 1) + '\n');
    console.log(`check-tag-cards: ratchet written — ${now.missing} of ${now.tags} tags have no card, ${now.twice} have two`); process.exit(0);
  }
  if (VERBOSE) facets.forEach(f => { const o = by[f]; if (o.missing.length || o.twice.length) console.log(`  ${f}: ${o.missing.length}/${o.tags} no card, ${o.twice.length} twice — ${o.missing.slice(0, 5).join(', ')}`); });
  if (!was) { console.log('FAILED — no ratchet yet: node js/check-tag-cards.js --lower'); process.exit(1); }
  if (now.missing > was.missing || now.twice > was.twice) {
    console.log(`FAILED — every tag is a card: ${now.missing} tags have no card (ratchet ${was.missing}), ${now.twice} have two (ratchet ${was.twice}); -v lists them`); process.exit(1);
  }
  const lower = now.missing < was.missing || now.twice < was.twice ? ' — lower the ratchet: node js/check-tag-cards.js --lower' : '';
  console.log(`check-tag-cards: OK — ${now.missing} of ${now.tags} tags still have no card, ${now.twice} have two (ratchet holds)${lower}`);
  process.exit(0);
})().catch(e => { console.error('check-tag-cards: ' + (e && e.stack || e)); process.exit(2); });
