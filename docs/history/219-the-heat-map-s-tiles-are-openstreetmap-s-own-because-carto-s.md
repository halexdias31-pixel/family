## The heat map's tiles are OpenStreetMap's own, because CARTO started asking for a key

**Reported as "the map is asking me for an api key. i just want simplest way for this all to
work."** CARTO's dark basemap draws "API key required" over its tiles for a site with no account.
`profHeat_` now uses `tile.openstreetmap.org`, which needs no key and no account, only the credit
printed on the map. Those tiles are light, so they sit on their own `.heat-tiles` layer that CSS
inverts and turns back round to dark; the glows are on a second layer (`.heat-glow`) above it so they
keep their orange. Nothing to configure. A venue still needs its `lat` and `lng` to appear.
