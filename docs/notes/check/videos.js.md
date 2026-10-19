# check/videos.js

The full text of comments in `check/videos.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/videos.js THE VIDEOS CARD IN A REAL BROWSER:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/videos.js

   THE VIDEOS CARD IN A REAL BROWSER: WHAT A FINGER, A KEYBOARD AND A PHONE TURNED SIDEWAYS DO TO IT.

   *"make it look more like youtube, the widget, in the sense that at first all you see is a search
   bare, then you search and you see relevant result underneath. max 4 results show. you click on one,
   then it shows video. you can click fullscreen to make it fullscreen"* — the owner, 10 Oct (note 321).

   `check-flow.js` walks the card in jsdom, which has no layout, no top layer and no full screen, and
   `check/ui.js` measures each state once, at five sizes none of which is a phone on its side. The
   review of 10 Oct found four faults that live between those two, each of them invisible to both:

     HOLD      the search bar jumped under the typing finger — the card grew from the bar to four
               results, the column lifted it, the results narrowed and the card dropped straight back:
               128px both ways at 320x568 in the middle of a word. Asked here: the bar's top after
               every keystroke of "sunset" and back down to "s" never comes back down — nor at the
               first letter taken off over a film, where the watch view (lifted, on its side) gives
               way to one short row.
     SEARCH    the keyboard's Search key did nothing — the box says `enterkeyhint="search"` and the
               focus stayed in it, the keyboard up over the four results. Asked here: a real Enter
               takes the focus from the box, and the four results and the bar stay where they were.
     ONE       one tap built two players when the card was starred into Saved — an `autoplay` embed in
               the copy in front and one in the copy parked off the glass. Asked here: one real click
               in the Saved copy is one frame, one request to the player's host, in that copy only.
     FULL      the app's own full screen (an iPhone, which has none for a frame) was proved at 390x844
               and 844x390 only in a scratch script, so the rule that keeps it at its size on a phone on
               its side (`.pane > :has(.vid-watch.is-fs) { zoom: 1 }`) could be deleted with every check
               green — the Exit tile 31px and the film 485x273 at 844x390. Asked here, with the
               Fullscreen API deleted before any of the app runs and the tile pressed by a real click:
               the block is the viewport, the film is 16:9 and as large as the room allows, the Exit
               tile is 44px and off the picture — upright, on its side, turned while on, and back —
               and the frame loaded ONCE through all of it (moving an iframe reloads it).

   Every list, film and player here is invented and served by the check itself: `data/videos.json` is
   answered with six YouTube rows, the player's host with a page that counts its own loads, and the
   picture host with a plain frame. Nothing reaches the network.

   A RULE THAT COULD NOT REACH ITS SUBJECT FAILS, SAYING SO — no card, no box, no Saved copy, no tile.

     node check/videos.js                 everything
     node check/videos.js --only=hold,full    some of it: hold search one full
   VIDEOS_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
```

### ONE PAGE, ONE VISITOR, THE GAMES COLUMN TURNED TO THE CARD.

top level, before `boot`

```
/* ONE PAGE, ONE VISITOR, THE GAMES COLUMN TURNED TO THE CARD. `noFs` deletes the Fullscreen API before
   any app script runs — an iPhone's Safari, which has element full screen for nothing but a `<video>`.
   `star` puts the card on the Saved column, as a press on its star would. */
```

### ---------- HOLD: THE BAR DOES NOT COME BACK DOWN WHILE A SEARCH IS TYPED

top level, before `hold`

```
/* ---------- HOLD: THE BAR DOES NOT COME BACK DOWN WHILE A SEARCH IS TYPED ---------------------------
   The sizes the review measured it jumping at, both visitors where it differed. The first letter may
   lift the card (it grew past the glass); after that, every keystroke — narrowing to one, and
   Backspace widening again — leaves the bar where it was or higher, never lower. Emptying the box ends
   the search and is allowed to put the card back: it is not asked. */
```

### AND A SEARCH THAT BEGINS BY LEAVING A FILM:

in `hold`

```
/* AND A SEARCH THAT BEGINS BY LEAVING A FILM: "sunset" (one result) tapped, then a letter taken off
       over the player — "sunse", one short row where the film was. The watch view is a page of its own
       and may sit where it likes (on its side it is lifted); the edit that leaves it must not drop the
       bar from there. */
```

### ---------- FULL: THE APP'S OWN FULL SCREEN, UPRIGHT AND ON ITS SIDE

top level, before `measure`

```
/* ---------- FULL: THE APP'S OWN FULL SCREEN, UPRIGHT AND ON ITS SIDE --------------------------------
   Started at each size, turned to the other orientation while on, and turned back. An admin, whose card
   carries the Sync row and is the tallest — the card `paneReach_` draws smallest, which is what the
   zoom rule undoes. */
```

