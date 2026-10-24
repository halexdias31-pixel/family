# 435 — the Progress column, built (24 Oct 2026)

Progress (between Saved and Tools since 392) was a "Not built yet" placeholder for most visitors and, for a
student or an admin, a "Your journey" card whose only live line was an exam countdown; the rest of it
(goals, milestones, worked through) promised things nothing drew. The first ask: build it from what the site
already has, per signed-in learner. Then the owner, while it was being built:

> "jounreny should have widgets for how many days until e.g. their big exam like gcse, or sats, or until a
> holiday. ect. should also let them see their progress in any particular field, like first class maths grade
> worksheets, which past papers they may have done. an estimate for their current grade in specific subject."

with the house rules restated: one widget per thing, one line per thing (a list is label/value rows, never
boxes in a grid), and no pop-up menus anywhere — expand in place.

## The column (`progressCards_`, arcade.js)

Every widget is always drawn, in this order, so each is where it was last time; one with nothing to say is
`emptyCard_(title)`, its title alone (414). Signed out, every one is its title alone.

1. **Countdowns** (`card journey prog-count`) — one line each: the two exam dates typed on About you (a student
   or an admin, as before), the big exam, and the next school holiday. "GCSE exams — 199 days".
2. **Questions** — Answered, Right, Marks (got of possible, %), each one line; then each topic, most-answered
   first (twelve, then "and N more"), "r of m right" over a gold bar.
3. **Recent activity** — Streak, Last 7 days ("6 on 3 days"), the last three questions with their verdict.
4. **Work on next** — up to three topics with marks missed, lowest share first, each with one Practise tile.
5. **Grade estimate** — per subject and level, with how many papers it rests on, and a line saying it is an
   estimate.
6. **One card per series** the learner has touched ("Maths past papers", "1st Class Maths worksheets"), one line
   per paper or worksheet — "Paper 1H — June 2024 · 2/5 marks · 1 left" — that opens in place (a `<details>`)
   to one line per question (right, wrong, 1/3, not done), and a "Not started" count for the series. With no
   series, one "Papers and worksheets" title alone.
7. **Sessions** — Coming up / Done rows and one Sessions tile to Book.

While the payload or the library is still coming a `loading_()` follows, the rule `savedCards_` keeps.
The first draft's three boxes of totals and seven-bar week strip were taken out for the one-line rule.

## What it reads (no new payload key)

- **The presses**: `DATA.submissions.mine` (this person's latest per question, since 308) and the device's
  `subLast:<who>` (`subAll_`), the later `at` winning per key — `subAdopt_`'s rule. An empty answer is nobody's
  latest (10 Oct), so it is not counted.
- **The verdict as marks** (`progressScore_`): `right` 1/1, `wrong` 0/1, `ai:n/m` and `rule:n/m` n of m; `sent` is
  attempted, never right or wrong. A question is right only with every mark.
- **The library card** for topic (`x.topic`, else `topics`, else the subject), paper (`row.paper_id`), series
  (`progressSeries_`: past and specimen papers by subject; worksheets by maker and subject; 5-a-day) and level.
  A key the library no longer holds counts in the totals only.
- **Sessions** from `myJobs_` through `jobOn_`, four weeks either side: the next three, the last three. The phone
  has no attendance record, so a past session says Done, not attended.

## Countdowns: where the dates come from

- **The big exam** off the school year when the profile has a date of birth (England: Year N is N + 4 on
  1 September): Years 3–5 the 11+ at the start of Year 6; Year 6 the 11+ until it has been sat, then SATs;
  Years 7–11 GCSEs in the summer of Year 11; Years 12–13 A-levels in Year 13. No birthday: the level of a session
  booked (A-level, GCSE, 11+, SATs/KS2).
- **Season starts** `PROG_EXAMS`: SATs, GCSE, A-level 11 May, 11+ 12 September — the usual second week of May and
  mid-September — each overridden by the config tab's `exam_sats_start`, `exam_gcse_start`, `exam_alevel_start`,
  `exam_11plus_start` (MM-DD every year, or a YYYY-MM-DD for one). Rows added to `CONFIG_DEFAULTS` blank, so the
  sheet shows them after the next deploy; until then the phone's defaults stand.
- **The next holiday**: a holiday row of the `intervals` tab ahead, else the day after a term ends, else config
  `holiday_starts` ("MM-DD Name, …"), else `PROG_HOLIDAYS` (the usual London half-terms and holidays).

## Grade estimate

The library holds no grade boundaries, so it is a share of marks read through fixed steps, said as an
estimate on the card: GCSE 80% 9, 70 8, 60 7, 50 6, 40 5, 30 4, 20 3, 12 2, 5 1, else U; A-level 80 A*, 70 A,
60 B, 50 C, 40 D, 30 E, else U; SATs 75 greater depth, 55 expected standard, else working towards. Graded
worksheets (band type `grade`, e.g. 1st Class Maths) give "working at grade N": the highest grade sheet with
seven in ten of its marks got. Each line says how many papers it rests on.

## Practise: why not always the Topic chip

Questions do not answer the Topic facet — the owner took that away (`topicShown_`, find.js). So `prog-practise`
sets Find's Topic chip and, if that finds nothing, opens the question last got wrong in that topic with
`finderOpen_`. Never the whole library from the top. `topicShown_` not changed.

## Freshness

`subRecord_` marks Progress stale after a press made elsewhere; an open paper stays open through a redraw
(`PROG_OPEN`, filled by the `toggle` event); `progressRedraw_` still answers a saved exam date.

## Checks

- check-flow: the Saved/Tools journey asks every visitor with nothing for the seven titles alone (a signed-in
  one's Countdowns holds the next holiday); "your journey" became "your exams" (the Big exam line); new journeys
  **progress, empty**, **populated** (account beats device, totals, topics, streak, Work on next, Practise in Find,
  sessions), **papers** (series cards, paper line, opened in place with no sheet, kept open through a redraw, not
  started), **grade estimate** and **countdowns** (a Year 11's GCSEs, the config date, the sheet's holiday row,
  the defaults, signed out).
- check/states.js: every widget drawn, each empty one its title alone; "your exams" asserts the Big exam line.
- css 2026-10-24-i-progress.
