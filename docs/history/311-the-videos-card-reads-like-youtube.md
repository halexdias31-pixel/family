## The videos card reads like YouTube: a pill to search in, a picture on every row, and the watch page when something plays

**The owner, 9 Oct:** *"Can you also make the video serger widget look more like YouTube."*

### What it looked like

A square search box reading "Search videos…"; under it a list of titles in plain text, one line of
small print each ("Film · opens in a new tab"), ruled off from each other like a settings page; and,
once a row was tapped, a black 16:9 box with a Full screen tile under it. Nothing on it was a picture.
While nothing played, the card still held an empty stage (hidden) that said "Tap a video to play it
here." and a Full screen tile drawn DISABLED — a control for a thing that was not there.

### What it is now

YouTube's **shapes and type**, in this app's **black and gold**. No logo, no wordmark and nothing red:
it should read like YouTube and not pretend to be it — and here red only ever means something is wrong
(the note over `--bg`), so a red play mark on a list of cartoons would be a warning nobody meant.

| | |
|---|---|
| **the search box** | a pill (fully rounded) with a magnifier inside it on the left, placeholder `Search`. Still the one `<input class="vid-q" type="search">`, built once per copy and never on a keystroke; its accessible name is still "Search videos". 16px type and the 44px floor, as every box in the app |
| **the count** | "3 of 12 videos" stays — a count rather than a silence — exactly as it was drawn before: the same `.vid-said` rule, untouched (see "Left alone") |
| **a row** | a 16:9 picture (8px corners, YouTube's) at 42% of the row on the left, no wider than 7rem, then the title in bold, **two lines at most** and clamped, then **one** dim line, clipped. No rules between rows — YouTube separates with air, and the air is the row's own padding, so it is part of the target |
| **the badge** | bottom-right of the picture, YouTube's duration spot, **only when it tells the row from its neighbours**: Film, Series or Documentary on an admin's rows from the folder, and a small out-arrow on a row that opens in a new tab (named "opens in a new tab" for a screen reader). A plain clip has none — "Clip" was the same word on every row a student is shown |
| **the dim line** | what the row already said after its kind: a placeholder's reason first ("not in the Drive yet"), then the year and a series' seasons (both were on the row, searched through `tags`, and never said), then the age. One line, with an ellipsis. "Opens in a new tab" is the badge's arrow now, not words here |
| **the playing row** | a `Playing` veil over its picture, the title gold (`.on`, as before), `aria-current`. The veil's word is hidden from a screen reader, which hears `aria-current` instead |
| **a row that opens nothing** | still a `<div>`, not a button; its picture and title dimmed |
| **when something plays** | the watch page in miniature: the player, then its **title** (bold, two lines) and one dim line (kind · age), with the Full screen tile **beside** them, on the title's row, where YouTube keeps its controls |
| **when nothing plays** | no stage and no Full screen tile — YouTube shows the list, not an empty player |
| **the admin's row** | unchanged: the silver Sync from Drive tile and its sentence, admin only, between the player and the count |

### The pictures

- **A YouTube row's** is `https://i.ytimg.com/vi/<id>/mqdefault.jpg`, 320x180, already 16:9.
  `i.ytimg.com` is YouTube's cookieless image host — the still-picture half of the nocookie bargain the
  embed already made — and `referrerpolicy="no-referrer"` keeps this page's address out of the request.
  `loading="lazy"` (forty rows, most of a column parked off the glass), `decoding="async"`, `alt=""`
  (the title is the text beside it).
- **THIS IS A CHOICE FOR THE OWNER, SAID PLAINLY BECAUSE THE VIEWERS ARE CHILDREN.** Before this note
  nothing on a device reached any YouTube host until a row was tapped. Now **opening the card** fetches
  one picture per YouTube row from `i.ytimg.com`, before any tap: no cookie and no referrer, but the
  device's address reaches Google. Taking it back is one line — `vidThumb_` answering nothing for a
  YouTube row — and every row is the poster.
- **A Drive film's** is `https://drive.google.com/thumbnail?id=<file id>&sz=w320`, the id read in the
  phone from the row's Drive address. `drive_id` is still never sent (068); the address it is built into
  is the one fact the row carries. **A series is a folder and gets no picture** — Drive has none of a
  folder. **Only a row from the films list asks** (`fromFilms`, set in `videosAll_`): the films list
  reaches an admin alone, but a Drive address the owner types into `data/videos.json` reaches every
  child, and `drive.google.com` carries Google's cookies where `i.ytimg.com` does not. The first version
  asked for any row with a Drive address, so a student's phone would have called Drive the moment the
  card drew; today's `videos.json` has no such row, so it was latent. An owner's Drive row is the poster
  for everybody.
- **The poster is under every picture, always**: a **flat neutral frame and the kind's mark** — a play
  mark for a clip, a film strip for anything from the folder — and nothing else, which is what YouTube
  draws for a missing picture. It is what shows while a picture loads and what is left when one fails.
  It was first drawn as a gold gradient with the title's first letter in it, and that was the one thing
  on the card that did not read as YouTube: it read as a contacts list, and initials tell rows apart
  badly (two T's in an admin's fourteen; a column of identical I's for forty-two "Invented Film Number"
  rows). Drive's pictures fail often — no thumbnail for many big video files, none once the folder's
  sharing changes, none where the browser keeps Google's cookies from this site — so **a failed picture
  is taken away by one listener** on `document`, in the capture phase because `error` does not bubble.
  It swaps a class (`is-gone`) and remembers the address for the visit (`VID_BROKEN`), so the next
  keystroke's repaint draws the poster straight away instead of asking again. **Sign-out empties it**:
  a Drive address there is a film's file id. No `onerror` written into the markup: a script string built
  beside a title is a door this codebase keeps shut.
- **YouTube fails without an error.** An unknown, removed or private id answers 404 *with a picture*, a
  grey 120x90 one, which a browser draws and calls loaded: `error` never fires, and a flat grey block
  covered the poster. So a second listener, on `load`, takes away an `i.ytimg.com` picture 120px wide or
  less — `mqdefault` is 320 whenever the video exists. YouTube's host only: Drive's picture of a small or
  portrait file can honestly be narrow.

**A ROW IS A LIST ITEM, NOT A TILE**, and the comment over it says so for the reader who knows "a thing
has tiles": the row IS the thing, pressed the way a YouTube result is pressed, and a tile is an action
under a thing. Rows stay the `<button>` (plays here) and `<a>` (opens Drive) they were; Full screen
stays a tile.

### No grid, because no card is wide enough for one

The brief was a compact row on a phone-width card and **a grid of cards on a wide one**, and the first
version wrote the grid — a 30rem container query, `repeat(auto-fill, minmax(14rem, 1fr))`, the picture
on top. **Measured on 9 October the card is never that wide**: 217px at 320, 271 at 390, 376 at 768, 341
at 1280, 303 at 1920. A column is a phone-width card on every screen, wider windows show more columns
rather than wider ones, and the Saved column draws the card at the same 271. It applied at no width
anybody has, nothing checked it, and it shipped to every phone, so the review took it out. Every width
gets the compact row, which is what YouTube itself draws in a column that size (its watch page's "up
next" list, about 400px). If a card is ever wide, the grid is three declarations under a container
query on `.vid-box`, and the place to prove it is a state in `check/states.js`.

### What the marks are

Three marks went into `TILE_ICONS` (tiles.js), at the set's 1.4 stroke so the card reads as one app: a
**magnifier**, a **film strip** and a **box with an arrow leaving it** — not `out`, which is a door frame
and means sign out. `tileIcon_` draws them; none of them is on a tile.

### Colours

Every colour the card uses alone is declared on `.vid-box` (`--vid-scrim`, `--vid-veil`, `--vid-frame`,
`--vid-mark`), each a mix of `:root` tokens. The player's letterbox is **`--letterbox` at `:root`**: it was
`--vid-black: #000` on the card, while `.msg-vid` drew a clip's letterbox in a message with its own
literal `#000` — one colour used by two components, which is a `:root` token by this repo's rule. No
colour is written anywhere else. The ✕ a browser draws in a search box was Chromium's default blue, the
one colour on the card from outside the palette; it is the tiles' cross now, as a mask, in `--dim`, and
gold with the magnifier while the box has focus (Firefox draws no ✕). A press dims the picture while the
finger is on it; nothing moves, so there is nothing for `prefers-reduced-motion` to take away.

### Left alone, on purpose

- **The loading state** — "Looking for videos…" and how it is decided — is untouched: the shared
  loader for every widget is another piece of work (306–310), and it owns that line. The first version
  said so and was not quite right: it had restyled `.vid-said`, the element that draws that line, smaller
  and fainter. The rule is the base commit's again, byte for byte.
- **Not all of YouTube.** The box still searches what is listed; a live YouTube search needs an API key
  in a public page, which is the owner's decision and has not been taken.
- Every behaviour: the box never rebuilt on a keystroke; the player rebuilt only when the playing row
  changes (the title and the tile under it are written only when they change, too); forty rows and
  then "N more — type to narrow the list."; `videosStop_` emptying the player; the films sync; the
  admin gate; no word on a student's card that says films exist.

### Checked

- **`check-flow.js`**, the videos journey extended: the YouTube row's picture is its `i.ytimg.com`
  mqdefault, `alt=""`, lazy and no-referrer, with a poster under it; an `.mp4` row has no picture and
  a poster with its play mark; nothing playing draws no player, no Full screen tile and
  no hint; a failed picture is taken away and the next paint draws the poster without asking again;
  after a tap, the title and "Clip · 7+" under the player and a Playing veil on the row; a keystroke
  leaves the player's element in place. The films journey: a Drive film's picture is Drive's thumbnail
  of its file, with a poster under it; a series asks for no picture and says "3 seasons". **The kind
  moved from the first word of the dim line (`.vid-k`) to the badge (`.vid-badge`)**, so the two
  assertions that read a series' and a documentary's kind read the badge now — the only old expectation
  changed, and it was obsolete rather than loosened.
  **Five mutations**, each red, then green on the real files: the listener not taking a failed picture
  away, `hqdefault` for `mqdefault`, the title under the player renamed, the remembered failures
  ignored, `w640` for `w320`. The `hqdefault` one first landed on the comment that names the address
  and stayed green — a mutation that changes nothing proves nothing — and was redone on the code line.
  All 197 journeys pass.
  **After the review**, the journeys also hold: a plain clip has no badge; a poster is a frame and a
  mark with no letter and no word; an owner's Drive clip asks Drive for nothing and carries a named
  out-arrow, and its line does not say "opens in a new tab"; YouTube's grey 120px stand-in, arriving as
  a `load`, is taken away while a 320px picture stays; the playing row's words come first in the markup
  and its `Playing` is hidden from a screen reader; a film's line is its year alone; and Sign out
  empties `VID_BROKEN` (read through `__t.vidBroken`). **Eight mutations**, each red for its own reason
  and green again on the real files: the `fromFilms` gate removed, the stand-in width set to 12, the
  clear at sign-out removed, a letter put back, "Clip" put back on the badge, the picture put back first
  in the markup, `Playing` read aloud, "opens in a new tab" put back in the line.
  **The two videos boots wait for the card**, `partyBoot_`'s rule. Under a load average of 33-45 on four
  cores the first videos journey failed one run in two — "the card never asked for data/videos.json" —
  on the commit before the review as well as after it, with `woken_`'s bound raised to a minute as well:
  `quiet()` answered with the card drawn and not yet started. A bounded poll on `.vid-q` (and, in the
  first journey, the fetch) fixed it; three runs in a row green at load 45.
- **`check/press.js` measures full screen now**, for print's reason: its whole effect is outside the
  markup. The Full screen tile had NEVER been pressed by it — drawn disabled while nothing played, the
  state the Games column opens in, it was filed "present and disabled" there and, `done` being per
  screen, skipped in the state where it plays. Drawn only while something plays, it was pressed for the
  first time and read as quiet; now the `<video>` going full screen is what is measured, and the page
  leaves full screen after the press. Games on this branch and on the base commit, under the same
  machine load, both report the same four `New game` / round-game presses as quiet and one swipe landing
  a page short — the timing note in press.js about `widgetsLater_`, not this change.
- `check.js`, `check-const.js`, `check-css.js` (its report identical to the base commit's),
  `check-doors.js`, `check-films.js`, `check-widgets.js`, `check-payload.js`: green.
  `check/ui.js --screen=games`: 210 combinations, nothing new.
  **After the review**, all of those again, and all 197 journeys; `ui.js --screen=games` 210
  combinations with nothing new, and `press.js --screen=games` 100 presses with every swipe landing and
  nothing quiet (the Full screen tile included). At a load average of 50-57 both had first reported
  states on OTHER cards as never arriving — Imposter's, Flabby Pird's high-score board — at a different
  width each run, and `press.js` on the base commit did the same; at a load of 17-27 both were green.
- **Screenshots**, with `i.ytimg.com` and `drive.google.com` refused so every picture falls to its
  poster: a student with one invented clip, an admin with twelve invented films and the clip, and the
  admin after tapping the clip, at 320x568, 390x844 and 1280x800 — and the same three at 390 before.
  Nothing scrolls sideways at any of them. Every title and id in them was made up for them.
  **Taken again after the review**, the same set, and the reviewers' own harness on top of it: every
  picture refused, every picture served by stand-ins, and every picture answered 404 with a grey 120x90
  body; a student with five clips and an admin with fourteen rows, idle and playing, at 320, 390 and
  1280; an admin with fifty-one invented films; and the search box with a word typed in it. The posters
  are frames with a mark; the grey stand-in leaves the poster; a playing poster says Playing with
  nothing under it; the ✕ is the card's grey, and gold with the ring.

### Worth knowing: the card is taller, and what that costs a fingertip

A picture row is taller than a one-line text row, and a card taller than its pane is drawn smaller
(`paneReach_`), which shrinks every target on it. **The first version understated this.** The review
measured a student with five invented clips playing one at 390x844: the old card fitted at zoom 1 with
Full screen and the search box at 44px; the first version was drawn at 0.911 and both were 40px. The
cause was the watch block — two lines of title, its line, and then the Full screen tile on a row of its
own — plus taller rows. The tile now sits beside the title, the picture is capped at 7rem, and the space
between rows is the rows' own padding.

Measured on 9 October with invented payloads and the same harness on all three trees (`zoom` is the
card's; `rows` the smallest row on screen; the old card's rows vary with their titles, so its range is
given):

| Case | before 311 | 311 as first written | 311 now |
|---|---|---|---|
| student, 5 clips, 390x844, one playing | **1**, Full screen 44, rows 50-84 | 0.911, Full screen 40 | **1**, Full screen 44, rows 66 |
| student, 5 clips, 320x568, one playing | 0.732, rows 33-68 | 0.7, rows 36 | 0.736, rows 43 |
| student, 5 clips, 1280x800, one playing | 0.923, Full screen 41 | 0.754, Full screen 33 | 0.87, Full screen 38 |
| student, 3 clips, 320x568, one playing | 0.865 | 0.817 | 0.887 |
| student, 3 clips, 390x844, either | 1 | 1 | 1 |
| student, 8 clips, 390x844, idle | 1 | 0.983 | 1 |
| student, 8 clips, 390x844, one playing | 0.867, Full screen 38 | 0.725, Full screen 32 | 0.8, Full screen 35 |
| student, 8 clips, 320x568, idle | 0.773, rows 35-71 | 0.753, rows 39 | 0.751, rows 44 |
| admin, 14 rows, 320 / 390 / 1280 | 0.7 / 0.711 / 0.7, smallest rows 32 / 36 / 37 | 0.7, rows 36 at 320 | 0.7, rows 41 / 46 / 48 |

So: **wherever the old card kept a 44px target, this one does**, and its smallest row is larger than
the old card's smallest everywhere. Where the old card was already below 44 — a long list, or a 1280
window, with something playing — this one is up to 0.07 smaller (Full screen 35 against 38 with eight
clips at 390; 38 against 41 at 1280), and the rest of the card is the pictures. Closing that would mean
pictures about 76px wide at 390, which is a list of stamps rather than a list of thumbnails.
- **Not seen against the real hosts.** This sandbox reaches neither `i.ytimg.com` nor Drive, so the
  pictures were drawn with stand-ins served in their place and the posters with both hosts refused. The
  first look at a real thumbnail is the owner's phone.
