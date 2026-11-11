/* @family. — qr.js A QR CODE DRAWN HERE, no library and no service: byte mode, error level M, versions 1–10 (up to 213 bytes, ample for a link). */

/* PER VERSION AT LEVEL M: total codewords, error codewords per block, then [blocks, data codewords] per group. */
const QR_M_ = [null,
  [26, 10, [[1, 16]]], [44, 16, [[1, 28]]], [70, 26, [[1, 44]]], [100, 18, [[2, 32]]], [134, 24, [[2, 43]]],
  [172, 16, [[4, 27]]], [196, 18, [[4, 31]]], [242, 22, [[2, 38], [2, 39]]], [292, 22, [[3, 36], [2, 37]]], [346, 26, [[4, 43], [1, 44]]]];
const QR_ALIGN_ = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

/* GF(256) over 0x11D, the field Reed–Solomon codes in a QR code live in. */
const QR_EXP_ = new Array(512), QR_LOG_ = new Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { QR_EXP_[i] = x; QR_LOG_[x] = i; x <<= 1; if (x & 256) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) QR_EXP_[i] = QR_EXP_[i - 255]; })();
const qrMul_ = (a, b) => (a && b ? QR_EXP_[QR_LOG_[a] + QR_LOG_[b]] : 0);

function qrEcc_(data, n) {
  let gen = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(gen.length + 1).fill(0);
    gen.forEach((g, j) => { next[j] ^= g; next[j + 1] ^= qrMul_(g, QR_EXP_[i]); });
    gen = next;
  }
  const rem = new Array(n).fill(0);
  data.forEach(d => {
    const f = d ^ rem.shift(); rem.push(0);
    for (let j = 0; j < n; j++) rem[j] ^= qrMul_(gen[j + 1], f);
  });
  return rem;
}

/* A BCH remainder, for the format (15 bits) and version (18 bits) words. */
function qrBch_(v, poly, bits) {
  const top = Math.floor(Math.log2(poly));
  let r = v << top;
  for (let i = bits + top - 1; i >= top; i--) if ((r >> i) & 1) r ^= poly << (i - top);
  return (v << top) | r;
}

function qrCodewords_(bytes, ver) {
  const [total, ec, groups] = QR_M_[ver];
  const cap = total - ec * groups.reduce((s, g) => s + g[0], 0);
  const bits = [], put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let p = 0; data.length < cap; p++) data.push(p % 2 ? 0x11 : 0xEC);
  const blocks = []; let at = 0;
  groups.forEach(([n, k]) => { for (let i = 0; i < n; i++) { const d = data.slice(at, at + k); at += k; blocks.push({ d, e: qrEcc_(d, ec) }); } });
  const out = [], most = Math.max(...blocks.map(b => b.d.length));
  for (let i = 0; i < most; i++) blocks.forEach(b => { if (i < b.d.length) out.push(b.d[i]); });
  for (let i = 0; i < ec; i++) blocks.forEach(b => out.push(b.e[i]));
  return out;
}

const QR_MASKS_ = [(r, c) => (r + c) % 2 === 0, r => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0, (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0];

function qrBase_(ver) {
  const n = ver * 4 + 17, m = [], fixed = [];
  for (let i = 0; i < n; i++) { m.push(new Array(n).fill(0)); fixed.push(new Array(n).fill(false)); }
  const set = (r, c, v) => { if (r >= 0 && c >= 0 && r < n && c < n) { m[r][c] = v ? 1 : 0; fixed[r][c] = true; } };
  for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  [[0, 0], [0, n - 7], [n - 7, 0]].forEach(([r0, c0]) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      set(r0 + r, c0 + c, ring !== 2 && ring !== 4);
    }
  });
  const al = QR_ALIGN_[ver];
  al.forEach(r => al.forEach(c => {
    if ((r === 6 && c === 6) || (r === 6 && c === n - 7) || (r === n - 7 && c === 6)) return;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }));
  for (let i = 0; i < 9; i++) { if (!fixed[8][i]) set(8, i, 0); if (!fixed[i][8]) set(i, 8, 0); }
  for (let i = 0; i < 8; i++) { set(8, n - 1 - i, 0); set(n - 1 - i, 8, 0); }
  set(n - 8, 8, 1);
  if (ver >= 7) {
    const v = qrBch_(ver, 0x1F25, 6);
    for (let i = 0; i < 18; i++) { const b = (v >> i) & 1, a = Math.floor(i / 3), c = n - 11 + i % 3; set(a, c, b); set(c, a, b); }
  }
  return { n, m, fixed };
}

function qrFormat_(m, n, mask) {
  const v = qrBch_(mask, 0x537, 5) ^ 0x5412;
  const bit = i => (v >> i) & 1;
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  for (let i = 0; i < 8; i++) m[8][n - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[n - 15 + i][8] = bit(i);
  m[n - 8][8] = 1;
}

function qrPenalty_(m, n) {
  let p = 0;
  const line = get => { for (let i = 0; i < n; i++) { let run = 1;
    for (let j = 1; j <= n; j++) { if (j < n && get(i, j) === get(i, j - 1)) run++; else { if (run >= 5) p += run - 2; run = 1; } } } };
  line((i, j) => m[i][j]); line((i, j) => m[j][i]);
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) { const v = m[r][c]; if (v === m[r + 1][c] && v === m[r][c + 1] && v === m[r + 1][c + 1]) p += 3; }
  let dark = 0; m.forEach(row => row.forEach(v => { dark += v; }));
  return p + Math.floor(Math.abs(dark * 20 / (n * n) - 10)) * 10;
}

/* THE MATRIX: rows of 0/1, or null when the text will not fit in version 10. */
function qrMatrix_(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text || '')));
  let ver = 1;
  while (ver <= 10) { const [t, e, g] = QR_M_[ver]; if (t - e * g.reduce((s, x) => s + x[0], 0) >= bytes.length + (ver < 10 ? 2 : 3)) break; ver++; }
  if (ver > 10) return null;
  const words = qrCodewords_(bytes, ver);
  const { n, m, fixed } = qrBase_(ver);
  let k = 0, up = true;
  for (let c = n - 1; c > 0; c -= 2) {
    if (c === 6) c--;
    for (let i = 0; i < n; i++) {
      const r = up ? n - 1 - i : i;
      for (const cc of [c, c - 1]) if (!fixed[r][cc]) { m[r][cc] = k < words.length * 8 ? (words[k >> 3] >> (7 - (k & 7))) & 1 : 0; k++; }
    }
    up = !up;
  }
  let best = null, bestP = Infinity;
  QR_MASKS_.forEach((f, mask) => {
    const t = m.map((row, r) => row.map((v, c) => (!fixed[r][c] && f(r, c) ? v ^ 1 : v)));
    qrFormat_(t, n, mask);
    const p = qrPenalty_(t, n);
    if (p < bestP) { bestP = p; best = t; }
  });
  return best;
}

/* AN SVG, one path, with the four-module quiet zone the standard asks for; it prints sharp at any size. */
function qrSvg_(text, cls) {
  let m = null;
  try { m = qrMatrix_(text); } catch (e) { m = null; }
  if (!m) return '';
  const n = m.length, q = 4, d = [];
  m.forEach((row, r) => row.forEach((v, c) => { if (v) d.push(`M${c + q} ${r + q}h1v1h-1z`); }));
  return `<svg class="${cls || 'qr'}" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" class="qr-bg"/><path class="qr-ink" d="${d.join('')}"/></svg>`;
}
