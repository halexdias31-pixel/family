#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-one-way.js ONE WAY ONLY (owner, 12 Nov): a card, tile, spinner or tag is written as markup only by its one maker. */
/* Sizes and colours outside the tokens are check-scale's and check-style-sources'; the gate runs all three. */
const fs = require('fs'), path = require('path'), acorn = require('acorn');
const ROOT = path.join(__dirname, '..');
/* THE MAKERS: the one file allowed to write each class as markup. */
const MAKER = { card: ['js/cards-make.js'], tile: ['js/tiles.js'], loading: ['js/shell-boot.js'], qtag: ['js/cards-make.js'] };
const KINDS = Object.keys(MAKER).join('|');
/* `class="card"`, `class="x tile y"` (quote escaped or not), or `className = 'qtag …'`: the class as a whole word, not `card-sub`. */
const AS_TEXT = new RegExp(`class=\\\\?["'](?:[^"'\\\\]*\\s)?(${KINDS})(?=[\\s"'\\\\])`, 'g');
const AS_PROP = new RegExp(`className\\s*=\\s*["'\`](?:[^"'\`]*\\s)?(${KINDS})(?=[\\s"'\`])`, 'g');
/* index.html's boot fallback draws before any maker has loaded, so only js/ is read. */
const files = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).map(f => 'js/' + f);
const bad = [];
/* ONLY STRINGS AND TEMPLATES: a regex that reads a card (`/^<div class="card x/`) builds nothing. */
const strings = src => { const out = []; try { for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', locations: true }))
  if (t.type === acorn.tokTypes.string || t.type === acorn.tokTypes.template) out.push([t.loc.start.line, String(t.value)]); } catch (e) { out.push([0, 'unreadable: ' + e.message]); } return out; };
files.forEach(f => { const src = fs.readFileSync(path.join(ROOT, f), 'utf8'), tok = strings(src);
  tok.forEach(([line, v]) => [AS_TEXT].forEach(re => { for (const m of v.matchAll(re)) if (MAKER[m[1]].indexOf(f) < 0)
    bad.push(`${f}:${line}: \`${m[1]}\` markup written by hand — use its maker (${MAKER[m[1]].join(', ')})`); }));
  /* `el.className = 'tile …'` has its class in a string after `className =`. */
  src.split('\n').forEach((l, i) => { for (const m of l.matchAll(AS_PROP)) if (MAKER[m[1]].indexOf(f) < 0)
    bad.push(`${f}:${i + 1}: \`${m[1]}\` set as a class by hand — use its maker (${MAKER[m[1]].join(', ')})`); }); });
bad.forEach(b => console.log('  ' + b));
if (bad.length) { console.log(`FAILED — ${bad.length} piece(s) of card/tile/spinner/tag markup outside their one maker.`); process.exit(1); }
console.log(`OK — every card, tile, spinner and tag in ${files.length} files comes from its one maker.`);
