# 550 — Chemistry: elements, substances and reactions in the Library

**Asked** by the owner (note N-1793377528740-58210): a Chemistry data section in the Library, groundwork for a future lab simulator.

- `data/chemistry/` holds three files: `elements.json` (all 118: name, symbol, atomic number, relative atomic mass, group,
  period, block, category, state at 20 °C, ground-state electron configuration, year discovered), `substances.json` (215
  common GCSE/A-level substances: other names, formula, type, state, a use and a hazard note in our own words) and
  `reactions.json` (84 cards: a general pattern, type, conditions, observations, and worked examples whose `substances`
  are card names spelled exactly).
- The element rows were generated from tables (Aufbau order with the known exceptions such as Cr, Cu, Pd, Au, La, Th, Lr);
  superheavy configurations say "(predicted)" and states from fermium on are "Unknown". Lanthanides and actinides other
  than Lu and Lr carry no group.
- `js/chemistry.js` fetches the three when a finder paints, as mechanics does (548), one item a row, kind `chem` (What kind:
  Library), subject `Chemistry`. Card type is the shared `mKind` (Element, Substance, Reaction) so the Library asks one
  card-type question, not two; facets `cCategory` (Chemical type), `cGroup`, `cPeriod` and `cState` read the row's fields.
- `check-chemistry.js` (in check-all): 118 elements numbered 1–118 once each, unique names and symbols, every card sourced,
  substance and reaction fields present, every substance a reaction names is an element or substance card. Proved by
  mutation (a duplicated atomic number, a misspelt substance in an equation, an empty source). A flow journey walks
  Library → Chemistry → Element → Halogen → Group 17.
