# 534 — One press, one action (package C)

**Asked:** the polish pass (531) — the owner wants the app to *"feel so stable, like iOS made it"*. Rule U3 of the
plan: **one press is one action.** The touch and states audits found a double tap on Delete deleted (the second
tap 110 ms after the first was the "yes"), Save sent `favourite` twice on four screens, a layout move posted twice,
and a POST that never answered left its control spinning for ever. The owner said yes to D1 as proposed: a second
tap under 0.4 s is ignored, so a double tap never deletes; the "Really delete?" button keeps growing as it does now.

## What changed

- **The dispatcher (js/shell.js, `pressAgain_`).** The same control again within `PRESS_AGAIN_MS` (350 ms) is
  dropped. "The same control" is its first class, its `data-do` and its other `data-*` attributes (less
  `data-sure`/`data-armed`), pressed on the same element or on the one it was redrawn from — so a star redrawn by
  its own press is still the star, while an ordering's item and its slot (both `qp-place`, same `data-n`) are two,
  and so are two live copies of one card (check-flow's signed-out and signed-in cards found both). Keys and steps pressed fast on purpose pass: `data-repeat` on
  the control, or the action named in `PRESS_REPEAT_` (the keypad's `kp-key` — keypad.js is 528's, so its template
  is not edited — maze steps, calendar months, E-ink back/next, Talmud size, player count, Connect 4 drops, the pen's
  and chess's undo, the Spotify controls).
- **In flight.** While a handler runs, `PRESS_ACTING_` names its control; an `api()` call made then, or a promise
  the handler returns, marks the control `aria-busy="true"` and every press on it is dropped until that settles.
  This is the dispatcher's own mark; the visible busy ring is `send_`'s, adopted by package D.
- **A save that runs behind a screen that has already changed holds nothing.** `pressFree_()` says so: the star
  (`toggleFav`), the answers outbox (`answersPush_`) and the submissions queue (`subPush_`). A face (`react`) and a
  vote already save in a microtask through `choiceSave_`, after the press. Without it a person could not un-star for
  the whole round trip, and the submission journeys found the queue's request holding the Check tile.
- **`api()` has load()'s deadline**: 60 s for the headers and body together, then the fetch is aborted and the call
  rejects with a sentence (`TimeoutError`, "The server did not answer within a minute. It may still have been
  saved — look before trying again."), which `why_()` passes through as it is. A `keepalive` flush is not cut:
  it is meant to outlive the page.
- **`sure_` (js/receipt.js)** stores when it armed; a yes under `SURE_GAP_MS` (400 ms) is ignored and the control
  stays armed. Its disarm timer is now cleared on a yes, so an old timer can no longer disarm a later arming.
  `sure_(el, ask, { face, back, ms })` lets a control draw its own armed look.
- **The layout tiles (js/layout.js)** asked twice with their own `data-armed` timer; they now go through
  `layArm_` → `sure_`, keeping their look (the label, the `.lay-again` word, `.is-armed`, 3 s).
- The `dblclick` comment says what is now true: the two clicks reach the dispatcher, which drops the second.

## Checks

- **check/press-twice.js** (TWICE_PORT): student and admin at 390, every states.js state, every control on the
  card in front or an open sheet (one per action per screen), two real taps 110 ms apart with every POST held 1.5 s.
  Fails when an action is posted twice. A control that is armed after the taps must have posted nothing, still be
  armed after a yes at ~375 ms (past the dispatcher's window, inside sure_'s), and post exactly once on a yes at
  1 s. Also fails when `PRESS_REPEAT_` names an action no `on()` registers.
- **check/press-deadline.js** (DEADLINE_PORT): admin at 390 under Playwright's clock, every POST never answered;
  Approve on a waiting post (a star is not measured: its save holds nothing): the control says `aria-busy`, a press 550 ms later posts nothing,
  and 61 s on it is free again with a sentence in the toast (no raw error text).
- check-flow: the person Delete journey now presses yes 150 ms after arming and expects nothing; the layout
  Delete journeys and the E-ink Sync journey wait as a person would between presses.

## Proven

Each mutation turned its check red and the real files went green again:

- the 350 ms window removed (`pressAgain_` returns false): press-twice, admin feed — `lay-front` posted `layoutSave` ×2;
- sure_'s 400 ms gap removed: press-twice, admin feed — a yes 375 ms after arming `post-delete` posted `deletePost`,
  and the same for `lay-c-del`;
- `pressOut_` made a no-op: press-deadline — Approve does not say aria-busy with its request out;
- `API_DEADLINE_MS` 100 minutes: press-deadline — still aria-busy 61 s later, and nothing said.

A first try of the window mutation as a student on Find stayed green: the student's Find states never arrived, so
nothing that posts was pressed there. The proof was rerun as the admin; the full run presses both visitors.

## The journeys that pressed faster than a person

The window is a timing rule, and check-flow presses at machine speed. Each journey that pressed the same control
twice inside 350 ms on purpose now waits as a person would (the reel's Sound, the comment Post, the faces, the
ordering's second Send, the E-ink Sync, a second Check after typing, check-bundle's second Send). The sound
journeys and the real-1F-Q4 ordering are about what a press does, not when: their press helpers call
`__t.pressForget()` first, which clears the dispatcher's memory, and check/press-twice.js owns the timing.

## After review: what the first cut got wrong

- **The minute cut long admin actions.** `raceBuild` (Overpass `[timeout:150]`, heights until t0 + 280 s) and
  `libImportDrive` (starts files until `LIB_DRIVE_MS`, four minutes) are built to run for minutes; at 60 s the admin
  was told the map was not built, the race screen fetched a map still being built, and the import's report was lost.
  `API_LONG_` in shell.js now names them with Apps Script's six minutes. `js/check-api-deadline.js` finds such
  actions itself — every doPost action, the functions it reaches, and any budget written as `now() - t0 > X`,
  `budgetMs || X` or `t0 + N * 1000` over the deadline — and runs api()'s own source to see the wait it sets.
  Proven: raceBuild taken out of the list, libImportDrive at two minutes, a stale name, the race budget at 330 s,
  and api() ignoring the list each went red.
- **Steppers pressed fast on purpose were dropped**: the feed's "One more thing" (`feed-tap`, one element that is
  never redrawn), the rewrite's steps (`rw-next`, `rw-back`) and the speed reader's sentence back (`speed-back`).
  They are in `PRESS_REPEAT_`. The party games' Got it / Pass and the next-question buttons stay held: a double tap
  there scores twice or skips a card unseen.
- **A request held every control with the same key**, so a Send in one sheet held a Send in another, and a handler's
  own promise (Spotify search, Tasks sync: fetches with no deadline) could hold its control until reload. The hold is
  now per element (or the one redrawn from it), and any hold lets go after its request's deadline plus a second.
  `js/check-press-hold.js` runs the press block in a vm; proven by holding by key again (red: the other Send held) and
  by taking the let-go timer out (red: still held ten minutes later).
- press-twice runs at 390 for a student and an admin only; its header now says so.
