# 464 — The Colliers Wood racer works without a built map, and the build can succeed

The owner, 26 Oct 2026: "the Colliers Wood car race still isn't working."

## What the owner saw (main and the branch alike — racer.js and the race backend were the same on both)

- **A visitor or student**: the Console, Colliers Wood racer chosen, and an empty box under the picker. 426 drew
  "the title alone" until a map was built.
- **The owner as admin**: the same box with one Build the map tile. Pressing it waited a minute or so and then said
  "The map was not built — No elevation service answered for the box." So no map was ever built, and nobody
  ever had a road to drive.

## Why the build could never finish

`raceDemBatch_` asked OpenTopoData 100 points per GET, each point `toFixed(6)` with `encodeURIComponent` over the
whole list (commas became `%2C`, pipes `%7C`): about 2 450 characters. **Apps Script's UrlFetch refuses a URL over
2 kB** ("Limit Exceeded: URLFetch URL Length") before it sends anything, so EU-DEM and SRTM both threw on their first
batch. The only dataset left was Open-Elevation, the public instance that is often down or answers 502. When it
failed too, `raceBuild_` returned an error and wrote nothing. check-race's fake UrlFetch had no URL limit, so it
passed.

The front end was fine once it had a map: Playwright chromium (SwiftShader WebGL) at 390×844 touch and 1280×800,
with the fixture served as `?race=1`: 61 fps, CDP touch on Go and the arrow keys both drove the car, and the
column did not turn.

## What changed

- **Backend** (content.gs): each dataset has a `per` (80 points per GET); points `toFixed(5)` (about 1 m); commas left
  as they are and only `|` encoded; the URL is checked against `RACE_URL_MAX` 2000 before the ask. **Open-Meteo's
  elevation API** (Copernicus GLO-90, free, no key, 10 000 calls a day) is now third, before Open-Elevation. **If
  every dataset refuses, the map is built flat** (`RACE_FLAT`, `flat: true` in the reply, and the card names it as
  the heights' source) rather than not at all. The 280 s budget, the "run it again" resume and the Overpass mirrors
  are unchanged.
- **Front end** (racer.js): `?race=1` not built (or not answering) → **`data/race-map.json`**, the shipped map, plays
  for everyone. Today that file is the practice streets, an invented town from `tools/race_fixture.js` (the same one
  as check/race-fixture.json, marked `practice`, no OSM line). The card says "Practice streets, invented — the
  Colliers Wood map has not been built yet." **An admin's first visit builds the real map by itself** (once a day per
  device, `race-autobuild`) while the practice streets play. When the build lands, the car is paused and the built
  map replaces the practice one. With no map from either place, the card shows the reason, never an empty box.
- **`tools/race_map.py`** does the backend's build on a machine that can reach Overpass and Open-Meteo, and writes a
  real Colliers Wood `data/race-map.json` (`shipped`, OSM attribution). `race_fixture.js` never overwrites a shipped
  map. The session that made this could not reach either service (the container's proxy refuses them, as in 426), so
  no real map is committed yet. The script was run offline (`--overpass f.json --flat`) on an invented answer.
- **WebGL**: a lost context (iPad Safari under memory pressure) is asked back with `preventDefault`, the drive
  pauses, and the world is uploaded again on `webglcontextrestored`. Before this, `raceGl_` ran `createShader` on a
  lost context. Pedals and the stage gain `-webkit-user-select: none; -webkit-touch-callout: none` so a held pedal
  on iOS is not a selection or a callout.

## Checks

- check-race: the fake UrlFetch now throws over 2 048 characters or on a bare `|`, exactly as Apps Script does. A
  mutation to 120 points per GET goes red. New cases: Open-Meteo as a fallback, Open-Elevation after it, every DEM
  refusing builds a flat map that `?race=1` serves, the longest URL ≤ 2000, `RACE_BOX` in Overpass's s,w,n,e order,
  and the QL's shape.
- check-flow, three journeys (464) in place of the title-only one. (1) No built map: visitor and admin both drive the
  practice streets, which say so; the admin builds by itself exactly once. (2) No map anywhere: the card says why.
  (3) The admin's build swaps the practice streets for the built map, paused, with the OSM line. Mutating
  `raceShipped_` away turns two of them red.

Stamps: all four `2026-10-26-k-racer-works`; css `2026-10-26-k-racer-works`.

## After deploying

Sync the backend and deploy a new version. Then open Games → Console → Colliers Wood racer as an admin: it builds by
itself, or press Build the map. To ship the real map in the repo, run `python3 tools/race_map.py` on a machine with
internet access and commit `data/race-map.json`.
