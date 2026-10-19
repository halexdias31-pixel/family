# js/check-settings.js

The full text of comments in `js/check-settings.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-settings.js THE NINE TABS THAT BECAME FILES, AND WHETHER THE APP IS STILL READING THE RIGHT COLUMNS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-settings.js

   THE NINE TABS THAT BECAME FILES, AND WHETHER THE APP IS STILL READING THE RIGHT COLUMNS.

   `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns` and `copy` left the
   Settings spreadsheet and became `data/settings/*.json`. `settingsInto_` maps them onto `DATA`, and
   the rule there is the one `libraryExtras_` already had: a file with rows WINS, a file with none
   leaves the payload's key alone. That makes them the source of truth for nine tabs.

   NOTHING CHECKED THEM. `check-rows.js` asks whether every `r.<name>` in the backend is a column of
   the tab that row came from, and it was written because folding two tabs together left SEVEN reads
   of `r.link` on rows that call the URL `source_url` — every checklist topic arriving with no link
   on it, and nothing throwing. `check-columns.js` could not see it either, because `link` is a
   column of some other tab.

   THE SAME FAULT IS NOW AVAILABLE ONE LAYER ALONG. These files are the tab. A column renamed in an
   export, or a read written from memory, is a value that silently arrives as `undefined` and then as
   `''` — a brand key that never resolves, a facet with no label, a campaign with no accent — and
   every one of those has a fallback, which is exactly why nobody would notice.

   IT IS A SLICE, NOT A PARSE, and that is honest here in a way it would not be in the backend.
   `settingsInto_` is nine blocks of the same shape, each opening `const x = extra['settings/x']`, so
   the block that belongs to a tab is the text between its own line and the next one's. `check-rows`
   needed acorn because `dopost.gs` binds `r` to a different tab in every handler; here one block is
   one tab by construction.

   WHAT IT REFUSES, AND WHAT IT ONLY PRINTS:

     FAILS   a column READ that the file does not have. That is a value that will always be empty.
     FAILS   a tab named in `SETTINGS_TABS` with no file beside it — a fetch that 404s for ever.
     PRINTS  a column the file HAS and nothing reads. Weight shipped to every phone for nobody,
             which is `check-payload.js`'s "sent and never read" and breaks nothing.
     PRINTS  a file in `data/settings/` that `SETTINGS_TABS` does not name. Eleven of those are
             deliberate: they moved to the Ledger because the backend computes something from them.

   AN EMPTY FILE CANNOT BE CHECKED and says so rather than passing. `kinds` and `laws` are `[]`
   because both tabs were empty — that is the escape hatch `check/fixture.json` proves, and it means
   this file cannot know what columns they have. "I did not manage to look" printed as "I looked and
   it was fine" is the failure this repository keeps finding in its own checks.

     node js/check-settings.js
================================================================================================== */
```

### ---------- PARSED, BECAUSE A SLICE MIS-ATTRIBUTED ON ITS FIRST RUN

top level, before `acorn`

```
/* ---------- PARSED, BECAUSE A SLICE MIS-ATTRIBUTED ON ITS FIRST RUN ------------------------------
   THE FIRST VERSION CUT THE FILE INTO NINE BLOCKS, one per `const x = extra['settings/x']`, and
   reported seven columns "read and not there" on `copy`. Every one of them belongs to CAMPAIGNS:
   `settingsInto_` builds the copy index INSIDE the campaigns block, because a campaign carries its
   own words, so the copy binding opens before the campaign mapping and a flat slice handed the
   campaign's reads to the wrong tab. Meanwhile `campaigns` reported reading nothing at all, which
   is the tell — a check that finds zero reads in a block full of them has lost its subject.

   THAT IS `check-rows.js`'s FAULT EXACTLY. Its first version reported 95 findings with 2 real ones
   in them because one binding map per FILE let a handler's `r` outlive the handler. The answer
   there was a scope chain, and the answer here is the same instrument: acorn, which is already a
   dependency for that check.

   THE BINDING IS THE CALL, NOT THE LINE. Every read in this file is inside `X.forEach(r => …)` or
   `X.map(r => …)`, so the tab is whatever `X` resolves to — a local `const` bound to
   `extra['settings/x']`, or the expression itself, or the head of a chain like
   `campaigns.filter(…).map(…)`. One arrow is one tab by construction, and nothing has to guess. */
```

### ---------- OR THE ROW CARRIED IN A WRAPPER

top level, before `ACCEPTED_GONE`

```
/* ---------- OR THE ROW CARRIED IN A WRAPPER ----------------------------------------------
       `facts` NEEDS ITS INDEX, so it maps to `{ r, i }` first and every read after that is
       `x.r.heading`. Reading only `r.<col>` found nothing at all in that block and reported the
       tab as mapped nowhere — which is the right complaint about the wrong thing, and the tell was
       that a block plainly full of reads came back with zero.

       ANY PARAMETER NAME, but only through `.r`, so the `.sort((a, b) => a.order - b.order)` at the
       end of that same chain contributes nothing: `order` and `row` are fields of the MAPPED object
       and are not columns of anything. */
```

### ---------- READ ON PURPOSE, AND THE COLUMN IS NOT THERE

top level, before `ACCEPTED_GONE`

```
/* ---------- READ ON PURPOSE, AND THE COLUMN IS NOT THERE -------------------------------------------
   THE `ACCEPTED` PATTERN FOR THE SIXTH TIME, after check-payload, `VOCAB`, `ACCEPTED_TAP`,
   `RETIRED_FACETS` and `HANDLE_ALLOWED`. One entry, one written reason, still printed. */
```

### AND THE OTHER WAY ROUND:

top level, before `onDisk`

```
/* AND THE OTHER WAY ROUND: a file nobody fetches. Eleven of these are deliberate — `config`,
   `pricing` and `venues` feed `quotePerHour` SERVER-SIDE, because "a total posted by a browser is a
   total the client chose", and five more are reshaped by a function on the backend before anybody
   sees them. They are listed rather than judged. */
```

### AND THE FACTS ARE CONTENT, SO THE RULES ABOUT THEM BELONG HERE AND NOT ONLY IN THE WRITER

top level, before `FACT_SUBJECTS`

```
/* ==================================================================================================
   AND THE FACTS ARE CONTENT, SO THE RULES ABOUT THEM BELONG HERE AND NOT ONLY IN THE WRITER

   `tools/add-facts.py` ASSERTS ALL OF THIS AT THE OTHER END and that is not enough, because a file
   can be hand-edited, appended to by another
   script, or written by a version of the tool that has since changed, and a rule living only in the
   thing that produced the data is a rule nothing enforces about the data.

   FOUR HUNDRED ROWS AND ONE SURFACE. `feedItem` deals them to the "One more thing" widget and the
   heading is drawn at `.feed-head`'s size over a picture — so a heading that is a paragraph is a
   card with no room left, and two rows with the same heading are the deck repeating itself, which
   is the one thing that reads as broken. Neither is visible from anywhere else: a duplicated fact
   measures perfectly, lays out perfectly and is a bug you notice on the fourth tap.

   THE SUBJECT IS A CLOSED LIST for the reason `VOCAB` in check-library.js is: `feedColours` hashes
   whatever word it is handed, so `Sport` and `Sports` would be two subjects with two colour schemes
   and nothing anywhere would say so. */
```

