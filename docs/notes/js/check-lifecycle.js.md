# js/check-lifecycle.js

The full text of comments in `js/check-lifecycle.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-lifecycle.js AUDITING A PROCESS, WITHOUT ANYBODY HAVING TO BOOK ANYTHING.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-lifecycle.js

   AUDITING A PROCESS, WITHOUT ANYBODY HAVING TO BOOK ANYTHING.

   A static card can be checked by looking at it. A LIFECYCLE cannot: to see what a booking looks
   like after a tutor applies, is chosen, is paid for and then withdraws, somebody has to do all
   five of those things, in order, with two accounts, and then look. That is twenty minutes to test
   one path, and there are a dozen paths, so in practice none of them is ever tested twice — which
   is exactly how a client-side Accept sat in `createJob` marking every family as having agreed to a
   session nobody had read.

   THE WAY OUT IS THAT THE RULES ARE ALREADY PURE. `participantsOf` reads a list of event rows and
   folds them into a roster. It touches no spreadsheet: `eventsForJob` hands it rows and everything
   after that is arithmetic on names and words. So the events can be FABRICATED — written here, in
   order, the way a booking would have written them — and the real rule run over them.

   WHAT THIS IS NOT. It is not a copy of the rules. It reads `booking.gs` off disk and runs the
   actual `participantsOf`, so a change to the fold changes what this tests. A test that
   reimplements the thing it tests passes for ever and proves nothing.

   RUN IT:  node js/check-lifecycle.js

================================================================================================== */
```

### ---------- THE REAL RULE, LIFTED OUT AND GIVEN FAKE EVENTS

top level, before `loadRules`

```
/* ---------- THE REAL RULE, LIFTED OUT AND GIVEN FAKE EVENTS --------------------------------------
   `participantsOf` and the four functions that read it are cut out of booking.gs by name and
   evaluated with stubs for the two things they touch that we are not testing: `S` (string-ify) and
   `eventsForJob` (the sheet). Everything else — the vocabulary, the fold, the withdrawal rule — is
   the deployed code.

   IF THE CUT FAILS the harness says so and stops, rather than quietly testing nothing. A checker
   that silently tests an empty string is worse than no checker. */
```

### ---------- A BOOKING, WRITTEN AS THE THINGS THAT HAPPENED

top level, before `ev`

```
/* ---------- A BOOKING, WRITTEN AS THE THINGS THAT HAPPENED --------------------------------------
   Each step is one event, in the order the app would have written it. Reading a case top to bottom
   IS reading the story, which is the property that makes this worth having: a path nobody has
   walked in the app can be walked here in four lines. */
```

### THE ONE THIS HARNESS WAS WRITTEN FOR.

in `cases`

```
/* THE ONE THIS HARNESS WAS WRITTEN FOR. Until 1 Sep the third event was
         `Daniel · client · Accept · target Sasha`, and the mutual-agreement rule marked DANIEL
         agreed as well — so the card offered a Pay button on a request nobody had read. Stated as
         an expectation, that failure can never come back unnoticed. */
```

