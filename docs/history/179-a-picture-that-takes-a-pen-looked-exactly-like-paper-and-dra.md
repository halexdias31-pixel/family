## A picture that takes a pen looked exactly like paper, and drawing on it slid the app away

**Reported as "for questions where you have to draw on it it doesnt work as when you are drawing its
moving the widget itself. i think on those quesitions there should be a padlock tile to keep it in
place so you can draw."** Reproduced on the first try with real touch events on Q7 of the June 2024
Foundation paper — the blank grid the owner had been working on — because a mouse cannot see
`touch-action` and this repository already records what that cost `check/press.js` once:

| a stroke across the picture | the app | drawn |
|---|---|---|
| **pen off, sideways** | `stuff` → **`dm`** — a whole column away | **nothing** |
| **pen off, downwards** | page 7 → **6** — a page back | **nothing** |
| pen on, sideways | stays put | 1 mark |
| pen on, downwards | stays put | 1 mark |

**SO THE PEN IS COMPLETELY CORRECT ONCE ARMED AND THE WHOLE FAULT IS THE UN-ARMED STATE.** That half
is recorded here already — *"when i try draw a line of best fit it slides the whole widget to the
left"* — and `data-noswipe` fixed it, on both axes, which the bottom two rows prove.

### What the owner asked for existed and was called something that does not say it

**`Draw on it` ARMS THE PEN AND PINS THE CARD, which is exactly what a padlock does**, so this is a
rename rather than a new mechanism — and saying so plainly matters more than quietly substituting
one, because the ask was for the tile by name. `Lock it to draw`, with a padlock glyph, is the
owner's own sentence: *"a padlock to keep it in place SO YOU CAN DRAW"*.

**THE TWO GLYPHS DIFFER BY ONE STROKE AND THAT IS THE ONLY THING THAT KEEPS THEM APART.** A padlock
has two opposite readings — the picture is locked against you, or the card is locked for you — and
the second is the one the report asks for. Same body, same shackle, and the open one is missing its
right leg; drawn any other way it reads as whichever the viewer expected.

### The picture is the second door, because the picture is where the finger goes

**A SCREENSHOT IS WHAT SETTLED IT.** Nothing measured wrong: the card laid out perfectly, the button
was a real 44px target, and it read as **one of three identical grey buttons under a credit line**,
beside `Undo` and `Clear` — two controls that act on marks which cannot exist until the pen is on.
Nothing said which to press first, and a blank grid is the single most inviting thing on that card
to put a finger on. **Twenty-seventh time this file writes that a screenshot is the last word on
something drawn** — counted off the entries above rather than remembered, because this tally has
been wrong inside its own warning twice.

So `padWrap_` puts the action on `.qpad-art` **while the pen is off**, and the gesture people
actually make is a door. **A DRAG IS STILL THE GRID'S**, because `PRESS_MOVED` in shell.js swallows
the click a swipe produces — measured both ways: a tap arms the pen, a 110px drag from the same
point still takes the column to `dm` and arms nothing.

**AND THE ACTION HAS TO COME OFF AGAIN WHEN THE PEN IS ON**, which is the sharp half. Armed, the ink
layer is over the picture taking every pointer — so a `data-do` left on the art underneath means the
dispatcher walks up from that ink and **the first dot anybody draws turns the pen off again.**

### The pen stays off by default, and the arithmetic is why

`.qpad-ink`'s own note says a region with `touch-action: none` taller than the phone is a region you
cannot swipe past. Measured on this card: the ink is **227px** of an 844px viewport and **the pane
can scroll 995px** — so a pad that took the finger before being asked is a picture you cannot get
off, on a card whose answer box is below it. One tap is the price of not building that.

### `padArm_`, because four attributes in four places is a half-armed pad

The class the frame is drawn from, the `data-noswipe` the grid reads, the `data-do` that makes the
picture a door, and the button's own face all move together — and the press mutates them in place
rather than repainting, so they exist in two writers by construction. A gold frame over a picture
that still hands the finger to the grid, or the other way round, is exactly the invisible mode the
frame was added to prevent. One function, one flag, and `padLockFace_` is the single source of the
label — `textContent` would have wiped the glyph, which is a mutation this is proved against.

### `check-flow.js` — the picture is pressable exactly while the pen is off

**NOTHING IN THE SUITE COULD SEE ANY OF IT.** `check/press.js` presses each action once and reports
that something changed — true of a pad that disarms itself. `check/ui.js` measures geometry, and a
pad that hands every stroke to the grid **measures perfectly**. So the rule is the markup invariant,
asked of both writers: as `padWrap_` builds it, as `padArm_` leaves it, and — the half that would
have put the fault straight back — as a card **rebuilt** with the pen on, which on this screen is
one keystroke in the search box away.

**Proved by mutation five ways**, each against the exact line it replaces: the action on the art
unconditionally, the action never on it (the state before this commit), `padArm_` leaving it on when
arming, `padArm_` writing the face with `textContent`, and `padArm_` forgetting the ink mark. All
five exit 1 naming the right assertion; the real files are green across 39 journeys, and `find.js`
was restored from a copy and compared byte for byte — `git checkout <file>` on a tree with
uncommitted work is what this file already records losing three edits to.

### And 169 rows want a pen, 26 carry the picture, and nothing had ever rendered one

**`check/ui.js` HAS MEASURED QUESTION CARDS FOR AS LONG AS IT HAS EXISTED WITHOUT ONCE MEASURING THE
ONE THAT CARRIES A CONTROL OVER A DRAWING** — every pen card is inside the funnel behind a filter,
so which ones it happens to stop on is luck. `stuff · a diagram you can draw on` is a declared state
now, off rather than on because off is the state the card arrives in and the state the report was
about.

**ITS FIRST VERSION SET A CHIP MATCHING NOTHING AND REPORTED THE APP BROKEN.** The `paperId` facet's
`of` is `x.row.paper_id` and an item carries no `paperId` of its own, so `stuffFiltered()` came back
without the question it had just narrowed to — *"the paper chip does not return its own pen
question"*, at all four widths. It reads the value off the facet itself now, which is the same move
`quizKey_` and `SLOT_DAYS` already make: a field name written out in the harness is a second
spelling to keep in step.

**60 combinations, nothing new**, and one known finding it printed on its first run: the pen card is
**23px** past its pane at 320×568 — inside `PANE_REACH`'s own 24px floor, so it prints rather than
fails, which is that list working as written.

### And the one instrument that could already see the pen had its selector taken out from under it

**`check/press.js` HAS HAD A PAD RULE SINCE THE SIDEWAYS FAULT, AND MY OWN CHANGE BROKE IT.** It
found the arming control with `#s-stuff .qpad [data-do="pad-draw"]` — unambiguous for exactly as
long as one element carried that action. The art comes FIRST in the markup, so `querySelector`
started handing it the **picture**: steps 1 and 2 went on passing, because tapping the picture
really does arm the pen, and step 3 — which taps the same point to turn it back OFF — landed on the
ink instead and drew a dot. The pen stayed on, the swipe after it was correctly refused, and the run
reported *"landed on stuff, wanted account"* — **a real finding about the app, caused by the
harness.** `.qpad-lock` names it now, which is the same class `padArm_` reaches for and for the same
reason.

**AND THE ONE THING THAT COULD GO WRONG WITH A PICTURE THAT IS A DOOR IS NOW ASKED THERE**, because
`check/press.js` is the only instrument that can: a mouse cannot produce the gesture and a dispatched
click never travels. **A swipe beginning on the picture must move the column and arm nothing** — 26
rows carry a pen and on those cards the picture is the biggest thing to put a thumb on, so a pen
armed by every scroll would be the reported fault wearing the other coat. **Proved by mutation**: the
action taken off the art names it — *"the picture carries no action, so the only way to arm the pen
is a button under the card — which is what the report was about"* — takes the state unreachable at
both visitors and the press count 163 → 154. 60 swipes, every one landing where it should.

**`pad-clear` IS BACK ON `ACCEPTED_QUIET`, and it is the second time that entry has moved.** It came
off with the "carry on" block, because with nothing pressing it the entry was a written reason with
nothing behind it; a state reaches it again, and clearing a pad nobody has drawn on writes an empty
list over an empty list.

**AND `EADDRINUSE` ON 8123 IS WORTH KNOWING BEFORE SOMEBODY CHASES THE INTERMITTENT FAILURE.** A
stray `node` holding that port makes this check die on its first line with a stack trace where a
report should be — which is what a half-finished earlier run leaves behind. It is not the same thing
as a finding, and it looks identical in a suite tail.
