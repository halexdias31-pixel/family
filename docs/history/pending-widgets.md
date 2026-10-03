## Videos on Games, a LEGO trade-in placeholder on Tools, and a boxing splash

### "videos would be in the games column. its one new widget. its a video searcher you type in. and there should be a full screen button."

Asked before that as *"Video cool videos database for reals and movies"*.

**A `videos` widget is now the last card on the Games column**, appended after `contest` for
`contest`'s reason: `PAGE.games` remembers a page by index, so anything inserted above moves every
saved position by one. The contest journey's "contest is last" became "contest comes straight after
`reels`", which was always what it meant.

**One card: a search box, a player, a Full screen tile, a count and a list.** Every typed word has to
be somewhere in the row (title, tags, kind, notes, age), so a second word narrows rather than widens.
The count says "2 of 6 videos" rather than going quiet. The box is built once and never repainted, so
a phone keeps its keyboard while the list under it changes.

**What it searches is three lists, and only one is new:**
- `data/videos.json`, the owner's database: `title`, `url`, `kind` (reel | film | clip), `tags`,
  `age`, `notes`, `active`. **It ships with one switched-off placeholder row and nothing else.** No
  network here could confirm that a YouTube id is still up, and a list of guessed links on a
  children's site is worse than an empty one.
- the reels: `clipsNow_()`, the list the Reels column plays. They are called "Reel 1" and "Reel 2",
  numbered by address because `clipsNow_` deals at random once per open.
- the films: `DATA.films`, which the backend sends to admins only (note 068). They are shown as a
  door ("opens in a new tab"), because a 3 GB `.mkv` plays in neither player.

**YouTube is embedded, and the reels' embeds were removed.** The owner's words on the reels were
"remove the embedded reels. they suck." That was about a column which autoplays, mutes and pauses
falling through to an iframe it could control none of. Here nothing plays until a row is tapped, and
then the viewer runs the player. A YouTube link cannot be played in a `<video>`, so it gets an embed
on the youtube-**nocookie** host, sending `strict-origin-when-cross-origin` (YouTube refuses a page
that sends no referrer). An `.mp4` plays in an inline `<video>`. **This is one for the owner to
confirm.**

**Full screen is a tile.** It calls `requestFullscreen` on the player, then `webkitRequestFullscreen`
for older Safari, then `webkitEnterFullscreen`, which is the only full screen an iPhone has and works
on a `<video>` only. On an iPhone a YouTube embed goes full screen from its own button, and the toast
says so.

**Leaving the column empties the player.** That is the Reels lesson from note 047, and an iframe
cannot be paused from outside.

**Not all of YouTube.** A live YouTube search needs a YouTube Data API key in a public page, which
publishes the key. That is the owner's decision and has not been taken.

**Checked.** The journey `the videos widget is last on Games…` serves its own `data/videos.json` and
checks seven things: the card is last; it asks for the file; switched-off rows are hidden; reels are
searched; "volc" narrows to one row and two words to the row holding both; a YouTube row puts a
nocookie embed of that id in the card and an mp4 row an inline `<video>`; Full screen asks the
`<video>`; and leaving empties the player. Each was broken once (no narrowing, `active` ignored, full
screen on the stage, the card moved above contest, the stop removed) and failed for that reason. The
state `a video search, narrowed, one playing` in `check/states.js` puts the longest title and a
playing reel in front of `check/ui.js` and `check/press.js`. Nothing new was reported at 320, 390,
768 or 1280.

### "the lego trade in should be a widget in tools. you dont have to make it just leave a placeholder."

**A `legotrade` card is now the last card on the Tools column**, after `calendar`. It copies
`contest`: a heading, one line ("Coming soon: trade in the LEGO sets you have finished with."),
"Not built yet." and nothing to press. It is appended because `PAGE.tools` remembers pages by
index, and it is not `solid`, so the funnel never offers it as a search result. The roster note
points whoever builds it at `data/lego-sets.json`, where the shop's LEGO rows already are.

**Checked.** The journey `the LEGO trade-in placeholder is the last card on the Tools column…`
asks that it is last in `widgetsOf_('tool')`, is headed LEGO trade-in, says "Not built yet" and has
no control. Moving it above `calendar` with a button inside failed both halves. Screenshots at 320
and 390 show the same card as Contest.

### "add a boxing animation loading. like boxing in the ring 8 bit."

**A new splash, `is-box`: the ring.** It is drawn from the side: three ropes (paper, coral, paper)
between two corner posts with gold and blue pads, a mat, an apron, and a bell on a bracket over the
middle. There are two boxers, both original and drawn pixel by pixel in `tools/boxing.py`: no real
fighter, no game character, nothing on the apron. Gold has gold trunks and dark hair; blue has
`--tag-level` trunks and gold hair; both wear `--coral` gloves. Every colour is an app token. The
mat's colour is a `color-mix` of two tokens, named on `.bx-ring`.

**The loop is 4.8s:**
1. Both bob in their guard, off the beat from each other.
2. Gold jabs and blue ducks under it, stepping back.
3. Blue jabs and lands. Gold rocks back and a spark flashes on his face.
4. Gold jabs and lands, and blue rocks back.
5. The bell shakes and dings, and both go back to their corners.
6. Both come out again to exactly where they began.

**Eight-bit in how it moves, not only in how it looks.** Every animation is `step-end`, so a pose
is swapped, never cross-faded. A boxer moves a whole pixel at a time; the generator writes a stop
for every pixel of a step. The pixels are paths in one SVG with `shape-rendering: crispEdges`. The
stage is `min(300px, 94vw)`, so a game pixel is three screen pixels and the ring is 300px wide at
320. The bell swung by `rotate` in the first draft. A turned bell is off the pixel grid, with soft
diagonal edges, so it now shakes a pixel each way. Transform and opacity only, one 4.8s clock.

**Reduced motion holds one punch:** gold's jab landed, blue rocked back, the spark lit.

**Registered like the others:** `is-box` in the picker's `kinds`, `#splash-box` in the hidden list
and its show rule, and a `box` row in `data/settings/splashes.json` so the sheet can turn it off.
`tools/boxing.py` prints the markup and the `@keyframes` (between `BOXING-FRAMES` markers in
style.css), as `tools/blocks.py` does.

**Checked.** `js/check-splash-loops.js` now lists `box`. That gives it the seam, one-clock,
transform/opacity, reduced-motion and centring checks, plus `boxOwn_`, which checks:
- every animation is `step-end`
- at every quarter-percent of the loop each boxer shows exactly one drawing (no ghost, no blink)
- while a spark is lit, the puncher is in the jab and the other is in the hit
- three ropes, two posts, a bell, blue mirrored, and `crispEdges`

The spark rule found a real fault on its first run. The sparks lit 0.02s and 0.04s before the hit
poses, so the generator now starts each hit on its spark. Mutations, each red for its reason:
`linear` on one pose, `crispEdges` removed, a jab keyframe showing at 0% (a ghost and a seam).
`npm run splash -- is-box`: 31 of 31 frames moved, longest still 0ms. Frames were shot at 0.2,
0.75, 1.65, 2.62, 3.3 and 4.1s at 320 and 390, plus the reduced-motion still, and looked at.

**And a check that had been passing by accident.** `check-css.js` section 8 (every splash says
@family.) split the markup at each `<div id="splash-`. The blocks splash spells the name one letter
to a block, so it never holds the word. It passed only because it was last and its text ran on
into `#splash-say`. With the ring after it, blocks went red for a fault that is not there. The rule
now also reads the text as it shows (tags and spaces out), and the last splash is cut at
`#splash-say`. Taking the ring's own `@family.` out now fails.
