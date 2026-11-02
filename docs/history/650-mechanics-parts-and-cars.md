# 650 — Mechanics is two databases: every part, and the cars

The owner asked "why parts and parts lists, what's the difference", then "only keep parts and car. car is car" and
"should be mechanics -> car -> brand -> model etc.".

- The **Parts list** kind is gone (27 cards, `data/mechanics/fits.json`, deleted). Each list said which parts a car
  uses for one system, sometimes for one engine; that is now on the part: `cars` (`Clio`, `E30`, each a car card's
  `car`) and a `fits` line, e.g. "Renault Clio (1.2 16V (D4F), 1.5 dCi (K9K) only); BMW E30 (all engines)".
- The **Model** kind is called **Car**. The Card type menu is Part and Car.
- **Brand** (`mMake`) and **Model** (`mModel`) are ordinary facets asked by the one rule (396). A car card answers its
  own; a part answers the brands and models of every car it fits, so Part › Brand Renault › Model Clio narrows to the
  Clio's parts. Engine follows, where the cars split.
- A car card has a **Parts** tile (`mech-parts`, js/mechanics.js) that sets Find to Library › Mechanics › Part with its
  brand and model chosen, through `finderSet_`.
- Three parts named by no list (Timing chain, DPF, Dual-mass flywheel) carry no car: neither list said they fit.
  The four Tyres & wheels parts, named by no list either, fit both.
- Pictures, example part numbers and typical prices are unchanged. `check-mechanics` fails if `fits.json` returns or a
  part names a car no car card is; the Mechanics journey walks both paths and presses the tile.
