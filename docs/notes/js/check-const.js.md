# js/check-const.js

The full text of comments in `js/check-const.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-const.js A `const` THAT IS ASSIGNED TO.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-const.js

   A `const` THAT IS ASSIGNED TO. The throw is real, it is silent wherever a `try` is standing over
   it, and everything before the assignment has already happened — which is what makes it survive.

   THE ONE THAT PROMPTED THIS, in `shell.js`:

       const d = await res.json();
       …
       try {
         d = libraryInto_(d, await libraryRows_());   // <- "Assignment to constant variable"
       } catch (e) {
         d.questions = d.questions || [];             // <- finds it already populated, does nothing
       }

   IT HAD BEEN THROWING ON EVERY SINGLE LOAD and nothing anywhere said so. `libraryInto_` MUTATES
   `d` and returns the same object, so the questions were written before the assignment was
   attempted; the throw came after the useful work, and the catch's own repair found the key already
   there and left it alone. A correct fallback standing over a broken line — the same shape as the
   `check-flow` stub with no `text()`, and as `.mat-out` being "fixed" twice on a measurement nobody
   took. Every one of those is in CLAUDE.md.

   WHAT IT COST was not the questions, which were fine. It was that NOTHING AFTER THAT LINE INSIDE
   THE TRY COULD EVER RUN, and for as long as the line was last in its block that was invisible. The
   first code put on the next line simply did not execute, and only a test that booted the app and
   asked what was in `DATA` found it.

   WHAT THIS CHECKS, deliberately narrow so it does not have to be a whole scope analyser: within
   ONE function body, a name declared `const` and later the target of an assignment. That is the
   shape above and it is high-confidence — a `const` and an `=` on the same name in the same
   function is never anything else.

   NOT CHECKED, because it would need a real scope tree and would report things that are fine: a
   `const` in one function and an assignment to the same NAME in another (that is a different
   binding), and shadowing. Narrow and certain beats broad and noisy — `check-rows.js` records what
   95 findings with 2 real ones in them is worth.

     node js/check-const.js
================================================================================================== */
```

### ---------- ONE BODY AT A TIME, AND IT MUST NOT LOOK INSIDE THE NEXT ONE

top level, before `bodies`

```
/* ---------- ONE BODY AT A TIME, AND IT MUST NOT LOOK INSIDE THE NEXT ONE ---------------------
     THE FIRST VERSION OF THIS CHECK REPORTED 95 FINDINGS AND EVERY ONE WAS WRONG. It collected the
     bodies correctly and then walked each one with the ordinary walker, which descends into nested
     functions — so the top-level pass gathered every `const` and every assignment in the whole
     file and matched them against each other across scopes. It "found" a `const` declared at line
     552 being assigned at line 153, four hundred lines EARLIER and in a different function.

     THAT IS THE `check-rows.js` FAULT EXACTLY, recorded in CLAUDE.md: one binding map per file
     instead of per scope, 95 findings with 2 real ones in them, which is worse than no check at
     all because the real ones are indistinguishable from the noise.

     SO THE WALK STOPS AT A FUNCTION BOUNDARY. `ownWalk` visits the body's own nodes and refuses to
     enter a nested function — that function gets its own pass, with its own bindings, from the
     list below. */
```

### ---------- A NAME THAT IS ALSO A `let` SOMEWHERE IS NOT OURS TO JUDGE

top level, before `mutable`

```
/* ---------- A NAME THAT IS ALSO A `let` SOMEWHERE IS NOT OURS TO JUDGE ---------------------
     THE THREE THAT SURVIVED THE SCOPE FIX WERE ALL THE SAME SHAPE and all three were wrong:

         for (let k = 0; k < n; k++) { … }      // one binding
         const k = 32 / Math.max(w, h);         // a different one, further down

     A `for` header and a later `const` are separate blocks and separate bindings; the `k++`
     belongs to the loop. Getting that right properly means a block-level scope tree, which is more
     machinery than this rule is worth.

     SO IT DECLINES TO ANSWER INSTEAD. If a name is declared `let` or `var` anywhere in the same
     function, the assignment might legitimately be to that one, and this says nothing. It is
     deliberately the conservative direction: a missed case is a check that is merely incomplete,
     a false one is a check nobody reads. The fault this exists for — a lone `const d` with no
     `let d` anywhere near it — is untouched by the exemption, which is the thing to verify and is
     verified by mutation below. */
```

