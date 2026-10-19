# js/receipt.js

The full text of comments in `js/receipt.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — receipt.js ONE FILE, SPLIT.

top level, before `RC_SNAP_K`

```
/* ==================================================================================================
   @family. — receipt.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   receipt.js is number 15 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- SHARING IS A PICTURE OF WHAT IS ON THE SCREEN

top level, before `RC_SNAP_K`

```
/* ---------- SHARING IS A PICTURE OF WHAT IS ON THE SCREEN -----------------------------------------
   ASKED FOR AS *"just make sure sharing booking is an identical jpg or png or whatevers best of the
   booking reciept."* It was a PRINT — `window.print()` on this element, so the platform's dialogue
   made a PDF — and before that it was `receiptCanvas`, a second renderer that drew the card again
   from its own arithmetic and drifted from the first four separate times (the venue twice, a green
   card that was cream paper, TO PAY where the screen said COST).

   WHY A PICTURE AND NOT THE PDF. A PDF is a document you open; what a family does with a booking is
   drop it into WhatsApp, where a PDF is a grey icon with a file name and a picture is the booking.
   And the print dialogue was a detour on a phone: share → print → options → share again.

   WHY PNG AND NOT JPEG. A receipt is flat colour and small text, which is exactly what JPEG is worst
   at — it rings round every letter and smears the hairlines. PNG is lossless, and on a card that is
   mostly one flat panel it is also the SMALLER file. Drawn at twice the CSS size, so it is as sharp
   on the phone it is sent to as on the one it was taken on.

   AND IT IS STILL NOT A SECOND RENDERER, which is the lesson the canvas paid for. The picture is the
   BROWSER drawing the same element: the `.rc` the tile is inside is cloned, every element of the
   clone is handed the style the browser actually computed for its original, and the clone is put in
   an SVG `<foreignObject>` — which is HTML, laid out by the same engine — and that SVG is drawn onto
   a canvas. Nothing here knows what a row, a column or a tick is. A receipt that changes shape
   tomorrow is shared in its new shape without this file being opened.

   WHY NOT html2canvas. It IS a second renderer — it walks the DOM and re-implements CSS painting in
   canvas calls, and it does not do subgrid, which `.bk` is built on. The receipt would come out
   with its columns in the wrong places: the canvas's fault again, in somebody else's code.

   `check/share.js` IS THE PROOF, and the only one there can be: it screenshots the element and the
   picture at the same scale and compares them pixel by pixel. "Identical" is a measurement.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE FONT, CARRIED IN THE PICTURE

top level, before `RC_FONTS_`

```
/* ---------- THE FONT, CARRIED IN THE PICTURE -------------------------------------------------------
   AN SVG DRAWN AS AN IMAGE MAY NOT FETCH ANYTHING. That is a browser rule, not a choice: an `<img>`
   is sandboxed, so `@font-face` pointing at `fonts/family-code.woff2` is simply ignored inside it and
   every letter falls back to the system monospace — the right words in the wrong typeface, which is
   not "identical" by the first glance.

   SO EVERY FACE THE PAGE DECLARES IS READ OFF THE PAGE'S OWN STYLESHEETS and re-declared with its
   file inlined as a `data:` URL. Read rather than written out here, so the stylesheet stays the one
   place a font is named — the `RC_PAGE_W` lesson: a second copy of a fact is a second thing to keep
   in step. 54 KB once subset, fetched once per page and remembered. */
```

### ---------- THE CLONE, WEARING WHAT THE BROWSER COMPUTED

top level, before `rcStyle_`

```
/* ---------- THE CLONE, WEARING WHAT THE BROWSER COMPUTED ------------------------------------------
   WHY COMPUTED STYLES RATHER THAN THE STYLESHEET. The obvious move is to put `style.css` in the SVG
   and let it apply — and it would apply wrongly, two ways. Its media queries would be asked about the
   SVG's own viewport, which is the width of the CARD, so every `@media (max-width: …)` rule answers
   as though the phone were 330px wide; and every selector that depends on where the card sits —
   `#s-booking .rc`, `body.x .rc`, `:root` tokens redefined for the dark scheme — has nothing to
   match in a document that holds only the card. The computed style is the answer to all of those,
   already worked out for the place the card actually is.

   `::before` AND `::after` ARE NOT ELEMENTS, so they cannot carry a `style` attribute. Each one that
   draws anything gets a class of its own and a rule in the SVG's `<style>` — the one thing the
   stylesheet is still needed for.

   ANIMATION AND TRANSITION ARE TURNED OFF ON THE COPY. The computed value is already the frame on
   the screen; copying `animation` too would restart it inside the picture from its first frame, and
   a tick that fades in would be photographed invisible. */
```

### `background-position` IS COPIED BY ITS TWO HALVES, because the whole one does not come back.

in `rcStyle_`

```
/* `background-position` IS COPIED BY ITS TWO HALVES, because the whole one does not come back.
     Chrome lists the shorthand among the computed properties and writes `right 13.8px` as
     `right 13.8px 50%` — three values with an offset on a keyword and a percentage after it, which
     no parser accepts — so the copy dropped it, fell back to `0% 0%`, and every select's arrow
     (two five-pixel gradients, `select` in the stylesheet, since docs/history/315) came out folded
     into its top-left corner. `check/share.js` counted it as 34 blots on the booking form. The
     longhands serialise as `calc(100% - 13.8px)` and `50%`, which parse; written last, they win. */
```

### NOT DRAWN IS NOT COPIED.

in `rcClone_`

```
/* NOT DRAWN IS NOT COPIED. A `display: none` subtree paints nothing on the screen, so leaving it
     out of the picture is the identity, not a liberty — and it is how the tiles and an admin's money
     rows stay off it (see `.rc-snap` in the stylesheet). */
```

### ---------- A CONTROL BECOMES THE WORDS IT SHOWS

in `rcClone_`

```
/* ---------- A CONTROL BECOMES THE WORDS IT SHOWS ----------------------------------------------
     THE FORM IS DROPDOWNS AND TEXT BOXES ON PAPER, and both keep their answer in a PROPERTY rather
     than in the markup: `cloneNode` copies the select as it was drawn, so the picture would show the
     first option of every row rather than the one picked — the one thing the picture is for.

     AND A CONTROL INSIDE A PICTURE SITS DIFFERENTLY. Measured by `check/share.js`: with the answers
     copied across, every row holding a select or a text box came out a CSS pixel lower than on the
     screen, because a form control's baseline inside an SVG image is not where the page put it — and
     those rows are aligned to it. And an empty box's hint came out in the full white of an answer, a
     document saying somebody had typed "anything else". A picture has nothing to press, so each one
     is drawn as a box of the same size in the same clothes holding the words it showed: the chosen
     option, the typed value, or the hint in `::placeholder`'s own ink. */
```

### `overflow: clip` WRITTEN, NOT COPIED.

in `rcClone_`

```
/* `overflow: clip` WRITTEN, NOT COPIED. A control always clips its own text, and Chrome
       reports a select's computed overflow as `visible` regardless of the stylesheet — so copied,
       the picture let "Nobody yet — just open it" run across the next three columns where the
       screen shows "Nobody yet …".

       `clip` AND NOT `hidden`, measured: an inline-block with `overflow: hidden` takes its
       baseline from its bottom edge rather than its text, and every label beside a control
       dropped five pixels. `clip` cuts the paint without making a scroll box, so the baseline
       stays on the words. */
```

### ---------- WHAT IS BEHIND THE CORNERS

top level, before `rcBehind_`

```
/* ---------- WHAT IS BEHIND THE CORNERS -------------------------------------------------------------
   THE CARD HAS ROUNDED CORNERS, so the rectangle of the picture has four slivers the card does not
   cover. Left transparent they turn white in one chat app and black in another; filled with what is
   behind the card on the screen they are what the screen shows. The nearest ancestor that paints a
   background is that colour. */
```

### ---------- THE SNAPSHOT IS TAKEN IN ONE GO, SYNCHRONOUSLY

in `rcPng_`

```
/* ---------- THE SNAPSHOT IS TAKEN IN ONE GO, SYNCHRONOUSLY ---------------------------------------
     `.rc-snap` HIDES THE TILES AND AN ADMIN'S TWO EXTRA MONEY ROWS, measured and cloned with it on,
     then taken off — all inside one task, so the browser never paints the card without them. Same
     two exclusions the print had, for the same reasons: a picture of a Send button is a control
     nobody can press, and `Tutor earns` / `Admin earns` must not travel to a family. */
```

### ---------- AND AT ITS OWN SIZE, NOT THE SIZE IT WAS SHRUNK TO

in `rcPng_`

```
/* ---------- AND AT ITS OWN SIZE, NOT THE SIZE IT WAS SHRUNK TO ----------------------------------
       A CARD TALLER THAN ITS PANE IS DRAWN SMALLER WITH CSS `zoom` — see `paneReach_` in find.js —
       and a saved session at 320x568 is 76% of itself. The zoom is a way of fitting a phone's screen,
       and its width is pinned so the card lays out exactly as it would unzoomed; so the picture takes
       the same layout at full size, which is the same document with bigger letters. The box on the
       screen is the zoomed one, so the size of the picture is that box divided back out. */
```

### `viewBox` IS THE CSS SIZE AND `width`/`height` THE PIXEL SIZE, so the browser lays the HTML out at the width it had on the screen — the same wraps, the same

in `rcPng_`

```
/* `viewBox` IS THE CSS SIZE AND `width`/`height` THE PIXEL SIZE, so the browser lays the HTML out
       at the width it had on the screen — the same wraps, the same columns — and rasterises it at
       twice that. Scaling the bitmap afterwards would be a blurred 1x picture. */
```

### ---------- WHERE THE PICTURE GOES

top level, before `RC_SHOT`

```
/* ---------- WHERE THE PICTURE GOES -----------------------------------------------------------------
   THREE WAYS OUT, IN ORDER, and which one a phone takes is asked rather than guessed:

     1. THE SHARE SHEET, where the platform says it takes files — iPhone and Android, straight to
        WhatsApp, Messages or mail. `canShare` is the question; `navigator.share` existing is not
        enough, because desktop Chrome has it and refuses files on some systems.
     2. A DOWNLOAD — a laptop, where "share" means saving it and attaching it somewhere.
     3. THE PICTURE IN A SHEET, where neither is possible: a long press on an image saves it on every
        phone. Not `window.open` — `check-surfaces` refuses a new tab, and a pop-up blocker would
        turn this press into nothing.

   AND ONE CASE THAT COMES BACK TO THE SHEET. A share sheet may only be opened by a press, and
   Safari counts the picture being made as time passing since it — so on an iPhone the first
   `navigator.share` can be refused with `NotAllowedError`. The sheet then offers the picture with a
   Share button, which is a press of its own. Closing the share sheet without choosing anything is an
   `AbortError` and means exactly that: nothing to report. */
```

### THE BOOKER IS NOT A SHEET ANY MORE.

top level, before `drawBooker`

```
/* ==================================================================================================
   THE BOOKER IS NOT A SHEET ANY MORE.

   IT OPENED OVER THE TOP OF BOOK, one question at a time, and every answer redrew the panel. That
   is a modal wizard, and it is the last one in the app — the card actions stopped being a sheet,
   the paper stopped being a sheet, and this was the only place left where you press a thing and
   something covers what you pressed.

   IT IS THE SAME MARKUP IN THE SAME PLACE. `drawBooker_` was four `openSheet` calls with four
   nearly-identical bodies; it RETURNS those bodies now and `bookerCard` puts them on the Book
   screen instead. It returned a `title` too, for the heading above the card — there is no heading
   and no card, so it returns only the body. Nothing about the questions, the skipping, the pricing or the running total
   changed — only where the answer to "where does this go" is given, and it is given once.

   WHY IT WAS A SHEET AT ALL: because the funnel needs somewhere that is only the question, with
   the answers so far above it and the price below. A sheet gave that for free. A card gives it
   too, and gives it without hiding the column it belongs to. */
```

### The one entry point.

top level, before `drawBooker`

```
/* The one entry point. Everything that changes an answer calls this, and it is the only thing that
   calls `drawBooker_` — so nothing can redraw the card without keeping its place. It sat orphaned
   at the head of this file for as long as the shared picture was written between it and here. */
```

### THE LIST OF CHECKBOXES UNDER A SEVERAL-OF-A-LIST ROW IS PART OF THE CARD — see `stepManyList_` — so this one redraw is what keeps the tick, the row's own

top level, before `drawBooker`

```
/* THE LIST OF CHECKBOXES UNDER A SEVERAL-OF-A-LIST ROW IS PART OF THE CARD — see `stepManyList_` —
   so this one redraw is what keeps the tick, the row's own summary and the running price in step.
   It also called `bookDrop_` while that list was `#drop`, a panel outside the screens with a redraw
   of its own; the panel went on 9 October (note 315) and the second call with it. */
```

### ---------- THE LIST IS NOT DRAWN INSTEAD OF THE CARD

in `bookerCard`

```
/* ---------- THE LIST IS NOT DRAWN INSTEAD OF THE CARD ---------------------------------------------
     FOR ONE COMMIT THIS RETURNED THE PICKER INSTEAD OF THE CARD, and it was reported as *"i hate
     this."* A several-of-a-list question's checkboxes are drawn IN the card now, under their row,
     off the same `BOOKING.picking` this used to read (`stepManyList_`). The card is always the card.

     `#bookr` STILL HAS TO BE HERE, and that is not tidiness: `paintBook_` finds the screen to
     repaint by walking up from it, and `book-many-pick` finds the box to give the focus back to
     inside it. */
```

### ---------- NO CARD AROUND IT

in `bookerCard`

```
/* ---------- NO CARD AROUND IT ----------------------------------------------------------
          IT WAS A `.card` HOLDING AN `.rc`, which is a glass panel with a paper receipt inside it —
          two containers for one object, and the outer one said nothing. The receipt already has
          edges: it is torn at both ends, it has its own colour, and it is the most obviously
          bounded thing in the app. Putting it in a box was framing a photograph that came framed.

          THE HEADING WENT WITH IT. "How would you like to book?" named the question being asked,
          which mattered when a list of answers sat underneath. Every field is a dropdown on the
          paper now, so there is no single current question for a heading to name — the card asks
          all twelve at once and you answer whichever you like.

          What is left is the paper, and under it the note box and the buttons that send it. */
```

### ---------- THERE IS NO SECOND THING TO DRAW

in `drawBooker_`

```
/* ---------- THERE IS NO SECOND THING TO DRAW ------------------------------------------------------
     THIS WAS A FUNNEL. It asked one question, drew a list of answers, and moved to the next — and
     the card underneath was where the answers landed. Every one of those questions is now answered
     ON the card: a dropdown for a list, a text box for the split, and the week grid unfolding under
     its own row. So the funnel has nothing left to render and this function returns the paper.

     `nextBookStep` HAS NOT GONE and should not. It is what knows a question with one option should
     not be asked, what knows a shared class has no subjects to pick and no venue to choose, and
     what `bookAnswered_` leans on. It decides what is ASKED; it no longer decides what is DRAWN,
     and those were only ever the same thing because the form was a funnel.

     `BOOKING.editing` SURVIVES TOO, meaning only "which row has its grid open". It used to mean
     "which question is the panel showing", which is the same fact from the days when there was a
     panel to show it in. */
```

### `said` WAS HERE — a chip per answered question, each with a ✕ that cleared it.

in `drawBooker_`

```
/* `said` WAS HERE — a chip per answered question, each with a ✕ that cleared it. It was a second
     list of the answers drawn above a receipt that lists the answers, so it went; but the ✕ was the
     ONLY way to un-answer a question rather than change it, and losing a control is not the same as
     losing a duplicate. It is a button in the edit view now, beside "Leave it as it is", which is
     where somebody who has opened a question to reconsider it is already standing. */
```

### ---------- A QUESTION THAT DID NOT GET ASKED, SAID OUT LOUD

in `drawBooker_`

```
/* ---------- A QUESTION THAT DID NOT GET ASKED, SAID OUT LOUD ---------------------------------
     `nextBookStep` skips any question with no options, which is right — one venue is not a choice
     and asking is the app pretending to consult you. But it means a question that SHOULD have
     appeared and did not looks exactly like a question that was never meant to.

     That is how "which of your children is this for?" came to be missing with nothing said. The
     question needs children on your account; there were none linked; so it was skipped, silently,
     and from the outside that is indistinguishable from the feature not being deployed.

     So the one case that is a GAP rather than a decision says so. A client with no children on
     their account is a real state and the fix is a person's, not a form's — the line names it and
     says who can fix it. Everyone else never sees it. */
```

### AND THE NOTE HAS TO NAME THE RIGHT ACCOUNT.

in `drawBooker_`

```
/* AND THE NOTE HAS TO NAME THE RIGHT ACCOUNT. "No children are on YOUR account" is wrong when an
     admin has booked for somebody else — it is that family's account with nobody on it, and telling
     the admin to add their own children is advice for a problem they do not have. */
```

### AND NO CHILDREN NOTE AT ALL WHEN THERE IS NO CLIENT.

in `drawBooker_`

```
/* AND NO CHILDREN NOTE AT ALL WHEN THERE IS NO CLIENT. "No children are on Nobody yet — just
     open it's account" is what happens when a placeholder is handed to a sentence expecting a
     name. A waiting list being opened empty has no family to have children, and the note has
     nothing to tell anybody. */
```

### THE RUNNING BREAKDOWN.

in `drawBooker_`

```
/* THE RUNNING BREAKDOWN. Every row says what it did to the price and what the price is with it
     applied — so the last figure IS the total, rather than a number you have to trust.
     Built from PRICE_ROWS, the same list the old card used, so a row cannot be drawn without being
     costed or costed without being drawn. */
```

### ---------- THE ACTIONS ARE PRINTED ON THE PAPER

in `drawBooker_`

```
/* ---------- THE ACTIONS ARE PRINTED ON THE PAPER ---------------------------------------------
     They were markup after the receipt, which put them on the page rather than on the document —
     and the page has no surface, so they floated. Handed to `bookBreakdown` instead, which prints
     them above the barcode where a receipt's terms go. */
```

### ---------- TWO MARKS, NOT A BUTTON AND A MARK

in `foot`

```
/* ---------- TWO MARKS, NOT A BUTTON AND A MARK ---------------------------------------------
          "ASK FOR IT" WAS A FULL-WIDTH GOLD BAR with a symbol underneath it — the commit dressed as
          a different kind of control from everything else on the paper, and the one thing next to
          it that shared its job drawn a fifth the size.

          BOTH ARE ACTIONS ON THIS DOCUMENT, so both are tiles in one row, the same row every card
          in Find carries. Sending keeps the gold, because it is the one that spends something and
          the one that cannot be undone.

          THE NAMES ARE IN THE TITLES, which is where every icon-only control in this app keeps
          them — "Ask for it" and "Share this booking", unchanged. */
```

### `data: { stage: 'screen' }` WAS HERE and it was the second half of a choice this document made twice, back when sharing drew the receipt again onto a canvas.

in `foot`

```
/* `data: { stage: 'screen' }` WAS HERE and it was the second half of a choice this
                   document made twice, back when sharing drew the receipt again onto a canvas.
                   Sharing IS the card now — it pictures this element — so there is nothing left for
                   the button to tell it and nothing left to disagree with. */
```

### ---------- THE FOOTER LINE WENT

in `foot`

```
/* ---------- THE FOOTER LINE WENT ------------------------------------------------------
          REMOVED ON REQUEST: *"remove the nothing is booked yet text."* It read "Nothing is booked
          or charged yet — this asks, and we come back to you", under the two tiles.

          WHAT IT SAID IS SAID BY THE CARD. The gold tile is "Ask for it" rather than "Pay", the
          six stage ticks along the bottom are all empty on an unsent form, and the first of them
          is `Requested` — so the document already shows, in its own shape, that nothing has
          happened yet and what the next thing to happen is. A sentence repeating it is the fault
          this file records where the roster's `name` printed an `<h3>` above every widget's own
          heading: both correct, both on the screen at once.

          `id="book-said"` WENT WITH IT AND NOTHING READ IT — measured across `js/`. It was the
          status line of a form that reports through toasts now.

          THE COPY ON THE SHARED PICTURE WENT IN THE SAME COMMIT, back when there was one to keep
          in step: the canvas drew this sentence too, and its own note said why the two had to
          agree — *"a picture of the card that promises something slightly different is a second
          promise."* What is shared is this element now, so there is one copy of everything on it
          and that class of drift is gone rather than guarded against. */
```

### ---------- THE CARD IS THE FORM, FROM THE FIRST QUESTION

in `drawBooker_`

```
/* ---------- THE CARD IS THE FORM, FROM THE FIRST QUESTION ---------------------------------------
     IT USED TO BE A QUESTION UNTIL IT WAS A CARD. Nine questions in a row, and only once the last
     one was answered did the thing you were building appear — so for eight of nine steps you were
     answering a form with no idea what it was adding up to, and the running price this file goes to
     such lengths to compute was on screen for exactly one of them.

     THE RECEIPT IS DRAWN FIRST NOW, on every step, with the question underneath it. Answering moves
     a figure you can already see. That was always the design — the comment above says the card
     becomes the control and every chosen value is pressable — it just started too late.

     THE `said` CHIPS ARE GONE. They were a second list of the answers so far, drawn above a receipt
     that lists the answers so far. Two of the same list, and only one of them had the prices. */
```

### ONE RETURN. This was four branches — a question, a grid, a list of email boxes, and the card — and the last three have moved onto the paper.

in `drawBooker_`

```
/* ONE RETURN. This was four branches — a question, a grid, a list of email boxes, and the card —
     and the last three have moved onto the paper. What is left is the paper, the note box and the
     two buttons, which is what the whole form is now. */
```

### ---------- A CLASS GOES SOMEWHERE ELSE ENTIRELY

top level, before `joined`

```
/* ---------- A CLASS GOES SOMEWHERE ELSE ENTIRELY ------------------------------------------------
     `createJob` builds a booking out of what somebody chose: their subjects, their seats, their day,
     their tutor, and a price computed from all of it. A shared class has none of those — one seat,
     Maths and English, no tutor, no day, and a price fixed before anybody joined.

     SO IT IS `joinWaitlist`, WHICH IS A DIFFERENT HANDLER AND NOT A FLAG ON THIS ONE. It finds the
     venue's open list or starts one, checks nobody has joined twice, prices the seat from the venue
     and the seat count, and writes the asker their own receipt at their own price. Everything that
     makes a class a class is decided there, on the server, where four phones cannot each produce a
     different number.

     WHAT IS SENT IS WHAT WAS ASKED: the venue and the level. Nothing else on this form was even
     offered, and sending a subject or a day would be this file inventing an answer to a question
     nobody was asked. */
```

### ---------- ASKING TO JOIN A CLASS THAT IS ALREADY RUNNING

top level, before `joined`

```
/* ---------- ASKING TO JOIN A CLASS THAT IS ALREADY RUNNING -----------------------------------
     THREE VERBS, NOT TWO. `createJob` starts a session; `joinWaitlist` buys a seat on a list. A
     class that already runs is neither: it belongs to the family who booked it, seats in it are
     theirs to give, and joining is a REQUEST — which is exactly what `move: 'Request'` is, and what
     the "Ask to join" button on a job receipt has always sent.

     THE FORM CAN REACH IT NOW. Choosing "instant class" and then picking one that is going sends
     this instead of creating a second session at the same time in the same room. Nothing else on
     the paper applies — the subject, level, venue and seats are the class's, filled in and locked
     — so nothing else is sent. */
```

### THE CLASS YOU ASKED TO JOIN, kept so it comes back under the blank form — see `ASKED_JOB` in book.js.

top level, before `ASKED_JOB`

```
/* THE CLASS YOU ASKED TO JOIN, kept so it comes back under the blank form — see `ASKED_JOB`
           in book.js. The id is the one we already had: this path asks to join a session that
           exists, so there is no new job to be told about. */
```

### ---------- THE HANDLER TOOK NO ARGUMENT AND THEN USED ONE

top level, before `el.disabled`

```
/* ---------- THE HANDLER TOOK NO ARGUMENT AND THEN USED ONE ---------------------------------
         `catch(() => …)` with `why_(err)` inside it. There is no `err` in that scope and no `err`
         anywhere above it, so the line threw ReferenceError — inside the very handler whose job is
         to explain a failure.

         WHICH MEANS ASKING TO JOIN A CLASS FAILED TWICE AND SAID NOTHING EITHER TIME. The request
         fails, this runs, it throws before reaching `textContent`, and the throw is inside a
         `.catch` so it becomes an unhandled rejection that no part of the app is watching. The
         button re-enables — `el.disabled = false` is above the bad line and does run — so what a
         person sees is a button that goes dead, comes back, and offers no reason at all. Pressing
         it again does the same thing.

         `why_` EXISTS FOR THIS EXACT MOMENT. It turns a bare fetch TypeError into a sentence about
         there being no connection, and it has been unreachable from here since the argument was
         dropped. The sibling handler a hundred lines below takes `err` correctly, which is what
         this should have looked like all along.

         Found by `node js/check.js` — "used but never declared", which is precisely what it was. */
```

### ---------- OPENING ONE IS A DIFFERENT ACTION FROM JOINING ONE

top level, before `forNobody`

```
/* ---------- OPENING ONE IS A DIFFERENT ACTION FROM JOINING ONE --------------------------------
       `joinWaitlist` SEATS WHOEVER CALLS IT. That is right for a family and wrong for an admin who
       has just answered "nobody yet" — they would become the first person on the list they were
       trying to open empty, which is the one thing the answer exists to avoid.

       So the answer to "who is this for" chooses the verb: nobody means `openWaitlist`, anybody
       means `joinWaitlist`. One question, two doors, and the form does not need a second button. */
```

### WHERE IT HAS GOT TO, because that is the whole content of a waiting list.

top level, before `ASKED_JOB`

```
/* WHERE IT HAS GOT TO, because that is the whole content of a waiting list. "You are on
           the list" says less than the backend already knows, and it knows it exactly: how many
           have joined and how many seats there are. */
```

### BOTH WAITLIST VERBS ANSWER WITH ONE.

top level, before `ASKED_JOB`

```
/* BOTH WAITLIST VERBS ANSWER WITH ONE. `joinWaitlist` and `openWaitlist` are different
           handlers reached by the same button, and each returns the `jobId` of the list it seated
           you on or opened — so one line covers the pair. */
```

### ---------- A TUTOR WITH NO HOURS IS NOT SENT FOR

top level, before `el.disabled`

```
/* ---------- A TUTOR WITH NO HOURS IS NOT SENT FOR --------------------------------------------
     The dropdown greys them and the grid shuts, so only a form that arrived with the name already in
     it reaches here — said where the send is, before a request the server would refuse anyway. */
```

### WHO THIS BOOKING BELONGS TO, permanently.

top level, before `personId`

```
/* WHO THIS BOOKING BELONGS TO, permanently.
       `writeReceipt_` stores `person_id` and this never sent one — so every receipt ever issued has
       a blank id and is found again by MATCHING THE NAME. A name is an editable cell: change it and
       a family's receipts detach from them, silently, and there is nothing underneath to reattach
       by. It is the one identity this backend refuses to trust anywhere else, and the receipts were
       the last place still relying on it. */
```

### EVERY HOUR TICKED, as the grid's own codes — `m16, m17, f10`.

top level, before `slots`

```
/* EVERY HOUR TICKED, as the grid's own codes — `m16, m17, f10`. `day`, `time` and `hours` above
       are the FIRST run (see `bookRuns`), which is all the job row has cells for; the server checks
       the named tutor's hours and their other sessions against all of them, so a Friday that
       differs from the Monday is checked as itself. */
```

### THE MONEY BLOCK'S FIGURES, AND WHAT KIND OF SESSION THEY PRICED (docs/history/353).

top level, before `lines`

```
/* THE MONEY BLOCK'S FIGURES, AND WHAT KIND OF SESSION THEY PRICED (docs/history/353). Recorded on the
       job as sent, like `tutorPay` and `profit` above — and FROZEN by the server when the job is accepted
       (`jobMoneyFreeze_`, booking.gs), so a config change next month cannot rewrite what this booking was
       agreed to earn. The discount fields go only when an admin set them, and the server refuses them from
       anybody else (`discountRefusal_`). */
```

### THE PRINTED LINES, sent with the request so the backend can keep the receipt AS DRAWN.

top level, before `lines`

```
/* THE PRINTED LINES, sent with the request so the backend can keep the receipt AS DRAWN.
       Regenerating it later from the job would produce a different document the day a rate moves —
       and a receipt that changes after it is issued is not a receipt. */
```

### GUARDED, because `bookPrice` returns null until enough is answered to price anything — and `book-send` can be pressed before that, which is exactly what the

top level, before `lines`

```
/* GUARDED, because `bookPrice` returns null until enough is answered to price anything — and
       `book-send` can be pressed before that, which is exactly what the harness does. An unpriceable
       booking sends no lines rather than throwing on the way out: the request is the important
       half, and the paperwork must never be what stops it. */
```

### WHO IS ACTUALLY COMING, by name, where the parent told us.

top level, before `openToOthers`

```
/* WHO IS ACTUALLY COMING, by name, where the parent told us. A booking has always recorded
       who PAYS and never who sits in the chair — so a tutor arrived knowing a session existed and
       not which of three children to expect. Empty is a real answer: a parent booking for somebody
       else's children ticks nothing, and the seats say "Child". */
```

### `splitOthers` was sent here too — the COUNT of other families, which nothing on the backend has ever read.

top level, before `openToOthers`

```
/* `splitOthers` was sent here too — the COUNT of other families, which nothing on the backend
       has ever read. `splitEmails` carries who they are, which is the fact that matters; a number
       that can be derived from a list is a second copy of the list. */
```

### ALWAYS TRUE, because the question is gone and the SEATS are the answer now.

top level, before `openToOthers`

```
/* ALWAYS TRUE, because the question is gone and the SEATS are the answer now. A family who
       wants the room to itself buys the remaining seats, which leaves none to ask for — a fuller
       statement than a checkbox, made with money rather than a tap.
       Written rather than dropped: `move` refuses a join unless this says so, so leaving it FALSE
       would have switched the join mechanism off while looking like a question had been tidied. */
```

### Emptied from the step list rather than from a list of names written here — see `resetBooking_`.

top level, before `el.disabled`

```
/* Emptied from the step list rather than from a list of names written here — see
         `resetBooking_`. This was seven keys typed out, and it was missing `done` and `kids`: the
         next booking would arrive believing every multiple-choice question had already been
         answered, and walk past all of them. */
```

### THE WHOLE RECEIPT, on tap.

top level, before `jobs`

```
/* THE WHOLE RECEIPT, on tap. The stub on the list is a fold; this is the paper opened out.
   It used to build its own six-row summary here — a THIRD rendering of the same booking, after the
   card and the receipt, and the one that would quietly stop matching them. Six rows where the
   receipt has fourteen, so tapping a session told you less than the list it was on. */
```

### ---------- A SESSION OPENS ON ITS OWN PAGE, NOT OVER THE TOP OF THE APP

top level, before `jobs`

```
/* ---------- A SESSION OPENS ON ITS OWN PAGE, NOT OVER THE TOP OF THE APP --------------------------
   REPORTED TWICE: *"your week planner has pop ups. i click on a job and it goes. i told you i don't
   like that."* — and "it goes" is the accurate description. `openSheet` lays a panel over
   everything, so the week you were reading disappears behind the one session you tapped, and
   getting back to it is a close you have to find.

   THE PAGE ALREADY EXISTED, which is what makes this a deletion rather than a design. `jobPage_`
   draws a session opened out and `bookBlocks` puts one per page on the Booking column — so this was
   the app's SECOND way of showing one session, stacked by hand out of the same pieces, in a
   different file, differing by a `moneyBlock` nobody had noticed was missing from it. Two renderers
   for one thing is the fault this repository records under `childrenOf`, under `link`/`source_url`
   and under the roster heading drawn twice.

   SO IT NAVIGATES. `jobPageAt_` asks the list that BUILDS those pages which one this is, rather
   than counting a second time, and `OPEN_JOB` covers the case the week grid creates and the Booking
   column does not: an admin's week shows every session and `myJobs_` returns only their own.

   NOT FOUND AT ALL is still said out loud. A session that has left the payload between the grid
   being drawn and the tap — declined, cancelled — has no page and no receipt, and a tap that
   silently does nothing is the thing this app keeps being reported for. */
```

### ---------- AND THE COLUMN HAS TO BE TOLD IT IS OUT OF DATE

top level, before `n`

```
/* ---------- AND THE COLUMN HAS TO BE TOLD IT IS OUT OF DATE -------------------------------------
     `go` REPAINTS A SCREEN ONLY IF IT IS EMPTY OR STALE, deliberately — its own note says a second
     identical paint costs the slide's animation and buys nothing. `OPEN_JOB` is state the Booking
     column is BUILT from, so changing it is exactly the case `STALE` exists for: the note on it
     records signing in and finding eight screens still saying "Sign in to post".

     MEASURED, AND THIS WAS WRONG FIRST: with `OPEN_JOB` set and `jobPageAt_` answering 1, the
     column still held what it had drawn at boot. The pieces were all correct and the screen was
     the one nobody had told. */
```

### ---------- THE PAGE IS SET BEFORE THE SCREEN IS REACHED, NOT AFTER

top level, before `n`

```
/* ---------- THE PAGE IS SET BEFORE THE SCREEN IS REACHED, NOT AFTER ------------------------------
     `goPage` OPENS WITH `if (!PAGER[id]) return;` and the pager for a column is built when that
     column is painted — so calling it straight after `go('booking')` asked for a page of a pager
     that did not exist yet and returned silently. Measured: the receipt was on the column and the
     column was showing page 0, the booking form, which is indistinguishable from the tap having
     done nothing.

     `openSharedPost` IN posts.js ALREADY HAD THE IDIOM — `PAGE.feed = n; go('feed');` — with its
     own note about why scrolling is not the mechanism here. Same shape: say where the column should
     be, then go to it, and the paint that `go` performs builds the pager already on that page.

     `jobPageAt_` IS ASKED FIRST because it reads `OPEN_JOB`, which is set two lines up: the page
     index and the page list are then worked out from one state in one order. */
```

### PAYING. `createCheckout` builds a Stripe session and hands back a URL; nothing about the booking is recorded by it, because a client who opens the payment page

top level, before `el.disabled`

```
/* PAYING. `createCheckout` builds a Stripe session and hands back a URL; nothing about the booking
   is recorded by it, because a client who opens the payment page and closes the tab has not paid.
   The return leg — `?paid=1&ref=…` — is what asks Stripe whether it actually happened.

   `requestId` IS THE GUARD. A double tap on this is two checkouts for one booking, and the backend
   refuses the second because it recognises the id. */
```

### ---------- THE BUSINESS ANSWERING A REQUEST

top level, before `yes`

```
/* ---------- THE BUSINESS ANSWERING A REQUEST ------------------------------------------------------
   The same `move` everything else uses, so there is one machine and one set of rules — what makes
   it an admin's answer is that the backend recognises the name as an admin who is not in the job.
   Nothing here decides that; it is checked on the server, because a button that is not drawn is
   not a rule.

   ONE HANDLER FOR BOTH, because they are one decision with two answers, and two handlers would be
   two places for the request to drift out of shape. */
```

### DECLINING IS ASKED ABOUT.

top level, before `el.disabled`

```
/* DECLINING IS ASKED ABOUT. It removes everybody from a booking a family made and sends them an
     email saying so — one mis-tap from a list of sessions is not a thing to do silently. Accepting
     is not: it is the ordinary act, and it can be undone by declining afterwards. */
```

### TWO PRESSES, NOT A confirm().

top level, before `el.disabled`

```
/* TWO PRESSES, NOT A confirm(). A browser dialog is the one thing on a phone that looks like the
     page has been taken over by something else, and it cannot say what is about to happen in the
     words this app uses. The button becomes the question, and a press somewhere else leaves it as
     it was. Same pattern as `post-delete` in posts.js. */
```

### ---------- THE FAMILY LEAVING

top level, before `paid`

```
/* ---------- THE FAMILY LEAVING ---------------------------------------------------------------------
   THE SAME `move` EVERY OTHER ACT USES, so there is one machine and one set of rules. The backend
   checks it is really theirs; this only draws the button and asks first.

   ASKED ABOUT, ALWAYS. It removes them from a session and, once paid, puts money into a state a
   person has to resolve by hand — neither is a thing to do on one mis-tap from a list. The question
   says which of the two is about to happen, because "are you sure" without the consequence is a
   question nobody can answer. */
```

### MARKING IT PAID BY HAND.

top level, before `askHow_`

```
/* MARKING IT PAID BY HAND. The one action on this site that says money arrived without a payment
   processor having said so — which is why it asks HOW, and why the answer goes into the event log
   rather than being thrown away. "Cash at the library" is the whole audit trail for that payment,
   and a blank is worse than a guess because a guess can be corrected. */
```

### ---------- ASKED IN A SHEET, NOT IN A prompt()

top level, before `askHow_`

```
/* ---------- ASKED IN A SHEET, NOT IN A prompt() ---------------------------------------------------
     `prompt()` IS A GREY OS DIALOG with the OS's typeface and the OS's buttons. It stops the page
     dead, it cannot be styled, it cannot explain itself, and on a phone it reads as the page having
     been hijacked. It is also the only place in this app where a value was typed into something the
     app did not draw.

     THE SHEET IS WHERE EVERYTHING ELSE IS ASKED. It can say why the answer matters — that "cash at
     the library" IS the audit trail — which a one-line dialog cannot.

     BACKING OUT IS STILL NOT AN EMPTY ANSWER. Closing the sheet does nothing at all; only the button
     sends. That distinction was the whole point of the `null` check this replaces. */
```

### TAKING A SEAT ON A CLASS SOMEBODY ELSE STARTED.

top level, before `f`

```
/* TAKING A SEAT ON A CLASS SOMEBODY ELSE STARTED. The SAME action the booking form uses, because it
   is the same act — the venue is read off the job rather than typed, and everything else about a
   waitlist seat is decided on the server either way.

   IT STILL ASKS WHEN THEY CAN COME. That is the one thing `joinWaitlist` cannot work out for
   itself and the one thing the day of the class gets chosen from — a seat taken without it is a
   family nobody can schedule around. */
```

### COMING ALONG. The event is created by the first family to join it — there is no "open the event" step, because an event nobody has joined is a row saying

top level, before `f`

```
/* COMING ALONG. The event is created by the first family to join it — there is no "open the event"
   step, because an event nobody has joined is a row saying nothing.
   IT ASKS WHO IS COMING, because a party needs a headcount and a family with three children is
   three chairs. The answer goes on their own joining event, where it is theirs by construction. */
```

### ASKED IN A SHEET, NOT IN A prompt().

top level, before `f`

```
/* ASKED IN A SHEET, NOT IN A prompt(). See `askHow_` above for the argument; it applies here with
     one addition — this question is asked of a PARENT rather than of the admin, and a grey OS dialog
     is a worse thing to show somebody who did not build the app. */
```

### ---------- TAKING A SEAT GOES TO THE FORM

top level, before `j`

```
/* ---------- TAKING A SEAT GOES TO THE FORM ---------------------------------------------------------
   IT USED TO ASK AND SEND, right here: a browser `prompt()` for availability — a grey OS dialog with
   a text box, the crudest popup in the app — and then straight to `joinWaitlist`. So there were two
   ways to join a class that shared no code and asked different questions, and this one could not
   validate its single answer or show what the seat cost.

   NOW IT ANSWERS THE FORM ON YOUR BEHALF and turns to it: the kind is a waiting list, the class is
   this one, and everything the class decides is filled in. What is left — when you could come, who
   it is for — is asked on the paper with the rest, and sent by the one send button.

   THE FIELDS ARE SET HERE RATHER THAN BY `book-set`, because nobody touched a dropdown. Same four,
   in the same order, and `joinedJob_` will find this class again from the label. */
```

### ---------- ASKING TO JOIN GOES TO THE FORM, LIKE TAKING A SEAT

top level, before `j`

```
/* ---------- ASKING TO JOIN GOES TO THE FORM, LIKE TAKING A SEAT --------------------------------
   IT SENT STRAIGHT FROM THE BUTTON, which made it the third way to make a booking and the only one
   that showed you nothing first — no subject, no venue, no price, no chance to say who it is for.
   `job-take-seat` was moved onto the form for the same reason; this is its other half.

   THE VERB IS STILL A REQUEST. Filling the form in does not turn asking to share somebody's class
   into buying a seat — `book-send` reads which kind was chosen and sends `move: 'Request'` for a
   class that is already running. What changes is that you can see what you are asking for. */
```

### ---------- AN ADMIN ENDS A SESSION

top level, before `id`

```
/* ---------- AN ADMIN ENDS A SESSION --------------------------------------------------------------
   DELETING A JOB IS WITHDRAWING EVERYONE FROM IT, which is not a workaround — it is what the
   booking machine already means by a session being over. A job with no clients in it is
   `cancelled` and the payload does not send it, so there is no `deleted` flag to add, no second
   way for a job to be invisible, and no state a stale cell could disagree with.

   The row stays on the jobs tab and every event stays on the events tab. What happened to a
   session — who asked, who agreed, who paid — is a thing you may need months later, and it is the
   one thing a real delete would take away. */
```

### The state the games keep between frames — the board, the clock, the deck, which month the calendar is showing.

top level, before `sure_`

```
/* The state the games keep between frames — the board, the clock, the deck, which month the
   calendar is showing. Carried over WITH them: a game without its state is a function that throws
   on its first line, which is precisely what happened when I moved the functions alone. */
```

### ---------- ARE YOU SURE, WITHOUT A DIALOG

top level, before `sure_`

```
/* ---------- ARE YOU SURE, WITHOUT A DIALOG --------------------------------------------------------
   THE BUTTON BECOMES THE QUESTION. First press changes its words; second press does the thing; and
   four seconds of not pressing puts it back, so a stray tap cannot leave a button armed.

   `confirm()` IS THE ONE THING IT REPLACES, and the reason is the same everywhere it appeared: it
   is an OS dialog in the OS's typeface with the OS's buttons, it stops the page dead, and it cannot
   use a single word this app chose. On a phone it reads as the page having been hijacked.

   RETURNS TRUE ONLY ON THE SECOND PRESS, so every call site reads `if (!sure_(el, '…')) return;`. */
```

### THE SOLID GLYPHS FOR BOTH SIDES, and the colour comes from CSS.

top level, before `GLYPH`

```
/* THE SOLID GLYPHS FOR BOTH SIDES, and the colour comes from CSS.
   `♔♕♖` are the white pieces in Unicode and most fonts draw them as OUTLINES — a hollow shape in
   whatever ink the page happens to use. On this app that is pale text on a pale square, so the
   white army was a set of faint wireframes and the black one was solid: two different kinds of
   drawing for two sides of the same game.
   Filled shapes for everyone, told apart by fill and outline rather than by which glyph. That is
   what every chess site does, for exactly this reason. */
```

### THE GAMES AND TOOLS, carried over.

top level, before `fitCanvas_`

```
/* ================================================================================================
   THE GAMES AND TOOLS, carried over.

   The chess board, the flappy loop, the times-tables clock, the calculator keypad, the timer, the
   calendar and the feed — all of it moved across whole rather than rewritten, because none of it
   was ever the problem. Only the sticky notes they used to sit on were.
================================================================================================ */
```

### SIZE A CANVAS TO ITS BOX, or wait until it has one.

top level, before `fitCanvas_`

```
/**
 * SIZE A CANVAS TO ITS BOX, or wait until it has one.
 *
 * A canvas has two sizes — the CSS box it occupies and the `width`/`height` it draws into — and a
 * mismatch does not fail, it STRETCHES. Which is the worst kind: the game runs, the numbers are all
 * correct, and everything on screen is the wrong shape and in the wrong place.
 *
 * Returns false when the box has no size yet and asks to be called back, so a widget that starts
 * before its pane is laid out starts properly a moment later instead of drawing into a default.
 */
```

### ON A PHONE THE BOX IS IN CSS PIXELS and the screen has more than that.

in `fitCanvas_`

```
/* ON A PHONE THE BOX IS IN CSS PIXELS and the screen has more than that. Drawing at the box size
     on a 3× display is a third of the resolution the screen can show, which is what made the
     shapes soft. The context is scaled to match, so every number in the game stays in CSS pixels
     and nothing above this line has to know. */
```

### Guarded because a context is not guaranteed — a browser with the canvas turned off returns null, and a harness returns a stub with only what it was asked for.

in `fitCanvas_`

```
/* Guarded because a context is not guaranteed — a browser with the canvas turned off returns
     null, and a harness returns a stub with only what it was asked for. Neither should stop the
     size being right, which is the part that matters. */
```

### `still`: DRAWN AHEAD OF ITS ARRIVAL (`flappyStill_`, the widget's declared `draw`) — the board, the canvas fitted to its box and one frame of the scene, and

top level, before `flappyStill_`

```
/* `still`: DRAWN AHEAD OF ITS ARRIVAL (`flappyStill_`, the widget's declared `draw`) — the board, the canvas
   fitted to its box and one frame of the scene, and then nothing: no handlers, no key listener, no loop.
   The loop is the expensive one and runs only for somebody looking (`stop` cancels it). */
```

### THE BOARD IS DRAWN HERE because `startScreen_` calls this on every paint of the column, so it picks up the payload the moment `load()` lands and again whenever

in `initFlappy`

```
/* THE BOARD IS DRAWN HERE because `startScreen_` calls this on every paint of the column, so it
     picks up the payload the moment `load()` lands and again whenever anything repaints. It is one
     innerHTML over at most six rows and it happens before the game starts. */
```

### THE ELEMENT'S OWN SIZE, not its box.

in `initFlappy`

```
/* THE ELEMENT'S OWN SIZE, not its box. A canvas has two sizes — the CSS one it occupies and the
     `width`/`height` attributes it actually draws into — and stretching the first without the
     second draws at the old resolution and scales the result. Everything blurs, and worse, every
     number in the loop below is in drawing pixels: the bird's radius, the gap, the pipe width. A
     scaled canvas is a game where the collisions do not match what you can see.
     Set here rather than in the markup because the page is a fraction of the screen and the screen
     is not known until it exists. */
```

### MEASURED WHEN IT HAS A SIZE, and measured again when that changes.

in `initFlappy`

```
/* MEASURED WHEN IT HAS A SIZE, and measured again when that changes.
     This measured once, at start. A canvas that is not laid out yet reports nothing, so the
     `if` fell through and the element kept its DEFAULT 300×150 backing store — which CSS then
     stretched to whatever the box turned out to be. At 355×236 that is 1.18 across and 1.57 down,
     so a circle came out an egg standing on end, and every collision was against a bird nobody
     could see.
     It fell through more often after the pages became a carousel: a pane that is not the centred
     one is scaled and clipped, and a widget starting in it is asking about a box the browser has
     not settled. */
```

### A STILL DRAWING DOES NOT WAIT FOR A BOX:

in `initFlappy`

```
/* A STILL DRAWING DOES NOT WAIT FOR A BOX: with none it is not drawn (`false`), and the slot keeps its
     loader until the game is started for somebody looking — a retry booked from here would be a frame loop
     run for nobody, which is the one thing a still drawing is for not doing (check-widgets.js). */
```

### ---------- BLUE SKY, GREEN PIPES, AND A BIRD

in `initFlappy`

```
/* ---------- BLUE SKY, GREEN PIPES, AND A BIRD ---------------------------------------------------
     ASKED FOR AS "make it look more like flappy bird. blue scky green pipes and the bird", and it
     overrules a decision this file argued at length: four shades of olive green, because the panel
     the original ran on had two bits per pixel and no backlight.

     THE OLIVE ARGUMENT IS KEPT HERE BECAUSE IT IS STILL TRUE OF WHAT IT WAS ARGUING — a shell round
     an olive panel is the object itself, where a shell round a sky-blue game is fancy dress. What
     it was not is an answer to what the owner asked for: the game is called Flabby Pird, everybody
     who opens it knows what it is quoting, and the thing they know is blue. So the panel is a sky
     again — AND THE HANDHELD CASE WENT WITH IT, in the same commit, by that same sentence. See
     `.widget-full:has(.flappy)` in style.css, where the shell was.

     EIGHT COLOURS AND THEY ARE THE ORIGINAL'S OWN. A cyan sky rather than a pure blue, because that
     is what the sprite sheet holds and a flat cornflower reads as a template; a pipe that is three
     greens rather than one, because a lit edge and a shaded one are the whole of what makes a
     rectangle a tube; and one dark outline shared by the pipes, the bird and the floor, which is
     what keeps a bright palette from reading as clip art.

     DECLARED HERE RATHER THAN IN THE STYLESHEET, where `LCD` was and for its reason: the canvas is
     the only thing that paints any of them, and a colour written in two places is the pair that
     disagrees. `.flappy`'s own background is the app's sunk grey and is not a second copy of the
     sky — see the note there for the one moment it shows. */
```

### SCALED FROM THE WIDTH, which is the axis this game is played along.

in `initFlappy`

```
/* SCALED FROM THE WIDTH, which is the axis this game is played along. Scaling from the height
     was wrong twice over: the box is now portrait, so it made everything four times too big, and
     height is not what a side-scroller's difficulty depends on — how far away a pipe is when you
     first see it is a horizontal distance, and so is how long you have to react.
     The original was tuned on a 300px-wide canvas, so that is the unit. Proportions hold and the
     difficulty holds with them, which is the whole point of scaling rather than hard-coding. */
```

### THE GAP IS 98, NOT 110:

in `initFlappy`

```
/* THE GAP IS 98, NOT 110: *"make flappy bird slightly hard. maybe by tightening gap of pipe."*
     About a ninth narrower -- the bird (radius 9) has 80 units of slack where it had 92 -- so the
     same flap rhythm still clears it, with less room for a late one. Only the gap moved: gravity,
     flap and speed are what the game feels like, and the owner asked for harder, not different. */
```

### THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it.

in `initFlappy`

```
/* THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it. The bird
     died at the canvas EDGE while the old panel's two-shade band sat above that line, so the last
     few pixels of every fall were a bird inside the ground. A strip you can hit is what the game
     being quoted has, and it is the only thing that makes the bottom of the picture read as a
     floor rather than as where the picture stops.
     EVERYTHING THAT USED `H` AS THE BOTTOM NOW USES `FLOOR` — the death test, the bottom pipe, and
     where a pipe's mouth may fall. One name, so they cannot disagree about where down is. */
```

### Through `send`, which refuses to resolve on a refusal.

in `gameOver`

```
/* Through `send`, which refuses to resolve on a refusal. This ignored the reply entirely
           — `.then(() => …)` runs whatever came back — so a rejected save ran the success branch
           and the catch below, written for exactly this, could never fire. */
```

### ---------- TWO HALF-TESTS FOR ONE QUESTION, REPLACED BY THE ONE THAT ASKS IT

in `gameOver`

```
/* ---------- TWO HALF-TESTS FOR ONE QUESTION, REPLACED BY THE ONE THAT ASKS IT ----
               THIS MATCHED A STUDENT ON HANDLE ALONE AND A TUTOR ON `title` ALONE. Either half
               answers "not you" for somebody the other would have found — a tutor signed in with
               a handle and a display name that differ was simply never located, so a record they
               had just set was written to the sheet and never to the row the app was holding.
               `mineIs_` is the one test, id first, and it is used here and by `accountPages_`. */
```

### The board is a list, not the game — redrawing it mid-play costs one innerHTML on a dead bird and is the only thing that stops the card announcing a record

in `gameOver`

```
/* The board is a list, not the game — redrawing it mid-play costs one innerHTML on a
               dead bird and is the only thing that stops the card announcing a record above a
               chart that still shows the old one. The canvas is untouched. */
```

### The screen already says "New best!".

in `gameOver`

```
/* The screen already says "New best!". If the save never lands, a child believes a score
             was kept that was not, and finds it gone next visit with nothing to explain it. Say so
             quietly rather than lying, and put the old best back so the display is honest. */
```

### PAINTED RATHER THAN CLEARED — `clearRect` leaves the canvas transparent and the app's black shows through, which is what once made this a bird in a cave.

in `initFlappy`

```
/* PAINTED RATHER THAN CLEARED — `clearRect` leaves the canvas transparent and the app's black
     shows through, which is what once made this a bird in a cave.
     FLAT, NOT A GRADIENT, and this time for the sky's own reason rather than the panel's: the game
     being quoted has a flat sky with things drawn ON it, and a vertical gradient behind clouds is
     the one detail that reads as a stock template. The depth is in the parallax instead. */
```

### ---------- THREE LAYERS AT THREE SPEEDS, WHICH IS THE WHOLE BACKGROUND

in `initFlappy`

```
/* ---------- THREE LAYERS AT THREE SPEEDS, WHICH IS THE WHOLE BACKGROUND -------------------------
     The clouds crawl at a third of the pipes, the scrub at a half and the floor at the full speed.
     That is what says "far away" without drawing anything further away, and it is also the only
     thing that makes the game feel fast: with a still floor the eye reads the whole screen as
     slower than the pipes actually are.
     EVERY OFFSET COMES OFF `S.frame`, so a game that is not running holds still — a background
     scrolling under a "Tap to play" is a screen that looks like it has already started. */
```

### A SCALLOPED BAND ALONG THE TOP OF THE FLOOR.

in `initFlappy`

```
/* A SCALLOPED BAND ALONG THE TOP OF THE FLOOR. Half-circles rather than a skyline, because a
     skyline is a drawing somebody has to get right and a row of arcs is three primitives that
     reads as scrub at any size. Contiguous by construction — each arc spans exactly its own step,
     so the band has no seams to line up. */
```

### ---------- A PIPE IS A TUBE WITH A MOUTH

in `initFlappy`

```
/* ---------- A PIPE IS A TUBE WITH A MOUTH -------------------------------------------------------
     FOUR RECTANGLES, NOT TWO: the shaft and a wider cap at each end. The cap is what the bird
     actually flies between, so widening it is not decoration — it is the edge you are judging, and
     a shaft with a flat end gives the eye nothing to judge against.
     THE COLLISION IS STILL THE SHAFT. The cap overhangs it by a few pixels on each side and those
     pixels are free, deliberately: a hitbox tighter than the drawing is the version of this game
     that feels fair, and one wider than it is the version people stop playing. */
```

### THE SCORE IS ON THE SCREEN.

in `initFlappy`

```
/* THE SCORE IS ON THE SCREEN. It used to be two rows underneath and nothing else, in the app's
     own settings styling — a score kept on a shelf beside the game rather than in it. The `Score`
     and `Best` rows are still there and still right, because they are what a person reads when the
     go is over; this is what they read while it is running, and no version of this game has ever
     asked anybody to look away from the bird to find out how they are doing. */
```

### BIG, CENTRED AND OUTLINED, which is where the original keeps it and is also the only place a white number survives:

in `hud`

```
/* BIG, CENTRED AND OUTLINED, which is where the original keeps it and is also the only place a
       white number survives: a sky, a green pipe and a tan floor all pass under this line, and an
       unoutlined figure disappears into whichever of them it happens to be over. */
```

### THE BEST COMES OUT OF THE ROW THAT ALREADY HOLDS IT rather than a second variable — that row is written by the code that decides what a best is, and two places

in `hud`

```
/* THE BEST COMES OUT OF THE ROW THAT ALREADY HOLDS IT rather than a second variable — that row
       is written by the code that decides what a best is, and two places holding one number is the
       pair that disagrees. Small and to one side: it is a fact about you, not about this go. */
```

### ---------- THE BIRD, AND THE TWO THINGS THAT MAKE IT ONE

in `initFlappy`

```
/* ---------- THE BIRD, AND THE TWO THINGS THAT MAKE IT ONE --------------------------------------
     IT TILTS WITH ITS OWN VELOCITY. Nose up on the way out of a flap, nose down in a dive — which
     is not decoration: it is the only thing on the screen that tells you how fast you are falling
     before you have fallen. A bird drawn level is a bird you have to read the gap to judge.
     AND THE WING BEATS WHILE THE GAME RUNS AND HOLDS WHILE IT DOES NOT. A bird flapping over a
     "Tap to play" is a bird nobody has told to stop, and it is the same fault as a background that
     scrolls before the game has started.

     DRAWN AT THE ORIGIN AND MOVED BY THE CANVAS, because the tilt is a rotation about the bird and
     every coordinate here would otherwise have to carry `S.bird.x` through a trig function. The
     collision is untouched by it — that is a circle of `S.bird.r`, and a rotation does not move a
     circle's centre or change its radius. */
```

### ---------- THE FLAP LANDS ON THE FINGER GOING DOWN

in `initFlappy`

```
/* ---------- THE FLAP LANDS ON THE FINGER GOING DOWN ---------------------------------------------
     REPORTED AS "when you tap theres like a slight delay" ON AN IPAD, and the delay was the binding
     rather than anything being drawn. `click` FIRES ON THE RELEASE — so every flap this game has
     ever taken waited out the whole of a tap, the eighty to a hundred and fifty milliseconds
     between a finger landing and it lifting again, before the bird moved. There is nothing to tune:
     no part of that is removable while the event is the wrong one.
     (`.flappy` already carries `touch-action: none`, so the browser's own double-tap wait was not
     in it — that is the delay people usually reach for and it was not this one.)

     `pointerdown` FIRES THE INSTANT THE FINGER LANDS, and it answers a finger, a pen and a mouse
     from one binding, which is why it is this rather than `touchstart` beside a click.

     A SWIPE THAT BEGINS ON THE CANVAS ALREADY FLAPPED, so nothing is lost by moving off `click`.
     `PRESS_MOVED` in shell.js swallows the click a drag produces, but it does so in the document's
     own bubble handler — an element handler in the target phase runs first and always did.

     `onclick` IS CLEARED RATHER THAN LEFT ALONE. The canvas is rebuilt on every paint of the column
     so there is normally nothing on it, and a stale one would be a second flap per tap. */
```

### ---------- NOT WHILE SOMEBODY IS TYPING

in `initFlappy`

```
/* ---------- NOT WHILE SOMEBODY IS TYPING -----------------------------------------------------------
     THIS ATE EVERY SPACE ON THE PAGE. It is on `document`, it stays on once the Games column has been
     drawn, and it asked only whether the canvas exists — so after one visit to Games a laptop could not
     type "two words" into the videos search (it became "twowords", and found nothing), nor into Find's
     box. Found by the audit of the video searcher on 9 Oct. A key that lands in something you type into
     is that box's key: the bird flaps on a Space anywhere else, as before. */
```

