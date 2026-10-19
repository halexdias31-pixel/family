# js/check-backend.js

The full text of comments in `js/check-backend.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### THE APPS SCRIPT PROJECT IS ONE SCOPE, THE SAME WAY `js/` IS.

top level, before `fs`

```
/* ==================================================================================================
   THE APPS SCRIPT PROJECT IS ONE SCOPE, THE SAME WAY `js/` IS.

   `index.html` lists the front end's files and the browser concatenates them into one global scope;
   `js/check.js` exists because of that, and reports any name used but never declared. The backend
   has exactly the same property and had no equivalent: Apps Script loads every `.gs` in the project
   into one scope, so two files declaring the same function is two files declaring one function, and
   whichever the loader reaches second is the one that exists.

   IT HAD HAPPENED, AND IT WAS KNOWN ABOUT AND LEFT. `people.gs` declared `childrenOf` twice — once
   taking a person row and returning NAMES, once taking a parent id and returning ROWS — and
   CLAUDE.md carried "the second silently wins. Not yet fixed; be careful around it" for as long as
   it took somebody to stop being careful. The two callers wanted different halves:

     doget.gs    childrenOf(S(r.person_id)).map(personDisplayName)   wanted the id version
     dopost.gs   out.kids = childrenOf(r)                            wanted the other

   so one of them was handed a row where an id was expected, matched nothing, and returned an empty
   list. For every parent, on every sign-in, silently.

   NOTHING COULD HAVE TOLD YOU. Apps Script does not warn about a redeclared `function`; it is legal
   JavaScript and the last one wins. `check.js` reads `js/` and never looks here. `check-access.js`
   reads a handful of named files rather than the directory. This reads all of them.

   WHY `const` AND `let` COUNT DOUBLE. A redeclared `function` is quietly wrong; a redeclared `const`
   at top level is a SyntaxError that takes the whole project down at load — every handler, every
   trigger, the web app itself. There is no version of that which is survivable, so it is reported
   as the harder of the two.
================================================================================================== */
```

### THE SAME SEARCH EVERY OTHER BACKEND CHECK DOES, and for the reason CLAUDE.md sets out:

top level, before `WHERE`

```
/* THE SAME SEARCH EVERY OTHER BACKEND CHECK DOES, and for the reason CLAUDE.md sets out: three
   checks hand-rolled their own path to `backend/` and all three had it wrong, one of them exiting 0
   while checking nothing. Nearest first, and a directory that cannot be found is a failure rather
   than an empty pass. */
```

### COMMENTS OUT FIRST. This file's own prose names `childrenOf` a dozen times and the house style means every backend file is mostly prose — `check-css.js`

top level, before `decomment`

```
/* COMMENTS OUT FIRST. This file's own prose names `childrenOf` a dozen times and the house style
   means every backend file is mostly prose — `check-css.js` learned the same lesson the expensive
   way, proving a deleted class alive on the strength of its own obituary. Block comments are
   replaced by their own newlines so the line numbers below still point at the code. */
```

### ---------- WHAT EACH FILE DECLARES AT THE TOP LEVEL

top level, before `fn`

```
/* ---------- WHAT EACH FILE DECLARES AT THE TOP LEVEL ----------------------------------------------
   ANCHORED TO THE START OF THE LINE, which is what "top level" means in these files and is the only
   test that does not need a parser. A `function` nested inside another is indented, and a nested one
   is scoped to its parent and cannot collide with anything. Being wrong in that direction costs a
   missed report; being wrong the other way would report every callback in the project. */
```

### ---------- AND THE THREE WAYS A SHEET CHANGES, WHICH MUST ALL BE THE THREE FUNCTIONS

top level, before `WRITERS`

```
/* ---------- AND THE THREE WAYS A SHEET CHANGES, WHICH MUST ALL BE THE THREE FUNCTIONS -------------
   `setCell`, `addRow` AND `delRow` EACH SET `POST_WROTE`, which is what `jsonOut` reads to retire
   the six-hour payload. A call that reaches the sheet without going through one of them changes the
   database and leaves every phone holding the old copy — silently, for up to six hours.

   THAT IS NOT HYPOTHETICAL: nine places called `t.sheet.deleteRow(row._row)` directly, and the note
   above `POST_WROTE` said in so many words that `setCell` and `addRow` were "the two functions that
   put anything into a spreadsheet". They are the two that ADD. Un-starring a favourite deleted the
   row and left it in the payload, so the star came back on the next load.

   A GREP, NOT A PARSE, AND THAT IS ENOUGH HERE. The question is whether the string appears outside
   the one function allowed to use it, which has exactly one right answer and no scope to get wrong
   — the `check-rows.js` lesson about a narrow question being the trustworthy one. `delRow`'s own
   body is the single exemption, named by line rather than by a pattern that could quietly widen.

   `setValue`/`appendRow` ARE NOT ASKED ABOUT, deliberately. `setCell` and `addRow` are their only
   callers today, but both names are ordinary Apps Script and a future helper may legitimately want
   one. A rule that fires on the honest case is a rule somebody switches off. */
```

### ---------- THE COMMENT DESCRIBING THE FAULT IS NOT THE FAULT

top level, before `before`

```
/* ---------- THE COMMENT DESCRIBING THE FAULT IS NOT THE FAULT -------------------------------
       THE FIRST VERSION SKIPPED A LINE STARTING `//`, `*` OR `/*` and fired on `core.gs:175` — a
       CONTINUATION line inside the block comment that explains this very rule, which begins with
       three spaces and a backtick. A check whose first finding is its own documentation is a check
       that gets switched off within a day.
       SO THE BLOCK IS TRACKED, opener to closer, rather than each line being guessed at from how it
       happens to start. Same lesson as `check-const.js` reporting ninety findings: a rule that is
       nearly right about where it is looking is a rule nobody can act on. */
```

### ---------- AND A NAME IS NOT PROOF OF WHO IS ASKING

top level, before `CLAIMS`

```
/* ---------- AND A NAME IS NOT PROOF OF WHO IS ASKING ----------------------------------------------
   `doGet` DECIDED WHO YOU WERE FROM `?name=`. `p` is the URL query string, the web app is deployed
   `ANYONE_ANONYMOUS`, and every tutor's display name is printed on the screen — so
   `?name=<an admin's display name>` was the whole of what it took to be served the admin payload:
   the films list, every unlisted tutor, `payload.students` (every child's name, handle, avatar,
   friends, xp and credits), a child's home `address`, withheld posts, refused and waiting bookings,
   and the e-mail addresses a booker typed into a split. `?person=<any id>` bought four more —
   another family's birthday diary, another person's print orders, somebody else's withheld posts.

   `doPost` HAS BEEN RIGHT SINCE SESSIONS WERE BUILT and its own note says why: "BEING SIGNED IN IS A
   TOKEN, NOT A NAME — any name, the field simply had to be non-empty". `accessDenied` resolves
   `authWhoIs_(body.token)` and overwrites `body.name` with whoever the token really is. `doGet` was
   never moved onto the same machinery, and nothing anywhere compared the two halves of one app.

   A GREP, AND THE SAME ONE EXEMPTION SHAPE AS `delRow` ABOVE. The question is whether the string
   appears outside the one block allowed to use it, which has exactly one right answer — and that
   block is `if (p.run)`, a URL an admin types by hand with no token to hand, authenticated by a PIN
   through `authCheckPin_`. Everywhere else, a name or an id in a URL is a claim.

   `p.pin`, `p.health`, `p.receipts`, `p.arg` AND THE REST ARE NOT ASKED ABOUT, deliberately. They
   are switches and secrets rather than identities: a switch anybody may flip costs nothing, and the
   PIN is the thing being checked rather than a thing being believed. A rule that fired on every
   query parameter would fire on the honest ones, which is a rule somebody switches off. */
```

### ---------- AND A NEW PIN MUST CLEAR THE GUESSES AT THE OLD ONE

top level, before `SETS_PIN`

```
/* ---------- AND A NEW PIN MUST CLEAR THE GUESSES AT THE OLD ONE ------------------------------------
   `tries` counts wrong answers since you last got in and `authWrong_` never sets it back, which is
   what makes the lockout a ladder. So the moment a PIN CHANGES, the count is about a secret that no
   longer exists — and a path that issues one without clearing it hands somebody a PIN the site then
   refuses for up to an hour. That is what `forgotPin` did: the documented way out of a lockout was
   itself locked out, which is worse than having no way out, because people stop looking for one.

   ASKED OF EVERY CALLER OF `authSetPin_`, because that function IS "a PIN changed here" — a list of
   handler names would go stale the first time a fourth one is written, which is this repository's
   own sentence about a rule repaired in the instance and not in the rule.

   ONE EXEMPTION, WITH ITS REASON. `authCheckPin_` calls it to migrate an old plaintext row to a hash
   while the RIGHT PIN is being typed — the secret has not changed, and `authNewSession_` clears the
   throttle a moment later on the successful sign-in that follows. */
```

### PER CALL, NOT PER SCOPE, and that distinction is the whole of it.

top level, before `end`

```
/* PER CALL, NOT PER SCOPE, and that distinction is the whole of it. `makeBrandAccount` sets a
       PIN in two places — a repaired row and a created one — so a rule asking whether the FUNCTION
       clears anywhere is satisfied by either branch and blind to the other. Measured: with the
       scope-wide test, deleting the clear from the repair path left the run green, which is this
       repository's own definition of a check that cannot fail. The window is short because in every
       real case the clear is the next line: adjacency is what makes it readable as a pair. */
```

### THE SUMMARY NAMES WHAT ACTUALLY FAILED.

top level

```
/* THE SUMMARY NAMES WHAT ACTUALLY FAILED. It said "one scope, two declarations" whatever fired,
   which was true while that was the only question this file asked and became a wrong sentence the
   moment it asked a second — the same fault as "all 18 checks pass" and "one of the eighteen
   names", both of which CLAUDE.md records. */
```

