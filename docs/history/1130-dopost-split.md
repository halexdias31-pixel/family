# 1130 — doPost split into a table of named handlers

`doPost` in `backend/dopost.gs` was one function of 3613 lines (file 4654): the gate, then an if-chain of
~120 `if (action === '…') { … }` blocks. It is now ~40 lines; the file is 1209.

## Shape

- `doPost` keeps everything that runs before any action, in the same order: clear `WRITE_MISSES`,
  `POST_WROTE`, `NET_VIEWER_`; parse; `accessDenied` (the one gate, before any write); `netViewerSet_`;
  the child-spends-no-money guard. Then it looks the action up in `postActions_()` and calls it.
- `postActions_()` (end of dopost.gs) maps each action name to its handler, in the old chain's order. It is a
  function, not a top-level `const`, so Apps Script's file load order cannot matter (the rule in constants.gs).
  The lookup is `hasOwnProperty`, so `constructor`/`__proto__` stay unknown actions.
- Every handler is `function postX_(body, action, began)`, its body the old block's body moved verbatim
  (dedented by four spaces). A handler that returns nothing gives `Unknown action: …`, as falling off the old
  chain did. Several names sharing one block share one handler (`raiseHand`/`hands`, the `media*` four…).
- Topic files, each well under 1500 lines: `post-account.gs` (sign-up/in, PINs, profile, small saves),
  `post-family.gs` (children, person editor), `post-content.gs` (posts, comments, polls, messages,
  suggestions, media), `post-learning.gs` (marking, assistant, answers, library, console saves),
  `post-booking.gs` (payments, moves, jobs, waitlist), `post-admin.gs` (push, inbox, records, errors, staff,
  digest, site words). The § notes for their comments stay in `docs/notes/backend/dopost.gs.md`.

## The only edits beyond moving

- `savePerson` (an arrow over `body`) became `postSavePerson_(body, field, value)`; its four callers pass `body`.
- The fall-throughs became calls: `flagMessage` → `postReport_`, `report` and `reportQuestion` →
  `postSuggest_`, with the same `body` mutations first. `action` is no longer reassigned in doPost.

## Proof of no behaviour change

- An acorn token comparison of every moved body against its original block (types and values, so template
  strings included): 106 handlers, 99 identical, the 7 differing are exactly the edits above.
- All 65 `js/check-*.js` that touch the backend run before and after: the same four failed before and after
  (front-end: check-doors, check-inbox, check-uploads; check-dead's front-end list), identical output.
- No version stamp bumped: nothing deployed changes what it answers.

## Checks taught the table

Several checks found handlers by grepping `action === '…'` in dopost.gs. `tools/post-actions.js` reads
dopost.gs plus `post-*.gs` and gives the action names, the table and a handler's text; check-access,
check-actions, check-api-deadline, check-handles, check-working and check-prefs (a `postX_` call site is
still `doPost:x`) use it. check-gas-load, check/live.js, check-dead and `backend/files.json` list the new files.
