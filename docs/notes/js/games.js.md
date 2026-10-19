# js/games.js

The full text of comments in `js/games.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — games.js ONE FILE, SPLIT.

top level, before `ttQuestion`

```
/* ==================================================================================================
   @family. — games.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   games.js is number 16 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- TIMES TABLES SPRINT

top level, before `ttQuestion`

```
/* ---------- TIMES TABLES SPRINT -----------------------------------------------------------------
   IT DESTROYED ITS OWN SCREEN ON THE FIRST LINE THAT RAN.

   `$('tt-question')` is the CONTAINER — the div holding the question, the answer box, the clock
   and the score. Setting `.textContent` on it replaced all four children with the string
   "7 × 8", so the input the next line reached for no longer existed. The question element is
   `tt-q`, one level in.

   Three more, each fatal on its own: the container was never un-hidden, so nothing would have
   shown even if it had survived; `tt-play` was un-hidden inside a parent that had just been
   hidden, which does nothing; and `endTimesTables` was called at zero seconds and has never
   existed, so the sixty-second mark threw a ReferenceError into a bare setInterval.
--------------------------------------------------------------------------------------------- */
```

### Checked on every keystroke, with no Enter to press.

in `startTimesTables`

```
/* Checked on every keystroke, with no Enter to press. "72" typed one digit at a time passes
     through "7", which is wrong for 8×9 and right for nothing — so a wrong number is never
     marked wrong, it is simply not yet right. A child typing the second digit of a correct
     answer must not be told they have failed. */
```

### The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle state — and a clock left running behind a screen that no longer has

top level, before `initTables`

```
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle
   state — and a clock left running behind a screen that no longer has a question on it would go
   on ticking into elements that have been thrown away. */
```

### Kept only if it beats the old one, and only for somebody signed in.

in `endTimesTables`

```
/* Kept only if it beats the old one, and only for somebody signed in. The server decides
     whether it stuck — `saveTtHighscore` returns the figure it actually holds, so a phone that
     was offline does not go on claiming a record that was never written. */
```

### ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED

in `endTimesTables`

```
/* ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED --------------------
           `USER` IS THE PLAYER'S OWN COPY AND `DATA.students` / `DATA.tutors` ARE WHAT THE HIGH
           SCORES ARE BUILT FROM. Writing one and not the other was invisible while the only
           reader was this card's own `Your best is`; with a board under it the two disagree on
           screen — a new record announced above a list that still shows the old one, until the
           next payload lands. `gameOver` in receipt.js already did this for Flappy Bird and this
           did not, which is why it is worth the lines rather than the assumption. */
```

### ---------- WHAT THE DISPLAY SAYS, TURNED BACK INTO ARITHMETIC

top level, before `calcNormalise_`

```
/* ---------- WHAT THE DISPLAY SAYS, TURNED BACK INTO ARITHMETIC ------------------------------------
   THE KEYPAD TYPES ÷ × − AND π, because that is what a calculator shows and what an exam paper
   prints. None of them are operators to a JavaScript evaluator, so they are translated here — once,
   next to the only line that needs it.

   THE MINUS IS THE ONE THAT WOULD HAVE BITTEN. `−` (U+2212) is not `-` (hyphen-minus); it looks
   identical at this size and parses as nothing at all, so `7 − 3` would have come back Error while
   reading perfectly correctly on screen. That is the worst shape of bug: right in front of you and
   invisible.

   BOTH SPELLINGS ARE ACCEPTED, so a sum typed on a hardware keyboard with `*` and `/` still works
   and anything already in the history keeps evaluating. */
```

### THE STATE. `at` is where the caret sits — an index BETWEEN characters, so 0 is before the first and expr.length is after the last.

in `initMiniCalc`

```
/* THE STATE. `at` is where the caret sits — an index BETWEEN characters, so 0 is before the
     first and expr.length is after the last. Everything below inserts and deletes there rather
     than at the end, which is the whole difference an arrow key makes. */
```

### Every finished sum, oldest first, and where we are in it.

in `initMiniCalc`

```
/* Every finished sum, oldest first, and where we are in it. `-1` means "not looking back",
     which is a different state from "looking at the newest" — pressing ▼ off the end has to
     return the working line, not hand back the last answer again. */
```

### ---------- THE BRACKET THE KEY OPENED, CLOSED FOR YOU

in `window._mcClick`

```
/* ---------- THE BRACKET THE KEY OPENED, CLOSED FOR YOU --------------------------------------
           REPORTED AS "calulator sin cos and tan doesnt really work". Measured: `sin(30)` is 0.5,
           `cos(60)` is 0.5 and `tan(45)` is 1, all correct. `sin(30` -- with no closing bracket --
           is **Error**, and that is the whole complaint: the `sin` key puts in `sin(` and every
           calculator anybody has held closes it for them. Press sin, 3, 0, = on a Casio and you get
           0.5; here you had to remember a bracket the machine had opened on your behalf.

           ONLY AT `=`, and only the ones left open, so nothing is added to what is on screen while
           it is being typed and an expression that is already balanced is untouched. */
```

### `window.math` IS NEVER LOADED BY ANYTHING HERE, measured across index.html and every file in `js/` -- so the branch below has never run and the fallback is

in `window._mcClick`

```
/* `window.math` IS NEVER LOADED BY ANYTHING HERE, measured across index.html and every
           file in `js/` -- so the branch below has never run and the fallback is what the
           calculator has always been. It stays because it is the right thing to use IF a maths
           library is ever added, and because deleting it would leave the fallback looking like a
           fallback for nothing. The arithmetic was proved on the path that actually runs. */
```

### AFTER AN ANSWER: a digit starts a new sum, an operator continues from the answer.

in `window._mcClick`

```
/* AFTER AN ANSWER: a digit starts a new sum, an operator continues from the answer.
       `5 + 3 =` then `× 2` is what almost everybody means, and clearing the 8 first would be the
       calculator throwing away what it had just told them. */
```

### ---------- THE TIMER

top level, before `timerTick`

```
/* ---------- THE TIMER ---------------------------------------------------------------------------
   IT DID NOTHING AT ALL. The toggle carried an `id` and no `data-do`, so the one delegated click
   handler never saw it; `timer-reset` had a `data-do` and no handler was ever registered; and
   there was no tick function anywhere — `paintTimer` drew a number that nothing decremented.

   IT ALSO USED TO STOP ITSELF. `initTimer` cleared the clock every time Tools was opened, so
   going to the feed to look at something and coming back reset a session halfway through. A timer
   that stops when you look away is not a timer, so the state lives outside the screen and only
   the drawing is redone.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE CALENDAR

top level, before `CAL_KINDS`

```
/* ---------- THE CALENDAR ------------------------------------------------------------------------
   A month, with what is ON it. An empty grid of numbers is a thing every phone already has; the
   reason to have one here is that it knows about the exams and the birthdays.

   The ARROWS were dead. `cal-back` and `cal-fwd` each carried a `data-do` and no handler was ever
   registered for either, so it has only ever been able to show this month.
--------------------------------------------------------------------------------------------- */
```

### ---------- EVERY DATE THE APP KNOWS, NOT TWO KINDS OF IT

top level, before `CAL_KINDS`

```
/* ---------- EVERY DATE THE APP KNOWS, NOT TWO KINDS OF IT ------------------------------------------
   ASKED FOR as part of *"calander and time table and availability ... it seems they clash"*. This drew
   the exams tab and birthdays and nothing else — so a family's sessions, the half term, the bank
   holiday the booking now skips and the festive afternoon they had been offered were all somewhere
   else in the app and none of them here, on the one surface that is ABOUT dates. Every kind below is
   READ, from the place it is written, and none of them is stored by the calendar:

     · YOUR SESSIONS — the session dates of your own jobs (`myJobs_`, `jobDates_`), so a bank holiday
       or a half term is simply a day without one.
     · TERMS AND HALF TERMS — `DATA.intervals`: a term's first and last day, every day of a half
       term, and the first and last day of a longer holiday (six weeks of dots says nothing).
     · BANK HOLIDAYS AND CLOSED DAYS — `DATA.closures`, the same list `computeSessionDates` steps over.
     · FESTIVE EVENTS — `DATA.festive`, what is on offer.
     · EXAMS — `DATA.exams`, which carries a student's own two dates from Settings now as well as the
       tab's rows, merged on the server with no duplicates (see `doGet`).

   A KIND IS ONE DOT AND ONE LINE OF THE KEY. `CAL_KINDS` is the order and the words, read by the
   dots, the key under the month and the sheet a tap opens — one list, three readers. */
```

### THE TERMS. A term is two dates that matter — it starts, it ends — and a dot on every weekday of it would cover the month; a half term is a week off and every

in `calendarMarks`

```
/* THE TERMS. A term is two dates that matter — it starts, it ends — and a dot on every weekday of
     it would cover the month; a half term is a week off and every day of it is the news; a longer
     holiday is its first and last day, for the term's reason. */
```

### ---------- AND UNTIL THE PAYLOAD IS IN, THE MONTH IS WAITING, NOT EMPTY

in `drawCalendar`

```
/* ---------- AND UNTIL THE PAYLOAD IS IN, THE MONTH IS WAITING, NOT EMPTY ---------------------------
     The terms, holidays, exams and sessions all come with the payload, so before it lands this drew a
     month with no mark on it — measured on 9 Oct with the payload held — which reads as a month with
     nothing in it. Nothing on the card said otherwise. So the days are drawn and veiled by the one
     loader (`loading_`, shell.js): the grid keeps its size under the dots, and when the payload's
     repaint draws it again with its marks it appears in exactly that box. The arrows still turn the
     month meanwhile; each month is drawn waiting until the marks are there to put on it. */
```

### CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so this cannot be null in practice.

top level, before `calView`

```
/* CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so
   this cannot be null in practice. It is guarded anyway: a null that is safe only because of an
   ordering assumption is the same shape as every other silent failure on the list. */
```

### NOT A LABEL AND A VALUE, which is why it is written out rather than built by `row`.

top level, before `CH_FILES`

```
/* NOT A LABEL AND A VALUE, which is why it is written out rather than built by `row`.
          The label carries a coloured dot and the value carries a second line naming whose exam it
          is — two pieces each, not one. A helper that took markup on both sides would be a helper
          that formats nothing, and every caller would be passing it the whole row anyway.
          Four shapes cover a sheet; the fifth is where a shared piece stops being shared. */
```

### ---------- CHESS, TWO PLAYERS ROUND ONE PHONE

top level, before `CH_FILES`

```
/* ---------- CHESS, TWO PLAYERS ROUND ONE PHONE ------------------------------------------------------
   ASKED FOR AS "make chess 2 player. also make it more stable and better in recognition." Measured
   before anything was written, and the second half was worse than it sounded: THE BOARD COULD NOT BE
   PLAYED AT ALL. `drawChess` drew sixty-four `<span data-sq>` with no `data-do`, the tap handler it
   was written for (`chessTap`) had been deleted as dead, and the dispatcher only answers `data-do` —
   so a tap on a piece did nothing, on every phone, while the line under the board said "Your move".
   `check/press.js` could not see it, because a control with no action is not in its queue.

   So every square is a `<button data-do="chess-sq">`. That is also what makes a swipe safe: a drag
   that starts on the board produces a click, and `PRESS_MOVED` in shell.js swallows exactly that
   click before the dispatcher sees it — so scrolling past the board never picks a piece up.

   EVERYTHING ON THE BOARD IS DRAWN FROM STATE — the position, the picked square, the pending
   promotion, the last move — and never left on the DOM by a handler. A repaint rebuilds the card,
   and a highlight that lived only in the markup would vanish while the selection it showed stayed:
   the `REEL_HELD` fault. And it draws by CLASS rather than by id, because a starred chess widget is
   a second board on the Saved column and `$()` would only ever find the first.

   NO FLIP. The board stays white-at-the-bottom and the line above it says whose move it is, in
   words. Turning the board every move is what a two-player app on a table does; on a phone held by
   one person and passed across, it is the picture jumping under the hand reaching for it. */
```

### THE GAME IS OVER, and why.

top level, before `chessEnd_`

```
/* THE GAME IS OVER, and why. Mate and stalemate come from the rules; the fifty-move rule and bare
   kings are the two draws a kitchen-table game actually reaches — without them two kings chase each
   other round an empty board for ever with the line underneath saying whose move it is. */
```

### PROMOTION IS ASKED, NOT ASSUMED.

in `drawChess`

```
/* PROMOTION IS ASKED, NOT ASSUMED. The queen is first and is what nearly everybody wants, but an
     under-promotion to a knight is the one move that sometimes wins, and a board that quietly
     queens has taken the decision off the player. The row replaces the controls while it is up, so
     there is nothing else to press. */
```

### A TAP. Three things it can mean and they are tried in the order a player means them:

top level, before `i`

```
/* A TAP. Three things it can mean and they are tried in the order a player means them: the second
   tap of a move, picking a piece of your own, and anything else — which says WHY nothing happened
   rather than doing nothing, because a board that ignores a tap reads as a board that missed it. */
```

### UNDO takes back one move, either side's — two people at one board agree on that out loud, and an app that refused it would be stricter than the table.

top level, before `CHESS_PROMO`

```
/* UNDO takes back one move, either side's — two people at one board agree on that out loud, and an
   app that refused it would be stricter than the table. With a promotion half-chosen it cancels
   that instead, which is the smaller undo and the one being reached for. */
```

### ---------- THE REELS

top level, before `feedColours`

```
/* ---------- THE REELS ---------------------------------------------------------------------------
   One fact at a time, full card, tap for another.

   IT DREW NOTHING — a black rectangle, which is what `--sunk` looks like in an empty div. The
   first line called `tpl.feedSlide(it)` and the next `feedPicture(it.pic)`, and neither `tpl` nor
   `feedPicture` was carried over from the markup that burned. The ReferenceError went into
   `wake`'s catch, which is there so one broken game does not take the other three with it — and
   which turns a crash into a blank.

   NO PHOTOGRAPH. The old version fetched one per card from a search term: a key, a rate limit, an
   attribution line, and a card that goes blank the day the key expires. The background is DRAWN
   from the fact's own subject instead — the same words used as a seed rather than as a query — so
   it is instant, works with no connection, and is the same every time you see that fact.
--------------------------------------------------------------------------------------------- */
```

### A colour from a string.

top level, before `feedColours`

```
/* A colour from a string. Two hues a little apart so the gradient has somewhere to go, and the
   SUBJECT decides them — so every Space card is a family of blues and every Animals card its own
   green, without anybody choosing ninety colours. */
```

### THE THIRD COLOUR IS TEXT — the subject's label — so its lightness is chosen against the card's lightest stop for EVERY hue, not by eye on one.

in `feedColours`

```
/* THE THIRD COLOUR IS TEXT — the subject's label — so its lightness is chosen against the card's
     lightest stop for EVERY hue, not by eye on one. At 62% it passed on the greens and failed on the
     blues and purples, down to 3.42:1 at hue 240; `check/ui.js` caught it only when a Study fact
     happened to be dealt, which is why it came and went between runs. Swept over all 360 hues: 68%
     clears 4.5 by a hair, 70% clears it everywhere with the worst at 5.02:1. */
```

### ---------- WHERE A CLIP IS, AND THE TWO KINDS THERE ARE

top level, before `CLIP_EMBED_ONLY`

```
/* ---------- WHERE A CLIP IS, AND THE TWO KINDS THERE ARE --------------------------------------------
   A `clip` IS A VIDEO FILE — a path beside this site (`data/reels/x.mp4`) or a whole `http(s)` URL
   to one. That is the one thing a `<video>` can mute, autoplay, loop and pause, which is what every
   other line of the Reels column is written against.

   THERE USED TO BE TWO MORE KINDS AND BOTH ENDED IN SOMEBODY ELSE'S PLAYER IN AN IFRAME. A Google
   Drive id climbed a ladder of two download addresses and then fell to Drive's `/preview` embed —
   which on a real phone is where it always landed (a screenshot showed Google's scrubber, CC, 1x and
   a black letterbox). An Instagram reel had no address a `<video>` could read at all and went
   straight to Instagram's embed. Both: no autoplay, no mute, no pause from this column, and another
   company's chrome round the picture.

   REMOVED ON THE OWNER'S WORD — "remove the embedded reels. they suck." — and removed whole rather
   than switched off: `clipFrame_`, `reelFrame_`, the iframe half of `clipsStop_` and `reelTurn_`, and
   the download ladder are all gone. A dormant embed route behind a flag is a second mode nothing
   presses, which is `orderPrints`.

   SO A ROW THAT CAN ONLY BE EMBEDDED IS NOT A REEL AND IS DROPPED FROM THE LIST, rather than drawn as
   a slide that never plays. `clipPlayable_` is the one test and `clipsNow_` filters on it, so the
   column, the "One more thing" widget and the pager all agree about what counts. `check-reels.js`
   refuses such a row in `FEED_FACTS` outright, so the code's own list cannot grow one again.

   ---------- AND A YOUTUBE ADDRESS IS THE SECOND KIND, BECAUSE ITS PLAYER TAKES ORDERS -------------
   ASKED FOR ON 9 OCT WITH A SHORT'S ADDRESS: *"i want to add this to reels, maybe embedd? or work
   fine without? i just want it to look like other reels"*. A YouTube video has no address a
   `<video>` can read, so it is the embed or nothing — and that sounds like the thing that was
   removed. It is not, and the difference is the whole of the owner's complaint about the other two:
   what sucked was a player THIS COLUMN COULD NOT DRIVE. Drive's and Instagram's would not start by
   themselves, would not be muted or paused from outside, and drew their own controls.

   YOUTUBE'S IFRAME PLAYER IS DRIVEN BY MESSAGES. With `enablejsapi=1` it answers `postMessage` —
   `playVideo`, `pauseVideo`, `mute`, `unMute` — says what it is doing (`onStateChange`) and what went
   wrong (`onError`), and every browser lets it start by itself muted. So a Short gets everything an
   mp4 reel has, done by the app: it plays when it is the reel on screen and stops when it is not, a
   tap holds it and draws the ▶, the app's own Sound tile speaks, and its own first frame is on the
   slide from the moment you arrive. `reelYtPlay_` and the functions round it in posts.js are that half.
   YouTube's buttons are never pressed: a clear layer over the player takes every touch.

   THE ADDRESS IS READ BY `vidYouTubeId_`, the Videos card's own parser below, and not by a second
   one here — every shape a YouTube address is copied in (watch, Shorts, youtu.be, embed) and an id
   of exactly eleven characters. A YouTube address it finds no video in (a channel, a playlist, a
   search) is refused rather than handed to a `<video>` to fail in, which is what an `https` address
   that is not a file used to get.

   AND A DRIVE ADDRESS IS REFUSED AS AN ADDRESS, not only as a bare id. `data/reels/README.md`
   measured it: Drive answers a `<video>` with a redirect or an HTML page, never the bytes, so
   `https://drive.google.com/…` was let through here as "a whole URL to a video file" and drawn as a
   slide that could only ever be dark.

   ANY SUBDOMAIN, NOT ONLY `www.` — the YouTube test beside it already took any. `m.instagram.com`
   is what a phone's share sheet copies, and it passed as an `http` file and drew a slide that never
   played (review, 9 Oct: a mutant row of exactly that went through `check-reels.js` green). */
```

### A SCHEME MEANS A WHOLE ADDRESS, and only http(s) is a file a browser will fetch into a `<video>`.

in `clipPlayable_`

```
/* A SCHEME MEANS A WHOLE ADDRESS, and only http(s) is a file a browser will fetch into a
     `<video>`. No scheme and a slash is a path into this repository. No scheme and NO slash is a
     Drive id — the one kind that can only ever be embedded — and is refused. */
```

### A FILE'S ADDRESS, FOR A `<video>`.

top level, before `clipSrc_`

```
/* A FILE'S ADDRESS, FOR A `<video>`. A YouTube clip has none — it is never a `<video>`'s `src` — so
   this answers '' for one, which is `reelPlay_`'s "nothing to fetch" and marks it dead rather than
   asking a browser to download a web page. */
```

### A SLIDE WITH NO WORDS DRAWS NO WORDS.

in `feedSlide`

```
/* A SLIDE WITH NO WORDS DRAWS NO WORDS. Every fact has a heading, so for fifty-eight of these
     this branch never fires; a clip does not need one, and an empty `<h3>` over a video is a black
     bar with a subject label floating in it. See the note on the fifth field in chess.js. */
```

### `has-photo` WHEN THERE ARE FRAMES, NOT WHEN THERE IS AN ELEMENT.

in `feedSlide`

```
/* `has-photo` WHEN THERE ARE FRAMES, NOT WHEN THERE IS AN ELEMENT. It was on the first paint
     here, on the argument that a video is a picture that moves — and a video that has not arrived
     is not a picture at all: the class hides the subject's initial and whitens the words over a
     slide that is still its own gradient. `reelPlay_` adds it on `loadeddata`, which is the same
     moment and the same reason the photograph branch adds it in `reelsWatch_`. Caught on a
     screenshot, which this file has now recorded as the last word on a drawing five times.

     NO `src` YET. Fifty-eight videos asked for at once is fifty-eight downloads for the one you are
     looking at, which is the same arithmetic `reelsWatch_` already makes about the photographs —
     `preload="none"` is a hint browsers are free to ignore and an absent `src` is not. */
```

### ---------- THE FIRST FRAME ARRIVES FIRST, AND THAT IS MOST OF "IT TAKES LONG TO LOAD"

in `feedSlide`

```
/* ---------- THE FIRST FRAME ARRIVES FIRST, AND THAT IS MOST OF "IT TAKES LONG TO LOAD" --------
       REPORTED AS "the reel isnt loading. or it takes long to load". Measured, the two clips in this
       repository are 576x576, 104 and 92 seconds long, 7.3 and 7.9 MB — so on a phone there really
       are several seconds between the tap and the first frame, and what was on the screen for all of
       them was `.feed-art`'s gradient with a letter on it. A column whose whole content is a video,
       showing no video, is indistinguishable from a broken one. That is this repository's oldest
       shape wearing a stopwatch: *it has not arrived* drawn exactly like *there is nothing here*.

       A POSTER IS ~20KB AND IT IS THE CLIP'S OWN FIRST FRAME, so the slide is the right picture
       immediately and the video fades in over it when it is ready. Nothing about the clip is
       changed: re-encoding the owner's video to make it smaller is a lossy edit to their material
       and a judgement that is theirs, and it is written down in `data/reels/README.md` instead.

       DERIVED FROM THE CLIP'S PATH, NOT A SIXTH FIELD. `x.mp4` beside `x.jpg` is one convention
       with nothing to keep in step — the `images` note's argument against a numbered column, one
       step along — and `check-reels.js` prints any clip missing one. Only for a path: a Drive id
       has no poster to derive and an absolute URL is somebody else's server. A poster that 404s
       draws nothing, which is exactly what this slide did before, so it degrades to the old
       behaviour rather than to a hole. */
```

### `has-photo` FROM THE FIRST PAINT WHERE THERE IS A POSTER, and only there.

in `feedSlide`

```
/* `has-photo` FROM THE FIRST PAINT WHERE THERE IS A POSTER, and only there. The note over
       `reelPlay_` says why that class waits for `loadeddata`: the scrim and the white words over a
       slide that is still its own gradient are furniture for a picture that has not arrived. A
       poster IS the picture arriving, so the same sentence puts the class on now — and a clip with
       no poster still waits, exactly as before. */
```

### ---------- A YOUTUBE SHORT'S SLIDE: ITS OWN PICTURE FIRST, THE PLAYER WHEN IT IS REACHED

top level, before `YT_POSTERS`

```
/* ---------- A YOUTUBE SHORT'S SLIDE: ITS OWN PICTURE FIRST, THE PLAYER WHEN IT IS REACHED ----------
   THE POSTER IS THE SHORT'S OWN THUMBNAIL, from `i.ytimg.com`, so the slide is a picture from the
   moment you arrive — the same promise the mp4 reels' `x.jpg` keeps, and for the same complaint ("the
   reel isnt loading"). `has-photo` from the first paint for that reason. NO REFERRER: the picture
   needs nothing from this page, so it is told nothing about it.

   SAID PLAINLY, BECAUSE IT IS A CHOICE AND THE VIEWERS ARE CHILDREN — the Videos card says the same
   of its thumbnails. The Reels column is drawn at boot, and with three clips its first three pages
   hold every one, so EVERY LOAD fetches this picture from `i.ytimg.com`, Reels opened or not. No
   cookie (it is YouTube's cookieless image host) and no referrer, but the device's address reaches
   Google. Kept, because the poster in the markup is what makes the Short a picture on arrival like
   the mp4 reels: set later, from `reelsWatch_`, it would be the gradient for the first moments of
   every visit. Taking it back is the address written here as `data-src` and moved to `src` by
   `reelTurn_` for the page in front and its neighbours (review, 9 Oct, note 319).

   THREE SIZES, TRIED IN ORDER. `oar2.jpg` is the thumbnail at the video's Original Aspect Ratio — for a
   vertical Short, a portrait picture that fills a portrait slide. Not every video has one, so a 404
   falls to `hqdefault.jpg` and then `mqdefault.jpg`, which every video has: a landscape frame, cover-
   cropped to its middle, which for a Short is the Short (YouTube pillarboxes it inside the landscape
   frame and the crop lands inside the pillars). Stepped by one capture-phase listener for the whole
   document, `postVidFail_`'s shape — an `error` does not bubble, and a listener added after the
   markup is drawn can miss it.

   AND YOUTUBE'S "NO SUCH PICTURE" IS A PICTURE. A missing thumbnail is answered with a 120x90 grey
   placeholder rather than nothing, so a browser draws it and reports a load: a small grey box
   stretched over the whole slide. Anything that narrow is treated as the miss it is.

   THE PLAYER IS NOT IN THIS MARKUP. `.feed-yt` is where `reelYtPlay_` (posts.js) puts it when the
   slide is the one on screen — never fifty-eight at once, the rule this file writes about the
   videos' `src`. The veil inside it is the layer that keeps every touch for the column.

   "WATCH ON YOUTUBE" IS DRAWN NOW AND SHOWN ONLY IF THE PLAYER CANNOT PLAY, so nothing on the slide
   moves when it appears. A Short's own address when the clip was a Short, the watch page otherwise —
   the id alone, so a `?si=` somebody pasted into the sheet goes nowhere. */
```

### THE NEXT RUNG, OR NONE.

top level, before `feedPosterNext_`

```
/* THE NEXT RUNG, OR NONE. With every size refused the slide goes back to its own gradient and letter —
   the floor every reel has — rather than keeping the class that says a picture is there. Unless the
   player is already playing, in which case the picture is the video and nothing changes. */
```

### CONNECT 4, OTHELLO AND HERD MENTALITY THREE GAMES, ONE SHAPE.

top level, before `C4_W`

```
/* ==================================================================================================
   CONNECT 4, OTHELLO AND HERD MENTALITY

   THREE GAMES, ONE SHAPE. Each has an `init` in here, drawn into an id its markup already contains
   — the same arrangement Flabby Pird and Times Tables use, because a fourth way of starting a game
   is a fourth thing to remember when one of them stops working. Connect 4 and Othello are `WIDGETS`
   entries in map.js that name theirs; Herd Mentality is a game inside Word games now, and the
   `herd` row of `WORD_GAMES` names `initHerd` instead.

   NOTHING RUNS BETWEEN TURNS. No animation loop, no timer, no interval — the board is redrawn when
   somebody taps and sits still otherwise. That is why none of these three needs a `stop`, and it is
   worth saying out loud: `stop` exists for Flabby Pird because sixty frames a second behind a screen
   nobody is looking at is a flat battery. A board that only moves when tapped costs nothing parked.
   STILL TRUE NOW CONNECT 4'S COUNTERS FALL: the drop is a CSS animation on the one counter just
   played, which the browser runs once and finishes — there is nothing here to start or to stop.

   THE BOARDS ARE BUTTONS, NOT A CANVAS. A canvas would mean hit-testing taps against pixel
   coordinates and redrawing to show a hover; a grid of real `<button>`s gets the tap target, the
   keyboard, the focus ring and the press animation from the stylesheet, for free and correctly.
================================================================================================== */
```

### ---------- CONNECT 4

top level, before `C4_W`

```
/* ---------- CONNECT 4 ----------------------------------------------------------------------------
   SEVEN COLUMNS, SIX ROWS, and the whole column is the target rather than the cell. You do not
   choose a square in this game — you choose a column and gravity chooses the square, so a grid of
   42 taps would be offering 35 choices that do not exist.

   THE OPPONENT IS THREE RULES IN ORDER: win if it can, block if it must, otherwise play towards the
   middle. That is beatable by anybody who is paying attention and unbeatable by anybody who is not,
   which is the right difficulty for a game somebody opens for four minutes between lessons.
--------------------------------------------------------------------------------------------- */
```

### THE TWO SIDES, NAMED ONCE.

top level, before `C4_NAME`

```
/* THE TWO SIDES, NAMED ONCE. The board draws `p1`/`p2` and the line under it says the word — two
   spellings of one fact is what this repository writes about `handle` and `username`, and here it
   would be a red disc announced as yellow. */
```

### REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS.

in `initConnect4`

```
/* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. Coming back to a board you left half-played
     sounds kind and is not: the widget is reopened by a swipe, so "where was I" would be answered
     by a game you had forgotten starting. */
```

### FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter.

top level, before `c4Line_`

```
/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. Eight would be
   double-counting: a line and its reverse are the same line.

   IT RETURNS THE SQUARES, NOT A YES. It answered true or false, so "Red wins." appeared under a
   board that did not say where — and on a full board of 42 discs, finding the four that did it is
   a game of its own. Now it hands back every square of every line of four or more through the
   counter just played (a drop can finish two lines at once, or join two and one into five), and an
   empty list is the old false. */
```

### ---------- `c4Reply_` WAS HERE, AND IT WAS THE OPPONENT

top level, before `c4Paint`

```
/* ---------- `c4Reply_` WAS HERE, AND IT WAS THE OPPONENT ------------------------------------------
   THREE RULES IN ORDER — win if it can, block if it must, otherwise play towards the middle — and
   the note above this block argued it was the right difficulty for four minutes between lessons.
   Asked for outright: "connect 4 should be not against pc but 2 player."

   IT IS A BETTER GAME ON THIS APP THAN ON A DESKTOP, which is the half worth keeping: a phone on a
   table between two people is exactly what a board game is, and the thing this widget could never
   be is a second person. `Tools` and `Games` are columns you open beside somebody, and Articulate
   and Charades already work that way.

   THE AI IS DELETED RATHER THAN SWITCHED OFF. A dormant opponent behind a flag is a second mode
   nothing presses, which is `orderPrints` — and the three rules are four lines somebody can write
   again if a solo mode is ever wanted. */
```

### ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED

top level, before `c4Paint`

```
/* ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED --------------------------------------
   ASKED FOR AS "refine connect 4 add dropping animation of counters." A counter used to appear in
   its square: the board is rebuilt through `innerHTML` on every tap, so there was no moment between
   the empty square and the full one for anything to move in.

   SO THE ONE NEW COUNTER IS MARKED, AND CSS DROPS IT. `c4-new` goes on the square just played and
   `--c4-fall` says how many rows it falls — its own row plus one, so it starts one row above the top
   edge, where `.c4`'s `overflow: hidden` keeps it out of sight until it enters. The rebuilt board is
   otherwise identical, so only that counter moves; the forty-one that were already there do not
   twitch. The fall, the small bounce and the reduced-motion exemption are all in style.css.

   `last` IS SPENT BY THE PAINT THAT SHOWS IT. A board painted again for any other reason — a
   refused tap on a full column, a repaint — must not drop the same counter twice, so the mark is
   read once here and cleared.

   THE WIN IS RINGED (`c4-win`) because "Red wins." under a board does not say where. Both class
   names carry the `c4-` prefix for the reason the maze's walls now do: a bare `.new` or `.win` is a
   name any later component can take without knowing, and the maze found out what that costs.

   THE TURN HAS A DISC BESIDE IT, in the side's own colour — two people at one phone glance at the
   line under the board to see whose go it is, and a red disc is read before the word "Red" is. Not
   on a draw, which is nobody's. `aria-hidden`, because the sentence already says the colour. */
```

### ---------- OTHELLO

top level, before `OTH_N`

```
/* ---------- OTHELLO ------------------------------------------------------------------------------
   EIGHT BY EIGHT, four in the middle to start, and a move is only legal if it brackets a line of the
   opponent between the square you played and one of yours. That rule is the whole game, so it is
   written once — `othFlips_` returns the squares a move would turn, and everything else asks it:
   the legality of a tap, the list of hints, and the flipping itself.

   PASSING IS PART OF THE RULES, NOT AN ERROR. A player with no legal move misses a turn, and if
   neither can move the game is over — which is how Othello ends with the board not full, and the
   reason the end test is "nobody can move" rather than "no empty squares".
--------------------------------------------------------------------------------------------- */
```

### ---------- `othReply_` WAS HERE, AND SO WERE THE RINGS

top level, before `othPaint`

```
/* ---------- `othReply_` WAS HERE, AND SO WERE THE RINGS -------------------------------------------
   CORNERS FIRST, THEN THE BIGGEST FLIP — a real little opponent, and the whole of it is deleted for
   the reason `c4Reply_` is: "should be 2 player not against cpu". Othello across a table is the game
   Othello is.

   AND THE HINTS WENT WITH IT, asked for in the same breath — "dont show the locations players can
   pic". They were argued for as teaching, and the argument does not survive the second player:
   `othMoves_(cells, 1)` is one side's answer, drawn on a board the other side is reading. Working
   out where you may play IS Othello.

   SO EVERY EMPTY SQUARE IS PRESSABLE and an illegal one says why. It was `disabled` unless it was
   a legal move, which is the ring in another form — a screen reader reading the board would have
   heard exactly the same list. A press that does nothing at all is what `check/press.js` exists to
   report, and a line under the board answers the press without answering the question. */
```

### ---------- HERD MENTALITY

top level, before `HERD_BUILTIN`

```
/* ---------- HERD MENTALITY -----------------------------------------------------------------------
   ONE QUESTION AT A TIME, SHUFFLED. The game is that everybody answers out loud and you score by
   matching the room rather than by being right — so the app's whole job is to hand out a question
   and get out of the way. No timer, no scoring, no turn order: those live at the table, and putting
   them on the phone would make somebody operate the app instead of playing.

   SHUFFLED ONCE, THEN DEALT. Picking at random each tap repeats — with 30 questions the chance of a
   repeat inside ten taps is better than four in five — and a repeat reads as the app being broken.
   A shuffled pack cannot repeat until it is exhausted, and then it reshuffles and says so.

   THE SHEET IS THE AUTHORITY AND THE CODE IS THE FALLBACK, which is the pattern `brand()` sets for
   everything here: fill the `herd` tab and these are replaced without a deploy; leave it empty and
   the game still works. An empty tab must never produce an empty game.
--------------------------------------------------------------------------------------------- */
```

### ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT --

in `HERD_BUILTIN`

```
/* ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT --
     THE COUNT WAS THE COMPLAINT and the deck was half of it: twenty questions is a deck you
     reach the end of in a lesson, which is what made the round counter under it true enough
     to be annoying. A hundred is a number nobody reaches.

     TEN OF THESE WERE THROWN OUT BEFORE THEY GOT HERE, by a reviewer that had to try to
     refute the deck rather than approve it, and every one of the ten is worth knowing:
     `Name a colour` and `Name a shape` have nothing to decide (blue, and circle-or-square);
     `Name something you would find in a library` has exactly one answer; `Name a reason a
     train is late` rewards knowing rather than guessing, and splits an adult from a child;
     `Name a school trip everybody goes on` and `Name a pudding they serve at school` are
     both the rule about never asking a child what their family has, in a costume; and four
     were near-duplicates of cards already above them. A question with one obvious answer is
     not a herd question, because there is no herd to match. */
```

### FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`.

top level, before `herdShuffle_`

```
/* FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`. The sort trick is the famous wrong one: the
   comparator is inconsistent, so the result is neither uniform nor stable and some browsers barely
   move the list at all. Twelve characters more for a shuffle that is actually a shuffle. */
```

### THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING.

in `herdPack_`

```
/* THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING. `|| []` then a length test rather than `||` on
     the array itself: an empty tab arrives as an empty array, which is truthy, so it would replace
     the built-ins with nothing and leave the game blank. */
```

### ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE

top level, before `initHerd`

```
/* ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE ------------------------------
   REPORTED AS "herd mentality shouldnt be that 20 question round thing. should be much simpler,
   just questions on random. and random each time."

   THE COUNTER WAS THE WHOLE OF IT. The deal was already a Fisher-Yates shuffle and already
   reshuffled at the end, so the questions really were random — and the card said `3 of 20 · round
   2` underneath them, which is a scoreboard for a game that has no score and turns an endless
   deal into a twenty-question test you are part-way through. A number on screen is a claim that
   the number matters.

   SO THE COUNT IS GONE AND THE DEAL IS UNCHANGED. Shuffled, dealt one at a time, reshuffled when
   it runs out — which with five hundred questions is a thing nobody reaches in a lesson. The shuffle
   is still Fisher-Yates and the reason is still the one above it: a bag beats picking at random
   every tap, because picking at random repeats, and a question you have just answered coming
   straight back is the one thing that reads as broken. */
```

### ---------- MAZE

top level, before `MAZE_N`

```
/* ---------- MAZE -------------------------------------------------------------------------------
   A GRID, FOUR WALLS PER CELL, AND EXACTLY ONE WAY THROUGH. Carved by a depth-first walk that never
   revisits a cell, which is what makes the result a TREE: between any two squares there is one path
   and no loops, so the maze is always solvable and never has a shortcut somebody could stumble onto.

   IT IS NOT SWIPED, AND THAT IS THE ONE DESIGN DECISION WORTH THE SPACE. Up, down, left and right
   are exactly the four gestures this app navigates by -- a maze that read them would fight the
   pager on the one screen it lives on, and the loser would be the swipe, which is how you get to
   every other widget. `touch-action` cannot help: the column and the card need the same four
   directions. So it is a pad of four buttons, each a real fingertip, and the arrow keys for anybody
   on a keyboard. CLAUDE.md records what a blanket `touch-action` cost on the notepad; this is the
   same argument made before rather than after.

   THE SHORTEST WAY IS COUNTED, NOT GUESSED. A breadth-first walk from the entrance gives the fewest
   moves that can possibly solve it, so "out in 52, the shortest way is 38" is a fact about the maze
   rather than a score invented to have one. It is computed when the maze is built, so finishing
   costs nothing.

   THE TRAIL IS THE WHOLE PLAYABILITY ON A PHONE. Eleven squares across a card is about 24 pixels
   each, and without a mark of where you have been a dead end looks exactly like a corridor you have
   not tried. Faint, because it is a memory aid rather than part of the maze.
--------------------------------------------------------------------------------------------- */
```

### ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze`

top level, before `initMaze`

```
/* ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze` ------------------------------
   IT WAS REBUILT FROM NOTHING EVERY TIME THE WIDGET STARTED, for the reason `initConnect4` gives:
   the widget is reopened by a swipe, so a half-walked maze would be answering "where was I" about a
   game you had forgotten starting. That argument is about a swipe. What it also caught was a
   REPAINT — `startScreen_` starts every widget on the column again whenever a payload lands or
   anything saves — and measured, a repaint mid-walk dealt different cells and put you back at the
   top left with nought moves, under a finger that was halfway to the exit. Word Search, Scramble
   and Scrabble all keep theirs; this was the one that did not.

   SO `start` KEEPS A MAZE THAT IS STILL BEING WALKED and deals only when there is none or the last
   one is finished — a finished maze has nothing left to do but be replaced, and the next time the
   column starts is the natural moment. `New maze` is the one thing that throws a walk away, which
   is the one thing that should. */
```

### NOTHING SAID AT THE START, because the line under the heading already says where you are going and this sat under it repeating it word for word -- which is the

in `mzDeal_`

```
/* NOTHING SAID AT THE START, because the line under the heading already says where you are going
     and this sat under it repeating it word for word -- which is the fault CLAUDE.md records where
     every widget printed its own name twice. It speaks when there is something to say. */
```

### A WALL STOPS YOU AND SAYS NOTHING.

in `mzMove_`

```
/* A WALL STOPS YOU AND SAYS NOTHING. Every other game here answers an illegal move by ignoring
     it; a maze that announced "there is a wall there" would be saying what the screen already
     shows, once per attempt, which is most of playing one. */
```

### THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`.

in `mazePaint`

```
/* THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`. Reported as
         "maz game is glitched." The word search arrived with its grid on the bare class `.ws` —
         `display: grid`, a top margin and a max width — and every maze cell with a south wall
         carried `ws` too, so 71 of 121 cells became small grids of their own: 16.6px tall in a
         24.7px row, doubled walls, walls that did not meet, gaps in the outer edge and a squashed
         gold square. Nothing threw and nothing overflowed. A two-letter class with no prefix is a
         name any later component can take without knowing, so the prefix is the fix rather than
         renaming the word search: the maze's own names now say whose they are. */
```

### NOT A LIST OF 121 SQUARES TO A SCREEN READER.

in `mazePaint`

```
/* NOT A LIST OF 121 SQUARES TO A SCREEN READER. The cells are decoration for the one fact that
     matters, which is where you are and how far there is to go — so the grid says that in a
     sentence and the squares are hidden from it. */
```

### THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU.

top level, before `mzInFront_`

```
/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU. Guarded on the press not
   being inside a field — arrows in a textarea move the caret, and a game stealing that would break
   typing on a screen it is not even on.

   "IN FRONT OF YOU" WAS `$('maze-grid')` EXISTING, AND IT EXISTS ALMOST EVERYWHERE. All of the
   Games column's pages are built, it is drawn whenever Tools or Saved is beside you, and its
   markup stays in the document once drawn. Measured: two arrow presses on the Find column moved a
   maze nobody could see. So it asks `dropOnFront_` in book.js — "on the screen you are on, on the
   page in front of you", which is exactly this question; it was written for the dropdown panel and
   outlived it (note 315), so there is still one copy of it — and asks it of every copy of the grid,
   because a starred maze is on the Saved column too.

   AND ONE KEY IS ONE MOVE. The pager listens for the same four keys on `window`, which this
   `document` listener runs before — and measured on the maze page, ArrowDown walked the maze AND
   turned the column to the next widget. So while a maze is being walked in front of you the arrows
   are the maze's, `stopPropagation` keeps them from the pager, and that holds when a wall stops the
   move too: a key that moved you on one press and threw you off the page on the next would be
   worse than either. A FINISHED maze gives them back, so arrowing away from "Out in 38" works. */
```

### SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order.

top level, before `SS_BANDS`

```
/* ==================================================================================================
   SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order.

   ASKED FOR AS "Sentence Scramble - Groups race to arrange cut-up paper words into a grammatically
   correct sentence." The paper version is a sentence cut into words with scissors, and that decides
   what a chip carries: THE WORD AS IT WAS PRINTED, capital letter, comma and full stop included. A
   strip of paper keeps its punctuation, and the capital on the first word and the full stop on the
   last are the two clues every child uses first — they are part of the game, not a giveaway.

   ONE AREA OF CHIPS THAT NEVER MOVES, and the sentence being built written out above it. Two areas
   — a pool and a line the chips travel into — is the paper version laid out faithfully and it is two
   blocks of 44px rows on a card a phone has 534px for; and a chip that leaves the pool reflows every
   chip after it, so the word your finger was going for next has moved. A used chip stays where it
   was, dimmed, and tapping it again takes that word back out of the sentence. Nothing jumps.

   MORE THAN ONE RIGHT ORDER IS A REAL CASE, and the owner's brief says so: a sentence whose words can
   be validly arranged more than one way must accept every one of them or not be in the list. An
   entry that is an ARRAY is the sentence followed by its other valid orders, and `ssRight_` accepts
   any of them. `check-widgets.js` refuses an alternative that is not the same chips, because an
   alternative that uses a word the pool does not have is one nobody can ever build.

   WHAT WAS WEEDED OUT, so the next sentence added is held to the same rule. A sentence where two
   noun phrases can swap and still make sense ("The teacher thanked the student"), a floating adverb
   ("quickly", "loudly", "carefully" mid-sentence), an adjective that fits either noun, or two names
   in symmetric roles — each of those is a sentence with a second right answer that a child would be
   told is wrong. Each was either rewritten until only one order makes sense, or listed with its
   alternative. A grammatical NONSENSE order ("The oven took the bread out of the baker") is marked
   wrong, and that is the right answer: the brief is a sentence that is correct, not merely parsed.

   NO TIMER AND NO SCORE, for the reason Herd Mentality gives: "Groups race" is the people at the
   table racing each other, and the race is theirs to run. The app deals, checks, and deals again.

   THE SENTENCE SURVIVES A REPAINT, which is Scrabble's rule: `repaint` runs whenever a payload lands,
   and a half-built sentence that dealt itself again would throw away what somebody had tapped. New
   sentence or Skip is the only thing that throws one away.
================================================================================================== */
```

### NO CHIPS ONCE IT IS RIGHT.

in `box.innerHTML`

```
/* NO CHIPS ONCE IT IS RIGHT. The strip above says the whole sentence, and a pool of fourteen
       dimmed chips under it is fourteen things that look pressable and do nothing — and at 320px
       they were what shrank the card to 88% to fit. */
```

### NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM:

top level, before `b`

```
/* NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM: one after a sentence is right, the
   other to give up on one that is not. Two names so each button says what it is for — and "Skip"
   rather than "New sentence", which wrapped onto two lines beside Check at 320px. */
```

### WORD SEARCH — a grid of letters with a list of words hidden in it.

top level, before `WS_DIRS`

```
/* ==================================================================================================
   WORD SEARCH — a grid of letters with a list of words hidden in it.

   ASKED FOR AS "He also used to like mazes and word searches". The maze was already here.

   A TAP ON THE FIRST LETTER AND A TAP ON THE LAST, NOT A DRAG, and the maze is the precedent for why.
   Up, down, left and right are the four gestures this app navigates by, so a word search that read a
   finger dragged across the grid would fight the pager on the one screen it lives on — and the only
   way to win that fight is `data-noswipe` over the whole grid, which is most of the card, which is a
   card you cannot swipe off. The pen pad pays that price with a padlock you have to press first; a
   word search would have to pay it on every word. Two taps cost nothing: a tap is a click, the app
   already tells a click from a drag (`PRESS_MOVED` in shell.js swallows the click a swipe produces),
   so a swipe that starts on the grid still turns the page and arms nothing. It also works with a
   mouse, a pen and a keyboard, which a drag would have had to be written three times for.

   A CELL CANNOT BE 44px, which is the maze's and Scrabble's arithmetic: ten of them is 440px and the
   narrowest phone here is 320. `ACCEPTED_TAP` in check/ui.js carries the numbers. What makes it
   liveable is what makes an hour cell liveable: a wrong tap costs nothing. A first tap on the wrong
   letter is replaced by tapping the right one, and a second tap that is not in a line with the first
   simply starts again from there.

   YOUNGER PUZZLES READ FORWARDS ONLY — left to right, top to bottom, and down the diagonal — which is
   the brief's "forward only for younger", and is what makes a first word search possible at all.
   Older ones hide words in all eight directions.

   THE FILLER IS CHECKED FOR WORDS NOBODY SHOULD FIND, and the arithmetic is why that is not
   paranoia. A three-letter word has a one-in-17,576 chance at any one place and direction, and a
   ten-by-ten grid has about 800 of those — so a given three-letter word turns up by chance in about
   one grid in twenty, on a site whose players are children. `WS_NOT` is the backend's handle
   blocklist (`HANDLE_BLOCKED` in constants.gs) and `check-widgets.js` refuses the two disagreeing;
   the grid is read in all eight directions whatever the puzzle's own, because a child reads them all.

   THE PUZZLE SURVIVES A REPAINT, Scrabble's rule again: half the words found and then a payload
   landing must not deal a new grid. New puzzle is the only thing that does.
================================================================================================== */
```

### EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for younger" is a fact about the theme rather than a second

top level, before `WS_THEMES`

```
/* EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for
   younger" is a fact about the theme rather than a second control to set. The Years 5–6 spellings are
   a younger list with older words — "dictionary" is ten letters — so they get the bigger grid and
   keep the forward rule. The spelling lists are the statutory Years 3–4 and 5–6 words from the
   national curriculum's English appendix, cut to what fits the grid. */
```

### A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two differ.

top level, before `WS_NOT`

```
/* A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two
   differ. A copy rather than a fetch because the backend list never reaches the phone, and a
   word search must not wait on a network to decide what it may print; a check rather than trust
   because a copy kept by hand is the second reader this repository keeps finding. */
```

### ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in whatever is left.

top level, before `wsBuild_`

```
/* ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in
   whatever is left. A word that is inside another one already placed — "angle" and "triangle",
   "sine" and "cosine" — is skipped, because finding the short one inside the long one would be
   finding the wrong word. Returns null only if sixty whole attempts fail, which on these sizes does
   not happen; the caller says so rather than drawing an empty grid. */
```

### THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST.

in `wsBuild_`

```
/* THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST. The first
       version sorted three puzzles' worth of words by length and placed from the top, so every grid got
       the LONGEST six of eighteen — and a younger 8x8 drew six eight-letter words, six whole rows of
       words with two rows of filler between them: a list of rows rather than a puzzle. The rest of the
       shuffle are spares, used only when a word will not fit or sits inside one already placed.
       AND ONE WORD AT MOST RUNS THE WHOLE WIDTH OF THE GRID, because two such words can only share a
       line by crossing at one letter, so the third and fourth end up parallel and the grid reads in
       one direction. */
```

### ARTICULATE — describe it without saying it.

top level, before `ART_DECK`

```
/* ==================================================================================================
   ARTICULATE — describe it without saying it.

   ASKED FOR AS "can we add articulate to the games widgets". The board game: you land on a
   category, and for thirty seconds you describe as many of its words as you can without saying the
   word, a word that rhymes with it, or its initials. Your team guesses. Got it, or pass.

   THE SPINNER IS THE ONE PIECE THAT DOES NOT SURVIVE. On the board the category is decided by where
   your counter lands, which is a fact about a board this app does not have — so the category is
   chosen, which is the same decision one step earlier and is also the screen this widget needs
   anyway: six buttons is a first page that explains the game without a paragraph.

   THIRTY SECONDS WAS THE GAME'S OWN NUMBER AND IT IS NINETY NOW — see `ROUND_GAMES`. The deck is
   nearer a hundred words a category, and nobody gets through a hundred in ninety seconds, so a
   round still never repeats a word.

   NO SCORE IS KEPT BETWEEN ROUNDS. Articulate is scored by moving a counter, which is a thing the
   people playing do; an app that remembered it would be keeping half a game and inviting somebody
   to look for the other half. The round's own count is on screen while it matters and gone after.
================================================================================================== */
```

### CHARADES — the same round, mimed instead of described.

top level, before `CHA_DECK`

```
/* ==================================================================================================
   CHARADES — the same round, mimed instead of described.

   ASKED FOR AS "add cherades widget game as well... idk whats difference between cherades and
   articulate in this case to be honest." It is a fair question and the answer decides both decks:

     ARTICULATE is DESCRIBED. You may say anything except the word, a rhyme and its initials. So
       its deck can hold an abstract noun — `stage fright`, `a lighthouse keeper`, `deja vu`.
     CHARADES is MIMED. No words, no sounds, no pointing at something in the room. So every entry
       has to be something a BODY can show: a title everybody knows the shape of, or a thing you
       physically do. An abstract noun is a dead charades card.

   THAT IS WHY THE DECKS ARE DIFFERENT AND WHY THE ROUND IS THE SAME, which is exactly the split
   this repository keeps making between an ENGINE and the rows it reads. One implementation, two
   decks, two verbs — a second copy of "deal a word, count thirty, keep score" would be the
   `documents_()` fault in a fourth costume.

   SIXTY SECONDS RATHER THAN THIRTY, and it is not a preference: a mime takes longer to read than a
   sentence does, and Articulate's thirty is the board game's own number while charades has never
   had one. */
```

### THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE

in `CHA_DECK`

```
/* THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are
     things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE STRONGEST — it is the category that
     always plays, because a title only works if the room has seen it and a thing you DO always
     works. Eleven cards were thrown out by a reviewer before they got here, and the sharpest
     was `trying to do a handstand against a wall`: charades is MIMED, so the mime of a
     handstand IS a handstand, in somebody else's front room, next to the furniture. Five quiz
     shows went because a desk and a buzzer mime as nothing, and `The Snowman` went because it
     is a Christmas card dealt in June. `Countdown` went for both reasons AND a third: it
     collided with ARTICULATE's `a countdown`, and the two games are pages of ONE column, so
     the same word could be dealt twice in a sitting. That collision is checked now rather
     than remembered — see `check-widgets.js`. */
```

### ONE ROUND, TWO GAMES.

top level, before `ROUND_GAMES`

```
/* ==================================================================================================
   ONE ROUND, TWO GAMES.

   `secs` IS THE ONLY NUMBER, `deck` IS THE ONLY CONTENT and `say` IS THE ONLY SENTENCE that differ.
   Everything else — dealing without repeats, the clock, the count, the three states the card can be
   in — is written once. A third game of this shape is a row here.

   THE DECK IS A FUNCTION rather than the object, so a deck replaced at runtime is read rather than
   captured. Same reason `factsNow_` is a call and not a constant. */
```

### NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS:

top level, before `ROUND_GAMES`

```
/* NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS: "for articulate give like 90 seconds.
   for cherades give like 3 minutes." The board game's thirty is the right number for the board
   game — a counter moving round a track is the score, and a short round keeps the track moving.
   Round a table with no board, a round IS the turn, and thirty seconds is two cards and a laugh.
   The note on Charades below argued sixty from the same principle (a mime reads slower than a
   sentence) and three minutes keeps that ratio at twice Articulate's. The clock is drawn as m:ss by
   `roundClock_`, because "180s left" is a number somebody has to divide. */
```

### THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for:

in `roundPick_`

```
/* THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for: "less friction if
     it just decides topic and the thing". It was six buttons, which is a decision nobody wanted to
     make and a screen between somebody and the game. On the board the category is decided by where
     your counter lands — random is closer to that than a menu ever was. The chip on the card still
     says which one came up, because you have to know what you are describing. */
```

### DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule.

top level, before `roundPaint`

```
/* DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule. A
   mark a press puts on the element is a mark the next repaint throws away while the state keeps
   it, and the result is a card showing one thing while the app believes another. */
```

### DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice — which is the whole reason a category does not have to be enormous

in `roundNext_`

```
/* DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice —
     which is the whole reason a category does not have to be enormous to behave as though it were.
     `herdShuffle_` because it is Fisher-Yates and the sort trick is the famous wrong one; the note
     over it says why. */
```

### IMPOSTER — three or more people, one phone, one word that everybody knows but one of them.

top level, before `IMP_MIN`

```
/* ==================================================================================================
   IMPOSTER — three or more people, one phone, one word that everybody knows but one of them.

   ASKED FOR AS "add one of those word imposter games to games column. like you know when theres 3
   or more people and everyone knows the word except 1 person and he has to pretend like he knows
   and they go round in a circle saying associated words."

   THE PHONE IS THE ONLY THING THAT KNOWS WHO THE IMPOSTER IS, so it is dealt like the Scrabble rack:
   passed round, one player at a time, and nothing secret is on the screen between two of them.
   "Player 3" is what the next player sees, and the word only comes up when THEY press for
   it. A card that showed the word and then said "pass it on" would put it in front of whoever takes
   the phone.

   THE IMPOSTER IS TOLD THE CATEGORY AND NOTHING ELSE, which is the rule every version of this game
   that is fun to play uses. With nothing at all to go on, the imposter's first word is a guess and
   the round is over before it starts; with the category — Food, not "pizza" — they can say
   something that sounds right and the game is whether the others notice.

   WHO GOES FIRST IS DRAWN FROM EVERYBODY, THE IMPOSTER INCLUDED. Leaving the imposter out would be
   kinder to them and would tell the room something: in a game of three, "Player 2 starts" would
   rule Player 2 out, and the whole game is not knowing.

   NO SCORE AND NO TIMER, for the reason Herd Mentality gives: the voting and the arguing are the
   game, and they happen out loud. The app deals, keeps the secret, and says who it was at the end.

   THE ROUND SURVIVES A REPAINT, WHICH IS SCRABBLE'S RULE AND NOT THE MAZE'S. `repaint` runs whenever
   a payload lands, and a round half-dealt that dealt itself again would hand some players a second
   word. `initImposter` redraws what is in progress. What `stop` does instead is HIDE a word left on
   the screen, because a column swiped away and back is exactly how the next person sees it.

   ---------- A PICTURE, A BIG LINE, A SMALL LINE AND ONE BUTTON ------------------------------------
   TRIMMED TWICE. 8 Oct: "Can you make the imposter game more simple and intuitive while adding more
   categories and words. It’s info over load on the reading parts like reading theme and word extra."
   Every screen then carried a sentence — "Hand the phone to Player 2" over "Nobody else looks";
   "Nobody else knows. Blend in."; "goes first. One word each, round the circle — then vote." — and
   each became a small line, a big line and one button: "Pass to / Player 2 / Show", "Food / Player 3
   starts / Reveal", "Imposter / Hint: Food". 11 Oct: "Add symbols to imposter. Also make the voice
   ONLY say the word. THERE IS TOO MUCH FLUFF with talking and all sorts. Even written." So what was
   left of the reading went as well — "Pass to", "Hint:", "Word", the line over the card ("Everyone
   gets the word but one. Find the imposter.") — and a screen now holds only what the game is played
   with: a name, the word, "Imposter", the category, and a button of one word.

     setup      Players  − 4 +   [Read aloud]   Deal
     pass       Player 2                                   Show
     a card     🍕  pizza                                  Hide  [Listen]
     imposter   😋  Imposter  FOOD                         Hide  [Listen]
     play       😋  Player 3 starts  FOOD                  Reveal
     reveal     IMPOSTER  Player 2  🍕  pizza              Deal  Players

   "PLAYER 3 STARTS" KEEPS ITS VERB, the one word on these screens that is not a name: on the screen
   after the last Hide, "Player 3" alone reads as one more hand-over. `check-flow.js` holds every
   screen to its exact set of words, so a sentence cannot creep back one word at a time — which is how
   the first lot arrived ("Player 2 of 4", then "Hand the phone to", then "Nobody else looks").

   EVERY CARD HAS A PICTURE, BIG, OVER ITS WORD — the first half of the 11 Oct note, and the half that
   lets a child who cannot read play with the voice off. Which picture, and why some words had to go
   for want of one, is the note over `IMP_DECK`. THE IMPOSTER'S CARD HAS ONE TOO, THE CATEGORY'S, in
   the same place at the same size: across a table the word cannot be read but a big coloured picture
   can be seen, so a card WITHOUT one would be the imposter's, told to everybody. The category's is
   also the honest picture to give them — it is their hint, and no word's picture in the deck is a
   category's, nor a picture of one of its cards (`check-widgets.js`). AND IT CARRIES A "?", because
   a child who cannot read "Imposter" otherwise takes the category's picture for their word (see
   `impFrame_`). The play screen shows the picture again, without the "?", because by then it is
   everybody's.

   THE CATEGORY IS THE IMPOSTER'S HINT AND NOBODY ELSE'S, which was the "reading theme and word" half
   of the 8 Oct note: somebody who has been told "pizza" does not need telling it is a food. The whole
   table sees it on the play screen once everybody has looked.

   THE BIG LINE AND THE BUTTON DO NOT MOVE from the first pass screen to Reveal. Every one of those
   screens draws the same slots — picture, big line, small line, button, and with Read aloud on the
   speaker's room under the button — empty or not, so the card is one height on all of them. The
   phone goes to children who cannot read the button yet, and "the gold one under the big word" has to
   be the same place every time. Show, Hide and Listen carry the app's own marks (`TILE_ICONS`): an open eye, a
   shut one and a speaker, so the three a child presses alone are known by picture as well as place.

   AND THE SAME PLACE CUTS BOTH WAYS: a double tap lands its second tap on the button just drawn
   there. Measured in Chromium with a touch double tap at 390, the review of 8 October: on Show it
   flashed the card and passed the turn on unseen; on Hide it opened the NEXT player's card in this
   player's hands; on the last Hide it went straight to Reveal before a word had been said. So Show,
   Hide and Reveal ignore a press that comes within `IMP_GAP` of the last one — see
   `impTooSoon_`. The button stays where it is; it is the second tap that goes.
================================================================================================== */
```

### A CARD IS WHAT ITS PICTURE SHOWS — A THING, A FACE, A GESTURE OR A SIGN — AND NEVER AN IDEA.

top level, before `IMP_DECK`

```
/* A CARD IS WHAT ITS PICTURE SHOWS — A THING, A FACE, A GESTURE OR A SIGN — AND NEVER AN IDEA.
   Articulate's deck can hold `stage fright`, because it is described one sentence at a time; this
   one is talked about ONE WORD at a time, round a circle, so a card has to be something everybody
   can say three different true words about — and something a child in the room has heard of.
   Until 11 Oct that was written "things, not ideas", and every card was an object. The pictures
   moved the line rather than broke it: a face crying, a hand waving and a red octagon are as plain
   to point at as a pizza, and as easy to say three words about — `crying` (tears, sad, baby),
   `waving` (hello, bye, hand), `stop` (red, car, wait). So Feelings, Actions and Signs and symbols
   came in, from pictures no other category needed (see "twenty-five categories" below). What stays
   out is the idea with no picture — `brave`, `fair`, `Tuesday` — whose only honest picture is none,
   and a picture only an adult could put a name to.

   AND EVERY THING HAS ITS PICTURE. The owner, 11 Oct: "Add symbols to imposter." AN EMOJI, because
   750 pictures cannot be drawn by hand and every phone and iPad at the table already carries a font
   of them. A CARD IS WRITTEN AS IT IS DRAWN — its picture, one space, its word: '🍕 pizza' — and
   split at the first space (`impCards_`), which no emoji holds: a joiner, a variation selector, a
   keycap's ring and a flag's tag letters are all invisible, and none of them is U+0020. COPY A
   PICTURE, NEVER RETYPE ONE: `☀️` without its invisible U+FE0F is a small black sun on some phones.

   A PICTURE MUST BE HONEST — the one a child would name with the card's word. 🍕 is pizza; a dinner
   plate is not shepherd's pie. A word with no honest picture was REPLACED by a word of the same
   category that has one, never given a near miss (`biscuit` became `cookie`, because 🍪 is a
   chocolate-chip cookie and that is what a child calls it), and a word was renamed to what is drawn
   (`Big Bad Wolf` to `wolf`, `teeth` to `tooth`, `skyscraper` to `city` — 🏙️ is a skyline — and
   `Mrs Christmas` to `Mrs Claus`). AND A PICTURE OF SOMETHING ELSE WITH THE SAME NAME IS A NEAR MISS
   TOO: `triangle` in Music was 🔺, the red shape, never the instrument, and is a shape in Signs and
   symbols now. docs/history/343 lists every one.

   NO EMOJI NEWER THAN 12.0 (iOS 13.2, 2019 — every iPad still in use). A newer one is an empty box on
   an older phone: a card with no picture, in one player's hand, which looks like a fault and is a
   tell. So the jobs are the Emoji 4.0 woman and man forms, alternating (`👩‍🏫 teacher`,
   `👨‍⚕️ doctor`), because the person-neutral `🧑‍🏫` is 12.1; and `bear` is 🐻 where the polar bear
   (🐻‍❄️, 13.0) would be a bear and a snowflake side by side on an older iPad. `check-widgets.js`
   holds the line.

   TWENTY-FIVE CATEGORIES OF THIRTY, 750 cards, because there are only so many honest pictures. It
   was twenty-seven of thirty (810) from 8 Oct ("while adding more categories and words"), and ten of
   those could not find thirty pictures at 12.0 — Sea life, Minibeasts and Sweets and treats had
   thirteen each, Famous places seven. So the deck follows the pictures: Sweets and treats folded into
   Food, Sea life into At the seaside, In the garden and Minibeasts into Nature; Space took in the
   weather; Jobs became People (the jobs that have a person drawn, and grandma, the baby and the
   rest); Famous places went; and Feelings, Actions and Signs and symbols came in, from the faces,
   gestures and signs no other category needed. SPLIT FINE because the category is the imposter's
   whole hint: "Animals" over a shark, a bee and a hamster told them almost nothing. THIRTY IN EVERY
   ONE, because the pile below is every (category, word) pair, so a category's share of the rounds is
   its share of the cards — a category of forty beside one of twenty would come up twice as often for
   no reason anybody chose. `check-widgets.js` holds the shape: at least 25 categories, at least 30
   words in each and the same number in every one, no word twice anywhere (`hairdresser` in Jobs and `hairdresser’s` in Places were the
   same card in the old deck), no word that says its own category (the hint handing the imposter half
   the answer: `school bus` and `school trip` were in School), and no picture twice.

   A CATEGORY HAS A PICTURE TOO, `sym`: the imposter's card shows it over "Imposter", and the play
   screen shows it to the table. NONE IS A CARD'S PICTURE, OR A PICTURE OF ONE OF ITS OWN CARDS, or
   the imposter would be holding the word. The first half was all that was held, by "no picture
   twice", and the review of 11 October found eight categories breaking the second: 🐯 over
   `tiger` 🐅, 🐶 over `dog`, 🏖️ over `parasol`, 🏅 over `gold medal`, 🎶 over `musical note`, 📚
   over `book`, 👚 over `T-shirt`, 🎉 over `confetti` and `party`. So the card went where the
   category's picture is the better hint (tiger, parasol, gold medal, musical note, T-shirt), and
   the picture changed where the card is the better word (Pets 🐾, School 🎒, Celebrations 🎈 —
   and At the seaside 🌊, so that `beach` could be a card). `check-widgets.js` holds it twice:
   by picture (`LOOKALIKE`, families a child would call one thing) and by word (`SYM_SAYS`, what a
   child calls each category's picture, which every new one has to be given).
   Two more got past both (the second review, 12 Oct): 🥘 over `frying pan` 🍳, a pan of food seen
   from above twice, and 🌌 over `shooting star` 🌠 and `star` ⭐, a night sky of stars over a star.
   The kitchen kept its picture — the pan is the kitchen — and the pan went to Food as `fried egg`,
   which is what 🍳 draws, with `bacon` coming the other way. Space and weather is 🔭 now, and 🌌 is
   its card `Milky Way` where the telescope was. 👨‍🍳 was the obvious kitchen picture and is not
   used: it is 👨 joined to 🍳, and Noto draws the cook holding that pan. The pairs that are near
   and stay — 🥗 over `lettuce`, 🎭 over `happy` and `sad`, 🏞️ over `mountain` — are in `KEPT` in
   check-widgets.js, each with why nothing else could take its place.

   THE PICTURE IS NEVER SPOKEN. `speechSynthesis` reads an emoji out by its Unicode name — "slice of
   pizza", "man health worker" — which is exactly the fluff the 11 Oct note was about. Only the word
   goes to the voice (`imp-listen`).

   ABOUT HALF OF THESE ARE ALSO IN ARTICULATE OR CHARADES, AND THAT IS ALLOWED. `check-widgets.js`
   refuses one word in both of those two, because a word described and then mimed is a word the
   room already knows the answer to. Nothing like that can happen here: the word is dealt at random
   from 750, only one person is trying to work it out, and a card from an hour ago tells them
   nothing about which one came up. Keeping ordinary words out to satisfy a rule written for a
   different game would leave the imposter a deck of words nobody can talk about. */
```

### EVERY CARD AS `[category, word, picture]`, read out of '🍕 pizza' at its first space — see "a card is written as it is drawn" over `IMP_DECK`.

top level, before `impCards_`

```
/* EVERY CARD AS `[category, word, picture]`, read out of '🍕 pizza' at its first space — see "a card
   is written as it is drawn" over `IMP_DECK`. A card written with no picture comes out as its whole
   self and an empty picture, so the game still deals it, word and all, and `check-widgets.js` is
   what says it has none. A LETTER IN FRONT OF THE FIRST SPACE MEANS NO PICTURE, so `'hot dog'` with
   its 🌭 left off is the word "hot dog" rather than "dog" drawn under a picture called "hot". ONE
   READER, so the pile, `check/states.js` and the journeys cannot each split a card a different way. */
```

### ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes round twice until the whole deck has — which is the same

top level, before `IMP_PILE`

```
/* ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes
   round twice until the whole deck has — which is the same promise `roundNext_` makes, one level
   up, because here the category changes every round too. */
```

### ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET

top level, before `impCanSay_`

```
/* ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET -------------------------------------------
   ASKED FOR AS "For the imposter game can you have have it so young ones who can’t read can play.
   Like it will read it out for them." (8 Oct.)

   THE BROWSER'S OWN VOICE — `speechSynthesis` — and nothing else: no network, no key, nothing to
   install, and it works on the iPad at the table with the wifi off. A British voice where the phone
   has one, a little slower than its own pace. Where there is no voice at all the switch is not drawn
   and the game is exactly the one above, which is the house rule about anything that can be absent.

   ONE SWITCH, OFF UNTIL SOMEBODY TURNS IT ON, and remembered like the player count: it is the same
   family at the same table next week. Off by default because a phone that starts talking in a
   classroom is a phone that gets put away.

   THE SECRET IS NEVER SAID BY ITSELF. A phone that read the word out as the card came up would tell
   the whole table — the one thing this game cannot survive. So the card has LISTEN, pressed by the
   person holding it, said at a little over half volume, and pressable again for "say it again".

   AND LISTEN SAYS THE WORD AND NOTHING ELSE — "pizza" — or, on the imposter's card, "Imposter". The
   owner, 11 Oct: "make the voice ONLY say the word. THERE IS TOO MUCH FLUFF with talking and all
   sorts." Everything else the phone used to say went with that note, each line true and each one
   more talking than the game needs:
     - the hand-over, "Player 2. Press Show, then the speaker, and hold the phone to your ear." (it
       was "Hold the phone to your ear, then press Show" until the review of 8 October found that
       Show makes no sound, so the order was the whole of that sentence's job);
     - the play screen, "Food. Player 3 starts.";
     - the reveal, "The imposter was Player 2. The word was pizza.";
     - and on Listen itself, "Your word is pizza. Your word is pizza." and "You’re the imposter. Your
       hint is food." — see `imp-listen` for why those were long and why they are short now.
   So `impAnnounce_`, which said the first three on the press that brought each screen up, is gone,
   and nothing speaks but `imp-listen`. How to hold the phone is for the grown-up who deals to show a
   child once, which is how every other game at the table is taught.

   AND STILL ONLY ON A PRESS. A browser lets a page talk in answer to a tap (Safari refuses a first
   `speak()` outside one), so `impPaint` has no voice: a repaint, a payload landing, a column swiped
   back to, all say nothing.

   AND WHAT IS STILL BEING SAID IS CUT OFF FIRST. Hide, Deal, Players and leaving the column
   each start with `impHush_`, before anything else they do — a word half-spoken when the phone is
   handed on finishes in the next player's ear otherwise, and `speak()` queues rather than replaces. */
```

### `lang` AS WELL AS `voice`, because Chrome hands back no voices at all until its list has loaded — the first round of the day would get whatever the phone

top level, before `impSay_`

```
/* `lang` AS WELL AS `voice`, because Chrome hands back no voices at all until its list has loaded —
   the first round of the day would get whatever the phone defaults to. `lang` is a request any
   engine honours with the list empty; `voice` is the exact one when there is a list to pick from.
   ALWAYS QUIET, 0.6: the one thing said now is the secret, into one ear. The full volume this kept
   for the lines the whole table was meant to hear went with those lines. */
```

### `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing.

top level, before `IMP_IDLE`

```
/* `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing.
   `shown` is whether that player's card is up — the one piece of state that must never outlive the
   person holding the phone, which is what `impHide_` is for. `sym` is the word's picture and `catSym`
   the category's, kept with the round so a repaint draws the pictures it dealt. */
```

### ---------- A SECOND TAP IS NOT A SECOND PRESS

top level, before `IMP_GAP`

```
/* ---------- A SECOND TAP IS NOT A SECOND PRESS -------------------------------------------------
   SHOW, HIDE AND REVEAL ARE DRAWN ON THE SAME PIXELS, which is the design — and a double tap, the
   most common thing a five-year-old does to a button, then presses two screens in one go. Measured
   in Chromium with two touch taps 120ms apart: Show then Hide (the card flashed and the turn moved
   on unseen), Hide then the next player's Show (Player 1 holding Player 2's card), the last Hide then
   Reveal (the imposter named before anybody had played). Deal, on the setup screen and on the
   reveal, overlaps Show's box too.

   SO THOSE THREE — AND THE REVEAL'S DEAL AND PLAYERS, drawn where Reveal was (see `imp-again`) —
   IGNORE A PRESS WITHIN `IMP_GAP` OF THE LAST PRESS. Every deliberate press
   here is further apart than that by a mile — a word is read, a phone is handed across a table, a
   round is played — so the only press it can cost is a second tap, and a child whose press was
   swallowed simply presses again. 600ms rather than a phone's own double-tap window (300–500ms),
   because a small child's two taps are slower than an adult's.

   `performance.now()` ON BOTH SIDES, rather than the event's `timeStamp`: one clock, and no browser's
   idea of what `timeStamp` counts from to trust. NOT A CSS `pointer-events` FADE-IN either, which the
   review prototyped and which works — but `prefers-reduced-motion` cuts every animation in style.css
   to .01ms, so the guard would vanish for exactly the people who asked for less to happen.

   ONLY FOR A PRESS THAT CAME WITH AN EVENT. The click listener in shell.js always passes one; a check
   or a state calling `ACTIONS[...]` straight is not a finger, and walks a whole round in one tick.

   TIMED FROM THE LAST PRESS, NOT FROM THE CARD BEING DRAWN. It was the draw, and a card is drawn by
   more than a press: a repaint when a payload lands, a return to the column. `check/press.js` found
   it (8 Oct) — it arrives on a card and presses inside 600ms of the draw, and Show, Hide and Reveal
   did nothing, which is exactly what a child gets who presses the moment the column slides back. A
   double tap is two PRESSES close together, so that is what is measured: both Deals, Show, Hide,
   Reveal and Players each stamp the time they acted (`impPressed_`), and only a press that close
   behind one of them is the second tap. */
```

### THE SLOTS EVERY SCREEN FROM THE FIRST HAND-OVER TO "Reveal" IS DRAWN IN — see "the big line and the button do not move" above:

top level, before `impFrame_`

```
/* THE SLOTS EVERY SCREEN FROM THE FIRST HAND-OVER TO "Reveal" IS DRAWN IN — see "the big line and the
   button do not move" above: the picture, the big line, the small line, the button and the speaker's
   room. An empty slot is drawn empty rather than left out, which is the whole trick: the stylesheet
   gives it its height either way. The hand-over has no picture and keeps the picture's room, so its
   name sits where the word will.

   THE PICTURE IS `aria-hidden`: a screen reader would read 🍕 as "slice of pizza" right before the
   word it is a picture of, which is the fluff the 11 Oct note was about, said by somebody else.

   AND THE IMPOSTER'S PICTURE CARRIES A "?" (`imp` → `.is-imp`, drawn by style.css), because a
   picture over a word is the whole card to a child who cannot read the word — and the imposter's
   card was a picture over a word too. With Read aloud off (how it arrives), a five-year-old dealt
   the imposter would see 🐯 over a word they could not read, take the tiger for their word, and
   play the round as somebody who had it (the review of 11 October, from the screenshots). "Imposter" is the one word on that card
   they needed, and the only one they could not read. So it is said in the one way a non-reader
   learns once — a gold "?" on the picture, "you don't know the word" — at the picture's own place
   and inside its slot, so the card is still a big picture over a line of text from across a
   table, and still one height. NOT ON THE PLAY SCREEN, where the same picture is everybody's.

   THE SMALL LINE WAS TWO, ONE OVER THE BIG LINE AND ONE UNDER IT, while there was "Pass to" to put
   over a name. With that gone the category is the only small line left — the imposter's hint, and
   the table's on the play screen — and it sits under the big line on both, in the same place.

   AND THE SPEAKER'S ROOM IS KEPT ON THE SCREENS WITHOUT ONE. The first version only hung the card from
   its top, so that Listen under the button pushed nothing up inside the card — and the screenshots at
   320 and 390 still had Hide 36px above where Show had been, because the column centres the whole
   widget in the pane and a card 72px taller is centred 36px higher. So it is the card's HEIGHT that
   has to be the same, and `foot` is Listen on a card and an empty 64px (with Listen's 20px over it)
   on the pass and play screens while Read aloud is on; with it off there is no speaker anywhere and
   nothing to keep room for. */
```

### THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button that a reader reads and a non-reader recognises has to

top level, before `impShow_`

```
/* THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button
   that a reader reads and a non-reader recognises has to carry both. WRITTEN OUT AT EACH BUTTON rather
   than built by a helper from its action's name: `check-doors.js` pairs every `data-do` it can read
   with a handler, and the first version here built three of them from a variable and left Show, Hide
   and Reveal as "a handler with no door". FUNCTIONS AND NOT STRINGS, because tiles.js loads after this
   file: a `const` built at load would call `tileIcon_` before there is one — which `check.js` let
   through when this was written, and reports now. */
```

### ---------- READ ALOUD IS A TILE, THE REELS' SOUND TILE'S OWN PAIR

top level, before `impAloudTile_`

```
/* ---------- READ ALOUD IS A TILE, THE REELS' SOUND TILE'S OWN PAIR ---------------------------------
   THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* This was the other
   sound switch in the app: a hand-written pill with the speaker, the words "Read aloud" and a sliding
   knob, kept a button on the argument that it sits in a form and the adult setting up reads it. The
   reels' Sound became a tile that day and review asked why this one did not (note 323); "tiles win
   any tie" and "everything else" are the two answers, and nothing a form needs is lost — it is one
   press with two states, which is what a switch tile is (the pen's lock is the precedent).

   THE SAME PAIR OF MARKS AS THE REELS, `sound` and `mute`, saying the state it is IN: the crossed
   speaker while the phone stays silent, the waves while it reads aloud — so a sound switch in this app
   is learnt once, wherever it is met. `on` brightens the plate for the eye, `aria-pressed` says it to a
   screen reader, and the word survives in the name ("Read aloud off"), which `title` shows the adult
   who hovers. `cls` keeps `.imp-aloud`, the name `check/states.js` and the read-aloud journey find it
   by. A FUNCTION, for the reason Show and Hide above are: tiles.js loads after this file. */
```

### DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and nothing is ever patched onto the element.

top level, before `impPaint`

```
/* DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and
   nothing is ever patched onto the element. EVERY CONTROL IS BUILT HERE rather than written into
   the widget's markup, which is the Scrabble lesson: a button that is on the page before it can do
   anything is one `check/press.js` presses and correctly reports dead. AND NOTHING HERE SPEAKS — see
   "read aloud" above. */
```

### THE IMPOSTER'S CARD CARRIES THE CATEGORY'S PICTURE where everybody else's carries the word's — see "every card has a picture" above:

in `impPaint`

```
/* THE IMPOSTER'S CARD CARRIES THE CATEGORY'S PICTURE where everybody else's carries the word's — see
     "every card has a picture" above: a card with no picture would be the imposter's from across the
     table — and the "?" on it, for the child who cannot read "Imposter" (see `impFrame_`). */
```

### THE REVEAL: who, and the word with its picture.

in `impPaint`

```
/* THE REVEAL: who, and the word with its picture. "Word" over the word went in the 11 Oct trim — the
     picture and the word under "Imposter / Player 2" say what they are. "Play again" became "Deal",
     the setup screen's own word for the same press, so a button of one word means one thing. */
```

### A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it.

top level, before `impHide_`

```
/* A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it. The
   round is kept — this is `stop`, not `New game` — and whoever was looking presses Show again. And a
   word still being SAID is a word the next person hears, so the voice stops first. */
```

### THE ONLY PLACE ANYTHING IS SPOKEN, and only with the card up — so only by the person who pressed Show.

top level, before `IMP.shown`

```
/* THE ONLY PLACE ANYTHING IS SPOKEN, and only with the card up — so only by the person who pressed
   Show. Hushed first so a second press says it again rather than queueing a second copy behind it.

   THE WORD, ONCE, AND NOTHING ELSE — or "Imposter", and nothing else. The owner, 11 Oct: "make the
   voice ONLY say the word." Never the picture: an emoji goes to the voice as its Unicode name.

   IT WAS LONGER ON PURPOSE, AND THE REASON IS WORTH KNOWING. The review of 8 October found that the
   table can hear HOW LONG a phone talks where it cannot make out a word: "Pizza." (about 0.6s)
   against "You’re the imposter. The hint is food." (about 3s) put the odd one out five times longer.
   So both lines were padded to one shape — "Your word is pizza. Your word is pizza." and "You’re the
   imposter. Your hint is food." — and that padding is the fluff the owner heard. Now it is two single
   words: "Imposter" is three syllables, a word is 2.1 on average (counted over all 750 cards), and
   72% of them are within one syllable of it — under a second either way, into one ear at 0.6. The
   tell the padding was for was 2.4 seconds; what is left is a fraction of one. The word said TWICE,
   so the second one landed at the ear, went with the rest: a child presses again to hear it again.

   STARTED ON THE TAP AND NOT AFTER A PAUSE, though the review offered one (1.2–1.5s, so the phone is
   at the ear first). Safari will only start speech in answer to a tap until something has spoken,
   and a delayed line is not in answer to one; nothing here can try that on an iPhone, and a Listen
   that says nothing on the family's own phone is worse than one that starts a moment early. */
```

### GUARDED BEFORE THE HUSH, the other way round from Hide.

top level, before `IMP.phase`

```
/* GUARDED BEFORE THE HUSH, the other way round from Hide. That order was for "Food. Player 3
   starts.", the line the play screen used to say and a second tap of the last Hide would have cut
   off. Nothing is said on the play screen since 11 Oct, so the hush here is only the house rule that
   a screen changing stops the voice — the order is kept because it costs nothing and is still right. */
```

### `imp-again` IS THE REVEAL'S "Deal" — it was "Play again" until the 11 Oct trim — and deals for the same number of players without going back through the setup

top level, before `IMP`

```
/* `imp-again` IS THE REVEAL'S "Deal" — it was "Play again" until the 11 Oct trim — and deals for the
   same number of players without going back through the setup screen.

   BOTH OF THE REVEAL'S BUTTONS TAKE `(el, e)` FOR `impTooSoon_` TOO, because Reveal is drawn where
   they are. The guard covered Show, Hide and Reveal and stopped there, and the review of 11 October
   double-tapped Reveal in Chromium at 390 and at 320: the second tap went to Players — Reveal's
   centre is x=195, Deal ends at 191 and Players starts at 198, and the browser's touch adjustment
   sends a tap in that gap to the nearer button — and the round went play → reveal → setup in one
   gesture, so the table never saw who the imposter was. It was so before the pictures went in,
   too. HUSHED BEFORE THE GUARD, as Hide is: a tap that is ignored still stops the voice. */
```

### FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions.

top level, before `JAM_DECK`

```
/* ==================================================================================================
   FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions.

   ASKED FOR AS A LIST, in the owner's own descriptions:
     "Just a Minute - A student speaks continuously about a random topic for 60 seconds without
      hesitating."
     "Taboo - Students describe a secret word without using a list of forbidden related words."
     "Hot Seat - The class shouts clues to help a student guess the word written on the board
      behind them."
     "20 Questions - The class asks up to 20 yes or no questions to deduce a secret person, place,
      or thing."
   THE LIST HAD A FIFTH, ALIBI, AND IT IS GONE — see the note where its section was, above
   `PARTY_GAMES`.

   NOT `ROUND_GAMES`, AND THE REASON IS ONE LINE OF `initRound`. That engine throws the round away
   every time the widget starts — `roundAt[k] = null` — and a widget starts on every `repaint`,
   which runs whenever a payload lands or anything saves. Articulate and Charades live with that;
   these four were asked to keep their round through a repaint, and changing `initRound` under two
   games nobody asked about is a change nobody asked for. So the clock is written once more, here,
   for four — which is the same argument `ROUND_GAMES` makes for two.

   THE CLOCK IS A DEADLINE, NOT A COUNTDOWN. `setInterval(…, 1000)` with `left--` loses up to a
   second every time it is cleared and set again, and `toolsStart_` clears and sets every widget on
   every repaint. So a running round holds `ends` (a moment) and a held one holds `left` (a length),
   and the number on the screen is always one subtracted from the other.

   `stop` IS CALLED IN TWO DIFFERENT SITUATIONS AND THEY MUST NOT BE TREATED ALIKE. `toolsStart_`
   calls `toolsStop_` before every start, so a repaint with the Games column in front is a stop and
   a start a moment apart; leaving the column is a stop on its own. `go` has already moved `AT` when
   it stops the widgets, so `partyHere_` can tell them apart: a repaint carries on as if nothing
   happened, and a column left behind is PAUSED until somebody presses Resume — a minute that runs
   out while the phone is on another screen is a round nobody played.

   NO SCORE IS KEPT BETWEEN ROUNDS, for Articulate's reason: the round's own count is on the screen
   while it matters, and a running total belongs to the people playing.
================================================================================================== */
```

### ---------- THE DECKS

top level, before `JAM_DECK`

```
/* ---------- THE DECKS ------------------------------------------------------------------------------
   EVERY ONE IS ABOUT SOMETHING A CHILD IN THE ROOM HAS HEARD OF, because a tutor is the one reading
   it out and a card nobody can talk about is a round that stops dead.

   AND NO ENTRY IS IN TWO OF THE WORD DECKS ON THIS COLUMN — these four and Articulate's and
   Charades' — which `check-widgets.js` enforces, for the reason it gives about `Countdown`: a word
   dealt twice in one sitting is a word the room already knows the answer to. Imposter is left out
   of that comparison on purpose, and its own note says why.

   JUST A MINUTE'S TOPICS ARE BROAD ON PURPOSE. A minute is long; "Hats" can fill it and "the
   history of the bowler hat" cannot. */
```

### 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books rather than from this week's news — a living celebrity is a card

top level, before `TWQ_DECK`

```
/* 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books
   rather than from this week's news — a living celebrity is a card some families would rather not
   have read out, and one a ten-year-old may never have heard of. */
```

### WHERE A STOP CAME FROM:

top level, before `partyHere_`

```
/* WHERE A STOP CAME FROM: is this game's own card on the screen in front? Asked of the DOM rather
   than of the column's name, and the first version is why. It said `AT === 'saved'` counts as here,
   because the Saved column holds starred games — true of a STARRED game and false of every other,
   so swiping from Games to Saved left a Taboo minute running on a card that was on no screen, and it
   ran out there: the exact fault the pause exists for. A repaint with the Games column in front still
   finds the card, because `paint` has put the new markup in before `toolsStart_` stops anything. */
```

### THE TICK WRITES THE CLOCK AND NOTHING ELSE.

top level, before `partyTick_`

```
/* THE TICK WRITES THE CLOCK AND NOTHING ELSE. A full paint four times a second would rebuild the
   buttons under somebody's finger — a press that lands on an element replaced mid-tap is a press
   that does nothing. The card is painted when the STATE changes; the clock is the one thing that
   changes on its own. */
```

### THE WIDGET'S `stop`.

top level, before `partyStop_`

```
/* THE WIDGET'S `stop`. Always holds the clock; pauses the round only when the column has really
   gone. A secret on the screen goes with it, which is Imposter's rule: a column swiped away and
   back is exactly how the next person would see it. */
```

### ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing secret while they do.

top level, before `partyHeld_`

```
/* ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing
   secret while they do. Hot Seat calls the same card before its first word, which is the same
   moment: the phone has to be facing the right way before the clock moves. */
```

### ---------- JUST A MINUTE

top level, before `jamPaint`

```
/* ---------- JUST A MINUTE -------------------------------------------------------------------------
   THE RADIO GAME'S THREE RULES ARE THE THREE BUTTONS. Hesitation, repetition and deviation are what
   the listeners catch, so each is a tally rather than a buzzer that stops the clock: in a classroom
   the point is to keep talking, and the count afterwards is the conversation about why. */
```

### ---------- TABOO

top level, before `tabPaint`

```
/* ---------- TABOO ---------------------------------------------------------------------------------
   THE FORBIDDEN WORDS ARE ON THE CARD UNDER THE WORD, because that is the card: the describer reads
   both, and whoever is watching for a slip reads the second half. Correct and Pass are one handler
   with one number different, Articulate's argument. */
```

### ---------- HOT SEAT

top level, before `hotPaint`

```
/* ---------- HOT SEAT ------------------------------------------------------------------------------
   THE WORD IS FOR THE CLASS AND NOT FOR THE ONE IN THE SEAT, so the phone is held up facing the room
   and the word only comes up once it is. Every round starts on the card that says so, with the clock
   still — the same card a round left behind comes back to, because it is the same moment. */
```

### ---------- 20 QUESTIONS

top level, before `TWQ_MAX`

```
/* ---------- 20 QUESTIONS --------------------------------------------------------------------------
   ONE PERSON KNOWS AND HOLDS THE PHONE, so it is dealt like Imposter's card: "hand the phone to
   whoever answers", Show me, then Hide — and only then the counter. Telling the room whether it is a
   person, a place or a thing is the classroom version's own first clue ("animal, vegetable or
   mineral"), so the category stays on the card and the answer does not.

   YES AND NO ARE BOTH ONE QUESTION ASKED. The count is the game; which way each went is what the
   class is keeping in its head. No timer, so `stop` has nothing to hold — only a secret to hide. */
```

### ---------- ALIBI WAS HERE, AND IS DELETED ON REQUEST

top level, before `PARTY_GAMES`

```
/* ---------- ALIBI WAS HERE, AND IS DELETED ON REQUEST -------------------------------------------
   ASKED FOR IN THE SAME LIST AS THE OTHER FOUR, and then: "delete alibi game." A case card, two
   suspects interviewed on two clocks, the same six questions to each and a verdict — the one game
   on this engine that was an interview rather than a word, which is why it had kept a card of its
   own when the other four moved into Word games.

   DELETED RATHER THAN SWITCHED OFF, for `c4Reply_`'s reason: a dormant game behind a flag is a
   second mode nothing presses. The four decks went with it — 121 crimes, 24 times, 46 places and
   122 questions — because a deck nothing deals is weight on every phone for nobody. `an alibi` is
   still an Articulate card, and should be: that one is a word to describe, not this game. */
```

### SCRABBLE — two, three or four people, one phone.

top level, before `SCR_N`

```
/* ==================================================================================================
   SCRABBLE — two, three or four people, one phone.

   ASKED FOR AS "add scrable to games tool. 2/3/4 player". The board game: 15x15, a hundred tiles,
   seven on a rack, words crossing words, and the premium squares underneath them.

   THERE IS NO DICTIONARY AND THAT IS A DECISION RATHER THAN A GAP. A usable English word list is
   about 280,000 entries and two and a half megabytes — the size of the whole question library, for
   one game widget, on a site this repository has already spent two rounds making open faster on a
   phone. And it is not what the game needs: in real Scrabble a word STANDS unless somebody
   challenges it, and with two to four people looking at one phone the challenge is the person
   opposite saying "that is not a word". That is the same argument Herd Mentality already makes
   about scoring — the part that is people arguing is the part an app should leave to them.

   WHAT IS CHECKED IS THE GEOMETRY, WHICH IS THE PART PEOPLE ACTUALLY GET WRONG: the first word
   through the centre, everything in one line, no gaps, and after the first move at least one new
   tile touching what is already there. None of that is a matter of opinion and all of it is easy to
   do by accident, so the app refuses it and says which rule was broken.

   THE RACK IS SECRET, SO THE PHONE IS HANDED OVER RATHER THAN PASSED. Between turns the board stays
   up and the rack is replaced by "hand the phone to <name>" and one tap. Without it the next player
   reads the previous one's tiles on the way past, which is not a thing that can happen with a real
   rack and is the one part of this game a single screen genuinely changes.

   AND IT IS NOT REBUILT ON EVERY PAINT, WHICH IS THE OPPOSITE OF THE MAZE. `initMaze` starts a new
   maze each time the widget opens, and its note says why: a half-walked maze is a game you have
   forgotten starting. A Scrabble game is forty minutes and four people, and `repaint` runs whenever
   a payload lands or anything saves — so this keeps whatever is in progress and redraws it. `New
   game` is the way to start another, which is the only way it should ever be lost.
================================================================================================== */
```

### THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string.

top level, before `SCR_SET`

```
/* THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string. Written as
   letter/count/value triples rather than a hundred entries, because a list of a hundred is a list
   nobody proof-reads. Asserted below: it comes to 100 and it comes to 187 points. */
```

### ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT

top level, before `SCR_QUAD`

```
/* ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT --------------------------------------
   THE BOARD IS SYMMETRIC ABOUT BOTH MIDDLES, so eight rows of eight describe all 225 and a typo in
   a 225-character string cannot hide in them. `T`/`D` are word premiums, `t`/`d` letter premiums,
   and the centre — bottom right of the quadrant — is the star, which scores as a double word on the
   first move exactly as the printed board does. */
```

### ---------- WHERE THE TILES ARE, ASKED OF THE BOARD RATHER THAN REMEMBERED

top level, before `scrAt_`

```
/* ---------- WHERE THE TILES ARE, ASKED OF THE BOARD RATHER THAN REMEMBERED --------------------
   A SQUARE HOLDS EITHER A COMMITTED TILE OR ONE OF THIS TURN'S, and the two have to be told apart
   for scoring — a premium counts only under a tile placed this turn. Keeping a second list of
   "which squares are new" is the second reader this repository keeps paying for, so the tile itself
   carries `fresh` and committing a turn clears it. */
```

### ---------- THE RULES THAT ARE NOT A MATTER OF OPINION

top level, before `scrIllegal_`

```
/* ---------- THE RULES THAT ARE NOT A MATTER OF OPINION ----------------------------------------
   Each returns the sentence it refuses with, so the card can say WHICH rule was broken rather than
   "not a valid move" — a refusal that does not say why is one you learn nothing from, which is the
   argument this repository already makes about a toast saying "Sent" for a message that was not. */
```

### ---------- WHAT IT SCORES

top level, before `scrWordAt_`

```
/* ---------- WHAT IT SCORES ---------------------------------------------------------------------
   THE MAIN WORD AND EVERY CROSS WORD A NEW TILE MAKES, which is the half of Scrabble scoring people
   forget: a single tile laid beside an existing word scores that word again as well as its own.
   A premium counts only under a tile placed THIS turn, which is what `fresh` is for; word premiums
   multiply after every letter premium in the same word has been applied. */
```

### THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW.

in `scrPlay_`

```
/* THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW. Everybody else's rack
     comes off their score and goes on to the finisher's, which is what the printed rules say and is
     also the reason anybody ever plays a short word to get rid of a Q. */
```

### ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME

in `scrCellsHtml_`

```
/* ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME ------------------------------
       THE BOARD IS DRAWN EITHER WAY, because an empty board under the 2/3/4 buttons says what you
       are about to play on. What it is NOT, before anybody has started, is 225 buttons that do
       nothing — which is what `check/press.js` found and named. An `<i>` is what the maze's cells
       already are, for the same reason: it is a picture until it is a control. */
```

### ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS

in `scrRackHtml_`

```
/* ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS ------------------------------
     THE FIRST VERSION WAS AN ALPHABET OF 44px KEYS and it was the right shape and the wrong size:
     six to a row at 320px is five rows, 220px, which takes the rack and all four actions past the
     pane's own fold — the fault `check/cards.js` and `check/ui.js` both exist to catch, on a card
     that was already 22px inside it. A select is one control, opens the phone's own picker, and is
     the shape this app already uses everywhere somebody chooses from a closed list. */
```

### ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK

in `scrRackHtml_`

```
/* ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK ---------------------------------
     WITHOUT THIS YOU COULD PLAY ONE TILE TWICE. Placing a tile leaves it on the rack until the turn
     is committed — deliberately, because taking a tile back has to put it somewhere — so selecting
     the same rack slot again put a second copy of the same letter on the board, and the commit then
     spliced one index for two squares. Asked of the BOARD rather than kept as a second list: every
     placed square already carries the rack index it came from, and a list beside it is one more
     thing to get back in step when a tile is picked up again. */
```

### THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4 players" IS "new game" and a second control saying so is a second thing

in `scrabblePaint`

```
/* THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4
     players" IS "new game" and a second control saying so is a second thing to press. While a game
     is running it is hidden and `New game` sits in the action row, where it means abandon this one. */
```

### EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list.

in `scrabblePaint`

```
/* EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list. `check-doors.js` follows
       `data-do="x"` with a string in it and cannot follow a variable — the first version mapped an
       array and took the doors from 137 to 132, reporting all five handlers as unreachable. A red
       with nothing behind it is the one thing every list in this project exists to prevent, and
       CLAUDE.md already records the same correction on `banner()`. */
```

### A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say.

top level, before `g.blank`

```
/* A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say. The
     square is taken now and the letter arrives a tap later, so the picker cannot be answered about
     a square that is no longer the one you tapped. */
```

### ---------- THE TIMETABLE

top level, before `TMT_DAY_NAMES`

```
/* ---------- THE TIMETABLE ---------------------------------------------------------------------------
   ASKED FOR AS *"timetable widget ... like weekly timetable"*. A student's school week, or a tutor's
   standing sessions: a day, a time, a subject, a line of note.

   ON THE ACCOUNT WHEN SIGNED IN, ON THE DEVICE WHEN NOT. It began on the device only, under `whoIs_`,
   and that made it the one week in the app that disagreed with itself across phones: a tutor's week
   written on a laptop was not on their phone. It is saved to the `timetable` cell on your own row now
   (`saveTimetable`, the docket's pattern — see `tmtSave_`) and comes back with the sign-in reply.
   Signed out it still works under the bare key, because a timetable is not a thing anybody should
   need an account to write down; and the FIRST time somebody signed in opens it with nothing on the
   account, whatever this phone already held under their key is carried up rather than lost.

   AND YOUR BOOKED SESSIONS ARE IN IT, LOCKED. Asked as part of *"calander and time table and
   availability ... it seems they clash"*: `Your week` drew the sessions booked here and this drew what
   somebody wrote, two weeks of one person side by side. The booked ones are read from `jobs` through
   `weekSessions_` (book.js) every time it is drawn — this week's dates, so a half term or a bank
   holiday is simply a day without the session — and are never stored here, because a copy of a
   booking is a copy that goes stale. Tapping one opens the session, as `Your week` did; you write
   your own lessons around them. `Your week` is gone; this is the one week view.

   ONE DAY AT A TIME, AND THAT IS A MEASUREMENT. A seven-column grid of lessons is 35px a column on a
   320px phone, which holds "Ma" of Maths and no time at all. A day is a list, and a week is the chips
   over it — Monday to Friday unless the weekend is asked for, because five 44px chips is the most
   that fit one row of a 320px card and a school week is five days.

   A LESSON IS ITS SUMMARY LINE UNTIL IT IS TAPPED, the qualification shelf's shape: six lessons as
   six 44px lines fit the pane, where six lessons as three open boxes each are three screens of
   scrolling. One open at a time, in place — no sheet, no pop-up. */
```

### ---------- THE FIRST TIME ON THE ACCOUNT, WHAT THIS PHONE HELD COMES WITH YOU

in `tmtRead_`

```
/* ---------- THE FIRST TIME ON THE ACCOUNT, WHAT THIS PHONE HELD COMES WITH YOU ----------------
       Nothing on the account yet, and a week on this phone under your own key — the only place it
       could have been before today. Carried up once: saving it fills `USER.timetable`, so the next
       read takes the account's copy and this branch is never reached again. An empty week on the
       account (everything removed on purpose) is still a week, so it is not re-filled from here. */
```

### ---------- KEPT ON THE PHONE FIRST, THEN SENT

top level, before `tmtSave_`

```
/* ---------- KEPT ON THE PHONE FIRST, THEN SENT ---------------------------------------------------
   `docketSave`'s order and for its reason: a lesson that waits for a round trip before it is on the
   list feels broken on a train. Debounced, because a subject typed letter by letter is one intention
   and not nine writes to a spreadsheet cell. A failure is SAID — a week that looks saved and is not
   is found out on the other phone, which is the whole reason this is on the account. */
```

### ---------- THE COLOUR IS THE SUBJECT'S, NOT THE LESSON'S

top level, before `TMT_HUES`

```
/* ---------- THE COLOUR IS THE SUBJECT'S, NOT THE LESSON'S ------------------------------------------
   Maths is one colour on Monday and on Thursday with nothing to choose — a colour picker per lesson
   would be seven places to make Maths blue. Ten hues declared on `.tmt`, the chess board's rule: they
   are this widget's convention and nothing else in the app wants them.

   HANDED OUT AND REMEMBERED, NOT HASHED. The first version hashed the subject's letters into eight
   hues, and a screenshot of an ordinary Monday showed Chemistry and History in the same red: five
   subjects in eight colours collide four times in five (8·7·6·5·4 / 8⁵ is 0.21). So each subject gets
   the first colour no other subject is wearing, kept in `colours` so it does not move when a subject is
   added earlier in the week, and given back when the last lesson in that subject goes. Up to ten
   subjects never share; past ten it is the least-worn hue, which is the best ten colours can do. */
```

### LETTERS IN ANY ALPHABET, NOT a-z.

top level, before `tmtSubKey_`

```
/* LETTERS IN ANY ALPHABET, NOT a-z. The first version kept `[a-z0-9]` — `spellKey_`'s reduction —
   and that reduces `Ελληνικά` to nothing, so a Greek lesson, in an app whose library carries Greek
   papers, drew with no colour at all; `Français` and `Español` lost a letter each. A key only has to
   tell two subjects apart and fold `Maths` onto `maths`, which is what lower-casing and dropping the
   spaces and punctuation does in every script. */
```

### A FORM, SO BUTTONS. `Done` shuts it and puts it in time order; `Remove` takes it off.

in `tmtRow_`

```
/* A FORM, SO BUTTONS. `Done` shuts it and puts it in time order; `Remove` takes it off. Everything
     typed is kept on every keystroke — see the `input` listener — so Done is not a Save and nothing is
     lost by swiping away without pressing it. */
```

### ---------- A BOOKED SESSION, LOCKED

top level, before `tmtBooked_`

```
/* ---------- A BOOKED SESSION, LOCKED ----------------------------------------------------------------
   Its own row and not a lesson: no boxes, no Remove, because it is not this widget's to change — it
   is a booking, and it is changed where bookings are. Tapping it opens the session (`job`, the
   handler `Your week`'s blocks used), so the one week view still leads to the receipt. Green on its
   edge, the colour a session has always been here; the hours and the place on its second line. */
```

### NOT SAVED WHEN DRAWN AHEAD (`AHEAD.running`, shell.js; docs/history/341).

in `tmtHtml_`

```
/* NOT SAVED WHEN DRAWN AHEAD (`AHEAD.running`, shell.js; docs/history/341). A week from before the colours
     existed is given them here and saved — a POST, 900ms later — and the builder draws this card for nobody
     in the quiet, where "nothing runs for nobody" is the rule. Found when `check-widgets.js` was given a person
     with a week of her own (review, 12 Oct): her draw ahead asked the backend. The colours are worked out for
     the drawing either way; the save waits for a start somebody is looking at. */
```

### ---------- A LESSON SHUT WITH NOTHING IN IT IS NOT A LESSON

top level, before `tmtShut_`

```
/* ---------- A LESSON SHUT WITH NOTHING IN IT IS NOT A LESSON ------------------------------------
   `Add a lesson` writes a row before anything is typed — it has to, or the boxes would have nowhere
   to keep a keystroke — so pressing it by mistake and then Done, or another day, or another lesson,
   left an `Untitled` line for ever, and the only way off it was Remove. Shutting a lesson with no
   subject and no note takes it away instead: an empty line is not something anybody wrote down.
   The TIME does not count, because Add filled that in, not the person. */
```

### KEPT ON EVERY KEYSTROKE AND NOT REDRAWN.

top level, before `tmtKeep_`

```
/* KEPT ON EVERY KEYSTROKE AND NOT REDRAWN. A redraw would take the caret out of the box mid-word;
   the summary line catches up when the lesson is shut.

   `change` AS WELL AS `input`, for the time box. A phone's own time wheel has not always fired
   `input` as it turns — older iOS fired only `change`, as the wheel was put away — and a time that
   reached the box and not the store is a lesson that goes back to nine o'clock when it is shut.
   Both write the same value, so a browser that fires both writes it twice and nothing else. */
```

### WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter and Herd Mentality in one widget.

top level, before `WORD_GAMES`

```
/* ==================================================================================================
   WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter and Herd
   Mentality in one widget. The note over the `wordgames` entry in map.js is the argument; this is
   the switch.

   EACH BODY IS THE CARD IT USED TO BE, minus its own `.card` and heading: a sentence, the game's
   `<k>-card` and whatever its engine builds round it. The engines find their parts by id exactly as
   before, so a body here is the only thing that moved. */
```

### NO NOTE LINE UNDER THE CARD.

in `WORD_GAMES`

```
/* NO NOTE LINE UNDER THE CARD. `#imp-said` was here and said a sentence on every screen — see
       "a picture, a big line, a small line and one button" over `IMP_MIN`. With nothing left to write
       to it, an empty paragraph would only be a margin.

       AND NO LINE OVER IT, the one game in this list without its sentence. It was "Everyone gets the
       word but one. Find the imposter.", on every screen of every round, and the owner, 11 Oct: "THERE
       IS TOO MUCH FLUFF with talking and all sorts. Even written." The dropdown over the card already
       says "Imposter"; the rules are the ones everybody at the table plays by. The other seven keep
       theirs — a clock, a forbidden list or a hot seat is a rule somebody new has to be told. */
```

### HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there."

in `WORD_GAMES`

```
/* HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there." It
     was left out of the merge on the builder's reasoning (a question everybody answers at once is
     not a word to get across), and that was a call nobody had asked for. Its engine is untouched:
     `initHerd` deals into `#herd-q` exactly as it did on its own card.

     THE WRAPPER CARRIES TWO NAMES AND BOTH ARE LOAD-BEARING. `id="herd-card"` because every game in
     this list draws into a `<k>-card`, and `check-flow.js` asks for one per option in the dropdown;
     `class="herd-card"` because `.herd-card .herd-q` is what sets the question large enough to be
     read across a table — without it the question drops to body text and the game is a phone one
     person reads to themselves.

     NO `stop`, because nothing runs: no clock, no secret on the screen. A question left up when the
     column goes is a question anybody may see. */
```

### THE PICKER AND THE CHOSEN GAME'S CARD, AND NOTHING THAT RUNS — the widget's declared `draw`, which the builder uses to draw it before anybody arrives

top level, before `wgPaint_`

```
/* THE PICKER AND THE CHOSEN GAME'S CARD, AND NOTHING THAT RUNS — the widget's declared `draw`, which the
   builder uses to draw it before anybody arrives (docs/history/341). Its start drives `PARTY`, the round
   shared by the classroom games, and that must happen only for somebody looking. */
```

### REBUILT ONLY WHEN THE GAME CHANGED.

in `wgPaint_`

```
/* REBUILT ONLY WHEN THE GAME CHANGED. A repaint runs `start` on markup `paint` has just replaced,
     so the slot is empty and gets its body; a start on a slot already holding this game's body (a
     second start without a repaint) leaves it alone, which is what keeps a button under a finger. */
```

### THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its own stop read it as "the column is gone":

top level, before `slot`

```
/* THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its
     own stop read it as "the column is gone": Articulate's clock stops, a party round pauses until
     somebody comes back and presses Resume, Imposter's word is hidden. */
```

### TOUCH TYPING — the `typing` widget on the Tools column.

top level, before `KT_HOME`

```
/* ==================================================================================================
   TOUCH TYPING — the `typing` widget on the Tools column. The note over its entry in map.js says why
   it is a tool; this is the engine.

   ASKED FOR AS *"Add a widget for keyboard practice with no eyes like that one website in links"*
   and again as *"add keyboard tool widget."* The website is L082 in data/settings/links.json,
   TypingClub, "Learn to touch-type." So it is that shape and nothing bigger: a line to copy, a
   keyboard drawn on the card with each key in the colour of the finger that presses it and the NEXT
   key lit, so the eyes stay on the screen and the hands learn where things are by themselves. WPM
   and accuracy under it, and a ladder of five lessons that opens one rung at a time.

   `kt-`, NOT `tt-`. `.tt` and `#tt-*` are the Times Tables sprint (map.js, docs/history/235), and a
   second widget sharing a prefix is a stylesheet rule that lands on both.

   NO `stop`, ON PURPOSE. There is no clock running: WPM is worked out from the time of the first and
   the latest keystroke, at the keystroke, so a card nobody is typing into costs nothing — and a
   widget with no `stop` is drawn with its page, five pages ahead, rather than popping in on arrival.
   See `drawWidget_` in find.js for why that matters. */
```

### THE LADDER. `keys` is every letter the lesson may use; `fresh` is what it adds, and a line leans towards words that hold one, because a home-row word in the

top level, before `KT_HOME`

```
/* THE LADDER. `keys` is every letter the lesson may use; `fresh` is what it adds, and a line leans
   towards words that hold one, because a home-row word in the top-row lesson practises nothing new.
   Capitals and punctuation add no LETTERS — they add the shift key and the marks — so they are
   flags rather than a longer `keys`. */
```

### "AS ACCURACY HOLDS":

top level, before `KT_HOLD`

```
/* "AS ACCURACY HOLDS": three lines at nine in ten or better opens the next rung. Speed is not asked
   for — a touch typist who is accurate gets fast, and one who is fast and looking at their hands has
   learnt the wrong thing, which is the whole of what this widget is for. */
```

### ONE LIST, FILTERED PER LESSON, rather than five lists.

top level, before `KT_WORDS`

```
/* ONE LIST, FILTERED PER LESSON, rather than five lists. A word in the home-row list with a `t` in it
   would be a key the lesson has not taught yet, and five hand-kept lists are five chances to write
   one; filtering by `keys` makes that impossible. The home-row words are first because only they
   survive the first filter — nine letters and no vowel but `a` is a short dictionary. */
```

### THE KEYBOARD, AND WHICH FINGER OWNS EACH KEY.

top level, before `KT_ROWS`

```
/* THE KEYBOARD, AND WHICH FINGER OWNS EACH KEY. Columns, not keys, decide the finger: the index
   fingers take two columns each and the right little finger takes everything past the `o`. 0-3 are
   the left hand little to index, 4-7 the right hand index to little, 8 the thumbs. */
```

### ---------- KEPT ON THE DEVICE, UNDER WHOEVER IS SIGNED IN

top level, before `ktKey_`

```
/* ---------- KEPT ON THE DEVICE, UNDER WHOEVER IS SIGNED IN ----------------------------------------
   The timetable's rule and its key pattern: `whoIs_` is the same answer the answer boxes use, so two
   students sharing a laptop climb two ladders. Signed out it still works under the bare key. Kept:
   the lesson somebody is on, how far up they have opened, how many lines each lesson has held, and
   the best speed — the LINE itself is not kept, because a half-typed line from last week is not
   something anybody wants to come back to.
   A FUNCTION, NOT A `const` ARROW like `tmtKey_`, so it reaches `window` and a journey can clear it
   without a hook of its own in check-flow's export list. */
```

### THE LINE IN HAND. In memory, and stamped with who it belongs to, so a sign-in on the same machine does not hand the next person the last one's half-finished

top level, before `KT`

```
/* THE LINE IN HAND. In memory, and stamped with who it belongs to, so a sign-in on the same machine
   does not hand the next person the last one's half-finished line and score. `ktNow_` is a function
   for the same reason `ktKey_` is: a journey reads the line through it. */
```

### A LESSON BY ITS NUMBER, the first for one that is not there.

top level, before `ktLesson_`

```
/* A LESSON BY ITS NUMBER, the first for one that is not there. A function rather than an index into
   the `const` wherever it is wanted, because only a function declaration reaches `window` — and the
   journey in check-flow reads every lesson's letters through this to ask what each line may hold. */
```

### NOT THE SAME WORD TWICE RUNNING.

in `ktLine_`

```
/* NOT THE SAME WORD TWICE RUNNING. The home row's dictionary is thirty words, and the first
       screenshot drew "alas alas" — which is practising one word, not the row. Asked of the word as
       it will be drawn, names included: the first guard ran before a name was chosen and the journey
       caught "Friday Friday". */
```

### ---------- WHAT A LINE SCORES

top level, before `ktWpm_`

```
/* ---------- WHAT A LINE SCORES ------------------------------------------------------------------
   WPM IS THE TYPISTS' WORD — five characters, spaces included — so a line of short words and a line
   of long ones are measured alike. Accuracy is right keys over all keys. A wrong key does NOT move
   the line on — the cursor waits for the right one, keybr's rule rather than TypingClub's — and is
   counted, so a line cannot be finished by mashing and the next key lit is always the one wanted. */
```

### ---------- DRAWN

top level, before `ktKeyHtml_`

```
/* ---------- DRAWN ---------------------------------------------------------------------------------
   THE KEYBOARD IS A PICTURE, NOT A KEYPAD. It is `aria-hidden` and nothing on it can be pressed: on
   a laptop the keys are under the fingers, and on a phone the phone's own keyboard is the one being
   typed on. So its keys are about 18px at 320 and that is not a breach of the 44px rule — nothing
   on it is a target. The one target is the line, which is what focuses the hidden box. */
```

### EVERY COPY, BY CLASS — the Saved column draws this markup again, the timetable's reason.

top level, before `ktPaint_`

```
/* EVERY COPY, BY CLASS — the Saved column draws this markup again, the timetable's reason. And THE
   BOX IS KEPT: only `.kt-view` is rewritten, because rewriting the hidden input on every keystroke
   would take the focus away from it and the next key would land on the page. */
```

### ---------- HOW KEYS GET IN

top level, before `el`

```
/* ---------- HOW KEYS GET IN ------------------------------------------------------------------------
   THROUGH A HIDDEN BOX THAT HAS THE FOCUS, which is what keeps the app's own key listeners out of
   it: the pager's arrows (shell.js) and the maze's (games.js) both stand down inside an input.

   AND ON `keydown`, IN THE CAPTURE PHASE, with the event stopped there. Not every listener stands
   down: Flabby Pird's takes the space bar with `preventDefault` whenever its canvas is anywhere in
   the document, and the games column's pages sit in the document beside this one — so a space typed
   here could be eaten before it reached the box. Caught on the way DOWN, at the document, nothing
   further along ever sees it.

   `input` IS THE SECOND DOOR, for a phone. Its keyboard sends `keydown` with the key "Unidentified"
   and puts the character straight into the box, so whatever arrives there is read and the box is
   emptied. A key handled on `keydown` is `preventDefault`ed, so it never arrives twice. */
```

### FOCUSED IN THE TAP ITSELF, synchronously — iOS opens its keyboard only for a focus inside the gesture that asked for it.

top level, before `ktFocus_`

```
/* FOCUSED IN THE TAP ITSELF, synchronously — iOS opens its keyboard only for a focus inside the
   gesture that asked for it. `preventScroll`, because the pane is a window onto a pager and a
   browser scrolling a focused box into view moves the pages under the person. */
```

### ONLY IF THE FOCUS TOOK.

in `ktFocus_`

```
/* ONLY IF THE FOCUS TOOK. A card on a page parked off to the side cannot hold it — measured: the
     focus call returns and `activeElement` is still the body — and a card that said "Eyes here" while
     nothing was listening would be typed into for a whole line before anybody noticed. */
```

### VIDEOS — A SEARCH BAR, FOUR RESULTS UNDER IT, A PLAYER IN THE CARD, AND A FULL SCREEN TILE

top level, before `VID_KINDS`

```
/* ==================================================================================================
   VIDEOS — A SEARCH BAR, FOUR RESULTS UNDER IT, A PLAYER IN THE CARD, AND A FULL SCREEN TILE

   ASKED FOR AS "videos would be in the games column. its one new widget. its a video searcher you
   type in. and there should be a full screen button." — and earlier as "Video cool videos database
   for reals and movies". The roster entry is `videos` in map.js, last on the Games column.

   AND THEN, THE OWNER, 10 Oct: *"make it look more like youtube, the widget, in the sense that at
   first all you see is a search bare, then you search and you see relevant result underneath. max 4
   results show. you click on one, then it shows video. you can click fullscreen to make it
   fullscreen"* — note 321. So the card is ONE OF FOUR THINGS, decided in `vidPaint_`:
     idle      the search bar and nothing else — no count, no list, no admin row, no empty player;
     results   what is typed, narrowed and ranked (`videosFound_`), at most four, best first, with
               one faint line under them when there are more;
     watch     a result tapped: the player, its title and line, and Full screen, in place of the
               results — any edit of the box goes back to the results;
     full      the player over the whole screen, the browser's own full screen or, where a phone
               has none for a frame, the app's (`vidFullOn_`).

   WHAT IT SEARCHES, AND IT IS TWO LISTS THE APP ALREADY HAS OR THE OWNER FILLS:
     - `data/videos.json` — the curated database, one row per video: `title`, `url`, `kind`
       (film | clip; an old "reel" reads as a clip), `tags`, `age`, `notes`, `active`. The owner
       fills it; a row is switched off with `active: false` rather than deleted, the shop's convention.
     - NOT the reels. They were a third list here and were taken out: *"the video widget shouldn't
       acknowledge reels."* The Reel column is where they live.
     - the films — `DATA.films`, which the backend sends to an admin and to NOBODY ELSE (note 068 in
       docs/history). `|| []` is the ordinary fallback and here it is also the whole gate, exactly
       as it is in find.js: nothing in this file decides who may see a film.
       AND THEY ARE WHATEVER IS IN THE NOTFLIX FOLDER — *"Ensure the video searcher is hooked up. Let
       admin be able to search up films which are in the notflix folder on gdrive."* (9 Oct). This card
       was wired all along and an admin found nothing: the films tab was empty, and nothing filled it
       from Drive. `filmsSync` does now (backend/content.gs), and THIS CARD IS WHERE IT IS ASKED FOR —
       on its own for an admin once the last whole pass is a day old, and by hand from a silver Sync
       from Drive tile that only an admin is drawn. See `filmsSyncDue_` below and note 305.

   NOT ALL OF YOUTUBE. A live search of YouTube needs a YouTube Data API key in the page, which in a
   public repository is a published key; that is the owner's decision and it has not been taken. So
   the box searches what is listed, and says how many more it found than the four it shows (or that
   nothing matches), rather than pretending to be YouTube. It used to say "3 of 12 videos" over the
   list; with no list on an idle card there is nothing for that count to count (note 321).

   ---------- WHY YOUTUBE IS EMBEDDED HERE WHEN THE REELS' EMBEDS WERE TAKEN OUT ----------------------
   The owner's word on the reels was "remove the embedded reels. they suck." — see `clipPlayable_`
   above. What sucked was a COLUMN that autoplays, mutes and pauses, falling through to a Drive or
   Instagram iframe it could do none of that to. This card does none of that: nothing plays until a
   row is tapped, and the person then drives the player themselves. A YouTube link has no address a
   `<video>` can read, so the choice for one is an embed or nothing — and the youtube-NOCOOKIE host,
   which sets no tracking cookie until the video is actually played. An `.mp4` plays in a `<video>`,
   as a reel does. A Drive film plays in neither, for the reason note 068 gives (a 3 GB `.mkv`) — so
   it was a door to Drive, until the owner asked for every result to play in the card (10 Oct). It
   plays in DRIVE'S OWN PLAYER now, an iframe on the file's `/preview`, which streams what Drive can
   transcode; and it keeps the door beside Full screen (an Open in Drive tile) for the file Drive will
   not play in a frame. ONLY A FILE FROM THE FILMS LIST: see `vidPlayer_`.

   THE LIST IS FETCHED ON FIRST OPEN, NOT AT BOOT. Every visitor pays for the payload and the
   library; a list of videos is for the ones who come to this card. `?t=LOAD` is the same stamp the
   boot fetches carry, so the service worker's exact-URL cache hands back a fresh copy after a deploy
   and never the old one.
================================================================================================== */
```

### `in` IS WHICH COPY OF THE CARD PLAYS IT — the id of the column the tapped copy is on (`s-games`, `s-saved`).

top level, before `VID`

```
/* `in` IS WHICH COPY OF THE CARD PLAYS IT — the id of the column the tapped copy is on (`s-games`,
   `s-saved`). The Saved column draws this card again when it is starred, and every copy is painted;
   before `in`, every copy built the player, so one tap was an `autoplay` embed in the card in front
   AND one in the copy parked off the glass — two films talking over each other wherever a browser
   lets one play with sound (review of 10 Oct). Only the tapped copy plays; the others show the
   results for what is typed. */
```

### A ROW IS ONE SHAPE WHEREVER IT CAME FROM, built here once rather than at each reader.

top level, before `vidHow_`

```
/* A ROW IS ONE SHAPE WHEREVER IT CAME FROM, built here once rather than at each reader. `how` is
   how it plays: `yt` in an iframe, `file` in a `<video>`, `drive` in Drive's own player (a film
   from the films list whose address is a Drive file — set in `videosAll_`, never here), `out` a
   door to somewhere else, `none` nothing to open. */
```

### EVERY SHAPE A YOUTUBE ADDRESS COMES IN when somebody copies it:

top level, before `vidYouTubeId_`

```
/* EVERY SHAPE A YOUTUBE ADDRESS COMES IN when somebody copies it: the watch page, the share link,
   a Short, an embed, and the nocookie host itself. An id is eleven characters of [A-Za-z0-9_-]; a
   match on anything looser would embed a playlist page or a channel as a broken player. */
```

### THE REELS WERE HERE, numbered by address and listed as "Reel 1", "Reel 2".

in `videosAll_`

```
/* THE REELS WERE HERE, numbered by address and listed as "Reel 1", "Reel 2". Taken out:
     *"the video widget shouldn't acknowledge reels."* Reels are the Reel column's, and listing them
     again here made one thing two places to find it. A row of the owner's own list that was typed
     with kind "reel" is shown as a clip -- it is still a video somebody chose. */
```

### ---------- A FILM, A SERIES OR A DOCUMENTARY — AND ONE THAT IS NOT IN THE DRIVE YET

in `videosAll_`

```
/* ---------- A FILM, A SERIES OR A DOCUMENTARY — AND ONE THAT IS NOT IN THE DRIVE YET ---------------
     `label` IS WHAT IT IS, because every film row said "Film" — a five-season show and a documentary
     included. The words an admin types for a kind are in `tags` with it: `series` and `tv`, `documentary`,
     `film` and `movie`, and the folder's audience (`kids`, `adults`).
     A PLACEHOLDER IS LISTED, not dropped. It was skipped without a word, so an admin searching for a
     film asked for by name was told "Nothing matches that" where Find says "Not in the drive yet" —
     two answers to one question. It is a row that says so and opens nothing (`how: 'none'`). */
```

### A FILE IN DRIVE PLAYS IN THE CARD; A FOLDER CANNOT.

in `videosAll_`

```
/* A FILE IN DRIVE PLAYS IN THE CARD; A FOLDER CANNOT. *"you click on one, then it shows video"*
       (10 Oct, note 321): a film or a documentary whose address is a Drive FILE plays in Drive's own
       player (`vidPlayer_`). A SERIES IS ITS FOLDER (068) — Drive has no player for a folder, so it
       stays the door to it that it always was; and so does any address that is not a Drive file. */
```

### EVERY WORD TYPED HAS TO BE SOMEWHERE IN THE ROW — title, tags, kind, notes.

top level, before `vidForms_`

```
/* EVERY WORD TYPED HAS TO BE SOMEWHERE IN THE ROW — title, tags, kind, notes. An "any word" match
   gets LONGER as you type a second word, which is the opposite of what typing into a search box is
   for; "narrows as you type" was the request. */
```

### ---------- AND THE BEST ONE FIRST, BECAUSE ONLY FOUR ARE SHOWN

top level, before `videosFound_`

```
/* ---------- AND THE BEST ONE FIRST, BECAUSE ONLY FOUR ARE SHOWN ---------------------------------------
   *"you search and you see relevant result underneath. max 4 results show."* (10 Oct.) A list cut at
   four is only as good as its order: in the order the rows were written, "sun" put a weather report
   with `sun` in its tags above a clip called Sun. So every row that narrows is RANKED, YouTube's way —
   by how much of what was typed is the TITLE, since the title is the thing a person has in mind:
     0  the whole query IS the title             "sun" → Sun
     1  the title STARTS with the whole query    "sun" → Sunsets explained
     2  every word STARTS a word of the title    "moon sun" → The sun and moon
     3  every word is somewhere IN the title     "sun" → Tsunami waves
     4  found only in the tags, kind or notes    "sun" → a weather report tagged sun
   TIES: a row that plays in the card, then one that opens elsewhere, then one that cannot open — so
   four places are not spent on doors when there are things to watch — then the title A to Z, so the
   same words always give the same four. The plural rule counts at every rank the narrowing does
   (`gardens` starts the word `garden`), so a word that finds a row also ranks it. */
```

### WHAT IT LOOKS LIKE: YOUTUBE'S LAYOUT AND TYPE, IN THIS APP'S BLACK AND GOLD — note 311

top level, before `VID_BROKEN`

```
/* ==================================================================================================
   WHAT IT LOOKS LIKE: YOUTUBE'S LAYOUT AND TYPE, IN THIS APP'S BLACK AND GOLD — note 311

   ASKED FOR AS *"Can you also make the video serger widget look more like YouTube."* (9 Oct.) So the
   IDIOMS are YouTube's and the colours are this app's: a pill-shaped search box with a magnifier in
   it; a result row that is a 16:9 picture with a small badge in its corner, a bold title of at most
   two lines, and one dim line under it; and, when something plays, the watch page in miniature —
   the player, its title, its line, then Full screen. NO LOGO, NO WORDMARK, NO RED PLAY BUTTON: it
   should read like YouTube and not pretend to be it, which is also why nothing here is red.

   THE PICTURES, AND WHERE EACH ONE COMES FROM:
     - A YOUTUBE ROW'S is `i.ytimg.com/vi/<id>/mqdefault.jpg`, 320x180 — already 16:9, so nothing is
       cropped. `i.ytimg.com` is YouTube's COOKIELESS image host, the still-picture half of the
       nocookie bargain under `vidPlayer_`: a list of thumbnails sets no cookie, and
       `referrerpolicy="no-referrer"` keeps this page's address out of the request — what YouTube
       learns is that some device fetched that picture, which is the price of showing one at all. The
       embed is still the only thing that talks to YouTube proper, and only after a tap.
       SAID PLAINLY, BECAUSE IT IS A CHOICE AND THE VIEWERS ARE CHILDREN: before note 311 nothing on a
       device reached any YouTube host until a row was tapped. Now opening the card fetches one
       picture per YouTube row from `i.ytimg.com`, before any tap. No cookie and no referrer, but the
       device's address does reach Google. Taking it back is one line: `vidThumb_` answering '' for
       `yt`, and every row is the poster.
     - A DRIVE FILM'S is Drive's own `thumbnail?id=<file id>`, the id read here from the row's Drive
       address — `drive_id` never leaves the server (note 068), and the address it is built into is
       the one fact the row does carry. A SERIES is a FOLDER, and a folder has no picture.
       ONLY A ROW FROM THE FILMS LIST ASKS (`fromFilms`), never the owner's list. `drive.google.com`
       is a cookie-carrying Google host, unlike `i.ytimg.com`; the films list reaches an admin alone,
       and a Drive address the owner typed into data/videos.json reaches every child. It was asked
       for any row with a Drive address, so a student's phone would have called Drive the moment the
       card drew, untapped (review of 9 Oct). An owner's Drive row is the poster, for everybody.
     - EVERY PICTURE CAN FAIL, and Drive's fail often: no thumbnail for a big `.mkv`, none at all once
       the folder's sharing changes, none when a browser keeps Google's cookies from this site. So the
       POSTER is drawn UNDER every picture, always — it is what shows while one loads and what is left
       when one fails — and a failed picture is taken away by ONE listener below, not by an `onerror`
       written into the markup: a script string built beside a title is a door this file keeps shut.
       AND YOUTUBE FAILS WITHOUT AN ERROR: an unknown, removed or private id answers 404 WITH A PICTURE,
       a grey 120x90 one, which the browser draws and calls loaded. So a second listener, on `load`,
       takes away a YouTube picture that is 120px wide or less — `mqdefault` is always 320 — and the
       poster shows instead of a flat grey block.

   A ROW IS A LIST ITEM, NOT A TILE, and this is the one place a reader could wonder, since CLAUDE.md
   says a thing has tiles. A row IS the thing — the picture and the title are what is pressed, the
   way a result is pressed on YouTube — and a tile is an action UNDER a thing. So a row stays the
   `<button>` (plays here) or the `<a>` (opens a page or a folder elsewhere) it always was, and Full
   screen, Exit full screen and Open in Drive, which are actions on the thing playing, are tiles.
================================================================================================== */
```

### EVERY PICTURE THAT FAILED THIS VISIT, by address, so the list repainted on the next keystroke draws the poster straight away rather than asking again and

top level, before `VID_BROKEN`

```
/* EVERY PICTURE THAT FAILED THIS VISIT, by address, so the list repainted on the next keystroke draws
   the poster straight away rather than asking again and flashing a broken picture for a frame each
   time. A visit, not for ever: a folder shared again tomorrow should get its pictures back. AND NOT
   PAST A SIGN-OUT: a Drive address here carries a film's file id, the folder's only lock (note 068),
   so `signedOut_` empties it beside `DATA.films`. */
```

### THE FILE ID IN A DRIVE ADDRESS:

top level, before `vidDriveId_`

```
/* THE FILE ID IN A DRIVE ADDRESS: the viewer link `filmsUrl_` writes (`/file/d/<id>/view`) and the two
   shapes a person pastes (`open?id=` and `uc?id=`). A FOLDER is not matched — a series' row opens its
   folder, and Drive has no picture of a folder. */
```

### THE POSTER: what a row with no picture shows, so the list keeps ONE rhythm — every row the same 16:9 block — rather than a picture, a grey hole, a picture.

top level, before `vidPoster_`

```
/* THE POSTER: what a row with no picture shows, so the list keeps ONE rhythm — every row the same 16:9
   block — rather than a picture, a grey hole, a picture. A FLAT FRAME AND THE KIND'S MARK, NOTHING ELSE:
   a play mark for a clip, a film strip for anything from the folder. YouTube's own missing picture is
   a flat neutral 16:9 frame, and that is what this copies.
   IT WAS A GOLD GRADIENT WITH THE TITLE'S FIRST LETTER IN IT, and that was the one thing on the card
   that did not read as YouTube — it read as a contacts list. Initials repeat and tell rows apart badly:
   two T's in an admin's fourteen, and forty-two "Invented Film Number …" rows drew a column of identical
   gold I's. The title beside the frame is what tells rows apart; the frame only keeps the rhythm.
   `aria-hidden`: a mark is not a word, and the title is the text right beside it. */
```

### ---------- A FILM FROM THE FOLDER, IN DRIVE'S OWN PLAYER

in `vidPlayer_`

```
/* ---------- A FILM FROM THE FOLDER, IN DRIVE'S OWN PLAYER -------------------------------------------
     *"you click on one, then it shows video"* (10 Oct, note 321). `drive.google.com/file/d/<id>/preview`
     is the player Drive itself draws for a file it is asked to show in a frame — the same page Google
     Sites embeds — so a film streams at whatever Drive can transcode instead of downloading 3 GB.
     `how === 'drive'` is set in `videosAll_` for a films-list row whose address is a Drive FILE and
     nothing else: a Drive address the owner typed into data/videos.json stays a link (note 311 — that
     list reaches every child, and `drive.google.com` carries Google's cookies), and a series is a
     folder, which no player opens. BUILT ONLY AFTER THE TAP: nothing calls this with a row that was not
     chosen, so no device asks Drive for a player it was not asked for. `fullscreen` in `allow` and
     `allowfullscreen` so Drive's own full-screen button works inside it; `autoplay` for the tap that
     chose it, though Drive's player waits for its own. The referrer is the origin and no more — the
     browser's default, said here as the YouTube frame says it. */
```

### UNDER THE PLAYER: ITS TITLE AND ONE LINE — YouTube's watch page, where the first thing under the picture is what it is called.

top level, before `vidNow_`

```
/* UNDER THE PLAYER: ITS TITLE AND ONE LINE — YouTube's watch page, where the first thing under the
   picture is what it is called. The line is the row's: the kind, then the age.
   THE FULL SCREEN TILE SITS BESIDE THEM, NOT UNDER (`.vid-under`), where YouTube keeps the control on
   the title's row. Under them it was a 44px row of its own on top of the title's two lines, and that
   made a student's card with something playing taller than its pane at 390x844, so `paneReach_` drew
   it at 0.91 and every target on it, Full screen and the search box among them, came out at 40px
   where the old card kept 44 (review of 9 Oct). */
```

### THE DIM LINE: what the row already said after its kind, which has moved to the badge — a placeholder's reason, the year, a series' seasons, the age.

in `vidRow_`

```
/* THE DIM LINE: what the row already said after its kind, which has moved to the badge — a placeholder's
     reason, the year, a series' seasons, the age. Absent when there is nothing to say, rather than an
     empty line. ONE LINE, as YouTube's is: the stylesheet clips it, so the reason a row opens nothing
     ("not in the Drive yet") comes FIRST and a narrow row loses the year rather than the reason.
     "OPENS IN A NEW TAB" IS NOT HERE ANY MORE: the badge's out-arrow says it, and said twice it wrapped
     six of nine film rows at 320 onto a second line, past the bottom of their pictures, so the rows
     came at two different pitches (review of 9 Oct). */
```

### THE BADGE, IN YOUTUBE'S DURATION SPOT — AND ONLY WHEN IT TELLS THIS ROW FROM ITS NEIGHBOURS.

in `vidRow_`

```
/* THE BADGE, IN YOUTUBE'S DURATION SPOT — AND ONLY WHEN IT TELLS THIS ROW FROM ITS NEIGHBOURS. YouTube
     puts something different on every picture there; "Clip" is what every row a student is ever shown
     says, so it was the same word five times down a student's list. The plain kind is left off; a kind
     that tells a row apart (Film, Series, Documentary) is drawn, and so is the out-arrow on a row that
     leaves. The arrow is `role="img"` WITH A NAME because the words "opens in a new tab" are no longer
     in the line beside it, and a screen reader would otherwise never hear where the link goes. A film
     that plays in the card (`drive`) has no arrow: it does not leave. */
```

### THE WORDS COME FIRST IN THE MARKUP, AND THE PICTURE IS DRAWN FIRST (`order` on `.vid-th`).

in `vidRow_`

```
/* THE WORDS COME FIRST IN THE MARKUP, AND THE PICTURE IS DRAWN FIRST (`order` on `.vid-th`). So a screen
     reader hears the title, then its line, then the kind — the picture's labels never before what the
     row is called.
     NO "PLAYING" VEIL ANY MORE. A row that is playing was marked on its picture while the list stayed
     under the player (note 311); the watch view REPLACES the results now (note 321), so the row that is
     playing is never drawn beside its player and there is nothing to mark. */
```

### A PICTURE THAT FAILED IS TAKEN AWAY, AND THE POSTER UNDER IT IS WHAT IS LEFT.

top level, before `vidGone_`

```
/* A PICTURE THAT FAILED IS TAKEN AWAY, AND THE POSTER UNDER IT IS WHAT IS LEFT. One listener for every
   copy of the card, in the CAPTURE phase because `error` does not bubble — a listener on the list in
   the bubbling phase would never hear it. It swaps a class and remembers the address; it runs nothing
   built from data. */
```

### AND A YOUTUBE PICTURE THAT "LOADED" AS YOUTUBE'S GREY STAND-IN.

top level, before `im`

```
/* AND A YOUTUBE PICTURE THAT "LOADED" AS YOUTUBE'S GREY STAND-IN. `i.ytimg.com` answers an unknown,
   removed or private id with 404 AND A 120x90 GREY PICTURE; the browser draws the picture and fires
   `load`, never `error`, so the listener above never heard it and a flat grey block covered the poster
   (review of 9 Oct). `mqdefault` is 320x180 whenever the video exists, so 120 wide or less is the
   stand-in. YouTube's host only: Drive's picture of a small or portrait file can honestly be narrow. */
```

### EVERY PART OF THE CARD THAT IS WRITTEN WHOLE, AND WHAT WAS LAST WRITTEN INTO IT — so a repaint that would write the same markup writes nothing.

top level, before `VID_DRAWN`

```
/* EVERY PART OF THE CARD THAT IS WRITTEN WHOLE, AND WHAT WAS LAST WRITTEN INTO IT — so a repaint that
   would write the same markup writes nothing. The player has its own rule (`stage.dataset.k`); this is
   for the title, the tiles, the results and the admin's row, so a picture is not fetched again and a
   tile under a finger is not replaced by its own copy. */
```

### ---------- THE BAR STAYS WHERE IT IS WHILE A SEARCH IS TYPED

top level, before `vidHold_`

```
/* ---------- THE BAR STAYS WHERE IT IS WHILE A SEARCH IS TYPED -------------------------------------------
   THE CARD MAY GROW UNDER THE FINGER, NEVER SHRINK. The column holds a card somebody is using by its top
   (`HOLD_AT`, shell.js) and lifts it only as far as it must to stay on the glass — so when the first
   letter took the card from the bar alone to four results, the column lifted it, and when the results
   narrowed to one the card shrank and the column put it straight back down. Measured by the review of
   10 Oct, the bar's top keystroke by keystroke for "sunset" and back: 311 → 183 → 183 → 183 → 183 → 311
   → 311 at 320x568 for an admin, 128px both ways in the middle of a word; 54px for a visitor at 320,
   88px at 844x390. YouTube's bar stays where it is, and the old card never did it either: it started
   tall (the whole list) and only got shorter as you typed.
   SO WHILE RESULTS ARE ON A COPY, THE RESULTS ARE HELD AT THE TALLEST THEY HAVE BEEN IN THIS SEARCH
   (`minHeight` on `.vid-results`, in its own px — `offsetHeight` is not scaled by `paneReach_`'s zoom,
   measured in Chromium 141). The room a narrowed search leaves is left under the results, where YouTube
   leaves it, and an admin's Sync row stays at the foot of the card rather than riding up under one row.
   A search that starts by leaving a film (an edit over the watch view) is given the height the film had
   (`before`, the box read before the paint), so that first letter does not drop the bar either. LET GO
   when the search ends: the box emptied (the bar alone again), a result tapped (the watch view is a new
   page, as YouTube's is), or the column left (`videosStop_`). Pressing Search on the keyboard does NOT
   end it — the results stay as they are. The box's own `minHeight` is the app's full screen's (`vidFullOn_`)
   and is not touched here. */
```

### THE RESULTS, THE PLAYER AND THE TILES ARE REPAINTED; THE BOX IS NOT.

top level, before `vidPaint_`

```
/* THE RESULTS, THE PLAYER AND THE TILES ARE REPAINTED; THE BOX IS NOT. Rewriting the `<input>` on every
   keystroke would drop the keyboard on a phone after one letter — the flinch the note over `tile_`'s
   "filling the shape" records. So the box is built once per copy and only its siblings change.

   ---------- WHICH OF THE FOUR THINGS THE CARD IS (note 321) ------------------------------------------
   *"at first all you see is a search bare, then you search and you see relevant result underneath.
   max 4 results show. you click on one, then it shows video."* — the owner, 10 Oct.
     IDLE: nothing typed (or only spaces) and nothing playing. THE BAR ALONE, for everybody — the admin
       too: no "12 videos" line, no list, no Sync row and no empty player. The count went with the list
       it counted; a number over nothing is a sentence about nothing.
     RESULTS: something typed. At most four rows, ranked (`videosFound_`), and under them ONE faint line
       when there are more — "8 more — keep typing to narrow", a count rather than a silence — or
       "Nothing matches that." when nothing does.
     WATCH: a result tapped. The player, its title and line, and the Full screen tile, IN PLACE OF the
       results, with the bar still on top holding what was typed. ANY EDIT of the box leaves it (the
       `input` listener below empties the player) and the results for the new words come back. ONLY IN
       THE COPY THAT WAS TAPPED (`VID.in`): a copy on another column (Saved) shows the results for the
       same words with an empty stage, so one tap is one player.
     STILL COMING: something typed before the lists have landed. THE BAR IS NEVER VEILED — it is drawn
       and usable from the first paint, so a fast thumb types into it — and the ONE loader
       (`loading_()`, shell.js) stands where the results will be until they can be ranked. It used to
       veil the whole card (`aria-busy` over the box), which was right while the card was a list, and
       wrong for a card whose first job is to be typed into.
   BOTH SOURCES: the owner's list is `data/videos.json` and an admin's films come with the payload, so
   an empty list with either still out is a list on its way — measured on 9 Oct with the payload held,
   an admin's card said "No videos listed yet" over films that landed fifteen seconds later. "No videos
   listed yet" is a fact once both have answered, and keeps its words. */
```

### ONE PLAYER, IN THE COPY THAT WAS TAPPED (`VID.in`).

in `vidPaint_`

```
/* ONE PLAYER, IN THE COPY THAT WAS TAPPED (`VID.in`). A film started by something other than a tap —
     a check's state setting `VID.at` — is given the copy on the column in front, or the first, once,
     so a later paint does not move it to another copy and restart it. A tapped copy that is not drawn
     at this moment shows nothing anywhere rather than a player in a copy nobody tapped. */
```

### ---------- THE ADMIN'S ROW: SYNC FROM DRIVE, AND WHEN IT LAST RAN

in `vidPaint_`

```
/* ---------- THE ADMIN'S ROW: SYNC FROM DRIVE, AND WHEN IT LAST RAN ----------------------------------
     ONLY FOR AN ADMIN, and an EMPTY ELEMENT for everybody else — no tile, no sentence, no word that says
     films exist. `isAdmin()` decides what is DRAWN; what is SENT is the backend's, and a student's
     payload has no film and no stamp in it to draw from. Silver, like every admin control (tiles.js).
     The sentence beside the tile is the tile's note made visible: a 44px plate has no room for "synced
     an hour ago", and that is the line the admin is looking for.
     AND ONLY UNDER A SEARCH'S ANSWER (note 321): at the foot of the card while results or "Nothing
     matches that." are on it, which is when an admin is looking for a film and may want the folder
     read again — never in the idle bar, never under a player. The sync that runs by itself once a day
     (`filmsSyncDue_`) does not need the row drawn, and is unchanged. */
```

### THE PILL IS A `<label>` ROUND THE BOX, so a tap on the magnifier is a tap on the box.

in `vidPaint_`

```
/* THE PILL IS A `<label>` ROUND THE BOX, so a tap on the magnifier is a tap on the box. The
         placeholder is YouTube's one word; the box's NAME is still "Search videos", for a screen
         reader, which cannot see what the card is called above it. `type="search"` keeps the phone's
         keyboard saying Search and the clearing ✕ a browser draws in one, which YouTube's pill has.
         THE RESULTS UNDER THE PLAYER'S PLACE AND THE ADMIN'S ROW UNDER BOTH: the card reads top to
         bottom as the owner described it — the bar, then what it found. */
```

### FULL SCREEN, AND FOR A FILM FROM THE FOLDER, OPEN IN DRIVE BESIDE IT — the way out when Drive will not play a file in a frame

in `vidPaint_`

```
/* FULL SCREEN, AND FOR A FILM FROM THE FOLDER, OPEN IN DRIVE BESIDE IT — the way out when Drive will
       not play a file in a frame (a big `.mkv`, the folder's sharing changed): the door the row itself
       was until it played here. While this copy is the app's own full screen the one tile is Exit. */
```

### AN ADMIN'S CARD KEEPS THE FILMS CURRENT ON ITS OWN — once per person per visit, when the last whole pass is a day old or a pass is part-way.

in `initVideos`

```
/* AN ADMIN'S CARD KEEPS THE FILMS CURRENT ON ITS OWN — once per person per visit, when the last whole
     pass is a day old or a pass is part-way. `initVideos` runs again when the payload lands and when
     somebody signs in, so the first call that can see an admin's stamp is the one that asks. */
```

### THE FILMS FROM DRIVE — ASKED FOR BY THE CARD, FOR AN ADMIN

top level, before `FILMS_STALE_MS`

```
/* ==================================================================================================
   THE FILMS FROM DRIVE — ASKED FOR BY THE CARD, FOR AN ADMIN

   `DATA.filmsSync` IS THE ADMIN'S AND NOBODY ELSE'S: `{ at, more, folder, found }`, the end of the last
   whole pass through the Notflix folder. Absent from every other payload, and absent from an older
   backend's — which is why its absence, and not the role, is what stops the card asking: a sync posted
   to a backend that has never heard of it would be a refusal on every visit.

   THE REPLY CARRIES THE LIST. `filmsSync` answers with the films as `doGet` builds them and the stamp
   beside them, so the card is current the moment it answers — no reload, and no rebuild of a payload
   that never held the films anyway (`payloadWithFresh_` in backend/doget.gs). A pass too big for one
   run answers `more`, and the card asks again, a few times, until the pass is whole.

   A REPLY FOR SOMEBODY WHO HAS GONE IS DROPPED. A sync takes seconds, and a shared iPad can be signed
   out and handed on in that time; films written into the next person's `DATA` would be the one thing
   `signedOut_` exists to prevent.
================================================================================================== */
```

### `autoFor` — whom the card has already synced for on its own this visit, so a sync that FAILS (no folder found, the backend not yet deployed) is said once in

top level, before `FILMSYNC`

```
/* `autoFor` — whom the card has already synced for on its own this visit, so a sync that FAILS (no folder
   found, the backend not yet deployed) is said once in the admin's line and not posted again on every
   return to the column. `err` is that sentence, until a sync succeeds. */
```

### LEAVING THE COLUMN STOPS IT — the Reels column's lesson in note 047:

top level, before `videosStop_`

```
/* LEAVING THE COLUMN STOPS IT — the Reels column's lesson in note 047: a clip somebody turned the
   sound up on went on talking from a screen two swipes away. An iframe cannot be paused from here,
   so the player is emptied, and a tap on the row starts it again. */
```

### AND THE SEARCH'S HELD HEIGHT GOES WITH THE FINGER THAT HELD IT (`vidHold_`):

in `videosStop_`

```
/* AND THE SEARCH'S HELD HEIGHT GOES WITH THE FINGER THAT HELD IT (`vidHold_`): the column lets go of
     the card's top on leaving (`HOLD_AT`), so coming back centres a card of its own height, not one
     still as tall as the longest answer it gave. */
```

### ANY EDIT OF THE BOX LEAVES THE WATCH VIEW (note 321):

top level, before `el`

```
/* ANY EDIT OF THE BOX LEAVES THE WATCH VIEW (note 321): the player is EMPTIED — an iframe cannot be
   paused from outside it, so emptied is the only stopped there is — and the results for the new words
   are drawn where it was. Clearing the box is the bar alone again. Typing a second search over a film
   that keeps talking under the results was the alternative, and YouTube does not do that either: a
   new search is a new page. */
```

### PRESSING SEARCH ON THE KEYBOARD PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS WHERE THEY ARE.

top level, before `el`

```
/* PRESSING SEARCH ON THE KEYBOARD PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS WHERE THEY ARE. The box
   says `enterkeyhint="search"`, so a phone shows a Search key — and nothing answered it: the focus
   stayed in the box and the keyboard stayed up, over exactly the place the four results are drawn (y
   480 to 768 at 390x844, review of 10 Oct). The results are already there, as you typed, so there is
   nothing to search for; what the key is for is letting go, which is what it does on YouTube. Not in a
   `<form>`, so there is no submit to stop; `preventDefault` keeps a browser from doing anything else
   with the key. The held height (`vidHold_`) stays: the results do not move when the keyboard goes. */
```

### A TAP ON A RESULT PLAYS IT IN THE CARD, in place of the results — IN THAT COPY OF THE CARD (`VID.in`) and no other.

top level, before `VID.at`

```
/* A TAP ON A RESULT PLAYS IT IN THE CARD, in place of the results — IN THAT COPY OF THE CARD (`VID.in`)
   and no other. AND THE PHONE'S KEYBOARD IS PUT AWAY: a tap on a button does not take the focus from the
   box on an iPhone, so the keyboard stayed up over the player it had just asked for. `blur` is the box
   letting go, the way pressing Search does (the listener above). */
```

### FULL SCREEN — *"you can click fullscreen to make it fullscreen"* (10 Oct, note 321)

top level, before `VID_FS`

```
/* ==================================================================================================
   FULL SCREEN — *"you can click fullscreen to make it fullscreen"* (10 Oct, note 321)

   THE BROWSER'S OWN FIRST: `requestFullscreen` on the player itself, so what fills the screen is the
   picture and not the card with a search box round it (older Safari: `webkitRequestFullscreen`). A
   `<video>` on an iPhone has only `webkitEnterFullscreen`, the phone's own player, which is better than
   anything drawn here, so it gets that.

   AND WHERE THERE IS NO FULL SCREEN FOR A FRAME AT ALL — Safari on an iPhone, which offers element full
   screen to nothing but a `<video>`, and a YouTube or Drive player is a frame — THE APP FILLS THE SCREEN
   ITSELF. The tile said "Use the full screen button in the player." there, which on the phone most of
   the children hold was the tile not working.

   TWO THINGS STOOD IN THE WAY, AND BOTH ARE STRUCTURAL:
     · A FIXED BOX IS NOT FIXED TO THE SCREEN IN HERE. Measured in Chromium on 10 Oct, the card's
       ancestors hold four containing blocks for `position: fixed` — the column's `transform` and
       `translate` (`placeCells`), the page's `contain: layout`, the pane's `contain: content` (which
       clips as well) and `#screen`'s `container-type` — so "fixed, inset 0" covered the card, not the
       glass. Lifting them for the length of the film would move every column and pane under it, and
       `check/ui.js` would call the card off the screen.
     · MOVING THE PLAYER TO `<body>` WOULD RELOAD IT. An iframe that changes parent loads again from
       the start; the film would restart at the moment it was asked to grow.
   SO THE PLAYER'S BLOCK GOES INTO THE TOP LAYER, WHERE IT IS: `popover="manual"` and `showPopover()`.
   The top layer is the browser's own layer over the page — what a modal dialog uses — and no ancestor's
   transform, containment, overflow or z-index reaches an element in it, while the element stays exactly
   where it is in the document, so the frame is not touched and does not reload. Proved in Chromium at
   390x844, 844x390 and 320x568, each turned the other way while on, with the Fullscreen API deleted —
   and kept proved by `check/videos.js` ('full'), which a scratch script used to be the only proof of:
   the block is the viewport, the film is the width (or the height) of the glass, the Exit tile is 44px,
   and the frame loaded once. `manual`, so nothing but this file closes it — not a tap on the black, not
   Escape on its own (Escape is handled below, once, here).
   WHERE THERE IS NO TOP LAYER EITHER (Safari before 17, iOS 16 and older), a `<video>` still takes the
   phone's own full screen and a frame still says to use the player's own button — the one case left.

   WHILE IT IS ON: `data-noswipe`, so a finger on the black round the film is not a swipe that turns the
   column out from under it (overworld.js); the arrow keys are kept from the grid for the same reason,
   and Escape leaves; the card underneath keeps its height (`minHeight`), so nothing on the column moves
   when the block leaves the flow and nothing moves when it comes back. The ONE inherited thing the top
   layer does not shed is CSS `zoom` — `paneReach_` draws a tall card smaller with it, and a top-layer
   block inherits it from the card it sits in — so the card is held at zoom 1 while its film is full
   screen (style.css, beside `.vid-watch.is-fs`). */
```

### ESCAPE LEAVES THE APP'S FULL SCREEN, AND THE ARROWS DO NOT TURN THE COLUMN UNDER IT.

top level, before `w`

```
/* ESCAPE LEAVES THE APP'S FULL SCREEN, AND THE ARROWS DO NOT TURN THE COLUMN UNDER IT. In the capture
   phase so the grid's own arrow keys (shell.js) never hear them while the film covers the glass; only
   while it is on. A block that has left the document (the card drawn again) lets go here too. */
```

