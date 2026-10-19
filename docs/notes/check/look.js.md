# check/look.js

The full text of comments in `check/look.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/look.js OPEN A SURFACE AND PHOTOGRAPH IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/look.js

   OPEN A SURFACE AND PHOTOGRAPH IT.

   WHY THIS EXISTS. `check/ui.js` visits the nine screens `screen()` registers and measures each one
   at four widths. That is every screen the app HAS — and it is not every surface the app DRAWS. The
   funnel is one screen, and what it shows depends entirely on what has been answered in it: at rest
   it is three words and a search box. A past paper, its questions, their mark schemes and the print
   row are all inside `stuff`, behind two or three answers, and `check/ui.js` has never once painted
   any of them.

   SO THE ONE SURFACE THIS APP IS FOR HAS NEVER BEEN LOOKED AT BY ANYTHING. Every finding about it
   this week came from reading the source and reasoning, which is how three of them were wrong on
   the first pass — and CLAUDE.md's own rule is that layout facts come from the browser.

   IT MEASURES NOTHING. `check/ui.js` is the instrument; this is the window. It drives the app to a
   state, writes a PNG and prints what it found there, and always exits 0 — it is for looking at,
   not for failing on.

     node check/look.js --payload /tmp/p.json --find "Paper 1"
     node check/look.js --payload /tmp/p.json --find "Paper 1" --width 390 --as admin

   `--find` is typed into the funnel's own search box, so this reaches a surface the way a person
   does rather than by calling a drawing function directly. A screenshot of a state nobody can get
   to is worth nothing.
================================================================================================== */
```

### THROUGH THE BOX ITSELF where there is one — `on('input')` on `#stuff-q` sets `STUFF.q` and repaints, so this is the same path a person's typing takes.

top level, before `box`

```
/* THROUGH THE BOX ITSELF where there is one — `on('input')` on `#stuff-q` sets `STUFF.q` and
         repaints, so this is the same path a person's typing takes. `paintStuff` is the fallback
         and the reason the box is preferred: calling it directly proves the drawing works and
         proves nothing about whether the control still reaches it. */
```

