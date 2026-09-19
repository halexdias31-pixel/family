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
- **A missing file is a dark reel.** The path is not checked by anything yet, because there is
  nothing here to check — the first clip that lands is when that check is worth writing.
