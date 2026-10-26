/* @family. — 40_content.gs (5 of 8) POSTS, RESOURCES, THE MAP, AND DRIVE. § */


/* WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens. § */
/* THE CONSENT SCREEN, AS A LINK. § */
function consentUrl_() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const url = info && info.getAuthorizationUrl ? info.getAuthorizationUrl() : '';
    return url || '';
  } catch (err) { return ''; }
}

/** Fill in the postcodes we know, for venues that have none. Returns how many it wrote. */
function seedPostcodes() {
  const t = read(TAB.venues);
  if (!t.sheet || t.headers.indexOf('postcode') < 0) return 0;
  const by = {};
  Object.keys(KNOWN_POSTCODES).forEach(n => { by[key(n)] = KNOWN_POSTCODES[n]; });
  let wrote = 0;
  t.rows.forEach(r => {
    if (S(r.postcode)) return;                       // theirs wins, always
    const got = by[key(S(r.name))];
    if (!got) return;
    setCell(t, r, 'postcode', got);
    wrote++;
  });
  if (wrote) clearCache();
  return wrote;
}

function geocodeVenues(force) {
  const t = read(TAB.venues);
  if (!t.sheet) return { error: 'no venues tab' };
  if (t.headers.indexOf('postcode') < 0) {
    return { error: 'the venues tab has no postcode column — deploy this version first, '
                  + 'then load ?setup=1' };
  }

  const want = t.rows.filter(r => S(r.name) && S(r.postcode)
    && (force || !(N(r.lat) && N(r.lng))));
  const noPostcode = t.rows.filter(r => S(r.name) && !S(r.postcode)).map(r => S(r.name));
  if (!want.length) {
    return { placed: 0, alreadyPlaced: t.rows.filter(r => N(r.lat) && N(r.lng)).length,
             noPostcode: noPostcode,
             note: noPostcode.length ? 'Fill in a postcode for those and run it again.'
                                     : 'Every venue with a postcode already has coordinates.' };
  }

  let placed = 0;
  const failed = [];
  /* A hundred a request is the service's own limit. Chunked rather than assumed, so the day this
     runs against a longer list it still works instead of silently returning nothing. */
  for (let i = 0; i < want.length; i += 100) {
    const batch = want.slice(i, i + 100);
    let out;
    try {
      const res = UrlFetchApp.fetch('https://api.postcodes.io/postcodes', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ postcodes: batch.map(r => S(r.postcode)) }),
      });
      out = JSON.parse(res.getContentText());
    } catch (err) {
      return { error: 'Could not reach postcodes.io: ' + err,
               placed: placed,
               note: 'Apps Script needs the external_request scope, which is inferred from '
                   + 'UrlFetchApp — if this is the first thing to use it, run any function from '
                   + 'the editor once and accept the prompt.' };
    }

    (out && out.result || []).forEach((entry, k) => {
      const row = batch[k];
      const got = entry && entry.result;
      /* A postcode the service does not recognise comes back as a null result rather than an error, so it has to be tested for — otherwise a typo writes `undefined` § */
      if (!got || !got.latitude || !got.longitude) { failed.push(S(row.name) + ' — ' + S(row.postcode)); return; }
      setCell(t, row, 'lat', got.latitude);
      setCell(t, row, 'lng', got.longitude);
      placed++;
    });
  }

  clearCache();
  const out2 = { placed: placed, couldNotPlace: failed, noPostcode: noPostcode };
  Logger.log(JSON.stringify(out2, null, 2));
  return out2;
}

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

function raceBuild_(arg, t0) {
  const asked = S(arg).split(',').map(Number);
  const box = asked.length === 4 && asked.every(v => isFinite(v) && v) ? asked : RACE_BOX;
  const [s, w, n, e] = box, bb = box.join(',');
  const q = '[out:json][timeout:150];'
    + '(way["highway"~"^(' + RACE_HIGHWAYS + ')$"]["area"!="yes"](' + bb + '););out body;>;out skel qt;'
    + '(way["waterway"~"^(river|stream|canal)$"](' + bb + '););out geom qt;'
    + '(way["building"](' + bb + '););out geom qt;';
  const got = raceOverpass_(q);
  if (got.error) return got;
  const els = (got.data && got.data.elements) || [];

  const lat0 = (s + n) / 2, lon0 = (w + e) / 2;
  const mLat = 111320, mLon = 111320 * Math.cos(lat0 * Math.PI / 180);
  const toXY = (la, lo) => [(lo - lon0) * mLon, (la - lat0) * mLat];
  const toLL = (x, y) => [lat0 + y / mLat, lon0 + x / mLon];
  const half = [(e - w) / 2 * mLon, (n - s) / 2 * mLat];
  /* A WAY THAT LEAVES THE BOX is kept 60 m past its edge and cut there. */
  const inside = p => Math.abs(p[0]) <= half[0] + 60 && Math.abs(p[1]) <= half[1] + 60;

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
    if (tags.highway && el.nodes) {
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
        const p = toXY(ll[0], ll[1]);
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
        if (!q || !inside(q.p)) { flush(); return; }
        run.push(ptOf(q.id, q.p));
      });
      flush();
    } else if (tags.waterway && el.geometry) {
      const line = raceSimplify_(el.geometry.map(g => toXY(g.lat, g.lon)).filter(inside), 2);
      const wd = N(String(tags.width || '').replace(/[^\d.]/g, '')) || (S(tags.waterway) === 'stream' ? 3 : 9);
      if (line.length > 1) water.push([S(tags.name), Math.round(wd * 10), [].concat.apply([], line.map(p => [Math.round(p[0] * 10), Math.round(p[1] * 10)]))]);
    } else if (tags.building && el.geometry && bld.length < 9000) {
      let ring = el.geometry.map(g => toXY(g.lat, g.lon));
      if (ring.length > 3) ring.pop();                 // the closing point repeats the first
      if (!ring.every(inside)) return;
      ring = raceSimplify_(ring, 0.6);
      if (ring.length < 3) return;
      let area = 0;
      for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; area += a[0] * b[1] - b[0] * a[1]; }
      if (Math.abs(area / 2) < 12) return;
      bld.push([Math.round(raceBuildingH_(tags) * 10), [].concat.apply([], ring.map(p => [Math.round(p[0] * 10), Math.round(p[1] * 10)]))]);
    }
  });
  if (!roads.length) return { error: 'Overpass answered but sent no roads for ' + bb + '.', from: got.from };

  /* THE GROUND BETWEEN THE ROADS, on a grid, so off the road is not flat. */
  const nx = Math.ceil(half[0] * 2 / RACE_GRID_M) + 1, ny = Math.ceil(half[1] * 2 / RACE_GRID_M) + 1;
  const gx0 = -half[0], gy0 = -half[1];
  const GXY = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) GXY.push([gx0 + i * RACE_GRID_M, gy0 + j * RACE_GRID_M]);

  const all = XY.concat(GXY);
  let hs = raceHeights_(all.map(p => toLL(p[0], p[1])), t0 + 280 * 1000);
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
    v: 1, place: 'Colliers Wood', built: new Date().toISOString(), box: box, origin: [lat0, lon0], step: RACE_STEP_M,
    osm: 'Map data © OpenStreetMap contributors (ODbL)', dem: hs.dem.name,
    pts: pts, roads: roads, water: water, bld: bld,
    grid: { x0: dm(gx0), y0: dm(gy0), cell: RACE_GRID_M, nx: nx, ny: ny, h: sm.slice(XY.length).map(dm) },
  };
  const body = JSON.stringify(map);

  const st = raceState_();
  let file = null;
  if (st.id) { try { file = DriveApp.getFileById(st.id); if (file && file.isTrashed && file.isTrashed()) file = null; } catch (err) { file = null; } }
  if (file) file.setContent(body);
  else file = DriveApp.createFile(RACE_FILE, body, 'application/json');
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

/* ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION § */
function driveDenied_(raw) {
  return /permission|authoriz|authoris|scope/i.test(S(raw));
}

/* ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS § */
function heldScopes_() {
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token='
        + encodeURIComponent(ScriptApp.getOAuthToken()),
      { muteHttpExceptions: true });
    const held = String((JSON.parse(res.getContentText() || '{}') || {}).scope || '')
      .split(/\s+/).filter(Boolean);
    return { held: held, error: '' };
  } catch (err) {
    return { held: [], error: String((err && err.message) || err) };
  }
}

/* ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS § */
function holdsScope_(held, name) {
  return (held || []).some(x => S(x).split('/auth/')[1] === name);
}

/* ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE § */
function driveFix_() {
  const consent = consentUrl_();
  return {
    consent: consent,
    say: (consent
      ? 'Open the consent link and press Allow, ticking every box; then run authoriseDrive in the '
        + 'Apps Script editor'
      : 'In the Apps Script editor run authoriseDrive and press Allow, ticking every box')
      + '. Only when its last line says READY: Deploy → Manage deployments → edit → Version: New '
      + 'version → Deploy. the authoriseDrive log says READY when it has worked.',
  };
}

/* ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT § */
function driveTrouble_(err, admin) {
  const raw = String((err && err.message) || err || '');
  if (!driveDenied_(raw)) return raw;
  if (!admin) {
    return 'The site is not allowed to save files to Google Drive at the moment — that is on our '
      + 'side, not yours, and the admin can see how to fix it.';
  }

  /* THE DIAGNOSIS COMES WITH THE FAILURE. § */
  const s = heldScopes_();
  if (s.error) {
    /* It could not even ask. That needs script.external_request, so the manifest has not reached
       this deployment at all — which is a different answer from "the Drive scope is missing", and
       it points at a different step. */
    return [raw, 'This deployment could not ask Google what it is allowed to do (' + s.error + '), so '
      + 'the manifest has not reached it. Sync backend/ — appsscript.json is one of its files — then '
      + 'deploy a NEW VERSION: a deployed version pins its manifest.'].join('\n');
  }

  if (!holdsScope_(s.held, 'drive')) {
    /* ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE § */
    const fix = driveFix_();
    return ['Drive refused it: this deployment holds ' + (holdsScope_(s.held, 'drive.readonly')
      ? 'drive.readonly, so it can read the folder and cannot add to it.' : 'no Drive scope at all.'),
      'FIX: ' + fix.say]
      .concat(fix.consent ? ['Consent link: ' + fix.consent] : []).join('\n');
  }
  /* The scope is held and the call still failed. That is a different problem entirely, and
     sending somebody back round the authorisation loop would waste their afternoon. */
  return [raw, '.../auth/drive IS held, so this is not the scope. Most likely the folder in '
    + '`posts_folder` belongs to another account or is on a shared drive that refuses sharing by '
    + 'link. authoriseDrive names the folder and tries a test file.'].join('\n');
}

/* WHEN A POST HAPPENED. § */
function postWhen_(r) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    const d = sheetDate(r[cols[i]]);
    if (d) return d;
  }
  return null;
}

/** Which date column this sheet writes to. The first one it actually has, same order. */
function dateCol_(t) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    if (t.headers.indexOf(cols[i]) >= 0) return cols[i];
  }
  return 'posted_on';
}

/* EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read, so the order is decided here and nowhere else. § */
function postMediaOut_(r) {
  const out = [];
  [S(r.image)].concat(S(r.media).split('|')).forEach(x => {
    const v = S(x).trim();
    if (v && out.indexOf(v) < 0) out.push(v);
  });
  return out;
}

/* A file's name without its extension. § */
function captionFromName_(n) {
  return S(n).replace(/\.[^./]+$/, '').trim();
}

/* `fillPostNames_` WAS HERE, and it is gone with the Drive call it made. § */


/** The set on offer, most specific first: this post's own, then the brand tab, then the code. */
function reactionSet(postRow) {
  const own = S(postRow && postRow.reactions).split(/\s+/).filter(Boolean);
  if (own.length) return own;
  /* THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`, read by `settingsInto_` on the phone. § */
  return HOUSE_REACTIONS.slice();
}

function getPostFolder() {
  const cfg = config();
  let id = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) || POSTS_FOLDER;

  /* A pasted URL works as well as a bare id. Somebody copying a folder link and pasting the whole
     thing is the obvious mistake, and refusing it would be pedantry — the id is right there. */
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;

  if (!id) id = PropertiesService.getScriptProperties().getProperty('POSTS_FOLDER_ID') || '';
  if (!id) return null;

  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    /* Wrong id, or a folder this script cannot reach. Returning null rather than throwing, so the
       caller can say something useful instead of the request dying. */
    return null;
  }
}

/* ---------- A PICTURE, A CLIP OR A FILE IN A MESSAGE § */
function getMessageFolder_() {
  /* ---------- A FOLDER THAT COULD NOT BE MADE IS NOT A FOLDER THAT IS NOT THERE § */
  const posts = getPostFolder();
  if (!posts) return { none: true };
  try {
    const it = posts.getFoldersByName('Messages');
    return { folder: it.hasNext() ? it.next() : posts.createFolder('Messages') };
  } catch (err) { return { err: err }; }
}

/* ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK § */
function driveKeep_(folder, raw, name) {
  const v = S(raw).trim();
  if (!v) return '';
  if (!/^data:/i.test(v)) return v;
  const parts = v.split(',');
  const type = ((parts[0] || '').match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const ext = ({ 'image/jpeg': 'jpg', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v' })[type]
    || (type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
  const blob = Utilities.newBlob(Utilities.base64Decode(parts[1] || ''), type, S(name) + '.' + ext);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  /* `#video` IS HOW THE PHONE KNOWS WHICH ELEMENT TO DRAW. A Drive address names no type. */
  return 'https://drive.google.com/file/d/' + file.getId() + '/view'
    + (/^video\//i.test(type) ? '#video' : '');
}

/* ---------- WHAT A POST MAY PUT IN DRIVE § */
const POST_FILE_MAX  = 20 * 1048576;
const POST_FILES_MAX = Math.floor(45 * 1048576 * 3 / 4);
const POST_PIC_MAX   = 8 * 1048576;

function postMediaRefusal_(list) {
  const all = (list || []).map(x => S(x).trim()).filter(Boolean);
  /* NO LINKS (413): a post's pictures are files the author chose, uploaded here — never an address typed or pasted. */
  if (all.some(x => !/^data:/i.test(x))) {
    return 'A post takes pictures chosen from your phone, not links. Nothing was posted.';
  }
  const ups = all;
  let total = 0;
  for (let i = 0; i < ups.length; i++) {
    const head = (ups[i].match(/^data:([^;,]*);base64,/i) || [])[1] || '';
    if (!/^(image\/(jpeg|png|gif|webp|heic|heif)|video\/[\w.+-]+)$/i.test(head)) {
      return 'A post can hold photos and videos only' + (head ? ' — not ' + head : '') + '. Nothing was posted.';
    }
    const bytes = Math.floor((ups[i].length - ups[i].indexOf(',') - 1) * 3 / 4);
    /* A PICTURE IS REDRAWN AT 1600px ON THE PHONE (`camItemOf_`), well under a megabyte; one this big was never redrawn. */
    if (/^image\//i.test(head) && bytes > POST_PIC_MAX) {
      return 'A picture in this post is over ' + (POST_PIC_MAX / 1048576) + 'MB — choose a smaller one. Nothing was posted.';
    }
    if (bytes > POST_FILE_MAX) {
      return (/^video\//i.test(head) ? 'A clip' : 'A picture') + ' in this post is over 20MB — trim it '
        + 'to about twenty seconds and post again. Nothing was posted.';
    }
    total += bytes;
  }
  if (total > POST_FILES_MAX) {
    return 'That is too much to post at once (over 33MB). Post the clips separately. Nothing was posted.';
  }
  return '';
}

/* ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING § */
const POST_WAITING_MAX = 5;

/* IS THIS POST THEIRS — who pressed Post (`posted_by`), or the name on it for a row typed before that column. */
function postIsBy_(r, me) {
  const id = S(me && me.person_id);
  const p = id ? findPerson(S(r && r.posted_by) || S(r && r.author)) : null;
  return !!p && S(p.person_id) === id;
}
/* WAITING, UP OR TURNED DOWN — one reading of the `approved` cell (blank is up: an admin's own, or a row typed in). */
function postState_(r) {
  const s = norm(r && r.approved);
  return s === 'pending' ? 'pending' : s === 'refused' ? 'refused' : 'up';
}

/* MESSAGES SOMEBODY REPORTED AND NOBODY HAS DEALT WITH (413), newest first — for the admin's Reports card only. */
function flaggedMessages_() {
  const t = read(TAB.messages);
  const nm = id => { const p = id ? findPerson('', id) : null; return p ? personDisplayName(p) : ''; };
  return t.rows.filter(r => S(r.message_id) && TRUE_(r.flagged))
    .map(r => ({ id: S(r.message_id), from: nm(S(r.from_id)), to: nm(S(r.to_id)), reason: S(r.flag_reason),
                 body: S(r.body).slice(0, 300), files: msgAttachOut_(r.attachments).length,
                 at: sheetDate(r.sent_at) ? sheetDate(r.sent_at).getTime() : 0 }))
    .sort((a, b) => b.at - a.at).slice(0, 50);
}

/* A CHILD UPLOADS NO PICTURE (413): rank Student, refused at every door that would keep one. */
const CHILD_NO_UPLOAD = 'Pictures are put up by a grown-up — ask your parent or tutor. Nothing was sent.';

function postsWaitingFor_(t, me) {
  const id = S(me && me.person_id);
  if (!id) return 0;
  return ((t && t.rows) || []).filter(r => postState_(r) === 'pending' && ON_(r.active) && postIsBy_(r, me)).length;
}

/* ---------- WHERE PROFILE PICTURES GO § */
function getPhotoFolder_() {
  const cfg = config();
  let id = S(cfg.photos_folder || cfg.PHOTOS_FOLDER || cfg.photosFolder);
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* a wrong id falls back, below */ }
  }
  return getPostFolder();
}

/* The caps, in DECODED bytes, and the phone enforces the same numbers first (`MSG_CAP_` in me.js) so a person is told before a minute of upload rather than after § */
const MSG_FILE_MAX  = 20 * 1024 * 1024;
const MSG_FILES_MAX = 32 * 1024 * 1024;
const MSG_FILES_COUNT = 6;

/* ONE CELL, `url#type#name` items joined by ` | `. § */
function msgAttachIn_(list) {
  return (list || []).map(a => [
    S(a.url), S(a.type).replace(/[#|]/g, ''),
    S(a.name).replace(/[#|\r\n]/g, ' ').trim().slice(0, 120),
  ].join('#')).join(' | ');
}

function msgAttachOut_(cell) {
  return S(cell).split('|').map(x => x.trim()).filter(Boolean).map(x => {
    const p = x.split('#');
    return { url: S(p[0]), type: S(p[1]), name: S(p.slice(2).join(' ')) };
  }).filter(a => /^https?:\/\//.test(a.url));
}

/* ---------- A FILE WITH NO TYPE IS TYPED BY ITS NAME § */
function msgTypeOf_(type, name) {
  const t = S(type).toLowerCase();
  if (t && t !== 'application/octet-stream') return t;
  const ext = (S(name).toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';
  return ({
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    heic: 'image/heic', heif: 'image/heif',
    mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/x-m4v', webm: 'video/webm', '3gp': 'video/3gpp',
    pdf: 'application/pdf',
  })[ext] || t || 'application/octet-stream';
}

/* ---------- WHERE `?setup=1` IS, FOR THE ADMIN'S SENTENCE § */
function setupUrl_() {
  try {
    const u = S(ScriptApp.getService().getUrl());
    return u ? u + '?setup=1' : '';
  } catch (err) { return ''; }
}

/* ---------- WHAT A MESSAGE WITH FILES SAYS WHEN THE FILES CANNOT GO § */
function msgNoColumn_(admin) {
  const lead = 'Photos and videos cannot be sent yet, so nothing was sent. ';
  if (!admin) {
    return { why: 'files', error: lead + 'The site is missing a column it needs — the admin can see '
      + 'how to fix it.' };
  }
  const url = setupUrl_();
  return { why: 'files', error: lead + 'The messages tab in the Ledger has no `attachments` column. '
    + 'Open ' + (url || 'the site\'s /exec address with ?setup=1') + ' once — it adds missing columns and '
    + 'changes nothing else — then try sending a photo.', setup: true };
}

/* `{ error, why }` or `{ list }`. § */
function msgAttachSave_(files, admin) {
  const raw = (Array.isArray(files) ? files : []).filter(f => f && S(f.data));
  if (!raw.length) return { list: [] };
  if (raw.length > MSG_FILES_COUNT) {
    return { error: 'Up to ' + MSG_FILES_COUNT + ' files in one message.' };
  }
  const blobs = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const f = raw[i];
    const parts = S(f.data).split(',');
    const name = S(f.name).replace(/[\\/]/g, '-').slice(0, 120) || ('file-' + (i + 1));
    const type = msgTypeOf_((parts[0].match(/data:([^;]+)/) || [])[1] || S(f.type), name);
    let bytes;
    try { bytes = Utilities.base64Decode(parts[1] || ''); }
    catch (err) { return { error: 'Could not read ' + (S(f.name) || 'a file') + '.' }; }
    if (bytes.length > MSG_FILE_MAX) {
      return { error: (S(f.name) || 'A file') + ' is over 20MB — too big to send.' };
    }
    total += bytes.length;
    if (total > MSG_FILES_MAX) return { error: 'Those files add up to more than 32MB — send fewer at once.' };
    blobs.push({ blob: Utilities.newBlob(bytes, type, name), type: type, name: name });
  }
  const lead = (blobs.length === 1 ? 'The file' : 'The files') + ' could not be kept, so nothing was sent. ';
  const got = getMessageFolder_();
  if (got.none) {
    return { why: 'files', error: lead + (admin
      ? 'There is no posts folder for files to go in: add a row to the config tab, key `posts_folder`, '
        + 'value the id from the folder URL — then try sending a photo.'
      : 'The site has nowhere to put them yet — the admin can see why.') };
  }
  if (got.err) return { why: 'files', error: lead + driveTrouble_(got.err, admin) };
  const out = [], made = [];
  let at = '';
  try {
    blobs.forEach(b => {
      at = b.name;
      const file = got.folder.createFile(b.blob);
      made.push(file);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      out.push({ url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
                 type: b.type, name: b.name });
    });
  } catch (err) {
    made.forEach(f => { try { f.setTrashed(true); } catch (e) { /* the bin is a courtesy */ } });
    /* WHICH ONE, when it was not the first — a refusal about "the files" when two went and the
       third did not sends somebody looking at the wrong photograph. */
    const which = made.length && at ? at + ' could not be kept, so nothing was sent. ' : lead;
    return { why: 'files', error: which + driveTrouble_(err, admin) };
  }
  return { list: out };
}

/* ---------- CHECK UPLOADS: CAN A PHOTOGRAPH IN A MESSAGE BE KEPT, ASKED OF WHAT IS SERVING § */
function uploadsCheck_() {
  const checks = [];
  const add = (id, ok, label, said) => checks.push({ id: id, ok: !!ok, label: label, said: S(said) });

  let hasColumn = false;
  try { hasColumn = read(TAB.messages).headers.indexOf('attachments') >= 0; } catch (err) { /* no tab: no */ }
  add('column', hasColumn, 'The messages tab has an attachments column',
    hasColumn ? 'Yes — a file’s address has somewhere to go.'
              : 'No. ?setup=1 adds it, and changes nothing else.');

  const cfg = config();
  const from = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) ? 'posts_folder in the config tab'
    : (POSTS_FOLDER ? 'POSTS_FOLDER in constants.gs' : 'the POSTS_FOLDER_ID script property');
  const posts = getPostFolder();
  let name = '', messages = null;
  if (posts) {
    try { name = S(posts.getName()); } catch (err) { /* opened and nameless is still opened */ }
    try { const it = posts.getFoldersByName('Messages'); if (it.hasNext()) messages = it.next(); }
    catch (err) { /* asked again, properly, by the write below */ }
  }

  let wrote = false;
  let wroteSaid = 'Not tried — there is no folder to try it in.';
  if (posts) {
    let probe = null;
    try {
      probe = (messages || posts).createFile('family-upload-check.txt',
        'Made by an upload test and binned straight away. Safe to delete.');
      probe.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      wrote = true;
      wroteSaid = 'Yes — a test file was made, shared by link and binned.';
    } catch (err) {
      /* GOOGLE'S SENTENCE ONLY WHEN IT IS NOT THE SCOPE. § */
      const raw = S((err && err.message) || err);
      wroteSaid = driveDenied_(raw) ? 'No — Drive refused it for want of permission.' : 'No — ' + raw;
    }
    if (probe) {
      try { probe.setTrashed(true); }
      catch (err) { wroteSaid += ' It could not be binned: delete family-upload-check.txt by hand.'; }
    }
  }

  /* THE SCOPE IS READ OFF THE TOKEN, AND THE WRITE IS THE EVIDENCE. § */
  const s = heldScopes_();
  const drive = holdsScope_(s.held, 'drive');
  add('scope', drive || wrote, 'This deployment may write to Drive',
    drive ? 'It holds .../auth/drive.'
    : s.error ? 'Google could not be asked (' + s.error + ')' + (wrote ? ', but the test write worked.' : '.')
    : holdsScope_(s.held, 'drive.readonly') ? 'It holds drive.readonly — it can read and cannot write.'
    : 'It holds no Drive scope at all.');
  add('folder', !!posts, 'The posts folder opens',
    posts ? '“' + (name || 'untitled') + '”, from ' + from + (messages
      ? ', with its Messages folder.' : '.')
    : 'No — ' + from + ' does not open a folder this account can reach.');
  add('write', wrote, 'A file can be made there and shared by link', wroteSaid);

  const steps = [];
  const fix = driveFix_();
  if (!wrote && !drive && !s.error) {
    steps.push({ text: 'Sync backend/ from GitHub, so appsscript.json in the editor lists '
      + '.../auth/drive and not drive.readonly.' });
    /* THE THIRD STEP IS GATED — `driveFix_` says why. */
    steps.push({ text: fix.consent ? 'Open the consent link and press Allow, ticking every box.'
      : 'In the editor run authoriseDrive and press Allow, ticking every box.', href: fix.consent });
    steps.push({ text: (fix.consent ? 'Run authoriseDrive in the editor. ' : '')
      + 'Only when its last line says READY: Deploy → Manage deployments → edit → Version: New '
      + 'version → Deploy.' });
  } else if (!wrote && !posts) {
    steps.push({ text: 'Add a row to the config tab: key posts_folder, value the id from the '
      + 'folder’s URL.' });
  } else if (!wrote) {
    steps.push({ text: 'The scope is not the problem. The folder may belong to another account or '
      + 'sit on a shared drive that refuses sharing by link — try a folder in My Drive.' });
  }
  if (!hasColumn) steps.push({ text: 'Open ?setup=1 once to add the column.', href: setupUrl_(), setup: true });

  return {
    success: true, ok: hasColumn && wrote, version: BACKEND_VERSION,
    checks: checks, scopes: s.held, steps: steps,
  };
}

/* ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE § */

/* ---------- GALLERY ------------------------------------------------------------------------- */

/** A bare folder id, or the id pulled out of a full Drive URL. */
function folderIdFrom(raw) {
  const s = S(raw);
  if (!s) return '';
  const m = s.match(/folders\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : s;
}

/* THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER § */

/** The clock the budget is measured against. A function, so `check-films.js` can run the walk on a
    clock of its own and prove that it stops and resumes without waiting twenty real seconds. */
function filmsClock_() { return Date.now(); }

/** Where the last run got to. `{ at, pass, after, root, folder, how, found }` — see `filmsSync_`. */
function filmsState_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(FILMS_SYNC_PROP);
    const st = raw ? JSON.parse(raw) : {};
    return (st && typeof st === 'object') ? st : {};
  } catch (err) { return {}; }
}
function filmsStateSave_(st) {
  try { PropertiesService.getScriptProperties().setProperty(FILMS_SYNC_PROP, JSON.stringify(st || {})); }
  catch (err) {}
}

/* ---------- WHICH FOLDER § */
function filmsRoot_() {
  const cfg = config();
  const raw = S(cfg[FILMS_FOLDER_KEY]);
  if (raw) {
    let f = null;
    try { f = DriveApp.getFolderById(folderIdFrom(raw)); } catch (err) { f = null; }
    if (!f) return { error: 'The films_folder cell in the config tab does not open a folder this script can see. '
                            + 'Check it, or blank it to use the folder named Notflix.' };
    return { folder: f, name: S(f.getName()), how: 'config' };
  }
  const was = S(filmsState_().root);
  if (was) {
    let f = null;
    try { f = DriveApp.getFolderById(was); if (f && f.isTrashed && f.isTrashed()) f = null; } catch (err) { f = null; }
    if (f) return { folder: f, name: S(f.getName()), how: 'remembered' };
  }
  const found = [];
  try {
    const it = DriveApp.searchFolders("title contains '" + FILMS_FOLDER_NAME + "' and trashed = false");
    while (it.hasNext()) {
      const f = it.next();
      if (norm(f.getName()) === FILMS_FOLDER_NAME) found.push(f);
    }
  } catch (err) {
    return { error: 'Drive could not be searched — ' + S(err && err.message || err)
                    + '. Run authoriseDrive once from the Apps Script editor.' };
  }
  if (!found.length) return { error: 'No folder named Notflix is visible to this script. Put its id in '
                                      + 'films_folder on the config tab.' };
  if (found.length === 1) return { folder: found[0], name: S(found[0].getName()), how: 'name' };
  const me = filmsMe_();
  const mine = me ? found.filter(f => filmsOwner_(f) === me) : [];
  if (mine.length === 1) return { folder: mine[0], name: S(mine[0].getName()), how: 'name' };
  return { error: found.length + ' folders are named Notflix and nothing says which is the films. Put the right '
                  + 'one’s id (or its address) in films_folder on the config tab — nothing was synced.' };
}
/** This account's own address, as Drive knows it — the owner of its My Drive. '' when Drive will not say. */
function filmsMe_() {
  try { const o = DriveApp.getRootFolder().getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}
/** A folder's owner's address, or '' (a shared drive's folder has no owner). */
function filmsOwner_(f) {
  try { const o = f.getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}

/* ---------- A NAME, READ § */
function filmsTitle_(name) {
  let s = S(name).replace(/\s+/g, ' ');
  s = s.replace(FILMS_RE_VIDEO_EXT, '').trim();
  if (!/\s/.test(s) && /\.(?:19|20)\d{2}(?:\.|$)/.test(s)) {
    const m = s.match(/^(.*?)\.((?:19|20)\d{2})(?:\.|$)/);
    if (m && m[1]) return { title: m[1].replace(/[._]+/g, ' ').trim(), year: m[2], note: '' };
  }
  let m = s.match(/^(.*?)\s*\(((?:19|20)\d{2})\)\s*(.*)$/);
  if (m && S(m[1])) return { title: S(m[1]), year: m[2], note: S(m[3]) };
  m = s.match(/^(.*\S)\s+-\s+([A-Z0-9]{2,6})$/);
  if (m && /\d/.test(m[2])) return { title: S(m[1]), year: '', note: m[2] };
  return { title: s, year: '', note: '' };
}

/* AN EPISODE'S SEASON AND NUMBER from its name: `S.E.mkv`, a bare `S.E`, `S.E <a note>.mkv`, and the
   release style `Show.S01E10.720p...mkv` that four files in one season use. Null for anything else. */
function filmsEpisode_(name) {
  const s = S(name);
  let m = s.match(/(?:^|[^A-Za-z0-9])[Ss](\d{1,2})[ ._-]?[Ee](\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  m = s.match(/^(\d{1,2})\.(\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  return null;
}

/** A video by its type, or by its name when Drive did not know the type. */
function filmsIsVideo_(f) {
  return /^video\//i.test(S(f.getMimeType())) || FILMS_RE_VIDEO_EXT.test(S(f.getName()));
}

function filmsEach_(it, fn) { while (it.hasNext()) fn(it.next()); }

/** Gigabytes to two places, as Drive itself counts them (1024³). */
function filmsGb_(bytes) { return Math.round((Number(bytes) || 0) / 1073741824 * 100) / 100; }

/* ---------- THE THINGS IN THE FOLDER, LISTED BUT NOT YET WALKED § */
function filmsList_(root) {
  const out = { things: [], skipped: 0, unknown: 0 };
  const seen = {};
  const push = (x, kind, audience, fileKind, placeholder) => {
    const id = S(x.getId());
    if (!id || seen[id]) return;
    seen[id] = true;
    out.things.push({ id: id, name: S(x.getName()), kind: kind, audience: audience,
                      fileKind: fileKind, ref: x, placeholder: !!placeholder });
  };
  const fileAs = (f, kind, audience) => {
    if (S(f.getMimeType()) === FILMS_MIME_DOC) return push(f, kind, audience, 'file', true);
    if (!filmsIsVideo_(f)) { out.skipped++; return; }
    push(f, kind, audience, 'file', false);
  };
  const folderAs = (d, kind, audience) => {
    if (FILMS_RE_EXTRA.test(S(d.getName()))) { out.skipped++; return; }
    push(d, kind, audience, 'folder', false);
  };
  filmsEach_(root.getFiles(), f => fileAs(f, 'film', ''));
  filmsEach_(root.getFolders(), top => {
    const topName = S(top.getName());
    if (FILMS_RE_DOCS.test(topName)) {
      filmsEach_(top.getFiles(), f => fileAs(f, 'documentary', ''));
      filmsEach_(top.getFolders(), d => folderAs(d, 'documentary', ''));
      return;
    }
    const audience = norm(topName).replace(/^notflix\b\s*/, '').trim();
    filmsEach_(top.getFiles(), f => fileAs(f, 'film', audience));
    filmsEach_(top.getFolders(), mid => {
      const n = S(mid.getName());
      if (FILMS_RE_FILMS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'film', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'film', audience));
      } else if (FILMS_RE_TV.test(n)) {
        filmsEach_(mid.getFolders(), d => folderAs(d, 'series', audience));
        /* AN EPISODE LOOSE IN `Tv shows` BELONGS TO NO SHOW, so it is counted and not guessed at. */
        filmsEach_(mid.getFiles(), () => { out.skipped++; });
      } else if (FILMS_RE_DOCS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'documentary', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'documentary', audience));
      } else {
        out.unknown++;
      }
    });
  });
  return out;
}

/* ---------- ONE THING, LOOKED AT § */
function filmsDescribe_(th, stopAt) {
  const d = { id: th.id, name: th.name, kind: th.kind, audience: th.audience, fileKind: th.fileKind,
              placeholder: th.placeholder, sizeGb: '', seasons: '', episodes: 0, empty: false };
  if (th.placeholder) return d;
  if (th.fileKind === 'file') {
    d.sizeGb = filmsGb_(th.ref.getSize());
    return d;
  }
  const acc = { bytes: 0, videos: 0, seasons: {}, cut: false };
  filmsWalk_(th.ref, 0, acc, 0, stopAt);
  if (acc.cut) return null;
  if (!acc.videos) { d.empty = true; return d; }
  d.sizeGb = filmsGb_(acc.bytes);
  d.episodes = acc.videos;
  if (th.kind === 'series') d.seasons = Object.keys(acc.seasons).length || 1;
  return d;
}
function filmsWalk_(folder, season, acc, depth, stopAt) {
  if (acc.cut) return;
  /* THE CLOCK IS ASKED AT EVERY EPISODE, not once a folder: a show kept flat is sixty episodes in one
     folder, and a check at the door would let it run a minute past the line. */
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (filmsClock_() > stopAt) { acc.cut = true; return; }
    const f = files.next();
    if (!filmsIsVideo_(f)) continue;
    acc.videos++;
    acc.bytes += Number(f.getSize()) || 0;
    const ep = filmsEpisode_(f.getName());
    const s = season || (ep ? ep.season : 0);
    if (s) acc.seasons[s] = true;
  }
  if (depth >= 3) return;
  filmsEach_(folder.getFolders(), sub => {
    const n = S(sub.getName());
    if (FILMS_RE_EXTRA.test(n)) return;
    const m = n.match(FILMS_RE_SEASON);
    filmsWalk_(sub, m ? Number(m[1]) : season, acc, depth + 1, stopAt);
  });
}

/** The address a row opens: a file's viewer, or a series' folder — `file_kind` says which (note 068). */
function filmsUrl_(d) {
  return d.fileKind === 'folder' ? 'https://drive.google.com/drive/folders/' + d.id
                                 : 'https://drive.google.com/file/d/' + d.id + '/view';
}

/* ---------- ONE THING INTO THE TAB § */
function filmsUpsert_(t, d, ctx) {
  const tally = ctx.tally;
  let row = ctx.byId[d.id] || null;
  if (d.empty) {
    if (row && ON_(row.active)) { setCells(t, row, { active: false }); tally.off++; }
    tally.empty++;
    return;
  }
  const named = filmsTitle_(d.name);
  const machine = {
    kind: d.kind, audience: d.audience, drive_name: d.name,
    drive_url: d.placeholder ? '' : filmsUrl_(d),
    file_kind: d.placeholder ? '' : d.fileKind,
    size_gb: d.sizeGb, seasons: d.seasons,
  };
  if (!row) {
    const k = key(named.title);
    row = k ? (ctx.loose.find(r => !r._adopted && key(r.title) === k) || null) : null;
    if (row) { row._adopted = true; machine.drive_id = d.id; tally.adopted++; }
  }
  /* EVERY COLUMN BY NAME, not `Object.assign` over `machine`: `check-columns.js` reads the keys of an
     `addRow` literal, and a row assembled out of variables is a row whose columns no check can see. */
  if (!row) {
    const made = addRow(t, {
      film_id: 'FM' + String(ctx.next++).padStart(3, '0'),
      title: named.title, year: named.year, director: '', lead: '', notes: named.note,
      drive_id: d.id, drive_name: d.name, kind: machine.kind, audience: machine.audience, drive_url: machine.drive_url,
      file_kind: machine.file_kind, size_gb: machine.size_gb, seasons: machine.seasons,
      placeholder: !!d.placeholder, active: true,
    });
    if (made) { ctx.byId[d.id] = made; tally.added++; }
    return;
  }
  const want = Object.assign({}, machine);
  if (TRUE_(row.placeholder) !== !!d.placeholder) want.placeholder = !!d.placeholder;
  if (!TRUE_(row.active)) want.active = true;
  const was = filmsTitle_(row.drive_name);
  const ours = (have, said) => !S(have) || S(have) === S(said);
  if (named.title && ours(row.title, was.title)) want.title = named.title;
  if (ours(row.year, was.year)) want.year = named.year;
  if (ours(row.notes, was.note)) want.notes = named.note;
  if (!S(row.film_id)) want.film_id = 'FM' + String(ctx.next++).padStart(3, '0');
  if (setCells(t, row, want).length) tally.refreshed++;
  ctx.byId[d.id] = row;
}

/* ---------- THE SYNC § */
function filmsSync_(opts) {
  const t0 = filmsClock_();
  const budget = Math.max(1, Number(opts && opts.budgetMs) || FILMS_SYNC_BUDGET_MS);
  const ceiling = FILMS_SYNC_CEILING_MS;
  const root = filmsRoot_();
  if (root.error) return { error: root.error, why: 'folder' };
  const rootId = S(root.folder.getId());

  let list;
  try { list = filmsList_(root.folder); }
  catch (err) { return { error: 'The folder could not be read — ' + S(err && err.message || err), why: 'drive' }; }
  list.things.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const st = filmsState_();
  const resuming = !!S(st.pass) && S(st.root) === rootId;
  const after = resuming ? S(st.after) : '';
  const todo = list.things.filter(x => x.id > after);

  /* ---------- LOOKED AT, UNLOCKED — see the note at the top of this section ---------- */
  const done = [];
  let more = false;
  for (let i = 0; i < todo.length; i++) {
    const now = filmsClock_();
    if (now - t0 > ceiling || (done.length && now - t0 > budget)) { more = true; break; }
    const d = filmsDescribe_(todo[i], t0 + (done.length ? budget : ceiling));
    if (!d) { more = true; break; }
    done.push(d);
  }

  const tally = { added: 0, refreshed: 0, adopted: 0, off: 0, empty: 0 };
  const wroteBefore = POST_WROTE;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — press Sync from Drive again in a minute.', why: 'busy' };
  try {
    /* FRESH ROWS UNDER THE LOCK, `submitAnswer`'s rule: a copy read before it was the copy another run was
       about to change. */
    clearCache();
    const t = read(TAB.films);
    if (!t.sheet) return { error: 'The Ledger has no films tab. Open the site once as an admin.', why: 'tab' };
    const byId = {}, loose = [];
    let top = 0;
    t.rows.forEach(r => {
      const id = S(r.drive_id);
      if (id) byId[id] = r; else loose.push(r);
      const m = S(r.film_id).match(/^FM(\d+)$/);
      if (m) top = Math.max(top, Number(m[1]));
    });
    const ctx = { byId: byId, loose: loose, next: top + 1, tally: tally };
    done.forEach(d => filmsUpsert_(t, d, ctx));

    /* ---------- A WHOLE PASS, AND ONLY A WHOLE PASS, SWITCHES OFF § */
    let warn = '';
    if (!more) {
      if (list.things.length) {
        const listed = {};
        list.things.forEach(x => { listed[x.id] = true; });
        t.rows.forEach(r => {
          const id = S(r.drive_id);
          if (id && !listed[id] && ON_(r.active)) { setCells(t, r, { active: false }); tally.off++; }
        });
      } else {
        warn = ' The folder held nothing a film could be made from, so nothing was switched off.';
      }
    }

    /* WHAT IS IN THE FOLDER, COUNTED FROM THE ROWS THE PASS LEFT ON — so an empty show, which is listed
       and makes no row, is not counted as a series, and a pass done over three runs counts all three. */
    const found = { films: 0, series: 0, documentaries: 0, placeholders: 0 };
    const inFolder = {};
    list.things.forEach(x => { inFolder[x.id] = true; });
    t.rows.forEach(r => {
      if (!inFolder[S(r.drive_id)] || !ON_(r.active)) return;
      if (TRUE_(r.placeholder)) found.placeholders++;
      else if (norm(r.kind) === 'series') found.series++;
      else if (norm(r.kind) === 'documentary') found.documentaries++;
      else found.films++;
    });
    const stamp = new Date(filmsClock_()).toISOString();
    const next = Object.assign({}, st, { root: rootId, folder: root.name, how: root.how });
    if (more) {
      next.pass = resuming ? S(st.pass) : stamp;
      next.after = done.length ? done[done.length - 1].id : after;
    } else {
      next.pass = '';
      next.after = '';
      next.at = stamp;
      next.found = found;
    }
    filmsStateSave_(next);

    const where = root.name + (root.how === 'config' ? ' (the films_folder in config)'
                               : root.how === 'remembered' ? ' (the folder synced before)' : ' (found by its name)');
    const at = list.things.length - todo.length + done.length;
    const message = more
      ? 'Part-way through ' + where + ': ' + at + ' of ' + list.things.length
        + ' looked at. The rest follow on the next run.'
      : 'Synced from ' + where + ': ' + found.films + ' film' + (found.films === 1 ? '' : 's') + ', '
        + found.series + ' series, ' + found.documentaries + ' documentar' + (found.documentaries === 1 ? 'y' : 'ies')
        + (found.placeholders ? ', ' + found.placeholders + ' not uploaded' : '') + '. '
        + tally.added + ' new, ' + tally.refreshed + ' updated, ' + tally.off + ' switched off.' + warn;
    return Object.assign({ done: !more, more: more, folder: root.name, how: root.how, found: found,
                           looked: at, of: list.things.length, skipped: list.skipped, unknown: list.unknown,
                           ms: filmsClock_() - t0, message: message }, tally);
  } finally {
    lock.releaseLock();
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/** Run from the editor's function dropdown (or `?run=syncFilms`): the editor's budget, the same sync. */
function syncFilms() {
  const out = filmsSync_({ budgetMs: FILMS_SYNC_EDITOR_MS });
  const said = out.error ? 'NOT SYNCED — ' + out.error : out.message;
  try { Logger.log(said); } catch (err) {}
  return said;
}


/* ======================== THE LIBRARY'S PRIVATE HALF, IN THE LEDGER (397) ========================
   The repo keeps card metadata; words, answers and figures are rows of four Ledger tabs (LIB_FILES), served a few at a time. */

/* EVERY TEXT CELL STARTS `~`, so the sheet never reads a JSON chunk, an id or a checksum as a number, date or formula. */
const LIB_MARK = '~';
const libCellOut_ = v => LIB_MARK + String(v);
const libCellIn_ = v => { const s = String(v == null ? '' : v); return s.charAt(0) === LIB_MARK ? s.slice(1) : s; };

/* WHICH FILE AN ID ON THE WIRE BELONGS TO: `q:` a question row, `ct:` a content card, `pr:` a practical, `pj:` a project. */
function libDefOf_(typed) {
  const m = /^([a-z]{1,3}):(.+)$/.exec(S(typed));
  if (!m) return null;
  const key = Object.keys(LIB_FILES).filter(k => LIB_FILES[k].prefix === m[1])[0];
  return key ? { key: key, def: LIB_FILES[key], id: m[2] } : null;
}
/* AN ITEM'S ID IN ITS FILE: the id columns joined by `#` (a content card is `TB-GCSE-STATS#3`). */
function libIdOf_(def, row) {
  const parts = def.id.map(c => S(row && row[c]));
  return parts.every(p => p !== '') ? parts.join('#') : '';
}
/* THE PRIVATE FIELDS A ROW HAS, in LIB_FILES order — an empty cell kept as one, so the copy is the row exactly. Null when it has none. */
function libPrivateOf_(def, row) {
  if (!row || (def.skip && S(row[def.skip]))) return null;
  const out = {};
  let any = false;
  def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(row, f)) { out[f] = row[f]; any = true; } });
  return any ? out : null;
}
/* SHA-256 OF THE JSON, base64 — written beside it, and asked again of what the cells give back. */
function libSum_(text) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8));
}
function libCells_(json) {
  const parts = [];
  for (let i = 0; i < json.length; i += LIB_CELL) parts.push(json.slice(i, i + LIB_CELL));
  if (!parts.length) parts.push('');
  if (parts.length > LIB_PARTS) throw new Error('an item is ' + json.length + ' characters, more than ' + LIB_PARTS + ' cells hold');
  return parts;
}
/* ONE SHEET ROW FOR ONE ITEM, and back. */
function libRowOut_(item) {
  const parts = libCells_(item.json);
  const row = [libCellOut_(item.id), libCellOut_(item.sum), parts.length];
  for (let i = 0; i < LIB_PARTS; i++) row.push(i < parts.length ? libCellOut_(parts[i]) : '');
  return row;
}
function libRowIn_(cells) {
  const n = Math.max(1, Math.min(LIB_PARTS, Number(cells[2]) || 1));
  let json = '';
  for (let i = 0; i < n; i++) json += libCellIn_(cells[3 + i]);
  return { id: libCellIn_(cells[0]), sum: libCellIn_(cells[1]), json: json };
}
/* THE TAB, MADE WITH ITS HEADER IF IT IS NOT THERE YET — and as tall as `rows` needs, because a range past the grid throws. */
function libSheet_(def, rows) {
  const ss = SpreadsheetApp.openById(LEDGER_ID);
  let sh = ss.getSheetByName(def.tab);
  if (!sh) {
    sh = ss.insertSheet(def.tab);
    sh.appendRow(SCHEMA[def.tab]);
    sh.setFrozenRows(1);
  }
  const need = (rows || 0) + 1;
  if (sh.getMaxRows() < need && typeof sh.insertRowsAfter === 'function') sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  const wide = 3 + LIB_PARTS;
  if (sh.getMaxColumns() < wide) sh.insertColumnsAfter(sh.getMaxColumns(), wide - sh.getMaxColumns());
  return sh;
}

/* ---------- THE COPY: `library-to-ledger`, a trigger's few minutes at a time ---------- */
const LIB_MIG_KEY = 'LIB_MIGRATION';
/* THE TRIGGER'S HANDLER — public, so a trigger can call it; running it by hand does one more safe step. */
const LIB_STEP_FN = 'libraryCopyStep';
/* A STEP STOPS STARTING NEW WORK AFTER THIS LONG, inside Apps Script's six minutes. */
const LIB_STEP_MS = 4 * 60 * 1000;
const LIB_BATCH = 200;
/* A COPY THAT FAILS ITS CHECK THREE TIMES STOPS AND SAYS SO, rather than copying for ever. */
const LIB_TRIES = 3;

function libMigState_() {
  try { const st = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_MIG_KEY) || 'null'); if (st && st.files) return st; } catch (err) {}
  return { files: {} };
}
function libMigSave_(st) { PropertiesService.getScriptProperties().setProperty(LIB_MIG_KEY, JSON.stringify(st)); }
/* READY TO SERVE: every file copied and checked. Until then `libItems` says the copy is still going. */
function libReady_() { return !!libMigState_().done; }
function libProgress_(st) {
  return Object.keys(LIB_FILES).map(k => {
    const f = st.files[k] || {};
    return k + ' ' + (f.verified ? 'checked (' + (f.rows || 0) + ')' : f.total ? (f.next || 0) + ' of ' + f.total + (f.next >= f.total ? ', checking' : '') : 'waiting');
  }).join('; ');
}
/* WHAT THE SETUP CARD SAYS WHILE IT RUNS — a job still copying is waiting, not failed (361's card). */
function libSetupSays_() {
  const st = libMigState_();
  if (st.done) return { working: false, said: 'copied from ' + S(st.commit).slice(0, 7) + ' and checked: ' + libProgress_(st) };
  if (st.stuck) return { working: false, said: 'STOPPED: ' + S(st.error) };
  return { working: true, said: 'copying in the background — ' + libProgress_(st) + (st.error ? ' (last: ' + S(st.error) + ')' : '') };
}

/* THE MIGRATIONS JOB. Cheap, on an admin's page load: it books the step and never copies itself, so nobody waits. Throws
   until the copy is checked, so the job stays pending and is asked again; returns once it is. */
function libMigrate_() {
  const st = libMigState_();
  if (st.done) return libSetupSays_().said;
  if (st.stuck) throw new Error(S(st.error) + ' — fix the cause, then ?run=rerun&arg=library-to-ledger');
  if (!st.beat || Date.now() - Number(st.beat) > 10 * 60 * 1000) libStepBook_();
  throw new Error('copying in the background — ' + libProgress_(st));
}
function libStepUnbook_() {
  try { ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === LIB_STEP_FN) ScriptApp.deleteTrigger(t); }); } catch (err) {}
}
function libStepBook_() {
  libStepUnbook_();
  ScriptApp.newTrigger(LIB_STEP_FN).timeBased().after(60 * 1000).create();
}

/* THE SOURCE: the file as it was at LIB_SOURCE_COMMIT — every row with a private field, as {id, json, sum}. */
function libSource_(def, fetchText) {
  /* A FILE WITH NO PRIVATE ROW AT THE PINNED COMMIT (`newer`) is copied as nothing; its tab is filled by import. */
  if (def.newer) return { items: [] };
  let text = '';
  try {
    if (fetchText) text = fetchText(def.file);
    else {
      const res = UrlFetchApp.fetch(LIB_SOURCE_RAW + def.file, { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' answered ' + res.getResponseCode() };
      text = String(res.getContentText('UTF-8'));
    }
  } catch (err) { return { error: def.file + ' could not be fetched (' + S(err && err.message || err).slice(0, 160) + ')' }; }
  let rows;
  try { rows = JSON.parse(text); } catch (err) { return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' is not whole JSON' }; }
  if (!Array.isArray(rows) || !rows.length) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' has no rows' };
  const items = [], seen = {};
  for (let i = 0; i < rows.length; i++) {
    const content = libPrivateOf_(def, rows[i]);
    if (!content) continue;
    const id = libIdOf_(def, rows[i]);
    if (!id) return { error: def.file + ' row ' + (i + 1) + ' has private fields and no id' };
    if (seen[id]) return { error: def.file + ' has ' + id + ' twice' };
    seen[id] = 1;
    const json = JSON.stringify(content);
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  return { items: items };
}

/* ONE STEP. Writes from where the last step stopped (row 2 + n is item n, always, so writing a row twice writes it the
   same), then reads every row back and checks its id and checksum against the source before the file counts as done. */
function libraryCopyStep() { return libCopy_({}); }
function libCopy_(o) {
  o = o || {};
  const budget = o.budgetMs || LIB_STEP_MS;
  /* `o.clock`, `o.batch`, `o.fetchText`, `o.afterWrite`, `o.noBook`: a check's (check-library-ledger.js) — never a trigger's. */
  const clock = o.clock || (() => Date.now());
  const t0 = clock();
  const st = libMigState_();
  if (st.done) { libStepUnbook_(); return st; }
  /* ONE STEP AT A TIME — a heartbeat younger than a step is a step still running. */
  if (st.running && Date.now() - Number(st.running) < LIB_STEP_MS + 60 * 1000 && !o.force) return { skipped: 'a step is already running' };
  libStepUnbook_();
  st.running = Date.now(); st.beat = Date.now(); delete st.error;
  libMigSave_(st);
  const late = () => clock() - t0 > budget;
  try {
    const keys = Object.keys(LIB_FILES);
    for (let k = 0; k < keys.length && !late(); k++) {
      const key = keys[k], def = LIB_FILES[key];
      const f = st.files[key] || (st.files[key] = { next: 0, checked: 0 });
      if (f.verified) continue;
      const src = libSource_(def, o.fetchText);
      if (src.error) { st.error = src.error; break; }
      /* THE SOURCE CHANGED SHAPE SINCE THE LAST STEP (it cannot at a pinned commit, but a count is cheap to ask). */
      if (f.total && f.total !== src.items.length) { f.next = 0; f.checked = 0; }
      f.total = src.items.length;
      const sh = libSheet_(def, f.total);
      while (f.next < f.total && !late()) {
        const batch = src.items.slice(f.next, f.next + (o.batch || LIB_BATCH));
        sh.getRange(2 + f.next, 1, batch.length, 3 + LIB_PARTS).setValues(batch.map(libRowOut_));
        f.next += batch.length;
        st.beat = Date.now();
        libMigSave_(st);
      }
      if (f.next < f.total) break;
      if (o.afterWrite) o.afterWrite(key);
      /* ROWS UNDER THE COPY, from a longer attempt or a hand, are cleared — the tab is the source's rows and nothing else. */
      const last = sh.getLastRow();
      if (last > 1 + f.total) sh.getRange(2 + f.total, 1, last - 1 - f.total, 3 + LIB_PARTS).clearContent();
      /* THE CHECK, A BATCH AT A TIME AND RESUMABLE: every row's id, its checksum, and the checksum of what its cells hold. */
      let bad = '';
      while (f.checked < f.total && !late() && !bad) {
        const n = Math.min(500, f.total - f.checked);
        const got = sh.getRange(2 + f.checked, 1, n, 3 + LIB_PARTS).getValues();
        for (let i = 0; i < n && !bad; i++) {
          const want = src.items[f.checked + i], have = libRowIn_(got[i]);
          if (have.id !== want.id) bad = 'row ' + (2 + f.checked + i) + ' is ' + have.id + ', not ' + want.id;
          else if (have.sum !== want.sum) bad = want.id + ' has the wrong checksum';
          else if (libSum_(have.json) !== want.sum) bad = want.id + ' does not read back as it was written';
        }
        if (!bad) { f.checked += n; st.beat = Date.now(); libMigSave_(st); }
      }
      if (bad) {
        f.tries = (f.tries || 0) + 1;
        f.next = 0; f.checked = 0;
        st.error = key + ': ' + bad;
        if (f.tries >= LIB_TRIES) st.stuck = true;
        break;
      }
      if (f.checked < f.total) break;
      f.verified = new Date().toISOString();
      f.rows = f.total;
      delete f.tries;
      libMigSave_(st);
    }
    if (keys.every(key => st.files[key] && st.files[key].verified)) {
      st.done = new Date().toISOString();
      st.commit = LIB_SOURCE_COMMIT;
      delete st.error;
      libGenBump_();
      /* WHAT THE SETUP CARD SAYS UNDER THE JOB once it is done (`SAID_<id>`, 379's note). */
      try { PropertiesService.getScriptProperties().setProperty('SAID_library-to-ledger', JSON.stringify({ said: 'copied from ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' and checked: ' + libProgress_(st) })); } catch (err) {}
    }
    return st;
  } finally {
    delete st.running;
    libMigSave_(st);
    if (!st.done && !st.stuck && !o.noBook) { try { libStepBook_(); } catch (err) { st.error = 'the next step could not be booked: ' + S(err && err.message || err); libMigSave_(st); } }
  }
}

/* ---------- SERVING: an item's private fields, by id, from the cache or the tab ---------- */
/* THE GENERATION: bumped when the copy finishes and on every import, so no cache outlives an edit. */
function libGen_() { return S(PropertiesService.getScriptProperties().getProperty('LIB_GEN')) || '0'; }
function libGenBump_() { PropertiesService.getScriptProperties().setProperty('LIB_GEN', String(Date.now())); }
/* A VALUE IS 100KB AT MOST, so anything longer is cut — 30,000 characters is under it even at three bytes a character. */
const LIB_CACHE_CHUNK = 30000;
const LIB_CACHE_S = 21600;
function libCachePut_(cache, key, text) {
  const o = {};
  const n = Math.max(1, Math.ceil(text.length / LIB_CACHE_CHUNK));
  o[key] = String(n);
  for (let i = 0; i < n; i++) o[key + '#' + i] = text.slice(i * LIB_CACHE_CHUNK, (i + 1) * LIB_CACHE_CHUNK);
  try { cache.putAll(o, LIB_CACHE_S); } catch (err) { /* a full cache costs speed, never an answer */ }
}
function libCacheGet_(cache, keys) {
  const out = {};
  let heads = {};
  try { heads = cache.getAll(keys) || {}; } catch (err) { heads = {}; }
  const parts = [];
  keys.forEach(k => { const n = Number(heads[k]) || 0; for (let i = 0; i < n; i++) parts.push(k + '#' + i); });
  let got = {};
  try { got = parts.length ? cache.getAll(parts) || {} : {}; } catch (err) { got = {}; }
  keys.forEach(k => {
    const n = Number(heads[k]) || 0;
    if (!n) return;
    let text = '';
    for (let i = 0; i < n; i++) { const p = got[k + '#' + i]; if (p == null) return; text += p; }
    out[k] = text;
  });
  return out;
}
/* WHERE EACH ID IS: column A read once, kept as {id: row}. */
function libIndex_(def, sh, gen, cache) {
  const key = 'lbi' + gen + ':' + def.tab;
  const had = cache ? libCacheGet_(cache, [key])[key] : null;
  if (had) { try { return JSON.parse(had); } catch (err) {} }
  const last = sh.getLastRow();
  const at = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach((r, i) => { const id = libCellIn_(r[0]); if (id && !at[id]) at[id] = i + 2; });
  if (cache) libCachePut_(cache, key, JSON.stringify(at));
  return at;
}
/* `ids` ARE TYPED (`q:Q-1a`). Returns { items: {typed: content}, missing: [typed] } — missing is an id the tab has no row for. */
function libContent_(ids) {
  const gen = libGen_();
  const cache = CacheService.getScriptCache();
  const items = {}, missing = [];
  const keyOf = t => 'lb' + gen + ':' + t;
  const hit = libCacheGet_(cache, ids.map(keyOf));
  const need = {};
  ids.forEach(t => {
    const text = hit[keyOf(t)];
    if (text != null) { try { items[t] = JSON.parse(text); return; } catch (err) {} }
    const d = libDefOf_(t);
    if (!d) { missing.push(t); return; }
    (need[d.key] = need[d.key] || []).push(d);
  });
  Object.keys(need).forEach(key => {
    const def = LIB_FILES[key];
    const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
    if (!sh) { need[key].forEach(d => missing.push(d.def.prefix + ':' + d.id)); return; }
    const at = libIndex_(def, sh, gen, cache);
    const rows = [];
    need[key].forEach(d => { if (at[d.id]) rows.push({ row: at[d.id], d: d }); else missing.push(def.prefix + ':' + d.id); });
    rows.sort((a, b) => a.row - b.row);
    /* NEIGHBOURS IN ONE READ: a question's parts are rows side by side, so a run of rows is one range. */
    for (let i = 0; i < rows.length; ) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].row - rows[j].row <= 3) j++;
      const lo = rows[i].row, hi = rows[j].row;
      const got = sh.getRange(lo, 1, hi - lo + 1, 3 + LIB_PARTS).getValues();
      for (let k = i; k <= j; k++) {
        const t = def.prefix + ':' + rows[k].d.id;
        const have = libRowIn_(got[rows[k].row - lo]);
        let content = null;
        try { content = have.id === rows[k].d.id ? JSON.parse(have.json) : null; } catch (err) { content = null; }
        if (!content) { missing.push(t); continue; }
        items[t] = content;
        libCachePut_(cache, keyOf(t), have.json);
      }
      i = j + 1;
    }
  });
  return { items: items, missing: missing };
}

/* ---------- THE DAY'S CAP: one `lib_log` row per person per London day, its ids so a second look is free ---------- */
const LIB_LOG_IDS_MAX = 45000;
function libCapOf_() {
  let cfg = {};
  try { cfg = config() || {}; } catch (err) { cfg = {}; }
  const cell = S(cfg.library_items_per_day);
  const n = cell === '' ? LIB_DAILY_CAP : Number(cell);
  return isFinite(n) && n >= 0 ? Math.floor(n) : LIB_DAILY_CAP;
}
/* UNDER THE LOCK: which of `ids` this person may have now. Already had today → free; new → counted until the cap. */
function libTally_(me, ids, cap) {
  const pid = S(me.person_id), day = reportDay_(new Date());
  const cache = CacheService.getScriptCache();
  const ckey = 'lbt:' + pid + ':' + day;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { busy: true };
  const wroteBefore = POST_WROTE;
  try {
    clearCache();
    const t = read(TAB.libLog);
    const row = t.sheet ? t.rows.find(r => S(r.person_id) === pid && reportDay_(r.day) === day) : null;
    const had = row ? S(row.ids).split(',').filter(Boolean) : [];
    let cached = null;
    try { cached = JSON.parse(cache.get(ckey) || 'null'); } catch (err) { cached = null; }
    const seen = {};
    had.concat(cached && Array.isArray(cached.ids) ? cached.ids : []).forEach(id => { seen[id] = 1; });
    let count = Math.max(row ? Number(row.served) || 0 : 0, cached ? Number(cached.n) || 0 : 0, Object.keys(seen).length);
    const before = count;
    const allowed = [], refused = [];
    ids.forEach(id => {
      if (seen[id]) { allowed.push(id); return; }
      if (count >= cap) { refused.push(id); return; }
      seen[id] = 1; count++; allowed.push(id);
    });
    let list = Object.keys(seen).join(',');
    if (list.length > LIB_LOG_IDS_MAX) list = list.slice(0, LIB_LOG_IDS_MAX).replace(/,[^,]*$/, '');
    if (t.sheet && (count !== before || refused.length)) {
      const vals = { served: count, ids: list, refused: (row ? Number(row.refused) || 0 : 0) + refused.length, last_at: new Date() };
      if (row) setCells(t, row, vals);
      else addRow(t, Object.assign({ day: day, person_id: pid, handle: S(me.handle) }, vals));
    }
    try { cache.put(ckey, JSON.stringify({ n: count, ids: list.split(',') }), LIB_CACHE_S); } catch (err) {}
    return { allowed: allowed, refused: refused, left: Math.max(0, cap - count) };
  } finally {
    lock.releaseLock();
    /* NO PAYLOAD CARRIES THE LOG, so the stored payload stands. */
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/* ---------- THE TOOLS' COPY: out a page at a time, and back in (an admin's, from tools/lib-private.js) ---------- */
const LIB_EXPORT_MAX = 500;
const LIB_IMPORT_MAX = 300;
function libExport_(fileKey, from, count) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
  if (!sh) return { error: 'There is no ' + def.tab + ' tab yet.' };
  const total = Math.max(0, sh.getLastRow() - 1);
  const a = Math.max(0, Math.floor(Number(from) || 0));
  const n = Math.max(0, Math.min(LIB_EXPORT_MAX, Math.floor(Number(count) || LIB_EXPORT_MAX), total - a));
  const rows = [];
  if (n) sh.getRange(2 + a, 1, n, 3 + LIB_PARTS).getValues().forEach(c => {
    const have = libRowIn_(c);
    if (!have.id) return;
    let content = null;
    try { content = JSON.parse(have.json); } catch (err) { content = null; }
    rows.push({ id: have.id, sum: have.sum, content: content });
  });
  return { success: true, file: S(fileKey), total: total, from: a, rows: rows };
}
/* AN ITEM'S OWN ANSWER AGAINST ITS OWN SHAPE (457): § */
function libSelfTest_(fileKey, c) {
  if (S(fileKey) !== 'questions' || !c) return null;
  const choices = S(c.choices).split('|').filter(o => S(o));
  const right = S(c.choice_right).split('|')[0];
  if (choices.length >= 2) {
    if (!right) return { flag: 'it has ' + choices.length + ' options and no choice_right' };
    const picks = right.split(',').map(v => S(v)).filter(v => v);
    if (!picks.length || picks.some(v => !/^\d+$/.test(v) || +v < 1 || +v > choices.length)) {
      return { refuse: 'its choice_right ' + right + ' is not among its ' + choices.length + ' options' };
    }
  }
  if (S(c.cells) && !S(c.cells).split(';').some(cell => { const w = S(cell.replace(/^[^=|]{1,12}?=/, '')); return w && w !== '-'; })) {
    return { refuse: 'its cells hold no answer to mark by' };
  }
  if (S(c.accept) && !S(c.accept).split('|').some(w => S(w))) return { refuse: 'its accept has no way in it' };
  if (S(c.draw_answer)) {
    let d = null;
    try { d = JSON.parse(S(c.draw_answer)); } catch (err) { d = null; }
    if (!d || !Array.isArray(d.items) || !d.items.length) return { refuse: 'its draw_answer is not a drawing to mark by' };
  }
  return null;
}

/* AN IMPORT REPLACES THE ROW WITH THAT ID, or adds one at the foot. Only the file's private fields, only text and numbers. */
function libImport_(fileKey, rows) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  if (!Array.isArray(rows) || !rows.length) return { error: 'No rows sent.' };
  if (rows.length > LIB_IMPORT_MAX) return { error: 'At most ' + LIB_IMPORT_MAX + ' rows at a time.' };
  const items = [], flagged = [];
  for (let i = 0; i < rows.length; i++) {
    const one = rows[i] || {}, id = S(one.id), c = one.content;
    if (!id || id.length > 160) return { error: 'Row ' + (i + 1) + ' has no id.' };
    if (!c || typeof c !== 'object' || Array.isArray(c)) return { error: id + ' has no content object.' };
    const odd = Object.keys(c).filter(k => def.private.indexOf(k) === -1 || (c[k] !== null && typeof c[k] === 'object'));
    if (odd.length) return { error: id + ' carries ' + odd.join(', ') + ' — not a private field of ' + def.file + ', or not text.' };
    const content = {};
    def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(c, f)) content[f] = c[f]; });
    const json = JSON.stringify(content);
    try { libCells_(json); } catch (err) { return { error: id + ': ' + err.message }; }
    const self = libSelfTest_(fileKey, content);
    if (self && self.refuse) return { error: id + ': ' + self.refuse + ' — nothing was written' };
    if (self && self.flag) flagged.push(id + ': ' + self.flag);
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    const sh = libSheet_(def, 0);
    const at = libIndex_(def, sh, '', null);
    let foot = Math.max(1, sh.getLastRow());
    let added = 0, replaced = 0;
    items.forEach(it => {
      let row = at[it.id];
      if (row) replaced++;
      else { foot++; row = foot; at[it.id] = row; added++; libSheet_(def, row); }
      sh.getRange(row, 1, 1, 3 + LIB_PARTS).setValues([libRowOut_(it)]);
    });
    libGenBump_();
    return { success: true, file: S(fileKey), added: added, replaced: replaced, flagged: flagged };
  } finally {
    lock.releaseLock();
  }
}


/* ---------- LIBRARY UPDATES FROM DRIVE (407): a session leaves lib-import-*.json in the owner's Drive; an admin's tile imports them ----------
   A session reaches Drive, not this script. docs/library.md. */
const LIB_DRIVE_FOLDER = 'family-library-imports';
const LIB_DRIVE_DONE = 'imported';
const LIB_DRIVE_NAME = /^lib-import-[A-Za-z0-9._:-]{1,80}\.json$/;
/* ONE FILE AT MOST THIS MANY ITEMS, and a press stops starting files after this long, inside Apps Script's six minutes. */
const LIB_DRIVE_MAX = 3000;
const LIB_DRIVE_MS = 4 * 60 * 1000;
const LIB_DRIVE_LAST = 'LIB_IMPORT_LAST';
/* THE HOURLY RUN (443): its handler, and the property holding what the last automatic import that found files did. */
const LIB_DRIVE_HOURLY = 'libImportHourly';
const LIB_DRIVE_AUTO = 'LIB_IMPORT_AUTO';

/* WHO OWNS IT, '' WHEN DRIVE WILL NOT SAY — only this account's own folder and files are read, never one shared with it. */
const libDriveOwner_ = f => { try { const o = f.getOwner && f.getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; } };
function libDriveMine_(f) {
  if (f.isTrashed && f.isTrashed()) return false;
  let me = '';
  try { me = norm(Session.getEffectiveUser().getEmail()); } catch (err) { me = ''; }
  const owner = libDriveOwner_(f);
  return !me || !owner || owner === me;
}
function libDriveFind_(it) { while (it && it.hasNext()) { const f = it.next(); if (libDriveMine_(f)) return f; } return null; }
/* THE FOLDER, MADE IF IT IS MISSING (so a session finds it the first time), and its `imported` subfolder. */
function libDriveFolder_() {
  return libDriveFind_(DriveApp.getFoldersByName(LIB_DRIVE_FOLDER)) || DriveApp.createFolder(LIB_DRIVE_FOLDER);
}
function libDriveDone_(folder) {
  return libDriveFind_(folder.getFoldersByName(LIB_DRIVE_DONE)) || folder.createFolder(LIB_DRIVE_DONE);
}
/* THE FILES WAITING: in the folder itself (not `imported`), named lib-import-<timestamp>.json, oldest name first. */
function libDrivePending_(folder) {
  const out = [];
  const it = folder.getFiles();
  while (it.hasNext()) { const f = it.next(); if (LIB_DRIVE_NAME.test(S(f.getName())) && libDriveMine_(f)) out.push(f); }
  return out.sort((a, b) => (S(a.getName()) < S(b.getName()) ? -1 : S(a.getName()) > S(b.getName()) ? 1 : 0));
}
/* A FILE'S TEXT. Drive may have made a Google Doc of an upload; that is exported as plain text rather than refused. */
function libDriveText_(f) {
  const mime = S(f.getMimeType && f.getMimeType());
  if (mime === 'application/vnd.google-apps.document') {
    const res = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(f.getId()) + '/export?mimeType=text%2Fplain',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('Drive would not export it as text (' + res.getResponseCode() + ')');
    return String(res.getContentText('UTF-8')).replace(/^﻿/, '');
  }
  return String(f.getBlob().getDataAsString('UTF-8')).replace(/^﻿/, '');
}
function libDriveMove_(f, folder, to) {
  if (typeof f.moveTo === 'function') { f.moveTo(to); return; }
  to.addFile(f); folder.removeFile(f);
}

/* WHAT THE CARD ASKS: how many files wait, and what the last press did. Admin only, at the gate. */
function libImportList_() {
  let folder;
  try { folder = libDriveFolder_(); } catch (err) { return { error: 'Drive could not be read — ' + S(err && err.message || err).slice(0, 160) + '. Run authoriseDrive once from the Apps Script editor.' }; }
  const pending = libDrivePending_(folder).map(f => ({ name: S(f.getName()), size: Number(f.getSize && f.getSize()) || 0 }));
  let last = null, auto = null;
  try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_DRIVE_LAST) || 'null'); } catch (err) { last = null; }
  try { auto = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_DRIVE_AUTO) || 'null'); } catch (err) { auto = null; }
  return { success: true, folder: LIB_DRIVE_FOLDER, pending: pending, last: last, auto: auto };
}

/* THE PUBLIC CARDS' IDS FOR A FILE, from the site (or GitHub) — asked only for an id the tab has no row for. */
function libPublicIds_(def, memo) {
  if (memo[def.file]) return memo[def.file];
  const urls = [S(SITE_URL).replace(/\/*$/, '/') + def.file];
  try { urls.push(RAW + def.file); } catch (err) { /* sync.gs is not in this scope */ }
  let got = null;
  for (let i = 0; i < urls.length && !got; i++) {
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) continue;
      const rows = JSON.parse(String(res.getContentText('UTF-8')));
      if (!Array.isArray(rows)) continue;
      got = {};
      rows.forEach(r => { const id = libIdOf_(def, r); if (id) got[id] = 1; });
    } catch (err) { got = null; }
  }
  memo[def.file] = got || {};
  return memo[def.file];
}

/* ONE FILE'S WORDS, CHECKED BEFORE A CELL IS TOUCHED: its shape, every field private, every value text, a number or null. */
function libDriveParse_(text) {
  let d;
  try { d = JSON.parse(text); } catch (err) { return { error: 'it is not whole JSON' }; }
  if (!d || typeof d !== 'object' || Number(d.version) !== 1) return { error: 'it is not version 1 (`{version: 1, files: {...}}`)' };
  if (!d.files || typeof d.files !== 'object' || Array.isArray(d.files)) return { error: 'it has no `files` object' };
  const plan = {};
  let n = 0;
  const keys = Object.keys(d.files);
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k], def = LIB_FILES[key], list = d.files[key];
    if (!def) return { error: '`' + key + '` is not a library file — one of ' + Object.keys(LIB_FILES).join(', ') };
    if (!Array.isArray(list)) return { error: '`files.' + key + '` is not a list' };
    const seen = {};
    plan[key] = [];
    for (let i = 0; i < list.length; i++) {
      const one = list[i];
      if (!one || typeof one !== 'object' || Array.isArray(one)) return { error: key + ' item ' + (i + 1) + ' is not an object' };
      const id = S(one.id);
      if (!id || id.length > 160) return { error: key + ' item ' + (i + 1) + ' has no id' };
      if (seen[id]) return { error: key + ' has ' + id + ' twice' };
      seen[id] = 1;
      const fields = Object.keys(one).filter(f => f !== 'id');
      const odd = fields.filter(f => def.private.indexOf(f) === -1 || (one[f] !== null && typeof one[f] === 'object') || typeof one[f] === 'boolean');
      if (odd.length) return { error: id + ' carries ' + odd.join(', ') + ' — not a private field of ' + def.file + ', or not text' };
      const set = {};
      fields.forEach(f => { set[f] = one[f]; });
      plan[key].push({ id: id, set: set });
      n++;
    }
  }
  if (!n) return { error: 'it has no items' };
  if (n > LIB_DRIVE_MAX) return { error: 'it has ' + n + ' items — at most ' + LIB_DRIVE_MAX + ' a file' };
  /* NEW PUBLIC CARDS STILL COME BY GIT; `cards` only vouches that an id the site has not got yet is meant. */
  const cards = {};
  const c = d.cards && typeof d.cards === 'object' ? d.cards : {};
  Object.keys(c).forEach(key => {
    const def = LIB_FILES[key];
    if (!def || !Array.isArray(c[key])) return;
    cards[key] = {};
    c[key].forEach(r => { const id = (r && libIdOf_(def, r)) || S(r && r.id); if (id) cards[key][id] = 1; });
  });
  return { plan: plan, cards: cards, n: n, note: S(d.note).slice(0, 300) };
}

/* ONE FILE INTO THE LEDGER: merge per id, write, read every row back; any row that does not read back puts every row of the file back as it was. */
function libDriveApply_(parsed, memo) {
  const counts = {}, writes = [], flagged = [];
  const keys = Object.keys(parsed.plan);
  /* PLAN EVERYTHING FIRST, so a refusal leaves the Ledger untouched. */
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k], def = LIB_FILES[key];
    const sh = libSheet_(def, 0);
    const at = libIndex_(def, sh, '', null);
    let foot = Math.max(1, sh.getLastRow());
    const c = counts[key] = { added: 0, replaced: 0, same: 0, deleted: 0 };
    for (let i = 0; i < parsed.plan[key].length; i++) {
      const one = parsed.plan[key][i];
      let row = at[one.id], prevCells = null, prev = {};
      if (row) {
        prevCells = sh.getRange(row, 1, 1, 3 + LIB_PARTS).getValues()[0];
        const have = libRowIn_(prevCells);
        try { prev = JSON.parse(have.json) || {}; } catch (err) { return { error: key + ' ' + one.id + ': the row in ' + def.tab + ' is not readable JSON — nothing was written' }; }
      } else if (!(parsed.cards[key] && parsed.cards[key][one.id]) && !libPublicIds_(def, memo)[one.id]) {
        return { error: one.id + ' is not a card in ' + def.file + ' (nor in this file\'s `cards`) — nothing was written' };
      }
      const next = {};
      def.private.forEach(f => {
        if (Object.prototype.hasOwnProperty.call(one.set, f)) { if (one.set[f] === null) { if (f in prev) c.deleted++; } else next[f] = one.set[f]; }
        else if (Object.prototype.hasOwnProperty.call(prev, f)) next[f] = prev[f];
      });
      const json = JSON.stringify(next);
      try { libCells_(json); } catch (err) { return { error: one.id + ': ' + err.message + ' — nothing was written' }; }
      const self = libSelfTest_(key, next);
      if (self && self.refuse) return { error: one.id + ': ' + self.refuse + ' — nothing was written' };
      if (self && self.flag) flagged.push(one.id + ': ' + self.flag);
      if (row && libRowIn_(prevCells).json === json) { c.same++; continue; }
      if (row) c.replaced++;
      else { foot++; row = foot; at[one.id] = row; c.added++; }
      writes.push({ key: key, sh: sh, row: row, prevCells: prevCells, item: { id: one.id, json: json, sum: libSum_(json) } });
    }
  }
  /* WRITE, THEN READ BACK — the copy's own check (libCopy_): the id, the stored checksum, the checksum of what the cells hold. */
  let bad = '';
  try {
    writes.forEach(w => { libSheet_(LIB_FILES[w.key], w.row); w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).setValues([libRowOut_(w.item)]); });
    try { SpreadsheetApp.flush(); } catch (err) {}
    for (let i = 0; i < writes.length && !bad; i++) {
      const w = writes[i], have = libRowIn_(w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).getValues()[0]);
      if (have.id !== w.item.id) bad = 'row ' + w.row + ' of ' + LIB_FILES[w.key].tab + ' is ' + have.id + ', not ' + w.item.id;
      else if (have.sum !== w.item.sum) bad = w.item.id + ' has the wrong checksum';
      else if (libSum_(have.json) !== w.item.sum) bad = w.item.id + ' does not read back as it was written';
    }
  } catch (err) { bad = 'writing failed (' + S(err && err.message || err).slice(0, 160) + ')'; }
  if (bad) {
    const blank = new Array(3 + LIB_PARTS).fill('');
    let restored = true;
    writes.forEach(w => {
      try { w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).setValues([w.prevCells || blank]); } catch (err) { restored = false; }
    });
    return { error: bad + (restored ? ' — every row of this file was put back as it was' : ' — AND PUTTING THE ROWS BACK FAILED: check the lib_ tabs') };
  }
  return { counts: counts, written: writes.length, flagged: flagged };
}

/* THE PRESS (and `?run=libImportDrive`): every waiting file, oldest first, each whole or not at all; a done file moves to `imported`. */
/* `auto` (the hourly run, 443): the same press, but it makes no folder, and an empty folder or a busy lock leaves no trace. */
function libImportDrive_(by, auto) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(auto ? 5000 : 30000)) return { error: 'Busy — another import or write is running. Try again in a moment.', why: 'busy' };
  const wroteBefore = POST_WROTE;
  const t0 = Date.now();
  const report = { success: true, at: new Date().toISOString(), files: [], imported: 0, failed: 0, left: 0 };
  if (auto) report.auto = true;
  try {
    let folder, done, files;
    try {
      folder = auto ? libDriveFind_(DriveApp.getFoldersByName(LIB_DRIVE_FOLDER)) : libDriveFolder_();
      files = folder ? libDrivePending_(folder) : [];
      if (auto && !files.length) return { success: true, auto: true, at: report.at, files: [], imported: 0, failed: 0, left: 0, nothing: true };
      done = libDriveDone_(folder);
    }
    catch (err) { return { error: 'Drive could not be read — ' + S(err && err.message || err).slice(0, 160) + '. Run authoriseDrive once from the Apps Script editor.' }; }
    const memo = {};
    let any = false;
    for (let i = 0; i < files.length; i++) {
      const f = files[i], name = S(f.getName());
      if (Date.now() - t0 > LIB_DRIVE_MS) { report.left = files.length - i; break; }
      let one;
      try {
        const parsed = libDriveParse_(libDriveText_(f));
        one = parsed.error ? { error: parsed.error + ' — nothing was written' } : libDriveApply_(parsed, memo);
        if (!one.error) one.note = parsed.note;
      } catch (err) { one = { error: S(err && err.message || err).slice(0, 200) }; }
      if (one.error) { report.failed++; report.files.push({ name: name, error: one.error }); continue; }
      if (one.written) any = true;
      let moved = true;
      try { libDriveMove_(f, folder, done); } catch (err) { moved = false; }
      report.imported++;
      report.files.push({ name: name, counts: one.counts, written: one.written, note: one.note, moved: moved, flagged: (one.flagged || []).slice(0, 40) });
      libDriveLog_(by, name, one);
    }
    /* EVERY CACHED ITEM AND INDEX IS KEYED BY THE GENERATION: a new one and nobody is served the old words. */
    if (any) libGenBump_();
    if (report.failed) report.success = report.imported > 0;
    if (report.failed && !report.imported) report.error = report.files.filter(x => x.error).map(x => x.name + ': ' + x.error).join('; ');
    try { PropertiesService.getScriptProperties().setProperty(LIB_DRIVE_LAST, JSON.stringify(report).slice(0, 8000)); } catch (err) {}
    if (auto) try { PropertiesService.getScriptProperties().setProperty(LIB_DRIVE_AUTO, JSON.stringify(report).slice(0, 8000)); } catch (err) {}
    return report;
  } finally {
    lock.releaseLock();
    /* NO PAYLOAD CARRIES THE LIBRARY'S WORDS OR THE LOG, so the stored payload stands. */
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}
/* THE HOURLY TRIGGER'S HANDLER (443): no person, so the log's handle says `hourly`. Public — a trigger cannot call a name ending _. */
function libImportHourly() {
  const res = libImportDrive_({ handle: 'hourly' }, true);
  if (res && res.error && res.why !== 'busy') Logger.log('libImportHourly: ' + res.error);
  return res;
}
/* KEPT BOOKED BY THE ADMIN-LOAD SETUP (361): exactly one hourly trigger; null when it already is. */
function libImportKeepBooked_() {
  const mine = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === LIB_DRIVE_HOURLY);
  if (mine.length === 1) return null;
  mine.forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(LIB_DRIVE_HOURLY).timeBased().everyHours(1).create();
  return { installed: LIB_DRIVE_HOURLY, removed: mine.length };
}
/* A LINE IN `lib_log` PER FILE IMPORTED — `person_id` is `library-import`, never a person, so the day's cap never reads it as anybody's tally. */
function libDriveLog_(by, name, one) {
  try {
    const t = read(TAB.libLog);
    if (!t.sheet) return;
    const said = Object.keys(one.counts).map(k => { const c = one.counts[k]; return k + ' +' + c.added + ' ~' + c.replaced + ' =' + c.same + (c.deleted ? ' -' + c.deleted + ' field(s)' : ''); }).join('; ');
    addRow(t, { day: reportDay_(new Date()), person_id: 'library-import', handle: S(by && by.handle), served: one.written,
                ids: (name + ': ' + said + (one.note ? ' — ' + one.note : '')).slice(0, 2000), refused: 0, last_at: new Date() });
  } catch (err) { /* the log costs a line, never the import */ }
}

/* ---------- REELS AND VIDEOS AN ADMIN ADDS FROM THE PHONE (404) ---------- */
const MEDIA_KINDS = ['reel', 'video'];
const MEDIA_YT_RE = /^[A-Za-z0-9_-]{11}$/;
/* A REEL UPLOADED AS A FILE (474): "add a reel should also give me option to upload a file instead" — `f` and the upload's milliseconds. */
const MEDIA_FILE_RE = /^f\d{10,16}$/;
const mediaIdOk_ = id => MEDIA_YT_RE.test(id) || MEDIA_FILE_RE.test(id);
const MEDIA_CAP = { title: 200, channel: 120, subject: 60, tags: 300, vkind: 20, age: 20, notes: 500, url: 300, thumb: 300 };

/* ---------- HOW OLD YOU HAVE TO BE TO WATCH IT (406) ----------
   A minimum age in whole years; blank, 0, U, PG or words = everyone. The cell may say "12+" — the number is what counts. */
const MEDIA_AGE_MAX = 21;
/* AN AGE NOBODY KNOWS IS UNDERAGE (450): signed out or no date of birth sees only what has no minimum age. */
const MEDIA_AGE_UNKNOWN = 0;
function mediaAgeOf_(v) {
  const m = S(v).match(/\d+/);
  return m ? Math.min(MEDIA_AGE_MAX, Number(m[0])) : 0;
}
/* WHOLE YEARS SINCE A PERSON'S DATE OF BIRTH (or an `age` cell), or null when the row says neither. */
function personAge_(r) {
  if (!r) return null;
  const d = dobOut(r.date_of_birth), y = Number(d.dob_y), mo = Number(d.dob_m) || 1, dd = Number(d.dob_d) || 1;
  if (y > 1900) {
    const now = new Date();
    return now.getFullYear() - y - ((now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < dd)) ? 1 : 0);
  }
  const a = S(r.age).match(/^\s*(\d{1,3})\s*$/);
  return a ? Number(a[1]) : null;
}
/* THE OLDEST RATING THIS VIEWER MAY SEE: an admin everything; a known age that age; no date of birth, whatever the rank, underage (450). */
function mediaAgeCap_(r) {
  if (r && hasRole(r, 'admin')) return Infinity;
  const age = personAge_(r);
  return age !== null ? age : MEDIA_AGE_UNKNOWN;
}
/* A ROW TOO OLD FOR THIS VIEWER STILL HIDES A REPOSITORY COPY of the same video, by this hash rather than the id
   (the id alone is the video). FNV-1a of `kind:id`; `mediaVeil_` in games.js is the same sum. */
function mediaVeil_(kind, id) {
  let h = 0x811c9dc5;
  const s = kind + ':' + id;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* THE ID A PASTED LINK NAMES — watch, shorts, embed, live, youtu.be — or '' for anything else. */
function mediaYtId_(url) {
  const m = S(url).match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i);
  return m ? m[1] : '';
}

function mediaRowOf_(t, kind, id) {
  return t.rows.find(function (r) { return S(r.kind) === kind && S(r.yt_id) === id; }) || null;
}

/* ONE WRITER FOR ALL THREE ACTIONS, under the script lock with the rows read fresh. Returns the reply object. */
function mediaWrite_(action, body) {
  const kind = S(body.kind);
  if (MEDIA_KINDS.indexOf(kind) === -1) return { error: 'Is it a reel or a video? Nothing was saved.' };
  /* AN EDIT OF AN UPLOADED REEL NAMES ITS ID; a new upload makes one, after the file is in Drive. */
  const fileId = MEDIA_FILE_RE.test(S(body.id)) ? S(body.id) : '';
  let id = action === 'mediaUpload' ? 'f' + new Date().getTime()
    : action === 'mediaSave' ? (mediaYtId_(body.url) || fileId) : S(body.id);
  if (!mediaIdOk_(id)) return { error: 'That is not a YouTube link. Nothing was saved.' };
  const put = {};
  if (action === 'mediaUpload') {
    if (kind !== 'reel') return { error: 'Only a reel can be uploaded as a file. Nothing was saved.' };
    const data = S(body.data);
    if (!/^data:video\//i.test(data)) return { error: 'That file is not a video. Nothing was saved.' };
    /* THE CAMERA'S LIMIT (`CAM_VID_MAX`, posts.js): twenty megabytes a clip, base64 being a third bigger. */
    if ((data.length - data.indexOf(',') - 1) * 3 / 4 > POST_FILE_MAX) return { error: 'That video is over 20 MB. Nothing was saved.' };
    if (!S(body.title)) return { error: 'It needs a title. Nothing was saved.' };
    const folder = getPostFolder();
    if (!folder) return { error: 'No posts folder. Add a row to the config tab: key `posts_folder`, value the id from the folder URL.' };
    let url = '';
    try { url = driveKeep_(folder, data, 'reel-' + id); }
    catch (err) { return { error: 'Could not save the video. ' + S(err && err.message || err) }; }
    ['title', 'subject'].forEach(function (k) { put[k] = S(body[k]).slice(0, MEDIA_CAP[k]); });
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    put.url = url;
    put.hidden = 'FALSE';
  } else if (action === 'mediaSave') {
    const too = Object.keys(MEDIA_CAP).filter(function (k) { return S(body[k]).length > MEDIA_CAP[k]; });
    if (too.length) return { error: 'Too long: ' + too.join(', ') + '. Nothing was saved.' };
    if (!S(body.title)) return { error: 'It needs a title. Nothing was saved.' };
    const thumb = S(body.thumb);
    if (thumb && !/^https:\/\/i\.ytimg\.com\//.test(thumb)) return { error: 'The picture must be YouTube\'s own. Nothing was saved.' };
    Object.keys(MEDIA_CAP).forEach(function (k) { put[k] = S(body[k]); });
    /* WHOLE YEARS, OR BLANK FOR EVERYONE (406). */
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    if (MEDIA_FILE_RE.test(id)) { delete put.url; delete put.thumb; }
    else put.url = kind === 'reel' ? 'https://youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id;
    put.hidden = 'FALSE';
  } else if (action === 'mediaHide') {
    put.hidden = body.hidden === false ? 'FALSE' : 'TRUE';
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    clearCache();
    const t = read(TAB.media);
    if (!t.sheet) return { error: 'The media tab is not there yet — open the site once as an admin so setup makes it. Nothing was saved.' };
    const r = mediaRowOf_(t, kind, id);
    const by = S(body.personId), now = new Date();
    if (action === 'mediaDelete') {
      if (!r) return { error: 'Nothing to delete — that one came from the repository. Hide it instead.' };
      if (!delRow(t, r)) return { error: 'The media tab could not be changed — nothing was deleted.' };
    } else if (r) {
      put.updated_on = now;
      setCells(t, r, put);
    } else {
      if (action === 'mediaHide' && put.hidden === 'FALSE') return { error: 'Nothing to show again.' };
      if (action === 'mediaSave' && MEDIA_FILE_RE.test(id)) return { error: 'That uploaded reel is not there any more. Nothing was saved.' };
      if (!addRow(t, Object.assign({ media_id: kind + ':' + id, kind: kind, yt_id: id, added_by: by, added_on: now, updated_on: now }, put))) {
        return { error: 'The media tab could not be opened — nothing was saved.' };
      }
    }
    try { SpreadsheetApp.flush(); } catch (err) {}
  } finally {
    lock.releaseLock();
  }
  clearCache();
  return { success: true, kind: kind, id: id, media: mediaOut_(Infinity) };
}

/* ---------- CONSOLE SAVES (446): "when a user plays a game and they're logged in, it will save their progress" — the Console's games too. */
/* One text file per person and game in the script account's own Drive folder, never the sheet. The ROM is never sent: only its hash and the save. */
const CONSOLE_SAVE_PROP = 'CONSOLE_SAVES_FOLDER';
const CONSOLE_SAVE_MAX = 2 * 1024 * 1024;   // packed bytes per game, battery save and state together
const CONSOLE_SAVE_SYS = ['nes', 'snes', 'gb', 'gbc', 'gba', 'n64', 'nds'];
const CONSOLE_SAVE_TOO_BIG = 'This game\'s save is bigger than an account keeps (2 MB), so it stays on this device only.';

function consoleSaveFolder_(make) {
  const props = PropertiesService.getScriptProperties();
  const id = S(props.getProperty(CONSOLE_SAVE_PROP));
  if (id) { try { const f = DriveApp.getFolderById(id); if (f && !(f.isTrashed && f.isTrashed())) return f; } catch (err) {} }
  if (!make) return null;
  const f = DriveApp.createFolder('family console saves');
  props.setProperty(CONSOLE_SAVE_PROP, f.getId());
  return f;
}
/* The person's id and the hash, both cut to safe letters, so a name can never point outside its own file. */
const consoleSaveName_ = (pid, hash) => 'cs-' + S(pid).replace(/[^\w-]/g, '') + '-' + hash + '.json';
const consoleSaveHash_ = h => (/^[0-9a-f]{16,64}$/.test(S(h)) ? S(h) : '');
function consoleSaveFile_(folder, name) {
  if (!folder) return null;
  const it = folder.getFilesByName(name);
  return it && it.hasNext() ? it.next() : null;
}

function consoleSave_(pid, body) {
  const hash = consoleSaveHash_(body.hash), sys = S(body.sys);
  if (!pid) return { error: 'Please sign in again.', why: 'signed-out' };
  if (!hash || CONSOLE_SAVE_SYS.indexOf(sys) < 0) return { error: 'That save did not say which game it was for. Nothing was kept.' };
  /* ONLY SAVE DATA: two base64 strings of the phone's packed bytes, nothing that could be a picture or a file of any other kind. */
  const sram = S(body.sram), state = S(body.state);
  if (!sram && !state) return { error: 'There was nothing in that save. Nothing was kept.' };
  if (!/^[A-Za-z0-9+/=]*$/.test(sram) || !/^[A-Za-z0-9+/=]*$/.test(state)) return { error: 'That save was not in the expected shape. Nothing was kept.' };
  if (Math.floor((sram.length + state.length) * 3 / 4) > CONSOLE_SAVE_MAX) return { error: CONSOLE_SAVE_TOO_BIG, why: 'too-big' };
  const at = Math.min(Date.now(), Number(body.at) || Date.now());
  const text = JSON.stringify({ v: 1, hash: hash, sys: sys, at: at, sram: sram, state: state });
  const folder = consoleSaveFolder_(true), name = consoleSaveName_(pid, hash);
  /* THE LATEST ONLY: the one file is overwritten, so an account holds one save per game. */
  const file = consoleSaveFile_(folder, name);
  if (file) file.setContent(text); else folder.createFile(name, text, 'application/json');
  return { success: true, at: at };
}

function consoleLoad_(pid, hash) {
  hash = consoleSaveHash_(hash);
  if (!pid) return { error: 'Please sign in again.', why: 'signed-out' };
  if (!hash) return { success: true, save: null };
  const file = consoleSaveFile_(consoleSaveFolder_(false), consoleSaveName_(pid, hash));
  if (!file) return { success: true, save: null };
  let got = null;
  try { got = JSON.parse(file.getBlob().getDataAsString()); } catch (err) { got = null; }
  if (!got || got.hash !== hash) return { success: true, save: null };
  return { success: true, save: { at: Number(got.at) || 0, sys: S(got.sys), sram: S(got.sram), state: S(got.state) } };
}
