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
that sweep, `attemptsSync_` (`done:`) and the splash (`splashAnim:`).

**What it costs**: the board stays on the device it was drawn on, one per person signed in there, and
the note under it says *"Kept on this device only."* — where a question's pen says "Saved to Ada's
account". Following the child to another device is the obvious next thing, and it wants a server key
the answers tab can tell from a question's, decided with whoever next changes what reads that tab.

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
681 — and on a phone on its side, where the board is small and the bar is still there.

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

### The swipe, with real touches

The notepad's history (080) is an empty widget the size of a page that ate every swipe. Measured in a
Playwright context with `hasTouch` and `isMobile`, real touches through CDP, at 390x844 and 320x568:

| | sideways across the board | down across the board |
|---|---|---|
| unlocked | the column moves, Tools → Games | the page turns back one (the board is last) |
| locked (a real tap on the padlock) | one stroke kept, nothing moves | one stroke kept, nothing moves |

and a second tap on the padlock unlocks it, and the sideways swipe moves the column again.

### Checked

- **`check-flow.js`**, a new journey: the board is the last tool, after `uploads`, solid; a student's
  Tools column pages to it; the bar is the padlock, Undo and Clear and nothing else; the note says it is
  kept here; unlocked, `axisFree` gives the grid the gesture and a drag through the pen's own listeners
  draws nothing; locked, the ink is `data-noswipe`, the grid refuses both axes, and a drag is one stroke
  `[34,34,170,170,306,306]` on a 300x400 board; Undo takes it off; a second stroke goes on and the app's
  own `repaint` draws it back with the pen still locked; the answers sweep leaves it alone and no `ans:`
  or `pad:` key mentions it; a second person on the phone gets a blank board and the first gets theirs
  back; Clear empties it. **Two mutations**, each red: `WB_ITEM` without its prefix (three failures,
  above); the widget without its `start` ("did not draw a pad").
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
