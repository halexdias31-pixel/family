# js/check-payload.js

The full text of comments in `js/check-payload.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-payload.js THE SITE ASKS `DATA` FOR THINGS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-payload.js

   THE SITE ASKS `DATA` FOR THINGS. THE BACKEND DECIDES WHAT IS IN IT. NOTHING MADE THEM AGREE.

   CLAUDE.md ALREADY NAMES THIS AS THE WORST FAILURE THIS APP HAS: "A key the site asks for and the
   backend does not send fails silently. `|| []` turns it into an empty list, which looks exactly
   like an empty database." It has happened at least four times that left a trace in the comments —
   `liveJobs`, `messages`, `resources`, `people` — and each was found by somebody noticing a feature
   had quietly stopped, not by anything reporting it.

   `missingKeys()` EXISTS AND IS THE WRONG INSTRUMENT. It records a key the moment something reaches
   for one that is not there, so it only knows about the screens you happened to open, in the state
   you happened to be in, as the person you happened to be signed in as. A key read only by an admin
   on the print queue is invisible to it until an admin opens the print queue. This reads the files,
   so it sees every read whether or not anybody performed it.

   --------------------------------------------------------------------------------------------------
   TWO DIRECTIONS, AND THEY ARE NOT THE SAME SEVERITY.

   READ AND NEVER SENT is a feature that silently does nothing. The guard beside it — `|| []`,
   `|| {}` — was written to survive a key being absent and does its job perfectly, which is exactly
   why nobody finds out. This is the one that fails the build.

   SENT AND NEVER READ is weight: a tab walked, rows mapped, JSON serialised and shipped to a phone
   on every single load for nobody. Worth knowing and worth deleting, but it breaks nothing — so it
   is reported and does not fail.

   --------------------------------------------------------------------------------------------------
   COMMENTS ARE STRIPPED FIRST, AND THAT IS NOT A DETAIL.

   This codebase is 64% prose, and a great deal of that prose is about keys that USED to exist:

       `DATA.people` AND `hasRole_` BOTH NEVER EXISTED — I wrote them from memory…
       `DATA.config` is not a thing the payload sends…
       `|| DATA.avatarItems` was here, and the payload has never had that key…

   A scan that counts those finds ten missing keys where there are seven, and three of its findings
   are sentences explaining that the problem was already fixed. A checker that reports the fix as
   the fault is a checker nobody finishes reading.

     node js/check-payload.js
================================================================================================== */
```

### ---------- ACCEPTED, WITH A REASON EACH

top level, before `ACCEPTED`

```
/* ---------- ACCEPTED, WITH A REASON EACH -----------------------------------------------------------
   A key here is one the site reads and the backend deliberately does not send. Every entry needs a
   sentence, because "we know about that one" is how a real fault gets added to a list of excuses and
   never looked at again. An empty list is the goal. */
```

### ---------- THE LEGAL DOCUMENTS, AND A NAME COLLISION THAT WOULD SURVIVE THE OBVIOUS FIX

in `ACCEPTED`

```
/* ---------- THE LEGAL DOCUMENTS, AND A NAME COLLISION THAT WOULD SURVIVE THE OBVIOUS FIX --------
     This one needs reading before anybody "fixes" it. terms.js wants LEGAL DOCUMENTS: it filters for
     `r.docid && r.version` and goes on to use `live`, `audience`, `title` and `mustsign`. The tab
     called `terms` in SCHEMA is SCHOOL TERMS — term_id, term_name, kind, start_date, end_date — and
     doGet already sends those, computed into `intervals`.

     So adding `terms` to the payload from TAB.terms would make this line stop being reported while
     leaving the feature exactly as dead: every row would fail the `docid` filter and termsDocs_
     would return [] for ever, now with a checker saying it was fine. The legal documents need their
     own tab under their own name. */
```

### The other half of the same unbuilt feature, and both are already named in CLAUDE.md.

in `ACCEPTED`

```
/* The other half of the same unbuilt feature, and both are already named in CLAUDE.md. terms.js
     posts `acceptTerms`, for which there is no handler anywhere in backend/, and reads these two
     back, for which there is no tab and no payload key. A handler, a tab and two keys — a decision
     to build something, not a repair. */
```

### ---------- THE ONE WORTH BUILDING

in `ACCEPTED`

```
/* ---------- THE ONE WORTH BUILDING ------------------------------------------------------------
     `applyColumns_` in shell.js lets the SHEET decide which screens exist, in what order, with what
     label and icon — it mutates TABS rather than replacing it, guards against a sheet naming nothing
     this build has, and treats a blank cell as "keep what the code says". It is careful, complete,
     and reads a key nothing sends, so it has never once run.

     IT HAS A SOURCE NOW AND IT IS NOT THE PAYLOAD. `data/settings/columns.json` is fetched with the
     other settings files and `settingsInto_` writes `d.columns` from it — which is why this entry
     stays: `doGet` still does not send the key and never will, and the read is answered a layer
     later. The spreadsheet that tab would have lived in is being deleted, so a file is the source
     the backend was never going to be. */
```

### ---------- THE FLOOR UNDER A TAB THE BACKEND DOES SEND, WHICH IS WHY IT IS A SECOND KEY

in `ACCEPTED`

```
/* ---------- THE FLOOR UNDER A TAB THE BACKEND DOES SEND, WHICH IS WHY IT IS A SECOND KEY -------
     `doGet` SENDS `spotlight` AND MUST NOT SEND THIS. They are two sources for one list and the
     whole point of the arrangement is which wins: `spotNow_` takes the sheet when it has rows and
     falls through to `data/settings/spotlight.json` when it has none, so that an admin can dress
     the shop window from the phone the day the backend syncs and the owner can fill it from a file
     today, with the deploy blocked. Written into one key, either source would silently overwrite
     the other — which is exactly the fault `settingsInto_`'s rule would cause here, because it is
     pointed the wrong way round for a tab the app WRITES to. */
```

### ---------- A KEY ONLY AN OLDER BACKEND SENDS, READ ONCE TO CARRY WHAT IT KNEW ACROSS

in `ACCEPTED`

```
/* ---------- A KEY ONLY AN OLDER BACKEND SENDS, READ ONCE TO CARRY WHAT IT KNEW ACROSS ----------
     `attempts` went with the tab on 9 Oct (note 308) and `doGet` never sends it again. But the live
     backend is a week old and does, and on the day the phones take the new code a child's record of
     what they did is that key and the `done:` dates on their device. `subMigrate_` (js/submit.js)
     reads it, once per person per device, to turn each question done before the switch into one
     submission — and finds nothing once the new backend is live, which is the end of it. */
```

### Block and line comments out.

top level, before `decomment`

```
/* Block and line comments out. Crude on purpose: a `//` inside a string would be cut too, and the
   only thing that costs is a missed READ, which the other direction of this check would then report
   as "sent and never read" — visible either way.

   A BLOCK COMMENT IS REPLACED BY ITS OWN NEWLINES, NOT BY A SPACE. The first version collapsed each
   one to ' ', which is correct for finding reads and wrong for reporting them: this codebase is 64%
   prose, so a file's comments are most of its lines, and every line number after the first block
   comment came out short by however many lines that comment ran. The first run of this check pointed
   at `me:601`, which is the middle of a paragraph about double-tapping Sign in. A checker that names
   the wrong line is one you stop believing before you stop running it. */
```

### ---------- WHAT THE BACKEND SENDS

top level, before `gsPath`

```
/* ---------- WHAT THE BACKEND SENDS ----------------------------------------------------------------
   Three shapes, because doGet uses all three: a key in the `const payload = { … }` literal, a later
   `payload.x = …`, and `payload.x.push(…)` filling one declared empty up top. */
```

### THE LITERAL IS WALKED, NOT PATTERN-MATCHED, AND THE FIRST VERSION SHOWS WHY.

top level, before `scanLiteral`

```
/* THE LITERAL IS WALKED, NOT PATTERN-MATCHED, AND THE FIRST VERSION SHOWS WHY.
   It took keys with `/^ {6}(\w+)\s*:/gm` — the literal's own indent, anchored to the line. That
   reads every key that STARTS a line and none of the ones after it, and this literal packs related
   keys together:

       links: [], shop: [], promotions: [], intervals: [], landmarks: [],
       profileFields: PROFILE_GROUPS, clientFields: CLIENT_GROUPS,

   so `links` and `profileFields` counted as sent and `promotions` and `clientFields` did not. Both
   were then reported as features the backend never sends, which is the worst thing this check can
   do: it is here to be believed about exactly that, and two of its nine findings were its own regex.
   Walking depth costs twenty lines and cannot be wrong about where a key sits. */
```

### Strings are skipped whole.

in `scanLiteral`

```
/* Strings are skipped whole. A `:` inside one is prose, and `'a: b'` at depth 1 would otherwise
       read as a key. Template literals nest `${}` and are skipped the same crude way — anything
       they contain is a value, never a key of this object. */
```

### THE FIRST CHARACTER OF THE VALUE IS TAKEN TOO, because a key being sent and a key being sent as the right SHAPE are different claims, and the fixture can fail

in `scanLiteral`

```
/* THE FIRST CHARACTER OF THE VALUE IS TAKEN TOO, because a key being sent and a key being
         sent as the right SHAPE are different claims, and the fixture can fail the second while
         passing the first — see the fixture block below. `[` and `{` are the only two this can
         be sure of; a constant or a call says nothing here and is recorded as unknown. */
```

### ---------- AND WHAT THE CHECKS PRETEND IT SENDS

top level, before `rowKeys`

```
/* ---------- AND WHAT THE CHECKS PRETEND IT SENDS ---------------------------------------------------
   `check/fixture.json` IS THE BACKEND, for every check that stands one up — `check/ui.js` serves it
   in place of the real `doGet`, so nine screens at four widths are measured against whatever is in
   that file rather than against whatever doGet returns.

   SO A KEY IT TYPES DIFFERENTLY IS A PAYLOAD THE APP WILL NEVER RECEIVE, and every green tick taken
   against it is green about fiction. `intervals` was `{}` in the fixture and `[]` from doGet, and
   `(DATA.intervals || []).map` throws on an object — `{}` is truthy, so the fallback that exists for
   exactly this never fires. The booking breakdown could not be drawn at all under the harness.

   NOTHING CAUGHT IT for as long as it was there. `check/ui.js` draws nine screens and none of them
   builds a breakdown; `check-flow.js` has its own payload written inline, where `intervals` is a
   proper list — so the one harness that would have thrown was reading a different fixture from the
   one that was wrong.

   ONLY THE TWO SHAPES doGet STATES OUTRIGHT ARE CHECKED. `landmarks: []` and `gallery: { … }` are
   claims; `brand: BRAND` is a name and says nothing here, and guessing at it would put this check
   in the business of being wrong about things it cannot see. A key the fixture simply lacks is not
   a mismatch either: absent reaches the site as `undefined`, which is what `|| []` is for. */
```

### ---------- AND THE SHAPE OF A ROW, WHICH IS WHERE IT WAS REALLY WRONG

top level, before `rowKeys`

```
/* ---------- AND THE SHAPE OF A ROW, WHICH IS WHERE IT WAS REALLY WRONG ---------------------------
   THE CHECK ABOVE COMPARES CONTAINERS — is `posts` a list or an object. That caught `intervals` and
   it is not where the damage was. `check/fixture.json` held SHEET ROWS for posts, tutors and venues:

       fixture   { post_id: 'PO1', date: '01/09/2026', active: 'yes', likes: '3' }
       doGet     { id, author, handle, avatar, image, caption, body, location, when, at,
                   pinned, active, waiting, refused, approvedBy, poll, reactions, rowIndex }

   Nine of eighteen keys absent, `id` among them. So every post the harness ever drew had no id, no
   picture, no timestamp and no handle — `p.id` was `undefined`, which made the share control's
   `data-id` empty and, once the actions became tiles, made `postTiles_` correctly draw nothing at
   all. Tutors were missing `id`, `image`, `subtitle` and `tags`; venues the same. Three of the most
   drawn things in the app, measured as cards that could not have been built from real data.

   A FIXTURE IN SHEET SPELLING IS AN EASY MISTAKE because both are plausible JSON off the same tab,
   and nothing anywhere said which side of `doGet` this file sits on. It sits AFTER: it stands in
   for the response, not for the spreadsheet.

   EVERY TAB IS PUSHED FROM EXACTLY ONE PLACE in `doget.gs`, checked rather than assumed, so the key
   list for a tab is unambiguous and this can be strict about it.

   TWO SEVERITIES, AS ELSEWHERE IN THIS FILE. A row that exists in the wrong shape is a lie and
   fails; a tab with no rows at all is thin coverage — real, worth knowing, and not a false claim —
   so it is printed and does not fail. Fourteen tabs are in that state today. */
```

### A COMMENT AT THE END OF A LINE IS PROSE, and `decomment` only takes whole-line ones.

top level, before `rs`

```
/* A COMMENT AT THE END OF A LINE IS PROSE, and `decomment` only takes whole-line ones. Left in,
     `image: S(r.image),   // converted on the phone, the way …` made `it` the last word before
     `media:`, so `media` was not a key — invisible while this only asked whether the fixture HAS
     every key, and a false "never built" the moment it also asked the reverse (below). Blanked
     rather than cut, so every position is where it was; a quote opens a string to its own close or
     to the end of its line, so a `//` inside `'https://…'` is never taken for a comment. */
```

### ---------- A SHORTHAND PROPERTY IS STILL A KEY

top level, before `j`

```
/* ---------- A SHORTHAND PROPERTY IS STILL A KEY ---------------------------------------------
         `payload.venues.push({ id: i, type: 'venue', title, borough: … })` — `title` has no colon
         after it, so a scanner looking for `name:` does not see it, and this reported `title` as a
         key doGet never sends. I then wrote a fixture venue without one, and every venue in the
         booking dropdown came out as `undefined`. The check was wrong and the app was fine, which
         is the most expensive way round.

         A KEY IS AN IDENTIFIER IN KEY POSITION, which is directly after the opening `{` or after a
         comma at this depth. Testing for `[:,}]` after the name instead would have read `rate` in
         `bestRate: rate,` as a key of its own — the value, counted as a field. What comes BEFORE is
         what settles it. */
```

### MISSING FROM EVERY ROW, not from the first.

top level, before `have`

```
/* MISSING FROM EVERY ROW, not from the first. A tab may have one row exercising a key another
       does not — `poll` on a post, `refused` on one waiting — and demanding every key on every row
       would report a good fixture as a bad one. */
```

### ---------- AND THE REVERSE: A KEY THE FIXTURE HAS AND doGet NEVER BUILDS

top level, before `fiction`

```
/* ---------- AND THE REVERSE: A KEY THE FIXTURE HAS AND doGet NEVER BUILDS ----------------------
       THE SAME LIE FROM THE OTHER SIDE, and the one a NEW key makes. `qualsParts` is read by the
       card and carried by the fixture, so every browser check draws a tutor's qualifications as
       notation — and if doGet ever stopped building it, every one of those checks would go on
       drawing notation off the fixture while the live site drew sentences. The forward question
       ("does the fixture have every key?") is satisfied by a fixture that has MORE, so it could not
       see that. This can. It found two on its first run: `studying` and `studyingAt`, from the card's
       old studying row, which doGet stopped sending when that row became a qualification. */
```

### THE VERDICT MUST NOT OVERSTATE ITSELF.

top level

```
/* THE VERDICT MUST NOT OVERSTATE ITSELF. "everything the site reads, the backend sends" was printed
   here whenever the failing list was empty — including with five entries sitting in ACCEPTED saying
   the opposite three lines above. A summary that contradicts its own report is worse than no
   summary: the report is what gets skimmed, and this is the line that gets read. */
```

