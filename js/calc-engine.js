/* @family. — the calculator's keys and engine (attic, 88a), cut from js/arcade.js; js/calc.js drew it, js/check-calc.js ran it. */
/* ---------- THE CALCULATOR: KEYS AND ENGINE (a Casio Natural Display). Pure, no DOM; js/check-calc.js runs it. */
/* The fx-83GT CW's face, in order: [key, label, class, legend, name]. A `top` key's legend is printed white over
   it; any other key's is its SHIFT, in blue. Labels are fixed markup, drawn unescaped by map.js. */
/* The printed key faces as small line drawings: boxes outlined at the weight of the type, never solid blocks. */
const MK = (w, body) => `<svg class="mk" viewBox="0 0 ${w} 20" width="${w / 20}em" height="1em" fill="none" stroke="currentColor" `
  + `stroke-width="1.7" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const MK_T = (x, y, t, s = 10) => `<text x="${x}" y="${y}" font-size="${s}" fill="currentColor" stroke="none" font-weight="700">${t}</text>`;
const MK_FR = MK(14, '<rect x="3.5" y="1.5" width="7" height="6"/><path d="M1 10h12"/><rect x="3.5" y="12.5" width="7" height="6"/>');
const MK_MIX = MK(22, '<rect x="1" y="6" width="6" height="8"/><rect x="12" y="1.5" width="6" height="5"/><path d="M10 10h10"/><rect x="12" y="13.5" width="6" height="5"/>');
const MK_SQRT = MK(24, '<path d="M1 12l3-1.5 3.5 7.5L12 2h11"/><rect x="13.5" y="6" width="7" height="9"/>');
const MK_CBRT = MK(26, MK_T(1, 8, '3', 8) + '<path d="M3 12l3-1.5 3.5 7.5L14 2h11"/><rect x="15.5" y="6" width="7" height="9"/>');
const MK_POW = MK(20, '<rect x="1.5" y="7" width="9" height="11"/><rect x="13" y="1.5" width="5.5" height="5.5"/>');
const MK_INV = MK(26, '<rect x="1.5" y="7" width="9" height="11"/>' + MK_T(12, 9, '−1', 9));
const MK_SQ = MK(20, '<rect x="1.5" y="7" width="9" height="11"/>' + MK_T(12.5, 9, '2', 10));
const MK_CUBE = MK(20, '<rect x="1.5" y="7" width="9" height="11"/>' + MK_T(12.5, 9, '3', 10));
const MK_LOG = 'log' + MK(16, '<rect x="1" y="12" width="5" height="6"/><rect x="7.5" y="4" width="7.5" height="11"/>');
const MK_E10 = '×10' + MK(8, '<rect x="1" y="1.5" width="6" height="6"/>');
const CALC_KEYS = [
  ['on', '', 'top', 'ON', 'clear'], ['home', '<i class="mk-ic mk-home"></i>', 'top', 'HOME', 'home'],
  ['set', '<i class="mk-ic mk-set"></i>', 'top', 'SETTINGS', 'settings'], ['back', '↶', 'top', '', 'back'],
  ['up', '⌃', 'top pad', '', 'up'], ['left', '‹', 'top pad', '', 'left'], ['ok', 'OK', 'top pad', '', 'OK'],
  ['right', '›', 'top pad', '', 'right'], ['down', '⌄', 'top pad', '', 'down'],
  ['pgup', '︽', 'top pg', '', 'scroll up'], ['pgdn', '︾', 'top pg', '', 'scroll down'],
  ['shift', '⇧', 'top sh', 'SHIFT', 'shift'], ['var', '⇄<i>x</i>', 'top lt', 'VARIABLE', 'variable'],
  ['func', 'f(<i>x</i>)', 'top lt', 'FUNCTION', 'function'], ['cat', '<i class="mk-ic mk-book"></i>', 'top lt', 'CATALOG', 'catalog'],
  ['tools', '<i class="mk-ic mk-dots"></i>', 'top lt', 'TOOLS', 'tools'],
  ['x', '<i>x</i>', 'fn', 'QR', 'x'], ['frac', MK_FR, 'fn', MK_MIX, 'fraction'],
  ['sqrt', MK_SQRT, 'fn', MK_CBRT, 'square root'], ['pow', MK_POW, 'fn', MK_INV, 'power'],
  ['sq', MK_SQ, 'fn', MK_CUBE, 'squared'], ['log', MK_LOG, 'fn', 'ln', 'log'],
  ['Ans', 'Ans', 'fn'], ['sin', 'sin', 'fn', 'sin<sup>−1</sup>'], ['cos', 'cos', 'fn', 'cos<sup>−1</sup>'],
  ['tan', 'tan', 'fn', 'tan<sup>−1</sup>'], ['(', '(', 'fn', '', 'open bracket'], [')', ')', 'fn', ',', 'close bracket'],
  ['7', '7', 'num', 'π'], ['8', '8', 'num', '<i>e</i>'], ['9', '9', 'num'], ['del', '<i class="mk-ic mk-del"></i>', 'num', 'INS', 'delete'],
  ['C', 'AC', 'num', 'OFF', 'all clear'],
  ['4', '4', 'num', 'A'], ['5', '5', 'num', 'B'], ['6', '6', 'num', 'C'], ['×', '×', 'num', '', 'times'], ['÷', '÷', 'num', '', 'divide'],
  ['1', '1', 'num', 'D'], ['2', '2', 'num', 'E'], ['3', '3', 'num', 'F'], ['+', '+', 'num', '°′″', 'plus'], ['−', '−', 'num', '(−)', 'minus'],
  ['0', '0', 'num', '<i>x</i>'], ['.', '•', 'num', '<i>y</i>', 'point'], ['e10', MK_E10, 'num', '<i>z</i>', 'times 10 to the power'],
  ['sd', '<i class="mk-fmt">FORMAT</i>', 'num', '', 'format'], ['=', 'EXE', 'num', '≈', 'execute'],
];
/* What a key does after SHIFT where that is another key. A shifted legend with no meaning here says so rather than typing. */
const CALC_SHIFT = { '7': 'pi', '8': 'e', sin: 'asin', cos: 'acos', tan: 'atan', sqrt: 'cbrt', sq: 'cube', pow: 'inv',
  log: 'ln', '−': 'neg', '=': 'approx', frac: 'frac', C: 'C' };
const CALC_NOT_HERE = { var: 'VARIABLE', func: 'FUNCTION', cat: 'CATALOG', tools: 'TOOLS', set: 'SETTINGS', x: '<i>x</i>' };
const CALC_AS = { ok: '=', on: 'C', home: 'C', back: 'del', pgup: 'up', pgdn: 'down' };
const calcLegend = k => ((CALC_KEYS.find(x => x[0] === k) || [])[3] || '').replace(/<svg[\s\S]*?<\/svg>/g, '□').replace(/<[^>]+>/g, '');

/* ---- numbers: an exact rational {n, d} of BigInts, or a plain float when no exact answer exists */
const cQ = (n, d = 1n) => {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw { calc: 'Math ERROR' };
  if (d < 0n) { n = -n; d = -d; }
  const g = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
  const k = g(n, d) || 1n;
  return { n: n / k, d: d / k };
};
const cIsQ = v => typeof v === 'object';
const cF = v => cIsQ(v) ? Number(v.n) / Number(v.d) : v;
const cChk = x => { if (typeof x === 'number' && !isFinite(x)) throw { calc: 'Math ERROR' }; return x; };
const cTooBig = v => cIsQ(v) && (v.n.toString().length > 400 || v.d.toString().length > 400);
const cOk = v => cTooBig(v) ? cChk(cF(v)) : cChk(v);
const cAdd = (a, b) => cOk(cIsQ(a) && cIsQ(b) ? cQ(a.n * b.d + b.n * a.d, a.d * b.d) : cF(a) + cF(b));
const cNeg = a => cIsQ(a) ? { n: -a.n, d: a.d } : -a;
const cMul = (a, b) => cOk(cIsQ(a) && cIsQ(b) ? cQ(a.n * b.n, a.d * b.d) : cF(a) * cF(b));
const cDiv = (a, b) => {
  if (cF(b) === 0) throw { calc: 'Math ERROR' };
  return cOk(cIsQ(a) && cIsQ(b) ? cQ(a.n * b.d, a.d * b.n) : cF(a) / cF(b));
};
/* A float within rounding of a whole number or a half becomes exact: sin 30 is ½, not 0.4999999999. */
const cSnap = x => {
  cChk(x);
  const h = Math.round(x * 2);
  return Math.abs(x * 2 - h) < 1e-11 && Math.abs(h) < 1e15 ? cQ(h, 2) : x;
};
const cIntRoot = (n, k) => {          // the exact k-th root of a BigInt n ≥ 0, or null
  if (n < 0n) return null;
  const r = BigInt(Math.round(Math.pow(Number(n), 1 / k)));
  for (const c of [r - 1n, r, r + 1n]) if (c >= 0n && c ** BigInt(k) === n) return c;
  return null;
};
const cRoot = (a, k) => {
  if (k % 2 === 0 && cF(a) < 0) throw { calc: 'Math ERROR' };
  if (cIsQ(a)) {
    const neg = a.n < 0n, rn = cIntRoot(neg ? -a.n : a.n, k), rd = cIntRoot(a.d, k);
    if (rn !== null && rd !== null) return cQ(neg ? -rn : rn, rd);
  }
  const x = cF(a);
  return cChk(x < 0 ? -Math.pow(-x, 1 / k) : Math.pow(x, 1 / k));
};
const cPow = (a, b) => {
  if (cIsQ(a) && cIsQ(b) && b.d <= 12n && (b.n < 0n ? -b.n : b.n) <= 1000n) {
    if (a.n === 0n && b.n < 0n) throw { calc: 'Math ERROR' };
    let r = b.d === 1n ? a : cRoot(a, Number(b.d));
    if (cIsQ(r)) {
      const e = b.n < 0n ? -b.n : b.n;
      r = cOk(cQ(r.n ** e, r.d ** e));
      return b.n < 0n ? cDiv(cQ(1), r) : r;
    }
    return cChk(Math.pow(r, Number(b.n)));
  }
  const x = cF(a), y = cF(b);
  if (x < 0 && !Number.isInteger(y)) throw { calc: 'Math ERROR' };
  return cChk(Math.pow(x, y));
};
const cMathErr = () => { throw { calc: 'Math ERROR' }; };
const CALC_FNS = {
  sin: x => cSnap(Math.sin(cF(x) * Math.PI / 180)),
  cos: x => cSnap(Math.cos(cF(x) * Math.PI / 180)),
  tan: x => { const d = cF(x); if (Math.abs(((d % 180) + 180) % 180 - 90) < 1e-12) cMathErr();
              return cSnap(Math.tan(d * Math.PI / 180)); },
  asin: x => Math.abs(cF(x)) > 1 ? cMathErr() : cSnap(Math.asin(cF(x)) * 180 / Math.PI),
  acos: x => Math.abs(cF(x)) > 1 ? cMathErr() : cSnap(Math.acos(cF(x)) * 180 / Math.PI),
  atan: x => cSnap(Math.atan(cF(x)) * 180 / Math.PI),
  log: x => cF(x) <= 0 ? cMathErr() : cSnap(Math.log10(cF(x))),
  ln: x => cF(x) <= 0 ? cMathErr() : cSnap(Math.log(cF(x))),
};
const CALC_FN_SAY = { sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', log: 'log', ln: 'ln' };

/* ---- the expression is a tree: a row is an array of nodes, a template node holds rows (its boxes).
   x², x³ and x⁻¹ are `fixed`: one key, one unit, no box to enter. */
const calcBoxes = n => n.fixed ? null : n.t === 'pow' || n.t === 'e10' ? [n.e] : n.t === 'sqrt' ? [n.a]
  : n.t === 'root' ? [n.n, n.a] : n.t === 'frac' ? [n.n, n.d] : null;
const calcClone = r => JSON.parse(JSON.stringify(r));

/* Rows to tokens, each template evaluated whole, then a recursive-descent parse. Nothing is ever eval'd. */
function calcTokens(row, ans) {
  const out = [];
  for (let i = 0; i < row.length; i++) {
    const n = row[i];
    if (n.t === 'ch' && /[0-9.]/.test(n.v)) {
      let s = '';
      while (i < row.length && row[i].t === 'ch' && /[0-9.]/.test(row[i].v)) s += row[i++].v;
      i--;
      if ((s.match(/\./g) || []).length > 1 || s === '.') throw { calc: 'Syntax ERROR' };
      const [w, f = ''] = s.split('.');
      out.push({ k: 'v', v: cQ(BigInt((w || '0') + f), 10n ** BigInt(f.length)) });
    } else if (n.t === 'ch' && n.v === 'π') out.push({ k: 'v', v: Math.PI });
    else if (n.t === 'ch' && n.v === 'e') out.push({ k: 'v', v: Math.E });
    else if (n.t === 'ch' && n.v === 'Ans') out.push({ k: 'v', v: ans == null ? cQ(0) : ans });
    else if (n.t === 'ch') out.push({ k: n.v });
    else if (n.t === 'fn') out.push({ k: 'fn', v: n.v });
    else if (n.t === 'pow') out.push({ k: 'pow', v: calcEval(n.e, ans) });
    else if (n.t === 'e10') out.push({ k: 'e10', v: calcEval(n.e, ans) });
    else if (n.t === 'sqrt') out.push({ k: 'v', v: cRoot(calcEval(n.a, ans), 2) });
    else if (n.t === 'root') {
      const k = cF(calcEval(n.n, ans));
      if (!Number.isInteger(k) || k < 1) cMathErr();
      out.push({ k: 'v', v: cRoot(calcEval(n.a, ans), k) });
    } else if (n.t === 'frac') out.push({ k: 'v', v: cDiv(calcEval(n.n, ans), calcEval(n.d, ans)) });
  }
  return out;
}

function calcEval(row, ans) {
  if (!row || !row.length) throw { calc: 'Syntax ERROR' };
  const tk = calcTokens(row, ans);
  let p = 0;
  const peek = () => tk[p] || {};
  const starts = t => t.k === 'v' || t.k === '(' || t.k === 'fn';
  const expr = () => {
    let v = term();
    while (peek().k === '+' || peek().k === '−') v = tk[p++].k === '+' ? cAdd(v, term()) : cAdd(v, cNeg(term()));
    return v;
  };
  /* AN IMPLIED × BINDS TIGHTER THAN × AND ÷, as on the ClassWiz (491): 1÷2π is 1/(2π), 6÷2(1+2) is 1. */
  const imp = () => {
    let v = unary();
    while (starts(peek())) v = cMul(v, unary());   // 2π, 3√2, 2sin(30)
    return v;
  };
  const term = () => {
    let v = imp();
    for (;;) {
      const k = peek().k;
      if (k === '×') { p++; v = cMul(v, imp()); }
      else if (k === '÷') { p++; v = cDiv(v, imp()); }
      else return v;
    }
  };
  const unary = () => {
    if (peek().k === '−') { p++; return cNeg(unary()); }   // −3² is −9, as on the Casio
    if (peek().k === '+') { p++; return unary(); }
    let v = primary();
    while (peek().k === 'pow' || peek().k === 'e10') {
      const t = tk[p++];
      v = t.k === 'pow' ? cPow(v, t.v) : cMul(v, cPow(cQ(10), t.v));
    }
    return v;
  };
  const primary = () => {
    const t = tk[p++] || {};
    if (t.k === 'v') return t.v;
    if (t.k === '(' || t.k === 'fn') {
      const v = expr();
      if (peek().k === ')') p++;
      else if (p < tk.length) throw { calc: 'Syntax ERROR' };   // a bracket still open at the end is closed for you
      return t.k === 'fn' ? CALC_FNS[t.v](v) : v;
    }
    throw { calc: 'Syntax ERROR' };
  };
  const v = expr();
  if (p < tk.length) throw { calc: 'Syntax ERROR' };
  return v;
}

/* ---- answers, said as the Casio says them: a fraction when exact, S⇔D for the decimal */
const cEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function calcDec(v) {
  const x = cF(v);
  if (x === 0) return '0';
  const s = x < 0 ? '−' : '', a = Math.abs(x);
  if (a >= 1e10 || a < 1e-9) {
    const [m, e] = a.toExponential(9).split('e');
    return s + m.replace(/\.?0+$/, '') + '×10<sup>' + e.replace('+', '').replace('-', '−') + '</sup>';
  }
  return s + String(Number(a.toPrecision(10)));
}
/* A FLOAT THAT IS A RATIONAL TIMES √r OR π IS SHOWN SO, as the Natural display does (491): √2, 3√2, √2/2, 2π, π/3. */
function cRat_(x, maxD) {               // p/q within rounding of x, q ≤ maxD, or null
  if (!isFinite(x) || Math.abs(x) > 1e9) return null;
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0, y = x;
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(y), h = a * h1 + h0, k = a * k1 + k0;
    if (k > maxD) break;
    if (Math.abs(h / k - x) <= 1e-11 * Math.max(1, Math.abs(x))) return [h, k];
    h0 = h1; h1 = h; k0 = k1; k1 = k;
    if (y === a) break;
    y = 1 / (y - a);
  }
  return null;
}
function cExact_(v) {                   // {k: [p, q], r} for (p/q)√r, or {k, pi: true}; null when it is neither
  if (cIsQ(v) || !isFinite(v) || v === 0) return null;
  const q = cRat_(v, 10000);
  if (q) return { k: q, r: 1 };
  const pi = cRat_(v / Math.PI, 1000);
  if (pi && pi[0] !== 0 && Math.abs(pi[0]) < 1e6) return { k: pi, pi: true };
  const sq = cRat_(v * v, 10000);
  if (!sq || sq[0] <= 0) return null;
  let n = sq[0] * sq[1], out = 1;       // √(p/q) = √(pq)/q, square factors out of the root
  for (let f = 2; f * f <= n; f++) while (n % (f * f) === 0) { n /= f * f; out *= f; }
  if (n === 1 || n > 1e6) return null;
  const g = (a, b) => b ? g(b, a % b) : a, d = g(out, sq[1]);
  return { k: [(v < 0 ? -1 : 1) * out / d, sq[1] / d], r: n };
}
function cExactHtml_(e) {
  const p = Math.abs(e.k[0]), q = e.k[1], s = e.k[0] < 0 ? '−' : '';
  const sym = e.r === 1 ? '' : e.pi ? 'π' : '<span class="mc-sqrt"><span class="mc-rad">√</span><span class="mc-under">' + e.r + '</span></span>';
  const top = (p === 1 && sym ? '' : p) + sym;
  return s + (q === 1 ? top : '<span class="mc-frac"><span class="mc-num">' + top + '</span><span class="mc-den">' + q + '</span></span>');
}
/* THE FORMATS FORMAT OFFERS (fx-991CW): the ones that mean something for this answer, in the Casio's order. */
const CALC_FMT_SAY = { std: 'Standard', dec: 'Decimal', frac: 'Fraction', mixed: 'Mixed fraction', prime: 'Prime factor', eng: 'Engineering', sexa: 'Sexagesimal' };
function calcFormats(v) {
  const q = cIsQ(v), whole = q && v.d === 1n;
  return ['std', 'dec'].concat(q && !whole ? ['frac'] : [], q && !whole && (v.n < 0n ? -v.n : v.n) > v.d ? ['mixed'] : [],
    whole && v.n > 1n && v.n < 10000000000n ? ['prime'] : [], ['eng'], Math.abs(cF(v)) < 1e7 ? ['sexa'] : []);
}
const cSup_ = e => '<sup>' + String(e).replace('-', '−') + '</sup>';
function calcEng_(x) {
  if (x === 0) return '0';
  const s = x < 0 ? '−' : '', a = Math.abs(x);
  let e = Math.floor(Math.log10(a) / 3) * 3, m = Number((a / Math.pow(10, e)).toPrecision(10));
  if (m >= 1000) { m = Number((m / 1000).toPrecision(10)); e += 3; }
  return s + String(m) + '×10' + cSup_(e);
}
function calcPrime_(n) {
  let out = [], x = n;
  for (let f = 2n; f * f <= x && f < 100000n; f += f === 2n ? 1n : 2n) {
    let c = 0; while (x % f === 0n) { x /= f; c++; }
    if (c) out.push(f + (c > 1 ? cSup_(c) : ''));
  }
  if (x > 1n) out.push(String(x));
  return out.join('×');
}
function calcSexa_(x) {
  const s = x < 0 ? '−' : '';
  let a = Math.abs(x), d = Math.floor(a), m = Math.floor((a - d) * 60 + 1e-9), sec = Math.round(((a - d) * 3600 - m * 60) * 100) / 100;
  if (sec >= 60) { sec -= 60; m++; }
  if (m >= 60) { m -= 60; d++; }
  return s + d + '°' + m + '′' + String(Number(sec.toFixed(2))) + '″';
}
/* `f` is the format (true is the old S⇔D's decimal): Standard shows a fraction, a surd or π when exact. */
function calcSay(v, f) {
  f = f === true ? 'dec' : f || 'std';
  if (f === 'eng') return calcEng_(cF(v));
  if (f === 'sexa') return calcSexa_(cF(v));
  if (f === 'prime' && cIsQ(v) && v.d === 1n && v.n > 1n) return calcPrime_(v.n);
  if (f === 'mixed' && cIsQ(v) && v.d !== 1n) {
    const neg = v.n < 0n, a = neg ? -v.n : v.n, w = a / v.d, r = a % v.d;
    return (neg ? '−' : '') + (w ? w + ' ' : '') + '<span class="mc-frac"><span class="mc-num">' + r + '</span><span class="mc-den">' + v.d + '</span></span>';
  }
  const dec = f === 'dec';
  if (cIsQ(v) && v.d !== 1n && !dec && (f === 'frac' || (v.n.toString().length + v.d.toString().length) <= 11)) {
    const neg = v.n < 0n;
    return (neg ? '−' : '') + '<span class="mc-frac"><span class="mc-num">' + (neg ? -v.n : v.n)
      + '</span><span class="mc-den">' + v.d + '</span></span>';
  }
  if (cIsQ(v) && v.d === 1n && v.n.toString().replace('-', '').length <= 10) return (v.n < 0n ? '−' : '') + (v.n < 0n ? -v.n : v.n);
  if (!dec) { const e = cExact_(v); if (e) return cExactHtml_(e); }
  return calcDec(v);
}
/* An answer as plain text (3/4, 1.5×10^12, √2/2, 1 1/2, 2^3×3), for the check and anything that wants a string. */
const calcText = (v, dec) => calcSay(v, dec).replace(/<span class="mc-sqrt"><span class="mc-rad">√<\/span><span class="mc-under">(.*?)<\/span><\/span>/g, '√$1')
  .replace(/<span class="mc-num">(.*?)<\/span><span class="mc-den">(.*?)<\/span>/, '$1/$2')
  .replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '');

/* ---- editing: the cursor is a row and an index between its nodes */
function calcNew() {
  const root = [];
  return { root, cur: { row: root, i: 0 }, shift: false, ans: null, fresh: false, val: null, dec: false, err: '', past: [], back: -1 };
}
function calcParent(row, want) {           // the template whose box is `want`, with its row and place
  for (let i = 0; i < row.length; i++) {
    const bx = calcBoxes(row[i]);
    if (!bx) continue;
    for (let b = 0; b < bx.length; b++) {
      if (bx[b] === want) return { row, i, node: row[i], b };
      const f = calcParent(bx[b], want);
      if (f) return f;
    }
  }
  return null;
}
const cCh = v => ({ t: 'ch', v });
function calcPut(st, node, enter) {
  const c = st.cur;
  c.row.splice(c.i, 0, node);
  const bx = calcBoxes(node);
  if (bx && enter != null) st.cur = { row: bx[enter], i: bx[enter].length };
  else c.i++;
}
function calcMove(st, dir) {
  const c = st.cur, row = c.row;
  if (dir > 0 && c.i < row.length) {
    const bx = calcBoxes(row[c.i]);
    if (bx) st.cur = { row: bx[0], i: 0 }; else c.i++;
    return;
  }
  if (dir < 0 && c.i > 0) {
    const bx = calcBoxes(row[c.i - 1]);
    if (bx) st.cur = { row: bx[bx.length - 1], i: bx[bx.length - 1].length }; else c.i--;
    return;
  }
  const p = calcParent(st.root, row);
  if (!p) { if (row.length) c.i = dir > 0 ? 0 : row.length; return; }   // the line wraps round, as on the Casio
  const bx = calcBoxes(p.node), nb = p.b + dir;
  if (nb >= 0 && nb < bx.length) st.cur = { row: bx[nb], i: dir > 0 ? 0 : bx[nb].length };
  else st.cur = { row: p.row, i: dir > 0 ? p.i + 1 : p.i };
}
/* ▲▼ inside a fraction step between numerator and denominator; elsewhere they recall past sums. */
function calcVert(st, down) {
  for (let r = st.cur.row, p; (p = calcParent(st.root, r)); r = p.row) {
    if (p.node.t === 'frac' && p.b === (down ? 0 : 1)) {
      const box = down ? p.node.d : p.node.n;
      st.cur = { row: box, i: Math.min(st.cur.i, box.length) };
      return true;
    }
  }
  return false;
}
function calcDel(st) {
  const c = st.cur, row = c.row;
  if (c.i > 0) {
    const n = row[c.i - 1], bx = calcBoxes(n);
    if (bx && bx.some(b => b.length)) { st.cur = { row: bx[bx.length - 1], i: bx[bx.length - 1].length }; return; }
    row.splice(c.i - 1, 1); c.i--;          // `sin(`, an empty √ or fraction: one unit
    return;
  }
  const p = calcParent(st.root, row);
  if (!p) return;
  const bx = calcBoxes(p.node);
  if (p.b > 0) { st.cur = { row: bx[p.b - 1], i: bx[p.b - 1].length }; return; }
  /* At the start of a template's first box DEL takes the template away and keeps what was in it. */
  const keep = p.node.t === 'frac' ? p.node.n.concat(p.node.n.length && p.node.d.length ? [cCh('÷')] : [], p.node.d)
    : p.node.t === 'root' ? p.node.a : bx[0];
  p.row.splice(p.i, 1, ...keep);
  st.cur = { row: p.row, i: p.i };
}
const CALC_ALIAS = { '-': '−', '*': '×', '/': '÷', 'sin(': 'sin', 'cos(': 'cos', 'tan(': 'tan',
  'sqrt(': 'sqrt', '^2': 'sq', '^': 'pow', 'π': 'pi', 'AC': 'C' };
const CALC_GOES_ON = ['+', '−', '×', '÷', 'sq', 'pow', 'inv', 'e10'];   // after an answer these carry on from Ans

function calcKey(st, k) {
  k = CALC_ALIAS[k] || k;
  if (k === 'shift') { st.shift = !st.shift; return st; }
  let sh = st.shift;
  st.shift = false;
  st.note = '';
  if (CALC_NOT_HERE[k]) { st.note = CALC_NOT_HERE[k].replace(/<[^>]+>/g, '') + ' is not on this calculator'; return st; }
  if (sh && CALC_SHIFT[k]) { k = CALC_SHIFT[k]; sh = false; }
  else if (sh && calcLegend(k)) { st.note = 'SHIFT ' + calcLegend(k) + ' is not on this calculator'; return st; }
  k = CALC_AS[k] || k;
  if (k !== 'up' && k !== 'down') st.back = -1;
  if (k === 'C') { const root = []; Object.assign(st, { root, cur: { row: root, i: 0 }, fresh: false, val: null, err: '', menu: null }); return st; }
  /* FORMAT (491) OPENS THE CASIO'S LIST for the answer on the glass: ▲▼ or FORMAT again to move, OK/EXE or the item's digit to choose, AC to leave. */
  if (st.menu) {
    const L = st.menu, d = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
    if (k === 'sd' || k === 'down' || k === 'pgdn') { st.mi = (st.mi + 1) % L.length; return st; }
    if (k === 'up' || k === 'pgup') { st.mi = (st.mi + L.length - 1) % L.length; return st; }
    st.menu = null;
    if (k === '=' || k === 'ok' || (d >= 0 && d < L.length)) { st.dec = L[d >= 0 ? d : st.mi]; return st; }
    if (k === 'C' || k === 'on' || k === 'back' || k === 'home') return st;
  }
  if (k === 'sd') { if (st.fresh && st.val != null) { st.menu = calcFormats(st.val); st.mi = Math.max(0, st.menu.indexOf(st.dec || 'std')); } else st.note = 'FORMAT changes an answer: press EXE first'; return st; }
  if (k === 'approx') { calcKey(st, '='); if (st.fresh) st.dec = 'dec'; return st; }
  if (k === '=') {
    if (!st.root.length) return st;
    const was = calcClone(st.root);
    if (JSON.stringify(st.past[st.past.length - 1]) !== JSON.stringify(was)) st.past.push(was);
    if (st.past.length > 30) st.past.shift();
    try { st.val = calcEval(st.root, st.ans); st.ans = st.val; st.err = ''; st.fresh = true; st.dec = false; }
    catch (e) { if (!e || !e.calc) throw e; st.err = e.calc; st.val = null; st.fresh = false; }
    return st;
  }
  if (k === 'up' || k === 'down') {
    if (!st.fresh && calcVert(st, k === 'down')) return st;
    const dir = k === 'up' ? -1 : 1;
    if (!st.past.length) return st;
    if (st.back === -1) { if (dir < 0) st.back = st.past.length - 1; else return st; }
    else st.back = Math.min(st.past.length - 1, Math.max(-1, st.back + dir));
    const root = st.back === -1 ? [] : calcClone(st.past[st.back]);
    Object.assign(st, { root, cur: { row: root, i: root.length }, fresh: false, val: null, err: '' });
    return st;
  }
  st.err = '';
  if (k === 'left' || k === 'right' || k === 'del') {
    if (st.fresh) {                        // back into the sum just answered, to change it
      Object.assign(st, { fresh: false, val: null, cur: { row: st.root, i: k === 'right' ? 0 : st.root.length } });
      if (k !== 'del') return st;
    }
    if (k === 'del') calcDel(st); else calcMove(st, k === 'left' ? -1 : 1);
    return st;
  }
  if (st.fresh) {                          // a new sum: from Ans if the key carries on from it
    const root = CALC_GOES_ON.includes(k) ? [cCh('Ans')] : [];
    Object.assign(st, { root, cur: { row: root, i: root.length }, fresh: false, val: null });
  }
  if (/^[0-9.]$/.test(k) || ['+', '−', '×', '÷', '(', ')'].includes(k)) calcPut(st, cCh(k));
  else if (k === 'neg') calcPut(st, cCh('−'));
  else if (k === 'Ans' || k === 'e') calcPut(st, cCh(k));
  else if (k === 'pi') calcPut(st, cCh(sh ? 'e' : 'π'));
  else if (k === 'sin' || k === 'cos' || k === 'tan') calcPut(st, { t: 'fn', v: (sh ? 'a' : '') + k });
  else if (k === 'asin' || k === 'acos' || k === 'atan') calcPut(st, { t: 'fn', v: k });
  else if (k === 'log' && sh) { calcPut(st, cCh('1')); calcPut(st, cCh('0')); calcPut(st, { t: 'pow', e: [] }, 0); }
  else if (k === 'ln' && sh) { calcPut(st, cCh('e')); calcPut(st, { t: 'pow', e: [] }, 0); }
  else if (k === 'log' || k === 'ln') calcPut(st, { t: 'fn', v: k });
  else if (k === 'sqrt' && !sh) calcPut(st, { t: 'sqrt', a: [] }, 0);
  else if (k === 'cbrt' || k === 'sqrt') calcPut(st, { t: 'root', n: [cCh('3')], a: [] }, 1);
  else if (k === 'sq') calcPut(st, { t: 'pow', fixed: true, e: [cCh(sh ? '3' : '2')] });
  else if (k === 'cube') calcPut(st, { t: 'pow', fixed: true, e: [cCh('3')] });
  else if (k === 'inv') calcPut(st, { t: 'pow', fixed: true, e: [cCh('−'), cCh('1')] });
  else if (k === 'pow') calcPut(st, sh ? { t: 'root', n: [], a: [] } : { t: 'pow', e: [] }, 0);
  else if (k === 'frac') calcPut(st, { t: 'frac', n: [], d: [] }, 0);
  else if (k === 'e10') calcPut(st, { t: 'e10', e: [] }, 0);
  return st;
}

/* ---- drawing: textbook maths, never raw tokens */
function calcRowHtml(st, row, top) {
  const caret = !st.fresh && st.cur.row === row ? '<span class="mc-caret"></span>' : '';
  if (!row.length) return top ? caret : '<span class="mc-box">' + caret + '</span>';
  const R = r => calcRowHtml(st, r, false);
  let h = '';
  row.forEach((n, i) => {
    if (i === st.cur.i && caret) h += caret;
    if (n.t === 'ch') h += n.v === 'Ans' ? '<span class="mc-word">Ans</span>' : n.v === 'e' ? '<i>e</i>' : cEsc(n.v);
    else if (n.t === 'fn') h += '<span class="mc-word">' + CALC_FN_SAY[n.v] + '(</span>';
    else if (n.t === 'pow') h += '<sup class="mc-sup">' + R(n.e) + '</sup>';
    else if (n.t === 'e10') h += '×10<sup class="mc-sup">' + R(n.e) + '</sup>';
    else if (n.t === 'sqrt' || n.t === 'root')
      h += (n.t === 'root' ? '<sup class="mc-idx">' + R(n.n) + '</sup>' : '')
        + '<span class="mc-sqrt"><span class="mc-rad">√</span><span class="mc-under">' + R(n.a) + '</span></span>';
    else if (n.t === 'frac') h += '<span class="mc-frac"><span class="mc-num">' + R(n.n) + '</span><span class="mc-den">' + R(n.d) + '</span></span>';
  });
  if (st.cur.i === row.length && caret) h += caret;
  return h;
}
const calcHtml = st => ({
  input: calcRowHtml(st, st.root, true),
  output: st.err ? cEsc(st.err) : st.menu ? '<span class="mc-menu">FORMAT <b>' + (st.mi + 1) + ' ' + CALC_FMT_SAY[st.menu[st.mi]] + '</b> ▾ '
      + (st.mi + 1) + '/' + st.menu.length + '</span>'
    : st.fresh && st.val != null ? calcSay(st.val, st.dec)
    : st.note ? '<span class="mc-note">' + cEsc(st.note) + '</span>' : '',
});
/* ---------- END OF THE CALCULATOR ENGINE */
