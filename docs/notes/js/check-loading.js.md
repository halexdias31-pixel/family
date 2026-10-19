# js/check-loading.js

The full text of comments in `js/check-loading.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-loading.js ONE LOADER, AND NOTHING ELSE IN THE APP DRAWS A WAIT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-loading.js

   ONE LOADER, AND NOTHING ELSE IN THE APP DRAWS A WAIT.

   THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple
   loading thing while it's info or whatever is loading."* Measured that day (docs/history/306): a
   skeleton post on three columns, ten waiting sentences in thirteen places, two columns calling a
   wait "nothing here", seven waits with nothing on the screen, and nineteen widgets each with a look
   of its own before it had started. Twenty-four ways to say one thing, and every one of them was put
   there by somebody solving the wait in front of them — which is exactly how the twenty-fifth will
   arrive. Nothing about a second loader fails at run time. It just looks different.

   So this reads the source, the way `check-css` does, and fails on any of these:

     1. A WAITING PHRASE in a string the app can draw — "Loading…" and any "Loading / Searching /
        Finding / Opening … …", "Looking for", "Fetching", "Please wait", and the ones the inventory
        found ("Starting the camera", "still coming", the Bible's "on its way" and "Opening the list",
        and the quiet retry's "Waiting for the server", which arrived in every empty column the same
        day) — AND THE SHAPE, whatever the words: a drawn element whose text trails off in "…". The
        few that are right where they are are listed by name with a reason (`PHRASE_OK`). Comments
        are not read: the prose in this repository quotes the old words on purpose, so the next
        person knows what was there.
     2. A WAITING CLASS written into markup — a skeleton, a shimmer, a spinner, `is-wait`,
        `is-loading`, a `loader` — or the one loader's own class (`loading`) written out by hand
        anywhere but `loading_()` and `loaded_()` in shell.js. A hand-written copy is a copy that
        drifts: the first time somebody leaves off `role="status"`, a screen reader hears nothing.
     3. IN style.css, A RULE FOR ONE OF THOSE CLASSES, or the loader's own rules outside its one block
        (the section headed "WAITING: ONE LOADER"), or a `@keyframes` named for waiting — spin, load,
        wait, pulse, shimmer, skeleton — anywhere but that block. Two are accepted below, by name,
        each with its reason.
     4. THE CONTRACT ITSELF: `loading_()` returns `role="status"`, `aria-label="Loading"` and three
        dots; its block colours only through tokens, sizes only in `rem` (nothing in it is pressed),
        and stills it under `prefers-reduced-motion`. And it is CALLED — a count is printed, because a
        loader nothing draws passes every rule above.
     5. THE LOADING SCREEN'S LOADER IS THIS ONE, WRITTEN OUT. A first visit has none of the books'
        drawings kept, and its splash is the name, still, with the loader under it (docs/history/322).
        index.html parses that before shell.js exists, so it cannot call `loading_()` and carries the
        markup by hand — the one hand-written copy allowed, and so the one held: it must be exactly
        what `loading_()` returns, inside `#splash-still`, and the only `class="loading"` in the page.

   WHAT IS NOT A WAIT AND IS NOT READ HERE: a press already sent (`send_`'s ring and its "Saving…",
   "Sending…" — docs/history/094, the busy ring on a button or a tile); a book's animation drawn on
   the splash, which is teaching and not a wait; and an error or an empty result, which keep their
   words.

     node js/check-loading.js
================================================================================================== */
```

### ---------- THE APP'S OWN FILES, IN THE ORDER index.html LOADS THEM

top level, before `appFiles_`

```
/* ---------- THE APP'S OWN FILES, IN THE ORDER index.html LOADS THEM ---------------------------------
   Read off `window.FILES` rather than listed here — `check-flow` records what a hand-kept copy of that
   list cost twice. A list that cannot be read is a check that cannot reach its subject, and says so. */
```

### ---------- 1. THE OLD WORDS

top level, before `PHRASES`

```
/* ---------- 1. THE OLD WORDS ------------------------------------------------------------------------
   EACH ONE A WAIT THAT WAS DRAWN IN WORDS OF ITS OWN, and each with where it was, so a hit says what
   it is a return of. Narrow on purpose: "on its way" alone is also "a new PIN is on its way", which
   is a sentence about an email and not a wait, so the Bible's line is matched by its own words. */
```

### ANY WAIT THAT TRAILS OFF, NOT ONLY THE BARE WORD.

in `PHRASES`

```
/* ANY WAIT THAT TRAILS OFF, NOT ONLY THE BARE WORD. This was `/\bLoading(…|\.\.\.)/`, and found by
     review it let the commonest new waiting sentence straight through: "Loading videos…", "Loading the
     questions…", "Opening the camera…" and "Searching…", each put back in a copy, left this green while
     CLAUDE.md said this check "fails on the rest". The verbs a wait is written with, followed by
     anything up to the ellipsis that makes it a wait. */
```

### ---------- AND THE SHAPE, WHATEVER THE WORDS

in `PHRASES`

```
/* ---------- AND THE SHAPE, WHATEVER THE WORDS ------------------------------------------------------
     A LIST OF WORDS STOPS ONLY THE WAITS SOMEBODY ALREADY THOUGHT OF. "Getting your sessions…" on the
     booking page, put back in a copy, passed every line above. What every one of them shares is the
     shape: a drawn element whose text trails off in an ellipsis. On the day this was written it met
     exactly one line in the app, listed below with its reason. */
```

### THREE OF THOSE ARE STILL IN THE APP, AND EACH IS RIGHT WHERE IT IS.

top level, before `AFTER_THE_WAIT`

```
/* THREE OF THOSE ARE STILL IN THE APP, AND EACH IS RIGHT WHERE IT IS.
   The score board and the hours say theirs when the payload came (or failed for good) without them,
   which is a fact. Each is let through only in its own file, only after the line that draws the loader
   while the payload is still on its way (`awaiting_`, shell.js) — so the sentence cannot slide back
   to being the wait. The rest are let through by name, with what makes them not a wait. */
```

### ---------- 3. THE STYLESHEET

top level, before `WAIT_KEYFRAME`

```
/* ---------- 3. THE STYLESHEET ------------------------------------------------------------------------
   A KEYFRAME NAMED FOR WAITING, outside the block. Two are accepted — each a different thing that
   happens to share a word — and printed on every run with the reason, so the list is read rather
   than grown. */
```

### `mb-spin` WAS THE SECOND — the coin turning over in the blocks splash — and went with it on 10 Oct (docs/history/322).

top level, before `ACCEPTED_KEYFRAMES`

```
/* `mb-spin` WAS THE SECOND — the coin turning over in the blocks splash — and went with it on 10 Oct
   (docs/history/322). An acceptance whose keyframe has gone is a pass written in advance for whatever
   is next given that name, so one that is not in style.css any more fails below. */
```

### ---------- THE STRINGS OF EVERY APP FILE, AND WHERE EACH SITS

top level, before `lineOf`

```
/* ---------- THE STRINGS OF EVERY APP FILE, AND WHERE EACH SITS -------------------------------------
   acorn's tokenizer, so a comment is never read as a string and a template's `${/* note *\/''}` is
   read as the code it is. Each token carries its offset; the line is worked out from it. */
```

### ---------- 5. THE LOADING SCREEN'S LOADER IS `loading_()`'s, WRITTEN OUT

top level, before `splashLoader`

```
/* ---------- 5. THE LOADING SCREEN'S LOADER IS `loading_()`'s, WRITTEN OUT ----------------------------
   "the app's one loader under it (the same markup and classes loading_() writes)" — what a first visit
   is shown since the splashes that taught nothing went (docs/history/322). Run, not read: the function
   is taken out of shell.js as acorn found it and called, so the comparison is with what the app draws
   in a card, not with what somebody thinks it draws. Byte for byte, because the copy is the markup and
   there is nothing in between to forgive a difference — a dropped `role="status"` here is a first visit
   a screen reader hears nothing on. */
```

