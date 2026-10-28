# 500 — Colliers Wood that looks like Colliers Wood, the Email card on Site, four old question reports

## The racer (N-1793146374081): "the car game looks nothing like Colliers Wood. make it actually look like Colliers Wood."

The shipped `data/race-map.json` was still the practice streets (invented). Overpass would have built it, but from
this machine `overpass-api.de` reset the connection through the agent proxy, `overpass.kumi.systems` and
`overpass.private.coffee` timed out, `maps.mail.ru`'s mirror gave 504, and `download.geofabrik.de` reset too.
`api.openstreetmap.org/api/0.6/map` answered (11 MB of XML for `RACE_BOX`), so `tools/race_map.py --osm-api` turns
that call into an Overpass-shaped answer and builds from it. Open-Meteo rate-limited (429) and then dropped TLS, so
the heights are flat — the Wandle valley is within a few metres of flat anyway; run the script again on a machine
that reaches it for real heights.

What the map has now (1951 roads, 4349 buildings, 361 areas, 10 landmarks), all real OSM geometry:
- roads at OSM width/lanes else by class (trunk A24 High Street Colliers Wood, Merantun Way, Christchurch Road…);
- `areas`: parks (Wandle Park, the Recreation Ground, Wandle Meadow), woods, ponds, pitches, car parks, retail
  (Tandem Centre, Priory Retail Park), industrial and residential land, drawn flat on the ground and on the mini-map;
- buildings coloured by kind (`bld[i][2]`): stock and red brick and render for houses with slate roofs, pale-brick
  flats, grey retail sheds, the station's Portland stone, the church's ragstone;
- `marks`: a post at each landmark — a red roundel and blue bar at Colliers Wood station, a sign elsewhere — and
  "Near …" on the HUD within 220 m.

A backend-built map (`raceBuild_`) has no areas or marks, so the front end now prefers the shipped Colliers Wood when
the built one lacks `areas`, and an admin's visit no longer auto-builds over it. ODbL: the card's line, and
`data/race-map-LICENSE.md`. World build 215 ms, 473 k vertices (the backend-built map was the same order).

## The Email widget (N-…7214091): "I would actually like to add the gmail widget to this, actually. sync with admin gmail."

493 brought back by reverting its revert; the widget moved from Tools to a card on the Site column (`inboxCard_`,
drawn by `sitePages_`, started by the Site screen). gmail.readonly, `authoriseGmail`, check-inbox (now on `#s-site`).
The card says the deploy order: sync → run authoriseGmail → Allow → READY → only then Deploy → New version.

## Four question reports

- **Q-1MA1-2406-2F-16a** "Can't read it / picture missing — zoom / ruler": the graph lived on the stem's own page, so
  16(a)'s card had none. Now a short question-scope stem with a figure (one page, no photos, no pen on it) is carried onto every
  part's card, words and figure (`stemOnCard_`), and the Ruler/Protractor tiles read that figure (`cardDiagram_`).
  The Magnifier was already on every page.
- **Q-1MA1-2211-2H-7c** "answer is wrong — feels off": the value was right (3 ± √5 = 0.76, 5.24), and the stem
  S-P-1MA1-2211-2H-q7 has the graph, but on its own page before 7(a) — 7(c) said "use the graph" with none on its card.
  The stem now rides on every part's card (above). Accept is now the scheme's bands (0.7–0.8 and 5.2–5.3, either order)
  as two `rule:` ways, the exact pair kept; the answer's words say so.
- **Q-1MA1-2211-2H-7b** "Doesn't work": the same missing graph, and "3, -5" without brackets was marked wrong.
  Accept is now `(3, −5) | 3, −5`.
- **Q-1MA1-2211-2H-5** "the proposition not on the question's widget": the part was cut into two pages ("Work out x"
  and its figure, then "3 s.f." with the box). A part whose blocks fit one page (`CHUNK_PAGE`) is now one card.

Private words changed for Q-1MA1-2211-2H-7b and -7c: an import file was made with `drive-pack` (not uploaded).

Stamps and css `2026-10-28-n4c-colliers`.
