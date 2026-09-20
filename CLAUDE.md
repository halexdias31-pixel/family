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
