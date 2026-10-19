# check/cards.js

The full text of comments in `check/cards.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/cards.js EVERY QUESTION IN THE LIBRARY, LAID OUT AT PHONE WIDTH, MEASURED.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/cards.js

   EVERY QUESTION IN THE LIBRARY, LAID OUT AT PHONE WIDTH, MEASURED.

   WHY THIS EXISTS, AND IT IS THE SHARPEST VERSION OF A FAULT THIS REPOSITORY KEEPS FINDING.
   `check/ui.js` drives the real app through its own `go()` and measures what is on the screen. That
   is the right instrument for a SCREEN — but the Find screen's results are a strip of pages filled
   lazily, five either side of where you are, so one run renders about six cards out of four
   thousand. Measured: searching a common word gives 1,063 hits and puts SIX of them in the DOM, all
   from the same worksheet.

   SO THE APP CAN BE GREEN AND THE LIBRARY BROKEN. Fifty-one questions carry the printed paper's
   dotted answer line — the longest 128 characters with no space in it, which to a browser is one
   unbreakable word — and every one of them took the card, the pane and the page sideways. `ui.js`
   measures exactly that fault, has run on every commit for weeks, and never saw one, because the
   page it was on did not happen to hold one.

   A SAMPLE IS NOT A SWEEP. Widening the sample would have made the odds better and the claim no
   truer. What is actually needed is to measure the CONTENT rather than the screen: a question's
   markup either fits a 320px column or it does not, and that has nothing to do with which page of
   the funnel you are on. Four thousand of them go into one document in one page load.

   IT IS NOT A SECOND `ui.js` AND MUST NOT GROW INTO ONE. `ui.js` owns the app — navigation, tap
   targets, contrast, the parked screens, who is looking. This owns the LIBRARY, at one width, with
   one question: does this row's own markup fit. Two instruments, two subjects, and the line between
   them is whether the answer could change when somebody edits a cell.

   THE WIDTH IS 320 because that is the narrowest phone still in use and the one everything breaks
   on first — the same constant `ui.js` opens its list with, and for the same reason.

     node check/cards.js            every question row
     node check/cards.js --shots    also writes a PNG of the worst offenders
================================================================================================== */
```

### ---------- THE CARD'S OWN TYPESETTER, NOT A COPY OF IT

top level, before `typeset_`

```
/* ---------- THE CARD'S OWN TYPESETTER, NOT A COPY OF IT -------------------------------------------
   `typeset_` turns every stored fraction into a stacked `.frac` when the app draws a card, so the
   markup a card lays out is no longer the markup in the row. A stacked fraction is an inline-block
   two lines tall that is as wide as its wider half, and a mixed number holds its whole part on its
   line -- both are things that could push a 320px column sideways, and `cardHtml` below laying out
   the stored row would have measured the slanted form the app no longer draws. Cut out of find.js
   by name with the one cutter the repository has, as `check-typeset.js` does. */
```

### ---------- THE TAG ROW IS THE APP'S OWN, NOT A COPY OF IT (docs/history/355)

top level, before `TAGROWS`

```
/* ---------- THE TAG ROW IS THE APP'S OWN, NOT A COPY OF IT (docs/history/355) ----------------------------
   `cardHtml` below copied the row: the level, the name cut at its dash and colon, the calculator out of
   the name, the kind, number and marks pills -- and then a browser pass asked whether the copy still
   agreed with `qPage_`. Since 18 Oct every card's row is ONE renderer, `tagRow_`, walking the finder's
   facets, and a second copy of it would be a second rule. So the rows are asked of the app itself,
   once, before the cards are laid out (`TAGROWS`, filled from the booted app below) -- a card's row and
   the row its other pages wear (an opening, a figure: the same tags without the page number) -- and
   `cardHtml` drops them in. */
```

### ---------- WHAT COUNTS AS A FAILURE, AND IT IS DELIBERATELY ONE THING

top level, before `SLACK`

```
/* ---------- WHAT COUNTS AS A FAILURE, AND IT IS DELIBERATELY ONE THING ----------------------------
   A ROW WIDER THAN THE COLUMN IT IS IN. Not "wider than the window" — see CLAUDE.md on why that
   question returns 156 false alarms in an app whose screens are parked off-canvas. The column here
   is a plain block with a known width, so `scrollWidth` against `clientWidth` is the browser's own
   answer and there is no transform anywhere in a question card to make it lie.

   ONE PIXEL OF SLACK, because a browser rounds sub-pixel widths and a card measuring 320.4 against
   320 is not a fault anybody can see. Two pixels is the smallest overflow worth a person's time. */
```

### THE CARD, BUILT THE WAY `questionCard_` BUILDS IT — the same classes in the same nesting, because the stylesheet is the thing under test and a different

top level, before `cardHtml`

```
/* THE CARD, BUILT THE WAY `questionCard_` BUILDS IT — the same classes in the same nesting, because
   the stylesheet is the thing under test and a different wrapper is a different measurement. It is
   copied rather than imported for one reason: importing it means standing the whole app up in a
   browser, which is `ui.js`'s job and would bring the lazy page fill back with it. The copy is
   eleven lines and `check.js` would name any class in it that the stylesheet does not have. */
```

### ---------- EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST

in `cardHtml`

```
/* ---------- EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST -------------------------------
     THIS LOOKED UP ONE SCOPE AND THE APP DRAWS THREE. `preamble_` in find.js walks paper → section
     → question, which is what makes an AQA English insert — a source shared by every question in
     Section A — the same object as a maths question's shared opening paragraph. This asked only
     for the question-scope one, so the longest preamble in the library was the one it could not
     see, and a check that lays out every card was laying out a card the app does not draw.

     Caught the day the first insert went in, which is the only reason it is not still true. */
```

### ---------- AND THE FIGURE IN ITS CARD (docs/history/356)

in `cardHtml`

```
/* ---------- AND THE FIGURE IN ITS CARD (docs/history/356) ------------------------------------------
     A figure is drawn in the card of the question that uses it, among its words -- `partPlan_` and
     `figHtml_` in find.js -- and a stem's on the stem's page. The same here, or this measures a card
     nobody draws. Where among the words does not change a width, so it stands in front of them. */
```

### ---------- ONE SET OF RULES, ASKED OF TWO SETS OF CARDS

top level, before `measure`

```
/* ---------- ONE SET OF RULES, ASKED OF TWO SETS OF CARDS ------------------------------------------
   LIFTED OUT OF THE LOOP WHEN THE PRACTICALS JOINED. Everything below was written for the question
   cards and every word of it is as true of a practical: a box that was told it could scroll is not
   a fault, nothing inside an `<svg>` can push the page sideways, and `className` on an SVG element
   is not a string. Two copies of that reasoning would be two copies to keep in step, which is the
   fault this repository records under `findCard`, `documents_()` and `factsNow_` — and the one
   `cardHtml` below already half-pays by rebuilding a question's markup rather than calling the
   app's own renderer.

   IT RUNS INSIDE THE PAGE, so it takes one plain argument and closes over nothing. */
```

### THE CARD ITSELF, AND THEN WHAT IS INSIDE IT.

in `measure`

```
/* THE CARD ITSELF, AND THEN WHAT IS INSIDE IT. A card that fits while a paragraph inside it
         does not is the commoner shape — an inner box with `overflow: hidden` would hide a real
         overflow from the card's own measurement. */
```

### ---------- A BOX THAT WAS TOLD IT COULD SCROLL IS NOT A FAULT

in `measure`

```
/* ---------- A BOX THAT WAS TOLD IT COULD SCROLL IS NOT A FAULT ------------------------
         CLAUDE.md STATES THE QUESTION THIS CHECK IS ASKING: "does this box scroll sideways when
         it was NOT told it could". Every element was measured the same way until the first
         four-column table went into the library — AQA Physics 8463/1H Table 1, which cannot
         shrink to 320px and is the question's own data. The house rule is that a wide table gets
         `overflow-x: auto` on its own container, and with that rule applied the check went on
         reporting the table: the overflow had simply moved from the card to the box now holding
         it deliberately.

         SO AN `auto` OR `scroll` BOX IS SKIPPED AND ITS ANCESTORS ARE NOT. That is the half that
         keeps this honest — a scroller cannot hide a card that is genuinely too wide, because
         the card is measured on its own pass and a scroller does not push it. Proved by mutation:
         putting the table back to `overflow-x: visible` fires the check on `.qsheet` at the same
         26px, and the rule as written reports nothing. */
```

### ---------- NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS

in `measure`

```
/* ---------- NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS ----------------------
         THE OUTERMOST `<svg>` CLIPS TO ITS VIEWPORT — that is the UA default and it is not a
         rule this repository set, so a child whose box falls outside the viewBox is painted
         nowhere rather than past the column. The `<svg>` itself is an ordinary replaced element
         in the HTML flow and is still measured; only its descendants are skipped.

         IT REPORTED A REAL DRAWING AND THE DRAWING WAS FINE. A y-axis label is written once and
         rotated into place — `<text x="10" … transform="rotate(-90 10 82)">` — so its LAYOUT box
         runs from x = −51 while the glyphs it paints sit at x ≈ 10. That is CLAUDE.md's own
         entry under `.mat-out`: "a transform is invisible to `scrollWidth`", and it cost two
         wrong fixes the first time. Here it would have cost the axis labels.

         PROVED BY MUTATION IN BOTH DIRECTIONS: forcing `.qsheet figure svg { width: 400px }`
         still fires on the `<svg>` at +80px, and the rotated label alone reports nothing. */
```

### `className` ON AN SVG ELEMENT IS AN `SVGAnimatedString`, NOT A STRING, so every finding inside a drawing printed as `[object Object]` — one grouping key for

in `measure`

```
/* `className` ON AN SVG ELEMENT IS AN `SVGAnimatedString`, NOT A STRING, so every
           finding inside a drawing printed as `[object Object]` — one grouping key for every
           cause, which is the one thing this report's grouping exists to avoid. Caught the day
           the first generated graph went into the library. */
```

### ---------- A LABEL PAINTED OUTSIDE ITS OWN DRAWING

top level, before `outside`

```
/* ---------- A LABEL PAINTED OUTSIDE ITS OWN DRAWING --------------------------------------------
   `measure` ABOVE SKIPS EVERYTHING INSIDE AN `<svg>` and is right to: the outermost one clips to
   its viewport, so nothing in there can push the page sideways. This asks the other question about
   the same element -- is any of this text painted somewhere the reader will never see it.

   RECTANGLES, NOT COORDINATES, because a y-axis label is written once and rotated into place and
   its LAYOUT box is nowhere near its glyphs. That is CLAUDE.md's `.mat-out` entry, which cost two
   wrong fixes the first time it was ignored.

   FOUR EDGES. The first version asked about left and right only, because both faults it was
   written for ran off the side -- and six library diagrams were quietly painting an axis caption
   above or below their box, including the scatter graph on the paper somebody was about to teach
   from. It runs inside the page, so it takes plain arguments and closes over nothing. */
```

### ---------- IN BATCHES, BECAUSE ONE DOCUMENT OF FOUR THOUSAND CARDS IS A DIFFERENT TEST

top level, before `BATCH`

```
/* ---------- IN BATCHES, BECAUSE ONE DOCUMENT OF FOUR THOUSAND CARDS IS A DIFFERENT TEST --------
     A page that long lays out slowly and, more importantly, stops being the thing it is standing in
     for: a card on a screen with a handful of siblings. Five hundred at a time is fast and is still
     an ordinary page. */
```

### ---------- AND THE 68 DRAWINGS IN THE LIBRARY, WHICH NOTHING HAD EVER MEASURED

top level, before `drawn`

```
/* ---------- AND THE 68 DRAWINGS IN THE LIBRARY, WHICH NOTHING HAD EVER MEASURED ------------
       THE GUIDE PASS BELOW ASKED THIS OF THE PRACTICALS' SEVENTEEN and this pass did not ask it at
       all, so the library's own figures -- the ones a student is looking at while they answer --
       were the half nobody checked. Six of them were clipping a caption. */
```

### HANDED IN AS SOURCE rather than injected at navigation, because `setContent` replaces the document under this page on every batch and an init script's timing

in `drawn`

```
/* HANDED IN AS SOURCE rather than injected at navigation, because `setContent` replaces the
         document under this page on every batch and an init script's timing against that is one
         more thing to be wrong about. The prac pass below injects once because it navigates once. */
```

### ---------- AND EVERY PRACTICAL CARD, WHICH NOTHING HAD EVER LAID OUT

top level, before `practicals`

```
/* ---------- AND EVERY PRACTICAL CARD, WHICH NOTHING HAD EVER LAID OUT -------------------------
     THE SAME ARGUMENT AS THE QUESTIONS, ONE DATA FILE ALONG. `data/practicals.json` is 56 rows
     drawn by `practicalCard_`, and until this ran nothing had ever put more than a handful of them
     on a screen at once: the funnel fills five pages either side of where you are, so `check/ui.js`
     sees whichever ones it happens to stop on, and this file read the other data file.

     IT COST FOUR CARDS, FOUND ON THE RUN THAT ADDED TEN MORE. `.fc-head` is a flex row and a flex
     item's minimum is its MIN-CONTENT -- the widest unbreakable word -- so `Photosynthesis`, `Field
     investigations`, `Chromatography` and `I-V characteristics` beside a `flex: 0 0 auto` flag
     could not shrink, and each took the card up to 19px past a 320px column. Four rows of
     forty-one, on every commit, for as long as that card has existed.

     THROUGH THE APP'S OWN `practicalCard_`, NOT A COPY OF IT. `cardHtml` above rebuilds a
     question's markup here, which is a compromise that costs a second thing to keep in step;
     paying it twice would be worse. Booting the real app costs one page load and removes the
     question -- and `stuffItems()` is the app's own list, so a practical this check measures is one
     the funnel would actually draw. */
```

### ---------- A REAL PHONE'S HEIGHT, BECAUSE THE PANE'S CAP IS MEASURED IN `dvh`

top level, before `practicals`

```
/* ---------- A REAL PHONE'S HEIGHT, BECAUSE THE PANE'S CAP IS MEASURED IN `dvh` ----------------
     `.pane` is `max-height: calc(100dvh - var(--bar) - var(--safe-bottom) - 2.5rem)`, so a harness
     window 900px tall reports a cap no phone has. 320 x 568 is one device rather than two halves of
     two — the narrowest phone still in use, which is the width this whole file is built on. */
```

### EVERY PAGE OF EVERY PRACTICAL, not just its first card:

in `practicals`

```
/* EVERY PAGE OF EVERY PRACTICAL, not just its first card: "split into widgets. diagram,
       equipment, steps, worksheet bit" made each practical four cards, and the kit, the method and
       the worksheet are exactly the parts most likely to run long. `pageParts_` is the app's own
       answer to which pages a practical takes, so a refused row is still its card alone. */
```

### ---------- AND WHETHER THE CARD FITS THE PANE, WHICH IS THE OTHER AXIS

in `practicals`

```
/* ---------- AND WHETHER THE CARD FITS THE PANE, WHICH IS THE OTHER AXIS ----------------------
       THIS FILE ASKED ONE QUESTION UNTIL NOW and its own header says so: does this row's markup fit
       a 320px column. That is the axis nobody travels. The one they do is DOWN — `.pane` is
       `overflow: hidden` with a `dvh` cap, and each card is one page, so a card taller than the cap
       is simply cut off with no scroll and no page to turn to.

       MEASURED THE DAY THE GUIDE WAS BUILT: **51 of the 56 practical cards were past it**, median
       891px against a 534px cap at 320 x 568, the worst 1693px. More than half the set had its kit,
       its method, its safety line and its notes below the fold, on every commit, for as long as
       that card had existed. Nothing anywhere could see it — `check/ui.js` renders whichever five
       cards the funnel happens to stop on, and this file measured the other axis.

       IT WAS A FAILURE AND IS A COUNT NOW, AND THE SENTENCE IT PRINTED WAS THE THING THAT WENT
       WRONG. "Cut off with no scroll and no page to turn to" was true when the guide was split off
       and the number fell to zero. The owner has since said "I HATE POP UP", so the guide is back
       on the card and 77 of the 82 are past the cap again — and the sentence is no longer true of
       any of them. `paneReach_` in find.js measures every funnel pane after a paint and writes
       `overflow-y: auto` on the ones that overflow; `scrollHost_` then scrolls that pane from the
       app's own drag and hands the next swipe to the grid. A practical card is a funnel result, so
       it has been covered since the day that was written for the 431 question cards.

       MEASURED WITH REAL TOUCH EVENTS RATHER THAN ASSUMED, because a rule that stands itself down
       on a mechanism nobody checked is worse than the red it replaces: on the tallest card the pane
       showed 805px of 1152, `paneReach_` had set it to `auto`, two swipes scrolled it 0 -> 260 ->
       347 and reached the end, and the third turned the page.

       SO IT SAYS WHAT THE QUESTION RULE ABOVE IT SAYS, in the same words, because it is now the
       same fact. What would make it a failure again is the pane's scroll going away — and that is
       `check/ui.js`'s OUT OF REACH, which asks whether anything is hidden with no way to reach it,
       rather than this, which only counts what is taller than the fold.

       ONLY THE PRACTICALS, AND THAT LINE IS PRINCIPLED RATHER THAN LAZY. This pass boots the real
       app and calls `practicalCard_`, so what it measures is the height the app actually draws. The
       question pass above rebuilds a question's markup with `cardHtml`, which has no tiles, no mark
       scheme and no answer box — a height measured off that is a height of a card nobody sees, and
       drawing a card the app does not draw is the fault this file was itself caught committing.
       Sampled through the app's own `questionCard_` instead: 4 of 600 are past the cap, median
       250px. Real, small, and not something this instrument can honestly claim to have swept. */
```

### ---------- AND EVERY GUIDE, WHICH IS ON THE CARD

top level, before `qtallAt`

```
/* ---------- AND EVERY GUIDE, WHICH IS ON THE CARD ---------------------------------------------
     THE CARD WAS THE SEARCH RESULT AND THE GUIDE WAS THE DOCUMENT, and that split is over: the
     owner saw the sheet it opened in and said "I HATE POP UP", so the kit, the method, the drawings
     and the worksheet are drawn inline by `practicalCard_` again. This pass follows them.

     IT IS STILL A SEPARATE PASS FROM THE CARD ONE ABOVE, deliberately. That one asks whether a card
     fits the COLUMN at 320px; this one asks the questions only the guide's own contents raise — a
     drawing clipped by its own viewBox, a drawing rendered twice, the picture landing below the kit
     list, and whether the kit list draws every item its row holds. Folding them together would
     make one report of two different subjects.

     RENDERED INTO A `.pane`, which is what a funnel result page is: `.page.is-res > .pane >
     .favwrap > .card.prac`. A bare div of the right width would be a column the card is never in,
     and copying the pane's padding here would be a second copy of a number the stylesheet owns.

     A DRAWING GETS A SECOND QUESTION IN PIXELS A VIEWER CAN SEE. `measure` skips everything inside
     an `<svg>`, correctly: the outermost `<svg>` clips to its viewport, so nothing in there can push
     the page sideways. But a label painted outside that viewport is not harmless -- it is a word
     the reader simply does not get, and three of the seventeen shipped that way before a screenshot
     caught them ("bulb level with the side arm" arriving as "el with"). `getBoundingClientRect` is
     what answers it, because it accounts for the rotation a y-axis label is written with and
     `scrollWidth` does not -- the `.mat-out` lesson this file already records one rule up.

     ALL FOUR EDGES, AND IT ASKED ABOUT TWO. The first version compared `left` and `right` only,
     because both faults it was written for ran off the SIDE. A screenshot of May 2017 Higher Q1
     then showed a scatter graph captioned with the top two pixels of "hours of sunshine": the
     label sits at y = 180 in a box 176 tall, and the rule was looking the other way. Six rows in
     the library were painting a label above or below their own box, on four papers. Same fault,
     other axis -- which is why the rule is the four edges rather than the two that had bitten. */
```

### ---------- AND EVERY QUESTION CARD, ON THE SAME AXIS

top level, before `qtallAt`

```
/* ---------- AND EVERY QUESTION CARD, ON THE SAME AXIS -----------------------------------------
     THE SENTENCE ABOVE SAID THIS COULD NOT HONESTLY BE SWEPT AND IT WAS RIGHT ABOUT THE WRONG
     FUNCTION. It said "the question pass above rebuilds a question's markup with `cardHtml`, which
     has no tiles, no mark scheme and no answer box -- a height measured off that is the height of a
     card nobody sees", and then SAMPLED through `questionCard_` and reported 4 of 600. That sample
     was of maths questions: two lines of prose, a value, a mark scheme. It is the whole library's
     median and it is not the whole library.

     MEASURED PROPERLY, THROUGH `questionCard_`, AT 320 x 568: the four AQA Combined Science papers
     put **94 of their 126 cards past the 534px cap**, median 722px and the worst 2050 -- and the
     rest of the library puts 16% of its own past it too. A science question is a paragraph of
     scene-setting, a numbered method of eight steps, a table, a figure and then the ask, and the
     ask is the part below the fold. `.pane` is `overflow: hidden` with no scroll and no page to
     turn to, so on a 320px phone Q02.4 of Biology Paper 1 shows its method and cuts off before the
     question it is asking. A screenshot is what settled it, for the fourteenth time in this
     repository.

     THEY ARE REACHABLE NOW AND THIS STILL COUNTS THEM. `paneReach_` in find.js gives a pane that
     overflows by more than 24px `overflow-y: auto`, and `scrollHost_` in overworld.js scrolls it
     from the app's own drag -- so a tall card is read by swiping and hands over to the pager when
     it runs out. Proved with real touch events: scroll, scroll, then the page turns.

     PRINTED RATHER THAN FAILED, AND STILL WORTH PRINTING. A card you have to scroll is a card whose
     question and answer box are not on the screen together, which is worse than one that fits even
     though it is no longer broken -- and the number is what would say so if a change ever made the
     typical card tall. It is the count of cards that need the scroll, not of cards that are cut
     off, and the line printed below says which. */
```

### ---------- EVERY PAGE OF EVERY QUESTION, AT TWO PHONES, IN THE STRIP'S OWN ORDER

top level, before `qtallAt`

```
/* ---------- EVERY PAGE OF EVERY QUESTION, AT TWO PHONES, IN THE STRIP'S OWN ORDER ----------------
     ASKED FOR AS *"giving diagrams and figures their own widget to ensure each widget is smaller than
     a phone screen"*. So the subject is every PAGE a question takes -- its stem, the stem's figure,
     the card, its own figure, its answer -- built by the app's own `stuffCard` / `stuffPart_` in
     `pageParts_`'s order over the results list (so a stem shared by six parts is measured once, as
     it is drawn once), and the phones are both the narrow one (320 x 568) and an ordinary one
     (390 x 844). The pane's cap is in `dvh`, so the viewport is set to each phone before measuring.

     A COUNT, BY PAGE KIND, AND THE WORST OF EACH -- printed rather than failed, for the reason the
     note above gives: `paneReach_` scrolls a tall pane, so it is reachable, and the number is what
     says whether the split made the typical page fit. */
```

### ---------- EVERY PICTURE IN ITS QUESTION'S CARD, AND NO FIGURE PAGE (docs/history/356)

in `qtallAt`

```
/* ---------- EVERY PICTURE IN ITS QUESTION'S CARD, AND NO FIGURE PAGE (docs/history/356) ------------
         The rule FLIPPED on the owner's 18 Oct word (*"there's also like a graph widget below"*): it was
         "no picture on a question card, every picture on a figure page" (204). Asked of the app's own
         builders: no page of the strip is a figure page, none says "Figure on the next page", and a
         question with a figure has it in one of its own pages. */
```

### `qpad` THE PAD, NOT ANY CLASS THAT STARTS WITH IT:

in `qtallAt`

```
/* `qpad` THE PAD, NOT ANY CLASS THAT STARTS WITH IT: the ringed-words note is `qpad-note qw-note`,
           a line of text under a passage the student rings words in, and a prefix match called all 14
           of those rows a picture on the question card the day `surface: "text"` reached the data. */
```

### A TILE'S MARK IS NOT A PICTURE.

in `qtallAt`

```
/* A TILE'S MARK IS NOT A PICTURE. Check became a tile (*"check button should be a tile"*) and so
           did Mark with AI (*"it should all be tiles"*), and every tile carries its outline mark as an
           `<svg class="tile-i …">` -- so a bare `<svg` test called 2,371 question cards "a picture on
           the question card" the day Check got its tick. The marks come out first, by the class
           `tileIcon_` gives every one; any other drawing on the card is still a picture. */
```

### THE FIGURE MARKER IS NEVER A PAGE'S -- `<!--fig-->` says where the figure stands and is taken out before anything is cut or drawn (`figBlocks_`).

in `host.innerHTML`

```
/* THE FIGURE MARKER IS NEVER A PAGE'S -- `<!--fig-->` says where the figure stands and is
             taken out before anything is cut or drawn (`figBlocks_`). A comment draws as nothing, so
             one left in is invisible here too, and has to be asked for in the markup. */
```

### ---------- ON THE CARD, WHERE IT IS DRAWN, AND IT USED TO BE IN A SHEET

top level, before `guides`

```
/* ---------- ON THE CARD, WHERE IT IS DRAWN, AND IT USED TO BE IN A SHEET ----------------------
     THIS OPENED EACH GUIDE WITH `openSheet` because that is where the guide lived. It does not any
     more: "I HATE POP UP", so `practicalCard_` draws it inline and there is no sheet, no tile and
     no handler left to reach. Measuring a surface the app no longer has would be this repository's
     oldest fault pointed at its own instrument — a check reporting on something nobody can see.

     EVERY MEASUREMENT INSIDE THE LOOP IS UNCHANGED, and that is the point of the edit being this
     small: the `.gd` block is the same markup in the same order, so the width rule, the clipped-
     label rule, the drawn-once rule, the picture-before-the-kit rule and the kit count all ask
     exactly what they asked before. What changed is only how it gets on a screen — rendered into a
     `.pane`, which is what a funnel result page actually is. */
```

### ALL OF A PRACTICAL'S PAGES AT ONCE, in the order the strip draws them — see `pageParts_`.

in `guides`

```
/* ALL OF A PRACTICAL'S PAGES AT ONCE, in the order the strip draws them — see `pageParts_`.
         The measurements below were written against one card holding the whole guide, and they ask
         the same questions of the four cards together. */
```

### A REFUSED PRACTICAL DRAWS NO GUIDE, BY RULE — no kit, no method, no worksheet, because writing out a procedure for something nobody will run is inventing

in `guides`

```
/* A REFUSED PRACTICAL DRAWS NO GUIDE, BY RULE — no kit, no method, no worksheet, because
         writing out a procedure for something nobody will run is inventing content to satisfy a
         checker. Five of the 82 are in that state, so a missing `.gd` here is correct and the
         count below is of the ones that have one. */
```

### ---------- THE PICTURE, THEN THE THINGS NEEDED, AND EXACTLY ONE OF EACH

in `guides`

```
/* ---------- THE PICTURE, THEN THE THINGS NEEDED, AND EXACTLY ONE OF EACH ------------------
         ASKED FOR IN THAT ORDER, AND AN ORDER IS INVISIBLE TO EVERY OTHER RULE HERE. A guide with
         its drawing back below the method measures perfectly: nothing overflows, nothing is
         clipped, every card still fits its pane. So it is asserted rather than left to a reader
         of the template, which is this repository's own move — take a fact that was only true by
         accident and give it somewhere to be stated and somewhere to be tested.

         AND DRAWN ONCE. `diagram` holds one `<svg>` — `check-practicals.js` asserts that at the
         file — so two `<figure>`s in one guide is the drawing rendered twice, which is the
         `.reel .over` fault: one object, two descriptions, drifting apart the first time either is
         touched. It is the exact mistake putting the picture at the top invites somebody to make
         by leaving a copy behind. */
```

### SPLIT OVER FIVE CARDS NOW, so "first" is a CARD:

in `guides`

```
/* SPLIT OVER FIVE CARDS NOW, so "first" is a CARD: the drawing belongs on its own figure page
         straight after the practical's card, and the kit on the page after that. The four questions are the
         old two asked of the split — drawn once, drawn above the kit — plus the two the split
         introduced: the drawing is not on a part page, and the practical's own card is not still
         carrying the guide, which is the one long card the split replaced. */
```

### ---------- THE KIT IS A LIST AGAIN, AND IT DRAWS EVERY ITEM IT HOLDS

in `guides`

```
/* ---------- THE KIT IS A LIST AGAIN, AND IT DRAWS EVERY ITEM IT HOLDS ---------------------
         IT WAS CHIPS, counted here by class, and went back to bullets on "the google chip idea
         didnt work how i wanted to so revert back". What is worth asking of a list is the thing
         the chip count stood in for: one line per item, so nothing the row names is missing from
         the bag. Counted against the row the card was drawn from rather than against a number
         typed here. A `.kit-chip` coming back is the reverted shape returning, and it is named. */
```

### A CHECK THAT CANNOT REACH ITS SUBJECT MUST SAY SO AND FAIL -- "I did not check" is not the same answer as "I checked and it was fine", which is the fault this

top level, before `slack`

```
/* A CHECK THAT CANNOT REACH ITS SUBJECT MUST SAY SO AND FAIL -- "I did not check" is not the same
     answer as "I checked and it was fine", which is the fault this repository has recorded five
     ways and the reason `check-booking.js` read as a pass for months. */
```

### ---------- AND THE ORDER THE OWNER ASKED FOR

top level, before `list`

```
/* ---------- AND THE ORDER THE OWNER ASKED FOR ----------------------------------------------
     A FAILURE RATHER THAN A COUNT, because the number is zero and can stay zero: this is a fact
     about one template, not a backlog anybody has to work through. */
```

### IT SAID "EVERY QUESTION FITS THE NARROWEST PHONE" AND MEANT ITS WIDTH.

top level, before `by`

```
/* IT SAID "EVERY QUESTION FITS THE NARROWEST PHONE" AND MEANT ITS WIDTH. That was true and
       read as more than it said, which is the "all 18 checks pass" shape one more time: the
       question pass asks about the column and the count above asks about the fold, and 431 rows
       are past it. The sentence names the axis now. */
```

### IT SAID "every practical card fits the pane it is drawn in" AND 77 OF 82 DO NOT.

top level, before `by`

```
/* IT SAID "every practical card fits the pane it is drawn in" AND 77 OF 82 DO NOT.
                 That was true while the guide opened in a sheet and stopped being true the hour it
                 came back onto the card — a confident sentence outliving the thing it described,
                 which is the fault this repository records under `.favwrap.is-fav` and the dead
                 `kind === 'paper'` guard. Both counts are printed rather than claimed now, and
                 neither is a failure: the pane scrolls them. */
```

