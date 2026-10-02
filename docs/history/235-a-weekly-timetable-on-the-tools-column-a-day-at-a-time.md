## A weekly timetable on the Tools column, a day at a time

**Asked for as "timetable widget ... like weekly timetable".** `timetable` in `WIDGETS` (after `Your
week`, which is the sessions BOOKED here; this is the week somebody writes down themselves), drawn by
`tmtHtml_` / `tmtPaint_` at the foot of games.js. Kept on the device under `tmtKey_()` —
`'tmt:' + whoIs_()`, the answer boxes' key — so two students on one phone get two timetables, and it
works signed out under the bare key. Nothing posts anywhere.

**The prefix is `tmt-`, not `tt-`, because `.tt` is the Times Tables card** and `.tt input` is
`font-size: 1.4rem`. The first draw of this widget used `.tt` and every box in it came out at 20.7px.

**One day at a time, measured.** Seven lesson columns is 35px each at 320. Day chips over a list:
Mon–Fri, and all seven (four and three) when `Weekend` is ticked. Five 44px chips and their 2px gaps
are 228px and the widget's slot at 320 is 218, so at ≤22rem the widget card gives up some of its
inside edge (`padding-inline: .4rem` on `.card.is-widget:has(.tmt-box)`): 231px, chips 45x44. A day
with something on it has a dot under its chip.

**A lesson is its summary line until tapped** (the qualification shelf's shape): time · subject ·
note, one 44px button. Tapped, it opens in place to a time box, a subject box, a note box and
Done / Remove. Typing is saved on every keystroke by a document `input` listener and is not
redrawn; Done shuts it and re-sorts by time. A new lesson is an hour after the last one, 09:00 on
an empty day. Chrome's clock button in the time box is hidden — it opens a picker over the card and
sat on the minutes at 320; the time column is 7.8rem because a 12-hour phone shows "11:15 AM" and 7rem
cut the AM off. **On a phone a tap on the time box still opens the platform's own wheel or clock**,
which no rule can reach — the same native control as the booking dropdowns and the exam-date picker,
so the time is kept on `change` as well as `input`, because an older phone's wheel fired only `change`.

**A lesson shut with nothing in it goes** (`tmtShut_`): Add writes a row before anything is typed, so
Add then Done — or another day, or Add again — used to leave an `Untitled` line only Remove could
take off. No subject and no note is not a lesson; the time does not count, because Add filled it in.

**A colour per subject, handed out and remembered, not hashed.** The first version hashed the
subject into eight hues and the first screenshot had Chemistry and History in the same red — five
subjects in eight hashed colours collide four times in five. `tmtColours_` gives each subject the
least-worn of ten hues (declared on `.tmt`), keyed on the subject's letters in ANY alphabet
(`\p{L}\p{N}`) — `[a-z0-9]` reduced `Ελληνικά` to nothing, so a Greek lesson drew with no colour.
It keeps the hue in `colours` so it does not move when another subject is added earlier in the week, and gives it back when the subject's last lesson goes. Drawn
as a 4px edge, so no hue has to pass a contrast test.

**Checked.** `check-flow.js` journey *"the timetable keeps a week per person, one colour a subject,
through a repaint"* writes a Monday through the real handlers and the `input` listener and asks:
time order, three colours for Chemistry/History/Maths, the note on its line, survives a repaint, a
second person sees none of it, Maths keeps its colour when Art arrives at 08:00, Weekend 5↔7, Remove.
Then a blank lesson shut three ways, a Greek subject's colour, and a time sent only as `change`.
**The repaint and the second person go through `repaint()` alone** — the first version called
`initTimetable()` straight after, which redraws the widget whether or not the app ever restarts it,
so a roster entry with no `start` passed. Proved by mutation seven ways: hashed colours, one shared
key, typing not saved, `[a-z0-9]` keys, no `change` listener, no `tmtShut_`, and no `start`.

**What it does not do, said rather than buried**: a repaint while a lesson is being typed into (a
payload landing) rebuilds the box and drops the caret — nothing typed is lost, because every
keystroke is already stored and the lesson comes back open, but the keyboard closes. And with the
widget starred onto Saved, typing into one copy updates the other only on its next draw.

`check/states.js` has `tools · a timetable` (weekend on, one lesson open). `check/press.js` reads `PRESS_PORT` now.
