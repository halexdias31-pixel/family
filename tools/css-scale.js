/* @family. — tools/css-scale.js THE ONE READING OF THE FIXED SCALE (rule 3.5): js/check-scale.js gates on it and
   tools/health.js scores it, so the check and the Optimiser can never disagree about a size, corner, space or colour. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const NAMED = 'white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|gold|navy|teal|maroon|olive|lime|aqua|fuchsia|crimson|tomato|orchid|salmon|khaki|beige|ivory|wheat|tan|brown|cyan|magenta|indigo|violet';
const HEX = /(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(?:rgba?|hsla?)\(/;
const NAMED_RE = new RegExp('(?<![-\\w$.\'"])(?:' + NAMED + ')(?![-\\w])');
const COLOURY = /^(?:color|background(?:-color)?|border(?:-[a-z]+)*-color|border(?:-[a-z]+)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration(?:-color)?|column-rule(?:-color)?|filter|background-image|mask(?:-image)?|-webkit-text-stroke|-webkit-tap-highlight-color|stop-color)$/;
/* A colour literal: hex, rgb() or hsl() anywhere; a named colour where the property takes a colour. */
const colourLit = (k, v) => { const s = v.replace(/url\([^)]*\)/g, ''); return HEX.test(s) || (COLOURY.test(k) && NAMED_RE.test(s)); };

const TOKENS = ['--fs-small', '--fs-body', '--fs-title', '--tp-fs', '--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6',
  '--r-ui', '--r-round', '--tap', '--pic-s', '--pic-l', '--bg', '--gold', '--ink', '--line', '--paper'];

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
/* STRICT (the score): any written length outside var() is off the scale. */
const LEN_ANY = /(?<![\w.-])-?(?:\d*\.)?\d+(?:px|rem|em|vh|vw|%|ch|pt|ex)\b/;
const offScale = v => LEN_ANY.test(v.replace(/var\([^()]*\)/g, '').replace(/(?<![\w.])0(?![\w.%])/g, ''));
/* HARD (the gate, owner 11 Nov): a bare top-level length; hairlines (1, 1.5, 2px), pull-backs (negatives) and calc() are let through. */
const LEN_WORD = /^-?\d*\.?\d+(rem|em|px|pt|vh|vw|ex)$/;
const hardLen = w => LEN_WORD.test(w) && !/^-/.test(w) && !/^(1|2|1\.5)px$/.test(w);
/* Glyphs drawn with a corner: a column vector's round brackets on the page and on its key. */
const GLYPH = /^\.vec$|\.kp-vc$/;

const KINDS = {
  font: { applies: d => d.k === 'font-size' || (d.k === 'font' && !/^(?:inherit|initial|unset)$/.test(d.v)),
    off: d => d.k === 'font' ? offScale((/^(?:(?:italic|normal|bold|\d00)\s+)*(\S+)/.exec(d.v) || [])[1] || '') : offScale(d.v),
    hard: d => d.sel !== 'html' && (d.k === 'font' ? words(d.v).map(w => w.split('/')[0]).some(w => LEN_WORD.test(w)) : words(d.v).some(w => LEN_WORD.test(w))),
    say: 'a text size is var(--fs-small|body|title)' },
  space: { applies: d => /^(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-start|-end)?)?$|^(?:row-|column-)?gap$/.test(d.k),
    off: d => offScale(d.v), hard: d => words(d.v).some(hardLen), say: 'off the spacing scale — var(--s0)…var(--s6)' },
  radius: { applies: d => /^border(?:-[a-z]+)*-radius$/.test(d.k), off: d => offScale(d.v.replace(/\b50%/g, '')),
    hard: d => d.k === 'border-radius' && !GLYPH.test(d.sel) && words(d.v).some(w => w !== '0' && w !== '50%' && !/^var\(/.test(w)),
    say: 'a corner is var(--r-ui), var(--r-round), or 50% (a circle)' },
  colour: { applies: null, off: d => colourLit(d.k, d.v), hard: d => colourLit(d.k, d.v), say: 'a colour literal; use a token from :root' },
  tap: { applies: d => /^(min-)?(width|height)$/.test(d.k), off: d => /^4[48]px$/.test(d.v), hard: d => /^4[48]px$/.test(d.v), say: 'a tap target is var(--tap)' },
};

function cssScale(cssText) {
  const raw = cssText == null ? fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8') : cssText;
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
  const rootBlock = (css.match(/:root\s*\{([^}]*)\}/) || [, ''])[1];
  const all = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) all.push({ sel: m[1].trim(), body: m[2], line: css.slice(0, m.index).split('\n').length });
  const plain = all.filter(r => !/^:root\b/.test(r.sel) && !r.sel.startsWith('@'));
  /* THE PALETTE: the :root tokens whose value is a colour (or names one). */
  const colTok = new Set();
  for (const r of all.filter(r => /^:root\b/.test(r.sel))) for (const d of r.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) if (colourLit('color', d[2]) || /^var\(--[\w-]+\)$/.test(d[2].trim())) colTok.add(d[1]);
  KINDS.colour.applies = d => colourLit(d.k, d.v) || [...d.v.matchAll(/var\((--[\w-]+)/g)].some(x => colTok.has(x[1]));
  const decls = plain.flatMap((r, b) => r.body.split(';').map(d => /^\s*(-{0,2}[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(d))
    .filter(Boolean).map(d => ({ sel: r.sel, k: d[1], v: d[2].replace(/\s*!important\s*$/, ''), b, line: r.line })));
  /* Custom properties outside :root count only for colour: no other kind's property starts with --.
     THE UNIT (owner, 12 Nov) is the rule-block: of the blocks a kind applies to, those with no declaration off it. */
  const measure = {};
  for (const [id, K] of Object.entries(KINDS)) {
    const of = new Set(), off = new Set(), hard = [];
    decls.filter(K.applies).forEach(d => { of.add(d.b); if (K.off(d)) off.add(d.b); if (K.hard(d)) hard.push(`style.css:${d.line} ${d.sel.slice(0, 70)} { ${d.k}: ${d.v.slice(0, 50)} } — ${K.say}`); });
    measure[id] = { ok: of.size - off.size, of: of.size, hard };
  }
  const missing = TOKENS.filter(t => !new RegExp('(^|[\\s;])' + t + '\\s*:').test(rootBlock));
  return { blocks: plain.length, decls, measure, missing, isColour: colourLit };
}
module.exports = { cssScale, colourLit, TOKENS };
