# js/keypad.js

The full text of comments in `js/keypad.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — keypad.js THE ANSWER BOX, IN TWO KINDS:

top level, before `KP_WORDED`

```
/* ==================================================================================================
   @family. — keypad.js

   THE ANSWER BOX, IN TWO KINDS: A MATHS ANSWER AND A WORDED ONE THAT GEMINI CAN MARK — AND BOTH ARE
   TYPED ON THE SITE'S OWN PAD. THE PHONE'S KEYBOARD HAS NO WAY IN.

   ASKED FOR AS "make the input better … like hegarty maths … desmos … worded answer normal device
   keyboard." and "add gemini marking system for worded questions." AND THEN THE OWNER, 8 Oct,
   reversing the half about the device keyboard: *"Make the keypad never need to use their own
   keyboard the key pad seems to allow ios keyboard to show I just want self contained system
   really"*.

   ---------- WHY THE PHONE'S KEYBOARD WENT, AFTER BEING KEPT ON PURPOSE -----------------------------
   IT WAS KEPT FOR WORDS because a word keyboard is what words want. That was right about the keyboard
   and wrong about the page. Counted on 8 Oct, the iPad's keyboard came up three ways by design -- every
   worded box (2,183 cards) and every practical worksheet box (246) were plain textareas, and `abc` on
   the maths pad set `inputmode="text"` on purpose, which 532 of the 5,149 maths boxes could not be
   answered without (`3n`, `y = 2x + 1`, `2:3`, `x < 3`). And four more ways that `inputmode="none"`
   was believed to close and does not, read from WebKit's own source: an iPad's hardware keyboard,
   Apple Pencil Scribble, the long-press menu's Paste / AutoFill / Scan Text, and any iOS before
   12.2, which ignores `inputmode` altogether. A second keyboard rising over the first, a different
   height on every device, with its own bar and its own guesses at the child's words, is the
   opposite of the one thing the pad was for.

   SO EVERY ANSWER BOX IS A PAD BOX, and the pad has two layouts: the maths keys, and letters. `abc`
   turns the pad to letters and `123` turns it back; a worded box opens on the letters. Nothing on a
   question's pages calls the phone's keyboard any more -- the Find search box and sign-in still do,
   because they are not answers.

   ---------- `readonly` IS THE LOCK, AND `inputmode="none"` THE SECOND ONE ---------------------------
   `inputmode="none"` ONLY STOPS THE AUTOMATIC KEYBOARD. WebKit's hardware-keyboard path, Scribble's
   `_focusTextInputContext` and Live Text's `captureTextFromCamera` all ask a question that IGNORES
   inputmode and refuses a field only when it is `readonly` -- which is also checked before the
   element's type on every iOS version. So both are on every box, WRITTEN IN THE MARKUP by `kpField_`
   and never added or taken off by script: a box rebuilt under the child by a redraw (`kpLive_`) has
   to come back locked without anybody remembering to lock it, and the old `abc` was exactly a script
   unlocking one.

   THE BOX IS STILL A REAL `<input>` OR `<textarea>` -- focusable, labelled, holding the value, saved
   by the same `input` listener in find.js and read by the same `qp-check`. `readonly` stops the
   BROWSER writing into it and nothing else: `.value`, `setSelectionRange` and a dispatched `input`
   all still work (measured), so every write the pad makes is the write it always made. What a
   readonly box does not do is take a laptop's keys, so those are read here (`keydown`) and sent
   through the pad's own edit, `kpEdit_` -- one path for a thumb and a keyboard, slots and all.

   AND THE FINGER NEVER TOUCHES IT. The box is `pointer-events: none` under its own drawing, so a tap
   lands on the drawing, inside the `<label>` that wraps both, and is answered here: the box focused
   by script and the caret put where the finger was (`kpHit_`). iOS has no field under the finger to
   offer its edit menu, magnifier or selection handles on.

   WHAT WENT WITH THE PHONE'S KEYBOARD, said rather than buried: spelling help, autocorrect,
   predictions, dictation, and copy-and-paste by touch on a worded answer. A laptop still pastes,
   cuts, undoes and selects with ⇧ (`kpKeys_` -- `readonly` took all four and they were put back).
   WHAT A LAPTOP STILL LOSES: selecting with the MOUSE (a drag or a double click on the drawing places
   the caret, nothing more -- the box under it takes no pointer), the right-click menu's Cut and Paste
   (the menu is the page's, over a drawing), and Enter for a new line in a SHORT worded box, which is ✓
   there, as it is on the pad; ⇧+Enter is the new line. In an essay Enter is the new line (`kpKeys_`).

   WHAT IS STORED IS PLAIN TEXT, and that is the decision everything else rests on. A fraction is
   `(3)/(4)`, a power `x^(2)`, a root `√(11)`: each structure is typed with a slot to fill, because
   the drawing needs somewhere to put the caret. `markNorm_` folds a bracket round one term away (see
   the note there), so `(3)/(4)` marks right against a scheme of `0.75` exactly as `3/4` did. No
   second representation, no tree, nothing for `ansKey_` to learn about.

   THE MATHS DRAWING IS `typeset_`, THE LIBRARY'S OWN. A fraction stacks and a power rises exactly as
   they do in the question above the box, because it is the same function — a second typesetter for
   the answer would be a second opinion about what a fraction looks like. A WORDED ANSWER IS NEVER
   TYPESET: `typeset_` reads `well-known` as a minus and `and/or` as a fraction, so words are drawn as
   the plain text they are (`kpDraw_`).

   WHICH LAYOUT A BOX OPENS ON is `ansMaths_` below: the sheet's `answer_type`, and where that is
   `short`, whether the scheme's answer is maths-shaped.

   ---------- WHY THE PAD IS ONE ELEMENT ON <body> -------------------------------------------------
   THE SCREENS SIT SIDE BY SIDE ON TRANSFORMS (CLAUDE.md), and `position: fixed` inside a transformed
   ancestor is fixed to that ancestor, not to the phone. A pad drawn inside the card would scroll with
   it and slide sideways with the pane. So there is one pad, built the first time it is wanted, on
   <body> beside `#toast`, and it types into whichever box has the focus — the way the phone's own
   keyboard is one keyboard for every field.

   A FORM HAS BUTTONS. The keys are the controls of the box they type into, which is the CLAUDE.md
   rule for a form; nothing here is a tile. 48px tall, 44 on a short screen and 56 on a tablet, in px,
   because a fingertip does not scale with the root font -- see `#kp` in style.css.

   LOADED AFTER `find`: it reads `typeset_`, `markBare_`, `ansItem_` and `padWanted_` from there, and
   `ansBox_` and `guideBox_` there call `kpField_` and `aiTile_` here — at draw time, after every file
   has loaded. BEFORE `tiles`, so `tileIcon_` (the ✓ key's mark) is read when the pad is built, never
   at load.
================================================================================================== */
```

### ---------- WHICH ANSWERS ARE MATHS

top level, before `KP_WORDED`

```
/* ---------- WHICH ANSWERS ARE MATHS ---------------------------------------------------------------
   THE SHEET SAYS, MOSTLY. `calculation` is 4,456 rows and every one is a number or an expression;
   `explain`, `written` and `proof` are sentences by definition; `drawing` and `annotate` are the pad
   on the picture, whose words box is a note. `short` is the one that could be either — "egestion" and
   `3y(2y + 5)` are both short — so there the scheme decides: maths when every accepted answer is,
   with the unit taken off first (`markBare_`, the marker's own), so `12 km/h` is a number.

   MATHS-SHAPED MEANS NO TWO LETTERS IN A ROW. `x`, `n`, `3y(2y+5)` and `x=3, y=-4` are algebra;
   `egestion` and `jupiter` are words. A rule this blunt is right because the cost of being wrong is
   small in both directions: a word answer that opens on the maths keys is one `abc` from its letters,
   and a maths answer that opens on the letters is one `123` from its digits -- it is the same pad
   either way, and only the first layout differs. */
```

### THE NUMBER AT THE FRONT, AND EVERY WORD AFTER IT GOES.

top level, before `KP_LEAD`

```
/* THE NUMBER AT THE FRONT, AND EVERY WORD AFTER IT GOES. This is not the marker's question, and it
   used to borrow the marker's answer: `markBare_` cut a way at its first letter, and that suited both.
   It no longer does — cutting `6w² − 10w` to `6` marked a bare 6 RIGHT, so `markBare_` takes off a
   UNIT now and nothing else. Asked of the keypad, the old cut was the right one: `8.5 to 8.9 cm`,
   `2 h 5 min` and `6cd` are all answered on the pad, and when this went on calling `markBare_` the
   sweep over every row moved 79 of them to the phone keyboard — 59 with a band like `3.0 to 3.8`.
   So the pad keeps its own cut. The number may be a root or a multiple of π (`MARK_NUM`, the
   marker's), so `√3cm` and `15π cm^2` are maths too — a unit glued to a surd was a way that sent
   exact-trig Q17 to the keyboard, which has no √ key.

   A UNIT AFTER A SPACE AT THE END IS STILL A UNIT when the cut left it — it only cuts after a number,
   and `400 − 50π cm²` does not start with one. Its power may be written raised: this took `cm^2`
   off and left `cm²`, two letters in a row, so that circle's area — an answer in π, the key the pad
   has and the phone does not — went to the keyboard. */
```

### ---------- WHICH ANSWERS ARE ESSAYS

top level, before `KP_ESSAY_TYPES`

```
/* ---------- WHICH ANSWERS ARE ESSAYS -------------------------------------------------------------------
   THE OWNER, 9 Oct, about a pupil on AQA English Language Paper 1, June 2017, Section B -- forty marks of
   creative writing: *"firstly it doesnt let him do paragraphs and also i want it to mark with ai."* The
   box he was given was the chat bar (`ansBox_`): a pill that grows to five lines and then scrolls inside,
   which is the right shape for "egestion" and the wrong one for four paragraphs. So an essay is drawn as
   a WRITING SHEET instead (`ansBox_`, `.qp-sheet` in style.css), and this is the one question that
   decides which boxes get one -- the box, the pad's return key, a laptop's Enter and the AI's prompt all
   ask it, and nothing asks the sheet's own class.

   A WORDED BOX WHOSE QUESTION ASKS FOR EXTENDED WRITING: `written` or `explain`, worth 6 marks or more,
   in a subject that is not Maths. Counted over data/questions.json on 9 Oct, 8,010 question rows:
     · `written`, 6 marks or more   201 -- Religious Studies 152, English Language 21, the sciences 28
     · `explain`, 6 marks or more    76 -- English Language 71, Physics 4, Combined Science 1
     · together                     277, every one with a scheme and none with `accept`, so every one is
                                        Gemini's to mark and none is Check's; 275 of the 277 schemes
                                        name their levels
   NOT MATHS, AND THE REVIEW OF 9 OCT IS WHY. The rule was 281 and four of them were Maths `explain`
   worth six or seven -- "Using the model, show that y = ...", a tangent's equation, two histograms
   compared, "Is Jim correct?" over a wage sum. Their schemes are method steps, not levels, and this
   predicate is also what asks Gemini for the levelled marking (`essay` in the `qp-ai` handler): it was
   telling a model to "judge the quality of the writing" of a page of algebra. Working is not prose, the
   reason five-mark `explain` was already left out -- so a Maths row is never an essay, however many
   marks it carries, and goes back to the bar and the short marking it had. No Maths `written` row was
   ever caught (all 40 are worth 1 to 5 or carry no mark), so the line costs nothing else.
   `written` WAS TO COUNT AT ANY MARK, and the count said no: 90 of its 291 rows are worth under 6 (or
   carry no mark at all) and they are short answers -- "State the defining property of a black hole" [1],
   a Greek comprehension's "Give two details" [2], "Interpret what the gradient represents" [1]. Ten ruled
   lines under a one-mark question is a sheet that says "write a lot" to a question that wants a phrase,
   so the threshold is one number for both kinds. SIX because that is where the boards' own extended
   responses start -- AQA's six-mark science questions are marked on levels for a reason, and the
   English papers' shortest analysis question is eight -- and five-mark `explain` (11 rows, mostly Maths
   "show that") is working, not prose. */
```

### AND HOW LONG IT IS, in words -- the one thing a pupil checks about an essay while writing it, so the sheet says it under itself rather than leaving it to be

top level, before `KP_NOT_WORD`

```
/* AND HOW LONG IT IS, in words -- the one thing a pupil checks about an essay while writing it, so the
   sheet says it under itself rather than leaving it to be counted by eye. A word is a run with something
   in it that is not punctuation, so a dash between two clauses is not one. Written as a class of what
   punctuation IS rather than `\p{L}`, because a regex the engine cannot parse is a syntax error that
   takes this whole file -- and the pad with it -- down on an old iPad. */
```

### ---------- THE SIGNS A SCHEME NEEDS AND THE DIGITS DO NOT HAVE

top level, before `KP_SIGN_RE`

```
/* ---------- THE SIGNS A SCHEME NEEDS AND THE DIGITS DO NOT HAVE -----------------------------------
   UNTIL 8 OCT THE WAY TO `<` WAS THE PHONE'S KEYBOARD, through `abc`. Measured over the library with
   the phone's keyboard taken away: 157 marked questions could not be answered right with the maths
   keys and the letters alone -- `<` 78, `≤` 57, `:` 51, `>` 23, `≥` 12 -- inequalities and ratios,
   whose schemes `markAnswer_` already reads (`x<=-4` for `x ≤ −4`, `2:5` for `2 : 5`).

   A ROW OF THEM ABOVE THE DIGITS, BUT ONLY ON A BOX THAT NEEDS ONE. Shown on every box it would be a
   sixth row -- 48px more of the card covered -- on the 5,000 that never use it, and on a 320x568
   phone that is the box going under the pad. So `kpField_` marks the box (`data-kp-signs`) from its
   scheme (`accept`), read the way `ansMaths_` reads it -- and where there is no scheme, from the
   answer the worked answer LEADS with, the part before its first dash (`140 < h ≤ 150 — the class
   …`), 48 boxes. NOT THE WHOLE WORKED ANSWER: its prose is the mark scheme's, and it names wrong
   forms -- 1F Q23b's says "the right numbers in the wrong form, eg 5 : 9" -- so read whole it gave
   411 more boxes the row, and measured at 320 that sixth row lifted Q23b's card 11px off the top of
   the screen. The rarer signs (`≈` 3, `→` 2, `∝` 1) are left out: a key nobody presses is a smaller
   key for everybody else.

   ON A BOX OF EITHER KIND. The first build drew the row on maths boxes only and fixed 146 of the 157;
   the other eleven have a word in their scheme as well as a sign (`x < 4 or x > 5`, `6:18 pm`), so
   they open on the letters, and the row is on their `123` face (`kpLayout_`). */
```

### ---------- THE KEYS

top level, before `KP_KEYS`

```
/* ---------- THE KEYS ----------------------------------------------------------------------------------
   SIX ACROSS, FIVE DOWN — the calculator's digit block on the left where every thumb already looks
   for it, and the structures on the right. Six columns is what fits a 44px key into a 320px phone
   with its 16px gutters: (320 − 32 − 5 gaps × 4) ÷ 6 = 44.7. Seven would not.

   `v` IS WHAT A KEY TYPES, OR A `!` COMMAND. The label is drawn; the `aria-label` is what a screen
   reader says, because "÷" read aloud is "division sign" on one phone and nothing on another.
   `x` is the LETTER and `×` the operator, and they are different keys because the marker keeps them
   apart wherever they could mean different things: `markNorm_` reads a letter `x` as times only with
   a number on BOTH sides (`2^3 x 11`, the keyboard's way of writing a product of primes), which no
   algebra writes, so `2x`, `3x^2` and `x = 3` keep their letter. The pad gives the sign its own key
   rather than leaning on that. The minus types a hyphen, which `markNorm_` folds with the other
   three. */
```

### ---------- ⌫ IS RED, AND ITS MARK IS DRAWN

in `KP_KEYS`

```
/* ---------- ⌫ IS RED, AND ITS MARK IS DRAWN ---------------------------------------------------------
     THE OWNER, 8 Oct, from a pupil's iPad in the sun: *"its hard to see keypad and each button especially
     backspace, which i thing should be red."* It was `⌫` in `--dim`, a thin outline glyph at 15px on a
     near-black key -- the font's own picture of a backspace, which in glare was a smudge. So the key is
     `--bad` (`.kp-del` in style.css; red is "something is wrong" everywhere else in this app, and this
     is the one exception, on the owner's word and because it is the key that destroys) and its mark is
     an SVG drawn here, black and 2.2 thick: white on that red is 2.99:1 and fails, black is 7:1. */
```

### ✓ IS SEND: the same paper aeroplane as the Send tile beside the box (`ansBox_`), because it is the same act -- one mark for "mark it" wherever the child is

in `KP_KEYS`

```
/* ✓ IS SEND: the same paper aeroplane as the Send tile beside the box (`ansBox_`), because it is the
     same act -- one mark for "mark it" wherever the child is looking. `icon` and not `t`, because
     `tileIcon_` is in tiles.js, which loads after this file; `kpKey_` draws it when the pad is built. */
```

### ---------- THE LETTERS

top level, before `kpCh_`

```
/* ---------- THE LETTERS ---------------------------------------------------------------------------
   THE PHONE'S OWN ROWS, because every child already knows where `e` is: q to p, a to l set in by half
   a key, z to m between ⇧ and the apostrophe, then the punctuation an answer is written with and a
   space bar. The bottom row is the maths pad's own -- 123 ← → ⌫ ✓ in the same places, the same
   colours, so the keys that move, delete and send do not move when the pad turns over.

   ON SIXTY COLUMNS, NOT TEN. Ten across is what a word keyboard needs and six is what the maths pad
   has; sixty is what both divide into, so a letter is 6, ⇧ and the apostrophe 9, the space bar 36,
   a bottom-row key 10 -- and the bottom row lands where the maths pad's does. The gaps are inside
   each key's own box (a transparent border, `#kp.is-abc` in style.css), so every pixel of the row is
   some key's.

   NARROWER THAN 44px, AND IT HAS TO BE. Ten keys across need 440px and a phone has 288 inside its
   gutters: a letter is 28.8px wide at 320 and 35.8 at 390 -- the phone's own keyboard is about 32 on
   that phone. Every key is still 44px or more TALL, in px; a tap in a gutter or between rows goes to
   the nearest key (`kpNear_`), so the edge keys reach the edge of the glass; and a pressed letter
   shows above the finger. `check/ui.js` carries the reason (`ACCEPTED_TAP`, `kp-ch`). On a tablet the
   letters pad widens to 640px so its keys are 60px.

   NO SHIFT FOR A MARK: `markNorm_` lowercases, and Gemini reads the meaning. ⇧ is for the child's
   own sentence -- see `kpShiftTap_`. */
```

### THE BOTTOM ROW, THE MATHS PAD'S OWN with `123` where `abc` was.

top level, before `KP_DONE_ESSAY`

```
/* THE BOTTOM ROW, THE MATHS PAD'S OWN with `123` where `abc` was. On a WORDED box its ␣ is a new line
   (↵), because the space bar is a row above and a paragraph is the one thing a sentence keyboard has
   that this would otherwise lack; ✓ stays "done", as on the phone's own `return`-less pad.
   ON AN ESSAY (`ansEssay_`) THAT SLOT IS THE SPACE AGAIN, exactly as on the maths face, because the
   essay's return has a key of its own on the row above (`KP_ABC_ESSAY`) -- one return, and a big one.
   AND ITS ✓ SAYS "done", NOT THE PAPER AEROPLANE. The aeroplane is Send's mark (`KP_KEYS`), and on an
   essay ✓ never sends: no essay has `accept`, so there is no Check for `kpDone_` to press, and it does
   not press Mark with AI (that spends one of the day's marks). Measured in the review of 9 Oct on an
   iPad: three paragraphs, the orange aeroplane tapped, the pad went away and nothing was marked -- the
   key promised the one thing it does not do. So on an essay it says what it does. */
```

### ---------- AN ESSAY'S LETTERS: A RETURN KEY YOU CAN SEE

top level, before `KP_RETURN`

```
/* ---------- AN ESSAY'S LETTERS: A RETURN KEY YOU CAN SEE -------------------------------------------------
   *"it doesnt let him do paragraphs"* (the owner, 9 Oct). It did, in a way nobody would find: the new
   line was `↵`, a grey glyph in the fourth place of the bottom row, the same size as ← and → beside it,
   and on a laptop Enter was ✓ -- so a child pressing Enter for a new paragraph put the pad away.

   SO AN ESSAY'S PAD HAS A PHONE'S RETURN: at the right-hand end of the space bar's row, where every
   phone keeps it, TWO LETTERS WIDE and saying "return" under its arrow. The space bar gives up the
   twelve columns (36 to 24 -- still four letters wide, 115px at 320). Not in the bottom row: that row's
   six keys are ten columns each because ten is what a 44px key needs at 320 (288 ÷ 60 × 10 = 48), so
   no key there can grow without another going under 44. The row above is letters, already narrower
   than a finger and carrying that reason (`ACCEPTED_TAP` in check/ui.js), and a 12-column key on it is
   57px at 320, 71px at 390 and 121px on a tablet -- and 44px or more tall everywhere, like every key. */
```

### A KEY IS A BUTTON AND NOT A TILE, the one place on a question's pages the owner's *"it should all be tiles"* does not reach, and on purpose:

top level, before `kpKey_`

```
/* A KEY IS A BUTTON AND NOT A TILE, the one place on a question's pages the owner's *"it should all be
   tiles"* does not reach, and on purpose: these are a KEYBOARD. Thirty keys in a grid have to be the
   grid's size and carry their glyph (7, π, √, a fraction drawn as two boxes) as the whole face; a tile
   is a 44px plate with an outline mark and its name in `title`, which on a key would be a picture of a
   7 called "7". Typing is the answer being given, as a multiple-choice option is (`choiceBox_`). */
```

### THE PAD'S KEYS FOR A LAYOUT AND A BOX.

top level, before `kpPadHtml_`

```
/* THE PAD'S KEYS FOR A LAYOUT AND A BOX. The maths layout grows its signs row only for a box that
   asked for one -- a worded box too, on its `123` face (`kpLayout_`); the letters' bottom row knows
   whether it is under words (`kpBottom_`). */
```

### ---------- THE BOX

top level, before `KP_HOLE`

```
/* ---------- THE BOX -----------------------------------------------------------------------------------
   THE DRAWING IS WHAT YOU SEE; THE BOX IS LAID OVER IT, INVISIBLE. The box has to be the real thing —
   it takes the focus, it is what the label names, it is what `qp-check` and the `input` listener read —
   and its own text cannot be typeset. So its ink is transparent and the `.kp-show` under it draws the
   same value, with a caret of its own where the box's is.

   ONE FUNCTION FOR BOTH KINDS, so nothing that draws an answer box writes a field of its own: `ansBox_`
   and `guideBox_` both call this, and the lock (`readonly`, `inputmode="none"`) is written here and
   only here. A MATHS ANSWER IS AN `<input>`; A WORDED ONE A `<textarea>`, because an input strips
   newlines and an answer written before 8 Oct on a phone's keyboard may hold them. `data-kp` says
   which layout the pad opens on.

   16px ON THE BOX, whatever the root says, because iOS zooms the page into any field smaller than
   that the moment it is focused — and a zoom the student did not ask for, on the box they are
   typing into, is the page lurching at the worst moment. The ink is invisible, so its size costs
   nothing on the screen. */
```

### `kind` 'essay' IS A WORDED BOX THAT IS A SHEET (`ansEssay_`):

top level, before `kpField_`

```
/* `kind` 'essay' IS A WORDED BOX THAT IS A SHEET (`ansEssay_`): the same locked textarea, opening on the
   same letters, and marked `data-kp-essay` so the pad gives it its return key (`KP_ABC_ESSAY`) and a
   laptop's Enter a new line (`kpKeys_`). `data-kp` stays "words", so everything a worded box does an
   essay does, and nothing that asks "is this words?" has a third answer to learn. */
```

### ---------- DRAWING WHAT HAS BEEN TYPED

top level, before `KP_SEL_A`

```
/* ---------- DRAWING WHAT HAS BEEN TYPED -------------------------------------------------------------
   THE VALUE, WITH A SLOT SHOWN WHEREVER ONE IS EMPTY. `(3)/()` is a fraction with nothing under the
   line yet, and drawn as `3/` it is a slanted slash with nothing after it — the student cannot see
   where the next digit will go. So an empty slot becomes a dashed box, the way Hegarty draws one,
   and the caret sits inside it.

   TWO GREEK LETTERS NOBODY TYPES STAND IN FOR THE BOX AND THE CARET while `typeset_` reads the
   string, because they are characters it already treats as part of a term (its ATOM class takes the
   whole Greek block). A `<span>` put in first would be split from its numerator; a letter is part of
   it. They are swapped for their spans after, and any already in the value are stripped first, so a
   pasted ϙ is not a slot.

   A SELECTION IS TWO MORE OF THEM, its two ends (`end` past `caret`): a laptop's Ctrl+A or ⇧+← in a
   maths box. A run cannot be wrapped in one `<mark>` the way a worded one is -- half a fraction is not
   an element -- so the ends are drawn as two empty spans and the band between them is laid over the
   drawing once it is on the page (`kpSelBand_`). */
```

### THE SLASH AS `&frasl;` AFTER ESCAPING, which is what `typeset_` stacks — `tbMath_` in find.js does the same for the textbooks.

in `kpTypeset_`

```
/* THE SLASH AS `&frasl;` AFTER ESCAPING, which is what `typeset_` stacks — `tbMath_` in find.js does
     the same for the textbooks. The hyphen as a real minus, because that is how the paper prints it
     and `typeset_` ends a term at one. */
```

### THE BAND BETWEEN A MATHS SELECTION'S TWO ENDS, measured off the drawing and laid over it in the field (`.kp-field` is the positioned box).

top level, before `kpSelBand_`

```
/* THE BAND BETWEEN A MATHS SELECTION'S TWO ENDS, measured off the drawing and laid over it in the
   field (`.kp-field` is the positioned box). Ends on two lines of a wrapped answer band the lines
   between them whole. In a try: a drawing that cannot be measured shows its ends and no band. */
```

### A WORDED ANSWER IS DRAWN AS THE TEXT IT IS:

top level, before `kpDraw_`

```
/* A WORDED ANSWER IS DRAWN AS THE TEXT IT IS: escaped, its newlines kept by `white-space: pre-wrap`,
   the caret a span between two halves -- and a laptop's Ctrl+A drawn as a marked run, because the
   next key replaces it and a selection you cannot see is a paragraph lost to one letter. */
```

### THE ESSAY'S WORD COUNT, KEPT WITH ITS DRAWING:

top level, before `kpCount_`

```
/* THE ESSAY'S WORD COUNT, KEPT WITH ITS DRAWING: every route that changes what the sheet shows -- a key,
   a laptop's key, an undo, a paste, the account's copy arriving from another device (`ansRefresh_`) --
   comes through `kpRender_`, so the count under the sheet cannot say one thing while the sheet says
   another. Written only when it changes. */
```

### AND WHETHER THE SHEET IS BLANK (`is-blank` on its field), which is what shows the hint on it -- "Press return to start a new paragraph".

top level, before `kpCount_`

```
/* AND WHETHER THE SHEET IS BLANK (`is-blank` on its field), which is what shows the hint on it -- "Press
   return to start a new paragraph". It was `:empty` on the drawing, and the caret is a span in the
   drawing: the review of 9 Oct watched the hint go the moment the sheet was tapped, before a letter,
   which is the moment it is for. So the field says "nothing written" for itself, and the stylesheet lays
   the hint behind the caret (`.qp-sheet .is-blank`) until the first key. */
```

### A WORDED DRAWING STOPS GROWING AT ABOUT FIVE LINES AND SCROLLS INSIDE (`.kp-words > .kp-show`) -- an essay's sheet at the room above the pad

top level, before `kpCaretSeen_`

```
/* A WORDED DRAWING STOPS GROWING AT ABOUT FIVE LINES AND SCROLLS INSIDE (`.kp-words > .kp-show`) -- an
   essay's sheet at the room above the pad (`.qp-sheet` in style.css) -- so the
   line being written is scrolled into its own window -- by `scrollTop` on the drawing, never
   `scrollIntoView`, which would scroll the transformed column the whole app is laid out on. */
```

### ---------- THE BOX THE PAD TYPES INTO, AFTER A REDRAW

top level, before `KP_WAS`

```
/* ---------- THE BOX THE PAD TYPES INTO, AFTER A REDRAW ---------------------------------------------
   THE OWNER, 8 Oct: *"they keypad was a bit unstable. it wasnt working at first for some reason."*
   Measured on the branch it was said about: a repaint replaces the card's markup -- `repaint()` on
   signing in, and again when `load()` lands about fifteen seconds later -- and the box the child is
   typing into goes with it. Chromium fires `focusout` for a removed element, so the pad closed and the
   next key did nothing. WebKit (the iPad) and jsdom fire NOTHING: the pad stayed up, `KP_AT` still
   named the removed input, and every key after that typed into a box that was no longer on the page --
   the 5 pressed after a redraw was lost without a trace, while the box on the screen still said 7.

   SO A KEY ASKS FOR THE LIVE BOX FIRST. Still in the page: that one. Gone: the box that replaced it,
   found by the answer key it carries (`data-k`, which is who and which question -- so a redraw after
   somebody else signs in finds nothing and the pad closes, rather than typing into their drawer), on
   the page in front first and anywhere in the document after that. Focused without scrolling (the
   columns are parked on transforms, CLAUDE.md), with the caret put back where it was (`KP_WAS`), and
   the pad stays up -- on the layout the child had. Nothing to find: the pad closes, which is what
   Chromium already did. The replacement is locked because `kpField_` drew it locked. */
```

### FOCUS THE REPLACEMENT, whose `focusin` reopens the pad on it (`kpOpen_`, which keeps the caret from `KP_WAS`).

top level, before `kpTake_`

```
/* FOCUS THE REPLACEMENT, whose `focusin` reopens the pad on it (`kpOpen_`, which keeps the caret from
   `KP_WAS`). A browser that takes the focus without the event -- a page that is not the front window
   -- gets the same `kpOpen_` called by hand. In a try, because an old browser refusing the options
   object must still leave the box focused. */
```

### ---------- OPENING AND CLOSING

top level, before `KP_AT`

```
/* ---------- OPENING AND CLOSING -------------------------------------------------------------------
   `KP_AT` IS THE BOX THE PAD IS TYPING INTO, and the focus is what sets it — the same signal the
   phone's keyboard answers to. A press on a key must not take the focus away from the box, so the
   pad swallows `mousedown` (whose default is moving the focus) and the box keeps it; `click` still
   arrives, which is what `on('kp-key')` answers.

   `KP_LAYER` IS WHICH FACE THE PAD SHOWS, 'maths' or 'abc'. A box opens on its own kind's (`data-kp`);
   `abc` and `123` turn it over; a box retaken after a redraw keeps the face the child was using. */
```

### THE PAD'S FACE FOR THIS BOX.

top level, before `kpLayout_`

```
/* THE PAD'S FACE FOR THIS BOX. Rebuilt only when what it should show has changed -- the layout, the
   kind of box, the signs row -- so a key pressed on the same face is pressed on the same button.

   THE SIGNS ROW IS THE BOX'S, NOT THE KIND'S. This said `!words &&`, and the review of 8 Oct found
   eleven marked questions it left with no way to be answered right: `x < 4 or x > 5`, `93.5 ≤ length
   < 94.5`, `6:18 pm` -- a word in the scheme makes them WORDS boxes, and every accepted way needs a
   sign that neither the letters nor a signless `123` has. So a worded box that asked for the row
   (`data-kp-signs`, `ansBox_`) shows it on its `123` face; its letters stay five rows. */
```

### `abc` AND `123`: the same pad turned over, the box keeping its focus and its caret.

top level, before `kpLayer_`

```
/* `abc` AND `123`: the same pad turned over, the box keeping its focus and its caret. The height does
   not change between the two -- five rows each, the same rows -- unless the maths face has its signs
   row, and then the room is asked for again. */
```

### THE CARET GOES TO THE END ON ARRIVAL -- where the next key belongs; ← and → move it from there, and a tap on the drawing puts it where the finger was

in `kpOpen_`

```
/* THE CARET GOES TO THE END ON ARRIVAL -- where the next key belongs; ← and → move it from there,
     and a tap on the drawing puts it where the finger was (`kpHit_`, after this).
     EXCEPT ON THE BOX THAT REPLACED THE ONE BEING TYPED IN (`kpLive_`): the student never left it, so
     the caret goes back to where it was -- inside the fraction's bottom, say, and not after it -- and
     the pad keeps the face it had. */
```

### ---------- AND THE BOX STAYS ABOVE THE PAD

top level, before `KP_ROOM`

```
/* ---------- AND THE BOX STAYS ABOVE THE PAD ---------------------------------------------------------
   THE PAD COVERS THE BOTTOM OF THE SCREEN, and a box near the bottom of a card is a box drawn
   underneath it — typing into something you cannot see. The phone's keyboard solves this by
   shrinking the viewport; a pad cannot, so the column it is in is given the pad's height as padding
   at its foot, for as long as the pad is up, and scrolled just enough to clear it. Taken off again on
   close, so the column is exactly as long as it was.

   WHAT IS KEPT CLEAR IS THE FIELD THE CHILD SEES (`kpBox_`, the label: the chat bar's paper pill, or a
   worksheet box with its question over it), not the invisible box inside it -- the pill is the thing
   that carries the ring and grows as a worded answer does.
   AN ESSAY'S IS THE ROW UNDER ITS SHEET (`.qp-sheet-foot`): the word count is what a pupil glances at
   while writing, so it stays above the pad with the sheet, and the sheet is sized to the room that
   leaves (`.qp-sheet` in style.css) -- the line being typed is kept in view inside it (`kpCaretSeen_`). */
```

### THE PAD'S HEIGHT, FOR THE STYLESHEET:

top level, before `kpPadH_`

```
/* THE PAD'S HEIGHT, FOR THE STYLESHEET: an essay's sheet is sized to the room above the pad (`.qp-essay`,
   `--kp-h`), and the pad is the one thing on the screen whose height a rule cannot know -- five rows or
   six, 44, 48 or 56px keys, and the phone's own safe area under them. Written when it changes. */
```

### ---------- AND AGAIN AS IT GROWS

top level, before `kpKeepClear_`

```
/* ---------- AND AGAIN AS IT GROWS -----------------------------------------------------------------
   A WORDED ANSWER GROWS A LINE AT A TIME, and the room asked for when the pad came up was for the box
   as it was then. Measured with the prototype on 8 Oct: two paragraphs into Q33's box at 320x568 put
   its foot 56px under the pad. So after every key, and after the pad turns over, the question is
   asked again -- and answered by the LIFT, never by `kpRoom_`, whose reset would drop the column and
   lift it again on every letter. The lift only grows while the pad is up; closing it lets go. */
```

### ---------- AN ESSAY'S SHEET IS AS TALL AS ITS CARD HAS ROOM FOR

top level, before `KP_SHEET_FLOOR`

```
/* ---------- AN ESSAY'S SHEET IS AS TALL AS ITS CARD HAS ROOM FOR ------------------------------------
   THE SHEET GROWS WITH THE ESSAY up to the room above the pad (`.qp-essay` in style.css), and the
   question is on the same card above it -- so a long essay made the CARD taller than its pane, and
   `paneReach_` (find.js) answers that by drawing the whole card smaller. Measured at 390x844 with
   three paragraphs: zoomed to 0.87, the 16px writing at 14, the Mark with AI tile at 38px, the sheet
   242px wide on a 390px phone. A sheet already scrolls inside, so it is the one thing on the card
   that can give room back without losing anything: it is capped, here, at what keeps its card inside
   the pane -- never under five lines -- and `paneReach_` then finds nothing to shrink. Where five lines
   and the question still do not fit (320x568), the card is not drawn smaller either: its pane scrolls
   (`PANE_ZOOM_ESSAY` in find.js). Called by
   `paneReach_` itself, at zoom 1 and before it measures, every time it measures a pane that holds an
   essay: on a paint, on a rotation, and whenever the card grows (its `ResizeObserver`). The cap is
   taken off first, so the sheet is measured at the stylesheet's, then every read, then the one write
   -- one forced layout per essay on the screen, and none for any other pane. In a try: a sheet that
   cannot be measured keeps the stylesheet's cap. */
```

### ---------- A CARD WITH NOTHING TO SCROLL IS LIFTED WHOLE

top level, before `KP_LIFT`

```
/* ---------- A CARD WITH NOTHING TO SCROLL IS LIFTED WHOLE -----------------------------------------
   MEASURED ON 5 OCTOBER, AFTER THE CARD IN FRONT WAS CENTRED: at 320x568 the pad's top is at 315px
   and every answer box on a paper's question card bottomed out at 317–327px — under the pad on 8
   pages of 8, against 1 of 8 when cards hung from the top line. A card whose content fits is
   `overflow: hidden`, so the scroller search above finds nothing and the box stayed where it was,
   and the hold on focus (`HOLD_AT`) then kept it there.

   SO THE COLUMN GOES UP INSTEAD, by exactly what the box is short of, through the same hold —
   `columnShift_` reads `lift` — so a box that grows as you type grows downward from a card that is
   no longer moving, and swiping away lets go of both at once.

   WORKED OUT FROM WHERE THE COLUMN IS GOING, NOT WHERE IT IS DRAWN. A box's distance from the top of
   its column does not change when the column moves, so: the column's unmoved top, plus the shift it
   is held at with no lift, plus that distance. A rectangle read off a column still settling would
   lift by the wrong amount and keep it -- and asked again after every key (`kpKeepClear_`), it is the
   same answer however often it is asked. */
```

### ---------- WHAT A KEY DOES

top level, before `kpPartner_`

```
/* ---------- WHAT A KEY DOES -----------------------------------------------------------------------
   EVERY STRUCTURE IS TYPED WITH ITS SLOTS, and the caret goes into the first one. A fraction after a
   number takes that number as its top — `3` then the fraction key is three over a slot, which is how
   a calculator's `a/b` behaves and how a person says it. With nothing before it, both halves are
   slots. → steps over `)/(` in one press, from the top of a fraction to its bottom; one press per
   bracket would be three presses to cross one line.

   ⌫ TAKES AN EMPTY STRUCTURE AWAY WHOLE. Deleting `(` out of `^()` one character at a time leaves a
   `^)` that is not maths and not a slot, and the student has to find the stray half.

   AND IT NEVER TAKES HALF OF A FILLED ONE. That promise had a hole in it, measured on 8 Oct: after a
   filled slot ⌫ deleted the `)` on its own -- `123/(4)` then ⌫ was `123/(4`, and the next key made it
   `123/(46`. So a bracket with something between it and its partner is not deleted, it is STEPPED
   OVER: ⌫ after a `)` moves the caret inside, to the end of what the slot holds; ⌫ just inside a `(`
   moves the caret out to the left -- across `)/(` into the top of a fraction, across `^(` and `√(` to
   before the sign, across `/(` to the number over it -- and ⌫ just after a sign whose slot is filled
   steps back over the sign. Each of those deletes nothing; the next ⌫ deletes a digit, and a slot
   emptied that way goes whole by the rule above. EVERY PAIR, not only the ones a structure key typed:
   `(3)/()` loses its bottom whole and leaves `(3)`, and if those brackets could then be deleted one at
   a time, `(3` would be the stray half again. A bracket with no partner -- the ( key pressed alone --
   deletes like any character, because there is no other half to strand.

   A WORDED BOX HAS NO STRUCTURES, so none of that applies to it: ⌫ deletes the character before the
   caret, brackets included -- "(see above)" is prose, and stepping into it would be a key that
   sometimes does nothing. */
```

### ---------- HOME AND END ARE THE LINE'S, CTRL/⌘ WITH THEM THE WHOLE ANSWER'S

top level, before `kpLineStart_`

```
/* ---------- HOME AND END ARE THE LINE'S, CTRL/⌘ WITH THEM THE WHOLE ANSWER'S ----------------------------
   THEY WERE THE WHOLE ANSWER'S, and while every answer was one line nobody could tell. Then an essay
   became an answer (docs/history/312) and the review of 9 Oct measured it on a laptop: the caret in the
   third paragraph, Home, and it was at the start of the essay (58 -> 0); End went to its last letter.
   So Home and End stop at the line the caret is in -- the stretch between two newlines, which in an
   essay is a paragraph -- and Ctrl/⌘ with them goes to the very start or end, as in every editor. The
   paragraph and not the wrapped line on the screen, because the value knows where its newlines are and
   only the drawing knows where it wrapped: one line read off the value is the same answer on every
   device and in `check-flow.js`, where nothing is laid out. A maths box is one line, so for it nothing
   changes. */
```

### THE SAME EVENT A KEYBOARD SENDS, so find.js's listener saves it under `ansKey_` and takes a stale verdict off it, exactly as it does for a typed letter.

in `kpEdit_`

```
/* THE SAME EVENT A KEYBOARD SENDS, so find.js's listener saves it under `ansKey_` and takes a stale
     verdict off it, exactly as it does for a typed letter. One path for both, or the pad is a second
     way to answer that the rest of the app does not know about. ONLY WHEN THE ANSWER CHANGED: a caret
     moved is not a new answer, and it took "Correct" off one that had not changed. */
```

### ---------- UNDO, BECAUSE `readonly` TOOK THE BROWSER'S

top level, before `KP_UNDO`

```
/* ---------- UNDO, BECAUSE `readonly` TOOK THE BROWSER'S ------------------------------------------
   THE REVIEW OF 8 OCT, measured on a laptop: Ctrl+A and then any letter wiped a paragraph, and Ctrl+Z
   did nothing -- `readonly` stops the browser's own undo along with its typing, and the textarea a
   worded answer was before that day had one. So every change the pad's edit makes, from a thumb or a
   keyboard, is noted on the box's own list, and Ctrl/⌘+Z walks it back, ⇧+Ctrl/⌘+Z or Ctrl+Y forward
   (`kpKeys_`).

   BY THE BOX'S KEY (`data-k`), NOT THE ELEMENT: a redraw replaces the element under the child
   (`kpLive_`) and the history has to survive it. A RUN OF LETTERS IS ONE STEP, a word at a time, and a
   run of ⌫ is one, as in every editor -- a step per letter would undo a sentence a letter at a time.
   A run is the same kind of key, at the caret the last one left, inside two seconds.
   ---------- EACH STEP KEEPS WHOSE THE ANSWER WAS AT THAT VALUE (`mark`; answers.js, `ansPutBack_`) ----------
   A SIGNED-OUT ANSWER CAN BE SOMEBODY'S: typed after the server ended their session, it is marked as theirs
   and goes to nobody else (docs/history/317). Emptied, it is nobody's — and Ctrl+Z put Ada's words straight
   back after a visitor's Ctrl+A and Backspace (or a held Backspace, or one letter typed over all of it),
   judged as a new answer with no mark, so Ben, signing in next, was handed them and they went to HIS account.
   So a step remembers the mark the box had at the value it undoes to, read before the edit changes it, and
   Undo and Redo write that value back with that mark. */
```

### ---------- A KEY, FROM THE PAD OR A KEYBOARD

top level, before `KP_WORD_SIGN`

```
/* ---------- A KEY, FROM THE PAD OR A KEYBOARD -----------------------------------------------------
   ONE PATH FOR BOTH (`kpType_`): the edit, the drawing, the capital for the next letter, the room
   above the pad, and the line a screen reader hears. `typed` is a laptop's key, which carries its own
   case -- the pad's ⇧ is for the pad's letters. On a WORDED box the maths face's structure keys type
   their plain signs, because a worded drawing is plain text and `(3)/()` in a sentence is noise. */
```

### ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs, not a copy of it — and otherwise it is "I have finished"

top level, before `kpDone_`

```
/* ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs,
   not a copy of it — and otherwise it is "I have finished", which puts the pad away. NOT "Mark with
   AI": that spends one of the day's twenty marks, and a ✓ pressed to put the pad away should not
   spend one. Pressing the tile beside the box is how a worded answer is sent. */
```

### ---------- ✓ — THE GOLD SEND KEY, AND ENTER ON A LAPTOP — RUNS THE BOX'S OWN SEND

top level, before `kpDone_`

```
/* ---------- ✓ — THE GOLD SEND KEY, AND ENTER ON A LAPTOP — RUNS THE BOX'S OWN SEND -----------------------
   IT RAN `.qp-check` AND NOTHING ELSE, found anywhere on the card. Since 9 Oct an answer reaches the account
   only when it is SENT (js/submit.js), and most boxes have no Check: about 399 maths answers with no scheme,
   every worksheet box and every worded box while AI marking is off carry the plain Send (`qp-send`), and a
   worded box with a scheme for Gemini carries Mark with AI. The review of 9 Oct drove it in Chromium at
   390x844, signed in: Q-1MA1-1811-1H-15, 42 typed, the gold key tapped, then Enter — the pad went away,
   nothing was recorded, no verdict appeared, and the line under the box said "On this device until you
   send it". The worksheet the same. Those answers had reached the account as they were typed until that
   day, so it was a regression in exactly what the owner asked to have recorded — under a key drawn as
   "the same paper aeroplane as the Send tile ... because it is the same act".
   SO IT IS THE SAME ACT: the box's own control, found from the box (`.qp-mark`, which a worksheet has one
   of per box), in the order the box draws one — Check, else the plain Send, else Mark with AI while it
   can be pressed — through the same handler a tap on the tile runs.
   NOT ON AN ESSAY. Its key says "done", not the aeroplane, and never sends (note 312): Mark with AI spends
   one of the day's marks, and an essay is sent from the row of tiles under it. A box with no control at
   all (signed out, nothing to send it to) only puts the pad away, as it always did. */
```

### ---------- CAPITALS

top level, before `KP_SHIFT`

```
/* ---------- CAPITALS ------------------------------------------------------------------------------
   THE PHONE'S OWN RULES, because they are the ones a child's thumbs already know. ⇧ capitalises the
   next letter; two taps inside 350ms is caps lock, drawn as a bar under the key; a tap while it is on
   turns it off. In a WORDED box a capital comes on by itself at the start, after `. ? !` and a space,
   and on a new line -- and never in a maths box, where `X` and `x` are different answers. */
```

### ---------- A TAP BETWEEN KEYS IS THE NEAREST KEY

top level, before `kpNear_`

```
/* ---------- A TAP BETWEEN KEYS IS THE NEAREST KEY ---------------------------------------------------
   THE LETTERS ARE NARROWER THAN A FINGER, so the pad's own gutters and the gaps between its rows are
   live, as they are on the phone's keyboard: a tap there goes to the nearest key -- in the ROW the
   finger was in first, then along it. Measured with the prototype: by distance alone a tap in the
   left gutter beside `a` at 390 picked `q` above it. Not after a slide (`PRESS_MOVED`), which the
   click handler in shell.js swallows for every other control. */
```

### ---------- ⌫, ← AND → REPEAT WHILE HELD

top level, before `KP_HOLD`

```
/* ---------- ⌫, ← AND → REPEAT WHILE HELD -------------------------------------------------------------
   A SENTENCE TAKES A LOT OF DELETING ONE TAP AT A TIME, and every keyboard a child has used repeats a
   held delete. After 450ms, every 70ms, until the finger lifts; the click at the lift is the press
   already counted (`KP_REPEATED`). */
```

### ---------- WHAT A SCREEN READER HEARS

top level, before `KP_SAY`

```
/* ---------- WHAT A SCREEN READER HEARS ------------------------------------------------------------
   A KEY SAYS ITS OWN NAME, and nothing said what the box had become -- the drawing is `aria-hidden`,
   because a fraction read as its markup is noise. So a moment after the last key the box's content is
   said, maths read the way a person would say it ("3 over 4"), words the sentence being written. */
```

### ---------- A TAP ON THE BOX

top level, before `kpOfTap_`

```
/* ---------- A TAP ON THE BOX ------------------------------------------------------------------------
   THE BOX TAKES NO TAPS (`pointer-events: none` in style.css), so a tap lands on its drawing inside the
   `<label>`, and the label would hand it to the box: a second click, sent to the box, which focuses it
   natively -- the very thing that offers iOS a field to type into. So the label's own click is
   cancelled and the box is focused here instead.

   AND ITS `mousedown` IS SWALLOWED, the pad's own trick: measured without it, a tap on a box that
   already had the focus blurred it first, the pad closed, and the refocus put the caret at the end and
   scrolled before the tap was read -- a tap on character 18 landed at 316. So the focus stays, and the
   caret is read off the drawing AS IT WAS WHEN TAPPED (`kpHit_`), before anything redraws or lifts it.
   A swipe that ends on the box is a swipe (`PRESS_MOVED`), and opens nothing. */
```

### ---------- WHERE IN THE ANSWER A FINGER LANDED

top level, before `kpHit_`

```
/* ---------- WHERE IN THE ANSWER A FINGER LANDED -------------------------------------------------------
   WORDS: the browser's own answer (`caretPositionFromPoint`, or `caretRangeFromPoint` where that is all
   there is), kept only when it lands inside the drawing -- and otherwise every character's box,
   nearest line first, then the nearer edge. Safari needs the second: WebKit will not place a caret in
   `user-select: none` text, and the drawing is `user-select: none` so a long press shows no loupe.
   Measured, the two agreed at 52 of 52 points, 0.42ms and 1.51ms a tap over 358 characters.

   MATHS: a stacked fraction has no text offsets to ask about, so every place the caret could go is
   drawn, side by side in one host fixed on <body>, read after ONE layout, and the nearest kept. One
   layout per place was 735-952ms on a 6,000-element page; one for all of them is 47-81. Fixed on <body>
   and not in the column, because `position: fixed` inside a transformed ancestor is relative to it. */
```

### TAKEN AWAY, NOT LEFT:

top level, before `again`

```
/* TAKEN AWAY, NOT LEFT: a box that is no longer in the page lost the focus because a redraw
       replaced it, not because the student went anywhere. Chromium says so with this event; the box
       that replaced it is found by its key and focused, and the pad stays up on it (`kpLive_`, which
       is how WebKit, firing nothing, is caught on the next key instead). */
```

### ---------- A LAPTOP'S KEYBOARD, AND AN iPAD'S

top level, before `kpKeys_`

```
/* ---------- A LAPTOP'S KEYBOARD, AND AN iPAD'S ---------------------------------------------------------
   A READONLY BOX TAKES NO KEYS OF ITS OWN -- measured: `a`, Backspace and → arrive as `keydown` and
   change nothing -- so each is sent through the pad's own edit, which is better than the native typing
   it replaces: a laptop's Backspace now keeps the fraction's brackets paired, as ⌫ does. Enter is ✓;
   Shift+Enter is a new line in a worded box (and Enter too, in an essay -- below); Escape puts the pad
   away. Tab is the browser's, which moves to the next box. Option on a Mac types `≤` and `≥` with `,` and `.`, so Alt alone is let
   through as a character. Composition (an IME mid-word) is the browser's until it ends.

   AND WHAT A TEXT BOX'S KEYS DID THAT `readonly` TOOK, put back after the review of 8 Oct measured
   each one gone in Chromium:
   - ⇧ with ← → Home End (↑ ↓ in words) GROWS THE SELECTION from where it began (`kpExtend_`); it
     moved the caret and dropped the selection.
   - Ctrl/⌘+Z UNDOES and ⇧+Ctrl/⌘+Z or Ctrl+Y redoes, through the box's own history (`kpUndo_`). Ctrl+A
     then a letter wiped a paragraph with no way back.
   - Ctrl/⌘+X CUTS (the `cut` listener below); it did nothing.
   - ALTGR TYPES. On Windows it arrives as Ctrl+Alt, and `€`, `á` and, on many European layouts, `@ { }`
     were dropped as a shortcut. A one-character key with Ctrl and Alt both down, or the AltGraph
     state, is a character.
   Ctrl/⌘ with anything else -- copy, select all, the browser's own -- is still the browser's.

   IN AN ESSAY ENTER IS A NEW LINE, as it is in every place a child has ever written more than a
   sentence. The owner, 9 Oct: *"it doesnt let him do paragraphs"* -- and on a laptop it did not, in the
   most natural way possible: Enter for a new paragraph put the pad away. Shift+Enter is a new line too,
   for the hand that learnt the short box; Ctrl/⌘+Enter is "done" (✓), the way a message box sends, and
   Escape still puts the pad away. A SHORT worded box keeps Enter as ✓: "egestion" and Enter is an
   answer sent, and a new line in it would be a second line nobody asked for. */
```

### ↑ AND ↓ IN A WORDED BOX:

top level, before `kpLine_`

```
/* ↑ AND ↓ IN A WORDED BOX: the caret a line up or down, read off the drawing the way a tap is. With ⇧
   the selection's moving end goes, and its other end stays. Measured from a caret drawn where that end
   is, because a selection is drawn as a run with no caret in it. */
```

### CTRL/⌘+X: THE SELECTION TO THE CLIPBOARD, THEN TAKEN OUT THROUGH THE PAD'S EDIT.

top level, before `KP_CUT`

```
/* CTRL/⌘+X: THE SELECTION TO THE CLIPBOARD, THEN TAKEN OUT THROUGH THE PAD'S EDIT. Chromium fires
   `cut` on a readonly box (measured) and does nothing else with it, so the listener below does the
   work; the key asks for that event itself (`execCommand('cut')`), so that a browser which fires none
   on a readonly box -- WebKit's Cut is disabled on one -- is seen to, and gets a copy and a delete
   instead. Nothing selected, nothing cut. Nothing copied, nothing deleted: text taken out that is not
   on the clipboard is lost. */
```

### MARK WITH AI — A WORDED ANSWER, MARKED BY GEMINI AGAINST THE SCHEME THE CARD ALREADY HOLDS.

top level, before `AI_OFF`

```
/* ==================================================================================================
   MARK WITH AI — A WORDED ANSWER, MARKED BY GEMINI AGAINST THE SCHEME THE CARD ALREADY HOLDS.

   `markAnswer_` CANNOT MARK A SENTENCE and should not try: "explain why the rate increases" has no
   string to compare against, and a marker that pattern-matched keywords would tell a child they were
   right for writing the right nouns in the wrong order. 578 rows of the library are `explain` and
   145 `written`, and all of them had a box that could do nothing but wait for the tutor.

   SO THE BACKEND ASKS GEMINI (`aiMark` in dopost.gs) with the question, the mark scheme and the
   answer, and draws what comes back: marks out of the question's marks, and one sentence. The key is
   in Script Properties and never here — the phone only learns whether there is one (`aiMarking`).

   OFFERED ONLY WHERE IT CAN BE RIGHT: a worded answer, with a scheme to mark against, and no
   `accept` — where there is one, Check is exact and free, and a model's opinion would only be a
   second, worse verdict on the same answer.

   AN ESSAY IS MARKED AS ONE (`ansEssay_`, 9 Oct): the whole of it sent, not its first 2,000 characters,
   and marked strand by strand against the scheme's levels, with two or three things to do next instead
   of one sentence -- see `aiMarkAsk_` in dopost.gs. The reply is the same shape either way; the points
   come as lines of `feedback`, drawn as lines (`.qp-ai-why`).

   OFF IS QUIET. No key (`aiMarking: false`), or a deployment that does not have the action (`features`),
   draws no button at all -- and on an essay, one faint line saying so (`aiWhyNot_`). A key that went
   away since the payload was cached answers `why: 'ai-off'` on the first press, and from then every AI
   button on the screen is greyed and says so — one press wasted, never a button that keeps doing nothing.

   A TILE, WHERE SEND IS AND SHAPED LIKE IT, because it is the same act on a different kind of answer.
   This said "a form's button ... the answer box is a form, and its buttons belong to it" -- the house
   rule, and Check was a gold button beside it on the same argument. The owner overruled it for a
   question's pages, one control at a time and then all at once: *"check button should be a tile"*,
   then *"it should all be tiles."* So Mark with AI is a tile with a sparkle on it (`spark`, the mark
   every phone puts on "a model did this"), `.qp-ai-go` the name the handler and the checks find it
   by, and `disabled` when the server says there is no key -- which a tile draws without its plate.
================================================================================================== */
```

### ---------- NOT KNOWN YET IS NOT OFF (review of 10 Oct)

top level, before `aiUndecided_`

```
/* ---------- NOT KNOWN YET IS NOT OFF (review of 10 Oct) --------------------------------------------------
   `aiOffered_` reads the payload, and before the payload lands — fifteen seconds on the live site, on every
   reload — `DATA.features` is not there, which it read as "off". Saved and Find's search draw a kept card
   before then: an AQA essay with AI marking on was drawn with the plain Send and "AI marking isn't switched
   on yet" under it, measured at 320 against the real backend; pressed, the forty-mark essay went to the
   account as an unmarked "Sent" (and to the parent's email), and when the payload landed the same tile
   became Mark with AI over a verdict line still saying Sent. The one loader's rule (note 306): something the
   payload decides waits for the payload, and is not drawn as a wrong answer with a sentence under it. So
   while it is out the tile is Mark with AI, where it will stand, and cannot be pressed (`off`: a tile drawn
   without its plate); no sentence says why nothing marks it (`aiWhyNot_` is only asked where there is no
   tile); and the repaint the payload makes draws the tile it decided on — Mark with AI, or the plain Send
   and its sentence. */
```

### THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the bar, its verdict line and the sentence under it are

top level, before `aiTile_`

```
/* THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the
   bar, its verdict line and the sentence under it are `ansBox_`'s, so one function lays out both. This
   was `aiBox_`, which drew its own row under the box. */
```

### ---------- AND DECIDED WHERE IT STANDS, THE MOMENT THE PAYLOAD SAYS (`adoptMarks_`, shell.js)

top level, before `aiDecided_`

```
/* ---------- AND DECIDED WHERE IT STANDS, THE MOMENT THE PAYLOAD SAYS (`adoptMarks_`, shell.js) ----------
   THE REPAINT IS NOT ALWAYS THERE TO DO IT. Find is held back from a repaint while a child is typing in it
   (`findKeep_`, answers.js) and over a verdict on the screen — and a child who searched for the essay and
   started writing inside the fifteen seconds is exactly that child: the payload lands under her fingers,
   the column waits, and the tile she reaches for at the end is still the waiting one, a press that does
   nothing (review of 10 Oct, after the waiting tile went in). So a waiting tile still drawn when the
   payload lands is decided in place: AI marking on, it is the very tile a fresh drawing draws, plate and
   all, and is simply let go. Off, the plain Send and its sentence are a different row (`.qp-ai-say`, the
   note, the class), so it stays waiting until the column's own repaint draws that row — which the held
   column has booked (`STALE`) and does as the box is left. */
```

### THE QUESTION AS WORDS.

top level, before `aiPlain_`

```
/* THE QUESTION AS WORDS. The library's markup carries fractions as `<sup>`/`&frasl;`/`<sub>` and
   powers as `<sup>`, and stripping the tags would hand Gemini `34` for three quarters and `x2` for x
   squared — so those two are written out first, then the rest read as text by a parser that runs no
   scripts and fetches no pictures. */
```

### ---------- HOW MUCH GOES TO GEMINI, AND THE SAME NUMBERS ON THE SERVER

top level, before `AI_ANSWER_MAX`

```
/* ---------- HOW MUCH GOES TO GEMINI, AND THE SAME NUMBERS ON THE SERVER ------------------------------
   THE ANSWER WAS CUT AT 2,000 CHARACTERS by the backend (`aiMark` in dopost.gs) -- about 350 words, so a
   40-mark essay was marked on its first third and the rest was never read. A top-band GCSE essay is
   600 to 1,000 words, about 6,000 characters; 20,000 is that three times over, room for the longest a
   pupil will write in a sitting and still a ceiling on what one request can spend. The question and the
   scheme go to 8,000 each: an English question's stem can be a source extract, and a levelled scheme
   with both of its assessment objectives written out is longer than the one-line schemes 3,000 was
   sized for. SAID HERE AND IN dopost.gs, AND THE SAME: a phone that sends more than the server keeps is
   a phone that believes the whole essay was marked. `check-aimark.js` asks the server's;
   `check-flow.js` sends a 6,000-character answer through the real handler and looks for all of it. */
```

### ---------- AND WHEN THERE IS NO TILE, A LINE SAYING WHY

top level, before `aiWhyNot_`

```
/* ---------- AND WHEN THERE IS NO TILE, A LINE SAYING WHY -------------------------------------------
   AN ESSAY WITH NOTHING UNDER IT IS A QUESTION NOBODY WILL MARK, said by saying nothing. With AI marking
   off -- no key in Script Properties, or a deployment from before `aiMark` -- the sheet had no tile and
   no word about why, and a pupil who had just written forty marks' worth looked for the button that was
   not there. So the row under the sheet says so, in the faint voice of the saved line: one sentence,
   never a control (a greyed tile that cannot be pressed is the control that does nothing). Signed in
   only -- it is a pupil's question, and a stranger browsing the library is not waiting for a mark.
   Only where AI marking COULD have been offered (`aiWanted_`): a box with a scheme to Check against has
   Send, and a box with no scheme at all has nothing to be marked against, by a model or otherwise. */
```

### AND THE BOX KEEPS A WAY TO SEND.

top level, before `aiOff_`

```
/* AND THE BOX KEEPS A WAY TO SEND. Greyed and left, the tile was a box with nothing to press: since 9 Oct
   an answer reaches the account only when it is SENT (js/submit.js), so a worded answer written while
   the AI went away would never leave the iPad. The tile becomes the plain Send (`qp-send`, verdict
   `sent`) where it stands — the same gold disc in the same place — and the line still says why it is
   not being marked. The next drawing of the card draws the plain Send itself (`aiTile_` answers '' once
   `AI_OFF` is set). */
```

### ---------- A BACKEND THAT READS THE WHOLE ESSAY SAYS SO (`aiMarkWhole` in `features`)

top level, before `AI_ANSWER_OLD`

```
/* ---------- A BACKEND THAT READS THE WHOLE ESSAY SAYS SO (`aiMarkWhole` in `features`) ----------------
   THE FRONT END GOES LIVE A MINUTE AFTER A PUSH AND THE BACKEND WHEN THE OWNER PULLS IT INTO THE APPS
   SCRIPT EDITOR (CLAUDE.md, "Deploying") -- and until that pull the live `aiMark` still lists itself in
   `features`, still cuts the answer at 2,000 characters and ignores `essay`. Found in the review of 9 Oct:
   this phone drew Mark with AI, posted a 6,000-character essay whole, and showed "N of 40 marks · AI" for
   its first 350 words with nothing to say a third was read -- the very fault the raised ceiling was for,
   carried by a deploy gap. So the backend that keeps the whole answer says so in `features`, the way
   `attemptWords` said the attempts tab kept a question's words (and `submitAnswer` says the submissions
   tab is there, note 308), and a phone told nothing sends no answer
   longer than the old cut: it says why in one sentence instead of spending one of the day's marks on a
   mark for part of an essay. A short answer, or an essay under 2,000 characters, is read whole by either
   backend and goes as it always went. */
```

### ---------- AN ESSAY'S MARK STAYS WHILE IT IS REVISED, AND ACROSS A RELOAD

top level, before `AI_KEPT`

```
/* ---------- AN ESSAY'S MARK STAYS WHILE IT IS REVISED, AND ACROSS A RELOAD ----------------------------
   TYPING TOOK THE AI'S VERDICT OFF, for every box (the `input` listener below) -- right for "egestion",
   where the next key is a new answer. Wrong for an essay, measured in the review of 9 Oct: marked 27 of
   40 with three things to do next, the sheet tapped to start on them, one space typed -- and the mark and
   every point were gone, and gone after a reload, and the only way back was another request, one of the
   day's twenty. The points are meant to be acted on WHILE the essay is edited.
   SO AN ESSAY'S MARK IS KEPT WITH ITS ANSWER: on this device, under the answer's own key (`ansKey_`, so
   it is this person's and nobody else's on a shared iPad), with the exact text it marked. Drawn again
   when the card is (`ansBox_`), and while the essay is not the text that was marked it is said to be
   STALE -- "· before your changes", in the plain dim of a line with no verdict, the green or amber ring
   taken off the sheet -- and the points stay under it. Undo back to the marked text and it is fresh
   again. In memory too (`AI_KEPT`), so private mode, which throws on `localStorage`, still keeps it for
   the visit. Not on the account: a mark is a reading of one draft, and the draft is what is synced. */
```

### ONE OF THE THREE, and a forced `toggle` writes nothing that is already so -- this is asked on every key typed into an essay that has a kept mark.

in `aiKeptPaint_`

```
/* ONE OF THE THREE, and a forced `toggle` writes nothing that is already so -- this is asked on every
     key typed into an essay that has a kept mark. ASKED BY THREE: the `input` listener below (a key),
     `ansBox_` through `aiKeptView_` (the card drawn), and `ansRefresh_` in answers.js (the account's
     copy arriving from another device, which comes with no `input` event and used to blank the verdict
     and leave its points under an empty line). */
```

### THE SOUND IS WOKEN NOW, INSIDE THE TAP, and held awake until the reply, because the verdict lands after the network and an iPad lets a page start sound only

top level, before `k`

```
/* THE SOUND IS WOKEN NOW, INSIDE THE TAP, and held awake until the reply, because the verdict lands after
     the network and an iPad lets a page start sound only from a tap (`markWait_`, js/submit.js, note 340).
     AND WHETHER THE CHILD IS AT THIS CARD -- its box on the page in front -- asked again as the verdict
     lands, so a verdict that lands after they have moved on is drawn in its slot and not heard over the
     next question. */
```

### `essay` ASKS FOR THE LEVELLED MARKING (`aiMarkAsk_` in dopost.gs):

top level, before `essay`

```
/* `essay` ASKS FOR THE LEVELLED MARKING (`aiMarkAsk_` in dopost.gs): each strand the scheme names
     marked on its own levels and summed, and two or three things to do next rather than one sentence.
     The same predicate that drew the sheet, so a box drawn as an essay is marked as one. */
```

### A VERDICT IS ABOUT THE ANSWER IT MARKED.

top level, before `out.textContent`

```
/* A VERDICT IS ABOUT THE ANSWER IT MARKED. Typed over while Gemini was thinking, it is about an
         answer that is no longer in the box — the rule the `input` listener in find.js keeps for Check.
         AN ESSAY'S IS KEPT ANYWAY, as the mark of the draft it read, and drawn as stale (`aiKeep_`). */
```

### MARKED IS A SUBMISSION — the answer and its marks, `ai:3/4`, one event on the account like a Check (js/submit.js).

top level, before `a`

```
/* MARKED IS A SUBMISSION — the answer and its marks, `ai:3/4`, one event on the account like a Check
         (js/submit.js). The marks are whole numbers the server already held to the question's marks;
         anything else is recorded as sent, never as a score nobody gave. The sentence is not kept: it is
         about this answer, and the next device shows the marks. AN ESSAY'S TOO — the merge with note 312
         found its kept mark returning before this line, so the forty-mark answers the sheet was built
         for were the one kind never recorded. Recorded with the words that were MARKED (`sent`), so an
         essay typed on while Gemini read it is a press about the earlier words, as its kept mark is. */
```

### TYPING TAKES THE AI'S SENTENCE OFF, as find.js's listener takes the verdict off every box — that one draws the verdict line from the latest submission now

top level, before `el`

```
/* TYPING TAKES THE AI'S SENTENCE OFF, as find.js's listener takes the verdict off every box — that one
   draws the verdict line from the latest submission now (`subVerdictPaint_`), Mark with AI's included,
   so this is left the one thing the store does not keep: the AI's sentence about the answer it marked.
   Not while it is still marking: the answer it was sent is compared when the reply lands. AN ESSAY'S
   POINTS ARE NOT TAKEN OFF HERE AT ALL: they are kept with the words they marked (`aiKeptPaint_`, above,
   note 312), and `subVerdictPaint_` draws them with its verdict line, fresh or "before your changes" —
   or takes them off when a newer submission is about the words in the sheet. */
```

