## The videos card is a search first: the bar alone, four results as you type, a tap plays in their place, and Full screen fills the glass even on an iPhone

**The owner, 10 Oct:** *"make it look more like youtube, the widget, in the sense that at first all you see
is a search bare, then you search and you see relevant result underneath. max 4 results show. you click on
one, then it shows video. you can click fullscreen to make it fullscreen"*

### What it was

Note 311 made the card read like YouTube, but it was still a list: it opened on the search pill, a count
("12 videos"), an admin's Sync row and every row it had (forty, then "N more — type to narrow the list.").
A tap played the clip in a player drawn ABOVE the list, and the list stayed under it with a `Playing` veil
on the row. An admin's films were doors to Drive. And Full screen, on an iPhone, toasted *"Use the full
screen button in the player."* — Safari there has full screen for a `<video>`'s own player and nothing
else, and a YouTube or Drive player is a frame.

### What it is now — one of four things, decided in `vidPaint_`

| | |
|---|---|
| **idle** | nothing typed (or only spaces), nothing playing: **the search bar alone**, for everybody, the admin included. No count, no list, no Sync row, no empty player. The count went with the list it counted |
| **results** | something typed: **at most four rows**, best first (below), the narrowing and plural rules as before. More than four: **one** faint line, "N more — keep typing to narrow" (a count rather than a silence). None: "Nothing matches that." (or "No videos listed yet." when both lists have landed empty, as before) |
| **watch** | a result tapped: the 16:9 player, its title and one line, and the Full screen tile beside them — **in place of the results**. The bar stays on top holding what was typed. **Any edit of the box** empties the player (an iframe cannot be paused from outside it, so emptied is the only stopped) and draws the results for the new words; clearing it is the bar alone. Leaving the column stops it, as before (`videosStop_`). A tap also takes the focus from the box, so a phone's keyboard does not stay up over the player it just asked for |
| **full** | Full screen: the browser's own where it has one, the app's own where it has none (below) |

**THE LOADER** (306): the bar is **never veiled**. It used to be, whole, under the one loader while
`data/videos.json` was out — right for a list, wrong for a card whose first job is to be typed into.
Somebody who types before the lists land sees `loading_()` **where the results will be**, then the
results.

**THE ADMIN'S SYNC ROW** is drawn only under a search's answer — results, "Nothing matches that." or "No
videos listed yet." — at the **foot** of the card. Never in the idle bar, never under a player. The daily
automatic sync (`filmsSyncDue_`) does not need the row drawn and is unchanged.

### The best four first

A list cut at four is only as good as its order: in the order the rows were written, "sun" put a weather
report with `sun` in its tags above a clip called Sun. So `videosFound_` ranks, by how much of what was
typed is the TITLE:

1. the whole query **is** the title — "sun" → Sun
2. the title **starts** with the whole query — "sun" → Sunsets explained
3. every word **starts a word** of the title — "moon sun" → The sun and moon
4. every word is **in** the title — "sun" → Tsunami waves
5. found only in the tags, kind or notes

Ties: a row that plays in the card, then one that opens elsewhere, then one that cannot open (so four
places are not spent on doors when there are things to watch), then the title A to Z, so the same words
always give the same four. The plural rule (`gardens` → garden) counts at every rank, so a word that finds
a row also ranks it.

### An admin's films play in the card, in Drive's own player

A films-list row (`fromFilms`) whose address is a Drive **file** (`vidDriveId_`) is now `how: 'drive'`: a
row that plays, and on the tap — and not before — an iframe on
`https://drive.google.com/file/d/<id>/preview` with `allow="autoplay; fullscreen"` and `allowfullscreen`.
That is the player Drive draws for a file shown in a frame, so a film streams at whatever Drive can
transcode rather than asking a browser to play 3 GB of `.mkv` (068). **Beside Full screen such a film has
an Open in Drive tile** — the row's old door — for the file Drive will not play in a frame (a big `.mkv`
it has no preview for, a sharing change).

Unchanged, on purpose: **a series is its folder** and stays a link that opens it; a placeholder still says
"not in the Drive yet"; **the owner's own rows in `data/videos.json` behave exactly as before** — YouTube
plays in the card, a Drive address there stays a link and asks Drive for nothing (311: that list reaches
every child, and `drive.google.com` carries Google's cookies). Every picture rule of 311 stands: i.ytimg.com
with no referrer, Drive thumbnails only for films-list rows, the poster under every picture, the two
broken-picture listeners.

### Full screen where there is none: the top layer, not `position: fixed`

`requestFullscreen` (or `webkitRequestFullscreen`) on the player first, as before; a refusal falls through.
A `<video>` on an iPhone takes `webkitEnterFullscreen`, the phone's own player. **A frame on an iPhone
gets the app's own full screen**: the player over the whole glass, black round it (`--letterbox`), the safe
areas as padding, an **Exit full screen** tile (a new `unfull` mark: `full`'s corners turned inward), and
Escape to leave.

Two things stood in the way, both structural, both measured in Chromium on 10 Oct:

- **`position: fixed` is not fixed to the screen in here.** Walking the card's ancestors found four
  containing blocks for a fixed box: the column's `transform` and `translate` (`placeCells`), the page's
  `contain: layout`, the pane's `contain: content` (which clips as well) and `#screen`'s
  `container-type`. Lifting them for the length of a film was the suggested route; it moves every column
  and pane under the film, and `check/ui.js` called the card off the screen.
- **Moving the player to `<body>` reloads it.** An iframe that changes parent loads again from the start.

So **the block holding the player goes into the top layer where it stands**: `popover="manual"` and
`showPopover()` (`vidFullOn_`). The top layer is the browser's own layer over the page — what a modal
dialog uses — and no ancestor's transform, containment, overflow or z-index reaches it, while the element
does not move in the document. `manual`, so nothing closes it but this code. While it is on: `data-noswipe`
(a finger on the black does not turn the column), the arrow keys are kept from the grid in the capture
phase, Escape leaves, `role="dialog"` and `aria-modal`, the focus goes to Exit and comes back to Full
screen, and the card keeps its height (`minHeight`) so nothing on the column moves when the block leaves
the flow or comes back. Leaving the column, an edit, the film going (Sign out) or the card being redrawn
all end it.

**THE ONE INHERITED THING THE TOP LAYER DOES NOT SHED IS `zoom`.** `paneReach_` draws a card taller than
its pane smaller with inline `zoom` on the pane's child, and a block in the top layer still inherits it:
at 844x390 the Exit tile came out at 32px and the film at 507x285. So while the card's film is full screen
the card is held at zoom 1 underneath, out of sight (`.pane > :has(.vid-watch.is-fs) { zoom: 1 !important }`
— `!important` because `paneReach_` writes inline and goes on writing on a resize, which a phone turning is).

Upright, the film is the width of the glass and Exit sits under its right-hand corner; on its side (where
an iPhone has room either side) Exit sits beside it and the film keeps the whole height.

**Proved in Chromium with the Fullscreen API deleted** (`Element.prototype.requestFullscreen` and
`webkitRequestFullscreen`), with the YouTube frame served by a page that counts its own loads, at 390x844,
844x390 and 320x568, each turned to the other orientation while on: the block is exactly the viewport; a
point in every corner and the middle lands inside it; the film is 390x219 upright and 693x390 on its side
(500x282 at 568x320, the width less the tile); Exit is 44x44 and off the picture; **the frame loaded
once** through full screen on, the turn, Escape, on again and Exit; a mouse swipe across the black and an
ArrowRight left the column and the page where they were; and the pane was at the same place before and
after.

### Left alone, and not done

- **Where there is no top layer either** — Safari before 17, so iOS 16 and older — a `<video>` still takes
  the phone's own full screen and a frame still says *"Use the full screen button in the player."*. That is
  the one case left; iOS 15.4–16 could have been reached with a `<dialog>` instead of a popover, at the cost
  of a `<dialog>` drawn inline as the watch block, announced as a dialog when it is not one.
- ~~**Two copies of the card both play.**~~ Fixed after the review — see below: only the copy tapped plays.
- **The line under a playing film** is the kind and the age, as before ("Film · kids"); its year is on the
  result row, not repeated there.
- **Not seen against the real hosts.** This sandbox reaches neither YouTube nor Drive. Drive's `/preview`
  in a frame is the documented embed and works for a file shared "anyone with the link"; whether every file
  in the Notflix folder previews (Drive has no preview for some large `.mkv` files, and a browser that keeps
  Google's cookies from this site may be asked to sign in) is the first thing to look at on the owner's
  phone. Open in Drive is there for exactly that.

### Checked

- **`js/check-flow.js`.** The first videos journey rewritten: idle is the bar and nothing else (`vidIdle_`
  names whatever else is drawn); "clip" finds four in the decided order with no "more" line; 311's picture
  rules on those rows; narrowing, two words, "Nothing matches that.", spaces and an empty box back to the
  bar; a tap plays the nocookie embed with its title and line, the results gone, the bar holding "volc" and
  the focus out of the box; an edit empties the player and draws the results; clearing over a film is the
  bar alone; an `.mp4` plays inline; Full screen asks the `<video>` when the API is there and draws nothing
  of its own; with the API gone the watch block goes into the top layer (`showPopover`), marked
  `is-fs`/`popover="manual"`/`data-noswipe`/`role="dialog"`, Exit in place of Full screen, the same iframe
  element throughout, the arrows not turning the grid, Escape and the Exit tile each leaving; with no top
  layer either, the toast; leaving the column ends it. **New**: a ranking journey over eight invented rows —
  every rank, both tie rules, the plural, "4 more — keep typing to narrow", and the whole order past the
  four from `videosFound_` itself. The films journey: the admin's idle is the bar alone; "film" finds all
  seven and draws four; "adults" puts the two that play A to Z, then the series, then the placeholder; a
  Drive film is a play button with no `/preview` anywhere until it is tapped, then Drive's player of its file
  with autoplay and full screen allowed, Full screen and Open in Drive beside it, and no Sync row under it; a
  series stays a link to its folder with no picture and no player; the Sync row is at the foot under results
  and under "Nothing matches that.", and not in the idle bar. The loader journey: with the file held the
  card is not veiled and is the bar alone; a word typed shows the one loader inside `.vid-results`; the
  file landing replaces it. The sync, failed-sync, student/stranger, sign-out and daily-sync journeys ask
  through a search now, since an idle card lists nothing. **All 273 journeys pass.**
- **Thirty mutations in `check-flow.js`**, each in a throwaway copy of the tree, each red for its own named
  reason, the real files untouched and green: an empty box counted as a search; five results; the door tie
  flipped; tags ranked first; A to Z dropped; the title-start rank dropped; the plural dropped; the "more"
  line counting everything; "Nothing matches that." silent; results left under the player; an edit keeping
  the film; the box keeping the focus; a folder taken for a Drive file; no Drive player; Drive's player
  without full screen; an owner's Drive address playing; no Open in Drive; the Fullscreen API ignored; no
  top layer; no `data-noswipe`; the player moved to `<body>`; Escape ignored; the Exit tile dead; the arrows
  reaching the grid; full screen outliving the film; the Sync row everywhere; no loader while waiting; the
  idle bar veiled; Sign out keeping the search; no word when there is no top layer. Four of them first went
  red by the journey throwing on the next press; the presses are guarded now and each names what was missing.
- **`check/states.js`**, the videos states rewritten and measured by `check/ui.js` at every width for both
  visitors: the card idle; four results with "2 more — keep typing to narrow" (and an admin's Sync row as
  the card's last child); one playing in place of the results; an admin's film from the folder playing with
  Full screen and Open in Drive; **the card's own full screen**, with the API deleted and pressed through
  the tile, whose `expect` asks in pixels that the block is the viewport, that every corner and the middle
  land in it, that the film is 16:9, on the glass and as large as the orientation's room allows, and that
  Exit is 44px, on the glass and off the picture; the admin's films and nobody's films, both as a search;
  and the videos still coming, the bar unveiled and the loader in the results, released into three rows.
  **250 combinations, nothing new** — the run first reported the Games column 94–143px off the line: the
  full-screen state's focus on Exit and back on Full screen held the card's top (`HOLD_AT`) for every later
  state, so its `leave` lets go of the card as a finger would. The only differences from the base commit's
  known list are the word search's letters, which are dealt at random.
- **Five layout mutations**: the block left at the popover's own fit-content size, and the Sync row drawn
  in the idle bar — `check/ui.js` red at every width; the landscape row taken away — `check/ui.js` red at
  1920x1080; the zoom lift taken away and the landscape row taken away — the Chromium proof above red at
  844x390 and 568x320 (Exit 32px and the film 507x285; the film pushed 26px off the top with Exit half off
  the bottom).
- `check.js`, `check-const.js`, `check-css.js` (no new finding: the `vh` fallbacks it called dead were taken
  out — the app's full screen is only drawn where `dvh` exists), `check-doors.js` (227 handlers),
  `check-loading.js`, `check-films.js`, `check-strings.js`, `check-drafts.js`: green.
  `check/press.js --screen=games`: 102 presses, every swipe landing, nothing quiet but the three known.
  Once, run at the same time as `check/ui.js` and `check/cascade.js`, it reported the four `New game` /
  round-game presses (`c4-again`, `oth-again`, `rg-next`, `rg-again`) as quiet — the `widgetsLater_` timing
  note 311 records on the base commit as well; run alone, twice in a row, it was green both times. Load.
  `check/cascade.js`: nothing decided by file order alone.
- **Looked at**, from `check/ui.js --shots` and the proof: the idle bar at 320 and 390 (a heading and the
  pill, nothing under it); four results and the line at 320, 390 (admin, with the Sync row at the foot) and
  1280; one playing at 320 and 390 (player, two-line title, Full screen beside it, bar holding "photo"); the
  Drive film at 320 (Chromium's unreachable-page picture in the frame, two tiles beside the clamped title);
  the full screen at 320, 390 and 1280 (black glass, the film the width, Exit under its right corner; at 1280
  beside it) and at 390x844 and 844x390 from the proof; the loader at 320 and 390 under "held"; the admin's
  films at 320 and nobody's at 320 ("No videos listed yet."). Every title and id in them was made up.

### After the review (10–11 Oct): four findings, each reproduced first, each fixed at its cause

The review walked the card in Chromium with a real finger and a real keyboard and found four things
between what jsdom can see (no layout, no top layer) and what `check/ui.js` can see (one snapshot a
state, at five sizes none of which is a phone on its side). All four were reproduced on `920afde`
before anything was changed, with the reviewer's probes and then with the new check below.

**1. THE BAR JUMPED UNDER THE TYPING FINGER.** The column holds a card somebody is using by its top
(`HOLD_AT`, shell.js) and lifts it only as far as it must to stay on the glass. The first letter took the
card from the bar alone (about 84px) to four results (about 400px), so the column lifted it; "sunse"
narrowed to one row, the card shrank, and the column put it straight back down — in the middle of a word.
The bar's top, keystroke by keystroke for "sunset" and back: **311 → 182 → 182 → 182 → 182 → 311 → 311 →
311 → 182 …** at 320x568 for an admin (129px both ways); 54px for a visitor at 320; 88px at 844x390; 30px
for an admin at 390x844. The old card never did it: it started tall (the whole list) and only shrank, and
YouTube's bar stays where it is.
*Fixed in `vidPaint_` (`vidHold_`):* while a copy shows results (or the loader in their place), its
`.vid-results` is held at the tallest it has been in this search — `minHeight` in its own px, which
`offsetHeight` is (it is not scaled by `paneReach_`'s zoom; measured in Chromium 141) — so the card can grow
under the finger and never shrink. The room a narrowed search leaves is left under the results, where
YouTube leaves it, and an admin's Sync row stays at the foot of the card. A search that begins by leaving a
film (an edit over the watch view) is given the height the film had — read from the box before the paint —
so its first letter does not drop the bar either: on its side (844x390) the watch view is lifted, and the
one short row that replaced it dropped the bar 82px without this. Reading the film's height from the box
needed one more line: the watch block's bottom margin collapsed out through the box and the card into the
pane, so the box read 8px short and the bar still dropped 2px at 320x568; `.vid-box { display: flow-root }`
keeps that margin inside the box (the pane is the same height either way — 391px measured with and
without). **Let go** when the search ends: the box emptied (the bar alone), a result tapped (the watch view
is a new page), or the column left (`videosStop_`). Not when Search is pressed. *Not chosen:* ratcheting
`HOLD_AT.top` up in shell.js once a focused card has been lifted — it would have fixed this for every card
with a field, and changed how the funnel, the essay and the keypad's lift behave, which nothing here asked
for. Now: 182 at every keystroke at 320x568 admin, 234 visitor, 116 at 844x390, 422 at 390x844.

**2. THE KEYBOARD'S SEARCH KEY DID NOTHING.** The box says `enterkeyhint="search"`, so a phone shows a Search
key, and nothing answered it: the focus stayed in the box and the keyboard stayed up — over the four
results, which on a phone sit exactly where the keyboard is (y 480 to 768 at 390x844). The `vid-play`
comment called `blur` "the box letting go, the way pressing Search does", and nothing made pressing Search
let go. *Fixed:* one `keydown` listener on the document — Enter in `.vid-q` (not mid-composition) is
`preventDefault`ed and the box blurred. The results, the words and the held height stay as they are.

**3. THE APP'S OWN FULL SCREEN ON ITS SIDE HAD NO COMMITTED CHECK.** The proof at 390x844 and 844x390 above
lived in a scratch script; `check/ui.js` measures 320x568, 390x844, 768x1024, 1280x800 and 1920x1080, and
at none of them does `paneReach_` zoom the card in the full-screen state. So `.pane > :has(.vid-watch.is-fs)
{ zoom: 1 !important }` could be deleted with every check green: `ui.js --screen=games` "nothing NEW",
while at 844x390 the Exit tile was 31x31 and the film 485x273 (693x390 with the rule). *Fixed by committing
the proof* — `check/videos.js`, below — rather than by growing `ui.js`'s sizes for one state.

**4. ONE TAP BUILT TWO PLAYERS WITH THE CARD STARRED.** `vidPaint_` gave every `.vid-box` the same
`vidPlayer_(playing)`, so the copy on the Saved column — parked off the glass — got an `autoplay=1` embed
too (and for an admin's film, a second Drive `/preview`): a hidden player beside the one being watched,
doubled sound wherever a browser lets one autoplay with it, for as long as the person watched. True before
this branch as well; the rewrite was the place to fix it. *Fixed:* `VID.in` is the id of the column the
tapped copy is on (`vid-play` sets it), and only the box on that column is the watch view; every other copy
shows the results for what is typed with an empty stage. A tap in the other copy moves the one player there;
an edit in either stops it everywhere. A film started without a tap (a check's state setting `VID.at`) is
given the copy on the column in front, once, so a later paint never moves it and restarts it.

### Checked, after the review

- **`check/videos.js`, new, on check-all's roster** (`npm run videos`; `VIDEOS_PORT`, else a free port). In
  Chromium, every list, player and picture served by the check itself: **hold** — the bar's top after every
  keystroke of "sunset" and Backspace back to "s", at 320x568 (both visitors), 844x390 and 390x844, never
  lower than the keystroke before, and "sunset" tapped then a letter taken off over the film not dropping
  it either; **search** — a real Enter takes the focus from the box and the four
  results, the words and the bar stay; **one** — the card starred, one real click in the Saved copy is one
  frame, in `s-saved`, one request to the player's host, and the Games copy shows the results; **full** —
  the Fullscreen API deleted before any app script runs, the tile pressed by a real click, at 390x844,
  844x390 and 320x568, each turned to the other orientation while on and back: the block is the viewport
  and every corner and the middle land in it, the film is 16:9 and as large as the room allows (390x219
  upright, 693x390 on its side, 501x282 at 568x320), Exit is 44x44, on the glass and off the picture, Escape
  gives the screen back, and **the frame loaded once** through all of it. 19 measurements, about a minute.
- **Red before, green after.** On `920afde` with only the new check copied in: hold red at all four sizes
  (129, 54, 88 and 30px), search red, one red (2 players, 2 requests, the other copy blank). On this commit:
  nothing found.
- **Seven mutations**, each in a throwaway copy of the final tree, each red for its own reason, the real
  files untouched and green: the zoom rule deleted — `full` red at 844x390 (Exit 31px, film 485x273), at
  390x844 turned on its side and at 568x320; `vidHold_` returning at once — `hold` red at all four sizes
  (129, 54, 88, 30px); the film's height not given to the edit that leaves it — `hold` red, 82px at 844x390;
  `flow-root` taken off — `hold` red, 2px at 320x568; the Enter listener not blurring — `search` red, and
  check-flow red; every copy the watch view again — `one` red (2 players, 2 requests), and check-flow red;
  the watch block moved inside the box before `showPopover` — `full` red, "the player's frame loaded 2
  times".
- **`check-flow.js`**: the first videos journey asks Enter too (the focus leaves the box, four rows and
  "clip" stay); a new journey, **the card starred into Saved** — signed in, both copies drawn, "volc" in the
  Saved copy finds both rows in both copies, a tap in Saved is one player in `s-saved` with Full screen and
  the Games copy the results with an empty stage, a tap in Games moves it, an edit in Saved stops it
  everywhere. Both red on `920afde`. **All 274 journeys pass.**
- `check.js`, `check-const.js`, `check-css.js`, `check-doors.js` (227 handlers), `check-loading.js`,
  `check-films.js`, `check-strings.js`, `check-drafts.js`: green. `check/ui.js --screen=games`: 250
  combinations, nothing NEW. `check/press.js --screen=games`: 102 presses, 95 swipes all landing, nothing
  quiet but the four known Imposter ones. `check/cascade.js`: nothing decided by file order alone.
- **Looked at**, in Chromium: 320x568 admin at "sun" (four, "1 more — keep typing to narrow", Sync row) and
  at "sunset" (one row, the bar where it was, the room under the row, the Sync row at the foot); the same
  after Enter (no focus ring); the watch view at 320; an edit after the film (the bar where the film left
  it); 390x844 visitor at "sunset" after Enter; the Saved copy drawing four results; and `ui.js --shots` after
  `flow-root`: the idle bar at 320, four results at 390, one playing at 320, the full screen at 390 — as
  before. Every title and id in them was made up.
