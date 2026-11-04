# 840 — The first red CI runs, read and fixed

CI (780) ran on pushes to claude/focused-wright-blx2g6. Runs read: 41797298937 (5f445dd, PR, every job finished),
41795294747 (5f445dd, push), 41801135629 (411e60c, push, cancelled part way), 41801320922 (411e60c, PR, in progress
when read). The runs for 8c11685, c746984 and 2bfe5ed were cancelled or still queued. No live.yml run on this branch:
it runs on main only. 17 jobs, 12 red. Every red one is listed here with its cause.

## Checks still driving the Tools and Games columns that 790 removed

790 made the tools and games Find cards and took the `tools` and `games` columns out of TABS, but the browser checks
still did `go('tools')` and read `#s-tools`. Each one found nothing and failed on REACH ("no calculator on Tools",
"no whiteboard notebook on the Tools column", `waitForFunction` timing out on `#s-tools .page`). Ported, not skipped:

- `check/find-card.js` (new): `openWidgetCard(id)` sets Find's first answer to Tools or Games, goes to Find and turns
  to that widget's page (`stuffFirstResult_() + ` its index in `stuffPages_()`), the same steps check-flow's
  `findGroup` takes. `installOpen(ctx)` puts it in the page as `window.__openWidgetCard`.
- calc-steady, whiteboard, pen, press (whiteboard, the console game, the second-flick chain that ran on Games and is
  now on Find showing Games), jank/interrupt and jank/reduce: the widget's card on Find.
- slide and swipe: Find set to Tools and Find 2 set to Games stand in for the two columns, side by side as before.
- reach: "tools after a landing" arrives at Find showing Tools; the idle jump visits stuff and res, not games and tools.

## Checks that need the private words but did not say so

With `LIB_PRIVATE=absent` a question's card or a chapter with words in the Ledger is one waiting page, so these
failed instead of skipping: `check/ruler.js` and `check/boxes.js` call `needWords()`; `check/sounds.js` skips the
real tap on Q0664; `check/pen.js` skips every question card (Q7, the grids, the phones' stem and own figure) and still
checks the whiteboard; `check/anims.js` skips the animations whose chapter has `lib_has` or `lib_pending` (it still
checks the first visit). Each is counted in the job summary, not passed.

## Stale data

`data/logic-health.json` was measured before 790 added the tools and games to the funnel; re-run
(`node tools/logic-health.js`), 80.6% of 186 questions healthy.

## Out of memory

`flow 6/8` (and check-uploads in `fast`) died at the heap limit on 5f445dd and 411e60c. Those commits carried 805's
Find indexes, which 8c11685 reverted because an iPhone ran out of memory on Practice. At head, `FLOW_PART=6/8` with
the same 3000 MB passes locally (60 journeys, 9 skipped).

## Timeouts and the runner

`ui.js` ×3, `press.js`, `press-twice.js` and `tiles.js` hit check-all's 900 s limit, three at a time on a 4-core
runner. They are marked `heavy` in check-all: `--heavy=k/n` deals them one a job (six new jobs) and `--slow` leaves
them out. `CHECK_LIMIT_S` (default 900) sets the per-check limit, and CI sets it to 1800. Job limit 45 minutes.

The artifact step failed on every red job with `EACCES: scandir '/tmp/snap-private-tmp'` because of the `/tmp/**/*.png`
glob. The Run step now sets `TMPDIR` to `$RUNNER_TEMP/tmp`, and that is what gets uploaded.

## Fixed at head before this note

`check/later.js`'s `finderPageCount_ is not defined` was 411e60c's hotfix.

## Also fixed while porting

- videos.js: in full screen the Exit tile was 36px where 321 says 44. `.vid-watch.is-fs .vid-acts .tile` is now
  `--tile-send` (44px).
- slide.js's rubber band on the last column (biz, an admin's form) found no bare spot on page 0. It now tries every
  page of that column.
- calc-steady takes its base once two reads agree, because a Find card is still settling after its page turn (an
  0.1–0.2px drift). whiteboard's `fresh()` waits for Find to be at rest and for the board's `NB`.

## Still red, already red before 790 and before CI existed (run 41780912080, aac77ca)

centred, share, share-profile, arrival, touch, deploy, cascade and reach failed on aac77ca too, with the same
findings: centred's top at 183px instead of 300 after clearing; share-profile's picture 11px right of the site
card; share's 320 zoom case; arrival's spotlight popping in; deploy's second build not reaching the browser. They
are real findings, not CI's, and each needs its own fix. reach now shows the loader 2 times on Find's tools, down
from 29 on the old column. swipe at head (locally, absent mode): the ported gestures land. What is left: "pressing
an answer moved the search box ~20px" (kp-centred says the same), "0 of 20 widgets started on arriving at Find's
tools" (Find starts only the cards near the glass, so that rule has to be restated for Find), the held drag, and
flappy's "beside". Not run locally in time: pen, check-uploads alone, ui ×3, press, press-twice, tiles.
