/* @family. — race.gs THE RACER'S GROUND: roads, heights and buildings round Colliers Wood, built and served */

/* ---------- THE COLLIERS WOOD RACER'S GROUND (426) ---------- */
/* About 1.5 km square round Colliers Wood station: south, west, north, east. `?run=buildRaceMap&arg=s,w,n,e` builds another box. */
const RACE_BOX = [51.4113, -0.1888, 51.4247, -0.1672];
const RACE_STEP_M = 15;      // a road is sampled every 15 m
const RACE_GRID_M = 40;      // and the ground between the roads every 40 m
const RACE_PROP = 'RACE_MAP';
const RACE_FILE = 'family-race-map.json';
const RACE_HIGHWAYS = 'motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service'
  + '|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link';
/* Carriageway widths in metres where OSM gives neither `width` nor `lanes` — typical London figures, not measured. */
const RACE_WIDTH = { motorway: 11, trunk: 10, primary: 10, secondary: 9, tertiary: 8, unclassified: 6,
                     residential: 6.5, living_street: 5, service: 4 };
/* Tried in order; the first that answers for the whole box is used for all of it, so two datasets never meet in one map. */
/* `per`: points in one ask. A GET must stay under UrlFetch's 2 kB URL limit — 100 points made 2.4 kB and every ask threw (464). */
const RACE_DEMS = [
  { id: 'eudem25m', name: 'EU-DEM 25 m (Copernicus) via OpenTopoData', url: 'https://api.opentopodata.org/v1/eudem25m', per: 80 },
  { id: 'srtm30m', name: 'SRTM 30 m (NASA) via OpenTopoData', url: 'https://api.opentopodata.org/v1/srtm30m', per: 80 },
  { id: 'meteo', name: 'Copernicus GLO-90 via Open-Meteo', url: 'https://api.open-meteo.com/v1/elevation', per: 80 },
  { id: 'openelev', name: 'Open-Elevation (SRTM)', url: 'https://api.open-elevation.com/api/v1/lookup', per: 100 },
];
/* NO DATASET ANSWERED: the map is built flat rather than not at all, and says so (464). */
const RACE_FLAT = 'none — flat ground (no elevation service answered)';
const RACE_URL_MAX = 2000;
const RACE_OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
                       'https://overpass.private.coffee/api/interpreter'];

/* What was built last: `{ id, at, bytes, dem, roads, pts, bld }` or `{}`. */
function raceState_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(RACE_PROP) || '{}') || {}; }
  catch (err) { return {}; }
}

/* DOUGLAS–PEUCKER on [x, y] metres: the point furthest from the chord stays if it is further off than `tol`. */
function raceSimplify_(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy);
  let worst = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = len ? Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len
                  : Math.sqrt(Math.pow(p[0] - a[0], 2) + Math.pow(p[1] - a[1], 2));
    if (d > worst) { worst = d; at = i; }
  }
  if (worst <= tol) return [a, b];
  return raceSimplify_(pts.slice(0, at + 1), tol).slice(0, -1).concat(raceSimplify_(pts.slice(at), tol));
}

/* ONE OVERPASS QUERY, mirror by mirror: 429 and 504 are about that server now, not about the query. */
function raceOverpass_(q) {
  const tried = [];
  for (let i = 0; i < RACE_OVERPASS.length; i++) {
    const where = RACE_OVERPASS[i].replace(/^https:\/\//, '').replace(/\/.*$/, '');
    try {
      const res = UrlFetchApp.fetch(RACE_OVERPASS[i], { method: 'post', payload: { data: q }, muteHttpExceptions: true });
      const code = res.getResponseCode();
      if (code === 200) return { data: JSON.parse(res.getContentText()), from: where };
      tried.push(where + ' answered ' + code);
    } catch (err) {
      tried.push(where + ' — ' + String((err && err.message) || err).replace(/\n[\s\S]*$/, ''));
    }
  }
  return { error: 'No Overpass server answered.', tried: tried };
}

/* ONE BATCH OF AT MOST `dem.per` POINTS from one dataset: heights in metres, or null if it would not answer for every point. */
function raceDemBatch_(dem, batch) {
  let res;
  const f5 = v => v.toFixed(5);   // about 1 m, finer than any of the datasets
  if (dem.id === 'openelev') {
    res = UrlFetchApp.fetch(dem.url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ locations: batch.map(p => ({ latitude: p[0], longitude: p[1] })) }) });
  } else {
    /* `|` ENCODED: UrlFetchApp refuses a bare one. Commas are legal in a query and left bare to keep the URL short. */
    const url = dem.id === 'meteo'
      ? dem.url + '?latitude=' + batch.map(p => f5(p[0])).join(',') + '&longitude=' + batch.map(p => f5(p[1])).join(',')
      : dem.url + '?locations=' + batch.map(p => f5(p[0]) + ',' + f5(p[1])).join('%7C');
    if (url.length > RACE_URL_MAX) throw new Error('a ' + url.length + '-character URL is over the 2 kB UrlFetch limit');
    res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  }
  if (res.getResponseCode() !== 200) return null;
  const body = JSON.parse(res.getContentText()) || {};
  /* OPEN-METEO answers `{ elevation: [h, …] }`; OpenTopoData and Open-Elevation `{ results: [{ elevation }] }`. */
  const got = dem.id === 'meteo' ? (body.elevation || []).map(v => ({ elevation: v })) : (body.results || []);
  if (got.length !== batch.length) return null;
  const out = got.map(q => (q && typeof q.elevation === 'number' && isFinite(q.elevation)) ? q.elevation : null);
  return out.some(v => v === null) ? null : out;
}

/* HEIGHTS FOR EVERY POINT, kept in the script cache six hours per point and dataset, so a run that ran out of time resumes. */
function raceHeights_(ll, until) {
  const c = payloadCache_();
  const keyOf = (dem, p) => 'el:' + dem.id + ':' + p[0].toFixed(5) + ',' + p[1].toFixed(5);
  const notes = [];
  for (let d = 0; d < RACE_DEMS.length; d++) {
    const dem = RACE_DEMS[d];
    const h = new Array(ll.length).fill(null);
    for (let i = 0; i < ll.length; i += 100) {
      const ks = ll.slice(i, i + 100).map(p => keyOf(dem, p));
      let got = {};
      try { got = c ? c.getAll(ks) : {}; } catch (err) { got = {}; }
      ks.forEach((k, j) => { if (got[k] !== undefined && got[k] !== null && got[k] !== '') h[i + j] = Number(got[k]); });
    }
    const want = [];
    h.forEach((v, i) => { if (v === null) want.push(i); });
    let gaveUp = false, asked = 0;
    const per = dem.per || 80;
    for (let i = 0; i < want.length; i += per) {
      if (Date.now() > until) break;
      const idx = want.slice(i, i + per);
      let vals = null;
      try { vals = raceDemBatch_(dem, idx.map(k => ll[k])); } catch (err) { notes.push(dem.id + ': ' + String(err && err.message || err)); }
      asked++;
      /* THE FIRST ASK DECIDES THE DATASET: one that cannot answer for the box is left for the next, not patched. */
      if (!vals) { gaveUp = true; notes.push(dem.id + ' did not answer for every point'); break; }
      const put = {};
      idx.forEach((k, j) => { h[k] = vals[j]; put[keyOf(dem, ll[k])] = String(vals[j]); });
      try { if (c) c.putAll(put, 21600); } catch (err) {}
      /* OpenTopoData's public limit is one call a second. */
      Utilities.sleep(1100);
    }
    if (gaveUp) continue;
    const missing = h.filter(v => v === null).length;
    return { h: h, dem: dem, missing: missing, asked: asked, notes: notes };
  }
  return { h: null, missing: ll.length, notes: notes };
}

/* A SPIKE IS A ROOF OR A TREE in a surface model, not the road: each height becomes the median of its neighbours within 25 m. */
function raceMedian_(xy, h, r) {
  const cell = r, grid = {};
  const at = (x, y) => Math.floor(x / cell) + ':' + Math.floor(y / cell);
  xy.forEach((p, i) => { const k = at(p[0], p[1]); (grid[k] = grid[k] || []).push(i); });
  return xy.map((p, i) => {
    const cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell), near = [];
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      (grid[(cx + a) + ':' + (cy + b)] || []).forEach(j => {
        const dx = xy[j][0] - p[0], dy = xy[j][1] - p[1];
        if (dx * dx + dy * dy <= r * r) near.push(h[j]);
      });
    }
    near.sort((u, v) => u - v);
    return near.length ? near[near.length >> 1] : h[i];
  });
}

/* A BUILDING'S HEIGHT: its tag, else its storeys, else a typical figure for what it is. */
function raceBuildingH_(tags) {
  const m = N(String(tags.height || '').replace(/[^\d.]/g, ''));
  if (m >= 2 && m < 200) return m;
  const lv = N(tags['building:levels']);
  if (lv >= 1 && lv < 60) return lv * 3 + 1;
  const use = S(tags.building);
  if (/^(garage|garages|shed|hut|kiosk|carport|roof)$/.test(use)) return 3;
  if (/^(apartments|flats|office|hotel)$/.test(use)) return 12;
  if (/^(retail|commercial|industrial|warehouse|supermarket|church|school)$/.test(use)) return 9;
  return 7.5;
}

/* THE RACER'S MAP: OSM roads, water and buildings for the box, heights from a DEM, as one JSON file in Drive (426). */
function buildRaceMap_(arg) {
  const t0 = Date.now();
  const props = PropertiesService.getScriptProperties();
  const busy = N(props.getProperty('RACE_BUILDING'));
  if (busy && t0 - busy < 6 * 60 * 1000) return { error: 'The map is already being built — give it a few minutes.' };
  props.setProperty('RACE_BUILDING', String(t0));
  try { return raceBuild_(arg, t0); }
  finally { try { props.deleteProperty('RACE_BUILDING'); } catch (err) {} }
}

/* THE OVERPASS QUERY for one box: roads (with their nodes), rivers and buildings. */
function raceQuery_(bb) {
  return '[out:json][timeout:150];'
    + '(way["highway"~"^(' + RACE_HIGHWAYS + ')$"]["area"!="yes"](' + bb + '););out body;>;out skel qt;'
    + '(way["waterway"~"^(river|stream|canal)$"](' + bb + '););out geom qt;'
    + '(way["building"](' + bb + '););out geom qt;';
}

/* METRES ROUND THE BOX'S CENTRE: the conversions both ways, the half-size, and what counts as inside. */
function raceFrame_(box) {
  const [s, w, n, e] = box;
  const lat0 = (s + n) / 2, lon0 = (w + e) / 2;
  const mLat = 111320, mLon = 111320 * Math.cos(lat0 * Math.PI / 180);
  const toXY = (la, lo) => [(lo - lon0) * mLon, (la - lat0) * mLat];
  const toLL = (x, y) => [lat0 + y / mLat, lon0 + x / mLon];
  const half = [(e - w) / 2 * mLon, (n - s) / 2 * mLat];
  /* A WAY THAT LEAVES THE BOX is kept 60 m past its edge and cut there. */
  const inside = p => Math.abs(p[0]) <= half[0] + 60 && Math.abs(p[1]) <= half[1] + 60;
  return { lat0: lat0, lon0: lon0, toXY: toXY, toLL: toLL, half: half, inside: inside };
}

/* ONE ROAD: its width and one-way, sampled every RACE_STEP_M, cut into runs that stay inside. */
function raceRoad_(el, tags, nodes, fr, ptOf, roads) {
  const kind = S(tags.highway).replace(/_link$/, '');
  const lanes = Math.round(N(tags.lanes)) || 0;
  const wTag = N(String(tags.width || '').replace(/[^\d.]/g, ''));
  const width = wTag >= 2 && wTag <= 30 ? wTag : lanes ? lanes * 3.3 : (RACE_WIDTH[kind] || 6);
  const one = /^(yes|true|1|-1)$/.test(S(tags.oneway)) || S(tags.junction) === 'roundabout' ? 1 : 0;
  /* SAMPLED FIRST, THEN CUT, so a way leaving the box keeps its points up to 60 m past the edge. */
  const seq = [];
  let prev = null;
  el.nodes.forEach(id => {
    const ll = nodes[id];
    if (!ll) { seq.push(null); prev = null; return; }
    const p = fr.toXY(ll[0], ll[1]);
    if (prev) {
      const d = Math.sqrt(Math.pow(p[0] - prev[0], 2) + Math.pow(p[1] - prev[1], 2));
      const parts = Math.ceil(d / RACE_STEP_M);
      for (let k = 1; k < parts; k++) {
        const f = k / parts;
        seq.push({ id: '', p: [prev[0] + (p[0] - prev[0]) * f, prev[1] + (p[1] - prev[1]) * f] });
      }
    }
    seq.push({ id: 'n' + id, p: p });
    prev = p;
  });
  let run = [];
  const flush = () => { if (run.length > 1) roads.push([S(tags.name || tags.ref), kind, Math.round(width * 10), lanes, one, run]); run = []; };
  seq.forEach(q => {
    if (!q || !fr.inside(q.p)) { flush(); return; }
    run.push(ptOf(q.id, q.p));
  });
  flush();
}

function raceWater_(el, tags, fr, water) {
  const line = raceSimplify_(el.geometry.map(g => fr.toXY(g.lat, g.lon)).filter(fr.inside), 2);
  const wd = N(String(tags.width || '').replace(/[^\d.]/g, '')) || (S(tags.waterway) === 'stream' ? 3 : 9);
  if (line.length > 1) water.push([S(tags.name), Math.round(wd * 10), [].concat.apply([], line.map(p => [Math.round(p[0] * 10), Math.round(p[1] * 10)]))]);
}

/* A BUILDING wholly inside, simplified, and not a shed under 12 square metres. */
function raceBuilding_(el, tags, fr, bld) {
  let ring = el.geometry.map(g => fr.toXY(g.lat, g.lon));
  if (ring.length > 3) ring.pop();                 // the closing point repeats the first
  if (!ring.every(fr.inside)) return;
  ring = raceSimplify_(ring, 0.6);
  if (ring.length < 3) return;
  let area = 0;
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; area += a[0] * b[1] - b[0] * a[1]; }
  if (Math.abs(area / 2) < 12) return;
  bld.push([Math.round(raceBuildingH_(tags) * 10), [].concat.apply([], ring.map(p => [Math.round(p[0] * 10), Math.round(p[1] * 10)]))]);
}

/* EVERY WAY OVERPASS SENT, sorted into roads, water and buildings; XY holds the road points, shared at junctions. */
function raceWays_(els, fr) {
  const nodes = {};
  els.forEach(el => { if (el.type === 'node') nodes[el.id] = [el.lat, el.lon]; });

  const XY = [], byNode = {};
  const ptOf = (id, p) => {
    if (id && byNode[id] !== undefined) return byNode[id];
    XY.push(p);
    if (id) byNode[id] = XY.length - 1;
    return XY.length - 1;
  };
  const roads = [], water = [], bld = [];
  els.forEach(el => {
    if (el.type !== 'way') return;
    const tags = el.tags || {};
    if (tags.highway && el.nodes) raceRoad_(el, tags, nodes, fr, ptOf, roads);
    else if (tags.waterway && el.geometry) raceWater_(el, tags, fr, water);
    else if (tags.building && el.geometry && bld.length < 9000) raceBuilding_(el, tags, fr, bld);
  });
  return { XY: XY, roads: roads, water: water, bld: bld };
}

/* THE GROUND BETWEEN THE ROADS, on a grid, so off the road is not flat. */
function raceGrid_(half) {
  const nx = Math.ceil(half[0] * 2 / RACE_GRID_M) + 1, ny = Math.ceil(half[1] * 2 / RACE_GRID_M) + 1;
  const gx0 = -half[0], gy0 = -half[1];
  const GXY = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) GXY.push([gx0 + i * RACE_GRID_M, gy0 + j * RACE_GRID_M]);
  return { nx: nx, ny: ny, gx0: gx0, gy0: gy0, GXY: GXY };
}

/* THE MAP INTO ITS DRIVE FILE, the same file again while it still exists. */
function raceSaveFile_(body) {
  const st = raceState_();
  let file = null;
  if (st.id) { try { file = DriveApp.getFileById(st.id); if (file && file.isTrashed && file.isTrashed()) file = null; } catch (err) { file = null; } }
  if (file) file.setContent(body);
  else file = DriveApp.createFile(RACE_FILE, body, 'application/json');
  return file;
}

function raceBuild_(arg, t0) {
  const asked = S(arg).split(',').map(Number);
  const box = asked.length === 4 && asked.every(v => isFinite(v) && v) ? asked : RACE_BOX;
  const bb = box.join(',');
  const got = raceOverpass_(raceQuery_(bb));
  if (got.error) return got;
  const els = (got.data && got.data.elements) || [];

  const fr = raceFrame_(box);
  const ways = raceWays_(els, fr), XY = ways.XY, roads = ways.roads, water = ways.water, bld = ways.bld;
  if (!roads.length) return { error: 'Overpass answered but sent no roads for ' + bb + '.', from: got.from };

  const g = raceGrid_(fr.half);
  const all = XY.concat(g.GXY);
  let hs = raceHeights_(all.map(p => fr.toLL(p[0], p[1])), t0 + 280 * 1000);
  /* EVERY DATASET REFUSED: flat beats nothing — the roads, buildings and laps are still Colliers Wood's (464). */
  if (!hs.h) hs = { h: all.map(() => 0), dem: { name: RACE_FLAT }, missing: 0, notes: hs.notes };
  if (hs.missing) {
    return { error: 'Heights for ' + (all.length - hs.missing) + ' of ' + all.length + ' points before time ran out. '
                  + 'Run it again — those are kept for six hours, so it carries on.', more: true, dem: hs.dem.name };
  }
  const sm = raceMedian_(all, hs.h, 25);
  const dm = v => Math.round(v * 10);
  const pts = [];
  XY.forEach((p, i) => { pts.push(dm(p[0]), dm(p[1]), dm(sm[i])); });
  const map = {
    v: 1, place: 'Colliers Wood', built: new Date().toISOString(), box: box, origin: [fr.lat0, fr.lon0], step: RACE_STEP_M,
    osm: 'Map data © OpenStreetMap contributors (ODbL)', dem: hs.dem.name,
    pts: pts, roads: roads, water: water, bld: bld,
    grid: { x0: dm(g.gx0), y0: dm(g.gy0), cell: RACE_GRID_M, nx: g.nx, ny: g.ny, h: sm.slice(XY.length).map(dm) },
  };
  const body = JSON.stringify(map);

  const file = raceSaveFile_(body);
  const lo = Math.min.apply(null, sm.slice(0, XY.length)), hi = Math.max.apply(null, sm.slice(0, XY.length));
  const said = { id: file.getId(), at: Date.now(), bytes: body.length, dem: hs.dem.name,
                 roads: roads.length, pts: XY.length, bld: bld.length };
  PropertiesService.getScriptProperties().setProperty(RACE_PROP, JSON.stringify(said));
  return Object.assign({ built: true, flat: hs.dem.name === RACE_FLAT, notes: (hs.notes || []).slice(0, 8), water: water.length, lowest: Math.round(lo * 10) / 10, highest: Math.round(hi * 10) / 10,
                         seconds: Math.round((Date.now() - t0) / 1000), overpass: got.from,
                         attribution: map.osm + '; heights ' + map.dem }, said);
}

/* `?race=1`: the map as built, from the script cache or from Drive — never in the payload, which every page load carries. */
function raceServe_() {
  const st = raceState_();
  const empty = extra => jsonOut(Object.assign({ version: BACKEND_VERSION, built: false, race: null }, extra || {}));
  if (!st.id) return empty();
  const ck = 'race|' + st.id + '|' + st.at;
  let body = cacheGet_(ck);
  if (!body) {
    try { body = DriveApp.getFileById(st.id).getBlob().getDataAsString(); }
    catch (err) { return empty({ error: 'The map file could not be opened: ' + S(err && err.message || err) }); }
    cachePut_(ck, body);
  }
  let race = null;
  try { race = JSON.parse(body); } catch (err) { return empty({ error: 'The map file is not JSON — build it again.' }); }
  /* THROUGH `jsonOut` LIKE EVERY REPLY, so the nets on it cover this one too. */
  return jsonOut({ version: BACKEND_VERSION, built: true, race: race });
}
