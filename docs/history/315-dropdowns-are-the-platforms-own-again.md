## The dropdowns are the platform's own again, and a list of several answers is checkboxes in its card

**The owner, 9 Oct:** *"i dont like currect drop down list thing. i want a more stable standard simple
conventional drop down list."*

This reverses note 226. For about a week every single-choice `<select>` in the app was
`pointer-events: none`, and a tap near one was caught, cancelled, and answered with the app's own
floating panel, `#drop`. The booking form's several-of-a-list questions hung the same panel off their
row (notes 147 and 153), and so did the settings column's venues field. The owner had asked for that in
226 (*"should be consistent with the booking multiselect drop down list"*). It worked, and it is gone.

### Why native, and what the panel cost

**"Stable" is the platform's list.** The open list is drawn by the platform, over the page, and nothing
in this app positions it: the wheel on an iPhone, the sheet on Android, the system list on a laptop. It
cannot hang off the wrong field, shut under a column that is still settling, open behind a sheet, or lose
its select to a repaint, because it does none of those things. Every caller drew a real `<select>` and
listened for `change` the whole time (that was 226's own design), so **no caller changed in either
direction**: the booking steps, the settings fields, the qualification shelf's `Something else…`, the
cheat sheet, the flyer maker, the word games and Scrabble's blank.

**What the panel had needed**, each item recorded where it was paid for:
- capture listeners for click, focus and scroll, plus an eight-pixel slop for a 15px select that no
  longer took the finger (226);
- finding the select again after every repaint (226);
- a visibility test that shut lists opened mid-settle, until it was rewritten against `AT`/`PAGE` (226, 153);
- a z-order lifted over the sheet, and a rectangle test that opened a hidden select's list behind a sheet
  (226);
- three numbers written by script on every placement the grid made (153).

That came to about 660 lines of book.js, 100 of me.js, a block of index.html and about 110 lines of the
stylesheet, all deleted. A screen reader was never claimed for any of it (226).

**For the next request to restyle the open list.** It cannot be done. An iPhone's wheel and Android's
sheet take no CSS at all, and a laptop's list honours an option's two colours and nothing else. Asking
for the open list to look like the app is asking for the panel back. The banner over `dropOnFront_` in
book.js says the same, at the place the panel used to be.

### What was built, per surface

| surface | before | now |
|---|---|---|
| **every single-choice select** (booking rows, settings fields, qualification shelf, phone code, cheat sheet, word games, flyer maker, Scrabble's blank) | `pointer-events: none`, the tap intercepted, `#drop` | the browser's own `<select>`. Callers unchanged |
| **closed select** | looked like a text box everywhere except the cheat sheet, whose wrapper drew a `▾` | **one rule** beside `input, select, textarea`: the field's box (`--sunk`, `--line`, 44px floor, 16px), one `▾` drawn as two gradients in the select's own background from a token (`--sel-arrow`), the text stopping short of it with an ellipsis. `background-color` everywhere, because the `background` shorthand would erase the arrow |
| **the booking row's select** | a dashed word with no sign it opens | keeps its receipt clothes, with the same arrow at 4px. The answer column is 56/75/81px at 320/390/768 and a 44px row detaches its dashed rule (note 031, `ACCEPTED_TAP`). The **one** exception, said in a WHY beside `.bk-sel`. Its text is under 16px, and the viewport's `maximum-scale=1` stops iOS zooming it, as it already did. A keyboard's focus now lights the arrow gold, because the row had no visible focus at all |
| **the flyer maker's eight selects** | `.78rem` in a 1.7rem box | the field. Columns go from `minmax(6.5rem…)` to `8.5rem` so a 16px answer fits beside the arrow |
| **Scrabble's blank** | `.scr-sel`: `.9rem`, 600 weight, its own box | the field. The rule is gone |
| **the cheat sheet / word games** | `.mat-sel::after` drew the only arrow | the select's own arrow. The wrapper's was deleted rather than drawn twice |
| **the open list's colours** | `.bk-sel option` only (*"white on white"*) | `select option, select optgroup` for every select, so the three faint-placeholder selects no longer hand their grey to a laptop's list. The blank option is `--dim`, because on several selects (`Not sure`, `No preference`) it is a real answer |
| **booking, several answers** (`subjects`, `interval`, `kids`) | a `.bk-many` button that hung `#drop` | the same button (`aria-expanded`, `aria-controls`, the arrow turned up while open), opening **a list of real checkboxes under the row, in the card, the full width**: `.check` rows at 44px each in px, a `role="group"` named by the question. Tapping the row again closes it. `BOOKING.picking` is still the whole state, so a redraw keeps it. A tick goes through `cards.js`'s change dispatcher to `book-many-pick`, which makes `BOOKING` agree with the box rather than toggling blind, so a doubled event is harmless, and keeps the keyboard's focus on the box. No Done button: a disclosure closes from its own row |
| **settings, several answers** (`venues_ok`) | a `.me-many` button that hung `#drop` | a `<details>` whose `<summary>` **is** the field (it is in the field rule's group) and whose ticks are `.check` checkboxes under it. The browser opens and closes it. The hidden `data-me` box is still the answer, so `me-save` is unchanged. The ticks carry `data-many-of`, not `data-me`. A tick's own `change` now marks the card dirty, which the panel's buttons never did, so before this a repaint could undo the ticks before Save |
| **the qualification `+`** | opened the subject list in the panel, then the level list | **focuses** the subject box, then the level box (`qualNext_`). A platform's list cannot be opened from script: `showPicker()` needs a tap to ride on, and iOS does not offer it on a select. The gold edge says where the next answer goes |
| **"Who is this for?"** | the panel hid a blank option that repeated the fallback name | `stepSelect_` writes the blank as `—` when the fallback is already an answer on the list, so the platform's list does not show `Test Admin` twice |
| `#drop`, `#drop-back` | index.html, 90 lines of CSS, three owners | gone. `dropOnFront_` stays, because the maze's arrow keys ask it (games.js) |

**Dead code that went with it:** `stepSelect_`'s multi branch (✓ prefixes, the box dropping back to `—`)
and the `book-set` handler's multi branch. Both had been unreachable since `stepControl_` sent every
open multi to `stepMulti_`. A `book-set` naming a multi is now refused rather than allowed to replace a
list with a string.

### The swipe, measured

With the panel, no select took the finger, so a swipe that began on one moved the column. That is kept.
`axisFree` (overworld.js) and the stylesheet's `touch-action` list no longer name `select`. They had
named it as *"a select opens by dragging on some phones"*.

**Measured with real touch (CDP) at 390×844** on the booking Kind select (15px tall) and the settings
country code (44px):

| gesture starting on the select | the browser sends | result |
|---|---|---|
| a tap | `mousedown`, focus, `click` | the platform's list opens |
| 8px (under the app's 10px swipe threshold) | `mousedown`, focus, `click` | a tap to both, and the list opens |
| 12px sideways, 14px sideways, 12px down | `mousedown`, `click`, **although the app has already taken it as a swipe** | **without a guard:** the select took focus every time, so the list opened under a lifting thumb (measured with the guard removed). **With it:** both cancelled, no focus |
| 20px or more | nothing (past Chromium's tap slop) | a swipe |
| 150px left | nothing | booking → shop, settings → tools: **the column moves** |
| 200px up | nothing | settings page 1 → 2 |

With `select` put back into `axisFree`, the 150px swipe stayed on booking and on settings. That is the
pre-226 behaviour, and the reason it was taken out.

**The guard**, beside `PRESS_MOVED` in shell.js: a `mousedown` (capture) and the swipe's `click` on
`select, label, input[type=checkbox], input[type=radio]` (`FIELD_ACTS_`) are `preventDefault`ed only
while the gesture is a swipe or began on a sliding card. The drag guard had always *swallowed* that click
(`stopPropagation`) without cancelling it, and a form control acts on the default, not on a handler.
Note 226 had measured exactly this for a 12–14px drag ending on a caption. As a side effect, a swipe
that ends on a checkbox's label no longer ticks it.

### Measured: the in-flow list and the fold

Note 147 ruled the in-flow shape out by arithmetic (544px of card in a 534px pane at 320). That was
before `paneReach_`, which shrinks a card taller than its pane to 0.7 and scrolls past that. Re-measured
with twelve subjects open, the worst case 147 used:

- **320×568:** the card is drawn at 0.70 and the pane scrolls 226px. Send is reached by scrolling.
- **390×844:** the card is drawn at 0.70 and fits. Send is on screen.
- The fixture's real lists (one term, one child) cost 0.90 at 320 and nothing at 390.

**The cost, stated:** while a twelve-subject list is open on a phone, the whole card is 70% size, and the
44px rows are about 31px. That is `paneReach_`'s trade, the one the owner chose (*"I don't like
scrolling…"*). Closing the row puts the card back. A two-column list would halve the height, but the
brief was full-width rows, the conventional shape.

### Checked

- **`js/check-dropdowns.js`** (new, on check-all's roster beside `check-surfaces`) fails on any of the
  panel's three pieces coming back:
  - a `pointer-events: none` rule whose subject is a select, or a class or id some `<select>` is drawn
    with;
  - `#drop`, `#drop-back` or a `role="listbox"` in index.html;
  - a click, mousedown, pointerdown, touch or focus listener that cancels or blurs a select, followed one
    call deep. The swipe guard is the one allowed, by name.

  **Proved:** run against c332f6b it names the CSS rule, both elements and both listeners
  (book.js `click` through `selAt_`, `focusin` through `selVisible_`). A `.card .bk-sel:focus
  { pointer-events: none }` added inside an `@media` fails it too.
- **`check-flow.js`** has four journeys for this, rewritten or new:
  - *picking several answers*: a list in the card, under its row, a named group, `.check` boxes, no
    `#drop`, no sheet, two ticks kept, a doubled `change` harmless, untick, `aria-expanded` and
    `aria-controls`, closed by the row;
  - *a select is the platform's own*: on a coarse pointer, mousedown and click uncancelled, focus kept,
    nothing new in `<body>`, one `change` reaches `BOOKING`, a swipe's mousedown and click cancelled,
    the label's click uncancelled;
  - *a several-of-a-list field* (new): a `<details>`, ticks with no `data-me`, the hidden box in list
    order, the card dirty, Save posts `venues_ok`;
  - *adding a qualification*: the subject box, then the level box, take the focus.

  **Nine mutations, each red and green again on the real files:** list not drawn, a `#drop` appended,
  a blind toggle, the swipe guard's mousedown removed, a select mousedown cancelled, a focus blur on a
  coarse pointer, the hidden box not written, `data-me` on the ticks, `qualNext_` a no-op.

  The full run passes 196 of 198. Imposter fails on c332f6b as well ("did not draw on the Games
  column"). The videos widget fails only under load and passes alone.
- **`check/states.js`:**
  - *a several-of-a-list field open* opens the `<details>` and ticks a box.
  - *a dropdown open* is now **a dropdown answered**: the value plus `input` and `change`, the card
    dirty, no listbox.
  - *a list of answers open* opens the row in the card and ticks a box. Its root is `#s-booking`, no
    longer the panel. It waits up to two seconds for the box to be drawn, because `check/ui.js` once
    found it missing at 390 on a loaded machine, and never in a replay.
  - *a single answer open* is now **a single answer chosen**.
  - The qualification states lost their `selShut_`.

  **Obsolete and deleted:** nothing whole. Each open-the-panel state became the native control's
  answered state.
- **`check/press.js`:**
  - `#drop` came out of the state hash, the candidate list and the post-press collection.
  - The real-touch block asks the reverse of what it asked: a tap lands on the select, its press is
    uncancelled and it takes focus; a 150px swipe from the Kind select moves the column; 12px drags
    open nothing; Tab focus stays; a backdrop tap over a select reaches nothing. **Proved by
    mutation** (`select` back in `axisFree`, the guard's `mousedown` removed): three items red, the
    swipe and both 12px drags.
  - The mouse swipes "start on bare card", and a fixed point was bare card only while selects took no
    pointer. Settings has its country code at (320, 420). **A mouse pressed on a select opens its list
    on the press**, which is a laptop's dropdown working, and the list took the drag with it. So the
    start point is now moved off a select. A finger's swipe from a select is the real-touch block's
    question.
  - The mouse swipes read `TABS` once, 2.2s after load. When `columns.json` landed later, it moved
    Settings beside You, and five swipes round Settings were held to `TAB_ORDER`'s neighbours. The
    neighbours are now read at each swipe.
  - Booking presses 13 actions where it pressed 14 (`book-many-done` is gone), and settings 20 where it
    pressed 23 (`me-many`, `me-many-pick`, `me-many-done` are gone). The settings ticks are a
    `<details>` and checkboxes with no `data-do`, so the state ticks one and check-flow saves it.
- **`check/ui.js`:**
  - The `#drop` sweep is gone, because the list is inside `#s-booking` now.
  - Its contrast reader took every gradient to cover its whole box. Read that way, the arrow's two 5px
    tiles put `Autumn 1` at 2.25:1 and `Tap to choose` at 1.33:1 on `--dim`, a grey they never touch.
    A `no-repeat` layer with a pixel size is now placed as CSS places it and counts only under the text.
- `check/share.js` and `check/swipe.js` lost their guarded `selShut_` / `meDropShut_` calls.

### Run, on this branch

- `check.js`, `check-const`, `check-css` (no new class reported either way), `check-doors`,
  `check-booking` (22), `check-settings`, `check-strings`, `check-surfaces` and `check-dropdowns` are
  green. `check-scope` is red here and on c332f6b alike: it reads files from outside the repository.
- `check-flow` passes 196 of 198.
- `check/ui.js`: booking 45, settings 135 and account 100 combinations, nothing new.
- `check/press.js`: settings and account green. Booking is green apart from one Games flick-timing
  item, a different one on each of three runs (the bird's lift, the chain flick), on a machine with no
  free memory.
- `check/swipe.js`: 112 gestures, green.

### Not done, and worth knowing

- **A mouse drag that starts on a select opens the select's list** and does not move the column. That
  is the laptop's own dropdown, and the reason the select is native. A finger's drag from the same
  select does move the column (measured above).
- **The flyer maker's answers ellipsise at 390.** Sixteen-pixel answers in two columns read
  `Back to …` and `A5 · hal…`. The open list shows them whole.

- **No iPhone was opened.** The platform's own list is the point, and this environment has Chromium
  only. The screenshots of an open list are Chromium on Linux (`dd-*-select-open-*.png`), photographed
  off an Xvfb screen because a page screenshot cannot contain it.
- **A screen reader** gets the platform's list now, which it already got under the panel (226), and
  real checkboxes in a named group for the several-answers questions.
- **Note 188's touch adjustment** (Chromium snapping a touch near a select onto it) is live again,
  because selects take the finger. press.js and swipe.js already walk their swipe starts away from
  selects for this reason.
