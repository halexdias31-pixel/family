#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-scale.js THE FIXED SCALE (owner, 11 Nov): § */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
const bad = [];

/* THE SET ITSELF: each token defined once in :root, so a rule naming it gets the one value. */
const TOKENS = ['--fs-small', '--fs-body', '--fs-title', '--tp-fs', '--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6',
  '--r-ui', '--r-round', '--tap', '--pic-s', '--pic-l', '--bg', '--gold', '--ink', '--line', '--paper'];
const rootBlock = (css.match(/:root\s*\{([^}]*)\}/) || [, ''])[1];
TOKENS.forEach(t => { if (!new RegExp('(^|[\\s;])' + t + '\\s*:').test(rootBlock)) bad.push(`the token ${t} is not defined in :root`); });

/* Top-level words of a value, a bracketed group kept whole. */
function words(v) {
  const out = []; let cur = '', depth = 0;
  for (const ch of v) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && !depth) { if (cur) out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
const LEN = /^-?\d*\.?\d+(rem|em|px|pt|vh|vw|ex)$/;   // `ch` is type set in characters (a monospace column), not a space
const fine = w => !LEN.test(w) || /^-/.test(w) || /^(1|2|1\.5)px$/.test(w);
/* Glyphs drawn with a corner: a column vector's round brackets on the page and on its key. */
const GLYPH = /^\.vec$|\.kp-vc$/;

let rules = 0;
for (const m of css.matchAll(/([^{};]*)\{([^{}]*)\}/g)) {
  const sel = m[1].trim();
  if (/^:root\b/.test(sel) || /^@/.test(sel)) continue;
  rules++;
  for (const d of m[2].split(';')) {
    const i = d.indexOf(':'); if (i < 0) continue;
    const prop = d.slice(0, i).trim(), val = d.slice(i + 1).replace(/!important/, '').trim();
    if (!val || /^--/.test(prop)) continue;
    const say = why => bad.push(`${sel.slice(0, 70)} { ${prop}: ${val.slice(0, 50)} } — ${why}`);
    if (prop === 'font-size') {
      if (sel !== 'html' && words(val).some(w => LEN.test(w))) say('a text size is var(--fs-small|body|title)');
    } else if (prop === 'font') {
      const size = words(val).map(w => w.split('/')[0]).find(w => LEN.test(w));
      if (size) say('a text size is var(--fs-small|body|title)');
    } else if (prop === 'border-radius') {
      if (!GLYPH.test(sel) && words(val).some(w => w !== '0' && w !== '50%' && !/^var\(/.test(w))) say('a corner is var(--r-ui), var(--r-round), or 50% (a circle)');
    } else if (/^(gap|row-gap|column-gap|padding|margin)(-(top|bottom|left|right|inline|block))?$/.test(prop)) {
      const w = words(val).find(x => !fine(x));
      if (w) say(`${w} is off the spacing scale — var(--s0)…var(--s6)`);
    } else if (/^(min-)?(width|height)$/.test(prop) && /^4[48]px$/.test(val)) {
      say('a tap target is var(--tap)');
    }
  }
}
/* COLOURS: js/check-look.js rule 3 holds every colour to a :root token; asked again here so this one file proves the whole set. */
const LIT = /(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(rgba?|hsla?)\(/;
for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/^\s*:root\s*$/.test(m[1]) || !LIT.test(m[2])) continue;
  bad.push(`${m[1].trim().slice(0, 70)} — a colour literal; use a token from :root`);
}

if (rules < 500) bad.push(`only ${rules} rules read from style.css — the reader has broken`);
if (bad.length) {
  console.log(`check-scale: ${bad.length} size, corner, space or colour outside the fixed scale:`);
  bad.forEach(b => console.log('  ' + b));
  process.exit(1);
}
console.log(`check-scale: ${rules} rules, every size, corner, space and colour on the fixed scale`);
