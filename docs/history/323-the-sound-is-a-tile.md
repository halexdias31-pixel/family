## The reels' Sound is a tile, and so is Imposter's Read aloud: a speaker that says the state it is in

**Imposter's Read aloud since [343](343-imposter-has-a-picture-on-every-card-and-says-only-the-word.md), 11 Oct:** the tile is unchanged, but what it switches on now says only the word, or "Imposter", on Listen — nothing on a hand-over, the play screen or the reveal.

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
Read aloud switch** is the other one, and it is a tile now too: see "Review" below. (The first commit
left it a button because its comment said "a FORM has buttons", and named it here for the owner. Review
said the brief had already decided it: "any other sound or mute control … becomes the same tile too".)

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

### Review, and what it found

Three findings. Each was reproduced first, then fixed, and each fix has a check that was red before it
and green after, shown by a mutation.

**1. check/ui.js never asked whether the tile was on top.** With `.reel-sound { z-index: -1 }` the tile
was drawn under the clip. It could not be seen or pressed. ui.js still printed "reel Sound tiles measured
… 30" and "nothing to report", over a `reel-390.png` with no tile in it. press.js passed it too. Every
rule in the measurement asked about a box or a colour, and none asked what is painted at that spot. Now
it calls `elementFromPoint` at the tile's centre, and the thing it finds must be the tile or something
inside it. Two limits:

- **Only the card in front.** `placeGrid` sets inline `pointer-events: none` on every page except the
  focused one, on purpose (shell.js, "the card in front, not every column's current card"). So the
  first version of the hit test reported the next reel down, peeking up under the fold, as covered by
  `section.screen.paged`. That reel takes no press by design. The check reads the page's inline style,
  not the tile's computed one, so a tile that turns away presses itself is still tested.
- **Only where it can be painted at all.** The tile's centre has to be inside the viewport and inside
  every ancestor that clips. A pane clips; press.js learned that from the star at the foot of a widget.

If no tile was hit-tested on the column, that is reported as a finding too. Measured: 30 tiles, 10 of
them in view and hit-tested (one per width per visitor), nothing to report. **Mutations, both red:**
`z-index: -1` ("`<video class="feed-vid">` is [the top thing], … the tile is drawn under it", and
`<span class="feed-yt-veil">` on the Short), and `pointer-events: none` on the tile.

**2. check-flow read the mark by its class name only.** In tiles.js, `mute: TILE_CONE_ + TILE_WAVES_`
draws the muted mark exactly like the playing one, and `FLOW_ONLY=reel` still said "all 2 journeys
work". With no word on the tile, the picture is the only visible sign of its state. Now the journeys
read the **drawing**:

- `__t.ICONS` hands the app's own `TILE_ICONS` to the journeys.
- `soundTileSays_` (now `switchTileSays_`, shared with Read aloud) requires the drawn `<svg>` to match
  the entry its class names, shape by shape. A shape is its tag plus its sorted attributes.
- `soundPairSays_` requires the pair to differ **both ways**: the slash appears only in `mute` and the
  waves only in `sound`. It also requires the two to **share** the cone. That is the padlock's argument
  in tiles.js, checked instead of trusted.
- The `<video>` journey also records the mark's markup before and after each press. It must change on
  each press and come back to where it started.

**Mutations, all red:** the reviewer's `mute` drawn as `sound` (in both reel journeys and in Read
aloud), `mute` as the bare cone, `sound` as the bare cone, a `mute` with a cone of its own, and
`tileSet_` changing the class but keeping the old drawing.

**3. Imposter's Read aloud is a tile.** It was a pill with the speaker, the words "Read aloud" and a
sliding knob that turned gold when on. Now it is `impAloudTile_` in games.js:
`tile_({ icon: on ? 'sound' : 'mute', label: on ? 'Read aloud on' : 'Read aloud off', act: 'imp-aloud',
cls: 'imp-aloud', on, pressed: on })`.

- It uses the same pair of marks as the reels, so a sound switch in this app only has to be learnt once.
- Like the reel's label, it names the state it is in.
- `.on` brightens the plate, and `aria-pressed` gives the state to a screen reader.
- `.imp-aloud` stays as the name `check/states.js` finds it by. The pill's seven CSS rules (`.imp-aloud`,
  `.imp-sw` and its knob) are gone: everything it needs comes from `.tile`.

The read-aloud journey now checks the tile in four places: as it arrives (off, crossed speaker), once
pressed, after a repaint, and turned off again by a **real click on its mark** through the dispatcher.
The click must leave a different picture on the tile, store `imp-aloud` as `'0'` on the device, and
say nothing. **Mutations, all red:** the old pill back, the tile always drawing the waves, the tile
never lit, the label naming the state a press moves to, and (check-doors) the act misspelt.

The words go into the name, as on every tile. The adult setting up a round still sees the word in
`title` on hover. Nobody has asked the owner whether the word should stay visible on this one card. If
the answer is yes, the change belongs in `tile_` as a labelled tile, not as a second hand-written pill.

**Looked at:** the setup card at 320, 390 and 1280, before and after a real mouse click on the tile.
The tile is 44x44 and is the top thing at its own centre. It reads "Read aloud off" with `tile-i-mute`
on the dim plate, then "Read aloud on" with `tile-i-sound` on the lit plate. The crossed speaker and the
speaker with waves can both be read at a glance, between the stepper and Deal. Also the reel shots at
320 and 390 after the ui.js change.

**Checks after the review**, all green:

- check.js, check-doors, check-css, check-const, check-loading, check-strings, check-access,
  check-widgets and check-surfaces.
- check-flow, `FLOW_ONLY=reel` first, then all 273 journeys. Run as four contiguous quarters, because
  the whole run is longer than one ten-minute call at load average 25 to 35.
- `check/ui.js --screen=reel --shots` and `check/cascade.js`.

**press.js `--screen=reel`:** every press works, and with `--no-swipe` it exits 0. Its swipe pass, which
covers every column whatever `--screen` says, failed in three runs. Each run failed one games timing
probe, and a different one each time: the 40ms chain flick, then Flabby Pird's touch down, then the 20ms
chain flick. Those two probes were then run alone, twice, against this tree, and twice against a copy of
the commit before this review. Both trees failed them the same way, at different gaps from run to run,
with Flabby "flapped, vy 0.8" (the bird already falling by the time a slow evaluate came back). That is
load, not this change.

`--css-version` is `2026-10-10-sound-and-read-aloud-are-tiles`.
