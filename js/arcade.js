/* @family. — arcade.js ONE FILE, SPLIT. § */


/* ---------- ARCADE § */
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
  ['0', '0', 'num', '<i>x</i>'], ['.', '•', 'num', '<i>y</i>', 'point'], ['e10', MK_E10, 'num', '<i>z</i>', 'times ten to the'],
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

/* THE WIDGETS — nine things you USE rather than things you find. § */
/* TOOLS AND GAMES, AS COLUMNS THEY WERE ALREADY REACHABLE — `What for · Tools` and `What for · Games` are answers in the funnel and always have been. § */

/* ---------- WHAT THIS PERSON MAY OPEN § */
/* ---------- ONE LIST, ASKED BY BOTH THE RENDER AND THE COUNT § */
/* `admin` AND `tutor` ARE TWO FLAGS BECAUSE THEY ARE TWO AUDIENCES. § */
/* ---------- WHO MAY OPEN A WIDGET, ASKED IN ONE PLACE § */
/* AND `signedIn`, A THIRD AUDIENCE: § */
function widgetFor_(w) {
  if (!w) return false;
  if (w.admin && !(typeof isAdmin === 'function' && isAdmin())) return false;
  if (w.tutor && !(typeof isTutorRole === 'function' && isTutorRole())) return false;
  if (w.signedIn && !(typeof USER !== 'undefined' && USER)) return false;
  /* WHO SEES THIS (497, words.js): an admin's narrowing, asked after the code's own gates, which always win. */
  if (typeof seenOk_ === 'function' && !seenOk_(String(w.id))) return false;
  return true;
}

function widgetsOf_(kind) {
  /* THE ADMIN'S LAYOUT FIRST (462, 463): which column each widget is on and in what order, else the code's (`layoutWidgets_`, layout.js). */
  if (typeof layoutWidgets_ === 'function') return layoutWidgets_(kind, allWidgets()).filter(widgetFor_);
  return allWidgets()
    .filter(w => w.kind === kind)
    .filter(widgetFor_);
}

/* A COLUMN'S PAGES: its widgets with each merged card's parts as one (480, `layoutMergeWidgets_`, layout.js) — what the pager counts. */
function widgetPagesOf_(kind) {
  const list = widgetsOf_(kind);
  return typeof layoutMergeWidgets_ === 'function' ? layoutMergeWidgets_(list) : list;
}
function widgetColumn_(kind) {
  return widgetPagesOf_(kind)
    /* ---------- THE WIDGET IS THE CARD. THERE IS NOTHING TO PRESS § */
    /* ---------- AND THE NAME IS PRINTED ONCE § */
    .map(w => widgetOnColumn_(w, true));
}

/* ---------- ONE WIDGET, ONE CARD, AND A STAR ON IT § */
const WIDGET_KEY = w => 'w:' + String(w.id);

/* NAMED FOR THE COLUMN, because `find.js` already has a `widgetCard_` and it is a different object: § */
/* ---------- AND UNTIL IT HAS STARTED, IT IS WAITING, AND IT LOOKS IT § */
/* `own` is its own column (not Saved): only there does an admin get the layout row (463, `layoutTiles_` in layout.js). */
function widgetOnColumn_(w, own) {
  if (w && w.parts) return widgetMergedOn_(w, own);
  const waits = typeof w.start === 'function' && typeof loading_ === 'function';
  const held = typeof gameLocked_ === 'function' && gameLocked_(w.id);
  /* ONE PLACE FOR A WIDGET'S TILES (472): title, content (its own tiles last), then one row — the star, the padlock, then the admin's layout tiles. */
  const keep = typeof favTile_ === 'function'
    ? `<span class="tile-group wgt-keep">${favTile_({ key: WIDGET_KEY(w), kind: 'widget' })}${
      typeof gameLockTile_ === 'function' ? gameLockTile_(w.id) : ''}${
      typeof suggestTile_ === 'function' ? suggestTile_('widget', String(w.id), w.title || w.label || '') : ''}</span>` : '';
  const lay = own === true && typeof layoutTiles_ === 'function' ? layoutTiles_(w) : '';
  return `<div class="card is-widget${held ? ' is-locked' : ''}">
      <div class="widget-slot" id="wgt-${esc(String(w.id))}"${waits ? ' aria-busy="true"' : ''}>${
        typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html}${waits ? loading_() : ''}</div>
      ${keep || lay ? `<div class="tile-row wgt-foot">${keep}${lay}</div>` : ''}
    </div>`;
}

/* A MERGED CARD (480): one frame, each part's own slot (started by its own widget), the lower titles as subheadings, one tile row — the top part's. */
function widgetMergedOn_(m, own) {
  const top = m.parts[0];
  const keep = typeof favTile_ === 'function' ? `<span class="tile-group wgt-keep">${favTile_({ key: WIDGET_KEY(top), kind: 'widget' })}${
    typeof gameLockTile_ === 'function' ? gameLockTile_(top.id) : ''}${typeof suggestTile_ === 'function' ? suggestTile_('widget', String(top.id), top.title || top.label || '') : ''}</span>` : '';
  const lay = own === true && typeof layoutTiles_ === 'function' ? layoutTiles_(top) : '';
  const parts = m.parts.map(w => {
    const waits = typeof w.start === 'function' && typeof loading_ === 'function';
    return `<div class="merged-part"><div class="widget-slot" id="wgt-${esc(String(w.id))}"${waits ? ' aria-busy="true"' : ''}>${typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html}${waits ? loading_() : ''}</div></div>`;
  }).join('');
  return `<div class="card is-widget is-merged" data-merged="${esc(m.parts.map(w => String(w.id)).join(' '))}">${parts}
      ${keep || lay ? `<div class="tile-row wgt-foot">${keep}${lay}</div>` : ''}
    </div>`;
}

/* ---------- THE SAVED COLUMN, WHICH THIS APP HAS HAD BEFORE § */
function savedWidgets_() {
  if (typeof isFav !== 'function') return [];
  /* THROUGH `widgetFor_`. A star outlives the role that made it — `FAVS` is kept on the device
     between payloads — so a flyer starred by an admin must not come back on the Saved column of
     whoever is signed in next. */
  /* `shop` TOO, since the basket moved there: a basket starred while it was a tool is the same
     `w:cart` key, and it would have dropped off Saved the day it changed column. */
  /* `reel` TOO (414): Videos and One more thing lead the Reels column now, and their stars are the same `w:` keys. */
  return allWidgets().filter(w => (w.kind === 'tool' || w.kind === 'game' || w.kind === 'shop' || w.kind === 'reel')
                               && isFav(WIDGET_KEY(w)))
    .filter(widgetFor_);
}

function savedCards_() {
  /* SIGNED OUT THERE IS NO LIST, because `FAVS` is this device's and `savedPages_` has always said
     so. One sentence rather than an empty column — the `nothingHere` rule. */
  if (typeof USER === 'undefined' || !USER) {
    return [emptyCard_('Saved')];
  }
  const wgts = savedWidgets_().map(widgetOnColumn_);
  const rest = typeof savedPages_ === 'function' ? savedPages_() : [];
  /* ---------- A KEPT CARD IS DRAWN AS FIND DRAWS IT, NOT IN A BOX INSIDE THE PANE'S BOX § */
  /* ---------- AND WHAT IS STILL COMING IS NOT "NOTHING KEPT" § */
  const coming = (typeof awaiting_ === 'function' && awaiting_())
    || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED);
  const cards = wgts.concat(rest, coming ? [loading_()] : []);
  if (cards.length) return cards;
  return [emptyCard_('Saved')];
}

/* STARTED AND STOPPED LIKE THE OTHER TWO COLUMNS. A starred timer is a running timer, and a canvas
   loop behind a screen nobody is looking at is the flat battery `toolsStop_` already exists for. */
function savedStart_(arriving) {
  widgetsWake_(savedWidgets_(), 'saved', arriving);
}

/* ---------- AND THEN THEY ARE STARTED § */
/* ONE ENTRY PER WIDGET, NOT ONE PER COPY: § */
let TOOLS_ON = [];

/* WHOM A WIDGET WAS STARTED FOR — the person signed in, or nobody. § */
function widgetWho_() {
  try { return typeof USER !== 'undefined' && USER ? String(USER.personId || USER.name || '') : ''; }
  catch (e) { return ''; }
}

/* ---------- A PAINT DOES NOT THROW AWAY THE SLOT A WIDGET IS RUNNING IN § */
/* ---------- AND A DRAWING MADE FROM OLD FACTS, OR FOR SOMEBODY ELSE, GOES BACK UNDER ITS LOADER § */
/* ---------- AT A CHANGE OF PERSON, EVERY SLOT ON THE COLUMN — NOT THE NEW PERSON'S LIST § */
function widgetsReveilAll_(col) {
  const host = document.getElementById('s-' + col);
  if (!host) return [];
  const all = typeof allWidgets === 'function' ? allWidgets() : [];
  return [...host.querySelectorAll('.widget-slot[id^="wgt-"]')].map(slot => {
    const id = slot.id.slice(4);
    const w = all.find(x => String(x.id) === id);
    return w ? { w, slot } : null;
  }).filter(Boolean);
}
function widgetsReveil_(col, who) {
  if (WIDGET_COLS.indexOf(col) === -1 || typeof loading_ !== 'function') return;
  const me = widgetWho_();
  (who ? widgetsReveilAll_(col) : widgetsOn_(col).map(w => ({ w, slot: slotOn_(col, String(w.id)) }))).forEach(({ w, slot }) => {
    if (typeof w.start !== 'function' && typeof w.draw !== 'function') return;
    if (!slot || slot.getAttribute('aria-busy')) return;
    if (TOOLS_ON.some(e => e.slot === slot)) return;
    if (who ? slot.WHO === me : (w.pure || (slot.OWN !== undefined && slot.OWN === me))) return;
    slot.innerHTML = w.html + loading_();
    slot.setAttribute('aria-busy', 'true');
    delete slot.AHEAD;
    delete slot.WHO;
    delete slot.LENT;
    delete slot.OWN;
  });
}

/* `pre`: THE COLUMN STILL HOLDS THE BOOT'S MARKUP (`PRE_PAYLOAD`, shell.js) — then only a slot started after the
   payload landed is carried; one started before it drew without the payload and is started again (331). */
function widgetsHeld_(col, pre) {
  const who = widgetWho_();
  const run = TOOLS_ON.filter(e => e.col === col && e.slot && e.slot.isConnected && e.who === who && (!pre || e.slot.UP_PAID));
  /* AND EVERY SLOT DRAWN AHEAD FOR THIS PERSON BY A WIDGET THAT READS NO FACTS (`pure`) — its drawing cannot be stale, so it crosses the paint as it is, and keeps § */
  const pure = [];
  widgetsOn_(col).forEach(w => {
    if (!w.pure) return;
    const sl = slotOn_(col, String(w.id));
    if (sl && sl.AHEAD && sl.AHEAD.who === who && !run.some(e => e.slot === sl)) pure.push({ w, col, slot: sl, who });
  });
  return run.concat(pure);
}
function widgetsBack_(col, held) {
  held.forEach(e => {
    const fresh = slotOn_(col, String(e.w.id));
    if (fresh && fresh !== e.slot) fresh.replaceWith(e.slot);
  });
}

function toolsStart_(kind, arriving) {
  widgetsWake_(widgetsOf_(kind), kind === 'tool' ? 'tools' : kind === 'game' ? 'games' : kind, arriving);
}

/* WHICH WIDGETS A COLUMN HOLDS, by its id — the lists `toolsStart_` and `savedStart_` start from, asked by `widgetsGlass_` of a column beside the one in front. § */
/* `reel` (414): the widgets leading the Reels column, before the admin's "+" and the first reel (`reelLead_`, posts.js). */
const WIDGET_COLS = ['shop', 'tools', 'games', 'saved', 'reel'];
function widgetsOn_(col) {
  if (col === 'saved') return savedWidgets_();
  if (col === 'reel') return widgetsOf_('reel');
  if (col === 'tools') return widgetsOf_('tool');
  if (col === 'games') return widgetsOf_('game');
  if (col === 'shop') return widgetsOf_('shop');
  return [];
}

/* THE SLOT ON THAT COLUMN, NOT `$()`'s — the note on `widgetUp_` says why. § */
function slotOn_(col, id) {
  const host = col && document.getElementById('s-' + col);
  if (!host) return null;
  const want = 'wgt-' + id;
  try { return host.querySelector('#' + CSS.escape(want)); }
  catch (e) { return [...host.querySelectorAll('.widget-slot')].find(el => el.id === want) || null; }
}

/* ---------- ALL OF THEM STILL, BUT NOT ALL IN ONE TASK WHEN A COLUMN IS ARRIVED AT § */
/* `{ w, col }` still to start — on the column in front, or on a column beside it whose card is on the
   glass (`widgetsGlass_`). */
let TOOLS_WAIT = [];
let TOOLS_WAKE = 0;       // the booked step

/* ONE WAY A WIDGET STARTS, WHICHEVER OF THE THREE ASKS — this was written out three times, here, in `widgetsLater_` and in `widgetsNear_`, and the loader has to § */
/* ---------- AND ONE DRAWN AHEAD WITH NOTHING CHANGED SINCE IS ADOPTED, NOT STARTED § */
const WIDGET_UPS = {};
function widgetAdoptable_(w, slot) {
  const a = slot && slot.AHEAD;
  return !!(a && !w.stop && slot.isConnected && a.who === widgetWho_() && a.act === ACT_EPOCH
    && a.draw === DRAW_EPOCH && a.ups === (WIDGET_UPS[String(w.id)] || 0));
}
function widgetUp_(w, col) {
  const id = String(w.id);
  const slot = col ? slotOn_(col, id) : $('wgt-' + id);
  const adopt = widgetAdoptable_(w, slot);
  TOOLS_ON.push({ w, col, slot, who: widgetWho_() });
  if (slot && col) WIDGET_HOME[slot.id] = col;
  /* WHOM ITS DRAWING IS FOR, kept on the slot after the widget stops — see `widgetsReveil_`. And ANY other
     copy drawn ahead is no longer what this widget's state would draw (`WIDGET_UPS`). */
  /* AND NOT LENT ANY MORE (`LENT`, below): this copy is the one running now. */
  if (slot) { slot.WHO = widgetWho_(); delete slot.AHEAD; delete slot.LENT; slot.UP_PAID = typeof FIRST_PAINT_DONE !== 'undefined' && !!FIRST_PAINT_DONE; }
  WIDGET_UPS[id] = (WIDGET_UPS[id] || 0) + 1;
  try { if (!adopt && w.start) w.start(); }
  catch (e) { oops_(e, 'widget:' + id, slot); }
  finally {
    if (typeof loaded_ === 'function') {
      loaded_(slot);
      widgetCopies_(id).forEach(el => { if (el !== slot && widgetLit_(el)) { loaded_(el); el.LENT = true; } });
    }
  }
}

/* EVERY SLOT OF ONE WIDGET IN THE DOCUMENT — its own column's and Saved's — and whether the last
   placement left a slot's card on the glass (`GLASS.pages`, shell.js). */
function widgetCopies_(id) {
  return WIDGET_COLS.map(c => slotOn_(c, id)).filter(Boolean);
}
function widgetLit_(el) {
  try { return typeof GLASS !== 'undefined' && GLASS.pages.indexOf(el.closest('.page')) !== -1; } catch (e) { return false; }
}

/* AND STOPPED, the one way — its own `stop`, and `$` told the copy is nobody's now. */
function widgetDown_(e) {
  try { e.w.stop && e.w.stop(); } catch (err) {}
  if (e.slot && WIDGET_HOME[e.slot.id] === e.col) delete WIDGET_HOME[e.slot.id];
}

/* ---------- THE COLUMN IN FRONT: WHAT IT HOLDS IS STARTED, AND WHAT IS ALREADY RUNNING IS LEFT § */
function widgetsWake_(list, col, arriving) {
  const ids = new Set(list.map(w => String(w.id)));
  const keep = e => !ids.has(String(e.w.id)) || (arriving && e.col === col && e.slot && e.slot.isConnected);
  toolsStop_(keep, q => !ids.has(String(q.w.id)));
  const up = list.filter(w => !TOOLS_ON.some(e => String(e.w.id) === String(w.id)));
  if (!arriving) { up.forEach(w => widgetUp_(w, col)); return; }
  /* ARRIVING: WHAT WAS DRAWN AHEAD WITH NOTHING CHANGED IS ADOPTED NOW, every one of them — it costs nothing (`widgetUp_`). § */
  const veiled = w => { const sl = slotOn_(col, String(w.id)); return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT; };
  const adopt = up.filter(w => widgetAdoptable_(w, slotOn_(col, String(w.id))));
  adopt.forEach(w => widgetUp_(w, col));
  const rest = up.filter(w => adopt.indexOf(w) === -1);
  const now = rest.filter(w => veiled(w) && widgetDistance_(w, col) <= 1);
  now.forEach(w => widgetUp_(w, col));
  rest.filter(w => now.indexOf(w) === -1).forEach(w => TOOLS_WAIT.push({ w, col }));
  if (TOOLS_WAIT.length) widgetsLater_();
}

/* HOW MANY PAGES FROM ITS COLUMN'S OWN PAGE IN FRONT a widget's slot sits — read off the page that holds `#wgt-<id>` ON THAT COLUMN, which is what § */
function widgetDistance_(w, col) {
  try {
    const slot = slotOn_(col, String(w.id)), host = $('s-' + col);
    const pg = slot && slot.closest('.page');
    if (!pg || !host) return 0;
    const i = [...host.querySelectorAll(':scope > .page')].indexOf(pg);
    return i < 0 ? 0 : Math.abs(i - domIndex_(col, PAGE[col] || 0));
  } catch (e) { return 0; }
}

/* ON THE GLASS FIRST, THEN NEAREST ITS COLUMN'S PAGE IN FRONT — what is being looked at before what a
   swipe would bring. `GLASS.pages` is placeGrid's answer to which cards are on the glass. */
function widgetRank_(q) {
  let lit = false;
  try {
    const slot = slotOn_(q.col, String(q.w.id));
    lit = !!(slot && typeof GLASS !== 'undefined' && GLASS.pages.indexOf(slot.closest('.page')) !== -1);
  } catch (e) {}
  return (lit ? 0 : 1000) + widgetDistance_(q.w, q.col);
}

let TOOLS_BUSY_SINCE = 0;   // when `widgetsLater_` first found a finger down, for its cap
function widgetsLater_() {
  if (TOOLS_WAKE) return;
  TOOLS_WAKE = setTimeout(function step() {
    TOOLS_WAKE = 0;
    if (!TOOLS_WAIT.length) return;
    /* NOTHING STARTS WHILE THE CONSOLE PLAYS (`nesQuiet_`, games.js, 419): a game on a slow laptop needs every frame. */
    if (typeof NES_ !== 'undefined' && NES_.quiet) { TOOLS_WAKE = setTimeout(step, 500); return; }
    const now = performance.now();
    /* A FINGER DOWN AT ALL, NOT ONLY ONE WHOSE DIRECTION IS DECIDED: § */
    /* AND A COLUMN CHANGE NOT YET PLACED (`GLASS.at`). § */
    const busy = (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && now < SETTLE_ON.until)
              || (typeof SWIPE !== 'undefined' && SWIPE.live)
              || (typeof SLIDE_UNTIL !== 'undefined' && now < SLIDE_UNTIL)
              || (typeof GLASS !== 'undefined' && GLASS.at !== AT);
    /* BUT NOT FOR EVER. A finger resting on the glass — or a `pointerup` the browser never sent — is `SWIPE.live` with nothing moving, and a column of widgets that § */
    if (busy && !(TOOLS_BUSY_SINCE && now - TOOLS_BUSY_SINCE > 1500)) {
      if (!TOOLS_BUSY_SINCE) TOOLS_BUSY_SINCE = now;
      TOOLS_WAKE = setTimeout(step, 60); return;
    }
    if (!busy) TOOLS_BUSY_SINCE = 0;
    /* EACH ASKED ONCE, NOT ONCE PER COMPARISON — a rank reads the column's pages. */
    const rank = new Map(TOOLS_WAIT.map(q => [q, widgetRank_(q)]));
    TOOLS_WAIT.sort((a, b) => rank.get(a) - rank.get(b));
    const next = TOOLS_WAIT.shift();
    /* ALREADY RUNNING — started meanwhile by `widgetsNear_` or an arrival — is left alone: one widget,
       one start, whichever of the three asked first. */
    if (!TOOLS_ON.some(e => String(e.w.id) === String(next.w.id))) {
      widgetUp_(next.w, next.col);
      /* A WIDGET BESIDE THE COLUMN IN FRONT GROWS ITS CARD AS IT DRAWS, and nothing re-centres a column that is not in front § */
      if (next.col !== AT && typeof placeCells === 'function') placeCells('y', true);
    }
    /* A GAP, NOT NOUGHT: `setTimeout(…, 0)` would queue the next start ahead of a touch that is
       already waiting to be delivered on a busy phone. One frame's worth is enough for it to land. */
    if (TOOLS_WAIT.length) TOOLS_WAKE = setTimeout(step, 16);
  }, 0);
}

/* AND A PAGE TURNED TO BEFORE ITS TURN CAME starts its widget NOW, with the ones either side of it — called by `goPage` before the column moves, so a tile that § */
/* IN THE RELEASE, ONLY A SLOT STILL UNDER ITS LOADER IS STARTED (the floor), and one drawn ahead with nothing changed is adopted, which costs nothing. § */
function widgetsNear_(col) {
  if (!TOOLS_WAIT.length) return;
  const now = TOOLS_WAIT.filter(q => {
    if (q.col !== col || widgetDistance_(q.w, col) > 1) return false;
    const sl = slotOn_(q.col, String(q.w.id));
    return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT || widgetAdoptable_(q.w, sl);
  });
  if (!now.length) return;
  TOOLS_WAIT = TOOLS_WAIT.filter(q => now.indexOf(q) === -1);
  now.forEach(q => { if (!TOOLS_ON.some(e => String(e.w.id) === String(q.w.id))) widgetUp_(q.w, q.col); });
}

/* STOPS EVERY RUNNING WIDGET `keep` DOES NOT KEEP, AND FORGETS EVERY WAITING ONE `wait` DOES NOT — with neither, everything, which is what this always did. § */
/* AND A QUEUE EMPTIED HERE FORGETS WHEN IT FIRST FOUND A FINGER DOWN. § */
function toolsStop_(keep, wait) {
  TOOLS_WAIT = wait ? TOOLS_WAIT.filter(wait) : [];
  if (!TOOLS_WAIT.length) {
    if (TOOLS_WAKE) { clearTimeout(TOOLS_WAKE); TOOLS_WAKE = 0; }
    TOOLS_BUSY_SINCE = 0;
  }
  const off = keep ? TOOLS_ON.filter(e => !keep(e)) : TOOLS_ON;
  TOOLS_ON = keep ? TOOLS_ON.filter(keep) : [];
  off.forEach(widgetDown_);
}

/* A WIDGET WHOSE CARD IS ON THE GLASS IS STARTED, WHICHEVER COLUMN IT IS IN § */
function widgetsGlass_(settled) {
  if (typeof GLASS === 'undefined' || !GLASS || GLASS.at !== AT) return;
  const lit = new Set(GLASS.pages);
  const glassy = (col, slot) => col !== AT && !!slot && slot.isConnected && lit.has(slot.closest('.page'));
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  /* THE COPIES ON THE GLASS BESIDE THE COLUMN IN FRONT, nearest it first — the order a starred
     widget's copy is chosen in. A widget with no `start` never waits and is not this file's to start. */
  const ti = TABS.findIndex(t => t.id === AT);
  const far = c => Math.abs(TABS.findIndex(t => t.id === c) - ti);
  const beside = new Map();
  GLASS.cols.filter(c => c !== AT && WIDGET_COLS.indexOf(c) !== -1)
    .sort((a, b) => far(a) - far(b) || TABS.findIndex(t => t.id === a) - TABS.findIndex(t => t.id === b))
    .forEach(col => widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function') return;
      const slot = slotOn_(col, id);
      if (!glassy(col, slot)) return;
      if (!beside.has(id)) beside.set(id, []);
      beside.get(id).push({ w, col });
    }));
  /* STOP WHAT HAS LEFT THE GLASS and forget what was waiting for it. A widget of the column in front
     stays while that column holds it; one beside it stays while its own copy is on the glass. */
  /* A SLOT THAT IS GONE is markup a paint replaced, and what ran in it is stopped; a widget the column
     in front started with no slot of its own at all (`savedStart_` signed out) is left as it was. */
  /* AND ONE BESIDE IT ONLY FOR WHOEVER IS SIGNED IN NOW — see the last point of the note above. */
  const who = widgetWho_();
  const keep = e => (e.col === AT ? front.has(String(e.w.id)) && (!e.slot || e.slot.isConnected)
                                  : glassy(e.col, e.slot) && e.who === who);
  const wait = q => (q.col === AT ? front.has(String(q.w.id)) : glassy(q.col, slotOn_(q.col, String(q.w.id))));
  /* THE WAITING ONES ARE FORGOTTEN NOW AND THE RUNNING ONES STOPPED AFTER THE SLIDE. § */
  if (!settled && TOOLS_ON.some(e => !keep(e))) afterSlide_(widgetsSettle_, 'glass');
  toolsStop_(settled ? keep : () => true, wait);
  /* AND QUEUE WHAT IS ON IT AND NOT RUNNING. § */
  beside.forEach((copies, id) => {
    /* ---------- AND A COPY OF A WIDGET RUNNING IN FRONT, DRAWN AGAIN BY THE BUILDER, IS NOT LEFT VEILED § */
    if (front.has(id)) {
      if (TOOLS_ON.some(e => String(e.w.id) === id && e.col === AT)) copies.forEach(c => {
        const sl = slotOn_(c.col, id);
        if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; }
      });
      return;
    }
    if (TOOLS_ON.some(e => String(e.w.id) === id && keep(e))) {
      copies.forEach(c => { const sl = slotOn_(c.col, id); if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; } });
      return;
    }
    if (TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
    TOOLS_WAIT.push({ w: copies[0].w, col: copies[0].col });
  });
  if (TOOLS_WAIT.length) widgetsLater_();
}
/* THE SAME QUESTION ASKED AGAIN ONCE THE SLIDE HAS SETTLED, and this time what has left is stopped — and
   a starred widget whose copy left while its other copy stayed is queued on the one still there. */
function widgetsSettle_() { widgetsGlass_(true); }

/* EVERY WIDGET SLOT IS DRAWN BEFORE IT IS NEEDED — AND NOTHING RUNS FOR NOBODY § */
function aheadDrawWidget_(w, col) {
  const id = String(w.id);
  const slot = slotOn_(col, id);
  if (!slot || !slot.getAttribute('aria-busy')) return;
  const had = Object.prototype.hasOwnProperty.call(WIDGET_HOME, slot.id) ? WIDGET_HOME[slot.id] : undefined;
  WIDGET_HOME[slot.id] = col;
  let drawn = true;
  try { drawn = (typeof w.draw === 'function' ? w.draw() : w.start()) !== false; }
  catch (e) { drawn = false; try { console.warn('[widget ahead]', id, e); } catch (x) {} }
  finally { if (had === undefined) delete WIDGET_HOME[slot.id]; else WIDGET_HOME[slot.id] = had; }
  if (!drawn) { slot.NOAHEAD = true; return; }
  if (typeof loaded_ === 'function') loaded_(slot);
  delete slot.LENT;
  slot.AHEAD = { who: widgetWho_(), act: ACT_EPOCH, draw: DRAW_EPOCH, ups: WIDGET_UPS[id] || 0, pure: !!w.pure };
  slot.WHO = widgetWho_();
  /* AND ITS COLUMN PLACED AGAIN, NOW: a widget grows its card as it draws (`widgetsLater_`'s reason). */
  if (typeof placeOne_ === 'function') placeOne_(col);
}
/* THE BUILDER'S WIDGET JOBS — every slot `aheadDrawWidget_` may draw, with how far it is. § */
function aheadWidgetJobs_() {
  const out = [];
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  WIDGET_COLS.forEach(col => {
    if (col === AT || STALE[col] || !TABS.some(t => t.id === col)) return;
    const host = document.getElementById('s-' + col);
    if (!host || !host.firstElementChild) return;
    let pages = null;
    widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
      if (front.has(id)) return;
      if (TOOLS_ON.some(e => String(e.w.id) === id) || TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
      const slot = slotOn_(col, id);
      if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD) return;
      if (!pages) pages = [...host.querySelectorAll(':scope > .page')];
      const pos = pages.indexOf(slot.closest('.page'));
      const dp = pos < 0 ? 0 : Math.abs(logIndex_(col, pos) - (PAGE[col] || 0));
      out.push({ key: 'widget:' + col + ':' + id, kind: 'widget', d: aheadDist_(col, null) + Math.min(15, dp) / 16, pre: !!w.pure,
        run: () => aheadDrawWidget_(w, col) });
    });
  });
  return out;
}
AHEAD_KINDS.push(aheadWidgetJobs_);

/* ARRIVING AT A CARD STILL UNDER ITS LOADER: its widget is drawn before the slide, so the card comes in at the height it will keep — not short, then a jump (382). */
function widgetsBeforeSlide_(col) {
  if (WIDGET_COLS.indexOf(col) === -1) return;
  widgetsOn_(col).forEach(w => {
    const id = String(w.id);
    if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
    if (TOOLS_ON.some(e => String(e.w.id) === id)) return;
    const slot = slotOn_(col, id);
    if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD || widgetDistance_(w, col) !== 0) return;
    aheadDrawWidget_(w, col);
  });
}


/* ---------- A WIDGET IS A SCREEN, NOT AN ITEM IN A LIST § */
screen('saved', () => pages('saved', savedCards_()));
/* THE SHOP WINDOW. Built like Saved and for the same reason — one card per thing, a pager that counts the same array the screen is built from, and a sentence § */
screen('spotlight', () => pages('spotlight', spotlightCards_()));
/* ---------- PROGRESS (435): ONE WIDGET PER THING, ONE LINE PER THING, EACH ITS TITLE ALONE WITH NOTHING TO SAY ---------- */
/* ---------- YOUR JOURNEY, MOVED HERE FROM THE SETTINGS COLUMN § */
/* A STUDENT'S CARD, AND THE ADMIN'S TO SEE IT — by rank (400), never the role string. */
function mayJourney_() {
  if (typeof rank_ !== 'function') return false;
  return rank_() === 'student' || rankAtLeast_('admin');
}
/* THE EXAM DATES CHANGED UNDER THE COLUMN, so it is REDRAWN IF IT IS DRAWN — the rule `profileRefresh_` keeps for Settings, whose About you holds the same two § */
function progressRedraw_() {
  try {
    /* COUNTDOWNS ARE A TOOLS WIDGET SINCE 466, for everyone; a date saved on About you repaints it there. */
    if (typeof paintCountdowns_ === 'function') paintCountdowns_();
    if (typeof screenHasMarkup_ === 'function' && !screenHasMarkup_('account')) return;
    paint('account');
    paintPager('account', true);
  } catch (e) {}
}

/* ---------- COUNTDOWNS ---------- */
/* WHEN EACH BIG EXAM SEASON STARTS, as MM-DD (or a whole YYYY-MM-DD for one year): the config tab's `exam_*_start` wins, these are the usual second week of May and mid-September. */
const PROG_EXAMS = [
  { id: 'sats', name: 'SATs', key: 'exam_sats_start', at: '05-11' },
  { id: 'elevenplus', name: '11+', key: 'exam_11plus_start', at: '09-12' },
  { id: 'gcse', name: 'GCSE exams', key: 'exam_gcse_start', at: '05-11' },
  { id: 'alevel', name: 'A-level exams', key: 'exam_alevel_start', at: '05-11' }];
/* SCHOOL HOLIDAYS WHEN THE SHEET'S `intervals` NAME NONE AHEAD: config `holiday_starts` ("MM-DD Name, …") wins; these are the usual London starts. */
const PROG_HOLIDAYS = '10-26 October half-term, 12-19 Christmas holidays, 02-13 February half-term, 03-27 Easter holidays, 05-22 May half-term, 07-22 Summer holidays';
const progressVars_ = () => { try { return (DATA && DATA.constants && DATA.constants.vars) || {}; } catch (e) { return {}; } };
const progressToday_ = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const progressDaysTo_ = d => Math.round((d - progressToday_()) / 864e5);
/* THE NEXT TIME `MM-DD` (or a fixed YYYY-MM-DD) COMES ROUND, today included; `year` asks for that year's. */
function progressWhen_(spec, year) {
  const s = String(spec || '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!m) return null;
  const t = progressToday_();
  let d = new Date(year || t.getFullYear(), +m[1] - 1, +m[2]);
  if (!year && d < t) d = new Date(t.getFullYear() + 1, +m[1] - 1, +m[2]);
  return d;
}
const progressExamAt_ = (e, year) => progressWhen_(String(progressVars_()[e.key] || '').trim() || e.at, year)
  || progressWhen_(e.at, year);
/* THE SCHOOL YEAR OFF A DATE OF BIRTH (England): Year N is N + 4 on the 1st of September the year began. */
function progressSchoolYear_(dob) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dob || ''));
  if (!m) return null;
  const t = progressToday_();
  const began = t.getMonth() >= 8 ? t.getFullYear() : t.getFullYear() - 1;
  let age = began - +m[1];
  if (+m[2] > 9 || (+m[2] === 9 && +m[3] > 1)) age--;
  const y = age - 4;
  return y >= 1 && y <= 13 ? { year: y, began: began } : null;
}
/* THE ONE BIG EXAM AHEAD: off the school year when there is a birthday, else off the level of a session booked. */
function progressBigExam_() {
  const prof = (USER && USER.profile) || {};
  const sy = progressSchoolYear_(prof.date_of_birth);
  const E = id => PROG_EXAMS.find(e => e.id === id);
  const t = progressToday_();
  if (sy) {
    const y = sy.year, began = sy.began;
    if (y >= 12) return { e: E('alevel'), d: progressExamAt_(E('alevel'), began + (13 - y) + 1) };
    if (y >= 7) return { e: E('gcse'), d: progressExamAt_(E('gcse'), began + (11 - y) + 1) };
    if (y === 6) {
      const eleven = progressExamAt_(E('elevenplus'), began);
      if (eleven && eleven >= t) return { e: E('elevenplus'), d: eleven };
      return { e: E('sats'), d: progressExamAt_(E('sats'), began + 1) };
    }
    if (y >= 3) return { e: E('elevenplus'), d: progressExamAt_(E('elevenplus'), began + (6 - y)) };
    return null;
  }
  const lv = (typeof myJobs_ === 'function' ? myJobs_() : []).map(j => String(j.level || '')).join(' ');
  const id = /a-?level/i.test(lv) ? 'alevel' : /gcse/i.test(lv) ? 'gcse' : /11\s*\+|eleven/i.test(lv) ? 'elevenplus' : /sats|ks2/i.test(lv) ? 'sats' : '';
  return id ? { e: E(id), d: progressExamAt_(E(id)) } : null;
}
/* THE NEXT HOLIDAY: a holiday row of the sheet's `intervals` ahead, else the day after a term ends, else `holiday_starts`. */
function progressHoliday_() {
  const t = progressToday_();
  const ivs = (DATA && DATA.intervals) || [];
  const at = [];
  ivs.forEach(x => {
    const from = typeof parseDMY === 'function' ? parseDMY(x.startDate) : null, to = typeof parseDMY === 'function' ? parseDMY(x.endDate) : null;
    if (/holiday|half/i.test(String(x.kind || '')) && from && from >= t) at.push({ name: x.label || x.term || 'Holiday', d: from });
    else if (to) { const n = new Date(to.getTime()); n.setDate(n.getDate() + 1); if (n >= t) at.push({ name: 'Holiday after ' + (x.label || x.term || 'term'), d: n }); }
  });
  if (!at.length) {
    const list = String(progressVars_().holiday_starts || '').trim() || PROG_HOLIDAYS;
    list.split(',').forEach(bit => {
      const m = /^\s*(\d{1,2}-\d{1,2}|\d{4}-\d{2}-\d{2})\s+(.+?)\s*$/.exec(bit);
      const d = m && progressWhen_(m[1]);
      if (d) at.push({ name: m[2], d: d });
    });
  }
  at.sort((a, b) => a.d - b.d);
  return at[0] || null;
}
const progressDaysSaid_ = n => (n === 0 ? 'today' : n + (n === 1 ? ' day' : ' days'));
/* THE ROWS, for anyone (466): the next holiday needs no account; the exam dates are your own when signed in. */
function progressCountdownRows_() {
  const rows = [];
  if (typeof USER !== 'undefined' && USER) {
    const prof = USER.profile || {};
    /* THE TWO DATES TYPED ON ABOUT YOU, for a student or an admin, as before (`mayJourney_`). */
    if (mayJourney_()) {
      [['Small exam', prof.exam_small_date], ['Big exam', prof.exam_big_date]].forEach(([k, v]) => {
        const d = progressWhen_(/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : '');
        if (d && progressDaysTo_(d) >= 0) rows.push([k, progressDaysTo_(d)]);
      });
    }
    const big = progressBigExam_();
    if (big && big.d && progressDaysTo_(big.d) >= 0) rows.push([big.e.name, progressDaysTo_(big.d)]);
  }
  const hol = progressHoliday_();
  if (hol) rows.push([hol.name, progressDaysTo_(hol.d)]);
  return rows;
}
/* ---------- THE COUNTDOWNS WIDGET ON TOOLS (466): every copy by class, as the Saved column draws it too ---------- */
function paintCountdowns_() {
  const rows = progressCountdownRows_();
  document.querySelectorAll('.cd-box').forEach(box => {
    box.innerHTML = rows.map(([k, n]) => `<div class="row"><span class="k">${esc(k)}</span><span class="v">${progressDaysSaid_(n)}</span></div>`).join('');
  });
}

/* ---------- TERM DATES (491): THE YEAR AS INTERVALS — terms, half-terms and holidays, each with its real first and last day ---------- */
/* The usual England pattern, the backend's `schoolYear` (booking.gs) in the browser: a term runs Monday to Friday, a holiday Saturday to Sunday. */
function tdYear_(y) {
  const D = (yy, m, d) => new Date(yy, m, d), add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const nth = (yy, mo, wd, n) => {
    if (n > 0) { const d = D(yy, mo, 1); return add(d, ((wd - d.getDay() + 7) % 7) + 7 * (n - 1)); }
    const d = D(yy, mo + 1, 0); return add(d, -((d.getDay() - wd + 7) % 7));
  };
  const easter = yy => {
    const a = yy % 19, b = Math.floor(yy / 100), c = yy % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return D(yy, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  };
  let autumn = nth(y, 8, 1, 1); if (autumn.getDate() <= 2) autumn = add(autumn, 3);
  const octMon = nth(y, 9, 1, -1), octHalf = octMon.getDate() + 4 > 31 ? add(octMon, -7) : octMon;
  const decFri = nth(y, 11, 5, -1), xmas = decFri.getDate() > 22 ? add(decFri, -7) : decFri;
  let jan = D(y + 1, 0, 2); while (jan.getDay() === 0 || jan.getDay() === 6) jan = add(jan, 1);
  const feb = nth(y + 1, 1, 1, 3), easStart = add(easter(y + 1), -6), easEnd = add(easStart, 11), may = nth(y + 1, 4, 1, -1), jul = nth(y + 1, 6, 5, 3);
  const terms = [['Autumn 1', autumn, add(octHalf, -3)], ['Autumn 2', add(octHalf, 7), xmas], ['Spring 1', jan, add(feb, -3)],
    ['Spring 2', add(feb, 7), add(easStart, -3)], ['Summer 1', add(easEnd, 3), add(may, -3)], ['Summer 2', add(may, 7), jul]];
  const hols = [['October half-term', 'half'], ['Christmas holidays', 'holiday'], ['February half-term', 'half'], ['Easter holidays', 'holiday'], ['May half-term', 'half']];
  const out = [];
  terms.forEach((t, i) => {
    out.push({ name: t[0], kind: 'term', from: t[1], to: t[2] });
    if (i < hols.length) out.push({ name: hols[i][0], kind: hols[i][1], from: add(t[2], 1), to: add(terms[i + 1][1], -1) });
  });
  out.push({ name: 'Summer holidays', kind: 'holiday', from: add(jul, 1), to: add(tdYear0_(y + 1), -1) });
  return out;
}
/* THE FIRST DAY OF A YEAR'S AUTUMN TERM, which ends the summer before it. */
function tdYear0_(y) { let d = new Date(y, 8, 1); d = new Date(y, 8, 1 + ((8 - d.getDay()) % 7)); return d.getDate() <= 2 ? new Date(y, 8, d.getDate() + 3) : d; }
/* MY SCHOOL (491): starts and ends a few school days earlier or later, kept on this phone for whoever is signed in. */
const tdKey_ = () => 'familyTermShift:' + ((typeof USER !== 'undefined' && USER && USER.personId) || 'anon');
function tdShift_() { try { const o = JSON.parse(localStorage.getItem(tdKey_()) || 'null'); return { s: +(o && o.s) || 0, e: +(o && o.e) || 0 }; } catch (e) { return { s: 0, e: 0 }; } }
/* N SCHOOL DAYS ON from a weekday, weekends skipped, so a shift never lands a first day on a Saturday. */
function tdSchoolDays_(d, n) { let x = new Date(d.getTime()); const st = n < 0 ? -1 : 1; for (let k = Math.abs(n); k > 0;) { x.setDate(x.getDate() + st); if (x.getDay() % 6) k--; } return x; }
function termDatesRows_(today) {
  const t = today || progressToday_(), y = t.getMonth() >= 7 ? t.getFullYear() : t.getFullYear() - 1, sh = tdShift_();
  const all = tdYear_(y - 1).concat(tdYear_(y), tdYear_(y + 1)).map(x => Object.assign({}, x));
  all.forEach((x, i) => {
    if (x.kind !== 'term') return;
    if (sh.s) { x.from = tdSchoolDays_(x.from, sh.s); if (all[i - 1]) all[i - 1].to = new Date(x.from.getFullYear(), x.from.getMonth(), x.from.getDate() - 1); }
    if (sh.e) { x.to = tdSchoolDays_(x.to, sh.e); if (all[i + 1]) all[i + 1].from = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1); }
  });
  const i = all.findIndex(x => x.from <= t && t <= x.to);
  return all.slice(Math.max(0, i), Math.max(0, i) + 4).map((x, k) => Object.assign(x, { now: k === 0 && i >= 0 }));
}
const tdDay_ = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
/* A TERM SAYS ITS FIRST AND LAST DAY OF TERM; A BREAK SAYS WHEN IT STARTS AND THE FIRST DAY BACK — never "ends" on a Sunday. */
function tdLine_(x) {
  const back = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1);
  while (back.getDay() % 6 === 0) back.setDate(back.getDate() + 1);
  const v = x.kind === 'term' ? `${tdDay_(x.from)} – last day of term ${tdDay_(x.to)}` : `from ${tdDay_(x.from)} · first day back ${tdDay_(back)}`;
  return `<div class="row td-${x.kind}${x.now ? ' td-now' : ''}"><span class="k">${x.now ? 'Now: ' : ''}${esc(x.name)}</span><span class="v">${esc(v)}</span></div>`;
}
function paintTermDates_() {
  const rows = termDatesRows_(), sh = tdShift_();
  const adj = (id, v, label) => `<div class="row"><span class="k">${label}</span><span class="v"><select class="td-adj" data-td="${id}" aria-label="${label}">${
    [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(n => `<option value="${n}"${n === v ? ' selected' : ''}>${n ? (n > 0 ? n + ' later' : -n + ' earlier') : 'as usual'}</option>`).join('')}</select></span></div>`;
  document.querySelectorAll('.td-box').forEach(box => {
    box.removeAttribute('aria-busy');
    box.innerHTML = rows.map(tdLine_).join('')
      + '<p class="faint td-say">The usual England dates. Schools vary by a few days, so set yours below (school days, kept on this phone).</p>'
      + adj('s', sh.s, 'My school starts') + adj('e', sh.e, 'My school ends');
  });
}
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('.td-adj');
  if (!el) return;
  const o = tdShift_(); o[el.dataset.td] = Number(el.value) || 0;
  try { localStorage.setItem(tdKey_(), JSON.stringify(o)); } catch (x) {}
  paintTermDates_();
});

/* ---------- WHAT WAS ANSWERED ---------- */
/* THE LATEST PRESS PER QUESTION: the account's (`DATA.submissions`, this person's only) and this device's (`subAll_`), the later winning, as `subAdopt_` decides. */
function progressPresses_() {
  const who = typeof whoIs_ === 'function' ? whoIs_() : '';
  if (!who) return [];
  const pid = USER && USER.personId ? String(USER.personId) : '';
  const out = {};
  try {
    const s = DATA && DATA.submissions;
    if (pid && s && String(s.for || '') === pid && s.mine && typeof s.mine === 'object') {
      Object.keys(s.mine).forEach(k => {
        const e = s.mine[k];
        if (e && String(e.answer || '').trim()) out[k] = { v: String(e.verdict || ''), at: Number(e.at) || 0 };
      });
    }
  } catch (e) {}
  try {
    const all = typeof subAll_ === 'function' ? subAll_(who) : {};
    Object.keys(all).forEach(k => {
      const e = all[k];
      if (!e || typeof e.a !== 'string' || !e.a.trim()) return;
      const at = Number(e.at) || 0;
      if (!out[k] || out[k].at <= at) out[k] = { v: String(e.v || ''), at: at };
    });
  } catch (e) {}
  return Object.keys(out).map(k => ({ key: k, v: out[k].v, at: out[k].at }));
}
/* A VERDICT AS MARKS — SUBMISSION_VERDICT's vocabulary; `sent` is attempted and not marked, so it counts as tried and never as right or wrong. */
function progressScore_(v) {
  if (v === 'right') return { got: 1, of: 1 };
  if (v === 'wrong') return { got: 0, of: 1 };
  const m = /^(?:ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(String(v || ''));
  return m && +m[2] > 0 ? { got: Math.min(+m[1], +m[2]), of: +m[2] } : null;
}
const progressDay_ = ms => { const d = new Date(ms); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const progressPaperOf_ = x => String((x && x.row && x.row.paper_id) || (x && x.sub) || '');
/* WHICH SERIES A QUESTION BELONGS TO: past papers by subject; worksheets by who made them and subject. */
function progressSeries_(x) {
  const type = String(x.documentType || (x.row && x.row.document_type) || ''), subj = String(x.subject || '');
  const co = String(x.company || (x.row && x.row.company) || '');
  if (/past|specimen/i.test(type)) return (subj ? subj + ' ' : '') + 'past papers';
  if (/5-a-day/i.test(type)) return (co ? co + ' ' : '') + '5-a-day';
  return [co, co.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', /exercise/i.test(type) ? 'exercises' : 'worksheets'].filter(Boolean).join(' ');
}
/* EVERYTHING THE COLUMN SAYS, counted once per draw. A key the library does not hold still counts in the totals; it has no topic or paper to file under. */
function progressStats_() {
  const presses = progressPresses_();
  const index = new Map();
  let items = [];
  try { items = (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : []) || []; } catch (e) { items = []; }
  items.forEach(x => { if (x && x.kind === 'question') index.set(String(x.key || x.name), x); });
  const topics = {}, days = {}, papers = {};
  let right = 0, got = 0, of = 0;
  const recent = [];
  presses.forEach(p => {
    const x = index.get(p.key.replace(/#[^#]*$/, ''));
    const sc = progressScore_(p.v);
    const ok = !!(sc && sc.got === sc.of);
    if (sc) { got += sc.got; of += sc.of; if (ok) right++; }
    if (p.at > 0) { const d = progressDay_(p.at); days[d] = (days[d] || 0) + 1; }
    recent.push({ x: x, p: p, sc: sc, ok: ok });
    if (!x) return;
    const pid = progressPaperOf_(x);
    if (pid) {
      const pp = papers[pid] || (papers[pid] = { id: pid, x: x, done: {}, got: 0, of: 0, at: 0 });
      pp.done[String(x.key || x.name)] = sc || { sent: 1 };
      if (sc) { pp.got += sc.got; pp.of += sc.of; }
      if (p.at > pp.at) pp.at = p.at;
    }
    let ts = Array.isArray(x.topic) ? x.topic : topicAtoms_(x.topic || (x.row && x.row.topics) || '');
    if (!ts.length) ts = [String(x.subject || 'Other')];
    ts.forEach(t => {
      const o = topics[t] || (topics[t] = { topic: t, n: 0, right: 0, marked: 0, got: 0, of: 0, miss: null });
      o.n++;
      if (sc) { o.marked++; o.got += sc.got; o.of += sc.of; if (ok) o.right++; else if (!o.miss || p.at > o.miss.at) o.miss = { key: p.key, at: p.at }; }
    });
  });
  recent.sort((a, b) => b.p.at - a.p.at);
  /* THE STREAK: days in a row with a press, ending today — or yesterday, so a streak is not lost before today's first question. */
  let streak = 0;
  const t0 = new Date(); t0.setHours(12, 0, 0, 0);
  for (let i = days[progressDay_(t0.getTime())] ? 0 : 1; i < 400; i++) {
    if (!days[progressDay_(t0.getTime() - i * 864e5)]) break;
    streak++;
  }
  let week = 0, weekDays = 0;
  for (let i = 0; i < 7; i++) { const n = days[progressDay_(t0.getTime() - i * 864e5)] || 0; week += n; if (n) weekDays++; }
  const list = Object.keys(topics).map(k => topics[k]).sort((a, b) => b.n - a.n || a.topic.localeCompare(b.topic));
  const weak = list.filter(o => o.of > 0 && o.got < o.of)
    .sort((a, b) => a.got / a.of - b.got / b.of || b.of - a.of || a.topic.localeCompare(b.topic)).slice(0, 3);
  /* EVERY PAPER'S WHOLE LIST OF QUESTIONS, so a paper says what is left — and each series how many papers nobody has started. */
  const inPaper = {}, inSeries = {};
  const started = new Set(Object.keys(papers));
  items.forEach(x => {
    if (!x || x.kind !== 'question') return;
    const pid = progressPaperOf_(x);
    if (!pid) return;
    (inPaper[pid] = inPaper[pid] || []).push(x);
    const sr = progressSeries_(x);
    (inSeries[sr] = inSeries[sr] || new Set()).add(pid);
  });
  const series = {};
  Object.keys(papers).forEach(pid => {
    const pp = papers[pid];
    pp.all = (inPaper[pid] || [pp.x]).slice().sort((a, b) => String(a.qNumber || a.name).localeCompare(String(b.qNumber || b.name), undefined, { numeric: true })
      || String(a.qPart || '').localeCompare(String(b.qPart || '')));
    const sr = progressSeries_(pp.x);
    (series[sr] = series[sr] || { name: sr, papers: [], at: 0 }).papers.push(pp);
    if (pp.at > series[sr].at) series[sr].at = pp.at;
  });
  const seriesList = Object.keys(series).map(k => {
    const sr = series[k];
    sr.papers.sort((a, b) => b.at - a.at);
    sr.untouched = [...(inSeries[k] || [])].filter(pid => !started.has(pid)).length;
    return sr;
  }).sort((a, b) => b.at - a.at);
  return { n: presses.length, right: right, got: got, of: of, topics: list, weak: weak, papers: papers,
           series: seriesList, recent: recent.slice(0, 3), streak: streak, week: week, weekDays: weekDays };
}
const progressPct_ = (a, b) => (b > 0 ? Math.round(100 * a / b) : 0);
function progressAnsweredCard_(st) {
  if (!st.n) return emptyCard_('Questions');
  const rows = st.topics.slice(0, 12).map(o => `<div class="prog-topic">
      <div class="row"><span class="k">${esc(o.topic)}</span><span class="v">${o.marked ? o.right + ' of ' + o.marked + ' right' : o.n + ' tried'}</span></div>
      <div class="prog-bar" aria-hidden="true"><span style="width:${o.marked ? progressPct_(o.right, o.marked) : 0}%"></span></div>
    </div>`).join('');
  const more = st.topics.length > 12 ? `<p class="faint">and ${st.topics.length - 12} more topics</p>` : '';
  return `<div class="card prog-answered">
    <h3>Questions</h3>
    <div class="row prog-tot"><span class="k">Answered</span><span class="v">${st.n}</span></div>
    <div class="row prog-tot"><span class="k">Right</span><span class="v">${st.right}</span></div>
    <div class="row prog-tot"><span class="k">Marks</span><span class="v">${st.of ? st.got + ' of ' + st.of + ' (' + progressPct_(st.got, st.of) + '%)' : 'none marked yet'}</span></div>
    ${rows}${more}
  </div>`;
}
function progressActivityCard_(st) {
  if (!st.n) return emptyCard_('Recent activity');
  const said = p => !p.sc ? 'sent' : p.ok ? 'right' : p.sc.of > 1 ? p.sc.got + '/' + p.sc.of : 'wrong';
  const last = st.recent.map(r => `<div class="row"><span class="k">${esc((r.x && (r.x.sub ? r.x.sub + ' · ' : '') + (r.x.name || '')) || 'A question')}</span>
      <span class="v prog-v${r.ok ? ' is-good' : r.sc ? ' is-bad' : ''}">${esc(said(r))}</span></div>`).join('');
  return `<div class="card prog-activity">
    <h3>Recent activity</h3>
    <div class="row"><span class="k">Streak</span><span class="v">${st.streak ? progressDaysSaid_(st.streak) : 'none yet'}</span></div>
    <div class="row"><span class="k">Last 7 days</span><span class="v">${st.week} on ${progressDaysSaid_(st.weekDays)}</span></div>
    ${last}
  </div>`;
}
function progressWeakCard_(st) {
  if (!st.weak.length) return emptyCard_('Work on next');
  const items = st.weak.map(o => `<div class="prog-weak">
      <div class="row"><span class="k">${esc(o.topic)}</span><span class="v">${progressPct_(o.got, o.of)}% of marks</span></div>
      <div class="tile-row">${tile_({ icon: 'search', label: 'Practise', note: o.topic + ' in Find', act: 'prog-practise',
        data: { topic: o.topic, key: (o.miss && o.miss.key) || '' } })}</div>
    </div>`).join('');
  return `<div class="card prog-weakest">
    <h3>Work on next</h3>
    ${items}
  </div>`;
}

/* ---------- PROGRESS IN A FIELD: ONE CARD PER SERIES, ONE LINE PER PAPER, OPENED IN PLACE ---------- */
/* WHICH PAPERS ARE OPEN, so a redraw does not shut what was opened (no pop-up: a <details> grows the line where it is). */
const PROG_OPEN = new Set();
document.addEventListener('toggle', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('prog-paper')) return;
  const k = el.getAttribute('data-paper') || '';
  if (el.open) PROG_OPEN.add(k); else PROG_OPEN.delete(k);
}, true);
function progressPaperName_(x) {
  return String((x.row && x.row.name) || x.sub || x.name || 'A paper');
}
function progressSeriesCard_(sr) {
  const lines = sr.papers.slice(0, 15).map(pp => {
    const total = pp.all.length, done = Object.keys(pp.done).length, left = Math.max(0, total - done);
    const sums = (pp.of ? pp.got + '/' + pp.of + ' marks · ' : '') + (left ? left + ' left' : 'all done');
    const qs = pp.all.map(q => {
      const k = String(q.key || q.name), sc = pp.done[k];
      const v = !sc ? 'not done' : sc.sent ? 'sent' : sc.of > 1 ? sc.got + '/' + sc.of : sc.got ? 'right' : 'wrong';
      const tone = !sc || sc.sent ? '' : sc.got === sc.of ? ' is-good' : ' is-bad';
      return `<div class="row"><span class="k">${esc('Q' + (q.qNumber != null && q.qNumber !== '' ? q.qNumber + (q.qPart || '') : q.name))}</span><span class="v prog-v${tone}">${esc(v)}</span></div>`;
    }).join('');
    return `<details class="prog-paper" data-paper="${esc(pp.id)}"${PROG_OPEN.has(pp.id) ? ' open' : ''}>
      <summary class="row"><span class="k">${esc(progressPaperName_(pp.x))}</span><span class="v">${esc(sums)}</span></summary>
      <div class="prog-qs">${qs}</div>
    </details>`;
  }).join('');
  const more = sr.papers.length > 15 ? `<p class="faint">and ${sr.papers.length - 15} more started</p>` : '';
  const untouched = sr.untouched ? `<div class="row"><span class="k">Not started</span><span class="v">${sr.untouched}</span></div>` : '';
  /* ITS OWN CARD ID (466), so one series — past papers, Religious Studies — moves or goes alone. */
  const lid = 'prog:series:' + String(sr.name || 'x').toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `<div class="card prog-series" data-lay-card="${esc(lid)}">
    <h3>${esc(sr.name.charAt(0).toUpperCase() + sr.name.slice(1))}</h3>
    ${lines}${more}${untouched}
  </div>`;
}

/* ---------- GRADE ESTIMATE ---------- */
/* NO BOUNDARIES IN THE LIBRARY, so a share of the marks reads as a grade by these steps — said as an estimate on the card, every time. */
const PROG_GCSE_STEPS = [[80, '9'], [70, '8'], [60, '7'], [50, '6'], [40, '5'], [30, '4'], [20, '3'], [12, '2'], [5, '1']];
const PROG_ALEVEL_STEPS = [[80, 'A*'], [70, 'A'], [60, 'B'], [50, 'C'], [40, 'D'], [30, 'E']];
const PROG_SATS_STEPS = [[75, 'greater depth'], [55, 'expected standard']];
function progressLevel_(x) {
  const r = x.row || {};
  const said = [x.tier, x.bandValue, r.band_value, r.level, r.key_stage, x.keystage].map(v => String(v || '')).join(' ');
  if (/a-?level|\bas\b/i.test(said)) return 'alevel';
  if (/ks2|sats/i.test(said) || /standards & testing/i.test(String(x.company || r.company || ''))) return 'sats';
  if (/ks4|gcse|foundation|higher/i.test(said)) return 'gcse';
  return '';
}
function progressGrade_(steps, pct, low) {
  const s = steps.find(([at]) => pct >= at);
  return s ? s[1] : low;
}
function progressGradeCard_(st) {
  const by = {};
  Object.keys(st.papers).forEach(pid => {
    const pp = st.papers[pid];
    if (!pp.of) return;
    const x = pp.x, subj = String(x.subject || 'Other');
    const type = String(x.documentType || (x.row && x.row.document_type) || '');
    const lv = /past|specimen/i.test(type) ? progressLevel_(x) : '';
    const grade = x.bandType === 'grade' && x.bandValue ? String(x.bandValue) : '';
    if (!lv && !grade) return;
    const k = subj + '|' + (lv || 'grade');
    const o = by[k] || (by[k] = { subj: subj, lv: lv, got: 0, of: 0, n: 0, best: 0 });
    o.got += pp.got; o.of += pp.of; o.n++;
    /* A GRADED WORKSHEET COUNTS TOWARDS "WORKING AT" WHEN SEVEN IN TEN OF ITS MARKS WERE GOT. */
    if (!lv && pp.got / pp.of >= 0.7 && +grade > o.best) o.best = +grade;
  });
  const rows = Object.keys(by).map(k => by[k]).filter(o => o.lv || o.best).map(o => {
    const pct = progressPct_(o.got, o.of);
    const g = o.lv === 'gcse' ? 'grade ' + progressGrade_(PROG_GCSE_STEPS, pct, 'U')
      : o.lv === 'alevel' ? progressGrade_(PROG_ALEVEL_STEPS, pct, 'U')
      : o.lv === 'sats' ? progressGrade_(PROG_SATS_STEPS, pct, 'working towards')
      : 'working at grade ' + o.best;
    const label = o.subj + (o.lv === 'gcse' ? ' GCSE' : o.lv === 'alevel' ? ' A-level' : o.lv === 'sats' ? ' SATs' : ' worksheets');
    return `<div class="row"><span class="k">${esc(label)}</span><span class="v">${esc(g)}</span></div>
      <p class="faint prog-from">from ${o.n} ${o.n === 1 ? 'paper' : 'papers'}, ${pct}% of marks</p>`;
  }).join('');
  if (!rows) return emptyCard_('Grade estimate');
  return `<div class="card prog-grade">
    <h3>Grade estimate</h3>
    ${rows}
    <p class="faint">An estimate from your marks, not a prediction from your school.</p>
  </div>`;
}

/* ---------- SESSIONS ---------- */
/* SESSIONS FROM `myJobs_`, the Booking column's own list: four weeks either side of today, the next three and the last three. */
function progressSessions_() {
  const jobs = typeof myJobs_ === 'function' ? myJobs_() : [];
  const ahead = [], past = [];
  const t0 = progressToday_();
  jobs.forEach(j => {
    if (/cancel/i.test(String(j.status || '')) || typeof jobOn_ !== 'function') return;
    for (let i = -28; i <= 28; i++) {
      const d = new Date(t0.getTime()); d.setDate(d.getDate() + i);
      let on = false;
      try { on = jobOn_(j, d); } catch (e) { on = false; }
      if (on) (i >= 0 ? ahead : past).push({ d: d, j: j });
    }
  });
  ahead.sort((a, b) => a.d - b.d); past.sort((a, b) => b.d - a.d);
  return { ahead: ahead.slice(0, 3), past: past.slice(0, 3) };
}
function progressSessionsCard_(ss) {
  if (!ss.ahead.length && !ss.past.length) return emptyCard_('Sessions');
  const when = s => s.d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + (s.j.time ? ' · ' + s.j.time : '');
  const row = s => `<div class="row"><span class="k">${esc(when(s))}</span><span class="v">${esc(s.j.title || s.j.subject || 'Session')}</span></div>`;
  return `<div class="card prog-sessions">
    <h3>Sessions</h3>
    ${ss.ahead.length ? '<p class="sub">Coming up</p>' + ss.ahead.map(row).join('') : ''}
    ${ss.past.length ? '<p class="sub">Done</p>' + ss.past.map(row).join('') : ''}
    <div class="tile-row">${tile_({ icon: 'book', label: 'Sessions', note: 'on Book', act: 'prog-sessions' })}</div>
  </div>`;
}

/* ---------- THE COLUMN: every widget, always, so each is where it was; one with nothing to say is its title alone (414). ---------- */
function progressCards_() {
  const signed = typeof USER !== 'undefined' && !!USER;
  const st = signed ? progressStats_() : { n: 0, weak: [], series: [], papers: {}, topics: [], recent: [] };
  const cards = [progressAnsweredCard_(st), progressActivityCard_(st), progressWeakCard_(st),
    progressGradeCard_(st)];
  if (st.series.length) st.series.slice(0, 6).forEach(sr => cards.push(progressSeriesCard_(sr)));
  else cards.push(emptyCard_('Papers and worksheets'));
  cards.push(progressSessionsCard_(signed ? progressSessions_() : { ahead: [], past: [] }));
  const coming = signed && ((typeof awaiting_ === 'function' && awaiting_())
    || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED));
  if (coming) cards.push(loading_());
  return cards;
}
/* PRACTISE A TOPIC: Find with that Topic chip. Questions do not answer Topic (`topicShown_`), so a chip that finds nothing opens the question last got wrong instead. */
on('prog-practise', el => {
  const topic = String((el && el.dataset.topic) || ''), key = String((el && el.dataset.key) || '');
  if (!topic || typeof FINDERS === 'undefined') return;
  const F = FINDERS.stuff;
  let n = 0;
  finderSet_(F, { filters: [{ field: 'topic', value: topic }], paint: false });
  inFinder_(F, () => { try { n = stuffFiltered().length; } catch (e) { n = 0; } });
  if (!n) finderSet_(F, { paint: false });
  if (!n) {
    const x = key ? (stuffItemsAll_() || []).find(y => y && y.kind === 'question' && String(y.key || y.name) === key.replace(/#[^#]*$/, '')) : null;
    if (x && typeof finderOpen_ === 'function') { finderOpen_(x, null, F); return; }
    toast('Nothing in Find on ' + topic + ' yet.');
    return;
  }
  inFinder_(F, () => {
    paintStuff();
    if (AT !== F.id) go(F.id);
    goPage(F.id, stuffFirstResult_());
  });
});
on('prog-sessions', () => { go('booking'); });
/* `screen('progress')` WAS HERE: its cards are on Student settings (461), `studentSetPages_` in me.js. */
screen('tools', () => pages('tools', widgetColumn_('tool')));
screen('games', () => pages('games', widgetColumn_('game')));
