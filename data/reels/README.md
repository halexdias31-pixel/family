# The reels themselves

**Put the `.mp4` files here.** A row's `clip` field takes an address, and an address that is a path
into this repository is the one that works best:

```
data/reels/archetest.mp4
```

## Why here rather than Drive

**Measured on the live site, from a screenshot of a phone**: Google Drive does not hand a `<video>`
the bytes. `drive.google.com/uc?export=download` answers a redirect or an HTML interstitial, so the
element reports an error and the app falls back to Google's own player in an iframe. That player
works, and it is the wrong thing in three ways:

- **it cannot autoplay** — a cross-origin iframe will not start by itself, and a muted autoplay is
  the only kind any browser allows
- **it cannot be styled** — the scrubber, the ten-second skips, CC, 1x and the expand button are
  Google's, on a document this stylesheet cannot reach into
- **it cannot be muted or paused from here**, so the sound button is removed when it appears

A file served from beside the site is a plain `<video>`: muted, looping, playing when you scroll to
it, stopping when you leave, with nothing on it but the app's own sound button.

## What to know before adding one

- **This repository is PUBLIC and git history is permanent.** A clip committed here is published,
  and deleting it later does not unpublish it. Only put clips here that you are happy to publish
  under your own name — your own footage, or something you hold the rights to.
- **Keep them small.** GitHub refuses a file over 100 MB and warns over 50; more to the point, every
  byte is a byte somebody's phone downloads. Under about 10 MB each is comfortable.
- **One file, one row.** `FEED_FACTS` in `js/chess.js` is the built-in list — the fifth field is the
  clip. A row in the `facts` tab of the Settings spreadsheet wins over it the moment there is one,
  which is where new reels should go once the tab exists.
- **A missing file is a dark reel.** `node js/check-reels.js` is the check, written the day the
  first two clips landed. It asks four things of every row: the file is there, spelled exactly as
  the row spells it (`.MP4` and `.mp4` are one file on a laptop and two on Pages), a browser can
  play what is inside it, and the `moov` box comes before the `mdat` so a phone can start it before
  it has all of it.

## A still frame beside each clip, and why

**Reported as "the reel isnt loading. or it takes long to load".** Measured, the two clips here are
576×576, **104 and 92 seconds long, 7.3 MB and 7.9 MB** — so on a phone there really are several
seconds between arriving at the slide and the first frame, and for all of them the screen was
`.feed-art`'s gradient with a letter on it. A column whose whole content is a video, showing no
video, does not read as *loading*. It reads as *broken*.

**So every clip has a poster: `x.mp4` beside `x.jpg`.** `feedSlide` derives the name from the clip's
own path, so there is no column to fill in and nothing to spell wrongly — drop the two files in
together and it is picked up. About 20 KB each, and the slide is the clip's own first frame from
the moment you arrive.

```bash
ffmpeg -ss 0.5 -i data/reels/x.mp4 -frames:v 1 -vf scale=540:-2 -q:v 6 data/reels/x.jpg
```

**`check-reels.js` prints which clips have one** rather than refusing a clip that does not: a reel
with no poster works, it is simply slower to look like something.

## What would actually make them smaller, and why it is not done here

**The length is the size.** At 576×576 the video track is already only 450–585 kbps; what makes
7.3 MB is 104 seconds of it. Re-encoding at 540×540 was measured at **4.3 MB and 4.6 MB — 42% off**
— and it is a lossy edit to somebody else's footage, so it is a decision for whoever shot it rather
than something to slip in:

```bash
ffmpeg -i in.mp4 -vf scale=540:-2 -c:v libx264 -preset slow -crf 28 \
       -c:a aac -b:a 64k -ac 1 -movflags +faststart out.mp4
```

**The bigger win is shorter clips.** A reel is a format: fifteen to thirty seconds is what the shape
is for, and a thirty-second cut of either of these would be about 2 MB with nothing re-encoded.
