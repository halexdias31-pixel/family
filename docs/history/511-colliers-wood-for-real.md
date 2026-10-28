# 511 — Colliers Wood for real: one road surface, real buildings, real ground

Owner, on the racer after 500: "just look at the roads. they are so clashed and jitter and there's no accurate
buildings. I want ALL data to come from real life, and you just create patterns to massage it a bit if the data may
not be complete — like making roads connect properly."

## What was wrong

- **Roads were one quad strip per OSM way**, each drawn on its own with a kerb skirt. Where ways met, strips overlapped
  at the same depth (z-fighting: the "clash"), left notches on the outside of a bend, and the per-vertex "mitre" was
  not a mitre (the road narrowed at every bend). 1951 ways, many split at nothing, drawn as 1951 seams.
- **Every flat layer was drawn at one polygon offset**: a park over a residential area, a road over water, all at
  the same depth, so they flickered against each other as the camera moved.
- **Buildings were flat-topped boxes** from the footprint, 7.5 m whatever they were, one colour picked by index.
- **The camera eased by a fixed 18 % a frame**, and the car was drawn at whichever physics step the frame fell on:
  on a 50, 75 or 120 Hz screen the same position twice and then a jump — the "jitter".
- Heights were flat: Open-Meteo had refused (429) in 500.

## What was reached (28 Oct 2026, from this machine through the agent proxy)

- Overpass: `overpass-api.de` 406, `kumi.systems`, `private.coffee`, `osm.jp` no answer; `maps.mail.ru`'s mirror
  answered a tiny query but 504'd the box. **`api.openstreetmap.org/api/0.6/map` answered** (11 MB XML, every tag)
  — that is the source, as in 500. BBBike's extract service answered but builds by e-mail; not needed.
- DEM: Open-Meteo 429 (daily limit). **OpenTopoData's EU-DEM 25 m answered**: a 25 m grid, 61 × 61 points, 38 asks
  at one a second, medianed over 75 m (EU-DEM is a surface model: roofs and trees are not the road). The Wandle valley
  shows: 10.6 m by the river to 22.6 m at the top of the box. The AWS terrain tiles answered too (fallback in reserve).

## The build now (tools/race_map.py, needs shapely 2.1+)

- **The road graph**: OSM's ways welded at shared nodes; exact duplicates dropped; a way chained to the next where one
  road simply continues (same name, class, width, lanes, oneway, and no third way at the node) — 151 chains. A light
  Catmull-Rom spline only on a bend where nodes are over 20 m apart (140 places); junction nodes never move.
- **ONE road surface**: every way's ribbon (flat caps, mitred joins at its OSM width, else `lanes` × 3.2 m, else
  its class's width), a round joint at every junction and dead end, unioned into one polygon, closed by 2 m so a
  junction's corners are kerb-rounded and no T-junction sliver survives, snapped to the 10 cm grid and triangulated
  once (constrained Delaunay). Nothing overlaps, so nothing can fight.
- **Pavements** where OSM tags `sidewalk` (121 ways) or draws `footway=sidewalk`; untagged London streets get one both
  sides, service roads none (632 ways, inferred — marked `sidewalk_inferred` in `stats`). A kerb band at the road edge.
- **Markings from `lanes`**: a dashed centre line on a two-way road with lanes (trunk/primary/secondary inferred 2),
  lane lines on a multi-lane one-way, stopped short of every junction; a zebra on each crossing OSM marks (43), stop
  lines at signals (74).
- **Water** (the Wandle and its ponds), **railway** (ballast and rails, tunnels left out), **land use** — each one
  union, painted in order: res, ind, retail, car parks, parks, woods, pitches, water, rail, pavement, kerb, road, marks.
- **Buildings**: every OSM footprint in the box (4539, 544 557 m²), building:parts over their outline (10). Height:
  `height`, else `building:levels` (+ `roof:levels`), else a typical London value by type — a house 2 storeys of 2.9 m
  + 0.5 m plinth (eaves 6.3 m, ridge about 9 m), flats 4 × 3 m, retail and sheds 2 storeys, a shed or garage 1.
  Roof: `roof:shape`, else for a house under 260 m² gabled if it shares a wall (a terrace) and hipped if it stands
  alone, flat for the rest; the ridge runs along the nearest street (a terrace faces its road), else along the long
  side; slate at 37°. The roof is cut into its planes in the builder, so every triangle lies on one plane and each
  wall's top follows the roof. Colour: `building:colour` / `building:material`, `roof:colour` / `roof:material`, else
  London stock or red brick chosen by street (a street keeps one brick) and slate.
- Real vs inferred is in each building row (`real` bits: 1 height, 2 roof, 4 walls, 8 roof colour) and `stats`:
  heights real 54 / inferred 4485; roofs real 16 / inferred 4523; widths real 105 / by class 648.

## The renderer (js/racer.js)

- The ground writes depth; every flat layer is painted over it in order with depth writes off and one polygon offset —
  the painter's order decides, never the depth buffer, so no two layers can z-fight.
- The world is in 200 m tiles per layer; a tile wholly past the fog is not drawn. One buffer, one shader.
- Physics stays a fixed 1/60 s step; the car is drawn interpolated between the last two steps; the camera eases at the
  same rate at any frame rate; the world is drawn relative to the whole metres under the camera.
- A map without `surf` (the backend's `raceBuild_`) still draws as strips, as before.

## Checks

`check/race-geometry.js` (in check-all): the road layer is one surface (one winding, no edge twice, no hole under
1 m²), a point every metre covered at most once (10 cm edge tolerance), road and pavement never on one spot, every
road's centre line on the surface with no 2 m gap, every junction and 1 m along each road meeting there covered,
buildings as many and as large as OSM's, each roof covering its footprint, and racer.js building its tiles.
Its first run caught 186 m² of overlap and 22 degenerate triangles from rounding after triangulating — fixed by
snapping to the 10 cm grid before.
