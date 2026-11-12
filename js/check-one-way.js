#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-one-way.js ONE WAY ONLY (owner, 12 Nov, rule 3.13): each element is written as markup only by its one maker. */
/* What is still hand-built is listed in check/one-way-ratchet.json; the count only goes down (`--lower` after a migration). */
const fs = require('fs'), path = require('path'), acorn = require('acorn');
const ROOT = path.join(__dirname, '..'), RATCHET = path.join(ROOT, 'check/one-way-ratchet.json');
/* THE MAKERS: each element, its one maker function, the file it lives in, and the classes only it may write. */
const ELEMENT = {
  card:    { maker: 'card_ / findCard', file: 'js/cards-make.js', cls: ['card', 'qcard', 'kc'] },
  tile:    { maker: 'tile_', file: 'js/tiles.js', cls: ['tile', 'btn'], button: true },
  tag:     { maker: 'qtag_', file: 'js/cards-make.js', cls: ['qtag', 'chip', 'prof-tag'] },
  loading: { maker: 'loading_', file: 'js/shell-boot.js', cls: ['loading', 'is-busy'] },
  row:     { maker: 'row / rowHtml', file: 'js/core.js', cls: ['row'] },
  markup:  { maker: 'renderCard(spec) (js/card-render.js)', file: 'js/card-render.js' },
  style:   { maker: 'a class in style.css', file: null },
  colour:  { maker: 'a token in style.css', file: null },
};
const CLASS_OF = {}; Object.keys(ELEMENT).forEach(k => (ELEMENT[k].cls || []).forEach(c => { CLASS_OF[c] = k; }));
const CLS = Object.keys(CLASS_OF).map(c => c.replace(/-/g, '\\-')).join('|');
/* `class="card"`, `class="x tile y"` (quote escaped or not): the class as a whole word, not `card-sub`. */
const AS_TEXT = new RegExp(`class=\\\\?["'](?:[^"'\\\\]*\\s)?(${CLS})(?=[\\s"'\\\\])`, 'g');
const AS_PROP = new RegExp(`className\\s*=\\s*["'\`](?:[^"'\`]*\\s)?(${CLS})(?=[\\s"'\`])`, 'g');
const BUTTON = /<button\b/g, STYLE = /\sstyle=\\?["']/g, COLOUR = /(?:^|[^\w&-])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b(?![\w-])|\brgba?\(\s*\d/g;
/* index.html's boot fallback draws before any maker has loaded, so only js/ is read; the checks hold sample markup. */
const files = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).map(f => 'js/' + f);
const found = [];
/* THE MASTER TEMPLATE (owner, 12 Nov, "go all the way"): markup of ANY tag is written only by the renderer files; everyone else hands over data. */
const RENDERERS = ['js/card-render.js', 'js/tiles.js'];
const MARKUP = /<\/?[a-zA-Z][a-zA-Z0-9-]*(?=[\s>\/])/;
const hit = (f, line, kind, what) => { if (ELEMENT[kind].file !== f && !(RENDERERS.includes(f) && kind !== 'style' && kind !== 'colour')) found.push({ f, line, kind, what }); };
/* ONLY STRINGS AND TEMPLATES: a regex that reads a card (`/^<div class="card x/`) builds nothing. */
const strings = src => { const out = []; try { for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', locations: true }))
  if (t.type === acorn.tokTypes.string || t.type === acorn.tokTypes.template) out.push([t.loc.start.line, String(t.value)]); } catch (e) { out.push([0, 'unreadable: ' + e.message]); } return out; };
files.forEach(f => { const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  strings(src).forEach(([line, v]) => {
    /* A line inside a template is its first line plus the newlines before the match. */
    const at = i => line + (v.slice(0, i).match(/\n/g) || []).length;
    if (MARKUP.test(v)) hit(f, line, 'markup', 'markup string ' + JSON.stringify(v.match(MARKUP)[0]));
    for (const m of v.matchAll(AS_TEXT)) hit(f, at(m.index), CLASS_OF[m[1]], `class ${m[1]}`);
    for (const m of v.matchAll(BUTTON)) hit(f, at(m.index), 'tile', '<button>');
    for (const m of v.matchAll(STYLE)) hit(f, at(m.index), 'style', 'inline style=');
    for (const m of v.matchAll(COLOUR)) hit(f, at(m.index), 'colour', 'colour ' + m[0].replace(/^[^#r]/, ''));
  });
  /* `el.className = 'tile …'` has its class in a string after `className =`. */
  src.split('\n').forEach((l, i) => { for (const m of l.matchAll(AS_PROP)) hit(f, i + 1, CLASS_OF[m[1]], `className ${m[1]}`); }); });

/* ONE PICTURE SIZE (owner, 12 Nov): `--pic-h` is set once, in :root; a card's picture box takes no height or width of its own. */
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const picBad = [];
for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
  const sel = m[1].trim(), body = m[2], line = css.slice(0, m.index + m[0].length - m[2].length).split('\n').length;
  if (/--pic-h\s*:/.test(body) && sel !== ':root') picBad.push(`style.css:${line}: \`${sel.slice(0, 60)}\` sets its own --pic-h`);
  if (/\.kc-pic\b/.test(sel) && !/\.kc-pic\s+\S/.test(sel.replace(/\.kc-pic\s*>\s*\*/, '.kc-pic')))
    for (const d of body.matchAll(/(?:^|;)\s*((?:max-|min-)?(?:height|width))\s*:\s*([^;]+)/g))
      if (!/^(var\(--pic-h\)|100%|auto|none)\s*$/.test(d[2].trim())) picBad.push(`style.css:${line}: \`${sel.slice(0, 60)}\` ${d[1]}: ${d[2].trim()} — the picture is var(--pic-h)`);
}
files.forEach(f => { if (/--pic-h\s*:/.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))) picBad.push(`${f}: sets --pic-h from script`); });
if (picBad.length) { picBad.forEach(b => console.log('  ' + b)); console.log(`FAILED — ${picBad.length} picture size(s) outside the one --pic-h.`); process.exit(1); }

/* THE RATCHET is a count per file and element; line numbers move, counts do not. */
const key = x => `${x.f} ${x.kind}`, now = {};
found.forEach(x => { now[key(x)] = (now[key(x)] || 0) + 1; });
let was = {}; try { was = JSON.parse(fs.readFileSync(RATCHET, 'utf8')).left || {}; } catch (e) { /* none yet: everything is new */ }
if (process.argv.includes('--lower')) {
  const up = Object.keys(now).filter(k => now[k] > (was[k] || 0));
  if (up.length && fs.existsSync(RATCHET)) { console.log('FAILED — will not raise the ratchet: ' + up.map(k => `${k} ${was[k] || 0}→${now[k]}`).join(', ')); process.exit(1); }
  const left = {}; Object.keys(now).sort().forEach(k => { left[k] = now[k]; });
  fs.writeFileSync(RATCHET, JSON.stringify({ say: 'Hand-built markup still left (file element: count). Only goes down: node js/check-one-way.js --lower', total: found.length, left }, null, 1) + '\n');
  console.log(`ratchet written: ${found.length} left`); process.exit(0);
}
const byKind = {}; found.forEach(x => { byKind[x.kind] = (byKind[x.kind] || 0) + 1; });
found.forEach(x => console.log(`  ${x.f}:${x.line}: ${x.kind} — ${x.what} by hand; use ${ELEMENT[x.kind].maker}${ELEMENT[x.kind].file ? ' (' + ELEMENT[x.kind].file + ')' : ''}`));
console.log('  left by element: ' + Object.keys(ELEMENT).map(k => `${k} ${byKind[k] || 0}`).join(', '));
const worse = Object.keys(now).filter(k => now[k] > (was[k] || 0));
const better = Object.keys(was).filter(k => (now[k] || 0) < was[k]);
if (worse.length) {
  worse.forEach(k => console.log(`  NEW: ${k} ${was[k] || 0} → ${now[k]}`));
  console.log(`FAILED — ${worse.length} file/element pair(s) gained hand-built markup; call the maker instead.`); process.exit(1);
}
if (better.length) console.log(`  lower the ratchet: node js/check-one-way.js --lower (${better.join(', ')})`);
console.log(`OK — nothing new hand-built in ${files.length} files; ${found.length} left on the ratchet (only goes down).`);
