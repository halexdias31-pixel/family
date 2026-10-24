#!/usr/bin/env node
/* node js/check-race.js — THE RACER'S MAP, BUILT BY THE REAL BACKEND OVER A FAKE OVERPASS, DEM AND DRIVE (426). */
/* Proves: crossings shared, roads every 15 m or less, the cut at the box, the DEM fallbacks and height cache, one Drive file ?race=1 serves. */
/* And: nothing served before a build, raceBuild an admin's, and the committed fixture in the built shape. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [], info = [];
let asked = 0;
const fail = (rule, msg) => bad.push(rule + ' — ' + msg);
const ok = (cond, rule, msg) => { asked++; if (!cond) fail(rule, msg); };

/* ---------- AN INVENTED STREET CORNER: two roads crossing at node 3, a way leaving the box, a river, two buildings ---------- */
const LAT0 = 51.418, LON0 = -0.178, mLat = 111320, mLon = 111320 * Math.cos(LAT0 * Math.PI / 180);
const ll = (x, y) => ({ lat: LAT0 + y / mLat, lon: LON0 + x / mLon });
const node = (id, x, y) => Object.assign({ type: 'node', id }, ll(x, y));
const OVERPASS = { elements: [
  { type: 'way', id: 10, nodes: [1, 2, 3, 4], tags: { highway: 'primary', name: 'High Street Colliers Wood', lanes: '2' } },
  { type: 'way', id: 11, nodes: [5, 3, 6], tags: { highway: 'residential', name: 'Christchurch Road', width: '7.5' } },
  /* Runs 5 km north: only its first 60 m past the box's edge may stay. */
  { type: 'way', id: 12, nodes: [4, 7, 8], tags: { highway: 'service', oneway: 'yes' } },
  node(1, 0, -200), node(2, 0, -100), node(3, 0, 0), node(4, 0, 100),
  node(5, -150, 0), node(6, 150, 0), node(7, 0, 700), node(8, 0, 5000),
  { type: 'way', id: 20, tags: { waterway: 'river', name: 'River Wandle' }, geometry: [ll(300, -300), ll(310, 0), ll(300, 300)] },
  { type: 'way', id: 30, tags: { building: 'house' }, geometry: [ll(20, 20), ll(30, 20), ll(30, 30), ll(20, 30), ll(20, 20)] },
  { type: 'way', id: 31, tags: { building: 'apartments', 'building:levels': '5' }, geometry: [ll(-40, 20), ll(-20, 20), ll(-20, 40), ll(-40, 40), ll(-40, 20)] },
  /* Too small to be a building anybody could drive into: dropped. */
  { type: 'way', id: 32, tags: { building: 'shed' }, geometry: [ll(60, 60), ll(62, 60), ll(62, 62), ll(60, 62), ll(60, 60)] },
] };
/* The ground: 10 m, rising 1 m per 100 m north, with one spike that the median must take out. */
const groundAt = (lat, lon) => 10 + (lat - LAT0) * mLat / 100;
const BOX = [LAT0 - 500 / mLat, LON0 - 500 / mLon, LAT0 + 500 / mLat, LON0 + 500 / mLon];

function world(opts) {
  opts = opts || {};
  const calls = { overpass: 0, dem: {}, points: 0 };
  const files = new Map();
  let n = 0;
  const UrlFetchApp = {
    fetch: (url, o) => {
      const reply = (code, body) => ({ getResponseCode: () => code, getContentText: () => (typeof body === 'string' ? body : JSON.stringify(body)) });
      if (/overpass/.test(url)) {
        calls.overpass++;
        if (opts.overpassDown) throw new Error('Address unavailable');
        return reply(200, OVERPASS);
      }
      const dem = /opentopodata\.org\/v1\/(\w+)/.exec(url);
      if (dem) {
        calls.dem[dem[1]] = (calls.dem[dem[1]] || 0) + 1;
        const locs = decodeURIComponent(url.split('locations=')[1] || '').split('|').map(s => s.split(',').map(Number));
        calls.points += locs.length;
        if (locs.length > 100) return reply(400, { error: 'Too many locations' });
        const none = (opts.noData || []).indexOf(dem[1]) !== -1;
        return reply(200, { status: 'OK', results: locs.map(([la, lo]) => ({ elevation: none ? null : groundAt(la, lo) + (opts.spike && Math.abs(la - LAT0) < 2e-6 && Math.abs(lo - LON0) < 2e-6 ? 40 : 0), location: { lat: la, lng: lo } })) });
      }
      if (/open-elevation/.test(url)) {
        calls.dem.openelev = (calls.dem.openelev || 0) + 1;
        const locs = JSON.parse(o.payload).locations;
        return reply(200, { results: locs.map(p => ({ latitude: p.latitude, longitude: p.longitude, elevation: groundAt(p.latitude, p.longitude) })) });
      }
      throw new Error('unexpected fetch ' + url);
    },
  };
  const fileOf = id => {
    const f = files.get(id);
    return { getId: () => id, isTrashed: () => false, setContent: s => { f.body = s; f.writes++; },
             getBlob: () => ({ getDataAsString: () => f.body }) };
  };
  const DriveApp = {
    createFile: (name, body) => { const id = 'example-race-' + (++n); files.set(id, { name, body, writes: 1 }); return fileOf(id); },
    getFileById: id => { if (!files.has(id)) throw new Error('No item with the given ID could be found'); return fileOf(id); },
    getFolderById: () => null,
  };
  const b = backend({ UrlFetchApp, DriveApp });
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
  ]);
  const tok = {};
  ['a1@example.org', 's1@example.org'].forEach(e => { tok[e] = b.post({ action: 'verifyLogin', email: e, pin: '0000' }).token; });
  const build = () => b.ev('buildRaceMap_(' + JSON.stringify(BOX.join(',')) + ')');
  return { b, calls, files, tok, build };
}

const dist = (P, i, j) => Math.hypot(P[3 * i] - P[3 * j], P[3 * i + 1] - P[3 * j + 1]) / 10;

/* ---------- 1. NOTHING BUILT: `?race=1` SAYS SO, AND SENDS NO MAP ---------- */
{
  const { b } = world();
  const r = b.get({ race: '1' });
  ok(r.built === false && r.race === null, 'before a build', '?race=1 answered ' + JSON.stringify(r).slice(0, 160));
  const pay = b.get({});
  ok(!('race' in pay), 'the payload', 'the boot payload carries a `race` key — the map must stay behind ?race=1');
}

/* ---------- 2. A BUILD ---------- */
{
  const { b, calls, files, build } = world({ spike: true });
  const out = build();
  ok(out && out.built, 'the build', 'buildRaceMap_ did not build: ' + JSON.stringify(out).slice(0, 300));
  if (out && out.built) {
    ok(calls.overpass === 1, 'the build', calls.overpass + ' Overpass calls for one build');
    ok(files.size === 1, 'the build', files.size + ' Drive files after one build');
    const map = JSON.parse([...files.values()][0].body);
    const P = map.pts, np = P.length / 3;
    ok(np === Math.floor(np) && np > 20, 'the points', 'pts is not x,y,h triples: ' + P.length);
    ok(map.roads.length === 3, 'the roads', map.roads.length + ' roads, wanted 3 (the service road cut to the piece in the box)');
    const hs = map.roads.find(r => r[0] === 'High Street Colliers Wood'), cr = map.roads.find(r => r[0] === 'Christchurch Road');
    if (hs && cr) {
      const shared = hs[5].filter(i => cr[5].indexOf(i) !== -1);
      ok(shared.length === 1, 'a crossing', 'High Street and Christchurch Road share ' + shared.length + ' points, wanted the one OSM node they share');
      ok(hs[2] === 66 && hs[3] === 2, 'a width', 'two lanes should be 6.6 m: got ' + hs[2] / 10 + ' m, lanes ' + hs[3]);
      ok(cr[2] === 75, 'a width', 'width=7.5 should be 7.5 m: got ' + cr[2] / 10);
    } else fail('the roads', 'High Street or Christchurch Road is missing by name');
    let worst = 0;
    map.roads.forEach(r => { for (let k = 0; k + 1 < r[5].length; k++) worst = Math.max(worst, dist(P, r[5][k], r[5][k + 1])); });
    ok(worst <= 15.01, 'sampling', 'two points of one road ' + worst.toFixed(1) + ' m apart, wanted every 15 m or less');
    const svc = map.roads.find(r => r[1] === 'service');
    const far = svc ? Math.max(...svc[5].map(i => P[3 * i + 1] / 10)) : 0;
    ok(svc && svc[4] === 1 && far <= 500 + 60 + 0.1, 'the box', 'the service road reaches ' + far + ' m north (box edge 500 m, kept 60 m past), oneway ' + (svc && svc[4]));
    ok(map.bld.length === 2, 'buildings', map.bld.length + ' buildings, wanted 2 (the shed is under 12 m²)');
    const flats = map.bld.find(x => x[0] === 160);
    ok(!!flats, 'buildings', 'five storeys should be 16 m: heights ' + map.bld.map(x => x[0] / 10).join(', '));
    ok(map.water.length === 1 && map.water[0][0] === 'River Wandle', 'water', JSON.stringify(map.water).slice(0, 120));
    /* THE HEIGHTS: the slope survives and the spike at the crossing does not. */
    const at3 = hs ? hs[5].find(i => cr[5].indexOf(i) !== -1) : -1;
    ok(at3 >= 0 && Math.abs(P[3 * at3 + 2] / 10 - 10) < 0.6, 'heights', 'the crossing is ' + (at3 >= 0 ? P[3 * at3 + 2] / 10 : '?') + ' m; the ground there is 10 m and a 40 m spike should be gone');
    const north = hs ? hs[5][hs[5].length - 1] : -1;
    ok(north >= 0 && Math.abs(P[3 * north + 2] / 10 - (10 + P[3 * north + 1] / 1000)) < 0.6, 'heights', 'the north end lost the slope');
    ok(map.grid && map.grid.h.length === map.grid.nx * map.grid.ny, 'the grid', 'grid has ' + (map.grid && map.grid.h.length) + ' heights for ' + (map.grid && map.grid.nx + '×' + map.grid.ny));
    ok(/OpenStreetMap contributors/.test(map.osm) && /EU-DEM/.test(map.dem), 'attribution', 'osm: ' + map.osm + ' · dem: ' + map.dem);
    ok(!calls.dem.srtm30m && calls.points === np + map.grid.h.length, 'the DEM', 'asked for ' + calls.points + ' heights for ' + (np + map.grid.h.length) + ' points; ' + JSON.stringify(calls.dem));

    /* SERVED, and served again from the cache rather than Drive. */
    const r = b.get({ race: '1' });
    ok(r.built === true && r.race && r.race.pts.length === P.length, '?race=1', 'did not serve the built map: ' + JSON.stringify(r).slice(0, 160));
    files.clear();
    const r2 = b.get({ race: '1' });
    ok(r2.built === true && r2.race && r2.race.roads.length === 3, '?race=1', 'the second ask went to Drive rather than the cache');

    /* AGAIN: the heights are cached, so a second build asks the DEM for nothing. */
    const before = calls.points;
    b.ev('PropertiesService.getScriptProperties().deleteProperty("RACE_MAP")');
    const out2 = build();
    ok(out2 && out2.built && calls.points === before, 'resuming', 'a second build asked for ' + (calls.points - before) + ' heights the cache holds');

    /* AND THE FIXTURE THE JOURNEYS DRIVE IS THIS SHAPE. */
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'check', 'race-fixture.json'), 'utf8'));
    const keys = o => Object.keys(o).sort().join(',');
    ok(keys(fx) === keys(map), 'the fixture', 'check/race-fixture.json has keys ' + keys(fx) + '; a build has ' + keys(map));
    ok(keys(fx.grid) === keys(map.grid), 'the fixture', 'grid keys ' + keys(fx.grid) + ' vs ' + keys(map.grid));
    ok(fx.roads.every(r => r.length === 6 && Array.isArray(r[5])) && fx.bld.every(x => x.length === 2), 'the fixture', 'a road or building row is not the built shape');
    info.push(np + ' points, ' + map.roads.length + ' roads, ' + map.bld.length + ' buildings, ' + JSON.stringify(calls.dem) + ' DEM calls');
  }
}

/* ---------- 3. A DATASET THAT HAS NO DATA FOR THE BOX IS LEFT FOR THE NEXT, WHOLE ---------- */
{
  const { calls, files, build } = world({ noData: ['eudem25m'] });
  const out = build();
  ok(out && out.built && /SRTM/.test(out.dem), 'the fallback', 'eudem answering nulls should fall to SRTM: ' + JSON.stringify(out).slice(0, 200));
  ok(calls.dem.eudem25m === 1, 'the fallback', 'eudem asked ' + calls.dem.eudem25m + ' times after its first null');
  if (files.size) ok(/SRTM/.test(JSON.parse([...files.values()][0].body).dem), 'the fallback', 'the file names the wrong DEM');
}
{
  const { build } = world({ noData: ['eudem25m', 'srtm30m'] });
  const out = build();
  ok(out && out.built && /Open-Elevation/.test(out.dem), 'the fallback', 'both OpenTopoData sets empty should fall to Open-Elevation: ' + JSON.stringify(out).slice(0, 200));
}
{
  const { b, build } = world({ overpassDown: true });
  const out = build();
  ok(out && /No Overpass server answered/.test(out.error) && out.tried.length === 3, 'Overpass down', JSON.stringify(out).slice(0, 200));
  ok(b.get({ race: '1' }).built === false, 'Overpass down', 'a failed build left something served');
}

/* ---------- 4. WHO MAY BUILD ---------- */
{
  const { b, tok, files } = world();
  const kid = b.post({ action: 'raceBuild', token: tok['s1@example.org'] });
  ok(!kid.success && files.size === 0, 'who builds', 'a student\'s raceBuild was not refused: ' + JSON.stringify(kid).slice(0, 160));
  ok(/"buildRaceMap"/.test(String(b.ev('JSON.stringify(Object.keys(RUNNABLE))'))),
    'who builds', 'RUNNABLE has no buildRaceMap');
  const adm = b.post({ action: 'raceBuild', token: tok['a1@example.org'] });
  ok(adm.success && adm.built && files.size === 1, 'who builds', 'an admin\'s raceBuild did not build: ' + JSON.stringify(adm).slice(0, 200));
}

if (bad.length) {
  console.log('FAILED — ' + bad.length + ' of ' + asked + ':');
  bad.forEach(x => console.log('  ✗ ' + x));
  process.exit(1);
}
if (process.env.VERBOSE || process.argv.includes('-v')) info.forEach(x => console.log('  ' + x));
console.log('OK — the racer\'s map: ' + asked + ' things asked of the real backend (crossings, sampling, the box, heights, fallbacks, cache, ?race=1, who builds).');
