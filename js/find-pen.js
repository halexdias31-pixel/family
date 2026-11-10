/* ---------- A DRAWN ANSWER IS MARKED BY ITS GEOMETRY (366) */
/* The figure as numbers: its viewBox, its ruled grid (`padGrid_`) and its numeric labels, which give an axis its scale. */
function drawFig_(svg) {
  const s = String(svg || '');
  const m = /viewBox\s*=\s*["']\s*([-\d.eE+]+)[\s,]+([-\d.eE+]+)[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/.exec(s);
  const vb = m ? [+m[1], +m[2], +m[3], +m[4]] : [0, 0, 340, 340];
  /* a figure wrapped whole in one translate (the metric-units dial): its items are in the group's units, so the frame shifts by it */
  const tm = /^<svg\b[^>]*>\s*<g\s+transform\s*=\s*["']\s*translate\(\s*([-\d.eE+]+)(?:[\s,]+([-\d.eE+]+))?\s*\)\s*["']\s*>/.exec(s.trim());
  const shift = tm ? [+tm[1], +(tm[2] || 0)] : [0, 0];
  const labels = [];
  (s.match(/<text\b[^>]*>[\s\S]*?<\/text>/g) || []).forEach(t => {
    if (/\btransform\s*=/.test(t)) return;
    const num = k => { const r = new RegExp('\\s' + k + '\\s*=\\s*["\']\\s*([-\\d.eE+]+)').exec(t); return r ? +r[1] : NaN; };
    /* a tick drawn as a dash after the number ("40 \u2212") is not part of it */
    const words = t.replace(/<[^>]*>/g, '').replace(/&minus;|\u2212|&#8722;/g, '-').replace(/&[a-z#0-9]+;/gi, '').trim().replace(/\s+-$/, '');
    if (/^-?\d+(\.\d+)?$/.test(words) && isFinite(num('x')) && isFinite(num('y'))) labels.push([+words, num('x') + shift[0], num('y') + shift[1]]);
  });
  return { vb: vb, grid: typeof padGrid_ === 'function' ? padGrid_(s) : null, labels: labels, shift: shift };
}
/* THE MARKER IN STAGES, each handed the names of those before it: geometry, frame, ink, shapes, the kinds (drawKinds1_ to 5_), the example; `drawMarker_` joins them. */
function drawGeom_() {
  const H = Math.hypot, R = Math.PI / 180;
  const near = (a, b) => H(a[0] - b[0], a[1] - b[1]);
  function dSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    return H(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function dLine(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = H(dx, dy) || 1;
    return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L;
  }
  const dPoly = (p, pl) => pl.length === 1 ? near(p, pl[0]) : pl.slice(1).reduce((m, q, i) => Math.min(m, dSeg(p, pl[i], q)), Infinity);
  const len = pl => pl.slice(1).reduce((s, q, i) => s + near(q, pl[i]), 0);
  function rdp(pl, eps) {
    if (pl.length < 3) return pl.slice();
    let k = 0, dm = 0;
    for (let i = 1; i < pl.length - 1; i++) { const d = dSeg(pl[i], pl[0], pl[pl.length - 1]); if (d > dm) { dm = d; k = i; } }
    if (dm <= eps) return [pl[0], pl[pl.length - 1]];
    return rdp(pl.slice(0, k + 1), eps).slice(0, -1).concat(rdp(pl.slice(k), eps));
  }
  function inside(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  const area = poly => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  /* clockwise from straight up, in degrees, as a clock and a protractor on screen read it */
  const bearing = (c, p) => ((Math.atan2(p[0] - c[0], c[1] - p[1]) / R) + 360) % 360;
  const dirOf = (a, b) => ((Math.atan2(b[1] - a[1], b[0] - a[0]) / R) + 180) % 180;
  const dDir = (a, b) => { const d = Math.abs(a - b) % 180; return Math.min(d, 180 - d); };
  /* a dotted grid as two steps from one dot, so the row does not list every dot */
  function latSnap(q, L) {
    const d = L[2] * L[5] - L[3] * L[4], x = q[0] - L[0], y = q[1] - L[1];
    const i = Math.round((x * L[5] - y * L[4]) / d), j = Math.round((L[2] * y - L[3] * x) / d);
    return [L[0] + i * L[2] + j * L[4], L[1] + i * L[3] + j * L[5]];
  }
  const onDots = (q, on, F, tol) => on.lat ? near(latSnap(q, on.lat), q) <= tol : on.some(o => near(F.v(o), q) <= tol);
  function convex(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]).filter((q, i, a) => !i || near(q, a[i - 1]) > 1e-6);
    if (p.length < 3) return p;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-6) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 1e-6) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  function cross(s, t) {
    const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    return o(s[0], s[1], t[0]) !== o(s[0], s[1], t[1]) && o(t[0], t[1], s[0]) !== o(t[0], t[1], s[1]);
  }
  return { H, R, near, dSeg, dLine, dPoly, len, rdp, inside, area, bearing, dirOf, dDir, latSnap, onDots, convex, cross };
}
function drawFrame_() {
  /* THE FRAME: figure units to the picture's. Labels give an axis its scale; a grid alone counts squares from its bottom-left corner, y up. */
  function fitAxis(fig, axis, not) {
    const L = (fig.labels || []).filter(l => !(not && not.indexOf(l) !== -1)), by = {};
    L.forEach(l => { const key = Math.round((axis === 'x' ? l[2] : l[1]) / 8); (by[key] = by[key] || []).push(l); });
    let best = null;
    Object.keys(by).forEach(k => {
      const g = by[k].filter((l, i, a) => a.findIndex(o => o[0] === l[0]) === i);
      if (g.length < 3) return;
      /* a y label's number sits on its baseline, about a third of a line below the grid line it names */
      const vs = g.map(l => l[0]), ps = g.map(l => axis === 'x' ? l[1] : l[2] - 3.5);
      const n = vs.length, mv = vs.reduce((a, b) => a + b) / n, mp = ps.reduce((a, b) => a + b) / n;
      const sxx = vs.reduce((s, v) => s + (v - mv) * (v - mv), 0);
      if (!sxx) return;
      const b = vs.reduce((s, v, i) => s + (v - mv) * (ps[i] - mp), 0) / sxx, a = mp - b * mv;
      const res = Math.max.apply(null, vs.map((v, i) => Math.abs(a + b * v - ps[i])));
      const span = Math.abs(b) * (Math.max.apply(null, vs) - Math.min.apply(null, vs));
      if (!b || res > span * 0.04 + 3) return;
      if (axis === 'x' ? b < 0 : b > 0) return;
      if (!best || n > best.n) best = { a: a, b: b, n: n, v0: vs[0], g: g };
    });
    if (!best) return null;
    const G = fig.grid, lines = G ? (axis === 'x' ? G.xs : G.ys) : null;
    if (lines && lines.length > 1) {
      const pitch = (lines[lines.length - 1] - lines[0]) / (lines.length - 1);
      /* a square is a round number of units: 1, 2, 2.5 or 5 times a power of ten */
      const u = pitch / Math.abs(best.b), e = Math.pow(10, Math.floor(Math.log10(u)));
      const nice = [1, 2, 2.5, 5, 10].map(f => f * e).find(n => Math.abs(n - u) <= 0.06 * n);
      if (nice) best.b = Math.sign(best.b) * pitch / nice;
      const p0 = best.a + best.b * best.v0;
      const g = lines.reduce((m, l) => Math.abs(l - p0) < Math.abs(m - p0) ? l : m, lines[0]);
      if (Math.abs(g - p0) < pitch * 0.4) best.a += g - p0;
    }
    return best;
  }
  function frameOf(spec, fig) {
    const G = fig.grid, vb = fig.vb;
    const sq = G && G.xs.length > 1 ? (G.xs[G.xs.length - 1] - G.xs[0]) / (G.xs.length - 1) : (spec.sq || 20);
    let o, u;
    const f = spec.frame;
    const sh = fig.shift || [0, 0];
    if (f && f.o && f.u) { o = [f.o[0] + sh[0], f.o[1] + sh[1]]; u = f.u; }
    else if (f === 'vb') { o = sh.slice(); u = [1, 1]; }
    else {
      /* each axis by its own numbers where it has them; one without counts squares (or the picture's units) */
      const ax = f === 'grid' ? null : fitAxis(fig, 'x'), ay = f === 'grid' ? null : fitAxis(fig, 'y', ax && ax.g);
      const at = (f && f.grid) || [0, 0], py = G ? (G.ys[G.ys.length - 1] - G.ys[0]) / (G.ys.length - 1) : 1;
      o = [ax ? ax.a : G ? G.xs[0] - at[0] * sq : 0, ay ? ay.a : G ? G.ys[G.ys.length - 1] + at[1] * py : 0];
      u = [ax ? ax.b : G ? sq : 1, ay ? ay.b : G ? -py : 1];
    }
    return { o: o, u: u, sq: sq, vb: vb, grid: G,
      v: p => [o[0] + p[0] * u[0], o[1] + p[1] * u[1]],
      f: p => [(p[0] - o[0]) / u[0], (p[1] - o[1]) / u[1]] };
  }
  return { fitAxis, frameOf };
}
function drawInk_(g) { const { H, R, near, dSeg, dPoly, len, rdp, bearing } = g;
  /* THE INK: each stroke as a polyline in the picture's units, its corners snapped to grid points (357's snap, read back). */
  function inkOf(strokes, F) {
    const vb = F.vb, G = F.grid, snap = F.sq * 0.22;
    const gp = (v, list) => list.reduce((m, l) => Math.abs(l - v) < Math.abs(m - v) ? l : m, list[0]);
    return (strokes || []).filter(s => Array.isArray(s) && s.length >= 2).map(s => {
      const pl = [];
      for (let i = 0; i + 1 < s.length; i += 2) pl.push([vb[0] + s[i] / 340 * vb[2], vb[1] + s[i + 1] / 340 * vb[3]]);
      /* a hand's wobble leaves a corner that is no corner: one turning under 12 degrees and close to the line is dropped, so a straight side stays one piece */
      const kept = rdp(pl, F.sq * 0.15);
      for (let i = kept.length - 2; i > 0; i--) {
        const a = kept[i - 1], b = kept[i], c = kept[i + 1];
        const t = Math.abs(Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0])) / R;
        if (Math.min(t, 360 - t) < 12 && dSeg(b, a, c) <= F.sq * 0.3) kept.splice(i, 1);
      }
      const segs = kept.map(p => {
        if (!G) return p;
        const q = [gp(p[0], G.xs), gp(p[1], G.ys)];
        return near(p, q) <= snap ? q : p;
      });
      return { pl: pl, segs: segs, len: len(pl), c: pl.reduce((a, p) => [a[0] + p[0] / pl.length, a[1] + p[1] / pl.length], [0, 0]),
        size: H(Math.max.apply(null, pl.map(p => p[0])) - Math.min.apply(null, pl.map(p => p[0])),
                Math.max.apply(null, pl.map(p => p[1])) - Math.min.apply(null, pl.map(p => p[1]))) };
    });
  }
  const samples = (a, b, step) => { const n = Math.max(2, Math.ceil(near(a, b) / step)); const out = []; for (let i = 0; i <= n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return out; };
  const dInk = (p, ink) => ink.reduce((m, s) => Math.min(m, dPoly(p, s.pl)), Infinity);
  /* a line, a side or a curve is drawn when nearly all of it has ink within the tolerance */
  const covered = (a, b, ink, tol, from, to, frac) => {
    const pts = samples(a, b, tol / 2).filter((p, i, all) => i / (all.length - 1) >= (from || 0) - 1e-9 && i / (all.length - 1) <= (to == null ? 1 : to) + 1e-9);
    return pts.filter(p => dInk(p, ink) <= tol).length >= pts.length * (frac || 0.85);
  };
  /* straight pieces of ink, for the kinds that ask about directions and corners */
  const straights = (ink, min) => {
    const out = [];
    ink.forEach(s => s.segs.slice(1).forEach((q, i) => { if (near(q, s.segs[i]) >= min) out.push([s.segs[i], q]); }));
    return out;
  };
  /* hands, pointers and radii: each stroke cut where it passes nearest the centre, in either direction; an arm's way is the mean way of its outer half, so a wobble or a start off the centre cancels */
  const rays = (ink, c, r, inR, min) => {
    const out = [];
    ink.forEach(s => {
      let k = 0;
      s.pl.forEach((p, i) => { if (near(p, c) < near(s.pl[k], c)) k = i; });
      if (near(s.pl[k], c) > r * inR) return;
      [s.pl.slice(0, k + 1).reverse(), s.pl.slice(k)].forEach(arm => {
        const L = Math.max.apply(null, arm.map(p => near(p, c)));
        if (L < r * min) return;
        let x = 0, y = 0;
        arm.filter(p => near(p, c) >= L * 0.5).forEach(p => { const d = near(p, c) || 1; x += (p[0] - c[0]) / d; y += (p[1] - c[1]) / d; });
        out.push({ g: bearing(c, [c[0] + x, c[1] + y]), L: L });
      });
    });
    return out;
  };
  return { inkOf, samples, dInk, covered, straights, rays };
}
function drawShapes_(g) { const { H, R, near, dirOf, dDir, straights } = g;
  /* closed shapes in the ink: corners joined across strokes, straight-on corners dropped */
  function polygons(ink, F, join) {
    const S = straights(ink, F.sq * 0.3), nodes = [], edges = [];
    const node = p => { let i = nodes.findIndex(n => near(n, p) <= join); if (i < 0) { nodes.push(p.slice()); i = nodes.length - 1; } return i; };
    S.forEach(s => { const a = node(s[0]), b = node(s[1]); if (a !== b && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) edges.push([a, b]); });
    const nb = nodes.map((n, i) => edges.filter(e => e[0] === i || e[1] === i).map(e => e[0] === i ? e[1] : e[0]));
    const seen = new Set(), out = [];
    nodes.forEach((n, i) => {
      if (seen.has(i)) return;
      const comp = [], st = [i];
      while (st.length) { const k = st.pop(); if (seen.has(k)) continue; seen.add(k); comp.push(k); nb[k].forEach(j => st.push(j)); }
      if (comp.length < 3 || comp.some(k => nb[k].length !== 2)) return;
      const ring = [comp[0]];
      let prev = -1, cur = comp[0];
      for (;;) { const nx = nb[cur][0] !== prev ? nb[cur][0] : nb[cur][1]; if (nx === comp[0]) break; ring.push(nx); prev = cur; cur = nx; if (ring.length > comp.length) return; }
      let cyc = ring.map(k => nodes[k]);
      for (let again = true; again && cyc.length > 3;) {
        again = false;
        for (let k = 0; k < cyc.length; k++) {
          const a = cyc[(k + cyc.length - 1) % cyc.length], b = cyc[k], c = cyc[(k + 1) % cyc.length];
          if (dDir(dirOf(a, b), dirOf(b, c)) < 8) { cyc.splice(k, 1); again = true; break; }
        }
      }
      out.push(cyc);
    });
    return out;
  }
  const sides = poly => poly.map((p, i) => near(p, poly[(i + 1) % poly.length]));
  const corners = poly => poly.map((b, i) => {
    const a = poly[(i + poly.length - 1) % poly.length], c = poly[(i + 1) % poly.length];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (H(u[0], u[1]) * H(v[0], v[1]) || 1)))) / R;
  });
  const same = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(a, b);
  const SHAPE = {
    kite: (p, s) => p.length === 4 && ((same(s[0], s[1], 0.08) && same(s[2], s[3], 0.08)) || (same(s[1], s[2], 0.08) && same(s[3], s[0], 0.08))),
    scalene: (p, s) => p.length === 3 && !same(s[0], s[1], 0.06) && !same(s[1], s[2], 0.06) && !same(s[0], s[2], 0.06),
    right: (p, s, a) => p.length === 3 && a.some(x => Math.abs(x - 90) <= 4),
    acute: (p, s, a) => p.length === 3 && a.every(x => x < 87),
    notacute: (p, s, a) => p.length === 3 && a.some(x => x >= 88),
    equilateral: (p, s) => p.length === 3 && same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07),
    square: (p, s, a) => p.length === 4 && same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07) && a.every(x => Math.abs(x - 90) <= 4),
    /* two lines of symmetry and no more: a rectangle or a rhombus that is not a square */
    twosym: (p, s, a) => p.length === 4 && !SHAPE.square(p, s, a) && (a.every(x => Math.abs(x - 90) <= 4) || same(Math.min.apply(null, s), Math.max.apply(null, s), 0.07)),
    perpdiag: (p, s, a) => p.length === 4 && !SHAPE.square(p, s, a) && dDir(dirOf(p[0], p[2]), dirOf(p[1], p[3])) >= 86,
    notperpdiag: (p) => p.length === 4 && dDir(dirOf(p[0], p[2]), dirOf(p[1], p[3])) < 84,
    isosceles: (p, s) => p.length === 3 && (same(s[0], s[1], 0.06) || same(s[1], s[2], 0.06) || same(s[0], s[2], 0.06)),
    /* both pairs of opposite sides parallel: a rectangle, rhombus or square is one too (439) */
    parallelogram: (p) => p.length === 4 && dDir(dirOf(p[0], p[1]), dirOf(p[3], p[2])) <= 4 && dDir(dirOf(p[1], p[2]), dirOf(p[0], p[3])) <= 4,
  };
  return { polygons, sides, corners, same, SHAPE };
}
function drawKinds1_(g) { const { near, dSeg, dLine, dInk, covered } = g;
  return {
    pts(it, ink, F, tol) {
      const P = it.at.map(F.v), small = F.sq * (it.dot || 1);
      const marks = [];
      ink.forEach(s => { if (s.size <= small) marks.push(s.c); s.segs.forEach(p => marks.push(p)); });
      ink.forEach((s, i) => ink.forEach((t, j) => { if (j > i && s.size <= small && t.size <= small && near(s.c, t.c) <= small) marks.push([(s.c[0] + t.c[0]) / 2, (s.c[1] + t.c[1]) / 2]); }));
      const got = P.filter(p => marks.some(m => near(m, p) <= tol) || (it.onink && dInk(p, ink) <= tol)).length;
      return { ok: got >= (it.need || P.length), ex: q => P.some(p => near(p, q) <= Math.max(tol * 1.5, F.sq * 0.7)) };
    },
    segs(it, ink, F, tol) {
      const base = (it.at || []).map(s => [[s[0], s[1]], [s[2], s[3]]]);
      if (it.poly || it.path) {
        const P = it.poly || it.path;
        P.forEach((p, i) => { if (i + 1 < P.length) base.push([p, P[i + 1]]); });
        if (it.poly) base.push([P[P.length - 1], P[0]]);
      }
      const also = (it.also || []).map(s => [F.v([s[0], s[1]]), F.v([s[2], s[3]])]);
      const tries = [];
      /* `fity`: a sketch on an axis with no numbers up it -- the curve's height is the drawer's, so it is fitted */
      if (it.fity) {
        const ys = [].concat.apply([], ink.map(s => s.pl.map(p => F.f(p)[1]))), top = Math.max.apply(null, base.map(s => Math.max(Math.abs(s[0][1]), Math.abs(s[1][1]))));
        const k0 = ys.length && top ? Math.max.apply(null, ys.map(Math.abs)) / top : 1;
        [0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4].forEach(f => tries.push(base.map(s => s.map(p => F.v([p[0], p[1] * k0 * f])))));
      }
      const flips = it.fity ? [] : it.turn ? [[1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0], [-1, 0, 0, 1], [1, 0, 0, -1], [0, 1, 1, 0], [0, -1, -1, 0]] : [[1, 0, 0, 1]];
      flips.forEach(m => {
        const S = base.map(s => s.map(p => F.v([m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]])));
        if (!it.move) { tries.push(S); return; }
        /* placed anywhere (a plan, a vector, a box plot's height): laid where the ink is, by its box and by its middle */
        const bx = list => { const xs = list.map(p => p[0]), ys = list.map(p => p[1]); return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; };
        const ip = [].concat.apply([], ink.map(s => s.pl)), sp = [].concat.apply([], S);
        if (!ip.length) return;
        const a = bx(ip), b = bx(sp);
        /* and by each corner of the ink, so two shapes drawn side by side are each found where they are */
        const anchors = [].concat.apply([], ink.map(s => s.segs)).slice(0, 60).map(p => [p[0] - sp[0][0], p[1] - sp[0][1]]);
        [[a[0] - b[0], a[1] - b[1]], [a[2] - b[2], a[3] - b[3]], [(a[0] + a[2] - b[0] - b[2]) / 2, (a[1] + a[3] - b[1] - b[3]) / 2]].concat(anchors).forEach(d => {
          let dx = it.move === 'y' ? 0 : d[0], dy = it.move === 'x' ? 0 : d[1];
          if (F.grid && it.snap !== false) { dx = Math.round(dx / F.sq) * F.sq; dy = Math.round(dy / F.sq) * F.sq; }
          tries.push(S.map(s => s.map(p => [p[0] + dx, p[1] + dy])));
        });
      });
      let best = null;
      tries.forEach(S => {
        const n = S.filter(s => covered(s[0], s[1], ink, tol, 0, 1, it.cover)).length;
        if (!best || n > best.n) best = { n: n, S: S };
      });
      const S = best ? best.S : [];
      /* `head`: a vector's arrowhead, ink at the far end that is not the shaft */
      const headOk = !it.head || (S.length === 1 && ink.some(s => s.pl.some(p => near(p, S[0][1]) <= F.sq * 1.2 && near(p, S[0][1]) > tol * 0.5 && dLine(p, S[0][0], S[0][1]) > tol * 0.4)));
      return { ok: !!best && best.n >= (it.need || S.length) && headOk, ex: q => S.concat(also).some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) || (it.head && S.length === 1 && near(q, S[0][1]) <= F.sq * 1.4) };
    },
    line(it, ink, F, tol) {
      const a = F.v(it.thru[0]), b = F.v(it.thru[1]);
      /* `cover`: how much of it must be inked -- a dashed line (a strict inequality) is about half */
      return { ok: covered(a, b, ink, tol, it.from == null ? 0.15 : it.from, it.to == null ? 0.85 : it.to, it.cover),
        ex: q => dLine(q, a, b) <= tol * 1.5 };
    },
  };
}
function drawKinds2_(g) { const { near, dSeg, dLine, inside, area, dirOf, dDir, cross, straights, sides, corners } = g;
  return {
    cells(it, ink, F) {
      const C = (it.cells || []).map(c => c.map(F.v)).concat((it.rects || []).map(r => [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]].map(F.v)));
      const given = it.given || [];
      const on = C.map((c, i) => {
        if (given.indexOf(i) !== -1) return false;
        const m = c.reduce((s, p) => [s[0] + p[0] / c.length, s[1] + p[1] / c.length], [0, 0]);
        const sh = c.map(p => [m[0] + (p[0] - m[0]) * 0.85, m[1] + (p[1] - m[1]) * 0.85]);
        let L = 0;
        ink.forEach(s => s.pl.forEach((p, k) => { if (k && inside(p, sh) && inside(s.pl[k - 1], sh)) L += near(p, s.pl[k - 1]); }));
        return L >= (it.shade || 1.2) * Math.sqrt(area(c));
      });
      const chosen = on.map((v, i) => v ? i : -1).filter(i => i >= 0);
      /* `touch`: how many sides the chosen cells share, which is what a perimeter asks of them */
      const shared = (a, b) => a.filter(p => b.some(q => near(p, q) <= F.sq * 0.1)).length >= 2;
      let touch = 0;
      chosen.forEach((i, x) => chosen.forEach((j, y) => { if (y > x && shared(C[i], C[j])) touch++; }));
      const ok = (it.set ? it.set.some(w => w.length === chosen.length && w.every(i => chosen.indexOf(i) !== -1))
        : chosen.length === it.need) && (it.touch == null || touch === it.touch);
      return { ok: ok, ex: q => C.some(c => inside(q, c)) };
    },
    radius(it, ink, F, tol) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const S = straights(ink, r * 0.4);
      const rim = p => Math.abs(near(p, c) - r) <= tol;
      const hit = S.find(s => it.dia ? rim(s[0]) && rim(s[1]) && dSeg(c, s[0], s[1]) <= tol
        : (near(s[0], c) <= tol && rim(s[1])) || (near(s[1], c) <= tol && rim(s[0])));
      return { ok: !!hit, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    dir(it, ink, F, tol) {
      const to = it.to ? [F.v([it.to[0], it.to[1]]), F.v([it.to[2], it.to[3]])] : null;
      const want = to ? (dirOf(to[0], to[1]) + (it.rel === 'perp' ? 90 : 0)) % 180 : it.ang;
      const S = straights(ink, F.sq * (it.min || 1.5));
      const ok = S.filter(s => (want == null || dDir(dirOf(s[0], s[1]), want) <= (it.atol || 4))
        && (!it.len || Math.abs(near(F.f(s[0]), F.f(s[1])) - it.len) <= (it.ltol || 0.2))
        && (!it.meet || !to || dSeg(s[0], to[0], to[1]) <= tol || dSeg(s[1], to[0], to[1]) <= tol || cross(s, to))
        && (!it.apart || !to || dLine(s[0], to[0], to[1]) > tol * 2)).length >= (it.need || 1);
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    pair(it, ink, F, tol) {
      const S = straights(ink, F.sq * (it.min || 2));
      let ok = false;
      S.forEach((s, i) => S.forEach((t, j) => {
        if (j <= i) return;
        const d = dDir(dirOf(s[0], s[1]), dirOf(t[0], t[1]));
        if (it.rel === 'perp' ? Math.abs(d - 90) <= (it.atol || 4) : d <= (it.atol || 3) && dLine(t[0], s[0], s[1]) > tol * 2) ok = true;
      }));
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= tol * 1.5) };
    },
    angle(it, ink, F) {
      const S = straights(ink, F.sq * (it.min || 1.5)), j = F.sq * 0.5;
      let ok = false;
      S.forEach((s, i) => S.forEach((t, k) => {
        if (k <= i) return;
        [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(e => {
          if (near(s[e[0]], t[e[1]]) > j) return;
          const v = s[e[0]], a = s[1 - e[0]], b = t[1 - e[1]];
          const g = corners([a, v, b])[1];
          if (Math.abs(g - it.deg) <= (it.atol || 2)) ok = true;
        });
      }));
      return { ok: ok, ex: q => S.some(s => dSeg(q, s[0], s[1]) <= F.sq * 0.4) };
    },
  };
}
function drawKinds3_(g) { const { near, dSeg, dPoly, area, bearing, onDots, straights, rays, polygons, sides, corners, SHAPE } = g;
  return {
    polygon(it, ink, F, tol) {
      const join = F.sq * (it.join || 0.5);
      const all = polygons(ink, F, join).map(p => ({ v: p, f: p.map(F.f) }));
      const good = all.filter(P => {
        const p = P.f, s = sides(p), a = corners(p);
        if (it.n && p.length !== it.n) return false;
        if (it.is && !(SHAPE[it.is] && SHAPE[it.is](p, s, a))) return false;
        if (it.side && !s.every(x => Math.abs(x - it.side) <= (it.ltol || 0.25))) return false;
        if (it.area && Math.abs(area(p) - it.area) > (it.atol || 0.5)) return false;
        if (it.on && !P.v.every(q => onDots(q, it.on, F, tol))) return false;
        if (it.sas) {
          const [l1, l2, g] = it.sas, lt = it.ltol || 0.25;
          /* `sim`: the right shape at any size, where the screen cannot be a ruler -- the two sides' ratio and the angle between them */
          const fits = (x, y) => it.sim ? Math.abs(x / y - l1 / l2) <= 0.06 * l1 / l2 : Math.abs(x - l1) <= lt && Math.abs(y - l2) <= lt;
          if (p.length !== 3 || !p.some((v, i) => {
            const x = s[(i + 2) % 3], y = s[i];
            return Math.abs(a[i] - g) <= 4 && (fits(x, y) || fits(y, x));
          })) return false;
        }
        return true;
      });
      return { ok: good.length >= (it.count || 1), ex: q => all.some(P => dPoly(q, P.v.concat([P.v[0]])) <= tol * 1.5) };
    },
    clock(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const hands = [];
      rays(ink, c, r, 0.3, 0.2).sort((a, b) => b.L - a.L).forEach(h => { if (!hands.some(o => Math.abs(((o.g - h.g + 540) % 360) - 180) < 5)) hands.push(h); });
      const off = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
      const mi = (it.min % 60) * 6, hr = ((it.h % 12) * 30 + it.min * 0.5) % 360;
      const ok = hands.length === 2 && off(hands[0].g, mi) <= (it.mtol || 6) && off(hands[1].g, hr) <= (it.htol || 9) && hands[0].L > hands[1].L * 1.05;
      return { ok: ok, ex: q => near(q, c) <= r * 1.05 };
    },
    dial(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      /* a pointer from the centre, or an arrow outside pointing in: the way of the ink's outer half, read from the centre */
      let P = rays(ink, c, r, 0.35, 0.3).sort((a, b) => b.L - a.L)[0];
      if (!P) {
        const pts = [].concat.apply([], ink.map(s => s.pl)).filter(p => near(p, c) >= r * 0.5 && near(p, c) <= r * 1.6);
        if (!pts.length) return { ok: false, ex: () => false };
        let x = 0, y = 0;
        pts.forEach(p => { const d = near(p, c); x += (p[0] - c[0]) / d; y += (p[1] - c[1]) / d; });
        P = { g: bearing(c, [c[0] + x, c[1] + y]) };
      }
      const g = (P.g - it.a[0] + 360) % 360, span = (it.a[1] - it.a[0] + 360) % 360 || 360;
      const v = it.v[0] + g / span * (it.v[1] - it.v[0]);
      return { ok: Math.abs(v - it.want) <= it.vtol, ex: q => near(q, c) <= r * 1.6 };
    },
    scale(it, ink, F, tol) {
      const a = F.v(it.a), b = F.v(it.b);
      const S = straights(ink, F.sq * 0.4).sort((p, q) => near(q[0], q[1]) - near(p[0], p[1]));
      const dots = ink.filter(s => s.size <= F.sq * 0.6).map(s => [s.c, s.c]);
      const s = S[0] || dots[0];
      if (!s) return { ok: false, ex: () => false };
      const tip = dSeg(s[0], a, b) <= dSeg(s[1], a, b) ? s[0] : s[1];
      const t = ((tip[0] - a[0]) * (b[0] - a[0]) + (tip[1] - a[1]) * (b[1] - a[1])) / (near(a, b) * near(a, b));
      const v = it.v[0] + t * (it.v[1] - it.v[0]);
      return { ok: dSeg(tip, a, b) <= F.sq * 2 && Math.abs(v - it.want) <= it.vtol, ex: () => true };
    },
    pie(it, ink, F) {
      const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
      const g = (it.given || []).slice();
      rays(ink, c, r, 0.18, 0.5).forEach(h => { const b = h.g; if (!g.some(x => Math.abs(((x - b + 540) % 360) - 180) < 3)) g.push(b); });
      g.sort((a, b) => a - b);
      const gaps = g.map((x, i) => ((g[(i + 1) % g.length] - x + 360) % 360) || 360);
      const want = it.sect.slice(), at = it.atol || 2;
      let hit = 0;
      gaps.forEach(d => { const k = want.findIndex(w => Math.abs(w - d) <= at); if (k >= 0) { want.splice(k, 1); hit++; } });
      const ok = it.need ? hit >= it.need : (hit === it.sect.length && gaps.length === it.sect.length);
      return { ok: ok, ex: q => near(q, c) <= r * 1.1 };
    },
  };
}
function drawKinds4_(g) { const { near, dPoly, inside, dirOf, dDir, latSnap, convex, covered, straights, sides } = g;
  return {
    /* a cuboid on dotted paper: its outline is a hexagon whose sides, in dots, go a b c a b c, and a times b times c is its volume */
    cuboid(it, ink, F, tol) {
      const pts = [];
      straights(ink, F.sq * 0.5).forEach(s => s.forEach(p => pts.push(p)));
      const L = it.on && it.on.lat, hull = convex(pts.map(p => L ? latSnap(p, L) : p));
      const ok = (() => {
        if (hull.length !== 6) return false;
        const e = hull.map((p, i) => near(p, hull[(i + 1) % 6]) / F.sq);
        if (!e.every(v => Math.abs(v - Math.round(v)) < 0.15 && Math.round(v) > 0)) return false;
        const n = e.map(Math.round);
        return n[0] === n[3] && n[1] === n[4] && n[2] === n[5] && n[0] * n[1] * n[2] === it.vol
          && hull.every((p, i) => covered(p, hull[(i + 1) % 6], ink, tol));
      })();
      return { ok: ok, ex: q => hull.length > 2 && (inside(q, hull) || dPoly(q, hull.concat([hull[0]])) <= tol * 1.5) };
    },
    /* HISTOGRAM OR BAR CHART: each bar's top, read off the ink; an axis with no numbers (`fx`, `fy`) is scaled from the bars themselves */
    hist(it, ink, F, tol) {
      const base = F.v([0, 0])[1];
      const tops = straights(ink, F.sq * 0.5).filter(s => dDir(dirOf(s[0], s[1]), 0) <= 6 && Math.abs((s[0][1] + s[1][1]) / 2 - base) > F.sq * 0.4)
        .map(s => { const a = Math.min(s[0][0], s[1][0]), b = Math.max(s[0][0], s[1][0]); return { a: a, b: b, y: (s[0][1] + s[1][1]) / 2 }; })
        .sort((p, q) => p.a - q.a);
      /* `seq`: bars whose order and heights are known but not where they stand (a dual bar chart): the heights read left to right */
      if (it.seq) {
        let best = 0;
        it.seq.forEach(h => {
          if (tops.length !== h.length) return;
          const r = h.map((v, i) => (tops[i].y - base) / v).sort((p, q) => p - q), sy = it.fy ? r[r.length >> 1] : F.u[1];
          best = Math.max(best, h.filter((v, i) => Math.abs(base + sy * v - tops[i].y) <= tol).length);
        });
        return { ok: best >= (it.need || it.seq[0].length), ex: q => q[1] <= base + tol };
      }
      const X = it.x, n = X.length - 1;
      let sx = F.u[0], ox = F.o[0];
      if (it.fx && tops.length) { sx = (tops[tops.length - 1].b - tops[0].a) / (X[n] - X[0]); ox = tops[0].a - sx * X[0]; }
      const px = v => ox + sx * v;
      const mine = tops.map(t => X.findIndex((v, i) => i < n && Math.abs(px(v) - t.a) <= tol && Math.abs(px(X[i + 1]) - t.b) <= tol));
      let sy = F.u[1];
      if (it.fy) {
        const r = mine.map((i, k) => i >= 0 && it.h[i] ? (tops[k].y - base) / it.h[i] : null).filter(v => v != null).sort((p, q) => p - q);
        sy = r.length ? r[r.length >> 1] : sy;
      }
      let good = 0;
      mine.forEach((i, k) => { if (i >= 0 && Math.abs(base + sy * it.h[i] - tops[k].y) <= tol) good++; });
      const want = it.only != null ? it.only : n;
      const ok = good >= (it.need || want) && (it.need || tops.length <= want);
      return { ok: ok, ex: q => q[1] <= base + tol && X.some((v, i) => i < n && q[0] >= px(v) - tol && q[0] <= px(X[i + 1]) + tol) };
    },
    /* A BOX PLOT: the box's three upright lines at the quartiles and the median, the whiskers out to the least and greatest -- at whatever height it is drawn */
    box(it, ink, F, tol) {
      const S = straights(ink, F.sq * 0.4), up = S.filter(s => dDir(dirOf(s[0], s[1]), 90) <= 8), across = S.filter(s => dDir(dirOf(s[0], s[1]), 0) <= 8);
      const X = v => F.v([v, 0])[0], v = it.v;
      const atUp = x => up.some(s => Math.abs((s[0][0] + s[1][0]) / 2 - x) <= tol);
      const ends = across.map(s => [Math.min(s[0][0], s[1][0]), Math.max(s[0][0], s[1][0])]);
      const end = x => atUp(x) || ends.some(e => Math.abs(e[0] - x) <= tol || Math.abs(e[1] - x) <= tol);
      const good = [end(X(v[0])), atUp(X(v[1])), atUp(X(v[2])), atUp(X(v[3])), end(X(v[4]))].filter(Boolean).length;
      return { ok: good >= (it.need || 5), ex: q => q[0] >= X(v[0]) - tol * 1.5 && q[0] <= X(v[4]) + tol * 1.5 };
    },
    /* AN INEQUALITY ON A NUMBER LINE: a line from a to b, and at each end a circle, filled where the end is included */
    interval(it, ink, F, tol) {
      const S = straights(ink, F.sq * 1).filter(s => dDir(dirOf(s[0], s[1]), 0) <= 6).sort((p, q) => near(q[0], q[1]) - near(p[0], p[1]));
      if (!S.length) return { ok: false, ex: () => false };
      const L = S[0], xs = [L[0][0], L[1][0]].sort((p, q) => p - q), ya = (L[0][1] + L[1][1]) / 2;
      const A = F.v([it.a, 0])[0], B = F.v([it.b, 0])[0], r = F.sq * 0.9;
      const end = x => {
        const near_ = ink.filter(s => s !== L && Math.abs(s.c[0] - x) <= r && Math.abs(s.c[1] - ya) <= r * 1.5 && s.size <= r * 2.5);
        if (!near_.length) return null;
        const size = Math.max.apply(null, near_.map(s => s.size)), Lsum = near_.reduce((t, s) => t + s.len, 0);
        return Lsum >= 1.2 * Math.PI * Math.max(size, 1) ? 'filled' : 'open';
      };
      const ea = end(A), eb = end(B);
      const at = Math.abs(xs[0] - A) <= tol * 1.6 && Math.abs(xs[1] - B) <= tol * 1.6;
      const circles = it.loose ? !!ea && !!eb : ea === (it.ca ? 'filled' : 'open') && eb === (it.cb ? 'filled' : 'open');
      return { ok: at && circles, ex: q => q[0] >= A - r * 1.5 && q[0] <= B + r * 1.5 && Math.abs(q[1] - ya) <= r * 2 };
    },
  };
}
function drawKinds5_(g) { const { near, dSeg, dPoly, inside, area, polygons } = g;
  return {
    /* AREA: the closed shapes drawn inside a box, their areas added (a pictogram's symbols) */
    area(it, ink, F) {
      const box = it.in.map(F.v), inBox = p => p[0] >= Math.min(box[0][0], box[1][0]) && p[0] <= Math.max(box[0][0], box[1][0]) && p[1] >= Math.min(box[0][1], box[1][1]) && p[1] <= Math.max(box[0][1], box[1][1]);
      const P = polygons(ink, F, F.sq * 0.4).filter(p => p.every(inBox));
      const A = P.reduce((t, p) => t + area(p.map(F.f)), 0);
      return { ok: Math.abs(A - it.want) <= (it.rtol || 0.08) * it.want, ex: inBox };
    },
    /* CONSTRUCTION ARCS: compass curves, near where the construction puts them */
    curves(it, ink, F) {
      const c = it.near ? F.v(it.near) : null, R_ = it.r ? it.r * Math.abs(F.u[0]) : Infinity;
      const C = ink.filter(s => s.segs.length >= 4 && s.len >= F.sq * 0.8 && (!c || s.pl.some(p => near(p, c) <= R_)));
      return { ok: C.length >= (it.n || 2), ex: q => C.some(s => dPoly(q, s.pl) <= F.sq * 0.3) };
    },
    /* A SKETCH: the curve's shape, read in the figure's own axes -- rising or falling, above the axis, where it crosses */
    sketch(it, ink, F, tol) {
      const pts = [].concat.apply([], ink.map(s => s.pl.map(p => F.f(p)))).sort((p, q) => p[0] - q[0]);
      if (pts.length < 4) return { ok: false, ex: () => false };
      const yt = tol / Math.abs(F.u[1]);
      const k = Math.max(1, Math.floor(pts.length / 8)), steps = [];
      for (let i = k; i < pts.length; i += k) steps.push(pts[i][1] - pts[i - k][1]);
      const T = it.test || [];
      const ok = T.every(t => {
        if (t === 'inc') return steps.filter(d => d < -yt).length === 0;
        if (t === 'dec') return steps.filter(d => d > yt).length === 0;
        if (t === 'above') return pts.every(p => p[1] > -yt);
        if (t === 'crossy') { const at = pts.filter(p => Math.abs(p[0]) <= 2 * tol / Math.abs(F.u[0])); return at.length && at.every(p => p[1] > yt); }
        if (t === 'flatleft') { const L = pts.slice(0, Math.max(2, pts.length >> 3)); return L.every(p => Math.abs(p[1]) <= 3 * yt); }
        /* `asym`: a vertical asymptote at each value -- no ink on it, and the curve running away up on its left and down on its right (tan) */
        if (t === 'asym') return (it.asym || []).every(a => { const w = 2 * tol / Math.abs(F.u[0]); return !pts.some(p => Math.abs(p[0] - a) < w * 0.5)
          && pts.some(p => p[0] < a && p[0] > a - 8 * w && p[1] > 3 * yt) && pts.some(p => p[0] > a && p[0] < a + 8 * w && p[1] < -3 * yt); });
        if (t === 'steepright') { const L = pts.slice(-Math.max(2, pts.length >> 3)); return L[L.length - 1][1] - L[0][1] > 4 * yt; }
        return false;
      });
      return { ok: ok, ex: () => true };
    },
    inside(it, ink, F) {
      const P = it.poly.map(F.v);
      let L = 0;
      ink.forEach(s => s.pl.forEach((p, k) => { if (k && inside(p, P) && inside(s.pl[k - 1], P)) L += near(p, s.pl[k - 1]); }));
      return { ok: L >= F.sq * (it.min || 0.5), ex: q => inside(q, P) };
    },
    /* `join` (402): a matching line — one stroke from inside box `a` to inside box `b`, either way. Boxes [x, y, w, h] in figure units, padded by `pad`. */
    join(it, ink, F) {
      const pad = it.pad == null ? 10 : it.pad;
      const box = r => { const p = F.v([r[0], r[1]]), q = F.v([r[0] + r[2], r[1] + r[3]]);
        return [Math.min(p[0], q[0]) - pad, Math.min(p[1], q[1]) - pad, Math.max(p[0], q[0]) + pad, Math.max(p[1], q[1]) + pad]; };
      const A = box(it.a), B = box(it.b), inB = (q, X) => q[0] >= X[0] && q[0] <= X[2] && q[1] >= X[1] && q[1] <= X[3];
      const ca = [(A[0] + A[2]) / 2, (A[1] + A[3]) / 2], cb = [(B[0] + B[2]) / 2, (B[1] + B[3]) / 2];
      const ok = ink.some(s => { const e0 = s.pl[0], e1 = s.pl[s.pl.length - 1]; return (inB(e0, A) && inB(e1, B)) || (inB(e0, B) && inB(e1, A)); });
      const band = Math.max(A[3] - A[1], B[3] - B[1]) / 2;
      return { ok: ok, ex: q => inB(q, A) || inB(q, B) || dSeg(q, ca, cb) <= band };
    },
  };
}
function drawExample_(g) { const { H, R, near, inside, frameOf } = g;
  /* A RIGHT DRAWING OF THE ANSWER, as strokes the pen would store: the row's own `eg` (figure units) or one made from its items. The checks mark it full and a near miss less. */
  function example(spec, fig) {
    if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch (e) { return []; } }
    const F = frameOf(spec, fig), vb = F.vb, out = [];
    const put = pl => out.push([].concat.apply([], pl.map(p => [Math.round((p[0] - vb[0]) / vb[2] * 3400) / 10, Math.round((p[1] - vb[1]) / vb[3] * 3400) / 10])));
    const at = (c, g, r) => [c[0] + r * Math.sin(g * R), c[1] - r * Math.cos(g * R)];
    const zig = poly => { const m = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
      const k = poly.map(p => [m[0] + (p[0] - m[0]) * 0.6, m[1] + (p[1] - m[1]) * 0.6]); put(k.concat([k[0], k[2 % k.length], m, k[1 % k.length]])); };
    if (spec.eg) { spec.eg.forEach(pl => put(pl.map(F.v))); return out; }
    const one = it => {
      const q = F.sq;
      if (it.k === 'any') return one(it.of[0]);
      if (it.k === 'pts') it.at.map(F.v).forEach(p => { put([[p[0] - q * 0.2, p[1] - q * 0.2], [p[0] + q * 0.2, p[1] + q * 0.2]]); put([[p[0] + q * 0.2, p[1] - q * 0.2], [p[0] - q * 0.2, p[1] + q * 0.2]]); });
      if (it.k === 'segs') {
        (it.at || []).forEach(t => put([[t[0], t[1]], [t[2], t[3]]].map(F.v)));
        if (it.poly) put(it.poly.concat([it.poly[0]]).map(F.v));
        if (it.path) put(it.path.map(F.v));
      }
      if (it.k === 'segs' && it.head && it.at && it.at[0]) {
        const t = it.at[0], a = F.v([t[0], t[1]]), b = F.v([t[2], t[3]]), L = H(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        put([[b[0] - u[0] * q * 0.8 - u[1] * q * 0.5, b[1] - u[1] * q * 0.8 + u[0] * q * 0.5], b, [b[0] - u[0] * q * 0.8 + u[1] * q * 0.5, b[1] - u[1] * q * 0.8 - u[0] * q * 0.5]]);
      }
      if (it.k === 'hist') {
        /* an axis with no numbers: drawn to a scale that fills most of the grid */
        const G = F.grid, W = G ? G.xs[G.xs.length - 1] - G.xs[0] : vb[2], Hh = G ? G.ys[G.ys.length - 1] - G.ys[0] : vb[3];
        const hs = it.seq ? it.seq[0] : it.h, top = Math.max.apply(null, hs.filter(Boolean));
        const ky = it.fy ? Math.round(Hh * 0.7 / top / Math.abs(F.u[1]) * 4) / 4 || 1 : 1;
        const X = it.seq ? hs.map((h, i) => [i * 2 + 1, i * 2 + 2]) : it.x.slice(0, -1).map((x, i) => [x, it.x[i + 1]]);
        const x0 = it.seq ? 0 : it.x[0], span = it.seq ? hs.length * 2 + 1 : it.x[it.x.length - 1] - x0;
        const kx = it.fx || it.seq ? Math.max(1, Math.floor(W * 0.85 / span / Math.abs(F.u[0]))) : 1, ox = it.fx || it.seq ? 1 - x0 * kx : 0;
        hs.forEach((h, i) => { if (h) put([[X[i][0] * kx + ox, 0], [X[i][0] * kx + ox, h * ky], [X[i][1] * kx + ox, h * ky], [X[i][1] * kx + ox, 0]].map(F.v)); });
      }
      if (it.k === 'box') {
        const v = it.v, y = F.f([0, F.vb[1] + F.vb[3] * 0.35])[1], h = F.sq * 0.8 / Math.abs(F.u[1]);
        put([[v[0], y], [v[1], y]].map(F.v)); put([[v[3], y], [v[4], y]].map(F.v));
        put([[v[1], y - h], [v[1], y + h], [v[3], y + h], [v[3], y - h], [v[1], y - h]].map(F.v)); put([[v[2], y - h], [v[2], y + h]].map(F.v));
      }
      if (it.k === 'interval') {
        const a = F.v([it.a, 0]), b = F.v([it.b, 0]), y = it.y != null ? F.v([0, it.y])[1] : a[1] - q * 1.5, r = q * 0.35;
        put([[a[0] + r, y], [b[0] - r, y]]);
        [[a, it.ca], [b, it.cb]].forEach(e => { const c = [e[0][0], y], ring = []; for (let g = 0; g <= 360; g += 30) ring.push(at(c, g, r)); put(ring); if (e[1]) { put(ring.map(p => [c[0] + (p[0] - c[0]) * 0.5, c[1] + (p[1] - c[1]) * 0.5])); put([at(c, 0, r * 0.8), at(c, 180, r * 0.8)]); put([at(c, 90, r * 0.8), at(c, 270, r * 0.8)]); put(ring.map(p => [c[0] + (p[0] - c[0]) * 0.75, c[1] + (p[1] - c[1]) * 0.75])); } });
      }
      if (it.k === 'line') put(it.thru.map(F.v));
      if (it.k === 'join') put([it.a, it.b].map(r => F.v([r[0] + r[2] / 2, r[1] + r[3] / 2])));
      if (it.k === 'cells') {
        const C = (it.cells || []).concat((it.rects || []).map(r => [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]]));
        const pick = it.set ? it.set[0] : C.map((c, i) => i).filter(i => (it.given || []).indexOf(i) === -1).slice(0, it.need);
        pick.forEach(i => { const c = C[i].map(F.v); zig(c); zig(c); });
      }
      if (it.k === 'radius') { const c = F.v(it.c), r = Math.abs(it.r * F.u[0]); put(it.dia ? [at(c, 60, r), at(c, 240, r)] : [c, at(c, 60, r)]); }
      if (it.k === 'dir' && it.to) {
        const a = F.v([it.to[0], it.to[1]]), b = F.v([it.to[2], it.to[3]]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const d = [b[0] - a[0], b[1] - a[1]], L = H(d[0], d[1]), u = it.rel === 'perp' ? [-d[1] / L, d[0] / L] : [d[0] / L, d[1] / L];
        const o = it.rel === 'perp' ? [0, 0] : [-d[1] / L * q * 3, d[0] / L * q * 3], h = q * 2.5;
        put([[m[0] + o[0] - u[0] * h, m[1] + o[1] - u[1] * h], [m[0] + o[0] + u[0] * h, m[1] + o[1] + u[1] * h]]);
      }
      if (it.k === 'clock') { const c = F.v(it.c), r = Math.abs(it.r * F.u[0]); put([c, at(c, (it.min % 60) * 6, r * 0.8)]); put([c, at(c, ((it.h % 12) * 30 + it.min * 0.5) % 360, r * 0.5)]); }
      if (it.k === 'dial') {
        const c = F.v(it.c), r = Math.abs(it.r * F.u[0]), span = (it.a[1] - it.a[0] + 360) % 360 || 360;
        const g = it.a[0] + (it.want - it.v[0]) / (it.v[1] - it.v[0]) * span;
        put(it.out ? [at(c, g, r * 1.12), at(c, g, r)] : [c, at(c, g, r * 0.9)]);
      }
      if (it.k === 'scale') {
        const a = F.v(it.a), b = F.v(it.b), t = (it.want - it.v[0]) / (it.v[1] - it.v[0]), p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        put([[p[0], p[1] - q * 1.5], p]);
      }
      if (it.k === 'pie') {
        const c = F.v(it.c), r = Math.abs(it.r * F.u[0]);
        let g = (it.given || [0])[0];
        it.sect.slice(0, -1).forEach(d => { g += d; put([c, at(c, g, r)]); });
      }
      if (it.k === 'inside') zig(it.poly.map(F.v));
    };
    spec.items.forEach(one);
    return out;
  }
  return example;
}
/* THE MARKER, pure: strokes in the pen's 340 by 340 space, the row's `draw_answer`, the figure. Distances are in the picture's own units, tolerances in grid squares. */
function drawMarker_() {
  const g = drawGeom_(); [drawFrame_, drawInk_, drawShapes_].forEach(f => Object.assign(g, f(g)));
  const { frameOf, inkOf, samples, polygons } = g;
  /* EACH KIND: is it there, and which ink does it account for (the rest is stray). */
  const KIND = Object.assign({}, drawKinds1_(g), drawKinds2_(g), drawKinds3_(g), drawKinds4_(g), drawKinds5_(g));
  function one(it, ink, F, spec) {
    const tol = F.sq * (it.tol || spec.tol || 0.3);
    if (it.k === 'any') {
      const rs = it.of.map(o => one(o, ink, F, spec)), hit = rs.find(r => r.ok);
      return hit || { ok: false, ex: q => rs.some(r => r.ex(q)) };
    }
    const f = KIND[it.k];
    return f ? f(it, ink, F, tol) : { ok: false, ex: () => false };
  }
  /* `draw_answer`: `{ frame?, tol?, loose?, items: [{ k, m, ..., or }] }`. An item's `or` is what the scheme gives fewer marks for. Ink that no item accounts for costs a mark. */
  function mark(strokes, spec, fig, marks) {
    if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch (e) { return null; } }
    if (!spec || !Array.isArray(spec.items)) return null;
    const F = frameOf(spec, fig), ink = inkOf(strokes, F);
    const total = spec.items.reduce((s, it) => s + (it.m == null ? 1 : it.m), 0);
    const of = Math.max(1, Number(marks) || spec.marks || total);
    if (!ink.length) return { got: 0, of: of, each: [], stray: 0, empty: true };
    let got = 0;
    const exs = [], each = [];
    spec.items.forEach(it => {
      let cur = it, r = one(cur, ink, F, spec);
      exs.push(r.ex);
      while (!r.ok && cur.or) { cur = cur.or; r = one(cur, ink, F, spec); exs.push(r.ex); }
      each.push(r.ok ? (cur.m == null ? 1 : cur.m) : 0);
      if (r.ok) got += cur.m == null ? 1 : cur.m;
    });
    let all = 0, lost = 0;
    ink.forEach(s => {
      const pts = s.pl.length === 1 ? s.pl : [].concat.apply([], s.pl.slice(1).map((q, i) => samples(s.pl[i], q, F.sq * 0.25).slice(1)));
      pts.forEach(p => { all++; if (!exs.some(e => e(p))) lost++; });
    });
    const stray = all ? lost / all : 0;
    if (!spec.loose && stray > 0.12 && lost * F.sq * 0.25 > F.sq) got = Math.max(0, got - 1);
    return { got: Math.min(of, Math.floor(got * of / Math.max(1, total) + 1e-9)), of: of, each: each, stray: Math.round(stray * 100) / 100 };
  }
  const example = drawExample_(g);
  return { mark: mark, frameOf: frameOf, inkOf: inkOf, polygons: polygons, example: example };
}
const DRAW_MARK = drawMarker_();
/* CHECK: the strokes read in the figure's own units and held against `draw_answer` (366) -- a verdict and marks, as a typed answer gets */
function padCheck_(row, pad) {
  const out = row && row.querySelector('.qp-verdict');
  if (!row || !pad || !out) return null;
  const marks = padRead_(pad.getAttribute('data-k')), say = padSay_(marks);
  row.classList.remove('is-right', 'is-near');
  if (partReady_('draw', say)) { out.textContent = partReady_('draw', say); return null; }
  const art = pad.querySelector('.qpad-art > svg:first-child');
  const r = DRAW_MARK.mark(marks, row.getAttribute('data-draw'), drawFig_(art ? (art.__src || art.outerHTML) : ''), row.getAttribute('data-marks'));
  if (!r) { out.textContent = 'Could not mark it \u2014 try again'; return null; }
  const v = r.of === 1 ? (r.got ? 'right' : 'wrong') : 'rule:' + r.got + '/' + r.of;
  row.classList.add(r.got >= r.of ? 'is-right' : 'is-near');
  out.textContent = padSaid_(subSay_(v).text);
  subRecord_(row.getAttribute('data-k'), say, v);
  if (typeof answersPush_ === 'function') answersPush_(true);
  return r;
}
on('pad-check', el => { const row = el.closest('.qpad-send'); padCheck_(row, padOfRow_(row)); });
/* ---------- ARMING ONE PAD, EVERY PART OF IT TOGETHER § */
function padArm_(pad, on) {
  if (!pad) return;
  if (!on && pad.getAttribute('data-k')) padZoomOff_(pad.getAttribute('data-k'));
  pad.classList.toggle('is-drawing', !!on);
  /* AND THE TOOL IN HAND, lit whether or not this pad was the last touched -- the rule `padBar_` draws by. */
  const tool = padToolNow_(pad);
  /* the tool in hand lit in the card's tool row; the protractor is lit while it lies on the page (458) */
  qtLight_(pad.closest('.qcard'), on ? tool : '');
}

/* ---------- THE PEN § */
let PAD_ON = '';                  // the key of the pad currently taking the pen, '' for none
let PAD_ST = null;                // the stroke being drawn, already in the shape it is stored in
let PAD_GO = null;                // the drag behind it: which tool, on which ink, measured how, from where
/* WHICH TOOL EACH PAD IS HOLDING, by the pad's key, for the visit: a card is rebuilt on every repaint
   and a tool left on the element would be dropped with it, the `PAD_ON` argument one line up. */
const PAD_TOOL = new Map();
/* WHAT CLEAR LAST TOOK OFF EACH PAD, by key, for the visit -- so Undo straight after it puts the marks back. § */
const PAD_CLEARED = new Map();
const PAD_CLEARED_MARK = new Map();

/* THE TOOL A DRAG ON THIS PAD USES: § */
function padToolNow_(pad) {
  const t = (pad && PAD_TOOL.get(pad.getAttribute('data-k') || '')) || 'pen';
  /* the protractor is laid on the page, never drawn with (458) */
  return t !== 'pen' && t !== 'protractor' && PAD_TOOLS.indexOf(t) !== -1 ? t : 'pen';
}

/* ---------- SCREEN PIXELS, NOT PICTURE UNITS, FOR ANYTHING ROUND § */
const PAD_MIN_PX = 4;                     // shorter than this a line or a radius is a slip, not a mark
/* AND LONGER FOR ONE STROKE: § */
const padMinOf_ = g => (!g ? PAD_MIN_PX : g.refused && !g.mine ? Infinity : g.min || PAD_MIN_PX);
const PAD_SWING_PX = 16;                  // nearer the point than this, its angle is noise
const PAD_ARC_MIN = Math.PI / 6;          // a swing of 30 degrees or more is an arc rather than a circle

/* A RING OR AN ARC AS THE POLYLINE THE PEN STORES: § */
function padArc_(c, R, sx, sy, a0, span) {
  const full = Math.abs(span) >= 2 * Math.PI;
  if (full) span = 2 * Math.PI;
  const n = Math.max(8, Math.min(120, Math.ceil(Math.abs(span) * R / 4)));
  const out = [];
  const put = (x, y) => {
    if (out.length && out[out.length - 2] === x && out[out.length - 1] === y) return;
    out.push(x, y);
  };
  for (let i = 0; i < n; i++) {
    const t = a0 + span * i / n;
    put(Math.round(c[0] + R * Math.cos(t) / sx), Math.round(c[1] + R * Math.sin(t) / sy));
  }
  if (full) put(out[0], out[1]);
  else put(Math.round(c[0] + R * Math.cos(a0 + span) / sx), Math.round(c[1] + R * Math.sin(a0 + span) / sy));
  return out;
}

/* ---------- THE COMPASS: THE POINT WHERE YOU PRESS, THE WIDTH WHERE YOU DRAG TO, THE ARC YOU SWING § */
function padSwing_(g, at) {
  const dx = (at[0] - g.from[0]) * g.sx, dy = (at[1] - g.from[1]) * g.sy;
  const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  if (r >= Math.max(PAD_SWING_PX, g.rMax * 0.6)) {
    if (g.a === null) g.a0 = a;
    else {
      let d = a - g.a;
      if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
      g.sweep += d;
    }
    g.a = a;
  }
  g.rMax = Math.max(g.rMax, r);
  if (!g.held) { g.r = r; if (Math.abs(g.sweep) >= PAD_ARC_MIN) g.held = true; }
  const arc = g.held && Math.abs(g.sweep) >= PAD_ARC_MIN && Math.abs(g.sweep) < 2 * Math.PI;
  /* THE PENCIL'S END, where the radius line is drawn to: on the ring, in the finger's direction. */
  g.tip = [g.from[0] + g.r * Math.cos(a) / g.sx, g.from[1] + g.r * Math.sin(a) / g.sy];
  return padArc_(g.from, g.r, g.sx, g.sy, arc ? g.a0 : a, arc ? g.sweep : 2 * Math.PI);
}
