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
