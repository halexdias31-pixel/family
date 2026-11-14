#!/usr/bin/env node
require('../check/quiet');
/* @family. — check-item-shape.js ONE ITEM SHAPE (owner, 14 Nov, rule 3.14): every migrated kind's items, loaded by item_, */
/* are { id, kind, name, tags, body, links } as data/settings/item-shape.json says; a migrated kind has no builder of its own; */
/* the kinds still to move are listed in check/item-shape-ratchet.json and that list only gets shorter (`--lower` after a migration). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), RATCHET = path.join(ROOT, 'check/item-shape-ratchet.json'), bad = [];
const SHAPE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/item-shape.json'), 'utf8'));
const stub = new Proxy(function () { return ''; }, { get: (f, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => '' });
const src = fs.readFileSync(path.join(ROOT, 'js/cards-parts.js'), 'utf8').replace(/^(const|let) /gm, 'var ');
const own = new Set(); src.replace(/^(?:function|var|class)\s+([A-Za-z_$][\w$]*)/gm, (m, n) => own.add(n));
const KINDS = {};
const base = { console, Object, Array, String, Number, JSON, Math, Set, Map, Symbol, Boolean, RegExp, Date, cardKind_: (k, fn) => { KINDS[k] = fn; } };
const scope = new Proxy(base, { has: (o, k) => !own.has(k), get: (o, k) => (k in o ? o[k] : k === Symbol.unscopables ? undefined : stub), set: (o, k, v) => { o[k] = v; return true; } });
// eslint-disable-next-line no-new-func
const P = new Function('scope', 'with (scope) {\n' + src + '\n}\nreturn { ITEM_MAPS, item_, cardOfItem_ };')(scope);

/* THE MIGRATED LIST IS THE CODE'S: item-shape.json `migrated` names exactly the kinds ITEM_MAPS maps, each a known kind. */
const migrated = SHAPE.migrated || [], mapped = Object.keys(P.ITEM_MAPS);
if (migrated.slice().sort().join() !== mapped.slice().sort().join()) bad.push(`item-shape.json migrated [${migrated}] is not ITEM_MAPS [${mapped}] (js/cards-parts.js)`);
migrated.forEach(k => { if (!SHAPE.kinds[k]) bad.push(`migrated kind ${k} is not in item-shape.json kinds`); if (!KINDS[k]) bad.push(`migrated kind ${k} has no card (cardKind_) from its map`); });

/* EVERY ITEM VALIDATES: each migrated kind's rows, from its source file, through item_. */
const isStrs = v => Array.isArray(v) && v.every(s => typeof s === 'string' && s.trim());
let n = 0;
migrated.forEach(k => {
  const file = path.join(ROOT, String(SHAPE.kinds[k] && SHAPE.kinds[k].source || '').split(' ')[0]);
  if (!fs.existsSync(file)) { bad.push(`${k}: source ${file} missing`); return; }
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  (Array.isArray(rows) ? rows : []).forEach(r => { const it = P.item_(r, k), at = `${k} ${r && r.id}`; n++;
    Object.keys(SHAPE.shape).forEach(f => { if (!(f in it)) bad.push(`${at}: no ${f}`); });
    if (typeof it.id !== 'string' || !it.id) bad.push(`${at}: id must be a non-empty string`);
    if (it.kind !== k) bad.push(`${at}: kind is ${it.kind}`);
    if (typeof it.name !== 'string' || !it.name.trim()) bad.push(`${at}: name must be a non-empty string`);
    if (!isStrs(it.tags)) bad.push(`${at}: tags must be a list of words`);
    if (!isStrs(it.links)) bad.push(`${at}: links must be a list of ids`);
    if (!Array.isArray(it.body) || !it.body.every(b => b && typeof b === 'object' && typeof b.type === 'string')) bad.push(`${at}: body must be a list of blocks`);
    const spec = P.cardOfItem_(it, { kind: k, key: 'k', name: it.name });
    if (!spec || !Array.isArray(spec.tags) || !spec.tags[0] || spec.tags[0].text !== it.name) bad.push(`${at}: cardOfItem_ does not lead with the name tag`);
  });
});
/* A sample row with every list column filled proves the mapping reads lists (the repo's writings file may be empty). */
migrated.forEach(k => { const it = P.item_({ id: 'X-1', name: 'Sample', language: 'Greek | Latin', writings: 'WR-0001', figures: 'FIG-0001', manuscripts: 'MS-0001', author_id: 'FIG-0002', era: 'Era', genre: 'g', theatre: 't', material: 'm', script: 's' }, k);
  if (!it.links.length || !it.tags.length) bad.push(`${k}: its map reads no tags or links from a full row`); });

/* NO BESPOKE BUILDER LEFT for a migrated kind, anywhere in js/. */
fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  migrated.forEach(k => { if (new RegExp(`cardKind_\\(\\s*['"]${k}['"]`).test(s)) bad.push(`js/${f}: kind ${k} is migrated but still has its own cardKind_ builder`); });
});

/* THE RATCHET: kinds not migrated; never more than recorded, never one recorded that is now migrated. */
const left = Object.keys(SHAPE.kinds).filter(k => migrated.indexOf(k) < 0).sort();
const R = JSON.parse(fs.readFileSync(RATCHET, 'utf8'));
if (process.argv.includes('--lower')) { R.left = left; R.total = left.length; fs.writeFileSync(RATCHET, JSON.stringify(R, null, 1) + '\n'); console.log(`ratchet lowered to ${left.length}`); }
else {
  if (left.length > R.total) bad.push(`${left.length} kinds not migrated, ratchet allows ${R.total} — the list only goes down`);
  left.filter(k => (R.left || []).indexOf(k) < 0).forEach(k => bad.push(`kind ${k} is new and not migrated: add it through item_ (ITEM_MAPS), not a builder`));
  if (left.length < R.total) bad.push(`only ${left.length} kinds left but the ratchet says ${R.total}: run node js/check-item-shape.js --lower`);
}
if (bad.length) { bad.forEach(b => console.log('  ' + b)); console.log(`FAILED — ${bad.length} item shape problem(s).`); process.exit(1); }
console.log(`OK — ${n} item(s) of ${migrated.length} migrated kind(s) (${migrated.join(', ')}) are the one item shape; ${left.length} kind(s) left to move.`);
