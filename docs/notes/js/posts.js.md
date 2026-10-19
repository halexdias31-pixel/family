# js/posts.js

The full text of comments in `js/posts.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — posts.js ONE FILE, SPLIT.

top level, before `pic`

```
/* ==================================================================================================
   @family. — posts.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   posts.js is number 8 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- POSTS

top level, before `pic`

```
/* ---------- POSTS -------------------------------------------------------------------------------
   The front of the app. A picture, a line about it, and a heart with a number.

   Full width and one column: a photograph split across two columns on a phone is two photographs
   of nothing.
--------------------------------------------------------------------------------------------- */
```

### THE FEED, IN ORDER. The sheet's row order is Drive's iteration order, which is not chronological and not anything — February posts were sitting between June

top level, before `postMedia_`

```
/**
 * THE FEED, IN ORDER.
 *
 * The sheet's row order is Drive's iteration order, which is not chronological and not anything —
 * February posts were sitting between June ones, and a feed in no order reads as a feed that
 * failed to load rather than as one arranged badly.
 *
 * `parseDMY` rather than `new Date()`: the cells are DD/MM/YYYY and a browser reads those as
 * American, so 12/06 becomes December.
 */
```

### ---------- ONE POST, AS A CARD

top level, before `postMedia_`

```
/* ---------- ONE POST, AS A CARD ------------------------------------------------------------------
   THIS WAS THE BODY OF `feedPosts`'s `map` AND NOTHING ELSE COULD DRAW A POST. That was fine while
   the feed was the only place posts appeared; it stopped being fine the moment they became a thing
   you can search for, because the funnel needs a card for every kind it lists and there was no
   function to ask.

   LIFTED OUT UNCHANGED. Same markup, same order — who, picture, actions, caption — same admin
   controls, same everything. `i` is still taken because the first two pictures load eagerly and
   the rest lazily, and a post found by searching is the first thing on its page, so it is passed 0
   from there.
--------------------------------------------------------------------------------------------- */
```

### ---------- EVERY PICTURE AND CLIP ON A POST, AS ONE LIST

top level, before `postMedia_`

```
/* ---------- EVERY PICTURE AND CLIP ON A POST, AS ONE LIST ----------------------------------------
   ASKED FOR AS "tutors should be able to post more then one photo. not just one. and also videos."
   `doGet` sends `media` — the first item and every one after it, in order — and a payload from a
   backend older than that sends `image` alone, so that is the floor: one list either way, and
   nothing below this has to know which backend answered. */
```

### THE ADDRESS A `<video>` IS POINTED AT.

top level, before `postVidSrc_`

```
/* THE ADDRESS A `<video>` IS POINTED AT. A Drive link is a PAGE, which a `<video>` cannot play, so a
   Drive file goes to its download address — the bytes, which is the only thing that element can
   read. NOT THE `/preview` EMBED: that is Google's own player in an iframe, which is exactly what
   "remove the embedded reels. they suck." took off the Reels column, and a post is the same
   picture-that-moves on the column next door. If Drive will not hand the bytes over the element
   says so with `error`, and `postVidFail_` below replaces it with a plain link to the file rather
   than with somebody else's player. */
```

### ONE ITEM, drawn as a picture or as a clip.

top level, before `postItem_`

```
/* ONE ITEM, drawn as a picture or as a clip. `controls` because a post's clip is somebody's
   footage to be watched on purpose — not a reel that plays itself as it scrolls past — and
   `preload="metadata"` so a feed of ten clips is not ten downloads before anybody presses one. */
```

### ---------- SEVERAL OF THEM, IN A GRID RATHER THAN A STRIP

top level, before `PICS_BACK`

```
/* ---------- SEVERAL OF THEM, IN A GRID RATHER THAN A STRIP --------------------------------------
   NOT A SIDEWAYS CAROUSEL, and the app is why: every screen here is reached by a sideways swipe, so a
   strip of photographs you swipe along would eat exactly the gesture that changes column — the
   fault this repository already records on the notepad, the answer box and the line of best fit.
   Two columns of squares, and when the count is odd the first one takes the whole width, so the
   photograph somebody put first is the one that leads. Squares crop — `object-fit: cover` — which the
   single-picture rule above refuses, and that refusal is about ONE picture shown whole; in a grid
   the square IS the thumbnail and every picture still has the same size as its neighbours. */
```

### ---------- THE NEXT POSTS' PICTURES ARE ASKED FOR BEFORE YOU REACH THEM

top level, before `PICS_BACK`

```
/* ---------- THE NEXT POSTS' PICTURES ARE ASKED FOR BEFORE YOU REACH THEM ----------------------------
   `loading="lazy"` waits for a picture to near the viewport, and in a column whose pages are moved by
   a transform that is the moment you have already swiped to it — "each post loads as it goes".
   Measured with the files arriving 800ms late: only 2 of 5 had been asked for when page 3 came up.
   So every placement of the feed turns the pages one behind and two ahead to `eager`, which starts
   the request and nothing else; the element, its box and its `src` are untouched, so a repaint
   draws exactly what it drew. A clip is not touched — `preload="metadata"` is a decision about
   somebody's data allowance and stays one. Called from `placeNow_` in shell.js.
   ---------- EVERY COLUMN NOW, SIX PAGES AHEAD, AND THE REST IN THE QUIET (`picsAhead_`, docs/history/341) -----
   Measured on 11 Oct at 4x CPU with pictures 300ms away: of 53 pictures late on the card in front, 42 had
   been ASKED FOR after their card was already in front (median 565ms after) — the request, not the
   network, was what was late, and only the Feed asked ahead at all. A run of flicks comes at five a
   second, so a request has to leave about a second before its card arrives: six pages. So the column in
   front, in every placement that is not a finger's: its pages two behind to six ahead in the direction
   it was last turned (mirrored going up) are asked for now, those off the glass at `fetchpriority="low"`
   so the card on the glass is never queued behind them. Attributes only, at most nine pages. Everything
   further — decoding the next two pages, the columns beside it, every other column — is the builder's,
   in the quiet (`picsJobs_` below). Boxers, figures, the shop, faces, profile shots, DM pictures and
   video thumbnails are all reached, because it asks every `img[loading="lazy"]` in a page, whatever it is. */
```

### ---------- AND IN THE QUIET: THE NEXT TWO DECODED, THE COLUMNS BESIDE, THEN EVERY OTHER COLUMN

top level, before `PICS_ASKED`

```
/* ---------- AND IN THE QUIET: THE NEXT TWO DECODED, THE COLUMNS BESIDE, THEN EVERY OTHER COLUMN -----------
   One builder job per column with work left (`ahead_`, shell.js), nearest column first:
     · the column in front: `img.decode()` on the next `PICS_DECODE` pages in the direction of travel, so the
       picture a flick lands on is not decoded in the frame it arrives — WebKit decodes on the main thread —
       and only two, because each photograph is about 7MB decoded and the browser may throw them away;
     · the columns beside it (one either side on a phone, `GLASS.cols` on a wide window): their page in
       front, one behind and two ahead, asked for — a sideways flick lands on P — and on a wide window the
       front page of each column on the glass decoded too;
     · every other column: P−1 to P+4, asked for, for the next sweep.
   Attributes and a decode only: nothing is redrawn for a picture. No clip is touched (`preload` stays) and a
   YouTube poster keeps 319's one-player rule, so no video byte is added. */
```

### ---------- AND A CARD FILLED AFTER THE PLACEMENT IS ASKED FOR AS IF THE PLACEMENT HAD SEEN IT

top level, before `PICS_ASKED`

```
/* ---------- AND A CARD FILLED AFTER THE PLACEMENT IS ASKED FOR AS IF THE PLACEMENT HAD SEEN IT --------------------
   FOUND BY REVIEW ROUND 1 (12 Oct), re-running check/reach.js: "res page 7 (in front 1) is still lazy" on the
   Boxing shelf at 390. The reach above is applied IN THE PLACEMENT, and a finder's window is filled after it — the
   band in the same task, every card past the band by the builder, one per slice — so a card filled six ahead
   kept `lazy` until something placed the column again, which at rest is nothing. So for the column in front this
   job wants the placement's own pages, two behind to six ahead, and runs the placement's own function on them
   (`picsAhead_`): one rule, whichever of the fill and the placement comes last. */
```

### THE PICTURE'S OWN SHAPE, EDGE TO EDGE — and 4:5 only until the file says what that is.

in `postMediaHtml_`

```
/* THE PICTURE'S OWN SHAPE, EDGE TO EDGE — and 4:5 only until the file says what that is.
       This was a fixed 4:5 box with the picture `contain`ed inside it on the sunk ink, bought so a
       card could not change height after its column was placed (a 2:1 landscape arriving 800ms late
       shrank its card by 203px under the thumb). It letterboxed every photograph that was not 4:5 in
       black, and went on "please dont add the ugly black boarder to posts".
       So the box is `aspect-ratio: auto 4 / 5` (`.page .post-pic` in style.css): 4:5 while the file
       is on its way, the file's own proportions once it has landed. `width`/`height` say the same 4:5
       to anything that reads the attributes before the stylesheet — a browser maps them to exactly
       that `auto` ratio. What the fixed box bought is kept by two things that cost no black:
       `picsAhead_`, which asks for the pictures before their page is in front of anybody, so the
       change normally happens off-screen; and `holdColumn_` in shell.js for the case it does not.
       A page is NOT a fixed cell — it is `height: auto` in an ordinary CSS column — so a picture
       landing on a card ABOVE the one being read moves that one, by however much the 4:5 it
       reserved differs from the file: 224px for a 16:9 landscape on a 390px phone, and it adds up
       down the column. Without `holdColumn_` the post in front stays wherever that leaves it; with
       it, it is back on its line in the same frame, because the `ResizeObserver` that sees the card
       grow runs before paint. The measurements are in `holdColumn_`'s own note, in one place. */
```

### A CLIP DRIVE WOULD NOT HAND OVER BECOMES A LINK TO IT, not a black box with a play button that does nothing.

top level, before `postVidFail_`

```
/* A CLIP DRIVE WOULD NOT HAND OVER BECOMES A LINK TO IT, not a black box with a play button that
   does nothing. `error` does not bubble, so this listens in the capture phase, once, for the whole
   document — the same one-listener shape every `data-do` in this app has. */
```

### ---------- THROUGH `personFace_`, THE ONE FUNCTION EVERY FACE GOES THROUGH

in `postCard_`

```
/* ---------- THROUGH `personFace_`, THE ONE FUNCTION EVERY FACE GOES THROUGH -----------------------
       `p.avatar` IS THE AUTHOR'S `photo` CELL — a link, nothing, or one of the eleven tokens (the
       owner, 10 Oct: *"…which allow you to use your avatar as a dp."*) — and `p.figure` is their
       wardrobe string, sent only when that cell is `pfp:avatar` (`faceFig_` in core.gs). AN OLDER
       BACKEND PUT THE WEARABLE STRING ITSELF IN `avatar`, ahead of the photograph, and this drew it as
       an `<img>` — a broken square on every post by anybody who had dressed their figure. `picKind_`
       reads that string as no picture at all, so it falls to the brand's mark as an empty face always
       has, on either backend. */
```

### ---------- THE FACES' SLOT, BUILT ONCE BECAUSE IT GOES IN ONE OF TWO PLACES

in `postCard_`

```
/* ---------- THE FACES' SLOT, BUILT ONCE BECAUSE IT GOES IN ONE OF TWO PLACES ---------------
       Under the picture when there is one, after the words when there is not — see the two places
       it is dropped in below. Built here so the two cannot drift into two versions of one row.

       WHAT AN EMPTY ROW MEANS, WHICH IS NOT WHAT IT USED TO MEAN. IT SAID "fill in
       `brand!reactions`" AND THAT RUNG NO LONGER EXISTS. The brand tab became
       `data/settings/brand.json`, which the phone reads and Apps Script cannot — so `reactionSet`
       is down to the post's own cell and `HOUSE_REACTIONS`, and that second one is six faces in
       `constants.gs` that are never empty. Measured: `reactionSet` cannot return an empty list, so
       `doGet` cannot send `reactions: null`.

       WHICH MAKES THIS BRANCH UNREACHABLE ON ANY CURRENT BACKEND, and that is exactly what it
       should now say. An empty row means the payload came from a deployment older than the house
       set — nothing to type into a cell, and the remedy is a sync. Sending somebody to edit a tab
       that is not there any more is the fault this repository records under `.favwrap.is-fav` and
       under the dead `kind === 'paper'` guard: a sentence that outlived the thing it described.

       AND EVERYBODY ELSE GETS NO SLOT AT ALL. It used to be an empty `<span></span>`, which existed
       only to balance a flex row against the Share button beside it; Share is a tile in the row
       below now and there is nothing left here to balance. */
```

### The order is Instagram's, and it is right:

in `postCard_`

```
/* The order is Instagram's, and it is right: WHO first, then the picture, then what you can do
       about it, then what it says.
       Who first because a photograph with no attribution is an advert; the caption last because it
       is the only part you may not read. */
```

### THE ⋯ STOOD HERE — "one glyph, at the end of the row where it does not compete with the picture; a post is looked at a hundred times for every time it is

in `postCard_`

```
/* THE ⋯ STOOD HERE — "one glyph, at the end of the row where it does not compete with the
              picture; a post is looked at a hundred times for every time it is edited, so the
              control is small." Small is right and a `<span>` was the wrong way to get it: a span
              with a `data-do` cannot be reached by a keyboard, is not announced as a control, and
              is invisible to `check/ui.js`, which measures buttons, links and inputs. It was about
              14px and nothing had ever said so.
              Editing is now a tile in the row under the post, with every other thing you can do to
              it — see `postTiles_`. */
```

### A SHAPE BEFORE IT LOADS.

in `postCard_`

```
/* A SHAPE BEFORE IT LOADS. Without one an image is a zero-height box until the photograph
             arrives — so the pane is measured short, the grid places the panes for that height, and
             two posts overlap by exactly the height the picture turned out to be.
             `aspect-ratio` reserves the room. 4:5 is the portrait most phone photographs are, and
             the real one replaces it the moment the file's own dimensions are known; the observer
             below catches that. Reserving the wrong shape briefly is a smaller error than reserving
             none, which is what the overlap was. */
```

### THE FACES, DIRECTLY UNDER THE PICTURE — the place the heart held, where the eye already goes and where the thing you can do about a photograph belongs.

in `postCard_`

```
/* THE FACES, DIRECTLY UNDER THE PICTURE — the place the heart held, where the eye already
            goes and where the thing you can do about a photograph belongs.
            The heart has gone. A like is a reaction with exactly one option, so having both was
            two counts of the same gesture — and a heart sitting beside a 👍 asking for the same
            press, with no way to tell somebody which one you meant.

            `.post-acts` IS THE SLOT FOR THE FACES AND NOTHING ELSE NOW: one line of equal pills,
            wrapping only when a post's own cell names more than six. Share went down into the tile
            row (see `postTiles_`), and the total went onto the time line (see `postWhen_`), so
            this is no longer a flex row with things to align — the owner, 9 Oct: *"refine how the
            post reactions look. Looks abit scuffed"*, and the scuff was most of all a row of
            different-width boxes wrapping a face and a bare number onto a line of their own.

            ON A POST WITH NO PICTURE THE FACES COME AFTER THE WORDS. Directly under the header
            they would be a row of faces reacting to nothing yet read; there, the words are the
            thing you are reacting to, so they go first. */
```

### WHAT YOU CAN DO ABOUT IT, IN ONE ROW.

in `postCard_`

```
/* WHAT YOU CAN DO ABOUT IT, IN ONE ROW. Sharing, editing, and the decision to put it up were
            three controls in three places drawn three ways — a `<span>` in the header, a
            `.post-act` beside the reactions, and a `.btn-row` down here. A post is a THING, and a
            thing has tiles: see `postTiles_`, which follows `jobAdminTiles_` exactly.

            THE DECISION STAYS ON THE POST, which was the right half of the old arrangement and the
            reason the button row was here rather than on an approvals screen: you are already
            looking at the photograph and the caption, which is everything the decision is about. */
```

### WHAT PEOPLE SAID UNDER IT.

top level, before `commentsHtml_`

```
/* ==================================================================================================
   WHAT PEOPLE SAID UNDER IT.

   ASKED FOR AS "should be able to comment on posts". A reaction says how a photograph landed and
   cannot say anything else; a post of a child's first A in a mock is a thing people want to write
   a sentence about.

   `post_comments` IS THE REACTION'S TAB ONE COLUMN WIDER — a post_id, a person_id, what they said
   and when — and `addComment` is `reactPost` with the one-per-person lookup taken out, because a
   remark is not a choice: somebody who says two things has said two things. The whole of that
   argument is in `SCHEMA.post_comments`.

   ---------------------------------------------------------------------------------------------
   AND IT DRAWS NOTHING AT ALL UNTIL THE BACKEND HAS BEEN DEPLOYED, WHICH IS THE POINT OF THE
   `Array.isArray` RATHER THAN A `|| []`.

   `doGet` sends `comments` on every post from the version this was written for. An older deployment
   sends no such key — and `|| []` would turn that into "no comments yet" under a composer that
   posts into `accessDenied`, which is the exact fault this repository names as its worst: I did not
   manage to look, reported as I looked and there was nothing there. An absent key is a feature that
   has not arrived, and the honest drawing of that is nothing.

   `pullFromGitHub` IS BLOCKED and clasp is unconfigured — see "Deploying" in CLAUDE.md — so the
   gap between this reaching Pages and the backend answering is real and may be days. Which is
   precisely why the phone must not pretend.
================================================================================================== */
```

### ---------- A CONVERSATION IS ONE ELEMENT, NOT A SECOND CARD

in `commentsHtml_`

```
/* ---------- A CONVERSATION IS ONE ELEMENT, NOT A SECOND CARD -----------------------------------
     `.post-said` SITS INSIDE THE `<article>` the post already is, under the tiles — because a
     comment is part of the post rather than a thing beside it, and a card of its own would page
     separately on the feed and leave the photograph behind.

     OLDEST FIRST, which `doGet` has already done. Doing it again here is a second copy of the
     ordering rule to get wrong later — the sentence `dmPages_` already carries about
     `messageThreads_`. */
```

### ---------- POST IS A TILE

in `commentsHtml_`

```
/* ---------- POST IS A TILE ------------------------------------------------------------------
          ASKED FOR AS *"post should be a tile too"* — after Check on a question card became one, and
          under the owner's lean that week, "it should all be tiles". It was a `.btn quiet` with the
          word on it, the one rectangle left under a post whose every other action — Share, Edit, and
          the admin's Put it up / Not this one — is already a tile in `postTiles_`.

          THE PAPER AEROPLANE, because sending is what it does: `send` is the mark tiles.js keeps for
          exactly that, so the composer and the booking form's `Ask for it` read as the same act.
          `cmt-go` and `data-id` stay — `cmt-add` finds the post by `data-id`, and `cmt-go` is the
          name anything outside this file finds the control by. The box is the only other thing in
          this composer and it is the words being written, not an action; nothing else here was a
          button.

          CLAUDE.md files "the composer" under FORMS, which keep buttons. This is the owner's word
          against that line, for this one composer — a remark under a photograph is a thing's own
          row, not a sheet — and the line is for the merge to bring into step. */
```

### A DRAFT (data.js), per post and per person:

in `commentsHtml_`

```
/* A DRAFT (data.js), per post and per person: a payload landing redraws the feed, which
                 emptied this box under somebody mid-sentence, and a reload lost it. Dropped when the
                 comment is on the sheet (`cmt-add`). docs/history/317. */
```

### ---------- POSTING ONE

top level, before `form`

```
/* ---------- POSTING ONE ---------------------------------------------------------------------------
   `send`, NOT `api`, AND THIS IS THE FILE THAT RECORDS WHY. `api()` resolves with `{ error: … }` as
   an ordinary answer, so a `.then` saying "Posted" runs on a refusal exactly as it runs on success
   — which is how a toast once said "Sent to Ada Tutor" about a message that was never written.
   `check-replies.js` asks this question of every caller; this one is about to make a claim.

   THE BOX IS FOUND BY WALKING UP, not by an id. There is one composer per post and a feed has
   several posts on screen — the fault `on('msg-send')` records one screen along, where a fixed id
   would have handed every button the first textarea on the page.

   AND THE FEED IS RELOADED RATHER THAN THE COMMENT INSERTED BY HAND. The row is on the sheet and
   the payload is what draws it; splicing a copy into `DATA.posts` is a second source for the same
   comment, and it would disagree with the server about the id the moment a Remove was pressed. */
```

### THE RING, NOT A WORD.

top level, before `el.disabled`

```
/* THE RING, NOT A WORD. This said `el.textContent = 'Posting…'` and put the old text back after —
     right for a button with "Post" on it, and on a tile it writes a word over the paper aeroplane
     and then "restores" an empty string, so the mark is gone for good after the first comment.
     `.tile.is-busy` swaps the mark for the spinning ring and keeps the plate, the way `send_` does
     for every tile it is handed. */
```

### TAKING ONE DOWN. `canRemove` came from the server per comment, so this button only exists where the server has already said yes — and the server checks again

top level, before `el.disabled`

```
/* TAKING ONE DOWN. `canRemove` came from the server per comment, so this button only exists where
   the server has already said yes — and the server checks again, because a button is not a
   permission. See `deleteComment`: it writes `active: FALSE` rather than deleting the row, which is
   the argument `approved` already makes on a post. */
```

### A DELETED POST IS GONE FROM THE FEED, for everybody including the admin who deleted it.

in `feedPosts`

```
/* A DELETED POST IS GONE FROM THE FEED, for everybody including the admin who deleted it.
       It used to stay, greyed and marked "· deleted", so that it could be switched back on — the
       same argument the tutor `listed` switch follows. In practice that put every post ever
       deleted permanently in the way of every post that had not been, on the one screen that is
       supposed to be a feed.
       Deleting is still a FLAG and not a removal: the row stays in the sheet, the picture stays in
       Drive, and the reactions and votes pointing at it stay counted. Putting one back is setting
       `active` to TRUE on the posts tab. That is the trade — the feed stays clean, and undoing a
       delete is a cell rather than a tap. */
```

### ---------- THE FEED IS A FUNNEL ANSWER, NOT A COLUMN

top level, before `postsBlocks`

```
/* ---------- THE FEED IS A FUNNEL ANSWER, NOT A COLUMN ---------------------------------------------
   `screen('posts')` WAS HERE. It was the last tab besides Find, kept because it is the one screen
   somebody opens with no errand — and every other column had already been folded in. What was left
   was one navigation for everything except this, which is two navigations.

   THE BODY IS UNCHANGED AND IS NOW A FUNCTION. `postsBlocks` returns exactly the card list the
   screen returned, in exactly the order it built — spotlight, the ＋, the festive cards, then the
   posts, pinned first and newest after. `feedPages_` in find.js puts them behind `What for · Posts`.
   Nothing about what a post looks like, how it sorts, or who may see it has moved. */
```

### NOTHING LOADED YET is not the same as NOTHING TO SHOW, and the difference matters:

in `postsBlocks`

```
/* NOTHING LOADED YET is not the same as NOTHING TO SHOW, and the difference matters: one is a
     wait and the other is a fact. Telling somebody "nothing posted yet" while the request is still
     in flight is a lie the app corrects a second later, which is worse than saying nothing.
     THE WAIT IS `loading_()`, the one every card draws (shell.js) — a page of its own, the dots with
     no card round them at the middle of the cell, where the post that lands is centred. It was a
     skeleton post of its own until the owner, 9 Oct: *"They should all have a simplistic simple
     loading thing."* */
```

### ---------- WHAT THE CALENDAR IS OFFERING, AT THE FRONT OF THE FEED

in `postsBlocks`

```
/* ---------- WHAT THE CALENDAR IS OFFERING, AT THE FRONT OF THE FEED -------------------------------
     THESE WERE ON THE BOOKING COLUMN, which is where they were built and is not where they belong.
     A festive card is the business saying "there is a holiday club on the 23rd, four places left" —
     an announcement with a date on it, which is precisely what this screen is for. It was next to
     the booking form only because bookings were.

     NOBODY PUBLISHES THEM. A holiday row carries a date and how many days ahead to appear, so six
     weeks before Christmas one puts itself here and the week after it is gone. That is the same
     thing the ＋ card at the top of this feed does by hand, done by the sheet.

     IN FRONT OF THE POSTS, because they expire and posts do not. A photograph from June will still
     be worth seeing next week; a club with four places left may not be there. */
```

### ONE POST PER SCREEN, and the same pager the tools use.

in `postsBlocks`

```
/* ONE POST PER SCREEN, and the same pager the tools use. A feed is the place this shape
     belongs most obviously — a photograph competing with the top of the next photograph is a
     photograph nobody looks at properly, and scrolling past one by accident is how you never see
     it again. */
```

### THE ＋ IS ON THE FEED, not in a bar above it.

in `postsBlocks`

```
/* THE ＋ IS ON THE FEED, not in a bar above it.
     It lived in the header, beside a ⟳ that rescanned the Drive folder — two glyphs in the corner
     of every screen in the app, one of which only means anything on this one and the other of
     which is a thing nobody should have to know exists. A control belongs beside the thing it acts
     on: adding a post belongs at the top of the posts.

     `unshift` rather than a separate strip, because a page is a page. It pages, it swipes, it is
     placed by the same grid as everything else, and it needs no rule of its own anywhere. */
```

### ---------- THE COMPOSER WAS HERE, AND IT WAS ALSO THE SCREEN TO THE LEFT

in `postsBlocks`

```
/* ---------- THE COMPOSER WAS HERE, AND IT WAS ALSO THE SCREEN TO THE LEFT ----------------------
     `unshift(newPostCard())` PUT IT AT THE TOP OF THE FEED, and `screen('make')` further down this
     file drew the identical card as a column of its own. Two pages, same card, one swipe apart —
     which is what you saw: "＋ New post" beside "＋ New post".

     THE FILE ALREADY SAYS WHICH ONE IS WRONG. The note under `screen('feed')` reads "THE COMPOSER
     IS NOT REPEATED AT THE TOP. It is one swipe left from anywhere in the feed, always in the same
     direction — which is what a column gives it that a card at the top of a list cannot, because a
     card at the top of a list moves as the list grows." That was the decision; this line was left
     behind when it was made.

     `PAGER.feed` COUNTED IT TOO, with `.concat(USER ? [''] : [])`, so removing it here without
     removing it there would page one past the end of the feed onto nothing. Both went. */
```

### ---------- SPOTLIGHT IS NOT HERE ANY MORE

in `postsBlocks`

```
/* ---------- SPOTLIGHT IS NOT HERE ANY MORE -----------------------------------------------------
     IT WAS ABOVE EVEN THE ＋, on the argument that nothing outranks what the business most wants
     seen at the top of its own feed. True while the feed was the screen the app opened on. It is an
     answer to a question now, which means somebody has to ask for Posts before spotlight exists —
     and the one thing spotlight is for is reaching somebody who has not asked for anything.

     SO IT IS IN FRONT OF THE QUESTION INSTEAD, the first page of the funnel, before anything has
     been narrowed. See `screen('stuff')` in find.js. */
```

### ---------- SIGNING IN IS NOT HERE EITHER

in `postsBlocks`

```
/* ---------- SIGNING IN IS NOT HERE EITHER -------------------------------------------------------
     IT WAS AT THE TOP OF THIS FEED because the feed was the screen nobody arrived at with an errand,
     and a state that governs everything belonged where somebody landed. The feed is an ANSWER now —
     `What for · Posts` — so it is behind a question, and a way in that is behind a question is a way
     in you have to already be able to use.

     IT IS ON THE QUESTION ITSELF. `#stuff-controls` is drawn before anything is narrowed and is
     never filtered away, so signed out you meet the sign-in card first and signed in you get your
     credits and the way out. See `screen('stuff')` in find.js. */
```

### THE CAMERA, ON THE PAGE.

top level, before `CAM_STREAM`

```
/* ==================================================================================================
   THE CAMERA, ON THE PAGE.

   THE 📷 TAB DREW "＋ New post" — a card describing a photograph rather than a way to take one. The
   feed drew the same card at its top, so the tab was a duplicate of a card one swipe away, and
   neither of them was a camera.

   THIS IS THE VIEWFINDER. Live preview in a glass card, a shutter under it, and the still held on
   the page once taken.

   --------------------------------------------------------------------------------------------------
   IT DOES NOT UPLOAD, AND THAT IS NOT AN OVERSIGHT.

   `on('new-post')` takes a LINK to a picture, deliberately: "Uploading meant this app had to be
   allowed to write to your Drive, which is a large permission to hold for the sake of one button."
   The backend has no endpoint that accepts an image either — `imageData` runs the other way, fetching
   a URL and returning a data URI.

   So a still taken here is SAVED TO THE PHONE, and the composer's folder picker finds it once it
   reaches the Drive folder — which is the route the composer's own note describes: "share it to the
   folder from the camera roll and it is here". One extra step, and it is the step that keeps this
   app out of your Drive's write permissions.

   --------------------------------------------------------------------------------------------------
   IT STARTS WHEN THE COLUMN ARRIVES, AND IT USED TO WAIT FOR A TAP.

   The note here said a gesture was required for `getUserMedia`. That is not the rule — the rule is
   PERMISSION, which is a prompt the browser raises on its own and then remembers for the site. So
   the button bought nothing after the first visit: you granted the camera once and were still asked
   to press `Turn the camera on` every single time the column came round.

   Started from `go` now, the same way the tools and games are, through `afterSlide_` so the markup
   it needs is in the document before it looks for it.

   A REFUSAL STILL HAS TO LEAVE A WAY BACK. If the prompt is declined, or the page is not on https,
   or another app holds the camera, there is no gesture coming and nothing would ever retry — so the
   button is still here, hidden, and appears with the sentence saying what went wrong. It is a retry
   after a failure rather than a step in the normal path, which is the difference the old one blurred.

   AND IT STOPS WHEN THE COLUMN LEAVES — `camStop_`, called from `go` beside `toolsStop_`. A live
   camera behind a screen nobody is looking at is a recording light on for nothing.

   --------------------------------------------------------------------------------------------------
   A PICTURE FROM THE GALLERY LANDS IN THE SAME CANVAS A SHOT DOES.

   `Photos` is a file input wearing a label, and what it picks is DRAWN INTO `cam-still` rather than
   given an element of its own. So `Again` and `Save it` need to know nothing about where the picture
   came from: there is one held image on this card and one set of buttons for it. A second element
   would have meant every one of those handlers asking which of two things it was looking at, which
   is three states to keep in step for no gain anybody can see.
================================================================================================== */
```

### ---------- A QUESTION STILL OPEN, AND AN ANSWER THAT WAS NO

top level, before `CAM_ASKING`

```
/* ---------- A QUESTION STILL OPEN, AND AN ANSWER THAT WAS NO ---------------------------------------
   `CAM_STREAM` IS NULL FOR THE WHOLE TIME THE PROMPT IS UP, and "is there a stream" was the only
   thing `camStart_` asked before asking the browser. So anything that called it in that window asked
   a second time: the inbox landing and the profile refresh each `repaint`, and a repaint on the
   camera page runs `startScreen_`. Two grants were two streams, the second overwrote the first in
   `CAM_STREAM`, and the first was never stopped — a recording light nothing could turn off. Measured
   by the audit with the browser refusing: one swipe up, two asks, the second from the inbox repaint.
   `CAM_ASKING` is the question being open; while it is, nobody asks it again.

   `CAM_FAILED` IS THE LAST ANSWER BEING NO, on this visit to the page. Chrome remembers a refusal and
   answers the next ask itself, but Safari may put the prompt up again — so a repaint after a refusal
   was a prompt nobody swiped for, which is the report this was written for arriving by another road.
   Held until the page is left (`feedCamWatch_`, `camStop_`) or `Try the camera again` is pressed,
   and drawn back onto every redrawn card by `camFailed_`, so a repaint cannot quietly turn the
   sentence saying why back into the loader that says it is starting. */
```

### ---------- WHICH WAY IT IS POINTING, AND WHY IT IS A VARIABLE NOW

top level, before `CAM_FACE`

```
/* ---------- WHICH WAY IT IS POINTING, AND WHY IT IS A VARIABLE NOW --------------------------------
   IT WAS `{ ideal: 'environment' }` WRITTEN INTO `camStart_` and there was no way to change it, so
   a phone whose front camera is the one you want could take a photograph of the wall behind you and
   nothing else. `Switch` is the fourth control on the whiteboard and this is the fact it moves.

   `ideal` RATHER THAN `exact`, BOTH WAYS. A laptop with one front camera asked for `exact:
   environment` throws OverconstrainedError; asked for `ideal` it gives what it has. The flip
   control is only ever shown when the browser has said there are two — see `camWays_` — so the
   `ideal` is a floor under a case that should not arise rather than the thing being relied on. */
```

### "Starting" RATHER THAN "off", BECAUSE IT IS.

in `cameraCard`

```
/* "Starting" RATHER THAN "off", BECAUSE IT IS. This panel shows for the moment between the
            column arriving and the first frame, and `The camera is off.` was a statement about a
            state the card no longer has — read while the thing it denied was already happening.
            AND "STARTING" IS THE ONE LOADER NOW, not a sentence of its own: the owner, 9 Oct, *"they
            should all have a simplistic simple loading thing"*. It sits in the middle of the
            viewfinder, where the picture will be; a camera that did NOT start is a fact, not a wait,
            and keeps its words (`camFailed_`). */
```

### ---------- AND AT REST IT IS A VIEWFINDER THAT IS OFF, NOT A WAIT (docs/history/341)

in `cameraCard`

```
/* ---------- AND AT REST IT IS A VIEWFINDER THAT IS OFF, NOT A WAIT (docs/history/341) ----------------
            The loader was drawn here for "the moment between the column arriving and the first frame" —
            and the card is drawn long before that moment, on the Feed's first page, which an iPad shows at
            both ends of every sweep across the row: measured on 11 Oct, 1.0–1.2s of the loader on the glass
            per run, for a camera nobody had asked for. Off its page nothing is coming, and a wait is drawn
            only where something is (`loading_`'s rule, check-loading.js). So the panel is the dark stage on
            its own until `camStart_` asks for the camera, which puts the loader in it for exactly the time
            between the ask and the first frame; a camera that did not start keeps its words (`camFailed_`). */
```

### ---------- FOUR CONTROLS, WHICH IS WHAT A CAMERA HAS

in `cameraCard`

```
/* ---------- FOUR CONTROLS, WHICH IS WHAT A CAMERA HAS ------------------------------------
          ASKED FOR ON THE WHITEBOARD BY SHAPE AND COLOUR: "white circle for take pic, Red for
          record, and switch camera, and photos". What was here was five `.btn quiet` rectangles
          reading `Photo`, `Video`, `Again`, `Save it`, `Photos` — a form's buttons under a
          viewfinder, where every camera anybody has used puts a shutter.

          AND TWO OF THEM ARE NOT BUTTONS IN THIS APP'S SENSE. A white disc and a red disc are the
          camera's own vocabulary, not this app's — the same case as the chessboard's cream and
          charcoal, which the house style already settles: a colour belonging to ONE component is
          declared on that component rather than offered to the whole stylesheet. `--cam-white` and
          `--cam-red` live on `.cam-bar`.

          THE SHUTTERS ARE DISABLED, NOT HIDDEN, UNTIL THE STREAM IS LIVE. A camera starting up
          shows a greyed shutter; it does not remove it and grow the card back under your thumb when
          the first frame arrives. `Switch` is the exception and it is a different question — see
          `camWays_`: until the browser has said there are two cameras, a flip control is a button
          that would do nothing, which is the `orderPrints` shape.

          `Again` AND `Save it` ARE NOT IN THIS ROW ANY MORE. They belong to a picture you are
          holding, not to a camera you are pointing — so they are the row underneath, and it is
          empty until there is something to save. */
```

### A LABEL, NOT A BUTTON, so the file input opens with no script at all — a `for` reaches a control the page is hiding, which is the one way to style a file

in `cameraCard`

```
/* A LABEL, NOT A BUTTON, so the file input opens with no script at all — a `for` reaches a
            control the page is hiding, which is the one way to style a file picker without
            rebuilding it. `accept="image/*"` and NO `capture`: capture would reopen the camera,
            which is the thing this button exists to be an alternative to. */
```

### SEVERAL, AND CLIPS AS WELL AS PHOTOGRAPHS — "tutors should be able to post more then one photo. not just one. and also videos."

in `cameraCard`

```
/* SEVERAL, AND CLIPS AS WELL AS PHOTOGRAPHS — "tutors should be able to post more then one
            photo. not just one. and also videos." `multiple` is the whole of the first half; the
            handler files each one into the post. */
```

### ---------- ONE LINE ABOUT IT, BECAUSE A POST WITH NOTHING SAID ABOUT IT IS A PHOTOGRAPH

in `cameraCard`

```
/* ---------- ONE LINE ABOUT IT, BECAUSE A POST WITH NOTHING SAID ABOUT IT IS A PHOTOGRAPH ---
          THE CAMERA IS THE ONLY WAY TO POST NOW — `Write a post` was removed on request and took
          the only door to `on('new-post')` with it — so `caption: ''` in `cam-post` meant EVERY
          post anybody could make was captionless. `postCard` draws `.post-cap` as
          "<b>who</b> what they said", and CLAUDE.md's own note on comments says the caption IS the
          first comment. A feed of silent pictures is not the feature that was asked for.

          HIDDEN UNTIL THERE IS A PICTURE, like `Again` and `Save a copy` and for their reason: it
          belongs to a photograph you are holding, not to a camera you are pointing, and a text box
          under a live viewfinder is a box you cannot fill in about a picture you have not taken.

          CAPTION AND NOTHING ELSE. The composer also asked `where`, `more` and a poll, and those
          are a form — this is one line beside a shutter. A venue datalist under a card already
          close to the pane's fold is a second field for a fact this one line can carry.

          NO `<span>caption</span>` OVER IT, WHICH IS THIS APP'S OWN PATTERN FOR A SINGLE BOX. The
          search box, the comment box, the notepad and the message composer are all a placeholder
          and no label — and CLAUDE.md records the measurement behind it: ten controls in this app
          have no text and every one of them carries a placeholder, which IS the accessible name
          when there is nothing else, so a label repeating it would be two strings to keep in step.
          It is also 21px, and this card has 26px between it and the pane's fold at 390. */
```

### ---------- WHAT IS ALREADY IN THIS POST

in `cameraCard`

```
/* ---------- WHAT IS ALREADY IN THIS POST ------------------------------------------------
          Everything kept with `Add another`, picked several at a time, or recorded — a square each,
          and a tap on one takes it back out. Hidden while there is nothing in it, like every other
          part of this card that belongs to a post rather than to the camera. Built by `camHold_`. */
```

### ---------- WHO IT GOES UP AS, WHICH IS THE SAME QUESTION THE COMPOSER ASKS

in `cameraCard`

```
/* ---------- WHO IT GOES UP AS, WHICH IS THE SAME QUESTION THE COMPOSER ASKS ---------------
          THE SAME CONTROL AND THE SAME HANDLER, not a second one that means the same thing. `on('as')`
          reads the id it was given rather than a fixed one, so both surfaces share it — and the
          feed cannot end up with two vocabularies for who a post is from.

          THE BUSINESS BY DEFAULT AND THE BACKEND DECIDES ANYWAY. `addPost` tests `hasRole(me,
          'admin')` before it honours `postAs`, so a client's photo goes up under their own name
          whatever this row says. Repeating the rule here would be two rules to keep in step, which
          is the fault recorded under `MESSAGING` and under `childrenOf`. */
```

### ---------- `Write a post` WAS HERE, WENT ON REQUEST, AND IS A TILE NOW

in `cameraCard`

```
/* ---------- `Write a post` WAS HERE, WENT ON REQUEST, AND IS A TILE NOW -------------------
          IT WAS THE ONLY DOOR TO `on('new-post')` and taking it away left that handler and the
          whole composer behind it unreachable — working code with nothing to open it, reported by
          `check-doors.js` as its single finding ever since. This repository's second-oldest shape,
          and the note here was right to keep the code: the composer is the folder picker that draws
          the posts folder as thumbnails, the link box that takes a Drive URL, the location, the
          poll. All of it built, none of it openable.

          IT IS BACK BECAUSE IT IS THE ANSWER TO A DIFFERENT ASK: *"i would like to add more photos
          to my portfolio"*, with Drive links. There is no portfolio surface in this app — measured,
          zero occurrences of the word — and the nearest honest reading of "my portfolio" is the
          feed, which is a column of photographs with captions. Adding a twelfth column that drew
          the same Drive folder the feed already draws would be a surface where a door was missing.

          A TILE RATHER THAN THE OLD `.btn`. The house style decides it: the camera card is a THING
          you are pointing, its controls are already a row of glyphs, and a full-width gold slab
          reading "Write a post" under a shutter is the `.reel-sound` correction one screen along.
          It sits beside `Photos` and the shutter, which is where the other two ways of getting a
          picture onto the feed already are.

          AND THE THREE ASKED-FOR IMAGES NEED NOTHING ELSE. A Drive link pasted into the composer's
          own box lands in the posts SHEET rather than in this repository — which is the half that
          matters, because the folder is `anyone: reader` and the file ids ARE the protection.
          `pic()` turns it into `lh3.googleusercontent.com/d/<id>=w1200`, and lh3 TRANSCODES: the
          `.HEIC` of the three renders on every browser through it, where the raw file is a broken
          image everywhere but Safari. */
```

### ---------- A LABELLED BUTTON, BECAUSE A LONE GLYPH HERE IS AN ORPHAN

in `cameraCard`

```
/* ---------- A LABELLED BUTTON, BECAUSE A LONE GLYPH HERE IS AN ORPHAN --------------------
          IT WAS A TILE FIRST AND A SCREENSHOT REFUSED IT. `tile_` puts the word in `title` and
          `aria-label` and draws the glyph alone — a recorded decision, and right in a ROW of tiles
          under a thing, where the neighbours give it context. One tile on its own under a
          viewfinder is a 44px pencil at the bottom-left corner of the card with nothing beside it,
          which reads as "edit the photograph" rather than as the other way to post. Nothing
          measured wrong: 44x44, no overflow, contrast fine.

          SO IT IS A BUTTON, WHICH THE HOUSE STYLE ALREADY DECIDES. A camera card is a THING and
          gets tiles; what this opens is a FORM — the composer, with a link box, a caption, a
          location and a poll — and a form's own opener is a button with the words on it.

          `quiet` RATHER THAN THE GOLD `.btn`, which is the `.reel-sound` correction and the
          Messages `Refresh` one: gold is the one thing to press, and over a live viewfinder the
          one thing to press is the shutter. */
```

### ---------- STARTING IT, FROM THE COLUMN ARRIVING OR FROM A RETRY

top level, before `camStart_`

```
/* ---------- STARTING IT, FROM THE COLUMN ARRIVING OR FROM A RETRY ----------------------------------
   ONE FUNCTION FOR BOTH, because the retry button and the swipe want exactly the same thing and two
   copies of "ask for the camera" is two places for the failure wording to drift apart.

   IT RETURNS EARLY IF A STREAM IS ALREADY LIVE. `go` runs on every arrival, including the one where
   you swiped away and straight back before the card was torn down, and a second `getUserMedia` while
   the first is running is a second camera light and a stream nothing ever stops.

   AND IT RETURNS EARLY IF THE CARD IS NOT DRAWN. Signed out, `feedCamCard_` renders a sentence and
   no viewfinder, so there is nothing to start and nothing to say about it. */
```

### A REBUILT CARD HAS AN EMPTY TRAY while `CAM_ITEMS` still holds the post being made — `repaint` replaces the markup and keeps the state — so the tray is drawn

in `camStart_`

```
/* A REBUILT CARD HAS AN EMPTY TRAY while `CAM_ITEMS` still holds the post being made — `repaint`
     replaces the markup and keeps the state — so the tray is drawn back from the state here, which
     is the one function every fresh copy of this card passes through. */
```

### ---------- THE MARKUP CAN BE REPLACED UNDER A LIVE STREAM

in `camStart_`

```
/* ---------- THE MARKUP CAN BE REPLACED UNDER A LIVE STREAM -----------------------------------
     `repaint` rebuilds this screen's cards, so the `<video>` that had the camera in it is gone and
     the one in front of you is a fresh element with `srcObject` null — while `CAM_STREAM` still
     holds the camera open behind it. Returning early on "a stream exists" would leave that: a black
     box, a camera light on, and nothing able to fix it short of leaving the column.
     Re-attached rather than reopened, because the stream is fine; it is the element that changed. */
```

### ONE QUESTION AT A TIME, AND A NO IS NOT ASKED AGAIN BEHIND YOUR BACK — see `CAM_ASKING` and `CAM_FAILED` where they are declared.

in `camStart_`

```
/* ONE QUESTION AT A TIME, AND A NO IS NOT ASKED AGAIN BEHIND YOUR BACK — see `CAM_ASKING` and
     `CAM_FAILED` where they are declared. The open question will put its answer on whichever card is
     on the screen when it comes back (below), so a repaint in the meantime has nothing to do; a
     remembered refusal has its sentence and its button drawn back onto the fresh card instead. */
```

### A FACT, SO THE VIEWFINDER SAYS IT — and the loader comes out of it.

in `camStart_`

```
/* A FACT, SO THE VIEWFINDER SAYS IT — and the loader comes out of it. This wrote the sentence into
       the line under the card and left `#cam-off` as `cameraCard` and `camStop_` draw it: the one
       loader, pulsing over "This browser has no camera support." for as long as the page was up, and
       back again on every return. Found by review with `mediaDevices` taken away. A wait drawn over a
       failure is the one thing `loading_` must never be; `camFailed_` already does this for a refused
       camera. The reason is said once, in the panel, and the line under the card is cleared. */
```

### ---------- A NEW ASK IS A WAIT AGAIN, AND IT LOOKS LIKE ONE

in `camStart_`

```
/* ---------- A NEW ASK IS A WAIT AGAIN, AND IT LOOKS LIKE ONE --------------------------------------
     After a refusal the viewfinder said "The camera did not start." and the line under it why — and
     `Try the camera again`, or coming back up to the page, asked again with both still standing, so
     the card read as refused for the whole of a fresh prompt. Measured on 9 Oct by `check/ui.js`'s
     `the camera still starting`: the stale reason was the line that went when the stream came, and the
     card moved 40px at the moment the picture arrived. So asking puts the one loader back in the
     viewfinder (`loading_`, shell.js — the owner, 9 Oct, *"they should all have a simplistic simple
     loading thing"*) and clears the line; a refusal writes both back in `camFailed_`. */
```

### THE COLUMN MAY HAVE LEFT WHILE THE PROMPT WAS UP.

in `camStart_`

```
/* THE COLUMN MAY HAVE LEFT WHILE THE PROMPT WAS UP. `camStop_` ran with CAM_STREAM still null, so
     it stopped nothing, and this stream would have stayed live behind a screen nobody is looking at
     — a recording light on for nothing, which is the exact thing camStop_ exists to prevent. */
```

### ---------- AND THE CARD MAY HAVE BEEN DRAWN AGAIN WHILE IT WAS UP

in `camStart_`

```
/* ---------- AND THE CARD MAY HAVE BEEN DRAWN AGAIN WHILE IT WAS UP --------------------------------
     `v`, `said` and `retry` were found before the prompt, and a repaint in the meantime replaced all
     three — so the stream went into a `<video>` no longer in the document while the one on the screen
     said it was starting the camera until something else repainted. Found again here, after the wait,
     which is the half `CAM_ASKING` makes necessary: the repaint no longer asks a second time, so this
     answer is the only one that will arrive. */
```

### ---------- AND ONLY NOW CAN ANYBODY ASK HOW MANY CAMERAS THERE ARE

in `camStart_`

```
/* ---------- AND ONLY NOW CAN ANYBODY ASK HOW MANY CAMERAS THERE ARE ----------------------------
     `enumerateDevices` ANSWERS BEFORE PERMISSION AND ANSWERS WRONGLY. Without a granted stream a
     browser may report one anonymous videoinput, or none, to keep the device list from being a
     fingerprint — so asking at boot would hide the flip control on every phone that has two
     cameras. Asked here, a frame after the prompt was granted, the list is the real one. */
```

### ---------- WHAT THE CARD SAYS WHEN THE CAMERA DID NOT START

top level, before `camFailed_`

```
/* ---------- WHAT THE CARD SAYS WHEN THE CAMERA DID NOT START -----------------------------------------
   DRAWN FROM TWO PLACES NOW: the ask that failed, and every card redrawn after it while the refusal
   is remembered. A repaint puts back a card with the loader in its viewfinder and its retry hidden, and
   `camStart_` no longer asks again behind it — so without this the card would claim to be starting a
   camera nobody is asking for, with no way to ask. */
```

### ---------- THE TWO SHUTTERS ARE ONE FACT: IS THERE A LIVE STREAM

top level, before `camLive_`

```
/* ---------- THE TWO SHUTTERS ARE ONE FACT: IS THERE A LIVE STREAM ---------------------------------
   THREE PLACES SET THIS AND ONE OF THEM FORGOT. The re-attach branch above did
   `$('cam-video').hidden = !canRecord_()` and the success path did not — so the record control
   appeared only after a `repaint`, which means the button added because "there was no way to record
   at all" could not be reached on the path anybody actually takes. Found by reading the two
   branches side by side after the row was rebuilt.

   ONE FUNCTION, SO THE TWO CANNOT DISAGREE — the same argument as `factsNow_` and `documents_()`,
   one screen along.

   `disabled`, NOT `hidden`, FOR THE SHUTTERS. See the note in `cameraCard`: a control that appears
   when the first frame arrives grows the card under the thumb that is reaching for it.

   RECORDING IS THE ONE THAT CAN BE GENUINELY ABSENT. `MediaRecorder` is not on older iOS, and a
   control that is there and throws is worse than one that is not — which is the `orderPrints`
   lesson in a different costume. That is a fact about the browser rather than about the stream, so
   it is asked once and the button goes rather than greys. */
```

### IS THERE A SECOND CAMERA TO SWITCH TO.

top level, before `camWays_`

```
/* IS THERE A SECOND CAMERA TO SWITCH TO. A flip control on a laptop with one camera is a button
   that does nothing, so it is not drawn until the browser has said there is somewhere to flip to.
   Anything that throws or is absent answers no: a missing control is a smaller failure than one
   that swaps the picture for the same picture. */
```

### ---------- TURNING IT ROUND

top level, before `camFlip_`

```
/* ---------- TURNING IT ROUND --------------------------------------------------------------------
   `camStop_(true)` THEN `camStart_()`, which is the only way there is: a track's `facingMode` is
   fixed when it is opened, so the other camera is a new stream. `true` is what releases the
   hardware without resetting the card — see `camStop_` — so the buttons do not flicker back to
   their starting state for the third of a second the swap takes.

   NOT WHILE IT IS RECORDING. Stopping the stream is what assembles and downloads the file, so a
   flip mid-record would save a half-length video and look like the button having eaten it. Said
   rather than silently refused, and said in the one place the card already says things. */
```

### THE ONE DOOR THAT ASKS AGAIN ON THE SPOT.

top level, before `CAM_FAILED`

```
/* THE ONE DOOR THAT ASKS AGAIN ON THE SPOT. A refusal is remembered so that a repaint does not ask
   behind your back — see `CAM_FAILED` — and pressing `Try the camera again` is the opposite of behind
   your back, so it forgets it first. */
```

### ---------- A PICTURE OUT OF THE GALLERY

top level, before `el`

```
/* ---------- A PICTURE OUT OF THE GALLERY ----------------------------------------------------------
   DRAWN INTO THE SAME CANVAS A SHOT USES, so `Again` and `Save it` work on it without knowing where
   it came from. See the note at the top of this section.

   `change`, NOT A `data-do` CLICK. `on()` is the click table; a file input reports its choice by
   changing, and this is the pattern book.js already uses for its typed fields.

   THE VALUE IS CLEARED AFTERWARDS. Without it, picking the same photograph twice in a row is a
   `change` event that never fires — the input's value has not changed — so the second attempt looks
   like the button is broken. */
```

### ---------- ONE PHOTOGRAPH WITH NOTHING HELD IS THE CARD IT ALWAYS WAS

top level, before `file`

```
/* ---------- ONE PHOTOGRAPH WITH NOTHING HELD IS THE CARD IT ALWAYS WAS ------------------------
     Everything else — several at once, a clip, or anything picked while a post is already being
     made — goes into the tray, and the viewfinder is left as it is. A picture already on the card
     goes in first, so choosing from Photos never throws away the shot you were looking at. */
```

### REVOKED THE MOMENT IT IS DRAWN.

in `img.onload`

```
/* REVOKED THE MOMENT IT IS DRAWN. The pixels are in the canvas by now, so the blob URL is a
       handle on a file this page has finished with, and one left per photograph is a leak that only
       shows up on the device of somebody who picked forty. */
```

### THE CAMERA IS LET GO, not left running behind the picture.

in `img.onload`

```
/* THE CAMERA IS LET GO, not left running behind the picture. You asked for a photograph instead
       of the viewfinder; holding the stream open for a preview nobody can see is the recording light
       again. `Again` starts it back up. */
```

### `Try the camera again` GOES WHILE A PICTURE IS BEING HELD, and that is a duplicate removed rather than a control taken away.

top level, before `hidden`

```
/* `Try the camera again` GOES WHILE A PICTURE IS BEING HELD, and that is a duplicate removed
     rather than a control taken away. It is revealed only by a camera that FAILED to start — and
     once you are holding a photograph, `Again` is already the button that throws it away and puts
     the camera back, so the row was offering two ways to do one thing. It returns by itself if
     that retry fails, because `camStart_`'s catch is what reveals it and `camAgain_` calls
     `camStart_`. Measured on the path that can reach this with a dead camera — picking from
     Photos — the four buttons are 491px in a 300px row, so they wrapped onto three lines and took
     the card 36px past the pane's own fold at 768 and 1280. */
```

### THE COLUMN HAS TO BE MEASURED AGAIN WHEN THE CARD CHANGES SIZE.

top level, before `CAM_ITEMS`

```
/* ==================================================================================================
   THE COLUMN HAS TO BE MEASURED AGAIN WHEN THE CARD CHANGES SIZE.

   `columnShift_` PLACES THE PAGE YOU ARE ON — in the middle of the screen again since 5 October — and it
   runs when the column is placed, not when a card inside it grows. (It centred the page when the
   numbers below were taken, which is why they are the ones they are; the fault and its fix are the
   same either way, because a card that grows after the placement is a card the placement never
   saw.) This card grows by a lot and on
   purpose: taking a photograph reveals `Again`, `Post it`, `Save a copy`, the caption and the row
   that says who it goes up as, which is 112px before this commit and 167px after it.

   MEASURED AT 390 x 844 WITH A PHOTOGRAPH PICKED: the page was placed at 648px tall, so the shift
   put its top at y139 — and it then grew to 760, leaving its bottom at y899. `Save a copy` was
   55px BELOW THE SCREEN, on a pane whose own `scrollHeight` equals its `clientHeight`, so nothing
   was overflowing and `check/ui.js`'s OUT OF REACH could not see it: the content fits its pane
   perfectly and the PANE is what hangs off the bottom.

   `placeCells('y', true, 0, 'make')` is `settle_`'s call in `find.js`, for `settle_`'s reason, and
   `true` for its reason too — the cards have not moved as far as anybody is concerned, and
   animating them to where they already look like they are is a second movement nobody asked for.
================================================================================================== */
```

### ---------- THE POST BEING MADE, AS A LIST

top level, before `CAM_ITEMS`

```
/* ---------- THE POST BEING MADE, AS A LIST -------------------------------------------------------
   `CAM_ITEMS` holds what has been kept for this post — `{ kind, data }`, `data` a `data:` URL, which
   is what `addPost` uploads. The picture on the card is NOT in it until `Add another` or `Post it`
   takes it, so `Again` can still throw away just that one. */
```

### ONE FILE OR RECORDING, READY TO POST.

top level, before `camItemOf_`

```
/* ONE FILE OR RECORDING, READY TO POST. A photograph is redrawn at no more than 1600px on its long
   side — a camera roll's 12-megapixel original is four megabytes for a card 390px wide — and a clip
   is read as it is, because re-encoding video in a browser is not a thing to do on a phone. Answers
   `null` for anything it cannot use, and never rejects, so one bad file in five does not lose the
   other four. */
```

### ---------- WHICH CONTROLS ARE SHOWING IS ONE FACT: WHAT IS BEING HELD

top level, before `camHold_`

```
/* ---------- WHICH CONTROLS ARE SHOWING IS ONE FACT: WHAT IS BEING HELD ---------------------------
   FIVE PLACES SET THESE ONE AT A TIME, and a sixth would have been the tray. `Again`, `Save a copy`
   and `Add another` are about the picture ON the card; `Post it`, the caption and who-it-goes-up-as
   are about the POST, which exists once anything is held. Written from the state rather than by
   each handler, so no press can leave the card half-showing — the `REEL_HELD` rule. */
```

### `Again` NOW HAS TO PUT THE CAMERA BACK, not just uncover it.

top level, before `camAgain_`

```
/* `Again` NOW HAS TO PUT THE CAMERA BACK, not just uncover it. A shot taken here leaves the stream
   running underneath, but a photograph picked from the gallery released it — see the picker — so
   showing the `<video>` again would have shown a dead black box on exactly that path. `camStart_`
   returns immediately when a stream is already live, so the shot case costs nothing. */
```

### ONE FUNCTION, TWO CALLERS.

top level, before `camAgain_`

```
/* ONE FUNCTION, TWO CALLERS. `Again` presses it and a posted shot runs it, because "the photo has
   left, put the camera back" and "throw this one away, put the camera back" are the same four
   lines — and two copies of them is the second reader this repository keeps writing about. */
```

### EMPTIED AS WELL AS HIDDEN, and that is the half a `hidden` does not do.

in `camAgain_`

```
/* EMPTIED AS WELL AS HIDDEN, and that is the half a `hidden` does not do. This function runs on
     `Again` and on a posted shot alike, so a caption left in the box would be offered as the
     caption for the NEXT photograph — a sentence about one picture printed under another.
     NOT WHILE THE TRAY HOLDS ANYTHING: then the caption is about the post that is still being
     made, and `Again` threw away one picture of it, not the post. */
```

### AND THE OTHER DIRECTION.

in `camAgain_`

```
/* AND THE OTHER DIRECTION. This SHRINKS the card by the same 167px, so the page it centres is a
     different size again — without this, throwing a photograph away leaves the card floating with
     the gap the picture used to fill still under it. `camStart_` above is async and returns before
     it has an answer, so a failure that reveals `Try the camera again` settles itself. */
```

### ---------- RECORDING, WHICH IS THE SAME SHAPE AS A PHOTOGRAPH

top level, before `CAM_REC`

```
/* ---------- RECORDING, WHICH IS THE SAME SHAPE AS A PHOTOGRAPH ------------------------------------
   A PHOTO HERE IS A DOWNLOAD, and the note on `cam-save` says why: this app holds no write
   permission on your Drive and the backend has no endpoint that takes a file. A video is the same
   fact one size larger, so it takes the same way out — record, stop, download — rather than
   inventing an upload that has nowhere to arrive.

   `MediaRecorder` IS ASKED ABOUT RATHER THAN ASSUMED. It is absent on older iOS and its codec
   support differs per browser, so the button is only shown when the API exists and only ever uses
   a type the browser says it can write. A control that appears and then throws is worse than one
   that is not there — which is the `orderPrints` lesson in a different costume.

   THE STREAM IS THE ONE ALREADY RUNNING. `camStart_` owns it and `camStop_` releases it; this
   never opens or closes the camera itself, or stopping a recording would fight the column leaving. */
```

### THE FIRST TYPE THE BROWSER ADMITS TO.

top level, before `recType_`

```
/* THE FIRST TYPE THE BROWSER ADMITS TO. Chrome writes webm, Safari writes mp4, and passing a type
   neither supports makes the constructor throw — so it is asked rather than guessed, and an empty
   string lets the browser pick its own default as a last resort. */
```

### THE SAME WAY OUT AS A PHOTOGRAPH — see `cam-save`.

in `CAM_REC.onstop`

```
/* THE SAME WAY OUT AS A PHOTOGRAPH — see `cam-save`. The object URL is revoked immediately
       after the click: a video blob is megabytes and leaving it attached to the document holds all
       of them for as long as the page is open. */
```

### AND INTO THE POST, which is the half that makes a clip postable at all — "and also videos".

in `CAM_REC.onstop`

```
/* AND INTO THE POST, which is the half that makes a clip postable at all — "and also videos".
         The copy above is still saved, because it was the only way out a recording had and a
         download somebody expects is not one to take away. */
```

### ---------- THE DISC SAYS WHAT IT IS DOING, BECAUSE IT CANNOT SAY IT IN WORDS

top level, before `camRecMark_`

```
/* ---------- THE DISC SAYS WHAT IT IS DOING, BECAUSE IT CANNOT SAY IT IN WORDS ----------------------
   IT SAID `Stop` WHEN IT WAS A RECTANGLE WITH A LABEL IN IT. A 52px disc has no room for a word,
   and a record control that stays a record control while it is recording is a mode you cannot see —
   which is the fault this file already records for the reel that was paused with nothing on it
   saying so.

   SO THE SHAPE CHANGES: a red disc is record, a red rounded square is stop, and every camera
   anybody has used does exactly that. `aria-label` moves with it, or the shape is the only thing
   that says so and a screen reader is told the opposite of what is true.

   NOT AN ANIMATION. A blinking control on a card somebody is filming with is a distraction in the
   frame — the same sentence the old `.is-rec` rule carried, and it is still right. */
```

### POSTING THE SHOT, AND THE ENDPOINT HAD BEEN THERE THE WHOLE TIME

top level, before `c`

```
/* ==================================================================================================
   POSTING THE SHOT, AND THE ENDPOINT HAD BEEN THERE THE WHOLE TIME

   REPORTED AS *"if i take a pic it says now add to drive for it to work. fuck that. i want to be
   able to post from there. either as the business or as me."*

   `addPost` HAS TAKEN BYTES SINCE IT WAS WRITTEN. Measured before anything was built:
   `backend/dopost.gs` reads `body.data`, base64-decodes it, creates the file in the posts folder,
   sets it `ANYONE_WITH_LINK / VIEW` so it is not a broken image on every client's phone, and posts
   the row — and **nothing in `js/` has ever sent that field.** The one `addPost` caller is the
   composer, and it sends `image:` (an address) and no `data:`.

   SO THE SENTENCE THE CAMERA PRINTED WAS FALSE. "this app does not hold write permission on your
   Drive and the backend has no endpoint that takes an image" is written over `cam-save` and over
   the recorder, and the endpoint is forty lines long in a file this repository owns. That is
   `orderPrints` for the thirteenth time — access-listed, argued for at length, never once called —
   and this one had a comment explaining why it could not exist.

   THE DOWNLOAD STAYS AS THE SECOND BUTTON. Posting is what somebody wants nine times in ten and is
   now the gold one; a copy on the phone is still worth having and is now the quiet one beside it.

   A VIDEO IS STILL A DOWNLOAD, and that is a real limit rather than the same oversight: `addPost`
   decodes into `Utilities.newBlob` inside one Apps Script request, and a minute of 1080p is tens of
   megabytes against a `doPost` body limit measured in single figures. A photograph at 0.85 JPEG is
   a few hundred kilobytes. Said here rather than discovered by somebody whose recording vanished.
================================================================================================== */
```

### ---------- EVERYTHING IN THE TRAY, THEN THE PICTURE ON THE CARD

top level, before `list`

```
/* ---------- EVERYTHING IN THE TRAY, THEN THE PICTURE ON THE CARD ------------------------------
     The first goes as `data`, exactly as a single photograph always has — so a backend older than
     the `media` column still posts it — and the rest go as `media`. */
```

### 0.85 RATHER THAN THE DOWNLOAD'S 0.92.

top level, before `list`

```
/* 0.85 RATHER THAN THE DOWNLOAD'S 0.92. The copy you keep should be the better one; the one that
     travels goes through a base64 body and a spreadsheet round trip, and the difference between
     the two qualities is about a third of the bytes and nothing anybody can see on a feed card. */
```

### `send_` RATHER THAN `api`, WHICH IS THE WHOLE OF `check-replies.js`.

top level, before `action`

```
/* `send_` RATHER THAN `api`, WHICH IS THE WHOLE OF `check-replies.js`. This handler is about to
     say "Posted", and a refusal that resolves rather than throws would let it say so about a post
     that was never written — measured on `sendMessage`, where a closed sheet and a toast reported
     a message the backend had refused. */
```

### EVERY BUTTON BACK TO ITS STARTING STATE TOO, not just the stream.

top level, before `camStop_`

```
/* EVERY BUTTON BACK TO ITS STARTING STATE TOO, not just the stream. Stopping the tracks leaves the
   last frame frozen in the `<video>` and "Take one" still showing, so the card looks live and does
   nothing — which reads as a broken camera rather than a stopped one.

   EXCEPT WHEN THE POINT WAS TO KEEP WHAT IS ON IT. The gallery picker releases the camera while a
   photograph is being looked at, and the full reset would have wiped that photograph off the canvas
   half a frame after drawing it. `keepShown` releases the hardware and touches nothing else.

   `cam-on` IS NOT REVEALED BY A STOP ANY MORE. It used to come back on every leave, because it was
   the way in; it is the way back from a failure now, and a stop is not a failure. Showing it here
   meant swiping away and back left a `Try the camera again` button sitting over a camera that had
   just started itself perfectly well. */
```

### ---------- A RECORDING IN PROGRESS IS STOPPED FIRST, AND THAT ORDER MATTERS

in `camStop_`

```
/* ---------- A RECORDING IN PROGRESS IS STOPPED FIRST, AND THAT ORDER MATTERS -------------------
     STOPPING THE TRACKS FIRST WOULD LOSE THE FILE. `MediaRecorder.onstop` is where the blob is
     assembled and downloaded, and a recorder whose source tracks have already ended may never fire
     it — so leaving the column mid-record would take the camera light off and silently throw away
     what had been recorded. Stopped here, before the stream goes, so the download still happens. */
```

### LEAVING THE COLUMN FORGETS A REFUSAL, like swiping off the page does in `feedCamWatch_`.

in `camStop_`

```
/* LEAVING THE COLUMN FORGETS A REFUSAL, like swiping off the page does in `feedCamWatch_`. Not on
     `keepShown`: that is the picker, the flip and the page turn letting the hardware go, and a picked
     photograph posted from a refused camera must not have `camAgain_` ask behind it. */
```

### ---------- REACTIONS

top level, before `REACT_POP_`

```
/* ---------- REACTIONS ---------------------------------------------------------------------------
   A row of faces, each with its count beside it INSIDE its own pill. Unlike the poll, the counts are
   NOT hidden — a poll asks a question and wants an unanchored answer; a reaction is a room agreeing
   with itself, and seeing that eleven people laughed is most of why anybody adds a twelfth.

   A face with nobody behind it shows no number rather than a 0 — a row of zeroes reads as
   indifference, and an empty pill reads as nothing having happened yet.

   ONE LINE OF SIX EQUAL CELLS, AND NO TOTAL IN IT. The owner, 9 Oct: *"Also refine how the post
   reactions look. Looks abit scuffed right bow"*. Measured on the row that was there: each face's box
   was as wide as its count (36.8px with none, 59.2 with three digits), so a tap that added a digit
   reflowed the row — 👏 going 9 → 10 threw 🎉 onto a second line 43px down — and the total sat at the
   end as a bare "77" that read as one more face's count. The six house faces never wrap now: the
   cells are a grid of one width, the count is capped at three characters (`reactN_`), and the total
   is a sentence on the time line (`postWhen_`). A post's own cell naming more than six wraps into the
   same columns. See docs/history/307.
--------------------------------------------------------------------------------------------- */
```

### ONE PAINT'S WORTH OF "THE FACE YOU JUST PRESSED".

top level, before `REACT_POP_`

```
/* ONE PAINT'S WORTH OF "THE FACE YOU JUST PRESSED". The press itself is `:active` and `.is-pressed`
   (style.css, the chips' pair) and lasts while the finger is down; the redraw after the tap
   replaces the button — the row, not the post (`postRedraw_` below) — so nothing on the OLD button
   can say the reaction landed. This marks the NEW one. Set by on('react') round its redraw and
   cleared straight after, so the `.catch` redraw and every later one draw no animation — a face that
   lands once, not one that bounces whenever anything else redraws the feed. `var`, because it is
   reassigned (`check-const.js`). */
```

### ---------- A PRESS ON ONE POST REDRAWS THAT POST'S OWN PARTS, WHERE THEY STAND — NEVER THE COLUMN --

top level, before `postRedraw_`

```
/* ---------- A PRESS ON ONE POST REDRAWS THAT POST'S OWN PARTS, WHERE THEY STAND — NEVER THE COLUMN --
   THE OWNER, 10 Oct: *"The post section is a bit buggy. When I click a reaction it bugs out a bit. On
   only some of them."* A face, and a poll vote, both called `repaint()` — and `repaint` is
   `paint(AT)`: the feed's whole `innerHTML`, every card on the column thrown away and drawn again to
   change one row of pills. So every `<img>`, `<video>` and pane on the column was a NEW element, and
   a new element has none of what the old one had already worked out:

     · A PICTURE HAS NEITHER ITS PIXELS NOR ITS SIZE. It is `decoding="async"`, `loading="lazy"` from
       the third post on, and `.page .post-pic { aspect-ratio: auto 4 / 5 }` holds a 4:5 box until the
       file is read again. Measured in Chromium with the picture not handed straight back (the cache
       off, which is a phone that has let a Drive thumbnail go): the photograph blank for 0.3–0.9s, a
       16:9 card grown to 4:5 and back (+183px at 390x844), and a card taller than its pane zoomed by
       `paneReach_` for the 4:5 stand-in and then drawn at that zoom over the real picture — a 9:16
       portrait 0.782 → 0.947 → 0.782 at 390, its comments and composer clipped — until `paneWatch_`
       measured it again a frame or two later.
     · A CLIP STOPPED AND WENT BACK TO 0:00, cache or no cache. It sat as a grey 4:5 box until its
       metadata came again, and the card went 773 → 669 → 841 → 773px tall around it (a 9:16 clip at
       390x844): the faces jumped 122px up from under the finger, then 50 down, then back.
     · A PANE SCROLLED PAST `PANE_ZOOM_MIN` WAS A NEW PANE AT `scrollTop` 0, so a long post jumped back
       to its top and the face somebody had scrolled down to press left the screen — 388px at 320x568.

   WHICH IS WHY IT WAS "ONLY SOME OF THEM". A text post or a poll has nothing to rebuild but its
   avatar; a photograph that is already 4:5 only blinks, because the stand-in is its own shape; grid
   cells are fixed squares and only blink. A clip, a single photograph of any other shape, and a post
   taller than its pane bugged out. Which face, and whether it was added, moved or taken back, made
   no difference — the post decided it.

   SO A PRESS NAMES THE PARTS IT CHANGED, and every copy of this post on the page has those parts
   replaced and nothing else: `[selector, drawer]` pairs, each drawer the same function `postCard_`
   builds the part with, so the redrawn part cannot drift from the card's. The picture, its zoom, a
   playing clip and a scrolled pane are never touched. A part that now draws nothing is taken out. A
   card without a part that now draws something falls back to the whole `repaint`, which is what every
   press did before — and that is how a post with NO DATE kept the fault after this fix: it had no time
   line for its first total to go on until `postWhen_` held the line for every post with faces. So no
   press reaches the fallback now. `repaint` stays for a payload landing, where anything on any card
   may have changed; it is never for a press on one post.
   NO PLACEMENT AND NO STALE MARK, because nothing moved and no other screen draws these parts. The
   row is a fixed grid and the time line is 44px either way (docs/history/307), so a face never
   changes the card's height; a poll whose bars appear may, and a card whose height changes is the
   one the `ResizeObserver` from `paneWatch_` (find.js) already re-asks its pane about. See
   docs/history/335.

   ---------- AND THE FOCUS STAYS ON THE CONTROL THAT WAS PRESSED --------------------------------------
   A REPLACED BUTTON TAKES THE FOCUS WITH IT, and focus on a removed element falls to `<body>`.
   Measured at 390x844 when every press repainted: a face focused and Enter pressed — the same click a
   screen reader's double-tap or a switch sends — and the reaction landed, but `document.activeElement`
   was BODY afterwards, and the next Tab went to "Write a post" on a page parked off-screen. So the
   `aria-pressed` that exists to say which face is yours was never heard at the moment it changed, and
   a VoiceOver or TalkBack user lost their place in the feed with every reaction. A vote's row is the
   same button in the same position, which is why this lives here and not in the reaction's handler.

   ONLY WHEN THE CONTROL THAT HELD THE FOCUS WAS REPLACED, and it is handed to that control's
   replacement — the house rule from `ansSet_` (find.js) and `qualRedraw_` (me.js): a redraw must not
   pull focus off whatever else somebody is in. A control the redraw did not reach still has it, and
   is left alone. Matched on every `data-` attribute (`data-do`, `data-id`, and the `data-emoji` or
   `data-choice`), compared as strings rather than built into a selector, so an emoji or a post id
   never has to be escaped into one. Searched in the SCREEN it was on (the `<section>` survives
   `paint`, only its markup is replaced), and NOT filtered by `.page.on`, which `placeCells` applies at
   a deferred placement after a repaint returns. `preventScroll`, because the pages are parked side by
   side with transforms (CLAUDE.md) and a focus that scrolled would slide the strip. A tap gives focus
   too in most browsers, and a focus set by script after a pointer press draws no `:focus-visible`
   ring, so a finger sees nothing new. */
```

### NO COPY OF THE POST ON THE PAGE, NOTHING TO REDRAW.

in `postRedraw_`

```
/* NO COPY OF THE POST ON THE PAGE, NOTHING TO REDRAW. `DATA` already holds the change and the next
     draw of the post reads it. This was a `repaint()` too, reached by a save that fails after a
     payload landing has taken the post off the page (deleted, or a waiting post after a sign-out):
     the column somebody is reading was rebuilt to undo a face on a post that is not on it. */
```

### A CARD WITHOUT A PART THAT NOW DRAWS SOMETHING is the one case left for the whole repaint, and no press reaches it:

in `postRedraw_`

```
/* A CARD WITHOUT A PART THAT NOW DRAWS SOMETHING is the one case left for the whole repaint, and no
     press reaches it: a post with faces always has its time line (`postWhen_`) and a poll its `.poll`.
     `check-flow.js` presses a post with no date for exactly this. */
```

### A COUNT IS AT MOST THREE CHARACTERS, so a pill never grows for its number:

top level, before `reactN_`

```
/* A COUNT IS AT MOST THREE CHARACTERS, so a pill never grows for its number: 999, then 1k…999k.
   NOT "1.5k", which is four mono characters and was measured past the edge of a 41px cell at 320.
   Four digits of reactions on a tutoring feed is not a real case; if it comes, it is rounded down
   rather than a wider pill, and the sheet behind the total still has the exact number. */
```

### NO FACES, NO ROW — and the caller is told, rather than being handed an empty div.

in `reacts`

```
/* NO FACES, NO ROW — and the caller is told, rather than being handed an empty div.
     `r.emoji.map` over an empty array drew a `<div class="reacts">` with nothing inside it, which
     renders as no gap, no message and no clue: exactly the silent absence this codebase keeps
     producing.

     WHERE THE FACES COME FROM: the post's own `reactions` cell, then `HOUSE_REACTIONS` in
     `constants.gs`. The brand tab was the middle rung and is a file in git now, which Apps Script
     cannot read — so the house list is the floor and it is never empty. An absent row therefore
     means the payload predates the house set rather than that a cell is blank. */
```

### `mine` RIGHT AFTER `react` IN THE CLASS LIST, because `check/ui.js` names a control by its first two classes and its `ACCEPTED_TAP` entry for these cells is

in `reacts`

```
/* `mine` RIGHT AFTER `react` IN THE CLASS LIST, because `check/ui.js` names a control by its first
     two classes and its `ACCEPTED_TAP` entry for these cells is written against that name.
     `aria-pressed`, because "yours" was a gold 11px number and nothing else — a screen reader had no
     way to hear which face was the one you had pressed. `.any` is gone: nothing styles it now that
     every face has the same plate and the number inside is what says somebody pressed it. */
```

### THE TOTAL, and it is its own button.

top level, before `reactWho_`

```
/* THE TOTAL, and it is its own button. Pressing a face adds YOUR reaction; pressing the total asks
   who — two different questions, and one control answering both means somebody who wants to see
   the list has to react to the post to find out.
   Only there when somebody has: a 0 that opens an empty panel is a promise broken.

   AND IT SAYS WHAT IT IS NOW: "3 reactions", on the time line, not "3" at the end of the row of
   faces. A bare number at the end of a row of numbers read as one more face's count, was announced
   as just "77", and measured 18.6x38 at 390 — a faint digit nobody could find or hit. A text action
   like every other in the app (`button.text-action` gives it the 44px box and the dotted line that
   says "this acts"), so it is still its own button and still not a seventh pill. */
```

### WHEN, AND HOW MANY. Time first, so a total appearing never moves it; 44px tall either way, so the first reaction on a post moves nothing below it — the tile

top level, before `postWhen_`

```
/* WHEN, AND HOW MANY. Time first, so a total appearing never moves it; 44px tall either way, so the
   first reaction on a post moves nothing below it — the tile row stays where your thumb left it.
   INLINE AFTER THE TIME, NOT PUSHED TO THE RIGHT EDGE: at 820 the faces stop at about 349px of a
   410px card, and a total out at the far edge was a number belonging to nothing beside it.

   ---------- AND THE LINE IS THERE WHENEVER A TOTAL COULD BE, EVEN WITH NOTHING ON IT YET -------------
   "44px tall either way" WAS TRUE OF EVERY POST WITH A DATE AND OF NO OTHER. A row typed into the posts
   tab by hand without `creation_date`, `posted_on` or `uploaded_date` arrives as `at: 0, when: ''` —
   and the empty feed asks for exactly that row ("an image link and a caption"). With no reactions
   either, this returned nothing, so the card had no line at all and then:
     · THE FIRST FACE HAD NOWHERE TO PUT ITS TOTAL. `postRedraw_` found no `.post-when` to replace,
       fell back to `repaint()`, and the whole column was rebuilt exactly as every press was before
       docs/history/335 — measured on such a post with a 16:9 photograph at 390x844: a new article,
       pane and `<img>`, the card 428.5 → 689px and thrown off the glass for a frame or two, a clip
       back at 0:00, and the second tap of a quick double tap lost in the jump.
     · THE LAST FACE TAKEN BACK REMOVED THE LINE, so the card shrank 36.6px and the tile row jumped
       up under the thumb that had just pressed.
   So a post with faces always has its line, empty until somebody reacts: the place a total goes is
   held before there is one, which is the whole of what 307 promised. A post with neither a date nor
   faces still has none — nothing could ever be drawn there. See docs/history/335. */
```

### WHO REACTED, AND WITH WHAT.

top level, before `p`

```
/* WHO REACTED, AND WITH WHAT. Grouped by face rather than listed flat: "four people laughed" is
   the shape of the answer, and a list of twenty rows each carrying its own emoji makes you count
   them yourself.
   THE FACE IS THE GROUP'S HEADING, drawn as the same pill as the row and bigger. It was an `<h2>` in
   the sheet's small-caps label style, which made the face about 10px — the smallest thing in the
   sheet — with its count glued to it. Yours is the gold pill, and your name comes first under it. */
```

### ---------- `by` IS THE FOURTH THING THAT MOVES, AND IT WAS THE ONE LEFT BEHIND

top level, before `had`

```
/* ---------- `by` IS THE FOURTH THING THAT MOVES, AND IT WAS THE ONE LEFT BEHIND -----------------
     THREE FIELDS WERE UPDATED AND FOUR CHANGE. `yours`, `counts` and `total` were moved here before
     the server answered — which is right, and is what makes the row respond to a tap — and
     `r.by`, the list of WHO reacted with WHAT, was not. `on('who-reacted')` builds its groups by
     filtering `by` per emoji and prints the count off `counts`, so the two disagree the moment
     anybody presses a face:

       · react for the first time  → the sheet says `😂 1` with no name under it and the line
                                     "…and 1 more", which is the branch written for a person the
                                     site cannot resolve. You are not unresolvable; you are missing.
       · change which face         → your name stays listed under the emoji you moved AWAY from
       · take a reaction back      → the header says 2 and three names are printed under it

     AND NOTHING REPAIRED IT. The `send` has no `.then`, so no reload follows a successful react —
     deliberately, because a whole payload per tap is what the optimistic update exists to avoid —
     and `by` stayed wrong for the rest of the session.

     SO IT MOVES WITH THE COUNTS, in one function (`reactMove_`, below), which is the only version
     that cannot drift: a fifth field would have to be forgotten in one place rather than in one of
     two. The undo after a refused save is that same move, because a restore that misses one field is
     this same bug with a network failure in front of it.

     BY NAME, because that is what `by` holds — `doget.gs` sends names rather than ids on purpose
     ("a reaction is a public thing and an id is not"). So this is the one comparison in the app
     that is SUPPOSED to be on a display name: it is matching the entry the server will write for
     you against the one you are looking at, and both sides are the same string from the same
     source. */
```

### THE FACE THAT JUST LANDED IS MARKED FOR THIS ONE PAINT — see `REACT_POP_`.

top level, before `REACT_POP_`

```
/* THE FACE THAT JUST LANDED IS MARKED FOR THIS ONE PAINT — see `REACT_POP_`. `postRedraw_` is
     synchronous, and so is the `repaint` it falls back to, so clearing it on the next line is safe and
     nothing later replays it. `reactRepaint_`, NOT `repaint`: this post's faces and total and nothing
     else, so its picture, its clip and its pane are the ones that were there (the owner, 10 Oct: *"When
     I click a reaction it bugs out a bit. On only some of them."*), and a keyboard or screen reader
     stays on the face it pressed. See `postRedraw_`. */
```

### `personId` AS WELL AS `name`.

top level, before `yours`

```
/* `personId` AS WELL AS `name`. The handler resolves the person with
     `findPerson(S(body.name), S(body.personId))`, which prefers the id and falls back to matching
     the name — and a name is an editable cell. Sent only the name, a reaction lands on whichever
     row happens to hold that name first, and stops finding anybody at all the moment somebody
     renames themselves. `check-post.js` now fails on any action that leaves it out.
     `want` IS THE FACE TO END ON, '' for none, and `emoji` the face that gets there by a toggle from
     what the server holds — see `choiceSave_` for why both. */
```

### YOURS MOVES TO `to` ('' for none), AND ALL FOUR FIELDS MOVE WITH IT — `yours`, the two counts, the total and `by`

top level, before `reactMove_`

```
/* YOURS MOVES TO `to` ('' for none), AND ALL FOUR FIELDS MOVE WITH IT — `yours`, the two counts, the
   total and `by` (see the note above on the one that was left behind). ONE FUNCTION FOR THE TAP AND FOR
   THE UNDO, which is what the four-field restore was trying to be: the undo was a SNAPSHOT of the four
   taken before its own tap, and putting a snapshot back is only an undo when nothing happened after it.
   Two quick taps on one face, both refused, and the second refusal put back the state from after the
   first tap — the face lit itself up 1.3s after it was taken back, with one reaction too many on the
   line (docs/history/335). A move to what the server holds cannot be wrong about what came between.
   `by` IS CAPPED AT FORTY by the backend, so on a very popular post you may not be in the list at all —
   removing an entry that is not there is a no-op, and adding one takes the list to 41 for this session
   only. Both are better than the count and the names disagreeing. */
```

### ---------- ONE CHOICE PER PERSON PER POST, SAVED ONE REQUEST AT A TIME, AND A REFUSAL PUTS BACK WHAT

top level, before `CHOICE_SAVE_`

```
/* ---------- ONE CHOICE PER PERSON PER POST, SAVED ONE REQUEST AT A TIME, AND A REFUSAL PUTS BACK WHAT
   THE SERVER HOLDS ------------------------------------------------------------------------------------
   A FACE AND A POLL VOTE ARE THE SAME KIND OF THING — one choice among a few, held by a person, changed
   or taken back by the same press — and they went wrong in the same two ways once two taps were quick
   enough to overlap (measured at 320, 390 and 1280 on every kind of post, docs/history/335):

     · EACH TAP SENT ITS OWN REQUEST, AND EACH REFUSAL PUT BACK ITS OWN SNAPSHOT. 🎉 tapped twice 80ms
       apart, both saves refused: the first refusal put back "no 🎉", the second put back the state
       from after the first tap — 🎉 gold again, about 1.3s after it was taken back, "5 reactions"
       where there were 4, a reaction the page showed and nobody had saved. A poll ended ticked.
     · THE SERVER'S ACTION IS A TOGGLE ("the same one again takes it back") and a phone that sent one
       toggle per tap could not undo one: the first tap's save refused, the second's accepted, and the
       server held 😂 while the page showed nothing. A reload brought back a reaction the person had
       taken back.

   The whole-column rebuild used to swallow the second tap (18 of 84 double taps lost one), which hid
   both. With every tap landing, both were reachable every time.

   SO A POST HAS AT MOST ONE SAVE IN FLIGHT, and it carries the END STATE. Every tap moves the page at
   once, as before; `choicePump_` then sends what the page shows now (`mine()`) if it differs from what
   the server holds (`saved`), and nothing while a save is out. When that save comes back, it sends
   again only if more taps moved the page since — so ten taps during one slow save are two requests,
   the second carrying where the person stopped, and a tap that only took back an unsaved tap sends
   nothing at all. A REFUSAL MOVES THE PAGE TO `saved` — what the server holds, not what came before
   this tap — which is right however many taps came in between, and says why once.

   `want` IS THE END STATE ('' for none) and the server sets it (dopost.gs), so a request repeated or
   arriving late changes nothing. THE OLD FIELD STILL GOES — `emoji` or `choice` — as the toggle that
   gets from `saved` to `want`, because the Apps Script project reaches the live site by a separate
   step (CLAUDE.md, "Deploying") and a backend that has not been updated yet toggles on it and lands in
   the same place. A save the server answered with a refusal changed nothing there, so `saved` stands.
   A save lost on the wire may have landed; the page shows `saved` and the next press sends `want`,
   which the server sets whatever it held.

   `o.mine()` reads the post from `DATA` every time, because a payload landing replaces it; `null` (the
   post gone) ends the save. `o.put(choice)` moves yours there and redraws. The key is the action and
   the post, so a face and a vote never share a queue. */
```

### ---------- A POLL

top level, before `poll`

```
/* ---------- A POLL ------------------------------------------------------------------------------
   The counts are HIDDEN until you have voted. Not to be coy — seeing that eleven people said Yes
   before you answer changes what you answer, and a poll that anchors people is a poll that tells
   you what it already said.
--------------------------------------------------------------------------------------------- */
```

### Moved on screen before the server answers, the same as a face — and the whole poll is redrawn rather than one row, because a vote changes every percentage on

top level, before `mine`

```
/* Moved on screen before the server answers, the same as a face — and the whole poll is redrawn
     rather than one row, because a vote changes every percentage on it.
     THE POLL, NOT THE COLUMN. This was `repaint()`, the same whole-feed rebuild a face was, and it
     replaced the post and every picture and clip on the feed to move one bar — see `postRedraw_`. */
```

### ONE SAVE AT A TIME, CARRYING WHERE THE PERSON STOPPED, and a refusal puts back what the server holds — `choiceSave_`.

top level, before `mine`

```
/* ONE SAVE AT A TIME, CARRYING WHERE THE PERSON STOPPED, and a refusal puts back what the server
     holds — `choiceSave_`. A quick double vote, both refused, ended TICKED: each refusal put back the
     snapshot from before its own tap, and the second one's was the first tap's vote. */
```

### TURN THE DIAL TO IT, rather than scrolling.

in `openSharedPost`

```
/* TURN THE DIAL TO IT, rather than scrolling. The feed is one post per screen now, so the post
     somebody was sent is a PAGE rather than a position down a column — and scrollIntoView on an
     absolutely-positioned page moves nothing at all, silently, which would look exactly like a
     shared link going to the top of the feed. */
```

### ---------- THE FEED IS A COLUMN AND THIS WAS ASKING THE FUNNEL FOR IT

in `openSharedPost`

```
/* ---------- THE FEED IS A COLUMN AND THIS WAS ASKING THE FUNNEL FOR IT ------------------------
     BOTH LINES SAID `goFor_('Posts')` while `PAGE.feed` was being set between them, which is the
     whole argument in one place: the page index belongs to the `feed` screen, so the screen is
     where this was trying to go. `Posts` is not a group any kind declares, so the filter matched
     nothing and the funnel was left holding an empty list behind a dead chip. */
```

### ---------- POSTING

top level, before `POST_DRAFT_FIELDS`

```
/* ---------- POSTING ------------------------------------------------------------------------------
   An admin picks a photograph and it goes to the Drive folder and the posts tab at once.

   RESIZED ON THE PHONE FIRST. A modern camera makes a 4MB picture, which as base64 is 5.5MB — over
   what Apps Script will take, and a minute of a library's wifi. Scaled to 1600px and re-encoded it
   is about 300KB, and nobody can tell on a phone screen.
--------------------------------------------------------------------------------------------- */
```

### `shrink` lived here — it resized a chosen photograph in the browser before uploading it, so a 4MB camera picture did not become a 4MB row.

top level, before `POST_DRAFT_FIELDS`

```
/* `shrink` lived here — it resized a chosen photograph in the browser before uploading it, so a
   4MB camera picture did not become a 4MB row. There is nothing to upload any more: a post is the
   ADDRESS of a picture, so the picture is never carried anywhere and never needs shrinking.
   Deleted rather than left unused. Dead code reads as a thing the app does, and the next person to
   wonder why posting is slow would have found a resizer and believed it. */
```

### ---------- THE SHEET'S BOXES ARE DRAFTS (data.js; docs/history/317)

top level, before `POST_DRAFT_FIELDS`

```
/* ---------- THE SHEET'S BOXES ARE DRAFTS (data.js; docs/history/317) -------------------------------------
   A post written into this sheet lived in the sheet: closed by a tap outside, or the page reloaded, and
   the links, caption and words were gone. Each box keeps a draft as it is typed and is drawn holding it
   the next time the sheet opens, until the post is up. `posting as` is a choice of two and is not kept. */
```

### CHOOSE ONE THAT IS ALREADY THERE, before being offered the upload.

top level, before `action`

```
/* CHOOSE ONE THAT IS ALREADY THERE, before being offered the upload.
       Uploading writes to Drive; choosing only reads it. That difference matters because a
       deployment can hold read and not write — and for a photograph taken on a phone this is the
       shorter route anyway: share it to the folder from the camera roll and it is here. */
```

### WHILE THE FOLDER IS READ, THE ONE LOADER — it said "Looking in the folder…" in faint ink, a wait of its own on a sheet; the owner, 9 Oct

top level, before `action`

```
/* WHILE THE FOLDER IS READ, THE ONE LOADER — it said "Looking in the folder…" in faint ink, a
       wait of its own on a sheet; the owner, 9 Oct, *"they should all have a simplistic simple
       loading thing"*. What it turns into — the pictures, "Nothing new", "Could not look" — is a
       result, and keeps its words. */
```

### A LINK, not a file. Uploading meant this app had to be allowed to write to your Drive, which is a large permission to hold for the sake of one button — and the

top level, before `action`

```
/* A LINK, not a file.
       Uploading meant this app had to be allowed to write to your Drive, which is a large
       permission to hold for the sake of one button — and the picture has to be somewhere with a
       link anyway before anybody but you can see it.
       So the picture stays where it is and the post keeps its address. The row above fills this in
       for anything already in the folder; anything else is a paste. */
```

### SEVERAL LINKS, ONE PER LINE — "more then one photo … and also videos".

top level, before `action`

```
/* SEVERAL LINKS, ONE PER LINE — "more then one photo … and also videos". A textarea rather than
       an input so each address is on a line of its own and can be read back; `postLinks_` splits on
       any space, comma or pipe as well, so a list pasted in one line works too. */
```

### WHO THE POST IS FROM.

top level, before `row`

```
/* WHO THE POST IS FROM.
   Two buttons emitting `data-do="as"`, and no handler of that name was ever registered — so the
   row read as a control, pressed like one, and did nothing. `post-send` reads the choice from the
   CONTAINER's `data-as`, which the markup sets to "brand" and nothing ever changed, so every post
   any admin has ever made has gone out as the business whichever button they pressed.
   The state lives on the container rather than on the pressed button, because that is where the
   sender already looks for it. */
```

### `data-for` NAMES THE ROW, because there are two of them now — the composer's and the camera's — and `$('post-as')` was the id of one.

top level, before `row`

```
/* `data-for` NAMES THE ROW, because there are two of them now — the composer's and the camera's —
   and `$('post-as')` was the id of one. Two surfaces asking one question through one handler is the
   `msg-send`/`me-save` move: the control says which container it belongs to and the handler reads
   it, rather than a second copy of twenty lines. Defaults to the composer's id so the sheet's own
   buttons need nothing added. */
```

### Straight into the link box, not into a hidden field beside it.

top level, before `box`

```
/* Straight into the link box, not into a hidden field beside it. There is one place the picture
     is named, and you can see it and change it — a picker that stores its answer somewhere
     invisible is a second source of truth waiting to disagree with the one on screen. */
```

### A PREVIEW OF WHATEVER THE LINK POINTS AT.

top level, before `showPostPreview`

```
/**
 * A PREVIEW OF WHATEVER THE LINK POINTS AT.
 *
 * It is the only way to find out, before posting, that a Drive link has not been shared — the
 * commonest fault by far, and one that looks fine to whoever pasted it because they can see the
 * picture and nobody else can.
 */
```

### EVERY LINK, DRAWN THE WAY THE POST WILL DRAW IT — `postMediaHtml_` is the card's own renderer, so the preview cannot disagree with what goes up.

in `showPostPreview`

```
/* EVERY LINK, DRAWN THE WAY THE POST WILL DRAW IT — `postMediaHtml_` is the card's own renderer,
     so the preview cannot disagree with what goes up. A picture that will not load is still the
     commonest fault, and it is named by position so somebody with five links knows which. */
```

### ---------- EDITING A POST

top level, before `p`

```
/* ---------- EDITING A POST -----------------------------------------------------------------------
   Admin only, and the same shape as editing a resource: id-keyed, only the fields shown are sent,
   and delete is a flag rather than a removed row.

   The row is REFERENCED. Likes, votes and reactions are all rows elsewhere pointing at this
   post_id — take the row away and every one of them points at nothing, which renders as a like
   count on a post that is not there.
--------------------------------------------------------------------------------------------- */
```

### A VOTE IS STORED AGAINST THE WORDS.

top level, before `on`

```
/* A VOTE IS STORED AGAINST THE WORDS. Rename an option and every vote cast for it points at
          something that no longer exists — the count survives, its option does not, and the
          percentages quietly stop adding up. Nothing throws, which is the worst version of it. So
          the options are editable only while nobody has voted. */
```

### Only Delete. The button used to say "Restore" on a post that was already deleted — and a deleted post is not in the feed now, so there is no card to open to

top level, before `on`

```
/* Only Delete. The button used to say "Restore" on a post that was already deleted — and
             a deleted post is not in the feed now, so there is no card to open to reach it. A
             label that cannot be shown is the `arrive()` fault in miniature. */
```

### TWO PRESSES, NOT A confirm() — the same pattern as `post-delete` below, and for the same reason:

top level, before `el.disabled`

```
/* TWO PRESSES, NOT A confirm() — the same pattern as `post-delete` below, and for the same reason:
     an OS dialog cannot use a single word this app chose, and on a phone it reads as the page having
     been taken over. The button says what will happen instead. */
```

### TWO PRESSES. Not a browser confirm() — it is the one dialogue on a phone that looks like the page has been taken over by something else, and it cannot say what

top level, before `restoring`

```
/* TWO PRESSES. Not a browser confirm() — it is the one dialogue on a phone that looks like the
   page has been taken over by something else, and it cannot say what is about to happen in the
   words this app uses. The button becomes the question, and a press somewhere else leaves it as
   it was. */
```

### THE COLUMNS These are not screens coming back unchanged.

top level, before `feedCamCard_`

```
/* ==================================================================================================
   THE COLUMNS
   These are not screens coming back unchanged. `screen('posts')` was one column doing two jobs —
   reading and posting — and a phone puts making a thing to the LEFT of looking at things. So it
   split, and the two halves are these.
================================================================================================== */
```

### ---------- MAKING ONE

top level, before `feedCamCard_`

```
/* ---------- MAKING ONE ---------------------------------------------------------------------------
   THE COMPOSER AND NOTHING ELSE. Every card added here is a card between somebody and the thing
   they swiped left to do — and this is the one column reachable by accident, so what it shows when
   you land on it wrongly has to be harmless and obvious. An empty box is both.

   SIGNED OUT IT SAYS SO, rather than offering a control that will refuse. `new-post` needs a user,
   and a button that refuses is worse than one that was never there. */
```

### ONE PAGE, AND IT IS THE CAMERA.

top level, before `feedCamCard_`

```
/* ONE PAGE, AND IT IS THE CAMERA. It was the camera and then a card describing a photograph — and
   that second card had already been deleted from the top of the feed for being a duplicate of this
   column. Two of it on one column was one more than two of it across two. The composer it offered
   is a button on the camera now; see `cameraCard`. */
```

### ---------- IT WAS A COLUMN, AND IT IS ONE PAGE OF THE FEED NOW

top level, before `feedCamCard_`

```
/* ---------- IT WAS A COLUMN, AND IT IS ONE PAGE OF THE FEED NOW -----------------------------------
   `makeCards_` BUILT THE `make` COLUMN'S ONE CARD and `PAGER.make` counted it. The camera is the page
   directly above the newest post now — see `feedColumn_` under `screen('feed')` — so this returns the
   card itself and the feed's own list is what the pager counts. */
```

### ---------- READING THEM

top level, before `feedCamAt_`

```
/* ---------- READING THEM -------------------------------------------------------------------------
   `postsBlocks` UNCHANGED, and that is the point: the feed under `What for · Posts` and the feed on
   this column are the same function and cannot drift. One is a door, the other is an answer.

   THE COMPOSER IS NOT REPEATED AT THE TOP. It is one swipe left from anywhere in the feed, always
   in the same direction — which is what a column gives it that a card at the top of a list cannot,
   because a card at the top of a list moves as the list grows. */
```

### ---------- THE CAMERA IS THE PAGE ABOVE THE NEWEST POST

top level, before `feedCamAt_`

```
/* ---------- THE CAMERA IS THE PAGE ABOVE THE NEWEST POST ----------------------------------------
   ASKED FOR AS "move the post new post camera widget above the latest post widget. still make the
   latest post widget be the default front door of site." It was a column of its own one swipe LEFT
   of the feed; a column is read top to bottom, so "above the latest post" is the page before it,
   and the `make` column is gone from all five places a screen is named (see the note where its
   `TABS` entry was).

   ON THIS SCREEN ONLY, NOT IN `postsBlocks`, and that is the half that keeps the funnel honest:
   `postsBlocks` is also the answer to `What for · Posts` on the Find screen, and a camera there
   would be a second viewfinder on a screen that knows nothing about starting or stopping one.

   AFTER THE FESTIVE CARDS AND BEFORE THE POSTS, so it is directly on top of the newest post — which
   is exactly where it was asked for — and `PAGE_HOME.feed` opens the column on the page after it.
   The price, said rather than hidden: when the calendar has a festive card it sits above the
   camera, two swipes up from the front door rather than being the front door. That is the reading
   of "the latest post is the front door" taken literally, and it is one line to move.

   `feedCamAt_` IS THE ONE ANSWER TO "WHICH PAGE IS THE CAMERA", read by the column, the home
   position and `feedCamWatch_` alike — three readings of one number, not three counts that can
   disagree. */
```

### `postsBlocks` PUTS THE FESTIVE CARDS FIRST and nothing else in front of the posts — and when there is nothing at all it returns one "Nothing posted yet" card

in `feedCamAt_`

```
/* `postsBlocks` PUTS THE FESTIVE CARDS FIRST and nothing else in front of the posts — and when
     there is nothing at all it returns one "Nothing posted yet" card and no festive ones, which is
     a count of nought here too. Counted rather than built: this is asked on every page turn, and
     building every post card to find one index is the work `PAGER.stuff` was cured of. */
```

### ---------- AND NOT BEFORE THE FEED HAS BEEN OPENED AT ITS FRONT DOOR

top level, before `feedCamHere_`

```
/* ---------- AND NOT BEFORE THE FEED HAS BEEN OPENED AT ITS FRONT DOOR ------------------------------
   REPORTED AS *"the website seems to ask you for permission to use camera when you first load into it
   even though the camera widget is above the front door widget. it should only go when you swipe to
   go up."* It did, and every step of it was right on its own. The payload lands and `load()` calls
   `repaint`, which runs `startScreen_` BEFORE `paintPager` — its order is documented and shared by
   every column — and `paintPager` is what calls `pageHome_`, which is what moves the feed to the
   newest post. So for that one call the feed was still on page 0, page 0 IS the camera on any day the
   calendar has no festive card, `LOADED` had just become true, and this answered yes. The prompt went
   up, and a moment later the column settled on the newest post underneath it. Measured in Chromium,
   signed in: one `getUserMedia` at 560ms with `PAGE.feed` 0 and `PAGE_OPENED.feed` false, from
   `camStart_ < feedCamWatch_ < startScreen_ < repaint < load`.

   `PAGE_OPENED.feed` IS THE FACT THAT WAS MISSING. Until `pageHome_` has put the column at its front
   door, `PAGE.feed` is not a page anybody chose — it is the 0 the object started with — so it is not
   evidence that the camera is in front. After it, every move is a swipe, a `goPage` or an arrival at
   the column where it was left, which are the moments the camera is meant to start. Asked here
   rather than by reordering `repaint`, because this is the one question every caller asks — the
   repaint, the arrival, the page turn and the stream coming back from a prompt — so it covers any
   early caller nobody has written yet as well as the one that was found. ABSENT `PAGE_OPENED` READS
   AS NO: a camera that cannot tell whether it is in front stays off, which is the direction a
   permission prompt should fail in. `check-flow.js` stands in for `getUserMedia` and counts. */
```

### START IT ON ITS PAGE AND LET IT GO ON EVERY OTHER.

top level, before `feedCamWatch_`

```
/* START IT ON ITS PAGE AND LET IT GO ON EVERY OTHER. Booked from `goPage` on every turn and from
   `startScreen_` on arrival and on a repaint. A picture you are holding is NOT thrown away by
   swiping down to read a post: the stream is released and the card is left exactly as it looks —
   `camStop_(true)` — so coming back finds the photograph still on it, and `camStart_` already
   returns early over a held picture. Leaving the COLUMN is what resets the card, as it always did. */
```

### ---------- OFF ITS PAGE THE VIEWFINDER IS AT REST, WHATEVER THE ASK IS DOING (docs/history/341)

top level, before `camRest_`

```
/* ---------- OFF ITS PAGE THE VIEWFINDER IS AT REST, WHATEVER THE ASK IS DOING (docs/history/341) -----------
   `camStop_(true)` lets the hardware go and keeps the card as it is — and a card turned away from mid-ask
   kept the loader `camStart_` had drawn, on the page beside the one in front, for as long as the prompt
   stayed up; an answer arriving after the page was left was stopped the same way and left it there for
   good. check/reach.js read it at 390 and 820: up to fifteen frames of loader on the Feed's first page with
   its second in front. Nothing is coming to that card any more — the answer is let go the moment it lands
   (below) — so it goes back to the dark stage. A refusal's words are not a wait and are left. */
```

### REELS AND MESSAGES — the last two columns on the layout sheet

top level, before `facts`

```
/* ==================================================================================================
   REELS AND MESSAGES — the last two columns on the layout sheet
================================================================================================== */
```

### ---------- REELS

top level, before `facts`

```
/* ---------- REELS --------------------------------------------------------------------------------
   ONE FACT PER SCREEN, SNAPPED. `scroll-snap` does the physics, so there is no listener, no
   transform and no drag maths — and the momentum matches every other scroll on the phone because it
   IS every other scroll on the phone.

   THIS IS THE ONE SCREEN WHERE A PAGER IS RIGHT, and worth saying because the same shape is wrong
   on the feed: a feed is read by flicking past six things, a reel is watched one at a time.

   NO `.pane`. Every other screen puts its cards on one, and a pane sets `touch-action: none` so the
   grid can own the vertical drag. Here the drag IS the scroll.

   THE PHOTOGRAPH IS NOT FETCHED HERE. `pic` is a search term, not a URL — the picture is found on
   Wikimedia Commons when the slide comes into view, which is `reelsWatch_` below. A gradient is the
   floor, not a placeholder: fifty-eight slides that each flash grey first is a column that looks
   broken while it works. */
```

### ---------- AND IT WAS EMPTY, FOR EVERYBODY, SINCE THE DAY IT WAS WRITTEN

top level, before `facts`

```
/* ---------- AND IT WAS EMPTY, FOR EVERYBODY, SINCE THE DAY IT WAS WRITTEN --------------------------
   THIS READ `DATA.facts` AND NOTHING ELSE, AND THAT TAB HAS NEVER HAD A ROW IN IT. So the column
   showed "Nothing here yet. Add a row to the facts tab" to every visitor, while fifty-eight facts
   sat in `FEED_FACTS` in chess.js being shown by the "One more thing" widget two columns over.
   Nothing was broken — measured in a browser: the tab is there, `go('reel')` works, no errors, 0
   facts sent and 58 in the code. **A column that works and has nothing to show is read as a column
   that does not work**, which is the whole of the report that started this.

   `factsNow_` IS THE FIX AND IT IS THE HOUSE RULE. An empty or broken sheet must still produce a
   working site; a tab with no rows leaves the code's copy alone, which is `libraryExtras_`'s rule
   pointed the other way. The sheet still wins the moment it has a row, so nothing about the
   migration is undone — it just stops being a cliff. */
```

### ---------- CLIPS ONLY, AND THE FACTS ARE NOT A FALLBACK

top level, before `facts`

```
/* ---------- CLIPS ONLY, AND THE FACTS ARE NOT A FALLBACK ---------------------------------------
     REPORTED FROM A SCREENSHOT OF THIS COLUMN: "no more factoids on this yh? its just the videos".
     The column opened on a green gradient reading "Notre-Dame took nearly 200 years", which is a
     perfectly good fact and is not a reel.

     THE TWO SURFACES WANT DIFFERENT HALVES OF ONE LIST, which is why this is a filter here and not
     a second source. `factsNow_` still answers both — the sheet wins over the code, a clip row is a
     row with a `clip` — and the "One more thing" widget goes on dealing the whole deck. Splitting
     the data instead would be two tabs, two empty states and two things to keep in step, which is
     the `needs_print` / `print_required` lesson one more time.

     AND A COLUMN WITH NO CLIPS SAYS SO RATHER THAN FILLING ITSELF WITH FACTS. Showing the next best
     thing is exactly how this screen came to be showing the wrong thing. */
```

### ONE SNAPSHOT PER DRAW, and everything below reads it.

top level, before `facts`

```
/* ONE SNAPSHOT PER DRAW, and everything below reads it. `clipsNow_()` is a live answer — it asks
     the sheet, falls through to the code's list, and can give a different list the moment a payload
     lands. The pages of this column are built one batch at a time and indexed by position, so a list
     that changes underneath them makes index 4 a different clip from the one index 4 was drawn as,
     with `REEL_HELD` pointing at whichever is there now. A column is one reading of one list. */
```

### ---------- WHICH OF TWO VERY DIFFERENT THINGS THIS IS

top level, before `REEL_SHOWN`

```
/* ---------- WHICH OF TWO VERY DIFFERENT THINGS THIS IS ------------------------------
            "No clips yet" WAS BOTH ANSWERS AT ONCE and I could not tell them apart from a
            screenshot of it. A column that has looked at fifty-eight reel rows and found no clip
            on any of them is a data problem; a column that has looked at NOTHING is a code
            problem — chess.js holds the built-in list, and if the browser is serving a copy of it
            from before clips existed, or did not get it at all, the count is the only thing on
            the screen that says so.

            This repository's oldest fault, one more time, and this is the fifth entry that names
            it: "I did not manage to look" printed as "I looked and there was nothing there".
            `nothingHere` gives the funnel a reason and a `Try again` for exactly this; a count is
            the cheap version of the same honesty. */
```

### ---------- ONE WIDGET PER REEL, WHICH IS WHAT EVERY OTHER COLUMN IN THE APP IS

top level, before `REEL_SHOWN`

```
/* ---------- ONE WIDGET PER REEL, WHICH IS WHAT EVERY OTHER COLUMN IN THE APP IS ----------------
     REPORTED AS "multiple widgets for each reel. One widget per reel." The screen before this was
     ONE card holding a scroller of its own — `.reels`, `height: min(62svh, 30rem)`, its own
     `scroll-snap-type: y mandatory`, its own momentum — with every clip inside it. So this column
     moved in a way no other column did: the app's own vertical dial turned nothing (there was one
     page), and the thing that actually moved was a box inside a card, with the pane's
     `touch-action: none` switched off underneath it so the browser could have the gesture back.

     A SECOND SCROLLER IS A SECOND DESCRIPTION OF THE PAGER, and this repository has the sentence
     for it under `.reel .over`, under `documents_()` and under `factsNow_`: a second reader of one
     thing is a second chance to disagree about it. `pages()` already gives a screen a vertical
     strip of cards with snap, a position remembered per column, and a dial — measured, that is
     exactly the movement the hand-rolled scroller was reproducing.

     SO A REEL IS A CARD ON A PAGE, like a tool on the Tools column: `pages('reel', …)` wraps each
     in `.page > .pane`, and `widgetColumn_`'s own `.card.is-widget > .widget-slot` is the shape
     everything else on a column already has. `.reels` is gone from the markup and from the
     stylesheet; `.reel` keeps the height the scroller used to state, because a card whose content
     is `position: absolute` has no height of its own — which is the circularity CLAUDE.md records
     under `.page.reel-page`.

     NO HEADING OVER IT, and that is the chessboard's argument rather than an omission: "a board is
     self-explanatory in a way almost nothing else in this app is", and a clip playing is too. The
     column before this drew "Reels" once above fifty-eight slides; one heading per widget would be
     that word printed down the whole column. */
```

### ---------- A REDRAW MUST NOT LOSE THE PAGE YOU ARE ON

top level, before `REEL_SHOWN`

```
/* ---------- A REDRAW MUST NOT LOSE THE PAGE YOU ARE ON ------------------------------------------
     MEASURED: five pages down, `paint('reel')` took the column from 9 pages to 3 while `PAGE.reel`
     stayed at 5 — a position outside its own column, with nothing playing because there is no reel
     5 to play, until the next `paintPager` silently clamped it back to 2.

     A REDRAW IS NOT A NAVIGATION. `load()` repaints when the payload lands, and so does anything
     else that rebuilds this screen, so the column has to come back at least as long as it was where
     it matters: as far as the page somebody is on, plus the two that are always kept ahead of it.
     `reelItem_` still stops at `REEL_MAX`, so this cannot grow past the ceiling. */
```

### ---------- IT GOES DOWN FOR EVER, AND THE DECK IT DRAWS FROM ALREADY DID

top level, before `REEL_FIRST`

```
/* ---------- IT GOES DOWN FOR EVER, AND THE DECK IT DRAWS FROM ALREADY DID ------------------------
   THE OLD COLUMN DREW ALL FIFTY-EIGHT AND STOPPED. Fifty-eight is a lot of slides and it is still a
   bottom — you reach it, and the column that is supposed to be endless is a list you have finished.
   It was also fifty-eight `.reel-art` boxes and fifty-eight observed elements on the first paint of
   a screen showing one of them.

   `feedItem(n)` HAS NEVER HAD AN END. The "One more thing" widget has been walking it forwards
   since it was written — its own comment says "No end to reach, so no wrapping and no going below
   the first" — because `feedShuffle` deals another pass whenever the deck runs out, seeded by the
   day and by how many passes have gone before, so a second lap today is a different order rather
   than the same fifty-eight in the same run. The infinite column is that function read one index at
   a time. Nothing new decides what comes next.

   THAT DECK IS THE WIDGET'S NOW AND NOT THIS COLUMN'S — see the note in the screen above. What is
   left of "for ever" here is a LAP: the clips in the order they are written, then the same clips
   again. With two of them that is plainly a repeat rather than an endless supply, and saying so is
   better than a column that stops dead two flicks in and reads as broken. It stops being a repeat
   the moment there are more clips, with nothing here to change.

   AND IT IS BOUNDED, because a video is not a div. Every slide that has been watched holds a
   decoded `<video>` with a `src` on it, so a column that appended for ever would be a megabyte a
   flick with nothing ever released. `REEL_MAX` is the stated ceiling — thirty laps of two clips,
   further than anybody scrolls — rather than a leak nobody measures until a phone gets hot. */
```

### ---------- SEVEN, SIX AND SIX SINCE 11 OCT (docs/history/341)

top level, before `REEL_FIRST`

```
/* ---------- SEVEN, SIX AND SIX SINCE 11 OCT (docs/history/341) --------------------------------------------
   Three, two and three were set for a thumb that stops on each reel. A run of flicks under 300ms apart
   starves the top-up behind `afterSlide_` (`reelTurn_`), so the column reached the end of what was built
   and the pager clamped the flick back. Six kept ahead is about a second of flicks at five a second; the
   release now appends one slide when fewer than six are left (`reelAhead_`, from `goPage`), and the
   builder tops up to twelve ahead in the quiet. Markup only: a clip's `src` is still set only in front
   (`reelPlay_`), so no video byte is added, and `REEL_MAX` still bounds the column. */
```

### WHICH REEL SOMEBODY HAS DELIBERATELY STOPPED, by index, or −1 for none.

top level, before `REEL_HELD`

```
/* WHICH REEL SOMEBODY HAS DELIBERATELY STOPPED, by index, or −1 for none. A pause that undoes
   itself is not a pause: `reelTurn_` runs on arrival and on every page turn, so without this the
   clip you just stopped starts again the moment anything repaints the column. It is kept per
   INDEX rather than as a flag, so stopping one and swiping to the next leaves the next playing —
   and coming back to the stopped one finds it still stopped, with the mark still on it. */
```

### ONE READER FOR "WHICH CLIPS", and this function was a second one.

top level, before `REEL_CLIPS`

```
/* ONE READER FOR "WHICH CLIPS", and this function was a second one. It filtered `factsNow_` while
   the screen above asked `clipsNow_`, and the two disagree exactly when the sheet has an ordinary
   fact row in it: `factsNow_` hands back the sheet, `clipsNow_` falls through to the built-ins, and
   the column drew its heading, its scroller, and no slides at all. Caught by a mutant putting one
   typed fact in the payload — `{"slides":0}` under a card reading just "Reels". A second reader of
   one thing is a second chance to disagree about it, which is the sentence this repository already
   carries about `documents_()`, `paperIdOf_` and `factsNow_` itself. */
```

### THE LIST THIS COLUMN WAS DRAWN FROM, held for as long as the column is.

top level, before `REEL_CLIPS`

```
/* THE LIST THIS COLUMN WAS DRAWN FROM, held for as long as the column is. Taken in `screen('reel')`
   and read by everything below, so the pages, the pager's count and the item at index n are three
   readings of ONE list rather than three live calls that can disagree — which is the sentence this
   repository writes about `documents_()` and `factsNow_`, one layer down. Null before the column has
   ever been drawn, because the pager counts before then. */
```

### ONE CARD PER REEL, AND THE CARD IS THE WIDGET.

top level, before `reelCards_`

```
/* ONE CARD PER REEL, AND THE CARD IS THE WIDGET. `pages()` gives each of these its own page and
   its own pane; `.card.is-widget > .widget-slot` is what `widgetColumn_` builds for every tool and
   every game, so a reel sits in the column the same way a calculator does.

   `feedSlide` DRAWS THE SLIDE AND THIS DRAWS THE FRAME, which is the split that stopped the two
   surfaces showing one fact from looking different. `data-reel` is the index, and it is what says
   which of these is the one being watched — read by `reelTurn_` below against the pager's own
   position rather than by an observer guessing from how much of a box is on screen. */
```

### THE WHOLE SLIDE IS THE PAUSE, which is what a video is everywhere else.

in `reelCards_`

```
/* THE WHOLE SLIDE IS THE PAUSE, which is what a video is everywhere else. The Sound tile
       sits inside it and carries its own `data-do`, and the dispatcher takes the NEAREST one —
       so reaching for the sound never stops the clip by accident. Drawn muted, always: a slide
       built or rebuilt here holds a new `<video>` (or a Short with no player yet), and both start
       silent — see `reelSoundTile_`.

       `is-held` IS DRAWN FROM THE STATE RATHER THAN LEFT ON THE ELEMENT, and the measurement is
       why: a repaint rebuilds this markup, so the class the tap added went with it while `REEL_HELD`
       stayed — a column showing a stopped clip with nothing on it saying so, which is the exact
       invisible mode the mark exists to prevent. The state decides and the markup is drawn from it,
       which is this repository's own move: replace a fact that is only true by accident of what
       happened with one that has somewhere to be stated. */
```

### HOW MANY PAGES THIS COLUMN HAS, asked by `PAGER.reel` in shell.js — and it is the same counter the markup is built from, so the pager and the screen cannot

top level, before `reelPages_`

```
/* HOW MANY PAGES THIS COLUMN HAS, asked by `PAGER.reel` in shell.js — and it is the same counter
   the markup is built from, so the pager and the screen cannot disagree about how many there are.
   That disagreement is not hypothetical: CLAUDE.md records the You column, where `PAGER` counted
   `mePages()` while the screen drew something else, and the whole axis quietly stopped working.

   ONE WHEN THERE ARE NO CLIPS, because the screen still draws a page then — the card that says so
   and says how many rows it looked at. A count of nothing over a page that exists is a column you
   cannot be on. */
```

### ---------- THE PAGER SAYS WHICH ONE IS BEING WATCHED, AND IT IS THE ONLY THING THAT DOES

top level, before `reelsWatch_`

```
/* ---------- THE PAGER SAYS WHICH ONE IS BEING WATCHED, AND IT IS THE ONLY THING THAT DOES -------
   THERE WERE TWO INTERSECTION OBSERVERS HERE and both existed to answer a question the app already
   knew the answer to. One watched for the bottom of the hand-rolled scroller so more slides could
   be appended before anybody was waiting; the other asked "is this slide more than 55% of the
   column" to decide which clip should be playing. With one widget per reel there is no scroller to
   watch and no ratio to guess from: `PAGE.reel` IS which reel is on the screen, maintained by the
   same dial that moves every other column in the app, and `goPage` is the one place it changes.

   MEASURING A THING THE APP HAS ALREADY DECIDED is how the two halves drift apart — the shape this
   file records under `documents_()` and under `factsNow_`. A ratio over boxes cannot disagree with
   a page number that is a page number.

   BOOKED THROUGH `afterSlide_` BY BOTH CALLERS, under the same key. `paint()` books it on arrival
   and `goPage` books it on every turn; the key is this function itself, so a run of quick flicks
   plays once at the end rather than starting and pausing a clip per swipe. That coalescing is the
   fix CLAUDE.md records under "one timer was holding three jobs" — and it only works because both
   callers pass the same named function rather than two arrows. */
```

### CALLED BY `startScreen_`, WHICH IS THE LIST OF WHAT A SCREEN HAS RUNNING — and it was booked on its own from `go` until it was measured.

top level, before `reelsWatch_`

```
/* CALLED BY `startScreen_`, WHICH IS THE LIST OF WHAT A SCREEN HAS RUNNING — and it was booked on
   its own from `go` until it was measured. Two things came of that: a repaint rebuilt this column's
   markup and started nothing (five pages down, `playing: []`), and arriving here and leaving inside
   300ms started a clip on the screen you had left. Both are answered by being in that list, because
   `go` books it through an arrow that reads `AT` when the timer fires and `repaint` calls it
   outright. */
```

### MORE REELS BEFORE THE BOTTOM RATHER THAN AT IT.

in `reelTurn_`

```
/* MORE REELS BEFORE THE BOTTOM RATHER THAN AT IT. Appending when the last one is reached puts a
     blank page where the flick should have been; two early is the same cost paid while nobody is
     waiting. Same number and same reason as the observer that used to do it. */
```

### AND NOT WHILE THE COLUMN IS STILL WAITING.

in `reelTurn_`

```
/* AND NOT WHILE THE COLUMN IS STILL WAITING. Measured on 9 Oct with the payload held: page 0 was
     the waiting card and pages 1 and 2 were clips, added by this top-up behind it — a column that
     said "on its way" and "here it is" at once. `screen('reel')` draws the clips the moment the
     payload lands; until then the one loader is the whole column, as on every other. */
```

### THE ONE BEING WATCHED PLAYS AND THE REST DO NOT — and the rest are two pixels off the screen rather than gone, because the column peeks above and below.

in `reelTurn_`

```
/* THE ONE BEING WATCHED PLAYS AND THE REST DO NOT — and the rest are two pixels off the screen
     rather than gone, because the column peeks above and below. A clip left running up there is
     sound coming from something nobody can see, which is the one thing a muted-by-default column
     is arranged to avoid. */
```

### A SHORT OBEYS THE SAME RULE, and one more:

in `reelTurn_`

```
/* A SHORT OBEYS THE SAME RULE, and one more: a player more than a page away is TAKEN DOWN, not
       paused. See `reelYtDrop_` for the arithmetic — a YouTube player is a whole web page in its own
       process, and the column deals the same Short again every lap. The neighbours keep theirs
       paused, so a flick back resumes rather than reloads. */
```

### AND THE NEIGHBOURS' FOCUS IS READ AGAIN, NOW THAT THEY ARE STILL.

in `reelTurn_`

```
/* AND THE NEIGHBOURS' FOCUS IS READ AGAIN, NOW THAT THEY ARE STILL. `soft-dim` (a dim in place of
     the blur, for a pane that repaints itself) is decided by `placeGrid` at the turn — and at the
     turn the reel just left is still playing, because this runs after the slide. So the page you had
     just left stayed dimmed and sharp-edged among blurred ones until something placed the grid again:
     an mp4 that way, and a Short for as long as it kept its player (review, 9 Oct, measured both).
     Not during a drag: the finger owns the focus then (`softDrag_`). */
```

### ---------- AND IT STOPS WHEN YOU LEAVE THE COLUMN

top level, before `reelsStop_`

```
/* ---------- AND IT STOPS WHEN YOU LEAVE THE COLUMN ------------------------------------------------
   MEASURED, BECAUSE READING IT WOULD HAVE BEEN A GUESS: `go('reel')` then `go('tools')` left one
   `<video>` with `paused === false` and nothing anywhere had asked it to stop. So a clip somebody
   had turned the sound on for went on talking from a screen two swipes away, with no control on
   the screen they were now looking at — and on a phone that is also a decoder running behind a
   calculator.

   `paint` ALREADY DOES THIS TWICE AND SAID SO. `toolsStop_` stops the widgets when their column
   leaves and `camStop_` stops the camera, with the note "a canvas loop behind a screen nobody is
   looking at is a flat battery, and a live camera behind one is a recording light on for nothing".
   A reel is the third of those and was the one nobody had written.

   IT DOES NOT CLEAR `REEL_HELD`, because leaving a column is not an answer to "did you want this
   one stopped" — `reelsWatch_` starts the current one again on the way back in, which is what the
   measurement shows and what somebody returning to a reel expects. */
```

### ONE FUNCTION, BECAUSE THERE ARE TWO SURFACES THAT PLAY A CLIP and they are the two this feature has always had:

top level, before `clipsStop_`

```
/* ONE FUNCTION, BECAUSE THERE ARE TWO SURFACES THAT PLAY A CLIP and they are the two this feature
   has always had: the column, and the "One more thing" widget that draws from the same list through
   the same `feedSlide`. The widget had the same fault and worse — it has no column of its own to
   leave, so its clip played on behind the Games screen with no control anywhere on the screen you
   had moved to. A second copy of "stop every clip under here" is the second reader this repository
   keeps writing about. */
```

### ONE MORE LAP, AS PAGES.

top level, before `reelMore_`

```
/* ONE MORE LAP, AS PAGES. `pages()` is the same wrapper the screen's first draw used, so an
   appended reel is indistinguishable from one that was there at the start — and `paintPager` is
   what tells the dial there are more of them. Without it the column would hold pages the pager
   refuses to move to, which is the You-column failure the note on `reelPages_` names. */
```

### ---------- AND THE COLUMN IS NO LONGER WHAT IT WAS DRAWN WITH (`DRAWN = null`)

top level, before `reelMore_`

```
/* ---------- AND THE COLUMN IS NO LONGER WHAT IT WAS DRAWN WITH (`DRAWN = null`) -------------------------------
   `paint`'s identical-markup skip (shell.js, docs/history/341) keeps a column whose new markup is byte for
   byte what it was drawn with — and asks the draw to find out, and THIS column's draw starts again from reel
   nought (`REEL_SHOWN = 0`, `screen('reel')`). Appended to in place, the column held thirteen slides while
   the draw counted seven, the skip kept the thirteen, and the next top-up dealt reels seven to twelve a
   second time: found by review on 12 Oct, six repeats per landing without end, and from page thirteen the
   clip started was a slide six pages off the glass while the one in front never played. So an append says
   the column has left its drawing, and the next landing draws it whole — the residual rule written over
   that skip, kept here where the column is edited. */
```

### IN THE RELEASE: ONE SLIDE, when fewer than `REEL_AHEAD` are left past the page being turned to — markup, amortised as Find's window is, so a run of flicks

top level, before `reelAhead_`

```
/* IN THE RELEASE: ONE SLIDE, when fewer than `REEL_AHEAD` are left past the page being turned to — markup,
   amortised as Find's window is, so a run of flicks never reaches the end of what is built. `goPage` calls
   it before the column moves; its own `paintPager` tells the dial. */
```

### ---------- A CLIP, AND NOTHING BEHIND IT IF IT WILL NOT PLAY

top level, before `reelPlay_`

```
/* ---------- A CLIP, AND NOTHING BEHIND IT IF IT WILL NOT PLAY ------------------------------------
   THE `src` IS SET HERE AND NOT IN THE MARKUP, so a clip five slides down is not being downloaded
   while you watch the first one. Seven megabytes each, and `preload="none"` is a hint a browser is
   free to ignore where an absent `src` is not.

   THERE WAS A LADDER HERE — two Drive download addresses and then Drive's or Instagram's embed in an
   iframe — and it is gone with the embedded reels (see `clipPlayable_` in games.js). A clip that
   reaches this is a file, so there is one address, and if it errors the slide STAYS A `<video>`:
   `.feed-vid` is transparent, so what shows is the poster or `.feed-art`'s own gradient, which is a
   finished thing rather than somebody else's player or a black hole. `dead` stops the next page
   turn asking the browser for a file it has already refused. */
```

### A BLOCKED AUTOPLAY IS A REJECTED PROMISE AND NOT AN ERROR.

in `reelPlay_`

```
/* A BLOCKED AUTOPLAY IS A REJECTED PROMISE AND NOT AN ERROR. Every browser refuses to start an
     unmuted video nobody has tapped, and one that has been unmuted by the Sound tile below and then
     scrolled back to is exactly that case. Caught and dropped: the slide is on screen with its
     first frame showing, which is what a paused reel looks like. */
```

### A YOUTUBE SHORT, DRIVEN THE WAY THE `<video>` ABOVE IS

top level, before `YT_HOST`

```
/* ==================================================================================================
   A YOUTUBE SHORT, DRIVEN THE WAY THE `<video>` ABOVE IS

   THE OWNER, 9 OCT: *"i want to add this to reels, maybe embedd? or work fine without? i just want it
   to look like other reels"*. A YouTube video has no file a `<video>` can read, so it is an embed or
   nothing — and the embeds were taken out on "remove the embedded reels. they suck." The note over
   `clipPlayable_` in games.js says why this one is let back in: Drive's and Instagram's players could
   not be told anything, and YouTube's IFrame Player takes orders by `postMessage`. So everything the
   column does to a `<video>` is done here to the player, by message, and nothing else is:

     arriving        the poster is already there (`feedSlide`); THIS builds the player, muted, and it
                     starts itself — the one kind of start every browser allows
     tap             `pauseVideo` / `playVideo`, and `is-held` draws the ▶, exactly as for a video
     Sound           `unMute` / `mute`, the same tile and the same words
     leaving         `pauseVideo`; a page further and the player is taken down (`reelYtDrop_`)
     cannot load     the poster stays, and one link says "Watch on YouTube" (`reelYtDead_`)

   NO SCRIPT FROM YOUTUBE ON THIS PAGE. `iframe_api` would be a second company's JavaScript loaded into
   the app on every visit, for a handful of messages whose shape is fixed: `{event: 'command', func,
   args}` one way, `onReady` / `infoDelivery` / `onStateChange` / `onError` the other. They are written
   out below instead — the part of that file this column needs, and nothing it does not.

   THE PLAYER IS INVISIBLE UNTIL IT IS PLAYING. Before its first frame an embed shows a black box, a
   spinner and the video's title; paused, the title again and suggestions of its own; broken, its
   error screen. None of those is a reel. So the iframe sits at `opacity: 0` over the poster and `is-live`
   — set when the player says it is PLAYING, and taken off the moment it is told to stop — is the one
   thing that shows it. A held Short shows its poster under the ▶, not YouTube's pause screen.

   NOT SEEN FROM HERE, AND SAID SO. The machine these were written and checked on cannot reach
   YouTube, so every test speaks to a stand-in that answers in the player's own messages. What the
   real player may still draw in its first seconds of playing — its title, which no parameter has
   turned off since `showinfo` was retired — is settled by the first open on a phone (note 319).

   A CLEAR LAYER OVER IT TAKES EVERY TOUCH. A touch on an iframe belongs to the page inside it: the
   column could not be swiped past a Short, and a tap would have pressed YouTube's own player. The
   veil (`.feed-yt-veil`) is above the iframe and the iframe is `pointer-events: none` under it, so a
   tap is the slide's `reel-tap` and a drag is the column's — the same two things they are on a video.
================================================================================================== */
```

### HOW LONG A PLAYER HAS TO PLAY ITS FIRST FRAME before the slide stops waiting and offers the door.

top level, before `YT_GIVE_UP`

```
/* HOW LONG A PLAYER HAS TO PLAY ITS FIRST FRAME before the slide stops waiting and offers the door.
   Long, on purpose: the poster is on the screen for all of it, so waiting costs nothing anybody can
   see, and YouTube's player is a megabyte of somebody else's script on a phone that may be on 3G. A
   player that answers and is then told to stop is not timed — only one that was asked to play, or
   one that has said nothing at all (`reelYtClock_`). */
```

### THE ADDRESS, and every word in it is doing something.

top level, before `reelYtSrc_`

```
/* THE ADDRESS, and every word in it is doing something. `enablejsapi` is what makes it take orders;
   `mute` + `autoplay` is the start a browser allows; `loop` needs `playlist` set to the same id or a
   single video ignores it; `controls=0`, `rel=0`, `iv_load_policy=3` take YouTube's buttons, its
   suggestions and its annotations off the picture; `playsinline` stops an iPhone taking it full screen;
   `origin` is the page the player may talk to, and it is left off where there is no web origin to
   name (opened from a file). The NOCOOKIE host is the Videos card's, for the Videos card's reason: no
   tracking cookie until somebody actually plays it. */
```

### ONE ORDER TO ONE PLAYER.

top level, before `reelYtSay_`

```
/* ONE ORDER TO ONE PLAYER. Sent to the nocookie origin and nowhere else, so a page that somehow ended
   up in the frame instead is told nothing. An order before the player is ready is dropped by YouTube
   — which is why `want` and `sound` are written on the box first and `reelYtHeard_` says them again
   when it answers. */
```

### PLAY: build the player the first time this slide is the one on screen, and ask it to play after.

top level, before `reelYtPlay_`

```
/* PLAY: build the player the first time this slide is the one on screen, and ask it to play after.
   NEVER BEFORE IT IS REACHED — the rule `feedSlide` writes about the videos' `src`, and sharper here:
   a YouTube player is a page, and a column that built one per Short dealt would build one a lap. */
```

### `autoplay` IN `allow` IS WHAT LETS THE SOUND TILE WORK:

in `reelYtBuild_`

```
/* `autoplay` IN `allow` IS WHAT LETS THE SOUND TILE WORK: a tap on this page is the gesture, and
     this is the page delegating it to the frame. `referrerpolicy` is the Videos card's, for its
     reason — YouTube refuses (error 153) a page that sends no referrer at all. `tabindex=-1`: the
     slide is the control and YouTube's buttons are not, so a keyboard does not stop inside them. */
```

### ---------- THE GIVE-UP CLOCK, WOUND BY EVERY ASK TO PLAY

top level, before `reelYtClock_`

```
/* ---------- THE GIVE-UP CLOCK, WOUND BY EVERY ASK TO PLAY -------------------------------------------
   IT WAS WOUND ONCE, WHEN THE PLAYER WAS BUILT, AND ONE MOMENT DECIDED IT. Twenty seconds on, if the
   Short was not being asked to play right then, nothing happened and nothing ever looked again. So a
   player that never answered (YouTube blocked, the phone offline) was stuck for good the moment
   somebody did the natural thing with a picture that will not move — tapped it once (which holds it)
   or flicked one page away and back — inside those twenty seconds: a poster that never played, a live
   Sound button, and no door. Measured in review on 9 Oct with a stand-in that never answers: still no
   door at sixty seconds, both ways.

   NOW TWO RULES, ONE CLOCK AT A TIME PER SLIDE:
     - A PLAYER THAT HAS SAID NOTHING AT ALL in twenty seconds is given up on whatever was wanted of
       it. It is not being held; it is not there. `reelYtHello_` stops asking at the same moment.
     - ONE THAT ANSWERED but has not played its first frame is given up on only if it was being asked
       to play when the clock ran out. If it was held or a page away, the next ask winds a fresh clock
       — so a player that only ever answered is still never left without a door.
   `played` AND NOT `is-live`: a Short that played, was flicked away and is being started again when
   the clock runs out is a player that works, not one that failed. */
```

### ---------- TAKEN DOWN, NOT PAUSED, ONCE IT IS OUT OF REACH

top level, before `reelYtDrop_`

```
/* ---------- TAKEN DOWN, NOT PAUSED, ONCE IT IS OUT OF REACH ---------------------------------------
   A PAUSED `<video>` IS A DECODED FRAME; A PAUSED YOUTUBE PLAYER IS A WEB PAGE — YouTube's whole
   player, in its own process on any browser that isolates sites, holding its script, its buffer and
   its connections for as long as it exists. And the column deals in LAPS: with three clips the same
   Short is every third page, so a column that kept every player it had built would hold one more per
   lap, up to `REEL_MAX`'s sixty pages, behind a screen nobody is looking at — the "phone gets hot"
   this file's own ceiling was written against.

   SO BY DISTANCE, NOT BY A TIMER. The one on screen plays; the pages either side keep theirs paused,
   because those are the ones a flick back reaches and a player built again is a second or two of
   poster; anything further is removed, and so is everything when the column is left (`clipsStop_`).
   So there are never more than three players (the page in front and one either side) and, with the
   Short one clip in three, never more than one or two — decided by the page you are on, the number
   the app already knows, rather than by a clock that would need a timer per slide and still guess.

   A PLAYER BUILT AGAIN STARTS MUTED, as every autoplaying thing must, and the tile is put back to
   say so — a speaker with its waves over a player that has just started silent is the invisible
   mode `is-held` exists to prevent. */
```

### ---------- WHEN IT CANNOT PLAY, IT STAYS A PICTURE WITH A WAY OUT

top level, before `reelYtDead_`

```
/* ---------- WHEN IT CANNOT PLAY, IT STAYS A PICTURE WITH A WAY OUT ---------------------------------
   OFFLINE, A VIDEO TAKEN DOWN, EMBEDDING SWITCHED OFF BY ITS OWNER (`onError` 100, 101, 150), or
   nothing heard from the player at all. Every one of those draws YouTube's error screen or a black
   box inside the frame, and neither is ever shown: the frame is removed, the poster stays, and the
   one thing added is a link to watch it where it lives — a door, as the Videos card's rows are, and
   the only YouTube words that appear on the slide.

   A HELD SHORT THAT DIES IS LET GO. `onError` can arrive a second or two after the player loads, so
   a Short somebody had already tapped to hold kept its ▶ — drawn above the door, in the same middle
   of the slide — and no tap could clear it, because `reel-tap` does nothing on a dead Short (review,
   9 Oct). There is nothing left to hold: the mark comes off and `REEL_HELD` forgets the page, so a
   repaint does not draw it back. */
```

### HELLO, UNTIL IT ANSWERS.

top level, before `reelYtHello_`

```
/* HELLO, UNTIL IT ANSWERS. `listening` is how a page tells the player it wants to be spoken to; the
   player only starts sending once it has heard it, and it may not be listening yet when the frame's
   `load` fires — so it is said again every 400ms until the first answer, which is what YouTube's own
   script does. The three events are asked for by name because `onError` and `onStateChange` are only
   sent to a page that asked. */
```

### WHAT THE PLAYER SAYS.

top level, before `reelYtHeard_`

```
/* WHAT THE PLAYER SAYS. The first thing it says, whatever it is, means it is listening — so the box's
   wishes are said again then (an order sent before that was dropped). PLAYING (1) shows it; paused
   (2) and cued (5) hide it again behind the poster; buffering (3) leaves it as it is, so a stall
   mid-clip is a frozen frame rather than a flash of poster.

   ENDED (0) AND UNSTARTED (−1) ARE A LAP, WHILE IT IS MEANT TO BE PLAYING. They hid it too, and a
   looping Short says both at every lap boundary — `loop=1&playlist=<id>` restarts as 0, −1, 3, 1 — so
   the poster cross-faded in over the picture once a lap: fully hidden for half a second, partly for a
   second, where an mp4 reel loops without a seam (review, 9 Oct, with a stand-in that restarts that
   way; the real player's sequence cannot be watched from this machine). So a Short that was showing
   and is wanted stays showing through them, for `YT_LAP`. A restart that has not said PLAYING (or
   buffering) by then is not a lap — a loop that did not happen leaves YouTube's end screen, its grid
   of other videos — and that goes back under the poster. */
```

### ONE LISTENER FOR EVERY PLAYER, matched to its frame by the window that sent the message — the `data-do` shape, one listener for the document.

top level, before `d`

```
/* ONE LISTENER FOR EVERY PLAYER, matched to its frame by the window that sent the message — the
   `data-do` shape, one listener for the document. Anything not from YouTube's two hosts, or not JSON,
   or from a frame that is not a reel's, is not this function's business. */
```

### SOUND IS OFF UNTIL IT IS ASKED FOR, because a column that starts talking the moment it opens is a column nobody opens twice — and because a muted video is the

top level, before `n`

```
/* SOUND IS OFF UNTIL IT IS ASKED FOR, because a column that starts talking the moment it opens is a
   column nobody opens twice — and because a muted video is the only kind a browser will start by
   itself. The tile says the state it is IN, not the state it would move to: "Sound off" on a
   muted clip is what everything else in this app does with a switch. */
```

### ---------- A REEL YOU CANNOT STOP

top level, before `n`

```
/* ---------- A REEL YOU CANNOT STOP ----------------------------------------------------------------
   THERE WAS NO PAUSE. The column autoplays whatever page you are on, which is right, and the only
   control on the slide was the sound — so a clip could be silenced and not stopped, and the only
   way to make it stop was to swipe away from it. Every video surface anybody has used answers a tap
   on the picture with a pause, and this one answered it with nothing.

   THE MARK IS THE HALF THAT MATTERS. A stopped video whose first frame is still on the screen looks
   exactly like a playing one that happens to be still, so `is-held` draws the ▶ over it — the same
   argument this repository writes about the pen: "a mode you cannot see is a mode that surprises
   you". */
```

### A SHORT IS HELD BY `REEL_HELD`, NOT BY ASKING IT.

top level, before `yt`

```
/* A SHORT IS HELD BY `REEL_HELD`, NOT BY ASKING IT. A `<video>` can be asked whether it is paused,
     synchronously; a player in a frame can only be told, and its answer arrives later — so the state
     this column already keeps is the answer, which is also what draws the ▶. */
```

### ---------- THE SOUND IS A TILE, LIKE EVERYTHING ELSE

top level, before `reelSoundTile_`

```
/* ---------- THE SOUND IS A TILE, LIKE EVERYTHING ELSE ---------------------------------------------
   THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* It was a `.btn
   tiny` with "Sound off" written in it — the last control on a reel drawn by hand rather than by
   `tile_`, the one renderer, so its tap target, its press and its mark were its own (note 323).

   ONE FUNCTION DRAWS IT AND ONE SAYS ITS STATE, because three places change it — the first paint,
   the press, and a Short's player taken down a page away — and each rewrote `textContent` on its
   own. Three writers of one fact is three chances to disagree; now the label, the mark and
   `aria-pressed` move together or not at all (`tileSet_` is the star's own way of doing that).

   THE LABEL SAYS THE STATE IT IS IN, exactly as the button's words did: "Sound off" on a muted clip,
   "Sound on" on one playing aloud — and the mark says the same thing in a picture, the crossed
   speaker every phone draws over a silent clip. `aria-pressed` is the third copy, for a screen
   reader, which cannot see which mark is drawn.

   ITS OWN TONE, `over`, because it is not on a card: it sits on a moving picture, where the plate
   every other tile wears (3% white) is invisible on a white wall. `--over-wash` is the wash the ▶ and
   the Short's door already use over the same picture — see `.tile.is-over` in style.css. `cls` keeps
   `.reel-sound`, the name the stylesheet places it by and a dead Short hides it by. */
```

### ---------- MESSAGES

top level, before `dmAsk_`

```
/* ---------- MESSAGES -----------------------------------------------------------------------------
   THE TAB IS EMPTY AND THIS SAYS SO. An empty screen that is WIRED is a week ahead of one that looks
   right and is not: the backend already has sendMessage, messages, readMessage and flagMessage, and
   the only thing missing is rows.

   ONE ROW PER CONVERSATION, the same row a resource and a person use. One shape doing three jobs is
   most of why this app stays quiet. */
```

### ---------- ONE CONVERSATION PER PAGE, WHICH IS WHAT EVERY OTHER COLUMN ALREADY IS

top level, before `dmAsk_`

```
/* ---------- ONE CONVERSATION PER PAGE, WHICH IS WHAT EVERY OTHER COLUMN ALREADY IS ---------------
   IT WAS `stack('dm', …)` — one page holding every conversation — and that is exactly the shape
   the note over `PAGER.tools` records for the two columns it already cost: *"Both screens used
   `stack` — one page holding everything — and about sixty per cent of each was unreachable, because
   `.pane` is `overflow-y: hidden` and one page means nothing to page to either."*

   MEASURED WITH SIX CONVERSATIONS AT 390×844: the pane's contents were 1,298px inside an 805px box,
   so **493 pixels of somebody's messages were on the page and could not be reached** — no scroll,
   because `.pane` is `overflow: hidden` and `touch-action: none`, and no page to turn to, because
   `PAGER` had never heard of this screen. Two conversations short on a phone, and silent.

   `.pane`'s OWN COMMENT NAMES THE ANSWER: *"Anything genuinely long should be PAGED, which is what
   the pager is for, rather than scrolled inside one card."* A conversation is a card with its own
   scroller and its own composer, which is precisely what a page holds everywhere else in this app.

   THE ASK MOVED OUT OF THE BUILDER, and that is what makes the pager safe. `PAGER.dm` has to count
   the same list the screen draws — the rule every entry in that table states — and a builder that
   starts a network request cannot be called twice. So the draw asks and `dmPages_` only reports. */
```

### ---------- BUT A COLUMN DRAWN AHEAD ASKS NOBODY (`dmAsk_`)

top level, before `dmAsk_`

```
/* ---------- BUT A COLUMN DRAWN AHEAD ASKS NOBODY (`dmAsk_`) -------------------------------------------------
   Since docs/history/341 the builder draws this column in the quiet after every repaint and landing, for
   nobody looking — and through this draw that was a `messages` POST each time (found by review on 12 Oct:
   three repaints, three asks; base, none). "Nothing runs for nobody" is the builder's rule, and an ask is a
   round trip on a phone's signal and a slice of the backend's quota. So drawn ahead it asks nothing: if the
   inbox the payload fetched (`loadMessages`, shell.js) has answered for whoever is here, that answer IS the
   first answer, and the column is drawn from it; if it has not, the loader stays until it lands (its own
   landing marks this column again) or until an arrival, which asks as it always did — `DM_LAST` is left
   alone, so the first arrival still asks for what came in since. */
```

### ---------- THIS SCREEN READ A KEY THAT HAS NEVER EXISTED

top level, before `DM_ASKED`

```
/* ---------- THIS SCREEN READ A KEY THAT HAS NEVER EXISTED ----------------------------------------
   IT SAID "No messages." TO EVERYBODY, FOR EVER, AND IT WAS NOT A BUG IN THE BACKEND. It took
   `DATA.messages`. Messages are a POST action, not a payload key, because a conversation is private
   and the GET payload goes out whole to whoever asks for it — so the backend is RIGHT not to send
   them, and `|| []` turned the absence into an empty inbox. The exact fault CLAUDE.md names as the
   worst one here, and `check-payload.js` now reports it.

   WORSE: IT HAD ALREADY BEEN FOUND AND FIXED ONCE. me.js says "`DATA.messages` — which both readers
   below took — is not a key the payload has ever held", and fixed the two it could see. This was a
   THIRD reader, in another file, and the fix never reached it. That is the disease in this codebase
   in one function: not a wrong idea, a right idea that did not arrive everywhere.

   THREE FAULTS IN EIGHT LINES, because the other two were hiding behind the first. It also sorted on
   `m.sentAt` and tested `m.readAt`; the handler sends `at` and `read`. Fixing only the key would have
   produced cards in arbitrary order, every one of them marked unread — a different silent wrong
   answer, and one that looks enough like working to survive.

   NOTHING NEW IS BUILT HERE. `loadMessages`, `messageThreads_` and `messagesHtml_` are me.js's, are
   loaded before this file, and are what the widget already uses. A fourth copy of "how to show a
   message" is how this happened in the first place.
--------------------------------------------------------------------------------------------- */
```

### ASKED ONCE, NOT ONCE PER PAINT — AND `MESSAGES` CANNOT BE THE FLAG THAT SAYS SO.

top level, before `DM_ASKED`

```
/* ASKED ONCE, NOT ONCE PER PAINT — AND `MESSAGES` CANNOT BE THE FLAG THAT SAYS SO.
   `loadMessages` assigns MESSAGES on success and deliberately does NOT on failure, so an unreachable
   backend leaves whatever was there rather than reading as an empty inbox. Right for the widget, and
   a trap here: if "MESSAGES is still null" were the condition to fetch, one failed request would
   paint, re-ask, fail, paint, re-ask — a loop against the backend for as long as the tab was open.
   This records that the ASKING happened, which is the fact the redraw actually depends on. */
```

### AND WHETHER IT CAME BACK, which `MESSAGES` cannot say.

top level, before `DM_DONE`

```
/* AND WHETHER IT CAME BACK, which `MESSAGES` cannot say. `loadMessages` leaves it alone on a
   failure — deliberately, so a blip does not read as an empty inbox — so "still null" means both
   *waiting* and *asked and refused*, and showing the loader for the second is a column that
   never finishes loading. This is the fact the loader actually depends on. */
```

### ---------- WHEN IT LAST ASKED, NOT WHEN IT LAST GOT AN ANSWER

top level, before `DM_LAST`

```
/* ---------- WHEN IT LAST ASKED, NOT WHEN IT LAST GOT AN ANSWER ---------------------------------
   THE FIRST VERSION GATED ON `MSG_AT`, WHICH ONLY MOVES ON SUCCESS, and that is the trap the note
   over `DM_ASKED` below already describes in the other direction. A refused fetch leaves `MSG_AT`
   where it was, so the gate is open again immediately — and `paint('dm')` happens for reasons that
   have nothing to do with this column: a payload landing, a sign-in, a save. On a phone with a bad
   signal that is a request per repaint.

   THE PACING IS A FACT ABOUT THE ASKING, so it is kept where the asking is. `MSG_FAILED` stays in
   me.js because it is a fact about the DATA — which empty an empty inbox is — and the two are not
   the same question. Caught by reading the failure path rather than by measuring, which is the one
   path a happy run never reaches. */
```

### IT KEEPS ITSELF UP TO DATE, AND THE REFRESH BUTTON IS GONE

top level, before `DM_EVERY`

```
/* ==================================================================================================
   IT KEEPS ITSELF UP TO DATE, AND THE REFRESH BUTTON IS GONE

   REPORTED AS "when you do recieve a message you shouldnt have a refresh messages widget. it should
   already be contantly up to date. synced or whatever". Right, and the button was worse than
   redundant: it was a PAGE. `dmPages_` opened with a card holding a heading and one control, so the
   first thing on the Messages column was a card with no message on it — which is why `PAGE_HOME.dm`
   had to skip past it, an entry that existed only to hide something nobody wanted.

   WHAT "SYNCED" CAN HONESTLY MEAN HERE IS POLLING. The backend is Apps Script behind a `doPost`;
   there is no socket and no push channel, and inventing a badge that updates without asking would
   be a sentence this app cannot keep. So it asks — while the column is on the screen, and never
   when it is not, which is the same rule the camera, the widgets and the reels already follow and
   is stopped in the same place in `paint`.

   TWENTY SECONDS, AND WHAT IT COSTS IS WRITTEN DOWN. `messages` is one tab read rather than the
   whole payload, so this is nothing like `installWarmTrigger` — the note over that one costs five
   hours of script time a day and is deliberately not installed. Three asks a minute for as long as
   somebody is actually reading their messages is the price of the button not existing.

   AND IT WILL NOT REPAINT UNDER A REPLY SOMEBODY IS TYPING. `paint('dm')` rebuilds the markup, and
   the composer at the foot of each thread is in it — so a tick landing mid-sentence would throw the
   sentence away. The data is updated either way; only the redraw waits, and it happens on the tick
   after the box is empty. Same judgement as the auto-reload in `checkBuild_`, which holds for
   anything typed and unsaved.
================================================================================================== */
```

### WHAT WOULD LOOK DIFFERENT IF IT WERE DRAWN AGAIN.

top level, before `dmStamp_`

```
/* WHAT WOULD LOOK DIFFERENT IF IT WERE DRAWN AGAIN. A count cannot answer this: a message being
   marked read changes no count and changes every badge on the column. Id plus read state per
   message is exactly what the cards are built from. */
```

### THE ONE SIDE EFFECT.

top level, before `dmSync_`

```
/* THE ONE SIDE EFFECT. `loadMessages` swallows its own failures and always resolves, so there is no
   rejection path to handle — and the first answer must repaint either way, or a failed first fetch
   leaves the loader on screen for ever with nothing saying why. */
```

### Which conversation is on the screen, by person rather than by page — a message arriving in another thread moves that thread to the front and would otherwise

in `dmSync_`

```
/* Which conversation is on the screen, by person rather than by page — a message arriving in
     another thread moves that thread to the front and would otherwise slide this one out from
     under the reader. `dmRedraw_` puts the page back on it. */
```

### STARTED WHEN THE COLUMN ARRIVES AND STOPPED WHEN IT LEAVES, from `startScreen_` and `paint` — the one list that exists for exactly this.

top level, before `dmPoll_`

```
/* STARTED WHEN THE COLUMN ARRIVES AND STOPPED WHEN IT LEAVES, from `startScreen_` and `paint` — the
   one list that exists for exactly this. A poll booked anywhere else is the fault the reels' own
   note records: a repaint rebuilds the markup it was running in and never ran the booking. */
```

### AND COMING BACK TO THE APP IS WORTH AN ASK WHATEVER THE CLOCK SAYS.

top level, before `dmFace_`

```
/* AND COMING BACK TO THE APP IS WORTH AN ASK WHATEVER THE CLOCK SAYS. A phone that was asleep has a
   timer that did not tick, and the first thing somebody does on returning to a conversation is look
   at it. `visibilitychange` rather than a shorter interval, because the two answer different
   questions and only one of them costs anything while nobody is looking. */
```

### ---------- ONE LIST, TWO READINGS — THE MARKUP AND THE NAME IN THE HEADER

top level, before `dmFace_`

```
/* ---------- ONE LIST, TWO READINGS — THE MARKUP AND THE NAME IN THE HEADER ----------------------
   IT RETURNED HTML STRINGS, and a pager needs a NAME per page. Deriving those from a second walk of
   `messageThreads_` would be the fault the `PAGER` table states in every one of its entries: *"a
   pager that counts for itself is a pager that can disagree with the screen it is a pager for"* —
   which this column has now been on the wrong side of once already.

   SO A PAGE IS `{ name, html }` and both readers map the same array. Page n and name n cannot
   drift, because there is only one n.

   AND IT IS PURE. Every branch reads state and returns; the asking is `dmSync_` above. That is what
   lets `PAGER.dm` call it on the app's first frame without starting a request from a header. */
```

### ---------- THE FACE IN A CONVERSATION'S HEAD IS THE ONE ON THEIR PROFILE

top level, before `dmFace_`

```
/* ---------- THE FACE IN A CONVERSATION'S HEAD IS THE ONE ON THEIR PROFILE -----------------------
   ASKED FOR AS *"the profile picture for people in messages should be informed from their profile
   picture in people."* A message row carries a name and an id and no photograph, so the photograph
   is looked up in the people the payload already sent — by `person_id` first and the display name
   only after, which is `findPerson`'s own order and for its reason: two people can share a name,
   and a stranger's face over a private conversation is worse than a letter.

   ONLY `DATA.tutors` CARRIES A PHOTO, and that is the server deciding, not this function. A child's
   row is sent with a name and an avatar and nothing else, so a conversation with a student keeps the
   initial — which is the fallback for every case this cannot place, and the reason a failed image
   quietly becomes one rather than a broken-picture icon. */
```

### ---------- AND IT IS `personFace_`, LIKE EVERY OTHER FACE

top level, before `dmFace_`

```
/* ---------- AND IT IS `personFace_`, LIKE EVERY OTHER FACE -------------------------------------------
   One of the ten pictures, or the figure when the row carries it (the owner, 10 Oct: *"…which allow
   you to use your avatar as a dp."*), draws in the disc exactly as it does on the card. Your FAMILY's
   rows and an ADMIN's everyone are looked in too, after the tutors and under the same two locks the
   account column puts on them — the list stamped for you, and admin — because the server already sent
   their faces to you for that column; a conversation with your own child had a letter at its head
   while the child's picture was one swipe away. A PHOTOGRAPH keeps its `onerror`: a Drive file that
   is not shared becomes the letter rather than a broken square. */
```

### ---------- THE HEAD CARD WAS A PAGE WITH NO MESSAGE ON IT

in `dmPages_`

```
/* ---------- THE HEAD CARD WAS A PAGE WITH NO MESSAGE ON IT -------------------------------------
     IT WAS A HEADING AND A REFRESH BUTTON, first on a column of conversations — so `PAGE_HOME.dm`
     existed to swipe past it, an entry whose whole job was hiding a card nobody wanted. Reported as
     "you shouldnt have a refresh messages widget". The column polls while it is on the screen (see
     `dmPoll_` above), so there is nothing left for that button to do.

     `PAGE_HOME.dm` WENT WITH IT, in the same commit. Leaving it would open the column on the SECOND
     conversation for ever, which is the shape this repository records every time a rule outlives
     the thing it was written about. */
```

### ---------- AND AN EMPTY INBOX SAYS WHICH EMPTY IT IS

in `dmPages_`

```
/* ---------- AND AN EMPTY INBOX SAYS WHICH EMPTY IT IS -------------------------------------------
     TWO FACTS WORE ONE SENTENCE. `loadMessages` leaves `MESSAGES` alone on a failure — deliberately,
     so a blip does not read as everything having been deleted — so a first fetch that never arrived
     drew "Nothing yet." over an inbox nobody managed to read. THIS REPOSITORY'S OLDEST FAULT: *I
     did not manage to look*, printed as *I looked and there was nothing there*.

     THE RETRY BELONGS ON THE FAILURE AND ONLY THERE. A genuinely empty inbox is being re-asked
     every twenty seconds and needs no button; one nobody could reach is the one state where a
     person wants to press something, and it is the one that now has something to press. */
```

### ---------- DRAWN IS READ, ON THIS SCREEN ONLY

in `dmPages_`

```
/* ---------- DRAWN IS READ, ON THIS SCREEN ONLY -------------------------------------------------
     EVERY THREAD IS OPEN HERE. The Messages column is not a list of conversations to tap into — it
     is the conversations, one card each, with the messages in them. So drawing this screen IS
     somebody reading them, and `readMessage` is owed for each one.

     SAFE TO CALL FROM A DRAW, which is normally the wrong place for a round trip. `markRead_` sets
     `read` on the message the moment it asks, so a second paint before the reply finds nothing left
     to send and a failed one puts it back.

     AND IT IS THE ONE THING IN HERE THAT REACHES OUT, which is why the pager may call this: the
     marking is idempotent, where the fetch `dmSync_` holds is not. */
```

### ---------- AND EACH ONE CAN BE ANSWERED WHERE IT IS READ

in `dmPages_`

```
/* ---------- AND EACH ONE CAN BE ANSWERED WHERE IT IS READ ---------------------------------------
     THE COLUMN SHOWED CONVERSATIONS YOU COULD NOT REPLY TO. The only composer in the app was in a
     sheet on a person's pass — so reading a message here and answering it meant leaving, finding
     the person on another column, and opening their card. `msgForm_` is that same composer, at the
     foot of the thread, which is where every messaging app anybody has used puts it.

     `t.id` IS THE PERSON'S ID and `t.name` their name, which is exactly what `sendMessage` takes —
     `messageThreads_` groups on `withId` precisely so this is a fact from the sheet rather than a
     name matched back into one. See the note over `findPerson`: on a private message, matching by
     name is not a denial, it is a disclosure.

     THE THREAD SCROLLS INSIDE THE CARD so the box stays on screen with fifty messages above it —
     `.msg-body` is the widget's own scroller and is already in the `touch-action: pan-y` list, so
     this is the same element doing the same job on a second surface rather than a new one. It is
     scrolled to the newest by `dmFoot_`, booked from `startScreen_` with everything else a screen
     has running. */
```

### THE NAME IS THE PERSON, and the unread count rides on it — so the header says who you are reading rather than "3 of 7", which is the same judgement

in `dmPages_`

```
/* THE NAME IS THE PERSON, and the unread count rides on it — so the header says who you are
     reading rather than "3 of 7", which is the same judgement `PAGER.tools` makes about naming the
     widget and `PAGER.booking` about naming the session. */
```

### ---------- THE "MESSAGE EVERYONE" CARD WAS HERE

top level, before `dmFoot_`

```
/* ---------- THE "MESSAGE EVERYONE" CARD WAS HERE --------------------------------------------------
   An admin-only page at the foot of this column — one box, an "email it as well" tick and a Send —
   removed on "remove the note to everyone button", with its `cast-send` handler and the backend's
   `broadcast` action, so nothing is left posting to a door that is gone. Its two decisions outlive
   it and are what a rebuild should copy: a PAGE rather than a sheet, APPENDED so the column still
   opens on the newest conversation; and the e-mail off by default, because one press to a whole
   roster can spend `MailApp`'s daily quota that the booking confirmations come out of. */
```

### ---------- A CONVERSATION OPENS AT THE NEWEST MESSAGE, NOT THE OLDEST

top level, before `dmFoot_`

```
/* ---------- A CONVERSATION OPENS AT THE NEWEST MESSAGE, NOT THE OLDEST -----------------------------
   A THREAD SCROLLED TO THE TOP IS A THREAD OPENED AT LAST MONTH. Every messaging app opens at the
   bottom because that is where the thing you came to read is, and a scroller's natural state is the
   top — so this is the one line that has to say otherwise.

   `scrollHeight` RATHER THAN A LARGE NUMBER, and per element rather than per screen: a card may
   hold four messages and the next forty, and the foot of each is its own.

   BOOKED FROM `startScreen_`, which is the one list of what a screen has running — the note there
   records what happens to a job booked anywhere else. */
```

### A PICTURE LANDS AFTER THE SCROLL, and a photograph arriving 300px tall under a thread already at its bottom pushes the newest message out of sight.

in `dmFoot_`

```
/* A PICTURE LANDS AFTER THE SCROLL, and a photograph arriving 300px tall under a thread already
       at its bottom pushes the newest message out of sight. Each one re-asks once it has a size —
       but only while the thread is still at its end, so somebody reading back up is left alone. */
```

