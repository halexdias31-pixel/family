## The reels' Sound is a tile: a speaker that says the state it is in, on the picture's own wash

**The owner, 10 Oct:** *"the sound on or off should be a tile like everything else."*

### What it was

The last control on a reel drawn by hand. Every reel slide ended in
`<button class="btn tiny reel-sound" data-do="reel-sound">Sound off</button>`, and three places
rewrote its words: the first paint, `on('reel-sound')` for a `<video>` and for a Short, and
`reelYtDrop_` when a Short's player was taken down a page away. So its 44px floor, its press and its
look were its own, written in a `.reel-sound` block that had to undo two things `.btn` brings with it
(gold, and `width: 100%`, which once made it a gold slab across the top of the clip).

### What it is

- **`tile_()`, the one renderer.** `reelSoundTile_(on)` in posts.js draws it as
  `tile_({ icon, label, tone: 'over', cls: 'reel-sound', act: 'reel-sound', pressed })`, and
  `reelSoundSay_(el, on)` is the one place its state is changed afterwards, through `tileSet_`: the name,
  the mark and `aria-pressed` move together or not at all. All three old writers call it.
- **A pair of marks in `TILE_ICONS`**: `sound` (the cone and its two waves) and `mute` (the same cone, a
  slash corner to corner, no waves) — the padlock's argument, two marks that differ only in what leaves
  the cone. The cone and the waves are written once (`TILE_CONE_`, `TILE_WAVES_`) and Imposter's `speak`
  is built from the same two strings, so the three speakers cannot drift a pixel apart. `sound` is the
  same drawing as `speak` under its own name, because they are two acts that share a picture.
- **The label says the state it is IN, as the words did**: "Sound off" on a muted clip, "Sound on" when
  it plays aloud; the mark says the same thing in a picture, and `aria-pressed` says it to a screen
  reader. The old CSS note kept the word on the button because a crossed-out speaker "can be read as
  press to turn the sound off". The tile answers that by drawing the state, which is what every phone's
  video player puts over a muted clip, with the word still in `aria-label` and `title`.
- **Its own tone, `over`.** A tile's plate is 3% white on the app's black, and on a clip that is nothing:
  on a white wall the `--dim` mark measured 2.81:1. `.tile.is-over` gives it the wash the held reel's ▶
  and the dead Short's door already wear over the same picture — `--over-wash`, `--over-edge`,
  `--over-ink`, the three `:root` tokens named for exactly this. No new colour. Pressed, the edge goes
  white rather than the plate going lighter.
- **Where the button sat**: top right, `.reel-sound { position: absolute; z-index: 3; top: .6rem;
  right: .6rem }` and nothing else. The size, the 44px target and the press come from `.tile`. The ▶
  and the door are in the middle and a clip slide draws no words, so the corner is free.
- **Every behaviour of the button kept**: its own `data-do` inside the slide, so the dispatcher's
  nearest-handler rule keeps a tap on it from pausing the clip; a held Short is not started by it; a
  dead Short hides it (`.reel:has(.feed-art.is-dead) .reel-sound`) and ignores a press; a `<video>`
  turned aloud is asked to play.

The task said "over the bottom of the reel". The button sat at the **top** right, and the brief also
said "where the button sat". It stays at the top right, for the reason its old note gave: the words go
bottom left, and a control over what somebody is reading gets hit by accident.

### Any other sound control?

Searched `js/` for `mute`, `unMute`, `muted`, `Sound`, `audio` and `volume`. The reels are the only
mute control. The "One more thing" widget has none on purpose (overworld.js: the card is one tap target).
The Videos card has no sound control of the app's own, and the timer's beep has no switch. **Imposter's
Read aloud switch** is a sound setting too, but it is a form's switch on the setup card. Its comment
records the decision ("a FORM has buttons — with the word, because the adult setting the game up is the
one person here who reads it"), so it was left as it is and is named here for the owner to decide.

### Checked

- **check-flow.js**, two journeys. The new one, *"the reels' Sound is a tile"*: every reel drawn
  carries one Sound tile and no `.btn`, drawn muted; on a `<video>` reel (with `play`/`pause`/`paused`
  stood in), a click on the tile's **mark** goes through the real dispatcher, unmutes, asks the clip to
  play, never holds it, and the name, mark and `aria-pressed` follow it both ways; a tap on the picture
  beside the tile still holds the clip. The Short's journey now presses the tile on, off and on again
  (`unMute`, then `mute`), checks the tile goes back to muted when the player is taken down, and checks
  that a dead Short's tile is hidden by the stylesheet and unchanged by a press. Both read the state
  through one helper, `soundTileSays_`. **Fourteen mutations, all red**: the old button back, the mark
  never changing, `aria-pressed` never changing, the label saying the state a press moves to, no `mute`
  in `TILE_ICONS`, no `data-do` on the tile, no `play()` on unmute, the Short's drop leaving "Sound on",
  the Short told nothing, no `over` tone, the dead-Short rule removed, a dead Short's tile still
  flipping, the dispatcher also running the slide's `reel-tap` behind the tile, every reel drawn saying
  "Sound on".
- **check-doors.js** pairs `act: 'reel-sound'` with `on('reel-sound')` as it pairs every tile. A
  misspelt act and a renamed handler both turn it red.
- **check-css.js, 7b, widened.** It refused a `.tile` rule that spells out a hex token. Now it also
  refuses an rgb()-valued `:root` token written out: same channels, same alpha (`--over-wash`,
  `--over-edge`). Red for `rgb(0 0 0 / .55)` and for `rgba(255, 255, 255, 0.28)`. An anonymous wash
  (`rgb(0 0 0 / .5)`) stays green. The real stylesheet has no such literal.
- **check/ui.js** measures the tile on its picture, which no other rule here can see (a video frame is
  not in the chain rule 3 composites). For each reel on the screen it asks: a tile with one mark and no
  words; at least 44px; inside its slide; the mark at 3:1 over a **white** frame and a **black** one; clear
  of the held reel's ▶ and of any words. 30 tiles measured across five widths and two visitors, nothing
  to report. **Six mutations, all red**: shrunk to 36px, no `over` plate (2.81:1 on white), moved to the
  middle under the ▶, pushed half off the slide, the old button back, hidden on every reel.
- check.js, check-const.js, check-scope.js (run from `js/`), check-strings, check-loading,
  check-surfaces, check-widgets, check-access, check-lifecycle, check-spine and check-reels are green.
  press.js `--screen=reel`: every press did something, nothing threw. cascade.js: nothing decided by
  file order alone.
- check-flow, all journeys: the run at load average 8 to 16 hit the ten-minute ceiling with one failure,
  *"a retry that succeeds does not rebuild the box somebody is typing in"* (the notepad). It passed alone
  twice, so that is load. The journeys the ceiling cut off were run alone and passed.
- **Looked at**: `check/shots/reel-320.png` (a bright clip frame, the crossed speaker readable on its
  wash in the corner) and `reel-390.png` (the Short's dark gradient). Also a 3x zoom of the tile in both
  states at 320, 390 and 1280, over the mp4's poster: the crossed speaker muted, the waves aloud, white
  on the charcoal plate, 44x44. After a real click the tile read "Sound on", `aria-pressed="true"`, the
  `<video>` was unmuted and the reel was not held.

`--css-version` is `2026-10-10-the-sound-is-a-tile`.
