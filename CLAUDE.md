# @family. — the map

A tutoring business's site. Static front end on GitHub Pages, Google Apps Script backend, two
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
| `js/find.js` | The funnel — the app's main surface. Biggest file at 185 KB. |
| `js/book.js` | Sessions, seats, payment. |

Nine screens are registered: `stuff` (the funnel, and the root), `account`, `feed`, `booking`,
`tools`, `games`, `make`, `reel`, `dm`.

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
- Everything else — people, venues, jobs, pricing, posts, links, laws, landmarks, holidays — is a
  tab, listed in `TAB` in `backend/constants.gs` with the column list in `SCHEMA` beside it.

**A key the site asks for and the backend does not send fails silently.** `|| []` turns it into an
empty list, which looks exactly like an empty database. Tap through the app and type `missingKeys()`
into the console to list every one.

---

## Deploying — they are not the same thing

| What changed | How it goes live |
|---|---|
| `index.html`, `js/`, `style.css` | `git push` → GitHub Pages. About a minute. |
| `backend/*.gs` | `git push` to `main` → the **Apps Script** workflow runs `clasp push`. |
| Spreadsheet contents | Immediately — *if* the edit watch is installed. See below. |

`sync.js` in the repo root watches the folder and pushes on save. It now stages `backend/` too.

### The backend used to be pasted, and the arrow has turned round

It was: edit in the Apps Script editor, and the .gs files arrived on GitHub as a dump *from* it. So
`sync.js` refused to stage `backend/` — two writers on one folder is one too many.

Now `.github/workflows/apps-script.yml` runs `clasp push` whenever anything under `backend/` reaches
`main`. **GitHub is the writer; the Apps Script project is the copy.**

**So do not edit the backend in the Apps Script editor.** `clasp push --force` replaces the
project's files wholesale, so anything typed there and not committed here is gone at the next push.
Edit the `.gs` files in this folder like any other file.

#### Setting it up — three secrets and one switch

1. **Switch the Apps Script API on** at <https://script.google.com/home/usersettings>. It is off by
   default and is the likeliest reason a first run fails.
2. `npx @google/clasp@2.4.2 login` on your own machine, then open `~/.clasprc.json`.
3. Repository **Settings → Secrets and variables → Actions**:

| Secret | What it is |
|---|---|
| `SCRIPT_ID` | the id in the Apps Script project URL |
| `CLASP_CREDENTIALS` | the **whole** contents of `~/.clasprc.json`, braces included |
| `DEPLOYMENT_ID` | the **Active** deployment's id. Optional — see below |

The workflow checks all of these before it touches anything, because a half-configured run fails
inside clasp with a Google token error four steps removed from "you did not add the secret".

#### A push is not a deploy

`clasp push` updates the project's **source**. The web app at `/exec` goes on serving whatever
version was last **deployed**. Every confusing "I pasted it and nothing changed" in this project's
history is that distinction, and automating the paste does not remove it.

With `DEPLOYMENT_ID` set, the workflow runs `clasp deploy -i <id>`, which updates the deployment that
already exists. **Without `-i`, clasp creates a NEW deployment with a NEW URL** — the exact mistake
`data.js` spends four paragraphs on, where every version lands somewhere the site is not calling.
So when the secret is absent the workflow updates the source, skips the deploy, and says so in the
log rather than guessing.

### The cache, and the trap in it

`doGet` caches the whole payload for six hours (`PAYLOAD_TTL`). It is retired by bumping a
generation number in script properties. For a long time that only happened when the *app* wrote a
row — so **a row typed by hand into the spreadsheet did not reach the site for up to six hours**,
which is indistinguishable from the sheet not being connected at all.

Fixed by `onSheetChange` in `backend/core.gs`, an installable trigger that retires the payload the
moment anyone edits either spreadsheet, plus `warmAfterEdit` which rebuilds once a minute after the
last edit. **It has to be installed** — paste `core.gs`, then run `installSheetWatch` from the editor's
function dropdown, or open `/exec?triggers=1`. `?run=sheetWatchStatus&name=…&pin=…` says whether it
is on.

`installWarmTrigger` exists and is deliberately **not** installed: every 5 minutes × ~35 s a rebuild
is about five hours of script time a day against a 90-minute daily allowance. It would spend the
budget before lunch and stop the nightly jobs.

---

## Checking your work

```bash
npm install                      # ONCE. acorn, jsdom and playwright — for the checks only.
npm run check                    # everything, via js/check-all.js
node js/check.js                 # names used but never declared. Two seconds. Run always.
node js/check-flow.js            # 21 journeys through the real app in jsdom
node js/check-booking.js         # the booking state machine, folded in Node
node check/ui.js                 # 9 screens x 4 widths, measured. Exits 1 if anything failed.
node check/ui.js --screen=tools  # one screen
node check/ui.js --shots         # also writes PNGs to check/shots/ for a human to look at
```

**`package.json` is for the checks and nothing else.** The site has no build and no dependencies —
`index.html` loads `js/*.js` and the browser concatenates them. Nothing in `node_modules` is ever
shipped. Before it existed, a fresh clone ran `node js/check.js` and got `Cannot find module 'acorn'`
with nothing anywhere saying what to install.

`check/ui.js` serves the real files, stands the backend up from `check/fixture.json`, drives the app
through its own `go()`, and measures: sideways scroll that nobody asked for, tap targets under 44 px,
text under WCAG AA contrast, JS errors, and custom properties nothing anywhere sets.

**Known findings, all on `tools`** (real, not yet fixed):

- **25 sideways scrolls.** One cause with a cascade: `.mat-face` is `white-space: nowrap` inside a
  `minmax(7.5rem, 1fr)` grid column, so a long face name — `◡ protractor`, `km→m units` — cannot
  shrink to its column. The label overflows by 57px, which pushes `.mat-list`, then `.card`, then
  `.pane`. Fixing it means letting that text truncate or wrap, and the comment above the rule says
  nowrap is deliberate (it stops the columns jittering as glyphs change width), so it is a design
  call rather than a typo. `div.mat-out` overflowing by 593px at 320px wide is separate — that is
  the print sheet, which is a fixed paper width and probably wants `overflow-x: auto` rather than
  resizing.
- **19 tap targets under 44px**: the four `5/15/25/45` minute buttons in `map.js` (45x38), the share
  and `＋` buttons in `posts.js` (~30px wide), and the bare checkboxes inside the mat rows.

Fixed and verified by the same check: the 22 contrast failures (one token, `--faint`) and 88 of the
107 tap targets (two rules, `.mat-lev button` and `.mat-list label`).

### Two features that are wired up and have no backend

`node js/check-access.js` reports these, and they are real:

- **`spotlight`** — `collections.js` has an admin star toggle. There is no `spotlight` handler in
  `dopost.gs`, no spotlight tab in `SCHEMA`, and `doGet` never sends `DATA.spotlight`, which
  `collections.js:39` reads. Wired at both ends of the front end with no middle.
- **`acceptTerms`** — `terms.js:289` posts it. No handler anywhere in `backend/`. `doGet` never
  sends `DATA.termsAccepted` or `DATA.termsAcceptedWhen`, which `terms.js:101` and `:104` read.

Neither is a regression; both were never finished. Building them means a handler, a tab in `SCHEMA`
and a payload key each — a decision, not a repair.

### Every check hand-rolls its own path to `backend/`, and most of them had it wrong

`check-booking.js`, `check-columns.js` and `check-access.js` each located the `.gs` files
differently, and all three looked beside `js/` rather than in `backend/`. `check-access.js` also
asked for `doPost.gs` when the file is `dopost.gs` — the same name to a person, a different one to a
filesystem. The failures did not look alike:

- `check-booking.js` printed "nothing to check" and **exited 0**, so it read as a pass for months.
- `check-columns.js` exited 1, so it was at least visible.
- `check-access.js` reported "0 handlers, 0 classified, 34 asked for by the site" and listed every
  action the app performs as missing — alarming enough to be dismissed, which is its own kind of
  invisible.

All three now search `backend/` first and try lower-case spellings. If you move those files again,
three separate lists need updating. **A check that cannot find its subject must exit non-zero** —
"I did not check" is not the same answer as "I checked and it was fine", and exit 0 says the second
one to everything that reads it.

### Three things that will mislead you

**A check that guesses gives different answers on the same code.** `check/ui.js` originally picked
the screen to measure by "whichever pane has the most area on screen". Run `--screen=tools` alone
and it reported 25 sideways scrolls; run the same screen inside the full nine and it reported none,
because with nine screens drawn something else won the area contest. It now asks for `#s-<id>`
directly, which is where `paint(id)` writes, and says so loudly if it ever has to fall back.

**Reading the source is not the same as measuring the page.** A scan of `style.css` reported seven
dead custom properties; all seven were wrong, because they are set from template strings like
`style="--fly-ink:${esc(ink)}"`. Asking the rendered page instead produced the *same seven*, because
`--fly-ink` only exists once a flyer is open. Two opposite methods, one identical false alarm. Layout
facts come from the browser; "does a writer exist at all" comes from the source. `check/ui.js` says
which of the two each check uses and why.

**`backend/people.gs` declares `childrenOf` twice** — line 248 takes a row, line 282 takes an id. The
second silently wins. Not yet fixed; be careful around it.

---

## House style

Follow it. It is unusual and it is deliberate.

- **Comments say WHY, and what went wrong before.** Not what the line does. Most of them are a bug
  report written from the far side. Match the density of the file you are in.
- **Fallbacks everywhere.** `brand(k, or)`, `|| []`, `try/catch` around anything that can be absent.
  An empty or broken sheet must still produce a working site.
- Plain scripts, no modules, no framework, no build.
- **Tap targets in `px`, everything else in `rem`.** Line 121 sets the root to
  `clamp(13.5px, 3.8vw, 16px)`, so a rem is 14.82px on a 390px phone. `2.75rem` for a 44px target
  comes out at 40.75px and still fails. A fingertip is the same size on every screen; it is the one
  measurement here that must not scale.
- Version constants — `BACKEND_VERSION`, `DOGET_VERSION`, `DOPOST_VERSION`, `BOOKING_VERSION` — are
  compared on the **whole stamp**, so bump all four together or the You screen reports the untouched
  ones as "Not deployed".
