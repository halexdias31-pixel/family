# 420 — no pop-up menus (24 Oct 2026)

The owner, in capitals: **"remove all pop up menus I DONT LIKE POP UP MENUS"**.

Every pop-up in `js/` and `style.css` was looked for (sheet, popover, menu, overlay, modal, dialog,
`position: fixed`/`absolute` boxes opened by a tap, `showModal`, `<dialog>`, `confirm`/`prompt`/`alert`).
What was found and what replaced it:

| Pop-up | Where | Now |
|---|---|---|
| The "Admin ⋯" tile and the "More ⋯" tile, each opening a hidden `.tile-sheet` of the rest of the row (414) | `tileRow_`, `on('tile-more')`, tiles.js; `.tile-sheet`, style.css; the `more` icon | Every tile is shown. Up to six is one line. Past six: the viewer's tiles on one line and the admin's group on the next when each is two to six (a tutor card for an admin is Message, Share, Save / Edit card, Edit person, Spotlight, Listed, Delete); otherwise even lines (`tileLines_`: 7 is 4+3, 13 is 5+4+4), broken by a zero-height `.tile-break`. Admin tiles stay grouped at the end of their line in gold, Delete last in red. |
| **The sheet**: one panel (`#sheet`) floating in the middle of the screen over a blurred backdrop (`#sheet-back`), growing out of the card pressed (`SHEET_FROM`, `setSheetOrigin_`). 24 openers: Message, Add a friend, Make an account, Apply to teach, Confirmed, Signed in, A new PIN, New post, Edit post, reactions, a tutor from a post, Report this question, Figures, a calendar day, Share this booking, Mark it paid, Join in, Staff hub, Statement, terms to agree, Speed read, and the two deletes below | shell.js, index.html, style.css | **A page, in the flow.** `openSheet` still takes a title and markup, but nothing floats: while it is open `body.sheet-open` takes the grid out of the flow (unseen, `inert`, keeping its sizes) and `#sheet` is the page — `position: static`, the screen's height, "‹ Back" at the top beside the title, its body scrolling. Back (or Escape) returns to the grid where it stood (`placeCells` once more). No backdrop, no grow-from-card, no scroll lock. |
| "Delete it?" — a sheet with Delete and Cancel for an admin's own reel or video row | `on('media-del')`, games.js | Tap again to confirm, on the tile: `sure_(el, 'Tap again to confirm')`. `media-del-go` is gone. |
| "Delete Carl?" — a sheet with Delete and Cancel for an admin deleting a person | `on('person-del')`, me.js | The same: the first press arms the red tile, which widens to say "Tap again to confirm" (`.tile.is-sure`) for four seconds; the second deletes. `person-del-go` is gone. |

`sure_` (receipt.js) now keeps an armed control's whole face (`innerHTML`, `aria-label`) and puts it back
(`sureBack_`); it used to keep `textContent`, which would have wiped a tile's drawn mark.

Left alone, as asked: native `<select>` dropdowns (the owner asked for those, 62), toasts, the loading dots,
the browser's own share sheet. Also not menus, and kept: the maths keypad (`#kp`, an input device fixed to
the foot), the loupes, the video and NES full screens (the picture over the glass; the video's uses the
`popover` attribute only as a top layer), the splash, the banner, the reconnect line and the Business dot.
The `contextmenu` listeners only stop the phone's own callout on a held drawing or keypad.

## Checks

- **`check-surfaces`** (fast suite, "nothing opens over the app") now also reads the code with comments
  gone and strings kept, and fails on `tile-more`/`tile-sheet`, `sheet-back`, `setSheetOrigin_`/`SHEET_FROM`,
  `.showModal(`, `<dialog`, `popover` (except the video full screen), a home-made context menu, action sheet
  or dropdown menu; and reads `style.css` for any `position: fixed` rule outside a short list of things that
  are not menus (`FIXED_OK`), and for `#sheet` floating. Proved by mutation: an `act: 'tile-more'` tile,
  `#sheet { position: fixed }` and a `showPopover()` in posts.js each failed it (5 findings); restored, green.
- **`check/ui.js`**: `A POP-UP: SOMETHING FLOATS OVER THE APP` — any visible fixed or top-layer box holding
  a control, outside the same short list, in every screen and state measured; and `#sheet` must be static.
  `A TILE ALONE ON A LINE` replaces 414's second-line rule: a row of several lines may have no line of one.
- **check-flow**: the tutor-card journey now asks for every tile shown (no More tile, nothing hidden), the
  viewer's three leading, the admin group holding Spotlight, Edit and Delete with Delete last, and balanced
  lines for 7, 9 and 13 tiles; the people journey deletes by two presses on the tile and asks that no sheet
  opened; the student door lists press `person-del`/`media-del` twice.
- **check/press.js**: the "tap on the sheet's backdrop over a select" case became "a tap where the select
  stood while the sheet is the page reaches the sheet, and nothing behind it".
