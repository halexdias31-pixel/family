# js/check-rows.js

The full text of comments in `js/check-rows.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-rows.js EVERY COLUMN READ OFF A ROW, AGAINST THE TAB THAT ROW CAME FROM.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-rows.js

   EVERY COLUMN READ OFF A ROW, AGAINST THE TAB THAT ROW CAME FROM.

   WHY THIS IS NOT `check-columns.js`. That one asks "is this a column ANYWHERE", against the union
   of every tab in SCHEMA, and it has to: it works by regex over the concatenated source, where a
   bare `r.name` carries no clue which tab `r` is a row of. The union is a real check and it catches
   a genuine class of fault — a column nothing has — but it cannot see the commoner one.

   THE FAULT IT CANNOT SEE, WHICH HAPPENED. The `resources` tab called the URL `link`; the
   `questions` tab calls the same thing `source_url`. Folding the first into the second left SEVEN
   reads of `r.link` on rows that no longer had one — the checklist push in `doget.gs`, the page
   counter in `content.gs`, five in `setup.gs`. Every checklist topic would have arrived with no
   link on it, which is the whole point of a resource. Nothing threw: a missing key is `undefined`,
   `S()` turns that into `''`, and `''` renders as an empty string rather than as a fault.

   `check-columns` passed on all seven, before and after, and was right to by its own question:
   `venues` has a `link` and so does `trips`, so `link` IS a column, somewhere. It is just not a
   column of the tab being read. That is the question this file asks.

   HOW IT KNOWS WHICH TAB. By parsing rather than by matching, because the binding is structural:

     const t = read(TAB.people)        t is that tab
     t.rows.forEach(r => …)            r is one of its rows
     read(TAB.jobs).rows.map(r => …)   and so is this one
     const r = t.rows[i]               and this
     rowById_(t, 'id', …)              and what this returns
     for (const r of t.rows)           and this

   Then every `r.<name>` is checked against THAT tab's columns. A name the tab has not got is
   reported with the tab it was expected on, which is the sentence that makes it fixable.

   WHAT IT WILL NOT REPORT, because a check that is mostly wrong is a check nobody reads:

     ROWS IT CANNOT TRACE. A row handed in as a function argument, or pulled out of a structure
     three calls away, has no tab this can name. Those are simply not checked — `check-columns`
     still has the union question covering them. Silence here is "I could not tell", and the
     summary says how many of those there were rather than implying it looked at everything.

     `_row`, AND ANYTHING STARTING WITH ONE. `read` attaches `_row` to every row so `setCell` can
     write back to it. It is not a column and never appears in SCHEMA.

     THE METHODS. `.forEach`, `.length`, `.map` on a row object are JavaScript, not columns.

     node js/check-rows.js
================================================================================================== */
```

### THE .gs FILES, WHEREVER THEY ARE.

top level, before `dir`

```
/* THE .gs FILES, WHEREVER THEY ARE. Three checks hand-rolled this and all three looked beside `js/`
   rather than in `backend/` — see CLAUDE.md. Directories in the order of what is true today, then
   the three spellings, because `doget.gs` and `doGet.gs` are one name to a person and two to a
   filesystem. */
```

### ---------- SCHEMA AND TAB, READ OUT OF THE SOURCE

top level, before `objectAfter_`

```
/* ---------- SCHEMA AND TAB, READ OUT OF THE SOURCE ------------------------------------------------
   Brace-counting rather than a regex: every one of these objects has prose in it with braces and
   apostrophes, and comments are stripped from the SLICE rather than from the whole file so that a
   `/*` inside a string elsewhere cannot move the boundaries of this one. */
```

### THE KEY OF EACH SCHEMA ENTRY IS A TAB and its array is that tab's columns.

top level, before `SCHEMA`

```
/* THE KEY OF EACH SCHEMA ENTRY IS A TAB and its array is that tab's columns. Sliced entry by entry
   so one tab's columns cannot leak into the next — which is exactly the leak this file exists to
   stop, and it would be a poor joke to reintroduce it in the reading. */
```

### ---------- EITHER QUOTE, BECAUSE A TAB IS NOT LESS REAL FOR BEING SINGLE-QUOTED

top level, before `SCHEMA.m.1`

```
/* ---------- EITHER QUOTE, BECAUSE A TAB IS NOT LESS REAL FOR BEING SINGLE-QUOTED ------------
       THIS MATCHED `"..."` ONLY, and every SCHEMA entry happened to be written that way — so the
       rule held by luck rather than by design. The first tab added with single quotes came back
       with ZERO columns, and the failure is loud in the wrong direction: fourteen findings saying
       `the films tab has no title column` about a tab whose SCHEMA entry names it. Noise, and
       noise in a report that exists precisely because 95 findings with 2 real ones in them is
       worse than no check at all.

       A CHECK THAT DEPENDS ON WHICH QUOTE SOMEBODY TYPED is a check with a trapdoor under it, and
       nothing anywhere said so. Found by adding a tab and reading what came out. */
```

### A FUNCTION THAT HANDS BACK `read`'s OWN SHAPE, mapped to the tab behind it — so a row off it is bound and checked exactly as a row off `read(TAB.x)` is.

top level, before `HELPERS`

```
/* A FUNCTION THAT HANDS BACK `read`'s OWN SHAPE, mapped to the tab behind it — so a row off it is
   bound and checked exactly as a row off `read(TAB.x)` is.

   `documents_: 'questions'` WAS THE ONLY ENTRY and both halves of it are gone: `documents_()` read
   the questions tab filtered to its `paper` rows, and there is no questions tab. The map stays
   because the NEXT such helper should be one line here rather than a row this check silently
   declines to trace — `untraced` counts those and the summary prints the count, which is the
   difference between "nothing to report" and "I could not look". */
```

### ---------- ONE SCOPE PER FUNCTION, AND THAT IS NOT A DETAIL

top level, before `FN`

```
/* ---------- ONE SCOPE PER FUNCTION, AND THAT IS NOT A DETAIL --------------------------------
     THE FIRST VERSION HELD ONE MAP PER FILE and reported 95 findings, nearly all of them wrong.
     `dopost.gs` binds `r` to a `family` row in one handler and to a `people` row in the next, and
     with one map per file the first binding was still standing when the second handler was walked —
     so every column of `people` was reported as missing from `family`.

     A REPORT THAT IS MOSTLY WRONG IS A REPORT NOBODY READS, and it would have been worse than that
     here: the seven real `r.link` reads this file exists to catch would have been sitting in a list
     of ninety-five, indistinguishable from the noise. Scope is what makes the answer trustworthy,
     so it is a chain — a name is looked up outwards through enclosing functions, and a binding made
     inside one dies with it. */
```

### ONE MAP, AND A DECLARATION ALWAYS WRITES TO IT — including when the right-hand side is something this cannot identify, which is then stored as `other`.

top level, before `look`

```
/* ONE MAP, AND A DECLARATION ALWAYS WRITES TO IT — including when the right-hand side is
     something this cannot identify, which is then stored as `other`. That is the second half of
     scoping and it is easy to miss: `const r = findPerson(…)` does not make `r` a row of anything,
     but if it leaves no entry the lookup walks outwards and finds the `r` from the handler above,
     and every column of `people` is reported as missing from `orders`. A name is whatever its
     NEAREST declaration made it, and "nearest declaration made it something I do not recognise" is
     an answer, not an absence. */
```

### `const r = t.rows[i]`, and `const r = t.rows.find(…)` / `[0]` / `.pop()` — one row out of a list this already knows.

in `walk`

```
/* `const r = t.rows[i]`, and `const r = t.rows.find(…)` / `[0]` / `.pop()` — one row out of a
         list this already knows. `find` is how half of `dopost.gs` gets the row it is about to
         write to, so missing it would leave those rows unchecked and silent about it. */
```

### BOUND INTO THE CALLBACK'S OWN SCOPE, not into the one making the call — the parameter belongs to the arrow function, and binding it here would leak it to

in `walk`

```
/* BOUND INTO THE CALLBACK'S OWN SCOPE, not into the one making the call — the parameter
           belongs to the arrow function, and binding it here would leak it to everything after the
           call in the enclosing function. Held against the function node and applied when the walk
           descends into it. */
```

