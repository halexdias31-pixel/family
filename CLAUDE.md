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

## Deploying — they are not the same thing

| What changed | How it goes live |
|---|---|
| `index.html`, `js/`, `style.css` | `git push` → GitHub Pages. About a minute. |
| `backend/*.gs` | push to `main`, then run **`pullFromGitHub`** in the Apps Script editor. |
| Spreadsheet contents | Immediately — *if* the edit watch is installed. See below. |

### Two routes, and the one that is actually used pulls

There are two ways `backend/` reaches Apps Script and they run in opposite directions:

- **`pullFromGitHub` in `backend/sync.gs`** — run from the function dropdown in the Apps Script
  editor. It downloads `backend/` from `main` over `raw.githubusercontent.com` and writes it into
  the project through the Apps Script API. **This is the one in use.** No terminal, no token stored
  anywhere, nothing to configure beyond the API switch. `previewFromGitHub` does the same read and
  writes nothing — run it first, every time, because it is the only thing that shows a **deletion**
  before it happens.
- **`.github/workflows/apps-script.yml`** — `clasp push` on every push to `main`. Better in
  principle (nobody has to remember to run it) and unused in practice, because `clasp login` needs a
  terminal.

**The workflow failed nine times out of nine and every failure was the same line**: `SCRIPT_ID` and
`CLASP_CREDENTIALS` are not set. They are not set because that route was never taken. It now
**skips rather than fails** when the secrets are absent — a permanent red cross on every merge, for
a route nobody chose, is a red that teaches you to ignore red. A secret that is present and *wrong*
still fails loudly; absent and broken are different answers.

**Both routes replace the project's files wholesale**, so the warning below holds either way: what
is typed into the Apps Script editor and not committed here is gone at the next sync.

What `pullFromGitHub` needs:

| | Why |
|---|---|
| `script.projects` in `oauthScopes` | ✅ without it Google answers 403 and `apiTrouble_` says so |
| the repo **public** | ✅ the raw URLs are fetched unauthenticated |
| `backend/files.json` naming every file | ✅ it pulls by that list; `check-manifest.js` keeps it honest |
| the Apps Script API on **for the script's own Cloud project** | ❌ **and this is the one that blocks it** |

#### THERE ARE TWO APPS SCRIPT API SWITCHES AND THEY ARE NOT THE SAME ONE

This cost a run and it is not written down anywhere obvious:

- **The account-level toggle** at <https://script.google.com/home/usersettings>. This is what
  **clasp** needs, because clasp calls the API as its own Google OAuth client.
- **The Cloud-project-level enablement**, in the Cloud console, for the project the call is billed
  to. `sync.gs` calls the API with `ScriptApp.getOAuthToken()`, so the caller IS the script's own
  Cloud project and that project needs the API switched on. The 403 names it outright —
  `consumer: projects/850507942585`.

`apiTrouble_` already tells the two apart by whether Google's message carries a project number, and
it was right. **The account toggle being on does nothing for `pullFromGitHub`.**

**AND THAT PROJECT CANNOT BE OPENED.** `hermes` sits on an auto-created default Cloud project, and
the console answers `resourcemanager.projects.get (missing)` to its own owner. There is no
permission to grant yourself; a default project is not reachable that way. So `pullFromGitHub` is
blocked until the script is moved to a standard Cloud project, which means an OAuth consent screen
and a re-authorisation — and since the web app is `ANYONE_ANONYMOUS` running as `USER_DEPLOYING`,
that re-authorisation is what every anonymous visitor depends on. **Not a thing to do casually on a
live site**, which is why it is the third choice and not the first.

#### So: three routes, and the ranking changed

1. **The GitHub Assistant browser extension** — the `Repository ▾ / Branch ▾ / ↓ ↑` controls in the
   editor toolbar. It works through the editor's own session rather than the public API, so none of
   the above applies to it. Nothing to enable, nothing to authorise.
2. **clasp, via the workflow.** Needs a terminal exactly once for `clasp login`, and the
   account-level toggle it depends on **is already on** — so this is closer to working than the nine
   red runs suggest. The secrets were never the only blocker, and they were never the wrong one.
3. **`pullFromGitHub`.** The best-fitting route on paper and the one currently blocked. Leave it
   until moving the Cloud project is worth the re-auth risk.

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
moment anyone edits any of the spreadsheets, plus `warmAfterEdit` which rebuilds once a minute after
the last edit. **It has to be installed** — paste `core.gs`, then run `installSheetWatch` from the
editor's function dropdown, or open `/exec?triggers=1`. `?run=sheetWatchStatus&name=…&pin=…` says
whether it is on. `installSheetWatch` walks `FILES`, so it covers all three without being told they
exist — **but a file added to `FILES` is not watched until it is run again.**

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
node js/check-payload.js         # every DATA key the site reads vs every key doGet sends
node js/check-booking.js         # the booking state machine, folded in Node
node js/check-backend.js         # one Apps Script scope: every name declared exactly once
node js/check-tabs.js            # every tab routed to one of the three files, and the ids look sane
node js/check-rows.js            # each column read, against the tab that row actually came from
node js/check-post.js            # an action that names a person by a cell they can edit
node check/ui.js                 # 9 screens x 4 widths x 2 visitors. Exits 1 on anything new.
node check/ui.js --screen=tools  # one screen
node check/ui.js --shots         # also writes PNGs to check/shots/ for a human to look at
node check/live.js --sheets s.json --out /tmp/p.json   # the REAL doGet over the REAL spreadsheets
node check/ui.js --payload=/tmp/p.json                 # and the real app rendered against it
```

**`package.json` is for the checks and nothing else.** The site has no build and no dependencies —
`index.html` loads `js/*.js` and the browser concatenates them. Nothing in `node_modules` is ever
shipped. Before it existed, a fresh clone ran `node js/check.js` and got `Cannot find module 'acorn'`
with nothing anywhere saying what to install.

### `check/live.js` — the real backend over the real database

Everything else measures the app against `check/fixture.json`: four question rows, fifteen people,
a handful of venues, all hand-written. That is right for most of them — a fixture is stable, and a
check whose answer changes when somebody edits a cell is a check nobody can act on.

**But it means nothing had ever seen the actual data**, and three faults in one week came from
exactly that gap. No fixture would have caught any of them, because the fixture was written from the
same belief as the code: `SCHEMA.landmarks` naming seven columns the sheet has never had,
`allTopics()` hardcoding `link: ''` with a comment explaining no PDF exists while 328 rows carry
one, and a past paper drawn twice over.

**It is not a second implementation.** It loads the `.gs` files and calls the real `doGet`. Only the
eight Apps Script globals the payload build touches are replaced — `SpreadsheetApp` backed by a dump
of the real spreadsheets, `CacheService` deliberately always missing so the payload is built from
the sheet every time. If `doget.gs` is wrong about a column, this is wrong the same way.

**Never commit the dump or the payload.** `Ledger` holds PINs, e-mail addresses, phone numbers and
dates of birth, and this repository is public. `check/live.js` refuses to write a payload inside the
working tree and `.gitignore` carries both paths.

What it found on its first run, none of which the fixture can see, because the fixture has no real
photographs and nobody in it is missing a DBS:

| | |
|---|---|
| `img.post-pic` | overflows by 27–31px on the feed at 320, 390 and 768 |
| `article.post` | overflows by 14–15px |
| `img.pass-pic` | overflows by 2px on the account screen |
| "NO DBS ON FILE" | 4.43:1 against black — needs 4.5 |

and 33 tap targets beyond the 69 already in `ACCEPTED_TAP`.

**The one thing it cannot do is tell you what is deployed.** A push is not a deploy, and every
Google host is blocked from the agent's environment by network policy — `script.google.com`,
`docs.google.com`, all of them. Only GitHub is reachable. So which version `/exec` serves has to
come from somebody opening the URL.

`check/ui.js` serves the real files, stands the backend up from `check/fixture.json`, drives the app
through its own `go()`, and measures: sideways scroll that nobody asked for, tap targets under 44 px,
text under WCAG AA contrast, JS errors, and custom properties nothing anywhere sets.

### It reported nothing because it had never signed in

**For a long time this section said `check/ui.js` reports nothing across 9 screens x 4 widths. It
did. It was measuring the app a STRANGER sees**, because nothing in it ever set a user, and this
app shows a stranger very little. The booking screen signed out is one card reading "Sign in to
book"; the form behind it is the most control-dense surface in the whole app, and "booking: nothing
to report" had always meant that card.

It now runs **72 combinations — 9 screens x 4 widths x 2 visitors**, signed out and signed in as an
admin, seeded into `localStorage` before the page loads so `data.js` signs the visitor in itself.
If the seed is ignored the run says so loudly and fails, because "I did not check" printed as
"I checked and it was fine" is this project's recurring failure.

What the other half was hiding, on the first run that could see it:

- **`.fm-out` — the flyer sheet — reported as clipping up to 593px. It was not, and neither was
  `.mat-out` before it.** See "A transform is invisible to `scrollWidth`" below: this was my
  mistake, made because the entry for `.mat-out` already said the same thing and I did not measure.
  Both are back to `overflow: hidden` and the check has been taught the difference.
- **`.fm-adds label { min-height: 2rem }` — 27px on a phone.** The comment above it correctly says
  the tap target belongs on the label rather than the 17px tickbox, and then writes it in `rem`.
  That is the `.btn.tiny` mistake and the `.post-act` mistake, both recorded below, for a **third**
  time. Tap targets in px is a rule with three convictions behind it now.
- **`.rc-tiles .tile { 40px }`** on "Ask for it" and "Share this booking" — in px, and under 44 on
  purpose, to sit politely on a receipt that no longer exists.
- **`.bk-row` overflowed by 13px at 320**, taking `.bk`, `.rc` and `.pane` sideways with it. The
  cause is the root font's own floor: `clamp(13.5px, 3.8vw, 16px)` stops shrinking at about 355px
  while the viewport does not, and every column on that card is `em` or `ch` off the root. The row
  now takes `min(.74rem, 2.85vw)` — the two curves meet exactly where the clamp stops, so it is
  unchanged at every width that already worked and needs no breakpoint to keep in step.

**63 findings remain and they are in `ACCEPTED_TAP`, with one written reason each, printed in full
and not failing the build.** Both are real and neither is a number: the hour grid cannot be made of
44px parts (eleven of them need 484px, wider than any phone), and giving the booking row's inline
dropdowns 44px detaches the dashed underline from its label by 24px, because that underline is the
grid cell's bottom border. Tried twice, photographed both times, reverted both times. Fixing it
means moving the underline onto the control — a redesign of the app's main form, and a decision
rather than a repair. The list exists so that a NEW tap target fails loudly instead of joining a red
nobody reads; same argument as `ACCEPTED` in `check-payload.js`.

The earlier baseline is still worth reading, because three of its four findings were the check being
wrong rather than the app:

- **25 sideways scrolls, two causes.** 22 were `.mat-face` set to `white-space: nowrap` inside a
  `minmax(7.5rem, 1fr)` column: a face like `◡ protractor` cannot shrink to its column, so the label
  overflowed by up to 59px and pushed `.mat-list`, then `.card`, then `.pane`. **This entry used to
  say nowrap was deliberate and quoted the comment above the rule. It misread it** — that comment
  defends the *monospace font* as what stops the columns jittering, and mono is untouched. The other
  3 were `div.mat-out`, and **that entry was wrong** — see "A transform is invisible to
  `scrollWidth`" below. Nothing was clipped; it is `overflow: hidden` again.
- **19 tap targets, 16 real.** `.btn.tiny` said `min-height: max(38px, 2.3rem)` and 2.3rem is 34px
  on a phone, so the max never chose the rem and the timer buttons were 45x38 on every device.
  `.post-act` said `min-width: 2.2rem`, which is 32.6px, so Share was 30x44 — tall enough to look
  deliberate, too narrow to hit. Both now in px. The other 3 were a 14px checkbox inside a 44px
  label, which is not a small target: a click anywhere in a label toggles the control it contains.
  `check/ui.js` now exempts a control whose wrapping label is itself 44px, and still measures the
  label on its own pass, so shrinking the row still reports it.

**The measurement was green before the layout was right, and a screenshot is what caught it.**
Wrapping `.mat-face` fixed all 25 scrolls and cost 15px of list height, with ten faces on two lines —
and `|·| ruler` rendering as `|·|` / `rul` / `er`, which no check flagged, because a mid-word break
is not an overflow. The real culprit was `.mat-note`: `display: block` inside a flex row is
blockified, so a note asking for its own line silently sat on the same one and took a third of the
column from the face beside it. With `flex: 1 0 100%` it takes the line it wanted, no face wraps at
all, and the list measures 860/464/467/467px at 320/390/768/1280 — **the same numbers nowrap gave,
to the pixel.** CLAUDE.md already says layout facts come from the browser. The other half is that
"nothing measured wrong" and "it looks right" are different claims, and only one of them a
screenshot can settle.

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

**A transform is invisible to `scrollWidth`, and it cost two wrong fixes.** `check/ui.js` asked
`scrollWidth > clientWidth`, which is the browser's own answer and normally the honest one. But
`scrollWidth` is a LAYOUT width and a `transform: scale()` is painted after layout — so `.mat-out`
and `.fm-out`, the cheat sheet and the flyer, both 794px A4 pages scaled to 0.3533 by `matFit` and
`flyFit`, reported 514px of overflow inside a 280px box. Measured with rectangles, which *do*
account for transforms: the sheet's rendered right edge is 335 and the box's right edge is 335.
Nothing was ever clipped, at any width.

The `.mat-out` entry above was written on that reading, and I then changed `.fm-out` to match it —
**two rules changed, one of them twice, on a measurement nobody had taken.** `overflow-x: auto` is
not harmless either: it puts a real scrollbar under a sheet that is entirely on screen. Both are
`overflow: hidden` again, and the check now asks a second question in pixels a viewer can see —
does the widest child's rendered right edge pass the box's? An element with no element children is
exempt from that second question, because text cannot be transformed away from its own box and
`scrollWidth` is already right about it; the first version of the fix forgot that and would have
dropped every text overflow in the app. Verified both ways: a real 13px `.bk-row` overflow and a
forced `white-space: nowrap` text overflow are both still reported.

**Reading the source is not the same as measuring the page.** A scan of `style.css` reported seven
dead custom properties; all seven were wrong, because they are set from template strings like
`style="--fly-ink:${esc(ink)}"`. Asking the rendered page instead produced the *same seven*, because
`--fly-ink` only exists once a flyer is open. Two opposite methods, one identical false alarm. Layout
facts come from the browser; "does a writer exist at all" comes from the source. `check/ui.js` says
which of the two each check uses and why.

**Both spreadsheet IDs pointed at an `.xlsx` and `SpreadsheetApp` cannot open one.** Every section
loaded empty, which is also exactly what a blank database looks like — and the comment above
`SPREADSHEET_ID` said "if every section ever loads empty, this line is the first thing to check". It
was right and the line was wrong. There were two files of each name, same title, same owner, and
the code named the unopenable one: `1WeY0AD7dEz…` for businessDB, `1jDEeRoUTtL…` for SubjectsDB.

**The URL is how you tell them apart**, because the title does not: a Google Sheet lives at
`docs.google.com/spreadsheets/d/<id>/edit`, an uploaded `.xlsx` at `drive.google.com/file/d/<id>`.
If the address says `file/d`, Apps Script cannot read a cell of it. `check-tabs.js` now fails on an
id in that spelling, which is the only half of this a checker can see without opening Drive.

This is why the past papers looked missing. They are not — `questions` has the real Edexcel papers
in it, stems, parts and mark schemes, and has had for a while. Nothing was reading the file they are
in. **Do not seed that tab.** It is content, it is maintained in the sheet, and the sheet is the
only place it lives.

### Four spreadsheets became three, and the split is now a question with one answer

It was businessDB, SubjectsDB, Widget_Settings and Engine — and a fifth, "full pdf datbase", which
nobody counted because it had been written off (see `resources` below; it was not junk) — **split by
subject matter**, which is a split nothing could check. Nobody could say where a tab belonged without knowing the history, and
the cost of that showed up as duplicates with different column sets: `kinds` and `widgets` each
existed in two files, and **the live copy of each was the empty one**.

It is now three files, **split by who writes the rows**:

| File | Who writes it | Tabs |
|---|---|---|
| **Ledger** | the app, via `doPost` | people, jobs, receipts, posts, orders — the business as it happened |
| **Settings** | you; the app reads it | brand, config, pricing, venues, facets — editorial, never a deploy |
| **Library** | you, in bulk | boxers, fights, cheatsheet. `questions` has left — see below |

### `questions` lives in this repository, not in a spreadsheet

`data/questions.json` — 3,913 rows, 44 columns, 2.4 MB, one row per line so a diff names the rows
that changed. `js/library.js` fetches it and builds `DATA.questions` and `dropdowns.checklists` from
it; `doGet` no longer builds either.

**Why that tab and no other.** Three questions decide where a thing lives, and the first one that
answers wins:

1. **Is it secret?** → a sheet, never here. This repository is **public**; anything committed is
   published, and git history is permanent. PINs, e-mail addresses, dates of birth.
2. **Does the app write to it?** → a sheet. Code cannot be written to at runtime.
3. **Do you edit it, or does Claude?** → `questions` is the one tab nobody hand-edits. It arrives in
   bulk, and every edit went export → CSV → download → File → Import, twice. `brand`, `config`,
   `pricing`, `facets` are the opposite and stay in Settings: you change them, and changing them
   must never need a deploy.

### A paper card is the cover, and that took two goes

**`paperCard` printed the ENTIRE paper onto every card in the results list.** `paperInline_` did it,
and the argument written above it was: "the funnel has already done the narrowing a list needs, so
by the time you are looking at one paper there is nothing else on the page." That is false and a
screenshot is what settled it — the funnel is a paged LIST, five covers on a page is ordinary, so a
search result unrolled a complete A-Level paper, 47 parts and 47 answer boxes, between one cover and
the next. You scrolled through an exam to reach the next exam.

**A card is a thumbnail.** That is what it is for a tutor, a venue and a shop item, and a past
paper's thumbnail is its cover — which `paperCard` already draws properly. Nothing was needed except
stopping.

**So reading is a tap again and the tile is back**, as `Read` with the question count under it,
opening `openSheet`. It was removed on the same wrong reading, called "a button that opened what you
were already looking at" — which it only was because of the line above it. The other half of that
complaint was fair and is fixed too: the old tile said `HTML` over a `<>` glyph, which reads as a
developer's view of the row rather than as "the questions are in here".

**`diagram` is a column and `figure` is not.** `figure` has been on the payload since it was
written and nothing has ever drawn it — it is 253 one-word labels (`venn`, `scatter`, `grid-blank`,
31 of them) saying which KIND of picture a row wants. `diagram` holds the picture, as inline SVG:
committed beside the question so the two cannot separate, where a URL is a second thing that has to
stay alive and cannot take the page's own ink. `style.css` has had `.qpaper figure svg` and the
label classes (`.lbl`, `.num`, `.axis`, `.grid`, `.pt`) since before anything could produce one.
Two rows carry a diagram — both were already inline SVG inside their `html` and were moved, or they
would draw twice.

**Do not read `figure` as "a diagram is missing here".** It is two columns under one name and the
labels do not say which: `venn`, `scatter`, `pie-chart` mean the paper had a picture nobody
transcribed; `grid-blank` (20), `fractions` (30), `boxes` (10), `long-method` (7) mean the paper had
somewhere to WRITE THE ANSWER, and those questions are complete as they stand. A first version of
the renderer printed "not drawn yet" off that column and was wrong on about 120 questions — a
screenshot caught it and no check could have. Sorting them apart is editorial work on 253 rows.

**Three columns did not come.** `ticks_1`, `ticks_2`, `ticks_3` — 529 cells holding the handles of
real people, most of them children. They are stripped at source. A tick is a fact about a PERSON and
a document; it was never library data, and if it returns it returns in `Ledger`.

#### And then the tab itself was deleted, which took eleven things with it

**The tab can only be deleted once nothing in the code names it**, and the sharp edge is
`SCHEMA`: `ensureSchema` walks it and CREATES any tab it cannot find, so an entry left behind
rebuilds an empty `questions` tab on the next `?setup=1` — a decoy with the right headers and no
rows, which is exactly the shape of the fault that hid the real resource rows in another file for
months. `SCHEMA.questions`, `TAB.questions` and `WHERE.questions` are all gone, and `documents_()`
with them. **Only `questions` left.** `cheatsheet`, `boxers` and `fights` are still tabs of
`Library` and still read by `doGet`.

**Sixteen callers, and they were deleted rather than repointed.** Five of them WROTE to a document
row — and Apps Script cannot write to a file in git, so a repointed version would read the right
data, report success, and change nothing anybody could see. That is the worst outcome available
here, and it is the one "keep it working" would have produced.

| Gone | What it was | Why it could not survive |
|---|---|---|
| `updateResource`, `editResource`, `deleteResource` | the admin relabel form, both lookups and the soft delete | wrote a cell; a relabel is a commit now |
| `toggleTopicTick` + `tickRow`/`myTicks`/`tickCount` | three passes per document, stored as handles | the columns were stripped at source — see above |
| `redeem` + `countTicks` | a printed paper for 1,000 ticks | priced in something nobody can accumulate any more |
| `orderPrints` | priced a basket of prints server-side | **nothing ever called it** — see below |
| `refreshPageCounts`, `pdfPageCount`, `driveIdFrom` | the nightly page-count sweep and its trigger | wrote `pages` on a document row |
| `printPrice`, `canPrint` (backend) | what a print costs | the phone computes it; see the loss below |
| `ensureResourceIds`, `seedPastPapers`, `seedALevelPapers`, `dropOldALevelPapers` | 120 papers and every id | CLAUDE.md already said do not seed that tab |
| `resourceInUse`, `resourceFields`, `RESOURCE_GROUPS/OPTIONS/EDITABLE` | the form and the dropdown values it offered | the form is gone; one list, two readers, both gone |

**`orderPrints` was a door with no handle on either side, and that took measuring to find out.**
It was access-listed, priced from the sheet deliberately — *a total posted by a browser is a total
the client chose* — and published in `doGet`'s feature list. No version of the app has ever posted
to it: `cart-send` in `resource.js` is `toast('Checkout is the next thing to build')`. So the
basket is untouched by all of this. It is local, it still totals, and what is missing is a
checkout, which was missing before.

**What is actually lost, and it is worth knowing before rather than during.** A price computed on
the phone is a price the client can choose. `printPrice` lives in `find.js` and `library.js` now,
reading the same two config keys off `constants.vars`, so the figure has not moved — but whatever
takes payment will have to re-price server-side, and **the page counts it would need are in a file
in git, not in a cell.** Separately: a new paper arrives with no page count and cannot be priced
for print until somebody types one in, and a `?run=rename` no longer reaches the library at all —
that is now two jobs, the sheets and a find-and-replace over `data/questions.json`.

**`RENAMEABLE` lost its `questions` entry and the note is longer than the line was.** Leaving it in
would have been worse than removing it: `renameValue` does `read(TAB[name] || name)`, an unrouted
name comes back `{ rows: [] }`, and the rename would have reported success, changed the options
list, and left every paper spelling it the old way.

**Three migration ids stay spent.** `edexcel-maths-past-papers`, `drop-empty-alevel-papers` and
`edexcel-alevel-maths-past-papers` are remembered in script properties, so a NEW job given one of
those names would be marked already-done and never run — invisibly.

**The nightly trigger is still NAMED in `installTriggers`**, in the delete list only. A project that
already installed `refreshPageCounts` needs it removed; installing it again would book a nightly run
against a function that no longer exists.

**What was checked before publishing**, because the decision is irreversible: every Library tab
scanned against the Ledger's handles (only the tick columns matched), and the 1,508 Drive links
sampled for sharing — `anyone: reader`, already public by link, and already served to anonymous
visitors by the payload. Publishing the ids exposes nothing the site did not.

**`libraryInto_` is not a second `doGet`.** It is the same two blocks, moved: the rows they read no
longer reach the backend at all, so there is one implementation. The shapes are exact down to the
key names, because `allTopics`, `paperBody_`, `paperText_` and every facet were written against them.

**The payload went 3.6 MB → 452 KB**, measured, and the file it replaces is cacheable where a
payload never is. `index.html` starts both requests in parallel; `load()` merges them before `DATA`
is wrapped, so `missingKeys()` is not told about two keys on every load.

**The fixture no longer holds `questions` or `checklists`.** `check/ui.js` serves the repo, so the
real file wins and anything a fixture said about them was overwritten a moment later — a fixture key
that silently does nothing is the fault the suite exists to catch. The library is committed data
now, so it is as fixed as the fixture ever was.

The ids are in `FILES` in `constants.gs`, and `WHERE` says which file each tab is in. The tab
colours inside each spreadsheet say the same thing a third time — green written by the app, gold
read by it, grey read by nobody — so a tab whose colour and whose file disagree is visible without
opening it.

**`WHERE` replaced two maps and a default, and the default was the bug.** It was `ELSEWHERE` for
tabs in the subjects file, `HERE` for tabs renamed in the main one, and anything in neither fell
through to `SPREADSHEET_ID`. That is fine with one main file and a trap with three: a name nobody
routed still resolved to a real file, found no tab, and came back `{ rows: [] }`. **Five tabs the
backend reads existed in no file at all** — `resources`, `herd`, `map`, `landmark_parts`,
`post_votes` — and nothing anywhere said so. They are created now, empty, with headers from
`SCHEMA`, so they read as an empty tab rather than a missing one.

`sheetFor_` returns a blank id for an unrouted name on purpose. `read()` cannot tell that from any
other empty result and does not try; `check-tabs.js` and `checkTabs()` are what tell them apart.

### There is no `resources` tab. A document is a kind of row.

The resources tab held one row per document; `questions` held the questions inside 99 of them and
already carried about twenty columns copied off the document. They were one table written twice, so
they are one table now. **`kind` says which a row is** — `paper` is the document, `part` and `stem`
are the questions in it. 3,913 rows: 3,271 questions and **642 documents**, 202 with questions under
them and 440 with none yet, which is not a gap but the backlog written down.

**`documents_()` in `core.gs` WAS the filter, in one place.** `read(TAB.resources)` appeared in
**19 places** and every one of them called that instead, otherwise unchanged — it returned `read`'s
own shape, and `setCell` writes through `t.sheet` and `row._row`, so handing back a subset of the
rows still landed a write on the row it came from. Nineteen copies of `.filter(r => r.kind ===
'paper')` would have been nineteen chances to forget it and treat a question as a document. **It is
gone now** along with all sixteen callers that were left — see the deletion table above; there is no
tab under either name for it to read. Everything below this line is the history of how the two
tables became one, which is still the shape of `data/questions.json`.

**The ticks live on the `paper` row and only there.** Everything else about a document is immutable
and copies down to its questions safely — exam board, year, link, page count, 4,963 blanks filled.
A tick was not: it is a fact about a person and a document, `toggleTopicTick` wrote one cell, and
copying those columns down would give `P-1MA1-2306-1H` 31 rows that must agree while one of them is
written. **That difference is the whole reason `kind: 'paper'` is a row rather than a convention** —
it gives a document exactly one row to be written to, which is what it had when it was a tab.

**Documents are keyed on `paper_id`, and keying them on `resource_id` was a real bug in the build.**
Two id systems meet on this tab: 29 papers have a `paper_id` that IS a `resource_id`, the rest use
the `R0001` series and match only through the URL. Keying on the resource put a covered paper's
document row under the resource's id while its questions carried `paper_id` — **93 papers ended up
with questions and no document row** to hang a link or a tick on. The questions decide the key,
because they are what points at it.

**`SCHEMA.resources` was deleted rather than left empty, on purpose.** `ensureSchema` walks `SCHEMA`
and CREATES any tab it cannot find, so an entry left behind would quietly rebuild an empty
`resources` tab on the next `?setup=1` — a decoy with the right headers and no rows, which is the
exact shape of the fault that hid the real rows in another file for months.

`doGet`'s questions push skips `kind: 'paper'`, or 642 documents arrive on the Find screen as
questions with no text, no marks and no answer. They reach the app as the checklists instead —
which went from **0 topics to 101 for a student and 642 for an admin**, having built nothing from
nothing for as long as the tab was empty.

`check-columns` caught `day` on the way through: it lived only in `SCHEMA.resources` and the
checklist still reads it. Kept as a column rather than dropped from the read — a past paper is often
a month and a year with no day at all.

**It did NOT catch `link`, and that is a gap in the check rather than bad luck.** The resources tab
called the URL `link` and the questions tab calls it `source_url`. Folding the two left **seven**
reads of `r.link` on rows that no longer have one — the checklist push in `doget.gs`, the page
counter in `content.gs`, five places in `setup.gs`. Every checklist topic would have arrived with no
link on it, which is the entire point of a resource, and nothing would have thrown.

`check-columns.js` compares every `r.<name>` against the **union of every tab's columns**, not
against the columns of the tab that row came from. `venues` and `trips` both have a `link`, so
`r.link` is a known column somewhere and the check was satisfied. The seven now read `source_url` —
one tab, one name for the URL.

### `node js/check-rows.js` — the same question, asked of one tab at a time

Built because of those seven. It parses the `.gs` files with acorn instead of matching them, binds
each row identifier back to the `read(TAB.x)` it came from (and to `documents_()`, while that
existed), and checks every
`r.<name>` against **that** tab. Both checks are worth running: **the union catches a column NO tab
has; this catches a column the WRONG tab has**, and the second is the commoner fault.

**The first thing it found was a live bug nothing else could see.** `avatarCatalogue()` in
`people.gs` read `r.price` off a **shop** row. The shop tab prices in three currencies —
`price_pence`, `price_ticks`, `price_coins` — and has never had a bare `price`, so `N(r.price)` was
`N(undefined)`, which is 0, on every row. **Every avatar item arrived costing nothing and flagged
`free`, including the seven that carry a `price_coins` of 15, 20 or 30.** Paid items, given away,
silently. `check-columns` was right not to report it: `price` IS a column — on `resources`, where it
means something else entirely.

**Scope is what makes it trustworthy, and the first version did not have it.** One binding map per
FILE reported **95 findings, nearly all wrong**: `dopost.gs` binds `r` to a `family` row in one
handler and a `people` row in the next, so the first binding was still standing when the second was
walked. Two fixes took it to 2, and both of those were real:

- **A scope chain**, pushed per function, so a binding made inside one dies with it.
- **A declaration always writes a binding, even when the right-hand side is unrecognised.**
  `const r = findPerson(…)` does not make `r` a row of anything — but leaving no entry lets the
  lookup walk outwards and answer with the handler above's row. "Nearest declaration made it
  something I do not recognise" is an answer, not an absence.

That second one is the subtle half and it is the difference between a check and a noise generator:
95 findings with 2 real ones in them is worse than no check at all, because the seven `r.link` reads
would have been sitting in that list indistinguishable from the rest. What it cannot trace — a row
arriving as a function argument — it does not report, and the summary says how many rows it managed
to trace (210) and how many reads it checked (888) rather than implying it looked at everything.

**How it was found, which is the part worth keeping.**
A fifth spreadsheet called "full pdf datbase" — set aside as "trash, disregard it" — turned out to
be the resources tab: 27 columns that are this tab's columns almost exactly, and **every one of the
166 `resource_id`s that `ticks` points at is in it**, with no orphans left over. The checklist
builder in `doget.gs` walks `TAB.resources` to build `dropdowns.checklists`, so it had been
producing nought checklists from nought rows for as long as the tab has been empty.

Three of its columns were new and are now on `questions`: `description` (a paragraph under the
`name`), `level` (GCSE / AS / Alevel — **not** `level_required`, which `doget.gs` reads with `N()`
as a membership NUMBER, and merging the two would have read "GCSE" as 0 and shown a paywalled paper
to everybody), and `paper` (which paper of the set — 1, 2 or 3). One column was dropped: `html`,
empty on all 559 rows.

**`resource_id` on a question was the join, and it was already there unseen.** Every one of the 99
distinct `source_url`s on the questions tab is also a `link` in that file; no link points at two
documents and no paper resolves to two of them. 1,745 of 3,271 question rows resolve, 102 of 202
papers — which is what made folding the two tables together an observation rather than a guess.

**538 of the 559 rows came across with `active` FALSE**, and `doget.gs` does `if (!live &&
!viewerIsAdmin) return;`. The 21 that are true are the most recently added, so this reads as a stale
default rather than a decision — but it is data, not a bug, and flipping it is editorial. A student
currently sees 101 documents (those 21, plus the 80 papers whose questions are live) against an
admin's 642.

Also empty, in case any are meant not to be: `kinds`, `widgets`, `laws`, `rooms`, `trips`, `orders`,
`invites`, `messages`, `exams`.

**`shop` was never broken, and I said it was.** There is a `HERE` map — now folded into `WHERE` as
`alsoTry` — that resolved `shop` to the tab actually called `items&shop`. I checked `TAB` and
`ELSEWHERE`, found no `shop` tab, and reported 62 rows of stock as unreachable. They were always
reachable. **A resolution path has three maps in it and reading two of them is not reading it**;
`check-tabs.js` exists partly so that this question is answered by something that reads all of them.

### SCHEMA against the LIVE SHEET is a third question, and it found two things

`check-columns` asks "is this a column of any tab". `check-rows` asks "is it a column of THIS tab",
against `SCHEMA`. Neither can ask the one that matters most: **is it a column of the actual
spreadsheet**. `SCHEMA` is the code's belief about a tab and the tab is the thing that is true —
this file already says so about `SCHEMA.questions`, and it happened twice more.

**`landmarks` is broken and has been.** The code reads `r.width_m` (×4), `r.depth_m` (×4),
`r.height_m` (×3), `r.colour` (×6), `r.shape` (×2), `r.landmark_id` (×2) and `r.roof` — **not one
of those is a column of the sheet.** The tab has `w`, `d`, `height`, `wall_colour`, `roof_colour`,
`id`, `form` and `roof_shape`, and the code reads none of them except `id`. So every landmark
arrives with width 0, depth 0, height 0 and no colour. Both checks pass, because `SCHEMA.landmarks`
faithfully describes a tab that does not exist. **The sheet is right and the schema is the thing to
change** — 22 reads and one schema entry, not a spreadsheet edit.

**`terms` is two different tabs sharing a name, and it degrades quietly rather than breaking.**
`SCHEMA.terms` describes SCHOOL terms — `term_name`, `start_date`, `end_date`, `last_sunday`. The
tab in Settings holds LEGAL documents — `docid`, `audience`, `version`, `mustsign`. I first read
this as the booking calendar being empty. **It is not**: `termsFor(y)` COMPUTES the year's terms and
uses the tab only to override them, `have[norm(c.name)] || c`. With the wrong tab `have` is empty
and every term falls back to its computed default, which is why nobody has noticed. What is lost is
the ability to correct a term's dates by hand.

**So do not run `?setup=1` against `terms` without thinking.** `ensureSchema` only ever ADDS, which
is normally what makes it safe — here it would add nine school-term columns to a legal-documents
tab and leave something that is neither.

Smaller, and all the same shape: `facts` is missing `sort_order` and `notes`; `jobs`, `boxers` and
`links` carry columns (`tutor_a_status`, `client_1`, `image_credit`, `visibility`) that `SCHEMA` has
never heard of. The last kind is harmless — the sheet knowing more than the code costs nothing.

**`SCHEMA.questions` was ten columns behind the real tab** — `source_url`, `pages`, `price`,
`currency`, `level_required`, `trackable`, `printable`, `pages_checked`, `company`, `topics`, all
present in the sheet with values in them. Two things fell out of that. `company` is read by
`allTopics` to build the `Company` facet and `doGet` was never sending it, so every worksheet in the
library looked like it came from nowhere; it sends it now. And `topics` is a column I asserted did
not exist while writing something else — **the schema in the code is a description of the tab, and
the tab is the thing that is true.**

**`backend/people.gs` declared `childrenOf` twice and it is fixed.** Line 248 took a person row and
returned NAMES; line 282 took a parent id and returned ROWS; the second silently won. The two
callers wanted different halves — `doget.gs` passed an id, `dopost.gs` passed a row — so
`out.kids` had been an empty list for every parent on every sign-in, for as long as both existed.
Nothing failed and nothing said so. The row version is `childNamesOf` now, named for what it returns
rather than what it takes, because two functions one letter apart would be the same trap with a
longer fuse.

**Six actions identified a person by their display name alone**, and `node js/check-post.js` is the
instrument. `findPerson(nameOrId, altId)` prefers the id and falls back to matching the NAME — the
fallback is right, it is what finds a row typed into the sheet before anybody has an id, and it is
why leaving the id out is invisible: everything works, for one person, until two share a name or
somebody renames themselves. `addPost`, `changePin`, `reactPost`, `saveScore`, `toggleTopicTick`
(since removed) and
`votePoll` all had `USER.personId` to hand and were not sending it. `changePin` was the sharp one:
the PIN you typed is checked against the OTHER person's, and you are told "That is not your current
PIN" — confidently wrong about the one thing you are certain of, with no way to change yours. Not a
way in, since the current PIN is still required; a denial rather than a breach.

The check asks **one** question it can be certain about: a handler that reads `body.personId` must
be sent one. A first version compared every posted key against every `body.x` in both directions,
the way `check-payload.js` does for `DATA`, and found twenty "read but never sent" of which most
were fine — a POST field is usually optional and the handler copes. A report that is mostly noise is
a report nobody reads.

`node js/check-backend.js` is the instrument for the scope, and it is the backend's `check.js`:
Apps Script loads
every `.gs` into one scope exactly as the browser concatenates `js/`, so a name declared twice is a
name declared once and the loader decides which. A redeclared `function` is quietly wrong; a
redeclared top-level `const` is a SyntaxError that takes the whole project down at load, so the two
are reported apart. 164 functions and 90 values, each declared once.

---

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
- Version constants — `BACKEND_VERSION`, `DOGET_VERSION`, `DOPOST_VERSION`, `BOOKING_VERSION` — are
  compared on the **whole stamp**, so bump all four together or the You screen reports the untouched
  ones as "Not deployed".
