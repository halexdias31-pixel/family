## Sharing a booking is a PNG of the receipt on the screen, and a check that compares the pixels

Asked for as *"dont worry about bulk booking. just make sure sharing booking is an identical jpg or
png or whatevers best of the booking reciept."*

**What it was.** `book-share` called `window.print()` on the `.rc` it was on, so "share" meant the
platform's print dialogue and a PDF. Before that it was `receiptCanvas`, a second renderer that drew
the card again and drifted from it four times.

**What it is.** `rcPng_` in `js/receipt.js` clones the `.rc` and gives every element the style the
browser *computed* for its original (`::before`/`::after` as generated rules), puts the clone in an
SVG `<foreignObject>`, inlines every `@font-face` the page's stylesheets declare as a `data:` URL (an
SVG drawn as an image may not fetch anything, so without this it draws in the fallback face), draws
it at 2 device pixels per CSS pixel onto a canvas and makes a PNG. Then `rcHand_`:
`navigator.share({files})` where `canShare` says files are allowed; else an `<a download>`; else, or
when Safari refuses the share sheet because the press is too far behind (`NotAllowedError`), the
picture in a sheet with its own Share button (`rcOffer_`, `rc-shot-share`). No `window.open` —
`check-surfaces` refuses it.

**Why PNG.** Flat colour and small text is what JPEG is worst at and PNG is best at, and on a card
that is mostly one flat panel PNG is also the smaller file (70–125 KB measured).

**Why not html2canvas.** It is a second renderer, re-implementing CSS painting in canvas calls, and
it does not do subgrid, which `.bk` is built on. The picture here is the browser drawing the
element.

**Left off the picture, as the print left them off:** the tiles (`.rc-tiles`) and an admin's
`Tutor earns` / `Admin earns` (`.rc-more`). `.rc-snap` hides them for one synchronous task while
the card is measured and cloned, so it is never painted.

**What the first runs of the check found, each fixed in `rcClone_`:**
- an empty box's hint (`Note`, "anything else we should know") came out in the white of a typed
  answer — the computed `-webkit-text-fill-color` wins over `color`, so both are written;
- every row holding a select or text box sat a CSS pixel low, because a form control's baseline in
  an SVG image is not the page's — controls are drawn as a box holding the words they show;
- a select's computed `overflow` is `visible` whatever the stylesheet says, so a long answer ran
  across three columns — `overflow: clip` is written (not `hidden`, which moved every label's
  baseline to the box's bottom edge);
- at 320x568 a saved session is shrunk to 76% with CSS `zoom` (`paneReach_`); sized off the zoomed
  box, the picture was a cropped window. It is the full-size card now.

**Saved sessions got the Share tile too** (`jobPage_` in find.js) — the booking that exists is the
one a family sends somebody; before, only the unsent form had it.

**Checks.**
- `check/share.js` (in `check-all`, slow, no port): presses Share on the form (with a non-first
  answer picked) and on a saved session at 320 and 390, catches the `File`, screenshots the element
  at the same scale and compares both ways round with a 3x3 neighbourhood range at the best
  registration. Measured residue on a true picture: 0.02–0.19% of pixels, 0–20 "blots" (6x6 tiles a
  third wrong) — single glyph stems and one tick-box edge one CSS pixel out, because the SVG is
  painted under a 2x scale and snaps to the device grid from a different origin. Fails over 0.5% or
  30 blots. It also reads the SVG: the face is carried as `data:`, the picked answer is in it, the
  empty box's hint is in its own ink, no tile and no admin money row. Plus the 320x568 zoom case.
- `check-flow`: share sheet → one PNG `File` at 2x the box; no file sharing → a `.png` download and
  a toast; refused → the sheet with the picture and a Share button that shares it.
- `check/states.js`: booking · "a picture of the receipt, offered in a sheet".
- Mutations, each red for its reason: no embedded font; select shows its first option; `.rc-snap`
  CSS gone; hint ink dropped; `overflow: clip` dropped; zoom ignored; always download; 1x instead of
  2x; a refused share downloading instead of offering the sheet.

**Not known and worth a phone:** Safari has historically tainted a canvas that drew a
`foreignObject` SVG. Recent Safari does not, but if a real iPhone toasts "Could not make the
picture", that is why, and the fallback would have to be the SVG itself.
