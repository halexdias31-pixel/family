#!/usr/bin/env node
/* @family. — tools/spec-formulas.js QUESTIONS FROM THE DOCUMENTS' OWN EQUATIONS (owner, 27 Nov: "question generation more mechanical — no
   hand-written template where the government document itself supplies the content"). Reads the stored government sources (tools/spec-read.js,
   data/settings/curriculum/<country>/sources/*.tsv) and writes data/settings/qgen-derived.json, never edited by hand:
     - THE EQUATIONS: every line of a document's "Equations in physics" appendix, as printed (÷, x, superscripts, a chain a = b = c read as
       a = b and a = c, "(g)" naming a symbol, a parenthesis that only explains dropped). A sum or difference, or a side that is only "constant",
       is not one quantity times others: it is listed as not used, with why.
     - THE UNITS: the documents' Appendix 2 (each derived unit's quantity, name and symbol; each base unit's name and symbol) and
       sources/hand-si.json (which quantity word each base unit measures: the documents print the unit, not the word). A quantity takes the
       unit its name's head words name (kinetic energy: energy, J; current in primary coil: current, A), else its own; every unknown is then
       solved from all the equations at once (a linear system in the six base dimensions), so the newton's kg m/s² is read from F = m a, and a
       quantity the equations leave open (the "m" of m x specific heat capacity) leaves its equation unused. A value the documents give
       (on Earth g=10 N/kg) is a constant.
     - THE TEMPLATES: one per quantity of each equation (find it from the others), in data/settings/qgen.json's own format (tools/lib/qgen.js
       runs them): whole numbers drawn for the others, one worked out so the answer is whole, the answer computed by the same equation; the
       words from ONE sentence frame (FRAME) filled with the documents' quantity names and units; the near miss the first of ONE list of error
       rules (ERRORS) that applies.
     - THE RULES: a statement taught by an equation is one that asks for a calculation and names two of its quantities (data/settings/
       curriculum/rules.json's format; read by tools/spec-tree.js with that file's).
     - RETIRED: a hand template of qgen.json asking the same thing (the same answer unit from the same given units) is replaced by the
       derived one — least dynamic wins: tools/lib/qgen.js no longer serves it, tools/spec-tree.js maps it to its replacement, and its old
       questions stay in data/questions.json inactive (tools/gen-questions.js).
   Run first by tools/build.js; checked by tools/one-formula.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, main, writeIfChanged } = require('./lib/gen.js');
const SR = require('./spec-read.js');

const OUT = 'data/settings/qgen-derived.json';
const HAND_SI = country => path.join(SR.DIR, country, SR.SRC, 'hand-si.json');
const BASE = ['m', 'kg', 's', 'A', 'K', 'mol'];           /* the six base symbols as the documents print them, in their order */
const RANGE = [2, 300], PART = [5, 95];                    /* whole numbers drawn; a part of a whole (efficiency) in hundredths */

/* ONE SENTENCE FRAME for every derived question: the givens, then what to work out. */
const FRAME = { given: 'the {name} is {value}{unit}', join: [', ', ' and '], ask: 'Calculate the {name}{unit}.', unit: ' in {unit}' };
/* ONE LIST OF ERROR RULES: the near miss is the first that applies to the rearrangement. */
const ERRORS = [
  { id: 'power-ignored', says: 'a square or a root left out', applies: f => f.terms.some(x => Math.abs(x.e) !== 1) },
  { id: 'number-dropped', says: 'the number in the equation left out (0.5 x)', applies: f => f.K !== 1 },
  { id: 'inverted', says: 'the rearrangement upside down: multiplied where it divides, or divided where it multiplies', applies: () => true },
  { id: 'unit-missed', says: 'a kilo- conversion missed (x 1000)', applies: () => true },
];
const PREP = ['of', 'by', 'across', 'in', 'due', 'for', 'on', 'at', 'along', 'to', 'carrying'];
const SUP = { 2: '²', 3: '³', 4: '⁴' };
const ORDER_U = ['N', 'J', 'W', 'Pa', 'C', 'V', 'Ω', 'T', 'Hz', 'kg', 'm', 's', 'A', 'K', 'mol'];   /* how a compound unit is written: N m, kg m/s, J/(kg K) */

/* ---- THE STORED TEXT AS LINES: runs on one page within 6 of each other's top are one line; a run in small type that is a number is a power. */
function linesOf(text) {
  const rows = text.split('\n').filter(Boolean).map(r => { const f = r.split('\t'); return { p: +f[0], top: +f[1], left: +f[2], size: +f[3], b: f[4] === '1', t: f.slice(5).join('\t') }; });
  rows.sort((a, b) => a.p - b.p || a.top - b.top || a.left - b.left);
  const out = [];
  rows.forEach(r => {
    const l = out[out.length - 1];
    if (l && l.p === r.p && r.top - l.top0 <= 6) l.runs.push(r); else out.push({ p: r.p, top: r.top, top0: r.top, runs: [r] });
  });
  out.forEach(l => {
    l.runs.sort((a, b) => a.left - b.left);
    l.text = l.runs.map(r => (r.size <= 12 && /^\s*\d+\s*$/.test(r.t) ? '^' + r.t.trim() + ' ' : ' ' + r.t + ' ')).join('').replace(/\s+\^/g, '^').replace(/\s+/g, ' ').trim();
    l.bold = l.runs.every(r => r.b || !r.t.trim());
  });
  return out.filter(l => l.text);
}
const between = (L, from, to) => { const i = L.findIndex(l => from.test(l.text)); if (i < 0) return []; const j = L.findIndex((l, k) => k > i && to.test(l.text)); return L.slice(i + 1, j < 0 ? L.length : j); };

/* ---- THE DOCUMENTS' UNITS: Appendix 2 (derived: quantity, name, symbol; base: name, then "Unit symbol: x"). */
function unitsOf(L) {
  const sec = between(L, /^SI units in science$/, /^Appendix 3$/), named = [], base = {};
  let inDerived = false;
  sec.forEach((l, i) => {
    if (/^Some derived units/.test(l.text)) { inDerived = true; return; }
    if (!inDerived) { const m = /^Unit symbol: (\S+)$/.exec(l.text); if (m && i > 0) base[sec[i - 1].text.toLowerCase()] = m[1]; return; }
    const w = l.text.split(' ');
    if (w.length >= 3 && !/^\d+$/.test(l.text)) named.push({ quantity: w.slice(0, -2).join(' ').toLowerCase(), name: w[w.length - 2], symbol: w[w.length - 1] });
  });
  return { named, base };
}

/* ---- AN EQUATION LINE, READ: [{ text, lhs, rhs }] (a chain a = b = c is a = b and a = c), or { text, skip: why }. */
const clean = s => s.replace(/\([^()]*\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
function monomial(side, alias) {
  if (/(^|\s)[-+](\s|$)/.test(side)) return { skip: 'a sum or difference, not one quantity times others' };
  const parts = side.replace(/÷/g, ' ÷ ').split(/\s+(x|÷)\s+/), out = { coef: 1, f: [] };
  for (let i = 0; i < parts.length; i += 2) {
    const sign = parts[i - 1] === '÷' ? -1 : 1;
    let raw = parts[i].trim(), e = 1;
    const pw = /\^(\d+)\s*$/.exec(raw); if (pw) { e = +pw[1]; raw = raw.slice(0, pw.index); }
    const sym = /\(([a-z])\)/i.exec(raw), name = clean(raw.replace(/^\((.*)\)$/, '$1'));
    if (sym) alias[sym[1]] = name;
    if (/^\d+(\.\d+)?$/.test(name)) { out.coef *= Math.pow(+name, sign * e); continue; }
    if (!name) return { skip: 'an empty factor' };
    if (name === 'constant') return { skip: '"constant": a quantity that stays the same, not one to work out' };
    out.f.push({ name, e: sign * e });
  }
  return out;
}
function readEquation(raw, alias) {
  let s = raw.replace(/\s+/g, ' ').trim();
  const c = s.indexOf(':');
  if (c >= 0) { const after = s.slice(c + 1).trim(); s = after.startsWith('=') ? s.slice(0, c) + ' ' + after : after; }
  s = s.replace(/\(([^()]+)\)\^(\d+)/g, '$1^$2');
  const sides = s.split('=').map(x => x.trim());
  if (sides.length < 2 || sides.some(x => !x)) return [{ text: raw, skip: 'no two sides' }];
  const M = sides.map(x => monomial(x, alias)), out = [];
  for (let i = 1; i < M.length; i++) {
    const text = raw.replace(/\s+/g, ' ').trim() + (M.length > 2 ? ' [' + i + ']' : '');
    const bad = [M[0], M[i]].find(m => m.skip);
    out.push(bad ? { text, skip: bad.skip } : { text, lhs: M[0], rhs: M[i] });
  }
  return out;
}

/* ---- EVERY DOCUMENT OF A COUNTRY: the equation lines (deduplicated, in the first document's order), the units, the constants. */
function readSources(country, opt) {
  opt = opt || {};
  const M = opt.manifest || SR.manifest(country), raw = [], seen = new Set(), alias = {}, constants = {};
  let units = null;
  const docs = Object.keys(M.docs).filter(k => M.docs[k].subject === 'science');
  const texts = {}; docs.forEach(k => { texts[k] = opt.text && opt.text[k] != null ? opt.text[k] : SR.sourceText(country, M.docs[k].file); });
  docs.forEach(k => {
    const L = linesOf(texts[k]);
    const sec = between(L, /^Equations in physics$/, /^(Appendix \d|SI units in science)$/), chunks = [];
    sec.forEach(l => {
      if (/^\d+$/.test(l.text)) return;
      const c = chunks[chunks.length - 1];
      if (c && c.p === l.p && l.top - c.last <= 30) { c.text += ' ' + l.text; c.last = l.top; } else chunks.push({ p: l.p, last: l.top, text: l.text, doc: k });
    });
    chunks.filter(c => c.text.includes('=')).forEach(c => { const key = c.text.toLowerCase().replace(/\s+/g, ' '); if (!seen.has(key)) { seen.add(key); raw.push(c); } });
    const u = unitsOf(L); if (u.named.length && !units) units = Object.assign({ doc: k }, u);
  });
  const eqs = [];
  raw.forEach(c => readEquation(c.text, alias).forEach(e => eqs.push(Object.assign({ doc: c.doc }, e))));
  /* a value a document gives a symbol the equations name: "on Earth g=10 N/kg" */
  docs.forEach(k => linesOf(texts[k]).forEach(l => {
    const re = /\b([a-z])\s*=\s*(\d+(?:\.\d+)?)\s*([A-Za-z]+(?:\/[A-Za-z]+)?)/g; let m;
    while ((m = re.exec(l.text))) if (alias[m[1]] && !constants[alias[m[1]]]) constants[alias[m[1]]] = { value: +m[2], unit: m[3], doc: k, symbol: m[1] };
  }));
  eqs.forEach(e => { if (e.skip) return; [e.lhs, e.rhs].forEach(s => s.f.forEach(f => { if (alias[f.name]) f.name = alias[f.name]; })); });
  return { eqs, units, alias, constants, hand: opt.hand || JSON.parse(fs.readFileSync(path.join(ROOT, HAND_SI(country)), 'utf8')) };
}

/* ---- THE UNITS SOLVED: each quantity's entity (its unit's), the base dimensions of every entity. */
const headOf = name => { const w = name.replace(/^change in /, '').split(' '); const i = w.findIndex((x, k) => k > 0 && PREP.includes(x)); return (i > 0 ? w.slice(0, i) : w).join(' '); };
const hasWords = (s, t) => new RegExp('(^| )' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( |$)').test(s);
const zero = () => BASE.map(() => 0);
function solveUnits(S) {
  const anchors = [], known = {};
  S.units.named.forEach(u => {
    const ent = 'U:' + u.symbol;
    anchors.push({ term: u.quantity, ent });
    const w = u.quantity.split(' '); if (w.length > 1) anchors.push({ term: w.slice(1).join(' '), ent });
  });
  Object.keys(S.hand.base).forEach(un => {
    const sym = S.units.base[un]; if (!sym) throw new Error('spec-formulas: hand-si.json names base unit "' + un + '", which the documents\' Appendix 2 does not');
    const d = zero(); d[BASE.indexOf(sym)] = 1; known['B:' + sym] = d;
    S.hand.base[un].forEach(t => anchors.push({ term: t, ent: 'B:' + sym }));
  });
  Object.keys(S.hand.powers || {}).forEach(t => { const [un, e] = S.hand.powers[t], d = zero(); d[BASE.indexOf(S.units.base[un])] = e; known['P:' + t] = d; anchors.push({ term: t, ent: 'P:' + t }); });
  (S.hand.counts || []).forEach(t => { known['N:' + t] = zero(); anchors.push({ term: t, ent: 'N:' + t }); });
  const used = S.eqs.filter(e => !e.skip), heads = new Set();
  used.forEach(e => [e.lhs, e.rhs].forEach(s => s.f.forEach(f => heads.add(headOf(f.name)))));
  const entOf = {};
  const resolve = (h, depth) => {
    if (entOf[h]) return entOf[h];
    const a = anchors.filter(x => hasWords(h, x.term)).sort((x, y) => y.term.length - x.term.length)[0];
    if (a) return (entOf[h] = a.ent);
    const o = [...heads].filter(x => x !== h && hasWords(h, x)).sort((x, y) => y.length - x.length)[0];
    return (entOf[h] = o && depth < 5 ? resolve(o, depth + 1) : 'Q:' + h);
  };
  [...heads].sort().forEach(h => resolve(h, 0));
  /* the linear system: per equation, sum of exponent x dims = 0 */
  const vars = [...new Set(Object.values(entOf).filter(x => !known[x]))].sort(), idx = {}; vars.forEach((v, i) => { idx[v] = i; });
  const rows = used.map(e => {
    const a = vars.map(() => 0), b = zero();
    [[e.lhs, 1], [e.rhs, -1]].forEach(([s, k]) => s.f.forEach(f => { const en = entOf[headOf(f.name)], c = k * f.e; if (known[en]) known[en].forEach((x, j) => { b[j] -= c * x; }); else a[idx[en]] += c; }));
    return { a, b, e };
  });
  const dims = Object.assign({}, known), R = rows.map(r => ({ a: r.a.slice(), b: r.b.slice() })), piv = [];
  let r0 = 0;
  for (let c = 0; c < vars.length && r0 < R.length; c++) {
    const p = R.findIndex((r, i) => i >= r0 && Math.abs(r.a[c]) > 1e-9); if (p < 0) continue;
    [R[r0], R[p]] = [R[p], R[r0]];
    const k = R[r0].a[c]; R[r0].a = R[r0].a.map(x => x / k); R[r0].b = R[r0].b.map(x => x / k);
    R.forEach((r, i) => { if (i === r0 || Math.abs(r.a[c]) < 1e-9) return; const m = r.a[c]; r.a = r.a.map((x, j) => x - m * R[r0].a[j]); r.b = r.b.map((x, j) => x - m * R[r0].b[j]); });
    piv.push(c); r0++;
  }
  const clash = R.find(r => r.a.every(x => Math.abs(x) < 1e-9) && r.b.some(x => Math.abs(x) > 1e-9));
  piv.forEach((c, i) => { if (R[i].a.every((x, j) => j === c || Math.abs(x) < 1e-9)) dims[vars[c]] = R[i].b.map(x => Math.round(x * 6) / 6); });
  return { entOf, dims, clash: clash ? 'the equations disagree on a unit' : null };
}

/* ---- A UNIT AS SYMBOLS: { symbol: power }, written m/s², kg m/s, J/(kg K). */
function unitText(atoms) {
  const ks = Object.keys(atoms).filter(k => atoms[k]);
  ks.sort((a, b) => ORDER_U.indexOf(a) - ORDER_U.indexOf(b));
  const pw = (k, e) => k + (e === 1 ? '' : SUP[e] || '^' + e);
  const up = ks.filter(k => atoms[k] > 0).map(k => pw(k, atoms[k])), dn = ks.filter(k => atoms[k] < 0).map(k => pw(k, -atoms[k]));
  if (!up.length && !dn.length) return '';
  const top = up.length ? up.join(' ') : '1';
  return dn.length ? top + '/' + (dn.length > 1 ? '(' + dn.join(' ') + ')' : dn[0]) : top;
}
/* A UNIT AS WRITTEN, back to symbols ({} for none; null when a symbol is none the documents give: cm, °C, %). */
const SUPN = { '²': 2, '³': 3, '⁴': 4 };
function parseUnit(str, known) {
  const t = String(str || '').trim(); if (!t) return {};
  const [up, dn] = t.split('/'), atoms = {};
  const take = (part, sign) => part.replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean).every(w => {
    const m = /^(.+?)(?:\^(-?\d+)|([²³⁴]))?$/.exec(w); if (!m || !known[m[1]]) return m && m[1] === '1';
    atoms[m[1]] = (atoms[m[1]] || 0) + sign * (m[2] ? +m[2] : m[3] ? SUPN[m[3]] : 1); return true;
  });
  if (!take(up, 1) || (dn != null && !take(dn, -1))) return null;
  return atoms;
}
const atomDims = (atoms, U) => { const d = zero(); Object.keys(atoms).forEach(k => { const x = U[k]; if (!x) throw new Error('no dims for ' + k); x.forEach((v, j) => { d[j] += v * atoms[k]; }); }); return d; };
const sameDims = (a, b) => a.every((x, j) => Math.abs(x - b[j]) < 1e-9);
/* EVERY QUANTITY'S UNIT, as a child is shown it: its anchored unit's symbol; else the unit its own defining equation (it alone on the left)
   gives from the others'; else a single unit of the same dimensions; else the shortest the equations give; else in base units. */
function unitsShown(S, U) {
  const symDims = {};
  BASE.forEach((b, j) => { const d = zero(); d[j] = 1; symDims[b] = d; });
  S.units.named.forEach(u => { if (U.dims['U:' + u.symbol]) symDims[u.symbol] = U.dims['U:' + u.symbol]; });
  const shown = {}, eqs = S.eqs.filter(e => !e.skip), names = new Set();
  eqs.forEach(e => [e.lhs, e.rhs].forEach(s => s.f.forEach(f => names.add(f.name))));
  const dimsOf = n => U.dims[U.entOf[headOf(n)]];
  [...names].forEach(n => {
    const en = U.entOf[headOf(n)];
    if (/^[UB]:/.test(en)) shown[n] = { [en.slice(2)]: 1 };
    else if (/^N:/.test(en)) shown[n] = {};
    else if (/^P:/.test(en)) { const d = dimsOf(n); shown[n] = { m: d[0] }; }
  });
  const single = n => { const d = dimsOf(n); const k = Object.keys(symDims).find(s => sameDims(symDims[s], d)); return k ? { [k]: 1 } : null; };
  const fromEq = (n, e) => {
    const terms = e.lhs.f.map(f => ({ name: f.name, e: f.e })).concat(e.rhs.f.map(f => ({ name: f.name, e: -f.e })));
    const me = terms.find(t => t.name === n); if (!me) return null;
    const atoms = {};
    for (const t of terms) { if (t === me) continue; if (!shown[t.name]) return null; Object.keys(shown[t.name]).forEach(k => { atoms[k] = (atoms[k] || 0) - t.e * shown[t.name][k] / me.e; }); }
    if (Object.values(atoms).some(x => !Number.isInteger(x))) return null;
    Object.keys(atoms).forEach(k => { if (!atoms[k]) delete atoms[k]; });
    return atoms;
  };
  const size = a => Object.values(a).reduce((s, x) => s + Math.abs(x), 0);
  const hasDef = n => eqs.some(e => e.lhs.f.length === 1 && e.lhs.f[0].name === n && e.lhs.f[0].e === 1);
  for (let pass = 0; pass < 14; pass++) {
    [...names].sort().forEach(n => {
      if (shown[n] || !dimsOf(n)) return;
      const h = headOf(n); if (h !== n && names.has(h)) { if (shown[h]) shown[n] = shown[h]; return; }   /* density of liquid: density's */
      const def = eqs.find(e => e.lhs.f.length === 1 && e.lhs.f[0].name === n && e.lhs.f[0].e === 1 && fromEq(n, e));
      if (def) { shown[n] = fromEq(n, def); return; }
      const one = single(n); if (one) { shown[n] = one; return; }
      if (pass < 5 || (hasDef(n) && pass < 11)) return;   /* a quantity its own equation defines waits for that equation's units */
      const c = eqs.map(e => fromEq(n, e)).filter(Boolean).sort((a, b) => size(a) - size(b))[0];
      if (c) { shown[n] = c; return; }
      if (pass >= 9 && (!hasDef(n) || pass >= 12)) { const d = dimsOf(n), a = {}; BASE.forEach((b, j) => { if (d[j]) a[b] = d[j]; }); shown[n] = a; }
    });
  }
  return { shown, symDims };
}

/* ---- THE TEMPLATES. An equation as terms: prod q^e = K (left exponents +, right -). */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = x => String(+x.toFixed(10));
function termsOf(e) { return { K: e.rhs.coef / e.lhs.coef, terms: e.lhs.f.map(f => ({ name: f.name, e: f.e })).concat(e.rhs.f.map(f => ({ name: f.name, e: -f.e }))) }; }
/* q = (K * prod others^-e)^(1/e_q), as an expression of the others' value expressions (`val`), the exponents changed by `tweak`. */
function solved(F, q, val, tweak) {
  const t = F.terms.find(x => x.name === q), o = F.terms.filter(x => x.name !== q);
  const x = tweak ? tweak(F, t, o) : { K: F.K, et: t.e, o: o.map(y => ({ name: y.name, e: y.e })) };
  const body = num(x.K) + ' * ' + x.o.map(y => 'pow(' + val(y.name) + ', ' + num(-y.e / x.et) + ')').join(' * ');
  return x.et === 1 ? '(' + body + ')' : 'pow(' + num(x.K) + ', ' + num(1 / x.et) + ') * ' + x.o.map(y => 'pow(' + val(y.name) + ', ' + num(-y.e / x.et) + ')').join(' * ');
}
const TWEAK = {
  'power-ignored': (F, t, o) => ({ K: F.K, et: Math.sign(t.e), o: o.map(y => ({ name: y.name, e: Math.sign(y.e) })) }),
  'number-dropped': (F, t, o) => ({ K: 1, et: t.e, o: o.map(y => ({ name: y.name, e: y.e })) }),
  inverted: (F, t, o) => ({ K: F.K, et: t.e, o: o.map((y, i) => ({ name: y.name, e: i === o.length - 1 ? -y.e : y.e })) }),
  'unit-missed': (F, t, o) => ({ K: F.K * Math.pow(1000, t.e), et: t.e, o: o.map(y => ({ name: y.name, e: y.e })) }),
};
function templatesOf(S, U, V) {
  const out = [], made = [], skipped = [];
  S.eqs.forEach((e, ei) => {
    if (e.skip) return skipped.push({ equation: e.text, why: e.skip });
    const F = termsOf(e), names = F.terms.map(t => t.name);
    if (new Set(names).size !== names.length) return skipped.push({ equation: e.text, why: 'a quantity on both sides' });
    const open = names.filter(n => !U.dims[U.entOf[headOf(n)]]);
    if (open.length) return skipped.push({ equation: e.text, why: 'the documents fix no unit for ' + open.map(n => '"' + n + '"').join(', ') });
    /* a part of a whole: a quantity with no unit worked out as one like quantity over another (efficiency) */
    const part = n => { const t = F.terms.find(x => x.name === n), o = F.terms.filter(x => x !== t); return !Object.keys(V.shown[n]).length && !S.hand.counts.includes(headOf(n)) && o.length === 2 && sameDims(U.dims[U.entOf[headOf(o[0].name)]], U.dims[U.entOf[headOf(o[1].name)]]) && t.e === 1; };
    const eqId = slug(e.lhs.f.map(f => headOf(f.name)).join(' ') + ' ' + e.rhs.f.map(f => headOf(f.name)).join(' '));
    names.forEach(q => {
      if (S.constants[q]) return;
      const dep = names.find(n => n !== q && !S.constants[n] && Math.abs(F.terms.find(x => x.name === n).e) === 1);
      if (!dep) return skipped.push({ equation: e.text, why: 'no other quantity to work out for "' + q + '"' });
      const drawn = names.filter(n => n !== dep && !S.constants[n]), v = {}, val = {};
      drawn.forEach((n, i) => { v[n] = 'v' + i; val[n] = part(n) ? '(v' + i + ' / 100)' : 'v' + i; });
      names.filter(n => S.constants[n]).forEach(n => { val[n] = num(S.constants[n].value); });
      const depX = solved(F, dep, n => val[n]); val[dep] = depX;
      const ans = val[q], rule = ERRORS.find(r => r.applies(F));
      const wrongX = solved(F, q, n => val[n], TWEAK[rule.id]);
      const vars = {}; drawn.forEach(n => { vars[v[n]] = part(n) ? PART.slice() : RANGE.slice(); });
      const where = ['+rd(' + depX + ', 2) == +fix(' + depX + ')', depX + ' >= 0.1', depX + ' <= 100000', 'fix(+rd(' + wrongX + ', 3)) != fix(' + ans + ')'];
      if (part(dep)) where.push(depX + ' < 1');
      const lets = {}, givens = names.filter(n => n !== q);
      givens.forEach((n, i) => { lets['g' + i] = 'fix(' + val[n] + ')'; });
      lets.ans = 'fix(' + ans + ')'; lets.wr = 'fix(+rd(' + wrongX + ', 3))';
      const u = n => unitText(V.shown[n]);
      const gtext = givens.map((n, i) => FRAME.given.replace('{name}', n).replace('{value}', '{g' + i + '}').replace('{unit}', u(n) ? ' ' + u(n) : ''));
      const joined = gtext.length > 1 ? gtext.slice(0, -1).join(FRAME.join[0]) + FRAME.join[1] + gtext[gtext.length - 1] : gtext[0];
      const text = joined[0].toUpperCase() + joined.slice(1) + '. ' + FRAME.ask.replace('{name}', q).replace('{unit}', u(q) ? FRAME.unit.replace('{unit}', u(q)) : '');
      const id = 'eq-' + eqId + '--' + slug(q);
      out.push({ id, answer_type: 'calculation', marks: 2, vars, where, let: lets, text, key: u(q) ? '{ans} ' + u(q) + ' | {ans}' : '{ans}', typed: u(q) ? ['{ans}', '{ans} ' + u(q)] : ['{ans}'], wrong: '{wr}' });
      made.push({ id, equation: ei, target: q, givens, units: Object.fromEntries(names.map(n => [n, u(n)])), near_miss: rule.id });
    });
  });
  return { templates: out, made, skipped };
}

/* ---- THE RULES: a statement asking for a calculation that names two of an equation's quantities. */
const CALC = '(?:calculat|apply|relationship|equation|quantitative)';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function rulesOf(S, made) {
  const by = {}; made.forEach(m => { (by[m.equation] = by[m.equation] || []).push(m.id); });
  return Object.keys(by).map(Number).sort((a, b) => a - b).map(ei => {
    const e = S.eqs[ei], hs = [...new Set(e.lhs.f.concat(e.rhs.f).map(f => headOf(f.name)))].sort(), any = [];
    for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) any.push('^(?=.*' + CALC + ')(?=.*\\b' + esc(hs[i]) + '(?:s|es)?\\b)(?=.*\\b' + esc(hs[j]) + '(?:s|es)?\\b)');
    return { subject: 'science', equation: e.text, any, skills: by[ei] };
  });
}

/* ---- RETIRED: a hand template asking the same thing: its first question's answer unit and given units of the same dimensions as a derived
   template's (a unit named in words, "in ohms", read by the documents' unit names), and its numbers satisfying that template's equation; of
   several, the closest in words. */
function retiredOf(hand, made, eqs, V, U, names) {
  const QG = require('./lib/qgen.js'), known = V.symDims;
  const all = new Set(Object.keys(known)); made.forEach(m => Object.values(m.units).forEach(u => { if (u) all.add(u); }));
  const alts = [...all].sort((a, b) => b.length - a.length).map(esc).join('|');
  const re = new RegExp('(?:^|\\s)(-?\\d+(?:\\.\\d+)?)\\s+(' + alts + ')(?=[\\s.,;:)]|$)', 'g');
  const dimsOfU = u => { const a = parseUnit(u, known); return a ? atomDims(a, known) : null; };
  const holds = (m, vals) => { const F = eqs[m.equation]; let p = 1; F.terms.forEach(t => { p *= Math.pow(vals[t.name], t.e); }); return Math.abs(p - F.K) <= 1e-6 * Math.abs(F.K); };
  const perms = a => (a.length <= 1 ? [a] : [].concat(...a.map((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x].concat(p)))));
  const out = {};
  hand.forEach(t => {
    let q; try { q = QG.generate(t, 1); } catch (e) { return; }
    const km = /^\s*(-?\d+(?:\.\d+)?)\s*(.*?)\s*$/.exec(q.key.split('|')[0]); if (!km) return;
    let ku = km[2];
    if (!ku) { const w = /\bin ([^.]+?)\.?\s*$/.exec(q.text); if (w) { const nm = names.find(x => x.name === w[1].toLowerCase().replace(/s$/, '')); ku = nm ? nm.symbol : (parseUnit(w[1], known) ? w[1] : ''); } }
    const kd = ku ? dimsOfU(ku) : null; if (!kd) return;
    const gs = []; let m; re.lastIndex = 0; while ((m = re.exec(q.text))) gs.push({ v: +m[1], d: dimsOfU(m[2]) });
    if (gs.some(g => !g.d)) return;
    const hit = made.filter(d => d.givens.length === gs.length && sameDims(U.dims[U.entOf[headOf(d.target)]], kd) && perms(gs).some(p => {
      if (!p.every((g, i) => sameDims(U.dims[U.entOf[headOf(d.givens[i])]], g.d))) return false;
      const vals = { [d.target]: +km[1] }; p.forEach((g, i) => { vals[d.givens[i]] = g.v; });
      return holds(d, vals);
    }));
    /* of several, the one closest to the hand question's own words: its quantities named, its units as written */
    const score = d => [d.target].concat(d.givens).filter(n => new RegExp('\\b' + esc(headOf(n)) + '\\b', 'i').test(q.text)).length
      + (d.units[d.target] === ku ? 1 : 0) + d.givens.filter(n => d.units[n] && q.text.includes(' ' + d.units[n])).length;
    const best = hit.map((d, i) => ({ d, s: score(d), i })).sort((a, b) => b.s - a.s || a.i - b.i)[0];
    if (best) out[t.id] = best.d.id;
  });
  return out;
}

/* ---- THE FILE. */
function build(opt) {
  opt = opt || {};
  const country = 'uk', S = readSources(country, opt), U = solveUnits(S), V = unitsShown(S, U), T = templatesOf(S, U, V);
  const hand = (opt.qgen || JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qgen.json'), 'utf8'))).templates;
  /* TAUGHT: an equation's templates are kept only when a statement at a generated level (hand-science.json `gen.level`) asks for it —
     by the derived rule, or by a rules.json rule whose hand template it retires. The rest are listed, not served. */
  const retired = retiredOf(hand, T.made, S.eqs.map(e => (e.skip ? null : termsOf(e))), V, U, S.units.named);
  const rules = rulesOf(S, T.made), eqOf = {}; T.made.forEach(m => { eqOf[m.id] = m.equation; });
  const fam = ei => T.made.filter(m => m.equation === ei).map(m => m.id);
  const lv = [].concat(((opt.handScience || JSON.parse(fs.readFileSync(path.join(ROOT, SR.DIR, country, SR.SRC, 'hand-science.json'), 'utf8'))).gen || {}).level || []);
  const RU = opt.rules || JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/curriculum/rules.json'), 'utf8'));
  const R = SR.readAll(country, opt), taught = new Set();
  const hits = (r, t) => r.any.some(p => new RegExp(p, 'i').test(t)) && !(r.none || []).some(p => new RegExp(p, 'i').test(t));
  Object.keys(R.science || {}).forEach(doc => R.science[doc].statements.forEach(st => {
    if (lv.length && !lv.some(l => (st.levels || []).includes(l))) return;
    rules.forEach(r => { if (hits(r, st.text)) r.skills.forEach(id => taught.add(eqOf[id])); });
    RU.rules.filter(r => r.subject === 'science').forEach(r => { if (hits(r, st.text)) r.skills.forEach(id => { if (retired[id]) taught.add(eqOf[retired[id]]); }); });
  }));
  T.made.filter(m => !taught.has(m.equation)).forEach(m => { if (!T.skipped.some(x => x.equation === S.eqs[m.equation].text && /no statement/.test(x.why))) T.skipped.push({ equation: S.eqs[m.equation].text, why: 'no statement at a generated level asks for it' }); });
  const keep = new Set(T.made.filter(m => taught.has(m.equation)).map(m => m.id));
  const retiredFam = {}; Object.keys(retired).forEach(k => { retiredFam[k] = fam(eqOf[retired[k]]); });
  const unitDims = {}; Object.keys(V.symDims).forEach(k => { unitDims[k] = V.symDims[k]; });
  const doc = {
    about: 'GENERATED by tools/spec-formulas.js from the stored government documents (data/settings/curriculum/uk/sources: each GCSE science document\'s "Equations in physics" and "SI units in science" appendices, hand-si.json for the quantity each base unit measures) — never edit by hand. `equations`: each as printed, read as terms (quantity, power; left +, right -) with the number K their product equals, or why it is not used. `units`: the base dimensions (m, kg, s, A, K, mol) of every unit symbol, the derived ones solved from the equations. `quantities`: each quantity\'s unit as shown and its dimensions. `templates`: one per quantity of each used equation, in data/settings/qgen.json\'s format (tools/lib/qgen.js serves them with that file\'s); `made`: what each asks. `rules`: statement patterns as data/settings/curriculum/rules.json\'s (tools/spec-tree.js reads both). `retired`: hand templates of qgen.json asking the same thing, each with its replacement (`retired_family`: every rearrangement of that equation, which takes over the statements of the one retired); they are no longer served. `skipped`: equations not used, and why (including those no statement at a generated level asks for). `frame` and `errors`: the one sentence frame and the one list of near-miss rules. Checked by tools/one-formula.js.',
    generated: 'tools/spec-formulas.js',
    frame: FRAME, errors: ERRORS.map(r => ({ id: r.id, says: r.says })),
    constants: S.constants,
    equations: S.eqs.map(e => (e.skip ? { text: e.text, doc: e.doc, skip: e.skip } : Object.assign({ text: e.text, doc: e.doc }, termsOf(e)))),
    units: unitDims,
    quantities: Object.keys(V.shown).sort().reduce((o, n) => { o[n] = { unit: unitText(V.shown[n]), dims: U.dims[U.entOf[headOf(n)]] }; return o; }, {}),
    skipped: T.skipped,
    retired, retired_family: retiredFam,
    made: T.made.filter(m => keep.has(m.id)),
    rules: rules.filter(r => r.skills.some(id => keep.has(id))),
    templates: T.templates.filter(t => keep.has(t.id)),
  };
  if (U.clash) doc.clash = U.clash;
  return doc;
}
const fileText = d => JSON.stringify(d, null, 1) + '\n';

/* FOR tools/spec-tree.js AND tools/lib/qgen.js: the derived file as stored (or none), the rule table with the derived rules and retired skills mapped. */
function stored() { try { return JSON.parse(fs.readFileSync(path.join(ROOT, OUT), 'utf8')); } catch (e) { return { templates: [], rules: [], retired: {} }; } }
function withDerived(RU, D) {
  D = D || stored();
  const gone = D.retired || {}, fam = D.retired_family || {}, map = ids => [...new Set([].concat(...ids.map(x => fam[x] || (gone[x] ? [gone[x]] : [x]))))];
  return Object.assign({}, RU, { rules: RU.rules.map(r => Object.assign({}, r, { skills: map(r.skills) })).concat((D.rules || []).map(r => ({ subject: r.subject, any: r.any, skills: r.skills }))) });
}
const retire = (id, D) => ((D || stored()).retired || {})[id] || id;   /* one id; spec-tree's lost-skill check reads the retired as its replacement */

function run() {
  const d = build();
  if (d.clash) throw new Error('spec-formulas: ' + d.clash);
  const wrote = writeIfChanged(path.join(ROOT, OUT), fileText(d));
  const used = d.equations.filter(e => !e.skip).length;
  console.log('spec-formulas: ' + d.equations.length + ' equations read from the documents (' + used + ' used, ' + d.skipped.filter((x, i, a) => a.findIndex(y => y.equation === x.equation) === i).length + ' not: '
    + [...new Set(d.skipped.map(x => x.equation + ' — ' + x.why))].join('; ') + '), ' + d.templates.length + ' derived templates, ' + Object.keys(d.retired).length + ' hand template(s) retired ('
    + Object.keys(d.retired).map(k => k + ' -> ' + d.retired[k]).join(', ') + '); ' + OUT + (wrote ? ' written' : ' unchanged'));
}

main(module, run);
module.exports = { run, build, fileText, readSources, solveUnits, unitsShown, linesOf, readEquation, termsOf, headOf, unitText, parseUnit, atomDims, sameDims, withDerived, retire, stored, OUT, BASE, FRAME, ERRORS };
