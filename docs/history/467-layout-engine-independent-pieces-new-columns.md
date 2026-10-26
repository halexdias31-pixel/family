# 467 — The layout engine, again: independent pieces, new columns, every card deletable, one Start here

## What the owner said (26 Oct)

- *"Split pieces are still linked in some way — I can only split or recombine, so it's useless."*
- *"Moving right, right, right should eventually go into a new column."*
- *"Some things can't be deleted (e.g. per-series progress like past papers, Religious Studies)."*
- *"Start here uses a flag icon — I had no idea what it was; some cards have two flags."*
- *"Make cards take up less space, separate or together."*

## What changed

- **A piece is a card.** A split card's pieces carry `data-lay-card="<card>#<field>"` (`pieceId_`, layout.js; me.js
  settings groups, records.js Business records and Profit terms), so `cardIdOf_` names each piece alone: its own
  ▲ ▼ ◀ ▶, Delete and Start here, drawn by its own column's builder (one home, its role gate). `#` is now allowed in
  layout ids (site and `layoutClean_`). **Join gathers them back** (chosen over hiding Join once pieces scatter): it is on
  every piece, and it removes every `<card>#…` from `cards`, `deleted` and `start`, so the whole card returns to its card's place.
- **New columns.** ▶ on a card in the last right-hand column before Business reads "Move to a new column" and makes
  `custom-N` ("New column") just before Business: `custom: [{id, title}]` and `cards['custom-N']` in the layout value.
  `customTabsSync_` puts them into `COLUMNS` each time `columnsFor_` runs; shell.js makes and removes their sections.
  Everybody gets the column; each card keeps its own gate. An admin sees a first line with the name, Rename and
  Delete column (asks twice; its cards go home). A column left empty by a move or delete is removed at the save
  (`customPrune_`). ◀ from the first right-hand column stays disabled; Business cards still never leave via ▶.
- **Every card deletes.** Each progress series card is `prog:series:<name>`; the Sessions card was already `acct:prog-sessions`.
- **One Start here, a house.** Icon `home` (tiles.js); a person's page carries only the person's Start here, and the
  list's admin row under it drops its own; the "the first person" tile is gone (a stored `first-person` still works).
- **Compactness** is left to the parallel tile-row restyle (fix-tiles-consistent), at the coordinator's word.
- Stamps and `--css-version` `2026-10-26-q-layout-engine`.

## Checks

check-flow "layout engine (466)" ×3: pieces moved/deleted/started alone, a reload and Join; a new column made,
renamed, seen by a client, emptied and removed, Delete column, garbled `custom`; series and Sessions deleted,
≤1 Start here per page with no flag, an admin's delete gone for a client on reload. The 465 journeys updated for ▶ and first-person.
