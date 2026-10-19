# js/check-surfaces.js

The full text of comments in `js/check-surfaces.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### check-surfaces.js — NOTHING OPENS OVER THE APP

top level, before `fs`

```
/* ==================================================================================================
   check-surfaces.js — NOTHING OPENS OVER THE APP

   THE RULE IS IN THE ENGINE SHEET, on the `surfaces` tab, and a rule that lives only in a sheet is a
   rule somebody breaks in six months without ever having read it. This is the half that says so at
   the moment it happens.

   WHAT IT REFUSES, and what to write instead:

     window.open      a new tab. It asks for pop-up permission, so the first press often does nothing
                      at all; the back gesture then leaves the app entirely, and whatever was
                      filtered or half filled in is gone.
                      → openSheet(). It is part of this page, so closing it puts you back exactly
                        where you were, and the browser's own print still takes it.

     confirm()        an OS dialog in the OS's typeface, with the OS's buttons, saying not one word
                      this app chose.
                      → sure_(el, 'Turn it down?'). The button becomes the question: first press
                        changes its words, second press does it, four seconds puts it back.

     prompt()         the same, and it was the only place a value was typed into something the app
                      did not draw.
                      → a sheet with a real field. It can also explain why the answer matters, which
                        a one-line grey box cannot.

     alert()          a dialog to say something already true.
                      → toast(). It reports and blocks nothing.

   COMMENTS AND STRINGS ARE STRIPPED FIRST, or this file could not describe what it forbids — every
   note above names `confirm()` and every one of them would be a failure. That is also why the
   stripping is real rather than a regex over raw text: `check-css` learned the same lesson.

   `target="_blank"` IS ALLOWED ONLY ON AN EXTERNAL ADDRESS. Somebody's bank is not this app and
   should not pretend to be. A `_blank` on anything else is a new tab wearing a link's clothes.

   Run:  node js/check-surfaces.js
================================================================================================== */
```

### ---------- STRIP COMMENTS AND STRING BODIES

top level, before `strip`

```
/* ---------- STRIP COMMENTS AND STRING BODIES -------------------------------------------------------
   A one-pass state machine rather than a regex, because a regex cannot tell `// not a comment` inside
   a string from a real one, and this file is full of both. Whitespace is kept so line numbers survive
   — a report that cannot say WHERE is a report nobody acts on. */
```

### A `.prompt()` ON AN OBJECT IS SOMEBODY ELSE'S API, not `window.prompt` — it was the browser's own install dialog, `INSTALL_PROMPT.prompt()`, until me.js

in `BANNED`

```
/* A `.prompt()` ON AN OBJECT IS SOMEBODY ELSE'S API, not `window.prompt` — it was the browser's own
     install dialog, `INSTALL_PROMPT.prompt()`, until me.js stopped offering one — which is why the
     pattern requires the call to be bare rather than on an object. */
```

### `_blank` IS CHECKED ON THE STRIPPED SOURCE, like everything else — this file describes what it forbids, so a scan of the raw text finds its own comments and

top level, before `lines`

```
/* `_blank` IS CHECKED ON THE STRIPPED SOURCE, like everything else — this file describes what it
     forbids, so a scan of the raw text finds its own comments and reports them. That is not a
     detail: the first version of this check failed on its own explanation.

     A LINE PASSES IF IT, OR ONE OF THE THREE ABOVE IT, MENTIONS http. An address written out is the
     ordinary case; a `^https?://` test standing in front of a variable is the other one, and a
     checker that cannot read a guard forces the guard to be deleted. */
```

