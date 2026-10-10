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
- **`reactPost` takes no `LockService`** (dopost.gs), so two quick taps could race on the server. This
  was noted by one investigation and not reproduced. It is a backend question, and nothing on the phone
  showed it.
