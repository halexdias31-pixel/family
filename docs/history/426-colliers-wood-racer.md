# 426 — the Colliers Wood racer

The owner, 24 Oct 2026: "i want to make a map for a racing game to appear in games column. the map will just be
accurate data from colliers wood. as accurate as possible. including the level incline of floor. like lang and long
and alt levels, so it feels you are actually driving in colliers wood."

## Where the map comes from

The session that built this could not reach Overpass, OpenTopoData, Open-Elevation or the OSM tile servers (the
container's proxy refuses them), so no real map was fetched or committed. The Apps Script backend can fetch the web,
so the backend builds the map and the site only reads it:

- **`buildRaceMap_` (content.gs)**, run as `?run=buildRaceMap` (RUNNABLE) or from the card's admin tile (`raceBuild`,
  admin-only in `ACTION_ACCESS`). It asks Overpass (three mirrors, as the old `fetchMap` did before 431 deleted it)
  for the box `RACE_BOX` — about 1.5 km square round Colliers Wood station, 51.4113–51.4247 N, 0.1888–0.1672 W —
  for drivable `highway=*` ways (motorway down to service and the links, not `area=yes`) with name, `lanes`,
  `width` and `oneway`; `waterway=river|stream|canal`; and `building=*` outlines. `&arg=s,w,n,e` builds another box.
- **Roads**: each way is sampled every 15 m (`RACE_STEP_M`) between its OSM nodes. A node two ways share is one
  point, so crossings are the road graph. A way leaving the box keeps its points up to 60 m past the edge and is cut
  there. Width is `width` if tagged (2–30 m), else `lanes × 3.3 m`, else a typical figure per class (`RACE_WIDTH`).
- **Heights**: every road point and a 40 m grid over the box (the ground between roads) are asked of OpenTopoData's
  `eudem25m` (EU-DEM v1.1, 25 m), then `srtm30m`, then Open-Elevation — 100 points per request with a 1.1 s pause
  (the public limit is one call a second, 1000 a day). The first dataset that answers for every point is used for the
  whole box, so two datasets never meet in one map. Each height is cached six hours per point and dataset, so a run
  that hits the 280 s budget says "run it again" and carries on from where it got to.
- **Spikes**: EU-DEM and SRTM are partly surface models (roofs, trees), so each height becomes the median of the
  samples within 25 m (`raceMedian_`). The slope of a street survives; a roof under one sample does not.
- **Buildings**: outlines simplified to 0.6 m, under 12 m² dropped, height from `height`, else `building:levels × 3 + 1`,
  else a typical figure (house 7.5 m, flats 12 m, sheds 3 m).
- **Stored** as one JSON file, `family-race-map.json`, in the script owner's Drive (the id in the script property
  `RACE_MAP`), so no new tab: TAB/SCHEMA/WHERE are untouched. Coordinates are local metres from the box's centre
  (x east, y north), every number ×10 as an integer. Shape: `{ v, place, built, box, origin, step, osm, dem, pts:
  [x,y,h,…], roads: [[name, class, width, lanes, oneway, [point…]]], water: [[name, width, [x,y,…]]], bld:
  [[height, [x,y,…]]], grid: { x0, y0, cell, nx, ny, h } }`.
- **Served** by `doGet`'s `?race=1` branch (`raceServe_`), through `jsonOut`, from the script cache (chunked like the
  payload, keyed by file id and build time) or Drive. Never in the boot payload. `{ built: false }` until built.

Attribution: "Map data © OpenStreetMap contributors (ODbL)" linked to openstreetmap.org/copyright, and the DEM's
name, are on the card under the game.

## The game (js/racer.js, the `racer` widget in map.js, kind `game`)

- An inline WebGL renderer (no library): one shader, vertices lit on the CPU, fog. Ground from the 40 m grid, roads as
  strips at the real widths standing at their own sampled heights with a kerb skirt, a centre line on classified or
  two-lane roads, the river, extruded buildings with ear-clipped roofs (an L-shaped house has a corner a fan would
  cross), a gold car and the next checkpoint gate.
- **The incline is physics, not scenery**: the car's acceleration includes −g × the grade under it (measured 1.5 m
  ahead and behind), so the same throttle is slower uphill, faster down, and a car let go on a slope rolls back.
  Off the road the rolling resistance is about thirteen times higher. Buildings are solid.
- **The loop**: `RACE_ROUTE` names High Street Colliers Wood, Christchurch Road, Merantun Way and Merton High Street;
  each name found in the map gives a waypoint (its point nearest the middle), visited in order round their centre by
  shortest paths that avoid road already driven (×5). Fewer than three names found: four points on the major roads.
  A gate every 110 m; passing them all and the start is a lap; the best lap is kept on the device (`race-best`).
- **Controls**: ↑/W, ↓/S (brake then reverse), ←/→/A/D, Space to brake, with a one-line legend on a pointer device; on a
  touch screen four pedals in one fixed 64 px row (◀ ▶ · Brake Go), pointer-captured. Keys are taken only while
  driving, so the arrows steer instead of turning the column; paused, they are the app's again.
- **Pausing**: the frame loop stops when the widget's `stop` runs (the column left), when its page is not the one in
  front (`dropOnFront_`), and when the tab is hidden. The lap clock stands still while paused.
- **Waiting**: `loading_()` while `?race=1` is asked; not built yet, the card is its title alone, and an admin sees a
  Build the map tile. Tiles under the stage: Drive / Pause, Back to the start, and an admin's Build the map again.

## Checks

- `js/check-race.js` (in check-all): the real backend over a fake Overpass, DEM and Drive — crossings shared, points
  ≤ 15 m apart, the cut at the box, widths, the spike median, the DEM fallbacks, the height cache, `?race=1` before and
  after a build and from the cache, the payload without `race`, `raceBuild` refused for a student, and the committed
  fixture having the built shape.
- `check/race-fixture.json` is an INVENTED town written by `tools/race_fixture.js` (streets borrowing the route's
  names, a 9 m hill on Christchurch Road, a river, blocks) — not OSM data.
- check-flow: "racer (426)" — title-only and the admin's tile; the map from the fixture, road vertices at the map's
  heights (and flat when the heights are flat), ↑/←/Space moving the car without turning the column, the hill felt,
  leaving pauses it.

Stamps: `2026-10-24-j-race-map` (all four); css `2026-10-24-j-racer`.

## After deploying

Sync the backend and deploy a new version, open the site once as an admin, then build the map: the Build the map tile
on the racer's card, or `/exec?run=buildRaceMap&name=…&pin=…`. It takes one to three minutes; if it answers "run it
again", run it again.
