## Every dropdown is the booking list now, and the select underneath never takes the finger

**Asked for as *"i dont like how it currently looks with the drop down list for menus. should be
consistent with the booking multiselect drop down list."*** Until this, every single-choice
`<select>` in the app opened the PLATFORM's picker: a wheel at the foot of an iPhone, a sheet on
Android, a grey system list on a laptop. The booking form's several-of-a-list questions hung `#drop`
off their field in the app's own colours, so the app had two kinds of drop-down. The owner had spent
the week looking at the native one, which did not look like anything else here.

**One implementation, in book.js beside `bookDrop_`, and not one caller was touched.** These all
still draw a real `<select>` and listen for `change`:
- the booking steps
- the settings fields (`fieldHtml`), the qualification shelf with its `Something else…` swap, and
  the phone's country code
- the cheat sheet's subject and level
- the flyer maker's nine selects
- Scrabble's blank
- the records category

A tap opens `#drop` with `.btn quiet pick-opt` rows in `.pick-list`'s two columns. The chosen row
has a gold edge and a ✓. Choosing closes the panel, sets `selectedIndex`, and fires `input` then
`change`, both bubbling, in the order a native select fires them. `change` fires only if the answer
moved, as the browser does it. Every handler runs unchanged. That is the argument for keeping a real
select underneath instead of a button pretending to be one: the value, `me-save`'s gather, the
disabled state and the keyboard all keep working because nothing about the control changed.

**What it leaves off, and why that is not a different control.** There is no summary line and no
Done. The booking panel has both because it stays open across several picks and its row ellipsises
at the second subject. A single choice closes on the pick, so a Done would be a button for a state
that never lasts. To shut it without choosing, tap anywhere else (`#drop-back`), tap the field
again, or press Escape, the same as the booking panel.

### How the native picker is kept shut, which is the only hard part

**Three techniques were weighed:**

| | |
|---|---|
| `preventDefault` on `mousedown` / `touchstart` | Works on a laptop. iOS opens its wheel off the FOCUS that follows a tap, and which touch event it honours a cancel on has changed between releases. A non-passive `touchstart` cancel also kills the click the drag guard reads, and every scroll that begins on the field. Its correctness depends on one browser's version, which this environment cannot open |
| a button drawn over a hidden select | Robust everywhere, but it needs a second element beside every select in the app, inside twelve callers' own CSS. That is touching each caller with extra steps |
| **`pointer-events: none` on the select** | **chosen.** A finger, a pen or a mouse never TARGETS the select, so no browser has a tap on it to open a picker from. The tap lands on the label or booking row behind it, and a capture-phase `click` listener hit-tests it against the select's own rectangle. Nothing has to be cancelled, because nothing is ever started |

**The label is the one way left to reach the select.** A `<label>`'s activation focuses its control,
and a focused select is exactly what iOS opens a wheel for. So a tap on a select's caption also opens
the panel and has its default prevented. **`check-flow.js` proved this by mutation.** With
`preventDefault` removed, the label tap's activation re-dispatched a click AT the select, and that
toggled the panel straight back shut.

**A keyboard on a laptop is left native; on a phone, focus is another door to the wheel.**
`pointer-events` does not affect focus. On a fine pointer, Tab still reaches every select, the arrow
keys step through it, and Space or Alt+↓ opens the browser's list. On a phone, the keyboard bar's
previous/next arrows move focus from the e-mail box onto the country code, and a select focused that
way is drawn as the platform's picker in place of the keyboard. So on a coarse pointer a `focusin`
on a select blurs it and opens the panel instead. A click sent at the select itself, which is what a
test sends, opens the panel too. The options are `role="option"` with `aria-selected` inside a
`role="listbox"`, and the select carries `aria-expanded`.

**A screen reader is not claimed.** VoiceOver's press and Chrome's accessibility default action open
a select's own popup without sending a DOM click, so a screen-reader user most likely still gets the
platform's list. That is a list they already know how to use, and it is untested here.

**A swipe that starts on a dropdown moves the column and opens nothing.** The shell's bubble handler
swallows the click a drag produces, but it does not CANCEL it. So a drag of 12–14px that ended on a
select's caption (still inside the browser's own tap slop) used to run the label's activation, focus
the select and send it a second click after the flag was cleared: the panel and a focused select at
once, which on an iPhone is the wheel too. The capture listener now resolves the select first,
**always** cancels a click that was for one, and only then reads `PRESS_MOVED`; a swipe opens
nothing and is left to bubble, so the shell still clears the flag.

**The way out is `data-native`, and nothing carries it today.** A select that genuinely needs the
platform's picker opts out with that attribute and a sentence saying why. `<select multiple>` and a
disabled select are not touched.

### Which select a tap was for, and the three things the first version got wrong

A finger never targets the select, so `selAt_` decides which one a tap meant. In order: the select
itself; its `<label>`; the row it is the one select in (`.bk-row`, `.mat-sel`), so the question beside
a booking box is as good a place to tap as the box; and the element behind it, hit-tested against
the rectangle of every select a few levels up. Never a tap on another control (a button, a link, an
input, anything with its own `data-do`). Two adversarial reviews found three faults in the first
version, each reproduced here with real touch events before it was fixed:

| | |
|---|---|
| **a near miss did nothing** | a booking select is 81×15px in a 19px row. While it took the finger, the browser's touch adjustment snapped a tap a few pixels off onto it; with `pointer-events: none` there is nothing to snap to, so a radius-11 tap 3px under Kind landed on its row and opened nothing. The row rule, and an 8px tolerance for a touch or a pen only (never a mouse), put it back: centre, 3px under, 6px under and the `Kind` caption all open it |
| **a tap on a sheet opened a list behind it** | a rectangle is a position, not a fact about what is in front of it. With a sheet open, one tap on its backdrop where a select sat behind it opened that select's list behind the sheet; it then took three taps to close the sheet. A select is only a candidate on the tap's own page or sheet (`t.closest('.page, #sheet')`), and `selVisible_` is asked of every candidate, the label's included. One tap now closes the sheet; a tap on a sheet's text does nothing |
| **focus was a door to the wheel** | see the keyboard paragraph above |

**And two smaller ones.** A repaint under an open list hands back a new select, and only `selDraw_`
marked it open, so it lost its gold edge and `aria-expanded`; `selMove_` marks it too. After a MOUSE
pick, focus goes back to the field, so a keyboard user's Tab carries on from there; never after a
touch (a focused select is the wheel), and never if something else took focus (`Something else…`
puts the caret in its text box).

Every select in the app on every page was then tapped at its centre with a real touch: 24 of 24
opened the panel and none was focused, and none sits outside a `.page` or `#sheet`.

### Three numbers from `dropPlace_`, and a viewport test that shut every list it opened

**The placement is the booking panel's own**, through the same `dropPlace_`:
- the panel's right edge lines up with the field's;
- it opens on whichever side of the field has more room, and its `max-height` comes from that room;
- its `touch-action` is set from the measured overflow;
- it is `position: fixed` outside every column, so a pane cannot clip it.

`bookDropMove_` routes a placement or a pane scroll to `selMove_`. That is a capture listener on
`scroll`, because a fixed panel does not travel with a pane that `paneReach_` lets scroll.
`selMove_` follows the field, or shuts the panel once the field is off the screen, the page or the
pane.

**The first version also asked whether the field was inside the VIEWPORT, and that shut every list
the lab's state opened.** `placeNow_` calls the move on every placement. During a settle, the field's
rectangle is partway through a transition. Measured: the state turned to the page and clicked in the
same tick, the select reported itself 2,000px to the right, and the next placement shut the list.
**A column that has slid away is already answered by `dropOnFront_`** (lifted out of `dropRow_` so
the two panels ask one question), which reads `AT` and `PAGE`, and no transition can blur those. The
pane test stays because the field and its pane ride the same transform, so their rectangles are only
compared with each other. One re-place 460ms after opening covers a tap made mid-settle.

**Over a sheet when it hangs from one.** `#drop` is z-index 43/44, under the sheet's 45/46, so a
booking list cannot cover a modal. A select inside a sheet therefore lifts the panel to 47/48, which
is still under the toast.

### A screenshot caught one thing and the rest measured the same

**The booking form's "Who is this for?" showed `Test Admin` twice**, one ticked and one not. That
select opens on whoever is signed in, so its blank option READS as that person. The panel leaves off
a blank option only when it is not the chosen one AND another option says the same words. Every
other blank (a `—`, a `Level` placeholder) is a real answer and stays. Screenshotted at 320x568 and
390x844, each beside the booking multi-select open: the booking single answer, a settings select
(16 colours, two columns, opening downward), and the cheat sheet's subject. **They are the same
control.**

### The checks

- **`check-flow.js`, *"a single-choice select opens the booking panel, and choosing closes it with
  one change"*.** A click AT the select opens `#drop` with its default prevented. The options are
  `.pick-opt` with `role="option"`, exactly one is marked, and it is the select's own. A pick
  through the dispatcher sets the value, reaches the booking handler, fires `change` exactly once,
  and closes the panel. Picking the chosen answer again fires nothing. `#drop-back` shuts it. A
  disabled select opens nothing. A tap on a settings `.field` label opens it, prevented. Escape
  shuts it. **Proved by mutation**: without `preventDefault` it names the opening and the label
  route; with the same-answer guard removed it names the second `change`.
- **`check/states.js`** has two states, `booking · a single answer open` and `settings · a dropdown
  open`, each opened through the select's own door. `check/ui.js` measures the panel in both at four
  sizes and two visitors, and `check/press.js` presses `sel-pick` from them.
- **`check/press.js` taps dropdowns with real touch**, on a phone-shaped page, because nothing else
  could see either half of this: `check-flow.js` runs in jsdom with no stylesheet and no layout, so
  it passes with the `pointer-events` rule deleted (measured), and the states call `.click()` on the
  select, which opens the panel whatever the CSS says. Six questions, each a fault that happened: a
  tap on a booking box opens the list, the element under the finger is not the select, and the select
  is never focused or clicked; a tap 3px under it opens the list; a 12px drag from the country code's
  caption, sideways and down, opens nothing and never focuses the select (recorded as it happens,
  because the app blurs a focused select, so the end state cannot say); focus arriving by the keyboard
  opens the list, not the wheel; one tap on a sheet's backdrop over a select closes the sheet.
  **Proved by mutation four ways**: the builder's drag-guard order names both drags; the CSS rule
  deleted names the tap and both drags; the page-or-sheet test removed names the backdrop; and the
  focus door and the tolerance removed name the near miss and the keyboard. The real files pass.
