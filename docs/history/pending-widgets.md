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
