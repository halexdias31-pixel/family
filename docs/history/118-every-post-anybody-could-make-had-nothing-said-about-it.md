## Every post anybody could make had nothing said about it

**`Write a post` was removed on request and it took the only door to `on('new-post')` with it** —
this file already records that, and `check-doors.js` has printed it as a handler waiting for a
button ever since. What the note did not follow through is what the removal left: the CAMERA is the
only way to post now, and `cam-post` sends `caption: '', body: '', location: '', poll: ''`.

**So every post anybody could make was a photograph with nothing said about it.** `postCard` draws
`.post-cap` as *"**who** what they said"* and this file's own note on comments says the caption IS
the first comment. A feed of silent pictures is not the feature that was asked for.

**One line, hidden until there is a picture**, like `Again` and `Save a copy` and for their reason:
it belongs to a photograph you are holding, not to a camera you are pointing. Emptied as well as
hidden by `camAgain_`, which runs on `Again` AND on a posted shot — a caption left in the box would
be offered as the caption for the next photograph.

**No `<span>caption</span>` over it, which is this app's own pattern for a single box.** The search,
the comment box, the notepad and the message composer are all a placeholder and no label, and this
file already records the measurement behind it: ten controls have no text, every one carries a
placeholder, and **a placeholder IS the accessible name when there is nothing else** — so a label
repeating it is two strings to keep in step. It is also 21px, which mattered (below).

**Caption and nothing else.** The composer also asked `where`, `more` and a poll; those are a form
and this is one line beside a shutter. No backend change: `addPost` has written `S(body.caption)`
since it was written.

### The card grew off the bottom of the screen, and `under` was 0 at every width

**`columnShift_` centres the page you are on** — `boxH / 2 - (offsetTop + offsetHeight / 2)` — **and
it runs when the column is PLACED, not when a card inside it grows.** Taking a photograph reveals
five things at once: 112px before this commit, 167px after. Measured at 390×844 with a picture on
the card, the pane was placed at 648px tall so its top went to y139, then grew to 768 — **bottom at
y906, `Save a copy` 62px below the glass.** At 768 and 1280 it was 79px.

**Nothing could see it, and that is the part worth keeping.** `check/ui.js`'s OUT OF REACH asks
whether content overflows its pane; here the content fits its pane perfectly — `scrollHeight` equals
`clientHeight`, `under: 0` at all four widths — and **it is the PANE that hangs off the bottom.**
Same loss, one box further out, and the rule was measuring the wrong box.

**`js/find.js`'s `settle_` is the app's own answer and the camera was not calling it.**
`placeCells('y', true, 0, 'make')`, at each of the four places the card changes height: a picture
picked, a shot taken, a picture thrown away, and a camera that failed to start and revealed its
retry. `true` for `settle_`'s reason — the cards have not moved as far as anybody is concerned.

### `PANE OFF THE SCREEN` — the same question, one box out

**A separate heading from OUT OF REACH, deliberately.** They are the same loss and different
repairs: *below its own fold* is a card too tall for its pane and wants the column paged; *off the
screen* is a pane placed for a card that has since changed size and wants `placeCells` where the
size changed. One heading would send a reader to the wrong half.

**Only `.page.on`, and that narrowing is what stops it being the noise generator this file has
already deleted one of**: every other page of a paged column is legitimately off the viewport —
that is what a column IS. The rendered box rather than layout, for the `.mat-out` reason. **Proved
by mutation**: without the `placeCells` calls it names all four widths; the real files are silent.

### `make · a photograph taken` — half the camera had never been on a screen the lab looked at

**The column opens on a viewfinder and nothing else.** `Again`, `Post it`, `Save a copy`, the
caption and the who-row are `hidden` until there is a photograph, so `check/press.js` listed
`cam-post`, `cam-save` and `cam-again` as untouched rather than as faults — an action on no screen
is one it cannot reach. **Entered through the app's own picker**, a `DataTransfer` carrying a real
one-pixel PNG on `#cam-pick`, because a container has no camera and `cam-shoot` is not a door this
can use. `camAgain_` puts it back, since states run in order down one page.

### Two things a screenshot caught, and one of them was four buttons on three lines

**`Try the camera again` stayed on the card while a picture was being held.** It is revealed only by
a camera that FAILED to start — and once you are holding a photograph, `Again` is already the button
that throws it away and puts the camera back, so the row offered two ways to do one thing. Measured
on the one path that reaches this with a dead camera, picking from Photos: the four buttons are
491px in a 300px row, so they **wrapped onto three lines and cost 52px**. It comes back by itself,
because `camStart_`'s catch is what reveals it and `camAgain_` calls `camStart_`.

**And the who-row sat flush on the button row.** Both are `.btn-row` with no margin, so the bottom
edge of `@family.` was the top edge of `Again` — 789px in both cases, measured — and with a gold
fill on the chosen one of each row the two read as one block overlapping another. `.5rem`, which is
the gap `.cam-row` already uses between its own buttons, so the spacing down the card is one number
rather than two. **Fourteenth time this file writes that a screenshot is the last word.**

**8px of headroom left at 768, and that is why `where` is not a second field.** The pane is 797
against a `max-height` of 805.
