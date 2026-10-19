# js/terms.js

The full text of comments in `js/terms.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — terms.js ONE FILE, SPLIT.

top level, before `termsDocs_`

```
/* ==================================================================================================
   @family. — terms.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   terms.js is listed in index.html; the list is the order. It comes AFTER find.js, because the
   `doc` kind in find.js names `docCard_` — inside an arrow, so it is not read until a card is
   drawn, by which time this file has loaded. Before find.js would also work; after is where the
   feature is, so after is where it goes.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### THE DOCUMENTS THE BUSINESS PUBLISHES — the tutor agreement, the client terms, the booking and safeguarding policies — held in the `terms` tab and drawn from it.

top level, before `termsDocs_`

```
/* ==================================================================================================
   THE DOCUMENTS THE BUSINESS PUBLISHES — the tutor agreement, the client terms, the booking and
   safeguarding policies — held in the `terms` tab and drawn from it.

   NOTHING HERE KNOWS WHAT A POLICY SAYS. It moves rows. Every word a tutor reads is typed in the
   sheet, which is the only reason changing a clause does not mean changing a file, waiting for
   GitHub Pages, and hoping the phone in their hand is not still running last week's.

   ONE ROW PER SECTION, NOT ONE PER DOCUMENT. A fifteen-clause agreement in a single cell is a cell
   nobody will edit twice — and the section is the unit that actually changes: you rewrite the rate
   clause, not the agreement. `seq` orders them, `heading` titles them, `body` is the prose.

   READING AND SIGNING ARE DIFFERENT JOBS, and this is the thing the first design got wrong by
   doing only the second. The signature prompt belongs where it cannot be missed — see
   `termsPages_`, which puts anything unsigned on the account column. The LIBRARY belongs in the
   funnel, where somebody goes when they want to check what the cancellation policy actually says
   six weeks after agreeing to it. Same rows, two doors, and neither is a substitute for the other:
   a prompt you have to go looking for is not a prompt, and a document you can only reach by not
   having signed it is not a library.
================================================================================================== */
```

### ---------- THE ROWS, GROUPED INTO DOCUMENTS

top level, before `termsDocs_`

```
/* ---------- THE ROWS, GROUPED INTO DOCUMENTS -----------------------------------------------------
   ONLY THE LIVE VERSION OF EACH. The tab holds every version ever published — that is the point of
   `version`, and the rule that a published version is never edited in place depends on the old rows
   staying there. So the newest `live` date not in the future wins, and everything behind it is
   history rather than clutter.

   DATES ARE dd/mm/yyyy, AS THE SHEET SHOWS THEM. `Date.parse` reads that as month-first or as
   nothing at all depending on the browser, which would silently promote a document that is not in
   force yet — so it is split on the slashes rather than parsed.
--------------------------------------------------------------------------------------------- */
```

### THE LIVE ONE, PER DOCUMENT.

in `termsDocs_`

```
/* THE LIVE ONE, PER DOCUMENT. Sorted by date rather than by version string, because `2026-09-b`
     sorting after `2026-09-a` is a happy accident of how they were named and not something to rely
     on the day somebody types `2026-10` or `v2`. */
```

### ---------- ONE ITEM PER DOCUMENT

top level, before `docItems_`

```
/* ---------- ONE ITEM PER DOCUMENT ----------------------------------------------------------------
   EVERY AUDIENCE TO EVERYBODY, deliberately, and it is the same decision the backend already makes
   for the payload. A tutor being able to read the client terms is a feature: the two documents
   describe two halves of the same arrangement, and somebody who can only see their own half cannot
   check that the halves agree.

   `kindLabel` CARRIES THE AUDIENCE, so the second question — What kind — splits the library into
   `For tutors` and `For families` with no new facet, no new column, and no new line in FACETS. The
   coverage rule then keeps every other question away: a policy has no exam board, no tier and no
   key stage, so none of them is ever asked once you are in Paperwork.

   NOTHING ELSE IS FILLED IN. The fields below are the shape every item in this list has, and a doc
   answers almost none of them — which is exactly what makes the funnel stop asking.
--------------------------------------------------------------------------------------------- */
```

### THE VERSION IS NOT IN THE NAME.

in `docItems_`

```
/* THE VERSION IS NOT IN THE NAME. It is on the card and in the sheet, where somebody checking
       which version they agreed to will look — putting it in the title would sort `Tutor agreement
       2026-09-b` away from `Tutor agreement` the first time one is superseded. */
```

### ---------- THE CARD

top level, before `docCard_`

```
/* ---------- THE CARD -----------------------------------------------------------------------------
   WHAT IT SAYS BEFORE YOU OPEN IT: who it is for, which version, and whether you have agreed to it.
   That last line is the reason this card exists rather than the document simply opening — "you
   agreed to version 2026-09-a on 4 September" is the question somebody has when they come looking,
   and answering it on the card saves opening the thing at all.

   A SUPERSEDED SIGNATURE IS NOT A SIGNATURE, and it says so. Agreeing to `2026-09-a` when
   `2026-09-b` is live means the terms changed after you signed, which is precisely the case the
   version column exists to catch — so it is called out rather than shown as a tick.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE WHOLE DOCUMENT, IN A SHEET

top level, before `id`

```
/* ---------- THE WHOLE DOCUMENT, IN A SHEET -------------------------------------------------------
   EVERY SECTION, IN `seq` ORDER, WITH ITS HEADING. No pagination and no accordion: a contract you
   have to expand fourteen times is a contract nobody reads to the end, and "I did not see that
   clause" is the one objection this whole feature exists to prevent.

   THE BUTTON IS AT THE BOTTOM, AFTER THE TEXT. Not because scrolling proves reading — it does not —
   but because a button above the thing it agrees to is a button somebody presses first.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE PROSE

top level, before `termsProse_`

```
/* ---------- THE PROSE ----------------------------------------------------------------------------
   ESCAPED FIRST, THEN THE THREE MARKS THAT ARE ALLOWED BACK. The body comes out of a spreadsheet
   cell somebody typed, which is not a threat but is not markup either — and a policy that renders
   an ampersand as `&amp;` is a policy that looks broken.

   BLANK LINE IS A PARAGRAPH. A LINE STARTING `- ` IS A BULLET. `**x**` IS BOLD. Nothing else, and
   deliberately: every mark added here is a mark somebody has to know about before they can edit a
   clause, and the person editing clauses is you at eleven at night.
--------------------------------------------------------------------------------------------- */
```

### THE TIMESTAMP IS THE BACKEND'S, not this one's — see terms.gs.

top level, before `docid`

```
/* THE TIMESTAMP IS THE BACKEND'S, not this one's — see terms.gs. What goes up is which document and
   which version was on screen, and the server checks that version against the sheet before writing
   anything, because a version that matches no published row records agreement to a document that
   does not exist.

   THE PAYLOAD IS REFRESHED AFTERWARDS rather than the answer being patched in locally. The card
   reads `DATA.termsAccepted`, so patching would mean two places that know what you signed and one
   of them being a guess. */
```

### ---------- WHAT YOU HAVE NOT SIGNED, WHERE YOU CANNOT MISS IT

top level, before `termsPages_`

```
/* ---------- WHAT YOU HAVE NOT SIGNED, WHERE YOU CANNOT MISS IT -----------------------------------
   ONLY THE UNSIGNED, AND ONLY THE ONES THAT NEED SIGNING. A column that shows five documents you
   have already agreed to is a column you learn to swipe past, and then the one that matters arrives
   into a habit of ignoring it.

   AUDIENCE IS FILTERED HERE AND NOWHERE ELSE. The library shows a tutor the client terms on purpose;
   a PROMPT to sign the client terms is a different thing, and asking a tutor to agree to the
   families' cancellation policy is asking them to agree to something that does not apply to them.

   `accountPages_` IN find.js APPENDS THIS. One line: `.concat(termsPages_())`.
--------------------------------------------------------------------------------------------- */
```

