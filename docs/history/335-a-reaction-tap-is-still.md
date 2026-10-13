## A reaction tap is still: a press on one post redraws that post's own parts, never the column

**The owner, 10 Oct:** *"The post section is a bit buggy. When I click a reaction it bugs out a bit. On
only some of them."*

### What was wrong

A face redrew the whole Feed column to change one row of pills. The chain:

- `on('react')` called `reactRepaint_()` (and again for the failed-save undo);
- `reactRepaint_` called `repaint()`;
- `repaint` is `paint(AT)`, and `paint` rewrites the screen's `innerHTML`.

So every card on the feed was thrown away and built again, and every `<img>`, `<video>` and pane on it
became a new element. A new element has none of what the old one had already worked out:

- **A picture has neither its pixels nor its size.** The post photograph is `decoding="async"`,
  `loading="lazy"` from the third post on, and `.page .post-pic { aspect-ratio: auto 4 / 5 }` holds a 4:5
  box until the file is read again. `paneWatch_` sees a rebuilt card as a new card, so `paneReach_`
  measures it with the 4:5 stand-in and picks a zoom for the wrong height. When the real size lands
  the card is drawn at that zoom with its foot clipped, and the observer fits it again a frame or two
  later.
- **A clip stops and goes back to 0:00.** The rebuilt `<video preload="metadata">` has `readyState` 0, so
  it sits as a grey 4:5 box until its metadata comes back.
- **A scrolled pane goes back to its top.** A card that is still taller than its pane at
  `PANE_ZOOM_MIN` (0.7) scrolls. A new pane starts at `scrollTop` 0, so the face you scrolled down to
  press leaves the screen.

A poll vote did the same thing: `on('vote')` called `repaint()` too, for the vote and for its undo.

### Which posts, and why only some

The post decides it. Which face was tapped, and whether it was added, moved or taken back, made no
difference. Three investigations measured it in Chromium 1194 at 320x568, 390x844 and 1280x800, with
touch taps sent over CDP and screencast frames as ground truth:

- **A post with a clip:** wrong on every tap, with the cache on or off. A playing clip read 2.51s before
  the tap and 0.00s, paused, as a different element after it. At 390 a 9:16 clip took the card from 773
  to 669 to 841 and back to 773px, zoom 0.919 → 1 → 0.919. The faces moved 122px up from under the
  finger, then 50px down, then back.
- **A single photograph that is not 4:5** (16:9, square, 2:1, 9:16): it blanked for 0.3–0.9s and the
  card changed height for several frames. A 16:9 card grew about 183px at 390 and its top moved 35px.
  This happens whenever the browser cannot hand the picture straight back. With the HTTP cache off
  (Playwright's `page.route`) it happens every time. On a phone it depends on whether the Drive
  thumbnail is still held. That could not be tested here: the proxy blocks `lh3.googleusercontent.com`
  and there is no WebKit on the machine.
- **A post taller than its pane:** the whole card rescaled twice, for example a 9:16 portrait at 390
  going 0.782 → 0.947 → 0.782 with its comments and composer clipped for about 100ms. A post past the
  0.7 floor jumped back to its top: 388px at 320x568.
- **Barely affected:** a photograph that is already 4:5 only blinks, because the stand-in is its own
  shape. Grid cells are fixed squares, so grids only blink. A text post or a poll has nothing to
  rebuild but its avatar, and the avatar blinks for about 400ms.

That split is the "only some of them".

Ruled out: the row itself. It is a fixed six-column grid, so a count appearing or gaining a digit moves
no cell. The time line is 44px with or without a total. Six faces never wrapped at 320, 390 or 1280.
`doGet` sends the shape `reacts()` expects. One tap is one pointerdown, one click and one `reactPost`.
The refused-save undo, the focus and `aria-pressed` were all right.

### The fix: fix the rule, not the instance

**A press that changes one post redraws only that post's changed parts, where they stand.**
`postRedraw_(id, parts)` in posts.js takes `[selector, drawer]` pairs. Each drawer is the same function
`postCard_` builds that part with, so a redrawn part cannot drift from the card's own. Every copy of the
post on the page has those parts replaced and nothing else:

- a reaction redraws `.reacts` (`reacts`) and `.post-when` (`postWhen_`), through `reactRepaint_(id)`;
- a vote and its undo redraw `.poll` (`poll`).

The picture, its zoom, a playing clip and a scrolled pane are never touched. A part that now draws
nothing is removed. A card without a part that now draws something, such as a first total on a post
with no time line, falls back to the whole `repaint`, which is what every press did before. `repaint`
stays for a payload landing, where anything on any card may have changed.

There is no placement and no stale mark, because nothing moved and no other screen draws these parts.
The row is a fixed grid and the time line is 44px either way (307), so a face never changes the card's
height. A poll whose bars appear may change it, and the `ResizeObserver` from `paneWatch_` already
re-asks the pane about a card whose height changes.

**The focus hand-back moved into `postRedraw_`**, so a vote has it as well as a face. When the control
holding the focus is replaced, its replacement gets the focus back. It is matched on every `data-`
attribute, compared as strings so an emoji or an id is never escaped into a selector, and focused with
`preventScroll`. A control the redraw did not reach keeps its focus and is left alone.

307's look is unchanged, and so are `REACT_POP_`'s one-paint landing, the gold pill, `aria-pressed` and
"N reactions". There is no CSS change, so `--css-version` stays. There is no backend change, so the four
version constants stay.

Measured with the fix: the press reached the screen in 44–91ms against 145–260ms before, and in 10–20ms
against 60–460ms under a load average of 16–35. `repaint()` took 52ms; redrawing one row took 1.7ms.

### What holds it

- **`check-flow.js`, "a post's faces…"**: PO1 now carries a picture and a clip. The journey requires the
  same `<article>`, the same pane and the same picture and clip after the add, after the take-back and
  after a failed save's undo. The elements are compared by identity: a rebuilt picture has the same
  `src` and none of its pixels, which nothing reading the markup can see.
- **`check-flow.js`, "a poll vote redraws only the poll…"**: a new journey, since nothing had ever voted.
  It checks the same elements through a vote and through a refused vote's undo, that yours is ticked,
  "4 votes", `votePoll` with the `personId`, the server's reason in the toast, and that the focus stays
  on the row that was pressed. `FLOW_ONLY=react` runs both journeys.
- **`check/states.js`, `reactions a tap keeps the card`** (signed in), measured by `check/ui.js` at all
  five widths. PO1 becomes a single square photograph: square is not 4:5, and the fixture's grid only
  blinked. The state waits for the picture, then for five still frames, because `goPage` leaves the
  column gliding onto its line for about 500ms. Then it taps 😂 through the app's own click handler.
  In the tap's own task and on every frame for half a second after, it compares the `<article>`, the
  pane, the `<img>`, the card's height, zoom and top, and the picture's height. `ui.js` stands in for
  the phone that cannot hand the picture back, because `page.route` turns the cache off.
  `ui.js` gained `why`: a state can say what it saw when `expect` fails, so a fault three frames long is
  not left to a screenshot. The state's `leave` sets `HOLD_AT = null`. The tap is a press on the card in
  front, which holds its top (shell.js), and putting the fixture's taller grid back under that hold left
  the feed 43.8px below the middle at 1920. The columns-in-line rule named it.

**Proved by reverting the fix** (posts.js from the commit before, the checks kept):

- `FLOW_ONLY=react node js/check-flow.js`: both journeys fail. The faces journey fails on all three
  presses ("PO1 is a new <article>", "PO1's picture and clip are new elements"). The poll journey fails
  the same way and also loses the focus to BODY.
- With only `postRedraw_`'s fallback forced to `repaint()`, both still fail, so the journeys run the
  in-place path and not the fallback.
- `node check/ui.js --screen=feed` exits 1 with the state NOT measured at every width:
  - 320: "the card is 845.8px tall, was 545.5", "drawn at zoom 1, was 0.7";
  - 390: 773.9 → 907.3, zoom 0.937 → 1;
  - 768: 924.8 → 1032.8;
  - 1280: 725.7 → 1009.2 at zoom 1, then 653.8 at 0.719, against 0.798;
  - 1920: 871.3 → 961.2;
  - at every width, "the post is a new <article>" and "the picture is a new <img>".

With the fix put back, everything is green again: both journeys, and `ui.js --screen=feed` exits 0
with nothing new.

### Left as it was, and why

- **A comment** (`cmt-add`, `cmt-del`) still waits for the server and then calls `load()`. That is a
  payload landing, not an optimistic press, and a whole repaint is honest there.
- ~~**`reactPost` takes no `LockService`**~~ — it does now; see the second round below.

### The second round: what verification found after the fix

Verification drove every kind of post at 320, 390 and 1280 again, with touch and mouse, slow and refused
saves, and quick double taps. Three findings came back. Each is reproduced, fixed at the rule and held by a
check that fails without it.

#### 1. A post with no date still rebuilt the column

**The fix held for every post with a date and for no other.** A row typed into the posts tab by hand without
`creation_date`, `posted_on` or `uploaded_date` arrives as `at: 0, when: ''`. The empty feed asks for exactly
that row ("an image link and a caption"). With no reactions yet, `postWhen_` returned nothing, so the card had
no `.post-when` at all. Then:

- **The first face had nowhere to put its total.** `postRedraw_` found no line to replace and fell back to
  `repaint()`, which is the whole-column rebuild this note exists to remove. Measured at 390 with a 16:9
  photograph: a new article, pane and `<img>`, the card 428.5 → 689px, its top 206 → 961 → -471 for a frame or
  two, the avatar blank. A clip went back to 0:00 and every other clip on the column was fetched again. The
  second tap of a quick double tap landed in the jump and was lost.
- **The last face taken back removed the line.** The card shrank 36.6px (37.3 at 320) and the tile row jumped
  up under the thumb. On a clip post it also re-zoomed, 0.898 → 0.938.

**The rule:** the place a total goes is held before there is one. `postWhen_` now draws the line for every post
that has faces, empty until somebody reacts. That is what 307 meant by "44px tall either way", and now it is
true of every post rather than every dated post. A post with neither a date nor faces still has no line,
because nothing could ever be drawn there. No CSS change: `.post-when` already has `min-height: 44px`.

`postRedraw_` also stopped calling `repaint()` when no copy of the post is on the page. `DATA` already holds
the change and the next draw reads it. That case is reached by a save that fails after a payload landing has
taken the post off the page, and rebuilding the column to undo a face on a post that is not there was the
same fault again. The fallback is left only for a card that lacks a part a press must now draw, and no press
reaches it any more.

#### 2. Two quick taps, both refused, left the face on

**Each tap sent its own request, and each refusal restored its own snapshot.** The snapshot was taken before
that tap. So for 🎉 tapped twice 80ms apart with both saves refused:

- the first refusal put back "no 🎉";
- the second put back the state from *after the first tap*, so 🎉 lit itself gold again about 1.3s after it was
  taken back;
- the line read "5 reactions" where there were 4, and two "Sign in to react." toasts appeared.

A poll ended ticked the same way. This code predates the fix. The whole-column rebuild used to swallow the
second tap (18 of 84 double taps lost one), which hid it. Once every tap landed, it was reachable every time.

#### 3. The page and the server could disagree after two quick taps

**`reactPost` and `votePoll` were toggles**: "the same one again takes it back". A toggle means something
different depending on what reached the server before it. If the first tap's save was refused and the second's
accepted, the server held 😂 while the page showed nothing, and a reload brought back a reaction the person had
taken back. Nothing on the server stopped two requests at once either. There was no lock, so both could read
"nothing of yours" and both add a row, and a copy left that way counted twice on every load and came back after
the first was removed.

#### The fix for 2 and 3: one save at a time, carrying the end state

`choiceSave_` and `choicePump_` in posts.js serve both a face and a vote, because they are the same kind of
thing: one choice among a few, held by a person.

- **Every tap moves the page at once, as before.** `reactMove_` and `voteMove_` move yours and every count with
  it. The same function is used for the tap and the undo, so the four fields of a reaction (`yours`, the counts,
  the total and `by`) cannot drift apart.
- **A post has at most one save in flight.** The pump sends what the page shows now if it differs from what the
  server holds (`saved`), and sends nothing while a save is out. When that save returns, it sends again only if
  more taps moved the page in the meantime. Ten taps during one slow save are two requests. A tap that only took
  back an unsaved tap sends nothing.
- **A refusal moves the page to `saved`**, which is what the server holds, not what came before that tap. This
  is right however many taps came in between, and the reason is said once.
- **The request carries `want`**, the face or answer to end on (`''` for none), and the server sets it.
  dopost.gs sets `want` under the script lock, reading the tab fresh inside it the way `submitAnswer` does, and
  over *every* row this person has on the post. Setting keeps one row and `''` keeps none, so a copy an old race
  left behind is cleared by the next save. The same request twice, or one arriving late, changes nothing. A lock
  that cannot be had answers `why: 'busy'` and writes nothing.
- **The old field still goes.** `emoji` (or `choice`) is sent as the toggle that gets from `saved` to `want`.
  The Apps Script project reaches the live site by a separate step (CLAUDE.md, "Deploying"), and a backend that
  has not been updated yet toggles on that field and lands in the same place. A save the server refused changed
  nothing there, so `saved` stands. A save lost on the wire may have landed. In that case the page shows
  `saved`, and the next press sends `want`, which the new server sets whatever it held.

The four version constants moved together to `2026-10-11-a-choice-is-set`. Until `backend/` is pulled into Apps
Script, the You screen reports the backend as not deployed, and the phone works with the old toggle in the
meantime.

**What the verification driver will still print, and why it is right:** `2 taps sent 1 requests` on every
"refused double". The second tap only took back the first, unsaved one, so after the refusal there is nothing to
send. The end state is the one the driver's own server model expects. `the clip went back 10.4 → 0` on the
undated clip post is the 12-second test clip looping. It is the same `<video>` element (the same id before and
after), and the "fetched again" next to it is the loop's range request under `no-store`.

#### What holds the second round

- **`check-flow.js`, "a post with no date…"**: an undated post with a picture, a clip and no reactions has its
  line before anybody reacts. The article, pane, picture and clip stay the same elements through the first face
  and through the last taken back, and the line is still there, empty, afterwards.
- **`check-flow.js`, "two quick taps on a post…"**: the server is played twice from the same requests, once as
  dopost.gs is now (`want` is set) and once as the deployed one may still be (a toggle). It checks:
  - no second save of a post goes out while the first is unanswered;
  - both refused: the page is as the server holds it, the total is right, the reason is said, one save went;
  - first refused, second accepted: the page and both servers agree;
  - both accepted: the second save goes after the first, as `want: ''` with `emoji` 👏;
  - two faces quickly: it ends on the second;
  - the same for a poll.
- **`check/states.js`, `reactions an undated post keeps the card`**, measured by `check/ui.js` at all five
  widths. It taps 👍 on an undated post with a square photograph, then again 250ms later. The article, pane and
  `<img>`, the height, zoom and top, and the line are held throughout.
- **`js/check-choice.js`** (new, in check-all), through the real `doPost` over the in-memory ledger:
  - `want` sent twice gives one row;
  - `want: ''` twice gives none;
  - a change of face changes one row;
  - two of your rows are cleared to one by a set and to none by `''`, and somebody else's row is untouched;
  - a face or answer not on offer is refused and writes nothing;
  - a phone without `want` still toggles;
  - the lock is taken, and a lock that cannot be had writes nothing;
  - the payload counts what is there.

**Proved by reverting:**

- **posts.js from the first round** (the checks kept):
  - the undated journey fails six ways (no line, a new article, new media, the line gone);
  - the quick-taps journey fails with concurrent saves, 🎉 still yours, "5 reactions", Paper 3 still ticked, and
    the page and the server disagreeing.
- **Only `postWhen_` reverted:** the undated journey fails.
- **Only the one-in-flight guard removed:** the quick-taps journey fails with saves going out together, a
  double tap ending with 👏 held by the server and not the page, and the old toggling backend ending somewhere
  else.
- **`check/ui.js --screen=feed` on the first round's posts.js:** exits 1 with the new state NOT measured at
  every width, for example:
  - 320: card 519.5 → 845.8px, zoom 0.7 → 1;
  - 390: 773.3 → 907.3, zoom 0.979 → 1, then 739.7px when the line went;
  - 1280: 725.5 → 1009.2 at zoom 1, then 696.8.
- **dopost.gs from the first round:** `check-choice.js` fails 21 ways.

With everything put back: all 275 journeys pass, `ui.js --screen=feed` exits 0 with nothing new, and
`press.js --screen=feed`, `swipe.js`, `cascade.js` and the static and backend checks are green.

**Changed by [341](341-what-a-flick-can-reach-is-drawn-before-it-gets-there.md), after its review** — "redraw only what changed" reaches the column in front at a landing: a landing whose markup is byte-identical, with nothing pressed since, writes nothing to the column you are on (a column with no widgets and no finder window; one with widgets is redrawn and restarted, as 331 says), and an arrival after such a landing writes nothing to the column it arrives at.
