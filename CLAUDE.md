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
node js/check-payload.js         # every DATA key the site reads vs every key doGet sends
node js/check-booking.js         # the booking state machine, folded in Node
node check/ui.js                 # 9 screens x 4 widths x 2 visitors. Exits 1 on anything new.
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
