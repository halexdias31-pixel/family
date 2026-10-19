/* tools/draw-answers.js — writes `draw_answer`, the expected drawing as geometry (find.js `drawMarker_`), from the
   mark scheme the library holds. Safe to re-run; `--dry` writes nothing. Units and kinds: docs/history/366. */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'questions.json');
const DRY = process.argv.includes('--dry');

/* ---------- helpers: a shape moved, turned, reflected or enlarged, and cells cut from a figure */
const mv = (P, dx, dy) => P.map(p => [p[0] + dx, p[1] + dy]);
const reflX = (P, x) => P.map(p => [2 * x - p[0], p[1]]);          // in the line x = x
const reflY = (P, y) => P.map(p => [p[0], 2 * y - p[1]]);          // in the line y = y
const rot180 = (P, c) => P.map(p => [2 * c[0] - p[0], 2 * c[1] - p[1]]);
const enl = (P, c, k) => P.map(p => [c[0] + k * (p[0] - c[0]), c[1] + k * (p[1] - c[1])]);
const r2 = v => Math.round(v * 1000) / 1000;
const at = (c, g, r) => [r2(c[0] + r * Math.sin(g * Math.PI / 180)), r2(c[1] - r * Math.cos(g * Math.PI / 180))];
const sector = (c, r, a, b) => { const o = [c]; for (let g = a; g <= b + 1e-9; g += (b - a) / 12) o.push(at(c, g, r)); return o; };
const rects = (x0, y0, w, h, nx, ny) => { const o = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) o.push([x0 + i * w, y0 + j * h, w, h]); return o; };
const ring = (c, r, n, g0) => Array.from({ length: n }, (_, i) => at(c, (g0 || 0) + i * 360 / n, r));
const edges = P => P.map((p, i) => [p[0], p[1], P[(i + 1) % P.length][0], P[(i + 1) % P.length][1]]);
const fn = (f, a, b, n) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [r2(x), r2(f(x))]; });
const poly = (P, o) => Object.assign({ k: 'segs', poly: P }, o || {});
const path_ = (P, o) => Object.assign({ k: 'segs', path: P }, o || {});
/* a box plot: the five values on a horizontal scale, its height free */
const boxplot = (v, y, h, o) => Object.assign({ k: 'segs', move: 'y', snap: false, at: [
  [v[0], y, v[1], y], [v[3], y, v[4], y], [v[1], y - h, v[3], y - h], [v[1], y + h, v[3], y + h],
  [v[1], y - h, v[1], y + h], [v[2], y - h, v[2], y + h], [v[3], y - h, v[3], y + h]] }, o || {});
/* a histogram or bar chart: each bar's top at its height, its sides down to the axis */
const bars = (B, o) => Object.assign({ k: 'segs', at: [].concat.apply([], B.map(b => [[b[0], b[2], b[1], b[2]], [b[0], 0, b[0], b[2]], [b[1], 0, b[1], b[2]]])) }, o || {});

/* ---------- CORBETTMATHS PRIMARY (and the 1st Class Maths sheets it carries), every drawn part */
const triLattice = (apex, side, rows) => {
  const h = side * Math.sqrt(3) / 2 / rows, w = side / rows, o = [];
  for (let k = 0; k < rows; k++) {
    const y0 = apex[1] + k * h, y1 = y0 + h, x0 = apex[0] - k * w / 2;
    for (let i = 0; i <= k; i++) o.push([[x0 + i * w, y0], [x0 + i * w - w / 2, y1], [x0 + i * w + w / 2, y1]].map(p => p.map(r2)));
    for (let i = 0; i < k; i++) o.push([[x0 + i * w, y0], [x0 + (i + 1) * w, y0], [x0 + i * w + w / 2, y1]].map(p => p.map(r2)));
  }
  return o;
};
const diamond = (c, r) => [[c[0], c[1] - r], [c[0] + r, c[1]], [c[0], c[1] + r], [c[0] - r, c[1]]];
const PENT = [[170, 12], [257, 75.2], [223.8, 177.5], [116.2, 177.5], [83, 75.2]];
const mid = (a, b) => [r2((a[0] + b[0]) / 2), r2((a[1] + b[1]) / 2)];
const OCT = [[121, 27.7], [219, 27.7], [288.3, 97], [288.3, 195], [219, 264.3], [121, 264.3], [51.7, 195], [51.7, 97]];
const ch = (a, b) => ({ k: 'segs', at: [[OCT[a][0], OCT[a][1], OCT[b][0], OCT[b][1]]] });
const blank = { frame: 'vb' };
const regular = (c, r, n) => ring(c, r, n, 360 / n / 2);
const HEX = (() => { const o = []; [[48.5, 99.5], [48.5, 146.3], [48.5, 193.1], [48.5, 239.8], [89, 76.1], [89, 122.9], [89, 169.7], [89, 216.4], [89, 263.2], [129.5, 52.8], [129.5, 99.5], [129.5, 146.3], [129.5, 193.1], [129.5, 239.8], [129.5, 286.6], [170, 29.4], [170, 76.1], [170, 122.9], [170, 169.7], [170, 216.4], [170, 263.2]].forEach(c => o.push(ring(c, 27, 6, 90).map(p => p.map(r2)))); return o; })();

const CBM = {
  /* 2D shapes, symmetry and triangles drawn anywhere: the shape's own properties, read off its corners */
  'Q-CBM-2d-shapes-2b': Object.assign({ items: [{ k: 'polygon', n: 8 }], eg: [regular([170, 170], 120, 8).concat([at([170, 170], 22.5, 120)])] }, blank),
  'Q-CBM-2d-shapes-2c': Object.assign({ items: [{ k: 'polygon', n: 4, is: 'kite' }], eg: [[[170, 40], [240, 120], [170, 300], [100, 120], [170, 40]]] }, blank),
  'Q-CBM-line-symmetry-9': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'scalene' }], eg: [[[50, 280], [300, 280], [110, 90], [50, 280]]] }, blank),
  'Q-CBM-types-of-angle-8': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'acute' }], eg: [[[60, 280], [280, 280], [170, 90], [60, 280]]] }, blank),
  'Q-CBM-types-of-angle-8b': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'notacute' }], eg: [[[60, 280], [280, 280], [60, 80], [60, 280]]] }, blank),
  'Q-CBM-types-of-triangle-2': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'right' }], eg: [[[60, 280], [280, 280], [60, 80], [60, 280]]] }, blank),
  'Q-CBM-types-of-triangle-3': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'scalene' }], eg: [[[50, 280], [300, 280], [110, 90], [50, 280]]] }, blank),
  'Q-CBM-angles-measuring-drawing-5': Object.assign({ items: [{ k: 'angle', deg: 40 }], eg: [[[300, 280], [60, 280], at([60, 280], 50, 230)]] }, blank),
  'Q-CBM-angles-measuring-drawing-6': Object.assign({ items: [{ k: 'angle', deg: 80 }], eg: [[[300, 280], [60, 280], at([60, 280], 10, 230)]] }, blank),
  'Q-CBM-angles-measuring-drawing-7': Object.assign({ items: [{ k: 'angle', deg: 110 }], eg: [[[300, 280], [150, 280], at([150, 280], -20, 200)]] }, blank),
  'Q-CBM-angles-measuring-drawing-8': Object.assign({ items: [{ k: 'angle', deg: 160 }], eg: [[[320, 280], [170, 280], at([170, 280], -70, 150)]] }, blank),
  /* the full-size triangle: on a screen, the shape -- two sides in the right ratio at the right angle */
  'Q-CBM-angles-measuring-drawing-14': Object.assign({ loose: true, items: [{ k: 'polygon', n: 3, sas: [6, 5, 30], sim: true }],
    eg: [[[40, 300], [280, 300], at([280, 300], 270 + 30, 200), [40, 300]]] }, blank),
  'Q-CBM-angles-measuring-drawing-15': Object.assign({ loose: true, items: [{ k: 'polygon', n: 3, sas: [6.1, 7, 105], sim: true }],
    eg: [[[80, 330], [280, 330], at([80, 330], 90 - 105, 229.5), [80, 330]]] }, blank),
  'Q-CBM-metric-units-3': { tol: 0.2, items: [{ k: 'dir', len: 5, ltol: 0.2, min: 2 }], eg: [[[3, 8], [8, 8]]] },
  'Q-CBM-parallel-lines-perpendicular-lines-1': Object.assign({ items: [{ k: 'pair', rel: 'par' }], eg: [[[60, 120], [280, 100]], [[60, 220], [280, 200]]] }, blank),
  'Q-CBM-parallel-lines-perpendicular-lines-2': Object.assign({ items: [{ k: 'dir', to: [100, 85, 240, 85], rel: 'perp', meet: true }] }, blank),
  'Q-CBM-parallel-lines-perpendicular-lines-3': Object.assign({ items: [{ k: 'dir', to: [84, 118, 268, 70], rel: 'perp', meet: true }] }, blank),
  'Q-CBM-parallel-lines-perpendicular-lines-8': Object.assign({ items: [{ k: 'any', of: [ch(7, 1), ch(5, 3)] }] }, blank),
  'Q-CBM-parallel-lines-perpendicular-lines-9': Object.assign({ items: [{ k: 'any', of: [ch(0, 4), ch(1, 3), ch(5, 7)] }] }, blank),
  'Q-CBM-parts-of-the-circle-1': Object.assign({ items: [{ k: 'radius', c: [170, 85], r: 72 }] }, blank),
  'Q-CBM-parts-of-the-circle-2': Object.assign({ items: [{ k: 'radius', c: [170, 85], r: 72, dia: true }] }, blank),
  /* plotted points and shapes on coordinate grids: the axes' own numbers */
  'Q-CBM-coordinates-1': { loose: true, items: [{ k: 'pts', at: [[5, 3], [0, 2]] }] },
  'Q-CBM-coordinates-4': { loose: true, items: [{ k: 'pts', at: [[2, -3], [-4, 1]] }] },
  'Q-CBM-coordinates-8': { items: [poly([[1, -2], [3, -2], [3, 1], [-1, 1]])] },
  'Q-CBM-coordinates-9': { items: [{ k: 'segs', at: [[2, 1, 4, 2], [4, 2, 3, 4], [3, 4, 1, 3]], also: [[1, 3, 2, 1]] }] },
  'Q-CBM-quadrilaterals-7': { items: [{ k: 'segs', at: [[-2, 3, -2, -1], [-2, -1, 3, -2]], also: [[-2, 3, 3, 2], [3, 2, 3, -2]] }] },
  'Q-CBM-quadrilaterals-3': Object.assign({ sq: 38, items: [{ k: 'segs', at: [[170, 60, 208, 98], [208, 98, 170, 174]], also: [[170, 60, 132, 98], [132, 98, 170, 174]] }] }, blank),
  /* lines of symmetry: each one drawn across the shape, and no line that is not one */
  'Q-CBM-line-symmetry-1': Object.assign({ items: [{ k: 'line', thru: [[170, 12], [170, 174]] }] }, blank),
  'Q-CBM-line-symmetry-2': Object.assign({ items: [{ k: 'line', thru: [[170, 12], [170, 93.6]] }, { k: 'line', thru: [[76.4, 52.8], [263.6, 52.8]] }] }, blank),
  'Q-CBM-line-symmetry-3': Object.assign({ items: [{ k: 'line', thru: [[170, 12], [170, 168]] }, { k: 'line', thru: [[123.2, 90], [216.8, 90]] }] }, blank),
  'Q-CBM-line-symmetry-8': Object.assign({ items: [{ k: 'line', thru: [[254, 8], [86, 176]] }] }, blank),
  'Q-CBM-line-symmetry-12': Object.assign({ items: PENT.map((v, i) => ({ k: 'line', thru: [v, mid(PENT[(i + 2) % 5], PENT[(i + 3) % 5])] })) }, blank),
  'Q-CBM-quadrilaterals-2b': Object.assign({ items: [{ k: 'line', thru: [[170, 14], [170, 126]] }, { k: 'line', thru: [[72, 70], [268, 70]] }] }, blank),
  'Q-CBM-nets-3c': Object.assign({ items: [{ k: 'line', thru: [[74, 84], [266, 84]] }] }, blank),
  'Q-CBM-line-symmetry-7': { items: [{ k: 'segs', at: [[3, 4, 5, 4], [5, 4, 5, 3], [5, 3, 4, 3], [4, 3, 4, 1], [4, 1, 3, 1]], also: [[3, 5, 3, 0]] }] },
  /* shading: which cells are shaded, by the ink inside each */
  'Q-CBM-fractions-decimals-and-percentages-1': Object.assign({ items: [{ k: 'cells', need: 2, cells: [sector([100, 100], 88, 0, 120), sector([100, 100], 88, 120, 240), sector([100, 100], 88, 240, 360)] }] }, blank),
  'Q-CBM-fractions-decimals-and-percentages-3': Object.assign({ items: [{ k: 'cells', need: 6, rects: rects(4, 4, 48, 48, 4, 3) }] }, blank),
  'Q-CBM-fractions-decimals-and-percentages-6': Object.assign({ items: [{ k: 'cells', need: 5, rects: rects(4, 4, 48, 48, 3, 3) }] }, blank),
  'Q-CBM-fractions-decimals-and-percentages-14': Object.assign({ items: [{ k: 'cells', need: 12, shade: 1, cells: triLattice([116, 4], 224, 4) }] }, blank),
  'Q-CBM-line-symmetry-10': Object.assign({ items: [{ k: 'cells', set: [[0], [3]], cells: [[114, 36], [170, 36], [114, 92], [170, 148], [142, 64], [198, 64], [142, 120], [198, 120]].map(c => diamond(c, 28)) }] }, blank),
  'Q-CBM-perimeter-19': Object.assign({ items: [{ k: 'cells', need: 4, touch: 4, given: [0, 4, 5], cells: HEX }] }, blank),
  /* the missing shapes on the turned cube: the back-right half of the top, the front half of the right face */
  'Q-CBM-nets-7': Object.assign({ items: [{ k: 'cells', set: [[0, 2]], shade: 0.9, cells: [
    [[215, 21], [319, 21], [300, 58]], [[215, 21], [300, 58], [196, 58]],
    [[300, 58], [309.5, 39.5], [309.5, 143.5], [300, 162]], [[309.5, 39.5], [319, 21], [319, 125], [309.5, 143.5]]] }] }, blank),
  /* scales, dials and clocks: the value the pointer or arrow shows */
  'Q-CBM-metric-units-1': Object.assign({ items: [{ k: 'dial', c: [256, 84], r: 72, a: [0, 360], v: [0, 1000], want: 450, vtol: 10, out: true }] }, blank),
  'Q-CBM-metric-units-4': Object.assign({ items: [{ k: 'dial', c: [170, 232], r: 182, a: [336, 24], v: [20, 60], want: 32, vtol: 1, out: true }] }, blank),
  'Q-CBM-metric-units-11': Object.assign({ items: [{ k: 'dial', c: [256, 84], r: 72, a: [0, 360], v: [0, 1000], want: 650, vtol: 10 }] }, blank),
  'Q-CBM-roman-numerals-3': Object.assign({ items: [{ k: 'clock', c: [170, 138], r: 114, h: 7, min: 15 }] }, blank),
  'Q-CBM-time-1': Object.assign({ items: [{ k: 'clock', c: [170, 108], r: 84.5, h: 5, min: 40 }] }, blank),
  'Q-CBM-pie-charts-7': Object.assign({ loose: true, items: [{ k: 'pie', c: [170, 120], r: 112, given: [0], sect: [60, 80, 220] }] }, blank),
  'Q-CBM-pie-charts-8': Object.assign({ loose: true, items: [{ k: 'pie', c: [170, 120], r: 112, given: [0], sect: [110, 70, 40, 140] }] }, blank),
  /* quadrilaterals by their properties */
  'Q-CBM-quadrilaterals-4c': Object.assign({ items: [{ k: 'polygon', n: 4, is: 'twosym' }], eg: [[[60, 20], [280, 20], [280, 140], [60, 140], [60, 20]]] }, blank),
  'Q-CBM-quadrilaterals-5c': Object.assign({ loose: true, items: [{ k: 'polygon', n: 4, is: 'square' }], eg: [[[100, 20], [220, 20], [220, 140], [100, 140], [100, 20]]] }, blank),
  'Q-CBM-quadrilaterals-6': Object.assign({ sq: 30, items: [{ k: 'polygon', n: 4, is: 'perpdiag', on: { lat: [35, 22, 30, 0, 0, 30] } }], eg: [[[185, 142], [215, 172], [185, 262], [155, 172], [185, 142]]] }, blank),
  'Q-CBM-quadrilaterals-8': { items: [{ k: 'polygon', n: 4, is: 'notperpdiag', count: 2 }], eg: [[[1, 1], [5, 1], [5, 3], [1, 3], [1, 1]], [[8, 8], [12, 8], [13, 11], [9, 11], [8, 8]]] },
  'Q-CBM-types-of-triangle-7': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'right', on: ring([85, 74.6], 64, 12) }], eg: [[at([85, 74.6], 0, 64), at([85, 74.6], 180, 64), at([85, 74.6], 60, 64), at([85, 74.6], 0, 64)]] }, blank),
  'Q-CBM-types-of-triangle-7b': Object.assign({ items: [{ k: 'polygon', n: 3, is: 'equilateral', on: ring([255, 74.6], 64, 12) }], eg: [[at([255, 74.6], 0, 64), at([255, 74.6], 120, 64), at([255, 74.6], 240, 64), at([255, 74.6], 0, 64)]] }, blank),
  'Q-CBM-types-of-triangle-8': Object.assign({ sq: 22.8, items: [{ k: 'polygon', n: 3, is: 'equilateral', on: { lat: [20.1, 9.9, 19.93, 11.43, 0, 22.83] } }], eg: [[[100, 101.2], [100, 147.1], [139.86, 124.1], [100, 101.2]]] }, blank),
  'Q-CBM-volume-of-a-cube-volume-of-a-cuboid-12': Object.assign({ sq: 19, items: [{ k: 'cuboid', vol: 32, on: { lat: [13.7, 12, 16.45, 9.5, 0, 19] } }],
    eg: (() => { const u = [16.45, 9.5], w = [-16.45, 9.5], d = [0, 19], go = (p, v, n) => [r2(p[0] + v[0] * n), r2(p[1] + v[1] * n)];
      const T = [178.2, 31], A = go(T, u, 4), B = go(A, d, 2), C = go(B, w, 4), D = go(C, u, -4), E = go(D, d, -2), P = go(T, w, 4);
      return [[T, A, B, C, D, E, T], [E, go(E, u, 4)], [go(E, u, 4), A], [go(E, u, 4), C]]; })() }, blank),
  /* reflections and translations: the image, corner for corner */
  'Q-CBM-reflections-1': { items: [poly(reflX([[1, 8], [3, 8], [3, 4], [1, 4]], 5))] },
  'Q-CBM-reflections-2': { items: [poly(reflX([[1, 7], [5, 7], [5, 5], [3, 5], [3, 2], [1, 2]], 5))] },
  'Q-CBM-reflections-3': { items: [{ k: 'segs', at: edges(reflY([[5, 8], [6, 6], [8, 8]], 5)).concat([[1, 2, 8, 2]]) }] },
  'Q-CBM-reflections-4': { items: [poly(reflY([[3, 4], [5, 4], [5, 2], [7, 2], [7, 4], [8, 4], [8, 1], [3, 1]], 5))] },
  'Q-CBM-reflections-5': { items: [poly(reflX([[0, 2], [2, 7], [4, 2]], 5))] },
  'Q-CBM-reflections-6': { items: [poly(reflX([[2, 9], [4, 9], [3, 1], [1, 7]], 5))] },
  'Q-CBM-reflections-7': { items: [poly(reflY([[1, 4], [1, 2], [4, 2]], 0))] },
  'Q-CBM-reflections-8': { items: [poly(reflX([[2, 1], [4, 1], [3, 4]], 0))] },
  'Q-1CM-translations-1': { items: [poly(mv([[6, 6], [6, 2], [8, 2]], -4, 3))] },
  'Q-1CM-translations-2': { items: [poly(mv([[4, 3], [5, 3], [5, 6], [4, 6]], 3, 1))] },
  'Q-1CM-translations-3': { items: [poly(mv([[4, 7], [6, 7], [6, 3]], -2, -3))] },
  'Q-1CM-translations-4': { items: [poly(mv([[1, 6], [4, 6], [4, 3], [2, 2]], 4, 3))] },
  'Q-1CM-translations-5': { items: [poly(mv([[1, 1], [2, 1], [2, 2], [1, 2]], -4, 1))] },
  'Q-1CM-translations-6': { items: [poly(mv([[-3, 0], [-1, 0], [-1, 2]], 1, -4))] },
  'Q-1CM-translations-7': { items: [poly(mv([[-4, -1], [-1, -1], [-1, -2], [-2, -2], [-2, -4], [-3, -4], [-3, -2], [-4, -2]], -1, 5))] },
};

/* ---------- A DRAWN ANSWER BETTER TYPED: the field changes that make it a box (366) */
const FIELDS = {
  /* a length on a screen needs a scale: the made-up space becomes a 1 cm grid, and says so */
  'Q-CBM-metric-units-3': { surface: 'grid', html_add: '<p>Each square of the grid is 1 cm.</p>' },
  /* six numbers on a net: typed as the three opposite pairs, each pair multiplying to 100 */
  'Q-CBM-nets-8': { typed: true, answer_type: 'short', accept: '1, 100, 2, 50, 4, 25 | rule: count 6, distinct, pairs prod 100',
    html_add: '<p>Type the six numbers as three pairs of opposite faces, each pair together: above and below the row, then the 1st and 3rd of the row, then the 2nd and 4th.</p>' },
};

const GCSE = {};

module.exports = { CBM, GCSE, FIELDS };
if (require.main === module) {
  const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const SPEC = Object.assign({}, CBM, GCSE);
  let n = 0, t = 0;
  rows.forEach(r => {
    if (SPEC[r.row_id]) {
      const s = SPEC[r.row_id];
      if (!r.marks && s.marks == null) s.marks = 1;
      const v = JSON.stringify(s);
      if (r.draw_answer !== v) r.draw_answer = v;
      n++;
    }
    const T = FIELDS[r.row_id];
    if (T) {
      Object.keys(T).forEach(k => { if (k !== 'html_add' && k !== 'typed') r[k] = T[k]; });
      if (T.html_add && String(r.html || '').indexOf(T.html_add) === -1) r.html = String(r.html || '') + T.html_add;
      if (T.typed) { delete r.draw_answer; t++; }
    }
  });
  if (DRY) console.log(JSON.stringify(SPEC, null, 1).slice(0, 4000));
  else fs.writeFileSync(FILE, '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
  console.log('draw_answer on ' + n + ' rows; ' + t + ' drawn answers made typed');
}
