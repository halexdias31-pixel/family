# 730 — The owner's eleven columns, and whole columns move

Follows 710's "Still open" list. The owner's column set: Web profile, Tutor profile, Student profile, Parent profile,
Apprentice profile, Tutor settings, Web settings, Kids settings, Parent settings, Apprentice settings, Biz settings.

## The columns are data now

- `CARD_COLS` (shell.js) is `TAB_ORDER` filtered by each tab's `cards: true`; `data/settings/columns.json` carries the
  same mark in a `cards` field, and check-doors fails when the two part. layout.js no longer types the list;
  `ADMIN_COLS_` is the card columns marked `admin`.
- The backend cannot read the repo, so `tools/columns_gs.js` writes a generated block at the end of
  `backend/constants.gs` (`LAYOUT_SCREENS`, `LAYOUT_CARD_COLS`, `LAYOUT_WIDGET_COLS`) from columns.json and
  `LAYOUT_COL`. `layoutClean_` (core.gs) reads those; check-doors fails when the block is stale. Re-run the tool after
  changing columns.json. A block rather than a new .gs file, so `files.json` and the sync's built-in list stay as they are.
- `TAB_ORDER` and columns.json: `… games | web tutors students parents apprentices | staff site account family
  apprentice biz`. Screen ids are kept (`account` is Kids settings, `site` Web settings, `biz` Biz settings,
  `apprentice` Apprentice settings) so saved layouts, links and journeys still name the same places.
- New: `web` (Web profile, `webProfilePages_`, me.js) — the business card from `brand()`: name, logo, `web_tagline`,
  area, phone and site, every one with a fallback. `apprentices` (Apprentice profile, `apprenticeProfilePages_`) — a
  card per person in `everyone` whose role says Apprentice; none yet is `brand('apprentices_none', …)`. No new payload key.
- Web settings already held the site cards (Setup, posts waiting, suggestions, library import, the weekly email,
  Rules, Email, Build) since 491; Biz settings keeps money, people and applications. Both stay admin-only.
- Apprentice settings is a card column now (`appr:blurb`), so its card moves like the rest.

## Layout leftovers from 710

- **Whole columns move.** The first unit on a column carries Move this column ◀ ▶ (`colTiles_`, icons `col-left`/
  `col-right` so they are told from the unit's own ◀ ▶). `lay-col` swaps the column with its visible neighbour and saves
  `order: [ids]`; `colOrderApply_` (at the end of `customTabsSync_`, so every `columnsFor_`) lets the named columns take
  the places they already fill, in that order — a column added to the code later keeps its TAB_ORDER place. The
  backend keeps `order` to ids in `LAYOUT_SCREENS` or the admin's own columns.
- **A column between two.** The owner: "I want to be able to insert a column in between two columns." Every unit's
  row has Move to a new column here, on the left / on the right (`lay-newcol`, `layNewCol_`): an unnamed custom column
  holding that unit, placed beside its column by the same saved `order`; ◀ ▶ from the neighbours move into it, and it
  goes when emptied, like any custom column (710). An admin-only column's unit makes an admin-only one.
- **Spotlight** is a card column; the window is one unit, `spot:list`, moved by its first page's row.
- **Board games** was not reproducible as stuck on this build: on a2397ac its ▶ was disabled (Games was the last widget
  column, and 710's one set of host columns was not yet merged); after f2fd4d9 it moves ▲ ▼ ◀ ▶ in jsdom and in
  Chromium at 390 and 1440 px, and is drawn on the column it lands on.
- **Nothing unmovable without a reason.** `LAYOUT_FIXED` (layout.js) names each column that is neither a card nor a
  widget column, with its sentence: feed, dm, stuff (Find's funnel), res, saved, booking. check-doors fails on a column
  in none of the three.
- **Pager names.** `pageName_` (shell.js) names a page by its widget, else its card's title; a card column's pager is
  every page's name once a unit has been moved onto it, and a widget column names a card moved there.

## Not done

- **The feed's posts as one unit.** Still in `LAYOUT_FIXED`: the posts page by post with the camera above the newest
  (`feedCamAt_`), and moving them needs that paging to stop assuming the feed column.
- Columns with no units of their own (feed, DMs, Find, Find 2, Saved, Book) carry no column tile, so they move only
  by their neighbours moving past them.

## Also

- check-doors' comment stripper took `'image/*'` (working.js) for a comment and swallowed the rest of that file, hiding
  `on('qp-work-x')`; a comment now opens only after a space or punctuation. That surfaced `on('job')` with no door: it
  is gone, and the journey calls `openJob_` as push.js does.
- check-surfaces: the boot error's backend link is `href="' + esc(API)`, an https constant (data.js); it counts as
  external. Red after the f2fd4d9 merge, green on a2397ac — the near-`https` heuristic depended on its neighbours.

Journeys: `columns (730)`, `layout (730): a whole column moves`, `layout (730): Spotlight and Board games …`,
`layout (730): pager names for moved units`, `layout (730): a column between two`.

## Stability (Web settings)

The owner: a widget that scores the site's stability as a percentage, falling as complexity and duct tape rise.
`tools/stability.js` reads the repo only (no network, no clock) and writes `data/stability.json`; `check-stability.js`
(in check-all, `--fast` too) runs it with `--check`, so the file is stale the moment the code moves on: re-run the tool
and commit both. Score = 100 less, per signal, `min(cap, count × weight)`:

| Signal | Weight per unit | Cap |
|---|---|---|
| written exceptions in the checks (`ACCEPTED`, `*_OK`, `KNOWN*`, `ALLOW*` entries) | 0.10 | 20 |
| empty catches allowed (check-catches `CEILING`) | 0.02 | 15 |
| raised ratchets (`*_MAX` in the checks, summed) | 0.002 | 10 |
| per-facet / per-kind special cases (`facet === '…'`, `kind === '…'` in the app) | 0.05 | 10 |
| names check-dead says nothing calls | 0.30 | 10 |
| files over 3000 lines | 0.50 | 10 |
| top-level functions over 150 lines | 0.05 | 10 |
| TODO / FIXME / HACK / XXX | 0.20 | 5 |
| repeated long lines (60+ characters, 3+ times) | 0.02 | 10 |

A red check is not scored (check-all already fails it) and slowness is the machine's, not the code's. First score:
46.9%. The card (`site:stability`, `stabilityCard_`, me.js) fetches the file the first time Web settings is drawn for
an admin, shows the %, a verdict and the top three, and Show every signal lists the rest. Journey: `stability (730)`.
