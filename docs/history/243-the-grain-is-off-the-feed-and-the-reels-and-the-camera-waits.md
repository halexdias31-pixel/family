## The grain is off the Feed and the Reels, and the camera waits for its page

### The grain

**Asked for as *"remove the 2002 grainy effect on the posts"*.** It went on the day before, as note
233 records (commit `1d31532`). It was a `filter` (warm, faded, a touch of contrast) and a
`mask-image` (a vignette times an `feTurbulence` grain tile), put on three things:
- every post picture (`.post-pic` and `.post-cell`, `<img>` or `<video>`)
- the composer's preview (`.post-preview`)
- every reel clip (`.reel .feed-vid`)

**It came off all three, the reels included.** The owner wrote "on the posts". The grain went on as
one look in one commit, and leaving it on the reels alone would be a second look nobody asked for.
That is the default taken, and the owner was asked to confirm it.

**What came back with it:**
- **The reel clip's subject gradient.** The grain's mask let whatever was behind a clip show
  through, so `.reel > .feed-art.is-clip.has-photo` was painted black. That cost a black slide
  before the poster landed, and a black slide for good when the poster 404'd. That rule is gone too,
  and a clip waits on its gradient again, as the `.feed-vid` note asks.
- **A post clip's native controls are untinted again.** They are drawn inside the `<video>`, so the
  filter had warmed them.

**`check/ui.js` FILM LOOK was turned round, not just deleted.** It used to require the film on
every post picture and reel clip, so the moment the CSS went, `--screen=feed` failed with
`img.post-cell ... drawn without the film`. It is **PICTURE NOT AS TAKEN** now: a post's, preview's
or reel's own `<img>`/`<video>` with any `filter` or `mask` is reported. A look made of two
properties on the picture itself measures perfectly against every layout rule there is, so nothing
else would notice it coming back. It asks only of the pictures, not every element on the screen,
which was the old rule's cost. A feed with no post picture, or a reel column with no clip, is still
a failure to reach the subject, not a pass.

**Measured** in Chromium over `check/fixture.json`, at 390:
- feed: 2 `img.post-cell`, none with a filter or grain (2 `img.post-face` avatars, likewise)
- reel: 3 `video.feed-vid`, none with a filter or grain
- reel clip background: `linear-gradient(160deg, rgb(35, 65, 27), rgb(14, 32, 21))`, not black

The screenshots at 320 and 390 show plain photographs and clips.

**Proved by mutation.** With the commit's two CSS blocks put back, `node check/ui.js --screen=feed`
exits 1 with `PICTURE NOT AS TAKEN — img.post-cell is drawn through filter sepia(0.24) ...`, and
`--screen=reel` exits 1 with the same line for `video.feed-vid`. With them removed again, both exit
0.

### The camera asked on load

**Reported as *"the website seems to ask you for permission to use camera when you first load into
it even though the camera widget is above the front door widget. it should only go when you swipe
to go up."*** It did, and each step was right on its own:
- The payload lands, and `load()` calls `repaint`.
- `repaint` runs `startScreen_` before `paintPager`. That order is documented and shared by every
  column.
- `paintPager` calls `pageHome_`, which moves the feed to its front door, `feedCamAt_() + 1`.

So for that one `startScreen_` the feed was still on page 0. Page 0 is the camera on any day the
calendar has no festive card, so `feedCamHere_` said yes and `getUserMedia` put the prompt up. A
moment later the column settled on the newest post, under the prompt. The audit measured it in
Chromium: one call at 560ms, `PAGE.feed` 0, `PAGE_OPENED.feed` false, from
`camStart_ < feedCamWatch_ < startScreen_ < repaint < load`.

**The fix is one fact `feedCamHere_` was missing: `PAGE_OPENED.feed`.** Until `pageHome_` has put
the column at its front door, `PAGE.feed` is the 0 the object started with, not a page anybody
chose. After it, every move is a swipe, a `goPage`, or arriving back at the column where it was
left. Those are the moments the camera is meant to start. It goes in the question every caller asks
rather than in `repaint`'s order, so it also covers any early caller nobody has written yet. A
missing `PAGE_OPENED` reads as no, which is the safe way for a permission prompt to fail.

**A second road to the same prompt, found by the journey.** With a festive card and an empty posts
tab, the column is `[festive, camera]`. "The page after the camera" is past the end, so `pageHome_`
clamped onto the last page, which is the camera. The app opened on it and asked. `PAGE_HOME.feed`
now opens on the page above the camera when nothing is below it. With no festive card there is
always a page below it, because `postsBlocks` draws "Nothing posted yet".

**And it asked more than once.** This was in the audit's notes, and it is the same complaint from a
different angle:
- **`CAM_ASKING`.** `CAM_STREAM` is null for as long as the prompt is up. So a repaint in that
  window (the inbox landing, the profile refresh) asked a second time. Two grants made two streams;
  the first was overwritten and never stopped, leaving a recording light nothing could turn off.
  While a question is open, nobody asks it again. The answer is now put on whichever card is on the
  screen when it arrives. Before, it went to the `<video>` found before the prompt, which a repaint
  had already thrown away.
- **`CAM_FAILED`.** After a refusal, Chrome answers the next ask itself, but Safari may prompt again.
  So a repaint on a refused camera page was a prompt nobody swiped for. The refusal is now
  remembered until the page is left (`feedCamWatch_`, or `camStop_` leaving the column) or
  `Try the camera again` is pressed. `camFailed_` draws the sentence and the button back onto every
  redrawn card, so a repaint cannot turn "The camera was refused" back into "Starting the camera…".
  The audit measured one swipe up with the browser refusing as 2 asks. It is 1 now.

**What is unchanged on purpose.** Coming back to the feed column on the camera page starts the
camera: that is arriving at it, and the camera has started on arrival rather than on a tap since the
note over `camStart_` was written. Coming back on a post asks nothing.

**What is still true and not fixable from here.** An iOS home-screen app usually does not keep
camera permission between launches. So the first swipe up after each launch may still prompt. That
is the behaviour that was asked for: it asks when you swipe up, not when you open the app.

**What is left.** If the number of festive cards changes between two payloads in one sitting, the
camera's page index moves under a `PAGE.feed` that stays put. A sign-in or a save reloads the
payload. A festive offer appearing between those two loads could then put the camera in front with
no swipe. It needs the calendar to roll over mid-visit, and it is written down rather than built.

**`check-flow.js`: "the camera asks for nothing until somebody swipes up to it".** No check had ever
stood in for `getUserMedia`. jsdom has none, so `camStart_` said "no camera support" and returned,
and a camera that can never start cannot be caught starting early. `boot()` takes a `before(w)` now,
run before the app's first line, like `check/ui.js`'s `addInitScript`. The journey uses it to seed
`familyUser` and to stand in for `mediaDevices`. It counts asks (prompts) and open streams
(recording lights). Each case runs on a fresh app:
- signed in, no festive card (the reported case): 0 asks on load and on a repaint at the front
  door; 1 ask and 1 stream after `goPage` to the camera; 0 streams after swiping back down
- to another column and back, on a post: no ask
- leaving from the camera page: the stream is released; coming back there: one more ask
- signed out: 0 asks on load or on the camera page, which draws no viewfinder
- a festive card: 0 asks on load, opens on page 2, 1 ask after turning to page 1
- a festive card and no posts: 0 asks on load, not opened on the camera
- refused: 1 ask; a repaint does not ask again and keeps the retry and the sentence; the button asks
  again; swiping down and back up asks again
- a prompt still up when a repaint lands: one ask, one stream, and the stream reaches the
  `<video>` that is in the document

`__t` gained `AT()`. jsdom's `eval` runs each call in a scope of its own, so `w.eval('AT')` is
"AT is not defined".

**Proved by mutation**, each one undone byte for byte and the journey green again after:
- the `PAGE_OPENED` gate removed: "opening the app asked for the camera 1 time(s)"
- `CAM_ASKING` removed: "a repaint while the prompt was up asked again — 3 asks for one card"
- `CAM_FAILED` not consulted: "a repaint on the camera page asked again", and "swiping up asked 2
  time(s)"
- the stream sent to the element found before the prompt: "went to the card that was replaced"
- the retry not forgetting the refusal: "`Try the camera again` did not ask again"
- swiping off the page not forgetting it: "swiping down and back up to the camera did not ask again"
- `PAGE_HOME.feed` back to `feedCamAt_() + 1`: "with a festive card and no posts, the feed opened ON
  the camera page"

**Measured in Chromium** with the audit's probe, `getUserMedia` stubbed to refuse:
- signed in, payload at 300ms and at 2.5s: 0 asks before the swipe up, 1 after
- signed out: 0 and 0
- one festive card: 0, then 1
- tab remembered as `stuff`: 0

Screenshots at 320 and 390: the front door on load with no prompt; the refused camera after a
repaint, still showing "The camera did not start", the reason and `Try the camera again`; and, with
a festive card and no posts, the column opening on the festive card.
