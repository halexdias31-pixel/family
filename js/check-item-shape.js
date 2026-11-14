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
migrated.forEach(k => { if (!SHAPE.kinds[k]) bad.push(`migrated kind ${k} is not in item-shape.json kinds`); if (!KINDS[P.ITEM_MAPS[k].card || k]) bad.push(`migrated kind ${k} has no card (cardKind_) from its map`); });

/* EVERY ITEM VALIDATES: each migrated kind's rows, from its source file, through item_. */
const isStrs = v => Array.isArray(v) && v.every(s => typeof s === 'string' && s.trim());
let n = 0;
migrated.forEach(k => {
  /* A SOURCE IS ONE FILE OR A FOLDER'S FILES (`data/chemistry/*.json`); a file is a list of rows, or an object of lists. */
  /* A KIND MADE LIVE FROM THE PAYLOAD (a subject, a venue) has no file of its own: its `sample` (`file key`) is checked if it names one, */
  /* and the sample row below checks it either way. */
  const K = SHAPE.kinds[k] || {}, live = !/^data\//.test(String(K.source || ''));
  if (live && !K.sample) return;
  const [want, key] = String(live ? K.sample : K.source || '').split(' '), dir = path.join(ROOT, path.dirname(want));
  const files = /\*/.test(want) ? (fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.json$/.test(f)).map(f => path.join(dir, f)) : []) : [path.join(ROOT, want)];
  if (!files.length || !files.every(f => fs.existsSync(f))) { bad.push(`${k}: source ${want} missing`); return; }
  const rows = [].concat(...files.map(f => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(d) ? d : live ? d[key] || [] : [].concat(...Object.values(d).filter(Array.isArray)); }));
  if (live && !rows.length) bad.push(`${k}: no rows in ${K.sample}`);
  rows.forEach(r => { valid_(r, k); n++; });
});
function valid_(r, k) {
  const M = P.ITEM_MAPS[k], it = P.item_(r, k), at = `${k} ${r && r.id}`;
    Object.keys(SHAPE.shape).forEach(f => { if (!(f in it)) bad.push(`${at}: no ${f}`); });
    if (typeof it.id !== 'string' || !it.id) bad.push(`${at}: id must be a non-empty string`);
    if (it.kind !== k) bad.push(`${at}: kind is ${it.kind}`);
    if (typeof it.name !== 'string' || !it.name.trim()) bad.push(`${at}: name must be a non-empty string`);
    if (!isStrs(it.tags)) bad.push(`${at}: tags must be a list of words`);
    if (!isStrs(it.links)) bad.push(`${at}: links must be a list of ids`);
    if (!Array.isArray(it.body) || !it.body.every(b => b && typeof b === 'object' && typeof b.type === 'string')) bad.push(`${at}: body must be a list of blocks`);
    const spec = P.cardOfItem_(it, { kind: k, key: 'k', name: it.name });
    /* A CARD LEADS WITH ITS NAME TAG, or (`nameTag: false`, its tags its facets alone) carries the name as its own. */
    if (!spec || !Array.isArray(spec.tags) || spec.name !== it.name || (M.nameTag !== false && (!spec.tags[0] || spec.tags[0].text !== it.name))) bad.push(`${at}: cardOfItem_ does not lead with the name`);
    if (M.lines && spec.body !== it.body) bad.push(`${at}: its map says lines but the card does not draw its body`);
}
/* A sample row with every column its map names filled (two words apart) proves the mapping reads lists (the repo's writings file may be empty). */
migrated.forEach(k => { const M = P.ITEM_MAPS[k], row = { id: 'X-1', name: 'Sample' };
  ['tags', 'links'].forEach(f => (M[f] || []).forEach(c => { row[c] = 'A-' + c + ' | B-' + c; }));
  const it = P.item_(row, k); valid_(row, k);
  if (!(M.tags || []).length) bad.push(`${k}: its map names no tag columns`);
  if (it.tags.length < 2 * (M.tags || []).length || it.links.length < 2 * (M.links || []).length) bad.push(`${k}: its map does not read every tag and link column as a list`); });

/* NO BESPOKE BUILDER LEFT for a migrated kind, anywhere in js/. */
fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  migrated.forEach(k => { const c = P.ITEM_MAPS[k].card || k;
    if (new RegExp(`cardKind_\\(\\s*['"](${k}|${c})['"]`).test(s)) bad.push(`js/${f}: kind ${k} is migrated but still has its own cardKind_ builder`); });
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
