#!/usr/bin/env node
/* @family. — tools/kinds.js: writes js/kinds.js, the browser's copy of data/settings/kinds.json (every kind, and the front doors in order) and facets.json (every facet's label and order). */
/* Edit the JSON, never js/kinds.js. tools/build.js runs it. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const { main } = require('./lib/gen.js');
const ROOT = path.resolve(__dirname, '..');
function run() {
  const j = SD.json('data/settings/kinds.json');
  /* THE FRONT DOORS ARE SAID ONCE (rule 1.75, batch 6): every `find.under` (a kind's or an entry's) is a `doors` name, each named once,
     so Find's first menu never shows a door out of the owner's order. */
  const doors = (j.doors || []).map(d => d && d.name), bad = [];
  doors.forEach((d, i) => { if (!d || doors.indexOf(d) !== i) bad.push('doors[' + i + '] ' + JSON.stringify(d) + ' is blank or twice'); });
  const under = (k, f) => String((f && f.under) || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => { if (doors.indexOf(t) < 0) bad.push(k + ': under ' + t + ' is not in kinds.json doors'); });
  Object.keys(j.kinds || {}).forEach(k => { const f = (j.kinds[k] || {}).find; under(k, f); Object.keys((f && f.entries) || {}).forEach(e => under(k + '.' + e, f.entries[e])); });
  /* THE SETTINGS REGISTRY IS ONE LIST (unify batch 9, setting-for.json folded in): each id once; a `type:` row names its group's col and label
     (a type with no col is a tag only); every `under` is a type it names, so a card is never filed under a type Find has no menu for. */
  const reg = ((j.kinds.setting || {}).cards || []), ids = {}, types = reg.filter(r => /^type:/.test(r.id || '')).map(r => r.id.slice(5));
  reg.forEach((r, i) => { if (!r.id || ids[r.id]) bad.push('setting.cards[' + i + '] ' + JSON.stringify(r.id) + ' is blank or twice'); ids[r.id] = 1;
    if (/^type:/.test(r.id) && r.col && !r.label) bad.push('setting.cards ' + r.id + ' has a col and no label');
    if (r.under != null && !Array.isArray(r.under)) bad.push('setting.cards ' + r.id + ': under is a list');
    [].concat(r.under || []).forEach(t => { if (types.indexOf(t) < 0) bad.push('setting.cards ' + r.id + ': under ' + t + ' is not a type: row'); }); });
  if (!types.length) bad.push('setting.cards has no type: rows');
  /* ONE SETTINGS CARD (owner, 22 Nov): no settings card says a shape of its own; the card type and its row kinds are setting.card and setting.rows (tools/one-settings-card.js). */
  reg.forEach(r => { if (r.shape) bad.push('setting ' + r.id + ': shape ' + r.shape + ' (a settings card is the one card; its rows are setting.rows)'); });
  /* A KIND'S CARD SHAPE (CARD SHAPES): a Person, an Item, a Learning: Reference or Question or an Activity: Record or Thread, nothing else. */
  Object.keys(j.kinds).forEach(k => { const h = j.kinds[k].shape; if (typeof h === 'string' && ['Person', 'Item', 'Reference', 'Record', 'Thread', 'Question'].indexOf(h) < 0) bad.push(k + ': shape ' + h + ' is not Person, Item, Reference, Record, Thread or Question'); });
  if (bad.length) throw new Error('kinds: FAILED\n  ' + bad.join('\n  '));
  const want = '/* @family. — js/kinds.js: WRITTEN BY tools/kinds.js FROM data/settings/kinds.json, facets.json and tags.json; edit those. */\n'
    + 'const ITEM_KINDS = ' + JSON.stringify({ kinds: j.kinds, doors: j.doors, facets: SD.facets() }) + ';\n'
    /* THE ONE TAG SET (owner, 23 Nov): data/settings/tags.json, as the backend's CARD_TAGS (tools/cards-gen.js). */
    + 'const CARD_TAGS = ' + JSON.stringify((t => ({ max: t.max, kinds: t.kinds }))(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/tags.json'), 'utf8')))) + ';\n';
  const file = path.join(ROOT, 'js/kinds.js');
  let have = '';
  try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
  if (have !== want) fs.writeFileSync(file, want);
  return have !== want;
}
module.exports = { run };
main(module, () => console.log('kinds: ' + (run() ? 'wrote' : 'unchanged') + ' js/kinds.js; every find.under is one of kinds.json doors; the settings registry is whole'));
