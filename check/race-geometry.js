#!/usr/bin/env node
/* node check/race-geometry.js [map.json] — THE COLLIERS WOOD MAP'S OWN GEOMETRY (511), read from data/race-map.json. */
/* Proves: one road surface (no overlap, one winding, no sliver holes), every centre line on it with no 2 m gap, junctions covered. */
/* And: road and pavement apart, OSM's buildings by count and area with roofs covering them, racer.js building its tiles (511). */
'use strict';
require('./quiet');
const fs = require('fs'), path = require('path'), vm = require('vm');

const FILE = process.argv[2] || path.join(__dirname, '..', 'data', 'race-map.json');
const bad = [], info = [];
const fail = (rule, msg) => bad.push(rule + ' — ' + msg);
let map;
try { map = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { console.log('COULD NOT RUN — ' + FILE + ': ' + e.message); process.exit(1); }
if (!Array.isArray(map.surf) || !map.surf.length) { console.log('COULD NOT RUN — ' + FILE + ' has no `surf`: run tools/race_map.py'); process.exit(1); }

const layer = name => {
  const L = map.surf.find(l => l[0] === name);
  if (!L) return null;
  const v = L[1], t = L[2], P = [];
  for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i] / 10, v[i + 1] / 10]);
  return { P, t };
};
const area2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

/* A TRIANGLE INDEX on a 10 m hash, and how many triangles of a layer cover a point (within 10 cm of an edge is the 5 cm grid's tolerance, not counted). */
function indexOf(L) {
  const H = new Map(), C = 10;
  for (let k = 0; k + 2 < L.t.length; k += 3) {
    const a = L.P[L.t[k]], b = L.P[L.t[k + 1]], c = L.P[L.t[k + 2]];
    for (let x = Math.floor(Math.min(a[0], b[0], c[0]) / C); x <= Math.floor(Math.max(a[0], b[0], c[0]) / C); x++)
      for (let y = Math.floor(Math.min(a[1], b[1], c[1]) / C); y <= Math.floor(Math.max(a[1], b[1], c[1]) / C); y++) {
        const key = x * 100003 + y;
        if (!H.has(key)) H.set(key, []);
        H.get(key).push(k);
      }
  }
  const edgeD = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
    return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
  };
  return {
    cover(p, strict) {
      const list = H.get(Math.floor(p[0] / C) * 100003 + Math.floor(p[1] / C)) || [];
      let n = 0;
      for (const k of list) {
        const a = L.P[L.t[k]], b = L.P[L.t[k + 1]], c = L.P[L.t[k + 2]];
        const s = Math.sign(area2(a, b, c)), d1 = area2(a, b, p) * s, d2 = area2(b, c, p) * s, d3 = area2(c, a, p) * s;
        if (d1 >= 0 && d2 >= 0 && d3 >= 0) {
          if (strict && Math.min(edgeD(p, a, b), edgeD(p, b, c), edgeD(p, c, a)) < 0.1) continue;
          n++;
        }
      }
      return n;
    },
  };
}

const road = layer('road'), pave = layer('pave');
if (!road) { console.log('COULD NOT RUN — no road layer in ' + FILE); process.exit(1); }
const R = indexOf(road);

/* ONE WINDING, AND A PROPER SURFACE: every triangle counter-clockwise, every edge used at most once each way. */
{
  let cw = 0, tiny = 0;
  const dir = new Map();
  for (let k = 0; k + 2 < road.t.length; k += 3) {
    const ids = [road.t[k], road.t[k + 1], road.t[k + 2]], a2 = area2(road.P[ids[0]], road.P[ids[1]], road.P[ids[2]]);
    if (a2 < 0) cw++;
    if (Math.abs(a2) < 1e-4) tiny++;
    for (let e = 0; e < 3; e++) { const key = ids[e] + '>' + ids[(e + 1) % 3]; dir.set(key, (dir.get(key) || 0) + 1); }
  }
  if (cw) fail('one winding', cw + ' road triangles are clockwise');
  if (tiny) fail('no degenerate triangles', tiny + ' road triangles have no area');
  const twice = [...dir.values()].filter(n => n > 1).length;
  if (twice) fail('one surface', twice + ' road edges are used twice in one direction: two triangles fold over each other');
  /* THE HOLES: boundary edges (used once, never back) chained into loops; a clockwise loop is a hole, and one under 1 m² is a sliver. */
  const next = new Map();
  dir.forEach((n, key) => { const [a, b] = key.split('>'); if (!dir.has(b + '>' + a)) next.set(a, b); });
  const seen = new Set();
  let holes = 0, slivers = [];
  next.forEach((b0, a0) => {
    if (seen.has(a0)) return;
    const loop = [];
    let a = a0;
    for (let guard = 0; guard < 1e6 && !seen.has(a) && next.has(a); guard++) { seen.add(a); loop.push(+a); a = next.get(a); }
    if (loop.length < 3) return;
    let s = 0;
    for (let i = 0; i < loop.length; i++) { const p = road.P[loop[i]], q = road.P[loop[(i + 1) % loop.length]]; s += p[0] * q[1] - q[0] * p[1]; }
    if (s < 0) { holes++; if (-s / 2 < 1) slivers.push(road.P[loop[0]].map(v => v.toFixed(1)).join(',') + ' ' + (-s / 2).toFixed(2) + ' m²'); }
  });
  if (slivers.length) fail('no slivers', slivers.length + ' holes in the road under 1 m², at ' + slivers.slice(0, 5).join('; '));
  info.push(road.t.length / 3 + ' road triangles, ' + holes + ' islands and blocks');
}

/* NO OVERLAP: a point every metre over the map, covered by at most one road triangle (and never road and pavement both). */
{
  const P = pave ? indexOf(pave) : null;
  const xs = road.P.map(p => p[0]), ys = road.P.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let over = 0, both = 0, on = 0, firstOver = '', firstBoth = '';
  for (let x = x0 + 0.37; x < x1; x += 1) for (let y = y0 + 0.61; y < y1; y += 1) {
    const n = R.cover([x, y], true);
    if (n) on++;
    if (n > 1) { over++; if (!firstOver) firstOver = x.toFixed(1) + ',' + y.toFixed(1); }
    if (n && P && P.cover([x, y], true)) { both++; if (!firstBoth) firstBoth = x.toFixed(1) + ',' + y.toFixed(1); }
  }
  if (over) fail('no overlapping triangles', over + ' m² of road covered twice, first at ' + firstOver);
  if (both > 2) fail('road and pavement apart', both + ' m² are both road and pavement, first at ' + firstBoth);
  info.push('about ' + on + ' m² of road, sampled every metre');
}

/* EVERY ROAD ON THE SURFACE: its centre line sampled every 0.5 m inside the box; a run off the surface of 2 m is a gap. */
{
  const px = [], py = [];
  for (let i = 0; i + 2 < map.pts.length; i += 3) { px.push(map.pts[i] / 10); py.push(map.pts[i + 1] / 10); }
  const g = map.grid, hx = Math.abs(g.x0 / 10) - 0.5, hy = Math.abs(g.y0 / 10) - 0.5;
  let gaps = [], len = 0;
  map.roads.forEach(r => {
    const idx = r[5];
    let off = 0;
    for (let k = 0; k + 1 < idx.length; k++) {
      const a = idx[k], b = idx[k + 1], d = Math.hypot(px[b] - px[a], py[b] - py[a]);
      for (let s = 0; s < d; s += 0.5) {
        const p = [px[a] + (px[b] - px[a]) * s / d, py[a] + (py[b] - py[a]) * s / d];
        if (Math.abs(p[0]) > hx || Math.abs(p[1]) > hy) { off = 0; continue; }
        len += 0.5;
        if (R.cover(p, false)) off = 0;
        else if ((off += 0.5) === 2) gaps.push((r[0] || r[1]) + ' at ' + p.map(v => v.toFixed(1)).join(','));
      }
    }
  });
  if (gaps.length) fail('no gaps', gaps.length + ' gaps of 2 m or more on a road\'s centre line: ' + gaps.slice(0, 6).join('; '));
  /* EVERY JUNCTION: its node, and a point 1 m out along each road that meets there, on the surface. */
  const meet = new Map();
  map.roads.forEach(r => r[5].forEach((i, k) => {
    const n = r[5][k + 1] !== undefined ? r[5][k + 1] : r[5][k - 1];
    if (!meet.has(i)) meet.set(i, []);
    meet.get(i).push(n);
  }));
  let open = [];
  (map.junctions || []).forEach(j => {
    if (Math.abs(px[j]) > hx - 3 || Math.abs(py[j]) > hy - 3) return;
    const ok = R.cover([px[j], py[j]], false) && (meet.get(j) || []).every(n => {
      const d = Math.hypot(px[n] - px[j], py[n] - py[j]) || 1;
      return R.cover([px[j] + (px[n] - px[j]) / d, py[j] + (py[n] - py[j]) / d], false);
    });
    if (!ok) open.push(px[j].toFixed(1) + ',' + py[j].toFixed(1));
  });
  if (!(map.junctions || []).length) fail('junctions', 'the map lists no junctions');
  if (open.length) fail('junctions covered', open.length + ' junctions are not on the surface: ' + open.slice(0, 6).join('; '));
  info.push(Math.round(len / 1000) + ' km of centre line, ' + (map.junctions || []).length + ' junctions');
}

/* BUILDINGS: as many as OSM has in the box and as much floor, and every roof's triangles covering its footprint. */
{
  const st = map.stats || {}, B = map.bld || [];
  const ringArea = c => { let s = 0; for (let i = 0; i + 1 < c.length; i += 2) { const j = (i + 2) % c.length; s += c[i] * c[j + 1] - c[j] * c[i + 1]; } return Math.abs(s) / 200; };
  const total = B.reduce((s, b) => s + ringArea(b[1]), 0);
  if (!st.osm_buildings) fail('buildings', 'the map does not say how many buildings OSM had (stats.osm_buildings)');
  else {
    if (Math.abs(B.length - st.osm_buildings) > st.osm_buildings * 0.01) fail('buildings', B.length + ' buildings, OSM had ' + st.osm_buildings);
    if (Math.abs(total - st.osm_building_m2) > st.osm_building_m2 * 0.02) fail('footprints', Math.round(total) + ' m² of footprint, OSM had ' + st.osm_building_m2);
  }
  let bare = 0, short = [];
  B.forEach((b, k) => {
    const all = b[1].concat(b[4] || []), t = b[5] || [];
    if (!t.length) { bare++; return; }
    let s = 0;
    for (let i = 0; i + 2 < t.length; i += 3) {
      const p = j => [all[2 * j] / 10, all[2 * j + 1] / 10];
      s += Math.abs(area2(p(t[i]), p(t[i + 1]), p(t[i + 2]))) / 2;
    }
    const a = ringArea(b[1]);
    if (Math.abs(s - a) > Math.max(0.5, a * 0.03)) short.push(k + ' (' + s.toFixed(1) + ' of ' + a.toFixed(1) + ' m²)');
  });
  if (bare) fail('roofs', bare + ' buildings have no roof triangles');
  if (short.length) fail('roofs cover', short.length + ' roofs do not cover their footprint: ' + short.slice(0, 5).join(', '));
  info.push(B.length + ' buildings, ' + Math.round(total) + ' m² (OSM ' + st.osm_buildings + ', ' + st.osm_building_m2 + ' m²)');
}

/* THE RENDERER'S OWN BUILD: racer.js in a bare context makes the world, every layer in tiles, and says how long it took. */
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'racer.js'), 'utf8');
  const ctx = { console, Math, Map, Set, JSON, Float32Array, Float64Array, Int32Array, Uint8Array, Array, Object, Number, String,
    performance: { now: () => Number(process.hrtime.bigint()) / 1e6 }, localStorage: { getItem: () => null, setItem() {} },
    document: { addEventListener() {}, querySelectorAll: () => [] }, window: {}, on() {}, $: () => null, Date };
  vm.createContext(ctx);
  try {
    vm.runInContext(src + '\n;this.__w = raceWorld_;', ctx);
    const t0 = ctx.performance.now(), W = ctx.__w(map), ms = ctx.performance.now() - t0;
    const T = W.mesh.tiles || {};
    ['ground', 'road', 'pave', 'mark', 'bld'].forEach(k => { if (!(T[k] || []).length) fail('mesh', 'no ' + k + ' tiles in the mesh'); });
    if (!W.route || W.route.length < 10) fail('the loop', 'the race loop has ' + (W.route || []).length + ' points');
    if (W.mesh.data.some(v => !Number.isFinite(v))) fail('mesh', 'a vertex is not a number');
    info.push('racer.js world in ' + Math.round(ms) + ' ms, ' + W.mesh.data.length / 6 + ' vertices in ' + Object.values(T).reduce((s, l) => s + l.length, 0) + ' tiles');
  } catch (e) { fail('mesh', 'racer.js could not build the world: ' + e.message); }
}

if (bad.length) { console.log('FAILED — the racer map\'s geometry (' + path.basename(FILE) + '):\n  ' + bad.join('\n  ') + '\n  ' + info.join('; ')); process.exit(1); }
console.log('OK — the racer map: one road surface, no overlaps, no gaps, junctions covered; ' + info.join('; '));
