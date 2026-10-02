## The reel had several seconds of gradient and it read as broken

**Reported as "the reel isnt loading. or it takes long to load".** Measured with `ffprobe`: the two
clips are **576×576, 104 and 92 seconds long, 7.3 MB and 7.9 MB**, at 450–585 kbps of video. So the
wait is real, and what was on the screen for all of it was `.feed-art`'s gradient with a letter on
it. **A column whose whole content is a video, showing no video, does not read as *loading*. It reads
as *broken*** — this repository's oldest shape wearing a stopwatch.

**A POSTER IS ABOUT 20 KB AND IT IS THE CLIP'S OWN FIRST FRAME.** `x.mp4` beside `x.jpg`, derived by
`feedSlide` from the clip's own path, so there is no column to fill in and nothing to spell wrongly —
the `images` argument against a numbered column, one step along. Only for a path: a Drive id has no
poster to derive and an absolute URL is somebody else's server. **A poster that 404s draws nothing**,
which is exactly what the slide did before, so it degrades to the old behaviour rather than to a hole.

**`has-photo` ARRIVES WITH IT**, and only where there is one. The note over `reelPlay_` says why that
class waits for `loadeddata` — the scrim and the white words over a slide that is still its own
gradient are furniture for a picture that has not arrived. A poster IS the picture arriving.

**WHAT WOULD ACTUALLY SHRINK THEM IS NOT DONE HERE.** Re-encoding at 540×540 was measured at 4.3 and
4.6 MB — **42% off** — and it is a lossy edit to somebody else's footage. That is a decision for
whoever shot it, so the command is in `data/reels/README.md` rather than in the repository. **The
bigger win is shorter clips**: a reel is a format, and thirty seconds of either of these would be
about 2 MB with nothing re-encoded.

**`check-reels.js` counts the posters** and prints which clips have one rather than refusing a clip
that does not: a reel with no poster works, it is simply slower to look like something.
