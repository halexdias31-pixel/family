/* @family. — racer.js THE COLLIERS WOOD RACER (426): OSM streets at DEM heights, driven in WebGL. */
/* The map is built by the backend's `buildRaceMap_` and fetched from `?race=1`; until then data/race-map.json plays (464). x metres east, y north, h above sea. */

/* THE LOOP, BY ROAD NAME: each name's middle is a waypoint, visited in order round their centre. Names OSM may not have
   are skipped; with fewer than three the loop goes round the map's major roads instead. */
const RACE_ROUTE = ['High Street Colliers Wood', 'Christchurch Road', 'Merantun Way', 'Merton High Street'];
const RACE_GATE_M = 110;          // a checkpoint every 110 m along the loop
const RACE_DT = 1 / 60;           // the physics step, seconds
const RACE_G = 9.81;
/* The scene's own colours (sky, grass, asphalt, brick); the HUD's are the app's tokens, in style.css. */
const RACE_COL = {
  sky: [0.62, 0.78, 0.9], grass: [0.36, 0.55, 0.3], road: [0.27, 0.27, 0.29], kerb: [0.6, 0.6, 0.58],
  line: [0.92, 0.92, 0.88], water: [0.25, 0.45, 0.62], roof: [0.38, 0.33, 0.31],
  walls: [[0.62, 0.36, 0.27], [0.72, 0.56, 0.42], [0.84, 0.8, 0.72], [0.55, 0.53, 0.52], [0.66, 0.44, 0.33]],
  /* COLLIERS WOOD'S OWN (500): London stock and red brick terraces, white render, pale-brick flats, grey retail sheds,
     the station's Portland stone, the church's ragstone; slate roofs on houses, flat grey ones on the rest. */
  kinds: { house: [[0.72, 0.6, 0.42], [0.6, 0.33, 0.25], [0.86, 0.84, 0.8], [0.66, 0.52, 0.38], [0.55, 0.3, 0.24]],
    flat: [[0.78, 0.72, 0.6], [0.7, 0.7, 0.7], [0.62, 0.42, 0.32]], shop: [[0.62, 0.64, 0.66], [0.78, 0.78, 0.76], [0.5, 0.52, 0.56]],
    ind: [[0.56, 0.58, 0.6], [0.66, 0.62, 0.55]], station: [[0.86, 0.83, 0.73]], church: [[0.56, 0.54, 0.5]] },
  slate: [0.3, 0.32, 0.36], flatroof: [0.48, 0.48, 0.47],
  areas: { res: [0.45, 0.52, 0.38], ind: [0.5, 0.49, 0.47], retail: [0.56, 0.55, 0.53], lot: [0.4, 0.4, 0.41],
    park: [0.33, 0.58, 0.27], wood: [0.2, 0.4, 0.2], pitch: [0.4, 0.66, 0.32], water: [0.25, 0.45, 0.62] },
  /* The ground's layers, bottom to top (511): one road surface, pavement and kerb where OSM has a footway, white markings. */
  surf: { res: [0.45, 0.52, 0.38], ind: [0.5, 0.49, 0.47], retail: [0.56, 0.55, 0.53], lot: [0.4, 0.4, 0.41], park: [0.33, 0.58, 0.27],
    wood: [0.2, 0.4, 0.2], pitch: [0.4, 0.66, 0.32], water: [0.25, 0.45, 0.62], rail: [0.45, 0.41, 0.37], rails: [0.62, 0.62, 0.64],
    pave: [0.62, 0.61, 0.58], kerb: [0.78, 0.77, 0.74], road: [0.27, 0.27, 0.29], mark: [0.92, 0.92, 0.88] },
  roundel: [0.86, 0.1, 0.12], bar: [0.0, 0.1, 0.53], sign: [0.95, 0.95, 0.92],
  car: [0.85, 0.66, 0.16], glass: [0.12, 0.14, 0.18], tyre: [0.08, 0.08, 0.08], gate: [0.95, 0.74, 0.2],
};
const RACE_SUN = (() => { const v = [0.45, 0.8, 0.35], l = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / l); })();

const RACE = {
  map: null, world: null, built: null, asking: null, err: '', building: null,
  gl: null, running: false, raf: 0, last: 0, acc: 0, hudAt: 0,
  keys: {}, touch: {},
  car: { x: 0, y: 0, th: 0, v: 0, h: 0, pitch: 0, steer: 0 },
  cam: null,
  lap: { next: 1, start: 0, paused: 0, best: 0, last: 0, laps: 0 },
};
/* For the journeys: `RACE` is a const, which a second evaluation cannot reach. */
function racer_() { return RACE; }

/* ---------- THE MAP, ASKED FOR ONCE ---------- */
function raceFetch_() {
  if (RACE.map || RACE.asking) return RACE.asking;
  RACE.err = '';
  RACE.asking = fetch(API + '?race=1', { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      RACE.built = !!(d && d.built && d.race);
      /* A BACKEND MAP WITHOUT PARKS AND LANDMARKS loses to the shipped Colliers Wood that has them (500). */
      if (RACE.built && Array.isArray(d.race.areas)) { raceAdopt_(d.race); return; }
      if (RACE.built) return raceShipped_().then(() => { if (!RACE.map || RACE.map.practice || !RACE.map.areas) raceAdopt_(d.race); }, () => raceAdopt_(d.race));
      if (d && d.error) RACE.err = String(d.error);
      return raceShipped_();
    }, err => { RACE.err = 'The map could not be loaded — ' + why_(err); return raceShipped_(); })
    .catch(err => { RACE.err = RACE.err || 'The map could not be loaded — ' + why_(err); })
    .then(() => { RACE.asking = null; racePaint_(); raceAutoBuild_(); });
  return RACE.asking;
}

/* NOTHING BUILT IS NEVER AN EMPTY CARD (464): the repository's map — practice streets, or Colliers Wood once tools/race_map.py has run. */
function raceShipped_() {
  return fetch(RACE_SHIPPED, { cache: 'no-cache' }).then(r => r.json()).then(m => {
    if (m && Array.isArray(m.pts) && m.pts.length && Array.isArray(m.roads) && m.roads.length) raceAdopt_(m);
  });
}
const RACE_SHIPPED = 'data/race-map.json';

/* AN ADMIN'S FIRST VISIT BUILDS THE REAL MAP by itself, once a day per device, while the shipped one plays. */
function raceAutoBuild_() {
  if (RACE.built || RACE.building || RACE.autoAsked || (RACE.map && RACE.map.shipped && RACE.map.areas) || !(typeof isAdmin === 'function' && isAdmin())) return;
  RACE.autoAsked = true;
  let last = 0;
  try { last = Number(localStorage.getItem('race-autobuild')) || 0; } catch (e) {}
  if (Date.now() - last < 24 * 3600 * 1000) return;
  try { localStorage.setItem('race-autobuild', String(Date.now())); } catch (e) {}
  raceBuildNow_();
}

function raceAdopt_(map) {
  RACE.map = map;
  RACE.world = raceWorld_(map);
  raceReset_();
  /* A NEW WORLD IS A NEW CANVAS: `raceGl_` lets the old context go and uploads this world's mesh. */
  const box = $('race-box');
  if (box) box.dataset.view = '';
}

/* ---------- THE WORLD: POINTS, ROADS, GROUND, BUILDINGS, THE LOOP ---------- */
function raceWorld_(map) {
  const P = (map.pts || []).length / 3 | 0;
  const px = new Float64Array(P), py = new Float64Array(P), ph = new Float64Array(P);
  for (let i = 0; i < P; i++) { px[i] = map.pts[3 * i] / 10; py[i] = map.pts[3 * i + 1] / 10; ph[i] = map.pts[3 * i + 2] / 10; }
  const roads = (map.roads || []).map(r => ({ name: String(r[0] || ''), kind: String(r[1] || ''), w: Math.max(3, (r[2] || 60) / 10),
    lanes: r[3] || 0, one: !!r[4], idx: (r[5] || []).filter(i => i >= 0 && i < P) })).filter(r => r.idx.length > 1);
  const g = map.grid || { x0: 0, y0: 0, cell: 40, nx: 1, ny: 1, h: [0] };
  const G = { x0: g.x0 / 10, y0: g.y0 / 10, cell: g.cell || 40, nx: g.nx || 1, ny: g.ny || 1, h: (g.h || [0]).map(v => v / 10) };
  const W = { px, py, ph, P, roads, G, segs: [], hash: new Map(), bhash: new Map(), bld: [], water: [], areas: [], marks: [] };

  /* THE GROUND between the grid's points, bilinear; outside the grid it holds the edge. */
  W.ground = (x, y) => {
    const fx = Math.min(Math.max((x - G.x0) / G.cell, 0), G.nx - 1.0001), fy = Math.min(Math.max((y - G.y0) / G.cell, 0), G.ny - 1.0001);
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, i1 = Math.min(i + 1, G.nx - 1), j1 = Math.min(j + 1, G.ny - 1), H = G.h;
    return (H[j * G.nx + i] || 0) * (1 - u) * (1 - v) + (H[j * G.nx + i1] || 0) * u * (1 - v) + (H[j1 * G.nx + i] || 0) * (1 - u) * v + (H[j1 * G.nx + i1] || 0) * u * v;
  };
  W.half = [Math.max(G.nx - 1, 1) * G.cell / 2, Math.max(G.ny - 1, 1) * G.cell / 2];
  W.mid = [G.x0 + W.half[0], G.y0 + W.half[1]];

  /* EVERY SEGMENT IN A 25 m HASH, so "which road am I on" asks a handful, not thousands. */
  const C = 25, cellOf = (x, y) => Math.floor(x / C) + ':' + Math.floor(y / C);
  roads.forEach((r, ri) => {
    for (let k = 0; k + 1 < r.idx.length; k++) {
      const a = r.idx[k], b = r.idx[k + 1], s = W.segs.length;
      W.segs.push([a, b, ri]);
      const pad = r.w / 2 + 6;
      for (let cx = Math.floor((Math.min(px[a], px[b]) - pad) / C); cx <= Math.floor((Math.max(px[a], px[b]) + pad) / C); cx++) {
        for (let cy = Math.floor((Math.min(py[a], py[b]) - pad) / C); cy <= Math.floor((Math.max(py[a], py[b]) + pad) / C); cy++) {
          const key = cx + ':' + cy;
          if (!W.hash.has(key)) W.hash.set(key, []);
          W.hash.get(key).push(s);
        }
      }
    }
  });
  /* THE NEAREST ROAD: distance from its centre line, its height there, and which road. */
  W.roadAt = (x, y) => {
    const list = W.hash.get(cellOf(x, y));
    if (!list) return null;
    let best = null;
    for (const s of list) {
      const [a, b, ri] = W.segs[s];
      const dx = px[b] - px[a], dy = py[b] - py[a], l2 = dx * dx + dy * dy || 1;
      const t = Math.min(1, Math.max(0, ((x - px[a]) * dx + (y - py[a]) * dy) / l2));
      const d = Math.hypot(x - px[a] - dx * t, y - py[a] - dy * t);
      if (!best || d - roads[ri].w / 2 < best.d - roads[best.ri].w / 2) best = { d, ri, h: ph[a] + (ph[b] - ph[a]) * t, road: roads[ri] };
    }
    return best;
  };
  /* THE SURFACE UNDER A WHEEL: the road's own height on it, the ground away from it, and a blend across the verge. */
  W.heightAt = (x, y) => {
    const r = W.roadAt(x, y), gh = W.ground(x, y);
    if (!r) return gh;
    const edge = r.road.w / 2 + 1.5, out = edge + 5;
    if (r.d <= edge) return r.h;
    if (r.d >= out) return gh;
    const f = (r.d - edge) / (out - edge);
    return r.h * (1 - f) + gh * f;
  };

  (map.water || []).forEach(wt => {
    const c = wt[2] || [], line = [];
    for (let i = 0; i + 1 < c.length; i += 2) line.push([c[i] / 10, c[i + 1] / 10]);
    if (line.length > 1) W.water.push({ name: String(wt[0] || ''), w: (wt[1] || 80) / 10, line });
  });
  /* PARKS, WOODS, PONDS, CAR PARKS, RETAIL AND HOMES as flat fills on the ground, bottom to top as the file orders them (500). */
  (map.areas || []).forEach(a => {
    const c = a[1] || [], ring = [];
    for (let i = 0; i + 1 < c.length; i += 2) ring.push([c[i] / 10, c[i + 1] / 10]);
    if (ring.length >= 3 && RACE_COL.areas[a[0]]) W.areas.push({ kind: String(a[0]), ring });
  });
  /* THE LANDMARKS a local would name: a post where each stands, its name on the HUD when near (500). */
  (map.marks || []).forEach(m => W.marks.push({ name: String(m[0] || ''), kind: String(m[1] || ''), x: (m[2] || 0) / 10, y: (m[3] || 0) / 10 }));
  /* A BUILDING: its OSM outline, eaves height and roof (shape, ridge, planes as triangles) and its colours (511). An old row is [h, ring, kind]. */
  const hex = (s, or) => (/^[0-9a-f]{6}$/i.test(s || '') ? [0, 2, 4].map(k => parseInt(s.slice(k, k + 2), 16) / 255) : or);
  (map.bld || []).forEach((b, bi) => {
    const c = b[1] || [], ring = [];
    for (let i = 0; i + 1 < c.length; i += 2) ring.push([c[i] / 10, c[i + 1] / 10]);
    if (ring.length < 3) return;
    const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
    const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    const grounds = ring.map(p => W.ground(p[0], p[1]));
    const kind = RACE_COL.kinds[b[2]] ? b[2] : 'house', pal = RACE_COL.kinds[kind];
    const ex = b[4] || [], extra = [];
    for (let i = 0; i + 1 < ex.length; i += 2) extra.push([ex[i] / 10, ex[i + 1] / 10]);
    const rf = Array.isArray(b[3]) ? b[3] : null;
    const o = { h: Math.max(2.2, (b[0] || 75) / 10), kind, ring, box, base: Math.min(...grounds) - 1, top: Math.max(...grounds), i: bi,
      roof: rf ? { shape: rf[0] | 0, h: (rf[1] || 0) / 10, ox: (rf[2] || 0) / 10, oy: (rf[3] || 0) / 10, ux: (rf[4] || 1000) / 1000, uy: (rf[5] || 0) / 1000,
        hw: Math.max(0.1, (rf[6] || 1) / 10), hl: Math.max(0.1, (rf[7] || 1) / 10) } : null,
      extra, tris: Array.isArray(b[5]) ? b[5] : null, wall: hex(b[6], pal[bi % pal.length]),
      roofCol: hex(b[7], kind === 'house' ? RACE_COL.slate : RACE_COL.flatroof), minh: (b[8] || 0) / 10 };
    W.bld.push(o);
    for (let cx = Math.floor(box[0] / C); cx <= Math.floor(box[2] / C); cx++) {
      for (let cy = Math.floor(box[1] / C); cy <= Math.floor(box[3] / C); cy++) {
        const key = cx + ':' + cy;
        if (!W.bhash.has(key)) W.bhash.set(key, []);
        W.bhash.get(key).push(o);
      }
    }
  });
  /* THE FLAT LAYERS tools/race_map.py triangulated once: parks, water, pavement, kerb, ONE road surface, markings (511). */
  W.surf = (Array.isArray(map.surf) ? map.surf : []).filter(L => Array.isArray(L) && RACE_COL.surf[L[0]] && Array.isArray(L[1]) && Array.isArray(L[2]));
  /* INSIDE A BUILDING: an even-odd ray cast against the few in the car's cell. */
  W.inBuilding = (x, y) => {
    const list = W.bhash.get(cellOf(x, y));
    if (!list) return false;
    return list.some(o => {
      if (x < o.box[0] || x > o.box[2] || y < o.box[1] || y > o.box[3]) return false;
      let inside = false;
      for (let i = 0, j = o.ring.length - 1; i < o.ring.length; j = i++) {
        const a = o.ring[i], b = o.ring[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      return inside;
    });
  };

  W.route = raceRoute_(W);
  W.gates = raceGates_(W);
  W.mesh = raceMesh_(W);
  return W;
}

/* ---------- THE LOOP: SHORTEST PATHS BETWEEN THE WAYPOINTS, AVOIDING ROAD ALREADY DRIVEN ---------- */
function raceRoute_(W) {
  const { px, py, P, roads } = W;
  const adj = Array.from({ length: P }, () => []);
  roads.forEach(r => {
    for (let k = 0; k + 1 < r.idx.length; k++) {
      const a = r.idx[k], b = r.idx[k + 1], d = Math.hypot(px[b] - px[a], py[b] - py[a]);
      adj[a].push([b, d]); adj[b].push([a, d]);
    }
  });
  const used = new Set(), ek = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  const path = (from, to) => {
    const dist = new Float64Array(P).fill(Infinity), prev = new Int32Array(P).fill(-1), heap = [];
    /* A BINARY HEAP: a real map has thousands of points, and a linear scan per pop is their square. */
    const push = q => {
      heap.push(q);
      for (let i = heap.length - 1; i > 0;) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
        }
      }
      return top;
    };
    dist[from] = 0; push([0, from]);
    while (heap.length) {
      const [d, a] = pop();
      if (d > dist[a]) continue;
      if (a === to) break;
      for (const [b, l] of adj[a]) {
        const nd = d + l * (used.has(ek(a, b)) ? 5 : 1);
        if (nd < dist[b]) { dist[b] = nd; prev[b] = a; push([nd, b]); }
      }
    }
    if (from !== to && prev[to] < 0) return null;
    const out = [to];
    while (out[0] !== from) out.unshift(prev[out[0]]);
    return out;
  };
  const near = (x, y, ok) => {
    let best = -1, bd = Infinity;
    for (let i = 0; i < P; i++) { if (ok && !ok[i]) continue; const d = Math.hypot(px[i] - x, py[i] - y); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  const key = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  let way = [];
  RACE_ROUTE.forEach(name => {
    const mine = roads.filter(r => key(r.name) === key(name));
    if (!mine.length) return;
    const on = new Uint8Array(P);
    let sx = 0, sy = 0, n = 0;
    mine.forEach(r => r.idx.forEach(i => { on[i] = 1; sx += px[i]; sy += py[i]; n++; }));
    way.push(near(sx / n, sy / n, on));
  });
  if (way.length < 3) {
    const major = new Uint8Array(P);
    let any = false;
    roads.forEach(r => { if (/^(trunk|primary|secondary|tertiary)$/.test(r.kind)) r.idx.forEach(i => { major[i] = 1; any = true; }); });
    way = [45, 135, 225, 315].map(a => near(W.mid[0] + Math.sin(a * Math.PI / 180) * W.half[0] * 0.45,
                                            W.mid[1] + Math.cos(a * Math.PI / 180) * W.half[1] * 0.45, any ? major : null));
  }
  way = way.filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
  /* ROUND THEIR CENTRE, so the loop goes round rather than back and forth. */
  const cx = way.reduce((s, i) => s + px[i], 0) / (way.length || 1), cy = way.reduce((s, i) => s + py[i], 0) / (way.length || 1);
  way.sort((a, b) => Math.atan2(px[a] - cx, py[a] - cy) - Math.atan2(px[b] - cx, py[b] - cy));
  let route = [];
  for (let k = 0; k < way.length; k++) {
    const leg = path(way[k], way[(k + 1) % way.length]);
    if (!leg) continue;
    for (let i = 0; i + 1 < leg.length; i++) used.add(ek(leg[i], leg[i + 1]));
    route = route.concat(route.length ? leg.slice(1) : leg);
  }
  if (route.length < 2 && roads.length) route = roads.slice().sort((a, b) => b.idx.length - a.idx.length)[0].idx.slice();
  return route;
}

/* THE CHECKPOINTS: one every RACE_GATE_M along the loop, each facing the way the loop goes there; gate 0 is the start. */
function raceGates_(W) {
  const r = W.route, out = [];
  if (r.length < 2) return out;
  let run = RACE_GATE_M;
  for (let k = 0; k + 1 < r.length; k++) {
    const a = r[k], b = r[k + 1];
    const seg = Math.hypot(W.px[b] - W.px[a], W.py[b] - W.py[a]);
    if (run >= RACE_GATE_M || k === 0) {
      const hit = W.roadAt(W.px[a], W.py[a]);
      out.push({ x: W.px[a], y: W.py[a], th: Math.atan2(W.px[b] - W.px[a], W.py[b] - W.py[a]), w: hit ? hit.road.w : 7, pt: a });
      run = 0;
    }
    run += seg;
  }
  /* A last gate too near the start is the start itself. */
  if (out.length > 2 && Math.hypot(out[out.length - 1].x - out[0].x, out[out.length - 1].y - out[0].y) < RACE_GATE_M / 2) out.pop();
  return out;
}

/* ---------- THE MESH, LIT ON THE CPU: x, h, -y and a colour per vertex, in 200 m tiles so what is past the fog is not drawn ---------- */
const RACE_TILE = 200;            // metres a side of one drawing tile
const RACE_LIFT = 0.12;           // the flat layers ride this far over the ground's own triangles
function raceMesh_(W) {
  /* ONE GROWING Float32Array PER LAYER AND TILE, written in place: an array per vertex froze the phone. */
  const buckets = new Map();
  let cur = null, layer = '', big = false;
  let last = null;
  const bucket = (x, y) => {
    const tx = big ? 0 : Math.floor(x / RACE_TILE), ty = big ? 0 : Math.floor(-y / RACE_TILE);
    if (last && last.layer === layer && last.big === big && last.tx === tx && last.ty === ty) return last;
    const key = layer + '|' + (big ? 'all' : tx + ':' + ty);
    let b = buckets.get(key);
    if (!b) { b = { layer, big, tx, ty, v: new Float32Array(4096), at: 0 }; buckets.set(key, b); }
    return (last = b);
  };
  /* A point is given as [x east, y north, h]; GL wants [x, h, -y]. The light is worked out here, once, with the normal facing up. */
  const tri = (a, b, c, col, n) => {
    let nx, ny, nz;
    if (n) { nx = n[0]; ny = n[1]; nz = n[2]; }
    else {
      const ux = b[0] - a[0], uy = b[2] - a[2], uz = a[1] - b[1], wx = c[0] - a[0], wy = c[2] - a[2], wz = a[1] - c[1];
      nx = uy * wz - uz * wy; ny = uz * wx - ux * wz; nz = ux * wy - uy * wx;
      const l = (ny < 0 ? -1 : 1) * (Math.hypot(nx, ny, nz) || 1);
      nx /= l; ny /= l; nz /= l;
    }
    const k = 0.55 + 0.45 * Math.max(0, nx * RACE_SUN[0] + ny * RACE_SUN[1] + nz * RACE_SUN[2]);
    const r = col[0] * k, g = col[1] * k, bl = col[2] * k;
    const B = cur || bucket((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3);
    if (B.at + 18 > B.v.length) { const nv = new Float32Array(B.v.length * 2); nv.set(B.v); B.v = nv; }
    const v = B.v;
    v[B.at++] = a[0]; v[B.at++] = a[2]; v[B.at++] = -a[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
    v[B.at++] = b[0]; v[B.at++] = b[2]; v[B.at++] = -b[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
    v[B.at++] = c[0]; v[B.at++] = c[2]; v[B.at++] = -c[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
  };
  const quad = (a, b, c, d, col, n) => { tri(a, b, c, col, n); tri(a, c, d, col, n); };
  const order = [];
  const mark = (name, fn) => { layer = name; if (order.indexOf(name) < 0) order.push(name); fn(); cur = null; big = false; };
  /* One thing in one tile: a building's walls and roof stay together however its corners fall. */
  const whole = (x, y, fn) => { cur = bucket(x, y); fn(); cur = null; };

  mark('ground', () => {
    const G = W.G;
    for (let j = 0; j + 1 < G.ny; j++) for (let i = 0; i + 1 < G.nx; i++) {
      const p = (a, b) => [G.x0 + a * G.cell, G.y0 + b * G.cell, G.h[b * G.nx + a]];
      const shade = 0.94 + 0.06 * ((i * 7 + j * 13) % 5) / 4;
      const col = RACE_COL.grass.map(c => c * shade);
      quad(p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1), col);
    }
  });
  /* A STRIP along a polyline: half-width `hw`, height from `hOf`, mitred at each joint (a backend-built map has no surface). */
  const strip = (line, hw, hOf, col) => {
    const n = line.length, L = [], R = [];
    for (let k = 0; k < n; k++) {
      const a = line[Math.max(0, k - 1)], b = line[Math.min(n - 1, k + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const h = hOf(k);
      L.push([line[k][0] - dy * hw, line[k][1] + dx * hw, h]);
      R.push([line[k][0] + dy * hw, line[k][1] - dx * hw, h]);
    }
    for (let k = 0; k + 1 < n; k++) quad(L[k], R[k], R[k + 1], L[k + 1], col, [0, 1, 0]);
  };
  const up = [0, 1, 0];
  if (W.surf.length) {
    W.surf.forEach(L => mark(L[0], () => {
      const v = L[1], t = L[2], col = RACE_COL.surf[L[0]], P = [];
      for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i] / 10, v[i + 1] / 10, W.ground(v[i] / 10, v[i + 1] / 10) + RACE_LIFT]);
      for (let k = 0; k + 2 < t.length; k += 3) {
        const a = P[t[k]], b = P[t[k + 1]], c = P[t[k + 2]];
        if (!a || !b || !c) continue;
        big = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[0] - c[0]), Math.abs(a[1] - b[1]), Math.abs(a[1] - c[1])) > RACE_TILE / 2;
        tri(a, b, c, col, up);
      }
    }));
  } else {
    mark('area', () => W.areas.forEach(a => {
      const ring = raceCcw_(a.ring), col = RACE_COL.areas[a.kind];
      const P = ring.map(p => [p[0], p[1], W.ground(p[0], p[1]) + RACE_LIFT]);
      big = true;
      raceEar_(ring).forEach(t => tri(P[t[0]], P[t[1]], P[t[2]], col, up));
    }));
    mark('water', () => W.water.forEach(wt => strip(wt.line, wt.w / 2, k => W.ground(wt.line[k][0], wt.line[k][1]) + RACE_LIFT, RACE_COL.water)));
    mark('road', () => W.roads.forEach(r => strip(r.idx.map(i => [W.px[i], W.py[i]]), r.w / 2, k => W.ph[r.idx[k]] + RACE_LIFT, RACE_COL.road)));
  }
  /* THE ROOF OVER A POINT: eaves plus the slope times the distance in from the nearest eave line, as the shape says. */
  const roofZ = (o, top, x, y) => {
    const R = o.roof;
    if (!R || !R.shape) return top;
    const dx = x - R.ox, dy = y - R.oy, u = dx * R.ux + dy * R.uy, v = -dx * R.uy + dy * R.ux, s = R.h / R.hw;
    if (R.shape === 1) return top + s * Math.max(0, R.hw - Math.abs(v));
    if (R.shape === 2) return top + s * Math.max(0, Math.min(R.hw - Math.abs(v), R.hl - Math.abs(u)));
    return top + R.h * Math.min(1, Math.max(0, (R.hw - v) / (2 * R.hw)));
  };
  mark('bld', () => W.bld.forEach(o => whole((o.box[0] + o.box[2]) / 2, (o.box[1] + o.box[3]) / 2, () => {
    const top = o.top + o.h, base = o.minh ? o.top + o.minh : o.base, col = o.wall;
    if (o.tris) {
      /* THE RING IS COUNTER-CLOCKWISE (the builder's), its roof's cut points already in it: each wall's top follows the roof. */
      const all = o.ring.concat(o.extra), Z = all.map(p => roofZ(o, top, p[0], p[1]));
      for (let i = 0; i < o.ring.length; i++) {
        const j = (i + 1) % o.ring.length, a = o.ring[i], b = o.ring[j];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n = [dy / l, 0, dx / l];
        quad([a[0], a[1], base], [b[0], b[1], base], [b[0], b[1], Z[j]], [a[0], a[1], Z[i]], col, n);
      }
      for (let k = 0; k + 2 < o.tris.length; k += 3) {
        const i0 = o.tris[k], i1 = o.tris[k + 1], i2 = o.tris[k + 2], A = all[i0], B = all[i1], Cc = all[i2];
        if (A && B && Cc) tri([A[0], A[1], Z[i0]], [B[0], B[1], Z[i1]], [Cc[0], Cc[1], Z[i2]], o.roofCol);
      }
      return;
    }
    const ring = raceCcw_(o.ring);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      quad([a[0], a[1], base], [b[0], b[1], base], [b[0], b[1], top], [a[0], a[1], top], col, [dy / l, 0, dx / l]);
    }
    raceEar_(ring).forEach(t => tri([ring[t[0]][0], ring[t[0]][1], top], [ring[t[1]][0], ring[t[1]][1], top], [ring[t[2]][0], ring[t[2]][1], top], o.roofCol, up));
  })));
  /* A POST AT EACH LANDMARK: the station's red roundel and blue bar; a white sign for the rest. */
  const cube = (x0, y0, z0, x1, y1, z1, col) => {
    const c = (x, y, z) => [x, y, z];
    quad(c(x0, y0, z1), c(x1, y0, z1), c(x1, y1, z1), c(x0, y1, z1), col, [0, 1, 0]);
    quad(c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1), col, [0, 0, 1]);
    quad(c(x1, y1, z0), c(x0, y1, z0), c(x0, y1, z1), c(x1, y1, z1), col, [0, 0, -1]);
    quad(c(x0, y1, z0), c(x0, y0, z0), c(x0, y0, z1), c(x0, y1, z1), col, [-1, 0, 0]);
    quad(c(x1, y0, z0), c(x1, y1, z0), c(x1, y1, z1), c(x1, y0, z1), col, [1, 0, 0]);
  };
  mark('marks', () => W.marks.forEach(m => whole(m.x, m.y, () => {
    const g = W.ground(m.x, m.y), x = m.x, y = m.y;
    cube(x - 0.15, y - 0.15, g, x + 0.15, y + 0.15, g + 6, RACE_COL.kerb);
    if (m.kind === 'tube') {
      cube(x - 1.4, y - 0.12, g + 6, x + 1.4, y + 0.12, g + 8.8, RACE_COL.roundel);
      cube(x - 1.9, y - 0.2, g + 7.05, x + 1.9, y + 0.2, g + 7.75, RACE_COL.bar);
    } else {
      cube(x - 2, y - 0.1, g + 6, x + 2, y + 0.1, g + 7.4, m.kind === 'park' ? RACE_COL.areas.park : RACE_COL.sign);
    }
  })));
  /* ONE BUFFER: each layer's tiles end to end, the layers in drawing order. `ranges` is a layer's whole span; `tiles` its pieces. */
  let n = 0;
  buckets.forEach(b => { n += b.at; });
  const data = new Float32Array(n), ranges = {}, tiles = {};
  let at = 0;
  order.forEach(name => {
    const s = at / 6;
    tiles[name] = [];
    buckets.forEach(b => {
      if (b.layer !== name || !b.at) return;
      data.set(b.v.subarray(0, b.at), at);
      tiles[name].push({ big: b.big, x: (b.tx + 0.5) * RACE_TILE, y: (b.ty + 0.5) * RACE_TILE, first: at / 6, count: b.at / 6 });
      at += b.at;
    });
    ranges[name] = [s, at / 6 - s];
  });
  return { data, ranges, tiles, order };
}

/* Counter-clockwise, seen from above (x east, y north). */
function raceCcw_(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a < 0 ? ring.slice().reverse() : ring;
}

/* EAR CLIPPING for a roof: an L-shaped house has a corner a fan would draw across. Triangles as index triples. */
function raceEar_(ring) {
  const idx = ring.map((_, i) => i), out = [];
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = ring.length * ring.length;
  while (idx.length > 3 && guard-- > 0) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = ring[i0], b = ring[i1], c = ring[i2];
      if (cross(a, b, c) <= 0) continue;
      const inside = idx.some(j => j !== i0 && j !== i1 && j !== i2 && cross(a, b, ring[j]) >= 0 && cross(b, c, ring[j]) >= 0 && cross(c, a, ring[j]) >= 0);
      if (inside) continue;
      out.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push(idx.slice());
  else for (let k = 1; k + 1 < idx.length; k++) out.push([idx[0], idx[k], idx[k + 1]]);
  return out;
}

/* ---------- THE CAR ---------- */
function raceReset_() {
  const W = RACE.world, c = RACE.car;
  const g = W && W.gates[0];
  c.x = g ? g.x : 0; c.y = g ? g.y : 0; c.th = g ? g.th : 0; c.v = 0; c.steer = 0;
  c.h = W ? W.heightAt(c.x, c.y) : 0; c.pitch = 0;
  RACE.cam = null; RACE.prev = null;
  RACE.lap = { next: 1, start: 0, paused: 0, best: raceBest_(), last: 0, laps: 0 };
}

function raceBest_() {
  try { return Number(localStorage.getItem('race-best')) || 0; } catch (e) { return 0; }
}

/* ONE STEP OF dt SECONDS. Throttle, brakes, rolling and air drag, and the slope: g times the grade along the car is felt
   as speed lost uphill and gained down. */
function raceStep_(dt) {
  const W = RACE.world, c = RACE.car;
  if (!W) return;
  const k = RACE.keys, t = RACE.touch;
  const go = !!(k.up || t.go), back = !!(k.down), brake = !!(k.brake || t.brake);
  const want = (k.right || t.right ? 1 : 0) - (k.left || t.left ? 1 : 0);
  c.steer += Math.max(-dt * 4, Math.min(dt * 4, want - c.steer));
  const fx = Math.sin(c.th), fy = Math.cos(c.th);
  const ahead = W.heightAt(c.x + fx * 1.5, c.y + fy * 1.5), behind = W.heightAt(c.x - fx * 1.5, c.y - fy * 1.5);
  const grade = (ahead - behind) / 3;
  const road = W.roadAt(c.x, c.y);
  const onRoad = !!road && road.d <= road.road.w / 2 + 0.5;
  let a = -RACE_G * grade / Math.sqrt(1 + grade * grade);
  if (go) a += c.v < -0.3 ? 8 : 3.6 * Math.max(0, 1 - c.v / 42);
  if (back) a += c.v > 0.3 ? -8 : (c.v > -7 ? -2.5 : 0);
  const roll = (onRoad ? 0.12 : 1.6) + (onRoad ? 0.0009 : 0.004) * c.v * c.v;
  const stop = (brake ? 11 : 0) + roll;
  const v0 = c.v + a * dt;
  /* Brakes and rolling oppose the motion and stop it; they never push it backwards. */
  c.v = Math.abs(v0) <= stop * dt && !go && !back ? (Math.abs(a) > stop ? v0 - Math.sign(v0) * stop * dt : 0) : v0 - Math.sign(v0) * stop * dt;
  const turn = 0.55 / (1 + Math.abs(c.v) / 14);
  c.th += c.v / 2.6 * Math.tan(c.steer * turn) * dt;
  const nx = c.x + Math.sin(c.th) * c.v * dt, ny = c.y + Math.cos(c.th) * c.v * dt;
  const out = Math.abs(nx - W.mid[0]) > W.half[0] || Math.abs(ny - W.mid[1]) > W.half[1];
  if (out || W.inBuilding(nx, ny)) c.v *= -0.25;
  else { c.x = nx; c.y = ny; }
  c.h = W.heightAt(c.x, c.y);
  c.pitch = Math.atan(grade);
  raceGateCheck_();
}

/* THE CAR AS SEEN: between the last two physics steps by how far into the next one the clock is, so a 50, 75 or 120 Hz screen
   never shows the same place twice and then a jump (511). */
function raceSeen_() {
  const c = RACE.car, p = RACE.prev;
  if (!p || !RACE.running) return c;
  const f = Math.min(1, Math.max(0, RACE.acc / RACE_DT)), mix = (a, b) => a + (b - a) * f;
  let d = c.th - p.th;
  d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
  return { x: mix(p.x, c.x), y: mix(p.y, c.y), h: mix(p.h, c.h), th: p.th + d * f, pitch: mix(p.pitch, c.pitch), v: c.v };
}

function raceGateCheck_() {
  const W = RACE.world, c = RACE.car, L = RACE.lap;
  if (!W || W.gates.length < 2) return;
  const now = raceNow_();
  if (!L.start && Math.abs(c.v) > 0.5) L.start = now;
  const g = W.gates[L.next % W.gates.length];
  if (Math.hypot(c.x - g.x, c.y - g.y) > Math.max(9, g.w / 2 + 4)) return;
  if (L.next % W.gates.length === 0) {
    L.last = now - L.start; L.laps++; L.start = now;
    if (!L.best || L.last < L.best) { L.best = L.last; try { localStorage.setItem('race-best', String(Math.round(L.best))); } catch (e) {} }
    L.next = 1;
  } else L.next++;
}

const raceNow_ = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/* ---------- THE RENDERER: one shader, lit vertices, fog ---------- */
function raceGl_(canvas) {
  if (RACE.gl && RACE.gl.canvas === canvas && !RACE.gl.ctx.isContextLost()) return RACE.gl;
  /* LOST (iPad Safari drops a context under memory pressure): nothing is drawn until `webglcontextrestored`. */
  if (RACE.gl && RACE.gl.canvas === canvas) return null;
  /* ASKED ONCE PER CANVAS: a browser without WebGL says so on the card, not sixty times a second. */
  if (RACE.noGl === canvas) return null;
  /* A REPAINT MADE A NEW CANVAS: the old one's context is let go now, not whenever the collector gets to it (browsers cap them). */
  try { const lose = RACE.gl && RACE.gl.ctx.getExtension('WEBGL_lose_context'); if (lose && RACE.gl.canvas !== canvas) lose.loseContext(); } catch (e) {}
  RACE.gl = null;
  let ctx = null;
  try { ctx = canvas.getContext('webgl', { antialias: true, alpha: false }) || canvas.getContext('experimental-webgl'); } catch (e) { ctx = null; }
  if (!ctx || !ctx.createShader) {
    RACE.noGl = canvas;
    const stage = canvas.closest('.race-stage');
    if (stage && !stage.querySelector('.race-nogl')) stage.insertAdjacentHTML('beforeend', '<p class="note race-nogl">This browser cannot draw in 3D.</p>');
    return null;
  }
  const sh = (type, src) => { const s = ctx.createShader(type); ctx.shaderSource(s, src); ctx.compileShader(s); return s; };
  const prog = ctx.createProgram();
  ctx.attachShader(prog, sh(ctx.VERTEX_SHADER, 'attribute vec3 aP;attribute vec3 aC;uniform mat4 uVP;uniform mat4 uM;uniform vec3 uEye;'
    + 'varying vec3 vC;varying float vF;void main(){vec4 w=uM*vec4(aP,1.0);vC=aC;'
    + 'vF=clamp((length(w.xyz-uEye)-140.0)/420.0,0.0,1.0);gl_Position=uVP*w;}'));
  ctx.attachShader(prog, sh(ctx.FRAGMENT_SHADER, 'precision mediump float;uniform vec3 uFog;varying vec3 vC;varying float vF;'
    + 'void main(){gl_FragColor=vec4(mix(vC,uFog,vF),1.0);}'));
  ctx.linkProgram(prog);
  if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return null;
  const buf = data => { const b = ctx.createBuffer(); ctx.bindBuffer(ctx.ARRAY_BUFFER, b); ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW); return { b, n: data.length / 6 }; };
  const G = {
    canvas, ctx, prog,
    aP: ctx.getAttribLocation(prog, 'aP'), aC: ctx.getAttribLocation(prog, 'aC'),
    uVP: ctx.getUniformLocation(prog, 'uVP'), uM: ctx.getUniformLocation(prog, 'uM'),
    uEye: ctx.getUniformLocation(prog, 'uEye'), uFog: ctx.getUniformLocation(prog, 'uFog'),
    world: buf(RACE.world.mesh.data), car: buf(raceCarMesh_()), gate: buf(raceGateMesh_()),
  };
  ctx.enable(ctx.DEPTH_TEST);
  RACE.gl = G;
  return G;
}

/* A BOX as lit triangles in model space (x right, y up, z forward). */
function raceBox_(v, x0, y0, z0, x1, y1, z1, col) {
  const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  [[0, 1, 2, 3, [0, 0, -1]], [5, 4, 7, 6, [0, 0, 1]], [4, 0, 3, 7, [-1, 0, 0]], [1, 5, 6, 2, [1, 0, 0]], [3, 2, 6, 7, [0, 1, 0]], [4, 5, 1, 0, [0, -1, 0]]]
    .forEach(f => {
      const n = f[4], l = 0.55 + 0.45 * Math.max(0, n[0] * RACE_SUN[0] + n[1] * RACE_SUN[1] - n[2] * RACE_SUN[2]);
      [[f[0], f[1], f[2]], [f[0], f[2], f[3]]].forEach(t => t.forEach(i => v.push(P[i][0], P[i][1], P[i][2], col[0] * l, col[1] * l, col[2] * l)));
    });
}
function raceCarMesh_() {
  const v = [];
  raceBox_(v, -0.9, 0.3, -2.1, 0.9, 1.0, 2.1, RACE_COL.car);
  raceBox_(v, -0.75, 1.0, -1.2, 0.75, 1.5, 0.8, RACE_COL.glass);
  [[-0.95, -1.35], [0.95, -1.35], [-0.95, 1.35], [0.95, 1.35]].forEach(([x, z]) => raceBox_(v, x - 0.15, 0, z - 0.35, x + 0.15, 0.7, z + 0.35, RACE_COL.tyre));
  return new Float32Array(v);
}
/* A GATE five metres wide in model space; drawn scaled to the road it stands on. */
function raceGateMesh_() {
  const v = [];
  raceBox_(v, -2.7, 0, -0.2, -2.3, 4, 0.2, RACE_COL.gate);
  raceBox_(v, 2.3, 0, -0.2, 2.7, 4, 0.2, RACE_COL.gate);
  raceBox_(v, -2.7, 3.4, -0.15, 2.7, 4, 0.15, RACE_COL.line);
  return new Float32Array(v);
}

/* ---------- MATRICES (column-major, as GL reads them) ---------- */
function raceMul_(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
function racePersp_(fov, asp, n, f) {
  const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
}
function raceLook_(e, c, up) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = nrm(sub(e, c)), x = nrm(crs(up, z)), y = crs(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
}
/* A MODEL MATRIX: heading th from north clockwise, pitch up the slope, at [x, h, -y]; `s` widens it sideways. */
function raceModel_(x, y, h, th, pitch, s) {
  const f = [Math.sin(th) * Math.cos(pitch), Math.sin(pitch), -Math.cos(th) * Math.cos(pitch)];
  const r = [Math.cos(th), 0, Math.sin(th)];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const k = s || 1;
  return new Float32Array([r[0] * k, r[1] * k, r[2] * k, 0, u[0], u[1], u[2], 0, f[0], f[1], f[2], 0, x, h, -y, 1]);
}

function raceDraw_() {
  const box = $('race-box'), canvas = box && box.querySelector('.race-gl');
  if (!canvas || !RACE.world) return;
  const G = raceGl_(canvas);
  if (G) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = G.ctx, W = RACE.world, c = raceSeen_();
    /* THE CAMERA EASES AT THE SAME RATE AT ANY FRAME RATE (511): a fixed share per frame shook on a 120 Hz screen and lagged at 30. */
    const now = raceNow_(), dt = Math.min(0.1, Math.max(0, (now - (RACE.drawAt || now)) / 1000));
    RACE.drawAt = now;
    const fx = Math.sin(c.th), fy = Math.cos(c.th);
    const want = [c.x - fx * 9, c.y - fy * 9];
    const eye = [want[0], Math.max(W.ground(want[0], want[1]) + 1.8, c.h + 3.2), -want[1]];
    const ease = 1 - Math.pow(0.82, dt * 60);
    RACE.cam = RACE.cam && dt > 0 ? RACE.cam.map((q, i) => q + (eye[i] - q) * ease) : (RACE.cam && !dt ? RACE.cam : eye);
    /* DRAWN ROUND THE CAMERA: the world is moved by the whole metres under it, so every number the GPU sees is small. */
    const O = [Math.round(RACE.cam[0]), 0, Math.round(RACE.cam[2])], rel = p => [p[0] - O[0], p[1], p[2] - O[2]];
    const look = [c.x + fx * 4, c.h + 1.2, -(c.y + fy * 4)];
    const vp = raceMul_(racePersp_(62 * Math.PI / 180, w / h, 0.8, 700), raceLook_(rel(RACE.cam), rel(look), [0, 1, 0]));
    ctx.viewport(0, 0, w, h);
    ctx.clearColor(RACE_COL.sky[0], RACE_COL.sky[1], RACE_COL.sky[2], 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    ctx.useProgram(G.prog);
    ctx.uniformMatrix4fv(G.uVP, false, vp);
    ctx.uniform3fv(G.uEye, rel(RACE.cam));
    ctx.uniform3fv(G.uFog, RACE_COL.sky);
    const draw = (b, m, first, count) => {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b.b);
      ctx.enableVertexAttribArray(G.aP); ctx.vertexAttribPointer(G.aP, 3, ctx.FLOAT, false, 24, 0);
      ctx.enableVertexAttribArray(G.aC); ctx.vertexAttribPointer(G.aC, 3, ctx.FLOAT, false, 24, 12);
      ctx.uniformMatrix4fv(G.uM, false, m);
      ctx.drawArrays(ctx.TRIANGLES, first || 0, count === undefined ? b.n : count);
    };
    const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -O[0], 0, -O[2], 1]);
    const model = (x, y, hh, th, pitch, k) => { const m = raceModel_(x, y, hh, th, pitch, k); m[12] -= O[0]; m[14] -= O[2]; return m; };
    /* ONLY THE TILES NEAR ENOUGH TO SEE: the fog is whole by 560 m, so a tile whose nearest corner is further is not drawn. */
    const T = W.mesh.tiles || {}, far = 560 + RACE_TILE * 0.75;
    let drawn = 0;
    const layer = name => (T[name] || []).forEach(t => {
      if (!t.big && Math.hypot(t.x - RACE.cam[0], t.y - RACE.cam[2]) > far) return;
      draw(G.world, I, t.first, t.count); drawn += t.count;
    });
    /* THE GROUND WRITES DEPTH; WHAT LIES FLAT ON IT DOES NOT, painted bottom to top over it, so no two layers ever fight for a pixel (511). */
    layer('ground');
    ctx.enable(ctx.POLYGON_OFFSET_FILL);
    ctx.polygonOffset(-1, -4);
    ctx.depthMask(false);
    (W.mesh.order || []).forEach(name => { if (name !== 'ground' && name !== 'bld' && name !== 'marks') layer(name); });
    ctx.depthMask(true);
    ctx.disable(ctx.POLYGON_OFFSET_FILL);
    layer('bld');
    layer('marks');
    RACE.drawn = drawn;
    const g = W.gates[RACE.lap.next % (W.gates.length || 1)];
    if (g) draw(G.gate, model(g.x, g.y, W.heightAt(g.x, g.y) + RACE_LIFT, g.th, 0, Math.max(1, (g.w + 2) / 5)));
    draw(G.car, model(c.x, c.y, c.h + RACE_LIFT, c.th, c.pitch, 1));
  }
  raceMini_(box);
}

/* THE LITTLE MAP: every road drawn once into a hidden canvas, then turned under the car each frame. */
function raceMini_(box) {
  const cv = box.querySelector('.race-mini');
  const W = RACE.world;
  if (!cv || RACE.noMini === cv) return;
  let ctx = null;
  try { ctx = cv.getContext('2d'); } catch (e) { ctx = null; }
  if (!ctx || !ctx.drawImage) { RACE.noMini = cv; return; }
  const S = 0.25, px = 96;
  if (!W.miniCanvas) {
    const off = document.createElement('canvas');
    off.width = Math.ceil(W.half[0] * 2 * S) + 2; off.height = Math.ceil(W.half[1] * 2 * S) + 2;
    const o = off.getContext('2d');
    if (!o) return;
    o.lineCap = 'round'; o.lineJoin = 'round';
    const X = x => (x - W.mid[0] + W.half[0]) * S, Y = y => (W.mid[1] + W.half[1] - y) * S;
    const line = (pts, wd, col) => { o.strokeStyle = col; o.lineWidth = wd; o.beginPath(); pts.forEach((p, k) => (k ? o.lineTo : o.moveTo).call(o, X(p[0]), Y(p[1]))); o.stroke(); };
    W.areas.forEach(a => {
      const c = RACE_COL.areas[a.kind];
      o.fillStyle = 'rgb(' + c.map(v => Math.round(v * 255)).join(',') + ')';
      o.beginPath(); a.ring.forEach((p, k) => (k ? o.lineTo : o.moveTo).call(o, X(p[0]), Y(p[1]))); o.closePath(); o.fill();
    });
    W.water.forEach(wt => line(wt.line, Math.max(1.5, wt.w * S), 'rgb(64,115,158)'));
    W.roads.forEach(r => line(r.idx.map(i => [W.px[i], W.py[i]]), Math.max(1.2, r.w * S), 'rgb(200,200,200)'));
    line(W.route.map(i => [W.px[i], W.py[i]]), 2, 'rgb(242,189,51)');
    W.miniCanvas = off;
  }
  if (cv.width !== px * 2) { cv.width = px * 2; cv.height = px * 2; }
  const c = RACE.car;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, px, px);
  ctx.save();
  ctx.translate(px / 2, px / 2);
  ctx.rotate(-c.th);
  ctx.drawImage(W.miniCanvas, -(c.x - W.mid[0] + W.half[0]) * S, -(W.mid[1] + W.half[1] - c.y) * S);
  ctx.restore();
  ctx.fillStyle = 'rgb(242,189,51)';
  ctx.beginPath(); ctx.moveTo(px / 2, px / 2 - 6); ctx.lineTo(px / 2 + 4, px / 2 + 4); ctx.lineTo(px / 2 - 4, px / 2 + 4); ctx.closePath(); ctx.fill();
}

/* THE NUMBERS OVER THE ROAD, ten times a second rather than sixty: text that changes every frame is a layout every frame. */
function raceHud_(force) {
  const now = raceNow_();
  if (!force && now - RACE.hudAt < 100) return;
  RACE.hudAt = now;
  const box = $('race-box');
  if (!box || !RACE.world) return;
  const c = RACE.car, W = RACE.world, L = RACE.lap;
  const r = W.roadAt(c.x, c.y);
  const fx = Math.sin(c.th), fy = Math.cos(c.th);
  const grade = (W.heightAt(c.x + fx * 4, c.y + fy * 4) - W.heightAt(c.x - fx * 4, c.y - fy * 4)) / 8 * 100;
  const set = (k, t) => { const el = box.querySelector('[data-hud="' + k + '"]'); if (el && el.textContent !== t) el.textContent = t; };
  const clock = ms => { const s = Math.max(0, ms) / 1000; return Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0'); };
  set('mph', Math.round(Math.abs(c.v) * 2.23694) + ' mph');
  set('road', r && r.d <= r.road.w / 2 + 3 ? (r.road.name || 'Unnamed road') : 'Off the road');
  let near = '', nd = 220;
  W.marks.forEach(m => { const d = Math.hypot(m.x - c.x, m.y - c.y); if (d < nd) { nd = d; near = m.name; } });
  set('near', near ? 'Near ' + near : '');
  set('alt', c.h.toFixed(1) + ' m · ' + (grade >= 0 ? '+' : '') + grade.toFixed(1) + '%');
  set('gate', 'Gate ' + (L.next % (W.gates.length || 1) || W.gates.length) + '/' + W.gates.length);
  set('time', clock(L.start ? (L.paused || now) - L.start : 0) + (L.best ? ' · best ' + clock(L.best) : ''));
}

/* ---------- THE LOOP ---------- */
function raceFrame_(t) {
  RACE.raf = 0;
  if (!RACE.running) return;
  const box = $('race-box');
  /* OFF THE GLASS IS PAUSED: another page of Games, another column, or a hidden tab costs nothing. */
  if (!box || !box.isConnected || (typeof dropOnFront_ === 'function' && !dropOnFront_(box)) || document.hidden) { racePause_(); return; }
  const now = raceNow_();
  RACE.acc = Math.min(RACE.acc + (now - (RACE.last || now)) / 1000, RACE_DT * 15);
  RACE.last = now;
  while (RACE.acc >= RACE_DT) { RACE.prev = Object.assign({}, RACE.car); raceStep_(RACE_DT); RACE.acc -= RACE_DT; }
  raceDraw_();
  raceHud_();
  RACE.raf = requestAnimationFrame(raceFrame_);
}

function raceGo_() {
  if (!RACE.world || RACE.running) return;
  RACE.running = true; RACE.last = 0; RACE.acc = 0;
  /* THE LAP CLOCK STOOD STILL WHILE PAUSED. */
  if (RACE.lap.start && RACE.lap.paused) RACE.lap.start += raceNow_() - RACE.lap.paused;
  RACE.lap.paused = 0;
  raceTiles_();
  RACE.raf = requestAnimationFrame(raceFrame_);
}
function racePause_() {
  if (RACE.running) RACE.lap.paused = raceNow_();
  RACE.running = false;
  if (RACE.raf) cancelAnimationFrame(RACE.raf);
  RACE.raf = 0; RACE.keys = {}; RACE.touch = {};
  document.querySelectorAll('.race-pad.on').forEach(b => b.classList.remove('on'));
  raceTiles_();
}

/* ---------- THE CARD ---------- */
function initRacer() {
  raceFetch_();
  racePaint_();
}
/* DRAWN AHEAD (the widget's `draw`): the card's markup from what is already here — no fetch, no frame. */
function raceStill_() { racePaint_(true); }
function racerStop_() { racePause_(); }

function racePaint_(still) {
  const box = $('race-box');
  if (!box) return;
  const admin = typeof isAdmin === 'function' && isAdmin();
  const build = admin ? tile_({ icon: 'sync', label: RACE.world ? 'Build the map again' : 'Build the map',
    note: 'roads from OpenStreetMap, heights from a DEM',
    act: 'race-build', tone: 'admin', cls: RACE.building ? 'is-busy' : '', off: !!RACE.building }) : '';
  if (!RACE.world) {
    box.dataset.view = RACE.asking ? 'wait' : 'none';
    /* NO MAP AT ALL (the backend and the shipped file both failed): the reason, and an admin's way to build it. */
    box.innerHTML = RACE.asking ? loading_()
      : `<p class="note">${esc(RACE.err || 'The map could not be loaded.')}</p>` + (build ? `<div class="tile-row">${build}</div>` : '');
    return;
  }
  if (box.dataset.view !== 'drive' || !box.querySelector('.race-gl')) {
    box.dataset.view = 'drive';
    box.innerHTML = `<div class="race-stage" data-noswipe>
        <canvas class="race-gl" data-do="race-go" aria-label="The road ahead"></canvas>
        <canvas class="race-mini" aria-hidden="true"></canvas>
        <div class="race-hud" aria-live="off"><b data-hud="mph">0 mph</b><span data-hud="road"></span><span data-hud="near"></span><span data-hud="alt"></span></div>
        <div class="race-lap"><span data-hud="gate"></span><span data-hud="time"></span></div>
      </div>
      <div class="race-pads" data-noswipe>
        <button type="button" class="race-pad" data-pad="left" aria-label="Steer left">&#9664;</button>
        <button type="button" class="race-pad" data-pad="right" aria-label="Steer right">&#9654;</button>
        <span></span>
        <button type="button" class="race-pad" data-pad="brake" aria-label="Brake">Brake</button>
        <button type="button" class="race-pad is-go" data-pad="go" aria-label="Accelerate">Go</button>
      </div>
      <p class="faint race-keys">&#8593; W go · &#8595; S reverse · &#8592; &#8594; A D steer · Space brake</p>
      <div class="tile-row race-tiles"></div>
      ${raceAttr_()}`;
    racePads_(box);
    raceGlWatch_(box.querySelector('.race-gl'));
  }
  raceTiles_();
  const attr = box.querySelector('.race-attr');
  if (attr) attr.outerHTML = raceAttr_();
  raceHud_(true);
  /* ONE STILL FRAME, so the card shows the street before anybody presses Drive. */
  if (!still) requestAnimationFrame(() => { if (!RACE.running) raceDraw_(); });
}

/* WHOSE MAP: OSM's line on a real one; the practice streets say they are invented and that the real map is not built yet. */
function raceAttr_() {
  const m = RACE.map || {};
  if (m.practice) {
    return `<p class="faint race-attr">Practice streets, invented — the Colliers Wood map has not been built yet${
      RACE.building ? ' (building now)' : ''}.</p>`;
  }
  return `<p class="faint race-attr"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">${
    esc(m.osm || 'Map data © OpenStreetMap contributors (ODbL)')}</a> · heights ${esc(m.dem || 'DEM')}</p>`;
}

/* A LOST CONTEXT IS ASKED BACK (preventDefault) and the world uploaded again when it returns. */
function raceGlWatch_(canvas) {
  if (!canvas) return;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); racePause_(); });
  canvas.addEventListener('webglcontextrestored', () => { RACE.gl = null; if (!RACE.running) raceDraw_(); });
}

function raceTiles_() {
  const box = $('race-box'), row = box && box.querySelector('.race-tiles');
  if (!row) return;
  const admin = typeof isAdmin === 'function' && isAdmin();
  row.innerHTML = (RACE.running ? tile_({ icon: 'pause', label: 'Pause', act: 'race-pause' })
                                : tile_({ icon: 'play', label: 'Drive', act: 'race-go' }))
    + tile_({ icon: 'undo', label: 'Back to the start', act: 'race-reset' })
    + (admin ? tile_({ icon: 'sync', label: 'Build the map again', note: 'roads from OpenStreetMap, heights from a DEM',
      act: 'race-build', tone: 'admin', cls: RACE.building ? 'is-busy' : '', off: !!RACE.building }) : '');
}

/* THE PEDALS: pointer events with capture, so a thumb that slides off a pedal still lets go of it. */
function racePads_(box) {
  const pads = box.querySelector('.race-pads');
  if (!pads) return;
  const held = new Map();
  const sync = () => {
    const t = {};
    held.forEach(k => { t[k] = true; });
    RACE.touch = t;
    pads.querySelectorAll('.race-pad').forEach(b => b.classList.toggle('on', !!t[b.dataset.pad]));
  };
  pads.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-pad]');
    if (!b) return;
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (err) {}
    held.set(e.pointerId, b.dataset.pad);
    raceGo_();
    sync();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => pads.addEventListener(n, e => { if (held.delete(e.pointerId)) sync(); }));
  pads.addEventListener('contextmenu', e => e.preventDefault());
}

const RACE_KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
                    ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'brake' };
/* KEYS ONLY WHILE DRIVING, and then the arrows steer rather than turn the column. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!RACE.running) return;
  const k = RACE_KEYS[e.key];
  if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) return;
  e.preventDefault(); e.stopPropagation();
  RACE.keys[k] = type === 'keydown';
}, true));
document.addEventListener('visibilitychange', () => { if (document.hidden && RACE.running) racePause_(); });

on('race-go', () => raceGo_());
on('race-pause', () => racePause_());
on('race-reset', () => { raceReset_(); raceHud_(true); if (!RACE.running) raceDraw_(); });
/* THE ADMIN'S BUILD: minutes of Overpass and elevation calls on the backend; asked again here, and a third time there. */
on('race-build', () => {
  if (!(typeof isAdmin === 'function' && isAdmin()) || RACE.building) return;
  raceBuildNow_();
});
function raceBuildNow_() {
  RACE.building = send({ action: 'raceBuild', personId: (USER && USER.personId) || '' })
    .then(d => {
      toast('Map built: ' + (d.roads || 0) + ' roads, ' + (d.bld || 0) + ' buildings, '
        + (d.flat ? 'flat — no elevation service answered' : (d.lowest || 0) + '–' + (d.highest || 0) + ' m') + '.');
      /* THE NEW MAP REPLACES THE ONE ON THE GLASS: paused first, so a lap is not carried into another town. */
      racePause_();
      RACE.map = null; RACE.world = null;
    }, err => toast(err && err.reply && err.reply.more ? String(err.message) : 'The map was not built — ' + why_(err)))
    .then(() => { RACE.building = null; if (!RACE.map) raceFetch_(); racePaint_(); });
  racePaint_();
}
