# check/deploy.js

The full text of comments in `check/deploy.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/deploy.js DOES A PUSH REACH A PHONE THAT ALREADY HAS THE SITE?

top level, before `http`

```
/* ==================================================================================================
   @family. — check/deploy.js

   DOES A PUSH REACH A PHONE THAT ALREADY HAS THE SITE?

   REPORTED AS "when i first go on site it shows old reels looking set up. then i hard refresh then
   it works fine???" — and it was true, on the live site, for every visitor. Two faults, neither
   visible in the source and neither reachable by any check that existed:

     1. `sw.js` decided what a navigation was by its PATHNAME: `url.pathname === '/'`. GitHub Pages
        serves a project site from `/family/`, which is neither `/` nor anything ending in
        `index.html` — so the entry point fell through to the file branch, whose first act is to
        serve an exact URL match with no network at all. The entry point is the ONE url that
        carries no deploy stamp, so it matched itself for ever: every visitor pinned to whichever
        build first filed it away, with `LOAD` inside it naming that build's urls, so every other
        file was an exact hit too. The whole old site, permanently, escapable only by a hard
        refresh.

     2. Even where the page branch WAS reached, it fetched with the request's default cache mode.
        GitHub Pages sends `max-age=600` on HTML and nothing can change that — so for ten minutes
        after a deploy the browser answered out of its own store and never touched the network.

   WHY NOTHING CAUGHT IT. `check/load.js` serves the repository at `/`, so fault 1's guess was true
   on every run it has ever made, and it measures TIMES AND BYTES — a stale load is fast and small,
   which is the flattering direction. This check asks the one question neither of those can: after
   a deploy, does the browser run the NEW code. Nothing about bytes, nothing about milliseconds, so
   its answer does not move with the machine.

   HOW IT ASKS. Three loads and two deploys, because the poisoned entry is WRITTEN on load 2 and
   only bites on load 3 — a worker never controls the page that registered it, so load 1 is
   uncontrolled, load 2 is the first the worker sees, and load 3 is the first that can be answered
   out of what load 2 filed. A two-load version of this check passed against the broken worker.

   A deploy is: one file really changes, and `index.html`'s own date moves an HOUR. `LOAD` buckets
   to five minutes, so touching it by seconds changes nothing four times out of five — which has
   already been reported twice in this project as "0 KB after a deploy" for a deploy that had not
   happened.

   AT BOTH BASE PATHS, because the fault was base-path-dependent and the lab's own base path is
   what hid it. `/family/` is where the site really is; `/` is where every other harness here puts
   it.

     node check/deploy.js
================================================================================================== */
```

### ---------- A COPY OF THE SITE, NOT THE SITE

top level, before `ROOT`

```
/* ---------- A COPY OF THE SITE, NOT THE SITE -------------------------------------------------------
   THIS USED TO DEPLOY INTO THE WORKING TREE — rewrite js/posts.js and data/textbooks.json, touch
   index.html's date — and put them back on exit. That was safe while it ran alone and stopped being
   safe the day check-all ran it beside the journeys (8–9 Oct): check-flow reads every js file from
   disk for each journey it boots, read posts.js in the instant this had truncated it to rewrite it,
   and booted an app with no posts.js in it — `ReferenceError: openSharedPost is not defined` inside
   `load()`, a crash of the whole run that never happened alone. A check must not change what the
   other checks are reading. So the deploy happens to a private copy: the code and the page copied,
   every data file but the one this edits linked rather than copied (the library is tens of
   megabytes), and the server serves the copy. The working tree is never written. */
```

### ---------- AND A DATA FILE, BECAUSE THE WORKER PINNED THOSE TOO

top level, before `BOOKS`

```
/* ---------- AND A DATA FILE, BECAUSE THE WORKER PINNED THOSE TOO --------------------------------------
   `data/textbooks.json` and every `data/settings/` file were fetched with no `?t=`, so the worker held
   the first copy a device ever saw and answered every later load out of it: a deploy reached the code
   and never the books. Each deploy below also renames a chapter, and the next load has to show the new
   name. Restored with the rest, whatever happens.
   AND CHANGES ONE ANIMATION. Pythagoras is a row of that file too, and the loading screen draws the
   copy a load keeps of it (`splashSync_`): after a deploy the device's copy must be the new drawing,
   by its hash — or the splash would show yesterday's Pythagoras for good. */
```

### ---------- A SERVER THAT ANSWERS LIKE GITHUB PAGES

top level, before `serve`

```
/* ---------- A SERVER THAT ANSWERS LIKE GITHUB PAGES ------------------------------------------------
   The two headers that matter are the ones the faults turned on: an `ETag` on everything, because
   the worker's whole design is conditional requests, and `max-age=600` on the HTML, which is what
   Pages sends and what no repository setting can change. Serving the page `no-cache` here would be
   a lab that agrees with the comment rather than with the server. */
```

### ONLY A GET COUNTS AS THE PAGE BEING ASKED FOR.

in `srv`

```
/* ONLY A GET COUNTS AS THE PAGE BEING ASKED FOR. The first version of this counted every
       request and reported the entry point re-fetched on a load that ran entirely old code —
       because `watchBuild_` sends a HEAD to read the ETag, and a HEAD goes past the worker by
       design. A number that counts the wrong rows stops meaning anything. */
```

### A NEW TAB PER LOAD, NOT `goto` TWICE.

in `run`

```
/* A NEW TAB PER LOAD, NOT `goto` TWICE. Chromium treats a navigation to the url already in the
       address bar as a RELOAD, and a reload's request carries `cache: 'no-cache'` — so the
       browser's own ten-minute hold on the entry point is bypassed for free and the harness
       measures a case nobody is in. "When i first go on site" is a fresh navigation: a bookmark, a
       home-screen icon, a tapped link. The context is shared, so the HTTP cache, the store and the
       registration are all the same ones; only the navigation is a real one. */
```

