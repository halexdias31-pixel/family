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
| **the count** | "3 of 12 videos" stays — a count rather than a silence — smaller and fainter, between the box and the list |
| **a row** | a 16:9 picture (8px corners, YouTube's) at 42% of the row on the left, then the title in bold, **two lines at most** and clamped, then one dim line. No rules between rows — YouTube separates with air |
| **the badge** | bottom-right of the picture, YouTube's duration spot: the row's kind — **only the word the viewer already saw on that row**, so a student's rows say Clip and only an admin's say Film, Series or Documentary. A row that opens Drive in a new tab carries a small out-arrow in it |
| **the dim line** | what the row already said after its kind: the year and a series' seasons (both were on the row, searched through `tags`, and never said), the age, and "opens in a new tab" or "not in the Drive yet" |
| **the playing row** | a `Playing` veil over its picture, the title gold (`.on`, as before), `aria-current` |
| **a row that opens nothing** | still a `<div>`, not a button; its picture and title dimmed |
| **when something plays** | the watch page in miniature: the player, then its **title** (bold, two lines), then one dim line (kind · age), then the Full screen tile |
| **when nothing plays** | no stage and no Full screen tile — YouTube shows the list, not an empty player |
| **the admin's row** | unchanged: the silver Sync from Drive tile and its sentence, admin only, between the player and the count |

### The pictures

- **A YouTube row's** is `https://i.ytimg.com/vi/<id>/mqdefault.jpg`, 320x180, already 16:9.
  `i.ytimg.com` is YouTube's cookieless image host — the still-picture half of the nocookie bargain the
  embed already made — and `referrerpolicy="no-referrer"` keeps this page's address out of the request.
  `loading="lazy"` (forty rows, most of a column parked off the glass), `decoding="async"`, `alt=""`
  (the title is the text beside it).
- **A Drive film's** is `https://drive.google.com/thumbnail?id=<file id>&sz=w320`, the id read in the
  phone from the row's Drive address. `drive_id` is still never sent (068); the address it is built into
  is the one fact the row carries. **A series is a folder and gets no picture** — Drive has none of a
  folder.
- **The poster is under every picture, always**: a gold-touched block in the card's own colours with
  the kind's mark (a play mark for a clip, a film strip for anything from the folder) and the title's
  first letter, sized by the picture (`cqi`) so it is the same share of a 91px picture at 320 as of a
  grid card. It is what shows while a picture loads and what is left when one fails. Drive's fail
  often — no thumbnail for many big video files, none once the folder's sharing changes, none where the
  browser keeps Google's cookies from this site — so **a failed picture is taken away by one listener**
  on `document`, in the capture phase because `error` does not bubble. It swaps a class (`is-gone`) and
  remembers the address for the visit (`VID_BROKEN`), so the next keystroke's repaint draws the poster
  straight away instead of asking again. No `onerror` written into the markup: a script string built
  beside a title is a door this codebase keeps shut.

**A ROW IS A LIST ITEM, NOT A TILE**, and the comment over it says so for the reader who knows "a thing
has tiles": the row IS the thing, pressed the way a YouTube result is pressed, and a tile is an action
under a thing. Rows stay the `<button>` (plays here) and `<a>` (opens Drive) they were; Full screen
stays a tile.

### The grid is written, and no card is wide enough for it yet

The brief was a compact row on a phone-width card and **a grid of cards on a wide one**. The box is a
named container (`vidbox`) and the grid is there — `repeat(auto-fill, minmax(14rem, 1fr))`, the picture
on top, from 30rem — **but measured on 9 October the card is never that wide**: 217px at 320, 271 at
390, 376 at 768, 341 at 1280, 303 at 1920. A column is a phone-width card on every screen, wider
windows show more columns rather than wider ones, and the Saved column draws the card at the same 271.
So every width today gets the compact row, which is what YouTube itself draws in a column that size
(its watch page's "up next" list, about 400px). The grid was drawn once to prove it, by putting a copy
of the admin's card in a 640px box: two columns, pictures on top.

### What the marks are

Three marks went into `TILE_ICONS` (tiles.js), at the set's 1.4 stroke so the card reads as one app: a
**magnifier**, a **film strip** and a **box with an arrow leaving it** — not `out`, which is a door frame
and means sign out. `tileIcon_` draws them; none of them is on a tile.

### Colours

Every colour the card uses alone is declared on `.vid-box` (`--vid-black`, `--vid-scrim`, `--vid-veil`,
`--vid-poster-a`, `--vid-poster-b`, `--vid-poster-ink`), each a mix of the `:root` tokens except the
player's letterbox, which is black because every player's is. No colour is written anywhere else. A
press dims the picture while the finger is on it; nothing moves, so there is nothing for
`prefers-reduced-motion` to take away.

### Left alone, on purpose

- **The loading state** — "Looking for videos…" and how it is decided — is untouched: the shared
  loader for every widget is another piece of work (306–310), and it owns that line.
- **Not all of YouTube.** The box still searches what is listed; a live YouTube search needs an API key
  in a public page, which is the owner's decision and has not been taken.
- Every behaviour: the box never rebuilt on a keystroke; the player rebuilt only when the playing row
  changes (the title and the tile under it are written only when they change, too); forty rows and
  then "N more — type to narrow the list."; `videosStop_` emptying the player; the films sync; the
  admin gate; no word on a student's card that says films exist.

### Checked

- **`check-flow.js`**, the videos journey extended: the YouTube row's picture is its `i.ytimg.com`
  mqdefault, `alt=""`, lazy and no-referrer, with a poster under it and a `Clip` badge; an `.mp4` row
  has no picture and a poster with its letter; nothing playing draws no player, no Full screen tile and
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
- **Screenshots**, with `i.ytimg.com` and `drive.google.com` refused so every picture falls to its
  poster: a student with one invented clip, an admin with twelve invented films and the clip, and the
  admin after tapping the clip, at 320x568, 390x844 and 1280x800 — and the same three at 390 before.
  Nothing scrolls sideways at any of them. Every title and id in them was made up for them.

### Worth knowing

- **The card is taller.** A picture makes a row about twice the height of a line of text, so an
  admin's list of twelve is drawn at the 0.7 floor (`paneReach_`) and the pane scrolls, where the text
  list was drawn at 0.8. A student's one clip is unchanged in size.
- **Not seen against the real hosts.** This sandbox reaches neither `i.ytimg.com` nor Drive, so the
  pictures were drawn with stand-ins served in their place and the posters with both hosts refused. The
  first look at a real thumbnail is the owner's phone.
