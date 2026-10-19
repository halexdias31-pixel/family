# js/check.js

The full text of comments in `js/check.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check.js WHAT A COMPILER WOULD HAVE DONE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check.js

   WHAT A COMPILER WOULD HAVE DONE. These files share one global scope, so a name used in find.js
   and declared nowhere at all does not fail at load — it fails at the moment somebody taps the
   thing that needs it, which may be weeks later and on somebody else's phone. That is the one cost
   of splitting into plain scripts rather than modules, and this is what pays it.

   It reads every file in ORDER, works out every name each one DECLARES and every name each one
   USES, and reports:

     · a name used and never declared anywhere        → it will throw when that line runs
     · a name declared twice at the top level         → the second silently replaces the first
     · a name used in a file that loads BEFORE the    → fine for a function (hoisted), fatal for
       file declaring it, at load time                  a const (temporal dead zone)

   The third is the only thing the split itself can break, and it is the reason ORDER below is not
   just documentation.

     node check.js

   Run it after every change. Two seconds, and it is the whole safety net.
================================================================================================== */
```

### ---------- THIS LIST HAD GONE STALE, AND A STALE LIST HERE IS WORSE THAN NO LIST

top level, before `loadOrder_`

```
/* ---------- THIS LIST HAD GONE STALE, AND A STALE LIST HERE IS WORSE THAN NO LIST ----------------
   `collections` and `tiles` were added to index.html and never added here, so the checker read 21
   of the 23 files that actually load. What it printed was four names USED BUT NEVER DECLARED —
   `cardTiles_`, `tileSet_`, `adoptSpotlight_` — every one of them a false alarm, in the one report
   whose whole value is that it can be believed without checking. Two missing entries and the
   safety net reads FAILED on a working app, which is how a safety net stops being read at all.

   IT MUST MATCH index.html, IN ORDER. That is not documentation, it is the third check below:
   whether a const is read before the file declaring it has loaded. Get the order wrong here and
   that check answers a question about an app that does not exist. */
```

### ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE

top level, before `loadOrder_`

```
/* ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE ---------------------------------------
   THIS WAS A HAND-MAINTAINED COPY of the list in `index.html`, and CLAUDE.md already records what
   that costs: `select`, `collections` and `tiles` were added there and never here, so this checker
   read twenty-one files and was silent about three — one of them `tiles.js`, where every card
   action in the app is built.

   IT DRIFTED AGAIN THE MOMENT `library.js` WAS ADDED, which is the second time and the reason it is
   now derived. `index.html` IS the order — it is the file the browser obeys — so anything that
   needs the order asks it rather than remembering it. */
```

### ---------- AND THE LIST AGAINST THE FOLDER, WHICH NOTHING COMPARED

top level, before `NOT_LOADED`

```
/* ---------- AND THE LIST AGAINST THE FOLDER, WHICH NOTHING COMPARED ------------------------------
   TWO FAULTS, AND BOTH ARE SILENT IN PRODUCTION. A name in `window.FILES` with no file beside it is
   a 404 on every visit — the app's own boot check would name it under "None of these arrived", and
   only after somebody opened the site. A file in `js/` that the list does not name is dead code
   that reads as live: it is in the repository, it is in the editor, every check here parses it, and
   the browser never asks for it.

   `js/_scope.js` IS THE ONE EXCEPTION AND IT IS DELIBERATE. Jekyll silently drops any file whose
   name begins with an underscore, which is why `.nojekyll` sits at the repo root; that file is not
   in the list and nothing is broken by its absence. Named here rather than matched by a pattern,
   because "anything starting with an underscore" would quietly excuse the next one too. */
```

### MediaRecorder — the camera widget records video with it.

in `GLOBALS`

```
/* MediaRecorder — the camera widget records video with it. A browser global like the observers
   beside it, and NOT assumed to exist at runtime: `canRecord_` in posts.js tests for it before
   the button is shown, because it is absent on older iOS. */
```

### requestIdleCallback — the builder that draws ahead of a flick (`ahead_`, shell.js) asks for idle time with it, and is written for its absence:

in `GLOBALS`

```
/* requestIdleCallback — the builder that draws ahead of a flick (`ahead_`, shell.js) asks for idle time
   with it, and is written for its absence: iPadOS Safari has none, and the builder falls back to a timer
   there (docs/history/341). A browser global, not assumed to exist. */
```

### GOOGLE IDENTITY SERVICES.

in `GLOBALS`

```
/* GOOGLE IDENTITY SERVICES. `google.accounts.id` is put on the window by the script me.js appends
   at sign-in time, so it is a global that arrives late rather than a name anybody forgot to
   declare — and me.js already guards it with `if (!window.google)`, which is the right check for
   a third party that may be blocked. Reported as undeclared since the sign-in button was written. */
```

### THE TYPED ARRAYS. Missing from this list since it was written, which nothing noticed because nothing used one until the overworld started merging geometry into

in `GLOBALS`

```
/* THE TYPED ARRAYS. Missing from this list since it was written, which nothing noticed because
   nothing used one until the overworld started merging geometry into Float32Arrays. A global the
   list does not know about is reported as a name nobody declared — a false alarm, in the one report
   that has to be believed without checking. */
```

### 3. LOAD-TIME reads of something declared later.

top level, before `declaredAt`

```
/* --- 3. LOAD-TIME reads of something declared later. A function is hoisted and fine; a const is
       in its temporal dead zone and throws before the app draws anything. Only top-level
       statements are checked, because only they run at load. --- */
```

### A FUNCTION IS HOISTED — but what it TOUCHES is not, and that is the trap this missed.

top level, before `bad`

```
/* A FUNCTION IS HOISTED — but what it TOUCHES is not, and that is the trap this missed.

       `on('card-back', …)` was called at the top of shell.js. `on` is a function declaration, so it
       is hoisted and the call is fine. What `on` DOES is write to `ACTIONS`, a `const` a hundred
       lines further down — so the call threw in that const's dead zone, shell.js stopped there, and
       every listener after it never existed. Swiping and clicking both died and the message named
       `ACTIONS`, not the line that ran too early.

       This said "hoisted across files, always safe" and skipped it. Hoisting is about reaching the
       function, not about the function being able to do its job yet.

       So a call at load time to a function in the SAME file is followed one level in: if that
       function reads a top-level value declared below the call, it is reported. One level is
       enough for the shape that actually occurs — a registrar writing to a table — and stops well
       short of chasing every branch of the program.

       AND HOISTED ONLY WITHIN ITS OWN SCRIPT. Each file is a separate <script>, and a function
       declared in one that has not run yet does not exist at all — so this line said "reaching it is
       fine" for every function in every file, and a top-level `const X = tileIcon_('hide')` in
       games.js (tiles.js loads later) passed as "nothing is read before it exists" and would have
       thrown in the browser. Imposter's first version did exactly that and only a screenshot run
       caught it (docs/history/300). Now an EARLIER file's function is reached safely and a LATER
       file's is reported, call or bare reference alike. */
```

### ---------- 4. A CALL MADE AT LOAD TIME, INTO A FUNCTION THAT IS NOT READY

top level, before `bad`

```
/* ---------- 4. A CALL MADE AT LOAD TIME, INTO A FUNCTION THAT IS NOT READY -----------------------
   A FUNCTION IS HOISTED. WHAT IT TOUCHES IS NOT — and that is the trap the check above cannot see.

   `on('card-back', …)` sat at the top of shell.js. `on` is a function declaration, so it is hoisted
   and the call itself is fine. What `on` DOES is write to `ACTIONS`, a `const` a hundred lines
   below — so the call threw in that const's dead zone, shell.js stopped there, and every listener
   after it never existed. Swiping and clicking died together, and the message named `ACTIONS`
   rather than the line that ran too early.

   So every statement that RUNS at load is examined: which functions it calls, and whether any of
   those functions reads a top-level value declared later in the same file. One level deep, which
   is the shape that actually occurs — a registrar writing to a table — and no further. */
```

### NOT INSIDE A FUNCTION BODY.

top level, before `k`

```
/* NOT INSIDE A FUNCTION BODY. A call written inside an arrow or a function expression does
           not happen at load — it happens when somebody calls the thing. This walked into them, so
           `const repaint = () => { paint(AT); }` was read as "paint runs at load", and it reported
           thirteen faults that were not there.
           A report that is mostly wrong is one nobody reads, and the two real entries in it would
           have been lost. Same mistake as the CSS checker made with comma groups, caught the same
           way: by the numbers looking implausible. */
```

### THE MANIFEST CHECK AT THE TOP SETS `process.exitCode` AND THIS LINE USED TO THROW IT AWAY.

top level, before `fail`

```
/* THE MANIFEST CHECK AT THE TOP SETS `process.exitCode` AND THIS LINE USED TO THROW IT AWAY. It
   reported an orphaned file correctly and then exited 0, which is "I checked and it was fine"
   printed over a finding — the failure this repository keeps catching in its own checks. Found by
   mutation, which is the only thing that would have found it. */
```

