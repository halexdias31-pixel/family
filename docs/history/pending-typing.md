## Touch typing: a keyboard-practice widget on the Tools column

### What was asked

Two lines of the owner's notes list (2 October), audit ids `tools-1` and `tools-2`:

- *"Add a widget for keyboard practice with no eyes like that one website in links"*
- *"add keyboard tool widget."*

The website is L082 in `data/settings/links.json`: **typing club**, `https://www.typingclub.com/`,
"Learn to touch-type." The second line was taken as the same ask (the audit's default). The other
thing "keyboard" could have meant is L064 `piano` in Skills, which has no address yet; nothing was
built for it, and that is in the questions for the owner.

### What changed

- **`js/map.js`** — a `typing` entry in `WIDGETS` after the timetable: `kind: 'tool'`, `solid`,
  `start: initTyping`, `into: 'kt-box'`, and **no `stop`**, because nothing in it runs between
  keystrokes. A widget with no `stop` is drawn with its page, five pages ahead (see `drawWidget_`).
- **`js/games.js`**, at the foot — the engine, every name prefixed `kt` (`tt` is the Times Tables
  sprint, docs/history/235):
  - **A ladder of five lessons**: home row, top row, bottom row, capitals, punctuation. A lesson's
    lines come from ONE word list filtered by the letters that lesson has taught, so a home-row
    line cannot hold a `t`. Three lines at 90% or better open the next rung. Speed is not asked for.
  - **The line**: about forty characters, done letters green, the next letter lit gold. A wrong
    key does not move the line on (keybr's rule, not TypingClub's) and is counted.
  - **The keyboard**, drawn on the card: three letter rows staggered as a real one is, both shifts
    and the space bar. Every key is in the colour of the finger that presses it, mirrored (a little
    finger is violet on either hand). The home row has a heavier foot, F and J carry the ridge, the
    next key is in its finger's full colour with a gold ring, and for a capital the shift on the
    OTHER hand is lit as well. A wrong key shows red for the moment it was pressed. It is a picture,
    `aria-hidden`, and nothing on it can be pressed, so its 18px keys are not under the 44px floor.
  - **WPM and accuracy** under the line, and the best speed. WPM is worked out at each keystroke
    from the first and latest key, so no clock ever runs.
  - **How keys get in**: a focused hidden `<input>` with autocapitalize, autocorrect and spellcheck
    off, focused when the line is tapped (inside the gesture, which iOS needs to show its keyboard).
    Keys are read on `keydown` **in the capture phase at the document and stopped there**. The
    pager's arrows and the maze already stand down inside an input, but Flabby Pird's space bar
    does not: it `preventDefault`s Space whenever its canvas is in the document, and the games
    column's pages are. A phone's keyboard sends `keydown` as "Unidentified", so `input` is the
    second door: whatever lands in the box is read and the box is emptied.
  - **Kept per person** under `'kt' + ':' + whoIs_()`, the timetable's key pattern, inside
    try/catch: the lesson, how far up is open, lines held per lesson, best speed. The half-typed
    line is kept in memory only, stamped with who it belongs to, so it survives a repaint but not a
    sign-in by somebody else.
  - Only `.kt-view` is rewritten on a keystroke; the hidden box is kept, or the focus would leave
    it and the next key would land on the page.
  - One line at the foot: "Made for a real keyboard. A phone's own keys work, but the point is not
    looking down."
- **`style.css`** — the `.kt-*` block after the timetable's. The nine finger colours are declared
  on `.kt-box`, not `:root`, because they belong to this one component. The rungs are 44px in px;
  at 320 the card gives up .4rem of inside edge a side, the timetable's measured answer for five
  44px chips in a 218px slot. `--css-version` is `2026-10-03-typing`.
- **`js/check-flow.js`** — a journey: every lesson's lines hold only the keys that lesson has
  taught (fifty lines each); five right keys move the line five; the key lit is the next letter; a
  wrong key does not move it, is counted once, shows on the keyboard and takes accuracy under 100%;
  a key arriving as `input` moves it and empties the box; the box keeps the focus; no printable key
  reaches a listener on the window; three clean lines open the top row on the device; after
  `repaint()` the rung and the half-typed line are both still there; somebody else signed in gets
  a shut ladder and no line; signing back in brings it back.
- **`check/states.js`** — a `touch typing` state on Tools: three rungs open and the fourth
  chosen, a fixed line half typed with a capital next and a wrong key held, the box focused through
  the app's own handler.

### Measured

- `node js/check-flow.js`: 63 of 63. Eight mutations of the engine, each turning the journey red
  for its own reason and green again when restored: no `stopPropagation` (5 keys reached the
  window), a wrong key moving the line on, `ktKey_` ignoring who is signed in, the hidden box
  rewritten on every paint (focus lost), no per-lesson filter (a home-row line with `w`, `b`, `k`),
  the phone's box not emptied, the rung never opening, a wrong key not counted.
- **The journey passed while checking nothing the first time.** It read `KT_LESSONS` by name, and
  check-flow evaluates the app as one block, so its `const`s never reach `window`: the list came
  back empty and fifty lines of nothing were checked. Found by the no-filter mutation staying
  green. The ladder is read through `ktLesson_` now, and an empty ladder is a failure of its own.
- Screenshots at 320, 390 and 1280 of the state, looked at: the keyboard fits the 218px slot at
  320 with no sideways scroll, every key's letter is readable on its finger's tint, and the next
  key and the lit shift are the two things that stand out.
