# The long map

CLAUDE.md as it stood on 18 Oct 2026, verbatim except for the Deploying section (now docs/deploying.md).
CLAUDE.md is loaded into every session, so it was cut to the rules; the reasons, figures and the
owner's words behind them are kept here. Figures in it (sizes, counts) were true then and are not kept up to date.

---

# @family. — the map

A tutoring business's site. Static front end on GitHub Pages, Google Apps Script backend, three
spreadsheets as the database. No build step, no framework, no package.json for the site itself —
`index.html` lists the JavaScript files and the browser concatenates them into one global scope.

**Read this first, then the file you need.** It exists because the codebase is 64% prose: 1.4 MB of
source, 511 KB of actual code, and the rest is comments explaining decisions that were paid for in
bugs. That prose is the most valuable thing here and it is also why finding anything takes a while.

---

## The shape of it

```
index.html      lists the js/ files IN ORDER and starts the boot fetch while still parsing
style.css       448 KB, 1970 rules. --css-version at the top says which build is running
js/             40 files, ONE SHARED GLOBAL SCOPE. No imports. Order is load-bearing.
backend/        the Apps Script project. GitHub only holds a COPY — see "Deploying" below.
check/          the harness that replaces looking at it on a phone
```

### The one rule in `js/`

Every file shares one scope, so **a file must not be reordered against the others**. `index.html`
holds the list; the list is the order. Nothing fails at load if a name is missing — that is the cost
of plain scripts over modules, and it is paid by `js/check.js`, which reads every file and reports
any name used but never declared. Run it after every change.

### The spine

| File | What it is |
|---|---|
| `js/shell.js` | **The runtime.** `screen(id, draw)` registers a screen, `go(id)` switches to one, `placeCells()` positions the panes, `toast()` speaks. 25 KB of code under 97 KB of comments. |
| `js/data.js` | `API` (the Apps Script URL), `DATA`, `load()`'s state, the small helpers, `missingKeys()`. |
| `js/boot.js` | Last file loaded. Draws the first screen, then calls `load()`. Nothing may go below it. |
| `js/find.js` | The funnel — the app's main surface, and the engine of both finders (`FINDERS`, `inFinder_`). Biggest file at 1 MB. |
| `js/book.js` | Sessions, seats, payment. |

Fifteen screens are registered (fourteen for anybody but an admin), in `TAB_ORDER` (js/shell.js),
grouped by purpose since 21 Oct (docs/history/392), and `data/settings/columns.json` lists the same order
(`check-doors.js` fails if they part). Social: `feed` (where the app opens, `TAB_HOME`), `spotlight`,
`reel`, `dm`. Learning: `stuff` (Find, the funnel —
questions, answers, practicals, projects, bundles, the content cards, the boxers and their fights, the
Bible for an admin — and the root), `res` (**Find 2**: the same finder again, immediately right of Find,
with a state of its own; the id is `res` from the two days it held the resources), `saved`, `progress`
(for a student — and an admin — the "Your journey" card that was on Settings until 12 Oct; for anybody
else a placeholder saying it is not built), `tools`. Business: `booking`, `shop` (things for sale and the
basket — Find no longer has a Shop door). Then `games`. Then you: `account`, `settings`, and last,
**for an admin only**, `biz` — the business records (insurance, tax, legal and data, safeguarding, money and company). A tab
marked `admin: true` is left out of `TABS` for anybody else by `columnsFor_` in shell.js, which also
makes its `<section>` for an admin and takes it away again — so it has none in index.html, and signing
in or out adds or removes it without a reload.

**One finder, twice** (docs/history/329, 347). `stuff` and `res` carry the **same list** and ask the
same funnel — *"an identical second finder"*, so a student can keep a content card up in one while answering
questions in the other — and what makes them two is their **state**: words, chips, page and kept place
(`find:place`, `res:place`). One funnel bound to two states: `inFinder_(F, fn)` in find.js parks one
finder's `STUFF` and memos and puts the other's in their place, so the engine reads `STUFF` as it always
did. **Outside a binding `STUFF` is Find's** — every other file and every check that writes it means
Find. A timer, microtask, promise or `afterSlide_` job runs outside the binding and must capture its
finder and bind again; anything that forgets "the found list" forgets every finder's
(`finderForgetFound_`). Find's front pages (the booking form, posts, bundles) and the Tools tail of the
fill stay Find's alone. A kept card Saved cannot draw whole has `Open · in Find`. The 10–12 Oct split
(Find without the resources, the second column with only them) is gone; don't bring back a membership
rule per finder.

### Layout, and why the checks are shaped the way they are

Screens sit **side by side** and slide — `placeCells()` positions them with transforms. So at any
moment most of the app is parked off-canvas left and right of the viewport. **That is the design,
not a bug.** Any check that asks "is this element past the right edge of the window" will report
about 156 false alarms. Ask "does this box scroll sideways when it was not told it could" instead.

---

## Where the data comes from

`DATA` is one JSON payload from one `doGet`. The sheet is the database; the site reads it and
almost never writes to it directly.

- **`brand` tab** — key/value. Read as `brand('key', fallback)`. Every call passes a fallback, so an
  empty tab still renders. **This is the pattern to copy for anything new.**
- **`config` tab** — key/value numbers and switches, reaching the site as `DATA.constants.vars`.
- **`facets` / `kinds` tabs** — what the funnel asks and what the answers are called. These moved out
  of `find.js` deliberately: editorial, changes often, changing it should not be a deploy.
- **The library is two halves** (docs/history/397, docs/library.md). The four library files in `data/` are the
  cards — every column the funnel asks, sorts, counts and tags by — plus `lib_has` (the private fields the Ledger
  holds for the row) and a question's `function_verified`. The words, answers, figures and method text are rows
  of `lib_questions`, `lib_content`, `lib_practicals` and `lib_projects` in the Ledger (`LIB_FILES` in
  constants.gs), copied once by `library-to-ledger` and fetched a card at a time by `libItems` (signed in,
  `library_items_per_day`). A card whose words have not come is one waiting page (`libWaitHtml_`). The teaching
  animation rows stay public whole. Tools: `tools/lib-private.js`; checks: `check/lib-full.js`.
- **There are no textbooks on screen: each chapter row of `data/textbooks.json` is a CONTENT CARD**
  (kind `content`, `What kind · Content`; docs/history/347, part 2). *"Forget the whole concept of it
  being a text book. It's just a "content card""* — the owner, 12 Oct. A card wears the question
  library's tags — Subject, Level, Tier, Topic, a board only where its content is one board's — and
  its topics are spelled EXACTLY as data/questions.json or data/topics.json spells them
  (`check-textbooks.js`); every maths card has at least one. The cover row (`chapter: 0`) is only the
  defaults its chapters inherit; a chapter's own cell wins. **The file keeps its name, its row shape
  and `DATA.textbooks`**, because `tools/anim_row.py`, `splashSync_` and `check-anims.js` are written
  against them; internal `tb*` names stay too. Nothing a person sees says textbook, book or chapter.
- **The teaching animations are rows of `data/textbooks.json`** — Pythagoras, the sieve, Bayes, the
  solar system, how many 3s fit into 4 and 24 more, each directly under the chapter row it teaches (`anim`, `title`, `about`,
  `html`, `css`). Its content card plays it on a page of its own, in whichever finder it is opened; the loading screen draws a copy the
  device kept from the last load (`splashSync_` in shell.js, read by the picker in index.html — one
  load behind). *"The source for the animations should be in text books"* — the owner, 8 Oct.
  **Each one has ONE source, and which it is depends on the drawing.** Fourteen are written by a
  script — `area bayes cent coin fib fit gal index mxc orbit pyth sieve sine venn` (`gal` is
  `tools/galton.py`, `orbit` is `tools/solar.py`, the rest `tools/<id>.py`, all through
  `tools/anim_row.py`): for those **the script is the source** — change it and re-run it, and never
  edit the row by hand, because the next run puts back everything the script writes and nothing
  notices but `check-anims.js`. For the other 15 **the row is the source**: edit it in place. Never
  in `index.html` or `style.css`: the loading screen there has no drawing of its own — the 13
  splashes that taught nothing were deleted on 10 Oct (*"delete all animations for loading which dont
  come from text books or arnt educational"*). With nothing kept (a first visit), the splash is the
  name, still, with `loading_()`'s loader under it, written out by hand; `check-loading.js` holds
  that copy to `loading_()` byte for byte, `check-css.js` keeps an inline splash out (what `#splash`
  holds is a closed list), and `check-anims.js` fails on a teaching one left there. See
  docs/history/304, 322.
- **Every paper has a health score** — `paperHealth_` in js/library.js, the share of its points that pass; the finder shows `Ready · 99%` and a Health tile to everybody (*"No, everyone can see the scores"*), and `check-health.js` prints them all. See docs/history/354.
- **Every drawing in `data/questions.json` (`diagram`) has a PNG twin** in `data/diagrams/<first 12 hex of
  the SHA-256 of the drawing>.png`, for the Sunday email (Gmail shows no SVG; *"No jpgs"* — linked in the
  body, never attached). **Written by `tools/diagram_png.js`** (the site's CSS, paper palette, 2x) — re-run
  it after changing any drawing, never draw one by hand; `check-diagram-png.js` fails on a drawing with no
  twin, a twin with no drawing, and a backend that names one differently. See docs/history/351.
- Everything else — people, venues, jobs, pricing, posts, links, laws, landmarks, holidays — is a
  tab, listed in `TAB` in `backend/constants.gs` with the column list in `SCHEMA` beside it and the
  file it lives in in `WHERE`. **All three have to name it.** `TAB` without `WHERE` is a tab nothing
  can open; `WHERE` without `SCHEMA` is a tab `ensureSchema` will never repair. `check-tabs.js` is
  the instrument, and it runs before `check-columns.js` because a tab nobody can open has no
  columns.

**A key the site asks for and the backend does not send fails silently.** `|| []` turns it into an
empty list, which looks exactly like an empty database.

`node js/check-payload.js` is the instrument for this. It reads the files, so it sees every read
whether or not anybody performed it — which is the difference between it and `missingKeys()`, the
console helper that only records keys something actually reached for, and so only knows about the
screens you happened to open, in the state you happened to be in, as the person you happened to be
signed in as. A key read only by an admin on the print queue is invisible to `missingKeys()` until
an admin opens the print queue.

It reports two directions and they are not the same severity. **Read and never sent** is a feature
that silently does nothing, and fails the build. **Sent and never read** is a tab walked and shipped
to every phone on every load for nobody — weight worth deleting, but it breaks nothing, so it
reports and does not fail. There are 23 of those right now.

Keys that are read, deliberately not sent, and known about live in `ACCEPTED` at the top of that
file, **one written reason each**. They are still printed. The point of the list is that a *new*
dead key fails loudly instead of joining a red that nobody reads.

---

## Checking your work

`.claude/session-start.sh` runs the whole suite on arrival and prints `all N checks pass` or `CHECKS ARE RED ON ARRIVAL`. Run `node js/check.js` after every change and `npm run check` before pushing. A check that cannot reach its subject must exit non-zero, and a mutation is only proved when the real files are green again.

```bash
npm install                      # the hook does this for you on a fresh clone
                                 # acorn, jsdom and playwright — for the checks only.
npm run check                    # everything, via js/check-all.js
node js/check.js                 # names used but never declared. Two seconds. Run always.
node js/check-flow.js            # 21 journeys through the real app in jsdom
node js/check-payload.js         # every DATA key the site reads vs every key doGet sends
node js/check-booking.js         # the booking state machine, folded in Node
node js/check-backend.js         # one Apps Script scope: every name declared exactly once
node js/check-tabs.js            # every tab routed to one of the three files, and the ids look sane
node js/check-rows.js            # each column read, against the tab that row actually came from
node js/check-post.js            # an action that names a person by a cell they can edit
node js/check-posts.js           # posts wait for approval, final once up, no links, a child uploads nothing (413)
node js/check-library.js         # data/questions.json: ids, 80 marks, the closed facet vocabulary
node js/check-marking.js         # a right answer marked right, a wrong one wrong
node js/check-practicals.js      # the 41 practicals, and whether their topics join to anything
node js/check-anims.js           # the content cards' animations: rows, anchoring, and the splash's copy
node js/check-diagram-png.js     # every library drawing has its PNG twin for the Sunday email, none orphaned
node js/check-textbooks.js       # data/textbooks.json: the bones, and every content topic spelled as the library spells it
node js/check-funnel.js          # the real funnel over the real library: can each question narrow?
node js/check-library-ledger.js  # the library's words in the Ledger: the copy checked row by row, libItems signed-in and capped (--full: all of it)
node tools/lib-private.js status # where the library's words are: data/, data-private/ (docs/library.md)
node js/check-const.js           # nothing declared `const` is assigned to. Two seconds.
node js/check-loading.js         # every wait is `loading_()`: no phrase, class or keyframe of its own
node check/deploy.js             # after a push, does a browser that has the site run the new code
node check/anims.js              # every content card's animation at 320 and 390, still when asked
node check/videos.js             # the videos card: the bar held as you type, one player, full screen on its side
node check/sounds.js             # the marking chime and buzzer: short, quiet, as loud as each other to an ear, no click, one tap one sound
node check/ui.js                 # 9 screens x 5 widths x 2 visitors. Exits 1 on anything new.
node check/ui.js --screen=tools  # one screen
node check/ui.js --shots         # also writes PNGs to check/shots/ for a human to look at
node check/live.js --sheets s.json --out /tmp/p.json   # the REAL doGet over the REAL spreadsheets
node check/ui.js --payload=/tmp/p.json                 # and the real app rendered against it
node check/digest-dry.js --sheets s.json --week 2026-10-18 --out /tmp/sunday   # Sunday's emails over the REAL sheet, each verdict as recorded, nothing sent
```

## House style

Follow it. It is unusual and it is deliberate.

- **Comments say WHY, and what went wrong before.** Not what the line does. Most of them are a bug
  report written from the far side. Match the density of the file you are in.
- **Fallbacks everywhere.** `brand(k, or)`, `|| []`, `try/catch` around anything that can be absent.
  An empty or broken sheet must still produce a working site.
- Plain scripts, no modules, no framework, no build.
- **A THING has tiles; a FORM has buttons.** This is the rule that decides which of the app's two
  action surfaces to use, and it was never written down — which is the only reason the app looked
  inconsistent. Measured: 46 inline `<button>`s against 21 `tile_()` calls, so tiles are the
  *minority*, and the split is by context rather than by accident.
  - **Tiles** (`tiles.js`, one renderer) are the action row under a **thing**: a paper, a tutor, a
    shop item, a session. One `tile_({icon, label, note, act, data})` per action, wrapped in a
    `.tile-row`. Tap targets, icons and the press animation come from one place, and `check-doors`
    pairs every `act` against a handler.
  - **Buttons** are the controls inside a **form or a dialog** — the booking form, the pay sheet,
    the composer. A form's buttons belong to the form.
  - **On a question's pages, everything is a tile** — the owner, 5 Oct: *"check button should be a
    tile"*, *"lock should be a tile too. same as undo and clear. it should all be tiles."* So Check,
    Show/Hide the answer, the pen's lock/undo/clear and its ruler/compass, and Mark with AI are tiles
    even though they act like a form's controls. The two exceptions are the answer itself — the
    keypad's keys and the multiple-choice options — because those are what is being written, not
    actions on it. When in doubt elsewhere, the owner's lean is the same: tile.
  - **Tiles win any tie.** One renderer means one place to fix a tap target; 46 inline buttons is 46
    places to get it wrong. If you are unsure which you are building, it is a thing, and it is tiles.
  - A tile has room for a label and about three words of `note`. When an action needs a real warning
    — "everyone is withdrawn", "never as though Stripe had confirmed it" — put **one** paragraph
    under the row rather than one per button. See `jobAdminTiles_`.
- **THERE ARE TWO PALETTES.** The screen is black and gold (`--bg`, `--gold`, `--ink`, `--line`).
  Everything standing in for PAPER — the receipt, the job stubs, the roster, the print sheet, the
  calendar, the splash — is cream and warm ink (`--paper`, `--paper-ink`, `--paper-dim`,
  `--paper-faint`, `--paper-strip`, `--paper-rule`). Only the first was ever tokenised: the paper
  one was six hex codes written out by hand, `#f4f1e8` alone in 29 rule-groups, so "make the paper
  warmer" was a find-and-replace across ~70 declarations and one missed leaves a card with two
  different papers in it. **Never write a paper colour as a literal.**
- **Which palette a colour belongs to decides its scope.** A colour used by more than one component
  is a `:root` token. A colour that belongs to ONE component — a chess board's cream and charcoal,
  which is that board's own convention and not this app's — is defined on that component
  (`.chess { --chess-light: … }`) so it is named without being offered to the whole stylesheet.
- **Tap targets in `px`, everything else in `rem`.** Line 121 sets the root to
  `clamp(13.5px, 3.8vw, 16px)`, so a rem is 14.82px on a 390px phone. `2.75rem` for a 44px target
  comes out at 40.75px and still fails. A fingertip is the same size on every screen; it is the one
  measurement here that must not scale.
- **A WAIT IS `loading_()`, AND NOTHING ELSE.** Three gold dots, from one function in shell.js and one
  block in style.css — in place of what is coming, a whole page on its own, or over markup already
  drawn (`aria-busy="true"`, taken off by `loaded_`). The owner, 9 Oct: *"Every widget has unique
  loading look. They should all have a simplistic simple loading thing."* No waiting sentence, no
  skeleton, no spinner of a card's own; an error or an empty result keeps its words, and a press
  already sent keeps `send_`'s ring. **Whether the payload is still coming is `awaiting_()`, never
  `!LOADED`** — `LOADED` is true once a failed first load has finished, while the quiet retry is
  still asking. `check-loading.js` fails on a waiting phrase, and on any drawn text that trails off in
  "…", unless it is listed with a reason. See docs/history/306.
- Version constants — `BACKEND_VERSION`, `DOGET_VERSION`, `DOPOST_VERSION`, `BOOKING_VERSION` — are
  compared on the **whole stamp**, so bump all four together or the You screen reports the untouched
  ones as "Not deployed".


## History

The full record of past bugs and decisions (about 1.2 MB) lives in `docs/history/`, one file per topic, listed in `docs/history/README.md`. It is NOT loaded automatically. Before changing an area, `grep -ril <keyword> docs/history` and read the matching file: those notes record why the code is shaped the way it is and what was tried and reverted.

Recurring lessons, in one line each: fix the rule, not the instance; a fixture must send what `doGet` really sends; a screenshot is the last word on anything drawn; print a count rather than a silence; a mutation proves a check only when the real files go green again.
