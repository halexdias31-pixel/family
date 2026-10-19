# js/check-access.js

The full text of comments in `js/check-access.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### check-access.js — EVERY HANDLER MUST BE CLASSIFIED IN `ACTION_ACCESS`.

top level, before `fs`

```
/* ==================================================================================================
   check-access.js — EVERY HANDLER MUST BE CLASSIFIED IN `ACTION_ACCESS`.

   `accessDenied` REFUSES ANYTHING NOT IN THAT TABLE, before the handler runs — deliberately, so a
   new action is closed until somebody decides who it is for. The cost is that a handler can be
   written, tested, shipped and deployed, and still be unreachable because one line in a table three
   files away was never added. That is exactly what happened with `openWaitlist`, and it cost hours,
   because the error — "That action is not recognised" — is indistinguishable from no handler at all.

   `check-doors` matches buttons to handlers. NOTHING MATCHED HANDLERS TO THE GATE. Every checker
   passed on a feature that could not run.
================================================================================================== */
```

### ---------- THE BACKEND IS IN `backend/`, AND `doPost.gs` IS `dopost.gs`

top level, before `WHERE_`

```
/* ---------- THE BACKEND IS IN `backend/`, AND `doPost.gs` IS `dopost.gs` ------------------------
   THIS LOOKED FOR `../doPost.gs` AND GOT NEITHER HALF RIGHT. The .gs files moved into `backend/`,
   and the file on disk is lower-case `dopost.gs` — which is the same name to a person and a
   different one to a filesystem.

   SO IT READ NOTHING AND REPORTED THE WORST POSSIBLE ANSWER CONFIDENTLY: "0 handlers, 0 classified,
   34 asked for by the site", followed by all 34 actions listed under "THE SITE CALLS AN ACTION THAT
   DOES NOT EXIST". Every action the app performs — signing in, paying, posting, booking — named as
   missing. A report that alarming is a report nobody can act on, so it gets read once and skipped
   from then on, which is a worse outcome than the check not existing.

   Directories and spellings both tried, nearest-first. `dirOf_` below is shared by every read so a
   file that moves again moves for all of them at once. */
```

### ---------- ACTIONS WITH NO HANDLER, KNOWN ABOUT, WITH A REASON EACH

top level, before `ACCEPTED_MISSING`

```
/* ---------- ACTIONS WITH NO HANDLER, KNOWN ABOUT, WITH A REASON EACH ------------------------------
   THIS CHECK WAS PERMANENTLY RED AND THE TWO NAMES IN IT WERE NEVER GOING TO BE FIXED BY A FIX.
   `spotlight` and `acceptTerms` are not breaks — they are features whose front end was built and
   whose back end never was. Each needs a handler, a tab in SCHEMA and a payload key, which is a
   decision to build something rather than a repair.

   Left failing, they made this check red for ever, and a red that is always red is one people skim
   past on the day a THIRD name joins it — which is precisely the fault this file exists to catch,
   since an action with no handler is refused silently and looks to the user like a button that did
   nothing. Same shape as ACCEPTED in check-payload.js, same rule: one written sentence each, still
   printed every run, and anything NEW fails loudly.

   An empty list is the goal. Adding to it should feel like a decision, because it is one. */
```

### AN UNCLASSIFIED HANDLER IS A FAILURE WHETHER OR NOT THE SITE CALLS IT TODAY.

top level, before `bad`

```
/* AN UNCLASSIFIED HANDLER IS A FAILURE WHETHER OR NOT THE SITE CALLS IT TODAY. My first version
   only failed when it could SEE the call — and `openWaitlist` is sent through a ternary
   (`forNobody ? 'openWaitlist' : 'joinWaitlist'`), which no regex over the source will find. So it
   printed the fault and passed anyway, which is the checker making the same mistake as the code it
   was written to catch. Anything unclassified fails, called or not: it can only ever be refused. */
```

### THE VERDICT MUST NOT OVERSTATE ITSELF.

top level

```
/* THE VERDICT MUST NOT OVERSTATE ITSELF. "every action the site calls has a handler" would be
   printed with two accepted names sitting three lines above saying otherwise, and the verdict is
   the line that gets read when the report gets skimmed. */
```

