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
const VENN = '<p>Type the numbers that go in each part of the diagram.</p>';
const TREE = '<p>Type the probability that goes on each empty branch.</p>';
const FIELDS = {
  /* GCSE: what the scheme marks is a value written in a diagram -- a Venn diagram's regions, a tree's branches -- so each is a box (366) */
  'Q-1MA1-2306-1H-5a': { typed: true, answer_type: 'short', cells: 'A only=3, 5, 7; A and B=1, 9; B only=4; Outside=2, 6, 8, 10', html_add: VENN },
  'Q-1MA1-2006-2H-2a': { typed: true, answer_type: 'short', cells: 'A only=4, 6, 8; A and B=2, 10; B only=1, 5; Outside=3, 7, 9', html_add: VENN },
  'Q-1MA1-1906-3H-1a': { typed: true, answer_type: 'short', cells: 'A only=1, 5, 8; A and B=6, 9; B only=2; Outside=3, 4, 7', html_add: VENN },
  'Q-1MA1-1706-3H-1a': { typed: true, answer_type: 'short', cells: 'A only=3, 9, 21, 27; A and B=15; B only=5, 25; Outside=1, 7, 11, 13, 17, 19, 23, 29', html_add: '<p>Call the left circle A and the right circle B, and type the numbers that go in each part of the diagram.</p>' },
  'Q-1MA1-1811-2H-1a': { typed: true, answer_type: 'short', cells: 'A only=2, 10, 14; B only=6; C only=18, 22; A and B only=-; A and C only=-; B and C only=20; A, B and C=8; Outside=4, 12, 16, 24', html_add: VENN + '<p>Leave a part empty if no number goes in it.</p>' },
  'Q-1MA1-2406-3F-27a': { typed: true, answer_type: 'short', cells: 'A not heads=0.4|2/5|40%; H, not H=0.45|9/20|45%; Not H, H=0.55|11/20|55%; Not H, not H=0.45|9/20|45%', html_add: TREE },
  'Q-1MA1-2406-3H-6a': { typed: true, answer_type: 'short', cells: 'A not heads=0.4|2/5|40%; H, not H=0.45|9/20|45%; Not H, H=0.55|11/20|55%; Not H, not H=0.45|9/20|45%', html_add: TREE },
  'Q-1MA1-2006-3H-5a': { typed: true, answer_type: 'short', cells: 'A on 2=1/3; A not 2=2/3; On 2, on 2=1/3; On 2, not=2/3; Not, on 2=1/3; Not, not=2/3', html_add: TREE },
  'Q-1MA1-1906-2H-10a': { typed: true, answer_type: 'short', cells: 'Thu not late=0.85|17/20|85%; Late, late=0.15|3/20|15%; Late, not=0.85|17/20|85%; Not, late=0.15|3/20|15%; Not, not=0.85|17/20|85%', html_add: TREE },
  'Q-1MA1-1806-2H-15a': { typed: true, answer_type: 'short', cells: 'Sat not win=0.55|11/20|55%; Win, win=0.67; Win, not=0.33; Not, win=0.35; Not, not=0.65', html_add: TREE },
  /* a choice of five places for one pair of brackets */
  'Q-1MA1-2406-1F-11c': { typed: true, answer_type: 'short', surface: '', choices: '(30 &divide; 3) + 2 &minus; 4 | 30 &divide; (3 + 2) &minus; 4 | 30 &divide; 3 + (2 &minus; 4) | (30 &divide; 3 + 2) &minus; 4 | 30 &divide; (3 + 2 &minus; 4)', choice_right: '2' },
  /* a labelled sketch whose marks are for its numbers: the numbers typed */
  'Q-1MA1-1911-1H-21': { typed: true, answer_type: 'short', surface: '', cells: 'Turning pt=(2, \u221213)|2, \u221213; y-intercept=(0, \u22125)|0, \u22125|\u22125; x-intercepts=(4 + \u221a26)/2, (4 \u2212 \u221a26)/2 | 2 + \u221a26/2, 2 \u2212 \u221a26/2 | 2 \u00b1 \u221a26/2 | (4 \u00b1 \u221a26)/2',
    html_add: '<p>Type the coordinates your sketch would show: the turning point, where the curve crosses the y-axis, and where it crosses the x-axis (exactly).</p>' },
  'Q-1MA1-1706-3H-20b': { typed: true, answer_type: 'short', surface: '', cells: 'Centre=(3, 0)|3, 0; Crosses x at=(\u22121, 0), (7, 0)|\u22121, 7', html_add: '<p>Type the coordinates your sketch would be labelled with: the centre of circle B and where it crosses the x-axis.</p>' },
  'Q-1MA1-1905-1H-4': { typed: true, answer_type: 'short', cells: 'Solid=cylinder|a cylinder; Diameter cm=4|4 cm; Height cm=5|5 cm', html_add: '<p>Name the solid, and give its dimensions.</p>' },
  /* a length on a screen needs a scale: the made-up space becomes a 1 cm grid, and says so */
  'Q-CBM-metric-units-3': { surface: 'grid', html_add: '<p>Each square of the grid is 1 cm.</p>' },
  /* six numbers on a net: typed as the three opposite pairs, each pair multiplying to 100 */
  'Q-CBM-nets-8': { typed: true, answer_type: 'short', accept: '1, 100, 2, 50, 4, 25 | rule: count 6, distinct, pairs prod 100',
    html_add: '<p>Type the six numbers as three pairs of opposite faces, each pair together: above and below the row, then the 1st and 3rd of the row, then the 2nd and 4th.</p>' },
};

/* ---------- GCSE MATHS PAST PAPERS, Foundation and Higher: every drawn part, by its mark scheme's points */
/* a region as a polygon: a convex shape clipped by half-planes `a x + b y <= c` (Sutherland-Hodgman) */
const clip = (P, a, b, c) => {
  const out = [], f = p => a * p[0] + b * p[1] - c;
  P.forEach((p, i) => {
    const q = P[(i + 1) % P.length], fp = f(p), fq = f(q);
    if (fp <= 1e-9) out.push(p);
    if ((fp < -1e-9 && fq > 1e-9) || (fp > 1e-9 && fq < -1e-9)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
  });
  return out.map(p => p.map(r2));
};
const disc = (c, r, n) => ring(c, r, n || 48);
const clipBy = (P, Q) => Q.reduce((acc, q, i) => {          // P clipped by the convex polygon Q, counter-clockwise in y-down
  const n = Q[(i + 1) % Q.length], a = n[1] - q[1], b = q[0] - n[0];
  return clip(acc, -a, -b, -(a * q[0] + b * q[1]));
}, P);
const sq_ = (x0, y0, w, h) => [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
/* a graph drawn: the curve as a path, B1 for the points of its table plotted */
const graph = (f, a, b, m, o) => ({ k: 'segs', path: fn(f, a, b, 24), m: m, tol: 0.4, or: Object.assign({ k: 'pts', onink: true, at: fn(f, a, b, Math.round(b - a)), need: Math.max(2, Math.round(b - a)), m: m - 1 }, o || {}) });
const cf = (P, m) => [{ k: 'pts', onink: true, at: P.slice(1), need: P.length - 2, m: 1 }, { k: 'segs', path: P, tol: 0.6, cover: 0.8, m: m - 1 }];
const fpoly = P => [{ k: 'pts', onink: true, at: P, m: 1 }, { k: 'segs', path: P, m: 1 }];
const box3 = v => ({ k: 'box', v: v, m: 3, or: { k: 'box', v: v, need: 4, m: 2, or: { k: 'box', v: v, need: 2, m: 1 } } });
const sinp = (f, a, b) => fn(x => f(x), a, b, 36);
const S2 = Math.sin, D = Math.PI / 180;
const TRI17 = [[101.5, 22], [313.5, 173.1], [24, 173.1]];
const R17 = clipBy(clip(TRI17, 1, 0, 168.75), disc([101.5, 22], 120).slice().reverse());
const ARC17 = (() => { const o = []; for (let g = 90; g <= 270; g += 5) { const p = at([101.5, 22], g, 120); if (p[1] <= 173.1 && p[0] <= 101.5 + (p[1] - 22) * (313.5 - 101.5) / 151.1 && p[0] >= 101.5 - (p[1] - 22) * (101.5 - 24) / 151.1) o.push(p); } return o; })();
const GCSE = {
  /* histograms and bar charts: bar for bar; with no numbers on an axis, the bars' own proportions */
  'Q-1MA1-2406-1H-13a': { items: [{ k: 'hist', x: [0, 10, 30, 35, 50, 60], h: [2, 3.5, 4.4, 2, 0.8], fx: true, fy: true, m: 3, or: { k: 'hist', x: [0, 10, 30, 35, 50, 60], h: [2, 3.5, 4.4, 2, 0.8], fx: true, fy: true, need: 3, m: 2, or: { k: 'hist', x: [0, 10, 30, 35, 50, 60], h: [2, 3.5, 4.4, 2, 0.8], fx: true, fy: true, need: 2, m: 1 } } }] },
  'Q-1MA1-2306-2H-16a': { frame: { o: [73.233, 169.9], u: [3.8778, -38.79] }, items: [{ k: 'hist', x: [40, 60], h: [1.2], m: 2 }] },
  'Q-1MA1-1911-2H-18': { items: [{ k: 'hist', x: [10, 12.5], h: [3.2], m: 3 }] },
  'Q-1MA1-1811-3H-17a': { items: [{ k: 'hist', x: [0, 20, 50, 80, 150, 200], h: [6, 3, 4, 2, 2], fy: true, m: 3, or: { k: 'hist', x: [0, 20, 50, 80, 150, 200], h: [6, 3, 4, 2, 2], fy: true, need: 3, m: 2, or: { k: 'hist', x: [0, 20, 50, 80, 150, 200], h: [6, 3, 4, 2, 2], fy: true, need: 2, m: 1 } } }] },
  'Q-1MA1-1711-2H-17a': { items: [{ k: 'hist', x: [140, 150, 155, 160, 165, 180], h: [1.5, 6, 10.2, 7.2, 1.2], fx: true, fy: true, m: 3, or: { k: 'hist', x: [140, 150, 155, 160, 165, 180], h: [1.5, 6, 10.2, 7.2, 1.2], fx: true, fy: true, need: 3, m: 2, or: { k: 'hist', x: [140, 150, 155, 160, 165, 180], h: [1.5, 6, 10.2, 7.2, 1.2], fx: true, fy: true, need: 2, m: 1 } } }] },
  'Q-1MA1-2211-1H-14': { items: [{ k: 'hist', x: [50, 70, 80, 90, 110], h: [1, 5, 6, 1.5], fy: true, m: 3, or: { k: 'hist', x: [50, 70, 80, 90, 110], h: [1, 5, 6, 1.5], fy: true, need: 3, m: 2, or: { k: 'hist', x: [50, 70, 80, 90, 110], h: [1, 5, 6, 1.5], fy: true, need: 2, m: 1 } } }] },
  /* a dual bar chart, Lena and Pavel side by side each day, or each person's four days together */
  'Q-1MA1-2406-1F-7': { loose: true, items: [{ k: 'hist', seq: [[6, 7, 9, 6, 8, 5, 6, 6], [7, 6, 6, 9, 5, 8, 6, 6], [6, 9, 8, 6, 7, 6, 5, 6], [7, 6, 5, 6, 6, 9, 8, 6]], fy: true, m: 4,
    or: { k: 'any', m: 1, of: [{ k: 'hist', seq: [[6, 9, 8, 6]], fy: true }, { k: 'hist', seq: [[7, 6, 5, 6]], fy: true }] } }] },
  'Q-1MA1-2406-2F-6b': Object.assign({ items: [{ k: 'area', in: [[97.3, 139], [300.1, 182.7]], want: 2.75 * 27.8 * 27.8, rtol: 0.1 }],
    eg: [sq_(103.9, 147, 27.8, 27.8).concat([[103.9, 147]]), sq_(146.1, 147, 27.8, 27.8).concat([[146.1, 147]]), sq_(188.2, 147, 20.85, 27.8).concat([[188.2, 147]])] }, blank),
  /* frequency polygons: each point at its class's middle, joined with straight lines */
  'Q-1MA1-2306-1H-4': { items: fpoly([[2.5, 8], [7.5, 24], [12.5, 13], [17.5, 11], [22.5, 4]]) },
  'Q-1MA1-1906-3H-3b': { frame: { o: [40.9, 178], u: [4.0318, -8.064] }, items: fpoly([[15, 7], [25, 13], [35, 14], [45, 12], [55, 16], [65, 18]]) },
  'Q-1MA1-1811-3H-7': { items: fpoly([[5, 14], [15, 18], [25, 26], [35, 12]]) },
  'Q-1MA1-1711-3H-1b': { items: fpoly([[135, 4], [145, 11], [155, 24], [165, 22], [175, 19]]) },
  /* cumulative frequency: each point at its class's upper end, joined by a curve or lines */
  'Q-1MA1-2406-2H-11b': { items: cf([[0, 0], [2, 7], [4, 28], [6, 43], [8, 54], [10, 60]], 2) },
  'Q-1MA1-2306-2H-9a': { items: cf([[20, 0], [30, 20], [40, 48], [50, 64], [60, 75], [70, 80]], 2) },
  'Q-1MA1-2005-1H-12b': { items: cf([[200, 0], [250, 5], [300, 15], [350, 35], [400, 55], [450, 70], [500, 80]], 2) },
  'Q-1MA1-1906-2H-11b': { frame: { o: [63.3, 185.1], u: [1.8538, -1.8677] }, items: cf([[0, 0], [20, 5], [40, 35], [60, 55], [80, 70], [100, 78], [120, 80]], 2) },
  'Q-1MA1-1911-1H-10a': { frame: { o: [72.1, 212.4], u: [2.1088, -4.22] }, items: cf([[20, 0], [40, 5], [60, 25], [80, 35], [100, 38], [120, 40]], 2) },
  /* box plots: the five values, at any height */
  'Q-1MA1-2406-3H-11a': { items: [box3([25, 35, 40, 47, 62])] },
  'Q-1MA1-2306-3H-11a': { items: [box3([169, 174, 177, 180, 186])] },
  'Q-1MA1-1911-3H-12': { items: [box3([173, 188, 197, 209, 219])] },
  'Q-1MA1-1805-1H-10a': { items: [box3([133, 145, 151, 157, 170])] },
  'Q-1MA1-1811-1H-9a': { items: [box3([0, 4, 10, 20, 42])] },
  'Q-1MA1-1706-3H-9b': { items: [{ k: 'box', v: [60, 180, 300, 350, 650], m: 2, or: { k: 'box', v: [60, 180, 300, 350, 650], need: 3, m: 1 } }] },
  'Q-1MA1-1711-1H-12a': { items: [box3([154, 161, 165, 168, 174])] },
  'Q-1MA1-2211-2H-11': { frame: { o: [40, 72], u: [2.75, -2.75] }, tol: 0.5, items: [box3([24, 42, 54, 64, 96])] },
  /* graphs drawn from a table: the curve, or B1 for its points */
  'Q-1MA1-2406-2H-5b': { items: [graph(x => x * x - x, -2, 3, 2)] },
  'Q-1MA1-2406-2F-24b': { items: [graph(x => x * x - x, -2, 3, 2)] },
  'Q-1MA1-2006-2H-4b': { items: [graph(x => 5 - x * x * x, -2, 2, 2)] },
  'Q-1MA1-1806-2H-5b': { items: [graph(x => x * x - x - 6, -3, 3, 2)] },
  'Q-1MA1-1811-3H-3b': { items: [graph(x => x * x + x - 4, -3, 3, 2)] },
  'Q-1MA1-2211-1H-9b': { items: [graph(x => 6 * x - x * x * x, -3, 3, 2)] },
  'Q-1MA1-2406-3F-19': { items: [{ k: 'segs', path: [[-2, -8], [3, 7]], m: 3, or: { k: 'pts', onink: true, at: fn(x => 3 * x - 2, -2, 3, 5), need: 3, m: 2, or: { k: 'pts', onink: true, at: fn(x => 3 * x - 2, -2, 3, 5), need: 2, m: 1 } } }] },
  'Q-1MA1-1906-2H-2': { items: [{ k: 'segs', path: [[-2, -7], [4, 5]], m: 3, or: { k: 'pts', onink: true, at: fn(x => 2 * x - 3, -2, 4, 6), need: 3, m: 2, or: { k: 'pts', onink: true, at: fn(x => 2 * x - 3, -2, 4, 6), need: 2, m: 1 } } }] },
  'Q-1MA1-1806-2H-16a': { items: [{ k: 'segs', path: ring([0, 0], 3.5, 36).concat([at([0, 0], 0, 3.5)]), m: 2, tol: 0.4, or: { k: 'pts', onink: true, at: [[3.5, 0], [-3.5, 0], [0, 3.5], [0, -3.5]], m: 1 } }] },
  /* transformations of graphs: the new curve, or the scheme's B1 for half the move */
  'Q-1MA1-2406-2H-21': { items: [{ k: 'segs', path: fn(x => 0.75 * (x + 1) * (x + 1), -3, 1, 16), tol: 0.4, m: 2, or: { k: 'any', m: 1, of: [{ k: 'segs', path: fn(x => 0.75 * (x + 1) * (x + 1) - 2, -3, 1, 16), tol: 0.4 }, { k: 'segs', path: fn(x => 0.75 * (x - 1) * (x - 1), -1, 3, 16), tol: 0.4 }] } }] },
  'Q-1MA1-2306-2H-21a': { items: [path_([[-3, -4], [-2, -3], [-1, -3], [0, -4]])] },
  'Q-1MA1-2306-2H-21b': { items: [path_([[0, 0], [1, 1], [2, 1], [3, 0]])] },
  'Q-1MA1-1911-1H-20a': { items: [Object.assign(path_(mv([[-4, 3], [-3, 3], [-2, 1], [1, 4], [3, 4]], -1, -3)), { m: 2, or: { k: 'any', m: 1, of: [path_(mv([[-4, 3], [-3, 3], [-2, 1], [1, 4], [3, 4]], -1, 0)), path_(mv([[-4, 3], [-3, 3], [-2, 1], [1, 4], [3, 4]], 0, -3))] } })] },
  'Q-1MA1-1811-1H-18a': { frame: { o: [138.93, 118.75], u: [28.344, -28.35] }, items: [{ k: 'segs', path: fn(x => (x - 3) * (x - 3) - 1, 1, 5, 16), tol: 0.4 }] },
  'Q-1MA1-2006-2H-21a': { frame: { o: [160.1, 148.1], u: [36.1, -36.1] }, items: [{ k: 'pts', onink: true, at: [[0, 0], [1, 2], [3, 0]], m: 1 }, { k: 'segs', path: [[0, 0], [0.5, 1.5], [1, 2], [2, 1.2], [3, 0], [3.5, 0.6], [4, 2]], tol: 0.7, cover: 0.75, m: 1 }] },
  'Q-1MA1-1805-1H-18': { items: [{ k: 'segs', path: sinp(x => S2(x * D) - 2, -180, 180), tol: 0.5, m: 2, or: { k: 'segs', path: sinp(x => S2(x * D), -180, 180), move: 'y', snap: false, tol: 0.5, m: 1 } }] },
  /* sketches: the curve's shape and the points the scheme names */
  'Q-1MA1-2406-1H-22a': { frame: { o: [18.2, 87.7], u: [0.8111, -1] }, items: [{ k: 'pts', onink: true, at: [[0, 0], [180, 0], [360, 0]], tol: 0.4, m: 1 }, { k: 'segs', path: sinp(x => 50 * S2(x * D), 0, 360), fity: true, tol: 0.6, cover: 0.8, m: 1 }] },
  'Q-1MA1-1811-3H-11': { frame: { o: [40, 160], u: [0.66, -1] }, items: [{ k: 'pts', onink: true, at: [[0, 0], [180, 0], [360, 0]], tol: 0.4, m: 1 }, { k: 'sketch', test: ['asym'], asym: [90, 270], m: 1 }],
    eg: [fn(x => 30 * Math.tan(x * D), 0, 78, 13), fn(x => 30 * Math.tan(x * D), 102, 258, 26), fn(x => 30 * Math.tan(x * D), 282, 360, 13)] },
  'Q-1MA1-1811-2H-14': { frame: { o: [150, 150], u: [20, -20] }, items: [{ k: 'sketch', test: ['inc', 'above', 'crossy', 'flatleft', 'steepright'], m: 2 }], eg: [fn(x => Math.pow(2, x), -5, 2.9, 24)] },
  /* transformations of shapes: the image, corner for corner, or the scheme's B1 */
  'Q-1MA1-2406-3F-18a': { items: [poly(rot180([[1, 4], [5, 4], [4, 2], [2, 2]], [0, 0]), { m: 2, or: { k: 'any', m: 1, of: [poly(rot180([[1, 4], [5, 4], [4, 2], [2, 2]], [0, 0]), { move: 'xy' }), { k: 'pts', at: rot180([[1, 4], [5, 4], [4, 2], [2, 2]], [0, 0]), need: 3 }] } })] },
  'Q-1MA1-2406-3H-12': { items: [poly(enl([[1, 2], [1, 3], [3, 2]], [0, 0], -2), { m: 2, or: { k: 'any', m: 1, of: [poly(enl([[1, 2], [1, 3], [3, 2]], [0, 0], -2), { move: 'xy' }), poly(enl([[1, 2], [1, 3], [3, 2]], [0, 0], 2))] } })] },
  'Q-1MA1-2306-3H-16': { items: [poly(enl([[-6, -2], [-5, -5], [-7, -5]], [-2, -2], -2), { m: 2, or: { k: 'any', m: 1, of: [poly(enl([[-6, -2], [-5, -5], [-7, -5]], [-2, -2], -2), { move: 'xy' }), poly(enl([[-6, -2], [-5, -5], [-7, -5]], [-2, -2], 2))] } })] },
  'Q-1MA1-1911-3H-9': { items: [poly(enl([[1, 1], [1, 3], [2, 3]], [0, 1], 2.5), { m: 2, or: poly(enl([[1, 1], [1, 3], [2, 3]], [0, 1], 2.5), { move: 'xy', snap: false, m: 1 }) })] },
  'Q-1MA1-1806-2H-7': { items: [poly(enl([[3, 10], [6, 10], [6, 7], [3, 4]], [0, 1], 1 / 3), { m: 2, or: poly(enl([[3, 10], [6, 10], [6, 7], [3, 4]], [0, 1], 1 / 3), { move: 'xy', m: 1 }) })] },
  'Q-1MA1-1711-1H-18': { loose: true, items: [poly(enl([[2, 7], [2, 3], [4, 3]], [0, 0], -0.5), { m: 2, or: { k: 'any', m: 1, of: [poly(enl([[2, 7], [2, 3], [4, 3]], [0, 0], -0.5), { move: 'xy', snap: false }), poly(enl([[2, 7], [2, 3], [4, 3]], [0, 0], 0.5))] } })] },
  'Q-1MA1-1711-2H-5a': { loose: true, items: [poly(rot180([[2, -1], [4, -1], [5, -2], [2, -2]], [0, 0]))] },
  'Q-1MA1-1711-2H-5b': { loose: true, items: [poly(mv([[2, -1], [4, -1], [5, -2], [2, -2]], -1, -3))] },
  /* plans and elevations: the shape at its size, anywhere on the grid, any way round */
  'Q-1MA1-2406-3F-24b': { items: [{ k: 'segs', at: edges(sq_(0, 0, 7, 6)), turn: true, move: 'xy', m: 1 }, { k: 'segs', at: edges(sq_(0, 0, 7, 6)).concat([[0, 3, 7, 3]]), turn: true, move: 'xy', m: 1 }] },
  'Q-1MA1-2406-3H-3b': { items: [{ k: 'segs', at: edges(sq_(0, 0, 7, 6)), turn: true, move: 'xy', m: 1 }, { k: 'segs', at: edges(sq_(0, 0, 7, 6)).concat([[0, 3, 7, 3]]), turn: true, move: 'xy', m: 1 }] },
  'Q-1MA1-2211-2H-2': { items: [{ k: 'segs', at: edges(sq_(0, 0, 3, 5)), move: 'xy', m: 2 }] },
  'Q-1MA1-1706-2H-3': { items: [{ k: 'segs', at: edges([[0, 0], [4, 0], [4, 1], [0, 4]]), move: 'xy', m: 2 }, { k: 'segs', at: edges(sq_(0, 0, 2, 4)).concat([[0, 1, 2, 1]]), move: 'xy', m: 2 }] },
  'Q-1MA1-1805-1H-5a': Object.assign({ loose: true, items: [{ k: 'polygon', n: 3, sas: [6, 5, 53.13], sim: true, m: 2, or: { k: 'polygon', n: 3, is: 'isosceles', m: 1 } }], eg: [[[60, 260], [240, 260], [150, 140], [60, 260]]] }, blank),
  'Q-1MA1-1806-3H-3': { items: [{ k: 'polygon', n: 3, area: 18, atol: 0.5, m: 2 }], eg: [[[10, 1], [19, 1], [12, 5], [10, 1]]] },
  /* vectors: the arrow, its head at the right end, anywhere on the grid */
  'Q-1MA1-2406-3H-8': { items: [{ k: 'segs', at: [[0, 0, 5, 8]], move: 'xy', head: true, m: 3, or: { k: 'segs', at: [[0, 0, 5, 8]], move: 'xy', m: 2 } }] },
  'Q-1MA1-1806-2H-10a': { loose: true, items: [{ k: 'segs', at: [[0, 0, -2, -4]], move: 'xy', head: true }] },
  /* points, circles, pie charts and scales */
  'Q-1MA1-2406-2F-8c': { loose: true, items: [{ k: 'pts', at: [[-4, 2]] }] },
  'Q-1MA1-2406-2F-7c': Object.assign({ items: [{ k: 'polygon', n: 6 }], eg: [regular([170, 170], 120, 6).concat([at([170, 170], 30, 120)])] }, blank),
  'Q-1MA1-2406-3F-10a': Object.assign({ items: [{ k: 'radius', c: [170, 84], r: 72 }] }, blank),
  'Q-1MA1-2406-3F-14': Object.assign({ loose: true, items: [{ k: 'pie', c: [170, 124], r: 112, given: [0], sect: [120, 40, 200], m: 2, or: { k: 'pie', c: [170, 124], r: 112, given: [0], sect: [120, 40, 200], need: 1, m: 1 } }, { k: 'pie', c: [170, 124], r: 112, given: [0], sect: [120, 40, 200], m: 1 }] }, blank),
  'Q-1MA1-1706-1F-14a': Object.assign({ loose: true, items: [{ k: 'pie', c: [170, 112], r: 96, given: [0], sect: [168, 120, 72], m: 2, or: { k: 'pie', c: [170, 112], r: 96, given: [0], sect: [168, 120, 72], need: 1, m: 1 } }, { k: 'pie', c: [170, 112], r: 96, given: [0], sect: [168, 120, 72], m: 1 }] }, blank),
  'Q-1MA1-1706-1F-6i': Object.assign({ items: [{ k: 'pts', at: [[170, 30]] }] }, blank),
  'Q-1MA1-1706-1F-6ii': Object.assign({ items: [{ k: 'pts', at: [[44, 30]] }] }, blank),
  'Q-1MA1-2306-2H-4b': { frame: { o: [166.1, 0], u: [24.274, 1] }, items: [{ k: 'interval', a: -4, b: 1, ca: true, cb: false, y: -4, m: 2, or: { k: 'interval', a: -4, b: 1, loose: true, y: -4, m: 1 } }] },
  'Q-1MA1-1906-2H-1b': { frame: { o: [162.86, 0], u: [24.562, 1] }, items: [{ k: 'interval', a: -5, b: 1, ca: false, cb: true, y: 6, m: 3, or: { k: 'interval', a: -5, b: 1, loose: true, y: 6, m: 2 } }] },
  /* regions: each boundary line, then the region itself shaded or labelled */
  'Q-1MA1-2406-2H-13': { loose: true, items: [
    { k: 'segs', at: [[2, -3, 2, 0], [-2, -3, 2, -3]], m: 1 },
    { k: 'segs', at: [[-2, -3, 4 / 7, 15 / 7], [4 / 7, 15 / 7, 2, 0]], m: 1 },
    { k: 'inside', poly: [[-2, -3], [2, -3], [2, 0], [4 / 7, 15 / 7]], m: 1 }] },
  'Q-1MA1-2006-3H-13a': { loose: true, items: [
    { k: 'segs', at: [[0, 2, 0, 3], [2, 2 / 3, 2, 5]], m: 1 },
    { k: 'segs', at: [[0, 3, 2, 5]], m: 1 },
    { k: 'segs', at: [[0, 2, 2, 2 / 3]], m: 1 },
    { k: 'inside', poly: [[0, 2], [0, 3], [2, 5], [2, 2 / 3]], m: 1 }] },
  'Q-1MA1-1711-2H-14': { loose: true, items: [
    { k: 'segs', at: [[0.5, 1, 4, 1], [4, 1, 5 / 3, 10 / 3], [0.5, 1, 5 / 3, 10 / 3]], cover: 0.45, need: 2, m: 1 },
    { k: 'segs', at: [[0.5, 1, 4, 1], [4, 1, 5 / 3, 10 / 3], [0.5, 1, 5 / 3, 10 / 3]], cover: 0.45, m: 1 },
    { k: 'inside', poly: [[0.5, 1], [4, 1], [5 / 3, 10 / 3]], m: 1 }] },
  'Q-1MA1-2406-2F-17': Object.assign({ loose: true, items: [
    { k: 'segs', path: ARC17, cover: 0.75, tol: 0.4, m: 1 },
    { k: 'line', thru: [[168.75, 70.3], [168.75, 173.1]], m: 1 },
    { k: 'inside', poly: R17, min: 1, m: 1 }] }, blank),
  /* a construction: the line, and the compass arcs that made it */
  'Q-1MA1-1911-1H-4': Object.assign({ loose: true, items: [{ k: 'curves', n: 2, near: [223.7, 174.2], r: 140, m: 1 }, { k: 'line', thru: [[223.7, 20.7], [223.7, 174.2]], m: 1 }],
    eg: [[[223.7, 20.7], [223.7, 174.2]], sector([223.7, 20.7], 180, 150, 210).slice(1), sector([223.7, 20.7], 180, 150, 210).slice(1).map(p => [p[0], 2 * 174.2 - p[1] + 60])] }, blank),
};

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
      Object.keys(T).forEach(k => { if (k === 'html_add' || k === 'typed') return; if (T[k] === '') delete r[k]; else r[k] = T[k]; });
      if (T.html_add && String(r.html || '').indexOf(T.html_add) === -1) r.html = String(r.html || '') + T.html_add;
      if (T.typed) { delete r.draw_answer; t++; }
    }
  });
  if (DRY) console.log(JSON.stringify(SPEC, null, 1).slice(0, 4000));
  else fs.writeFileSync(FILE, '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
  console.log('draw_answer on ' + n + ' rows; ' + t + ' drawn answers made typed');
}
