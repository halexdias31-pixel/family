# js/check-flow.js

The full text of comments in `js/check-flow.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-flow.js DOES THE APP ACTUALLY WORK.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-flow.js

   DOES THE APP ACTUALLY WORK. The other five checkers read the source; this one RUNS it.

   WHAT THEY CANNOT SEE, and why this exists. `check.js` proves every name is declared. `check-doors`
   proves every button has a handler. `check-columns` proves every column exists. All five can pass
   while the app does nothing useful — because none of them ever loads a payload, draws a screen, or
   presses anything. Every fault that cost a day this month was of that kind:

     · the booking form submitted with the client's name in the wrong field
     · `doGet` never sent `kind`, so every waitlist drew as an ordinary session
     · the join button sent `move` on a class, which is the wrong act entirely
     · a payload arrived and was dropped because a variable read its own replacement

   Not one of those is a missing name, a dead rule or an absent column. Every one of them would have
   been caught by pressing the thing once.

   SO IT PRESSES THE THING. A real DOM, the real eighteen files in the real order, a fake backend
   that answers with a payload of the shape `doGet` sends — then it signs in, opens screens, walks
   the booking form down both paths, and looks at what came out and what got sent.

   THE FAKE BACKEND IS THE ONE THING TO KEEP HONEST. It answers with the SHAPE the real one answers
   with, and if the two drift this test passes while the app breaks — which is the failure mode of
   every test like it ever written. The shape is in `PAYLOAD` below, in one place, with the real
   field names, so drift is at least visible when somebody looks.

     node check-flow.js

   Add a journey by adding a `check(...)`. They are independent: one failing does not stop the rest,
   because a report that stops at the first fault tells you about one fault.
================================================================================================== */
```

### ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE

top level, before `loadOrder_`

```
/* ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE ---------------------------------------
   THIS WAS A HAND-MAINTAINED COPY of the list in `index.html`, and CLAUDE.md already records what
   that costs: `select`, `collections` and `tiles` were added there and never here, so this checker
   read twenty-one files and was silent about three — one of them `tiles.js`, where every card
   action in the app is built.

   IT DRIFTED AGAIN THE MOMENT `library.js` WAS ADDED, which is the second time and the reason it is
   now derived. `index.html` IS the order — it is the file the browser obeys — so anything that
   needs the order asks it rather than remembering it. */
```

### ---------- THE PAYLOAD, IN THE SHAPE THE BACKEND SENDS

top level, before `seat`

```
/* ---------- THE PAYLOAD, IN THE SHAPE THE BACKEND SENDS ------------------------------------------
   Small but real: two tutors, two venues, an interval, and one job of each kind. Anything the app
   reads has to be here under the name `doGet` actually uses, which is the whole risk of a fake —
   so the names are worth checking against `60_doGet.gs` whenever this file is edited. */
```

### `whenCould` IS WHAT `doGet` SENDS ON EVERY WAITING LIST — `waitlistWhen`'s tally of the two families' own answers, most popular first — and this list never

in `jobs`

```
/* `whenCould` IS WHAT `doGet` SENDS ON EVERY WAITING LIST — `waitlistWhen`'s tally of the two
         families' own answers, most popular first — and this list never carried one, so the only
         thing on the page that answers the tutor's question was drawn by no journey here. The
         shape is the backend's: `people` who answered, and each phrase with its count. */
```

### ---------- `client` IS SENT AND THIS PAYLOAD DID NOT SEND IT

in `payload`

```
/* ---------- `client` IS SENT AND THIS PAYLOAD DID NOT SEND IT --------------------------------
     `doget.gs` CARRIES A NOTE ABOUT THIS EXACT FIELD: *"`myJobs_` ON THE PHONE FILTERS ON
     `j.client` AND `j.tutor`, AND NEITHER WAS EVER SENT."* It was found and fixed at that end, and
     this payload — whose own heading says "anything the app reads has to be here under the name
     `doGet` actually uses, which is the whole risk of a fake" — was never brought into line.

     WHAT IT COST IS A WHOLE COLUMN. `myJobs_` returned nothing for anybody here, so the Booking
     column drew one page — the form — for every journey in this file, and the receipts that are
     pages after it were never on a screen any of them looked at. That is how a paged column with
     no `PAGER` entry survived: the journey written to catch exactly that could only see one page,
     and one page is not a disagreement.

     DERIVED FROM THE SEAT rather than typed a second time, so the roster and the client cannot
     disagree — which is the same reason `seat()` takes a default at all. The tutor is already on
     each row. */
```

### ---------- PRICED, SO THE JOURNEYS BELOW ARE NOT PASSING ON AN EMPTY ROOM

in `payload`

```
/* ---------- PRICED, SO THE JOURNEYS BELOW ARE NOT PASSING ON AN EMPTY ROOM --------------------
       THIS PAYLOAD IS NOT `check/fixture.json`, and that caught me out the first time: the laminate
       journeys read `laminatePrice`, which returns null when the sheet has no rate, and both took
       their "nothing is offered" branch and reported OK — including against a deliberately broken
       `cartMoney_`. A check that cannot reach its subject must not read as a pass; the branch is
       still there because an unpriced upgrade is a real state worth asserting about, but the rate
       is here so the branch that matters is the one that runs. */
```

### ---------- ONE APP, IN A REAL DOM

top level, before `boot`

```
/* ---------- ONE APP, IN A REAL DOM ---------------------------------------------------------------
   Built fresh for every journey. Sharing one would be faster and would mean a journey that leaves a
   sheet open changes what the next one sees — which is how a test suite starts passing or failing
   depending on the order it runs in. */
```

### ---------- EVERY GET IS WRITTEN DOWN, AND A JOURNEY MAY ANSWER ONE ITSELF

in `boot`

```
/* ---------- EVERY GET IS WRITTEN DOWN, AND A JOURNEY MAY ANSWER ONE ITSELF ------------------------
     THE STUB ANSWERED EVERY GET WITH THE PAYLOAD, so a journey could neither serve a real file nor
     ask what was asked for. The Bible needs both: an admin's reader has to be handed the real
     `data/bible/` files, and "a student never downloads a book" is a question about what was
     FETCHED, which only a list of fetches can answer. `serve` returns a body, `null` for a 404, or
     `undefined` to fall through to the payload as before — so every other journey is unchanged. */
```

### ---------- THE STUB HAD NO `text()`, AND THAT HID EVERY WRITE'S SUCCESS PATH

in `w.fetch`

```
/* ---------- THE STUB HAD NO `text()`, AND THAT HID EVERY WRITE'S SUCCESS PATH ----------------
       `api()` IN shell.js READS `r.text()` AND PARSES IT, deliberately — an Apps Script error page
       is HTML, and reading it as text first is what turns "Unexpected token '<'" into the sentence
       the server actually said. This stub answered with `json()` only. So `r.text` was undefined,
       every POST rejected with a TypeError, and the `.then` of every write in the app was
       unreachable from here.

       NOTHING FAILED, WHICH IS WHY IT LASTED. The journeys that press a send button assert on
       `sent` — the list this stub fills in before answering — and that is populated whether the
       reply is readable or not. So "a class books through joinWaitlist, a session through
       createJob" passed while proving only that the request left; what the app does with the
       answer had never run once.

       Found by a journey that asked what is on the screen AFTER a booking is sent, and got the
       same screen as before. Both shapes now, so a caller may read either. */
```

### JSDOM HAS NO MEDIA PLAYER.

in `boot`

```
/* JSDOM HAS NO MEDIA PLAYER. Reels are real `<video>` files now, and leaving a column pauses every
     clip on it — which jsdom answers with a "not implemented" stack trace per clip per journey, a
     wall of red over a run that passed. A video that does nothing is what this harness wants. */
```

### ---------- AND WHAT A JOURNEY NEEDS IN PLACE BEFORE THE FIRST LINE OF THE APP RUNS

in `boot`

```
/* ---------- AND WHAT A JOURNEY NEEDS IN PLACE BEFORE THE FIRST LINE OF THE APP RUNS ------------
     `data.js` READS `familyUser` AT LOAD and `boot.js` starts the first screen and the payload in
     its last lines, so a journey that signs in with `__t.USER` afterwards has already missed the
     boot it is asking about. That was exactly the camera's fault: the prompt came from the repaint
     the payload's arrival makes, for somebody signed in from the moment the page opened — a path no
     journey here could stand on. So a journey may hand the window over first, the way `check/ui.js`
     uses `addInitScript`: seed storage, or stand in for a browser API jsdom does not have. */
```

### ---------- THE BUILDER IS HELD, UNLESS A JOURNEY ASKS FOR IT

in `boot`

```
/* ---------- THE BUILDER IS HELD, UNLESS A JOURNEY ASKS FOR IT ---------------------------------------
     `ahead_` (shell.js, docs/history/341) draws every stale column, every widget slot and both finders'
     windows in the quiet after a landing. Every journey written before it asks what an ARRIVAL does —
     a column drawn on the way in, a widget started when its column comes in front — so they boot with it
     held and go on testing that floor; the journeys about the builder itself pass `ahead: true`. */
```

### WHETHER EVERYTHING BOOKED FOR AFTER A SLIDE HAS RUN, the widget queue included — `woken_` below.

in `boot`

```
/* WHETHER EVERYTHING BOOKED FOR AFTER A SLIDE HAS RUN, the widget queue included — `woken_`
         below. A function, because a `let` inside this eval is not reachable from a second one.
         AND NO PLACEMENT STILL WAITING FOR ITS FRAME (`PLACE_FRAME`): it is the placement that books the
         after-slide jobs, so until its frame has come there is nothing booked to wait for and this said
         "quiet" with the leave not yet seen. Under a load average of 15–23 the word-game journeys failed so
         ("the clock went on running behind the Saved column"), on cafb838 too, every one green alone; with
         every animation frame held back 900ms the Saved round failed every time, and with this it passes at
         1.5s (docs/history/341, after review). */
```

### THE BUILDER'S OWN STATE, for the journeys about it (docs/history/341):

in `boot`

```
/* THE BUILDER'S OWN STATE, for the journeys about it (docs/history/341): what is still marked, what a
         landing drew, the log of what it ran, and the two landings — a reply (`landRepaint_`) and a change
         of facts (`repaint`). */
```

### AND WHAT THE BUILDER'S JOURNEYS ASK OF IT:

in `boot`

```
/* AND WHAT THE BUILDER'S JOURNEYS ASK OF IT: a column drawn as `paint` draws it, a screen's own drawing
         (twice, for the determinism journey), the running state of the widgets with a `stop` — `let`s, so
         only this evaluation reaches them — a kick, and a widget's slot on one column. */
```

### AND WHAT THE REVIEW OF 12 OCT ASKED THE BUILDER (docs/history/341, "After review"):

in `boot`

```
/* AND WHAT THE REVIEW OF 12 OCT ASKED THE BUILDER (docs/history/341, "After review"): which job a slice is
         running, when it opened, the gates a journey closes by hand (a booked slide, a settle), the message
         poll's clock, how far behind the finder's window keeps the card in front, and which finder is bound. */
```

### WHAT WOULD GO ON THE WIRE.

in `boot`

```
/* WHAT WOULD GO ON THE WIRE. The day list, the start time and the session length are all
         taken from the FIRST run, so a journey asking whether the week reads in order is asking
         about three cells of the job row as well as about the card. */
```

### THE LEDGER THE CARD IS BUILT FROM.

in `boot`

```
/* THE LEDGER THE CARD IS BUILT FROM. `paper()` above is the markup; this is the figures,
         and `sessionDates` is the one of them a journey can ask a question about that no
         rendering can answer — which year a session falls in. */
```

### AND `pageCount`, WHICH IS THE ONE DEFINITION OF HOW MANY PAGES A SCREEN HAS.

in `boot`

```
/* AND `pageCount`, WHICH IS THE ONE DEFINITION OF HOW MANY PAGES A SCREEN HAS. This journey
         used to read `PAGER[id]().length` -- a second definition, and one that broke the day an
         entry started answering with a COUNT instead of a list of names. `PAGE_KEEP` and
         `STUFF_WIN` say how much of a windowed screen is in the document at once. */
```

### THE PAYLOAD ITSELF, AS A GETTER RATHER THAN A REFERENCE.

in `boot`

```
/* THE PAYLOAD ITSELF, AS A GETTER RATHER THAN A REFERENCE. `load()` ends with `DATA = d` —
         it REPLACES the object — so a captured reference would be a snapshot of whatever was there
         when this hook was built, which is the fault CLAUDE.md records about a state seeding
         `DATA.students` before that assignment. */
```

### IMPOSTER'S ROUND, AS A GETTER FOR THE SAME REASON — `impDeal_` replaces the object — so a journey can hold each screen up against what was actually dealt

in `boot`

```
/* IMPOSTER'S ROUND, AS A GETTER FOR THE SAME REASON — `impDeal_` replaces the object — so a
         journey can hold each screen up against what was actually dealt rather than against what an
         earlier screen said. AND A CARD ON TOP OF ITS PILE (`impStack`, below), put there the way
         `impDraw_` would find it — the whole card, picture and all, out of the app's own `impCards_`
         — so a journey knows the word it is listening for and the picture it is looking for. AND THE
         DECK ITSELF, read through `impCards_` as the game reads it, and its category pictures. */
```

### THE CONTROL A ROW CARRIES, so the several-answers journey can ask whether the row reads back what has been ticked — the button is the only label on it, which

in `boot`

```
/* THE CONTROL A ROW CARRIES, so the several-answers journey can ask whether the row reads back
         what has been ticked — the button is the only label on it, which is the half of that
         feature a list full of ticks cannot show. */
```

### THE PEN ON A QUESTION'S DIAGRAM, both halves:

in `boot`

```
/* THE PEN ON A QUESTION'S DIAGRAM, both halves: the markup a card is built with, and the
         function the press mutates it with. A journey needs both because they are the two places
         the same four attributes are written, and the fault they guard is what happens when the two
         disagree. */
```

### AND THE STATE THE MARKUP IS BUILT FROM, so the repaint path can be asked the same question as the press path.

in `boot`

```
/* AND THE STATE THE MARKUP IS BUILT FROM, so the repaint path can be asked the same question
         as the press path. Without it only `padArm_` could be checked — and a `padWrap_` that got
         the armed case wrong would put the fault straight back on the next repaint. */
```

### THE FINGER PEN'S CONTACTS, a `const` Map (338) -- a journey asks that every one is forgotten when the fingers have lifted, because one left behind is a pad the

in `boot`

```
/* THE FINGER PEN'S CONTACTS, a `const` Map (338) -- a journey asks that every one is forgotten when the
         fingers have lifted, because one left behind is a pad the swipe engine refuses for ever. AND THE
         SWIPE ENGINE'S OWN STATE, a `const` in overworld.js, so a journey can ask that a palm drifting on
         the card did not take the column while a finger was on the drawing. */
```

### THE CARD ON THE 📷 COLUMN.

in `boot`

```
/* THE CARD ON THE 📷 COLUMN. It was `newPostCard`, which no longer exists — it was a heading,
         a sentence and a tap target, and it is a button on the camera now. The rule the journey
         below checks is unchanged: a client and an admin are told different things. */
```

### THE TILE ROW UNDER A SESSION CARD, which is where Pay lives.

in `boot`

```
/* THE TILE ROW UNDER A SESSION CARD, which is where Pay lives. It used to be a block inside
         the receipt sheet and the journey below still looked for it there — see the note on that
         journey. Exposed so the test can ask the thing that actually renders the button. */
```

### THE BOOKING COLUMN AS DRAWN, and the id of the booking just asked for.

in `boot`

```
/* THE BOOKING COLUMN AS DRAWN, and the id of the booking just asked for. Together they are
         what a journey needs to ask whether pressing send leaves anything on the screen — which
         it did not, for as long as the form was the only thing on that page. */
```

### THE CHEAT SHEET'S COMPONENT LIST AND ITS TWO WIDTHS.

in `boot`

```
/* THE CHEAT SHEET'S COMPONENT LIST AND ITS TWO WIDTHS. `matParts` is the list after the sheet
         has had its say about order and levels, which is the list the page is actually built from —
         so a journey can ask what a component is worth without a browser and without the tab. */
```

### THE SUBJECT FILTER AND WHAT IT DECIDES.

in `boot`

```
/* THE SUBJECT FILTER AND WHAT IT DECIDES. `matShown` is the one test the list and the paper
         both ask, so a journey asking it is asking what would print; `matSet` puts the two selects
         where a person would, through `matSettle`, which is what the handlers do. */
```

### THE TOPIC GROUPS — the third select — and the state the tool opened on, so a journey can ask what each view lists and where a student lands.

in `boot`

```
/* THE TOPIC GROUPS — the third select — and the state the tool opened on, so a journey can ask
         what each view lists and where a student lands. `matFresh` forgets every choice the way a
         first visit on a new device would, so the next `initMat` decides the opening view again. */
```

### WHICH WIDGETS ARE RUNNING AND ON WHICH COLUMN'S COPY, WHICH ARE WAITING THEIR TURN, AND WHAT THE LAST PLACEMENT SAID IS ON THE GLASS — three `let`s in

in `boot`

```
/* WHICH WIDGETS ARE RUNNING AND ON WHICH COLUMN'S COPY, WHICH ARE WAITING THEIR TURN, AND WHAT
         THE LAST PLACEMENT SAID IS ON THE GLASS — three `let`s in arcade.js and shell.js, so only
         functions built in this evaluation can read them (docs/history/331). */
```

### WHAT THE FIND SCREEN OFFERS AGAINST WHAT THE APP HOLDS, and the Saved column that reads the second.

in `boot`

```
/* WHAT THE FIND SCREEN OFFERS AGAINST WHAT THE APP HOLDS, and the Saved column that reads the
         second. Two lists on purpose: a kind taken off Find must leave the first and stay in the
         second, or a starred thing vanishes from the one list whose job is to keep it. `doors` is
         the first question's answers as the funnel draws them. */
```

### THE BASKET, AND ITS ARITHMETIC.

in `boot`

```
/* THE BASKET, AND ITS ARITHMETIC. `cartMoney_` is the one place a line's price is worked out
         — print plus the laminate upgrade — and `CART` is the list it works it out from. Exposed
         together so a journey can put a line in the basket and ask what it costs, which is the
         question somebody actually has about a basket. */
```

### THE SHOP COLUMN AND THE TWO LISTS IT WAS TAKEN FROM.

in `boot`

```
/* THE SHOP COLUMN AND THE TWO LISTS IT WAS TAKEN FROM. `shopCards` is what `screen('shop')`
         draws; `shopFunnel` is what Find offers and `shopAll` what the app holds, so a journey can
         ask that a shop thing left the first, stayed in the second, and arrived on the column. */
```

### WHICH COLUMN IS IN FRONT.

in `boot`

```
/* WHICH COLUMN IS IN FRONT. A `let` in the app's one scope, and jsdom's `eval` runs each call
         in a scope of its own — measured: `w.eval("AT")` is "AT is not defined" — so only a function
         built in the same evaluation can read it. The camera journey asks it to know that the load
         it is watching is the one that opens on the feed. */
```

### THE MARKS AS THE APP DRAWS THEM, so a switch tile's picture is read against the entry its class names rather than trusted by the name (`soundTileSays_`).

in `boot`

```
/* THE MARKS AS THE APP DRAWS THEM, so a switch tile's picture is read against the entry its
         class names rather than trusted by the name (`soundTileSays_`). The object itself — a
         `const`, so handed over from inside this evaluation. */
```

### AND WHERE A VISITOR WITH NOTHING REMEMBERED OPENS — a `const`, so a getter for `AT`'s reason.

in `boot`

```
/* AND WHERE A VISITOR WITH NOTHING REMEMBERED OPENS — a `const`, so a getter for `AT`'s reason. The
         Business journeys ask that a remembered column a viewer is not given sends them HERE, which
         `AT !== 'biz'` cannot tell apart from being moved one column left by a later `columnsFor_`. */
```

### THE BIBLE READER'S STATE — a `const`, so a getter built here (see `STUFF`):

in `boot`

```
/* THE BIBLE READER'S STATE — a `const`, so a getter built here (see `STUFF`): which book is open,
         whether the index landed, which book failed. The Bible journey asks it rather than the DOM
         where the DOM cannot say, such as whether a failure changed the open book. */
```

### AND THE FUNNEL'S OWN MEMO OF WHAT IT TALLIED and the chain that orders the Bible's questions — both `const`s, so only this evaluation can hand them over.

in `boot`

```
/* AND THE FUNNEL'S OWN MEMO OF WHAT IT TALLIED and the chain that orders the Bible's questions —
         both `const`s, so only this evaluation can hand them over. The Bible journey asks the first
         whether a question that could not apply was tallied anyway. */
```

### THE MESSAGES COLUMN'S STATE, SEEDED AS AN ANSWER JUST ARRIVED — the same five lets `check/states.js` sets in a browser, and for the same reason they are set

in `boot`

```
/* THE MESSAGES COLUMN'S STATE, SEEDED AS AN ANSWER JUST ARRIVED — the same five lets
         `check/states.js` sets in a browser, and for the same reason they are set together: a seed
         that leaves `DM_LAST` alone is one poll away from being replaced by the stub's empty answer.
         Lets, so only a function built in this evaluation can write them (see `AT` above). */
```

### ---------- THE JOURNEYS

top level, before `checks`

```
/* ---------- THE JOURNEYS -------------------------------------------------------------------------
   Each is a name and a function that returns a list of complaints. No complaints is a pass. They are
   written as questions somebody would actually ask of the app, not as assertions about internals. */
```

### `FLOW_ONLY=words node js/check-flow.js` runs the journeys whose names contain those words — for working on one; the suite always runs the lot, and says how

top level, before `FLOW_RE_`

```
/* `FLOW_ONLY=words node js/check-flow.js` runs the journeys whose names contain those words — for
   working on one; the suite always runs the lot, and says how many it ran.
   `FLOW_RE='one|two'` is the same as a regular expression, for several journeys that share no words —
   the review of the second finder ran six that way, and without it `FLOW_RE` was silently ignored and
   all of them ran, which looks exactly like a slow selection. */
```

### `FLOW_SLICE=1/3` RUNS EVERY THIRD JOURNEY, starting from the second — the suite in pieces, for a machine too busy to run all of it inside one ten-minute window.

top level, before `FLOW_RE_`

```
/* `FLOW_SLICE=1/3` RUNS EVERY THIRD JOURNEY, starting from the second — the suite in pieces, for a machine
   too busy to run all of it inside one ten-minute window. The pieces together are the suite; each says
   how many it ran. (`FLOW_PART=2/4`, at the foot of the roster, is the same in four runs of neighbours.) */
```

### ---------- THE REELS' SOUND IS A TILE, READ THE THREE WAYS IT SAYS ITS STATE

top level, before `SVG_NS_`

```
/* ---------- THE REELS' SOUND IS A TILE, READ THE THREE WAYS IT SAYS ITS STATE ------------------------
   THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* A tile has no word
   on it, so the state is said three times and each is read here: the NAME (`aria-label` and `title`,
   "Sound off" on a muted clip, "Sound on" playing aloud — the state it is IN, as the button's words
   were), the MARK (the crossed speaker or the one with its waves), and `aria-pressed` for a screen
   reader. Any one drifting from the other two is a tile that says two things, which is worse than the
   button it replaced. Drawn by `tile_` and nothing else: `.tile`, `.is-over` (the wash it wears over
   a picture) and `.reel-sound` (where it sits, and what a dead Short hides). Shared by both journeys,
   and by Imposter's Read aloud, the app's other sound switch and the same tile since 10 Oct (`o`).

   THE MARK IS READ AS A DRAWING, NOT AS A CLASS NAME. Review, 10 Oct: this asked only for
   `tile-i-mute` / `tile-i-sound`, and with `mute: TILE_CONE_ + TILE_WAVES_` in tiles.js — the muted
   mark drawn as the playing one — both journeys said OK. With no word on the tile the picture is the
   only thing the eye has, so a pair that is two names for one picture is a switch that looks the same
   both ways. So the drawing on the tile must be, shape for shape, the `TILE_ICONS` entry its class
   names (`__t.ICONS`, the app's own object), and the pair itself must differ BOTH ways and share the
   cone (`soundPairSays_`): the slash the playing mark lacks, the waves the muted one lacks — the
   padlock's argument in tiles.js, checked rather than trusted. */
```

### ---------- A <VIDEO> REEL'S SOUND, PRESSED WHERE A FINGER PRESSES IT

top level, before `w`

```
/* ---------- A <VIDEO> REEL'S SOUND, PRESSED WHERE A FINGER PRESSES IT --------------------------------
   THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* What has to survive
   the button becoming a tile, each a perfectly good-looking slide when it is wrong:
     - every reel drawn carries ONE Sound tile and no `.btn`, drawn muted, because every clip starts so;
     - a press on the tile's MARK — where a fingertip lands, an `<svg>` inside the button — reaches
       `reel-sound` through the real dispatcher and never `reel-tap`: the nearest `data-do` wins, so
       reaching for the sound must not stop the clip (a held reel would draw the ▶);
     - turned on, the `<video>` is unmuted AND asked to play, since a clip a browser refused to start
       aloud would otherwise stay silent and still under a tile saying "Sound on";
     - and the name, the mark and `aria-pressed` follow it both ways (`soundTileSays_`).
   JSDOM PLAYS NOTHING, so the one `<video>` is given a `play`, a `pause` and a `paused` that keep
   count — the same stand-in move the Short's journey makes for YouTube's player. */
```

### ---------- A YOUTUBE SHORT IS A REEL, AND THE COLUMN DRIVES IT

top level, before `w`

```
/* ---------- A YOUTUBE SHORT IS A REEL, AND THE COLUMN DRIVES IT ------------------------------------
   THE OWNER, 9 OCT: *"i want to add this to reels, maybe embedd? or work fine without? i just want it
   to look like other reels... also is there a grey effect on reels? i dont like that if there is
   remove it."* Every half of the answer draws a perfectly good slide when it is wrong: a player built
   for every Short dealt (one a lap), a player with YouTube's touch on it so the column will not swipe,
   a tap that pauses nothing, a Sound button talking to an element that is not there, a player left
   playing a page away, YouTube's error screen where the poster should be — and the grey, which was a
   wash laid over every clip whether or not there were words on it.

   JSDOM LOADS NO FRAME, so this stands in for YouTube at the one place the app can hear it: messages
   from the frame's window, in the player's own shapes (`onReady`, `infoDelivery`, `onError`), and a
   spy on the frame's `postMessage` for what the app tells it. Which page the Short is dealt to is
   random per open, so the journey finds it rather than assuming it. */
```

### ONE SHORT IN THE DEAL.

top level, before `dealt`

```
/* ONE SHORT IN THE DEAL. With a second Short (12 Oct) the two are often dealt side by side, and the page
     next to the one asked about rightly keeps a player of its own — so "one give-up clock", "one player"
     counted the neighbour's too, and the journey passed or failed on the shuffle. Each Short is the same
     code; this asks about one, alone, by taking the others out of the deal before the column is drawn. */
```

### THIS SHORT, NOT ANY SHORT.

top level, before `ytAway`

```
/* THIS SHORT, NOT ANY SHORT. There were one Short and two mp4s, so "the first `.feed-yt` ahead" was
     this one; a second Short (12 Oct) made it a coin toss which this journey asked about, and the poster
     line below names this id. A lap is as many pages as there are clips, read off the app's own deal. */
```

### THE APP'S OWN SOUND TILE, THE SAME WORDS — BOTH WAYS, AND THEN ON AGAIN so the player taken down below has a sound to forget (note 323).

top level, before `snd`

```
/* THE APP'S OWN SOUND TILE, THE SAME WORDS — BOTH WAYS, AND THEN ON AGAIN so the player taken down
     below has a sound to forget (note 323). Pressed through its handler, which is the one a tap on
     the tile reaches; the `<video>` journey below presses the real dispatcher. */
```

### AND ITS SOUND TILE IS A CONTROL FOR NOTHING:

top level, before `before`

```
/* AND ITS SOUND TILE IS A CONTROL FOR NOTHING: hidden by the stylesheet (jsdom cannot compute
       `:has`, so the rule is read), and a press that arrives anyway says nothing to a player that is
       gone and leaves the tile as it was. */
```

### ---------- A SHORT ALWAYS ENDS PLAYING OR AT ITS DOOR, AND A LAP IS NOT A FLASH

top level, before `clocks`

```
/* ---------- A SHORT ALWAYS ENDS PLAYING OR AT ITS DOOR, AND A LAP IS NOT A FLASH --------------------
   THE REVIEW OF 9 OCT, four ways the Short above draws a perfectly good slide and is wrong:
     - its give-up clock was wound ONCE, when the player was built, and decided at one moment: a player
       that never answered, held or flicked one page away when the twenty seconds ran out, was left a
       poster with a live Sound button and no door, for good;
     - a player that ANSWERED and was then held when the clock ran out must NOT be given up on — and the
       next ask to play must wind a fresh clock, or that one is stuck the same way;
     - a looping Short says ended / unstarted / buffering / playing at every lap, and each lap
       cross-faded the poster in over the picture — and an end that does NOT restart must still go
       back under the poster, or YouTube's grid of other videos is left on the slide;
     - a held Short whose player errors kept its ▶ over the door, and no tap could clear it.
   THE CLOCKS ARE CAUGHT, NOT WAITED FOR: twenty seconds a case would make this the slowest journey in
   the file. `setTimeout` is stood in for while this journey runs, and only for the two timers whose
   bodies are the Short's clocks; everything else is handed to the real one. A clock is rung by
   calling it, which is exactly what the browser does when it runs out. If the clocks cannot be
   recognised, the journey says so rather than passing on nothing. */
```

### ONE SHORT IN THE DEAL.

top level, before `dealt`

```
/* ONE SHORT IN THE DEAL. With a second Short (12 Oct) the two are often dealt side by side, and the page
     next to the one asked about rightly keeps a player of its own — so "one give-up clock", "one player"
     counted the neighbour's too, and the journey passed or failed on the shuffle. Each Short is the same
     code; this asks about one, alone, by taking the others out of the deal before the column is drawn. */
```

### THE SHORT IS DEALT ONCE A LAP, at a random page per open, and its copies are a lap apart.

top level, before `LAP`

```
/* THE SHORT IS DEALT ONCE A LAP, at a random page per open, and its copies are a lap apart. A LAP IS
     EVERY CLIP ONCE — three pages while there were three clips, which this journey once wrote as `+ 3`
     and which a fourth clip (12 Oct) broke: page n + 3 held another reel. So the lap is read off the
     app's own deal, and the Short asked about is one id, not whichever `.feed-yt` comes first. */
```

### ---------- THE UPGRADE HAS TO BE IN THE PRICE, AND HAS TO COME BACK OUT

top level, before `w`

```
/* ---------- THE UPGRADE HAS TO BE IN THE PRICE, AND HAS TO COME BACK OUT --------------------------
   THE FAULT THIS GUARDS AGAINST is the one the design avoids on purpose: a laminate upgrade stored
   as a NUMBER added into the line's `money`. That works the first time and breaks the first time
   somebody takes it off, because the subtraction lives somewhere else and only one code path runs
   it. The flag is stored instead and the price derived, so this asks the round trip: on, off, and
   back to where it started.

   AND THAT NO RATE MEANS NO CHARGE. `laminatePrice` returns null when the sheet has not priced the
   pouches, and a laminated line must then cost exactly what an unlaminated one does — not zero, not
   NaN, and certainly not the print price plus `null` coerced to something. */
```

### THE SHOP LINE CARRIES A PAGE COUNT ON PURPOSE, and that is the whole point of this journey.

top level, before `key`

```
/* THE SHOP LINE CARRIES A PAGE COUNT ON PURPOSE, and that is the whole point of this journey.
     A highlighter with no `pages` is refused by `laminatePrice` returning null, so a version with
     the kind test taken out still passes — the check would be asserting the page count and
     reporting it as the kind. A workbook has pages and is still not a thing this shop laminates:
     it is stock, not something printed here. Giving it a count is what makes the kind test the
     thing being measured. */
```

### ---------- EVERY COMPONENT IS PRICED AT THE SLOT IT IS DRAWN IN

top level, before `w`

```
/* ---------- EVERY COMPONENT IS PRICED AT THE SLOT IT IS DRAWN IN ----------------------------------
   THE FAULT THIS GUARDS AGAINST has happened twice in `mat.js` already and both are written up
   there: the picker costs a component from its width, the page draws it at another, and the gauge
   that decides whether the sheet fits is confidently wrong. `half` was priced at 99mm while it was
   drawn at 61; the ruler was priced at 0cm² while the bar charged 52.

   THE SHEET IS A GRID OF FIXED SLOTS NOW ("make all components of cheat sheet maker fixed in area"),
   so the check is the slot: every component has a span of 2, 4 or 6 tracks, a height that is a whole
   number of rows, and the widths come out of the same constants the stylesheet is handed. The
   hundred square and the times table were asked for bigger, by name, so they are held at two thirds
   of the page — the one number that must not quietly drop back to a third. */
```

### ---------- THE NEGATIVE NUMBER LINE, AND A PICKER LIST THAT IS NOT A SCROLLER

top level, before `w`

```
/* ---------- THE NEGATIVE NUMBER LINE, AND A PICKER LIST THAT IS NOT A SCROLLER -----------------------
   ASKED FOR AS "add minus number line" and "the cheat sheet maker should not have a scroll thing", in
   one message. The line is a drawing with one right answer — twenty-one whole numbers, −10 to 10, one
   zero picked out, the minus a real minus — so it is asserted on what `matDraw` returns rather than
   left to a screenshot. And it is offered where it was asked for: SATs and the 11+, Y9 mocks and both
   GCSE tiers.
   THE LIST HALF IS ASKED OF THE MARKUP, because jsdom has no layout to measure a scroll bar in: the
   list and everything round it must not carry `.widget-squeeze`, which is the class that made it a
   scroller inside the card (see the note over the list in `initMat`). */
```

### ---------- THE SUBJECT FILTER NARROWS THE LIST AND THE PAPER TO ONE SUBJECT

top level, before `w`

```
/* ---------- THE SUBJECT FILTER NARROWS THE LIST AND THE PAPER TO ONE SUBJECT ---------------------
   ASKED FOR AS *"for cheat sheet maker it should have subject as a filter too"*. The fault worth a
   rule is the one a filter always risks: a choice on the screen that the paper does not honour —
   an English sheet carrying a hundred square, or "Every subject" quietly meaning Maths. So each
   subject the select offers is set the way the select sets it and `matShown`, the one test the list
   and the sheet share, is asked of every piece. The ruler belongs to no subject and must be offered
   under all of them. And the tier split is only offered where a piece changes with it, which is the
   maths: an English "GCSE Foundation" would be a choice that changes nothing on the paper. */
```

### A PIECE OFFERED IS A PIECE THAT CAN BE DRAWN.

top level, before `w`

```
/* A PIECE OFFERED IS A PIECE THAT CAN BE DRAWN. `matDraw` prints a sentence on the paper for one
     with no drawing, which is right as a last resort and wrong as the state of a whole subject. The
     ruler is not asked: it is drawn down the margin by `matRuler`, never into a slot. */
```

### ---------- THE PIECES A TOPIC AT A TIME, AND NO VIEW LONGER THAN EIGHT ROWS

top level, before `w`

```
/* ---------- THE PIECES A TOPIC AT A TIME, AND NO VIEW LONGER THAN EIGHT ROWS ----------------------
   ASKED FOR AS *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to make
   it fit on screen without scrolling"*. The fit itself is measured in a browser by `check/states.js`;
   what jsdom can hold is the COUNT that makes the fit possible, at every subject × level × topic:
   eight rows, ruler included, is the most a 320x568 pane takes at 0.85 signed in (see `MAT_GROUPS`). A piece
   added to a group that is already full fails here, by name, before anybody draws it. And every
   piece is FILED — one that falls through to `Other` is a piece nobody added to the table.
   THEN THE PROMISE THAT MAKES GROUPS BEARABLE: a tick in one topic is still a tick when you are
   looking at another, it is on the paper either way, and the topic's own option says it is there. */
```

### ---------- A STUDENT OPENS ON THEIR OWN LEVEL

top level, before `w`

```
/* ---------- A STUDENT OPENS ON THEIR OWN LEVEL --------------------------------------------------------
   THE AUDIT'S DEFAULT, TAKEN: *"Open on the student's own level when known."* Nothing on a person says
   their level, so it is read off the sessions they are the client of — this payload's first is GCSE
   Maths for Pat Parent. A stranger knows nothing and opens on Every level, as before. */
```

### ---------- A CHEAT SHEET INTO THE BASKET, LAMINATED, AND THE ORDER NAMES ITS PIECES

top level, before `w`

```
/* ---------- A CHEAT SHEET INTO THE BASKET, LAMINATED, AND THE ORDER NAMES ITS PIECES -----------------
   ASKED FOR AS *"add an upgrade to lamination for cheat sheet orders that are added to cart."* The
   sheet goes in as a one-page `print` line, which is what gives it the laminate switch; the rate is
   this payload's 0.35 a page with a 0.50 minimum, standing in for the Ledger's `laminate_rate_per_page`
   (the owner's £1.00 once typed). What must hold: the line says what it is, pressing twice is one
   line, laminating it puts the price on the line, and the message to the owner lists every piece —
   the only way the owner can print the sheet somebody built is to rebuild it from that list. And
   signed out it goes nowhere and says why, as every other basket door does. */
```

### ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, AND SQUARED

top level, before `w`

```
/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, AND SQUARED ------------------------------------
   ASKED FOR AS *"allow cheat sheet maker to make a handwriting worksheet. or lined or grid paper."*
   Pressed through the real selects and the real text box, and asked of the sheet the printer would
   be handed (`MAT_SHEET`), because every fault worth catching is on the paper and not on the card:
     · the four-line ruling is four lines — ascender, dashed x-height, baseline, descender — per row,
       and every one of them inside the drawing, so nothing runs under the footer;
     · the words are on the TRACE rows, in turn with the practice rows, and every word typed is on
       the page — a wrap that dropped the last word would print a sentence without its end;
     · squared paper is whole squares at the size chosen; lined paper is the spacing chosen;
     · a value the select does not offer is refused, so a stored 7mm cannot draw;
     · no colour is written on the paper as a literal — the sheet's tokens only;
     · it is one basket line with the laminate switch, named so the owner can tell it from the rest,
       and it prints through the cheat sheet's own print path. */
```

### ---------- A PENCE PRICE IS MONEY, AND A SHOP LINE IS ONE LINE

top level, before `p`

```
/* ---------- A PENCE PRICE IS MONEY, AND A SHOP LINE IS ONE LINE --------------------------------------
   ASKED FOR AS *"refine basket to look nicer."*, and the first thing wrong with the basket's look was
   not a margin: a 30p pencil read "30 cr" and a £14 calculator "1400 cr", because `cart-add` wrote
   every shop price into the credits field whatever `unit` `doGet` sent with it — and the Send button
   then asked a student for 1,425 credits. So a pence row goes in as money, a credits row as credits,
   and a line saved the old way is re-read from the shop row when the basket is drawn.
   Then the shape: a shop line has no switch, so it has no strip — its ✕ is on the name's line — and
   the head says what the credits come to in one short line. */
```

### ---------- SETTINGS SAVE AGAINST A SERVER OLDER THAN THE SITE

top level, before `w`

```
/* ---------- SETTINGS SAVE AGAINST A SERVER OLDER THAN THE SITE ------------------------------------
   REPORTED FROM THE LIVE SITE: "the account settings stuff isnt saving. its saying action not
   recognised". The site was published and the Apps Script was not, so every Save asked the server
   for `myProfile`, got "That action is not recognised", and stopped. This plays that server — it
   refuses `myProfile` and answers everything else — with a copy of your details in the OLD shape
   (no `phone_cc`), and asks two things: a card of plain fields still posts `updateProfile`, and a
   card holding a packed field does not, saying the backend needs updating instead of the server's
   raw sentence. The second half is the guard's whole reason: that card's boxes can be empty, and
   posting them would write blanks over the sheet. */
```

### ---------- A SEVERAL-OF-A-LIST FIELD OPENS INTO TICKS IN ITS CARD, AND SAVE POSTS THE LIST

top level, before `w`

```
/* ---------- A SEVERAL-OF-A-LIST FIELD OPENS INTO TICKS IN ITS CARD, AND SAVE POSTS THE LIST ----------
   IT WAS A BUTTON THAT HUNG `#drop` OVER THE COLUMN until the owner asked on 9 October for *"a more
   stable standard simple conventional drop down list"* (note 315): a `<details>` now, whose summary is
   the field and whose ticks are real checkboxes under it, in the card. What none of that may lose is
   the save — `me-save` reads the one hidden `data-me="venues_ok"` box, and the ticks have to land in
   it as a comma list in the list's own order. And what the panel never did, the ticks must: mark the
   card dirty, because a card that is not dirty is a card the next payload repaints, ticks and all.

   ON A CARD OF ITS OWN (`profileFields`), as the backend groups it, with the payload's two venues. */
```

### AND A RELOAD BEFORE SAVE KEEPS THE TICK — 315 met 317.

top level, before `two`

```
/* AND A RELOAD BEFORE SAVE KEEPS THE TICK — 315 met 317. The ticks are in the card now, so they are a
     draft like every other box on your own card: the hidden answer carries it and the ticks keep it. Built
     again from the storage this one left, as the reload journeys of 317 are. */
```

### A SWIPE THAT STARTS ON THE FIELD OPENS NOTHING.

top level, before `click`

```
/* A SWIPE THAT STARTS ON THE FIELD OPENS NOTHING. The summary opens its `<details>` from the click's
     default, as a label ticks its box, so the swipe guard has to cancel it too (`FIELD_ACTS_`) — found by
     review with real touch: a 12px drag on the field opened it. A tap that stayed put is not cancelled. */
```

### ---------- A REPLY THAT LANDS LEAVES AN OPEN LIST WHERE IT IS

top level, before `P`

```
/* ---------- A REPLY THAT LANDS LEAVES AN OPEN LIST WHERE IT IS -------------------------------------------
   FOUND BY REVIEW ON 9 OCTOBER, with real touch: tap the booking form's Kind, so the phone's own list
   is up, and let the payload land — the column was rebuilt, the select the list belonged to went with
   it, and the pick went nowhere. The settings column's favourite colour the same, through
   `profileRefresh_`'s repaint, and the venues field's ticks shut under the person who had opened them.
   The panel had found its select again after a repaint; the platform's list cannot, so a landing reply
   now holds a column whose select is focused (`landRepaint_`, shell.js), and the venues field's open
   state is kept as state (`MANY_OPEN_`, me.js). Driven through the two real landing paths: `load()`'s
   own repaint and `profileRefresh_`'s. */
```

### ---------- THE QUALIFICATIONS CARD: ONE LINE A QUALIFICATION, EDITED IN PLACE, SAVED AS YOU GO

top level, before `QUAL_TUTOR`

```
/* ---------- THE QUALIFICATIONS CARD: ONE LINE A QUALIFICATION, EDITED IN PLACE, SAVED AS YOU GO ----------
   ASKED FOR AS *"can you make the qualifications widget more efficient, elegant, intuitive and take up
   less space"*. The card is a line per qualification in the profile chip's notation, a line opens its
   editor under itself, every answer chosen is saved, and one `+` adds. What none of that may lose is
   the data underneath — so these drive the page's own handlers and read the seven `data-me` boxes of
   each slot and the fields each save POSTS, which are what `qualsIn` rebuilds the rows from.

   ONE TUTOR FOR ALL FOUR: Maths and Physics at GCSE and A-Level, English Literature at GCSE, a degree
   still being studied, and an Enhanced DBS — the shelf a real tutor has, plus the two shapes the
   notation draws differently. Seven records, so three slots are left in the pool. */
```

### THE TOAST IS THE RECEIPT; THE LINE UNDER THE CARD IS FOR A REFUSAL.

top level, before `saidNow`

```
/* THE TOAST IS THE RECEIPT; THE LINE UNDER THE CARD IS FOR A REFUSAL. *Walked:* "Saved" stood under the
     card for the rest of the session beside a toast saying the same. A success clears the line —
     including a refusal left there by a save that failed. */
```

### A TAP THAT LANDS WHILE A TYPED ANSWER IS SAVING.

top level, before `q`

```
/* A TAP THAT LANDS WHILE A TYPED ANSWER IS SAVING. A box is saved on `change`, which fires as it loses
   focus — under the finger already on the next line — and the save locks the card. Walked at 320,
   every run: the school saved, the tapped line was disabled before its click arrived, and nothing
   opened. Driven here in that order with a real `click()`, which jsdom drops on a disabled button
   exactly as a browser does (mutation: `data-unlocked` off the line — the line stays shut). */
```

### A CERTIFICATE HAS NO GRADE AND IS NOT TAUGHT.

top level, before `q`

```
/* A CERTIFICATE HAS NO GRADE AND IS NOT TAUGHT. *Walked at 390:* the DBS editor offered Grade and Teach,
   and Teach would have listed the DBS under Teaches on the profile (`teachesOf_` reads the tick, not
   the kind). The editor hides both (`.is-cert`, held in a real browser by `check/states.js`); here, the
   data: a line moved onto DBS posts its grade empty and both teaching boxes FALSE, and wears no mark.
   Mutation: the reset in `qualCommit_` removed — the A and Can teach go to the sheet under a DBS. */
```

### THE SUBJECT BOX HAS THE FOCUS, YOUR SUBJECTS FIRST IN ITS LIST.

top level, before `first`

```
/* THE SUBJECT BOX HAS THE FOCUS, YOUR SUBJECTS FIRST IN ITS LIST. It was opened, in the app's own
     panel, until the dropdowns went back to the platform's (note 315): a platform list cannot be opened
     from script, so `qualNext_` focuses the box instead, and the focus is what is asserted. A tick
     later, because it is given on the next turn. */
```

### AND IT IS A MATHS LINE NOW — in the Maths group itself, its subject not said a second time, open for its grade, no longer new.

top level, before `moved`

```
/* AND IT IS A MATHS LINE NOW — in the Maths group itself, its subject not said a second time, open
     for its grade, no longer new. Asked as the SAME group as Maths GCSE, because a new line's own face
     names its subject and a check that read the nearest heading passed with the line left at the foot
     in a group of its own (mutation: the redraw after the first save removed). */
```

### ---------- A TUTOR EDITS THEIR OWN CARD, ON THE CARD (docs/history/330)

top level, before `CARD_ADA_`

```
/* ---------- A TUTOR EDITS THEIR OWN CARD, ON THE CARD (docs/history/330) ------------------------------------
   THE OWNER, 10 OCT, with a screenshot of the Settings card "About you" beside their own card: *"all of
   this stuff should be editable directly on the tutors card for that respective tutor. this centralises
   things so less widgets are required."* So a tutor's own card has an Edit tile, the card becomes its own
   form in place, one Save posts every changed field through the existing `updateProfile`, Cancel puts back
   what was there, the boxes survive a reload as every box does (317), and the five Settings pages that
   held those fields are gone for anybody with a card.

   PRESSED AGAINST THE REAL BACKEND (check-gas-load.js), as the Notifications journeys are: the payload the
   app boots on is the real `doGet`'s (its tutors, venues and `profileFields`, laid over this file's
   fixture), every `updateProfile`, `myProfile` and `getProfile` goes to the real `doPost`, and "the sheet
   holds them" is read off the real tab after the Save — so what is checked is what the server made of the
   request, not what a reply typed here says. Invented people, example.org, PIN 0000. */
```

### YOUR FIGURE STRAIGHT AFTER THE PICTURE AND YOUR HANDLE STRAIGHT AFTER THE NAME, on your own card only (docs/history/339) — the owner, 11 Oct:

top level, before `CARD_ORDER_`

```
/* YOUR FIGURE STRAIGHT AFTER THE PICTURE AND YOUR HANDLE STRAIGHT AFTER THE NAME, on your own card only
   (docs/history/339) — the owner, 11 Oct: *"the random name generator should be one of the editable things in
   the profile settings of the profile card. your figure should also be in your profile card editing."* */
```

### THE EDITOR'S PHOTOGRAPHS ARE FETCHED AT ONCE — the owner, 10 Oct:

top level, before `lazy`

```
/* THE EDITOR'S PHOTOGRAPHS ARE FETCHED AT ONCE — the owner, 10 Oct: "these remain loading untill i scroll to
     them". The form is two thousand pixels in a pane that scrolls, so a lazy thumb is not asked for until it
     is scrolled to. */
```

### ---------- AND CANCEL PUTS THE PICTURE BACK TOO — the review of 330

top level, before `fox`

```
/* ---------- AND CANCEL PUTS THE PICTURE BACK TOO — the review of 330 -----------------------------------
     The chooser saves the moment a picture is chosen, so Cancel used to leave the new face on the card and the
     sheet under a tile that says "put it back". Ada's face is a photograph LINK, which `savePhoto` cannot write
     back; she taps the fox, the page is RELOADED (the picture she opened with has to survive that), and Cancel
     must send one `updateProfile` carrying only `photo`, the link — and the sheet, her profile and her card
     must hold the link again. */
```

### ---------- 317'S RULE ON THE CARD: A NEWER SAVE BEATS AN OLDER DRAFT

top level, before `W`

```
/* ---------- 317'S RULE ON THE CARD: A NEWER SAVE BEATS AN OLDER DRAFT ------------------------------------------
   Each box of the card's draft keeps the saved value it was typed over (`from`), and `cardValues_` draws the
   newer saved value when the row has moved since — "Samtown over Newtown", one card along. Nothing held that:
   the review of 330 deleted the `from` guard and every check stayed green. So: Ada types a headline and does
   not save; the admin saves a different headline for her through the real `doPost`; Ada reloads. The box must
   hold the admin's headline, not her older typing. */
```

### ---------- SIGN OUT IS UNDER THE FORM, AND KEEPS WHAT WAS TYPED FOR THE SAME PERSON

top level, before `W`

```
/* ---------- SIGN OUT IS UNDER THE FORM, AND KEEPS WHAT WAS TYPED FOR THE SAME PERSON ---------------------------
   The review of 330: while Ada edited her own card her row of tiles was not drawn (`a ? b : c + d`), so Sign out
   and "Send the link again" went, and Settings has no Sign out of its own. Settings never hid it, and a
   Settings sign-out keeps the person's drafts under their own key. So: Sign out is there, once, with no second
   Edit; pressing it keeps the card's draft; somebody else signing in on that phone sees no form and no draft;
   Ada signing back in, same tab, finds her card open with what she typed. */
```

### ---------- SETTINGS HOLDS WHAT IS NOT ON YOUR CARD, FOR EVERYBODY (docs/history/330, 339)

top level, before `W`

```
/* ---------- SETTINGS HOLDS WHAT IS NOT ON YOUR CARD, FOR EVERYBODY (docs/history/330, 339) -----------------------
   330 took a tutor's card pages off Settings; on 11 Oct the owner asked for the rest — *"move library card widget
   to the tools column … the random name generator should be one of the editable things in the profile settings
   of the profile card. your figure should also be in your profile card editing."* — so for EVERY role Settings
   no longer draws the name, the picture, the handle, the figure or the library cards, and still draws every
   other field that role may write, the PIN, the roles and Notifications. A parent's About you held only the
   picture and the name and goes whole; a student's keeps the date of birth and the two exams; the line at the
   top says where the rest went. Against the real backend's groups, as before. */
```

### ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT, ON THE TUTOR'S CARD, IN POUNDS (docs/history/345)

top level, before `CUT_VARS_`

```
/* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT, ON THE TUTOR'S CARD, IN POUNDS (docs/history/345) ----------------
   THE OWNER, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card. Like they can edit that
   small number to the right of their normal rate"*. Against the real backend: an admin editing a tutor's card sees
   the two parts of a seat in POUNDS beside the rate — the tutor's own and the business's, the cut blank and saying
   what blank is — and the seat as the card prints it, recomputed as the rate and the cut are typed; the rate typed
   carries the pounds with it and back; a cut typed in pounds at a rate it does not divide goes up as a SHARE, the
   only things sent are what moved, the sheet and `doGet` hold the share, the card says the new seat at once, and the
   editor opened again shows the same pounds to the penny. Config c 0.3 and B 0.1; Ada charges £20 with her own 0.5. */
```

### ---------- AND ON THE TUTOR'S OWN CARD: THE CUT IS SHOWN, NOT OFFERED, AND NEVER SENT

top level, before `W`

```
/* ---------- AND ON THE TUTOR'S OWN CARD: THE CUT IS SHOWN, NOT OFFERED, AND NEVER SENT ------------------------
   The same section for Ada herself, whose cut an admin has set to 0.15 and whose own share is a third, typed into
   the sheet by hand as 0.3333333333: her own part is a pound box (£6.67), the business's is a line saying what it
   is and who sets it, and its hidden box is disabled, so her Save of her own part sends that and nothing else. Her
   part typed back to the £6.67 it showed puts back THE CELL ITSELF, not 0.3335 — which would be a change, and
   would start her month. And a phone that sends the cut anyway — the hidden box enabled by hand — is refused by
   the server, said under the form, which stays open with nothing written. */
```

### ---------- THE PARTS OF A SEAT ADD UP TO THE SEAT, AND A NOUGHT IN THE TUTOR'S PART IS THE USUAL (the review of 345) --

top level, before `seatParts_`

```
/* ---------- THE PARTS OF A SEAT ADD UP TO THE SEAT, AND A NOUGHT IN THE TUTOR'S PART IS THE USUAL (the review of 345) --
   `seatShare_` prices a tutor's own share of nought — stored or typed — as the config `c`, and the editor drew it as
   "0.00": on Ada at £20 the boxes read £0 and £2 over a seat of +£8.00, beside a business's box where £0 means NO cut.
   So this asks what a person reads: each part drawn, or, where it is blank, the usual amount the line under the boxes
   names, add up to the seat printed under them. Ada's own share is a stored nought here, and her card is opened by
   herself: her box is empty under "usual", never "0.00"; the line names her usual £6.00 and the business's £2.00; a
   nought typed into her box and left is put back to empty and to the stored cell, so a Save sends nothing. */
```

### AND WHERE THE RATE PAGE IS STILL ON SETTINGS (a tutor with no public card), the cut a tutor cannot change says who sets it, as the card's line does — a dimmed

top level, before `ro`

```
/* AND WHERE THE RATE PAGE IS STILL ON SETTINGS (a tutor with no public card), the cut a tutor cannot change says who
     sets it, as the card's line does — a dimmed box under the admin's caption said nothing about why. Drawn by the
     same `fieldHtml` call `settingsPages_` makes, read-only. */
```

### ---------- AND ON AN ADMIN'S EDIT: £0 IN THE TUTOR'S PART IS THE USUAL, £0 TO THE BUSINESS IS NO CUT, THE POUNDS TYPED

top level, before `W`

```
/* ---------- AND ON AN ADMIN'S EDIT: £0 IN THE TUTOR'S PART IS THE USUAL, £0 TO THE BUSINESS IS NO CUT, THE POUNDS TYPED
   STAY WHEN THE RATE IS CORRECTED AFTER THEM, AND A PART PAST TWICE THE RATE IS REFUSED IN POUNDS BEFORE IT IS SENT ------
   Ada at £20 with her own 0.5 and no cut of her own. Typing the rate moved every part's pounds, typed or not, so £5 and £2
   typed at £20 and the rate then corrected to £30 saved £7.50 and £3.00; the order things were typed in decided the seat.
   And £99 past twice the rate went to the server, which answered in the Settings box's unit ("0.1 is a tenth"). */
```

### ---------- EVERYBODY EDITS THEIR OWN CARD (docs/history/339)

top level, before `W`

```
/* ---------- EVERYBODY EDITS THEIR OWN CARD (docs/history/339) ----------------------------------------------------
   THE OWNER, 11 Oct: *"the random name generator should be one of the editable things in the profile settings of
   the profile card. your figure should also be in your profile card editing."* — the handle and the figure belong
   to everyone, so EDIT ON YOUR OWN CARD IS EVERYBODY'S NOW, not only a listed tutor's. Asked of the real backend's
   payload and groups for a tutor, a listed admin, a parent and a student, and of the lab's own admin, who has no
   public card: each has Edit on their own card (their own gold tile, not the admin's silver), and the form holds
   the sections their card prints in the card's order — the picture, then the figure, the name, then the handle,
   and for a public card everything 330 put there — with the wardrobe in the figure section and the handle shown
   with one Randomise tile and nothing to type. And the one Save is the same Save: a parent's new first name goes
   to her own row through `updateProfile` and her card says it. */
```

### ---------- THE HANDLE'S RANDOMISE, ON YOUR OWN CARD

top level, before `W`

```
/* ---------- THE HANDLE'S RANDOMISE, ON YOUR OWN CARD ---------------------------------------------------------------
   The "random name generator" of the owner's message is Randomise (`handle-shuffle`), which was on Settings' Signing
   in card and is the `handle` section of your own card's Edit now. IT SAVES THE MOMENT IT IS PRESSED: the server
   writes the row as it answers and has no way to offer a handle without writing it, or to put an old one back
   (`handle` is not in `PROFILE_EDITABLE`, and must not be), so it is kept as the picture is kept, and CANCEL DOES
   NOT TAKE IT BACK — which the line under the tile says before the press. Through the real `doPost`: one
   `randomiseHandle`, the row holds the new handle, the form shows it, the line says the old one, the toast the new;
   Cancel closes the form with the new handle on the card at once (the payload held), on the phone and on the sheet;
   and a tutor's row in the payload carries it before the payload lands. */
```

### ---------- YOUR FIGURE, DRESSED ON YOUR OWN CARD, IS THE FIGURE YOUR PICTURE DRAWS

top level, before `W`

```
/* ---------- YOUR FIGURE, DRESSED ON YOUR OWN CARD, IS THE FIGURE YOUR PICTURE DRAWS ----------------------------------
   The wardrobe was the last page of Settings; it is the `figure` section of your own card's Edit now, straight under
   the picture — and the figure must still be what the picture's "your figure" option draws (docs/history/324). So,
   through the real `doPost`: a shirt picked in the section is `saveAvatar`, written to the row; the picker's "your
   figure" one section up wears it at once; chosen as the picture (`savePhoto`, `pfp:avatar`), and the form shut,
   the card's face is that figure in that shirt. And CANCEL PUTS THE LOOK BACK, as it puts the picture back: a shirt
   picked and then Cancel sends the look the card was opened with through `saveAvatar`, and the row and the phone
   hold it again. */
```

### ---------- THE REVIEW OF docs/history/339: WHAT ONE FORM FOR THE HANDLE, THE FIGURE AND THE BOXES COST

top level, before `bad`

```
/* ---------- THE REVIEW OF docs/history/339: WHAT ONE FORM FOR THE HANDLE, THE FIGURE AND THE BOXES COST ------------------
   Randomise, the wardrobe and the typed boxes were on three different Settings pages; on your own card's Edit they are
   one form under one Save and one Cancel, and the review found five ways they trod on each other. Each journey below
   was red on the build the review read, through the real `doPost` (check-gas-load.js), and each says what it found. */
```

### SAVE WHILE RANDOMISE IS OUT.

top level, before `bad`

```
/* SAVE WHILE RANDOMISE IS OUT. `send_` locked the nearest `.me-form` — the whole card — and Save, under the form and
   live, read it through `cardFormVals_`, which skips a disabled box: "Nothing had changed", the card shut, its draft
   dropped, and the typed field never sent. Measured for a parent (her surname; her first name is the next journey's)
   and a tutor (the headline). Randomise locks its own section now, and Save waits for it in words. */
```

### RANDOMISE WITH A FIRST NAME TYPED AND NOT SAVED.

top level, before `W`

```
/* RANDOMISE WITH A FIRST NAME TYPED AND NOT SAVED. The server makes the handle from the name on the sheet, so the new
   handle was the OLD name's — `pat_humble98` for somebody now called Quinn. Refused before it is sent, on the line under
   the tile; saved first, the next press is made from the new name. */
```

### A FIGURE NOBODY DRESSED IS DRAWN FROM THE HANDLE, so Randomise changed its skin and hair colour (it did on the base commit too, on another page); and Cancel

top level, before `bad`

```
/* A FIGURE NOBODY DRESSED IS DRAWN FROM THE HANDLE, so Randomise changed its skin and hair colour (it did on the
   base commit too, on another page); and Cancel after a Randomise and a pick rebuilt the blank opening look under the
   NEW handle — another face, under "Put back as it was". Asked of what is DRAWN (`avatarConfig` of the cell under
   the handle), on the phone and on the sheet, because other phones draw this person from the sheet. And asked again
   across a reload (`reloaded`, below), because the handle the card opened under is kept on the device and read back. */
```

### AND ACROSS A RELOAD (round 2 of the fixes for 339).

top level, before `reloaded`

```
/* AND ACROSS A RELOAD (round 2 of the fixes for 339). What makes the blank opening look the face it was is the
     handle it was drawn under, and that is kept beside which card is open (`hd` in `familyCardEdit`) and read back by
     `cardEditNow_`. Nothing held the read: the review took the line out and all 13 of 339's journeys passed, while in
     a browser a reload between Randomise and Cancel had Cancel fall back to the NEW handle, rebuild the blank look
     under it and send it — skin 0 hair 0 opened, skin 0 hair 6 on the phone and the sheet after "Put back as it was".
     The same lost handle made Save with nothing typed say the FIGURE had been saved. So each end is pressed after a
     second boot from exactly the storage the first left, on a fresh sheet: Cancel sends no look and the face is the
     one the card opened with; Save says the handle, and only the handle, was saved. */
```

### CANCEL WHILE A PICK IS OUT.

top level, before `W`

```
/* CANCEL WHILE A PICK IS OUT. `saveAvatar` takes no lock, so the pick and Cancel's put-back were two writes of one cell
   and the last to finish won: held so the pick finished last, the sheet wore the shirt Cancel said it took off. The
   picture's guard, for the figure: Cancel waits, in words, and once the pick has landed puts the look back. */
```

### A PICK WHILE THE FACE IS STILL BEING KEPT.

top level, before `W`

```
/* A PICK WHILE THE FACE IS STILL BEING KEPT. The review's fix for a Randomise that changed the face (`avatarKeep_`)
   sends a `saveAvatar` of its own the moment the new handle lands — so a colour tapped straight after Randomise was a
   SECOND look on the wire beside it, and `saveAvatar` takes no lock: whichever the server finished last won. Held so
   the keep finished last, the sheet wore the kept face in shirt 0 while the phone wore shirt 3 — Save then shut the
   card over a figure everybody else draws in other clothes. Found in round 1 of the fixes for 339, by reading what the
   fix added. The looks go to the server one after another now (`AV_LINE`), in the order they were chosen. */
```

### THE LOOK AND THE CREDITS THE CARD OPENED WITH SURVIVE A RELOAD.

top level, before `W`

```
/* THE LOOK AND THE CREDITS THE CARD OPENED WITH SURVIVE A RELOAD. The look did (`fig`), and no journey asked it: the
   write or the read of it could go and the suite stayed green. The credits did not: a reload mid-edit lost the line
   that says something bought is still yours. Played here as a phone that kept fewer credits than the card opened
   with — what a purchase leaves — and a shirt to put back. */
```

### A PARENT WHO SHARES A LISTED TUTOR'S NAME.

top level, before `W`

```
/* A PARENT WHO SHARES A LISTED TUTOR'S NAME. `mineIs_` matched by name when both rows carried ids, so she was handed
   the tutor's row as her own card: no Edit (not her id), and Settings — asking the same question — took her name and
   picture off its pages as well, and told her the tutor's rate and photographs were "on your card now". */
```

### ---------- IMPOSTER: ONE PLAYER IS NOT TOLD, AND NOBODY SEES ANYBODY ELSE'S CARD

top level, before `w`

```
/* ---------- IMPOSTER: ONE PLAYER IS NOT TOLD, AND NOBODY SEES ANYBODY ELSE'S CARD -------------------
   THE GAME IS A SECRET KEPT BY A PHONE PASSED ROUND, and every way it can go wrong draws perfectly:
   two imposters, an imposter shown the word, a word left on the screen when the phone is handed on,
   a reveal naming somebody who was never told. So this deals a round of five through the app's own
   handlers and reads what each player would have seen — and what the NEXT player sees before they
   press anything, which is the half that is easy to get wrong. Each screen is held up against what
   was actually dealt (`__t.IMP`), not against what an earlier screen said.

   THE CATEGORY IS THE IMPOSTER'S AND NOBODY ELSE'S. It was on every card, and the owner, 8 Oct:
   "info over load on the reading parts like reading theme and word extra". A player with the word
   is not told its category; the imposter is told nothing else; the table sees it on the play screen.

   AND EVERY SCREEN SAYS EXACTLY ITS WORDS, NOT "AT MOST FOUR". The owner, 11 Oct: "THERE IS TOO MUCH
   FLUFF with talking and all sorts. Even written." A budget of four let "Pass to" and "Hint:" stay
   and would have let any four-word sentence back in, so each screen's whole text is now written out
   here and compared as it is — the hand-over is "Player 2 Show", a card is its picture, its word and
   "Hide", and so on — over the whole game, not just the card, because the sentences that went first
   lived in the note line UNDER it (the review of 8 October) and the last one in the line OVER it. A
   word on any screen that is not in this list is a failure, with the screen's text in the message.

   AND EVERY CARD SHOWS ITS PICTURE, the 11 Oct note's first half: the word's on a player's card, the
   category's on the imposter's and on the play screen, read out of `.imp-sym` against what was dealt. */
```

### WHAT A PERSON HOLDING THE PHONE CAN SEE:

top level, before `visible`

```
/* WHAT A PERSON HOLDING THE PHONE CAN SEE: the words, and every title, aria-label and alt, because a
     secret in a `title` is a secret on the screen. NOT THE RAW MARKUP, which is what this read first —
     and `cat` (Pets and farm animals) is a real card that matched the `art-cat-of` class on every
     pass screen, so the journey failed eight ways on correct code about one deal in 810 (the review
     of 8 October). Class names, `data-do` and an icon's path are the app's own, never the round's. */
```

### ---------- IMPOSTER'S DECK: EVERY CARD HAS ITS PICTURE, AND EVERY CARD DRAWS IT

top level, before `w`

```
/* ---------- IMPOSTER'S DECK: EVERY CARD HAS ITS PICTURE, AND EVERY CARD DRAWS IT ---------------------
   The owner, 11 Oct: "Add symbols to imposter." `check-widgets.js` reads the deck out of the file and
   holds its shape — a picture on every card, none twice, none newer than Emoji 12.0. This is the other
   half: the deck AS THE GAME READS IT (`impCards_`, through `__t`), and every one of its 750 cards
   actually dealt and shown through the app's own handlers, so a card whose picture the reader drops,
   or a frame that draws the word and loses the picture, fails here by name. Thirty to a category,
   exactly — the pile is every card, so a category's share of the rounds is its share of the deck —
   and no word twice, folded as `check-widgets.js` folds it (case, apostrophes, hyphens, a trailing s).
   And every category's picture on the imposter's card for that category. */
```

### ---------- IMPOSTER READ ALOUD: THE WORD, OR "IMPOSTER", TO THE ONE WHO PRESSES LISTEN, AND NOTHING ELSE

top level, before `said`

```
/* ---------- IMPOSTER READ ALOUD: THE WORD, OR "IMPOSTER", TO THE ONE WHO PRESSES LISTEN, AND NOTHING ELSE
   The owner, 8 Oct: "For the imposter game can you have have it so young ones who can’t read can play.
   Like it will read it out for them." And 11 Oct: "make the voice ONLY say the word. THERE IS TOO MUCH
   FLUFF with talking and all sorts." A VOICE IS THE ONE OUTPUT THE WHOLE TABLE GETS, so every way this
   can go wrong is a secret told to the room or a sentence nobody asked for — and nothing about it is
   drawn, so nothing else here would notice: the word said as the card comes up, a word still being
   said when the phone is handed on, a hand-over that talks, a repaint that talks.

   SO THE BROWSER'S VOICE IS STOOD IN FOR, before the first line of the app runs, by one that writes
   down what it was asked to say and when it was told to stop — and the journey writes down its own
   presses in the same list, so "the first thing after Hide was a stop" is a question about one list.
   jsdom has no `speechSynthesis`, which is the third half: with none, nothing about it is drawn.

   THE WHOLE GAME'S UTTERANCES ARE COUNTED AT THE END: two rounds of four, every Listen pressed twice,
   and the list of everything said must be exactly those sixteen — each player's word, or "Imposter",
   nothing before it, after it or round it. The hand-over's "Press Show, then the speaker…", the play
   screen's "… starts", the reveal's "The imposter was…" and Listen's own "Your word is…" were each
   a line here once; any one of them back is a line too many. */
```

### EVERY SCREEN'S WHOLE TEXT WITH READ ALOUD ON, held to the screen journey's exact words.

top level, before `game`

```
/* EVERY SCREEN'S WHOLE TEXT WITH READ ALOUD ON, held to the screen journey's exact words. That
     journey runs with no voice, so Listen and the switch are never drawn there — and a sentence put
     beside Listen ("Hold the phone to your ear"), under the switch, or on the play screen with Read
     aloud on passed all four journeys (the review of 11 October). Listen and the switch carry no
     words, so the words wanted are the same ones. */
```

### ---------- IMPOSTER: A DOUBLE TAP IS ONE PRESS

top level, before `w`

```
/* ---------- IMPOSTER: A DOUBLE TAP IS ONE PRESS ------------------------------------------------------
   SHOW, HIDE AND REVEAL ARE DRAWN ON THE SAME PIXELS, so the second tap of a double tap lands on the
   button the first one drew. Measured in Chromium with two touch taps 120ms apart, the review of
   8 October: Show then Hide (the card flashed and the turn moved on unseen), Hide then the next
   player's Show (Player 1 holding Player 2's card), the last Hide then Reveal (the imposter named
   before anybody had played). Nothing drawn tells these apart from a good round, so every other
   journey here walked straight past them.

   A FINGER IS A PRESS WITH AN EVENT — the click listener in shell.js always passes one — and a check
   walking the round is a press without, which `impTooSoon_` lets through. So the second tap is
   fired IN THE SAME TICK as the first, which is sooner than any double tap and cannot be made late
   by a loaded machine; and each deliberate press waits past the gap first, which a loaded machine
   can only make longer. Neither half depends on how fast this runs. */
```

### AND THE SECOND TAP OF A DOUBLE TAP ON REVEAL LANDS ON THE REVEAL'S OWN BUTTONS — Players, at 390 and 320, by the browser's touch adjustment

top level, before `w`

```
/* AND THE SECOND TAP OF A DOUBLE TAP ON REVEAL LANDS ON THE REVEAL'S OWN BUTTONS — Players, at 390
     and 320, by the browser's touch adjustment (the review of 11 October, note 343): the table went
     back to the setup screen without ever seeing who it was. Either of them, straight after Reveal,
     is that second tap. */
```

### AND A CARD THAT ARRIVED WITHOUT A PRESS TAKES THE FIRST TAP ON IT.

top level, before `w`

```
/* AND A CARD THAT ARRIVED WITHOUT A PRESS TAKES THE FIRST TAP ON IT. The guard first timed the card
     being DRAWN, and a card is drawn by a repaint or a return to the column too: `check/press.js`
     pressed Show, Hide and Reveal inside 600ms of arriving and none of them did anything (8 Oct).
     Dealt here without a finger -- as a repaint draws -- and tapped at once. */
```

### ---------- SENTENCE SCRAMBLE: TAPPED IN ORDER IS RIGHT, AND EVERY STATED ORDER IS RIGHT

top level, before `w`

```
/* ---------- SENTENCE SCRAMBLE: TAPPED IN ORDER IS RIGHT, AND EVERY STATED ORDER IS RIGHT ------------
   A MARKER THAT TELLS A CHILD THEY ARE WRONG IS THE ONE PART OF A GAME THAT MUST NOT BE, and every way
   this one could be wrong draws perfectly: an alternative order refused, Check pressable on half a
   sentence, a chip that cannot be taken back, a deal that arrives already solved. So every sentence
   with a stated alternative is built in EACH of its orders through the real `ss-word` handler and
   checked through the real `ss-check`. */
```

### ---------- WORD SEARCH: EVERY WORD IS IN THE GRID, AND TWO TAPS FIND IT

top level, before `w`

```
/* ---------- WORD SEARCH: EVERY WORD IS IN THE GRID, AND TWO TAPS FIND IT -----------------------------
   A word search that hides a word wrongly is a puzzle nobody can finish and nothing on screen says
   why. So fifteen puzzles of every theme are built and each placed word is READ BACK out of the grid
   along its own cells; a younger theme's words must read forwards; and the filler must spell nothing
   on `WS_NOT` in any direction — asked of the grid, so a build that forgot to filter fails here.
   Then one puzzle is played through the real `ws-cell` handler, forwards and backwards. */
```

### ---------- WHAT A PLACEHOLDER MAY HOLD, ASKED ONE WAY OF EVERY PLACEHOLDER

top level, before `PLACEHOLDER_KEYS_`

```
/* ---------- WHAT A PLACEHOLDER MAY HOLD, ASKED ONE WAY OF EVERY PLACEHOLDER --------------------------
   `drill`'S RULE IN map.js HAS TWO HALVES: *"Give it a streak counter and three greyed-out buttons and
   somebody taps them."* The three journeys below — contest, LEGO trade-in, Progress — each asked only
   the second, with one selector copied three times, `button, [data-do], input, select, textarea,
   a[href]`. Found in review on 9 October, adding Progress: a card given *"Streak: 0 days · 0% of the
   course done"*, a bar at nought per cent and a `<details>` with a `<summary>` passed all three
   asks. The number and the bar are the first half of the rule and nothing looked for them; the
   summary is a thing a finger opens and the selector did not name it. `check/ui.js` went red on that
   card only because the summary was too small to tap — the right answer for the wrong reason, and
   gone the day somebody pads it.

   SO THE RULE IS ASKED HERE, ONCE, as three questions of what is inside the card:
   - **Is anything on it pressable** — by tag (a `<summary>`, a `<label>`, a `<details>`) or by what
     makes any element pressable (`data-do`, `tabindex`, `onclick`, a `role`, `contenteditable`).
   - **Is there anything but `drill`'s markup** — a heading, a `.sub` line, the `.empty` "Not built
     yet." with drill's `<br>` and `.faint` aside. A bar, a meter, a picture or a second card is
     something that looks finished, and naming what IS allowed catches the one nobody thought of.
   - **Is there a digit in it.** A count, a percentage or a date on a thing with nothing behind it
     is a number that is wrong. No placeholder has needed one: contest's house name comes from
     `brand()`, which this payload leaves to its `@family.` fallback.
   It returns faults rather than a pass, so each journey says which visitor and which card. */
```

### ---------- CONTEST: THE LAST CARD ON THE GAMES COLUMN, AND NOTHING ON IT TO PRESS

top level, before `w`

```
/* ---------- CONTEST: THE LAST CARD ON THE GAMES COLUMN, AND NOTHING ON IT TO PRESS -----------------
   ASKED FOR AS "make a widget in games column purley dedicatied for contest. make it a place holder
   for now." Two things a placeholder can get wrong without drawing badly: arriving anywhere but
   LAST, which moves every page `PAGE.games` has remembered by one, and growing a control before
   there is anything behind it, which is a button that does nothing.
   "LAST" BECAME "STRAIGHT AFTER `reels`" when Videos was appended behind it, for the same reason —
   the rule was never that contest is last for ever, it was that nothing was inserted above. */
```

### ---------- LEGO TRADE-IN: APPENDED AFTER THE CALENDAR, AND NOTHING ON IT TO PRESS

top level, before `w`

```
/* ---------- LEGO TRADE-IN: APPENDED AFTER THE CALENDAR, AND NOTHING ON IT TO PRESS -------------------
   ASKED FOR AS "the lego trade in should be a widget in tools. you dont have to make it just leave a
   placeholder." The contest journey's two questions on the other column: appended, so no page
   `PAGE.tools` remembers moves, and no control before there is anything behind one.
   IT ASKED FOR "THE LAST TOOL" WHILE IT WAS ONE, and the whiteboard was appended after it (310) --
   which is the same rule kept, not broken: what `PAGE.tools` needs is that nothing goes in ABOVE an
   existing tool. So this asks that it still sits straight after the calendar it was appended to, and
   the whiteboard's journey asks what was appended after that (the library cards last, docs/history/339). */
```

### ---------- THE WHITEBOARD: LOCK, DRAW, UNDO, KEPT THROUGH A REPAINT, CLEAR -- AND NEVER AN ANSWER

top level, before `w`

```
/* ---------- THE WHITEBOARD: LOCK, DRAW, UNDO, KEPT THROUGH A REPAINT, CLEAR -- AND NEVER AN ANSWER ------
   ASKED FOR AS *"Can you also add a whiteboard widget in tools. Make it bare bones for now."* It is the
   question pages' pen on a blank sheet (`WB_ITEM` in find.js), so this walks it through the pen's own
   listeners and handlers on the Tools column, the way a finger does, and asks what is stored and what
   is drawn after each step:
     * it is after `uploads` in the roster, and only the library cards (339) after it -- `PAGE.tools` keeps a page by its index
     * the bar is the padlock, Undo and Clear, and nothing else -- bare bones, no tool tiles
     * unlocked, a drag draws nothing and the grid may have the gesture (`axisFree`); locked, the ink
       is `data-noswipe` and a drag is ONE stroke under the board's key, drawn as one path
     * Undo takes it off, a second stroke goes on, and `repaint` -- the app's own, which restarts the
       column's widgets -- draws it back from storage with the pen still locked
     * THE KEY IS NOT AN ANSWER'S. `board:u:<who>:whiteboard`, and the backlog sweep that sends every
       `pad:<who>:` key on the device to the account (`answersAdopt_`) leaves it alone -- the reason
       it has its own prefix. The note under it says it is kept here.
     * somebody else signed in on the phone gets a blank board; Clear empties the first one's */
```

### THE BOARD IS WAITED FOR, NOT GUESSED AT.

top level, before `i`

```
/* THE BOARD IS WAITED FOR, NOT GUESSED AT. Measured at a load average of 60: arriving at Tools books
     the column's widget starts behind the slide, `woken_` above found the queue empty because it had
     not been filled yet, and a fixed 50ms after `goPage` found no board -- which appeared a second
     later. `partyBoot_`'s lesson: ask every 100ms, up to ten seconds, then let the queue drain. */
```

### (20+30, 100+40) is units (34, 34); (20+150, 100+200) is (170, 170); (20+270, 100+360) is (306, 306).

top level, before `s`

```
/* (20+30, 100+40) is units (34, 34); (20+150, 100+200) is (170, 170); (20+270, 100+360) is (306, 306).
     STORED THINNED (`PAD_BOARD_MAX` in find.js): the middle point of a straight run is no part of the
     line, so the board keeps the two ends -- a question's pad would keep all three. */
```

### ---------- AND WHAT THE TWO REVIEWS OF THE BOARD FOUND, ASKED OF IT

top level, before `w`

```
/* ---------- AND WHAT THE TWO REVIEWS OF THE BOARD FOUND, ASKED OF IT ------------------------------------
   Each of these was measured on a phone with real touches (note 310) and fixed in the pen, so each is
   asked here through the pen's own listeners and handlers, the way the journey above asks its own:
     * ONE FINGER IS ONE STROKE: a second pointer going down mid-stroke (a palm) is ignored, its moves
       and its lift are not the stroke's, and no stray preview is left in the board
     * A REPAINT DOES NOT CUT A STROKE: `repaint()` half way leaves the same board element under the
       finger (`padHold_`, and `wbPaint_` skipping the copy being drawn on), and the stroke is kept whole
     * CLEAR CAN BE UNDONE: Undo on the emptied board puts back exactly what Clear took
     * A STROKE THE DEVICE REFUSED STAYS DRAWN AND IS SAID TO BE UNSAVED -- 317's rule, which the board
       took when the two were merged (note 310): held for the visit, the note under the board says
       "Not saved", the toast says it, and with room again the next stroke keeps them all
     * ONE PAST THE BOARD'S CEILING IS TAKEN BACK OFF and the toast says the board is full -- a board
       the device stored, and one it is only holding for the visit
     * A SIGN-OUT, AWAY FROM TOOLS, takes the last person's board off the stale column: unarmed, keyed
       to nobody, blank -- and a sign-in draws the next person's there */
```

### A STROKE THE DEVICE REFUSED:

top level, before `S`

```
/* A STROKE THE DEVICE REFUSED: the store throws for the board's key, as a full one does. 317's rule,
     the board's since the merge (note 310): HELD FOR THE VISIT AND DRAWN -- a line that vanishes under
     the finger is worse than one said to be unsaved -- and said, under the board and once as a toast. */
```

### AND WITH A HELD COPY IN THE WAY:

top level, before `toasts.length`

```
/* AND WITH A HELD COPY IN THE WAY: the device stored a one-stroke board, then refused the board as it
     grew past its ceiling, so the visit holds the full one (`keepHeld_`, read first by `padRead_`) over
     a store that answers the old, small one. The ceiling is the board's size, not a refused write: it is
     asked of the list on the screen -- not of the store's, which has room -- and still says so. */
```

### ---------- THE FINGER PEN: TWO FINGERS, A PALM OR A THUMB LEAVE NOTHING (338)

top level, before `penEv_`

```
/* ---------- THE FINGER PEN: TWO FINGERS, A PALM OR A THUMB LEAVE NOTHING (338) -----------------------------
   *"they are just using their fingers"* -- the owner, 11 Oct. Measured before with real touch: a two-finger
   tap stored a dot, a pan or a pinch a line, and a palm that landed first took the stroke and lost the
   finger's whole line. Each rule of the contact model (find.js, over `padLand_`) is asked here through the
   pen's own listeners, on a question's 340x170 pad (one unit across is 1px, one down 0.5px) and on the
   board, with events the way a phone sends them: `pointerType: 'touch'`, the first finger primary, each
   carrying its own `timeStamp`. Every case asks, synchronously after the last lift: what was stored, that no
   preview or aid is left, that `padBusy_` has let go of the swipe engine, and that no contact is left
   behind -- a contact left behind is a pad the column can never be swiped off. */
```

### P7: A FINGER HELD STILL 300ms, A PALM LANDS ON THE INK, the finger draws 100px, the palm lifts:

top level, before `prim`

```
/* P7: A FINGER HELD STILL 300ms, A PALM LANDS ON THE INK, the finger draws 100px, the palm lifts: the
     finger's line with every sample, those taken while it was held too -- and the preview back within a
     frame of the finger moving on alone. */
```

### P11, TIMED: note 310's palm, landing 350ms into a line that has gone 120px, 150px from the finger -- an established stroke, so the palm is a rest and the line

top level, before `prim`

```
/* P11, TIMED: note 310's palm, landing 350ms into a line that has gone 120px, 150px from the finger --
     an established stroke, so the palm is a rest and the line is finger 1's (the untimed original is the
     journey above, unchanged). */
```

### ---------- THE FINGER PEN, AFTER REVIEW: A HAND THAT STAYS, A HAND THAT SETTLES, A PIN, A LATE REPORT, ANOTHER KIND

top level, before `w`

```
/* ---------- THE FINGER PEN, AFTER REVIEW: A HAND THAT STAYS, A HAND THAT SETTLES, A PIN, A LATE REPORT, ANOTHER KIND ----
   The review of 11 Oct drove the pen with real touch as a child would (338, "After review") and found five ways it lost a
   line or kept the wrong one. Each is asked here through the pen's own listeners, with the events as a phone sends them:
   - A HAND LEFT DOWN AFTER A TWO-FINGER GESTURE kept the pen dead -- every later line drew nothing until it lifted, and a
     gripping thumb or a resting palm never lifts. A hand gone still is not half of a pan in progress.
   - A THUMB OR A PALM THAT ROLLS OR SETTLES a few pixels as the line starts was taken for the second finger of a pan, and
     the line was lost. A settle stops; a second finger keeps up.
   - A PIN HELD ON THE CENTRE (a compass, a ruler's end) and a second finger moving was handed to the second finger, and
     stored a mark neither meant. It stores nothing, as it did before 338.
   - THE OTHER FINGER'S REPORT FOR THE SAME MOMENT came in an event stamped later than its samples, and was judged as if
     it were current: a pan drew a line. Each finger is judged at its samples' own time.
   - A POINTER OF ANOTHER KIND going down as the primary one ended the stroke: "primary" is per kind, so a palm is the
     primary touch while a stylus draws, and a mouse click is primary while a finger does.
   And the two counted costs the review found unasked: Undo on a full board rebuilt and recomputed every stroke, where one
   came off. */
```

### A LINE ACROSS THE BOARD at 300px/s -- 2.4px every 8ms, a child's steady stroke -- from (x0, y), `n` steps, with a FRAME every fourth step:

top level, before `bline`

```
/* A LINE ACROSS THE BOARD at 300px/s -- 2.4px every 8ms, a child's steady stroke -- from (x0, y), `n` steps, with a FRAME
     every fourth step: the pen decides two fingers at a frame, with every report in, so a journey that never let a frame
     run would only ever ask the lift. */
```

### A HAND LEFT DOWN AFTER TWO FINGERS (the review's case, as note 338's P16 begins):

top level, before `prim`

```
/* A HAND LEFT DOWN AFTER TWO FINGERS (the review's case, as note 338's P16 begins): a hand on the card goes down first, a
     finger lands on the board and the two move 30px together -- two fingers, nothing. The finger lifts, the HAND STAYS,
     still. Two lines drawn after it are each drawn: a hand gone still is not half of a pan in progress. */
```

### A PALM THAT CAME LATER TO ONE LINE IS NOT LATER THAN THE NEXT (found while fixing these).

top level, before `r6`

```
/* A PALM THAT CAME LATER TO ONE LINE IS NOT LATER THAN THE NEXT (found while fixing these). A palm lands on the board as
     a line ends -- a rest, having come after that line's finger -- and the next finger lands 64ms later, so the palm is a
     young contact held against it. The palm then slides 30px while the finger is still: it was down BEFORE this finger,
     so it may never take its stroke (a watched contact never may, 338 T3); the finger's line is drawn. Kept marked as
     "came later" from the line before, the palm was handed the stroke -- its slide stored, the finger's line lost. */
```

### AND A TWO-FINGER GESTURE STILL IN PROGRESS TAKES IN A FINGER THAT LANDS:

top level, before `prim`

```
/* AND A TWO-FINGER GESTURE STILL IN PROGRESS TAKES IN A FINGER THAT LANDS: a pinch, one finger lifts and the other drags on
     -- it is still moving, so the gesture is not over -- and a tap lands meanwhile. Nothing: the tap joined the gesture.
     (Dissolved at every landing instead, the dragging finger would be held against the tap, move alone, be a rest -- it
     was down first -- and the tap's dot would be stored.) */
```

### UNDO TAKES OFF ONE STROKE AND REDRAWS NOTHING ELSE ==================== MEASURED BY THE REVIEW:

top level, before `ring`

```
/* ==================== UNDO TAKES OFF ONE STROKE AND REDRAWS NOTHING ELSE ====================
     MEASURED BY THE REVIEW: on a full board (314 strokes, 98,942 characters) Undo cost 74ms of main thread at 4x against 31
     before -- every stroke's curve recomputed and every `d` parsed again, for one stroke taken off. The screen is still
     the store's: a path is kept only where it already says exactly what its stroke draws. */
```

### AND WHAT IS KEPT IS HELD TO A SIZE, NOT A COUNT:

top level, before `big`

```
/* AND WHAT IS KEPT IS HELD TO A SIZE, NOT A COUNT: a question keeps every sample, so 150 long strokes (1,200 points each,
     about 40K characters of key and path apiece) are 6M characters -- under a cap of 4,000 strokes they would all be kept.
     The memo must stay within its character budget, and still answer for the stroke drawn last. */
```

### THE OTHER FINGER'S REPORT COMES LATE:

top level, before `prim`

```
/* THE OTHER FINGER'S REPORT COMES LATE: finger 2 of a pan reports 5ms out of phase, and one of its events is stamped after
     finger 1 has gone 10px while carrying only its sample from 16ms before (4px). Judged at that event's stamp it reads as
     still and the pan draws finger 1's line; judged at its samples' own time it is moving with finger 1. */
```

### WHAT IS ON THE PICTURE WHILE IT HAPPENS (third review, 12 Oct):

top level, before `aidOf`

```
/* WHAT IS ON THE PICTURE WHILE IT HAPPENS (third review, 12 Oct): a mark that cannot be kept is not shown either. The
       review watched a resting palm's own ruler line, or a ring round it, follow the palm about the picture while the
       finger's line showed nothing, and vanish at the lift. */
```

### AND A PIN THAT ROLLS (second review, 12 Oct; third, the same day):

top level, before `name`

```
/* AND A PIN THAT ROLLS (second review, 12 Oct; third, the same day): the same pin, but once finger 2 has landed it drifts
       over 300ms, as a fingertip held on a point rolls. Refused the swap, the pin was made the stroke again with only
       `PAD_MIN_PX` (4px) to go -- the ruler stored its own `[[170,170,176,170]]` and the compass a ring of radius 6 round
       itself. The second review made that 10px; the third rolled the pin 12, 16 and 24px, and the ruler stored
       `[[170,170,184,170]]` and the compass a ring round the pin again -- 10px is inside what a pin rolls. Nothing at any
       roll, and nothing of the pin on the picture while it rolls. */
```

### A PALM RESTING ON THE PICTURE FIRST, 400ms BEFORE THE FINGER, drifting as the finger uses the tool -- all of it in the finger's first 120ms (a palm settling)

top level, before `name`

```
/* A PALM RESTING ON THE PICTURE FIRST, 400ms BEFORE THE FINGER, drifting as the finger uses the tool -- all of it in the
       finger's first 120ms (a palm settling), or spread over the whole line (a hand sliding a little with the finger) --
       then a second line while it stays (second and third reviews). By movement the palm is a pin: the finger is refused
       the stroke and the palm made it again. Round 2 stored the PALM's own ruler line or its ring at 6px; with its 10px it
       still stored them at 12, 16 and 24 -- at the corner of the picture, where nobody drew. Now nothing at any drift, and
       nothing of the palm on the picture while it drifts. The finger's line goes with it -- the cost chosen in 338
       section 4 (a mark lost rather than a stray one left): only a contact's size tells a resting palm from a pin -- and
       so does a second line while the palm stays down. If tools are ever given the palm-first swap back, these want the
       finger's lines. */
```

### THE PALM STILL WHILE THE FINGER DRAWS, THEN SLIDING ONCE IT HAS LIFTED (third review):

top level, before `name`

```
/* THE PALM STILL WHILE THE FINGER DRAWS, THEN SLIDING ONCE IT HAS LIFTED (third review): 12px, as the review slid it, and
       60px -- a hand moved across the card to draw somewhere else. Round 2 stored the palm's own line or ring at 12px. The
       finger drew 120px (the ruler) or opened 60px (the compass): it was the one drawing, and the palm marks nothing in that
       stroke however far it then goes. */
```

### A FINGER'S SHORT RULER TICK, REFUSED, AND THE PALM THEN DRIFTING 15px, and 28px (third review's rule, and the fourth's):

top level, before `drift`

```
/* A FINGER'S SHORT RULER TICK, REFUSED, AND THE PALM THEN DRIFTING 15px, and 28px (third review's rule, and the fourth's):
       at 10px, as round 2 had it, the palm's 15px line was stored; round 3 stored the palm's line once it had gone further
       than the tick (the 28px drift); since the fourth review the still one marks only by going 30px first -- nothing.
       (A palm that slides 30px or more after a refused tick shorter than that still marks: 338 section 4.) */
```

### AND A FINGER THAT WAS AIMING STILL GETS ITS LINE:

top level, before `along`

```
/* AND A FINGER THAT WAS AIMING STILL GETS ITS LINE: the ruler finger held 300ms on its point, a palm lands on the picture
       and settles 12px in 80ms before the finger moves -- refused the swap, the finger is the stroke again, and its 120px
       line goes 30px before the palm does. (Withdrawn outright instead, the palm's settle would cost this line.) And the
       same with the palm then SLIDING ALONG with the hand, 40px, as the finger draws: the finger went 30px first, so it
       is the one drawing (third review -- the review's prototype, "once the refused one has gone 30px the still one never
       marks", lost this line). Its line is SHOWN as it is drawn, from the moment it has gone 30px. */
```

### AND THE RACE IS RUN BY THE SAMPLES' OWN CLOCK, not by which event came first:

top level, before `prim`

```
/* AND THE RACE IS RUN BY THE SAMPLES' OWN CLOCK, not by which event came first: the same aiming finger and settled palm,
       then the finger draws at 400px/s while the palm slides along at 200px/s, and under load the palm's moves come folded
       -- one event carrying 50ms of samples -- with the finger's last 25ms still on their way. The palm's second fold says
       it went 30px at 1590; the finger had gone further than the palm by 1580, in samples that arrive just after it.
       Decided at the palm's fold, the finger's line was lost; the finger is still reporting (its last report 30ms
       before), so the frame waits for it -- and it went further first: its line. */
```

### A THUMB ON THE CARD, OFF THE PICTURE, landing 300ms after the ruler finger and sliding 40px before the finger moves:

top level, before `prim`

```
/* A THUMB ON THE CARD, OFF THE PICTURE, landing 300ms after the ruler finger and sliding 40px before the finger moves: it
       is refused (it is not on the picture) and says nothing about the finger -- the finger's line. Counted as though it were
       a refused contact on the picture, a thumb sliding on the card would cost every ruler line drawn beside it. */
```

### AND A PALM LEFT DOWN FROM ONE RULER LINE, SLIDING 30px AS THE NEXT FINGER LANDS (the board's case, with the ruler):

top level, before `prim`

```
/* AND A PALM LEFT DOWN FROM ONE RULER LINE, SLIDING 30px AS THE NEXT FINGER LANDS (the board's case, with the ruler): the
       palm was down BEFORE that finger, so it is refused for being first, not by the pin rule -- the finger is the one
       drawing, and both lines are kept. */
```

### WITHIN `PAD_TOGETHER_MS` THE PALM STILL HANDS THE TOOL OVER (round 1 kept it; checked so the pin rule cannot widen unseen):

top level, before `getBoundingClientRect`

```
/* WITHIN `PAD_TOGETHER_MS` THE PALM STILL HANDS THE TOOL OVER (round 1 kept it; checked so the pin rule cannot widen
       unseen): a palm 120ms before the ruler finger, drifting 6px -- the finger's line. And the PEN always hands it over: a
       palm 400ms before, drifting 6px -- the finger's line, from its own first point. */
```

### FOURTH REVIEW (12 Oct):

top level, before `nearPalm`

```
/* ==================== FOURTH REVIEW (12 Oct): A PALM THAT LANDS AFTER AN AIMING FINGER ====================
       The palm lands on the picture at (420, 210) -- units (320, 320) -- with a finger already held on its point at (130, 85),
       units (30, 70). Nothing may ever be stored near the palm, and the finger's line is the one meant. */
```

### THE FINGER'S STROKE FROM `t0`:

top level, before `draw`

```
/* THE FINGER'S STROKE FROM `t0`: 40 moves 10ms apart -- a 120px pen or ruler line, or the compass opened 60px and swung
       half a turn. Each move is handed to `also(i, t)` for the other hand. Returns the points, for the pen's `units`. */
```

### THE MUST-FIX: THE FINGER HELD STILL TO AIM, A PALM LANDING AFTER IT AND SETTLING 9, 12 OR 16px -- the pen at 300ms and at 1.5s

top level, before `S`

```
/* THE MUST-FIX: THE FINGER HELD STILL TO AIM, A PALM LANDING AFTER IT AND SETTLING 9, 12 OR 16px -- the pen at 300ms and
       at 1.5s (it hands a palm-first stroke over at any age), the ruler and the compass at 120ms (within `PAD_TOGETHER_MS`,
       where they hand it over too) -- and then the finger draws. 2a89387 handed the palm the stroke at its 10px: at 12 and
       16 the palm's settle was stored, `[[320,320,308,320]]` or a ring round it, and the finger's line was lost. Now the palm
       would have to go 30px; it stops at 16, the finger moves, and the half rule says the palm settled: the finger's line,
       shown as it is drawn. */
```

### AND A LIFT HANDS NOTHING OVER (decided while fixing the above -- 338 section 4).

top level, before `S`

```
/* AND A LIFT HANDS NOTHING OVER (decided while fixing the above -- 338 section 4). The same palm, settling 12 or 16px:
       - it LIFTS before the finger moves (a hand brushing the picture): the review's rule let the lift hand it the stroke,
         so its settle was stored at its lift and the finger's line after it was lost -- the finger's line, now;
       - the FINGER lifts still (a tap) while the palm stays: the lift handed the palm the stroke and its settle was stored
         -- nothing, now (the tap's dot is the cost in section 4's first line). */
```

### THE COST OF THAT, CHECKED SO IT CANNOT GROW UNSEEN:

top level, before `prim`

```
/* THE COST OF THAT, CHECKED SO IT CANNOT GROW UNSEEN: a palm resting first, the pen's first strokes after it are a later
       contact's, and one shorter than 30px is not handed over -- two 20px ticks are lost while the palm stays down and
       still. A 60px line is handed over (from its own first point, every sample); from then on the palm is a watched rest,
       and the next 20px tick is drawn. The ruler, the palm 100ms first: its 20px tick is lost the same way. */
```

### AND THE ONE LEFT ALONE IN A HELD STROKE IS HANDED IT ONLY AT 30px, WHICHEVER CAME FIRST (decision 4, again).

top level, before `slide`

```
/* AND THE ONE LEFT ALONE IN A HELD STROKE IS HANDED IT ONLY AT 30px, WHICHEVER CAME FIRST (decision 4, again). A lift
       hands nothing over, so after a palm-first tick the PALM is the one left holding the stroke -- and it was handed it
       back at its 10px: the hand moving on, the palm sliding 15px, drew its slide, and every finger stroke after it was
       a rest beside an established stroke, lost until the palm lifted (and so it was after a finger's TAP on 2a89387).
       - the pen: a palm resting first, a 20px tick (the cost above), the palm slides 15px, then a finger draws 60px: the
         line, and nothing at the palm, and nothing on the picture while the palm slides;
       - the same palm sliding 15px and lifting: nothing;
       - the ruler, the palm 100ms first: a 20px tick, the palm slides 15px and lifts: nothing.
       And the price, so it cannot grow unseen: a finger aiming, a palm landing 300ms after it, settling 12px and lifting
       (a brush) -- the finger then draws 20px: nothing (it was handed it back at 10px before); 40px: its line. */
```

### AND THE ONE IT WENT TO AT A LIFT STAYS OWED WITH A NEW FINGER BESIDE IT:

top level, before `end`

```
/* AND THE ONE IT WENT TO AT A LIFT STAYS OWED WITH A NEW FINGER BESIDE IT: a finger taps still beside a palm that landed
       300ms after it and settled 12px -- the palm is held as the stroke's (the tap's cost) -- then a finger lands, and the
       palm drifts 12px more before it moves. An owner with a candidate beside it is handed the stroke back at 10px (P7),
       but this owner came later and never showed it was drawing: it waits for 30, and the finger's 60px line is drawn. */
```

### THE SHOULD-FIX: THE RACE COUNTED THE STILL ONE FROM ITS OWN DOWN.

top level, before `mj`

```
/* THE SHOULD-FIX: THE RACE COUNTED THE STILL ONE FROM ITS OWN DOWN. A palm 400ms first that settled 8 or 9px as it was put
       down -- under 10, still a dot -- then drifts 2-4px more over the first 200ms of a finger that starts slowly (a hand's
       stroke: minimum jerk), drawing a 120px ruler line or opening the compass 60px and swinging. The finger is refused (the
       pin rule) and the two race; counted from its down the palm was at 11-13px while the finger was at 10-12, and 2a89387
       showed and stored the palm's ruler line `[[320,320,308,320]]` or a ring round it (real touch, timing-dependent: the
       review's 6 of 12 ruler runs and 4 of 4 compass runs at 9+3 and 9+4; 3 of 8 and 1 of 6 in round 4's last pass).
       Counted from where it was when the finger landed it
       has moved 4px: nothing, and nothing shown -- the finger's line is the cost section 4 chose for a palm down over 200ms.
       (With the race to 30px, below, a 2-4px drift cannot win from either point: the next case is the one that tells them
       apart.)
       And a PIN that settled 8 or 9px as it was put down, then rolls 3 or 5: the same. And one that rolls 12px in 200ms
       beside a finger starting slowly: it reaches 10px first, and with the race at 10px and "further", asked by the
       samples' clock, it won every time -- its own ruler line, or a ring round itself (real touch too, 390 and 820). The
       race is to 30px now: nothing. */
```

### AND RACED FROM WHERE IT WAS WHEN THE FINGER LANDED:

top level, before `name`

```
/* AND RACED FROM WHERE IT WAS WHEN THE FINGER LANDED: the palm settled 9px as it was put down; the finger goes 12px
         quickly -- refused, the race begins -- and pauses 200ms, the palm drifting 22px meanwhile, 31 from its own down and
         22 from where it was when the finger landed; then the finger draws on. Counted from its own down the palm went 30px
         first, and its line or ring was shown and stored; counted from where it was, it never did: nothing. */
```

### THE NIT: THE RACE WAS JUDGED AGAINST HOW FAR THE PALM HAD GONE BY THE FRAME, not by the finger's samples.

top level, before `prim`

```
/* THE NIT: THE RACE WAS JUDGED AGAINST HOW FAR THE PALM HAD GONE BY THE FRAME, not by the finger's samples. The ruler
       finger aiming 300ms, a palm landing and settling 12px -- a frame: refused, the race begins. Then, with no frame
       between (a busy main thread), the finger goes 32px in 80ms, and only then the palm slides 30px in 50ms -- 42 by the
       frame. By the samples the finger went 30px first: its line. 2a89387 asked for a finger sample further than the palm's
       42 at the frame, found one only after the palm had passed 30, and lost the line. */
```

### ---------- THE FINGER PEN KEEPS EVERY SAMPLE, AND DRAWS IT ONCE A FRAME (338, increment 1b)

top level, before `w`

```
/* ---------- THE FINGER PEN KEEPS EVERY SAMPLE, AND DRAWS IT ONCE A FRAME (338, increment 1b) ------------------
   MEASURED BEFORE: a 1,200-sample zigzag at 4x CPU reached the pen as 395 events and 394 points were kept --
   every sample was there in `getCoalescedEvents`. And the whole live path was rebuilt per event, with the next
   event's box read forcing the layout that write dirtied. Asked here on a question's 340x170 pad: the folded
   samples are the stroke's (one of them with no `pointerId`, as iOS 18.2 sends them); an event that answers
   `[]` is its own sample; ONE box read per event however many samples it carries; the box read AGAIN when the
   pad has moved under the finger (a box kept from the down would put the rest of the line in the wrong
   place); before a frame the live path is behind, after one it is exactly `padPath_` of the points so far;
   past 128 segments it is in chunks; and on the lift the last point is in the store and in the one path
   drawn -- nothing the last frame had not yet drawn is lost. */
```

### AND A FRAME AFTER THAT WRITES THE OPEN CHUNK, NOT THE STROKE:

top level, before `dw`

```
/* AND A FRAME AFTER THAT WRITES THE OPEN CHUNK, NOT THE STROKE: at most two `d`s -- the open chunk and one being frozen
     -- however long the stroke has grown. Every chunk rewritten every frame keeps every other line here true and costs a
     frame more as the stroke grows (the review's mutation: 20 writes a frame at 2,500 points, where this writes 1-2). */
```

### ---------- A POINT PUT DOWN ON THE GRID THE PICTURE DRAWS (docs/history/357)

top level, before `w`

```
/* ---------- A POINT PUT DOWN ON THE GRID THE PICTURE DRAWS (docs/history/357) --------------------------------
   The grid is read from the picture's own markup (`padGrid_`): Q7's 14 x 17 unclassed lines, a `path.grid`, and over
   the library every pad whose picture is ruled -- and NOT a bar chart's bars or an axis's ticks, which would snap a
   point to a bar's top. Then, on a pad with a box (jsdom's is stubbed), a wobbling tap on an intersection is stored
   as that one intersection, a line drawn from it is the finger's own samples, and the ruler's end lands on its
   intersection. check/pen.js asks the same with real touch; this is the arithmetic, in two seconds. */
```

### ---------- A FAST LINE IS DRAWN ROUND, AND EVERY STORED STROKE STILL DRAWS (338, increment 1c)

top level, before `w`

```
/* ---------- A FAST LINE IS DRAWN ROUND, AND EVERY STORED STROKE STILL DRAWS (338, increment 1c) ----------------
   `padPath_(st, k)` draws long, gently turning segments as corner-keeping centripetal Catmull-Rom curves
   through every stored point, and NOTHING STORED CHANGES. Asked here of the function itself and of a pad:
   today's string byte for byte for a dot, two points, a repeated pair, a square, a triangle, note 310's
   stroke, a dense stroke, a malformed one and every stroke the journeys in this file store; an L keeps its
   corner; a 12-gon of radius 100 is drawn within half a percent of its circle and a 9-point ring curves while a
   hexagon does not; a circle stored on the 3:4 board is round on the screen when drawn with the board's
   aspect; and an OLD drawing -- whole numbers in the store, as every device holds them -- is drawn round, its
   stored value byte for byte what it was, every stored point an end of a segment. */
```

### PP5: A 12-GON OF RADIUS 100, k = 1:

top level, before `ring`

```
/* PP5: A 12-GON OF RADIUS 100, k = 1: curves, within half a percent of its circle between its ends, through every
     point. AT THE TWO ENDS a stroke's tangent runs along its chord (it has no point beyond), so the first and last
     segments are held to the polygon's own sagitta -- never worse than the straight line was. Closing the seam of a
     ring was declined (338, section 9): the kink there is no larger than the ring's own step. */
```

### ---------- `?pen=sizes`: THE READING INCREMENT 2 WAITS FOR, AND NOTHING ELSE (338)

top level, before `bad`

```
/* ---------- `?pen=sizes`: THE READING INCREMENT 2 WAITS FOR, AND NOTHING ELSE (338) ------------------------------
   No finger, thumb or palm width has ever been measured on an iPad here, so increment 1 records sizes and decides
   nothing by them. With `?pen=sizes` in the address a fixed line lists the last eight contacts: the pointer's
   kind, its width x height at the down, the largest during. Asked: it is there with the address and not without
   it, it says what the platform reported, it keeps eight, it is hidden from a screen reader -- and a contact of
   a palm's size still draws, because size decides nothing yet. */
```

### ---------- VIDEOS: THE BAR ALONE, RESULTS AS YOU TYPE, A TAP PLAYS IN THEIR PLACE, FULL SCREEN

top level, before `vidIdle_`

```
/* ---------- VIDEOS: THE BAR ALONE, RESULTS AS YOU TYPE, A TAP PLAYS IN THEIR PLACE, FULL SCREEN -------
   ASKED FOR AS "videos would be in the games column. its one new widget. its a video searcher you
   type in. and there should be a full screen button." AND THEN, 10 Oct (note 321): *"make it look more
   like youtube, the widget, in the sense that at first all you see is a search bare, then you search
   and you see relevant result underneath. max 4 results show. you click on one, then it shows video.
   you can click fullscreen to make it fullscreen"*. Each half can fail while the card still draws
   perfectly well: a card that opens on a list (or a count, or an empty player) over the bar, a box
   whose results do not change as you type, a fifth row, a row that is tapped and plays nothing (or
   plays UNDER the results, or in the wrong element — a YouTube link in a `<video>` is a black box), an
   edit that leaves the old film talking, a switched-off row that shows anyway, and a Full screen tile
   that is pressed and asks nobody for anything — or, on a phone with no full screen for a frame, says
   "use the player's button" and does nothing. And the `contest` rule again: the card is appended LAST,
   so no remembered page moves.

   THE LIST IS THE JOURNEY'S OWN, served where the app asks for `data/videos.json`, so the rows are
   known here rather than whatever the owner has typed in by the time this runs. */
```

### WHAT IS ON THE CARD BESIDE THE BAR — nothing, when it is idle.

top level, before `vidIdle_`

```
/* WHAT IS ON THE CARD BESIDE THE BAR — nothing, when it is idle. Each thing found is named, so a failure
   says what was drawn rather than that something was. jsdom has no layout, so "drawn" is "in the
   markup": the watch block is there while it is idle, without its `on`, which the stylesheet hides. */
```

### AND THE CARD ITSELF IS WAITED FOR, `partyBoot_`'s rule below:

top level, before `n`

```
/* AND THE CARD ITSELF IS WAITED FOR, `partyBoot_`'s rule below: it is the last of a long column and
     wakes last. Under a load average of 33-39 on four cores (9 Oct) `quiet()` came back with the card
     drawn and not yet started — no box, nothing asked — on the commit before this check changed as
     well as after it, one run in two. Bounded: a card that never starts still fails on what it asked. */
```

### ---------- RESULTS AS YOU TYPE, RANKED, AT MOST FOUR

top level, before `want`

```
/* ---------- RESULTS AS YOU TYPE, RANKED, AT MOST FOUR -------------------------------------------------
     "clip" is every row's kind, so every listed row narrows to it — and two have it in their TITLE, which
     ranks them first: the one that plays here before the one that opens Drive, then the two found only
     by their kind, A to Z. The switched-off row is never among them. */
```

### ---------- AND IT LOOKS LIKE YOUTUBE (note 311): A PICTURE ON EVERY ROW, AND A POSTER UNDER IT

top level, before `rowOf`

```
/* ---------- AND IT LOOKS LIKE YOUTUBE (note 311): A PICTURE ON EVERY ROW, AND A POSTER UNDER IT --------
     Each half below draws a perfectly good card when it is wrong: a YouTube row whose picture asks the
     tracking host (or the wrong id) looks like any other thumbnail, a row with no picture that is a grey
     hole looks like a picture still loading, and a picture that failed and was left in place is a
     broken-image mark on a phone. */
```

### A DRIVE ADDRESS IN THE OWNER'S LIST ASKS DRIVE FOR NOTHING AND STAYS A LINK.

top level, before `kept`

```
/* A DRIVE ADDRESS IN THE OWNER'S LIST ASKS DRIVE FOR NOTHING AND STAYS A LINK. Only the films list —
     which reaches an admin alone — may ask Drive for a picture or a player: `drive.google.com` carries
     Google's cookies, and the owner's list reaches every child (review of 9 Oct; note 321 kept it so). It
     is a door, so its badge is the out-arrow, named for a screen reader, and the line beside it does not
     say "opens in a new tab" a second time. */
```

### AND A YOUTUBE PICTURE THAT LOADED AS YOUTUBE'S GREY STAND-IN — 404 with a 120x90 picture, which a browser draws and calls loaded, so `error` never fires.

top level, before `gone`

```
/* AND A YOUTUBE PICTURE THAT LOADED AS YOUTUBE'S GREY STAND-IN — 404 with a 120x90 picture, which a
     browser draws and calls loaded, so `error` never fires. A real `mqdefault` is 320 wide and stays.
     jsdom loads no pictures, so the width is said here and the `load` is the browser's own event. */
```

### ---------- THE KEYBOARD'S SEARCH KEY PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS (review of 10 Oct)

top level, before `key`

```
/* ---------- THE KEYBOARD'S SEARCH KEY PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS (review of 10 Oct) ---
     The box says `enterkeyhint="search"`, so a phone shows a Search key — and nothing answered it: the
     focus stayed in the box and the keyboard stayed up over the four results. jsdom has no keyboard, so
     the focus leaving the box is what says it went; the four rows and the words stay as they were. */
```

### ---------- A TAP PLAYS IT IN THE CARD, IN PLACE OF THE RESULTS

top level, before `fr`

```
/* ---------- A TAP PLAYS IT IN THE CARD, IN PLACE OF THE RESULTS ----------------------------------------
     *"you click on one, then it shows video."* The nocookie embed, of that id; its title and line under
     it; the bar still holding what was typed; and NO results left under the player. */
```

### ---------- ANY EDIT GOES BACK TO THE RESULTS, AND THE FILM STOPS

top level, before `back`

```
/* ---------- ANY EDIT GOES BACK TO THE RESULTS, AND THE FILM STOPS -------------------------------------
     An iframe cannot be paused from outside, so emptied is the only stopped: no player left talking under
     the results for the new words. And clearing the box is the bar alone. */
```

### ---------- AND THE APP'S OWN WHERE THERE IS NONE — Safari on an iPhone, with a frame

top level, before `toasts`

```
/* ---------- AND THE APP'S OWN WHERE THERE IS NONE — Safari on an iPhone, with a frame ------------------
     The Fullscreen API taken away: the tile must fill the glass itself rather than toast. The block that
     holds the player goes into the top layer (`showPopover`) WHERE IT IS — the frame is the same element
     before, during and after, because moving it would reload the film — marked so a swipe on the black
     does not turn the column, with Exit in place of Full screen; the arrow keys do not reach the grid, and
     Escape and the Exit tile each give the screen back. */
```

### ---------- ONE TAP IS ONE PLAYER, WHEN THE CARD IS ALSO ON THE SAVED COLUMN

top level, before `rows`

```
/* ---------- ONE TAP IS ONE PLAYER, WHEN THE CARD IS ALSO ON THE SAVED COLUMN ---------------------------
   The Saved column draws a starred card again and `vidPaint_` writes every copy (`.vid-box` is a class
   for that reason). Every copy used to build the player as well, so one tap was an `autoplay` embed in
   the copy in front and another in the copy parked off the glass — two films talking at once wherever a
   browser lets one play with sound (review of 10 Oct; `check/videos.js` asks the same with a real click
   and counts the requests). So: the tapped copy plays, every other copy shows the results for what was
   typed with an empty stage, and a tap in the other copy moves the one player there. */
```

### ---------- AND THE BEST FOUR, IN THE ORDER A PERSON WOULD WANT THEM

top level, before `yt`

```
/* ---------- AND THE BEST FOUR, IN THE ORDER A PERSON WOULD WANT THEM ------------------------------------
   *"max 4 results show"* — so which four, and in what order, is the whole of the search. Every row
   below has "sun" somewhere, at a different depth: the whole title, the start of it, the start of a
   word in it, inside a word, and only in the tags or the notes. Ties go to a row that plays here before
   a door, then A to Z. The list is invented, and longer than four, so the line under it has a number. */
```

### ---------- A WIDGET WAITING SHOWS THE ONE LOADER, AND ONLY THAT, UNTIL WHAT IT WAITS FOR LANDS

top level, before `bad`

```
/* ---------- A WIDGET WAITING SHOWS THE ONE LOADER, AND ONLY THAT, UNTIL WHAT IT WAITS FOR LANDS -------
   THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple
   loading thing while it's info or whatever is loading."* `check-loading.js` reads the source for a
   wait drawn any other way; this RUNS it, because a loader that is drawn and never taken off, or taken
   off before anything is there, reads perfectly in the source.

   THREE WAITS, each held where it really waits and then let go: the Videos card while
   `data/videos.json` is out, a column's widgets before they are started, and the business records'
   boxes while `listRecords` is out. The last two are the loader OVER markup already drawn (`aria-busy`,
   shell.js), which is the kind that holds the card's size; the Videos card's is IN PLACE of its results,
   under a search bar that is never veiled (note 321). Each time: exactly one loader, the contract on it,
   none of the old words beside it — and once released, the content where it stood and no loader
   anywhere in that card. */
```

### ---------- 1. THE VIDEOS CARD, WHILE ITS FILE IS OUT: THE BAR IS USABLE, AND A WORD WAITS UNDER IT

top level, before `rows`

```
/* ---------- 1. THE VIDEOS CARD, WHILE ITS FILE IS OUT: THE BAR IS USABLE, AND A WORD WAITS UNDER IT ---
     Note 321: the card is a search bar first, so it is NEVER veiled — it was, whole, under the loader,
     while it was a list; a bar nobody can type into for the first seconds is the one thing this card
     must not be. Somebody who types before the list lands sees the one loader WHERE THE RESULTS WILL
     BE, and then the results. */
```

### AND TURNED TO, as a finger turns to it.

top level, before `vn`

```
/* AND TURNED TO, as a finger turns to it. The card is thirteenth on Games and `woken_` gives the
     queue eight seconds; on a machine with a load average of thirty the queue had not reached it, and
     the journey read an unstarted card as a fault in the card. `goPage` starts the page it turns to
     (`widgetsNear_`), which is the app's own answer to "I want this one now". */
```

### AND THE CARD ITSELF WAITED FOR, the videos journey's rule above:

top level, before `n`

```
/* AND THE CARD ITSELF WAITED FOR, the videos journey's rule above: under four of these runs at once
     beside `check/ui.js` (9 Oct) the card was still drawn and not started 150ms after the turn. Bounded:
     a card that never starts still fails on what it shows. */
```

### ---------- 2. OVER THE MARKUP: A COLUMN'S WIDGETS BEFORE THEY ARE STARTED

top level, before `tools`

```
/* ---------- 2. OVER THE MARKUP: A COLUMN'S WIDGETS BEFORE THEY ARE STARTED ---------------------------
     The Tools column is drawn beside Games and not started — exactly the widgets the owner was
     looking at. Each one with a `start` is veiled; arriving starts them and takes every veil off.
     ON A PHONE, which is what this harness is unless a journey says otherwise: there the column beside
     is a 23px edge and nothing on it is started. On a wide window it is whole and its widgets on the
     glass ARE started (docs/history/331) — the journeys after this one ask that. */
```

### A WIDGET ON THE GLASS IS DRAWN, WHICHEVER COLUMN IT IS IN (docs/history/331)

top level, before `COLUMNS_`

```
/* ==================================================================================================
   A WIDGET ON THE GLASS IS DRAWN, WHICHEVER COLUMN IT IS IN (docs/history/331)

   THE OWNER, 10 Oct, with a screenshot at about 1194px — Settings in front, About you on it, and the
   column beside it two widget cards that were the gold dots and a star: *"these remain loading untill
   i scroll to them. i dont like this"*. Only the column in front ever started its widgets, and on a
   wide window the columns beside it are whole cards (THE GRID SHOWS MORE OF ITSELF, shell.js).

   THIS HARNESS IS A PHONE unless a journey makes it otherwise — `matchMedia` answers no to everything
   and there is no layout — so these make it a 1194x827 window the way a browser is one: `innerWidth`
   and `innerHeight` say so, `matchMedia('(min-width: 700px)')` answers from them, and a resize event
   is what a window dragged narrower sends. With no layout every page is 0px tall at the column's
   middle, so the glass is the column in front, every column beside it showing more than `WIDE_EDGE`
   of its card, and down each the pages out to `glassRows_` (three) either side — which is still a
   real question: page 4 of Tools and beyond is off it. `CSS.escape` is given to it as well, because
   `$`'s "the copy on the screen in front" is written with it and jsdom has none, so a starred widget's
   two copies could not otherwise be told apart.
   AND THE COLUMNS IN THE ORDER THE SHEET GIVES THEM (`data/settings/columns.json`), the order the
   owner's screenshot was in: Settings between You and Tools. The written fallback puts Settings at
   the far end, beside nothing that runs. */
```

### AND THE CALCULATOR'S PARTS FOUND IN TREE ORDER, as a browser finds them.

in `before`

```
/* AND THE CALCULATOR'S PARTS FOUND IN TREE ORDER, as a browser finds them. jsdom's `getElementById`
         hands back the copy of a duplicated id that was put in the document FIRST, not the one that
         comes first in it — so after a column is drawn again its copy of a starred widget stops being
         "the first one", and the journey below passed with the copy-finding half of `$` taken out
         (tried: it drew into the right copy by the luck of which column had been redrawn). Only the
         calculator's ids (`mc-…`, the widget it stars): a `querySelector` for every lookup made the whole
         app so slow under jsdom that an arrival's `afterSlide_` outlived the journey's wait. */
```

### AND WHAT A STEP IS ABOUT TO ASK, WAITED FOR — bounded, so a state that never comes still fails on what was asked.

top level, before `until_`

```
/* AND WHAT A STEP IS ABOUT TO ASK, WAITED FOR — bounded, so a state that never comes still fails on what
   was asked. At a load average of thirty-seven an arrival's `afterSlide_` outlived `woken_`'s eight
   seconds once (measured here, 10 Oct): a late start, not a missing one. */
```

### TO THE COPY IT RUNS ON: arriving there starts nothing again — unless the column was `STALE` and drawn again on the way in

top level, before `NAME_`

```
/* TO THE COPY IT RUNS ON: arriving there starts nothing again — unless the column was `STALE` and drawn
     again on the way in (a signed-in visitor's second reply repaints, and marks every other column so), in
     which case what it ran in has gone and it is started once more, once. Before 392 this was "TO TOOLS",
     from Games with Tools left of it; with Progress in front the app may run Saved's copy instead. */
```

### THE PAYLOAD'S LANDING EMPTIES EVERY COLUMN AND DRAWS IT AGAIN (`load`), so a widget that started beside the column in front before it landed — drawing the one

top level, before `release`

```
/* THE PAYLOAD'S LANDING EMPTIES EVERY COLUMN AND DRAWS IT AGAIN (`load`), so a widget that started beside
   the column in front before it landed — drawing the one loader over the part of it that waits for the
   payload — is running in markup that has just been thrown away. What was on the glass has to start
   again in the new markup, or the new copy sits under the "not started" veil and the old one, drawn,
   is gone: the owner's picture again, one payload later. */
```

### AND NEVER BARE ON THE WAY.

top level, before `bare`

```
/* AND NEVER BARE ON THE WAY. A new slot with its veil off and nothing running in it is markup nobody
     started — and that is what the new flyer maker was, from the landing until the slide settled, while
     the old one, running in markup the landing had thrown away, still counted as "running" and its copy
     on the glass was unveiled for it (review of 331). Asked after every change to the column. */
```

### AND DRAWN, NOT ONLY UNVEILED:

top level, before `w`

```
/* AND DRAWN, NOT ONLY UNVEILED: a copy of a widget running elsewhere has its veil taken off too (one
     widget, one start), so a missing veil alone would pass a flyer still running in the markup that was
     thrown away. Its controls are drawn by its `start` and by nothing else. */
```

### ---------- A REPAINT AND THEN AN ARRIVAL KEEP THE WIDGET RUNNING BESIDE YOU

top level, before `w`

```
/* ---------- A REPAINT AND THEN AN ARRIVAL KEEP THE WIDGET RUNNING BESIDE YOU ---------------------------
   FOUND BY THE REVIEW OF 331, on the owner's own path. Every signed-in load lands twice (the payload, then
   the inbox), and the second `repaint` marks every column but the one in front `STALE`; a column is drawn
   again when it is next arrived at. So at 1194 with Settings in front, the calculator on Tools beside it
   ran in markup that was due to be thrown away — and the first arrival at Tools threw it away: a new slot
   under the loader for 240–690ms, then the calculator started again from nothing, a sum typed into it
   gone. `paint` now hands the running slot back into the new markup (`widgetsHeld_`, arcade.js). The
   column itself IS drawn again — its star is a new element — and the widget is the one that was running. */
```

### ---------- AND NOT FOR THE PERSON WHO HAS GONE

top level, before `admin`

```
/* ---------- AND NOT FOR THE PERSON WHO HAS GONE -------------------------------------------------------
   A widget beside the column in front runs in markup a repaint leaves `STALE`, so a sign-out on Settings
   at 1194 left Tools beside it running as it was: the admin's flyer maker, which a signed-out Tools does
   not draw, and the calculator started for the admin. The column in front is started again by the
   repaint a change of person makes; a widget beside it started for somebody else is now stopped, and
   started again if its column still draws it for whoever is here (`widgetsGlass_`). And a paint never
   carries a slot started for somebody else into the new markup (`widgetsHeld_`): what is in it is theirs. */
```

### A COLUMN LEFT BEFORE ITS PLACEMENT HAS HAPPENED STARTS NOTHING MORE BEHIND IT.

top level, before `w`

```
/* A COLUMN LEFT BEFORE ITS PLACEMENT HAS HAPPENED STARTS NOTHING MORE BEHIND IT. `go` moves `AT` at once and
   the grid a frame later, and it is that placement which says what is on the glass and forgets what was
   queued for a column that has left it (`widgetsGlass_`). Until 10 Oct `go` stopped everything itself,
   synchronously; from the placement instead, a step of the queue landing in between would start a far
   widget of the column just left, in the frame its slide begins. So the queue waits for the placement
   (`GLASS.at`). Here the frame is held — `requestAnimationFrame` answers nothing — so the gap is as long
   as the journey wants, and a phone, where the column left is off the glass the moment it is left. */
```

### ---------- THE FILMS IN THE VIDEOS CARD: AN ADMIN FINDS THEM, A STUDENT NEVER SEES THEY EXIST

top level, before `FILMS_`

```
/* ---------- THE FILMS IN THE VIDEOS CARD: AN ADMIN FINDS THEM, A STUDENT NEVER SEES THEY EXIST ------------
   *"Ensure the video searcher is hooked up. Let admin be able to search up films which are in the
   notflix folder on gdrive."* The journey above never set `DATA.films`, so nothing here had ever asked
   the card about a film — the admin's half, the student's half, a placeholder, or the Sync tile. Each
   draws a perfectly good card when it is wrong: a list with no films in it looks like a folder with no
   films in it, and a Sync tile on a child's screen looks like any other tile.

   THE FILMS ARE INVENTED and in the shape `filmsFor_` sends: a film, two kids films, a series, a
   documentary, one asked for by name that is not in the Drive yet, and one with the owner's note. */
```

### ---------- A FILM PLAYS IN THE CARD NOW, IN DRIVE'S OWN PLAYER — AFTER A TAP AND NOT BEFORE

top level, before `row`

```
/* ---------- A FILM PLAYS IN THE CARD NOW, IN DRIVE'S OWN PLAYER — AFTER A TAP AND NOT BEFORE ----------
     It was a door to Drive (note 068: a 3 GB .mkv plays in no browser); the owner asked for every result
     to play here (10 Oct, note 321), so a films-list row whose address is a Drive FILE is a play button,
     and nothing is asked of Drive's player until it is pressed. */
```

### AND FIND STILL HAS NONE.

top level, before `n`

```
/* AND FIND STILL HAS NONE. This asked for the four, to prove `filmsAdopt_` dropped Find's memo; the
     films left Find on 10 Oct (*"films should not appear in the finder it cannot be found there"*), so a
     sync that put one there would be them coming back by the side door. */
```

### A REPLY FOR SOMEBODY WHO HAS GONE IS DROPPED — through the real Sign out, which takes the films with it:

top level, before `left`

```
/* A REPLY FOR SOMEBODY WHO HAS GONE IS DROPPED — through the real Sign out, which takes the films with
     it: so NONE are left. One would be the late reply adopted for nobody; seven, the admin's list left on
     the device. This asked `t.USER(null)` and wanted all seven still there — it asserted the leak. */
```

### ---------- SIGNING OUT TAKES THE FILMS WITH IT

top level, before `stamp`

```
/* ---------- SIGNING OUT TAKES THE FILMS WITH IT ------------------------------------------------------------
   `DATA.films` is the admin's whole list, Drive links included, and nothing that draws it asks whose it is
   — the payload was the only gate, and signing out does not reload the payload. So an admin who signed out
   on the family's iPad left every film in Games → Videos and in Find for whoever picked it up next, and a
   child signing in after them saw the list until their own payload landed (review of 9 Oct, through the
   real `signout`). Both doors: the Sign out tile, and `signedIn_` for somebody else while their payload is
   still on its way — the one way in that every sign-in door goes through.
   FIND'S HALF WENT WITH THE FILMS (10 Oct): this asked that Find held all seven before Sign out and none
   after. Find holds none at any point now, which is the journey below this one's business — so here the
   card and `DATA` are what is asked, and Find is asked only that it never had one. */
```

### A SYNC IN FLIGHT WHEN AN ADMIN SIGNS OUT IS LET GO:

top level, before `hold`

```
/* ---- A SYNC IN FLIGHT WHEN AN ADMIN SIGNS OUT IS LET GO: the next admin's tile is theirs ----
     Held, it left the next admin's Sync tile busy, and pressing it did nothing, until the first admin's
     reply came back to be dropped; and that reply ending must not mark the next admin's sync finished. */
```

### ---------- ONCE A DAY, ON ITS OWN

top level, before `bad`

```
/* ---------- ONCE A DAY, ON ITS OWN -------------------------------------------------------------------------
   How the card keeps the films current: the last whole pass more than a day old asks for one. The journeys
   above asked a card never synced and a pass left part-way, never a stamp that is simply old — and
   `filmsSyncDue_` with its age test deleted passed every one (review of 9 Oct). A list that looks complete
   and is stale is the failure this whole sync exists to end. */
```

### ---------- A SPACE TYPED INTO A SEARCH BOX IS A SPACE, AFTER THE GAMES COLUMN HAS BEEN OPENED

top level, before `w`

```
/* ---------- A SPACE TYPED INTO A SEARCH BOX IS A SPACE, AFTER THE GAMES COLUMN HAS BEEN OPENED ------------
   Flappy Bird flaps on Space, and its key handler sat on `document`, stayed on once the Games column was
   drawn, and asked nothing but whether its canvas existed — so after one visit to Games a laptop typing
   "two words" into the videos box got "twowords" and found nothing (and Find's box the same). Measured in
   Chromium by the audit of 9 Oct. jsdom has no canvas and no layout, so the canvas is given a size and a
   context that draws nothing — enough for the game to set itself up, which is the part being asked. */
```

### ---------- CONNECT 4: ONE COUNTER FALLS, INTO THE RIGHT SQUARE, AND THE FOUR THAT WON ARE RINGED

top level, before `w`

```
/* ---------- CONNECT 4: ONE COUNTER FALLS, INTO THE RIGHT SQUARE, AND THE FOUR THAT WON ARE RINGED ---
   ASKED FOR AS "refine connect 4 add dropping animation of counters." The fall itself is CSS and
   only a browser can play it — what can go wrong here is WHICH square falls: none (the mark is
   lost), more than one (every counter on the board jumps on every tap), the wrong one (a counter
   drops into a square gravity would not put it in), or the same one again on a refused tap. Each of
   those draws a perfectly good board, so this asks the marks. And a win that rings three, or five
   of a line of four, is a ring that points at the wrong thing. There was no Connect 4 journey
   before this one. */
```

### TURNING TO THE PAGE STARTS THE WIDGET, IT DOES NOT FINISH IT — `woken_()` above says why.

top level, before `k`

```
/* TURNING TO THE PAGE STARTS THE WIDGET, IT DOES NOT FINISH IT — `woken_()` above says why. This
     counted the squares on the same tick as the turn, and under a loaded full suite (8 Oct) the
     board was still in the queue: "did not draw 42 squares". So: the column quiet, then up to three
     seconds for the board itself, and a board that never draws still fails. */
```

### ---------- THE MAZE: ITS WALLS ARE ITS OWN, ITS WALK SURVIVES A REPAINT, ITS KEYS ARE ITS OWN

top level, before `w`

```
/* ---------- THE MAZE: ITS WALLS ARE ITS OWN, ITS WALK SURVIVES A REPAINT, ITS KEYS ARE ITS OWN -----
   REPORTED AS "maz game is glitched." Three faults, and every one of them drew without a complaint
   from anything here — there was no maze journey at all.
     · THE WALLS. The south wall was the class `ws`, and the word search's grid is the bare `.ws`, so
       71 of 121 cells were laid out as small grids of their own. Asked here of the stylesheet itself:
       no rule whose subject names one of a maze cell's classes may be anybody's but the maze's. That
       is the fault as a rule rather than as the one class it happened to — a `.you` or an `.out`
       added for some other card tomorrow is the same collision. (`check/ui.js` asks the other half,
       in a real browser: that every square of a board is one size.)
     · THE WALK. A repaint dealt a new maze under a finger halfway to the exit.
     · THE KEYS. On the maze's page ArrowDown walked the maze AND turned the column; on Find, two
       arrows walked a maze nobody could see.
   The walk is played through the pad's own handler, along the shortest route read back off the
   drawn walls — so a wall drawn on the wrong side, or on one side of a doorway only, is a route
   this cannot finish. */
```

### 1. NO RULE BUT THE MAZE'S REACHES A MAZE SQUARE.

top level, before `css`

```
/* 1. NO RULE BUT THE MAZE'S REACHES A MAZE SQUARE. Every selector in the stylesheet whose subject
     — its last compound, the element it styles — names a class some maze square carries, and that
     matches one, must be the maze's own (`.mz…`). jsdom matches selectors exactly as a browser does
     for everything here; one it cannot parse is skipped rather than guessed at. */
```

### ---------- THE FOUR CLASSROOM GAMES: A ROUND SURVIVES A REPAINT, AND WAITS WHILE YOU ARE AWAY

top level, before `LEAVE_MS`

```
/* ---------- THE FOUR CLASSROOM GAMES: A ROUND SURVIVES A REPAINT, AND WAITS WHILE YOU ARE AWAY -----
   JUST A MINUTE, TABOO, HOT SEAT AND 20 QUESTIONS were asked to keep their round through a
   repaint — which is a stop and a start a moment apart — and to stop their clock when the column is
   left. Those pull against each other, because both arrive as the same `stop`, and every way of
   getting it wrong draws perfectly: a repaint that pauses the round under somebody's finger, a
   leave that lets the minute run out on another screen, a secret left up for whoever picks the
   phone up next. So these play each game through the app's own handlers and ask the state and the
   card both. */
```

### AND ARRIVING NO LONGER STARTS THEM ALL IN THAT ONE TASK (5 Oct, `widgetsWake_` in arcade.js):

top level, before `LAST_W`

```
/* AND ARRIVING NO LONGER STARTS THEM ALL IN THAT ONE TASK (5 Oct, `widgetsWake_` in arcade.js): the
   ones in view start at once and the rest one per task behind them, nearest first. Under jsdom a
   start is ~80ms, so the videos card thirteen pages down the Games column was still waiting its turn
   at 700ms — measured, and it is not a fault: nobody can see page thirteen without turning to it,
   and turning to it starts it (`widgetsNear_`). So a journey that has just ARRIVED waits for the
   column to finish waking as well — `quiet()`: the after-slide jobs and the widget queue both run
   dry, in the window booted last (the journeys run one at a time). Bounded, so a queue that never
   drains is a journey that fails on what it asked rather than a run that hangs; after a LEAVE it
   is already dry and this returns at once.
   THE CAMERA'S `CAM_SLIDE` WAITS SAY THE SAME THING — "past `afterSlide_`'s 300ms and any settle" —
   and failed on the unchanged base commit as well under a load average of 30–40 (measured 5 Oct):
   a fixed sleep is a guess at when a job ran, and `quiet()` is the job having run. */
```

### `k` IS WHICH WORD GAME THE WIDGET OPENS ON.

top level, before `partyBoot_`

```
/* `k` IS WHICH WORD GAME THE WIDGET OPENS ON. All four live inside the one Word games widget, which
   draws only the game chosen; the choice is the device's, so it is set there before the column is
   reached. Alibi was the one that passed nothing, because it kept a card of its own; it is deleted. */
```

### AND THE GAME'S OWN CARD IS WAITED FOR, NOT GUESSED AT.

top level, before `partyBoot_`

```
/* AND THE GAME'S OWN CARD IS WAITED FOR, NOT GUESSED AT. Six journeys booted with a fixed 300ms and
   a fixed `LEAVE_MS`, and under a load average of 20-40 they failed together -- "did not draw on the
   Games column", "PARTY is not reachable" -- every one green alone. Asked for every 100ms, up to 8s:
   the test harness (`__t`), then the card and the PARTY state the journey is about. A card that never
   comes still fails, on the journey's own first question. */
```

### AND THE SAVED COLUMN IS NOT "HERE" FOR A GAME NOBODY STARRED.

top level, before `t`

```
/* AND THE SAVED COLUMN IS NOT "HERE" FOR A GAME NOBODY STARRED. The first version counted the whole
   column as the Games column's twin, so a minute started on Games and swiped over to Saved went on
   running on a card that was on no screen — and Saved is the column next door. */
```

### ---------- THE WORD GAMES ARE ONE WIDGET, AND SWITCHING GAME IS A LEAVE

top level, before `t`

```
/* ---------- THE WORD GAMES ARE ONE WIDGET, AND SWITCHING GAME IS A LEAVE ---------------------------
   Asked for as "Merge word games into one widget. Like articulate and charades", and then Herd
   Mentality moved in as the eighth: "heard mentality is a word game so should go there." Three things can
   go wrong and all of them draw perfectly: the dropdown offering a game the slot cannot draw, a
   game switched away from going on running where nobody can see it, and the old game's card left
   in the slot beside the new one. */
```

### AND IT DEALS IN THE SLOT, IN ITS OWN LARGE TYPE.

top level, before `sel.value`

```
/* AND IT DEALS IN THE SLOT, IN ITS OWN LARGE TYPE. The question is read across a table, and
     `.herd-card .herd-q` is the rule that makes it large — a wrapper without that class still draws,
     at body-text size, which no assertion about ids would notice. */
```

### ---------- ALIBI IS DELETED, AND NOTHING OF IT IS LEFT TO PRESS

top level, before `w`

```
/* ---------- ALIBI IS DELETED, AND NOTHING OF IT IS LEFT TO PRESS -------------------------------------
   Asked for as "delete alibi game." Its journey was here — a case, two suspects on two clocks, a
   verdict — and went with it. What replaces it asks the one thing a deletion can get wrong without
   anything drawing badly: a card left in the roster, or a handler left answering a button nothing
   draws any more, which is a door to nowhere that `check-doors` would only find from the other end. */
```

### ---------- THE TIMETABLE KEEPS A WEEK, PER PERSON, ONE COLOUR A SUBJECT

top level, before `w`

```
/* ---------- THE TIMETABLE KEEPS A WEEK, PER PERSON, ONE COLOUR A SUBJECT ----------------------------
   KEPT ON THE DEVICE, so nothing on the wire says whether it worked: a lesson that is not saved, a
   timetable shared between two students on one phone, or two subjects in one colour all draw
   perfectly. So this writes a Monday through the app's own handlers and its own `input` listener —
   the way a thumb does — and asks what comes back after a repaint, after somebody else signs in, and
   after a lesson goes.

   THREE SUBJECTS ON PURPOSE, and these three: the first version hashed a subject's letters into
   eight hues, and Chemistry and History came out the same red on the first screenshot. A rule that
   could not fail on the fault it was written for is no rule, so the fault's own pair is the case. */
```

### A REPAINT REBUILDS THE MARKUP, and a timetable held only in it would be gone.

top level, before `data-id`

```
/* A REPAINT REBUILDS THE MARKUP, and a timetable held only in it would be gone. THROUGH `repaint`
     AND NOTHING ELSE — the first version called `initTimetable()` straight after it, which redraws
     the widget whether or not the app's own repaint ever restarts it, so a roster entry that lost its
     `start` passed. `repaint` reaches it through `startScreen_` → `toolsStart_`, synchronously. */
```

### ---------- TOUCH TYPING: KEYS MOVE THE LINE, A WRONG ONE COUNTS, THE LADDER IS KEPT PER PERSON

top level, before `w`

```
/* ---------- TOUCH TYPING: KEYS MOVE THE LINE, A WRONG ONE COUNTS, THE LADDER IS KEPT PER PERSON ------
   KEPT ON THE DEVICE AND TYPED, NOT TAPPED, so nothing on the wire and no `data-do` says whether it
   works. So this types the way a keyboard does — `keydown` on the focused hidden box — and the way a
   phone does — the character arriving in the box on `input` — and asks what the card draws.

   THE WINDOW LISTENER IS THE LEAK TEST. Flabby Pird's space bar and the pager's arrows listen on the
   document and the window; a printable key typed here that reached one of them is the bug the
   capture-phase stop exists for, so a listener of the journey's own on the window must hear nothing.

   AND EVERY LESSON'S LINES ARE READ FOR KEYS IT HAS NOT TAUGHT. One word list filtered per lesson is
   the design; a `t` in a home-row line is that filter gone, and only fifty lines of each would show
   it, because a line is drawn at random. */
```

### WAITED FOR, NOT SLEPT FOR.

top level, before `i`

```
/* WAITED FOR, NOT SLEPT FOR. A fixed 100ms was enough on a quiet machine and failed this journey
     in roughly one run in three whenever other work shared the four CPUs — the card draws after the
     page turn's own frames, and those stretch under load. Polled up to two seconds, so a card that
     never draws still fails, and one that draws late no longer reads as a broken widget. */
```

### THROUGH `ktLesson_`, NOT `KT_LESSONS`:

top level, before `lessons`

```
/* THROUGH `ktLesson_`, NOT `KT_LESSONS`: the app is evaluated as one block here, so its `const`s
     stay inside it and a journey reading one by name gets nothing — and an empty list here would be a
     check of nothing that passed. So an empty ladder is a failure of its own. */
```

### ---------- THE FLYER MAKER IS AN ADMIN'S, AT EVERY DOOR

top level, before `w`

```
/* ---------- THE FLYER MAKER IS AN ADMIN'S, AT EVERY DOOR ---------------------------------------------
   ASKED FOR AS *"make a flyer should only be visible to admin"*. `admin: true` on the roster entry is
   the rule and `widgetFor_` is the one place it is asked — this asks it as every other kind of
   visitor and as an admin, and then asks the two lists that draw widgets, because a rule on one door
   and not the next is the shape of every leak this repository records. The Saved column is the door
   that is easy to forget: a star is kept on the device, so a flyer starred by an admin would come
   back on the Saved column of whoever signs in on that phone next. */
```

### ---------- VENUES ARE OFF FIND, AND A STARRED VENUE IS STILL ON SAVED

top level, before `w`

```
/* ---------- VENUES ARE OFF FIND, AND A STARRED VENUE IS STILL ON SAVED -----------------------------
   ASKED FOR AS *"Get rid of booking places ... So finder now will become just learning stuff."* The
   venue kind was `Booking, Places`, a second group whose only job was to get past `FUNNEL_NOT_FOR`,
   and Find's first question read `Booking, Places | Learning | Links | Shop` — one chip with a
   comma in it. No check saw it, because `check/fixture.json` sent a `kinds` tab production does not
   have. THIS PAYLOAD SENDS NONE, which is what production sends, so the code's own groups decide.

   THREE QUESTIONS, ONE PER WAY IT CAN GO WRONG: a venue in the list Find draws; a door whose name is
   two groups joined by a comma (the code's own cell is not split by `asList_`, so a comma there is a
   chip, never two); and a venue somebody starred going missing from Saved, which reads every item
   the app holds rather than the funnel's list. */
```

### THE SCREENS THAT EXIST, read off `TABS` rather than written out.

top level, before `el`

```
/* THE SCREENS THAT EXIST, read off `TABS` rather than written out. This has now been wrong twice
     — once naming `find` after the funnel absorbed it, once naming `book` after the booking form
     moved onto the funnel — and both times it reported the app drawing nothing on a tab the app
     does not have. A test being wrong about the app is the worst kind of red there is, and a list
     of tabs kept by hand beside the real list of tabs is how you get one.

     Asked of the app, so it cannot go stale again. */
```

### THE ONE LOADER IS SOMETHING DRAWN ON MESSAGES ALONE, and only while its ask is out:

top level, before `dm`

```
/* THE ONE LOADER IS SOMETHING DRAWN ON MESSAGES ALONE, and only while its ask is out: a parent signed in
       after the payload landed has no inbox yet, and the column is the loader and no words until it answers.
       Every other column drew words before docs/history/341 and must still — the review of 12 Oct found this
       had been loosened for every tab, so a column stuck on the loader for good passed here. */
```

### ---------- THE CARD USED TO DELETE ITS OWN UNANSWERED QUESTIONS

top level, before `w`

```
/* ---------- THE CARD USED TO DELETE ITS OWN UNANSWERED QUESTIONS ---------------------------------
     `bookBreakdown` chose between two lists: the form's thirteen questions when nothing could be
     priced, and `PRICE_ROWS` — which only has lines for things that COST — the moment anything
     could. So answering a level made Kind, When, Term, Split, Child, For and Tutor disappear off
     the card while still being asked. Nothing threw; the rows were simply not drawn.

     THE CHECK IS THE INVARIANT, not the bug: whatever the form is asking, the paper has a row for
     it. Priced or not, before or after, a question with nowhere to answer it is broken. */
```

### ---------- A WEEK STEP IS SEVEN ROWS AND ITS `short` NAMES NONE OF THEM

top level, before `days`

```
/* ---------- A WEEK STEP IS SEVEN ROWS AND ITS `short` NAMES NONE OF THEM ------------------------
     `When?` HAS NO ROW CALLED `When` ANY MORE. The day names are the questions — Monday to Sunday,
     each with its hours in the answer column — and `short` is only the anchor `SPINE_EXTRA` pins
     `Per session` to. So the invariant is the same and what satisfies it is seven rows rather than
     one: read off `SLOT_DAYS` through the harness, because a list of day names written out here
     would be a second copy to keep in step. */
```

### ---------- ROWS USED TO COME AND GO

top level, before `w`

```
/* ---------- ROWS USED TO COME AND GO ---------------------------------------------------------
     `stepRows_` SKIPPED ANY STEP WITH NO OPTIONS, so choosing "waiting list class" deleted Subject,
     Level, When and Term off the card, and choosing a class to join deleted four more. The paper
     reshaped itself under every answer: the card changed height, every row below moved, and where
     a field was depended on what you had already said.

     THE INVARIANT IS THE SHAPE. Whatever is answered, the same questions have the same rows in the
     same order. What changes is whether a row can be answered, which is a state of its control.

     This is the check that would have caught the disappearing rows AND would catch them coming
     back — an empty `options()` is a reason to grey a row, never to drop it. */
```

### THE QUESTIONS ONLY, which is what has to hold still.

top level, before `asked`

```
/* THE QUESTIONS ONLY, which is what has to hold still. A derived line — "Extra subjects", the
     booked days, an estimate — appears when there is something to say and belongs at the foot, below
     everything that can be answered. Those are additive and do not move a question. */
```

### ---------- AND ONE QUESTION MAY BELONG TO ONE BRANCH, IF IT SAYS SO

top level, before `BRANCHED`

```
/* ---------- AND ONE QUESTION MAY BELONG TO ONE BRANCH, IF IT SAYS SO ------------------------
     THE INVARIANT ABOVE IS ABOUT ANSWERING, and that half is untouched: `blank` against `priced` is
     the fault this was written for — answering a level made seven rows vanish — and it is still
     compared whole.

     ACROSS THE BRANCH IT IS NARROWED TO WHAT THE CODE DECLARES. `only:` on a step says the question
     belongs to one of the two documents and the other never becomes it, which is the same sentence
     `SPINE_EXTRA` has carried since four derived rows were given the flag. Read off `BOOK_STEPS`
     rather than listed here, so the check cannot drift from the thing it is checking — and the old
     fault still fires with four names, because Subject, Level, When and Term declare nothing.

     A FLAG THAT DOES NOTHING IS WORSE THAN NO FLAG, so it is checked in both directions rather than
     merely tolerated: a branch-only question must be ON its own document and OFF the other. Without
     that, writing `only:` and forgetting to read it anywhere would quietly widen this exemption.

     ---------- AND THE TWO SHAPE COMPARISONS CANNOT FIRE ANY MORE, WHICH IS WORTH SAYING ----------
     MEASURED RATHER THAN ASSUMED, on four mutants. `stepRows_` pushes a row for EVERY step whether
     or not it is answered, and `spineRows_` then invents a dash for any spine row neither builder
     produced — so a question dropped from `stepRows_` comes straight back under the same name, and
     `fill: false` changes nothing here because no question row was ever missing to be filled. Both
     halves of the original fault are now structurally impossible: dropping Subject and Level on the
     waiting branch leaves the shape identical, and so does turning the form's `fill` off.

     `ONLY_ON` IS THE ONLY ROUTE LEFT by which a question row can vanish, which is why the live
     assertions are the two `only:` ones — the flag-does-nothing mutant is the one that fires.

     THEY ARE KEPT, for the reason `check-funnel.js` test 2 is kept after the spelling fold made it
     unfirable: this is where the invariant is written down, `!blank` still fails if the paper stops
     drawing questions at all, and both comparisons come back to life the day anything upstream
     stops guaranteeing them. What is not kept is the pretence — a rule that cannot fail under a
     confident comment about what it protects is a green light with nothing behind it. */
```

### ---------- A WEEK STEP'S ROWS ARE SHARED BY BOTH BRANCHES ON PURPOSE

top level, before `BRANCHED`

```
/* ---------- A WEEK STEP'S ROWS ARE SHARED BY BOTH BRANCHES ON PURPOSE ---------------------------
     `avail` IS `only: 'wait'` AND IS A WEEK, so the rows it draws are Monday to Sunday — the same
     seven `slots` draws on the other branch. `SPINE` holds them once and whichever branch is live
     fills them, which is the whole reason the two weeks are never both on a card.

     SO THE FLAG CANNOT BE TESTED BY ROW NAME HERE, and pretending otherwise would be a rule that
     fires on the design. What the flag still governs for a week step is whether the step DRAWS —
     `stepWeekRows_` returns `[]` on the wrong branch — and that is what the shape comparison above
     covers: seven day rows exist on both branches and only one step ever produced them. Every
     non-week `only:` step is tested exactly as before. */
```

### `only:` IS A LIST OF WORDS NOW (docs/history/353):

top level, before `SAYS`

```
/* `only:` IS A LIST OF WORDS NOW (docs/history/353): the branch, and on an instant class the format too —
     `bookOn_` reads `book, tutoring` with no format chosen, which is this journey's form. A step is owed to a
     branch when any of its words is one the branch says, and to no other. */
```

### ---------- THE FIGURES WERE STRANDED FROM THEIR ANSWERS

top level, before `w`

```
/* ---------- THE FIGURES WERE STRANDED FROM THEIR ANSWERS ---------------------------------------
     `bookBreakdown` merges each priced line onto the form row for the step it came from, and it
     finds that row by the line's `step` field. `breakdownRows` was blanking that field on any row
     that carried a control — which, once every question became a dropdown, was all of them.

     So nothing merged. Every price printed as a row of its own below the form, and the multiplier
     for "Level" sat four lines away from the level somebody had chosen. Nothing threw and the rows
     were all present, which is why it read as the figures having quietly gone.

     THE CHECK IS THAT A SURCHARGE IS ON ITS OWN ROW — the venue's running total on the Venue line,
     not on a second line named after the price table. */
```

### ---------- AND THE BASE LINE IS STILL THERE, WHEREVER IT NOW LIVES

top level, before `tutor`

```
/* ---------- AND THE BASE LINE IS STILL THERE, WHEREVER IT NOW LIVES ---------------------------
     THE GUARD IS REAL AND THE ADDRESS WAS STALE. An earlier attempt at this merge dropped the base
     charge off the card entirely — excluded from the merge, then dropped by a filter that saw it
     named a step and assumed it had already merged — so something has to insist it still exists.
     That part stands.

     BUT IT IS NO LONGER A ROW CALLED "Tuition". book.js:1999 folded it onto the Tutor row on
     purpose: `Tutor · Halex Dias` and `Tuition · Halex Dias · × 10 · £10.00/h` are one fact printed
     twice, once as something you can change and once as something you cannot. The note ends "the
     second row stops existing rather than being blanked and left", and it does not exist. So this
     was looking for a row the design had deliberately removed, and calling its absence a fault.

     ASKED OF THE MONEY INSTEAD OF THE LABEL. The base charge is the one price with no question
     behind it, and after the merge it is the Tutor row's running total. If that total is empty the
     charge really has gone — which is the thing this journey exists to catch — and it does not
     matter what the row is called when it happens. */
```

### ---------- HALF THE JOINABLE THINGS WERE INVISIBLE

top level, before `w`

```
/* ---------- HALF THE JOINABLE THINGS WERE INVISIBLE ---------------------------------------------
     The `joining` row only had options when the kind was a waiting list, so a class already running
     with two seats left could not be reached from the form at all — you had to find its card and
     press a button that sent immediately. `kind` and `canAsk` were on the payload the whole time.

     THE TWO ARE JOINED BY DIFFERENT VERBS and that is the reason to keep them apart rather than a
     reason to offer one: a list is a thing that exists to be joined, a running class belongs to the
     family who booked it. So the row offers whichever kind was asked for, and `book-send` picks the
     verb to match. */
```

### ---------- AN UNLISTED TUTOR IS THE SERVER'S DECISION, AND THE FORM HAD ITS OWN COPY

top level, before `w`

```
/* ---------- AN UNLISTED TUTOR IS THE SERVER'S DECISION, AND THE FORM HAD ITS OWN COPY ------------
   `doGet`'s GATE IS `(listed || viewerIsAdmin)`, so a client is never SENT an unlisted tutor and the
   `t.listed !== false` this dropdown carried could only ever hide them from the one person the
   server had deliberately shown them to. Reported three times as *"i still dont see george"* about
   a tutor who was on the account column the whole time and missing from this list.

   TWO ASSERTIONS, BECAUSE THE FAULT HAS TWO HALVES. The option must be OFFERED, and its VALUE must
   still be the plain title — `priceFrom` matches `norm(t.title) === norm(tutor)`, so a decorated
   value would price the booking at the open rate with nothing on screen saying so. `label_` is what
   keeps the two apart and this is what proves it did not leak into one.

   THE PAYLOAD IS THE ADMIN'S, which is the only payload that can carry such a row. A client's copy
   has no unlisted tutor in it at all, so there is nothing here for a client-side filter to do. */
```

### ---------- THE WAITING BRANCH USED TO BE ASKED ALMOST NOTHING, AND THREE OF THOSE WERE WRONG

top level, before `w`

```
/* ---------- THE WAITING BRANCH USED TO BE ASKED ALMOST NOTHING, AND THREE OF THOSE WERE WRONG ---
     REPORTED AS *"it doesnt let choosing a subject even though im trying to start a NEW waitlist",
     "it also doesnt let me select number of extra seats for waitlist session", "it also doesnt let
     me select which terms."* All three steps returned `[]` when `isWaiting_()`, and an empty option
     list is how `stepLocked_` GREYS a row — so the questions were not merely unasked, they were
     drawn, greyed, holding whatever the instant branch had left in them.

     THIS CHECK ASSERTED THAT AS THE DESIGN. It is the same journey pointed the other way now: four
     steps genuinely cannot be answered on a list, and everything else must be.

     THE FOUR, AND EACH FOR ITS OWN REASON. `tutor` — who teaches a list is settled when it fills.
     `slots` — an hour grid needs a day, and there is no day until it fills; `avail` asks the same
     question in blocks instead. `split` — the other seats are for whoever joins, so there is nobody
     to invite. `kids` — seeded here with no children on the account, so it is off both lists and is
     not what this journey is about. */
```

### ---------- AND THE ONE LOCKED ROW SAYS WHAT IT WILL BE SUBMITTED AS

top level, before `B.how`

```
/* ---------- AND THE ONE LOCKED ROW SAYS WHAT IT WILL BE SUBMITTED AS ---------------------------
     REPORTED AS *"it just defualts to sasha motola and wont let change. it should defualt to no
     preference and not be able to change."* Two halves: the row must stay locked, and what it shows
     must be `No preference` rather than whatever the instant branch left behind.

     SEEDED THROUGH THE HANDLER RATHER THAN BY WRITING `BOOKING.tutor`, because clearing it is the
     handler's job and asserting the fallback with the cell already empty would prove nothing. */
```

### THROUGH THE REAL `change` LISTENER, because `book-set` is not an `on()` action — a select is answered by choosing, which fires `change` and never a click, so

top level, before `B.how`

```
/* THROUGH THE REAL `change` LISTENER, because `book-set` is not an `on()` action — a select is
     answered by choosing, which fires `change` and never a click, so it is bound on the document
     rather than in `ACTIONS`. A harness that wrote `BOOKING.tutor = ''` itself would be asserting
     its own line. */
```

### ---------- FIVE SHAPES OF ONE CONTROL, FOUR OF THEM REPORTED

top level, before `w`

```
/* ---------- FIVE SHAPES OF ONE CONTROL, FOUR OF THEM REPORTED ----------------------------------
     A `<select>` closed when you chose — that is what choosing means to it — so a question taking
     three answers was three opens, three scrolls and three closes: *"thats long."* A sheet was next
     (*"no pop up menus"*), then a page that REPLACED the form (*"i hate this"*), then a panel hanging
     off the field over the column, `#drop` — and on 9 October *"i want a more stable standard simple
     conventional drop down list"* (note 315). So it is checkboxes, under the row, in the card.

     SO THERE ARE FOUR THINGS TO ASSERT AND THEY PULL AGAINST EACH OTHER. The list must stay open
     across ticks; nothing may open over the app — no sheet and no panel outside the card; the form
     must still be on its page; and the list must be IN the card, under the row it answers. A check
     asking only the first passed on every rejected shape, which is how one version of this journey
     went green over the thing that was about to be reported.

     THROUGH THE APP'S OWN HANDLERS AND A REAL `change`, so the toggle, the re-render and the
     dispatcher that hands a checkbox to `book-many-pick` are the ones that ship — a harness rewriting
     `BOOKING.interval` itself would prove nothing about them. */
```

### `repaint()` BEFORE `go`, because `paintNeighbours` skips a screen that already has markup and the booking column was drawn at boot while nobody was signed in

top level, before `step`

```
/* `repaint()` BEFORE `go`, because `paintNeighbours` skips a screen that already has markup and
     the booking column was drawn at boot while nobody was signed in — so without this the column
     is still the "Sign in to book" card and the row the list opens under is not in the document.
     That is `STALE`'s whole job and the app does the same thing when somebody signs in. */
```

### ---------- AND THE ROW ITSELF, WHICH THE REST OF THIS CANNOT SAY

top level, before `row`

```
/* ---------- AND THE ROW ITSELF, WHICH THE REST OF THIS CANNOT SAY ---------------------------------
     THE FIRST VERSION CALLED THE HANDLERS AND NOTHING ELSE, so putting the row back to a `<select>`
     left every assertion green: the list still opened, because the journey opened it. THREE THINGS OF
     THE CONTROL: it carries the action, it reads back what has been ticked — the button is the only
     label on the row — and it says whether its list is open and which element that list is. */
```

### ---------- A SELECT IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF IT

top level, before `w`

```
/* ---------- A SELECT IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF IT ----------
   ASKED FOR ON 9 OCTOBER AS *"a more stable standard simple conventional drop down list"* (note 315).
   For a week before that every ordinary `<select>` was `pointer-events: none` and a tap near one was
   caught, CANCELLED, and answered with the app's own floating panel (note 226) — and this journey
   asserted exactly that. It asserts the opposite now, through the same doors a finger and a keyboard
   use, so that panel cannot come back one listener at a time:
     · the press reaches the select and nothing cancels it — the `mousedown` a select opens its list
       from, and the click a `<label>` focuses its select with;
     · focus arriving on a select stays there on a phone — the old `focusin` listener blurred it;
     · nothing appears in the document for the press: no listbox, no `#drop`, nothing new in `<body>`;
     · the answer arrives as one `change` and reaches `BOOKING` — the contract every caller relies on;
     · and the one thing the app does cancel: a press that the app took as a SWIPE (`PRESS_MOVED`),
       whose `mousedown` and label click would otherwise open a list under a lifting thumb.
   `js/check-dropdowns.js` reads the stylesheet for the other half — no select is `pointer-events:
   none` — which jsdom cannot, having no cascade. */
```

### ---------- THE ROW'S WORD IS THE SELECT'S LABEL

top level, before `rowsWithControl`

```
/* ---------- THE ROW'S WORD IS THE SELECT'S LABEL ----------------------------------------------------
     FOUND BY REVIEW ON 9 OCTOBER: a tap on `Kind` reached nothing, while the stylesheet said the whole
     row was the target — the panel's hit test had made it so, and went with the panel. The word is a
     `<label for>` its control now (`receiptRow`), so the browser's own label activation reaches it. */
```

### ---------- NO TWO LINES OF THE PLATFORM'S LIST SAY THE SAME THING

top level, before `S`

```
/* ---------- NO TWO LINES OF THE PLATFORM'S LIST SAY THE SAME THING ----------------------------------
     THE BLANK OPTION CARRIES THE FALLBACK'S WORDS, so an admin's "Who is this for?" read `Test Admin` on
     its empty line and `Test Admin` again on the person — two lines nobody could tell apart. The panel
     hid the repeat, and this journey's option count asserted it; when the platform's list came back the
     rule moved into `stepSelect_` (the blank is `—` when the fallback is already an answer) and the count
     went with the panel, so nothing held it (found by review, 9 October: the rule undone, every journey
     green). Asked of the select itself now: for an admin whose own name is on the For list, the blank is
     the dash, and no two options of ANY single-answer select on the card read the same. */
```

### ---------- THE TWO KINDS ARE READ OFF THE STEP, NOT TYPED HERE

top level, before `bad`

```
/* ---------- THE TWO KINDS ARE READ OFF THE STEP, NOT TYPED HERE ------------------------------
     THIS SEEDED `'A session of your own'` AND `'A shared class — join the waiting list'`, and the
     Kind question has offered `Instant class` and `Waiting list class` for months. It went on
     passing because `isWaiting_` is a substring test for "wait" and the old label happened to carry
     one — so both branches really were exercised, by luck, on two strings nobody can choose.

     THAT IS A CHECK MEASURING A STATE THE APP CANNOT BE IN, which is this file's own recurring
     fault seen from the instrument's side. The step's `options()` is the one list the form offers;
     `isWaiting_` still decides which is which, so the mapping cannot go stale either. */
```

### ---------- THE RUNS CAME BACK ALPHABETICALLY BY THEIR CODE PREFIX

top level, before `w`

```
/* ---------- THE RUNS CAME BACK ALPHABETICALLY BY THEIR CODE PREFIX ---------------------------
     `bookRuns` SORTED `a.day.localeCompare(b.day)` OVER `m / tu / w / th / f / sa / su`, which is
     Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday. A Monday-and-Friday booking —
     the commonest two-day shape there is — came back `Friday, Monday`.

     THREE THINGS ARE TAKEN FROM THE FIRST RUN, so it was never only the reading order: the day list
     goes into the job's `weekday` cell, `time` becomes `start_time`, and `hours` becomes
     `hours_per_session`, which `priceLooksWrong` measures the total against. A Monday 10-12 with a
     Friday 16-18 recorded its start as 16:00.

     THE TOTAL IS UNAFFECTED and that is exactly why nothing caught it: the money is built from
     `hoursPerWeek` and the real session dates, both sums over every run, so every figure on the
     card was right while the day and the time beside them were not.

     THE RULE RATHER THAN THE INSTANCE. `blockSay_` already orders the waiting list's week off
     `SLOT_DAYS` with a note saying why; the hour week kept the old sort. This is what makes the
     next one fail instead of being noticed. */
```

### REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the other pop ups that come up at the bottom of screen."* Measured

top level, before `w`

```
/* ==================================================================================================
     REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the
     other pop ups that come up at the bottom of screen."* Measured before it was changed: a wrong
     PIN put a gold bar across the top of the app — **and it was still there after signing in
     correctly**, because `banner('')` is called in exactly two places and neither is on that path.

     `why_` RAISED IT FOR ALL THIRTEEN OF ITS CALLERS, so this was never only the sign-in card: every
     failed write in the app left a standing alarm. Eight of the thirteen already toasted the same
     sentence, so the banner was a second copy at alarm volume that outlived what it was about.

     THE RULE IS THE DISTINCTION RATHER THAN THE SCREEN. A banner is for a STANDING condition — the
     sheet is missing columns, the questions did not load, a newer build is ready — each true until
     something changes. A refused action is a MOMENT. So: the sentence must be on the screen, and
     the banner must not be the thing carrying it.

     DRIVEN THROUGH THE APP'S OWN DOOR: the stub refuses the POST, `do-signin` runs, and what is
     asserted is what a person would see. */
```

### ---------- WHAT THE BANNER SAID BEFORE, BECAUSE A STANDING ONE IS CORRECT

top level, before `bannerWas`

```
/* ---------- WHAT THE BANNER SAID BEFORE, BECAUSE A STANDING ONE IS CORRECT -------------------
     THE FIXTURE RAISES ONE AT BOOT — its `version` is `test`, so `load()` warns that the
     deployment cannot do half the actions, which is exactly the standing condition a banner is
     for. A rule that asked "is any banner up" would have been red on that and taught nobody
     anything. The question is whether the REFUSAL raised one, so it is the change that is read. */
```

### ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account button."* Three things are held here, because each one broke or

top level, before `w`

```
/* ==================================================================================================
     ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account
     button."* Three things are held here, because each one broke or never existed before:
       - the three actions are TILES in ONE row on the sign-in card, and the old `No account yet?`
         card is gone (two doors to one room is the thing this app keeps removing);
       - the create-account tile OPENS something. It toasted "Registration is the next thing to
         wire" and posted nothing, which a press-sweep reads as "something happened";
       - a filled sheet posts `register` with the four fields the backend requires, by the names
         dopost.gs reads (`first_name`, `last_name`, `email`, `pin`) — and a PIN the backend would
         refuse is refused here BEFORE anything goes on the wire. */
```

### `register` MAILS `?verify=<token>` AND, BEFORE THIS, NOTHING ON THE SITE READ IT.

top level, before `w`

```
/* ==================================================================================================
     `register` MAILS `?verify=<token>` AND, BEFORE THIS, NOTHING ON THE SITE READ IT. Every account
     made from the form stayed PENDING and `verifyLogin` refuses PENDING — so the journey above would
     have passed on an account nobody could ever sign into. This starts the app on that address. */
```

### EVERY WAY A CHILD GETS IN, ON THE SCREEN.

top level, before `w`

```
/* ==================================================================================================
   EVERY WAY A CHILD GETS IN, ON THE SCREEN. *"so all kids can login easily with their handle and
   pin."* `check-signin.js` asks the backend through the real `doPost`; these ask the phone's half —
   that the form posts what the backend reads, that the answer is put where the child will look, and
   that the tiles are drawn for the people the server will say yes to and nobody else.
================================================================================================== */
```

### AND WHEN THE PARENT ACCOUNT ON THAT ADDRESS IS STILL PENDING, the child is confirmed and NOT put on it

top level, before `w`

```
/* AND WHEN THE PARENT ACCOUNT ON THAT ADDRESS IS STILL PENDING, the child is confirmed and NOT put on it
   (`verifyEmail`, the PR #130 review: it may be somebody else's account on the grown-up's address). The
   grown-up is told what is left to do, not left believing the child is on their account — and told in a
   SHEET they close. Round one said it in a toast, which goes after 2.6 seconds, and the child's link is
   single-use, so the second half of the sentence was never read (the review of round one). */
```

### AN ADDRESS NOBODY HAS PROVED, ON THE PHONE.

top level, before `jo`

```
/* ==================================================================================================
   AN ADDRESS NOBODY HAS PROVED, ON THE PHONE. The backend holds two things back from a PENDING address
   — every mail but its link and a forgotten PIN, and every door that puts a child on the account —
   and `check-signin.js` §9 holds that. This asks the phone's half: that the person is told, where they
   would otherwise wait, and offered the link again; and that it all goes when the address is proved.
================================================================================================== */
```

### ROUND THREE OF THE PR #130 REVIEW, ON THE PHONE.

top level, before `JO_PENDING`

```
/* ==================================================================================================
   ROUND THREE OF THE PR #130 REVIEW, ON THE PHONE. Each journey below is prefixed `proof:` so
   `FLOW_ONLY=proof:` runs them alone. Two were found with no journey holding them at all — the link
   opened on your own phone taking the held card away, and "Send the link again" on an address already
   confirmed — mutated to nothing, all 150 journeys stayed green. And the review's jsdom probe found the
   first one undone by a `myProfile` that answered after it.
================================================================================================== */
```

### THE ORDER THE REVIEW MEASURED:

top level, before `asked`

```
/* THE ORDER THE REVIEW MEASURED: `myProfile` reads the sheet BEFORE the link is opened there, and its
     answer reaches the phone AFTER the link's — so it says the address still waits, about a moment
     that has passed. `confirmed` is the sheet: the link writes it when its (slower) answer goes out,
     and each `myProfile` reads it when it is asked. The first is held back past the link's answer. */
```

### WHO THE ACCOUNT IS FOR.

top level, before `w`

```
/* ==================================================================================================
   WHO THE ACCOUNT IS FOR. The walk after 273 found a parent who signed up on the phone made a student,
   with no "Make your child's account" and a Client tick refused. `check-signin.js` §8 asks the backend
   that `who` decides the role; this asks the phone's half — that the question is asked FIRST and
   cannot be skipped, that the answer shapes the form and goes on the wire, and that a parent who
   signed up is shown the make-child card on the first paint after signing in, with no reload.
================================================================================================== */
```

### "MAKE YOUR CHILD'S ACCOUNT" IS THERE FROM THE FIRST PAINT — as the one sentence that says what comes first while the address is unproved (`confirmFirst_`)

top level, before `heldCard`

```
/* "MAKE YOUR CHILD'S ACCOUNT" IS THERE FROM THE FIRST PAINT — as the one sentence that says what
     comes first while the address is unproved (`confirmFirst_`), with the link offered again; the form
     itself once the link is opened (the journey after the next). */
```

### AND NOT ONLY SETTINGS:

top level, before `w`

```
/* AND NOT ONLY SETTINGS: the column ON SCREEN when the role changes is drawn again. Made an admin in
     the sheet while looking at the people column, the phone draws the admin's list of everyone there
     and then — the role decides a whole column, not one card. */
```

### ---------- MANAGE YOUR CHILD IS ONE CARD (docs/history/339)

top level, before `w`

```
/* ---------- MANAGE YOUR CHILD IS ONE CARD (docs/history/339) ----------------------------------------------------
   The owner, 11 Oct: *"chagne the add/make you child widget into one widget which is manage you child."* So the
   make form and the add form are two sections of one card on one page, making first — most children here have
   none — and this journey asks that of the card before it makes an account through it. */
```

### ---------- MANAGE YOUR CHILD: THE CHILDREN ON IT, NEW PIN BESIDE EACH, LINKING ONE, AND THE HELD STATE

top level, before `FRESH`

```
/* ---------- MANAGE YOUR CHILD: THE CHILDREN ON IT, NEW PIN BESIDE EACH, LINKING ONE, AND THE HELD STATE -----------------
   One card (docs/history/339): the children already linked to you, from `DATA.family` and only when it is stamped as
   yours (`familyFor`); "New PIN" beside each, the one power a parent holds over a linked child's account
   (`resetPin`), asked first in its sheet as on the child's own card; linking a child who has an account
   (`claimChild`, the add section's boxes and only those); "No child is linked" when there are none and the payload
   has landed; and while the parent's own address waits, the forms are the held sentence and the children are
   listed with no New PIN, because `resetPin` refuses a pending parent. A student is drawn no such card. */
```

### ---------- SETTINGS NO LONGER DRAWS WHAT MOVED, AND A RETURNING VISITOR LANDS ON A REAL PAGE

top level, before `w`

```
/* ---------- SETTINGS NO LONGER DRAWS WHAT MOVED, AND A RETURNING VISITOR LANDS ON A REAL PAGE ----------------------------
   The wardrobe, one of the two child cards, the library cards and (for a parent) About you have left the column,
   so it is shorter by up to four pages. `PAGE.settings` is remembered for the visit and not across a reload, and
   `paintPager` clamps it to the pages there are: somebody who was on the old last page — Notifications, the
   fourteenth of an admin's seventeen — is put on a real page, the last one, and never on nothing. */
```

### A PARENT'S NEW PIN IS ON "MANAGE YOUR CHILD" AND NOWHERE ELSE (the review of docs/history/339):

top level, before `FRESH`

```
/* A PARENT'S NEW PIN IS ON "MANAGE YOUR CHILD" AND NOWHERE ELSE (the review of docs/history/339): it was on the child's
   card on the You column as well — two widgets for one job, and the two disagreed for a parent whose address was
   unproved. The press itself, asked first and answered with the slip, is the Manage journey's; this one asks where
   the tile is, and an admin's, which is on everybody else's card on their column as before. */
```

### ASKED FOR AS *"The tick boxes have a date for when it got requested. When other things get ticked they should also have a date."* The dates were already on the

top level, before `w`

```
/* ==================================================================================================
     ASKED FOR AS *"The tick boxes have a date for when it got requested. When other things get
     ticked they should also have a date."* The dates were already on the phone and nothing read
     them: `doGet` has put `events: eventsForJob(jobId)` on every job since the roster was derived
     from the log, and `js/` had no reader for it at all.

     THIS TESTS THE RULE RATHER THAN THE RENDERING, because the rule is the part that can be subtly
     wrong for years. Each date is taken to match its own predicate and the two are OPPOSITE ends of
     the list — `Accepted` needs EVERY seat agreed, so it is the LAST `Accept`; `Paid` needs a seat
     BOOKED, and on a session that is one, so it is the FIRST `Confirm`. A log where everybody moved
     on the same day would pass whichever way round they were read, so the job below has two
     families moving four days apart and the two right answers are the two INNER dates: the second
     Accept and the first Confirm, never the first Accept or the last Confirm.

     AND THE WAITING LIST IS THE OTHER HALF OF `Paid`. `jobStage_` wants the whole house booked
     there, so the same log gives the LAST `Confirm` on a two-seat list — one rule, two answers, and
     the test is that changing only `kind` and `maxKids` moves that one date.

     A CHAIN, SO NOTHING BELOW AN EMPTY BOX MAY CARRY A DATE. That is the half a rendering test
     cannot see: a stage whose own test is true but whose predecessor is not must draw neither the
     tick nor the date. */
```

### REACHED, NOT COUNTED.

top level, before `bad`

```
/* REACHED, NOT COUNTED. This said `length !== 5` and would have gone stale the first time a stage
     was added — which it did, when `Applied for` went in between `Requested` and `Accepted`. What
     the guard is for is *can this check see its subject*, and the honest test of that is that there
     is a list of stages with rows and predicates on them. The rows themselves are asserted below by
     name and by the chain. */
```

### `Applied for` TAKES THE ASKING'S OWN DATE on a booking with no `Apply` event, which is every booking today — see `JOB_STAGES`.

top level, before `want`

```
/* `Applied for` TAKES THE ASKING'S OWN DATE on a booking with no `Apply` event, which is every
     booking today — see `JOB_STAGES`. Asserted rather than assumed, because "ticked with Requested"
     is the whole of what the owner asked for and a date reaching for a nearby event instead would
     look identical on the card. */
```

### AND A STAGE BELOW AN EMPTY BOX CARRIES NOTHING, tick or date.

top level, before `part`

```
/* AND A STAGE BELOW AN EMPTY BOX CARRIES NOTHING, tick or date. `Accepted` is false here because
     one seat is still Waiting, so `Paid` must stay blank even though a `Confirm` sits in the log
     and both session dates are long past. */
```

### ---------- ASKED AS THE CHAIN RATHER THAN AS A LIST OF ROW NAMES

top level, before `part`

```
/* ---------- ASKED AS THE CHAIN RATHER THAN AS A LIST OF ROW NAMES -----------------------------
     THIS SKIPPED `Requested` BY NAME and reported every other row as broken, which was right while
     `Requested` was the only stage above `Accepted`. `Applied for` is above it too now, so a check
     naming rows would have failed on a row behaving exactly as designed.
     THE PROPERTY IS WHAT IS TESTED: find the first unticked row, and nothing after it may tick or
     carry a date. That is the chain itself, and it needs no list here to go stale. */
```

### ---------- REPORTED AS A COLUMN WITH NOTHING IN IT

top level, before `w`

```
/* ---------- REPORTED AS A COLUMN WITH NOTHING IN IT -------------------------------------------
     *"can you see how in screenshot i booked 3 hours? there should be a 3 hour mutultiplier in the
     multiplication column."* The `Hours a week` row was deleted a long way back with a note saying
     the When row reported the same number beside the grid that decides it — and then the When row
     became seven day rows and the number went with it.

     IT IS A MULTIPLIER RATHER THAN A CAPTION, which is why it goes in that column and why this
     journey asserts the arithmetic as well as the markup: `priceFrom` does `p *= L.hoursPerWeek`,
     and hours-a-week is the sum of the seven figures. A day's `× 3` that does not add up to the
     number the price is built from is two statements of one fact.

     THE DISPLAY HALF IS CSS AND IS NOT ASSERTABLE HERE. `.bk-m` is hidden on any row with no
     running total, which is right about every other row and would have hidden this — proved by
     mutation in a browser: with the week's exemption removed the markup says `× 3` and the card
     shows nothing. jsdom applies no stylesheet, so what this can hold is that the figure is written
     and that it is right. */
```

### ---------- ASKED FOR AS A MULTIPLIER FOR THE NUMBER OF DATES

top level, before `w`

```
/* ---------- ASKED FOR AS A MULTIPLIER FOR THE NUMBER OF DATES ---------------------------------
     *"there should be a multipler for the number of dates bit."* The count WAS on this card, as an
     aside beside the price, and was removed one commit earlier on the argument that *"the count is
     the MULTIPLIER on the row that does the arithmetic"* — which named the wrong number: the `Time
     interval` row multiplies by WEEKS, so three days a week over twelve weeks shows `× 12` and the
     thirty-six sessions were nowhere on the document.

     THE COUNT IS OF WHAT THE ROW LISTS, and that is what makes this assertable rather than a matter
     of taste: the figure and the value come from one array, so a row that lists six dates and counts
     five is a shape that cannot occur — unless somebody writes the count from somewhere else, which
     is exactly what this refuses.

     AND IT IS SILENT ON ONE DATE. `× 1` is the multiplier this app already declines to print, and a
     single session listing its one date needs no count of it.

     THE DISPLAY HALF IS CSS AND IS NOT ASSERTABLE HERE, the same as the day rows' own journey above:
     `.bk-m` is hidden on any row with no running total, which is right about every other row and
     would have hidden this. Proved by mutation in a browser instead — with the exemption removed the
     markup says `× 6` and the card paints nothing. */
```

### ---------- REPORTED AS *"why is it coming out to so much?"*

top level, before `twice`

```
/* ---------- REPORTED AS *"why is it coming out to so much?"* -----------------------------------
     Over a card totalling £1024.59 whose Dates row listed EIGHTEEN sessions across two Septembers —
     September 2026 AND September 2027 — for one ticked term. Reproduced before anything was changed:
     with two rows named `Autumn 1` in the payload, `bookSpec().windows` came back with a length of
     two, the `Time interval` row read `Autumn 1, Autumn 1`, and three sessions became ten.

     THE PAYLOAD REALLY SHIPS THE NAME TWICE, and `doget.gs` believed otherwise — its own comment
     said that once terms which have ENDED are dropped *"each name appears once inside the next
     twelve months"*. Measured against the real `schoolYear` on 25/09/2026, that filter keeps
     `Autumn 1 2026-09-07..2026-10-23` AND `Autumn 1 2027-09-06..2027-10-22`: the first has not
     ended and the second starts four days inside the 370-day cut-off. So it held for most of the
     year and failed every autumn, which is the one term it matters for.

     REPAIRED AT SOURCE AND ON THE PHONE. The source fix is a deploy away and this app's house rule
     is that a broken sheet must still produce a working site, so `intervals_()` answers one row per
     name — and that is the half this journey can reach, because a journey seeds a payload rather
     than running `doGet`.

     THE ASSERTION IS THE WINDOWS AND THE SESSIONS, not the pounds. A price is a chain of six other
     rows and a figure here would fail for reasons that have nothing to do with terms; how many
     windows one ticked name opens is the fault itself. */
```

### AND THE SESSIONS ARE INSIDE THAT ONE TERM, which is the thing the report was actually about:

top level, before `L`

```
/* AND THE SESSIONS ARE INSIDE THAT ONE TERM, which is the thing the report was actually about: a
     second window a year away shows up as a date in the wrong year on the Dates row, and that is
     what the family would have been billed for. */
```

### ---------- ASKED FOR AS A FLOOR AND AS AN OPTION THAT MUST NOT EXIST

top level, before `w`

```
/* ---------- ASKED FOR AS A FLOOR AND AS AN OPTION THAT MUST NOT EXIST -------------------------
     *"if its at clients house, then it should minimum 3 extra seats. there should be no option for 1
     extra seat."* The second sentence is what the first one means: `BOOKING.n` is the TOTAL, so
     three extra is four chairs and 1, 2 and 3 are not offered at all.

     TWO HALVES AND BOTH ARE ASSERTED, because they used to disagree. `seatLimits` has had a minimum
     since it was written — a venue with a minimum party size sets one — and the seats step's option
     list ignored it, starting at 1 whatever it said, so the refusal one line below was refusing
     numbers the list had just offered. The list starts at the floor now.

     AND THE SENTENCE IS IN THE ROW'S OWN UNITS. `lim.min` is a total and the row draws extras, so a
     refusal reading "needs 4" under a control offering 0, 1, 2 and 3 is the same fact in two units an
     inch apart — the shape this repository records under `needs_print` / `print_required`. */
```

### A FREE ROOM IS NOT A HOUSE.

top level, before `V`

```
/* A FREE ROOM IS NOT A HOUSE. The first version asked `isHome`, which is "does anybody pay for
     this room" — true of `Online` and of every free library — so a one-to-one video call needed four
     chairs. Two free venues are put on the payload for the question, and a house by name beside
     them so the rule is asked in both directions on one list. */
```

### ---------- *"colliers would library has 3 rooms within it. 2 are same size and one is large. And 2

top level, before `fx`

```
/* ---------- *"colliers would library has 3 rooms within it. 2 are same size and one is large. And 2
     have capacity for 4 kids and large one has capacity for 10 kids."* — the owner, 10 Oct ------------
     THE VENUE IS `check/fixture.json`'s, NOT ONE WRITTEN HERE. Its rooms are what the real doGet sends
     for their cells — `check-rooms.js` rebuilds them and fails on any difference — so this asks the
     phone about rows the backend really produces: two small rooms with no rate typed, which arrive at
     the venue's 12 (`roomTerms_`), and a large one at its own 20. A blank rate used to arrive as 0, and
     every surface below read that as FREE.

     THE HOUSE CAP IS TAKEN OFF FIRST, so the room is what decides `seatLimits`' ceiling — the bound
     a seat count is refused against. It is not what the seats list offers: that is four options from
     the floor in every room, asked below. `max_students_per_job` is 4 in this payload — and 4 on the
     live config tab, which is why the large room's ten is asked again with the cap on at the end: the
     business's own limit still wins, and says so. */
```

### ---------- AND ONE BOOKING IS STILL FOUR SEATS, IN ANY ROOM

top level, before `B.loc`

```
/* ---------- AND ONE BOOKING IS STILL FOUR SEATS, IN ANY ROOM -----------------------------------
     THIS JOURNEY WAS TITLED "THE LARGE ONE SEATS TEN" AND ONLY EVER ASKED `why('10')` — the refusal,
     which is silent on ten. The LIST was never asked, and the list is four options from the floor
     (`BOOK_STEPS` `n`: *"change this to be extra seats, then options are 0,1,2,3"*), so a family can
     choose 1, 2, 3 or 4 chairs in the large room exactly as in a small one, whatever the room or
     `max_students_per_job` says. docs/history/336 said raising that cell would let a booking take
     ten, and review drove the form and found it could not: the room's ten is how many a CLASS there
     can grow to (`capacityFor` on a join, the waiting list's seats), not what one family books. Asked
     here so the note and the form cannot part again — the window is the owner's to widen. */
```

### ---------- THE ROW SAYS WHICH ROOM

top level, before `name`

```
/* ---------- THE ROW SAYS WHICH ROOM -------------------------------------------------------------
     A SELECT CANNOT WRAP, and the three rooms are one string until the last word — at 390 review saw
     "Colliers …" on the Venue row for every one, on the form and in the shared picture. So the row
     draws the chosen option's whole text as words (`wrap` on the `loc` step), with the select laid
     over them; jsdom has no layout, so this asks the markup — the words are there, they are the
     option's own, and the select is still the control inside the same box. Whether they fit uncut is
     `check/ui.js`'s state "a room chosen, named whole on its row", in the real cascade. */
```

### ---------- THE WEEK WAS COMPARED TO ONE DAY NAME

top level, before `w`

```
/* ---------- THE WEEK WAS COMPARED TO ONE DAY NAME --------------------------------------------
     `jobGrid_` DID `norm(label) === norm(j.weekday)`, and `weekday` holds what `bookSpec` sent:
     every day the booking runs, joined with commas. So `norm('Monday')` never equalled
     `norm('Monday, Friday')` — not for Monday and not for Friday — and a two-day booking lit
     NOTHING. Measured: 2 cells on a one-day job, 0 on a two-day one, 0 on a three-day one.

     THE TALLEST BLOCK ON THE RECEIPT, DARK, on exactly the bookings somebody most needs to check,
     and it reads as a week with no session in it rather than as a fault. That grid exists, by its
     own note, so a family can SEE when their session runs instead of reading it off a line.

     THE SPAN IS ONE SPAN and is shown on each named day, because `start_time` and
     `hours_per_session` are single cells on the job row. */
```

### ---------- PRESSING SEND USED TO EMPTY THE SCREEN

top level, before `bad`

```
/* ---------- PRESSING SEND USED TO EMPTY THE SCREEN ------------------------------------------------
   `resetBooking_()` CLEARS EVERY ANSWER AND `load()` FETCHES THE NEW JOB, so the page a person was
   looking at a second ago went blank and a toast was the only evidence anything had happened. The
   session was real and two swipes away under `Booking · Receipts`, which is not where somebody
   looks immediately after pressing a button.

   SO THE BOOKING COMES BACK UNDER THE BLANK FORM, and this asks for exactly that: one more
   document on the SAME page, carrying the id of the job that was just created.

   THE PAGE COUNT IS PART OF IT. Each element of `bookBlocks()` is a page somebody swipes to, so a
   receipt returned as its own element would be "somewhere else" again — the fault this fixes,
   wearing a different shape. Same page, more markup. */
```

### ---------- PAGE ZERO, WHICH IS THE FORM — NOT THE WHOLE COLUMN

top level, before `pagesBefore`

```
/* ---------- PAGE ZERO, WHICH IS THE FORM — NOT THE WHOLE COLUMN ------------------------------
     THIS JOINED EVERY PAGE AND ASKED WHETHER `J-ASK` WAS ANYWHERE IN IT, which was a true reading
     of the column while `myJobs_` returned nothing for anybody: one page, the form, and nothing
     else. With the payload sending `client` — see the note above `jobs` — this visitor has three
     sessions of her own and one of them IS J-ASK, so "a booking is shown before one has been asked
     for" became trivially true about a page this journey is not about.

     WHAT IT MEANS TO ASSERT is that `askedBlock_` draws nothing until something has been sent, and
     that is a fact about the form page. `blocks()[0]` is that page — `bookBlocks` returns the form
     first and the receipts after it. */
```

### ---------- THE STATE ROWS ARE ON THE BLANK FORM, AND THEY ARE EMPTY

top level, before `cellOf`

```
/* ---------- THE STATE ROWS ARE ON THE BLANK FORM, AND THEY ARE EMPTY ---------------------------
     THE STAGE ROWS ARE PINNED TO THE END OF THE SPINE so the document reads the same from the first
     question to the last payment — which is the invariant, and it is untouched by what those rows
     look like. On a form nobody has sent they have nothing to report: `Status` prints `—` like
     every other unanswered row, and the stages print an EMPTY TICK BOX, which is the same
     "nothing yet" with the difference that it also says what will be reported.

     `Stage` AND `Asked for` WERE TWO OF THE THREE THIS ASKED ABOUT. Both are gone — see
     `JOB_STAGES` in book.js: the sentence is what the ticks say in words and the date is the
     `Requested` tick's own value. So the rule is the same rule against the rows that exist.

     READ OFF `bk-k`/`bk-v`, WHICH IS THE MARKUP THE FORM ACTUALLY USES. The first version of this
     looked for `</tr>` and reported all three rows missing — they were present and already correct,
     and the check was describing its own selector rather than the page. A row here is a
     `div.bk-row` of spans, and the value is the `bk-v` following the `bk-k` that carries the label.

     THE TICK IS READ OFF THE WHOLE CELL rather than its text, because a ticked and an unticked box
     hold the SAME GLYPH and are told apart by one class. A rule reading the text would pass on both
     — which is the shape of every inert check this repository has deleted. */
```

### READ OFF THE APP, SO A STAGE ADDED NEEDS NOTHING HERE.

in `dashes`

```
/* READ OFF THE APP, SO A STAGE ADDED NEEDS NOTHING HERE. This asserted `length !== 5` beside a
       list it had just derived from `JOB_STAGES` — a number in a sentence nobody re-reads, sitting
       one line under the thing that made the number unnecessary. What is worth refusing is an
       EMPTY list, which is this check unable to reach its subject. */
```

### ---------- AND ON THE PRICED FORM, WHICH IS A DIFFERENT BUILDER

top level, before `P`

```
/* ---------- AND ON THE PRICED FORM, WHICH IS A DIFFERENT BUILDER ---------------------------------
     THE BLANK FORM'S DASHES ARE NOT PROOF OF ANYTHING. `bookPrice()` is null until enough has been
     answered to cost the booking, so on an empty form `breakdownRows` never runs and the three rows
     come from `spineRows_`, which prints a dash for every spine row neither builder produced. They
     were dashes there before this rule existed and would be dashes if it were deleted.

     `breakdownRows` IS THE BUILDER THAT CARRIES THE VALUES, and it only runs once the form can be
     priced — so that is the state where "Stage says a sentence" could come back. Checked here after
     answering enough to produce a cost, which is the only version of this assertion that can fail.
     The first version tested the blank form only, and went on passing with the sentences put back. */
```

### ---------- `Requested` IS TICKED THE MOMENT IT IS SENT, AND ONLY ON THE SECOND DOCUMENT

top level, before `ticked`

```
/* ---------- `Requested` IS TICKED THE MOMENT IT IS SENT, AND ONLY ON THE SECOND DOCUMENT -------
     ASKED FOR AS *"a line for requested and it gets ticked automatically by system"* — so this is
     that sentence as a rule: nothing was ticked a moment ago, `book-send` has now gone, and the
     receipt under the form has its first box filled in. The form above it still has five empty
     ones, which is the spine's own argument about a document reading the same either side of a
     send, and the test that stops the tick being drawn on everything.

     IT REPLACES A COUNT OF THE WORD "Stage". That version asked only that the string appeared
     twice, so it would have passed on two blank forms — it was there to say "the second document
     is the booking widget" and could not say the widget had anything in it. */
```

### ---------- IT MUST NOT GROW, AND IT IS ALLOWED TO SHRINK

top level, before `pagesAfter`

```
/* ---------- IT MUST NOT GROW, AND IT IS ALLOWED TO SHRINK -------------------------------------
     THE RULE IS "BELOW, NOT BESIDE" — the booking just sent goes under the form rather than
     becoming another page to swipe to, which is the note `askedBlock_` carries. This asserted the
     count was UNCHANGED, which was the same statement while nobody had any other sessions.

     A SESSION ALREADY ON THE COLUMN MOVES ONTO THE FORM. `myJobsOrdered_` filters out whatever
     `ASKED_JOB` holds, precisely so the same receipt is not drawn twice — so asking for a session
     you already had legitimately takes the column from four pages to three. Growing is the fault;
     shrinking by one is the duplicate being removed. */
```

### ---------- IT LOOKED IN THE SHEET, AND THERE IS NO SHEET

top level, before `buttonsOn`

```
/* ---------- IT LOOKED IN THE SHEET, AND THERE IS NO SHEET ------------------------------------
     `on('job')` OPENED A PANEL OVER THE APP and now turns to the session's page on the Booking
     column — reported twice by the owner as "your week planner has pop ups… I told you I don't like
     that". So this reads `#s-booking`, which is where `paint` writes.

     THE JOURNEY WAS RIGHT TO BREAK, and that is the reason to repoint it rather than relax it: what
     it asserts — an admin can Accept a booking that is waiting and cannot Accept one already paid
     for — is true of the app either way, and it was checking the one renderer that has gone. The
     tiles it looks for are `jobAdminTiles_`'s, which `jobPage_` now draws, so this is the same
     question asked of the surviving surface. */
```

### ---------- PAY MOVED, AND THIS JOURNEY DID NOT

top level, before `w`

```
/* ---------- PAY MOVED, AND THIS JOURNEY DID NOT ---------------------------------------------------
   IT LOOKED IN THE RECEIPT SHEET, because that is where `payBlock` used to put the button. Both
   `payBlock` and `leaveBlock` became marks in the tile row under the card — see book.js:2828 — and
   `jobTiles_` in tiles.js is what renders them now.

   THE JOURNEY WAS RIGHT TO FAIL, ALL THE SAME. `receipt.js` was still calling the deleted
   `payBlock`, so opening any session receipt threw and the sheet had no buttons of any kind in it.
   "A client cannot pay an accepted booking" was true, and so was rather more than that. Fixing the
   call is what let this be re-pointed rather than simply deleted — the check was reporting a real
   fault right up until the fault was gone.

   ASKED OF `jobTiles_` DIRECTLY, so it is the same function the card calls, and the three states
   are the three that matter: asked-for, accepted, and already paid. */
```

### `#s-booking` RATHER THAN THE SHEET — see the note on the admin journey above.

top level, before `b`

```
/* `#s-booking` RATHER THAN THE SHEET — see the note on the admin journey above. `joinTile_` is
     what offers the seat and `jobPage_` draws it on the receipt's foot, so the control is on the
     page the app turns to. Where on the page is the journey after this one's question. */
```

### ---------- IT NO LONGER SENDS, AND THAT IS THE POINT

top level, before `bad`

```
/* ---------- IT NO LONGER SENDS, AND THAT IS THE POINT --------------------------------------------
     THIS ASSERTED `joinWaitlist` WENT OUT, because taking a seat used to ask availability in a
     browser `prompt()` and post it immediately. That was two ways to join a class sharing no code
     and asking different questions, and the second could not price a seat or validate its answer.

     TAKING A SEAT FILLS THE FORM IN NOW and turns to it, so nothing is sent until the one send
     button is pressed — the same button an instant booking uses. Asserting a request here would be
     asserting the fault back into place.

     WHAT IS CHECKED INSTEAD is that the form knows what was chosen: a waiting list, THIS list, and
     the three things the class decides. That is what the old request carried, and it is now
     somewhere a person can see it before it goes. */
```

### ---------- THE WAY IN IS A LINE AND A TILE OF THE PAPER, NOT A BLOCK UNDER IT

top level, before `joinPage_`

```
/* ---------- THE WAY IN IS A LINE AND A TILE OF THE PAPER, NOT A BLOCK UNDER IT ----------------------
   ASKED FOR AS *"the session booking thing at the bottom of receipt should be a line in the
   booking."* `joinBlock` drew, after the receipt, a sentence with the seats and the seat price, the
   list's tally, a gold `Take a seat` and a faint paragraph — on black, under a card it belonged to.
   The journey above asked only that the right ACT was offered somewhere on the column, which the
   block passed while floating; this asks WHERE, for both kinds of joining:

     · nothing under the paper — no `.join`, and no control on the page outside `.rc`
     · the act is a TILE in the receipt's own foot (`.rc .rc-tiles`), first, before Share
     · the seats are a row of the document — `Sharing`, inside `.rc` — and an open session no longer
       says "Just you" on the page that offers you a seat on it
     · the list's tally is a `Can come` row of the paper, and it is there for somebody ON the list
       too, which the block never was — `canAsk` hid it from everybody already in

   PRESSED THROUGH THE TILE ITSELF, not through `ACTIONS`: a tile with the right `data-do` and no
   `data-id` would pass a lookup and find no class when tapped. */
```

### ONE MORE SESSION, OPEN, SEEN BY SOMEBODY NOT ON IT — in the shape `doGet` sends a stranger:

top level, before `p`

```
/* ONE MORE SESSION, OPEN, SEEN BY SOMEBODY NOT ON IT — in the shape `doGet` sends a stranger: no
     names on the seats, no `splitEmails` (that goes only to the family who typed the addresses),
     `canAsk` worked out by the server. Added to this journey's payload alone, so no other journey's
     column grows a page. */
```

### ON POSTS, NOT BOOK. A festive card is the business announcing something with a date on it, which is the same voice as a post with a caption — it was only ever

top level, before `el`

```
/* ON POSTS, NOT BOOK. A festive card is the business announcing something with a date on it, which
     is the same voice as a post with a caption — it was only ever on the booking column because
     bookings were. There is no Book column now either way. */
```

### ---------- THE SCREEN IS CALLED `feed`, AND THIS ASKED FOR `posts`

top level, before `el`

```
/* ---------- THE SCREEN IS CALLED `feed`, AND THIS ASKED FOR `posts` -----------------------------
     THE COLUMN WAS RENAMED AND THE JOURNEY WAS NOT. `posts.js:800` registers `screen('feed', …)`,
     so `go('posts')` navigates to a screen that does not exist and `#s-posts` is null. `cards`
     came back empty every time and the journey reported "the festive event never appeared on the
     feed" — which was true of the element it was looking at, and told you nothing about festive
     events. The feature is fine: `posts.js:191` maps `DATA.festive` through `festiveCard` and
     splices the cards in above the posts. */
```

### ---------- JOINING IS TWO STEPS, AND THIS ONLY DID THE FIRST

top level, before `disabled`

```
/* ---------- JOINING IS TWO STEPS, AND THIS ONLY DID THE FIRST ----------------------------------
     `fest-join` DOES NOT SEND ANYTHING AND IS NOT MEANT TO. It opens a sheet asking who is coming,
     because — the note above the handler — "a party needs a headcount and a family with three
     children is three chairs". `fest-join-go` is what sends, once there are names in the box.

     So "joining sent [nothing], expected joinFestive" was a true sentence about a journey that
     stopped halfway. It was hidden until now behind the wrong screen id: the card was never found,
     the journey returned before reaching here, and this half was unreachable.

     THE HEADCOUNT IS PART OF THE JOURNEY, so it is typed in rather than skipped. An empty box is
     refused by design and would look exactly like a broken send. */
```

### ---------- THE BUG, DEMONSTRATED BEFORE IT WAS FIXED

top level, before `w`

```
/* ---------- THE BUG, DEMONSTRATED BEFORE IT WAS FIXED -----------------------------------------
     `x ` AND A TICK WERE THE DONE MARKERS, bare, at the front of the line. So "x ray results" was
     stored and read back as a COMPLETED task called "ray results": the state wrong and the text
     eaten, which is both of the only two things a to-do list has to get right. "X marks the spot"
     went the same way.

     THE MARKER IS A MARKDOWN CHECKBOX NOW and cannot collide with prose. This journey is written
     against the STORAGE FORMAT rather than the markup, because that is what has to survive — the
     sheet is the database and these strings sit in a column somebody reads. */
```

### ---------- ASKED FOR AS "students should be able to see their parents and likewise"

top level, before `w`

```
/* ---------- ASKED FOR AS "students should be able to see their parents and likewise" ------------
     WHO IS IN `DATA.family` IS THE SERVER'S QUESTION and `check-profile.js` asks it through the real
     `doGet`: accepted links only, the token's own family only. This asks the other half — that the
     column draws a card for each person it was sent, labelled with which side of the link they are
     on, once each, and nothing at all when an older backend sent no key. */
```

### A LIST BUILT FOR SOMEBODY ELSE, OR STAMPED BY NOBODY, DRAWS NOTHING.

top level, before `D.familyFor`

```
/* A LIST BUILT FOR SOMEBODY ELSE, OR STAMPED BY NOBODY, DRAWS NOTHING. `DATA` outlives a sign-out
     and signing in paints before the new payload lands, so a phone handed from Pat to another
     family's child would otherwise show Pat's family as theirs. */
```

### AND A BROTHER OR SISTER, ON *"students should be able to see their parents and siblings likewise"*.

top level, before `held`

```
/* AND A BROTHER OR SISTER, ON *"students should be able to see their parents and siblings
     likewise"*. `doGet` sends `relation: 'sibling'` for another child of an accepted parent; the
     column draws it under its own label, once, and the parent's card is still there beside it. A
     relation this phone has no label for is drawn as nothing, which is what an older phone does
     with a newer backend's rows. */
```

### AND THE REQUEST THAT BECOMES A LINK.

top level, before `name`

```
/* AND THE REQUEST THAT BECOMES A LINK. A parent's "this is my child" waits on the child, and the
     account column is the only place it is drawn — before this it was built by `meRest_`, which
     nothing calls, so no claim was ever answerable and no family could form from the app. It is the
     child's own and held to the same `familyFor` stamp; pressing yes posts `answerClaim` with that
     row and takes the card off at once rather than when the payload lands. */
```

### ---------- ASKED FOR AS "Admin should be able to see every one in the people column."

top level, before `w`

```
/* ---------- ASKED FOR AS "Admin should be able to see every one in the people column." ---------
     WHO IS IN `DATA.everyone` IS THE SERVER'S QUESTION and `check-profile.js` asks it through the
     real `doGet` (admin token only, no private cell). This asks the phone's half: an admin's column
     draws one card per person sent, with a Message tile under it and no Listed switch; a student
     handed the same list — `DATA` outlives a sign-out — draws none of it; and nobody is drawn twice. */
```

### ---------- THE BUG THIS IS WRITTEN FOR, AND IT HAS HAPPENED THREE TIMES

top level, before `w`

```
/* ---------- THE BUG THIS IS WRITTEN FOR, AND IT HAS HAPPENED THREE TIMES ------------------------
     `PAGER.account` counted `mePages()`. That function fed the old You COLUMN and says so in its
     own comment; `screen('account')` draws `accountPages_()` plus `termsPages_()`. So the number of
     pages the header believed in and the number on screen came from two functions that had not
     agreed since the column was folded into the funnel — and you could not move down the profile
     column at all. Not an error: the pager reported one page, so there was nowhere to go, while the
     pages sat underneath waiting.

     THE SAME SHAPE TWICE BEFORE. `PAGER` keyed on `me` and `posts` when the screens had been renamed
     `account` and `feed`, so two columns silently stopped paging. And `stuffFirstResult_` counted a
     page list that `paintStuff` built differently, which put a blank card under the question for
     every starred thing.

     SO THE JOURNEY ASKS THE BROWSER, not the source: paint each screen through `go`, count the
     `.page` elements that exist, and compare with what `PAGER[id]()` says. Two functions can only
     be checked against each other by running both. */
```

### AND REPAINTED, BECAUSE THAT IS WHAT SIGNING IN DOES.

top level, before `bad`

```
/* AND REPAINTED, BECAUSE THAT IS WHAT SIGNING IN DOES. `__t.USER` only sets the variable; the app
     calls `repaint()` straight after, which marks every other screen stale so `go` redraws it on the
     way in. Without this the journey walks onto screens painted while signed out and reports a
     disagreement that is its own doing — which is exactly what it did the first time it ran. */
```

### ---------- AND IT WALKED `PAGER`, SO A SCREEN WITH NO ENTRY WAS INVISIBLE TO IT

top level, before `ids`

```
/* ---------- AND IT WALKED `PAGER`, SO A SCREEN WITH NO ENTRY WAS INVISIBLE TO IT ---------------
     THIS IS THE FAULT THE JOURNEY IS NAMED FOR, IN THE JOURNEY. It asked every screen that HAS a
     pager whether that pager agrees with what is drawn — and the worst version of this bug is a
     paged screen with no entry at all, which `Object.keys(PAGER)` cannot enumerate. `booking` was
     exactly that: `screen('booking')` uses `pages()`, `PAGER` had never heard of it, and so the
     form and every session receipt on that column could not be swiped to. `shell.js`'s own note
     over `tools` describes the state precisely — "the pages exist and nothing reaches them" — and
     names the two columns it had already happened to.

     SO IT WALKS `TABS`, which is the app's own list of screens, and a screen that draws pages with
     no pager is a failure rather than a row that is never visited. Fourth costume of the
     check-that-cannot-reach-its-subject fault, and the first one inside a check written about
     pagers. */
```

### A SCREEN THAT DRAWS PAGES AND HAS NO PAGER gets no `paged` class and no axis — see the note above.

top level, before `says`

```
/* A SCREEN THAT DRAWS PAGES AND HAS NO PAGER gets no `paged` class and no axis — see the note
       above. Said as its own sentence rather than as "0 against 3", because the repair is an entry
       in `PAGER` and not a number to correct. */
```

### THE ONE DEFINITION, asked of the app rather than reproduced here.

top level, before `says`

```
/* THE ONE DEFINITION, asked of the app rather than reproduced here. `PAGER[id]()` may answer
       with a list of names or with a count -- see the note over `pageCount` -- and reading `.length`
       off it was this journey keeping a second opinion about which. */
```

### ---------- A WINDOWED SCREEN HOLDS FEWER ELEMENTS THAN IT HAS PAGES

top level, before `keep`

```
/* ---------- A WINDOWED SCREEN HOLDS FEWER ELEMENTS THAN IT HAS PAGES ---------------------------
       The Find screen keeps `STUFF_WIN` result pages in the document and slides them -- see
       `stuffWindow_` in find.js -- so its element count is capped on purpose and comparing it
       against the total would report the window as the fault. The question is the same one: does
       the screen hold every page it is able to. */
```

### ---------- THE JOURNEY I PROMISED BEFORE MOVING THEM

top level, before `w`

```
/* ---------- THE JOURNEY I PROMISED BEFORE MOVING THEM ------------------------------------------
     Accept, Decline, Mark as paid and Delete were four `<button>`s inside the receipt and are tiles
     now. A refactor that renders the same actions in a different shape is exactly the kind that
     loses one silently: the card still draws, the page still looks right, and the action somebody
     needed once a month is gone.

     SO IT ASKS FOR THE `data-do` NAMES, not the markup. That is what a tap actually dispatches on —
     it is what `check-doors` pairs against a handler — so a journey written against it survives the
     next change of shape too, which is the whole point of writing it at this moment.

     AND IT CHECKS THE STAGES SEPARATELY, because the actions are not all offered at once: Accept
     and Decline only exist on a request, and Mark as paid only once it is accepted. A journey that
     only looked at one stage would pass while the other had lost everything. */
```

### ---------- WHO IS SHOWN WHICH FIGURE, AND WHERE THE ACTIONS ARE

top level, before `w`

```
/* ---------- WHO IS SHOWN WHICH FIGURE, AND WHERE THE ACTIONS ARE ---------------------------------
   ASKED FOR AS *"for tutor they shouldnt see grand total client pays, only grand total they earn.
   admin should be able to see grand total client pays. total tutor earns, and how much admin
   earns"* and *"no floating tiles for already booked sessions"*. Nothing else can ask either:
   `check/ui.js` measures whether a figure FITS, and a tutor shown the client's total measures
   perfectly; `check/press.js` presses the tiles wherever they are.

   THE SAME JOB, READ BY THREE PEOPLE — the client on it, the tutor on it, an admin — and the
   figures are the payload's as `doGet` sends them to an admin, so what is asked is the DRAWING:
   which label the total carries and which figures are under it. What `doGet` withholds from whom is
   `check-profile.js`'s question (section 10), asked of the real `doGet`. */
```

### AND THE FORM: an admin pricing a booking sees the Money block (docs/history/353); nobody else does.

top level, before `earn`

```
/* AND THE FORM: an admin pricing a booking sees the Money block (docs/history/353); nobody else does.
     The figures are `bookMoney_`'s own, over the owner's practical — 2 children, 2h, £30, kit £2 a child
     + £5 setup, markup 1.25 — so the rows are read off the real sum rather than a hand-made object. */
```

### ---------- THE MONEY BLOCK, THE DISCOUNT LINE AND THE FORMAT, ON THE REAL FORM (docs/history/353)

top level, before `w`

```
/* ---------- THE MONEY BLOCK, THE DISCOUNT LINE AND THE FORMAT, ON THE REAL FORM (docs/history/353) ------
     check-booking.js proves the sums with the owner's numbers; this proves who is SHOWN them. An admin
     pricing a practical with a £5 discount sees the discount line above COST, COST as a subtraction, the
     Materials row and the Money block; a parent with the very same answers — a draft carried across on
     one device included — sees none of it, is charged without the discount, and sends no discount
     field. And a trip draws no Venue row, and says there are no trips yet rather than a dash. */
```

### ---------- THIS JOURNEY HAS OUTLIVED TWO OF ITS OWN SUBJECTS

top level, before `w`

```
/* ---------- THIS JOURNEY HAS OUTLIVED TWO OF ITS OWN SUBJECTS ------------------------------------
     It began as "an admin can run the folder scan", and `scan-posts` left the app. It was rewritten
     to check that the post card told a client and an admin different things — "we check posts before
     they go up" — and that sentence left with the `Write a post` button, removed on request.

     THE HONEST MOVE THE SECOND TIME IS NOT THE SAME AS THE FIRST. The rewrite worked because the
     rule survived its button: somebody still had to be told their post was moderated. This time the
     surface itself is gone — there is no composer on this card and no door to one anywhere — so
     there is no wording left to protect, and a journey asserting a deleted sentence is a red that
     will never go green. Rewriting it to guard the deletion instead of mourning it.

     WHAT IT GUARDS NOW is the card's actual promise: the camera comes up on its own, there is a way
     in from the gallery, and nothing asks you to switch a camera on that is already starting. Put a
     start button back in the normal path and this objects. */
```

### ---------- `Write a post` IS A TILE NOW, AND WHAT THIS ASSERTS IS THE OPPOSITE

top level, before `out`

```
/* ---------- `Write a post` IS A TILE NOW, AND WHAT THIS ASSERTS IS THE OPPOSITE --------------
     THE LINE HERE WAS `if (/Write a post/i.test(html)) bad.push('… is back on the camera card')`,
     written the day it was removed on request. Taking it away left `on('new-post')` — the whole
     composer, the Drive folder picker, the link box, the poll — unreachable, and `check-doors.js`
     has reported it as its only HANDLER WITH NO DOOR ever since. It is back as a tile, because it
     is the answer to *"i would like to add more photos to my portfolio"*: there is no portfolio
     surface, the feed is the nearest honest reading, and a Drive link pasted into that composer
     lands in the posts SHEET rather than in this public repository.

     SO THE ASSERTION FLIPS AND GAINS A SECOND HALF. A door is not a door if nothing dispatches it,
     which is the fault the removal caused — so this asks for the `data-do`, not merely the words.
     What the OLD line was defending is still defended one line up: `Turn the camera on` must not
     come back, because that one was on the normal path rather than behind a failure. */
```

### ---------- THE CAMERA ASKS FOR NOTHING UNTIL SOMEBODY SWIPES UP TO IT

top level, before `NO_REACTIONS_`

```
/* ---------- THE CAMERA ASKS FOR NOTHING UNTIL SOMEBODY SWIPES UP TO IT ------------------------------
   REPORTED AS *"the website seems to ask you for permission to use camera when you first load into it
   even though the camera widget is above the front door widget. it should only go when you swipe to
   go up."* Reproduced: the payload's arrival calls `repaint`, and `repaint` runs `startScreen_`
   BEFORE `paintPager` — which is what moves the feed to its front door. For that moment the feed is
   still on page 0, page 0 IS the camera when the calendar has no festive card, and `feedCamWatch_`
   asked for it. The column then settled on the newest post with the prompt over it.

   NOTHING HERE HAD EVER STOOD IN FOR `getUserMedia`, which is why it was never caught. jsdom has no
   `mediaDevices`, so `camStart_` said "no camera support" and returned — and a camera that can never
   start cannot be caught starting early. So this stands in for it through `boot`'s `before`, counts
   the ASKS (each one is a prompt on a phone that has not said yes) and the streams still OPEN (each
   one is a recording light), because "asked once" and "left nothing running" are both the promise.

   EVERY WAY IN, each on a fresh app, because the fault depended on the first paint and a reused app
   has had its first paint:
     · signed in, no festive card — the reported case, where page 0 is the camera
     · signed out — no viewfinder, so nothing to ask for even on its own page
     · a festive card above the camera — the front door is page 2 and the camera page 1
     · a festive card and no post at all — nothing under the camera, so it must not be the front door
     · to another column and back — on a post it asks nothing; on the camera page that IS arriving
     · refused — a repaint on the camera page does not ask again behind your back; the button does
     · a prompt still up when a repaint lands — one ask, and the stream reaches the card on screen */
```

### ---------- WHAT `doGet` SENDS FOR A POST NOBODY HAS REACTED TO

top level, before `NO_REACTIONS_`

```
/* ---------- WHAT `doGet` SENDS FOR A POST NOBODY HAS REACTED TO ----------------------------------------
   THE SIX HOUSE FACES AND SIX ZEROES — `reactionSet` cannot return an empty list, so `doGet` cannot
   send `{}`. These posts said `reactions: {}`, which `reacts()` draws as no row at all, so every post
   seeded here was a post the app is never sent, and the row of faces was in none of them. A fixture
   must send what `doGet` really sends (CLAUDE.md). */
```

### AND LONGER ONLY WHEN THE ANSWER IS NOT IN YET -- for the waits that expect the camera TO be asked.

top level, before `camAsked_`

```
/* AND LONGER ONLY WHEN THE ANSWER IS NOT IN YET -- for the waits that expect the camera TO be asked.
   Inside a full `check-all` beside eight browsers and other worktrees' runs, 700ms of wall clock was
   not always past the slide: "swiping up asked 0 time(s)" on two runs in a row, a different case each
   time, and never when this journey ran alone. A wait that expects NOTHING to happen keeps the fixed
   700ms, because absence cannot be polled for. */
```

### ---------- A FESTIVE CARD AND NO POST AT ALL

top level, before `b`

```
/* ---------- A FESTIVE CARD AND NO POST AT ALL ---------------------------------------------------
     With nothing under the camera, "the page after the camera" does not exist, and `pageHome_`'s
     clamp put the column ON the camera — the reported prompt arriving by a second road. */
```

### ---------- REFUSED, THEN A REPAINT

top level, before `b`

```
/* ---------- REFUSED, THEN A REPAINT -------------------------------------------------------------
     The inbox landing and the profile refresh each repaint, and a repaint redraws the card — so a
     camera that was refused used to be asked for again by whatever landed next, which is a prompt on
     Safari that nobody swiped for. */
```

### ---------- THE PROMPT STILL UP WHEN A REPAINT LANDS

top level, before `b`

```
/* ---------- THE PROMPT STILL UP WHEN A REPAINT LANDS --------------------------------------------
     `CAM_STREAM` is null until somebody answers, so a repaint in that moment used to ask a second
     time — and when both were granted the first stream was overwritten and never stopped. */
```

### ---------- POST, UNDER A POST, IS A TILE — AND KEEPS ITS MARK THROUGH THE WAIT

top level, before `pat`

```
/* ---------- POST, UNDER A POST, IS A TILE — AND KEEPS ITS MARK THROUGH THE WAIT ----------------------
   ASKED FOR AS *"post should be a tile too"*. Three things are held, because each one is a way the
   change can be half done:
     · THE COMPOSER'S ONLY CONTROL IS A TILE. Every button in `.cmt-form` is a `.tile`, there is
       exactly one, and it is still `cmt-add` on the post's own id with the `cmt-go` name — the
       paper aeroplane drawn, and "Post" in its name, since a tile has no word on it.
     · AN EMPTY BOX POSTS NOTHING, which is the refusal `check/press.js` already accepts.
     · THE MARK SURVIVES THE ROUND TRIP. The handler used to write "Posting…" into the control and
       put the old text back afterwards — on a tile that writes over the aeroplane and restores an
       empty string. So the press is read twice: at once (busy, disabled, mark still in the
       element), and after a refusal (not busy, enabled, mark back, the server's sentence under the
       box) — the refusal because it is the path that keeps the same element rather than
       repainting it away. Then a comment that goes through posts `addComment` with the words. */
```

### ---------- A POST'S FACES, PRESSED, TAKEN BACK, AND ASKED WHO

top level, before `pat`

```
/* ---------- A POST'S FACES, PRESSED, TAKEN BACK, AND ASKED WHO ---------------------------------------
   THE ROW HAD NO JOURNEY AT ALL. Every seeded post here sent `reactions: {}`, which `reacts()` draws as
   nothing, so the faces, the count, "yours" and the who-reacted sheet were exercised by no check — and
   the fixture `check/ui.js` renders sent `{"👍": 3}`, a shape `doGet` has never sent, which draws
   nothing either. So when the owner said *"Also refine how the post reactions look. Looks abit
   scuffed"* (9 Oct), nothing in the repository had ever drawn the row it was about.

   WHAT IS HELD, each a way the redraw can go half done (docs/history/307):
     · ONE ROW OF SIX, and it is still six after a tap — the redraw replaces the row, it does not add one
     · A TAP ADDS YOURS: the face is `.mine` (second class, which `ACCEPTED_TAP` keys on), pressed for
       a screen reader, its count goes up, the TOTAL on the time line follows, `reactPost` carries the
       `personId`, and the face lands (`is-pop`) for that one paint and not for the next
     · THE SAME TAP TAKES IT BACK: no `.mine`, the count gone (a 0 is drawn as nothing), the total back
     · THE TOTAL OPENS WHO REACTED, most-used first and ties in the house order, yours the gold pill
       with your name first under it
     · SIGNED OUT, a face sends nothing and goes to sign in; the total still opens the sheet
     · THE FOCUS STAYS ON THE FACE PRESSED — through the add, the take-back and a failed save's undo —
       and a face pressed while focus was elsewhere does not take it. `repaint` replaces every button,
       and focus on a removed one falls to <body>: measured at 390, Enter on a focused face landed the
       reaction and left `activeElement` BODY, so a screen reader never heard the new `aria-pressed`
       and the next Tab went to a page parked off-screen (`reactRepaint_` in posts.js).
     · THE POST IS NOT REBUILT — the same `<article>`, the same pane, the same picture and the same
       clip after the add, the take-back and a failed save's undo. The owner, 10 Oct: *"When I click a
       reaction it bugs out a bit. On only some of them."* A face repainted the whole column, so every
       picture and clip on it was a new element: a clip stopped and went back to 0:00 behind a grey 4:5
       box, a picture the browser could not hand straight back blanked and held 4:5 until it was read
       again (a 16:9 card +183px at 390), a card taller than its pane was zoomed for the wrong height,
       and a scrolled pane went back to its top. Only the posts with something to rebuild showed it,
       which is "only some of them" (docs/history/335). So PO1 carries a picture AND a clip here, and
       the elements are held by identity: a press that goes back to `repaint()` fails on all three. */
```

### ---------- THE POST ITSELF, HELD BY IDENTITY THROUGH EVERY PRESS BELOW

top level, before `held0`

```
/* ---------- THE POST ITSELF, HELD BY IDENTITY THROUGH EVERY PRESS BELOW ---------------------------
     The card, the pane it sits in, and its picture and clip. Compared as ELEMENTS, not as markup: a
     rebuilt picture has the same `src` and none of its pixels, and a rebuilt clip the same `src` and
     none of its playing — which is the whole fault, and invisible to anything that reads the HTML. */
```

### ---------- A POLL VOTE REDRAWS THE POLL, NOT THE COLUMN

top level, before `pat`

```
/* ---------- A POLL VOTE REDRAWS THE POLL, NOT THE COLUMN ---------------------------------------------
   THE SAME FAULT AS THE FACES, ONE HANDLER DOWN. `on('vote')` called `repaint()` to move one bar, so a
   vote replaced the post and every picture and clip on the feed, exactly as a face did before the
   owner's *"When I click a reaction it bugs out a bit. On only some of them."* (10 Oct,
   docs/history/335). Fixed at the rule — a press on one post redraws that post's changed parts
   (`postRedraw_`, posts.js) — so it is held here for the vote too:
     · THE POST STAYS THE SAME ELEMENTS: its `<article>`, its pane, its picture and its clip, after a
       vote and after a refused vote's undo
     · THE POLL MOVES: yours ticked, "4 votes", `votePoll` with the `personId`
     · A REFUSAL PUTS IT BACK — your first answer still yours, "4 votes" — and says why
     · THE FOCUS STAYS ON THE ROW PRESSED, through the vote and through the undo: the poll's rows are
       replaced as a face is, and focus on a removed button falls to <body> */
```

### ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK MOVE NOTHING

top level, before `pat`

```
/* ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK MOVE NOTHING -----------------
   THE FIX ABOVE HELD FOR EVERY POST WITH A DATE AND FOR NO OTHER. A row typed into the posts tab by hand
   without `creation_date`, `posted_on` or `uploaded_date` arrives as `at: 0, when: ''` — and the empty
   feed asks for exactly that row. With no reactions yet it had no time line, so the first face had
   nowhere to put its total: `postRedraw_` fell back to `repaint()` and the whole column was rebuilt as
   before (a 16:9 card 428.5 → 689px at 390, a clip back at 0:00, the second tap of a double tap lost).
   Taking the last face back removed the line, and the card shrank 36.6px under the thumb
   (docs/history/335). Held here:
     · THE LINE IS THERE BEFORE ANYBODY REACTS — empty, holding the place a total goes
     · THE POST STAYS THE SAME ELEMENTS through the first face and the last taken back
     · THE LINE STAYS when the last face goes, empty again */
```

### ---------- TWO QUICK TAPS: ONE SAVE AT A TIME, AND THE PAGE AND THE SERVER END THE SAME

top level, before `pat`

```
/* ---------- TWO QUICK TAPS: ONE SAVE AT A TIME, AND THE PAGE AND THE SERVER END THE SAME --------------
   ONCE EVERY TAP LANDED, TWO OLD FAULTS WERE REACHABLE EVERY TIME (docs/history/335). The whole-column
   rebuild used to swallow the second of two quick taps and hid them both:
     · EACH TAP SENT ITS OWN SAVE AND EACH REFUSAL PUT BACK ITS OWN SNAPSHOT. 🎉 twice, both refused:
       the second refusal put back the first tap's 🎉 — gold again 1.3s after it was taken back, and
       "5 reactions" where there were 4. A poll ended ticked the same way.
     · THE SERVER'S ACTION WAS A TOGGLE. The first save refused and the second accepted, and the server
       held 😂 while the page showed nothing.
   The server here is played TWICE from the same requests — as `dopost.gs` is now (`want` is set) and
   as the deployed one may still be (a toggle on `emoji` / `choice`) — because the phone reaches the live
   site a step before the Apps Script project does, and it must land right on both. Held:
     · NO SECOND SAVE OF A POST GOES OUT WHILE THE FIRST IS UNANSWERED
     · BOTH REFUSED → the page as the server holds it, the total right, the server's reason said
     · FIRST REFUSED, SECOND ACCEPTED → the page and both servers the same
     · BOTH ACCEPTED → the second save goes after the first, carrying `want: ''`
     · TWO FACES QUICKLY → ends on the second, on the page and on both servers
     · THE SAME FOR A POLL: a refused double vote ends unticked, two answers quickly end on the second */
```

### THE OTHER HALF OF GUARDING THE CHILDREN LIST.

top level, before `p`

```
/* THE OTHER HALF OF GUARDING THE CHILDREN LIST. Restricting who receives it is only right if the
     people who need it still have it — and `friend-add` matches an EXACT handle, so a student with
     no list can never add anybody and the failure is silent: "Nobody has the handle …", which reads
     as the friend not existing rather than as the list not arriving. */
```

### A PAGE OPENED FROM A FILE HAS NO ORIGIN, and the browser refuses `fetch` to anywhere else before a single byte leaves — instantly, with "Failed to fetch".

top level, before `fs2`

```
/* A PAGE OPENED FROM A FILE HAS NO ORIGIN, and the browser refuses `fetch` to anywhere else
     before a single byte leaves — instantly, with "Failed to fetch". This is how the app is
     actually opened most days, and it went unnoticed for an afternoon because a refusal and a dead
     backend say the same words. The script-tag route is what makes it work; this is here so that
     route cannot quietly disappear again. */
```

### ---------- NOTHING OFFERS TO INSTALL, AND THE BROWSER IS NOT LEFT TO OFFER IT EITHER

top level, before `IPHONE`

```
/* ---------- NOTHING OFFERS TO INSTALL, AND THE BROWSER IS NOT LEFT TO OFFER IT EITHER -------------
   THIS SPOT HELD "the install bar reaches somebody who has not signed in", and that journey went
   with the bar — the owner, 6 Oct: *"delete the suggester telling to bookmark"*. What the bar left
   behind was worse than either answer. me.js went on catching Chrome's `beforeinstallprompt`,
   cancelling the browser's own install bar and KEEPING the event for `installCard` — which nothing
   drew, because its only caller was `meRest_` and only the dead `mePages` reached that. So an
   Android visitor got no offer from the app and none from Chrome, a door called `install` stayed
   wired for a button that never appeared, and the comment over it said the offer "stays where
   somebody can go looking for it … on the You screen". `check-doors` passed all of it: it pairs a
   `data-do` with a handler wherever the string is WRITTEN, and written is not drawn.

   DECIDED: NOTHING SUGGESTS INSTALLING. Chrome's own mini-bar is a suggester too, in the browser's
   handwriting, so it stays cancelled; the browser MENU's Install / Add to Home Screen is left for
   anybody who goes looking.

   ---------- AND THE FIRST VERSION OF THIS CHECK PROMISED MORE THAN IT ASKED ------------------------
   THE REVIEW OF ITS OWN ROUND GOT SIX MUTATIONS PAST IT, and each was a sentence in this comment
   that the code under it did not keep:
     · "counted, so anything that raises it later is seen" — `prompted` was read straight after a walk
       that never waits, so a held event prompted from a 50 ms timer stayed green;
     · "nothing on the page changes" — `takeRecords()` straight after the dispatch sees a SYNCHRONOUS
       redraw only, and the app's own idiom is a frame late: `setTimeout(repaint, 0)` and
       `requestAnimationFrame(repaint)` both stayed green while holding the event in a variable;
     · the two people were an iPhone signed out and an Android signed in, so an iOS-only "Tap Share,
       then Add to Home Screen" card on the signed-in You column — exactly where the old `installCard`
       drew its iPhone branch — had nobody to be drawn for;
     · it looked inside `#s-<id>` 300 ms after boot for one id and two words, so the old bar brought
       back the old way (appended to `<body>` a second after load, under another id) and a card
       worded like it ("Keep @family. on your phone", an Install button) under another door name
       both stayed green.
   So now it does what it says, and each of those is answered by a step below rather than by a name:
     1. FOUR PEOPLE, every pairing of signed in or out with iPhone or Android, signed in the way the
        app signs itself in (`familyUser` before the first line runs), all four at once so the waits
        overlap;
     2. THE PAGE IS LET GO QUIET FIRST — half a second with no mutation at all, measured: about two
        seconds with four booting together, and nothing moves after that for as long as it was
        watched. A page that never goes quiet says so and is NOT a pass, because a redraw for the
        offer could not then be told from one of its own;
     3. THE OFFER ARRIVES, AND THE PAGE IS WATCHED FOR 3.5 SECONDS — past a frame, past a timer, past
        the old bar's own three-second wait. Anything that changes in that window is the app acting
        on an offer, because nothing else moves;
     4. EVERY SCREEN IS DRAWN, then the WHOLE BODY is read, not one screen's box: an install door, the
        old bar's id, anything new hanging off `<body>` that the page did not start with, and the
        words an offer is made of — install, on your phone, add to home, home screen, bookmark;
     5. AND `prompt()` IS COUNTED LAST, after all of it, so a prompt raised late is a prompt seen. */
```

### A FEW WORDS EITHER SIDE, not the sentence:

top level, before `WORDS`

```
/* A FEW WORDS EITHER SIDE, not the sentence: `textContent` runs one element's text into the next
     with no space, so "up to the full stop" can be half a screen. Measured: none of these words is
     anywhere in the app's text for any of the four, so a hit is an offer and not a false alarm.
     THE OLD BAR'S OWN WORDS ARE ON IT. The round-2 review put the removed bar's second line, "Keep
     @family. handy. Opens like an app, no address bar.", on a Settings card, and "Save @family. to
     your phone" beside it — both green, because the list held its headline's "on your phone" and
     not its subtitle or a near variant. So `on`/`to`/`onto` your phone, `like an app`, `address bar`
     and the headline's `Keep @family.` are words too; measured, still none of them is in the app.
     AND THEN THE RULE RATHER THAN THE EXAMPLES. The round-3 review drew "Get the app", "Use @family.
     as an app — full screen, one tap away" and "Put @family. on the home row … open it with one
     tap" on the same card, all green, because the list had grown by the two phrasings it was shown.
     An offer to install says one of three things, and each is a family of words here: WHAT it would
     become (an app, a shortcut, an icon, standalone), WHERE it would go (home screen, home row, home
     page, your phone), and WHAT IT BUYS (full screen, one tap, no address bar) — plus any verb that
     puts @family. somewhere (add/save/pin/put/keep/get @family.). Measured over the rendered text
     of every screen for all four visitors: none of them is said anywhere, so `app` as a whole word is
     safe to name — the app never calls itself one on screen. */
```

### BEFORE THE APP RUNS, because a phone is a phone from its first line — anything asking the user agent at load must already get this answer — and somebody signed

in `before`

```
/* BEFORE THE APP RUNS, because a phone is a phone from its first line — anything asking the
         user agent at load must already get this answer — and somebody signed in is signed in from
         the first line too, the way a returning visitor is. */
```

### WHAT `<body>` HELD BEFORE THE APP DID ANYTHING.

in `ask`

```
/* WHAT `<body>` HELD BEFORE THE APP DID ANYTHING. Measured: the same eight elements from the
       first line to the end of a walk of every screen — only their classes change — so anything
       new directly under it is something the app hung there. */
```

### THIRTY SECONDS, NOT TEN.

in `ask`

```
/* THIRTY SECONDS, NOT TEN. Ten held alone and failed for every copy when eleven ran at once on four
       cores (the round-3 review): the boot of four apps together simply had not finished. A slow page
       is not an offer; only a page that NEVER settles is "not checked". */
```

### AND THE APP'S OWN DEFERRED WORK DONE:

in `ask`

```
/* AND THE APP'S OWN DEFERRED WORK DONE: since docs/history/341 a slide leaves its band wider than the glass
       until `trailEnd_` puts it back with one more placement, which can land after half a second of nothing —
       and then inside the three and a half seconds below, read as a page that moved for the offer. */
```

### THE ＋ CARD IS NOT THE FRONT PAGE.

top level, before `w`

```
/* THE ＋ CARD IS NOT THE FRONT PAGE. It is pane 0 of the feed because `unshift` puts it there,
     so opening at 0 opens on a form to make a post rather than on the newest post.

     THIS BROKE ONCE ALREADY AND SILENTLY. The home position was applied on the first `paintPager`,
     which runs while the app draws its first frame — before the payload, so the column was one pane
     long and the clamp pulled it back to 0, and the "already opened" flag then made that permanent.
     It looked exactly like the setting being ignored. Checked here so it cannot happen again. */
```

### SAME RENAME, AND THIS ONE FAILED SILENTLY RATHER THAN LOUDLY.

top level, before `host`

```
/* SAME RENAME, AND THIS ONE FAILED SILENTLY RATHER THAN LOUDLY. `#s-posts` is null, so `pages`
     was empty, so `pages.length > 1` was false and the journey returned no complaints — a pass,
     every run, having examined nothing. A check that cannot find its subject must say so; passing
     is the one answer it has not earned. */
```

### ---------- PROGRESS: BETWEEN SAVED AND TOOLS, ONE CARD SAYING SO, AND NOTHING ON IT TO PRESS

top level, before `cols`

```
/* ---------- PROGRESS: BETWEEN SAVED AND TOOLS, ONE CARD SAYING SO, AND NOTHING ON IT TO PRESS -------
   ASKED FOR AS "i want to add a new column for students to track their progress and everythinh. you
   can leave it at the end of the columns for now. just leave a place holder for now." The contest
   journey's two questions, asked of a column — arriving anywhere but LAST, and growing a control
   before there is anything behind it — and a third a column has and a widget does not: can a person
   get there.

   MOVED ON 21 OCT (docs/history/392): the owner's "more intuitive layout" put the columns in groups,
   and Progress went in with the learning ones, between Saved and Tools. So the journey now asks for
   the whole signed-out row as decided (`ORDER_392_`, Business left out), served from the real
   `data/settings/columns.json`; whether the file was read is asked of `DATA.columns`, because since
   392 `TAB_ORDER` says the same order and the row can no longer tell them apart.

   A SWIPE AS A TRACKPAD SENDS IT. Two fingers sideways is a `wheel` event, and `overworld.js` answers
   it with `ax.go(ax.at() + 1)` — the same call a finger's release makes — so this is the app's own
   gesture rather than `go('progress')`, which would reach the column whether or not anything sat
   next to it. Off Saved lands on Progress, and one more off Progress lands on Tools. The end that
   stays put is asked by the `business:` journey, on Settings, the last column a visitor has.

   THE SAME CARD FOR EVERYBODY until it was built — UNTIL 12 OCT, when "Your journey" came here off
   Settings for a student and an admin (docs/history/346). So all five are still asked, each for
   their own card: the placeholder, whole, for signed out, a parent and a tutor; the journey card for
   a student and an admin, one page, headed Your journey, not saying "Not built yet" beside it, and
   nothing on the column to press. A card that grew a role's control fails here either way. */
```

### A STUDENT'S AND AN ADMIN'S CARD IS THEIR JOURNEY:

top level, before `live`

```
/* A STUDENT'S AND AN ADMIN'S CARD IS THEIR JOURNEY: headed so, the one card on the column, and not
       the placeholder beside it — two "coming soon" cards about one thing would say it twice. Its
       rows and its countdown are not `drill`'s markup, so `placeholderFaults_` is not asked of it;
       nothing on the column to press is. */
```

### THE PANE, NOT THE COLUMN:

top level, before `pane`

```
/* THE PANE, NOT THE COLUMN: `#s-progress` holds the page and pane `pages()` wraps every card in,
       which are not the card's markup. The pane's contents are, and asking of the pane rather than
       of the card means a second thing drawn beside the card is caught as well. And a control
       anywhere else in the column is still a control, so the whole column is asked that one. */
```

### ---------- YOUR JOURNEY IS PROGRESS'S CARD, IT FOLLOWS WHOEVER SIGNS IN, AND THE WEEKLY EMAIL'S CARD IS GONE

top level, before `JOURNEY_DAY_`

```
/* ---------- YOUR JOURNEY IS PROGRESS'S CARD, IT FOLLOWS WHOEVER SIGNS IN, AND THE WEEKLY EMAIL'S CARD IS GONE ----
   THE OWNER, 12 Oct, with a screenshot of an admin's Settings ending on "Your journey" and "Weekly parent
   email: Off": *"This should be moved to appropriate column. Also the other widget regarding seeing weekly
   kids work or whatever sounds dumb delete that widget."* (docs/history/346).

   THE JOURNEY ABOVE SETS `USER` BY HAND AND PAINTS THE COLUMN BY HAND, which asks what each visitor's card
   is and nothing about whether the column is ever drawn again. It is now the one column whose card depends
   on who is signed in and is not on the column they sign in on, so the fault it can have is the last
   person's card — a parent shown the child's journey on the family iPad, or a student signing in to the
   placeholder until a reload. So this one goes the way a phone goes: the sign-in card, Sign out, the roles
   card's Save and About you's Save, and the column is left to draw itself.
     · signed out: the placeholder;
     · a student signs in: their journey, counting down to their big exam — and none on Settings;
     · they switch their role to Client on the roles card: the placeholder;
     · Sign out from Spotlight, a parent signs in: the placeholder, and no journey anywhere in the page;
     · the parent signs out ON Progress — the column in front, redrawn there and then — and the student
       signs in again: the journey, on the same document, with no reload;
     · the student moves their big exam on About you and presses Save: Progress, which is not in front,
       already counts to the new date;
     · an admin: the journey on Progress and not on Settings, and — every column drawn — no weekly parent
       email card, no Preview tile, no `digest-preview` handler, and nothing in the page naming either.
   EVERY PAYLOAD AFTER THE FIRST IS HELD, as in the business journey — the GET a sign-in, a role and a Save
   each ask for never answers — so whatever redraws Progress is the sign-in, the sign-out, the role or the
   Save itself, never a payload landing fifteen seconds later and redrawing everything. */
```

### ---------- THE BUSINESS RECORDS: A COLUMN OF THEIR OWN, LAST, AND ONLY AN ADMIN'S

top level, before `BIZ_COLS_`

```
/* ---------- THE BUSINESS RECORDS: A COLUMN OF THEIR OWN, LAST, AND ONLY AN ADMIN'S ------------------------
   THE OWNER, 10 Oct: *"the business checklist stuff should go in their own column at the end."* They were
   five cards at the foot of an admin's Settings (docs/history/207); they are `screen('biz')` now, the last
   column, for an admin and for nobody else (docs/history/334). Every way that can go wrong draws a
   perfectly good app: the column a swipe before Progress rather than after it; the five cards still on
   Settings as well; a Save that posts nothing; the column in a child's row of columns, or its section in
   a child's document with nothing in it; an admin who signs in and has to reload to see it, or signs out
   and keeps it; and the person on it when it goes left on a column that is not there.

   THE REAL columns.json IS SERVED, for the Progress journey's reason: the stub otherwise answers that
   file with the payload and the app runs on `TAB_ORDER`, an order no phone has. Each journey refuses to
   pass if the file was not applied — asked of `DATA.columns` since 392, when the code's order and the
   file's became the same row, with Business after Settings at the end of the You group. */
```

### THE RECORDS ARE ASKED BEFORE ANYBODY GOES THERE.

top level, before `n`

```
/* THE RECORDS ARE ASKED BEFORE ANYBODY GOES THERE. The column is drawn for an admin at boot, and on a
     wide screen it is on the glass beside Settings (Progress before 392); asked only on arrival, its first card sat under the
     loader until somebody swiped to it (*"these remain loading untill i scroll to them"*, 10 Oct). */
```

### A REMEMBERED `biz` (an admin's, on a shared phone) IS NOT A PLACE FOR THEM:

top level, before `home`

```
/* A REMEMBERED `biz` (an admin's, on a shared phone) IS NOT A PLACE FOR THEM: they open where a visitor
       with nothing remembered opens, `TAB_HOME`. IT WAS `AT !== 'biz'`, and that held with the boot's own
       `columnsFor_` deleted from shell.js: `biz` was still in `TABS` when the remembered id was read, so
       it was honoured, and the next `columnsFor_` moved them one column left — every visitor with an
       admin's tab in storage opened on Progress, and this line read OK. "Not Business" is two answers;
       the front door is one. And if the front door were ever Progress itself, the two could not be told
       apart, so that says so rather than passing. */
```

### ---------- AND A RELOAD ON BUSINESS PUTS AN ADMIN BACK ON IT

top level, before `w`

```
/* ---------- AND A RELOAD ON BUSINESS PUTS AN ADMIN BACK ON IT -----------------------------------------
   THE OTHER HALF OF THE BOOT'S `columnsFor_` (shell.js, over the `familyTab` read). The visitor journey
   above asks that a remembered `biz` is let go for anybody else; this asks that it is KEPT for an admin —
   `reload-build` reloads the page under somebody the moment a build lands, and an admin halfway through
   the insurance card must not be put on the Feed by it. It is also what proves the visitor journey's
   seeding reaches the app at all: a harness that never read `familyTab` would open everybody on the
   front door, and "a visitor opens on the Feed" would read OK for the wrong reason. No journey stood on
   this path; only a reviewer's Chromium driver had. */
```

### THE FAULT THIS PREVENTS.

top level, before `w`

```
/* THE FAULT THIS PREVENTS. Turning a site used to rotate the POLYGON and re-sample it against the
     tile grid — and re-sampling a shape at a different angle gives a different set of tiles. A T
     flattened into a line, and a ten-metre gap between a car park and a building closed. It looked
     like a rendering bug and it was an arithmetic one.

     Now the site is squared, measured, and rasterised ONCE, and the bearing turns the finished
     tiles a quarter at a time. That is a relabelling rather than a measurement, so the shape cannot
     change — and this checks that it does not, because "cannot" is a claim worth testing. */
```

### ---------- WHAT A TUTOR TEACHES: ONE CHIP A SUBJECT, ITS LEVELS RAISED

top level, before `w`

```
/* ---------- WHAT A TUTOR TEACHES: ONE CHIP A SUBJECT, ITS LEVELS RAISED ---------------------------
   *"what they teach should appear like Subject ^level, level, level. so like the levels are
   superscripted. no brackets."* The server sends one phrase per level, so the grouping is the
   card's, and every way it can go wrong draws perfectly: a subject twice in one row, a bracket left
   in, a level that was the specialism dragged out from under the gold edge, or the reverse. So this
   draws two tutors through the app's own `findCard` — one off the current backend, one off a
   backend old enough to send a single `teachesMain` string — and reads every chip back. */
```

### ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE

top level, before `w`

```
/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE ------------------------------------------------
   *"for the qualifications bit, should be for example Maths subscript to it is grade and super script
   is the level."* `profQualChip_` in cards.js draws the subject with the level raised over the grade
   lowered on its right, off the `qualsParts` the server sends. Every way this goes wrong draws: the
   grade raised and the level lowered, a certificate turned into notation, the place quietly dropped
   instead of moved into the name, a level alone sinking to the subject's line, a second Maths drawn
   away from the first, or a phone that waits on a backend deploy to draw anything at all. So one
   tutor is drawn through the app's own `findCard` with each case, and one off an older backend.
   The STACKING is a layout question jsdom cannot answer — that is `check/states.js`'s
   "a tutor's qualifications, written like isotopes", measured by `check/ui.js` in a real browser. */
```

### A LAW THAT COLOURS A TWO-WORD SUBJECT COLOURS IT WHOLE.

top level, before `D`

```
/* A LAW THAT COLOURS A TWO-WORD SUBJECT COLOURS IT WHOLE. The chip holds the subject's last word to
     its stack with a no-wrap span, and the first build made that split BEFORE colouring — `mark` on
     "English" and on "Language" apart, so a `laws` row naming "English Language" matched neither half
     and the subject went uncoloured; "longest first" in `mark` exists to stop exactly that. A `word`
     or `regex` law is a row anybody with the sheet can add today, so this is not waiting on the
     retired subject list. Wanted: the coloured span reads the whole phrase; a law on "Maths" alone
     still leaves "Further" outside the held word, so a long subject can still break between words. */
```

### ---------- THE LIBRARY CARDS ARE ON TOOLS NOW (docs/history/339)

top level, before `libOpen_`

```
/* ---------- THE LIBRARY CARDS ARE ON TOOLS NOW (docs/history/339) --------------------------------------------------
   THE OWNER, 11 Oct: *"move library card widget to the tools column."* Every journey below draws them where they
   are now — the `libcards` widget on Tools (`initLibCards_` in me.js) — and asks of them what it asked of the
   Settings page: the same shelf, the same boxes, the same fifteen fields through the same `updateProfile`, no
   drafts. `libOpen_` signs in, turns to Tools and repaints it, which starts every widget on it at once (an
   arrival starts the ones near the page in front first), and hands back the widget's form. */
```

### ---------- AND THE LIBRARY CARDS CARRY NO NOTE, WHATEVER THE BACKEND SAYS

top level, before `libs`

```
/* ---------- AND THE LIBRARY CARDS CARRY NO NOTE, WHATEVER THE BACKEND SAYS ------------------------
   *"for the library card widget, there doesnt need to be a add note to it."* The current backend no
   longer lists `library_note`; the deployed one does, so this plays that older server and wants the
   shelf drawn and the note box not — on the page, not merely absent from the code. And Settings, which the
   cards left, does not keep a Library cards page holding nothing but that note (`notLibrary_`). */
```

### ---------- EACH LIBRARY CARD IS DRAWN AS A CARD, AND ITS BARS ARE ITS NUMBER'S (docs/history/332)

top level, before `LIB_FIELDS_`

```
/* ---------- EACH LIBRARY CARD IS DRAWN AS A CARD, AND ITS BARS ARE ITS NUMBER'S (docs/history/332) ---------
   THE OWNER, 10 Oct, with a screenshot of this page: *"make each look like a card. with fake barcode."* So a
   slot is a card face holding its own three boxes, with an `aria-hidden` barcode worked out from the number
   (`libBars_` in me.js), and nothing about what it saves changed. On Tools since docs/history/339 (`libOpen_`,
   above). Three journeys, each a question the
   change could have broken: is each entry one card with its boxes ON it; do the bars follow the number
   and only the number; and does the page still save the fifteen fields, reveal the next card, and treat a
   reload as it did — every other box on the column kept as a draft, no box of a library card ever one,
   because the PIN is on it (`setDraftOk_`). Invented libraries, numbers and PINs only: the repository is
   public, and `0000` is the only PIN it holds. */
```

### ---------- THE LIBRARY CARDS ARE A TOOL FOR EVERYBODY SIGNED IN, AND HOLD WHAT IS TYPED (docs/history/339)

top level, before `libs`

```
/* ---------- THE LIBRARY CARDS ARE A TOOL FOR EVERYBODY SIGNED IN, AND HOLD WHAT IS TYPED (docs/history/339) -----------
   THE OWNER, 11 Oct: *"move library card widget to the tools column."* Who saw the Settings page is who sees the
   widget — everybody signed in (every role's map carries the group), nobody signed out — and it is the last tool,
   appended (it sat after the hours until the review of 339 found it moving pages on sign-in). A card is not
   drafted (its PIN is on it), so what
   keeps typing is the hold: a form with typing in it is not redrawn by the payload landing on Tools, nor by the
   widget being started again, and `myProfile` landing redraws a clean one from the sheet's copy. */
```

### AND THE REST OF THE COLUMN IS NOT RESTARTED OVER ITS OWN MARKUP (`startScreen_`'s hold, shell.js) — a repaint `paint` declined, so what runs on Tools is still

top level, before `calc`

```
/* AND THE REST OF THE COLUMN IS NOT RESTARTED OVER ITS OWN MARKUP (`startScreen_`'s hold, shell.js) — a repaint
     `paint` declined, so what runs on Tools is still running; a restart is a second `start` over the same markup,
     the notepad's caret moved and every widget stopped and started in one task. Counted on the calculator, whose
     `start` is looked up by name when it runs (the review of 339: no check could see this hold). */
```

### ---------- THE REVIEW OF docs/history/339: WHERE THE LIBRARY CARDS SIT, AND WHAT THEY SAY WITH NOTHING TO DRAW

top level, before `w`

```
/* ---------- THE REVIEW OF docs/history/339: WHERE THE LIBRARY CARDS SIT, AND WHAT THEY SAY WITH NOTHING TO DRAW --------
   `PAGE.tools` remembers a page by its index (the note over `legotrade` in map.js), so nothing may go in ABOVE an
   existing tool — and the library cards went in straight after the hours with a gate that opens on signing in, so
   somebody on the calendar who signed in was turned to Practice, and back on signing out. They are appended last;
   this asks it the way a person meets it: on a tool, through the app's own sign-in and Sign out. */
```

### A PAYLOAD WHOSE ROLE MAP HAS NO LIBRARY GROUP — an older server, or `GROUPS_OLD_` with no `profileFields` at all — said

top level, before `bad`

```
/* A PAYLOAD WHOSE ROLE MAP HAS NO LIBRARY GROUP — an older server, or `GROUPS_OLD_` with no `profileFields` at all —
   said "The library cards have not arrived from the server yet." under a payload that had arrived and never would
   carry them. It says the older-server sentence the card editor says for the same case. */
```

### THREE SMALL BRANCHES NOTHING ASKED.

top level, before `W`

```
/* THREE SMALL BRANCHES NOTHING ASKED. "Manage your child" with the payload still coming draws the loader, not "No child
   is linked" over a list a moment away; a parent whose role map leaves no group on Settings is told where things went
   on Signing in, the next card there is. */
```

### ---------- A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN, QUIETLY

top level, before `RC_PAYLOAD_`

```
/* ---------- A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN, QUIETLY --------------------------------
   THE OWNER, 9 OCT, with a phone screenshot of the orange "Could not reach the backend … timeout" bar
   over Find: *"I don't like when this happens I would rather site just refreshed itself."* See
   `RECONNECT` in shell.js. These journeys stand in for the network at the one place it fails — the
   payload's GET — and leave every other request to the stub above:
     'timeout'  the deadline's own rejection (an `AbortError` called `timeout`), without waiting sixty
                seconds for it
     'fetch'    "Failed to fetch", a phone with no signal
     'html'     Apps Script's own error page, the "Authorization is required" case
     'refuse'   `{ error }` — doGet's answer to a refusal AND to any exception, asked again slowly
     a promise  the request held until the journey lets it through (and what it resolves to, below)
     { body }   that payload rather than the stub's
     anything else (or nothing): the payload, as on every other journey
   `asked` is every payload GET in order, so "asked again" is a count rather than an impression.
   THE PAYLOAD CAN EDIT AND DELETE A POST, because the stub's `features: []` raises the "backend at this
   URL cannot editPost" banner on every success — a true banner about a different thing, and one that
   would stand where these journeys ask whether ANY banner is up. */
```

### ASKED AFTER THE CLOCK MOVED, read off the request's own `_=` stamp rather than counted:

top level, before `bad`

```
/* ASKED AFTER THE CLOCK MOVED, read off the request's own `_=` stamp rather than counted: three
     windows booting at once can hold this journey's event loop for seconds, long enough for the
     three-second rung to come round first — which made "two requests" a race this journey lost
     whenever the suite was busy, before and after the review alike. */
```

### A REFUSAL IS ASKED AGAIN — but slowly.

top level, before `bad`

```
/* A REFUSAL IS ASKED AGAIN — but slowly. doGet's last line answers ANY exception with `{ error }`, so the
   client cannot tell a throw that will pass from a refusal that will not (review, 9 Oct). Three and a
   half seconds is past the fast rung a fault on the way would have been asked on; `online` is the quick
   way to the next ask, and that one answers. */
```

### A RETRY IS THE ONLY REQUEST THIS APP EVER LEAVES IN THE AIR ON ITS OWN, so it is the one that can be overtaken:

top level, before `open`

```
/* A RETRY IS THE ONLY REQUEST THIS APP EVER LEAVES IN THE AIR ON ITS OWN, so it is the one that can be
   overtaken: a pupil signs in while it is out, the sign-in's load answers first, and then the retry —
   asked as nobody — lands on top of it. Before retries a load was always one somebody had just asked
   for; this is the race they brought. */
```

### ---------- A REPLY IS CHECKED AGAINST WHOM IT WAS ASKED FOR, AND AN ASK THAT WAITED IS NOT LOST

top level, before `open`

```
/* ---------- A REPLY IS CHECKED AGAINST WHOM IT WAS ASKED FOR, AND AN ASK THAT WAITED IS NOT LOST --------
   Found by review, 9 Oct. SIGNING OUT CALLS NO `load()`, so the generation counter the race above was
   first written against never moved for it: an admin signed out while a retry carrying their token was
   in the air, the retry landed, and the signed-out phone held the admin's payload — films, Drive links
   and `viewerIsAdmin`. See `loadStale_`. */
```

### AND THE SAME, WHEN THE REPLY HAS ARRIVED AND IS WAITING FOR THE LIBRARY.

top level, before `open`

```
/* AND THE SAME, WHEN THE REPLY HAS ARRIVED AND IS WAITING FOR THE LIBRARY. The check against whom it
   was asked for ran as the reply was read — before `data/questions.json`, which on a first load over
   a slow line is seconds behind — so a sign-out inside that wait still committed the admin's payload. */
```

### "THE ONE IN THE AIR BOOKS WHAT COMES NEXT" — and it did not, when the one in the air had been overtaken:

top level, before `open`

```
/* "THE ONE IN THE AIR BOOKS WHAT COMES NEXT" — and it did not, when the one in the air had been
   overtaken: a sign-in's load failed and booked its ask three seconds out, the ask came round while the
   overtaken retry was still out and stood down for it, and the retry landed, saw it was stale, and
   booked nothing. "Reconnecting…" for good (review, both reviewers, separately). */
```

### AND THE SAME PERSON'S PAYLOAD IS NOT THROWN AWAY FOR BEING LATE.

top level, before `open`

```
/* AND THE SAME PERSON'S PAYLOAD IS NOT THROWN AWAY FOR BEING LATE. Try again while a retry is out, its
   own request failing fast, and then the retry answering well: the counter that moved on every load
   dropped it as a stranger's, and asked nothing after (review, s9 — 150 seconds of "Reconnecting…"). */
```

### ---------- WHILE IT ASKS, AN EMPTY COLUMN SAYS IT IS WAITING

top level, before `bad`

```
/* ---------- WHILE IT ASKS, AN EMPTY COLUMN SAYS IT IS WAITING ------------------------------------------
   Found by review: the Feed, Shop and Spotlight drew "Couldn't load. timeout. Try again" under the line
   saying "Reconnecting…" — and for an HTML reply, Apps Script's own "Authorization is required" on a
   student's screen. Its Try again put the splash back up. */
```

### THE ONE LOADER, not "Waiting for the server" — a waiting sentence of its own until 9 Oct

top level, before `l`

```
/* THE ONE LOADER, not "Waiting for the server" — a waiting sentence of its own until 9 Oct
       (`nothingHere`; the owner: *"they should all have a simplistic simple loading thing"*). The quiet
       line over the app is what says the app is asking again. The Spotlight column, because it is
       empty for everybody until the payload lands — a visitor's Feed is the camera and "Sign in". */
```

### ---------- AND EVERY CARD THAT WAITS ON THE PAYLOAD WAITS THE SAME WAY WHILE IT IS ASKED FOR AGAIN

top level, before `open`

```
/* ---------- AND EVERY CARD THAT WAITS ON THE PAYLOAD WAITS THE SAME WAY WHILE IT IS ASKED FOR AGAIN -----------
   FOUND BY REVIEW (10 Oct), every script.google.com request aborted, an admin at 390: the columns drew the
   loader through `nothingHere`, which knew about the retry — and in the same moment the Times Tables board
   said "Scores have not arrived yet." and My teaching hours "The hours have not arrived from the server
   yet", because each asked `!LOADED`, and `LOADED` is true once the first request has failed. Both fill
   in by themselves when the retry lands, so both are waits: `awaiting_()` (shell.js) is the one question
   now. Each card is turned to, as a finger turns to it, and waited for (bounded) before it is read; then
   the retry is let through, and each must show what the payload brought instead of the dots. */
```

### ---------- AND A FIXED SENTENCE IS NOT A WAIT

top level, before `openV`

```
/* ---------- AND A FIXED SENTENCE IS NOT A WAIT ---------------------------------------------------------
   FOUND BY REVIEW: signed out, with the payload held, the Booking column drew the loader for the whole
   wait — up to the minute's deadline — where its one sentence, "Sign in to book", needs nothing from
   the payload. Account, Saved and Messages drew their sign-in cards at once. Signed in, the form does
   need the payload, and waits for it. */
```

### ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN

top level, before `open`

```
/* ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN ------------------------
   Found by review at 390x844 with touch: writing in the Tools notepad, a retry succeeded, the column was
   rebuilt, and the focus — and the next key — went with it. See `landRepaint_`. */
```

### AND NOTHING IS TYPED UNTIL THE NOTEPAD HAS STARTED — its veil off, which `widgetUp_` does after its `start`.

top level, before `sl`

```
/* AND NOTHING IS TYPED UNTIL THE NOTEPAD HAS STARTED — its veil off, which `widgetUp_` does after its
     `start`. The `start` writes the account's notes back into the box, and this journey writes its words
     with `.value`, which no `input` event follows, so a start landing after them put back "". It did once
     in ten on the commit before 10 Oct (docs/history/306 recorded it: "the notepad's start landing after
     the journey had written into it") and four times in nine on the branch for note 331, with the
     arrival's start landing at any moment in a two-second window: `quiet()` says yes while the
     after-slide jobs are still running from the list `afterSlide_` has already emptied, so `woken_` was
     no guard. A person cannot type into a box whose widget has not started — the veil is over it — so the
     journey waits for exactly that. */
```

### ---------- COMING BACK TO THE PAGE WITHIN SECONDS OF A FAILED ASK

top level, before `mended`

```
/* ---------- COMING BACK TO THE PAGE WITHIN SECONDS OF A FAILED ASK -------------------------------------
   "Flicking between apps is not five asks" put the ask off to whatever was booked — and on the slow
   rungs that is two minutes away, so a backend mended in between was not seen for two minutes despite
   "coming back to the page asks at once" (review, s6). It waits for the five seconds, no longer. */
```

### ---------- AND A PAGE THAT OPENS OLDER THAN THE SITE REFRESHES ITSELF, ONCE

top level, before `staleBoot_`

```
/* ---------- AND A PAGE THAT OPENS OLDER THAN THE SITE REFRESHES ITSELF, ONCE ----------------------------
   The same screenshot's footer: "site 06 Oct at 14:32 · css 2026-10-09-…" — a three-day-old index.html
   under that morning's stylesheet. See `bootStale_`. `LOAD_AT` is what index.html reads from its own
   `Last-Modified`; the HEAD `buildTag_` sends is answered here with the server's. jsdom cannot navigate,
   so the reload is counted at the one place it would happen. */
```

### "IT CANNOT LOOP" RESTED ON A WRITE NOBODY READ BACK — found by review:

top level, before `implSymbol`

```
/* "IT CANNOT LOOP" RESTED ON A WRITE NOBODY READ BACK — found by review: storage that refuses `setItem`
   and answers `getItem` with null (a full store; Safari's private mode before iOS 11) reloaded on every
   boot of a page that stayed stale. See `buildMark_`. */
```

### ---------- THE PICTURE IS A DOOR EXACTLY WHILE THE PEN IS OFF

top level, before `w`

```
/* ---------- THE PICTURE IS A DOOR EXACTLY WHILE THE PEN IS OFF -----------------------------------
   REPORTED AS "for questions where you have to draw on it it doesnt work as when you are drawing
   its moving the widget itself". Measured with real touch events on Q7 of the June 2024 Foundation
   paper, before anything was changed: with the pen off a stroke across the grid took the app from
   `stuff` to `dm` sideways and back a page downwards, and drew nothing.

   THAT HALF IS BY DESIGN AND MUST STAY. `touch-action: none` on a region taller than the phone is a
   region you cannot swipe past, so a pad that took the finger before being asked would trap you on
   a box-plot grid. What was missing is that nothing said so: the remedy was a grey button among
   three, and the picture — a blank grid, the most inviting thing on the card — looked exactly like
   paper. So the picture carries the action while the pen is off, and `PRESS_MOVED` in shell.js
   keeps a DRAG from being a press, which is what lets the column still move.

   FOUR ATTRIBUTES AND TWO WRITERS. `padWrap_` builds them and the press mutates them in place, so
   they exist in two places by construction — and a half-armed pad is the invisible mode the gold
   frame was added to prevent. The sharp one is the `data-do` on the art: left on while the pen is
   ON, the dispatcher walks up from the ink to it and the first dot anybody draws turns the pen off
   again. Nothing else in the suite can see that — `check/press.js` presses each action once and
   `check/ui.js` measures geometry, and a pad that disarms itself measures perfectly. */
```

### ---------- AND THE REPAINT PATH, ASKED THE SAME QUESTION

top level, before `on`

```
/* ---------- AND THE REPAINT PATH, ASKED THE SAME QUESTION -------------------------------------
     `padArm_` being right is not enough: a card is rebuilt on every repaint, so a `padWrap_` that
     emitted the action on an ARMED pad's picture would put the fault back the moment anything
     repainted — which on this screen is a keystroke in the search box. */
```

### ---------- A RULER AND A COMPASS ON THE PEN, WHERE THE QUESTION ASKS FOR THEM

top level, before `w`

```
/* ---------- A RULER AND A COMPASS ON THE PEN, WHERE THE QUESTION ASKS FOR THEM -------------------------
   ASKED FOR AS *"some questions require a compass or ruler. so should have a tile for these things. if
   you cant find those questions dont worry just have the infrastructure set up for it."* Through the
   real pointer listeners and the real handlers, on a pad in the document whose picture is TWICE AS
   WIDE AS IT IS TALL -- the shape on which a circle drawn in the ink's stretched units comes out an
   ellipse, which is the one way a compass here can be wrong while looking right on a square grid:
     * which tools: `padTools_` from `needs` and from the words -- a ruler alone, ruler and compasses,
       a construction, nothing for a plain drawing, nothing for "plotting compasses" or "12 rulers",
       and a protractor decided but not drawn (there is no such tool). The bar draws exactly that.
     * Ruler: pressing it arms the pen and lights it; a drag from A through anywhere to B keeps ONE
       stroke of two points, A and B, under `padKey_`, and a card drawn again draws it
     * Compass: pressed on the centre and dragged out, a CLOSED ring -- first point the last -- every
       point the dragged radius from the centre in SCREEN pixels; and swung through a quarter turn,
       an open arc of a quarter turn at the width it had when the swing began
     * the point and the width are shown while dragging and gone after; a tap is a slip, kept nowhere
     * Undo takes the compass's ring off and then the ruler's line; the pen still draws freehand
     * a stale choice cannot draw: a compass left in `PAD_TOOL` for a pad whose bar has no Compass is
       the pen */
```

### ---------- A SWIPE SETTLES AT THE FINGER'S SPEED, WRITTEN ON THE COLUMNS AND NOT THE ROOT

top level, before `w`

```
/* ---------- A SWIPE SETTLES AT THE FINGER'S SPEED, WRITTEN ON THE COLUMNS AND NOT THE ROOT ------------
   ASKED FOR AS *"refine the swiping to feel more stable"*, and measured before it was touched: every
   release wrote `--slide` on `<html>`, which re-styled about three thousand elements before the card
   could move (100-200ms frozen at 4x CPU), and the curve it fed left at 7 to 47 times the finger's
   speed. Nothing here can time a frame, so the rule is the two facts the fix rests on: the curve's
   starting slope IS the release speed, and the settle is written on the columns — never the root. */
```

### A card D px from where it is going, released at v px/ms.

top level, before `c`

```
/* A card D px from where it is going, released at v px/ms. A `cubic-bezier` leaves at y1/x1 times
     its average speed, and the average is D over the duration — so the card leaves at the finger's
     speed exactly when y1/x1 = |v| x duration / |D|. Four releases, one of them fast enough that
     `x1` has to shrink to say it. */
```

### ---------- THE AGE RANGE ON A TUTOR'S CARD, AND EVERY HALF OF ONE A ROW CAN HOLD

top level, before `w`

```
/* ---------- THE AGE RANGE ON A TUTOR'S CARD, AND EVERY HALF OF ONE A ROW CAN HOLD ----------------
   ASKED FOR AS *"tutors should also be able to state an age range of people they are willing to
   work with."* The card is the half a parent sees, and the rows it reads were often typed into the
   sheet by hand with one end filled in — so the rule is every shape, not the one the form produces.
   Asked of `profAges_` and then of the card itself, because a chip computed right and never drawn is
   this repository's oldest silence. */
```

### ---------- A FRACTION ON A CARD IS DRAWN OVER ITS LINE, IN ALL FIVE PLACES A CARD DRAWS MATHS

top level, before `w`

```
/* ---------- A FRACTION ON A CARD IS DRAWN OVER ITS LINE, IN ALL FIVE PLACES A CARD DRAWS MATHS ----
   ASKED FOR AS "it shouldnt be 4/5 it should be 4 over the five like how it is supposed to be."
   `check-typeset.js` proves `typeset_` stacks a fraction; it cannot prove the CARD calls it, and a
   card that typesets the part and forgets the answer draws half its fractions slanted, which is
   exactly what the owner kept seeing. So this builds one card through the app's own
   `questionCard_` with a stored fraction in the stem, the lead, the part, the answer and both
   choices, and asks each region of the drawn card for its stacked fraction.

   AND THE MARKER'S COLUMN COMES OUT UNTOUCHED. `accept` is what a typed answer is compared with,
   and the typesetter must never see it: a `5/9` stacked into spans in `data-accept` would mark
   every right answer wrong. */
```

### ---------- THE ANSWER IS ITS RESULT, AND NOTHING ELSE

top level, before `w`

```
/* ---------- THE ANSWER IS ITS RESULT, AND NOTHING ELSE ----------------------------------------------
   ASKED FOR AS *"Also remove all 'why's. I just want it to have answer."* -- after 259 had folded the
   working under a "Why" and 263 had put the answer on its own page. `check-answers.js` proves
   `answerParts_` splits right and every library result is short; it cannot prove the PAGE draws only
   the head, and a page that typesets the result into `.qans-body` and the working under it passes
   every rule there while showing exactly the paragraph the owner asked to lose. So, through the
   app's own builders:
     * the result in `.qans-body`, codes off it, nothing of the working in it
     * no `.qans-why`, no `<details>`, no `.qans-more`, no `.qans-note` -- and none of the working's
       words or the examiner's note anywhere in the page's text
     * "Show the answer" on the hidden page draws exactly that, and nothing more
     * the working is still IN THE ROW: Mark with AI sends `answer` and `examinerNote` as the scheme
       (`aiScheme_`), and an answer page that stopped drawing them must not have stopped sending them */
```

### WHAT A PAGE OF A QUESTION SAYS IT IS, read back off its tags.

top level, before `tagF`

```
/* WHAT A PAGE OF A QUESTION SAYS IT IS, read back off its tags. Every tag is a facet answer since 18 Oct
   (docs/history/355) and carries its facet in `data-f`, so `tagF` is one facet's text ('' where the row
   has none), and `pageNum` puts the number back together the way the card's reference reads -- [Q5] [a]
   [ii] [1] [of 2] is `Q5a(ii) · 1 of 2` -- so the journeys that held the joined number tag hold the same
   five facts. `pageHead` is the What kind answer and that number: `Questions Q4a`, `Answers Q4a`. */
```

### ---------- MARKING AND REVEALING LEAVE THE QUESTION WHERE IT IS

top level, before `w`

```
/* ---------- MARKING AND REVEALING LEAVE THE QUESTION WHERE IT IS -----------------------------------
   ASKED FOR AS "make it nice more sleek, fresh stable". jsdom lays nothing out, so the PIXELS are
   `check/states.js`'s to measure ("marked not yet, nothing moved" and its two siblings, in a real
   browser at four widths). What only this harness can hold cheaply is the half that comes first:
   the handlers must not REBUILD or INSERT anything above or around the answer. A Check that redrew
   the card, or a verdict that arrived as a new element, would shift the question in a way no CSS can
   take back -- and both have been this file's faults elsewhere (the `REEL_HELD` repaint).

   So on a real card, through the real handlers: the header, the tags and the question are the SAME
   nodes with the same markup after Check, a wrong Check, typing, Check again, "Show the answer" and
   a tapped option; the card's own children are the same list in the same order; and the verdict
   writes into a slot that was already there. And typing after a verdict takes it off -- "Correct"
   beside an answer that has since changed is the app vouching for something it never read.

   AND A WRONG TAP SHOWS NO ANSWER: the pick, "Not yet", and no option ticked -- a right tap ticks the
   pick and nothing else. Here because the tapped card is already here. */
```

### REVEALED -- by Show on the answer page, which is the page a swipe after the card.

top level, before `shutX`

```
/* REVEALED -- by Show on the answer page, which is the page a swipe after the card. The question's
     own row has no way to it any more (*"there doesnt need to be a scroll down tile on questions"*,
     8 Oct), and showing the answer must not change the card it belongs to. */
```

### TAPPED -- `qp-choose` redraws the box from the stored pick and finds its question by key in the library, which this harness does not load; so the library is

top level, before `mc`

```
/* TAPPED -- `qp-choose` redraws the box from the stored pick and finds its question by key in the
     library, which this harness does not load; so the library is this one question for the length of
     the tap, and put back straight after. */
```

### A MISS DOES NOT SHOW THE ANSWER.

top level, before `shownBy`

```
/* A MISS DOES NOT SHOW THE ANSWER. It ticked the right option beside it, which is the answer on the
     question card with nobody pressing Show -- *"answers should just stay hidden unless user unhides
     them."* Nothing ticked, and no words that name or point at the right one. */
```

### AND THE FIGURE IS ON THE CARD, WHERE THE PAPER PRINTS IT, AND NOTHING POINTS AT A PAGE (356):

top level, before `fig`

```
/* AND THE FIGURE IS ON THE CARD, WHERE THE PAPER PRINTS IT, AND NOTHING POINTS AT A PAGE (356): a marker at
     the end of its words puts it after them, no marker and no lead in front of them -- and no card says
     "Figure on the next page", which was the owner's *"graph widget below"*. */
```

### ---------- A FRACTION, TYPED ON THE KEYPAD, MARKED RIGHT

top level, before `w`

```
/* ---------- A FRACTION, TYPED ON THE KEYPAD, MARKED RIGHT --------------------------------------------
   ASKED FOR AS "make the input better … like hegarty maths … desmos". keypad.js says how; this presses
   it the way a thumb would, through the real handlers, on a real question card: the box keeps the
   phone's keyboard out (`readonly` and `inputmode="none"`), the pad has the keys the owner listed, the fraction is
   drawn STACKED with a dashed slot while it is still empty, and ✓ runs Check — against a scheme of
   `0.75`, so the keypad's `(3)/(4)` has to go through the bracket fold in `markNorm_` and `markFrac_`'s
   "or equivalent" to be marked right. A worded question beside it is the pad's box too, on the
   letters -- *"I just want self contained system really"* (8 Oct). */
```

### ---------- THE BOX IS A CHAT BAR WITH A SEND TILE

top level, before `bar`

```
/* ---------- THE BOX IS A CHAT BAR WITH A SEND TILE ----------------------------------------------------
     *"the answer box should look like a chatbox. with send tile."* (8 Oct.) The structure the stylesheet
     and the handlers lean on: the field and Send side by side in `.qp-bar`, Send a gold `.tile.is-send`
     that is still `.qp-check` (the name ✓ and every check find it by) with the paper aeroplane on it, and
     the verdict a line of its own UNDER the bar but inside `.qp-mark`, where `qp-check` looks for it. */
```

### ---------- AND ⌫ NEVER LEAVES HALF A BRACKET

top level, before `paired`

```
/* ---------- AND ⌫ NEVER LEAVES HALF A BRACKET ----------------------------------------------------------
     MEASURED ON 8 OCT: `123/(4)` then ⌫ was `123/(4` -- the `)` taken on its own -- and the next key made
     it `123/(46`, the stray half keypad.js promised a student would never have to find. Now a filled pair
     is stepped into, not broken: ⌫ after `)` moves the caret inside and deletes nothing. Pressed until
     the box is empty, from three starts, and at every press the brackets still pair. */
```

### AND A WORDED ANSWER IS WORDS, ON THE PAD'S LETTERS -- it was the phone's own keyboard until the owner, 8 Oct:

top level, before `wd`

```
/* AND A WORDED ANSWER IS WORDS, ON THE PAD'S LETTERS -- it was the phone's own keyboard until the
     owner, 8 Oct: *"Make the keypad never need to use their own keyboard … I just want self contained
     system really"*. A textarea still (an answer typed before may hold a newline), but the pad's: in a
     `.kp-field.kp-words` under its drawing, `readonly` and `inputmode="none"`, and focusing it opens
     the pad on the letters. */
```

### ---------- A REDRAW WITH THE KEYPAD UP KEEPS TYPING INTO THE SAME QUESTION

top level, before `w`

```
/* ---------- A REDRAW WITH THE KEYPAD UP KEEPS TYPING INTO THE SAME QUESTION -------------------------------
   THE OWNER, 8 Oct: *"they keypad was a bit unstable. it wasnt working at first for some reason."* Signing
   in runs `repaint()` and `load()` lands about fifteen seconds later and repaints again, and each replaces
   the card -- and the box the child is typing in. jsdom, like WebKit on the iPad, fires NO `focusout` for a
   removed element, so before the fix the pad stayed up naming a box that was gone, and the 5 pressed after
   the redraw was lost without a trace while the box on the screen still said 7. Measured red on the commit
   before this one. The redraw here is what `repaint` does to a card: its markup replaced. */
```

### ---------- NO ANSWER BOX CAN BRING UP THE PHONE'S KEYBOARD, ON ANY ROUTE

top level, before `one`

```
/* ---------- NO ANSWER BOX CAN BRING UP THE PHONE'S KEYBOARD, ON ANY ROUTE ----------------------------------
   THE OWNER, 8 Oct: *"Make the keypad never need to use their own keyboard the key pad seems to allow ios
   keyboard to show I just want self contained system really"*. Counted that day, the iPad's keyboard came
   up on every worded box and every worksheet box (plain textareas), and from `abc` on every maths box,
   which set `inputmode="text"` on purpose -- and WebKit's own source says `inputmode="none"` alone
   leaves a hardware keyboard, Scribble and Scan Text a way in, where `readonly` does not (keypad.js).

   SO THE RULE IS ASKED OF EVERY KIND OF BOX A QUESTION'S PAGES DRAW -- a maths answer, an explain
   answer, a short worded one, a drawing question's card AND its pen page, a passage to ring words in,
   and a practical's worksheet -- and of every route the pad has: a box focused, `abc`, `123`, a
   redraw under the pad (`kpLive_`), Enter, ✓. Every text field there must be the pad's box, locked in
   its markup (`readonly`, `inputmode="none"`) inside its drawing; and a MutationObserver over the whole
   document says whether ANY script touched either attribute on the way, which is what the old `abc`
   did. And the same promise asked of the source: nothing in js/ writes `inputmode` or `readonly` by
   script, so a new route cannot be opened without this saying so. */
```

### AND THE SOURCE: nothing that ships writes `inputmode`, `readonly` or `contenteditable` by script.

top level, before `Q`

```
/* AND THE SOURCE: nothing that ships writes `inputmode`, `readonly` or `contenteditable` by script. `abc`
     was exactly that.

     EVERY SPELLING OF THE WRITE, NOT TWO OF THEM. The review of 8 Oct added one line to keypad.js --
     a double tap calling `toggleAttribute('readonly', false)` and `setAttribute('inputMode', 'text')`
     -- and this stayed green: the pattern knew `setAttribute`/`removeAttribute` in lower case and
     `.readOnly =`, and an HTML attribute name ignores case, `toggleAttribute` unlocks as surely as
     `removeAttribute`, and a backtick or a bracket write is the same write. The MutationObserver above
     sees only the routes this journey walks, so a double tap or a long press is the source's to catch. */
```

### AND ONLY `kpField_` DRAWS AN ANSWER BOX.

top level, before `BOX`

```
/* AND ONLY `kpField_` DRAWS AN ANSWER BOX. Every box that saves as an answer carries `data-do="qp-ans"`
     (the `input` listener in find.js) and `.qp-ans-in` (what Send and Mark with AI read), and today
     `kpField_` is the one place that writes either -- locked. A new kind of card that drew its own field
     would only be asked about here if this journey were taught to draw it; written outside `kpField_`,
     it fails now, whoever draws it. A selector that FINDS a box (`[data-do="qp-ans"]`, `.qp-ans-in`) is
     a read and is not counted. */
```

### ---------- THE LETTERS ARE TYPED, SAVED AND MARKED; 123 IS THE MATHS KEYS; A LAPTOP STILL TYPES

top level, before `w`

```
/* ---------- THE LETTERS ARE TYPED, SAVED AND MARKED; 123 IS THE MATHS KEYS; A LAPTOP STILL TYPES ------------
   WHAT THE PHONE'S KEYBOARD DID FOR A WORDED ANSWER, DONE BY THE PAD (8 Oct). Pressed through the real
   handlers on a short answer whose scheme is a word: the letters land in the box, a capital comes by
   itself at the start, the answer is saved under `ansKey_` by the same `input` listener, and ✓ marks it
   right through `qp-check` -- `markNorm_` lowercases, so "Egestion" is "egestion". `123` is the maths
   face, whose 5 types into a worded box; ⇧ once is one capital and twice is caps lock; ⌫ in prose
   deletes a bracket like any letter. And a laptop: `readonly` stops the browser typing, so its keys go
   through the pad's own edit -- letters, Backspace, ←, Shift+Enter, Enter, a paste -- each one's own
   default cancelled, and what `readonly` took from a text box is put back: ⇧ with an arrow selects,
   Ctrl+Z and Ctrl+Y walk the box's own history, a cut cuts, AltGr types. And the pad's other promises:
   a worded answer filled from another device is drawn as the words it is, never typeset; the signs row
   is on a box whose scheme needs one, and on no other -- a worded box's on its `123` face. */
```

### THE START OF THE ANSWER IS CTRL+HOME SINCE 9 OCT:

top level, before `ctrlKey`

```
/* THE START OF THE ANSWER IS CTRL+HOME SINCE 9 OCT: Home alone stops at the start of the line the
     caret is in (`kpLineStart_`, keypad.js), which here, just after the Shift+Enter, is the second line
     -- the review of 9 Oct measured Home jumping from an essay's third paragraph to its first word. */
```

### AND WHAT `readonly` TOOK FROM A LAPTOP, PUT BACK -- the review of 8 Oct measured each one gone:

top level, before `L`

```
/* AND WHAT `readonly` TOOK FROM A LAPTOP, PUT BACK -- the review of 8 Oct measured each one gone: ⇧ with
     an arrow moved the caret and dropped the selection; Ctrl+Z did nothing, so Ctrl+A and a letter lost a
     paragraph; Ctrl+X did nothing; AltGr (Ctrl+Alt on Windows) dropped `€`. */
```

### AND ON A WORDED BOX THAT NEEDS ONE.

top level, before `wi`

```
/* AND ON A WORDED BOX THAT NEEDS ONE. The review of 8 Oct: eleven marked questions -- `x < 4 or x > 5`,
     `93.5 ≤ length < 94.5`, `6:18 pm` -- have a word in their scheme, so they are WORDS boxes, and the row
     was drawn on maths boxes only; neither face had `<` or `:`, and no way the marker accepts could be
     typed. Its letters stay five rows; `123` has the row; the answer typed across both faces is marked right. */
```

### ---------- MARK WITH AI: OFFERED WHERE IT CAN BE RIGHT, AND QUIET WHERE IT CANNOT

top level, before `bad`

```
/* ---------- MARK WITH AI: OFFERED WHERE IT CAN BE RIGHT, AND QUIET WHERE IT CANNOT ---------------------
   ASKED FOR AS "add gemini marking system for worded questions." The backend half is
   `check-aimark.js`; this is the phone's. Through the real `qp-ai` handler and the real `api()`, with
   the harness's `fetch` playing the server: what is sent (the question, the scheme, the answer, the
   marks and the person by ID — `check-post.js`'s rule), what is drawn from the reply, that typing
   takes a verdict off, and that a server with no key greys the button rather than leaving a control
   that does nothing. And the two ways it is not drawn at all: a deployment without the action, and a
   payload that says there is no key. */
```

### NO KEY ON THE SERVER:

top level, before `mode`

```
/* NO KEY ON THE SERVER: one press, then no AI button on the screen presses any more, and each says why.
     SINCE 9 OCT THE TILE BECOMES THE PLAIN SEND where it stands, signed in: an answer reaches the account
     when it is sent (js/submit.js), and a greyed tile left the box with nothing to send it with. */
```

### ---------- AN ESSAY IS WRITTEN ON A SHEET, IN PARAGRAPHS, AND MARKED WHOLE

top level, before `ID`

```
/* ---------- AN ESSAY IS WRITTEN ON A SHEET, IN PARAGRAPHS, AND MARKED WHOLE -----------------------------
   THE OWNER, 9 Oct, about a pupil on AQA English Language Paper 1, June 2017, Section B -- forty marks
   of creative writing: *"firstly it doesnt let him do paragraphs and also i want it to mark with ai.
   gemini."* The REAL row (Q-R0398-5) out of data/questions.json, through the real loader and
   `questionCard_`, pressed through the real handlers:
     · it is a SHEET and not the chat bar: `ansEssay_` says so, the box is the pad's locked textarea
       marked `data-kp-essay`, Mark with AI is a tile in the row under it with the word count;
     · the pad's letters carry ONE return key, labelled, twelve columns wide on the space bar's row --
       and the bottom row is the maths pad's own again;
     · two paragraphs typed on the pad's keys and its return, a third on a laptop's Enter: the value
       holds `\n\n`, the drawing keeps it, the count is right; Shift+Enter is a new line too, and
       Ctrl+Enter puts the pad away;
     · Mark with AI sends the WHOLE answer -- 6,000 characters pasted in arrive whole, flagged as an
       essay, out of 40 -- and draws the marks and the points as lines;
     · a SHORT worded box is still the bar, Enter is still ✓ there, and its ↵ is still in the bottom row;
     · with AI marking off, the sheet says so in one faint line to a pupil signed in, and to nobody
       else; and no control is drawn that does nothing.
   AND WHAT THE REVIEW OF 9 OCT FOUND, each asked here: the mark and its points are KEPT while the essay
   is revised -- "before your changes" after a key, fresh again on undo, and drawn again by a window
   that never saw the reply (a reload) -- where one space used to wipe them; a Maths "show that" worth
   six is not an essay; the hint stays on a blank sheet with the pad up; Home and End stop at the
   paragraph; the essay's ✓ says "done"; and the sparkle has its name beside it. A backend that does not
   say `aiMarkWhole` is the next journey's.
   jsdom lays nothing out: the sheet's height, the pad's 44px and the line kept in view are
   `check/states.js`'s ("an essay, three paragraphs on its sheet, the pad up"), measured by check/ui.js. */
```

### ---------- AND THE MARK IS A SUBMISSION, like every Mark with AI (note 308)

top level, before `latest`

```
/* ---------- AND THE MARK IS A SUBMISSION, like every Mark with AI (note 308) ----------
     The merge with the essay sheet found its kept mark returning before the press was recorded, so the
     forty-mark answers the sheet exists for were the one kind never sent to the account. */
```

### ---------- A KEY TYPED AFTER THE MARK KEEPS IT, SAID TO BE STALE

top level, before `aiBox`

```
/* ---------- A KEY TYPED AFTER THE MARK KEEPS IT, SAID TO BE STALE ----------
     It took the mark and every point off, and a reload lost them (the review of 9 Oct): the points are
     what the pupil revises from. So: "before your changes" and no ring, the points still there; undone
     back to the marked text, fresh again. THIS WAS "a return typed takes the mark off", the chat bar's
     rule, which is still asked of a short box by the Mark-with-AI journey above. */
```

### ---------- THE ACCOUNT'S COPY ARRIVING FROM ANOTHER DEVICE SAYS IT AGAIN, AND NEVER BLANKS IT

top level, before `said`

```
/* ---------- THE ACCOUNT'S COPY ARRIVING FROM ANOTHER DEVICE SAYS IT AGAIN, AND NEVER BLANKS IT ----------
     `ansRefresh_` puts a value in with no `input` event and took every verdict off, which on an essay
     left the points under an empty line and the sheet still ringed stale. The marked text arriving: fresh;
     other text: "before your changes"; the points under it both times. */
```

### ---------- A BACKEND NOT YET PULLED IS SENT NO ESSAY IT WOULD CUT

top level, before `ID`

```
/* ---------- A BACKEND NOT YET PULLED IS SENT NO ESSAY IT WOULD CUT -----------------------------------------
   THE REVIEW OF 9 OCT, the must-fix: GitHub Pages serves the new front end a minute after a push, and the
   backend changes only when the owner pulls it into the Apps Script editor. Until then the live `aiMark`
   is in `features`, cuts the answer at 2,000 characters and ignores `essay` -- so the phone drew Mark with
   AI, posted a 6,000-character essay, and showed the mark for its first third as the essay's. The new
   backend says `aiMarkWhole` (doget.gs); without it the phone sends nothing over 2,000 characters and
   says why, spending none of the day's marks -- and an essay under 2,000, which either backend reads
   whole, still goes. The real Q-R0398-5 through the real handler. */
```

### ---------- THE ANSWER IS ITS OWN PAGE, AND NOBODY READS IT UNTIL THEY ASK

top level, before `w`

```
/* ---------- THE ANSWER IS ITS OWN PAGE, AND NOBODY READS IT UNTIL THEY ASK --------------------------
   ASKED FOR AS *"what I want was answers to be short and to be their own widget"*, and then *"you
   should have to click to reveal the answer. Should behave the same whether it's a tutor or child. No
   difference between the two."* `check-answers.js` holds what an answer SAYS; this holds where it is
   and who can see it, through the app's own builders:
     * the page exists exactly when there is an answer -- [q, ans], [q, fig, ans], [q], [q, fig]
     * the question card keeps its box and no longer carries the answer, in any form
     * the answer page is hidden and the answer is NOT IN ITS MARKUP (the old `is-shut` hid with CSS an
       answer anybody could read in the document)
     * the answer page is the page a swipe after its question in the strip, and nothing on the question
       card turns to it -- the ↓ `To the answer` tile went on 8 Oct, *"there doesnt need to be a scroll
       down tile on questions"* -- and landed on it is still hidden; the page's own Show tile opens it,
       the open survives a redraw (the `REEL_HELD` fault: a fact left on an element dies with it), and it
       opens only that question. Hide, and every role alike, are the next journey's
     * a tapped question settled right does NOT open it, and neither does a typed answer marked right:
       the card already says "Correct", and a page that opens itself is a reveal nobody pressed
     * a TUTOR's page is hidden exactly as a student's, and their question card has no tile to it
       either -- it was open without asking, behind a tile that read "The answer"
     * Saved, which draws a kept thing through `cardPages_`, keeps the answer page after the figure
   Turning the page is a real browser's question -- `check/states.js`, "the answer, turned to from
   its question" -- because jsdom lays nothing out and has no library to page through. */
```

### SWIPED TO: the page after the question card in the strip, with no kind chosen -- AND STILL HIDDEN.

top level, before `heldF`

```
/* SWIPED TO: the page after the question card in the strip, with no kind chosen -- AND STILL HIDDEN.
     *"answers should just stay hidden unless user unhides them"*: reaching the page is a swipe, and
     revealing it is the page's own tap. The strip is the app's own (`stuffPages_`) over these two. */
```

### ---------- SHOW, HIDE, SHOW: ONE TILE ON THE ANSWER PAGE, THE SAME FOR EVERYBODY

top level, before `w`

```
/* ---------- SHOW, HIDE, SHOW: ONE TILE ON THE ANSWER PAGE, THE SAME FOR EVERYBODY -----------------------
   ASKED FOR AS *"answers should just stay hidden unless user unhides them. and can hide them again.
   simple is best."* Through the real handlers, on a real answer page in the document, for four
   visitors -- signed out, a student, a tutor, an admin -- each starting from nothing shown:
     * hidden: "Answer hidden", the answer NOT IN THE MARKUP, and the one tile is Show (the eye)
     * Show: the answer drawn, and the same tile slot now Hide (the eye struck through) -- the tile row
       is the same child of the card in both states, so the thumb finds Hide where it pressed Show
     * Hide: hidden exactly as before, answer gone from the markup, Show back in the slot
     * Show again: open again -- the toggle is not a one-way door
     * drawn afresh after a Hide it is hidden (`ANS_SHOWN` forgot), after a Show it is open, and the
       next visitor's page is hidden whatever the last one did
     * the question card has no tile to the answer for any of them (*"there doesnt need to be a scroll
       down tile on questions"*, 8 Oct), and drawing it reveals nothing */
```

### THE FOCUS FOLLOWS THE TOGGLE.

top level, before `named`

```
/* THE FOCUS FOLLOWS THE TOGGLE. `ansSet_` replaces the card, so the tile that was pressed is gone;
       from a keyboard the focus has to land on the tile that replaced it rather than on `<body>`. And
       ONLY from the card that held it: a Hide with the focus somewhere else leaves it there. */
```

### ---------- A QUESTION'S PAGES IN THE PAPER'S ORDER, AND A FIGURE NAMED AS THE PAPER NAMES IT

top level, before `w`

```
/* ---------- A QUESTION'S PAGES IN THE PAPER'S ORDER, AND A FIGURE NAMED AS THE PAPER NAMES IT ----------
   ASKED FOR AS *"preserve order of question from exam while at the same time giving diagrams and
   figures their own widget"* and *"diagram widgets shouldn't have a question number on them"*. Through
   the app's own builders, on a question shaped like Q3 of AQA Biology 8464/B/2H -- a stem that names
   Figure 3 and carries it, then parts, one of which has its own drawing it calls Figure 4:
     * the stem is its own page (`stemN`), then its figure (`sfigN`), then the first part -- ONCE: the
       next part along does not draw them again, but a part with nobody in front of it does
     * the strip (`stuffPages_`) reads stem, figure, (a), (a)'s answer, (b), (c), (c)'s own figure
     * the part's card no longer carries the stem; every page of the part -- its stem, its figures,
       its card -- wears the part's own tags, the same row (docs/history/355: the stem's `Q3` with no
       part, a figure page's `Figure 3` and its missing number were each a rule of their own)
     * the answer is the page a swipe after the CARD, not after the first page -- which stopped being
       the same place when a stem could stand in front -- and with `Questions` chosen it is not in the
       strip at all, while the stem and its figure still are (8 Oct, `questionsView_`). */
```

### ---------- A PAGE TOO LONG FOR A PHONE IS CUT BETWEEN PARAGRAPHS, AND THE ASK STAYS WITH ITS BOX

top level, before `w`

```
/* ---------- A PAGE TOO LONG FOR A PHONE IS CUT BETWEEN PARAGRAPHS, AND THE ASK STAYS WITH ITS BOX -------
   ASKED FOR AS *"each widget is smaller than a phone screen"*. `check/cards.js` measures the pixels
   over the whole library; this holds the rules of the cut, through the app's own builders:
     * a part that fits is one card, in the wrappers it always had (`.qsheet-lead`, `.qsheet-pb`)
     * a long part is `pre0`, `pre1`... and then the card, every word once and in order, the LAST
       paragraph (the ask) on the card with the box, the pre pages with no box and saying "continued"
     * a long stem is `stem0`, `stem0-1`... and then its figure; only its first page carries `lines`
     * a table is never cut, and one block longer than a page stays whole rather than being broken
     * the answer is still the page a swipe after the card, past any pre pages in front */
```

### THE CUT RUNS FROM THE END:

top level, before `n`

```
/* THE CUT RUNS FROM THE END: the card has the box and the tiles to make room for, so it takes the
       ask and only what fits beside them -- here the ask alone, the table too heavy to join it. Cut
       from the front instead, the card is whatever was left over: the last steps, the table and the
       ask, which is the long card this exists to stop. */
```

### ---------- EVERY FIGURE WHERE THE PAPER PRINTS IT, IN ITS QUESTION'S CARD (356)

top level, before `w`

```
/* ---------- EVERY FIGURE WHERE THE PAPER PRINTS IT, IN ITS QUESTION'S CARD (356) --------------------------
   It was its own page (268, 270: *"text, then diagram, then text ... diagram has its own widget"*); the
   owner's 18 Oct word put it back in its card (*"there's also like a graph widget below"*). Through the
   app's own builders: the owner's sentence -- stem text, the stem's figure, (a)'s text, (a)'s figure, (a)'s
   ask -- is now the stem's page (its words, its figure) and (a)'s card (its words, its figure, its ask), in
   that order and with no figure page; a marker, a lead and neither place the figure by digest.gs's rule; a
   figure never stands on a page alone; a figure under a pen is on the CARD, however long the words before
   it; the marker is never drawn. */
```

### ---------- A DRAWING IS THE PERSON'S WHO MADE IT, AS A TYPED ANSWER IS

top level, before `w`

```
/* ---------- A DRAWING IS THE PERSON'S WHO MADE IT, AS A TYPED ANSWER IS -------------------------------
   Found by the multi-part audit: the pen's marks and the ringed words were kept per PHONE
   (`pad:<question>`) while the answer box beside them was kept per person (`ansKey_`), so Ben, signing
   in after Ali on the same phone, found Ali's lines already on his grid. Through the app's own builders
   and handlers:
     * signed out the key is the phone's, `pad:<question>`, as it always was; signed in it carries who,
       `pad:u:<id>:<question>`, on the pad's `data-k` and the passage's `data-circ` -- the attributes
       every handler writes through
     * the phone's old marks MOVE to the first person signed in who opens them: drawn on their pad,
       stored under their key, and gone from the old one, so the next person opens a clean grid
     * never over marks somebody already has; the phone's marks wait for a person with none
     * a second person sees none of the first one's, and Undo on their pad takes only their own mark
     * the first person signed in again gets theirs back
     * ring for ring, the same for a passage */
```

### ---------- A DRAWN ANSWER IS DRAWN ON ITS OWN FIGURE, IN ITS OWN CARD (docs/history/356)

top level, before `ID`

```
/* ---------- A DRAWN ANSWER IS DRAWN ON ITS OWN FIGURE, IN ITS OWN CARD (docs/history/356) -------------------
   THE OWNER, 18 Oct, over June 2024 1F Q7 with a box, a Draw switch and its grid a page away: *"why would
   there be an option for text answer in the first place?"* The REAL row through the real loader:
     * its pages are [pre0, card, ans]: the table it reads on pre0, then ONE card holding the grid as a
       `.qpad` inside `.qsheet`, with no box, no keypad field and no Draw tile, and no figure page
     * a stroke on that pad is kept under `padKey_` -- the key every drawing already made lives under */
```

### ---------- AND OVER THE WHOLE LIBRARY: NO FIGURE PAGE, NO POINTER, EVERY FIGURE ONCE

top level, before `LIB`

```
/* ---------- AND OVER THE WHOLE LIBRARY: NO FIGURE PAGE, NO POINTER, EVERY FIGURE ONCE -----------------------
   Every question in data/questions.json, in the strip's order, through `pageParts_` and the page builders:
   no question has a `fig`, `sfigN`, `use` or `nofig` page; no page says "Figure on the next page"; and
   every diagram a part or its stem carries is drawn exactly once across the strip -- in a card, a stem's
   page or a page in front -- or, where a part's pen is on its stem's figure, once under that pen (the
   Figure tile's overlay copy is not a page). */
```

### THE ONLY REPEATS: parts whose rows each carry the same picture as their own (each draws it in its card); a stem's figure under each part whose pen is on it

top level, before `owners`

```
/* THE ONLY REPEATS: parts whose rows each carry the same picture as their own (each draws it in its
         card); a stem's figure under each part whose pen is on it (each pen is its own answer); and a part
         reading an earlier part's marks, which shows that picture again with them. */
```

### ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH (`qtDrawn_` and its marker since round 3; was `answerKinds_`)

top level, before `IDS`

```
/* ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH (`answerKinds_`) ------------------
     * the KS1 hexagon (a blank space and an accept) shows its surface AND its box, with no switch
     * GPS1-2 (answer_type drawing, with options) shows its options and no pen: it is answered by choosing
     * KS2 2019 P2 Q13 ("Draw the full-size triangle accurately") is a pen over its own figure, with a
       ruler and a protractor asked for */
```

### ---------- A PLACE KEPT ON A FIGURE PAGE REOPENS ON ITS ITEM'S CARD

top level, before `w`

```
/* ---------- A PLACE KEPT ON A FIGURE PAGE REOPENS ON ITS ITEM'S CARD ------------------------------------------
   A kept place from before 18 Oct names a part that no longer exists (`fig`, `sfigN`, `use`, `nofig`). It
   must land on the same item's card, not the first page of the list. */
```

### ---------- "USE YOUR GRAPH" SHOWS YOUR GRAPH

top level, before `w`

```
/* ---------- "USE YOUR GRAPH" SHOWS YOUR GRAPH -----------------------------------------------------------
   Found by the multi-part audit, finding 5: June 2024 2F Q24(c) "Use your graph to find estimates..."
   had no picture, and the graph was the child's own, on (b)'s grid, two swipes back. A part's `uses`
   names the earlier part whose drawing it needs (tools/set-uses.py). Through the app's own builders and
   handlers, with the library stood in by `stuffItemsAll_` as the tapped-answer journey does:
     * a part with no picture gets a page IN FRONT of its words, after its opening: the earlier part's
       picture, headed with that picture's own name and no question number, the marks on it, no pen, no
       control, no box, and no line under it (355)
     * whoever is signed in: another person sees their own (none)
     * straight after the earlier part's own figure page too: that page is the paper's picture with no
       marks since the pen moved to the card (337), so the page in front is the only place they are
     * on Saved too (`cardPages_`), and the answer is still the one swipe after the card
     * a part whose own figure IS that picture gets no page: its figure page shows the earlier marks, read
       only and with no pen, and its card's drawing face carries them UNDER its own pen (337: the pen is
       on the card) -- its Undo takes its own mark and never the earlier one; a part that only LOOKS at
       that picture gets them on its copy, with no pen
     * a chain on one picture is one picture: (d) uses (c) uses (b) uses (a) shows all three's marks
     * a loop ends, and a part naming no such part draws exactly what it did
     * found in review, after the Figure tile and the "not drawn yet" page met this: the Figure tile on
       (c) shows (b)'s picture WITH this person's marks, not (b)'s empty grid; a part that uses a drawing
       on a surface ("Use the graph" after (a) drew on axes) is never also "not drawn yet"; and the page
       in front wears (c)'s own tags and says nothing under the picture: "Your drawing", "Your marks from
       Q24b", "Nothing drawn on Q24b yet" and "The fainter marks are yours from…" went on 18 Oct with every
       credit and caption (docs/history/355) */
```

### ---------- FIND DRAWS THE SAME THING FOR A TUTOR, AN ADMIN, A STUDENT AND SOMEBODY SIGNED OUT

top level, before `read`

```
/* ---------- FIND DRAWS THE SAME THING FOR A TUTOR, AN ADMIN, A STUDENT AND SOMEBODY SIGNED OUT --------
   ASKED FOR AS *"No distinction between tutor and student on the finder. All the same. Remove any
   nuances about that."* -- and before it, of the answer: *"Should behave the same whether it's a tutor
   or child. No difference between the two."* The differences that were there (an answer page open for
   staff, a tile reading "The answer" for them, a gold Spotlight tile for an admin on every question and
   practical) each looked deliberate where it was written, which is why the rule is asked of the whole
   family at once rather than of each in turn.

   EVERY PAGE OF A QUESTION FAMILY, drawn by the app's own builders for four visitors -- signed out, a
   student, a tutor, an admin -- and compared as markup: a stem with words both sides of its figure, a
   part with a lead, a figure and a box, its answer page hidden and then shown, a tapped question, a
   worded one with Mark with AI beside it, a drawing question on a squared grid, a passage to ring words
   in; and a real practical, project and content card (with its animation's page) through the real mapper.

   WHAT IS ALLOWED TO DIFFER IS WHAT IS A PERSON'S, NOT A ROLE'S, and it is taken out before comparing:
   the answer box's key and the done date's (`ans:u:<id>:`, whose drawer this is), the name over the box
   ("Ada's answer" / "Your answer"), and the star (`fav`) and the verdict's slot beside it
   (`.qcard-verdict`, see `questionTiles_`), which need somebody signed in to keep them for. AND THE PLAIN
   SEND (`qp-send`) on a box nothing marks, with the verdict line it brings — there is an account to send
   to only when somebody is signed in (js/submit.js). AND WHERE THE WORK IS KEPT —
   the line under a box and the pen's note say "on this device", or which account (js/answers.js) —
   which is whether somebody is signed in, never which role they hold.
   Anything else that differs is a role showing through, and the first difference is printed. */
```

### AND THE SAME ITEMS: nothing on the learning surface is offered to one role and not another — BUT ONE, BY NAME.

top level, before `BIBLE_KEY`

```
/* AND THE SAME ITEMS: nothing on the learning surface is offered to one role and not another —
     BUT ONE, BY NAME. *"i want to add the bible to resources as a book. but only admin can see the
     bible."* is the owner asking for exactly one difference, so this expects it exactly: an admin's
     list is everybody else's plus `bible:kjv`, and nobody else's has it. Anything else that differs
     is still a role showing through. ONE PAYLOAD FOR EVERY ROLE HERE, deliberately: the films were an
     admin's too, decided by `doGet` leaving them out of everybody else's payload (and they are not in
     Find for anybody since 10 Oct), so with the payload held still the only difference left is one the
     phone made — which is what this asks. */
```

### ---------- EVERY CONTROL ON A QUESTION'S PAGES IS A TILE

top level, before `p`

```
/* ---------- EVERY CONTROL ON A QUESTION'S PAGES IS A TILE ------------------------------------------------
   ASKED FOR ONE AT A TIME AND THEN ALL AT ONCE: *"check button should be a tile."*, *"lock should be a
   tile too. same as undo and clear. it should all be tiles."* The house rule said a FORM has buttons,
   and the pen's bar, Check and Mark with AI were argued as a form's; the owner overruled it for this
   surface, so the rule is asked of the whole family at once rather than of whichever control somebody
   remembered.

   EVERY PAGE OF A QUESTION FAMILY, through the app's own builders, signed in so the star is drawn too:
   a stem with its figure, a part with a box and Check, a tapped question, a worded one with Mark with AI,
   a maths one on the keypad's box, a drawing question on a squared grid (pen off AND on -- the armed bar
   is drawn by a different branch), a pen question asking for a ruler and compasses, a passage to ring
   words in, and every answer page hidden and shown. Every `<button>`, every `[data-do]`, every
   `role="button"` and every link must be a `.tile` -- or one of the exceptions, each named where it is
   drawn with the reason:
     a multiple-choice option     the answer being given, with its own words and maths (`choiceBox_`)
     a key on the maths keypad    a keyboard (`kpKey_`) -- drawn on the body, listed for completeness
     a word in a passage          the answer being given, where the sentence put it (`circWords_`)
     the picture under the pen    the pen's second door while it is off (`padArm_`), not a control
     the answer box itself        a field, which is typed into rather than pressed
   And the tiles the owner named must actually be there, so a family that drew none cannot pass. */
```

### ---------- EVERY FACT ABOUT A PAGE OF A QUESTION IS A TAG, IN ONE ROW AT THE TOP

top level, before `w`

```
/* ---------- EVERY FACT ABOUT A PAGE OF A QUESTION IS A TAG, IN ONE ROW AT THE TOP ------------------------
   ASKED FOR AS *"why do the questions say non calculator but its not a tag? also the marks should also
   be a tag. also the question numbers should also be a tag."* and *"why is ks2 sats one tag? it should be
   sats."* -- and then, 12 and 18 Oct, ONE RULE for all of them (docs/history/355): every tag is a finder
   answer, through `tagRow_`, the same row on every page of an item. Through the app's own builders, on
   the five pages that make a question:
     * the tag row is the card's FIRST block, and nothing of the old head is left -- no gold header
       (`.qcard-top`), no subtitle (`.qcard-sub`), no `sat …` line, no orange `No calculator` line
     * the What kind answer first -- [Questions] on the question, its stem and figures, [Answers] on the
       answer -- and every other tag the SAME on all five: [Q4] [a] and [2 marks] on a figure and a stem
       too, because they are the item's answers, not the page's (the figure page's own name, the stem's
       `Q4` and the marks only on two pages were each a rule of their own)
     * the calculator is ONE tag, `Non-calculator`, from the `needs` cell -- and `Calculator allowed` on a
       calculator paper -- in the needs colour; the funnel's answer and chip say the same word
     * a KS2 SATs page says `SATs` and `KS2` as two tags, and its board, STA, like any paper's */
```

### ---------- EVERY TAG ON EVERY KIND OF CARD IS A FINDER ANSWER (docs/history/355)

top level, before `PIDS`

```
/* ---------- EVERY TAG ON EVERY KIND OF CARD IS A FINDER ANSWER (docs/history/355) -----------------------
   THE OWNER, 12 Oct: every tag on a card is an answer you can pick in the finder -- same word, same colour.
   And 18 Oct: *"Please eliminate all unique conditional rules which treat them differently."* So over every
   kind of card the finder draws -- a question, its answer page, its opening (a stem), a 5-a-day, a SATs
   paper, a worksheet, a content card, a Bible verse and the Bible's cover, a practical, a project, a
   boxer, a fight, a bundle -- each `.qtag` in the row must be:
     * one live facet's tag (`data-f`, a facet marked `tag: true`), in that facet's colour (`tagOf_`);
     * one of THAT ITEM's answers to it, spelled as the chip is -- the facet's `showOf`, and for Paper the
       chip a press inside the paper's own folder makes (`chipShow_`), which is what the card's tag says;
     * an answer that picks the item: `filterHit` keeps it.
   A tag with no facet, a word no chip says, or a colour of its own fails here -- the grey qualifier, the
   filled `Question`, `sat Friday`, `Verse`, a head pill. */
```

### ---------- THE QUESTION'S OWN TAGS ARE NEVER ASKED, AND ARE DOORS ON ITS PAPER (2 Oct, 355)

top level, before `PID`

```
/* ---------- THE QUESTION'S OWN TAGS ARE NEVER ASKED, AND ARE DOORS ON ITS PAPER (2 Oct, 355) ----------------
   *"no more asking for questions 1-10 or question part 1 or b."* -- the owner, 2 Oct -- and, 12 Oct, every tag
   an answer you can pick. Both hold at once: [Q7] [a] [ii] [1] [of 2] [4 marks] are `tagOnly` facets, so a
   funnel walked from nothing, pressing the first answer of every question it asks, never asks Question,
   Part, Sub-part, Page, Pages or Marks; and once a paper is chosen, its end (`paperEnd_`) offers them as
   doors. Picking [Q7] there narrows the paper to Q7 and the funnel stays ended -- nothing more is asked. */
```

### ---------- NO LINE UNDER ANY DRAWING SAYS WHO DREW IT, ON ANY PAGE OF THE LIBRARY (docs/history/355)

top level, before `rows`

```
/* ---------- NO LINE UNDER ANY DRAWING SAYS WHO DREW IT, ON ANY PAGE OF THE LIBRARY (docs/history/355) ----------
   The owner, 18 Oct: *"I don't like that extra text which disclaims it's drawn from blah blah. Get rid of that.
   Everywhere."* Every page of every question in the real library, drawn through the app's own builders -- the
   strip's order, Saved's and the Figure tile's sheet -- and not one says it: no "redrawn", no "not the
   paper's own", no "drawn by/for @family.", no "your marks from", no "the marks are yours". And the code that
   wrote them is gone, not hidden: FIG_BY, figCredit_, padCredit_ and usesSaid_ are declared nowhere. */
```

### EVERY ANSWER SENT IS AN EVENT, AND THE CARD SAYS HOW THE LATEST ONE WENT.

top level, before `subBackend_`

```
/* ==================================================================================================
   EVERY ANSWER SENT IS AN EVENT, AND THE CARD SAYS HOW THE LATEST ONE WENT.

   THE OWNER, 9 OCT: *"The kids don't need to see the day they did something. Just whether it's right
   or not. Also I just want system to record each submition. So like if they submit a correct answer
   then change it and submit an incorrect answer, that's 2 events. And it will leave the latest event
   up, so they would see incorrect answer there next time they login. Simple. Instead of each question
   just saving number of attempts."*

   js/submit.js is the phone's half and `check-submissions.js` the backend's. These journeys go through
   the real handlers on real cards and the real `api()`. They replaced the ones that asked for a date on
   the card (`Done 4 Oct`, 268/269) and the `markDone` backlog — the day a question was done is gone,
   and so is everything that sent it. The children are invented — Ada and Ben — because this repository
   is public. `FLOW_ONLY=submission` runs them alone.
================================================================================================== */
```

### A BACKEND THAT KEEPS SUBMISSIONS, as `submissionsAppend_` does:

top level, before `subBackend_`

```
/* A BACKEND THAT KEEPS SUBMISSIONS, as `submissionsAppend_` does: a row per press, an id already there is
   the row already there, and the reply names every press now on the sheet with the server's time. Falls
   through (undefined) for every other action, so it sits in front of `ansBackend_`. */
```

### ---------- THE QUESTION'S OWN WORDS, WITH EVERY PRESS

top level, before `WD_SVG`

```
/* ---------- THE QUESTION'S OWN WORDS, WITH EVERY PRESS ---------------------------------------------
   ASKED FOR AS *"emails all parents on work their child has done with the exact questions for each"*.
   The backend cannot look a key up, so the phone sends what it draws (`doneWords_`) with each press,
   the way it sends the name, and the email prints it.

   ASKED OF THE LIBRARY'S OWN BUILDER — `questionItems`, over rows shaped as the payload carries them —
   and the real `subRecord_`, because every way this goes wrong is quiet and is a parent told a
   different question: a part sent without the scene it hangs from is "work out the probability of
   red" with no bag in it; a fraction flattened is 3/4 read as 34; a power flattened is x² read as x2.
   The library's two stored fractions are both here — `<sup>3</sup>&frasl;<sub>4</sub>` and the stacked
   `.frac` span, which came out "13 × 58" for a third times five eighths until this asked — and so is an
   italic index, which came out "2x" for 2 to the x. A paper's cover is not the question; a drawing's
   labels are not its words; a picture the email cannot draw is said; a practical's worksheet box
   sends nothing, because its name already says which sheet. AND THE NAME, as a parent reads it: the
   tier when the paper's name does not say it, the subject not twice. */
```

### ---------- THE KEYPAD'S GOLD SEND IS THE BOX'S OWN SEND (review of 9 Oct, the blocker)

top level, before `rows`

```
/* ---------- THE KEYPAD'S GOLD SEND IS THE BOX'S OWN SEND (review of 9 Oct, the blocker) ----------------------
   `kpDone_` ran `.qp-check` and nothing else, so on every box whose control is the plain Send — about 399
   maths answers with no scheme, every worksheet box, every worded box while AI marking is off — the gold
   key (drawn as Send's own aeroplane) and a laptop's Enter put the pad away and sent nothing. Pressed here
   through the real pad: a maths box with no scheme, two worksheet boxes side by side (only the one typed
   in is sent), a box with a scheme (Check), and an essay, whose key says "done" and sends nothing. */
```

### ---------- WHAT WAS DONE BEFORE THE SWITCH BECOMES A SUBMISSION, ONCE, FOR ITS OWN PERSON (decided 10 Oct)

top level, before `LIB`

```
/* ---------- WHAT WAS DONE BEFORE THE SWITCH BECOMES A SUBMISSION, ONCE, FOR ITS OWN PERSON (decided 10 Oct) ------
   The live Ledger has 55 `attempts` rows for 5 learners and no `answers` tab: a child's typed answers are
   on their device and nowhere else. `subMigrate_` (js/submit.js) turns each question this person had DONE
   (a `done:` date, or an old backend's `DATA.attempts` row) that holds their own non-empty answer and has
   no account submission into ONE submission, marked by the site's own marker, with an id made from the
   person and the key. Real rows of data/questions.json through the real loader: an ordering, a pick of
   two, a maths answer with a scheme and one without. */
```

### THE LAST EDIT ON ITS DONE DAY, BY THIS DEVICE'S CLOCK — as the old code left every answer it dated:

top level, before `AT`

```
/* THE LAST EDIT ON ITS DONE DAY, BY THIS DEVICE'S CLOCK — as the old code left every answer it dated: it
     wrote `done:` on the first keystroke of each day the box was touched. This said done 5 Oct and edited
     6 Oct 15:00 UTC, which the old code could not leave; the carry-over now reads an answer edited after
     its done day as a draft written since (review of 10 Oct), so the fixture says what a device holds. */
```

### THE DEVICE AS THE OLD CODE LEFT IT:

top level, before `DEVICE`

```
/* THE DEVICE AS THE OLD CODE LEFT IT: Ada's done dates and answers, a draft she never did, a key the
     library has not got, an empty answer, one the account already has — and her brother's, and a
     signed-out answer, on the same iPad. */
```

### ---------- A TYPED ANSWER IS ON THE ACCOUNT ONLY AS IT WAS SENT (found at the merge with 317)

top level, before `rows`

```
/* ---------- A TYPED ANSWER IS ON THE ACCOUNT ONLY AS IT WAS SENT (found at the merge with 317) --------------------
   `ansOnAccount_` asked "stamped and not due", and since submissions a typed answer is stamped on every key
   and never due — so to a backend with `saveAnswers` and `submitAnswer` a draft the store refused counted as
   on the account: no "Not saved" under it, and no "Leave site?" before a reload took it. */
```

### ---------- THE CARRY-OVER READS WHAT THE OLD CODE LEFT, NOT A DRAFT WRITTEN INTO THE KEY SINCE (review of 10 Oct)

top level, before `SUB_PRE_`

```
/* ---------- THE CARRY-OVER READS WHAT THE OLD CODE LEFT, NOT A DRAFT WRITTEN INTO THE KEY SINCE (review of 10 Oct) ----------
   Ada did Q1a on the family iPad on 5 Oct, signed in ("0.0197", right by its scheme; `done:` that day). After
   the front end went live somebody typed "5" into that box signed out, and Ada signed in from nobody — her
   first sign-in on this iPad since the switch. `answersClaim_` (318: the later edit wins) put "5" in her key a
   moment before `subMigrate_` read the key and sent "5" as her submission: "Not yet" on her card, ✗ in the
   parent's email, dated today so the latest, and "0.0197" never on the account. The same when the payload
   (and the library in it) lands after the sign-in, and when a card drawn before the payload is typed in. */
```

### 4. TYPED BEFORE THE PASS COULD RUN — signed in at boot, the payload out, and the box written by its own writer (`ansStore_`, what the `input` listener calls)

top level, before `release`

```
/* 4. TYPED BEFORE THE PASS COULD RUN — signed in at boot, the payload out, and the box written by its own
     writer (`ansStore_`, what the `input` listener calls), as a card Saved draws from the device before the
     payload is typed in. It is her edit, made after the switch, and nobody pressed it. */
```

### ---------- A QUEUE THE STORE REFUSES IS STILL SENT, AND A PRESS LEFT MARKED TO GO IS QUEUED AGAIN (review of 10 Oct)

top level, before `K`

```
/* ---------- A QUEUE THE STORE REFUSES IS STILL SENT, AND A PRESS LEFT MARKED TO GO IS QUEUED AGAIN (review of 10 Oct) ----------
   `subQueueKeep_` swallowed a refused write and `subQueue_` read the store first — which, nearly full, answers
   with the old list rather than throwing: Check pressed, nothing sent, "Sending…" for ever. The one-time
   carry-over flagged itself done over a queue the store never kept. And the `q` left on the latest then made
   `subAdopt_` keep that press as "the latest there is" over a later one from the computer, for good. */
```

### 2. THE CARRY-OVER ON THE LIVE BACKEND WITH THE STORE REFUSING THE QUEUE — and then the queue and the latest both — and the next load, with room again and the

top level, before `re`

```
/* 2. THE CARRY-OVER ON THE LIVE BACKEND WITH THE STORE REFUSING THE QUEUE — and then the queue and the
     latest both — and the next load, with room again and the new backend. Each time her 5 Oct answer has
     to reach the account, once. */
```

### ---------- SIGN OUT SENDS THE PRESSES BEFORE IT ENDS THE SESSION (review of 10 Oct)

top level, before `rows`

```
/* ---------- SIGN OUT SENDS THE PRESSES BEFORE IT ENDS THE SESSION (review of 10 Oct) ----------------------------
   The signout handler waited for the drafts and the notepad and not for the presses. A server that does not
   order two requests (Apps Script) ended the token first and refused a Check pressed just before; a second
   Check queued behind the first was thrown away by `subForget_`. Both waited on this device for the child's
   next sign-in HERE — on a tutor's laptop, never. Played: `signOut` ends the token, and a `submitAnswer` is
   answered only when the journey says, by whether its token was ended by then. */
```

### ---------- WHILE THE PAYLOAD IS OUT, A BOX THE ACCOUNT HOLDS SAYS SO, AND NOTHING IS SAID THAT IS NOT KNOWN (review of 10 Oct)

top level, before `at`

```
/* ---------- WHILE THE PAYLOAD IS OUT, A BOX THE ACCOUNT HOLDS SAYS SO, AND NOTHING IS SAID THAT IS NOT KNOWN (review of 10 Oct) ----------
   `ansSavedSay_` asked `answersCan_('submitAnswer')` — `DATA.features` — before anything, and that is false
   until the payload lands, fifteen seconds on the live site. Saved and Find's search draw a kept card before
   then, so a box holding the answer the server had acknowledged said "On this device only", and "Sent to
   Wren's account" when the payload landed. Measured in Chromium at 390 and 320 against the real backend. */
```

### ---------- BEFORE THE PAYLOAD SAYS WHETHER AI MARKING IS ON, MARK WITH AI WAITS — NEVER A PLAIN SEND AND "SWITCHED OFF" (review of 10 Oct)

top level, before `ESSAY`

```
/* ---------- BEFORE THE PAYLOAD SAYS WHETHER AI MARKING IS ON, MARK WITH AI WAITS — NEVER A PLAIN SEND AND "SWITCHED OFF" (review of 10 Oct) ----------
   `aiOffered_` read a payload that had not landed as "off": Saved drew a forty-mark essay with the plain Send
   and "AI marking isn't switched on yet" under it, and pressed, the essay went to the account as an unmarked
   "Sent" — then the payload landed and the same tile became Mark with AI. Measured at 320 and 390 against the
   real backend with GEMINI_API_KEY set. Now: Mark with AI where it will stand, not pressable, and no sentence,
   until the payload decides — and then the tile it decided on. */
```

### THE CARDS DRAWN WHILE IT WAS OUT, NOT DRAWN AGAIN — as on a Find column held back from the repaint because a child is typing in it (`findKeep_`):

top level, before `ai`

```
/* THE CARDS DRAWN WHILE IT WAS OUT, NOT DRAWN AGAIN — as on a Find column held back from the repaint
       because a child is typing in it (`findKeep_`): with AI marking on, the tile she reaches for is let go
       where it stands (`aiDecided_`), never a waiting tile that a press does nothing to. */
```

### ---------- EVERY SEND CARRIES THIS DEVICE'S CLOCK, SO THE SERVER CAN TAKE A SLOW ONE'S ERROR OUT (review of 10 Oct)

top level, before `rows`

```
/* ---------- EVERY SEND CARRIES THIS DEVICE'S CLOCK, SO THE SERVER CAN TAKE A SLOW ONE'S ERROR OUT (review of 10 Oct) ----------
   `submitAnswer` held `pressed_at` only against a fast clock; an iPad set back two hours stored a press made
   now as two hours old, and the account's latest was the answer before it. The server moves every press in
   a request by now less the phone's `sent` (`submissionsAppend_`, checked in check-submissions.js); this is
   the phone's half: the request carries it, on a send at once and on Sign out's last one. */
```

### THE VERDICT, HEARD (docs/history/340).

top level, before `earFake_`

```
/* ==================================================================================================
   THE VERDICT, HEARD (docs/history/340).

   THE OWNER, 11 OCT: *"Make it make a nice noise when they get a question right and a buzzer when
   wrong."* A chime for right and a buzzer for wrong, from ONE player (`markPlay_`, js/submit.js) called
   from ONE place (`subRecord_`, the press). What has to be true, and what a page that looks perfect
   can still get wrong, because nothing about a sound is drawn:
     - one sound per press, of the right kind, for every press that marks -- typed, the keypad's ✓ and a
       laptop's Enter, a pick, an ordering, Mark with AI's marks;
     - none for a press nothing marks (`sent`, an empty box, a row with a gap, a part mark), and NONE for
       anything that only draws a verdict: a repaint, a restore, the account's copy (`answersPull_`), a
       payload landing, another tab, a box typed back to its answer, a second copy of the card, Show, a
       reload -- the risk the map named first: a sound hung on a drawing is a chime per copy per repaint;
     - an iPad's rule: sound starts only from a tap. So the fake below is an iPad's AudioContext: it is
       born suspended, `resume()` inside a tap wakes it, and outside one it refuses -- which is exactly
       what makes a context first made after Mark with AI's network wait silent for ever;
     - the switch: off is silence everywhere and no context at all, it is remembered on the device, and it
       is the reels' and Read aloud's sound tile (`switchTileSays_`).
   `FLOW_ONLY='mark sound'` runs them alone. jsdom has no Web Audio; the sounds themselves -- their
   length, their level, and that they start and end at zero -- are rendered in Chromium by
   `check/sounds.js`. */
```

### A RECORDING AUDIOCONTEXT WITH AN IPAD'S RULES.

top level, before `earFake_`

```
/* A RECORDING AUDIOCONTEXT WITH AN IPAD'S RULES. `rec.inPress` is set by the journey around every press
   (`earTap_`), so "inside a tap" is the journey's word, as it is the browser's. Every node remembers where
   it is connected; a SOUND is a node connected to the destination, and what it is made of is every
   oscillator whose path reaches it. */
```

### WHAT WAS HEARD, IN ORDER:

top level, before `earHeard_`

```
/* WHAT WAS HEARD, IN ORDER: `chime` (sines, every one at 500 Hz or over), `buzzer` (a sawtooth or a square,
   every one under 300 Hz), or what it was if neither -- read off the oscillators, not off a name the app
   gave them, so a buzzer built where a chime should be is called a buzzer. */
```

### THE SESSION GONE WITH THE CARD STILL IN FRONT:

top level, before `subsBefore`

```
/* ---- THE SESSION GONE WITH THE CARD STILL IN FRONT: the box keeps its person's key (Find is held while
     a child writes), Check still draws "Correct", and nothing can be recorded for somebody who is not
     here. THE SOUND IS THE PRESS'S, so it says what the press drew -- not silence under a "Correct". ---- */
```

### WITH THE CONTEXT AWAKE before each of these, as it is in the second after a press:

top level, before `awake`

```
/* WITH THE CONTEXT AWAKE before each of these, as it is in the second after a press: the app puts it to
     rest a second after a sound (`markRest_`), and the fake refuses to wake it outside a tap as an iPad
     does -- so a sound asked for here could be kept silent by the fake rather than by the app. Awake, a
     stray sound is heard and named. */
```

### THE PULL, LAYING A PICK ON:

top level, before `laid`

```
/* THE PULL, LAYING A PICK ON: a card this device never answered, given the account's '2' (right) by
     `answersPull_` and drawn. ON A BACKEND WITHOUT `submitAnswer` -- with it `answersAdopt_` skips every
     `ans:` key by design (the box opens on the latest SENT), and a pull that lays nothing on is silent
     about nothing. */
```

### THE CARD IN FRONT, IN A COLUMN WITH PAGES TO TURN -- Tools' pages, holding the card as Find and Saved do.

top level, before `COL`

```
/* THE CARD IN FRONT, IN A COLUMN WITH PAGES TO TURN -- Tools' pages, holding the card as Find and Saved
     do. "Is the child still there" is asked of the page in front (`markWhere_`), so a card drawn loose in
     the document would be in front of nobody. */
```

### ANOTHER CARD ON THE SAME PAGE NUMBER -- the list under the page changed while it marked (a star taken off on Saved, one more row in front on Find):

top level, before `r`

```
/* ANOTHER CARD ON THE SAME PAGE NUMBER -- the list under the page changed while it marked (a star taken
     off on Saved, one more row in front on Find): the same column, the same page number, and a different
     question in front. A page number is not a card (`stuffBackTo_`'s note in find.js). */
```

### OFF WHILE THE BUZZER IS STILL SOUNDING:

top level, before `toastSays`

```
/* OFF WHILE THE BUZZER IS STILL SOUNDING: it stops (cut and ramped to 0, `markHush_`), the context goes
     to rest at once, and the toast says what the picture is for -- a speaker with no word under it is
     also Imposter's Read aloud, and a child who pressed it hoping to hear the question has learnt why
     nothing was read. */
```

### ANOTHER TAB FLIPS THE ONE SWITCH (one per device):

top level, before `heardNow`

```
/* ANOTHER TAB FLIPS THE ONE SWITCH (one per device): this tab's tiles say so at once, a sound playing
     here stops, and its presses follow it -- off and then on again. Nothing is heard for the other tab's
     press; it played its own chime. */
```

### A STORE THAT REFUSES EVERY WRITE -- a full one:

top level, before `kept`

```
/* A STORE THAT REFUSES EVERY WRITE -- a full one: drawings and answers held fill it (`padSave_`, rule 317)
     -- on a device already holding '1', and then one holding '0'. Pressed, the tile says the opposite of
     what was kept, AND the presses do what it says: the visit's own choice is asked before the store. */
```

### NOT WHILE IT PLAYS, nor the moment it ends:

top level, before `early`

```
/* NOT WHILE IT PLAYS, nor the moment it ends: no rest stamped within a second of the press (the buzzer is
     0.42s). Asked of the rest's own time, not of how long a wait took -- on a loaded machine a 0.6s wait
     has measured 3.3s, and the rest that came in it was the right one. */
```

### ---------- A TUTOR'S HOURS ON THEIR CARD

top level, before `w`

```
/* ---------- A TUTOR'S HOURS ON THEIR CARD ---------------------------------------------------------
   ASKED FOR AS *"tutors availability should appear on their card."* Asked of the card itself, off
   the shape `doGet` really sends — `availGridOut`'s 77 codes with 'TRUE' or '' — because the fixture
   once held `avail: []` and a card tested against that would have passed by drawing nothing. Three
   answers: a ticked hour is lit, a ticked hour they are already teaching is greyed, and a tutor who
   has ticked nothing gets no caption and no week — not seventy-seven grey cells reading "never". */
```

### ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THEIR CARD

top level, before `w`

```
/* ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THEIR CARD ------------------------------------
   THE OWNER, 10 Oct: *"availability of tutors should just show the days they have an availibility up.
   no need to display monday if they dont have any hours on monday."* Asked of `findCard` over the
   shape `doGet` sends (70 codes, 'TRUE' or ''). Three tutors: Tuesday and Thursday hours draw exactly
   those two rows, in the week's order, and nothing collapsed; a Thursday whose one ticked hour is
   already taught still counts as a day they work; and a tutor whose only tick is 19:00 — outside the
   bookable span, which `AVAIL_HOURS` used to reach — gets the "no free hours" sentence and no week,
   rather than a caption over a header row with no day under it. */
```

### ---------- AND THAT DAY IS NOT A ROW OF NOTHING

top level, before `th16`

```
/* ---------- AND THAT DAY IS NOT A ROW OF NOTHING -------------------------------------------------
     FOUND IN REVIEW: the taught hour was `hr shut`, the same dark cell as an hour never ticked, so
     the Thursday kept for it was ten identical empty cells — the row the owner asked to drop — and
     the difference was in a `title` no phone shows. Asked here of the markup and the stylesheet's
     rule; `check/states.js` ("a tutor's hours on their card") asks a real browser that the two
     cells COMPUTE differently, which jsdom cannot be trusted to say (it applies rules in sheet
     order, not by weight, and drops values it cannot parse). */
```

### THE RULE THAT MAKES IT LOOK DIFFERENT, read out of style.css with the comments taken off.

top level, before `sheet`

```
/* THE RULE THAT MAKES IT LOOK DIFFERENT, read out of style.css with the comments taken off. It must
     undo `.hr.shut`'s fade and paint something of its own; a rule that only restated the cursor would
     pass the markup half above and look exactly as it did. */
```

### ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THE BOOKING FORM

top level, before `w`

```
/* ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THE BOOKING FORM ---------------------------------
   THE SAME SENTENCE, ASKED OF THE PAPER AS DRAWN (`bookBreakdown`). Nobody chosen: all seven days —
   nobody's week is being shown. Tia chosen (Tuesday and Thursday): exactly those two day rows, and no
   `Monday —` invented by the spine for the days the week left out. Her Thursday fully taught: it stays,
   collapsed, because a day she works with nothing free is a different fact from a day she does not
   work. And a Monday hour ticked BEFORE choosing her is the form's old rule for an hour that stops
   being bookable: kept, its day still drawn, the cell lit and greyed, and still counted. */
```

### ---------- AND A DAY SHE WORKS AT A VENUE SHUT THAT DAY STAYS TOO

top level, before `hall`

```
/* ---------- AND A DAY SHE WORKS AT A VENUE SHUT THAT DAY STAYS TOO --------------------------------
     THE RULE HAS TWO HALVES — "every hour already taken, OR THE VENUE IS SHUT" — and this journey
     proved only the first: it ran with no venue chosen, so a `works` test that also asked the venue
     (`tAvail[h.code] && (!haveV || vAvail[h.code])`) stayed green while dropping the Thursday a family
     might move to another hall for. Found in review. A hall of our own, open every hour of every day
     but Thursday, with a rate so it is not read as the client's house (`isHome`). */
```

### ---------- YOUR PICTURE, CHOSEN ON YOUR OWN CARD'S EDIT

top level, before `URL_`

```
/* ---------- YOUR PICTURE, CHOSEN ON YOUR OWN CARD'S EDIT -------------------------------------------------
   ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"* — and on 11 Oct
   everything about your card moved to your card's own Edit, for everybody (docs/history/339), so the picker is
   the picture section of that form now and Settings draws none. The
   page's own change listener and tiles, end to end: a file chosen on the hidden input is posted as
   `savePhoto` with a JPEG `data:` URL and your own id, the server's address comes back into the
   preview and into `USER.profile`, and `Remove` posts `remove` and puts the initial back. The crop
   itself is a canvas, which jsdom has not got — so `pfpPrepare_` is stood in for, and the real one
   is driven in a browser with a real file (see the history note). And the old link box must be gone,
   because a hidden `photo` field would be posted by the card's Save and write the old picture back. */
```

### ---------- YOUR PICTURE, ONE OF ELEVEN — FOR EVERY ROLE, SEEN BY YOU AND BY SOMEBODY ELSE

top level, before `PFP_ROLES`

```
/* ---------- YOUR PICTURE, ONE OF ELEVEN — FOR EVERY ROLE, SEEN BY YOU AND BY SOMEBODY ELSE -----------
   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox dp
   selector, which allow you to use your avatar as a dp."* One journey per role — student, parent, tutor,
   admin — through the page's own grid and tiles: the eleven drawn in order (your figure first, then the
   ten), no ring until one is yours, and then FOUR SAVES IN A ROW: your figure, a picture, a photograph,
   Remove. After each, the request that left (`savePhoto` with `choice`, `data` or `remove`, your id),
   the ring and the line under the grid, `USER.profile`, YOUR OWN CARD on the You column as the app
   repainted it — and ONE OTHER SURFACE WHERE SOMEBODY ELSE SEES YOU, drawn as that other person from the
   row `doGet` sends them (`faceFig_`: the figure beside the face only when the face is the figure;
   `check-profile.js` proves the server half): your parent's column for a student, your child's message
   head for a parent, a visitor's people column for a tutor, the feed for an admin.
   YOUR FIGURE IS LIVE: dressed differently after it was chosen, your own card wears the new shirt.
   ON YOUR OWN CARD'S EDIT SINCE docs/history/339, for every role: the picker is its picture section and the
   wardrobe its figure section, so each choice is made in the form (Edit), and the card is read once the form is
   closed (Save — the picture saved itself, so Save has nothing more to send and closes it). And the figure is
   dressed in the SAME form now: a shirt picked in the wardrobe section is the shirt the picker's "your figure"
   wears at once, and the shirt your card wears once the form is shut — the owner, 11 Oct: *"your figure should
   also be in your profile card editing."* */
```

### LIVE, AND DRESSED ON THE SAME FORM:

in `pfpRoleJourney`

```
/* LIVE, AND DRESSED ON THE SAME FORM: shirt 2 picked in the wardrobe section is posted as `saveAvatar`, the
       picker's "your figure" one section up wears it at once, and so does your own card once the form is shut —
       without a save of the picture. Then dressed back the same way, through the same section. */
```

### ---------- AND UNTIL THE BACKEND IS PULLED, A TAP FAILS OUT LOUD

top level, before `URL_`

```
/* ---------- AND UNTIL THE BACKEND IS PULLED, A TAP FAILS OUT LOUD -------------------------------------
   A server from before the pictures answers `choice` with its own door's refusal — "That is not a
   picture. Choose a photo from your phone." — and writes nothing. The line under the grid says that,
   says the picture is unchanged and why (the server is older than the pictures, by its stamp), the old
   photograph is back in the preview, no ring is left on the fox, and `USER.profile` still holds the
   photograph. Never silently, and never as though it had been kept. */
```

### ---------- YOUR ROLES, TICKED IN SETTINGS

top level, before `w`

```
/* ---------- YOUR ROLES, TICKED IN SETTINGS ---------------------------------------------------------
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles are.
   they can be either a tutor or client or student. they can be tutor and client and student like
   multiselect."* The card's own ticks and tile, end to end: what you hold is what is ticked (a
   `parent` from the sign-in reply is Client), Admin is never a tick, nothing ticked never leaves the
   phone, a Save posts `setMyRoles` with your id and the ticked words — and the server's answer, not
   the ticks, is what you are afterwards: a Tutor tick that came back pending leaves the staff test
   (`isTutorRole`) false, says it is waiting on the card, and still offers the tutor agreement. The
   server's own rules are `check-profile`'s; this is the phone's half. */
```

### ---------- A REFUSED SAVE PUTS THE TICKS BACK; A LOST REPLY LEAVES THEM

top level, before `NO`

```
/* ---------- A REFUSED SAVE PUTS THE TICKS BACK; A LOST REPLY LEAVES THEM ------------------------------
   THE WALK AFTER THE PARENT SIGN-UP FOUND IT: a student ticks Client, Save, and the server's *"A
   student account cannot make itself a client … Nothing was changed"* arrived under a Client box
   still ticked in gold — the box saying yes over the line saying no. The server's half (it refuses,
   it writes nothing) is `check-signin` §8; this is what the phone draws afterwards. And the other
   failure, which must NOT do the same: a reply that never came decided nothing, so the ticks are
   still the request a second Save will send. */
```

### ---------- NOTIFICATIONS: WHICH EMAILS YOU WANT, ON SETTINGS

top level, before `notifyWorld_`

```
/* ---------- NOTIFICATIONS: WHICH EMAILS YOU WANT, ON SETTINGS ---------------------------------------------
   ASKED FOR AS *"Also let parents select their communication preferences like notification. And kids and
   tutors too I guess"* (the owner, 9 Oct). The server's half — every sender asks, off is held, the token
   decides whose row — is `check-prefs.js`. This is the phone's, and it is pressed against the REAL backend
   (check-gas-load.js) rather than a reply typed here: the list a parent, a kid and a tutor are each shown
   comes out of `notifyOf_` in people.gs exactly as the sign-in reply carries it, a tick posts `setNotify`
   to the real `doPost`, and "survives a reload" is a fresh phone whose saved copy has had the list taken
   off it, so only the server's `myProfile` can put the tick back where it was. A fixture that typed the
   lists out would be checking the fixture. Invented people, example.org, PIN 0000. */
```

### ---------- TWO TICKS IN A ROW ARE TWO SAVES, WHICHEVER ANSWERS FIRST

top level, before `real`

```
/* ---------- TWO TICKS IN A ROW ARE TWO SAVES, WHICHEVER ANSWERS FIRST ---------------------------------------
   The card used to be locked whole while a tick saved, and a locked `.check` looked exactly like a live
   one: the second tick, 400ms after the first, during Apps Script's two seconds, did nothing at all —
   no request, the box as it was, weekly_email blank, and "Saved" for the first (review, 9 Oct, walked in
   Chromium). Now only the box being saved is locked. The replies here are HELD, as Apps Script holds
   them, and let go in the OTHER order: the server wrote both, so the earlier reply's list still shows
   the later tick as it was, and a phone that kept that list whole would repaint a tick the server has
   already taken away. (Mutations: `lock: card` — no second request; the reply's whole list kept — the
   repaint ticks Weekly again.) */
```

### ---------- A LIST WITH NOTHING IN IT IS ONE SENTENCE

top level, before `user`

```
/* ---------- A LIST WITH NOTHING IN IT IS ONE SENTENCE --------------------------------------------------------
   Every role is sent at least sign-in links and security warnings, so an empty list is a server that could
   not tell what reaches somebody — the first `notifyOf_` did that for a role cell typed `parent`. It drew
   "To x@… · saved as you tick." over nothing. */
```

### ---------- THE SHOP IS A COLUMN, AND FIND IS LEARNING

top level, before `shopRow_`

```
/* ---------- THE SHOP IS A COLUMN, AND FIND IS LEARNING -------------------------------------------
   ASKED FOR AS *"Get rid of shop tag. I will make a new coloumn for shop stuff. So finder now will
   become just learning stuff."* — the door and the column in ONE change, because the shop's things
   had one way onto a screen and that was the door. So this asks both halves together: a thing that
   left Find and did not arrive on the column is the deletion the owner was asked about and refused.

   AND WHO SEES WHAT. `doGet` sends `audience` and `inStock` on every row, and before the column read
   them a signed-out visitor was offered the toner cartridge. The rows below are one of each case,
   shaped as `doGet` shapes them; `payload()` sends none, which is why no journey had ever drawn one. */
```

### ---------- A CHOSEN ANSWER IS ONLY ITS VALUE, AND CLEAR IS A TILE BESIDE THE BOX

top level, before `w`

```
/* ---------- A CHOSEN ANSWER IS ONLY ITS VALUE, AND CLEAR IS A TILE BESIDE THE BOX -----------------
   The owner, 8 Oct, on a pupil's iPad: *"i dont need the category of the tag to appear with the
   choisen option in the finder"* and *"clear button looks like a tag which it isnt."* So: no field
   name in front of a chosen value (`SUBJECT Maths` is `Maths`), a skip says what it skipped (`Any
   school year`), a bare number keeps its field (`Chapter 119`), the kind's colour stays on the chip —
   and Clear is the pen's bin tile in its own slot beside the search box, from the first answer on,
   never a chip in the row. AND THE BOX IS NOT REDRAWN: the same element, still focused, after an
   answer is pressed — the reason Clear has a slot of its own rather than sharing the box's line. */
```

### ---------- PROJECTS, A KIND OF ITS OWN BESIDE THE PRACTICALS

top level, before `rows`

```
/* ---------- PROJECTS, A KIND OF ITS OWN BESIDE THE PRACTICALS ------------------------------------
   ASKED FOR AS "the projects are like practicles, but not practicles. so should be a new tag in the
   finder called projects." Asked of the REAL file through the REAL mapper: the first boot is only
   there to reach `libraryExtras_`, so the rows the second boot draws are exactly what a phone makes
   of `data/projects.json` — not a hand-written fixture of what somebody thought the mapper did.
   Then: Find offers every one, `What kind` names `Projects` beside `Practicals`, a project is four
   pages (card, materials, steps, share), and the share page's one tile lands on Messages. */
```

### ---------- COURSEWORK, A TYPE OF PROJECT

top level, before `rows`

```
/* ---------- COURSEWORK, A TYPE OF PROJECT --------------------------------------------------------
   THE OWNER, 9 Oct: "i would like to add course works. make it bare bones. its within projects in
   finder." So the claim is a ROUTE, pressed on the real answer buttons: Learning → Projects, and the
   next question is Project or coursework with exactly those two answers; Coursework leaves the
   coursework rows and nothing else; and a list only MOSTLY projects is never asked it. Then the
   card says Coursework and the board its file row names, the ordered page is titled Stages (a
   project's still says Steps), the share page says whose work a coursework is, and the owner's own
   words find it — `dt`, `graphics`, `movie`, `cutout` — with the ones only `projectText_` adds
   shown first to be absent from the row.

   THE FACETS FILE IS SERVED, which no other journey here does, and it has to be: like
   `practicalType`, the question has no facet in code — it is one row of `data/settings/facets.json`
   read through `facetFromSheet_` — so a journey on the code's own order would find no question to
   press and would be measuring a funnel no phone draws. The projects go through the real mapper as
   the journey above sends them; the facets through the real fetch and `settingsInto_`. */
```

### ---------- AND NOT OF A LIST THAT IS ONLY PARTLY PROJECTS

top level, before `projs`

```
/* ---------- AND NOT OF A LIST THAT IS ONLY PARTLY PROJECTS -------------------------------------
     THE REVIEW FOUND IT BY TYPING `blade` AND SKIPPING What kind: two projects, the D&T textbook and
     a practical, the funnel asked Project or coursework — half the list could answer, which was the
     default bar — and Coursework dropped the textbook and the practical without a word. `send`,
     `folder` and `studio` did the same. So: every project in Find plus one thing of each of two
     other kinds, the doors skipped, and the question must NOT be asked; the projects alone, with
     the same doors skipped, and it must be. Built rather than searched for, so it does not depend
     on which words the fixture happens to hold; mostly projects, so the old bar would have asked. */
```

### THE CARD: FLAGGED, AND ITS BOARD ON THE SUBJECT'S LINE — AGAINST THE FILE.

top level, before `x`

```
/* THE CARD: FLAGGED, AND ITS BOARD ON THE SUBJECT'S LINE — AGAINST THE FILE. The first version
     compared the strip with the MAPPER's own `board`, so a mapper that dropped the board made the
     test skip itself and pass. The row in data/projects.json is what the strip owes. */
```

### FOUND BY WHAT IT IS CALLED, with nothing chosen.

top level, before `said`

```
/* FOUND BY WHAT IT IS CALLED, with nothing chosen. TWO LISTS, AND THE DIFFERENCE IS THE POINT.
     The first version searched `coursework` and `nea` and said `nea` was not in the row — but the
     safety line said "nearby", and the row says `coursework` three times, so with every name taken
     out of `projectText_` both searches still passed. So the words that prove `projectText_` are
     first shown NOT to be in the row's own cells, its name or its strip; a word the row turns out to
     say is reported as a check that proves nothing. The others are what the owner typed, which the
     row may say for itself. */
```

### ---------- A CONTENT CARD, REACHED THE WAY A QUESTION IS

top level, before `read`

```
/* ---------- A CONTENT CARD, REACHED THE WAY A QUESTION IS ----------------------------------------
   IT WAS THE @family. TEXTBOOK, reached Learning → Resources → @family. textbooks → GCSE Statistics, a
   contents card and a page per chapter. THE OWNER, 12 Oct: *"Forget the whole concept of it being a text
   book. It's just a "content card" or whatever. It can share same tags as questions e.g. gcse, ks2,
   maths."* So the route is the claim again, on the REAL answer buttons over the real file through the
   real mapper, with the real boxers and bouts and projects beside it: Learning → Content → Statistics.

   Then: the list is the Statistics cards, one a chapter; a card is whole — its title, the questions'
   tag row, its key words, its formulas STACKED by `typeset_`, its worked lines and the Higher mark — and
   its animations are pages after it; nothing anybody can see says textbook or chapter; the textbooks'
   shelf is never offered; typing a word that is only inside a card finds it on both finders; the star
   keeps it on Saved; and a star on a BOOK, kept from before, draws nothing at all. */
```

### WHAT IT IS, FIRST IN THE ONE ROW EVERY CARD WEARS:

top level, before `first`

```
/* WHAT IT IS, FIRST IN THE ONE ROW EVERY CARD WEARS: [Content], the What kind answer (355; it was a
     pill in the head). Then THE QUESTIONS' TAGS — the Level answer, the subject and the topics — and NO
     board, because the words of a GCSE Statistics card are every board's. */
```

### NOTHING THE APP SAYS IS TEXTBOOK OR CHAPTER — every card and every animation page, all of them.

top level, before `said`

```
/* NOTHING THE APP SAYS IS TEXTBOOK OR CHAPTER — every card and every animation page, all of them. The
     card's own words are left out of the reading: a Jekyll and Hyde quotation cites "(Chapter 10)" of the
     novel, which is the content talking, not the app calling the card a chapter. */
```

### FIND 2: ONE FINDER, TWICE, IMMEDIATELY RIGHT OF FIND (docs/history/329, reversed in 347) THE OWNER, 10 Oct, built a second column for the resources

top level, before `RES_MADE_`

```
/* ==================================================================================================
   FIND 2: ONE FINDER, TWICE, IMMEDIATELY RIGHT OF FIND (docs/history/329, reversed in 347)
   THE OWNER, 10 Oct, built a second column for the resources — *"this new column is "finder 2". it
   carries resources."* — and on 12 Oct took the split back: *"Return to that origional finder having
   everything and now there is just an identical second finder. Smart students will know to use this
   second finder to have the content up while they do questions on the origional finder."* One journey
   per rule: the column is there, where it was asked for, called Find 2; both finders carry the same
   items and ask the same first question; the two share no state; each keeps its own place across a
   reload and a sign-in, and a kept chip nothing will answer is dropped; a kept card Saved cannot draw
   whole opens in Find; an empty search says "take a filter off" and offers no other column. The items
   are the real files mapped by the app's own `libraryExtras_`, so the questions are the ones a phone is
   asked. The journeys were the split's (329) and are rewritten to the new rule, not deleted.
================================================================================================== */
```

### THE APP'S OWN FUNCTIONS, EACH CALLED AS FIND 2 — `R.stuffFiltered()` is Find 2's list, `R.nextFacet(l)` its next question, `R.paintStuff()` its repaint.

top level, before `resView_`

```
/* THE APP'S OWN FUNCTIONS, EACH CALLED AS FIND 2 — `R.stuffFiltered()` is Find 2's list,
   `R.nextFacet(l)` its next question, `R.paintStuff()` its repaint. A journey asked of Find reads
   exactly as it did, with `w.` become `R.` where the second finder is asked. */
```

### THE PAGE TABLE ITSELF.

top level, before `pg_`

```
/* THE PAGE TABLE ITSELF. `__t.PAGE` is a getter (`PAGE: () => PAGE`, which overrides the bare `PAGE`
   earlier in the same literal), so `pg_(t).res` is undefined and a comparison of two of them passes
   whatever the app did. Asked through this, so a page check can fail. */
```

### ONE LIST, COUNTED ONCE:

top level, before `fBare`

```
/* ONE LIST, COUNTED ONCE: with no chips and no words both finders' first question is asked of the same
     array (`FUNNEL_MEMO`, find.js), so its tallies — keyed on the array — are counted once. Two copies cost
     Find 2 the whole library's tally a second time on the first load, ~300 ms in jsdom. */
```

### A KIND RELABELLED IN THE LIVE SHEET MOVES NOTHING BETWEEN THEM:

top level, before `was`

```
/* A KIND RELABELLED IN THE LIVE SHEET MOVES NOTHING BETWEEN THEM: it changed column while the label
     was the membership rule (329). Relabel the boxers and both finders' What kind say the new word, and
     the two lists stay one list. */
```

### A PLACE KEPT BEFORE THIS CHANGE, AND CHIPS NOTHING WILL ANSWER (`placeChipDead_`).

top level, before `stale`

```
/* A PLACE KEPT BEFORE THIS CHANGE, AND CHIPS NOTHING WILL ANSWER (`placeChipDead_`). Find's own,
     holding: `Shelf · Boxing`, which the split dropped from Find (329) and both finders answer now, so
     it is KEPT; the Bible's chips, and `Shelf · Books`, kept by somebody the Bible is not for (P7 is no
     admin), DROPPED; a question the funnel has retired (`examWave`), DROPPED; the textbooks' shelf and a
     `Book` chip from before the chapters became content cards (347, part 2), DROPPED; a paper nothing answers YET
     — the library lands after this runs, which is 329's "early" half — KEPT, or a reload before the
     library arrived would lose the place it exists to keep. */
```

### AND A CHIP ON A FIELD NO FACET ASKS, once the facets have arrived — it is a chip that does nothing (`filterHit` reads a facetless chip as matching everything).

top level, before `w4`

```
/* AND A CHIP ON A FIELD NO FACET ASKS, once the facets have arrived — it is a chip that does nothing
     (`filterHit` reads a facetless chip as matching everything). Before they arrive a sheet-only
     question is merely not here yet, so it is kept. Asked of the rule itself, in both finders. */
```

### ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND

top level, before `b`

```
/* ---------- A KEPT CARD SAVED CANNOT DRAW WHOLE OPENS IN FIND ----------------------------------------
   It was "Open in Resources" under a resource kept on Saved, and on a resource drawn on Find (329). Both
   finders hold everything now (347), so the line is between a card Saved draws whole — a question, a
   fight — and one it does not — a content card's animations, a boxer's fights, a project's steps are a swipe
   up in a finder and not on Saved. Under the second kind, `Open · in Find`; inside a finder, nothing. */
```

### THE REVIEW OF THE SECOND FINDER (docs/history/329, "the review").

top level, before `b`

```
/* ==================================================================================================
   THE REVIEW OF THE SECOND FINDER (docs/history/329, "the review"). Each journey below was a probe of
   the reviewer's first — reproduced on this branch before anything was changed, red — and is held here
   so the rule it found stays found.
================================================================================================== */
```

### ---------- AN EMPTY SEARCH SAYS WHAT TO DO HERE, AND OFFERS NO OTHER COLUMN

top level, before `b`

```
/* ---------- AN EMPTY SEARCH SAYS WHAT TO DO HERE, AND OFFERS NO OTHER COLUMN ---------------------------------
   FINDING 1 OF 329'S REVIEW, AND WHAT BECAME OF IT. While the second column held the resources, a boxer's
   name typed into Find found nothing with his card one swipe away, so an empty search asked the other
   finder and offered "1 in Resources" with an Open tile that carried the words across — and cleared that
   column's chips when they hid him. With both finders holding the same list (347) the tile could only
   ever do the second thing: take the words into the column a student keeps a chapter up in and empty its
   chips. So it is gone, and this asks that it stays gone, on both finders: a name is found where it is
   typed; under a chip that hides it, the sentence says "take a filter off" and draws no tile; a word
   nobody has says "Try fewer words." */
```

### ---------- A PLACE KEPT INSIDE THE BIBLE COMES BACK INSIDE IT, FOR WHOEVER THE BIBLE IS FOR

top level, before `ADMIN`

```
/* ---------- A PLACE KEPT INSIDE THE BIBLE COMES BACK INSIDE IT, FOR WHOEVER THE BIBLE IS FOR -----------------
   FINDING 3 OF 329'S REVIEW was that an admin's Find place inside the Bible came back from a reload with
   `bibleBook · Genesis` and "Nothing matches", because nothing on any list answers a Bible book and the
   foreign-chip rule read it as early. Then Find had no Bible, and the fix dropped the chips. Both finders
   hold the Bible for an admin now (347), so the same kept place comes back INSIDE Genesis 1, on Find;
   and kept by somebody who is not an admin, the Bible's chips — and the Books shelf, which holds nothing
   else — are dropped (`placeChipDead_`), the rest kept. */
```

### ---------- WORK THAT RUNS LATER, BOUND TO ITS FINDER

top level, before `b`

```
/* ---------- WORK THAT RUNS LATER, BOUND TO ITS FINDER ----------------------------------------------------
   FINDING 4. The build listed the delayed work it re-binds — the search box's debounce, the draw's
   microtask, `goPage` — and none of the six journeys above failed when any one of them was undone,
   while the second column visibly broke: it never updated as you typed, a landing repaint left the
   page in front blank, and a swipe turned to blank pages until the after-slide fill. One journey each,
   asked of what is on the screen. */
```

### ---------- THE SPLASH'S PICKER, AS index.html HOLDS IT

top level, before `pickerSrc_`

```
/* ---------- THE SPLASH'S PICKER, AS index.html HOLDS IT ---------------------------------------------
   `boot()` STRIPS EVERY SCRIPT FROM THE PAGE, the picker with them — so a journey about which splash
   is drawn runs the real one itself, out of the file, in the window the app booted in. Cut by its id:
   it is `<script id="pick-splash">`, the first thing inside `#splash` (see check-css.js). */
```

### EVERY ANSWER THE COIN CAN GIVE, by forcing `Math.random` across its range:

top level, before `pickEvery_`

```
/* EVERY ANSWER THE COIN CAN GIVE, by forcing `Math.random` across its range: N evenly spaced values
   reach every index of any pool of N or fewer. The splash is put back as the markup has it between
   runs, so each pick starts where a fresh page does. Answers the class each run left, and the root
   it drew if it drew one. */
```

### ---------- A RETIRED SPLASH STAYS RETIRED

top level, before `rows`

```
/* ---------- A RETIRED SPLASH STAYS RETIRED ----------------------------------------------------------
   data/settings/splashes.json IS THE SHEET'S SWITCH, and the picker reads what the last load left in
   `splashOff`. That was written from the PAYLOAD, before the file had been read — and `doGet` sends
   `[]` — so turning a splash off in the sheet never reached a single device. This serves the real
   file with Pythagoras switched off, lets the real `load()` run, and asks what the device kept; then
   runs the real picker from index.html with every answer the coin can give, and Pythagoras must never
   be the one drawn. */
```

### ---------- A CHAPTER PLAYS ITS ANIMATION

top level, before `read`

```
/* ---------- A CHAPTER PLAYS ITS ANIMATION ------------------------------------------------------------
   "Add the animations from loading to respective subject text books." — the owner, 8 Oct. The real
   books through the real mapper, GCSE Maths opened on Find, and the page after chapter 17 turned to:
   Pythagoras, drawn from its row. Then what the page has to be true of: it plays on arrival and stops
   when the page turns; its stylesheet is in the page once and is the row's; the drawing is the row's
   markup with its ids made its own; no id inside any drawing on the page is shared; the chapter's
   formula under it is typeset; the book's search words hold no markup; and Play again starts it over. */
```

### THE WINDOW FILLED AS THE BUILDER WOULD FILL IT IN THE QUIET — the builder is held here (it is the arrival this asks about), and since docs/history/341 a turn

top level, before `host`

```
/* THE WINDOW FILLED AS THE BUILDER WOULD FILL IT IN THE QUIET — the builder is held here (it is the arrival
     this asks about), and since docs/history/341 a turn fills only the page in front, one either side and
     what the glass shows; the drawings two pages on are the builder's. `all` is the whole window, now. */
```

### ---------- THE OWNER'S TEST: A TOPIC FINDS THE CONTENT CARD BESIDE THE QUESTIONS, ON EITHER FINDER

top level, before `p`

```
/* ---------- THE OWNER'S TEST: A TOPIC FINDS THE CONTENT CARD BESIDE THE QUESTIONS, ON EITHER FINDER ------
   *"for maths text book begin adding topic tags so students can immediately find what they need … It can
   share same tags as questions"* — the owner, 12 Oct. So, over the REAL question rows on five topics and
   the real content cards through the real mapper, on Find AND on Find 2:
     · Maths · GCSE · Topic <T> holds the card that teaches <T> — the Topic chip's answer is the library's
       own spelling, so the card is reached by the word the questions carry;
     · typing <T> under Maths · GCSE holds that card AND questions tagged <T> — the search is where the
       questions answer a topic (a question's topic is not a Topic answer, the owner's call of 6 Oct,
       `topicShown_`), so this is the half that puts the card beside them, and it is asked of the card's
       place too: on the first page of hits, not 300 results down.
   Five topics: Surds, Pythagoras' Theorem (with the apostrophe, as the library spells it), Standard Form,
   Simultaneous Equations and Histograms. */
```

### ---------- THE SPLASH IS DRAWN FROM THE TEXTBOOKS' COPY

top level, before `books`

```
/* ---------- THE SPLASH IS DRAWN FROM THE TEXTBOOKS' COPY ---------------------------------------------
   "The animation from loading screen are pulling and syncing from the text book animations." — the
   owner. Boot 1 is a real load that reads the real books and keeps the copy. Boot 2 is the next visit
   on the same device: its storage carried over, Pythagoras the one the coin can land on, the real
   picker run as index.html runs it. The drawing on the splash is the chapter's drawing; and when the
   load finishes, it is taken off and the splash goes back to the still name and the loader for any
   Try again. */
```

### ---------- THE BOOKS AND THE SETTINGS ARE ASKED FOR WITH THE DEPLOY'S STAMP

top level, before `w`

```
/* ---------- THE BOOKS AND THE SETTINGS ARE ASKED FOR WITH THE DEPLOY'S STAMP --------------------------
   `sw.js` answers an exact URL out of its store with no network; a bare `data/textbooks.json` was the
   first copy a device ever saw, for good. `check/deploy.js` proves the effect in a browser; this is
   the cause, asked of the real fetch: every library and settings file carries `?t=` and the deploy. */
```

### ---------- THE BIBLE: SIX QUESTIONS AND A CARD A VERSE, AND NOBODY ELSE IS SHOWN IT OR SENT IT

top level, before `read`

```
/* ---------- THE BIBLE: SIX QUESTIONS AND A CARD A VERSE, AND NOBODY ELSE IS SHOWN IT OR SENT IT ---------
   ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
   AND REDONE ON 6 OCT: *"it should be like the other stuff. tags in finder. should go translation e.g.
   kjv, then old testament or new, then group the books, e.g. torah, pauline epistles ect. then the book
   titles e.g. genises, eodus. then the chapters, e.g. 1,2,3 then the verses e.g 1 2 3. each verse is a
   widget."* Two halves, and the first is the one that matters more:

   NOBODY BUT AN ADMIN. Signed out, a parent, a student and a tutor are each booted SIGNED IN FROM THE
   FIRST LINE (seeded the way `check/ui.js` seeds its visitor, so the boot that builds Find is theirs),
   with the real `data/bible/` files there to be fetched. Each walks to the resources, searches the Bible's
   words, presses the Bible's answers and its tiles as forged buttons — and the list of everything
   fetched is read: not one URL under `data/bible/`.

   ON THE RESOURCES COLUMN SINCE THE RESOURCES MOVED (docs/history/329): `What for` and `What kind` have
   one answer each there and are skipped, so the walk is Books first, and the Chapter tile — from a verse
   found here or kept on Saved — lands on that column.

   AN ADMIN, BY REAL PRESSES. Learning → Resources → Books → KJV → Old Testament → Torah → Genesis → 1 →
   3, reading what each question offers and in what order; every verse of Genesis 1 drawn from the
   file, italics and pilcrows as printed; the Chapter tile; Psalms's 150 chapters and Psalm 119's 176
   verses as grids nextFacet asks; the one-answer rungs; every rung skipped; a chip dropped, a chip
   forged, a citation typed; every chapter of every book walked; a book that does not come and comes on
   the second try; the late index; the library held back; stars; a demotion; and signing out. On every
   Bible list, what the funnel TALLIED is read as well as what it asked. */
```

### THE ONE DOOR `bible-go` SETS:

top level, before `DOORS`

```
/* THE ONE DOOR `bible-go` SETS: under `Shelf · Books` the list is the Bible, so `What for` and `What
     kind` have one answer each over it and are skipped — the Books shelf is the only chip in front of the
     Bible's own, on either finder (docs/history/329, 347). */
```

### `.loading` IN THE CARD, NOT `.bb-v.is-wait`:

top level, before `ex1`

```
/* `.loading` IN THE CARD, NOT `.bb-v.is-wait`: a verse waiting for its book is the one loader now
     (`loading_`, shell.js — the owner, 9 Oct, *"they should all have a simplistic simple loading
     thing"*), and the verse's `.bb-v` is only drawn once the book has landed. */
```

### THE FILE'S VERSE AS A CARD MUST PRINT IT, WRITTEN OUT HERE AND NOT ASKED OF `bibleV_`.

top level, before `escH`

```
/* THE FILE'S VERSE AS A CARD MUST PRINT IT, WRITTEN OUT HERE AND NOT ASKED OF `bibleV_`. This compared
     each card with `bibleV_` of the same verse — the function that drew it, so it was comparing the card
     with itself, and the review's slip in `bibleV_` (the words inside the pilcrow's ternary, every
     paragraph-opening verse a bare `¶`) passed it. Escaped, `[word]` in italics, the `#` taken off and
     the pilcrow printed in front instead: the 1611 conventions, stated by the journey. */
```

### ---------- 9b. A SEARCH KEEPS THE COVER EXACTLY WHEN IT WOULD KEEP A VERSE

top level, before `crossWords`

```
/* ---------- 9b. A SEARCH KEEPS THE COVER EXACTLY WHEN IT WOULD KEEP A VERSE ---------------------------
     FOUND BY THE REVIEW: `testaments`, `old and new testaments` and `poetry and wisdom` typed on the
     Books shelf kept the cover and asked Translation, and KJV then answered "Nothing matches" — the
     cover's haystack was every book's words in one string, and a `sub` no verse had. So every search
     below is asked both ways, by the app's own path: on the Books shelf (is the cover there?) and with
     KJV pressed (is any verse?). The two answers must be the same answer. The words are the ones the
     cover's old haystack held — its name, each testament, group and book, `and`, `testaments` — and the
     pairs that cross a group or a testament, and citations, which a verse's name carries and its
     book's words do not. */
```

### ---------- 10. EVERY BOOK AND EVERY CHAPTER, WALKED

top level, before `all`

```
/* ---------- 10. EVERY BOOK AND EVERY CHAPTER, WALKED -------------------------------------------------
     THROUGH THE FUNNEL'S OWN NARROWING AND ITS OWN QUESTION, chip by chip as a finger would set them, but
     without drawing 1,255 screens: every book asks Chapter with exactly its chapters, every chapter asks
     Verse with exactly its verses, and every chapter's list is its verses in order. */
```

### ---------- 12. THE INDEX LANDING AFTER FIND WAS BUILT

top level, before `release`

```
/* ---------- 12. THE INDEX LANDING AFTER FIND WAS BUILT ------------------------------------------------
     Held back here until the payload is in and the list made, which is the slow-network order. The
     Books shelf says it is on its way and then asks Translation by itself; a search typed while it was
     on its way finds the cover once it lands; and KJV with `psalms` still typed is the Psalms. */
```

### ---------- 13. NOT BEFORE THE LIBRARY

top level, before `held`

```
/* ---------- 13. NOT BEFORE THE LIBRARY ----------------------------------------------------------------
     With `data/questions.json` still on its way an admin's Find has to say the questions are still
     coming — the Bible stands on shelves that arrive with the library, and on its own it turned that
     sentence into a funnel of one book. Held back for good, the slow phone frozen at its worst moment. */
```

### ---------- 16. AND SIGNING OUT FROM INSIDE IT LEAVES NOTHING OF IT

top level, before `field`

```
/* ---------- 16. AND SIGNING OUT FROM INSIDE IT LEAVES NOTHING OF IT ------------------------------------
     FOUND BY THE FIRST REVIEW: an admin signed out on the Books shelf left "WHAT KIND Resources ✕ SHELF
     Books ✕" on the signed-out Find. Signed out from Genesis, with a word typed too — and then the
     Bible's tiles pressed by whoever picks the phone up, with its index still in memory. */
```

### ---------- THE FUNNEL ASKS AN ADMIN WHAT IT ASKS A PARENT, THE BOOKS SHELF APART

top level, before `serveAll`

```
/* ---------- THE FUNNEL ASKS AN ADMIN WHAT IT ASKS A PARENT, THE BOOKS SHELF APART -----------------------
   THE BIBLE IS THE ONE THING ON FIND THE PHONE GIVES ONE ROLE AND NOT ANOTHER, and the sameness journey
   above holds the ITEMS to that: an admin's list is everybody's plus `bible:kjv`. This holds the
   QUESTIONS to it. One cover on a list of seven thousand changes every share the coverage rule reads,
   and six Bible questions on the facet list could have been asked of anything — so the funnel is walked
   from ten places a finger starts, by a parent and by an admin over the real library, pressing the
   commonest answer each time, and every question asked and every answer offered must be the same. The
   one difference allowed is the one asked for: `Books` among the shelves. */
```

### BOTH FINDERS, THE SAME STARTS (docs/history/347):

top level, before `PLACES`

```
/* BOTH FINDERS, THE SAME STARTS (docs/history/347): each is the same finder, so every start is walked
     on Find and on Find 2 and the two walks must be the same walk — for each visitor. The Books shelf is
     on both for an admin; the resources' two starts are where it is met. */
```

### ---------- EVERY FIND KIND THAT IS NOT A QUESTION IS BUILT FROM THE SAME FIVE PARTS

top level, before `read`

```
/* ---------- EVERY FIND KIND THAT IS NOT A QUESTION IS BUILT FROM THE SAME FIVE PARTS ----------------
   *"didn't I ask you to sleekerise the whole widget system in the finder for questions and so on?"*
   The answer was one set of parts — `.fc-head` (title and flags), `.fc-kick` (whose page this is),
   `.fc-meta`, `.fc-sec`, `.fc-list` — and every kind moved onto it: the boxer off the shop's `.thing`
   row, the fight off a bare paragraph of names, the film's Watch
   tile out of a second tile row inside the card.
   THE FILM IS NOT ONE OF THEM ANY MORE: it left Find on 10 Oct (*"films should not appear in the finder
   it cannot be found there"*), and its card and Watch tile with it. The fixture's films are still put in
   this admin-shaped payload, and the list below asks that none of them reached Find — `film` was the one
   kind here whose rows only an admin is sent, so this is where a mapper coming back would show first.

   ASKED OF THE MARKUP, OVER THE REAL FILES THROUGH THE REAL MAPPER, so a kind added tomorrow with a
   card of its own shape is named here by kind. What it LOOKS like is `check/states.js`'s question
   (the boxer, fight and textbook states measure the title size, the flag above the title, and the
   list's indent in a real browser); this is whether every kind is made of the same pieces:

     - the card is `.card.fc`, and its first child is ONE `.fc-head` holding an `h3` and its flags;
     - every page after it is `.card.fc` whose first child is the `.fc-kick` and whose second is
       the page's `h3` — except a picture page, which is the picture;
     - no shop row (`.thing`), no inline style, no loose `p.note`, and no tile row
       INSIDE a card: the tiles are the row under it, one row, which `stuffCard` adds;
     - every numbered list is an `.fc-list`, which is what gives `10.` its room. */
```

### THE CARD'S OWN MARKUP, NOT A DRAWING'S.

top level, before `onCard`

```
/* THE CARD'S OWN MARKUP, NOT A DRAWING'S. A practical's diagram is hand-written SVG and some of it
     carries a `style` attribute of its own, which is the drawing's business rather than the card's.
     SO DOES A TEXTBOOK'S ANIMATION, and it is not SVG: the sieve's numbers, the coin's tallies and the
     sort's bars are HTML, each carrying its own `--kf`, `--h` or `--i` inline, which is how one rule
     is told apart across thirty elements. Seven of the 27 chapter pages were named here as "a stray
     shape" the first time the rows were real. What a drawing may carry inline is `check-anims.js`'s
     question — custom properties and its own `animation-name`, nothing else — so its stage is a
     drawing here, as an `<svg>` is. */
```

### THE FIGHTER'S PROFILE — FOUR JOURNEYS OVER THE REAL FILES ASKED FOR AS

top level, before `boxerApp_`

```
/* ==================================================================================================
   THE FIGHTER'S PROFILE — FOUR JOURNEYS OVER THE REAL FILES
   ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer. and make it look nicer.
   the wins losses etc."* Each is the claim the card makes, asked of the markup the app draws from
   `data/boxers.json` and `data/fights.json` through the real mapper — so a cell edited tomorrow is
   checked tomorrow, and a fixture cannot drift from what ships.

     a photo        Ali (the one row with one): an `<img>` with his name as its alt, the credit from
                    the row under it word for word, the record's three numbers as the row says, the
                    KOs under the wins, none under the losses (that cell is blank), and a bar whose
                    segments add up to 100 exactly.
     no photo       Joe Louis: the ring placeholder with his initials, and no `<img>` and no credit
                    anywhere on the card — a placeholder is not a broken picture. With them, the two
                    rows the licence rule and the blank rule turn on: an address with NO credit draws
                    the placeholder, and a fighter with no record says so instead of `0-0-0`.
     a broken URL   an address that fails: the `<img>` goes, the placeholder and nothing else is left,
                    the credit goes with it, and drawing the card again does not ask for it again.
     the bouts      Ali's fights page: one line per bout he is in, counted from the file by id rather
                    than by the function under test, newest first, the right opponent and the right
                    letter for each — and the fight card's two faces, the winner's framed.
================================================================================================== */
```

### ---------- AND THE CREDIT IS A LINK TO THE PHOTO'S OWN FILE PAGE

top level, before `file`

```
/* ---------- AND THE CREDIT IS A LINK TO THE PHOTO'S OWN FILE PAGE --------------------------------
     A CC BY or CC BY-SA photo is free on condition that its credit links to where the work and its
     licence can be read, so every Commons picture's credit is that link — the file page, named from
     the address's own file name (the thumbnail's size prefix is not part of it). Asked of the row's
     address by this check's own reading, so a wrong derivation in the app cannot agree with itself. */
```

### AND JOE LOUIS WITH NO PHOTO, IN THE COPY.

in `a`

```
/* AND JOE LOUIS WITH NO PHOTO, IN THE COPY. He was the no-photo boxer by accident of the file;
       when the photographs arrived he had one, and the journey stopped testing the placeholder at all.
       So the case is made here rather than found in the data. */
```

### ---------- SEVEN BOUTS A PAGE, AS MANY PAGES AS THAT TAKES

top level, before `PER`

```
/* ---------- SEVEN BOUTS A PAGE, AS MANY PAGES AS THAT TAKES --------------------------------------
     ONE PAGE OF FOURTEEN WAS DRAWN AT 70% ON A 320x568 PHONE — the floor, with the date line at six
     pixels — so the bouts are paged (`boxerFightPages_`). Asked of the file's count, not of the
     function's: fourteen bouts are two pages, every page but the last is full, the names he beat
     and lost to are on the first page only, each page's heading says which bouts it holds, and the
     pages read in order are every bout once, newest first. */
```

### ---------- THE EIGHT-BIT FIGHTER WEARS WHAT HIS ROW SAYS, AND A FIGHT WHAT THAT NIGHT'S ROW SAYS

top level, before `a`

```
/* ---------- THE EIGHT-BIT FIGHTER WEARS WHAT HIS ROW SAYS, AND A FIGHT WHAT THAT NIGHT'S ROW SAYS -------
   THE OWNER, 10 Oct: *"make the boxers retro avatar actually look more like the boxers and their
   shorts in the fight."* The figure is drawn from `look_*` and `trunks_usual` on the boxer and from
   `trunks_a` / `trunks_b` on the fight, through the real mapper, so each claim is asked of the real
   files and the markup the app draws from them:

     every profile   all 103: the figure's group carries exactly the words the row holds — skin, hair,
                     hair colour, facial hair, usual trunks — and NO word for a blank cell; the hair is
                     that style's own pixels (none at all for bald and shaved); the beard is its own;
                     the trunks' colour and trim are the custom properties the stylesheet paints from;
                     a side stripe only when there is a trim; a profile is never mirrored. EVERY
                     WOMAN (`sex` F, nine rows) is `bf-f` and wears the top, and a woman with no hair
                     on file is drawn with hair drawn back, NEVER the men's short cap; no man wears a
                     top. Before 10 Oct's review nothing read `sex`, and all nine were the bare torso.
     a known fight   Ali v Frazier, 8 March 1971: red/white in the red corner, green/gold in the blue,
                     each man's skin and hair from his own row, the blue corner mirrored to face left —
                     and NOT Ali's usual white/black, because the card dresses a corner in that night's
                     pair or in nothing.
     a blank fight   Johnson v Jeffries, 1910: no trunks word and no colour property in either corner,
                     so the stylesheet's fallbacks paint them the corner's colour, muted — and those
                     fallbacks are asked of style.css as well, because a renamed rule would leave the
                     property unset and the trunks the colour of nothing. Jeffries has no row: a
                     silhouette, no look claimed.
     a stranger      Cleveland Williams has no row and a known pair: the silhouette, in black trunks.
     a woman's bout  Laila Ali v Jacqui Frazier-Lyde, 2001: Frazier-Lyde has no row, and is a woman
                     because Ali is — both corners in a top.
     a misspelt cell Joe Louis given "whte/black" and "s7" IN THE COPY: no half-look — the corner's
                     colour and the silhouette's skin, the rest of his look as the row says.
   What the colours come out as in a real browser is `check/states.js`'s question; this is what was
   drawn and from which cell. */
```

### ---------- WHAT A BOXER READS ON EVERY FIGHTER'S CARD, ALL 103 OF THEM

top level, before `a`

```
/* ---------- WHAT A BOXER READS ON EVERY FIGHTER'S CARD, ALL 103 OF THEM -----------------------------
   THREE THINGS THE REVIEW FOUND BY READING THE CARDS AS A BOXER WOULD, each asked of every row in the
   file rather than of one example, because each was a fault on some rows and not others:

     the editor's to-do   "ACTIVE — record needs checking" was printed under Usyk's 24-0, and four
                          more like it. A note that says check or checking is the editor's and is not
                          drawn; EVERY OTHER NOTE IS — "Exhibition bouts excluded" qualifies a record
                          and belongs under it, so hiding too much is as red as hiding too little.
     Titles, or Honours   a section headed Titles with only a Hall of Fame badge under it told a boxer
                          that Tyson never won a belt. The heading is Titles exactly when the row
                          names one, Honours when it holds only an honour, and no section at all
                          when it holds neither.
     the weights          Pacquiao's eight divisions were six lines of the tape. Four or more are the
                          count and the lightest and heaviest; three or fewer are listed. */
```

### ---------- SHARING A BOOKING HANDS OVER A PICTURE OF IT

top level, before `bad`

```
/* ---------- SHARING A BOOKING HANDS OVER A PICTURE OF IT ------------------------------------------
   *"just make sure sharing booking is an identical jpg or png or whatevers best of the booking
   reciept."* It was `window.print()` — a PDF by way of the print dialogue — and this asks the three
   things the plumbing has to do, the three ways out in the order a phone takes them:

     1. a phone that can share files is handed ONE PNG FILE, the receipt's size at 2x, through
        `navigator.share` — and the SVG it was drawn from is the receipt the tile is on;
     2. a laptop that cannot share files gets a DOWNLOAD of that PNG, and is told so;
     3. a share sheet that is refused (Safari, when the picture took too long after the press) puts
        the picture in a sheet with a Share button of its own.

   JSDOM HAS NO LAYOUT AND NO CANVAS, so both are stood in for: the card's box is given a size, the
   canvas records what it is asked to draw, and an image "loads" when its source is set. What the
   picture LOOKS like is `check/share.js`'s question, in a real browser, pixel by pixel. This one is
   whether the press ends in the right place with the right file — which jsdom answers exactly. */
```

### UNTIL IT HAPPENS, NOT FOR A FIXED BEAT.

top level, before `till`

```
/* UNTIL IT HAPPENS, NOT FOR A FIXED BEAT. The picture is drawn from a clone of the receipt with
     every element's style copied across, which is a few milliseconds alone and more than 120 under a
     full suite with agents beside it — where this journey failed with "handed 0 shares" on 8 Oct and
     passed alone. A wait that is long enough on a quiet machine is a race, so each step waits for
     its own outcome, up to three seconds, and a press that truly does nothing still fails. */
```

### ---------- THE CHAT, POLISHED: WHAT WAS NEW STAYS MARKED, AND THE COMPOSER FITS

top level, before `bad`

```
/* ---------- THE CHAT, POLISHED: WHAT WAS NEW STAYS MARKED, AND THE COMPOSER FITS ------------------
   *"also refine the chat widgetts. looks fine but refine please."* Three of the changes are
   behaviour rather than paint, and this asks each of them of the real column in jsdom:

     1. A MESSAGE THAT ARRIVED UNREAD IS OUTLINED ON THE DRAW THAT READS IT. `dmPages_` marks a
        thread read before it renders it, so the outline never showed and the head's "2 new" sat
        over nothing marked new. `fresh` is set by `markRead_`, so it must survive a second paint
        (the poll's) and go when the server's next answer replaces the objects.
     2. The composer's hint is "Message…" and the person's name is its `aria-label`.
     3. A refusal's sentence is its own element, so it can sit on the bubble's side.
   And the empty inbox names the door that starts a conversation, because the column has none. */
```

### ---------- A TUTOR WITH NO HOURS CANNOT BE BOOKED BY NAME

top level, before `w`

```
/* ---------- A TUTOR WITH NO HOURS CANNOT BE BOOKED BY NAME ---------------------------------------------
   ASKED FOR AS *"tutor with no hours wont be bookable."* An empty grid meant every hour open. Now the
   tutor dropdown draws them disabled with the reason beside the name, a change that names them
   anyway is refused, the hour grid shuts every hour and says why, and the send stops before
   `createJob` — while a tutor WITH hours, and `No preference`, book exactly as before. */
```

### ---------- THE WEEK OF YOUR SESSIONS: YOURS, EVERY DAY OF THEM, AND ONLY WHILE THEY RUN

top level, before `w`

```
/* ---------- THE WEEK OF YOUR SESSIONS: YOURS, EVERY DAY OF THEM, AND ONLY WHILE THEY RUN ---------------
   ASKED FOR AS *"calander and time table and availability ... it seems they clash"*. `weekSessions_`
   is what every week of sessions reads, and it had three faults as `weekGrid`: a Monday-and-Friday
   booking lit Monday only, a stranger's open session was on a parent's week, and a booking that
   ended in the summer was still there in the autumn. Asked of the real function over jobs shaped as
   `doGet` sends them — `day` the joined weekday cell, `dates` the comma list of session dates. */
```

### ---------- THE TIMETABLE IS THE ONE WEEK: YOUR SESSIONS LOCKED IN IT, AND IT IS ON YOUR ACCOUNT

top level, before `w`

```
/* ---------- THE TIMETABLE IS THE ONE WEEK: YOUR SESSIONS LOCKED IN IT, AND IT IS ON YOUR ACCOUNT ---------
   `Your week` drew the sessions booked here and the Timetable what somebody wrote; they are one widget
   now. Asked of the real handlers: a booked session is in the day's list among the lessons, in time
   order, as a row that opens the session (`job`) and has no boxes; a Saturday session shows the
   weekend; `Your week` is not on the Tools column any more. Then the account: a lesson typed while
   signed in is posted as `saveTimetable` with the person's id and the widget's own shape, a week
   already on this phone under their key is carried up the first time, a week on the account is drawn
   from `USER.timetable` on a phone that has nothing, and signed out it stays on the device. */
```

### ---------- A BANK HOLIDAY IS NOT A SESSION, AND IS NOT CHARGED FOR

top level, before `w`

```
/* ---------- A BANK HOLIDAY IS NOT A SESSION, AND IS NOT CHARGED FOR ---------------------------------
   `computeSessionDates` walked every week of a term, so the Early May bank holiday inside Summer 1 was
   a date on the receipt and a share of the price. `DATA.closures` is `closures()` off the backend, and
   a closed date is stepped over — which the count and the price follow without being told. Asked of
   a window four weeks out, so the journey does not depend on what month it is run in. */
```

### ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT IS THE TUTOR'S OWN, ELSE THE CONFIG DEFAULT (docs/history/345)

top level, before `w`

```
/* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT IS THE TUTOR'S OWN, ELSE THE CONFIG DEFAULT (docs/history/345) ------
   The owner, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card. Like they can edit that
   small number to the right of their normal rate"*. The cut was ONE config number (`B`) for every tutor; it is
   `extraSeatCut` on each tutor's row now, and a blank one is `B`. `seatShare_` is the one reader, so this asks the
   three things it feeds: the card's `+£X/h a seat` (`profSeat_`, and the card `findCard` draws), the quote
   (`priceFrom`'s seat multiplier and total) and the split of the seat money between the tutor and the business
   (`tutorPay` and `profitTotal`, which become the job row's `tutor_pay` and `admin_profit`). Four tutors at £30 with
   their own share 0.5, under a config of c 0.3 and B 0.1: a BLANK cut and an OLDER BACKEND that sends no key at
   all are priced exactly alike, from B (a seat is 0.6 of the rate); their own 0.2 is priced from it (0.7) on the
   card AND in the quote AND in the split; and NOUGHT is no cut — the business keeps nothing of the seat and the
   tutor all of it — where blank is the default. A tutor whose own share is blank still draws c (0.3 + 0.1). */
```

### ---------- THE CALENDAR SHOWS EVERY DATE THE APP KNOWS

top level, before `w`

```
/* ---------- THE CALENDAR SHOWS EVERY DATE THE APP KNOWS ------------------------------------------------
   It drew exams and birthdays and nothing else. Now: your sessions on their own dates (and nobody
   else's), a term's first day, every day of a half term, a bank holiday off `DATA.closures`, a festive
   event, and an exam — each a dot of its own kind, a key under the month naming only the kinds on
   it, and a tap on a day listing what is on it. Seeded in THIS month so the drawn widget shows it. */
```

### MULTI-PART QUESTIONS — THE FOLLOW-UPS TO THE OWNER'S

top level, before `mpRow_`

```
/* ==================================================================================================
   MULTI-PART QUESTIONS — THE FOLLOW-UPS TO THE OWNER'S *"can you see any clashes or bugs or counter
   intuitive things which occur with current system to keep questions in order while keeping the
   diagram in its own widget … multiple parts … like 1b 1c 1di 1dii"*. Each journey is one finding of
   the audit that answered it, through the app's own builders. `FLOW_ONLY=multipart` runs them alone.
================================================================================================== */
```

### A SMALL LIBRARY OF MULTI-PART QUESTIONS, made into the funnel's own items by `questionItems` and handed to Find as its whole list -- `stuffItems` replaced, so

top level, before `mpLibrary_`

```
/* A SMALL LIBRARY OF MULTI-PART QUESTIONS, made into the funnel's own items by `questionItems` and
   handed to Find as its whole list -- `stuffItems` replaced, so the memo keyed on `DATA` cannot hand
   back the fixture's. Returns a function that puts everything back. */
```

### FINDING 9, AFTER THE TILE WENT.

top level, before `w`

```
/* FINDING 9, AFTER THE TILE WENT. The multi-part audit found the ↓ tile's note saying "next page" over a
   figure, and a drawing page with no way on from it. The owner, 8 Oct: *"there doesnt need to be a scroll
   down tile on questions"* -- so the answer is a swipe, and what has to be right is the strip itself: the
   answer straight after the card -- or after a figure the paper prints after the words; there is no
   drawing page any more (327, 337: the drawing is the card's other face) -- and no page of a question
   carrying a tile that turns for you. */
```

### THE OWNER: *"they have their own tag. i could in theory just click answers and only see answers."* -- and then, 6 Oct:

top level, before `w`

```
/* THE OWNER: *"they have their own tag. i could in theory just click answers and only see answers."* --
   and then, 6 Oct: *"The answers should just be another tag at the start of the funnel menu. You
   complicated it."* So `Answers` is one of What kind's answers, beside `Questions`. Chosen, the strip is
   the answer pages only, in order, OPEN -- choosing it is asking for them -- with Hide still hiding one;
   its chip's cross takes it off. No tile on the answer page offers it any more. */
```

### ---------- AND "Questions" MEANS QUESTIONS

top level, before `S.filters`

```
/* ---------- AND "Questions" MEANS QUESTIONS -------------------------------------------------------
       THE OWNER, 8 Oct: *"answers shouldnt even be showing up when all ive done is clicked questions. the
       answers still show up."* This said "Questions IS AS IT WAS: questions with their answers after
       them", and that was the fault. Chosen: question pages and no answer page. With no kind chosen (the
       paper alone): every answer page still straight after its question's card, where *"the answers
       should appear after their questions"* (5 Oct) put it. */
```

### ---------- QUESTIONS CHOSEN: NOT ONE ANSWER ON ANY PAGE, FOR A PUPIL OR A TUTOR

top level, before `w`

```
/* ---------- QUESTIONS CHOSEN: NOT ONE ANSWER ON ANY PAGE, FOR A PUPIL OR A TUTOR ------------------------
   THE OWNER, 8 Oct, signed in as a pupil on an iPad: *"answers shouldnt even be showing up when all ive
   done is clicked questions. the answers still show up."* Every page of a two-part paper drawn as Find
   draws it, with Questions chosen, as a student and then as a tutor -- *"Should behave the same whether
   it's a tutor or child"* -- and not one of them is an answer page, says "Answer", or carries the
   answer's words anywhere in its markup. (A wrong tap's "Not yet — see Answers", which names the chip
   rather than a page that is not there, is the marking journey's.) */
```

### ---------- WHAT KIND: QUESTIONS FIRST, ANSWERS BESIDE IT

top level, before `w`

```
/* ---------- WHAT KIND: QUESTIONS FIRST, ANSWERS BESIDE IT --------------------------------------------------
   MEASURED ON 8 OCT: the first question Find asks offered `Answers | Bundles | Films | Practicals | Projects
   | Questions | Resources` -- the alphabet -- so Answers was the first chip, top left where a thumb lands,
   and one tap on it opens every answer at once. In `KIND_BUCKET`'s order now (`orderOf`): Questions, then
   Answers, its pair. Asked of the facet's own order and of the chips it draws over a real list.
   AND `Films` IS NOT IN THE ORDER AT ALL since 10 Oct (*"films should not appear in the finder it cannot be
   found there"*): the table no longer places it, so `orderOf` answers -1 for it, and the order of the six
   left is the one it was with Films taken out from between Bundles and Resources. */
```

### ---------- FILMS ARE NOT IN FIND, FOR ANYBODY — AN ADMIN WITH THE FILMS IN HAND INCLUDED

top level, before `read`

```
/* ---------- FILMS ARE NOT IN FIND, FOR ANYBODY — AN ADMIN WITH THE FILMS IN HAND INCLUDED ---------------------
   THE OWNER, 10 Oct: *"films should not appear in the finder it cannot be found there"*. Find had a `Films`
   kind, a card and a Watch tile over `DATA.films`; a film is found in Games → Videos. AN ADMIN IS THE ONLY
   PERSON THIS CAN BE ASKED OF, because nobody else is sent a film (`filmsFor_`, note 068) — a student's Find
   has no films whether the mapper is there or not, so asking a student would pass with the fault in place.

   THREE DOORS, EACH THE WAY A PERSON USES IT, AND THE SETUP PROVED FIRST (the admin's `DATA` holds the
   seven): the title typed into Find's own search box, through its own input handler and debounce; every
   other title and a word only a film's notes carry (`XY9`), asked of the filtered list; `What kind`'s chips
   as the question page draws them, pressing `What for` → Learning first if it is asked, and the facet's own
   answers over the whole list. THEN THE VIDEOS CARD FINDS THE SAME FILM, or this would pass on a payload
   that had lost its films. */
```

### THE PROJECTS AND THE PRACTICALS, REAL, so `What kind` has answers of its own to draw — the fixture has no library, and a Learning holding nothing but films

top level, before `read`

```
/* THE PROJECTS AND THE PRACTICALS, REAL, so `What kind` has answers of its own to draw — the fixture has no
     library, and a Learning holding nothing but films would ask What kind only when the films are there,
     which is the fault and not a setup. Through the real mapper, as the textbook journey does.
     THE PRACTICALS AND NOT THE TEXTBOOKS SINCE THE SECOND FINDER (docs/history/329): while the textbooks
     lived in the Resources column, Find's Learning held one kind — Projects — and a question with one
     answer is skipped. Find carries the textbooks again (347), but the practicals stay: they are Find's own
     sibling of Projects (`KIND_BUCKET`), so the page is What kind whichever finder holds what. */
```

### THE REVIEW OF THE MERGE WITH THE PEN'S BRANCH, FINDINGS 1 AND 5:

top level, before `w`

```
/* THE REVIEW OF THE MERGE WITH THE PEN'S BRANCH, FINDINGS 1 AND 5: a part that USES an earlier part's
   drawing ("use your graph") is neither "not drawn yet" -- the figure it names is the child's own --
   nor offered that part's blank paper copy under Figure. A later part that does not use it still is. */
```

### ANSWERS FOLLOW THE CHILD, AND SIGNING IN ON A SHARED iPAD.

top level, before `ANS_ADA`

```
/* ==================================================================================================
   ANSWERS FOLLOW THE CHILD, AND SIGNING IN ON A SHARED iPAD.

   THE OWNER, LIVE, ON A PUPIL'S iPAD: *"i just relogged in as [the child] after having done the
   questions earlier and i dont see his answers there"*, *"it doesnt seem to save their answers"*, *"i am
   very dissapointed it didnt have his answers already written in when he went to see them on the
   computer"*, and *"the logging in and everything feels so janky and unresponsive and slow… i feel very
   insecure when signing into the kids accounts"*. js/answers.js is the phone's half of the answers;
   `signedIn_` / `signedOut_` in me.js are the one way in and out. Every journey below goes through the
   real handlers and the real `api()`, and the backend's half is `check-saved-answers.js`. The children
   are invented — Ada and Ben — because this repository is public.
================================================================================================== */
```

### AND AN ANSWER TOO LONG FOR THE ACCOUNT (ANSWER_TEXT_MAX):

top level, before `CEIL`

```
/* AND AN ANSWER TOO LONG FOR THE ACCOUNT (ANSWER_TEXT_MAX): never sent, never due — it would be refused
     for ever — and the line under the box does not claim a save that never happened.
     THE CEILING READ FROM js/answers.js, NOT WRITTEN HERE: it was 2,000 and this said `2001`, and on 9 Oct
     it went to 20,000 because an essay is an answer (docs/history/312) -- a number copied into a check is
     a check that fails the day the rule it holds is changed on purpose. */
```

### EVERY BOX SURVIVES A RELOAD (docs/history/317).

top level, before `keptStore_`

```
/* ==================================================================================================
   EVERY BOX SURVIVES A RELOAD (docs/history/317).

   THE OWNER, 9 Oct, during a lesson: *"[the child] accidentally refreshed on his computer when doing the
   english language question. this lost him all his progress on his answer. the box should be
   autosaving his work like everywhere else should be doing this."* Three hunts in a real browser found
   the two ways the essay was lost — a store that refused the write and a session the server ended — and
   a stale second tab that wrote one letter over it. Each is a journey here, through the real handlers,
   and so is the reload itself: a first boot types, the page goes away (`pagehide`), and a SECOND BOOT
   starts from exactly the storage the first one left, the way the splash journey boots twice. The
   children are invented, Ada and Ben, as above. Signed in on the live backend's shape — no
   `saveAnswers`, so the device is the only copy, as it was on 9 Oct.
================================================================================================== */
```

### THE FIRST PAGE NEVER HEARS BACK:

top level, before `one`

```
/* THE FIRST PAGE NEVER HEARS BACK: Apps Script is still answering when the page goes, and the browser
     ABORTS what is still out as the page goes — which reaches each `.catch` as a failure (measured in
     Chromium: that failure gave the draft back on the way out, and the reload drew the message again). */
```

### ADA, STILL AT THE COMPUTER, TYPES ON INTO THE EMPTY BOX — and into the maths box, which she had left empty while she was signed in — DRAWS on the pad drawn

top level, before `bare`

```
/* ADA, STILL AT THE COMPUTER, TYPES ON INTO THE EMPTY BOX — and into the maths box, which she had
     left empty while she was signed in — DRAWS on the pad drawn empty, and RINGS A WORD. Every kind of
     answer, so every door that moves one is asked: the claim, the box (`ansRead_`), the pad
     (`padAdopt_`) and the passage (`circOf_`, which asks `padAdopt_` and then the visit's rings). */
```

### ADA AGAIN, AS SHE WOULD:

top level, before `token`

```
/* ADA AGAIN, AS SHE WOULD: Ben signs out, and she signs in from nobody with a new session. EVERYTHING
     SHE TYPED SIGNED OUT IS HERS AND NONE OF IT IS LEFT (review of the merge, P1). "More words" was typed
     into the hole the ended session left, beside the essay and not over it: "the later edit wins" must
     not put ten characters in place of three thousand, and leaving them under the signed-out key left
     them out of her answer for good and in the box for every signed-out visitor after her. So they go
     after her essay. Her stroke goes beside the one she had; what she typed into empty boxes moves in. */
```

### ---------- AND THE RECORD OF WHOSE IT IS IS KEPT AS CAREFULLY AS THE ANSWER (review of the merge)

top level, before `ansEndedBoot_`

```
/* ---------- AND THE RECORD OF WHOSE IT IS IS KEPT AS CAREFULLY AS THE ANSWER (review of the merge) -------
   `familyGone` and `familyGoneKeys` were bare `setItem`s: a browser keeping no site data lost both, a full
   store lost them, and the tidy-up in `ansGoneMark_` took the mark off an answer the visit was holding.
   Each time the next child to sign in was given the answer. */
```

### ONE — THE STORE HAS ROOM FOR A MARK, NOT FOR THE WORDS (review of the merge, P6).

top level, before `server`

```
/* ONE — THE STORE HAS ROOM FOR A MARK, NOT FOR THE WORDS (review of the merge, P6). The words are held for
     the visit and marked; typing in the next box tidied the mark away, because the words were not in
     `localStorage`; room came back as the page went, the words landed unmarked, and Ben was given them. */
```

### TWO — THE STORE REFUSES THE MARKS THEMSELVES.

top level, before `server`

```
/* TWO — THE STORE REFUSES THE MARKS THEMSELVES. The answer is the visit's until its mark is on the
     device too: written alone it would be on the device with nothing to say whose, and anybody's after a
     reload. Said under the box as any refused write is. */
```

### SIX EDGES OF "WHOSE IS IT" (docs/history/317, "Six edges closed").

top level, before `edgeBoot_`

```
/* ==================================================================================================
   SIX EDGES OF "WHOSE IS IT" (docs/history/317, "Six edges closed").

   THE RULE: on a shared device, anything a child typed, drew, ringed or drafted signed out after the
   SERVER ended their session is that child's — never moved into, shown in, claimed by or sent from
   anybody else's account, and back with them when they sign in again. Anything else made signed out is
   claimed by whoever signs in next from nobody (318: the same seat). `ansMayMove_` (answers.js) decides,
   and every door that moves one asks it. A verifier found six doors that did not ask, or asked about the
   wrong copy; each journey below was red on the code before the fix.

   A BACKEND PER PERSON, because "sent to Ada's account" is a question about Ada's rows — one `server`
   shared by everybody would hand Ben's rows back in Ada's sign-in reply. `FLOW_ONLY=edges:` runs them.
================================================================================================== */
```

### ADA, STILL AT THE COMPUTER, DRAWS ON THE SIGNED-OUT BOARD — with the store refusing the record of whose it is, at first:

top level, before `S`

```
/* ADA, STILL AT THE COMPUTER, DRAWS ON THE SIGNED-OUT BOARD — with the store refusing the record of whose
     it is, at first: the board waits in the visit for its mark (`keepWaits_`), as an answer does, rather
     than landing on the device with nothing to say it is hers. */
```

### AND A BOARD WITH NO ENDED SESSION BEHIND IT IS STILL THE DEVICE'S (note 310), moved only into an EMPTY board, by opening it:

top level, before `visitor`

```
/* AND A BOARD WITH NO ENDED SESSION BEHIND IT IS STILL THE DEVICE'S (note 310), moved only into an EMPTY
     board, by opening it: Ada signs out, the next visitor draws on the signed-out board, and Cal signs in
     from nobody with a board of his own. His stays his; the visitor's is not claimed over it. */
```

### THE HOUR PASSES. The next visitor has no session behind them and WRITES OVER THE WHOLE of the maths answer — the box selected and typed over, as a paste does

top level, before `who`

```
/* THE HOUR PASSES. The next visitor has no session behind them and WRITES OVER THE WHOLE of the maths
     answer — the box selected and typed over, as a paste does it. What is in the box is theirs now, not
     Ada's, and it follows whoever signs in next from nobody, as anything made signed out does (318). */
```

### AND PRESSES UNDO ON HER DRAWING:

top level, before `leftP`

```
/* AND PRESSES UNDO ON HER DRAWING: her long stroke goes, and what is left is her short one and nothing
     else — still hers. A drawing is kept while any stroke of the old one is in it; compared as text, the
     one short stroke is a fifth of what was there, and would have read as a new drawing over hers. */
```

### ---------- AND THREE MORE, FOUND BY THE VERIFIER OF THE SIX (317, "Undo, the booking form, a switch")

top level, before `edgeKey_`

```
/* ---------- AND THREE MORE, FOUND BY THE VERIFIER OF THE SIX (317, "Undo, the booking form, a switch") ----------
   UNDO: the two features built for slips — the pen's Undo after Clear, the keypad's Ctrl+Z — put an emptied
   answer back as though it had just been written, so a child's own work came back with nobody's mark (or
   with the mark of whoever's ended session was fresh), and went to the next child. THE BOOKING FORM: signing
   back in, the form typed signed out was written over the person's own draft. A SWITCH: signed in over
   somebody, opening a card or the board still handed the arriving child what another tab made signed out.
   Each journey below was red on the code before. */
```

### ONE — A QUESTION'S PAD (U1).

top level, before `b`

```
/* ONE — A QUESTION'S PAD (U1). Ada draws signed out after the server ended her session: hers. Ben signs in
     and out, which ends the hour's note (`familyGone`). The next visitor's finger slips onto the bin, 4px
     from Undo, and Undo puts the stroke back. Then, while CAL'S ended session is fresh, the same again. */
```

### THREE — THE HOUR HAS PASSED (U2b, U3):

top level, before `b`

```
/* THREE — THE HOUR HAS PASSED (U2b, U3): a held Backspace to empty, then Ctrl+Z; then one letter over all of
     it, which takes her mark off (P7), and Ctrl+Z, which puts it back with the words; and ⇧Ctrl+Z, which
     puts the visitor's letter back as nobody's again. */
```

### AND THE ADDRESSES ARE ASKED ON THEIR OWN.

top level, before `w`

```
/* AND THE ADDRESSES ARE ASKED ON THEIR OWN. A form nobody's (a visitor's, left on the device) is on the
     screen when the server ends Ada's session; she types an address into its box and leaves it unsent. Ben
     signs in next from nobody: the form is his seat's (318), the address is hers. */
```

### THE TWO "NOT DONE"s OF NOTE 317, CLOSED AT THE MERGE.

top level, before `bad`

```
/* THE TWO "NOT DONE"s OF NOTE 317, CLOSED AT THE MERGE. One Backspace on a two-character answer kept one
   of its two characters, which is half and not more than half — so the last digit of Ada's "80" was a new
   answer by nobody and went to whoever signed in next. And a device draft marked as somebody's was swept
   after six hours like a stranger's, while her answers marked the same way wait for her with no limit. */
```

### BEN'S INBOX DOES NOT ARRIVE — the server is slow, then refuses.

top level, before `asked`

```
/* BEN'S INBOX DOES NOT ARRIVE — the server is slow, then refuses. That is the moment the last child's
     messages, if they were still held, are what the column falls back to drawing (`loadMessages` keeps
     what it had on a failure, so a blip does not read as an empty inbox). */
```

### ---------- NO EXAMPLE IN THE SIGN-IN BOX; THE ADMIN'S OWN NAME WHERE THIS DEVICE KNOWS IT

top level, before `ADMIN`

```
/* ---------- NO EXAMPLE IN THE SIGN-IN BOX; THE ADMIN'S OWN NAME WHERE THIS DEVICE KNOWS IT ----------------
   The owner, 9 Oct: *"remove the example login ... let it be the admin login name."* A fresh device's box is
   blank; once an admin has signed in here, its grey text is what they typed (an address or a handle), and a
   child signing in after them does not replace it; ✕ on the admin's chip forgets it. Never a PIN. */
```

### ---------- SIGNING IN FROM SIGNED OUT IS THE SAME SEAT, SO FIND KEEPS ITS PLACE

top level, before `KEEP_SOL_`

```
/* ---------- SIGNING IN FROM SIGNED OUT IS THE SAME SEAT, SO FIND KEEPS ITS PLACE -----------------------
   THE OWNER, 9 Oct: *"when the child writes something in an answer box then goes to sign in, it wipes
   their finder so they have to click all the way to get back there."* `signedIn_` ran `signedOut_` when
   NOBODY had been signed in as well, and `signedOut_` empties Find's search and chips — written for an
   admin leaving an admin-only shelf named on Find (docs/history/318). So this is the child's whole
   errand, on the real handlers: the funnel walked by pressing its own chips over REAL rows of
   data/questions.json (three Edexcel papers and a Corbettmaths sheet, so it has questions to ask) down
   to June 2023 1H Q13; that card's page; "80" typed on the keypad, signed out; across to the account
   column; the handle and the PIN typed and Sign in pressed, as a student. Back on Find: the same chips,
   the same card on the same page, and the answer in the box under the student's key with the signed-out
   copy gone (`ansRead_` moves it). THEN THE STUDENT'S OWN PAYLOAD LANDS, held until now, and the list
   under the card is longer — a signed-in child can be shown more (their friends answer a search), played
   here by one more library row in front of Q13, which the next payload's `libraryInto_` reads — and the
   child is still on Q13, wherever its page has moved to. */
```

### ---------- AND THE TWO WAYS THAT STILL START FIND AGAIN

top level, before `bad`

```
/* ---------- AND THE TWO WAYS THAT STILL START FIND AGAIN ------------------------------------------------
   KEEPING FIND IS FOR NOBODY → SOMEBODY ONLY. An admin signing out from a shelf only admins see leaves it
   named on a signed-out phone if Find is kept (the review of the Bible, recorded in `signedOut_`), and one
   child signing in over another is the next person, not the same seat: both still clear the search and
   the chips, through the real Sign out tile and through `signedIn_`, the door every sign-in uses. */
```

### ---------- A SESSION THAT ENDS UNDER THE CHILD IS THE OWNER'S COMPLAINT BY ANOTHER DOOR

top level, before `KEEP_KIT_`

```
/* ---------- A SESSION THAT ENDS UNDER THE CHILD IS THE OWNER'S COMPLAINT BY ANOTHER DOOR -----------------
   FOUND BY THE REVIEW OF 318, and identical on the commit before it: a child signed in on the family iPad
   walks to Q13 and types "80"; the answer goes up a second and a half later on a token the server has
   ended (thirty days, or the PIN changed on another phone) and is refused `why: 'signed-out'`; `api()`
   signs the phone out through `signedOut_`, which emptied Find under the card they were reading. Then the
   child signs in again and starts from the first question — *"it wipes their finder"*, exactly. Nobody
   left, so Find stays (`ended`), and `STUFF.whose` hands it back to that child alone. The counter-cases:
   the next child signing in over the dead session starts again, and so does an admin's dead session —
   the one Find that can name a shelf only an admin is shown. */
```

### ---------- WHAT WAS TYPED SIGNED OUT IS DECIDED AT SIGN-IN, AND NONE OF IT IS LEFT FOR THE NEXT CHILD

top level, before `acct`

```
/* ---------- WHAT WAS TYPED SIGNED OUT IS DECIDED AT SIGN-IN, AND NONE OF IT IS LEFT FOR THE NEXT CHILD ------
   FOUND BY THE REVIEW OF 318, and identical on the commit before it: the signed-out answer moved only into
   an EMPTY box (`ansRead_`), so an older answer on the account — put in the box by the sign-in reply —
   beat the one typed a minute ago, and the "80" stayed under the signed-out key until the NEXT child
   opened Q13, when it moved into their box and up to their account. `answersClaim_` decides every one at
   sign-in, by when each was typed: Ada's account has an older answer in the words box (the signed-out one
   wins and goes up) and a later one in the keypad box (the account's stays); a drawing typed before signed-
   out answers were dated fills an empty box. Then Ada signs out, Ben signs in: nothing of Ada's in his
   boxes, nothing sent to his account. */
```

### ---------- A PAYLOAD ASKED FOR BY SOMEBODY WHO HAS SINCE SIGNED OUT DOES NOT LAND

top level, before `hold`

```
/* ---------- A PAYLOAD ASKED FOR BY SOMEBODY WHO HAS SINCE SIGNED OUT DOES NOT LAND ---------------------------
   FOUND BY THE REVIEW OF 318: `load()` adopted whatever landed. An admin's payload — asked for by every
   sign-in, fifteen to thirty-five seconds on the wire — that lands after Sign out put the whole film list
   back on a signed-out phone, the Drive links with it (note 068), a moment after `signedOut_` had emptied
   it; and the signed-out funnel offered "Films", a chip a visitor could press and carry into the next
   child's Find. Now a payload whose person has gone is not adopted, and one is asked for whoever is here.
   THE SETUP ASKED THAT THE ADMIN'S FIND HELD THE FILMS, and Find holds none for anybody since 10 Oct — so
   the setup is the admin's `DATA.films`, which is what the late payload would put back. "Films" is still
   refused on the signed-out funnel: absent for a second reason now, and wrong for either. */
```

### ---------- AND FIND 2 THE SAME, NOW THAT IT HOLDS THE QUESTIONS (docs/history/347)

top level, before `w`

```
/* ---------- AND FIND 2 THE SAME, NOW THAT IT HOLDS THE QUESTIONS (docs/history/347) ---------------------
   The owner's use of the second finder is a child answering in one column with a chapter up in the
   other — so either can hold the box being typed in. `findKeep_` was Find's alone while the second
   column held only the resources, which have no answer box; left so, a payload landing under a child
   typing in Find 2 rebuilt it under her — the diag-signin fault above, on the other column. */
```

### ---------- AN ORDERING IS TAPPED IN ORDER, ON THE REAL CARD

top level, before `ID`

```
/* ---------- AN ORDERING IS TAPPED IN ORDER, ON THE REAL CARD ----------------------------------------
   THE OWNER, 8 Oct, of June 2024 Foundation Paper 1 Q4: *"I would prefer it be like an ordering
   system?? Idk. But simpler to mark for a machine."* (docs/history/303). The REAL row, out of
   data/questions.json, through the real loader (library.js) and Find's own `questionItems`, drawn by
   `questionCard_` and pressed by CLICKS, so the app's own dispatcher and the answers' "send at once"
   listener are what run: tap, tap a placed one back out of its slot (a hole, nothing slides), its
   ghost pressed and nothing happening (a double-tap undid itself), the keyboard's focus handed on,
   Clear, Send on an empty strip, the reversed row, one swap, the right row; the verdict in its
   reserved line and the question not redrawn; the stored positions, on the account at once on Send,
   the day it was done, drawn again from the store, and a row from another device redrawn where it
   stands. And a typed list left under the same key from before, which must draw an empty strip.

   AND A SECOND, MADE-UP ROW WITH TWO RIGHT ORDERS (`2,1,3 | 1,2,3`), served beside Q4, because no
   library row has two yet and so nothing proved the loader keeps the second: changed to keep only the
   first, this journey, check-library and check-marking all stayed green (check-marking feeds
   `markOrder_` hand-written arrays, never the loader's). The second order, tapped and sent, must say
   "Correct". jsdom lays nothing out -- that marking moves nothing in PIXELS is `check/states.js`'s. */
```

### THE GHOST DOES NOTHING -- a quick second tap on the item just placed undid it (two real touch taps 70ms apart on 0.2: in, and straight back out).

top level, before `ghost5`

```
/* THE GHOST DOES NOTHING -- a quick second tap on the item just placed undid it (two real touch taps
     70ms apart on 0.2: in, and straight back out). `disabled`, so the press never arrives, and the
     handler refuses it too, which is the half that does not depend on the browser: pressed directly. */
```

### ---------- A CHILD IS HER FIRST NAME ON EVERY SCREEN, FOR EVERYBODY

top level, before `SUR_`

```
/* ---------- A CHILD IS HER FIRST NAME ON EVERY SCREEN, FOR EVERYBODY -------------------------------
   THE OWNER, 10 OCT: *"also side note dont show children's last name."* (docs/history/333).

   THE PAYLOADS ARE THE REAL BACKEND'S, NOT A FIXTURE. A fixture written to say "Wren" would prove only
   that the phone draws what it is given — and the whole risk is what it is given. So the people, her
   post, her reactions, her booking with her whole name in the events and in `for_children`, her
   message to the admin and her family link go into the in-memory sheet of `check-gas-load.js`, each
   visitor signs in through the real `verifyLogin`, the phone boots on the real `doGet` for that
   visitor's token, and every POST it makes is answered by the real `doPost`. Then every screen and
   every page of it is drawn, and her surname must be nowhere in the document — text, attributes,
   anything — for a visitor, her tutor, another parent and an admin.

   AND FOR HERSELF, ON A PHONE SIGNED IN BEFORE 10 OCT: `familyUser` still holding her whole name, the
   way thirty days of sessions do. The first open asks `myProfile`, which carries her name as the server
   says it now (`profileRefresh_`), so her You card and her greeting are her first name too. The one
   place it may be is her own Settings, in the box that edits it — so for her, those boxes are left out
   of the search and nothing else is.

   AND JUNO, WHO TICKED TUTOR IN HER OWN SETTINGS (the review of 10 Oct). The tick is a request the
   business has not answered (`listed` PENDING), so she is a child still — but the first version of the
   rule asked `mainRole`, which called her a tutor, and her whole name was drawn under her comment for
   a visitor, on her tutor's roster and on everybody's score board. She books and comments here, and her
   surname is hunted on every screen beside Wren's. */
```

### AND A PARENT'S SURNAME, SINCE 11 OCT (docs/history/342):

top level, before `GROWN_`

```
/* AND A PARENT'S SURNAME, SINCE 11 OCT (docs/history/342): *"don't show surname as some kids have different
   surnames and gets a bit awkward"*. Pip's and Ola's surnames are hunted on every screen of every visitor
   but themselves and the admin — who must still see Pip's, or a rule that took every name out would pass.
   Pip is a visitor here too, so her own whole name is drawn for her and Ola's is not.
   AND WREN SEES HER OWN PARENT'S (342, round 2): a child is shown the whole name of a grown-up on her own
   family row (`netKin_`) — the claim card is where she decides whether somebody is her parent, and her
   parent's whole name is what she tells the next claim apart by. So Pip's surname is not hunted for Wren, and
   must be drawn for her somewhere, or that half would be unseen; Ola's still is. */
```

### HER OWN BOXES, AND NOTHING ELSE, are where her surname belongs — on Settings, and on her own card's Edit, where her name is edited since docs/history/339

in `look`

```
/* HER OWN BOXES, AND NOTHING ELSE, are where her surname belongs — on Settings, and on her own card's Edit,
         where her name is edited since docs/history/339 (its review: the walk never opened it, so a surname in the
         editor's heading, its handle line or anywhere but the box itself would have passed). */
```

### ---------- A CHILD WHOSE HANDLE WAS MOVED STILL GETS IN, AND IS TOLD WHAT IT IS NOW (docs/history/342)

top level, before `movedWorld_`

```
/* ---------- A CHILD WHOSE HANDLE WAS MOVED STILL GETS IN, AND IS TOLD WHAT IT IS NOW (docs/history/342) -------
   The owner, 11 Oct: *"Change usernames to be more abstract to hide the names of kids. Just use initials…"*
   `?run=kidHandles` moves every child's handle to their initials and four digits — and seven in eight of
   them have no email and sign in with the handle written on a slip. THE REAL BACKEND, a child whose
   handle has moved (`handle_was` holds the old one): typed into the real sign-in box, the old one signs
   her in, and the sheet she closes says the new one. */
```

### ---------- AND A PHONE SIGNED IN BEFORE THE MOVE LEARNS IT ON ITS NEXT OPEN, ONCE

top level, before `b`

```
/* ---------- AND A PHONE SIGNED IN BEFORE THE MOVE LEARNS IT ON ITS NEXT OPEN, ONCE ------------------------
   `familyUser` holds the handle and the friends list the sign-in reply carried, for the thirty days a
   session lasts — so a child whose handle the business moved while she was signed in was shown her old
   one, and her friends list named handles that no longer exist (the next "Add a friend" would post them
   back). `myProfile`, asked on every open, carries both now: the phone takes them, says the new handle
   once (a toast, and "You were @…" under it, `HANDLE_SAID`), and the open after that says nothing. */
```

### ---------- AFTER REVIEW, ROUND 1 (docs/history/342): the device's chips, and the two races

top level, before `movedWorld3_`

```
/* ---------- AFTER REVIEW, ROUND 1 (docs/history/342): the device's chips, and the two races ----------------
   THE FAMILY IPAD KEPT THE OLD CHIP. Signing in by a moved handle, or learning it from `myProfile`, added
   the new handle's chip and left `@ella_kind42` — her first name, on the shared device — beside it; and the
   one-tap way in was the old one, so "Your handle has changed" came back on every sign-in. The old chip
   becomes the new one in its place (`handleRename_`, me.js).
   AND NO JOURNEY PRESSED RANDOMISE OR ADDED A FRIEND, so the two guards against a `myProfile` asked before
   the press and answered after it were held by nothing: the review took each away and every check stayed
   green. Randomise's was a text test that knew only the LAST press — two presses under one slow reply put
   the first handle back. Both are `ACCOUNT_AT_` now (`accountChanged_`), and these hold them. The tile is
   drawn here rather than found on a screen, because which screen it lives on is moving (fix-card-settings)
   and what is asked is what a press does, not where it is. */
```

### ---------- AFTER REVIEW, ROUND 2 (docs/history/342): A FIGURE NOBODY DRESSED KEEPS ITS FACE

top level, before `bad`

```
/* ---------- AFTER REVIEW, ROUND 2 (docs/history/342): A FIGURE NOBODY DRESSED KEEPS ITS FACE -------------------
   A blank look is drawn from the handle (`avatarConfig`: skin and hair colour from `hashOf(handle)`), so a moved
   handle was a different figure — a different skin tone — on the child's own card and wardrobe. The server now
   writes the old handle's look into a blank cell whenever it moves a handle (`handleFaceKept_`); these hold the
   phone's half: Randomise's answer carries that look and the phone takes it, and a phone signed in before
   `?run=kidHandles` takes it from `myProfile` with the new handle — or it would draw the new handle's colours
   from its own blank copy until the next sign-in. The face is compared through the phone's own `avatarConfig`. */
```

### WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE — THE BUILDER'S OWN JOURNEYS (docs/history/341)

top level, before `aheadQuiet_`

```
/* ==================================================================================================
   WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE — THE BUILDER'S OWN JOURNEYS (docs/history/341)

   The owner, 11 Oct: *"Increase loading scope. Make it more massive so it's never really an issue."* One
   builder (`ahead_`, shell.js) now draws in the quiet every column a repaint or a landing marked, every
   widget slot, and both finders' whole windows. Every journey above boots with it HELD and asks what an
   arrival does — the floor. These boot with it on and ask what it promises: that it finishes, that it never
   runs under a finger or a settle, that a refused paint waits for its reason to go, that a drawing made
   ahead is adopted only when nothing has moved since, that nothing drawn from old facts or for somebody
   else is ever shown, that a finder's job stays in its finder, and that a landing which changes nothing
   writes nothing. jsdom has no `requestIdleCallback`, so this is the timer path iPadOS Safari takes. */
```

### AT REST: the builder's list empty and everything booked for after a slide run — or the cap, and then the journey says it never came.

top level, before `aheadQuiet_`

```
/* AT REST: the builder's list empty and everything booked for after a slide run — or the cap, and then the
   journey says it never came. Longer than `woken_`'s eight seconds: from a repaint the builder draws every
   column and both windows of forty-one cards, one per slice, and a slice is a 60ms timer here. */
```

### A FINGER DOWN FOR A SECOND AND A HALF, once the builder is under way:

top level, before `k`

```
/* A FINGER DOWN FOR A SECOND AND A HALF, once the builder is under way: nothing is built under it. jsdom has
     no touch, so the finger is the state the engine keeps (`SWIPE.live`). NOT straight after the repaint:
     `afterSlide_` waits out a finger too, and with its jobs still booked the builder is shut by them — the
     finger's own rule would never be asked (the mutation that took it out stayed green that way). */
```

### THE NOTEPAD AND THE TIMETABLE, both asked:

top level, before `ids`

```
/* THE NOTEPAD AND THE TIMETABLE, both asked: each draws what is somebody's own — the notepad's words, the week
     and its bookings — and a sign-out must put them away before the repaint returns. (The timetable was `pure`
     until the review of 12 Oct found it draws the bookings; the journey below asks the slots the next person has
     no widget for.) */
```

### AND WHAT IT CLAIMED IS DRAWN:

top level, before `resPages`

```
/* AND WHAT IT CLAIMED IS DRAWN: a slice is logged whether or not its fill wrote anything, so a fill run
     outside the binding (reading Find's ask, finding it changed, and returning) was logged as a fill and
     passed (M14, docs/history/341). Every Resources page in its window is drawn, once it is quiet. */
```

### BUT A `repaint()`'S MARK OF 1 ALWAYS WRITES, with nothing pressed and nothing changed.

top level, before `r`

```
/* BUT A `repaint()`'S MARK OF 1 ALWAYS WRITES, with nothing pressed and nothing changed. The skip is a
     landing's (`'maybe'`); `repaint()` is asked for by code that means "draw it again" — and the journey
     at "a repaint and then an arrival" could not tell the two apart, because the column it arrives at
     still holds the boot's markup and so is never skipped (M13, docs/history/341, was green there). */
```

### AFTER THE REVIEW OF 12 OCT (docs/history/341, "After review"):

top level, before `paper2F_`

```
/* ==================================================================================================
   AFTER THE REVIEW OF 12 OCT (docs/history/341, "After review"): what three reviewers found the builder's
   journeys above could not see. Each was red on the reviewed tree, or is red when its mechanism is taken
   out, and each says which.
================================================================================================== */
```

### REVIEW, 12 Oct: the identical-markup skip kept a reel column the builder had appended to, after the reel draw had counted its reels from nought — every landing

top level, before `w`

```
/* REVIEW, 12 Oct: the identical-markup skip kept a reel column the builder had appended to, after the reel
     draw had counted its reels from nought — every landing added six repeats, without end, and from page
     thirteen the clip started was off the glass. An append nulls the column's drawing (`reelMore_`). */
```

### REVIEW, 12 Oct: the Messages column's draw asks for the inbox (`dmSync_`), and the builder drew it after every repaint and landing for nobody — one POST each

top level, before `w`

```
/* REVIEW, 12 Oct: the Messages column's draw asks for the inbox (`dmSync_`), and the builder drew it after
     every repaint and landing for nobody — one POST each, where base asked none. Drawn ahead it asks nothing
     now (`dmAsk_`, posts.js), and the inbox the payload fetched is its first answer. AND NO SLICE ASKS
     ANYTHING: the one job that is meant to (the chosen book of the Bible) is an admin's, and nobody here is. */
```

### REVIEW, 12 Oct: the re-veil at a change of person walked the NEW person's widgets, so the admin's flyer maker, availability and uploads on Tools, and every

top level, before `admin`

```
/* REVIEW, 12 Oct: the re-veil at a change of person walked the NEW person's widgets, so the admin's flyer
     maker, availability and uploads on Tools, and every star on Saved (which a sign-out clears), kept her
     drawing for 8–15s at 4x. It walks every slot on the column now (`widgetsReveil_`). */
```

### REVIEW, 12 Oct: six places marked `STALE` themselves, and the builder runs nothing periodic — so a star pressed without a `pointerup` left thirteen columns

top level, before `w`

```
/* REVIEW, 12 Oct: six places marked `STALE` themselves, and the builder runs nothing periodic — so a star
     pressed without a `pointerup` left thirteen columns stale for good, and every wait for quiet timed out.
     They mark through `markStale_` now, which kicks. */
```

### REVIEW, 12 Oct: the first payload draws the column in front and the glass, and leaves the rest on the boot's loader for the builder — which a hand that keeps

top level, before `bad`

```
/* REVIEW, 12 Oct: the first payload draws the column in front and the glass, and leaves the rest on the
     boot's loader for the builder — which a hand that keeps moving never lets run. A sideways landing then
     showed columns still on that loader (Reels and Find at 1280, 2–11s of it). `go` draws them now
     (`bootGlass_`). Held, so this asks the arrival and nothing else. */
```

### REVIEW, 12 Oct: the identical-markup skip was never for the column in front, so a landing redrew the Feed from nothing (its pictures gone for 120ms and more)

top level, before `w`

```
/* REVIEW, 12 Oct: the identical-markup skip was never for the column in front, so a landing redrew the Feed
     from nothing (its pictures gone for 120ms and more) and an arrival that beat the builder wrote the whole
     column inside the release. Both take the skip now, for a column with no widgets (`paint`, `repaint`). */
```

### REVIEW, 12 Oct: a repaint drew Find in front from nothing and filled three cards; on an iPad the pages above the card in front sat on the glass as empty shells

top level, before `P`

```
/* REVIEW, 12 Oct: a repaint drew Find in front from nothing and filled three cards; on an iPad the pages
     above the card in front sat on the glass as empty shells until the builder reached them. `stuffBandFill_`
     (find.js) fills the band in the same task. jsdom lays nothing out, so the band is its floor here — what is
     asked is that it goes both ways, at once. */
```

### 5. AN INPUT THE BROWSER HOLDS AND THE PAGE HAS NOT HEARD YET

top level, before `pending`

```
/* 5. AN INPUT THE BROWSER HOLDS AND THE PAGE HAS NOT HEARD YET (review round 1: a third of the slow touches in
        the first thirty seconds waited behind slices that started after they were sent). Chromium's
        `isInputPending` is stood in for — jsdom has none — saying yes for 1.5s, then no. */
```

### REVIEW, 12 Oct: the quiet was measured from nothing (`AHEAD.input` 0), so the first slices after the splash ran at once; and `AHEAD_SLOW` started empty, so

top level, before `b`

```
/* REVIEW, 12 Oct: the quiet was measured from nothing (`AHEAD.input` 0), so the first slices after the splash
     ran at once; and `AHEAD_SLOW` started empty, so every heavy first draw ran after 400ms. The quiet starts
     when the builder opens, a column's first draw from a payload is slow until timed, and the slow bit is kept
     on the device (`familyAheadSlow`). */
```

### AND THE QUIET IT COUNTED STARTS NO EARLIER THAN THE OPENING:

top level, before `firstPaints`

```
/* AND THE QUIET IT COUNTED STARTS NO EARLIER THAN THE OPENING: jsdom sends no input, so a quiet counted from
     nothing is the whole time since the page began (and `afterSlide_`'s own jobs delay the first slice enough
     that the line above alone cannot tell — the mutation that took the opening's clock out stayed green on it). */
```

### REVIEW ROUND 1, 12 Oct:

top level, before `b`

```
/* REVIEW ROUND 1, 12 Oct: the journey above asks this of the first slices after the screen comes up — and once
     `afterSlide_` counted its own jobs as booked until the last had run, those jobs alone kept the builder shut
     past a second, so taking the cold rule out (`j.cold`) left it green. Here nothing else is in the way: the
     builder held through the landing, every column but the one in front still on the boot's markup, then a key
     and the hold let go. The first of those columns drawn must have waited a second since the key. */
```

### REVIEW, 12 Oct: the finder's draw queued its own fill as a microtask, which ran after the builder's slice had ended and outside the time it measured — 2.7s of

top level, before `P`

```
/* REVIEW, 12 Oct: the finder's draw queued its own fill as a microtask, which ran after the builder's slice had
     ended and outside the time it measured — 2.7s of one idle callback against 1.6s logged. Drawn ahead, it is
     filled by the builder. */
```

### REVIEW ROUND 1, 12 Oct (the first thirty seconds, measured again):

top level, before `P`

```
/* REVIEW ROUND 1, 12 Oct (the first thirty seconds, measured again): Find's first draw from a payload was one
     slice of 285–470ms at 4x, and almost none of it was the draw — the list, its sort keys, the sort and the first
     question's tally, every one a memo. The builder asks those first, one slice each (`stuffWarmJobs_`, find.js),
     so the paint left is the markup. Asked here: after a landing that brings a NEW payload (a real `load()`), each
     finder off the glass is warmed — every step, in order, before its paint — each step inside that finder's own
     binding (329), and the paint itself builds no list: the list is built in the warm. */
```

### REVIEW ROUND 1, 12 Oct, found re-running check/reach.js:

top level, before `p`

```
/* REVIEW ROUND 1, 12 Oct, found re-running check/reach.js: "res page 7 (in front 1) is still lazy" on the Boxing
     shelf at 390. The column in front asks for its pictures six pages ahead IN THE PLACEMENT (`picsAhead_`), and
     a card the builder fills after that placement — every card past the band on a fresh window — kept `lazy`
     until something placed the column again. jsdom lays nothing out, so the band is its floor of one either side
     and every card past it is the builder's: exactly that case, every time. AND jsdom HAS NO `img.loading`, so it
     is stood in for as the attribute it reflects — without it nothing the app writes there is ever seen. */
```

### THE CARDS FOUR TO SIX AHEAD EMPTIED AND LEFT TO THE BUILDER — filled again in the quiet with nothing placing the column after, which is the case:

top level, before `pages`

```
/* THE CARDS FOUR TO SIX AHEAD EMPTIED AND LEFT TO THE BUILDER — filled again in the quiet with nothing placing
     the column after, which is the case: jsdom places the column often enough on the way in (the trail's end,
     the window's centring) that a first fill alone did not show it. */
```

### REVIEW ROUND 1, 12 Oct:

top level, before `w`

```
/* REVIEW ROUND 1, 12 Oct: `afterSlide_` runs its jobs one per task and said "nothing booked" from before the
     first of them — so the builder's gate ("work for the glass goes first") and every check's quiet were told
     the slide's work was done while it was still running. Found through the word-game journeys under load
     (the job that stops a round left behind was four tasks away when the check looked). Five jobs of 60ms
     each, booked after a repaint with the builder on: each must see the chain as still booked, and no slice
     may start between the first and the last. */
```

### REVIEW, 12 Oct: the builder's `centre` job could be dropped with every check green — the release's slide by six kept BUILT AHEAD satisfied.

top level, before `lib`

```
/* REVIEW, 12 Oct: the builder's `centre` job could be dropped with every check green — the release's slide by
     six kept BUILT AHEAD satisfied. After a run of single turns the window has been slid, not centred; the
     quiet centres it. */
```

### REVIEW, 12 Oct (a nit, and the loaders it left):

top level, before `w`

```
/* REVIEW, 12 Oct (a nit, and the loaders it left): a slot was as far as its column plus its pages, so Games' slots
     eight pages down came after whole paints of columns three and four away — and the band draws those pages as a
     slide carries them across the glass. A slot is as far as its column now (`aheadWidgetJobs_`, arcade.js). */
```

### REVIEW, 12 Oct: the builder's Bible job could be taken out with every check green.

top level, before `admin`

```
/* REVIEW, 12 Oct: the builder's Bible job could be taken out with every check green. Resources marked and
     drawn by the builder off the glass, with a book chosen and its question in front: the book is asked for by
     the `bible` job, a slice before the first verse card is filled (which would ask for it too). The chip's
     own prefetch was taken out — the page in front is filled in the same task as the chip, and its first verse
     card asks (docs/history/341, "After review"). */
```

### ---------- EVERY PAPER HAS A HEALTH SCORE, AND EVERYBODY SEES IT (docs/history/354)

top level, before `base`

```
/* ---------- EVERY PAPER HAS A HEALTH SCORE, AND EVERYBODY SEES IT (docs/history/354) ---------------------
   *"Can you add a health check to worksheets or past papers ... Like 99% would be it's practically perfect
   and ready to do. This is for work in the finder."* Then, over a tutors-only first draft: *"No, everyone can
   see the scores"* — the owner, 18 Oct. So the journey is asked as FOUR people — nobody signed in, a student,
   a parent and a tutor — and each must see the same three things: the card's [Ready]-shaped tag (the band
   alone, the Health answer; the percentage is the tile's, docs/history/355), the Health row under the
   funnel's question, and the Health tile under a chosen paper with the list behind it.
   Over TWO FIXTURE PAPERS through the real loader: `HX` with exactly three faults (Q2 has no answer, Q3 says
   "the triangle shown" over no drawing, the marks add to 76 of the stated 80), `HY` with none. The score is
   `paperHealth_`'s; what is asked here is that the finder reads it — and that picking `Health · Ready`
   leaves only Ready papers, so the tag on a card is an answer that can be picked. */
```

### `FLOW_PART=2/4` RUNS THE SECOND QUARTER, in roster order — for a machine where the whole file takes longer than one shell may wait

top level, before `FLOW_PART_`

```
/* `FLOW_PART=2/4` RUNS THE SECOND QUARTER, in roster order — for a machine where the whole file takes
   longer than one shell may wait (four cores shared with other builders: the full run passed 600s on
   10 Oct). Each part says which slice it ran, so four parts are seen to cover the lot. The suite never
   sets it. */
```

### ---------- EVERY DROPDOWN ON THE BOOKING CARD IS THE SAME CONTROL (owner, 29 Oct; docs/history/530)

top level, before `w`

```
/* ---------- EVERY DROPDOWN ON THE BOOKING CARD IS THE SAME CONTROL (owner, 29 Oct; docs/history/530) ----------
   "The term drop down needs to work like the drop downs above. As does every drop down here." and "Again child drop down should behave
   like the above drop downs." Subject, Term and Child opened ticks under the row (a list box on a phone); each is Level's select now. */
```

### ---------- AT THE CLIENT'S OWN HOUSE THE SPACE IS THEIRS (owner, 29 Oct; docs/history/530)

top level, before `w`

```
/* ---------- AT THE CLIENT'S OWN HOUSE THE SPACE IS THEIRS (owner, 29 Oct; docs/history/530) ----------
   "If the client picks client house then the space field is redundant and shouldn't really be fill-outable." One rule, `atClientHome_`. */
```

### ---------- WHAT THE CARD HELD GOES WITH A SUGGESTION ABOUT IT (owner, 29 Oct; docs/history/530)

top level, before `reply`

```
/* ---------- WHAT THE CARD HELD GOES WITH A SUGGESTION ABOUT IT (owner, 29 Oct; docs/history/530) ----------
   "Hope you can see the filled-out fields" — in the note's text, people as initials, nothing about payment, the note itself not copied. */
```

### ---------- THE OWNER'S NOTES OF 29 OCT ON THE BOOKING WIDGET (docs/history/530)

top level, before `w`

```
/* ---------- THE OWNER'S NOTES OF 29 OCT ON THE BOOKING WIDGET (docs/history/530) ----------
     "should just be 1 line which says discount. If I put 30 in that field then it's just 30 percent off"; "Code or reason … delete that
     line. Same with absorbed by"; "Client pays line should be treated like the stuff above"; "Forget the charged, discount, venue, tutor
     payout and card fees … Also delete net profit." */
```

