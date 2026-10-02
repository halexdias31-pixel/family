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
