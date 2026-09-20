#!/usr/bin/env bash
# ==================================================================================================
# @family. — what runs before Claude touches anything.
#
# WHY THIS EXISTS. Every check in this repo is good and none of them ran unless somebody remembered.
# CLAUDE.md says "run js/check.js after every change" and that sentence is the whole enforcement —
# so the one failure mode left was starting work on a repo that was already broken and spending the
# session unable to tell which half was mine.
#
# IT RUNS THE WHOLE SUITE, and the wait is the right price. The fast name check is two seconds and
# catches most things; the ones that take the time are the ones worth having before you start —
# check-flow drives its journeys through the real app, check-payload reads every DATA key,
# check-rows parses the backend, and the browser-driven ones press every control, measure every
# screen and ask which CSS rule wins. A session that opens knowing all of them are green is a
# session where a new red is unambiguously the thing you just did.
#
# THIS LINE USED TO SAY "17 seconds", which it was, once. The suite has roughly doubled twice since
# and the number in the sentence did not move — the same fault CLAUDE.md records under "all 18
# checks pass" and "one of the eighteen names". The run prints its own timings per check, which is
# the only version of this that cannot go stale, so the sentence no longer carries a figure.
#
# THE FOUR SLOWEST RUN TOGETHER. `js/check-all.js` starts the browser-driven checks in parallel and
# prints them in roster order — they spend their time waiting for pages to settle rather than
# computing, so four at once costs the slowest of them rather than the sum.
#
# IT NEVER FAILS THE SESSION. `exit 0` always, on purpose: a hook that refuses to start is a hook
# somebody deletes. It reports and gets out of the way — and "the repo was already red when I
# arrived" is exactly the sentence that needs saying out loud at the top of a transcript.
#
# `npm install` ONLY WHEN THERE IS NO node_modules. CLAUDE.md records that a fresh clone used to run
# `node js/check.js` and get `Cannot find module 'acorn'` with nothing anywhere saying what to
# install. This is that note, executed.
# ==================================================================================================
set -u
cd "$(dirname "$0")/.." || exit 0

if [ ! -d node_modules ]; then
  echo "· installing check dependencies (acorn, jsdom, playwright) — first run only"
  npm install --silent --no-audit --no-fund >/dev/null 2>&1 \
    || echo "· npm install FAILED — the checks will not run until it does"
fi

echo "· $(git rev-parse --abbrev-ref HEAD 2>/dev/null)  $(git log --oneline -1 2>/dev/null)"
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[ "$DIRTY" != "0" ] && echo "· $DIRTY uncommitted file(s) — these were here BEFORE this session"

OUT=$(npm run check 2>&1)
# COUNTED, NOT TYPED. This line said "all 18 checks pass" for as long as there were 18, and went on
# saying it when there were 22 — a number in a sentence nobody re-reads. It is read off the run now,
# so it cannot be wrong again.
N=$(printf '%s\n' "$OUT" | grep -cE "^[[:space:]]+(PASS|note)[[:space:]]")
if printf '%s' "$OUT" | grep -q "OK — nothing is broken"; then
  echo "· all $N checks pass"
else
  echo "· CHECKS ARE RED ON ARRIVAL — this is not something this session did:"
  printf '%s\n' "$OUT" | grep -E "^\s+(FAIL|PASS)|FAILED" | grep -v PASS | sed 's/^/    /'
fi
exit 0
