# The history database

Four public, linked tables shown in Find under **Learning → Content → History**, then *Manuscripts,
figures, writings or events*. Everything in them is public: there is no private half and no Ledger tab, so a
row is edited in the file and goes live with `git push` (docs/history/459).

| File | Id | Find kind | One row is |
|---|---|---|---|
| `data/manuscripts.json` | `MS-0001` … | `manuscript` | a physical manuscript (a codex, a papyrus, a roll) |
| `data/figures.json` | `FIG-0001` … | `figure` | a historical person |
| `data/writings.json` | `WR-0001` … | `writing` | a text (a letter, a history, a poem), whatever copies of it survive |
| `data/timeline.json` | `EV-0001` … | `event` | an event (a battle, a treaty, a conference) on a timeline (461) |

**Timelines.** Every event names its timeline in `era` (`"World War 2"`). Find makes one more card per `era`, "World
War 2 timeline" (kind `timeline`, under *Events*): a line per event in date order (`date_iso`), each with a tile to its
card, and an **Animation** tile to the chapter whose drawing is titled with the era (`hww2`, "World War 2, 1939–45", GCSE
History chapter 6). The file is `timeline.json`, not `events.json`, because `events` is already the calendar's sheet tab.

## Adding a row

1. Copy the last line of the file, give it the next id (four digits, never reused), and fill every column.
   A column with nothing to say is `""`; never leave a column out, never add one the schema below does not name.
2. **Lists** go in one cell, separated by ` | ` (space, bar, space): `"Statesman | Prime Minister | Writer"`.
   Each entry of a list that Find asks about (language, material, format, genre, roles, themes, repository)
   becomes its own tag, so spell the same thing the same way on every row.
3. **Years** are whole numbers, negative for BC: `-44` is 44 BC. `date_from ≤ date_to` (or `born_year ≤ died_year`).
   An exact date is a range of one year. Say the human version in `date_text` / `born_text` / `died_text`
   ("c. 125–175", "15 March 44 BC") and how it is known in `date_basis` ("palaeography", "colophon",
   "radiocarbon"). The **Era** tag (Ancient to 500, Medieval to 1500, Early modern to 1800, Modern) is worked
   out from the years by `histEras_` in `js/find.js`; you do not type it.
4. **Links** are ids. A writing names its author in `author_id` and its manuscripts in `manuscripts`; a
   manuscript names its writings in `writings`; a figure names its writings in `writings`. **Write a link on
   both sides** — the check fails a link written on one side only. An event names its people in `figures` and its texts
   in `writings`; each of those names the event back in its `events`. An entry that is not a row yet is plain
   words (`"Codex Hierosolymitanus (1056)"`); when that row is added, replace the words with its id.
5. **Relations** on a figure are `type:who` pairs, `"father:Lord Randolph Churchill | ally:FIG-0002"`. An id
   becomes a tile to that person's card; words are just said.
6. **Sources** are `https://` URLs, at least one per row, separated by ` | `. Each becomes a Source tile.
7. Run `node js/check-history-db.js` (and `npm run check` before pushing).

## Columns

- **manuscripts**: id, name, catalog_ids, repository, city, shelfmark, date_from, date_to, date_text,
  date_basis, material, format, language, script, contents, size, provenance, condition, writings, sources, notes.
- **figures**: id, name, aliases, born_year, died_year, born_text, died_text, born_place, died_place, places,
  eras, roles, achievements, relations, writings, events, sources, notes.
- **writings**: id, title_original, title_english, author_id, author_text, date_from, date_to, date_text,
  date_basis, language, genre, context, themes, manuscripts, events, pd_translation, sources.
- **timeline**: id, name, date_from, date_to (whole years), date_iso, date_iso_to (`YYYY-MM-DD`, `date_iso_to` blank for
  one day), date_text, date_basis, places, theatre, era, summary (short, our own words), figures, writings, sources.
  Keep the file in date order; the check holds it to that, and each ISO day to its year.

## Adding a column

Add it to every row, to `SCHEMA` in `js/check-history-db.js`, to this list, and — if a card should show it —
a line in `HIST_LINES` (find.js). To make it a funnel question, one `FACETS` row reading it with
`histCol_(x, '<column>')`, a colour in `TAG_OF`, and a row in `data/settings/facets.json`; never a per-facet flag.

## Where the code is

- `js/library.js` — `HIST_DB` (file, prefix, kind, year columns) and the loader in `libraryExtras_`.
- `js/find.js` — `histItem_`, `histCard_`, `histLinks_` (links both ways), `histEras_`, the `hist*` facets.
- `js/find.js` also `histTimelines_`, `histTimelineCard_`, `histTimelineChapter_` (461).
- `backend/doget.gs` declares `manuscripts`, `figures`, `writings`, `timeline` as `[]` for `check-payload`.
- `js/check-history-db.js` — the data check; the flow journey "the history database: …" in `js/check-flow.js`.
