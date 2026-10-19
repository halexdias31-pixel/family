# check/share.js

The full text of comments in `check/share.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/share.js IS THE SHARED PICTURE THE RECEIPT ON THE SCREEN?

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/share.js

   IS THE SHARED PICTURE THE RECEIPT ON THE SCREEN? Measured, pixel by pixel.

   ASKED FOR AS *"just make sure sharing booking is an identical jpg or png or whatevers best of the
   booking reciept."* "Identical" is a claim about pixels, so the only honest instrument is one that
   looks at pixels: this presses the Share tile through the app's own dispatcher, catches the file
   handed to `navigator.share`, screenshots the same element at the same device scale, and compares
   the two. `check-flow` proves the plumbing (a PNG, a File, the share sheet or a download); it runs in
   jsdom, which has no layout and no canvas, and so cannot say one word about what the picture LOOKS
   like. This is the half it cannot reach.

   WHAT IS COMPARED IS WHAT IS SHARED. The tiles and an admin's two extra money rows are hidden for
   the picture (`.rc-snap`, see receipt.js), so the screenshot is taken with that same class on. Any
   other difference is a fault.

   FOUR RECEIPTS AT TWO WIDTHS: the booking form as somebody fills it in (a dozen dropdowns on paper,
   which is where a clone most easily gets the answer wrong), the same form with a room chosen (whose
   Venue row is words with the select laid over them — see `wrap` in book.js), a saved session, and somebody else's
   waiting list as a family not on it sees it — the one with the `Can come` tally's bars and the
   `Take a seat` tile, since the way in stopped being a block under the paper. The last two are the
   states `check/states.js` already builds, entered through their own `enter`, so this cannot drift
   from what `ui.js` measures. 320 because everything breaks there first; 390 because it is the
   common phone.

   NO PORT. The files are served by Playwright's own router on an address that never touches the
   network, because every other browser check here holds a port and this machine runs several
   worktrees' checks at once. The backend is the fixture, exactly as `ui.js` stands it in.

   A RESIDUE IS EXPECTED AND IT IS BOUNDED. The card sits at a fractional position on the screen,
   inside a column `placeCells` has translated, and at 0,0 in the picture — so the browser snaps each
   line of text to a whole device pixel from a different starting point, and a row can land one
   device pixel (half a CSS pixel) higher or lower. Measured on the first run: 0.3–1.7% of pixels
   different at the exact best alignment, every one of them a glyph edge a pixel out. So a pixel is
   WRONG only when nothing within one device pixel of it on the screen is within 64 of it on any
   channel (a quarter of the range), and the run fails above 0.5% wrong. A missing row, the fallback
   typeface, a select showing its first option or a tick drawn grey are each wrong over far more
   than that. All three figures are printed, so the residue is visible rather than averaged away.

     node check/share.js             compare, exit 1 on a mismatch
     node check/share.js --shots=DIR also write each pair and a diff to DIR
================================================================================================== */
```

### ---------- IN THE PAGE: PRESS SHARE ON THIS RECEIPT AND HAND BACK THE FILE

top level, before `REF`

```
/* ---------- IN THE PAGE: PRESS SHARE ON THIS RECEIPT AND HAND BACK THE FILE ------------------------
   `navigator.share` is answered by a stand-in that keeps the file — the phone's share sheet is the
   one thing a headless browser has not got. `canShare` says yes to files, which is the iPhone and
   Android path; the download path is `check-flow`'s. */
```

### ---------- WHICH SAVED RECEIPT EACH PICK IS, BY THE REFERENCE PRINTED ON IT

top level, before `REF`

```
/* ---------- WHICH SAVED RECEIPT EACH PICK IS, BY THE REFERENCE PRINTED ON IT ---------------------
   `session` is the admin's own (`a session receipt` in check/states.js) and `class` is somebody
   else's waiting list seen by a family not on it — the receipt that carries a `Can come` tally and
   a `Take a seat` tile since *"the session booking thing at the bottom of receipt should be a line
   in the booking"*. Found by the `Session …` line rather than by page, the way the states find them. */
```

### ---------- IN THE PAGE: TWO PNGs, PIXEL BY PIXEL, AT THE BEST REGISTRATION

top level, before `compare`

```
/* ---------- IN THE PAGE: TWO PNGs, PIXEL BY PIXEL, AT THE BEST REGISTRATION ---------------------
   THE CARD SITS AT A FRACTIONAL POSITION ON THE SCREEN and at 0,0 in the picture. Measured on its
   first run: 259.6 CSS pixels wide at 320, so the screenshot — which rounds its clip OUTWARD — is a
   device pixel wider and taller than the picture and starts half a pixel earlier. Compared at 0,0
   that is every edge in the card one pixel out and 4.9% "different" on two images a person could not
   tell apart. So the picture is slid over the screenshot up to three device pixels each way and the
   best fit is the one reported: a registration, not a tolerance — a missing row or a wrong colour
   does not get better at any offset. */
```

### ---------- AND THEN A PIXEL'S WORTH OF SLACK, LOCALLY

in `compare`

```
/* ---------- AND THEN A PIXEL'S WORTH OF SLACK, LOCALLY -------------------------------------------
       ONE REGISTRATION IS NOT ENOUGH, measured: with the best global offset found, whole ROWS still
       came out red — `Level`, `Tutor`, `Dates` — each one device pixel above or below where the
       screen put it, and the rows between them exact. That is the browser snapping each line's
       baseline to a whole device pixel, from a fractional starting point that differs between the
       screen (where the column is a composited layer `placeCells` has translated) and the picture
       (which starts at 0,0). The words, the face, the colours and the order are the same; the snap is
       not something the page controls.

       SO A PIXEL IS A FAULT ONLY IF NOTHING WITHIN ONE DEVICE PIXEL OF IT ON THE SCREEN MATCHES. Half
       a CSS pixel. A row that is missing, a word in the fallback typeface, an answer that came out as
       the select's first option, a gold tick drawn grey — every one of those is wrong over many
       pixels in every direction and survives this untouched. Both figures are printed; the strict
       one is the honest size of the residue, this one is what fails the run. */
```

### BOTH WAYS ROUND. A pixel of the picture with nothing like it near it on the screen, OR a pixel of the screen with nothing like it near it in the picture.

in `compare`

```
/* BOTH WAYS ROUND. A pixel of the picture with nothing like it near it on the screen, OR a pixel
       of the screen with nothing like it near it in the picture. One direction alone is half blind:
       measured, a picture showing "Test Admin" where the screen showed "Nobody yet …" was mostly
       dark pixels that found dark pixels, and only the strokes of the picture's own letters counted. */
```

### AND "NEAR" MEANS INSIDE THE RANGE OF THE NEIGHBOURHOOD, NOT EQUAL TO ONE OF IT.

in `compare`

```
/* AND "NEAR" MEANS INSIDE THE RANGE OF THE NEIGHBOURHOOD, NOT EQUAL TO ONE OF IT. An edge that
       sits at x.75 on the screen is drawn as a pixel three-quarters lit — a value neither the pixel
       left of it nor right of it has — while the same edge in the picture, at a whole pixel, is fully
       lit or not at all. Each is a fair drawing of the same edge. So a pixel is matched when every
       channel lies between the darkest and the brightest of the 3x3 around its partner, give or take
       LOUD: anti-aliasing is always a value BETWEEN its neighbours, and a wrong glyph, a wrong colour
       or a missing row is a value outside them. */
```

### ---------- AND WHERE THE WRONG PIXELS ARE, WHICH IS WHAT TELLS NOISE FROM A FAULT

in `compare`

```
/* ---------- AND WHERE THE WRONG PIXELS ARE, WHICH IS WHAT TELLS NOISE FROM A FAULT -----------
       A PERCENTAGE CANNOT TELL THEM APART, measured: with the receipt's own typeface taken out of the
       picture the form came out 0.37% wrong, under a threshold the true picture sits at 0.2% of. The
       fallback monospace is close enough in shape that a page of slightly different glyphs adds up
       to very little — but it is EVERYWHERE, in clumps, and the honest residue is single glyph stems
       a pixel out, scattered. So the picture is cut into 6x6-pixel tiles and a tile with twelve or
       more wrong pixels (a third of it) is a BLOT. Measured: 0–20 blots on a true picture at either
       width, 64–317 with the fallback face. What is left on a true picture is real and is one CSS
       pixel: the SVG is laid out exactly as the card (an in-page clone measured within 0.3px of it
       on every element) but painted under a 2x scale, and the browser snaps a box edge or a tick to
       the device grid from a different origin there than on the screen. */
```

### ---------- AND THE FORM WITH A ROOM CHOSEN

top level, before `roomState`

```
/* ---------- AND THE FORM WITH A ROOM CHOSEN ---------------------------------------------------------
     REVIEW, 10 OCT: with each of the fixture's three rooms chosen at 390, the picture the Share tile
     made said "Colliers …" on the Venue row for every one — as the screen did, so the pixel comparison
     passed a picture that could not say which room had been booked. The row draws its answer as words
     now (`wrap`, `stepSelect_`); this pick enters the state `check/ui.js` measures it in, and asks that
     the whole room is in the picture as those words, uncut on the screen, as well as that the picture
     is the screen. */
```

### ---------- A REAL PHONE'S HEIGHT, WHERE THE SESSION CARD IS SHRUNK TO FIT

top level, before `ctx`

```
/* ---------- A REAL PHONE'S HEIGHT, WHERE THE SESSION CARD IS SHRUNK TO FIT ---------------------
     AT 320x568 THE SAVED SESSION IS DRAWN AT 76% WITH CSS `zoom` (`paneReach_`), and the box the
     browser reports is the shrunk one while every computed length is the full-size one. Sized off
     the box, the picture was a 76% window onto a 100% layout — the bottom quarter and the right
     quarter cut off. It is the full-size card now, which is the same layout with bigger letters;
     this asks that its size is the card's own size at 2x and that the zoom was really in effect. */
```

### ---------- A FORM WITH AN ANSWER ON IT

top level, before `chose`

```
/* ---------- A FORM WITH AN ANSWER ON IT --------------------------------------------------------
         THE BLANK FORM SHOWS THE FIRST OPTION OF EVERY SELECT, so a clone that forgot what had been
         picked would photograph it correctly. One row is answered — through the select's own
         `change`, which is what a finger does — with an option that is NOT the first, so a picture
         showing the first option is a picture showing the wrong answer. */
```

### ---------- WHAT IS IN THE PICTURE, READ RATHER THAN LOOKED AT

top level, before `src`

```
/* ---------- WHAT IS IN THE PICTURE, READ RATHER THAN LOOKED AT ------------------------------
         THREE FACTS THE PIXELS ARE TOO CLOSE TO CALL, asked of the SVG `rcPng_` builds — the app's
         own function on the same element, so this is the picture's source and not a model of it.
         Measured: with the face left out, the system monospace is near enough in shape that the
         pixel rule only just fails, and with a select showing its first option instead of the answer
         the difference is a clipped word in one row — under the noise at 320. Both are certain here.
           · the receipt's typeface is carried inside it, as a `data:` URL, under its own name
           · the answer picked on the form is the answer in the picture
           · no tile and no admin-only money row is in it */
```

### EVERY EMPTY BOX'S HINT AND THE INK THE SCREEN DRAWS IT IN — a faint hint and a typed answer are a few pixels apart in a narrow column, too few to count, and

in `src`

```
/* EVERY EMPTY BOX'S HINT AND THE INK THE SCREEN DRAWS IT IN — a faint hint and a typed answer
           are a few pixels apart in a narrow column, too few to count, and saying the wrong one is
           the document claiming somebody wrote something. */
```

### ---------- AND THE CLASS'S TWO LINES ARE IN IT, WHICH IS WHAT IT WAS SHARED FOR

top level, before `rcSel`

```
/* ---------- AND THE CLASS'S TWO LINES ARE IN IT, WHICH IS WHAT IT WAS SHARED FOR ------------
         THE JOIN OFFER WAS A BLOCK UNDER THE PAPER, so no picture ever carried the seats or the
         tally — they were not on the document. They are rows of it now, and a picture of a class
         that says nothing about who can come when is the half a family forwards it for. Asked of
         the picture's source, as the answer on the form is: the pixel comparison below would pass
         a card that had lost both rows on the screen AND in the picture. */
```

### THE PICTURE IS THE CARD'S OWN SIZE TIMES TWO, to the pixel the rounding allows.

top level, before `ew`

```
/* THE PICTURE IS THE CARD'S OWN SIZE TIMES TWO, to the pixel the rounding allows. Against the
         box rather than the screenshot, because a screenshot's clip is rounded OUTWARD from a
         fractional position and comes out a pixel or two larger than the thing in it. */
```

