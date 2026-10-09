## The whiteboard is the question pages' pen on a blank sheet, and what is drawn on it is never an answer

**The owner, 9 Oct:** *"Can you also add a whiteboard widget in tools. Make it bare bones for now."*

### What was built

**One widget, appended last on Tools** — `whiteboard` in `WIDGETS` (js/map.js), after `uploads`, a
`tool` and `solid` like the notepad. Its whole body is a heading and `.wb-box`; `initWhiteboard`
fills every copy (the Saved column draws one too). On it: a sheet of paper, the padlock, Undo and
Clear. **Nothing else, on purpose** — no colours, eraser, shapes, ruler or compass, export, sharing
or pages. The note over `WB_ITEM` in js/find.js lists what would come next and where each would go,
so whoever grows it starts from the format rather than from a guess.

### It is the pen the question pages already have, not a second one

Every hard part of a pen in this app is a bug report already paid for, and all of it is in
`padWrap_`, `padArm_` and the `pad-*` handlers:

| already solved by the pen | recorded in |
|---|---|
| a stroke must not slide the column: `data-noswipe` for the grid, `touch-action: none` for the browser, only while locked | the pen's `pad-draw` note; check/press.js "a line of best fit" |
| a drag that starts on the picture is still a swipe, and a tap on it locks the pen | `PRESS_MOVED`; `.qpad-art[data-do]` |
| the lock survives a repaint because it is read off `PAD_ON`, not left on an element | `padWrap_` |
| strokes as flat polylines, stored once per stroke; Undo and Clear redraw from storage | `padPath_`, `padRepaint_` |
| one set of marks per person signed in, and the phone's old marks move once to whoever opens them | 288, `padAdopt_` |

So `initWhiteboard` hands `padWrap_` a pseudo-item, `WB_ITEM = { key: 'whiteboard', prefix: 'board' }`,
and an empty SVG, and the pen does what it does for a question. **What `padWrap_` asks of a question
was read, not assumed**: `usesUnder_` answers nothing for anything that is not `kind: 'question'`;
`padTools_` with no `needs` and no words gives the pen alone, which the bar draws as no tool tile. The
generalisation is two lines: `padPrefix_` (the key's prefix, `pad` unless the item names one) and the
note under the bar.

### Its own prefix, so a scribble is never a question somebody answered

**Under `pad:` the board would have been an answer.** Its key would be `pad:u:P7:whiteboard`, and:

- `ansStore_` sends every `pad:<who>:` key to the account's `answers` tab, as `pad:whiteboard`;
- the backlog sweep in `answersAdopt_` walks every `pad:<who>:` key on the device and marks it to go
  up whether or not a question drew it — **proved**: with the prefix taken off `WB_ITEM`, the journey
  finds `ansDirty:u:P9` holding `pad:u:P9:whiteboard` and an `ansAt:` stamp beside it;
- that tab is the record of what a child answered, and anything that lists or counts answers from it —
  a progress page, a parent's summary, a log of what was handed in — would count a question called
  `whiteboard` that nobody can find.

**So the key does not look like an answer** — `board:u:<who>:whiteboard` signed in, `board:whiteboard`
signed out — rather than every reader of that tab, now and later, learning to skip one name.
answers.js matches `^(ans|pad):` throughout, so the same `ansStore_` the pen always calls writes a
`board:` key to the device and sends it nowhere. **No edit to answers.js or backend/**, deliberately:
a reader that never sees the key cannot be wrong about it, and both were being changed by other work
on the same day.

**What else could have read it, checked**: the weekly parent email reads `attempts`, which only
`doneMark_` writes, and the pen has never called it — a stroke is not "done"; Saved keeps the widget's
star as `w:whiteboard` in `FAVS`, a widget like the calculator; and nothing else walks the store but
that sweep, `attemptsSync_` (`done:`) and the splash (`splashAnim:`). **Since the merge of 318**, also
`answersClaim_`, which moves every signed-out answer to whoever signs in — and takes `^(ans|pad):`
only, so a signed-out board stays the device's and is not handed to the next child. `ansStore_` now
stamps every write with an `ansAt:` key beside it, the board's included; only `answersClaim_` reads
those, and only for `ans:` and `pad:`.

**What it costs**: the board stays on the device it was drawn on, one per person signed in there, and
the note under it says *"Kept on this device only."* — where a question's pen says "Saved to Ada's
account". Following the child to another device is the obvious next thing, and it wants a server key
the answers tab can tell from a question's, decided with whoever next changes what reads that tab.
And it is bounded — the reviews, below: strokes stored thinned, 100,000 characters at most. A board
of somebody who has not signed in here for a year is still on the device; nothing sweeps those yet.

### Paper, and one shape

**The paper palette, from the tokens**: `--paper` with a `--paper-rule` edge, and the ink in
`--paper-ink`. The pen is gold on a question because the figure is printed in `currentColor` and your
line must be told from its axis; on a board there is nothing but your line, and gold on cream is a line
you can hardly see. The lock's gold frame and the gold padlock are the screen's, round the paper.

**Always 3:4.** The ink is stretched to its box (`preserveAspectRatio="none"`, 340 units each way), so a
board the card's width and the screen's height would be a different shape on every phone and on the
same iPad turned round, and every stored stroke would stretch with it — a circle back as an ellipse.
The shape is fixed; only the size follows the screen. 3:4 is the iPad's own, and on a 320x568 phone it
is the shape that is still the card's full width.

**Capped so the bar is never cut off.** `.pane` clips at the screen's height less 2.5rem, so the board
is at most `100dvh` less `--wb-chrome` — the pane's cap and padding, the card's padding, the star's
row, the heading, the bar and the note: two 44px rows in px and 13.6rem. Measured signed in at all five
of `check/ui.js`'s sizes, the most the board could have been was the screen less 88px and 13.13 to
13.16rem every time, so about six pixels are spare; at every one of them the width decides and the cap
is slack. It binds on a wide, short screen — 1280x720 measured: a 316x421 board, the pane 674px inside
681. **And on a phone on its side it bound so hard the board was a stamp** — see the reviews, below;
the first version of this paragraph said "small, and the bar still there", and it was 16x21px.

| signed in | board | pane, inside its cap |
|---|---|---|
| 320x568 | 218 x 290 | 522 / 534 |
| 390x844 | 272 x 362 | 608 / 807 |
| 768x1024 | 376 x 501 | 754 / 985 |
| 1280x800 | 342 x 456 | 708 / 761 |
| 1920x1080 | 303 x 405 | 657 / 1041 |

**The bar sits .35rem lower than a question's.** Locked, the gold frame stands 6px outside the paper,
and the tile row's own .5rem left it a pixel from the padlock — on the 320 screenshot a frame round the
whole page read as touching the controls under it.

**On its side the layout gives way instead of the shape.** 500px tall and under, landscape — every
phone turned round, no tablet or laptop — the card is one grid: the board on the left as tall as the
card, the star, the heading, the bar and the note in a column beside it. `display: contents` on the four
boxes between the card and them (the widget slot, `.wb-box`, `.wb`, `.qpad`) makes them items of that
one grid without changing the markup the portrait card and the Saved column draw. Measured signed in
and out, phone-shaped context:

| on its side | before | after |
|---|---|---|
| 568x320 | 16 x 21 | 163 x 218 |
| 667x375 | 55 x 74 | 205 x 273 |
| 844x390 | 68 x 91 | 216 x 288 |
| 932x430 | 96 x 129 | 246 x 328 |

every tile 44x44, nothing past its pane, no zoom from `paneReach_`. The heading's own margins are cut
to .45rem there: at 568x320 the column beside the board (the bar in two rows) was otherwise the taller
of the two, and `paneReach_` drew the whole card at 0.94 with 41px tiles. And the cap in both layouts
now subtracts `--bar` and `--safe-bottom`, as the pane's own cap does: measured where both are nought,
and on an iPhone with a home bar the second is not.

### The swipe, with real touches

The notepad's history (080) is an empty widget the size of a page that ate every swipe. Measured in a
Playwright context with `hasTouch` and `isMobile`, real touches through CDP, at 390x844 and 320x568:

| | sideways across the board | down across the board |
|---|---|---|
| unlocked | the column moves, Tools → Games | the page turns back one (the board is last) |
| locked (a real tap on the padlock) | one stroke kept, nothing moves | one stroke kept, nothing moves |

and a second tap on the padlock unlocks it, and the sideways swipe moves the column again.

### What the two reviews found, and what was done

Two reviews ran the board on a phone with real touches (`hasTouch`, `isMobile`, CDP touch events) and
by reading. Every should-fix reproduced first, on the unchanged branch, with the reviewer's own script.

**Fixed in the pen, for the question pages as well, because they were the pen's faults that a page-sized
board was the first to show:**

- **A second finger or a palm took over the stroke.** `pointerdown` replaced the stroke for any new
  pointer and `pointermove` never asked which pointer moved: finger 1's first 60px were gone, the stored
  line alternated between the two (a fan of spokes from the palm) and the first live preview was left in
  the DOM unstored. A stroke now belongs to the pointer that started it (`PAD_GO.id`); another pointer
  going down, moving or lifting is ignored. The same id going down again means its own lift was lost
  (a mouse is always pointer 1), so that starts afresh rather than wedging the pen. After: the palm
  run stores finger 1's one stroke, one path, no stray preview, at 320 and 390.
- **A repaint mid-stroke cut the stroke, on every column but Find.** `findKeep_` held a repaint for
  `stuff` only. On Tools the repaint rebuilt the column, `pointermove` ignored the new ink, the lift
  stored 34..142 units of a stroke that went to 306 through the detached copy, and the board showed
  none of it. `padHold_` (find.js), asked by `paint` beside `findKeep_`, holds whichever column has the
  pen's ink in it, STALE until it is next arrived at, as `settingsKeep_` does. `startScreen_` asks it
  too, as it asks the quiet retry's `reconnectKeep_` (313), so the held column's widgets are not
  stopped and started in one task under the finger — most of a second on Tools, a straight line where
  the finger moved; and `wbPaint_`, which a change of person still runs, skips the copy being drawn on.
  After: the stroke kept whole, 34..306, drawn, the board still locked.
- **Clear could not be undone,** and on a board it is the whole page, 4px from Undo. What Clear takes is
  held for the visit (`PAD_CLEARED`) and Undo on the emptied pad puts it back — also after strokes drawn
  since are undone one by one. One level. The toast says so: "Cleared. Undo puts it back."
- **A full device kept strokes on the screen it had refused to store,** and the next write was built
  on the stale list: 4 drawn, 2 stored, `ANS_MEM` 3, and Undo took off a visible stroke. `padSave_`
  reads the write back; a refused stroke is taken off the screen and the toast says the device is full.
  And `padRead_` reads through `ansValue_`, so a store that throws (private mode) is the visit's copy
  rather than an empty list every time. After, at the quota: 2 stored, 2 drawn, no preview left, Undo
  leaves 1 and 1.

**The board's own:**

- **Sideways, a postage stamp** — the layout above.
- **After a sign-out, the next person sliding onto Tools saw the last person's board**: Tools is left
  STALE by the sign-out's repaint, and its board still had their three strokes, the frame lit, `data-k`
  and `PAD_ON` theirs, on screen mid-swipe. A line drawn on it would have gone into their key.
  `padWhoChanged_`, called by `signedOut_` and `signedIn_`, disarms every pad, forgets the stroke and
  the held Clears, and draws every copy of the board again under whoever is signed in now. After: right
  after the sign-out the stale copy is `board:whiteboard`, blank, unarmed, `PAD_ON` empty; the last
  person's strokes are still under their own key.
- **Storage unbounded and rewritten whole on every lift** (1,000 strokes as drawn: 2.5M characters,
  66-83ms a lift on a desktop). The board's strokes are stored thinned, `ansSimplify_` at one unit —
  a wave across the board 304 characters instead of 2,534 — and the board stops at 100,000 characters
  (`PAD_BOARD_MAX`), where a stroke is taken back off and the toast says to Clear. Measured: 349 such
  waves fill it; a lift at 340 strokes (94K characters) 10ms median, on a machine at a load average of
  66 on four cores.
- **A line off the paper drew on across the gold frame and over the card.** `.wb .qpad-art` clips:
  the line stops at the paper's edge. The points past it are still stored and are clipped the same way
  wherever the board is drawn again, which is what a sheet does with a pen that went off it.

**Comments corrected:** the roster entry said the funnel may offer the board because it is `solid`;
nothing on the Tools column reads `solid`, and tools left the funnel on the owner's word. It now says
what `solid` is (an instrument, the calculator's note) and that it changes nothing today. The same
entry said every fault the pen had been through was one the board "cannot have"; four turned up.

**Left as it is:** `id="wb-box"` twice once the board is starred — the id is what `into` names and
`check-widgets` asks the html for, the class is what `wbPaint_` writes, and the timetable, the basket
and the uploads card do exactly the same on Saved; nothing reads `#wb-box`.

### Checked

- **`check-flow.js`**, a new journey: the board is the last tool, after `uploads`, solid; a student's
  Tools column pages to it; the bar is the padlock, Undo and Clear and nothing else; the note says it is
  kept here; unlocked, `axisFree` gives the grid the gesture and a drag through the pen's own listeners
  draws nothing; locked, the ink is `data-noswipe`, the grid refuses both axes, and a drag is one stroke
  on a 300x400 board -- `[34,34,306,306]` since the reviews, its two ends, the straight run's middle
  point thinned away; Undo takes it off; a second stroke goes on and the app's
  own `repaint` draws it back with the pen still locked; the answers sweep leaves it alone and no `ans:`
  or `pad:` key mentions it; a second person on the phone gets a blank board and the first gets theirs
  back; Clear empties it. **Two mutations**, each red: `WB_ITEM` without its prefix (three failures,
  above); the widget without its `start` ("did not draw a pad").
- **`check-flow.js`, a second journey for what the reviews found**, through the pen's own listeners and
  handlers: a palm going down, moving and lifting in the middle of finger 1's stroke leaves finger 1's
  one stroke and no stray preview (pointer ids put on jsdom's mouse events, which is all it lacks); a
  `repaint()` half way through a stroke leaves the same board element under the finger and the stroke
  is kept whole; Undo straight after Clear puts back exactly what was cleared; a stroke the store
  refuses (`setItem` throwing for the board's key) is taken off the screen and the toast says so, and
  so is one past the ceiling; signed out from Feed, the stale Tools column's board is `board:whiteboard`,
  unarmed and blank, and signing back in draws Sam's there; and the held repaint does not restart the
  Tools column's widgets. **Eleven mutations, each red, the real files green again after every one**:
  the second `pointerdown` taking over; `pointermove` taking any pointer's moves; `paint` not asking
  `padHold_`; `startScreen_` not asking it; `wbPaint_` rewriting the copy being drawn on; Undo not
  putting a Clear back; a refused write left drawn; no ceiling; `signedOut_` without `padWhoChanged_`;
  `signedIn_` without it; the board's strokes stored unthinned (both journeys).
- **The board was waited for, not guessed at.** Both journeys went to Tools, waited `LEAVE_MS` and
  `woken_()`, paged to the board and looked 50ms later. At a load average of 60 they found no board: the
  arrival's widget starts had not been queued yet, so `woken_` saw an empty queue, and the board
  appeared a second later. They ask every 100ms for up to ten seconds now, then let the queue drain --
  `partyBoot_`'s lesson.
- **`check/press.js`, sideways**: at 568x320 and 844x390, phone-shaped, the board at least 120x160px
  with every tile of its card 44px and inside the pane, and a real tap on the padlock and a real drag
  across the board is one stroke kept with the column and page where they were.
- The LEGO trade-in's journey asked for "the last tool" and the board is after it now. That rule was
  standing in for *nothing is inserted above an existing tool*, so it asks that the trade-in still sits
  straight after the calendar it was appended to, and the whiteboard's journey asks that the newest
  tool is last.
- **`check/states.js`**, a Tools state: the board locked with a ruled line, a triangle and a ring on it,
  seeded through `padKey_(WB_ITEM)` and `ansStore_`, so `check/ui.js` measures the pane in the state
  somebody is actually in, at all five sizes, both visitors.
- **`check/press.js`**, the table above as rows, in its own phone-shaped context. **Proved by
  mutation**: with `axisFree` no longer reading `[data-noswipe]`, both locked drags land on Games with
  the stroke kept — the pen and the grid both took the finger, the line-of-best-fit report again — the
  unlocked rows stay green, and the pen's own row goes to dm the same way.
- **The first version of those rows was flaky, and it was the instrument.** It went to Tools and
  waited a fixed 700ms, and the board's first unlocked swipe "stayed on Tools" in two full runs of
  three, at a load average of 12-17, while every other row passed. Reproduced in the block alone at 4x
  and 6x CPU, where it was the downward swipe that stayed: arriving at Tools starts its widgets one per
  task (`widgetsWake_`), eleven were still queued as the finger went down, and the gesture was
  delivered at 0.3px/ms and settled back. And `go('tools')` on every row re-queued them. So the rows go to the column only when not on it, and wait for what
  `check-flow`'s `quiet()` waits for — the queue empty and nothing settling. Green at 1x, 4x and 6x
  CPU since, and under the same load.
- `check.js`, `check-const.js`, `check-widgets.js`, `check-doors.js`, `check-css.js`: green.
  `check-flow.js`: all 198 journeys. `check/ui.js --screen=tools`: 95 combinations, nothing new.
  `check/press.js --screen=tools`: every press and every swipe where it should be.
- `check-scope.js` and `check-dead.js` exit 1 on the base commit as well, with nothing of this change in
  either list.
