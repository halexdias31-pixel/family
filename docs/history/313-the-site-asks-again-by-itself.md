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
| `online` | at once |
| coming back to the page (`visibilitychange`) | at once, unless an ask went in the last five seconds |
| the ask that would land past two minutes | brought forward to two minutes, so the two-minute sentence is said by a real failure |

**One request in the air at a time** (`RECONNECT.flying`); `online` twice is one ask. **A hidden page
does not ask** — a booked ask that comes round in a background tab waits for the page to be looked at,
so a backend that is down all afternoon is not asked every two minutes by a tab nobody has open. **A
success stops it. A load somebody asked for — signing in or out, Try again — starts the count again**;
`load(again)` is the retry and every other caller passes nothing. **A failed retry repaints nothing**:
it brought nothing, and emptying ten columns under somebody using the eleventh every few minutes is the
disturbance asking again exists to avoid.

**A SUCCESS TAKES THE ORDINARY PATH, NOT `location.reload()`.** The payload lands and the late-payload
repaint fills the screen in (Find gains its Bundles door, the feed its posts) — which is what
"refreshed itself" means here. A reload would throw away the caret in a half-typed answer, the column
the pupil is on and the keypad, and against a backend down for an hour a reload every two minutes is a
page that never holds still.

**A RETRY OVERTAKEN BY A SIGN-IN SAYS NOTHING.** A retry is the only request the app ever leaves in the
air on its own, so it is the one that can be overtaken: a pupil signs in while it is out, the sign-in's
load answers first, and the retry — asked as nobody — lands on top. `RECONNECT.gen` moves on every
load somebody asked for, and a retry whose generation has moved returns before it touches anything.

**A REFUSAL IS NOT ASKED AGAIN, and neither is a reply our own code threw on.** `{ error }` from
`doGet` is a real answer (a missing tab, a permission, a script that threw) and the same question gets
the same sentence; a throw after the reply was parsed would throw the same way. Both stop the count.

**WHILE IT ASKS, ONE QUIET LINE.** `#reconnect` in index.html, `role="status"`, faint ink on the raised
black at the top of the screen, taking no presses: **"Reconnecting…"**, from the first failure — even
when the retry is instant, because by then a timeout has been a minute of columns with no people in
them, and a minute with nothing said is what the slow line under the splash was written for. **After
two minutes of failures: "Can't reach the server — still trying."** Never the address. It is emptied
rather than hidden: a live region that appears and speaks in the same moment is announced by some
screen readers and not others.

**THE DIAGNOSTIC BANNER IS AN ADMIN'S, AND ONLY FOR A FAULT A PERSON MUST FIX** — a reply that is a web
page (the "Authorization is required" case; `bootJson_` now marks `err.page`), a page opened from
`file:`, or failures still going on after two minutes. Its advice is unchanged, with "Still trying by
itself." added to its first line and one branch added: **a timeout gets advice of its own** — the
screenshot's "timeout" sat over "Something else went wrong on the way", the commonest fault of the lot
filed under none of them. The banner comes down when an ask succeeds — only while it still says
what was put there, because a banner written since is somebody else's. The refusal's "The server
said: …" is an admin's too. Everybody else has the files, the quiet line, and "Couldn't load" with Try
again where a column is empty. **The admin is known on a cold boot**: data.js reads `USER` out of
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

So the phone was running **PR #129's `index.html` under PR #138's stylesheet and scripts.** The files
come out new under a stale page because their `?t=` is a URL `sw.js` holds no exact copy of (it asks the
server with the ETag it has) and Pages ignores a query string; it is the PAGE that was held. And the
page decides which files exist: #129's `window.FILES` has no `answers`, so that phone ran the newest
code **minus js/answers.js**. How the page was held cannot be measured from here — the live site is
behind the proxy — but a home-screen app restored from the phone's own cache is the likeliest, and the
fix does not depend on which.

**`watchBuild_` COULD NOT SEE IT.** It takes the server's tag at boot, from a HEAD, and raises its
banner only when a later HEAD differs — it compares the server with the server. A page that boots stale
records the current tag as its baseline and is satisfied for ever.

**SO THE PAGE IS COMPARED WITH THE SERVER, ONCE, AT BOOT (`bootStale_`).** The same HEAD now keeps the
server's `Last-Modified` (`BUILD_AT`); index.html already holds the page's own as `LOAD_AT`. Server
newer by more than a minute — a deploy, not a clock — and the page reloads, under `buildMayReload_`'s
rules: **once per build** (the tag goes in sessionStorage first, so a reload that is still stale gets
the "newer version — tap to load it" banner instead, and nothing can loop), **only in the first
seconds** (splash up, or under fifteen seconds in — before there is anything a reload could lose), and
**never over something typed**. No `Last-Modified` on either side, or an older one on the server, and
nothing happens. This is the one place the app reloads itself, and it is a different question from the
payload: a new build is files the page cannot have without one; a late payload is data the page can
take in where it stands.

**The footer was left as it is.** It said the one true thing on that phone — which build of the page
was running — and it was what dated the fault.

### Proved

Eight journeys in `js/check-flow.js`, against a stub that fails the payload's GET as a journey asks:

- a timeout is asked again at once, the line shows, no banner for a visitor, and the payload is drawn after the retry
- "Failed to fetch" for a student: asked again three seconds later (measured, not assumed), never a banner, never the address
- `online` asks at once, twice is one request, and after a success it asks nothing
- an HTML reply: an admin gets the diagnostic with its advice and "Still trying by itself", a student only the line
- two minutes on by the page's own clock: a student reads the plain sentence and no address; an admin the banner, and for timeouts the timeout's own advice
- a refusal is not asked again, and only an admin is told what the server said
- a retry overtaken by a sign-in does not paint the stranger's payload over the one just asked for
- a page three days older than the server reloads once, one as new as the server does not, and one that has already reloaded for that build gets the banner instead

**The first seven were run against the code before this change and every one failed**, for the reason
its name says. Three mutants failed theirs too — no in-flight guard (`online` twice made two requests),
the banner shown to everybody (the student saw the diagnostic), no generation guard (the eighth
journey: DATA became the stranger's) — and all eight are green on the real files.

Screenshots at 390×844 in the session's scratchpad: the feed and Find during a retry
("Reconnecting…"), at two minutes, and after the retry landed (Find gains its Bundles door).

### Left alone, said rather than assumed

- **`nothingHere`'s "Couldn't load. Failed to fetch. Try again"** on a column with nothing in it still
  prints the failure's own words. It is per-column, not a bar across the app, and another branch is
  reworking every loading look in that function this week.
- **The 30-second watchdog on the splash** (`#boot-slow` in index.html) still names the address. It
  only speaks when even the files have not landed in thirty seconds, which is a different failure.
- **Try again** still puts the splash back up, as it did.
