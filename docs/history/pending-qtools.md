## The answer hides again, every control on a question's pages is a tile, and the pen has a ruler and a compass

**Asked for on 5 October, in this order:** *"also check button should be a tile."* (done on the branch
before this: Check is `tile_({icon:'tick', act:'qp-check', cls:'qp-check'})`, and `tile_` takes `cls`),
*"answers should just stay hidden unless user unhides them. and can hide them again. simple is best."*,
*"lock should be a tile too. same as undo and clear. it should all be tiles."*, and *"some questions
require a compass or ruler. so should have a tile for these things. if you cant find those questions
dont worry just have the infrastructure set up for it."*

### Show, Hide, and a question tile that only turns the page

| | |
|---|---|
| **the answer page** | one tile in one slot, ABOVE the answer: `Show the answer` (the eye) with "Answer hidden" beside it, or `Hide the answer` (the eye struck through) once shown. The header, tags and tile row are the same height either way, so the thumb finds Hide where it pressed Show and the answer arrives underneath. Hidden means the answer is not in the markup, as before |
| **the question card's tile** | `To the answer`, an arrow (`next`), note "turns the page". It no longer calls `ansShow_` — reaching the page and revealing it were one tap; now revealing is always the page's own tap |
| **state** | `ANS_SHOWN` by the answer box's key, for the visit: `ansSet_(x, open)` adds or deletes and redraws every copy of the page by `data-k`. Hidden is the default every time unless this person showed it on this visit; the next person on the phone starts hidden |
| **CSS** | `.qans-wait` (the block that held the sentence over a tile under it) is gone; `.qans-tiles` and `.qans-wait-k` inline |

### Every control on a question's pages is a tile

The house rule (CLAUDE.md) says *a FORM has buttons*, and the pen's bar, Check and Mark with AI were
argued as a form's. The owner overruled it for this surface; the reason is written where each button
was (`padBar_` / `padWrap_` and `aiBox_`'s header in keypad.js, and `cardActions_` in tiles.js).

| control | now |
|---|---|
| the pen's lock | a tile, `tone: 'lead'` (new: gold mark off, gold fill on), `cls: 'qpad-lock'`, `aria-pressed` through `tile_`'s new `pressed`. `padLockFace_` returns the face as an object handed to `tile_` to draw and to `tileSet_` to rewrite in place, so `padArm_` still rewrites the same element |
| Undo, Clear | tiles (`undo`, `bin`), `qpad-undo` / `qpad-clear` |
| Mark with AI | a tile with a sparkle (`spark`), `cls: 'qp-ai-go'`; disabled draws as a tile does; the tile shows `.tile.is-busy`'s ring while marking |
| Show / Hide / To the answer / Check | tiles (above) |
| **not tiles, and said why where they are drawn** | the keypad's keys (`kpKey_`: a keyboard, glyphs as the whole face), the multiple-choice options (`choiceBox_`: the answer being given, with its own words and maths), the ringed words (`circWords_`), the picture under the pen (the second door), the answer box (a field) |

`tile_` gained `pressed` (writes `aria-pressed`) and `tileSet_` keeps it in step; nothing else that calls
`tile_` changes. New marks in `TILE_ICONS`: `next`, `pen`, `ruler`, `compass`, `spark`. The pen bar is
two groups (`.qpad-group`): the lock with its tools, then Undo and Clear — measured at 390, six loose
tiles wrapped the bin alone onto a second line; grouped, it is four and two at 320 and 390 alike.

### A Ruler and a Compass on the pen

| | |
|---|---|
| **which questions** | `padTools_(x)` in find.js, one self-contained function: from `needs` (the card's union of the paper's cover and the row's own cell; Ruler / Compass / Protractor, and "compasses", "pair of compasses", "straight edge", "angle measurer", a "geometry set") and from the words of the row, its lead and its stems ("use a ruler", "ruler and compasses", "construct", "bisector", "locus", "loci"). Not "plotting compasses" (physics), not "construct a table / tree / graph", not "12 rulers" in a word problem. Always in the order Pen, Ruler, Compass |
| **what is drawn** | the tool tiles only where there is a choice (a question that wants only the pen keeps lock, Undo, Clear). Pressing one chooses it AND locks the card (`pad-tool`); the one in hand is lit only while the pen is on. `PAD_TOOL` remembers the choice per pad for the visit; `padToolNow_` asks the bar, so a stale choice for a pad with no such tile draws with the pen |
| **Ruler** | a drag keeps its two ends: one 2-point stroke. Live line from where the finger went down, a dot at that end while dragging |
| **Compass** | press the centre, drag out: a full ring, previewed, with the point (a fat dot) and the live radius (dashed) shown while dragging (`.qpad-aid`, never stored). Swing round the point by 30° or more and the width holds where it was when the swing began and an arc of the swept angle is kept; a full turn is a ring again |
| **round on any picture** | the ink is stretched (`preserveAspectRatio="none"`), so a ring in units is an ellipse on a picture that is not square. The radius and angles are measured in the box's own pixels and only the points turned back into units (`padArc_`) — round at every width, because the picture's shape is the drawing's |
| **storage** | the same flat polyline as a pen stroke (a ring closes exactly on its first point, about one point per 4px, 8–120), so Undo, Clear, storage, repaint and reload are unchanged code |
| **protractor** | decided (`padTools_` answers it) and not built: a useful one is a scale laid over a figure and read, not a mark |

**The library today** (`check-library.js` prints it every run): a Ruler on **69** pen questions, a
Compass on **1** (Q-1MA1-1911-1H-4, "use a ruler and compasses to construct the line from P
perpendicular to CD"); asked for anywhere: ruler 1,155, compass 7, protractor 423 (not built). **19**
ask in their own words for a ruler or compasses with no pen to use them on — six are the Corbettmaths
loci sheet (`Q-1CM-loci-*`, "Construct the locus of points…"), whose `answer_type` is `calculation`.

### Checked, each proved by mutation and restored

`check-flow` — three journeys new, one rewritten:
*the answer page shows, hides and shows again from one tile, hidden by default, the same for every
visitor* (red: the question tile revealing; no `qa-hide` handler; Hide not forgetting `ANS_SHOWN`; the
answer drawn above the tile row, "moved from child 2 to 3"; the hidden page carrying the answer);
*every control on a question's pages is a tile, bar the options, the keys, the words and the box* — a
whole family through the real builders, pen off and on, answers hidden and shown, and the tiles the
owner named must be there (red: Undo as a `<button>`; Mark with AI as a `<button>`);
*a ruler draws a straight line and a compass a round circle or arc, offered where the question asks* —
real pointer events on a 340×170 pad (red, eleven ways: the ring measured in units, an ellipse 30px
off; the ring not closed; the ruler keeping every point; the decider ignoring the words; "plotting
compasses" taken; Undo not repainting; a stale tool drawing; never an arc; the tool tile not lit;
tool tiles on a plain question; a compass tap kept);
*an answer is its own page …* now asks that "To the answer" leaves the page hidden and the page's own
Show opens it. The pen journey's lock checks still hold (red: `padArm_` not rewriting the tile's face).
`check-library`: the tool count, failing with a sentence if `padTools_` cannot be found (proved by
renaming it). `check/states.js`: the turn lands hidden; shown has Hide where Show was; *an answer shown
and hidden again, its tile where it was* (measured in pixels at every step); *a construction with the
ruler and compass in the pen bar, a line and a circle drawn*.

Looked at at 320 and 390: the answer hidden and shown, the question card's arrow, the pen off with its
four-and-two bar, a ruler's line, a compass ring and a 120° arc on a 2:1 figure, a compass mid-drag with
its point and radius, Mark with AI. The first look caught the bin orphaned on its own line at 390.

### Decided, worth a look

* **Tiles over the house rule** on a question's pages, on the owner's word; CLAUDE.md's "a FORM has
  buttons" still stands elsewhere (booking form, pay sheet, composer). CLAUDE.md now carries the
  exception in the owner's words (a9e7e59, on the base branch, not this one).
* **`check/cards.js` called 2,371 question cards "a picture on the card"** on the base branch, because
  Check's tick is an `<svg>`; it strips tile marks by their class first now (a real diagram on a card
  is still caught: 344 when one is put back, proved). **Every Find state that pressed after a timer**
  in `check/states.js` (the answer pages, the typed and tapped answers, the ringed passage, the search
  box, the keypad, Mark with AI) went unreached at random on a machine loaded to an average of 25–30
  (on the base run too); each finds its card by key in the tick the page is built now, the timer kept
  as a fallback. And check-flow's camera journey waits for an expected ask instead of a fixed 700ms
  (its "nothing was asked" waits are unchanged). None of these changes what any check asserts.
* **The Show/Hide tile sits above the answer**, not under it, so it is in the same place both ways.
* **Choosing a tool locks the card**; the padlock is still the only way off.
* **`needs` from the paper's cover counts**: every pen question in a paper whose cover lists a ruler
  gets the Ruler (that is most of the 69). A tool that is on the pencil-case list is offered.
* **No protractor tool.** **The 19 tool-asking questions with no pen** are a data fix (a `surface` of
  `blank`, or `answer_type: drawing`), not made here — `data/questions.json` was not touched.
