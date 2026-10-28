# 502 — Tools everywhere, and a ruler held with two fingers

The owner: "I want to see all the non-universal rules for items in Finder, like ruler or compass. I want to
universalise to increase stability, so almost all tools are available all the time, within reason. Also the
ruler is bugging out. Is it possible to make it work by holding with two fingers, one on each end, to alter its
angle and position?"

## Where each tool appeared, before

| Tool | Condition | Where |
|---|---|---|
| Ruler / Protractor on the figure (`measTools_`) | question with a figure, not a pen-on-the-part, and subject in `QT_MEASURE_SUBJECT` (maths, stats, sciences, geography, D&T, engineering); outside those, maths only and only if the words said "measure" and an angle/length word | find.js `measTools_`, `qToolkit_().measure` |
| Ruler / Protractor tile placement | only where a typed box (`ansBox_`), a cells box, or a choice row drew `measTiles_`; a drawn answer with no box had none | find.js `ansBox_`, `cellsBox_`, `questionTiles_` |
| Pen, Ruler (line), Compass, Protractor in the pen's bar | every question pad (457); a non-question pad by `needs` / words (`padTools_`), a ruler on any grid | find.js `padToolsOf_`, `padTools_` |
| Pen at all | `padSource_`: not on multiple choice or table rows; only drawing/annotate types or a non-text surface | find.js `padSource_` |
| Magnifier | questions only (`qToolkit_`, kind `question`) | find.js `qToolTiles_` |
| Padlock | every question page and every card (461, 498) | find.js `qLockTile_`, overworld.js `gameLockTile_` |
| Read aloud | every question; a content card only at SATs or school years 1–6 | find.js `readAloudFor_` |
| Speed read | content, practical, project, a Bible verse | reader.js `speedFor_` |
| Hear it | Spanish, French, German content cards | find.js `hearItLang_` |
| Keypad | every typed box (maths or letters by `ansMaths_`) | find.js `ansBox_` |

## What changed

- **Ruler and Protractor on every figure question**, whatever the subject and whatever the wording; a drawn
  answer with no typed box gets them in a row of their own. The word-sniffing fallback is gone.
- **Read aloud on every content card at every level**, and on practicals, projects and Bible verses (their
  words are `speedText_`'s).
- **Magnifier on every Find item card** (library, scripture), not only questions.
- **What is left is on the Rules card**, one rule each: `meas-wordy` (a figure in English, a language, RS or
  philosophy: flippable), `mag-items` (people, shop, feed cards: flippable), `speed-long` (questions:
  flippable), and locked `meas-under-pen`, `pen-chosen`, `hear-lang`, each with its reason.

## The ruler bug

Every `pointermove` rebuilt the whole overlay `<svg class="meas">`: the element the finger had captured was
removed under it, the round handle was placed again (so it jumped), and a new element arrived mid-gesture. A
second finger turned the ruler about its zero, not between the fingers, and ignored their movement, so the ruler
slid out from under them; and a second finger landing beside the tool landed on the figure, where the browser
was still free to pinch-zoom or scroll and cancelled the pointer.

Now the tool is rigid under the fingers: each pointerId keeps the spot of the tool it first touched; two fingers
solve the turn and the position exactly (fingers may cross, nothing flips); one finger on the body drags, one on
a ruler's end turns it about the other end, the round handle turns about the centre; the wheel turns 1° (Shift
0.2°). It snaps to multiples of 15° within 2°, and on release to a corner and an arm as before. Only the pose
changes during a gesture (`measPose_`); touchstart/touchmove are prevented while a finger holds it. The
protractor shares the model. The compass is the pen's (press the point, drag the width, swing), unchanged.

`check/ruler.js` drives it in Chromium with two CDP touch points: move, turn, cross over, snap, one end, drag,
and the protractor; and that every figure question has both tools or a rule saying why.
