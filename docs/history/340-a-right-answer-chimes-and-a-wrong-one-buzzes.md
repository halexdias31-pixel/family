## A right answer chimes and a wrong one buzzes: once, from the press, through one player, with a sound switch on the card

**The owner, 11 October:**

> *"Make it make a nice noise when they get a question right and a buzzer when wrong."*

"It" is the site; "they" are the children answering questions on it. The owner leaves the design to the
build, so every choice below is written down with its reason.

### The one rule

**A sound is the press's, not the question's.** It is played once, by one function (`markPlay_`,
js/submit.js), from one place: the end of `subRecord_`, the line every press that asks for a verdict
already reaches exactly once (note 308). Nothing that only *draws* a verdict reaches it.

Why there and nowhere else. Every function that draws a verdict — `choiceBox_`, `orderBox_`, `ansBox_`,
`subSlot_`, `subPaint_`, `subPaintAll_`, `subVerdictPaint_`, `aiKeptPaint_`, `choiceRedraw_`,
`orderRedraw_` — runs on a repaint, on a restore, when a payload lands (`adoptMarks_` → `subAdopt_` →
`subMigrate_`), when the account's copy arrives (`answersPull_` → `ansRefresh_`), when another tab writes
an answer (the `storage` listener), when a box is typed back to the answer last sent, and **once per copy of
the card** (Find and Saved can both hold it). A sound hung on any of them is a chime per copy and a buzzer
every time the column repaints. A document-level click listener would miss the keypad's ✓ and a laptop's
Enter, which call the box's handler directly (`kpDone_`). `subRecord_` is reached by all six presses — Check,
a completing pick, Send on an ordering, Mark with AI's marks, ✓ and Enter — and by nothing else.

### Which verdict sounds

| verdict | sound | why |
|---|---|---|
| `right` | the chime | |
| `wrong` | the buzzer | the screen still says "Not yet — have another go"; the buzzer is the owner's word |
| `sent` | nothing | nothing marked it: a box with no scheme, a pick with no right option, a worksheet box |
| `ai:N/N` (full marks) | the chime | |
| `ai:0/N` | the buzzer | |
| `ai:N/M`, 0 < N < M | **nothing** | see below |

**A part mark is silent.** 31 of 40 is neither right nor wrong, which are the two things asked for. "The
sound follows the colour" (the screen draws a part mark amber, like "Not yet") would buzz on nearly every
essay ever marked and teach a child that the buzzer means "good, mostly". The amber is unchanged; the sound
is only ever extra.

Silent too, because nothing is recorded: Check on an empty box ("Write something first"), Send on an
ordering with a gap, the first of two picks on a "choose two", a tap on a settled pick, a short answer typed
over while Mark with AI marked it, Mark with AI switched off, refused or unreachable, and "Show the answer"
(`qa-show` never records). **An essay typed on while it was marked does sound**: its verdict is recorded with
the words that were marked and kept as that draft's mark (note 312), so it is a press about the draft it read,
heard when it lands like any other (corrected after review — this line used to list it as silent).

**A double-tap is two presses**: two submissions, as it always was, and now two sounds, the first cut by the
second ("bz-bzzz"). Left so: the rule is one sound per press, and a sound skipped because a press came quickly
would hide a second submission rather than stop it. Stopping the double submission is a change to every
marking press and is outside this branch.

### The two sounds

Built with Web Audio, not fetched — the Timer's reason (games.js): a file is a request that can fail
silently. `markTone_(ac, t0, kind, out)` builds one into `out` from `t0` on `ac`'s clock and returns when it
ends, so a browser check can render it into an `OfflineAudioContext`.

**The chime (`right`), 0.32 s.** Two notes, a rising fourth — G5 then C6, the cadence a tune ends on:

| note | starts | lasts | partials |
|---|---|---|---|
| G5, 783.99 Hz | `t0` | 0.16 s | a sine, and a sine at 1567.98 Hz at a third of its level |
| C6, 1046.50 Hz | `t0` + 0.09 s | 0.23 s | a sine, and a sine at 2093.00 Hz at a third of its level |

Each note's envelope: 0 at its start, a linear rise to **0.03** in 12 ms (0.04 before review), an exponential
fall to 0.00003 (a thousandth) by 10 ms before its end, a linear ramp to exactly 0 at its end; the oscillators
stop 20 ms after.

**The buzzer (`wrong`), 0.40 s.** A sawtooth at 164.81 Hz (E3) and a square at 174.61 Hz (F3), a semitone
apart so they beat about ten times a second and their third harmonics grind at about 29 Hz — the "buzz" —
each at half level, through a low-pass `BiquadFilter` at 1600 Hz, Q 0.7, which takes off the upper harmonics
that make a buzzer harsh (a third of a percent of its energy is above 2 kHz, against the chime's six).
Envelope: 0 at `t0`, a linear rise to **0.06** in 25 ms, held to 90 ms before the end, a linear ramp to exactly
0 at `t0` + 0.40; the oscillators stop 20 ms after. **Retuned after review**: it was A2/A♯2 (110/116.54 Hz)
through 800 Hz at 0.045, with the chime at 0.04 — and half as loud as the chime to an ear (below).

**Measured** in Chromium, both rendered at 48 kHz (`check/sounds.js`), beside the Timer's beep (an 880 Hz
sine at a flat 0.08 for 0.35 s, no envelope):

| | length | loudest sample | to an ear: loudest 85 ms, A-weighted | through a phone (700 Hz high-pass, A-weighted) | largest step, first / last 2 ms |
|---|---|---|---|---|---|
| chime | 0.32 s | 0.0396 | −36.3 dB(A) | −40.1 | 0.00063 / 0 |
| buzzer | 0.40 s | 0.0665 | −36.9 dB(A) | −42.6 | 0.00084 / 0.00001 |
| the Timer | 0.35 s | 0.0800 | −25.4 dB(A) | −28.8 | 0 at its first sample — and 0.0092 at its stop (a click) |

Both are silent before `t0` and after their end. The chime's pitch, counted in zero crossings, is about
792 Hz in its first 80 ms and about 1050 Hz from 0.16 s — it rises. **To an ear the two are within a decibel
of each other, and 2.5 dB through a phone's speaker; both are 11 dB under the Timer** — the Timer is meant to
be heard across a room, these by the child at the card. (The table as first written measured loudest samples
and RMS only, and said the buzzer was "the louder of the two" — see "After review".)

### An iPad lets a page start sound only from a tap

- **One `AudioContext` for the visit** (`MARK_AC`), made by `markHear_` on the first press with the switch
  on — never at load, and never while the switch is off. `resume()` on every press too, because an iPad
  suspends it for a phone call (`interrupted`) and the app suspends it when it goes out of sight (below).
  `AudioContext || webkitAudioContext`; `resume()` may return a promise that rejects or nothing at all —
  caught either way.
- **The presses that answer at once** — Check, a pick, an ordering's Send, the ✓ key, Enter — are inside
  their tap already (a click or a keydown), so `markPlay_` wakes the context
  itself. If it is still waking (`resume()` pending), the sound plays when it is awake, unless that took more
  than 600 ms (`MARK_LATE_MS`) — the moment has gone.
- **Mark with AI's verdict lands after a network wait**, outside any tap. So its press calls `markHear_()`
  before the request goes (keypad.js), and the verdict plays `'late'` — only through the context the press
  woke. A context first made after the `await` is one an iPad keeps silent for ever (the Timer's, made
  inside a `setInterval`, is probably silent on an iPad today for the same reason).
- **Scheduled 20 ms ahead** (`currentTime + 0.02`), so the audio thread does not clip the start.
- **A second press cuts the first sound** (`markHush_`: its output cancelled, ramped to 0 over 15 ms, then
  disconnected) before the new one starts 20 ms later — two Sends in quick succession are two submissions
  and two sounds, never two at once.
- **At rest when nothing is playing** (`markRest_`, added after review): suspended a second after each sound
  ends (`MARK_REST_MS`), 0.1 s after the switch goes off (the 15 ms fade, then rest), and at once when the app
  goes out of sight (`visibilitychange` to hidden) — a running context with nothing to play still holds a
  phone's audio output awake. Every press cancels a pending rest and wakes it inside its own tap. **Not while
  Mark with AI is marking**: its press holds the context awake (`markWait_`, `MARK_HOLD`) until the reply lands
  or fails, because a context put to rest during the wait — by a Check pressed beside it — could only be woken
  by another tap, and the marks would land on it in silence.
- **The iPad's silent switch mutes Web Audio, and that is left alone.** `navigator.audioSession` could
  override it, and would stop a child's music to make a chime.
- **Never throws.** No Web Audio (an old browser, jsdom), a refused context, a failed `resume()`: silence,
  and the verdict on the screen exactly as it was.

### A verdict that lands after the child has left the card is silent

Mark with AI takes seconds. A child who has swiped on to the next question by then would hear a buzzer that
seems to be about the question in front of them. So the verdict is heard only if **the box it marked is on the
page in front of the column in front**, with the app in sight — `markWhere_(k)`, asked at the press and again
as it lands, by the box's answer key; anywhere else it is recorded with `'none'`. It is still drawn in the
card's slot, for when they come back. By the key and not the element, because the funnel repaints a column in
new markup; and the key is the same on every copy of the card, so the copy on Saved is still "here".
(It first compared the column and its page number, which a review showed is not the card — see "After review".)

### The switch

**Where: the question card's own tile row, just before the verdict slot** (`markSoundTile_`, drawn by
`questionTiles_`).

- The sound happens on the card, so whoever hears it — the child, or the tutor beside them — finds the switch
  on the card in front of them. Settings is a column away, and to a signed-out child it shows only "Sign in"
  (`settingsPages_`); a parallel branch is reworking it besides.
- **Before the slot, not after it**: the slot fills with "Not yet" on the first press, and a tile after it
  would move under the finger (261: marking moves nothing).
- **Signed in or out** — a signed-out child is marked, and hears it.
- **Only on a card that can sound** (`markCan_`): a scheme to Check against (`accept`), a right option
  (`choiceRight`), a right order (`orderWays_`), or Mark with AI offered (`aiTile_`) **to somebody signed in
  with a session** — the `qp-ai` press answers "Sign in to have it marked" before anything wakes, so signed out
  a card only Mark with AI can mark has no switch (after review). A card whose every press is `sent` would
  carry a switch for a noise it never makes — the control that sometimes does nothing.
- **Only where the device can make a sound** (`markCanSound_`): no Web Audio, no switch, as Read aloud is not
  drawn without a voice.

**What: the sound switch this app already has** (note 323) — the `sound` / `mute` pair, saying the state it
is IN ("Sound on" / "Sound off" in `aria-label` and `title`), `.on` for the eye and `aria-pressed` for a
screen reader: Imposter's Read aloud tile exactly. One face object (`markSoundFace_`) is handed to `tile_`
to draw and to `tileSet_` to rewrite, so the two cannot drift. A press flips every copy on the page, as the
star does.

**One per device, on by default.** `localStorage 'mark-sound'`: `'0'` is off; nothing, or `'1'`, is on — on
because the owner asked for the noise. Per device and not per person: siblings sharing an iPad and a tutor at
the table are one room, and a switch that came back on whenever the next child signed in would be turned off
again every time. **What this visit chose is asked before the store** (`MARK_SOUND_HERE`), so a store that
refuses every write — a full one, or Safari private browsing — keeps the choice for the visit even when it
already holds the opposite. **Another tab's press reaches this one** through the `storage` event: its tiles
redraw and a sound playing here stops.

**Turned on, it plays the chime once** — the one way to hear that it works, and the way a tutor finds out
that the iPad's silent switch is on. Turned off, a sound still playing stops. **Either way a toast says what it
is for** — "Sounds for right and wrong answers on" / "… off" — because the speaker with no word under it is
also Imposter's Read aloud, and a child who pressed it hoping to hear the question has otherwise turned the
marking sounds off with only the picture changing. It covers the marking sounds only: the Timer, the reels and
Read aloud keep their own.

No stylesheet change: the tile is `tile_()`'s, 44px from `.tile`, and `.tile.on` is the plate Read aloud
already lights. `style.css` is not touched, so `--css-version` stays as it was.

### Left alone, and why

- **The games.** None of them goes through `subRecord_`, so none of them sounds: Sentence Scramble's Check
  (`ss-check`) has its own right and wrong; Times Tables checks on every keystroke and only ever says right;
  Articulate's "Correct" is a tutor's judgement, not the app marking anything; Chess, Connect 4, Othello, the
  Maze and Word Search have their own win and lose. Giving them sounds is a separate decision about each game.
- **Practice ("Daily practice", the `drill` tool)** is a placeholder that reads "Not built yet." — there is
  nothing in it to mark. When it is built, if it records through `subRecord_` it sounds for free.
- **The Timer's beep** keeps its own context, its own level and no switch. A switch on a question card that
  also silenced an alarm somebody set would be a surprise, and its comment says why it must sound ("a timer
  that ends in silence has not ended"). Its click and its probable silence on an iPad are written above, for
  whoever touches it next.
- **The visible verdict and its `aria-live` line** are exactly as they were. The sound is extra.
- **backend/** is untouched.

### Checked

- **check-flow.js**, three new journeys, `FLOW_ONLY='mark sound'`, against a recording `AudioContext` with
  an iPad's rules installed before the app runs (`earFake_`): born suspended, `resume()` inside a tap wakes
  it, outside one it refuses. A SOUND is a node connected to the destination; what it is, is read off the
  oscillators that reach it (sines at 500 Hz and over: a chime; a sawtooth or square under 300 Hz: a buzzer),
  not off a name the app gave it.
  1. *"a right answer chimes once and a wrong one buzzes once, for every kind a press marks — and nothing
     that only draws a verdict makes a sound"*: no context at load; signed out, an empty Check is silent, 16
     buzzes and 15 chimes, the context made and woken inside the tap; signed in with a second copy of the card
     on the page, one sound per press and the copy's slot updated; a wrong press and a right one at once —
     two sounds, the first cancelled, ramped to 0 and disconnected; a wrong pick, a tap on a settled pick, a
     right pick, the first of two picks, the pick completing a right "choose two", a pick nothing can mark;
     an ordering with a gap, right, an item out and back, wrong; the plain Send; the keypad's ✓ (wrong) and a
     laptop's Enter (right); then `subPaintAll_`, `subBoxPaint_`, `subPaint_`, `ansRefresh_`,
     `choiceRedraw_`, `orderRedraw_`, a box typed away and back (asserting "Correct" really was drawn again),
     `repaint()`, `adoptMarks_` with newer presses from another device, `answersPull_`, two `storage` events,
     and Show the answer — all silent; and a reload of the same account, every verdict drawn, with no context
     made.
  2. *"Mark with AI wakes the sound at the press…"*: the context forced back to suspended before every press
     (as an iPad leaves it), nothing heard before the marks land; 3/3 a chime, 0/3 the buzzer, 2/3 nothing
     (and drawn as 2/3), and 3/3 landing after the child went to another column — nothing heard, 3/3 drawn;
     one context for the visit, never made outside a tap; four `aiMark` requests.
  3. *"the switch is the sound tile on a card that can be marked…"*: on Check, pick and order cards and not on
     a plain-Send or an unmarked pick card; just before the slot; the same `switchTileSays_` the reels' Sound
     and Read aloud are held to; drawn signed out; not drawn with no Web Audio; pressed off, every copy says
     so, `mark-sound` is `'0'`, three presses make no sound and no context, and the verdict is still drawn;
     on again, `'1'` and the chime once, then a wrong Check buzzes; a fresh window on a device left off draws
     it off and makes no context and no sound.
- **check/sounds.js** (new, on the roster, about ten seconds): the two sounds rendered as above; on Find,
  Q0664 pressed by real clicks — nothing at load, the context made inside the tap and running, one buzzer for
  16 and one chime (four sines) for 15 with every oscillator started inside the tap, the switch off by a real
  click and a press silent, on again and the chime once, a repaint silent, one context for the visit.
  Headless Chromium does not refuse a context made without a tap (a mutation making one at load came up
  `running`, with no warning), so "inside the tap" is proved by `navigator.userActivation.isActive` written
  down at the moment. (Not proof enough: Chromium keeps that flag for seconds after a click, and a sound
  deferred 300 ms passed. After review it is a flag the press's own events set and a `setTimeout(0)` clears.)

- **The row, measured** at 320x568 and 390x844 with "Not yet" in the slot (a scratch script, real Find
  cards): Q0664 is the star, Sound and the verdict, 244px of a 320px phone; a pick with a figure is the star,
  Figure, Sound and the verdict, 240px; one line, nothing scrolling sideways. Seen in screenshots.
- **The rest of the suite on this commit**, on a machine at a load average of 10–29 on four cores: `check.js`,
  `check-const`, `check-css`, `check-doors` (no door without a handler or handler without a door),
  `check-loading`, `check-marking`, `check-drafts`, `check-payload` — all OK; `check-dead` prints the same
  report as on the commit before. **check-flow, all four parts: 82 + 82 + 82 + 82 = 328 journeys, every one
  passing.** `check/ui.js --screen=stuff` (630 combinations) and `--screen=tools` (95; Practice lives on
  Tools): nothing new; the unreachable states are the same six and five as in runs before this change.
  `check/press.js --screen=stuff`: 52 actions for two visitors, `mark-sound` pressed and changing something for
  both, nothing thrown, every swipe landed; a second run (verbose, load 16) had two swipes on the Games column
  go elsewhere. `--screen=tools`: the first run, at load 20–29, had three swipes go elsewhere (a Games flick
  chain, and Draw tapped at 844x390 on two drawing questions — which carry no Sound tile); run again alone it
  passed, all 107. Swipes that differ from run to run, on columns this does not touch, are the machine.
  `check/cascade.js`: nothing decided by file order alone. `check/sounds.js`: OK, four runs out of four.

### Mutations

Each red on its own, the real files green again after:

| mutation | caught by |
|---|---|
| the player moved from `subRecord_` into `subSlotSet_` (one per copy) | journeys 1, 2, 3: "heard as [buzzer, buzzer, buzzer, buzzer], wanted [buzzer]", signed out silent, every repaint heard |
| `subVerdictPaint_` plays what it draws (a repaint) | journey 1: the paints, the typed-back box and the payload landing each heard |
| the switch ignored (`markPlay_` and `markHear_` without `markSoundOn_`) | journey 3: presses heard with it off, a context made, a device left off heard after a reload |
| `markKind_` gives the buzzer for `right` | journeys 1, 3 and check/sounds.js |
| the AI press no longer wakes the context; the landing makes it | journey 2: 3/3 and 0/3 silent, "an AudioContext was made outside a tap" |
| the chime's notes switched on at full level (a click) | check/sounds.js: "the chime starts with a click: a step of 0.0062" |
| a context made at load | check/sounds.js: "at load, before any press: 1 AudioContext(s) made", "made [{tap:false}]" |

The first version of `markPlay_` checked the switch twice (again when the context woke), so the switch mutation
was silent for a reason the journey did not name; the second check guarded a window of milliseconds, and was
taken out so the one rule is the one that holds.

### After review

Three reviews read the branch: one for **when** the sounds play, one by **ear**, one for **what the checks
prove**. Every finding was first reproduced on the branch as it stood: the new journey steps went red on the
unfixed code (each line below that says "red before"), and every fix was then held to its own mutation, with
the real files green again afterwards.

**A late verdict knew where the child was by page number, not by card** (should-fix). `markWhere_` compared
`AT + '/' + PAGE[AT]`. The review starred two questions, pressed Mark with AI on the first in Saved and
un-starred it while it marked: Saved redrew, its page 1 was now the second question, the number matched, and
the first one's buzzer sounded over the second. The other way round, Find following the same card to a new
page number when the list in front of it grows (`stuffBackTo_`) left the child where they were and the verdict
silent. **Now `markWhere_(k)` asks whether the box the press marked — by its answer key — is on the page in
front of the column in front**, with the app in sight; at the press and again as the verdict lands. The key is
the same on every copy, so the copy on Saved is still "here", and a repaint or `load()` during the wait still
finds it. Journey 2 now draws the card into a real column's pages (Tools) and splices the list both ways during
the wait: another card on the same page number — silent (red before: `[buzzer]`); the same card on a new page
number — the chime (red before: `[]`); plus the next page of the same column, and the app hidden as it lands
(asked of `visibilityState` alone, so the suspend its event makes cannot be what silences it). The review's own
script, run again on the fix in Chromium: `A's 0/2 lands: []`.

**The buzzer was half as loud as the chime to an ear** (should-fix). Its energy sat at 110–330 Hz, where the
ear is least sensitive and a phone plays almost nothing; this note and the comment over `markTone_` said it was
"the louder of the two", which was true of RMS only. Measured as the loudest 85 ms, A-weighted, it was 8.4 dB
under the chime, and 10.9 dB under it through a phone model (a 700 Hz high-pass). Ten candidates were rendered
and measured in Chromium the same way: the buzzer went from A2/A♯2 through 800 Hz at 0.045 to **E3/F3 (164.81 /
174.61 Hz) through 1600 Hz at 0.06**, and the chime from 0.04 to **0.03**. Now −36.9 against −36.3 dB(A) to the
ear and −42.6 against −40.1 through a phone; both 11 dB under the Timer; still a third of a percent of the
buzzer's energy above 2 kHz (the chime has six), so it is not harsher than the chime it now matches. A
semitone apart still, so it beats (about ten times a second now) and its third harmonics grind at about 29 Hz.
`check/sounds.js` now measures exactly this — each at least 6 dB under the Timer to the ear, the buzzer no more
than 3 dB under the chime to the ear and through the phone model — and the old tuning fails it ("8.4 dB
quieter, wanted no more than 3").

**The AudioContext was left running for the rest of the visit** (should-fix), rendering silence and holding a
phone's audio output awake — after the switch went off too, when nothing could ever play. Now `markRest_`
suspends it a second after each sound ends, 0.1 s after the switch goes off, and at once when the app is
hidden; every press cancels a pending rest and wakes it inside its own tap. Mark with AI's press holds it awake
until the reply (`markWait_`), because a Check pressed beside it during the wait would otherwise put it to rest
and the marks would land on a context only a tap can wake. A new journey (4) asks: not at rest while a sound
plays, at rest within a few seconds after (red before: "still running"), woken by the next press inside its
tap; suspended at once on hidden; and a wake slower than `MARK_LATE_MS` dropped. Journey 2 presses a Check
during an AI wait, waits past the rest, and the marks are still heard; `check/sounds.js` asks the real
context in Chromium to be suspended after a sound and after the switch goes off.

**With a full store the switch said one thing and did another** (should-fix). `markSoundOn_` read the store
before this visit's choice, so with '1' kept and every write refused, Sound off drew "Sound off" and every
press still buzzed. Now the visit's choice is asked first. Journey 3 boots on a store holding '1' and then one
holding '0', makes every write throw a `QuotaExceededError`, and presses the tile: each time the presses do what
the tile says (red before, both ways).

**Signed out, a card a press can mark gained a tile row holding only Sound** (should-fix, a decision).
Measured again at 320 (a scratch script on real Find cards, both visitors, both commits): the ordering card
Q-1MA1-2406-1F-4 is drawn at 91.9% with its 40px row and the multiple-choice Q-STA-KS2-2024-P2-2 at 97.6% —
**exactly the zoom and row height the same cards have always had signed in** (their row is the star and the
slot). **Kept**: a signed-out card is
now the size a signed-in one always was, and the other choices were a sound a signed-out child cannot turn
off on that card, or a switch in a different place on different cards. `check/ui.js` lists every card drawn
smaller as known — the owner's trade, shrink rather than scroll, with each control judged at its own size — so
it was left counting groups: a ceiling on the count would turn every branch that moves a card by a pixel red,
and three branches are moving cards now.

**Coverage the suite did not have**, each now a journey step that a mutation turns red: the switch on Mark with
AI's late path (off after a sound, the context awake, 3/3 landing silent — the first attempt passed even with
the switch test removed, because the fake's iPad rule was what kept it quiet; the step now wakes the context
before the marks land); a device left off pressing Mark with AI makes no context; the next page of the same
column; the pull laying something on (`answersPull_` with a backend without `submitAnswer`, the box asserted to
have changed — before, the pull laid nothing on and its silence proved nothing); Sound off cutting a sound
still playing; the suspend on hidden; `MARK_LATE_MS`. The draw-only steps of journey 1 now run with the context
awake, for the same reason as the AI step: asleep, a stray sound would be refused by the fake rather than
withheld by the app.

**`check/sounds.js` said "inside the tap" and measured Chromium's activation window**, which lasts seconds: a
sound deferred 300 ms passed. Now a capture-phase listener on the press's own events sets a flag that a
`setTimeout(0)` clears; the context must be made, and every `resume()` called, while it is set. The deferred
sound fails it.

**The nits:**

- **A second tab's tile kept its old face** — fixed: a `storage` listener for `mark-sound` sets this visit's
  choice from the other tab's, redraws every tile, and cuts a sound playing here when it goes off. Checked in
  journey 3 (off, then on, from "another tab") and in Chromium with two real tabs: turned off in tab A, tab B's
  tile said "Sound off" and its Check was silent; turned on in B, A's tile said "Sound on" and A's Check buzzed.
- **Signed out, the switch was drawn on a card only Mark with AI can mark** (three reviews found it) — fixed:
  `markCan_` asks for a signed-in session there, the condition the `qp-ai` press asks. Signing in repaints the
  row, and the switch arrives with the star and the slot.
- **A card still keyed to a person whose session ended drew "Correct" in silence** — fixed: `subRecord_` still
  records nothing for somebody not here, and now plays the press's sound before saying so. The review's script
  on the fix: `✓ pressed on the held card: "Correct" … heard [chime]`.
- **A speaker with no word under it is also Read aloud** — the tile now toasts "Sounds for right and wrong
  answers on" / "… off", as the pen's Undo and Clear toast.
- **An essay typed on while it was marked does sound** — the note was wrong; corrected above. It is a press
  about the draft it read, recorded as that draft's mark.
- **A double-tap is two sounds** — written down above, and left: one sound per press.
- **The Timer keeps its own sound and no switch** — the reading of "respect it everywhere sounds play" as the
  marking sounds, which the ear review asked the main session to confirm, is unchanged.

#### Mutations after review

Each applied alone to a copy of the final files, the four `mark sound` journeys and/or `check/sounds.js` run on
it, and the real files green again after (machine load 20–45 on four cores throughout):

| mutation | caught by |
|---|---|
| `markWhere_` back to column and page number | journey 2: another card on the same number heard `[buzzer]`; the same card on a new number `[]` |
| `markWhere_` asking only that a page is in front, not which card | journey 2: another column, the next page, another card — each heard |
| `markWhere_` ignoring a hidden app | journey 2: heard while out of sight |
| `markCan_` without the session test | journey 2: a signed-out AI-only card carries the switch |
| the store asked before the visit's choice | journey 3: a full store holding '1' buzzes after Sound off; holding '0', silent after Sound on |
| no `storage` listener | journey 3: tiles say "Sound on" after another tab turned it off, its buzzer not cut |
| no toast | journey 3: "Sound off said \"\"" |
| no rest after a sound | journey 4 ("still running"); `check/sounds.js` |
| a rest at once instead of after the sound | journeys 1 (the second press finds nothing to cut) and 4 ("put to rest 105ms after the press") |
| no rest when the switch goes off | journey 3; `check/sounds.js` (each with the earlier sound's own rest cancelled first, so it cannot stand in) |
| no hold during Mark with AI's wait | journey 2: "went to rest while Mark with AI was still marking", the marks silent |
| `subRecord_` silent on a card keyed to somebody gone | journey 1: `[]`, wanted `[chime]` |
| the switch test removed from `markPlay_` / only on the late path | journey 2: switched off, 3/3 heard as `[chime]` (both survived the first version of the step — see above) |
| the switch test removed from `markHear_` | journey 2: a device left off makes an AudioContext at Mark with AI |
| no cut when the switch goes off | journey 3: the buzzer not cut, here and from another tab |
| no suspend on hidden | journey 4 |
| `MARK_LATE_MS` dropped | journey 4: an 800 ms wake still played |
| a chime for every key the account pull lays on | journey 1: the pull heard as `[chime]` |
| `markPlay_` deferred 300 ms | journeys 1–4; `check/sounds.js`: "made … tap:false", "resume() was called outside the tap" |
| the old tuning (110 Hz, 800 Hz, 0.045; chime 0.04) | `check/sounds.js`: "8.4 dB quieter, wanted no more than 3", 10.9 through a phone |
| and the builder's seven, again on the new code: one per copy, a paint that plays, the switch ignored, the buzzer for right, the AI press not waking, a click at the chime's start, a context at load | all red: journeys 1–4 and/or `check/sounds.js` as before |

#### Checked after review

On the final files, on a machine at a load average of 10–45 on four cores (other branches' suites running
beside it):

- `check.js`, `check-const`, `check-css`, `check-doors` (234 handlers, 233 doors), `check-loading`,
  `check-marking`, `check-drafts`, `check-payload`, `check-backend`, `check-manifest`: all OK. `check-dead`:
  the same report as on cafb838, diffed line by line (it exits 1 on both).
- **check-flow, all four parts: 82 + 82 + 82 + 83 = 329 journeys, every one passing** (the fourth `mark sound`
  journey is the new one). Part 1's first run, at load 31–35, failed one Games journey — "taboo shows a word
  … a paused card still shows the word" — which then passed three times out of three alone on the branch,
  failed once in three alone on cafb838, and passed in part 1 run again (82 of 82): a flake older than this
  branch, on a column it does not touch. `FLOW_ONLY='mark sound'`: 4 of 4, five runs.
- `check/sounds.js`: OK, every run (chime −36.3, buzzer −36.9, the Timer −25.4 dB(A)).
- `check/ui.js --screen=stuff` (630 combinations) and `--screen=tools` (95): nothing new; the unreachable
  states are the same six and five as before this branch.
- `check/cascade.js`: nothing decided by file order alone.
- `check/press.js`: every run "nothing threw, nothing was silently inert", and in every run a few swipes went
  elsewhere, never the same ones twice: `--screen=stuff` at load 31, a Games flick and a Tools star; again,
  verbose, at load 35, with the Sound tile pressed for both visitors, a Games flick, the Psalms chapter grid, the
  pen on a diagram and a Draw tap (a third run, at load 40, was cut off by my own 590 s limit); `--screen=tools`
  at load 22, a Games flick; again at 19–39, Draw tapped on Q-1CM-transformations-of-graphs-8 (which has no
  Sound tile) at two sizes. cafb838, run the same way at load 38: three swipes elsewhere, the same Draw tap
  among them. The machine, not the change.
- The reviews' own scripts, run again on the fix in Chromium: the Saved un-star case silent; a signed-out
  AI-only card with no switch; the held card heard as a chime under its "Correct"; two real tabs following one
  switch both ways.
