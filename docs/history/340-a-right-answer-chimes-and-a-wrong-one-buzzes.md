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
ordering with a gap, the first of two picks on a "choose two", a tap on a settled pick, Mark with AI typed
over while it marked, switched off, refused or unreachable, and "Show the answer" (`qa-show` never records).

### The two sounds

Built with Web Audio, not fetched — the Timer's reason (games.js): a file is a request that can fail
silently. `markTone_(ac, t0, kind, out)` builds one into `out` from `t0` on `ac`'s clock and returns when it
ends, so a browser check can render it into an `OfflineAudioContext`.

**The chime (`right`), 0.32 s.** Two notes, a rising fourth — G5 then C6, the cadence a tune ends on:

| note | starts | lasts | partials |
|---|---|---|---|
| G5, 783.99 Hz | `t0` | 0.16 s | a sine, and a sine at 1567.98 Hz at a third of its level |
| C6, 1046.50 Hz | `t0` + 0.09 s | 0.23 s | a sine, and a sine at 2093.00 Hz at a third of its level |

Each note's envelope: 0 at its start, a linear rise to **0.04** in 12 ms, an exponential fall to 0.00004
(a thousandth) by 10 ms before its end, a linear ramp to exactly 0 at its end; the oscillators stop 20 ms
after.

**The buzzer (`wrong`), 0.40 s.** A sawtooth at 110 Hz (A2) and a square at 116.54 Hz (A♯2), a semitone
apart so they beat about six times a second — the "buzz" — each at half level, through a low-pass
`BiquadFilter` at 800 Hz, Q 0.7, which takes off the upper harmonics that make a buzzer harsh and keeps the
ones a phone's speaker can actually play (it plays almost nothing at 110 Hz). Envelope: 0 at `t0`, a linear
rise to **0.045** in 25 ms, held to 90 ms before the end, a linear ramp to exactly 0 at `t0` + 0.40; the
oscillators stop 20 ms after.

**Measured** in Chromium, both rendered at 48 kHz (`check/sounds.js`), beside the Timer's beep (an 880 Hz
sine at a flat 0.08 for 0.35 s, no envelope):

| | length | loudest sample | RMS | largest step between two samples, first / last 2 ms |
|---|---|---|---|---|
| chime | 0.32 s | 0.0528 | 0.0096 | 0.00084 / 0 |
| buzzer | 0.40 s | 0.0495 | 0.020 | 0.00004 / 0.00002 |
| the Timer | 0.35 s | 0.0800 | 0.0566 | 0 at its first sample — and 0.0092 at its stop (a click) |

Both are silent before `t0` and after their end. The chime's pitch, counted in zero crossings, is about
792 Hz in its first 80 ms and about 1050 Hz from 0.16 s — it rises. Both peak at about two thirds of the
Timer; the chime has a sixth of its loudness (RMS) and the buzzer a third — the Timer is meant to be heard
across a room, these by the child at the card. Held for 0.4 s the buzzer is the louder of the two, which is
right for the one a child must not mistake.

### An iPad lets a page start sound only from a tap

- **One `AudioContext` for the visit** (`MARK_AC`), made by `markHear_` on the first press with the switch
  on — never at load, and never while the switch is off. `resume()` on every press too, because an iPad
  suspends it for a phone call (`interrupted`) and the app suspends it when it goes out of sight (below).
  `AudioContext || webkitAudioContext`; `resume()` may return a promise that rejects or nothing at all —
  caught either way.
- **The four presses that answer at once** are inside their tap already, so `markPlay_` wakes the context
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
- **Out of sight, suspended** (`visibilitychange` to hidden): a running context with nothing to play still
  holds a phone's audio output awake. The next press wakes it.
- **The iPad's silent switch mutes Web Audio, and that is left alone.** `navigator.audioSession` could
  override it, and would stop a child's music to make a chime.
- **Never throws.** No Web Audio (an old browser, jsdom), a refused context, a failed `resume()`: silence,
  and the verdict on the screen exactly as it was.

### A verdict that lands after the child has left the card is silent

Mark with AI takes seconds. A child who has swiped on to the next question by then would hear a buzzer that
seems to be about the question in front of them. So the press writes down where it was (`markWhere_`: the
column in front and its page, `AT` and `PAGE[AT]`) and the verdict is heard only if it lands in the same
place with the app in sight; anywhere else it is recorded with `'none'`. It is still drawn in the card's
slot, for when they come back. Compared by column and page rather than by the box's element, because the
funnel repaints a column in new markup and the page you are on is the same page.

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
  (`choiceRight`), a right order (`orderWays_`), or Mark with AI offered (`aiTile_`). A card whose every press
  is `sent` would carry a switch for a noise it never makes — the control that sometimes does nothing.
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
again every time. A store that refuses (Safari private browsing) keeps the choice for the visit.

**Turned on, it plays the chime once** — the one way to hear that it works, and the way a tutor finds out
that the iPad's silent switch is on. Turned off, a sound still playing stops. It covers the marking sounds
only: the Timer, the reels and Read aloud keep their own.

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
  down at the moment.

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
