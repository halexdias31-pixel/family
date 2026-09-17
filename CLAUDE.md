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
then runs the whole suite and prints one of two lines: `all 28 checks pass`, or the failures under
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
node js/check-marking.js         # a right answer marked right, a wrong one wrong
node js/check-practicals.js      # the 41 practicals, and whether their topics join to anything
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
wrong tab, a `const` assigned to, a facet that cannot narrow. Twenty-eight of those now run on every
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
