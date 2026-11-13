#!/usr/bin/env node
require('../check/quiet');
/* @family. — check-card-spec.js A CARD IS DATA (owner, 12 Nov, rule 3.11): every kind's builder (`cardKind_`) returns a spec object, */
/* never a string; no string in a spec carries markup; renderCard escapes every text it is given. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), bad = [];
const stub = new Proxy(function () { return ''; }, { get: (f, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => '' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KINDS = {}, seen = [];
const win = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : stub), set: (o, k, v) => { o[k] = v; return true; } });
const scopeFor = own => new Proxy({ esc, oops_: () => {}, on: () => {}, window: win(), document: win(), console, Object, Array, String, Number, JSON, Math, Set, Map, Symbol, Boolean, RegExp, Date, isFinite, parseInt, parseFloat,
  DATA: {}, USER: {}, cardKind_: (k, fn) => { KINDS[k] = fn; }, tile_: o => (Array.isArray(o) ? o.map(() => '<button></button>').join('') : o ? '<button></button>' : '') },
{ has: (o, k) => !own.has(k), get: (o, k) => (k in o ? o[k] : k === Symbol.unscopables ? undefined : stub), set: (o, k, v) => { o[k] = v; return true; } });
const load = (src, ret) => { const own = new Set(); src.replace(/^(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm, (m, n) => own.add(n));
  // eslint-disable-next-line no-new-func
  return new Function('scope', 'with (scope) {\n' + src.replace(/^(const|let) /gm, 'var ') + '\n}\n' + (ret || ''))(scopeFor(own)); };

/* THE RENDERER ESCAPES: a tag, a body text and a list item holding `<b>` come out as text. */
const R = load(fs.readFileSync(path.join(ROOT, 'js/cards-render.js'), 'utf8'), 'return { renderCard };');
const out = R.renderCard({ kind: 't', tags: [{ text: '<b>x</b>' }], body: [{ type: 'text', text: '<i>y</i>' }, { type: 'list', items: ['<u>z</u>'] }] });
if (/<b>x|<i>y|<u>z/.test(out)) bad.push('renderCard let markup through a text: every string in a spec must be escaped');
if (!/^<div class="card fc kc kc-t"/.test(out)) bad.push('renderCard no longer draws the one card head `card fc kc kc-<kind>`');

/* EVERY BUILDER, run on an empty row, gives an object whose strings hold no markup (a picture's `svg` is a drawing maker's). */
const files = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f));
const MARKUP = /<\/?[a-zA-Z][a-zA-Z0-9-]*[\s>\/]/;
const walk = (v, at, said) => { if (typeof v === 'string') { if (MARKUP.test(v) && !/\.picture\.svg$|\.svg$/.test(at)) said.push(at); }
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], at + '.' + k, said)); };
files.forEach(f => { const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  if (!/\bcardKind_\(\s*['"]/.test(src) || f === 'cards-render.js') return;
  Object.keys(KINDS).forEach(k => delete KINDS[k]);
  try { load(src); } catch (e) { bad.push(`js/${f} would not load in the spec check: ${e.message}`); return; }
  Object.keys(KINDS).forEach(k => { let s; seen.push(k);
    try { s = KINDS[k]({ kind: k, key: 'k1', row: {} }); } catch (e) { bad.push(`js/${f}: kind ${k} threw on an empty row: ${e.message}`); return; }
    if (s == null || typeof s !== 'object' || Array.isArray(s)) { bad.push(`js/${f}: kind ${k} returned ${typeof s}, not a spec object`); return; }
    const said = []; walk(s, k, said); said.forEach(a => bad.push(`js/${f}: ${a} carries markup — a spec holds text and blocks only`));
    (s.body || []).forEach((b, i) => { if (b && typeof b === 'object' && !/^(text|figure|table|list|answer|formRow|embed|section|tree|grid|wait)$/.test(b.type)) bad.push(`js/${f}: ${k}.body[${i}] is no block type (${b.type})`); });
  }); });
if (bad.length) { bad.forEach(b => console.log('  ' + b)); console.log(`FAILED — ${bad.length} card spec problem(s).`); process.exit(1); }
console.log(`OK — ${seen.length} card kind builder(s) return a spec (${seen.join(', ')}); renderCard escapes its text.`);
