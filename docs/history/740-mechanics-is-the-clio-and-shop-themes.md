# 740 — Mechanics is the owner's Clio, minimal cards, no pictures; shop items get a Theme

## Mechanics: one car

The owner: "all I want is to database 2 cars for now; one is my Renault Clio; if the other is too complicated just do
mine for now, and database the car parts for the Renault Clio. Just do this for now. Make the car parts cards and car
cards minimal. Doesn't even need pictures anymore."

- **The BMW E30 went**: its ten car cards and the parts that fitted only it (HT leads, distributor, propshaft, power
  steering pump, door locks, window regulator, sills). The Clio's six information cards (generation, timing belt,
  oil, fluids, tyre sizes, bulbs) went too: a car card is now one engine of the Renault Clio III (2009–2012, phase 2,
  UK), four of them: 1.2 16V (D4F), 1.2 TCe 100 (D4FT), 1.5 dCi (K9K), 2.0 16V Renaultsport (F4R).
- **The parts were rewritten for the Clio** (`data/mechanics/parts.json`, 68 cards), adding the service and wear parts
  that were missing (front and rear wiper blades, a front/rear split for shocks, rear drums vs the Renaultsport's rear
  discs, sump plug, tyre repair kit) and dropping a few that are repairs rather than parts you buy for it (head gasket,
wheel alignment, heater matrix, ECU, dual-mass flywheel). All four engines use a timing belt, so the Timing chain card went. Each part
  says `engines` (car cards' engines) and a `fits` line; example numbers stay `EX-XXX-nnn`; prices are a typical UK
  range marked approximate.
- **Minimal cards**: a car is Car (brand · model · years) and Engine, with the Parts tile; a part is What it is, Part
  number (example), Typical price (approximate) and Fits. No `facts`, no `cars`, no pictures: `data/mechanics/pixels.json`,
  `tools/mech_pixels.py` and `.mech-pic` are gone.
- **Brand and Model are no longer facets** (`mMake`, `mModel`): with one car they split nothing. Engine is the
  question; a part answers every engine it fits, and the Parts tile sets Part › Engine for its car card's engine.
- `check-mechanics` now fails on a part whose engines are not a car card's, a car card that is not the Clio, a `cars`,
  `facts` or picture field, or a returning `pixels.json`. The Mechanics journey walks Car › four engines, Part ›
  1.5 dCi (no spark plugs), presses the tile, and counts the cards' rows.

## Shop themes

The owner: "themes are just tags for items in shops for like different themes, like history or whatever".

- The shop tab has a `theme` column (SCHEMA, and the item form's What it is group). `doGet` sends it as `theme`;
  `shopTags_` reads it to `shopTheme`, asked as **Theme** by the one facet rule (FACET_KEYS, facets.json, TAG_OF
  `kind`). An empty cell is no tag. The fixture tags four items (Maths, History); a journey checks the tag and the gap.
- The four version stamps were bumped together (`2026-11-03-theme-740`).
