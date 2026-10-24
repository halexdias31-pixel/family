#!/usr/bin/env node
/* tools/race_fixture.js — writes check/race-fixture.json, an INVENTED town in the shape `buildRaceMap_` builds (426). */
/* Not OSM data: streets borrowing the route's names, a hill, a river, some blocks — so checks drive offline. Re-run after changing the shape. */
'use strict';
const fs = require('fs'), path = require('path');

const STEP = 15, CELL = 40, HALF = 320;
/* The hill sits on Christchurch Road's west end, so the route climbs about 9 m and comes back down. */
const ground = (x, y) => 12 + 9 * Math.exp(-((x + 150) ** 2 + (y - 140) ** 2) / (2 * 80 ** 2)) + 0.004 * y;
const dm = v => Math.round(v * 10);

const XY = [], byKey = {};
const pt = (x, y) => {
  const k = Math.round(x) + ',' + Math.round(y);
  if (byKey[k] === undefined) { byKey[k] = XY.length; XY.push([x, y]); }
  return byKey[k];
};
/* A straight road from a to b, a point every STEP metres or less. A crossing is shared only if both roads END a piece there, as join() below does. */
const line = (a, b) => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / STEP), out = [];
  for (let i = 0; i <= n; i++) out.push(pt(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n));
  return out;
};
const join = (...runs) => runs.reduce((all, r) => all.concat(all.length ? r.slice(1) : r), []);

const roads = [
  ['High Street Colliers Wood', 'primary', 100, 2, 0, join(line([0, -280], [0, -150]), line([0, -150], [0, 60]), line([0, 60], [0, 140]), line([0, 140], [0, 280]))],
  ['Christchurch Road', 'secondary', 90, 2, 0, join(line([0, 140], [-150, 140]), line([-150, 140], [-270, 140]))],
  ['Merantun Way', 'trunk', 100, 2, 0, join(line([-270, -150], [0, -150]), line([0, -150], [120, -150]), line([120, -150], [270, -150]))],
  ['Western Road', 'residential', 65, 0, 0, line([-270, 140], [-270, -150])],
  ['Station Road', 'residential', 65, 0, 0, join(line([0, 60], [120, 60]), line([120, 60], [240, 60]))],
  ['Baltic Close', 'service', 40, 0, 1, line([120, 60], [120, -150])],
];

const water = [['River Wandle', 90,
  [[260, -300], [250, -150], [215, 0], [230, 150], [210, 300]].reduce((a, p) => a.concat([dm(p[0]), dm(p[1])]), [])]];

const bld = [];
const block = (cx, cy, w, d, h) => bld.push([dm(h), [[cx - w / 2, cy - d / 2], [cx + w / 2, cy - d / 2],
  [cx + w / 2, cy + d / 2], [cx - w / 2, cy + d / 2]].reduce((a, p) => a.concat([dm(p[0]), dm(p[1])]), [])]);
for (let y = -250; y <= 250; y += 22) { if (Math.abs(y - 140) > 20 && Math.abs(y + 150) > 20 && Math.abs(y - 60) > 20) { block(-16, y, 12, 16, 7.5); block(16, y, 12, 16, y % 3 ? 7.5 : 12); } }
for (let x = -240; x <= -30; x += 24) { block(x, 160, 14, 12, 7.5); block(x, 120, 14, 12, 7.5); block(x, -170, 16, 14, 9); }
/* An L-shaped block, so the roof's triangulation meets a corner that is not convex. */
bld.push([dm(9), [[40, 90], [90, 90], [90, 100], [55, 100], [55, 130], [40, 130]].reduce((a, p) => a.concat([dm(p[0]), dm(p[1])]), [])]);

const nx = Math.ceil(HALF * 2 / CELL) + 1, ny = nx, gh = [];
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) gh.push(dm(ground(-HALF + i * CELL, -HALF + j * CELL)));

const pts = [];
XY.forEach(p => pts.push(dm(p[0]), dm(p[1]), dm(ground(p[0], p[1]))));
const map = {
  v: 1, place: 'Colliers Wood (invented, for the checks)', built: '2026-10-24T00:00:00.000Z',
  box: [51.4151, -0.1826, 51.4209, -0.1734], origin: [51.418, -0.178], step: STEP,
  osm: 'Map data © OpenStreetMap contributors (ODbL)', dem: 'Invented heights (check fixture)',
  pts, roads, water, bld,
  grid: { x0: dm(-HALF), y0: dm(-HALF), cell: CELL, nx, ny, h: gh },
};
const out = path.join(__dirname, '..', 'check', 'race-fixture.json');
fs.writeFileSync(out, JSON.stringify(map) + '\n');
console.log('wrote ' + path.relative(process.cwd(), out) + ': ' + XY.length + ' points, ' + roads.length + ' roads, ' + bld.length + ' buildings');
