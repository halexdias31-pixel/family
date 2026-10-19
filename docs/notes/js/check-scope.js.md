# js/check-scope.js

The full text of comments in `js/check-scope.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### check-scope.js — A NAME DECLARED INSIDE A BLOCK AND USED OUTSIDE IT.

top level, before `fs`

```
/* ==================================================================================================
   check-scope.js — A NAME DECLARED INSIDE A BLOCK AND USED OUTSIDE IT.

   TWICE TONIGHT, IN TWO FILES, AND ALL EIGHT CHECKERS PASSED BOTH TIMES:

     `day`   declared inside `festiveOffers`, used by `add` at the top level — every term date threw
     `tooth` moved inside `if (skin.torn)`, used below it to place the content — every share threw

   `check.js` reads TOP-LEVEL names and cannot see inside a function. `check-dead` looks for things
   nothing calls. Neither has any idea about blocks, and this is the one fault that survives both:
   the code parses, the name exists somewhere, and it is simply not in scope where it is read.

   WHAT THIS DOES: walks every `const`/`let` declared inside a `{}` block, then looks for that name
   being used after the block closes, in the same function. Crude — it does not build a real scope
   tree — but it catches exactly the shape that got through twice, and it is quiet on names that are
   redeclared later or shadow an outer one.
================================================================================================== */
```

### SINGLE LETTERS ARE SKIPPED.

top level, before `close`

```
/* SINGLE LETTERS ARE SKIPPED. `v`, `x`, `t` are what everybody calls a callback argument, and
       the same letter in two adjacent callbacks is not a scope fault — it is the most ordinary
       thing in the file. Both real faults tonight had descriptive names, because a name worth
       declaring in a block is a name somebody bothered to spell. */
```

### WALK OUT BY INDENTATION, NOT BY BRACES.

top level, before `close`

```
/* WALK OUT BY INDENTATION, NOT BY BRACES. Counting braces sounded right and reported seventy-six
       faults, nearly all of them nonsense: a brace inside a template or a regex throws the count
       off and the block appears to close in the middle of a comment. Indentation is cruder and, in
       a file that is consistently indented, far more reliable — the block ends at the first line
       indented LESS than the declaration. A checker that cries wolf seventy-six times is one nobody
       reads, which is worse than not having it. */
```

### ---------- WHERE TO STOP LOOKING

top level, before `fnEnd`

```
/* ---------- WHERE TO STOP LOOKING ------------------------------------------------------------
       THIS WALKED TO THE NEXT LINE AT COLUMN ZERO, which is right for the frontend — many small
       top-level functions — and useless for `doPost.gs`, which is ONE function holding seventy
       `if (action === …)` blocks all indented the same. There is no column-zero line until the end
       of the file, so it searched four hundred lines into unrelated handlers and reported forty-six
       faults, every one of them false. Including one on the frontend from an object key.

       A SIBLING BLOCK AT THE SAME INDENT ENDS THE SEARCH. Two `if` blocks side by side are separate
       scopes, whatever encloses them — which is the whole shape it was getting wrong. */
```

### REDECLARED, OR A FRESH PARAMETER — either way it is a different name and fine.

top level, before `file`

```
/* REDECLARED, OR A FRESH PARAMETER — either way it is a different name and fine.
         SIXTY-SEVEN REPORTS WERE THIS. `const v = ...` inside one callback and `map(v => ...)`
         below it are two unrelated `v`s, and flagging them buries the one report that matters.
         A checker is only worth having if its output is short enough to read every time. */
```

### A KEY IN AN OBJECT LITERAL IS NOT A USE EITHER.

top level, before `file`

```
/* A KEY IN AN OBJECT LITERAL IS NOT A USE EITHER. `term: 'interval'` is the word `term`
         naming a field, and this read it as reading the variable — the one frontend report this
         checker produced, and it was wrong. A property access was already excluded; the key half
         of the same idea was not. */
```

