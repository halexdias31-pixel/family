## One widget per reel, and the column stopped having a scroller of its own

**Reported as "Multiple widgets for each reel. One widget per reel."** What was there was ONE card
holding a scroller — `.reels`, `height: min(62svh, 30rem)`, `overflow-y: scroll`,
`scroll-snap-type: y mandatory`, `touch-action: pan-y` — with every clip inside it as a `.reel`.

**So this was the one column the app's own dial did nothing on.** `paint` does
`classList.toggle('paged', !!PAGER[id])` and **`PAGER.reel` did not exist**, so the class never went
on and the vertical axis was never registered. That is the silent loss this file already records for
`me` and `posts`, where two of the nine screens lost an axis because a table of screen ids had not
been renamed with the screens. What moved instead was a box inside a card, with its own snap and its
own momentum, and the pane's `touch-action: none` switched off underneath it so the browser could
have the gesture back.

**A second scroller is a second description of the pager**, which is this repository's oldest
sentence — `documents_()`, `paperIdOf_`, `factsNow_`, `childrenOf`. `pages()` already gives a screen
a vertical strip of cards, a position remembered per column, and a dial; the hand-rolled scroller
was reproducing all three, differently.

**So a reel is a card on a page, exactly as a tool is.** `pages('reel', reelCards_(…))` wraps each in
`.page > .pane`, and each card is `.card.is-widget > .widget-slot`, which is what `widgetColumn_`
builds for every tool and every game. Measured in a browser at 390px: **3 widgets on arrival, 3
pages, `pageCount('reel')` 3, `paged` true, 0 scrollers, each reel 445px** — and turning to page 4
appends three more, 9 pages and 9 widgets, with the pager counting all of them.

**`.reel` states its own height now** and that line is load-bearing rather than tidy: `.feed-art` is
`position: absolute; inset: 0`, so the box around it must have a height or there is nothing for
`inset: 0` to resolve against. That is the circularity recorded above under `.page.reel-page`, where
a scroller asked for `height: 100%` of a page that had none and every slide came out 0px tall.

**Which reel is playing is the page number, not a ratio.** Two IntersectionObservers went with the
scroller: one watching for the bottom so more slides could be appended, one asking "is this slide
more than 55% of the column" to decide what should be playing. `PAGE.reel` IS which reel is on the
screen, and `goPage` is the one place it changes — so measuring it is measuring a thing the app has
already decided, which is how two halves drift apart. `reelsWatch_` plays the one and pauses the
rest, and it is booked through `afterSlide_` by both callers **under the same key**, because the key
is the named function itself: a run of quick flicks plays the clip you stopped on rather than
starting and pausing one per swipe. That is the coalescing fix this file records under "one timer was
holding three jobs", and an arrow at either call site would undo it.

**`reelPages_` is the same counter the markup is built from**, which is the rule every other `PAGER`
entry follows — a pager that counts for itself is a pager that can disagree with its own screen, and
that disagreement is what made the You column unmovable. It answers **one** when there are no clips,
because the screen still draws a page then: the card that says so and says how many rows it looked
at. A count of nothing over a page that exists is a column you cannot be on.

**Two clips, and both are the ones that were sent.** `1AerJnQHL8Vk0…` and `15nJWyOpLC94…` in
`FEED_FACTS`. With two, "for ever" is a lap and the column says so; it stops being a repeat the
moment there is a third, with nothing here to change.

### Refining it: a reel you could not stop, and one that did not stop when you left

**Three things, and the first was found by measuring rather than reading.** `go('reel')` then
`go('tools')` left a `<video>` with `paused === false` — nothing anywhere asked a clip to stop when
its column left the screen. So a clip somebody had turned the sound on for went on talking from a
screen two swipes away, with no control on the screen they were now looking at, and on a phone that
is also a decoder running behind a calculator.

**`paint` already does exactly this twice and says why.** `toolsStop_` stops the widgets when their
column leaves and `camStop_` stops the camera — *"a canvas loop behind a screen nobody is looking at
is a flat battery, and a live camera behind one is a recording light on for nothing"*. A reel is the
third of those and was the one nobody had written. `reelsStop_` is that line.

**And the "One more thing" widget had it worse.** It deals a fact on a tap and some of those facts
are clips, and it has no column of its own to come back to — so a clip left playing there was sound
from a screen with nothing on it to stop. Its roster entry had no `stop` at all. Both surfaces call
one `clipsStop_(root)`, because a second copy of "stop every clip under here" is the second reader
this file keeps writing about.

**A reel had no pause.** The column autoplays whatever page you are on, which is right, and the only
control on the slide was the sound — so a clip could be silenced and not stopped, and the only way
to stop it was to swipe away from it. Every video surface anybody has used answers a tap on the
picture with a pause. The whole slide is that tap now; the sound button sits inside it and carries
its own `data-do`, and the dispatcher takes the nearest one, so reaching for the sound never stops
the clip by accident. Measured.

**`REEL_HELD` is an index, not a flag**, because `reelTurn_` runs on arrival and on every page turn:
without it the clip you just stopped starts again the moment anything repaints. Per index means
stopping one and swiping to the next leaves the next playing, and coming back to the stopped one
finds it still stopped.

**And the mark is drawn from that state rather than left on the element — which the measurement
caught.** The first version added `is-held` in the tap handler only, so a repaint rebuilt the markup
without it while `REEL_HELD` stayed: a column showing a stopped clip with nothing on it saying so,
which is the exact invisible mode the mark exists to prevent. `reelCards_` writes the class from the
state now. Proved in seven states: on arrival, after a tap, after a repaint, after a second tap,
after the sound button (which must not toggle the pause, and does not), after leaving, and after
coming back.

**The sound button was a gold slab on a moving picture.** `.btn` is gold — right for the one thing a
form wants you to press, wrong laid over a clip, where a screenshot showed it as the loudest thing
on a card whose whole content is the video. It takes the same wash the paused mark uses, which is
also the wash `.feed-art.has-photo::before` lays under the words, so every control this feature puts
over a picture looks alike. **The words stay**: a glyph would say it in less room, and the button
says the state it is IN, which "a crossed-out speaker" cannot do without being read as an
instruction.

**Eighth time this file writes that a screenshot is the last word on a drawing**, and here it is the
last word on two: the gold slab, and the ▶ needing `padding-left: .18em` because the glyph's own
bearing sits it left of centre in its disc.

### Making it stable: four things the column could not survive, and three were measured first

**"Refine it to be more stable" was answered by looking for what breaks it rather than by reading
it.** Four faults, each proved before it was fixed and after.

**1. A REDRAW LOST THE PAGE YOU WERE ON.** Five pages down, `paint('reel')` took the column from 9
pages to 3 while `PAGE.reel` stayed at 5 — a position outside its own column, with nothing playing
because there is no reel 5 to play, until the next `paintPager` silently clamped it back to 2. A
redraw is not a navigation: `load()` repaints when the payload lands, and so does signing in and
every save. The draw builds as far as the page somebody is on plus the two kept ahead of it, and
`REEL_AHEAD` is one constant so the top-up and the redraw cannot disagree about that number.

**2. AND A REPAINT STARTED NOTHING, because the reels were booked outside the one list that exists
for exactly this.** `repaint` calls `startScreen_(AT)` under a comment that says why — *"a repaint
rebuilds the markup it was running in"* — and starts the widgets and the camera from it. The reel
column was booked separately, `afterSlide_(reelsWatch_)` in `go`, so a repaint rebuilt the column
and left it dead. Measured: `repaint()` at page 5, `playing: []`. It is in `startScreen_` now, with
the other two.

**That move answers a second fault for free, and it is the better fix for it.** Arrive at the column
and leave again inside 300 ms and a clip was playing on a screen you were not on: `go` stops the
reels as the new screen is drawn, and the booking held from the screen before fired afterwards and
started one again. `go` books `startScreen_` through an arrow that reads `AT` **when the timer
fires**, so the job now runs for the screen you ended on. The first version of this was a guard
inside `reelsWatch_` — right, and a second place that had to know about the race. Being in the list
makes it impossible instead of caught, which is the move this file already records as *replace an
emergent property with a declared one*.

**3. THE COLUMN COULD BE BUILT FROM TWO DIFFERENT LISTS.** `clipsNow_()` is a live answer — it asks
the sheet, falls through to the code's list, and gives a different list the moment a payload lands.
The pages are built one batch at a time and indexed by position, so a list that changes underneath
them makes index 4 a different clip from the one index 4 was drawn as, with `REEL_HELD` pointing at
whichever is there now. `REEL_CLIPS` is one snapshot per draw and the pages, the pager's count and
the item at index n are three readings of it. Same sentence as `documents_()` and `factsNow_`, one
layer down — and it also stops `reelPages_` rebuilding the whole fact list every time the pager
counts.

**4. THE ONE CLIP THAT HAD ALREADY GONE WRONG WAS THE ONE THAT COULD NOT BE STOPPED.** When Drive
refuses the bytes the `<video>` is replaced by Google's player in an iframe, and a cross-origin
iframe has no `pause` this page can call — so `clipsStop_` stopped every clip except that one, which
went on playing behind another screen. **The half that was fixed was the half that was easy to
reach**, which is a shape worth naming. Taking its address away is the only stop available:
`about:blank`, with the real one kept in `data-src` so the slide can have it back, and `reelTurn_`
gives it back to the reel you are on. Not removing the element, because a slide that loses its
player has nothing left to look at and the card would resize under the column. Proved with Drive
answering nothing: `https://drive.google.com…` → `about:blank` on leaving → back again on return.

**Nothing regressed**, which is the other half of trusting it: the seven states of the pause and its
mark are unchanged, the column is still 3 widgets on arrival topping up to 9, and `check/ui.js`
reports nothing new across 100 combinations.
