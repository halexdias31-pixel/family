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

## The app took itself down, and its own diagnostic was the thing that did it

**"The app did not load. None of its code arrived."** Reported from the live site, and it was not
true: the code arrived. The message is the app's own boot check, and what it used to do was wait one
second after parsing, and if `go` was not defined, run `document.body.innerHTML = …`.

**That destroys the markup.** Every screen, every pane, every element the deferred scripts are about
to paint into. So the app cannot come up underneath and replace anything — the note above it claimed
"a false alarm you can watch disappear costs nothing", and the false alarm is the page killing
itself half a second before its own code arrives.

**Reproduced, because a bug this expensive should not be argued about.** Served locally with a delay
added to each file in `js/`: at 900ms the app comes up fine; at **1400ms `go` IS a function, nothing
404s, and the body is wiped with nine screens destroyed.** A working app reporting itself as broken,
permanently, on any connection slow enough.

**The report itself named the cause.** The message lists missing files when it knows of any, under
"None of these arrived" — and that line was absent, so no file 404'd. Nothing missing, `go` not yet
defined: a race, not a fault.

**One second was always a guess, and the app outgrew it.** Twenty-five files, 492 KB of JavaScript
gzipped, 152 KB of stylesheet, and a 342 KB library fetched alongside. The number was chosen when
there were eighteen smaller ones.

### So it asks at the moment the answer exists

`window.load` **fires when every deferred script and subresource has finished.** If `go` is missing
then, the scripts really did finish and really did not define it — a fact rather than a race, true on
the fastest connection and the slowest alike. No number to tune, and nothing to get wrong when the
app grows another file.

- **The backstop is for the one case `load` cannot cover**: a request that never returns, so the
  event never fires. That gets "The app is still loading", which is the honest description of that
  state, and it keeps looking.
- **It never destroys anything.** The message is an overlay laid *over* the app rather than instead
  of it, and it is removed if the code turns up late — which is the exact case that caused this.
- **The count is read off `window.FILES`.** It said "one of the eighteen names" for as long as there
  were eighteen and went on saying it at twenty-five, which is the same fault this file records about
  the session hook's "all 18 checks pass".

**Proved in all four directions**: nothing broken → silence; one file 404s → the banner names it;
every file 404s → the overlay, over an intact page; a slow link at 0/900/1400/2500ms → the app comes
up every time.

### `.nojekyll`, one empty file, closing a trap nobody had hit yet

GitHub Pages runs Jekyll by default, and **Jekyll silently drops any file or folder beginning with an
underscore**. `js/_scope.js` exists. It is not in `window.FILES`, so nothing is broken today — but a
file starting with `_` that ever joined that list would 404 in production and work perfectly
everywhere else, which is the worst shape a bug can have. One empty file at the repo root turns
Jekyll off entirely.

## Messaging had a working half and a door with no handle

**Measured across the app**: of the four message actions, `messages` (the read) had one caller and
`sendMessage`, `readMessage` and `flagMessage` had none. The backend has had the whole thing since
messages were built — a role policy, a five-minute gap, a 2,000-character cap and an email to the
recipient — and no version of the app had ever posted to it. **This is `orderPrints` again**:
access-listed, published in the feature list, never called.

**The note in `me.js` said where the missing half belonged and it was right**: *"there is no picker
for WHO — that belongs with the roster, where the people you are talking to are already on screen."*
A tutor's pass IS the picker. The `Message` tile is on it; the sheet names the person, takes the
text and posts. Nothing is typed, searched for or guessed.

**By id, not by name**, and the backend had to change for it: `doGet` sent a tutor's display name
and an array position and no `person_id`. `findPerson` falls back to matching the name — right for a
row typed into the sheet before anybody has an id, and silently wrong the day two tutors share one.
**On a private message that is not a denial, it is a disclosure.** Publishing the id costs nothing:
every action checks the signed-in user, `mayMessage` checks the roles, and `handle` has been public
in that payload since it was written.

**`readMessage` is called now too.** `messageThreads_` counts a message unread when it has no
`read_at`, and only the server writes that cell — so the badge beside a conversation could only ever
have gone up. A count that never falls is decoration within a day.

**The role policy is not repeated on the phone.** `MESSAGING` in `constants.gs` is the rule — a
student may reach an admin and nobody else, parents cannot write to each other — and copying it into
the app is two rules to keep in step, which is the fault recorded here under `kinds`, under
`link`/`source_url` and under `childrenOf`. The sheet shows the server's own sentence, which already
says what to do instead.

### `node js/check-replies.js` — a refusal reported as a refusal

**I posted it through `api()` and it told somebody it had worked when it had not.** There are two
ways to post: `api()` resolves with whatever the server said, `{ error: … }` included; `send()` is
the same request and throws on an error. Both are right for something — a read, or a
fire-and-forget, wants `api`. **A caller that is about to say "Sent" wants `send`.**

Stubbing a refusal showed it: the sheet closed, what had been typed was thrown away, and a toast
said *"Sent to Ada Tutor"* about a message that was never written. **Nothing in the app would have
shown it** — the backend's refusals are the one thing a happy path never reaches, and all four that
`sendMessage` can give are real.

**`loadMessages` had the same fault and its own comment described it**: *"an unreachable backend is
not the same fact as an empty inbox, and showing the second for the first is how a network blip
reads as everything having been deleted."* Through `api()` a refusal resolved with no `messages`
key, `|| []` made it an empty list, and it reached that guard as a success.

**So the rule is narrow enough to be certain about** — the `check-rows.js` lesson, where the first
version had 95 findings and 2 real ones. One question: does an `api()` call have a `.then` that says
success (`toast()`, `closeSheet()`) without the reply being examined for an error anywhere in that
handler? Everything else is left alone. **Proved both ways on the bug that prompted it**, and it
finds nothing else across the app — which is the answer, not an empty check: 23 `api()` callers, and
the one that made a claim was mine.

## The card got wider, and the room came from the edge rather than the gap

**`CARD_W` in `shell.js` is the universal width.** Every widget, every card, every page on every
screen sits inside `.page`, which is `var(--card-w)`; widgets have no width of their own. One
number, one place — so "make the widgets a bit wider" is one constant.

**There are only two places the extra width can come from and they are not equivalent.** Across the
screen sits an edge, a gap, the card, a gap, an edge, and `2 × EDGE_SHOWING + 2 × gap + CARD_W = 1`.
Take it from the gap and the cards close up on each other, which is the one outcome that looks
broken rather than merely tight — `stepX_` refuses it outright. **Take it from the edge and you see
slightly less of the neighbour**, which still does its whole job: that edge exists to say "there is
another one of these beside you", and 6% of a phone is 23px.

So `CARD_W` 0.80 → 0.84 and `EDGE_SHOWING` 0.08 → 0.06, **gap unchanged at 2%**. Measured at the
four widths the checks use: 256 → 269 at 320px, 312 → 328 at 390px, and 329 → 345 wherever `--app`
caps the column at 26.5rem. `check/ui.js` reports nothing new across 88 combinations.

**The CSS fallback had to move with it.** `.page { width: var(--card-w, 84%) }` is only what is
drawn before the script runs — but if it disagrees with `CARD_W`, the first paint is one width and
every one after it is another, which reads as the app flinching as it opens.

**And the prose above those constants named 88% and 4% while the code said 80 and 8.** Both pairs are
self-consistent, so nothing was broken and nothing could have caught it — a sentence that stopped
being true when the numbers under it changed. It describes the shape now and names the numbers once,
which is the only version that cannot go stale. Same fault as "all 18 checks pass" and "one of the
eighteen names".

## Checking your work

**The checks now run themselves.** `.claude/settings.json` registers a `SessionStart` hook —
`.claude/session-start.sh` — which installs the check dependencies if `node_modules` is missing,
then runs the whole suite and prints one of two lines: `all 25 checks pass`, or the failures under
**`CHECKS ARE RED ON ARRIVAL — this is not something this session did`**.

**That second sentence is the point.** Every check here was good and none of them ran unless
somebody remembered; the failure mode left was starting work on a repo that was already broken and
spending the session unable to tell which half was yours. Seventeen seconds buys an unambiguous
baseline — a red after that is the thing you just did.

**It exits 0 whatever happens**, deliberately: a hook that refuses to start a session is a hook
somebody deletes. It reports and gets out of the way. It also prints the branch, the head commit,
and how many files were already uncommitted before you arrived.

**Tested in both directions**, because a check that cannot fail is not a check: an undeclared name
added to `js/core.js` produced `2 of 18 checks found something wrong` and 25 of 27 broken journeys;
removing it went back to green.

**The count is read off the run, not typed into the sentence.** It said "all 18 checks pass" for as
long as there were eighteen, and went on saying it when there were twenty-two — a number in a
sentence nobody re-reads. The hook counts the `PASS`/`note` lines now.

### Three checks existed and none of them ran

`check-lifecycle.js`, `check-spine.js` and `check-surfaces.js` were written, committed, and left out
of the roster in `check-all.js`. All three pass, and all three had been passing in silence — this
file even cites `check-spine.js` finding two missing receipt rows "the first time it ran", which was
also the last time anything ran it.

**The roster is the only thing that makes a check real.** This is the `check-booking.js` fault in a
different costume: there, a check that could not find its subject printed "nothing to check" and
exited 0; here, four good checks sat on disk and were never invoked. Adding a file to `js/` does not
add it to `npm run check`.

### `node js/check-library.js` — the data, which nothing had ever read

Every other check reads the CODE. `data/questions.json` was 4,264 rows and 2.4 MB of committed
content when this was written — the library the whole Find screen is about — and **no check had ever
opened it**. It grows every time a paper is transcribed, so take the number off the file
(`node -e "console.log(require('./data/questions.json').length)"`) rather than off this sentence. A wrong
row does not throw and does not fail a build; it is simply a question somebody is taught wrongly.

What it refuses, each drawn from a mistake made or nearly made:

| | |
|---|---|
| **the shape** | line 1 a bare `[`, last line a bare `]`, and **each line parsed on its own** |
| **row ids** | present, and unique — a repeat silently replaces a question |
| **`ticks_*`** | never, in any spelling. See below |
| **orphans** | a question naming a `paper_id` with no `kind:'paper'` row can be found and never opened |
| **80 marks** | every Edexcel 1MA1 Higher paper, by definition of the qualification |
| **the vocabulary** | a closed list per facet column; anything else fails |

**The vocabulary is the one that prompted the file.** `exam_wave`, `tier`, `subject` and the rest are
FACETS — `facetFromSheet_` turns a column into a question the funnel asks, and every distinct value
becomes an answer somebody is offered. Transcribing the November papers I tagged them
`exam_wave: 'Resit'`, a perfectly sensible word, beside the `'Second wave'` this file had used for
exactly that meaning since before I arrived. Two answers, one meaning, and a filter that reads as
arbitrary. I caught it by looking afterwards, which is luck. Now a new value has to be added to
`VOCAB` deliberately, by somebody who has just read what is already in use — the same argument as
`ACCEPTED` in `check-payload.js` and `ACCEPTED_TAP` in `check/ui.js`.

**Two vocabulary entries are untidy and kept anyway**, with the reason written beside them, because
silently "correcting" content is worse than describing it: `exam_wave` carries both the words
(`First wave`, `Second wave` — the summer and November sittings) and ISO dates from an older import,
and `pages_checked` is a flag everywhere except one import that wrote a date into it.

**The tick rule is a disclosure rule, not a data-quality one.** `ticks_1/2/3` held the handles of
real people, most of them children, and were stripped when this file was built. This repository is
public and git history is permanent, so a tick column reappearing is not untidy, it is a leak. This
file already said so twice in prose; the check says it where it can act.

**It reports 14 questions the transcriber could not recover** — rows carrying an `examiner_note`
saying a diagram never came across, or that the text layer had flattened the maths past reading.
Every one is in `P-1MA1-2306-1H`, transcribed before the render-the-page-as-an-image method existed.
They are real questions being taught in a broken state and nothing surfaced them until now. Reported
rather than failed: it is editorial work on fourteen rows, not a build error.

**Proved in both directions, on six mutated copies** — a duplicate id, a stray facet value, a
returned tick column, a paper totalling 82, a file flattened onto one line, and an orphaned
`paper_id`. All six exit 1; the real file exits 0. **The one-line mutant is why the shape test parses
each line rather than checking its last character**: a whole file concatenated onto a single line
still ends in `}`, so the first version of that rule passed the very mutant written to catch it.
`node js/check-library.js <path>` takes a file to test against, which is the only thing that argument
is for.

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
node js/check-library.js         # data/questions.json: ids, 80 marks, the closed facet vocabulary
node js/check-funnel.js          # the real funnel over the real library: can each question narrow?
node js/check-const.js           # nothing declared `const` is assigned to. Two seconds.
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

### `node check/cards.js` — every question in the library, laid out. A sample is not a sweep

**`check/ui.js` had never rendered a question card.** It drives the real app through its own `go()`
and measures nine screens at four widths as two visitors — 72 combinations, on every commit, for as
long as it has existed. The Find screen opens on the funnel's *question*; the results are a strip of
pages filled five either side of where you are. So the app's largest surface, four thousand rows of
it, was never on the screen it was measuring.

**It cost exactly what you would expect.** Fifty-one questions carry the printed paper's dotted
answer line — the longest 128 characters with no space in it, which to a browser is one unbreakable
word — and every one took the card, the pane and the page sideways at 320px. `ui.js` measures
sideways scroll. It reported nothing, because the page it was on never happened to hold one.

**This is the `check-flow` stub in a third costume**: a check that cannot reach its subject
reporting a pass. The summary said 72 combinations and meant it; what it did not say is that 72
combinations is nine screens seen once each.

**Two fixes, and only one of them is the real answer.**

`check/ui.js` gains **declared states** — `STATES` at the top names, per screen, the states worth
measuring, each a name and a line of the app's own code. The Find screen now has two: the question
and the results. A state that does not arrive fails loudly (`expect` says what must be on the
screen), for the same reason the signed-in seed does. 72 combinations became 80.

**But that is still a sample, and widening a sample makes the odds better without making the claim
truer.** Measured: searching a common word gives 1,063 hits and puts SIX cards in the DOM, all from
the same worksheet. What is actually needed is to measure the **content** rather than the screen — a
question's markup either fits a 320px column or it does not, and that has nothing to do with which
page of the funnel you are on.

**So `check/cards.js` lays all 4,005 of them out in one page load**, in batches of 500, and asks one
question: is anything wider than the column. No navigation, no lazy fill, no app. **Proved both
ways**: with `overflow-wrap` removed it names 47 rows and exits 1, up to 199px past the column; with
it, zero.

**It must not grow into a second `ui.js`.** That one owns the app — navigation, tap targets,
contrast, the parked screens, who is looking. This owns the library, at one width, with one
question. The line between them is whether the answer could change when somebody edits a cell.

### The dead end came back once the collection door was gone, and the cap was the wrong tool

**Six chips deep with School year skipped: 1,070 questions, `Topic` holding 45 answers, and the
screen saying "Nothing left to narrow."** Every other facet exhausted, and the one that was not
barred by `FACET_MAX_ANSWERS` — a question about the only thing left, refused for being five answers
too long. The collection line used to paper over this ("or the 48 topics these are in"); with that
gone, the dead end is bare.

**The cap is right and it is about READING, not about narrowing.** `field: name` is 212 paper names
and nobody chooses from 212 buttons. What was wrong was treating "too long to read all at once" as
"not a question" — two different problems with different answers. The first is solved by showing
fewer; the funnel was solving it by showing none.

**So `overFacet_` is the last resort**: when nothing qualifies, take the over-sized question with
the FEWEST answers — the one closest to being an ordinary question — and draw the biggest forty.
Biggest first to choose them, alphabetical to show them, because which forty is a question about
size and the order is a question about finding one. The rest get a line pointing at the search box,
which is on the same page and filters the same items.

### Three faults found by pointing the existing measurement at a screen somebody is actually on

**The Find screen's first question is "What for" and its answers are one word each.** So every
answer row `check/ui.js` had ever measured was `Learning`, `Shop`, `Games` — the row layout proved
against the shortest labels in the app and nothing else. Adding one state, six answers deep, on the
path from the complaint:

- **The filter chips are 38px.** `min-height: max(38px, 2.3rem)` — the root is `clamp(13.5px, 3.8vw,
  16px)`, so 2.3rem is 34px and the `max` never once chose the rem. **This is `.btn.tiny` exactly,
  and the fourth conviction of that rule** after `.post-act` and `.fm-adds label`. It survived
  because in the state the screen opens in there are no filters, so there are no chips: 63 known tap
  targets, four widths, two visitors, and the control that removes a filter was in none of them.
- **The answer labels were clipped, not wrapped.** Taking the counts off left `.k` the only child of
  its row, and `.row .k` is `flex: 0 0 auto` — right for a two-word label beside a value, wrong for
  the answer itself.
- **And a check I wrote for that second one was inert.** I assumed rule 1 could not see it, because
  an inline `<span>` has no `clientWidth`. Wrong: the span pushes its parent `.row`'s `scrollWidth`,
  and `.row` is an ordinary block — 23 findings, up to 84px, the moment the fault goes back. My new
  rule fired zero times on the fault it was written for. **Deleted.** A check that cannot fail is
  not a check, and one that cannot fail while carrying a confident comment about what it protects is
  a green light with nothing behind it.

**What was missing was never a rule. It was a state.** No amount of new measuring code would have
found any of this — only pointing the measurement that already existed at the screen somebody is on.

### Can the app be built so that reading the code is enough?

Partly, and this session is an honest measure of which half. **What a reader can settle, a check
already settles**: a name used and never declared, a handler with no door, a column read off the
wrong tab, a `const` assigned to, a facet that cannot narrow. Twenty-five of those now run on every
session start.

**What a reader cannot settle is what happens when two correct things meet.** Three faults this
session, all from valid code that read fine:

- **the coins overlapped.** Valid SVG, no overflow, nothing to read. The viewBox scaled at 0.60 put
  a 5p at 5px across, and the browser stretched it to 20rem so a 13px label was three times the
  width of its coin.
- **every diagram rendered at a different scale.** `.qsheet figure svg` is `width: min(100%, 20rem)`,
  so the viewBox width IS the scale. Three coins came out enormous and two price tags unreadable, on
  one screen, from one stylesheet. Nothing in either file is wrong.
- **51 dotted answer lines took the page sideways.** A legal string in a legal box.

**So the lever is not static analysis — it is to replace emergent properties with declared ones, and
to make the lab see more.** The scale fault is now impossible because every drawing lays out inside
one constant, `W`; that is a rule a reader can check. The dotted line is now caught because
something renders all four thousand rows. **Both are the same move**: take a fact that was only true
by accident of interaction, and give it somewhere to be stated and somewhere to be tested.

**A screenshot is still the last word on a drawing**, and this file has now written that sentence
three times — `.mat-face`, `.mat-out`, and the coins. What changed is that it is the last word on
fewer things.

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

### `check-flow.js` could not read a reply, so no write's success path had ever run

**Every POST in every journey rejected, and nothing said so.** `api()` in `shell.js` reads
`r.text()` and parses it second — deliberately, because an Apps Script error page is HTML and
reading it as text first is what turns `Unexpected token '<'` into the sentence the server actually
said. The fetch stub in `boot()` answered a POST with `json()` **only**. So `r.text` was
`undefined`, the promise rejected with a TypeError, and the `.then` of every write in the app was
unreachable from the harness.

**It lasted because the journeys assert on the wrong half.** `sent` is filled in by the stub
*before* it answers, so it is populated whether or not the reply can be read. "A class books
through `joinWaitlist`, a session through `createJob`" passed for as long as it has existed while
proving only that the request left the phone. What the app does with the answer — the toast, the
reset, the reload, every `.then` in `receipt.js` — had never executed once.

**Found by asking what is on the screen after a booking is sent**, and getting the same screen as
before. The stub answers both shapes now. All 28 journeys pass with the success paths actually
running, so nothing was depending on the rejection.

**This is the `check-booking.js` fault again in a different costume**: a check that cannot reach its
subject reporting a pass. There it was a path to `backend/` and an exit 0; here it is a missing
method on a stub. Both say "I checked and it was fine" when the honest answer is "I did not check".

### The booking widget comes back under the form once it is sent

**Pressing send emptied the screen.** `resetBooking_()` clears every answer and `load()` fetches the
new job, so the page somebody was looking at a second earlier went blank and a toast was the only
evidence anything had happened. The session was real and two swipes away under
`Booking · Receipts`, which is not where a person looks immediately after pressing a button.

`ASKED_JOB` in `book.js` holds the id the backend answered with — all three send paths return one,
`createJob`, `joinWaitlist` and `openWaitlist` alike — and `askedBlock_()` draws that job's receipt
below the booker. `jobReceipt` is the same builder the session sheet uses, so the two cannot drift.

**One job, not a list, and that is the whole care.** `bookBlocks` used to draw every live job under
the form, and the note above it says why that went: the funnel already has a searchable list of
them, and a page holding both is the duplication this file has produced twice. A confirmation of the
thing you just did is not that list.

**Below, not beside.** Each element of `bookBlocks()` is a page somebody swipes to, so a receipt
returned as its own element would be "somewhere else" again — the same fault wearing a different
shape. The journey checks the page COUNT as well as the markup.

**It is looked up every draw rather than kept as HTML**, so `Stage` says where the booking has got
to now: an admin accepting it while the family still has the page open moves that row from
"Asked for — waiting on us" to "Accepted — waiting for payment" on the next `load()`. It is in
memory, so a reload drops it — right for a confirmation, and nothing to keep in step.

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

### The rest of `Library` is following it, in two steps because the sheet is unreachable

`boxers`, `fights` and `cheatsheet` are the three tabs left in that file, and they pass the same
three-question test `questions` passed. **The one that decides it is the second**: measured,
`read(TAB.boxers)`, `read(TAB.fights)` and `read(TAB.cheatsheet)` appear **exactly once each, all
three in `doget.gs`**, and no `setCell` or `append` anywhere names them. Nothing writes to them, so
code can hold them.

**Step 1 is done and step 2 needs you.** The rows are in a Google sheet and every Google host is
blocked from the agent's environment by network policy, so this could only be built, not populated:

| | |
|---|---|
| `data/boxers.json`, `data/fights.json`, `data/cheatsheet.json` | committed, currently `[]` |
| `libraryExtras_` in `js/library.js` | the three mappings, copied from `doget.gs` line for line |
| the fallback | **a file with no rows leaves the payload's copy alone** |

So the app is byte-identical today, and the moment a file has rows in it the file wins. **Cutting
the backend first would have taken the boxing screens and the cheat sheet dark** for however long
the export took, over a migration nobody was waiting on.

**The files hold the sheet's own column names** — `boxer_id`, `height_cm`, `part_id` — not the
camelCase the phone reads. A file that is a faithful export is one you can paste a row into without
translating it, and the single place that renames a column is the mapping. Two spellings in two
places is what `r.link` against `source_url` cost: seven silent reads.

**`check-library.js` says when step 2 is due** rather than leaving it to memory: once a file has
rows AND `doget.gs` still builds that key, it prints that the block should go. Until then it only
enforces the shape, which is the same one-object-per-line rule `questions.json` has and for the same
reason — the next script to append by splitting on newlines.

### `d = libraryInto_(d, …)` had been throwing on every single load

`d` is `const` — `const d = await res.json()` some forty lines above — so that line threw
**"Assignment to constant variable" every time `load()` ran**, and the `try` around it swallowed it.

**Nothing looked wrong, which is why it survived.** `libraryInto_` **mutates** `d` and returns the
same object, so the questions were already written by the time the assignment was attempted; the
throw came *after* the useful work, and the catch's own repair — `d.questions = d.questions || []` —
found the key populated and left it alone. A correct fallback standing over a broken line, which is
the same shape as the `check-flow` stub with no `text()` and as `.mat-out` being "fixed" twice on a
measurement nobody took.

**What it cost was that nothing after that line inside the try could ever run**, and while the line
was last in its block that was invisible. The three extra library tabs were the first code to sit on
the next line and they simply never executed — found by booting the app with a row in
`data/boxers.json` and watching the payload's copy win anyway. The fix is to drop the assignment:
both functions mutate in place, so the return value was never needed.

### `node js/check-const.js` — the rule, not just the instance

Within **one function body**, a name declared `const` and later assigned or incremented. Narrow on
purpose, and the narrowing was learned twice in one sitting:

- **The first version reported ~90 findings and every one was wrong.** It gathered the bodies
  correctly and then walked each with the ordinary walker, which descends into nested functions — so
  the top-level pass collected every `const` and every assignment in the whole file and matched them
  across scopes. It "found" a `const` declared at line 552 assigned at line 153, four hundred lines
  earlier, in a different function. **That is the `check-rows.js` fault exactly**, and CLAUDE.md
  already says what 95 findings with 2 real ones in them is worth.
- **Scoping the walk left three, and all three were still wrong**: `for (let k = 0; …; k++)` beside
  a separate `const k` further down. Different blocks, different bindings. Getting that right
  properly needs a block-level scope tree, so instead **it declines to answer**: if a name is also
  declared `let`/`var` (or is a parameter) anywhere in the same function, it says nothing. A missed
  case is an incomplete check; a false one is a check nobody reads.

**Proved by mutation**, which is the only thing that shows the exemption did not gut it: putting
`d = libraryInto_(…)` back makes it report `shell.js:2021 — d is declared const at line 1967`, and
removing it goes green across 26 files.

### `questions` lives in this repository, not in a spreadsheet

`data/questions.json` — 4,638 rows at the last count, 40 columns, 3.1 MB, one row per line so a
diff names the rows that changed. The count moves with every transcription; the shape does not.
`js/library.js` fetches it and builds `DATA.questions` and `dropdowns.checklists` from it; `doGet`
no longer builds either.

**Why that tab and no other.** Three questions decide where a thing lives, and the first one that
answers wins:

1. **Is it secret?** → a sheet, never here. This repository is **public**; anything committed is
   published, and git history is permanent. PINs, e-mail addresses, dates of birth.
2. **Does the app write to it?** → a sheet. Code cannot be written to at runtime.
3. **Do you edit it, or does Claude?** → `questions` is the one tab nobody hand-edits. It arrives in
   bulk, and every edit went export → CSV → download → File → Import, twice. `brand`, `config`,
   `pricing`, `facets` are the opposite and stay in Settings: you change them, and changing them
   must never need a deploy.

#### Which papers are in, and how a new one gets there

Thirty Edexcel GCSE maths papers are transcribed, **and they are not all named the same way** —
which is the trap, so read both rows of this table before starting a new one.

| ids | what is in them |
|---|---|
| `P-1MA1-<yy><mm>-<n>H` | 24 Higher papers: **2017, 2018 and 2019 complete** (both sittings, six papers each), **summer 2020**, **summer 2023** |
| `RS1786302107764-415…420` | the **June 2024** series, six papers — Foundation AND Higher, Papers 1, 2 and 3 |

**`node js/check-library.js` prints the count, and the list above is the thing that goes stale.**
The two id schemes are why: a session that listed `paper_id` prefixes, saw no `P-1MA1-24…` and
concluded 2024 was missing transcribed June 2024 Paper 1 a second time — 33 rows with fresh ids,
past every check in the suite, because nothing here knew what a real paper WAS. `check-library.js`
knows now; see "the same paper, transcribed twice" in that file.

Still to do: eighteen PDFs in the Drive folder named only by their Edexcel paper code. **Edexcel
took the exam date off the front page in 2021**, so for those a code is all there is — the © line
narrows it to a year and no further, because June and November of the same year both print the same
one.

**What names them is the PDF's own metadata.** `P68721A0128.pdf` carries `dc:title` = *"Question
paper - Paper 1H - November 2022"* and `/Subject` = *"Paper 1H - Non-Calculator (Higher)"*, and so
do its two siblings. Three papers identified from a field nothing in the reading pipeline looks at,
because the pipeline reads pages. **Check `r.metadata` and `r.xmp_metadata` before reading a single
page of a paper you cannot name.**

| code | what it is |
|---|---|
| `P68721A` / `P68723A` / `P68725A` | **November 2022** Higher 1/2/3 — stated in the metadata |
| `P64630A` / `P64632A` / `P64634A` | Higher 1/2/3, ©2021, no metadata title — **which 2021 sitting is not settled** |
| `P66305A` / `P66303A` / `P66381A` | Higher 1/2/3, ©2021, no metadata title — **same** |
| nine `S48…`/`S49…`/`S50…` | not yet opened; `S` is Edexcel's specimen prefix |

**The two ©2021 sets are an open question and guessing would be worse than waiting.** 2021 ran one
GCSE maths series (November); there are two sets. The InDesign version in each PDF's `/Creator`
splits them — 16.0/16.1 for the `P64` set against 17.0 for the `P66` set, and 17.0 was not released
until 26 October 2021 — but that dates the export, not the sitting. Filing thirty questions under
the wrong sitting puts a wrong answer on the funnel's `Sitting` chip and nothing downstream can tell.
The library holds empty document rows for November 2020, November 2021, June 2022 and November 2022,
and **their `source_url`s carry the real exam dates** (`1MA1_1H_que_20211103.pdf`), which is where a
comparison would have to start if the PDFs ever become reachable — they are on revisionmaths.com,
and the agent environment can reach GitHub and nothing else.

**Every number in a transcription is checked against the paper's own stated total**, which is 80 for
every one of these by definition of the qualification — `check-library.js` refuses a paper that does
not sum to it, and the insert script asserts it before writing a row. That single number catches a
dropped part, a misread mark count and a duplicated question, and it is the only end-to-end check
available, because nothing else knows what the paper said.

**The text layer is the enemy and it fails in four different ways**, each recorded here because each
cost a reading:

| | |
|---|---|
| **mangled maths** | fractions and radicals arrive as loose digits: `x x n n + = − − 1 22 4` is `x(n+1) = −2 − 4/x(n)²`, and reads equally well as a cube root |
| **a Caesar-shifted font** | `)DFWRULVH IXOO\` is `Factorise fully`. Obvious, and harmless once seen |
| **the same shift with the digits gone** | November 2017 Paper 2. The prose is readable and every NUMBER has silently vanished: "The pack costs 5" where the paper says £5.64. Nothing looks wrong |
| **a swallowed coefficient** | the worst, because the question still reads sensibly and is now a different question |

So: extract the text, then **render every page and read it**. A rough tell is size — about 13 KB of
text over 20 pages is a clean extraction and anything well under it is thin — but 16.5 KB has lost a
square root before now, and the last two failure modes leave the size untouched. The tell is not a
test.

**A picture that carries data is measured, not eyeballed.** Box plots, cumulative frequency curves,
pie charts drawn to scale: render at scale 5, find the gridlines by their regular spacing, and read
the marks off them. A cumulative-frequency curve read by eye gave 50 at 160 cm where the pixels said
48.1 — one gave the answer 10 and the other 12, and the gap between them was the whole of the mark
scheme's tolerance.

### The funnel is an engine fed by a hand-written loader, and that seam is where it feels arbitrary

Three layers, each half-generalised:

| Layer | The sheet can | The sheet cannot |
|---|---|---|
| **Items** — `stuffItems()` | nothing | everything. 11 hand-written mappers |
| **Kinds** — `KINDS` + the `kinds` tab | rename, regroup, reorder, switch off | **add one** — `card:` is a function |
| **Questions** — `FACETS` + the `facets` tab | relabel, reorder, set coverage, switch off | **add one** — `of:` is a function |

**You can edit the funnel from a spreadsheet; you cannot extend it.** Boxing cost seven places — a
mapper, `boxKind` invented, a `division` facet, `divisionOf_`, `boxerCard_`, a `KINDS` entry and a
comment explaining why the division is not in `subject`. Six of the seven are code. That is the
ducktape, and it is worth knowing it is structural rather than sloppiness.

**The next question is chosen by arithmetic over the current list, not by meaning.** `nextFacet`
offers the first facet with ≥2 distinct answers and ≥50% coverage — so the same data reached two
ways asks two different questions. Narrow to Maths and `Exam board` appears; add Boxing and it does
not, because half the list has no board. Nothing on screen says so, so it reads as the app changing
its mind. **`whyThisQuestion()` in the console prints every facet with its answer count, its
coverage and the reason it was or was not chosen** — the same instrument as `layout()`, pointed at
the funnel instead of the boxes.

### The arithmetic was incomplete, and that is what "the funnel feels unclear" was

`nextFacet` asked two things of a question — **are there at least two answers**, and **can at least
half the list answer it**. It never asked the third: **does answering it actually split anything.**
Three faults had accumulated in that gap, all of them invisible to twenty-two green checks, because
none of them is a crash, a missing name or a malformed row.

| | what it was |
|---|---|
| **`paper` / "Printed?"** | `questionItems` wrote `paper: true` on every item and this facet was its ONLY reader. Measured: **3,753 answered `Printed`, 17 answered `Digital`** — and those 17 were widgets, which have no such field. A literal, drawn as a choice, asked of everybody on every search. |
| **`exam_wave`** | **three spellings of one sitting.** `June 2018` from the old import, `First wave` / `Second wave` from the transcriptions. For 2018 the funnel offered both as separate answers: picking `June 2018` gave 16 questions and hid 151, with nothing on screen saying a second 2018 existed. |
| **`level` vs `stage`** | two columns, one meaning, two facets, **two different answer sets**. `A-Level` gave 135 items or 263 depending which question you were asked first — and it was spelled `Alevel`, `A-Level` and `A-Level` on one screen. |

**`paper` IS THE `cost: 0` FAULT, SECOND OCCURRENCE.** That entry is a few sections up: *"3,262 of
3,265 items answered `Free`, which made that bucket mean everything."* Both were fixed **in the
data** and neither was fixed **in the rule**, so the shape recurred — which is the whole argument
for `ACCEPTED`, for `VOCAB` and for every other list in this repo. A rule applied by hand is not a
rule.

**So the rule is written down now.** `FACET_MIN_MINORITY = 0.02`: unless at least one in fifty of
the items that can answer land somewhere other than the commonest answer, the question cannot
narrow and is skipped. **The test is on the minority, not the biggest answer**, and that distinction
is the whole of it — measured against the real library, `Subject` has Maths at 91.3% and `Level` has
GCSE at 93.9%, and both are worth asking because the 8.7% who want Physics get a real narrowing.
`Printed?` was not, because everything outside its biggest answer was 0.45% of the list.

**A share, not a count, because the list shrinks.** Nineteen-to-one across twenty items is a real
distinction between real things; the same split across four thousand is a rounding error with a
button on it. And it is **self-correcting like the coverage rule** — a question that cannot narrow
the whole library starts being offered the moment the list is small enough for its answers to
matter.

**`always: true` marks the two facets that are DOORS rather than filters**, and nothing else may
carry it. `What for` and `What kind` navigate — they take somebody from the whole app to a
department — and on this library `Learning` holds 99.5%, so the balance rule would have dropped the
app's first question on the floor. It would have been right about the arithmetic and wrong about the
job: hiding the door to the booking form because the question bank got big is the funnel getting
*worse* as you add content. Every other rule still applies to them.

**One sitting, one vocabulary.** `waveOf` already existed to collapse `2018-06-01` and `June 2018`
onto one button — its own comment says *"two ways of writing the same sitting are two DIFFERENT
buttons"* — and then a third spelling arrived that it did not handle. It resolves phase words
through the row's own `month` and `year` now, and **`seriesOf_` names the series rather than the
month**: Edexcel's 2018 summer papers sat on 24 May, 7 June and 12 June, so naming each by its own
month splits one series into `May 2018` and `June 2018`, which is two buttons for three papers every
student thinks of as one thing. Summer months become `June <year>` and autumn months `November
<year>`; anything else keeps its own month, because a January sitting was a real thing until 2013
and collapsing it would invent a fact.

**`levelOf_` reads whichever of the two columns has it** — `band_value` where `band_type` is
`stage`, falling back to the `level` column — and normalises the spelling. Naming the code facet
`level` rather than `stage` is what collapses the two questions into one: `facetList` treats a
`facets` row whose field is already declared in code as a *relabel* of that facet and one whose
field is unknown as a *new* question, so renaming it moved the sheet's row from the second pile to
the first. The sheet still owns the label, the order and whether it is asked at all.

### The funnel never asked what the maths was ABOUT, and that is the whole complaint

**Six chips deep it said "Nothing left to narrow" over 193 questions.** What for · Learning, What
kind · Questions, Subject · Maths, Type · Worksheet, Key stage · KS2, School year · Year 4 — and the
193 left were about eleven different things: fractions, area, roman numerals, telling the time.

**Every question on the way down was about where the question CAME FROM.** Subject, level, type, key
stage, school year, exam board, tier, publisher. Not one about what it is OF. That is "I click the
filters and then it just feels like it shows all of them", exactly: each tap took a real bite out of
the list, and none of them took the bite that was wanted.

**The column was already there and nothing read it.** `topics` is on 91.5% of the question rows and
has reached the browser on `row` since `libraryInto_` stopped enumerating columns — see "`row`
carries the whole row" above, which was written about this same shape. `topicOf_` reads it, a
`Topic` facet sits straight after `Subject`, and the comma in a cell is a list the way `keystage`'s
is. **A worksheet transcribed tomorrow is filterable the moment its `topics` cell is filled in**,
with nothing in code to edit and no deploy.

**Nothing new decides when it is asked.** 389 distinct topics is past `FACET_MAX_ANSWERS`, so it is
not offered at the top; almost nothing outside the library carries one, so its coverage is low until
the list IS questions. Both rules that keep it out of the way are the ones that were already there.
Measured, it arrives at the point the funnel used to give up: 193 items, 15 topics, 100% coverage.

**It is in the search box too**, which it had never been. `searchText_` reads the question's own
words, so `fractions` found a question only if the word was printed in it — and on a worksheet whose
every question is a fraction, the one place that says so is the `topics` cell. Measured: `fractions`
176 → 235 hits, `surds` 40 → 55. Built onto the item, not matched per keystroke.

#### The spelling is settled by a vote, because a list would go stale and Title Case invents words

**46 of the 389 topic values differ from another only by case** — `Linear Equations` (81 rows) beside
`linear equations` (4), `Histograms` (20) beside `histograms` (13). Two buttons for one topic is the
`Alevel` / `A-Level` fault in a new column, and `check-funnel.js` fails the build on it.

**Title Case was the obvious fix and it would have been wrong.** `HCF and LCM` title-cased is
`Hcf And Lcm` — a spelling nobody typed, invented by code, printed on a button. So the library
votes: every spelling is counted and the commonest wins for all of them, which can only ever pick a
word somebody actually wrote. **Only the first letter is raised**, because `estimation` outnumbers
`Estimation` in the file and the vote alone put a lower-case button in a column of capitalised ones.

**Not fixed in the data, for the reason `levelOf_` gives**: the rows are bulk-imported and will keep
arriving both ways, so a migration is something the next import undoes — and 4,000 committed content
rows edited to make a filter work is a diff nobody can review. Proved by mutation: switching the
vote off makes `check-funnel.js` name `Simultaneous Equations` / `simultaneous equations` and eleven
more; the real file is green.

#### "Doesn't matter", under every question

**"sometimes i just know its roughly ks2".** `School year` was the only thing on the screen after
Key stage, so somebody who does not care which year had a choice between answering it wrongly and
going no further — and picking Year 4 took 1,093 questions to 193, silently throwing away nine
hundred KS2 questions that were just as relevant.

`{ any: true }` **is a filter that filters nothing**, and that is the entire mechanism: it sits in
`STUFF.filters` so `nextFacet` moves on, and `stuffFind` skips it so nothing is removed. One entry,
two behaviours, no second piece of state. It is a chip like any other, reading `any`, with the same
✕ — a question silently dropped with nothing on screen saying so is the funnel "changing its mind"
again.

**On every facet, not on the one that annoyed somebody.** Every question here was compulsory and a
person narrowing a list knows some things and not others. Writing a rule for `School year` alone is
how the `cost: 0` fault came back as `paper: true`.

#### "Only the first collection" was right about the wrong thing

`stuffQuestion` drew `coll[0]` and nothing else, and the argument was sound: `paper_id` and `name`
are the same 202 papers by two columns, so offering both is offering one thing twice with different
numbers on it. **The rule written from that threw away every other axis as well** — with `Topic` in
the list, papers group harder (227 groups against 343) and won the sort, so the screen offered "the
227 papers these are in" and never "the 343 topics".

**So the folding moved to where it belongs and is measured rather than declared**: two axes are the
same collection when they cut the list the same way — the same number of groups holding the same
numbers of things. `paper_id` and `name` match on that exactly; `Topic` and `Papers` do not. It is a
signature and not a proof, and the cost of being wrong is the old behaviour.

**And "Nothing left to narrow" was not true.** It said it over 1,093 questions with 48 topics in
them, one line under a control offering exactly those 48 topics — the funnel had run out of
QUESTIONS, which is a different claim. It says which of the two it means now.

**What it costs**: the first draw of the Find screen went 65 ms → 88 ms and a search 32 ms → 43 ms,
measured over 4,045 items. That is one extra facet walked twice per filter change, not per keystroke.

### The collection line is gone, and a paper is an answer like any other

**Two ways of narrowing one list, stacked on one screen, is a pivot table.** `stuffQuestion` drew a
sentence above the funnel — *"or the 227 papers these are in"* — that turned the results into one
card per paper until you pressed it again. You had to know what it meant before you could use it,
and it named a thing the funnel could simply ASK about once the list was small enough.

**So `collect: true` came off `paperId` and the ordinary rules do the job better.** 227 answers keeps
the question silent at the top exactly as `FACET_MAX_ANSWERS` intends; narrow to one board, tier and
sitting and it is twelve, under the cap, and the funnel asks "which paper" as a plain question —
same chip, same ✕, same handler. Measured at the six-chip state: `Paper`, 12 answers, 100% coverage,
offered. **The name is shown and the id decides who answers**, because `P-1MA1-2211-1H` is a join
and the paper's name is on every one of its questions already.

`collectionAxes_`, `groupItems_`, `one_`, `plural_`, `STUFF.groupBy`, `on('group-by')`,
`on('group-open')`, the `group` tile in `tiles.js` and `.stuff-coll` are all gone. **The arithmetic
in them was right and is kept in prose** where they were: one distinct value per row identifies a
row, ~16 rows each is a collection, 654 rows each is a category, and the boundary between the last
two is the same constant.

**Two other things went off that screen for the same reason.** The count beside each answer — it was
defended as "the thing doing the work", and that is true of a list you are deciding between and
false of this one: four digits wide, changing on every tap, and never the reason you pick a topic.
It is still computed, because `facetSplit_` is a share of those counts and that is what keeps a
useless question off the screen. And the credits card, which was a balance on the app's front door;
nothing on the Find screen is spent.

### The Find screen was slow because it walked the same list twenty-one times

**Measured, first draw at 4,045 items: 200 ms.** Where it went, and all four are the same mistake —
work repeated that could not have changed:

| | |
|---|---|
| `collectionAxes_` | **71 ms** — every facet tallied over every item, to draw one sentence |
| the sort | **88 ms** — four `localeCompare` calls per comparison, ~200,000 of them |
| the facet rules | **3 walks per facet**: `facetValues`, `facetCoverage`, `facetSplit_`, each its own pass |
| `stuffItems` | **33 ms rebuilt on every keystroke**, and nothing in it reads a filter |

**`facetTally_` walks once and answers all three**, because they are three readings of one count:
the keys are the answers, the number of items contributing a key is the coverage, and the share
outside the biggest key is the split. The three old functions are thin readers of it, so every
caller — `check-funnel.js` included — is untouched. Held in a `WeakMap` on the items array itself:
a new list is a new array, so there is no key to get wrong and nothing to invalidate.

**`sortKey_` bakes the order into one string per item** and the comparator becomes `<`. Case folded
and every run of digits zero-padded to eight, which is what `numeric: true` does — so "Paper 10"
still sorts after "Paper 2". Cached on the item, so a second sort of the same items is free.

**`stuffItems` is memoised on `DATA`, admin, and which person you are** — the only three things any
mapper reads. That is also what makes the sort keys worth caching: rebuilding the items every call
was throwing that cache away at the rate it was filled.

| | before | after |
|---|---|---|
| first draw, cold | ~200 ms | **50 ms** |
| answering a question | ~200 ms | **15–28 ms** |
| a keystroke | ~40 ms | **5–9 ms** |

**And a dead reader that was not a bug, which is the part worth keeping.** The sort's second and
third terms read `qNumber` and `qPart`, and nothing has written either since the paper card was
deleted. I read that as Q1, Q10, Q11, Q12, Q2 down every paper — and went to measure it before
writing it down. It is not: `cmpText` carries `numeric: true`, so the LAST term, on the name,
already put Q2 before Q10. Identical order on both versions, 32 parts, checked both ways. **A dead
reader standing over a live one** — the same shape as `d = libraryInto_(…)`, where the broken line
came after the useful work and a correct fallback hid it. The fields are written again because the
key is built from them, not because anything was broken.

### One answer, one button — the spelling fault, fixed as a rule instead of a fourth time

**It has arrived in four columns and been repaired by hand in three.** `level` (`Alevel` / `A-level`
/ `A-Level`, fixed in `levelOf_`), `exam_wave` (`June 2018` against `First wave`, fixed in
`waveOf`), `topics` (46 of 389 values differing only by case, fixed by a vote in `topicOf_`), and
`company` — `1stclassmaths` on 1,372 rows against `1st class maths` on 109, invisible only because
the funnel lists questions and every question row used the first. **Each fix was to the instance and
none was to the rule**, which is this file's own sentence about `cost: 0` and `paper: true`.

**So it is two lines in the engine now.** An answer's IDENTITY is its letters and digits
(`spellKey_`); its SPELLING is whichever variant is most worth showing. `facetTally_` folds the
variants together *as it counts* — before, not after, because the coverage and the split that decide
whether a question is asked at all are read off those counts — and `filterHit` matches on the
identity rather than the text, so a chip saved as `1st Class Maths` finds a row that says
`1stclassmaths`. Measured: both spellings return the same 1,370 items.

**Which spelling wins, and every rule in it is about not inventing a word:**

| | |
|---|---|
| **the one a person would write** | most separators — `1st Class Maths` over `1stclassmaths`, `A-Level` over `Alevel`. A squashed spelling is a machine's; a spaced one was typed |
| **then the commonest, then the alphabet** | so a button's label never depends on the order the file is in |
| **first letter raised** | `estimation` outnumbers `Estimation`; a lower-case button in a capitalised column reads as a fault. Only the first letter — `HCF and LCM` stays as typed |

**The plain vote gets the first one wrong**, which is why it is first: `1stclassmaths` outnumbers
`1st class maths` twelve to one and is still not the publisher's name.

**It folds within the list on screen**, not against the whole library — `facetTally_` is already
walking exactly the items whose answers are about to be drawn. Narrowing cannot change which ITEMS
an answer holds; only which of its spellings is on the button.

**`check-funnel.js` test 2 can no longer fire and that is the point, not a loss.** It looks for two
values in one facet reducing to the same key, and `spellKey_` is that same reduction — the fault is
impossible now rather than detected. It is kept because it also guards the facets a spreadsheet
invents at runtime.

**`levelOf_` kept exactly one branch**: `AS level` → `AS`. That reduces to `aslevel` against `as` —
two identities, so no spelling rule can join them, and joining them is a fact about English exams.
**The engine folds spellings; a reader resolves meanings.** `waveOf` is on the same side of that line.

### Four things were wrong in the data, and one of them was a document read twice

**`company` was holding spec codes on 53 rows** — `9MA0-31`, `8700-01-01`, `7357-02-01`. Every one
also carries a real `exam_board`, so the code went to a new `spec_code` column and `company` became
the board. That column is not decoration: `8700` is AQA GCSE English Language, which is the next
thing going in.

**Five `W-CBM-` sets carried a 1st Class Maths attribution, and the id was the thing that was
wrong** — but that is not what they turned out to be. Five of the sixty-nine `W-CBM-` sets have a
`source_url`; the other sixty-four have none, and 81 of 82 `W-1CM-` sets have one. **The URL is the
1st Class Maths tell**, because that publisher's sheets are Drive files and Corbettmaths' are not.

**And for three of the five the URL was IDENTICAL to an existing set's** — the same Drive file id,
character for character. `W-CBM-reflections` (9 parts, terse) and `W-1CM-reflections` (15 parts,
carrying the sheet's own title) are one PDF read twice by two sessions at different granularity.
**I had compared the questions, found nothing in common, and reported "genuinely different
worksheets" — which was exactly backwards**: the questions differ *because* the two transcriptions
disagree about where a question ends. The fuller three are kept; the other three are deleted. The
remaining two had unique URLs and were simply mis-prefixed, so they are `W-1CM-` now, row ids and
all.

#### `check-library.js` — the document is the thing, and its URL is its identity

**The sitting key cannot see a worksheet.** It is built from subject, board, year, series, paper
number and tier, and a Corbettmaths sheet has none of those — which is how three duplicate
transcriptions sat in the library past every check in the suite.

**So two `paper_id`s pointing at one file is one document entered twice**, whatever either is called
and whatever the rows under them say. It needs no vocabulary, no id convention and no knowledge of
what an exam is, which is what makes it the test the sitting key should have been.

- **Compared on the Drive id, not the URL.** The same file is written `drive.google.com/file/d/<id>/view`
  *and* `drive.google.com/open?id=<id>&usp=drive_copy` on rows of the same set — two spellings of one
  address, the same fault in a third column.
- **Two papers with questions is a failure; a stub beside a transcription is a note.** 25 of the 28
  pairs are an empty `R0xxx` document row sitting beside the real transcription, which is the
  intended state. The count is printed.
- Proved by mutation: putting four rows of `W-1CM-reflections` back under the old id fires it.

### The lopsided rule was measuring the wrong denominator, and it is the `cost: 0` shape a third time

**`Key stage` scored 35.4% — five times the floor — and pressing its commonest answer left 1,314
items of 1,331.** Measured at a real state of the real funnel: Learning · Questions · Maths · GCSE ·
Worksheet. A tap that removes seventeen things out of thirteen hundred, offered as the next
question, looking healthy to the one rule written to stop exactly that.

**The cause is that `facetSplit_` was a share of the TALLY, not of the list.** The tally counts an
item once per answer — which is right, and is what makes the counts beside the answers true: a
worksheet tagged `KS3, KS4` really is in both. But it means the total is bigger than the list, so a
facet where nearly everything answers the commonest answer *and* something else scores well on a
share of a number that is not the list.

**So the question is asked of the list, which is what it was always about**: press the biggest
answer — what is left? For a single-valued facet at full coverage that is arithmetically the same
number as before, which is why nothing that was working changed. It differs exactly where the old
one was lying.

The greedy walk before and after says it plainly. Before: 2,344 → Type → 1,354 → **Key stage →
1,314** → Grade. After: 2,344 → Type → 1,331 → Grade → 419 → Topic → 45 → Paper → 11. Every step is
now a real narrowing.

**This is `cost: 0` and `paper: true` a third time**, and the sentence this file already carries is
the right one: both of those were fixed in the data and neither was fixed in the rule, so the shape
recurred. The rule is the fix.

### Reels was never broken. It had nothing to show, and two rules were missing

**Reported as "the widget has disappeared".** Measured in a browser before touching anything: the
column is in `TABS`, `go('reel')` works, there are no JS errors, and `screen('reel')` draws its
"Nothing here yet. Add a row to the **facts** tab" card. **A column that works and has nothing to
show is indistinguishable from one that does not work, and it is read as the second.**

**The move to a tab only half happened.** Fifty-eight facts live in `FEED_FACTS` in `chess.js` — a
subject, a headline, a paragraph and a photograph search term each. `screen('reel')` was rewritten
to read `DATA.facts` instead, which is the right change and the note in `shell.js` says why. The
backend sends that tab. **The tab has no rows in it**, and has had none since.

**`factsNow_` is the rule, and it is `libraryExtras_`'s rule pointed the other way.** That one says
*a file with no rows leaves the payload's copy alone*, so cutting over could never take a screen
dark. This says *a tab with no rows leaves the code's copy alone* — which is also the house rule
this file opens with: an empty or broken sheet must still produce a working site. The sheet wins the
moment it has a row, so nothing about the migration is undone; it just stops being a cliff.
Measured: 58 built-in, one row in the tab → 1 from the tab, tab emptied → 58 again.

**And the two surfaces were reading two sources.** The Reels column read `DATA.facts`; the "One more
thing" widget read `FEED_FACTS` directly. Filling the tab would have changed one of them. Both ask
`factsNow_` now — the same argument as `documents_()` and `paperIdOf_`: a second reader of one thing
is a second chance to disagree about it. `reelsWatch_` was a third, reading `DATA.facts` for the
photograph while the slides beside it were drawn from somewhere else.

#### And then every slide was zero pixels tall

**`.reels` asks for `height: 100%` and `.page` is `height: auto`.** Circular — the thing asking for
the height *is* the content — so the container resolved to 0 and so did all 58 slides. The markup
was all there, the text was in the DOM, and every box measured 0px.

**It had never been rendered, which is why nobody had seen it.** The `facts` tab has always been
empty, so the screen has always returned the "Nothing here yet" card instead — an ordinary `.pane`
that sizes itself perfectly well. **The slide rules were written, committed, and never once put on a
screen.** Filling the column is what exposed them, and it took measuring the boxes in a browser:
`.page.reel-page { height: 100% }`, one class on the one page that wants it, because `.screen` is
`position: absolute; inset: 0` and so has a height for a percentage to resolve against.

**This is the same shape as the check that could not reach its subject**, one layer down: CSS that
cannot be wrong until something renders it.

### `node js/check-funnel.js` — the funnel, run over the real library

The three faults above have one shape: **each looked fine in the code and only showed up in the
arithmetic over real data.** So this check does what `whyThisQuestion()` does in the console — builds
the real items, interrogates the real facets — and fails on four things:

1. **a question that cannot narrow** — offered, not marked `always`, minority under 2%
2. **one answer wearing two coats** — two values in one facet that normalise to the same word
3. **a facet fed by a literal** — the general form of `paper: true`: a reader whose answer never
   moves across thousands of items is reporting a constant, not reading a column. Reported, not
   failed, because an absent field looks the same from here
4. **a second spelling of a sitting** — any `examWave` answer that is not `<Month> <year>`

**It uses `data/questions.json`, not the fixture**, on purpose: the fixture has four question rows
and every fault above needs thousands to become visible. The fixture still supplies everything that
is not the library, which is why a *thin* facet is never a failure here — only a lopsided or
incoherent one.

**Proved in both directions on three mutants**, because a check that cannot fail is not a check: a
facet returning a constant (fires at 0.45%, the exact `paper` reproduction), a facet offering
`Alevel` beside `A-Level`, and `waveOf` with the phase-word branch switched off (fires naming
`"First wave", "Second wave"`). All three exit 1; the real file exits 0. **The first attempt at the
second mutant was inert and passing it proved nothing** — after the merge the `level` facet
genuinely cannot emit both spellings, because the band wins on every row that has one. A mutation
that does not change behaviour is not a test, and the only way to know is to watch it fail.

**Two cross-facet overlaps are reported and left alone**: `A-Level` answers both `Level` (263) and
`Tier` (135), and `Edexcel` answers both `Exam board` (2,283) and `Company` (873). Both are arguably
true twice — a board and a publisher are different facts that share a name — so they are a note
rather than a failure. It is still how "which one did I answer?" starts.

### What the audit found healthy, which is the other half of trusting it

Measured, not assumed: **stem attachment works** — 29 parts across two papers correctly carry the
shared preamble they cannot be answered without. **Search is not the bottleneck** — 31–125 ms across
3,753 items, built once onto the item rather than per keystroke. **And the search does not leak mark
schemes**: three apparent hits in a 200-row sample were all coincidence, where the question is
*about* a regular hexagon so the words recur in both. `text:` is deliberately built from the stem,
the lead and the part and never the answer, and that holds.

**The one thing this cannot measure is everything that is not the library.** The fixture has one
tutor and one venue, so `What for` reading 99.5% here is partly an artefact of it, and only
`check/live.js` against the real spreadsheets could settle it — every Google host is blocked from
the agent's environment by network policy. That is exactly why `always` is a declared flag rather
than a threshold tuned to numbers I cannot see.

### The `facets` tab can now INVENT a question, not just rename one

**A facet is two things and only one of them is logic.** "What it is called, when it is asked,
whether it is asked" has been editorial for a while. "How to READ the value off a thing" is `of:`,
a function — and for **ten of the twenty-one** facets that function is literally `x => x.subject`.
Reading a named field is not logic; it is a field name.

**So a `facets` row naming a field the code has never heard of becomes a question**, with the reader
derived by `facetFromSheet_`: look on the item, then on `row` — the original spreadsheet row every
item carries. That second half is the unlock. **A column added to `venues` is filterable the same
afternoon, with no mapper edit**, because the row is already on the item. A comma in the cell is a
list, the way `keystage` already does it in code.

**No deploy needed.** `doget.gs` already passed unknown facet rows through — its comment says so —
so this is a phone change only.

Proved against the real data: three rows added at runtime gave
`answerType` (a real column no facet had ever read) **3 answers, 85% coverage, chosen as the next
question**; `nonsense` (a typo) **0%, reported, not silent**; and `name` **212 answers, refused**.

**That refusal is a new rule the sheet made necessary.** `FACET_MAX_ANSWERS = 40` — there was never
an upper bound because every facet was written by somebody looking at the data, and `field: name`
is 212 answers presented as multiple choice. The rule applies to the code's own facets too: a
question past forty answers has stopped narrowing anything, whoever wrote it. `Subject` is about
twenty and `Division` seventeen, so nothing real is near it.

**And `name` having exactly 212 answers is the collection showing through** — 212 distinct paper
names across 3,265 questions. That is the `contains` idea from the audit, visible in the data.

### And the `kinds` tab can invent a kind — which is where the hand-written part ends

**The same gap, the same three-line fix.** `kindMap_` walked `Object.keys(KINDS)` and overlaid the
sheet onto each, so a `kinds` row for a kind the code does not declare was read and thrown away.
The backend already sent those rows through.

**What makes it three lines rather than a project is that the card already fell back.**
`(kindOf_(x).card || thingCard_)(x, credits)` has always been the call — a kind with no card draws
as an ordinary thing: name, subtitle, picture, price. Proved: a `podcast` row that exists nowhere in
the code came back `group: Learning, label: Podcasts` and **drew a card**.

**The old fallback was wrong and silent.** `kindOf_` answers `{ group: 'Shop', label: 'Things' }`
for an unknown kind, so an unrouted kind did not vanish — it appeared under Shop labelled Things,
which is worse than vanishing because it looks deliberate.

**So adding a domain is now: one mapper in `stuffItems`, and rows.** That mapper is the honest
floor — something has to say "boxers live on `DATA.boxers` and a boxer is called `name`". Everything
after it is editorial.

**I dropped the source-table idea from the audit.** It would have turned an 8-line mapper into a
4-line config entry, and that is moving code rather than removing a cost. The facet and the kind
were the real costs and they are gone.

### `row` carries the whole row, because an enumeration goes stale

`libraryInto_` names 29 of `data/questions.json`'s 44 columns, so `topics` (2,918 rows),
`description`, `level`, `pages`, `source_url` and nine more reached the browser inside
`LIBRARY_ROWS` and stopped there.

**That became a fault the moment the sheet could invent a facet.** `facetFromSheet_` falls back to
`x.row[field]`, and `row` was the payload object rather than the file row — so `field: topics` found
nothing: 0% coverage, question never offered, nothing anywhere saying why. Attaching the row fixed
it in one line and `topics` came back **11 answers, 77% coverage**. It is a reference, not a copy:
`LIBRARY_ROWS` holds those rows for the life of the page anyway.

**Fifteen fields of ceremony hid one that decided a filter.** Every mapper wrote
`bandType: '', bandValue: '', keystage: '', …, paper: false` — ten identical blocks. All of it was
ceremony: `asList_` cannot tell `''` from `undefined`, so writing them and omitting them are the
same behaviour. **`cost: 0` was not ceremony.** The Price facet tests `x.cost === 0` strictly, so
every unpriced thing — a subject, a level, a link, a friend, a timer, a question — claimed to be
FREE. Measured: **3,262 of 3,265 items answered `Free`**, which made that bucket mean "everything".

`priced_` now tells an unset rate from a rate of zero, and no `cost` means no answer to the
question rather than a claim of free. `cost: 0` still means free, because a shop item priced at
nought is. **One load-bearing line among fifteen decorative ones is exactly what makes a funnel feel
arbitrary**, and the blanks are gone so the next one cannot hide the same way.

### Sixteen widgets were unsearchable and the filter looked deliberate

`stuffItems()` read `.filter(wgt => (!wgt.admin || isAdmin()) && wgt.groups)` and **the second test
was always false**. Measured: 16 widgets in `WIDGETS`, **0 carry `groups`** — the only thing that has
ever set it is `liveWidgets_` in book.js, one per session you are in. So `stuffItems()` returned
**zero** items of kind `tool` or `game`, and typing `calculator` into the search box found nothing.

**The argument for the filter was good and its premise was wrong.** It said tools and games have
columns of their own, so the funnel need not carry the plain ones — and that `Tools` and `Games`
vanish as answers "because nothing answers them". That second half is the tell: the two answers
disappearing was read as the design working, and it was the filter emptying the list.

It looked like a widget that had gone missing, because the widget was two swipes away on Tools the
whole time. What had gone missing was the search. `wgt.admin` stays — that test is real.

### A collection is a SHAPE IN THE DATA, not a row in a sheet

**What tells a paper from a subject is arithmetic.** Measured over the 3,271 question rows:

| column | distinct | rows each | what it is |
|---|---|---|---|
| `row_id` | 3,271 | 1.0 | **identifies a row** |
| `paper_id` | 202 | 16.2 | **a collection** |
| `name` | 196 | 16.7 | the same collection, by name |
| `subject` | 5 | 654 | **a category** — a question |
| `tier` | 3 | 1,090 | a category |

**And the boundary between "question" and "collection" already existed.** `FACET_MAX_ANSWERS = 40`
was added for an unrelated reason — the `facets` tab can invent a question now, and `field: name`
would have offered 212 answers as multiple choice. "Too many answers to be a question" turns out to
be the definition of a collection. One threshold, two jobs, no new number to argue about.

**Nothing is declared and nothing is stored.** No `isCollection` column, no `kind: 'paper'` row to
keep in step. A paper that gains a question is a bigger collection on the next load. The card is
derived from its members: the name they share, how many there are, and the facts they all agree on —
so a collection *cannot* disagree with its contents, which is exactly what went wrong when a paper
was a row (538 of 642 carried `active: FALSE` while their questions were live).

**One flag, and it is worth being honest about which half is automatic.** Counting tells you whether
grouping by a field is *useful*. It cannot tell you that `P-1MA1-2306-1H` is an IDENTITY and
`Higher` is a CATEGORY — both are just strings that repeat. So `collect: true` on a facet says
"this field names a thing", `nextFacet` skips it (its answers are ids, unreadable as a question) and
only `collectionAxes_` looks at it. Everything else is counted.

**The list is never both.** That was the fault the paper card died of three drawings deep.
`stuffFiltered` *replaces* rather than appends, so "2,935 questions or 176 papers" is always exactly
one of them. Measured: press the control → 176 items, `every(x => x.kind === 'group')` true; open
one → 36 questions, matching its stated count exactly; press again → 2,935 back.

**A collection comes back as an ITEM**, which is why nothing downstream changed. Same shape, same
paging, same card — `stuffPageCount`, `fillStuffPages` and `stuffPageHtml` cannot tell the
difference. `kind: 'group'` has no `KINDS` entry and needs none, because
`(kindOf_(x).card || thingCard_)` falls back. Opening one sets the same filter `facet-pick` sets,
so "show me the papers, then open one" and "narrow by paper" end in the same state with the same
removable chip.

**`n / 2`, not `< n`, and I caught that measuring.** `html` is 3,028 distinct over 3,267 rows — not
equal to the row count, so `< n` let it through as a "collection" of 1.08 questions each. A
collection whose groups average fewer than two members is the list again with a heading on every
item.

**It works on anything.** Fights collect by boxer, sessions by tutor — none of that is written down.
What is written down is the shape.

### The funnel lists QUESTIONS, and the collections are derived from them.

**Three goes at drawing a past paper card, and the card was never the problem.** A document and the
questions inside it answer the *same* facets — the paper's board, tier, year and wave are copied
onto every question row on purpose — so the list returned two kinds of thing for one search, and
each fix made it worse in a new way:

1. the paper drawn once as a cover **and** again once per question;
2. then the cover with the **whole paper printed under it**, on every card in the results list — 47
   parts and 47 answer boxes between one cover and the next;
3. then a cover you had to **open**, which is a search result you cannot read without a tap.

Every one of those was found by looking at a screenshot, and (2) shipped with a comment arguing
"the funnel has already done the narrowing a list needs, so by the time you are looking at one paper
there is nothing else on the page." The funnel is a paged **list**. Five covers on a page is
ordinary.

**So the collection is gone.** `stuffItems()` spreads `questionItems()` — one item per part, 3,265
of them — and `questionCard_` draws the whole question: reference and marks in the header row, the
paper name as the subtitle, then stem, lead, part, diagram, and the mark scheme shut underneath.

| Deleted | What it was |
|---|---|
| `allTopics`, `topicBy` | the 642 documents, built from `dropdowns.checklists` unioned with a derivation |
| `paperCard`, `paperish_` | the exam cover, and the test for whether a row earned one |
| `paperInline_`, `openPaper_`, `on('paper-read')` | attempts (2) and (3) |
| `paperBody_`, `paperRows` | the whole paper typeset end to end |
| `topicTiles_` | `Read` and `Paper` — both took the document behind the card |
| `paperText_`, `paperPages_`, `canPrint`, `paperMismatches` | document-level helpers with nothing to help |
| the `paperName` facet | "which paper", which existed to keep a paper card beside its questions |
| the checklists build in `libraryInto_` | `allTopics` was its only reader |

**Nothing that was being used is lost.** Subject, key stage, tier, exam board, year and exam wave
are all on the question rows, so the funnel narrows to a paper exactly as before and then keeps
going. `searchText_` matches each question's own words plus its stem's, which is what `paperText_`
was faking at the document level.

**`ansBox_` came back one commit later, and the reason it went is worth keeping.** It was deleted
with `paperBody_` on the argument that a textarea per question means 3,271 textareas. It does not:
`fillStuffPages` fills the pages you are near and empties the rest, so about five exist at any
moment and the whole strip holds 140 nodes — measured. **I reasoned about the DOM instead of asking
it**, which is the same mistake as `.mat-out` and the seven dead custom properties. The key is the
`row_id` now rather than paper + question + part, because a row id is unique across the library and
does not move when a paper is relabelled.

**What IS lost, and it is the print line.** You cannot print one question — a print is a whole
paper, priced per page — and no surface lists a whole paper now. `printPrice` and `laminatePrice`
remain for a basket saved before the change; nothing creates a `print` line. Selling paper again
means a surface that lists documents, deliberately, somewhere that is not the funnel.

**Measured before committing, because 3,265 items is the thing that would break it.** Typing one
common word gives 2,397 results: 213 ms to filter (memoised after), **56 ms** to insert 2,398 result
pages, **15 ms** a page turn, and 134 live nodes — `fillStuffPages` only fills the pages you are
near, which is what makes the count harmless. The old comment warning that ~3,500 sections stalled
the screen predates that lazy fill.

**The rows themselves are still in `data/questions.json`**, `kind: 'paper'`, carrying the link, the
page count and the print flag. Nothing reads them. Anything that lists documents again reads them
from there — and `source_url` on 2,073 question rows is the real PDF on the exam board's own site,
which is what a "open the original" control should point at rather than a rebuilt paper.

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
