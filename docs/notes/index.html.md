# index.html

The full text of comments in `index.html` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### ---------- THE ONE FILE THAT CANNOT DATE ITS OWN URL

html, after `<meta charset="utf-8">`

```
<!-- ---------- THE ONE FILE THAT CANNOT DATE ITS OWN URL -------------------------------------------
     EVERY FILE THIS PAGE LOADS carries `?v=` and the clock, so none of them can be held. This page
     cannot: it is the address somebody typed, and there is nothing in front of it to stamp.

     THESE ARE A REQUEST, NOT A GUARANTEE. GitHub Pages sends its own Cache-Control and a browser is
     free to prefer it, so treat this as help rather than the mechanism.

     IT MATTERS LESS THAN IT LOOKS, AND THIS IS THE ONE FILE THE VERSION SYSTEM CANNOT COVER. Every
     script and stylesheet below is asked for with a version on it, so none of them can go stale;
     this page has no URL of its own to put a version on, which is exactly why `?dev` exists — see
     the long note beside `LOAD`. A held copy of this page names the versions that were current when
     it was fetched, so the worst case is an app one deploy behind for as long as Pages' own
     `max-age` lasts, and `?dev` is the address that cannot be held at all. -->
```

### ---------- PUTTING IT ON A HOME SCREEN

html, after `<meta name="theme-color" content="#12100d">`

```
<!-- ---------- PUTTING IT ON A HOME SCREEN --------------------------------------------------------
     WHAT AN INSTALLED APP ACTUALLY IS: a manifest saying what it is called and what colour it is,
     an icon at the sizes a phone asks for, and a link to both from this page. There is no store, no
     packaging and no review — the page IS the app once these three lines exist.

     `apple-touch-icon` IS NOT OPTIONAL AND IS NOT COVERED BY THE MANIFEST. iOS reads the manifest
     for the name and the standalone display and then ignores its icons entirely — without this line
     the home screen shows a blurry screenshot of the page, which looks like a mistake rather than
     an app. It also must be a PNG: Safari will not use an SVG here.

     `apple-mobile-web-app-capable` is what makes it open without Safari's address bar, which is the
     difference between "a shortcut to a website" and "an app" as far as anybody using it is
     concerned. -->
```

### THE MANIFEST, WRITTEN INTO THE PAGE rather than kept as a file.

html, after `<meta name="theme-color" content="#12100d">`

```
<!-- THE MANIFEST, WRITTEN INTO THE PAGE rather than kept as a file. It is nine lines of JSON that
     never change, and a separate file is a separate thing to copy, to forget, and to have go
     missing — which is the whole reason there were four files here and now there is one.

     THE ICON CANNOT GO THE SAME WAY. It is twelve thousand characters as base64, and more to the
     point iOS will not accept a data URI for `apple-touch-icon` — it wants a real address it can
     fetch when somebody taps Add to Home Screen. So `icon.png` stays as the one file, and one
     512px square covers every size both platforms ask for. -->
```

### THERE WAS NO `rel="icon"` LINE AT ALL, which is why the tab showed the browser's globe.

html, after `<link rel="manifest" href="data:application/manifest+json,%7B%22name%22%3A%22%40`

```
<!-- ==================================================================================================
     THERE WAS NO `rel="icon"` LINE AT ALL, which is why the tab showed the browser's globe. This
     block then asked, in capitals, for somebody to PUT AN `icon.png` IN THE REPOSITORY — and
     nobody did, for weeks, while the manifest and the apple-touch-icon below went on naming a file
     that was not there. Three consumers, one 404, and Add to Home Screen on either platform giving
     a blank tile. The whole chain was built twice over — `applyBrandIcon_` in shell.js and
     `brandIcon()` in me.js — and the one thing missing was the file. (`brandIcon()` has gone since:
     its only caller was the install card, which nothing drew. `applyBrandIcon_` is the one.)

     IT IS THERE NOW. `tools/make-icon.py` draws it: the `@` of `@family.` in the site's own
     typeface, cut out of a gold tile, 512×512. That script carries the whole argument — why it is
     drawn rather than downloaded, why the palette is inverted for this one surface, and why the
     glyph is the size it is. A REQUEST IN A COMMENT IS A REQUEST THAT DOES NOT HAPPEN, which is
     what `seedAvatarItems` and `geocodeVenues` already cost this repository; the generator is the
     machine doing it.

     THE FILE IS STILL THE RIGHT ANSWER FOR THIS LINE. A favicon is read while the page is parsing,
     seconds before any script runs and long before the sheet has answered, so it cannot come from
     the database — the tab needs something in it immediately, and a name in a `<link>` is the only
     thing available that early.

     THE SHEET OVERRIDES IT ONCE IT ARRIVES: `brand.logo_square` swaps this href when the payload
     lands — see `applyBrandIcon_` in shell.js. So the file is the instant answer and the sheet is
     the authority, which is the same arrangement `LOAD` has with the version string. -->
```

### THE TAB ICON IS ITS OWN CIRCLE, favicon.png, cut by tools/make-favicon.py.

html, after `<link>`

```
<!-- THE TAB ICON IS ITS OWN CIRCLE, favicon.png, cut by tools/make-favicon.py. The two below stay
     square on purpose: iOS rounds a home-screen icon itself and a manifest icon is masked by the
     platform, so a circle there would be a circle inside a rounded square. -->
```

### BOTH NAMES, BECAUSE ONE OF THEM IS DEPRECATED AND THE OTHER IS NOT UNIVERSAL.

html, after `<link rel="apple-touch-icon" id="favicon-ios" href="icon.png">`

```
<!-- BOTH NAMES, BECAUSE ONE OF THEM IS DEPRECATED AND THE OTHER IS NOT UNIVERSAL. The `apple-`
     prefixed one is what iOS has always read and still reads; `mobile-web-app-capable` is the
     standard that replaced it, and Chrome logs a deprecation warning in the console when only the
     old one is present. Two lines, no behaviour change, one fewer thing in the console that looks
     like a fault and is not. -->
```

### NOTHING HERE IS EVER CACHED.

html, after `<title>`

```
<!-- ==================================================================================================
     NOTHING HERE IS EVER CACHED.

     A fix can be committed, published by GitHub Pages and live on the internet while the phone in
     your hand is still running last week's script.js — and nothing anywhere says so. That has cost
     more time on this project than any actual bug, because a stale file and a broken feature look
     identical from the outside: you change something, you reload, and nothing happens.

     A version number in the URL only works if somebody remembers to change it, which is a step
     that can be forgotten, which means eventually it is. So the number is the CLOCK. Every load
     asks for a URL no browser has ever seen, so no browser can be holding an old copy of it.

     THE ONE FILE THIS CANNOT FIX IS ITSELF. index.html is the entry point, so nothing can date its
     URL — GitHub Pages serves it with its own cache headers and the meta tags below do not
     override them. That is why one manual clear is needed to pick this file up, and why it is the
     last one you will need: this file never has to change again. Everything it loads is dated at
     run time, and everything it does not load is loaded by script.js, which is.

     IF IT IS ON YOUR HOME SCREEN, delete the icon and re-add it after that clear. An iOS webclip
     caches its start page far harder than Safari does, and clearing Safari does not touch it. The
     `apple-mobile-web-app-capable` tag that makes it a webclip is deliberately NOT here while this
     is being edited daily — it is worth adding back when the app settles down.

     WHAT IT COSTS. About 230KB re-downloaded on every load rather than served from cache —
     noticeable on a slow connection, invisible on wifi. The right trade while this changes several
     times a day; swap Date.now() for a release string later and the caching comes back.

     document.write, deliberately. It is the one method that keeps these synchronous and in order
     during parsing: the stylesheet is fetched before anything is painted, and script.js runs after
     the markup below it exists, which is what it expects. Appending elements instead would make
     both load asynchronously, and script.js would go hunting for #tabs before the parser had
     written it.
================================================================================================== -->
```

### ---------- THE PURGE THAT USED TO BE HERE, AND WHY IT IS NOT

<script>, top level, before `had`

```
/* ---------- THE PURGE THAT USED TO BE HERE, AND WHY IT IS NOT ---------------------------------
     THIS UNREGISTERED EVERY SERVICE WORKER AND EMPTIED EVERY CACHE, ON EVERY LOAD. Its note was
     right about the danger and right about the facts at the time: a worker outlives a reload, a
     hard reload and on some browsers clearing history, and while one is installed it can serve a
     file from months ago whatever the server sends — which is indistinguishable from an edit not
     saving. "Nothing here has ever registered one deliberately. That is not the same as there not
     being one."

     THE SECOND SENTENCE STOPPED BEING TRUE AT THE BOTTOM OF THIS FILE. There is a worker now, it
     is ours, and this line existed to destroy exactly that.

     IT TOOK FOUR HOURS TO FIND, because it does not look like a fault: the worker installed, took
     control, reported `controller` set, saw every request and cached every one of them — and the
     store came back holding a single entry. Everything written during the page's opening burst was
     wiped a moment later by a promise started before any of it. The only file that survived was
     the one fetched last, after the purge had already run.

     AND ITS TWIN IN shell.js WOULD HAVE TAKEN THE LIVE SITE DOWN. That copy calls
     `location.reload()` when it finds a worker to remove — correct when a worker could only ever
     be somebody else's leftover, and an infinite reload the moment the site installs one of its
     own: register at `load`, purge on the next open, reload, register again. See the note where it
     used to be.

     WHAT IT PROTECTED IS NOW A LINK YOU CAN TYPE. `?dev` unregisters the worker and empties its
     store — see the registration at the foot of this file — which is the same escape as before,
     on purpose rather than on every load. And sw.js cannot serve a stale file anyway: it asks the
     server about anything whose URL has changed and hands over what it holds only when the server
     says that copy is still current. */
```

### ---------- ?dev: THE SAME ESCAPE, ON DEMAND, AND IT HAS TO BE HERE

<script>, top level, before `had`

```
/* ---------- ?dev: THE SAME ESCAPE, ON DEMAND, AND IT HAS TO BE HERE --------------------------
     RUN BEFORE ANY FILE IS ASKED FOR, which is where the purge above ran and is the whole reason
     this is at the top of the page rather than beside the registration at the foot. A page is
     controlled by whatever worker was installed when it was NAVIGATED to — unregistering halfway
     down does not un-control the page you are already looking at, so a `?dev` that fired late
     would leave the publisher reading files handed over by the very worker they were trying to
     get rid of.

     ONE RELOAD, AND ONLY IF THERE WAS SOMETHING TO REMOVE. That is the other half: the reload is
     what makes the NEXT page an uncontrolled one. It cannot loop, and the reason is worth stating
     rather than trusting — after the unregister there is no worker for the second pass to find,
     and the registration at the foot of this file does not run while `?dev` is in the URL. The
     version of this in shell.js reloaded on finding ANY worker, with nothing to stop it finding
     the site's own on the next open: register, purge, reload, register. */
```

### ---------- WHY THIS IS A VERSION AND NOT THE CLOCK

<script>, top level, before `LOAD_AT`

```
/* ---------- WHY THIS IS A VERSION AND NOT THE CLOCK -----------------------------------------
     IT WAS `Date.now()`, and that is why the app took so long to open.

     Every file is asked for as `name.js?t=<this number>`. With the clock, that number is different
     on every single load — so every URL is one the browser has never seen, and all twenty files
     plus the stylesheet are downloaded again from scratch, every time, for ever. Eight hundred
     kilobytes on a phone on an ordinary connection is a couple of seconds before anything can even
     start running, and on a poor signal it is closer to eight.

     It was written that way for a real reason: a stale file is the worst kind of bug, because the
     code you are looking at is not the code that is running. But the cure was permanent — it did
     not stop caching until a deploy, it stopped caching at all.

     A VERSION STRING DOES THE SAME JOB AND ONLY WHEN IT NEEDS TO. Change it and every URL changes
     with it, so nobody can be left on an old file. Leave it and the browser keeps what it already
     has and the app opens instantly.

     IT USED TO SAY "BUMP THIS ON EVERY PUSH", AND THAT WAS THE FAULT. Not a wrong instruction — it
     worked perfectly whenever anybody remembered — but a procedure a person has to run, and on
     20 August it cost eleven hours. The fix was pushed at 22:40 and the phone kept drawing the old
     screen, because the version string beside it had not moved, so every URL was the URL the
     browser already had a file for. Correct code, on the server, unreachable. Three separate
     attempts to work out what was wrong with the code, and there was nothing wrong with the code.

     A STEP THAT MUST BE REMEMBERED IS A STEP THAT WILL BE FORGOTTEN, and the times it is forgotten
     are the times somebody is in a hurry, which are exactly the times it matters. So the number
     comes from something that already changes on every push and cannot be forgotten:

     `document.lastModified` IS WHEN GITHUB PAGES LAST BUILT THIS FILE. It moves when the site is
     deployed and at no other time, which is precisely the definition this line has always wanted:
     the same value all day while nothing changes, a different one the instant something does.

     ROUNDED TO FIVE MINUTES, WHICH IS THE SAFETY NET. If a server ever fails to send the header,
     `lastModified` quietly becomes "now" — and a version that changes every load is the same
     never-cache disaster the clock above was removed for, but silent. Rounding cannot hurt a real
     build time, which is a fixed instant either way, and it puts a floor under the failure: the
     worst case becomes one refetch every five minutes rather than one on every load.

     THERE IS NOTHING TO DO ON A PUSH ANY MORE. Push, and the URLs change by themselves. */
```

### WHEN THE SITE WAS BUILT — still read, and still only for the footer.

<script>, top level, before `LOAD_AT`

```
/* WHEN THE SITE WAS BUILT — still read, and still only for the footer. It is the honest answer to
     "which version am I looking at", which a clock-based `LOAD` cannot give: the clock says when
     you opened the page, not when the thing you are looking at was published. */
```

### ---------- ?dev — NEVER CACHE, WHILE YOU ARE THE ONE LOOKING

<script>, top level, before `LOAD`

```
/* ---------- ?dev — NEVER CACHE, WHILE YOU ARE THE ONE LOOKING -----------------------------------
     THE HOLE THE PARAGRAPHS ABOVE ADMIT TO. Every file this page loads is dated and cannot go
     stale. THIS page cannot date its own URL, so GitHub Pages serves it under its own `max-age`
     and the browser holds it — with `LOAD` inside it — for as long as that header says. Push a fix,
     reload, and you can still be reading the index.html that names the old version of everything
     else. That is the "one manual clear", and it comes back every time the header expires again.

     A QUERY STRING IS A DIFFERENT URL. `?dev` is a page no browser has a copy of, so the entry
     point arrives fresh — the one thing the version system could never do for itself. And once it
     is there, it means: date everything by the clock instead, so no file can be held either.

     IT IS A LINK, NOT A SETTING. Nothing is stored and it cannot be left on for somebody else — a
     parent opening the ordinary address gets the ordinary cached fast path. */
```

### ---------- AND THEN IT WAS THE CLOCK ALL THE TIME

<script>, top level, before `LOAD`

```
/* ---------- AND THEN IT WAS THE CLOCK ALL THE TIME -----------------------------------------------
     EVERYTHING ABOVE IS THE ARGUMENT FOR NOT DOING THIS, and it was a good argument: a clock defeats
     the cache permanently, so every visit costs the whole app again. It is kept because it is the
     reasoning somebody will need if they ever want the cache back.

     WHAT CHANGED IS WHOSE TIME IS BEING SPENT. The old answer optimised for a parent on a phone
     re-opening the app; the cost fell on the person publishing, who could never be sure whether the
     thing on their screen was the thing they had just pushed. A stale file and a broken feature look
     identical from the outside, and every hour spent debugging the wrong one is worse than every
     visitor downloading 230KB they mostly have.

     `?dev` IS GONE WITH IT. It existed to make exactly this happen on demand, and a switch that is
     always on is not a switch. */
```

### ---------- AND THEN THE 230KB WAS A MEGABYTE

<script>, top level, before `LOAD`

```
/* ---------- AND THEN THE 230KB WAS A MEGABYTE --------------------------------------------------
     REPORTED AS "the loading when site is starting is also taking long", and the paragraph above is
     why. It was a fair trade at the price it quotes and **that price was measured before the
     library moved into the repository**: the honest figure now, gzipped, off a server sending
     GitHub Pages' own headers, is

         visit 1:  1059 KB over the wire, 31 requests
         visit 2:  1059 KB
         visit 3:  1059 KB

     — 346KB of `data/questions.json`, 503KB of JavaScript and 153KB of stylesheet, downloaded again
     from nothing, on every single open, for ever. Four and a half times the number the trade was
     made at, and it grows every time a paper is transcribed.

     THE FIX IS NOT TO PICK THE OTHER SIDE, because both costs are real and the argument above does
     not stop being true. It is that the two readers want different answers and can have them:

       - a VISITOR wants the files they already hold. `document.lastModified` is when GitHub Pages
         last built this page, so it moves on a deploy and at no other time. Between deploys every
         URL is one the browser has a file for; the moment you push, every URL changes at once.
       - the PUBLISHER wants certainty that what is on screen is what they pushed, and that is what
         `?dev` was for. It is a page no browser has a copy of, so the entry point itself arrives
         fresh — the one thing the version system could never do for itself — and it dates
         everything by the clock, so no file can be held either.

     SO THE SWITCH IS BACK AND IT IS A SWITCH AGAIN. `https://…/?dev` is the never-cached address
     and the plain one is the fast one. It is a link rather than a setting, so it cannot be left on
     for somebody else: a parent opening the ordinary address gets the ordinary cached fast path.

     ROUNDED TO FIVE MINUTES, WHICH IS THE SAFETY NET, and the reason is four paragraphs up: if a
     server ever fails to send `Last-Modified`, `lastModified` quietly becomes "now", and a version
     that changes every load is the never-cache disaster again but silent. Rounding cannot hurt a
     real build time — a fixed instant stays a fixed instant — and it puts a floor under the
     failure: one refetch every five minutes rather than one on every load.

     WHAT IS STILL NEVER CACHED, deliberately, and neither is affected by any of this: the payload
     (`cache: 'no-store'`, because it is the database and six hours old is wrong) and THIS FILE,
     which carries the meta tags at the top of the page and has no URL of its own to date. */
```

### WHAT THE FOOTER SHOWS, from the same instant — so the version on screen is a MEASUREMENT of what is running rather than a second thing to remember to type.

<script>, top level, before `window.SITE_STAMP`

```
/* WHAT THE FOOTER SHOWS, from the same instant — so the version on screen is a MEASUREMENT of
     what is running rather than a second thing to remember to type. It read `2026-08-15m` for four
     days while the app was on newer code, which made the one line meant to answer "which version
     am I looking at" the least trustworthy thing on the page. */
```

### LOCAL TIME, NOT UTC.

<script>, top level, before `window.SITE_STAMP`

```
/* LOCAL TIME, NOT UTC. `toISOString` is always UTC, so through the summer the footer read an hour
     behind every clock the reader owns — and the one question this line exists to answer is "is
     this newer than the thing I just pushed", which cannot be answered by a number an hour out.
     Twice tonight a build WAS current and looked stale. */
```

### ---------- THE SCRIPTS ARE TOLD ABOUT AT THE SAME MOMENT AS THE STYLESHEET

<script>, top level, before `window.FILES`

```
/* ---------- THE SCRIPTS ARE TOLD ABOUT AT THE SAME MOMENT AS THE STYLESHEET --------------------
     A `preload` is the only way to let the browser start fetching something it cannot see. These
     files arrive through `document.write` further down, which the preload scanner does not run, so
     without this the network sits idle for as long as the parser takes to reach them — and the
     stylesheet, written on the line below, would win the connection alone.

     `as="script"` MATTERS. Without it the browser fetches into the wrong cache bucket and asks
     again when the real tag appears, which is the same file downloaded twice. The URL has to match
     the one written later, `?t=` included, or it is a different file as far as the cache is
     concerned. */
```

### ---------- ONE LIST, AND IT IS THIS ONE

<script>, top level, before `window.FILES`

```
/* ---------- ONE LIST, AND IT IS THIS ONE -------------------------------------------------------
     THE ORDER IS THE ONLY RULE THE WHOLE SPLIT RESTS ON — every file shares one scope and a file
     moved against the others breaks the app. Written twice, once here to preload and once below to
     load, it would be two orders that have to agree, and the second copy is the one somebody edits.
     `window.FILES`, read by both. */
```

### THE REQUEST GOES OUT NOW, NOT AFTER A MEGABYTE OF JAVASCRIPT HAS PARSED.

<script>, top level, before `u`

```
/* ==================================================================================================
     THE REQUEST GOES OUT NOW, NOT AFTER A MEGABYTE OF JAVASCRIPT HAS PARSED.

     `load()` IS CALLED BY boot.js, WHICH IS THE TWENTY-THIRD FILE. The scripts `defer`, so they all
     have to arrive and run before the one line that asks the backend for anything is reached — half
     a megabyte compressed, downloaded and parsed, with the network otherwise idle and the backend
     not yet aware anybody wants it. On a phone that is seconds of doing nothing before the slow part
     is even allowed to begin.

     THE TWO HAVE NOTHING TO DO WITH EACH OTHER. The payload does not depend on a single line of that
     code, and Apps Script is going to take as long as it takes whether or not the app is ready to
     receive it. Started here, in the head, the two waits happen AT THE SAME TIME instead of one
     after the other, and the answer is often already sitting there when `load()` asks for it.

     IT READS `familyUser` STRAIGHT OUT OF STORAGE, because data.js has not run yet and `USER` does
     not exist. The same two keys, spelt the same way — `person` and `name` — because a URL that
     differs from the one `load()` would have built is a second request rather than a head start.

     NOTHING DEPENDS ON THIS WORKING. It is a promise parked on `window`; `load()` uses it if it is
     there and makes its own request if it is not, so a browser without `fetch`, a private mode that
     refuses storage, or anything else going wrong here costs the head start and nothing else.
  ================================================================================================== */
```

### AND THE TOKEN, which is what `doGet` now decides who you are from — a name was a claim, and the app prints names.

<script>, top level, before `url`

```
/* AND THE TOKEN, which is what `doGet` now decides who you are from — a name was a claim, and
         the app prints names. The same three keys `load()` builds, spelt the same way, because a URL
         that differs from the one it would have built is a second request rather than a head start. */
```

### CAUGHT HERE AS WELL AS THERE.

<script>, top level, before `window.BOOT_GET`

```
/* CAUGHT HERE AS WELL AS THERE. An unhandled rejection on a promise nobody has awaited yet is
         reported by the browser as an error in the page, which is a false alarm in the console of
         somebody looking for a real one — and `load()` reads `.catch`ed value and falls through to
         its own request. */
```

### ---------- AND THE LIBRARY, IN PARALLEL

<script>, top level, before `window.BOOT_LIB`

```
/* ---------- AND THE LIBRARY, IN PARALLEL -------------------------------------------------
         `data/questions.json` IS 2.4 MB AND THE PAYLOAD IS NOT, so asking for it after the payload
         would add its whole time to the boot rather than overlapping it. Both start here, while
         this page is still parsing, and `load()` merges them when the slower one lands.

         `cache: 'default'`, NOT `no-store`. The payload has to be fresh — somebody edited a cell
         thirty seconds ago — and this file changes when the repository does, which is the one
         thing the browser's own cache is already right about. It is the same origin as the site,
         so a second visit pays nothing for it. */
```

### ---------- AND THE OTHER THREE LIBRARY TABS, THE SAME WAY

<script>, top level, before `window.BOOT_LIB_EXTRA`

```
/* ---------- AND THE OTHER THREE LIBRARY TABS, THE SAME WAY ------------------------------
         `boxers`, `fights` and `cheatsheet` are moving out of the spreadsheet for the reasons set
         out at the top of `js/library.js`. They are small next to the questions file, so the cost
         of asking for them is one round trip each and they start in parallel with everything else
         — the boot waits on the slowest, not the sum.

         AN EMPTY OR MISSING FILE IS NOT A FAILURE HERE. While a tab has not been exported yet its
         file is `[]` and the payload goes on supplying it, so this can ship before the data does
         and the app is identical either way. */
```

### THE SCRIPTS ARE ASKED FOR HERE, IN THE HEAD, AND NOT AT THE FOOT OF THE BODY.

html, after `<link rel="preload" as="script" href="js/' + f + '.js?t=' + LOAD + '">`

```
<!-- ==================================================================================================
     THE SCRIPTS ARE ASKED FOR HERE, IN THE HEAD, AND NOT AT THE FOOT OF THE BODY.

     THEY WERE WRITTEN AT LINE 1111, after seventy kilobytes of markup. Nothing is wrong with that
     in itself — a script at the end of the body is the old advice, and the reason for it was that
     scripts block the parser. `defer` solves that properly, and once they defer there is no reason
     to make the browser read the entire page before it learns which files it needs.

     THE PRELOAD SCANNER CANNOT SEE THEM. They arrive through `document.write`, which the scanner
     does not run — so the requests genuinely cannot start until the parser reaches that line. Every
     millisecond spent parsing markup above it was a millisecond of an idle network.

     Moved up, all twenty three requests are in flight before the body starts.
================================================================================================== -->
```

### TWENTY FILES, ONE SCOPE, ONE ORDER.

<script>, top level, before `window.__missing`

```
/* TWENTY FILES, ONE SCOPE, ONE ORDER.

     script.js was ten thousand lines, which is a file nobody can hold in their head and nobody can
     paste anywhere. Split at its own section headers into eighteen — and split is all it is: the
     files concatenated are byte-for-byte what script.js was. Nothing was renamed and nothing moved
     between them, which is why the split cannot have changed how anything behaves.

     EVERYTHING SITS BESIDE index.html, in one folder, rather than in a js/ one. A folder would be
     tidier and would cost a path in this list that has to agree with where the files actually are —
     and a path that disagrees is eighteen 404s and a blank screen, which is a worse failure than
     an untidy folder. Flat, until there is a reason not to be.

     THEY ARE NOT MODULES, deliberately. Fourteen of the app's own variables are set in one part of
     it and declared in another — DATA is set by the loader, USER by the sign-in, CHESS and ttState
     and flappyState by their games. An ES module's import is read-only, so every one of those would
     have thrown, and the fix would have been rewriting thousands of lines to reach through a state
     object. Plain scripts share one scope and need none of that.

     WHAT THAT COSTS, and what pays it. A module fails loudly at load when a name is missing; a
     plain script fails quietly, later, when somebody taps the thing that needed it. So js/check.js
     does that job instead: it reads all eighteen, and reports any name used and never declared, any
     name declared twice, and anything read at load before the file declaring it. Run it after every
     change — `node js/check.js`, two seconds. It is the whole safety net and it is not optional.

     THE ORDER BELOW IS THE PROGRAM. boot.js draws the first screen and asks the backend for data,
     so it is last, for the same reason the boot lines were last inside the single file. Everything
     above it must exist before it runs. */
```

### `js/` — THE FOLDER THEY ARE ACTUALLY IN.

<script>, top level

```
/* `js/` — THE FOLDER THEY ARE ACTUALLY IN. This asked for them flat, beside index.html, and
       they moved into a folder: twenty requests for files that are one directory up from where
       they live, twenty 404s, and a blank app.
       Nothing about that says what happened. A script that does not arrive is not an error the
       page reports — it simply never runs — so the whole app being missing looks like the app
       being broken. The banner in overworld.js names a missing file for exactly this reason, and
       it cannot: it is in one of the files that did not arrive.
       ONE PLACE DECIDES THE PATH. If they ever move again, this line moves with them. */
```

### `onerror` NAMES THE FILE THAT DID NOT ARRIVE.

<script>, top level

```
/* `onerror` NAMES THE FILE THAT DID NOT ARRIVE.

       Without it a missing file is silent, and what you get instead is whatever breaks FIRST as a
       result — `LOADED is not defined`, thrown by posts.js, when the file that never loaded was
       me.js. The message names a variable in the wrong file and says nothing about the real fault,
       and it looks for all the world like a bug in the code you are reading.

       One attribute turns that into the file's own name. */
```

### ---------- `defer`, AND IT IS THE WHOLE OPTIMISATION

<script>, top level

```
/* ---------- `defer`, AND IT IS THE WHOLE OPTIMISATION ---------------------------------------
       WITHOUT IT THESE RUN ONE AT A TIME. A parser-inserted script blocks: the browser stops, asks
       for core.js, waits for the round trip, runs it, and only then discovers price-rows.js. Twenty
       three files is twenty three round trips end to end, and on a phone a round trip is most of
       the cost of a small file.

       `defer` KEEPS THE ORDER AND DROPS THE WAITING. Deferred scripts are fetched in parallel and
       executed in document order, which is exactly the guarantee this list exists to provide — the
       one rule the whole split rests on is that a file must not be reordered against the others,
       and `defer` is the only attribute that promises that. `async` would not: it runs whichever
       arrives first, and core.js arriving after shell.js is the app not starting.

       AND THEY EXECUTE AFTER THE HTML IS PARSED, which is where boot.js expected to be anyway —
       it is the last file in the list and its whole job is to start once everything exists. */
```

### THE SERVICE WORKER, REGISTERED LAST AND ONLY WHEN THE PAGE IS ALREADY UP.

<script>, top level, before `updateViaCache`

```
/* ==================================================================================================
   THE SERVICE WORKER, REGISTERED LAST AND ONLY WHEN THE PAGE IS ALREADY UP.

   WHAT IT IS FOR is written at the top of sw.js with the measurements. The short version: `LOAD`
   above is the whole site's stamp, so a deploy changes all twenty-seven versioned URLs at once and
   the first open after a push costs 1,164 KB for a one-line change — 5.4 seconds on a phone.
   sw.js asks the server, per file, whether the copy already held is still current, and thirty of
   them answer 304 with no body.

   AFTER `load`, NOT BEFORE. Registering a worker costs a request and some main-thread time, and
   the one thing this must not do is make the paint somebody is waiting for any later. A worker
   does not control the page that registered it anyway, so there is nothing to be early for.

   `?dev` IS THE WAY OUT AND IT IS THE DOOR THAT ALREADY EXISTED. It is the publisher's link a few
   lines above — the one that dates every file by the clock so nothing can be held — and it now
   also unregisters the worker and empties its store. A service worker somebody cannot get rid of
   is the worst object on the web; the escape has to be something you can type from memory, on the
   phone in your hand, without looking anything up.

   EVERY LINE IS WRAPPED. `serviceWorker` is absent in a private window in some browsers and throws
   rather than answering undefined, and an exception here would be thrown from the last script on
   the page, after everything else has worked. Nothing in the app depends on this; the site is
   exactly what it was without it.

   IT IS NOT AN OFFLINE PROMISE THE APP MAKES ANYWHERE. Being able to open with no signal falls out
   of the caching and is genuinely useful in a back bedroom with one bar, but nothing on any screen
   says "works offline" — the payload is the database and it is never cached, so what you get with
   no signal is the app, the library and whatever the last load knew. Saying more than that would
   be a promise the app cannot keep.
================================================================================================== */
```

### THE PUBLISHER GETS NO WORKER AT ALL.

<script>, top level, before `updateViaCache`

```
/* THE PUBLISHER GETS NO WORKER AT ALL. Removing one is done at the top of this file, before a
       single file is asked for — see the note there for why halfway down is too late. This is the
       other half of the same decision: while `?dev` is in the URL nothing re-registers, which is
       also what stops the reload up there from happening twice. */
```

### `updateViaCache: 'none'` SO sw.js ITSELF IS NEVER THE STALE ONE.

<script>, top level, before `updateViaCache`

```
/* `updateViaCache: 'none'` SO sw.js ITSELF IS NEVER THE STALE ONE. Without it the browser may
         serve the worker out of its own HTTP cache for up to a day, which would mean a fault in
         this file could not be fixed by pushing a new one — the one failure mode that has no floor
         under it. */
```

### THE THREE `no-store` TAGS THAT WERE HERE ARE GONE, for the same reason as the clock above:

html, after `<link rel="stylesheet" href="style.css">`

```
<!-- THE THREE `no-store` TAGS THAT WERE HERE ARE GONE, for the same reason as the clock above:
     between them they told the browser never to keep anything, so even with a stable version string
     every file would have been fetched again on every load. They were belt and braces on a belt
     that was already too tight.
     What replaces them is `LOAD` above: a name that changes when the code changes and not
     otherwise, which is what cache-busting is supposed to mean. -->
```

### THE FIGURE'S CIRCLE, ONCE FOR THE WHOLE PAGE (`avatarFor`'s bust, links.js; docs/history/341).

html, after `<body>`

```
<!-- THE FIGURE'S CIRCLE, ONCE FOR THE WHOLE PAGE (`avatarFor`'s bust, links.js; docs/history/341). Every bust
     clips to this one shape: the same circle in each drawing's own units, so one definition serves them all,
     and no drawing needs an id of its own — a numbered one per drawing made the same facts draw different
     markup every time. Here, in the page and never redrawn, so it is always there to be pointed at. -->
```

### THE SHELL. Two fixed parts and one scrolling one:

html, after `<circle cx="24" cy="24" r="20"/>`

```
<!-- ==================================================================================================
     THE SHELL.

     Two fixed parts and one scrolling one:

       a SCROLLER that is the only thing that moves
       a TAB BAR at the bottom, in the thumb's reach
       and a SHEET that slides up over all of it for anything that needs full attention

     There was a header. It said where you are, which the tab bar already does.

     The old layout was a wall of notes packed by height — right on a desktop, and a mile of
     scrolling on a phone. This shows ONE screen at a time, which is the whole change.
================================================================================================== -->
```

### THE HEADER WAS HERE.

html, after `<circle cx="24" cy="24" r="20"/>`

```
<!-- THE HEADER WAS HERE. A bar across the top of every screen holding a title that repeated what
     the tab bar already said, a ＋ that only meant anything on one screen, and a ⟳ that nobody
     should have had to know existed — three centimetres of every phone, spent saying nothing.
     Removed, not hidden. Its rules are out of the stylesheet and the code that wrote to it is out
     of shell.js, so there is nothing left anywhere pointing at an element that is not here. -->
```

### THE SPLASH, AND WHY IT IS IN THE MARKUP RATHER THAN DRAWN BY SCRIPT.

html, after `<circle cx="24" cy="24" r="20"/>`

```
<!-- ==================================================================================================
     THE SPLASH, AND WHY IT IS IN THE MARKUP RATHER THAN DRAWN BY SCRIPT.

     It has to be on the screen BEFORE script.js has done anything, because the thing it covers is
     script.js starting up. Written by the parser, it is there the instant the page is parsed;
     built in JavaScript it would appear after the work it is meant to hide.

     It is also the honest answer to a slow backend. The payload is a dozen sheet reads and can take
     a couple of seconds on a cold Apps Script instance — and what the app looked like during those
     seconds was a black rectangle, which reads as broken rather than as busy.

     ONE ELEMENT AND NO SCRIPT. The animation is CSS, so it runs even while the main thread is busy
     parsing eighteen files — a spinner driven by JavaScript stops exactly when the app is at its
     slowest, which is the one moment it needed to be moving. It is removed by `load()` when the
     payload lands, and by the boot handler if that throws, so it cannot outlive what it covers.
================================================================================================== -->
```

### THE PICKER IS THE FIRST THING INSIDE THE SPLASH, AND THAT IS ITS WHOLE POSITION.

<script id=pick-splash>, top level, before `el`

```
/* THE PICKER IS THE FIRST THING INSIDE THE SPLASH, AND THAT IS ITS WHOLE POSITION.

     IT RAN AFTER ALL OF IT. It sat in the script below the markup, so every splash's markup -- a
     thousand lines of it -- was parsed before the class was chosen, and the element carries
     `is-still` in the markup as the no-script default. A browser is free to paint between those two
     moments, and it did: measured by `check/load.js` at 4x CPU, four loads in seven painted before
     the pick. Here, inside `#splash` and before anything else in it, the element exists (its
     opening tag has been read) and nothing that could be painted has been parsed yet: none of seven.

     `js/check-css.js` holds it here: `script#pick-splash` is the first element in `#splash`. */
```

### WHICH ONE, decided here and nowhere else.

<script id=pick-splash>, top level, before `el`

```
/* WHICH ONE, decided here and nowhere else.

     During parsing, so the choice is made before anything is painted — a pick made after the first
     frame would show one splash and then swap it, which is worse than having only one.

     `Math.random()` and not a rotation: a rotation needs somewhere to remember what came last, and
     the thing it would have to remember outlives the page. A coin is honest about it.

     ---------- ONLY WHAT THE BOOKS TEACH ------------------------------------------------------------
     "delete all animations for loading which dont come from text books or arnt educational." — the
     owner, 10 Oct. THIRTEEN SPLASHES LIVED IN THIS FILE until then: the tag, the 1974 readout, the
     torch, the tube, the columns, the blocks, the ring, and six calm ones (a ripple, a tide, a dawn,
     breathing, rain on glass, a pendulum wave). No chapter of any book was about any of them, which
     is what had kept them here — and is why they went, every one, with their rules in style.css,
     their rows of data/settings/splashes.json and the two scripts that drew nothing else
     (tools/blocks.py, tools/boxing.py). docs/history/322.

     SO THE POOL IS THE BOOKS' DRAWINGS AND NOTHING ELSE. "Add the animations from loading to respective
     subject text books. Matter of fact the source for the animations should be in text books. The
     animation from loading screen are pulling and syncing from the text book animations." — the owner,
     8 Oct. Each is a row of data/textbooks.json under the chapter it teaches; the last load kept a copy
     of them on this device (`splashSync_` in shell.js) and this draws from it — no fetch and no script
     file, because nothing else has arrived yet when this runs. ONE LOAD BEHIND, like `splashOff`: a
     drawing changed in a book reaches the splash on the load after the one that read the book.

     A FIRST VISIT HAS NO COPY, and is left with the markup as it is written below: the name, still,
     and the app's one loader under it. NOT an animation found to fill the gap — the teaching ones are
     not on this device yet, and a decoration in their place is exactly what the owner asked to go.

     A COPY THAT IS NOT WHOLE IS NOT DRAWN. Each kept drawing carries the hash its index promised; one
     that does not match, does not parse, or is not one drawing (one `an-` root and nothing beside it)
     is taken back out — all of what it put in, not only a root — the index is dropped so the next load
     writes everything again, and the splash is the still one a first visit gets. A splash from
     yesterday is fine. A garbled one is not. */
```

### ---------- THE SHEET MAY TURN ANY OF THEM OFF

<script id=pick-splash>, top level, before `off`

```
/* ---------- THE SHEET MAY TURN ANY OF THEM OFF ---------------------------------------------
       `splashOff` is the retired ones as the last load read them off data/settings/splashes.json
       (`splashSync_`), `is-` and an id each.
       AND IF IT RETIRES EVERY ONE, EVERY ONE STAYS IN. A misspelt row in a spreadsheet, or a sheet
       switched off wholesale, must not be what decides that a device which has the books shows none
       of them — the failure mode of this feature is "you see one you had turned off", which nobody
       minds. The still name is for a device with nothing kept, not a punishment for a tidy sheet. */
```

### IN FRONT OF THIS SCRIPT, as the first thing in the splash.

<script id=pick-splash>, top level, before `mark`

```
/* IN FRONT OF THIS SCRIPT, as the first thing in the splash. The book's drawing carries no
         name — a chapter page has its book's — so the splash signs it, as the still one is signed.
         `mark` IS WHAT WAS FIRST BEFORE IT, so everything in front of `mark` afterwards is what the
         record put there and nothing else — the line the catch below takes back out to. */
```

### AND IT MUST BE ONE DRAWING, AND NOTHING BESIDE IT.

<script id=pick-splash>, top level, before `root`

```
/* AND IT MUST BE ONE DRAWING, AND NOTHING BESIDE IT. A record whose markup is empty, or is not
         one `an-` root, passed every test above — `''` is a string — and then signed THIS SCRIPT, the
         first element left, and set `is-an` over nothing: a black screen saying @family. in the
         corner. And a root with a sibling after it (`<div class="an-x">…</div><p>tail</p>`) drew the
         sibling too, beside the drawing, where `splashOff_` — which takes off the root — left it for
         the Try again. Every row in the books is one `an-` root (`check-anims.js` part 1), so a kept
         copy that is anything else is not a copy of a row, and is not drawn. Whitespace may sit
         either side: a row is compared byte for byte, and a newline is allowed to end it. */
```

### EVERYTHING THE RECORD PUT IN, whatever it was — up to `mark`, and not only an `an-` root.

<script id=pick-splash>, top level, before `el.className`

```
/* EVERYTHING THE RECORD PUT IN, whatever it was — up to `mark`, and not only an `an-` root.
         This took out `:scope > [class|="an"]` and nothing else, which is exactly the one shape a
         refused record is NOT: a `<p>`, or bare text, was refused and then left in the splash above
         the still name, pushing the name and its loader off centre. */
```

### ---------- WITH NOTHING KEPT: THE NAME, STILL, AND THE ONE LOADER

html, after `<p>`

```
<!-- ---------- WITH NOTHING KEPT: THE NAME, STILL, AND THE ONE LOADER --------------------------------
       WHAT THE MARKUP SAYS IS WHAT A DEVICE WITH NO KEPT COPY SEES — a first visit, a copy that failed
       its check, a store that gave the copy up for a child's answer, a Try again after the drawing was
       taken off (`splashOff_`) — and what a browser running no script sees.

       THE NAME IS SET PLAINLY AND DOES NOT MOVE. It was the tag: written on in a second and a half
       with a mist drifting behind it, which taught nothing, and a name that performs is a decoration.
       Text in the app's own face, so nothing can be spelt two ways.

       THE LOADER IS `loading_()`'s, WRITTEN OUT, because this is parsed before shell.js exists and so
       cannot call it: the same element, the same classes, the same three gold dots and the same words
       for a screen reader. "Every widget has unique loading look. They should all have a simplistic
       simple loading thing" — the owner, 9 Oct; a loading screen is one more of those, so it waits
       the way every card does. `js/check-loading.js` holds this copy to what `loading_()` returns,
       byte for byte, so the two cannot drift; `check/anims.js` holds the name still in a browser.

       `aria-hidden` on the name, because `#splash-say` below already says it out loud. -->
```

### ---------- AND A LINE FOR A LOAD THAT IS TAKING LONGER THAN THIS BACKEND NORMALLY DOES

html, after `<p id="splash-say">`

```
<!-- ---------- AND A LINE FOR A LOAD THAT IS TAKING LONGER THAN THIS BACKEND NORMALLY DOES -----
       MEASURED: with the backend answering nothing at all, the splash stays up for the whole 60
       second deadline in `load()` and says nothing — the animation plays cheerfully over an app
       that is getting no answer, and there is no way to tell "still trying" from "stuck". Every
       other failure in this app ends with a sentence and a Try again; this one was a minute of
       silence.

       IT IS IN THE MARKUP RATHER THAN BUILT, for the reason the still name and its loader above
       are: the boot path is where this app once took itself down, and anything there that has to be
       constructed is one more thing that can be missing. Hidden until something asks for it.

       NOT AN ERROR, AND IT DOES NOT OFFER A WAY OUT. At fifteen seconds the request may well still
       land — the deadline and its banner are what handle the case where it does not. This says the
       one true thing nothing else on the screen was saying. -->
```

### THE SLOW-LOAD MESSAGE LIVES ON THE SPLASH, NOT UNDER IT.

html, after `<span>`

```
<!-- ============================================================================================
       THE SLOW-LOAD MESSAGE LIVES ON THE SPLASH, NOT UNDER IT.

       It used to go in the banner, and the banner is z-index 29 while the splash is 200 — so the
       only way to make it readable was to take the splash off, which is what the watchdog did. A
       load that was merely SLOW therefore ended with the animation gone, the app empty behind it
       and a message saying it was still trying: three things on screen disagreeing about whether
       anything was happening.

       Written here instead, over whatever the splash is showing, so nothing has to be removed to
       say it. `boot-` and not `splash-`, deliberately: check-css.js holds the `#splash-*` ids to a
       closed list of the loading screen's own parts — the still name, the line said out loud, the
       slow line — so that an inline splash cannot come back, and this is a caption over all of them.
  ============================================================================================ -->
```

### AND IF THE CODE ARRIVED AND THE DATA NEVER DOES.

<script>, top level, before `sp`

```
/* ==================================================================================================
     AND IF THE CODE ARRIVED AND THE DATA NEVER DOES.

     The check above answers one question — did the scripts load — and answers it well. It cannot
     answer the other one: everything loaded, `load()` is running, and the request never comes back.
     `go` is a function, so that check returns quietly, and what is left on screen is an animation
     that will play until the tab is closed.

     A SPINNER IS THE ONLY THING ON A SCREEN THAT CANNOT FAIL. Every other state says something. An
     animation says "working" for ever and is indistinguishable from working. So it gets a deadline
     of its own, HERE, in the page itself — not in shell.js, which is one of the files that may be
     stale, and depending on nothing the app defines.
  ================================================================================================== */
```

### ---------- IT SAYS SO. IT DOES NOT LIFT THE SPLASH

<script>, top level, before `LOAD_SLOW`

```
/* ---------- IT SAYS SO. IT DOES NOT LIFT THE SPLASH ------------------------------------------
       THIS USED TO END THE LOADING SCREEN ON A TIMER, and that was the fault: the fetch has its
       own sixty-second deadline and `load()` lifts the splash whichever way that goes, so at
       thirty seconds this was ending the animation while the request it was reporting on was
       still perfectly alive. Between thirty and sixty you got an empty app and a message saying
       it was still loading — the app contradicting itself on screen.
       The splash now comes off in one place and for one reason: the load finished. This says why
       it is taking so long, on top of the animation, and the animation keeps running. */
```

### THE ANIMATION RUNS FOR AS LONG AS THE LOAD DOES.

<script>, top level, before `sp`

```
/* ==================================================================================================
     THE ANIMATION RUNS FOR AS LONG AS THE LOAD DOES.

     A DRAWING CAN TELL A STORY THAT ENDS. The tag was written on in 1.7 seconds and the tube map
     drew itself in 2.1 (both gone, docs/history/322); Pythagoras squared up in 2.4 — and then
     `forwards` held the last frame and the screen was a still picture. On a backend that answers in fifteen seconds that is two seconds of
     animation and thirteen of a photograph, which reads as the app having stopped rather than as
     the app working, and it is the reason a slow load FEELS broken rather than slow.

     SO IT PLAYS AGAIN. Every animation on the splash that has a finite number of iterations is
     restarted the moment the last of them finishes, over and over, until the splash is taken off —
     which happens in exactly one place, when `load()` has finished, success or failure.

     NOTHING PER-SPLASH. `getAnimations({ subtree: true })` asks the browser what is actually
     running rather than this needing a list of every splash name and its duration, so a splash
     added later loops without anybody remembering to tell this line about it.

     THAT SENTENCE USED TO SAY "a list of thirty-eight names" and the pool was thirty-nine — a
     number in a comment nobody re-reads, which is the fault CLAUDE.md records under "all 18 checks
     pass" and "one of the eighteen names". The point it is making does not need the count, so it no
     longer carries one.

     THE INFINITE ONES ARE LEFT ALONE — the loader's dots, a drawing's idle, the ticking clock. They
     never finish, so waiting for them would wait for ever, and restarting a texture would make it
     stutter.
  ================================================================================================== */
```

### NOT FOR SOMEBODY WHO ASKED FOR LESS MOVEMENT.

<script>, top level, before `replay`

```
/* NOT FOR SOMEBODY WHO ASKED FOR LESS MOVEMENT. Every animation there is cut to .01ms by the
       global rule, so each "finishes" at once — and this restarted it at once, for the whole load: a
       splash that should hold one still frame was restarting itself every frame. `check/anims.js`
       caught it as y = mx + c's labels "still looping" on the splash, on some runs and not others,
       because whether the sample landed inside the churn depended on how long the boot took. */
```

### ---------- A SPLASH THAT IS ALREADY MOVING IS LEFT ALONE

<script>, in `replay`

```
/* ---------- A SPLASH THAT IS ALREADY MOVING IS LEFT ALONE ---------------------------------
         THIS IS THE WHOLE RULE, AND GETTING IT WRONG TWICE IS WHAT MADE FIBONACCI GLITCH.

         Most splashes are not one-shot. Fibonacci draws its five squares in 1.77 seconds and then
         runs `fb-glow` at 3.4s and `fb-draw` — the spiral itself — at 3.2s, both endless. It was
         never a still picture and never needed replaying. Restarting it on the finite set's
         completion meant resetting everything every 1.77 seconds, which is shorter than the
         spiral's own cycle: the arc was wiped and started again before it had ever finished
         drawing once. Not out of sync — cut off, over and over.

         SO: IF ANYTHING HERE LOOPS, NOTHING IS TOUCHED. The splash is alive on its own terms and
         no clock of mine belongs anywhere near it. Only a splash whose every animation ends —
         which is the case this was written for, and only that case — is played again. */
```

### THE ONE QUIET LINE WHILE THE APP ASKS THE BACKEND AGAIN — "Reconnecting…", and after two minutes "Can't reach the server — still trying."

html, after `<div id="banner" class="hidden">`

```
<!-- THE ONE QUIET LINE WHILE THE APP ASKS THE BACKEND AGAIN — "Reconnecting…", and after two minutes
     "Can't reach the server — still trying." Written by `reconnectSay_` (see `RECONNECT` in shell.js);
     empty, it is nothing. ALWAYS IN THE DOCUMENT, never hidden: a live region that appears and speaks
     in the same moment is announced by some screen readers and not others, and one that is there all
     along and changes its words is announced by all of them. -->
```

### Every screen lives here.

html, after `<main id="screen">`

```
<!-- Every screen lives here. Only one is ever un-hidden, so the page is never taller than the
       thing being looked at.

       EACH ID IS `s-` PLUS ITS TAB ID, and nothing checks that. `go()` reads the tab table and
       asks for `s-<id>`; a section whose name does not match is a tab that switches to nothing,
       silently — which is entry four on the list of seven in the notes. `who` became `find`
       because the screen holds tutors, venues AND subjects, so this had to move with it. -->
```

### ONE SECTION, BECAUSE THERE IS ONE SCREEN.

html, after `<id>`

```
<!-- ONE SECTION, BECAUSE THERE IS ONE SCREEN. There were eleven, and eight of them had been dead
       for a long time: library, arcade, tools, find, spotlight, favourites, basket and book are all
       columns that were folded into the funnel, and their empty sections were left behind each
       time. Posts and You have now gone the same way — see `feedPages_` and `youPages_` in find.js.
       A section whose tab does not exist is markup nothing can ever reach, and eleven of them is
       ten questions somebody has to answer before deciding none of them matters. -->
```

### ONE SECTION PER TAB.

html, after `<id>`

```
<!-- ONE SECTION PER TAB. The X axis reads its cells as `$('s-' + tab.id)`, so a tab without a
       section here places nothing and swipes to a blank screen — which is what shipped once, when
       TABS was pushed and this file was not. `TAB_ORDER` in shell.js decides the travelling order;
       the order here does not matter.
       EXCEPT A COLUMN THAT IS NOT EVERYBODY'S: its section is made by `columnsFor_` in shell.js for
       the one visitor it is for, and is not written here — this file is every visitor's document, and
       a column one person may see should not be named in everybody else's. `check-doors.js` asks
       both halves. -->
```

### `#drop` AND `#drop-back` WERE HERE:

html, after `<div id="sheet-body">`

```
<!-- `#drop` AND `#drop-back` WERE HERE: the app's own dropdown panel and the invisible backdrop that
     shut it, a sibling of the screens because `.pane` clips and a transformed column traps anything
     `fixed` inside it. Every `<select>` and the booking form's several-of-a-list questions hung it off
     their field (notes 147, 153, 226). The owner asked on 9 October for *"a more stable standard
     simple conventional drop down list"*: every dropdown is the platform's own again, and a list
     taking several answers is checkboxes in its card, under its row, so nothing is left to float
     over the app. Note 315. -->
```

### `<nav id="tabs">` WAS HERE AND WAS ALREADY EMPTY.

html, after `<select>`

```
<!-- `<nav id="tabs">` WAS HERE AND WAS ALREADY EMPTY. Nothing in any JavaScript file has written
     to it since the bar was removed — the stylesheet's own note says its rules "LIVED HERE" — so it
     was an empty fixed element reserving three rem at the foot of every screen for a control that
     did not exist. With one tab there is not even a bar to bring back. -->
```

### DID THE CODE ACTUALLY ARRIVE?

<script>, top level, before `sheet`

```
/* ==============================================================================================
     DID THE CODE ACTUALLY ARRIVE?

     A SCRIPT THAT DOES NOT LOAD IS SILENT. That is the whole problem and it is worth stating
     plainly: if the path is wrong, the browser asks for twenty files, gets twenty 404s, and says
     nothing on the page. No error, no message, no clue. What you see is the app — the markup is all
     here — and nothing in it responds, because nothing is listening.

     Every symptom of that is a symptom of something else as well. "I cannot click anything" is
     what a broken handler looks like. "It never finishes loading" is what a slow backend looks
     like. "The filter does nothing" is what a filter bug looks like. Five separate rounds went on
     those three, and the cause was a folder name.

     So it is checked, and said. `go` is defined in shell.js and used by boot.js — if it is missing
     a second after the page has parsed, no script arrived, and the page says so, names the address
     it looked for, and stops pretending to be an app.

     ONE SECOND, because that is long enough for twenty local files and short enough that nobody
     sits looking at a dead screen wondering. A slow connection that has not finished will say this
     wrongly for a moment and then be replaced by the app itself, which is the right way round: a
     false alarm you can watch disappear costs nothing, and a silence costs an evening.
  ============================================================================================== */
```

### A ONE-SECOND TIMER WAS ASKING A QUESTION NOBODY COULD YET ANSWER, AND IT DEMOLISHED THE PAGE.

<script>, top level, before `sheet`

```
/* ==============================================================================================
     A ONE-SECOND TIMER WAS ASKING A QUESTION NOBODY COULD YET ANSWER, AND IT DEMOLISHED THE PAGE.

     WHAT THIS USED TO DO: wait one second after parsing, and if `go` was not defined, replace
     `document.body.innerHTML` with the message below. The note above it said a slow connection
     "will say this wrongly for a moment and then be replaced by the app itself, which is the right
     way round: a false alarm you can watch disappear costs nothing."

     THAT SENTENCE IS WRONG AND IT COST AN EVENING. `document.body.innerHTML = …` DESTROYS THE
     MARKUP. Every screen, every pane, every element the deferred scripts are about to paint into is
     gone — so the app cannot come up underneath and replace anything. The false alarm is not
     something you watch disappear; it is the page killing itself half a second before its own code
     arrives.

     REPRODUCED, BECAUSE A BUG THIS EXPENSIVE SHOULD NOT BE ARGUED ABOUT: served locally with a
     delay added to each file in `js/`, at 900ms the app comes up fine, and at 1400ms `go` IS a
     function, no file 404s, and the body is wiped with nine screens destroyed. That is a working
     app reporting itself as broken, permanently, on any connection slow enough.

     AND ONE SECOND WAS ALWAYS A GUESS. There are twenty-five files and 1.5 MB of them, plus half a
     megabyte of stylesheet — a phone on mobile data has no chance, and the number was chosen when
     there were eighteen smaller ones.

     ---------- SO IT ASKS AT THE MOMENT THE ANSWER EXISTS ----------------------------------------

     `window.load` FIRES WHEN EVERY DEFERRED SCRIPT AND SUBRESOURCE HAS FINISHED. If `go` is missing
     THEN, the scripts really did finish and really did not define it — a fact rather than a race,
     and true on the fastest connection and the slowest alike. No number to tune and nothing to get
     wrong when the app grows another file.

     THE BACKSTOP IS FOR THE ONE CASE `load` CANNOT COVER: a request that never returns, so the
     event never fires. That gets the banner and not the wipe, because "still waiting" and "it is
     not coming" are different facts and only one of them is worth taking the page down for.

     AND IT NEVER DESTROYS ANYTHING NOW. The message is an overlay laid over the app rather than
     instead of it, so if the code does turn up late — which is the exact case that caused this —
     the overlay is taken away and the app is underneath, intact.
  ============================================================================================== */
```

### THE COUNT IS READ OFF THE LIST, NOT TYPED INTO THE SENTENCE.

<script>, in `say`

```
/* THE COUNT IS READ OFF THE LIST, NOT TYPED INTO THE SENTENCE. This said "one of the eighteen
         names" for as long as there were eighteen, and went on saying it at twenty-five — the same
         fault CLAUDE.md records about the session hook's "all 18 checks pass". */
```

### A LITTLE AFTER `load`, NOT ON IT.

<script>, top level, before `atLoad`

```
/* A LITTLE AFTER `load`, NOT ON IT. A deferred script runs before the event, but a browser is
       entitled to fire it in the same task — and asking in the same tick as the thing you are
       asking about has finished is how a check ends up racing the code it is checking, which is the
       whole fault above in miniature. */
```

### AND IF SOMETHING NEVER COMES BACK, `load` NEVER FIRES.

<script>, top level

```
/* AND IF SOMETHING NEVER COMES BACK, `load` NEVER FIRES. Ten seconds of a dead screen with no
       explanation is the silence this whole block exists to break — so it says "still loading",
       which is the honest description of that state, and keeps looking. */
```

