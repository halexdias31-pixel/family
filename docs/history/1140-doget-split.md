# 1140 — doGet split into named sections

`doGet` in `backend/doget.gs` was one function of 1206 lines (file 1436): the preamble, three routes that
answer without a payload, then the payload built section by section. It is now ~175 lines; the file is 406.
The same method as 1130 (doPost).

## Shape

- `doGet` keeps everything that decides who is asking and whether a payload is built, in the same order:
  `WRITE_MISSES`, `NET_VIEWER_`, `JSONP_CB`, the timings, `askedBy_`, the schema catch-up, `?setup`,
  `?race`, `?triggers`, the cache key and hit, `REQUIRED_TABS`, the viewer, `config()`, the three tab reads,
  every `mark()`, `?debugTiming`, and the cache-and-send at the end.
- Each route is `if (cond) return getX_(…);` with the old block's body moved verbatim: `getRun_` (`?run=`),
  `getReceipts_` (`?receipts=`), `getMissingTabs_` (a required tab missing). Every path in those blocks
  already returned, so `return` of the call is the same answer.
- Each payload section is one call, `getX_(…, payload)`, in the old order: `getPayloadInit_` (the literal,
  still `const payload = {` so check-payload walks it, then `return payload;`), `getPeople_`,
  `getFamilyVenues_`, `getPosts_`, `getCalendar_`, `getViewerBits_`, `getTerms_`, `getShop_`,
  `getQuestions_`, `getJobs_`. The parameters are exactly the doGet locals the section read, by the same
  names, so every name inside means what it meant. No section reassigned one, and no local declared in a
  section (`yNow`, `computed`, `shopTab`…) is read outside it.
- Topic files: `get-start.gs` (the three routes and the literal), `get-people.gs`, `get-posts.gs` (posts,
  calendar, the viewer's own bits), `get-shop.gs` (terms, shop, questions, jobs). The helpers below doGet
  (`familyOf_`, `freshFor_`, the films and submissions caches) stay in doget.gs. The § notes for the moved
  comments stay in `docs/notes/backend/doget.gs.md`.

## Proof of no behaviour change

- An acorn token comparison (types and values) of every moved body against its original lines: 13 of 13
  identical, `getPayloadInit_` plus its one added `return payload;`. doGet's remainder is the original with
  each range replaced by its call, made by script, not by hand.
- Every `js/check-*.js` (but check-flow and check-all), `check/live.js` and `tools/backend-health.js` ran
  before and after: check-dead, check-doors, check-inbox, check-uploads and live failed both times with
  identical output (none about doGet). check-posts failed once before ("a declined post is still sent") and
  passed after; it passes 3 of 3 on the untouched tree too, so it is flaky, not this change. check-stability
  went stale (new files; re-run). Every other one passed both times.
- `node js/check-payload.js` passes: every key the site reads is still sent.
- No version stamp bumped: nothing deployed changes what it answers.

## Checks taught the files

`tools/get-src.js` gives doget.gs plus `get-*.gs` (`getFiles`, `getSrc`). check-payload, check-booking (the
term block now in get-shop.gs), check-library, check-history-db, check-hymns, check-talmud and check-columns
read through it; check-backend scans every doGet file and skips `getRun_` as it skipped the `?run=` block.
check-gas-load, check/live.js, check-dead and `backend/files.json` list the new files.
