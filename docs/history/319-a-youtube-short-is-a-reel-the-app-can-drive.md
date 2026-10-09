## A YouTube Short is a reel the app can drive, and the grey on every reel was the words' scrim

**The owner, 9 Oct:** *"i want to add this to reels, maybe embedd? or work fine without? i just want it
to look like other reels... also is there a grey effect on reels? i dont like that if there is remove
it. : https://youtube.com/shorts/jD2Yy_wCBLE?si=…"*

### The grey: what it was

**There was one, and it was `.feed-art.has-photo::before`** — the scrim laid under white words on a
photograph so they stay legible on a snowfield: black at 92% across the bottom eighth of the slide,
55% at the middle, fading out three-quarters of the way up. It was keyed on `has-photo` alone, and
every reel is a clip with **no words on it** (`feedSlide` draws no `.feed-text` for one) — so every reel
had that wash over it with nothing above it to explain it. Both clips in the column are pale models of
white buildings, so on them it read exactly as a grey veil over the lower two-thirds of the picture.

Measured at 390x844 before touching anything (`before-mp4-*.png` / `after-mp4-*.png` in the work's
screenshots): the computed `::before` on the clip slide was that gradient, and nothing else on the slide
was grey — no filter, no opacity, no backdrop blur on the column, no letterbox (`object-fit: cover`).

**Now the scrim needs words:** `.feed-art.has-photo:has(> .feed-text)::before`. `:has()` rather than a
class, for the receipts' reason — whether a slide has words is a fact about its contents. A fact with a
photograph keeps it exactly as before; a clip with a caption would get it; a clip with none gets the
picture and nothing over it.

**Kept, on purpose:**

| | why it stays |
|---|---|
| the ▶ disc on a held reel | the paused state, asked for; only there while held |
| the Sound button's charcoal chip | the app's own control over a picture, same wash everywhere |
| the dark frame round the reel (`.pane` + `.card.is-widget`) | every widget on every column sits in it; it is round the picture, not on it |
| the dim on the reels peeking above and below | the out-of-focus look asked for on 5 Oct (`.soft-dim`, because a playing video is not blurred) |

### The Short: an embed, and the one the column can drive

**The embeds were removed on "remove the embedded reels. they suck."** What sucked was Drive's and
Instagram's players: the column could not start, mute, or pause them, and they drew their own chrome.
**YouTube's IFrame Player takes orders by `postMessage`** — `playVideo`, `pauseVideo`, `mute`, `unMute` —
reports its state (`onStateChange`, `infoDelivery`) and its failures (`onError`), and a muted player may
start itself. So a YouTube address is now the second kind of clip, and the app does to it everything it
does to an mp4 reel:

| | an mp4 reel | a Short |
|---|---|---|
| arriving | its `x.jpg` poster | its own thumbnail, `i.ytimg.com/vi/<id>/oar2.jpg` (portrait for a Short) → `hqdefault` → `mqdefault`, `referrerpolicy=no-referrer`; YouTube's 120x90 "no picture" placeholder is treated as a miss |
| on screen | `src` set, muted, looping | ONE nocookie iframe built then (`enablejsapi=1&mute=1&autoplay=1&loop=1&playlist=<id>&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&origin=…`), `allow="autoplay; encrypted-media; picture-in-picture"`, the Videos card's `strict-origin-when-cross-origin` (error 153 otherwise) |
| what you see | the video over its poster | the poster until the player says PLAYING, then the player; never YouTube's black box, spinner, pause screen or error screen |
| touch | the slide is the control | a clear `.feed-yt-veil` over the iframe (and the iframe `pointer-events: none`), so the column still swipes and YouTube's buttons are never pressed |
| tap | pause / play, `is-held` ▶ | `pauseVideo` / `playVideo`, the same ▶ over the poster |
| Sound | `muted` | `unMute` / `mute`, the same button and words |
| leaving the page | paused | `pauseVideo`; **a page further, the iframe is removed** |
| leaving the column | paused | removed |
| cannot play | stays its poster | offline, video removed, embedding off (`onError` 100/101/150), or no first frame in 20s → the iframe goes, the poster stays, and one **Watch on YouTube** link (a door, `target=_blank rel=noopener`) |

**Why removed rather than paused a page away.** A paused `<video>` is a decoded frame; a paused YouTube
player is a whole page in its own process. The column deals in laps — the same Short every third page,
up to `REEL_MAX`'s sixty — so keeping every player built would add one a lap. By distance, not a timer:
the page in front plays, the pages either side keep theirs paused for a flick back, anything further is
taken down. Never more than three, in practice one or two. A player built again starts muted, and the
Sound button is put back to say so.

**No YouTube script is loaded.** The messages are a fixed handful; `iframe_api` would be another
company's JavaScript on every visit. The parser is `vidYouTubeId_` from the Videos card — no second one.

**The row is in `FEED_FACTS`, beside the two mp4s, with the `?si=` cut off** (it is the share link's tag
for who shared it). Not in `data/settings/facts.json`, though the README says new reels belong in the
sheet: that file has 400 rows and no `clip` column, and `clipsNow_` is per list — its first clip row
would become the whole clip list and the two mp4 reels would stop being dealt. Nothing was downloaded or
committed: the Short is YouTube's to serve, with its own name on it.

**A Drive ADDRESS is refused now, not only a bare id.** `https://drive.google.com/…` passed
`clipPlayable_` as "a whole URL to a video file" and could only ever be a dark slide (README: Drive never
hands a `<video>` the bytes). A YouTube page with no one video in it — a channel, a playlist — is refused
too.

### Not seen from here, and said so

This container cannot reach YouTube or `i.ytimg.com`. Every check and screenshot used a stand-in: a
local picture served for `i.ytimg.com`, and a page served at the nocookie address that speaks the
player's messages (`onReady`, `infoDelivery`, `onStateChange`, `onError`). What the real player may
still draw in its first seconds of playing — its title, which no parameter has turned off since
`showinfo` was retired — and whether the portrait `oar2.jpg` exists for this Short, are settled by the
first open on a phone.

### Checked

- **`js/check-reels.js`**: a YouTube row is accepted and asked no file questions; a row carrying `?si=`
  is refused with the address to use instead; a Drive address, a Drive id, Instagram, a channel and a
  playlist are refused. Its own copy of the test is now **held against the app's** — `clipPlayable_`,
  `clipSrc_` and `vidYouTubeId_` cut out of games.js with the marking checks' cutter and asked fifteen
  addresses and every row — so a drift is a failure. Seven mutations, each red then green on the real
  files: `?si=` in the row, a Drive address row, an Instagram row, a channel row, the app refusing
  YouTube, the app handing YouTube to a `<video>` as its `src`, the app letting Drive addresses through.
- **`js/check-flow.js`**, one journey: the poster first and no player on a page not yet reached; turning
  to it builds exactly one nocookie player with `enablejsapi=1` and `mute=1`, under the veil; `onReady`
  is answered with `mute` and `playVideo` and it is shown only once it says it is playing; tap says
  `pauseVideo` and draws the ▶, tap again `playVideo`; Sound says `unMute` and reads "Sound on"; the next
  page says `pauseVideo` and keeps it, two pages removes it and the button reads "Sound off"; leaving
  the column leaves no player; `onError` 150 leaves the poster and the Watch on YouTube door; no clip
  slide draws words, and no scrim in style.css is laid without them. Run with the Short dealt to pages
  0, 1 and 2. Nine mutations, each red: the scrim on every slide, no veil, never taken down, every Short
  built at once, tap ignoring a Short, Sound saying nothing, `onError` ignored, not muted, the column
  left with a player.
- **`check/ui.js`** read the cover crop as a sideways scroll — 333px of player in a 272px slide at 390.
  `object-fit: cover` is invisible to that rule and an iframe has none, so it now passes a clipping box
  whose overhanging children are all iframes **cropped evenly both sides** (a too-wide box spills off
  the right only, and is still reported — proved by a mutant that left-aligned the frame: red at 390,
  1280 and 1920). `--screen=reel` with the Short dealt first: nothing to report.
- check.js, check-const.js, check-css.js, check-doors.js green. check-flow: 198 journeys, the two that
  fail under this machine's load (the videos card, the timetable) fail the same on the base commit and
  pass alone. press.js `--screen=reel`: every reel press did something; its swipe findings on other
  columns are the base commit's own. swipe.js, a width at a time (both at once ran the browser out of
  memory on a machine at load 55): 390 green, 320 green — on its second run; the first reported two
  REACH findings on Find at 1280 that its own rule, run alone, does not.
- `--css-version` is `2026-10-09-a-short-is-a-reel`.
