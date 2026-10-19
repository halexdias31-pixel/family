# js/check-dropdowns.js

The full text of comments in `js/check-dropdowns.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-dropdowns.js EVERY DROPDOWN IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF ONE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-dropdowns.js

   EVERY DROPDOWN IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF ONE.

   THE OWNER, 9 OCTOBER: *"i dont like currect drop down list thing. i want a more stable standard
   simple conventional drop down list."* For the week before, every single-choice `<select>` in the
   app was `pointer-events: none` and a tap near one was caught, cancelled and answered with the app's
   own floating panel, `#drop` (note 226) — and a list of several answers hung the same panel off its
   row (notes 147, 153). The reversal is note 315; the banner over `dropOnFront_` in book.js says what
   the panel cost and what to say to the next request for it.

   A PANEL LIKE THAT COMES BACK ONE SMALL PIECE AT A TIME — a `pointer-events` rule here, a listener
   that cancels a press there — and each piece is reasonable on its own. So this fails on any of the
   three pieces it was built from:

     1. A RULE THAT TAKES THE POINTER OFF A SELECT. `pointer-events: none` on a selector whose subject
        is a `select`, or a class or id that some `<select>` in the app is drawn with — or, because the
        property is INHERITED, an element some `<select>` is drawn inside (`.mat-sel`, `label.field`),
        or a subject that names no element at all (`.field > *`), which reaches a select as surely as
        `select` does. That one rule was what kept every platform's list shut, and it is invisible to
        every journey: jsdom has no cascade, so `check-flow.js` cannot see it. The same in a script:
        `style.pointerEvents = 'none'`, or a `style="…pointer-events:none…"` on a select or a wrapper of
        one, in a function that is about a select. `check/press.js` asks the same question of the real
        cascade with a real finger, on every page of every column that draws a select.
     2. A PANEL FOR IT TO OPEN. `#drop` / `#drop-back` in index.html, or any other element there with a
        `role="listbox"` — a list the app draws for itself, outside every card.
     3. A LISTENER THAT CANCELS A SELECT'S PRESS OR TAKES ITS FOCUS. A `click`, `mousedown`,
        `pointerdown`, `touchstart`, `touchend`, `focus` or `focusin` listener that calls
        `preventDefault()` or `.blur()` and is about a select (it, or a function it calls by name, says
        `select` or `SELECT`). ONE STATEMENT is allowed and named: the swipe guard beside `PRESS_MOVED`
        in shell.js, `if (….closest(FIELD_ACTS_)) e.preventDefault();`, which cancels a press only once
        the app has taken it as a swipe. Those statements are taken out and the REST of the listener is
        still read — the guard lives in the app's own click dispatcher, the likeliest place of all for
        a panel's front door to come back, and for one commit the whole dispatcher was let off because
        it mentioned the guard's name (found by review, 9 October). Anything else is the panel's front
        door being rebuilt.

   `check-flow.js` HOLDS THE OTHER HALF — a journey that presses a real select through the app's own
   dispatcher and asks that nothing cancels it, nothing blurs it and nothing appears in the document.
   Between them: the stylesheet, the markup, the listeners and the behaviour.

   PROVED BY MUTATION, which is the only way to know a check can fail: run against the commit before
   note 315 (c332f6b), all three sections name the panel; on this one, none does.

     node js/check-dropdowns.js
================================================================================================== */
```

### ---------- WHAT A SELECT IS DRAWN WITH

top level, before `selClasses`

```
/* ---------- WHAT A SELECT IS DRAWN WITH ---------------------------------------------------------------
   Every class and id on a `<select …>` the app writes, in a template or in index.html. A rule naming
   `.bk-sel` reaches a select exactly as `select` does, so both are asked about. `${…}` pieces are left
   out: an attribute assembled at run time names nothing this can read. */
```

### ---------- 1. THE STYLESHEET

top level, before `wrappers`

```
/* ---------- 1. THE STYLESHEET ------------------------------------------------------------------------
   Comments out, then every `selectors { declarations }` at any depth of `@media` / `@supports`. The
   SUBJECT of a selector is its last compound — `.f-row select` styles the select, `select + span`
   styles the span — so only the last compound is asked whether it is a select. */
```

### ---------- WHAT A SELECT IS DRAWN INSIDE

top level, before `wrappers`

```
/* ---------- WHAT A SELECT IS DRAWN INSIDE ---------------------------------------------------------------
   `pointer-events` IS INHERITED (shell.js says so where it writes it on the columns), so a rule on a
   select's wrapper reaches the select as surely as one on the select. Every `<select` the app writes is
   found in its template, and the elements still open around it in that template — and in the template
   it is interpolated into — are its wrappers: `<label class="mat-sel"><select …>`, fieldHtml's
   `<label class="field">`. A wrapper assembled in another function is beyond this; `check/press.js`
   asks the real cascade for that half. */
```

### ---------- 1. THE STYLESHEET

top level, before `css`

```
/* ---------- 1. THE STYLESHEET ------------------------------------------------------------------------
   Comments out, then every `selectors { declarations }` at any depth of `@media` / `@supports`. The
   SUBJECT of a selector is its last compound — `.f-row select` styles the select, `select + span`
   styles the span — so only the last compound is asked about. Inside an `:is()` or a `:where()` each
   alternative is a subject of its own; `:not()` and `:has()` narrow and name nothing. The value is read
   in any case (`NONE` is `none`). */
```

### ---------- 3. THE LISTENERS

top level, before `PRESS`

```
/* ---------- 3. THE LISTENERS ----------------------------------------------------------------------------
   Parsed, not grepped: a listener is an `addEventListener(type, fn)` call (or `onclick = …` style is
   not used by this app for these events) with a literal type. Its source is the function's own, plus
   the source of every top-level function it calls by name — `selAt_(e)` is where the old click
   listener asked "is this a select", so one level is what it takes to see it. */
```

### AND A CLASS HANDED TO A SELECT THROUGH AN ARGUMENT — `<select ${attrs}>` in a function, and the `class="…"` in what its callers pass for `attrs`.

top level, before `src`

```
/* AND A CLASS HANDED TO A SELECT THROUGH AN ARGUMENT — `<select ${attrs}>` in a function, and the
   `class="…"` in what its callers pass for `attrs`. The qualification shelf's `.q-name` is drawn that
   way, and for a commit a rule on it was invisible here. */
```

### AND A SCRIPT THAT WRITES IT:

top level, before `src`

```
/* AND A SCRIPT THAT WRITES IT: `….style.pointerEvents = 'none'` or `setProperty('pointer-events', 'none')`
   in a function that is about a select. The columns' own `pointerEvents` writes in shell.js are about
   a column, and say nothing of a select. */
```

### ---------- WHAT IT FOUND

top level, before `say`

```
/* ---------- WHAT IT FOUND --------------------------------------------------------------------------------
   A COUNT FOR EVERY SECTION, because "no select is pointer-events: none" and "no select was found to
   ask about" print the same silence. A section that read nothing fails rather than passes. */
```

