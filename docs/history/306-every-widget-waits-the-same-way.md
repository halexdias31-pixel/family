## Every widget waits the same way: one loader, three gold dots

**The owner, 9 Oct:** *"Every widget has unique loading look. They should all have a simplistic simple
loading thing while it's info or whatever is loading. E.g."* — the message ends there; no example came
through.

### What there was

Measured on 9 Oct at 390x844 against `check/fixture.json`, with the payload, the POSTs, the `data/`
files, the camera and the widget start queue each held open in turn (the survey's probes). **Twenty-four
ways of saying one thing:**

| | where |
|---|---|
| a skeleton post (face, 4:5 picture, two bars, pulsing) | the feed, the reel, Messages — `skeleton()` in me.js |
| ten waiting sentences in thirteen places | "Starting the camera…", "Looking in the folder…", "The questions are still coming", the Bible's "…is on its way" and "Opening the list of books…", a verse that was a faint "…", "Fetching what is recorded…" on five records cards, "The hours have not arrived from the server yet", "Scores have not arrived yet" on two boards, "Looking for videos…" |
| two empty results drawn while still waiting | the Shop said "Nothing in the shop yet", Spotlight "Nothing is being featured just now" — both checked `LOAD_FAILED` and never `LOADED` |
| seven waits with nothing on the screen at all | the booking form (every row "—", no tutor, Cost "–"), the account column (your card, then the rest appearing under you), Find's first question without the payload's answers, the calendar with no marks, the flyer pricing off a fallback room rate, Saved saying "Nothing kept yet" before the stars had come |
| nineteen widgets, each with its own unstarted look | a grey board (Connect 4, Othello), a black canvas (Flabby Pird), an empty cream board (Scrabble), an empty grid (Maze), an empty dropdown (Word Search, Sentence Scramble), "‹ Calendar ›" with no month, and a heading on its own (Videos, the cheat-sheet maker, the hours, Timetable, Touch typing, Check uploads) |

Every one of them was somebody solving the wait in front of them. That is how they got to be different,
and it is how the next one would arrive — so the fix is one thing to draw and a check that fails on
anything else.

### What was built

**`loading_()` in shell.js returns the one loader** — `<div class="loading" role="status"
aria-label="Loading">` and three empty spans — and **one block in style.css draws it**: three dots in
`var(--gold)`, `.55rem` across with `.5rem` between, pulsing in turn (each lit for four fifths of a
1.2s turn, a sixth of a turn behind the one before, so one is always brightening), opacity and a little
scale only. Under `prefers-reduced-motion` they are three still dots at .7 — still there, because the
state is the thing being shown. Sizes in `rem`: nothing in it is pressed. In shell.js because it loads
before every file that draws a card.

**Dots, not the ring.** `.btn.is-busy` and `.tile.is-busy` already spin a ring for a press that has gone
and not come back (094). That is "pressed, and working on it", a different sentence from "on its way",
and two meanings get two shapes so neither can be mistaken for the other.

**One markup, three ways of sitting, and the CSS reads which from where it is:**

- **In place** of the part of a card that is not there yet — a verse, a score board, the hours, the
  Bible's question, the folder's pictures, the camera's viewfinder. It holds `3rem`, about two lines, the
  size of the sentence each one replaced, so nothing shrinks round it.
- **A whole page** — the loader the only thing on a pane: `.pane:has(> .loading:only-child)` is the
  whole cell, the most a card can be, with the dots in its middle. The feed, the reel, Messages, the
  booking form, the Shop and Spotlight before the payload, the page after your own card on the account
  column, and the page after whatever Saved can already draw. The skeleton existed so a post would land
  in the room it was keeping; this keeps the most room a card can have.
- **Over markup already drawn and not ready** — the box gets `aria-busy="true"` and the loader as its
  last child. What is under it keeps its exact size and is `visibility: hidden` (not `display: none`,
  which would take the height with it), so it cannot be seen, focused or typed into, and the dots sit
  over its middle. **`loaded_(el)`** takes it off. This is the one that holds a card exactly, and it is
  used wherever the markup can be drawn before the content:
  - every widget with a `start`, until it has started — `widgetOnColumn_` draws it veiled and
    `widgetUp_` (arcade.js) takes the veil off after `start`, in a `finally` so a widget that threw is
    not left under a wait. The three copies of "start a widget" in `widgetsWake_`, `widgetsLater_` and
    `widgetsNear_` are that one function now, and it finds the slot on the column being started rather
    than `$()`'s first — a starred widget is drawn on Tools and on Saved at once;
  - the business records — the boxes and Save, until `listRecords` answers; `bizFill_` fills them and
    takes the loader off in one go, so they appear filled rather than empty and then filled. The
    "still fetching" toast became "The records are still on their way";
  - the Videos card, until `data/videos.json` is in (and, for an admin, the payload's films): search box,
    count line (held at one line by a space) and list, drawn and veiled;
  - the calendar's month until the payload's marks are in; the flyer maker's controls until the venues
    are (it would otherwise price a seat off the fallback room rate of 15).

**Only the card in front moves.** A column drawn beside the one you are on holds a loader on every widget
it has not started — nine on Tools — and an infinite animation runs whether anybody can see it or not.
Found by `check/ui.js`: with nine loaders breathing on the next column, the Imposter card's own walk
through its screens took 1.3–1.5s against 1.08s, and the state that measures it missed its 2.5s at 1920.
`.page:not(.on) .loading > span { animation: none }` — a loader on a card that is not in front is three
still dots, and the page that comes in front starts it. A sheet's loader always moves. Measured after:
0 animations running behind the Imposter card, and the walk back to 1.1–1.2s.

**A real error or an empty result is not a wait** and keeps its words: "Couldn't load … Try again",
"The camera did not start.", "Nothing new in the folder", "No videos listed yet.", "No scores yet. Be the
first.", a Bible book that "did not arrive". "Scores have not arrived yet." and "The hours have not
arrived from the server yet." stay too, now drawn only when the payload came (or failed) without them —
an older server — and never while it is on its way.

**One more change rode with it.** The reel's top-up (`reelTurn_`) appended clips behind the waiting card
while the payload was still out — measured: page 0 waiting, pages 1 and 2 clips. It waits for `LOADED`
now, so the loader is the whole column until `screen('reel')` draws the clips.

### Every wait in the survey, and what it is now

| | was | now |
|---|---|---|
| 1, 4, 5 | the skeleton on feed, reel, Messages | a whole-page loader; `skeleton()`, `.sk-box`, `.sk-pic` and `@keyframes sk` are gone |
| 2 | "Starting the camera…" | the loader in the viewfinder; the refusal keeps its sentence (`camFailed_` writes the panel whole). And a NEW ask — `Try the camera again`, or coming back up to the page — puts the loader back and clears the old reason: it used to ask again under "The camera did not start." and the line saying why, which `check/ui.js` caught as the card moving 40px the moment the picture came |
| 3 | "Looking in the folder…" | the loader where the pictures will be |
| 6, 7 | "Nothing in the shop/window yet" while waiting | the loader; the empty sentences are for an empty payload |
| 8 | the booking form, every row "—" | a whole-page loader until the payload |
| 9 | the account column growing under you | a loader page after your card until the payload |
| 10 | "The questions are still coming" | the loader (`nothingHere`), on the Find page and under the search box |
| 11 | the first question without the payload's answers | the loader under the answers until the payload |
| 12, 13, 14 | the Bible's "on its way", "Opening the list of books…", a faint "…" verse | the loader where the question, the how-to and the verse will be; `.bb-v.is-wait` is gone |
| 15 | "Fetching what is recorded…" ×5 | the loader over the boxes |
| 17 | "The hours have not arrived from the server yet" | the loader while the payload is out |
| 18 | a month with no marks | the loader over the month |
| 19 | flyer priced off a fallback rate | the loader over the controls |
| 20 | "Scores have not arrived yet" ×2 | the loader while the payload is out |
| 21 | "Looking for videos…" | the loader over the card |
| 24 | nineteen unstarted looks | the loader over each slot until `start` |
| — | Saved's "Nothing kept yet" before the stars (not in the survey's list of WAITs; its count) | the loader after whatever Saved can already draw |

### What was left, and why

- **Row 16, your settings refreshing from the sheet (`profileRefresh_`).** The boxes are drawn from the
  device's own copy — real content, not a wait — and the refresh is a background sync like `myAnswers`
  (row 38). The one moment it matters, a Save, already answers in the card's own line.
- **Row 22, the films' Sync from Drive.** A sync the card started, over a list already showing, on the
  shared busy ring — section C, a press in flight.
- **Rows 23 and 25–32, pictures decoding in place** (One more thing's photo, post pictures, the tutor
  gallery, the heat map's tiles, reel posters, the player, question figures, thumbnails, avatars). The
  words are already there and each box already holds its picture's room (an aspect ratio, a gradient
  with an initial, a fill); dots over every photograph would flash on a fast line for a frame and say
  nothing on a slow one that the box does not.
- **Rows 33–38, presses already sent** — `send_`'s ring and its word ("Saving…", "Sending…", "Checking…"),
  the bare busy labels, the save-status lines, AI marking, the two toasts. An action in flight, not
  content on its way; the ring is docs/history/094's and stays. `check-loading.js` accepts `btn-spin` by
  name for exactly this.
- **The splash** (`#splash`, its slow line and the 30-second banner) — the loading SCREEN, deliberately
  animated and its own thing. `mb-spin` is a coin in one of its pictures, accepted by name.
- **Find pages filled a beat late** (`STUFF_NEAR`/`STUFF_LATE`, blank for one frame on a long flick). A
  loader drawn for one frame is a flash, not a wait, and writing markup into five thousand placeholder
  panes is cost on the hot path the owner reported as a glitch on 8 Oct.
- **The timetable** draws the week you wrote, from the device; booked sessions are added over it when the
  payload lands. Content, not a wait.

**What the veil cannot do, measured:** it holds the size of a widget's MARKUP, and a widget whose `start`
draws more than its markup grows when it starts — Word Search 307→530px at 320, the cheat-sheet maker
161→529, Videos 160→439 (the pane, before → after `start`). Scrabble, Maze, One more thing, the timer and
the notepad do not move at all; Connect 4 and Othello grow by their status line (17–18px). That growth is
the widget's own drawing, and the task was to change what is drawn while waiting and nothing else; the
loader adds nothing to it.

### And after the merge with the integration branch (499ff0c), the same day

The branch this was built on was merged with the day's other work — the Videos card made to look like
YouTube (311), the essay sheet (312), the quiet retry (313), coursework (314), autosave (317), keeping
Find's place (318), the YouTube reel (319), the whiteboard and reactions (307, 310) and the Progress
column (320). Read for waits of their own:

- **The quiet retry brought one.** While the app asks the backend again, every empty column said
  *"Waiting for the server. The app is asking again by itself, and this fills in when it answers."* —
  right about the state, and a twenty-fifth waiting sentence on the day the owner asked for none. It is
  `loading_()` now (`nothingHere`, shell.js). The words are not lost: the quiet line over the app,
  `#reconnect`, says "Reconnecting…" once for the whole app, and the columns under it wait the way every
  card waits. "Waiting for the server" is on `check-loading`'s list of old phrases, and the retry's
  journey in `check-flow` asks for the loader on the Spotlight column (empty for everybody until the
  payload lands — a visitor's Feed is the camera and "Sign in") instead of the sentence.
- **`#reconnect` itself is left**, for the splash's reason: it is the app's own line about the
  connection, one per app and `role="status"`, not a card drawing its wait — the same family as the
  splash's slow line and the 30-second banner, which the survey left.
- **The whiteboard** is a widget with a `start`, so it waits under the veil like the other nine on Tools
  with nothing written for it — the journey's list of Tools widgets left under the loader names it when
  the veil is not taken off.
- **The YouTube reel's poster under a veil** (319) is a picture standing in its own room while the player
  behind it loads — media, rows 23 and 25–32's reason.
- **The skeleton had been given a pill-round bar for the reactions' row** (307) the same day. It went
  with the skeleton; the reactions keep their own row once the post is drawn.
- **The essay's marking, autosave's "Saving…" lines and the coursework card** are presses in flight or
  content already drawn, not waits — rows 33–38.

### The checks

- **`js/check-loading.js`** (new, on check-all's roster after `check-css`). Reads every app file's strings
  with acorn's tokenizer — never a comment, so the prose here can quote the old words — and style.css,
  and fails on: an old waiting phrase ("Loading…", "Looking for…", "Looking in…", "Fetching", "Please
  wait", "Starting the camera", "still coming", "Opening the list", the Bible's "books is on its way",
  "have not arrived yet" except where `scoreBoard_` has just drawn the loader for the wait); a waiting
  class in markup or through `classList`/`className` (skeleton, shimmer, spinner, `sk-*`, `is-wait`,
  `is-loading`, `loader*`) or `loading` itself written anywhere but `loading_`/`loaded_`; an inline
  animation naming a waiting keyframe; in style.css a rule for one of those classes, a `.loading` rule
  outside its block, or a `@keyframes` named for waiting (spin, load, wait, pulse, busy, shimmer,
  skeleton, sk) outside it; and the contract — `role="status"`, `aria-label="Loading"`, three dots, the
  block in tokens and `rem` with a reduced-motion rule — and at least fifteen callers of `loading_()`
  (there are 25 after the merge) and one of `loaded_()`. **Mutations, each on a copy of the files, each
  red, re-run after the merge:** the retry's "Waiting for the server" back in `nothingHere`, a waiting
  sentence back on the folder sheet, "Fetching what is recorded…" back on the records, "Loading…" in a card, the loader copied by hand, a skeleton
  post, `classList.add('is-loading')`, an inline spin, a shimmer keyframe inside the block and a spinning
  one far outside it, a `.loading` rule outside the block, a colour literal, a px size, the animation
  left on under reduced motion, no `role`, no label, two dots, `.bb-v.is-wait` put back, and every caller
  moved off — nineteen, and a control copy with nothing changed, green. Green on the real files after.
- **`check-flow`: "a widget waiting on its fetch shows the one loader and nothing else, and its content
  replaces it".** Three waits held and let go through the harness's own doors: the Videos card with
  `data/videos.json` held (`serve`), the Tools column's widgets drawn beside Games and not started, the
  business records with `listRecords` held (`reply`). Each: exactly one loader, the contract on it, none
  of the old words or classes beside it, over markup already drawn; released, the content where it stood
  and no loader. **Seven mutations, each red:** the queue never taking its veil off, the Videos card
  drawing no loader, "Looking for videos…" put back beside it, the Videos veil left on, the records' veil
  left on, a widget drawn with no veil, two loaders on one card — each re-run after the merge, four at a
  time beside `check/ui.js`, each red with its own line and only its own, and a control copy green. That
  last part took a change: under that load the card was still unstarted 150ms after the turn and the
  records' answer not yet painted 120ms after it came, so a mutation of one wait was also reported as a
  fault in the other two. The journey now waits for what it is about to read, bounded (fifteen seconds
  for the card to start, five for each answer to land), the videos journey's own idiom; a loader left on
  for good still fails, five seconds later. The retry's journey (above) is the eighth: the sentence put
  back, red for a student and a visitor. The Bible journey's pins moved from
  `.is-wait`, "on its way" and "still coming" to the loader.
- **`check/states.js` + `check/ui.js`.** Three widgets held on a real request: **settings · the business
  records still coming** (the `listRecords` POST), **games · the videos still coming** (`data/videos.json`,
  a stranger's — an admin's card has films and never waits), **feed · the camera still starting**
  (`getUserMedia` held as an open prompt holds it, after any refusal still in flight from the state
  before has landed; released with a canvas's `captureStream`). Each has `release` and `landed`; `leave`
  drops what it held rather than delivering it, because `check/press.js` never releases.
  `the library still coming` expects the loader now, and the Bible states read `.bb-v` with no loader in
  its card instead of `:not(.is-wait)`. `ui.js` measures **every loader on the page in front, in every
  state**: the one loader (role, three dots); its dot size and centre-to-centre pitch against
  `loading_()` drawn on the same page outside every card (the app's own size, not a number written in
  the check; the pitch divided back by any `zoom` `paneReach_` put on a shrunk card); the dots centred in
  their box and the box centred across its card (1.5px); one size per width across the whole run; and,
  for a state that can release, the card's height with the loader on it and again once `landed` — more
  than 2px apart is the card jumping when its content arrives. A held state that shows no loader fails
  as unreached. **Five mutations, each red on a copy:** the veil hiding with `display: none` (the
  Insurance card 129px waiting and 483px landed — "it moved 353.7px"), the Videos card's dots drawn at
  `.9rem` ("13x13 … where `loading_()` draws 8x8"), the camera's dots pushed to one side (-115px), the
  Videos veil never taken off ("never landed"), and the records drawn with no loader ("NOT measured").

  **IT FOUND TWO THINGS ON ITS FIRST RUN.** The camera card moved 38–40px when the picture came: a new
  ask kept the last refusal's reason under the viewfinder until the stream replaced it — fixed in
  `camStart_` (above). And the Imposter state at 1920 timed out with nine loaders animating on the next
  column — the `.page:not(.on)` rule (above).

- **`check/ui.js` and `check/press.js` wait for the app, not for a guess at it.** Every column is the
  loader until `load()` finishes, so a screen measured before then is a column of loaders measured as if
  it were the column. Both waited a fixed 1.7–2.2s after `goto`; on 9 Oct, at a load average of sixty,
  that was the splash at 1920 and a shop with "no shelf of things". Both now wait for `LOADED` and the
  library (bounded at 30s, then on), which on a quiet machine is the same 1.8s it always was.
