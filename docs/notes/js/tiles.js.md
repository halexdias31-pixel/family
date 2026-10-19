# js/tiles.js

The full text of comments in `js/tiles.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — tiles.js THE SHEET IS GONE.

top level, before `TILE_CONE_`

```
/* ==================================================================================================
   @family. — tiles.js
   THE SHEET IS GONE. Everything it offered is a row on the card itself.

   WHAT WAS WRONG WITH IT. Opening a panel to reach a tick is two taps to do a one-tap thing, and
   the panel then had to repeat the card — the name, the subject, the page count — because a panel
   floating over a list has to say which of the list it is about. So the same six facts were drawn
   twice, in two places that could disagree, and the second copy cost a tap to see and a tap to
   dismiss. A screen whose first job is to identify itself is a screen that did not need to exist.

   ---------- ONE ACTION, ONE LINE ----------------------------------------------------------------
   FULL WIDTH, STACKED, IN WORDS. This was a grid of three symbols across, and a grid is a promise
   that everything in it is the same size — a promise you then have to keep with flex arithmetic,
   with placeholders standing in for actions that do not exist, and with glyphs chosen because they
   are one character wide rather than because they mean anything.

   A stack keeps that promise for nothing. Every row is the width of the card, so uniformity is not
   maintained, it is simply unavoidable. And once nothing is competing for horizontal room the label
   can be the word — HTML, Paper — which needs no long-press text to explain it and no guess about
   whether a framed block reads as a document.

   WHICH ALSO REMOVES THE PLACEHOLDERS. The dim dead slots existed to hold a column position steady
   so that a thumb would find the paper copy in the same place on every card. A stacked row has no
   column to hold, so an action that is not offered is simply not drawn — and a card with two rows
   sits beside one with three without either looking wrong.

   THE DETAIL SITS ON THE RIGHT OF ITS OWN LINE — the same key-on-the-left, value-on-the-right shape
   every other row on this card already uses. "£0.40" belongs beside the thing that charges it.

   ---------- ONE RULE FOR ADMIN CONTROLS: THEY ARE SILVER ----------------------------------------
   Everywhere, without exception. An admin sees every card twice over — once as the app and once as
   the thing they maintain — and a colour that means "only you can see this" is the only way to tell
   those apart at a glance. Nothing a client can press is ever silver.

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice` and `canPrint` from
   find, `paperRows` and `CART` from resource, and `isSpot` from collections.
   index.html lists them; the list is the order.
================================================================================================== */
```

### ---------- THE MARKS ON THE BUTTONS

top level, before `TILE_CONE_`

```
/* ---------- THE MARKS ON THE BUTTONS ---------------------------------------------------------------
   ONE SET, DRAWN ONCE, IN THE APP'S OWN STROKE. Inline SVG rather than characters: ▷ and 🛒 are
   whatever the phone happens to have, which on one device is a thin outline and on another a
   full-colour emoji sitting at a different height from the word beside it. These take their colour
   from the text they sit with, so a silver admin tile gets a silver mark without a second rule.

   BESIDE THE WORD, NEVER INSTEAD OF IT. This app took its glyphs out once already — `tile_` still
   says why underneath: a ✦ needed a `title` AND an `aria-label` to explain it, and a label that has
   to be explained twice was the wrong label. A mark next to the word is the opposite trade: the
   word still says what happens, and the mark is what lets you find the right button without
   reading four of them. Nothing here is ever the only thing on a tile.

   `aria-hidden`, for the same reason. The word is already the accessible name, and a screen reader
   announcing "graphic, play" before it would be the second explanation all over again. */
```

### ---------- ONE SPEAKER, DRAWN ONCE, FOR THE THREE MARKS THAT HAVE ONE

top level, before `TILE_CONE_`

```
/* ---------- ONE SPEAKER, DRAWN ONCE, FOR THE THREE MARKS THAT HAVE ONE -----------------------------
   Imposter's Listen (`speak`) and the sound switches (`sound` and `mute`: the reels' Sound, Imposter's
   Read aloud, and the question card's Sound for its chime and buzzer, note 340) are the same cone, and a
   cone written out three times is three chances for one of them to sit a pixel lower than the others
   -- the drift `.tile.is-lead` records for a colour, one layer down. The waves are shared for the
   same reason: the mark on a reel playing aloud and the mark on Listen are the same picture of the
   same thing, sound coming out. */
```

### A PRINTER: the sheet going in at the top, the body, the sheet coming out at the foot.

in `TILE_ICONS`

```
/* A PRINTER: the sheet going in at the top, the body, the sheet coming out at the foot. Drawn as
     three open paths at the same 1.4 stroke as the rest — a solid printer would be the only filled
     mark in the row and would read as a state rather than an action. */
```

### A TICK, FOR CHECK -- "check button should be a tile".

in `TILE_ICONS`

```
/* A TICK, FOR CHECK -- "check button should be a tile". Marking your own answer is the act, and
     a tick is what a teacher's pen puts on a right one. THE ANSWER BOX'S CHECK WEARS `send` NOW (8 Oct,
     *"the answer box should look like a chatbox. with send tile"*); the tick stays for "Check uploads". */
```

### ---------- A PADLOCK, AND THE TWO DIFFER BY ONE STROKE

in `TILE_ICONS`

```
/* ---------- A PADLOCK, AND THE TWO DIFFER BY ONE STROKE ------------------------------------
     REPORTED AS "when you are drawing its moving the widget itself. i think on those quesitions
     there should be a padlock tile to keep it in place so you can draw." That is the owner's own
     word for what arming the pen on a question's diagram already does — it pins the card so a
     stroke is a stroke rather than a swipe — and the control had been called `Draw on it`, which
     says nothing about the card being held.

     CLOSED IS PINNED, which is the reading the report asks for: "a padlock to keep it in place SO
     YOU CAN DRAW". The other reading — a locked picture you may not draw on — is the opposite, and
     the only thing that keeps them apart is that the two marks are a pair: same body, same shackle,
     and the open one is missing its right leg. A padlock drawn any other way reads as whichever
     the viewer expected. */
```

### A SPEECH BUBBLE, ON "change message tile to look like a speach bubble".

in `TILE_ICONS`

```
/* A SPEECH BUBBLE, ON "change message tile to look like a speach bubble". It was an envelope,
     argued as the one picture everybody already reads — and that is true of an e-mail, which is not
     what this opens: it opens a conversation with somebody, and every messaging app anybody has used
     marks that with a bubble. The argument that stays is the one against the aeroplane below: that
     means SEND, the act, and this control sends nothing — it opens the composer.
     ONE PATH, the tail cut into the bottom edge rather than a second shape laid over it, so the
     stroke joins cleanly at 1.4 like every other mark in the row; no dots inside, because at 18
     units three dots are three smudges. The envelope had no other caller, so it went with it. */
```

### THE PAPER AEROPLANE.

in `TILE_ICONS`

```
/* THE PAPER AEROPLANE. Sending, and nothing else in the app sends — so it can be the one mark
     that means it. Drawn as an outline like the rest rather than the solid dart most apps use: a
     filled shape beside eleven outlined ones is a different set. */
```

### ---------- AND THE THREE ON THE SIGN-IN CARD

in `TILE_ICONS`

```
/* ---------- AND THE THREE ON THE SIGN-IN CARD ----------------------------------------------
     ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account
     button."* Three marks this set did not have, drawn at the same 1.4 stroke so the row reads as
     one set with the Sign out tile a stranger will meet on the far side of signing in.

     SIGN IN IS THE MIRROR OF SIGN OUT: the same door frame, on the other side, with the arrow
     going into it. Two marks that differ only in direction are learnt as a pair — the padlock
     argument above. A KEY for the PIN, because a PIN is what opens the account and the tile gets
     you a new one. A PERSON WITH A PLUS for a new account, which is the mark every phone's
     contacts app already uses for "add somebody". */
```

### SHUFFLE: two crossing arrows, the mark every music player puts on "play these in a random order" — which is what Randomise does to the three parts of a handle.

in `TILE_ICONS`

```
/* SHUFFLE: two crossing arrows, the mark every music player puts on "play these in a random
     order" — which is what Randomise does to the three parts of a handle. Open paths, so it
     is one more outline in the set rather than the only solid. */
```

### EXIT FULL SCREEN: the same four corners turned inward, the mark every video player puts on the button that gives the screen back — the videos card's own full

in `TILE_ICONS`

```
/* EXIT FULL SCREEN: the same four corners turned inward, the mark every video player puts on the
     button that gives the screen back — the videos card's own full screen, where a phone has none for a
     frame (note 321). The mirror of `full`, so the pair read as one switch. */
```

### SYNC: two arrows chasing each other round a circle, the mark every phone puts on "fetch it again from where it really lives" — the videos card's Sync from

in `TILE_ICONS`

```
/* SYNC: two arrows chasing each other round a circle, the mark every phone puts on "fetch it again
     from where it really lives" — the videos card's Sync from Drive, which refills the films from the
     Notflix folder. Open paths at the set's 1.4, so it is one more outline beside Full screen. */
```

### ---------- AND THREE THAT ARE NOT ON A TILE: THE VIDEOS CARD'S, AFTER YOUTUBE

in `TILE_ICONS`

```
/* ---------- AND THREE THAT ARE NOT ON A TILE: THE VIDEOS CARD'S, AFTER YOUTUBE -----------------------
     *"Can you also make the video serger widget look more like YouTube."* (9 Oct.) A MAGNIFIER inside
     the search pill, which is the one mark every search box on every phone carries; a FILM STRIP on
     the poster of a film that has no picture; and A BOX WITH AN ARROW LEAVING IT on the badge of a row
     that opens Drive in a new tab -- the mark every browser puts on "this goes elsewhere", and NOT
     `out`, which is a door frame and means sign out. Drawn here rather than in games.js so the set
     stays one set at one stroke: a magnifier at 1.6 beside a full-screen mark at 1.4 would read as
     two apps. `tileIcon_` draws them; nothing about them is a tile. */
```

### ---------- A QUESTION'S PAGES, WHICH ARE ALL TILES NOW

in `TILE_ICONS`

```
/* ---------- A QUESTION'S PAGES, WHICH ARE ALL TILES NOW ---------------------------------------
     ASKED FOR AS *"lock should be a tile too. same as undo and clear. it should all be tiles."* and
     *"some questions require a compass or ruler. so should have a tile for these things."* Marks
     the set did not have, at the same 1.4 stroke so a pen bar reads as one row with the star.

     `next` WAS HERE, THE ↓ ON `To the answer` -- an arrow pointing down the column to the answer page.
     The tile went on the owner's word, 8 Oct (*"there doesnt need to be a scroll down tile on
     questions"*, see `questionTiles_` in find.js), and nothing else drew the mark, so it went with it.

     THE PEN IS A PENCIL WITH ITS LINE, so it is told from `edit` (a pencil alone, which elsewhere means
     "change this text") by the squiggle it has just drawn. THE RULER IS ON A SLANT with its ticks,
     because a level rectangle with marks along it reads as a battery. THE COMPASS is the pair of
     compasses every geometry set holds -- the hinge, two legs, and the arc it swings between them.
     AI IS A SPARKLE, the mark every phone already puts on "a model did this", so the one tile whose
     verdict is a guess says so before it is pressed. */
```

### THE FIGURE IS A FRAMED PICTURE -- a hill and a sun in a frame, the mark every phone uses for "an image" -- and not `photo`, the camera, which means "take one".

in `TILE_ICONS`

```
/* THE FIGURE IS A FRAMED PICTURE -- a hill and a sun in a frame, the mark every phone uses for "an
     image" -- and not `photo`, the camera, which means "take one". It opens the question's figure over
     the card (`q-fig` in find.js). */
```

### A SPEAKER WITH ITS TWO WAVES, FOR IMPOSTER'S LISTEN AND ITS READ ALOUD SWITCH -- "so young ones who can’t read can play. Like it will read it out for them."

in `TILE_ICONS`

```
/* A SPEAKER WITH ITS TWO WAVES, FOR IMPOSTER'S LISTEN AND ITS READ ALOUD SWITCH -- "so young ones who
     can’t read can play. Like it will read it out for them." (8 Oct.) The mark every phone puts on its
     volume, because the children pressing it cannot read the word beside it: the cone and two arcs at
     the set's 1.4, open like the rest, so it reads as one more outline beside the eyes on Show and Hide. */
```

### ---------- THE REELS' SOUND, AND THE TWO DIFFER BY WHAT COMES OUT OF THE CONE

in `TILE_ICONS`

```
/* ---------- THE REELS' SOUND, AND THE TWO DIFFER BY WHAT COMES OUT OF THE CONE -------------------
     THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* It was the one
     control on a reel that was still a `.btn` with a word in it (note 323).

     A PAIR, THE PADLOCK'S ARGUMENT ABOVE: the same cone in both, and only what leaves it changes --
     the two waves on a clip playing aloud, a slash and no waves on a muted one. Drawn any other way
     the two read as two unrelated pictures and the switch has to be learnt twice.

     AND EVERY SOUND SWITCH WEARS THE PAIR. Imposter's Read aloud was the other one, a pill with a knob,
     and is the same tile now (`impAloudTile_`, games.js): a sound switch is learnt once in this app. The
     question card's switch for its marking sounds is the third (`markSoundTile_`, submit.js, note 340).
     THE PICTURE IS THE STATE, since a tile has no word on it, so check-flow reads the DRAWING and not
     only the class name: a `mute` drawn as `sound` is two names for one picture and passed every
     check until review tried it (note 323).

     EACH SAYS THE STATE IT IS IN, NOT THE ONE A PRESS MOVES TO, which is what the button's words did
     ("Sound off" on a muted clip) and what every phone's video player draws: a crossed speaker over a
     clip that is silent. `sound` is the same drawing as `speak` under its own name, so the stylesheet
     and the checks can tell the reel's switch from Imposter's Listen -- two acts that share a picture.
     THE SLASH RUNS CORNER TO CORNER across the cone and the space the waves left, so the muted mark is
     as wide as the playing one and the tile does not look half empty in one of its two states. */
```

### ---------- THE MARK CARRIES ITS OWN NAME

in `tileIcon_`

```
/* ---------- THE MARK CARRIES ITS OWN NAME -------------------------------------------------
     SO THE STYLESHEET CAN TELL A STAR FROM A TROLLEY. "Filled means done" is written over
     `.tile.on` in style.css and was never implemented: the rule it names, `.favwrap.is-fav .star`,
     does not exist anywhere in the file — deleted at some point with the sentence left standing,
     which is the shape this repository records under `resource_type` in `VOCAB` and the dead
     `kind === 'paper'` guard. So a saved star has never filled, on any card, since that rule went.

     REPORTED AS "after i fabourite it the tile should be filled in."

     AND IT CANNOT BE EVERY MARK, which is why the name is needed rather than a bare `.tile.on`.
     These are outlines — `fill="none"`, stroked in `currentColor` — and a star, a jumper and a
     lamp are closed silhouettes that read filled. A trolley is a body and two wheels drawn as open
     paths, so filling it paints a wedge between the handle and the basket. Named, so the
     stylesheet says which and a reader can check it. */
```

### ---------- ONE CONTROL

top level, before `tile_`

```
/* ---------- ONE CONTROL ---------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written once so the difference is a
   parameter rather than two nearly-identical strings that drift apart — and so `target` and
   `rel="noopener"` exist in exactly one place.

   ---------------------------------------------------------------------------------------------
   THE MARK IS THE WHOLE BUTTON NOW, AND THE WORD IS GONE.

   These were full-width rectangles with a word in them, stacked. Four of those under a card is a
   control panel bolted to the bottom of the thing you were looking at, and on a past paper it was
   taller than the paper.

   SO `title` AND `aria-label` COME BACK, both of them, and this is the honest cost of the change
   rather than an oversight. The old comment here said a label needing a hidden copy was the wrong
   label — that was true while the word was on the button. With no word there is nothing else to
   read, so the name has to exist somewhere a pointer and a screen reader can each find it, and
   those are two different attributes. A mark alone is a thing to be learnt; that is the trade, and
   it is the one that was asked for.

   THE NOTE GOES INTO THE NAME, not onto the button. "23 questions" and "£0.46 · 23pp" have nowhere
   to sit on a 40px square, so they ride in the label — "Paper · £0.46 · 23pp" — which is what both
   attributes say and is the only place the price still appears. */
```

### ---------- A TILE MAY LEAVE, BUT ONLY FOR SOMEWHERE ELSE

in `tile_`

```
/* ---------- A TILE MAY LEAVE, BUT ONLY FOR SOMEWHERE ELSE ---------------------------------------
     `target="_blank"` IS THE ONE EXCEPTION to the rule that nothing opens over this app — see the
     `surfaces` tab in the Engine sheet. A fight's video is on YouTube; somebody's bank is not this
     app and should not pretend to be.

     SO THE EXCEPTION IS CHECKED RATHER THAN TRUSTED. An absolute http(s) address is somewhere else.
     Anything else — a relative path, a `#` fragment, a `javascript:` — is this app opening itself in
     a tab, which is the thing being forbidden, and it falls through to an ordinary button instead of
     going out through the one door left open.

     It is also what makes `check-surfaces` able to pass this line: the guard is right here, so the
     checker can see that the address was tested rather than assumed. */
```

### `pressed` IS FOR A TILE THAT IS A SWITCH -- the pen's lock and its Pen / Ruler / Compass -- and is said in `aria-pressed` beside the `on` the eye reads

in `tile_`

```
/* `pressed` IS FOR A TILE THAT IS A SWITCH -- the pen's lock and its Pen / Ruler / Compass -- and is
     said in `aria-pressed` beside the `on` the eye reads, because a screen reader cannot see a plate
     go bright. Absent on an ordinary action, which is not pressed or unpressed: it just happens. */
```

### ---------- FILLING THE SHAPE

top level, before `tileSet_`

```
/* ---------- FILLING THE SHAPE ---------------------------------------------------------------------
   THE STAR'S PATTERN, EVERYWHERE. Press it, it fills, and that is the end of the interaction as far
   as the person is concerned. The request goes out behind it and is only ever heard from again if
   it fails.

   WHY NOT `repaint()`. Every one of these used to redraw the whole screen to change one word —
   rebuilding forty cards, the search box and the pager so that a button could say "In your basket".
   That is slow, it drops the keyboard, and on a list it is visibly a flinch. `set-listed` was worse
   again and called `load()`, which went back to the network for the entire payload.

   ONE ELEMENT, THREE THINGS: the word, the number beside it, and whether it is filled. Nothing else
   on the screen is touched, so nothing else on the screen can move. */
```

### THE NAME, NOT THE TEXT.

in `tileSet_`

```
/* THE NAME, NOT THE TEXT. There is no visible word to rewrite any more — the two attributes ARE
     the label, so a control that has just become "Saved" has to say so in both or a pointer and a
     screen reader will disagree about what it does. */
```

### ---------- THE ADMIN ROW

top level, before `SPOT_TILES`

```
/* ---------- THE ADMIN ROW ------------------------------------------------------------------------
   SPOTLIGHT, AND IT USED TO BE SPOTLIGHT, EDIT, DELETE — the things only an admin can do to a row,
   in the same order on every kind of card.

   EDIT AND DELETE ARE GONE, and only for a paper — they were the only two that took `t`, the
   document behind the card, and wrote a cell on its row. The library is `data/questions.json` in
   this repository now: a relabel is a commit and a delete is a line changed, neither of which a
   phone can do. `check-doors.js` pairs every `act` against a handler, so leaving a silver Edit tile
   here pointed at a removed `on('topic-edit')` would have failed the build — which is exactly the
   guard that should catch it.

   `t` IS STILL TAKEN AND STILL IGNORED-IF-ABSENT, so every caller is unchanged; it costs one unused
   argument and saves touching nine call sites for a row that may yet get an admin control back.

   `x.key` rather than the row's id: the spotlight set is keyed on whatever the CARD is keyed on,
   which for a widget is `w:123` and for a venue is its name. */
```

### ---------- AND NOT ON ANYTHING FIND TEACHES WITH

top level, before `SPOT_TILES`

```
/* ---------- AND NOT ON ANYTHING FIND TEACHES WITH -----------------------------------------------
   ASKED FOR AS *"No distinction between tutor and student on the finder. All the same. Remove any
   nuances about that."* A question, a practical, a project or a textbook drew a gold Spotlight tile
   at the end of its row for an admin and nothing for anybody else, so the owner, signed in as
   themselves, was never looking at the page a student looks at. The learning group is Find's own
   word for those kinds (`kindOf_`), so a kind added to it tomorrow is covered without a list here.

   WHAT IT COSTS, WRITTEN WHERE THE TILE WAS: an admin cannot put a question in the Spotlight window
   from its card. Everything a shop row, a tutor or a class carries is unchanged.

   AND THE WINDOW ITSELF KEEPS IT (`SPOT_TILES`, set by `spotPages` while it builds). The Spotlight
   column is the admin's shop window, not Find, and a question already in it with no tile to take it
   out would be stuck there: the one control that undoes a spotlight has to be on the spotlight. */
```

### ---------- THE STAR, WHICH IS AN ACTION LIKE ANY OTHER

top level, before `favTile_`

```
/* ---------- THE STAR, WHICH IS AN ACTION LIKE ANY OTHER --------------------------------------------
   IT USED TO FLOAT IN THE CORNER. `stuffCard` wrapped every card in a `.favwrap` and dropped a
   `<button class="star">☆</button>` on top of it, absolutely positioned — which was written when it
   was the only thing you could do to a card. It is not: a paper has HTML and Paper, a bout has
   Watch, everything an admin sees has three more. So the one control that was NOT in the row was
   the one people looked for in it.

   SAME SHAPE, SAME PLACE, SAME WORDS AS THE REST. `Save` and `Saved`, filled when it is on, exactly
   like `Add to basket` / `In your basket` — a glyph in a corner had to be learnt, and this does not.

   FIRST IN THE ROW, ABOVE THE ADMIN BLOCK. Keeping a thing is something anybody can do; the silver
   rows underneath are for one person. */
```

### ---------- `topicTiles_` WAS HERE, AND THERE ARE NO DOCUMENTS TO ACT ON

top level, before `shopTiles_`

```
/* ---------- `topicTiles_` WAS HERE, AND THERE ARE NO DOCUMENTS TO ACT ON --------------------------
   It was the action row under a past paper: `Read`, which opened the whole thing in a sheet, and
   `Paper`, which put a printed copy in the basket at pages x rate. Both took `x.topic` — the
   document behind the card — and there are no document cards. See the note above `questionItems`
   in find.js.

   THE PRINT LINE IS THE REAL LOSS AND IT IS WORTH NAMING. You cannot print one question; a print is
   a whole paper, priced per page, and this screen no longer lists a whole paper. `printPrice` and
   `canPrint` are still in find.js and `CART` still holds a `print` line if anything makes one —
   nothing does. Selling paper again means a surface that lists documents, which is the thing that
   was just removed from the funnel on purpose. Somewhere else, deliberately, or not at all.
--------------------------------------------------------------------------------------------- */
```

### ---------- A SHOP THING

top level, before `shopTiles_`

```
/* ---------- A SHOP THING ---------------------------------------------------------------------------
   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — nothing to post and
   nothing to collect, so it never enters a basket — and that is a different gesture from anything
   on this row. It keeps its sheet until it has a screen of its own. */
```

### ---------- A TUTOR

top level, before `isMe_`

```
/* ---------- A TUTOR --------------------------------------------------------------------------------
   THE PASS ALREADY SAYS WHO THEY ARE — photograph, name, what they teach, rate, DBS. The sheet
   repeated all of that and added a borough, a full subject list and one button. So the borough and
   the list go onto the pass where the rest of the person is, and the button comes down here.

   `Listed` IS ADMIN AND DESTRUCTIVE-ISH: unticking it takes somebody off the site for every client
   at once. It was a checkbox in a panel, which is where a switch goes to be flipped by accident;
   as a silver row it is as deliberate as Delete and reads the same way. */
```

### ---------- A TUTOR'S OWN ACTIONS, AND NOT THE ONES EVERY CARD HAS

top level, before `isMe_`

```
/* ---------- A TUTOR'S OWN ACTIONS, AND NOT THE ONES EVERY CARD HAS ---------------------------------
   THIS DREW ITS OWN ADMIN ROW, and `cardTiles_` adds one to every card — so a tutor came out with
   Spotlight twice: once in the silver row this built, once in the silver row underneath it. The
   second row held a single mark and looked like a rendering fault, because that is what it was.

   `Listed` IS A TUTOR'S ALONE and stays here. Spotlight is not — it is on a boxer, a venue, a paper
   and a subject, drawn by `adminTiles_` for all of them — and a card that also draws it is a card
   claiming a control the system already gives it.

   THE ROW WRAPPER GOES TOO. Every other `*Tiles_` returns bare tiles and lets `cardTiles_` do the
   wrapping; this one built its own `<div class="tile-row is-admin">`, which is how it ended up
   beside a second one rather than inside it. */
```

### ---------- `Book with them` WAS HERE

in `tutorTiles_`

```
/* ---------- `Book with them` WAS HERE -----------------------------------------------------
          YOU DO NOT BOOK FROM A PERSON. A pass is who somebody is — their subjects, their rate,
          whether they are cleared — and it is read while deciding, not while arranging. The form
          asks twelve questions and a tutor is one of them; a button that jumps there from one answer
          skips the other eleven and lands somebody in a half-filled form they did not open.

          THE FORM IS ONE ANSWER AWAY. `What for · Booking` is the first question in the funnel and
          the form is the page behind it, which is a shorter route than most cards offer to anything.
          Nothing has been made harder to reach; a second entrance has been closed. */
```

### SILVER, IN THE ORDINARY ROW.

in `tutorTiles_`

```
/* SILVER, IN THE ORDINARY ROW. Every other admin mark sits in its own silver row below —
          `adminTiles_` builds that — and `Listed` cannot join it, because that row is built for
          every kind and this control exists only for a tutor. The tone still says who it is for. */
```

### ---------- WRITE TO THEM, FROM THE ONE PLACE YOU ARE LOOKING AT THEM

in `tutorTiles_`

```
/* ---------- WRITE TO THEM, FROM THE ONE PLACE YOU ARE LOOKING AT THEM --------------------
          `sendMessage` HAS BEEN A DOOR WITH NO HANDLE SINCE MESSAGES WERE BUILT. The backend has
          the whole thing — a role policy, a five-minute gap, a length cap and an email to the
          recipient — and nothing in the app has ever posted to it. Measured: of the four message
          actions, one (`messages`, the read) had a caller and three had none. The note in me.js
          says exactly why and where it belongs: "there is no picker for WHO — that belongs with
          the roster, where the people you are talking to are already on screen."

          THIS IS THAT PLACE. A tutor's pass IS the picker: you are already looking at the person,
          so the control names them and nothing has to be typed or searched for.

          ONLY WHEN SIGNED IN, because a stranger has nobody to send it as — and the sheet would
          have to explain that instead of taking a message. Not shown on your own pass either;
          `sendMessage` answers "That is you." and a control whose only outcome is that sentence is
          a control that should not be there.

          WHETHER YOU MAY IS THE BACKEND'S TO SAY, and it is not repeated here. `MESSAGING` in
          constants.gs is the policy — a student may reach an admin and nobody else, parents cannot
          write to each other — and copying it into the phone is two rules to keep in step, which
          is the fault this repository records under `kinds`, under `link`/`source_url` and under
          `childrenOf`. The sheet shows the server's own sentence, which already says what to do
          instead: "You cannot message them directly. An admin can pass it on." */
```

### EDIT, FOR AN ADMIN, ON SOMEBODY ELSE'S CARD ON THE YOU COLUMN — `updateProfile` lets an admin write another person's row, so the card turns into its form for

in `tutorTiles_`

```
/* EDIT, FOR AN ADMIN, ON SOMEBODY ELSE'S CARD ON THE YOU COLUMN — `updateProfile` lets an admin write
          another person's row, so the card turns into its form for them as a tutor's own does
          (`cardEditTile_` in me.js decides; it draws nothing for anybody else, or anywhere else). */
```

### ---------- A VENUE HAS NO ACTIONS OF ITS OWN

top level, before `venueTiles_`

```
/* ---------- A VENUE HAS NO ACTIONS OF ITS OWN ---------------------------------------------------------
   THE SLIP ALREADY CARRIES EVERY FACT the sheet had — the rooms, their capacities, their rates and
   the notice period — and it carried them better, one line per room against a single "from" price.
   The sheet was a worse copy of the card in front of it. Only the button was ever new, and the
   button has gone the same way as the tutor's: a room is where a session happens, not the thing you
   are arranging, and booking starts on the form rather than on whichever fact you happened to be
   reading when you decided.

   NOTHING RETURNED, RATHER THAN AN EMPTY ROW. `cardTiles_` adds the star and the admin marks to
   every kind whether or not it has actions of its own, so a venue keeps everything that is not
   specific to being a venue — which, now, is all of it. */
```

### ---------- A SUBJECT

top level, before `subjectTiles_`

```
/* ---------- A SUBJECT -------------------------------------------------------------------------------
   `Book this` SENT AN EMPTY NAME in the sheet — `data-name=""` — so booking from a subject asked for
   nobody in particular. Kept exactly as it was rather than quietly fixed: booking a subject with no
   tutor named may well be right, and changing what a button DOES while moving it is how a move gets
   blamed for a bug it did not cause. */
```

### ---------- A LEVEL

top level, before `levelTiles_`

```
/* ---------- A LEVEL --------------------------------------------------------------------------------
   THE SAME EMPTY NAME AS A SUBJECT, and for the same reason: booking from a level is booking the
   level, not a person, so there is nobody to name. Kept identical to `subjectTiles_` rather than
   made cleverer — the day `book-with` learns to carry a subject or a level through to the form,
   both of these change together, and they should be the same shape when that happens.

   OFF WHEN THE FORM CANNOT ASK FOR IT. A level missing from the options tab is not on the booking
   form's dropdown, so the button would open a form that has no way to select the thing you pressed
   it from. A button that cannot work says so. */
```

### ---------- A WEARABLE

top level, before `wearTiles_`

```
/* ---------- A WEARABLE ------------------------------------------------------------------------------
   THE ONE THAT IS GENUINELY NOT A BASKET. Buying and putting on are a single act — there is nothing
   to post and nothing to collect — and the credits come off at the moment it goes on, which is what
   stops a failed request leaving somebody poorer than it found them.

   SO IT IS ONE ROW, AND THE ROW SAYS WHICH ACT IT IS: put it on, buy and wear it, or how far off it
   is. A LEVEL IS NOT A PRICE and never reads as one here — "6 more ticks to go" is a distance you
   can close, where "locked" is a door. */
```

### ---------- A TOOL OR A GAME

top level, before `widgetTiles_`

```
/* ---------- A TOOL OR A GAME ------------------------------------------------------------------------
   NOT A DETAILS PANEL — the sheet held the THING ITSELF, a timer or a board, and there is nothing
   about it to summarise onto a card. So it opens in place instead of over the top: the row toggles
   the widget open inside its own card, and `startWidget_` runs once the markup is in the document.

   IN PLACE RATHER THAN INLINE-ALWAYS, because a canvas loop running on every card of a list of
   forty is a flat battery for thirty-nine things nobody is looking at. */
```

### AND ONLY ONE THIS PERSON MAY OPEN — `widgetFor_` in arcade.js, which the columns ask as well.

top level, before `slot.innerHTML`

```
/* AND ONLY ONE THIS PERSON MAY OPEN — `widgetFor_` in arcade.js, which the columns ask as well.
     This door looked a widget up by id and asked nothing else, so the flyer maker was admin-only on
     every surface except the one that opens a widget from a card. */
```

### THROUGH `tileSet_`, NOT INTO `.tile-k`.

top level, before `slot.innerHTML`

```
/* THROUGH `tileSet_`, NOT INTO `.tile-k`. There is no `.tile-k` on an icon-only tile, so both of
     these lines were `null.textContent` — a thrown error on the first press of Open, and on the
     press that put it away again. `tileSet_` swaps the mark and rewrites the name. */
```

### ---------- A BOUT

top level, before `fightTiles_`

```
/* ---------- A BOUT -----------------------------------------------------------------------------
   THE ONLY ACTION A FIGHT HAS IS WATCHING IT, and it was a loose `.btn` in the middle of the card,
   above the tile row, styled like nothing else on the screen. It is the same act as opening a paper
   or a widget, so it is the same control in the same place.

   A LINK, NOT A BUTTON. `tile_` takes `href` and draws an anchor with `target` and `rel` already
   on it — which is the whole reason that branch exists, and it is what this was reaching past.

   `video_url` OR THE SEARCH, whichever the backend found — see `video: S(r.video_url) ||
   S(r.video_search_url)` in doget. So a bout nobody has tracked down still offers a way to look,
   and there is nothing here to tell the two apart. */
```

### ---------- WHAT YOU CAN DO ABOUT YOURSELF — NOTHING, ON THIS CARD

top level, before `fightTiles_`

```
/* ---------- WHAT YOU CAN DO ABOUT YOURSELF — NOTHING, ON THIS CARD ------------------------------
   `meTiles_` WAS HERE: `Your settings`, `Add your child`, `Your figure` and `Build`. Asked for as
   *"remove edit tile as they can already edit their profile on the column to the right. remove add
   your child tile as that should go on column to the right. remove you figure column. remove build
   tile too."* Every one of the four was a DOOR to the Settings column — `edit-me` and `wardrobe`
   were literally `go('settings')` — and the column is one swipe from this card, so each tile was a
   second route to a place the swipe already reaches. The things themselves moved there: the child
   request is "Manage your child" on that column (`childManageCard_` in me.js), and the build stamps sit
   under the admin's own Signing-in card. The figure was that column's last card and is a section of
   this card's own Edit now (docs/history/339) — Edit is the door, not a tile of its own.

   `kind: 'me'` STAYS ON YOUR OWN ITEM and routes to nothing below, which is deliberate: the kind is
   what stops `tutorTiles_` drawing a Message tile addressed to yourself — the reason it was built —
   and that is still true with no actions of its own to offer. */
```

### ---------- A FIGHTER'S ONE DOOR: HIS FIGHTS, ON FILM

top level, before `boxerTiles_`

```
/* ---------- A FIGHTER'S ONE DOOR: HIS FIGHTS, ON FILM ----------------------------------------------
   THE BOUT'S `Watch`, ONE KIND ALONG. A bout carries the search the sheet wrote for it; a fighter
   has no column of his own for one, and needs none — his name and the word "highlights" is the
   search anybody would type. Built here rather than stored so a row added tomorrow has the door
   without anybody filling a cell in.

   A LINK AND NOT A BUTTON, through `tile_`'s `href`, which draws the anchor with its `target` and
   `rel` — the same reason the fight's tile has no `act`. Nothing inside the app plays it, so it
   should not pretend to — the argument the films' Drive tile made, before the films left Find. */
```

### `filmTiles_` WAS HERE — a film's Watch tile, a link out to Drive in the row under its Find card.

top level, before `cardTiles_`

```
/* `filmTiles_` WAS HERE — a film's Watch tile, a link out to Drive in the row under its Find card. It
   went with the films (the owner, 10 Oct: *"films should not appear in the finder it cannot be found
   there"*); a film is found in Games → Videos, whose row is its own door to Drive. */
```

### ---------- ONE ROW OF MARKS, UNDER THE CARD

in `cardTiles_`

```
/* ---------- ONE ROW OF MARKS, UNDER THE CARD ----------------------------------------------------
     THE STAR FIRST, on every kind including the ones with no actions of their own — which is most
     of them. `favTile_` returns nothing for a card with no key or a visitor who is not signed in,
     so this stays one line rather than a condition per branch.

     ---- ONE ROW NOW, AND THE SAFETY ARGUMENT IS ANSWERED RATHER THAN DROPPED ----------------------
     THIS SAID "ADMIN STAYS ITS OWN ROW", and the reason was real: a bin in the same row as a
     trolley is one mis-tap from deleting a thing somebody meant to buy. What it produced was two
     rows of controls that looked like two different species — one bare, one on tinted plates — for
     actions that are all the same act: press a mark, something happens to this card.

     THE DISTANCE IS KEPT WITHOUT THE SECOND ROW. `is-admin` pushes off the left edge with an auto
     margin, so the admin marks sit at the far end of the row with the whole gap between them and
     the trolley — further apart on a phone than they were stacked, where a bin sat directly beneath
     a trolley and a thumb travels vertically. The colour says the rest. */
```

### AND `Open`, to Find, under a kept card that Saved or the Spotlight cannot draw whole — a practical's method, a project's steps, a textbook's chapters, a

in `cardTiles_`

```
/* AND `Open`, to Find, under a kept card that Saved or the Spotlight cannot draw whole — a practical's
     method, a project's steps, a textbook's chapters, a boxer's fights are a swipe up there and not
     here (`finderOpenTile_`, docs/history/347). */
```

### `me` HAS ONE ACTION, SIGN OUT, AND IT IS IN THE SAME ROW AS THE STAR.

in `cardActions_`

```
/* `me` HAS ONE ACTION, SIGN OUT, AND IT IS IN THE SAME ROW AS THE STAR. It was a row of its own
     under the star — *"why is sign out tile under the favourite tile?"* — which made one card carry
     two rows of marks for no reason anybody could see. The old argument was that its own row kept it
     from being pressed on the way to another tile; the star is the only other one, and signing out
     by mistake costs a sign-in, not anything saved. */
```

### AND "SEND THE LINK AGAIN" BESIDE IT while your own address is unproved — the paragraph under the row says why

in `cardActions_`

```
/* AND "SEND THE LINK AGAIN" BESIDE IT while your own address is unproved — the paragraph under the
     row says why (`mailHeldNote_` in me.js, drawn by `accountPages_`). A thing about your account, so a
     tile in this row and not a button of its own. */
```

### AND EDIT FIRST, on your own card — the owner, 10 Oct:

in `cardActions_`

```
/* AND EDIT FIRST, on your own card — the owner, 10 Oct: *"all of this stuff should be editable
     directly on the tutors card"*, and 11 Oct, for everybody: *"the random name generator should be one
     of the editable things in the profile settings of the profile card. your figure should also be in your
     profile card editing."* A pencil, and the card becomes its own form (`cardEditTile_`, me.js) — on a
     parent's, a student's and an admin's own card as on a tutor's (docs/history/339). That is not the `Your
     settings` tile the note over `fightTiles_` records the owner asking to go (*"remove edit tile as they
     can already edit their profile on the column to the right"*): that was a door to another column; this
     edits the card in place, and the Settings pages it would have led to are gone (docs/history/330). */
```

### A QUESTION'S ROW HOLDS THE STAR AND THE DAY YOU DID IT -- `questionTiles_` in find.js.

in `cardActions_`

```
/* A QUESTION'S ROW HOLDS THE STAR AND THE DAY YOU DID IT -- `questionTiles_` in find.js. It held the
     way to the answer page too, `To the answer`, until the owner: *"there doesnt need to be a scroll
     down tile on questions"* (8 Oct); the answer is the next page, a swipe away. Every other control on
     a question's pages is a tile, on the owner's word (*"it should all be tiles"*) — Send, Mark with
     AI, the pen's lock, its tools, Undo, Clear, Show and Hide — except the keypad's keys and the
     multiple-choice options, which are the answer being given rather than things done to it. See
     `ansBox_`, `padWrap_` and `choiceBox_` in find.js. */
```

### AND, WHERE THE QUESTION HAS A FIGURE BEHIND THIS PART AND IT IS ANSWERED BY TAPPING AN OPTION, `Figure` -- which opens it over the card.

in `cardActions_`

```
/* AND, WHERE THE QUESTION HAS A FIGURE BEHIND THIS PART AND IT IS ANSWERED BY TAPPING AN OPTION,
     `Figure` -- which opens it over the card. A typed box carries it at its own end instead (`ansBox_`).
     NO `Draw` / `Type`: a question answered by drawing is drawn on its card, with nothing to switch
     (`ansArea_` in find.js, docs/history/356). */
```

### THE `group` TILE WAS HERE — "Open", on a card standing for a whole paper.

in `cardActions_`

```
/* THE `group` TILE WAS HERE — "Open", on a card standing for a whole paper. Collections are gone
     from the funnel (see the note where `collectionAxes_` used to be in find.js): a paper is an
     ANSWER to an ordinary question now, so opening one is a tap on the funnel's own answer row and
     there is no card to hang a tile on. */
```

### ---------- WHAT YOU CAN DO WITH A SESSION

top level, before `jobTiles_`

```
/* ---------- WHAT YOU CAN DO WITH A SESSION -------------------------------------------------------
   PAY AND WITHDRAW WERE FULL-WIDTH BUTTONS UNDER THE PAPER, each with a paragraph beneath it — two
   blocks of prose and two slabs of colour on a card whose actual content is fourteen rows. Every
   other kind in this app answers the same question with one row of marks, and a session had no
   reason to be the exception.

   THE WORDS ARE NOT LOST. `tile_` puts the label in `title` and `aria-label`, so the mark is named
   on hover and read aloud — and the two sentences those buttons carried are facts about the
   session, which now say themselves on the receipt: `Stage` says whether it is waiting on us, and
   `Total` says what it comes to.

   ASKING IS STILL ASKED. `job-leave` confirms before it does anything and the question names the
   consequence — that was never the button's job, and shrinking the button does not change it.

   ORDER: pay, then leave. The same order they stood in, and for the same reason — one is what most
   people came to do, the other is looked for deliberately. */
```

### ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN

top level, before `jobTiles_`

```
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN ------------------------------
   THIS RETURNED NOTHING FOR A SESSION THAT IS NOT YOURS, and the way in was `joinBlock` in book.js —
   a gold button under the paper with a paragraph either side of it. *"The session booking thing at
   the bottom of receipt should be a line in the booking"*, and *"it should all be tiles"*: so the
   seats are the receipt's `Sharing` row and getting in is a tile in the same foot as Share, where
   anybody already on the session finds Pay and Withdraw. Same question — what can you do with this
   session — answered in one place for everybody who can see it. */
```

### ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT

top level, before `joinTile_`

```
/* ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT -----------------------------------
   CARRIED OVER FROM `joinBlock`, WHOSE ARGUMENT IT WAS. A waiting list shows itself to everybody —
   `joinWaitlist` writes `open_to_others` TRUE and `doGet` sends any open booking with seats left to
   every client, no names. The fault was the BUTTON: it sent `move`/`Request` for both, which is how
   you ask to share somebody ELSE'S booking, and on a class that is the wrong act in every
   particular — there is no family to ask, the seat has a fixed price, and joining writes you your
   own receipt at that price and records when you can come.

   SO ONE MARK AND TWO WORDS. A person with a plus is `Make an account` on the sign-in card and it is
   the same gesture here — put me in — so the mark is shared and the LABEL says which act it is:
   `Take a seat` on a list, `Ask to join` on a session a family booked. Each goes to its own handler
   in receipt.js, and both turn to the form rather than sending: nothing leaves until the one send
   button is pressed, with the price and the day questions in front of you.

   `canAsk` IS THE GATE AND IT IS THE SERVER'S. `doGet` computes it — not yours, open, a seat going —
   *"so the phone does not have to work it out, and so it cannot work it out wrongly and offer a join
   on something that is not open"*. A full session and one you are already on both offer nothing.

   THE FAINT SENTENCE UNDER THE OLD BUTTON IS THE NOTE. A tile has room for about three words, and
   each sentence had one fact worth keeping: on a list nobody is charged until it fills, and on a
   session the family say yes first. The rest of each is said by the form the tile turns to, at the
   moment it matters — the argument `jobPage_` makes for dropping an admin's paragraph.

   `tone: 'buy'` ON BOTH, because each is the one thing a stranger on this page came to do — the gold
   `.btn` the block drew said the same, and `Pay` and `Accept` wear it for the same reason. */
```

### A tap on a tile row that is not on a row.

top level, before `jobAdminTiles_`

```
/* A tap on a tile row that is not on a row. The rows used to sit inside a card whose whole surface
   opened a sheet; the surface no longer does anything, and this exists so a stray tap is explicitly
   nothing rather than accidentally something later. */
```

### ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES

top level, before `jobAdminTiles_`

```
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES -------------------------------------------------
   THEY WERE FOUR `<button>`s BUILT INSIDE THE RECEIPT and `jobTiles_` twelve lines up was already
   building the client's two. So one object — a session — had its actions drawn by two different
   renderers in two files, in two shapes, and only one of them was checked by anything.

   THE RULE THIS SETTLES, and it was never written down: a THING has tiles; a FORM has buttons. A
   session is a thing. The booking form and the pay sheet are forms, and their buttons stay where
   they are — see the note in CLAUDE.md.

   WHAT IT COSTS, honestly: the old block carried a paragraph under each button explaining the
   consequence, and a tile has room for a few words. The consequences are too important to drop, so
   they are one paragraph under the row rather than one per button — the same words, said once.

   THE ORDER IS THE ORDER OF THE DECISION. Accept and Decline are two halves of one choice and sit
   together; Mark as paid only exists once it is accepted; Delete is last because it is a different
   act — Decline turns down a session never taken up, Delete ends one that was already agreed. */
```

### TILES, NOT A ROW. This returned its own `.tile-row`, and `jobPage_` wrapped it in another beside the client's two — a row inside a row.

in `jobAdminTiles_`

```
/* TILES, NOT A ROW. This returned its own `.tile-row`, and `jobPage_` wrapped it in another
     beside the client's two — a row inside a row. The row is the receipt's foot now, built once in
     `jobPage_` with the class the booking form's row carries, so this hands over the marks and the
     caller decides where they go. Still never `.tiles`, which is the widget grid. */
```

### ---------- WHAT YOU CAN DO ABOUT A POST

top level, before `postTiles_`

```
/* ---------- WHAT YOU CAN DO ABOUT A POST ----------------------------------------------------------
   A POST IS A THING, SO IT HAS TILES. That is the rule in CLAUDE.md and this was the last thing in
   the app still arguing with it: a `<span>` holding `⋯` for editing, a `<button class="post-act">`
   for sharing, and two `.btn`s for putting it up — three different controls for three actions on one
   object, in three places on the card, styled three ways.

   THE SPAN WAS THE WORST OF THE THREE and it is the same fault the docket had: a `<span>` with a
   `data-do` on it cannot be reached by a keyboard, is not announced as a control, and is invisible
   to `check/ui.js`'s tap-target pass because that pass looks at buttons, links and inputs. It
   measured nothing and was about 14px.

   `jobAdminTiles_` ABOVE IS THE PATTERN and this follows it exactly: one `.tile-row`, ordinary
   actions first, the admin's decisions after, destructive last, and any real warning as ONE
   paragraph under the row rather than one note per tile.

   SHARING STAYS OUT OF THE REACTIONS ROW. The reactions are not actions on the post — they are a
   counted response, drawn as one line of pills under the picture (`reacts()` in posts.js, and the
   owner's *"Looks abit scuffed"* of 9 Oct for why they are pills now). Share IS an action on the
   post, so it is a tile in the row below, which is the same place every other thing in this app
   puts its actions. */
```

### THE DECISION, ON THE POST ITSELF — the same argument the old button row carried and worth keeping:

in `postTiles_`

```
/* THE DECISION, ON THE POST ITSELF — the same argument the old button row carried and worth
       keeping: you are already looking at the photograph and the caption, which is everything the
       decision is about, and a separate approvals screen is a second place to remember to visit. */
```

