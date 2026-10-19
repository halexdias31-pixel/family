# js/check-strings.js

The full text of comments in `js/check-strings.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-strings.js A `${…}` INSIDE A QUOTED STRING, WHICH IS JUST CHARACTERS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-strings.js

   A `${…}` INSIDE A QUOTED STRING, WHICH IS JUST CHARACTERS.

   Inside a template literal, `${…}` interpolates. Inside a `${…}` you are back in ordinary
   JavaScript — so `'${esc(k)}'` is a single-quoted string holding a dollar, a brace and six letters,
   and it reaches the page exactly like that. Nothing throws. The label is drawn, in the right place,
   in the right style, saying `${esc(k)}`.

   THAT IS WHY IT SURVIVES. Every other kind of template mistake either throws or leaves a blank;
   this one leaves something that looks deliberate.

   IT IS PARSED, NOT SCANNED, AND THAT MATTERS. This was first written as a brace counter and
   reported twenty-four faults of which three were real — it could not tell a nested template, which
   is correct and everywhere, from the dead kind. Rewritten as a hand lexer, it then read the quote
   inside the regex on line 37 of me.js as the start of a string and swallowed the next forty lines,
   silently losing one of the real faults. Deciding whether a slash begins a regex or a division
   needs the previous token, which is the point at which you are writing a parser.

   acorn is already here for check.js. A string literal sitting in a template's EXPRESSION is exactly
   the fault, and the tree says so with no guessing: the quotes in a nested template are quasi text
   rather than literals, so correct nesting cannot be mistaken for the fault.

     node check-strings.js
================================================================================================== */
```

### `select`, `collections` AND `tiles` WERE MISSING.

in `ORDER`

```
/* `select`, `collections` AND `tiles` WERE MISSING. index.html loads twenty three
                  files and this listed twenty, so three were never read — and `tiles.js` is where
                  every card action in the app is built, which made all of them invisible to this
                  audit. Same drift `check.js` had: a list of files kept by hand, beside another
                  list of files kept by hand. */
```

