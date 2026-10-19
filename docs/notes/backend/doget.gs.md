# backend/doget.gs

The full text of comments in `backend/doget.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 60_doGet.gs (7 of 8) THE PAYLOAD.

top level, before `DOGET_VERSION`

```
/* ==================================================================================================
   @family. — 60_doGet.gs   (7 of 8)

   THE PAYLOAD. One function, because it is one answer — everything the app needs to draw
   itself, in one request.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */
```

### ---------- THIS FILE'S OWN STAMP

top level, before `DOGET_VERSION`

```
/* ---------- THIS FILE'S OWN STAMP ---------------------------------------------------------------
   ONE VERSION STRING IN `constants.gs` DESCRIBED SIX FILES, and Apps Script is pasted a file at
   a time — so pasting constants.gs alone moved the number the You screen shows while every
   handler stayed where it was. The screen said `2026-08-14-features` and the backend did not
   have `openWaitlist`, which is the version indicator actively lying: worse than none, because
   it is the thing you check to rule the deploy out.
   Each file that can go stale on its own now says so on its own. */
```

### Read once, at the top, so every exit from this function is wrapped the same way — including the early returns and the error at the bottom.

in `doGet`

```
/* Read once, at the top, so every exit from this function is wrapped the same way — including
       the early returns and the error at the bottom. A reply that comes back as bare JSON when the
       page asked for a script is a reply the page cannot see at all. */
```

### WHO IS LOOKING, AND IT IS THE SESSION TOKEN THAT SAYS SO THIS FUNCTION DECIDED WHO YOU ARE FROM `?name=`.

in `doGet`

```
/* ==============================================================================================
       WHO IS LOOKING, AND IT IS THE SESSION TOKEN THAT SAYS SO
       ----------------------------------------------------------------------------------------------
       THIS FUNCTION DECIDED WHO YOU ARE FROM `?name=`. `p` IS THE URL QUERY STRING, the web app is
       deployed `ANYONE_ANONYMOUS`, and the name of every tutor is printed on the screen — so
       `?name=<an admin's display name>` was the whole of what it took to be served the admin
       payload. Measured, that is: the films list, every unlisted tutor, `payload.students` (every
       child's name, handle, avatar, friends, xp and credits), a child's home `address`, withheld
       posts, refused and waiting bookings, and the e-mail addresses a booker typed into a split.

       `doPost` HAS BEEN RIGHT ABOUT THIS SINCE SESSIONS WERE BUILT and its own note says why:
       "BEING SIGNED IN IS A TOKEN, NOT A NAME — any name, the field simply had to be non-empty".
       `accessDenied` resolves `authWhoIs_(body.token)` and overwrites `body.name` with whoever the
       token really is. The same machinery, the same function; `doGet` was simply never moved onto it.

       MEMOISED, because `authWhoIs_` reads Script Properties and the people tab. Seven places here ask
       who is looking; one answer.

       THE TOKEN TRAVELS IN THE QUERY STRING AND THAT COSTS SOMETHING, said plainly rather than
       waved past: a GET URL is written to Apps Script's own execution log, where a POST body is not.
       What reads that log is the script's owner, who can already read the whole spreadsheet — so the
       exposure is a surface the owner already has, against a hole any visitor had. The alternative is
       to make the payload a POST, which takes the boot fetch out of `index.html`'s head and gives up
       the head start the whole of that block exists for. Written down so it is a trade rather than an
       oversight.

       ONE NAME IS STILL READ AND IT IS THE ONE THAT PROVES SOMETHING ALONGSIDE IT: `?run=` is a URL
       an admin types by hand, so there is no token to hand, and it authenticates with a PIN checked
       through `authCheckPin_` — see the block there. `?person=` is read for identity nowhere in this
       function any more. What is gone everywhere else is a name, or an id, taken as PROOF.
    ============================================================================================== */
```

### ---------- THE SHEET CATCHES UP, BUT NEVER WHILE SOMEBODY IS WAITING

in `doGet`

```
/* ---------- THE SHEET CATCHES UP, BUT NEVER WHILE SOMEBODY IS WAITING -------------------------
       THIS RAN ON EVERY PAGE LOAD, and the note it carried said the quiet part out loud: "it must
       be fast, this runs inside somebody's page load". It is fast when there is nothing to do — one
       property read — and that is true on every request except the ones where it matters.

       ON THE FIRST REQUEST AFTER A VERSION CHANGE it walks thirty tabs, appends columns, re-reads
       every header row to check its own work, gives four hundred resources an id, rewrites the
       options tab and attempts every migration not yet recorded. That is seconds at best, and it
       lands on whoever opens the app next — who sees a loading animation and no reason for it.
       Change the version a few times in an afternoon and it lands on them again each time.

       AND IF ANYTHING IS STILL MISSING AFTERWARDS the version is not recorded, so it tries again.
       That is right — a schema that did not land must not be remembered as landed — and it means a
       fault nobody has noticed makes every load slow for as long as it goes unnoticed.

       SO IT DOES NOT RUN HERE. `?setup=1` does it and `?run=ensureSchema` does it, both of which
       are somebody asking on purpose and willing to wait. The payload SAYS when the sheet is
       behind, so it is visible rather than silently stale. */
```

### ---------- AND THE SHEET SAYS SO ITSELF, ONCE

in `doGet`

```
/* ---------- AND THE SHEET SAYS SO ITSELF, ONCE ------------------------------------------------
       TAKING THE SCHEMA WORK OFF THE PAGE LOAD LEFT A LOOP. Nothing on an ordinary request records
       the version any more, so `SCHEMA_VERSION` stays behind for ever — and everything that asks
       "is the sheet behind?" answers yes for ever, on every request, including the check that reads
       thirty tab headers to find out how.

       So it is asked ONCE, cheaply, and the answer is remembered: if there are no gaps, the version
       is recorded and nothing asks again. Thirty header reads on one request after a deploy is a
       fair price; thirty on every request for ever is not.

       ONLY WHEN IT IS ALREADY BEHIND, and only when the columns are genuinely all there — a sheet
       that really is missing something must go on saying so. */
```

### ---------- IT COMPARED THE PIN AGAINST A CELL THAT IS EMPTY ON EVERY HASHED ROW

in `doGet`

```
/* ---------- IT COMPARED THE PIN AGAINST A CELL THAT IS EMPTY ON EVERY HASHED ROW -----------
         `S(who.pin) !== S(p.pin)` read the PLAINTEXT `pin` cell, and `authSetPin_` CLEARS that cell
         the moment a PIN is hashed — which is every row that has ever changed its PIN through the
         app, and every row a reset has touched. So `S(who.pin)` is `''`; a URL carrying no `pin`
         parameter at all makes `S(p.pin)` `''` too; the comparison passes.

         SO `?run=<job>&name=<an admin's display name>` RAN THAT JOB FOR ANYBODY, with no PIN, and a
         display name is on the screen. Every job in `RUNNABLE` was reachable that way —
         `ensureSchema`, `rename`, `seedOptions`, `seedFamilies`, `installTriggers`,
         `clearPayloadCache`. Not a disclosure: remote invocation of the maintenance surface.

         `authCheckPin_` IS THE ONE FUNCTION THAT KNOWS THE ANSWER. It refuses an empty PIN on its
         first line and compares the `pin` cell. Exactly what `verifyLogin` asks, which is the point: one test, one place.

         ---------- AND THE SAME LADDER AS THE SIGN-IN DOOR ---------------------------------------------
         THERE WAS NO THROTTLE HERE, "DELIBERATELY": this is a URL typed by somebody who already holds
         the spreadsheet, and a lock-out from a mistyped `?run=` would shut the owner out of the app.
         But anybody can type a URL. `name=` goes through `findPerson`, so an admin's display name or
         handle does — and the tutors list publishes both — which made this an unlimited, unlogged
         guess at an admin's PIN, and an admin's PIN opens every child's details. The ladder is ten
         free wrong answers, so a mistyped `?run=` costs the owner nothing; the eleventh is the same
         minute it would be at the sign-in box, because it is the same person's PIN. Locked is
         answered before the PIN is compared, as there. */
```

### ?setup=1 brings the sheets' tabs and columns up to date in place, so a schema change never means re-uploading a file and repointing the ids in FILES.

in `doGet`

```
/* ?setup=1 brings the sheets' tabs and columns up to date in place, so a schema change never
       means re-uploading a file and repointing the ids in FILES.
       Left open, unlike `?run=`: it can only ADD tabs, columns and missing config rows, and it
       never touches a value anybody has set. The worst somebody can do with it is run it. */
```

### `?pages=1` AND `?pages=all` WERE HERE.

in `doGet`

```
/* `?pages=1` AND `?pages=all` WERE HERE. They filled blank page counts by reading PDFs out of
       Drive and writing the number into the document row. See content.gs: there is no document row,
       and the counts the library already has came across in `data/questions.json`. */
```

### ONE WORLD'S GROUND, on its own.

in `doGet`

```
/* ONE WORLD'S GROUND, on its own. Not in the main payload: four boroughs of geometry is
       hundreds of kilobytes and almost nobody opens the map, so putting it in every page load
       would make the whole app slower for a screen most people never see.
       Asked for when the map is opened, and once per world. */
```

### BY ID WHERE THE SITE KNOWS IT.

in `doGet`

```
/* BY ID WHERE THE SITE KNOWS IT. This asked for the name alone, which is the same weakness the
         receipts themselves had: two people who answer to one name get one another's documents, and
         a renamed person gets nobody's. The site has held a `personId` since sign-in. */
```

### AND THE TOKEN DECIDES WHOSE.

in `doGet`

```
/* AND THE TOKEN DECIDES WHOSE. The id was an improvement on the name and both are claims: a
         `person_id` is printed on nothing, but it is a string in a URL and the route handed over a
         household's whole year to anybody holding one. Nothing in `js/` calls this route — measured,
         `receipts=` occurs nowhere in the front end — so it is a door with no handle that was open. */
```

### Only the tabs the site genuinely can't run without.

in `doGet`

```
/* Only the tabs the site genuinely can't run without. Anything seeded by ensureSchema stays
       off this list: a new tab must never take the whole site down in the gap between deploying
       and seeding. Add to it only if nothing at all can be shown without that tab. */
```

### `resources` IS NO LONGER ON THIS LIST, because the tab is no longer in the spreadsheet.

in `doGet`

```
/* `resources` IS NO LONGER ON THIS LIST, because the tab is no longer in the spreadsheet.
       A name here is a promise that the site cannot start without it, and the site starting is
       exactly what this was preventing: `read()` answers `{sheet: null}` for a tab that does not
       exist, so every single request was returning "This spreadsheet has no resources tab" — not
       a degraded resources section, the whole API refusing to answer.

       IT IS STILL READ IN A DOZEN PLACES and those all now return zero rows, which is safe but is
       NOT the same as removed — see the checklist builder further down. */
```

### ---------- THE ANSWER FROM LAST TIME, IF THERE IS ONE

in `doGet`

```
/* ---------- THE ANSWER FROM LAST TIME, IF THERE IS ONE ---------------------------------------
       HERE, AND NOT HIGHER UP. Everything above this line is a different endpoint — setup, run,
       map, receipts — and every one of them returns before reaching this point, so nothing that is
       cached has passed through them.

       AND NOT LOWER DOWN EITHER. It goes before the required-tabs check, which opens the
       spreadsheet, and before `config()`, which is the first of about thirty tab reads. A cache
       checked after the reads it exists to skip is a cache that saves nothing. See `cacheGet_` in
       core.gs for what is kept and why it is the finished body rather than the rows. */
```

### ---------- `?warm=1` BUILDS AND STORES WITHOUT READING

in `doGet`

```
/* ---------- `?warm=1` BUILDS AND STORES WITHOUT READING ---------------------------------------
       THE SCHEDULED REFRESH ASKS FOR THIS. A warmer that made an ordinary request would be handed
       the copy already in the cache and would refresh nothing; one that cleared the cache first
       would leave a hole for whoever arrived during the rebuild — which is the thirty-five seconds
       this exists to stop anybody ever paying. Skipping only the READ does both jobs: the entry is
       rebuilt from the sheet and written over the old one, which stays readable the whole time.

       `warm` IS DELIBERATELY NOT IN `payloadKey_`'s SPECIAL LIST. It must produce the SAME key an
       ordinary visitor produces, or it would be filling an entry nobody ever asks for. */
```

### ---------- A HIT SAYS SO

in `doGet`

```
/* ---------- A HIT SAYS SO -------------------------------------------------------------------
         WITHOUT THIS THERE IS NO WAY TO TELL. A hit returns the body the miss stored, `timings` and
         all, so a cached reply and a freshly built one are byte-for-byte identical and the only
         evidence of which you got is how long you waited — which is the one thing you are trying to
         find out. One key, appended to the stored JSON rather than parsed and re-serialised, so a
         hit stays the cheap path it exists to be. Open the API address in a tab: `"cached":true` is
         there or it is not. */
```

### ---------- THE TABS WHOSE ABSENCE MEANS THE DATABASE IS NOT CONNECTED

in `doGet`

```
/* ---------- THE TABS WHOSE ABSENCE MEANS THE DATABASE IS NOT CONNECTED ----------------------
       ONE WRITTEN REASON EACH, and it is an object rather than a list of names so there is nowhere
       to put a tab without saying what breaks without it.

       THIS LIST TOOK THE LIVE SITE DOWN. It was ten names typed out once, and it went stale in a
       commit that was about something else: `links` left `WHERE` when the links moved into the
       repository, so `read('links')` can never find a sheet again — and this guard returns its
       error INSTEAD OF A PAYLOAD, so every screen went dark over a tab the app deliberately no
       longer has. A FOURTH PLACE THAT NAMES TABS, beside `TAB`, `WHERE` and `SCHEMA`, and the only
       one nothing was checking.

       `terms` was the same fault a step further back: it had never been required. `termsFor()`
       COMPUTES the year's terms and reads the tab only to OVERRIDE them, so the app has run
       without that tab for its whole life — which is why nobody noticed it was in here.

       SO THE BAR IS NOT "the app uses this". It is: with this tab missing the payload is WRONG
       rather than merely thin — a price of nought, a sign-in that finds nobody, a family's
       sessions reported as none. Anything softer than that ships as an empty list, which is what
       every other tab in the payload already does, and is the difference between a thin answer and
       no answer at all.

       `check-tabs.js` rule 6 is the half a checker can see: a name in here that `WHERE` does not
       route, or that `SCHEMA` does not describe, can never be found or never be created — either
       way it is a permanent outage waiting for the next deploy. What it CANNOT see is a routed tab
       that nobody has run `?setup=1` to create yet, so a name added here still takes the site down
       until somebody does. */
```

### ---------- WHICH FILE THE TAB SHOULD HAVE BEEN IN

in `doGet`

```
/* ---------- WHICH FILE THE TAB SHOULD HAVE BEEN IN ----------------------------------------
         THIS USED TO NAME ONE ID and list one file's tabs, because there was one database. With
         three, "no shop tab" is useless on its own: the question is which of the three was looked
         in, and whether that file opened at all. So each missing tab is reported with the file
         `WHERE` routes it to, and the tab listing is per file — an id pointing at an .xlsx upload
         shows up here as a file that opened with no tabs, which is the fault this exact message
         failed to catch the first time. */
```

### WHO IS LOOKING, asked ONCE.

in `doGet`

```
/* WHO IS LOOKING, asked ONCE. It was asked inside the people loop, which is a full scan of the
       people tab per person — fifteen scans to answer one question — and it was not asked at all
       where posts and resources are filtered, so a switched-off post vanished from the admin who
       switched it off and could never be brought back from the phone. */
```

### AND ASKED OF THE TOKEN rather than of `?name=`.

in `doGet`

```
/* AND ASKED OF THE TOKEN rather than of `?name=`. `isAdminPerson` takes a name and a name was a
       claim — see the block at the top of this function. `hasRole` on the row the token resolved to
       is the same question asked of something the visitor had to prove. */
```

### `?person=` IS NO LONGER READ FOR IDENTITY ANYWHERE IN THIS FUNCTION.

in `doGet`

```
/* `?person=` IS NO LONGER READ FOR IDENTITY ANYWHERE IN THIS FUNCTION. It was four more claims:
       another family's birthday diary, another person's print orders, somebody else's withheld posts
       and somebody else's comment controls, each for the cost of a `person_id` in a URL. */
```

### AND THE NET IS TOLD (342):

in `doGet`

```
/* AND THE NET IS TOLD (342): a grown-up's whole name in this payload only if it is theirs, or the
       viewer is an admin. The stored copy is keyed on this same person (`payloadKey_`), so a body built
       for one viewer is never handed to another. */
```

### ---------- THE FILMS, READ ONLY IF THE PERSON LOOKING MAY SEE THEM

in `doGet`

```
/* ---------- THE FILMS, READ ONLY IF THE PERSON LOOKING MAY SEE THEM ------------------------
       NOT EVEN READ OTHERWISE. A read inside the guard rather than a filter after one: a tab that
       is never opened cannot be forwarded by a later line that forgets to check, and it saves the
       scan on every visit by everybody who is not an admin. `viewerIsAdmin` is settled a few lines
       above — asked once, which is the note there.
       IN A FUNCTION NOW, `filmsFor_`, because a cache HIT lays the films on fresh too (see
       `payloadWithFresh_`) and two copies of who-may-see-a-film would be two rules. The guard is
       still the first line of it: a non-admin returns before the tab is opened. */
```

### `drive_id` IS DELIBERATELY NOT SENT.

in `doGet`

```
/* `drive_id` IS DELIBERATELY NOT SENT. `drive_url` is built from it in the sheet and is the
       only form anything opens, so shipping both would be one fact twice — the `handle`/`username`
       shape this project has already paid for three times. */
```

### ---------- GOOGLE SIGN-IN WAS BUILT AT BOTH ENDS AND HAD NO MIDDLE

in `payload`

```
/* ---------- GOOGLE SIGN-IN WAS BUILT AT BOTH ENDS AND HAD NO MIDDLE --------------------------
         EVERY PART OF THIS FEATURE WORKS EXCEPT THIS LINE. me.js loads Google's script on demand,
         renders the button idempotently, and passes the token straight through without inspecting
         it; `googleLogin` in dopost.gs reads this same config cell, asks Google's tokeninfo whether
         it signed the token, checks `aud` against the id, and refuses outright when the cell is
         blank. Two careful halves, and the phone was never told the id — so `DATA.googleClientId`
         was always '', the button was never drawn, and the verifier could not be reached.

         Found by check-payload.js, which is the whole reason it exists: nothing FAILED here. The
         sign-in card rendered, PIN sign-in worked, and the only symptom was a feature that had
         quietly never once appeared.

         A CLIENT ID IS NOT A SECRET. It is public by design — every site using Google Sign-In ships
         it in the page — and it is the client SECRET, which this app has never held, that must not
         leave the server. Blank stays blank: an unset cell sends '', me.js draws no button, and
         `googleLogin` still refuses, so an unconfigured site behaves exactly as it does today. */
```

### WHETHER "Mark with AI" IS WORTH DRAWING — true when `GEMINI_API_KEY` is in Script Properties.

in `payload`

```
/* WHETHER "Mark with AI" IS WORTH DRAWING — true when `GEMINI_API_KEY` is in Script Properties.
         A YES OR NO AND NEVER THE KEY: the key stays on the server, and this is one property read.
         The payload is cached, so a key added this minute reads false here until the next sheet edit
         retires the copy; `aiMark` itself answers `why: 'ai-off'` in the meantime, so the phone is
         never offered a button that does nothing for longer than one press. See keypad.js. */
```

### WHAT THE SHEET DID when this version first arrived — null on every request but the first after a deploy.

in `payload`

```
/* WHAT THE SHEET DID when this version first arrived — null on every request but the first
         after a deploy. Sent so it is visible rather than only in a log nobody opens: a schema
         change that failed and a schema change that was never needed look identical from here. */
```

### EVERY FILE'S STAMP, so a stale one can be named.

in `payload`

```
/* EVERY FILE'S STAMP, so a stale one can be named. `typeof` guards each: if a file has not
         been pasted at all the constant does not exist, and referencing it would throw and take
         the whole payload down — which is the loudest possible way to report a missing file and
         the least useful. */
```

### ---------- THE NEW ONES, DECLARED SO THE SITE CAN TELL YOU

in `features`

```
/* ---------- THE NEW ONES, DECLARED SO THE SITE CAN TELL YOU --------------------
                     A STALE DEPLOY LOOKS EXACTLY LIKE A BUG. `openWaitlist` was written, checked
                     and shipped, and the live backend did not have it — so the app said "that
                     action is not recognised", which is a sentence written for somebody who did
                     something wrong rather than for a file that has not been pasted in yet. Twenty
                     minutes went into looking for a fault that was not there.
                     Every action added from here on goes in this list, and the site now reads it. */
```

### `attemptWords` WAS HERE — the phone sent a question's words with `markDone` and backfilled them for a backend that listed it.

in `features`

```
/* `attemptWords` WAS HERE — the phone sent a question's words with `markDone` and
                    backfilled them for a backend that listed it. Both went with the `attempts` tab, and a
                    phone still running the old code finds neither here and sends nothing (9 Oct). */
```

### `editResource`, `deleteResource` and `orderPrints` WERE HERE and are gone with the questions tab.

in `features`

```
/* `editResource`, `deleteResource` and `orderPrints` WERE HERE and are gone with
                    the questions tab. The site reads this list to decide whether to OFFER a button,
                    so dropping them is what stops an admin being shown an edit form that nothing
                    will accept — a name left here would be a promise the deployment cannot keep. */
```

### The site checks this before it offers the waitlist at all, so a phone running against an older deployment says so rather than posting an action that comes back

in `features`

```
/* The site checks this before it offers the waitlist at all, so a phone running
                    against an older deployment says so rather than posting an action that comes
                    back "not recognised" — which reads as the feature being broken. */
```

### And this one says `aiMark` reads the WHOLE answer, up to `AI_ANSWER_MAX` (20,000 characters), and marks an essay on its levels.

in `features`

```
/* And this one says `aiMark` reads the WHOLE answer, up to `AI_ANSWER_MAX` (20,000
                    characters), and marks an essay on its levels. Before it, `aiMark` cut the answer at
                    2,000 -- so a phone ahead of the deployment would have sent a whole essay and shown
                    a mark for its first third as the essay's. A phone that does not see this sends no
                    answer longer than 2,000 and says why (`aiWhole_` in js/keypad.js). */
```

### AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions).

in `features`

```
/* AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions). The phone keeps every press
                    on the device until a backend lists this, and then sends them — so a phone ahead of
                    the deployment loses nothing and is refused nothing. `markDone` WAS HERE; it is not
                    listed, so a phone running the old code sends no dates to a tab nobody reads. */
```

### And what a child writes, kept on their account and read back on the next device (SCHEMA.answers).

in `features`

```
/* And what a child writes, kept on their account and read back on the next device
                    (SCHEMA.answers). A phone ahead of the deployment keeps answers on the device and
                    says so under the box rather than claiming they were saved. */
```

### ---------- `claims` WAS NEVER IN THIS LITERAL, AND `payload.claims.push` THREW

in `payload`

```
/* ---------- `claims` WAS NEVER IN THIS LITERAL, AND `payload.claims.push` THREW ------------
         A child with one unanswered "this is my child" row — the ordinary first half of linking a
         family — was answered `{ error: "Cannot read properties of undefined (reading 'push')" }`
         instead of a payload: no tutors, no library, nothing, for as long as the claim sat there.
         Found by `check-profile.js`'s family case, whose second family carries exactly such a row. */
```

### `resourceFields` AND `resourceOptions` WERE HERE — the admin form that relabelled a document, built from the server's own allow-list so it could not offer a

in `payload`

```
/* `resourceFields` AND `resourceOptions` WERE HERE — the admin form that relabelled a
         document, built from the server's own allow-list so it could not offer a field the server
         would refuse. Both sides are gone; see dopost.gs. */
```

### `resourceInUse` WAS HERE.

in `payload`

```
/* `resourceInUse` WAS HERE. It walked every document row and collected the values already
         typed into each relabelling field, so the dropdown offered what the data actually used as
         well as what the options list said — 68 resources were labelled "Paper ?" and none of those
         spellings had ever been added to the list. It has no form left to fill and no rows left to
         walk. */
```

### `subjects` holds the subject surcharges, which is what its name says.

in `payload`

```
/* `subjects` holds the subject surcharges, which is what its name says.
         It used to be sent EMPTY, with the real figures under `subjectsEta` — a key meaning
         nothing beside a key named nothing. Reading the obvious one gave an empty object and every
         subject silently priced at x1, which reads as a decision rather than a bug.
         `subjectsEta` is still sent, unchanged, so anything already reading it keeps working. */
```

### Sent, but nothing displays them yet — the shape is settled and the presentation isn't.

in `payload`

```
/* Sent, but nothing displays them yet — the shape is settled and the presentation isn't.
         Having the data flowing means whatever you decide to build reads from something real
         rather than needing a backend change first.

         `rooms` USED TO BE A PASTED SCHEMA FRAGMENT here — the ten column names of the rooms tab,
         sitting inside the payload as though they were data. Valid JavaScript, so nothing threw;
         it simply shipped a list of header strings to every phone under a key nothing read. The
         rooms that matter are on each venue, where a room belongs. */
```

### WHAT THE CALENDAR IS OFFERING TODAY.

in `payload`

```
/* WHAT THE CALENDAR IS OFFERING TODAY. Computed from the holidays tab on every load, which is
         cheap — it is one tab of about eighteen rows and a date comparison — and it is the only way
         a thing can appear and disappear on its own without anybody remembering. */
```

### ---------- EMPTY FOR EVERYBODY, AND FILLED FOR ONE PERSON

in `payload`

```
/* ---------- EMPTY FOR EVERYBODY, AND FILLED FOR ONE PERSON ---------------------------------
         THE GATE IS HERE RATHER THAN ON THE PHONE, and that distinction is the whole feature. This
         payload goes to `ANYONE_ANONYMOUS` — a tab forwarded unconditionally is in the JSON of
         every visitor who opens the site, whether or not any screen draws it, and "hidden" on the
         phone is a filter anybody can read past with the network tab open.

         SO A NON-ADMIN IS NOT FILTERED, THEY ARE NOT SENT. `filmsOut` is built inside
         `if (viewerIsAdmin)` above and is an empty array for everybody else, so there is ONE place
         that decides and it is the place that opens the tab. That makes it impossible rather than
         caught, which is the move this project already records for the reel booking: replace a
         property that was only true by accident of a renderer with one a reader can check in the
         file that sends it. */
```

### `topicTree: []` WAS THE FOURTH OF THESE, declared so `check-payload.js` would not report a key the phone filled from `data/topics.json` as read-and-never-sent.

in `payload`

```
/* `topicTree: []` WAS THE FOURTH OF THESE, declared so `check-payload.js` would not report a
         key the phone filled from `data/topics.json` as read-and-never-sent. Nothing reads it now —
         the `Topic area` question and `topicAreaOf_` are retired (find.js, `THE TOPIC TREE WAS READ
         HERE`) and the phone no longer fetches the file — so kept here it would be the same check's
         other list, sent and never read. NO STAMP BUMP FOR IT: until the next sync the deployed copy
         goes on sending an empty array nobody asks for, which is the whole of the difference. */
```

### AND `practicals` IS THE FIFTH, for exactly the same reason.

in `payload`

```
/* AND `practicals` IS THE FIFTH, for exactly the same reason. `data/practicals.json` is
         41 experiments filled in on the phone by `libraryExtras_`; this line is what stops
         `check-payload.js` reporting the key as read-and-never-sent, which it would be right
         to do — it cannot tell a key filled in the browser from one nobody sends. */
```

### AND `projects` IS THE SIXTH, for the same sentence:

in `payload`

```
/* AND `projects` IS THE SIXTH, for the same sentence: `data/projects.json` is filled in
         on the phone by `libraryExtras_`, and without this key `check-payload.js` would report it
         read-and-never-sent. Nothing here reads a tab for it. The site works before this line is
         deployed -- the phone fills the key either way -- so the deploy is for the check's sake. */
```

### Missing COLUMNS, and — for an admin — what is wrong with the DATA.

in `payload`

```
/* Missing COLUMNS, and — for an admin — what is wrong with the DATA. The second is the one
         that matters day to day: a column can be added by a script, and a term that ends before it
         starts can only be noticed by somebody. */
```

### A TITLE IS A SEPARATE FIELD RATHER THAN A LONGER `role` STRING, because `role` is one word:

in `doGet`

```
/* A TITLE IS A SEPARATE FIELD RATHER THAN A LONGER `role` STRING, because `role` is
             one word: the card sets it as its own heading and the funnel reads that field as a
             kind. Joining `Tutor · Head of Boxing` into it would put a title through every reader
             of it, and there is no way back out of one string. `titlesOf` reads `ROLE_TITLES`, so
             a person with no title sends an empty list rather than a word nobody declared. */
```

### ---------- WHO THEY ARE, NOT WHAT THEY ARE CALLED

in `doGet`

```
/* ---------- WHO THEY ARE, NOT WHAT THEY ARE CALLED ------------------------------------
             `id` ABOVE IS A POSITION IN THIS ARRAY and `title` is a display name; neither is the
             person. The Message control on a tutor's pass has to name a recipient, and naming one
             by display name is the fault this project already has a check for — `findPerson` falls
             back to matching the NAME, which is right for a row typed into the sheet before anybody
             has an id, and silently wrong the day two tutors share one. On a PRIVATE MESSAGE that
             is not a denial, it is a disclosure: the note goes to the wrong person and neither of
             them can tell.

             PUBLISHING IT COSTS NOTHING. The payload is served to anonymous visitors, and this is
             an internal identifier rather than a secret — every action checks the signed-in user
             and `mayMessage` checks the roles, so knowing an id grants nothing. `handle` has been
             public here since the file was written. The PINs, addresses and dates of birth that
             ARE secret live on rows this loop never touches. */
```

### AND WHICH OF THE HIDDEN ONES ASKED — a Tutor box ticked in Settings (`LISTED_PENDING`).

in `doGet`

```
/* AND WHICH OF THE HIDDEN ONES ASKED — a Tutor box ticked in Settings (`LISTED_PENDING`).
             Only an admin is ever sent an unlisted row, so only an admin reads this; the card says
             "asked to tutor" where it would say "not listed", and the same Listed switch is the yes. */
```

### THE HANDLE OR NOTHING — never the first name in its place.

in `doGet`

```
/* THE HANDLE OR NOTHING — never the first name in its place. `@Ada` printed where a handle
             goes is read as one, typed at the sign-in box, and refused: sign-in matches the `handle`
             cell and nothing else. A blank is drawn as no handle, which is the truth. */
```

### THE FIGURE, ONLY WHEN THE FACE IS THE FIGURE (`pfp:avatar`) — `faceFig_` in core.gs.

in `doGet`

```
/* THE FIGURE, ONLY WHEN THE FACE IS THE FIGURE (`pfp:avatar`) — `faceFig_` in core.gs. Every
             other row sends no `avatar` key at all, which `JSON.stringify` drops as `undefined`: a
             tutor who chose a photograph or a fox shows exactly what they showed before, and the one
             who chose their figure is drawn as it, wherever their picture appears. */
```

### THE OTHER PHOTOGRAPHS, AS A LIST, without the face — `photosList_`.

in `doGet`

```
/* THE OTHER PHOTOGRAPHS, AS A LIST, without the face — `photosList_`. An older phone
             ignores the key, and a row that has none sends `[]` rather than a missing key, so the
             card can tell "none" from "a backend that does not know about them". */
```

### When they last confirmed their details are current.

in `doGet`

```
/* When they last confirmed their details are current. A profile nobody has looked at for
             a year is worse than one that's obviously incomplete, because it reads as true. Sent
             as the date; the site decides what counts as recent, so the rule lives in one place. */
```

### THE AGES THEY TEACH, public like the rate — it is what a parent checks before anything else.

in `doGet`

```
/* THE AGES THEY TEACH, public like the rate — it is what a parent checks before anything
             else. A whole number, the word `Adults`, or '' for an end nobody has answered: NOT `N()`,
             which would turn "Adults" into nought and nought into a claim of "age 0". `ageOut_` is
             the one reader; the card turns the pair into "Ages 8–16". */
```

### AND THE BUSINESS'S CUT OF THAT SEAT, THIS TUTOR'S OWN (docs/history/345) — '' for a blank cell, which is the config tab's `B`, and nought for nought, which is

in `doGet`

```
/* AND THE BUSINESS'S CUT OF THAT SEAT, THIS TUTOR'S OWN (docs/history/345) — '' for a blank cell, which
             is the config tab's `B`, and nought for nought, which is no cut: `seatCutOut_`, because `N()` would
             make the two one. Public as `B` already is (`constants.vars`), and no more than the card's
             `+£X/h a seat` minus the tutor's share already says. `seatShare_` (js/core.js) reads it. */
```

### WHAT THEY ARE ALREADY TEACHING, as the same `m16` codes — so the booking grid can show an hour as taken WITHOUT the tutor's own availability having been edited.

in `doGet`

```
/* WHAT THEY ARE ALREADY TEACHING, as the same `m16` codes — so the booking grid can show
             an hour as taken WITHOUT the tutor's own availability having been edited. The cell says
             when they CAN work; this says when they are already working, and keeping the two apart
             is what lets a cancelled session give the hour back on its own. */
```

### ---------- THE SAME SUBJECT TWICE IS ONE SUBJECT

in `doGet`

```
/* ---------- THE SAME SUBJECT TWICE IS ONE SUBJECT --------------------------------------
             A TUTOR ROW HAS TWO SLOTS and nothing stops both holding the same thing. One does:
             `teaches_1` and `teaches_2` are both Maths (GCSE), so the pass printed it on two lines,
             the subject card counted the tutor twice, and the level card did too.

             DEDUPED HERE RATHER THAN ON THE CARD, because the card is not the only reader —
             `subjectRows` and `levelRows` both walk this list, and fixing it three times is three
             chances to fix it differently. The sheet is still worth tidying; this stops a typo in a
             spreadsheet becoming a wrong number on a card. */
```

### WHAT THEY TEACH, THE SPECIALISM FIRST — derived from the two ticks on their rows of the `qualifications` tab by `teachesOf_`, which dedupes, so a sheet typed

in `doGet`

```
/* WHAT THEY TEACH, THE SPECIALISM FIRST — derived from the two ticks on their rows of the
             `qualifications` tab by `teachesOf_`, which dedupes, so a sheet typed twice cannot put
             one subject on the card twice. `teachesSpec` is EVERY level ticked Teach (several are
             allowed), said by the server rather than left to position, so a tutor with none must
             not have their first "can teach" drawn as one. `teachesMain` is the first of them, for a
             phone built when there could only be one. */
```

### UP TO TEN, OFF THEIR ROWS OF THE `qualifications` TAB — `qualsList_` in core.gs.

in `doGet`

```
/* UP TO TEN, OFF THEIR ROWS OF THE `qualifications` TAB — `qualsList_` in core.gs. TWICE,
             ONE LIST: `qualsParts` is each qualification as its parts, which the card writes like
             an isotope (*"Maths subscript to it is grade and super script is the level"*), and
             `quals` is the same entries as sentences, kept for a phone built before the parts were
             sent. `qualsParts_` / `qualSentence_` in core.gs say why both, and why `kind`. */
```

### ---------- CHILDREN ARE NOT SENT TO STRANGERS

in `doGet`

```
/* ---------- CHILDREN ARE NOT SENT TO STRANGERS -------------------------------------------
         EVERY STUDENT ON THE SYSTEM WENT TO EVERY PHONE, and to anybody who loaded the site at all
         — name, handle, who their siblings are, who their friends are. A tutor is public and means
         to be; a nine-year-old is not, and this file is careful about it everywhere else: the exam
         dates and the birthdays a few hundred lines below both check `maySee` and go to family
         only. The list of the children themselves had no check whatsoever.

         WHO ACTUALLY NEEDS IT, which turns out to be a short list:
           · an ADMIN, who runs the place
           · a STUDENT, for the friend search — exact handle, and for their own scoreboard
           · a PARENT, for their own children
         A signed-out visitor needs none of it, and neither does a tutor: they see the children they
         teach on the session, by name, which is where a tutor's need actually is.

         THE HANDLE IS THE FRIEND MECHANISM and it stays for the people who use it. `friend-add`
         matches an EXACT handle deliberately — a search that guesses adds the wrong child — so a
         student has to be able to look one up. That is a real need and it is met by sending the
         list to students rather than to the internet. */
```

### ---------- WHO AN ADMIN MAY BOOK ON BEHALF OF

in `doGet`

```
/* ---------- WHO AN ADMIN MAY BOOK ON BEHALF OF ---------------------------------------------
         ADMIN ONLY, AND ONLY A NAME. Somebody rings up and you book it for them — without this the
         receipt says the booking belongs to whoever was holding the phone, which is you.

         NOTHING BUT THE NAME GOES IN THIS LIST. It is the shortest thing that answers the question,
         and a list of every client's email and phone sent on every load is a leak waiting for the
         first person who is accidentally given the admin role. `payload.students` learned that the
         hard way — it went to every visitor until it was caught. */
```

### ---------- CLAIMS WAITING ON THIS PERSON

in `doGet`

```
/* ---------- CLAIMS WAITING ON THIS PERSON ---------------------------------------------------
         THE WHOLE CLAIM FLOW EXISTED AND HAD NO DOOR. `claimChild` and `answerClaim` are both
         written, both correct, and neither was reachable: nothing in the app called them, and
         nothing sent a pending claim to the child who had to answer it. A parent could not ask and
         a child could not have been asked.

         THEIRS ONLY. A row here is somebody saying "this is my child" — it names a family, so it
         goes to the child it names and nobody else. */
```

### ---------- EVERYONE, FOR AN ADMIN'S PEOPLE COLUMN

in `doGet`

```
/* ---------- EVERYONE, FOR AN ADMIN'S PEOPLE COLUMN ------------------------------------------
         ASKED FOR AS *"Admin should be able to see every one in the people column."* The column is
         `accountPages_` in find.js and it walks `tutors` — the tutors and admins, which an admin
         already gets unlisted ones of. The students and clients were nowhere on it, and the one
         person who runs the place could not look up a family without opening the spreadsheet.

         ADMIN ONLY, BY THE TOKEN (`viewerIsAdmin` is `meAsked`, never `?name=`), AND ONLY WHAT A
         CARD DRAWS: an id, a name, a handle, a role and a photograph. No address, phone, PIN, date
         of birth or bank cell — the `payload.students` lesson above, where the list was right for
         the first reader and went to every visitor. The ADMIN reads email and phone in the sheet;
         a payload is a copy on a phone, and a copy is the thing that leaks.

         A TUTOR OR ADMIN ROW IS NOT REPEATED HERE. `tutors` already carries it, with the rate and
         the subjects a tutor card wants, and two lists naming one person is one card drawn twice. */
```

### ---------- `siblings` AND `friends` WERE HERE, AND THEY WENT TO EVERY STUDENT

in `doGet`

```
/* ---------- `siblings` AND `friends` WERE HERE, AND THEY WENT TO EVERY STUDENT ---------------
             EACH CHILD'S BROTHERS AND SISTERS BY FULL NAME, AND THEIR FRIENDS LIST, sent to anybody
             signed in as a student — and anybody can be one: `register` is open, and since a child
             with no email can make an account with a grown-up's, it takes one confirmed link. The
             phone reads neither (`find.js`, `me.js`, `games.js` and `map.js` read the handle, the
             score and the avatar). A person's OWN family arrives in `payload.family`, and their own
             friends on their own row, which is where each belongs. Not sent is not leaked. */
```

### THE FIRST NAME, AS IT ALWAYS WAS — for everybody on the board, child or not:

in `doGet`

```
/* THE FIRST NAME, AS IT ALWAYS WAS — for everybody on the board, child or not: it said
             `S(r.first_name) || name`. `kidFirst_` is that first name, or the handle where a row has none,
             and never the lone surname such a row does have. `nameFor_(r, true)` stood here for a few
             hours and was the WHOLE name for anybody holding `student` who is not a child — a parent
             who is also learning, a student-tutor — and the board goes to every signed-in phone (the
             review of 10 Oct: "Gus Hartwell" where it had always said "Gus"). `nameFor_` only for a row
             with neither, so a grown-up with nothing else keeps the name they had here. */
```

### ---------- YOUR OWN FAMILY, AND NOBODY ELSE'S

in `doGet`

```
/* ---------- YOUR OWN FAMILY, AND NOBODY ELSE'S ------------------------------------------------
       ASKED FOR AS *"students should be able to see their parents and likewise"*. The sign-in reply
       already carried `parents` and `children` as NAMES, which is enough for the booking form and
       not enough for a card: the account column draws a person through `findCard`, and that wants a
       photograph and a handle as well as a name.

       THE SERVER DECIDES, AND IT DECIDES BY THE TOKEN. `meAsked` is who `?token=` resolves to —
       never `?person=` or `?name=`, which anybody can type — and the list is that person's
       ACCEPTED links in both directions, read through `acceptedParents` / `acceptedChildren`, the
       same two functions the sign-in reply and the exam diary use. A claim nobody has answered is
       a request and not a family, so an `asked` or `refused` row sends nobody. A stranger has no
       `meAsked` and gets an empty list; an admin gets their OWN family and not everybody's, because
       running the place is not being somebody's parent.

       ONLY WHAT THE CARD DRAWS: a name, a handle, a photograph and which side of the link they are
       on. No e-mail, phone, address or date of birth — a family card is the public half of a
       person, and the private half is theirs.

       A KEY OF ITS OWN rather than more rows on `students`. `payload.students` goes to every student
       for the friend search, so a parent's row put there would be a parent sent to every child on
       the site; and a child's row is already in it for that reason, which is not the same as this
       person being YOUR child. The cache is keyed on the token's person (`payloadKey_`), so one
       family's list cannot be handed to another. */
```

### WHERE IT IS, as two numbers.

in `doGet`

```
/* WHERE IT IS, as two numbers. Sent as numbers rather than strings because everything that
           uses them does arithmetic — a map projects them, and "51.41" projected is NaN placed at
           the top left corner, which looks like a venue rather than a fault. */
```

### EACH BLANK CELL IS THE VENUE'S, decided in `roomTerms_` (booking.gs) — the same call `capacityFor`, `priceLooksWrong` and `waitlistPrice` make, so the room the

in `doGet`

```
/* EACH BLANK CELL IS THE VENUE'S, decided in `roomTerms_` (booking.gs) — the same call
           `capacityFor`, `priceLooksWrong` and `waitlistPrice` make, so the room the phone prices
           and the room the server checks are one answer. A blank rate used to arrive here as 0,
           which this site reads as FREE; see the note over `roomTerms_`. */
```

### A room's own opening hours.

in `rooms`

```
/* A room's own opening hours. The building may be open all day while the large room
                 is booked out every morning — availability describes the SPACE you hire, not the
                 address. Blank falls back to the venue's, so a room nobody has set hours for is as
                 available as the building.
                 THE FALLING BACK IS DONE HERE NOW, NOT ON THE PHONE. This sent `null` and left the
                 venue's hours to `slotGrid`, which looks the venue up by the booking's location —
                 and for a room that is "Venue — Room", which is no venue's title. So a room with no
                 hours of its own was offered every hour of the week, closed building or not. */
```

### Only for an admin, and only on request — walking every row costs time, and a client has no use for a list of what needs fixing.

in `doGet`

```
/* Only for an admin, and only on request — walking every row costs time, and a client has no
       use for a list of what needs fixing.
       Asked for by the URL: `?health=1`. The payload is built by doGet, which has no `body` — that
       is doPost's — and reaching for one threw and took the entire payload down with it. */
```

### THE DRIVE PROBE ONLY WHEN THE REPORT IS ASKED FOR BY NAME.

in `doGet`

```
/* THE DRIVE PROBE ONLY WHEN THE REPORT IS ASKED FOR BY NAME. `?health=1` is somebody opening
         the health card on purpose and willing to wait; an ordinary admin load is somebody opening
         the app, and it must not go and write a file to Drive before it can draw anything. */
```

### ---------- `brand` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `brand` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/brand.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### ---------- THE LIBRARY SPREADSHEET IS NOT READ HERE ANY MORE

in `doGet`

```
/* ---------- THE LIBRARY SPREADSHEET IS NOT READ HERE ANY MORE --------------------------------
       THREE BLOCKS STOOD HERE — the cheat sheet's components, the boxers and the bouts — each
       walking a tab of the `Library` file and pushing it onto the payload for every phone on every
       load. They are `data/cheatsheet.json`, `data/boxers.json` and `data/fights.json` in the
       repository now: 77, 103 and 157 rows, fetched beside `questions.json` and mapped by
       `libraryExtras_` in js/library.js, which is the same mapping this was — compared key for key
       and column for column before either block was touched, and byte-identical.

       THE EMPTY DECLARATIONS IN THE PAYLOAD LITERAL STAY, and that is deliberate rather than
       leftover. `check-payload.js` builds its "sent" set from `doget.gs` alone, so removing
       `boxers: []`, `fights: []` and `cheatsheet: []` would report three keys as read-and-never-sent
       — a true sentence about this file and a false one about the app, because the phone fills them
       from the repo. `questions` has been in exactly this state since it moved, for the same reason.

       WHY IT MOVED AT ALL, in the words of the three-question test in CLAUDE.md: it is not secret,
       the app never writes to it, and it arrives in bulk rather than being hand-edited. All three
       answers point at code. What it buys is a tab that is no longer walked on every uncached
       build, and a file a diff can show you.

       THE SPREADSHEET ITSELF IS NOT DELETED BY THIS and must not be assumed gone: it still holds
       thirteen tabs nothing here reads — `bible` alone is 31,102 rows — and a `questions` tab whose
       `ticks_1/2/3` columns still carry 498 cells naming people. That is a decision for whoever owns
       the data, not a consequence of this commit. */
```

### THE FUNNEL'S QUESTIONS.

in `doGet`

```
/* THE FUNNEL'S QUESTIONS. To EVERY phone, not just an admin's — this decides what the search
       asks, and search is the thing everybody uses. A row for a field the code does not know is
       passed through rather than dropped: the phone ignores it, and a tab that quietly deleted
       rows it did not recognise would be impossible to debug from the sheet end. */
```

### ---------- `facets` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `facets` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/facets.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### THE FUNNEL'S ANSWERS.

in `doGet`

```
/* THE FUNNEL'S ANSWERS. To every phone, for the same reason the questions are: this decides how
       the first two questions group and name everything, and those are the two every search passes
       through. A row for a kind the code does not produce is passed through rather than dropped —
       same as `facets`, and for the same reason: a tab that silently deleted what it did not
       recognise could not be debugged from the sheet end. */
```

### ---------- `kinds` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `kinds` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/kinds.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### ---------- THE CAMPAIGNS, AND THE WORDS THEY SAY

in `doGet`

```
/* ---------- THE CAMPAIGNS, AND THE WORDS THEY SAY -------------------------------------------
       The design comes off `campaigns`; the wording off `copy`, gathered under the campaign it
       belongs to so the phone never has to join two lists itself. Sent to admins only, which is
       who the flyer maker is for — there is no reason for a parent's phone to carry next term's
       advertising copy.

       ONE PASS OVER `copy`, INDEXED BY CAMPAIGN. Reading the tab once per campaign would be eleven
       passes over the same rows to save writing four lines, and this tab will be the longest of the
       two by far — four wordings for eleven campaigns is forty-four rows before anybody gets
       inventive. */
```

### ---------- `copy` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `copy` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/copy.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### ---------- `campaigns` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `campaigns` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/campaigns.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### ---------- THE REELS

in `doGet`

```
/* ---------- THE REELS ---------------------------------------------------------------------
       `screen('reel')` has read `DATA.facts` since it was written and nothing has ever sent it, so
       the column has always shown "Nothing here yet. Add a row to the facts tab" — naming a tab
       that did not exist in TAB, in SCHEMA, or here. Run `?setup=1` once and ensureSchema creates
       it with its headers.

       SORTED BY `sort_order` THEN BY ROW, so the order is yours to choose and is stable when the
       column is left empty — a reel that reshuffles itself every load is a column nobody can point
       somebody else at. */
```

### ---------- `facts` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `facts` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/facts.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### ---------- `laws` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `laws` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/laws.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYS, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would report it read-and-never-sent — a true sentence about doget.gs and a false one
       about the app, which fills it from the repo. */
```

### If the tab is empty — a fresh sheet, or somebody cleared it — the four laws that were asked for stand in.

in `doGet`

```
/* If the tab is empty — a fresh sheet, or somebody cleared it — the four laws that were asked
       for stand in. A site whose subjects stop being green because a tab is empty looks broken in
       a way nobody would connect to a missing row. */
```

### THREE COLOURS, THREE QUESTIONS, and that is the whole set:

in `payload.laws`

```
/* THREE COLOURS, THREE QUESTIONS, and that is the whole set:
             green  WHAT   the subject
             purple WHERE  the venue
             red    WHO    the tutor
           They are the three facts a booking is assembled from and the three you scan a list for.
           A fourth would make this a legend, and a legend is what colour is meant to replace.

           RED WAS THE CLIENT'S and cannot be both — two lists in one colour is worse than neither
           being coloured, because the eye learns a rule that is false half the time. A client's
           name is a private detail inside a caption rather than a category anybody scans for, so
           it goes dim: still marked as a name, no longer competing with the three things somebody
           is actually looking for. */
```

### THE LEVEL, pink. The fourth fact a booking is made of and the last one still uncoloured:

in `payload.laws`

```
/* THE LEVEL, pink. The fourth fact a booking is made of and the last one still uncoloured:
           WHAT is green, WHERE is purple, WHO is red, and AT WHAT LEVEL was plain text sitting
           between them. `wearables` had pink and has moved to blue-soft — a hat is worth a colour
           on the shop screen and not one of the four things somebody scans a booking for. */
```

### THE POSTS, with their likes counted and yours marked.

in `doGet`

```
/* THE POSTS, with their likes counted and yours marked.
       Counted here rather than sent as a list of likers: the front of the app needs a number and
       one boolean, and shipping every like to every phone would be sending a hundred rows to
       answer "did I press this". */
```

### ---------- NOTHING HERE TOUCHES DRIVE

in `doGet`

```
/* ---------- NOTHING HERE TOUCHES DRIVE -------------------------------------------------
         `fillPostNames_` was called here, and it made up to six Drive calls INSIDE somebody's page
         load — the only network round trip in the whole payload, on every single visit, to look up
         filenames for posts that had none.

         It existed so a post with no caption could fall back to what its file is called. That is a
         nice thing and it is not worth a request to another Google service on every load: the
         caption is a column, the sheet is the database, and a post with no caption should simply
         have no caption until somebody types one or the scan records the name.

         The scan still records `file_name` when it runs, and the payload below still prefers a
         typed caption and falls back to that name. What is gone is the fetching — so the posts
         are now read entirely from the sheet, like everything else on this screen. */
```

### And the same people keyed by ID, for the likes — which know a person_id and not a name.

in `doGet`

```
/* And the same people keyed by ID, for the likes — which know a person_id and not a name.
         Built in the same pass: a lookup inside the post loop would read the people tab once per
         like, which is two hundred reads of one table to draw one sentence. */
```

### ---------- THE FACE IS THE `photo` CELL, AND THE FIGURE ONLY WHEN IT IS THE FACE

in `doGet`

```
/* ---------- THE FACE IS THE `photo` CELL, AND THE FIGURE ONLY WHEN IT IS THE FACE ----------
           THIS WAS `S(pp.avatar) || S(pp.photo)` — the WEARABLE string first, which is
           "hair:crop|legs:jeans" and not a picture, so anybody who had dressed their figure posted
           under a broken image: the fault the sign-in reply's own note names ("a broken image in any
           <img> that gets it"). The face is `photo` — a link, nothing, or one of the eleven tokens
           (the owner, 10 Oct: *"…which allow you to use your avatar as a dp."*) — and the figure
           rides as `figure` only when the face is `pfp:avatar` (`faceFig_`), which is no more than
           this line already sent for everybody who had dressed one.
           A CHILD'S PHOTOGRAPH IS NOT PUT ON THE FEED BY THIS FIX. The feed goes to every visitor,
           and under the old line a child who had dressed their figure sent the wearable string in
           place of their photograph — broken, but private. Sending the photograph now would be
           something new about a child to people who could not see their picture before, which the
           owner ruled out. So for a child a LINK is sent only where it was sent before — no figure
           dressed — and the eleven tokens always, because a fox or the figure the old line already
           sent tells nobody anything about the child.
           A CHILD IS ANYBODY WHO HOLDS `student`, ASKED WITH `hasRole` — the test the privacy-gated
           `students` list above already uses. IT WAS `toAppRole(mainRole(pp)) === 'kid'`, and
           `mainRole` ranks tutor and client above student, so a child with a second role was not a
           child here. Found by review on 10 Oct: a child ticks Tutor in their own Settings
           (`setMyRoles` is self-serve and holds the role PENDING, so they are never listed), the cell
           becomes "tutor, student", and their photograph went out as their post face to every
           visitor — where the old line had sent their wearable string. Asking "does this person hold
           student" errs the private way: an adult who also takes lessons and has dressed a figure
           keeps the old line's answer too, which is no worse than before this change. */
```

### A DELETED POST STILL GOES TO AN ADMIN, marked.

in `doGet`

```
/* A DELETED POST STILL GOES TO AN ADMIN, marked. It has to: deleting is a flag, and
           something invisible cannot be switched back on from the phone — which would make the
           control worse than not having one. The same rule the tutor `listed` switch follows. */
```

### ---------- WHO SEES A POST THAT IS WAITING

in `doGet`

```
/* ---------- WHO SEES A POST THAT IS WAITING ----------------------------------------------
           Three answers, and they are three different people:

             AN ADMIN sees it, marked, because approving it is the whole point and something
                      invisible cannot be approved.
             WHOEVER POSTED IT sees it, marked, because a photograph that vanishes on being posted
                      reads as the app having eaten it — and then they post it again.
             EVERYBODY ELSE does not, which is the entire mechanism.

           A REFUSED one goes to the admin only. The person who posted it has already been told by
           email; leaving it on their own feed under a red word is a telling-off they get every
           time they open the app. */
```

### An author who is not in the people list still gets a name — the one typed in the row.

in `doGet`

```
/* An author who is not in the people list still gets a name — the one typed in the row.
           A post from somebody who has since left should not become anonymous.
           An author who is not a person is the business itself — a post with no author, or one
           signed "@family.". It gets the brand's square mark, so the feed is never a column of
           blank circles. */
```

### THE CELL HOLDS THE WHOLE NAME (the sheet keeps it); what goes out is `nameFor_`'s, so a child's post is signed with their first name.

in `doGet`

```
/* THE CELL HOLDS THE WHOLE NAME (the sheet keeps it); what goes out is `nameFor_`'s, so a
             child's post is signed with their first name. The net in `jsonOut` would catch it too —
             said here because a post's author is one of the places the owner meant. */
```

### THE FIGURE, ONLY WHEN THE AUTHOR'S FACE IS THEIR FIGURE — set on `faces` above.

in `doGet`

```
/* THE FIGURE, ONLY WHEN THE AUTHOR'S FACE IS THEIR FIGURE — set on `faces` above. Read off the
             lookup rather than off `who`, which `check-columns.js` reads as a sheet row: `figure` is a
             field of this payload, not a column of any tab. */
```

### EVERY PICTURE AND CLIP, THE FIRST INCLUDED, so the phone reads one list rather than stitching `image` onto the front itself — which would be a second place for

in `doGet`

```
/* EVERY PICTURE AND CLIP, THE FIRST INCLUDED, so the phone reads one list rather than
             stitching `image` onto the front itself — which would be a second place for the order
             to be decided. See `media` in `SCHEMA.posts`. */
```

### THE CAPTION, RESOLVED HERE AND NOWHERE ELSE.

in `doGet`

```
/* THE CAPTION, RESOLVED HERE AND NOWHERE ELSE.
             Two columns, two owners, and no rule about who may overwrite whom:
               `caption`   what a PERSON typed. Only ever written by editPost.
               `file_name` what the FILE is called. Only ever written by the scan.
             The one you see is the typed one if there is one, and the file's name otherwise.

             This replaces a comparison — take the name only if the caption still equals the name
             it was taken from last time — which needed both columns kept in step, a "recaptioned"
             count, a button to trigger it, and got the answer wrong whenever any of that drifted.
             Nothing is copied between them now, so nothing can be out of step. Rename the file and
             the caption follows because it was never a copy; type a caption and it wins because it
             is checked first. */
```

### THE TIMESTAMP, in milliseconds.

in `doGet`

```
/* THE TIMESTAMP, in milliseconds. `when` is a day, which is enough to print and not
             enough to sort or to say "three hours ago" with: two posts from the same afternoon
             tie on the day and fall back to sheet order, which is no order at all. */
```

### REACTIONS — and they are now the ONLY thing a person presses on a post.

in `doGet`

```
/* REACTIONS — and they are now the ONLY thing a person presses on a post.
             The heart is gone: a like is a reaction with one option, so having both meant two
             counts of the same gesture and a heart sat next to a 👍 competing with it.

             What is on offer, how many of each, which is yours, and WHO. The set comes from
             `reactionSet` — this post's own column, then the six in `HOUSE_REACTIONS`. The brand
             tab was the middle rung and is `data/settings/brand.json` now, which this file cannot
             reach; the house list is the floor and is never empty, so there is always something to
             draw and the `null` below cannot actually be returned. */
```

### WHO, AND WITH WHAT. Names rather than ids — a reaction is a public thing and an id is not, and a list of P17390421 tells nobody anything.

in `reactions`

```
/* WHO, AND WITH WHAT. Names rather than ids — a reaction is a public thing and an id
                 is not, and a list of P17390421 tells nobody anything.
                 Capped at forty: the counts above are the numbers, this is the list behind them,
                 and shipping four hundred rows to answer "who reacted" would be sending a database
                 to draw a sentence. */
```

### ---------- WHAT PEOPLE SAID

in `doGet`

```
/* ---------- WHAT PEOPLE SAID -------------------------------------------------------
             OLDEST FIRST, WHICH IS THE OPPOSITE OF THE FEED AND IS RIGHT. A feed is a list of
             separate things and the newest is the one you came for; a conversation is one thing
             read from the top, and a reply printed above the remark it answers is unreadable.

             NAMES, NOT IDS — the same decision `reactions.by` records one block up: a comment is a
             public thing and an id is not, and `P17390421 said …` tells nobody anything.

             `mine` RATHER THAN THE PERSON_ID, so the phone can draw a Delete on your own comment
             without the payload carrying who everybody is. Computed here, where the signed-in
             person is already known, for the same reason `yours` is.

             `canRemove` IS NOT `mine`. An admin may take down anybody's, and repeating that rule on
             the phone would be two copies of one policy — the fault recorded under `MESSAGING`,
             under `kinds` and under `childrenOf`. The server says who may; the phone draws what the
             server said.

             CAPPED AT SIXTY. The count is the number; this is the list behind it, and shipping six
             hundred rows for one post is sending a database to draw a conversation. The phone says
             how many are not shown, which is a number somebody can act on rather than a silence. */
```

### `fmtDateTime`, WHICH IS WHAT A MESSAGE ALREADY SENDS.

in `list`

```
/* `fmtDateTime`, WHICH IS WHAT A MESSAGE ALREADY SENDS. `S(c.said_on)` on a sheet
                     Date is whatever `String()` makes of it — "Tue Sep 15 2026 18:20:00 GMT+0100
                     (BST)" — and a second spelling of a timestamp is a second thing for `parseWhen`
                     to get right. One function, one format, for both surfaces that print a time. */
```

### Pinned first, then newest.

in `doGet`

```
/* Pinned first, then newest. A feed in sheet order is a feed in whatever order somebody
         happened to type things, which is no order at all — and after a folder scan that order is
         Drive's, which put February between two days in June. */
```

### EXAMS AND BIRTHDAYS — the two things a calendar has to know about a person.

in `doGet`

```
/* EXAMS AND BIRTHDAYS — the two things a calendar has to know about a person. Sent with the
       payload rather than fetched separately: a student's exam dates are the size of a sentence,
       and a second round trip for them would cost more than carrying them.

       WHOSE. This block used to send EVERY exam to EVERY phone — fifteen accounts each receiving
       a list of which child sits which paper on which morning. An exam date belongs to the
       student, to their family, and to you. Nobody else.

       A BIRTHDAY IS DAY AND MONTH ONLY. The year is on the row and is deliberately not sent: a
       full date of birth is a child's age, and a calendar needs to know when to say happy
       birthday rather than how old somebody is turning. It also has no year BY DESIGN — it
       happens every year, and a date that appears once is a date somebody misses. */
```

### ---------- AND THE TWO EXAM DATES A STUDENT KEEPS ON THEIR OWN PAGE

in `doGet`

```
/* ---------- AND THE TWO EXAM DATES A STUDENT KEEPS ON THEIR OWN PAGE ---------------------
         `exam_small_date` AND `exam_big_date` ARE WRITTEN IN SETTINGS (history 174) and were read by
         the Journey card alone — while the Calendar, the one surface that is ABOUT dates, read only
         this tab, which nothing on the phone writes. Two places for one fact, and the Calendar read
         the empty one. So the two cells join the list here, under the same `maySee` (the student,
         their family, an admin), as a mock and an exam. NO DUPLICATES: a date the tab already holds
         for that person is the tab's row — it has the subject and the board — and the cell adds
         nothing. */
```

### ORDERS. Yours, or everybody's if you are the admin who has to print them.

in `doGet`

```
/* ORDERS. Yours, or everybody's if you are the admin who has to print them.
       A print order is work that happens over days — printed, put in an envelope, posted — so the
       person who asked needs to see where it has got to, and you need a list of what to do. */
```

### WHAT THE BOOKING FORM PRICES A TRIP FROM (docs/history/353) — `bookMoney_` in core.js.

in `doGet`

```
/* WHAT THE BOOKING FORM PRICES A TRIP FROM (docs/history/353) — `bookMoney_` in core.js. At cost, so
           a figure here is what the business pays out and the Money block subtracts it again. `tripId` is
           the row number where the cell is blank, the same number `id` has always been. */
```

### ---------- THE DISCOUNT CODES, TO AN ADMIN ALONE (docs/history/353)

in `doGet`

```
/* ---------- THE DISCOUNT CODES, TO AN ADMIN ALONE (docs/history/353) ------------------------------------
       THE GATE IS HERE, for `films`' reason: a list the phone has to be trusted not to show is a list already
       sent. A code a family can read is a code a family can type. Expired, switched off and spent codes are
       sent too, marked, so the admin's dropdown can say why one cannot be used rather than losing it —
       `discountRefusal_` (booking.gs) is what actually refuses one, whatever the phone offered. */
```

### ---------- WHAT A WAITING-LIST SEAT COSTS, WORKED OUT HERE

in `doGet`

```
/* ---------- WHAT A WAITING-LIST SEAT COSTS, WORKED OUT HERE --------------------------------
       THE BROWSER CANNOT DO THIS SUM. It needs three config numbers — how many seats, the open
       tutor rate, the charge for each extra seat — and the config never went to the phone at all.
       My first attempt read `DATA.config`, which does not exist; sending the raw numbers so the
       browser can redo the arithmetic would be the same sum written twice, in two languages, free
       to drift apart.

       SO THE ANSWER TRAVELS, NOT THE INGREDIENTS. One figure per venue, from `waitlistPrice` —
       the same function `joinWaitlist` charges against, so the card and the receipt cannot
       disagree. Null where a venue has no rate set, which the card reads as "not priceable yet". */
```

### AND ONE PER ROOM, UNDER THE LABEL THE PHONE LOOKS IT UP BY.

in `doGet`

```
/* AND ONE PER ROOM, UNDER THE LABEL THE PHONE LOOKS IT UP BY. `waitPrice_` reads
       `waitlistSeat[BOOKING.loc]`, and once a venue has rooms the form offers only its rooms —
       "Colliers Wood Library — Small room 1", built by `bookableSpaces` as title, space, em dash,
       space, room. Keyed by the building alone, a list in any room had no price on the phone and was
       refused on the server, so entering a venue's rooms switched off its waiting lists. */
```

### ---------- WHAT THIS PERSON LAST SENT FOR EACH QUESTION, AND — FOR AN ADMIN — HOW EVERYBODY IS DOING

in `doGet`

```
/* ---------- WHAT THIS PERSON LAST SENT FOR EACH QUESTION, AND — FOR AN ADMIN — HOW EVERYBODY IS DOING
       *"it will leave the latest event up, so they would see incorrect answer there next time they
       login"* — the owner, 9 Oct. `mine` is the signed-in person's LATEST submission per question,
       its answer and its verdict; a visitor with no token gets an empty one. `for` is the id it was
       built for, which the phone checks before drawing any of it — the `familyFor` rule, because a
       payload left on a shared phone by the last student must not mark the next one's questions.

       AN ADMIN ALSO GETS `people`: per learner, how many questions and the last day. A SUMMARY, not
       the rows and not one answer — the people column draws two facts per card (`12 questions · last
       4 Oct`, asked for in 269 *"so a tutor can see it"*), and every child's answers to one phone
       would be the thing this payload never carries: somebody else's work.

       A TUTOR GETS NOTHING EXTRA, and that is a decision rather than an omission. Who a tutor
       teaches is not a column anywhere: it is folded from the events tab by DISPLAY NAME
       (`participantsOf`), and the child a parent booked for is a name in `for_children`, blank
       on most rows. A rule built on that would hand one family's work to whichever tutor shares a
       name with somebody in their booking. And a tutor's people column does not draw students at
       all, so there would be nothing to show it on. Admin-only until a booking carries ids. */
```

### ---------- WHEN THE FILMS WERE LAST FILLED FROM DRIVE, FOR THE ADMIN AND NOBODY ELSE

in `doGet`

```
/* ---------- WHEN THE FILMS WERE LAST FILLED FROM DRIVE, FOR THE ADMIN AND NOBODY ELSE ----------
       The videos card asks for a sync when this says never, or more than a day ago, or part-way
       (`filmsSyncDue_` in js/games.js). Absent rather than empty for everybody else: a student's
       payload has no key that says films exist. Laid on fresh like the films (`freshFor_`). */
```

### ---------- AND THE SHOP WINDOW, WHICH IS THE SAME LIST FOR EVERYBODY

in `doGet`

```
/* ---------- AND THE SHOP WINDOW, WHICH IS THE SAME LIST FOR EVERYBODY -------------------------
       NOT FILTERED BY PERSON, and that is the one line that makes it a spotlight rather than a
       favourite: `js/collections.js` opens with the argument — a favourite is a statement about
       you and a spotlight is a statement about the business, so it is one list, the same on every
       phone, and only an admin can change it.

       SENT AS THE BARE KEYS, the shape `adoptSpotlight_` already reads and the same shape
       `favourites` above goes in. Rows switched off are dropped here rather than on the phone:
       `on` is the admin's decision and the phone has no business re-deciding it.

       AN EMPTY ARRAY IS NOT THE SAME AS NO KEY, and `spotNow_` on the phone depends on the
       difference: a tab with rows is the authority, and a tab with none falls through to
       `data/settings/spotlight.json`. A `catch` that sent `[]` for a tab that FAILED would look
       exactly like a tab an admin had deliberately emptied — so it sends nothing at all, which is
       what `adoptSpotlight_` reads as "no answer" rather than as "none". */
```

### AND A TAB WITH NO ROWS SENDS NO KEY, because the filter below cannot tell "an admin switched the last one off" from "nobody has ever spotlit anything" — both

in `doGet`

```
/* AND A TAB WITH NO ROWS SENDS NO KEY, because the filter below cannot tell "an admin switched
       the last one off" from "nobody has ever spotlit anything" — both are `[]` once the off rows
       are dropped. The phone reads any array as the authority (see `spotNow_`), so an emptied window
       stays empty instead of falling through to the committed file and putting back what the admin
       had just taken out. A switched-off row is still a row, which is exactly what makes this work. */
```

### THE DAYS NOBODY IS TAUGHT — bank holidays, INSET days, a festive event.

in `doGet`

```
/* THE DAYS NOBODY IS TAUGHT — bank holidays, INSET days, a festive event. See `closures` in
       booking.gs: the phone's `computeSessionDates` steps over them, so a booking is priced on the
       sessions that will really run, and the Calendar marks them. Wrapped like the festive block: a
       holidays tab that cannot be read still leaves the computed bank holidays. */
```

### WHICH LOADING SPLASHES HAVE BEEN RETIRED.

in `doGet`

```
/* WHICH LOADING SPLASHES HAVE BEEN RETIRED. Sent as the ones that are OFF rather than the ones
       that are on, so a splash added in code and never entered in the sheet still appears — the
       sheet is a list of exceptions, not a whitelist somebody has to keep in step with the markup.
       Wrapped, because the tab may not exist until `?setup=1` has been run. */
```

### ---------- `splashes` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `splashes` IS READ OFF THE REPOSITORY NOW ----------------------------------------
       A LIST OF EXCEPTIONS RATHER THAN A WHITELIST, which is the shape worth keeping in the note:
       the tab named the splashes that are OFF, so one written in index.html and never entered in
       the sheet still appeared. `settingsInto_` builds `splashOff` from
       `data/settings/splashes.json` the same way — all 26 rows active, so the list is empty and
       every splash in the markup is in the pool. */
```

### WHATEVER CAMPAIGN IS RUNNING TODAY.

in `doGet`

```
/* WHATEVER CAMPAIGN IS RUNNING TODAY. Passed the viewer, because a campaign can be aimed at a
       role — a results-day message means nothing to a tutor — and filtering here rather than in the
       browser means an audience the viewer is not in never reaches them at all.

       WRAPPED, like the festive block above it. A campaigns tab that has not been created yet must
       not take the whole app down with it, and `?setup=1` may not have been run since this shipped. */
```

### ---------- FROM THE COMPUTED YEAR, NOT STRAIGHT OFF THE TAB

in `doGet`

```
/* ---------- FROM THE COMPUTED YEAR, NOT STRAIGHT OFF THE TAB ---------------------------------
       THIS READ THE TERMS TAB RAW, and that tab has four rows in it, two named the same thing, one
       ending before it starts. So a waiting list opened in August 2026 was offered "Summer 2 2027"
       as the term it was for — a year out, from data I audited as broken hours ago and then never
       connected to the thing that reads it.

       `termsFor` ALREADY SOLVES THIS and nothing was calling it: the sheet's rows where somebody
       has entered them, the computed school year everywhere else. One source, and a tab with four
       bad rows in it stops being able to send a booking a year into the future. */
```

### ---------- ONE OF EACH NAME, AND ONLY WHAT IS STILL TO COME

in `doGet`

```
/* ---------- ONE OF EACH NAME, AND ONLY WHAT IS STILL TO COME -------------------------------
       SENDING TWO SCHOOL YEARS SENT EVERY NAME TWICE — "Autumn 2" appeared for 2026 and again for
       2027 — and anything looking a term up by its name found the later one. A list opened in
       August 2026 came out as Autumn 2 running November 2027, a year and a bit out.

       Two years are still needed, because a list opened in July is for the September after it. But
       a term that has already ENDED cannot be booked, and the next twelve months is the only span
       anybody is booking in.

       AND DROPPING THE PAST ONES IS NOT ENOUGH, which this comment claimed for months. Measured
       against the real `schoolYear` on 25/09/2026, that filter alone keeps
       `Autumn 1 2026-09-07..2026-10-23` AND `Autumn 1 2027-09-06..2027-10-22`: the first has not
       ended and the second starts four days inside the cut-off. So the name went out twice for
       every autumn, and `bookSpec` — which FILTERS by name rather than finding — gave one ticked
       button two windows a year apart: eighteen sessions where there should have been six, and a
       card reading £1024.59 against £338. Reported from the live site.

       ONE ROW PER NAME, THE EARLIEST, which is what the sentence above always meant to say. The
       list is already chronological (this school year, then the next), so keeping the first is
       keeping the one somebody is about to be taught. The 370-day window stays as it is — a
       shorter one would drop July's list of the September after it, which is the case two years
       are here for. */
```

### WHERE IT SITS, worked out from the dates rather than typed.

in `doGet`

```
/* WHERE IT SITS, worked out from the dates rather than typed. A term is "next" because
           it starts after the one running now — that is a fact about today, and today moves.
           Typing it into a cell meant somebody re-typing four cells every half term, and the rows
           drifted out of step with their own dates the moment nobody did. */
```

### The OPERATING window, not the interval's own dates:

in `doGet`

```
/* The OPERATING window, not the interval's own dates: teaching runs in whole weeks from
           the first Monday to the last Sunday inside it. Sent computed so the site doesn't repeat
           the rule — the frontend having its own copy is why it once offered a different set of
           intervals from the backend.
           Computed ONCE now. operatingWindow was called five times per term for five fields, each
           re-deriving the same window from the same two cells. */
```

### ONLY a display_name somebody wrote.

in `doGet`

```
/* ONLY a display_name somebody wrote. Building one from term_name + relative_name meant
           the sheet's own bookkeeping — "Current Academic Interval - week" — went straight onto
           the booking form, and the site's tidier wording could never win because this was set. */
```

### ---------- `links` IS READ OFF THE REPOSITORY NOW

in `doGet`

```
/* ---------- `links` IS READ OFF THE REPOSITORY NOW -----------------------------------------
       THE BLOCK THAT WALKED THIS TAB STOOD HERE. `settingsInto_` in js/settings.js builds the same
       shape from `data/settings/links.json` — a faithful export of the tab it replaces, 679 rows and
       6,233 cells compared cell by cell against the workbook, 0 different. Nothing writes to it,
       nothing here computes with it, and the phone was its only reader.

       THE EMPTY DECLARATION IN THE PAYLOAD LITERAL STAYED, exactly as `boxers` and `fights` did when
       the library left: `check-payload.js` builds its "sent" set from this file alone, so dropping
       the key would have reported it read-and-never-sent — a true sentence about doget.gs and a
       false one about the app, which filled it from the repo.

       ---------- `links` IS NOT SENT AT ALL NOW ----------------------------------------------------
       THE OWNER ASKED FOR THE LINKS TO GO — *"Get rid of links that's almost redundant now"* — and
       the Links door on Find was the only reader of `DATA.links`. With it gone the empty declaration
       is the other half of the same sentence: a key sent and read by nothing, which `check-payload.js`
       lists as weight. So it left the literal in the same change, and the phone no longer fetches
       `data/settings/links.json` either. A backend that has not been synced yet still sends `[]`,
       which nothing reads — so the two can be deployed in either order. */
```

### The shop holds both kinds of stock, but wearables only exist as rows once they've been seeded — so a freshly deployed site showed one bike and nothing else

in `doGet`

```
/* The shop holds both kinds of stock, but wearables only exist as rows once they've been
       seeded — so a freshly deployed site showed one bike and nothing else, which looks exactly
       like the two kinds not sharing a nature after all.
       Seeding itself rather than waiting to be asked. Guarded on there being NO wearables at all,
       so deleting one doesn't bring it back on the next load; only an empty catalogue refills. */
```

### AND THIS ONE REBUILT THE WHOLE SCHEMA MID-PAYLOAD.

in `doGet`

```
/* AND THIS ONE REBUILT THE WHOLE SCHEMA MID-PAYLOAD.
       The condition is "the shop has no wearables in it", which stays true until the seeding
       works — so on a sheet where it cannot work, every single page load walked thirty tabs,
       appended columns, re-checked every header, gave four hundred resources an id and rewrote the
       options tab, in the middle of building a payload somebody was waiting for.

       `ensureSchema` was there because `seedAvatarItems` needs a `kind` column. That is a SETUP
       problem with a setup answer — `?setup=1`, which exists and says so — and taking seconds out
       of every visitor's load to solve it is paying the wrong person.

       THE SEEDING STAYS, because it is cheap and it fixes a real thing: a fresh sheet shows one
       bike and no wearables at all. It just no longer drags the schema along behind it, and it
       only runs when the column it needs is already there. */
```

### THE SAME THREE WORDS AS A RESOURCE.

in `doGet`

```
/* THE SAME THREE WORDS AS A RESOURCE. The sheet says `avatar`; everything downstream says
         `wearable`, because that is what it is to a person looking at one — and because a
         vocabulary that needs translating halfway along is two vocabularies.
         `kindRaw` keeps the sheet's own word, so the wardrobe code that filters on `avatar` and
         the shop editor that writes it are untouched. */
```

### Against the word that is now set, not the one that used to be.

in `doGet`

```
/* Against the word that is now set, not the one that used to be. `kind` became `wearable`
           two lines up and this still asked for `avatar`, so every wearable would have been priced
           in pounds. Caught by grepping for the old word rather than by anything failing — which
           is the whole risk in renaming a value that is compared in six places. */
```

### ---------- THE PAYLOAD SHAPE HAS NOT MOVED

in `doGet`

```
/* ---------- THE PAYLOAD SHAPE HAS NOT MOVED -------------------------------------------
           `price`, `unit`, `level`, `slot`, `artId`, `inStock` are what the phone has always read —
           the wardrobe, the shop list, the basket and the price rows all name them — so the merge
           is done HERE, on the way out, and not one line of frontend changed. The tab got wider;
           what leaves it is the same eight fields.

           WHICH PRICE, DECIDED BY `acquire` RATHER THAN GUESSED FROM THE KIND. Three columns hold
           three currencies and only one of them is filled on any given row, so the word that says
           how you get the thing is also the word that says which column to read. A wearable earned
           by levelling up has no price at all, which is why `level` sits beside it. */
```

### HOW YOU GET IT, SENT AS ITSELF TOO.

in `doGet`

```
/* HOW YOU GET IT, SENT AS ITSELF TOO. Nothing reads it yet; it is the one fact the merge
           added that the old two tabs could not express, and a column the payload drops is a column
           that may as well not be in the sheet — which is the fault this tab was merged to end. */
```

### questions -------------------------------------------------------------------------- ONE ROW PER PART, plus a stem row per question.

in `doGet`

```
/* --- questions --------------------------------------------------------------------------
       ONE ROW PER PART, plus a stem row per question. Sent as one flat list rather than nested
       under their papers, because the Find screen filters a flat list and nesting would mean
       flattening it again on the phone.

       ONLY IF THE TAB EXISTS. A sheet that has not had `?setup=1` run on it has no questions tab,
       and `read` on a missing tab throws — which would take the whole payload down and leave the
       app behind a splash for ever. The one thing worse than a missing feature is a missing app.

       `html` AND `lead` TRAVEL WHOLE. They are the question; there is nothing to summarise. */
```

### ---------- THE QUESTIONS COME FROM THE REPOSITORY NOW

in `doGet`

```
/* ---------- THE QUESTIONS COME FROM THE REPOSITORY NOW -------------------------------------
         `payload.questions` AND `dropdowns.checklists` WERE BUILT HERE and are built in
         `js/library.js` instead, out of `data/questions.json`. The push that was here is that file
         verbatim — moved, not copied: there is one implementation and it is the other one.

         WHY IT MOVED. `questions` is the one tab nobody hand-edits; it arrives in bulk and every
         edit to it went through an export, a CSV and two imports. A tab that only ever changes in
         bulk belongs where bulk changes are cheap and reviewable.

         WHAT THIS BUYS THE PHONE: 3.7 MB off every payload, and the file it replaces is cacheable
         by the browser where a payload never is. Two visits, one download.

         AND THE THREE COLUMNS THAT DID NOT GO. `ticks_1..3` held the handles of real children and
         the repository is public. They stay in the spreadsheet, and a tick is in any case a fact
         about a PERSON and a document — it belongs in Ledger, not in a library. */
```

### herd ------------------------------------------------------------------------------------ HERD MENTALITY'S QUESTIONS.

in `doGet`

```
/* --- herd ------------------------------------------------------------------------------------
       HERD MENTALITY'S QUESTIONS. Same `try` as the questions above and for the same reason: a sheet
       that has not had `?setup=1` run on it has no herd tab, `read` on a missing tab throws, and one
       missing party game must never take the whole payload down with it. The game keeps its own
       twenty questions, so an empty list here costs nothing. */
```

### The nest the checklist needs:

in `doGet`

```
/* The nest the checklist needs: subject, then band, then topics. The SHOP screen wants them
       flat and flattens them itself on the phone — carrying the same four hundred rows twice to
       satisfy both would be a waste of every phone's morning. */
```

### THE CHECKLISTS MOVED WITH THEM — see the note above and `libraryInto_` in js/library.js.

in `doGet`

```
/* THE CHECKLISTS MOVED WITH THEM — see the note above and `libraryInto_` in js/library.js.
       `dropdowns.topics` and `dropdowns.checklists` are still the shape everything downstream
       expects; they are just assembled on the phone from a file rather than here from a tab. */
```

### ---------- WHAT A STRANGER MAY SEE OF SOMEBODY ELSE'S BOOKING

in `doGet`

```
/* ---------- WHAT A STRANGER MAY SEE OF SOMEBODY ELSE'S BOOKING ---------------------------
         EVERY SIGNED-IN PERSON HAS BEEN SENT EVERY JOB, with the roster on it — so a family could
         read who else was being taught, when, and where. That was true before anybody could join;
         adding a way in would have made it a feature rather than an oversight.

         Three cases:
           YOURS, or one you teach — everything, as before.
           OPEN, and not yours — the shape of it: subject, level, when, where, what it costs, how
                 many seats are going. Enough to decide whether to ask, and not one name.
           NOT OPEN, and not yours — not sent at all. A booking that is not on offer is nobody's
                 business but the family's and yours.

         An admin sees the lot, because somebody has to. */
```

### ---------- WHO MAY SEE WHICH FIGURE, DECIDED HERE AND NOWHERE ELSE

in `doGet`

```
/* ---------- WHO MAY SEE WHICH FIGURE, DECIDED HERE AND NOWHERE ELSE --------------------------
         ASKED FOR AS *"for tutor they shouldnt see grand total client pays, only grand total they
         earn. admin should be able to see grand total client pays. total tutor earns, and how much
         admin earns."* Hiding a figure on the phone and shipping it anyway is a filter anybody reads
         past with the network tab open — this payload goes to whoever asks — so each figure is SENT
         only to the people allowed it, and `jobMoney_` on the phone draws whatever arrived.

           `price`       — everybody it was sent to before, EXCEPT a tutor on the job who is not also
                           a client on it (an admin who teaches still gets it, as an admin)
           `tutorPay`    — the tutors on the job's own roster, and an admin
           `adminKeeps`  — an admin, and nobody else

         ON THE ROSTER, NOT ON THE NAME: against the name the token resolved to, exactly as `iAmIn`
         two lines up. A tutor who has only APPLIED is on it too, and seeing what the session would
         pay is the half of applying that matters to them. A blank cell stays blank — `tutor_pay`
         was written empty on every job before the phone started sending it, and `N('')` is a
         nought that would tell a tutor they earn nothing. */
```

### WHICH KIND OF THING THIS IS, and it was not being sent at all.

in `doGet`

```
/* WHICH KIND OF THING THIS IS, and it was not being sent at all. `kind` has been on the jobs
           tab since the waitlist was built and the payload never carried it — so every waitlist
           arrived at the phone indistinguishable from an ordinary booking. The card drew as an
           application, the join button offered to ask the family who booked it, and the seat price
           never came into it. The column existed, the handler existed, and the one line joining
           them did not.
           Blank means an ordinary session, the same way it does in the sheet. */
```

### AND WHAT A SEAT COSTS, for a class.

in `doGet`

```
/* AND WHAT A SEAT COSTS, for a class. `price_total` on a waitlist holds the PER-SEAT figure
           — see `joinWaitlist` — so somebody looking at a class they have not joined can be shown
           what joining would cost before they decide. */
```

### WHEN THE PEOPLE ON THE LIST CAN COME, gathered and counted — see `waitlistWhen`.

in `doGet`

```
/* WHEN THE PEOPLE ON THE LIST CAN COME, gathered and counted — see `waitlistWhen`. Each
           family answered for THEMSELVES when they joined, and until now those answers sat in four
           separate event messages that nothing read back. The one question a tutor has to answer
           is what day suits everybody, and it could only be answered by reading the log by hand.

           ONLY FOR A WAITING LIST, and only computed for one: an ordinary session already has a
           day, so there is nothing to work out and no reason to walk its events on every load. */
```

### WHAT A SEAT COSTS. A class row carried no price at all — so the card read `j.price`, found nothing, and printed "Your seat £0.00" on a list that is priced

in `doGet`

```
/* WHAT A SEAT COSTS. A class row carried no price at all — so the card read `j.price`,
           found nothing, and printed "Your seat  £0.00" on a list that is priced perfectly well in
           the sheet. `price_total` on a waitlist holds the PER-SEAT figure, deliberately, which is
           exactly what a seat costs and exactly what this row wants. */
```

### ---------- WHEN IT WAS ASKED FOR, WHICH HAS BEEN WRITTEN AND NEVER SENT

in `doGet`

```
/* ---------- WHEN IT WAS ASKED FOR, WHICH HAS BEEN WRITTEN AND NEVER SENT ------------------
           `created_at` IS ON THE JOBS TAB and three handlers write it — `createJob`, `joinWaitlist`
           and `openWaitlist`. Nothing has ever read it back. `jobRows` on the phone has an
           `if (j.createdAt) push('Asked for', …)` that could not fire, so a row this repository
           argued about at length — `check-flow.js` refused to let it be dropped — has never once
           been drawn on a receipt.

           That is the shape recorded here under `figure`, under `orderPrints`, under the four
           message actions and under `exam_date`: a column written and never read. It has a reader
           now, because `Requested` is the first of the five stage ticks and this is the date beside
           it. `check-payload.js` cannot see this class of fault and says so — it compares top-level
           `DATA.*` keys, and a field inside a row that nothing reads is invisible to it. */
```

### ---------- WHOSE BOOKING IT IS, SAID PLAINLY

in `doGet`

```
/* ---------- WHOSE BOOKING IT IS, SAID PLAINLY ------------------------------------------
           `myJobs_` ON THE PHONE FILTERS ON `j.client` AND `j.tutor`, AND NEITHER WAS EVER SENT.
           Both are known here — `cs` and `ts` are the roster, read off the events tab — and the
           payload carried the roster while never naming the two people the phone actually asks
           about. So every session a family booked arrived, was tested against two undefined
           fields, failed both, and fell into `openJobs_` as somebody else's: no Classes answer, no
           row in Your sessions, nothing on the week grid. The job was there the whole time and no
           filter could recognise it.

           `iAmIn` GUARDS THEM, like `forChildren` and `slots` two lines up. Somebody looking at an
           open class they are not in still may not learn who is in it — the name is only sent to
           the people already on the roster and to an admin.

           FIRST CLIENT, because that is what the phone compares against and a session has one
           household paying for it. The full roster is in `slots` for anything that needs all of
           them. */
```

### ---------- WHO BOOKS THE ROOM, WHICH THE RECEIPT HAS BEEN ANSWERING FOR ITSELF

in `doGet`

```
/* ---------- WHO BOOKS THE ROOM, WHICH THE RECEIPT HAS BEEN ANSWERING FOR ITSELF ----------
           `jobRows` DRAWS `Host` FROM `j.clientHosts` AND THIS HAS NEVER SENT IT, so
           `TRUEish_(undefined)` is false and every receipt ever handed over said **"We book the
           room"** — including to the families who host at home, which is the opposite of true and
           is a line about who is responsible for a venue. The column is `client_hosts` on the jobs
           tab and the form has asked the question since it was written. */
```

### ---------- AND WHO THE BOOKING IS SPLIT WITH, TO THE PERSON WHO CHOSE THEM

in `doGet`

```
/* ---------- AND WHO THE BOOKING IS SPLIT WITH, TO THE PERSON WHO CHOSE THEM -------------
           SAME SHAPE, AND IT WAS SAYING SOMETHING WRONG RATHER THAN NOTHING. `Sharing` reads
           `j.splitEmails || 'Just you'`, so a session split three ways printed **"Just you"**.

           NARROWER THAN `iAmIn`, DELIBERATELY. These are addresses the BOOKER typed in — the
           people they invited — and `iAmIn` is the whole roster, so on a shared class it would
           hand one family the e-mail addresses another family chose. The booker is `cs[0]`, which
           is the same seat `client` above is taken from, and an admin sees the lot because
           somebody has to. */
```

### ---------- THE LOG, TO THE PEOPLE ON IT (342, the review)

in `doGet`

```
/* ---------- THE LOG, TO THE PEOPLE ON IT (342, the review) ---------------------------------------
           IT WENT TO EVERYBODY THE JOB WAS SENT TO, an open class's strangers included — so every
           family's name was in `actor` and in the messages, three lines below the `slots` that blank
           them ("NO NAMES TO SOMEBODY WHO IS NOT IN IT"), and a festive join's typed list of children
           with them. `iAmIn`, the slots' own test: the people on the job and an admin. The phone reads
           it only for the dates beside a booking's stage ticks (`evAt_`, book.js), which is a document
           only somebody on the booking is shown. */
```

### THE KEY THE SITE ACTUALLY ASKS FOR.

in `doGet`

```
/* THE KEY THE SITE ACTUALLY ASKS FOR. `script.js` reads `DATA.liveJobs` and `DATA.jobs`, and
       this has only ever sent `clientClasses` — so the Book screen read a key nothing sends and
       showed "No sessions yet" whatever was in the tab. The same one-line-per-key fault as
       `resources` and `gallery`, and the same fix.
       The same array under all three names rather than a copy: they are one list, and two copies
       drifting apart is a worse problem than a long name. */
```

### ---------- KEPT, AND THEN SENT

in `doGet`

```
/* ---------- KEPT, AND THEN SENT --------------------------------------------------------------
       SERIALISED ONCE. `jsonOut` would stringify this again, and the point of storing the finished
       body is that it is finished — so the body is built here, put away, and handed to `jsonRaw_`,
       which is the same wrapper `jsonOut` ends with.

       THE FIRST REQUEST AFTER A DEPLOY OR A WRITE STILL PAYS THE FULL PRICE, and there is no way
       round that short of building it before anybody asks. What changes is that it is paid once
       rather than by everybody. */
```

### ---------- WITHOUT `submissions` OR THE FILMS, WHICH GO ON FRESH EVERY TIME

in `doGet`

```
/* ---------- WITHOUT `submissions` OR THE FILMS, WHICH GO ON FRESH EVERY TIME --------------------------
       The stored copy leaves out the one key a child changes every evening, so `submitAnswer` has nothing
       to retire — see `payloadWithFresh_`. AND THE FILMS, for the same reason from the other side: a
       sync from Drive writes the films tab, and with the films in the stored body every write it made
       would retire the admin's payload and cost them the fifteen-to-thirty-five-second rebuild for a
       list they already had in the sync's own reply. Everything else in the body is exactly as before. */
```

### ---------- `payload.family`, BUILT FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY

top level, before `familyOf_`

```
/* ---------- `payload.family`, BUILT FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY ---------------------------
   `{ familyFor, family }` — the person's own accepted family, both directions, and the id it was built
   for. It was written inline in `doGet`; it is a function so `loginReplyFor_` can send the same list in
   the same shape with "Signed in" rather than fifteen seconds later — see the note there. The rules are
   the block's in `doGet` ("YOUR OWN FAMILY"), unchanged. */
```

### THE FIGURE, ONLY WHEN IT IS THE FACE (`faceFig_`).

in `famCard_`

```
/* THE FIGURE, ONLY WHEN IT IS THE FACE (`faceFig_`). Your family is already sent each other's
       picture, so a child who chose their figure is drawn as it on their parent's column and
       nothing about them reaches anybody who could not already see their face. */
```

### WHOSE FAMILY THIS IS, said in the payload.

in `familyOf_`

```
/* WHOSE FAMILY THIS IS, said in the payload. The phone keeps `DATA` across a sign-out and
     paints the next person's account before their own payload lands — so without this a phone
     handed from one family to another drew the first family's children under "Your child" on
     the second person's column, for as long as the new payload took, or for ever if it failed. */
```

### ---------- AND YOUR BROTHERS AND SISTERS

in `familyOf_`

```
/* ---------- AND YOUR BROTHERS AND SISTERS ----------------------------------------------------
     ASKED FOR AS *"students should be able to see their parents and siblings likewise"*. The
     first half of that sentence was built (parents and children, above) and the second was not,
     though `siblingsOf` has existed all along and `payload.students[].siblings` has carried the
     NAMES — to every student, read by nothing on the phone.

     A SIBLING IS ANOTHER CHILD OF A PARENT YOU HAVE ACCEPTED, and `siblingsOf` walks
     `acceptedLinks()` both steps, so the rule above holds for the second step too: a parent's
     unanswered "this is my child" about somebody else makes them nobody's brother. Two children
     who share no ACCEPTED parent are strangers here, whatever their surnames say.

     SAME CARD, SAME FIELDS, SAME STAMP — `famCard_` is the public half and nothing more, and
     `familyFor` above covers this list because it is the same list. */
```

### ---------- THE STORED BODY, WITH THIS VIEWER'S SUBMISSIONS (AND AN ADMIN'S FILMS) LAID ON

top level, before `submissionsNow_`

```
/* ---------- THE STORED BODY, WITH THIS VIEWER'S SUBMISSIONS (AND AN ADMIN'S FILMS) LAID ON -------------------
   `submissions` IS THE ONE KEY OF THE PAYLOAD THAT A CHILD CHANGES EVERY EVENING, and it changes only for
   that child and an admin. Its forerunner `attempts` was inside the stored body once, so every `markDone`
   threw that child's whole body away (`retirePayloadOf_`) and their next load anywhere — a sign-in on the
   iPad, the computer at home — was the fifteen-to-thirty-five-second rebuild. So the stored body leaves
   it out and every answer, hit or miss, has it added fresh for the person the TOKEN resolved to.

   `body` is the stored JSON text, which always ends in `}` and always has keys before it; the keys go
   on the end, and `cached` after them when the body came from the store. Built from the same
   `submissionsFor_` and `filmsFor_` either way, so a hit and a miss cannot disagree.

   ---------- AND THE FILMS, WHICH A SYNC FROM DRIVE CHANGES WHILE THE ADMIN WATCHES ----------------
   *"Let admin be able to search up films which are in the notflix folder"* — and the sync that fills
   the tab is pressed from the very card that shows it. Left in the stored body, every sync would have
   to retire the admin's payload (a cold rebuild) or leave it saying the old list for six hours. So the
   films are this function's second key: `[]` for everybody, read only for an admin, and for an admin
   `filmsSync` beside them — the stamp of the last whole pass, which no other payload carries at all. */
```

### ---------- `payload.films`, FOR AN ADMIN AND AN EMPTY LIST FOR EVERYBODY ELSE

top level, before `filmsFor_`

```
/* ---------- `payload.films`, FOR AN ADMIN AND AN EMPTY LIST FOR EVERYBODY ELSE ------------------------
   THE GUARD IS THE FIRST LINE, so the tab is never opened for anybody else — note 068's rule that the
   gate is the read and not a filter after it. `drive_id` is not sent (the note in `doGet`).

   `active` IS READ THE WAY EVERY OTHER `active` IN THIS PROJECT IS READ NOW: blank is on (`ON_`). It
   was `TRUE_`, so a row typed by hand with the cell left empty vanished from the admin's search
   without a word, while `data/videos.json` beside it treated a blank as on. The sync writes TRUE or
   FALSE on every row it owns, so the difference only ever reached the rows a person typed. */
```

### ---------- WHAT THE LAST SYNC FROM DRIVE SAYS, FOR THE ADMIN'S CARD

top level, before `filmsSyncSays_`

```
/* ---------- WHAT THE LAST SYNC FROM DRIVE SAYS, FOR THE ADMIN'S CARD ------------------------------------
   `at` — the end of the last WHOLE pass, or '' for never. `more` — a pass is part-way, and the next
   run carries on from where it stopped. `folder` — the folder's NAME, never its id. `found` — what was
   in it, by kind, as counts. Read from Script Properties, which is where `filmsSync_` keeps its place. */
```

### ---------- `payload.submissions`, BUILT FOR ONE VIEWER

top level, before `submissionsStamp_`

```
/* ---------- `payload.submissions`, BUILT FOR ONE VIEWER ---------------------------------------------
   `{ for, mine: { <key>: { answer, verdict, at, id } }, people? }` — see the block in `doGet` that calls
   this for who gets what. `mine` is the LATEST submission per question: the row with the latest
   `pressed_at` (the moment the child pressed, never later than the server's clock — SCHEMA.submissions
   says why it is not the moment the press ARRIVED), `submitted_at` where a row has none, and of two in
   the same instant the later row. `at` is that time in ms, `id` the press's own name, which the phone
   compares with what it sent itself. `people` is `{ <person_id>: { n, last } }` — how many questions and
   the London day of the last submission to arrive (a row carried over from before the switch, by the day
   it was pressed) — and exists only for an admin, so its absence is what every other phone sees.

   ---------- AND NOT A READ OF THE WHOLE TAB ON EVERY LOAD -------------------------------------------
   THIS IS ON EVERY `doGet`, hit or miss, for everybody signed in, and the tab grows by a row a press —
   each row holding a question's words, up to `ATTEMPT_WORDS_MAX`. `attempts` grew by a row a QUESTION
   and was read whole each time; read the same way, a term of presses would be megabytes read for every
   page anybody opens. So each person's `mine` (and the admin's `people`) is kept in CacheService
   (`cacheGet_` / `cachePut_`, the payload's own chunked store) under the payload's generation, the
   backend's version and a STAMP — the time that person last sent anything, a Script Property that
   `submitAnswer` moves after its rows are flushed (`submissionsTouched_`). An edit typed into the sheet
   (`onSheetChange` bumps the generation), a deploy or a press each make a new key, and the next load
   reads the tab once and keeps it. So the tab is read once per person per press, not once per page.

   A STAMP AND NOT A `remove`. Removing the entry when a press was written leaves a race: a load that
   read the tab a moment BEFORE the write puts its copy back a moment AFTER the remove, and that copy —
   without the press — is served for six hours. Under a new key the late copy lands where nobody looks. */
```

### ONE READ OF THE TAB, SHAPED BOTH WAYS — this person's latest per key, and everybody's summary.

top level, before `submissionsBuild_`

```
/* ONE READ OF THE TAB, SHAPED BOTH WAYS — this person's latest per key, and everybody's summary. NOT OF
   EVERY COLUMN (review of 9 Oct): `label` and `words` — the name and the paragraph a parent's email
   prints, repeated on every press — are most of the tab's bytes and nothing here reads them, so only
   the seven columns this needs are fetched (`readCols_`). */
```

### A ROW CARRIED OVER FROM BEFORE THE SWITCH ARRIVED THE DAY THE BACKEND LANDED and was done weeks before:

in `submissionsBuild_`

```
/* A ROW CARRIED OVER FROM BEFORE THE SWITCH ARRIVED THE DAY THE BACKEND LANDED and was done weeks before:
         dated by its arrival, every learner's "last" moved to that day. By when it was pressed
         (`SUBMISSION_CARRIED`, review of 10 Oct). */
```

### THE KEYS ONCE, BEFORE THE TAB IS READ — the stamp read after the read could be a press newer than what was read, and the copy would be filed under it.

in `submissionsFor_`

```
/* THE KEYS ONCE, BEFORE THE TAB IS READ — the stamp read after the read could be a press newer than
     what was read, and the copy would be filed under it. Read before, a press that lands during the read
     moves the stamp past this key, and the next load reads again. */
```

