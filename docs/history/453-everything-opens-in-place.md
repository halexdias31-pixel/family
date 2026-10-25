# 453 — Every sheet opens in place, inside the card that was pressed

## The owner's words

"do not use pop-up menus on my site" (standing rule; 420, 448). After 448 the feed's reactions list and
Edit post still took the screen: the sheet (420) was "a page", but it replaced the whole grid, which reads as
a pop-up.

## What changed

- **`openSheet` moves `#sheet` into the card.** `sheetPlace_` (shell.js) finds the card the last press came
  from (`PRESSED_`, a capture-phase listener; or `sheetHere_(el, swap)` from a caller that knows) — the nearest
  `.post, .rc, .widget-slot, .cpn, .card, .pane` — and puts the sheet right under that card's tile row
  (`.tile-row`, `.post-acts`, `.post-when`), else at the card's end. With nothing pressed on this screen (a
  verify or sign-in link on arrival, a booking confirmed) it goes in the front card's pane. Back returns it to
  `<template id="sheet-home">`. The grid is never hidden: `body.sheet-open`, `#screen.inert` and the
  screen-tall sheet are gone. Same ids, so every caller and check that reads `#sheet-body` is unchanged.
- **A redraw keeps it.** A card drawn again takes the sheet out with its old markup; a MutationObserver
  (`sheetKeep_`) puts it back into the same post (`data-post`) or the card in front. The element is held by
  reference (`sheetEl_`).
- **Feed:** who reacted (`who-reacted`) opens under the post's own row with the post still drawn
  (`sheetHere_(el)`); Edit post / Pin or date (`post-edit`) turns the post card into its editor
  (`sheetHere_(el, true)` → `.sheet-swap`, the card's own content hidden), Back gives the card back.
  `aria-haspopup="dialog"` came off the total.

## The sweep — every overlay-type opener, now in place

All went through the one sheet, so all are converted by the same change: Apply to teach, Make an account,
Confirmed — one more step, Signed in / Your PIN has changed, Add a friend, Message, Report this message, A new
PIN (me.js); reactions, a tutor from a post, Edit post / Pin or date (posts.js); Figures (find.js); a calendar
day (games.js); Speed read (reader.js); Share this booking, Mark it paid, Join in (receipt.js); Staff hub,
Statement (staff.js); Report this question (submit.js).

No `<dialog>`, `showModal`, `role="dialog"` or custom menu exists. `position: fixed` stays only on the
FIXED_OK list (banner, toast, reconnect line, splash, keypad and its loupes, pen sizes, admin dot, the NES and
video full screens) — none is a menu. The video full screen keeps its `popover` (the owner asked for full
screen; POPUP_OK).

## Checks

`check-surfaces`: fails on `sheet-open`, `.inert = true`, `aria-haspopup`, `aria-modal`, `role="dialog"`
(outside the video full screen), a screen-tall `#sheet` in style.css, an `openSheet` that does not call
`sheetPlace_()`, and `who-reacted`/`post-edit` without their `sheetHere_` (mutation: removing
`sheetHere_(el, true)` fails it). Flow: the reactions journey asserts the sheet is inside `[data-post="PO1"]`
with the post still drawn and the screen not taken over; new journey "Edit post (453)" asserts the editor is a
direct child of the post card, `.sheet-swap`, the hiding rule in style.css, nothing floating, and Back restores
the card. css 2026-10-25-q-sheet-in-place.
