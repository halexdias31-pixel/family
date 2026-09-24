/* ==================================================================================================
   @family. — 00_constants.gs   (1 of 8)

   EVERY TOP-LEVEL VALUE, IN ONE FILE AND IN THE ORIGINAL ORDER.

   THIS IS THE ONE RULE THE SPLIT DEPENDS ON, and it is not tidiness. Apps Script concatenates
   every .gs file into a single global scope before anything runs, and the ORDER it does that in
   is not something you control reliably. A `function` declaration is hoisted, so it can be called
   from any file whatever the order. A top-level `const` is NOT: it is evaluated in file order, and
   read before its own line it throws.

   Several of these are computed at load time — `PROFILE_EDITABLE` calls `flat()`, `PROFILE_GROUPS`
   calls `AVAIL_DAYS.reduce()`, `VENUE_EDITABLE` calls both. Split those across files and a file
   order you did not choose is a dead site with an error nobody can place.

   Keep them all here, in this order, and order stops mattering for ever. Every other file in this
   project contains function declarations and nothing else.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */

/* =============================================================================================
   @family. — backend  (hermes)
   Rewritten against the eleven-tab database. Paste over the whole Apps Script file.
   ---------------------------------------------------------------------------------------------
   WHAT CHANGED FROM THE FLAT-SHEET VERSION, and why it's shorter:

   • No col(), no COLUMN_ALIASES, no writeCell, no checkColumns. A row is an OBJECT with named
     fields — r.first_name, r.rate_per_hour — because the headers are now clean enough to use
     directly. Fifteen aliases existed to paper over names like `child_first_name_&_last_initial`
     and `day` vs `days`; the names are fixed, so the shims are deleted.

   • No stale-snapshot class of bug. Every write goes through setCell(), which updates the cell
     AND the in-memory object, so read-after-write inside one request sees the truth. That single
     omission was why a withdrawal could clear the last client and still count them present.

   • Reads are per-tab, not per-sheet. Touching one job used to read 1,277 x 284 cells. Now it
     reads the `jobs` tab, which has as many rows as you have jobs.

   • Validations aren't scanned at all. `options` IS the dropdown list, read as data.
     rebuildValidations() and its 318,000-object scan are gone.

   THE ONE INVARIANT that drives the booking flow, unchanged:
     at most ONE side of a pair is `Requested` at a time. Whoever is Requested is waiting; the
     other side holds the move. Possession is therefore never stored.
============================================================================================= */

/* ==================================================================================================
   BOTH OF THESE IDS POINTED AT AN .xlsx AND `SpreadsheetApp` CANNOT OPEN ONE.

   THE SYMPTOM WAS EVERY SECTION EMPTY, WHICH IS ALSO THE SYMPTOM OF A BLANK DATABASE. The comment
   below used to say "if every section ever loads empty, this line is the first thing to check", and
   it was right, and the line was wrong:

     was  1WeY0AD7dEzpKKDzndqEl4bAyahI6AgrW   businessDB.xlsx   an Excel UPLOAD
     is   1bashNkVQSyMfsJeGDSQNYY9QN5Troy2quHNx_qKUi7s          the Google Sheet

   `SpreadsheetApp.openById` opens Google Sheets. An .xlsx sitting in Drive is a FILE in Drive — it
   has an id, it has the same title, it opens in the browser when you click it, and Apps Script
   cannot read a cell of it. Both files exist, both are called the same thing, both are owned by the
   same person, and the one the code named was the one that cannot be opened.

   THAT IS WHY IT LOOKED LIKE THE QUESTIONS WERE MISSING. They are not: `questions` in SubjectsDB has
   the real Edexcel papers in it, stems and parts and mark schemes, and has had for a while. Nothing
   was ever reading the file they are in.

   HOW TO TELL THEM APART, since the URL does not: a Google Sheet lives at
   `docs.google.com/spreadsheets/d/<id>/edit` and an uploaded .xlsx at `drive.google.com/file/d/<id>`.
   If the address says `file/d`, Apps Script cannot open it, whatever the title says.
================================================================================================== */
const LEDGER_ID = "1l26ZSHC5DDvsP-tBkAhxs8blRKjAtuV5Y2g0D4s1Gbo";

/* ==================================================================================================
   THE OTHER TWO FILES, AND WHY THERE ARE THREE OF THEM.

   IT WAS FOUR SPREADSHEETS AND THE SPLIT WAS BY SUBJECT MATTER: businessDB held forty tabs of
   everything, SubjectsDB held the content, and Widget_Settings and Engine held notes. That split
   could not be checked by anything. Nobody could say where a tab belonged without knowing the
   history, so `kinds` existed in two files with two different column sets, `widgets` did too, and
   the live copy of each was the EMPTY one.

   IT IS NOW THREE FILES AND THE SPLIT IS BY WHO WRITES THE ROWS, which is a question with one
   answer per tab:

     ledger    the app writes it.   people, jobs, receipts, posts, ticks — the business as it
                                    happened. Hand-editing these races doPost.
     settings  you write it, the app reads it. brand, config, pricing, venues, facets — editorial.
                                    Changing any of it is a cell, never a deploy.
     library   IT IS TWO FILES NOW. `Library` held four tabs and the code reads none of them:
                                    questions, cheatsheet, boxers and fights are all files in the
                                    repository, read by js/library.js. The third id is gone from
                                    FILES below rather than left blank, because a blank id is a
                                    file `installSheetWatch` still books a trigger against.

   THAT IS WHY THE TAB COLOURS IN EACH FILE SAY THE SAME THING: green written by the app, gold read
   by it, grey read by nobody. A tab whose colour and whose file disagree is a mistake you can see
   without opening it.

   ALL THREE ARE GOOGLE SHEETS AND THAT IS LOAD-BEARING — see the note on LEDGER_ID above. The four
   they replace are in a folder called `old sheets`; moving a file in Drive does not change its id,
   so those ids still resolve and the old data is still there if any of this turns out wrong.
================================================================================================== */
/* ---------- `SETTINGS_ID` WAS HERE, AND THERE ARE TWO SPREADSHEETS NOW --------------------------
   SEVEN TABS MOVED INTO `Ledger` AND NINE WERE DELETED. The seven are the ones this backend still
   COMPUTES with rather than forwards — `config`, `pricing` and `venues` decide a price, and a total
   posted by a browser is a total the client chose; `options`, `shop`, `holidays` and `landmarks`
   are each reshaped by a function here before anybody sees them. The nine that went are the ones
   `js/settings.js` reads straight out of `data/settings/*.json`.

   THE ID IS NOT DELETED FOR SECRECY — it names a file that no longer exists. Leaving it would have
   been worse than untidy: `ensureSchema` calls `SpreadsheetApp.openById(at.id)` with no `try`
   around it, so one tab still routed at a binned file takes the whole of `?setup=1` down — and
   `?setup=1` is the only thing that creates `post_comments`. Found by reading that function while
   checking whether the spreadsheet was safe to delete, which is the only reason it is not a live
   site with a broken setup route. It is wrapped now as well, because the rule is the fix. */
/* `LIBRARY_ID` WAS HERE. The id itself is not secret — every Drive link in the library is
   already public and already served to anonymous visitors — but a constant nothing reads is a
   thing the next reader has to work out the status of, and this one would read as "there is a
   third database" when there is not. The spreadsheet still exists; nothing in this project
   opens it. */

/* `installSheetWatch` walks this to put an edit trigger on every file, so a fourth database is one
   line here and nothing else. A BLANK ID IS NOT AN ERROR — it is that file's tabs coming back
   empty, the same as a tab that is not there, and `checkTabs()` says which. */
const FILES = { ledger: LEDGER_ID };

/* ---------- WHICH FILE EACH TAB IS IN -------------------------------------------------------------
   EVERY TAB IS LISTED, and that is the change. This was two maps — `HERE` for renamed tabs in the
   main file, `ELSEWHERE` for the four that had moved — and everything absent from both fell through
   to the main file by default. A default is fine until there is no main file, and with three there
   is not: a typo'd key, or a new tab nobody routed, would have silently resolved to the ledger and
   come back empty, which reads exactly like an empty database. `checkTabs()` now reports a tab in
   SCHEMA with no line here, because "I did not look" must not print as "I looked and it was fine".

   NOTHING ELSE IN THE CODE KNOWS WHERE A TAB LIVES, which is the point of doing it in one place.
   Every tab is reached through `read(name)`, so this one lookup covers the pricing, the venues and
   the facets alike. They still ask for `venues`; they just get it from wherever this says.

   `alsoTry` IS A SECOND TAB NAME to look under, tried after the code's own name, so renaming a tab
   in the spreadsheet never has to be atomic with a deploy. The two below are both satisfied by the
   current files and are kept anyway: they cost one word each and they are what makes reverting to
   the old spreadsheets a change of three ids rather than a change of three ids and two tab names.
   `make` — the name used if a tab has to be CREATED — is always the plain one, so nothing new is
   ever born under an alias. */
const WHERE = {
  /* ---- the app writes these ---- */
  people:         { file: 'ledger' },
  family:         { file: 'ledger' },
  jobs:           { file: 'ledger' },
  events:         { file: 'ledger' },
  receipts:       { file: 'ledger' },
  orders:         { file: 'ledger' },
  invites:        { file: 'ledger' },
  messages:       { file: 'ledger' },
  exams:          { file: 'ledger' },
  posts:          { file: 'ledger' },
  post_likes:     { file: 'ledger' },
  post_votes:     { file: 'ledger' },
  post_comments:  { file: 'ledger' },
  post_reactions: { file: 'ledger' },
  favourites:     { file: 'ledger' },
  /* ---------- THE FILMS, AND WHY THEY ARE IN `Ledger` RATHER THAN IN THE REPOSITORY ------------
     THE OWNER'S OWN SENTENCE WAS "i dont want people to be able to see them", and CLAUDE.md's
     first question about where a thing lives answers it before any of the others get a turn: is
     it secret -> a sheet, never here. That repository is PUBLIC and git history is permanent, so
     a `data/films.json` would publish both the list and the Drive ids in it, for ever, with no
     way to take it back. The Drive folder is already shared `anyone: reader`, which makes the ids
     the whole of the protection — publishing them turns "anyone with the link" into "anyone".

     AND A TAB IN A PRIVATE SHEET IS STILL NOT HIDDEN BY ITSELF. `doGet` serves
     `ANYONE_ANONYMOUS`, so a tab the backend forwards lands in every visitor's JSON whether or
     not a screen draws it. See where this is read in `doget.gs`: it is gated on the viewer, not
     on the renderer. */
  films:          { file: 'ledger' },

  /* ---- you write these, the app reads them ---- */
  config:         { file: 'ledger' },
  options:        { file: 'ledger' },
  pricing:        { file: 'ledger' },
  shop:           { file: 'ledger', alsoTry: 'items&shop' },
  terms:          { file: 'ledger' },
  widgets:        { file: 'ledger' },
  venues:         { file: 'ledger' },
  rooms:          { file: 'ledger' },
  trips:          { file: 'ledger' },
  holidays:       { file: 'ledger' },
  landmarks:      { file: 'ledger' },
  landmark_parts: { file: 'ledger' },
  map:            { file: 'ledger' },
  herd:           { file: 'ledger' },

  /* ---- subject content, edited in bulk ---- */
  /* NOTHING IS ROUTED HERE ANY MORE, and the section is kept so that is visible rather than
     merely absent. `questions` went first — 4,807 rows to `data/questions.json` — and
     `cheatsheet`, `boxers` and `fights` have followed, so the `Library` spreadsheet has no tab
     this code reads and `LIBRARY_ID` is gone from `FILES` above. An unrouted name resolves to a
     blank id, which `read` cannot tell from an empty tab, so leaving any of these lines in would
     have been four tabs nothing fills, read on every load, for ever. */
};
/* WHO GETS TOLD when something needs doing by hand. A name rather than an address, because
   notify() looks the address up on the people tab — so changing your email is one cell, not a
   redeploy.

   NOT NECESSARILY A PERSON. If the business account is the admin and the people behind it are
   tutors, this is "@family." and the address on that row is where the printing lists and the
   reported messages go. `adminEmail()` below is what actually resolves it, and it falls back to
   any admin who has an address — because a hard-coded name that no longer holds the admin role,
   or has no email on its row, means every notification this system sends is discarded in silence.
   That is the failure the health check already reports for nine of fifteen people. */
const ADMIN_NAME = "@family.";

/* Bumped on every paste that changes behaviour. It is the ONLY way to tell from the outside
   whether a deploy landed — open the /exec URL and read the first field. Two different files
   sharing a version string is two files you cannot tell apart, which is how a redeploy comes to
   look like it did nothing. */
const BACKEND_VERSION = "2026-09-24-b-library-card";
const SITE_URL = "https://halexdias31-pixel.github.io/family/";

const TAB = {
  people: 'people', venues: 'venues', jobs: 'jobs', events: 'events', terms: 'terms',
  /* `resources` WAS HERE, then `questions` was. Both are gone: the documents and the questions
     inside them are one table, and that table is `data/questions.json` in this repository now. */
  shop: 'shop', pricing: 'pricing',
  config: 'config', options: 'options', trips: 'trips', rooms: 'rooms', invites: 'invites',
  exams: 'exams', orders: 'orders', messages: 'messages', widgets: 'widgets',
  herd: 'herd',
  /* The map's own geometry, fetched from OpenStreetMap and kept. Not a tab anybody types into —
     see `fetchMap`. */
  map: 'map',
  /* Every receipt ever issued, kept as it was issued. See the schema below. */
  receipts: 'receipts',
  /* Buildings measured by hand off satellite imagery. See the schema below. */
  landmarks: 'landmarks',
  /* The pieces each landmark is made of — see SCHEMA.landmark_parts. */
  landmarkParts: 'landmark_parts',
  /* The calendar of festivals, as rules rather than dates — see the schema. */
  holidays: 'holidays',
  /* When a particular message is worth putting out — see SCHEMA.campaigns. */
  /* The words those campaigns say, one line per row — see SCHEMA.copy. */
  /* What the search funnel asks, in what order, and what it calls things — see SCHEMA.facets. */
  /* What the funnel's first two questions ANSWER — see SCHEMA.kinds. */
  /* Who starred what — see SCHEMA.favourites. */
  favourites: 'favourites',
  /* `questions`, `boxers` AND `fights` WERE HERE. All three tabs are gone — see the notes where
     their SCHEMA entries used to be. */
  /* Which loading splashes are in the pool — see SCHEMA.splashes. */
  /* `cheatsheet` WAS HERE. Gone the same way — see the note where SCHEMA.cheatsheet used to be. */
  /* What the Reels column shows. One row is one slide: a subject, a heading, a line or two, and a
     few words to find a photograph by — see SCHEMA.facts. */
  films: 'films',
  posts: 'posts', post_likes: 'post_likes', post_votes: 'post_votes',
  post_reactions: 'post_reactions', post_comments: 'post_comments',
  family: 'family'
};


/* ---------- SCHEMA, AND KEEPING IT IN STEP ---------------------------------------------------
   The shape of every tab, so the sheet can be brought up to date IN PLACE. This exists because
   re-uploading a spreadsheet gives it a new file id, which means editing an id in FILES and
   redeploying every single time — a change to one column costing two config edits.

   Run ensureSchema() instead:
     • a missing tab is created with its headers
     • a missing column is APPENDED to an existing tab
     • nothing is ever renamed, reordered or deleted, so your data can't be harmed
   It's idempotent — running it twice does nothing the second time. Run it from the editor, or
   load /exec?setup=1.
---------------------------------------------------------------------------------------------- */
const SCHEMA = {
  people: [
    "person_id", "role", "first_name", "last_name",
    "full_name", "handle", "username", "pin",
    /* WHEN THE HANDLE LAST MOVED, AND WHAT IT WAS. `changeHandle` writes both.

       `handle_changed_at` IS THE COOLDOWN'S ONLY STATE — no counter, no log, one date, so the rule
       is "has a month passed" rather than a tally somebody has to keep in step.

       `handle_was` IS A SAFEGUARDING COLUMN AND NOT A NICETY. This is a tutoring business and most
       of the people in this tab are children. A rename that leaves no trace means an admin cannot
       answer "who was @foo last week" — which is the question that gets asked exactly once, about
       the one account it matters for. One cell, the previous handle, overwritten each time. */
    "handle_changed_at", "handle_was",
    "email", "phone", "date_of_birth", "account_number", "sort_code",
    "verified", "verify_token", "details_confirmed", "listed",
    /* WHERE THEY CAME FROM. Recorded once, when the account is made, and never changed. Without
       it every outreach question is unanswerable — you cannot tell whether the referral link
       works, so you cannot tell whether to do more of it.
       `came_from` is the channel; `invited_by` is the person, when there was one. */
    "came_from", "invited_by", "joined_on",
    /* The code THIS person hands out. Made from their own name so it can be said aloud at a school
       gate — a random string has to be read off a screen, and a referral needing a screen is a
       referral that does not happen. */
    "referral_code",
    /* ---------- HOW A PERSON PROVES WHO THEY ARE -----------------------------------------------
       THE PIN COLUMN HELD THE PIN. Typed in, written down, sat in a cell — so anybody who could
       open the spreadsheet could read every family's PIN, and a PIN is the same four digits people
       use on a phone and a bank card. `pin_hash` replaces it: a one-way digest, so what is stored
       cannot be read back into the number somebody types.

       `pin_salt` IS PER PERSON and is why two families choosing 4815 do not produce the same hash.
       Without it one leaked hash tells you every account sharing that PIN.

       `session_hash` AND `session_until` ARE THE SIGNED-IN STATE. A random token is handed to the
       phone at sign-in and only its digest is kept here — the same reasoning as the PIN, and it
       means a copy of this sheet cannot be used to impersonate anybody.

       `tries` AND `locked_until` ARE THE THROTTLE. Four digits is ten thousand guesses, which is
       minutes of unattended requests; five wrong in a row and the account stops answering for a
       while, which turns minutes into years without inconveniencing anybody who knows their PIN.

       `pin` STAYS IN THE LIST so the migration can read it once and blank it. It is not written
       to again. */
    "pin_hash", "pin_salt", "session_hash", "session_until", "tries", "locked_until",
    "photo",
    /* THE FIGURE, and what has been bought for it. Neither column existed, and both are written
       to: saveAvatar called setCell for `avatar` and `avatar_owned` on every save, setCell found
       no header, returned false, and the value went nowhere. Every wardrobe change since has been
       discarded in silence — the same failure as the four pricing fields above it. */
    "avatar", "avatar_owned",
    "video", "headline", "adjective_1", "adjective_2",
    "adjective_3", "city", "town", "borough",
    /* Where they are, and — for a student — the colour they chose. An address is a parent's to
       give; a colour is a child's, and it is the only thing on this sheet that is theirs purely
       because they like it. */
    "address", "postcode", "favourite_colour",
    "travel_km", "rate_per_hour", "max_students", "min_students",
    /* These four were added to forms, payloads and pricing over several rounds and never to the
       schema — so ensureSchema never created the columns, every write went nowhere, and each
       feature failed silently for want of one line here. Nothing else was wrong with any of them. */
    "min_hours", "max_hours", "extra_seat_rate", "focus",
    "years_experience", "dbs_checked", "teaches_1", "teaches_1_level",
    "teaches_2", "teaches_2_level", "qual_1", "qual_1_level",
    "qual_1_grade", "qual_2", "qual_2_level", "qual_2_grade",
    "qual_3", "qual_3_level", "qual_3_grade", "extra_quals",
    "availability", "xp", "credits", "high_score_flappy",
    "high_score_tables", "friends", "notepad", "todo", "ticks_1",
    "ticks_2", "ticks_3", "children",
    /* ---------- THE LIBRARY CARD, WHICH IS A NOTE RATHER THAN A CREDENTIAL OF OURS ---------------
       ASKED FOR AS "a place to make notes for library card numbers and library card pins", and the
       reason it is three ordinary columns on `people` rather than anything cleverer is the
       three-question test at the top of CLAUDE.md, answered in order.

       IS IT SECRET? YES, so it is a sheet and never `data/`. This repository is public and its
       history is permanent; a card number and its four digits are exactly the shape of thing that
       must not be committed, and the same sentence already keeps PINs, e-mail addresses and dates
       of birth in this tab and out of git.

       DOES THE APP WRITE TO IT? YES — `updateProfile`, from the Settings column, which is what
       makes it a sheet column rather than something kept on the phone. A note that lives in
       `localStorage` is a note you lose when you change phone, and the whole point of writing a
       library card number down is that it is there in a year when you cannot find the card.

       `library_note` IS THE THIRD COLUMN AND IT IS DELIBERATE, not padding. Somebody with cards
       for two boroughs, or a card in a child's name, has a fact the other two columns have nowhere
       to put — and the alternative to one free line is `library_card_2`, which is the numbered-
       column fault this file records three times over under `images`, `needs` and the practicals.

       WHO SEES IT: nobody by default. `doGet` sends no profile column to anybody — `profileFields`
       is the SHAPE of the form, not its values — so these three never reach the public payload.
       They reach the person themselves in their own sign-in reply (`profileOf_`, answered only
       after the PIN has passed), and an ADMIN through `getProfile` — which is how every other
       column on this tab has behaved since it was written. Said rather than buried, because one of
       the three is a PIN and the owner is the admin. */
    "library_card", "library_pin", "library_note"
  ],
  /* ---------- THE MAP -----------------------------------------------------------------------
     WHERE THE GROUND COMES FROM, and the reason this tab exists at all.

     Hand-writing a street network is hopeless: a borough is several hundred ways, each a chain of
     points, and anything written from memory would be plausible and wrong — which is worse than
     coarse, because coarse looks coarse and wrong looks right.

     So it is FETCHED, once, from OpenStreetMap through the Overpass API, and kept here. OSM is
     the only source that is both accurate and free to redraw: its data is ODbL, which asks for
     attribution and gets it on the map. Tiles were the wrong shape of answer — they are pictures,
     they need a key, and they cannot be drawn in this app's own ink. Geometry can.

     ONE ROW PER SHAPE. A park, a river, a road — each with the world it belongs to and its points
     as a flat list. Rows rather than one big cell because a cell holds 50,000 characters and a
     borough does not fit, and because a row can be deleted when a shape turns out to be rubbish.

     Nobody edits this by hand. `?run=fetchMap` fills it and `?run=fetchMap&arg=Merton` refills one
     world when the source improves. */
  /* ---------- LANDMARKS ---------------------------------------------------------------------
     BUILDINGS MEASURED BY HAND, and the shape of this tab is decided by how you actually measure
     one: open the satellite view, drop the ruler along the front of the building, read the metres.
     That gives a length, a width and a direction — not a polygon — so that is what it stores.

     `shape` = "box" is the common case and needs three numbers: `width_m` along the front,
     `depth_m` back from it, and `bearing` — see the note on it below, which changed when squaring
     became automatic. Once: the compass direction the front faces, 0 for north, 90
     for east. Almost nothing in London is aligned to north and a building drawn square when it sits
     at forty degrees to the street is the single thing that makes a map look wrong.

     `shape` = "polygon" is for the ones that are not rectangles — an L, a curve, a terrace that
     bends. `points` is then "lat lng, lat lng, …" walked round the outline, and the box numbers are
     ignored.

     HEIGHT: put in `height_m` if you know it, `storeys` if you do not. Storeys are easier to count
     off a photograph and get multiplied by about 3.2m. One or the other, not both — and if both are
     given the measured metres win, because somebody measured them.

     HAND-MEASURED BEATS FETCHED. OpenStreetMap's copy of a building is whatever a volunteer traced;
     yours is what you stood in front of with a ruler. Anything in this tab overrides the same
     building from `fetchMap`. */
  landmarks: [
    /* ---------- THESE ARE THE TAB'S OWN NAMES, AND THEY DID NOT USED TO BE -----------------------
       THIS ENTRY DESCRIBED A TAB THAT DOES NOT EXIST. It said `landmark_id`, `shape`, `width_m`,
       `depth_m`, `height_m`, `colour` and `roof`; the sheet has `id`, `w`, `d`, `height`,
       `wall_colour` and `roof_colour`, and no `shape` at all. So `content.gs` read seven names off
       every landmark row that were not there, and **every building came through with width 0,
       depth 0, height 0 and no colour** — drawn as a flat slab of nothing.

       NEITHER CHECK COULD SEE IT. `check-columns` asks whether a name is a column of any tab and
       `check-rows` asks whether it is a column of THIS tab — and both were answered by this entry,
       which is the code's belief rather than the sheet. Found by downloading the spreadsheet and
       comparing, which is the third question and the one nothing automates yet.

       THE SHEET IS THE SIDE THAT IS RIGHT, so the names moved here rather than there — the same
       conclusion this file reached about `SCHEMA.questions`. `shape` is gone entirely: it was read
       into a variable that nothing used, and the comment beside it already said no row has ever
       had one. */
    "id", "parent", "name", "world", "kind",
    "lat", "lng",
    /* ---------- WHICH WAY ROUND IT STANDS ON THE BOARD --------------------------------------------
       DEGREES TO TURN IT, and the sign is the ordinary one: POSITIVE IS CLOCKWISE, negative is
       anticlockwise. So -90 turns a site a quarter turn anticlockwise and 90 turns it the other way.

       IT IS A TURN ON TOP OF SQUARE, not an absolute compass bearing. The board works out for itself
       what angle a site was built at — Britannia Point stands at 105 degrees, fifteen off the grid —
       and turns it until its longest wall runs along the tiles, because a rectangle at fifteen
       degrees rasterises into a staircase and a staircase reads as an L. That happens whatever this
       says. This is the ADDITIONAL turn, for choosing which face you want toward you once the
       tiling is already clean.

       SO 0 IS RIGHT FOR MOST THINGS. Fill this in only when a site looks square and faces the wrong
       way, and then it is one of four numbers: 90, 180, -90, or 0. */
    "bearing",
    /* `x` and `z` are the board position when one is set by hand, and `active` is how a landmark
       is retired without deleting the row. All three are on the tab and none was declared. */
    "x", "z", "active",
    "w", "d", "points",
    "height", "storeys", "wall_colour", "note",
    /* ---------- WHAT THE SHEET ALREADY HAD AND THE SCHEMA DID NOT --------------------------------
       These four are on the landmarks tab and were never declared here — so `ensureSchema` would
       not create them on a fresh sheet, and `check-columns` reported them the moment anything read
       one. The tab was ahead of the schema, which is the quiet half of the same fault as a schema
       being ahead of the tab.

         label   what to write on the map, when the full name is too long for it
         icon    which glyph stands for it — a bus, a tree, a basket
         role    what it is TO THE APP rather than to the town: a venue, a start, a post
         marker  how it is drawn where there is no outline to draw
    */
    "label", "icon", "role", "marker", "roof_colour", "address",
    /* ---------- WHAT MAKES A LANDMARK RECOGNISABLE ON THE BOARD ----------------------------------
       THE BOARD IS NOT A MAP AND NOTHING ON IT IS TO SCALE. Each landmark gets a plot of its own,
       in order along the path, and what has to carry it is the SHAPE — because you know a church
       from a factory at a hundred metres by outline alone, long before you can read a sign.

       FOUR COLUMNS, IN THE ORDER THEY DO WORK:

         form     THE SILHOUETTE, and by far the strongest of the four:
                    tower   tall and narrow — Britannia Point
                    hall    wide, one storey, a big roof — a community centre, a church
                    shed    long and low — the bus garage, a retail park
                    house   small and square
                    slab    a plain block, which is what most things are
                    dome    round-topped

         roof     THE ROOFLINE, second strongest — it is what tells a house from a warehouse of
                  exactly the same size:
                    flat  ·  pitch  ·  dome  ·  saw   (saw is the north-light roof of a factory)

         feature  ONE thing that sticks up or out. One is memorable; three is noise:
                    chimney · spire · clock · mast · sign · none

         plots    HOW MANY TILES WIDE it sits. Not its real width — how much room it needs to look
                  like itself. A bus garage wants four; a house wants one. Blank means two.

       ALL FOUR ARE OPTIONAL. A row with none of them draws as a plain slab, which is what
       everything drew as before these existed. */
    "form", "roof_shape", "feature", "plots",
    /* HOW DEEP THE PLOT IS, in tiles. Width is `plots`; this is the other side of it, and it exists
       because a retail park is wide AND deep while a house is neither. */
    "plot_depth",
  ],

  /* ---------- THE PARTS OF A LANDMARK ------------------------------------------------------------
     A LANDMARK IS NOT ONE THING, and one row cannot say otherwise. Priory Retail Park is a store
     with grey walls and a blue roof, AND a flat black car park beside it. Deen City Farm is a barn,
     paddocks, and a fence round the lot. A single row has one height, one colour and one form, so
     every landmark that is really two things has to lie about one of them.

     SO A PART IS A ROW. Which landmark it belongs to, where it sits on that landmark's plot, how
     big it is, and what it is made of. Exactly the move the people tab needed when it was a hundred
     and twelve columns: the thing that repeats becomes rows.

     TILE COORDINATES, NOT METRES. `x` and `z` are measured from the front-left corner of the plot,
     in tiles, and `w` and `d` are how many tiles the part covers. The board is not to scale — it is
     a board — so a part is placed where it LOOKS right rather than where it measures, and tiles are
     the unit somebody can actually reason about while filling this in.

     A LANDMARK WITH NO PARTS still draws, from the `form` and `plots` on its own row. That is the
     whole of the previous behaviour and it stays: parts are for the ones worth the detail, and
     nothing has to be filled in for the ones that are not. */
  landmark_parts: [
    "part_id", "landmark_id", "name",
    /* WHAT IT IS, and this decides everything about how it draws:
         building  walls and a roof, standing on the plot
         tarmac    flat and dark — a car park, a yard, a service road
         grass     flat and green
         water     flat, blue, and slightly sunken
         trees     grass with trees on it
         fence     a low line round the edge of the tiles it covers
         path      the pale surface of a footway
         bridge    a raised deck on piers — the one flat thing that is OFF the ground, so it can
                   cross a `water` part with the river visible underneath */
    "kind",
    /* ---------- THE SHAPE, TWO WAYS, AND ONE OF THEM IS BETTER --------------------------------
       `points` — THE REAL CORNERS, `lat lng, lat lng, …`, exactly as the landmarks tab holds them.
       Any number of them. When this is filled in, everything below is IGNORED: the shape is
       rasterised onto the landmark's tiles, so a C-shaped building comes out C-shaped and a car
       park wrapping round it wraps round it. That is the only way a plan actually survives to the
       board — a bounding box turns every building into the same rectangle, which is what made
       Tandem Centre and Priory look identical.

       `x` `z` `w` `d` — TILES, from the front-left corner of the plot, for parts nobody has walked
       round. Quicker to fill in and always a rectangle. Fine for a shed; wrong for a shopping
       centre built round a car park.

       BOTH ARE SCALED TO THE LANDMARK'S OWN PLOT, not to the board. So the shape within a site is
       true and the size between sites is not, which is what a board is for: Tandem Centre and a
       corner shop each get the room they need, and each is the right shape inside it. */
    "points",
    "x", "z", "w", "d",
    /* HOW TALL, in metres — 0 for anything flat. The board squashes the range so a tower and a shed
       are both readable, so this is the real height and the drawing decides what to do with it. */
    "height",
    /* THE SHAPE OF IT, for the parts that are buildings. Same vocabulary as the landmark's own
       `form` and `roof_shape`, because a part IS a building and there is no reason for a second
       set of words. */
    "form", "roof_shape",
    /* AND WHAT COLOUR. Walls and roof separately — a grey building with a blue roof is a thing you
       can only say if they are two columns. */
    "wall_colour", "roof_colour",
    /* ONE FEATURE: chimney, spire, clock, mast, sign. Per part, so the barn gets the chimney and
       the paddock does not. */
    "feature",
    "note", "active",
  ],

  /* ---------- RECEIPTS ----------------------------------------------------------------------
     WHAT WAS AGREED, KEPT AS IT WAS AGREED.

     A receipt is not a view of a job — it is a record of what was said at a moment. Rates move,
     multipliers get corrected, a venue's room hire goes up; regenerating a receipt from today's
     numbers would hand somebody a different document from the one they were given, which is the
     one thing a receipt must never do.

     So the LINES are stored, as they were printed. `lines` is the JSON the phone drew, and reissuing
     is reading it back rather than recomputing it. That is deliberate duplication of data that
     exists elsewhere, and the duplication is the point: the job can change afterwards and this
     cannot.

     `total_pence` is stored as a whole number of pence beside the lines. Money in a spreadsheet
     cell is a float, and a float is a thing that can arrive as 836.0000000001 — fine to display,
     wrong to reconcile against a bank statement. */
  receipts: [
    "receipt_id", "kind", "job_id", "order_id", "person_id", "person_name",
    "issued_on", "total_pence", "currency", "lines", "note",
  ],

  map: [
    /* `meta` carries whatever the shape needs beyond its outline — a building's storeys, a road's
       classification. One spare column rather than a column per property, because the properties
       differ per kind and a tab with `levels`, `lanes` and `surface` in it would be mostly blank. */
    "world", "kind", "name", "points", "meta",
  ],

  venues: [
    "venue_id", "name", "focus", "borough", "city",
    /* WHERE IT ACTUALLY IS. Borough and town say roughly; a postcode says exactly, and the two
       numbers derived from it are what let a map put the venues in their real relation to one
       another rather than in the order somebody typed them.
       `postcode` is the one anybody fills in. `lat` and `lng` are FILLED FOR YOU — see the geocode
       runner — because nobody should be looking up coordinates by hand, and a number typed from a
       website is a number that can be typed wrong with nothing to check it against. */
    "postcode", "lat", "lng",
    "town", "photo", "link", "description",
    "cost_per_hour",
    /* ---------- WHAT IT COSTS TO SEND SOMEBODY HERE ----------------------------------------------
       PER SESSION, NOT PER HOUR, because a journey is a journey: Richmond and back costs the same
       whether the lesson is one hour or three. Charging it by the hour would make a long session
       look expensive to reach, which is the opposite of true.

       ON THE VENUE, NOT ON THE TUTOR, and that is the whole design. A distance from a tutor's home
       to a venue is more accurate and it is also a number a tutor can change by editing their own
       address — which turns a pay field into something to be gamed, and puts the business in the
       position of auditing where its staff say they live. A figure per venue is set by you, cannot
       be edited by anybody it pays, and answers the only question that matters: what does it cost
       to get somebody to this room.

       ZERO IS A REAL ANSWER and Online is the case it was written for: there is no journey, so
       there is no cost. Blank means the same as zero, so nothing has to be filled in for the
       venues nobody travels to.

       CLIENT HOUSE IS THE ONE TO THINK ABOUT. It is a door rather than a library and it is the
       longest journey on the list — so it is the venue most likely to want a figure here, and the
       one where leaving it blank quietly costs you money. */
    "travel_cost",
    "max_students", "min_students",
    "min_hours", "max_hours", "focus", "notice_days",
    "availability", "tutors_happy_here"
  ],
  /* AN INVITATION. One row is one family asked to share one booking — who asked, who was asked,
     which booking, and what happened. Separate from `jobs` because an invitation has its own life:
     it is sent, opened, and accepted or not, and most are not. */
  invites: [
    "invite_id", "job_id", "from_person", "to_email", "to_name",
    "sent_on", "opened_on", "accepted_on", "declined_on", "token", "notes",
  ],

  jobs: [
    "job_id", "status", "subject", "level",
    "service", "weekday", "start_time", "hours_per_session",
    "venue", "client_hosts", "term_name", "session_dates",
    /* WHAT IT COST, beside what it earned. `tutor_pay` has been written as an empty string on every
       job ever created — so the books record what a session brought in and nothing about what it
       took to run, and the margin column is a figure the browser sent rather than a subtraction.
       `travel_paid` is the journey, copied from the venue AT THE TIME OF BOOKING: the rate can
       change afterwards and what you actually paid for this session cannot. */
    "price_total", "tutor_pay", "travel_paid", "admin_profit", "max_students",
    /* WHO THE SESSION IS FOR, by name, as the parent ticked them at booking. Comma-separated
       because a booking is one row and the children in it are two or three names, never a table.
       Blank is ORDINARY and means the seats are children we have no name for — somebody booking
       for a friend's family, or for a child with no account here. It is not the same as nobody
       coming, and the roster says "Child" rather than pretending to know. */
    /* WHETHER A FAMILY THIS ONE HAS NEVER MET MAY ASK TO JOIN, answered by the client at booking.
       Not derived from anything: a booking with seats going and a booking that is open to strangers
       are different facts, and inferring the second from the first would be deciding on somebody
       else's behalf who may sit with their child.
       Blank counts as NO. Every row that predates this column was made when the question was not
       being asked, and reading silence as consent is the one direction this must never fail in. */
    "open_to_others",
    "for_children",
    "split_emails", "stealable", "created_at",
    /* WHAT KIND OF SESSION THIS IS, and it is the one column that changes the RULES rather than the
       facts. Blank or `session` is the ordinary booking: you choose a tutor, you choose how many
       children, and the price falls out of the formula.
       `waitlist` is a different product wearing the same shape — one seat, no tutor chosen, Maths
       and English, and a price fixed before anybody joins. Everything downstream still works
       because it is still a job: `participantsOf` folds the roster, `move` runs the lobby, the
       payment path is identical. Only the making of it differs, which is why this is a column and
       not a tab.
       BLANK IS A SESSION, for the same reason every other flag on this sheet reads that way: every
       row that predates the column was made before the question was being asked. */
    "kind",
    /* WHEN THE LIST SHUTS. A waitlist that never fills has to end somewhere or the families on it
       are waiting on a thing that is never going to be told to them. Nothing enforces it yet — it
       is written so the closing can be a date rather than somebody remembering. */
    "closes_on",
    /* WHO MADE IT, when that is not the family it is for.
       BLANK IS THE ORDINARY CASE and means they booked themselves — which is also what makes the
       receipt's question skippable: "who is this for" is only worth asking when this is going to be
       filled in, so one column answers the question AND decides whether to ask it.
       A booking a parent made and one an admin made on their behalf were identical rows before
       this, and that is the fact you want on the day somebody says they never booked it. */
    "booked_by"
  ],
  events: [
    "event_id", "at", "job_id", "actor",
    "role", "action", "target", "message",
    "request_id"
  ],
  terms: [
    "term_id", "term_name",
    /* WHAT KIND of interval it is: term, holiday, or half-term. The name usually says so —
       "Christmas Holiday" is not subtle — but a name is prose and this is a fact the site needs to
       act on: a holiday prices differently, fills differently and is offered differently from a
       teaching block. Derived from the name when the cell is blank, so nothing has to be filled in
       for it to start working. */
    "kind",
    "relative_name", "display_name",
    "start_date", "end_date", "last_sunday", "weeks_left"
  ],
  /* ---------- HERD MENTALITY'S QUESTIONS -------------------------------------------------------
     ONE COLUMN THAT MATTERS AND THREE THAT HELP. The game hands out a question and gets out of the
     way, so a row is a question — `sort_order` is here because the tab will be typed in bursts and
     somebody will want to group them, and `active` because a question that did not land in a room
     should be switchable off rather than deleted, so the next person does not re-add it.

     THE CODE KEEPS ITS OWN LIST AND THIS REPLACES IT. `HERD_BUILTIN` in games.js is twenty
     questions; fill this tab and those are replaced with no deploy, leave it empty and the game
     still works. An empty tab must never produce an empty game — see `herdPack_`. */
  herd: ["question_id", "question", "sort_order", "active", "notes"],

  /* ---------- `resources` WAS A TAB, THEN A KIND OF ROW, AND IS NOW NEITHER --------------------
     Its 559 rows and every column it had went onto the `questions` tab as `kind: 'paper'` rows —
     and that tab has since left the spreadsheet altogether for `data/questions.json` in this
     repository. See the note where `SCHEMA.questions` used to be, a few hundred lines down.

     REMOVED RATHER THAN LEFT EMPTY, ON PURPOSE. `ensureSchema` walks SCHEMA and CREATES any tab
     it cannot find, so an entry left here would quietly rebuild an empty `resources` tab on the
     next `?setup=1` — a decoy with the right headers and no rows in it, which is the exact shape
     of the fault that hid the real rows in another file for months. */
  /* ---------- ONE TAB FOR EVERYTHING THAT IS A THING -----------------------------------------------
     `shop` HELD THE WEARABLES AND `items` HELD THE STATIONERY, and `items` was never wired up at
     all — forty rows in a tab with no SCHEMA entry, no TAB entry and nothing reading it, which is
     the same fault as the `notes` column and the English cheat-sheet components. Merged rather than
     wired up twice: a pencil and a pair of jeans are both a thing with a name, a price and a way of
     getting hold of it, and the differences are columns rather than tabs.

     `acquire` IS THE COLUMN THAT DID THE MERGING. `shop` said how you got something by leaving the
     price blank; `items` said it in a word — buy, ticks, issued, loan. The word won, and `level`
     joined it for the wearables you earn by levelling up.

     THREE PRICE COLUMNS BECAUSE THERE ARE THREE CURRENCIES. Pence for money, ticks for ticks, coins
     for the wardrobe. One `price` and a `currency` beside it meant every reader had to check the
     second before trusting the first, and a blank currency was a silent guess. */
  shop: [
    "item_id", "name", "brand", "kind", "description", "photo",
    "audience", "acquire",
    "price_pence", "price_ticks", "price_coins", "value_pence",
    "stock", "max_per_person", "returnable", "contains",
    "level_required", "slot", "art_id",
    "active", "notes"
  ],
  pricing: [
    "kind", "label", "surcharge_per_hour", "note"
  ],
  config: [
    "key", "value", "what_it_does"
  ],
  options: [
    "list_name", "value", "sort_order",
    /* WHAT KIND of thing it is. The same word tutors and venues already use, so "academic" means
       one thing across the whole site — a tutor who does sport, a venue with a hall, and a subject
       like PE all say `sporty`, and a filter that understands one understands all three.
       Only meaningful on rows in the `subject` list; harmless everywhere else. */
    "focus"
  ],
  /* ROOMS.
     A venue is a building; a room is what you actually hire, and Richmond has several at different
     prices holding different numbers. One rate per venue could only ever describe the cheapest
     room or the dearest, and both are wrong on the invoice.

     Concession is a second RATE on the same room rather than a second room: it's the same space at
     a different price, and duplicating the row would mean editing capacity twice and having the
     two disagree the first time somebody didn't.

     Optional. A venue with no rooms behaves exactly as before, using its own cost_per_hour — so
     you can describe Richmond properly without touching the other ten. */
  rooms: [
    "room_id", "venue", "name", "rate_per_hour",
    "concession_rate", "min_capacity", "max_capacity", "availability",
    "notes", "active"
  ],
  /* A `feed` tab lived here. The cards are GENERATED now — computed arithmetic, and the topics
     already in `resources` turned into retrieval prompts — so there is nothing to fill in and
     nothing to run out of. A table would have been twenty rows somebody had to write and then
     maintain, seen once each. */

  /* THE WIDGETS. One row per tool and per game.

     `key` is the only thing the code needs — it names which drawing function to call, and a
     function cannot live in a spreadsheet. Everything ELSE about a widget comes from here: what it
     is called, what it says under the name, whether it appears at all, what order it sits in, and
     who sees it.
     So renaming a tool, hiding one, reordering them or making one admin-only is a cell rather than
     a deploy — which is the whole reason for the tab.

     `search` is the words somebody might type looking for it: "reels" finds the feed, "todo" finds
     the checklist. Those were buried in the code as part of a name nobody ever saw. */
  widgets: [
    "widget_id", "key", "name", "blurb", "section",
    "search", "sort_order", "roles", "active", "notes",
  ],

  /* BRANDING. Key and value, not a column each.

     A column per logo means every new piece of branding is a schema change and a deploy; a row per
     piece means it is a row. And the point of this tab is to be ready for things not yet decided
     on — which is exactly the case where naming the columns in advance would be guessing.

     Known keys, none of them required:
       logo_square    the square mark — an avatar, a favicon, a tile
       logo_circle    the round one, where a circle is wanted
       logo_wide      a wordmark, for a header or a letterhead
       cover          the wide photograph behind a profile
       favicon        the browser tab
       tagline        one line, under the name
       accent         a colour, if you ever want it to differ from the stylesheet
       reactions      the emoji a post offers — `👍 ❤️ 😂 😮 👏 🎉`. While this is empty there
                      are no faces to draw, so no reaction row appears on any post at all.

     Anything else you add appears too — the site passes the whole tab through, so a key it has
     never heard of is still available to whatever you write next. */

  /* ---------- THE REELS, WHICH HAD NO TAB AT ALL --------------------------------------------------
     `screen('reel')` READS `DATA.facts` AND NOTHING EVER SENT IT. No `facts` in TAB, none in this
     schema, and no line in doGet — so the column showed its empty state on every load since it was
     written, and that empty state says "add a row to the facts tab", naming a tab the sheet has
     never had. Somebody following the instruction would have made one and still seen nothing,
     because the payload had no idea it existed.

     Exactly the failure CLAUDE.md names: a key the site asks for and the backend does not send is
     `|| []` away from looking like an empty database.

     `pic` IS A SEARCH TERM, NOT A URL. The photograph is found on Wikimedia Commons when the slide
     scrolls into view — see `reelsWatch_`. So the cell holds words like "Roman aqueduct", not a
     link, and a row with no `pic` simply keeps its gradient. */

  /* THE LAWS — how words are coloured, wherever they appear.

     A rules table rather than rules scattered through the code, so a new one is a row and not a
     deploy. Every law is: what to match, how to match it, and what colour it becomes.

       kind = list    match against a list the site already has — subjects, clients, tutors, venues
       kind = prefix  a symbol and the word after it: # or @
       kind = word    one exact word or phrase
       kind = regex   for anything the first three cannot express

     `colour` is a name, not a hex — so the palette stays in the stylesheet where a designer would
     look for it, and a person filling in this tab writes "green" rather than #3ddc84.

     `weight` decides which law wins when two match the same word. Higher goes first. */

  /* POSTS. What the front of the app is: a photograph, a line about it, and a date.

     `image` is a Drive share link or any URL — the same treatment the showcase already had, so
     dropping a file in a folder and pasting the link is the whole workflow. */
  /* ---------- ONE ROW PER FILM OR SERIES, NOT PER EPISODE --------------------------------------
     AN EPISODE IS NOT A THING ANYBODY SEARCHES FOR. You choose the show and then the episode, and
     Drive's own folder view already does the second half well — so a five-season show is ONE
     row with a folder link on it rather than sixty-two rows of `5.7.mkv`. Same judgement the funnel already
     makes about tools: the thing you choose is the thing that gets a row.

     `placeholder` IS THE LIBRARY'S OWN COLUMN, one table along. It marks a row asked for by name
     whose file is not in the Drive yet — a card that says so beats a link that opens nothing,
     which is the argument `check-library.js` already prints an outstanding list for.

     `audience` IS `adults` OR `kids` AND IT IS NOT A RATING. It is which of the owner's two
     folders a thing came out of. Nothing in this app decides who may watch what from it; the
     whole tab is admin-only before it leaves the server. */
  films: [
    "film_id", "title", "year", "kind", "audience", "director", "lead", "seasons",
    "drive_id", "drive_url", "file_kind", "size_gb", "placeholder", "notes", "active"
  ],

  posts: [
    /* `file_name` is what the caption was taken FROM. Without it a scan cannot tell a caption
       somebody typed from one it copied off a filename, so it must either never update a caption
       or always overwrite one — and both of those are wrong in the ordinary case. */
    /* WHETHER IT MAY BE SEEN, and it is NOT the same question as `active` below.
       `active` is whether it has been deleted. This is whether it has been let through. A post from
       a client is neither deleted nor visible — it is waiting — and folding those two facts into one
       column would mean approving a post and undeleting one were the same act, which they are not.

         (blank)   never needed approving. Every row that predates this column, and every post an
                   admin makes — because an admin approving their own post is a step that exists
                   only to be skipped.
         PENDING   somebody who is not an admin has posted it. Nobody sees it but them and you.
         REFUSED   you said no. The row stays: a post you turned down is the one you may need to
                   show somebody afterwards, and deleting it is the one thing you cannot undo. */
    "approved", "approved_by", "approved_on",
    "post_id", "author", "image", "caption", "file_name", "body",
    /* Where it was taken. Free text — "Colliers Wood Library", "Wandle Park", "the Tandem
       Centre". Not a venue id: a photograph might be somewhere you have never taught, and
       forcing it into the venues list would mean inventing venue rows for a park bench. */
    "location",
    /* WHO ACTUALLY PRESSED THE BUTTON, as against whose name is on the post. A post from
       @family. was still made by a person, and on the day there is more than one admin that is
       the difference between a record and a shrug. */
    "posted_by",
    /* The emoji THIS post offers, if it should differ from the usual set. Almost always blank —
       a shared set is what makes the counts mean anything, and a post with its own five is a
       little world of its own. */
    "reactions",
    /* A POLL, as a comma-separated list of answers: `Yes, No, Maybe, No idea`.
       In a cell rather than a tab of its own, because the options only ever belong to one post and
       a second tab would mean joining two things that are never apart. The VOTES are a tab, because
       those belong to people. */
    "poll",
    /* WHEN, and it comes from the FILE rather than from whoever typed the row. A photograph has a
       date already; asking a person to retype it is asking them to get it wrong. */
    /* THREE DATE COLUMNS, and they are not the same fact.
         creation_date  when the photograph was taken — when the thing HAPPENED
         uploaded_date  when it reached Drive, which may be months later
         posted_on      what this file used to call it, kept so an older sheet still reads
       The feed is ordered by when something happened, so `creation_date` wins. Listed here rather
       than renamed in the sheet: the columns already there are better than the one they replace,
       and a schema that argues with a spreadsheet is a schema somebody works around. */
    "creation_date", "uploaded_date", "posted_on",
    "pinned", "active",
  ],

  /* LIKES. HISTORICAL — nothing reads this tab any more.
     A like is a reaction with exactly one option, so keeping both meant two counts of the same
     gesture and a heart sitting beside a 👍 competing with it. Reactions won because they say
     WHICH, and a like cannot.

     The tab stays, and the rows in it stay. `migrateLikes()` turns each one into a 👍 on the
     reactions tab — nobody's press is thrown away — and after that this is a record of what
     happened, kept for the same reason a flagged message is kept: deleting it is the one thing
     you cannot undo. */
  post_likes: [
    "like_id", "post_id", "person_id", "liked_on",
  ],

  /* A REACTION is a row, like a like and a vote. Same three reasons: you can see who, nobody
     reacts twice, and somebody can change their mind. */
  post_reactions: [
    "reaction_id", "post_id", "person_id", "emoji", "reacted_on",
  ],

  /* A VOTE is a row, for the same reasons a like is: you can see who voted, one person cannot vote
     twice, and somebody can change their mind. A tally in a cell answers none of those. */
  post_votes: [
    "vote_id", "post_id", "person_id", "choice", "voted_on",
  ],

  /* A COMMENT is a row, and the shape is deliberately the reaction's and the vote's: a post_id, a
     person_id, what they said and when. Three tabs with one shape is three things that behave the
     same way, which is most of why this app stays quiet.

     WHAT IT DOES NOT HAVE, and both absences are decisions:

     NO `parent_id`. A reply to a comment is a tree, and a tree is a second reading order on a
     surface whose whole job is one photograph and what people said about it. The day somebody
     wants threads it is one column; inventing it now is a join nobody has asked for, which is the
     `orderPrints` shape.

     NO EDIT. A comment is a thing somebody said in public. It can be DELETED, by its author or by
     an admin — and a deleted row is the one thing you cannot undo, so `active` is a cell rather
     than a `deleteRow`, exactly as `approved` is on a post: a comment you took down is the one you
     may need to show somebody afterwards.

     `body` IS CAPPED AT 2,000 by the handler, which is the same cap `sendMessage` has and for the
     same reason: a cell has a limit and a person typing an essay into a feed should be told so
     rather than have it silently truncated by the sheet. */
  post_comments: [
    "comment_id", "post_id", "person_id", "body", "said_on", "active",
  ],

  /* MESSAGES. One row per message — a thread is messages sharing a pair, not a thing of its own,
     so nothing has to be created before somebody can write.
     `read_at` is when the recipient opened it. `flagged` is for you: a message somebody reported,
     which stays in the sheet rather than being deleted, because a deleted message is one you
     cannot show anybody afterwards. */
  messages: [
    "message_id", "from_id", "to_id", "sent_at", "body",
    "read_at", "flagged", "flag_reason",
  ],

  /* FAMILY LINKS. A parent asks; the child accepts. Nothing is true until both have said so.
     A row with a state rather than a name in a cell, because a cell has no room for "who asked",
     "when", or "did they agree" — and those are the whole point. A name typed into a list claims
     somebody silently, and claims the wrong person just as silently.
     asked → accepted, or asked → refused. Only `accepted` is a link. */
  family: [
    "link_id", "parent_id", "child_id", "child_typed", "state", "asked_on", "answered_on",
  ],

  /* ORDERS. A reward that arrives in the post is not a purchase — it is a request with a state.
     An avatar hat is bought and worn in one step; a printed paper has to be printed, put in an
     envelope and posted, and the student needs to see where it has got to.
     The state only ever moves one way: asked → posted → arrived. Nothing here can go backwards,
     which is what stops a paper being posted twice.

     THE PRINT COLUMNS. A printed resource is the same shape of thing as a redeemed paper — work
     you have to do over days — so it is the same tab rather than a second one. What it needs on
     top: how many sheets, what it cost in money rather than ticks, and whether it is collected or
     posted. `delivery` is on the ORDER and not on each line, because three resources going to one
     address is one decision. */
  orders: [
    "order_id", "person_id", "item", "resource", "cost_ticks",
    "pages", "cost_pence", "delivery",
    "state", "asked_on", "posted_on", "address", "notes",
  ],

  /* ---------- HOLIDAYS -----------------------------------------------------------------------
     A RULE, NOT A DATE, and that is the whole design of this tab.

     Christmas is the 25th of December for ever. Easter is not: it moves every year, and so does
     everything hung off it. Diwali, Eid, Hanukkah and Chinese New Year move because they are on
     lunar calendars and do not line up with this one at all.

     A `date` column would therefore be correct for one year and quietly wrong the next — and
     quietly wrong here means a Christmas waitlist opening in March, or an Easter event advertised
     three weeks after Easter. Nobody would connect either to a cell nobody re-typed.

     So each row says HOW to find its day, and `holidayDate` works it out for whatever year is
     being asked about:

       fixed     `when` is MM-DD.  Christmas is `12-25` and always will be.
       easter    `when` is an offset in days from Easter Sunday. Good Friday is `-2`, Easter
                 Monday `1`, Shrove Tuesday `-47`. Computed exactly, and the algorithm is tested
                 against six known years before anything trusts it.
       nth       `when` is like `3:0:6` — the 3rd Sunday of June, Father's Day. 0 is Sunday.
                 A negative first number counts back from the end: `-1:1:5` is the last Monday in May.
       date      `when` is a real date, YYYY-MM-DD, and there is ONE ROW PER YEAR.

     THE LAST ONE IS FOR THE LUNAR FESTIVALS, and it is deliberately the dumbest option. Eid and
     Diwali are decided by observation and by calendars this code has no business approximating —
     an almost-right date for somebody's festival is worse than an absent one, because it will be
     acted on. They are typed in, a year at a time, by somebody who knows.

     `lead_days` is how far ahead the event appears. A Christmas thing that shows up on the 20th of
     December is a Christmas thing nobody can arrange childcare for. */
  /* A `holidays` TAB WAS DECLARED TWICE, and this was the first of the two. JavaScript keeps the
     LAST one silently, so half the columns named here — `rule`, `when`, `lead_days`, `trail_days`,
     `event`, `event_name` — never existed on the sheet at all, while sitting in the schema looking
     as though they did. `check-columns` cannot see it either: both halves are in `SCHEMA`, so
     every name reads as declared.
     Merged into the one below rather than deleted, so nothing that was meant is lost. */

  /* ---------- HOLIDAYS ------------------------------------------------------------------------
     WHEN A FESTIVE EVENT COULD HAPPEN, so a waitlist can open itself before one rather than being
     remembered three days too late.

     THE DATES ARE COMPUTED, NOT TYPED, and that is the whole reason this is a tab with a seeder
     rather than a list somebody fills in. Ten of the eighteen move: Easter shifts by a month
     between 2026 and 2027, and Pancake Day, Mother's Day, Good Friday and Easter Monday all hang
     off it, while the bank holidays are "the first Monday in May" and "the last Monday in August".
     A typed date is right for one year and quietly wrong every January after — which for a thing
     whose entire job is to fire at the right time is the worst possible failure.

     ONE ROW PER HOLIDAY PER YEAR. `seedHolidays` writes a year at a time, so a row is a fact about
     a date rather than a rule to be re-read, and the rows can be edited: move a date, switch one
     off, change how far ahead its waitlist opens.

     `opens_days` IS THE POINT OF THE TAB. Christmas needs six weeks of notice to fill four seats;
     Pancake Day needs one. It is per row because the answer differs per holiday, and it is the
     number that decides when a family first sees the thing. */
  /* ---------- AD CAMPAIGNS ------------------------------------------------------------------------
     A LIST OF THE THINGS YOU RUN, and no more than that. A first version of this carried audience
     targeting, budgets, promo codes and a second tab for logging responses — which is a
     measurement system, not a list, and none of it is any use until there are campaigns to
     measure. Written down first, measured later if it turns out to matter. */
  /* ---------- THE LOADING SPLASHES -----------------------------------------------------------------
     A CATALOGUE, AND A SWITCH. Twenty-nine of them now, all drawn in CSS — this tab cannot make one
     or change how it looks, and pretending otherwise would be the sort of table that looks like
     control and is decoration.

     WHAT IT DOES DO IS RETIRE THEM. `active` FALSE takes one out of the pool from the next load
     onward, which is the thing actually worth having in a sheet: seeing one you have tired of and
     turning it off without touching any code.

     `kind` GROUPS THEM so the list is readable at thirty rows: proof, brand, game, tool. */

  /* `cheatsheet` WAS HERE and is gone for the reason `questions` is gone, one file along:
     the 77 rows are `data/cheatsheet.json` in this repository and `libraryExtras_` in
     js/library.js reads them. THE ENTRY HAD TO GO WITH THE TAB, because `ensureSchema` walks
     this object and CREATES any tab it cannot find — so an entry left behind rebuilds an empty
     `cheatsheet` tab on the next `?setup=1`, with the right headers and no rows, which is the
     exact shape of the fault that hid the real resource rows in another file for months. */


  /* ---------- FAVOURITES ---------------------------------------------------------------------------
     ONE ROW PER FAVOURITE, not a column on every table.

     THE COLUMN VERSION IS THE OBVIOUS ONE and it loses data. A cell holding "P-001,P-002,P-003" has
     to be READ, appended to, and WRITTEN BACK — so two people favouriting the same resource in the
     same second both read the old value and the second write erases the first. Nothing reports it;
     somebody's favourite is simply not there later. Every other problem with it is survivable and
     that one is not.

     THE REST, for the record: it needs a new column on each of the seven searchable tables and on
     every table added afterwards, which is a thing to forget; "what have I favourited" means
     reading all seven and splitting every cell; and a cell caps at 50,000 characters, which
     truncates in silence.

     APPENDING A ROW HAS NONE OF THAT. Nothing is read first, so nothing can be overwritten, and one
     filter answers the only question anybody asks of this table.

     `kind` + `item_id` RATHER THAN A FOREIGN KEY PER TABLE, because the searcher already speaks in
     exactly those terms — a result IS a kind and an id — so this table needs no knowledge of what
     the kinds are, and a kind invented next year works without touching it. */
  /* ---------- `questions` WAS HERE, AND IT IS NOT A TAB ANY MORE --------------------------------
     THE 3,913 ROWS LIVE IN `data/questions.json` IN THIS REPOSITORY. `js/library.js` fetches that
     file and builds `DATA.questions` and `dropdowns.checklists` out of it; the backend no longer
     reads a question, a paper, a link or a page count, and there is nothing left here for it to
     read one FROM.

     SO THE ENTRY IS DELETED RATHER THAN EMPTIED, and that distinction is the whole reason this note
     sits where the column list used to. `ensureSchema` walks `SCHEMA` and CREATES any tab it cannot
     find — so an entry left behind would quietly rebuild an empty `questions` tab on the next
     `?setup=1`: a decoy with the right headers and no rows, which is EXACTLY the shape of the fault
     that hid the real resource rows in another file for months. `SCHEMA.resources` was deleted for
     this reason a fortnight ago, and this is the same argument a second time.

     SO THE TAB CAN BE DELETED FROM `Library`, which is the whole point of the change. Nothing in
     `TAB`, `WHERE` or `SCHEMA` names it, `documents_()` is gone from core.gs, and the five handlers
     that wrote to it are gone from dopost.gs. See the header of js/library.js for what moved, and
     what was deliberately left behind. */

  /* `boxers` AND `fights` WERE HERE, and they leave together for the same reason and by the
     same route: 103 fighters are `data/boxers.json` and 157 bouts are `data/fights.json`, both
     read by `libraryExtras_`. The columns they describe are not lost — the files hold the
     SHEET'S OWN column names, `boxer_id`, `height_cm`, `winner_id`, so an export is a row you
     can paste back without translating it, and js/library.js holds the one mapping that renames
     them for the phone. Same `ensureSchema` argument as `cheatsheet` above: an entry left here
     would quietly rebuild the tab this change exists to delete. */


  favourites: [
    "fav_id", "person_id",
    /* resource · venue · tutor · shop · subject · topic · link — whatever the searcher calls it */
    "kind", "item_id",
    "at",
  ],

  /* ---------- A CAMPAIGN IS A DESIGN AND A SCHEDULE, AND IT WAS ONLY EVER THE SCHEDULE -----------
     This tab said WHEN to run each campaign and nothing about what it says. The words lived in
     `FLY_ROWS`, an array in flyer.js — eleven campaigns, headline and paragraph and colours, all
     in code. So the one part of the app that is pure copywriting was the one part that needed a
     developer to change, and the tab that was obviously for it sat here holding notes.

     THE DESIGN COLUMNS COME HERE. The WORDS go in `copy` below, one row per line, because a
     headline is not a property of a campaign the way a colour is — you want four of them and to
     pick between them.

       style    minimal · elegant · detailed · loud
       ink      the colour the text is set in
       accent   the one thing meant to be looked at
       ground   the paper
       blocks   which pieces appear, space separated, from:
                  code name head slogan say facts price phone foot qr

     Leave a row's design columns empty and the built-in defaults are used, so a campaign added
     with nothing but a name still prints. */

  /* ---------- THE WORDS, ONE LINE PER ROW ---------------------------------------------------------
     WHY THIS IS NOT MORE COLUMNS ON `campaigns`. A campaign has one style and one accent, so those
     are properties of it. A headline is not: the whole point is to have four and choose. Columns
     cannot hold four of a thing without becoming head_1, head_2, head_3 — which is a table lying
     about its own shape, and which caps you at however many somebody guessed.

       slot     which part of the flyer this is
                  head    the big line. `|` is where it breaks
                  say     the paragraph under it
                  offer   the line about price and seats
       variant  1, 2, 3 … Rows sharing a campaign and a slot are alternatives, and the flyer
                maker offers them in a Wording menu. Numbers need not be tidy; they order the list.
       text     the words themselves

     `active` OFF TAKES IT OUT OF THE MENU without deleting it, which is what you want for a line
     that worked last year and is wrong for this term. A slot with no active row falls back to the
     campaign's built-in wording, so emptying this tab cannot produce a blank flyer. */

  /* ---------- WHAT THE SEARCH ASKS, AND WHAT IT CALLS IT -------------------------------------------
     THE FUNNEL IS TWO DIFFERENT THINGS AND ONLY ONE OF THEM BELONGS IN CODE.

     Reading a value off a row is logic — "the band, but only when it is a grade rather than a
     stage" cannot be written in a cell without inventing a formula language in a spreadsheet
     column, and that is a bad day for everybody. That half stays in find.js, keyed by `field`.

     WHICH QUESTIONS GET ASKED, IN WHAT ORDER, AND WHAT THEY ARE CALLED is editorial. It is the
     same kind of decision as the wording on a flyer, and it was in code for the same bad reason.

       field         the key. It must match a field the code knows; one it does not is ignored.
       label         what the question is called on screen
       sort_order    lower is asked earlier
       min_coverage  0 to 1. A question is skipped while fewer than this share of the things in
                     front of you can answer it — because choosing a value silently drops every
                     item that has none. Blank uses the 0.5 the code has always used.
       active        OFF removes the question entirely, however well covered it is.

     A FIELD WITH NO ROW KEEPS ITS BUILT-IN SETTINGS, so this tab can be empty, or hold one row for
     the one thing you wanted to rename, and everything else carries on. */

  /* ---------- AND WHAT THE FIRST TWO QUESTIONS ANSWER ----------------------------------------------
     THE `facets` TAB MOVED THE QUESTIONS OUT OF CODE AND LEFT THE ANSWERS BEHIND. "What for" and
     "What kind" are the first two things the funnel asks and the two that shape everything after,
     and every one of their answers — which group a kind belongs to, what that group is called, what
     the kind is called, what order the groups come in — was a literal in find.js.

     THAT IS THE SAME KIND OF DECISION AS A FACET LABEL, and it got a tab for exactly the reason
     this one now has one: it is editorial, it changes, and changing it should not be a deploy.

     WHAT IT COST TO BE IN CODE. The note above `forLabel` says grouping takes the first question
     "from nine answers to four". There are EIGHT groups now. Adding one is a single word inside a
     literal, nothing counts them, and the benefit the grouping exists for was given back one word
     at a time without anybody deciding to.

       kind        the row's `kind` value — one the code does not produce is ignored
       group       the answer to "What for". Kinds sharing a group are asked about together
       label       the answer to "What kind"
       sort_order  lower groups are offered first. Ties fall back to alphabetical
       active      OFF hides that kind from the funnel entirely

     A KIND WITH NO ROW KEEPS ITS BUILT-IN GROUP AND LABEL, so this tab can be empty and the funnel
     behaves exactly as it does today. */

  holidays: [
    "holiday_id", "name", "date", "year", "kind",
    /* HOW MANY DAYS BEFORE the date the event goes up, and how long it stays after. A holiday is
       not a deadline — the day after Christmas is still Christmas to a family with a week off, and
       an event that vanishes at midnight on the 25th vanishes during the week people are free. */
    "opens_days", "trail_days",
    /* ---------- AND WHAT THE EVENT ACTUALLY IS -------------------------------------------------
       A DATE IS NOT AN EVENT. The tab knew when Christmas was and nothing about what you would run
       for it — so "a festive thing appears automatically" had no thing to appear.

       These five are the whole of it, and they are the same five questions any event has: what it
       is called, where, how much a child, how many children, and how long. Filled in per holiday,
       because a Halloween afternoon at the farm and a Christmas party in a hall are not the same
       event and never will be.

       BLANK MEANS NOT READY. An event with no venue or no price cannot be offered to anybody — it
       would be a card asking somebody to join something with no place and no cost — so it simply
       does not go up, whatever `active` says. That is the safe direction: a holiday you half
       filled in shows nobody anything rather than showing everybody half an event. */
    "event_name", "venue", "price_per_child", "max_children", "hours",
    /* One line under the name — "an afternoon at the farm, hot chocolate included". */
    "blurb",
    /* Whether you run something for it. Every holiday can be on this tab; only the ones with this
       ticked ever put anything in front of anybody. The rest are the calendar knowing what day it
       is, which is worth having on its own. */
    "active", "notes",
  ],

  /* EXAMS. One row per paper, because a student sits several and nobody knows how many in
     advance — three columns on `people` works until somebody has four, which is the same mistake
     the original flat sheet made.
     `kind` separates a mock from the real thing: both matter, and they carry different amounts of
     panic. */
  exams: [
    "exam_id", "person_id", "subject", "label", "exam_date", "kind", "board", "notes", "active",
  ],

  /* TRIPS.
     Deliberately shaped like BOTH the things a trip could turn out to be, because you don't know
     yet and the columns are the expensive part to change later:
       like shop stock — a name, a price, a picture, something you browse and pay for
       like a job      — a focus, a duration, a capacity, a date, a place it happens
     Whichever way it goes, the data is already there. What you'd otherwise do is pick one now,
     discover in three months it was the other, and migrate rows people have already booked.

     `price_per_child` rather than a flat price: capacity is the thing that varies, and a per-head
     figure survives a group changing size where a total doesn't. */
  trips: [
    "trip_id", "name", "focus", "description",
    "photo", "link", "provider", "price_per_child",
    "hours", "min_children", "max_children", "venue",
    "address", "date", "notice_days", "active",
    "notes"
  ],
};

/* Every tunable, with a plain-English note and a starting value. ensureSchema() adds any that
   are missing to the `config` tab and never touches one that's already there — so a value you've
   changed is safe, and a NEW knob arrives documented instead of as a bare key you have to guess
   at. This is also where the pricing formula is written down: the sheet should explain how a
   price is reached without anyone having to open the script. */
const CONFIG_DEFAULTS = [
  // M, w and open_rate are gone: a tutor now sets one charge-out rate, the minimum wage is fixed
  // in the code, and the open rate is fixed too. Leaving them here as editable numbers would have
  // meant two places claiming to decide the same price.
  ['s', 0, 'each extra subject adds this FRACTION of the base rate. 0.15 = +15%'],
  ['c', 0, "each extra seat adds this fraction — the tutor's share of it. 0.15 = +15%"],
  ['B', 0, 'each extra seat adds this fraction — your share of it. 0.25 = +25%'],
  ['b', 0, 'bulk discount taken off per session AFTER THE FIRST. 0.01 is about 9% off a 10-session term. 0 = off'],

  ['a', 0, 'advance discount taken off per week ahead AFTER THE FIRST. 0 = off'],
  ['h', 2, 'hours per session'],
  ['max_students_per_job', 4, 'seat cap when neither the tutor nor the venue sets one'],
  ['max_open_requests', 2, 'how many live requests one family may hold at once'],
  ['showcase_folder_id', '', 'Drive folder the Showcase reads'],

  /* ---------- GOOGLE SIGN-IN, WHICH HAD NO ROW TO SET IT IN --------------------------------------
     `googleLogin` has always read this cell and the config tab has never offered it, so the only
     way to switch the feature on was to know the key existed and type the row by hand. A setting
     nobody can find is a feature nobody has.

     BLANK IS OFF, AND OFF IS SAFE. Empty draws no button and `googleLogin` refuses outright —
     with no id there is nothing to check `aud` against, and a check that cannot run must refuse
     rather than wave things through.

     THIS IS THE CLIENT ID, NOT THE CLIENT SECRET. The id is public by design: every site using
     Google Sign-In ships it in the page, and it goes to the phone in the payload. The secret is a
     different string, this app has never needed one, and it must never be put in this sheet. */
  ['google_client_id', '', 'Google Sign-In client ID (the PUBLIC one, ending .apps.googleusercontent.com). Blank switches Google sign-in off. Never put the client SECRET here'],
  ['pages_recheck_days', 30, 'how old a resource page count may get before the nightly job re-reads the file'],

  /* THE REELS PICTURE. Blank means Wikimedia Commons, which needs no key, allows the request from
     a browser, and answers a search like "octopus underwater" with a photograph of one.
     Put a Giphy key here and it fetches GIFs instead. Two things to know before you do: the key
     ships inside script.js where anybody can read it — normal for Giphy's free tier, since the
     limit is tied to the key rather than the key being secret — and Giphy answers those same
     search terms with reaction GIFs, which read as a joke where an illustration should be. */
  ['giphy_key', '', 'leave BLANK for Wikimedia Commons photographs (no key needed). A Giphy API key switches the reels to GIFs instead'],

  /* PRINTING. The file is free and always will be; this is paper and toner, at cost.
     A rate of 0 switches printing off entirely rather than making it free — a resource offered at
     £0.00 for a paper copy is the site promising to post something for nothing. */
  /* ---------- THE WAITLIST SESSION ---------------------------------------------------------------
     A DIFFERENT PRODUCT, PRICED BEFORE ANYBODY JOINS. An ordinary booking is priced from what the
     family chose; this one is priced from the VENUE and a seat count, and every family pays the
     same because they are all buying the same seat.

         per hour, whole session = venue rate + open tutor rate + (seats - 1) x extra
         per hour, one seat      = that / seats

     At Colliers Wood: 15 + 14 + 9 = £38 an hour for the room and the teaching, £9.50 a seat.

     WHY IT DIVIDES BY THE MAXIMUM rather than by how many have joined: the price has to be on the
     card before anybody joins, or nobody can decide whether to. It is safe here in a way it would
     not be otherwise, because nobody is charged until the list is FULL — the acceptance is the
     gate, and a list that never fills costs nothing and runs never. */
  ['waitlist_seats', 4, 'how many seats a waitlist session has. The price divides by this'],
  ['open_tutor_rate', 14, "the hourly rate for a tutor nobody chose — what a waitlist seat is priced against"],
  ['waitlist_extra_seat', 3, 'added to the HOURLY total for each seat after the first. 3 = £3'],

  /* ---------- WHO CARRIES THE TRAVEL ---------------------------------------------------------
     TWO DECISIONS, AND ONLY ONE OF THEM HAS TO BE MADE TODAY. What you PAY a tutor to reach a
     venue is a cost and it is now recorded. Whether a CLIENT pays it is a separate question about
     pricing, and it can be answered later without touching any code — which is the point of it
     being a key here rather than a rule in the source.

     OFF, because that is what happens now: the journey comes out of your margin and the client
     never sees it. Turn it on and it is added to the session price and appears on the receipt as
     its own line, which is the honest way to charge for it — a fee folded invisibly into an hourly
     rate is the thing people find later and mind about. */
  ['travel_on_client', 0, 'set to 1 to add the venue travel cost to what the client pays, as its own line on the receipt. 0 = you absorb it'],

  ['print_rate_per_page', 0.02, 'what a printed page costs. 0.02 = 2p. Set to 0 and no paper copies are offered at all'],
  ['print_minimum', 0, 'the least a print job can cost, whatever the page count. 0 = no minimum'],
  /* LAMINATING IS OFF BY DEFAULT, and that is the honest default rather than a cautious one: a
     pouch and the machine's time are a real cost, so a site that offered it free because nobody had
     filled in a cell would be selling at a loss on every order and saying nothing about it. At 0
     the basket draws no upgrade at all — see `laminatePrice`. */
  ['laminate_rate_per_page', 0, 'what laminating one page costs. 0 = laminating is not offered'],
  ['laminate_minimum', 0, 'the least a laminating job can cost, whatever the page count. 0 = none'],
  ['postage_flat', 0, 'one stamp and one envelope for a whole order, not per item. 0 = you do not post, and only collection is offered'],
  // Documentation rows. Read by nobody — written so the sheet explains its own arithmetic.
  /* The formula_* rows lived here. They were documentation stored as data: a written copy of the
     maths, in cells nothing reads, which had to be edited every time the maths changed — and by
     the end described a version of the formula that hadn't run for weeks. The pricing card shows
     the live formula, derived from the code that actually prices, so it can't fall behind. */
];

/* The option lists the CODE owns. These aren't preferences — the code branches on them, so a
   value in the sheet that the code doesn't produce is just a dropdown entry nothing can ever set.
   ensureSchema keeps these two in step with the code and leaves every other list alone, because
   the rest (subjects, levels, venues, exam boards) are genuinely yours. */
const OPTION_DEFAULTS = {
  participant_status: ['Waiting', 'Agreed', 'Paying', 'Booked'],
  action: ['Request', 'Accept', 'Decline', 'Withdraw', 'Pay'],
  // What a tutor teaches or a venue suits. Several may apply, stored comma-separated.
  focus: ['Academic', 'Sporty', 'Other'],
  // First wave sits in May/June, second in November for resits and absentees.
  exam_wave: ['First wave', 'Second wave'],
};

/* ---------- THE CHEAT SHEET COMPONENTS, AS ROWS ---------------------------------------------------
   THE SEVENTEEN THAT EXIST IN CODE, so the tab arrives filled in rather than empty. An empty tab
   with nine headers tells you nothing about what may be typed in it; a tab with the real rows in it
   is its own documentation, and editing one is safer than inventing one.

   `part_id` MATCHES A DRAWING IN js/mat.js. That is the join, and it is the reason these ids are
   dull: M02 is a name for a function, not for a hundred-square, and renaming the component in the
   sheet must not move the wire.

   THE TIERS ARE THE COMPONENT-WIDE ONES ONLY. Sphere and cone inside the formulae block, negative
   and fractional indices, perpendicular gradients, three of the five curves — those are Higher-only
   ROWS INSIDE a component, and a row of this tab cannot say so. They stay tagged where they are
   drawn. This column is for a whole component that belongs to one paper.

   Order, name, levels, tier, height, half. */
const CHEATSHEET_DEFAULTS = [
  ['M02', 'Number square',          'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      94,  true],
  ['M03', 'Times tables',           'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      100, true],
  ['M04', 'Number line',            'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      20,  false],
  ['M05', 'Place value',            'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      15,  true],
  ['M06', 'Measures',               'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      39,  true],
  ['M07', 'Angles named',           'SATs, 11+, Y9 Mocks, GCSE',          '',      28,  true],
  ['M08', 'Protractor',             'SATs, 11+, Y9 Mocks, GCSE',          '',      54,  true],
  ['M09', '2D shapes',              'SATs, 11+, Y2 Mocks',                '',      35,  false],
  ['M10', 'Roman numerals',         'SATs, 11+',                          '',      13,  true],
  ['M11', 'Fraction = decimal',     'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      15,  true],
  ['M12', 'Formulae not given',     'Y9 Mocks, GCSE, B-TEC',              '',      49,  true],
  ['M13', 'Exact trig values',      'GCSE, AS, Alevel',                   'Higher',33,  true],
  ['M14', 'The trig trick',         'GCSE, AS, Alevel',                   'Higher',33,  true],
  ['M15', 'Index laws',             'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      21,  true],
  ['M16', 'Graph shapes',           'Y9 Mocks, GCSE, AS, Alevel',         '',      40,  false],
  ['M17', 'Straight line',          'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      29,  true],
  ['M18', 'Averages',               'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      24,  true],
  ['M19', 'Pythagoras & trig',      'Y9 Mocks, GCSE, B-TEC',              '',      28,  true],
  ['M20', 'Angle rules',            'SATs, 11+, Y9 Mocks, GCSE',          '',      35,  true],
  ['M21', 'Area & perimeter',       'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      23,  true],
  ['M22', 'Percentages',            '11+, Y9 Mocks, GCSE, B-TEC',         '',      23,  true],
  ['M23', 'Rounding & bounds',      'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      35,  true],
  ['M24', 'Standard form',          'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      35,  true],
  ['M25', 'Sequences',              '11+, Y9 Mocks, GCSE',                '',      41,  true],
  ['M26', 'Quadratics',             'Y9 Mocks, GCSE, AS, Alevel',         '',      23,  false],
  ['M27', 'Probability',            'Y9 Mocks, GCSE, B-TEC',              '',      28,  true],
  ['M28', 'Primes, HCF & LCM',      'SATs, 11+, Y9 Mocks, GCSE',          '',      23,  false],
  ['M29', 'Sine & cosine rule',     'GCSE, AS, Alevel',                   'Higher',18,  false],
  ['M30', 'Circle theorems',        'GCSE',                               'Higher',28,  false],
  ['M31', 'Fractions',              'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      35,  true],
  ['M32', 'Differentiation',        'AS, Alevel',                         '',      40,  true],
  ['M33', 'Differentiation rules',  'Alevel',                             '',      29,  true],
  ['M34', 'Integration',            'AS, Alevel',                         '',      40,  true],
  ['M35', 'Integration methods',    'Alevel',                             '',      35,  true],
  ['M36', 'Logs & exponentials',    'AS, Alevel',                         '',      23,  true],
  ['M37', 'Binomial expansion',     'AS, Alevel',                         '',      17,  true],
  ['M38', 'Trig identities',        'AS, Alevel',                         '',      23,  true],
  ['M39', 'Double & addition',      'Alevel',                             '',      23,  false],
  ['M40', 'Radians',                'Alevel',                             '',      23,  true],
  ['M41', 'Series',                 'Alevel',                             '',      23,  false],
  ['M42', 'Circles & points',       'AS, Alevel',                         '',      23,  false],
  ['M43', 'Vectors',                'AS, Alevel',                         '',      29,  true],
  ['M44', 'SUVAT & forces',         'AS, Alevel',                         '',      29,  true],
  ['M45', 'Binomial distribution',  'AS, Alevel',                         '',      35,  true],
  ['M46', 'Normal distribution',    'Alevel',                             '',      29,  true],
  ['M47', 'Hypothesis testing',     'AS, Alevel',                         '',      23,  true],
  ['M48', 'Numerical methods',      'Alevel',                             '',      23,  false],
];

/**
 * RENAME A VALUE EVERYWHERE IT IS USED.
 *
 *     /exec?run=rename&name=…&pin=…&arg=English Lang.>English Language
 *
 * A subject is not stored once. It is on every resource that teaches it, on the options list that
 * offers it, on the pricing row that surcharges it, on every job booked for it and in the columns
 * a tutor lists what they teach in. Rename it in one place and the others stop matching — silently,
 * because a subject nothing matches is not an error, it is a subject with no resources.
 *
 * So it is renamed everywhere or nowhere. The pairs below are every column in the schema that
 * holds one of these values; a column added later that holds one needs adding here too, and the
 * health check will not catch that for you.
 *
 * CASE-INSENSITIVE, punctuation and all. "English Lang." and "english lang" are the same value to
 * everything else in this file — `norm` and `key` see to that — so a rename that only caught the
 * exact spelling would leave the variants behind and they would go on not matching.
 */
const RENAMEABLE = [
  ['options',   ['value']],
  ['pricing',   ['label']],
  /* NOT JUST THE SUBJECT. A rename is asked of a VALUE, and a value can be in any of these — the
     exam board was reachable in none of them, so `edexcel>Edexcel` would have reported success
     and changed nothing at all. Every column on this tab that holds a name somebody typed. */
  /* ---------- A RENAME NO LONGER REACHES THE LIBRARY, AND THAT HAS TO BE SAID ------------------
     `questions` WAS HERE — eight columns of it, every value on a paper that a facet is built from.
     The tab is gone: those 3,913 rows are `data/questions.json` in this repository, and Apps Script
     cannot write to a file in git.

     LEAVING THE LINE IN WOULD HAVE BEEN WORSE THAN REMOVING IT. `renameValue` does
     `read(TAB[name] || name)` and an unrouted name comes back `{ rows: [] }` — so the rename would
     have reported success, changed the options list and the pricing row, and left every paper in
     the library spelling it the old way. A subject nothing matches is not an error; it is a subject
     with no resources, which is the exact fault the paragraph above this list warns about.

     SO A RENAME IS NOW TWO JOBS: `?run=rename` for the sheets, and a find-and-replace over
     `data/questions.json` committed here. `check-rename.js` does not exist and this note is the
     only thing that will remind anybody — which is why it is this long. */
  ['jobs',      ['subject', 'level']],
  ['people',    ['teaches_1', 'teaches_2', 'teaches_3', 'teaches_4', 'teaches_5',
                 'subjects', 'level']],
  ['exams',     ['subject']],
  ['trips',     ['subject']],
];

/* ---------- TAB ACCESS ------------------------------------------------------------------------
   read(name) returns { sheet, headers, rows } where each row is an object keyed by header, plus
   _row = its sheet row number so writes know where to go. Cached per request: doGet touches
   seven tabs and would otherwise re-read them. */
const _cache = {};

/* ---------- A WRITE THAT GOES NOWHERE -------------------------------------------------------------
   `setCell` returns false for a column that does not exist, and `addRow` drops a key it has no
   header for. Both are correct — a write must never shift a row under the wrong headers — and both
   were SILENT, which is the single most expensive decision in this file.

   It is behind at least four faults already found: the avatar columns that were not in the schema
   so every wardrobe change was discarded; the four pricing fields written and lost four times over;
   the `pages` column before it existed. In each case the handler returned `success: true` and the
   value went nowhere. The person saw "Saved ✓".

   So every miss is recorded, and `jsonOut` — the one exit every reply passes through — turns a
   request that lost a value into an ERROR rather than a success. Nothing has to remember to check:
   a handler cannot report success for a save that did not happen, because the reply is rewritten
   on the way out.

   Cleared at the start of every request. Apps Script reuses an instance across requests, so a miss
   left lying around would be reported against whoever asked next.
--------------------------------------------------------------------------------------------- */
let WRITE_MISSES = [];

/* ---------- THE CALLBACK, WHEN THE PAGE CANNOT MAKE AN ORDINARY REQUEST ---------------------------
   A PAGE OPENED FROM A FILE HAS NO ORIGIN. Double-click index.html and the browser gives it the
   origin `null`, and `fetch` to anywhere else is refused before a single byte leaves — instantly,
   with "Failed to fetch" and no network involved. Nothing at this end is asked, so nothing at this
   end can be wrong, and every symptom looks like a dead backend.

   A <script> TAG IS NOT SUBJECT TO THAT. It has been allowed to load from anywhere since the web
   began, which is what JSONP is: the same reply, wrapped in a function call, delivered as a script
   instead of as data. Ancient, and it is the one thing that works from a file.

   ONLY WHEN ASKED FOR BY NAME. Without `?callback=` this changes nothing and the reply is the JSON
   it always was — so nothing that works today can be broken by it.

   WHAT IT CANNOT DO: a script tag is a GET. Every action — booking, saving, posting — is a POST,
   and no trick makes a POST leave a file:// page. So this restores READING from a file, and
   writing still needs the page to be served. That is worth saying plainly rather than discovering
   at the moment somebody tries to book something. */
let JSONP_CB = '';

/* ---------- SMALL HELPERS -------------------------------------------------------------------- */
const S = v => String(v ?? '').trim();
const N = v => { const x = parseFloat(String(v ?? '').replace(/[£$,\s]/g, '')); return isNaN(x) ? 0 : x; };
const norm = v => S(v).toLowerCase();
const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');   // name match that ignores spacing
const TRUE_ = v => /^(true|yes|1|✓)$/i.test(S(v));
/* A blank flag means YES. Every `active` column was added after its rows existed, so an empty
   cell is a row that predates the column rather than a row somebody switched off — and reading it
   as off would hide everything the moment the column appeared. Written out because the same
   three-term expression appeared in nine places and one of them will eventually be typed wrong. */
const ON_ = v => S(v) === '' || TRUE_(v);

/* ---------- AVAILABILITY ---------------------------------------------------------------------
   One cell, "m13,m14,tu09", replacing 77 TRUE/FALSE columns. */
const AVAIL_DAYS  = [['m','Mon'], ['tu','Tue'], ['w','Wed'], ['th','Thu'], ['f','Fri'], ['sa','Sat'], ['su','Sun']];
const AVAIL_HOURS = [9,10,11,12,13,14,15,16,17,18,19];

/* ---------- PEOPLE --------------------------------------------------------------------------- */
const ROLE_LABEL = { admin: 'Admin', tutor: 'Tutor', client: 'Client', student: 'Student' };

/**
 * POSTCODES INTO COORDINATES.
 *
 * postcodes.io, and the choice is deliberate: no key, so nothing secret ends up in a file anybody
 * can read; UK-only, which is the whole estate; and it returns FACTS — a coordinate is not
 * licensed imagery, so nothing here carries a condition about how it may be drawn.
 *
 * BULK, up to a hundred at a time. Eleven venues is one request rather than eleven, which matters
 * less for eleven than for the habit: a per-row fetch is the shape that turns into a rate limit
 * the day somebody adds a hundred rows.
 *
 * ALREADY-PLACED ROWS ARE SKIPPED unless forced, so this is safe to run whenever and after adding
 * a venue. `regeocode` re-reads everything, for when a postcode was wrong.
 */
/* THE POSTCODES I COULD VERIFY, from each council's own pages. Filled in automatically for any
   venue that has none, so nobody has to type them — and matched with `key()`, which ignores case
   and punctuation, so "Colliers Wood library" and "Colliers Wood Library" are the same place.

   NEVER OVERWRITES. A postcode already in the sheet is somebody's decision and wins over this
   list: the list is a starting point, not an authority, and a venue that moved would otherwise be
   moved back on every deploy.

   The rest of the estate is not here because I could not verify it, and a guessed postcode puts a
   venue in the Thames — which looks like a venue rather than a mistake. Add them to the sheet and
   the geocoder picks them up. */
/* ---------- WHO BELONGS TO WHOM, WHERE IT IS ALREADY KNOWN --------------------------------------
   THE FAMILY TAB IS EMPTY, and so is every `children` cell on the people tab. Danile, Rasa and
   Phoebe each have children on this system and nothing anywhere connects them — so a booking could
   not say who it was for, the calendar could not show a child's exam to their own parent, and
   `siblingsOf` returned nothing for everybody.

   The proper mechanism is `claimChild`: a parent asks and the CHILD accepts, and nothing is true
   until both have said so. That is right, and it is right for a stranger. It will not fill this
   tab any time soon — several of these children have no email address, so the invitation they
   would have to accept cannot reach them.

   YOU KNOW THESE FAMILIES. Written down here, by hand, from the people tab: a surname rule would
   catch Poliksa and Wickes and miss the Marcondes children entirely, because their mother's row
   says Cristina. An explicit list is longer and cannot be wrong in a way nobody notices.

   The seeder below writes them as ACCEPTED, which is the admin saying so rather than the parent
   claiming. That is a different act from a stranger claiming a child, and for a business where you
   know every family personally it is the honest one. Names are matched the way this whole file
   matches names — ignoring case and punctuation — so "JPMarcondes" and "JP Marcondes" are one
   person. A name that matches nobody is reported rather than skipped. */
const KNOWN_FAMILIES = {
  'Danile Cristina': ['LuccaMarcondes', 'TheoMarcondes', 'JPMarcondes'],
  'RasaPoliksa':     ['JokubasPoliksa'],
  'PhoebeWickes':    ['AugieWickes', 'MabelWickes'],
};

const KNOWN_POSTCODES = {
  'Colliers Wood Library': 'SW19 2HR',
  'Mitcham Library':       'CR4 2YR',
  'Morden Library':        'SM4 5DX',
  'York Gardens Library':  'SW11 2UG',
};

/* ---------- THE MAP, FROM OPENSTREETMAP ----------------------------------------------------------
   One request per world, run once, kept in the `map` tab.

   WHY OVERPASS AND NOT TILES. Tiles are pictures: they need a key, the key would be public in a
   GitHub Pages site, their terms forbid restyling, and a photograph of London cannot be drawn in
   this app's ink. Overpass returns the GEOMETRY — the actual chain of points that IS Wimbledon
   Common — which can be drawn any way at all. It needs no key and the data is ODbL, which asks for
   attribution and gets it under the map.

   SIMPLIFIED ON THE WAY IN. A borough's roads are tens of thousands of points and a phone does not
   need them: at the size this draws, anything under about fifteen metres of detour is invisible.
   Douglas–Peucker throws those away and keeps every corner that shows, which is the difference
   between 40KB and 4MB.
--------------------------------------------------------------------------------------------- */

/* What each world covers. A box round the borough, generous enough to hold the commons that sit on
   its edge — the map is drawn to about three miles, so the data has to reach at least that far. */
const MAP_BOXES = {
  Merton:     [51.3880, -0.2560, 51.4480, -0.1420],
  Wandsworth: [51.4380, -0.2320, 51.4900, -0.1300],
  Richmond:   [51.4200, -0.3480, 51.4920, -0.2600],
  Sutton:     [51.3300, -0.2500, 51.3960, -0.1300],
};

/* The folder, written in. It is not a secret — that folder is shared with anyone who has the
   link, or the pictures would not load on a single phone — so there is nothing gained by making
   it a setup step, and one thing lost: a step that can be forgotten.
   The config tab still overrides it, for the day the folder moves. */
const POSTS_FOLDER = '1piJQHYQ2h3I_f3ullEmDcNn_RGti4VVw';

/* ---------- THE REACTIONS EVERY POST OFFERS ------------------------------------------------------
   IN THE CODE, with the brand tab overriding it. It was the other way round — the tab and nothing
   else — so until somebody pasted six characters into one cell, no post on the site offered a
   single reaction, and what that looked like on a phone was a missing row rather than a missing
   setting. A feature that is off until somebody remembers a manual step is a feature that is off.

   The `laws` tab has had a fallback for exactly this reason since it was built. This is the same
   argument, and it should have been made here at the same time.

   WHY THESE SIX. They are the ones nobody has to learn, which matters more than whether they suit
   tutoring — a set people already know the meaning of is a set they use in the first week. 👏 is
   the one that carries most of the weight here: a child's work, a result, a finished project.

   AND WHY NOT MORE. 😢 and 😡 give a parent a public way to express disappointment about a child's
   work, and anybody with a problem should be messaging you rather than leaving a face on it. 🔥
   reads as ranking, and a class where one child's work gets fire and another's gets a thumb is a
   comparison you have published. 🤔 lands as criticism about half the time.

   Six is also the number that fits: `.react` is a 38px target, and on a 320px phone seven start
   looking like a grid rather than a row. */
const HOUSE_REACTIONS = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

/* ---------- WHAT THE BUSINESS IS CALLED, ON THE SERVER --------------------------------------------
   `brandName()` READ THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW, which the
   phone reads and Apps Script cannot. This is the string that function always fell back to, so
   nothing changes for anybody — and it is one place rather than a fallback repeated at each caller,
   which is the fault this repository records under `childrenOf` and under `MESSAGING`.

   IT IS THE SERVER'S COPY AND THE FILE IS THE APP'S. Two spellings of one name is the shape CLAUDE.md
   keeps writing about, so if it ever changes it changes in both — the file for every screen, this
   line for an e-mail's signature. */
const BRAND_NAME = '@family.';

/* ---------- WHO MAY MESSAGE WHOM ---------------------------------------------------------------
   A TABLE, not a set of conditions. One place to read, one place to audit, and a change that has
   to be made on purpose rather than by adding a clause somewhere.

   The important line is the one that ISN'T here: no adult may message a student privately.
   A private, unmonitored channel between an adult and a child is the thing every safeguarding
   policy in education exists to prevent, and it is the first question a school or a parent will
   ask. A student talks to an admin — that is all, and that channel exists so a child always has
   somebody to tell.

   Read as: MESSAGING[sender][recipient].
--------------------------------------------------------------------------------------------- */
const MESSAGING = {
  admin:   { admin: true,  tutor: true,  client: true,  student: true  },
  tutor:   { admin: true,  tutor: true,  client: true,  student: false },
  client:  { admin: true,  tutor: true,  client: false, student: false },
  /* A student may reach an admin and nobody else. Not a restriction on the child so much as a
     guarantee: whoever they talk to on this site is the person responsible for it. */
  student: { admin: true,  tutor: false, client: false, student: false },
};

/* How often anybody may send. Five minutes is not about spam — one person cannot flood a sheet by
   typing. It is about a row per message in a spreadsheet with a quota, and about a conversation
   that stays a conversation rather than becoming a stream of one-word lines. */
const MESSAGE_GAP_MS = 5 * 60 * 1000;

/* ---------- THE SHEET'S WORDS AND THE APP'S WORDS ----------------------------------------------
   A spreadsheet a person edits says `student` and `client`, because that is what a person writing
   in a cell would put. The app says `kid` and `parent`. Both are reasonable, and keeping them
   apart is fine — but the TRANSLATION has to live in one place.
   It did not: `toApp` was defined inside one handler and written out inline again in another, so
   the same rule existed twice and could drift. Named once here, where anything can reach it.
--------------------------------------------------------------------------------------------- */
const ROLE_TO_APP = { client: 'parent', student: 'kid' };
const ROLE_FROM_APP = { parent: 'client', kid: 'student' };

/* ---------- AVATARS ---------------------------------------------------------------------------
   The catalogue lives HERE, not in the browser, because it decides who may wear what. The site
   draws the shapes and needs to know the list; it must not be the thing that decides whether you
   have earned an item, or the answer is whatever a determined student edits it to be.

   free  — appearance basics. Everyone has them from the start: skin, hair, colours.
   level — earned by ticking off checklist topics, which is what XP counts.
   cost  — bought with credits, earned the same way.

   `slot` is what it replaces on the figure. One item per slot at a time.
--------------------------------------------------------------------------------------------- */
const AVATAR_ITEMS = [
  // --- free ---
  { id: 'none',      slot: 'headwear',  name: 'Nothing',    free: true },
  { id: 'none',      slot: 'faceware',  name: 'Nothing',    free: true },
  { id: 'none',      slot: 'shoulders', name: 'Nothing',    free: true },
  { id: 'none',      slot: 'handheld',  name: 'Nothing',    free: true },
  { id: 'plain',     slot: 'legs',      name: 'Plain',      free: true },
  { id: 'crop',      slot: 'hair',      name: 'Cropped',    free: true },

  /* --- hairstyles. The SHAPE is the item; the colour is free and set in the profile, so four
     styles across eight colours is thirty-two looks from four purchases. Selling the colours
     instead would have been eight cards for one object. --- */
  { id: 'fringe',    slot: 'hair',      name: 'Fringe',     level: 1 },
  { id: 'long',      slot: 'hair',      name: 'Long hair',  level: 3 },
  { id: 'bunches',   slot: 'hair',      name: 'Bunches',    cost: 15 },
  { id: 'curls',     slot: 'hair',      name: 'Curls',      cost: 20 },
  { id: 'mohawk',    slot: 'hair',      name: 'Mohawk',     level: 6 },

  // --- headwear ---
  { id: 'cap',       slot: 'headwear',  name: 'Cap',        level: 2 },
  { id: 'beanie',    slot: 'headwear',  name: 'Beanie',     cost: 20 },
  { id: 'headband',  slot: 'headwear',  name: 'Headband',   level: 4 },
  { id: 'crown',     slot: 'headwear',  name: 'Crown',      level: 10 },

  // --- faceware ---
  { id: 'glasses',   slot: 'faceware',  name: 'Glasses',    level: 1 },
  { id: 'shades',    slot: 'faceware',  name: 'Shades',     cost: 15 },
  { id: 'goggles',   slot: 'faceware',  name: 'Goggles',    level: 5 },

  // --- shoulders ---
  { id: 'scarf',     slot: 'shoulders', name: 'Scarf',      level: 2 },
  { id: 'backpack',  slot: 'shoulders', name: 'Backpack',   cost: 30 },
  { id: 'cape',      slot: 'shoulders', name: 'Cape',       level: 8 },

  // --- handheld ---
  { id: 'book',      slot: 'handheld',  name: 'Book',       level: 1 },
  { id: 'racket',    slot: 'handheld',  name: 'Racket',     level: 3 },
  { id: 'ball',      slot: 'handheld',  name: 'Football',   cost: 25 },
  { id: 'wand',      slot: 'handheld',  name: 'Wand',       cost: 40 },

  // --- legs ---
  { id: 'shorts',    slot: 'legs',      name: 'Shorts',     level: 2 },
  { id: 'jeans',     slot: 'legs',      name: 'Jeans',      level: 3 },
  { id: 'skirt',     slot: 'legs',      name: 'Skirt',      level: 3 },
];

/* ---------- WHAT A TUTOR/CLIENT MAY EDIT -----------------------------------------------------
   One list per role drives the edit form AND the write allow-list, so the two cannot drift.
   Anything not named here is unreachable by updateProfile — pin, role, xp and credits included. */
const PROFILE_GROUPS = {
  'About you':   ['first_name','last_name','headline','photo','video','years_experience',
                  'adjective_1','adjective_2','adjective_3'],
  'Where':       ['borough','city','town','travel_km'],
  'Group size':  ['max_students','min_students'],
  // One number: what an hour with this tutor costs the client. Their own pay is the minimum wage
  // and is fixed in the code, so this is the only pricing decision a tutor makes.
  /* One number for an hour with them, and one for what a second student is worth. The extra-seat
     fraction is theirs because the extra work is theirs — teaching two is more than teaching one,
     and by how much is a judgement only the person doing it can make. Your own share of it stays
     in config, so a tutor can price their effort without touching your margin. */
  'Your rate':   ['rate_per_hour', 'extra_seat_rate'],
  /* An address is a parent's to give and nobody else's business, so it sits with contact details
     rather than on the public card. */
  'Where you are': ['address', 'postcode'],
  'Yours':       ['favourite_colour'],
  'What you teach': ['teaches_1','teaches_1_level','teaches_2','teaches_2_level'],
  'Qualification 1': ['qual_1','qual_1_level','qual_1_grade'],
  'Qualification 2': ['qual_2','qual_2_level','qual_2_grade'],
  'Qualification 3': ['qual_3','qual_3_level','qual_3_grade'],
  'More qualifications': ['extra_quals'],
  'Availability': AVAIL_DAYS.reduce((a, [p]) => a.concat(AVAIL_HOURS.map(h => p + String(h).padStart(2,'0'))), []),
  'Contact':     ['email','phone','date_of_birth'],
  /* A NOTE TO YOURSELF, not a credential this site issues or checks — see the columns in SCHEMA.
     It is in all three group maps because a tutor, a parent and a student each have one library
     card and one set of digits they cannot remember. */
  'Library card': ['library_card','library_pin','library_note'],
};
const CLIENT_GROUPS = {
  'About you': ['first_name','last_name','photo'],
  'Contact':   ['email','phone'],
  'Where':     ['borough','city','town'],
  /* An address, because a printed copy has to go somewhere. Without it the basket can offer
     collection and nothing else, and the reason is invisible on a form that never asked. */
  'Where you are': ['address','postcode'],
  'Library card': ['library_card','library_pin','library_note'],
};
const STUDENT_GROUPS = {
  'About you': ['first_name','last_name','date_of_birth','photo'],
  'Contact':   ['email','phone'],
  'Where':     ['borough','city','town'],
  'Where you are': ['address','postcode'],
  'Library card': ['library_card','library_pin','library_note'],
};
/* `RESOURCE_GROUPS` WAS HERE — the seven sections of the admin form that relabelled a paper, and
   `RESOURCE_EDITABLE` was its flattened allow-list. Both are gone with the tab they wrote to. The
   form was built FROM this object (`resourceFields` on the payload, read by js/resource.js), which
   is why deleting it here takes the form with it rather than leaving one that offers fields the
   server would refuse. */

/* ONE map: which list in `options` fills a field's dropdown. Every form on the site reads this —
   the tutor's profile, the venue editor, the resource relabeller — so a field and a booking
   dropdown that mean the same thing are filled from the same rows and cannot drift.
   That's the point of it: `teaches_1` on a tutor and the client's subject picker are both
   `options -> subject`, so adding "Further Maths" as one row makes it offerable and requestable in
   the same edit. A field absent from here gets a plain input, which is right for a name or a link.

   This replaced scanning the sheet's data-validation RULES. The centralisation is the same idea
   and yours; the source is now rows you can see and edit rather than rules attached to cells,
   which is also what removed the 318,000-object scan that used to time the site out. */
const FIELD_OPTIONS = {
  // what a tutor teaches and what a client may ask for — deliberately the same list
  teaches_1: 'subject', teaches_2: 'subject',
  teaches_1_level: 'level', teaches_2_level: 'level',
  qual_1: 'subject', qual_2: 'subject', qual_3: 'subject',
  qual_1_level: 'level', qual_2_level: 'level', qual_3_level: 'level',
  qual_1_grade: 'grade', qual_2_grade: 'grade', qual_3_grade: 'grade',
  borough: 'borough', city: 'city', town: 'town', focus: 'focus',
  // resources
  subject: 'subject', document_type: 'document_type', key_stage: 'key_stage',
  tier: 'tier', exam_board: 'exam_board', exam_wave: 'exam_wave',
  company: 'company', band_type: 'band_type',
};
/* `RESOURCE_OPTIONS` WAS AN ALIAS FOR `FIELD_OPTIONS`, kept because the resource form read it
   under that name. There is no resource form. `FIELD_OPTIONS` itself stays — it fills the tutor
   profile, the venue editor and every booking dropdown, and its `subject` / `exam_board` / `tier`
   entries are still the lists those forms offer. */

const VENUE_GROUPS = {
  'Details':  ['name','description','photo','link'],
  /* The coordinates are not here. They are derived from the postcode and overwritten by the
     geocoder, so a hand-typed one would be silently replaced — which is worse than not offering
     the field at all. */
  'Where':    ['postcode','borough','city','town'],
  'Capacity & booking': ['max_students','min_students','notice_days'],
  /* The room, and the journey to it. Two costs of the same booking, edited together because
     that is how somebody thinks about a venue: what does this place cost me. */
  'Rate':     ['cost_per_hour', 'travel_cost'],
};
const flat = g => Object.keys(g).reduce((a, k) => a.concat(g[k]), []);
const PROFILE_EDITABLE = [...new Set([].concat(flat(PROFILE_GROUPS), flat(CLIENT_GROUPS), flat(STUDENT_GROUPS)))];
// Admin-only. `role` decides what someone can see and do, so it can't be self-served — and it's a
// comma list, because holding two roles is normal rather than an exception.
const PROFILE_READONLY = ['dbs_checked', 'role'];

/* ==================================================================================================
   WHAT A PERSON MAY CALL THEMSELVES

   `handle` IS NOT IN `PROFILE_EDITABLE` AND MUST NOT BE. Everything in that list is a fact about
   somebody that only they can know — a headline, a rate, a borough — and a wrong one is wrong for
   them alone. A handle is different in kind: it is how the rest of this site FINDS them, so it goes
   through a handler of its own with rules the form cannot skip.

   ---------- UNIQUENESS IS THE RULE THAT MATTERS, AND IT IS NOT ABOUT TASTE -----------------------

   `findPerson` resolves a person by `person_id`, then by `full_name`, then `first + last`, then
   `handle`, then `username` — FIRST MATCH WINS. So a handle that duplicates anybody's existing name
   or handle makes `changePin` check the PIN you typed against SOMEBODY ELSE'S row and tell you your
   own PIN is wrong. CLAUDE.md records that denial already; it happened by accident, to one person,
   because a call forgot to send an id. **Letting people choose their own handle turns an accident
   into something a person can do on purpose**, which is why this is checked against all three
   columns and not just `handle`.

   ---------- AND `handle` AND `username` ARE ONE FACT IN TWO COLUMNS -------------------------------

   Third occurrence of the shape this file keeps recording, after `needs_print`/`print_required` and
   `category`/`compliance`. `register` writes `username` as `norm(first + last)`; `doGet` reads
   `handle || username || first_name`; `findPerson` matches BOTH. So a change that wrote only
   `handle` would leave the old name resolving to that person for ever — they would have a new name
   and still answer to the old one. `changeHandle` writes both, together, or neither.
================================================================================================== */

/* A MONTH, AND THE REASON IS NOT TIDINESS. A blocklist is a floor and never a ceiling — somebody who
   can rename freely sits there trying variations until one gets past it, which is a game they win
   eventually. A cooldown turns that into a month of waiting per attempt. Admins are exempt, because
   an admin fixing somebody else's bad handle is the remedy rather than the abuse. */
const HANDLE_COOLDOWN_DAYS = 30;

/* THREE TO TWENTY, LOWER CASE, LETTERS DIGITS AND UNDERSCORE, STARTING WITH A LETTER.
   NO UNICODE, and that is the one rule here that is about safety rather than tidiness: `раul` with a
   Cyrillic е and `paul` are different strings that look identical, so a handle nobody can tell from
   somebody else's is impersonation with nothing to point at. ASCII only makes that impossible
   rather than something to spot. */
const HANDLE_SHAPE = /^[a-z][a-z0-9_]{2,19}$/;

/* NAMES THAT WOULD SPEAK FOR THE BUSINESS. Someone called @office or @admin messaging a parent is
   not rude, it is a person with the school's voice — and the roles system cannot help, because the
   name is what the parent reads. */
const HANDLE_RESERVED = ['admin', 'administrator', 'family', 'atfamily', 'office', 'staff', 'team',
                         'support', 'help', 'helpdesk', 'moderator', 'mod', 'owner', 'root',
                         'system', 'tutor', 'tutors', 'school', 'official', 'payments', 'billing',
                         'security', 'noreply', 'no_reply', 'contact', 'info'];

/* ---------- THE WORDS, AND WHAT THIS LIST IS AND IS NOT --------------------------------------------
   IT IS MATCHED AGAINST THE DE-LEETED FORM. `HANDLE_FOLD` below turns `f4gg0t` into `faggot` and
   `b_i_t_c_h` into `bitch` before anything is compared, because a filter that only catches the
   plain spelling catches nobody who is trying.

   IT IS DELIBERATELY SHORT. A long list is an arms race this site cannot win and does not need to:
   there are tens of users, every handle is visible to an admin the moment it is taken, the cooldown
   above makes a second attempt cost a month, and `handle_was` means a rename can be traced. This is
   the floor — the words nobody should have to see on a children's tutoring site — and the ceiling is
   a person looking. */
const HANDLE_BLOCKED = [
  'anal', 'anus', 'arse', 'bastard', 'bitch', 'bollock', 'boner', 'clit', 'cock', 'coon', 'cum',
  'cunt', 'dick', 'dildo', 'dyke', 'fag', 'fanny', 'fuck', 'gash', 'gook', 'incest', 'jizz',
  'kike', 'knob', 'minge', 'nigg', 'nonce', 'paedo', 'pedo', 'penis', 'piss', 'porn', 'prick',
  'pussy', 'queer', 'rape', 'retard', 'scrote', 'semen', 'sex', 'shag', 'shit', 'slag', 'slut',
  'smeg', 'spastic', 'spic', 'sperm', 'tits', 'titty', 'tosser', 'tranny', 'twat', 'vagina',
  'wank', 'whore', 'wog', 'nazi', 'hitler', 'kkk', 'isis', 'suicide', 'selfharm',
];

/* ---------- AND THE INNOCENT WORDS THOSE STRINGS ARE INSIDE ---------------------------------------
   THE SCUNTHORPE PROBLEM, and it is not hypothetical here: `classic` contains `ass` if `ass` were on
   the list, `analysis` contains `anal`, `cocktail` contains `cock`, `sextet` contains `sex`. A filter
   that refuses a real name and cannot say why is worse than one that misses a rude one, because the
   person it refuses has done nothing and has no way to argue.

   ONE WRITTEN REASON EACH, which is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` / `RETIRED_FACETS`
   pattern for a fifth time: a word here is a decision somebody made on purpose, and a NEW collision
   fails loudly instead of joining a list nobody reads. */
const HANDLE_ALLOWED = {
  analysis:   'the school subject, and the commonest false positive on any list with "anal" in it',
  analyst:    'a job',
  analytic:   'and analytical, analytically',
  canal:      'a canal',
  cocktail:   'and cockatoo, cockerel, cockney — a rooster and a bird and a Londoner',
  cockpit:    'an aeroplane',
  peacock:    'a bird',
  shitake:    'the mushroom, which people do spell without the second h',
  sextet:     'and sextant, sextile — six of something, and an instrument',
  middlesex:  'and Sussex, Essex, Wessex — English counties',
  scunthorpe: 'the town this whole problem is named after',
  penistone:  'a town in South Yorkshire',
  therapist:  'a job, and the classic worked example of why substrings are dangerous',
  assassin:   'a word, and a game children play',
  bassist:    'and bass, basset — a fish, an instrument and a dog',
  grassland:  'and grass, grasshopper',
  classic:    'and class, classical, classroom — the word this whole site is about',
  passage:    'and passenger, compass, embassy',
  titan:      'and titanium, titanic — the moon, the metal and the ship',
};
/* What an admin may change on a shop item. Same pattern as everything else: one list drives the
   form AND the write allow-list, so the two can't drift apart. */
const SHOP_GROUPS = {
  'What it is': ['name', 'brand', 'kind', 'description', 'photo'],
  'Who and how': ['audience', 'acquire'],
  'Price':      ['price_pence', 'price_ticks', 'price_coins', 'level_required'],
  'Wearable':   ['slot', 'art_id'],
  'Stock':      ['stock', 'max_per_person', 'returnable', 'value_pence', 'active'],
};
const SHOP_EDITABLE = flat(SHOP_GROUPS);

/* What an admin may change on a trip. Same one-list-drives-both rule as everywhere else. */
const TRIP_GROUPS = {
  'What it is':  ['name', 'focus', 'description', 'photo', 'link', 'provider'],
  'Cost & size': ['price_per_child', 'hours', 'min_children', 'max_children'],
  'Where & when': ['venue', 'address', 'date', 'notice_days'],
  'Admin':       ['active', 'notes'],
};
const TRIP_EDITABLE = flat(TRIP_GROUPS);

/* WHAT AN ADMIN MAY CHANGE ON A POST.
   `post_id` and `posted_by` are not here and must not be: one is the identity every like, vote
   and reaction points at, and the other is the record of who actually pressed the button — a
   field somebody can edit is not a record of anything.
   `poll` is here but guarded separately, because a vote is stored against the option's TEXT. */
const POST_GROUPS = {
  'What it says': ['caption', 'body', 'location'],
  'Where it came from': ['author', 'image'],
  'When':         ['posted_on', 'creation_date', 'uploaded_date'],
  'Poll':         ['poll'],
  'Admin':        ['pinned', 'active'],
};
const POST_EDITABLE = flat(POST_GROUPS);

/* The rooms every venue is described in terms of. A FIXED list rather than a builder: a venue has
   the spaces it has, and asking someone to invent names produces "Room 2", "room2" and "Small Rm"
   across eleven venues. Leave a slot blank and it simply isn't offered.
   Two of each size because that's what libraries actually have — two small rooms bookable at once
   is a different thing from one, and a booking has to be able to say which. */
const ROOM_SLOTS = ['Small room 1', 'Small room 2', 'Medium room 1', 'Medium room 2',
                    'Large room 1', 'Large room 2'];

const ROOM_GROUPS = {
  'Room':     ['venue', 'name'],
  'Rates':    ['rate_per_hour', 'concession_rate'],
  'Capacity': ['min_capacity', 'max_capacity'],
  'Admin':    ['active', 'notes'],
};
const ROOM_EDITABLE = flat(ROOM_GROUPS);

const LINK_GROUPS = {
  'Link':  ['name', 'url'],
  'Where': ['category', 'colour'],
  'More':  ['description', 'photo'],
};
const LINK_EDITABLE = flat(LINK_GROUPS);

const VENUE_EDITABLE = [...new Set(flat(VENUE_GROUPS).concat(
  AVAIL_DAYS.reduce((a, [p]) => a.concat(AVAIL_HOURS.map(h => p + String(h).padStart(2,'0'))), [])))];

/* ================== BOOKING STATE MACHINE ====================================================
   One machine, both sides. Four statuses, five verbs, and the rule that at most one side is
   Requested. Leaving REMOVES you: there is no Declined or Withdrawn status, the slot is cleared
   and the absence is the record. The events tab keeps the history that used to imply.
============================================================================================== */
/* The four words a participant's row can say, written from THEIR point of view.
   Renamed from Requested / Accepted / Paid / Locked, which read as things done TO you: on your own
   row "Accepted" sounded like someone had approved you, when it meant the two of you agree on the
   terms. These say what you are doing, and they read the same whichever side you're on:
     Waiting  you've asked; it's with the other side
     Agreed   terms are settled — payment is what's left
     Paying   payment sent, not yet confirmed
     Booked   confirmed and binding
   Free to rename because statuses are FOLDED from the events, never stored — there is no column
   holding an old value anywhere, so this costs no migration. */
const BM = { NONE:'', WAITING:'Waiting', AGREED:'Agreed', PAYING:'Paying', BOOKED:'Booked' };
const ACT = { REQUEST:'Request', ACCEPT:'Accept', DECLINE:'Decline', WITHDRAW:'Withdraw',
              PAY:'Pay', EDIT:'Edit', SAY:'Say' };

/* What each verb does to the mover, and who it removes. `clear` is how leaving works without a
   Declined or Withdrawn status: the person stops appearing, and the event log holds the history
   that used to be implied by a status nobody could read. */
const BM_EFFECT = {
  Request:  { mine: BM.WAITING, theirs: BM.NONE,   clear: ''     },
  Edit:     { mine: BM.WAITING, theirs: BM.WAITING, clear: ''    },   // un-readies everyone
  Say:      { mine: null,       theirs: null,      clear: ''     },   // a note changes no status
  Accept:   { mine: BM.AGREED,  theirs: BM.AGREED, clear: ''     },   // agreement is mutual
  Decline:  { mine: BM.NONE,    theirs: BM.NONE,   clear: 'them' },
  Withdraw: { mine: BM.NONE,    theirs: BM.NONE,   clear: 'me'   },
  Pay:      { mine: BM.PAYING,  theirs: BM.AGREED, clear: ''     }
};

/* ---------- PAGE COUNTS ----------------------------------------------------------------------
   Apps Script has no page-count API — not DriveApp, not the Drive advanced service, not
   DocumentApp. Pagination isn't something Drive stores; it's a property of how a file renders. So
   the only way to know is to read the file and count, which is what this does.

   Honest limits, because "automatically in sync" isn't quite achievable:
     • PDFs only. A Google Doc has no fixed page count until it's exported, and a Sheet has none
       at all. Those are skipped rather than guessed at.
     • It runs when called, not continuously. Nothing tells this script that a PDF changed, so a
       count is correct as of pages_checked and no fresher than that. A daily trigger is as close
       to "in sync" as this gets.
     • Files over 20MB are skipped. Reading one into a string to count pages would blow the
       execution's memory before it finished.
     • A page tree hidden inside a compressed object stream (PDF 1.5+) can defeat both methods
       below. Those come back 0 and are left for you to fill in, rather than being written wrong.

   THIS IS WHAT PRICES A PRINTED COPY. 2p a page needs a page count, and no spreadsheet formula
   can open a PDF — so `pages` is a CACHED column, filled here, not a computed one. A resource
   with no count is not free: it is unpriced, and the basket says so rather than offering it at
   nothing.
--------------------------------------------------------------------------------------------- */
const PAGES_MAX_BYTES = 20 * 1024 * 1024;
/* A CEILING, not a target. The real limit is TIME — a 20MB PDF takes seconds to fetch and a
   200KB one takes a fraction, so a fixed count is either wasteful on small files or fatal on big
   ones. The loop below stops when it runs out of minutes; this only stops a single run doing so
   much that a failure loses all of it. */
const PAGES_PER_RUN = 400;
/* Four minutes of a six-minute allowance. The two spare are for everything else the run does —
   reading the tab, writing back — and for a last file that turns out to be enormous. A sweep that
   is killed mid-way loses the writes it had not made, so stopping early is cheaper than being
   stopped. */
const PAGES_TIME_BUDGET = 4 * 60 * 1000;

/* ============================== GET ========================================================== */
/* ---------- RUNNING A JOB FROM A URL -------------------------------------------------------------
   Picking a function from the editor dropdown and pressing Run works, and is a thing you have to
   be at a computer with the project open to do. These are the same jobs, reachable from a phone.

   DEPLOYING RUNS NOTHING. It publishes code; it does not execute any of it. That is worth saying
   plainly because it is the reasonable assumption and it is wrong — and the two are easy to
   confuse, since both are things you do after pasting a file.

   AND THEY NEED A PIN. `?setup=1` has always been open, and it can only add tabs and columns, so
   it stays open. These are different: one of them creates an ADMIN ACCOUNT, and a URL that does
   that with no credentials is a URL anybody who has ever seen the address can use. So the same
   name and PIN that log you into the site, checked the same way.

   Usage:
     /exec?run=checkEverything&name=Halex%20Dias&pin=1234
     /exec?run=makeBrandAccount&name=Halex%20Dias&pin=1234&arg=4821

   THE CHICKEN AND EGG: if no admin row has a working PIN, nothing here can be reached, and the
   editor is the only way back. `dataProblems` reports that case for exactly this reason.
--------------------------------------------------------------------------------------------- */
const RUNNABLE = {
  /* Forced, and then CHECKED — the report says what it meant to do, and this says what is
     actually on the sheet afterwards. Those had never been the same question. */
  ensureSchema:      () => ({ ran: ensureSchema(), stillMissing: schemaGaps() }),
  schemaGaps:        () => schemaGaps(),
  makeBrandAccount:  a => makeBrandAccount(a),
  migrateLikes:      () => migrateLikes(),
  installTriggers:   () => installTriggers(),
  listTriggers:      () => listTriggers(),
  /* ---------- THE SPREADSHEET AS THE CONTROL PANEL ----------------------------------------------
     `installSheetWatch` is what makes an edit typed into a tab reach the site. `sheetWatchStatus`
     answers the question that used to have no answer at all — "is my sheet actually connected?" —
     without opening the editor, which is the whole point of these being URLs.
     `clearPayloadCache` and `warmPayload` are the two halves of it by hand, for the case where you
     have changed something and do not want to wait even a minute to see it. */
  installSheetWatch: () => installSheetWatch(),
  sheetWatchStatus:  () => sheetWatchStatus(),
  clearPayloadCache: () => { clearPayloadCache(); return { cleared: true, generation: payloadGen_(),
                             means: 'the next request rebuilds from the sheet as it is now' }; },
  warmPayload:       () => warmPayload(),
  checkEverything:   () => checkEverything(),
  checkPostsFolder:  () => checkPostsFolder(),
  /* Reachable from a URL like everything else — but note that a URL CANNOT grant a scope. This
     will report what the deployment's existing token can do; raising the consent screen has to be
     a run from the editor. */
  authoriseDrive:    () => authoriseDrive(),
  checkScopes:       () => checkScopes(),
  /* Turn postcodes into coordinates. Run it after adding a venue; it skips anything already
     placed, so running it twice costs one request and changes nothing. */
  geocode:           () => geocodeVenues(),
  /* The ground itself, from OpenStreetMap. Once per world; name one to fetch it again. */
  fetchMap:          a => fetchMap(a),
  regeocode:         () => geocodeVenues(true),
  rename:            a => renameValue(a),
  seedOptions:       () => seedOptions(),
  /* Write the known families into the family tab. Safe to run whenever — it never changes a link
     that already exists. */
  seedFamilies:      () => seedFamilies(),
  /* Fill in the wearable prices the code already holds, for a sheet that ran `seedAvatarItems`
     before it knew which columns the merged tab had. Never overwrites a cell with anything in it,
     so it is safe to run whenever and tells you how many it left alone. */
  priceWearables:    () => repairShopPrices(),
  /* `seedPastPapers`, `seedALevelPapers`, `dropOldALevelPapers` and `ensureResourceIds` WERE HERE.
     All four wrote rows into the `questions` tab, and there is no such tab — the papers are
     `data/questions.json` in this repository, and CLAUDE.md has said "do not seed that tab" since
     the real rows were found. A seeder pointed at nothing is worse than no seeder: it appends to
     whatever tab the name happens to resolve to, reports how many it wrote, and is believed. */
  /* The Colliers Wood landmarks, with their surveyed outlines. Safe to run whenever — a landmark
     already on the tab is left exactly as it is. */
  seedLandmarks:     () => seedLandmarks(),
  /* The Colliers Wood landmarks, with their real outlines. Safe to run again — anything already on
     the tab is left as it is. */
  seedLandmarks:     () => seedLandmarks(),
  /* The British holidays of a year, computed. `&arg=2027` for a different one; without an arg it
     does the year we are in. Safe to run whenever — a row already there is left alone. */
  seedHolidays:      a => seedHolidays(a),
  /* FORGET A ONE-OFF JOB, so it runs again on the next request. For the case where it failed and
     was marked attempted — which is the right default, and leaves no way back without this.
       ?run=rerun&name=…&pin=…&arg=likes-to-reactions
       ?run=rerun&name=…&pin=…&arg=schema */
  rerun: a => {
    const props = PropertiesService.getScriptProperties();
    const id = S(a);
    if (id === 'schema') { props.deleteProperty('SCHEMA_VERSION'); return 'the schema will rebuild'; }
    if (!MIGRATIONS.some(m => m.id === id)) {
      return { error: 'No job called "' + id + '".', jobs: MIGRATIONS.map(m => m.id) };
    }
    props.deleteProperty('MIGRATED_' + id);
    return id + ' will run again on the next request';
  },
};

/* ---------- THE SHEET CATCHES UP WITH THE CODE, BY ITSELF -----------------------------------------
   Deploying publishes code and touches nothing else. That is the reasonable expectation and it is
   wrong, and being wrong about it costs a column that silently does not exist — which is entry
   after entry on the list in the notes: a field written to a header that is not there, `setCell`
   returning false, and the value going nowhere with nothing said.

   So the schema brings itself up to date on the FIRST REQUEST AFTER A NEW VERSION. Once, not on
   every load: the version string is recorded, and a request that finds it already recorded does
   nothing but read one property.

   THE VERSION IS WRITTEN BEFORE THE WORK, not after. If ensureSchema throws — a tab renamed, a
   permission withdrawn — recording it afterwards would mean every single request retried and
   failed, and the site would be permanently slow for a reason nobody could see. One attempt per
   deploy; a failure is reported in `health` and `?run=ensureSchema` retries it deliberately.

   `BACKEND_VERSION` is therefore not decoration any more. Bumping it is what triggers this, which
   is the other reason every paste that changes behaviour should change it.
--------------------------------------------------------------------------------------------- */
/* ---------- THE ONE-OFF JOBS, RUN ONCE, BY THEMSELVES ---------------------------------------------
   The schema catches up whenever the version changes. These are different: each is a job that has
   to happen exactly once in the life of the sheet, and once it has, running it again is either
   pointless or harmful. Turning old likes into reactions is a one-way door. Installing a trigger
   twice gives you two.

   So they are named, and the name is what is remembered rather than the version — a migration
   appended six deploys from now still runs, and one that has already run never does again, however
   many times anything is deployed.

   ADDING ONE IS ADDING A ROW HERE. That is the whole point: the alternative is a function somebody
   has to be told about, and being told about it is the step that gets missed.

   TWO RULES for anything added:
     · IT MUST BE FAST. This runs inside somebody's page load. Read a range, change the array,
       write the range. A loop doing one write per row is what turned the site into an HTML error
       page the first time the schema check ran on a request.
     · IF IT CANNOT BE FAST, IT IS A TRIGGER. `closeFinishedJobs` and `geocodeVenues` are the two
       that qualify: they are not here, `installTriggers` is, and the trigger does the slow work
       overnight with nobody waiting on it.
--------------------------------------------------------------------------------------------- */
const MIGRATIONS = [
  { id: 'likes-to-reactions',
    what: 'every old like becomes a 👍, keeping the date it was pressed',
    run: () => migrateLikes() },

  { id: 'nightly-jobs',
    what: 'the page-count sweep and the job closer, on a daily trigger',
    run: () => installTriggers() },

  /* The nightly list gained the geocoder, and `nightly-jobs` has already run — a migration is
     remembered by its id, so the only way to install a new trigger is a new id. It removes and
     re-adds all three, so running it cannot leave two of anything. */
  { id: 'nightly-jobs-with-geocode',
    what: 'the nightly list again, now including the geocoder',
    run: () => installTriggers() },

  /* "English Lang." and "English Language" were two spellings of one subject, on 48 rows and 198
     rows — and to everything downstream they are two different subjects, so a resource filed under
     one does not appear when you pick the other.
     Here rather than as a URL somebody has to assemble, because a rename that has to be
     remembered is a rename that happens once and then never again for the next pair. Named, so it
     runs on the first request after this deploy and never a second time. */
  { id: 'english-lang-to-english-language',
    what: 'every "English Lang." becomes "English Language"',
    run: () => renameValue('English Lang.>English Language') },

  /* THE SAME RENAME AGAIN, under a new name, because the first one ran before it knew how to
     merge. "English Language" already existed, so renaming onto it left the subject listed twice
     in the dropdown and priced twice in the pricing tab — and a subject with two multipliers is
     priced by whichever row is read first, which is a fault that surfaces on an invoice rather
     than on a screen.
     Running it a second time renames nothing, finds the duplicates, and removes them. That is
     safe precisely because the rename is idempotent: the work is in the cleanup at the end of it.
     A migration is remembered by its ID, so this is the only way to make one happen again — which
     is the right shape. The old one is a record of what was done; this is a record of the fix. */
  { id: 'english-language-merge-duplicates',
    what: 'one subject in the dropdown and one row in pricing, not two of each',
    run: () => renameValue('English Lang.>English Language') },

  /* ONE SPELLING OF EACH EXAM BOARD.
     107 rows say `edexcel`, one says `Edexcel`. To a person that is one board; to the funnel it is
     two answers to "which exam board", one of which leads to a single resource — and a facet whose
     values are the same word twice is worse than no facet, because it makes somebody choose
     between two things that are not different.
     `renameValue` compares the way the rest of this file compares names — ignoring case and
     punctuation — so this catches every spelling and settles on the one written here. */
  { id: 'exam-board-one-spelling',
    what: 'every spelling of Edexcel becomes "Edexcel"',
    run: () => renameValue('edexcel>Edexcel') },

  /* PUT THE VENUES ON THE MAP, without anybody being asked to do anything.
     Fills in the postcodes that are known, then turns every postcode into coordinates. Runs on the
     first request after this deploy and never again — which is right: afterwards the coordinates
     are in the sheet, and re-deriving them every load would be a network call per visitor for an
     answer that cannot have changed.
     A venue added later has no coordinates and sits at the edge of the map saying so. Running
     `geocodeVenues` from the editor picks it up, and so does `?run=geocode`. */
  { id: 'venue-coordinates',
    /* SAFE TO REPEAT, so it is allowed to fail and try again. It writes only what is missing and
       never overwrites, so running it twice does what running it once did. */
    retry: true,
    what: 'venues get their postcodes and coordinates, so the map can place them',
    run: () => {
      const seeded = seedPostcodes();
      const out = geocodeVenues();
      /* THROWN, so the ledger does not record it.
         `geocodeVenues` CATCHES its own network failure and returns `{ error }` rather than
         throwing — which is right for a URL somebody ran by hand, where a message beats a stack
         trace. It is wrong here: a migration that returns quietly has succeeded as far as the
         ledger is concerned, so the one thing standing between the venues and the map — an
         authorisation prompt — was recorded as done and never tried again.
         The retry flag alone did not fix it, because nothing was failing loudly enough to retry. */
      if (out.error) throw new Error(out.error);
      out.seeded = seeded;
      return out;
    } },

  /* PUT THE VENUES ON THE MAP. It was a URL somebody had to assemble and run, which is a chore
     invented by whoever wrote it — the work is entirely mechanical and the machine is right here.
     Once, on the deploy after the postcodes exist. Anything filled in later is caught by the
     nightly sweep, so nobody ever runs this by hand unless they want it done in the next minute
     rather than tonight. */
  { id: 'place-the-venues',
    what: 'every venue with a postcode gets its coordinates',
    run: () => geocodeVenues() },

  /* THE FAMILIES, WRITTEN DOWN AT LAST.
     Three parents on this system have children on it and nothing connected them — the family tab
     was empty and every `children` cell was blank. So a booking could not say which child it was
     for, a parent could not see their own child's exam on the calendar, and every student had no
     siblings.
     Safe to repeat: an existing link is left exactly as it is, whatever it says. */
  { id: 'seed-the-families',
    retry: true,
    what: 'the families we already know get their links, so a booking can say who it is for',
    run: () => seedFamilies() },

  /* ---------- THREE PAPER MIGRATIONS WERE HERE, AND THEIR IDS STAY SPENT -------------------------
     `edexcel-maths-past-papers`, `drop-empty-alevel-papers` and `edexcel-alevel-maths-past-papers`
     seeded 120 rows into the `questions` tab between them. The tab is gone; the papers they wrote
     are in `data/questions.json` along with everything else, which is where a bulk edit belongs.

     THE IDS ARE NOT REUSED. A migration is remembered by its id in script properties, so a NEW job
     given one of these names would be marked already-done on every database that has ever run the
     old one and would never run at all. That is the fault this whole ledger exists to prevent, and
     it is invisible — nothing fails, the job simply does not happen. */

  /* THE LANDMARKS TAB HAS BEEN EMPTY SINCE IT WAS ADDED. Five real buildings with their real
     outlines — every corner as surveyed, not a rectangle drawn round them. */
  { id: 'colliers-wood-landmarks',
    retry: true,
    what: 'the Colliers Wood landmarks get their outlines',
    run: () => seedLandmarks() },

  /* A SECOND `colliers-wood-landmarks` WAS HERE, with the same id as the one above. `pending` is
     worked out before the loop runs, so both were attempted on the same request — twice the work
     for one job, and the ledger could only ever remember one of them. Harmless because the seeder
     is idempotent, which is exactly why it survived: nothing broke and nothing said anything. */

  /* EVERY WEARABLE IN THE SHOP HAS BEEN FREE SINCE THE TWO TABS WERE MERGED, and `seedAvatarItems`
     cannot fix it: its first line returns early once any avatar row exists. So the seven paid
     wearables have had an empty `price_coins` and — the half that actually breaks it — an empty
     `acquire`, which is the word `doGet` reads to decide which price column to look in.
     Safe to repeat, and the reason is the whole of why this is a migration rather than a reset: it
     writes only into cells that are empty, so a price somebody has typed survives it. */
  { id: 'price-the-wearables',
    retry: true,
    what: 'the wearables get the prices they have in the code, without touching one anybody typed',
    run: () => repairShopPrices() },
];

/* ============================== POST ========================================================= */
/* ---------- WHO MAY DO WHAT ------------------------------------------------------------------
   Every action, and the one thing that decides whether it is allowed. Thirteen handlers each
   wrote their own `if (!isAdminPerson(body.adminName)) return ...` — thirteen chances to forget,
   and forgetting looks exactly like working.
   Stated as data, so the answer to "can a student do this?" is one line to read rather than four
   hundred to search. An action missing from this table is refused, which means a new handler is
   locked until somebody decides who it is for — the safe way round.

     'admin'  — only an admin
     'anyone' — no account needed: registering, verifying, logging in
     'self'   — a signed-in person acting on their own row; the handler checks whose
--------------------------------------------------------------------------------------------- */
const ACTION_ACCESS = {
  // Open by necessity — you cannot be signed in to sign in.
  register: 'anyone', verifyEmail: 'anyone', verifyLogin: 'anyone',
  /* SIGNING IN WITH GOOGLE. `anyone` for the same reason as the two beside it — you cannot be
     signed in to sign in — and the handler proves identity by asking Google rather than by
     believing the request, which is the difference between this and the entry removed below. */
  googleLogin: 'anyone',
  /* `self`, so the token is resolved and the session ended belongs to whoever holds it. */
  signOut: 'self',
  /* `relogin` WAS HERE, AND IT WAS THE WAY IN. It reached the same handler as `verifyLogin` with
     the PIN comparison switched off for it by name — so a request naming somebody came back with
     their `person_id`, e-mail, handle and role, and `person_id` is the whole of what every `self`
     action checks. A PIN guarded the front door and this stood beside it handing out keys.

     NOTHING CALLED IT. Not one line in `js/`, not the login screen, not the phone — the same
     condition this file already applies to `likePost` two entries down: an endpoint nothing calls
     is an endpoint nobody maintains. The difference is that a dead read is untidy and a dead
     credential issuer is a way in.

     SIGNING IN AGAIN IS `verifyLogin`, which is what the app has always used, and it asks for the
     PIN. If a silent re-sign-in is wanted later it needs a token issued at login and checked here,
     which is a different thing from trusting a name. */
  imageData: 'anyone',          // proxies a picture for the share canvas; reads nothing private

  // A person acting on their own record. Each handler still checks WHOSE row it is.
  updateProfile: 'self', saveNotepad: 'self', saveTodo: 'self', confirmDetails: 'self',
  saveAvatar: 'self', saveFriends: 'self', saveScore: 'self', saveTtHighscore: 'self',
  myReferral: 'self',        // your own code, and who came through it
  saveTopics: 'self', toggleVenueComfort: 'self',
  saveExam: 'self', deleteExam: 'self', redeem: 'self',
  /* `likePost` was here. A like is a reaction with one option, so the heart and the 👍 were two
     counts of the same gesture. The action is gone rather than left working-but-unused: an
     endpoint nothing calls is an endpoint nobody maintains, and this table refuses anything it
     does not name, so an old phone still trying gets a sentence rather than a silent write to a
     tab the site no longer reads. */
  votePoll: 'self', reactPost: 'self',
  /* SAYING SOMETHING UNDER A POST, AND TAKING IT DOWN. Both `self` for the same reason the message
     actions are: the gate can only check that somebody is signed in, and WHOSE comment it is is a
     question only the handler can answer — an admin may take down anybody's, an author only their
     own, and neither of those is a thing this table can see. */
  addComment: 'self', deleteComment: 'self',
  /* Reading the folder, to choose a photograph already in it. Admin, because it lists what has not
     been posted yet — which is a view of your Drive rather than of the site. */
  folderFiles: 'admin',
  /* `orderPrints` WAS HERE and the handler priced a print from the SHEET, deliberately, because a
     total posted by a browser is a total the client chose. There is no sheet to price it from —
     the page counts are in `data/questions.json` now, which the backend cannot read — and nothing
     on the front end ever called it: `cart-send` in js/resource.js has always been a toast saying
     checkout is the next thing to build. A door with no handle on either side. */
  /* A parent asks; only the named child may answer. Both `self` — the handlers check WHO, which
     is the part that matters and the part a gate cannot see. */
  claimChild: 'self', answerClaim: 'self',
  /* All `self`: each handler checks the message is the asker's own, and the POLICY table decides
     who may write to whom. The gate cannot know either, so it only checks somebody is signed in. */
  sendMessage: 'self', messages: 'self', readMessage: 'self', flagMessage: 'self',
  /* `self`, because it needs the current PIN — the gate cannot check that, only the handler can.
     An admin resetting somebody else's is handled inside, where the old PIN can be waived. */
  changePin: 'self', changeHandle: 'self',
  createCheckout: 'self', finalizePayment: 'self',
  move: 'self', tutorMove: 'self', createJob: 'self',
  /* JOINING THE LIST. `self` — anybody signed in may put themselves on it, and the handler checks
     it is their own name they are adding. Creating the session it joins is the same act, because a
     waitlist nobody has joined is not a thing worth having a row for. */
  joinWaitlist: 'self',
  /* ---------- OPENING A LIST IS ADMIN, AND HAD TO BE SAID HERE ------------------------------------
     THIS LINE IS THE WHOLE BUG. `accessDenied` runs before any handler and refuses anything not
     classified — "an action nobody has classified is refused", which is the right design and
     exactly what happened: the handler was written, checked, shipped and deployed, and the gate in
     front of it had never heard of it. The error said "That action is not recognised", which is
     true and reads as "no such action exists".

     THREE HOURS ON A MISSING LINE IN A TABLE. `check-doors` matches buttons to handlers, and
     nothing matched handlers to this gate — so a handler could be complete and unreachable and
     every check passed. See `check-access.js`. */
  openWaitlist: 'admin',
  /* ANYBODY SIGNED IN, FOR THEIR OWN. `self` is the right level: the handler looks the person up
     from the signed-in name and never trusts a person_id off the body, so one person cannot star
     something as another. */
  favourite: 'self',
  /* JOINING A FESTIVE EVENT. `self` — anybody signed in may take a place, and the handler checks it
     is their own name going down. */
  joinFestive: 'self',

  // The books, the prices, the rooms, the people list.
  diagnosePeople: 'admin', getProfile: 'admin', listPeople: 'admin',
  updateVenue: 'admin', updateConfig: 'admin', updatePricing: 'admin',
  updateShop: 'admin', deleteShopItem: 'admin',

  saveRoom: 'admin', updateTrip: 'admin', addTrip: 'admin',
  /* `updateResource`, `editResource` and `deleteResource` WERE HERE. All three wrote cells on a
     document row of the `questions` tab, and the tab is in this repository now — a relabel is a
     commit to `data/questions.json`, which is the whole reason that tab was the one to move. */
  editPost: 'admin', deletePost: 'admin',
  setListed: 'admin', scanPosts: 'admin',
  /* ANYBODY SIGNED IN MAY POST. What differs is what happens next: an admin's goes up, and
     everybody else's waits for you. The gate cannot express that — it only knows whether somebody
     is signed in — so the handler decides, which is right: "may they do this" and "does it need
     checking" are two questions and only the first belongs here. */
  addPost: 'self',
  /* Letting one through, or turning it down. Admin, obviously — this is the whole point of the
     waiting. */
  approvePost: 'admin',
  orderPosted: 'admin',
  /* MARKING A SESSION PAID BY HAND. Admin and nothing else, obviously — it is the one action on
     this site that says money arrived without a payment processor having said so. */
  markPaid: 'admin',
  /* ENDING A SESSION. Admin only, and deliberately: a client leaving a session is `move` with a
     Withdraw and removes only themselves. This removes EVERYBODY, which is a decision about other
     people's booking and belongs to whoever runs the business. */
  deleteJob: 'admin',
  /* LINKING A CHILD TO A PARENT WITHOUT ASKING THE CHILD. `claimChild` is the version a parent
     uses and it needs the child to accept — because a parent claiming a child unilaterally is
     precisely what the family tab exists to prevent. This is not that: it is the person who runs
     the business recording a family they know, which is the same act as typing it into the
     spreadsheet and is the reason it is admin and nothing else. */
  linkChild: 'admin', unlinkChild: 'admin',
  /* Reports every tab and column in the spreadsheet. It was open to anyone, which hands a
     stranger the shape of the whole database — the thing you would want before attacking it. */
  debugTabs: 'admin',
  /* Invitations. Opening one needs no account — that is the entire point, since the person being
     invited does not have one yet. */
  openInvite: 'anyone', acceptInvite: 'anyone',
  sendInvites: 'self',
};