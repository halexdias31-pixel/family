/* @family. — tools/lib/qgen-draw.js A GENERATED QUESTION'S DIAGRAM, DRAWN FROM ITS OWN NUMBERS (owner 26 Nov: no animation, no hand-drawn art,
   nothing arbitrary; one mechanism). A template in data/settings/qgen.json may declare `diagram`: { kind, size, label } — `size` values are
   expressions (or lists of them) worked out with the question's numbers, `label` values are patterns ({expression}) filled the same way, '' or
   a size of 0 drawing nothing. draw() is a pure function of the kind and those values, so the same id is the same SVG. The SVG goes where every
   question figure goes: the words' `diagram`, placed by `<!--fig-->` (js/find-figures.js figBlocks_), its lines `currentColor` and its labels
   the figure classes `.num` / `.ax` in style.css. Kinds: rectangle, triangle, right-triangle, angles-at-point, polygon, cuboid, circle, sector,
   beam. Written by tools/lib/qgen.js emit(); checked by tools/one-diagram.js. */
'use strict';

const W = 300, H = 210, M = 40;
const r1 = n => String(Math.round(n * 10) / 10);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rad = d => d * Math.PI / 180;
/* A LABEL: an unknown (a letter or ?) in the italic figure face, a number in the plain one. */
const text = (x, y, s, anchor) => '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (/^[a-z?]$/i.test(s) ? 'ax' : 'num') + '" text-anchor="'
  + (anchor || 'middle') + '" dominant-baseline="middle">' + esc(s) + '</text>';
const line = (a, b, dash) => '<line x1="' + r1(a[0]) + '" y1="' + r1(a[1]) + '" x2="' + r1(b[0]) + '" y2="' + r1(b[1]) + '" stroke="currentColor"'
  + (dash ? ' stroke-dasharray="5 4"' : '') + '/>';
const poly = ps => '<polygon points="' + ps.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ') + '" fill="none" stroke="currentColor"/>';
const clampRatio = (a, b, k) => (a / b > k ? [a, a / k] : b / a > k ? [b / k, b] : [a, b]);

/* FIT points given in maths units (y up) into the box, keeping their shape. */
function fit(ps, box) {
  const b = box || { x: M, y: M - 10, w: W - 2 * M, h: H - 2 * M };
  const xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min(b.w / ((x1 - x0) || 1), b.h / ((y1 - y0) || 1));
  const ox = b.x + (b.w - (x1 - x0) * s) / 2, oy = b.y + (b.h - (y1 - y0) * s) / 2;
  return ps.map(p => [ox + (p[0] - x0) * s, oy + (y1 - p[1]) * s]);
}
const centroid = ps => [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length];
/* A SIDE'S LABEL: off the side's middle, away from the shape's centre. */
function sideLabel(a, b, c, s, gap) {
  if (!s) return '';
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  let nx = -(b[1] - a[1]), ny = b[0] - a[0];
  const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
  if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; }
  const g = gap || 16, x = mx + nx * g, y = my + ny * g;
  return text(x, y, s, Math.abs(nx) < 0.35 ? 'middle' : nx > 0 ? 'start' : 'end');
}
/* AN ANGLE AT vertex v between the rays to p and q: a small arc and its label along the bisector (a square for 90°). */
function angleMark(v, p, q, s, square, deg) {
  const big = deg > 180; /* a reflex angle: the arc and label go round the far side */
  const u = t => { const dx = t[0] - v[0], dy = t[1] - v[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  const a = u(p), b = u(q);
  let out = '';
  if (square) {
    const k = 11;
    out += '<polyline points="' + [[v[0] + a[0] * k, v[1] + a[1] * k], [v[0] + (a[0] + b[0]) * k, v[1] + (a[1] + b[1]) * k], [v[0] + b[0] * k, v[1] + b[1] * k]]
      .map(t => r1(t[0]) + ',' + r1(t[1])).join(' ') + '" fill="none" stroke="currentColor"/>';
  } else if (s) {
    const R = 15, cross = a[0] * b[1] - a[1] * b[0];
    out += '<path d="M' + r1(v[0] + a[0] * R) + ' ' + r1(v[1] + a[1] * R) + ' A' + R + ' ' + R + ' 0 ' + (big ? 1 : 0) + ' ' + ((cross > 0) !== big ? 1 : 0)
      + ' ' + r1(v[0] + b[0] * R) + ' ' + r1(v[1] + b[1] * R) + '" fill="none" stroke="currentColor"/>';
  }
  if (s) {
    let bx = a[0] + b[0], by = a[1] + b[1];
    const L = Math.hypot(bx, by);
    if (L < 1e-6) { bx = -a[1]; by = a[0]; } else { bx /= L; by /= L; }
    if (big) { bx = -bx; by = -by; }
    /* far enough out that a narrow angle's label sits clear of both its rays */
    const half = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) / 2, d = Math.min(62, big ? 28 : Math.max(28, 12 / Math.max(Math.sin(half), 0.01)));
    out += text(v[0] + bx * d, v[1] + by * d, s);
  }
  return out;
}

/* A POLYGON WITH THESE INTERIOR ANGLES (degrees, in order): every side but the last two from a fixed list of lengths, the last two whatever
   closes it; of those that close, the one whose shortest side is longest against its longest (the first such, so the same every time). */
function closeFrom(angles) {
  const n = angles.length, dirs = [];
  let h = 0;
  for (let i = 0; i < n; i++) { dirs.push(h); h += 180 - angles[(i + 1) % n]; }
  const F = [0.25, 0.5, 0.75, 1, 1.5, 2, 3], tries = [];
  (function grow(L) { if (L.length === n - 2) { tries.push(L); return; } F.forEach(f => grow(L.concat([f]))); })([]);
  let best = null, bestScore = 0;
  for (const L of tries) {
    let x = 0, y = 0;
    L.forEach((l, i) => { x += l * Math.cos(rad(dirs[i])); y += l * Math.sin(rad(dirs[i])); });
    const a = [Math.cos(rad(dirs[n - 2])), Math.sin(rad(dirs[n - 2]))], b = [Math.cos(rad(dirs[n - 1])), Math.sin(rad(dirs[n - 1]))];
    const det = a[0] * b[1] - a[1] * b[0];
    if (Math.abs(det) < 1e-9) continue;
    const p = (-x * b[1] + y * b[0]) / det, q = (a[0] * -y - a[1] * -x) / det;
    if (!(p > 0 && q > 0)) continue;
    const all = L.concat([p, q]), score = Math.min(...all) / Math.max(...all);
    if (score > bestScore + 1e-9) { bestScore = score; best = all; }
  }
  if (best) {
    const pts = [[0, 0]];
    best.slice(0, -1).forEach((l, i) => { const t = pts[pts.length - 1]; pts.push([t[0] + l * Math.cos(rad(dirs[i])), t[1] + l * Math.sin(rad(dirs[i]))]); });
    return { pts, score: bestScore }; /* vertex i has angle angles[i] */
  }
  return null;
}
/* ANY TWO NEIGHBOURING SIDES MAY BE THE ONES THAT CLOSE IT (a reflex or nearly straight angle needs the right pair): the best of every turn. */
function closing(angles) {
  const n = angles.length;
  let best = null;
  for (let r = 0; r < n; r++) {
    const got = closeFrom(angles.slice(r).concat(angles.slice(0, r)));
    if (got && (!best || got.score > best.score + 1e-9)) best = { score: got.score, pts: got.pts.slice(n - r).concat(got.pts.slice(0, n - r)) };
  }
  if (!best) throw new Error('no polygon closes with angles ' + angles.join(', '));
  return best.pts;
}

const KINDS = {
  rectangle(s, l) {
    const [w, h] = clampRatio(s.w, s.h, 4), P = fit([[0, 0], [w, 0], [w, h], [0, h]]), c = centroid(P);
    return { body: poly(P) + sideLabel(P[0], P[1], c, l.w) + sideLabel(P[1], P[2], c, l.h), say: 'Rectangle' };
  },
  triangle(s, l) {
    const [b, h] = clampRatio(s.b, s.h, 4), P = fit([[0, 0], [b, 0], [0.3 * b, h]]), c = centroid(P), F = [P[2][0], P[0][1]];
    return { body: poly(P) + line(P[2], F, true) + angleMark(F, P[1], P[2], '', true) + sideLabel(P[0], P[1], c, l.b)
      + (l.h ? text(F[0] + 7, F[1] + (P[2][1] - F[1]) * 0.3, l.h, 'start') : ''), say: 'Triangle with its perpendicular height' };
  },
  'right-triangle'(s, l) {
    const [b, u] = clampRatio(s.base, s.up, 4), P = fit([[0, 0], [b, 0], [b, u]]), c = centroid(P);
    return { body: poly(P) + angleMark(P[1], P[0], P[2], '', true) + angleMark(P[0], P[1], P[2], l.angle)
      + sideLabel(P[0], P[1], c, l.base) + sideLabel(P[1], P[2], c, l.up) + sideLabel(P[0], P[2], c, l.hyp), say: 'Right-angled triangle' };
  },
  'angles-at-point'(s, l) {
    const A = s.angles.map(Number), O = [W / 2, H / 2 - 5], R = 80;
    let h = 90, body = '';
    const rays = A.map(a => { const t = [O[0] + R * Math.cos(rad(h)), O[1] - R * Math.sin(rad(h))]; h -= a; return t; });
    rays.forEach(t => { body += line(O, t); });
    A.forEach((a, i) => { body += angleMark(O, rays[i], rays[(i + 1) % A.length], l.angles[i], false, a); });
    return { body, say: A.length + ' angles at a point' };
  },
  polygon(s, l) {
    const A = s.angles.map(Number), P = fit(closing(A)), c = centroid(P), n = A.length;
    let body = poly(P);
    P.forEach((v, i) => { body += angleMark(v, P[(i + n - 1) % n], P[(i + 1) % n], l.angles[i], false, A[i]); });
    return { body, say: n === 3 ? 'Triangle' : n === 4 ? 'Quadrilateral' : n === 5 ? 'Pentagon' : n === 6 ? 'Hexagon' : n + '-sided polygon' };
  },
  cuboid(s, l) {
    let [L, h] = clampRatio(s.l, s.h, 3), w = Math.max(Math.min(s.w, 3 * Math.max(L, h)), Math.max(L, h) / 3);
    const dx = w * 0.5 * Math.cos(rad(35)), dy = w * 0.5 * Math.sin(rad(35));
    const raw = [[0, 0], [L, 0], [L, h], [0, h], [dx, h + dy], [L + dx, h + dy], [L + dx, dy]], P = fit(raw), c = centroid(P);
    const hid = fit(raw.concat([[dx, dy]]))[7];
    const body = poly([P[0], P[1], P[2], P[3]]) + poly([P[3], P[2], P[5], P[4]]) + poly([P[1], P[6], P[5], P[2]])
      + line(P[0], hid, true) + line(hid, P[4], true) + line(hid, P[6], true)
      + sideLabel(P[0], P[1], c, l.l) + sideLabel(P[1], P[6], c, l.w) + sideLabel(P[0], P[3], c, l.h);
    return { body, say: 'Cuboid' };
  },
  circle(s, l) {
    const O = [W / 2, H / 2 - 5], R = 72, d = !!s.diameter;
    const A = d ? [O[0] - R, O[1]] : O, B = [O[0] + R, O[1]];
    return { body: '<circle cx="' + O[0] + '" cy="' + O[1] + '" r="' + R + '" fill="none" stroke="currentColor"/><circle cx="' + O[0] + '" cy="' + O[1]
      + '" r="2.5" fill="currentColor" stroke="none"/>' + line(A, B) + (l.line ? text((A[0] + B[0]) / 2, O[1] - 11, l.line) : ''),
      say: 'Circle with its ' + (d ? 'diameter' : 'radius') + ' marked' };
  },
  sector(s, l) {
    const t = Number(s.angle), O = [W / 2, H / 2 + (t <= 180 ? 40 : 0)], R = t <= 180 ? 110 : 80;
    const a0 = 90 - t / 2, a1 = 90 + t / 2, p = d => [O[0] + R * Math.cos(rad(d)), O[1] - R * Math.sin(rad(d))];
    const A = p(a0), B = p(a1);
    const body = '<path d="M' + r1(O[0]) + ' ' + r1(O[1]) + ' L' + r1(A[0]) + ' ' + r1(A[1]) + ' A' + R + ' ' + R + ' 0 ' + (t > 180 ? 1 : 0) + ' 0 ' + r1(B[0]) + ' '
      + r1(B[1]) + ' Z" fill="none" stroke="currentColor"/>' + angleMark(O, A, B, l.angle, false, t) + sideLabel(O, A, [O[0], O[1] - R / 2], l.r);
    return { body, say: 'Sector of a circle' };
  },
  /* A BEAM ON A PIVOT: the pivot in the middle, a load at the end of each arm that has one (its force label above, its distance under the arm),
     so the drawing tells nothing the words do not (no length to measure the answer off). */
  beam(s, l) {
    const y = 95, X0 = 40, X1 = 260, Px = W / 2;
    let body = line([X0, y], [X1, y]) + '<polygon points="' + Px + ',' + y + ' ' + (Px - 14) + ',' + (y + 24) + ' ' + (Px + 14) + ',' + (y + 24) + '" fill="none" stroke="currentColor"/>';
    [['left', 'leftd', X0 + 6], ['right', 'rightd', X1 - 6]].forEach(([f, d, x]) => {
      if (!s[f]) return;
      body += line([x, y - 52], [x, y - 2]) + '<polyline points="' + (x - 5) + ',' + (y - 11) + ' ' + x + ',' + (y - 2) + ' ' + (x + 5) + ',' + (y - 11)
        + '" fill="none" stroke="currentColor"/>' + (l[f] ? text(x, y - 62, l[f]) : '');
      const yy = y + 40;
      body += line([Math.min(x, Px), yy], [Math.max(x, Px), yy]) + line([x, yy - 5], [x, yy + 5]) + line([Px, yy - 5], [Px, yy + 5])
        + (l[d] ? text((x + Px) / 2, yy + 14, l[d]) : '');
    });
    return { body, say: 'Beam balanced on a pivot' };
  },
};

/* THE SVG for a kind and its worked-out sizes and labels; `labels()` lists the labels it shows (what the check reads back). */
function draw(kind, size, label) {
  const k = KINDS[kind];
  if (!k) throw new Error('no diagram kind "' + kind + '" (kinds: ' + Object.keys(KINDS).join(', ') + ')');
  const { body, say } = k(size, label);
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(say) + ' (not drawn accurately)">' + body + '</svg>';
}
const labels = svg => (String(svg).match(/<text\b[^>]*>([^<]*)<\/text>/g) || []).map(t => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

/* A TEMPLATE'S DIAGRAM FOR ONE QUESTION'S VALUES (env), with `evaluate` and `fill` from tools/lib/qgen.js: { kind, svg } or null. A list's entries
   go together: where a size is 0 that entry and its label are left out. */
function ofTemplate(t, env, evaluate, fill) {
  const d = t.diagram;
  if (!d) return null;
  const size = {}, label = {};
  Object.keys(d.size || {}).forEach(k => { const v = d.size[k]; size[k] = Array.isArray(v) ? v.map(e => evaluate(String(e), env)) : evaluate(String(v), env); });
  Object.keys(d.label || {}).forEach(k => { const v = d.label[k]; label[k] = Array.isArray(v) ? v.map(p => fill(p, env)) : fill(v, env); });
  Object.keys(size).filter(k => Array.isArray(size[k])).forEach(k => {
    const keep = size[k].map(v => Number(v) !== 0);
    size[k] = size[k].filter((_, i) => keep[i]);
    if (Array.isArray(label[k])) label[k] = label[k].filter((_, i) => keep[i]);
  });
  return { kind: d.kind, svg: draw(d.kind, size, label) };
}

module.exports = { KINDS, draw, labels, ofTemplate };
