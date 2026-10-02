## The Feed's photographs and clips are grainy now, and the look is two properties rather than an overlay

**Asked for as "make the ig clone have a grainy look to it. like breaking bad but more. like 1999 or
2003 you knooow like light phone."** These get an early-digital-camera look: fine grain, colour gone
warm and a little faded, a touch more contrast, and darker corners.
- every post picture: `.post-pic` and `.post-cell`, `<img>` or `<video>`
- every reel clip: `.reel .feed-vid`, its poster included
- the composer's preview: `.post-preview`

Captions, names, avatars, reactions, tiles, the reel's own words and its sound button are untouched.

**No overlay element.** An `<img>` cannot carry `::after`. A noise layer would therefore need a
wrapper round every photograph, and every bleed, 4:5 and `holdColumn_` rule would move onto it. It
would also put an element under the thumb, on the column where most swipes start on a picture.

So the look is two properties on the picture itself:
- `filter` does the colour: `sepia .24`, `saturate .86`, `contrast 1.1`, `brightness 1.07`.
- `mask-image` does the vignette and the grain: a vignette and a 160px `feTurbulence` tile,
  multiplied (`intersect`).

The mask lets the near-black behind the picture show through. A speckle at about 85% is a dark
grain, and a corner at 62% is the vignette. Measured on a canvas, the noise has mean .50 and spread
.11, and the matrix maps it to alpha `.7n + .55`: mean .90, spread about .08. The tile is static, not
animated. It is a data URI, rasterised once and shared. Nothing intercepts a tap because nothing was
added to the document. On a 3x phone the tile is rasterised at device scale, so each grain is about
one CSS pixel. That is clearly visible, and looked at at 3x before it was kept.

**The composer's preview is in scope on purpose.** `showPostPreview` draws with the card's own
renderer *"so the preview cannot disagree with what goes up"*. A clean preview and a grainy card a
second later would be exactly that disagreement.

**The reel needed black behind the clip** (`.reel > .feed-art.is-clip.has-photo`). Without it the
mask let the subject gradient through, as coloured speckles and pink corners.

**What it costs:**
- `has-photo` goes on at first paint wherever a poster path exists, so a slide is black, under its
  scrim and words, for the moment before the ~20KB poster lands. The gradient used to show in that
  moment.
- A poster that 404s now leaves a black slide where it used to leave the gradient.
  `check-reels.js` already prints a clip with no poster.
- A post clip's native `controls` are inside the `<video>`, so they are warmed and grained with it.
- Not tested on iOS from here. If Safari ignores the mask, the picture is simply clean.

**Scoped by ancestor, not by class alone.** The film is keyed to `.post` / `.post-preview` / `.reel`
rather than to the classes, because `post-vid` is also on a clip in a chat, and the "One more thing"
widget draws `feedSlide` clips outside any `.reel`. Tokens `--film-tone`, `--film-grain` and
`--film-vignette` are declared on those three components.

**`check/ui.js` FILM LOOK** asks two questions of every screen, at two strictnesses:
- **Over-reach, asked of the grain mask alone.** Anything carrying it must be a post's, preview's or
  reel's own `<img>`/`<video>`. A caption that picks up the mask but not the filter is still a dirty
  caption.
- **Under-reach, asked of mask and filter together.** Every such picture must carry both.

It also fails when the feed draws no post picture, or the reel column no clip, to measure.

Proved by mutation:
- the mask alone put on `.post-cap` names `p.post-cap`
- the post and reel selectors broken names `video.feed-vid … drawn without the film`
