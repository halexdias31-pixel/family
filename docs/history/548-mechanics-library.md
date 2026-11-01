# 548 — Mechanics: parts, two cars, jobs and symptoms in the Library

**Asked** by the owner, 1 Nov: a demo for a mechanic friend starting a business — a Mechanics subject in the Library.

- `data/mechanics/` holds five small files, all original words: `parts.json` (80 common parts by system: what it does,
  signs of wear, interval range, DIY difficulty, tools), `models.json` (Renault Clio III phase 2 as sold in the UK in 2012
  and the BMW E30 saloon of 1989–90: engines, timing, fluids, tyres, bulbs, known issues), `fits.json` (each car's parts by
  system, generic names only), `jobs.json` (step-by-step jobs per car with difficulty, time and tools) and `symptoms.json`
  (symptom → likely causes, each cause a part card's exact name).
- `js/mechanics.js` fetches the five when a finder paints (as pdtexts' index is), one item a row, kind `mech` (What kind: Library),
  whose `mKind` (Card type) is Part, Model, Parts list, Job or Symptom. Facets `mSystem mMake mModel mEngine mDifficulty` read the row's own
  fields; a row answers only what it has. Subject is `Mechanics`.
- A 2012 Clio is a Clio III: the Clio IV was shown at Paris in September 2012 and reached UK buyers around the turn of 2013.
- No maker part numbers and no number plates: `check-mechanics.js` refuses anything shaped like either, and every card
  needs a system from the fifteen and a source line. Proved by mutation (a part number, an empty source, a system as a list).
