# 780 — The check suite on GitHub Actions, without the private words

## What was asked

Run the whole check suite on GitHub's free runners on every push and every PR to main, in parallel, with a ✅/❌ per
commit; a quick local mode for small fixes; a nightly smoke test of the live site; and a guard that the Stability score
(730) does not drop in a PR. No secrets, nothing that writes to the repo or the sheet.

## What runs where

- `.github/workflows/checks.yml` — 17 matrix jobs: `fast` (`node js/check.js` and `check-all.js --fast`), `flow 1/8`…`8/8`
  (`FLOW_PART=k/8 node --max-old-space-size=3000 js/check-flow.js`), `browser 1/8`…`8/8` (`check-all.js --slow=k/8`, a
  new flag: the 38 slow checks other than check-flow, dealt round-robin so the three `ui.js` thirds land in different
  jobs). Node 22, `npm ci`, npm cache, the Playwright Chromium that package-lock.json pins (1.63.0) cached by version.
  Logs and any PNGs upload as an artifact when a job fails. Expected wall time about 15 minutes, set by the slowest group.
- The `stability guard` job (PRs only) checks out the base beside the head and runs `check/stability-guard.js .base`:
  red if the score fell, before/after and every moved signal in the job summary. A base without tools/stability.js
  passes with a note.
- `.github/workflows/live.yml` — nightly, by hand, and 30 minutes after a push to main touching the site:
  `check/live-smoke.js` at 390 and 1440 px, signed out, every column in `TABS`; red on a console error, page error, failed
  or 4xx/5xx same-origin request ("WIDGETS is not defined" would have been one), and when the live `--css-version`
  is not main's. Two things it deliberately ignores: `net::ERR_ABORTED` (a request the page cancelled itself) and
  Chromium's URL-less "Failed to load resource" console line (a third-party 429 on the first run; same-origin ones are
  caught by URL anyway).

## The private library

data-private/ is git-ignored and must never be committed or printed. On a machine without it, check/lib-full.js used to
seed it from the pinned commit in history — which would have worked in CI and put the words a failure's log away from
being printed. So CI sets `LIB_PRIVATE=absent`:

- lib-full never seeds, and `text`/`rows`/`behind`/`waits` throw `LIB_ABSENT` for a library file.
- A check that needs the words whole calls `needWords()` at the top: one line "skipped 1 library check (…): no private
  words", exit 0. Twenty-one do: library, schema, qtypes, marking, marking-norm, typeset, answers, typeable, practicals,
  projects, textbooks, aiimage, library-ledger, digest, diagram-png, bundle, answerable, funnel, and check/types,
  check/cards, check/diagrams (found by running the suite in absent mode and reading which failed on LIB_ABSENT).
- A browser check's static server asks `serve()` for a library file; absent, it gets null and serves the repository's
  metadata-only file — what GitHub Pages really serves a phone. Logged as "ran on metadata only".
- check-flow skips and counts each journey that threw LIB_ABSENT (`skipParts`) and runs the rest.
- A read a check caught and swallowed is still said at exit ("skipped N library file read(s)"); check-uploads and
  check-inbox do this (their fake server cannot serve the words).
- Every skip is appended to `$LIB_SKIP_LOG`; each job's summary lists them under "These are NOT green, only not run here".

Locally `LIB_PRIVATE` is unset and nothing changes: the full set runs against data-private/.

## Validated locally (absent mode, empty data-private/)

`check-all --fast`: 112 checks green, 18 skip lines. `FLOW_PART=3/8`: 67 journeys green, 2 skipped. `--slow=1/8` on this
shared, loaded machine: firstpaint and talpage green; press.js hit check-all's 900 s per-check limit and cascade.js
reported overrides — neither was re-run against a baseline with the words, so the first CI run is their verdict.

## What CI cannot check

Everything that reads the library's words (the list above, journeys and browser checks that open a question's words),
the real spreadsheets (`check/live.js`, `digest-dry.js` need `--sheets`), the Apps Script deploy itself, and anything
the live smoke test cannot see signed out (signed-in and admin columns).

## Quick mode

`npm run check:changed` (`js/check-changed.js`) diffs against origin/main plus uncommitted files, maps each path to its
checks by glob, always adds the cheap whole-repo ones, and runs everything for a path the map does not know.
