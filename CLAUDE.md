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

## GCSE English is the first paper the question table was not shaped for, and it fitted

**Two AQA GCSE English Language papers were already transcribed** — June 2023 Paper 1 and Paper 2,
five questions each, both already summing to 80. What was missing is everything a person teaches
FROM: the source the reading questions are about, and the levels the answers are marked against.

**The insert was being described four times in four `lead`s.** Every Section A question carried the
sentence *"The source text is in the separate Insert booklet and is third-party copyright, so it is
linked rather than reproduced"* — one fact about the insert, repeated on every question that uses
it. **That is what section-scope preambles are for**, and it is the case they were built for: an
AQA insert is one document that four questions hang from, and it belongs to the section, not to any
of them. One `kind: 'stem'` row per paper, naming the section and no question. Measured: 8 of the 10
English questions now carry it — the two Section B writing questions correctly do not, because they
are a different section.

**The source itself cannot be here.** AQA prints it in a separate booklet and the extracts are
third-party copyright, so it is not in the question paper and is not reproducible in a public
repository either. What is in the row is a description accurate enough to teach around — the shape
of the extract, which lines each question points at — and it is marked so it cannot be mistaken for
the text: `placeholder: True` on the row, a dashed box round it on the card, and
`check-library.js` printing the outstanding list every run. **One row to replace per paper**, and
every question under it has the real thing.

**The mark schemes are the part that does not change with the source.** AQA English is marked in
LEVELS against assessment objectives, not in points against a worked answer, so the bands for "how
does the writer use language, 8 marks" are the same every series — and they are the thing a student
most needs to see. The indicative content is the half that depends on the insert, and that is said
rather than invented.

### `total_marks` — the paper says what it is out of, and the check stops knowing about boards

**The 80-mark rule knew about one qualification.** `isEdexcelGcseMaths` is a predicate over five
columns — board, subject, key stage, resource type, tier — written because the id prefix it used
before was blind to six papers filed under `RS…` ids. A real fix, and still a rule that only works
for the board and subject somebody had in front of them. **The first AQA English paper walked
straight past it**, and so would every A-level paper already in the library.

**So the paper declares its own total.** One cell on the `kind: 'paper'` row, set by whoever
transcribes it from the front page of the thing they are looking at — which is where the number is
printed and the one moment anybody is certain of it. No board, subject or tier appears in the rule.
The old predicate stays as a *default* for the thirty Edexcel maths papers that have no such cell
yet, and the run prints how many papers are checked against a total (34) and how many are not (190),
so what is uncovered is a number rather than a silence. Proved by mutation on the English paper.

**And `check/cards.js` was laying out a card the app does not draw.** It looked up one preamble
scope where `preamble_` walks three — so the longest preamble in the library was the one it could
not see. Caught the day the first insert went in, which is the only reason it is not still true.

## There is no "resource" in this app, and `kind` collided with two columns at once

**"I don't know the difference between questions and resource" is the correct reaction.** The word
is a leftover from the `resources` tab, which was folded into `questions` and then deleted — this
file records the whole of it. What survived the deletion is two column names, `resource_type` and
`resource_id`, naming a thing that no longer exists, sitting beside a file called `questions`.

**And `kind` collided with two columns.** Its values were `paper`, `stem` and `part` — and `paper` is
also a column (which paper of the set: 1, 2 or 3) and `part` is also a column (which part of the
question: a, b, c). So `kind: 'paper'` and `paper: '1'` were different facts one word apart, and so
were `kind: 'part'` and `part: 'a'`.

| was | is | what it means |
|---|---|---|
| `kind: 'paper'` | `kind: 'document'` | the row the whole paper gets — its link, its page count, its total |
| `kind: 'stem'` | `kind: 'preamble'` | a paragraph several questions hang from |
| `kind: 'part'` | `kind: 'question'` | one question |
| `resource_type` | `document_type` | Worksheet, Past paper, Exercise, Specimen paper |
| `resource_id` | `source_id` | the old join to the deleted tab |

**Renamed as explicit pairs rather than a blanket replace**, because `'part'` and `'paper'` appear
all over this repo as ordinary English and as CSS tokens — `--paper`, `.qsheet-part`, "the second
part of the source".

### The rename broke two checks silently, and the count I had just added is what caught it

**`papers checked against a total` went 34 → 2** and `check-library.js` still printed a pass.
`isEdexcelGcseMaths` tests `p.resource_type === 'Past paper'`, which after the rename is
permanently false — so thirty-two Edexcel maths papers dropped out of the only end-to-end check the
library has, and the 80-mark rule was enforcing itself on the two English papers alone. **The
printed count is the only reason that was visible**, and it had been there for one commit.

**And the closed vocabulary for `Type` stopped existing.** `VOCAB` still said `resource_type`, so
the loop found the column on zero rows, reported zero strays, and passed. That is `check-booking.js`
again — a check that cannot reach its subject reporting that the subject is fine. **A name in
`VOCAB` that no row carries is a failure now**: either the column was renamed and the list did not
follow, or the entry is for a column that never existed. Proved by putting the old name back.

## Tools and games are out of the funnel again, and both decisions are worth keeping

**They were put back on a measurement and taken out on a judgement.** The measurement was real:
`.filter(wgt => … && wgt.groups)` had a second test that was ALWAYS FALSE — 16 widgets declared, 0
carrying `groups` — so `stuffItems()` returned zero items of kind `tool` or `game` and typing
`calculator` found nothing. A filter emptying a list while looking like a design.

**The judgement is the owner's and it overrules it.** A tool is not a thing you FIND, it is a thing
you OPEN, and it has a column of its own where all sixteen are laid out as tiles. Putting them in
the funnel made the app's search return a calculator beside a past paper, and `What kind` grew two
answers that are two other screens. Measured after: `What kind` now offers Questions, Tutors,
Venues.

**What it costs is written where the code was**, so it is not rediscovered as a bug: typing
`calculator` into Find returns nothing, deliberately, and the fix is those four lines rather than
another `wgt.groups`.

**Booking went the same way later and by the same argument**, with one difference worth knowing:
tools and games were removed from the BUILD, and Booking is filtered out of it by group — so the
`kinds` tab can put a Booking kind back and cannot put a tool back. See "Booking is out of the
funnel" below.

## The Message tile was on the card and the card could not be reached

**Reported as "I don't see the message tile".** It was there — measured, `cardTiles_` on a tutor
returns `data-do="msg-open"`. What could not be done is get to a tutor card at all.

**The `facets` sheet put `subject` at order 1, which is a filter in front of the doors.** The first
question the funnel asked was Subject, and there is no answer to Subject that keeps a tutor — a
tutor has none, `filterHit` finds no value, and every tutor, venue and friend is dropped by the
first tap.

**The coverage rule could not catch it, and the reason matters.** `FACET_COVERAGE` refuses a
question fewer than half the list can answer — and `subject` has **100% coverage**, because 4,005 of
the 4,007 items are questions. The library is now so much larger than everything else that ANY
library facet looks universal. The rule is right; it is measuring a list whose minority is three
items.

**So `always` does the other half of the job its own note describes.** `What for` and `What kind`
are DOORS — they take somebody from the whole app to a department — and a door asked third is a door
behind two filters. Doors sort before filters; the sheet still owns the order of the doors among
themselves, the order of everything else, and whether any of them is asked at all. **What it cannot
do is put a filter in front of a door**, because that is not an ordering preference, it is a dead
end for everything the filter cannot describe. Measured after: What for → People → the tutor, in two
taps.

## Every widget printed its name twice

`widgetColumn_` drew an `<h3>` from the roster's `name` above the widget, and **every widget's own
markup already had one**. Measured on the tools column: `Calculator || Calculator`, `Timer ||
Timer`, and the cheat sheet worse than either — `Cheat sheet maker (maths mat) || Cheat sheet maker
|| Cheat sheet — SATs`, three headings under two different names, because the roster label and the
card's own title had drifted apart with nothing comparing them.

**The widget's own heading is the one that stays.** It is inside the markup it belongs to, where the
roster's `name` has three other jobs — the search, the tile, the pager — and is a label rather than
a title. Two sources for one heading is this repo's recurring fault; the difference here is that
both were being drawn at once, so it was visible rather than silent.

**The check caught a real one on the way in.** `chess` has no heading of its own, and its comment
says so deliberately: *"A title saying 'Chess' above a chessboard... A board is self-explanatory in
a way almost nothing else in this app is."* That was true and it was not what happened — the roster
heading overruled it from another file. Removing that heading is what finally does what the comment
asked for, and `ACCEPTED_UNTITLED` records it with its reason so the NEXT untitled widget fails.

**Reels is an ordinary card now.** It was the only screen of the nine that returned its own markup
instead of going through `pages()` or `stack()`, so it drew straight onto the black with no pane.
The note defending that was about the SCROLL — a pane sets `touch-action: none` — and both are
available: the card is ordinary and `.reels` inside it keeps `touch-action: pan-y`, which is what
made the swipe work. The `.page.reel-page { height: 100% }` rule went with it; the scroller states
its own height, so there is no percentage to resolve and one fewer page that is special.

## Some answers are a mark on the picture, and a textarea cannot hold one

**Reported as "what about quesitions which have diagrams and you are meant to draw on them? the
answer box bit will need a rework right."** Right. `ansBox_` offers a box for words, and "draw a box
plot for this information" is worth three marks that no sentence can earn. Somebody working through
November 2017 Paper 1 could write *the median is at 165* and could not do what the question asked.

**So the diagram takes the pen.** `padWrap_` lays a transparent SVG over the question's own figure,
at the figure's own coordinates, and a finger draws on it — which is what a printed paper is: the
figure and the answer space are one object. The picture is drawn INSIDE the pad rather than in its
usual `<figure>`, because a diagram rendered twice on one card is the fault every widget had when
the roster's name sat above its own heading, and here the second copy is the one you cannot write on.

**Only where there is a real picture, and that restraint is the design.** 135 questions in the
library say `drawing` or `annotate` and 128 have no figure transcribed yet. Generating a blank grid
for those would be worse than leaving them — *"on the grid, enlarge triangle T by scale factor −2
with centre (−2, −2)"* over squared paper with no axes and no triangle T is a question you cannot
answer dressed as one you can, which is the fault this file already records twice. `check-library.js`
prints **7 of 135**, so it is a backlog rather than a silence, and the pen arrives on a question the
moment its picture does.

**The pen is off until you ask for it.** A surface that takes the finger has `touch-action: none`,
and one taller than the phone is a surface you cannot scroll past. One 44px tap turns it on and a
gold frame says so, because a mode you cannot see is a mode that surprises you.

**Marks are stored in the picture's own coordinates, never in pixels.** Every diagram here lays out
inside `viewBox="0 0 340 H"`, so a stroke recorded there is the same stroke on a 320px phone and a
1280px laptop; pixels would put yesterday's answer half an inch off the axis the moment you turned
the phone. `pad:<row_id>` sits beside `ans:<row_id>` and for the same reason — these cards are
rebuilt on every repaint and a rebuilt SVG is an emptied one. Measured: a line and a single tap
survive a full card rebuild and a full page reload.

### Two faults a screenshot caught and no check could

**The first version returned the pad INSTEAD of the preamble block, which threw the preamble's prose
away with it.** Q12(a) is "draw a box plot for this information" and the information is the table in
that prose — so the card offered an empty grid and no figures to put on it. A question made
unanswerable by the feature meant to make it answerable. Valid markup, card fits at 320px, nothing
throws, 26 checks green.

**And `figCredit_` was written for the Corbettmaths coins.** *"these are our coins and our answer"* —
true of six rows, printed under thirty others where the drawing is faithful and the answer is
Edexcel's. A credit that overclaims is not a smaller problem than one that underclaims: it tells a
student the figures in front of them were made up. `diagram_by` is two values now — `family` for a
picture REDRAWN from what the paper prints, `family-set` for one whose CONTENT we chose because the
original was lost — and `DIAGRAM_BY` carries both with a reason.

**This file has now written "a screenshot is the last word on a drawing" four times.**

## The 2017 Higher answers, against the mark schemes rather than against me

**The answers on both Higher Paper 1s were derived rather than read.** The mark schemes arrived in
Drive and every one of the 31 + 27 was checked against its own paper's. Four were worth changing:

| | |
|---|---|
| **May Q11(c)** | read −2.75. The scheme says **−2.8 cao** — it is a reading off the grid, and the algebra on a perfect (x−1)²−3 is what gives −2.75 |
| **May Q11(b)** | led with −0.7 and 2.7, at the edge of the tolerance. The scheme prints −0.75 and 2.75 |
| **May Q1(c), Q15(a)** | single values where the scheme takes a range — 12 to 13 hours, and 3.5 to 4.5 |
| **Nov Q2** | 2 : 3 : 6, which is right; the scheme prints 14 : 21 : 42 and takes either |

**And November Q12(b) had three wrong numbers, found by arithmetic rather than by reading.** The
transcription read the Year 7 box plot as 146 / 154 / 157 / 165 / 170, which gives an interquartile
range of 11 — and the mark scheme's own stats say median 157.5, IQR 10.5, range 24.5. Measured off
the paper's vectors against its axis, the five values are **146 / 154.5 / 157.5 / 165 / 170.5**,
which reproduces all three of the scheme's figures exactly. A student reading the card would have
got a different IQR from the mark scheme and assumed they were wrong.

**The Foundation paper's 41 all match**, which is the other half of trusting the check.

**And five questions across those three papers really ask you to draw and said `calculation`** — the
probability scales, the pie chart, the line of best fit. Each is marked now from its own mark
scheme's wording, which is where "what does this question want" is actually written down.

## `images` — a list, not `image_1`, `image_2`, `image_3`

**AQA's Paper 1 Question 5 is the case that asked for it**: the writing task offers a photograph as
one of its two prompts, and a question whose prompt is a picture is not a question without it.

**Numbered columns were the obvious shape and the one that does not scale.** Three of them would be
empty on 4,005 rows, and the day something needs a fourth is a schema change in the data, the
mapping, the renderer and the check. `topics` and `keystage` are already comma-lists for exactly
this reason and `asList_` has read them since before any of it — so `images` is one column holding
as many as there are, on a question row or a preamble row alike.

**`diagram` and `images` are different things and both stay.** `diagram` is inline SVG drawn here,
which takes the page's own ink and works offline; `images` is a list of addresses. A scan of an exam
page is one, a drawn Venn diagram is the other.

**Two shapes are addresses and everything else fails**: `http(s)://…` and `data:image/…`. A Drive
FILE page is named separately, because it is HTML and an `<img>` asking for it draws nothing — the
same spelling trap as the `.xlsx` ids in `check-tabs.js`. Proved on three mutants: two refused, one
counted.

## An answer that is a date sorts as a date

**The sittings came out alphabetically and it read as broken.** (Under the month names they carried
at the time.) June 2017, June 2018, June 2019,
June 2020, June 2023, June 2024, November 2017, November 2018, November 2019 — every June stacked
before any November, 2024 sitting above 2017, and each academic year split in half down a list
nobody could scan.

**`cmpText` is right about everything else** and the note above it says why: there is no reason to
prefer one of forty tutors, and alphabetical is the order somebody can predict. **A date is the
exception because it HAS an order, and it is not the one its letters give.**

**The test is on the answers, not on the facet.** Nothing in `facetTally_` knows that `examWave` is
a sitting — it asks whether every answer in front of it parses as `<series word> <year>` and sorts by
the date if they all do. So a `facets` row inventing a question over any dated column gets the same
treatment with nothing added, and a facet with one date and nine words falls straight through to the
alphabet rather than sorting nine things by a rule that fits one. Measured: `Sitting` comes back
newest-first; `Subject` is still alphabetical.

**A season is a position in the year too**, and that half was added a commit later with the rename
below. The first version knew the twelve months only, so `Summer 2017` parsed as a word and the
whole list would have gone back into the alphabet the moment `seriesOf_` stopped naming months —
this sort undone silently by an unrelated change. `SERIES_AT` in `find.js` is the one place that
says where in the year each season sits, and `seriesOf_`, `waveOf` and `dateKey_` all read it.

**Newest first, and that half is a judgement rather than arithmetic.** Chronological either way
fixes the June/November split; which end leads is a choice, and the newest paper is the one closest
to the specification somebody is actually sitting — which is why every past-paper site lists them
that way. One `-` flips it.

**And the twelve month names were written out three times.** `MONTH_NAMES` is in `data.js`; `find.js`
had two private copies inside `seriesOf_` and `waveOf`, and `games.js` had a third until somebody
deleted it with a note saying why. One list, one place.

## The app downloaded itself again on every open

**Reported as "the loading when site is starting is also taking long".** Measured, gzipped, off a
server sending GitHub Pages' own headers, at 4× CPU throttling on a 1.6 Mbps link with 80 ms latency:

| | before | after |
|---|---|---|
| first visit | 1863 ms, 1059 KB, 31 requests | unchanged — nothing is in the cache yet |
| every visit after | **1537 ms, 1025 KB** | **473 ms, 346 KB, 1 request** |
| `?dev` | — | 1771 ms, 1060 KB — the publisher's door, still uncached |

**Nothing was ever cached.** `LOAD` was `Date.now()`, so every file was asked for as
`name.js?t=<a number that changes every load>` — a URL the browser has never seen — and all 25
scripts, the stylesheet and the library came down again from nothing on every single open.

**`index.html` already argues both sides of this at length and the argument is still sound.** The
clock was chosen deliberately, because the cost of a stale file falls on the PUBLISHER, who cannot
tell "my fix did not work" from "I am looking at yesterday's file", and that cost eleven hours once.
**What it quotes as the price is "about 230KB", and that number was measured before the library moved
into the repository.** It is 1025 KB now and it grows with every paper transcribed — the same shape
as "all 18 checks pass" and "one of the eighteen names": a number in a sentence nobody re-reads.

**The fix is not to pick the other side.** The two readers want different answers and can have them:

- **a visitor** gets `document.lastModified`, rounded to five minutes — when Pages last built the
  page, so it moves on a deploy and at no other time. Between deploys every URL is one they already
  hold; the moment you push, every URL changes at once. Nothing to remember, which is the whole
  point: a step that must be remembered is a step that will be forgotten.
- **the publisher** gets **`?dev`** back. It is a page no browser has a copy of, so the entry point
  itself arrives fresh — the one thing the version system cannot do for itself — and it dates
  everything by the clock so no file can be held. A link, not a setting: a parent opening the
  ordinary address gets the ordinary fast path.

**Still never cached, deliberately**: the payload (`cache: 'no-store'` — it is the database, and six
hours old is wrong) and `index.html` itself, which has no URL of its own to put a version on.

**One thing is not fixed and is not claimed to be.** `data/questions.json` still refetches on every
visit. It is requested with the same versioned URL as everything else and every script beside it
caches; `force-cache` made no difference and the container has 29 GB free, so it is not a cache-size
ceiling. Whether that is Chromium or the app is not established, so it is written down rather than
guessed at — and it is why the "after" row above says 346 KB rather than 0.

**The Find screen itself was already fast** and is not what the complaint was about: measured in the
browser at 4,007 items, `stuffItems` 0 ms memoised, a repaint 0 ms, a search 8 ms, a filter change
19 ms. The four-fold speedup recorded further down held.

### `node check/load.js` — and the slow visit was the one nobody had measured

**Reported again as "the website is kinda slow when loading it up on mobile... i dont want to get to
my clients house and get embarrased."** The section above is the last round of this and its numbers
had gone stale exactly as it predicted: it quotes the cost of never caching as "about 230KB",
measured before the library moved into the repository. So the first move was an instrument rather
than a fix — `check/load.js`, which opens the real site through a throttled phone (1.6 Mbps, 80 ms,
CPU at 4x) against a server sending GitHub Pages' own headers, and times **the app being on the
screen** rather than the `load` event.

| | app on screen | over the wire |
|---|---|---|
| **cold** — nobody has ever opened it | 5.5 s | 1,166 KB |
| **warm** — opened before, nothing pushed since | **0.6 s** | **0 KB** |
| **the first open after a push** | 5.4 s | 1,164 KB |

**The caching works and the middle row proves it.** What nothing had ever measured is the third row,
and it is the one the complaint is about: `LOAD` is `document.lastModified`, so a deploy changes
**every** versioned URL at once — twenty-five scripts, the stylesheet, a 370 KB library — whether or
not any of them changed. Push a fix in the morning and open the site at a client's house in the
afternoon and you pay for the whole site to explain one line of `find.js`.

**The server already knew the answer and nobody was asking it.** Pages sends an `ETag` with every
file. `sw.js` holds what it fetched, and when a URL changes it asks with the ETag it already has:
thirty files answer `304` and send no body at all. That is per-file versioning with **no manifest to
generate and no build step**, which are the two reasons it was not already done that way.

| after `check/load.js` | app on screen | over the wire |
|---|---|---|
| the first open after a push | **0.6 s** | **36 KB** — index.html, and 30 files answered "unchanged" |
| a push that really changed one file | 0.6 s | 43 KB, and the changed file served **new** |
| **no signal at all** | **0.5 s** | the app opens with the server switched off |

**It is not stale-while-revalidate and that distinction is the whole safety argument.** Nothing held
is handed over on a changed URL until the SERVER has said it is still current. The eleven hours this
project lost to "my fix did not work" versus "I am looking at yesterday's file" are exactly what
that rules out — proved by changing one file for real and watching the new body come back on that
load, not the next one.

### There was a service-worker purge, and it had been right until the moment it wasn't

**Four hours went into a worker that installed, took control, saw every request, cached every one —
and left a store holding a single entry.** Nothing threw, `controller` was set, every `put` reported
success, and the app worked perfectly. The one file that survived was always the same one, and it
was the one fetched last.

**`index.html` and `shell.js` each carried a `purge()` that unregistered every service worker and
emptied every cache, on every load.** Both were written deliberately and both notes are worth
keeping: a worker outlives a reload, a hard reload and on some browsers clearing history, and while
one is installed it can serve a file from months ago whatever the server sends — indistinguishable
from an edit not saving. `shell.js`'s ended *"This project has never deliberately registered one."*

**That sentence stopped being true, and nothing anywhere connected the two.** Every entry written
during the page's opening burst was deleted a moment later by a promise started before any of it;
`data/topics.json` survived because `library.js` fetches it after the purge has already run.

**The `shell.js` copy would have taken the live site down.** It called `location.reload()` on finding
a worker to remove — correct while a worker could only ever be somebody else's leftover, and an
infinite loop the moment the site installs one of its own: register at `load`, purge on the next
open, reload, register, purge. For every visitor, with the app never finishing opening. **No check
here would have caught it**; it was found by reading the file the first purge was in.

**What the purge protected is a link you can type now.** `?dev` was already the publisher's door —
it dates every file by the clock so nothing can be held — and it unregisters the worker and empties
the store as well. **At the top of `index.html`, not beside the registration at the foot**, because a
page is controlled by whatever worker was installed when it was NAVIGATED to: unregistering halfway
down leaves the publisher reading files handed over by the worker they were trying to be rid of.
One reload, only when there was something to remove, and it cannot loop because nothing re-registers
while `?dev` is in the URL. Measured after: `?dev` gives a page with no worker, no registration and
no cache, and the next ordinary visit has one again.

### The instrument was wrong three times before it was right, all in the flattering direction

Worth the space, because every one of them would have been believed:

- **`page.route` switches the browser's HTTP cache off** — for every request, not just the routed
  one. `check/load.js` registers one to stand in for the backend, so its first honest run reported
  the warm visit re-downloading all 1,176 KB and three identical rows: "the versioned URLs do not
  cache". Proved rather than argued — with one route the server sees 32 requests on the second
  visit, with none it sees 1. The backend is stubbed with `addInitScript` now.
- **`encodedDataLength` on `Network.responseReceived` is the headers only.** The next version
  counted it and reported 300 bytes for `find.js` and 9 KB for the whole app. The body's size
  arrives on `loadingFinished`.
- **A service worker's own `fetch` is a different CDP target**, so the page's `Network` events do not
  carry it and the post-deploy row came back "0 requests, 0 bytes" — the number the whole exercise
  was hoping for, about thirty conditional requests the instrument could not see. It counts at the
  socket now, which cannot miss one.
- **And `LOAD` buckets to five minutes**, so simulating a deploy by touching `index.html` changes
  nothing four times out of five. Two separate rows were reported as "0 KB after a deploy" for a
  deploy that had not happened. It moves the date an hour and reads the stamp back.

**It prints and it does not fail a build**, and is not in `npm run check`: timings move with the
machine, and a check whose answer depends on what else the container is doing is a check people
learn to ignore. `npm run load`, and a person reads it.

### Half of what a first visit downloads is English

**Measured, gzipped, and not fixed:**

| | shipped | of which comments |
|---|---|---|
| `style.css` | 161 KB | **129 KB** |
| the 25 files in `js/` | 566 KB | **~421 KB** |

**Seventy per cent of the raw JavaScript and sixty-seven per cent of the stylesheet is prose.** That
prose is the most valuable thing in this repository and this file opens by saying so — but the
browser throws every byte of it away, and it is 550 KB of the 1,166 KB a first visit pays for.

**It is left alone because removing it is a build step, and this project does not have one.** Blanking
each comment to newlines of the same count would keep every line number in a stack trace pointing at
the right line in the repo and takes the two files to 33 KB and ~145 KB — but something has to do
that between the repository and the phone, and a step somebody has to remember is a step that will
be forgotten. That is the argument `LOAD` is built on. **It is a decision for whoever owns the
deploy, not a fix to slip in**, so the number is written down here instead.

**The service worker does not help the cold visit and does not claim to.** It is registered after
`load` and a worker does not control the page that registered it.

## A question file that did not arrive said the library was empty

**`libraryRows_` caught every failure and said nothing.** A 404, a refused request and a body that
stops halfway all came out as `[]` — which is also what a legitimately empty file gives. Downstream,
`stuffPageHtml` drew *"Nothing in the shop or the library yet."*: a confident sentence about an empty
library, printed for a library of 4,682 rows that simply had not come.

**Fourth occurrence of this repository's recurring fault.** `loadMessages` showed an empty inbox for
an unreachable backend and its own comment named it — *"a network blip reads as everything having
been deleted"*. `check-booking.js` printed "nothing to check" and exited 0. Reels drew "Nothing here
yet" for a column that worked. Every one is the same sentence: **I did not manage to look, reported
as I looked and there was nothing there.**

**And it matters most on the phone that cannot do it.** `data/questions.json` is 346 KB compressed
and 3.4 MB parsed — the largest single request the app makes, and the only one big enough to be
dropped by a weak signal or an old handset that everything else survives. The person who sees that
message is precisely the person whose library did not load.

**`LIBRARY_FAILED` is separate from `LOAD_FAILED`** because they are separate requests with separate
failures: the backend can be down while the library sits in the browser's cache, and the library can
drop while the payload sails through. `nothingHere` reports whichever happened — it has drawn a
reason and a `Try again` for the backend since it was written, and the library was simply never
wired into it. **`Try again` had to clear the memo**: `libraryRows_` returns `LIBRARY_ROWS` untouched
once set, so the button would have repainted the same failure for ever.

**And `nothingHere` alone was not enough — the harness is what showed it.** On this site the list is
NEVER empty, because the payload carries tutors and venues. Measured: 2 items, `LIBRARY_FAILED` set,
and the empty-state branch never reached once. **A dropped library leaves a Find screen holding three
venues and no questions**, with nothing anywhere saying why. So there is a banner too, which does not
depend on the list being empty, written last of the three banner checks so it wins — a missing column
is an admin's problem with saving, and this is every visitor's problem with the thing the app is for.

**Proved in five directions**: a body that stops halfway, a 404, a request that never returns, a
genuinely empty file, and everything working. The flag is set in the first three and empty in the
last two, and the banner appears and clears to match.

## A chip read "PRINTED OR DIGITAL 1", and the sheet had resurrected a deleted question

**Reported from a screenshot of the live funnel.** The deleted `Printed?` facet was back, wearing its
old label over a completely different column.

**`facetList` sorts a `facets` row into one of two piles** — a field the code declares is a RELABEL
of that facet; a field the code has never heard of is a NEW question read straight off the column.
**Deleting `paper` from `FACETS` moved the sheet's row from the first pile to the second**, silently,
in a commit that was about something else.

**And `paper` is a column that means something else.** This file already has the collision under its
own heading: `kind: 'paper'` was the document and `paper: '1'` is WHICH PAPER OF THE SET. The deleted
facet read `x.paper`, a literal `true` on every question; the column holds `1`, `2` and `3` on 1,158
rows. So the funnel offered a question labelled *"Printed or digital"* whose answers were **1, 2 and
3** — and pressing one quietly filtered the library to Paper 1s while the person believed they had
answered a question about printing.

**No rule could have caught it.** It is not lopsided — three answers and a real split. It is not a
literal — the answers move. And **nothing compares a LABEL against what a column holds**, because
nothing can.

**So a deletion is remembered.** `RETIRED_FACETS` is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP`
pattern for a fourth time: one entry, one written reason, and a spreadsheet cannot undo a decision
the code made on purpose. It does not bar the column for ever — if "which paper of the set" is wanted
as a question it is one entry in `FACETS` with a label somebody has read, **which is the whole
point: a label is exactly the thing a spreadsheet cell never gets reviewed.**

**The sheet still needs fixing**; this only stops it drawing. Proved by mutation — without the guard
the facet comes back as `label "Printed or digital", answers: 1 / 2 / 3`, which is the screenshot —
and a legitimate invented facet (`field: pages`) is untouched.

## The publisher was neither askable nor searchable

**Reported as "how would I get to 1st Class Maths worksheets?" and the honest answer was that you
could not.** Measured both ways:

- **The funnel never asks.** `Company` qualifies everywhere — 5 answers, 99% coverage, **a 65.8%
  split on the whole library**, comfortably the best narrowing available — and it sits near the end
  of `FACETS`, so Subject, Level, Type, Grade, Topic and Paper are all asked first. By the time its
  turn comes the list is Maths · KS4 · Worksheet and **every one of those 1,370 rows already IS 1st
  Class Maths**, so the facet has one answer and is correctly skipped. A question that can only be
  asked once its answer is decided is a question that is never asked.
- **The search box did not find it either.** `corbettmaths` returned **0 of 1,020**. `1st class
  maths` returned 325, which reads like it works and does not — coincidental hits on other fields,
  against 1,370 rows carrying the name in a cell.

**This is the `topics` fix one column along**, and the sentence is the same: a publisher's name is
printed nowhere in the question, so the one place that says Corbettmaths is the `company` cell. Built
onto the item, not matched per keystroke.

| typing | before | after |
|---|---|---|
| `corbettmaths` | 0 | **1,020** |
| `1st class maths` | 325 | **1,370** |
| `1stclassmaths` | 325 | **1,370** |
| `edexcel` | — | 1,148 |

**Both spellings, because the file holds one and people type the other.** `company` was normalised to
`1st Class Maths` by the spelling vote, and `1stclassmaths` is what that publisher writes on its own
sheets. A substring search cannot see through a space, so one form found 1,370 and the other 325 —
a search that half-works. `companyAtoms_` emits the shown spelling and `spellKey_`'s reduction of it,
so it is that function rather than a second opinion about what a spelling is.

**The funnel's order is deliberately NOT changed.** `at` is editorial and the `facets` tab owns it:
a low `order` on the `company` row asks it early, with no deploy. Which question somebody wants asked
first is a judgement, and it belongs in the sheet.

## `needs` — what you must have in front of you, as one column

**Asked for as three things**: whether a question is calculator or not, whether a print is required,
whether a compass is required. **They are one column**, and this repository has already paid for
learning that — the `images` note above is the whole argument. Three booleans is three schema
changes, three mappings, three renderers and three checks, and the day somebody needs a fourth (a
protractor, tracing paper, squared paper) it is all four again. `needs` is a comma-list read by
`asList_`, exactly as `topics` and `keystage` already are.

### Where each one lives is the part that matters, and it is not the same place

**Calculator is a fact about the PAPER.** It is printed on the front cover — *"You must not use a
calculator"* — and is true of all 31 questions inside. So it sits on the `kind: 'document'` row:
**103 cells covering 1,013 questions**. Writing it onto every question row would be a thousand
chances for row 4 to disagree with row 3, which is the denormalisation hazard `paperMismatches`
exists for.

**A compass is a fact about the QUESTION.** One question asks you to construct a bisector and the
other thirty do not.

**So the card shows the union**, outermost first — the same shape and the same order as `preamble_`.
Measured: `No calculator · Compass · Ruler` on the November 2019 Paper 1 question whose text names
both, `No calculator` alone on the rest of that paper.

### What is filled in, and what is deliberately left blank

| | |
|---|---|
| the paper's own name states calculator or not | **103 papers → 1,013 questions.** Written |
| the question's own text names a compass | **2 of 4,005.** Written, and that is all of them |
| ruler 10, protractor 2, tracing paper 0 | written |

**Two of four thousand is not coverage**, and inventing the rest from topic words — *construct*,
*locus*, *bisector* — is the thing this file warns about three times: a renderer that printed "not
drawn yet" off the `figure` column and was wrong on ~120 questions, and a curve read by eye that
gave 50 where the pixels said 48.1. **A wrong "you need compasses" sends a tutor into a lesson with
the wrong bag**; a blank one sends them to look at the paper, which they were going to do anyway.
`check-library.js` prints the number so it is a backlog rather than a silence.

### The printed sheet already existed twice, and the two are disjoint

**The first version of `tools/set-needs.py` derived it from `figure`** — the four answer-space
labels — and would have been a **third** spelling of a fact the library already holds two of:

```
needs_print     True on 252 rows      print_required  True on 104 rows
rows True in BOTH: 0                  rows where they disagree: 356
printable       True on 1,287  — a different fact: whether a PDF exists to print at all
```

**Zero overlap is the tell.** Two columns meaning one thing, written by two imports over two
disjoint subsets, neither ever given the other's rows. `find.js` had already noticed, where the
deleted `Printed?` facet used to be: *"the three columns it might have read disagree anyway, so an
honest version of this question would have had to pick one and say why."*

**So it is read, not rewritten.** `libraryInto_` unions the two onto `needsPrint` and `needsOf_`
puts the answer in the same list as everything else. **A union is safe precisely because they are
disjoint** — there is no row where one says yes and the other no, so nothing is adjudicated and
nothing is invented. Rewriting 356 content rows to make a filter work is the diff `levelOf_` already
refused to produce.

### A list column is checked per item, not per cell

**`key_stage` gave this away and it took a second list column to notice.** Its vocabulary read
`KS1`, `KS1, KS2`, `KS2`, `KS3`, `KS3, KS4`, `KS4`, `KS5` — five values and two COMBINATIONS,
listed because the loop compared the whole cell. Fine at two, combinatorial after: `needs` holds six
atoms, so a cell-wise list would need **sixty-three** entries to permit what six atoms already say,
and a real pair like `Compass, Ruler` fails until somebody types it out.

`LIST_COLS` splits those columns before checking, the combinations are gone from `key_stage`, and
**the mutation proves it catches a stray hidden inside a valid list**: `"Compass, calc"` reports
`needs = "calc" on 1 row`, where a whole-cell check would have had to reject the pair or allow the
typo.

### And `libraryInto_` had a dead guard from the rename

`if (String(r.kind).toLowerCase() === 'paper') return;` — the value the rename made `document`. So
the guard has been permanently false since, and all 665 document rows have been arriving in
`DATA.questions`. **Nothing was drawn wrongly**, because `questionItems` filters `kind !== 'document'`
itself; the line was simply dead, under a comment describing what it no longer did. Same shape as
`resource_type` in `VOCAB` and `isEdexcelGcseMaths`, which the same rename also broke in silence.

**It is deliberate now rather than accidental**, because the app needs those rows: a document row is
where a paper-level fact lives, and `needsIndex_` reads them straight out of that list. Restoring
the skip would have taken that away; leaving a dead line would have left the next reader believing
the opposite of what happens.

## You were the one person on the screen `findCard` did not draw

**Reported as "why can't I see my own info like theirs?", with a screenshot**: two tutors with a
photograph, what they teach, a rate and a DBS stamp — and above them your own account as a name, a
role and a button.

**The paragraph directly above the code is the answer, and the code underneath it broke the rule it
states**: *"`findCard` draws them, which is the point. It is the same function the funnel used for a
tutor, so a person looks identical wherever they are seen — two renderers for one person is two
things to keep in step."* The next line was a hand-rolled `<div class="card">` — a second renderer
for one person, three lines under the sentence forbidding it.

**Your row goes through the same function now.** Found by `personId` first, then `handle`, then name
— the order `findPerson` uses on the backend, and for the reason `changePin` records: matching a
person by their display name was a real denial. `mineIs_` is one test used twice, so "which row is
yours" and "which row to leave out of the list below" can never disagree.

**And if you are not staff there is no row**, so one is built from what signing in already returned.
That is not a second renderer; it is a second SOURCE for the same renderer, which is the whole
distinction.

### Absent is not `false`, and the DBS stamp is where that matters

**The stamp is a real claim.** A tutor row's `dbs` comes from `TRUE_(r.dbs_checked)`, so it is always
answered, and the pass defends the negative outright: *"a pass without one is visibly a pass without
one, which is exactly the right amount of alarming."* Right for somebody a parent is checking.

**Nobody has made that claim about a row built in the app.** A parent looking at their own account
has no `dbs_checked` cell anywhere, and printing NO DBS ON FILE across it is the `cost: 0` shape one
more time — a missing fact rendered as a negative one. The key is simply absent on a row built here,
`t.dbs === undefined` tells the two apart, and every person a parent can actually look up still gets
a stamp either way.

**And an empty foot is not drawn.** The dashed rule is the pass's perforation and reads as one only
when something is torn off below it; on a row with no stamp, no place and no NOT LISTED flag it was
a dashed line over twenty pixels of nothing. Caught on a screenshot, which is where the first such
row appeared.

### Every page in the account column is a card

**Reported as "I want them standardised like the other widgets".** Measured: page 1 `.card`, page 2
`.pass` — your account in an ordinary card and every person under it a bare pass returned straight
out of `findCard`, so the column drew two different kinds of object down one scroll.

**This is the Reels fault one screen along.** That one *"returned its own markup instead of going
through `pages()` or `stack()`, so it drew straight onto the black with no pane"*, and the fix was to
make it an ordinary card with its own markup inside. Same here: the pass keeps every one of its own
rules — the hole, the stamp, the lanyard shadow — and sits in the pane everything else sits in.
Measured after: three pages, all `.pane > .card.is-widget > .pass`.

### And then the pass went, because it was asked for twice

**"Get rid of that lanyard looking thing mate. just a normal widget."** The section above is the
first answer to that complaint and it put the pass INSIDE a widget, which made the column consistent
without changing the thing anybody was looking at. This is the second answer and it is the real one.

**What the pass was for, so the argument is not lost with the markup.** A rectangle with a hole
punched in the top reads as something worn round a neck, and once it reads as that the DBS stamp
reads as clearance without anybody explaining it. That is true, and it is not the point: a pass is
an object you are handed at a reception desk, and one object among nine widgets reads as something
unfinished rather than as something with a shape of its own.

**And it could not hold what is in the sheet, which matters more than the taste.** `doget.gs` has
sent thirteen public facts about a tutor since it was written and the pass drew four — a photograph,
a name, three subjects and a rate. The headline they wrote about themselves, the three adjectives,
the years they have been doing it, their qualifications and grades, the group sizes and session
lengths they accept, what they focus on, and when they last confirmed any of it were on every phone,
on every load, drawn nowhere. **Thirteen columns written and never read** is this repository's oldest
shape — `figure`, `orderPrints`, the four message actions, `exam_date` — and a card 3.4rem wide had
nowhere to put them even once somebody noticed.

**`check-payload.js` cannot see this class of fault** and that is worth knowing: it compares
top-level `DATA.*` keys, so a field inside a row that nothing reads is invisible to it. `DATA.tutors`
is read, so `DATA.tutors[n].yrsExp` never being read is not a question it asks.

**`detailsConfirmed` is the one that had a rule waiting for it.** `doget.gs` sends it with the
sentence *"a profile nobody has looked at for a year is worse than one that's obviously incomplete,
because it reads as true"* and then *"the site decides what counts as recent, so the rule lives in
one place"*. That one place was nowhere. It is a row now, marked when it is over a year old — hidden
would leave a stale profile looking exactly like a fresh one, which is the fault the sentence
describes.

### The first version threw, and 88 combinations reported nothing to report

**`(t.focus || []).join(' · ')` against a fixture holding the string `"Maths"`.** A string has no
`.join`, so it threw — and `paint` in shell.js wraps every `screen.draw()` in a try/catch and
replaces the screen with a card reading *"This screen did not draw"*. That card is short, has no
overflow, no small tap target and no low-contrast text, so **it measures perfectly**: `check/ui.js`
printed `nothing to report.` across 88 combinations while the app rendered an error message where a
person's profile should have been. `pageerror` never fired, because nothing was uncaught.

**Fifth costume of the `check-booking.js` fault** — a check that cannot reach its subject reporting
that the subject is fine. `paint`'s catch is right and stays: the rest of the app genuinely is fine
and taking the page down would be worse for whoever is using it. What was missing is that the LAB
has to be able to tell the difference. `check/ui.js` asks the rendered page whether that card is on
it, groups it like every other finding so one broken card across eight combinations is one line, and
exits 1. **Proved by mutation**: the rule names the thrown message at four widths.

**Three separate faults from one bug, and the shape is worth the entry.** The card assumed a shape;
the fixture stated a shape `doGet` does not send (`focus` as a string, `extraQuals` as an array,
`detailsConfirmed` as a boolean); and the check could not see either. The card reads all three forms
through `profList_` now — array, comma-separated cell, or single value, exactly as `asList_` does for
the funnel — declared in `cards.js` rather than borrowed, because `cards.js` loads before `find.js`
and a card that works only once the funnel has loaded is a card that breaks on the first screen
somebody opens.

## Booking is out of the funnel, and the receipts had to come back in the same commit

**Reported as "remove booking from the finder"**, and it is the tools-and-games decision again: a
booking is not a thing you FIND, it is a thing you DO, and it has a column of its own where the form,
the basket and your sessions all are. Answering `What for · Booking` put a twelve-question form in
front of somebody who came to look for a past paper, then offered Tutors, Venues, Subjects, Levels
and Receipts underneath it — five answers that are one swipe away on a screen built for them.

**It is the GROUP, not a list of kinds.** `stuffItemsBuild_` filters on `asList_(x.groups ||
kindOf_(x).group)` — exactly what the `forLabel` facet reads — so a kind added to Booking tomorrow
leaves the funnel with nothing added, and a rule naming `tutor, venue, subject, level, receipt` would
go stale on the sixth. `kindMap_` overlays the `kinds` tab, so moving a kind out of Booking in the
spreadsheet puts it back: that is the escape hatch and it is deliberate. Measured against the real
library with the real (empty) `kinds` tab: 2 items leave and `What for` stops offering Booking. In
`check/fixture.json` they stay, because that fixture's `kinds` rows regroup tutor→people and
venue→places — which is the escape hatch proving itself.

**Nothing may go dark, and that is the whole care.** Each of the five had to have somewhere else to
be BEFORE the answer was removed, because a thing only reachable through a door you have just bricked
up is a deletion wearing a tidy-up's clothes:

| | |
|---|---|
| **tutors** | the account column, one page each, with the Message tile |
| **receipts** | `bookBlocks` draws one page per session again — see below |
| **venues, subjects, levels** | the booking form's dropdowns, which is the only thing anybody did with one. **The slip and level cards are drawn nowhere now, and that is the real cost** |

**The receipts are the half that had to be undone.** `bookBlocks`'s own note says `pastCard_` was
taken off that column *because* the receipts had become results in the funnel — *"a page holding a
list of them AND a searchable list of the same rows is the duplication this evening has already
produced twice"*. True while both existed. Removing the answer makes the half that was kept the half
that was deleted, so every session a person has ever had would have been on no screen in the app.
**Removing an answer and restoring what it was the only route to belong in one commit**, or the gap
between them is a live site where nobody can find what they paid for in March.

### The empty funnel said nothing at all, which is worse than saying the wrong thing

**`stuffQuestion` returned `''` when there were no items**, and `stuffPageCount` returns 0 until
something has been answered — so `stuffPageHtml`'s `nothingHere` branch is unreachable on arrival and
this was the only thing with a chance to speak. A search box over a blank screen: no question, no
sentence, no reason.

**Found by `check-flow`'s "every tab draws something" the moment Booking left**, with the check's
payload holding two tutors, two venues and no library: `stuff` drew 0 characters of text. The journey
was right and the fixture was not the fault — the app has been one empty payload away from a blank
front door for as long as that line has been there.

**Fifth occurrence of this repository's oldest shape**, and the only one that does not manage even to
report an empty list. `nothingHere` is the sentence because it is the one place that can tell an
empty database from a request that failed — a dropped payload and a dropped library both land there,
and both deserve a reason and a `Try again`. And the two empties are not the same empty: nothing
anywhere is the app having no content; nothing LEFT is a filter that has excluded everything, and the
way out of the second is one row up.

### A decision about what to ASK is not a decision about what somebody KEPT

**Starred tutors and venues vanished from Saved the moment Booking left the funnel.** `collItems_`
filtered `stuffItems()` — the offered list — so the row was still in the `favourites` tab, the star
still posted, and the card was simply not found. Silently, on the one list in the app whose entire
job is to not lose things.

**Found by auditing favourites on the same afternoon**, which is the only reason it is not a fault
somebody reports in a month as "my saved things vanished". `stuffItemsAll_` is every item the app
has, memoised the same way and in its own array — `facetTally_` keys its counts on the items array
itself, so handing one array to both lists would make a tally of the funnel answer for the saved
list too. Measured: 1 of 3 starred things found before, 3 of 3 after.

**Tools and games are in neither list and that is untouched**: they were removed from the build
rather than filtered out of it. Worth knowing the two decisions live in different places, because
only one of them is reversible from here.

## An unstar never reached the payload, and nine other deletions did not either

**`POST_WROTE`'s own note says it plainly**: *"`setCell` and `addRow` are the two functions that put
anything into a spreadsheet, and the payload is stale if and only if one of them succeeded."* They
are the two that ADD. **Nine places called `t.sheet.deleteRow(row._row)` straight through to the
sheet** and not one set the flag, so a deletion never retired the six-hour payload.

**On a favourite that means the star comes back.** The row leaves the sheet and stays in the copy
every phone is served; `adoptFavourites_` replaces the local set with the payload's, so the next load
puts back what you just took off. Nothing fails, nothing is logged, and it reads as the app ignoring
a tap. Deleting a link, taking a reaction off a post, changing a poll vote and withdrawing from a
class were all the same.

**The fix is the rule and not the instance**, which is the argument this file makes about `cost: 0`
and `paper: true` — both repaired in the data, neither in the rule, so the shape came back.
`delRow(t, row)` sits beside `setCell` and `addRow`, sets the same flag, and keeps `t.rows` in step:
a handler that removes a row and then counts what is left was counting the row it had just removed,
and every later `_row` shifts up by one when a sheet row goes. The nine callers got away with it only
because each deletes one row and returns.

**`check-backend.js` fails on a tenth.** A grep rather than a parse, because the question — does this
string appear outside the one function allowed to use it — has exactly one right answer and no scope
to get wrong. `setValue` and `appendRow` are deliberately not asked about: both are ordinary Apps
Script and a future helper may legitimately want one, and a rule that fires on the honest case is a
rule somebody switches off. **Proved by mutation**, and its first version fired on the block comment
explaining the rule — so the comment block is tracked opener-to-closer rather than guessed at from
how a line happens to start. Its summary names which of its two questions failed, instead of always
saying the first; same fault as "all 18 checks pass".

### And underneath that, no favourite had ever been written at all

**I got this audit wrong, and the correction is the entry.** I traced the round-trip by reading —
star, POST, `favourites` tab, `doGet`, `adoptFavourites_` — found the `delRow` fault above, and
wrote "does it work? yes, end to end". **It has never written a single row.** What is on the wire,
measured rather than read, is:

```
{"0":"f","1":"a","2":"v","3":"o","4":"u","5":"r","6":"i","7":"t","8":"e","token":"TK"}
```

**`function send(body)` takes ONE argument and `toggleFav` passed two.** The object is dropped, the
string becomes the body, and `api`'s `Object.assign({}, body)` spreads it into indexed keys. `doPost`
reads `S(body.action)` as `''`, `accessDenied` refuses it before the handler, and `.catch(() => {})`
threw the refusal away. The `delRow` fix above is still right and still needed; it was repairing the
second-order problem while the first-order one was that nothing was ever written.

**It is worse than device-only.** `DATA.favourites` therefore always comes back empty, and
`adoptFavourites_` replaces `FAVS` with it AND overwrites `localStorage` — so a star survives until
the next payload lands and is then wiped from the device too. One page view.

**`collections.js` HAS THE WHOLE ARGUMENT WRITTEN OUT**, twenty lines of it, because `toggleSpot` was
this exact bug and was fixed: *"the body was the STRING 'spotlight' and the whole object… was dropped
on the floor"*, and *"`.catch(() => {})` MADE IT LOOK LIKE IT WORKED"*. The star it was copied from
kept the fault. So did `claimChild` and `answerClaim` in `me.js` — and those two are **louder**,
because they have no `.catch` at all: `send` throws on the refusal, the `.then` never runs, and a
parent pressing "Add your child" gets no toast, no closed sheet and no error. Nothing happens.

**So the rule is in `check-replies.js`**, which is the file named for exactly this — a refusal not
reported as a refusal, one step earlier. It asks arity and nothing else: does a call to `send` pass
more than one argument. One question, one right answer, no scope to get wrong — the `check-rows.js`
lesson again. **Proved by mutation**: putting the old form back names `find.js:3969` and exits 1.

**Three instances, two files, one fix each time, and the rule arrived on the fourth.** That is the
sentence this file writes about `cost: 0`, about `paper: true`, about the spelling fold and about
`delRow` above it. **The workflow that found it was right and I was wrong**, which is worth recording
as plainly as the bug: I reasoned about the round-trip instead of measuring the request, which is the
same mistake as `ansBox_` ("I reasoned about the DOM instead of asking it") and as `.mat-out` being
fixed twice on a measurement nobody took.

## The wearables have been free since the two tabs were merged

**"Shop items should be updated to price you think would be reasonable"** — and for the wearables the
price is not a judgement anybody has to make. It is in `AVATAR_ITEMS`, in this repository, and has
been since the wardrobe was built: bunches 15 coins, curls 20, beanie 20, shades 15, backpack 30,
football 25, wand 40.

**`seedAvatarItems`'s own note diagnosed this and then said what it could not do about it**:
*"ALREADY-SEEDED ROWS ARE NOT REPAIRED BY THIS. The guard two lines above returns early once any
avatar row exists, so a sheet that has run this before keeps its empty prices and needs `price_coins`
and `acquire` filling in by hand."* **A repair described in a comment and left for somebody to do by
hand is a repair that does not happen** — the same argument this file already makes about
`geocodeVenues` being a URL somebody had to assemble.

**`acquire` is the half that actually breaks it**, not the price. `doGet` reads that word to decide
which of the three price columns to look in, so an empty one falls through to `price_coins ||
price_pence` — both blank — and sends `price: ''`. Writing the coins without the word would still
leave a level-gated hat looking purchasable; the two go together or neither is worth writing.

**`repairShopPrices` is the machine doing it.** Matched on `art_id` + `slot` rather than on a name
somebody can edit, writing only into cells that are empty — so a price the owner typed survives it,
and a second run reports how many it left alone. On the migration ledger as `price-the-wearables` and
on `?run=priceWearables`. **The physical stock is not touched**: those rows are the owner's, typed
into the sheet, and this environment cannot reach a Google host to read them.

**And the app claimed a price nobody had typed.** `Number(x.price) || 0` on the shop mapper made a
blank cell a price of nought, under a comment defending the zero: *"a shop row is the one place `0`
genuinely means free — it is priced, and the price is nought."* True of a cell holding `0`, false of
a cell holding nothing. **This is the `cost: 0` fault on the one mapper that was exempted from the
fix**, because the exemption was written about the value and the bug is about the blank. `priced_`
tells them apart now, and `thingCard_` gained the fourth state its own comment listed three of.
Measured on four rows: a blank price reads *not priced yet* where it used to read *free*, 15 coins
reads *15 credits*, a level-gated crown *Level 10*, a real `0` *free*.

**`.price.faint` was the first attempt at that state and did nothing.** `.faint` and `.price` are
both one class, so the cascade settles it on which comes later in `style.css`, and `.price` does. A
class that silently loses a specificity race is the `--fly-ink` fault wearing a different hat — it
reads as a decision and behaves as nothing. Its own class instead.

## The decade comes before the weight

**"Boxers and fights shouldn't be organised by weight category before the decade/s involved."**
`nextFacet` walks `FACETS` in order, so a `Decade` question sits above `Division`.

**The arithmetic would never have chosen it, and that is the point.** A division narrows harder —
twenty answers against seven — so every rule in `find.js` would pick it, and every rule in `find.js`
is about how much a question narrows rather than about what somebody came for. Somebody who wants
boxing wants an ERA: the heavyweights of the seventies are a subject, and "heavyweight" across a
century is a list of strangers. The weight is the second question and a good one once the era is
chosen. Same judgement `boxKind` already records one rung up.

**A decade, not a year**, because `year` gives forty answers — past `FACET_MAX_ANSWERS`, so the
question would be refused outright and the funnel would go straight to the weight, which is the
complaint. Ten years is the unit boxing is discussed in.

**Decades, plural**, off `activeFrom` and `activeTo` together: a career from 1975 to 1992 answers the
seventies, eighties and nineties, because a fighter filed under his last year alone disappears from
the decade he was famous in. Same shape as `keystage`, same machinery — `asList_` already filters and
counts against several answers. A span that runs backwards gives its two ends rather than a hundred
buttons; a fighter with no end date stops at `record_as_of` rather than inventing "the present day"
from a clock the function cannot see. Measured: **Boxers or fights → Decade → Division**, with
`welterweight` and `Welterweight` folded to one by `divisionOf_`.

**`year: b.activeTo` came off the boxer mapper.** It was the year he STOPPED, drawn as "Year", and
once `Decade` existed it sat between the decade and the weight offering `1981` and `2005`. A column
filled in with something nearly right and then read by a question that means something else — the
`cost: 0` shape again. A bout keeps its `year`, because a fight really did happen in one.

**`fightCard_` picks the winner by id where there is one.** `winner_id`, `boxer_a_id` and `boxer_b_id`
are shipped to every phone and were read by nothing, while the name comparison highlighted neither
corner if `winner` was typed "Ali" against `boxer_a` "Muhammad Ali" — which looks exactly like a
draw. The name stays as the fallback, because that is what reads a row typed in before anybody
assigned ids; same order `findPerson` uses.

**The boxing DATA could not be audited and that is not a finding, it is a blocker.**
`data/boxers.json` and `data/fights.json` are both `[]` — step 2 of the Library migration needs an
export from a Google sheet, and every Google host is blocked from this environment by network policy.
Everything above is the code path, which is where a data fault would show; the rows themselves are
still unread by anything.

## A fraction has four spellings and a child types the one the marker did not know

**The marking is the one thing in this app that tells a child they are wrong, and there is nobody
for them to appeal to.** Every other check here measures whether the app WORKS; this is the first
one that measures whether it is FAIR, and the two failures are not symmetrical — a wrong answer
marked right is a thing learned wrong and found out in an exam, and a right answer marked wrong is
a student who stops trusting the marking and then stops using it.

**The first one was live while somebody was sitting the paper.** `answer` writes Q23(b) of the June
2024 Foundation paper as `5&frasl;9`, which strips to `5⁄9` carrying **U+2044 FRACTION SLASH** — a
character no phone keyboard has. What gets typed is `5/9`. Two different strings, so the answer a
student is most likely to write was marked wrong; **91 rows in the library are spelled that way**,
four of them on that paper. `markNorm_` folds the fraction slash, the division slash and the vulgar
characters (`⅓` is what the Corbettmaths signpost prints) onto `/`, and takes the spaces off either
side of it.

**Only there, and that restraint is the whole of it.** Stripping every space instead would fold
`1 1/6` onto `11/6` — 1.17 and 1.83, two different numbers — so a wrong answer would be marked
right in order to fix a right one being marked wrong.

**And `strip()` in `set-accept.py` ate the space out of a mixed number.**
`<b>2<sup>2</sup>&frasl;<sub>15</sub></b>` came out as `22⁄15`, which is 1.47 where the answer is
2.13. A child typing the right answer was told it was wrong, and one typing 22/15 was told it was
right. Nine rows, every one a mixed number, `317⁄20` standing for 3 17/20 among them.

**The rule is as narrow as the fault, on the second attempt.** Turning every tag into a space fixed
this and **broke 141 algebraic answers in the same run** — `<i>n</i><sup>2</sup>` became `n 2`,
`4<i>n</i> − 3` became `4 n − 3` — so a hundred answers that were right by the old rule went wrong
by the new one. What needs the space is one shape: a digit, then a superscript that the `&frasl;`
after it proves is a numerator. Same lesson as `check-rows.js`, where the first version had 95
findings and 2 real ones.

### "Or equivalent" is what the mark scheme literally says

**A fraction is a number, and the marker was comparing it as a string.** Q23(b)'s own scheme spells
it out in the line beside the answer: *"oe … any equivalent fraction, or the decimal 0.55(5…) or
0.56, or the percentage"*. A child who writes 15/20 on the Corbettmaths sheet before cancelling, or
10/18, or 7/3 for 2 1/3, has not made a mistake. `markFrac_` parses `a/b`, `w a/b` and a decimal,
and `markAnswer_` compares them **as two whole numbers** — `a*d === c*b`, never as a decimal,
because 1/3 and 0.3333 are different numbers and a float would eventually call them equal.

**There is exactly one place that would be wrong, and it is now impossible rather than merely
absent.** A question asking for the SIMPLEST FORM has the unsimplified fraction as its question,
so accepting it back marks a non-answer right. Measured: **83 answers are a bare fraction and none
of them asks for simplest form**, which is what made the fold safe to write — and
`check-library.js` fails the build on the first one that does, naming the row and saying to leave
`accept` off it so a person marks it. Proved by mutation in both directions.

### `node js/check-marking.js` — and the roster is the only thing that makes a check real

It cuts the six marking functions out of `find.js` by name and runs them on their own — they touch
nothing else in the app, which is what makes that safe and is also why they are worth checking in
isolation. **A second implementation here would be a second thing to keep in step**, which is the
fault this file already records under `childrenOf`, under `link`/`source_url` and under `kinds`.
**Every one of its 35 cases is a fault that happened or nearly did**: the thousands separator is the
first question of that same Foundation paper, and the `11/6` case is the reason spaces are not
stripped wholesale. It is in `check-all.js`, because three good checks once sat on disk for months
without ever running.

## Two Corbettmaths worksheets had no fractions in them at all

**Reported by nothing, which is the point.** `Q-CBM-adding-fractions-same-denominators-1` was the
single character `+`. Corbettmaths sets its fractions as stacked artwork rather than text, so the
PDF's text layer holds the operator and nothing else — and it is not only the bare sums:
*"1/12 of the cupcakes in a box are lemon"* arrived as *"of the cupcakes in a box are lemon"*.
**Thirty-nine rows across the two sheets and not one carried a numerator or a denominator.** A
child opening either worksheet got a question with no numbers in it, which reads as the app being
broken rather than as the row being unfinished.

**Counted rather than guessed at**: question rows with no words and no picture went **25 → 4**, and
those four are the June 2023 text-layer casualties that already carry a note saying so.

**The method is the one this file already records** — extract the text, find it is not there, then
render every page and read it. Positional extraction settles it in advance rather than by
suspicion: page 2 of the same-denominators sheet holds **four text spans in total**, `1.`, `2.`,
`3.` and `+`, so there is nothing to recover by reading harder.

**Question 24 of the different-denominators sheet is on the page and had never been in the library
at all.** It is built from its neighbour's own row rather than typed out, so every column that
places a question — subject, key stage, year, publisher, topic — agrees with the rest of the sheet
by construction. Same shape as the Q23 preamble below.

**Every answer is computed from the transcribed question and never typed beside it.** Corbettmaths
publishes no mark scheme for these and does not need to: a sum of two fractions is settled by
`Fraction`, exactly. What arithmetic cannot catch is a MISREAD numerator — so the sum and the words
live in one table and the card is rendered from both, which makes "a question that says 7/15 and an
answer worked from 7/5" a shape that cannot occur rather than one to check for.

## The Venn diagram had 10 and 15 swapped, and part (b) had no diagram at all

**Q23 of the June 2024 Foundation paper, settled by the mark scheme rather than by reading the
row again.** The scheme prints P′ as 10, 11, 13, 14, 16, 17, which makes P = {12, 15, 18} — so 15
sits in the overlap and 10 sits in Q alone, the reverse of what the transcription said. The (b)
working, P ∪ Q = 10, 12, 14, 15, 18, is the same five numbers under either reading and so does not
distinguish them; the first does. A student copying the card would have been wrong by two numbers
against the scheme.

**And the description moved off part (a).** It is a fact about the FIGURE and both parts hang from
it: (b) asks for P ∪ Q and carried no description of the diagram at all, so the card was asking
about a picture it never showed. That is what a question-scoped preamble is for, and it is the same
argument as the AQA insert — one thing several questions hang from belongs to the question, not to
one part of it.

## June 2024 Foundation Papers 2 and 3, against the schemes rather than against me

**82 questions, every one read off `1MA1_2F_2406_MS` and `1MA1_3F_2406_MS`.** The 2017 Highers are
why that is the rule and not a preference: four answers there were subtly wrong because they were
DERIVED — a reading off a grid the algebra disagrees with, two single values where the scheme takes
a range, a ratio in a form the scheme also accepts.

**The arithmetic is still recomputed, because a scheme can be mis-READ.** Every intermediate the two
schemes print — 638 miles, 40.113, 6.333482454, 12.25, 18200, 942478, 29775, the whole two-way
table — is asserted in the script that writes the rows, so a number mistyped into this file fails
instead of shipping.

### Four rows were wrong about the paper, and two of them no check could have caught

| | |
|---|---|
| **2F Q19(a)** | carried *"[EXPRESSION NOT EXTRACTED — a fraction with 3.5 squared and 2.17 above, 46.891 cubed below]"*, **wrong in every term**. It is &radic;(35.2 + 1.7³) over 4.6² − 8.91 |
| **3F Q29(b)** | carried *"[FORMULA NOT EXTRACTED]"*. It is *p* = (*h* − 5)/3 |
| **2F Q24(a)** | said the table gives 0 at *x* = 1. The paper gives it at *x* = **0** |
| **3F Q13** | said Year 10 has German 34 and that 67 is the German total. Both are **Spanish** |

**The mark scheme proves the first one without the paper**, which is the part worth keeping: 1.7³ =
4.913, 35.2 + 4.913 = **40.113**, &radic;40.113 = **6.333482454**, 4.6² − 8.91 = **12.25**, and the
quotient is **0.5170189759**. All four of those numbers are printed in the scheme as partial credit.
The garbled version reproduces none of them. The page was rendered as an image anyway, because the
text layer gives `35 2 1 7 4 6 8 91 3 2 . . . .` — loose digits, the failure mode this file already
records four ways.

**And it proves the last one too.** The scheme's completed grid computes 27 **between** the two
numbers the paper gives Year 10, so those two cannot be adjacent columns — which settles that 34 is
Spanish without opening the paper at all. **Both of the last two are invisible to every check here**:
0 at *x* = 1 and 0 at *x* = 0 are the same value, and a two-way table with the right numbers in the
wrong columns is still a valid row. A student filling either in from the card would have been
writing in the wrong blank.

### Two faults in the marking column, found by reading what came out of it

**`12 km/h` was being split into the two acceptable answers `12 km` and `h`.** `set-accept.py` treated
the solidus as an "or", with a lookahead that protected `3/4` and did nothing for a unit — so the
single letter **h** was marked RIGHT. `2 g/cm3` split the same way. Measured across the library:
every `/` in an answer value is a unit or a fraction and **not one is a genuine alternative**, so the
slash no longer separates and the word "or", which a person wrote deliberately, still does.

**And a superscript that is not a fraction numerator is a POWER.** Deleting its tags ran it into the
base: `m<sup>4</sup>` was stored as `m4` and `10<sup>7</sup>` as `107` — values nobody would type,
so `3.42 × 10^7` was marked wrong. **88 accept values corrected**, and the one that looked wrong on
review (`9891` → `98^91`) turned out to be the row where the answer really is 98 to the power 91.

**This is the third round of the same shape** — after the fraction slash and the mixed number — and
the lesson each time is that the marking column is DERIVED, so it has to be read rather than
assumed. Six new cases in `check-marking.js`, which is 35 now.

### `.frac`, and the class name that would have collided

The library writes a bare fraction as `<sup>a</sup>&frasl;<sub>b</sub>`, which is right inside a
sentence and unreadable for an expression: Q19(a) is a square root over a difference of two squares.
`.frac` is a real component now — **and its classes are `frac-n` and `frac-d` rather than `num` and
`den`, which is not fussiness**: `.qsheet .num` already exists in this stylesheet as the SVG label
class for a drawn diagram, and these cards render INSIDE `.qsheet`. A second `.num` would have
inherited a 13px serif and a text-anchor meant for an SVG — **the `.price.faint` collision again**,
where a class reads as a decision and behaves as something else.

## The practicals are data now, and the join is the whole feature

**Asked for as "database the practicals... i guess they would be linked to topics? like measuring
wheel practical goes with area and perimeter".** That guess is right, and the file it needed was
already in the repository: `data/archive/practicals.json`, 41 experiments, 41 columns, exported
when the `Library` spreadsheet was emptied and read by nothing since. **This is `topicstuff` a
second time** — the archive holds what is unread, which is not the same as unusable, and that
folder's own README says so.

### What was wrong with the export, and all three faults are ones already paid for once

| | |
|---|---|
| `equipment_1 … equipment_10` | **the numbered-column fault, third occurrence.** `images` and `needs` both record the argument |
| `step_1 … step_10` | the same again — and `step_9`/`step_10` are empty on all 41 rows, two columns that exist so one practical could have had them |
| `category` beside `compliance` | **one fact in two columns.** Measured, they agree on all 41: `required` is exactly `AQA required practical` (28) and `fun` is the other two values (13). The finer one stays; a derived word does not need a cell. Same shape as `needs_print` / `print_required`, which cost 356 rows of disagreement |

**And the separator is a PIPE, which is measured rather than preferred.** `asList_` splits on commas
and is right about `topics` and `keystage`, where no value has ever held one. It is wrong here:
**14 of the 410 equipment cells carry a comma inside one item** — *"Nichrome wire (about 1 m, taped
to a metre rule)"* is one thing and *"Bunsen burner, tripod, gauze, heatproof mat"* is four, and no
comma rule can tell those apart. 73 of the 297 steps hold one too. Nothing in either column holds a
pipe.

### The topic that reached one question out of ninety-four

**The export had ONE topic per practical and the trundle wheel's was `Perimeter and area`.** It
reads perfectly. Measured against the library it matched **exactly one question**, because the
library spells that `Perimeter` (23), `Area of 2-D Shapes` (71) and eleven other ways. A join that
silently reaches nothing is this repository's oldest shape — `figure`, `orderPrints`, the four
message actions — and here it would have been worse than silent, because `Practicals` would have
been an answer in the funnel that quietly returned the wrong list.

**So every practical names topics in the library's own spellings, and carries two kinds:**

- **the subject topic** — the AQA unit it is assessed under, which is what a science teacher calls it
- **the maths topics** — what the practical actually makes a student *do*. The export already had
  this and called it `maths_link`. **This is the half that matters for a maths tutor**: "resistance
  of a wire" IS a straight-line graph through the origin, and a student stuck on direct proportion
  should find it.

**Written out by hand, not derived from the `maths_link` prose.** Parsing *"why intuition fails"*
into a topic is the mistake this file records twice — a scatter graph summarised in a sentence is
not a drawing instruction. Measured after: **2.8 topics per practical, median reach 64 questions**,
and the trundle wheel went from 1 to **107**. Three pure-chemistry practicals reach nothing and
that is correct rather than a gap: the library is a maths library, and Electrolysis shares no topic
with a past paper in it.

### The tree had to grow, and the risk was the other direction

`topicAreaOf_` answers "which branch is this on" from `data/topics.json` — ten roots, 269 rows, all
maths and English. **Twenty of the export's twenty-four topics are science**, so they resolved to
nothing. Three roots were added, **with AQA's own unit names** (`Cell Biology`, `Bioenergetics`,
`Homeostasis & Response` are printed headings of spec 8461), and the short forms the export already
used as aliases so no cell has to be retyped.

**Adding a root changes `topicAreaOf_` for every item, questions included** — its third pass
resolves by containment and only when all candidates agree, so a new root can take a maths topic
away from maths. `Energy`, `Forces`, `Waves` and `Rates` are ordinary English and were the danger.
**So it was diffed over the whole library before it was kept: one question of 4,152 moved**, and it
moved from a *wrong* answer to a right one — a GCSE lava-flow question tagged `compound units,
rates` had been resolving to **A-Level Pure Maths**, because "rates" is inside `Connected Rates of
Change`. `Compound Measures` answers to `rates`, `compound units` and `flow rate` now. Questions
with an area: 3,548 before, 3,548 after.

**`Density` is deliberately NOT a physics branch.** The maths tree already carries it as an alias of
`Compound Measures`, and a second home is two branches for one word — the `A-Level` / `Tier` overlap
`check-funnel.js` already reports. The one practical that called itself Density is filed under
`Compound Measures`, which is where a tutor looks.

### A substring said five practicals were required when they are not

`required: /required practical/i.test(compliance)` — and **`AQA-aligned, not a required practical`
contains the words "required practical"**. So the five that say outright they are not one were
flagged as one, on the card, in gold. **Found by the check printing a count that disagreed with the
data**: 33 against the transform's 28. Nothing threw. That is the whole argument for printing a
number rather than a pass — the same argument `papers checked against a total` already records,
where a rename took it 34 → 2 under a green tick.

### `subject` is the science, and `kind` is what it is

A physics required practical IS physics. Filing all 41 under a subject of their own would have put
Biology, Chemistry and Physics behind a door marked something else — **the `boxKind` mistake one rung
up**, where the division was written into `subject` and the Subject question then offered
Heavyweight beside Maths. So `kind: 'practical'` says what it is, `subject` says what it is about,
and the funnel needed a mapper and a card and nothing else.

**`item_ids` is the shop join and nothing reads it yet.** 20 of the 41 name the stock they need —
`I023,I026,I045,I022` is the trundle wheel, the tape measure, the cones and the first aid kit. The
shop rows live in the Settings spreadsheet, so this stays an id list until they are there: a name
would be the `findPerson`-by-name fault, and inventing the rows here would be a second shop.

### The strip said "lab · needs a lab", and a screenshot is what caught it

`venue` and `feasible` overlap on 14 of the 41 rows: every lab practical is `lab` **and** `needs a
lab`. Measured across all five combinations that exist, the only thing `feasible` adds that the
venue does not already say is the kit. So the venue is shown and `feasible` contributes one phrase
when it has one. **Fifth time this file writes that a screenshot is the last word on something
drawn** — all 41 cards laid out at 320px, no overflow, no error, and the repetition visible in the
first one.

## Checking your work

**The checks now run themselves.** `.claude/settings.json` registers a `SessionStart` hook —
`.claude/session-start.sh` — which installs the check dependencies if `node_modules` is missing,
then runs the whole suite and prints one of two lines: `all N checks pass` with N read off the run,
or the failures under
**`CHECKS ARE RED ON ARRIVAL — this is not something this session did`**.

**That second sentence is the point.** Every check here was good and none of them ran unless
somebody remembered; the failure mode left was starting work on a repo that was already broken and
spending the session unable to tell which half was yours. A minute and a half buys an unambiguous
baseline — a red after that is the thing you just did.

**That figure is written here and nowhere else, deliberately.** It said seventeen seconds in this
file AND in the hook's own comment for as long as it was seventeen, and went on saying it after the
suite had roughly doubled twice — the same fault as "all 18 checks pass". The hook's comment names
no number at all now; the run prints its own timings per check, which is the only version that
cannot go stale, and this sentence is a rough shape rather than a measurement.

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
node js/check-marking.js         # a right answer marked right, a wrong one wrong
node js/check-practicals.js      # the 41 practicals, and whether their topics join to anything
node js/check-funnel.js          # the real funnel over the real library: can each question narrow?
node js/check-const.js           # nothing declared `const` is assigned to. Two seconds.
node check/deploy.js             # after a push, does a browser that has the site run the new code
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
wrong tab, a `const` assigned to, a facet that cannot narrow, a CSS rule that wins only because of
where it sits in the file. The whole roster runs on every session start — the count is printed by
the run rather than typed here, for the reason the section above gives.

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

### `Library` is out of the backend entirely — all four tabs, both steps

`boxers`, `fights` and `cheatsheet` are the three tabs left in that file, and they pass the same
three-question test `questions` passed. **The one that decides it is the second**: measured,
`read(TAB.boxers)`, `read(TAB.fights)` and `read(TAB.cheatsheet)` appear **exactly once each, all
three in `doget.gs`**, and no `setCell` or `append` anywhere names them. Nothing writes to them, so
code can hold them.

**Both steps are taken and the spreadsheet is unreachable from the code now.** Step 1 built the
machinery with the payload still answering while the files were empty; step 2 exported the rows and
cut the backend. It took two commits because every Google *host* is blocked from this environment by
network policy — but the **Drive MCP connector is not**, and that is what finally reached the sheet.

| | |
|---|---|
| `data/boxers.json`, `data/fights.json`, `data/cheatsheet.json` | **103 + 157 + 77 = 337 rows**, committed |
| `libraryExtras_` in `js/library.js` | the three mappings — now the ONLY implementation |
| `doget.gs` | the three `read(TAB.x)` blocks deleted; `boxers: []`, `fights: []`, `cheatsheet: []` kept in the payload literal |
| `constants.gs` | `SCHEMA`, `TAB` and `WHERE` ×3 deleted, `LIBRARY_ID` and `FILES.library` gone |

**The cutover was proved byte-identical before it was made**, which is the only reason it was safe
to make in one commit. The exported rows were run through `libraryExtras_` and compared cell by cell
against what `doGet` built from the same tabs: **337 rows, 0 cells differ.** Getting there found
three real helper drifts that a "looks the same" reading would have shipped — `ON_` and `libOn`
disagreed about `✓`, `S` trims where `libS` did not, and `N` and `libN` differ on a blank — so the
mappings were made to agree rather than assumed to.

**`SCHEMA` had to go in the SAME commit as the `doGet` blocks, in both directions.** Deleting the
`SCHEMA` entries alone fails `check-columns.js` with 77 findings — every `r.boxer_id` in a block
that still exists, against a tab the code no longer describes. And leaving them behind is worse than
untidy: `ensureSchema` walks `SCHEMA` and **CREATES any tab it cannot find**, so an entry left in
rebuilds an empty `boxers` tab on the next `?setup=1` — right headers, no rows, exactly the decoy
that hid the real resource rows in another file for months. That is the third time this file records
that argument, after `SCHEMA.resources` and `SCHEMA.questions`.

**What the `[]` fallback means now, because it changed and nothing else would say so.** It was *a
file with no rows leaves the payload's copy alone*, which made step 1 incapable of taking anything
dark. There is no payload copy left — `doGet` sends three empty arrays and nothing fills them — so a
file that 404s is now three dark screens rather than a quiet reversion. It stays that shape anyway:
the alternative is a throw on a file that has not deployed yet, and that takes the whole of `load()`
with it. Written down here and in `library.js` so it is not rediscovered as a bug.

**`check-library.js`'s step-2 notice is what confirmed the cut, and it was proved in both
directions.** Putting one `read(TAB.boxers)` back makes it print *"data/boxers.json now has 103
row(s) AND doget.gs still builds payload.boxers"*; the real files print `none`. That rule had been
pushing to an array nothing printed for as long as it existed — it could not fire, because all three
files held `[]` from the day they were committed, so the first run that could say anything was the
run after the export.

**And `installSheetWatch` has to be re-run after this deploys.** It deletes every trigger by handler
name and rebuilds one per id in `FILES`, so a file *removed* from that list keeps its trigger until
somebody runs it again. `Library`'s is still booked against a spreadsheet nothing reads: harmless,
and still a payload rebuild a minute after every edit somebody makes to it.

**The files hold the sheet's own column names** — `boxer_id`, `height_cm`, `part_id` — not the
camelCase the phone reads. A file that is a faithful export is one you can paste a row into without
translating it, and the single place that renames a column is the mapping. Two spellings in two
places is what `r.link` against `source_url` cost: seven silent reads.

**The one-object-per-line shape is enforced on all four files** and for the reason `questions.json`
has it: the next script to append by splitting on newlines.

#### The spreadsheet itself is NOT deleted, and there is a reason to look before it is

Nothing in this project opens `Library` any more, so deleting it breaks no code. **Do not delete it
yet.** It has **16 tabs and 13 of them are read by nothing** — `bible` (31,102 rows), `questions`
(3,913), `P&R` (273×42), `topicstuff` (269), `english-devices` (180), `M&Pformulas` (96), `icons`
(81), `graphemes` (72), `practicals` (41×41), `_mat-components` (17), `orth` (15), `Verbs command`
(12), `_README` (8). Some of that is the old `questions` tab this repository replaced; some of it is
content nobody has looked at, and a deletion is the one thing here that cannot be undone by a
revert.

**And the `questions` tab still carries `ticks_1/2/3`** — 498 non-empty cells across 169 rows, 469
of which look like people's names. This file says those columns were *"stripped at source"*, and
that sentence is true of `data/questions.json` and **false of the spreadsheet it came from**. They
are not published — the sheet is private and this repository holds none of them — but "stripped at
source" reads as *they are gone*, and they are not. The tick rule in `check-library.js` guards the
public file, which is the half that can leak; the sheet is the owner's to decide about.

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
student thinks of as one thing. Anything outside the two series keeps its own month, because a
January sitting was a real thing until 2013 and collapsing it would invent a fact.

### The series is named for its season, and it used to be named for a month

**Summer months became `June <year>` and autumn months `November <year>`**, because that is what the
boards and every past-paper site print. **Reported as a bug the day the first May paper went in**:
the card read *"Paper 1 (Non-Calculator) — May 2017"* and the filter offering it read *"June 2017"*,
so somebody scanning the Sitting list for their paper concluded it was not there. Measured, and it
is not one odd row — **every Paper 1 of every summer series sits in May and Papers 2 and 3 sit in
June**, so a third of the Edexcel library was disagreeing with its own filter.

**`Summer 2017` is true of a paper sat in May and of one sat in June, and `June 2017` is not.** It
is also the boards' own word for a series when they are not naming a month — JCQ publishes the
summer and the autumn series — so nothing is invented, and a paper arriving in a month nobody
expected still lands on the season its month belongs to rather than opening a thirteenth button.
Measured after: twelve answers, newest first, `Summer 2017` holding 100 questions across five
papers, one of which is the May one.

**Search was the other half and it was already right.** A paper's own name carries its own month, so
`may 2017` finds 34 questions and `june 2017` finds 70 — the season names the BUTTON, not the paper.

**And `check-funnel.js` rule 4 went from a shape to a list, which is the repair.** It was the regex
`^[A-Z][a-z]+ (19|20)\d{2}$` — any capitalised word and a year — so it passed the whole rename
without noticing that the funnel's sitting vocabulary had changed underneath it, and it passes
`Sumer 2017` too. It is a closed list of the fourteen series words now: same argument as `VOCAB` in
`check-library.js`, and the same fault `resource_type` sitting in `VOCAB` after the rename already
cost once. Proved by mutation — `Sumer` fires it, the real file is green.

### "On the app it's just text" — a question whose picture never came across

**Reported with a photograph of the paper beside it.** `Q-1MA1-1705-1H-4` is a square ABCD split
3 cm / *x* cm on two sides, with two dashed lines and four dimension arrows, and the app drew the
sentence *"A square ABCD is divided so that one side is made of a 3 cm piece and an x cm piece."*
That is enough to sit the question from only if you already know what the picture looked like.

**Drawn rather than photographed**, which is the rule this file already carries under `diagram`, and
it has two halves: the drawing takes the page's own ink, so it works on both palettes, offline and
at any zoom — and a photograph of an Edexcel page is their copyright where a figure redrawn from the
data printed on it is not. `diagram_by: family` carries the credit and `figCredit_` prints it.

**Not to scale, and the paper's isn't either.** *x* works out at about 0.16 cm, which drawn to scale
is a hairline nobody can label. The split is 3 : 1.3, the paper's own proportion. Q5's rectangle IS
drawn to scale, because there the shape is the question — seeing the diagonal as the hypotenuse of a
12-5-13 triangle is the method.

**Arrowheads are triangles, not `<marker>`s.** A marker needs an id, and `fillStuffPages` keeps about
five question cards in the DOM at once, so two questions carrying a diagram would put two elements
with the same id on one page and the browser would resolve both to whichever came first.

**A table is not a picture.** `Q-1MA1-1705-1H-13a` carried `figure: 'table'` and the transcription
had turned the printed table into a sentence — *"a table gives y = 9, 2¼, 1 and 9/16 for x = 1, 2, 3
and 4"* — which is four pairs a reader has to re-pair by counting along two lists. `.qsheet table`
has been in the stylesheet since before anything here could produce one.

#### Which ones are safe to draw, and the count of the rest

**Only where the row's own words determine the picture.** Sixteen questions in this one paper are in
this state and they are not one problem. *"The four sides of a 12 m by 5 m rectangle and one
diagonal"* is a drawing instruction — exactly one figure answers it. *"A scatter graph… thirteen of
the points climb steadily from about (9.5, 11.5) to (15, 20)"* is a SUMMARY of fourteen plotted
points, and a drawing made from it would be fourteen points nobody plotted, on a card carrying the
exam's authority. That is the shape this file already records twice: a renderer that printed "not
drawn yet" off the `figure` column and was wrong on ~120 questions, and a curve read by eye that
gave 50 where the pixels said 48.1.

**So `check-library.js` counts them: 485 questions across the library**, worst papers named, with
the answer-space labels (`grid-blank`, `fractions`, `boxes`, `long-method`) excluded because those
questions are complete as they stand — `figure` is two columns under one name and this is why the
rule is a count and not a refusal. Printed, not failed: it is editorial work needing the original
paper open beside you. A number is something somebody can act on; a silence is how 485 of them
accumulated unnoticed.

### An answer is labelled with the shortest form that is still unique

**Reported as "it should say paper 1 paper 2 paper 3".** What it said, six chips deep on Maths ·
GCSE · Higher · Summer 2017, was `Paper 1 (Non-Calculator) — May 2017`, `Paper 2 (Calculator) —
June 2017`, `Paper 3 (Calculator) — June 2017`.

**Every word after the number is something the person has already answered.** They chose the sitting
one question ago, so the date is the funnel reading their own chip back to them three times — and in
the spelling that caused the complaint before this one, because the chip above says `Summer 2017`
and the answers under it say May and June.

**The name is a composite and its separators say where to cut.** `Paper 1 (Non-Calculator) — May
2017` is a number, a qualifier and a date in that order, and so are
`Paper 2A: Study of religion (Christianity) — June 2017` and a venue called `St Mary's Hall
(Room 2)`. `nameForms_` cuts at the spaced em dash and at `:` or `(`, and `shortLabels_` tries the
rungs shortest-first.

**Uniqueness is the only thing that stops it, and it is measured over the answers on screen.**
Measured both ways: narrowed to maths the answers are `Paper 1`, `Paper 2`, `Paper 3`; widen to the
whole of Summer 2017 and the RS papers join them, so `Paper 1` would be two papers on one button and
the rule falls back one rung to `Paper 1 (Non-Calculator)` beside `Paper 1: Philosophy of religion
and ethics`. Same reasoning as `spellShow_` folding within the list: narrowing cannot change which
ITEMS an answer holds, only how short its label can safely be.

**A plain hyphen is not a separator**, deliberately: this library writes `A-Level` and
`Capture-recapture`, and cutting there would offer `A` as an answer. A dash that separates is spaced
and long.

**`value` is untouched, and that is the half that makes it safe.** `filterHit` matches the chip
against `facet.of(x)` through `spellKey_`, so a chip holding a shortened name would find nothing and
narrowing by paper would silently return an empty list. The row carries the full name in
`data-value` and the short one in its text — exactly how `spellShow_` already separates the two.
Measured: pressing the row labelled `Paper 1` stores `Paper 1 (Non-Calculator) — May 2017` and
returns the 31 questions the row counted.

**On every facet, not on the one that prompted it** — the `cost: 0` / `paper: true` lesson twice
recorded. A name with no separator has one form and comes back unchanged, so `Maths`, `Higher` and
`Summer 2017` are untouched by construction.

**`check-funnel.js` test 4b is the guard, and the mutation proves the rung test is load-bearing.**
Forcing the shortest rung regardless of uniqueness collapses `Trigonometry` onto
`Trigonometry (A-Level)`, and three pairs of Corbettmaths worksheets onto one another — real answers
made unreachable with nothing on screen saying so, which is the `Alevel` / `A-Level` fault with the
spelling hidden instead of shown. The real file is green.

### `exam_date` — the day the paper was sat, which nothing had ever drawn

**A series is not a date, and somebody asked for the date.** `exam_date` went into the file, passed
`check-library.js`, and **nothing read it** — a column written and never read, which is this
repository's oldest shape and already recorded here under `figure`, under `orderPrints` and under
the four message actions. `satOn_` draws it under the paper's name: *"sat Thursday 25 May 2017"*,
which is the sentence a tutor sitting down with a student actually says.

**Read by pattern and built in UTC**, never `new Date('2017-05-25')` against the machine's clock — a
paper that is Thursday in London and Wednesday in New York is the `waveOf` timezone fault in a
second column, and that one cost seven buttons.

**On one paper so far, and that is the design.** Edexcel took the exam date off the front page in
2021 and the © line narrows it to a year, so a date is a fact somebody has to know rather than
derive. An absent one draws nothing rather than guessing, and the paper's own name — which always
carries its month — goes on being the subtitle either way. `check-library.js` prints
`1 of 665`, with a denominator for the same reason `total_marks` has one.

#### The URL slug is NOT the exam date, and eight Saturdays are the proof

**41 documents carry a `source_url` with a full date in the filename** — `1MA1_1H_que_20211103.pdf`
— which reads as 41 free exam dates waiting to be copied across, and this file's own note about the
©2021 papers points straight at them. **Eight of the 41 land on a Saturday**: `P-1MA1-2306-1H` on
2023-05-20, four November Paper 2s, and both the 2022 and 2023 summer Paper 1s. Nobody sits a GCSE
on a Saturday, so that slug is a PUBLICATION date at least some of the time — and there is no way
from inside this environment to tell which of the other 33 are exam dates and which are not, because
every exam-board host is blocked by network policy. Bulk-filling from it would have put a confident
wrong day on a third of the library, and a wrong day is worse than no day: a tutor reads "sat
Thursday" and knows it was a Friday.

**The weekend is the one half a checker can settle**, and it is now a rule. The two rules that were
already there compare `exam_date` against the `year` and `month` on the same row — filled in by the
same person in the same sitting, so a date that is simply wrong agrees with both and sails past.
A Saturday needs no timetable to refuse. It cannot tell a Tuesday that is wrong from a Tuesday that
is right — only somebody holding the paper can — but it refuses the whole class of mistake that
produced those eight. Proved by mutation: `2023-05-20` on the June 2023 Higher paper exits 1.

**And nothing in the data needed correcting.** Checked across all 665 documents: **zero** rows whose
name names one month while the `month` column says another. The Edexcel Paper 1s always said May and
always carried `month: 5`; what was wrong was the button above them, and that is the rename in the
section before this one.

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

#### And its observer had never run, because one timer was holding three jobs

**`afterSlide_` kept one `setTimeout` and cleared it on every call.** That is exactly right for one
caller asked twice — a run of quick swipes should fill the pages once, at the end — and silently
wrong the moment two DIFFERENT jobs are booked for the same slide.

**`paint()` books two, four lines apart**: `reelsWatch_`, and then `startScreen_(AT)`. The second
always won. **So the reel column's observer has never once run** — no slide has ever asked Commons
for its photograph, and every reel anybody has ever seen has been the bare gradient that
`.feed-art`'s own comment calls "the floor, not a placeholder". Nothing threw, nothing was missing,
the screen worked, and it quietly did half of what it was written to do.

**Found by counting the observers in a browser, which is the only way it could have been found.**
Both lines are correct; the fault is in the thing they meet in. `REEL_IO_ART` came back `false` and
`.reel.is-watched` came back 0 on a screen with four slides on it.

**Coalesced per job now, not across jobs.** The key is the function itself where the caller passes a
named one, and a word where it passes an arrow — a fresh arrow is a different key every call, so
keying on identity alone would queue one `startScreen_` per swipe and undo the coalescing the timer
was built for. Last booking of a key wins; every key runs, each in its own `try`. Proved in both
directions on the reel column: 0 observers before, 4 after, and 28 journeys plus 100 UI combinations
unchanged.

### A reel is a video, and the column was drawing the widget's card in its own words

**Asked for as "the reels will look like the other widgets. most like the one more thing widget. but
infinite going down."** Three things, and each one was a different fault.

**`.reel .over` WAS A SECOND DESCRIPTION OF `.feed-art`.** The same object — a subject, a heading, a
paragraph and a credit over a picture — written twice in one stylesheet and twice in two files, with
its own gradient, its own scrim and its own type sizes. `factsNow_` had already settled where a fact
COMES from and the two surfaces still did not look alike, because nothing had settled how one is
DRAWN. `feedSlide` is the one renderer now and `.reels` keeps only the column: how a stack of slides
scrolls and snaps, which is the half the widget genuinely does not have.

**IT DREW ALL FIFTY-EIGHT AND STOPPED.** Fifty-eight is a lot of slides and it is still a bottom —
and it was fifty-eight boxes and fifty-eight observed elements on the first paint of a screen showing
one of them. **`feedItem(n)` has never had an end**: the "One more thing" widget has walked it
forwards since it was written, because `feedShuffle` deals another pass whenever the deck runs out,
seeded by the day and by how many passes have gone before. The infinite column is that function read
one index at a time — four slides on open, four more when the last is two away. Nothing new decides
what comes next. Measured: 4 on open, 28 after six flicks to the bottom, no sideways scroll at 320.

**`clip` is a fifth field, not a second tab.** A reel with one plays it; a reel without one keeps the
photograph `pic` finds. Two tabs would be two schemas, two reads, two mappings and two empty states
describing one object — the `needs_print` / `print_required` lesson, which cost 356 rows of
disagreement. **A row with a clip needs no heading**: `factsNow_` kept a row only if it had one,
which is right for a fact and wrong for a video, and is the same argument as the chessboard that was
made to stop drawing its own title.

**TWO ADDRESSES FOR ONE DRIVE FILE AND THEY ARE NOT INTERCHANGEABLE.** `uc?export=download` answers
with the BYTES, which is the only form a `<video>` can mute, autoplay, loop and pause; `/preview`
answers with an HTML PLAYER, which can only be an iframe with Google's own chrome and a play button.
The first is the one worth having and it is also the undocumented one — and **every Google host is
blocked from this environment by network policy**, so which of the two a real browser gets is a fact
one open of the live site settles and nothing here can. That is exactly why there are two: `error`
on the `<video>` swaps in the iframe. Proved by answering the Drive request with a 404 — the iframe
arrives and the sound button, which cannot reach inside one, is removed with it.

**And the video was painted black, which a screenshot caught.** An opaque element over `.feed-art`
covers the gradient, so a clip that has not loaded is a black rectangle where every other slide is a
finished thing — the exact fault the gradient exists to prevent, one rule along. It is transparent,
and `has-photo` (the scrim, the white words, the vanished initial) arrives on `loadeddata` rather
than on the first paint, which is the same moment and the same reason the photograph branch adds it.
Measured in four states: waiting, loaded, errored, and sound on and off again.

**`.reel-sound` was a gold bar across the top of the slide**, because `.btn` is `width: 100%` — right
in a form, wrong absolutely positioned. `.btn-row .btn` already says the same thing for the same
reason. 44px, in px, which is this file's fifth conviction of that rule.

#### And then the facts came off it, because a reel is a video

**Reported from a screenshot of the column: "no more factoids on this yh? its just the videos".**
It opened on a green gradient reading *"Notre-Dame took nearly 200 years"* — a perfectly good fact,
and not a reel. The clips were pinned in front of the deck and the deck was still underneath them.

**One list, two surfaces, and they want different halves of it.** So it is a filter here rather than
a second source: `factsNow_` still answers both, the sheet still wins over the code, and a clip row
is still just a row with a `clip` in it. The "One more thing" widget goes on dealing the whole deck,
which is where the facts belong — they are a thing you tap for, not a thing you scroll past.
Splitting the data instead would be two tabs, two empty states and two things to keep in step.

**A column with no clips says so rather than filling itself with facts.** Showing the next best
thing is exactly how this screen came to be showing the wrong thing.

**"For ever" is a LAP now, and with two clips that is plainly a repeat.** Saying so beats a column
that stops dead two flicks in and reads as broken; it stops being a repeat the moment there is a
third clip, with nothing here to change. **And it is bounded**, because a video is not a div: every
watched slide holds a decoded `<video>` with a `src`, so an unbounded append is a megabyte a flick
with nothing released. `REEL_MAX = 60` is a stated ceiling — thirty laps of two — rather than a leak
nobody measures until a phone gets hot. Measured: every slide a clip, the two ids alternating, 6 on
open and 60 at the cap after forty flicks.

**And the photograph fetch went with the facts.** It asked Commons for a picture off the slide's
`pic`, one screen ahead — right while a slide could be a fact, and dead the moment `reelItem_`
cannot return one without a clip. A reader left standing over a permanently false condition is the
shape this file records under `resource_type` in `VOCAB` and under `libraryInto_`'s dead
`kind === 'paper'` guard. `feedPicture` is untouched and still draws the widget.

##### "No clips yet" was two different answers wearing one sentence

**Reported with a screenshot of that card**, and I could not tell from it which of two things had
happened — so the first fix was to the SCREEN rather than to the cause. A column that has looked at
fifty-eight reel rows and found a clip on none of them is a data problem. A column that has looked
at **nothing** is a code problem: `chess.js` holds the built-in list, and a browser serving a copy
of it from before clips existed reports exactly the same empty card. The count is the only thing
that can say which, and it is this repository's oldest fault for the fifth time — *I did not manage
to look*, printed as *I looked and there was nothing there*.

**Measured against the real Settings spreadsheet while looking for the cause: there is no `facts`
tab at all.** `fact_id` appears nowhere in it and neither does `clip`; every hit on the word "facts"
is inside a campaign's `blocks` column. So the sheet is not the explanation, and that is worth
writing down because this file has said "the tab is empty" for a while when the truth is that
`?setup=1` has never created it.

**And the hunt found a real trap underneath.** `factsNow_` is all-or-nothing — the tab has rows, so
the tab is the answer — which was right while both surfaces wanted the same list. The Reels column
wants only the clips, so **one ordinary fact typed into the sheet would have hidden every built-in
clip** and taken the column dark. The house rule is per LIST: `clipsNow_` asks the sheet for rows
with a clip and falls through to the code's when it has none, exactly as `factsNow_` does for facts.

**`reelItem_` was a SECOND reader of "which clips" and the mutant is what caught it.** It still
filtered `factsNow_` while the screen asked `clipsNow_`, and the two disagree precisely in the case
being fixed: one typed fact gave `{slides: 0}` under a card reading just "Reels" — heading,
scroller, no slides, no empty state either. A second reader of one thing is a second chance to
disagree about it, which is what this file says about `documents_()`, `paperIdOf_` and `factsNow_`
itself. **Proved on four payloads**: the real files (6 slides), the built-in clips stripped ("Looked
at 60 reel rows and none of them has a clip"), the list emptied ("no reel rows at all"), and one
sheet fact beside the code's clips (6 slides, where it was 0 before).

### AQA Physics 8463/1H is transcribed, and the first wide table in the library broke a rule

**43 questions, every answer read off AQA's own 8463/1H scheme.** The 2017 Highers are why that is
the rule and not a preference, and `tools/insert-aqa-physics-8463-1H.py` asserts **both** totals
before it writes a row: the cover's 100, and the ten boxes down the margin — 10, 10, 9, 10, 13, 9,
8, 8, 11, 12. A dropped part or a misread mark count fails in the script rather than shipping.

**Three answers are PICTURES and were rendered rather than remembered.** 03.2 asks which of four
graphs shows resistance against length; 05.4 and 10.2 ask you to draw a thermistor and a fuse. All
three print a drawing in the scheme and nothing in the text layer, so all three were rendered at
scale and looked at — *a screenshot is the last word on a drawing*, for the sixth time. 03.2 is a
straight line from the origin, which is also what R = ρL/A says, and the answer is written as that
sentence rather than as a box letter nothing here can see.

**What a figure carries is said, and attributed, and never written into the question.** Eight parts
hang off artwork: a circuit, a fission diagram, three photographs, three graphs a value is read off.
Each carries `figure` so `check-library.js` counts it, and where the SCHEME states the number the
figure would have given — 80 Ω at 20 °C, about 3 cm of air, 7.1 × 10²⁰ Bq — it is in
`examiner_note` saying it came from the scheme. The alternative is a question that reads as though
the paper printed a number nobody transcribed, which is the fault this file records under the
scatter graph and under the curve read by eye.

#### `check/cards.js` caught my own table, and then it caught the check

**Table 1 went 26px past a 320px column.** Four columns — method, energy stored per 100 kg,
percentage wasted, installation — and every table in the library before it had three or fewer, so
the rule had never met one that cannot shrink. Caught on the commit that added it, which is the
whole argument for laying out all four thousand rows rather than sampling.

**The house rule says which way it goes**: the page body never scrolls sideways and *"only wide
tables, code and diagrams may run past it — each gets `overflow-x: auto` on its own container"*.
Squeezing the columns instead would have been `.mat-face` again — the label that cannot shrink is
the one that breaks, and "Percentage of stored energy wasted" is four words that have to stay.
`display: block` is what makes it possible at all: a `table` box ignores `overflow` because it is
not a block container.

**And then the check went on reporting it**, because the overflow had moved from the card to the box
now holding it deliberately. **CLAUDE.md already states the question this check is asking** — *"does
this box scroll sideways when it was NOT told it could"* — and the code was asking the other one. It
skips an element whose computed `overflow-x` is `auto` or `scroll` and **does not skip its
ancestors**, which is the half that keeps it honest: a scroller cannot hide a card that is genuinely
too wide, because the card is measured on its own pass. **Proved by mutation**: put the table back
to `visible` and it fires on `.qsheet` at the same 26px.

#### And the headline sentence had gone stale, which the transcription is what exposed

**"61 Edexcel GCSE maths papers checked at 80 marks"** — `marks.size` is every paper summed against
a declared total, whoever set it, and the whole point of `total_marks` was to stop that rule knowing
about one board. It stayed readable while the only papers with a total WERE Edexcel maths at 80; the
first AQA paper summed against its own 100 made it plainly false. Fourth time this file records the
shape, after "all 18 checks pass", "one of the eighteen names", and the prose over `CARD_W` naming
88% and 4% while the code said 80 and 8. It says what the number is now.

### Eighteen science papers, named off their covers rather than their filenames

**`newbatch` holds eighteen June 2024 science papers and not one filename says which subject it
is.** AQA names every subject's download `Question paper (Higher)_ Paper 1 - June 2024.pdf`, so
Drive had disambiguated them into `(1)`, `(2)`, `(3)` — an ordering that means nothing. Every one
was identified by reading the front cover, which is the rule this file already records for the
Edexcel codes: **check the metadata and the cover before reading a single page.**

| | June 2024, all with mark schemes beside them |
|---|---|
| **AQA Biology 8461** | Foundation Papers 1 and 2 |
| **AQA Chemistry 8462** | Foundation Papers 1 and 2, Higher Papers 1 and 2 |
| **AQA Physics 8463** | Foundation Papers 1 and 2, Higher Papers 1 and 2 |
| **Edexcel Combined Science 1SC0** | Higher Papers 1–6 — **no mark schemes** |

**And the file named `Insert (Foundation)_ Paper 1` is not an insert.** It is AQA's **Physics
Equations Sheet**, stamped "FOR USE IN JUNE 2024 ONLY". Read as the filename says it, an AQA insert
means English Language — and this library already holds two English papers whose source is a
`placeholder` row waiting to be replaced. Opening it is the only thing that stopped a formula sheet
being filed as a reading source.

**The Edexcel slug is a publication date, and this is the second proof.** Every one of the six
carries a full date in its filename and **every one is a day after the date on its own cover** —
`1sc0-1bh-que-20240511.pdf` over *Friday 10 May 2024*. One is worse: `1sc0-1ph-que-20240822.pdf`
over *Wednesday 22 May 2024*, three months out. This file already refuses to bulk-fill `exam_date`
from that slug on the evidence of eight Saturdays; six papers with a consistent +1 offset and one
with a wrong month is the same finding from a different board.

**`paper` goes to 6, and the cap was never a rule about exams.** 1SC0 is six papers — biology,
chemistry and physics, each sat twice — and its own covers read "Combined Science PAPER 4" over the
code `1SC0/2BH`. A vocabulary of `1, 2, 3` was the shape of the one qualification somebody had in
front of them, which is the sentence this file writes about `isEdexcelGcseMaths`. `Equation booklet`
is a seventh `needs` for the same reason `Periodic table` was a sixth: four 8463 covers and two
1SC0 covers hand the student a sheet of formulae, and what is on the table beside them is what this
column is for.

#### The transcription queue was in neither count

**`marks` is keyed off QUESTION rows**, so a document row carrying `total_marks` with nothing under
it yet is in neither of the two numbers this check prints: not "checked against a total", because
there is nothing to sum, and not "no total to check against", because it has one. **Sixteen science
stubs went in across two sittings and both numbers stayed exactly where they were** — 60 and 186,
before and after.

**That is a count doing its job and hiding something at the same time**, which is the shape recorded
here twice already: `papers checked against a total` going 34 → 2 under a green tick, and a
substring calling five practicals required. So the third number is printed, and **it is 87** — the
sixteen sciences plus seventy-one maths papers that have been identified, given a total, and never
transcribed. Nobody had ever counted them. A stub with a total is not a fault and it is not nothing:
it is the queue, already carrying the one number that will refuse a wrong transcription the moment
anybody starts typing one.

**Ten lines and a remainder**, because eighty-seven on every run is a list nobody reads. That is
`ACCEPTED_TAP`'s argument pointed the other way: that one prints in full because it must not grow,
and this one is meant to.

### AQA Chemistry, as two document rows and nothing else yet

**What was added to Drive as "higher 2024 bio" is AQA GCSE CHEMISTRY 8462**, Higher, Papers 1 and 2,
June 2024, question papers and mark schemes — read off the front cover of each rather than the
filename, which is AQA's own generic `Question paper (Higher)_ Paper 1 - June 2024.pdf` and names no
subject at all. Paper 1 is uploaded twice, byte for byte, under `(1)` and `(2)`.

**The paper row is the part that can be right before anything is transcribed**, and it is the part
that decides where every question under it lands: board, spec code, tier, paper number, the month,
the exam date off the cover, and the total the cover states. **100 marks each**, so
`check-library.js` will refuse a transcription that does not sum to it — the one end-to-end check the
library has, in place before there is anything to check.

**`Periodic table` is a seventh `needs`.** The chemistry cover lists it beside the ruler and the
calculator, in the same sentence, as a thing you must have — and like the calculator it is a fact
about the PAPER, so it sits on the document row and covers every question inside.

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

## AQA Physics 8463/2H, and the check that could not see inside a drawing

**43 questions against `Mark scheme (Higher)_ Paper 2 - June 2024`**, read rather than derived. The
cover says 100 and the scheme's own `Total Question n` lines say 13, 14, 16, 14, 9, 8, 18, 8; both
are asserted in `tools/insert-aqa-physics-8463-2H.py` before a row is written. So are the numbers
the scheme prints back inside its own working — ½ × 56 × 220 = 6160, 56 × 380 = 21 280, 36 ÷ 120 =
0.3, 110 000 000 ÷ (1026 × 9.8) = 10 940, 3.6 × 10¹⁷ ÷ 3.0 × 10⁸ — because a scheme can be
mis-READ, and a number mistyped into the script now fails there instead of shipping.

**Four figures are drawn and seven are described, and the line between them is the one this file
already draws twice.** Figure 2 IS Table 1 plotted, Figure 7 is one triplet of absorption lines at
three shifts, Figure 9 is four letters at 45°, 90°, 135° and 180° round a circle, and Figure 12 is
five coordinates the mark scheme quotes back — each is a drawing instruction with exactly one
answer. The baby walker, the gears, the submarine, the headlight, the trolley runway, the ammeter
demonstration and the microphone are apparatus photographs: they carry `figure` so
`check-library.js` counts them, and what they show is said in prose. **Figure 7 is built from one
base triplet and two offsets** rather than nine independent lines, because "the lines have the same
pattern" is the question's own first sentence and a picture whose patterns did not match would
contradict it.

### `check/cards.js` was measuring inside the drawings, and CLAUDE.md already said why that is wrong

**It reported 5 rows up to 21px past the column and every one was a false alarm.** A y-axis label is
written once and rotated into place — `<text x="12" … transform="rotate(-90 12 98)">` — so its
LAYOUT box runs from x = −51 while the glyphs it paints sit at x ≈ 12. **That is this file's own
entry under `.mat-out`**: *"a transform is invisible to `scrollWidth`"*, which cost two wrong fixes
the first time and would have cost the axis labels this time.

**And nothing inside an `<svg>` can push the page sideways at all.** The outermost `<svg>` clips to
its viewport — the UA default, not a rule this repository set. So the rule is narrow and provable:
the `<svg>` is an ordinary replaced element in the HTML flow and is still measured; its descendants
are not. **Proved by mutation in both directions** — forcing `.qsheet figure svg { width: 400px }`
still fires, on the `<svg>`, at +104px across 66 rows.

**`className` on an SVG element is an `SVGAnimatedString`, not a string**, so every finding inside a
drawing printed as `[object Object]` — one grouping key for every cause, in the one report whose
grouping exists so that fifty rows with one cause are one line.

### A screenshot caught two more, and neither measured wrong

**`text-anchor` as an attribute lost a specificity race it did not look like it was in.**
`.qsheet .num` sets `text-anchor: middle`, and **CSS beats an SVG presentation attribute** — so
`text-anchor="end"` on the y-axis numbers did nothing and all ten sat centred on the axis line.
Same shape as `.price.faint`: it reads as a decision and behaves as nothing. Inline `style` now.

**The same fault clipped the Earth's own layer names.** `Liquid outer core` is the widest text in
Figure 9; anchored `middle` instead of `end` it ran off the left of the viewBox and the `<svg>`
clipped it to `quid outer core`. The Earth sits right of centre now so the three names have room to
read leftwards off their leader lines. **Seventh time this file writes that a screenshot is the last
word on a drawing.**

**And a plot is sized by how many labels it has to carry.** Ten values up a 136-unit axis at the
13px this stylesheet sets for `.num` is ten labels in the space of ten labels, which came out as a
grey smear. Both graphs go through one `axes()` now — one scale placing the marks, the ticks and the
labels — and the box height is derived from the label count rather than guessed.

## AQA Chemistry 8462/1H, and a figure with no text layer and no vectors

**44 questions against `Mark scheme (Higher)_ Paper 1 - June 2024`.** Cover total 100, margin boxes
10, 11, 8, 14, 10, 11, 15, 9, 12, and every intermediate the scheme prints inside its own working —
232, 168/232, 40 000 ÷ 160, 250 × 3/2, 2(347) + 5(498), 6(805) + 8(464), 3139 ÷ 8 — recomputed in
`tools/insert-aqa-chemistry-8462-1H.py` before a row is written.

**Figure 3 is a raster image inside the PDF.** No text layer, no vectors, nothing to extract — so
the gridlines were found by their own regular spacing, the scale fixed from them (2.5 °C and 0.10 g
per major division), and the eight crosses located as dark blobs. That is this file's own rule for a
picture carrying data, and **the mark scheme is what proves the scale**: it reads the crossing point
of the two lines of best fit as 0.8 g and 47 °C, and that lands exactly on the fifth cross.

**Two figures are drawn and the drawing IS the question.** 02.4 is *"plot the data from Table 1 on
Figure 1"*, so the picture it needs is the grid with nothing on it — and with the grid there,
`padSource_` lays a pen over it and the question can be answered on a phone. 04.1 asks for two lines
of best fit on Figure 3, so Figure 3 is drawn with its eight measured crosses and nothing else. The
library's drawable-question count went 8 of 139 to **10 of 141** — and the first version of
this paragraph said 12 of 143, a number I wrote down instead of reading off the run, which is
the fault this file records as "all 18 checks pass".

**And where a picture decides the answer but cannot be drawn, what it shows is in the question's own
words.** The blue patch by the negative electrode and the yellow by the positive; the four reaction
profiles and which way each arrow points; the three-carbon chain of propane. A question about a
picture you cannot see is not a question — which is the fault this file records under *"on the app
it's just text"*, one paper along.

### `tools/svgplot.py` — one plotter, because the third graph would have been the one that drifted

`axes()` was written inside the Physics 2H insert script and the Chemistry paper needed it the same
afternoon. **Two implementations of one thing is two chances to disagree about it** — this file's
sentence about `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` — so it is a file both
import. **The extraction was proved byte-identical**: the physics rows were regenerated through the
shared copy and compared cell by cell against what was already committed, which is how the one real
difference showed up. Adding `ymin` (Figure 3 starts at 20 °C, not 0) changed the minor-grid loop,
and `round()` where the old code had `int()` put one extra gridline 5px past the frame on a graph
that had nothing to do with the change. Same move as the `libraryExtras_` cutover: prove it
identical first, then make it.

## AQA Chemistry 8462/2H, and a paper where nothing was drawn on purpose

**47 questions against `Mark scheme (Higher)_ Paper 2 - June 2024`.** Cover total 100, margin boxes
10, 8, 9, 13, 12, 11, 8, 13, 16, and every intermediate the scheme prints — 140 ÷ 4, 35.0 × 39.3/100,
5.4 ÷ 0.48, 3.50 × ½ × 100/20, (39 − 25) ÷ 24 000 — recomputed before a row is written. So is the
combustion equation, balanced element by element: `2 C₄H₆O₂ + 9 O₂ → 8 CO₂ + 6 H₂O`. **The first
version of that assertion was wrong and it failed**, which is what an assertion is for — I had
written the oxygen balance as one sum instead of two sides, so it compared 26 against 18 and
refused. Three lines, one per element, is the form that cannot be written wrong by accident.

**Eleven figures and not one drawn, which is a decision rather than a gap.** A Haber flow diagram, a
water-treatment flow diagram, two chromatograms, a bicycle, a displayed formula, apparatus, two
measuring cylinders and three graphs — none is a picture the row's own words determine. 09.3 is the
sharp case: *"draw a tangent on Figure 12"*, and redrawing that curve by eye is precisely the
mistake this file records where a cumulative-frequency curve read by eye gave 50 where the pixels
said 48.1.

**So what each figure SHOWS is written into the question in words**, with the numbers the scheme
itself quotes: 25 cm³ and 39 cm³ off the two cylinders in Figure 11, the plateau at 0.0168 mol on
Figure 12, half of it on Figure 13, which spot is higher in Experiment 2, which way the yield goes
with temperature, and compound A written along a line as CH₂=CH—O—C(=O)—CH₃. A question about a
picture you cannot see is not a question — the fault this file records under *"on the app it's just
text"*. They all still carry `figure`, so `check-library.js` counts them in the backlog rather than
letting the prose hide them: that count went 490 → 506 in this commit, which is the honest number.

## AQA Biology 8461/1F, and the one figure AQA itself could not print

**58 questions against `Mark scheme (Foundation)_ Paper 1 - June 2024`.** Cover total 100, margin
boxes 12, 8, 10, 14, 14, 14, 14, 14, and every intermediate the scheme prints — 63/210 cancelled as
an exact `Fraction`, 210 − 23, 216 − 185, (23 + 63)/2, 174 ÷ 3, 50 ÷ 800 × 1000, 1.1 ÷ 6.0 × 100 —
recomputed before a row is written.

**Figure 2 is the case this repository already had a rule for, arriving from the other direction.**
Where the photograph should be, AQA's own question paper prints *"Figure 2 cannot be reproduced here
due to third-party copyright restrictions"* and names the journal it came from. That is exactly the
AQA English insert: a source that is not in the paper, and could not be in a public repository
either. So the row says what the figure is OF, and `examiner_note` carries AQA's own sentence and
the citation — nothing anywhere pretends to be the picture.

**Figure 6 is drawn, because the drawing IS the question.** 07.7 is *"label the y-axis, add the
correct scale, plot the data, label each bar"* on a blank grid with disease E's bar already on it —
ten large squares by fifteen, five small to a large, and E standing 2.8 large squares tall. That
last number is what makes the grid a drawing instruction rather than a sketch: the scale the scheme
asks for (1 cm = 5%) is recoverable from the one bar that is already there, and fifteen squares is
exactly the headroom disease H at 70% needs.

**And what a figure shows is not what its answer is.** Figure 4 is described as a pie chart whose
rim carries ten equal ticks, with four of them under the growth sector — not as "the growth stage is
40%", which is 05.4's answer. The line is easy to cross while writing a description that has to be
useful, and crossing it turns a question into a sentence with the answer in it.

## A comma in a topic name is two topics, and eleven AQA units joined nothing

**Found by auditing the four science papers I had just transcribed**, which is the only reason it is
not a fault somebody reports in a month as "the filter has a topic called Bonding in it".

**`Bonding, Structure and the Properties of Matter` is AQA's own heading for unit 4.2 and it cannot
go in this column.** `topics` is a comma-list read by `asList_` — the same shape as `keystage` and
`needs` — so that one name arrived as **two** topics, `Bonding` and `Structure and the Properties of
Matter`, and neither joins `data/topics.json`. **Same lesson as the practicals' pipe separator**,
where 14 of 410 equipment cells carried a comma inside one item and no comma rule could tell them
apart. There the fix was a different separator; here the column is already committed with commas
meaning "next topic", so the fix is that a topic name may not contain one. `Bonding & Structure`.

**And `The Rate and Extent of Chemical Change` was a second home for a branch that already existed.**
`data/topics.json` has carried `Rate of Reaction` with its aliases since before these papers. Adding
the spec's longer heading beside it is the `Density` decision again — *"a second home is two branches
for one word"* — so the rows say `Rate of Reaction` and the tree is untouched.

**Eleven AQA units had no branch at all**, so 80 questions resolved to no `topicArea`: Atomic
Structure (chemistry's and physics's are different units and both are there now), Bonding &
Structure, Quantitative Chemistry, Organic Chemistry, Chemistry of the Atmosphere, Using Resources,
Magnetism & Electromagnetism, Electromagnetic Waves, Space Physics, and Inheritance & Evolution for
the Biology Paper 2 still to come. Each is a child of its subject root, with the short forms people
type as aliases — **and no commas in a label or an alias either**, because both are comma-lists too.

**Diffed over the whole library before it was kept**, exactly as the last three roots were:
**80 questions gained an area, 0 lost one, and 0 moved from one area to another.** That third number
is the one worth taking: `topicAreaOf_`'s containment pass resolves a name only when every candidate
agrees, so a new branch can quietly take a maths topic away from maths — `Energy`, `Forces`, `Waves`
and `Rates` are ordinary English and have done it before.

## AQA Biology 8461/2F — eleven questions, and the grid whose x-axis is the question

**61 questions against `Mark scheme (Foundation)_ Paper 2 - June 2024`.** Cover total 100, margin
boxes 9, 10, 8, 8, 9, 10, 9, 8, 8, 10, 11, and the scheme's own arithmetic asserted: 30 − 20,
100 ÷ 0.01, 32 − (9 + 7 + 10), 22 ÷ 60 × 100, and 10% of 340 for one trophic level.

**Figure 15 is drawn because half of it is missing on purpose.** Its y-axis is printed and numbered
0 to 70 in tens; its x-axis has no label and no scale, and supplying them is two of the four marks.
Eleven large squares by seven, five small to a large — and the grid has room for every total it has
to carry, which the script asserts rather than eyeballs.

**Figure 11 is a table, not a picture.** A Punnett square with the female gametes filled in and the
male column and four offspring cells blank is `<table>` markup that the stylesheet already knows how
to draw, so it goes in as one rather than as SVG.

**And the script refuses a comma in a topic name**, one line, because that is the fault the commit
before this one repaired: `topics` is a comma-list, so a comma inside a name is a second topic. A
rule applied by hand is not a rule — the sentence this file writes about `cost: 0` and `paper: true`
— so it is an assertion in the writer rather than a thing to remember.

## AQA Chemistry 8462/1F, and three questions that are on both tiers word for word

**58 questions against `Mark scheme (Foundation)_ Paper 1 - June 2024`.** Cover total 100, margin
boxes 9, 10, 14, 10, 10, 10, 8, 10, 11, 8, and the scheme's own arithmetic asserted: 63.5 ÷ 159.5,
47 − 22, 6.75 ÷ 0.025, 6 × 4² and 4³ down to the 3 : 2 ratio, (27 × 2) + (16 × 3), 4 × 1.5.

**Questions 8, 9 and 10 are questions 1, 2 and 3 of 8462/1H**, which is the overlap AQA prints on
both tiers, and **the two mark schemes were read side by side rather than assumed to agree**. They
are transcribed again rather than cross-referenced, because a row belongs to the paper a student is
holding: somebody working through the Foundation paper should not be sent to the Higher one for
question 8.

**That is NOT the duplicate this library refuses**, and the distinction is worth stating because the
rule is one screen away. `check-library.js` fails on two `paper_id`s pointing at one Drive file —
one document entered twice. These are two different documents, with two different covers, two
different totals down the margin and two different `source_url`s, that happen to share three
questions. Nothing here is entered twice.

**Figure 15 is the same empty grid as the Higher paper's Figure 1**, so it is the same `axes()` call
with the same arguments rather than a second set of coordinates that could drift from it — which is
the whole reason `tools/svgplot.py` exists.

## AQA Chemistry 8462/2F, and an assertion that caught binary floating point

**63 questions against `Mark scheme (Foundation)_ Paper 2 - June 2024`.** Cover total 100, margin
boxes 12, 9, 9, 13, 11, 9, 10, 10, 8, 9. Questions 8, 9 and 10 are 1, 2 and 3 of 8462/2H word for
word — the tier overlap again, both schemes read side by side.

**`assert 2.4 / 6.0 == 0.4` failed, and it was right to.** The R_f value really is 0.4 and Python
really computes 0.39999999999999997, because neither 2.4 nor 6.0 is exact in binary. Every other
number on this paper compares exactly; this one had to be rounded, with the reason written beside
it. **An assertion that only ever passes teaches nothing** — this one earned its line by refusing a
true statement for a reason worth knowing.

**Two grids are drawn and the marks are in them.** Figure 2 carries the hydrogen bar at 16% already,
and that bar is what fixes the scale — one large square is 10% — so the carbon bar can be drawn to
84 without guessing. Figure 3 has both axes printed and only the plotting left, so it comes straight
out of `axes()`.

**The tick-box structures are written out as they DIFFER.** "Which of these shows the compound
produced when chlorine reacts with ethene" is three displayed formulae that are identical except for
where the chlorines sit, so the row lists them that way — one Cl on the first carbon; one on each;
two on the first. A question asking "which of these" is unanswerable without them, and a structural
formula is text, not a picture.

## AQA Physics 8463/2F — and `scatter()`, because two papers print one graph

**60 questions against `Mark scheme (Foundation)_ Paper 2 - June 2024`.** Cover total 100, margin
boxes 8, 9, 8, 13, 9, 8, 18, 13, 14, and the scheme's own arithmetic asserted — including
√18.62 = 4.3 to two significant figures.

**Questions 8 and 9 are questions 1 and 2 of 8463/2H word for word**, so <b>Figure 14 here is Figure
2 there</b>: the same six points of Table 1 plotted on the same grid. Building that twice is two
chances to disagree about where a cross goes, so the plotter moved to `tools/svgplot.py` as
`scatter()` — **and the extraction was proved byte-identical against the Higher paper's already
committed rows before it was kept**, which is the `libraryExtras_` move: prove it identical first,
then make it.

**Figure 9 is drawn from the corners the scheme quotes back.** A distance–time graph in three
straight sections, 3200 m in 2000 s at a mean of 1.6 m/s, with B the shallowest — every one of those
is a number the scheme prints, so the picture is determined and the script asserts the last corner
gives the mean speed. **Figure 6, one question earlier, is NOT drawn**, and the two together are the
line this repository keeps: 03.4 says only that the acceleration falls as the mass rises, and no
point on it is stated anywhere in the paper, so redrawing it would be inventing data.

**And `9.8` is not exact in binary either.** `25000 * 9.8` is 245000.00000000003, so the weight
assertion needed rounding — the second time in two papers that an assertion refused a true statement
for a reason worth writing down.

### `and` against `&` is two buttons, and my own probe said there was nothing there

**Nine AQA science papers went in over one session and three units ended up spelled both ways**:
`Atomic Structure and the Periodic Table` beside `Atomic Structure & the Periodic Table`,
`Magnetism and Electromagnetism` beside `Magnetism & Electromagnetism`, and `Infection and Response`
where `data/topics.json` says `Infection & Response`.

**`spellKey_` cannot fold these and is not meant to.** It reduces an answer to its letters and
digits, which is what makes `Alevel` and `A-Level` one button — and `and` is four more letters, so
the two spellings are two identities and two answers in the funnel for one unit.

**The throwaway probe I wrote to look for exactly this reported clean.** It normalised `the` out of
the middle of words and collapsed the wrong things; the raw tally of topic values, printed and read
line by line, showed all three immediately. **Same shape as `check-booking.js` exiting 0** — an
instrument that could not reach its subject, and I believed it. The rule is in `check-library.js`
now, so the next one fails instead of being looked for.

**And the first version of that rule was too wide, which is the `check-rows.js` lesson again.** It
lower-cased as well, so it reported all 46 of the file's case-only pairs — `Histograms` beside
`histograms` — as faults. Those are correct: `spellKey_` folds them and `topicOf_`'s vote picks the
spelling to show. The rule asks only the one question that fold cannot answer. **Proved by mutation
in both directions**: one row changed back to `and` fires it and exits 1; the real file is green.

## The Corbettmaths primary answers are computed, and the sheet with no mark scheme is the safe case

**Asked for as the Factors sheet and it turned out to be nearly done** — 12 of its 13 questions
already carried an answer. What is actually outstanding is the rest of the primary library:
**708 Corbettmaths questions with no answer at all**, across 69 worksheets.

**Corbettmaths publishes no mark scheme for these, which everywhere else in this file is the state
that stops a transcription.** The 2017 Highers are why: four answers there were subtly wrong
*because they were derived* — a reading off a grid the algebra disagreed with, two single values
where the scheme takes a range. **What makes deriving safe here is that these questions have an
exact inverse.** `XXIV` is 24 or it is not, and `nine thousand and nine` is 9,009 or it is not. So
`tools/cbmnum.py` holds both directions of each conversion and **every answer is round-tripped
against the question's own words before it is written** — convert, convert back, compare. A wrong
answer is a shape that cannot occur rather than one to check for, which is the same move the
fraction sheets already make by keeping the sum and the words in one table.

**The converters are self-tested over their whole range** — all 3,999 Roman numerals and every
number under ten thousand — and then separately against **the sheet's own printed convention**,
which a round trip cannot see: a round trip only proves the two halves agree with each other.
`nine thousand and nine`, `two thousand, three hundred and eighty` — a comma when the part below
carries a hundreds digit, `and` when it does not. That is what is printed on the worksheet, so it
is what a child's answer is marked against.

**The explanation is computed too, not written out.** `roman(38)` and the sentence under it are
built from the same decomposition, so the numeral and "XXX is 30, V is 5, III is 3" cannot
disagree. The subtractive note names **the additive spelling a child actually writes** — `LXXXX`
for `XC`, `IIII` for `IV` — computed by running the same table with the subtractive pairs removed.
The first version invented `IIIIIIIIIX` as the slip for `IX`, which is not a mistake anybody makes;
a sentence generated confidently and wrong is worse than no sentence.

**One row asks two questions and a rule answering only the first would have reported it done.**
Question 7 of the Roman numerals sheet was transcribed with question 6's tail on it. The rule
collects every ask in the row, and a row with more than one gets no `accept` — there is one box on
screen and two answers, exactly as the multi-part Factors rows already do.

### Five rows cannot be answered, and one of them was nearly hidden by the right-sounding label

**A clock face, a matching exercise, a calculator display, and George's four wrong answers.** Each
is a question ABOUT a picture the transcription lost, so each gets a `figure` — which does not
invent the picture; it puts the row into the number `check-library.js` prints every run. **629 →
630**, read off the run.

**`working` was the obvious label for George's answers and it is on `ANSWER_SPACE`.** That list
exempts a row whose figure is somewhere to WRITE — a complete question with a blank beside it —
and George's four printed answers are the opposite: a picture the row needs and does not have.
Filed as `working` the row would have been exempted from the very count it belongs in. **`figure`
is two columns under one name**, and this is the first time a row landed on the wrong side of that
line by being labelled accurately.

**708 left, and the script says so per sheet on every run.** A pass that answered what it
understood and printed nothing about the rest would be this repository's oldest fault for the
sixth time — *I did not manage to look*, reported as *I looked and there was nothing there*.

### The worksheet PDFs are in Drive, and that changes the job from answering to repairing

**`Fraction of Amounts` had no fractions in it.** Fourteen questions reading *"Work out      of
24"* — Corbettmaths sets a fraction as stacked artwork, so the text layer holds the word "of" and
the number and nothing else. **This file already records that fault and fixed it for two sheets**;
this one was never done, and nor were `Fractions: Division`, `Multiplying Fractions`, `Top Heavy
Fractions`, `Equivalent Fractions` or `Fractions, Decimals and Percentages`. A child opening any of
them gets a question with no numbers in it, which reads as the app being broken.

**What makes it repairable is that the PDFs are in Drive** — all 71 of them, in one folder, every
one shared `anyone: reader` (checked before anything was written). So the method this file already
records applies: extract the text, find it is not there, then **render every page and read it**.

**The rows were mis-split as well as empty.** Page 2 of that PDF holds questions 1, 2 and 3 and the
transcription made it ONE row — `Work out of 24 Work out of 18 Work out of 60` — so four row ids
were never created at all. Ten rows become fourteen, and the sheet now matches the paper it is a
transcription of.

**Every answer is computed from the restored question**, so a misread numerator and a wrong answer
cannot come apart: the fraction in the `html` and the `Fraction` in the arithmetic are the same two
numbers, which is the shape the adding-fractions repair already used.

### All 69 Corbettmaths sheets had no link to themselves

**A document row's URL is the point of the row.** It is what a tutor opens to print the sheet, and
every Corbettmaths document in this library was missing it while its PDF sat in Drive, public by
link. 63 of 64 carry one now.

**The match is by name and it refuses to guess.** A Drive title is slugged, the document's own
`name` is slugged, and a row is linked only on an exact match against exactly one file; twelve real
differences are an `ALIAS` table with a reason each (`fdp`, `reverse-fractions`). **A link to the
wrong worksheet is worse than no link**, because it prints the wrong homework — so everything else
is printed rather than resolved: one sheet with no PDF, nine PDFs no sheet claims.

**Five `P-1CMP-…` sheets were deliberately left alone**, and the reason is the one this file
records about the `W-CBM-`/`W-1CM-` mix-up. Their names — `Adding Decimals`, `Area of Squares and
Rectangles`, `Volume of a Cuboid` — match Corbettmaths PDFs exactly, and their ids say `1CM`, which
is this library's prefix for **1st Class Maths**. Both publishers make a sheet on each of those
topics. Their `company` cell is empty, so nothing states which, and attributing them from a name
match is precisely how three duplicate transcriptions got in last time.

## KS2 SATs 2019 Paper 1, and `&amp;` is a third spelling the rule did not fold

**36 questions read off the 2019 mark scheme**, not derived — the 2017 Highers are why that is the
rule. The paper is out of 40 and 32 one-mark questions plus four two-mark long multiplications and
divisions is 40, asserted before a row is written.

**Fourteen questions are artwork.** The text layer gives `16 3 3 =` for 3 cubed and
`22 13 7 − 4 7 =` for 1³⁄₇ − ⁴⁄₇ — loose digits, the failure mode this file already records four
ways. Every one was recovered by rendering its page and looking at it.

**And this one CAN be reproduced**, where an exam board's cannot. The paper's own copyright page
says it is Crown copyright under the Open Government Licence v3.0 and contains no third-party
content, which is exactly the opposite of the AQA English insert a few sections up. The licence
asks for attribution and the document row carries it.

### The check that exists to catch two spellings did not catch mine

**I wrote `Multiplying &amp; Dividing Fractions` into the insert script** — an HTML entity, in a
column that is not HTML — beside the 22 rows already saying `Multiplying & Dividing Fractions`.
Two buttons for one topic, which is the `and` against `&` fault one section up, wearing an escape.

**The rule folded `&` onto `and` and left `&amp;` alone**, so it passed. That is this repository's
own sentence about `cost: 0` and `paper: true` for the fifth time: the fault was repaired in the
data and the rule that was supposed to stop it could not see the new spelling. Entities are
unescaped before the fold now, and the insert script asserts the same thing at the other end so a
topic cannot leave a writer carrying one. **Proved by mutation in both directions.**

### Papers 2 and 3, and a backlog count that counted the wrong rows

**46 more questions, 70 more marks**, read off the same scheme. The SATs student now has two full
years — 2024 and 2019, six papers, 178 questions.

**The first pass of Paper 2 marked seventeen rows as needing a picture. Five do.** The other twelve
have their content in the row: the multiplication grid is reproduced as a `<table>`, the five
temperatures are in the prose, the cuboid's three dimensions are stated. Filing those as missing
pictures puts twelve questions nobody has to fix into the library's backlog — **which is the mirror
of a silence, and this file has only ever recorded the other direction.** A number that counts work
that does not exist stops meaning anything just as surely as a number nobody prints.

**So the rule is the one `figure` already had, applied properly**: an `ANSWER_SPACE` label is what
the column means when the paper printed somewhere to WRITE, and a counting label is for a picture
the row genuinely lacks. Five on Paper 2 — a shape to reflect, a measuring container, shopping
scales, a hexagon beside a square, a card marked with grid lines. Six on Paper 3 — a pictogram whose
symbols ARE the data, a coordinate grid with three points already on it, six triangles arranged into
a rectangle, and the labelled corners of ABDE.

**And the script prints the number `check-library.js` will count**, not "rows with a figure". Those
are different questions, and the first version printed the second while meaning the first.

**Question 21 of Paper 3 is the one worth reading twice.** The text layer gives `(25, 30) (40, 22)
A B E D C` — seven tokens with no geometry in them — and the scheme answers B = (55, 30) and
D = (55, 14). Those two facts together settle which point is which: if A is (25, 30) and C at
(40, 22) is the CENTRE, the corner opposite A is (2×40−25, 2×22−30) = (55, 14). The script asserts
it, so the reading is checked rather than assumed.

## AQA Biology 8461 Higher, and the paper that was in Drive under a filename naming no subject

**I told the owner Biology Higher was missing. It was there.** AQA names every subject's download
`Question paper (Higher)_ Paper 1 - June 2024.pdf`, so four subjects arrive under one filename and
Drive disambiguates them into `(1)`, `(2)`, `(3)`. **The unsuffixed copies are 8461/1H and 8461/2H
with both mark schemes**, and they were the first four files uploaded. What found them was not
reading the folder again: it was noticing that four of the thirty-two files had a byte size matching
nothing already transcribed, and then opening their covers. **This file's own rule — check the
metadata and read the front cover before reading a single page — is the one that works, and a
listing is what fails.**

**91 questions against AQA's own two schemes**, 100 marks each. The covers say 100 and the margin
boxes say 14, 14, 12, 12, 11, 8, 17, 12 and 8, 10, 11, 15, 14, 11, 13, 10, 8; both are asserted, and
so is every intermediate the schemes print — the cylinder length 499.363 nm and the magnification
×8010, the missing table value, 22 ÷ 60 × 100, both routes through the maize energy calculation
(46 000 ÷ 209 920 and 46 000 ÷ 12.8), 2200 : 4200 = 11 : 21, and 1/50 × 1/50.

### `blankgrid` moved to `tools/svgplot.py`, and the extraction was proved byte-identical first

**8461/1H Figure 1 IS 8461/1F Figure 6** — the same four cardiovascular diseases, the same blank
grid, the same bar for E already at 14%. That is the tier overlap this file already records for
chemistry, and the same move: one builder, imported by both, rather than a second set of
coordinates that can drift. **The committed 1F row was regenerated through the shared copy and
compared character for character before the local one was deleted** — 10,440 bytes, identical — the
`libraryExtras_` rule again: prove it identical, then make it.

### Both grids on Paper 2 are RASTER images, so they were measured in pixels

**`get_drawings()` returned nothing for either.** AQA sets these grids as images with no text layer
and no vectors, so the majors were found by their own regular spacing — the rule this file already
records for the chemistry Figure 3. Figure 4 is **8 columns by 7 rows** with the y-axis printed 0 to
70 in tens and the x-axis deliberately blank, which is where two of its four marks are; Figure 11 is
**14 by 6 with the zero line at column 7**, which is what its scheme's *"symmetrical around 0"*
means and is not something you can eyeball.

### A pedigree is DATA, and it is built from the facts rather than drawn

**Figure 10 carries six marks of the paper.** Twelve people, who is affected, who is married to
whom, who is whose child — every one of those facts is in the printed symbols, and 06.2 and 06.3
cannot be answered without them. So it is not artwork to describe: it is a table of twelve rows and
three couples that the SVG is generated from, which makes "the picture disagrees with the prose
under it" a shape that cannot occur. Same argument as the Corbettmaths fraction sheets, where the
sum and the words live in one table. The assertions are on the FACTS — only persons 1 and 6 are
filled, all three grandchildren are male, every child sits one generation below its parents — so a
coordinate typed wrongly fails in the writer rather than shipping.

**Everything else on both papers is artwork and says so.** A hoverfly beside a wasp, a peat bog in
section, a lettered body outline, a Petri dish, a variegated leaf, three photosynthesis curves, the
endocrine glands, and Figure 7 — which is the drawing the STUDENT is asked to finish. Each carries
`figure`, so the count went 699 → 711 rather than the prose hiding twelve.

**And Figure 3 is the phloem photograph AQA itself could not print**, on both tiers: *"Figure 3
cannot be reproduced here due to third-party copyright restrictions"*, with the journal named. The
row says what the figure is OF and `examiner_note` carries AQA's own sentence — the same answer this
file already gives for the AQA English insert and for 8461/1F.

**One answer shipped with a mangled string and a sweep is what caught it.** `1 in 50` had become
`1—44844—50` in the 06.4 answer — valid JSON, valid markup, no check anywhere could see it. Found by
scanning every non-ASCII character in the 93 new rows and looking at an em dash that sat between two
digits. Fixed in the script and in the file, because a repair to the data alone is the `cost: 0`
fault this file records four times.

## The six fraction sheets, and a text layer that dropped the numbers on ninety questions

**Four Corbettmaths sheets and one 1st Class Maths sheet, repaired against their own PDFs.**
`Multiplying Fractions` had **3 rows in the library and 17 questions on the paper**; `Top Heavy
Fractions Mixed Numbers` had 7 and 15; `Equivalent Fractions Simplifying Fractions` had sixteen
rows of which twelve read *"Find the missing number"* with no fraction anywhere; `Fractions,
Decimals and Percentages` had fourteen of twenty-five with no numbers in them and thirteen with no
answer; `Ordering Fractions` had twelve questions that all read *"Here are four fractions"* and
named none of them.

**Twenty-four rows were never created at all**, because Corbettmaths sets three questions to a page
and the text layer of that page reads `1. 2. 3. Write as a mixed number Write as a mixed number
Write as a mixed number` — so the transcription made the page ONE row. That is the `Fraction of
Amounts` fault again, on four more sheets, and the fix is the same: extract, find the maths is not
there, then **render every page and read it**.

### The 1st Class Maths sheet DOES put its fractions in the text layer, and reading order still loses them

**A numerator and its denominator are two separate words on two lines**, interleaved with the
question numbers — so question 1 reads `1 2 13 20 3 5 3 4 1`, which is four fractions and a
question number in an order nothing can recover. **Extracted by POSITION instead**: four fractions
on one line at four x positions, and within each position the higher word is the numerator. Same
method this file already records for the Edexcel papers whose text layer flattened the maths, and
it was then **checked against all four rendered pages before anything was written** — a mis-paired
numerator is a wrong question that still reads perfectly.

### Every answer is computed from the transcribed question, and each kind has its own inverse

| | |
|---|---|
| a product | `Fraction`, exactly — and the working shows the uncancelled form first, because that is the step the sheet is teaching |
| a mixed number | **round-tripped** back to the top-heavy fraction it came from, the move `tools/cbmnum.py` already makes for Roman numerals |
| an equivalence | the missing number is the one that makes the two fractions equal, checked back against the pair |
| an ordering | the SORT, rendered from `sorted(...)` rather than remembered, with the common denominator computed as the LCM |

**The first version of the multiplying working went straight from `30 × 1½` to "30 × 3 = 90".**
There is no 3 anywhere in that question. A working holding a number the child cannot find is worse
than no working, so a mixed number is now turned top-heavy out loud before it is used.

### Three pictures were counted rather than guessed, and the rest are declared

`Equivalent Fractions` question 16 is a shaded rectangle: its cell edges are 36 px apart over
288 × 216, which is **8 columns by 6 rows = 48 squares**, and the question itself says 14 are
shaded, so the answer is 7/24. The FDP sheet's question 15 grid is 4 across and 5 down with
fourteen shaded, and its question 14 triangle is 1 + 3 + 5 + 7 = 16 small ones. All three are
asserted rather than trusted. **Nine rows carry `figure`** so the count of pictures that never came
across went 711 → 720 rather than the prose hiding them.

### An ordering has no `accept`, and that is the fairness rule rather than a gap

`markAnswer_` compares ONE number. The answer to "write these four in order" is four fractions in
an order, so an `accept` value would tell a child who typed the right list that it was wrong —
which is the failure this file calls the worse of the two, because a student who stops trusting the
marking stops using it. The same rule already governs a row with more than one ask, and it is why
`Top Heavy` question 15 became two rows: two answer boxes on the paper, two answers, one row.

**Corbettmaths answers: 708 outstanding before this week, 517 now**, and the count is printed per
sheet on every run.

## Sixty more Corbettmaths answers, and a sheet whose question numbers were off by one

**`Substitution`, `Think of a Number`, `Equations`, `Using Calculations`, `Inequality Signs`,
`Proportion` and `Sequences`** — 60 answers, each computed from the transcribed question and then
**checked back by putting it through the question it came from**: a substitution evaluated, a
think-of-a-number run forwards through its own steps, an equation substituted into itself, a
sequence generated. A misread number and a wrong answer cannot come apart.

**Two answers look wrong and are not, and both were verified against the PDF before being
written.** `Think of a Number` question 8 works back to **minus one**, and `Equations` question 9
comes out at **7.5** on a sheet where every other answer is a whole number. Both are exactly what
Corbettmaths prints — rendered and read, because an answer that surprises you is the one place a
silent transcription error hides. The card says so out loud: *"If you got −1 and assumed you had
gone wrong, you had not."* A child who distrusts a correct answer is the same failure as one who
distrusts the marking.

### The inequality sheet had five rows for six questions and nothing could have seen it

**The row numbers were off by one from question 2 onwards.** What the library called row 3 held
question **2** — the three four-digit comparisons — with question 3's *instruction* stuck on the
end of it, and question 3 itself, the right-or-wrong statements, **was never transcribed at all**.
Every one of those rows is valid markup with plausible content. Only the paper shows the gap, which
is the fourth sheet this week whose SHAPE was wrong rather than its content.

**And question 6's pairs were scrambled.** The paper prints two columns, `left ☐ right`, four rows
down; the transcription read the left column and then the right, so the row held eight true
expressions in an order that pairs none of them correctly — and an answer worked from that row
would have been wrong four times out of four. `2 − 3` is **minus one** and `20 − 30` is minus ten,
so the bigger-looking subtraction is the smaller number, which is the whole point of the question.

### What is NOT answered says why, per row

`Proportion` prints its recipes as artwork and `Sequences` prints its sequences as a row of boxes,
so 14 rows arrived with the question's words and none of its numbers. `cbmwrite` refuses to let a
script finish while a row is blank without a reason, so each carries a note naming what the text
layer dropped — and `Sequences` question 5 gets the most careful one, because its row runs the
sequence and the answer line together and it is **not recoverable from the row** whether the last
number printed is a term or an answer that has leaked in.

**Corbettmaths answers outstanding: 517 → 457.**

### And two more sheets whose fractions were the question

`Fractions: Division` had **twelve rows that read `÷ 3`, `÷ 2`, `÷ 5` and nothing else** — the
divisor is ordinary text and the fraction is artwork, so the text layer of every page is exactly
the divisors. `Fractions: Finding the Original Amount` lost six of its eight the same way: *"Jackson
is of Sam's age"*, *"of the children in a class have brown hair"*, where the missing word is the
fraction the whole question turns on. Both restored from the rendered pages and answered, 20 more.

**The working for a division names WHICH of the two methods the numbers allow**, because that is
the thing being taught: 9/10 ÷ 3 divides the top, and 1/3 ÷ 2 cannot, so it cuts every part in two
and multiplies the bottom. Which branch applies is decided by the numbers rather than written out.

**Corbettmaths answers outstanding: 457 → 437.**

### `Multiples`, `Square`, `Cube` and `Prime Numbers` — 27 more, every list generated

**"Write down all the square numbers between 40 and 110" is a filter over a generated list**, not
four numbers typed out, and every other answer on these four sheets is built the same way: the
squares, cubes, primes and multiples are produced and the question's own condition applied to them.
The mistake that catches is the one nobody re-reads — a list that is right except for the last
entry. It also settles the ones where the answer is *whether there is another*: 2, 7 and 31 is the
**only** set of three different primes adding to 40, and the script knows that because it looked.

**A third of the rows are not answered and each says why.** These sheets lean on sorting diagrams,
number cards and a speech bubble, none of which came across. Two notes are worth reading:

- `Square Numbers` question 15 starts with four numbers its own question never mentions — they are
  question 14's sorting cards, **leaked across the row boundary**. The note on 14 says so, which is
  the only place a reader of 15 would find out why it opens with `12 21 36 40`.
- `Cube Numbers` question 10 holds the fragment `9² + 2³ = 100`, and **81 + 8 is 89**. Whatever the
  question asked about that sum did not come with it, so answering it would mean inventing the
  question — which is the fault this file records under the scatter graph and the curve read by eye.

**Corbettmaths answers outstanding: 437 → 410.**

### `Money`, `Percentages of Amounts`, `Order of Operations` and `The Mean` — 33 more

**Everything on the money sheet is worked in PENCE and converted once at the end.** Money is where
binary floating point would be believed: 0.1 + 0.2 is not 0.3, and a price is exactly the kind of
number nobody re-checks. Nothing here is a float.

**Question 15 is solved by SEARCH rather than by cleverness.** Five coins, three of them adding to
£1.40, three to £2.40, all five to £3.60: the script enumerates every five-coin combination of real
UK coins and keeps the ones that satisfy all three. It finds exactly one — three 20p, a £1 and a £2
— which is what makes *"and it is the only answer"* a statement rather than a hope.

**And the first version GENERATED the percentage method, which produced nonsense.** *"10% of 152 is
76/5"* — a tenth of 152 is not a whole number and a `Fraction` printed itself. The value was right
and the sentence was arithmetic rather than English, which is worse than no sentence: the point of
the working is the ROUTE. The method is named per question now — *"50% is a half, and half of 152
is 76"* — and only the value is computed.

**Corbettmaths answers outstanding: 410 → 377.**

### The two decimals sheets, powers of ten, and `Parts of the Circle` — 25 more

**Every decimal goes through `Fraction`, never a float.** 4.99 + 3.45 + 4.80 is 13.24 exactly and
13.240000000000002 in binary, and a money answer is the last place anybody would notice the
difference — this library's insert scripts have already had two true assertions refused by that.

**And `Parts of the Circle` question 9 is the one worth reading**: £6 of 2p coins laid in a line.
Each coin lies on its DIAMETER, not its radius, so the answer is 7.8 m and not 3.9 — the card says
which of the two the trap is, because a student who gets 3.9 has done every step right except the
one the question is about.

**Corbettmaths answers outstanding: 377 → 352**, and what is left is now mostly genuinely blocked:
the angle, area, perimeter, coordinate and bar-chart sheets print their numbers ON the diagram, so
answering them means transcribing the pictures first.

## One widget per reel, and the column stopped having a scroller of its own

**Reported as "Multiple widgets for each reel. One widget per reel."** What was there was ONE card
holding a scroller — `.reels`, `height: min(62svh, 30rem)`, `overflow-y: scroll`,
`scroll-snap-type: y mandatory`, `touch-action: pan-y` — with every clip inside it as a `.reel`.

**So this was the one column the app's own dial did nothing on.** `paint` does
`classList.toggle('paged', !!PAGER[id])` and **`PAGER.reel` did not exist**, so the class never went
on and the vertical axis was never registered. That is the silent loss this file already records for
`me` and `posts`, where two of the nine screens lost an axis because a table of screen ids had not
been renamed with the screens. What moved instead was a box inside a card, with its own snap and its
own momentum, and the pane's `touch-action: none` switched off underneath it so the browser could
have the gesture back.

**A second scroller is a second description of the pager**, which is this repository's oldest
sentence — `documents_()`, `paperIdOf_`, `factsNow_`, `childrenOf`. `pages()` already gives a screen
a vertical strip of cards, a position remembered per column, and a dial; the hand-rolled scroller
was reproducing all three, differently.

**So a reel is a card on a page, exactly as a tool is.** `pages('reel', reelCards_(…))` wraps each in
`.page > .pane`, and each card is `.card.is-widget > .widget-slot`, which is what `widgetColumn_`
builds for every tool and every game. Measured in a browser at 390px: **3 widgets on arrival, 3
pages, `pageCount('reel')` 3, `paged` true, 0 scrollers, each reel 445px** — and turning to page 4
appends three more, 9 pages and 9 widgets, with the pager counting all of them.

**`.reel` states its own height now** and that line is load-bearing rather than tidy: `.feed-art` is
`position: absolute; inset: 0`, so the box around it must have a height or there is nothing for
`inset: 0` to resolve against. That is the circularity recorded above under `.page.reel-page`, where
a scroller asked for `height: 100%` of a page that had none and every slide came out 0px tall.

**Which reel is playing is the page number, not a ratio.** Two IntersectionObservers went with the
scroller: one watching for the bottom so more slides could be appended, one asking "is this slide
more than 55% of the column" to decide what should be playing. `PAGE.reel` IS which reel is on the
screen, and `goPage` is the one place it changes — so measuring it is measuring a thing the app has
already decided, which is how two halves drift apart. `reelsWatch_` plays the one and pauses the
rest, and it is booked through `afterSlide_` by both callers **under the same key**, because the key
is the named function itself: a run of quick flicks plays the clip you stopped on rather than
starting and pausing one per swipe. That is the coalescing fix this file records under "one timer was
holding three jobs", and an arrow at either call site would undo it.

**`reelPages_` is the same counter the markup is built from**, which is the rule every other `PAGER`
entry follows — a pager that counts for itself is a pager that can disagree with its own screen, and
that disagreement is what made the You column unmovable. It answers **one** when there are no clips,
because the screen still draws a page then: the card that says so and says how many rows it looked
at. A count of nothing over a page that exists is a column you cannot be on.

**Two clips, and both are the ones that were sent.** `1AerJnQHL8Vk0…` and `15nJWyOpLC94…` in
`FEED_FACTS`. With two, "for ever" is a lap and the column says so; it stops being a repeat the
moment there is a third, with nothing here to change.

### Refining it: a reel you could not stop, and one that did not stop when you left

**Three things, and the first was found by measuring rather than reading.** `go('reel')` then
`go('tools')` left a `<video>` with `paused === false` — nothing anywhere asked a clip to stop when
its column left the screen. So a clip somebody had turned the sound on for went on talking from a
screen two swipes away, with no control on the screen they were now looking at, and on a phone that
is also a decoder running behind a calculator.

**`paint` already does exactly this twice and says why.** `toolsStop_` stops the widgets when their
column leaves and `camStop_` stops the camera — *"a canvas loop behind a screen nobody is looking at
is a flat battery, and a live camera behind one is a recording light on for nothing"*. A reel is the
third of those and was the one nobody had written. `reelsStop_` is that line.

**And the "One more thing" widget had it worse.** It deals a fact on a tap and some of those facts
are clips, and it has no column of its own to come back to — so a clip left playing there was sound
from a screen with nothing on it to stop. Its roster entry had no `stop` at all. Both surfaces call
one `clipsStop_(root)`, because a second copy of "stop every clip under here" is the second reader
this file keeps writing about.

**A reel had no pause.** The column autoplays whatever page you are on, which is right, and the only
control on the slide was the sound — so a clip could be silenced and not stopped, and the only way
to stop it was to swipe away from it. Every video surface anybody has used answers a tap on the
picture with a pause. The whole slide is that tap now; the sound button sits inside it and carries
its own `data-do`, and the dispatcher takes the nearest one, so reaching for the sound never stops
the clip by accident. Measured.

**`REEL_HELD` is an index, not a flag**, because `reelTurn_` runs on arrival and on every page turn:
without it the clip you just stopped starts again the moment anything repaints. Per index means
stopping one and swiping to the next leaves the next playing, and coming back to the stopped one
finds it still stopped.

**And the mark is drawn from that state rather than left on the element — which the measurement
caught.** The first version added `is-held` in the tap handler only, so a repaint rebuilt the markup
without it while `REEL_HELD` stayed: a column showing a stopped clip with nothing on it saying so,
which is the exact invisible mode the mark exists to prevent. `reelCards_` writes the class from the
state now. Proved in seven states: on arrival, after a tap, after a repaint, after a second tap,
after the sound button (which must not toggle the pause, and does not), after leaving, and after
coming back.

**The sound button was a gold slab on a moving picture.** `.btn` is gold — right for the one thing a
form wants you to press, wrong laid over a clip, where a screenshot showed it as the loudest thing
on a card whose whole content is the video. It takes the same wash the paused mark uses, which is
also the wash `.feed-art.has-photo::before` lays under the words, so every control this feature puts
over a picture looks alike. **The words stay**: a glyph would say it in less room, and the button
says the state it is IN, which "a crossed-out speaker" cannot do without being read as an
instruction.

**Eighth time this file writes that a screenshot is the last word on a drawing**, and here it is the
last word on two: the gold slab, and the ▶ needing `padding-left: .18em` because the glyph's own
bearing sits it left of centre in its disc.

### Making it stable: four things the column could not survive, and three were measured first

**"Refine it to be more stable" was answered by looking for what breaks it rather than by reading
it.** Four faults, each proved before it was fixed and after.

**1. A REDRAW LOST THE PAGE YOU WERE ON.** Five pages down, `paint('reel')` took the column from 9
pages to 3 while `PAGE.reel` stayed at 5 — a position outside its own column, with nothing playing
because there is no reel 5 to play, until the next `paintPager` silently clamped it back to 2. A
redraw is not a navigation: `load()` repaints when the payload lands, and so does signing in and
every save. The draw builds as far as the page somebody is on plus the two kept ahead of it, and
`REEL_AHEAD` is one constant so the top-up and the redraw cannot disagree about that number.

**2. AND A REPAINT STARTED NOTHING, because the reels were booked outside the one list that exists
for exactly this.** `repaint` calls `startScreen_(AT)` under a comment that says why — *"a repaint
rebuilds the markup it was running in"* — and starts the widgets and the camera from it. The reel
column was booked separately, `afterSlide_(reelsWatch_)` in `go`, so a repaint rebuilt the column
and left it dead. Measured: `repaint()` at page 5, `playing: []`. It is in `startScreen_` now, with
the other two.

**That move answers a second fault for free, and it is the better fix for it.** Arrive at the column
and leave again inside 300 ms and a clip was playing on a screen you were not on: `go` stops the
reels as the new screen is drawn, and the booking held from the screen before fired afterwards and
started one again. `go` books `startScreen_` through an arrow that reads `AT` **when the timer
fires**, so the job now runs for the screen you ended on. The first version of this was a guard
inside `reelsWatch_` — right, and a second place that had to know about the race. Being in the list
makes it impossible instead of caught, which is the move this file already records as *replace an
emergent property with a declared one*.

**3. THE COLUMN COULD BE BUILT FROM TWO DIFFERENT LISTS.** `clipsNow_()` is a live answer — it asks
the sheet, falls through to the code's list, and gives a different list the moment a payload lands.
The pages are built one batch at a time and indexed by position, so a list that changes underneath
them makes index 4 a different clip from the one index 4 was drawn as, with `REEL_HELD` pointing at
whichever is there now. `REEL_CLIPS` is one snapshot per draw and the pages, the pager's count and
the item at index n are three readings of it. Same sentence as `documents_()` and `factsNow_`, one
layer down — and it also stops `reelPages_` rebuilding the whole fact list every time the pager
counts.

**4. THE ONE CLIP THAT HAD ALREADY GONE WRONG WAS THE ONE THAT COULD NOT BE STOPPED.** When Drive
refuses the bytes the `<video>` is replaced by Google's player in an iframe, and a cross-origin
iframe has no `pause` this page can call — so `clipsStop_` stopped every clip except that one, which
went on playing behind another screen. **The half that was fixed was the half that was easy to
reach**, which is a shape worth naming. Taking its address away is the only stop available:
`about:blank`, with the real one kept in `data-src` so the slide can have it back, and `reelTurn_`
gives it back to the reel you are on. Not removing the element, because a slide that loses its
player has nothing left to look at and the card would resize under the column. Proved with Drive
answering nothing: `https://drive.google.com…` → `about:blank` on leaving → back again on return.

**Nothing regressed**, which is the other half of trusting it: the seven states of the pause and its
mark are unchanged, the column is still 3 widgets on arrival topping up to 9, and `check/ui.js`
reports nothing new across 100 combinations.

## A phone showed yesterday's Reels an hour after today's deploy

**Reported with a screenshot, and the screenshot is what dated it.** The column drew the card's
"Reels" heading over a FACT — *"You are seeing the sun as it was eight minutes ago"* — and the code
on the server cannot draw that: `clipsNow_` has filtered the facts out of this column since
2026-09-17 22:31, and the heading went with the one-widget-per-reel change. So the phone was running
files from at least fifteen hours earlier.

**Measured from the other end rather than guessed at.** `main` holds the new `js/posts.js` —
`reelCards_` and `reel-tap` present, zero occurrences of the old `.reels` scroller — and GitHub's
own *pages build and deployment* for `2dea77f` completed **successfully at 12:48 UTC**. The
screenshot is stamped **13:50**. The site was right for an hour before the phone was looked at.

**The live site cannot be opened from this environment** — the agent proxy refuses `github.io` the
same way it refuses every Google host — so what a phone is holding is the one thing here that
cannot be measured directly. That is exactly what the build stamp on the You screen is for.

### The delivery is right about the reload and cannot notice

**`sw.js` is network-first for `index.html` and that half works**, proved locally against a server
sending Pages' own headers: a browser holding the whole site picked up a fresh deploy on its next
load — `document.lastModified` moved and the new code ran. So opening the site again is enough.

**What nothing could do is notice.** A tab that is never reloaded never asks: an app left open on a
phone yesterday shows yesterday for as long as it is left open, and switching back to it is not a
reload. This repository already knows the cost of that confusion — *"my fix did not work"* against
*"I am looking at yesterday's file"* is the eleven hours the whole `LOAD` arrangement was built
from — and every version of the answer so far has been a step somebody has to remember, which is the
thing this file says will be forgotten.

**So the app asks.** `watchBuild_` holds the entry point's own `ETag` at boot and compares it when
the tab is returned to; different means a deploy has happened underneath you, and the banner says so
with a tap that reloads. **The ETag is the server's own answer to "which build is this"** — no
version file to generate, no second stamp to keep in step with `--css-version`, and nothing new for
anybody to remember. A `HEAD` request, so nothing is downloaded; `no-store`, so the answer is the
server's rather than the browser's copy of it; and `sw.js` returns early on anything that is not a
GET, so it goes past the worker to the network, which is the whole point of asking.

**It never reloads by itself, and `purge()` four lines down is the reason.** That function called
`location.reload()` on finding a worker to remove, which became an infinite loop the day the site
installed one of its own — written up here already. A banner is a sentence and a tap.

**Silent when there is nothing to say**, which is the other half: no `ETag` and no `Last-Modified`
means no comparison is possible, so nothing is drawn rather than something guessed; and the check is
rate-limited to once in thirty seconds, because switching apps twice in a minute is not two deploys.
**Proved in both directions** against a server with real ETags: returning to the tab with nothing
deployed leaves the banner hidden and empty, a deploy while the tab sits there raises it, and the
tap lands on the new build.

### It was added to the home screen, which is the whole explanation

**Asked as "is it because I added it to homescreen?" and the answer is yes.** `index.html` carries a
manifest saying `display: standalone` and an `apple-mobile-web-app-capable` tag, so an icon added
from Safari opens a window with no address bar, **its own storage**, and — the part that caused
this — **iOS suspends and resumes it rather than reloading it**. A web app left open yesterday is
yesterday's page restored from a snapshot, with no request made at all. Nothing about that is a
fault in the site; it is what an installed app is.

**It also takes every existing way out of reach.** There is nowhere to type `?dev`, the standalone
window does not share Safari's copies so clearing it there clears the wrong one, and the address it
would need is not on screen to be edited. What is left is pulling down to refresh inside the window,
force-quitting it from the app switcher so the next launch is cold, or deleting the icon and adding
it again — and which of those an iOS version honours cannot be tested from here, which is said
rather than asserted.

**So the banner is the door somebody holding the phone can actually reach**, and `pageshow` is
listened to beside `visibilitychange` for the same reason: a resume is not always a visibility
change, `pageshow` with `persisted: true` is the page coming back from the browser's own hold, and
the two fire in different orders on different systems. The check is rate-limited, so two events are
one request. Measured on the resumed path as well as the returned-to-tab one.

**And the build stamp on the You screen stops being a nicety.** In a window with no address bar it
is the only thing on the phone that says which build is running.

**And the action is written out inside `banner()` rather than passed in**, for the checker rather
than for the code: `check-doors.js` follows `setAttribute('data-do', 'x')` with a literal and cannot
follow a variable, so an action handed in as an argument becomes a handler reported as unreachable —
a red with nothing behind it, which is the one thing every list in this file exists to prevent.

## The live site answered the question this file said only it could

**A screenshot of the real phone showed the reel playing inside GOOGLE'S OWN PLAYER** — its
scrubber, its ten-second skips, CC, 1x, an expand button and a black letterbox round the lot. That
is the `error` fallback doing exactly what it was written to do, and what it proves is the thing
this file admitted it could not test: **on a real phone the `uc?export=download` address fails.**
Every Google host is blocked from this environment by network policy, so the first address was
always a guess, and the note over `clipSrc_` said so.

**Everything the owner complained about follows from that one fact.** "Can't you make it play
automatically" — an iframe from another origin will not autoplay and cannot be muted from here, and
a muted autoplay is the only kind any browser allows. "It's so fugly" — that chrome is Google's, on
a cross-origin document, and no rule in this stylesheet can reach inside it. The card was never
drawing a video; it was drawing a rectangle with somebody else's player in it.

**`uc?export=download` is the old spelling.** Google moved direct downloads to
`drive.usercontent.google.com/download`, and the old address answers a redirect — or an HTML
interstitial, which a `<video>` reports as an error because it is not a video.

**So it is a ladder rather than a choice**, and the shape is the point: **no version of this can be
tested from here**, which is how the wrong address shipped. Each rung is a real attempt, `error`
moves to the next, and Google's player is the last rung rather than the second. One open of the live
site settles which one wins and nothing here has to be right.

**The `{ once: true }` on that listener was the bug that made a ladder impossible.** One failure
took the slide straight to the iframe, so a second address could never have had a turn however many
were listed. It counts down the list now — and calls `load()` before the next `src`, because a
`<video>` keeps its error state until it is told to start again, so the second address would have
been reported broken without being asked for. **Measured with both Drive addresses refusing**:
`usercontent` → `uc` → the player, in that order, with the sound button removed as the swap happens.

**And a full URL is used as given, which is the real answer.** `clip` takes an address, so a file
served from anywhere — including beside this site, where GitHub Pages would serve it with no
interstitial, no redirect and no player — is one rung, with no fallback and no chrome: a `<video>`
this app can mute, loop, autoplay and pause, which is what every other line of this feature was
written against.

**One thing no code here can fix, worth knowing before anybody debugs autoplay again**: iOS blocks
autoplay outright in **Low Power Mode**, whatever a page does. The phone in the screenshot was on
14%.

## The finder was spending a quarter of the screen on what you had already answered

**Reported as "the tags don't need to be as big. Everything should be a bit more efficient with
space."** Measured before anything was touched, six answers deep at 390px — the state
`check/ui.js` already declares, because it is the one the last complaint came from:

| | before | after |
|---|---|---|
| the chips | **192px over four wrapped lines** | **141px over three** |
| an answer row | 48px | **44px** |
| the seven answers | 336px | 308px |
| the whole question card | **673px** | **575px** |
| a result card | 218px | **201px** |

**A quarter of the pane was going to what had already been decided**, and the answers — the thing
somebody is on this screen to press — got half of what was left.

### The 44px stays and everything else gives

**A chip is a control and a fingertip does not scale.** This stylesheet carries five convictions of
that rule — `.btn.tiny`, `.post-act`, `.fm-adds label`, the chips themselves and `.qp-check` — and
making the tags smaller by making them shorter would be the sixth. **What was actually costing the
room is WIDTH**: the label, the padding and the gaps decide how many chips fit on a line, and a line
is 44px whether it holds two of them or four. Narrower text (.78 → .72rem), less padding (.6 →
.45rem), a tighter key (.66 → .6rem) and smaller gaps — same target, one fewer row of it.

**The uppercase key stays**, and the note above it is why: *"Grade 9 and 9 are different amounts of
information, and with four chips on a line the second one is a puzzle."* It is the widest thing on
each chip and it is also the thing that makes a chip readable; shrinking it is the answer, deleting
it is not.

### An answer row was 48px against a 44px floor

`min-height: 44px` is what a fingertip needs and `.8rem` of padding over a 24px line took every row
**four pixels past it** — height bought from nobody, because the target was already 44. At `.55rem`
the box lands ON the floor: the same 44px to press, 4px less to scroll past, seven times over.

### And two numbers that are not the Find screen at all

**The pane's own padding was a second margin round the same content.** `1rem 1rem 1.25rem`, inside a
card the grid has already inset from the screen — 15px of a 328px column gone to the frame on each
side, 33px down the height, on **every screen in the app**. `.85rem .85rem 1rem`: trimmed, not
removed, because a pane with no padding is content against a border, and the bottom keeps a little
more than the top because a list ending flush with the glass reads as clipped.

**And the browser's own paragraph margin under every question.** `.qsheet p:first-child` has had its
TOP margin taken off since it was written and the other end was left on: `1em` — 14.8px measured —
under the last paragraph of every question, between the question's last line and a container that
already supplies the gap. One paragraph of white space per card, on every card in a list somebody
scrolls.

**Nothing regressed**: `check/ui.js` reports nothing new across 100 combinations, `check/cards.js`
lays out all 4,906 question rows at 320px with nothing past the column, and every tap target on the
screen is still 44px — which is the one measurement here that was never negotiable.

## The booking card spent a quarter of itself on thirteen dashes

**Asked for as "optimise Booking. I mean look at grid for starters it takes up so much space."**
Measured first, signed in, at 390px: the card is **845px** and it goes

| | |
|---|---|
| fifteen rows that are questions | 285px |
| **thirteen rows that are a dash** | **210px** |
| the week grid and its surround | 182px |
| the total bar, the two tiles and the terms | 107px |

**THE GRID IS NOT THE BIGGEST SPENDER AND IT IS ALSO AT ITS FLOOR**, which is the half worth saying
before anything is changed. Seven rows at `max(20px, 1.55em)` plus six 1px gaps is 146px; the 20px
is a fingertip rather than a preference, and the note over `.hr` records this block going 222 → 174
→ 146 and why it stops there. A week has seven days and a day has to be pressable. What came back
off it is the 36px of margin and instruction wrapped round it, which is real and is all there is.

**The thirteen dashes are where the room actually was.** They stay — the argument for them is
written over `.bk-row.is-blank` and over `Stage`/`Status`, which this file has already debated twice
and settled twice: a row that appears only once a booking is saved is a row that changes shape at
the moment somebody is checking it. What a blank row does not need is the LEADING of a row somebody
reads. 1.35 is a line for reading; a dash is counted past on the way to the row below.

**And two of the thirteen cost twice what a blank row costs.** `Extra subj.` and `Per session` are
the only two labels of the spine's twenty-eight one character too long for a 6.2em column, so those
two rows were 30px where the other eleven were 15. **The note over `SPINE_EXTRA` records this exact
fault and its fix** — four labels shortened for exactly this reason — and it came back on the two
that are still eleven characters. Shortening a third time is the hand-repair this repository keeps
finding; the column giving way is the rule.

### `white-space: nowrap` fixed the height and broke the width, and then did nothing at all

**Two mistakes in one line, both caught by measuring rather than reading.** `nowrap` against a fixed
6.2em column is a label that does not wrap and does not fit: `check/ui.js` reported `span.bk-k
overflows by 3px` at four widths — the row taking the card sideways instead of the row being tall.
`max-content` is the version that asks for what the label needs and gives the dash what is left, so
nothing wraps AND nothing overflows at any label length somebody adds later.

**And written beside `.bk-row.is-blank` it did nothing**, because `.bk-row.is-bare` sets the same
property three thousand lines further down and both selectors are two classes — the cascade settles
a tie by order. The rows went back to 481px under a rule that read as though it had fixed them, and
the only reason that was visible is that the probe was run again rather than trusted. **Same fault
as `.price.faint`**: a rule that reads as a decision and behaves as nothing.

**Measured after**: the card is **776px**, the rows 457, every blank row 12px, and `check/ui.js`
reports nothing new across the eight booking combinations.

## The camera had five rectangles where a camera has four controls

**Asked for on a whiteboard, by shape and by colour**: *"Camera, should be 4 buttons: white circle
for take pic, Red for record, and switch camera, and photos."* What was there was five `.btn quiet`
rectangles under the viewfinder — `Photo`, `Video`, `Again`, `Save it`, `Photos` — which is a
FORM'S buttons on a card whose whole content is a live picture. The house style already draws that
line one way (*"a THING has tiles; a FORM has buttons"*) and a camera is neither: a shutter is its
own vocabulary, and everybody already knows it.

**The white and the red are declared on the component, not at `:root`.** This is the chessboard
case the house style settles: a colour belonging to ONE component — that board's cream and
charcoal, this control's white and red — is named on the component so it is available without being
offered to a black-and-gold stylesheet. Nothing else in this app may reach for a white disc.

**Recording changes the SHAPE.** The disc has no room for the word `Stop`, and the old rectangle
rewrote its own label to say it. A red disc is record and a red rounded square is stop, which is
what every camera does — and `aria-label` moves with the shape in `camRecMark_`, or a screen reader
is told the opposite of what is true. A control that looks the same while it is running is the mode
you cannot see, which is the fault this file already records for a reel paused with nothing on it
saying so.

**`Again` and `Save it` left the row.** They belong to a picture you are holding, not to a camera
you are pointing, so they are the row underneath — which is 0px tall until there is something to
save. Measured in seven states.

### The record button had never appeared on the path anybody takes

**Found by reading the two branches side by side while rebuilding the row.** `camStart_` reveals the
controls in two places: the re-attach branch, which runs when a `repaint` has replaced the markup
under a live stream, did `$('cam-video').hidden = !canRecord_()`. **The success path — the one every
first start takes — did not.** So the button added because *"there was no way to record at all"*
could only be reached by triggering a repaint, and leaving the column hid it again.

`camLive_(on)` is the one function both call now, which is the `factsNow_` / `documents_()` argument
one screen along: two readers of one fact are two chances to disagree about it.

**And the shutters are DISABLED rather than hidden while the camera starts.** A control that appears
when the first frame arrives grows the card under the thumb reaching for it — the same complaint the
booking grid's own note makes about folding.

### `Switch` is the one control that is not drawn until the browser says it can work

**`enumerateDevices` answers before permission and answers wrongly.** Without a granted stream a
browser may report one anonymous `videoinput`, or none, so that the device list is not a
fingerprint — so asking at boot would hide the flip control on every phone that has two cameras. It
is asked a frame after the prompt is granted, in `camWays_`, where the list is the real one. Fewer
than two and the button is not there: a flip control that swaps the picture for the same picture is
the `orderPrints` shape.

**A track's `facingMode` is fixed when it is opened**, so the other camera is a new stream —
`camStop_(true)` then `camStart_()`, where `true` is the flag that releases the hardware and leaves
the card alone, so the buttons do not flicker back to their starting state for the third of a second
the swap takes.

**NOT WHILE IT IS RECORDING**, and that refusal is the interesting one: stopping the stream is what
assembles and downloads the file — see the ordering note in `camStop_` — so a flip mid-record would
save a half-length video and read as the button having eaten it. It says *"Stop the recording
first."* rather than refusing silently.

**Proved in eight states** with a stubbed two-camera device: live, after a shot, after `Again`,
recording, a flip refused mid-record, stopped and saved, flipped (`environment` → `user`), and the
column left — where the stream is released, the shutters grey and `Switch` goes. `check/ui.js`
reports nothing at all across the eight `make` combinations.

## Messages drew a transcript, and a conversation is read by side before it is read by name

**Asked for as "messages should look like IG DMs".** What was there was full-width rows separated by
hairlines with `text-align: right` standing in for *this one is mine* — which is a log. You know who
said a thing from WHERE IT SITS; the name under it confirms rather than tells.

**Runs are the half that makes it a chat, and they are worked out in `messagesHtml_` rather than in
the stylesheet.** Four messages in a row from one person is one turn, not four — so only the LAST of
a run carries the squared tail corner and the "you · time" line, and the ones above it hug at 2px.
Without that, six bubbles read as six exchanges and the card is no calmer than the hairlines were.
Measured on a stubbed thread: 7 messages, **4 runs, 4 timestamps**.

**Gold for yours, because gold is already what this app means by yours** — the one action, the
ticked hour, the starred thing — with black text on it, which is what `.hr.on` already does for the
same fill. And the bubble is 78% of the card rather than the whole of it: a bubble that reaches both
edges has no side to be on, which is the entire mechanism.

**`.msg.unread` had to change shape with it.** A gold rule down the LEFT is right for a full-width
row and cannot survive a bubble that has a side — on `.mine` it drew a gold bar on the wrong edge of
a gold fill. The bubble's own outline says it instead, which is the argument the old rule made and
the shape it could not keep.

### You could read a conversation and not answer it

**The only composer in the app was in a sheet on a person's pass.** So replying to something on the
Messages column meant leaving it, finding that person on another column and opening their card. The
box is at the foot of the thread now, which is where every messaging app anybody has used puts it —
and `msgForm_` is ONE builder, used by the thread and by the sheet, because the sheet having its own
textarea, its own button and its own note is a second composer to keep in step with the first.

**`$('msg-text')` WAS THE BUG WAITING TO HAPPEN.** It was right while there could only ever be one
composer on the page; the Messages column draws one per conversation, so three on a screen would be
three elements carrying one id and the browser hands every `Send` button the first of them — **a
reply typed to your tutor posted to somebody else.** `on('msg-send')` walks up to the nearest
`.msg-form` instead, which is a fact the DOM can answer and an id cannot. **Proved with two threads
on screen**: typing into the second posts `to: Office, toId: P001b`, which is the second thread's
own id rather than the first's name.

**And `closeSheet()` could not stay unconditional.** The thread's composer is on the page, not in
the sheet, so what it needs is its box emptied — closing the sheet from there would dismiss whatever
else somebody had open. Asked of the DOM (`form.closest('#sheet')`) rather than remembered in a
flag.

**A conversation opens at its newest message.** A scroller's natural state is the top, which on a
thread is last month. `dmFoot_` is booked from `startScreen_` with everything else a screen has
running — the note there records what happens to a job booked anywhere else.

**Two things fixed on the way past.** `Refresh` was a full-width gold slab over a column of
conversations: `.btn` is the one action on a card and fetching a list again is not it, which is the
same correction `.reel-sound` already records. And **an empty inbox had no Refresh on it at all** —
`loadMessages` deliberately leaves `MESSAGES` alone on a failure, so a first fetch that never
arrived drew "Nothing yet." with no way back. This repository's oldest fault with the door removed.

### `check/ui.js` had only ever seen this column empty

**Messages are a POST action, not a payload key** — deliberately, because a conversation is private
and the GET payload goes out whole to whoever asks for it. So `check/fixture.json` cannot carry one,
and `dm: nothing to report` has meant the "Nothing yet." card and nothing else, at four widths, on
every run since that file existed. **The same sentence this file already carries about the booking
screen signed out.**

**So the thread is a declared STATE.** `MESSAGES` is what `messageThreads_` reads and `loadMessages`
writes, so setting it is the state the app is in a moment after a successful fetch — the app's own
door, exactly as the signed-in visitor is seeded through `localStorage` rather than by poking `USER`.
Two people, a run of three, and one deliberately long sentence, because the widest thing a bubble
ever holds is something somebody typed.

**`{ name: '' }` HAD TO STAY ON THE LIST.** Declaring states REPLACES the unnamed one every screen
has by default, so naming only the seeded thread would have stopped this file ever measuring the
empty card again — a state gained and a state lost, silently. Caught by the combination count going
8 → 4 instead of 8 → 12.

**Proved by mutation**: an `expect` of 99 bubbles names the state at all four widths and exits 1;
the real file exits 0. 104 combinations, nothing to report.

## A post could be reacted to and not talked about

**Asked for on the whiteboard as "should be able to comment on posts".** A reaction says how a
photograph landed and cannot say anything else; a post of a child's first A in a mock is a thing
people want to write a sentence about.

**`post_comments` is the reaction's tab one column wider** — a post_id, a person_id, what they said
and when — and `addComment` is `reactPost` with the one-per-person lookup taken out. That removal is
the only real difference and it is worth stating: a reaction and a vote are a CHOICE, so pressing
again changes or withdraws it; **a remark is not a choice**, and somebody who says two things has
said two things. Three tabs with one shape is three things that behave the same way.

**Two absences are decisions.** There is no `parent_id`: a reply to a comment is a tree, and a tree
is a second reading order on a surface whose whole job is one photograph. And there is no EDIT — a
comment is a thing somebody said in public. It can be taken down, by its author or by an admin, and
`active` is a cell rather than a deleted row for the reason `approved` already gives on a post: the
comment you took down is the one you may need to show somebody afterwards.

**`canRemove` is computed on the server and drawn on the phone.** An admin may take down anybody's
and an author only their own — repeating that on the phone would be two copies of one policy, which
is the fault recorded here under `MESSAGING`, under `kinds` and under `childrenOf`. The handler
checks again anyway, because a button is not a permission.

**Names, not ids, and `mine` rather than the id** — the same decision `reactions.by` records one
block up: a comment is public and an id is not, and `P17390421 said …` tells nobody anything.

### It draws nothing at all until the backend is deployed, and that is the `|| []` rule

**`doGet` sends `comments` on every post from this version. An older deployment sends no such key**
— and `|| []` would turn that into "no comments yet" under a composer posting into `accessDenied`,
which is this repository's worst shape: *I did not manage to look, reported as I looked and there
was nothing there.* `Array.isArray(p.comments.list)` is the test, and an absent key draws **nothing**:
not an empty thread, not a box. A feature that has not arrived looks like a feature that is not
there.

**That gap is real and may be days.** `pullFromGitHub` is blocked on the Cloud-project switch and
clasp is unconfigured — see "Deploying" — so the front end reaches Pages in a minute and the backend
reaches Apps Script when somebody runs it. **`?setup=1` has to run as well**, or `ensureSchema` has
never created the `post_comments` tab.

### Not bubbles, and that is the decision worth writing down

Messages got bubbles in the commit before this one because a conversation between TWO people is read
by side. **A comment thread is many people talking about one photograph, and there is no side for a
fourth person to be on** — so it is the name, then what they said, on a line that wraps, which is
exactly what `.post-cap` already is, because the caption IS the first comment. Yours is marked by
the rule down the left that messages gave up when they became bubbles: the shape that rule was
always right for.

**`Remove` was 31x13 and `check/ui.js` named it at three widths.** It looks like text and it is 44px
now — underlined because `check-css.js` fails a tappable thing that reads as plain text, and 44px
because a control you cannot hit is not one that is rarely used, it is one that is not there. The
height goes on the time LINE and only where there is a button on it (`:has`), because an admin sees
a Remove under every comment and 44px of nothing under the rest is worse than the fault.

### `2026-09-15` was read as 26 September 2015

**Found by a comment timestamp, and it is not the comment's bug.** `parseWhen` in data.js is the one
place this app turns a written date into a Date — every `ago()` on every surface goes through it —
and its day-month-year match **was not anchored**. On a four-digit year the regex engine simply
started later in the string: `\d{1,2}` cannot take `2026`, so it slid along to `26-09-15` and read
day 26, month 9, year 15. `2017-05-25` came out as **17 May 2025**.

**A plausible date, a confident sentence, wrong by eleven years, and nothing could have noticed.**
`new Date(t)` four lines down was already right about ISO and never got the chance, because an
unanchored regex earlier in the function had always matched first. The fix is an anchored ISO branch
above it, built field by field rather than handed to `new Date(string)` — `new Date('2026-09-15')`
is UTC midnight and `new Date('2026-09-15 18:20')` is local, and the same function putting a date
either side of midnight depending on whether somebody typed a time is the timezone fault `waveOf`
already cost this app seven buttons over.

**`node js/check-dates.js`, on the roster**, because this is the `cost: 0` sentence for the seventh
time: a fault repaired in the instance and not in the rule comes back. Eight forms, both families —
the ISO one a sheet cell and a data file hold, and the `15/09/26 18:20` one `fmtDateTime` sends.
**Proved in both directions**: the old parser fails four of the eight and exits 1; the new one
passes all eight.

**And the comment's own timestamp goes through `fmtDateTime`**, which is what a message already
sends. `S(c.said_on)` on a sheet Date is whatever `String()` makes of it, and a second spelling of a
timestamp is a second thing for `parseWhen` to get right.

### `check-rows.js` caught the one thing that would have mattered

**The first version asked `post.person_id` and the posts tab has no such column.** Whose post it is
lives in `author`, resolved through `findPerson` — and that test is what decides whether somebody
may write under a photograph that is waiting for approval. `check-columns.js` could not see it
(`person_id` is a column of four other tabs); **the check that asks whether a name is a column of
THIS tab is the one that names it**, which is the fault it was written for.

## The loading screen does not stutter, and four of them stop

**Asked for on the whiteboard as "make animations more stable for loading".** There were two
candidate answers and the measurement says one of them is not true, which is the half worth writing
down first.

### The one that is not true, and it had a convincing diagnosis behind it

**`index.html`'s case for the splash is that *"the animation is CSS, so it runs even while the main
thread is busy parsing eighteen files"*.** That is true of `transform` and `opacity` — the
compositor runs those on its own thread — and false of a `background`, a `box-shadow`, a colour or a
`width`, which the MAIN thread recomputes and repaints. The same thread parsing 566KB of JavaScript
and decoding a 3.4MB library at exactly that moment.

**Asked of the browser via `getKeyframes()`, 23 of the 39 splashes animate at least one property the
compositor cannot run**, and the worst — the times table — runs **47 `background`-and-`box-shadow`
animations at once**. That reads exactly like a diagnosis.

**It is not one.** Measured at the moment of boot, with the payload never answering so the splash
stays up, and the CPU throttled to 6x and then to 20x: **every splash moved in every frame** — the
47-animation one exactly as much as the pure-`transform` one, 44 of 44, at both throttles. There is
nothing to fix, and writing the fix on the strength of the property list would have been the
`.mat-out` mistake for a third time: two rules changed on a reading nobody had taken.

### The one that is: four of them hold a still picture

**Measured at full speed, where nothing is competing for anything:**

| | identical to the frame before | longest hold |
|---|---|---|
| `is-sf` | **55%** | 1000ms |
| `is-tri` | **42%** | 1250ms |
| `is-cent` | 35% | 500ms |
| `is-half3` | 35% | 500ms |

**`index.html` has already deleted a splash for exactly this** and its own sentence is the standard:
*"it read as a tartan square holding still, which is a picture rather than an animation, and a
loading screen that looks frozen reads as an app that has."*

**A hold is not automatically a fault, which is why this prints and does not fail.** `is-sf` is
standard form: the decimal point hops five places and the exponent counts up with it, and the last
third of the cycle is the answer being held for somebody to read. That beat is the point of the
animation. Shortening it means clearing the exponent as the point hops back, or the splash shows
`3.42 × 10⁴` with the point at the start — **wrong maths on a teaching screen, which is worse than a
still one**. Which of these four is a rhythm and which is a freeze is a judgement about the
animation, and the pool is the sheet's: `splashOff` is read by the picker in `index.html` before it
picks, so retiring one is a row rather than a deploy.

### `npm run splash` — and the first version of it measured the wrong splash

**It sets the pool rather than the element.** The first version set `#splash`'s class from a
`DOMContentLoaded` handler, which runs AFTER index.html's own inline picker and its replay loop — so
the replay had already captured the animations of whatever the coin chose, and the run reported
`is-trick` frozen for 5.75 of 8 seconds with 0 restarts. **Both numbers were the harness.** Seeded
through `splashOff`, which the picker reads before it picks, `is-trick` is still for 250ms and its
replay fires 20 times in 10 seconds — it was the one splash working exactly as written.

**Identical PNG bytes is the whole test**, and it is the only question that can tell a compositor
animation from a main-thread one: a page can be busy and still be moving, and a page can be idle and
be a photograph.

**Not in `npm run check`**, for `check/load.js`'s reason: it drives a real browser for six minutes
and its answer moves with what else the machine is doing. `npm run splash`, and a person reads it.

## Ten experiments that run in somebody's front room, and five that were refused

**Asked for as "I need to database this in an appropriate way and add to my site"**, over a chat
transcript holding ten home science experiments, five rejected ones with the reasoning, a shopping
list and a prep checklist.

**They are not a new table.** `data/practicals.json` already holds 41 experiments with a name, a
subject, kit, steps, safety, a venue and a topic join — which is this list with different values in
it. The `images` and `needs` notes both settle the shape: a thing one column wider is not a second
table. And the practicals' own note settles the kind: *"`subject` IS THE SCIENCE and `kind` is what
it is"* — a home chemistry experiment IS chemistry and IS a practical, and a second kind beside it
would put one door in the funnel marked Practicals and another marked Experiments and ask somebody
to know the difference.

**What actually separates them is `venue`, which already existed.** The 41 are `lab`, `library room`
and `outdoors`; these are `home` and `outdoors`. That is the fact a tutor needs — can I do this in a
client's front room — and it was already a column.

### The five refusals are rows, and `active` is not the column for them

**"Recorded so the reasoning is not lost" was the instruction**, and a tutor asking why they are not
burning magnesium ribbon has to be able to find the answer rather than an absence. `active` is the
wrong home for that and this file already records why, on the posts tab: *"`active` is whether it
has been deleted. This is whether it has been let through"* — folding them makes undeleting and
approving one act. So a refused experiment is LIVE, carries `excluded_reason`, and the card leads
with it: the flag changes word and colour, the reason sits under the subtitle with a red rule, and
the card is dimmed. Three signals for one fact, the same doubling `placeholder: True` gets.

**And it is not asked for a method.** `check-practicals.js` demands kit and steps of a live row and
a REASON of a refused one, because writing out a procedure for something nobody will run is
inventing content to satisfy a checker — the opposite of what the checker is for. Proved by
mutation: a refused row given steps exits 1.

### `cost: 0` had one more place to land and this was it

**Measuring car speeds really does cost nothing per run. A lab practical has never been costed at
all.** `libN('')` is 0, so mapping the new column with it would have made all 41 free — the fault
this file records four times, most recently on the shop mapper where a blank cell read as "free"
under a comment defending the zero. `libNum` is `libN` with absent staying absent, two functions
rather than a flag so a caller picks by saying which question it is asking; the card draws "free to
run" for a real zero and says nothing for an uncosted row. **Measured on the rendered text: 0 of the
41 lab practicals claim to be free**, 5 of the new ones do, and 7 carry a price.

### A column written and never read, caught before it shipped

**`wow` went in as free text** — "low to look at, high to learn from", "high — and he keeps it" —
which reads beautifully and cannot be compared, and nothing read it. That is two faults at once:
this repository's oldest shape (`figure`, `orderPrints`, the four message actions, `exam_date`), and
a rule over free text, which is the fault `/required practical/` matching `AQA-aligned, NOT a
required practical` already cost five cards. It is a closed list of five now, the card reads it to
print *"Worth opening a session with"* on the top two levels and nothing otherwise, and the nuance
went into `notes`, which is prose and is drawn as prose.

### `Separating Mixtures` is a new branch, and the diff is why it was safe

Filtration, crystallisation and evaporation are a real GCSE topic that `data/topics.json` did not
carry, and filing salt-from-sand under `Atomic Structure & the Periodic Table` — where AQA's spec
actually puts it — would be correct and unfindable. **Adding a branch changes `topicAreaOf_` for
every item**, because its containment pass resolves a name only when every candidate agrees, so it
was diffed over the whole library first, exactly as the three science roots were: **0 gained an
area, 0 lost one, 0 moved**, across the 4,341 rows that already had one.

**Measured after: the join is the feature.** `Compound Measures` reaches 15 items, so the car-speed
experiment sits with the maths speed questions; `Waves` reaches 26, so the shoebox projector sits
with the refraction ones; `Rate of Reaction` 28 and `Chemical Changes` 42. The practicals now
resolve to nine topic areas — Biology, Chemistry, Physics and five maths branches.

### What is deliberately NOT committed

The source carried a learner profile: an age, a set of interests, a first session date, and "confirm
the student has a fish tank". **This repository is public and git history is permanent**, so none of
it is here. Where a learner-specific line carried a reusable fact it is written as one — "matches
the fish interest on file" became a `feasible` of *"needs a tank, a pond, or a window onto birds"*,
which is true for anybody.

**And the two lines from the prep checklist that are about every home practical rather than any one
of them** — public liability cover, and a written parental agreement describing what will be done —
are drawn from `venue === 'home'` in one place. Writing them into ten `notes` cells would be the AQA
insert fault again: one fact repeated on every row that uses it, and ten cells to keep in step the
day the wording changes.

### `check/cards.js` had never laid out a practical, and that cost four cards

**Found by laying all 56 out while adding ten.** `.prac-head` is a flex row and **a flex item's
minimum is its MIN-CONTENT** — the widest unbreakable word, not nothing — so `Photosynthesis`,
`Field investigations`, `Chromatography` and `I–V characteristics` beside a `flex: 0 0 auto` flag
could not shrink, and each took the card up to **19px past a 320px column**. Four rows of
forty-one, on every commit, for as long as that card has existed.

**Nothing had ever looked.** `check/cards.js` reads `data/questions.json`; `check/ui.js` measures
nine screens and the funnel fills five pages either side of where you are, so it sees whichever
practicals it happens to stop on. That is this file's own **"a sample is not a sweep"**, one data
file along — and it is why `check/cards.js` lays these out too now, **through the app's own
`practicalCard_` rather than a copy of it**: that file already half-pays for rebuilding a question's
markup, and paying it twice would be worse. The measuring rules came out of the loop into one
`measure()` both passes call, for the same reason.

**Proved by mutation**: putting `min-width: 0` back names all four rows and exits 1; the real file
lays out 4,906 questions and 56 practicals with nothing past the column.

## The first reel landed, and the service worker was eating it

**Two clips uploaded to the repository root — `archetest.MP4` and a TikTok id — 7.3 MB and 7.9 MB,
both H.264 in MP4, both already faststart.** `data/reels/README.md` had named the destination and
the spelling before either arrived (`data/reels/archetest.mp4`), so they are there, lowercased, and
the two `FEED_FACTS` clip fields point at them. `clipSrcs_` treats anything with a slash as an
address, so a repo path is **one rung, no Drive, no chrome** — which is what every other line of
that feature was written against.

**The name is the one the owner uploaded.** A 32-character id is unreadable in a source file and a
typo in it is invisible to a reader — but renaming a video nobody here can watch is inventing a
description of it, which is the fault this file records under the scatter graph and the curve read
by eye. The check below is what makes the ugly name safe: a typo now fails the build.

### `sw.js` answered a ranged request by throwing, and the column drew Google's player over a file that was there

**Measured before it was read about**, with a range-capable server and the real worker installed:
the column drew three slides, **one of them already fallen through to the iframe**, and the two
videos sat at `readyState: 0` with nothing playing. Two separate faults, both in `file()`:

| | |
|---|---|
| `Range: bytes=0-` | the server answers **206**, `res.ok` is true, and `Cache.put()` **throws on a partial response** — by specification. The throw is inside the try whose catch has no `held` to fall back to, so it rethrows, `respondWith` rejects, and the `<video>` reports an error |
| `Range: bytes=N-` | the conditional path answered **304** and handed back the WHOLE cached file to a request asking for everything after byte N. The log caught it outright: `304` against `bytes=0-3538943` |

**Proved both ways and it needs no codec**, which is what makes it a real measurement rather than a
reading: a page-level `fetch('data/reels/archetest.mp4', { headers: { Range: 'bytes=0-1023' } })`
**threw `Failed to fetch`** through the old worker and comes back `206, 1024 bytes, Content-Range:
bytes 0-1023/7680352` through the new one. The store holds 31 entries and **0 clips** either way —
before, because the put threw; after, because the worker never sees it.

**Two tests rather than one, because neither covers the other.** `req.destination` names what asked
— it catches the first media request, which on some browsers carries no Range header at all;
`req.headers.has('range')` catches everything else, whoever asked. Returning without
`respondWith` is the whole fix: the request goes to the network exactly as it would with no worker.
**And even repaired it would be wrong** — this store is about thirty-five files of code walked
linearly on every miss, and a sixteen-megabyte clip in it is a cost every visitor pays for a file
only the Reels column asks for.

### The iframe is Drive's player, and for a local file it was the same bytes through a worse door

**The container's Chromium is built WITHOUT the proprietary codecs** — `canPlayType('video/mp4;
codecs="avc1.42E01E"')` comes back empty — so a real H.264 clip errors for real here. That is
usually a limitation and this once it is the instrument: it is the first time this repository could
reach the `error` branch of `reelPlay_` at all, and what it showed is that the branch was wrong.

`clipFrame_` returned the address itself for anything with a slash in it. The whole reason a
`/preview` iframe is worth having is that it is a **different server doing a different thing** —
Drive hands a `<video>` a redirect and hands its own player a stream. Nothing of the kind is true
of a file beside this site: the same decoder on the same bytes, now with Google's chrome, no
autoplay, no mute, and the sound button removed on the way past. **So a dead local clip stays a
`<video>`**, and `.feed-vid` is transparent for exactly this reason — the slide underneath is
`.feed-art`'s own gradient with the subject's initial on it, which is a finished thing rather than
a hole.

**Proved in both directions in one run**: the local clip gives 3 videos and **0 iframes**, with the
browser naming the failure itself (`DEMUXER_ERROR_NO_SUPPORTED_STREAMS`); a bare Drive id — every
Google host is blocked from this environment, so the ladder really runs out — still gives 2 videos
and **1 iframe**. The sound button goes on both endings now rather than only the iframe one: a
control that does nothing is worse than no control.

### `node js/check-reels.js` — the README asked for this file and said when

*"A missing file is a dark reel. The path is not checked by anything yet, because there is nothing
here to check — the first clip that lands is when that check is worth writing."* Two landed.

**A dark reel is the worst shape this column has**, because nothing in the app can report it: the
ladder swaps the element for an iframe on the same address, so a clip whose path is one character
wrong reads as the feature half-working rather than as a file that is not there. Four questions,
each a fault that happened or nearly did:

| | |
|---|---|
| **the file is there** | a path typed by hand against a name nobody re-reads |
| **the spelling is exact** | both clips arrived as `.MP4`. A row saying `.mp4` works on every machine it is written on and 404s on Pages — **the `_scope.js` shape that `.nojekyll` closed, in a second column** |
| **a browser can play it** | read out of the container rather than off the extension: a `.mp4` holding HEVC plays on an iPhone and shows nothing on an Android |
| **`moov` before `mdat`** | the one that is invisible without opening the file. An MP4 whose index sits at the END cannot start until the whole file has arrived — eight megabytes before the first frame instead of a few hundred kilobytes. Every tool writes it either way and nothing about the file says which |

**Weight is printed and not refused** — 15.2 MB across the two — because "under about ten megabytes
is comfortable" is a judgement about somebody's data allowance, not a fault in the file.

**Proved by mutation four ways**: the row spelled `.MP4`, a path naming nothing, a copy rebuilt with
`mdat` before `moov`, and a copy with its `avc1` fourcc patched to `hvc1`. All four exit 1 and name
the row; the real files exit 0.

**What it cannot answer, said rather than implied.** Whether the picture DECODES is settled by a
phone, for the codec reason above. Reading the container is the half a checker can do.

## The Settings spreadsheet is being deleted, and eleven write handlers had no callers

**Asked for as "im trying to delete the settings spreadsheet. but obviously i want to not lose most
of its data… i am trying to move whats needed to code."** Fifty-eight tabs, coloured by the owner:
purple for what they knew they wanted, the file's own gold for *read by the app*, grey for
`_`-prefixed *read by nobody*.

**The first move was the export, on its own, before any wiring.** 679 rows and 6,233 cells compared
back against the workbook cell by cell — **0 differ** — which is the `libraryExtras_` rule this file
already records twice: prove it identical first, then make it. `data/settings/*.json` holds the 21
data tabs under the sheet's own column names, and `docs/settings/*.md` holds the 37 documentation
tabs as prose. At that commit the spreadsheet became deletable without loss, which is the thing that
had to be true before anything else was worth doing.

### The three-question test, and question 2 answered no for everything

**`updateVenue`, `updateConfig`, `updatePricing`, `updateShop`, `deleteShopItem`, `updateLink`,
`addLink`, `deleteLink`, `saveRoom`, `updateTrip`, `addTrip` — eleven handlers, access-listed in
`ACTION_ACCESS`, writing through `setCell`/`addRow`/`delRow`, and NOT ONE has a caller anywhere in
`js/` or `index.html`.** Measured rather than read: the strings do not occur. **That is
`orderPrints` eleven times over**, and `check-payload.js` has been able to see the wreckage from the
other end the whole time — `linkFields`, `roomFields`, `roomSlots`, `shopFields`, `tripFields`,
`venueFields`, `pricingRows` and `multiSelect` are all on its *sent and never read* list, because
they are the scaffolding those dead forms needed.

**So "does the app write to it" is NO for every Settings tab**, and that is what makes moving any of
it possible at all.

**Question 3 is the one that actually splits the list**, and it is not the same question. Eight tabs
are FORWARDED — the backend shapes a row and pushes it onto the payload, and nothing is computed
from it. Those a phone can own. The rest are read by the backend to *decide* something, and three of
those decide money.

### What is deliberately NOT in code, and the sentence is already in this file

**`config`, `pricing` and `venues` feed `quotePerHour` SERVER-SIDE.** *A total posted by a browser
is a total the client chose* — this repository's own words, written when `printPrice` moved to the
phone. Those three belong in **Ledger**, which is one line each in `WHERE` and leaves the Settings
file just as dead. `options`, `shop`, `holidays`, `landmarks` and `terms` are the softer version of
the same thing: `allOptions()`, `avatarCatalogue()`, `festiveOffers()` and `landmarks()` each do
arithmetic or a join rather than a forward, so moving them means porting a transform, which is work
rather than a copy.

### The file wins when it has rows, and that is what makes it shippable alone

`settingsInto_` in `js/settings.js` is `libraryExtras_`'s rule pointed the same way — **a file with
no rows leaves the payload's key alone** — and here it earns more than it did there, because the
front end reaches Pages in a minute and the backend reaches Apps Script when somebody runs a sync
that is blocked on a Cloud-project switch. Every ordering has to work:

| | |
|---|---|
| old backend, files present | the files win. Identical, because they ARE its rows |
| new backend, files present | the files are the only source |
| **the sheet deleted, old backend** | `openById` on a trashed file is caught — `ss = null`, every tab reads empty, the payload sends `[]`, **and the files win** |

**That third row is the one worth having**: the spreadsheet can go as soon as this deploys, without
waiting on the sync. Measured both ways in a real browser against the real files — 16 brand keys,
21 facets, 58 facts, 126 links in 25 categories, 12 campaigns; blank the files and every one falls
back to whatever the payload said.

**`kinds` and `laws` are `[]` on purpose and the harness proves why.** Both tabs were empty, so both
files are empty, so `check/fixture.json`'s three `kinds` rows — the ones that regroup tutor→people
and venue→places — still decide. That is the escape hatch this file already records, proving itself
a second time.

**And five fixture keys were deleted in the same commit.** `brand`, `facets`, `facts`, `links` and
`campaigns` are now overwritten a moment after they are read, and **a fixture key that silently does
nothing is the fault the suite exists to catch** — the sentence written when `questions` left. The
fixture's four brand keys were all in the file's sixteen, so not one of them survived.

**`fields` is not rebuilt on a link**, and that is the one shape deliberately not copied. The
backend packs every editable column onto each link for `updateLink`, which has no caller; `find.js`
reads `title`, `category` and the row. Carrying it would be shipping a dead surface's luggage to
every phone.

### Two things found on the way that are worth more than the migration

**The `facts` tab is a duplicate of `FEED_FACTS`, exactly.** 58 rows, all 58 matching the code's
list on subject and heading, nothing left over on either side. `factsNow_` prefers the sheet, so the
sheet has been winning — and handing back the code's own list. **This file says in two places that
the tab is empty or does not exist.** It has 58 rows. Nothing was ever wrong on screen, which is why
nobody looked.

**`terms` is the tutor agreement and it reaches no screen.** Eighteen rows — `docid`, `audience`,
`version`, `live`, `seq`, `title`, `heading`, `body`, `mustsign` — a real legal document, written
out. `check-payload.js` carries `DATA.terms` on its accepted-dead list with the note *"terms.js
wants legal documents (docid/version/mustsign); TAB.terms is SCHOOL terms"*. **That note is right
about `SCHEMA` and wrong about the sheet**: the tab holds exactly what `terms.js` asks for, and
`termsFor()` has been reading the same tab for school terms, finding no `term_name`, and falling
back to computed defaults — which is why nobody noticed either half. One tab, two readers, and the
one with real content in front of it was never wired up.

### What the brand tab carries, said rather than buried

`brand` holds the business's e-mail and phone. **Both are already published**: every row of that tab
goes into `payload.brand` and out to every anonymous visitor, `brand('phone')` is printed on the
flyer the app makes, and the e-mail is the author address on every commit in this public repository
already. Committing them publishes nothing that was not published — and `brand.email` is read by
**nothing** in the app, so it is a dead key as well as a personal one.

### The spreadsheet went from three files to two, and `?setup=1` would have died on the way

**The Ledger came back with 23 tabs and the import was exact** — the seven new ones match what was
sent **cell for cell: 353 rows, 3,833 cells, 0 differ**, dates still dates, and all fifteen of the
Ledger's own tabs untouched. `ticks` (518 rows) is there too, routed by nothing and read by nothing;
it is the one tab in that file holding children's handles, and it stays where it is.

**`post_comments` was missing**, which is expected — `ensureSchema` is the only thing that creates
it. Which is how the real fault was found.

#### `ensureSchema` had a bare `openById` and one dead route would have taken the whole run down

```js
const ss = SpreadsheetApp.openById(at.id);     // no try, no catch
```

**With `Settings` in the bin and one tab still routed at it, that throws, the throw escapes
`ensureSchema`, and the run dies on the first name in `SCHEMA`.** `?setup=1` is the only thing that
creates `post_comments` — so the comments feature would have sat there looking broken, on a live
site, with nothing anywhere saying why. Found by *reading the function while checking whether the
spreadsheet was safe to delete*, which is the only reason it is not a story about a broken setup
route.

**The route is fixed and so is the rule**, because repairing the instance and not the rule is the
shape this file records under `cost: 0`, under `paper: true`, under the spelling fold and under
`delRow` — every time with the fault coming back. A tab whose file will not open is now reported and
skipped, and the other thirty are still checked.

#### Seven moved, nine were deleted, and `SETTINGS_ID` went with them

| | |
|---|---|
| **to `Ledger`** | `config`, `pricing`, `venues` — **the money**, which `quotePerHour` decides server-side. Plus `options`, `shop`, `holidays`, `landmarks`, each reshaped by a function here (`allOptions`, `avatarCatalogue`, `festiveOffers`, `landmarks`) before anybody sees it |
| **deleted outright** | `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns`, `copy` — `WHERE`, `TAB`, `SCHEMA` and every `read` block, in one commit. `settingsInto_` builds all nine from `data/settings/*.json` |
| **routed to `Ledger` although empty** | `terms`, `rooms`, `trips`, `herd`, `widgets`, `map`, `landmark_parts` — so `read()` still answers and `ensureSchema` has somewhere to make them |

**`SCHEMA` had to go in the same commit as the read blocks, in both directions** — the third time
this file records that argument, after `SCHEMA.resources` and the library cut. Deleting the entries
alone fails `check-columns.js` on every `r.field` in a block that still exists; leaving them behind
is worse than untidy, because `ensureSchema` **creates any tab it cannot find** and would have built
nine empty decoys in `Ledger` — right headers, no rows, and somebody typing into one would be
ignored by an app reading the file instead.

**And `?setup=1` against `terms` stops being the hazard this file warns about.** That warning was
about adding nine school-term columns to a legal-documents tab; in `Ledger` there is no `terms` tab
at all, so it makes a fresh one with the right headers — which is the tab `termsFor()` has wanted
since it was written and has never had. The legal document itself is `data/settings/terms.json`.

#### Three dead handlers went, and eight are still here

`updateLink`, `addLink` and `deleteLink` wrote to a tab that no longer exists, so they could not
have worked. **They could not have been called either**: measured across `js/` and `index.html`, not
one of the three strings occurs. The other eight of the eleven — `updateVenue`, `updateConfig`,
`updatePricing`, `updateShop`, `deleteShopItem`, `saveRoom`, `updateTrip`, `addTrip` — write to tabs
that moved rather than went, so they would still work if anything ever called them. They stay, dead,
until somebody decides whether that admin surface is being rebuilt or buried.

#### Two server-side readers lost their sheet and both already had the answer

`reactionSet()` walked `brand` for a `reactions` key **no row has ever carried**, so it always fell
through to `HOUSE_REACTIONS`; it returns that now, and a post's own cell is still the rung above.
`brandName()` fell through to the literal `'@family.'`; that is `BRAND_NAME` in `constants.gs` now —
one place rather than a fallback repeated at each caller. **Two spellings of one name is a thing to
keep in step**, so it is written down: the file is what every screen reads, that constant is what
signs an e-mail.

**Measured after, in a browser against the real files**: 16 brand keys, 21 facets, 58 facts, 126
links in 25 categories, 12 campaigns, and the reel column still two clips. 30 checks pass and
`check/ui.js` reports nothing across 104 combinations.

## A person may change their own name now, and two of the three asks were already built

**Asked for as "allow people to be able to change their own code and username. i will need a naughty
username blocker? and maybe only allowing them to change username once a month maybe a good idea?"**
Measured before building anything, and two thirds of it existed:

| | |
|---|---|
| **the code** | `changePin` is access-listed `'self'`, wired at `me.js:1490`, three fields at the foot of the *Edit me* sheet, new PIN typed twice, current PIN required. **Already done** |
| **the username** | `handle` is not in `PROFILE_EDITABLE`, so nobody has ever been able to change one. This is the whole of the new work |
| **the blocker** | yes, and it is the SECOND most important guard |
| **once a month** | yes, and not for tidiness — see below |

### Uniqueness is the rule that matters, and it is correctness rather than taste

**`findPerson` resolves a person by `person_id`, then `full_name`, then `first + last`, then
`handle`, then `username` — first match wins.** So a handle duplicating any of those makes
`changePin` check the PIN somebody typed against **another person's row** and tell them their own
PIN is wrong. This file already records that denial: it happened by accident, to one person, because
a call forgot to send an id.

**Letting people choose their own handle turns that accident into something a person can do on
purpose.** So the check is against all four columns and not just `handle` — and it is the reason the
word list, which is what anybody asks about first, is the second guard rather than the first.

### And `handle` and `username` are one fact in two columns

**Third occurrence of the shape**, after `needs_print`/`print_required` and `category`/`compliance`.
`register` writes `username` as `norm(first + last)`; `doGet` reads `handle || username ||
first_name`; `findPerson` matches both. **A change writing only `handle` would leave the old name
answering to that person for ever** — a new name and still reachable by the old one. `changeHandle`
writes both or neither.

### The cooldown is a brake on the arms race, not a tidiness rule

A blocklist is a floor and never a ceiling: somebody who can rename freely sits there trying
variations until one gets past, which is a game they win eventually. **Thirty days turns that into a
month of waiting per attempt.** `handle_changed_at` is the only state — one date, no counter, so the
rule is *has a month passed* rather than a tally to keep in step. **Admins skip the cooldown and
nothing else**: an admin fixing somebody's bad handle is the remedy, and an admin taking a taken
name is still a collision.

**`handle_was` is a safeguarding column rather than a nicety.** Most of the people on that tab are
children. A rename leaving no trace means an admin cannot answer *"who was @foo last week"* — the
question that gets asked exactly once, about the one account where it matters.

### The Scunthorpe half is half the cases, because the wrong refusal is the worse one

**A rude handle is seen by a parent; a real name refused is somebody who has done nothing, told no,
with no way to argue.** So `HANDLE_ALLOWED` carries nineteen innocent words with **one written
reason each** — `analysis`, `classic`, `cocktail`, `bassist`, `therapist`, `scunthorpe` itself —
which is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` / `RETIRED_FACETS` pattern for a fifth time, and
means a NEW collision fails loudly instead of joining a list nobody reads.

**Matched against the de-leeted form**, so `f4gg0t`, `sh1t_lord` and `b0ll0cks` are the same strings
as their plain spellings before anything is compared — a filter that only catches the plain spelling
catches nobody who is trying. **And the word is never quoted back**: naming it is repeating it, on a
site children read, and the person who typed it already knows which one it was.

**ASCII only, and that one is about safety rather than shape.** `раul` with a Cyrillic а and `paul`
are different strings that look identical, so a handle nobody can tell from somebody else's is
impersonation with nothing to point at. Refusing unicode makes it impossible rather than something
to spot.

**No rule is repeated on the phone.** The box checks whether it is empty and nothing else; the line
underneath says whatever the server said. `MESSAGING` records the argument — a rule written twice is
two rules to keep in step — and writing "3 to 20 characters" into `me.js` would be a third place for
that number to be wrong.

### `node js/check-handles.js` found a real one on its first run

**Every banned word was being let through.** The allow-list's end-of-string test was
`folded.lastIndexOf(w) === folded.length - w.length`, and `lastIndexOf` answers **-1** when the word
is not there — so any handle exactly one character SHORTER than some allowed word made `-1 === -1`
and was waved past. `fuckface` is eight characters and `therapist` is nine. **Thirteen cases failed
at once, `n1gg3r` among them**, on a line that reads perfectly and is wrong by a sentinel value.

**Nothing about that was visible from reading it**, which is the entire argument for writing the
check before trusting the filter — and it is the same shape as `.mat-out` and the seven dead custom
properties: reasoning about behaviour instead of asking for it. It is `startsWith`/`endsWith` now.

**41 usernames checked**, every one a fault that happened or would have: the shape, the Cyrillic
lookalike, the reserved names, the leet spellings, the innocent words, a clash against each of the
four columns `findPerson` answers to, your own handle not clashing with yourself, and the month
holding at five days and releasing at two hundred. Plus three that an admin must NOT be exempt from.

## The payload came back as an error, and the list that did it was a fourth place naming tabs

**Reported with a screenshot of the live site**: an orange banner reading *"The server said: No terms
(expected in ledger), links (expected in NO FILE — not routed in WHERE)."* Not a thin section of the
site — `doGet` returns that object **instead of a payload**, so there were no people, no jobs, no
prices and no shop on any phone.

**`REQUIRED_TABS` in `doget.gs` is a FOURTH hardcoded list of tab names**, beside `TAB`, `WHERE` and
`SCHEMA`, and it was the only one nothing was reading. `links` left `WHERE` in the commit that moved
the links into the repository — correct, and it made `read('links')` permanently unable to find a
sheet, so a list nobody had thought about since took the site down. `TAB`, `WHERE` and `SCHEMA` all
agreed with each other perfectly the whole time; `check-tabs.js` said so and was right.

**`terms` was the same fault a step further back and had never been required at all.** `termsFor()`
COMPUTES the year's terms and reads the tab only to OVERRIDE them — this file already records that
under "`terms` is two different tabs sharing a name" — so the app has run without that tab for its
whole life. It was in the list because somebody typed ten names once.

**So the list is an object with one written reason each**, which is the `ACCEPTED` / `VOCAB` /
`RETIRED_FACTS` / `HANDLE_ALLOWED` pattern for the fifth time, and the bar is written down with it:
not *the app uses this*, but *without this tab the payload is WRONG rather than merely thin* — a
price of nought, a sign-in that finds nobody, a family's sessions reported as none. Anything softer
ships as an empty list, which is what every other tab already does. Eight names, and neither of the
two that took the site down could have survived writing its sentence.

**`check-tabs.js` rule 6 is the half a checker can see**: a required tab that `WHERE` does not route
can never be found, and one that `SCHEMA` does not describe can never be created, so either way it
is an outage waiting for the next deploy. **What it cannot see is a routed tab nobody has run
`?setup=1` to create yet**, so a name added there still takes the site down until somebody does —
said rather than implied. Proved in four directions: `links` back in the list fires it, a required
tab with its `SCHEMA` entry removed fires it, and the list renamed fires the cannot-find-my-subject
guard.

**That last one failed the first time and the reason is worth keeping.** `objectAfter_` located the
block with `indexOf('const ' + name)`, and `const REQUIRED_TABS` is a PREFIX of
`const REQUIRED_TABS_RENAMED` — so a rename that should have failed the check silently handed it the
renamed object instead. A word boundary now, on all five lookups.

## "It shows old reels, then I hard refresh and it works" — the worker was serving the whole old site

**The service worker decided what a navigation was from its PATHNAME**:

```js
if (url.pathname === '/' || /\/index\.html$/.test(url.pathname)) return e.respondWith(page(req));
```

**GitHub Pages serves a project site from `/family/`**, which is neither. So every navigation fell
through to `file()`, whose first act is to serve an exact URL match with no network at all — and the
entry point is the **one** URL that carries no deploy stamp, so it matched itself for ever. `LOAD`
lives inside that file and names every other file's URL, so once the old `index.html` was being
served, all twenty-five scripts and the stylesheet were exact hits too. **The whole old site,
permanently, escapable only by a hard refresh.**

**`page()` was correct and was never the function being called.** Its own comment says a stale copy
of `index.html` *"would pin the whole app to an old deploy and this worker would keep it there for
ever"*. It was right about the consequence and wrong about who would cause it.

**The browser says what a navigation is; a pathname is a guess about where the site is deployed.**
`req.mode === 'navigate'` needs no knowledge of the deploy path, and the `index.html` suffix stays
for a URL somebody types out.

**`family-1` → `family-2`.** The poisoned entry is inert once navigations go to `page()`, and a store
known to hold a copy of an old deploy is still not a thing to leave on somebody's phone and reason
about. One cold visit each, once, for certainty.

### The lab's own base path is what hid it, and that is the whole lesson

**`check/load.js` serves the repository at `/`**, so `url.pathname === '/'` was TRUE on every run it
has ever made — and it measures **times and bytes**, both of which a stale load flatters: serving
yesterday's site from the cache is fast and free. Four green checks and a hundred and four UI
combinations, and the app was a deploy behind for everybody.

**`node check/deploy.js` asks the one question neither can**: after a push, does the browser run the
NEW code. Nothing about milliseconds, nothing about bytes, so its answer does not move with what else
the machine is doing — which is why it is on the roster where `load.js` and `splash.js` are not.

**Three loads and two deploys, because a two-load version passed against the broken worker.** A
worker never controls the page that registered it, so load 1 is uncontrolled, load 2 is the first the
worker sees — and the first chance it has to file the entry point away — and **load 3 is the first
that can be answered out of what load 2 filed**. My first probe stopped at two and reported OK.

**And a new tab per load, not `goto` twice.** Chromium treats a navigation to the URL already in the
address bar as a RELOAD, whose request carries `cache: 'no-cache'` — so the harness was measuring a
case nobody is in. *"When I first go on site"* is a fresh navigation: a bookmark, a home-screen icon,
a tapped link.

**It runs at BOTH base paths**, because the fault was base-path-dependent. The mutation shows it
exactly: put the pathname guess back and `/family/` fails while `/` passes.

### The other half was reverted, because it could not be shown to do anything

`sw.js`'s header says `index.html` *"is served `no-cache` on purpose"*. **Nothing in this repository
sets that header** — Pages decides it — and `index.html`'s own prose has always assumed the worse
answer. So `fetch(req, { cache: 'no-cache' })` went into `page()` to ask the origin whatever the
browser's freshness lifetime says.

**Measured, it made no difference**: `check/deploy.js` passes with it and without it at both base
paths, and a plain `fetch` of the entry point inside a `max-age=600` was observed reaching the
network anyway. So it is not there. **Two rules changed on a measurement nobody had taken is what
`.mat-out` and `.fm-out` cost this project**, and one extra conditional request on every warm visit is
a real price for an effect nobody could produce. What the live headers actually say is a `curl -I`
away and unreachable from here — every host but GitHub is blocked — so it is written down rather than
guessed at, with the line to change if the fault ever returns on a site `check/deploy.js` says is
fine.

## The session receipt spent a quarter of itself saying nothing fourteen times

**Reported as "audit the reciept and see how it could be made better. its so fucking clunky long
looking".** Measured first, signed in at 390px, on a real session — subject, level, tutor, venue,
six dates, a price:

| | before | after |
|---|---|---|
| the receipt card | **683px** | **470px** |
| its rows | **28** | **14** |
| of those, a dash | **14** (168px) | 0 |
| rows taller than one line | 3 | **0** |
| `span.bk-t` past its column | 18–28px, four widths | 0 |

### The dashes are right on the form and wrong on the receipt

**`SPINE`'s own note is the argument and it is right about one document**: *"a row with nothing to
say prints a dash rather than being left out, because a document whose SHAPE changes with its
contents cannot be read at a glance: you find a line by where it is."* That is how you use a FORM —
the rows you have not answered are the rows you are about to, and one appearing under your thumb as
you answer moves everything below it, which is the complaint this file already records about the
week grid folding.

**A receipt is not filled in.** It is read once, about one session, and nobody counts down it to
find `Tutor`. A row saying a fact does not exist is not a fact; on a printed receipt it is the line
the shop leaves off. So `spineRows_` takes a `fill` flag, the form is the untouched caller, and the
receipt asks for something different.

**The spine and its guard are untouched**, which is what makes it safe: this changes which rows are
DRAWN, not what a row is called or where it sits. `check-spine.js` reads the LABELS both builders
push, not the markup, so the drift it exists to stop — `Seats` against `Students`, `Space` against
`Host` — is caught exactly as before. Proved by mutation: a stray `Invoice ref` still exits 1.

### `check/ui.js` had never had a receipt on the screen, and that is why three faults were sitting on it

**Measured before anything was changed: the booking column draws ONE page and it is the form.**
`myJobs_()` keeps the sessions whose `client` or `tutor` is the visitor, and the fixture's one job
names neither — so `booking: nothing to report` has meant the form at four widths on every run this
file has ever made. **The most-complained-about card in the app was outside the measurement.**

**And the basket is worse: no fixture can reach it at all.** `basketPages()` draws nothing when
`CART` is empty, and `CART` lives in `localStorage` rather than in the payload.

Both are declared states now — seeded through the app's own doors, `DATA.liveJobs` and `CART`, the
way the signed-in visitor and the seeded message thread already are. 104 combinations became 112.
**Every fault below came from their first run.**

### Three faults, and the third had been dead since the line was written

**`Per session` wrapped its label on every receipt ever drawn.** A 68×30 label box on two lines
beside a 230px value column holding "1.5 hours" — the label broke in half while two thirds of the
room next to it went unused. **The `max-content` repair this file already records went onto
`.bk-row.is-blank`, the DASHES, and not onto the rows somebody reads.** Repaired in the instance,
not in the rule, for the third round of the same fault. `.bk-row.is-bare` takes
`minmax(6.2em, max-content)` now: a floor so every receipt's labels start where the form's do, and
a ceiling that is the label itself.

**`6 dates` overflowed the total column**, because `.bk-t` is `--mono` and the track is `7.5ch`
measured against the ROW's proportional font. It is exactly wide enough for `£270.00`, which is
what it was measured for, and money is the only other thing that column has ever held. The count
went into the value, where the dates are — one answer, not a value and a total.

**And `£270.00` overflowed it too, by 18px on a receipt and 28px in the basket.** `.rc-total`
declares its own three-track grid at its own block — `auto minmax(0, 1fr) max-content`, right,
because it hides three of the six children — and **`.bk-row` is one class sixty lines LATER, so the
cascade settles the tie by order and that declaration has never applied.** The total row has been
drawn on the five-column booking grid since the day it was written, with its figure in a `7ch`
track. **Fourth conviction of this rule in this stylesheet**, after `.price.faint`, `--fly-ink` and
`.bk-row.is-blank` losing to `.bk-row.is-bare` 3,000 lines down.

### And narrowing the funnel emptied the booking column

**Found because the new state repainted the column and got back zero pages.** `bookingPages_` opens
with two guards. The first says the column is exempt, and says why: *"the booking column has no
funnel state, because nobody answered `What for` to get there — they swiped."* The second, five
lines down, refuses to build anything once `kindLabel` has been answered — **and it was never given
the same exemption.**

So: narrow the funnel to `What kind · Questions`, swipe to Booking, and save anything. `load()`
repaints, `bookingPages_` returns `[]`, and the form, the receipt for the session you just booked
and the basket all go, with nothing on screen saying why. `go('booking')` alone does not do it,
which is exactly why it survived — you have to narrow, swipe over, and then save.

### What was NOT done to the basket, and why

**Asked as "the cart should be moved elsewhere? idk where? maybe another coloumn? its own coloumn?
maybe."** Measured before answering: it is page 3 of Booking, 278px, and `cart-send` is
`toast('Checkout is the next thing to build')`. **It cannot complete a purchase.** Only `DATA.shop`
rows can enter it, priced in credits, and nothing is ever posted anywhere — it lives in
`localStorage` and stops there.

**So a column of its own would be a wider front door onto a room with nothing in it** — the
`orderPrints` shape this file already records eleven times over under the Settings migration. The
instinct behind the question is right and the answer to it is a checkout, not an address. Written
down rather than done, because where a basket lives is a judgement for whoever owns the shop, and
the one thing that is not a judgement is that moving it changes nothing today.

### How long a pinned browser takes to recover, measured — and I got it wrong twice first

**Reported as "look still old", with a screenshot of the live site drawing a "Reels" heading over a
FACT** — which is the signature this file already records: `clipsNow_` filtered the facts out of
that column on 2026-09-17 and the heading went with the one-widget-per-reel change, so the browser
was running a build from at least two days earlier.

**Nothing was wrong.** The Pages deployment for that merge finished at **10:39:07**; the screenshot
is stamped **10:40**. The fix had been live for fifty-three seconds.

**But "just open it again" was a claim I had made without measuring**, so it was measured: the
worker from before the fix installed, the site opened twice to pin the entry point, then the fix
deployed, then opened again and again.

| | |
|---|---|
| the deploy lands | nothing changes on that open |
| **one more ordinary open** | the new worker installs; the store becomes `family-2` |
| **the open after that** | the new code runs |
| **`?dev`, once** | every store emptied and every worker unregistered **on that page**, new code immediately |

**So it is TWO ordinary opens, not one.** A worker never controls the page that registered it, and
the page that installs the new worker was itself served by the old one — so the earliest the new
code can run is the load after the swap. `?dev` skips both steps because it unregisters at the top
of `index.html`, before a single versioned URL is asked for.

#### Two wrong answers on the way, both from the harness rather than the app

**"The browser asks for `sw.js` once, ever."** It printed exactly that: one request on the first
load and none on any of five opens after it, with the registration never reaching `installing`.
**The harness was closing the page 1,800 ms after `goto`, and `load` had not fired** — it waits for
every deferred script and the 3.4 MB library. At 6,000 ms the server sees a request for `sw.js` on
**every** navigation, which is what Chromium actually does.

**And a fix was written on that wrong reading.** `register(...).then(reg => reg.update())`, to force
the check the browser supposedly was not making — twenty lines of prose about how a broken worker
could not be replaced by pushing a new one. **Measured with `load` allowed to fire, it changes
nothing**: with it and without it, the new code runs on the same open. Reverted, and it is the
third time this file records that sentence — `.mat-out`, `cache: 'no-cache'`, and now this. **A
rule changed on a measurement nobody took.** The only difference here is that the measurement was
taken, was wrong, and the second measurement caught the first.

**The instrument lied in the flattering direction both times**, which is the one thing every entry
under `check/load.js` already says about this kind of harness: a page closed early looks like a
browser that never asks, and a browser that never asks looks like a bug worth fixing.

## The booking form said the same eleven numbers seventy-seven times

**Reported with a screenshot of the form: "just look at this so ugly and infomation overload.
howvere im pretty sure its all/almost all neccesary. the grid fucks it abit too. but i kinda need a
grid."** Both halves of that are right, and they rule out the obvious fix: nothing may be deleted,
and the week stays a week.

**Measured first, at 390px signed in, on the empty form:**

| | before | after |
|---|---|---|
| the card | 768px | 784px |
| rows | **28** | **28** — not one removed |
| digits inside the 77 cells | **154** | **0**, and 11 in one header row |
| blank rows whose dash sat at the card's right edge | **12** | 0 |
| the receipt's copy of the same grid | 113px | **80px** |

### The repetition was structural, so the fix is too

**`slotGrid()` BUILDS THE HOUR SPAN ONCE** — `for (let h = 10; h <= 20; h++)` — **and every day in
`SLOT_DAYS` maps over the same list.** So the numbers down each column were not merely alike, they
were the same array read seven times; drawing them seven times was drawing one fact seventy-seven
ways. One header row, and `.hr`'s own note is the argument for it: *"a grid of numbers is scanned
rather than read — you are looking for the shape of the ticked boxes, not reading eleven figures."*
A cell's number was never the thing being read. The column it sits in is.

**One helper, called by both grids.** `jobGrid_` was deliberately built out of the form's own markup
— its comment says *"the form's markup, down to the class names"* — because a receipt drawn with
different elements drifts the next time the grid is restyled. A header written twice would put that
back one element up, which is this file's sentence about `documents_()`, `factsNow_` and
`childrenOf`. And the header is an ordinary `.slot-row` in the same flex box with the same gap, so
the labels take the same `flex: 1 1 0` slice their columns do — **the columns line up by
construction** rather than by two sets of widths that can disagree.

**The cell keeps its name, and gains a better one.** An empty `<button>` has no accessible name at
all, so `aria-label` carries `Monday 14:00` — and, where the hour is shut, why. The bare numeral
never said which day it was on.

### A cell with nothing in it has to state its own height

**`.rc.is-done .hr { min-height: 0 }` was right while every cell held a digit.** The digit set the
height and the line only said *do not pay a fingertip's floor for something nobody presses*. With
the hours gone the cells are empty, so `0` became the actual height: **16.16px a cell before,
2.84px after** — seven rows of hairline with the booked hours floating over nothing. Declared now,
which is the move this file already records twice as *replace a property that was only true by
accident of interaction with one a reader can check*.

**And the day label stopped deciding the row.** Measured: a 9.2px label at the browser's normal
line-height made a 14.2px row round a 9.45px cell. On the form the 20px press target wins outright;
on the receipt it was the label, which is the wrong element to be deciding it. That is where the
receipt's 33px came from.

### Twelve dashes at one x and sixteen values at another

**The right side of the card zigzagged between two columns, twenty-eight times.** A blank row is
`max-content minmax(0, 1fr)`, so its dash landed at the card's right EDGE; an answered row is the
five-track grid, so its value stops two-thirds across where the multiplier, the rate and the total
begin. **Nothing could have caught it**: no overflow, no clipping, every row exactly the width it
asked for. A screenshot, for the ninth time.

**The three trailing tracks are kept on a blank row and left empty.** `.bk-row.is-bare` already
hides `.bk-m`, `.bk-r` and `.bk-t` there, so nothing is placed in them — but a track that exists
still takes its width, and that puts the end of the value column in the same place on every row.
The alternative is a right margin computed from the other three widths, which is the same number
written twice.

**And the label recedes with the value.** A blank row's value already dimmed and its label did not,
so `Weeks left` — a fact that does not exist until a term is chosen — was set in exactly the ink of
`Level`, which is the next thing somebody has to answer. Ten questions stand forward of eighteen
rows now, at no height and with nothing removed.

**What is NOT done, and the reason is `SPINE`'s own.** The twelve dashes stay. *"A document whose
SHAPE changes with its contents cannot be read at a glance: you find a line by where it is"* — and
a row appearing under your thumb as you answer is the fault the week grid's own note already
records about folding. The complaint was that they were loud, not that they were there.

### The known tap-target count went 102 to 492 and that is the honest number

`check/ui.js` keys a finding on the element's text, so seventy-seven hour cells collapsed to eleven
keys for as long as seven of them shared a caption. With `aria-label` naming the day they are
seventy-seven, which is how many controls there are. **The check is not tuned to make its own number
look like it used to** — nothing new is reported, the section is capped at sixty lines with a
remainder, the reason underneath is the same one, and the count that was wrong was the old one.

### The form was printing two other documents' rows, and a priced row twice

**Asked for again: "i just want the booking thing to be more efficient with space. and cant the grid
be better".** So the first move was to measure where the height goes rather than to trim what looked
trimmable. At 390px on the empty form, 784px:

| | |
|---|---|
| the fifteen rows you answer | 285px |
| **the grid and its instruction** | **193px** |
| **twelve rows that are a dash** | **144px** |
| the total bar, the two tiles, the terms | 108px |

**THE SPINE IS THE UNION OF THREE DOCUMENTS AND THE FORM WAS DRAWING ALL THREE.** Measured on a
priced ordinary booking: nine dashes, and eight of them were another document’s. `A seat`,
`Shared by`, `Per session`, `Running`, `Weeks left` and `About` are pushed only inside
`if (isWaiting_()) { … return rows; }`, which an ordinary booking never enters; `Sharing` is
pushed once in this file, by `jobRows`, which is the receipt.

**`SPINE`’S OWN ARGUMENT SURVIVES INTACT, and it is what draws the line.** *"A document whose SHAPE
changes with its contents cannot be read at a glance: you find a line by where it is"* — true of a
row you have not answered YET, because you are about to and everything below it would move. A row
this branch cannot answer at all never moves anything: nothing you do on this form will ever fill
it, and it was never on this document. `only:` is one word on the `SPINE_EXTRA` entry, beside the
row it describes, and **it governs the invented dash and nothing else** — a builder that starts
pushing `Per session` needs nothing changed here, so a flag that goes stale can hide nothing.

**`Asked for` was refused by `check-flow.js`, and the refusal was right.** By the rule above it
would have gone with the rest; the check names the argument this file already records beside
`Stage` and `Status` — those three are the state of the booking, the form and the receipt for one
session are one document across TIME, and a row that appears only once the thing is saved changes
shape at the moment somebody is checking it. The six above are one document across NOTHING: an
ordinary booking never becomes a waiting list. Worth twelve pixels, and the check is why it is a
decision rather than an oversight.

### `Extra subjects` drew twice on every priced booking

**A dash beside `Subject`, and the real row at the FOOT of the card, below `Status`.** `AFTER` in
`bookBreakdown` places that row after the subjects step on purpose; `spineRows_` then moved it to
the end, because `price-rows.js` pushes it as `Extra subjects` and the spine row is `Extra subj.`
— `SPINE.indexOf` came back −1 and it fell through to `extra`.

**The shortening never reached its push site.** The note over `SPINE_EXTRA` records four labels
shortened to fit the 6.2em column; three were shortened where they are pushed and this one lives in
another file. One `SPINE_ALIAS` entry, which is what that table is for. **Found by rendering a
priced booking rather than by reading**: the row list came back with `Extra subjects` after
`Status`, which no amount of reading the two files side by side had suggested.

**And the moment it carried a real value it wrapped** — `Extra / subj.`, eleven characters in a
ten-character column. The `minmax(6.2em, max-content)` repair was already on `.bk-row.is-bare` and
`.bk-row.is-blank` and **not on the rule they are variants of**, which is this file’s own sentence
about `cost: 0` for the eighth time. The floor is what matters and it stays: every label starts at
6.2em, so the answers still line up down the card; `max-content` is a ceiling only a long label
reaches.

### Two hours in a row are one session, so they are one bar

**The instruction above the grid says it in words** — *"two together is a two-hour session; another
day is another session"* — **and the picture said the opposite**: two gold squares with a gutter
between them, which is two of something. A grid you read by shape should not need a sentence to say
what the shape means. Adjacent ticked hours now join, inner corners squared, so Monday 12–15 reads
as one block and Thursday 16 as one hour — on the receipt too, where the booked run is the only
thing on that grid.

**The gap is BRIDGED rather than closed, and that is the whole of it.** `.hr` is `flex: 1 1 0`, so
pulling a cell 2px left with a negative margin hands 2px of free space back to eleven flex items
and every column after the run drifts out of line with the header above it — which is the one
thing the header is for. Three pixels of gold painted into the gutter changes no layout at all.

**And the first version of that bridge made the cell scroll sideways.** Hung off the left cell it
reached `right: -3px`, and an absolutely positioned child sticking out to the RIGHT pushes its
ancestor’s `scrollWidth` — `check/ui.js` named `button.hr overflows by 3px` at eight combinations.
Nothing was clipped and nothing looked wrong; the box had simply started scrolling when it was not
told it could, which is exactly the question that check asks. Painted by the second cell leftwards
it is the same three pixels in the same gutter, and overflow to the left does not enter
`scrollWidth` at all.

### What it came to, and what was left alone

| | before | after |
|---|---|---|
| the empty form | 784px, **12 dashes** | **700px**, 5 |
| a priced ordinary booking | 844px, **9 dashes** | **764px**, **1** |
| a waiting list | 775px | 762px — and its own six rows are back |
| `Extra subjects` | a dash at the top **and** a row at the foot | one row, in its place, on one line |

**The grid is still 193px and is still at its floor**, which is worth repeating rather than quietly
trimming: seven rows at `max(20px, 1.55em)` plus the header is a week where a day has to be
pressable, and the 20px is a fingertip rather than a preference. What was left to win there was the
meaning, not the height.

## A tutor's hours were a thing you had to already know about

**Asked for as "i think i need to make a widget for tutors in its own coloumn. its where they can
select their availability"** — and the first move was to look rather than to build. **It already
existed and worked end to end.** A week of tick-boxes, saved by `me-save` into the `availability`
column, and `slotGrid()` has read it since it was written: an hour nobody has ticked comes up
greyed in the booking week with *"not available"* beside it.

**What was missing was the door.** It sat inside *Your details*, below About you, Where and
Contact, so reaching it meant knowing it was there. That is the sentence this file already writes
about the calculator: **a tool is not a thing you FIND, it is a thing you OPEN**, and the Tools
column is where the sixteen of them live. This is the seventeenth.

**Not a tenth screen, and the flag is why.** A column of its own is a screen every parent and every
student swipes past holding something only a tutor may use. `widgetsOf_` already gated the flyer
maker on `admin: true`; `tutor: true` is that one role along, reading `isTutorRole()` — which is
"tutor or admin", the shape every other staff test in this app uses. **Two flags rather than one
`staff`**, because a single one would have put the business’s own stationery in front of every
tutor to save declaring a word. Measured: a tutor sees 9 tools and an admin 10; a parent sees 8 and
the widget is not in their roster at all.

**And it stays in the details sheet too**, which is not a second copy: `fieldsHtml` and the widget
both call `availGrid_`, one grid, one save. A tutor who goes looking where it used to be finds it.

### `weekGrid_` — there were three of these, and a comment forbidding the drift did not stop it

**`availGrid_` carried this note**: *"the same grid the booker uses — because it is the same
question … answering it in two different shapes would be two things to learn."* It was right, and
it was a second piece of markup wearing the same class names. **The hour header proved it by
breaking it**: two of the three grids gained one row of numbers along the top and a joined bar for
a run of ticked hours, and the tutor’s went on printing seventy-seven numbers with a gutter
between every tick. Exactly two shapes for one question, under a paragraph saying there must not
be.

**What differs between the three is the CELL and nothing else** — a button you press, a button you
cannot, a label wrapping the checkbox `me-save` reads. So the cell is the argument to `weekGrid_`
and everything round it is written once: the header, the day label, the row, which days collapse.
**The cutover was proved neutral before it was kept**: the booking form and the receipt measured
755px / 162px grid / 20px cell and 418px / 80px / 9.5px before and after, to the pixel.

**The columns line up by construction on all three.** `slotGrid()` builds one hour span and every
day maps over it; the receipt counts 10 to 20; and `availGridOut` in `core.gs` walks
`AVAIL_DAYS × AVAIL_HOURS`, so a tutor’s codes are that same span grouped by prefix. One header
can name the columns for seven rows because no day can have a different set.

### One save, two surfaces, and the DOM says which

`me-save` read `#sheet-body [data-me]` and called `closeSheet()` — both right while the details
sheet was the only place those boxes could be. It gathers its own container now
(`el.closest('#sheet-body') || el.closest('.widget-slot')`) and closes the sheet only when it is in
one, **which is exactly what `msg-send` already does with `form.closest('#sheet')`**. A second
handler would have been a second copy of the whole round trip.

**And the status line is a class, not an id.** Two surfaces carrying `id="me-said"` is two elements
with one id and `$()` handing both Save buttons the first of them — the `$('msg-text')` bug this
file already records, which would have written "Saving…" onto the wrong card. **Proved on the
wire**: ticking one hour and pressing Save posts `updateProfile` with all 77 hour fields and
exactly seven `TRUE` — the six already on the row plus the one just ticked — with no sheet opened
or closed.

### `.hr input` said `width: 0; height: 0` and the element measured 24 × 44

**The declared state found it on its first run**: `label.hr overflows by 4px`, at 320px, 306 times.

`input, select, textarea` sets `min-height: max(44px, 2.9rem)` and `padding: .7rem .75rem` on every
input in this stylesheet, and **neither of those is `width` or `height`**: a `min-height` clamps a
height of zero back up to 44, and `box-sizing: border-box` will not take a width below its own
padding. So the rule read as *take no room* and the box was a fingertip tall and twenty-four wide,
invisible, for as long as it has existed.

**Nothing could see it until the bridge arrived.** It is `position: absolute`, so it laid out
against whatever positioned ancestor it found — a card or a pane, wide enough to swallow it.
Giving `.hr` `position: relative` for the joined-bar bridge made the CELL that ancestor, and the
cell’s own `scrollWidth` saw it. **The `.price.faint` shape for a fifth time**: a declaration that
reads as a decision and behaves as nothing, found the moment something finally measured it.

### The fixture had no hour codes, so the widget could only ever have drawn its empty state

`check/fixture.json` sent `profileFields: []`, which is not what `doGet` sends — so the one state
the lab could reach was the *"the hours have not arrived from the server yet"* card. **That is this
file’s own recurring fault pointed at a new surface**, the same as the booking receipt the fixture
could not reach and the message thread it could not carry. The fixture holds the real
`AVAIL_DAYS × AVAIL_HOURS` span now, which is what the payload holds.

**And the flyer state was right by luck.** It found its page with
`allWidgets().filter(kind === 'tool')` while the column draws `widgetsOf_('tool')` — the same list
with the gated ones removed. The two agreed for an admin, who is gated out of nothing; the first
widget an admin does not see would have put every index after it one page off with nothing saying
so. Both states read the list the column is built from now. **Two readings of one list** is the
sentence this file writes about `documents_()`, `factsNow_` and `reelPages_`.

## The grid was not wider than the rows; the rows were holding three empty columns

**Reported from a screenshot of the live form: "i dont need that extra text. also gride shouldnt
extend beyond the 1st coloumn like the other fields."** Two things, and the second is the
interesting one because the obvious reading of it is arithmetically impossible.

### The instruction went because the picture now says it

**"Two together is a two-hour session; another day is another session"** was a caption on a control
that could not show what it meant — and then the commit before this one made adjacent ticked hours
**join into one bar**. The shape on screen IS the sentence now, so the line under it is the fault
this file already records where the roster's `name` printed an `<h3>` above every widget's own
heading: two sources for one fact, both drawn at once.

**The waiting-list line stays**, and it is a different kind of sentence. Nothing else on the card
says why a week is drawn and cannot be ticked, and a locked control with no reason beside it is the
invisible mode — the same argument as the reel that was paused with nothing saying so.

### The literal reading breaks the one measurement that must not scale

**Measured at 390px before touching anything: the ROW spans 39→351 and so does the grid.** They
already agree. What stops at **193** is the *dash* — because the multiplier, the rate and the total
are three reserved tracks, **158px of every row**, holding nothing on a booking nobody has priced
yet. So the card had two right edges and the grid was on the correct one.

**Clipping the grid to where the dash ends gives cells of 7.5px at 390 and 5.2px at 320**, against
the 20px floor the note over `.hr` records this block reaching after 222 → 174 → 146px. A week has
seven days and a day has to be pressable; that is the one measurement in this stylesheet that does
not scale.

### So the figure columns go when there are no figures on the card

`bookBreakdown` does `const priced = L ? breakdownRows(L) : []` — until a booking can be costed
there are no figures anywhere on it, and the three columns are 158px of reserved nothing on
eighteen rows. Dropped, the value takes the width they were holding, and the dashes end where the
week ends: **one right edge, in both states.**

| at 390px | before | after |
|---|---|---|
| the value's right edge | **193** | **351** — the grid's own edge |
| the empty form | 700px | **675px** |
| a priced card | totals at 351, dashes at 193 | unchanged |

**PER CARD, NOT PER ROW, and that is the whole care.** `is-bare` collapses a single row, and the
note over it records what that did to a FORM: Subject had no surcharge so its box ran the width of
the card, Venue had one so its box was 4.5em and cut "Sutton Library" to "Sutton Li…" — two
editable fields, one above the other, in two sizes, because which size a field got depended on
whether its answer happened to cost anything. Asked of the CARD, every row answers the same way.

**`:has` reads the card's own totals rather than a flag somebody sets**, so there is no second place
for "is this priced" to be wrong — the fault this stylesheet pays for every time a width is stated
twice. It undoes itself the moment anything is priced, **proved by putting a figure into one
`.bk-t` by hand**: the five tracks come back, the dash returns to 193, and the total's right edge is
the grid's right edge. Nothing moves vertically, which is what `SPINE`'s own objection to a
changing shape is about.

**The harness cannot price a booking and that is worth knowing.** `check/fixture.json` has no
`pricing` key, so `bookPrice()` returns null and the form's money columns are empty on every run
this file has ever made — the same blind spot as the booking receipt and the message thread, one
column along. It is why the priced state above was proved through the DOM rather than through the
app.

**And the basket is excluded by name.** `is-wide` is already two columns — a title and a price — so
hiding its total would take the price off a basket of free things.

#### THIS WAS REVERTED, AND THE THREE SECTIONS ABOVE WENT ON DESCRIBING IT FOR WEEKS

**The figure columns are NOT hidden on an unpriced card.** They were put back on *"what happened to
all the columns I had before for things like multiplier"* — the revert is written up in `style.css`
beside `.bk-row.is-blank`, and **nothing came back here to say so**. So every number in the table
above is wrong about the live card: the value's right edge is 189 of 351 at 390px, not 351, and an
unpriced form carries 145px of empty track on eighteen rows.

**Found by measuring the card while answering a complaint about the week grid**, which is the only
reason it is not still there. That is this file's own recurring fault pointed at itself — the same
shape as `.favwrap.is-fav`, as `resource_type` in `VOCAB` and as the dead `kind === 'paper'` guard:
a confident paragraph that outlived the code under it. **The entry stays** rather than being
deleted, because the arithmetic in it is what the next person needs — and this heading is what
stops them acting on it.

## Stabilising it: the lab measured one axis, and the app is navigated on the other

**Asked for as "ok stabelise website. make it more scalable and make it more stable and so on. like
make navigation and all more stable. generally everything."** Too broad to guess at, so the first
move was to measure the navigation rather than read it: every screen's `paged` class against its
`PAGER` entry, its page count against the sections actually in the document, and every pane against
its own contents.

### Messages was the sixth column to lose its vertical axis, and this one was still live

**`screen('dm')` used `stack()` — one page holding every conversation — and `PAGER` had never heard
of the screen.** That is the same pair of facts the note over `PAGER.tools` records for the two
columns it already cost: no `paged` class, no vertical axis, and a `.pane` that is `overflow: hidden`
holding the lot.

**Measured at 390×844 with six conversations: 1,298px of content inside an 805px pane — 493px of
somebody's messages on the page, with no scroll and no page to turn to.** Two conversations short,
silently, on a phone. Screenshotted before and after.

| | lost it to | |
|---|---|---|
| `me`, `posts` | a rename the table did not follow | already recorded |
| `booking`, `reel` | no key at all | already recorded |
| `tools`, `games` | `stack()` | already recorded |
| **`dm`** | **`stack()` and no key** | **this one** |

**One conversation per page now**, which is what every other column is — and a conversation is
already a card with its own scroller and its own composer, which is exactly what a page holds.
`PAGE_HOME.dm` opens past the head card onto the newest thread, the same skip `account` makes past
its name card.

**`dmPages_` returns `{ name, html }` and both readers map the same array.** Deriving the header's
names from a second walk of `messageThreads_` would be the fault every entry in that table states —
*"a pager that counts for itself is a pager that can disagree with the screen it is a pager for"* —
which this column has now been on the wrong side of once.

**And the ask moved out of the builder, which is what makes the pager safe to call.** `dmCards_`
started a network request as a side effect of being called, so a pager calling it would have
triggered the fetch from a header and flashed "Nothing yet." before the reply landed. `dmAsk_` holds
that; `dmPages_` only reports. `DM_DONE` is the flag the skeleton actually depends on, because
`MESSAGES` staying null means both *waiting* and *asked and refused* and the second is a column that
never finishes loading.

**`PAGE` was missing `booking` and `dm`**, against its own sentence — *every screen that pages needs
an entry here or its position is not remembered between visits*. Both page. Both have one now.

### The lab had never asked about the axis the app is navigated on

**`check/ui.js` has measured sideways scroll since it was written and nothing else about geometry.**
That is the right first question — a box that scrolls sideways when it was not told it could is
always a fault — and it is the axis nobody travels. Every screen here is a vertical strip of pages.
**Six columns have now lost that axis one way or another, and the reason it kept recurring is that
nothing could see it.**

`OUT OF REACH` asks one question of every `.pane` on the screen: is there content below its own fold
that can neither be scrolled to nor paged to. **Every pane, not just the one in front** — a
sixteen-page column has sixteen panes in the document and each is a page somebody can turn to, which
is `check/cards.js`'s own lesson about a sample and a sweep on a second surface. A pane told it may
scroll is exempt, and so is a widget's own scroller inside one, because `.msg-body` and the notepad
have their own `clientHeight` and never push the pane's.

**And the same second question in pixels a viewer can see.** A transform is invisible to
`scrollHeight` exactly as it is to `scrollWidth`, so the lowest RENDERED child edge settles it —
without that the cheat sheet and the flyer would report hundreds of pixels that are on no screen,
which is the reading that cost this project two wrong fixes.

### The rule reported nothing, and putting the fault back did not fire it either

**Which is the whole reason there is a new state.** `dm · a conversation` seeds ONE thread —
deliberately, for what it measures — and one thread fits on a pane, so for as long as it was the
only seeded state this column could not have shown the fault it had. I wrote the rule, it found
nothing, I put the `stack()` back, and it still found nothing.

**A check that cannot fail is not a check**, and this file has deleted one for exactly that. What
was missing was never the rule; it was the state. `dm · an inbox` is six conversations — **six
because five fits**, measured at the tallest of the four widths, so it is the smallest inbox that
answers the question at every width rather than at 320 alone.

**Proved in both directions**: with the `stack()` back it names the column and the pixels — *".pane
holding card hides 941px below its own fold, at dm · an inbox@320 signed in"* — and exits 1; the
real file is green across 120 combinations.

### "A pane cannot overflow now" was an assertion, and it is what let this survive

**Two notes in `style.css` described a mechanism that had been deleted.** `.pane`'s own
`touch-action` comment said `pan-y` is *"given back only to a pane that has genuinely overflowed —
see `.pane.scrolls`, which script.js adds after measuring"*, and three thousand lines down the note
recording that class's removal says **"a pane cannot overflow now, so there is nothing to give
back."**

**That second sentence is measurably false** — it is the 493px above — and it is the reason nothing
was watching: a pane that cannot overflow needs nothing measuring it. An assertion about every
screen in the app, made from one screen. Both notes now say what is true and point at the check that
enforces it, which is the difference between a rule and a sentence.

**Measured after**: `dm` 7 pages and 7 sections with 0px hidden, 32 checks pass, and `check/ui.js`
reports nothing new across 120 combinations.

### Adding a column means editing five places, and nothing compared them

**`check-doors.js` asks whether a table key names a real screen. It could not ask the reverse** —
and the reverse is where every one of these faults has actually come from: `booking` and `reel` used
`pages()` with no `PAGER` entry, `tools` and `games` used `stack()`, `dm` did both.

**Five things have to agree about what a screen is** — `TABS`, `TAB_ORDER`, `PAGER`, `screen()`, and
a `<section id="s-…">` in index.html — and **every disagreement fails silently.** `paint` does
`$('s-' + id)?.classList`; `AXES.x.cells` does `.filter(Boolean)`, so a tab with no section drops
out of the sideways axis and the column is skipped; `PAGER[id]` undefined is just false; and
`TABS.sort` on `TAB_ORDER.indexOf` puts an unknown id at **−1, which is the front**. `TABS`'s own
note records the one that shipped: *"a column that swipes to a blank is worse than a column that is
not there."*

**Four questions now, and one realistic mutant fires three of them**: renaming `games` to `arcade`
in `TABS` alone is reported as a tab with no section, a tab nothing draws, and `TABS`/`TAB_ORDER`
naming different screens. The real file is clean.

**The fourth found something on its first run.** `screen('make')` builds with `pages()` and had no
`PAGER` entry. Nothing is wrong on screen — the camera column holds one card either way — **and that
is the reason to fix it rather than exempt it**: it is correct by accident of its contents, and the
day it holds a second card that card is unreachable, which is precisely how the other three lost
theirs. `makeCards_` is that one list; `PAGE` gained `make` by the same table's own rule.

**`stack()` needs no entry and is deliberately not asked about**, because it is one page by
construction. Whether a stack holds more than fits is a question about pixels, and `check/ui.js`
asks it as OUT OF REACH.

### The file list had drifted again, to three files this time

**`check-doors.js` kept its own `ORDER` array of the files to read, and the note above it records
the first drift**: *"`select`, `collections` AND `tiles` WERE MISSING … `tiles.js` is where every
card action in the app is built, which made all of them invisible to this audit."*

**It had happened again.** index.html loads **26** files; `ORDER` listed **23**. `library.js`,
`settings.js` and `terms.js` were outside the audit — every `on()`, every `data-do` and every `go()`
in them — and `terms.js` alone has two handlers and both their doors. So the summary line has been
understating what it looked at, and any door added in those files was unwatched.

**The fix is the one `check.js` already makes**: read the list off `window.FILES` in index.html,
which is the list the browser itself uses, in load order. A list kept by hand beside another list
kept by hand is this repository's oldest shape, and the answer every time has been to delete one of
them. **Measured after: 119 handlers and 117 doors, against 23 files' worth before.**

### What the navigation stress found, which is the other half of trusting it

Measured before changing anything and again after: every tab switched to twenty times with no
settling, every screen paged past both ends, the viewport resized across all four widths on every
screen, and thirty `go`/`repaint`/`paint` storms.

| | |
|---|---|
| JS errors | **none** |
| page position clamped at both ends, all nine screens | **correct everywhere** |
| screens reporting "this screen did not draw" | **0** |
| nodes in the document | 1,507 → 1,684 → **1,526** — no accumulation |
| all nine screens still placed and the app usable | **yes** |

**The core is sound and that is worth writing down rather than quietly not mentioning.** What was
broken was never the movement; it was which screens had been told they could move.

### What happens when things fail, measured across seven ways of failing

**Every claim this file makes about resilience was checked rather than trusted**, by breaking each
request in turn and asking the rendered page four questions: did the screens draw, did the splash
lift, is there a banner saying why, and can you still navigate.

| what was broken | screens drawn | splash | says why | navigates |
|---|---|---|---|---|
| nothing | 9/9 | lifted | — | yes |
| the backend answers 500 | 9/9 | lifted | yes, + Try again | yes |
| the backend answers a web page | 9/9 | lifted | yes, + Try again | yes |
| `data/questions.json` 404s | 9/9 | lifted | *"the question file answered 404"* | yes |
| every `data/settings/*.json` 404s | 9/9 | lifted | — (correctly: the payload still has them) | yes |
| the backend AND the library fail | 9/9 | lifted | yes, + Try again | yes |
| **the backend never answers** | 8/9 | **lifted at 60s** | yes, + Try again | yes |

**No JS errors in any of the seven, no screen failed to draw, and the app was navigable in every
one.** That last row is the deadline in `load()` doing exactly what its note says, confirmed rather
than assumed — and it is the one that needed the stopwatch, because a first pass that waited four
seconds reported it as a permanent hang and would have been a fix aimed at nothing.

### A minute of splash with nothing said, which was the one honest gap

**The deadline is sixty seconds and it should be.** Its note explains why it is not less: this
backend answers in about fifteen, and a deadline shorter than the thing it times reports a healthy
backend as a dead one — *"that happened, at twelve seconds, and cost an afternoon."*

**So the floor on "how long can this legitimately take" is a minute, and for all of it the animation
played over an app that was getting no answer.** Nothing on screen could tell *still trying* from
*stuck*. Every other failure here ends with a sentence and a Try again; this one was silence.

**Fifteen seconds, from the same measured number the deadline is built on** — past the backend's own
normal time, so an ordinary load never sees it and a slow one says so. One figure, derived from the
one already written down rather than guessed at separately, which is the fault this file records
every time a number is stated twice.

**It is in the markup rather than built**, for the reason the two splashes are: the boot path is
where this app once took itself down, and anything there that has to be constructed is one more
thing that can be missing. **It is cleared wherever the splash is**, because the two are one state —
a line about loading over a loaded app is worse than the silence it replaces — and it only starts
its clock when the splash is actually up, because `load()` runs again on every retry and every
sign-in.

**Proved in both directions**: a normal load never shows it (the splash is gone by 3s), a stalled
one shows it at 17s and not at 14s. Screenshotted.

## Every practical has a guide now, and the card it was going on was already cut in half

**Asked for as "i also want to add volcanoe practicle to database. aslo each practicle needs to have
a guide with it. like a risk assessment, something which asks for iv dv and control variable. and
whatever else you think is needed for guide. so like it will be in same row as practiclale in
database."**

**`risks` is the one new column, and it is a pipe list like every other list on this tab.** One
hazard and what you do about it per item — *"vinegar in the eyes stings badly and this one erupts
upwards — goggles on both of you before the first pour, not after the first surprise"*. 52 live
practicals, **171 hazards, 3.3 each**; the five refused experiments correctly carry none, for the
reason `check-practicals.js` already gives about their methods: writing out a procedure for
something nobody will run is inventing content to satisfy a checker.

**A pipe, not a comma, and the practicals already paid for that lesson** — 14 of the 410 equipment
cells carry a comma inside one item, and no comma rule can tell *"Bunsen burner, tripod, gauze,
heatproof mat"* (four things) from *"Nichrome wire (about 1 m, taped to a metre rule)"* (one).

**The volcano is `PR-HM11`**, 40 minutes, home, 6+, 40p a run and £7.50 of kit bought once — and
the row's own `aim` says what makes it a practical rather than a party trick: *"build a volcano,
then stop treating it as a trick and find the mixture that gives the biggest eruption."* It joins
`Chemical Changes`, `Rate of Reaction`, `Writing & Simplifying Ratio` and `Units & Measures`, all
four spellings the tree already answers to.

### THE CARD WAS ALREADY 891px INSIDE A 534px PANE, AND THAT IS WHAT DECIDED WHERE THE GUIDE GOES

**Measured before a word of it was written, which is the only reason the design is what it is.**
`.pane` is `overflow: hidden` with `max-height: calc(100dvh − …)` — **534px on a 320×568 phone,
807px on a 390×844 one** — and each card is one page of a column. At 320×568:

| | before | after |
|---|---|---|
| practical cards past the pane | **51 of 56** | **0 of 57** |
| median card | **891px** | **274px** |
| the worst | **1693px** | 386px |

**More than half the set had its kit, its method, its safety line and its notes below the fold, with
no scroll and no page to turn to.** On every commit, for as long as that card had existed. A guide
appended to the bottom of such a card would have been a guide nobody could reach — so the guide is
not on the card.

**NOTHING ANYWHERE COULD SEE IT, and the reason is the sentence this file already writes twice.**
`check/ui.js` renders whichever five cards the funnel happens to stop on; `check/cards.js` lays out
every row in the library and **asks about WIDTH only**. Both were green. The axis nobody travels was
measured on every commit and the axis everybody travels was measured by nothing — which is exactly
what `OUT OF REACH` was added to `check/ui.js` for one commit earlier, on the screens, and this is
the same fault one layer down, on the cards.

**So the card is the SEARCH RESULT and the guide is the DOCUMENT.** That split is what the funnel
already does everywhere else. The card keeps what you choose BETWEEN practicals on — the flag, the
strip, the aim, the outcome, the hazard word, and `wow`'s *"worth opening a session with"*, whose
own note says it answers exactly the question of which one to start a session with. The kit, the
method, the safety line and the notes are what you read AFTER deciding, and they moved.

**A tile, because a practical is a thing.** The house style settles it — a THING has tiles, a FORM
has buttons, tiles win any tie — one renderer, one 44px target, and `check-doors.js` pairs the `act`
against its handler. **`icon: 'paper'` is not in `TILE_ICONS`**, and `tileIcon_` falls back to the
word for a name it has never heard of: *"visibly wrong, rather than invisible"*, which is what the
first screenshot showed — a square reading `Guide` in a column of glyphs. `doc`, because a guide is
a document.

### `#sheet-body` scrolls, which is this app's own answer for anything longer than a card

The note by `.pane` says it outright: *"anything genuinely long should be PAGED"*, or it belongs
somewhere that scrolls. The guide is 3,451px on the volcano. `<details>` was not an option —
`js/find.js` records it being removed at the owner's decision.

**Eight boxes, and the slots are the ask**: what else can you see in THIS room · independent
variable · dependent variable · control variables · prediction · results · conclusion · evaluation.
Each is `ansKey_(x) + '#' + slot`, so `whoIs_` still decides whose answers these are and the
"working as" switch still moves all eight together — which it would not if this invented its own
key-builder. **Proved on the wire**: typing into the IV box writes `ans:pr:PR-HM11#iv` to
localStorage, and it comes back after closing and reopening the sheet and after a full page reload.

**THE RISK ASSESSMENT IS NOT FINISHED WHEN IT ARRIVES, and that is the whole shape of it.** What is
in the row is what is true of the EXPERIMENT. What nothing in a database can know is the ROOM:
whether there is a rug under the table, whether a toddler is in the house, whether the only socket
is beside the sink. A risk assessment that reads as complete is one nobody looks up from — so the
written hazards are the START of the list and the last line of that section is a box.

**And the public-liability line is drawn from `venue === 'home'`**, not written into ten rows. The
AQA insert argument, which this file already makes twice: one fact several rows hang from belongs to
whatever draws them, or it is ten cells to keep in step the day the wording changes.

### It is the card's own classes, because they are the card's own blocks

**`.prac-kit`, `.prac-steps`, `.prac-why`, `.prac-tab`, `.prac-safety`, `.prac-home`, `.prac-maths`,
`.prac-note`, `.prac-aim` and `.prac-out` are drawn by the guide now and by nothing else.** Giving
them `.gd-` names would have been a second description of one object — the `.reel .over` fault,
where a subject, a heading, a paragraph and a credit over a picture were written twice in this
stylesheet and drifted. `.prac-tab`'s own note describes "what I changed" beside "what I measured",
which is precisely the pair this guide asks somebody to name.

**The answer box is `ansBox_`'s box**: `.qp-ans` and `.qp-ans-in`, already the ruled-paper field a
student writes into, already keyed off `data-do="qp-ans"`, already saved by the same delegated
listener. Four rules are genuinely new — the wrapper, the question, the hint under it, and the
box's own floor — and `.gd-sec` joins the existing selector groups rather than restating them.

**Spellcheck stays on**, where `ansBox_` turns it off. That one holds `3.42 × 10⁷`; these hold prose
about what somebody thinks will happen.

### A screenshot caught two, and one of them was the specificity trap again

**The guide's maths line and its tutor notes drew at the browser's default 16px** — a third larger
than every other paragraph on the card, because they were bare `<p>`s and nothing styled them.
Valid markup, no overflow, nothing any check could measure. **Ninth time this file records that a
screenshot is the last word on something drawn.**

**And the obvious fix would have eaten the safety line.** `.gd-sec p` is a class plus a type,
specificity (0,1,1), against `.prac-safety`'s and `.prac-home`'s (0,1,0) — both of which are `<p>`
inside a `.gd-sec` — so it would have won every declaration they make and flattened the gold-ruled
warning into ordinary body text. Caught before it was written, by reading what was already in the
block. **Sixth conviction of `.price.faint`** in this stylesheet, after `--fly-ink`,
`.bk-row.is-blank` losing to `.bk-row.is-bare`, `.rc-total` losing to `.bk-row`, and
`text-anchor="end"` losing to `.qsheet .num`.

### `check/cards.js` gained the other axis, and `check/ui.js` can see a sheet at all

**The height rule is a FAILURE rather than a count, and it can be, because the number is zero.**
Everywhere else in these files a blank is a backlog printed as a number; here there is no backlog to
swamp it, so the first card that goes back past the fold says so instead of joining a red nobody
reads. **Proved by mutation**: putting the guide back on the card names 50 rows, the worst 2,656px
past the pane, and exits 1.

**Only the practicals, and that line is principled rather than lazy.** That pass boots the real app
and calls `practicalCard_`, so it measures the height the app actually draws; the question pass
rebuilds a question's markup with `cardHtml`, which has no tiles, no mark scheme and no answer box.
A height measured off that is the height of a card nobody sees, which is the fault this very file
was once caught committing. Sampled through the app's own `questionCard_` instead: **4 of 600 past
the cap, median 250px** — real, small, and not something that instrument can honestly claim to have
swept.

**And `#sheet` is a sibling of the screens, not a child of one.** So every surface this app opens in
a sheet — the details form, the pay sheet, the composer, a tutor's profile, and now the guide — has
been outside `check/ui.js` for as long as that file has existed. Nothing was wrong with `#s-<id>`:
it IS the screen, and a sheet is not on it. **A declared state that opened one would have reported a
clean sweep of the screen underneath**, which is the `check-booking.js` fault in another
costume. The sheet joins the measured roots when it is open, 19 states and 128 combinations now, and
**`leave` puts it back** — states run in order down one page and `go()` does not close a sheet, so an
open guide would otherwise have been counted as part of Tools and Games.

**Proved by mutation**: `white-space: nowrap` on `.gd-ask` names `stuff · a practical guide` at all
four widths and both visitors; the real files report nothing new across 128 combinations.

### The guide is what somebody is looking for, and the search box could not see a word of it

**Said as "all of the guides are resources i guess which can be found in finder".** Measured before
anything was changed: **0 of the 57 practicals carried a `text` at all.** `stuffFind`'s haystack is
`name + sub + subject + slot + grade + text`, and `text` is the only one of those that holds a
thing's own WORDS — every other entry is a label. So a practical was findable by its title and by
nothing else.

| typing | before | after |
|---|---|---|
| `goggles` | **0** | **13** |
| `stopwatch`, `ruler` | **0** | 18 each |
| `tray` | **0** | 11 |
| `nichrome`, `foil`, `magnesium ribbon` | **0** | 2 each |
| `limiting reactant`, `perimeter` | **0** | 1 each |
| `bicarbonate` | 1 | 4 |

**The handful that did hit were hitting the NAME, which is a coincidence rather than a search** —
the volcano happens to be called *"Volcano — bicarbonate and vinegar"*, and `trundle` and
`chromatography` are titles too. Every word in the first five rows of that table is sitting in the
row somebody was looking for.

**This is the `topics` fix and the `company` fix one data file along**, and the sentence is the same
all three times: the words are in the row, the search box cannot see them, and a screen whose whole
job is finding things returns nothing for the thing it holds. There it was one column; here it is
the whole guide — the kit, the method, the hazards, the variables and the science. **Built onto the
item, not matched per keystroke**, which is what those two notes also say. 1,558 characters a
practical, and a search still measures 1 ms over 4,963 items.

**A refused experiment is searchable too, deliberately.** Those five rows exist so a tutor asking
why they are not burning magnesium ribbon finds the answer instead of an absence — and a reason
nothing can search for is an absence with a row behind it. `magnesium ribbon` returns both.

**`plainText_` came out of `searchText_`** rather than being written twice: a `&frasl;` or a `<b>`
is the same thing to a person typing into the search box whichever column it came from, and two
copies of that entity list is two chances to handle one of them in one haystack and not the other.

**One thing is deliberately NOT searchable**: the public-liability sentence. It is drawn from
`venue === 'home'` and is in no row, so `public liability` returns nothing while `home` returns all
of them. The fact is the venue; the sentence is the rendering.

#### `check-funnel.js` prints what the search box can see, per kind — and could not see it

**The instrument that would have caught this is a count**, so it is one now: items per kind whose
own words are in the haystack. **Printed rather than failed**, and that is the `figure` argument
rather than laziness — a boxer's card is a record with no prose on it, and demanding a haystack of
one would mean inventing words to satisfy a checker. What the number is for is the other direction:
a kind that HAS words and stops shipping them.

**Its first run reported `question`, `venue` and `tutor` and did not mention the practicals at
all.** The harness's `fetch` stub answers `questions.json` with the real library and **everything
else with the fixture**, so `data/practicals.json` came back as a payload object rather than an
array and the mapper built nothing. So the check was blind to the one kind it was written for — *a
check that cannot fail is not a check*, and this one could not have. Found by reading its own output
rather than by trusting that it ran, which is the same move as the probe that reported clean on the
`and`/`&` spellings.

**Proved by mutation** with the line put back: `practical 0 of 57 — findable by its name and nothing
else`.

#### And `Resources` in the funnel now means boxing

**Worth knowing before anybody files anything under that word.** Measured under `What for ·
Learning`: **Questions 4,906 · Resources 260 · Practicals 57** — and those 260 are the boxers and
the fights. `KINDS` gives `boxer` and `fight` the label `Resources`, and the note above it says why:
*"like a topic and a past paper, because that is what the second question is asking"*. **Both of
those are gone** — `topic` was deleted when the funnel started listing questions, and `question`
was given its own label — so the word is now doing no work it was chosen for and names one subject.

**Not renamed here**, because the `kinds` tab owns a label with no deploy and which word goes on a
button is a judgement rather than a repair. Written down so it is a decision rather than a leftover
— the shape this file already records under `resource_type` in `VOCAB` and the dead
`kind === 'paper'` guard.

## A films database nobody may see, and the repository is the one place it cannot go

**Asked for as "i want to add a database for films but i dont want people to be able to see them.
i want to add everything from drive… films, tv shows and so on. adult and kids and docs ect."**

**THE FIRST QUESTION IN THIS FILE'S OWN THREE-QUESTION TEST ANSWERS IT BEFORE THE OTHERS GET A
TURN.** *"Is it secret? → a sheet, never here. This repository is PUBLIC; anything committed is
published, and git history is permanent."* A list the owner has said they do not want people to see
is secret by that description, so `data/films.json` was never available — not as a preference, as
the rule this file opens with.

**And the Drive folder is already `anyone: reader`.** Measured before anything was written:
`{"role":"reader","type":"anyone"}` on `1SIFvXCYBghJMiGc…`, inherited by every film, every series
and every episode under it. **So the file ids ARE the protection** — publishing them in a public
repository turns "anyone with the link" into "anyone", permanently, for about twenty-five films and
several hundred episodes of commercial television. Reported to the owner, who chose to leave the
sharing as it is; nothing here depends on it either way.

### A private sheet is still not hidden, and that is the part that is easy to get wrong

**`doGet` SERVES `ANYONE_ANONYMOUS`.** A tab the backend forwards lands in the JSON of every
visitor who opens the site, whether or not a single screen draws it — so hiding films on the phone
is a filter anybody reads past with the network tab open. This is the shape the app already pays
for elsewhere in reverse: `MESSAGING` is not repeated on the phone because a rule written twice is
two rules to keep in step.

**So the gate is the READ, not a filter after it.** `filmsOut` is built inside
`if (viewerIsAdmin)` and is `[]` for everybody else, so there is one place that decides and it is
the place that opens the tab — a later line that forgets to check has nothing to forward, and a
non-admin never pays for the scan. **Measured in a browser on the two payloads `doGet` actually
sends**: an admin gets 3 films and `Films` as an answer under `What for · Learning`; everybody else
gets **no films, no funnel answer and no card** — absent by construction rather than filtered, which
is the move this file already records for the reel booking.

**`drive_id` is deliberately not sent.** `drive_url` is built from it in the sheet and is the only
form anything opens, so shipping both would be one fact twice — the `handle`/`username` shape this
file has paid for three times.

### One row per film or series, and 62 episodes is not 62 rows

**An episode is not a thing anybody searches for.** You choose the show and then the episode, and
Drive's own folder view already does the second half — so a five-season show is one row with a
folder link, and `file_kind` is the column that says which of the two addresses to build. Same
judgement the funnel already makes about tools: the thing you choose is the thing that gets a row.

**22 rows: 17 films, 4 series, 1 documentary; 20 adults, 2 kids.** `audience` is **which folder a
thing came out of and not a rating** — nothing in this app decides who may watch what from it,
because the whole tab is admin-only before it leaves the server. And it is its own field rather than
`subject`, which is the `boxKind` mistake this file records: a weight division written into
`subject` put Heavyweight on the Subject question beside Maths.

**What is filled in and what is blank is the rule this file states three times.** A year only where
the filename says it; a director or a lead only where the title is unambiguous. `Michael` and
`Obsession` each name more than one film and the file does not settle which, so both carry a note
saying so and nothing else — **16 of 22 have a year, 12 a director, 12 a lead**. A wrong director on
a card is a fact nobody re-checks.

**`There Will Be Blood` was asked for by name and is NOT in the Drive.** The folder holds an entry
with that title and it is a **1 KB Google Doc**, not the film. So the row is there, marked
`placeholder`, drawing *"Not in the drive yet"* where the link would be — the library's own column
one table along, and the same argument: a card that states the gap beats a link that opens nothing.
`The Case for Christ`, also asked for, was **already there** as a real 1 GB file.

**The catalogue itself is a private Google Sheet in the owner's Drive**, owner-only, for importing
into `Ledger` — which is the path every bulk import in this project has taken. Nothing real is in
the repository: `check/fixture.json`'s three film rows are invented, hold `example.org` addresses,
and exist for the three SHAPES the card can take (a very long title against the flag, a series with
no year, a placeholder with no link).

**It opens Drive and does not embed.** `clipSrcs_` spends forty lines on a ladder of three
addresses and an iframe fallback, and that was worth building for a two-clip column this app owns —
a three-gigabyte `.mkv` is not: no browser plays Matroska, and Drive's own player already does it.
The tile is a door. `tile_` answers an absolute `http(s)` address with an `<a target="_blank">`,
which is the one exception the house style leaves open and the reason that test sits where
`check-surfaces` can see it.

### `check-rows.js` depended on which quote somebody typed

**The first run of the new tab reported fourteen findings saying `the films tab has no title
column`** — about a tab whose `SCHEMA` entry names it. `SCHEMA` is sliced out of the source by
regex and the column matcher was `/"([^"]+)"/g`: **double quotes only.** Every existing entry
happened to be written that way, so the rule held by luck, and the first tab added with single
quotes came back with **zero columns**.

**The failure is loud and in the wrong direction**, which is what makes it worth the entry: not a
silence but fourteen confident wrong answers, in the one report whose own note says 95 findings
with 2 real ones in them is worse than no check at all. A check with a trapdoor under it that
nothing anywhere mentioned. Both quote styles now, and the entry matches the file's own style
anyway. **Proved by mutation**: the old regex against a single-quoted entry exits 1.

### And the lab is looking at it

**`only:` for the second time in `check/ui.js`, and for a stronger reason than the flyer widget's.**
That one is a roster gate on the phone; this is the payload — a signed-out visitor has no rows, no
answer and nothing to measure, so asking them to reach it would report a fault about the check.
20 states, **132 combinations**, nothing new. Cards measure 159–195px against an 807px pane, no
sideways scroll, and the links come out `target="_blank"` on the real address.

## The hour grid did nothing when you pressed it, and the repaint was aimed at another screen

**Reported as "grid not working when click"**, with a screenshot of the Booking column. Reproduced
on the first try and the app's own press log named the cause in one line.

**`clicks()` EXISTS FOR EXACTLY THIS AND IT EARNED ITS KEEP.** Its note lists the four causes of
"nothing happens when I click" and says they look identical from outside: the scripts never loaded,
nothing carries a `data-do`, the name in the markup and the name in `on()` disagree, or **the
handler ran and did nothing**. Measured: `pressed: BUTTON.hr, nearestAction: book-slot,
handlerRegistered: true` — the fourth one. The press landed on the right element, the handler ran,
`BOOKING.slots` came back `["m10"]`, and `.hr.on` was still **0**.

**So the state was right and the redraw was aimed somewhere else.**

```js
function paintBook_() {
  if (typeof paintStuff === 'function' && $('s-stuff')) paintStuff(true);
}
```

**It repaints `s-stuff` and nothing else, and that was right for exactly as long as the form lived
only inside the funnel.** `bookingPages_` answers `What for · Booking` there — and it also builds
the Booking COLUMN, `screen('booking', …)`. Same markup, two hosts, and this knew about one.
**Measured: with the fixture the funnel draws no booker at all** (`pageCount('stuff')` is 1 and
`#bookr` is not on it), so `s-stuff` was not merely the wrong host, it was a **dead** one — which is
why the grid was completely inert rather than half-working. Confirmed by the sharpest fact
available: after `drawBooker()` the cell was **the same DOM node**, so nothing had been rebuilt.

**AND IT WAS NEVER ONLY THE GRID.** Every `drawBooker()` caller is on that path — the edit row, the
undo, every dropdown. **A `<select>` shows its own new value natively with no help from anybody**,
so the answers appeared to work while the grid and the running cost did not: the half that needed no
repaint was the half that looked fine, which is why this read as "the grid is broken" rather than
"the form does not redraw". The screenshot shows it exactly — Kind, Subject and Level all answered,
`COST —` blank, and the week empty.

**Asked of the DOM rather than remembered.** `#bookr` is the form's own wrapper and `.screen` is
whatever section it is in, so "where is this drawn" is answered by where it IS. Same move as
`msg-send` walking up to its nearest `.msg-form` and `me-save` to its own container — both written
after an id handed the wrong element to the right handler. A flag naming the host would be a third
thing to keep in step with the two that already exist.

**The funnel keeps `paintStuff(true)`**, which is not the same call: a plain `paint` would throw
away the strip of result pages and which one you are on. So the old path is preserved exactly where
it applies and nothing regresses.

**Measured after, on the column**: three presses give three lit cells, Monday 12 and 13 **joined
into one bar** — the adjacent-hours bridge doing its job for the first time on a press anybody made
— and the When row reads back *"Monday 12:00–14:00, Wednesday 15:00–16:00"*. 32 checks pass.

### Why no check caught it, which is the part worth keeping

**`check/ui.js` MEASURES WHETHER A CONTROL CAN BE READ AND HIT, NOT WHETHER PRESSING IT DOES
ANYTHING.** It reported the booking column clean at four widths on every run — correctly, by its own
question: the cells are 24×20 inside a 20px floor that `ACCEPTED_TAP` records with a reason, the
labels are there, nothing overflows. **A dead control measures perfectly.**

**And `check-flow.js` drives bookings through `BOOKING` and the send paths rather than through the
markup**, so it proves the state machine and never presses a cell. Both were right about what they
ask. What neither asks is the question the owner asked: *press this — did the screen change?*

## `node check/press.js` — press it, did anything happen

**The last line of this file asked exactly this and nothing answered it**: *"What neither asks is the
question the owner asked: press this — did the screen change?"* Written the night the hour grid was
found dead, and the instrument arrived the next morning.

**It presses every distinct `data-do` in the app, twice over** — once signed in as an admin and once
as a stranger — and asks four things of each press: did it throw, did the app survive, did anything
change, and is there anything carrying the action to press at all. **91 actions, 57 seconds, on the
roster.**

**BY ACTION, NOT BY ELEMENT**, because the handler is the thing that can be broken: pressing every
element would press `qp-ans` four thousand times. And by the DISPATCH rather than by hit-testing —
`dispatchEvent` straight at the element — because whether a box can be hit is `check/ui.js`'s
question and it already answers it properly.

### Three instruments were green and each was right about what it asks

| | |
|---|---|
| `check-doors.js` | a `data-do` with a handler, a handler with a door. **Both true. The wiring was perfect and the wire went nowhere** |
| `check/ui.js` | can this control be read and hit. **A dead control measures perfectly** |
| `check-flow.js` | drives bookings through `BOOKING` and the send paths, so it proves the state machine and never presses a cell |

**And `pageerror` never fires, which is why a thrown handler is invisible too.** `shell.js` wraps
every action in a try/catch on purpose — an error escaping it reaches the window, and a browser
serving from `file://` reports that as `Script error.` with no message, no file and no line. Caught,
it keeps its message. So this listens where the app actually speaks: `console.error('[' + action +
']', err)`, which is the line in that catch.

**What counts as something happening is deliberately wide** — the screen's markup, the sheet, which
screen you are on, which page of it, a toast, a request leaving the phone, anything written to
`localStorage`. One of those moving is enough. The alternative is a check that cries wolf, and this
file has deleted one of those already.

### The one it found: a control drawn in gold that had done nothing for months

**`book-edit` was the only value on the booking form styled as pressable** — `.bk-pick` gave it a
gold underline and a pointer, and gold in this app means *the one thing to press*. The When row.
The row a person presses when the cells underneath it do not work, which is exactly what the owner
had just been doing.

**`stepGrid_` says ALWAYS OPEN in its first line and gives the reason**: a panel that unfolds
changes the card's height under the thumb reaching for it. The moment that was true there was
nothing left for `book-edit` to open — `stepIsPanel_` returned `!!st.grid`, so **the one row marked
pressable was the one row whose panel is always drawn.** The handler set `BOOKING.editing`,
`drawBooker()` rebuilt the card byte for byte identically, and the field was **written in four
places and read in none**: this repository's oldest shape, already recorded here under `figure`,
`orderPrints`, the four message actions, `exam_date` and `wow`.

**Three sentences outlived the thing they described** — the note over the handler still said the
week grid "is drawn as a panel, so pressing that row is the only way to reach it", and the note over
`stepGrid_` still said `BOOKING.editing` held which row was showing its grid. Both were true and
stopped being true in a commit about something else. Same fault as `resource_type` in `VOCAB` and
the dead `kind === 'paper'` guard.

### The harness was wrong three times first, all in the flattering direction

Worth the space, because every one of them printed a fault in the app that was a fault in the check:

- **`innerHTML.length` is not the markup.** A repaint that swaps one class for another of the same
  length reads as nothing having happened — measured on `book-edit`: 18,804 characters before and
  18,804 after, with the grid's open state genuinely different underneath. It hashes now, and the
  hash is what proved the control really was dead rather than merely equal-length.
- **It pressed the option that was already chosen.** `mat-level`, `mat-exam` and `timer-set` came
  back quiet because the first element carrying each is the selected one, and tapping the button
  that is already lit correctly does nothing. It prefers an unchosen control now.
- **And where nothing marks the choice, one press is not an answer.** `fm-preset` is three buttons
  and the flyer maker opens ON the flyer preset, so pressing the first asks it to become what it is.
  Measured: that press changes nothing and `sticker` changes the zoom, two checkboxes and 3,543
  characters of drawing. **Quiet now means every control carrying the action is quiet** — up to
  four of them.

**And ten actions went unpressed on the first honest run**, every one the harness: answering the
funnel's first question takes every card off the Find screen, so `fav`, `spot`, `qp-ans` and
`filter-clear` were gone by the time their turn came; and the sheet is closed after each press, so
`post-save` and `msg-send` came up for their turn against a screen that had not held them for twenty
presses. A sheet's actions are pressed **now, while it is open**; an action missing after other
presses gets a page nobody has touched, re-entered into the state it belongs to, and only then is it
reported.

### `check/states.js` — one list, because a state declared for one instrument and not the other is a hole

**`check/ui.js` owned the twenty declared states and `check/press.js` needed every one of them.**
Pressing only the state a screen opens in left the practical guide, the films, the message thread,
the session receipt and the basket unpressed entirely — none of them is on a screen `go()` lands on.

**A second copy would have drifted in the worst direction**: a state added for the measuring pass
and not the pressing one is a surface nobody presses, which is the hole the booking grid lived in.
That is this file's sentence about `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` for
the fifth time. The extraction was proved neutral first — 132 combinations, nothing new — which is
the `libraryExtras_` rule: prove it identical, then make it.

### A quiet press FAILS, and every current one carries a written reason

**`ACCEPTED_TAP` prints and does not fail, because a 20px hour cell cannot be repaired by changing a
number.** A control that does nothing CAN be repaired, and one that silently stopped working is the
fault this file was written for — so the twelve that are correctly quiet are listed with one
sentence each (an empty box focused rather than posted, a caret placed in a text field, a camera the
container does not have) and anything else turns the run red.

**Proved in both directions.** Putting the old `paintBook_` back — the one that repainted a screen
the booking column is not on — names `book-slot` and `book-set` and exits 1; the real file exits 0.

**`npm run check` went from about 45 seconds to 1 minute 39.** That is the price and it is written
down rather than hidden: the session-start hook pays it on every session, and what it buys is the
one class of fault this project has shipped twice — a control that looks alive and is not.

### And the other thing a finger does, which nothing had ever measured

**Every screen in this app is reached by a SWIPE and no check had made one.** The tabs are a second
way in, so a broken gesture leaves the app looking fine on a desktop and is the whole navigation
gone on a phone — which is the shape `overworld.js` already records twice: the grid listened for
`touchstart` alone and did nothing at all with a mouse, and a `setPointerCapture` on every press
sent the release to the root so that no card, chip or tick ever answered. *"Nothing threw. The app
rendered perfectly and simply stopped answering."*

**`page.mouse` makes the real events, at the pace a hand makes them**, so the thresholds, the axis
lock and the velocity are all exercised — none of which a direct call to `go()` touches. Measured:
**18 sideways and 12 vertical, every one landing where it should**, and the ends are part of it — a
swipe left from the last column must stay on the last column rather than sliding into nothing.

### `check/ui.js` was not on the roster, and this file said twice that it was

**132 combinations of screen, state, width and visitor — sideways scroll, tap targets, contrast, JS
errors, content below a pane's own fold — and `npm run check` never ran it.** This file says in two
places that it "has run on every commit for weeks". It has run when somebody typed `npm run
check:ui`. **That is the `check-booking.js` fault about the instrument rather than the app, and this
file's own sentence is the answer: the roster is the only thing that makes a check real.**

**What kept it off was the clock, and the clock was the wrong reason.** Measured: `check/press.js`
spends 77 seconds of wall time and **4.5 seconds of processor** — the rest is waiting for a page to
settle, which is exactly what four processes can do at once on a four-core machine. So the four
browser-driven checks start together at the top of the run and are printed in roster order in their
place when the fast ones have finished. **Sequentially those four are about three minutes; together
they cost the slowest of them, and the whole suite is 1 minute 25 with `ui.js` included** — shorter
than it was without it.

**Two of them wanted the same port.** `check/ui.js` and `check/deploy.js` both defaulted to 8731,
which cost nothing for as long as they ran one after another and would have been one of them dying
on `EADDRINUSE` with a stack trace where a report should be. The kind of fault that only exists once
something else changes, which is the argument for changing it in the same commit.

### A control with no name is not an imperfect control, it is an invisible one

**The camera's shutter already made this argument out loud** — *"a shutter with the word Photo
written across it is not a shutter, and a control with no name at all is one a screen reader cannot
offer"* — and got an `aria-label`. **Nothing checked the rest of the app.**

**Measured: ten controls have no text, no label and no `aria-label`, and every one of them carries a
PLACEHOLDER** — the comment box, the six message boxes, the funnel's search, the to-do line and the
notepad. A placeholder IS the accessible name when there is nothing else, so all ten are named and
**none of them needed changing**. Adding an `aria-label` repeating the placeholder would be two
strings to keep in step, which is the fault this file records under `MESSAGING`, under `kinds` and
under `childrenOf`.

**So the rule is the floor rather than the preference**, it runs inside the walk `check/ui.js` was
already making so it costs nothing, and the number it guards today is zero. Proved by mutation:
taking the placeholder off the search box names `<input>.search` at 36 combinations and exits 1.

### What the app does when its own ground gives way, measured rather than assumed

**Two whole classes of visitor nothing had ever stood in for**, and both came back clean:

| | |
|---|---|
| **`localStorage` throws on every write** — a phone with storage blocked or a quota of nought | nine screens drew, the splash lifted, no JS errors, every column still reachable |
| **`localStorage` throws on every READ as well** — the `SecurityError` a locked-down browser gives | identical |
| **every data file corrupted, four ways each** — truncated JSON, an HTML error page, an object where a list belongs, an empty body, across all 15 files the app fetches | **60 combinations: nine screens drew every time, the splash lifted every time, no errors** |

**That is the house rule holding**: *an empty or broken sheet must still produce a working site.*
Every one of those reads is a `try`/`catch` around a `fetch` whose result is put through
`Array.isArray(rows) ? rows : []` — written one at a time, over months, by somebody following the
rule rather than checking it. **It is written down here rather than turned into a check**, because
sixty boots is four minutes and what it proves is a property of code that already exists; the guard
that matters is the rule in the house style, which a reader applies.

## `node check/cascade.js` — which rule wins, and whether anybody meant it to

**This stylesheet has lost the same argument seven times.** Every one is recorded above and every
one was found by a person reading two blocks side by side or looking at a screenshot:

| | |
|---|---|
| `.price.faint` | a blank price was meant to recede. `.faint` and `.price` are both one class and `.price` is written later |
| `--fly-ink` | set from a template string, read by a rule that never won |
| `.bk-row.is-blank` → `.is-bare` | the `max-content` repair went on the rule three thousand lines down and the rows went back to 481px **under a fix that read as though it had worked** |
| `.rc-total` → `.bk-row` | the total row declared its own three-track grid and has been drawn on the five-track one since it was written |
| `text-anchor="end"` → `.qsheet .num` | CSS beats an SVG presentation attribute, so ten y-axis numbers sat centred on the line |
| `.gd-sec p` → `.prac-safety` | caught before it was written, by reading the block first |
| **`.dock-new .btn` → `.btn.tiny`** | **found by this file.** The docket's `＋` is written at 1.1rem and has always rendered at **0.80rem — 11.86px inside a 44px box.** A glyph is not a word and needs the size |

**Seven repairs and no rule**, which is this file's own sentence about `cost: 0`, about `paper:
true`, about the spelling fold and about `delRow`. A fault repaired in the instance and not in the
rule comes back.

### It had to be narrowed twice, and the first version was the noise generator

**The honest general form — two rules set the same property on one element and the later wins —
reported 1,001 findings**, and nearly all of them are the cascade doing its job: a base and its
variant, a longhand under a shorthand, `.hr` against `[data-do]` for a cursor. **That is
`check-rows.js`'s 95-findings-with-2-real-ones**, and a report that is mostly noise is a report
nobody reads.

**So it asks the narrow question the seven faults share**: two DIFFERENT rules, the same property,
the same specificity so nothing but ORDER decides, a shared class so they are about the same kind of
thing, neither's class set containing the other's, and **a real element in the rendered app matching
both**. 1,001 became five, and three of those were one `border-bottom` counted per longhand.

**And it reads the rendered stylesheet rather than the file.** The browser has already parsed the
selectors, expanded every shorthand into longhands and put the rules in order; getting any one of
those wrong by hand is the whole fault this check is about.

### Two of its own findings were about the check, which is the part worth keeping

- **`:has()`, `:is()` and `:not()` are not pseudo-classes.** Each takes the specificity of its own
  argument and `:where()` takes none. Counted as an ordinary `:pseudo`, `.pane:has(.rc)` scores
  three where it really scores two — so it tied with `.screen.on .pane` and this file confidently
  reported a contest that specificity had already settled.
- **A contest a third rule has already decided is not a contest.** `.tile.on` and `.tile.is-admin`
  both set a background, and `.tile.is-admin.on` — three classes — sets it for exactly the element
  that matches both. The giveaway was that `color` beside it WAS real: the three-class rule sets the
  background and deliberately does not set the colour.
- **And a selector repeated inside `@media` is the design, not a duplicate.** The theme tokens are
  built on it. Only two rules in the same at-rule context are two places to edit one fact.

**Proved in both directions**: putting the `＋`'s font-size back names `.dock-new .btn` overruled by
`.btn.tiny` and exits 1; the real file is green.

### 87 selectors set the same property twice — 28 of them saying it twice over

`.page .card { border-bottom: 0 }` was in this stylesheet **word for word in two places nine hundred
lines apart, with the same comment over each** — under a note saying *"a page was described twice
and the two descriptions had already drifted apart"*. `.ag-a`, `.ag-b` and `.ag-c` each declare their
`fill` twice, seven lines apart. `#splash-breathe` is told `display: none` in two separate groups.

**A vague 87 is not a number anybody can act on, so it says which kind each one is.** **28 declare
the SAME value twice** — dead text, two places to edit one fact. **59 declare different values**, so
the later wins on file order alone — and **47 of those are `.mu-grid i:nth-child(N)`**, where the
multiples of three and the multiples of five are two separate lists and every multiple of fifteen is
in both. That is a designed overlap, and saying so needed the values rather than the property names.

**Printed rather than failed**, because repairing them across 448 KB is editorial work and not a
build error. Same split as the library's `figure` count and the practicals' blank `needs`: a number
somebody can act on beats a silence.

## `node js/check-settings.js` — the nine tabs that became files, and nothing was checking them

**`brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns` and `copy` left the
Settings spreadsheet and are `data/settings/*.json` now.** `settingsInto_` maps them onto `DATA` and
a file with rows WINS, so they are the source of truth for nine tabs — and **no check had ever
opened one.**

**This is `check-rows.js`'s fault one layer along, and that file exists because of it**: folding two
tabs together left **seven reads of `r.link` on rows that call the URL `source_url`**, every
checklist topic arriving with no link on it, and nothing throwing. The same is now available here. A
column renamed in an export, or a read written from memory, is a value that silently arrives as
`undefined` and then as `''` — a brand key that never resolves, a facet with no label, a campaign
with no accent — and every one of those has a fallback, which is exactly why nobody would notice.

| | |
|---|---|
| **fails** | a column READ that the file does not have, and a tab named in `SETTINGS_TABS` with no file beside it |
| **prints** | a column the file HAS that nothing reads — weight shipped to every phone for nobody, which is `check-payload.js`'s "sent and never read" |
| **prints** | the twelve files in `data/settings/` that nothing fetches. `config`, `pricing` and `venues` are deliberate: they feed `quotePerHour` **server-side**, because *a total posted by a browser is a total the client chose* |
| **says so** | `kinds` and `laws` are `[]`, so their columns cannot be known. "I did not manage to look" printed as "I looked and it was fine" is the failure this repository keeps finding in its own checks |

### It mis-attributed on its first run, and the giveaway was a zero

**The first version sliced the file into nine blocks, one per `const x = extra['settings/x']`, and
reported seven columns as missing from `copy`.** Every one belongs to CAMPAIGNS: a campaign carries
its own words, so `settingsInto_` builds the copy index INSIDE the campaigns block, the copy binding
opens first, and a flat slice handed the campaign's reads to the wrong tab. **Meanwhile `campaigns`
reported reading nothing at all** — a check that finds zero reads in a block full of them has lost
its subject, and that number is the only reason the other seven were not believed.

**So it parses.** Acorn was already a dependency for `check-rows.js`, which learned this exact lesson
— its first version reported 95 findings with 2 real ones because one binding map per FILE let a
handler's `r` outlive the handler. **The binding is the CALL, not the line**: the tab is whatever the
receiver of `.forEach(r => …)` resolves to, through a local `const` or the head of a chain like
`campaigns.filter(…).map(…)`.

**And `facts` carries its row in a wrapper.** It needs the index, so it maps to `{ r, i }` first and
every read after that is `x.r.heading` — reading only `r.<col>` found nothing in that block and
reported a live tab as mapped nowhere. Any parameter name is followed, but **only through `.r`**, so
the `.sort((a, b) => a.order - b.order)` at the end of the same chain contributes nothing: `order`
and `row` are fields of the mapped object, not columns of anything.

**`clip` is read off `facts` on purpose and that column has never existed** — the clips live in
`FEED_FACTS`, and `clipsNow_` falls through to the code's list when the sheet has none. That is the
house rule stated per LIST rather than per tab, so one ordinary fact typed into the sheet cannot take
the Reels column dark. It is the `ACCEPTED` pattern for the sixth time, one entry and one written
reason, and it is also the door: add a `clip` column and a row wins over the code.

**Proved in both directions**: renaming `value` to `val` in `brand.json` names it and exits 1.

## Which columns the app has is a file now, and the reader had been unreachable since it was written

**Asked as "there should be like 4-5 columns i think like it was before".** Git says there is no
before — the tab table has held nine in every commit since the repository began, and the hour grid
has been eleven hours by seven days in every one as well. **What the question exposed is that the
answer was never the owner's to give.**

**`applyColumns_` in `shell.js` has been complete and unreachable since it was written.** It reads
`DATA.columns`, applies the order, takes the label and the icon from each row, **refuses to invent a
column the build does not have** — *"a column that swipes to a blank is worse than a column that is
not there"* — refuses to leave you with none, and moves `AT` off a screen that has just been
switched off. Every guard is there and commented. **No backend has ever sent that key.** It sits on
`check-payload.js`'s accepted-dead list with the note *"needs a `columns` tab"*, and the spreadsheet
that tab would have lived in is being deleted.

**That is `orderPrints` again** — access-listed, argued for at length, never once called — and this
file records eleven more of them under the Settings migration.

**So the source is a file, like the nine tabs that just left that spreadsheet.**
`data/settings/columns.json` is fetched with them, `settingsInto_` writes `d.columns`, and the
ordering was already right: `settingsInto_` runs in `load()` a few lines before `applyColumns_`,
under a comment saying that one can change which screen you are on and everything painted after it
reads `AT`.

**It ships with the nine the code already has, in the order the code already puts them in, so
nothing changes today.** What it buys is that *"the app should have four or five columns"* is a cell
rather than a commit — which is the right shape for it, because which columns an app has is a
judgement about the app and not a repair.

**Proved in five states**, all with no JS errors: as shipped (nine, in order, `DATA.columns` nine
rows); **four columns relabelled and reordered with five switched off — `Home · Find · Book · You`**;
Find switched off, which lands you on Feed; an empty file; and a file holding an object instead of a
list. The last three all fall back to the code's nine, which is the same fall-through every other
settings file has and the reason a broken export cannot take the app down.

**It is the one file in `data/settings/` that is not an export.** Every other one is a tab that
existed, copied out verbatim; this is a tab that never did, written from the code so that a reader
which could not be reached has somewhere to read from.

## Forty-one guides asked a student to plan an experiment with nothing to go on

**Asked for as "have you made the guides for all practicles? just refine them and check they are
ok. maybe add diagrams."** Measured before anything was written, by booting the app and calling
`practicalGuide_` on all 57: **every one opened, and eleven carried a "What is going on".**

`practicalGuide_` draws that paragraph from `science` and its two scaffolding lists from `variables`
and `log`. Those three columns arrived with the eleven home experiments and exist on nothing else —
so every AQA required practical and every fun one handed a student the kit, the method, and then
eight empty boxes asking them to name an independent variable, **with nothing on the card
suggesting one**. A worksheet with the scaffolding removed.

**Written from each row's own aim, outcome, steps and `maths_link`, never from its title.** A
practical called "Osmosis" could be any of four experiments; the one in this file is potato
cylinders in sugar solution with a percentage-change graph, and that is what the paragraph has to
explain, because it is what the student will actually do.

**THE SCIENCE IS THE MECHANISM, NOT THE ANSWER.** A paragraph saying *"the rate rises with
concentration"* hands somebody the result of an experiment they have not run. What is written says
WHY — more particles in the same volume, so more frequent collisions — which is the half a student
cannot get from watching, and the half that is as true before the run as after it.

**`variables` and `log` are CANDIDATES, not instructions.** The guide asks the student to name the
independent variable; a list of things that could be changed is the prompt for that question and not
an answer to it. Four each, so the choice is real.

**The five refused experiments correctly get none of the three**, and their cards draw no Guide
tile, so nothing anywhere invites somebody to plan an experiment that has been turned down.
Measured: 0 of 5. `check-practicals.js` prints all three counts, so the next row added without one
shows up as a one instead of joining 41.

### Seventeen drawings, and what is deliberately not drawn is the result

**A guide that lists a burette, a conical flask and a white tile has said nothing about where the
tile goes.** *"The thermometer bulb level with the side arm"* is a sentence somebody reads twice and
still assembles wrongly. So seventeen practicals carry a `diagram` — the same column the library's
questions carry, inline SVG committed beside the row, taking the page's own ink so it works on both
palettes and offline.

**CLAUDE.md'S OWN RULE DECIDES WHICH SEVENTEEN**: draw only where the row's own words determine the
picture. Here that means a SET-UP or a CONSTRUCTION — a circuit, a clamp stand, a condenser, the
right-angled triangle behind R = d²/2h — something you build before the first reading, so the kit
list and the first three steps fix it exactly.

**AND NOT ONE OF THEM IS A RESULT.** No cooling curve, no I–V graph, no line of best fit. The
density tower is the sharp case and it is the reason the line is worth stating: its own step 2 is
*"predict the order of the layers from the densities alone"*, so a drawing of the finished column
would answer the question the practical asks. Same line the `science` paragraphs are written along.

**One placement, at the head of "How it runs".** Every one of the seventeen is a thing you build, so
it belongs above the numbered steps and nowhere else; a flag saying *this one is explanatory* would
be a second thing to keep in step with the drawing.

**`W = 340` comes from `tools/svgplot.py` rather than being typed again.** `.qsheet figure svg` is
`width: min(100%, 20rem)`, so the viewBox width IS the scale — the coins fault this file already
records, where one drawing came out three times the size of another from one stylesheet.

**`.gd` joined every one of the drawing selectors rather than getting rules of its own.** An
apparatus drawing is the same OBJECT as a transcribed exam figure: inline SVG inside `W`, inked in
`currentColor`, labelled with `.lbl`, `.num` and `.cap`. A second set of rules describing it is the
`.reel .over` fault, where one object was written twice in this stylesheet and drifted.

### A screenshot caught five, and one class of them is now a rule

**Tenth time this file writes that a screenshot is the last word on a drawing.** All seventeen laid
out at the width the app draws them, three rounds:

| | |
|---|---|
| `extension is the CHANGE in length…` | centred on the clamp stand rather than the card, so it ran off the left edge |
| `bulb level with / the side arm` | anchored `end` at x = 34, arriving as *"el with"* / *"ide arm"* |
| `the same distance, every time` | printed across the clamp stand's own base |
| the chromatography paper | hung 38px out through the BOTTOM of the beaker it is standing in |
| the eureka can's spout | drawn long enough to read as one swoosh with the stream |

**Three of those five are one fault: a label painted outside the `<svg>`'s own box.** `check/cards.js`
skips everything inside an `<svg>` and is right to — the outermost `<svg>` clips to its viewport, so
nothing in there can push the page sideways — but a word clipped away is a word the reader does not
get, which is a different question and nobody was asking it. It asks it now, in
`getBoundingClientRect`, **because a rect accounts for the rotation a y-axis label is written with
and `scrollWidth` does not**: that is the `.mat-out` lesson one rule up in the same file. Proved by
mutation: moving `lagging` to x = −6 names it at 31px and exits 1.

### The guide was outside the lab entirely, and that is why it cost five

**`check/cards.js` was laying out the practical CARD.** `check/ui.js` has one declared state that
opens a guide, which is one practical of fifty-two. So the half of that split which holds the kit,
the method, the risk assessment and now seventeen drawings was measured by nothing — **this file's
own "a sample is not a sweep", one commit after it split the card in two.**

**Through `openSheet` rather than a div of the right width**, because `#sheet-body` has its own
padding and its own cap: a guide measured in a bare 320px column is measured in a column it is never
in, and copying that padding here would be a second copy of a number the stylesheet owns. 57 guides,
17 drawings, one sheet at a time, closed after each.

**And two rules went into `check-practicals.js`**, because a repair to the instance and not to the
rule is the shape this file records eight times: a refused experiment carrying a diagram fails, and
a `diagram` cell that is not an `<svg>` laid out inside `W = 340` fails. Proved by mutation in both
directions.

## Two ways of saying who you are, and the app already had one

**Reported as "remove this feature of whos writing. its confusing. just have it be that they sign in
then can see answers."** The `workingAs` control — a `who is this?` button beside every answer box
that opened a `window.prompt` and filed the answer key under whatever was typed.

**It was a SECOND IDENTITY the app did not otherwise have**, and that is the whole fault: not a
login, nothing protected by it, nothing sent anywhere — its own note called it *"a label on a
drawer"*. Two ways of saying who you are is two things to keep in step, which is this repository's
sentence about `handle`/`username`, about `MESSAGING` and about `childrenOf`. `whoIs_` is the
signed-in person and nothing else now.

**What it cost, said rather than buried.** A boy who turns up today with no row in the Ledger works
under the signed-out key, the same as the tutor, where before a tutor could type his name at the
kitchen table. That is the ordinary behaviour of every other surface here, and the remedy is a
roster row and a PIN rather than a parallel mechanism.

### The box said "P001's answer", which is its own part of "its confusing"

**`whoIs_` answers `u:<person_id>` because an id is stable where a display name is a cell somebody
can edit** — exactly right for a KEY and unreadable as a LABEL. The old name box printed that id
back at whoever was working: an answer box captioned with an account number. `signedName_` is the
first name off `USER.name`, so the caption is `Lucca's answer` and the key is still
`ans:u:P777:q:Q0664`. **Measured in all three states**, and the name is kept rather than reduced to
"Your answer" because on a phone passed between two students it says at a glance whose drawer the
box is writing into — which is the one thing the deleted button was genuinely good for.

### And the mark scheme was shut for the one person who reads from it

**`hide = !!whoIs_()` was the test, and with the typed name gone that means "is anybody signed
in".** So a tutor signed in as themselves got their own mark schemes behind a tap — on the surface
they read FROM. `answerBlock_`'s own paragraph says who the open answer is for and it is not
"somebody signed out", it is the tutor.

**`isTutorRole()` is the app's own staff test** — tutor or admin, already used by the widget roster
for the same kind of question — so staff get the paper as printed and everybody else gets the
reveal, which opens itself the moment Check says they have it. Measured through the real app:

| | mark scheme | answer key | caption |
|---|---|---|---|
| signed out | one tap | `ans:q:Q0664` | Your answer |
| a student signed in | one tap | `ans:u:P777:q:Q0664` | Lucca's answer |
| **the tutor signed in** | **open** | `ans:u:P001:q:Q0664` | Alex's answer |

**The signed-out row is the one behaviour change beyond what was asked**: it was open and is now one
tap. A student who cannot sign in yet is the case the reveal exists for, and with the name box gone
that was the only route to it; an answer behind a tap is never harmful where an answer printed under
the question can be. One rule, and "not signed in" behaves like "not staff" as it does everywhere
else in this app.

## "hours of sunshine" was two pixels tall, and the rule was looking the other way

**Found on a screenshot taken to answer "will Paper 1 comprehensively work".** May 2017 Higher Q1
is a scatter graph of temperature against sunshine, and the card drew the top two pixels of its
x-axis caption. The label sits at `y = 180` inside `viewBox="0 0 340 176"`, so four units of it
were painted nowhere — and an axis caption is not decoration: a scatter graph whose axes are
unnamed is two columns of numbers.

**Six diagrams on four papers were doing it**, measured across all 68 in the library: two below
their box (the same graph on the Higher and the Foundation paper) and four above it, worst at 16
units on an AQA chemistry figure whose y-axis label was simply gone.

**THE RULE ASKED ABOUT TWO EDGES AND THERE ARE FOUR.** `check/cards.js` gained a clipped-label rule
with the practical drawings, and both faults it was written for ran off the SIDE — *"bulb level
with the side arm"* arriving as *"el with"*. So it compared `left` and `right`, and a caption
below the box was invisible to it. Same fault, other axis, which is the shape this file records
every time a rule is written from the instance that prompted it.

**And the library's own figures were outside it entirely.** That rule ran over the practical
guides' seventeen drawings and not over the 89 question cards that carry one — the figures a
student is actually looking at while they answer. Both passes share one `outside()` now, four
edges, and the run prints how many cards carry a drawing so the number cannot quietly go to zero.

**The window moves, never the drawing.** A label below the box grows the viewBox height; one above
it makes `min-y` negative and grows the height by the same amount. Every coordinate is untouched
and `.qsheet figure svg` still lays out at `min(100%, 20rem)`, so the picture is not rescaled — it
is given room it was already using. Recomputing the coordinates would be redrawing six figures to
fix a frame. **Proved by mutation**: putting one viewBox back names all four parts of Q1 at 5px.

**And it found two drawings that are not 340 wide** — `RS…-503` Q5 at 300 and Q6 at 290. The
viewBox width IS the scale, so those two render about a sixth larger than every other drawing in
the library; that is the coins fault, and it is printed rather than rewritten, because widening a
viewBox without moving its coordinates pushes the drawing into the left of its own frame. A redraw
and a judgement, not a frame fix.

### What a Paper 1 actually offers, measured through the app rather than off the data

**Asked as "i hope the maths papers they will do (which will be a paper 1) will work. and i mean
comprehensivley work."** It depends entirely on which paper, and the spread is wide enough that the
question has no single answer:

| Paper 1 | Qs | answer box | Check | drawn | pen | picture named, never drawn |
|---|---|---|---|---|---|---|
| **May 2017 Higher** `P-1MA1-1705-1H` | 31 | 31 | 22 | 15 | 1 | **0** |
| **May 2017 Foundation** `RS…-481` | 41 | 41 | 36 | 19 | 4 | 1 |
| June 2024 Higher `RS…-416` | 33 | 33 | 16 | **0** | 0 | **13** |
| June 2024 Foundation `RS…-415` | 41 | 41 | 30 | **0** | 0 | **15** |

**Ten of the thirteen transcribed maths Paper 1s have no drawings at all.** The 2017 pair are the
two that were drawn, and they are the two to teach from. This is the `figure` backlog this file
already counts — 485 questions across the library — seen from the other end: not "how many rows
are outstanding" but "can somebody sit this paper tonight".

**The pen is rarer still and for the reason already recorded**: `padSource_` needs a diagram, so a
draw-on question with no picture is an answer box. 1 of 31 on the Higher paper, 4 of 41 on the
Foundation one, 0 on everything else.

## Carry on was built and then removed, and the removal is the entry

**Asked for as "i want it to be the same paper we did like 2 weeks ago for each"**, and the answer
built for it was a `<name>, carry on` block over the funnel's first question: the papers this person
had answers saved against, a count beside each, a tap setting the `paperId` chip. Derived from the
answer keys, which really are the only record of which paper anybody worked through — nothing is
posted anywhere, so `ans:u:<person_id>:q:<row_id>` in `localStorage` is it.

**And the owner's answer was that the question had already been answered**: *"no i dont want lucca
carry on bullshit. im just saying if they answer something, it will be answered next time they come
on."* That is a statement about PERSISTENCE, and persistence is `ansKey_` and `ansRead_` — an answer
typed into a box is under the signed-in person and comes back in that box on the next visit, on
every paper, with nothing on any screen to press.

**So the feature was a second route to a place the funnel already reaches** — measured at 8 taps for
May 2017 Higher Paper 1 and 9 for the Foundation one, both landing on exactly that paper in its own
order — **on the one screen whose own note warns about offering to throw away what somebody is
part-way through.** Removed whole: `resumeBlock_`, `resumeList_`, `resumeIndex_`, `RESUME_MAX`,
`RESUME_ROWS`, `on('resume-paper')`, two CSS rules and the declared state that pressed it.

**What survives it is worth naming, because it is not the same work.** The `showOf` hook and
`paperLabels_` below came out of the same afternoon and stay: they are what stops twenty papers
sharing six buttons, and they are the funnel's own Paper question rather than a door beside it. And
the measurement stands — the answer keys ARE the record of which paper somebody is part-way through,
and a surface that ever needs it reads them rather than growing a column.

**`pad-clear` went off `ACCEPTED_QUIET` with the state that reached it.** It was correctly quiet —
clearing a pad nobody has drawn on writes an empty list over an empty list — and with the state gone
nothing presses it, so the entry would have been a written reason with nothing behind it. That is
the shape every list in this file exists to prevent, pointed at itself.

### The Paper question was putting two papers on one button

**Its own note has always stated the rule** — *"the id decides WHO answers and the name is what is
shown"* — **and its `of` returned the name.** So the spelling fold, which exists to make `Alevel`
and `A-Level` one button, merged papers: `Paper 1 (Non-Calculator) — May 2017` is Edexcel Higher and
`Paper 1 (Non-calculator) — May 2017` is the Foundation paper of the same sitting, one letter's case
apart. **Six names carried by twenty papers**, the six AQA science `Paper 1 — June 2024` rows
putting three subjects and two tiers on one answer, and 248 answers offered for 262 papers.

**`showOf` is the fix and it is one line per facet**: the value is the id, the label is what the
facet says to draw, and `shortLabels_` shortens the label rather than the value. Narrowed to
Maths · Higher · Summer 2017 the three answers still read `Paper 1`, `Paper 2`, `Paper 3`.
`paperLabels_` disambiguates only where a name is shared and by what actually differs — subject
first, then tier.

**Built from `LIBRARY_ROWS`, the file, not the mapped list.** The first version read
`DATA.questions`, which carries only 170 of the 262 papers' document rows and renames `paper_id` to
`paper` on the way through, so every button drew a raw id. Caught by looking at the rendered answers
rather than at the count, which was already right.

**And the chip did not follow the value.** `f.value` had been both the match and the label until
this, so the chip read `PAPER P-1MA1-1705-1H` — an account number where a paper's name had been.
Caught on a screenshot of the tap that sets it. Same shape as `resource_type` sitting in `VOCAB`
after the rename: the rule moved and one of its readers did not.

**`check-funnel.js` gains the rule, and it is on the ITEMS rather than the spelling**: press an
answer, and every question left has to come from one paper. Test 2 could not see this and its own
note says why — it looks for two values that normalise to one key, and after the fold there is only
one value left. Proved by mutation: the old `of` names all six merged answers.

### The lesson that outlived it: a door drawn from `localStorage` is a door nothing presses

**`check/press.js` passed without ever reaching `resume-paper`.** The block was drawn from
`localStorage`, so on a fresh browser there was nothing to draw — and an action that is on no screen
is one that check cannot report. **That is the hole the STATES list exists to close**, the same one
the booking receipt and the message thread were in, and it is why the state was written before the
feature was trusted: 89 actions pressed became 100.

**The state is gone with the feature and the rule is not.** Anything whose door only appears once a
device carries state — an answer, a basket, a saved thing — needs a declared state that seeds it
through the app's own writer, or the press pass reports a clean sweep of a control it never saw.
`stuff · carry on` seeded through `ansKey_` rather than spelling the key out in the harness, and
`leave` removed what it wrote, because states run in order down one page.

## The bottom of a band was marked right and the top of the same band was marked wrong

**Found by asking whether the two papers somebody is sitting tonight actually mark.** Q13 of the
May 2017 Foundation Paper 1 is *"write down an estimate for the real height of the man"* and its
scheme takes **1.5 to 2 metres** — there is no single right answer to it, and `accept` says so in
the scheme's own words.

**`markBare_` strips a trailing word from the expected side, and `to 2 metres` IS a trailing word.**
So `1.5 to 2 metres` quietly became `1.5`, and measured before anything was changed:

| typed | marked |
|---|---|
| `1.5` | **Correct** |
| `1.75` | Not yet |
| `2` | **Not yet** |

**Both ends of one accepted band, from one cell, disagreeing.** And the bottom passing is what made
it invisible: a rule that failed everything would have been reported the first time anybody used
it, where one that says yes to the first number in the cell reads as marking.

**Three rows in the whole library carry a band** — Q13(a), Q13(b) and Q18(a) of that same paper —
and all three are on the paper a student is working through this evening. `markRange_` is the rule
rather than three repaired cells, which is this file's own sentence about `cost: 0` and `paper:
true` for the ninth time.

**Only `to` and the two long dashes.** A plain hyphen between two numbers is also how a person
writes a subtraction and how this library writes an age range, and a rule that cannot tell them
apart marks a WRONG answer right — the one failure worse than the one being fixed. **Compared as
whole numbers**, for the reason `markFrac_` gives: the ends of a band are decimals and a float
comparison at a boundary is the one place this must not be approximately right. Both ends inclusive,
because a scheme printing "1.5 to 2" accepts 1.5 and accepts 2.

**Proved in the app as well as in the check**: typing 1.75 and 2 into Q13(a) as a signed-in student
both come back *Correct*, 0.9 comes back *Not yet*. `check-marking.js` is 46 cases now, and the
mutation names five of them.

## Q13 was a scale drawing with no scale, and part (b) had nothing at all

**The last picture missing from the May 2017 Foundation Paper 1, and the only one on it the row's
own words determine.** Two figures on one ground line, drawn to one scale, the tree a little over
five times the man: there is exactly one drawing that answers that, which is the line this file
already draws between a drawing instruction and a summary of fourteen plotted points.

**The transcription had written the ratio into the prose, because the picture was not there.** That
is part (b)'s whole method handed over — *"what a figure shows is not what its answer is"*, which
this file records about the AQA Biology pie chart. The picture carries the ratio now and the prose
does not.

**And it moved to a question-scoped preamble, because BOTH parts hang from it.** Part (b) read only
*"Find an estimate for the real height, in metres, of the tree"* — no tree, no man, no scale. That
is the Venn diagram of Q23 exactly and the answer is the same one.

**The ratio is asserted against the mark scheme rather than eyeballed.** The scheme takes 1.5–2 m
for the man and 7.5–12 m for the tree, so the band it will accept is a ratio of 5 to 6 — and the
drawing has to be one where BOTH ends of the man band land inside the tree band, or a student who
measures our picture correctly is marked wrong. At 5.2 that is 7.8 m and 10.4 m. Measured off the
drawn pixel heights in `tools/draw-1f-1705-q13.py`, not typed beside them.

**Measured after: both papers have no gaps left.** `P-1MA1-1705-1H` (May 2017 Higher, 31 questions)
and `RS1786302107764-481` (May 2017 Foundation, 41 questions) each report **0 questions whose
picture never came across and 0 questions with no answer**, and the library-wide count went 722 to
721. **Eleventh time this file writes that a screenshot is the last word on a drawing**: the first
version's man was 26px against a 135px tree and read as a smudge rather than a person.

## A textarea ate every swipe, and the mouse could not see it

**Reported as "i notice that somethimes navigating on widgets could be more stable in general. please
i dont want any hiccups".** Measured rather than guessed at, and it is one line.

**`axisFree` named `textarea` beside `select` as a control that consumes a drag for its own
reasons**, and `style.css` gave every textarea `touch-action: pan-y` from the matching list. Between
them that is a blanket refusal on **both axes for every textarea in the app** — the notepad, the
comment box, the message composer, and the answer box on every question card, which is the surface
a student's thumb is on all evening.

| measured with real touch events | swipe up | swipe left |
|---|---|---|
| the notepad, empty | **stays** | **stays** |
| the notepad, a page of text in it | scrolls the text ✓ | **stays** |
| the comment box, empty | **stays** | **stays** |

**You land on the widget and you cannot swipe off it in either direction.** The tab bar was the only
way out, which is exactly "navigating on widgets".

### Sideways can never be right, and vertically it is a question the walk already asks

**A textarea WRAPS**, so `scrollWidth` is `clientWidth` and there is no sideways scroll to protect —
naming it blocks a gesture it could never have wanted. Vertically it is right only while there is
text below the fold, and that is precisely what the walk under it asks of every other scroll
container, with the six-pixel floor whose own entry records what rounding costs. So the name came
off and the measurement decides, which is this file's sentence about `cost: 0` for the tenth time:
a blanket where a measurement belongs.

### A DIV hands the gesture back and a TEXTAREA never does

**That half is a fact about the browser and it took counting events to find.** `#docket-body` is a
DIV with `pan-y` and nothing to scroll, and a swipe up on it turns the page — correctly. `.cmt-text`
is a TEXTAREA with `pan-y` and nothing to scroll, and the page does not move. Counted at the window:
**`pointerdown 1, pointermove 1, pointercancel 1`**, with `.pane` and `#screen` both saying `none`
over it. A drag inside a text control is a SELECTION, so the browser takes it whatever the ancestors
say — an ancestor cannot fix this and only the element can.

**So it is `touch-action: none` on `textarea` rather than leaving it off the list.** `auto` loses
both axes to the selection, `pan-y` loses the vertical to a pan that usually has nothing to pan, and
`none` hands the app everything — which is what every card in this app already does. **What it costs
is written down**: you cannot drag a long answer up and down inside its own two-row box. The caret
scrolls it while you type.

**And the one textarea that is genuinely a thing you are IN is not in the stylesheet at all.**
`padReach_` sets the notepad from its own measured overflow — `pan-y` once there is text below the
fold, `none` while it fits — called where the widget is drawn and on every keystroke, which is
already where the save is booked. One writer, so there is no cascade to lose, and it uses the same
six-pixel floor `axisFree` uses because two places asking one question have to ask it the same way.

| after | swipe up | swipe left |
|---|---|---|
| the notepad, empty | page turns | column moves |
| the notepad, a page of text | scrolls the text | column moves |
| the comment box | page turns | column moves |
| **a question card's answer box** | **page turns** | **column moves** |

**A full notepad scrolled to its bottom still eats one more up-swipe**, and that is left alone: it is
what every native scroller does at its end, and `touch-action` is read once at the start of a gesture
so it cannot be expressed as "at the bottom, going up".

### The swipe pass was green over all of it, because a mouse ignores `touch-action`

**`check/press.js` has driven 30 real swipes on every run since it was written** — `page.mouse`, at
the pace a hand makes them, so the thresholds, the axis lock and the velocity are all exercised.
**None of that can see this**: `touch-action` applies to touch and to nothing else, so a box that
swallows every drag on a phone measures perfectly with a cursor. **The instrument that cannot reach
its subject reporting that the subject is fine**, one layer below where this file usually records it.

**So it dispatches real touch events too**, through CDP, and asks the narrow question the fault
shares: **a box with nothing to scroll must not keep the gesture.** Every surface that carries its
own touch behaviour — `textarea`, `.msg-body`, `#docket-body`, `.feed-text`, `.widget-squeeze` — in
the axis it cannot use. A box that CAN scroll is not asked, because keeping the drag is then what
somebody reached for. **Proved by mutation**: putting the blanket `pan-y` back names
`touch up from feed p0 textarea.cmt-text landed on page 0, wanted page 1` and exits 1; the real
files exit 0. 33 swipes, and the three new ones are the only ones that could ever have failed.

## The library is a file and the app still would not start without the backend

**Reported from the live site with a screenshot of the splash**: *"the loading is taking forever.
surely, it shouldnt take long anymore as its pulling info from live file not from appscript
anymore."* That reading is exactly right and it was not what happened.

**Measured with the backend hanging and a student signed in from a previous visit:**

| | before | after |
|---|---|---|
| splash | **60.8 s** | **15.4 s** |
| questions in the library | **0** | **5,127** |
| their paper | **0 questions** | 41, 36 of them with a Check |
| signed in as themselves | yes | yes |
| marking | works | works |

**Two separate faults, and the first one is one `if`.** `libraryInto_`, `libraryExtras_` and
`settingsInto_` all sat inside `if (d && !d.error)` — so the questions, the practicals, the brand,
the facets and the columns, every one of them a FILE in this repository fetched in parallel with the
payload and usually landed long before it, were merged onto the payload **or not at all**. A backend
that answered slowly did not delay the library; **it deleted it.**

**So the files stand on their own.** `filesOnly_` builds `DATA` from them on both failure paths.
It is the same rule the files already carry one level down — `libraryExtras_` and `settingsInto_`
leave a key alone when their file has no rows — pointed at the other failure: **a file with rows
should win over a payload that never came.** It declines if a good payload is already standing, so a
failed retry cannot empty a screen that is working, which is the `nothingHere` argument wearing the
other coat.

**What is still lost without the backend, said rather than implied**: people, jobs, prices, the
shop, posts and messages. A student's paper, their answers, the marking and the mark schemes are all
here, because each is a file or the device's own storage.

### The deadline was right and it was answering a different question

**Sixty seconds is not the fault and its own note says why**: this backend answers in about fifteen,
and a deadline under the thing it is timing reports a healthy backend as a dead one — *"that
happened, at twelve seconds, and cost an afternoon."* That argument is about **when to stop
waiting**. The splash is a different question — **when there is enough to show** — and the answer is
as soon as the files have landed, which is usually long before the payload.

**So it comes up at `SPLASH_SAY_AFTER`, the same fifteen seconds the slow-load line already uses**,
and deliberately the same constant rather than a second number: that line is the app saying *this is
taking longer than it should*, and the moment it becomes true is exactly the moment to stop waiting
to draw. **Nothing is cancelled** — the payload lands behind the app and repaints, which is the
ordinary late-payload path.

**Why it survived this long.** Every measurement of this failure had already been taken and recorded
two sections up — *"the backend never answers → 8/9 screens, splash lifted at 60s"* — and read as
the deadline working. It was. What nobody asked is what was ON those screens, and the answer was a
Find screen with no questions in it.

## One DOM element per library row, rebuilt on every tap

**Reported as "when im clicking on questions and using the finder its so fycking slow man", then
"its only slow on mobile".** That second message is the diagnosis: every number in the funnel's
arithmetic is memoised and measures **0 ms** — `stuffFiltered`, `nextFacet`, `stuffQuestion`,
`stuffPageCount`, all of it. What is left is DOM, and DOM is what a phone is slow at.

**Measured at 8x CPU, one tap on the funnel's first answer**: `insert 50 ms`, `fill 45 ms`,
`question 19 ms`, `pager 8 ms` — and the insert is **5,227 page elements, 292 KB of markup**, built
from nothing every single time. At 12x, which is an ordinary mid-range phone, the whole repaint was
**340 ms a tap and 233 ms a keystroke**.

**There is one page per RESULT**, so the cost is the size of the LIBRARY rather than the size of the
screen — and it grows with every paper transcribed. The desktop hid it completely.

### Three things, and none of them changes what is on the screen

| | |
|---|---|
| **the blanks are reused** | an empty page is an empty page whichever item it stands in for, so a repaint that does not change the count now touches nothing. Add the difference, remove the difference |
| **only a dozen are built while your finger is down** | you land on the question you just answered and the results are below it. The pages within reach are built now and the rest arrive on the next turn of the event loop, before any finger can travel far enough to need them |
| **`fillStuffPages` walks the window, not the library** | it walked all 5,227 pages calling `paneOf_` on each — a DOM query per page — for a function whose own note says it only ever touches eleven. What to fill is the window; what to empty is whatever is still MARKED filled, which is a selector the browser answers without walking anything |

| at 12x CPU | before | after |
|---|---|---|
| answering the first question | 340 ms | **160 ms** |
| answering the next | 264 ms | **22 ms** |
| a keystroke in the search box | 233 ms | **102 ms** |

**What makes reuse safe is the `filled` mark.** A page standing in for a different item must not
keep the markup it was given for the old one — so `paintStuff` empties every page that HAS been
filled, and there are never more than eleven of those.

**The dial counts what is there**, so it names the real total a frame later, and `goPage` clamps —
which is what makes the deferred half safe rather than something to get right. **Proved by walking
the states**: top of funnel, one answer (5,226 items / 5,227 sections), narrowed to one paper
(41 / 42, Q1 Q2 Q3a Q3b in order), paged to Q13a, then a search (1,109 / 1,110). Sections match the
wanted count in every state and no JS errors.

**What is NOT fixed, and it is the real one.** 160 ms is better than 340 and it is still one element
per row: the top-up builds all 5,226 a tick later, and `placeCells` then positions them. The honest
fix is a strip that holds a window of page ELEMENTS rather than one per result — a change to the
pager every screen shares, which is not a thing to do while somebody is teaching. Written down here
so it is a decision rather than a silence.

## The Find screen holds fifteen pages and has five thousand

**The fix the entry above called "the real one" and deferred.** It said: *"it is still one element
per row — the deferred half just moves the work off the tap. The honest fix is a strip that holds a
window of page ELEMENTS rather than one per result."*

### A page number and a DOM position are no longer the same number

**`PAGE_KEEP[id]` and `PAGE_LO[id]` in shell.js are the whole of it** — how many leading pages are
always present (the question, the saved things, the booking pages, which hold ids and may not be
recycled), and how many pages beyond those have been scrolled past and are not in the document.
`domIndex_` and `logIndex_` map one to the other, **both are nought on every other screen**, so a
column that builds all of its pages maps every page to itself and is untouched by construction.
That is what made it safe to put on the path every column shares.

**Everything that treated the two as one number now goes through them**: `columnShift_`, `stepY_`,
the fade sweep in `placeGrid`, `goPage`'s empty-page test, and `fillStuffPages`.

**The elements are recycled, not rebuilt.** Sliding down by one moves the top page to the bottom, so
every other page keeps the card it was already showing and turning a page still draws exactly one
card. Clearing the window on each slide would have been four lines shorter and would have redrawn
eleven cards every few turns. **Re-centred only within `STUFF_EDGE` of an end**, so most turns move
nothing at all.

**And `paintStuff` throws the window away and remakes it**, which is the cheap option now rather
than the expensive one: there are never more than fifteen, and starting from nothing means the
offset cannot be left describing a strip that no longer exists.

### Three more things were hiding behind the DOM cost

| | |
|---|---|
| **the search haystack** | six fields joined and `norm`ed for all 5,354 items **on every keystroke** — 126 ms at 8x, about 2.7 MB of string work to answer "does this contain `work`". `x.text` was built once onto the item and the join around it was not. Cached as `_hay`, which is the rule this file already states twice |
| **the sort** | ran over the FILTERED list on every tap, and none of it depended on the filter: the order is a key held on the item. The SOURCE is sorted once and `filter` keeps the order |
| **`PAGER.stuff`** | built 5,226 strings — `(i + 1) + ' of ' + n` — to be counted. The names were read by a header that no longer exists, so `pageCount` takes a number now and that entry answers with one |

| at 12x CPU — an ordinary mid-range phone | before tonight | after |
|---|---|---|
| answering a question | 340 ms | **119–142 ms** |
| a keystroke | 233 ms | **57 ms** first, **40–45 ms** after |
| **turning a page** | inside the 264 ms repaint | **6–12 ms** |
| page elements held | **5,227** | **16** |

### The journey that caught it was right and had a second opinion in it

**`check-flow`'s pager journey failed on the first run**: *"stuff: 1 page drawn, pager counts
undefined"*. It read `PAGER[id]().length` — **a second definition of how many pages a screen has**,
which broke the day an entry started answering with a count. It asks `pageCount` now, the one
definition, and it knows that a windowed screen's element count is capped on purpose: the question
is the same one, and what `drawn` is compared against is the number of pages the screen is able to
hold. **Proved by mutation**: a `PAGER.stuff` that forgets the leading pages still fires it.

### And nothing in the suite could see a card in the wrong position

**That is the fault this change can actually cause**, and it is invisible to everything: a question
rendered at the wrong page number measures perfectly, lays out perfectly, presses perfectly, and is
the wrong question. So `check/press.js` walks all 41 pages of the May 2017 Foundation paper
**forwards and then backwards** — both, because the window recycles by moving elements from one end
to the other and an off-by-one shows up only when you arrive from the other side.

**Asserted on the answer box's key** (`ans:…:q:<row_id>`), which is the one thing on a question card
that names the row it was built from: `Q6(i)` and `Q6(ii)` both start `Q6`, and my own throwaway
probe reported those two as failures for exactly that reason before the real check existed.
**Proved by mutation**: `domIndex_` returning its argument names 52 wrong pages and exits 1.

## A maze, and the one design decision in it is that it is not swiped

**Asked for as "i need to add maze game widget".** Eleven by eleven, carved by a depth-first walk
that never revisits a cell — which is what makes the result a TREE: between any two squares there is
one path and no loops, so it is always solvable and never has a shortcut somebody can stumble onto.

**UP, DOWN, LEFT AND RIGHT ARE THE FOUR GESTURES THIS APP NAVIGATES BY.** A maze that read them
would fight the pager on the one screen it lives on, and the loser would be the swipe — which is how
you reach every other widget. `touch-action` cannot arbitrate it, because the column and the card
want the same four directions. So it is a pad of four buttons, each **44px in px**, and the arrow
keys for anybody on a keyboard. This file records what a blanket `touch-action` cost on the notepad;
this is the same argument made before the fault rather than after it.

**The shortest way is counted, not invented.** A breadth-first walk from the entrance gives the
fewest moves that can solve it, so *"out in 68 — the shortest way there is"* is a fact about the
maze rather than a score made up to have one. Computed when the maze is built, so finishing costs
nothing.

**The trail is the whole playability on a card this size.** Eleven squares across 272px is about
24px each, and without a mark of where you have been a dead end looks exactly like a corridor you
have not tried. Faint, because it is a memory aid rather than part of the maze.

**A cell cannot be 44px and here that costs nothing**, which is the difference from Connect 4:
eleven of them is 484px against a 320px phone, and **nothing in the maze is tapped**. The four keys
are, and each is a real fingertip. The board note by `.c4` is about the case where the squares
themselves are the control.

**A wall stops you and says nothing.** Every other game here answers an illegal move by ignoring it;
a maze that announced *"there is a wall there"* would be saying what the screen already shows, once
per attempt, which is most of playing one.

**And its three colours are declared on the component.** A maze's walls are that maze's convention
and nothing else in this app wants them — the rule the house style states with the chess board's
cream and charcoal. `--line` is right for a hairline between rows of text and **measurably** too
faint to read as a wall at twenty-four pixels a cell.

**The opening line was removed after a screenshot.** `#maze-said` said *"Top left to bottom right."*
directly under a `.sub` saying *"Top left to bottom right. Tap the arrows, or use the arrow keys."*
— one sentence twice, which is the fault this file records where every widget printed its own name
twice. It speaks when there is something to say.

**Proved by playing it**: the maze is solved by pressing the four real buttons along a
breadth-first route, and the moves counter, the state and the sentence all agree with the number
the solver predicted — 50 on one maze, 68 on the next, so the carving really is random. Walking
into the edge moves nothing and counts nothing. 36 checks pass, `check-widgets.js` reports 8 games,
and `check/press.js` presses both of its actions.

## A recap quiz for every science topic, and the library could not mark a single one of its own

**Asked for as "i need to make a quize for each level of each topic in my site. just a quiz os less
pressure. sort of like a recap thing. starting with science."**

**THE MEASUREMENT IS WHY IT IS NEW CONTENT RATHER THAN A NEW VIEW OF THE LIBRARY.** There are 745
science questions in `data/questions.json` and **every one of them has an empty `accept`** — so not
one can mark itself. That is correct for an exam question, which is marked against a scheme by a
person reading working, and it makes a recap impossible: the whole point of a recap is that you
find out now. So 405 questions were written for it — 81 quizzes, five each, **27 science topics ×
KS3 / GCSE Foundation / GCSE Higher**, 368 multiple choice and 37 typed.

**The three levels are different QUESTIONS about one topic, not one question worded harder.** KS3
asks what a thing is; Foundation asks what it does and what the words mean; Higher asks the content
that is Higher-only on the spec — the inverse square law, monoclonal antibodies, negative feedback,
trophic efficiency, momentum. A Higher paper is not a Foundation paper with longer words.

**And every `why` is the MECHANISM rather than the answer said again.** This file already records
that line twice about the practicals' `science` column: a sentence saying *"the rate rises with
concentration"* hands somebody the result of an experiment they have not run. *"More particles in
the same volume, so more frequent collisions"* is the half a student cannot get from watching, and
it is as true before the answer as after it.

### It is marked by `markAnswer_`, which is the library's own marker

**A typed quiz answer goes through the same function a past-paper answer does**, so the fraction
slash, the mixed number, the "or equivalent" fold and the accepted band all behave here exactly as
they do on an Edexcel paper. A second marking implementation would be the second reader this
repository records under `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` — and **this is
the one surface in the app that tells a child they are wrong**, so two of them is two chances to do
that unfairly.

**And the answers live in the drawer the past papers already write into.** `ansKey_(x) + '#q<n>'`
is `guideBox_`'s shape and for its reason: `whoIs_` still decides whose answers these are, so two
students on one phone get two sets and signing out moves all five together. Which also makes *"if
they answer something, it will be answered next time they come on"* true of a quiz with nothing new
written.

### `node js/check-quizzes.js` found three on its first run, and they are its whole class of fault

**`quizRight_` compares a multiple-choice answer against the stored press as a STRING, character for
character** — and that is safe only because the answer is one of the choices. An answer cell that is
not reachable by any press marks **every attempt wrong, for ever**, silently, with valid markup, and
reading as the student's fault rather than the row's. That is the failure this file calls the worse
of the two.

**The three it caught are the same shape one column along**: `A hand warmer`, `A sports injury cold
pack` and `Radon gas from rocks` were printed as the answer to a TYPED question whose `accept` list
would have refused all three — so a child typing exactly what the card showed them would have been
told they were wrong. The check runs the app's own `markAnswer_` over every typed row's own printed
answer, which is the only way that question can be asked.

**`tools/quizwrite.py` asserts all of it at the writing end and that is not enough.** A file can be
hand-edited, appended to by another script, or written by a version of that tool that has since
changed, and a rule living only in the thing that produced the data is a rule nothing enforces about
the data. Same argument as `check-library.js` sitting over insert scripts that already assert their
own totals. **Proved by mutation in four directions**: an answer that is not a choice, a comma in a
topic name, a missing `why`, and a typed row whose `accept` was emptied.

### `check-marks-load.js` — the second extractor was written and immediately got it wrong

**`check-quizzes.js` needs the same six marking functions `check-marking.js` cuts out of `find.js`,
to ask a different question of them**, and its first version had its own simpler cutter: to the next
top-level declaration. **It reported `js/find.js no longer declares markBare_`** about a file that
declares it on line 3420 — `markBare_` is a `const` arrow with no block, so it ends at a semicolon
rather than a brace, and the naive cut walked straight past it.

A check confidently wrong about its own subject, one commit after being written. One extractor now,
brace-counted, used by both — which is this repository's own answer every time two readers of one
thing appear.

### The number was in the roster line, and a state added to the lab did not touch it

**`check-all.js` said `132 combinations of screen, state, width and visitor` and the run printed
140.** The quiz state was measured, reported nothing, and the summary went on naming the old number,
because `check/states.js` and `check-all.js` are different files and only one of them counts.
**Fifth occurrence of the shape this file opens the checking section with** — "all 18 checks pass",
"one of the eighteen names", `papers checked against a total` going 34 → 2 under a green tick, and
the prose over `CARD_W` naming 88% and 4% while the code said 80 and 8. The label names no number
now; the run prints its own.

### The double-import trap, and it printed `0 quizzes` over 405 perfect rows

**`tools/quizwrite.py` run as a script is `__main__`.** The three content files say
`from quizwrite import quiz`, which loads it a SECOND time under its own name with its own empty
`ROWS` — so the rows landed in `quizwrite.ROWS` and the `write()` at the bottom read `__main__.ROWS`,
a different list. It reported **`0 quizzes, 0 questions`** over content that had been built perfectly,
which is this repository's oldest shape one more time: *I did not manage to look, reported as I
looked and there was nothing there.* It goes through the imported copy now.

### Found in the funnel, opened in a sheet — which is the practicals' split and its measured reason

**`.pane` is `overflow: hidden` and caps at 805px on an 844px phone**, and five questions with four
choices and an explanation each is nowhere near that. So the card is the search RESULT — the topic,
the level, and how far through you are — and the sheet is the thing you work through, because
`#sheet-body` scrolls. Identical to the split `practicalCard_` records, taken for the same reason
measured one data file along.

**The join is `topics` a third time**, and that is the whole reason this is in the funnel rather than
on a screen of its own: `tools/quizwrite.py` refuses a topic `data/topics.json` has never heard of,
so a quiz, a practical and a past-paper question about cell biology all answer one Topic question.
`level` and `tier` are the library's own spellings for the `needs_print` / `print_required` reason —
a third spelling of a fact two columns already carry cost 356 rows of disagreement last time.

**The mark is drawn from the stored answer, never left on the element by the handler.** That is the
`REEL_HELD` fault in full: the reel's pause mark was added in the tap handler only, so a repaint
rebuilt the markup without it while the state stayed. Here the same fault would be a quiz you
answered, reopened, and found blank while the score said 5 of 5. `quizRow_` reads the key and works
the mark out itself, so the markup after a press is byte-identical to the markup after reopening.

**And the score is counted rather than stored** — a stored score is a second copy of a fact five keys
already hold, which is `paperMismatches`'s argument and `reelPages_`'s. An unanswered question is not
a wrong one, because `markAnswer_` answers `null` for an empty box and that distinction is deliberate
there: the line says *"3 of 5 answered, 2 right"* rather than failing the two nobody has reached.

**The declared state seeds one right and one wrong**, through `localStorage` and the app's own
`quizKey_` rather than by pressing, because that is what proves the two paths agree — and a quiz
where everything is right measures no red, which is half the rules in the block.

### `check/press.js` could not see a sheet a STATE had opened, and the mutant proved it

**It reported a clean run over 93 actions with `quiz-pick`, `quiz-check` and `quiz-again` never
pressed once.** The queue is built from `#s-<id>`, and **a sheet is a sibling of the screens rather
than a child of one** — so the only route a sheet's actions ever had was `out.inSheet`, which is
collected AFTER a press opens one. A state whose own `enter` opens a sheet queued nothing at all.

**Proved by breaking `quiz-pick` outright and watching the mutant survive**, which is this file's own
definition of a check that cannot fail. With the queue seeded from an open sheet the count goes
**93 → 99** and the mutant is named at both visitors; the real handler is silent.

**The practical guide had been in the same hole since it was written** and got away with it because
the boxes it holds are `qp-ans`, which is pressed on a question card elsewhere. That is the
instance; the queue is the rule, and this repository's own sentence about `cost: 0` and `paper:
true` is why the fix is the second one.

### The card said the same sentence eighty-one times

**A screenshot of five cards in one column, all reading *"A quick recap. Nothing is sent anywhere and
there is no timer."*** One fact about every quiz in the list, printed once per row — which is the AQA
insert fault this file records in full: one sentence describing an insert, repeated on every question
that used it, when it belongs to the thing they all hang from. The sheet's own intro says it once, at
the moment somebody is about to answer.

What actually tells two cards apart is the topic, the level chip and how far through you are, and
only the third of those is ever worth a line. **Twelfth time this file writes that a screenshot is
the last word on something drawn** — nothing measured wrong, no overflow, no tap target under 44px,
and the card was a third boilerplate.

## Chat was in Tools because the note deleting it only took the static half

**Reported as "i dont want chat in tools. what the fuck"**, with a screenshot of two message threads
sitting under the calendar on the Tools column.

**`map.js` ALREADY CARRIES THE ARGUMENT AGAINST IT, in full, where the messages widget was deleted
from `WIDGETS`**: *"a calculator, a board and a timer are instruments: you go looking for one
because you want to do something with it. A message is somebody trying to reach YOU."* That removal
took the FIXED entry out. **`msgWidgets_()` in `me.js` went on generating one per conversation with
`kind: 'tool'`**, and `allWidgets()` concatenated them — so the decision was undone by a function
nobody connected to it, in a file the note does not mention.

**And the `dm` column exists now**, one conversation per page with the composer at the foot of each,
built long after that note. So Tools was the **third** home for a conversation and the only one
nobody asked for — the reel scroller's shape exactly: a surface that predates a better one and was
never removed with it. `msgWidgets_` and `fillThread_` are gone; measured first, the string `msg:`
appears nowhere else, so the roster was the only reader.

## The card changed under your thumb, and the shift was measured off the one page that cannot move

**Reported as "when navigating up and down on the practicles, they just start bugging out. i dont
know if its because i was favouriting things too."** It was, and reproducing it took one probe:

| | |
|---|---|
| six pages into the practicals | page 7, reading **Microbiology** |
| press the star on that card | page 7, reading **Food tests** |

**A star added a page in FRONT of the results**, so every result slid down by one while the page you
were standing on kept its number. The card you were reading became a different card and nothing
anywhere said why.

**`paintStuff(true)` WAS ALREADY TRYING TO DO THIS AND WAS MEASURING THE WRONG THING.** It shifted
`PAGE.stuff` by `stuffQuestionPage_() - wasQ` — and `screen('stuff')` builds
`[the question], frontPages_(), savedPages_(), …`, so **the question is page nought under every
ordering and that difference is always nought.** The note over the star's handler claimed it moved
you "by exactly that much"; it moved you by nothing. Same shape as the `.favwrap.is-fav` rule below:
a sentence describing a mechanism that is not there.

**AND MY FIRST FIX MOVED NOTHING EITHER, for a reason worth keeping.** Measuring off
`stuffFirstResult_()` looks right and is derived from `savedPages_()`, which reads `FAVS` — and
`toggleFav` has already written to it by the time `paintStuff` runs. So the old value and the new
value are the same number. **The strip still standing is the only thing that remembers where the
results used to start**, so the old count is read off the DOM. The probe caught it because it
reports the card it can see rather than the number it expected.

**And the root cause went in the same commit**: the saved things are a column now, so nothing is
ever inserted in front of the results. The shift stays, because `frontPages_()` can still change.

## Saved is a column again, and what changed is that a widget can be starred at all

**Asked for as "add a favourite column so i can see the widgets i favoutited. add the coloumn to the
right of games. after i fabourite it the tile should be filled in."**

**`TABS`'S OWN NOTE LISTS FAVOURITES AMONG THE DEAD**: *"Every column this app has had was
eventually folded into the funnel — Spotlight, Book, Basket, Library, Arcade, Tools, Favourites."*
It went because it was a second way to reach what the funnel already reached. **What has changed is
the half that makes this not that column: a widget could not be starred at all.** Tools and games
are deliberately out of the funnel — the owner's judgement, recorded twice — so there has never been
anywhere to keep a calculator. `favTile_` is drawn on every widget card now, same renderer, same
44px target, same `FAVS` set a question or a tutor is kept in.

**AND THE SAVED PAGES LEFT THE FUNNEL IN THE SAME COMMIT**, because two homes for one list is the
fault this file records under `documents_()`, `factsNow_` and `childrenOf` — and here the second
home was the cause of the bug above. Measured after: starring in Find leaves you on the same card.

**Five places name a screen and all five were edited**: `TABS`, `TAB_ORDER`, `PAGER`, `PAGE`, and a
`<section id="s-saved">` — plus `data/settings/columns.json`, which is the sixth and is what
`applyColumns_` reads, so the column can be reordered or switched off without a deploy.
`check-doors.js` reports 10 screens.

**It starts and stops its widgets like the other two columns.** A starred timer is a running timer,
and `toolsStop_` already exists for the flat battery.

### `.favwrap.is-fav .star` does not exist, and has not for a long time

**The paragraph over `.tile.on` in `style.css` says "FILLED MEANS DONE" and names that rule as what
does it. It is nowhere in the file.** Deleted at some point with the sentence left standing — the
shape this file records under `resource_type` in `VOCAB` and the dead `kind === 'paper'` guard. So a
saved star has been the same outline as an unsaved one on every card in the app, and the only
difference was `.tile.on`'s background at 9% white, which on this ground is invisible. **The
complaint is about the Saved column and the fault was everywhere.**

**Every mark is `fill="none"` stroked in `currentColor`, so the fix is a fill — and it cannot be
every mark.** `tileIcon_` writes the icon's own name as a class now, because a star, a jumper and a
lamp are closed silhouettes that read filled, and the trolley is a body and two wheels drawn as open
paths: filling it paints a wedge between the handle and the basket. Three named rules, and
`.tile.is-buy.on` one line up already says "in your basket" by going quiet. **Screenshotted**, which
is the thirteenth time this file writes that.

## The practicals were written for one learner in one town

**Reported as "it seems you speciallised the practicles for me and my situation. it needs to be more
systematic and uniform like repeatable for anyone."** Measured rather than guessed at, because
"feels specialised" is not something to act on directly. Four things, and only one is prose:

| | |
|---|---|
| **`age_min` on 16 of 57 and `wow` on 16 of 57** | **the same sixteen** — the set that came out of one chat transcript. Two columns on a subset draw two kinds of card down one column: eleven saying "7+ · worth opening a session with" and forty-six saying neither |
| **two practicals named after one town's park and its river** | *Perimeter of Wandle Park*, *Flow rate of the River Wandle*, and five more naming a local landmark in their steps or notes |
| **notes addressing one person and one session** | *"before HE is watching"*, *"This is the one to open with"*, *"THE MOST VALUABLE ONE IN THE SET"* |
| **a practical built around what one house has** | *Fish behaviour logging* |

**`age_min` IS NOT `level` RESTATED, AND THAT WAS CHECKED RATHER THAN ASSUMED.** `level: 'GCSE'`
carries ages **6, 8, 9, 13 and 14** across the sixteen rows that have both — the volcano is GCSE
content about rates and ratio that a six-year-old can pour. So `level` is the spec content and
`age_min` is the youngest child who can DO it, and they are two facts. Storing one as the other
would be the `needs_print` / `print_required` fault this file records three times.

**So the rule is stated and the values are not guessed.** Where nobody has made a narrower judgement
the youngest child is the youngest in the band it is set for, which is `level`'s own lower bound —
41 filled that way, 16 judgements kept, and `tools/practical-uniform.py` asserts it never overwrote
one. **`wow` cannot be derived and is written out one row at a time**: a titration and an
electrolysis are the same level, the same venue and the same subject with completely different
answers to "is there anything to see". Deriving it from a word in the name would be the substring
fault that put a gold *required practical* flag on five cards saying they are not one.

**`cost_per_run_gbp` stays on 8 of 57 and that is the one deliberate gap.** A school owns the kit
and nobody has ever costed a lab practical; `libNum` answers absent rather than nought for exactly
that reason. The count is printed so it is a number rather than a silence.

**`check-practicals.js` fails on a live row with no `age_min` or no `wow`**, refuses any of the six
local names as a closed list — the `ACCEPTED` / `VOCAB` / `RETIRED_FACETS` pattern for the seventh
time — and prints per-column coverage, because a column on a subset is invisible until somebody
opens two cards side by side. **Proved by mutation**: a blanked `wow` and a note reading "Meet at
Wandle Park" are named and exit 1.

**And every one of the thirteen prose edits asserts that it found what it was replacing.** A
replacement that silently matches nothing is the shape this file records every time a rule is
written from the instance that prompted it.

## The quiz is printable, and a new tab is the one surface this app refuses

**Asked for as "the quizes should open in a new tabe where they are printable".** The second half is
built and the first half is deliberately not, so it is worth saying which is which before anything
else: **there is no new tab, and `check-surfaces.js` is the file that says why.** Its own header
argues it out — `window.open` *"asks for pop-up permission, so the first press often does nothing at
all; the back gesture then leaves the app entirely, and whatever was filtered or half filled in is
gone"* — and it names the replacement in the same breath: *"→ `openSheet()`. It is part of this
page, so closing it puts you back exactly where you were, and the browser's own print still takes
it."* It is a rule with a check behind it, so a tab would have failed the build.

**And two tools in this app already print correctly this way.** The cheat sheet and the flyer each
build their paper, append it to `document.body`, put a class on it and call `window.print()`. **So
what was actually missing is the PAPER, not the tab.**

### The screen quiz and the printed quiz are two documents from one row

The screen one is answered with a thumb: four options a fingertip tall, a running score, an
explanation that appears the moment you answer. Printed, every one of those is wrong — a tick box is
not 44px, a score of nothing is not worth ink, and **the explanation is the answer**. That is the
split `questionCard_` and the practical guide already record, one data file along.

**TWO SHEETS, AND THE SECOND IS WHY IT IS TWO.** Page one is the quiz a student writes on and
carries no answer anywhere; page two is the key, with the `why` under each. A tutor prints both,
hands over the first and keeps the second — and printing the first alone is the page range every
print dialogue has. One sheet with the answers at the foot is a sheet you cannot hand to anybody.

**Name and Date on a rule each**, which is the oldest thing on any worksheet and the one a generated
sheet always forgets: a printed quiz comes back and has to say whose it is. **A letter per choice**,
because a printed option is circled rather than pressed and a circle needs something to go round —
drawn from the index rather than typed, so the sheet and the key cannot disagree about which is C.
**Two ruled lines** for a typed answer, because the answer is a word or a number and a box the depth
of the screen one would be most of a page for eight characters.

**Built fresh rather than cloned**, which is the one difference from `mat-print`. That one copies a
sheet somebody has configured on screen, so a *move* would leave the tool broken if the print threw;
this is generated from the row every time and there is nothing on screen to damage.

### The column clips the page, for the third time

`body` is a centred 26.5rem column — about 115mm — with `overflow-x: clip`, so a 210mm sheet inside
the app's own markup starts where the COLUMN starts and everything past 115mm is cut off. The cheat
sheet learned that, the flyer learned it separately, and the note over `.fm-out` says so outright:
*"one of the two printable tools in this app prints correctly and the other does not. Same three
lines, same reason."* Three now, and the same three lines.

**`print` had to be added to `TILE_ICONS`**, because `tileIcon_` falls back to the WORD for a name it
has never heard of — *"visibly wrong, rather than invisible"* — and the first screenshot was a tile
reading `Print` in a row of glyphs.

### 15mm is a measurement, not a margin somebody liked

**At 18mm of padding the two longest quizzes came to 1145px against A4's 1123.** Five questions
whose options wrap — `QZ-CHE-chemical-analysis-GCSE-H`, `QZ-BIO-ecology-GCSE-H` — so the last
question moved to a sheet of its own carrying one line, and `break-before: page` then put the answer
key on page **three**. A five-question quiz on three sheets of paper is not one a tutor prints twice,
and **nothing about that output is wrong**, which is exactly why no other rule here could have caught
it. 15mm of padding, 6mm between questions and 6mm under the header take the tallest to 1103 and
every one of the 162 sheets onto one side of A4.

### `check/cards.js` lays out all 81, because nothing had ever laid out one

**A printed quiz is on no screen, in no sheet, and in no state any instrument here declares.**
`check/ui.js` measures screens; this file measured cards and guides; and `quizPaper_` exists in
`document.body` for the length of a print dialogue and is taken away again. So it joins the file
that already asks "does this content fit the box it is given", with the two questions that had each
already failed once: **does the sheet fit its page**, and **is an answer anywhere on page one**.

**Measured under print media**, because every rule that gives those sheets their size lives inside
`@media print` — on screen `.qz-paper` is `display: none` and every box is zero. It is the last thing
that page does, so nothing measured above it is measured in the wrong medium. **Proved in both
directions**: the old spacing names three quizzes and exits 1, and a `why` pushed onto the question
line names all 405.

### The press harness counted a print the way it counts a request

**`quiz-print` is the first of this app's three print paths the press pass has ever been able to
reach** — `mat-print` and the flyer are both behind a control that is disabled in a container with
no printer — and it came back **quiet**. Correctly, by that check's own reading: `stateOf` hashes
`#s-<id>` and the sheet, and a print's whole effect is outside both.

**So it is counted, exactly as `fetches` already is.** `window.__press.prints` is what the guard's
stub increments, which measures the thing the handler exists to do rather than the few hundred
milliseconds its paper happens to be in the document. **And the stub answers like a real browser**
rather than doing nothing: headless has no dialogue, so a bare `window.print = () => {}` never fires
`afterprint` — and all three print paths take their paper away in that listener, with a four-second
backstop behind it. Left to the backstop, an A4 sheet sits at the foot of `body` across the next
several presses. Dispatching the event is the dialogue being opened and dismissed, which is what a
press is. 99 actions pressed became **104**.

### And the first screenshot was grey, which was the instrument rather than the page

The whole of page one came back a flat grey over cream. Nothing was painting over it: the shot was
taken while `#splash.done` was still running its `visibility` transition, and `opacity` had not yet
reached nought. **A measurement taken at the wrong moment, in the alarming direction this time** —
the entries under `check/load.js` record four taken in the flattering one. Three seconds later both
sheets are the paper palette they declare, and `elementsFromPoint` over the sheet returns the sheet,
the paper, the body and nothing else.

## Twenty-five practicals from a pasted library, and twenty-one that were already here

**A 46-entry practicals file, pasted in with "add these, any that are not already in there".** The
first move was the comparison rather than the import, and it is most of the answer: **21 of the 46
are already in `data/practicals.json`**, under the names this library gave them when the ten home
experiments went in. The red cabbage indicator, the effervescent tablets, elephant's toothpaste,
salt and sand, the steel wool, the electrolysis, the shoebox projector, the scribble bot, the car
speeds, the animal ethogram and all five refusals are the same rows.

**Five more are the LAB version of the same investigation and are deliberately not duplicated.**
The pasted `springs-hookes-law` is PR-PH06, `light-refraction` is PR-PH09, `radiation-cans` is
PR-PH10 — a clamp stand against a spring on a hook, a ray box against an optics kit, a Leslie cube
against three painted tins. Same experiment, different kit, and a home row beside a school row is
two rows that have to agree about one thing: the `needs_print` / `print_required` shape this file
records at 356 rows of disagreement. The kit difference is what `feasible` is for and it is already
on those rows. `area-perimeter-measuring-wheel` is PR-FN09 and `fish-ethogram` is PR-HM10, which is
that row with the fish taken out of it.

**So 25 went in** — 14 physics and engineering, 10 chemistry, 1 biology — as `PR-HM12` to `PR-HM36`.
**79 hazards written out, 3.2 a row**, every one with what you do about it, because
`check-practicals.js` counts a one-line risks cell as a claim rather than a record.

### What is deliberately not imported, and it is most of the file

| | |
|---|---|
| `learner_profile` | an age, a one-to-one home setting, and a list of one child's interests |
| **`sessions`** | **six dated rows carrying a child's first name** |
| `status` / `done_on` | when a particular child was taught a particular thing — the same fact spread over two more columns |
| the notes about one learner | *"he grew hesitant"*, *"confirm he has a tank"*, *"matches his car interest"*, *"before HE is watching"* |
| `inventory` | a record of what the tutor already owns and what each thing cost |

**The sessions block is the `ticks_1/2/3` rule arriving from a new direction.** That entry is about
columns holding the handles of real people, most of them children, in a repository that is public
with permanent history — and it says a tick column reappearing is not untidy, it is a leak. Six
dated rows naming a ten-year-old is the same object with a different column heading.

**This file already recorded the decision once**, when the ten home experiments went in: *"a learner
profile: an age, a set of interests, a first session date... none of it is here. Where a
learner-specific line carried a reusable fact it is written as one."* Same again, and the rule held
without being rediscovered: *"his RC car"* is a remote-control car anybody can borrow, and *"confirm
he has a tank"* was already `feasible` on PR-HM10.

**The writer asserts it rather than the checker alone.** `LOCAL`'s six place names and the learner's
name are both refused in `tools/add-practicals-home-set.py`, at the row that carries them, naming
it — because a rule that lives only in the checker is one the writer can walk past, which is this
file's own sentence about `cost: 0` being repaired in the data and not in the rule.

### One row is written rather than imported, and that is the honest half

**The pasted `heat-pressure` entry carries no method and no science.** Its own note says *"Details
not recorded. Fill in method/science."* Importing it as it stands would be a practical that cannot
be run; **guessing which kit was used would be inventing a record of somebody's session**, which is
the fault this file records under the scatter graph and the curve read by eye. It goes in as
`PR-HM15`, the standard bottle-and-balloon gas pressure practical written out in full, and its
`notes` say outright that it claims nothing about what was done on the day.

### The assertions caught five rows before the checker did

**`maths_link` was missing on five of the twenty-five** and the writer named each one as it reached
it. That is the point of asserting at the writing end as well: `check-practicals.js` would have said
nothing, because `maths_link` is not one of the columns it demands — it is a column the CARD reads,
so an empty one is a silently thinner card rather than a failure. The five are the hand warmer, the
rusting jars, the crystals, the slime and the fountain.

**And the topic names were checked against the tree before a row was written**, which is the
practicals' own oldest lesson: the trundle wheel's `Perimeter and area` read perfectly and joined
one question. Eight candidate names missed — `Averages`, `Scatter Graphs`, `Volume`, `Acids &
Alkalis`, `Light`, `Oxidation`, `Speed Distance Time`, `Gears` — and every one of them had a real
label already in `data/topics.json` saying the same thing (`Averages & Range`, `Scatter Graphs &
Correlation`, `Volume & Surface Area`, `Compound Measures`, `Waves`, `Corrosion`). **No branch was
added**, which is the outcome worth having: the tree's containment pass can take a maths topic away
from maths, and this file records diffing it over the whole library three times for that reason.

### Measured after, through the app rather than off the file

**82 practicals, 234 topic links, every one reaching a branch of the tree.** `check/cards.js` lays
out all 82 cards and opens all 77 live guides in the app's own sheet; `PR-HM20`'s guide is 2,640px
with its eight answer boxes, which is the shape every other guide has.

**And every new one is findable by its own words**, which is the thing that was measured when the
guides went into the haystack:

| typing | |
|---|---|
| `slinky`, `catapult`, `pendulum`, `strawberry`, `electromagnet` | one each, the right one |
| `gear ratio` | the gear build |
| **`supersaturated`** | **the click hand warmer** |
| **`borate`** | **slime** |
| `friction` | 4, led by the car on four surfaces |
| `osmosis` | 2 — the potato cylinders, and the naked egg |

**The last two are the ones worth reading.** Neither word is in a title, a subject or a topic cell:
`supersaturated` and `borate` appear only inside the science paragraph of the guide. That is
`plainText_` doing its job, and it is the difference between a library that holds a practical and
one that can find it.

## The combined-science papers were the wrong board, and nothing in the data was wrong

**Asked as "can you audit the science gcse combined papers. see if i have them all nicely", and then
"did you say edexcel? its supposed to be aqa?"** Both halves of that are worth writing down, because
the audit was right and the answer to the second question is still yes.

**Seven papers carried `subject: Combined Science` and six of them had no questions at all.** The six
Edexcel 1SC0 June 2024 Higher stubs are the best-made rows in the library — spec code, paper number,
tier, the exam date off the cover, 60 marks, the kit off the cover, and a live Drive link — and
`check-library.js` lists all six at the head of its transcription queue. **The blocker is the mark
schemes**: all six question papers are in `newbatch` and there is no scheme for any of them, which is
what stops a transcription rather than merely slowing it. The 2017 Highers are the reason.

**The seventh is `P-AQA-8464P-2306-1H`, and it cannot mark.** 31 questions summing to exactly 70,
which is the paper's own total, so the structure is sound — and **not one of the 31 has an answer**.
Measured through the app: the card draws an answer box, **no Check, no mark scheme**. No `topics`, so
it cannot answer the Topic question; no `month` and no `exam_wave`, so `examWave` comes back `""` and
it cannot answer the Sitting question either. Those are the two facets the funnel narrows to a paper
through. It is one of an older June-2023 AQA batch of three — `P-AQA-8463-2306-1H` and `-2H` are
identical in shape — **116 questions with no answers between them**, none with a source PDF in Drive.

**THE BOARD WAS THE THING NOBODY HAD CHECKED.** Every other science row in this library is AQA — 8461,
8462, 8463, both tiers, and the 41 required practicals — and the six stubs are Edexcel. Read off the
cover rather than the filename, which is the rule that has now caught something three times:
*"Pearson Edexcel Level 1/Level 2 GCSE (9–1) · Friday 10 May 2024 · Paper reference 1SC0/1BH ·
Combined Science PAPER 1 · Higher Tier · The total mark for this paper is 60."* So nothing in the data
is mislabelled; the upload was the wrong qualification. **AQA 8464 Trilogy is six papers of 70 marks
numbered within each subject; Edexcel 1SC0 is six of 60 numbered straight through.** A student on one
sitting the other gets a paper that is not theirs.

### Three AQA 8464 rows, and half a series is not a set

`tools/add-aqa-8464-2406-higher.py` writes the document rows for **June 2024**, every field off the
front cover. **Four of six** at the last upload — Biology 1H and 2H, Chemistry 1H and 2H — with both
physics papers and **a mark scheme for none of them** still outstanding. So this is CLAUDE.md's own
move under *"AQA Chemistry, as two document rows and nothing else yet"*: the paper row is the part
that can be right before anything is transcribed, and it arms the 70-mark rule before there is
anything to check. The run prints how many of the six it holds rather than reporting whatever
arrived as a series, **and a row already in the file is left alone** — the papers come one upload at
a time, and a generator that rewrites what is already there is the fault
`add-aqa-english-skeletons.py` records in full.

**THE FIRST VERSION ASSERTED FRIDAY.** All three covers in front of me said Friday, so the weekday
rule said Friday — and Chemistry Paper 2H is a **Tuesday**, which broke it on the next upload. A rule
written from the instance, which is this file's own sentence about `cost: 0` and `isEdexcelGcseMaths`
for the eleventh time. The table carries **the cover's own day name** now and the date is checked
against that, which is a stronger test than a weekday rule and still refuses a weekend, because no
cover has ever named one.

**`paper` is what the cover calls it**, which is the rule `total_marks` already follows. AQA numbers
within the subject (`Chemistry Paper 1`) and Edexcel numbers straight through the six (`1SC0/1CH` is
*"PAPER 2"*), so the two boards' chemistry papers carry different numbers for one sitting. Both are
true of their own cover, which is the only thing that column can honestly mean.

### And two different papers were drawn on one button

**`Biology Paper 1 — June 2024` is a true name of an 8464/B/1H and of a 1SC0/1BH.** `paperLabels_`
appends *only what differs* — the subject, then the tier — and these two agree on **both**, so it
appended `· Higher` to each and produced **one label over two different papers**. That is the
`Alevel` / `A-Level` fault with the spelling hidden instead of shown, and it would have shipped in
the same commit as the rows that caused it.

**The board is the next rung, and each rung is now pushed only where it cuts the field.** The old
code appended the tier whenever the subject did not settle it, *whether or not the tiers differed* —
noise that still named two things. Three columns in order, each narrowing the field for the one
below. **Diffed over the whole library before it was kept: 2 labels changed of 690**, both of them
the pair that caused it, and the collision is gone.

**It earned itself again on the next upload.** `Chemistry Paper 2 — June 2024` is AQA's 8464/C/2H
*and* Edexcel's 1SC0/1CH, which the 1SC0 covers number as Paper 2 of six — same name, same subject,
same tier, second time. The count stayed at 17 rather than going to 19. And `Chemistry Paper 1` and
`Biology Paper 2` are still drawn as their bare names, because nothing else in the library shares
them: only what differs.

**`check-funnel.js` gained the count, because its existing rule cannot reach these papers.** That one
asks whether pressing a Paper answer leaves questions from one paper — measured on the ITEMS, so a
paper with no questions yet produces none and is invisible to it. 428 papers are in that state.
**Printed, not failed, and the 17 it prints are why**: thirteen are an `RS…` stub beside its own
transcription, which `check-library.js` already counts as the intended state, and four are English
Language stubs carrying no year and, on two of them, **`subject: Maths` on an English paper** — rows
to repair rather than a rule to enforce. What guards the class of fault is the rung. **Proved by
mutation**: the old rungs put back take the count 17 → 18 and name the pair.

**`paperLabels_` had to be exported to the harness**, and the guard is what said so: the first run
printed *"`paperLabels_` is not declared, so paper labels cannot be checked — not a pass"* rather
than a silent zero. A check that cannot reach its subject must say so, which is this file's oldest
sentence about its own instruments.

## Every swipe was pressing whatever it started on

**Reported as "if i scroll down far enough then scroll back up eventually the widgets above
dissappear".** They did not disappear, and nothing was wrong with the pager.

**Measured on the Find screen: twenty-five downward drags, each starting on an answer row.** The
page never moved once. What happened instead was `facet-pick`, `facet-pick`, `facet-pick` — three
more questions answered by the scrolling itself, 5,333 results narrowed to four and then to the
funnel's first question with nothing behind it. The column had not scrolled; it had been emptied
under the thumb.

**The browser fires a `click` after a drag**, on the nearest common ancestor of where the finger
went down and where it came up. That is correct and unavoidable, `pointerup` does not cancel it,
and nothing in this app was asking it to.

**`overworld.js` ALREADY RECORDS WHY THE OBVIOUS GUARD IS NOT THERE.** `setPointerCapture` was
tried and it sent every release to the root so that no card, chip or tick ever answered — *"nothing
threw. The app rendered perfectly and simply stopped answering."* Removing it was right, and it
left the opposite case unhandled: a press that should not have counted.

**So the finger's own travel decides.** Past the same ten pixels the grid uses to tell a drag from
a wobble, the gesture is a drag and the click it produces is swallowed. **Set in `pointermove`
BEFORE the axis is chosen**, which is the half that matters: `axisFree` can refuse a gesture and
stop reading moves — a textarea scrolling, a pad being drawn on — and a drag the grid will not take
is still a drag as far as the thing under the finger is concerned. Cleared by the press it
swallows and again by the next `pointerdown`, so a gesture that ends without a click cannot eat the
tap after it.

### Forty swipes were green over it, because every one of them started on bare card

**`check/press.js` has driven real drags since it was written** and they all begin at the middle of
a pane. That is the `.mat-face` lesson one gesture along: the instrument was right about what it
asked and had never been pointed at the case that breaks. **The new rule starts the drag ON a
control** — the nearest `[data-do]` to the middle of the screen, per column — and wants two things
of it: the page turns, and nothing is answered. **Proved by mutation**: without the mark it reports
`up from stuff from [filter-clear] landed on turned 0 page(s), and answered a question` and exits 1.

## A button that is waiting has to look like it is

**Reported as "sign in page feels very unresponsive even if it is loading".** `send_` has disabled
the button and relabelled it `Checking…` since it was written, and against this backend that label
sits there for about fifteen seconds without moving. **A word that does not move is not
distinguishable from a word that is stuck**, and the reasonable conclusion is that the tap missed —
which is the same reasoning that made `send_` take a button in the first place.

**One rule, on `send_`'s own busy class, so every write in the app gets it** rather than the
sign-in button alone: booking, saving a profile, posting a comment. A ring rather than a bar or
dots, because it is the one shape that cannot be mistaken for content on a button that already
holds a word, and it sits in the button's own `gap` beside the label. `currentColor` at a third, so
the gold button, the ghost and the quiet one are one rule and none of them can go invisible on a
palette nobody has thought about. Measured: `Checking… disabled SPINNER`.

**And the refusal is cleared on the way in.** *"The name or PIN not recognised doesn't disappear
after i just logged in correctly"* — `send_` overwrites it with `Checking…` and `repaint` rebuilds
the card without it, so this is belt and braces rather than the only thing standing between the
two. It costs a line, and the sentence it removes is one that tells somebody who has just got in
that they did not.

## Subject-green was on the booking dropdown, not on the subjects

**Reported as "some subjects are green and some arent... not all subjects seem to be treated the
same for some reason".** Exactly that: `lawList('subjects')` read `dropdowns.subjects` off the
payload, which is **what somebody can be booked for** — Maths, English, the things taught one to
one. `Combined Science`, `Religious Studies` and half the library's subjects have never been in it,
so the funnel drew a column of answers with some green and the rest plain, on a rule nobody could
see.

**A colour that means "this is a subject" is only worth having if it is on every subject.** One
that is on most of them is read as a STATE — available, chosen, already done — and the app never
says which. That is the `cost: 0` shape in a colour: a fact drawn confidently from a column that
does not hold it.

**Retired in `lawList` rather than left to the sheet**, with the reason written where the case was,
because the law that reads it is a row in the `laws` tab and a list nothing answers is a law that
quietly does nothing. Measured against a payload carrying that law and a two-name dropdown: seven
subject answers, **0 green**. If subject-green is wanted back it wants a list of every subject the
library holds, which is the whole reason this is written down rather than deleted.

## Unstarring from Saved took the row out and left the card on the screen

**Reported as "if i favourite something it does appear in right place, but then if i unfavourite it
from the favourites tab its buggy and not responsive. should just dissapear."**

**It never disappeared.** `on('fav')` ended with `if ($('s-stuff')) paintStuff(true)` — it rebuilt
the Find strip and nothing else. So unstarring from the Saved column removed the key from `FAVS`,
toggled `.favwrap.is-fav`, relabelled the tile and repainted a screen you were not on. The card sat
exactly where it was. The only thing that moved was the word on the button, which reads as a tap
that half-worked, because it is one.

**Three cases and they are not the same.** On **Saved** a card IS a page, so removing it removes a
page and the column has to be rebuilt and the position clamped — `repaint(true)`. On **Find** a
star adds or removes a page in front of the question, which is exactly what `paintStuff(true)`
already handles. **Anywhere else** — Tools, Games, a person's card — the card is still correct and
the tile has already changed; what is now wrong is the Saved column you are not looking at.

**So the others are marked rather than redrawn**, which is what `STALE` is for and what
`receipt.js` already does for the booking column. **Redrawing Tools from here would be worse than
the bug**: `paint` replaces the markup, `startScreen_` restarts what was in it, and unstarring a
timer would put it back to 25:00.

Measured end to end: star chess on Games → `FAVS ['w:chess']`; swipe to Saved → the widget is
there; unstar it → the card is gone on the spot and the empty-state card is back.

## The calculator's trig was right and the bracket was the trap

**Reported as "calulator sin cos and tan doesnt really work".** Measured before changing anything:
`sin(30)` is 0.5, `cos(60)` is 0.5, `tan(45)` is 1 — all correct, in degrees, which is what a GCSE
paper wants. **`sin(30` with no closing bracket is `Error`**, and that is the whole complaint: the
`sin` key puts in `sin(` and every calculator anybody has held closes it for them. Press sin, 3, 0,
= on a Casio and you get 0.5.

**Only at `=`, and only the ones left open**, so nothing is added to what is on screen while it is
being typed and a balanced expression is untouched. Measured after: `sin(30` → 0.5, `sqrt(16` → 4,
`2 × sin(30` → 1.

**AND `window.math` IS NEVER LOADED BY ANYTHING HERE.** Measured across `index.html` and every file
in `js/`: nothing fetches a maths library, so the `if (window.math)` branch has never run once and
the hand-rolled fallback is what the calculator has always been. The branch stays — it is the right
thing to use if one is ever added, and deleting it would leave the fallback looking like a fallback
for nothing — but it is written down, because a live-looking branch that cannot run is the shape
this file records under `resource_type` in `VOCAB` and the dead `kind === 'paper'` guard.

## Articulate, and the one piece of the board game that does not survive

**Asked for as "can we add articulate to the games widgets".** You describe a word without saying
it, or a word that rhymes with it, or its initials; your team guesses; thirty seconds.

**The spinner is what does not come across.** On the board the category is decided by where your
counter lands, which is a fact about a board this app does not have — so the category is chosen
instead, which is the same decision one step earlier and is also the screen the widget needs anyway:
six buttons is a first page that explains the game without a paragraph.

**Thirty seconds is the game's own number, and it is why twenty words a category is enough.**
Nobody gets through twenty in thirty seconds, so a round dealt from a shuffled pile never repeats a
word and the deck does not have to be large to behave as though it were.

**No score is kept between rounds.** Articulate is scored by moving a counter, which is a thing the
people playing do. An app that remembered half of that would be inviting somebody to look for the
other half.

**`stop` is not optional and the timer is why** — a round left running on a column nobody is looking
at counts down to zero, and the next arrival finds a finished game it never played. Same reason the
times table and the reel have one. **And the card is drawn from the state rather than patched by
the handler**, which is the `REEL_HELD` rule: a mark put on the element by a press is a mark a
repaint throws away while the state keeps it.

**Its three colours are declared on the component**, the rule the house style states with the chess
board's cream and charcoal: Articulate's six wedges are that game's convention and not this app's.
Six 44px category buttons, in px — sixth conviction of that rule.

## The first screen is the latest post, and the splash bars are scaled rather than resized

**`TAB_HOME` was `stuff` and the owner overruled the argument for it.** That argument is still in
the file and is worth keeping: *"the feed is a noticeboard for a tutoring business; the funnel is
the product"* — true of what the app is FOR, and not the question a first screen answers. A funnel
opens on a question nobody asked yet; the newest post is the business saying something, which is
what a front door is. **`PAGE_HOME.feed` already landed on it** — page 0 is the spotlight when the
business has chosen one and the newest post otherwise — so this is one word, and only for a phone
that has never opened the app: the line below it still remembers wherever somebody was last.

### `height` is a layout property, and these two were changing colour in the same breath

**Reported as "the blue charts leave blue residue behind. same with the ordering animation bar
graph".** Both ran correctly in a desktop browser — measured across a full cycle, the colours cross
blue to green and back and every bar moves in every frame. So there was nothing to see here, and
the complaint was still right.

**Measured across the whole stylesheet: nine keyframes animate a layout property, and `mn-level`
and `so-swap` are the ONLY two that animate geometry and colour together.** That is the shape that
smears — the region to invalidate and the colour to paint are both moving, on the main thread,
during boot, which is exactly when that thread is busy parsing 566 KB of JavaScript.

**`transform: scaleY()` is the same picture without the layout.** The compositor owns it, the box
never changes size, there is no region to invalidate — and `index.html`'s own defence of the
splash, that it keeps moving while the thread is busy, becomes true of these two rather than merely
claimed. `--h` is a fraction of the row now rather than a length, because a transform takes a number.
Measured before and after at seven points in the cycle: **the bar heights are the same to the
pixel.**

**The other seven are left alone**, deliberately: none of them changes colour while it moves, and
changing seven animations on a report about two is the fix that costs more than the fault.

## The round counter was a scoreboard for a game with no score

**Reported as "herd mentality shouldnt be that 20 question round thing. should be much simpler,
just questions on random. and random each time."**

**The deal was already random.** Fisher-Yates, reshuffled at the end — the note over `herdShuffle_`
even explains why the `sort(() => Math.random() - 0.5)` trick is the famous wrong one. What was
wrong is that the card printed **`3 of 20 · round 2`** underneath, which turns an endless deal into
a twenty-question test you are part-way through. **A number on screen is a claim that the number
matters**, and this one never did: Herd Mentality has no score in the app, because the scoring is
people arguing about who matched.

So the count is gone and the deal is untouched — and the bag stays a bag rather than becoming a
pick-at-random, because picking at random repeats, and a question you have just answered coming
straight back is the one thing that reads as broken.

## Articulate and Charades are one round with two decks

**Asked for as "add cherades widget game as well... idk whats difference between cherades and
articulate in this case to be honest."** It is a fair question and the answer is what decides both
decks:

| | |
|---|---|
| **Articulate** is **described** | you may say anything except the word, a rhyme and its initials — so its deck can hold an abstract noun: `stage fright`, `a lighthouse keeper` |
| **Charades** is **mimed** | no words, no sounds, no pointing at the room — so every entry has to be something a BODY can show. **An abstract noun is a dead charades card** |

**That is why the decks differ and why the round is the same.** `ROUND_GAMES` is the engine and
`secs`, `deck` and `say` are the only three things that differ; a second copy of *deal a word, count
the clock, keep score* would be the `documents_()` fault in a fourth costume. **Sixty seconds rather
than thirty**, and that is not a preference: a mime takes longer to read than a sentence does, and
thirty is Articulate's own number where charades has never had one.

**And the six category buttons went.** *"Less friction if it just decides topic and the thing."* A
menu between somebody and a party game is a decision nobody wanted to make — and on the board the
category is decided by where your counter lands rather than by choosing, so random is closer to the
game than the menu ever was. The chip on the card still says which came up, because you have to
know what you are describing. **One state per game, not one shared**: both cards are pages of the
same column and can be on screen at once, and a single state would have the second wiping the
first's clock.

## corbettmaths.com is unreachable, and the URL pattern is the answer at the other end

**Reported with three real URLs and "the url of the files themselves follow a pattern. cant you use
this to extract all of the questions from this site?"** The pattern is real and useful. What stops
it is not addressing:

```
curl  https://corbettmaths.com/.../Jan-Foundation_Part1.pdf  →  CONNECT tunnel failed, 403
WebFetch same URL                                            →  EGRESS_BLOCKED
```

**Every host but GitHub and the MCP endpoints is denied at the proxy**, which this file already
records four times about Google and once about github.io. A pattern cannot help with a connection
that is refused before a path is ever sent.

**Where the pattern DOES help is at the owner's end**, and that is worth writing down rather than
just saying no: a loop over the pattern downloads the set in one go, and **the Drive connector is
not blocked** — which is how every other paper in this library arrived. The route is download,
drop in a Drive folder, and the transcription happens here exactly as it does for AQA.

## A hundred herd questions, and ten of them were thrown out by a reviewer told to refute

**The decks were written by one agent each and then attacked by another**, whose instructions said
a clean report over a deck with a bad card in it is worse than no review. It earned it: **24 of the
290 cards were faulted**, and every one of the faults is a rule this file already states in another
context.

| | |
|---|---|
| `Name a colour.` · `Name a shape.` | **nothing to decide.** Blue, and circle-or-square. A herd question with one dominant answer is not a question, because there is no herd to match |
| `Name something you would find in a library.` | exactly one answer — books |
| `Name a reason a train is late.` | rewards knowing rather than guessing, and splits the adult in the room from the child |
| `Name a school trip everybody goes on.` · `Name a pudding they serve at school.` | **the rule about never asking a child what their family has**, in a costume. A trip costs money and "everybody goes on" is false out loud in front of a parent |
| `trying to do a handstand against a wall` | **charades is MIMED, so the mime of a handstand IS a handstand** — in somebody else's front room, beside the furniture. The sharpest finding in the set |
| five quiz shows | a desk and a buzzer mime as nothing |
| `The Snowman` | a Christmas card dealt in June, and a 26-minute television animation filed under Film |

**Four were near-duplicates of a card three places above them** — `a ventriloquist` beside `a
puppeteer` ("puppet" is the first clue either describer says, so the team shouts the other card),
`cartwheeling` beside `somersaulting`, `Name a musical instrument` beside `Name an instrument that
is loud to practise`.

### The one it found that nothing else could have

**`Countdown` was in the charades TV deck and `a countdown` is in Articulate's Random.** The two
games are **pages of the same column**, so the same word could be dealt twice in one sitting — once
to describe and once to mime — and the second time the room already knows the answer. The reviewer
flagged it as pre-existing and supplied no replacement, which is the right call for a judgement.

**It is a rule now rather than a repair**, which is this file's own sentence about `cost: 0` for the
twelfth time: `check-widgets.js` reads both decks out of `games.js` and fails on a word in both,
comparing with a leading article stripped because `a countdown` and `Countdown` are the same word to
a room and different strings to a checker — the `spellKey_` argument one file along. **A deck it
cannot read is a failure too**, not a pass, because *"I did not manage to look"* printed as *"I
looked and it was fine"* is this repository's oldest fault. **Proved by mutation**: put `Countdown`
back and it names both sides and exits 1.

**And a double comma made an array hole.** The splice left `'…breaks.',,` — which is an elision, so
`HERD_BUILTIN.length` was **101 with a `null` at index 20**, and the deck would have dealt a blank
card roughly once a hundred taps. Caught by counting the deck in a real JS engine rather than by
reading the diff; `100 / 180 / 150, unique, no holes` is the check that found it.

## The home-screen app loads itself now, and three separate guards stop it looping

**Asked for as "can you make it so added to homescreen version will always be up to date?"** The
banner was the whole answer while the only safe thing to do was ASK — and in an installed app that
is a sentence somebody has to notice and tap on a screen they opened to do something else.

**The reason it only asked is four lines below the function, and it is not a small one.** `purge()`
called `location.reload()` and became an infinite loop the day the site installed a worker of its
own: register, purge, reload, register — for every visitor, with the app never finishing opening.

**So the three things that make that impossible here, each doing a different job:**

1. **It cannot loop**, because the reload is remembered against the TAG it was for. `purge`'s loop
   was unconditional; this one has a fact to compare against, so a build that reloads and still
   reports a different tag reloads **once** and then asks. `sessionStorage` rather than
   `localStorage`, so it survives the reload and dies with the window.
2. **Only on a resume, not an app-switch.** Six minutes away is somebody opening the app again;
   twenty seconds is somebody answering a message, and reloading under them is taking the screen
   away from somebody using it.
3. **It never throws anything away.** An answer box persists on every keystroke and the notepad
   saves as you type, so both are safe to reload over. A message being composed, a comment being
   written, a profile being edited are not — anything typed and unsaved holds the reload and gets
   the banner instead.

**Measured in five states**, against a server whose ETag I could change by hand: no deploy and long
away → nothing; a deploy 20 seconds away → the banner, no reload; a deploy 15 minutes away → it
reloads onto the new build; **a deploy 15 minutes away with something typed → it holds and shows the
banner**; and a reload followed by two more resumes that still report a different tag → **zero extra
reloads**. The fourth of those was wrong the first time I measured it and the probe was at fault
rather than the app — the only textarea on that fixture is the notepad, which is exempt, so the
guard was never exercised until I typed into something that is not.

## Corbettmaths 5-a-Day is its own category, and that is a `document_type`

**Asked for as "its its own category, not to be confused with the other corbet maths work which is
like topic learning. this is 5 a day. so i hope its navigated to sensibly in the finder."**

**A worksheet and a 5-a-day are the same publisher and the opposite shape.** A worksheet is thirty
questions on ONE topic, worked through once. A 5-a-day is five questions on five DIFFERENT topics,
sat in ten minutes, every day of a month. `document_type` is what the funnel's Type question reads,
so making `5-a-day` a value there is what puts the two in different answers instead of one pile —
and the navigation is then machinery that already exists: **Type → 5-a-day, Tier → the level,
Paper → the day.**

**`Foundation Plus` and `Higher Plus` joined the `tier` vocabulary**, and they are not exam tiers —
the boards have two. They are in that column for the reason `total_marks` is a cell: **the paper
declares its own level**, and filing a Higher Plus under `Higher` would fold a set aimed past grade
9 into the tier below it, which is a wrong answer on a chip rather than a missing one.

**One document row per DAY**, because a day is the thing somebody sits — 31 rows a level, five
questions under each. And five columns are **deliberately absent**: `exam_board` (Corbettmaths is
not a board), `year`, `month`, `exam_wave` and `exam_date` (a 5-a-day has no sitting), `paper` (its
vocabulary is 1–6 and a day is 1–31), and `total_marks` — **nothing on the sheet says what it is out
of, and inventing one would arm a check against a number nobody printed.**

## The periodic table is a link, because a document row is not an item

**Asked for as "add the periodic table to resouces".** It is AQA's own insert — *Insert (Foundation;
Higher): periodic table, November 2020*, read off the file rather than the filename — and the same
table AQA prints for Combined Science Trilogy and for Chemistry 8462.

**THE OBVIOUS HOME IS THE WRONG ONE, and it is worth knowing why before somebody tries it.** A
`kind: 'document'` row in `data/questions.json` looks right — it is a paper-level thing with a
`source_url`. It would be **invisible**: `questionItems` filters `kind !== 'document'`, so a
document row is where a paper-level FACT lives and is never an item in the funnel. A periodic table
filed that way is a row nobody can reach.

**So it is a link**, which is already a kind the funnel carries — 126 of them, in 25 categories,
each with a name, a category, a URL and a description. One row in `data/settings/links.json`, no
deploy needed for the next one.

**And the sharing was checked before the row was written**, because a link a student cannot open is
worse than no link: `{"role":"reader","type":"anyone"}`. CLAUDE.md already records the 1,508 Drive
links being sampled for exactly this.

### 115 of the 127 links carried a description nothing could search

**Measured while adding the row.** The haystack in `stuffFind` is
`name + sub + subject + slot + grade + text`, and a link had no `text` at all — so it was findable
by its title and by nothing else.

| typing | before | after |
|---|---|---|
| `atomic mass` | **0** | 1 |
| `past papers` | **0** | 3 |
| `chemistry` | **0** | 1 |
| `revision` | 1 | **7** |
| `science` | 3 | **5** |

**`past papers` returning nothing is the tell** — that list holds four sites that are nothing but
past papers, and not one of them has the words in its name. **Fourth occurrence of this exact
sentence in this file**, after `topics`, after `company` and after the practical guides: the words
are in the row, the search box cannot see them, and a screen whose whole job is finding things
returns nothing for the thing it holds.

**The category is in the haystack too**, because `science` and `revision` are what somebody types
when they cannot remember what a site is called, and the category is the only place either word
appears. Built onto the item rather than matched per keystroke, which is what those three notes
also say: `stuffItems` is memoised and runs once, `stuffFind` runs on every letter.

## A line of best fit slid the whole column sideways

**Reported as "when i try draw a line of best fit it slides the whole widget to the left and becomes
hard to do".** Reproduced on the first try with real touch events: a stroke across a scatter graph
with the pen on carried the app from `stuff` to `dm`, and the mark was kept, on the wrong screen.

**`touch-action: none` STOPS THE BROWSER AND NOT THIS APP, and that is the whole of it.**
`.qpad.is-drawing .qpad-ink` has carried it since the pen was written, and the note over that rule
is right about what it does. **The grid's swipe is a `pointermove` listener on the window.** It never
asks the browser for a scroll, so no `touch-action` anywhere can refuse it — and a line of best fit
is precisely the stroke that travels furthest sideways.

**`axisFree` already names the list**: `select, [data-noswipe]`. So the pad says the same sentence to
the app that the stylesheet says to the browser, and it says it in the one place both readers of
that list already look — rather than a third selector for somebody to keep in step.

**Only while the pen is on**, which is the stylesheet's own argument one rule up: a picture you
cannot swipe past is a picture that traps you on it, and every question card carrying a diagram
would become a page with no way off. **Measured both ways**: pen on, the stroke is kept and the
column does not move; pen off, a swipe left over the same picture still changes column.

**And the mode is drawn from `PAD_ON` now rather than left on the element by the press.** A repaint
rebuilds the card, so the class the tap added went with it while the state stayed — leaving the pen
taking the finger with no gold frame, no `touch-action` and no `data-noswipe`. That is the
`REEL_HELD` fault for a second time, on the surface where it is least visible.

### The instrument said nothing, twice, and the second time it was the state

**`check/press.js` has driven real drags since it was written and every one starts on bare card.**
It also drives real TOUCH events, added for the blanket `pan-y` on every textarea — and that pass
walks a named list of surfaces that carry their own touch behaviour. A pad is not on it, because a
pad's problem is not that it keeps a gesture it cannot use; it is that it cannot keep one at all.

**So the contract is the fault's own shape**: press `Draw on it`, stroke across the picture, and want
two things — the stroke is kept and the column has not moved — then turn the pen off and want the
opposite. Proved by mutation: without the attribute it names the column it slid to.

**And the tap that turns the pen off has to be a REAL tap.** `el.click()` reported the pen stuck on,
and the app was right: the stroke before it set `PRESS_MOVED`, and a synthetic click cannot clear
that because nothing sent a `pointerdown` first. On a phone a tap always does. A harness artefact
reported as an app fault is the shape every entry under `check/load.js` already records.

## The remembered tab outlived the app being opened

**Reported as "the latest post isnt the defualt opening widget for some reason still. im opneing on
phone. after having added to homescreen".** `TAB_HOME = 'feed'` was already set AND already
deployed, which is what made this confusing. What beats it is the line under it, which remembered
whichever column you were last on — for ever.

**BOTH HALVES ARE REAL AND THEY ARE NOT THE SAME EVENT.** Opening the app is opening the app, and
landing on a funnel question nobody asked is the argument `TAB_HOME` records. A RELOAD is not that:
`reload-build` reloads the page under somebody the moment a new build lands, and losing the question
they were reading would be the fix costing more than the fault.

**So the id is stamped with the moment it was written and honoured only while that moment is
recent.** The number is `AWAY_AGAIN` — six minutes — which is not a new one: `checkBuild_` already
asks exactly this question about a resume, and its own note says six minutes is past any
notification and well short of "I opened this tomorrow morning". It moved up beside `TAB_HOME` so
there is one number rather than two, which is the `needs_print` / `print_required` lesson.

**NOT `sessionStorage`, and the reason is the home screen.** An installed app on iOS is SUSPENDED
rather than closed — the note over `watchBuild_` records that in full — so a window left open for
three days is still one session and a session flag would never expire. A stamp is a fact about time
and does not care how the window got here.

## Messages poll, and the Refresh card was a page with no message on it

**Reported as "when you do recieve a message you shouldnt have a refresh messages widget. it should
already be contantly up to date. synced or whatever".** The button was worse than redundant: it was
a PAGE. `dmPages_` opened with a card holding a heading and one control, so the first thing on the
Messages column was a card with nothing on it — which is why `PAGE_HOME.dm` existed at all, an entry
whose only job was hiding something nobody wanted. Both are gone in the same commit, because an
entry left behind would open the column on the SECOND conversation for ever.

**WHAT "SYNCED" CAN HONESTLY MEAN HERE IS POLLING.** The backend is Apps Script behind a `doPost`;
there is no socket and no push channel, and a badge that updated without asking would be a sentence
this app cannot keep. So it asks — **every twenty seconds while the column is on the screen**,
started from `startScreen_` and stopped in `paint` beside the camera, the widgets and the reels,
which is the list that exists for exactly this. `messages` is one tab read rather than the whole
payload, so this is nothing like `installWarmTrigger`.

**And it will not repaint under a reply somebody is typing.** `paint('dm')` rebuilds the markup and
the composer is in it. The data is updated either way; only the redraw waits, and it happens on the
tick after the box is empty. Asked of the DOM rather than remembered in a flag, which is what
`msg-send` and `me-save` already do.

**A FINGERPRINT RATHER THAN A COUNT decides whether to redraw.** A message being marked read changes
no count and changes every badge on the column, so the test is id-plus-read-state per message —
which is exactly what the cards are built from.

### And an empty inbox finally says which empty it is

**`loadMessages` leaves `MESSAGES` alone on a failure** — deliberately, so a blip does not read as
everything having been deleted — so a first fetch that never arrived drew *"Nothing yet."* over an
inbox nobody managed to read. **This repository's oldest fault, on the one screen whose whole job is
telling you somebody wrote to you.** `MSG_FAILED` is the fact `MESSAGES` cannot carry, and it is why
the retry button now sits on the failure and nowhere else: a genuinely empty inbox is being re-asked
every twenty seconds and needs no button.

## Two players, one phone — and Connect 4's board had been a black stripe

**Reported as "connect 4 should be not against pc but 2 player. also its blacked out right now"** and
**"othello looks a bit shit. the black blends with the backgorund. do red and blue and dont show the
locations players can pic. also should be 2 player not against cpu".**

**THE BLACK STRIPE IS A DELETED CSS RULE AND GIT NAMES THE COMMIT.** `.c4 { grid-template-columns:
repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); aspect-ratio: 7/6 }` went in *"A board square
cannot be 44px, and the arithmetic is the reason"*, which rewrote the block around it and took the
`.c4` half with it. `.oth` kept its own and has been fine throughout.

**A grid with no template is one column of 42 rows**, each `auto`, and a `<button>` with `height:
100%` has no intrinsic height — so every row collapsed and what was on screen was the board's own
`background: var(--line)` and 3px of padding. **Nothing threw, nothing overflowed, and `check/ui.js`
measures tap targets and sideways scroll rather than whether a box has a size at all.**

**And the comment survived the rule it describes**: *"7:6 AND 1:1 BECAUSE THAT IS WHAT THE GAMES
ARE"* was still sitting over a block that only said 1:1. Same shape as `.favwrap.is-fav`, as the dead
`kind === 'paper'` guard, and as `resource_type` in `VOCAB`.

**TWO PLAYERS MEANS TWO EQUAL COLOURS, and that is why gold left both boards.** Gold against `--dim`
and gold against `#15130f` was right while one side was YOU and the other was the machine — gold is
what this app means by yours. With two people at one phone there is no "yours", so a bright side and
a faded side reads as one player being switched off, and a near-black disc on a near-black card is
not a disc. Connect 4 is red and yellow because that is what is in the box; Othello is red and blue
because that is what was asked for. **Declared on the component**, which is the rule the house style
states with the chess board's cream and charcoal.

**THE LEGAL-MOVE RINGS WENT AND THE ARGUMENT FOR THEM DOES NOT SURVIVE A SECOND PLAYER.** They were
defended as teaching — Othello's legal moves are not obvious — and `othMoves_(cells, 1)` is one
side's answer drawn on a board the other side is reading. Working out where you may play IS Othello.
**Every empty square is pressable now and an illegal one says why**: it was `disabled` unless it was
legal, which is the ring in another form, and a screen reader would have heard the same list. A press
that does nothing at all is what `check/press.js` exists to report.

**Both opponents are deleted rather than switched off.** A dormant AI behind a flag is a second mode
nothing presses, which is `orderPrints`; the three rules Connect 4 used are four lines somebody can
write again if a solo mode is ever wanted, and they are kept in prose where the code was.

## The reel had several seconds of gradient and it read as broken

**Reported as "the reel isnt loading. or it takes long to load".** Measured with `ffprobe`: the two
clips are **576×576, 104 and 92 seconds long, 7.3 MB and 7.9 MB**, at 450–585 kbps of video. So the
wait is real, and what was on the screen for all of it was `.feed-art`'s gradient with a letter on
it. **A column whose whole content is a video, showing no video, does not read as *loading*. It reads
as *broken*** — this repository's oldest shape wearing a stopwatch.

**A POSTER IS ABOUT 20 KB AND IT IS THE CLIP'S OWN FIRST FRAME.** `x.mp4` beside `x.jpg`, derived by
`feedSlide` from the clip's own path, so there is no column to fill in and nothing to spell wrongly —
the `images` argument against a numbered column, one step along. Only for a path: a Drive id has no
poster to derive and an absolute URL is somebody else's server. **A poster that 404s draws nothing**,
which is exactly what the slide did before, so it degrades to the old behaviour rather than to a hole.

**`has-photo` ARRIVES WITH IT**, and only where there is one. The note over `reelPlay_` says why that
class waits for `loadeddata` — the scrim and the white words over a slide that is still its own
gradient are furniture for a picture that has not arrived. A poster IS the picture arriving.

**WHAT WOULD ACTUALLY SHRINK THEM IS NOT DONE HERE.** Re-encoding at 540×540 was measured at 4.3 and
4.6 MB — **42% off** — and it is a lossy edit to somebody else's footage. That is a decision for
whoever shot it, so the command is in `data/reels/README.md` rather than in the repository. **The
bigger win is shorter clips**: a reel is a format, and thirty seconds of either of these would be
about 2 MB with nothing re-encoded.

**`check-reels.js` counts the posters** and prints which clips have one rather than refusing a clip
that does not: a reel with no poster works, it is simply slower to look like something.

## Four hundred facts, and the fifty-eight that were there were in the wrong file to matter

**Asked for as "have you added the other many interstting facts? i asked for 400 last night".** They
were not there. `data/settings/facts.json` held 58 and `FEED_FACTS` in `js/chess.js` held the same 58
plus the two clips — a duplicate this file already records.

**WHICH FILE IS LIVE IS NOT THE OBVIOUS ONE, and getting it wrong would have shipped nothing.**
`factsNow_` prefers `DATA.facts` and falls through to `FEED_FACTS` only when the sheet has nothing;
`settingsInto_` fills `DATA.facts` from the JSON file, which has rows. **So a fact added to the
JavaScript list alone is a fact nobody ever sees.** The file is the source and `FEED_FACTS` is the
floor for a phone whose data files did not arrive — `libraryExtras_`'s rule pointed the same way,
now written down in `chess.js` so it is not rediscovered.

**`tools/add-facts.py` is the writer and it is idempotent on the heading**, so a batch can be added
to and re-run without the ids shifting or the facts doubling. Every row asserts its own shape as it
is written: a heading short enough for `.feed-head`, a body that is prose, a `pic` that is two or
three ordinary words naming the SUBJECT rather than the sentence.

**THE HEADING IS THE FACT.** `.feed-head` takes the space and `.feed-body` is small, so a heading
that teases with the answer underneath makes a card you have to work for. The body says why — the
mechanism, the number, what it means.

**Six subjects were added to the sixteen already in use** — Food, Maths, Music, Science, Sea,
Weather — and `feedColours` hashes whatever word it is handed, so a new one costs nothing and gets
its own pair of colours. **Which is exactly why there is a closed list**: nothing anywhere would
notice `Sport` beside `Sports`, and two spellings of one answer are two buttons, which is
`spellKey_`'s whole argument one file along.

**`Study` is the subject a tutoring app has a reason to be opinionated about**, and it went from
three rows to fifteen: testing beats rereading, spacing beats cramming, mixing topics up feels worse
and works better, highlighting is close to useless on its own.

### The rules live in the check as well as in the writer

**`tools/add-facts.py` asserts all of it at the other end and that is not enough**, which is the
sentence `check-quizzes.js` already carries: a file can be hand-edited, appended to by another
script, or written by a version of the tool that has since changed, and a rule living only in the
thing that produced the data is a rule nothing enforces about the data.

**Two duplicate headings is the deck repeating itself**, which is the one thing that reads as broken
— and it is invisible from everywhere else: a duplicated fact measures perfectly, lays out perfectly,
and is a bug you notice on the fourth tap. `check-settings.js` fails on a repeated heading, a
repeated `fact_id`, a subject off the list, markup in a fact, and a heading too long for the card.
**Proved by mutation** in both directions.

**Measured in the app after**: 400 facts, 22 subjects, 60 deals with no repeat, and the two clips
still answering `clipsNow_` from the code because the file holds no clip rows — which is the
per-list rule working exactly as its note says it should.

## George had not disappeared — the phone was deleting him after the server had sent him

**Reported as "where did george dissapear off to?"** and nothing had gone wrong with his row. He is a
tutor, his `listed` cell is off, and `accountPages_` read
`.filter(t => t && t.title && t.listed !== false)` — so an unlisted tutor was dropped **on the phone,
after `doGet` had deliberately sent him.**

**`doget.gs` ALREADY DECIDES THIS AND SAYS SO OUT LOUD**, beside the gate that does it: *"An admin
sees the unlisted ones too, marked. Without that a tutor switched off vanishes from the site and can
only be switched back on in the spreadsheet — which would make the control worse than not having
one."* The rule was written twice and the two disagreed. **That is the `MESSAGING` fault** — a policy
copied onto the phone is two rules to keep in step — and here the copy silently won, on the one
screen that can switch him back on.

**IT MADE THREE THINGS UNREACHABLE THAT WERE ALREADY BUILT.** `findCard` draws such a row dimmed with
`· not listed` beside the role, `.card.is-widget.is-off` and `.prof-off` are in the stylesheet, and
`asItem_` three lines below the filter sets `off: t.listed === false`. None of them could ever run,
because the row never arrived — a renderer left standing over a permanently false condition, which is
the shape recorded here under `resource_type` in `VOCAB` and the dead `kind === 'paper'` guard.

**The server is the gate and stays the gate**, which is what makes deleting the clause a repair
rather than a disclosure: a non-admin is never sent an unlisted tutor, so there was nothing here to
filter. **Measured on two payloads**: an admin gets 3 pages with George dimmed and labelled, a parent
gets 2 and no George anywhere. Proved by mutation — the old clause back, and the admin gets 2 pages
and no George.

### The fixture's one tutor is listed and has a DBS, so two states had never been drawn

**`check/fixture.json` has a single tutor, `listed: true`, `dbs: true`** — so the account column this
lab has measured on every run is the one where every row is live and every stamp is green.
`.prof-dbs.no` and `.prof-off` had **never been on a screen it looked at**, which is the same hole the
booking receipt, the message thread and the basket were each in.

**The state found a real fault on its first run**: `· not listed` at `#b9544a` is **4.15:1 against
`--bg`**, under WCAG AA's 4.5 for small text — the one word on the card that says why it is dimmed,
and the hardest thing on it to read. `#c4655a` is 5.02:1 and the same hue.

**Repaired as a token, not at the instance.** That hex was written out twice — `No DBS on file` and
`· not listed` — so fixing the one the check happened to name would have left the other wrong in
exactly the same way, which is the `cost: 0` sentence for the thirteenth time. `--prof-warn` is
**declared on `.is-prof` rather than at `:root`**, because it is this card's own word for "something
is not right here" and nothing else in the app should be offered it — the rule the house style states
with the chess board's cream and charcoal.

**The page number comes from `accountPages_()` itself**, not from a second re-derivation of `others`
in the harness: `termsPages_()` is concatenated after the people, so counting from the end lands on a
legal document. That is the flyer state's own lesson — two readings of one list — one screen along.

### Asked again, and this time the answer was in the cell rather than in the code

**Reported as "Where's George I still don't see him on my site."** The fix above landed on `main` at
14:53 the day before, so the obvious reading is that it did not work. **It does. Every link in the
chain was measured this time rather than read, and the last one is a spreadsheet cell.**

| | |
|---|---|
| the front end | `accountPages_` and `stuffItemsRaw_` both filter on `t.title` and nothing else — the `listed` clause is gone from both, and it is on `main` |
| **the sheet** | **`listed` on P002 is `FALSE`.** Read through the Drive connector, positioned against the header rather than off a collapsed snippet: column 55 of 75, blank on the other tutor and on the admin |
| his role | `tutor`, so `hasRole(r, 'tutor')` passes and he is a candidate at all |
| the server | `(listed \|\| viewerIsAdmin)` — so he is sent to an admin and to nobody else |
| **`viewerIsAdmin`** | `isAdminPerson(S(p.name))` → `findPerson` → `hasRole(p,'admin')`. P001's role is `admin`, and **both** the boot fetch in `index.html` and `load()`'s own fallback send `name=`, which is the fault `shell.js` already records having fixed |
| the switch | `set-listed` → `setListed` in `dopost.gs`, access-listed `admin`, writing that same cell |

**SO NOTHING IS BROKEN AND THE CONTROL IS WORKING AS DESIGNED.** `listed: FALSE` is a tutor switched
off, which is what that column is for; he is drawn for an admin only, dimmed, with `· not listed`
beside the name and a `Not listed` tile under it reading *"clients cannot see them"*. One tap on
that tile is what puts him back on the public site.

**AND THE TAP IS THE RIGHT ROUTE RATHER THAN THE CELL**, which is worth saying because editing the
sheet by hand looks equivalent and is not: `setCell` sets `POST_WROTE` and retires the six-hour
payload immediately, where a cell typed by hand reaches the site only if `onSheetChange` is
installed — the trap this file records under "the cache, and the trap in it".

**What could not be checked from here is the one thing that never can**: which build that phone is
running. Every host but GitHub is blocked, so a live open is the owner's to do — which is what the
build stamp on the You screen and the reload banner are both for.

#### The DBS is not why he is hidden, and nothing anywhere ties the two

**Asked as "even if he doesn't have a dbs he should still be listed", which is right and is already
how it works.** `dbs` and `listed` are two independent cells read by two independent lines —
`dbs: TRUE_(r.dbs_checked)` and `listed: ON_(r.listed)` — and the gate at `doget.gs:541` reads only
the second. Measured across `js/` and `backend/`: **nothing anywhere reads a DBS to decide a
listing.** The only two writers of that cell are `setListed`, which is the tile, and
`makeBrandAccount`, which touches the brand row alone and only when the cell is blank. So the
missing DBS did not switch him off; somebody or something wrote `FALSE`, and the remedy is the tap.

**WHAT THE TAP PUBLISHES IS WORTH NAMING BEFORE IT IS PRESSED, because it is a public statement
about a named person.** Rendered as an admin against a row shaped like his — `listed: false`,
`dbs: false` — his card draws dimmed, `· not listed` beside the role, and **`No DBS on file` in
red**. Listed, the dimming and the words go and **the red stamp stays**, on a card clients can see.
That is `findCard`'s own decision and its note defends it outright: *"a pass without one is visibly
a pass without one, which is exactly the right amount of alarming."* It is right for somebody a
parent is checking, and it is not a side effect of anything in this commit — so listing him is a
choice to show that stamp, not a way round it.

**And the tile is a sibling of the card rather than a child of it**, which is how the first probe
came back reporting no tile on a page carrying two. `cardTiles_` returns its own row, so a selector
scoped to `.card.is-prof` finds nothing and reads as the control being absent — the shape this file
records every time an instrument cannot reach its subject. Measured properly: `set-listed` once per
tutor, `data-who` the display name, and `isAdmin()` true.

## Chemistry Paper 1 is a replica of the paper now, both tiers

**Reported from inside the exam**: *"im doing chemistry paper 1 now and there are already places
where there are no diagrams like question 1a and so on... i want it to be a replica of the actual
exam."* 01.1 is four boxes of atoms and the question is *which box is a pure compound* — a question
about a picture you cannot see is not a question, which is the fault this file records under *"on
the app it's just text"*.

| | |
|---|---|
| **8462/1F** | 15 figures onto 21 rows |
| **8462/1H** | 5 figures onto 6 rows, two of them the Foundation paper's own builders |
| | **every figure row on both tiers is drawn** — the library's backlog went 737 → 707 |

**MEASURED OFF THE PAPER, NOT WRITTEN FROM THE PROSE.** Every figure in these two PDFs is an
embedded raster PNG with no text layer and no vectors, so the four that CARRY DATA were read in
pixels — the rule this file already sets for a picture that decides an answer. Figure 1's atoms were
split out of the touching molecules by a distance transform (A 12, B 6, C 10, D 12); Figure 5's
three numbered burette ticks at y = 199, 327 and 455.5 px with the meniscus at 275.5 give
16 + 76.5/128 = **16.60, which is one of the paper's four options and no other**; Figure 6's corner
is 0.80 g, which is 03.4's answer; Figure 7's crosses were found as connected components.

**THE TIER OVERLAP IS PROVED RATHER THAN CLAIMED.** AQA prints the same picture on both tiers, so
`fig14` gained three label arguments and `check()` asserts BOTH shared builders still reproduce,
byte for byte, the diagrams already committed on the Foundation rows. **The first run of that
assertion failed** — the refactor had changed the aria-label and the height by five units, and
nothing on screen would have said so. Same move as the `libraryExtras_` cutover and `svgplot.py`:
prove it identical, then make it.

**AND THE ARROWS ON FIGURE 8 WERE BOTH WRONG.** Four reaction profiles differing in exactly two
things — where the products sit and which way the arrow points — which is the whole of 08.2. The
arrowhead was drawn with its base on the wrong side, so all four pointed at the level they started
from; and `down` was written as reactants-to-products rather than as a direction on the page, so C
and D came out identical. **Two profiles that are the same picture is a question with two right
answers.** `check()` refuses a set where two differ in nothing, and B is asserted to be the only one
that is both exothermic and labelled downwards. Thirteenth time this file writes that a screenshot
is the last word on a drawing.

### The prose that stood in for the pictures had to go with them, and five rows handed over the answer

**THIS IS THE HALF THAT MATTERS MORE THAN THE DRAWINGS.** Every one of these rows was transcribed
with the figure written out in words, because the figure was not there. 01.1 said *"D — four
molecules, every one of them white-black-white"*, which IS *which is the pure compound*; 02.5 said
the meniscus sits six small divisions below the 16 mark, which IS 16.6; 03.4 said the points level
off *"at 0.80 g"*; 08.2 printed all four profiles as a bullet list, and the answer is B *because*
the products are lower; 03.1 described model A as a shaded ball of positive charge with electrons
dotted about inside it, which is the plum pudding model said out loud.

**The rule was already here and is being applied in the other direction**: *what a figure shows is
not what its answer is*, written about the AQA Biology pie chart. A description accurate enough to
teach around is right while the picture is missing and a second source for one fact the moment it
arrives — the `.reel .over` fault, where one object was written twice and the two drifted. Each row
keeps AQA's own lead-in and its ask and loses the sentence that was standing in for the drawing.

**The Higher paper's cuts are by ANCHOR rather than by rewriting each string**, because 06.1 carries
a five-row table of voltages and retyping a table to delete a clause beside it is how a digit
changes.

**And three rows carried a `figure` they never needed.** 05.1 says the nuclide out loud and 05.2 and
05.3 ask about that same atom, so nothing is missing from any of them — a count of work that does
not exist, which is the mirror of a silence and the direction this repository had only ever recorded
the other way round.

## The one thing in the app that marks could not mark a single answer on it

**Measured while the owner was sitting the paper**: 102 questions across the two tiers, 102 with an
answer written out, and **`accept` empty on every one** — so `ansBox_` drew a box and no Check
button on all of them, and the only way to find out whether you were right was to open the mark
scheme, which is the one thing a student on their own will not do honestly. The rest of the library
is not like this: 1,398 rows already carry one. **37 do now.**

**THE RULE IS AS NARROW AS THE FAIRNESS ARGUMENT NEEDS**, because this is the one thing in the app
that tells a child they are wrong and there is nobody for them to appeal to. Two shapes qualify:

| | |
|---|---|
| **a tick box** | the paper prints the options, so the set of right answers is closed and printed |
| **one value** | a calculation whose answer is a single number. `markBare_` already drops the unit |

**Everything else is left alone and that is most of the paper.** Every `explain`, every level-marked
answer, every "any two of", every answer that is two facts in one box. A mark scheme that reads
working is not a string comparison and pretending otherwise is worse than no button. **The sentence
options and the equation options are left out too**: this app has a text box rather than radio
buttons, nobody types `2 Cl⁻ → Cl₂ + 2 e⁻`, and a right answer marked wrong is the failure that
makes a student stop trusting the marking.

**Every entry is proved both ways before it is written**, through the app's own `markAnswer_` rather
than a second opinion about what a right answer is — `check-quizzes.js`'s rule, which found three
real faults on its first run. **The writer refused six entries on its first runs and every refusal
was real**: `3.4 mg/cm³` is not `3.4 mg/cm3` to a string comparison; `72.41` is a right answer to a
question that asks for no significant figures; `Trials 2 and 3` is not `Trial 2 and Trial 3`; `Fe`
is iron; and two rows whose printed answer is itself a list of alternatives or carries its own
working needed saying what a student actually types rather than papering over it with a wider cell.

### `check-library.js` — a tick box has one right option, and the paper prints the others

**A rule living only in the thing that produced the data is a rule nothing enforces about the
data**, which is this file's sentence about `cost: 0` for the fourteenth time. A file can be
hand-edited, appended to by another script, or written by a version of the tool that has since
changed.

**A MULTIPLE-CHOICE QUESTION IS THE ONE PLACE THE WRONG ANSWERS ARE WRITTEN DOWN**, so it is the one
place a checker can prove an `accept` is not too GENEROUS — the rule beside it only asks whether a
cell can mark its own answer right. Exactly one printed option may mark right, and **it would have
fired on a real draft of this commit**: 03.8's four options differ in two halves — energy in or out,
endothermic or exothermic — and `endothermic`, the obvious short form to reach for, marks none of
them.

**Narrowed to what prints "tick one box", and that narrowing is the `check-rows.js` lesson.** The
general form — any row with an `accept` and a bulleted list — reports two rows across the library
and both are wrong: `Q-1MA1-1706-1F-7` bullets Fahima's shopping and `Q-AQA-8464B-2406-2H-053`
bullets the two things sewage affected. Nothing can tell a bullet list from an option list; **the
paper's own instruction can.** Proved by mutation in both directions — an accept that marks none and
one that marks two — and it prints the **133** tick-box questions elsewhere in the library that
still carry no `accept`, so what is left is a number rather than a silence.

## Two columns shipped to every phone since the games were written, and drawn for one person

**Asked for as "add a high scores chart to times table and flabby pird".** Measured before anything
was built: `doget.gs` sends `highscore: N(r.high_score_flappy)` and
`ttHighscore: N(r.high_score_tables)` on **every tutor row and every student row**, and the only
thing that has ever read either is the player's own `Best` line. **This repository's oldest shape
for the seventh time** — `figure`, `orderPrints`, the four message actions, `exam_date`, `wow`, the
eleven dead Settings writers. So the board needed no backend change, no tab and no column: it is the
second reader of something already on every phone.

**WHO IS ON IT IS THE SERVER'S DECISION AND IS NOT REPEATED ON THE PHONE.** `doGet` sends
`payload.students` only when `maySeeChildren` — an admin, a parent or a student — so a signed-out
stranger is sent no children at all and the board simply has fewer rows. Filtering them off here
instead would be the `MESSAGING` fault: one policy in two places, and the copy on the phone is the
one that gets forgotten. Absent by construction, the way the films list already is.

**ONE RENDERER, BECAUSE THE TWO BOARDS ARE ONE OBJECT.** They differ in a single column name. And it
says which empty it is: `scoreRanks_` counts the PEOPLE before it counts the scores, so "no people"
says the scores have not arrived and "people, no scores" says nobody has played — the distinction
`nothingHere` exists for.

### `mineIs_` was local to a screen only a signed-in person sees, and at file scope it threw

**THERE WERE THREE OTHER COPIES OF "WHICH ROW IS ME" AND THE WORST WAS ON THE PATH THIS NEEDED.**
`gameOver` in receipt.js matched a student on **handle alone** and a tutor on **`title` alone** —
two half-tests written out beside each other, either of which answers "not you" for somebody the
other would have found. A tutor whose handle and display name differ was never located, so a record
they had just set was written to the sheet and never to the row the app was holding. Lifted out of
`accountPages_`, given a fourth rung for `t.name` (a student row has no `title`, so before this a
student could only ever be matched by handle), and used by both.

**AND AT FILE SCOPE IT MET A STRANGER.** `USER.personId` on `null` throws, and `toolsStart_` wraps
each widget's `start` in its own try — so the game came up perfectly and the board beside it stayed
an **empty div**, signed out, at every width. **Found by the lab rather than by looking**: the
declared state reported "was entered and shows no…", which is exactly what that assertion is for.

### `SCORE_TOP` is three because the pane cannot grow, and the number is measured

`.pane` is `overflow: hidden`. The Flabby Pird card without a board is 634px against a pane that
caps at 803, so the board has about 140px. At five plus your own line it was 251px and `check/ui.js`
said so on the first run that could reach the state: *".pane holding card hides 111px below its own
fold"*. Three plus yours, on tighter rows, is 140px at every width — measured with a twenty-character
handle wrapping onto two lines, because twenty is what `check-handles.js` allows.

**AND `.row .k` IS `flex: 0 0 auto`, WHICH IS RIGHT FOR A LABEL AND WRONG FOR A NAME.** `min-width: 0`
alone does nothing for it because `flex-shrink` is still 0: the row ran **53px past the card at
320px** and took the pane with it. The board's label is the content and shrinks; the value is three
digits and does not.

**YOUR OWN LINE IS A GOLD RULE DOWN THE LEFT RATHER THAN GOLD TEXT**, and that is a cascade decision
rather than a taste. `.widget-full:has(.flappy) .row .k` scores (0,3,1) — `:has()` takes its own
argument's specificity — so `.board .row.is-me .k` would tie at (0,3,1) and the colour would be
settled by which rule is written later. That is `.price.faint` for the eighth time. Nothing anywhere
sets `box-shadow` or `padding-left` on a `.row`, so this cannot lose a race it does not look like it
is in.

### The times-table save wrote `USER` and not the row the board reads

`gameOver` had already done both for Flappy Bird and `endTimesTables` had only ever done the first —
invisible while the only reader was that card's own *"Your best is"*, and a new record announced
above a list still showing the old one the moment there is a board. Both go through `mineIs_` now.

### And the state that measures it had to seed the visitor, not a name

**THE FIRST VERSION PUT A SCORE ON THE FIXTURE'S ONE TUTOR AND CALLED THAT "YOU".** It is not: the
lab signs in as `Test Admin` / `testadmin` / `P001` and the fixture's tutor is `Ada Tutor` / `@ada` /
`P-@ada`, so `mineIs_` correctly matched nobody and the board drew three rows with no mark. **The
assertion failed and it was right to** — the state was wrong, not the app. It is seeded off `USER`
itself now, and it asserts `SCORE_TOP + 1` read off the app rather than a literal, which is what
caught the assertion going stale the moment that number changed for a measured reason.

**A wait for the payload went in and came out again.** `load()` ends with `DATA = d` — it REPLACES
the object — so a state seeding `DATA.students` before that assignment would have its seed thrown
away, and the flakiness looked exactly like that. It was not: it was the two bugs above. Three clean
runs with the wait removed, so it is removed. **Two rules changed on a measurement nobody took is
what `.mat-out` cost this project**, and the discipline is the same when the measurement exonerates
the change.

## Scrabble, and the dictionary that is deliberately not here

**ASKED FOR AS "add scrable to games tool. 2/3/4 player".** 15×15, a hundred tiles asserted at 100
and 187 points, seven on a rack, the standard premium layout built from one 8×8 quadrant and
mirrored — measured against the printed board: **8 triple words, 17 double words (sixteen and the
star), 12 triple letters, 24 double letters.**

**THERE IS NO WORD LIST AND THAT IS A DECISION.** A usable English one is about 280,000 entries and
two and a half megabytes — the size of the whole question library, for one game widget, on a site
this file has spent two rounds making open faster on a phone. And it is not what the game needs: in
real Scrabble a word **stands unless somebody challenges it**, and with two to four people round one
phone the challenge is the person opposite. Same argument Herd Mentality already makes about
scoring: the part that is people arguing is the part an app should leave to them.

**WHAT IS CHECKED IS THE GEOMETRY**, which is the part people get wrong by accident: the first word
through the centre, everything in one line, no gaps (counting tiles already down, because a word may
bridge one), and after the first move at least one new tile touching what is there. Each refusal
says WHICH rule was broken, because a refusal that does not is one you learn nothing from.

**THE RACK IS SECRET, SO THE PHONE IS HANDED OVER.** Between turns the board stays up and the rack is
replaced by "hand the phone to <name>" and one tap. Without it the next player reads the previous
one's tiles on the way past, which cannot happen with a real rack and is the one part of this game a
single screen genuinely changes.

**AND IT IS NOT REBUILT ON EVERY PAINT, WHICH IS THE OPPOSITE OF THE MAZE.** `initMaze` deals a new
maze each open and its note says why. A Scrabble game is forty minutes and four people, and
`repaint` runs whenever a payload lands or anything saves — so `initScrabble` redraws whatever is in
progress. `New game` is the only thing that throws one away.

### Three faults the lab and a screenshot found, and one the code found first

| | |
|---|---|
| **one tile played twice** | a placed tile stays on the rack until the turn is committed — deliberately, because taking it back has to put it somewhere — so selecting the same slot again put a second copy on the board and the commit spliced one index for two squares. Asked of the BOARD (`from` on each placed square) rather than a second list |
| **625 tap targets under 44px** | fifteen 44px cells need 660px, wider than any phone; at 320px they are 13px. In `ACCEPTED_TAP` with the arithmetic, the same argument `.c4` and `.oth` record for their 40px and 35px cells — and what makes it liveable is that a wrong tap costs nothing, because a tile comes straight back off |
| **the blank's alphabet was 220px** | 26 keys at 44px is five rows at 320px, which took the rack and all four actions past the pane's fold. One select instead — the shape this app uses everywhere somebody picks from a closed list, answering on `change` like `book-note` |
| **the card was 17px past the fold** | a five-line subtitle explaining the hand-over, which the card says for itself at the moment it happens; and a standalone `New game` button, which now sits in the action row while a game is running and gives way to the 2/3/4 row once it is over |

### And the lab found four more, every one a control that was on the page before it could work

**`check/press.js` NAMED SIX AT ONCE**: `scr-cell`, `scr-play`, `scr-recall`, `scr-swap`, `scr-pass`
and `scr-again`, all *"on games"*, all quiet. Every one was correct: they were pressed in the state
the widget OPENS in, which is the three buttons saying 2, 3 or 4 players — and with no game to act
on, five of them returned on their first line and 225 board squares did nothing at all.

**A HIDDEN CONTROL IS STILL A CONTROL TO ANYTHING THAT PRESSES THE PAGE.** The action row was static
markup with `hidden` on its container, which is the same thing to look at and not the same thing to
press. It is built by `scrabblePaint` now and is empty until there is a turn to take. The board is
drawn either way — an empty board under the player-count buttons says what you are about to play on
— but with no game its squares are `<i>` rather than `<button>`, which is what the maze's cells
already are and for the same reason: it is a picture until it is a control.

**AND BUILDING IT FROM A LIST TOOK THE DOORS FROM 137 TO 132.** `check-doors.js` follows
`data-do="x"` with a string in it and cannot follow a variable, so a row mapped out of an array
reported all five handlers as unreachable — **a red with nothing behind it, which is the one thing
every list in this file exists to prevent.** Written out as five literals. CLAUDE.md already records
the same correction on `banner()`, which is why the fault was recognisable rather than puzzling.

**`check/cascade.js` NAMED NINE LONGHANDS ON ONE SQUARE.** `.scr-sq.mid` — the star — against
`.scr-sq.has`, same specificity, settled by which is written later. A tile covering the star is
right and it was right by accident; `.scr-sq.mid:not(.has)` says it instead. Ninth conviction of
`.price.faint` and the first one caught before a screenshot rather than after.

**A BACKTICK INSIDE AN HTML COMMENT INSIDE A TEMPLATE LITERAL ENDED THE LITERAL.** `js/map.js` builds
every widget's markup in a template string, so `` `check/ui.js` `` in a `<!-- -->` there is a syntax
error — reported as `Unexpected identifier 'check'` and `WIDGETS is not defined`, four files away
from the comment. The house style's backticks stop at the edge of a template literal.

## Every post anybody could make had nothing said about it

**`Write a post` was removed on request and it took the only door to `on('new-post')` with it** —
this file already records that, and `check-doors.js` has printed it as a handler waiting for a
button ever since. What the note did not follow through is what the removal left: the CAMERA is the
only way to post now, and `cam-post` sends `caption: '', body: '', location: '', poll: ''`.

**So every post anybody could make was a photograph with nothing said about it.** `postCard` draws
`.post-cap` as *"**who** what they said"* and this file's own note on comments says the caption IS
the first comment. A feed of silent pictures is not the feature that was asked for.

**One line, hidden until there is a picture**, like `Again` and `Save a copy` and for their reason:
it belongs to a photograph you are holding, not to a camera you are pointing. Emptied as well as
hidden by `camAgain_`, which runs on `Again` AND on a posted shot — a caption left in the box would
be offered as the caption for the next photograph.

**No `<span>caption</span>` over it, which is this app's own pattern for a single box.** The search,
the comment box, the notepad and the message composer are all a placeholder and no label, and this
file already records the measurement behind it: ten controls have no text, every one carries a
placeholder, and **a placeholder IS the accessible name when there is nothing else** — so a label
repeating it is two strings to keep in step. It is also 21px, which mattered (below).

**Caption and nothing else.** The composer also asked `where`, `more` and a poll; those are a form
and this is one line beside a shutter. No backend change: `addPost` has written `S(body.caption)`
since it was written.

### The card grew off the bottom of the screen, and `under` was 0 at every width

**`columnShift_` centres the page you are on** — `boxH / 2 - (offsetTop + offsetHeight / 2)` — **and
it runs when the column is PLACED, not when a card inside it grows.** Taking a photograph reveals
five things at once: 112px before this commit, 167px after. Measured at 390×844 with a picture on
the card, the pane was placed at 648px tall so its top went to y139, then grew to 768 — **bottom at
y906, `Save a copy` 62px below the glass.** At 768 and 1280 it was 79px.

**Nothing could see it, and that is the part worth keeping.** `check/ui.js`'s OUT OF REACH asks
whether content overflows its pane; here the content fits its pane perfectly — `scrollHeight` equals
`clientHeight`, `under: 0` at all four widths — and **it is the PANE that hangs off the bottom.**
Same loss, one box further out, and the rule was measuring the wrong box.

**`js/find.js`'s `settle_` is the app's own answer and the camera was not calling it.**
`placeCells('y', true, 0, 'make')`, at each of the four places the card changes height: a picture
picked, a shot taken, a picture thrown away, and a camera that failed to start and revealed its
retry. `true` for `settle_`'s reason — the cards have not moved as far as anybody is concerned.

### `PANE OFF THE SCREEN` — the same question, one box out

**A separate heading from OUT OF REACH, deliberately.** They are the same loss and different
repairs: *below its own fold* is a card too tall for its pane and wants the column paged; *off the
screen* is a pane placed for a card that has since changed size and wants `placeCells` where the
size changed. One heading would send a reader to the wrong half.

**Only `.page.on`, and that narrowing is what stops it being the noise generator this file has
already deleted one of**: every other page of a paged column is legitimately off the viewport —
that is what a column IS. The rendered box rather than layout, for the `.mat-out` reason. **Proved
by mutation**: without the `placeCells` calls it names all four widths; the real files are silent.

### `make · a photograph taken` — half the camera had never been on a screen the lab looked at

**The column opens on a viewfinder and nothing else.** `Again`, `Post it`, `Save a copy`, the
caption and the who-row are `hidden` until there is a photograph, so `check/press.js` listed
`cam-post`, `cam-save` and `cam-again` as untouched rather than as faults — an action on no screen
is one it cannot reach. **Entered through the app's own picker**, a `DataTransfer` carrying a real
one-pixel PNG on `#cam-pick`, because a container has no camera and `cam-shoot` is not a door this
can use. `camAgain_` puts it back, since states run in order down one page.

### Two things a screenshot caught, and one of them was four buttons on three lines

**`Try the camera again` stayed on the card while a picture was being held.** It is revealed only by
a camera that FAILED to start — and once you are holding a photograph, `Again` is already the button
that throws it away and puts the camera back, so the row offered two ways to do one thing. Measured
on the one path that reaches this with a dead camera, picking from Photos: the four buttons are
491px in a 300px row, so they **wrapped onto three lines and cost 52px**. It comes back by itself,
because `camStart_`'s catch is what reveals it and `camAgain_` calls `camStart_`.

**And the who-row sat flush on the button row.** Both are `.btn-row` with no margin, so the bottom
edge of `@family.` was the top edge of `Again` — 789px in both cases, measured — and with a gold
fill on the chosen one of each row the two read as one block overlapping another. `.5rem`, which is
the gap `.cam-row` already uses between its own buttons, so the spacing down the card is one number
rather than two. **Fourteenth time this file writes that a screenshot is the last word.**

**8px of headroom left at 768, and that is why `where` is not a second field.** The pane is 797
against a `max-height` of 805.

## A waiting list picks blocks on the week, and the five phrases go

**Asked for as "I want the grid blocks to form into chunks for morning, afternoon, evening ect."**
What was there was a multi-select of five phrases — `Weekday mornings`, `Weekday afternoons`,
`Weekday evenings`, `Weekends`, `Flexible — whatever suits` — with the hour week above it **greyed
out whole** and a line saying why it could not be ticked.

**The old note is right about WHY the answer must be broad and wrong about its shape.** *"Asking a
family to tick specific hours for a session that may run in six weeks is asking them to promise
something nobody can promise"* — so the columns are blocks. But a week is a SHAPE you read, which is
the argument the hour grid has carried since it was written, and `Weekdays` as one word cannot say
that Tuesday is the one evening that does not work.

**Three columns, seven rows, `weekGrid_`'s own builder.** That function's note says what differs
between this app's grids is THE CELL and nothing else, and it holds: the header, the day letters,
the row and the gold bar that joins Monday morning to Monday afternoon are all its.

**Nothing is greyed, and that is the question being asked.** The hour week greys an hour the tutor
does not work — right, because it offers hours that can be BOOKED. This asks when the FAMILY can
come, of a class with no tutor, no room and no day yet; greying a block by whoever happens to be
selected now would be answering a different question with the first question's data.

**One week on the card, not two.** The greyed hour week is not drawn on this branch at all. Measured:
a 44px block week is 330px against the hour week's 162, and 527px of week on a card whose pane caps
at about 800 is most of the paper spent on one question with half of it unanswerable. The sentence
the greyed week carried went with it — the row above still asks *"When could you come?"* and the
Kind row's own note still says the class *"runs once enough others take a seat"*.

**No backend change.** `waitlistWhen` splits the joining event's message on commas and tallies the
phrases, so any phrase works — and the cell carries the phrase it stands for, so there is no second
place for "Monday morning" to be spelled. `Mon–Fri evenings · 4 of 4` is the tutor reading the
answer rather than decoding a code.

### 44px was measured and refused, and the card had three pixels

**Three columns CAN pay the tap-target rule where eleven cannot.** `ACCEPTED_TAP` carries the hour
cells at 20px with the arithmetic beside them — eleven fingertips need 484px and no phone is that
wide — and three need 132 against about 280. So it was written as `.hr.blk { min-height: 44px }`.

**Then it was measured.** The waiting-list card is **803px in an 807px pane at 390**, `under: 3`.
At 44px the block week takes it **216px past the pane's own fold** — content nobody can reach, on
the question the card exists to ask. At 20px the two weeks are the same height and it fits.

**So there is no rule at all, which is the better answer for a second reason**: the blocks are the
same control as the week above them at the same size, one `ACCEPTED_TAP` entry covers both, and a
94×20 cell is 1,880 square pixels of target against a 44×44's 1,936 — the half that rule cannot
express.

### The row's own summary is grouped, because a list of phrases grew a line per tap

**`Monday evening, Tuesday evening, Wednesday evening` is what the grid writes** and it is the wrong
thing to print on a receipt line: measured at 390px with two blocks ticked that row was **62px —
three wrapped lines in an 81px value column** — and it grew by a line with every press. A row whose
height depends on how much of the week suits you is the card changing shape under the thumb
answering it, which is what `SPINE` objects to about folding.

**`blockSay_` groups by block and collapses runs of days**: `Mon–Fri evenings`, `Sat · Sun mornings`.
Three phrases at most, because there are three blocks. **The stored list is untouched** — the same
split the hour grid already makes between `m13, m14` and `Monday 13:00–15:00`, and it has to be:
`waitlistWhen` counts the phrases, and a grouped string would be one vote for a thing nobody ticked.

**And the row above a grid spans now.** `is-bare` collapses a row to two columns and deliberately
refuses to do it for a QUESTION, because two editable fields in two widths is the fault that note
records. A grid's heading has no field — its own note says the dashed underline goes *because "the
answer goes in the week below it"* — so nothing can come out a different size from a control that is
not there. It buys both grid summaries one line instead of two, and the waiting-list card came back
inside its pane at 390.

### `booking · a waiting list` — the branch nothing had ever put on a screen

**`isWaiting_()` changes six rows and the whole week**, and until this state existed the lab had only
ever seen the other branch: `check/ui.js` measured the form, the receipt and the basket, all
ordinary. Same hole the receipt and the message thread were each in, on the app's most control-dense
card. Seeded through `BOOKING.how` and `drawBooker()`, which is what the Kind dropdown's own
`change` handler does.

**Two things it found on its first run, and both were already there.**

**A note explaining how to use a control that cannot be used.** Subject is locked on a waiting list
— a class's subject is settled by whoever opens it — and directly under the greyed dash sat *"Pick
as many as apply — choosing again adds one, and a ticked one comes back off."* That is the caption
this file already removed from over the week grid, in a new place: a sentence about an action,
printed where the action is not available. A `note` is not drawn on a locked step now, and it took
**28px off the ordinary form too** — so there were locked steps with notes on that branch as well.

**And the waiting-list form has been past its pane at 768 and 1280 for as long as it has existed.**
33px, and the block week is not the cause — that grid is 162px at every width, exactly what the hour
week costs. It is the ROWS: they are set in `rem` off a 16px root there against 14.8 at 390, so a
card that fits on a phone does not on a tablet. The note took 27 of it and `.bk-open`'s surround the
last 4 — **the space either side of the dashed rule under the grid, above a row that carries a
dashed underline of its own.** Measured after: 771px at 390 and 797px at 768, `under: 0` at both.
**Proved by mutation**: the old surround back and it names 4px at 768 and 1280.

### And the week is a cell of its row now, so the blocks start where the answers do

**Asked as "is it possible to have the grid be in the 2nd column like the other stuff."** The week
was a SIBLING of its row, so it began at the card's left edge — under the label column, where no
other answer on the card starts, while every value beside it begins two thirds of an inch further
in. One left edge for the answers is most of what makes this card read as a document.

**Yes for three columns and no for eleven**, and it is the same arithmetic the note over `.hr`
records this block reaching after 222 → 174 → 146px. Measured across the value column each week
would have, at three widths, after the day letters and the gaps come off:

| | 320px | 390px | 768px |
|---|---|---|---|
| **blocks** | 56px a cell | 71px | 75px |
| hours | **15px** | **19px** | 20px |

**The floor is 20px** and the hour week is under it at both phone widths — 15px at 320 is a cell you
cannot reliably hit, which is the whole reason that grid is full-bleed and the reason this was
refused the first time it was asked. The block week loses 94px a cell for 71 and is nowhere near it.

**They are never on one card.** `stepGrid_` draws exactly one week per branch — hours for a session,
blocks for a waiting list — so this is not two shapes for one question on a screen somebody is
reading. It is one week, indented as far as its own cells allow.

**Placed by the grid rather than measured again.** The obvious version is `margin-left: 6.2em` on
the week, which is the label column's own floor written in a second place — and that column is
`minmax(6.2em, max-content)`, so a long label widens it and the margin would not follow. `.bk-open`
is the last child of `.bk-row` now, which is a grid: `1 / -1` is exactly the full width it already
had and `2 / -1` is the value column, computed by the browser. One declaration is the whole
difference between the two weeks.

**And a note on a grid row sits under the week now** rather than between the row and it. No grid step
carries one today so nothing moved, and it is the better order if one ever does.

## Your settings are a column, and the tile that opened them was drawn on no screen

**Asked for as "account setting should appear in a new column by itself. For now make that new
column at the end."** What was there was one sheet — `openSheet('Your details', …)` — holding the
profile form, a week of seventy-seven tickboxes, the username and the PIN.

**MOVED, NOT COPIED, AND THE IDS ARE THE REASON.** `handle-new`, `handle-said`, `pin-now`,
`pin-new`, `pin-again`, `pin-said` and `me-said` are all looked up with `$()`. Drawing them on a
column AND leaving them in a sheet puts two elements under one id on the page at once, and `$()`
hands every Save button the first of them — **the `$('msg-text')` bug this file already records**,
where a reply typed into the second thread posted to the first. So the sheet is gone.

**ONE THING PER PAGE, BECAUSE `.pane` IS `overflow: hidden`.** `#sheet-body` scrolls and a pane does
not. Measured at the four widths: **five pages, 237–400px each, `over = 0` everywhere** against a
pane capping at 534px on a 320×568 phone. Each group the backend sends is a page, then the username,
then the PIN.

**AND EACH PAGE SAVES ITSELF, WHICH THE BACKEND ALREADY ALLOWS.** `updateProfile` does
`wanted.forEach(f => setCell(…))`, so a partial post cannot blank what it did not name. **The one
exception is the timetable**: `availGridIn(fields)` rebuilds the whole `availability` cell from
whatever hour codes arrive, so a half-sent week would erase the other half. That is why `me-save`'s
container is `.me-form` — the card's own form — before `#sheet-body` and `.widget-slot`: with
`document.body` as the container a Save on *About you* would have gathered the seventy-seven hour
codes on the page below it as well. **Measured on the wire**: page 0's Save posts
`{first_name, last_name, photo}` and nothing else.

**`settings` IS A SCREEN ID AND `js/settings.js` IS ABOUT THE SHEET EXPORTS.** Two different things
wearing one word, which is what `kind` colliding with two columns already cost. Named in the code
rather than discovered: nothing in `js/settings.js` reads a screen and nothing in the column reads
`data/settings/*.json`.

**Sign out stays on your account card.** It is not a setting, it is the one action that must be
reachable without knowing where anything is. Drawing it here as well would be two doors to one
action.

### `kind: 'me'` is a kind nothing had ever built, so four tiles were on no screen at all

**`cardTiles_` routes `meTiles_` on `x.kind === 'me'` and, measured across `js/`, `kind: 'me'`
occurs nowhere.** So `Edit your details`, `Add your child`, `Your figure` and `Build` — four tiles,
written, styled, each with a live handler behind it — **were drawn nowhere**, and the sheet they
opened had no door. `accountPages_`'s `asItem_` builds `kind: 'tutor'` for everybody including you.

**A renderer left standing over a permanently false condition**, which is the shape recorded here
under `resource_type` in `VOCAB`, under the dead `kind === 'paper'` guard, and under the unlisted
tutor this same function used to filter away.

**`check-doors.js` could not see it and says why itself**: it pairs a `data-do` STRING against an
`on()` handler, and both halves were there — what was missing is anything that DRAWS the string.
That is a fourth kind of gap beside the three that file already names, and it is the one a checker
reading source cannot close: `meTiles_` is a live function returning a live string, and only asking
a rendered page whether the string is on it settles whether anybody can reach it.

**And `tutor` was wrong on your own row for a second reason**: `tutorTiles_` is Message, so your own
card carried a Message tile addressed to yourself. One kind, two repairs. Others are untouched —
`withTiles_` asks for no kind and still gets `tutor`.

**Proved in the browser**: the tile on your own card lands on `settings`; the column is `paged`,
five pages, `pageCount('settings')` five, and `handle-new`, `pin-now` are one element each.

### And `<h2>` inside a card is a section rule, which `check-dead.js` caught on the first run

**`fieldsHtml` has always emitted `<h2><span>…</span></h2>` for a group heading, and that was right
while its only caller was a sheet.** `#sheet-body h2` has no rules above or below it, *"because the
sheet is one thing rather than a list of things"*. The settings column is a list of things — one
group per card — and on a screen `.screen h2` is something else entirely: a full-width rule above
and below with a `> ` prompt in front, which inside a card is a divider where a title belongs.

**It is also what `split_` cuts on**, and `check-dead.js` states the rule outright — *"a heading
inside a card is an h3, a heading between cards is an h2"* — naming the screenshot it took the last
time an `<h2>` sat in the You card and quietly cut it in two. Measured: **0 findings before, 2
after**, both of them my new cards.

**One option, defaulting to what it always did.** `fieldsHtml` takes `head` and the caller says
which surface it is on — the same move `me-save` makes with its container, and cheaper than a second
renderer differing by one tag. Screenshotted at 390px across all five pages: the card title reads as
a title, and the week grid keeps its own header row.

## Two rows went and the term became a multi-select, and the term block had been silent throughout

**Asked for as "Remove weeks left running bit. Let term be multi select."** Two things, and the
second is why the first was worth measuring rather than deleting on sight.

**`Running` and `Weeks left` are gone from both documents**, the waiting-list card and the session
receipt, with their two `SPINE_EXTRA` entries and the three sentences of prose that described them.
**What is lost is the term's DATES**: `Running` printed *"Autumn 1 — 02/09 to 24/10"* and nothing
else on the card says when the term is. The term's NAME is still there, and the estimate under it —
`About  6 × £24.00  £144.00` — still says how many weeks it is worth. Written down here because it
is a real reduction rather than a tidy-up.

### The term is a multi-select, and the sessions are counted per term

**A family booking Autumn 1 and Autumn 2 was two jobs.** `multi: true` on the `interval` step is the
visible half; the arithmetic is the part that could have been wrong quietly.

**`bookSpec` returns `windows` — one `{startDate, lastSun}` per chosen term** — and `core.js` walks
each separately and dedupes, rather than taking the first term's start and the last term's end as one
span. **Proved by mutation, and the gap between the two numbers is a school holiday**: forcing the
outer span gives **12 sessions and £264, including `26/10`** — the October half-term week, when the
school is shut; the per-window walk gives **11 and £242**. A family would have been charged £22 for a
week nobody is teaching.

**Everything downstream is a count rather than a span, which is what made this safe.** `slots` is
`sessionDates.length`, and `priceLooksWrong` on the backend derives its weeks from that same count —
so the price scales with the dates and no `.gs` file changed. `term_name: S(body.interval)` is a
string cell and takes `Autumn 1, Autumn 2` as written.

**And the ticked list is kept in the order it is OFFERED, not the order it is tapped.** Ticking
Autumn 2 and then Autumn 1 reads back `Autumn 1, Autumn 2`, because a receipt listing a family's
terms out of order reads as a mistake in the booking.

### `new Date('02/11/2026')` is 11 February, and that is why the whole block drew nothing

**The waiting-list term block had never once run.** `waitTerm_`'s predecessor sorted and compared
with `new Date(v)` on this app's own `dd/mm/yyyy` cells: `02/11/2026` is 11 February to a browser —
already past, so never "the next term" — and `23/10/2026` is month 23, which is `NaN`, so never "the
term running now". **Both branches were permanently false**, and the card simply had two fewer rows
on it.

**`parseDMY` is the app's own reader and was three files away the whole time.** Same shape as
`waveOf`'s timezone fault, which cost this app seven buttons, and the same fix: one reader.

**It was only visible because the harness was given a seat price.** `bookPrice()` returns `null` for
a waiting list with no `BOOKING.loc`, so `breakdownRows` returns on its second line — and
`check/fixture.json` had no `waitlistSeat` at all. **So `booking · a waiting list` had been measuring
the branch EMPTY on every run since it was declared**, which is this file's own sentence about the
fixture that could not reach the receipt, the message thread or the basket. One venue in the fixture
and one line in the state, and the priced branch drew for the first time.

### A push naming a question is dropped, so the term could not be pushed at all

**`bookBreakdown` builds `said` from every step's label and drops any priced row naming one twice** —
which is right, and it means `push('For', …)` and `push('Term', …)` were both silently discarded.
`jobRows` had already found this on the receipt and written it down; the form kept the copy.

**So the term fills its own STEP instead**, through `st.fallback` — the hook the `client` step
already uses to show what a booking would be submitted as. **And `fallback` was ignored for a multi
in three places**: `stepRows_`'s value chain, `stepSelect_`'s locked branch (which is the one a
waiting list actually takes, because `options()` is empty there) and `stepSelect_`'s open first
option. One `fb`, read once, used in all three.

### Two things the newly-reachable card reported, and neither was the new feature

**`span.bk-r overflows by 2–3px` at all four widths.** `.bk-row`'s rate track was `7.5ch` and
**`£12.00/h` measures 52px of `--mono` in a 49.45px track** — `ch` resolves in the ROW's proportional
font while the figure is set in the mono one, which is the `6 dates` fault one column along. It is
`8ch` again, and the note records that the earlier reduction from 8 counted characters instead of
measuring them.

**`.pane hides 4px below its own fold` at 768 and 1280.** `A seat` merges onto the Venue row, and
`spineRows_` then invented a dash for a row that was already drawn — a blank for a fact that is on
the card. `bookBreakdown` collects the keys it merged (through `SPINE_ALIAS`, so `Students` counts as
`Seats`) and hands them to `spineRows_` as `said`, which is the same argument as `only:`: a row that
cannot be filled and a row that is already filled are both rows with no dash to invent.

## The week starts where the answers start, and only its left edge could move

**Reported with a screenshot of the form: "can you see how grid stretches across all columns? I want
it squashed into the second column which is the input column."** The second time it has been asked —
the first was about the block week, where it was granted, and the hour week was refused on
arithmetic.

**Measured on the card rather than quoted, because the recorded numbers had gone soft.** `.bk-open`
was `1 / -1` and is `2 / -1`, which hands back the label column and its gap:

| | cell before | cell after |
|---|---|---|
| 320px | 19.1 × 20 | **13.6 × 20** |
| 390px | 24.1 × 20 | **17.6 × 20** |
| 768px+ | 25.6 × 20 | **18.7 × 20** |

**That is a real reduction and it is written down rather than smoothed over.** The height floor is
untouched at 20px; what gives is width, and the note over `.hr` sets that floor against a cell *24px
wide* — which is exactly what 390 used to be. At 320 the target is now 13.6px with its neighbour two
pixels away. **`ACCEPTED_TAP` already carries these cells** with the arithmetic beside them — eleven
fingertips need 484px and no phone is that wide — so nothing new is reported and this makes an
accepted finding smaller. Asked twice, measured, and the owner's call.

**One rule for both weeks now, so `is-blocks` had no reader left.** It existed only to say *this
week may start at the value column*, back when the hour week could not; a class with no rule behind
it is `.favwrap.is-fav` again, so it is off the markup too.

### The right edge is the half that cannot move, and the reason is a decision already reversed once

**`2 / -1` is the value column AND the three figure tracks behind it.** So the week starts where the
answers start and still runs to the card's edge, while an unanswered row's dash stops at **189 of
351**. Clipping the week to 189 is `2 / 3` — **78px for eleven hours, a seven-pixel cell** — which is
the same arithmetic written beside `.bk-row.is-blank` where it was refused before.

**So the card's two right edges are not this rule's to close.** They are the price of the multiplier,
the rate and the total sitting on a form with nothing priced on it — hidden once, on this same
complaint, and put back on *"what happened to all the columns I had before for things like
multiplier"*. Hiding them again is one line and it closes both edges at 351; it is the owner's
judgement and it has already been made in both directions, so it is offered rather than taken.

### And CLAUDE.md had been describing the hidden version for weeks

**The three sections under "the rows were holding three empty columns" say the figure columns go on
an unpriced card. They do not.** The revert was written up in `style.css` and nothing came back
here, so this file's own table said the value's right edge was 351 while the live card said 189.
**Found by measuring the card while answering this complaint**, which is the only reason it is not
still there — the same shape as `.favwrap.is-fav`, as `resource_type` in `VOCAB` and as the dead
`kind === 'paper'` guard, pointed at the map rather than at the code.

**Measured after, three states × four widths**: `gridLeft === valueLeft` on the form at every width,
no sideways scroll anywhere, `under: 0` on every pane, and the block week unchanged at 55/70/74px a
cell.

## All the answers in one column, which needed the other three to give their width up

**Asked for as "label each column at the top. Small", and then the reason behind three requests:**
*"I want all input fields in 1 column. I don't want them to mix with other things. That's why I'm
trying to get the time grid in the coloumn. However I know it's a big thing to have in one column."*

**That principle cannot be held with the figure columns there, and the arithmetic is why.** An
answer lives in track 2, which is **78px of 312 at 390** with the multiplier, the rate and the total
behind it — and eleven hours in 78px is a **seven-pixel cell**. So either the week spans the figure
tracks and mixes, which is the complaint, or the figure tracks give their width up when they hold
nothing. There is no third arrangement: the week needs 244px and the card has 312.

**So the answer column is the wide one until figures need the room.** `.bk-v` spans `2 / -1`, which
is exactly where `.bk-open` puts the week — measured on the form at three widths, **the dash and the
grid now share both edges**: `[111, 351]` at 390, `[93, 287]` at 320, `[295, 549]` at 768.

### This rule has been written, reverted and written again, and the third time has a reason

**Written from *"the grid shouldn't extend beyond the 1st coloumn like the other fields"*; reverted
from *"what happened to all the columns I had before for things like multiplier"*.** Both reports
are about one edge and they wanted it in different places, which is why it flip-flopped.

**What the revert was about is answered by the header rather than by the columns.** "What happened
to all the columns" is a question about columns that vanished with nothing saying so. `spineHead_`
names them, so `× RATE TOTAL` appear **labelled** the moment there is a figure to put under them,
and their absence on an unpriced form reads as *nothing is priced yet* instead of as something
having gone missing. **Proved by the waiting-list state**, which is the one branch the fixture can
price: it carries an `About` total, so the columns are there, `TOTAL` sits over `£144.00`, and the
dash correctly stops at 189 while the week runs to 351.

**`:has` reads the card's own totals** rather than a flag somebody sets, so there is no second place
for "is this priced" to be wrong — and **the header is excluded from its own test**, which is the
line that is easy to get wrong. `spineHead_` writes the word `Total` into a `.bk-t`, so a plain
`:has(.bk-t:not(:empty))` is true on every card and the rule could never fire. The descendant is
`.bk-row:not(.is-cols)`.

### The column headings existed once and were deleted for being big

**The note where they were says they were *"six words explaining a layout nobody was confused by,
and the widest band of text on the card"*.** Half of that has stopped being true — the report that
brought them back is somebody counting the columns and asking which is which — and the other half is
exactly why the word **Small** was in the request. `.58rem` of tracked uppercase in the faint ink,
reading as a caption rather than as a row of the document.

**The stub head is blank**, which is what a table does with the column its row names live in. **The
value column's word comes from the caller** — `Answer` on the form and `Detail` on the receipt,
because the two documents are not the same sentence: the same `fieldsHtml(head)` move, cheaper than
a second builder differing by one word.

### It cost 11px on the one card that had 8, and where they came back is the entry

**`check/ui.js` named it immediately**: the waiting-list branch runs 812px of content into an 805px
pane at 768, and its own note already records it arriving with **three pixels spare at 390 and eight
at 768**. A header at an ordinary line-height put it 11px past the fold.

| | |
|---|---|
| **the `.rc-rule` above the rows** | **8px.** A rule and a dashed border under the header is two lines doing one job, and the second is labelled. Without a header the rule stays, because then nothing else closes the block above off |
| **the header's own spacing** | 17.8px → **12.1px.** 1.15 rather than 1.4, almost no padding under the words, and no margin under the rule — a `.bk-row` has none either, and the border IS the separation |
| **`.bk`'s top margin** | `.4rem` → `.15rem`, off `:has`, because that margin was sized for a rule and its `.22rem` that are no longer there |

**Measured after: `under: 0` on all four states at all four widths**, no sideways scroll, and all 37
checks pass. **Nothing redundant was found on that card first** — its blocks were listed and the
tiles are 44px targets, the terms line is a link and the summary is content — so the header paid for
itself rather than being funded by something else's headroom.

### A question the other branch answers, printed under the answer

**Reported as "When free field is redundant now as we are using the grid bit."** Measured on the
ordinary form before anything was changed: a row reading `When free  —`, **no control, no week, and
nothing that can ever fill it** — sitting directly under the `When` row, which is 186px of hour grid
that had just answered the same question to the hour.

**It could not be answered there by construction.** `stepGrid_` draws the blocks only on the waiting
branch and `avail`'s `options()` is empty, so `stepControl_` draws nothing either. A question with
no way to answer it, printed under the answer.

**THE RULE IS THE ONE `only:` ALREADY STATES**, and the distinction it draws is why this is a
deletion rather than a lock. `SPINE`'s own argument — *"a document whose SHAPE changes with its
contents cannot be read at a glance: you find a line by where it is"* — is about a row you have not
answered **yet**: you are about to, and a line appearing under your thumb moves everything below it.
**A row this BRANCH can never answer was never on this document**, because an ordinary booking does
not become a waiting list. That is the same sentence that took six rows off the ordinary form when
`only:` was written.

**`When` IS NOT MARKED AND THAT ASYMMETRY IS DELIBERATE.** On a waiting list it is a dash too — and
it says *no day yet*, which is **true of that booking** and becomes a real day once the list fills.
`When free` on an instant booking is not a fact about the booking; it is a question already answered
one row above, more precisely, by the grid that prompted the complaint.

### The flag has to be read in three places or the row comes straight back

**`SPINE` is built from every step's `short`.** So a question `stepRows_` correctly drops is
re-invented by `spineRows_` two hundred lines down, as a dash, under the same name — **the row
removed and then added back by the same card**. `ONLY_ON` reads `BOOK_STEPS` as well as
`SPINE_EXTRA` now, so the flag is declared once beside the row it belongs to wherever that row is
declared.

**And `nextBookStep` skips it too, which changes nothing today and is the point.** That loop already
passes over a question with no options, so `avail` was never asked. Without the guard, `only:` would
mean two different things — *not drawn* to one walker and *still asked* to another — and a
branch-only step added tomorrow **with** a list would be dropped from the card and then asked by the
funnel: a question on screen that the document it belongs to has no row for.

**`bookOn_()` is the one reader.** `isWaiting_() ? 'wait' : 'book'` was written out at the
`spineRows_` call site and would have been written out twice more; three copies of which branch this
is, on a card whose two branches differ in seven rows, is the second reader this file keeps finding
— `documents_()`, `paperIdOf_`, `factsNow_`, `childrenOf`.

**Measured after**: the ordinary form loses the row and gains no dash in its place, the waiting-list
card is unchanged with its blocks ticked and its summary reading `Mon · Tue evenings`, and the
receipt is untouched because it is built with `fill: false` and never invented the row anyway.

#### `check-flow` refused it, and this time the refusal was half right

**The journey *"the paper keeps the same rows whatever is answered"* failed immediately**, naming
`When free` — which is the check doing exactly what it was written for. The last time this happened,
over `Asked for`, the refusal was right and the row stayed.

**It is not right here, and the distinction is one this file already draws.** That journey's fault
was rows vanishing when you ANSWER — *"answering a level made Kind, When, Term, Split, Child, For
and Tutor disappear off the card while still being asked"*. `blank` against `priced` is that half
and is compared whole, untouched. Across the BRANCH it is narrowed to what the code declares, by
reading `only:` off `BOOK_STEPS` rather than listing names in the check — which is the same sentence
`SPINE_EXTRA` has carried since four derived rows were given the flag, and it is the first time a
QUESTION has one.

**AND THE TWO SHAPE COMPARISONS CANNOT FIRE ANY MORE.** Measured on four mutants rather than
assumed: `stepRows_` pushes a row for every step answered or not, and `spineRows_` invents a dash
for any spine row neither builder produced — so dropping **Subject and Level** from the waiting
branch leaves the shape identical, the row coming straight back under the same name two hundred
lines later. Turning the form's `fill` off changes nothing either, because no question row was ever
missing to be filled. **Both halves of the fault that journey is named for have been structurally
impossible since the spine was written**, and nothing anywhere said so.

**`ONLY_ON` is the only route left by which a question row can vanish**, which is why the live
assertions are the two `only:` ones: a branch-only question must be ON its own document and OFF the
other, and the flag-does-nothing mutant is the one that fires. **The comparisons are kept**, for the
reason `check-funnel.js` test 2 is kept after the spelling fold made it unfirable — it is where the
invariant is written down, `!blank` still fails if the paper stops drawing questions at all, and
both come back to life the day anything upstream stops guaranteeing them. What is not kept is the
pretence: the journey's note now says which half is load-bearing, because a rule that cannot fail
under a confident comment about what it protects is a green light with nothing behind it.

## A booking may run on several days, and three readers thought it ran on one

**Asked for as "audit the booking system and address any issues to make it more stable."** The state
machine itself came back clean — measured across nine states of the form, in a real browser: **no
throw, no NaN, no card that failed to draw, and `resetBooking_` leaves nothing behind.** What was
wrong is one fact, read three ways, in three files, and all three were written when a booking had
one day.

**The hour grid has let somebody tick hours across several days for a long time.** `bookRuns` folds
those ticks into runs and `bookSpec` joins the days with commas — so `weekday` genuinely reads
`Monday, Friday`, and it has done since the grid was built.

### The days came back alphabetically by their code prefix

**`bookRuns` ended `sort((a, b) => a.day.localeCompare(b.day))` over `m / tu / w / th / f / sa /
su`**, which is **Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday**. Measured: a
Monday-and-Friday booking — the commonest two-day shape there is — came back `Friday, Monday`.

**AND IT IS NOT ONLY THE READING ORDER, because three things are taken from the FIRST run.** The day
list goes on the receipt and into the job's `weekday` cell; `time` is the first run's hour and
becomes `start_time`; `hours` is the first run's length and becomes `hours_per_session`, which
`priceLooksWrong` then measures the total against. So **a Monday 10–12 with a Friday 16–18 recorded
its start as 16:00**, and a Monday 10–12 / Wednesday 15–16 / Friday 09–12 recorded a three-hour
session because Friday sorted first.

**The total is unaffected and that is exactly why nothing caught it**: the money is `hoursPerWeek ×
weeksBooked` and the real session dates, both sums over every run, so every figure on the card was
right while the day and the time beside them were not.

**`blockSay_` ALREADY LEARNED THIS** — *"in the week's own order, off `SLOT_DAYS`, so Sunday cannot
sort to the front"* — on the waiting list's week, written months after this one. One lesson, applied
to one of the two weeks, which is this repository's oldest shape.

### The receipt drew an empty week for every multi-day booking

**`jobGrid_` did `norm(label) === norm(j.weekday)`.** For `Monday, Friday` that is false for Monday
AND for Friday, so **nothing lit**. Measured: **2 cells on a one-day job, 0 on a two-day one, 0 on a
three-day one** — the tallest block on the receipt, dark, on exactly the bookings somebody most
needs to check, and reading as a week with no session in it rather than as a fault. That grid exists,
by its own note, so a family can SEE when their session runs instead of reading it off a line.

**One span, shown on each named day**, because the job row holds one `start_time` and one
`hours_per_session`. Where the runs really differ the row is already a simplification of them, and
lighting the span the receipt states on each of its own days is the honest reading of it. Lighting
nothing was not.

### AND THE SAME CELL SOLD THE SAME HOUR TWICE

**`busyHours` in `backend/booking.gs` did `DAY[norm(j.weekday)]` and then `if (!d) return`.** A
multi-day job is not in that table, so it was **dropped entirely** — and `busyHours` is what greys an
hour on the booking grid. **A tutor already teaching Monday and Friday 10–12 read as free on both**,
so the next family could book the same tutor at the same time. Silently, and only on the multi-day
bookings.

**Of the two ways to be wrong here, one offers an hour that is taken and the other holds an hour that
is free, and only the first sells the same hour twice.** The function's own header said *"one weekday
and one time, repeating"* — true when it was written, and it stopped being true when the grid grew
days.

### Three rules, because a repair to the instance is this file's oldest fault

| | |
|---|---|
| `check-flow.js` | *a booking over several days reads in the week's own order* — the day list AND the start time, over four shapes including Sunday-and-Monday |
| `check-flow.js` | *a receipt lights every day its booking runs on* — 2, 4 and 6 cells |
| `check-booking.js` | *a tutor teaching on two days is busy on both* — and a cancelled session still releases its hours |

**Proved by mutation in both directions**, each against the exact line it replaced.

**`busyHours` is the first function in `check-booking.js` that touches a sheet**, and it is worth its
four stubs: it is the one thing in this subject area whose failure takes money from two people for
one session. **`N` is lifted from `constants.gs` verbatim rather than approximated** — a stub that
rounds differently from the real one proves the wrong thing.

**AND THE FIRST RUN OF THAT RULE REPORTED "nothing" FOR EVERY CASE, INCLUDING THE ONE-DAY ONE THAT
HAS ALWAYS WORKED.** With no events there are no clients, and `jobStatusOf` reads that as
**cancelled** — so the rule was measuring the skip rather than the day mapping. A live roster is
seeded now, and the cancelled case is asserted deliberately beside it, because a guard nothing
measures is a guard that can quietly become the reason a rule passes.

### Two things the audit found in the instruments rather than the app

**`check-flow`'s send-path journey seeded two Kind answers the form has not offered for months** —
`'A session of your own'` and `'A shared class — join the waiting list'`, against the real `Instant
class` / `Waiting list class`. It went on passing because `isWaiting_` is a substring test for "wait"
and the old label happened to carry one, so both branches really were exercised, **by luck, on two
strings nobody can choose.** It reads the step's own `options()` now and refuses if the two do not
take different send paths.

**And `computePrice` is named in two comments and exists nowhere.** The function that walks
`spec.windows` is `priceFrom` in `js/core.js`. **A backtick scan for the whole class of fault is not
shippable and was thrown away rather than committed**: over the four booking files it reports **38
findings and about one real one** — `orderPrints`, `toggleTopicTick`, `pastCard_`, `isClass_`,
`stepIsPanel_` are all things that were deleted and are correctly described in the past tense, which
is the house style. Nothing can tell that from a name that never existed. That is the
`check-rows.js` lesson, and the honest answer is that this one stays a reading job.

**The version stamps are bumped all four together**, because `backend/booking.gs` changed and the
You screen compares the whole stamp.

## A day is a question, so the week stopped being a picture beside one

**Asked for as "get rid of When and instead have the day names be the field questions. So it becomes
Monday field Tuesday field Wednesday field."** It is the fourth round of one complaint and the only
answer that is not a trade.

**THE THREE ROUNDS BEFORE IT WERE ALL THE SAME TWO BAD CHOICES.** The week was a block hanging under
a `When` row. Indent it to the answer column and its left edge lines up and its right edge cannot —
eleven pressable cells need 240px and the answer column beside three figure tracks is 78px, a
five-pixel cell. Collapse the figure columns to make room and the form loses `× RATE TOTAL`, which
is what *"now there's only 2 columns again"* was. Written, reverted, written, reverted; the
arithmetic is in `style.css` either side of `.bk-open`.

**A DAY IS A QUESTION.** *"Monday · which hours"* is a field with a label, exactly like *"Subject ·
which one"* — so it belongs on a row of the card rather than inside a picture drawn beside one. The
day name moves out of the grid's own 1.5rem gutter and into the label column every other question
uses; the eleven hours become that row's answer. Nothing is nested, nothing is indented, and *"the
grid is in the input column"* stops needing a rule to enforce it: the hours ARE in it, because they
are what the row answers.

**AND THE CELLS GOT BIGGER, WHICH NO VERSION OF THE OLD SHAPE COULD DO.** The `.slot-day` gutter is
24px that the label column was already paying for.

| | 320px | 390px | 768px |
|---|---|---|---|
| indented block, last commit | 13.6px | 17.6px | 18.7px |
| **a day as a row** | **15.8px** | **20px** | **21.2px** |

20px is the floor the note over `.hr` sets from a fingertip, reached for the first time since the
week was indented. The waiting-list card went 762px to **594px** and its blocks are 78.6px wide.

### The figure columns collapse per ROW now, not per card

**That is the whole difference between this and the rule reverted yesterday.** That one asked whether
the CARD was priced and collapsed every row when it was not — so an unpriced form lost its column
names entirely. This asks the question of the ROW, so the header keeps all five names on every card
and a row simply uses the width it is not spending. Measured at 390: **every dash and every day
strip share `111 → 351`**, which is the single right edge three screenshots were about.

**THE COST IS ON A PRICED CARD AND IT IS REAL.** `Venue` carries a surcharge and `Subject` does not,
so their two dropdowns come out 78px and 240px — the *"two editable fields, one above the other, in
two sizes"* the note over `is-bare` records from the last time this was tried. What is different is
that the columns are NAMED: a short value with `× RATE TOTAL` over the space beside it reads as a
row that has figures, which is what it is.

### One builder, three surfaces, and `short` stopped being a label

**`weekRows_` returns row objects rather than markup**, and the form, the waiting list and the
receipt all call it — so a week restyled once is restyled on all three. `stepGrid_`, `blockWeek_`
and `jobGrid_` are gone; `stepWeekRows_`, `blockWeekRows_` and `jobWeekRows_` replace them, and
`stepRows_` is a `flatMap` because one step is no longer one row.

**`short: 'When'` IS AN ANCHOR NOW AND NAMES NO ROW.** `SPINE` holds Monday to Sunday in that step's
place — **once**, deduped, because both week steps answer the same seven questions and only one of
them is ever on a card. What `short` still does is hold the position: `SPINE_EXTRA`'s
`{ after: 'When', row: 'Per session' }` pins itself to it, so that row still lands after Sunday
without naming a day.

**The hour numbers ride on Monday's own answer cell**, above its strip — one fact about eleven
columns, drawn once, which is `slotHead_`'s own argument for taking them out of seventy-seven cells.
A row of their own would need a name, a place in `SPINE` and a label column holding nothing. **And a
screenshot caught the one thing that went with it**: top-aligned, `Monday` sat level with the
NUMBERS rather than with its own boxes — the one row of seven where the eye could pair the wrong two
things. `align-self: end`, off `:has(.wk-hh)` rather than a class the builder has to remember.

### Two journeys failed and both were right to

**`every question the form asks has a row on the paper`** looked for a row called `When`. The
invariant is unchanged and what satisfies it is seven rows rather than one, read off `SLOT_DAYS`
through the harness — a list of day names written into the check would be a second copy to keep in
step.

**`the paper keeps the same rows whatever is answered`** tests that an `only:` step's row is on its
own branch and off the other. **A week step's rows are on BOTH by design**: `avail` is `only: 'wait'`
and draws Monday to Sunday, which is exactly what `slots` draws on the other branch. So week steps
are exempt from that one assertion, with the reason written in — and what still governs them is that
`stepWeekRows_` returns `[]` on the wrong branch, which the shape comparison covers. Every non-week
`only:` step is tested exactly as before.

### Nine till six, and the two spans had disagreed at both ends since the grid was written

**Asked for as "make it go from 9-6 instead of 10- to 8".** One line — `SLOT_HOURS` is written once and
everything derives from it, which is what the note over it was for — and the two ends were not
equally free to move.

**`AVAIL_HOURS` IN `constants.gs` IS `[9 … 19]`.** That is the span a tutor's own availability grid
offers and the cells `slotGrid` looks a booking code up in. The booking grid was `10 … 20`. So the
two disagreed at **both** ends, silently, for as long as both have existed:

| | |
|---|---|
| **hour 20** | no availability cell exists, so `tAvail['m20']` is `undefined` for everybody — **any tutor who had ticked a single hour was unavailable at eight in the evening, on every day, for ever.** The column was drawn, looked pressable, and was permanently grey |
| **hour 9** | had a cell and nothing could book it. A tutor ticking nine o'clock was recording a fact the form never asked about |

**Nine to eighteen sits inside `AVAIL_HOURS` at both ends**, so the disagreement is gone rather than
moved — and that is the rule rather than luck: anything wider than the sheet's own span comes up
grey for everyone the moment they set any hours at all, so `AVAIL_HOURS` has to move first. Written
where `SLOT_HOURS` is.

**Six is included, as eight was** — a session starting at six is a session. Ten columns rather than
eleven, and the cells go **17.6 / 22.2 / 23.5px** at 320 / 390 / 768, past the 20px floor at two of
the three widths. The morning block gains an hour by derivation with nothing to edit, which is
exactly the hypothetical that note was written as: `Morning 9, 10, 11 · Afternoon 12–16 · Evening
17, 18`.

## The week is thinner, and twelve pixels of every row were not the control

**Asked for as "make the grid squares and grid thinner".** Measured at 390 before touching anything:
a cell was **22.2 × 20** and a day row was **32.8** tall — so twelve pixels of every row were not the
cell, seven times over, and the week was 199px of a 518px card.

**`align-items: baseline` IS WHERE TEN OF THE TWELVE WENT.** `.bk-row` aligns a label's baseline with
its value's, which is right for a line of text beside a line of text and wrong for a label beside a
strip of boxes: a grid cell's baseline sits at the bottom of its content box, so the row grew to put
the day name's baseline there. `center` is what a row of boxes wants and it costs the other rows
nothing, because they do not have it. **The other two are `.bk-row`'s own `.1rem 0`**, which keeps
twelve lines of text apart and is not needed between rows whose content already has a 1px gutter.

**14px, AND WHAT SETS 14 RATHER THAN 12 IS THE DAY NAME.** `.hr`'s floor is 20px and its note says
why — *"below about 20px a cell 24px wide stops being reliably pressable"* — so this goes under it
deliberately, on the fourth asking, and `ACCEPTED_TAP` carries a smaller finding for it. At 12px the
cell stops being the tallest thing in the row and `Wednesday`'s own line box becomes the floor:
measured, 12px buys **two pixels** at 390 and costs a sixth of the target. Below the label there is
nothing left to win, which is a better place to stop than a number somebody liked.

| at 390 | cell | row pitch | the week | the card |
|---|---|---|---|---|
| before | 22.2 × 20 | 32.8 | 199.2px | 518px |
| after | **23.1 × 14** | **22.9** | **111.7px** | **430px** |

**The cells got WIDER doing it** — a 1px gutter between them rather than 2px, which is the same trade
the joined-hours bridge already paints into. At 320 it is 18.5 × 14 and at 768 24.4 × 14, `under: 0`
and no sideways scroll at any of the three.

### The waiting list quietly came with it, and `check-css.js` is what said so

**`blk` IS THE ONE THING THAT DIFFERS BETWEEN THE TWO WEEKS** — three cells a row can pay a real
fingertip where eleven cannot, which is the whole argument written beside `.hr.blk` — **and the day-
row refactor dropped the class from the markup.** So the blocks took the hour week's 14px along with
everything else. Nothing on screen said so and no measurement would have: a 14px block is a legal
box in a card that fits.

**What said so is a class styled and nowhere produced**, in a list that prints and does not fail. Put
back, the rule then had to be named **through the row** — `.bk-row.bk-wk .hr` is three classes deep
and a bare `.hr.blk` is two, so it had been losing a race it did not look like it was in.
`.price.faint` for the tenth time. Measured after: the blocks are **64 / 79.3 / 83.8 × 20**, and a
SAVED waiting list is five classes (`.rc.is-done .bk-row.bk-wk .hr`) and beats this in turn — right,
because a receipt's week is read rather than pressed.

### Three rules fought and two of the three fights were decided by file order alone

| | |
|---|---|
| `.bk-row.bk-wk .bk-v` | `gap` declared **1px at one line and 0 ninety lines down**. Both written deliberately, the first never applied. `check-css.js` |
| `.bk-row.bk-wk .slot-hours` | tied with `.rc.is-done .slot-hours`, three classes each, **on seven elements**. They agreed about the value, so nothing was ever wrong on screen — what was wrong is that the day the two stop agreeing the loser is whichever is further up the file. `check/cascade.js` |
| `.bk-row.bk-wk .hr` | tied with `.rc.is-done .hr`, **on seventy elements**. Named through the row, which is five and also settles the shut day without a second rule |

**And five receipt rules were compacting a grid the receipt no longer draws.** `.slot-grid`,
`.slot-row`, `.slot-day`, `.slot-row.is-shut .hr` and `.bk-open > p` were its copy of the week from
when the week was a block hanging under one row. `.bk-open` went with them — its rules had had no
markup since `jobGrid_` became `weekRows_`, and the arithmetic that ruled that shape out is kept as
prose where the rules were.

### The runner printed the last fourteen lines, and a long report ends with the part that is fine

**`check/press.js` failed once inside `npm run check` and the fourteen lines under the FAIL were the
twelve controls that are correctly quiet and a count.** Two full suite runs went into finding out
what that failure said; it could not be found from that output at all, and running the check alone
passed. **This repository's oldest shape pointed at its own runner** — *I did not manage to look*,
printed as a report.

**The tail stays, because for most checks it IS the finding.** What is added is the one fact it
cannot carry: that there was more, and the command that prints it. **Proved by mutation** — a second
`gap` on `.slot-hours` makes `check-css.js` fail and the visible fourteen lines read `(0) none`
three times and `rules read: 2033`, with `… 30 earlier line(s) not shown — node js/check-css.js`
underneath them.

## The week is half as wide, chosen over three shapes that would have been free

**Asked for as "i would like the grid to be half as wide as"** — the message arrived cut off
mid-clause, so the first move was the arithmetic for every reading of it rather than a guess. Ten
hour-columns across the answer column measured **194 / 240 / 253px** at 320 / 390 / 768, cells
**18.5 / 23.1 / 24.4 × 14**.

| half the width, as | 320px | 390px | 768px |
|---|---|---|---|
| **squeezed — still 10 columns** | **8.8px** | 11.1px | 11.8px |
| two rows of five hours a day | 18.6px | 23.2px | 24.5px |
| turned on its side — 7 day columns | 13px | 16.3px | 17.2px |

**THE OTHER TWO CHANGE THE SHAPE RATHER THAN THE SCALE, which is why they are free on width** — and
both were offered with their own numbers and their own costs (the five-hour rows double the week
from 112px to ~223px; turning it gives ten rows instead of seven and a new shape on all three
surfaces that draw a week). **The squeeze was chosen over all three with the arithmetic visible.**

**So it is one declaration and the entry is honest about what it costs.** At 320 a cell is 8.8px
with a 1px gutter — a fingertip covers about three columns at once, which is past where a wrong tap
is rare rather than merely possible. `ACCEPTED_TAP` says that in those words rather than dressing it
up, because a list of accepted compromises that reads as though nothing was given up is a list
nobody checks. **What makes it liveable is that a wrong tap costs nothing**: a lit hour comes
straight back off with another tap and nothing is sent until Send — the same argument that file
already makes for a Scrabble square.

**The LEFT edge does not move, which is the half four rounds of this were about.** A grid item with
an explicit width starts where its track starts, so the week still begins at **111.3** with every
other answer on the card; what changes is where it stops — 231.2 instead of 351.1.

**And it is one declaration on the answer CELL rather than two on the strips**, so the hour numbers
and the hours they name cannot come out different widths. That is `.slot-hh`'s own note about a
header sized by hand, and it is why the numbers were then measured rather than assumed: **6.4px of
ink in an 8.8px box at 320**, so a two-digit hour still fits with room either side, and nothing
scrolls sideways at any width.

**NOT THE BLOCK WEEK.** `blk` is the class that already says *this week's cells are different* —
three a row, which is why they can pay a real fingertip where eleven cannot — so the waiting list is
untouched at **64 / 79.3 / 83.8 × 20**. Halving those too would have shrunk the one grid in this app
that is not a compromise, to answer a complaint about the other one. They are never on the same card.

### What the measurement found on the way, and has not been fixed

**Measuring every row's box to answer this printed two things nobody had asked about**, both at 390:

| | |
|---|---|
| **the dashes have four more left edges** | every real answer starts at **111.3** and every label at **38.9**, but a blank row's label track is `max-content`, so its dash starts wherever its own label ends — `Dates` at 75.5, `Status` at 82, `Asked for` at 101.3, `Extra subj.` at 114.2 |
| **the header labels the wrong place** | `ANSWER` spans **96.6 → 221.7** and the answers underneath it run to **351.1**, because the header keeps five tracks and every other row collapses to two. So `×` and `RATE` are printed over space the row below uses for its answer |

**And the thing that has made this flip-flop for fourteen rounds is that `check/fixture.json` has no
`pricing` key.** `bookPrice()` returns null, so **every measurement and every screenshot of the
ordinary form has been of a card where the money columns are empty** — hidden once, put back,
collapsed per card, collapsed per row, each decision argued from a card that could never show the
thing being argued about. `waitlistSeat` was added for the waiting-list state and prices only that
branch. Written down rather than fixed here, because it is the next piece of work and not this one.

### And one step thinner again, which is where the hour numbers take over as the floor

**Asked for as "can you make the grid even slightly thinner".** The word had meant HEIGHT the last
time it was used and WIDTH this time, so both axes were measured before either was moved — and one
of them turned out to be spent.

**THE HEIGHT AXIS IS GONE AND THE RE-MEASUREMENT IS WHY IT IS WRITTEN DOWN RATHER THAN QUOTED.** At
390 the day name's own line box is **14.8px against a 14px cell**, so the LABEL already decides the
row: asking for a 13px cell takes the whole week from 111.7 to **110.7** — one pixel, spread across
seven rows. At 320 the label box is 12.3px and there are about twelve pixels to be had, on the
narrowest phone only. The note over `.bk-row.bk-wk` already claimed the day name was the floor; this
is the measurement that confirms it at the width the app is mostly read at.

**So the width took the step, and it stops at 44% because the NUMBERS become the floor** — the same
shape of stop as the day name on the other axis, which is what makes it a place to stop rather than
a number somebody liked:

| | 320px | 390px | 768px |
|---|---|---|---|
| full width | 18.5px | 23.1 | 24.4 |
| half | 8.8 | 11.1 | 11.8 |
| **44%** | **7.6** | **9.7** | **10.3** |
| hour number, ink against its box at 320 | **6.4 in 7.6** | — | — |

**At 42% that margin is 0.9px and at 40% it is 0.5px**, which is inside the difference between this
container's font rendering and a real phone's — so 44 is the last step with a margin anybody can
trust, and the thing that breaks below it is the LABEL rather than the target.

**Measured after**: week 105.4 / 111.7 / 116.1, card 530 / 593 / 617, `under: 0` at every width, no
sideways scroll, and the block week untouched at 64 / 79.3 / 83.8 × 20. 37 checks pass.

### The waiting list takes the same width, and the word it stores is not the word on the header

**Asked for as "the waitlist grid needs to take from the instant class grid. Same width. But there's
no individual slots. Just chunks."** The width is one declaration — the block week was excluded from
the 44% for exactly one commit and the exclusion is gone.

**THE ARGUMENT FOR EXCLUDING IT WAS ABOUT THE CELL AND THE CELL SURVIVES.** Three columns in 44% is
**27.8 / 34.5 / 36.5px wide by 20 tall** — still a real fingertip, and still about three times the
hour cell beside it on the other branch. What that argument did not weigh is that the two branches
of ONE card were drawing one control at two widths, which is what somebody switching Kind actually
sees. `blk` goes on carrying the height, which is the difference that is still real.

**AND THE LABELS COULD NOT SURVIVE IT, which is the part that is not a one-line edit.** Measured at
44% before anything was changed: `Afternoon` is **34.5px of ink in a 34.5px box at 390** — zero
margin — and at 320 it **wraps onto two lines**, so the header grows to 14.8px against its siblings'
8.9 and reads as ragged. `Morn · Aft · Eve` is 12.7 / 9.6 / 9.6 in 27.8 at the narrowest.

**SO `head` IS A SECOND FIELD AND `name` IS UNTOUCHED.** `name` goes through `blockPhrase_` into the
cell as `Monday morning`, and `waitlistWhen` on the backend splits the event message on commas and
tallies those phrases — so shortening it would leave every row written before today saying `morning`
and every row after it saying `morn`, **counted as two different answers in the one place somebody
reads to decide when to open a class.** That is two spellings of one answer, which this file records
under `level`, `exam_wave`, `topics` and `company`, and it would have been invisible until a tally
was wrong.

**The shortening is visual only and that was proved on the wire**: pressing a cell stores
`"Monday morning"` and its `title` and `aria-label` are still `Monday morning`, so a screen reader
and a long press both get the full word. No backend change, and nothing already in the sheet moves.

**Measured after**: both weeks 85.4 / 105.5 / 111.5 wide, every header label on one line at every
width, `under: 0`, no sideways scroll, 37 checks pass.

## "Too many attempts" was paid for by the person and free to the guesser

**Reported as "I don't like this too many attempts nonsense just let me sign in"**, and the
arithmetic agrees with the complaint rather than merely conceding to it. `MAX_TRIES: 5`,
`LOCK_MINUTES: 15`, and `tries` set back to nought at every lock — so every lock was the same
length, for ever.

**A FLAT LOCK IS THE WRONG SHAPE IN BOTH DIRECTIONS.** Somebody who mistypes their own four digits
five times is held out for a quarter of an hour with nothing to do but wait. A script is held out
for the same quarter of an hour and does not mind, because waiting costs it nothing: **5 tries per
15 minutes is 485 guesses a day, so ten thousand PINs is three weeks.** The person pays attention
and the guesser pays nothing.

| | wrong answers before anything happens | guesses a day after that | ten thousand PINs |
|---|---|---|---|
| **before** | 5 | **485** | three weeks |
| **after** | **10** | **38 on the first day, 24 after** | **over a year** |

**Ten free, then one minute, two, five, fifteen, and an hour for ever.** Ten wrong answers is past
anybody's second guess at which of their PINs it is; a guesser gets fifteen tries in the first
twenty-three minutes, thirty-eight in the first day, and one an hour after that. **Gentler on the
person and twenty times harder on the guesser in the steady state**, which is why the flat number
was worth replacing rather than raising.

**Those three figures are measured**, by walking the ladder in a loop against a clock — the first
draft of this section said 480 and 24 from arithmetic done in my head, and both were wrong by enough
to matter. A number written into a comment and never run is the shape this file records under "all
18 checks pass".

**`tries` IS THE ESCALATION'S ONLY MEMORY and it is a column that already exists.** Resetting it at
each lock is precisely what made the wait flat; it counts on now, and `authNewSession_` already
clears it on a successful sign-in — so the rung is *wrong answers since you last got in* rather than
a second column to keep in step. No schema change, one rung per wrong answer, `WAITS` written once.

**And the sentence says how long.** *"Try again in a few minutes"* is the same words whether the
wait is one minute or an hour, so the only thing to do with it is keep pressing — which makes the
wait longer. `authWaitMins_` is one reader for the gate's yes-or-no and the number in the message,
because two functions asking the clock separately is a message that says four minutes about a wait
of five.

**The e-mail is sent on the FIRST rung only.** With a rung per wrong answer, one email each is an
email per guess — a mailbox nobody reads, and therefore the warning nobody sees.

### Getting back in when the hash and the PIN disagree, which is written down nowhere else

**`authSetPin_` clears the plaintext `pin` cell, so a row carrying a hash AND a plaintext cannot
happen by accident** — after any PIN change in the app that cell is empty. And `authCheckPin_`
consults the plaintext only when there is no hash, which is right: that is the migration path for a
row that predates hashing.

**What that leaves is an account with no remedy, and the owner's was in it.** If the hash stops
matching the PIN somebody believes is theirs — a PIN changed in the app and the old one typed back
into the cell by hand, or `AUTH_PEPPER` regenerated — every attempt answers *"Name or PIN not
recognised"* while the right four digits sit in the cell in front of them.

**THE SHEET IS THE RESET AND IT NEEDS NO DEPLOY.** On that person's row in `Ledger` → `people`:
put the PIN in **`pin`**, empty **`pin_hash`** and **`pin_salt`**, empty **`locked_until`**, and set
**`tries`** to 0. The next sign-in takes the plaintext path, succeeds, and re-hashes immediately —
the cell is cleared again by `authSetPin_`, so nothing is left lying about. Four cells, and the code
already does the rest.

**Emptying the hash is the whole of it**; putting the PIN back is what stops that being a lockout of
a different kind.

#### It happened, and the tell was the column that should have made it impossible

**Reported as "For some reason I can't login to my account", with the name and the four digits.**
The section above was written as a hypothetical remedy for a state nobody had been in. The row was
in it.

**THE SHEET IS THE DIAGNOSIS AND THE CODE IS THE PROOF.** On that person's row in `Ledger` ->
`people`: `pin_hash` populated, `pin_salt` populated, **and the plaintext `pin` holding the four
digits being typed.** `authSetPin_` writes the hash and clears the plaintext *in the same call*, so
that pair cannot be produced by any path through this code — the digits were typed back into the
cell by hand after the hash existed. And `authCheckPin_`'s second line is
`if (hash) return authSame_(...)`: **a row with a hash never consults the plaintext again.** So the
right answer was sitting in a cell nothing reads, one column away from the one that decides.

**`tries` IS WHAT MAKES IT CERTAIN RATHER THAN LIKELY.** `verifyLogin` reaches `authWrong_` only
after `findPerson` has found a row and `authCheckPin_` has returned false — a name that does not
resolve returns two lines earlier and a locked row returns one line earlier, and neither touches
that cell. It read 4. So the name resolves, the round trip works, and the PIN check is what fails.

**AND THE SAME CELL SAYS WHICH BACKEND IS DEPLOYED**, which is the one fact this environment can
never fetch — every host but GitHub is blocked, so what `/exec` is serving has always had to come
from somebody opening the URL. It can be read off the throttle instead: the version in this
repository locks only past `FREE_TRIES` (10) and never sets `tries` back, so **`tries: 4` beside a
`locked_until` that has been written is arithmetically impossible under it.** The version before it
locked at 5 and reset to nought, which produces exactly that pair. The sign-in throttle rewrite has
not been pulled into Apps Script, and the row proves it without a request leaving the container.

**The lockout is NOT the cause and both readings say so.** `locked_until` held yesterday's date. As
a real Date that is in the past, so `authWaitMins_` returns 0; as a *string* —
`new Date('24/09/2026')` is month 24, which is an Invalid Date — `getTime()` is `NaN`, `NaN > 0` is
false, and it returns 0 again. Worth writing down because the second reading is the one that looks
alarming and it lands in the same place: a `dd/mm/yyyy` string in that cell is a permanently *open*
account, never a permanently locked one.

**One branch this cannot rule out from here**, and it is separable by the sentence on screen: a row
whose `verified` cell says `PENDING` is refused *after* the PIN passes, with *"Please confirm your
email first"* — a different message, and a different cell to blank.

### `node js/check-secrets.js` — and the credential was in this repository, not in the sheet

**Found while reading `verifyLogin` to answer the above.** `backend/constants.gs` carried two usage
lines in the comment block explaining how to run a job from a URL, and where the placeholders belong
they had a real admin's real name and their real four digits — the same four being typed into the
sign-in box. For months, under a heading about deployment, in a repository that is **public**.

**DELETING THE LINE UN-PUBLISHES NOTHING.** Git history is permanent, which is the sentence this
file opens its three-question test with and repeats for `ticks_1/2/3` and for the learner profiles.
The line going stops the next reader finding it; **the only repair that repairs anything is changing
the PIN.** That is the owner's to do and it is said plainly rather than implied, because a tidy diff
here reads exactly like a fix.

**One question, one right answer: a PIN literal in this repository must be `0000`.** Not "must look
like a placeholder", which is a judgement — a single reserved value, so there is nothing to tune and
nothing to argue about. Measured across all 207 source files before the rule was written: **seven
PIN literals, every one of them `0000`**, all in a usage line telling somebody to substitute their
own. The word boundary is what keeps `spin`, `pinned` and `pinch` out of it.

**It is deliberately not a search for secrets in general.** An API key or a token needs a rule that
decides what a high-entropy string is, and this file already records what a check with ninety-five
findings and two real ones is worth. Four digits beside the word `pin` is the one shape this app
has, because four digits beside the word `pin` is what this app's credential IS.

**AND IT CAUGHT ITS OWN AUTHOR ON ITS FIRST RUN.** The first version of its header pasted both
`constants.gs` lines in to show what the fault looked like, and the run named `check-secrets.js:7`
and `:8`. **A check that quotes the credential it found is the credential in one more file** —
which is why it prints the line and the digit count and never the digits, the same argument
`check-handles.js` makes about never quoting a refused word back. Proved by mutation in both
directions.

**The fault it guards is the one no instrument here could have seen**, and that is the whole
argument for it: nothing renders a comment, nothing measures prose, and `check-backend.js` reads
those same files asking a different question entirely. It was found by a person reading the file for
an unrelated reason — which is this file's own definition of luck.


## Library card numbers and PINs are three columns on `people`

**Asked for as "a place to make notes for library card numbers and library card pins"**, and the
three-question test at the top of this file answers where it goes before anything is designed.

**IS IT SECRET? YES — so a sheet, and never `data/`.** This repository is public and its history is
permanent. A card number and its four digits are exactly the shape this file already keeps out of
git alongside PINs, e-mail addresses and dates of birth.

**DOES THE APP WRITE TO IT? YES**, through `updateProfile` from the Settings column — which is what
makes it a sheet column rather than something kept on the phone. A note in `localStorage` is a note
you lose when you change phone, and the point of writing a library card number down is that it is
there in a year when you cannot find the card.

**`library_note` IS THE THIRD COLUMN AND IT IS DELIBERATE.** Somebody with cards for two boroughs,
or a card in a child's name, has a fact the other two have nowhere to put — and the alternative to
one free line is `library_card_2`, the numbered-column fault this file already records under
`images`, under `needs` and under the practicals' `equipment_1 … equipment_10`.

**WHO SEES IT: nobody by default.** `doGet` sends no profile column to anybody — `profileFields` is
the SHAPE of the form, not its values — so these three never reach the public payload. They reach
the person themselves in their own signed-in reply, and an **admin** through `getProfile`, which is
how every other column on this tab has behaved since it was written. Said rather than buried,
because it is a PIN and the owner is the admin.

**One entry in each of `PROFILE_GROUPS`, `CLIENT_GROUPS` and `STUDENT_GROUPS`** — a tutor, a parent
and a student each have one card and one set of digits they cannot remember — and `PROFILE_EDITABLE`
is derived from those three, so there is no second list to add it to.

### Every box on that form opened empty, and the first Save wrote the blanks back

**Found while wiring the new group up, and it is the older and worse fault.** `settingsPages_` fills
its fields from `USER.profile`, and **nothing has ever sent one to the person themselves**:
`getProfile` builds one for an ADMIN looking at somebody else, and `loginReplyFor_` — the reply a
person gets about their own row — did not. So every group on that column drew a card of blank boxes
on a fresh sign-in, whatever was in the sheet.

**AND A BLANK BOX IS NOT THE ABSENCE OF AN ANSWER TO `me-save`.** It gathers every `[data-me]` in
the card, empty ones included, and `updateProfile` writes what it is given. So opening Settings,
pressing Save on *About you* and changing nothing wrote `''` over the headline, the photograph, the
years of experience and all three adjectives. **The one screen for editing your own details was the
one screen that could erase them**, on the first press, with a toast saying *Saved*.

**`profileOf_` is the one builder and both callers use it.** It is `getProfile`'s own block lifted
out: an admin's view of somebody and that somebody's view of themselves are the same object, and
writing it twice is the second reader this file records under `documents_()`, `factsNow_` and
`childrenOf`. It is not a disclosure — the reply is answered only after `authCheckPin_` has passed,
and it carries the row of the person who just proved they are it.

### And the column moved next to You, because it was eleventh of eleven

**Reported as "The account setting should be in new coloumn I don't see it".** It was there and it
worked — `screen('settings')`, five pages, the `Your settings` tile on your own account card opens
it — and it was **four swipes past You** with no tab bar to jump with. `sort_order` 8 in
`data/settings/columns.json`, which is one cell and no deploy: the one column you reach for from
your own card is now the one beside it. Saved takes the end.

### "your own booking" was the row read back to you

**Reported as "There seems to be writing under one of the fields at the top. It's redundant or
unnecessary."** Measured rather than guessed at: the booking card draws its notes as `.bk-say`
under the row they belong to, and the first one on the card, under the first field, was

| under | | |
|---|---|---|
| **`For`** | *your own booking* | over a row already reading `For — <your own name>` |
| `Kind` | *It happens. Yours from the moment you pay…* | says what the dropdown label cannot |

**One fact drawn twice**, which is the fault this file already records where the roster's `name` put
an `<h3>` above every widget's own heading: both were correct and both were on the screen at once.
Thirteen pixels, on the first field of the app's most crowded card.

**The other branch of the same note stays, and the line between them is worth stating.** `Nobody yet
— just open it` is what you PICKED; *"the list opens empty, and families join it"* is what happens
NEXT, and nothing else on the card says it. A note that repeats the row is a caption; a note that
says what the row cannot is why the mechanism exists.

## A title is a role that decides nothing, and the cell it goes in was already built for it

**Asked for as "I want to add a role. For George he is the head of boxing. For now leave this as
just a title or something. In the future it will mean something. Just have it be in code somewhere
idk."** The first move was to read the role machinery rather than invent a column, and most of the
answer is that it was there already.

**`rolesOf` SPLITS THE `role` CELL ON COMMAS** — *"a person may hold SEVERAL roles… one role is not
more real than another"* — **and `mainRole` picks from a DECLARED list**, `['admin','tutor','client',
'student']`, so a value that is not on it can never win. Every gate in this project asks
`hasRole(row, 'tutor')` and nothing asks the other way round. So a title sitting beside a real role
grants precisely nothing today **by construction rather than by somebody remembering**, which is
what made this three fields rather than a schema change.

**IT IS DECLARED IN `ROLE_TITLES` RATHER THAN LEFT AS A STRAY CELL STRING.** `head of boxing` typed
into the sheet with nothing naming it prints in the roster in lower case, means nothing to a reader
of `constants.gs`, and the day somebody DOES want it to gate something there is no way to tell
whether it was deliberate or a typo. One entry, one written reason — the `ACCEPTED` / `VOCAB` /
`RETIRED_FACETS` / `HANDLE_ALLOWED` pattern for an eighth time — and the note says where to look
when it starts to mean something.

**THE COMMA IS LOAD-BEARING AND THAT IS THE ONE THING TO GET RIGHT IN THE SHEET.** The cell must
read `tutor, head of boxing`. A row holding only titles has no real role left, `mainRole` falls back
to `client`, and George drops off the tutor list and off the site — the control doing the opposite
of what it was asked for, silently.

**`titlesOf` READS OFF `ROLE_TITLES` RATHER THAN "whatever `mainRole` did not pick".** That second
rule is one line shorter and would print a typo in the role cell as somebody's job title, on a
public card, which is the fault `/required practical/` matching *"AQA-aligned, NOT a required
practical"* already cost five cards.

**`titles` IS A SEPARATE PAYLOAD FIELD, NOT A LONGER `role` STRING.** `role` is one word the card
sets in the pass's own label and the funnel reads as a kind; joining `Tutor · Head of Boxing` into
it would put a title through every reader of that field and there is no way back out of one string.
Drawn in the heading that already says what somebody IS — a row of its own would be a twelfth
label/value line for a fact three words long — and read through `profList_`, because the shape is
not something that card gets to assume.

**And `listPeople` and the card were two lookups for one label.** `ROLE_LABEL[x] || x` written out
in `dopost.gs` would have printed a title as the raw lower-case cell in the roster while the card
printed it properly. `roleLabel_` is the one reader, which is this file's sentence about
`documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf`.

**And the fixture said `role: 'tutor'` where `doGet` sends `Tutor`.** Lower case beside a Title Case
title reads as broken, and it is the shape recorded here where the fixture stated `focus` as a
string `doGet` does not send. Measured in a browser after: the account column draws
`Tutor · Head of Boxing`, and every other heading is unchanged.

## Eleven columns, eleven different top edges, and nothing could see it because nothing looked across

**Reported as "Navigation is a bit buggy. When I swipe left and right on certain things I see the
edge are slid up or down at times. Happens with games and tools widget too."** Measured at 390×844
before anything was touched — the top edge of each column's current card:

| | | | | | | | | | | |
|---|---|---|---|---|---|---|---|---|---|---|
| make | tools | account | booking | reel | games | settings | stuff | feed | dm | saved |
| 98 | 108.5 | 117 | 125.5 | 167.5 | 199 | 223.5 | 255 | 286.5 | 322.5 | **343** |

**A 245px spread**, and screenshotted mid-swipe it is exactly the report: the calculator and the
chess card side by side with ninety pixels between their top edges.

### It is static, which is the half worth proving before changing anything

**"At times" reads as a drift and it is not one.** Sampled every frame of a real drag: every
column's `translateY` is constant through the whole gesture. Sampled for three seconds after
landing: unchanged. Four round trips between Tools and Games: the same two numbers, eight times.
What varies is WHICH PAIR of columns you are between — `stuff → feed` is 31px and reads as fine,
`settings → saved` is 120px and reads as broken.

**THE CAUSE IS THE CENTRING.** `columnShift_` was `boxH / 2 - (offsetTop + offsetHeight / 2)` — each
column centred on its OWN card — and the cards are different heights. Measured, every card's CENTRE
is at 422px, exactly half of 844. The centres agreed perfectly; the edges never could, and the edge
is the only part of a neighbour you can see.

### The line the tops agree on is the stylesheet's own reserve, not a number I picked

**`.pane` is capped at `100dvh − var(--bar) − var(--safe-bottom) − 2.5rem`**, so the stylesheet
already keeps a strip of the screen clear. The whole of that strip goes ABOVE the card, and two
things fall out of that choice:

- **the tallest card a pane may hold still fits** — its bottom lands exactly on the bottom of the
  screen. Proved at 320×568, where a card really is at the cap: bottom edge **568 of 568**. A line
  chosen by eye could not promise that at every screen height.
- **it leaves a sliver of the card above** — 20.7px at 390×844 against the 23px of the column beside
  it. The two axes peek by the same amount without either number being told the other.

**SPLITTING THE RESERVE WAS WRITTEN FIRST AND MEASURED.** Half above and half below — which is what
centring a cap-height card gives — puts every column on **18.5px**, and 18.5 minus the column's own
16px gap is **two and a half pixels of the card above**. Aligned, and the vertical affordance gone.
The reserve is small because the cap is generous, so halving it halves almost nothing.

| | tops: min | max | spread | tallest card's bottom edge |
|---|---|---|---|---|
| 390×844 | 36.7 | 37 | **0.3px** | 663.8 of 844 |
| 320×568 | 33.3 | 33.8 | **0.5px** | **568 of 568** |
| 768×1024 | 38.8 | 39.1 | **0.3px** | 683.5 of 1024 |

**WHAT IT COSTS, said rather than buried**: a card much shorter than the screen no longer floats in
the middle of it. The one-page columns are where that shows — Saved's card was at 343 and is on the
same line as everything else now, with the space below it rather than split above and below. That
is the price of a row of columns reading as a row, and it is one `return` to put back.

**And the peek ABOVE was the same fault down the other axis.** It was `top − 16px`, so it varied by
the same 245px: 92px of the previous card on Tools, 327px on Saved. It is 21px on every screen now.

### `COLUMNS OUT OF LINE` — the rule, because nothing here measures between screens

**Every geometry rule in `check/ui.js` measures ONE screen**, and this is a fault BETWEEN screens:
each column was individually perfect. So the question is asked once per width and visitor, after
every screen has been visited — there is no per-screen pass this could have been a line in.

**The tolerance is 2px and it is sub-pixel layout and nothing else**: the spread is 0.3–0.5px across
the three sizes, which is `offsetTop` rounding. A column with no page is skipped rather than counted
as zero — a screen this visitor cannot reach is not a column out of line.

**Proved by mutation**: the old centring back and it names six findings, at every width and both
visitors, worst **258.5px apart across 11 columns — dm at 373, stuff at 114.5** at 320px, and exits
1. The real files report nothing.

**And three notes described the centring in the present tense.** `columnShift_`'s own header, the
camera's note in `posts.js` and the state's note in `check/states.js` all said "centres"; the
mechanism the last two describe — a card that grows after its column was placed is a card the
placement never saw — is unchanged, and only the word was wrong. Corrected in all three rather than
in the one I happened to be editing, which is this file's own sentence about `cost: 0`.

### And the tap-target rule had been one translate away from thirteen false findings

**The first clean run of the aligned columns reported `TAP TARGET (13)`, every one of them printing
a size that passes.** `<button>.mc-btn.fn "sin" is 51x44` — flagged for being under a floor of 44 by
a report that says it is 44. A finding nobody can act on, which is the tell.

**Measured at full precision it is `43.99998474121094`.** `offsetHeight` is 44, `min-height` is
`44px`, `height` computes to `44px`. The control is 44px. What is not 44 is
`getBoundingClientRect`, which on an element inside a translated ancestor is the floating-point sum
of its layout position and the column's `translateY` — and the top and the bottom round the other
way from each other.

**SO IT IS THE INSTRUMENT AND NOT THE APP, and it has been one translate away since the rule was
written.** The columns were sliding by 108.5px, which happens to sum exactly; they slide by 33.8
now, and thirteen controls that had not changed by a pixel started failing. Proved by taking the old
`columnShift_` back — the thirteen go, and the six `COLUMNS OUT OF LINE` come back.

**Half a pixel, not a rounding.** `Math.round` would wave a real 43.5px control through. Everything
genuinely under the floor in this app is 38, 40, 20 or 13, so half a pixel is nowhere near any of
them and is below what a screen can draw or a stylesheet can mean. **Proved by mutation**: forcing
`.mc-btn.fn` to 43px names all of them and exits 1.

## The thing you pressed stayed dark for an eighth of a second

**Reported as "make the button pressing feel more responsive on the finder."** Measured before
anything was changed, at 8x CPU — an ordinary phone — answering one of the funnel's questions:

| | |
|---|---|
| finger down → the press state painted | 19–42 ms |
| **finger up → the screen having changed** | **130–138 ms** |
| the whole of it, contact to answer | 270–308 ms |

**`:active` ENDS AT THE LIFT.** So a tap is a brief flash, then an eighth of a second of a screen
identical to the one you were just looking at, and only then the answer. That gap is the complaint:
nothing on the phone says the tap landed, and the reasonable conclusion is that it missed.

**AND ON THE OWNER'S PHONE THERE MAY BE NO FLASH AT ALL, which is the half nothing here can test.**
`:active` on touch is a browser heuristic rather than a rule — it is withheld until the gesture is
known not to be a scroll, and Safari has historically wanted a touch listener on the ELEMENT. Every
listener this app has is on the window. So the one piece of feedback a press had was the piece that
depends on the one platform this environment cannot reach.

**A class depends on none of it.** `pressMark_` in shell.js puts `.is-pressed` on the nearest
`[data-do]` at `pointerdown` — before any browser is deciding what the gesture is — and takes it
off **two frames** after the handler ran, which is one frame after the repaint it is covering for
has painted. Measured through a `MutationObserver` in the page rather than from the harness, which
got it wrong first: a round trip out to node is longer than two frames, so the class read as gone
the instant the finger lifted. In the page: **lit at 0 ms, and never unlit — the repaint replaces
the row carrying it at 168 ms.**

**IT IS NOT A SECOND PRESS STATE.** `.is-pressed` is added to the ten `:active` selectors that
already exist rather than given rules of its own. Two descriptions of one look is the `.reel .over`
fault, and these two would sit on the same element a tenth of a second apart — which is the version
somebody notices. **A control with no `:active` rule is unchanged**, deliberately: the mark is on
every control in the app and the stylesheet decides which of them show it, exactly as `:active`
does.

**The drag is the clear that is not optional.** A swipe that begins on an answer must not leave that
answer lit for the length of the gesture — it reads as the row being held down while the column
slides under it. Cleared at the one line that already decides a press has become a drag, beside
`PRESS_MOVED`, so the two cannot disagree about when a tap stopped being a tap. Measured: lit at
0px of travel, dark at 112px, and no answer added. A 1200 ms timeout sits behind all of it, because
a mark that is never cleared is a control that looks permanently pressed and the cost of one wrong
clear is nothing.

### `check/press.js` asks whether it lit up, and the finder had to learn to hit-test

**NOTHING HERE COULD SEE EITHER HALF OF THIS.** The press pass reaches a control with
`dispatchEvent`, which fires no `pointerdown` at all and says so in its header — *"by the DISPATCH
rather than by hit-testing, because whether a box can be hit is `check/ui.js`'s question"*. And
`check/ui.js` measures whether a control can be read and hit, where **a control with no press state
measures perfectly.**

**TWO QUESTIONS, BECAUSE THE TWO FAILURES ARE OPPOSITE**: a mark that never goes ON is the app
silently back to feeling dead, and one that never comes OFF is a control that looks permanently
pressed. Plus the drag, which runs first, so anything still lit afterwards is a mark the drag failed
to clear. **Proved by mutation in both directions**: the `pressMark_` call removed names three
columns *"nothing lit"*; the clear removed names two *"1 still lit after"*; the real files report
*"53 swipes, every one landed where it should"*.

**THE FIRST RUN REPORTED FIVE COLUMNS DEAD AND EVERY ONE WAS THE HARNESS.** The drag above turns the
page — that is the whole thing it asserts — and the press was using the coordinate taken BEFORE it,
so it landed on card the control had slid away from. The spot is found again after the drag.

**AND THE SECOND RUN REPORTED TWO, WHICH WAS A REAL FAULT IN THE FINDER.** `Tools` and `Games` both
chose the star tile at the foot of a widget card: a rect in the middle of the screen whose own
centre answers `elementsFromPoint` with the bare `.screen`, because it is **clipped below its pane's
fold**. A rect is a layout position and a pane clips. That never mattered while every press here was
dispatched; the moment one became a real pointer, the finder had to answer the other question too —
so it checks `document.elementFromPoint` at the centre and skips anything that is not there.

**IT MAKES THE DRAG TEST HONEST AS WELL, which is the part worth having.** A drag from a point where
the control is not begins on bare card — the exact case that test exists to stop being the only one
measured — and it would have gone on passing while proving nothing. 59 swipes became 53, and the six
that went are the ones that were never touching a control.

**The repaint itself was profiled and deliberately left alone.** Of the 130 ms: `stuffQuestion` 33,
`fillStuffPages` 8, `stuffWindow_` 3, `filterChips` 2.7, and about 74 ms of the browser's own style,
layout and paint. Splitting it — chips and the next question now, the results a frame later — would
put the first visible change at 66 ms, and it is not done: `paintStuff(keepPage)` is also called by
a star and by a dropdown on the booking form, where you are standing ON a result page, and a
deferred second half would show the old card for a frame. **The gap was the problem and the mark is
what fills it**; halving a number nobody can see any more is not worth a conditional repaint.

## The receipt says where a booking has got to in five ticks

**Asked for as "I think it needs a line for requested and it gets ticked automatically by system.
Then line for accepted, then line for paid, then line for started. Then line for completed. All tick
boxes."**

**What was there was `Stage`** — one row carrying one of `jobSaid_`'s four sentences, *"Asked for —
waiting on us"*, *"Accepted — waiting for payment"* — **and `Asked for`, a date.** A sentence says
where you are; it cannot say the shape of the whole thing, so "how far along is this" took reading a
line and knowing the vocabulary. Five ticks say it at a glance, and **the first un-ticked one IS
what happens next**, which is the half the sentence was carrying.

| | is it ticked | from |
|---|---|---|
| **Requested** | always — the row exists | `createdAt`, drawn beside it |
| **Accepted** | `jobAccepted_(j)` | every seat Agreed, Paying or Booked |
| **Paid** | `jobStage_(j) === 'receipt'` | a seat at `Booked` |
| **Started** | the first planned date has passed | `startDate` |
| **Completed** | the last planned date has passed | `endDate` |

**NOBODY TICKS THESE BY HAND, AND THAT IS WHY THERE ARE NO CHECKBOXES IN THEM.** Every one is
already derivable from the roster the backend folds out of the events and from the session dates. A
tick somebody could press would be a SECOND source for a fact the roster already answers, which is
the drift this file records under `documents_()`, `factsNow_` and `childrenOf`. So they are a MARK
rather than a CONTROL: `.check` is this app's only checkbox and it is a `<label>` round an `<input>`
at a 44px floor, and five of those is 220px of pressable nothing on a card whose headroom has been
measured in single pixels. `.bk-tick` borrows that control's argument — a visible edge, a ghost ✓ in
an empty box, gold when it is done — at receipt-row size.

**EACH ONE ASKS ITS OWN QUESTION AND THEN THE ONE ABOVE IT.** A chain, because the calendar alone is
not evidence that a lesson happened: a session accepted and never paid for, whose start date has
passed, would tick `Started` off the clock — the app claiming teaching took place that nobody paid
for. **And cancellation falls out of it for free**: `jobAccepted_` answers false on an empty roster
and `participantsOf` empties the roster when everybody has gone, so a cancelled booking ticks
`Requested` and stops, with nothing here that knows the word. Measured in five states through the
real app: paid with future dates → 3 of 5; the same dates in the past → 5 of 5; nobody agreed → 1;
nobody left → 1; the blank form → 0 of 5, drawn as five empty boxes.

**THEY ARE ON THE FORM TOO, AND NOT MARKED `only:`.** `SPINE`'s own argument is that the form and
the receipt are one document across TIME, so a row that appears only once the thing is saved is a
row that changes shape at the moment somebody is checking it — which is exactly what `check-flow.js`
refused when that argument was made about `Asked for`. An unsent booking shows the five stages
ahead of it and pressing Send ticks the first.

**`stageRows_` IS ONE BUILDER AND BOTH DOCUMENTS CALL IT**, which is the whole of what stops them
drifting — the same argument `weekRows_` makes for the three week grids. `j` is null on the form.

### `jobSaid_` claimed three readers and had one

Its own note said *"the receipt row, the booking form and the stamp on the card"*. **Measured before
deleting it: one.** The stamp went when the four receipt skins became one document — written up in
`style.css`, which kept the argument and deleted the code — and the form pushes a literal dash. So
the sentence had one home and it was the row this replaces. **Third sentence in this file to outlive
the thing it described**, after `.favwrap.is-fav` and the dead `kind === 'paper'` guard.

### `created_at` has been written by three handlers and sent by nothing

`createJob`, `joinWaitlist` and `openWaitlist` all write it; `doGet` sent it nowhere. So
`if (j.createdAt) push('Asked for', …)` in `jobRows` **could not fire**, and a row this repository
argued about at length — `check-flow.js` refused to let it be dropped — has never once been drawn on
a receipt. **This repository's oldest shape for the eighth time**, after `figure`, `orderPrints`, the
four message actions, `exam_date`, `wow`, the eleven dead Settings writers and the two high-score
columns. It has a reader now: `Requested`'s own value.

**`check-payload.js` cannot see this class of fault and says so** — it compares top-level `DATA.*`
keys, so a field inside a row that nothing reads is invisible to it.

### And the `Dates` row has printed a dash on every receipt ever handed over

**`doGet` ships the run as `dates: dates.join(', ')` and `jobRows` read `j.sessionDates`** — a name
the payload has never carried. So the one row on the document whose whole job is to record WHEN the
sessions are was empty on every real booking, and the fix is one `||`.

**NOTHING COULD SEE IT, AND THE REASON IS THE ONE THIS FILE KEEPS FINDING.** `check/states.js` seeds
a job carrying `sessionDates` — **the name the CODE reads rather than the name the SERVER sends** —
so the lab has been measuring a shape that does not exist and reporting the row working. That is the
fixture stating `focus` as a string `doGet` does not send, one data path along. The state seeds
`dates` now, with a paid seat and a future start so the five ticks come out **three on and two off**:
a state where all five agreed would measure one box five times.

### The rule moved with the rows, and it is a stronger rule than the one it replaces

`check-flow.js` asserted that `Stage`, `Status` and `Asked for` are all on the blank form and all
dashes. The invariant is untouched and the rows have changed, so it asserts the five stages are on
both the blank and the priced form, drawn as tick boxes, **none of them ticked** — and that
something IS ticked once `book-send` has gone. **The list is read off the app's own `JOB_STAGES`**
rather than written out here, and **the tick is read off the whole cell rather than its text**,
because a ticked and an unticked box hold the same glyph and differ by one class: a rule reading the
text would pass on both, which is the shape of every inert check this repository has deleted.

**It replaces a count of the word "Stage".** That version asked only that the string appeared twice
— so it would have passed on two blank forms. It was there to say "the second document is the
booking widget" and could not say the widget had anything in it.

**Proved by mutation in three directions**: every stage always ticked names five rows on the blank
form and five on the priced one; nothing ever ticked names the receipt under the form; and the tick
class renamed names all ten. The real files pass all 30 journeys.

### A screenshot caught the one thing measurement could not

**`Requested` carries a date and the other four do not**, so written box-then-date its box sat where
its date started while the other four sat at the card's right edge — **five boxes in two columns**,
on a row of ticks whose whole job is to be read down. `.bk-v` is right-aligned, so the box goes
LAST. Every row measured correctly, nothing overflowed, and no check here asks whether five things
line up inside their own column. **Fifteenth time this file writes that a screenshot is the last
word on something drawn.**

### And `check/ui.js` found the four pixels the waiting-list card did not have

**FIVE ROWS WHERE THERE WERE THREE.** `Stage`, `Status` and `Asked for` became five ticks and
`Status`, and the waiting-list branch is the card that `check/ui.js`'s own note records arriving
with **three pixels of headroom at 768** — *"there is no headroom on this branch at all, which is
why the block grid's cells are 20px rather than 44"*. It said so on the first run after the ticks
went in: *".pane holding pane hides 4px below its own fold"*, at 768 and 1280, signed in.

**THE LEADING IS WHERE IT CAME FROM, and the blanks had already solved it.** `.bk-v` is
`line-height: 1.35`, which is a line for READING — and `.bk-row.is-blank` already drops to 1.1 with
the argument written beside it: *"a dash is not read, it is counted past on the way to the row
below"*. A tick is the same: five of them are SCANNED down, which is the whole point of drawing
them as a column. At 1.1 a stage row is **15.7px against an ordinary row's 19.6**, the five come to
78px instead of 94, and the card is back inside its pane with eleven pixels to spare.

**Asked of `:has(.bk-tick)` rather than a class on the row**, because the row carrying a tick is
exactly the row a tick was put in — a flag would be a second thing for `receiptRow` to remember and
a second thing to go stale.

**AND THE BOX IS SIZED TO WHATEVER LINE THAT LEAVES.** `font-size: inherit` with a `1.05em` box is
12.6px against a 12.6px line at 768. The first version used `.check .box`'s own pair scaled down —
`.82rem` with a `1.05em` box — which is **13.3px inside a 12.1px line**, so the mark was setting the
row's height instead of fitting it. `vertical-align: middle` is the half that is easy to miss: an
inline box sits ON the baseline, so its whole height hangs above it and the descender space is
added underneath, which is where the extra pixels were.

### Four more rows were reading names the payload has never sent

**"Check the receipt booker that it all is well" was the other half of the ask, and it was not.**
The method is `check-payload.js`'s question asked one level down, where that check cannot go — it
compares top-level `DATA.*` keys, so a field inside a row that nothing sends is invisible to it.
Every `j.<field>` `jobRows` reads, against every key `doGet` puts on a job: **sixteen against
forty-seven, and six came back.**

| the row | read | sent | what a real receipt said |
|---|---|---|---|
| **Students** | `students`, `maxStudents` | `maxKids` | **the row was absent** — `push` skips a row with no value |
| **Venue** | `venue` | `location` | **absent** |
| **Host** | `clientHosts` | *nothing* | **"We book the room"**, to every family hosting at home |
| **Sharing** | `splitEmails` | *nothing* | **"Just you"**, on a session split three ways |
| Dates | `sessionDates` | `dates` | a dash — recorded above |
| — | `maxStudents` | — | the second half of the `Students` read |

**TWO ARE REPAIRED ON THE PHONE AND TWO AT THE SERVER, and which end is not a coin toss.**
`Students` and `Venue` were drawing NOTHING, and the right name is already in the app: `seatsOf_`
is its one reader of "how many seats" — used by the roster and by the stamp, so a third spelling
here would be the `documents_()` fault — and `jobReceipt`'s own header already tries `venue` then
`location`, with the note *"both names are tried, because two lists genuinely use two"*. It was
found once, for the line under the title, and not for the row two inches below it.

**`Host` and `Sharing` were drawing a CONFIDENT WRONG ANSWER rather than nothing**, which is the
worse half: a line about who is responsible for a venue, and a line naming who is splitting the
cost. Neither fact is anywhere on the phone, so guessing a name here would have been inventing one.
`doGet` sends them.

**`splitEmails` IS NARROWER THAN `iAmIn`, DELIBERATELY.** Those are addresses the BOOKER typed in —
the people they invited — and `iAmIn` is the whole roster, so sending it that way would hand one
family the e-mail addresses another family chose. It goes to `cs[0]`, which is the same seat
`client` is taken from, and to an admin because somebody has to.

**And the state seeded `students` and `venue` too**, so the lab has been drawing two rows nobody
holding a real booking has ever seen — the third instance in one commit of a fixture stating a
shape `doGet` does not send.

## A wrong PIN put a gold bar across the app and left it there

**Reported as "I don't like how name or pin not recognised is a banner. It should be like the other
pop ups that come up at the bottom of screen."** Measured before anything was changed, by refusing a
`verifyLogin` and looking:

| | |
|---|---|
| a gold `#banner` across the top of the app | *"Name or PIN not recognised."* |
| a faint grey line under the button | *"Name or PIN not recognised."* |
| a toast | none |
| **after then signing in CORRECTLY** | **`bannerHidden: false` — the bar is still there** |

**THAT LAST ROW IS THE COMPLAINT THIS FILE ALREADY RECORDED AND HALF-FIXED.** *"The name or PIN not
recognised doesn't disappear after i just logged in correctly"* — the fix went onto the faint line,
under a note calling itself *"belt and braces rather than the only thing standing between the two"*.
The thing it thought it was bracing was **itself**. `banner('')` is called in exactly two places, the
`retry` handler and `load()` guarded by `LOAD_SLOW` — which is set only by a thirty-second watchdog,
so on an ordinary load it never fires. A wrong PIN was an alarm for the rest of the session, on every
screen.

### `why_` raised it for all thirteen of its callers, and it was a duplicate at every one

**The argument for it is written above the function and it is right about the wrong thing:** *"the
line under a button is where somebody looks; the banner is where text can be selected and pasted to
somebody who can fix it. Both, from one place."* True of a DIAGNOSTIC — a backend that threw, a
deployment serving old code. **False of a REFUSAL**, which is the app answering the question somebody
just asked, and `why_` cannot tell the two apart from a string.

**Measured across the thirteen: eight are `toast(why_(err))` and five write the sentence into a line
under their own button.** Every caller already had somewhere to say it. So the banner was never the
only copy anywhere — it was a second one, at alarm volume, that outlived the thing it was about. It
is gone from `why_`; the sentence is untouched.

**THE BANNER IS FOR A STANDING CONDITION** and the seven calls that raise it directly are all of that
shape: the sheet is missing columns, the questions did not load, a part of the app did not arrive, a
newer build is ready. Each is true until something changes, so persisting is the point.

### And the sign-in card said it twice more

**The refusal was written to `#in-said` TWICE and `banner()` was raised TWICE** — once from `send_`'s
own catch, and again from `do-signin`'s `.catch(err => said.textContent = why_(err))`, which runs
because `send_` rethrows. Two lines, one sentence, on the one card where somebody is waiting.

**`#in-said` IS GONE, because with the refusal toasted it had three jobs and none of them was still
its**: `"Both, please."` (a validation, now a toast), `"Checking…"` (which the BUTTON already says,
with a spinner, from `send_`'s `busy`), and the refusal. **`send_`'s own `say()` toasts when no
`where` is given**, so dropping the option is the whole of the change — one place decides, and the
camera's `where: 'cam-said'` is untouched.

**Both doors changed together.** `googleSignedIn_` wrote to the same element, and two ways in that
report differently are two ways in where the one that behaves unlike the other reads as broken.

**`#pin-said` is deliberately left alone.** It is a different thing on a different mechanism: it
ships with standing text (*"4 to 8 numbers, and not 1234"*), which is a HINT rather than a message,
and `pin-save` uses `api()` directly rather than `send_`. What it needed was the banner, and it has
that fix for free.

### The rule, and the first version was too wide

`check-flow.js` refuses the POST, presses `do-signin`, and asks three things: the sentence is in a
toast, `#in-said` has not come back, and **the banner did not CHANGE**.

**That last word is the narrowing and it took a failing run to find.** The first version asked
whether any banner was up — and `check/fixture.json`'s `version` is `test`, so `load()` correctly
raises a standing warning that the deployment cannot do half the actions. A rule red on that is red
on a banner doing exactly its job, and teaches nobody anything. **Proved by mutation**: the
`banner(said)` put back in `why_` names the refusal and the standing sentence it replaced.

## Every tick carries the day it happened, and the dates were already on the phone

**Asked for as "The tick boxes have a date for when it got requested. When other things get ticked
they should also have a date."**

**`doGet` HAS PUT `events: eventsForJob(jobId)` ON EVERY JOB SINCE THE ROSTER WAS DERIVED FROM THE
LOG** — six fields a row, `at` among them — and the only reader anywhere in `js/` was nothing at all.
This repository's oldest shape once more, and it means the dates for `Accepted` and `Paid` needed no
backend change: they are days the job's own log already records.

| | its date | from |
|---|---|---|
| **Requested** | the job's own `created_at`, or the first `Request` if that cell predates the column | a cell, then the log |
| **Accepted** | the **last** `Accept` | the predicate needs EVERY seat agreed |
| **Paid** | the **first** `Confirm` on a session, the **last** on a full waiting list | `jobStage_` needs one booked seat, or the whole house |
| **Started** | `startDate` | the dates the tick is read from |
| **Completed** | `endDate` | the same |

**THE TWO RULES ARE OPPOSITE ENDS OF THE LIST AND THAT IS NOT A PREFERENCE** — each is taken to match
its own predicate, which is the only rule that stays right when the predicates differ. `paidNeeds_`
is `jobStage_`'s own arithmetic rather than a second reading of it.

**THE LAST `Accept` IS EXACT FOR EVERY STATE THE APP CAN REACH, and that took checking.** Two things
could have broken it. An `Edit` drops everybody un-booked back to Waiting, so a re-Accept follows —
and the last Accept IS that re-Accept, which is the right day. And the admin's Accept writes one
event per participant on every press, so a second press would move the date with nothing having
changed — except that `bmActionsFor` withholds `ACT.ACCEPT` from a seat already at `Agreed`, and
`check-flow.js` already asserts an admin is only offered it on a booking that is waiting.

**`at` IS DAY-GRANULAR** — `eventsForJob` puts it through `fmtDate`, so the time `logEvent` wrote is
thrown away. Right as a label and useless as a sort key, so nothing sorts by it: the log is
append-only and **array order is the order things happened in**.

### One date format, because the three sources spell a day three ways

`createdAt` and an event's `at` both go through the backend's `fmtDate` and arrive as `dd/mm/yyyy`;
`startDate` and `endDate` are cut straight out of the `session_dates` cell and are whatever somebody
typed. So **`Accepted 25/09/2026` sat above `Started 06/10/26`** — one column, two spellings, on a
document read by running your eye down it. The app's own `fmtDate` is the format the `Dates` row
three lines up already speaks, applied where the value is built so no `when` has to remember.

### An un-ticked stage shows no date, and `Started` is why that is a rule

`Started` and `Completed` are read off the PLANNED calendar, so their dates are known in advance and
could be shown before the tick. **They are not.** The value column everywhere else means *the day
this became true*; a future date in it would make one column mean two things, told apart only by
whether the box beside it is filled. The plan is already on the card — `Dates` prints the range and
the count.

**And a ticked stage with no event draws the tick and nothing else.** Printing a dash or the word
unknown is content where a blank is skimmed past; reaching for a nearby event's date is the `cost: 0`
shape on a document somebody keeps.

### The rule tests the arithmetic, not the rendering

A wrong end of the list is the kind of thing that is subtly wrong for years, so the journey runs
`stageRows_` over a log where **two families move four days apart** — the two right answers are the
two INNER dates, the second `Accept` and the first `Confirm`, never the first Accept or the last
Confirm. A log where everybody moved on one day would pass whichever way round they were read. The
same log with `kind: 'waitlist'` must move `Paid` to the LAST Confirm, which is one rule giving two
answers. And the chain is asserted from the other side: a stage below an un-ticked one carries
neither a tick nor a date.

**Proved by mutation in four directions** — the first `Accept`, the last `Confirm`, the chain removed
so a date appears under an empty box, and a job with no log. All four are named; the real files pass
all 32 journeys.

### And the state was seeding a receipt with no log at all

`check/states.js` seeded no `events`, so `Accepted` and `Paid` could tick with no date and **the lab
could not tell that from a date that failed to draw**. It seeds a real log now, with the two families
moving on different days, and `createdAt` in the long form the server actually sends so the card's
shortening is measured rather than assumed. Third time in two commits that a state was found stating
a shape `doGet` does not send.

## The kit was a bulleted list with no amounts, and a sixth of the practicals are not experiments

**Asked for as "For the practicals I want each item/ingredient to be like a chip. Like how Google
has chips in documents and stuff ... The picture of the practical like a diagram. Then the things
needed. And it's quantity. I also want to differentiate between a science experiment and a
contraption/art and craft thing."** Four things, and the second one did not exist as data at all.

### The quantity is inside the item, because three lists that line up by index is the fault already recorded here

**`equipment` is a pipe list of 640 items across 82 rows and NOT ONE OF THEM SAID HOW MANY.** So a
guide asked a tutor to bring `Lemons` and `Lolly sticks` without saying four and about ten, which is
the half of a kit list you pack from.

**A PARALLEL `equipment_qty` COLUMN IS REFUSED BY THIS FILE'S OWN RULE**, written ten lines above
the mapper it would have sat beside: *"three lists that have to line up by index is the
numbered-column fault wearing a different hat — nothing can check that item 3 of one belongs to item
3 of another"*. It is the `images` and `needs` argument a third time. So the quantity goes INSIDE
the item: `Lolly sticks × about 10`, `Water × 100 ml`, and `Beaker (250 ml)` with nothing, because
one beaker is one beaker.

**`×` RATHER THAN `x`, AND THAT IS MEASURED RATHER THAN PREFERRED.** A bare `x` sits inside `box`,
`flex` and `Perspex`, and even ` x ` would catch `10 x 10`. The multiplication sign appears **zero
times across all 640 items**, counted before it was chosen, so it cannot collide with a name already
written — and it is the character the booking card already prints for the same idea. `kitParse_` in
`js/library.js` is its only reader and it splits on the LAST one, because a name may one day carry
one and a quantity is always the tail.

**A QUANTITY OF ONE IS NOT A QUANTITY**, and `check-practicals.js` refuses a `× 1`. One stopwatch is
one stopwatch; `× 1` on five hundred chips is five hundred pieces of furniture that say nothing. The
absence IS the answer, which is this file's own sentence about an age nobody has judged. **58 of the
640 carry one** — written where the row's own steps state an amount, and nowhere else.

### `.chip` is the funnel's filter, and borrowing it would have given 640 inert boxes a fingertip each

**`.chip` is a 44px tap target with a gold ✕ on it** — its own note records this stylesheet's fourth
conviction of the tap-target rule. A kit item is not pressable. Reusing that class would have put
`check/ui.js` in the position of measuring tap targets on things nobody can tap, which is the
`.price.faint` shape from the other end: a class that reads as a decision and behaves as something
else. `.kit-chip` is its own component, at reading size.

**AND `.prac-kit ul` HAD TO COME OFF THREE SELECTOR GROUPS.** It is a class plus a type — (0,1,1) —
against `.kit-chips`'s (0,1,0), so its `padding-left: 1.1rem` would have won and indented the chip
block by a bullet's width, with nothing below looking wrong enough to find. Tenth conviction of
`.price.faint`, refused before it was written rather than after a screenshot.

### `space-between` spreads the space between EVERY child, and there are two flags now

`Build` and `Extra` answer two different questions and belong together on the row that already
answers one of them. `.prac-head` is `justify-content: space-between`, so a third child put
`is-type` at **[12→82]** and `is-req` at **[141→256]** — fifty-nine pixels of nothing between two
chips that are a pair. Measured at 320px before the wrapper was written. One `.prac-flags` box takes
the head back to two children, so the rule goes on meaning what it meant and the pair wraps under a
long title as a pair — which `Electrolysis` and `Gear build — follow the drive through` both do.

**NEITHER TYPE IS GOLD, DELIBERATELY.** Gold on this card answers exactly one yes/no question —
`.prac-flag.is-req`'s own note says an "Extra" in the same colour would make the distinction
decorative — and colouring `Build` would put a second meaning on that colour an inch away, on the
same row.

### The picture moved above the kit, and it is NOT on the card

**Asked for in that order: the picture, then the things needed.** It used to sit at the head of the
method and the note that put it there is still right about what the seventeen drawings ARE — every
one is a set-up or a construction, something you build before the first reading. That argument was
answering a different question. Seeing the thing, then what it is made of, then how to make it is
the order a set of instructions comes in, and for a BUILD the picture IS the outcome and the kit
list is its parts.

**WHAT IT COSTS IS SAID RATHER THAN BURIED**: somebody on step 4 is now a scroll from the figure it
refers to. A second copy beside the steps would close that and is exactly the `.reel .over` fault —
one object, two descriptions, drifting apart the first time either is touched.

**NOT ON THE CARD, AND THAT IS ARITHMETIC RATHER THAN TASTE.** `.pane` caps at 534px on a 320×568
phone, a practical card has a median height of 274px, and `.qsheet figure svg` lays out at
`min(100%, 20rem)` — so a drawing plus a chip block is about 280px more, which would put the
seventeen cards that have one straight back past the fold. That is the whole fault the card/guide
split was made to repair.

**AND ONLY 17 OF 82 PRACTICALS HAVE A PICTURE AT ALL**, so on 65 of them "the picture of the
practical" is an absence rather than a layout. That is the rule this file already states twice —
draw only where the row's own words determine the picture — and the number is printed on every run
rather than left as a silence.

### An experiment or a build, written per row and never derived from a word

**`subject` says what a practical is ABOUT and `compliance` says whether a board demands it; neither
says which of the two SHAPES it is**, and a periscope and a titration are not the same kind of
afternoon. `practical_type` is the column, and the tie-break is the row's own `outcome`: if the
OBJECT is what you end up with it is a build, and if the READING is, it is an experiment. Assembling
standard apparatus is not building a thing — which is what keeps a clamp stand, a circuit from a kit
and a filtration set-up on the experiment side.

**Measured: 71 experiments, 6 builds, 5 refused and not asked.** The six are the pinball table, the
scribble bot, the periscope, the balloon car, the gear build and the shoebox projector — every one
of them a row whose own `outcome` leads with the object.

**NEVER DERIVED FROM A SUBSTRING, and this file records what one costs on this very column**:
`/required practical/` matched `AQA-aligned, NOT a required practical` and put a gold flag on five
cards saying they are not one. "build" is in the steps of half the experiments and "measure" is in
the steps of most of the builds.

**A CLOSED LIST RATHER THAN A BOOLEAN.** A third value is plainly possible — a DEMONSTRATION you
watch rather than measure or make — and a boolean would have to be replaced to admit one where a
word beside two other words does not. `PRACTICAL_TYPE` in `check-practicals.js` is the `VOCAB` /
`ACCEPTED` / `RETIRED_FACETS` pattern again, and a new value goes in there by somebody who has just
read the two already in use.

**A REFUSED EXPERIMENT IS NOT ASKED WHICH SHAPE IT WOULD HAVE BEEN**, and it is on the same list as
`steps` and `risks` for the same reason: saying which shape an afternoon nobody will run would have
had is content invented to satisfy a checker.

**And the header said `82 experiments`.** That was the ordinary English word for all of them until
this made `experiment` one of two values, and a header reading `82 experiments` three lines above
`71 experiment(s), 6 build(s)` is one word meaning two things — the `kind`/`paper` collision this
repository already renamed its way out of. It says `82 practicals`.

### One row in `facets.json`, and the coverage rule keeps it off every other screen

`facetFromSheet_` reads `x.row[field]`, so `practicalType` is a funnel question with **no deploy** —
and `FACET_COVERAGE` keeps it silent until the list IS practicals, exactly as it does for `Topic`.
Measured: **1% coverage across the whole app and 94% once the funnel is on practicals**, offering
`Experiment` 71 and `Build` 6. The six per cent is the five refused rows, which correctly carry no
type — so the number is a fact about the data rather than a gap. The sheet owns whether it is asked
at all.

### Every judgement was refuted before it was written, and the writer refuses what no reader would see

**The 82 rows were classified and their 640 items split by eleven agents, and every batch was then
re-read by a second agent told to REFUTE it** — the rule being that a clean report over a wrong
quantity is worse than no review, because these cards are read by children and packed into a bag
taken to a client's house. **674 items read, 12 faults raised, 12 corrections applied.** Three of
them are the kind nothing else here could have reached:

| | |
|---|---|
| `PR-FN11` spaghetti, marshmallows, tape | `20 sticks` is a **per-team ration** read as the kit total. The row runs in teams; a tutor packing from that chip brings one team's worth for four. `20/team` |
| `PR-HM02` `Glass test tubes and a rack` | `6 to 8` counts the TUBES, on a compound item whose second noun is a rack. `6–8 tubes` |
| `PR-HM16` `About 1.5 m of string` | the split dropped the row's own hedge, turning an approximate length into an exact one. `about 1.5 m` |

**AND `tools/practical-chips.py` ASSERTS AT THE WRITE, WHICH IS THE HALF A CHECKER CANNOT DO.** Once
the cell says `Name × qty` the original is gone, so the file can never again be asked *was anything
lost?* The proposal carries the original beside the two halves, so the write asks it: every word of
the original must be in the name, in the quantity, or on one of two closed lists — and the name may
not invent a word either. **It refuses the archetype this file already names**: `Nichrome wire
(about 1 m, taped to a metre rule)` split as `Nichrome wire × 1 m` reports `metre, rule, taped, to`
in neither half.

**A MEASURE WORD MAY BE DROPPED ONLY WHERE A QUANTITY WAS WRITTEN, and that one condition is the
whole difference between the two things a number in a name can be.** `A teaspoon of washing-up
liquid` gives up `teaspoon` because `1 tsp` now holds it; `250 ml beaker` gives up nothing, because
its quantity is empty and `250 ml` is the beaker's SIZE.

**TWO MORE SHAPES ARE STRUCTURAL AND ARE REFUSED OUTRIGHT.** A hyphen — `Two-litre bottles` is a
bottle's size where `Two graphite electrodes` is a count, and that one character is the whole
difference. And a bracket — `Balance (0.01 g)` and `Quadrat (0.5 m)` put a tool's own specification
in parentheses, and nothing in this column has ever written a count in one.

**Both rules had to be narrowed once, and both times a CORRECT fix was being refused.** `at least`
joined the droppable words, because `Paper cupcake cases (at least 20 identical) × 20+` left `at,
least` in neither half and neither carries identity. And the bracket rule fires only where the WHOLE
bracket went: `(at least 20 identical)` keeps `identical` in the name, so that bracket was holding a
real count beside a real adjective and the rule has no business in it. Fourteen mutation cases, zero
mismatches.

**WHAT IT CANNOT SEE IS SAID RATHER THAN IMPLIED.** `250 ml beaker` and `100 ml of water` are the
same sentence to any rule about which words moved where; one is a vessel and the other is a
substance, and only a reader knows which. That is what the refuters are for, and it is the first
thing they are told to hunt.

**IT REFUSED EXACTLY ONE OF THE 640 AND THE REFUSAL WAS RIGHT.** `Washing-up liquid, one good
squeeze` split as `Washing-up liquid × a squeeze` drops **good**, which is not a droppable word and
does not fit the twelve-character cap as `a good squeeze`. The refuter was right that an amount is
stated and the writer is right that the split loses a word, so the item stays whole — a chip reading
the sentence beats a chip reading a shortened one. **That cap is not a preference**: `.kit-q` is
`flex: 0 0 auto` and cannot wrap, so a long quantity pushes the name out of its own chip.

### And the search box would have gone dark on all 82 in one line

`practicalText_` built its haystack with `(p.equipment || []).join(' ')`. `equipment` is a list of
objects now, so that line would have put `[object Object]` into the haystack of every practical in
the library — `goggles` 13, `stopwatch` 18, `nichrome` 2, every kit word the note above that
function says it exists to make findable, gone, **silently, because a haystack cannot report what is
missing from it**. Both halves go in, because `250 ml` is a thing somebody types.

### The order is asserted, because an order is invisible to every other rule here

A guide with its drawing back below the method measures perfectly: nothing overflows, nothing is
clipped, every card still fits its pane. So `check/cards.js` asks the two questions that are left —
the figure is drawn **once**, and it is drawn **above** the kit — which is this repository's own
move of taking a fact that was only true by accident and giving it somewhere to be stated and
somewhere to be tested. Measured after: **640 kit chips across 82 guides, 58 of them carrying a
quantity**, 0 cards past the pane and nothing past the column at 320px.

## The guide was eight boxes and a risk assessment, and the ask was five things

**Asked for as "Should be name diagram, ingredients with their quantity, steps. And then worksheet
bit which records iv DV cv. Just that for now for each."** Measured across all 77 live practicals,
opened through the app's own sheet at 320px:

| | before | after |
|---|---|---|
| answer boxes | **8** | **3** |
| headings | 11 or 12 | **5** |
| the median guide | **2,402px** | **954px** |
| the shortest / the tallest | 1,867 / 2,944 | 715 / **1,298** |
| what `#sheet-body` shows at once | 697px | 697px |

**So a median guide was three and a half screens of scrolling and is one and a half.** `risk`,
`pred`, `res`, `conc` and `eval` went; `iv`, `dv` and `cv` stayed.

**THE NAME IS THE SHEET'S OWN TITLE AND ALWAYS WAS.** `openSheet(x.name, …)` draws it above this
markup with the close control beside it, so the first of the five asked for needed nothing — and a
heading inside the guide would have been the practical's name twice on one screen, which is the
fault this file records where the roster's `name` printed an `<h3>` over every widget's own heading.

**`prac-tab` STAYS, INSIDE THE WORKSHEET, AND THAT IS THE ONE JUDGEMENT IN THE CUT.** The two lists
of candidates — things you could change, things you could measure — are not a sixth thing; they are
the scaffolding for the three questions under them. The round before this one filled `variables` and
`log` on all 77 rows *precisely because* a box asking a student to name an independent variable with
nothing on the card suggesting one is a worksheet with the scaffolding removed, and that entry is a
few headings up. Removing them to get to five would have undone it.

### What it costs, and the risk assessment is the half worth reading twice

**The risk assessment is gone from the guide**: its written hazards, the safety line, the
public-liability and parental-agreement line drawn from `venue === 'home'`, and the box asking what
else you can see in THIS room. That was an explicit earlier ask, and it is safety content for
experiments run in a client's front room with a child.

**What is NOT gone**: `risks` is still a column, `check-practicals.js` still FAILS a live row that
has no risk assessment, the card still prints the hazard level — `prac-haz`, in `--warn` at medium
and red at high — and the 250 written hazards across all 77 live practicals are still in
`data/practicals.json`. It is one `<section>` to put back.

**And nothing typed is thrown away.** `guideBox_` keys on `ansKey_(x) + '#' + slot`, so every answer
anybody has written into the five removed boxes is still in `localStorage` under its own key and
comes back filled the day the box does.

**`science`, `risks`, `safety`, `maths_link` and `notes` are now columns nothing draws.** That is
this repository's oldest shape — `figure`, `orderPrints`, `exam_date`, `wow`, the eleven dead
Settings writers — and **it is deliberate here rather than accidental, which is the whole
difference**. `check-practicals.js` says so where it counts them: *77 hold a "What is going on" the
guide does not draw at present*. A count that reads as a backlog for work nobody intends is the
mirror of a silence, and this file already records paying for that on twelve SATs rows.

**AND THEY ARE ALL STILL IN THE SEARCH BOX, which is the odd state this leaves and is worth knowing
before somebody reports it as a bug.** `practicalText_` builds its haystack from `science`, `safety`,
`risks`, `notes` and `mathsLink` along with everything else, and that is untouched — so typing a
word finds the practical it is in and then shows you a guide that does not contain it. Measured
over the 77 live rows — every word of five letters or more in `science`, `risks`, `safety`, `notes`
and `maths_link` that appears in none of the columns the card or the guide still draws — **994 of
them are searchable and drawn nowhere in the app.** (A first pass said 995; the method is written
out here so the number can be taken again rather than believed.) Nothing
is broken by it — the search returns the right practical and the practical is readable — but the
REASON it matched is invisible, and that is the strongest argument on the table for `science` coming
back first if any of this does.

### Five stylesheet rules went and every argument in them stayed

`.prac-why`, `.prac-safety`, `.prac-maths`, `.prac-home` and `.gd-none`, each replaced by a prose
note where the rule was — the house move, and it is worth more than usual here because three of
those notes hold findings that outlive the rule: that `--dim` in the guide means a fact from the
database and `--faint` means the guide talking (which `.quiz-why` cites, so its cross-reference had
to move with it); that `.gd-sec p` is (0,1,1) against `.prac-safety`'s (0,1,0) and would have
flattened a gold-ruled warning into body text; and that the guide's maths line and tutor notes once
drew at the browser's default 16px, found on a screenshot.

### A section head and its own column labels were byte-identical, and only a screenshot could say so

**`.prac-tab h4` and `.gd-sec h4` set the same font, size, weight, tracking, case and ink.** That was
invisible while six sections carried that style and the candidate table sat side by side at 30rem.
With the guide cut to three sections it is the only nesting left, and at 320px the table stacks — so
`WORKSHEET`, `THINGS YOU COULD CHANGE` and `THINGS YOU COULD MEASURE` came out as three identical
lines, and the section head read as a section with nothing in it. **Sixteenth time this file writes
that a screenshot is the last word on something drawn**: nothing overflows, nothing is clipped, both
rules are correct.

**WEIGHT RATHER THAN SIZE, because at this size there is nothing else to spend.** `.68rem` is 9.2px
on a 320px phone and `.62rem` is 8.4 — under a pixel, which nobody reads as a rank. 400 against 600
is a stroke a reader can see at any size.

**AND IT HAD TO OUT-SPECIFY RATHER THAN OUT-SIT.** Both rules match those two `<h4>`s and both are
(0,1,1), so while they said the same thing it did not matter which came later; the moment they
differ, file order alone decides. `.gd-sec .prac-tab h4` is (0,2,1). **Eleventh conviction of
`.price.faint`**, refused before a screenshot rather than after one.

### The first draft of this said eleven boxes, and it was eight

**Written from memory of the ELEVEN HEADINGS the old guide drew.** Counted instead —
`guideBox_(x, '…')` appears eight times in the committed function and three in this one — the
sentence is right. That is the fault this file opens its checking section with, "all 18 checks
pass", in the one place it is hardest to catch: prose about a change, written by whoever made it,
in the same commit.

**So `check/states.js` asserts `=== 3` rather than `>= 3`.** The loose test passes on a guide that
has quietly grown a fourth question nobody decided on, and this state is the only thing in the lab
that renders one at all.

**AND THE SAME FAULT WAS ALREADY IN THIS FILE TWICE, IN THE ONE TALLY IT KEEPS BY HAND.** Counting
the "screenshot is the last word" line before adding another: the AQA reaction profiles said
*Twelfth* under an entry that had already claimed it, and the receipt's five stage ticks said
*Fourteenth* under one that had. Both are now the ordinal they are, and this one is the sixteenth.
A tally nobody re-reads is exactly what this file warns about, and it had been wrong in its own
warning.

### And the control variable was missing from the file for an hour, which is what the mutation cost

**Proving `check/states.js`'s `=== 3` was worth writing meant deleting a box and watching it fire.**
It fired, at all four widths, naming the state. **The restore did not take** — a later edit to the
surrounding comment block went in over the unrestored version — so `practicalGuide_` sat at **two**
boxes, `iv` and `dv`, with `cv` gone. Caught by reading the diff before committing, one line after
the hunk that removed it.

**THE THIRD OF THE THREE THINGS THE OWNER NAMED BY NAME**, in a commit whose whole subject is doing
what they asked. Nothing in the app would have looked broken: two boxes under a Worksheet heading is
a guide, and it measures, presses and lays out perfectly.

**The suite would have caught it and I did not run one in between**, which is the actual lesson
rather than the near miss: `check/ui.js` renders that state and `expect` counts the boxes, so the
mutation that proved the assertion is the same assertion that refuses the botched restore. A
mutation is not finished when it fires — it is finished when the check is green again, and the only
thing that says so is a run.

## Five column heads, dictated column by column, and two of them overrule what was written here

**Asked for over a sketch of the five-column head**: *"There should be 5 columns in receipt. Q for
the prompt, a for answer. X for multipliers. +/h for plus rate per hour, then + for full added
price"*. `Q A × +/h +`, and the mapping was checked against `js/price-rows.js` before anything was
typed: `out.rate = signed(perHour, '/h')` puts `+£2.50/h` under `+/h` and `out.total = running()`
puts the running figure under `+`. The two symbols the owner chose are the two the column already
prints.

**THE STUB HEAD WAS BLANK AND THE ARGUMENT FOR IT WAS MINE TO LOSE.** It read *"a word over
'For / Kind / Subject' would be a label for labels"*, which is what a table does with the column its
row names live in — and it left **four headings over five columns**, so a reader counting across has
to work out which one is unlabelled. `Q` names it, and the card's own rows say why the word is
right: every label in that column IS a question the document asks.

**AND THE VALUE COLUMN'S WORD NO LONGER COMES FROM THE CALLER.** It was `Answer` on the form and
`Detail` on the receipt, on the argument that *"the form is what you ANSWER and the receipt is what
was DECIDED"* — true, and `A` is the same letter for both, so the difference has nowhere left to
show. `cols` stays as the **flag** it also was: the basket passes none, which is how a caller says
it wants no header at all — its card is two columns and there is nothing for five names to sit over.
The five words are written once, in `spineHead_`, over the columns they name.

**`×` RATHER THAN A LETTER X, and it is the same glyph to a reader.** The values beneath it are
`× 6` and `× 1.005`, so the header is the character the column already uses rather than a second
spelling of it.

### `text-transform: uppercase` went with the words, and it was one wrong character

It was on `.bk-row.is-cols` for `ANSWER`, `RATE` and `TOTAL`. Of the five symbols now in that row
the only letter it can touch is the **`h` of `+/h`**, which it raised to `H` — a header spelling the
unit one way over a column of `£12.00/h` spelling it the other. One property removed and what the
source says is what the row draws. **The tracking stays**: at `.58rem` it is what still reads these
five as a label rather than as a row of the document.

**Measured at 320 / 390 / 768, on both headers the booking column draws** — the form's and the
receipt's: `"Q" "A" "×" "+/h" "+"`, no span overflowing its track at any width, `text-transform:
none`, the pane hiding 0px, and no JS errors. Screenshotted at 390, which is the **seventeenth**
time this file says a screenshot is the last word on something drawn — counted off the lines
above rather than remembered, because this tally has been wrong in its own warning twice.

**WHAT IS NOT FIXED, and it is not new.** The header keeps all five tracks and a row with no figures collapses to two, so on the receipt `A` sits
over the right edge of a **114px** track (102..216 at 390) while the `Subject` value under it is
right-aligned at **351px**, under `+`. That is recorded already — *"the header labels the wrong
place"* — and naming the columns is what makes their ABSENCE on an unpriced card read as *nothing is
priced yet*, which is why the header does not collapse with the rows.

**IT IS UNCHANGED BY THIS, AND THAT IS MEASURED RATHER THAN REASONED.** `.bk-k` is
`minmax(6.2em, max-content)`, so an empty span and a `Q` both resolve to the 6.2em floor — and the
mutation says so outright: putting `'' / Detail / × / Rate / Total` and the uppercase back into the
live header gives **`44..97 102..216 221..257 262..303 307..346`**, the same five boxes to the pixel.
Only the glyphs moved.
