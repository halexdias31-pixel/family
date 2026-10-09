## The site asks again by itself: a payload that did not arrive is retried under one quiet line, the banner is an admin's, and a page older than the site reloads once

**The owner, 9 Oct, with a phone screenshot:** an orange bar across the top of Find — *"Could not
reach the backend. / Something else went wrong on the way. / Open it in a tab — the page itself will
say which it is. / timeout · site 06 Oct at 14:32 · css 2026-10-09-films-from-notflix"* — and
*"Also I don't like when this happens I would rather site just refreshed itself."*

### What happened that time

**A timeout, and the likeliest reason is the owner's own.** `clearPayloadCache` had just been run in
Apps Script, so the next `doGet` built the payload cold and ran past the sixty-second deadline in
`load()`. That deadline is right (its note: this backend answers in about fifteen seconds, and twelve
once reported a healthy backend as dead). What was wrong is what came after it: **Apps Script
finishes that work anyway and caches it, so an ask a moment later would have been answered at once —
and nothing asked.** `load()` tried once, put the files up (`filesOnly_`), and handed whoever was
holding the phone a deployment checklist with the backend's address in it.

**THE BANNER WAS RIGHT FOR THE PERSON IT WAS WRITTEN FOR AND SHOWN TO EVERYBODY.** Every paragraph of
its advice is a fault that happened — an archived deployment, "Only myself" access, a consent nobody
gave, a page double-clicked open from a folder. None of them is anything a pupil, a parent or a
visitor can act on, and for a timeout the advice it chose was "Something else went wrong on the way."

### What was built — `RECONNECT` in js/shell.js

**A FAULT ON THE WAY IS ASKED AGAIN, NOT REPORTED.** The deadline, no connection ("Failed to fetch",
Safari's "Load failed", NetworkError) and a reply that is not JSON book the next ask. The app stays up
on what it has — the files and whatever was already drawn.

| after | the next ask |
|---|---|
| a timeout | straight away — the server's work finished and was cached |
| a fast failure | 3 s |
| the second, third, fourth failure | 10 s, 30 s, 60 s |
| every one after | 2 minutes, for as long as the page is open |
| a refusal (`{ error }`) | 2 minutes — see below |
| `online` | at once |
| coming back to the page (`visibilitychange`) | at once — or, within five seconds of the last ask, when the five seconds are up |
| the ask that would land past two minutes | brought forward to two minutes, so the two-minute sentence is said by a real failure |

**An ask that comes round while a load is in the air waits for it, and is not forgotten**
(`RECONNECT.due`): `load()`'s `finally` makes it the moment nothing is in the air, unless the load that
landed settled it — a success, or a failure that booked the next rung itself. `online` twice is one ask.
**A hidden page does not ask** — a booked ask that comes round in a background tab waits for the page to
be looked at, so a backend that is down all afternoon is not asked every two minutes by a tab nobody has
open. **A success stops it. A load somebody asked for — a sign-in, a save, Try again — starts the count
again**; `load(again)` is the retry and every other caller passes nothing. **A retry that brings no
payload repaints nothing**: emptying ten columns under somebody using the eleventh every few minutes is
the disturbance asking again exists to avoid.

**A SUCCESS TAKES THE ORDINARY PATH, NOT `location.reload()`.** The payload lands and the late-payload
repaint fills the screen in (Find gains its Bundles door, the feed its posts) — which is what
"refreshed itself" means here. A reload would throw away the caret in a half-typed answer, the column
the pupil is on and the keypad, and against a backend down for an hour a reload every two minutes is a
page that never holds still.

**A REPLY IS CHECKED AGAINST WHOM IT WAS ASKED FOR** (`loadStale_`). Retries make a request in the air
the ordinary state for the whole of an outage, so the answer to an old question can land at any moment.
Every load carries the query string it was asked with (`loadWho_` — the person, name and token `doGet`
decides who you are from) and a number in the order loads went. A reply asked for somebody who has since
signed out or been signed in over, or older than a payload already drawn, is dropped whole — success,
refusal or failure alike. And if the person who IS here has no payload of their own yet, they are owed
an ask, made by the same `finally`, because nothing else would make it: signing out calls no `load()`.

**A REFUSAL IS ASKED AGAIN, ON THE SLOWEST RUNG.** It was taken as a real answer and never asked again —
true of the refusals written on purpose (the missing-tabs reply), and not of the one the client cannot
tell from them: `doGet`'s last line turns any exception into `{ error }`, so a one-off throw while the
payload was built stopped the asking for good. Every two minutes is cheap against a deliberate refusal
and mends a passing one. **What is still not asked again is a reply our own code threw on**: the same
reply would throw the same way.

**WHILE IT ASKS, ONE QUIET LINE.** `#reconnect` in index.html, `role="status"`, faint ink on the raised
black at the top of the screen, taking no presses: **"Reconnecting…"**, from the first failure — even
when the retry is instant, because by then a timeout has been a minute of columns with no people in
them, and a minute with nothing said is what the slow line under the splash was written for. **After
two minutes of failures: "Can't reach the server — still trying."** Never the address. It is emptied
rather than hidden: a live region that appears and speaks in the same moment is announced by some
screen readers and not others. **An empty column says the same kind of thing** — "Waiting for the
server. The app is asking again by itself, and this fills in when it answers." — with no reason and no
Try again (`nothingHere`, through `reconnecting_`). A dropped question file is not this: asking the
backend again does not fetch it, so that keeps its reason and its Try again.

**A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN** (`landRepaint_`). The repaints a
landing payload makes — its own, and the inbox's a moment later — leave the column holding the focused
text box alone: not painted, not restarted (a widget's `start` writes its box's value back), marked
STALE, and drawn a moment after the box is left. Only those repaints: the hold is up for the length of
the call, so a press that repaints is never held. Find keeps `findKeep_`, Settings `settingsKeep_`.

**THE DIAGNOSTIC BANNER IS AN ADMIN'S, AND ONLY FOR A FAULT A PERSON MUST FIX** — a reply that is a web
page (the "Authorization is required" case; `bootJson_` now marks `err.page`), a page opened from
`file:`, or failures still going on after two minutes. Its advice is unchanged, with "Still trying by
itself." added to its first line and one branch added: **a timeout gets advice of its own** — the
screenshot's "timeout" sat over "Something else went wrong on the way", the commonest fault of the lot
filed under none of them. The banner comes down when an ask succeeds — only while it still says
what was put there, because a banner written since is somebody else's. The refusal's "The server
said: …" is an admin's too, and comes down the same way. Everybody else has the files, the quiet line,
and a column that says it is waiting. **The diagnostic is not a door**: written over the boot's
"newer version — tap to load it" bar, it drops that bar's `data-do`, which had made its "Open it in a
tab" reload the app as well. **The admin is known on a cold boot**: data.js reads `USER` out of
storage before any of this runs, so `isAdmin()` answers before the payload; `hasRole('admin')` beside
it, for an admin looking at the app as a tutor.

### The stamp: "site 06 Oct at 14:32" under a stylesheet of 9 Oct

**THE STAMP WAS TRUE, AND THAT IS THE FAULT.** `SITE_STAMP` is `document.lastModified`, which on GitHub
Pages is when Pages built the site. Measured from the Actions history:

| | |
|---|---|
| the footer's minute | 14:32 BST on 6 Oct |
| PR #129's merge | 14:32:30 BST, 6 Oct |
| its *pages build and deployment* run | 13:32:33–13:33:05 UTC — 14:32 on a phone in London |
| Pages builds that succeeded after it | nine, the last (PR #138, which carries `films-from-notflix`) at 13:27 BST on 9 Oct |
| the screenshot | 14:08 on 9 Oct — forty minutes after that build |

So the phone was running **PR #129's `index.html` under PR #138's stylesheet and scripts.** It is the
PAGE that was old, and the page decides which files exist: #129's `window.FILES` has no `answers`, so
that phone ran the newest code **minus js/answers.js**.

**HOW THE PAGE WAS HELD IS NOT SETTLED, AND THE TWO HALVES OF THE STORY DO NOT FIT** (said by review,
and right). Each `?t=` comes from the page's own stamp, so a 6 Oct page asks for 6 Oct URLs, and
`sw.js` answers those from its store unless the paths were since re-filed under a later build's URLs
(`file()` drops the old key then). But a later build loaded on that phone went through `page()`, which
re-files `index.html` on every navigation that reaches the network and would have replaced the 6 Oct
copy. Nothing that would say which half is wrong can be measured from here — the live site is behind
the proxy.

**`watchBuild_` COULD NOT SEE IT.** It takes the server's tag at boot, from a HEAD, and raises its
banner only when a later HEAD differs — it compares the server with the server. A page that boots stale
records the current tag as its baseline and is satisfied for ever.

**SO THE PAGE IS COMPARED WITH THE SERVER, ONCE, AT BOOT (`bootStale_`).** The same HEAD now keeps the
server's `Last-Modified` (`BUILD_AT`); index.html already holds the page's own as `LOAD_AT`. Server
newer by more than a minute — a deploy, not a clock — and the page reloads, under `buildMayReload_`'s
rules: **once per build** (the tag goes in sessionStorage first, so a reload that is still stale gets
the "newer version — tap to load it" banner instead — and the reload goes only when that mark reads
back, `buildMark_`, see below), **only in the first seconds** (splash up, or under fifteen seconds in —
before there is anything a reload could lose), and **never over something typed**. No `Last-Modified`
on either side, or an older one on the server, and nothing happens. This is the one place the app
reloads itself, and it is a different question from the payload: a new build is files the page cannot
have without one; a late payload is data the page can take in where it stands.

**WHAT IT DOES NOT COVER.** It runs only after its HEAD reached the server, so a reload normally reaches
it too. But if the old page is `page()`'s own fallback because the navigation keeps failing while the
HEAD gets through, the reload returns the same copy, and so does the banner's tap — a sentence that does
nothing, though not a loop. A page restored rather than booted (an iOS resume) never runs it; that is
`checkBuild_`'s. **If the stale entry point comes back with the network up, the lever not yet pulled is
`page()`'s `fetch(req)` in sw.js.** Its own note says `cache: 'no-cache'` was tried on that line,
`check/deploy.js` passed with it and without it, so it was taken out — and names it as the line to
change if the stale entry point ever comes back. This screenshot may be that, or may be the fallback
or a restored snapshot, where `no-cache` would change nothing; which, nothing here can measure. It was
not changed in this branch: a service-worker change is its own deploy, this one is kept to the load
path, and the check that would say whether it helped is the one that could not tell before.

**The footer was left as it is.** It said the one true thing on that phone — which build of the page
was running — and it was what dated the fault.

### Proved

Seventeen journeys in `js/check-flow.js`, against a stub that fails the payload's GET as a journey asks:

- a timeout is asked again at once, the line shows, no banner for a visitor, and the payload is drawn after the retry
- "Failed to fetch" for a student: asked again three seconds later (measured, not assumed), never a banner, never the address
- `online` asks at once, twice is one request, and after a success it asks nothing
- an HTML reply: an admin gets the diagnostic with its advice and "Still trying by itself", a student only the line
- two minutes on by the page's own clock: a student reads the plain sentence and no address; an admin the banner, and for timeouts the timeout's own advice
- a refusal is asked again on the slow rung (not at three seconds), mends when the server does, and only an admin is told what it said
- a retry overtaken by a sign-in does not paint the stranger's payload over the one just asked for
- a retry in the air when an admin signs out does not put their payload on the signed-out phone, and the visitor is asked for
- nor does a payload that has arrived and is waiting for the question file when the admin signs out
- an ask that comes round while an overtaken retry is in the air is made when it lands, not lost
- a retry overtaken by Try again from the same person still draws the payload it brings
- while the app asks again, no column shows a student or a visitor the failure's words or a Try again; a dropped question file keeps its own reason and its Try again
- a retry that succeeds does not rebuild the box somebody is typing in, and draws it once they leave
- coming back to the page just after a failed ask asks again when five seconds are up, not a rung later
- a page three days older than the server reloads once, one as new as the server does not, and one that has already reloaded for that build gets the banner instead
- a page whose storage will not keep the once-per-build mark gets the banner, not a reload
- an admin's diagnostic written over the newer-version banner does not reload the app when pressed

**The first seven, as first written, were run against the code before this change and every one
failed**, for the reason its name says. Three mutants failed theirs too — no in-flight guard (`online`
twice made two requests), the banner shown to everybody (the student saw the diagnostic), no generation
guard (DATA became the stranger's). **The eight added after review, and the refusal's rewritten one,**
were run against the reviewed commit and all nine failed, each for the reason its name says. **The one
found while checking the fix** (the question-file wait, below) failed against a copy with only its line
taken out, and so did the dropped-question-file half of the columns journey. All seventeen are green on
the real files. The two-minute journey now reads its request's own `_=` stamp
rather than counting requests: three windows booting at once could hold its event loop past the
three-second rung, and it lost that race on a busy run before the review as well as after.

Screenshots at 390×844 in the session's scratchpad: the feed and Find during a retry
("Reconnecting…"), at two minutes, and after the retry landed (Find gains its Bundles door); a
student's Feed while it asks ("Waiting for the server"), and with the question file dropped as well
("the question file answered 404", Try again).

### After review

Two reviewers, ten findings. Each was reproduced against the reviewed commit before it was touched.

- **A retry in the air when an admin signed out put the admin's payload on the signed-out phone**
  (must-fix). `RECONNECT.gen` moved only inside `load()`, and signing out calls none — so this note's
  own "signing in or out starts the count again" was false for the half that mattered. The counter is
  gone; every reply is checked against the query it was asked with (`loadStale_`), for every load, not
  only retries — which also closes the same race for a boot load and for two saves landing out of order.
- **"Reconnecting…" for good after a Try again overlapped a retry**, reported by both reviewers from two
  directions: the ask booked by the Try again's failure came round while the retry was out, stood down
  for it, and the retry — overtaken — returned without booking anything. The same counter also threw a
  good payload away when the person pressing Try again was the person the retry was for. Now the ask is
  `due` and made when the air clears; a reply from the same person is drawn unless something newer is.
- **The Feed said "Couldn't load. timeout. Try again" under "Reconnecting…"** — and an HTML reply's
  "Authorization is required" to a student. This note had left `nothingHere` alone because another
  branch is reworking that function's loading looks; one early return is added above them instead, so
  the two meet in one place — and when the question file was dropped as well, the reason printed is
  the file's, where it had been the backend's.
- **A retry that succeeded rebuilt the Tools notepad under a pupil typing in it.** `landRepaint_`.
- **`{ error }` was never asked again**, though doGet's catch-all answers every exception with it.
  Asked again on the two-minute rung.
- **`bootStale_` reloaded without confirming the once-per-build mark was written**, so a store that
  refuses `setItem` reloaded on every boot of a page still stale. `buildMark_` writes and reads back,
  and `checkBuild_` uses it too.
- **The stamp section said the fix works whichever way the page was held.** Softened, above, with the
  `page()` lever recorded.
- **Found while checking the first of these: the check ran before the question file's wait.** A reply
  was checked against whom it was asked for as it was read, and only then waited for
  `data/questions.json` — seconds, on a first load over a slow line. An admin who signed out inside
  that wait still had their payload committed on the signed-out phone (measured: the journey holds the
  file). It is asked again where the reply becomes `DATA`.
- **An admin's diagnostic over the tap-to-load bar kept its `data-do`** (nit) — removed before writing.
- **Coming back within five seconds of a failed ask left the next ask up to two minutes away** (nit) —
  it is now booked for when the five seconds are up. **Not changed: flicking every six seconds asks on
  every return**, about ten a minute; it is bounded by the five seconds, it is what "coming back asks at
  once" means, and it costs only while somebody is actively flicking.

### Left alone, said rather than assumed

- **The 30-second watchdog on the splash** (`#boot-slow` in index.html) still names the address. It
  only speaks when even the files have not landed in thirty seconds, which is a different failure.
- **Try again** still puts the splash back up, as it did. It is offered now only where the asking has
  stopped — a reply our own code threw on, or a question file that did not arrive.
- **`filesOnly_` looks for a standing payload before its own wait for the question file, not after.**
  Read, not reproduced: on a first load, a failure's files-only copy could land over a newer load's
  payload committed during that wait. That failure goes on to book an ask, which puts the payload back
  within seconds. It was so before this change, and only while the question file is still on its way.
- **The other repaints are not held for a box being typed in.** Only a landing payload's are; a press
  that repaints is the person asking for it.
