# 860 — Two tiers: Find is core, everything else is secondary

The owner, 4 Nov: "all I really care about is the finder working". Everything else is secondary: no effort goes into
making it stable, but it must never be able to break Find.

## The tier list is data

`data/settings/tiers.json` marks every screen (`columns.json`), every widget (`WIDGETS`, map.js), every card kind,
every js file (`window.FILES`) and every check in `js/check-all.js` as `core` or `secondary`, plus the pattern that
splits check-flow's journeys. `js/check-tiers.js` (core, fast) fails when anything in the code has no tier, when the
file names something the code no longer has, or when a rule below is broken.

**Core** is Find (`stuff`, and `res`, which shares its engine), the library and the question pages (marking, keypad,
pen, Mark with AI), sign-in and accounts enough to reach Find (`account`), the boot path, and the payload and backend
they need. Core card kinds: question, content, insert, practical, project, level. A kind nobody named is secondary.
**Secondary** is everything else, including every widget the cut list marks REMOVE or HIDE IN EXTRAS: the Feed,
Spotlight, Reels, DMs, Saved, Book, Shop, the profiles and the other settings columns, all 28 widgets, the religious
and public-domain texts, the sims.

Checks that guard privacy or safety stay core whatever they guard (surnames, visibility, secrets, media-age,
film-shares): a secondary feature may break, it may not leak.

## Isolation

- `tierGuardWidgets_(WIDGETS)` (shell.js), called straight after the array in map.js, wraps each secondary widget's
  `start`, `draw`, `stop` and its `html` getter once, so every caller in every file passes through it. A throw goes to
  `oops_` (one clientError report, the "did not load" card in its slot) and is never rethrown; `draw` gives `false`,
  so the ahead-drawing path treats it as undrawn.
- `tierRun_` also guards every `setTimeout`, `setInterval` and `requestAnimationFrame` asked for while the guarded call
  runs, and the ones those ask for in turn. (Timers set later from an event handler are already the window's, 561.)
- `stuffCard` (find.js) runs a secondary kind's card through `tierRun_`: a bad Bible card is a card that says so, never
  a Find column that did not draw. Core kinds are called bare, so a core fault stays loud.
- Screens were already guarded by `drawOne` (one screen that will not draw does not take the others).
- Secondary code loads in history 670's `LATER` set. `ink.js` (the whiteboard's stroke reader, used only by board.js)
  moved into it. Four secondary files stay eager, each with its reason in `eagerSecondary`, a ratchet that may only
  shrink: posts and overworld (the Feed is `TAB_HOME`, drawn at first paint), arcade (the widget runner Find's Tools
  cards use) and missing (an admin card on Find's front pages, counted by the eager pager).
- `check/isolation.js` (core, browser) serves map.js with a widget that throws from its markup, draw, start, stop, an
  interval, a frame and a timer set from its markup, and proves Find still boots, narrows ("fraction" matches fewer
  things than nothing typed) and opens a question with its answer box, every throw reported and none escaping.

## Checks by tier

- `npm run check` / `node js/check-all.js [--fast]` run the core checks only, blocking. `--all` adds the secondary ones;
  `--tier=secondary` runs only them. A secondary check that fails prints `WARN` with its findings and the suite stays
  green; the last line says which tier ran.
- `check-flow.js` runs core journeys by default; `FLOW_TIER=all` or `FLOW_TIER=secondary` adds the rest, which WARN.
  `FLOW_ONLY` and `FLOW_RE` still pick journeys by name whatever their tier.
- CI (780): the `check` jobs are core and blocking. A separate `secondary (report-only)` job (checks, and journeys in
  two parts) runs with `continue-on-error`, and its summary counts the WARN lines. No check was deleted.

## Stability

`tools/stability.js` scores core files only (v2): `score` is core's, and `secondary` carries the secondary files'
score and signals beside it. The empty-catch ceiling and check-dead are whole-repo figures and count as core. The
Stability card adds one line with the secondary score.

## A third value: off

The owner, the same day: deactivate every widget the cut list marks REMOVE or HIDE IN EXTRAS. `off` in tiers.json:

- 23 widgets are off: console, boardgames, wordgames, reels, videos, newspaper, flyers, mat, timer, docket, notepad,
  spotify, speedread, timetable, typing, termdates, countdowns, favlinks, rewrite, poster, pixel, verse, whiteboard.
  On: calculator, cart (the Basket), shopfind, calendar, libcards. Find, the library, question pages, booking and
  tutors, accounts, payments, the Basket and Suggest stay on.
- An off widget (`tierOff_`, shell.js) runs nothing of its own: its card is its name, `brand('widgetOff', 'Coming
  soon')` and the Suggest tile.
- A file is off when every widget `widgetFiles` maps to it is off: board, ink, flyer, poster, pixel, spotify, rewrite,
  favlinks. It stays in the repo and in `window.FILES` (so check.js still sees its names) and goes into `window.OFF`,
  which neither the eager load nor `laterFiles_` fetches; it leaves LATER. `tiers.json` keeps the whole LATER order in
  `later`. Games, mat and racer stay loaded: their files serve widgets that are on, or Find reads their names.
- Their checks (check/whiteboard, check-rewrite, check-favlinks, check/videos, check-eink, check-race,
  check/race-geometry, check-console-saves) are skipped by check-all and counted on its last line.
- Turning one on: its line in tiers.json, then `node tools/tiers.js`, which writes shell.js's TIER_* lists and
  index.html's LATER and OFF; check-tiers fails while they differ.
- Bytes no longer fetched: 177 KB raw, 66 KB gzipped (3.11 MB → 2.93 MB raw, 1.087 → 1.021 MB gzipped).

Not done: the Apprentice screens and the placeholder settings cards are screens and cards, not widgets, so they are
secondary rather than off; switching a column off is `columns.json`'s `active`, a separate change.
