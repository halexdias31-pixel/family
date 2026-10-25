# style.css

The full text of comments in `style.css` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — a phone app.

before `:root`

```
/* ================================================================================================
   @family. — a phone app.

   Not a responsive website. A PHONE app, which on a desktop is the same phone app in a column —
   because everybody who uses this will be holding a phone, and a layout that stretches to 1600px
   is a second design to maintain for the two people who never wanted it.

   HOW IT SCALES
   One line does almost all of it: the root font size is fluid, and everything else is in `rem`.
   A 320px phone gets a 15px root and a 430px phone gets 17px, so every size, every gap and every
   piece of padding grows with the screen without a single media query.

   What stays in pixels is deliberate: hairlines and tiny radii. A 1px border scaled up on a big
   phone is a 2px border, which reads as a mistake rather than as a bigger border.
================================================================================================ */
```

### WHICH STYLESHEET THIS IS.

in `:root`

```
/* WHICH STYLESHEET THIS IS.
     script.js can say which version of itself is running and hermes can say which version it is
     serving; this file could say nothing at all, so "the picture is still cropped" and "the CSS on
     your phone is three versions old" were indistinguishable — and we spent two rounds on the
     wrong one of those.
     Read at run time and shown on the You screen beside the other two. Bump it whenever this file
     changes, exactly as the other two are bumped. */
```

### A TERMINAL. Black, monospace, white text — and colour held back so that when it appears it means something.

in `:root`

```
/* A TERMINAL. Black, monospace, white text — and colour held back so that when it appears it
     means something.

     The whole discipline is restraint: if everything is green then green says nothing. Here white
     is everything, GREEN is a subject and nothing else, amber is the one action, and red only ever
     means something is wrong. */
```

### ---------- FAINT, BUT STILL READABLE

in `:root`

```
/* ---------- FAINT, BUT STILL READABLE ---------------------------------------------------------
     THIS WAS #5e5e5e AND THAT IS NOT A COLOUR, IT IS AN ABSENCE. Against --raised it measured
     3.04:1 and against the sign-in panel 2.93:1, where the readable minimum for body text is 4.5:1.
     Everything wearing it was affected and none of it looked broken, which is the whole problem: a
     placeholder saying "your name", the PIN label above the box you have to type in, and every unit
     on the print tool — "52cm²", "prints at true size" — all legible to someone who already knew
     what they said, and a grey smudge to anybody reading them for the first time on a phone in
     daylight. Nobody reports that as a bug. They just do not fill the form in.

     #808080 IS THE SMALLEST VALUE THAT PASSES, and it is chosen for exactly that reason. 4.82:1 on
     the panel and 4.98:1 on --raised — over the line on both, and not a shade lighter than it has
     to be, because the point of this token is to recede. The jump to #8a8a8a would have been
     comfortable and would also have made faint text compete with --dim, which is the next step up
     and has a job of its own.

     Found by `node check/ui.js`, which measures contrast on every screen at four widths. It was
     twenty-two failures across `account` and `tools`, and every one of them was this line.

     AND THEN #848484, FOUND BY THE SAME CHECK READING THE PANE PROPERLY. A pane is `#101010` under a
     5%-to-1.5% white wash, and `check/ui.js` measured only the `#101010` -- so the top of every pane,
     where the wash lifts the ground to about `#1b1b1b`, was never measured at all. Read at the text's
     own place on the gradient, `#808080` came out at 4.36 to 4.49:1 on forty-five labels on the Find
     screen alone: the bundle's `— 6 papers` and `20pp`, `Your answer`, the practicals' captions.
     `#848484` is the same rule as before -- the smallest step that clears the lightest real ground,
     4.6:1 there -- and still well short of `--dim`. */
```

### Something you WEAR. Warm rather than cold so it does not read as a second purple — the two sit beside each other on the Stuff list, and a venue and a cape must

in `:root`

```
/* Something you WEAR. Warm rather than cold so it does not read as a second purple — the two sit
     beside each other on the Stuff list, and a venue and a cape must not look like the same kind
     of noun. The fourth colour to mean something and the last: a glance can hold four categories
     and not eight, and past that a palette becomes a legend. */
```

### A TUTOR, and a paper tag.

in `:root`

```
/* A TUTOR, and a paper tag. It was written out as `#ff7b72` three times for the tutor and a fourth
     time as the paper tag's red -- one colour in four places is the paper palette's `#f4f1e8` fault
     in miniature, so it is named once. Softer than `--bad`, which is the whole reason it exists: a
     person's name and an error message must not be one paint. See `--tag-paper` for why a paper
     tag shares it. */
```

### ---------- A COLOUR PER KIND OF TAG

in `:root`

```
/* ---------- A COLOUR PER KIND OF TAG ------------------------------------------------------------
     ASKED FOR AS *"add a colour for each tag. Like paper 1 2 3 etc should be red tags."* That is a
     legend, and the note above says a glance holds four categories and past that a palette becomes
     one -- which is exactly what was asked for here, so it is a deliberate legend rather than drift.
     Two rules from the note above survive it: GREEN STAYS A SUBJECT (the subject tag IS --green),
     and the red is not `--bad`, so a red tag and a refusal are not the same paint. It is `--coral`,
     the tutor's colour, SHARED ON PURPOSE rather than a fifth red a step away from it: the two meet
     only on a search across everything, where one is a name on a person's card and the other a pill
     on a question's, and the shape says which. Nothing here is gold: gold is the one action and the
     press state of every answer, and a tag is not either -- `What you need` was gold for one commit
     and its answers looked pressed before anybody touched them.

     At `:root` because three components draw them -- the funnel's answers, the chips above them and
     the tags on a question card -- and `[data-tag]` below is the one place that turns a kind into
     a colour. `tagOf_` in find.js is the one place that turns a facet into a kind. */
```

### ---------- AND THE FOUR A QUESTION'S PAGE ADDED

in `:root`

```
/* ---------- AND THE FOUR A QUESTION'S PAGE ADDED -------------------------------------------------
     *"why do the questions say non calculator but its not a tag? also the marks should also be a tag.
     also the question numbers should also be a tag. also answers should have the answer tags and
     questions have the question tag."* Every fact about a page of a question is a tag now (`tagRow_`
     in find.js, every one a finder answer since 355), and what to bring had no kind.

     WHAT TO BRING HAS A HUE OF ITS OWN, because it is the one tag on the card a person has to act on
     before the lesson starts -- it was the only thing on the card in the accent for that reason, and
     gold is not available to a tag (above). The wheel is nearly full, so it was chosen by LOOKING at
     a Higher non-calculator card with four candidates side by side: a rose between the tier's pink
     and the paper's coral made a card of four reds (`Q4a`, `Higher`, `Paper 1`, `Non-calculator`);
     a sky blue sat beside `GCSE` as a second level; a pale cyan beside `Edexcel` as a second board;
     a full lemon was a step from gold, which is the press. A PALE LEMON is none of those -- yellow
     enough to be read first, pale enough to sit away from gold and from the type's lime. Its answers
     and chips in the funnel wear it too (`tagOf_('needs')`).

     `--tag-kind`, `--tag-number` AND `--tag-marks` WERE HERE: what the page is (filled ink), its
     number and its marks, three tags no chip could pick. They are facet answers now and wear their
     facet's colour like every other tag -- What kind and Marks the plain outline their chips have, the
     number the paper's red (docs/history/355).

     ONE THEME. This app is a terminal, dark only -- there is no light palette to keep in step -- so
     these are declared once, like every other tag colour. */
```

### A PAPER'S HEALTH (`Ready · 99%`, docs/history/354) is about the transcription, not the paper, so it takes no paper kind's hue.

in `:root`

```
/* A PAPER'S HEALTH (`Ready · 99%`, docs/history/354) is about the transcription, not the paper, so it
     takes no paper kind's hue. A muted SAND: the wheel is full, and every saturated step left sat beside
     a kind already on the card (lime by the type, teal by the board, coral by the paper). Desaturated
     enough to read as a note about the card rather than one more fact on it. */
```

### ---------- THE SECOND PALETTE, WHICH HAD NO NAMES AT ALL

in `:root`

```
/* ---------- THE SECOND PALETTE, WHICH HAD NO NAMES AT ALL ---------------------------------------
     THIS APP HAS TWO PALETTES AND ONLY ONE OF THEM WAS TOKENISED. The screen is black and gold, and
     everything that stands in for PAPER — the receipt, the job stubs, the roster, the print sheet,
     the calendar on its wire, the splash — is cream and warm ink. That second set was six hex codes
     written out by hand: `#f4f1e8` in 29 separate rule-groups, `#2b2620` in 17, `#8a8175` in 13.

     SO "MAKE THE PAPER A SHADE WARMER" WAS A FIND-AND-REPLACE ACROSS 70 DECLARATIONS, and any one
     of them missed leaves a card with two different papers in it. That is the whole DRY problem in
     this stylesheet, and it was never in the widgets — it was in the thing the widgets share.

     NAMED AT `:root`, UNLIKE THE CHESS BOARD. A chess board's cream is that board's own; this cream
     is every paper surface in the app, so it belongs beside `--gold` rather than scoped to one
     component. Which of those two a colour is deciding the scope is the rule. */
```

### WAS 3.25rem OF HEADER.

in `:root`

```
/* WAS 3.25rem OF HEADER. Zero, and kept as a variable rather than deleted for exactly the reason
     `--bar` below it was kept: five rules measure the screen from this, and "the space at the top"
     is still a thing worth having a name for.
     THE BAR ITSELF IS GONE. It held a title that repeated what the tab bar already said, a ＋ that
     belongs beside the thing it adds to, and a ⟳ that nobody should have to know about — so it was
     three centimetres of every phone spent saying nothing. Setting this to 0 removes it and the
     space it held in one edit, because everything else is measured from it. */
```

### WAS 3.6rem OF TAB BAR.

in `:root`

```
/* WAS 3.6rem OF TAB BAR. Kept as a variable rather than deleted, because five rules measure
     from it and a name that means "the space at the bottom" is still worth having — a phone with a
     home indicator wants a little, and a browser with a toolbar wants none. */
```

### ---------- ONE FAMILY, AND IT IS SHIPPED RATHER THAN HOPED FOR

in `:root`

```
/* ---------- ONE FAMILY, AND IT IS SHIPPED RATHER THAN HOPED FOR --------------------------------
     One family, and it is the code one. A terminal that switches to a UI font for its headings is a
     terminal for about four seconds.

     THIS WAS A STACK OF FONTS THE PHONE MIGHT HAVE, and every entry in it was a system font: on an
     iPhone `ui-monospace` resolves to SF Mono and that is what the site has always drawn in.
     Reported as "I don't like the site font. I prefer that coding font. Like visual studios code
     font" — which is the same observation from the other side. SF Mono is a coding font and it is
     also the one a phone would have chosen anyway, so the site read as a system default rather than
     as something with a face of its own. A stack can only ever ask; it cannot decide.

     SO IT IS A FILE IN THIS REPOSITORY. `fonts/family-code.woff2` is Cascadia Mono, which is the
     typeface Visual Studio Code and Windows Terminal ship with, subset and renamed — `fonts/README.md`
     says exactly what was done and why the name changed, and `fonts/OFL.txt` is the licence that
     has to travel with it. The MONO cut, deliberately: Cascadia Code's programming ligatures would
     turn `<=` or `->` inside a GCSE maths answer into one glyph, which is the class of fault this
     repository refuses everywhere else. One line below swaps to the ligature cut if that is ever
     wanted.

     THE OLD STACK STAYS BEHIND IT and is not decoration. `font-display: swap` means the first paint
     is whatever is already on the device, so those names are what a reader sees for the few hundred
     milliseconds before the file lands — and they are what they see for ever if it 404s. A stack
     that degrades to SF Mono degrades to the font this site had yesterday. */
```

### ---------- A CONTROL LAID OVER A MOVING PICTURE

in `:root`

```
/* ---------- A CONTROL LAID OVER A MOVING PICTURE ----------------------------------------------
     The reels' Sound tile, the ▶ on a held reel and a dead Short's "Watch on YouTube": a charcoal
     wash with a hairline edge and white words, which reads on a bright frame and a dark one alike.
     ONE COLOUR IN THREE COMPONENTS, so it is named here; it was written out by hand in each, and the
     third copy is what review caught (note 319). Beside `--letterbox` in spirit — a picture's own
     colours, the same whatever the page round it is. */
```

### ---------- THE TYPEFACE, SELF-HOSTED

before `@font-face`

```
/* ---------- THE TYPEFACE, SELF-HOSTED ------------------------------------------------------------
   ONE FILE FOR EVERY WEIGHT. This is the VARIABLE font, so `wght` runs 200 to 700 continuously and
   the six weights this stylesheet asks for (400, 500, 550, 600, 620, 700) all come out of it. Two
   static cuts would have been 306KB for two of those six; this is 53,836 bytes for all of them.

   SUBSET, AND THE NUMBER IS WHY. 210,484 bytes as shipped, 53,836 after — a quarter — because the
   characters this site renders were counted rather than guessed at: 247 distinct across every file
   in `js/`, this stylesheet, `index.html` and every `data/` file the app fetches, of which 151 are
   not ASCII. Kept with headroom rather than to that list, so the next `≠` or `Å` somebody types is
   already there: Latin-1, Latin Extended-A, Greek, punctuation, super- and subscripts, currency,
   arrows, maths operators, technical and geometric shapes.

   `swap`, NOT `block`. The boot path is where this app once took itself down, and a face that
   blocks paints nothing until the file lands. `swap` paints in SF Mono at once and changes to this
   when it arrives, so the worst case is one reflow rather than a blank screen — and a 404 leaves
   the site in exactly the font it had before this file existed.

   NO `LOAD` STAMP ON THIS URL, unlike every file in `window.FILES`. That stamp is written by
   index.html, which cannot reach a URL inside a stylesheet. `sw.js` revalidates by `ETag` instead,
   which is the same guarantee one step later — and a typeface is the one asset here that genuinely
   never changes. */
```

### ---------- THE ROOT SIZE IS THE ONE LEVER THAT MOVES EVERYTHING

in `html`

```
/* ---------- THE ROOT SIZE IS THE ONE LEVER THAT MOVES EVERYTHING ----------------------------
     Nearly every measurement in this file is `rem` or `em`, so this number is the app's scale: drop
     it and the type, the padding, the gaps and the column widths all come down together, in
     proportion, with no rule needing to know about any other.

     15 → 13.5 AT THE BOTTOM. On a 390px phone that is about a tenth off everything, which is a row
     and a half more of a booking on screen. The floor matters more than the ceiling here — a wide
     screen is a fixed column anyway and has room to spare. */
```

### ---------- NO BOUNCE, AND IT HAS TO BE DECLARED HERE RATHER THAN ON `body`

in `html`

```
/* ---------- NO BOUNCE, AND IT HAS TO BE DECLARED HERE RATHER THAN ON `body` -------------------
     THE VIEWPORT TAKES ITS OVERSCROLL BEHAVIOUR FROM THE ROOT ELEMENT. `overflow` is the property
     that is read off `body` when the root has none; `overscroll-behavior` is not — it propagates
     from `html` and from nowhere else. So this spent its life on `body`, where Chrome happened to
     honour it and Safari, correctly, did not: on iOS the viewport has been `auto` throughout.

     THAT IS THE SECOND HALF OF "it scrolls on the whole page ... it feels clunky", and it is the
     half that survives even with nothing to scroll: a rubber-band on a document that cannot move is
     the app coming away from the top of the screen and springing back. The first half was 3rem of
     padding reserved for a tab bar that no longer exists — see THE TAB BAR IS GONE below.

     `none` rather than `contain`, because there is no scroll here to keep inside anything: this app
     is one viewport with the columns moved by transforms, so a document scroll of any size is a
     fault rather than something to contain. `check/ui.js` measures that — see THE DOCUMENT SCROLLS
     there, which is what would have caught the 3rem. */
```

### NOTHING SCROLLS SIDEWAYS — but with `clip`, not `hidden`.

in `body`

```
/* NOTHING SCROLLS SIDEWAYS — but with `clip`, not `hidden`.

     `hidden` does not merely clip: it makes the element a SCROLL CONTAINER. Put it on html and
     body and two things now claim to be the thing that scrolls, and the page stops responding to
     a vertical drag at all. That is what broke it.

     `clip` exists for exactly this case. It clips the overflow and creates no scroll container,
     so vertical scrolling is untouched. One word, and it is the difference between a page that
     works and one that does not move. */
```

### ---------- THE WIDE WINDOW: THE COLUMN STOPS BEING A PHONE

before `html.wide body`

```
/* ---------- THE WIDE WINDOW: THE COLUMN STOPS BEING A PHONE ----------------------------------------
   `.wide` is written on `<html>` by shell.js (`wideSet_`, under THE GRID SHOWS MORE OF ITSELF) and
   not by a media query here, because the same file decides how wide a card is and how far apart the
   columns sit — one switch, read by both, rather than a breakpoint in two languages that has to be
   kept equal by hand. Until it runs, a wide window is drawn as it always was.

   THE BODY GOES EDGE TO EDGE and `#screen` with it, so the screens either side of the one in front
   are drawn whole rather than clipped to a sliver. `--app` is NOT changed: the sheet, the toast, the
   keypad and the message bar still sit in a phone's width in the middle, because they are things
   you read or type into and a sheet the width of a monitor is a wall. */
```

### THE FOCUS, SAID AS ON A PHONE.

before `@media (prefers-reduced-motion: no-preference) and (prefers-reduced-transparency: no-preference)`

```
/* THE FOCUS, SAID AS ON A PHONE. The cards beside the one in front are out of focus here too —
   `.soft`, written by `placeGrid` — after a first version left them sharp and dimmed them to .8
   instead, and the owner asked for the blur back (6 Oct). Under the pointer, with the hand cursor,
   one comes HALF into focus: that is how it says a press will bring it forward (`wideHit_`). */
```

### ---------- HEADER, BAR, SHEET: anchored to the app column, not the window

before `#banner`

```
/* ---------- HEADER, BAR, SHEET: anchored to the app column, not the window ----------------------
   `position: fixed` is relative to the WINDOW, so on a desktop these would span the whole screen
   while the content sat in a column. Anchoring them to the same width and centring them is what
   keeps the app an app at any size.
--------------------------------------------------------------------------------------------- */
```

### THE BARS GO EDGE TO EDGE.

before `#banner`

```
/* THE BARS GO EDGE TO EDGE. Their CONTENTS stay in the column.

   Capping the bar itself at the app width left a strip of background either side of it, which
   reads as a broken layout rather than as a deliberate margin — a bar that stops short of the
   screen looks like it failed to load.
   `left: 0; right: 0` rather than `width: 100%`, because for a fixed element the two differ once
   a scrollbar exists, and the difference is exactly the sliver of gap that started this.

   `#tabs` WAS THE OTHER HALF OF THIS SELECTOR and is gone with the bar. The plural in the comment
   above is kept: the argument is about a bar, and `#banner` is one. */
```

### THE HEADER USED TO BE HERE — sixteen rules for a bar holding a title that repeated what the tab bar already said, a ＋ that now sits on the feed beside the

before `#banner`

```
/* THE HEADER USED TO BE HERE — sixteen rules for a bar holding a title that repeated what the tab
   bar already said, a ＋ that now sits on the feed beside the thing it adds to, and a ⟳ nobody
   should have had to know about. Deleted rather than hidden: a rule that styles an element that no
   longer exists is a rule somebody will one day try to work out the purpose of.
   `--top` is 0, which is what reclaims the space — every other rule measures the screen from it. */
```

### ---------- THE GRID

before `#screen`

```
/* ---------- THE GRID ----------------------------------------------------------------------------
   The scroller is a viewport now rather than a column. Screens lie along X inside it and, on a
   paged screen, widgets lie along Y inside that — and both are the SAME OBJECT, a cell, placed by
   how far it is from the one in front.

   That is the whole standardisation: one shape, one transform, one transition, and a gesture that
   does not care which way it is going.
--------------------------------------------------------------------------------------------- */
```

### THE TAB BAR'S RULES LIVED HERE — the bar, the row inside it, the four buttons, their icons and labels and the mark on the current one.

before `#screen`

```
/* THE TAB BAR'S RULES LIVED HERE — the bar, the row inside it, the four buttons, their icons and
   labels and the mark on the current one. All of it went with the bar: the screens either side are
   visible at the edges now, and a bar that duplicates what you can already see costs 3.6rem of a
   phone and teaches nothing. */
```

### CLIPPED, and it is the only thing that clips.

in `#screen`

```
/* CLIPPED, and it is the only thing that clips. Every cell is a full screen wide and sits one
     width to the side; without this they are simply drawn there, side by side, and you see three
     screens at once.
     `clip` rather than `hidden`: `hidden` makes an element a scroll container, and a scroll
     container inside a grid that is trying to own the scroll gesture is the fight this whole
     layout has been having. `clip` cuts and creates nothing. */
```

### ---------- WHY SWIPING WORKED ON A LAPTOP AND NOT ON A PHONE

in `#screen`

```
/* ---------- WHY SWIPING WORKED ON A LAPTOP AND NOT ON A PHONE --------------------------------
     Nothing in this stylesheet declared `touch-action`, so every element had the default, `auto`.

     `auto` means "the browser may treat a drag here as a scroll", and a phone decides that within
     the first few pixels — BEFORE any of this app's code has seen the movement. Once it has
     decided, the touchmove events it sends are no longer cancelable, `preventDefault()` does
     nothing at all, and the grid never moves. A mouse has no such handover, which is the whole
     reason this worked on a laptop and not in a hand.

     `none` says: there is nothing here for you to scroll, send me the gesture. Panes that
     genuinely scroll ask for it back below. */
```

### ---------- A CELL

before `.screen`

```
/* ---------- A CELL --------------------------------------------------------------------------------
   A screen and a page differ in ONE respect: which axis they lie on. Everything else — the depth,
   the fade, the easing, the rule that only the front one can be touched — is written once here and
   read by both. That sameness is the whole point of the grid.

   THE TRANSFORM IS NOT HERE. script.js writes it, finished, as a string. It used to be assembled
   out of custom properties, and that rested on every variable in the calc resolving: one that does
   not makes the declaration invalid at computed-value time, and an invalid transform is not a
   partial transform, it is NO transform. Every cell then sits at zero, in normal flow, stacked on
   top of the one in front — which is what a screenful of overlapping widgets looks like.

   What is left here is the box and the easing, which have no such failure mode.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE GRID

before `.screen`

```
/* ---------- THE GRID -----------------------------------------------------------------------------
   A cell is smaller than the viewport, which is the whole trick: with `#screen` clipping, a
   neighbour can only be seen if it FITS — so every cell is scaled back and its neighbours sit just
   past its edges, showing at the top, the bottom, both sides and the corners.

   THE PAGES CARRY THE LAYOUT. A screen is a container with no transform of its own. There were two
   placers, one per axis, and a page belonging to another tab had no position on the horizontal —
   which is why nothing ever peeked at a corner. One placer writes both distances into one
   transform, so a corner is just a cell with two non-zero distances.
--------------------------------------------------------------------------------------------- */
```

### ---------- A SCREEN IS A COLUMN, AND THE COLUMN IS WHAT MOVES

before `.screen`

```
/* ---------- A SCREEN IS A COLUMN, AND THE COLUMN IS WHAT MOVES ----------------------------------
   The pages are stacked by the browser — an ordinary flex column with a real gap — and the SCREEN
   is the thing this app slides. Nothing works out where a page goes any more.

   That is the whole fix for a fault that came back three times over in three different sums. Every
   version measured a card in order to decide where the next one went, and on the Find screen a
   card's contents arrive only as you approach it — so there was never a moment when the
   measurement could be relied on. Two boxes in a column cannot overlap, whenever their contents
   turn up. */
```

### FIXED ACROSS, ADAPTIVE DOWN.

in `.page`

```
/* FIXED ACROSS, ADAPTIVE DOWN. The width comes FROM shell.js, which publishes `CARD_W` as
     `--card-w` — because this rule draws the card and that file works out where the next one goes,
     and the two being separate numbers is how the columns came to be spaced for a 90% card while
     an 80% one was drawn. The neighbour ended up sixteen pixels off the side of the screen.
     The percentage here is only what to draw before the script has run. It is not the setting;
     `CARD_W` is the setting — and it still has to match, or the first paint is one width and every
     one after it is another, which reads as the app flinching as it opens.

     WAS: this percentage is `CARD_W` in shell.js, and the two must agree: this draws
     the card and that one works out where the next card goes, so a card wider here than there
     would overlap its neighbour and one narrower would leave a gap nobody asked for.
     Written as a percentage in both places for the same reason — a card on a small phone and a
     card on a large one should be the same SHARE of the screen, not the same number of pixels. */
```

### ---------- IT FAILS USABLE, NOT DEAD

in `.screen`

```
/* ---------- IT FAILS USABLE, NOT DEAD --------------------------------------------------------
     THIS WAS `pointer-events: none`, turned back on by a `.on` class that only JavaScript adds.

     Which meant the app was untouchable BY DEFAULT and depended on code running to become
     touchable. Any error anywhere before `placeGrid` — a file that did not arrive, one line that
     threw while drawing — and every screen stayed at `none`: no swiping, no clicking, nothing,
     with the app fully drawn in front of you looking perfectly fine.

     That is the wrong way round. A stylesheet should not be able to make a working app
     untouchable, and the default should be the state that leaves somebody able to use what is on
     the screen. `visibility` already keeps unplaced screens out of the way, and `placeGrid` still
     sets `pointer-events` inline on every cell it places — so nothing about the working case
     changes. What changes is the broken case: it degrades to an app you can still press. */
```

### ---------- HOW LONG THE SLIDE TAKES, AND WHAT CURVE IT FOLLOWS

in `.screen`

```
/* ---------- HOW LONG THE SLIDE TAKES, AND WHAT CURVE IT FOLLOWS ------------------------------
     THIS IS THE SLIDE FOR EVERYTHING THAT IS NOT A SWIPE — a tab tapped, a tile that turns a page.
     A swipe's settle is written INLINE on each column by `placeGrid` (see `settleCurve_` in
     shell.js): a duration from the distance and a curve that leaves at the finger's own speed. It
     used to be `--slide` on `<html>`, and a custom property on the root is inherited by every
     element in the app — so each release re-styled about three thousand of them before the card
     could move. Nothing sets `--slide` now; the fallback below is the whole of it.

     A TAP STARTS FROM REST, SO THIS CURVE DOES TOO. It was `cubic-bezier(.16, 1, .3, 1)`, written
     for a card released from a moving finger — and it leaves at 6.25 times its average speed, so a
     tab tapped from rest jumped about a third of the way in its first frame. The finger's settle has
     its own curve now; this one is only ever a slide nobody was already moving, and it eases out
     of a standstill into place. */
```

### `translate` AS WELL:

in `.screen`

```
/* `translate` AS WELL: a column's sideways position is its `transform` and its vertical one the
     separate `translate` property, each with its own clock — see `colWrite_` in shell.js. Written
     inline by `placeGrid` on every placement; this is only what holds before the first one. */
```

### NO `contain` HERE, and this is the fault that broke the whole layout when the screen became a column.

in `.screen`

```
/* NO `contain` HERE, and this is the fault that broke the whole layout when the screen became a
     column. `contain: paint` does not merely hint — it CLIPS the element to its own box, and it
     beats `overflow: visible`. A screen used to be exactly one viewport, so clipping it changed
     nothing and the promise was free. The column is deliberately taller than the viewport now, so
     the same rule cut everything below the fold off and left the pages piled at the top. */
```

### NO FADE ANY MORE. It was `transition: opacity .2s ease` — quicker than the movement on purpose, so a fade that outlasted the slide could not leave the card

in `.page`

```
/* NO FADE ANY MORE. It was `transition: opacity .2s ease` — quicker than the movement on purpose, so a
     fade that outlasted the slide could not leave the card resolving after it arrived. On 11 Oct the
     owner wrote *"If I scrol fast left right up or down it's still clunky … Make it more massive so it's
     never really an issue"*, and measured at 4x CPU the fade was half of what he saw: a card already
     built was carried across the glass at opacity 0 for the first 200ms of every page it newly came
     into reach of, so a run of flicks showed black where the cards were (the holes needed both this and
     the reach gone: 4 of 7 left with the reach widened alone, 0 with both). It also cost a layer per
     fading page on every Feed turn (20 became 26) and 300–630ms of main thread per turn at 4x. The reach
     now makes a page visible a whole glass height before it can arrive (`placeGrid`, shell.js), so there
     is nothing left on the glass for a fade to soften: a neighbour's .9 / .75 shade steps at the release
     instead of easing in over a fifth of a second. The column's own `.22s` stays — columns are composited
     already — and so does the reduced-motion `none` below. See docs/history/341. */
```

### Containment belongs HERE, where it is still true:

in `.page`

```
/* Containment belongs HERE, where it is still true: a page cannot affect anything outside
     itself, so a post loading its picture cannot cost a relayout of the pages around it. `layout`
     and `style` only — `paint` would clip a card to its own box for no gain. */
```

### THE LAYER PROMISE, ONLY WHERE IT IS WORTH KEEPING.

before `.screen`

```
/* THE LAYER PROMISE, ONLY WHERE IT IS WORTH KEEPING.
   `will-change: transform` used to sit on every cell, always. It works by giving the element its
   own layer on the GPU and holding it there — which is exactly right for the two or three cells
   that are about to move, and wrong for the other twenty, because each one costs its own
   full-screen buffer of memory whether or not it ever moves. On a feed of eighteen posts that is
   eighteen screenfuls of texture held permanently, and a phone that runs out starts dropping the
   frames this was meant to protect.

   `.far` is already set in script.js on every cell well off the screen. So the promise is made
   about the near ones and withdrawn from the rest, which is the same optimisation applied to the
   handful of cells it was ever actually for. */
```

### A CELL NEVER SCROLLS.

before `.far`

```
/* A CELL NEVER SCROLLS. It is exactly one screen, so there is nothing past its bottom edge to
   reach — and while it could scroll, a wheel or a drag went to it instead of to the grid, which is
   a few pixels of movement that goes nowhere instead of the next widget.
   Things INSIDE a cell still scroll where they must: the docket's list, the notepad. They have
   their own overflow and are untouched. */
```

### `.screen.on, .page.on { pointer-events: auto }` was the other half of the rule above — the class that made a cell touchable.

before `.far`

```
/* `.screen.on, .page.on { pointer-events: auto }` was the other half of the rule above — the class
   that made a cell touchable. Nothing needs turning ON now, because nothing is turned off by
   default. `placeGrid` still marks the front cell `.on` and still sets `pointer-events: none`
   inline on the ones behind it, which is where that decision belongs: in the code that knows which
   cell is in front, not in a stylesheet that has to guess. */
```

### THE SCROLLER LIVED HERE.

before `.far`

```
/* THE SCROLLER LIVED HERE. It made the front screen a scroll-snap container so its pages could
   peek and centre — and the Y axis is still wired to the drag handler, so a vertical swipe was
   transforming the pane while the browser scrolled it. Two systems moving the same thing.
   The screen does not scroll. The page you are on does, and only it — see `.page.on` below. */
```

### Out of the compositor once it is well off the screen.

before `.far`

```
/* Out of the compositor once it is well off the screen. A CLASS, set in script.js beside the
   number that decides it — the selector here used to match on the TEXT of the style attribute,
   which assumed the browser writes `--a: 3` with a space after the colon. Nothing promises that,
   and a browser writing `--a:3` simply never hid anything. */
```

### `.no-anim { transition: none !important }` WAS HERE, on whatever a finger was dragging.

before `.page.soft > .pane`

```
/* `.no-anim { transition: none !important }` WAS HERE, on whatever a finger was dragging. It took the
   transition off BOTH axes, so a column still sliding up stopped dead the moment a sideways drag
   began — 199–614px in one frame, measured. A drag now zeroes its own axis inline (`colTransition_`
   in shell.js) and the other one keeps sliding. */
```

### ---------- THE CARDS NOT IN FRONT, SLIGHTLY OUT OF FOCUS

before `.page.soft > .pane`

```
/* ---------- THE CARDS NOT IN FRONT, SLIGHTLY OUT OF FOCUS ----------------------------------------
   ASKED FOR ON 5 OCTOBER: *"those widgets not in focus should actually look slightly out of focus
   effect."* `.soft` is written by `placeGrid` on the pages that can be on the glass beside the one
   in front; the note over `SOFT_BLUR` in shell.js says which, and what each choice here cost when
   it was measured.

   ON THE PANE, NEVER THE COLUMN. A pane is not a layer, so its blur is drawn into the column's tiles
   once and the compositor only moves them — nothing per frame. A filter on `.screen`, which IS a
   layer, is a blurred surface redrawn on every frame of every swipe. NO TRANSITION HERE and no
   `will-change`: `softDrag_` writes the blur and the layer inline while a finger moves the focus and
   `softSettle_` takes them away once the slide has ended — a blur's animation cannot run on the
   compositor, so easing it over the settle was measured costing the next swipe its speed — and a standing promise of a layer is the memory `.screen`'s own note warns
   about. `--soft-blur` is published by shell.js beside `--card-w`, because the finger eases toward
   the same number this draws.

   `.soft-dim` IS A PANE THAT REPAINTS ITSELF — a video playing, an iframe — where a blur would come
   with every frame it draws. It is dimmed instead, and so is every soft pane for somebody who has
   asked for less motion or less transparency. */
```

### AND A HEADING IN THE SHEET MAY HOLD AN ADDRESS, which has nothing to break at.

before `#sheet-body h3`

```
/* AND A HEADING IN THE SHEET MAY HOLD AN ADDRESS, which has nothing to break at. A preview that headed
   each email `To Pat Parent · pat.parent…@example.org — preview` in an `h3` scrolled the whole sheet
   sideways by 92px at 320 (check/ui.js). The weekly preview's address sits in an `h2` small enough to
   fit, which was luck rather than a rule — so both. */
```

### ---------- CARDS

before `.card`

```
/* ---------- CARDS -------------------------------------------------------------------------------
   Full width, one column, always. On a phone a card is a ROW — two side by side and both are too
   narrow to say anything, and the eye has to choose between them before reading either.
--------------------------------------------------------------------------------------------- */
```

### NOT A BOX. A card is a block with a rule under it — the rectangle around everything was the single least minimal thing in the file, and eight of them stacked

before `.card`

```
/* NOT A BOX. A card is a block with a rule under it — the rectangle around everything was the
   single least minimal thing in the file, and eight of them stacked reads as a form rather than a
   list.
   No background, no border, no corner: just space above and below, and one hairline to say where
   one thing ends and the next begins. */
```

### A SETTINGS CARD'S TITLE IS ONE LEVEL DOWN, inside its `.me-form`, so `.card > h3` never reached it and it took the browser's own h3 margin — 17px above the

before `.card > h3, .card > .me-form > h3:first-child`

```
/* A SETTINGS CARD'S TITLE IS ONE LEVEL DOWN, inside its `.me-form`, so `.card > h3` never reached it
   and it took the browser's own h3 margin — 17px above the first word of every settings page, on top
   of the pane's padding and the card's, which is the empty band over "About you". Same rule, named
   through the form, so the two kinds of card title cannot drift. */
```

### ---------- A LABEL THAT CANNOT SHRINK PUSHES THE VALUE OFF THE CARD

before `.row .k`

```
/* ---------- A LABEL THAT CANNOT SHRINK PUSHES THE VALUE OFF THE CARD --------------------------------
   `flex: 0 0 auto` IS RIGHT FOR A LABEL — "Credits", "You have", "Where" — and every label in the
   app was one of those when it was written. The basket then put an item's TITLE in the `k` slot,
   and "3D Trig and Pythagoras Edexcel printed ‧ 26 pages" cannot shrink either: it ran past the
   right edge and took the price and the ✕ with it, so three items showed no prices and could not be
   removed.

   `min-width: 0` LETS IT GIVE WAY when there is not room, which is all a flex child needs to stop
   overflowing its parent. `flex-shrink` stays 0, so on every ordinary row — where the label is two
   words and there is room — nothing changes at all. It only bends when the alternative was
   spilling. */
```

### ---------- CONTROLS

before `.btn`

```
/* ---------- CONTROLS ----------------------------------------------------------------------------
   2.9rem minimum on everything pressable — about 46px at the middle root size, which clears both
   Apple's 44 and Google's 48 on a large phone.
--------------------------------------------------------------------------------------------- */
```

### ---------- A BUTTON THAT IS WAITING HAS TO LOOK LIKE IT IS

before `.btn.is-busy::before`

```
/* ---------- A BUTTON THAT IS WAITING HAS TO LOOK LIKE IT IS ---------------------------------------
   REPORTED AS "sign in page feels very unresponsive even if it is loading". `send_` has disabled
   the button and relabelled it `Checking...` since it was written, and against this backend that
   label sits there for about fifteen seconds without moving. A word that does not move is not
   distinguishable from a word that is stuck, and the reasonable conclusion is that the tap missed.

   ONE RULE, ON `send_`'s OWN BUSY CLASS, so every write in the app gets it rather than the sign-in
   button alone -- booking, saving a profile, posting. A ring rather than a bar or a row of dots
   because it is the one shape that cannot be mistaken for content on a button that already holds a
   word, and it sits in the button's own `gap` beside the label.

   `currentColor` AT A THIRD, so it works on the gold button, the ghost and the quiet one without
   three rules, and it cannot go invisible on a palette nobody has thought about. */
```

### A TILE WAITING IS THE SAME RING IN PLACE OF ITS MARK.

before `.tile.is-busy, .tile.is-busy[disabled]`

```
/* A TILE WAITING IS THE SAME RING IN PLACE OF ITS MARK. It is disabled while it waits, and a disabled
   tile loses its plate and fades to a third — which is "nothing to press here", the wrong sentence
   for "pressed, and working on it". So a busy tile keeps its plate and its ink. */
```

### ---------- A DROPDOWN LOOKS LIKE A DROPDOWN, AND THE OPEN LIST IS THE PLATFORM'S

before `select, .bk-many, .many-sum`

```
/* ---------- A DROPDOWN LOOKS LIKE A DROPDOWN, AND THE OPEN LIST IS THE PLATFORM'S -----------------
   THE CLOSED BOX IS THIS APP'S AND THE OPEN LIST IS NOT. Asked for on 9 October as *"a more stable
   standard simple conventional drop down list"*: a tap opens the phone's own picker — the wheel on an
   iPhone, the sheet on Android, the system list on a laptop — and nothing in this stylesheet or in any
   script positions it. The banner over `dropOnFront_` in book.js has the whole reversal; note 315.
   Restyling the OPEN list is not possible (see the `option` rule below) and asking for it is asking
   for the floating panel back.

   ONE ARROW, DRAWN ON THE SELECT ITSELF. `appearance: none` above takes the platform's arrow off with
   its grey well — a light box in a dark form — so every select in the app looked like a text box but
   the cheat sheet's, which drew a `▾` on a wrapper of its own. A select cannot hold a pseudo-element and
   a wrapper is a second element every caller has to remember, so the arrow is two gradients in the
   select's own background: the same ten-by-five `▾`, in a token, on every select, on the booking row's
   button and on the settings column's several-of-a-list field, because those two are dropdowns to the
   person pressing them. The three custom properties are the only things a caller may change — the
   booking row does, and says why beside `.bk-sel`.

   `background-color`, NEVER THE `background` SHORTHAND, on anything this reaches: the shorthand resets
   the image, and the arrow would vanish from whichever select a later rule happened to paint.

   AN OPEN LIST POINTS UP — the arrow on a several-of-a-list field turns over while its list is open
   under it, which is the one thing a disclosure says that a select never needs to.

   THE ARROW SITS CLOSE TO THE EDGE, AND THE WORDS CLOSE TO THE ARROW. It was first drawn with its
   middle 1.05rem in and .7rem of air before the words, 31px of a 390 phone's select given to a 10px
   arrow, and the review of 9 October measured what that cost: `youngest` in the Ages box at 320 was
   75px of words in 70px of room — `younge…` where it had fitted with room to spare before the arrow —
   and the flyer maker cut twice as many answers as it used to. The tip now stands .55rem in, inside
   the box's own left inset, and the words stop .3rem before it: 22px rather than 31. */
```

### ---------- THE OPEN LIST TAKES TWO COLOURS FROM US AND NOTHING ELSE

before `select option, select optgroup`

```
/* ---------- THE OPEN LIST TAKES TWO COLOURS FROM US AND NOTHING ELSE ------------------------------
   REPORTED AS *"the drop down list for the booking widget is hard to see. its like white on white
   or something, unless i hover over it."* Measured then: every `<option>` computed to
   `background-color: rgba(0,0,0,0)` and `color: rgb(128,128,128)`. The list a laptop opens is a
   surface the page does not paint, so a transparent option is drawn on the SYSTEM's sheet, which is
   white nearly everywhere — and an option inherits its select's ink, so a select that recedes while
   unanswered (`--faint`, on the qualification shelf, the library shelf and the ranges) handed that
   grey to every option in its list.

   SO EVERY OPTION IS TOLD BOTH. This was `.bk-sel option` alone, which left the three faint selects
   above with grey on white in a laptop's list. A phone's wheel and sheet ignore both colours and draw
   their own, legibly — which is exactly why nothing else about the open list can be styled at all. */
```

### ---------- A FIELD THAT IS WAITING HAS TO LOOK LIKE IT IS

before `input:disabled, select:disabled, textarea:disabled`

```
/* ---------- A FIELD THAT IS WAITING HAS TO LOOK LIKE IT IS ----------------------------------------
   REPORTED AS *"i can still backspace login details while its loading logging in. this is not
   proffesional or right."* `send_` in me.js locks every field on the card for the length of a
   request now -- and until this rule there was no `input:disabled` in this stylesheet at all, so a
   locked box drew exactly like a live one. A control that has stopped answering and does not say
   so is the invisible mode this repository records against the reel that was paused with nothing
   on it saying so, and against the camera's own shutter.

   THE SAME WASH THE BUTTON ALREADY USES. `.btn[disabled]` is `opacity: .4`; a field carries text
   somebody needs to still be able to READ while it is being checked, so it recedes rather than
   fades out -- enough to say "not now", not so much that you cannot see the PIN you typed.

   `not-allowed` RATHER THAN NOTHING, because the one thing somebody does with a box that has
   stopped taking keystrokes is click it again. */
```

### ---------- A WRONG PIN SAYS WHICH BOX

before `input[aria-invalid="true"], input[aria-invalid="true"]:focus`

```
/* ---------- A WRONG PIN SAYS WHICH BOX -----------------------------------------------------------------
   The toast still says it (the owner's choice, docs/history/134); the box it was about is emptied,
   focused and edged in `--bad` until the next keystroke, so a child on an iPad retypes without hunting
   for the field or deleting four dots first. `aria-invalid` is what a screen reader hears, and what
   `do-signin` sets — one attribute, not a class beside it to keep in step. */
```

### ---------- THE PIN, AS DOTS, WITHOUT BEING A PASSWORD

before `.pin-dots`

```
/* ---------- THE PIN, AS DOTS, WITHOUT BEING A PASSWORD -------------------------------------------------
   `type="password"` IS WHAT SAFARI OFFERS TO SAVE TO iCLOUD KEYCHAIN — on a shared iPad, every child's
   PIN into the owner's keychain, and then offered back to whichever child taps the box. So where the
   browser can draw dots on an ordinary text box, it is one (`signInCard_` in me.js asks `CSS.supports`),
   and Safari has no password field to remember. Where it cannot, the box stays `password`, with
   `autocomplete="off"`. */
```

### ---------- THE HANDLES THIS DEVICE HAS SIGNED IN, AS CHIPS

before `.hchips`

```
/* ---------- THE HANDLES THIS DEVICE HAS SIGNED IN, AS CHIPS ----------------------------------------------
   Switching child on a shared iPad was: tap the box, type the handle, tap the PIN, type it. A chip per
   handle that has signed in here (HANDLES ONLY — never a PIN) makes it one tap and the PIN, and its ✕
   forgets it. Buttons, not tiles: they are a form's controls, filling in the box under them. 44px each,
   in px, because a fingertip does not scale with the root. */
```

### `.dob-cap` IS IN THIS GROUP RATHER THAN BESIDE IT.

before `label.field > span, .dob-cap, .reg-cap, .many-cap, .notify-cap`

```
/* `.dob-cap` IS IN THIS GROUP RATHER THAN BESIDE IT. A date of birth is three boxes under one
   caption, and `fieldHtml`'s own `<span>` is INSIDE the `<label>` so it cannot draw one over a row
   — but a second rule saying the same six declarations is six chances to drift, and the first
   version of it already had: it said `.68rem`, `.06em`, lower case and `--dim` under a comment
   claiming it matched this. One selector, one caption style, and the row reads as one more field
   down the same column because it IS one. */
```

### ---------- YOUR HANDLE, SHOWN RATHER THAN TYPED

before `.handle-now`

```
/* ---------- YOUR HANDLE, SHOWN RATHER THAN TYPED --------------------------------------------------
   There was a box here — `.handle-in`, an input with an `@` drawn in front of it — and it went with
   the typed handle: a handle is a first name and a virtue the server builds, and Randomise asks for
   another word. What is left is a fact about you, so it is set like one, at the size a box's value
   would be, so the form does not change rhythm where the box used to be.

   ON YOUR OWN CARD'S EDIT NOW (`cardHandleHtml_`, docs/history/339), under the `Handle` caption every
   section of that form has (`.prof-cap`); `.handle-cap` went with the Signing in card it captioned there.
   `overflow-wrap: anywhere` because a handle is up to twenty characters with nothing to break at, and a
   320px card is the narrowest it is ever drawn on. The `@` is gold because that is how every card draws a
   handle. The line under Randomise had its margin written inline on Settings; it is the rule's now. */
```

### ---------- THE SIGN-IN SLIP: A HANDLE AND A PIN, HANDED TO SOMEBODY ON PAPER

before `.pin-slip`

```
/* ---------- THE SIGN-IN SLIP: A HANDLE AND A PIN, HANDED TO SOMEBODY ON PAPER ---------------------------
   *"so all kids can login easily with their handle and pin."* What a parent is shown once, after making
   a child's account or giving them a new PIN — the thing that gets written on the fridge or
   photographed, so it is drawn as PAPER (`--paper`, `--paper-ink`, `--paper-dim`), never as the black
   screen and never as a literal. Two labels and two values, the values big enough to read across a
   kitchen. `overflow-wrap: anywhere` because a handle is up to twenty characters with nothing to break
   at and a 320 card is the narrowest it is drawn on; `tabular-nums` so a PIN's digits sit in columns
   somebody can copy one at a time. */
```

### ---------- WHO THE ACCOUNT IS FOR: THE FIRST QUESTION ON THE REGISTER SHEET

before `.reg-cap`

```
/* ---------- WHO THE ACCOUNT IS FOR: THE FIRST QUESTION ON THE REGISTER SHEET -----------------------
   Two answers, two buttons, the chosen one gold — `.btn-row .btn.on`, already the app's rule for it.
   The caption is in `label.field > span`'s group (one caption style, above), and a `<p>`, so its
   browser margin goes as `.handle-cap`'s does. A field's own gap under the pair, so the boxes that
   appear below it sit where a next field would.

   "I'M A PARENT OR GUARDIAN" IS TWO LINES AT 320, and `.btn`'s `line-height: 1` was set for one: the
   two lines touched, and the second sat flush left under a centred first. So a wrapped label is
   centred and given a line of air, and a little height of its own — the 44px floor is untouched. */
```

### ---------- THREE LIBRARY CARDS ON ONE PAGE, WHICH NINE STACKED BOXES CANNOT BE

before `.lib-shelf`

```
/* ---------- THREE LIBRARY CARDS ON ONE PAGE, WHICH NINE STACKED BOXES CANNOT BE -------------------
   *"there are many different librarys for library card detais so make it smaller so can fit in like
   3."* MEASURED BEFORE ANYTHING WAS DRAWN: nine ordinary `label.field` boxes are 63.1px each at 320
   — a 15.06px caption, a 44px input and 10.125px of margin — so the group came to **790.2px in a
   pane that caps at 534.25**, 283px below the fold with no scroll and no page to turn to. The floor
   is arithmetic rather than styling: nine 44px inputs plus 161.5px of measured card chrome is
   557.5px, so it cannot fit at 320 with zero captions and zero gaps.

   SO THE SHAPE CHANGES RATHER THAN THE SIZE. Two rows a card — the library and the PIN across, the
   number full width beneath — is three boxes in the height of two, and the whole shelf measures
   **430.4px with 78.9px of headroom**. Nothing shrinks: every input keeps its 44px floor, which is
   the one measurement in this stylesheet that does not scale.

   THE TWO TRACKS ARE NOT THE SAME KIND OF ANSWER. A borough's name is words and wants whatever is
   left; a PIN is four digits and wants exactly that.

   AND `max-content` ON THE PIN WAS WRONG, WHICH THE FIRST RUN OF `--screen=settings` SAID IN
   NUMBERS: `<label>.field "Library" is 4x63` and eleven sideways scrolls up to 270px. An `<input>`
   has an INTRINSIC width — the default `size` is about twenty characters — so `max-content` on a
   track holding one is that input's idea of itself, not the caption's: the PIN took ~250px and the
   name was left with four. A fixed track, and `min-width: 0` on both so neither refuses to shrink
   below its intrinsic size. 7rem is 94.5px at 320 and holds seven digits at the 16px an input is
   pinned to — the `font: 16px` above is deliberate and is why this cannot be stated in `ch` of the
   row's own font.

   A RULE BETWEEN THE CARDS AND NOT ROUND THEM — UNTIL THE OWNER ASKED FOR CARDS. This said a border
   on each was three boxes inside a box inside a card, the "not everything is a card" fault, and drew
   a dashed hairline between them. On 10 Oct the owner asked for exactly that, by name: *"make each
   look like a card. with fake barcode."* A library card IS a card, a thing in a wallet, so each slot
   is drawn as one now (`.lib-face`, below the shelf's `Add another`) and the hairline went. The
   two-track `.lib-row` is the business records card's alone since (`bizItem_`). */
```

### ---------- THE QUALIFICATIONS CARD — see `qualShelf_` in me.js

before `.q-shelf`

```
/* ---------- THE QUALIFICATIONS CARD — see `qualShelf_` in me.js ------------------------------------
   ONE LINE A QUALIFICATION, AND THE LINE IS THE BUTTON. *"can you make the qualifications widget more
   efficient, elegant, intuitive and take up less space"*: the card it replaced gave every level two or
   three lines and an `Edit`, every subject a heading and an `Edit` and a `+ Add a … level`, and
   measured 900px for seven qualifications at 320x568 — drawn at 70%, the floor, and still scrolling.
   Now each qualification is one 44px line in the profile card's own notation, a subject is named once
   at the head of its lines, and the only thing on the card to press is a line (or the `+` under them).

   THREE COLUMNS: the subject, as wide as its own name (`--q-w` on its group, in `ch` because the face is
   monospaced) and never more than 42% of the line; the notation straight after it, as on the profile
   chip; and the teaching mark at the end. A subject's lines after its first leave the first column
   empty, so its levels stand in a column under its first one. 44px in px, because a line is a tap
   target. */
```

### THE NOTATION IS THE PROFILE CHIP'S OWN `.prof-iso`, so the two cannot drift:

before `.q-line .prof-iso`

```
/* THE NOTATION IS THE PROFILE CHIP'S OWN `.prof-iso`, so the two cannot drift: the same floor, the same
   ink, the level over the grade at one x. Its negative margins are for sitting inside a pill's padding
   without making the pill taller; a 44px line has the room, so here they go. */
```

### ---------- AN OPEN LINE: ITS EDITOR UNDER IT, AND A GOLD RULE DOWN THE LEFT

before `.q-ed`

```
/* ---------- AN OPEN LINE: ITS EDITOR UNDER IT, AND A GOLD RULE DOWN THE LEFT ----------------------------
   Gold is what this app means by "the one you are acting on". The rule is pulled into the card's own
   padding, so nothing in the line moves when it opens — its columns stay on the table's. */
```

### ---------- A CERTIFICATE: NO GRADE, NO TEACHING, AND THE YEAR BESIDE WHO ISSUED IT — see `qualIsCert_`

before `.q-slot.is-cert .q-grade, .q-slot.is-cert .q-seg`

```
/* ---------- A CERTIFICATE: NO GRADE, NO TEACHING, AND THE YEAR BESIDE WHO ISSUED IT — see `qualIsCert_` ----
   *Walked:* the DBS editor offered Grade and Teach / Can teach / Not teaching, and Teach would have put
   the DBS under Teaches on the profile. Hidden rather than left out, so a pick that turns a line into a
   certificate (or back) changes the editor without a redraw; the save empties what is hidden. Two rows
   fewer, which is what an open line was costing the card at 320. */
```

### ---------- A LINE BEING ADDED HAS NO FACE YET

before `.q-slot[data-new] > .q-line`

```
/* ---------- A LINE BEING ADDED HAS NO FACE YET ----------------------------------------------------------
   Its face would say what its Subject and Level boxes say right under it, and before a subject is
   chosen it said `New qualification` in the subject's 10ch column — *walked:* "New / qualificat / ion",
   the first thing anybody saw after pressing `+`. The gold rule and the boxes say which line this is;
   once it is saved it is redrawn into its subject's group with a face like any other. 44px back on the
   tallest moment the card has. */
```

### ---------- THE CAPTION INSIDE THE BOX, OVER THE ANSWER

before `.q-ed label.field.q-f`

```
/* ---------- THE CAPTION INSIDE THE BOX, OVER THE ANSWER ------------------------------------------------
   Above the box it was a line of its own per row — three lines on an editor of three rows — and a
   placeholder IN the box goes the moment something is chosen, so a chosen `B` alone did not say which
   question it answered. Inside, small and top-left, it is both kept and free: the box keeps its 44px
   and the answer sits under the caption. `--dim` rather than the outside captions' `--faint`, because
   it is set on the box's own black. One more rule than `label.field > span` and so it wins without
   an `!important`. */
```

### A NAME TOO LONG FOR HALF A 320 CARD ENDS IN AN ELLIPSIS — *walked:*

before `.q-seg`

```
/* A NAME TOO LONG FOR HALF A 320 CARD ENDS IN AN ELLIPSIS — *walked:* "English Lan", cut with nothing to
   say it was cut. The full name is the option's own label, one tap away. The ellipsis itself is the
   select rule's now, for every select, beside the arrow it has to stop short of. */
```

### THE TICK AT THE START OF THE ROW AND THE BIN AT THE FAR END — the width of the card between them, which is the tile rows' own rule for keeping a bin away from

before `.tile-row.q-tiles`

```
/* THE TICK AT THE START OF THE ROW AND THE BIN AT THE FAR END — the width of the card between them,
   which is the tile rows' own rule for keeping a bin away from the thing beside it.
   TWO CLASSES, because `.tile-row` sets its own `margin` thousands of lines further down and one class
   against one class is decided by order alone — the `.price.faint` fault: the margins here would
   have been written and never drawn. */
```

### ---------- AND THE GAPS ARE THE ONLY THING LEFT TO SPEND, BECAUSE 44px IS NOT

before `.lib-shelf label.field`

```
/* ---------- AND THE GAPS ARE THE ONLY THING LEFT TO SPEND, BECAUSE 44px IS NOT ------------------
   SIX ROWS OF INPUT AT A 44px FLOOR IS 264px AND THAT IS THE SHELF'S FLOOR. `label.field`'s own
   `.75rem` is sized for a column of captioned boxes read one at a time; inside a card of three
   identical things it is six gaps' worth of a page that has 31px to find. `.4rem` on the last row
   of each card and `.35rem` inside the row keeps the three visibly separate — the dashed rule
   between cards is doing most of that work anyway — and buys the shelf back onto a 568px phone.
   THE PHOTOGRAPH SHELF'S NOW: a library card's boxes sit on its face with no margin of their own
   (`.lib-shelf .lib-face label.field`, one class more, so it wins by count and not by order). */
```

### ---------- AND AN EMPTY STATUS LINE TOOK EIGHT PIXELS ON EVERY CARD IT SAT ON

before `.me-said`

```
/* ---------- AND AN EMPTY STATUS LINE TOOK EIGHT PIXELS ON EVERY CARD IT SAT ON --------------------
   IT WAS AN INLINE `style="margin:.6rem 0 0"` IN TWO PLACES, so the gap was there whether or not
   there was anything to say — six settings cards and the details form, each paying for a sentence
   that appears for a moment after Save. Out of the markup (a number written twice is the fault this
   stylesheet keeps paying for) and zero while it is empty, which is the eight pixels that put three
   library cards inside a 568px phone. */
```

### ---------- A SEVERAL-OF-A-LIST FIELD IS A FIELD THAT OPENS INTO TICKS

before `.field.many`

```
/* ---------- A SEVERAL-OF-A-LIST FIELD IS A FIELD THAT OPENS INTO TICKS -------------------------------
   `fieldHtml` in me.js: a `<details>` whose summary is drawn by the field's own rule (it is in the
   `input, select, textarea` group) and carries the dropdown's arrow, and under it, open, one `.check`
   row per option — the app's own checkbox, 44px a row, the row the whole target. In the card, pushing
   what is below it down: it was a button that hung `#drop` over the column until 9 October (note 315).

   THE CAPTION IS `label.field > span`'s — it is in that rule's group — because a `<details>` full of
   `<label>`s cannot itself be a `<label>`; the field is a `<div>` and keeps the label's margin here.
   The summary's own disclosure triangle goes: the arrow on the right is the one this app draws. */
```

### ---------- A DATE OF BIRTH IS ONE QUESTION IN THREE BOXES

before `.dob-row`

```
/* ---------- A DATE OF BIRTH IS ONE QUESTION IN THREE BOXES --------------------------------------
   ONE CAPTION OVER THE ROW, WHICH IS THE ONE THING `fieldHtml` CANNOT DRAW. Its `<span>` is inside
   the `<label>`, so it is per box — three captions reading `day`, `month`, `year` under a group
   called `Contact` is three questions where there is one. The library shelf gets away with no
   caption at all because its group IS "Library cards"; this group names three fields between them
   and does not name this one.

   IT JOINS `label.field > span` RATHER THAN RESTATING IT — see the note up there. The row has to
   read as one more field down the same column, and the only way to be sure of that is for the two
   to be one declaration.

   THE BOXES ARE SIZED BY WHAT GOES IN THEM: two digits, two digits, four. `max-content` would
   resolve against an `<input>`'s own idea of itself — about twenty characters, which is the fault
   the library shelf paid for when a `Library` box came out 4px wide beside a 250px PIN. So the
   track is stated in `ch` of the box's own font, and `min-width: 0` lets a narrow phone shrink it
   rather than pushing the card sideways.

   `margin-bottom: 0` ON THE BOXES AND THE MARGIN ON THE ROW, for the reason written over the
   shelf: `label.field`'s own `.75rem` is sized for a column of captioned boxes read one at a time,
   and three of them side by side would put that gap under a row that is one thing. */
```

### ---------- A PAIR OR A TRIPLE ON ONE LINE — see `FIELD_ROWS` in me.js

before `.f-row`

```
/* ---------- A PAIR OR A TRIPLE ON ONE LINE — see `FIELD_ROWS` in me.js ---------------------------
   Equal columns, `min-width: 0` so a long value shrinks its box instead of pushing the card
   sideways, and the row carries the field's own bottom margin so it reads as one more field down
   the same column. A row with a single caption (`cap`) puts that caption above all of its boxes. */
```

### AN UNCHOSEN END OF A RANGE OF SELECTS READS AS A PLACEHOLDER — the ages a tutor teaches.

before `.f-rowwrap select:has(option[value=""]:checked)`

```
/* AN UNCHOSEN END OF A RANGE OF SELECTS READS AS A PLACEHOLDER — the ages a tutor teaches. A select's
   placeholder is its empty option, drawn in the select's own ink, so `youngest` in full white beside
   the grey `min` of the students range looked like an answer somebody gave. The same rule the
   qualification shelf's `Level` and `Board` already carry (`.lib-row select:has(...)`). */
```

### ---------- THE TRACKS HOLD THE DIGITS **AND** THE INPUT'S OWN PADDING

before `.dob-boxes`

```
/* ---------- THE TRACKS HOLD THE DIGITS **AND** THE INPUT'S OWN PADDING ---------------------------
   `6ch` CLIPPED `1985` TO `198`, and nothing measured it wrong: the box was exactly 6ch wide and
   the text inside it was not. Every input in this stylesheet carries `.7rem .75rem`, so about 22px
   of a box is gone before a digit is drawn — the track has to be the content plus that, or the
   fourth digit is outside a box that reports itself the size it was asked for. Same shape as the
   library shelf's `max-content` track resolving against an input's own idea of itself. */
```

### ---------- AND A 44px FLOOR IN `px`, BECAUSE A DAY BOX IS A FINGERTIP

before `.dob-boxes`

```
/* ---------- AND A 44px FLOOR IN `px`, BECAUSE A DAY BOX IS A FINGERTIP -------------------------
   `calc(2ch + 1.9rem)` IS 41.5px AT 320 and `check/ui.js` named it on the first run that had this
   row on a screen — two digits plus the input's own padding lands just under the floor, which is
   the same near-miss `.btn.tiny` records where `max(38px, 2.3rem)` never once chose the rem.
   IN `px`, WHICH IS THIS STYLESHEET'S EIGHTH CONVICTION OF THAT RULE after `.btn.tiny`,
   `.post-act`, `.fm-adds label`, the chips, `.qp-check`, the reel's sound button and `.cal-arrow`:
   a fingertip is the same size on every screen, so the one measurement here that must not scale is
   the one the root font was about to scale. The year keeps its own track — it is already 57px and
   a floor it clears changes nothing. Measured at 320: 44 + 44 + 57.3 and two 6.75px gaps is 158.8
   inside a 243.9px card, so nothing is given up for it. */
```

### 16px ON THE GRID, BECAUSE `ch` RESOLVES AGAINST THE ELEMENT THAT DECLARES THE TRACK.

before `.dob-boxes`

```
/* 16px ON THE GRID, BECAUSE `ch` RESOLVES AGAINST THE ELEMENT THAT DECLARES THE TRACK. The inputs
   are 16px exactly (the iOS focus-zoom rule above) and the grid inherited the root's clamp, which is
   13.5px on a 320px phone — so `4ch` was four characters of a SMALLER font and the year read `200`
   with its last digit under the box's own padding. Caught on a screenshot of the Contact page. */
```

### TWO EQUAL BOXES RATHER THAN THE WIDE ONE BESIDE A NARROW ONE — the business records card's rows (`bizItem_` in records.js), which borrowed this from the

before `.lib-row.q-row`

```
/* TWO EQUAL BOXES RATHER THAN THE WIDE ONE BESIDE A NARROW ONE — the business records card's rows
   (`bizItem_` in records.js), which borrowed this from the qualification editor. The editor has its
   own `.q-ed .q-row` now and no `.lib-row`, so this pair is the records card's alone; it stays two
   classes so it outranks `.lib-row` by count rather than by order.
   `.lib-row select` JOINS THE MIN-WIDTH RULE for the reason the inputs do: a select's own idea of its
   width is its longest option. */
```

### `.lib-shelf .lib-row > label.field` WENT WITH THE ROW.

before `.lib-shelf .shelf-more`

```
/* `.lib-shelf .lib-row > label.field` WENT WITH THE ROW. It took the margin off the name and the PIN
   when they sat side by side over the number; since 332 they sit on a card's face, which sets its own
   (below), and no shelf draws a `.lib-row`. Its note's lesson stays where the face's rules are written:
   `.lib-shelf label.field` and a rule of the same weight tie, and the order decides — the twelfth
   conviction of `.price.faint`, the first caught by `check/cascade.js`. */
```

### ---------- A SHELF'S `Add another`

before `.lib-shelf .shelf-more`

```
/* ---------- A SHELF'S `Add another` ---------------------------------------------------------
   The button is the shelf's own last child, so it sits under the last card showing and goes when
   there is nothing left to reveal (`shelf-more` in me.js). A quiet `.btn`, because the Save under
   the card is the page's one action and this is not it — the correction `.reel-sound` records. */
```

### ON A LIBRARY SHELF IT IS AS WIDE AS THE CARDS OVER IT, and centred under them:

before `.lib-shelf .shelf-more`

```
/* ON A LIBRARY SHELF IT IS AS WIDE AS THE CARDS OVER IT, and centred under them: `libFit_` (me.js) narrows
   the faces to fit the pane and sets `--lib-w` on the shelf, so a full-width bar under narrower cards would
   be the one thing on the shelf still the column's width. Every other shelf never sets it, so the
   fallback is the column, and the photograph shelf's button is where it always was. */
```

### ---------- A LIBRARY CARD, DRAWN AS ONE — `libraryShelf_` in me.js; docs/history/332

before `.lib-shelf .lib-face`

```
/* ---------- A LIBRARY CARD, DRAWN AS ONE — `libraryShelf_` in me.js; docs/history/332 ------------------
   THE OWNER, 10 Oct: *"make each look like a card. with fake barcode."* So each slot is a card at a bank
   card's proportions — 85.6 by 54, the ID-1 size a library card is printed at — on the PAPER palette,
   because it stands in for a thing you hold, as the receipt and the sign-in slip do: `--paper` and its
   inks, never a literal. `LIBRARY CARD` small at the top left, the library's name large under it, the PIN
   small at the top right under its own caption, and along the bottom the bars with the number printed
   under them in the face's monospace, as on the real one.

   `aspect-ratio` IS THE PROPORTION, AND THE CONTENT MUST FIT INSIDE IT. A grid's automatic minimum lets
   the card grow past the ratio rather than spill, which is the right failure — but it is still a failure,
   so the rows are budgeted for the narrowest column there is: at 320 the face measures 244 by 154, and its
   padding, a 9px caption row, the name's 44px box, 33px of bars and the number's 44px box come to about
   145 of it. A face drawn narrower than its column (`--lib-w`, below) is never narrower than that budget:
   `libFit_` stops where the blank row runs out.
   The spare goes to the empty row above the bars, which is where a real card is blank too.

   THE BOXES ARE BORDERLESS AND IN THE CARD'S INK, because they are what is printed on it. What says a box
   is a box is the FOCUS RING — `--paper-ink`, 2px, 13:1 on the paper where the app's gold edge would be
   about 1.6:1 — and, for the one box with no words in it while empty, the PIN, a dashed line in
   `--paper-faint` (3.4:1, past the 3:1 a control's edge needs) until something is typed. The base
   `input`'s border is kept, transparent, so nothing moves by a pixel when a box takes the focus.

   THREE CLASSES ON EVERY RULE THAT TOUCHES A BOX, deliberately: `.lib-shelf label.field` above and the
   base `input`, `input:focus` and `input:disabled` rules are what these replace, and a rule of the same
   weight would win or lose by its line number — the `.price.faint` fault this shelf has already been
   convicted of once. `input:disabled` matters most: a card locked by `send_` while its Save is on the wire
   would otherwise turn black under its own ink.

   A FINGERTIP IS NOT SCALED: every box keeps the base `input`'s 44px floor. The PIN's box is four digits
   of the 16px it is pinned to and a little, never under 44px; it was `6ch` first, and the 320 shot read
   `Sutton Centr…` beside a PIN box a third empty. A longer PIN ends in an ellipsis and scrolls while
   its box has the focus, as every other box does with a value longer than itself.

   WHAT IS PRINTED LARGE GROWS WITH THE CARD, AND NOTHING ELSE DOES. The face is a size container, so the
   name and the bars are in `cqw` of it — the first shots at 768 had 2.2rem of bars and a 1.3rem name on a
   card 400px wide, a third of it blank. Clamped both ways: the name never under the 16px a box needs (an
   iPhone zooms the page into a smaller one) nor over 1.5rem, the bars never under 1.9rem nor over 4.

   AS WIDE AS THE COLUMN, OR AS WIDE AS LETS THE PAGE FIT, WHICHEVER IS NARROWER (`--lib-w`, set by `libFit_`
   in me.js from `paneReach_`). A face's height follows its width, so the full column's width made the page
   too tall past three cards at 390x844, and at a laptop's 1280x800 past two, and the fit rule then drew the
   whole page smaller — the review of 10 Oct measured four cards at 81% at 390 and the tick 36px, five at
   70% and 31px, and three at 81% at 1280. The blank row is the spare, so the faces give that first, by
   narrowing: the shape is kept, they stay centred, and only what the blank rows cannot give is zoomed.
   With nothing over, the property is not set and the face is the column's width, as at 320 almost always.
   Measured after, and in docs/history/332: at 390x844 four at full size and five at 89%; at 1280x800 three
   at full size, four at 92% and five at 82%, where four and five had scrolled at the floor; at 768 and 1920
   all five at full size; at 320x568 three at 83% (from 78%) and four at the floor without the scroll. */
```

### THE EMPTY PIN'S LINE IS DRAWN UNDER THE WORDS' LINE, NOT AT THE FOOT OF THE BOX.

before `.lib-shelf .lib-pin input:placeholder-shown`

```
/* THE EMPTY PIN'S LINE IS DRAWN UNDER THE WORDS' LINE, NOT AT THE FOOT OF THE BOX. The box is 44px for the
   finger and its text sits in the middle, so its own bottom border sat 12px under the name beside it, and
   a dashed border's corner left a dot at its left end (the first 390 shot). A one-pixel dashed gradient
   just under the middle line, where a printed blank would be. */
```

### THE NUMBER SITS UNDER THE BARS, NOT IN THE MIDDLE OF ITS BOX.

before `.lib-shelf .lib-face .lib-no input`

```
/* THE NUMBER SITS UNDER THE BARS, NOT IN THE MIDDLE OF ITS BOX. The box keeps its 44px for the finger;
   the padding puts the digits at the top of it, against the bars, where a card prints them, and the
   rest of the box is the card's bottom margin. ITS RING IS INSIDE IT: the box runs from the bars to the
   card's foot, and a ring outside it was drawn over the bars and across the card's own edge.
   ONE CLASS MORE THAN THE FACE'S OWN BOX RULES, and `check/cascade.js` is why: written as
   `.lib-shelf .lib-no input` it tied `.lib-shelf .lib-face input` on all four paddings and won on its line
   number alone — the shelf's second conviction of `.price.faint`, caught on its first run. */
```

### THE PHOTOGRAPH SHELF — `photoShelf_` in me.js.

before `.lib-shelf .ph-slot`

```
/* THE PHOTOGRAPH SHELF — `photoShelf_` in me.js. A 44px square beside each link, showing what the link
   draws, so a Drive file that is not shared is a broken square HERE rather than on the public card.
   The square is the height of the box beside it, so a slot is one line; no dashed rule between them,
   because a photograph is a line of a list and not a card of its own like a library is. */
```

### ---------- YOUR PICTURE — `photoPicker_` in me.js

before `.pfp`

```
/* ---------- YOUR PICTURE — `photoPicker_` in me.js ----------------------------------------------
   The square preview beside its two tiles, at the top of the card the `photo` box used to sit in.
   SQUARE, because a photograph on this site is square and this is the picture as it was kept — the
   card rounds it into its own circle. 88px: big enough to judge a crop by, small enough that the
   tiles and their line fit beside it at 320 without the row wrapping. In px because it sits beside
   two tap targets and should keep its size against them, not shrink with the root. */
```

### ONE OF THE TEN, OR YOUR FIGURE, FILLS THE PREVIEW as a photograph does.

before `.pfp-face .face-pic`

```
/* ONE OF THE TEN, OR YOUR FIGURE, FILLS THE PREVIEW as a photograph does. It was `.pfp-face .avatar` at
   56px — the whole wardrobe figure, drawn for NO picture and on your own screen only; with no picture
   the preview is the initial everybody sees now, and the figure is a picture you choose below. */
```

### ---------- THE ELEVEN, AS AN XBOX GAMERPIC PICKER LAYS THEM OUT

before `.pfp-grid`

```
/* ---------- THE ELEVEN, AS AN XBOX GAMERPIC PICKER LAYS THEM OUT ------------------------------------
   The owner, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox
   dp selector, which allow you to use your avatar as a dp."* Your figure first, then the ten, in a grid
   under the preview and its tiles. 44px IN PIXELS, the tap target (CLAUDE.md: a fingertip is the same
   size on every screen), and no bigger than 56: a 320 card has about 248px inside it, which is four
   to a row at 56px (4, 4, 3); from 294px — six 44px cells and their gaps — it is six to a row (6, 5),
   which is one row fewer on the card that holds the most. The container query asks the PICKER's own
   width rather than the window's, because the same card is a phone column at 390 and a third of the
   screen at 1280.
   THE RING IS GOLD, the one colour this app saves for "this is the one", drawn in the button's own
   3px of padding round the drawing, so it never covers the picture and the cell does not grow. A drawing that is not yet in use is a little dimmer, so the ring is
   not the only thing saying which one is. */
```

### ---------- A FACE DRAWN RATHER THAN PHOTOGRAPHED — `personFace_` in links.js

before `.face-pic`

```
/* ---------- A FACE DRAWN RATHER THAN PHOTOGRAPHED — `personFace_` in links.js -----------------------
   One of the ten pictures or a figure's head and shoulders, in whatever frame the surface already had
   for a photograph (`.prof-pic`, `.post-face`, `.dm-av`, `.thing-pic`, the preview). Each drawing is
   round by itself — the pictures on their ground, the figure clipped to its own — so the frame keeps
   its size and its border and the drawing fills it. */
```

### `overflow: visible` ON THE DRAWING, AND IT IS WHAT KEEPS IT ROUND.

before `.face-pic`

```
/* `overflow: visible` ON THE DRAWING, AND IT IS WHAT KEEPS IT ROUND. Each one is a circle that touches the
   edge of its own `<svg>` (the ground r=24 in a 48 viewBox, the bust's clip r=20 in a 40 one), and an
   `<svg>` in a page clips to its own box by default — a clip SNAPPED TO THE PIXEL GRID while the circle
   is not. Under `paneReach_`'s zoom (0.858 on a 320 Settings card) or at a fractional column position the
   snap lands a pixel inside the circle: found by review on 10 Oct, the fox, robot and guitar flat on the
   right and the football, guitar and palette flat at the bottom. Nothing in the ten is drawn outside its
   48 square and the bust clips itself to its own circle, so lifting the box's clip shows nothing new.
   The frame round a face keeps its own clip: on a card, a post and a message head that frame is round
   by design (`.prof-pic`, `.post-face`, `.dm-av`), so what it trims is a circle, never a flat side.
   `check/ui.js` photographs every drawing on the glass for this (A DRAWN PICTURE CUT BY ITS OWN BOX). */
```

### The whole row is the target, not the little box.

before `.check`

```
/* The whole row is the target, not the little box. A pixel floor rather than a rem multiple,
   because 2.9rem at a 15px root came out at 43.5px — half a pixel under, which is exactly the
   sort of thing that gets waved through and then misses on a real thumb. */
```

### THE EDGE AND THE GROUND ARE THE ARGUMENT, not the values.

in `.check .box`

```
/* THE EDGE AND THE GROUND ARE THE ARGUMENT, not the values. `--line` on `--sunk` is #232323 on
     near-black — a dark square on a dark card, and a checkbox that does not look like a checkbox is
     a control nobody presses. 14% white has an edge on any screen in any light.
     `.tick-box` WAS THE OTHER ONE, built the same way and for the same reason, and this note used
     to point at it as the pair. It is gone with the passes, so this is the only checkbox in the app
     and the reasoning now lives here rather than in two places agreeing. */
```

### ---------- YOUR ROLES: A TICK WITH ITS MEANING UNDER THE WORD

before `.roles-card .role-pick, .notify-card .role-pick`

```
/* ---------- YOUR ROLES: A TICK WITH ITS MEANING UNDER THE WORD ---------------------------------------
   `rolesCard_` in me.js. The `.check` row is unchanged — same box, same 44px floor — and only the
   words beside it stack: the role, then what it means here in the card's faint voice, because
   "Client" alone is this business's word and not the reader's. `min-width: 0` so a long note wraps
   inside the card at 320 rather than pushing the row wider than it. The box sits at the top of a
   two-line label, level with the role's own word, rather than floating in the middle of the pair. */
```

### ---------- NOTIFICATIONS: THE ROLES CARD'S TICKS, AND WHAT IS ALWAYS SENT AS WORDS

before `.notify-always`

```
/* ---------- NOTIFICATIONS: THE ROLES CARD'S TICKS, AND WHAT IS ALWAYS SENT AS WORDS -------------------
   `notifyCard_` in me.js. The ticks ARE the roles card's — the same `.check` row with its 44px floor and
   the same two-line label, by the two selectors above widened rather than copied. What is always sent is
   ONE RUN OF WORDS, its labels joined by a dot, under the card's caption voice (`.handle-cap` and its
   group): a list of facts, not a column of controls somebody has greyed out — and one paragraph rather
   than four two-line items, because the first drawing was 800px at 390 and scrolled at 320 even shrunk to
   the floor. *"I don't like scrolling. If you need to leave things more compact or smaller font."* The
   line at the foot takes no room until a tick has something to say. */
```

### THE BOX BEING SAVED LOOKS IT.

before `.notify-card .check input:disabled + .box`

```
/* THE BOX BEING SAVED LOOKS IT. `send_` disables the row's own box for the round trip, and a disabled
   `.check` was drawn exactly like a live one — opacity 1, a pointer — so a second tap on it was a tap that
   did nothing, with nothing to say so but a faint "Saving…" at the foot of the card (review, 9 Oct). Only
   that row: every other box on the card stays live (`notify-pick` in me.js). Opacity, not a colour, so
   it is the same box, ticked or not, only further away. */
```

### Two that were used in the markup and never defined here — a value that has gone wrong, and a price that is nothing.

before `.bad`

```
/* Two that were used in the markup and never defined here — a value that has gone wrong, and a
   price that is nothing. Undefined, they simply rendered in the body colour, which is the quiet
   kind of missing this file keeps producing. */
```

### ---------- GOLD ON AMBER IS NOT A COLOUR, IT IS AN ABSENCE

before `#banner .link`

```
/* ---------- GOLD ON AMBER IS NOT A COLOUR, IT IS AN ABSENCE ---------------------------------------
   THE BANNER IS THE ONE PLACE `.link` LANDS ON A LIGHT BACKGROUND, and the one place it has to be
   readable: every message in it that names a URL ends with "Open it in a tab", which is the single
   most useful thing on the screen when the backend is unreachable — it is the test that separates
   four different faults. In gold on `--warn` it was invisible, so what people saw was a sentence
   with a hole in it and no way to run the test the sentence describes.
   The banner's own ink, underlined so it still reads as something to press. */
```

### ---------- THE SHEET AND ITS BACKDROP, OPENED AND CLOSED BY ONE RULE

before `#sheet.hidden, #sheet-back.hidden`

```
/* ---------- THE SHEET AND ITS BACKDROP, OPENED AND CLOSED BY ONE RULE -----------------------------
   THEY ANIMATED IN AND WERE CUT OFF. The sheet had a keyframe that ran when it appeared; closing it
   was `display: none`, which cannot be animated and does not try. So it rose smoothly and vanished,
   which is the harshness — not the opening, the ending.

   AND THAT IS THE FRAGILITY, not just the look. Opening was described in CSS, as a keyframe.
   Closing was described in JavaScript, as a class that hides. Two descriptions of one thing, in two
   languages, and nothing making them agree — so the open could be tuned for ever and the close
   would never change, because the close was not a piece of styling at all.

   ONE RULE, READ IN BOTH DIRECTIONS. `.hidden` means down and faded; without it, up and solid; and
   a transition between the two states does the rest. No keyframes, no timers, no second class to
   remove at the right moment. The same line that opens it closes it, run backwards, which is a
   thing that cannot come apart.

   `display: none` HAD TO GO, for these two only. It is the global meaning of `.hidden` and it makes
   any transition impossible — an element that is not laid out has nothing to animate. `visibility`
   does the same job for a panel that is already positioned over everything: out of the way, out of
   the accessibility tree, and not clickable. It is delayed on close so the slide finishes first. */
```

### ---------- THE PANEL OPENS OUT OF THE CARD YOU PRESSED

before `#sheet`

```
/* ---------- THE PANEL OPENS OUT OF THE CARD YOU PRESSED -------------------------------------------
   IT USED TO COME UP FROM THE BOTTOM, which is what a phone does when it is showing you something
   NEW — a share menu, a keyboard, a list of options that were not on the screen a moment ago.

   This is not that. You pressed a thing that was already in front of you and asked to see more of
   it, and the answer should come out of the thing you pressed. That is how it works in a game: the
   card you choose grows, and what was on it is still on it, bigger. Nothing arrives from off-screen
   because nothing new has arrived.

   CENTRED, because the middle is where you are already looking once the card has grown into it, and
   because a panel anchored to the bottom of a tall screen leaves the top of itself a long way from
   the thing it came out of.

   THREE NUMBERS FROM JAVASCRIPT AND NOTHING ELSE: where the card was, relative to the middle, and
   how big it was beside the panel. Everything after that is this rule, run forwards to open and
   backwards to close — which is the property the last round was spent buying and is not given up
   here. There is no animation code, no timer, and no state beyond the class that was already
   deciding whether it is open. */
```

### THE BOTTOM-SHEET LEFTOVERS ARE GONE.

in `#sheet`

```
/* THE BOTTOM-SHEET LEFTOVERS ARE GONE. A border on the TOP edge only, square corners, and padding
     for the phone's home bar: three things that are right for a panel sat on the bottom of the
     screen and wrong for one floating in the middle of it. The border and the radius are set above
     — declared once, where the shape is decided, rather than half here and half there. */
```

### CLOSED: back where the card is, at the card's size.

before `#sheet.hidden`

```
/* CLOSED: back where the card is, at the card's size. The three custom properties are set by
   `setSheetOrigin_` at the moment of opening and are the only thing JavaScript contributes.
   The fallbacks matter — before anything has ever been pressed, and for a sheet opened by something
   that is not a card, it grows from the middle instead, which is the right answer for both. */
```

### THE GRAB HANDLE IS HIDDEN.

before `#sheet-grab`

```
/* THE GRAB HANDLE IS HIDDEN. It is the mark that says "pull me down", and it earned its place on a
   panel that sat on the bottom edge and could be dismissed that way. This one grows out of a card
   in the middle of the screen and goes back into it; there is nothing to pull down, and a handle
   promising a gesture that does nothing is worse than no handle.
   Hidden rather than deleted: the markup is shared with everything else that opens here, and one
   line of CSS is a smaller change than editing every caller. */
```

### ---------- THE TAB BAR IS GONE, AND THE LAST THING IT RESERVED WAS THE ONE THAT STILL WORKED

before `#toast`

```
/* ---------- THE TAB BAR IS GONE, AND THE LAST THING IT RESERVED WAS THE ONE THAT STILL WORKED ----
   `<nav id="tabs">` was deleted from index.html, and its own note there says WHY: it was "an empty
   fixed element reserving three rem at the foot of every screen for a control that did not exist".
   `--top` and `--bar` went to `0rem` in the same spirit, and both are documented at the top of this
   file as kept-but-zero because five rules measure from them.

   WHAT SURVIVED WAS A SECOND, HARDCODED COPY OF THAT SAME THREE REM. Here, in a media query, not
   referencing `--bar` and therefore untouched by setting it to zero:

     @media (max-width: 23rem) { body { padding-bottom: calc(3rem + var(--safe-bottom)); } }

   `#screen` is `100dvh` minus those same four variables, so it is exactly the viewport — and this
   put 3rem of padding UNDER it. Measured: the document is 609px tall inside a 568px viewport at
   320x568, so THE WHOLE PAGE COULD SCROLL BY 41px. And a media query resolves `rem` against the
   INITIAL font size, 16px, never the root's own clamp — so `23rem` is 368px and this was every
   phone up to an iPhone 12 mini, not the 320px SE the comment was written about.

   REPORTED AS "sometimes when trying to swipe up on phone it scrolls on the whole page ... it feels
   clunky". On iOS that is worse than 41px of travel: any scrollable document at all lets Safari
   start collapsing its toolbar, `100dvh` grows as it does, `#screen` and `body` grow with it, and
   the overflow changes underneath the gesture — a loop, which is what "clunky" describes.

   The rest of the block — `.tab .lb`, `.tab .ic`, `#tabs { height }` — named elements no JavaScript
   file has produced since the bar was removed. The arithmetic is kept as prose because it is the
   reason the query existed: eight tabs across 390px is 48px each, which clears Google's minimum;
   across 320px it is 40px, which does not, so the labels came off below 23rem and the bar shrank to
   3rem. Nothing is left to apply it to.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE TOAST

before `#toast`

```
/* ---------- THE TOAST ---------------------------------------------------------------------------
   Above the bar, never over it. A message covering the way out traps somebody inside whatever went
   wrong.

   AND IT TAKES NO PRESSES, so it can never cover a way out at all. It is words and nothing else --
   `toast()` sets `textContent`, there is no button in it to press and nothing listens to it -- yet for
   2.6 seconds it was a box over the foot of the column, and the foot of the column is where a card's row
   of tiles sits. Found in review of 327: on a question switched to its drawing, Clear said "Cleared. Undo
   puts it back." exactly over the `Type` tile, and a tap on Type 0.4s later landed on the toast and
   nothing switched; at 320x568 the hit test at the tile's centre returned the toast. `#reconnect` already
   takes none for the same reason ("a line that swallowed the tap beneath it would be a fault of its
   own"); this is that rule for the other line that speaks over the column. */
```

### ---------- THE LINE WHILE THE APP ASKS AGAIN

before `#reconnect`

```
/* ---------- THE LINE WHILE THE APP ASKS AGAIN ---------------------------------------------------
   `#reconnect` — see `RECONNECT` in shell.js. NOT THE BANNER, which is what the owner did not want:
   no amber, no address, no advice, because the person reading it has nothing to do. The faint ink of
   an aside at the size of one, in the strip the banner would use, on the raised black every card here
   sits on. Under the banner and under a sheet; over the column, so a line that swallowed the tap
   beneath it would be a fault of its own — it takes no presses at all.

   EMPTY, IT IS NOTHING, and it is emptied rather than hidden — the note in index.html says why. */
```

### THE SCREENS. Only what the seven need — every rule here belongs to something you can point at.

before `.thing-pic.art`

```
/* ================================================================================================
   THE SCREENS. Only what the seven need — every rule here belongs to something you can point at.
================================================================================================ */
```

### ---------- LINK TILES, AND THEN LINK CARDS, AND NOW NEITHER

before `.thing-pic.art`

```
/* ---------- LINK TILES, AND THEN LINK CARDS, AND NOW NEITHER --------------------------------------
   `.fav` AND `.fav-none` WERE HERE — a link's favicon filling its square, and the quiet stand-in
   where a row had no address. Their one producer was the link card on Find, and the links are gone
   ("Get rid of links that's almost redundant now"). `check-css.js` named `fav-none` as styled and
   produced by nothing the moment the card went, which is the dead-selector fault it exists for.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE LIBRARY WALL'S `.tile` WAS STILL HERE, AND IT WAS WINNING

before `.chess`

```
/* ---------- THE LIBRARY WALL'S `.tile` WAS STILL HERE, AND IT WAS WINNING ------------------------
   A `.tile` on that wall was a square: a picture above a caption, so `flex-direction: column`.
   The wall is gone and `.tile` now means an ACTION — a row with the mark and the word at one end
   and the detail at the other, which is what the real rule further down describes.

   THAT RULE NEVER RESET `flex-direction`, because when it was written there was nothing to reset.
   So every action button in the app has been a COLUMN wearing a row's `justify-content:
   space-between` and `align-items: baseline` — which is why adding a 15px mark to a tile drew a
   graphic the height of the card: `space-between` down a column pushes the mark and the label to
   opposite ends and stretches whatever is between them.

   The comment that lived here said the shape survives because a link card still carries it. It does
   not: nothing but `tile_` has emitted a `.tile` since the wall came down, so this is one rule
   quietly overriding its replacement, and it goes. */
```

### The `.shape` rules lived here — a cart, a card, a circle, a square, each filled with a colour worked out from the link's name.

before `.chess`

```
/* The `.shape` rules lived here — a cart, a card, a circle, a square, each filled with a colour
   worked out from the link's name. They went with the coloured squares themselves: a link wears the
   site's own logo now, and a category has no business deciding what a site looks like. */
```

### ---------- CHESS

before `.chess`

```
/* ---------- CHESS -------------------------------------------------------------------------------
   Square by aspect-ratio, and ROWS declared as well as columns — without the rows each one sizes
   itself to its tallest piece and the board comes out ribbed.
--------------------------------------------------------------------------------------------- */
```

### A SQUARE IS A `<button>` NOW — the board could not be played while it was spans with no action — so everything a browser gives a button is taken back off:

in `.chess .sq`

```
/* A SQUARE IS A `<button>` NOW — the board could not be played while it was spans with no
                action — so everything a browser gives a button is taken back off: no border, no
                padding, no font of its own, no grey face. The square's colour is `.lt`/`.dk`. */
```

### BLACK AND WHITE SQUARES.

before `.chess`

```
/* BLACK AND WHITE SQUARES. The board was cream and tan — handsome, and the reason nothing could be
   read on it: a pale piece on a cream square and a dark piece on a tan one are both low contrast,
   so half the board was hard to see whichever way round you looked at it. */
```

### ---------- A CHESS BOARD HAS ITS OWN PALETTE, AND IT HAD NO NAMES

before `.chess`

```
/* ---------- A CHESS BOARD HAS ITS OWN PALETTE, AND IT HAD NO NAMES -------------------------------
   THESE ARE NOT SLOPPY HEX CODES TO BE FOLDED INTO THE APP'S TOKENS. A chess board is cream and
   charcoal by convention, and the pieces are white and black with the opposite colour outlined
   round them so each reads on either square. Replacing them with `--gold` and `--ink` would make a
   board that matches the app and is not a chess board.

   WHAT WAS WRONG IS THAT THEY HAD NO NAMES. Six literals over four rules, so "darken the dark
   squares" meant working out which `#2e2e2c` was a square and which was something else.

   SCOPED TO `.chess`, NOT `:root` — this is a component's palette, not the app's. Putting
   `--chess-dark` beside `--gold` would offer it to every rule in the file. */
```

### THE PIECES, told apart by fill and outline rather than by glyph.

before `.chess .wp`

```
/* THE PIECES, told apart by fill and outline rather than by glyph. Both are solid shapes now, so
   each needs an edge in the opposite colour — which is what makes a white piece readable on a white
   square and a black one on a black square. Without it each army disappears on its own half.
   `text-shadow` rather than `-webkit-text-stroke`: the stroke property is still prefixed, absent
   from some browsers, and where it is missing the outline simply does not draw — which is the case
   the outline exists for. Four shadows are an outline everywhere. */
```

### THE OUTLINE IS THE OTHER SIDE'S COLOUR, which is what makes a white piece readable on a light square and a black one on a dark square.

before `.chess .wp`

```
/* THE OUTLINE IS THE OTHER SIDE'S COLOUR, which is what makes a white piece readable on a light
   square and a black one on a dark square. Written as the token rather than `#111`/`#fff` so the
   two can never drift apart from the fills above. */
```

### THE LAST MOVE, both ends of it.

before `.chess .last`

```
/* THE LAST MOVE, both ends of it. On a board passed between two people it is the one thing the
   player picking the phone up needs and cannot see: what the other side just did. A wash rather than
   a ring, so it never competes with the ring that says "this piece is picked". */
```

### ---------- ANCHORS

before `a`

```
/* ---------- ANCHORS -------------------------------------------------------------------------------
   NOTHING IN THIS FILE EVER RESET A LINK. Every card that opens something is an `<a>`, and an `<a>`
   with no colour of its own is browser blue — and purple once visited. So the Links list was the
   one place in the app rendering in two colours neither of which is in the palette, and getting
   underlined besides.
   Inherit, always. A link inside a card is a card; the card decides how it looks.
--------------------------------------------------------------------------------------------- */
```

### THE SHAPE OF A REEL, not of a thumbnail.

before `.feed`

```
/* THE SHAPE OF A REEL, not of a thumbnail. This was 4/5 — a box a fifth taller than it is wide,
   which on a page of its own reads as a small picture somebody put in the middle of an empty card
   rather than as the thing the page is for. 9/16 is the shape every full-bleed card format uses,
   and it is the one that nearly fills a phone.
   AN ASPECT RATIO RATHER THAN A STRETCH, deliberately. Making it fill would mean making the pane
   fill too, and a rule that stretches whatever a page's first card happens to be is exactly what
   put the credits card over a screenful of nothing — see the note by `.page .card`. A ratio cannot
   reach anything it was not written for. */
```

### THE BOOK TAB WAS HERE — the one raised, then flattened, then removed with the rest of the bar.

before `.mc-display`

```
/* THE BOOK TAB WAS HERE — the one raised, then flattened, then removed with the rest of the bar.
   Its argument is worth keeping because it is a rule rather than a decoration: the middle of the
   bar is where a thumb rests without moving, so the action the whole app exists for belonged there
   rather than being a word among six other words. `.tab.big.on::before` was the last rule left of
   it and matched nothing. */
```

### ---------- THE FINDING CONTROLS

before `.mc-display`

```
/* ---------- THE FINDING CONTROLS ------------------------------------------------------------------
   Search, filter, group, sort. Four, because they do different jobs — one clever control that
   tried to be all four would be worse at each.

   They are drawn ONCE and never redrawn with the list, which is what makes them work at all: a
   select rebuilt on every change loses the value it just took, and the box then disagrees with the
   list underneath it.
--------------------------------------------------------------------------------------------- */
```

### `.pick-row` was here — the row of dropdowns above the search on the Find screen.

before `.mc-display`

```
/* `.pick-row` was here — the row of dropdowns above the search on the Find screen. There were
   three: group by, then sort, then group again. All three are gone now, one at a time, each for the
   same reason: this screen is a QUESTION, and a control above the question is something to get past
   before you can ask it. */
```

### ---------- CALCULATOR

before `.mc-display`

```
/* ---------- CALCULATOR ---------------------------------------------------------------------------
   THE CLASS NAMES MATCH THE MARKUP, which they did not before. The screen emits `mc-display`,
   `mc-grid` and `mc-btn` — the names the carried-over `initMiniCalc` needs — and this file was
   still styling `calc-read` and `calc-keys`, so the keypad rendered as a bare column of unstyled
   buttons. Nothing threw; the selectors simply matched nothing.
   The eighth entry on the list, and the first one that was between the markup and the stylesheet
   rather than between the markup and the code.
--------------------------------------------------------------------------------------------- */
```

### ---------- CALENDAR

before `.cal-head`

```
/* ---------- CALENDAR -------------------------------------------------------------------------------
   Same correction as the calculator: `drawCalendar` writes `cal-h`, `cal-d` and `cal-today`, and
   this file was styling `dow`, `day` and `today`. The month drew, in the body font, with no grid
   headings distinguishable from the dates.
--------------------------------------------------------------------------------------------- */
```

### ---------- 44px, IN px, AND IT WAS 31x36

before `.cal-arrow`

```
/* ---------- 44px, IN px, AND IT WAS 31x36 ---------------------------------------------------------
   FOUND THE DAY THE BASKET BECAME A TOOL, which is the whole argument for a declared state: the
   calendar is the last widget on that column and nothing had ever stood within three pages of it,
   so `check/ui.js` had never laid it out. `.far` hides a page more than three away, and the tools
   states before this one all sat at the top of the column.
   PADDING IN `rem` IS THE FAULT, and this stylesheet has six convictions of it — `.btn.tiny`,
   `.post-act`, `.fm-adds label`, the chips, `.qp-check` and the reel's sound button. A fingertip is
   the same size on every screen; a rem is 13.5px on a 320px phone. */
```

### ---------- THE SCREEN

before `.flappy`

```
/* ---------- THE SCREEN ---------------------------------------------------------------------------
   THE SKY IS PAINTED ON THE CANVAS AND NOT BEHIND IT — see `sky()` in receipt.js, which fills the
   whole box on the same tick the canvas is sized. So this background is not a second copy of the
   sky and must not be made one: it shows for exactly one case, a canvas the browser has not laid
   out yet, where `fitCanvas_` bails and retries. The app's own sunk grey is the honest thing to
   show in that moment, and a blue written here would be one colour in two files that quietly drift.

   A HAIRLINE FRAME, which is all that is left of the bezel the handheld block used to draw — see
   "THE HANDHELD, AND WHY IT IS NOT HERE ANY MORE" at the foot of this file. A bright sky butted
   straight against a dark card reads as a coloured rectangle; one line of the card's own line
   colour makes it a picture, and that is the whole of the difference.

   `touch-action: none` IS NOT FOR THE SWIPE, which is a `pointermove` listener on the window and
   cannot be refused by any value here. It is for the browser's own double-tap-to-zoom wait, which
   is the delay people reach for first when a canvas game feels slow — it was already gone, and the
   delay actually reported was `click` firing on the release. See the binding note in `initFlappy`. */
```

### ---------- A THUMB ON THE GAME IS A FLAP, NOT A SELECTION

before `.pane:has(.flappy), .card:has(> .flappy)`

```
/* ---------- A THUMB ON THE GAME IS A FLAP, NOT A SELECTION -----------------------------------------
   THE OWNER, 8 Oct: *"Flappy bird sometimes highlights when tapping. Like they tap then it
   highlights. Happens on phone."* It was the phone selecting text. Nothing the app draws lit up.
   Somebody playing taps fast and now and then rests a thumb while the bird falls. On iOS a press
   held about half a second, or two quick taps, is the gesture that selects the nearest word and
   paints it blue, with the magnifier and the Copy bubble. Nothing on this card said it was not text.
   `touch-action: none` above turns off panning and zooming and nothing else, so it never did.

   THE WHOLE CARD, NOT ONLY THE CANVAS. A thumb going fast lands on the "Tap to play" line 6px under
   the canvas, or on the Score row, as often as on the bird. Scoped to the canvas alone, a probe still
   started a selection on both. The same three declarations as `#kp`, the other surface built to be
   hammered, for the same reason: `-webkit-user-select` because iOS Safari reads the prefix, and
   `-webkit-touch-callout` because only WebKit has a callout to refuse.

   AND THE WHOLE PAGE THE GAME IS ON, NOT ONLY ITS CARD. On a column the card is wrapped twice — the
   star's `.card.is-widget`, then the `.pane` — and between the canvas and the pane's edge are 27px
   of their padding on each side and 14px under the board, all `auto`. A thumb at the side of the
   bird lands there. The browser takes a press on a box with no text in it to the nearest text it
   may select, and with this card refusing, that was the NEXT page: every tap, double tap and held
   press there put the selection in "Connect 4" (probe at 390 and 320, a caret every time; on iOS the
   same press selects the word and paints it). `.pane:has(.flappy)` is the game's own page and
   nothing else — one widget to a page on Games and on Saved, and the only text on it is the game's.
   The card rule stays beside it for a widget drawn anywhere without a pane round it.

   NOT `preventDefault` in the flap. On `pointerdown` it cancels the mouse events that follow and
   not WebKit's selection gesture, and the flap stays instant on the finger going down.
   NOT `touch-action: manipulation` as on `#kp`, because here it would measure nothing. The pad is
   fixed outside the swipe grid and had to refuse the double-tap zoom itself. This card sits inside
   `#screen`, whose `none` already refuses it, and a child's `touch-action` can only narrow what the
   elements above it allow, never widen it.
   AND NOT THE WHOLE APP: a question, an answer or a message is text somebody may want to copy.
   `check/swipe.js` (8e) asks all of this with a real finger, and reads the callout from this file,
   because Chromium drops a property it does not know. */
```

### ---------- WHAT THE LAWS PAINT

before `.w-green`

```
/* ---------- WHAT THE LAWS PAINT -----------------------------------------------------------------
   One class per colour a law can name. The LAW says "green"; this says what green is — so the
   palette lives here, where a designer would look, and the spreadsheet holds words rather than
   hex codes.

   Restraint is still the rule. Five colours, each meaning exactly one thing, and nothing else in
   the app allowed to use them.
--------------------------------------------------------------------------------------------- */
```

### A TUTOR. Deliberately NOT `--bad` — that red means something is wrong, and a person's name in the identical colour to an error message is the one collision

before `.w-red`

```
/* A TUTOR. Deliberately NOT `--bad` — that red means something is wrong, and a person's name in
   the identical colour to an error message is the one collision here that would actually mislead
   somebody. A softer coral, `--coral`, which a paper tag shares on purpose -- see `--tag-paper`. */
```

### ---------- GREEN MEANS A SUBJECT

before `.subject`

```
/* ---------- GREEN MEANS A SUBJECT -----------------------------------------------------------------
   The only place colour carries meaning rather than decoration. A subject name is green wherever
   it appears — in the Who list, on a booking, in a group heading on Stuff — so the eye learns it
   once and reads it everywhere without a legend.

   Nothing else may use it. The moment a second thing is green, green stops meaning anything.
--------------------------------------------------------------------------------------------- */
```

### ---------- PURPLE IS A VENUE, RED IS A TUTOR

before `h2 .venue, h3 .venue`

```
/* ---------- PURPLE IS A VENUE, RED IS A TUTOR -----------------------------------------------------
   THREE COLOURS, THREE QUESTIONS, and that is the whole set:

       green   WHAT   the subject
       purple  WHERE  the venue
       red     WHO    the tutor

   Those are the three facts a booking is assembled from and the three you scan a list for. A
   fourth would make this a legend, and a legend is what colour is supposed to replace.

   RED WAS THE CLIENT'S. It cannot be both — two lists in one colour is worse than neither being
   coloured, because the eye learns a rule that is false half the time. A client's name is a
   private detail inside a caption rather than a category anybody scans for, so it goes dim: still
   marked as a name, no longer competing with the three things you are actually looking for.

   The list colouring needs rows in the `laws` tab to take effect — the palette is here, the lists
   are data:
       kind `list`, match `venues`,    colour `purple`, weight 20
       kind `list`, match `tutors`,    colour `red`,    weight 20
       kind `list`, match `wearables`, colour `pink`,   weight 20
       kind `list`, match `clients`,   colour `dim`,    weight 10
--------------------------------------------------------------------------------------------- */
```

### `.card.is-venue` was here — purple headings on the old venue card, which is now a booking slip and has no `.card` and no `h3`.

before `h2 .venue, h3 .venue`

```
/* `.card.is-venue` was here — purple headings on the old venue card, which is now a booking slip
   and has no `.card` and no `h3`. Left behind it is a rule that reads as though venues are still
   coloured, and the next person to wonder why they are not would look here first. */
```

### ---------- A THING WITH A PICTURE

before `.thing`

```
/* ---------- A THING WITH A PICTURE ----------------------------------------------------------------
   A shop item and a resource both look better with the thing itself in view. The picture sits
   LEFT of the words rather than above them: a phone card is a row, and a picture on top pushes
   the name below the fold on a list of forty.
--------------------------------------------------------------------------------------------- */
```

### NOBODY HAS PRICED IT.

before `.price.is-unpriced`

```
/* NOBODY HAS PRICED IT. Its own class rather than `.faint`, which was the first attempt and does
   nothing here: `.faint` and `.price` are both one class, so the cascade settles it on which comes
   later in this file, and `.price` does. A class that silently loses a specificity race is the
   `--fly-ink` fault wearing a different hat — it reads as a decision and behaves as nothing.
   ITALIC RATHER THAN A COLOUR. `--dim` is what `.price` already uses and already passes contrast
   on this background; inventing a fainter grey for the one state a visitor can do nothing about is
   how a check/ui.js contrast finding gets added on purpose. */
```

### Something an admin has switched off — a tutor, a resource, a post.

before `.card.is-off, .post.is-off`

```
/* Something an admin has switched off — a tutor, a resource, a post. Dimmed rather than hidden:
   only an admin ever sees these, and an admin needs to find one to switch it back on. Hiding it
   would make deleting irreversible from the phone. */
```

### ---------- POSTS

before `.post`

```
/* ---------- POSTS ---------------------------------------------------------------------------------
   A picture, the reactions, a caption. Nothing around it — the photograph is the card, and a
   border round a photograph is a frame nobody asked for.

   ONE TO A SCREEN. A feed is where this shape belongs most obviously: a photograph competing with
   the top of the next photograph is a photograph nobody looks at properly, and scrolling past one
   by accident is how you never see it again.
--------------------------------------------------------------------------------------------- */
```

### Inside a page there is nothing under it, so the rule and the gap have nothing to separate — a hairline across the bottom of a screen reads as a feed that has

before `.page .post`

```
/* Inside a page there is nothing under it, so the rule and the gap have nothing to separate — a
   hairline across the bottom of a screen reads as a feed that has been cut off.

   CENTRED DOWN THE PAGE. A landscape photograph is about half the height of a phone, so the post
   sat at the top with a screenful of black under it — which reads as a page that failed to finish
   loading rather than as a picture with room around it. In the middle, the space falls above and
   below equally and becomes a margin instead of an absence.

   `safe center`, and the plain `center` above it for anything that does not know the keyword.
   That word is the whole reason this is safe to do: a post TALLER than the screen — a portrait
   photograph with a long caption — would be centred by overflowing equally at both ends, and the
   top of it, including who posted it, would be cut off and unreachable, because a cell does not
   scroll. `safe` says centre it unless that would push content out of reach, in which case start
   at the top. */
```

### Inside a page there is nothing under it, so the rule and the gap have nothing to separate — a hairline across the bottom of a screen reads as a feed that has

before `.page .post`

```
/* Inside a page there is nothing under it, so the rule and the gap have nothing to separate — a
   hairline across the bottom of a screen reads as a feed that has been cut off.

   TOP-ALIGNED, as it was. The centring is reverted — and worth a line on why it is not simply
   gone: the two attempts at it were both sound in themselves and neither could have worked,
   because the page they were centring inside had no spare height at all. That was a cell set to
   `position: static`, which is fixed in script.js and stays fixed; it was making the whole page
   stop where its content stopped, not just the post.
   So the post fills the page again and starts at the top, which is what it did before any of
   this. `flex: 1 1 auto` rather than `height: 100%` is the one thing kept: a percentage height on
   a flex item does not always resolve, and this asks the parent for the space instead of
   calculating it. Same result, one fewer thing that can quietly not happen. */
```

### IT NO LONGER STRETCHES.

in `.page .post`

```
/* IT NO LONGER STRETCHES. It grew to fill the pane, which was right when the pane was the whole
     screen and is wrong now that the pane is as tall as the post — a post that grows and a pane
     that shrinks to it are two rules pulling opposite ways, and the empty glass under the caption
     was the post winning. */
```

### NO BACKGROUND. It was `--sunk`, and inside the fixed 4:5 box below that ink WAS the black band above and below every landscape photograph and either side of

before `.post-pic`

```
/* NO BACKGROUND. It was `--sunk`, and inside the fixed 4:5 box below that ink WAS the black band
   above and below every landscape photograph and either side of every portrait one — reported as
   "please dont add the ugly black boarder to posts". A picture now takes its own proportions, so
   nothing of the box is left over to paint; while the file is still arriving the reserved space is
   the card's own colour, which reads as room rather than as a frame. A clip keeps its ink, below. */
```

### `height: auto` HERE AND NOT ONLY ON `.page .post-pic` BELOW, because the element carries `width="800" height="1000"` and a height attribute IS a height:

before `.post-pic`

```
/* `height: auto` HERE AND NOT ONLY ON `.page .post-pic` BELOW, because the element carries
   `width="800" height="1000"` and a height attribute IS a height: outside a page — the composer's
   preview, which is a sheet — the picture was drawn 1000px tall at whatever width it was given,
   every photograph stretched into the same tall rectangle. Measured at 390x844 before this line: a
   1600x900 landscape previewed at 358x1000. `auto` hands the height back to the attributes' own
   ratio mapping, which is `auto 800 / 1000` — the file's shape once it lands, 4:5 before. */
```

### ---------- SEVERAL PICTURES ON ONE POST, AS A GRID

before `.post-grid`

```
/* ---------- SEVERAL PICTURES ON ONE POST, AS A GRID --------------------------------------------
   TWO COLUMNS OF SQUARES, edge to edge like the single picture, and never a sideways strip: every
   column in this app is reached by a sideways swipe, and a carousel would eat it. When the count is
   odd the first takes the whole width, so what was put first leads. `object-fit: cover` here and
   not above, deliberately — see `postMediaHtml_` in posts.js for why a grid may crop and a single
   picture may not. The 2px gap is the one hairline between photographs, in the ground colour. */
```

### THE BLEED INSIDE A PANE IS THE PANE'S OWN PADDING, NOT `--pad`.

before `.pane .post-pic, .pane .post-grid`

```
/* THE BLEED INSIDE A PANE IS THE PANE'S OWN PADDING, NOT `--pad`. The pane was trimmed from 1rem to
   .85rem and the edge-to-edge rules above went on cancelling 1rem — so every post with a picture ran
   13 to 15px past its own card, which `check/live.js` recorded against real photographs and nothing
   here could see, because the fixture's posts had none. `--pane-pad` is written once, on `.pane`. */
```

### AND THE POST ITSELF TAKES THE PANE'S PADDING AS ITS OWN, so the bleed lands inside the post's padding box rather than past its edge.

before `.pane > .post`

```
/* AND THE POST ITSELF TAKES THE PANE'S PADDING AS ITS OWN, so the bleed lands inside the post's
   padding box rather than past its edge. Without this the picture still reaches the glass but the
   `article` reports it as overflow — 11 to 13px of sideways scroll that `check/ui.js` names the
   moment a fixture post carries a picture. The words inside are exactly where they were. */
```

### THE INK IS ONLY EVER SEEN BEFORE THE FIRST FRAME:

before `.post-vid`

```
/* THE INK IS ONLY EVER SEEN BEFORE THE FIRST FRAME: a clip with no frame yet — iOS draws none until it
   is played — is a dark rectangle with a play control on it, which reads as a video, where a
   transparent one is a play button floating over nothing. Once there is a frame the box is the
   clip's own shape (below), so none of the ink is left showing round it. */
```

### ITS OWN SHAPE, LIKE A PHOTOGRAPH, and 4:5 only until the file says what that is.

before `.post-pic.post-vid`

```
/* ITS OWN SHAPE, LIKE A PHOTOGRAPH, and 4:5 only until the file says what that is. It was a fixed
   4:5 with `contain`, which letterboxed every landscape clip in the same black bands as the
   photographs. `auto` means: the clip's natural ratio once its metadata has arrived, 4:5 before. */
```

### ---------- THE PICTURES ARE DRAWN AS THEY WERE TAKEN

before `.post-preview`

```
/* ---------- THE PICTURES ARE DRAWN AS THEY WERE TAKEN ------------------------------------------
   THERE WAS A FILM HERE FOR A DAY. Asked for as "a grainy look ... like 1999 or 2003", it was a
   `filter` (warm, faded, contrast) and a `mask-image` (a vignette times an `feTurbulence` grain) on
   every post picture, the composer's preview and every reel clip. Then asked for OFF: *"remove the
   2002 grainy effect on the posts"* — and off everywhere it was put, reels included, because it
   went on as ONE look and a grain left on the reels alone would be a second look nobody asked for.
   `check/ui.js` now reports a post's or a reel's picture that carries a filter or a mask, which is
   the inverse of the rule that used to require one: a look that is two properties on the picture
   itself measures perfectly to every layout rule there is, so nothing else would notice it back. */
```

### THE COMPOSER'S PREVIEW DRAWS WITH THE CARD'S OWN RENDERER, in a sheet that has no page margin to cancel — so the edge-to-edge bleed above would run past the

before `.post-preview`

```
/* THE COMPOSER'S PREVIEW DRAWS WITH THE CARD'S OWN RENDERER, in a sheet that has no page margin to
   cancel — so the edge-to-edge bleed above would run past the sheet's sides. Inside the preview the
   picture and the grid are simply the width they are given. */
```

### THE PICTURE IS SHOWN WHOLE.

before `.page .post-pic`

```
/* THE PICTURE IS SHOWN WHOLE. Full width, its own height, and never enlarged past it.

   It used to stretch to fill the page with `object-fit: cover`, which crops — and what a phone
   camera crops is the top and bottom of a portrait, which is where the person usually is. A
   photograph of a child's work with the work cut off is worse than a photograph with a gap under
   it, and this is a feed of things children made rather than a wallpaper.

   So: edge to edge across, natural height down. A landscape photograph leaves room below it for the
   caption and some black.

   AND THE SENTENCE THAT USED TO FOLLOW THAT ONE WAS FALSE. It said a tall photograph "runs past the
   bottom of the screen and the page scrolls, which the pager already allows for — a page that can
   scroll keeps the gesture until it reaches its end". That was true of `.pane.scrolls`, the class
   that gave an overflowing pane its vertical gesture back, and that class was DELETED — the note by
   `.pane`'s own `touch-action` records it, and CLAUDE.md records the argument. A pane is
   `overflow: hidden` and clips. There is no scroll for the gesture to reach the end of.

   SO IT WAS CUT OFF, AND MEASURED IT WAS THE COMMENT BOX: a 4:5 portrait put the post 582px into a
   534px pane at 320x568, the textarea and its Send button below the fold with no scroll and no page
   to turn to. That is answered now by the rule every card follows — `paneReach_` in find.js draws a
   card taller than its pane smaller, whole, and centred — rather than by anything that crops or
   caps the photograph. A 9:16 portrait, the tallest thing a phone camera gives, is drawn at about
   95% at 390x844 and 72% at 320x568 for somebody signed in, whose card carries the comment box;
   signed out it fits whole at 390 and is 77% at 320. `check/fixture.json` carries photographs now and every width
   is measured at a real phone's height, which are the two reasons this used to be invisible. */
```

### ITS OWN PROPORTIONS, EDGE TO EDGE, AND 4:5 ONLY WHILE IT IS ON ITS WAY.

in `.page .post-pic`

```
/* ITS OWN PROPORTIONS, EDGE TO EDGE, AND 4:5 ONLY WHILE IT IS ON ITS WAY.

     THIS WAS A FIXED 4:5 BOX WITH `object-fit: contain` ON THE SUNK INK, and it went on the report
     "please dont add the ugly black boarder to posts". Measured at 390x844 before the change: a
     1600x900 landscape drew in a 326x407 box with 112px of black above it and 112px below, and a
     900x1600 portrait had 48px of black down each side. Every photograph that was not already 4:5 —
     which is most of them — was a photograph in a frame.

     THE FIXED BOX WAS BOUGHT FOR STABILITY and the reason is sound: a box that takes the file's own
     shape changes height when the file lands, and a 2:1 landscape arriving 800ms late shrank its
     card by 203px under the thumb. So the stability is kept by the two things that cost no black:

       - `auto 4 / 5` reserves a 4:5 space until the file's own ratio is known, so an image is never
         a zero-height box that the grid places for the wrong height. `width`/`height` on the
         element say the same to anything that reads them before the stylesheet;
       - and `postsAhead_` asks for the pictures one page behind and two ahead, so a photograph has
         normally arrived before its page is in front of anybody — the change happens off-screen.

     IT DOES MOVE THE PAGES UNDER IT, which is the half worth measuring rather than assuming: a page
     is `height: auto` in an ordinary CSS column, not a fixed cell, so every picture that lands above
     the post being read moves it by the difference between 4:5 and the file — 224px for a 16:9
     landscape at 390 — and the differences add up. `holdColumn_` in shell.js puts it back, from
     inside the `ResizeObserver` delivery that sees the card grow — which runs before paint, so the
     frame is never drawn with it moved. Its own note holds the measurements; one place, so they
     cannot disagree.

     What is left is the post you are READING on a cold open, whose own picture can land after it is
     drawn and move its caption once. That is the whole cost of showing a photograph without bands,
     written down so it is a trade rather than a regression. NOT `cover`, which crops the sides off
     a landscape and the top off a portrait — where the person usually is. A card this makes taller
     than its pane is drawn smaller by `paneReach_`, like every other card, and stays centred. */
```

### `.post-act` WAS THE SHARE CONTROL in the reactions row, and it is a tile now — see `postTiles_`.

before `.post-by`

```
/* `.post-act` WAS THE SHARE CONTROL in the reactions row, and it is a tile now — see `postTiles_`.
   Its last note is worth carrying forward because it is the rule this project keeps relearning:
   `min-width: 2.2rem` is 32.6px on a 390px phone, so Share measured 30x44 — tall enough to look
   deliberate and too narrow to hit, which is the worst version of this fault because nothing about
   it looks wrong. Tap targets in px. The tile row gets that for free from one renderer, which is
   the whole argument for tiles over a control per card.

   THE HEART IS GONE TOO, and that stays gone: a like is a reaction with exactly one option, so
   keeping both meant two counts of the same gesture with no way to say which you had meant. */
```

### ---------- A POST, AS INSTAGRAM ARRANGES ONE

before `.post-by`

```
/* ---------- A POST, AS INSTAGRAM ARRANGES ONE -----------------------------------------------------
   Who, then the picture, then what you can do, then what it says. That order is not fashion — a
   photograph with no attribution reads as an advert, and the caption goes last because it is the
   part somebody may not read at all.
--------------------------------------------------------------------------------------------- */
```

### The username with the place under it, which is where Instagram puts it and where it reads as a detail about the picture rather than a second heading.

before `.post-nm`

```
/* The username with the place under it, which is where Instagram puts it and where it reads as a
   detail about the picture rather than a second heading.
   ONE rule for this, not two. There was a `margin-left: auto` on `.post-by .post-where` earlier in
   the file and a `margin: 0` here overriding it — two rules setting the same property on the same
   element, which works until somebody edits one of them. The right-hand end of that row belongs to
   the edit control now, so the auto margin is gone rather than overridden. */
```

### The edit control. At the END of the header row, small — a post is looked at a hundred times for every time it is edited, and a control sized for the rare case

before `.post-edit`

```
/* The edit control. At the END of the header row, small — a post is looked at a hundred times for
   every time it is edited, and a control sized for the rare case is a control in the way for the
   common one. `margin-left: auto` is what puts it at the end, which is why nothing else in that
   row may claim it. */
```

### ---------- THE SLOT FOR THE FACES, UNDER THE PICTURE

before `.post-acts`

```
/* ---------- THE SLOT FOR THE FACES, UNDER THE PICTURE ---------------------------------------------
   The place the heart held, which is where the eye already goes and where the thing you can do about
   a photograph belongs. ONE CHILD NOW, SO A BLOCK AND NOT A FLEX ROW: it was a flex row because the
   Share button sat beside the faces, `align-items: flex-start` because the faces wrapped. Share is a
   tile in the row below (`postTiles_`) and the six faces never wrap (see REACTIONS below), so there
   is nothing left to align. The 6px each pill keeps above and below it inside its own 44px cell is
   most of the gap to the photograph and the caption; the padding only tops it up to about 9px each
   side, where it was 5.2px above and 3.7 below and the row looked jammed between the two.
   STILL `flex: none` IN `.page` (above), with `.post-when`: the skeleton in me.js draws one too. */
```

### ---------- WHEN, AND HOW MANY

before `.post-when`

```
/* ---------- WHEN, AND HOW MANY ------------------------------------------------------------------
   "3 weeks ago · 77 reactions". The total moved here off the end of the row of faces, where a bare
   "77" read as one more face's count. The line is 44px tall whether or not there is a total, so the
   first reaction on a post moves nothing below it: the tile row stays where the thumb left it. */
```

### (0,2,0), SO IT BEATS `button.text-action` (0,1,1), which gives every inline action `color: inherit` and `.4rem` of side padding.

before `.post-when .react-who`

```
/* (0,2,0), SO IT BEATS `button.text-action` (0,1,1), which gives every inline action `color: inherit`
   and `.4rem` of side padding. Inherited here, the total would be the time's own `--faint`; it is
   `--dim`, one step up, because it is the one thing on the line you can press — and a step, not ink,
   because it must not be louder than the caption above it. No side padding, so it sits one dot after
   the time rather than a gap and a dot after it. The 44px box and the dotted line stay the class's. */
```

### WHAT PEOPLE SAID UNDER A POST.

before `.post-said`

```
/* ==================================================================================================
   WHAT PEOPLE SAID UNDER A POST.

   NOT BUBBLES, AND THAT IS THE DECISION WORTH WRITING DOWN. Messages got bubbles one screen along
   because a conversation between TWO people is read by side — you know who said a thing from where
   it sits. A comment thread is many people talking about one photograph, and there is no side for
   a fourth person to be on. So it is what a feed comment has always been: the name, then what they
   said, on one line that wraps — which is exactly `.post-cap` above, because the caption IS the
   first comment.

   RULED OFF AT THE TOP, NOT BOXED. It belongs to the post it is inside — a card of its own would
   page separately on the feed and leave the photograph behind, which is the `.reel` fault one file
   over. One hairline says "and then people said this".
================================================================================================== */
```

### YOURS IS MARKED BY THE RULE DOWN THE LEFT that messages gave up when they became bubbles — which is the shape that rule was always right for:

before `.cmt.mine`

```
/* YOURS IS MARKED BY THE RULE DOWN THE LEFT that messages gave up when they became bubbles — which
   is the shape that rule was always right for: a full-width row, in a list of them, where the mark
   has to read at a glance without competing with the text. */
```

### `Remove` LOOKS LIKE TEXT AND IS 44px, and the first version of it was 31x13.

before `.cmt-x`

```
/* `Remove` LOOKS LIKE TEXT AND IS 44px, and the first version of it was 31x13. Underlined, because
   `check-css.js` fails a tappable thing that would look like plain text; 44px in px, because
   `check/ui.js` named it at three widths and it is right — taking your own comment down is rare,
   and a control you cannot hit is not a control that is rarely used, it is one that is not there.

   THE HEIGHT GOES ON THE LINE, AND ONLY WHERE THERE IS A BUTTON ON IT. A 44px time-line under every
   comment is 44px of nothing under the ones nobody may remove — and an admin sees a Remove on every
   comment in the thread, so that is not a rare case. `:has` asks the question the markup already
   answers; without it every line takes the height, which is generous rather than wrong, and that is
   the right way round for a fallback. */
```

### THE BOX. `msg-form`'s shape and not its rules, because these two are on different surfaces and will drift apart the day one of them changes — a composer under

before `.cmt-form`

```
/* THE BOX. `msg-form`'s shape and not its rules, because these two are on different surfaces and
   will drift apart the day one of them changes — a composer under a photograph in a feed is not
   the foot of a conversation. What they share is the one thing that must not drift: the 44px floor,
   in px, which is this file's rule.

   `Post` IS A TILE NOW — *"post should be a tile too"* — so its 44px and its plate are `.tile`'s, and
   the `.cmt-form .btn.cmt-go` rule that sized the old button is gone with it. Not gold, for the
   reason the button was `quiet`: gold is the one action on a card, and on a post that is the
   reaction row directly under the picture. `align-items: flex-end` keeps it at the foot of a box
   that has grown to several lines, where the thumb that finished typing already is. */
```

### ---------- CHOOSING A PHOTOGRAPH ALREADY IN THE FOLDER

before `.pickers`

```
/* ---------- CHOOSING A PHOTOGRAPH ALREADY IN THE FOLDER -------------------------------------------
   A row of what is there, scrolled sideways. Sideways because the alternative is a grid that
   pushes the caption box off the screen — the picker is one field of a form, not the form.
--------------------------------------------------------------------------------------------- */
```

### ---------- WAITING: ONE LOADER, AND THIS IS THE ONLY BLOCK THAT DRAWS ONE

before `.loading`

```
/* ---------- WAITING: ONE LOADER, AND THIS IS THE ONLY BLOCK THAT DRAWS ONE ------------------------
   THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple
   loading thing while it's info or whatever is loading."* Measured that day: a skeleton post on three
   columns, ten waiting sentences in thirteen places, two columns calling a wait "nothing here", seven
   waits with nothing on the screen, and nineteen widgets each with its own look before it started —
   docs/history/306. This block replaces every one of them. `loading_()` in shell.js is the only thing
   that writes its markup, and `js/check-loading.js` fails on a wait drawn any other way: an old
   waiting phrase, a skeleton, shimmer or spinner class, or a `@keyframes` for waiting outside here.

   THREE GOLD DOTS THAT PULSE IN TURN. Gold because it is the one colour on the black that says "this
   app, doing something" — the colour of the one action; dots rather than a ring because the ring is
   taken: `.btn.is-busy` and `.tile.is-busy` above say "pressed, and working on it" (docs/history/094),
   which is a different sentence from "on its way", and two meanings need two shapes. In turn rather
   than together, so it reads as something moving along rather than as a light left on.

   ONE SIZE EVERYWHERE, in `rem` — nothing here is pressed, and a fingertip is the only thing on this
   screen that must not scale. The dots and the gap between them are the same in every card; what
   changes is the room they are centred in, which is the room the content will take:
     · IN PLACE (a verse, a list, a score board): about two lines, the size of the sentence each of
       these replaced, so nothing shrinks round it when it arrives.
     · A WHOLE PAGE — the loader the only thing on a pane: NO FRAME AT ALL, the dots alone at the
       middle of the cell, which is where the card that lands is centred (`columnShift_`). There is no
       card edge to jump from because none was drawn.
     · OVER markup already drawn and not ready (`aria-busy="true"` with the loader its last child — a
       widget waiting its turn to start, the records before the sheet answers): what is underneath
       keeps its exact size and is not seen, the dots sit over the middle of it, and `loaded_` takes
       them off. Nothing under them can move, because nothing under them was ever moved. */
```

### Opacity and a little scale only — the two a browser can run without laying anything out, so a column of these costs nothing while the app is busiest, which is

before `@keyframes loading`

```
/* Opacity and a little scale only — the two a browser can run without laying anything out, so a
   column of these costs nothing while the app is busiest, which is exactly when they are on.
   EACH DOT IS LIT FOR FOUR FIFTHS OF THE TURN, a sixth of a turn behind the one before, so one of the
   three is always brightening. The first cut lit each for a third and left all three at their
   faintest for a third of every second — shot at 390 on 9 Oct, that frame read as three specks of dust
   on an empty card rather than as something on its way. */
```

### ONLY THE CARD IN FRONT MOVES.

before `.page:not(.on) .loading > span`

```
/* ONLY THE CARD IN FRONT MOVES. A column drawn beside the one you are on holds a loader on every
   widget it has not started yet — nine on Tools — and an infinite animation runs whether or not
   anybody can see it: measured on 9 Oct, the Imposter card's own walk through its screens took 1.3–1.5s
   against 1.08s with nine loaders breathing on the next column, which `check/ui.js`'s 2.5s at 1920
   then missed. A loader on a card that is not in front is three still dots; the page that comes in
   front (`.page.on`, set by `placeGrid`) starts it. Loaders outside a page — a sheet — always move. */
```

### A WHOLE PAGE WAITING:

before `.pane:has(> .loading:only-child)`

```
/* A WHOLE PAGE WAITING: THE DOTS, AND NO CARD ROUND THEM.
   IT WAS A FULL-CELL CARD — the pane held at the cell's height with the dots in its middle, on the
   argument that the card arriving would land "inside the space the dots were keeping". True of the
   middle and of nothing else: measured by review with the payload held and then let go, the frame's
   edges snapped inward the moment anything landed — the feed 807→311px at 390, Saved 807→158,
   Spotlight 807→177, Booking 807→606, and the same at 320 — a 250–325px jump on each side, which is
   the jump this was meant to prevent, on every column of the first second anybody sees.
   SO THE FRAME IS TAKEN AWAY RATHER THAN GUESSED AT. While a pane holds nothing but the loader it has
   no fill, no edge and no shadow — the dots on the screen's own black — and only a modest height so
   they have room. Pages are centred in the cell (`columnShift_`), so the card that arrives appears
   round the point where the dots were (measured: the landed cards' middles within a pixel of the
   dots'), and there is no outline for it to collapse from. `check/ui.js` holds the payload, measures
   this, lets it go and measures again. */
```

### OVER WHAT IS ALREADY DRAWN:

before `[aria-busy="true"]:has(> .loading)`

```
/* OVER WHAT IS ALREADY DRAWN: held at its own size, unseen and untouchable, the dots over its middle.
   `visibility` and not `display` — `display: none` would take the box's height with it, which is the
   jump this exists to prevent; and a hidden control cannot be focused or pressed, so nothing can be
   typed into a box that is about to be filled. */
```

### ---------- A POLL

before `.poll`

```
/* ---------- A POLL --------------------------------------------------------------------------------
   Rows you can press, and once you have, a bar behind each one. The bar is drawn INSIDE the row
   rather than under it — a separate bar chart under a list of answers is two things to read where
   one will do.
--------------------------------------------------------------------------------------------- */
```

### ---------- REACTIONS

before `.reacts, .rx-head`

```
/* ---------- REACTIONS -----------------------------------------------------------------------------
   THE OWNER, 9 Oct: *"Also refine how the post reactions look. Looks abit scuffed right bow"*. What was
   scuffed, measured on the row that was here: 2px-radius boxes whose edges were `--line-soft` (1.0:1
   against the card) or `--line` (1.15:1), so some faces looked boxed and some loose; a box as wide as
   its count (36.8, 46.7 or 59.2px), so 🎉 and the total dropped to a second line and a tap that added
   a digit threw a face 43px down; a bare "77" at the end that read as another face's count; and
   squares beside the real Share tile that looked like tiles left unfinished. docs/history/307.

   PILLS, BECAUSE THE APP ALREADY HAS A PILL. The funnel's chips are a 32px, 16px-radius outline in
   `--chip-line`, filled when chosen — a shape everybody using this app has pressed. A face is the same
   kind of thing (pick one, see it chosen, take it back), so it joins that family rather than being a
   third shape beside the chips and the tiles.

   With no emoji at all there is no row, and the markup says so in words for an admin rather than
   leaving a gap that reads as a styling fault. See the note over `reacts()`.
--------------------------------------------------------------------------------------------- */
```

### "YOURS" IS A GOLD TINT, AND IT IS THIS COMPONENT'S OWN.

before `.reacts, .rx-head`

```
/* "YOURS" IS A GOLD TINT, AND IT IS THIS COMPONENT'S OWN. Declared on the two places it is drawn rather
   than at `:root`, which is the house rule for a colour that belongs to one component — the chess
   board's cream and charcoal are the precedent. Derived from `--gold`, so no new colour. */
```

### ---------- SIX EQUAL COLUMNS, WHATEVER THE COUNTS ARE

before `.reacts`

```
/* ---------- SIX EQUAL COLUMNS, WHATEVER THE COUNTS ARE ---------------------------------------------
   A grid and not a wrapping flex row, because a flex row sized each face by its count, and one tap
   that added a digit reflowed the row and threw a face onto the next line. Six columns of one width
   cannot move. FACES WRAP ONLY WHEN THERE ARE MORE THAN SIX: the house set never does, at any width
   from 320 up; a post's own cell naming more starts a second line IN THE SAME COLUMNS; a set of four
   uses four of the six at the house set's width, so every post's row looks like every other's. The
   3.75rem cap stops a wide card stretching them into lozenges, and they sit left, on the text edge.
   `margin-inline: -2px` puts the first pill's edge back on the text column: each cell is its pill
   plus 2px either side, so there is no dead pixel between two faces and none outside the first. */
```

### UNDER 320, SIX CELLS WOULD BE NARROWER THAN THE FACES, so the row goes back to fingertip columns that wrap — four and two at 280.

before `@media (max-width: 319px)`

```
/* UNDER 320, SIX CELLS WOULD BE NARROWER THAN THE FACES, so the row goes back to fingertip columns
   that wrap — four and two at 280. Nothing in the app's measured widths is that narrow; this is the
   floor, so the faces are never squeezed past a face. */
```

### ---------- THE CELL IS THE BUTTON, THE PILL IS DRAWN INSIDE IT

before `.react`

```
/* ---------- THE CELL IS THE BUTTON, THE PILL IS DRAWN INSIDE IT -----------------------------------
   THE OLD NOTE SAID "Below the 44px rule on purpose: these sit in a row of five or six and a
   full-height control would be a wall." The wall was right and is kept out — in spirit. In letter it
   is reversed: the button is the whole 44px cell, in px as a finger needs, and the pill is its 32px
   `::before`, 6px in from top and bottom — `.chip.sm`'s reach turned inside out, so what `check/ui.js`
   measures IS what a thumb can hit, and the drawn chrome is smaller than the old 38px box was. At 320
   six cells are 41.3px wide, which is the one thing under the floor: `ACCEPTED_TAP` in check/ui.js. */
```

### THE PLATE IS VISIBLE ON A CARD.

before `.react::before`

```
/* THE PLATE IS VISIBLE ON A CARD. `--line-soft` was 1.0:1 against the post's grey and `--line` 1.15;
   the chip family's outline is the step a reader can see, over the 4% white wash the tick boxes and
   the booking ticks already sit on (`.check .box`, `.bk-tick`). EVERY
   FACE GETS IT, counted or not: a row of six identical pills is the tidy version, and the number
   inside is what says somebody pressed it. Radius half the height — a pill, not a rounded square.
   `::before` AND NOT `::after`: the house rule `.react::after { content: none }` (with the chips, the
   buttons and the tiles, under "THE ONES THAT ARE ALREADY OBVIOUS") stays exactly as it is. */
```

### THREE CHARACTERS (100-999, or 1k-999k) STEP DOWN ONE SIZE rather than widen the column:

before `.react.is-long`

```
/* THREE CHARACTERS (100-999, or 1k-999k) STEP DOWN ONE SIZE rather than widen the column: at 320 a
   cell is 41px and "212" beside a face at .8rem measured 1.4px past the pill's edge. On the BUTTON,
   set by `reacts()`, rather than `:has()` on the count — one class, read by one rule, in every browser. */
```

### PRESSED IS `.is-pressed` AS WELL AS `:active`, as on the chips these pills joined — see the note over `.row.tap.counted:active`.

before `.react:active, .react.is-pressed`

```
/* PRESSED IS `.is-pressed` AS WELL AS `:active`, as on the chips these pills joined — see the note over
   `.row.tap.counted:active`. Safari withholds `:active` on touch because every listener here is on the
   window, and `-webkit-tap-highlight-color: transparent` above takes away the grey flash that was the
   only other sign; `pressMark_` (shell.js) puts the class on at `pointerdown`. Without it, on an
   iPhone, taking a reaction back or pressing a face signed out showed nothing at all. */
```

### THE FACE YOU JUST PRESSED LANDS, ONCE.

before `.react.is-pop`

```
/* THE FACE YOU JUST PRESSED LANDS, ONCE. The press above lasts while the finger is down; the repaint
   that follows the tap replaces the button, so the press cannot also say it LANDED — the new button
   has never been pressed. `is-pop` is set on the new one for exactly one paint (`REACT_POP_` in
   posts.js) — on a face added or moved to, never on one taken back, and never for somebody who has
   asked for less movement. */
```

### ---------- WHO REACTED: THE FACE IS THE HEADING

before `.rx-group + .rx-group`

```
/* ---------- WHO REACTED: THE FACE IS THE HEADING ---------------------------------------------------
   The sheet's section-label style (`#sheet-body h2`: .7rem, small caps, dim) made the face the
   smallest thing in the sheet, about 10px, and glued its count to it. Each group is a `<section>`
   headed by the same pill as the row, bigger, and yours is the gold one; your own name comes first
   with a gold "you" after it. Groups run most-used first (`on('who-reacted')`). */
```

### ---------- THE SAME CONTROL AS A REAL BUTTON

before `button.text-action, button.text-drop`

```
/* ---------- THE SAME CONTROL AS A REAL BUTTON -----------------------------------------------------
   THESE WERE `<span>`s WITH A `data-do` and they are `<button>`s now — the docket's delete, the
   basket's ✕ and the laminate toggle, all for the same reason: a span cannot be reached by a
   keyboard, is not announced as a control, and is invisible to `check/ui.js`, which measures
   buttons, links and inputs.

   A BUTTON BRINGS THE BROWSER'S OWN CLOTHES WITH IT — a grey ground, a border, a system font at the
   system size — so the whole point of an inline text control is lost unless they are taken off. The
   dotted underline above then applies to both, and a reader cannot tell which element it is.

   44px, IN px, AND WITHOUT MAKING THE LINE 44px TALL. `min-height` on an inline-block inside a
   basket row grows the row; these sit at the end of a line in a list of four or five, where that is
   room well spent — unlike the booking form's fifteen, which is why THOSE controls are in
   `ACCEPTED_TAP` instead. Vertical padding rather than a height so the text stays on the line's
   baseline with the name beside it. */
```

### THE THINGS THAT WERE BUILT AFTER THE SCREENS.

before `.dock-row`

```
/* ================================================================================================
   THE THINGS THAT WERE BUILT AFTER THE SCREENS.
================================================================================================ */
```

### ---------- THE THREE PASSES WERE HERE — `.ticks`, `.tick`, `.tick-box`, `.tick-said`

before `.dock-row`

```
/* ---------- THE THREE PASSES WERE HERE — `.ticks`, `.tick`, `.tick-box`, `.tick-said` -----------
   SEVENTY LINES FOR THREE CHECKBOXES, and most of it was the argument for why an EMPTY box has to
   look pressable: `--sunk` behind a `--line` border is #232323 on near-black, a small grey smudge
   at 1.6rem, indistinguishable from the marks beside it that genuinely cannot be pressed. The
   answer was an edge at 14% white, a ghost ✓ at 16% inside it, and a lit edge on `:active` because
   `:hover` is a desktop luxury and `:active` is what a phone has. That reasoning is worth keeping
   even though the rules are not — `.check .box` is the surviving control built the same way, and
   any new checkbox in this app should be.

   NOTHING DRAWS THEM. `tickRow` in find.js did; the tick columns held the handles of real children
   and were stripped out of `data/questions.json` before it was committed to a public repository.
   See the note where `tickRow` used to be. The card-scoped overrides below went with these.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE DOCKET

before `.dock-row`

```
/* ---------- THE DOCKET --------------------------------------------------------------------------
   A row is a tick, a line of text, and a way to drop it. No card and no border around each one —
   it is a list you work down, and eight boxes stacked reads as a form rather than as a docket.
--------------------------------------------------------------------------------------------- */
```

### `.btn.tiny` AND THIS RULE ARE BOTH TWO CLASSES, so the one written later wins — and `.btn.tiny` is ninety lines below, setting `font-size: .8rem`.

before `.dock-new .btn`

```
/* `.btn.tiny` AND THIS RULE ARE BOTH TWO CLASSES, so the one written later wins — and `.btn.tiny`
   is ninety lines below, setting `font-size: .8rem`. The add button is `btn quiet tiny`, so the
   1.1rem written here has never once applied: measured, the ＋ renders at 11.86px inside a 44px
   box where 16.3px was asked for. A glyph is not a word and needs the size; the width and the flex
   were fine because nothing else claims them.

   THE SEVENTH CONVICTION OF THIS RULE in this stylesheet, after `.price.faint`, `--fly-ink`,
   `.bk-row.is-blank` losing to `.bk-row.is-bare`, `.rc-total` losing to `.bk-row`,
   `text-anchor="end"` losing to `.qsheet .num`, and `.fc-sec p` (caught before it was written).
   `check/cascade.js` is the rule rather than the seventh repair. */
```

### ---------- THE TIMETABLE

before `.tmt`

```
/* ---------- THE TIMETABLE ---------------------------------------------------------------------------
   A day at a time under a row of day chips — see the note over `TMT_DAY_NAMES` in games.js for why
   it is not a seven-column grid. The chips are 44px in px, the rule this stylesheet has eight
   convictions of — five of them and their gaps are 228px, see the 320 rule below — and seven go four
   and three rather than squeezing under the floor.

   TEN HUES ON THE COMPONENT, the chess board's rule: a subject's colour is this widget's own
   convention and nothing else in the app should be offered it. Drawn as a 4px edge rather than a
   fill, so the words on the row are always the app's own ink on the app's own ground and no hue
   has to pass a contrast test it was never chosen for. None of the ten is the app's gold, which
   means "the one you have chosen" — the selected day — and a subject drawn in it would say that. */
```

### AND AT 320 THAT DOES NOT FIT, MEASURED:

before `@media (max-width: 22rem)`

```
/* AND AT 320 THAT DOES NOT FIT, MEASURED: the widget's slot is 218px there and five 44px chips with
   their gaps are 228. Shrinking a chip under 44 is the one trade this stylesheet refuses, so the
   card gives up some of its own inside edge on a narrow phone instead — .4rem a side, which takes the
   slot to 231px. The card's outside is unchanged, so it still lines up with every widget beside it. */
```

### A SESSION BOOKED HERE, LOCKED AMONG YOUR OWN LESSONS.

before `.tmt-row.is-booked`

```
/* A SESSION BOOKED HERE, LOCKED AMONG YOUR OWN LESSONS. Green on its edge and a wash of it behind,
   because a session is a subject and green is what a subject is everywhere in this app — the colour
   `Your week`'s blocks carried before they moved in here. Not a hue from `--tmt-*`: those are handed
   out to what you typed, and a booking is not yours to recolour. */
```

### NO CLOCK BUTTON IN THE TIME BOX.

before `.tmt-time::-webkit-calendar-picker-indicator`

```
/* NO CLOCK BUTTON IN THE TIME BOX. Chrome draws one that opens a picker over the card — a pop-up, the
   one thing this app refuses — and at 320 it sat on top of the minutes: a screenshot showed "11:1".
   On a desktop the hours and minutes are typed or arrowed in place without it.
   ON A PHONE THIS DOES NOTHING AND IS NOT CLAIMED TO: tapping a time box opens the platform's own
   wheel or clock, which no rule here can reach. That is the same native control as the booking
   form's dropdowns and the exam-date picker on Settings, which is the line this app already draws —
   its own surfaces never open over the card, the platform's controls may. */
```

### ---------- TOUCH TYPING

before `.vid-box`

```
/* ---------- TOUCH TYPING ---------------------------------------------------------------------------
   See the note over `KT_LESSONS` in games.js. A ladder of five 44px rungs, the line to copy, the
   speed, and a keyboard drawn underneath with every key in the colour of the finger that presses it.

   THE FINGER COLOURS ARE THIS WIDGET'S, so they are declared on `.kt-box` and nowhere else — the
   chess board's rule and the timetable's. MIRRORED, one hue a finger and the same on both hands:
   a little finger is violet whichever hand it is on, which is how the colour teaches anything —
   eight different hues would be eight things to remember instead of four. None of them is the
   app's gold, which is kept for the one key that is wanted next — and the index fingers were orange
   until a screenshot of a lit `g` showed an orange key in a gold ring reading as one blob. Pink now.

   THE KEYS ARE NOT TARGETS. Nothing on the drawn keyboard can be pressed — see `ktBoardHtml_` — so
   it is sized in rem with the type and is about 18px a key at 320, which is a picture of a
   keyboard and not a breach of the 44px floor. The rungs and the line are the targets, and those
   are px. */
```

### ---------- VIDEOS: A PILL, A WATCH PAGE, AND A LIST OF PICTURES — YOUTUBE'S SHAPES IN OUR COLOURS

before `.vid-box`

```
/* ---------- VIDEOS: A PILL, A WATCH PAGE, AND A LIST OF PICTURES — YOUTUBE'S SHAPES IN OUR COLOURS --------
   *"Can you also make the video serger widget look more like YouTube."* (9 Oct, note 311.) The shapes
   are YouTube's — a fully rounded search box with a magnifier in it, a result that is a 16:9 picture
   with a badge in its corner and a bold two-line title beside it, and a watch page that is the
   player, then its title, then one dim line — and the colours are this app's. NOTHING IS RED, which
   is the one colour every YouTube page leads with: here red only ever means something is wrong (the
   note over `--bg`), and a red play mark on a list of cartoons would be a warning nobody meant.

   THE CARD'S OWN COLOURS ARE DECLARED ON THE CARD, the chess board's rule: each is a mix of tokens
   that already exist, named here so the card is the only place they are offered. (The player's black
   is not one of them: a letterbox is every video's, so it is `--letterbox` at `:root`.)
     --vid-scrim      the badge's plate: YouTube's black-at-80% behind its duration, so a word sits
                      on any picture, light or dark.
     --vid-frame      the poster: a flat neutral frame, YouTube's missing picture — about a tenth of the
                      ink over the card, where YouTube's is a tenth of white over its page.
     --vid-mark       the kind's mark in that frame, as quiet as the card's faint words.
   THE RADIUS IS YOUTUBE'S 8px, not the app's 3: a thumbnail's rounded corner is half of what makes a
   list read as YouTube's at a glance. px, like every radius here — a corner that grew with the root
   font would round differently on every phone.

   NO GRID FOR A WIDE CARD. There was one, from a 30rem container query, and no card ever reached it:
   measured on 9 October the card is 217px wide at 320, 271 at 390, 376 at 768, 341 at 1280 and 303 at
   1920, because a column is a phone-width card on every screen, and the Saved column draws it at 271.
   Untested CSS shipped to every phone for a width that does not exist, so it went (review of 9 Oct).
   Every width gets the compact row, which is what YouTube itself draws in a column that size — its
   watch page's "up next" list. */
```

### THE CARD'S LAST MARGIN STAYS INSIDE IT (`flow-root`), so the box's `offsetHeight` is the room the card takes.

before `.vid-box`

```
/* THE CARD'S LAST MARGIN STAYS INSIDE IT (`flow-root`), so the box's `offsetHeight` is the room the card
   takes. `vidHold_` (games.js) holds the results at the height a film had when an edit leaves it, read
   from the box; the watch block's bottom margin used to collapse out through the box and the card into
   the pane, so the box read 8px short of what the pane had, and the bar dropped 2px at the first letter
   over a film at 320x568 (`check/videos.js`, 'hold'). Nothing moves on the glass: the margin is the same
   margin, counted one box further in. */
```

### THE PILL. The magnifier sits inside the box at the left and is not a target — `pointer-events: none`, and the `<label>` round both hands a tap on it to the box.

before `.vid-search`

```
/* THE PILL. The magnifier sits inside the box at the left and is not a target — `pointer-events: none`,
   and the `<label>` round both hands a tap on it to the box. The box keeps the stylesheet's 16px type
   (iOS zooms on anything smaller) and its 44px floor; only its corners and its left room change. The
   magnifier's own 18px is px because every `.tile-i` is; the room round it is rem, like every length
   that is not a target. */
```

### THE ✕ A BROWSER DRAWS IN A SEARCH BOX, IN THE CARD'S OWN GREY.

before `.vid-box .vid-q::-webkit-search-cancel-button`

```
/* THE ✕ A BROWSER DRAWS IN A SEARCH BOX, IN THE CARD'S OWN GREY. `type="search"` is what puts it there,
   and it is half of what makes the pill read as YouTube's — but Chromium draws it in its own default
   blue, the one colour on the card from outside the palette, inside a pill whose ring has just turned
   gold. Drawn here as the same 1.4-stroke cross the tiles use, as a mask, so it is painted in
   `--dim` and goes gold with the magnifier. WebKit and Blink only; Firefox draws no ✕ at all. */
```

### THE WATCH PAGE, ONLY WHILE SOMETHING PLAYS — and in place of the results, not over them (note 321).

before `.vid-watch`

```
/* THE WATCH PAGE, ONLY WHILE SOMETHING PLAYS — and in place of the results, not over them (note 321).
   The player is 16:9 and states it, so the card does not jump when a video is chosen and an iframe
   (whose own size, 300x150, is worth nothing) fills the width it is given. Then the title — YouTube's
   is the boldest line on the page — and the dim line, with the Full screen tile BESIDE them rather
   than under them: see `vidNow_` for the 40px it cost. */
```

### `.vid-under` AND NOT `.vid-acts` ALONE:

before `.vid-under .vid-acts`

```
/* `.vid-under` AND NOT `.vid-acts` ALONE: `.tile-row` sets its own margin far below this, and a single
   class here would lose to it. A film from the folder has two tiles here, Full screen and Open in
   Drive; they stay on one row (`flex: none`), and the title beside them wraps instead. */
```

### ---------- THE APP'S OWN FULL SCREEN: THE PLAYER OVER THE WHOLE GLASS, BLACK ROUND IT

before `.vid-watch.on.is-fs`

```
/* ---------- THE APP'S OWN FULL SCREEN: THE PLAYER OVER THE WHOLE GLASS, BLACK ROUND IT --------------
   *"you can click fullscreen to make it fullscreen"* (10 Oct, note 321) — on the phone that has no full
   screen for a frame (Safari on an iPhone), the block holding the player is put in the TOP LAYER where it
   stands (`vidFullOn_` in games.js says why that and nothing else: the panes' transforms and containment
   make `fixed` mean "fixed to the card", and moving the frame would reload it). Every declaration the
   browser gives a popover is answered here, so the block is the viewport and not a centred box with a
   border: inset 0, no margin, no border, no scrolling of its own.
   THE FILM IS AS LARGE AS THE GLASS ALLOWS AT 16:9, black round it — the letterbox token, as every
   player's — and the safe areas are padding, so a notch or a home bar never sits on the picture. Upright,
   the film is the width of the screen and the Exit tile sits under its right-hand corner; on its side
   (where an iPhone has room to spare left and right) the tile sits beside it, so the film keeps the whole
   height. 44px is the tile — a fingertip, so px — and the rest is rem. `dvh` with no `vh` before it: this
   is only ever drawn where the top layer exists (Safari 17, Chrome 114), and every one of those has it.
   The title and its line are not drawn here: the film is the page. */
```

### THE ONE THING THE TOP LAYER DOES NOT SHED IS `zoom`.

before `.pane > :has(.vid-watch.is-fs)`

```
/* THE ONE THING THE TOP LAYER DOES NOT SHED IS `zoom`. `paneReach_` (find.js) draws a card taller than its
   pane smaller with CSS `zoom` on the pane's child, and a block in the top layer still inherits it from
   the card it stands in — at 320x568 the Exit tile came out at 32px. So while the card's film is full
   screen the card is drawn at its own size underneath, out of sight; `!important` because `paneReach_`
   writes its zoom inline, and goes on writing it on a resize, which a phone turning sideways is.
   GUARDED BY `check/videos.js` ('full'), at 844x390 and 568x320 among others: with this line deleted
   every other check stayed green, and the Exit tile was 31px and the film 485x273 (review of 10 Oct). */
```

### ---------- THE ROW: A PICTURE, A TITLE, A LINE

before `.vid-list`

```
/* ---------- THE ROW: A PICTURE, A TITLE, A LINE ---------------------------------------------------
   COMPACT: the picture on the left at 42% of the row — YouTube's "up next" proportion — and the words
   on the right; no wider than 7rem, which a card at 1280 would otherwise pass, with every row a
   picture 81px tall. No rule between rows; YouTube separates results with air, not lines.
   THE AIR IS INSIDE THE ROW, as padding, not between rows as a gap: the same pitch, but the space
   between two pictures is part of a row's target rather than a strip that belongs to neither. A card
   with a long list is drawn at the 0.7 floor (`paneReach_`), and there a 51px picture alone is a 36px
   target. The row is still 44px tall at least, in px: a fingertip does not scale with the root font.
   THE WORDS COME FIRST IN THE MARKUP (`vidRow_` says why) and `order` draws the picture first. */
```

### THE POSTER IS UNDER EVERY PICTURE, NOT INSTEAD OF ONE:

before `.vid-poster`

```
/* THE POSTER IS UNDER EVERY PICTURE, NOT INSTEAD OF ONE: it is what shows while a picture loads and
   what is left when one fails, so no row is ever a hole and the list keeps one rhythm. A flat frame
   and the kind's mark — no letter, no gold: `vidPoster_` says why. The mark sits a little above the
   middle (the padding), clear of a "Documentary" badge in the corner at 320. */
```

### THE BADGE, IN YOUTUBE'S DURATION SPOT:

before `.vid-badge`

```
/* THE BADGE, IN YOUTUBE'S DURATION SPOT: a kind that tells the row apart, and the out-arrow on a row
   that leaves. YouTube's is about 12px; this was .62rem, 8px at 320 and 6px on an admin's card at the
   zoom floor, which is a smudge — .68rem is as large as "Documentary" and its arrow can be and still
   fit a 91px picture at 320. */
```

### TWO LINES OF TITLE AT MOST, then an ellipsis — YouTube's clamp, and the reason a long title no longer makes one row three times the height of the rest.

before `.vid-row .vid-t`

```
/* TWO LINES OF TITLE AT MOST, then an ellipsis — YouTube's clamp, and the reason a long title no longer
   makes one row three times the height of the rest. `overflow-wrap: anywhere` still holds a title with
   no space in it inside the row at 320. */
```

### THE ADMIN'S SYNC ROW:

before `.vid-admin .tile-row`

```
/* THE ADMIN'S SYNC ROW: the silver tile and, beside it, when it last ran — the tile's note made visible,
   since a 44px plate has no room for it. Drawn for an admin only, and only under a search's answer, at
   the foot of the card (note 321); otherwise `.vid-admin` is an empty element and takes no room. */
```

### THE BOX THAT TAKES THE KEYS, out of sight and out of the way of a finger.

before `.kt-box .kt-in`

```
/* THE BOX THAT TAKES THE KEYS, out of sight and out of the way of a finger. Not `display: none` and
   not `visibility: hidden` — neither can hold the focus, and without the focus a phone shows no
   keyboard. 16px for the same reason every field here is: under it iOS zooms the page on focus. */
```

### THE LINE. Mono, so the letter lit is always the letter under the eye, and wrapped wherever it has to be — it is forty characters and a 320 card holds about

before `.kt-line`

```
/* THE LINE. Mono, so the letter lit is always the letter under the eye, and wrapped wherever it has
   to be — it is forty characters and a 320 card holds about twenty-six. `pre-wrap` keeps a space a
   space, so a space that is wanted next has a width to be lit in. */
```

### ---------- FILTER CHIPS

before `[data-tag="paper"]`

```
/* ---------- FILTER CHIPS ------------------------------------------------------------------------
   Each one is a filter that is ON, and pressing it takes it off. The whole chip is the target
   rather than the ✕ — a 12px cross on a phone is a target you miss.
   They WRAP rather than scroll sideways: a row that scrolls can hide a filter, and a filter you
   cannot see narrowing your list is the fault this replaced.
--------------------------------------------------------------------------------------------- */
```

### ---------- REPORTED AS "the tags don't need to be as big"

before `[data-tag="paper"]`

```
/* ---------- REPORTED AS "the tags don't need to be as big" -------------------------------------
   MEASURED BEFORE ANYTHING WAS TOUCHED, six answers deep at 390px: the chips took **192px of a
   673px pane** — seven of them over FOUR wrapped lines, more than a quarter of the screen, to say
   what had already been answered. The answers themselves, which are the thing somebody is on this
   screen to press, got 336px.

   THE 44px STAYS AND EVERYTHING ELSE GIVES. A chip is a control and a fingertip does not scale —
   this stylesheet has five convictions of that rule written into it and this is not the sixth. What
   was costing the room is WIDTH: the label, the padding and the gaps decide how many fit on a line,
   and a line is 44px whether it holds two chips or four. Narrower text, less padding, tighter gaps
   — same target, fewer rows. */
```

### ---------- WHICH KIND OF TAG, AS A COLOUR

before `[data-tag="paper"]`

```
/* ---------- WHICH KIND OF TAG, AS A COLOUR -----------------------------------------------------------
   `data-tag` names the kind (`tagOf_` in find.js) and this turns it into `--tag`, which the answer
   row, the chip and the card tag each read. One place, so a red Paper is the same red in all three.
   Subject is --green, the palette's own subject colour. Tier is --pink, which was the WEARABLE
   colour -- and free on this screen, because `.card.is-wear > h3` matches nothing (the heading sits
   inside `.thing > .thing-body`, not straight under the card), so no cape heading is pink beside a
   `Higher` tag. Retarget that rule and tier needs a colour of its own first. `needs` is a kind of
   its own, `--tag-needs` (pale lemon): NOT gold, which is the press colour -- when it was gold its
   answers looked pressed at rest, and that is why it once had no kind at all. See the tokens at `:root`. */
```

### ---------- WHAT YOU CHOSE, A RULE, THEN WHAT IS ASKED NEXT

before `.chips:has(.chip)`

```
/* ---------- WHAT YOU CHOSE, A RULE, THEN WHAT IS ASKED NEXT -------------------------------------------
   SIX ANSWERS IN, THE TWO WERE ONE CLOUD: the chosen chips are tag-coloured pills and so are the
   answers under them, and the only thing between the two was the .45rem gap that also sits between
   any two chips. You could not see where "what you said" stopped and "what it is asking" began
   without reading every label. A hairline under the chosen ones — only when there are some, so the
   first question has no rule above nothing — and the same .45rem under it, drawn in `--chip-line`,
   the edge the chips themselves are drawn in (`--line-soft` and `--line` were both invisible on the
   pane in the screenshot). Seven pixels, not a row: the note above is why the room is counted. */
```

### ---------- THE OPTIONAL ROWS (`tagDoors_`), A PAPER'S HEALTH TILE AND ITS LIST (354, 355)

before `.tag-door`

```
/* ---------- THE OPTIONAL ROWS (`tagDoors_`), A PAPER'S HEALTH TILE AND ITS LIST (354, 355) -----------
   A ROW IS NOT THE QUESTION. A `tagOnly` facet is never asked; its answers sit under the question that
   is, or under a chosen paper's end, after a hairline and a small label, so the eye reads them as an
   aside. The chips are the
   funnel's own `.counted.row.tap` — the 44px target is theirs, not set again here. */
```

### ---------- 44px, AND THIS IS THE FOURTH CONVICTION OF THE SAME RULE

in `.chip`

```
/* ---------- 44px, AND THIS IS THE FOURTH CONVICTION OF THE SAME RULE ---------------------------
     IT READ `max(38px, 2.3rem)`, WHICH IS `.btn.tiny` EXACTLY. The root is `clamp(13.5px, 3.8vw,
     16px)`, so 2.3rem is 34px on a phone and the `max` never once chose the rem — every chip in the
     app has been 38px tall on every device, which is tall enough to look deliberate and under the
     44px a fingertip needs. CLAUDE.md records this same arithmetic for `.btn.tiny`, `.post-act` and
     `.fm-adds label`; this is the fourth.

     IT SURVIVED BECAUSE NOTHING HAD EVER SEEN A CHIP. `check/ui.js` measures the Find screen in the
     state it opens in, and in that state there are no filters, so there are no chips — 63 known tap
     targets, four widths, two visitors, and the control that removes a filter was in none of them.
     It appeared the moment the check was given a state six answers deep. */
```

### ---------- THE SAME FAMILY AS THE ANSWERS UNDER IT

in `.chip`

```
/* ---------- THE SAME FAMILY AS THE ANSWERS UNDER IT ---------------------------------------------
     An answer pressed becomes one of these, so they are drawn as the same object: the pill, the
     `--chip-line` outline. FILLED, where an answer is not, because filled is how a filter chip says
     "this one is on" — the answers below are the ones you could choose, these the ones you did. */
```

### THE FUNNEL'S OWN CHIPS ARE 32px, like the answers under them -- *"Make the tags smaller"*, the owner, 6 Oct.

before `.chip.sm`

```
/* THE FUNNEL'S OWN CHIPS ARE 32px, like the answers under them -- *"Make the tags smaller"*, the
   owner, 6 Oct. `sm` and not `.chip` itself: every other chip in the app is somebody's form and keeps
   its 44. The reach is the answers' own, 6px above and below, so the finger still gets 44. */
```

### `.chip-k` WAS HERE — the field's name, small, dim and upper-case, in front of every chosen value:

before `.chip[data-tag]`

```
/* `.chip-k` WAS HERE — the field's name, small, dim and upper-case, in front of every chosen value:
   `SUBJECT Maths`. Its note said "Grade 9" and "9" are different amounts of information, which is
   true and is now said by the value itself: the chip is `Grade 9` because Grade's values are, and the
   two that are bare numbers keep their field in the text (`chipText_` in find.js). The owner, 8 Oct:
   *"i dont need the category of the tag to appear with the choisen option in the finder."* It cost a
   line of the question page at 390 and at 820. (It was `--dim` rather than `--faint` because
   `--faint` measured 3.97:1 on the chip's fill; nothing on a chip is that small any more.) */
```

### A CHIP OF A KIND IS DRAWN IN ITS COLOUR:

before `.chip[data-tag]`

```
/* A CHIP OF A KIND IS DRAWN IN ITS COLOUR: the outline, the value, and the fill a tint of it rather
   than the plain 8% white -- filled still says "this one is on", just in the colour of what it is.
   THE TINT IS 10% AND THAT NUMBER IS MEASURED, NOT CHOSEN. At 14% the lime `Type` chip's fill went
   light enough that the `--dim` field name on it measured 4.25-4.35:1 at the top of the pane, where
   the chips sit -- under the 4.5 an 8px label needs, on the owner's own KS2 SATs route. At 10% the
   worst pixel is 4.79:1 for type and 5.20-5.44:1 for every other kind; 12% clears it by 0.09. The
   note above measured `--dim` on the 8% WHITE fill, which is a different ground. */
```

### `.chip.is-clear` WAS HERE.

before `.mc-display`

```
/* `.chip.is-clear` WAS HERE. Clear was a caption, then "a chip like the others" — and the owner, 8 Oct:
   *"clear button looks like a tag which it isnt."* It is a tile beside the search box now, the pen's
   bin; see `.find-search` and `filterClear_` in find.js. */
```

### ---------- THE CALCULATOR'S CARET

before `.mc-display`

```
/* ---------- THE CALCULATOR'S CARET --------------------------------------------------------------
   A block that blinks, because a hairline is invisible in a monospace column of digits at this
   size — and it has to be findable at a glance or the arrow keys are guesswork.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE TIMER

before `.btn.tiny`

```
/* ---------- THE TIMER ---------------------------------------------------------------------------
   Four preset lengths, smaller than a real button — they are a choice you make once, not the
   thing you came to press.
--------------------------------------------------------------------------------------------- */
```

### ---------- TINY IS ABOUT THE TEXT, NOT ABOUT THE TARGET

before `.btn.tiny`

```
/* ---------- TINY IS ABOUT THE TEXT, NOT ABOUT THE TARGET -----------------------------------------
   `max(38px, 2.3rem)` MEANT 38px ON EVERY PHONE. 2.3rem is 34px at the root size a 390px screen
   gets, so the max never chose the rem and the four timer buttons measured 45x38 — reported by
   check/ui.js at all four widths since it was written, and named in CLAUDE.md.

   The rule this breaks is the one CLAUDE.md states outright: tap targets in px, everything else in
   rem, because a fingertip is the same size on every screen and is the one measurement here that
   must not scale. `max(38px, …)` is not the rem trap exactly — it is the smaller one of writing the
   px down and writing down a number under 44.

   MIN-WIDTH TOO, FOR THE ＋, which was 41px across. There are three `.btn.tiny` in the whole app —
   `Clear done`, the four timer buttons, and that ＋ — and the only one this resizes is the ＋,
   because the other two are already wider than 44px from their text. Small type, ordinary target. */
```

### ---------- WHAT IS ON A DAY

before `.cal .cal-d`

```
/* ---------- WHAT IS ON A DAY --------------------------------------------------------------------
   The dot sits UNDER the number rather than beside it. Beside it the number shifts and the grid
   stops being a grid.
--------------------------------------------------------------------------------------------- */
```

### THE DATES THE CALENDAR LEARNED TO SHOW — sessions, terms, half terms, bank holidays, closed days, events.

before `.dot.session`

```
/* THE DATES THE CALENDAR LEARNED TO SHOW — sessions, terms, half terms, bank holidays, closed days,
   events. Existing tokens, one each, so no two kinds share a dot; the key under the month says which
   is which, because nine colours is past what anybody remembers. */
```

### ---------- A REEL CARD

before `.feed-art`

```
/* ---------- A REEL CARD -------------------------------------------------------------------------
   The heading is the fact, so it is large; the body is why, so it is small. The gradient exists to
   give them somewhere to sit rather than to be looked at.
--------------------------------------------------------------------------------------------- */
```

### The subject's initial, enormous and barely there.

before `.feed-mark`

```
/* The subject's initial, enormous and barely there. It gives the card a shape at a glance and
   says which family of facts you are in without a word being read. It goes when a photograph
   arrives — two things competing for the same corner is one too many. */
```

### WORDS OVER A PHOTOGRAPH NEED A FLOOR.

before `.feed-art.has-photo:has(> .feed-text)::before`

```
/* WORDS OVER A PHOTOGRAPH NEED A FLOOR. White text on an unknown picture is legible until the
   picture is a snowfield, and then it is gone — so a scrim is laid over the bottom two-thirds
   once there is something behind it. Only then: over the gradient it would be a shadow over a
   shadow. */
```

### ---------- AND ONLY WHERE THERE ARE WORDS: IT WAS THE GREY ON EVERY REEL

before `.feed-art.has-photo:has(> .feed-text)::before`

```
/* ---------- AND ONLY WHERE THERE ARE WORDS: IT WAS THE GREY ON EVERY REEL ---------------------------
   ASKED ON 9 OCT: *"is there a grey effect on reels? i dont like that if there is remove it."* There
   was, and it was this. A reel is a clip with no words on it — `feedSlide` draws no `.feed-text` for
   one — and the scrim was laid on `has-photo` alone, so every reel had black at 92% across its
   bottom eighth, 55% at the middle and a fade up to three-quarters of the way: on a bright frame (both
   clips here are white buildings on a pale model), the lower two-thirds of the picture read as a
   grey wash with no text above it to explain it. Screenshot at 390x844 before and after, note 319.

   THE FLOOR WAS FOR THE WORDS, SO IT GOES WHERE THE WORDS ARE. `:has()` rather than a class, the
   receipts' argument: whether a slide carries words is a fact about its contents, and a class would
   be that fact written a second time in the one place nothing checks it. A fact with a photograph
   keeps its scrim exactly as it was; a clip with a caption gets one; a clip with none gets the
   picture and nothing over it. */
```

### A FACT ABOUT THE LONGEST WORD IN THE DICTIONARY CONTAINS IT, which is the one thing a slide's own text can do that its box cannot survive:

before `.feed-head`

```
/* A FACT ABOUT THE LONGEST WORD IN THE DICTIONARY CONTAINS IT, which is the one thing a slide's
   own text can do that its box cannot survive: `Pneumonoultramicroscopicsilicovolcanoconiosis` is
   46 characters with nothing in it to break at, and to a browser that is one word, so the paragraph
   ran 79px past the card. Found by `check/ui.js` as a sideways scroll on the games column, and
   INTERMITTENTLY — one run in three — because which of the 400 facts the widget deals varies, so it
   is also the shape this repository calls a check that reports a real fault only when it happens to
   look at the right screen. The same declaration the question cards already carry for the 51 dotted
   answer lines, which is the identical fault in another column. On both, because a heading is one
   line and a long word in one runs off just as far. */
```

### ---------- TIMES TABLES

before `.tt input`

```
/* ---------- TIMES TABLES ------------------------------------------------------------------------
   The answer box is the only thing on the card, so it is large and centred. The clock goes red in
   the last ten seconds, which is the one thing on the screen that should hurry somebody.
--------------------------------------------------------------------------------------------- */
```

### ---------- WIDGETS AS PAGES

before `.screen.paged`

```
/* ---------- WIDGETS AS PAGES --------------------------------------------------------------------
   One widget fills the screen and the next is directly below it. A strip of them slides; only one
   is ever in view.

   FIXED HEIGHT, and it has to be: a pager whose height comes from its contents is a pager where
   every page is a different distance away, and the swipe would mean something different on each
   one. The number below is the viewport minus the two bars and the scroller's own padding, which
   is exactly the room a screen has.

   `dvh` rather than `vh`, for the same reason the body uses it — vh ignores the browser chrome on
   a phone, so a page sized in vh is a page whose bottom is under the address bar.
--------------------------------------------------------------------------------------------- */
```

### THE WRAPPERS ARE GONE.

before `.screen.paged`

```
/* THE WRAPPERS ARE GONE. A paged screen was `.screen > .pager > .pages > .page` — four nested
   absolutely-positioned boxes with negative margins cancelling padding between them, which is four
   places for a layout to go wrong and no way to tell from the result which one had.

   Pages are children of the screen now. One level, no margin arithmetic, and a page is placed
   against the screen exactly as a screen is placed against the viewport — the same relationship at
   both scales, which is what the grid was supposed to mean.

   The screen gives up its padding so a page can supply its own: a page is positioned against the
   screen's PADDING box, so a padded screen would inset every page and then let it pad itself
   again. */
```

### ---------- ONE DIAL, AND THE FRONT OF IT

before `.page .card`

```
/* ---------- ONE DIAL, AND THE FRONT OF IT --------------------------------------------------------
   A second `.page` rule lived here, left over from when a page was placed by CSS out of custom
   properties. It has been dead since the transform moved into script.js, and it was not harmless:

     · its `transform` read `var(--drag)`, which nothing sets any more and which has no fallback.
       A declaration containing an undefined variable is invalid at COMPUTED-VALUE TIME, and an
       invalid declaration is not ignored in part — the whole thing is dropped.
     · it re-declared padding, overflow, opacity, z-index and the transition over the shared cell
       rule, so a page was described twice and the two descriptions had already drifted apart.

   A page is a cell. The rule that says what a cell is, above, is the only rule that says it.
--------------------------------------------------------------------------------------------- */
```

### ---------- A WIDGET NO LONGER FILLS A PAGE

before `.pane, #sheet-body, #docket-body`

```
/* ---------- A WIDGET NO LONGER FILLS A PAGE ------------------------------------------------------
   Every rule that used to live here made one card grow to the height of its screen — the keypad,
   the clock, the board, the month, the reel. They were written when Tools and Arcade were tabs and
   a page held exactly one widget.

   Those tabs are gone and the widgets open in the sheet, which scrolls and is sized by what is in
   it. So the rules had nothing left to stretch — except that `.page > .card { flex: 1 1 auto }`
   matches ANY card that is a page's direct child, and the Find browse page begins with one: your
   credits. It grew to the height of the screen and pushed the search box, the sort and the whole
   list of questions to the bottom, under a screenful of nothing.

   A rule that outlives what it was written for does not sit quietly; it finds something else to
   apply to. That is the second time in this file — the first was the tile-name rule surviving the
   Library wall — and both were found by looking at a screen rather than by anything failing.
--------------------------------------------------------------------------------------------- */
```

### EVERY SCROLLING SURFACE, WITH ITS BAR HIDDEN.

before `.pane, #sheet-body, #docket-body`

```
/* EVERY SCROLLING SURFACE, WITH ITS BAR HIDDEN. Written once here rather than beside each of them,
   because "no scrollbars" is a decision about the whole thing and a rule per surface is four places
   to forget one.
   `scrollbar-width` covers Firefox and modern Chrome; the pseudo-element covers Safari and older
   WebKit, which ignore it. Both are needed and neither is enough. */
```

### ---------- THE CELL, AND THE GLASS IN IT

before `.pane`

```
/* ---------- THE CELL, AND THE GLASS IN IT ---------------------------------------------------------
   Two things that used to be one. A page is the box the grid positions — `inset: 0`, the full
   screen, always — and it was also the pane you look at, so a post with a picture and two lines of
   caption sat in a pane the height of the phone with two thirds of it empty glass.

   `.page` is the cell and is invisible. `.pane` is the glass and is as tall as what is on it.
--------------------------------------------------------------------------------------------- */
```

### A SECOND `.page` RULE WAS HERE and it is gone entirely, not left empty.

before `.pane`

```
/* A SECOND `.page` RULE WAS HERE and it is gone entirely, not left empty. The size, the position
   and the fade are all set once further up; this one repeated the transition, which is how one came
   to be .26s and the other .2s with only the later having any effect.
   An empty ruleset does nothing, which is exactly why it should not be there — it reads as a rule
   somebody meant to fill in, and an editor is right to flag it. */
```

### AS TALL AS ITS CONTENTS, up to the whole cell — a two-line post is two lines, a long list is clipped and scrolls.

in `.pane`

```
/* AS TALL AS ITS CONTENTS, up to the whole cell — a two-line post is two lines, a long list is
     clipped and scrolls.
     THREE DECLARATIONS SAYING ONE THING, deliberately. `flex: 0 0 auto` refuses to grow, `height:
     fit-content` states the height positively rather than by refusing, and `align-self: center`
     stops a stretch reaching it from the cross axis. Any one of them alone is a rule that a later
     stylesheet, a shorthand, or a browser that treats `auto` differently can undo — and the whole
     point of a pane is that it is the size of what is on it. */
```

### ONE SIZE, ALWAYS: the whole cell.

in `.pane`

```
/* ONE SIZE, ALWAYS: the whole cell.

     It used to be `height: fit-content` — as tall as whatever was on it — and the grid worked the
     spacing out from that. Every layout fault on this screen came from there: a pane that had not
     drawn yet measured nothing and was flung a screen away; an emptied one did the same; two short
     ones were spaced closer than their own cards were tall and slid behind each other.

     A fixed card and a fixed gap cannot do any of that. The distance between two cards is a number
     that is always the same, so nothing can overlap and nothing can drift, and a short widget
     simply has room to spare rather than pulling the whole column in around it. */
```

### FIXED ACROSS, ADAPTIVE DOWN.

in `.pane`

```
/* FIXED ACROSS, ADAPTIVE DOWN.

     The width is a rule: every card is the same 90% of the screen, so nothing has to be measured
     sideways and nothing can be a different width from anything else.

     The height is whatever is on it, capped at the cell. A two-line note is two lines tall; a long
     list fills the screen and scrolls. `fit-content` states that positively rather than by refusing
     to grow, which is the version a later shorthand cannot quietly undo. */
```

### CAPPED AGAINST THE SCREEN, not against the page.

in `.pane`

```
/* CAPPED AGAINST THE SCREEN, not against the page. A page is `height: auto` now — it is as tall
     as this pane — so `max-height: 100%` was a percentage of a thing whose height depends on this
     one, which resolves to no cap at all. A long list would have grown past the bottom of the
     phone with nothing to stop it. Stated in screen units, which is what was always meant. */
```

### NO SCROLLBAR ANYWHERE ON THE GLASS.

in `.pane`

```
/* NO SCROLLBAR ANYWHERE ON THE GLASS. A pane holds what it comfortably holds — it is as tall as
     its contents and capped at the cell — so a bar down the side is either doing nothing or saying
     the pane is the wrong size for what is on it. Scrolling still works for the rare pane that
     overflows; it just does not announce itself. */
```

### ---------- A CARD DOES NOT SCROLL

in `.pane`

```
/* ---------- A CARD DOES NOT SCROLL ----------------------------------------------------------
     THIS WAS `overflow-y: auto`, and it is the whole reason a swipe up sometimes moved the card's
     contents instead of moving to the next card. Two gestures competing for one movement, and
     which one you got depended on whether the pane happened to be a pixel taller than its box.

     `hidden` — the pane clips and never scrolls, so the vertical drag has nowhere else to go and
     always belongs to the grid. Every card behaves the same way as every other, everywhere on it.

     WHAT THIS COSTS, honestly: a card taller than the screen has its bottom cut off. That is a
     real cost and it is the right trade — a screen where swiping does not reliably swipe is worse
     than one where a rare card needs shortening. Anything genuinely long should be PAGED, which is
     what the pager is for, rather than scrolled inside one card.

     The boxes you write in — the notepad, the docket, a message thread — keep their own scrolling
     further down. Those are things you read and type in rather than cards you swipe past. */
```

### ---------- WHY THE MIDDLE OF THE SCREEN BEHAVED DIFFERENTLY FROM THE EDGES

in `.pane`

```
/* ---------- WHY THE MIDDLE OF THE SCREEN BEHAVED DIFFERENTLY FROM THE EDGES -------------------
     THE PANE ASKS FOR NOTHING BY DEFAULT.

     This was `pan-y`, on the reasoning that a pane may scroll its own contents and may never do
     anything sideways. Sound, and wrong in one way that showed up exactly where you found it: a
     phone decides what a gesture is from the box UNDER THE FINGER, and this box also says
     `overflow-y: auto`. So on the pane — which is the middle of the screen — it saw something
     scrollable and claimed the vertical drag before any of this app's code ran. At the EDGES the
     finger is on the page, which says `touch-action: none`, and the grid got it. Same swipe, two
     answers, decided by where you happened to put your thumb.

     `none` here, FULL STOP, and the second half of this sentence used to name an escape hatch that
     no longer exists: `.pane.scrolls`, a class added after measuring, which gave an overflowing
     pane its vertical gesture back. It was removed deliberately — the note by the `touch-action`
     list near the foot of this file records it — and this comment was not removed with it, so it
     has been describing a mechanism for longer than the mechanism existed. The `.price.faint`
     shape in prose: it reads as a decision and there is nothing behind it.

     SO THERE IS NO GIVING BACK, and a pane taller than its box is simply cut off. That is the right
     trade and it is also a real cost, which is why `check/ui.js` now measures it — see OUT OF REACH
     there, and the correction at the foot of this file. */
```

### ---------- THE GLASS'S OWN MARGIN, TRIMMED ONCE

in `.pane`

```
/* ---------- THE GLASS'S OWN MARGIN, TRIMMED ONCE --------------------------------------------
     EVERY SCREEN IN THE APP SITS INSIDE THIS. It was `1rem 1rem 1.25rem`, which on a 390px phone is
     15px of the 328px card gone to the frame on each side and 33px down the middle of the height —
     and the card is already inset from the screen by the grid, so this is the second margin round
     the same content. Asked for as "everything should be a bit more efficient with space", and this
     is the one number that answers it everywhere at once rather than per component.

     TRIMMED, NOT REMOVED. A pane with no padding is content against a border, which is what makes a
     card read as a box rather than as a surface — and the bottom keeps a little more than the top
     because a list that ends flush with the glass reads as clipped. */
```

### ---------- A SURFACE FIRST, GLASS SECOND

in `.pane`

```
/* ---------- A SURFACE FIRST, GLASS SECOND -----------------------------------------------------
     THE FAULT THIS FIXES, and it is worth writing down because it was invisible for several days
     and looked like a bug in the search screen.

     This was a 7% white wash and nothing else, on the reasoning that the BLUR behind it is what
     makes a pane read as a surface. That is true — and the blur was then moved, for speed, onto
     only the pane in front. A 7% white wash over a black app with no blur behind it is not a faint
     surface, it is nothing at all. So the card you were reading had glass and every card above and
     below it had none, and the only screen where you can see several cards at once is the search
     screen, which is why that is where it showed.

     A pane now has a REAL fill that stands on its own, in the app's own dark, and the blur on the
     front pane is depth added to something already there rather than the only thing holding it up.
     Take the blur away entirely — an old browser, a slow phone, a future speed fix — and every card
     still reads as a card. */
```

### THE EDGE, and it is the whole reason a card reads as a card.

in `.pane`

```
/* THE EDGE, and it is the whole reason a card reads as a card.

     Only a sliver of a neighbour is ever on screen, and a sliver of fill is dark on dark — so the
     bright top edge and the border are what say a pane is there at all. They were also, until now,
     the ONLY things doing it: there was no border and no shadow, and the blur was carrying the
     separation on its own. Move the blur to the front pane for speed and every other card
     disappears, which is exactly what happened.

     Stated ONCE. There were two `border` declarations and two `box-shadow` declarations in this
     rule, four lines apart, and the second silently won — so the first pair was dead text that
     read as though it were doing something. */
```

### ---------- THE BLUR, ON THE ONE PANE BEING LOOKED AT

before `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`

```
/* ---------- THE BLUR, ON THE ONE PANE BEING LOOKED AT --------------------------------------------
   A backdrop blur is the most expensive thing on this page by a long way: the browser has to
   sample everything behind the element and blur it, every frame, for as long as it is moving. It
   was on EVERY pane — so a swipe through a feed of eighteen posts was eighteen live blurs being
   recomputed while they slid, which is precisely the frame budget a swipe needs to feel attached
   to a thumb.

   It is only ever visible on the pane in front. The ones either side show a sliver, and a blurred
   sliver and an unblurred sliver are the same few pixels of dark. So the blur follows `.on`, which
   script.js already sets on the front cell — one blur at a time instead of twenty, and nothing
   that anybody can see is different.

   Where there is no backdrop-filter at all, a translucent pane over a dark app is nearly
   invisible rather than merely unblurred. A solid fill instead, so it still reads as a surface. */
```

### ---------- AND THEN THE BLUR WENT, BECAUSE IT WAS BLURRING NOTHING

before `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`

```
/* ---------- AND THEN THE BLUR WENT, BECAUSE IT WAS BLURRING NOTHING ---------------------------------
   `.screen.on .pane, .page.on .pane { backdrop-filter: blur(16px) saturate(1.5) }` WAS HERE. The
   note above says one blur at a time; `.screen.on .pane` is every pane on the screen in front, which
   on the Find screen is sixteen of them and on Settings thirteen — sixteen live backdrop blurs,
   recomposited through every page turn and every sideways slide.
   AND NOT ONE OF THEM COULD BE SEEN. A backdrop filter draws BEHIND the element's own background,
   and `.pane`'s background ends in `#101010`, which is opaque. MEASURED, screenshots of the Find
   screen, a question card and the feed with the blur and without it: the largest difference in any
   pixel is 2/255 on the two funnel screens, and the feed differs only by text anti-aliasing moving
   when the compositing layer went. The note above already says a card must read as a card with the
   blur taken away entirely — "an old browser, a slow phone, a future speed fix" — and this is the
   third of those. REPORTED AS "when students click questions it takes ages to load on phone": a
   backdrop blur is the effect a phone's GPU pays most for, and CPU throttling cannot even see it. */
```

### The fallback is no longer load-bearing — `.pane` has a real fill of its own above — but it stays, because a browser with no backdrop-filter should get the

before `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`

```
/* The fallback is no longer load-bearing — `.pane` has a real fill of its own above — but it stays,
   because a browser with no backdrop-filter should get the flatter, more solid version rather than
   the one designed to have a blur under it. */
```

### ---------- A RECEIPT IS ALREADY THE CARD

before `.pane:has(.rc-stub), .pane:has(.rc), .pane:has(.paper), .pane:has(.cpn)`

```
/* ---------- A RECEIPT IS ALREADY THE CARD --------------------------------------------------------
   The glass is what turns a loose card into a surface — it gives a post, a tutor or a form an edge
   and a shadow so it reads as one object on the screen rather than as markup floating on a
   background. A receipt does not need that. It is a piece of paper: it has its own colour, its own
   torn ends and its own shadow already, and putting it inside a pane was a card inside a card —
   two edges, two shadows, and the paper looking like it had been posted through something.

   So the pane steps back wherever a receipt is on it. Not removed — it is still the thing the
   pager positions and the thing that scrolls — just no longer drawn, which leaves the paper as
   the only object on the screen, which is what it always was.

   `:has()` rather than a class on the pane, because whether a pane holds a receipt is a fact about
   its contents, and a class would be that same fact written a second time in the one place nothing
   checks it. Every browser this runs on has supported it since 2023; one that has not simply draws
   the glass, which is where this started. */
```

### ---------- A PAPER OBJECT IS THE CARD, so the glass behind it steps back

before `.pane:has(.rc-stub), .pane:has(.rc), .pane:has(.paper), .pane:has(.cpn)`

```
/* ---------- A PAPER OBJECT IS THE CARD, so the glass behind it steps back -------------------------
   THE SAME RULE THAT WAS WRITTEN FOR RECEIPTS, extended to the three that came after them: a
   booking slip, a staff pass and an exam paper. Each already has its own edge — a torn perforation,
   a lanyard hole, a printed border — and a pane behind it is a second edge round one object. Two
   shadows, two boundaries, and the paper reading as though it had been posted through something.

   It should not have needed extending. The rule as written named `.rc-stub` and `.rc`, which is
   WHICH OBJECTS rather than WHAT THEY ARE — so every object made afterwards had to be remembered
   and added, and the slip was not. Named as a list because CSS has no way to say "anything that is
   its own piece of paper"; the comment is the only thing carrying that. If a fifth is ever built,
   it goes here. */
```

### ---------- `> .rc` MISSED THE ONE THAT MATTERS MOST

before `.pane:has(.rc), .pane:has(.paper), .pane:has(.cpn)`

```
/* ---------- `> .rc` MISSED THE ONE THAT MATTERS MOST ---------------------------------------------
   THE RECEIPT IS ONLY A DIRECT CHILD OF THE PANE WHEN IT IS ALONE ON ONE. As a funnel result it is
   wrapped in `.favwrap` — the thing that marks a kept card — so the child combinator did not match
   and the glass stayed: a torn receipt sitting inside a rounded dark panel, which is two containers
   where the paper already is one, and the tear along its edge loses its whole point against a
   second border. Exactly the fault the comment above describes, on the fourth object rather than
   the fifth.
   THE DESCENDANT FORM instead, like every other line in this list. A receipt anywhere on a pane
   means that pane is holding paper. */
```

### THE FIFTH, exactly as the comment above said would happen.

before `.pane:has(.cpn)`

```
/* THE FIFTH, exactly as the comment above said would happen. A coupon inside a glass pane is a
   ticket sitting on a tray — two containers where the ticket already IS one, and the torn edge
   loses its whole point against a second border. */
```

### `.page .card { border-bottom: 0 }` WAS HERE, word for word, comment and all, and it is nine hundred lines above as well — under a note that says

before `.page .empty`

```
/* `.page .card { border-bottom: 0 }` WAS HERE, word for word, comment and all, and it is nine
   hundred lines above as well — under a note that says "a page was described twice and the two
   descriptions had already drifted apart". Identical declarations, so nothing was ever wrong on
   screen; what was wrong is that there were two places to edit it. Found by `check/cascade.js`,
   which reports a selector written twice as part of asking which rule wins. */
```

### ---------- THE OVERWORLD

before `.map`

```
/* ---------- THE OVERWORLD ------------------------------------------------------------------------
   Drawn in the app's own ink: a road, nodes on it, and one of them lit. Nothing here is a map tile
   — it weighs nothing, cannot 404, and looks like the rest of the site rather than like a window
   cut into somebody else's.
--------------------------------------------------------------------------------------------- */
```

### THE PLANE, SEEN AT AN ANGLE.

before `.map-land`

```
/* THE PLANE, SEEN AT AN ANGLE. One transform: squash it vertically and slide it down. The oldest
   trick there is for a third dimension, and it works because the eye reads a squashed circle as a
   circle seen at an angle rather than as an oval.
   The two numbers are also in script.js as MAP_TILT and MAP_DROP, which is one place more than
   ideal — the transform has to be CSS to animate, the maths has to be JS to stand things in the
   right place, and a custom property cannot be read reliably before the element is in the
   document. If one changes, both change. */
```

### ---------- THE GROUND

before `.map-land`

```
/* ---------- THE GROUND ----------------------------------------------------------------------------
   Green and roads, drawn as a road map draws them. No trees, no landmarks, no fake third
   dimension — those were detail piled on a floor that was not right, and detail on a wrong floor
   is what made the board unreadable.
--------------------------------------------------------------------------------------------- */
```

### ROADS ARE CARRIAGEWAYS.

before `.map-case`

```
/* ROADS ARE CARRIAGEWAYS. A dark casing under a lighter fill, which is how every road map in the
   world draws a road and the only way one gets EDGES. A one-pixel stroke is a wire diagram.
   Widths come from the data, so an A-road is visibly bigger than a tram line. */
```

### ---------- BUILDINGS

before `.map-bld`

```
/* ---------- BUILDINGS ------------------------------------------------------------------------------
   Footprints seen from above, like everything else on the map. Not every building — a borough is
   tens of thousands of them and at this size they are grey noise. These are the ones whose NAME
   locates you: the tower, the station, the shopping centre, the hospital, the stadium.
--------------------------------------------------------------------------------------------- */
```

### A venue is a building too — drawn as a footprint like the rest so it sits IN the world rather than floating over it as a pin — and the only one that is

before `.map-venue`

```
/* A venue is a building too — drawn as a footprint like the rest so it sits IN the world rather
   than floating over it as a pin — and the only one that is coloured. Everything else on the map is
   where you are; this is where you are going. */
```

### `.map-road` and `.map-road-done` went with the path between the venues — a line drawn in the order the sheet happened to hold them, and a gold stretch of it

before `.map-world`

```
/* `.map-road` and `.map-road-done` went with the path between the venues — a line drawn in the
   order the sheet happened to hold them, and a gold stretch of it showing how far ticked topics
   had carried you. Neither was true of anything. */
```

### ---------- AN INSTRUMENT, NOT A CARD

before `.widget-full.solid > .card`

```
/* ---------- AN INSTRUMENT, NOT A CARD ------------------------------------------------------------
   The pane is frosted glass because most of what sits on it is CONTENT — a post, a receipt, a list
   — and glass says "this is a surface something is written on".

   A calculator is not written on the surface, it IS the object. Frosted glass with a keypad
   floating in it reads as a picture of a calculator; an opaque casing reads as one you can press.
   The widget declares itself `solid` and this turns the glass off underneath it.
--------------------------------------------------------------------------------------------- */
```

### And the keys are keys:

before `.widget-full.solid .mc-btn`

```
/* And the keys are keys: raised, with an edge that catches the light from above.
   `.mc-btn`, which is what the markup emits — I first wrote `.mc-key`, a class nothing produces.
   The check that guards this only runs the other way round: it catches a CLASS in the markup with
   no rule, not a rule with no markup, so a styled name that does not exist is silent. */
```

### ---------- MESSAGES

before `.msg`

```
/* ---------- MESSAGES ------------------------------------------------------------------------------
   Yours to the right, theirs to the left, which is the one convention every messaging app shares
   and the only thing that lets a thread be read without labels on every line.
--------------------------------------------------------------------------------------------- */
```

### A CONVERSATION, WHICH IS READ BY SIDE BEFORE IT IS READ BY NAME.

before `.msg`

```
/* ==================================================================================================
   A CONVERSATION, WHICH IS READ BY SIDE BEFORE IT IS READ BY NAME.

   ASKED FOR AS "messages should look like IG DMs". What was here was full-width rows separated by
   hairlines with `text-align: right` standing in for "this one is mine" — a transcript. You know
   who said a thing from WHERE IT SITS; the name under it confirms rather than tells.

   RUNS ARE THE HALF THAT MAKES IT A CHAT. Four messages in a row from one person is one turn, so
   the ones above the last hug at 2px and only the last of a run carries the squared corner and the
   name-and-time line. Without that, six bubbles read as six exchanges and the card is no calmer
   than the hairlines were. See `messagesHtml_`, which is where the runs are worked out.

   THE SQUARED CORNER IS THE TAIL, and it is on the LAST of a run rather than on every bubble: a
   tail on each one points at a speaker four times over.

   GOLD FOR MINE, BECAUSE GOLD IS ALREADY WHAT THIS APP MEANS BY "YOURS" — the one action, the
   ticked hour, the starred thing. Black text on it, which is what `.hr.on` already does for the
   same fill and the same reason.
================================================================================================== */
```

### ---------- AND A RUN IS ONE SHAPE, NOT FOUR PEBBLES

before `.msg:not(.run-top):not(.mine) .msg-bub`

```
/* ---------- AND A RUN IS ONE SHAPE, NOT FOUR PEBBLES ------------------------------------------------
   THE RUNS WERE WORKED OUT AND ONLY HALF DRAWN. `messagesHtml_` has always known which bubble opens
   a turn and which closes it, and the stylesheet used that for the tail alone — so three of yours
   in a row were three fully round pills hugging at 2px, which reads as three things touching rather
   than one turn. Every chat anybody has used tightens the corners where two bubbles of one turn
   meet, on the speaker's side only, so the run reads as a column with a straight edge and the far
   side stays soft. Measured on the seeded thread before this: a run of three, nine round corners
   on the side where they join.

   THE SAME .35rem AS THE TAIL, because a join and a tail are the same idea — "this continues" —
   and two different small radii side by side would read as a mistake. */
```

### The TEXT of a message.

before `.msg-body-text`

```
/* The TEXT of a message. Renamed from `.msg-body`, which the messages widget now uses for its own
   container — two different things under one name, one of them inside the other, is a rule that
   applies to both and was written for neither. */
```

### `dvh`, FOR THE REASON STATED ON `body`:

before `.msg-body`

```
/* `dvh`, FOR THE REASON STATED ON `body`: `vh` is the LARGE viewport, the one you get with the
   address bar hidden, so 60vh on a phone is 60% of a screen taller than the screen — and the
   bottom of it sits under the browser chrome where it cannot be read or scrolled to. */
```

### Unread. It was a rule down the LEFT of a full-width row, which was right for a list of rows and cannot survive a bubble that has a side:

before `.msg.unread .msg-bub`

```
/* Unread. It was a rule down the LEFT of a full-width row, which was right for a list of rows and
   cannot survive a bubble that has a side: on `.mine` it drew a gold bar on the wrong edge of a
   gold fill. The bubble's own outline says it instead — it marks the whole message rather than a
   point on it, which is the argument the old rule made and the shape it could not keep. */
```

### ---------- THE BOX AT THE FOOT OF A THREAD

before `.msg-form`

```
/* ---------- THE BOX AT THE FOOT OF A THREAD -------------------------------------------------------
   ONE ROW: the box takes what is left, `Send` takes what it needs. `.btn` is `width: 100%` because
   most of them are the only thing on their row — the same fault `.btn-row .btn` and `.reel-sound`
   already record — so it is told otherwise here.

   THE TEXTAREA GROWS TO WHAT IS TYPED and starts at one line, because a five-line box under every
   conversation is four lines of nothing per thread on a column that holds several. `field-sizing`
   is what does it where it exists; `min-height` is the floor everywhere else, which is the honest
   fallback — a one-line box that scrolls is worse than a two-line one that does not, and 44px is
   the tap floor either way.

   44px IN PX ON BOTH, which is this file's rule and its fifth conviction. */
```

### `1 1 0`, NOT `1 1 8rem`.

in `.msg-text`

```
/* `1 1 0`, NOT `1 1 8rem`. A wrapping row breaks on the BASIS, not on what is left over — and at
     320px the three bases came to 220px in a 218px row, so `Send` fell onto a line of its own under
     the `+`, which is how every message on the smallest phone was being written. With a zero basis
     the box takes whatever the two buttons leave and the row can never wrap for its sake. */
```

### ONE LINE CENTRED IN 44px.

in `.msg-text`

```
/* ONE LINE CENTRED IN 44px. It was `.5rem` top and bottom, which put the first line 8px down a
     44px box and left 18px under it — the text sat high beside two buttons centred on the same
     height. In px because the 44 it is centred in is px: (44 − 2 border − ~18 line) / 2. */
```

### THE HINT IS ONE LINE.

before `.msg-text::placeholder`

```
/* THE HINT IS ONE LINE. `field-sizing: content` sizes the box to its placeholder as well as to what
   is typed, so "Message Ada Tutor…" wrapped at 390px and every EMPTY composer was two lines tall —
   the one state a box should be at its smallest in. The hint is "Message…" now (see `msgForm_`);
   `nowrap` is the guard for a translation or a large text setting, and Chromium does not honour
   an ellipsis on a textarea's placeholder, so none is asked for. */
```

### ---------- THREE SHAPES BECAME ONE

before `.msg-form .btn.msg-go`

```
/* ---------- THREE SHAPES BECAME ONE ---------------------------------------------------------------
   A square `+`, a pill of a box and a square gold slab, side by side on one 44px line: three
   shapes for one control, which is most of why the composer read as assembled rather than designed.
   The box was already round, so the two buttons follow it — a 44px circle for the attachment and a
   pill for `Send`. Still `.btn`, and still buttons rather than tiles: the composer is a FORM, and a
   form's controls are buttons (CLAUDE.md, "A THING has tiles; a FORM has buttons").

   44px IN PX, which is this file's rule, and it is also the height of the one-line box, so the
   three bottoms and the three middles line up while the box is one line tall. */
```

### THE NOTE AND THE REFUSAL ARE THE SAME ELEMENT — see `msgForm_`.

before `.msg-said`

```
/* THE NOTE AND THE REFUSAL ARE THE SAME ELEMENT — see `msgForm_`. It takes the whole line under the
   box, and it is not drawn at all when there is nothing to say: an empty paragraph under every
   conversation is a margin nobody asked for. */
```

### ---------- THE THREAD'S OWN FURNITURE

before `.msg-day`

```
/* ---------- THE THREAD'S OWN FURNITURE ------------------------------------------------------------
   A day line where the conversation crosses midnight, so the line under a bubble can be the time
   alone; a head naming who the thread is with; and what a pending bubble says about itself. */
```

### "2 new" AS A BADGE, gold on black like every other count this app wears — it was gold text at the size of a timestamp beside a heading, which read as a

before `.dm-new`

```
/* "2 new" AS A BADGE, gold on black like every other count this app wears — it was gold text at
   the size of a timestamp beside a heading, which read as a footnote to the name rather than as the
   reason to look. Vertically centred on the heading rather than sat on its baseline. */
```

### `.mine.is-failed` AS WELL, because a refusal is only ever on your side and `.msg.mine .msg-bub` sets the gold border at the same (0,3,0) — so which won was

before `.msg.is-failed .msg-bub, .msg.mine.is-failed .msg-bub`

```
/* `.mine.is-failed` AS WELL, because a refusal is only ever on your side and `.msg.mine .msg-bub`
   sets the gold border at the same (0,3,0) — so which won was decided by which rule came later in
   this file, which `check/cascade.js` names the first time a state draws a refused bubble. Won by
   specificity now, not by position. */
```

### ---------- A REFUSAL SITS UNDER THE BUBBLE IT REFUSED

before `.msg-fail`

```
/* ---------- A REFUSAL SITS UNDER THE BUBBLE IT REFUSED ---------------------------------------------
   IT RAN THE FULL WIDTH OF THE CARD, left-aligned, under a bubble on the right — so the server's
   sentence started under the OTHER person's side, and the two controls wrapped onto a line of
   their own 30px further down. Held to the bubble's own 78% and set on its side, the sentence
   right-aligned and the two controls straight under it. */
```

### 44px in px — a tap target, the one measurement here that must not scale.

before `.msg-act`

```
/* 44px in px — a tap target, the one measurement here that must not scale. NO UNDERLINE: two
   underlined words straight after an underlined-looking red sentence read as more of the sentence.
   Retry is the gold word and Remove the quiet one, which is the order somebody is likely to want
   them in. */
```

### THE FIX AS A CONTROL, for an admin's refusal — the consent screen or `?setup=1` (see `msgFixLinks_`).

before `.msg-fail a.msg-act`

```
/* THE FIX AS A CONTROL, for an admin's refusal — the consent screen or `?setup=1` (see
   `msgFixLinks_`). An `<a>` is not centred the way a button is, and it is the way forward rather than
   a way out, so it keeps Retry's gold wherever it falls in the row. */
```

### ---------- WHAT WAS SENT WITH IT

before `.msg-att`

```
/* ---------- WHAT WAS SENT WITH IT ------------------------------------------------------------------
   A picture or clip sits inside the bubble at the bubble's own width; a file is a chip that opens
   it. A bubble holding only a picture loses its padding, so the photograph IS the bubble. */
```

### A BUBBLE THAT IS ONLY A PICTURE IS THE PICTURE.

before `.msg-bub.is-bare`

```
/* A BUBBLE THAT IS ONLY A PICTURE IS THE PICTURE. It kept `.25rem` of padding and its fill, so on
   your side a photograph sat in a thick gold mount — a frame round the one thing in a chat that
   needs none, and a different object from the same photograph on their side, which had a dark one.
   No fill, no outline, no padding: the corners are the bubble's, tail included, and the bubble
   clips the picture to them rather than the picture carrying a second, rounder set of its own. A file or a clip with no words keeps its plate — those are chips, not
   pictures, and a chip loose on the card would have no side to be on. */
```

### A CLIP THAT WOULD NOT PLAY becomes a link (`postVidFail_` in posts.js) and kept `.msg-vid` — so it was a 16rem black slab with an underlined gold line at its

before `.msg-body a.msg-vid`

```
/* A CLIP THAT WOULD NOT PLAY becomes a link (`postVidFail_` in posts.js) and kept `.msg-vid` — so it
   was a 16rem black slab with an underlined gold line at its top edge and nothing under it. Drawn as
   the file chip it now is: a plate, ink, no rule. */
```

### ---------- A FILE IS A CHIP, NOT A LINK IN A BOX

before `.msg-body a.msg-file, .msg-file`

```
/* ---------- A FILE IS A CHIP, NOT A LINK IN A BOX ------------------------------------------------
   `.msg-body a` MAKES EVERY LINK IN A THREAD GOLD AND UNDERLINED, which is right for a link somebody
   typed into a sentence and was wrong here: the whole chip is the link, so its name came out as
   three lines of underlined gold at 320px — the loudest thing in the conversation, for a mark
   scheme. Ink and no rule, the extension as a small plate of its own, and the name held to two
   lines; the full name is on the file it opens. (0,2,1) to beat `.msg-body a` at (0,1,1). */
```

### ---------- THE RECEIPT

before `.rc`

```
/* ---------- THE RECEIPT ---------------------------------------------------------------------------
   The breakdown was always a receipt: a list of what you are buying, what each part cost, and a
   total at the bottom. It is the only document shaped exactly like this, and one everybody can read
   without being taught — so the card stops pretending to be a table and admits what it is.

   PAPER, NOT SCREEN — AND IT IS NOT PAPER ANY MORE. The note above is kept because it is the case
   FOR the costume and it is a good one: a receipt is a physical object, and the metaphor works
   because it looks like something you could put in your pocket.

   IT WAS ANSWERED BY WHAT THE COSTUME COST. This document is not only the receipt. It is the
   booking form, the basket and the saved session as well — four things the app does, drawn by one
   function, and cream paper is the right dress for exactly one of them. Everything else on this
   site is black and gold; the one card somebody spends the most time reading was the one card that
   looked like it came from somewhere else, and every control on it — the hour grid, the dropdowns,
   the buttons — had to be given a second set of colours to survive landing on cream. That second
   set is the cost, and it is paid on every control this document ever gains.

   SO IT WEARS THE APP'S OWN CLOTHES. A raised panel with a hairline round it, which is how this
   site already says "a bounded object" (see `.qcard`) — and the reason a boundary is declared at
   all is that the tear used to be one. `bookerCard` dropped the `.card` wrapper precisely because
   the paper bounded itself; take the paper away without replacing the edge and the document floats
   on black with nothing to say where it starts.

   THE TEAR, THE BARCODE AND THE SHOP NAME ARE GONE WITH IT. All three are a receipt telling you it
   is a receipt: the zigzag says a till printed it, the barcode is 44 bars off a hash that encode
   nothing, and `@FAMILY.` names the shop to somebody who is standing inside it. What remains is
   what the document is actually for — what you are buying, what each part costs, and the total.
--------------------------------------------------------------------------------------------- */
```

### THE PADDING NO LONGER HAS A TEAR TO CLEAR, so it is the app's own card padding rather than the .45rem that was chosen to keep print off a ragged edge.

in `.rc`

```
/* THE PADDING NO LONGER HAS A TEAR TO CLEAR, so it is the app's own card padding rather than the
     .45rem that was chosen to keep print off a ragged edge. The eleven-across hour grid is what
     sets the floor here: it was given 5px back on each side to make its cells square, and that is
     still true of a border. */
```

### THE HEAD IS THREE LINES OF WHICH ONE MATTERS.

before `.rc-head`

```
/* THE HEAD IS THREE LINES OF WHICH ONE MATTERS. The stage, the shop name, then venue · tutor · when
   — and on an unsent booking the third is "No venue yet · No tutor yet" beside a timestamp, which is
   two facts the rows below state properly and a clock nobody asked for. Tightened rather than cut:
   it is what makes the card a receipt at a glance. */
```

### LEFT, NOT CENTRED. Centring was the shop name's doing — a till roll centres its header because the header is the shop.

before `.rc-head`

```
/* LEFT, NOT CENTRED. Centring was the shop name's doing — a till roll centres its header because
   the header is the shop. With the name gone what is left is where and with whom and when, which
   is a line of facts, and every other line of facts in this app starts at the left margin. */
```

### IT WAS DASHED, because a till roll's separators are printed rather than drawn — which was the right reason for as long as this was a till roll.

before `.rc-rule`

```
/* IT WAS DASHED, because a till roll's separators are printed rather than drawn — which was the
   right reason for as long as this was a till roll. It is a hairline now, the same one `.card` and
   `.row` draw between any two things on this site, so a divider inside the document and a divider
   outside it are the same mark. Five of them on a card of twelve rows is why the margin is .22rem
   rather than the .5rem it started at. */
```

### `.rc-cols` STYLED THE COLUMN HEADINGS — "# Item × Rate Total" — which are gone.

before `.rc-ref`

```
/* `.rc-cols` STYLED THE COLUMN HEADINGS — "# Item × Rate Total" — which are gone. The rules went
   with them rather than being left to sit; `check-css` names an orphan the moment the markup that
   made it disappears, which is how a stylesheet stays the size of the app rather than the size of
   its history. */
```

### `.rc-bars` WAS THE BARCODE AND IT IS GONE.

before `.rc-ref`

```
/* `.rc-bars` WAS THE BARCODE AND IT IS GONE. Its own note said it: "decoration and priced as
   such — 44 bars off a hash, there because a till receipt has one." Nothing scanned it, nothing
   could, and it was the single most receipt-shaped thing on the card.

   WHAT IT SAT NEXT TO WAS REAL, AND THAT STAYS. `.rc-thanks` never held a thank-you — it holds
   "Session 42", the id somebody quotes when they ring up about a booking — so it is named for what
   it carries now. A class called `thanks` holding a reference number is a thing that has to be
   opened to be understood, and this file is read far more often than it is written. */
```

### ---------- THE ROSTER

before `.rost`

```
/* ---------- THE ROSTER ---------------------------------------------------------------------------
   Four slots in a row, the shape a game lobby uses. It makes the size of the group a picture rather
   than a number — and an empty slot look like an invitation rather than an absence, which is what
   splitting a session actually is.
------------------------------------------------------------------------------------------------ */
```

### ---------- THE ROSTER, TIGHTENED

before `.rost`

```
/* ---------- THE ROSTER, TIGHTENED ------------------------------------------------------------------
   FOUR STACKED SLOTS — a 34px face, a name, a role — is about 80px of card for four words and four
   drawings, and three of the four are usually "Open". The seats matter; the amount of room they
   were taking to say so did not.

   The face drops to 22px and the role goes under the name rather than on its own line. Same four
   facts, a third of the height. */
```

### ---------- `background: transparent` WAS A PAPER RULE DRAWN ON BLACK

before `.rost-slot:not(.on)`

```
/* ---------- `background: transparent` WAS A PAPER RULE DRAWN ON BLACK ---------------------------
   MEASURED AT 1.31:1 — the word "Open" in `--paper-ink` on `--bg`, which is near-black on
   near-black and is not a low-contrast label so much as an invisible one. The roster was written
   for a cream receipt and `rosterHtml`'s one live caller is `fillRoster_`, which draws it into the
   `week` widget on the app's own card: three of the four seats are usually empty, so most of it.
   THE FILL STAYS AND THE `opacity` KEEPS IT PALE, which is what the note above asks for — the
   dashed border is what says "you could take this", and it says it just as well on a ground.
   FOUND BY THE BASKET BECOMING A TOOL, for the same reason as `.cal-arrow` above. */
```

### `--paper-dim` RATHER THAN `--paper-faint`, MEASURED AT 3.19:1 AGAINST THE SLOT'S OWN FILL.

before `.rost-role`

```
/* `--paper-dim` RATHER THAN `--paper-faint`, MEASURED AT 3.19:1 AGAINST THE SLOT'S OWN FILL. The
   faint token is the small print and it is right for a caption on the full page; on a 0.52rem
   uppercase label inside a #eeeadd seat it is under WCAG AA. Which seat somebody is in is not small
   print — it is the label the name above it is answering. */
```

### ---------- THE STUB: A WHOLE DOCUMENT TYPE, STYLED, THAT NOTHING DRAWS

before `.rc-total`

```
/* ---------- THE STUB: A WHOLE DOCUMENT TYPE, STYLED, THAT NOTHING DRAWS --------------------------
   FORTY-FOUR LINES AND FOURTEEN CLASSES for "the receipt folded up" — what it is, where and when,
   where it stands, two thumbnails, a row of seat pips. It reads like a good idea and it probably
   was one: five stubs is a list you can scan, five full receipts is a screen you scroll.

   NOTHING HAS PRODUCED ONE FOR A LONG TIME. `Your sessions` draws cards now, and when the markup
   went the stylesheet stayed — which is the ordinary way a 448KB stylesheet happens.

   IT WAS INVISIBLE TO THE CHECK THAT EXISTS TO FIND IT, twice over. `check-css` searched the
   comments as well as the code, and every one of these names appears in the paragraphs above them;
   and it asked `code.includes(c)`, so `.rc-stub` was proved live by `.rc-stub-pics` two lines down.
   Both are fixed, and this is the first thing the repaired check found. The seat pips went with it:
   `.pip` was only ever drawn inside `.rc-stub-slots`.

   IF A FOLDED LIST IS WANTED AGAIN it is `jobReceipt` with a shorter row list, not this — the
   receipt has changed palette, lost its tear and lost its barcode since these rules were written,
   and a stub restored from here would be a cream paper object in a black app. */
```

### ---------- THE TOTAL IS ITS OWN ROW, NOT A SIX-COLUMN ONE

before `.rc-total`

```
/* ---------- THE TOTAL IS ITS OWN ROW, NOT A SIX-COLUMN ONE --------------------------------------
   It borrowed the breakdown's grid, which means the note beside it — "10 sessions" — landed in the
   RATE column: nine characters wide and `white-space: nowrap`. Eleven characters do not fit in
   nine, and nowrap means they do not wrap either, so it simply ran over the top of the figure.

   Three columns instead, which is what this row actually has: what it is, a note about it, and the
   amount. The note takes whatever is left over and wraps if it must, and the amount is last and
   sized to itself, so nothing can reach it. */
```

### ---------- AND THEN IT BECAME A ROW OF THE TABLE, WHICH IS THE THIRD ANSWER AND THE ASKED-FOR ONE

before `.rc-total`

```
/* ---------- AND THEN IT BECAME A ROW OF THE TABLE, WHICH IS THE THIRD ANSWER AND THE ASKED-FOR ONE
   ASKED FOR AS *"the final cost needs to be in same style as everything else. cost is in the Q
   column and the total cost is in the + column, styled like everything else for maximum
   uniformity."* Everything above this line is the argument for the opposite and it was right about
   one thing and wrong about the rest: the note beside the figure really did land in a nine-character
   RATE column and really did overlap it — and the fix for that was to delete the note, which has now
   happened for a different reason. See `aside` in `book.js`.

   WITH NO NOTE THERE IS NOTHING FOR A THIRD COLUMN TO HOLD. The row is a label and a figure, which
   is what the first and last of the card's five tracks already are — so it moved INSIDE `.bk` and
   subgrids like every other row, and `Cost` lands under `Q` and the figure under `+` with nothing
   here to place them.

   AND THE FIGURE IS THE SAME SIZE AS THE FIGURES ABOVE IT. `1.05rem` at weight 700 in a `7.5ch`
   track is the overflow the note further down this file measured at 18px on a receipt and 28 in the
   basket; "styled like everything else" answers the complaint and that measurement at once. What is
   left to say the row is the total is weight and full ink, which is what `.bk-t` already does one
   step less of.

   THE BORDER REPLACES A `.rc-rule`. There was a hand-drawn rule between the rows and the total,
   closing off a block the total is now part of — so the line is the row's own top edge, which is
   where every other line between rows on this card is drawn. */
```

### ---------- AN ADMIN'S TWO MORE MONEY ROWS, UNDER THE FIRST AND PART OF IT

before `.rc-total.rc-more`

```
/* ---------- AN ADMIN'S TWO MORE MONEY ROWS, UNDER THE FIRST AND PART OF IT -----------------------
   `Tutor earns` and `Admin earns` follow `Client pays` — see `jobMoney_` in book.js. They are the
   same row again rather than a block of their own, so no second rule above them: one line closes
   the questions off, and the three figures under it read down the `+` column as one total split
   three ways. Named through `.rc-total` so it out-specifies the base rule rather than out-sitting
   it — the `.price.faint` race this stylesheet has lost twelve times. */
```

### ---------- THE MONEY BLOCK: AN ADMIN'S SUM, READ AS A SUM (docs/history/353)

before `.rc-total.rc-money .bk-k`

```
/* ---------- THE MONEY BLOCK: AN ADMIN'S SUM, READ AS A SUM (docs/history/353) ------------------------
   EIGHT ROWS IN THE TOTAL'S CAPITALS WOULD SHOUT EIGHT TIMES, and the block is a subtraction to follow
   down the `+` column, not eight headlines — so its terms are in the answers' own case and weight, and
   only `Net profit`, the line the sum is for, is heavy. Red on a negative net: `--bad` is what this
   sheet already means by money going the wrong way, and the sentence under it says by how much. */
```

### ---------- A TOTAL'S LABEL RUNS ACROSS THE ROW, SO IT CANNOT WIDEN THE QUESTION COLUMN

before `.rc-total .bk-k`

```
/* ---------- A TOTAL'S LABEL RUNS ACROSS THE ROW, SO IT CANNOT WIDEN THE QUESTION COLUMN ------------
   THE LABEL TRACK IS `minmax(6.2em, max-content)` AND IT IS SHARED BY EVERY ROW ON THE CARD — so
   the widest label anywhere decides where every answer starts. `COST` fitted inside the floor;
   `CLIENT PAYS` and `TUTOR EARNS`, in capitals and tracked, did not, and measured at 390 they pushed
   the answer column far enough right that `Autumn 2026` and every tick's date wrapped onto a second
   line. At 320 the dates broke mid-number. `IT WOULD COME TO` on an unanswered application had been
   doing the same thing quietly for as long as that label has existed.

   SO THE LABEL SPANS `1 / -2` — every track but the figure's — and the three empty spans beside it
   go. A spanning item only grows a track when the tracks it spans are too narrow together, and the
   answer column alone is wider than any total's label. `-2` RATHER THAN `5` because the basket is
   two tracks, and there `1 / -2` is just its first. The dotted leader went with `.bk-v`: the row's
   own rule above it already says this is the total. */
```

### ---------- AND ON A BASKET IT IS TWO COLUMNS, BECAUSE THE BASKET'S CARD IS

before `.bk`

```
/* ---------- AND ON A BASKET IT IS TWO COLUMNS, BECAUSE THE BASKET'S CARD IS ----------------------
   `.bk:has(> .is-wide)` GIVES THAT CARD TWO TRACKS and `.bk-row.is-wide` hides four of its six
   spans to match. The total row is not `is-wide` — it is the same row on both documents — so
   without this it would put five spans into two tracks and wrap itself over three lines. The four
   it hides are the four that are empty there, which is the same four `is-wide` hides. */
```

### ---------- ELEVEN RULES THAT SAID THE SAME ELEVEN THINGS IN A SECOND COLOUR

before `.bk`

```
/* ---------- ELEVEN RULES THAT SAID THE SAME ELEVEN THINGS IN A SECOND COLOUR ----------------------
   THIS BLOCK WAS "the rows inside the paper: the same five columns, in ink rather than in screen
   colours", and every line of it paired exactly with a base `.bk-*` rule forty lines below:
   `.rc .bk-k` against `.bk-k`, `.rc .bk-t` against `.bk-t`, cream for black the whole way down.

   THAT PAIRING IS WHAT THE COSTUME COST, and it is why it was worth taking off. Every control this
   document ever gains needed a second colour written for it by hand, and a control whose author
   forgot looked right on every screen in the app except the one it was built for. Four of the
   eleven were not even tokens — `#c9c0b0`, `#ded5c5`, `#b8722a`, `#cfc9bd` — which is the same
   find-and-replace trap the paper palette was named to close.

   ALL ELEVEN ARE DELETED RATHER THAN RE-POINTED. The base rules are already the app's palette and
   already correct; re-pointing would have left eleven overrides restating their own defaults, which
   is the DRY fault one step further along rather than the fix for it. `.rc .bk-sel:disabled`,
   `.rc .bk-set` and `.rc .bk-open` went the same way, further down this file.

   IF THE ROWS EVER NEED TO DIFFER INSIDE THE DOCUMENT, this is the place — but the reason will
   have to be something other than "it is on cream". */
```

### ---------- THE BOOKING CARD

before `.bk`

```
/* ---------- THE BOOKING CARD --------------------------------------------------------------------
   Five columns: what it is · what was chosen · the multiplier · what it adds an hour · the running
   total. A multiplier and a fixed amount are different operations, and sharing one column is what
   made the old arithmetic unfollowable.

   The last figure in the right-hand column IS the price. That is the whole design: a total on its
   own is a number you either trust or you don't, and a chain you can read down is one you can
   check.
--------------------------------------------------------------------------------------------- */
```

### ---------- ONE GRID FOR THE WHOLE CARD, BECAUSE EVERY ROW WAS ITS OWN

before `.bk`

```
/* ---------- ONE GRID FOR THE WHOLE CARD, BECAUSE EVERY ROW WAS ITS OWN ---------------------------
   REPORTED AS *"make reciept builder more like ordely. each field in its correct column"*, the
   morning after the five column heads went on. They sat over nothing, and the reason is structural:
   every `.bk-row` declared `display: grid` and its own `grid-template-columns`, so `max-content` and
   `1fr` resolved PER ROW. Five independent grids stacked up cannot line up except by accident.

   MEASURED AT 390 ON A PRICED BOOKING, before this:

     the head        Q 7.7→60.9   A 65.4→190.5   × 194.9→231    +/h 235.5→276.8   + 281.2→319.9
     Tutor           K 7.7→75.6   V 80.1→158.3   M 162.7→208.9  R   213.3→266     T 270.5→319.9
     Subject         K 7.7→75.6   V 80.1→319.9   — no figures, so the answer ran to the card's edge
     Dates (blank)   K 7.7→39.9   V 44.3→319.9   — `max-content` on a four-letter label

   Not one of the head's five boundaries was a boundary of any row, the answers ended at two
   different x on one card, and three blank rows started their dash in three different places.

   SO THE CARD DECLARES THE COLUMNS AND EVERY ROW SUBGRIDS ONTO THEM. `max-content` on the label
   now resolves once, across every label on the card, and `1fr` once — which is what makes a column
   a column rather than a coincidence. The widths are unchanged; what changed is that there is one
   set of them instead of thirty.

   THE FONT-SIZE IS SHARED WITH THE ROW AND DECLARED IN ONE PLACE. Every track here is `em` or `ch`,
   which resolve against the element that DECLARES them — so tracks on `.bk` at the card's font size
   and text in the row at `.74rem` would size the columns for a font nothing is set in. That is the
   `rem`-versus-`em` fault the note below records, one level up. */
```

### A ROW SPANS THE CARD AND BORROWS ITS TRACKS.

before `.bk > .bk-row`

```
/* A ROW SPANS THE CARD AND BORROWS ITS TRACKS. `subgrid` is the only thing that makes a track
   shared: `display: contents` would drop the row itself, and the row is what carries the padding,
   the tick-box line-height and the week's own layout. */
```

### FIVE COLUMNS, and they must feel like five.

before `.bk-row`

```
/* FIVE COLUMNS, and they must feel like five.
   `auto` on the last three meant each row sized its own figures, so £10.00 and £317.75 started in
   different places and the card read as rows that happen to contain numbers rather than as a
   table. Fixed widths in `ch` — the width of a digit in this monospace — so every multiplier sits
   under every other multiplier and the totals form a straight edge down the right.
   The value column is the only elastic one, because it is the only one whose content has no
   natural width. */
```

### THE LABEL COLUMN WRAPS.

in `.bk-row`

```
/* THE LABEL COLUMN WRAPS. It was `max-content`, which is a promise never to break a line — so
     "Extra subjects" and "Time interval" held the column open at their full width and every other
     column was squeezed to pay for it. Given a narrow fixed width they break in two, which costs a
     line of height and buys the figures the room they need.
     Both text columns are narrow on purpose: a card of five columns only reads as five if none of
     them is fighting the others for width. */
```

### SIX COLUMNS: the line number, what it is, what was chosen, the multiplier, the rate, the running total.

in `.bk-row`

```
/* SIX COLUMNS: the line number, what it is, what was chosen, the multiplier, the rate, the
     running total. The number goes first because that is where a till roll puts it and because it
     is the only column somebody reads DOWN rather than across. */
```

### ---------- WIDE ENOUGH FOR THE WORDS THAT ARE ACTUALLY IN IT

in `.bk-row`

```
/* ---------- WIDE ENOUGH FOR THE WORDS THAT ARE ACTUALLY IN IT ---------------------------------
     4.4rem BROKE "POSSESSION" INTO "Possessio / n". The label column was sized for "Subject" and
     "Level" and every longer word in the set — Possession, Lifecycle, Extra subjects — paid for it
     with a hyphen in the middle. 5.6rem holds the longest of them on one line.

     AND THE VALUE COLUMN GETS THE REST. "No preference" came out as "No prefer- / ence" for the
     same reason one column along. The multiplier was 5.5ch for "× 10" and gives back what it was
     not using.

     THE RATE WENT 8ch → 7.5ch ON THAT PASS AND IT DID NOT FIT. Measured at 390: `£12.00/h` is EIGHT
     glyphs of `--mono` and 52px wide, in a track of 7.5ch × 6.59px = 49.45px. Three pixels over, and
     `.bk-r` then took `.bk-row`, `.rc` and `.pane` sideways with it.

     `ch` IS THE ROW'S FONT AND THE FIGURES ARE THE CHILD'S. That is the whole of it, and it is the
     `6 dates` fault one column along, written up on the receipt: a track sized in the PROPORTIONAL
     font of the grid container, handed the same number of characters in a wider monospace. Eight
     characters need eight of the wider kind, so the track is 8ch again — and the note that said
     `£10.00/h` "already fits in 7.5" was counting characters rather than measuring the box. The
     value column is `1fr` and gives the half-character up.

     NOTHING COULD SEE IT UNTIL THE LAB COULD DRAW THE CARD. The only rows carrying a `/h` rate are
     `Tuition` and the waiting list's `A seat`, and the PRICED waiting-list card had never been on a
     screen `check/ui.js` looked at: `bookPrice` answers `null` with no venue, and the fixture had no
     seat price at all. See the note on that state in `check/states.js`.

     THE FLOOR STAYS. `minmax(0, 1fr)` let the value collapse to nothing once the fixed columns had
     taken theirs, which is how a word ends up one letter per line. */
```

### ---------- SIX COLUMNS DO NOT FIT A PHONE, AND ONE OF THEM CARRIES NOTHING

in `.bk-row`

```
/* ---------- SIX COLUMNS DO NOT FIT A PHONE, AND ONE OF THEM CARRIES NOTHING --------------------
     MEASURED: the six wanted about 356px on a card with 332 to give, so the running total — the one
     figure the whole chain exists to arrive at — was being clipped off the right edge. And `× 1.005`
     needed seven characters in a column given four and a half, so the multiplier was running into
     the rate beside it.

     THE LINE NUMBER IS THE ONE THAT GOES. It is the only column that carries no information: 001,
     002, 003 is a till roll's habit, and every other column is a fact somebody might check. When
     something has to be cut, cut the thing that says nothing.

     AND THE WIDTHS ARE IN `em` NOW, not `rem`. `rem` is root-relative, so the label column was sized
     against 16px while the text in it was 12 — which is why it looked generous and measured tight.
     `em` scales with the row, so shrinking the font shrinks the columns with it. */
```

### ---------- AND THE LABEL COLUMN GIVES WAY RATHER THAN BREAKING THE LABEL

in `.bk-row`

```
/* ---------- AND THE LABEL COLUMN GIVES WAY RATHER THAN BREAKING THE LABEL --------------------
     `Extra subj.` IS ELEVEN CHARACTERS AND 6.2em IS TEN, so the moment that row carried a real
     value instead of a dash it drew as `Extra / subj.` — a row twice the height of the twenty
     around it, on a document read by position. The note over `SPINE_EXTRA` records four labels
     shortened for exactly this, and shortening a fifth time is the hand-repair this repository
     keeps finding; the column giving way is the rule.

     THE FLOOR STAYS AND IS WHAT MATTERS: 6.2em is where every label starts, so the answers still
     line up down the card. `max-content` is a ceiling, reached only by a label that needs it, and
     the longest on the spine wants about two pixels more than the floor. The same repair already
     sits on `.bk-row.is-bare` and `.bk-row.is-blank`; having it in three places and not in the one
     they are variants OF is the fault this file keeps writing down. */
```

### ---------- TWELVE ROWS IS A LOT OF ROWS

in `.bk-row`

```
/* ---------- TWELVE ROWS IS A LOT OF ROWS -----------------------------------------------------
     The card lists every question now, so what used to be four or five priced lines is twelve
     before anything is answered. At .34rem top and bottom plus a .5rem gap that is most of a phone
     screen spent on the gaps between things rather than the things.

     TIGHTER, AND THE ROW STILL HAS AIR. .16rem of padding on a .76rem line leaves the rows clearly
     separate — the dashed rule under each value is doing most of that work anyway — and gives back
     roughly a third of the card. */
```

### A ROW IS ONE LINE AND THE RULE UNDER IT.

in `.bk-row`

```
/* A ROW IS ONE LINE AND THE RULE UNDER IT. With the control no longer forcing a minimum, the
     padding is what is left, and .1rem on a .74rem line is enough to keep twelve of them apart —
     the dashed underline is doing most of the separating anyway. */
```

### ---------- BELOW 351px THE ROOT STOPS SHRINKING AND THE SCREEN DOES NOT

in `.bk-row`

```
/* ---------- BELOW 351px THE ROOT STOPS SHRINKING AND THE SCREEN DOES NOT -----------------------
     THE ROW WANTED 255px AND HAD 242 AT 320, so the running total — the one figure the whole chain
     exists to arrive at — was 13px off the right edge, and `.bk` then `.rc` then `.pane` scrolled
     sideways behind it. Nothing had ever reported it: the booking card only exists for a signed-in
     visitor and `check/ui.js` had only ever measured signed-out ones.

     THE CAUSE IS A FLOOR, NOT THIS GRID. Line 121 sets the root to `clamp(13.5px, 3.8vw, 16px)`, so
     below about 355px the root is pinned at 13.5 while the viewport keeps getting narrower. Every
     column here is `em` or `ch` off that root — deliberately, so shrinking the font shrinks the
     columns with it — so below the floor the card is the one thing on the page that cannot shrink.

     SO THE ROW TRACKS THE VIEWPORT WHERE THE ROOT WILL NOT. `min()` rather than a media query
     because the two curves meet: 2.85vw equals .74rem at exactly the width the root stops moving,
     so this is .74rem at every width the card already fitted and continuous at the crossover. No
     breakpoint to keep in step with the clamp, and no second set of column widths. */
```

### ---------- ONE SIZE, BECAUSE THE TRACKS ARE MEASURED IN IT

before `.bk, .bk-row`

```
/* ---------- ONE SIZE, BECAUSE THE TRACKS ARE MEASURED IN IT --------------------------------------
   `em` AND `ch` RESOLVE AGAINST THE ELEMENT THAT DECLARES THEM, and the tracks now live on `.bk`
   while the words live in the row. Declared separately, the two drift the moment either moves —
   which is the `rem`-versus-`em` fault recorded in the grid note above, one level up: with `.bk`
   left at the card's own size, `6.2em` came out 96px against a label 56px wide and the five columns
   wanted 385px on a card with 328 to give. Measured, before this line existed.
   ONE SELECTOR FOR BOTH, rather than the same expression written twice. `.rc-total` is a `.bk-row`
   outside `.bk` and takes it from here as well, so the total's figure sits in the same-sized column
   as the figures above it. */
```

### BREAK A WORD ONLY WHEN IT WILL NOT FIT, and hyphenate it when it does break.

before `.bk-k`

```
/* BREAK A WORD ONLY WHEN IT WILL NOT FIT, and hyphenate it when it does break.
   This said `anywhere`, which breaks eagerly rather than as a last resort — so "Possession" came
   out as "Possessio / n" in a column that was very nearly wide enough for it. `break-word` splits
   only a word that cannot fit on a line of its own, which is the case this was written for: a long
   venue name with nothing to break at.
   `hyphens: auto` puts a hyphen at the break, so a split word reads as a split word rather than as
   two short ones. */
```

### BUT NOT ON THE LABEL.

before `.bk-k`

```
/* BUT NOT ON THE LABEL. The label column holds a fixed set of words — thirteen step names and a
   handful of headings — and all of them fit now that the column is 5.6rem. Hyphenation there can
   only ever be the column being too narrow, and a hyphen makes that look deliberate rather than
   like the bug it is. The value column keeps it: a venue name can be anything. */
```

### THE LINE NUMBER IS NOT DRAWN.

before `.bk-n`

```
/* THE LINE NUMBER IS NOT DRAWN. See the note on the grid above: six columns did not fit and this is
   the one with nothing in it — 001, 002, 003 is a till roll's habit, and every other column is a
   fact somebody might check. The span is still emitted so the row shape is unchanged for anything
   that reads it; it just has no column to sit in. */
```

### Aligned to the top rather than the baseline, because these columns now hold several lines each and baseline alignment would line up the FIRST line of a

before `.bk-m, .bk-r, .bk-t`

```
/* Aligned to the top rather than the baseline, because these columns now hold several lines each
   and baseline alignment would line up the FIRST line of a two-line label with the only line of a
   one-line figure — which reads as the figure belonging to the line above it. */
```

### `overflow-wrap: anywhere` WAS STILL HERE.

before `.bk-v`

```
/* `overflow-wrap: anywhere` WAS STILL HERE. The rule above sets `break-word` on `.bk-k, .bk-v` and
   explains at length why `anywhere` was wrong — but it was only ever removed from one of the two,
   and this later line put it straight back on the value column. Which is why a long value came out
   as one letter per line: `anywhere` breaks eagerly, and this column can be squeezed to about 30px
   once the five other columns have taken theirs. Same fault as the tile that was a column: a rule
   declared twice, and the one you can see is not the one you read. */
```

### ---------- A FIELD ANSWERED IN PLACE

before `.bk-sel`

```
/* ---------- A FIELD ANSWERED IN PLACE --------------------------------------------------------------
   THE ROW IS THE QUESTION NOW, so the value cell holds a real `<select>` and the phone's own picker
   does the rest. It has to look like the text it replaced and nothing like a form control: no box,
   no chrome, right-aligned on the dashed rule that already said "you picked this".

   `appearance: none` REMOVES THE ARROW AND THE INSET. Left on, a select brings a grey well and a
   chevron per row — twelve of them down a receipt — which is the control shouting about itself on a
   card whose whole job is to look printed.

   FULL WIDTH SO THE WHOLE CELL IS THE TARGET. A select sized to its text gives a tap target the
   width of the word in it, and "—" is four pixels of it. */
```

### ---------- A SELECT IS TALLER THAN ITS TEXT UNLESS YOU SAY OTHERWISE

before `.bk-sel`

```
/* ---------- A SELECT IS TALLER THAN ITS TEXT UNLESS YOU SAY OTHERWISE ------------------------------
   `appearance: none` TAKES THE ARROW AND THE WELL, NOT THE HEIGHT. Every browser keeps a minimum
   box for a form control — roughly a line and a half plus its own padding — so twelve rows of
   17px text were coming out at 47px each. Thirty pixels a row, twelve rows, on a card people were
   already calling too long: the control was most of the receipt.

   `line-height` AND `height: auto` TOGETHER. Setting one and not the other leaves the other doing
   the padding; both, and the row is as tall as the word in it. */
```

### ---------- THE ONE SELECT THAT IS NOT THE FIELD, AND WHY

before `.bk-sel`

```
/* ---------- THE ONE SELECT THAT IS NOT THE FIELD, AND WHY ------------------------------------------
   EVERY OTHER SELECT IN THE APP IS THE FIELD'S BOX — 44px, 16px, the arrow — and the owner's request of
   9 October was for one ordinary dropdown everywhere. THIS ROW KEEPS ITS RECEIPT CLOTHES, and that is
   measured rather than preferred: the answer column is **56 / 75 / 81px** at 320 / 390 / 768, and a
   16px answer in a 44px box with a 2rem arrow in 75px is three letters and an ellipsis; and a 44px row
   detaches the dashed rule it sits on by 24px, which was built twice and reverted twice (note 031 —
   `ACCEPTED_TAP` in check/ui.js carries it). So the row's WORD is part of the target as well: `Kind`
   is a `<label for>` its select (`receiptRow`, `bkCtl_` in book.js), a tap on it focuses the select and
   asks for the platform's list, and a tap on the answer opens it directly. The row's figures are not:
   they are the price, not the question. Until review found it on 9 October this said "the whole ROW is
   the target", which had been the panel's hit test and stopped being true when the panel went.

   WHAT IT SHARES IS THE ARROW, smaller — the same `▾`, from the same rule, so a dropdown on the receipt
   reads as a dropdown, which for a week it did not (a dashed word with nothing to say it opens).

   AND THE TEXT IS UNDER 16px, which on an iPhone zooms the page into a focused field — the reason the
   field's rule is 16px exactly. The viewport's `maximum-scale=1` (index.html) is what stops that zoom
   on this row, and it was already what stopped it on every row while the panel stood. */
```

### A SELECT CANNOT WRAP.

in `.bk-sel`

```
/* A SELECT CANNOT WRAP. "Halex Dias" in a 55px column was cut mid-word with no sign it had been —
     `Halex Dia` reads as somebody's name, not as a truncation. An ellipsis says the rest is there,
     and the full text is in the picker the moment it is opened. */
```

### A KEYBOARD ON THIS ROW HAD NOTHING TO SEE.

before `.bk-sel:focus-visible`

```
/* A KEYBOARD ON THIS ROW HAD NOTHING TO SEE. The box has no edge to turn gold, so the arrow does, and
   the answer comes up to full ink: the same "this one" the field's gold edge says, on the one select
   that has no edge (note 315). `:focus-visible`, so a tap — which opens the platform's list over it
   anyway — leaves the row as it was. */
```

### ---------- LOCKED, NOT MISSING

before `.bk-sel:disabled, .bk-in:read-only`

```
/* ---------- LOCKED, NOT MISSING --------------------------------------------------------------------
   A ROW WHOSE ANSWER IS NOT YOURS TO GIVE keeps its place, its label and its value — the venue of the
   class you are joining is worth reading even though you cannot change it. What it loses is the
   pointer and a little contrast, which is the whole difference between "settled" and "not offered".

   `opacity: 1` ON PURPOSE. The browser fades a disabled control to about 40%, which on a receipt
   reads as failed to load rather than as decided. The colour says it instead. */
```

### A TYPED ANSWER, IN THE SAME CLOTHES AS A CHOSEN ONE.

before `.bk-in`

```
/* A TYPED ANSWER, IN THE SAME CLOTHES AS A CHOSEN ONE. The split is addresses rather than a choice,
   so its row holds a text box — and it has to look like the dashed value it sits on, not like a
   form field dropped onto a receipt. Same removal of chrome as the select above. */
```

### A SETTLED ANSWER — text where a control would be, because nothing can be picked.

before `.bk-set`

```
/* A SETTLED ANSWER — text where a control would be, because nothing can be picked. It wraps, which
   is the other half of the point: a select cannot, so a long venue name was cut mid-word in a column
   with room for it over two lines. Same colour as a locked control, for the same reason. */
```

### ---------- AND AN OPEN ANSWER THAT ONLY ITS END TELLS APART WRAPS TOO

before `.bk-face`

```
/* ---------- AND AN OPEN ANSWER THAT ONLY ITS END TELLS APART WRAPS TOO -------------------------------
   `stepSelect_`'s `wrap` (book.js): the Venue row, once a venue has rooms. Three rooms of one building
   read "Colliers …" three times in this column, so the answer is drawn as words that wrap and the
   select is laid exactly over them — still the control, still under the finger, its arrow still
   drawn; only its own letters are left unpainted, so the row does not say its answer twice.

   `-webkit-text-fill-color`, NOT `color`. Four rules here already set a select's `color` — unanswered,
   focused, disabled, and the arrow's ink rides on it — and the unanswered one out-ranks anything this
   could say through `:has()`. The fill is the property that paints the letters, nothing else sets it,
   and the picture the Share tile makes copies it (`rcStyle_`), so the clone is as blank as the screen.

   THE WORDS TAKE THE SELECT'S CLOTHES: right-aligned, the same air before the arrow (`.bk-sel`'s
   `--sel-tri` of 4px twice and .3em), and the same ink for each of its states, asked of the select
   with `:has()` so there is one source for which state it is in. */
```

### THE NOTE READS LEFT TO RIGHT.

before `.bk-in-l`

```
/* THE NOTE READS LEFT TO RIGHT. Every other value is right-aligned against its figures; a sentence
   is not a figure, and a sentence that starts at the right edge and grows leftwards is unreadable.
   Its row has no figures at all, so it already spans the card — see `is-bare`. */
```

### `.bk-open` WAS THE WEEK'S OWN BOX AND THERE IS NO WEEK'S OWN BOX ANY MORE.

before `.bk-say`

```
/* ==================================================================================================
   `.bk-open` WAS THE WEEK'S OWN BOX AND THERE IS NO WEEK'S OWN BOX ANY MORE.

   It held the grid under the When row for as long as the week was one control belonging to one
   question: full width at first, then indented to the value column, then `2 / -1`, then argued over
   a fourth time when a screenshot asked for it *"squashed into the second column"*. Every round was
   the same trade and the arithmetic is worth keeping, because it is what finally ruled the shape out
   rather than a preference:

     indented, eleven cells and eleven gaps      320px  13.6 wide   390px  17.6   768px+  18.7
     clipped to where an answer's dash stops     78.2px of track — a FIVE-PIXEL cell
     on its side, seven day-columns in 78.2px    11px

   against `.hr`'s floor of 20px, which is a fingertip and not a preference. The card simply has two
   right edges — the value column stops at 189 and the grid needs 240 — and no box hung under one row
   can be on both.

   A DAY IS A ROW NOW, so the question is answered rather than traded: seven `.bk-row.bk-wk` rows,
   each an ordinary row of the document with `Monday` in the label column where `Subject` goes. See
   the block further down this file. Nothing builds `.bk-open` any more — `stepGrid_`, `blockWeek_`
   and `jobGrid_` are all `weekRows_` — so the rules went with it rather than being left to read as
   decisions that do nothing, which is `.favwrap.is-fav` and is the fault this file keeps recording.
================================================================================================== */
```

### ---------- WHAT THE ROW ABOVE MEANS, OR WHY IT CANNOT BE ANSWERED THAT WAY

before `.bk-say`

```
/* ---------- WHAT THE ROW ABOVE MEANS, OR WHY IT CANNOT BE ANSWERED THAT WAY ------------------------
   THE SAME SIZE AND THE SAME PLACE AS THE GRID'S OWN NOTE, because they are the same kind of thing:
   a sentence belonging to the row above rather than a row of its own. Left-aligned, where every
   value on this card is right-aligned — a value answers the label beside it and a sentence does
   not, so lining it up with the answers would read as one. */
```

### ---------- AND THE SAME, SAID BY A CLASS, FOR THE CONTROL THAT IS NOT A SELECT

before `.bk-sel.is-unset`

```
/* ---------- AND THE SAME, SAID BY A CLASS, FOR THE CONTROL THAT IS NOT A SELECT ------------------
   A QUESTION TAKING SEVERAL ANSWERS IS A BUTTON THAT OPENS A LIST OF CHECKBOXES UNDER ITS ROW — see
   `stepMulti_` — wearing `.bk-sel` because it is the same object on the card: right-aligned, no
   chrome, the answer as its own text, the arrow. What it cannot inherit is the rule above, which
   recedes an unanswered row by asking a `<select>` whether its blank option is chosen. A button has no
   options, so it says so itself. A `<button>`'s own font and alignment are not inherited either, which
   `font: inherit` and the `text-align` on `.bk-sel` already set. */
```

### ---------- THE TICKS UNDER THAT ROW

before `.bk > .bk-many-list`

```
/* ---------- THE TICKS UNDER THAT ROW ---------------------------------------------------------------
   `stepManyList_` in book.js: the full width of the card, a row of it like `.bk-say`, and one
   `.check` per option — the app's own checkbox, 44px a row in px. LARGER TYPE THAN THE RECEIPT'S,
   because these are things to read and press rather than lines to check, and the receipt's
   `min(.74rem, 2.85vw)` is eleven pixels on a phone. A dashed rule above and below, the receipt's own
   line, so the list reads as opened out of the row above it rather than as a second card. */
```

### `#drop`, THE PANEL THAT HUNG OFF A FIELD, WAS HERE — its place, its z-order over a sheet, its two-column `.pick-list` of `.pick-opt` buttons, and

before `.bk-m, .bk-r, .bk-t`

```
/* `#drop`, THE PANEL THAT HUNG OFF A FIELD, WAS HERE — its place, its z-order over a sheet, its
   two-column `.pick-list` of `.pick-opt` buttons, and `select { pointer-events: none }`, the one rule
   that kept every platform's own list shut so the panel could open instead (notes 153, 226). All of
   it went on 9 October, when the owner asked for *"a more stable standard simple conventional drop
   down list"* (note 315). The option colours that sat at the foot of it are the select rule's now,
   beside `input, select, textarea`, for every select rather than this card's alone. */
```

### A rule between the sections.

before `.bk-end`

```
/* A rule between the sections. They are three different operations on the price — what builds the
   hourly rate, and what multiplies the finished total — and running them together as one list is
   what made reading down look like one continuous sum. */
```

### ---------- THE FIVE STAGE TICKS

before `.bk-tick`

```
/* ---------- THE FIVE STAGE TICKS -------------------------------------------------------------------
   ASKED FOR AS *"line for requested ... then accepted, then paid, then started. Then completed. All
   tick boxes."* `JOB_STAGES` in book.js is the list and the argument; this is what one looks like.

   IT BORROWS `.check`'s ARGUMENT AND NOT ITS SIZE. That is the app's only checkbox and its own note
   is the reasoning worth copying: the EDGE and the GROUND are what make a box read as a box —
   `--line` on a dark card is a dark square on a dark square — and a ghost ✓ at low alpha says what
   would go in an empty one. What is NOT copied is the 44px floor, because that floor is for a thing
   a finger presses and nothing ticks these by hand; five 44px rows would be 220px on a card whose
   headroom has been measured in single pixels.

   ---------- AND IT IS SIZED SO THAT IT DOES NOT SET THE ROW'S HEIGHT --------------------------
   THE FIRST VERSION WAS `.82rem` WITH A `1.05em` BOX — `.check .box`'s own numbers, scaled down —
   and it came out **13.3px inside a 12.1px line box**, so each stage row was 18.6px against the
   15.4px of the eighteen rows above it. Two things went wrong with that at once: the waiting-list
   card, which `check/ui.js` already records arriving with three pixels of headroom at 390 and
   eight at 768, ran 3px past its pane and the check said so; and five rows a fifth taller than
   their neighbours is a visible step on a document whose whole readability is that you find a line
   by where it is.

   SO IT IS A FRACTION OF THE ROW'S OWN TYPE and never of the root. `font-size: inherit` with a
   `1.05em` box is exactly the line box the rule below gives a stage row — measured at 12.6px
   against a 12.6px line at 768 — so the mark fits the row rather than setting its height. Written
   as `.82rem` and `1.05em` of it, which is `.check .box`'s own pair scaled down, the box came out
   **13.3px inside a 12.1px line** and every stage row was 18.8px.

   `vertical-align: middle` IS THE HALF THAT IS EASY TO MISS. An inline box sits ON the baseline by
   default, so its whole height hangs above it and the descender space is added underneath — which
   is where the extra pixels came from rather than from the box being too big.

   GOLD IS WHAT THIS APP MEANS BY DONE — the ticked hour, the starred thing, the one button to
   press — so a ticked stage is a gold box with dark ink in it, which is exactly what
   `.check input:checked + .box` already does. The unticked one is the ghost. */
```

### `.bk-pick` WAS HERE — a gold underline and a pointer on the one value in the form that opened a panel.

before `.bk-day .bk-v`

```
/* `.bk-pick` WAS HERE — a gold underline and a pointer on the one value in the form that opened a
   panel. There is no panel: `stepGrid_` draws the week whenever the When row is drawn, and has
   since folding was removed for changing the card's height under a thumb. What survived was a
   control advertising itself in this app's own "press me" colour and doing nothing at all when it
   was pressed. See the note over the deleted `book-edit` in js/book.js. */
```

### The two photographs — the room and the person.

before `.bk-row.bk-wk .bk-v`

```
/* The two photographs — the room and the person. A booking is largely about whether you like the
   look of both, and a card that names them without showing them is a receipt rather than an offer.
   Square, side by side, taped like every other photo on the site. */
```

### `.bk-photos`, `.bk-photos img` AND `.bk-none` WERE HERE — the two square photographs at the head of the booking card.

before `.bk-row.bk-wk .bk-v`

```
/* `.bk-photos`, `.bk-photos img` AND `.bk-none` WERE HERE — the two square photographs at the head
   of the booking card. They were about 180px of height for a picture of a room you had already
   named two rows below, and empty outlines until both were chosen. The small pair on the job stubs
   is `rc-stub-pics` and is styled separately. */
```

### ---------- WHEN, AS A WEEK YOU TICK

before `.bk-row.bk-wk .bk-v`

```
/* ---------- WHEN, AS A WEEK YOU TICK -------------------------------------------------------------
   One row per day, one small button per bookable hour. It replaces three questions — which day,
   what time, how long — because ticking two adjacent hours says all three at once, and ticking a
   second day says a thing three questions could not say at all.

   ONLY THE HOURS SOMEBODY CAN TEACH IN are drawn, so a day the tutor does not work has no row
   rather than a row of refusals. A grid of mostly-disabled buttons is a grid you have to read
   before you can use.
--------------------------------------------------------------------------------------------- */
```

### ---------- SEVEN THUMB-SIZED ROWS IS THREE HUNDRED PIXELS

before `.bk-row.bk-wk .bk-v`

```
/* ---------- SEVEN THUMB-SIZED ROWS IS THREE HUNDRED PIXELS -----------------------------------------
   OPENING THE WEEK DOUBLED THE CARD. Seven rows at a 38px minimum plus their gaps is 298px before
   the wording around it, dropped into the middle of a receipt whose rows are 19px each.

   THE HEIGHT COMES DOWN TO 30, WHICH IS STILL A TARGET. Fourteen hours across a phone makes each
   about 20px wide whatever happens, so the row height is the only dimension there is — and 20×30
   is a comfortable press. 38 was inherited from a square-button era this grid never had.

   AND A CLOSED DAY COLLAPSES. See `stepGrid_`: a day with no open hour keeps its label and its
   greyed boxes, because a missing Wednesday and a Wednesday nobody works are different facts — but
   it does not need a pressable row, because there is nothing on it to press. */
```

### ---------- MEASURED ON A 390px PHONE

before `.bk-row.bk-wk .bk-v`

```
/* ---------- MEASURED ON A 390px PHONE -------------------------------------------------------------
   THE CARD IS 307px WIDE THERE. Take the day label and the gaps and eleven hours share 225px, so a
   cell is 20px across whatever else happens — width is not available and never was. Height is the
   only dimension, and at 30px the week was 222px tall inside a card whose rows are 20px each: the
   single biggest block on the paper by some way.

   24px, WHICH IS 20×24 OF TARGET. Below about 24 a cell stops being reliably pressable at this
   width, so this is the floor rather than a preference — and it takes the week from 222 to 174.

   THE DAY LABEL DROPS TO TWO LETTERS. `Mo Tu We Th Fr Sa Su` is unambiguous where one letter is not
   (T and S are each two days), and the 14px it gives back goes to the cells, which need it more. */
```

### A DAY IS A ROW OF THE CARD.

before `.bk-row.bk-wk .bk-v`

```
/* ==================================================================================================
   A DAY IS A ROW OF THE CARD.

   ASKED FOR AS *"get rid of When and instead have the day names be the field questions. So it
   becomes Monday field Tuesday field Wednesday field."* The week was a block hanging under one row
   and every attempt to put it "in the input column" was a trade: indent it and its left edge lines
   up but its right edge cannot, because eleven pressable cells need 240px and the answer column
   beside three figure tracks is 78px. Four rounds of that, written up either side of this file.

   A DAY IS A QUESTION, so it gets a row. The label column holds `Monday` exactly as it holds
   `Subject`; the answer cell holds the eleven hours. Nothing is nested and nothing is indented,
   which is what makes "the grid is in the input column" true by construction rather than by a rule.

   NO NEW GEOMETRY. `.slot-hours` is the same flex strip it has always been and `.hr` is the same
   cell; what changed is the box it sits in. `weekRows_` marks the row `is-bare`, so the three
   figure tracks go to the answer and the cell measures 17.6px at 390 — the width it had inside the
   old indented block, to the pixel.
================================================================================================== */
```

### NO GUTTER BETWEEN THE NUMBERS AND THE BOXES THEY NAME — the strip is a label on Monday's own cells, and a pixel of air between them reads as two things rather

before `.bk-row.bk-wk .bk-v`

```
/* NO GUTTER BETWEEN THE NUMBERS AND THE BOXES THEY NAME — the strip is a label on Monday's own
   cells, and a pixel of air between them reads as two things rather than one. It was declared 1px
   here and 0 again ninety lines down when the week was made thinner; both were written deliberately
   and the first never applied, which is `.price.faint` for the tenth time and `check-css.js` is
   what said so. One declaration, and the later rule is gone. */
```

### THE HOUR NUMBERS RIDE ON MONDAY.

before `.bk-row.bk-wk .wk-hh`

```
/* THE HOUR NUMBERS RIDE ON MONDAY. One strip for eleven columns rather than one per row — the
   argument `slotHead_` records for taking them out of seventy-seven cells — and inside Monday's own
   answer cell rather than on a row of its own, because a row of its own would need a name, a place
   in `SPINE` and a label column holding nothing. `1 1 0` on each, matching `.hr`, so the numbers sit
   over the columns they name whatever the card's width. */
```

### AND THE WEEK IS THINNER, WHICH IS THREE NUMBERS AND ONE OF THEM IS NOT A CELL.

before `.bk-row.bk-wk`

```
/* ==================================================================================================
   AND THE WEEK IS THINNER, WHICH IS THREE NUMBERS AND ONE OF THEM IS NOT A CELL.

   ASKED FOR AS *"make the grid squares and grid thinner"*. Measured at 390 before touching it: a
   cell was 22.2 x 20 and a day row was 32.8 tall — so TWELVE PIXELS OF EVERY ROW WERE NOT THE
   CONTROL, seven times over, and the week was 199px of a 518px card.

   `align-items: baseline` IS WHERE TEN OF THE TWELVE WENT. `.bk-row` aligns a label's baseline with
   its value's, which is right for a line of text beside a line of text and wrong for a label beside
   a strip of boxes: a grid cell's baseline sits at the bottom of its content box, so the row grew to
   put the day name's baseline there. `center` is what a row of boxes wants, and it costs the other
   rows nothing because they do not have it.

   THE OTHER TWO ARE `.bk-row`'s OWN `.1rem 0`, which is there to keep twelve lines of text apart and
   is not needed between rows whose content already has a 1px gutter of its own.

   ---------- 14px, AND THE REASON TO STOP THERE IS MEASURED RATHER THAN CHOSEN ---------------------
   `.hr`'s FLOOR IS 20px AND ITS NOTE SAYS WHY — *"below about 20px a cell 24px wide stops being
   reliably pressable"*. This goes under it deliberately, on the fourth asking, and `ACCEPTED_TAP`
   carries a smaller finding for it.

   WHAT SETS 14 RATHER THAN 12 IS THE DAY NAME. At 12px the cell stops being the tallest thing in
   the row and `Wednesday`'s own line box becomes the floor: measured, 12px buys **two pixels** at
   390 (109.6 against 111.6) and costs a sixth of the target. Below the label there is nothing left
   to win, which is a better place to stop than a number somebody liked.

   | at 390 | cell | row pitch | the week |
   |---|---|---|---|
   | before | 22.2 x 20 | 32.8 | 199.2px |
   | after  | 23.1 x 14 | 22.8 | 111.6px |

   The card goes 518px to 430px, and the cells got WIDER doing it — a 1px gutter between them rather
   than 2px, which is the same trade the joined-hours bridge already paints into.
================================================================================================== */
```

### ---------- 44% OF THE ANSWER COLUMN, ASKED FOR TWICE AND MEASURED BOTH TIMES

before `.bk-row.bk-wk .bk-v`

```
/* ---------- 44% OF THE ANSWER COLUMN, ASKED FOR TWICE AND MEASURED BOTH TIMES --------------------
   ASKED FOR AS *"i would like the grid to be half as wide"* and then *"can you make the grid even
   slightly thinner"*, and the arithmetic was put in front of the owner before either was written,
   because this is the one measurement in this stylesheet the house style says must not scale.

     full width   320px 18.5px a cell      390px 23.1      768px 24.4
     half         320px  8.8               390px 11.1      768px 11.8
     44%          320px  7.6               390px  9.7      768px 10.3

   AND 44 RATHER THAN 40 BECAUSE THE HOUR NUMBERS BECOME THE FLOOR, which is the same shape of stop
   as the day name on the height axis. A two-digit hour is 6.4px of ink at 320: at 44% its box is
   7.6px, so it has 1.2px either side; at 42% that is 0.9px and at 40% it is 0.5px, which is inside
   the margin between this container's font rendering and a real phone's. Below 44 the thing that
   breaks first is the label, not the target.

   THE HEIGHT AXIS IS SPENT AND WAS RE-MEASURED RATHER THAN QUOTED. At 390 the day name's own line
   box is 14.8px against a 14px cell, so the LABEL already decides the row: asking for a 13px cell
   takes the whole week from 111.7 to 110.7 — one pixel, across seven rows. At 320 the label box is
   12.3px and there are about twelve pixels to be had, on the narrowest phone only. That is why
   "even slightly thinner" was answered on the width.

   `ACCEPTED_TAP` has carried these cells at 18.5 with the arithmetic beside them — eleven fingertips
   need 484px and no phone is that wide — and this takes an accepted compromise well past where a
   wrong tap is rare. The three shapes that give half the width for free were offered with their own
   numbers (five-hour rows 18.6/23.2/24.5, turned on its side 13/16.3/17.2, a shorter span) and the
   squeeze was chosen over all three. It is the owner's card and the owner's call, made with the
   numbers visible; they are written here so it is a decision rather than something nobody measured.

   ONE DECLARATION ON THE CELL, so the hour strip and the numbers above it cannot come out different
   widths — which is the argument `.slot-hh`'s own note makes about a header sized by hand. And the
   LEFT edge does not move: a grid item with an explicit width starts where its track starts, so the
   week still begins at 111.3 with every other answer on the card, which is the thing four rounds of
   this were about.

   AND THE BLOCK WEEK TAKES THE SAME WIDTH, asked for as *"the waitlist grid needs to take from the
   instant class grid. Same width. But there's no individual slots. Just chunks."* It was excluded
   for one commit, on the argument that halving the one grid here that is NOT a compromise answers a
   complaint about the other one — and that argument is about the cell, which survives: three
   columns in 44% is **32.2 / 41.3 / 44.0px wide by 20 tall**, still a real fingertip and still
   three times the hour cell beside it. What it was not about is the two branches of one card
   drawing one control at two widths, which is what somebody swiping between them sees. One
   declaration, both weeks; `blk` goes on carrying the height, which is the difference that is
   still real. */
```

### ---------- AND THE WEEK IS IN THE ANSWER COLUMN, BECAUSE A DAY HAS A MULTIPLIER NOW

before `.bk-row.bk-wk .bk-v`

```
/* ---------- AND THE WEEK IS IN THE ANSWER COLUMN, BECAUSE A DAY HAS A MULTIPLIER NOW -------------
   IT SPANNED `2 / 4` — the answer column and the multiplier column — on the argument that a day row
   could never fill the second. That stopped being true: a day's hours are a `× 3`, and it goes in
   the column that multiplies. Reported as *"can you see how in screenshot i booked 3 hours? there
   should be a 3 hour multiplier in the multiplication column, but i can also see theres no space
   for that. so make the time grid thinner by scale facter 0.5."* Both halves of that are one
   change, and the ask is the reason rather than the size.

   WHAT IT COSTS IS MEASURED AND IS THE LARGEST COMPROMISE ON `ACCEPTED_TAP`'S LIST. The answer
   track is **56.3 / 75.3 / 80.9px** at 320 / 390 / 768, so ten cells with their 1px gutters are
   **4.7 / 6.6 / 7.2px** each, down from 8.97 / 11.69 / 12.48 — a fingertip covers about six columns
   at 320. That is 0.53× at every width, which is as near the half that was asked for as a column
   edge lands, and the owner's *"i dont care if its really thin now"* is the authority for it.
   `2 / 4` is the one declaration that puts it back, and it takes the `× 3` with it.

   THE LEFT EDGE HAS NOT MOVED, which is the half four rounds of this were about: the strip starts
   where every other answer on the card starts, and now it ends where every other answer ends too.
   The hour numbers could not survive it and say their span instead — see `.wk-hh.wk-rule`. */
```

### ---------- AND THE HOUR COUNT MUST NOT BE THE TALLEST THING ON THE ROW

before `.bk-row.bk-wk .bk-m, .bk-row:has(.bk-dates) .bk-m`

```
/* ---------- AND THE HOUR COUNT MUST NOT BE THE TALLEST THING ON THE ROW ---------------------------
   `.bk-m` IS `--mono` AT THE ROW'S OWN SIZE, so its line box is 14.8px at 320 against a 14px cell —
   which made every day row that had a figure a pixel taller than one that did not, and took the
   card from 10px past its pane at 320 to 18. Measured before and after: seven rows, eight pixels.

   THE CELL IS WHAT SETS THE HEIGHT HERE, which is the same argument as the tick rows one block
   down: the strip is the content of a day row and the figure beside it is a caption on it. */
```

### ---------- AND THE DATES ROW IS THE SAME SHAPE FOR THE SAME REASON

before `.bk-row.bk-wk .bk-m, .bk-row:has(.bk-dates) .bk-m`

```
/* ---------- AND THE DATES ROW IS THE SAME SHAPE FOR THE SAME REASON -----------------------------
   `× 6` IS A CAPTION ON A LIST OF DATES and the list is what sets the row's height — it wraps to
   three or four lines. Measured, the mono line box added ONE pixel at 320 and 390 and TWO at 768, on
   a receipt already listing every date; a figure that changes the height of the row it is counting is
   the fault the day rows paid eight pixels for one commit ago, and this is that rule's second
   subject rather than a new one. */
```

### AND MONDAY'S NAME SITS BESIDE MONDAY'S HOURS.

before `.bk-row.bk-wk:has(.wk-hh) .bk-k`

```
/* AND MONDAY'S NAME SITS BESIDE MONDAY'S HOURS. The hour strip makes the first day's row taller than
   the rest, so a top-aligned label read as the name of the NUMBERS rather than of the boxes under
   them — the one row of the seven where the eye could pair the wrong two things. `end` puts it on
   the same line as its own cells; every other day row has nothing above its strip, so the rule is
   written for the row that has, off `:has` rather than a class the builder has to remember. */
```

### `.slot-row.is-shut .hr` WAS HERE, the thin row `weekGrid_` drew for a day with nothing open.

before `.slot-day`

```
/* `.slot-row.is-shut .hr` WAS HERE, the thin row `weekGrid_` drew for a day with nothing open. The
   tutor's card was the only week that had one, and since 10 Oct it leaves that day out instead —
   *"no need to display monday if they dont have any hours on monday"* (docs/history/325). The form's
   thin day is `.bk-row.bk-wk.is-shut`, above, and is untouched. */
```

### THIN AND TALL. Fourteen hours at a 38px square is two lines on any phone, and a day that wraps stops reading as a day.

before `.slot-hours`

```
/* THIN AND TALL. Fourteen hours at a 38px square is two lines on any phone, and a day that wraps
   stops reading as a day. They share the row instead: each takes an equal slice of whatever is
   left, so a week is seven rows of one line each.
   The HEIGHT keeps the touch target — a box 22px wide and 38px tall is as easy to hit as a square
   one, because a thumb landing on a row of them can only be wrong about which COLUMN it hit, and
   the columns are what the eye is already aiming at. */
```

### ---------- THE HOUR, ONCE, ABOVE THE COLUMN IT NAMES

before `.slot-hh`

```
/* ---------- THE HOUR, ONCE, ABOVE THE COLUMN IT NAMES ---------------------------------------------
   THE HEADER IS AN ORDINARY `.slot-row` holding an empty `.slot-day` and eleven `.slot-hh`, so it
   sits in the same flex box with the same gap and each label takes the same `flex: 1 1 0` slice its
   column does. THE COLUMNS LINE UP BY CONSTRUCTION rather than by two sets of numbers that could
   drift — a header sized by hand would be a second description of the grid's widths, which is the
   fault this stylesheet already records under `.rc-total` and `.price.faint`.

   QUIETER THAN A CELL, because it is a label on a column and the cells are the thing being read. */
```

### ---------- AND WHERE A COLUMN IS NARROWER THAN ITS OWN LABEL, THE STRIP SAYS ITS SPAN

before `.wk-hh.wk-rule`

```
/* ---------- AND WHERE A COLUMN IS NARROWER THAN ITS OWN LABEL, THE STRIP SAYS ITS SPAN -------------
   `9 – 18` INSTEAD OF TEN NUMERALS, on the hour weeks only. The reason is measured and is written
   over the builder in `book.js`: a cell in the answer column is 4.7px at 320 and `18` is about
   7.4px of ink here, so every two-digit hour wrapped and the header doubled in height to carry
   numbers nobody could read. The block week keeps its three names, because a block is a third of
   the strip rather than a tenth.

   `nowrap` IS THE LOAD-BEARING HALF. It is one string in a box narrower than the ten cells it names
   at no width in this app, but the rule that put it here was a wrap, and leaving the default in
   would be the same fault waiting on a longer span. */
```

### A BUTTON IN THE BOOKER, A LABEL IN THE FORM.

before `.hr`

```
/* A BUTTON IN THE BOOKER, A LABEL IN THE FORM. The booker's grid is answered by pressing; the
   availability form's is answered by ticking, because it saves with every other field and a
   checkbox is what `me-save` already knows how to read. Same box either way — it is the same
   question and it should not look like two. */
```

### IN `em` SO IT COMES DOWN WITH THE ROOT.

in `.hr`

```
/* IN `em` SO IT COMES DOWN WITH THE ROOT. It was pinned in px, which meant shrinking the app's
     scale made every row narrower while the week stayed exactly as tall — the one block that most
     needed to move was the one that could not. The floor stays: below about 20px a cell 24px wide
     stops being reliably pressable. */
```

### SMALLER THAN THE PAPER, and in `em` so it comes down with the app's scale.

in `.hr`

```
/* SMALLER THAN THE PAPER, and in `em` so it comes down with the app's scale. A grid of numbers is
     scanned rather than read — you are looking for the shape of the ticked boxes, not reading eleven
     figures — so it can sit below the size the rest of the card needs. */
```

### ---------- AND THE WAITING LIST'S THREE BLOCKS GET A REAL FINGERTIP

before `.bk-row.bk-wk .hr.blk`

```
/* ---------- AND THE WAITING LIST'S THREE BLOCKS GET A REAL FINGERTIP -------------------------------
   `ACCEPTED_TAP` CARRIES THE HOUR CELLS AT 20px WITH THE ARITHMETIC BESIDE THEM: eleven 44px cells
   need 484px and no phone is that wide, so that grid pays a floor rather than the rule. THREE need
   132px against about 280, so this one can pay the rule — and the one grid in this app that could
   not have a proper target is not the one somebody taps seven times to say when they are free.

   IT IS THE ONLY DIFFERENCE. Everything else — the day letters, the header row, the gold fill, the
   bar that joins Monday morning to Monday afternoon — is `.hr`'s, because it is the same control
   answering the same kind of question. `weekGrid_`'s own note says what differs between the grids
   in this app is the cell, and here it is one declaration of it. */
```

### NAMED THROUGH THE ROW, because a day is a row of the card now and `.bk-row.bk-wk .hr` is three classes deep — a bare `.hr.blk` is two and lost, so the blocks

before `.bk-row.bk-wk .hr.blk`

```
/* NAMED THROUGH THE ROW, because a day is a row of the card now and `.bk-row.bk-wk .hr` is three
   classes deep — a bare `.hr.blk` is two and lost, so the blocks silently took the hour week's 14px
   the day that grid was made thinner. Four beats three. A SAVED waiting list is five
   (`.rc.is-done .bk-row.bk-wk .hr`) and beats this in turn, which is right: a receipt's week is read
   rather than pressed. */
```

### ---------- A GRID NOBODY CAN PRESS DOES NOT NEED A THUMB'S WORTH OF HEIGHT

before `.rc.is-done .bk-row.bk-wk .hr`

```
/* ---------- A GRID NOBODY CAN PRESS DOES NOT NEED A THUMB'S WORTH OF HEIGHT ------------------------
   `min-height: max(20px, 1.55em)` IS A FLOOR FOR FINGERS. Below about 20px a cell stops being
   reliably pressable, so the form pays it seven times over — and the receipt was paying it too,
   for cells that are `disabled` and will never be touched. Seven rows at twenty pixels each is a
   fifth of the document spent on a control that is not one.

   READ RATHER THAN PRESSED, so it is sized to be read: the shape of the lit cells is what somebody
   is looking for, and that survives being small far better than a word would. The gaps come in with
   it, because a tight grid reads as one block and a loose one reads as seven rows.

   ONLY ON THE SAVED DOCUMENT. `.is-done` is what marks a receipt as a record rather than a form —
   the same flag that turns the cursor off — so the form keeps every pixel of its press target. */
```

### ---------- A CELL WITH NOTHING IN IT HAS TO STATE ITS OWN HEIGHT

before `.rc.is-done .bk-row.bk-wk .hr`

```
/* ---------- A CELL WITH NOTHING IN IT HAS TO STATE ITS OWN HEIGHT --------------------------------
   `min-height: 0` WAS RIGHT WHILE EVERY CELL HELD A DIGIT. The digit set the height and this line
   only said "do not pay a fingertip's floor for something nobody presses". With the hours moved to
   one header row the cells are empty, so `0` became the actual height: measured, 16.16px a cell at
   HEAD and 2.84px after — seven rows of hairline, with the booked hours floating over nothing.

   SO THE HEIGHT IS DECLARED RATHER THAN INHERITED FROM CONTENT THAT NO LONGER EXISTS. That is the
   move this repository keeps making: replace a property that was only true by accident of
   interaction with one a reader can check. Smaller than the form's 20px floor, because a receipt's
   grid is read and not pressed, and large enough that a lit hour is a bar rather than a line. */
```

### ---------- AND IT SAYS SO BY SPECIFICITY RATHER THAN BY SITTING LOWER IN THE FILE

before `.rc.is-done .bk-row.bk-wk .hr`

```
/* ---------- AND IT SAYS SO BY SPECIFICITY RATHER THAN BY SITTING LOWER IN THE FILE ----------------
   `.rc.is-done .hr` AND `.bk-row.bk-wk .hr` ARE BOTH THREE CLASSES DEEP, so which height a receipt's
   cell got was decided by which rule happened to be written later — `check/cascade.js` named it on
   seventy elements the moment the receipt started drawing the form's own day rows. The answer was
   right and the reason was an accident of ordering, which is the shape this stylesheet has now been
   caught in ten times.

   NAMING THE ROW MAKES IT FIVE, and that also settles the shut day without a second rule:
   `.bk-row.bk-wk.is-shut .hr` is four, so an 11px Wednesday-nobody-works stopped overruling this
   and standing a pixel and a half taller than the days either side of it on a document nobody can
   press. That is what the deleted `.rc.is-done .slot-row.is-shut .hr` was for, and it is covered
   here rather than restated. */
```

### ---------- AND SIX RULES UNDER THIS ONE WERE COMPACTING A GRID THE RECEIPT NO LONGER DRAWS

before `.bk-row.is-blank`

```
/* ---------- AND SIX RULES UNDER THIS ONE WERE COMPACTING A GRID THE RECEIPT NO LONGER DRAWS -------
   `.slot-grid`, `.slot-row`, `.slot-day`, `.slot-row.is-shut .hr` and `.bk-open > p` were the
   receipt's copy of the week when the week was a block hanging under one row. It is seven `.bk-wk`
   day rows now — the same rows the form draws — so `jobGrid_` is gone and none of those five
   classes can appear inside `.rc.is-done` at all. `weekGrid_` still builds them, for `availGrid_`
   in `me.js`, which is on the settings column and has never been inside a receipt.

   AND `.rc.is-done .slot-hours { gap: 1px }` WENT WITH THEM FOR A SHARPER REASON. `.bk-row.bk-wk
   .slot-hours` says the same thing three classes deep, so the two tied on specificity and ORDER
   ALONE decided it — `check/cascade.js` named it on seven elements. They agreed about the value, so
   nothing was ever wrong on screen; what was wrong is that a rule written for the form was being
   overruled by a rule written for the receipt, and the day the two stop agreeing the loser is
   whichever is further up the file. The day rows compact both documents at once now. */
```

### ---------- A ROW THAT SAYS NOTHING TAKES THE ROOM OF ONE THAT DOES

before `.bk-row.is-blank`

```
/* ---------- A ROW THAT SAYS NOTHING TAKES THE ROOM OF ONE THAT DOES --------------------------------
   TWENTY-SEVEN ROWS AND SIX OF THEM ARE A DASH on any given booking — Class, Extra subj., When
   free, Split, Child, Note. They stay, because a document read by position has to keep its
   positions; that was the whole argument for putting them on both. But a row with nothing in it
   does not need the height of a row with a figure, a multiplier and a running total in it.

   HALF THE PADDING AND A LIGHTER DASH. It still holds its place in the sequence — you can still
   count down to `Tutor` — and it stops competing with the rows that have something to say. Six
   rows at half height is most of a phone screen's worth of card back. */
```

### ---------- AND TWO OF THEM COST TWICE WHAT A BLANK ROW COSTS

before `.bk-row.is-blank .bk-k, .bk-row.is-blank .bk-v`

```
/* ---------- AND TWO OF THEM COST TWICE WHAT A BLANK ROW COSTS -------------------------------------
   MEASURED ON THE EMPTY FORM: thirteen rows are a dash, eleven of them 15px and `Extra subj.` and
   `Per session` 30px — because those two are the only labels one character too long for a 6.2em
   column, so they break in two. Twice the height of a row with nothing in it, on the two rows with
   nothing in it.

   THE NOTE OVER `SPINE_EXTRA` RECORDS THIS FAULT AND ITS FIX — four labels were shortened for
   exactly this reason — and it came back on the two that are still eleven characters. Shortening
   again would be a third round of the same hand-repair, which is what this repository keeps
   finding: a rule applied by hand is not a rule.

   SO THE RULE IS THE FIX. A blank row's value column holds one dash, so there is nothing beside the
   label to make room for and no reason for it to wrap — at any length, for any label somebody adds
   later. A row that HAS a value keeps the wrap, because there the two columns really are competing.

   AND THE LEADING COMES DOWN WITH IT. 1.35 is a line for reading; a dash is not read, it is counted
   past on the way to the row below. Thirteen rows at 12px instead of 15. */
```

### ---------- AND A STAGE ROW TAKES THE SAME LEADING, FOR THE SAME REASON

before `.bk-row:has(.bk-tick) .bk-k, .bk-row:has(.bk-tick) .bk-v`

```
/* ---------- AND A STAGE ROW TAKES THE SAME LEADING, FOR THE SAME REASON ------------------------
   1.35 IS A LINE FOR READING AND A TICK IS NOT READ, it is scanned down — which is what the five
   of them are for. At the ordinary 19.6px a stage row is a line of prose carrying a 12px mark, and
   five of those replaced the three rows `Stage`, `Status` and `Asked for` used to be on a card
   `check/ui.js` records arriving with **three pixels of headroom at 768**. It said so on the first
   run after the ticks went in: *".pane holding pane hides 4px below its own fold"* on the
   waiting-list branch, at 768 and 1280.

   ASKED OF `:has(.bk-tick)` RATHER THAN A CLASS ON THE ROW, because the row carrying a tick is
   exactly the row a tick was put in — a flag would be a second thing for `receiptRow` to remember
   and a second thing to go stale. */
```

### ---------- AND THE PADDING GOES WITH IT, WHICH IS WHAT `Applied for` HAD TO BE PAID FOR OUT OF

before `.bk-row:has(.bk-tick)`

```
/* ---------- AND THE PADDING GOES WITH IT, WHICH IS WHAT `Applied for` HAD TO BE PAID FOR OUT OF ---
   A SIXTH STAGE WENT IN ON REQUEST — *"add \"applied for\" line under requested, above accepted"* —
   and `check/ui.js` named it the same afternoon: `.pane holding rc hides 13px below its own fold`,
   at 768 and 1280, on the session receipt and the basket. One more row at ~13px on a card the note
   above records arriving with three pixels of headroom.

   `.bk-row`'s `.1rem 0` IS THE GAP BETWEEN TWELVE LINES OF PROSE, and the argument above is that a
   column of ticks is not twelve lines of prose: it is one block, scanned down, and what separates
   its rows is the boxes themselves rather than air. Six rows × 6.2px is 37px — three times what the
   new row costs, so the block is shorter with the extra stage in it than it was with five.

   NOT A FIXED NUMBER TRIMMED SOMEWHERE ELSE. The row that made the card too tall is the row that
   paid for it, which is the only version of this that stays true when a seventh stage arrives. */
```

### ---------- AND THE LABEL RECEDES WITH THE VALUE

before `.bk-row.is-blank .bk-k`

```
/* ---------- AND THE LABEL RECEDES WITH THE VALUE -------------------------------------------------
   TWENTY-EIGHT ROWS, TEN OF THEM QUESTIONS. The value already dims on a blank row and the label did
   not, so `Weeks left` — a fact that does not exist until a term is chosen — was set in exactly the
   ink of `Level`, which is the next thing somebody has to answer. A form where what you must do
   looks like what follows from it is a form you read twice.

   ONE STEP QUIETER, NOT INVISIBLE. The row is still there and still says what it is, which is the
   whole argument `SPINE` makes for drawing it at all: a document whose shape changes with its
   contents cannot be read at a glance. This only stops it competing. */
```

### ---------- TWO HOURS IN A ROW ARE ONE SESSION, SO THEY ARE ONE BAR

before `.hr.on + .hr.on`

```
/* ---------- TWO HOURS IN A ROW ARE ONE SESSION, SO THEY ARE ONE BAR --------------------------------
   THE INSTRUCTION ABOVE THE GRID SAYS IT IN WORDS — *"two together is a two-hour session; another
   day is another session"* — and the picture said the opposite: two gold squares with a 2px gutter
   between them, which is two of something. A grid you read by shape should not need a sentence to
   tell you what the shape means.

   THE GAP IS BRIDGED RATHER THAN CLOSED, and that distinction is the whole of it. `.hr` is
   `flex: 1 1 0`, so pulling a cell 2px left with a negative margin hands 2px of free space back to
   eleven flex items and every column after the run drifts out of line with the header above it —
   which is the one thing the header is for. A 2px block painted into the gutter changes no layout
   at all: the columns are where they were, to the pixel.

   AND THE INNER CORNERS SQUARE OFF, because a rounded end in the middle of a bar reads as a seam.
   Only the ends of a run keep their radius, so a single ticked hour is unchanged. This is on the
   receipt too, where the booked run is the one thing on that grid. */
```

### ---------- THE LEFT CELL'S CORNERS ARE SQUARED BY THE BRIDGE, NOT BY A `:has()`

before `.hr.on + .hr.on::before`

```
/* ---------- THE LEFT CELL'S CORNERS ARE SQUARED BY THE BRIDGE, NOT BY A `:has()` -----------------
   THIS WAS `.hr.on:has(+ .hr.on)`, and that one corner-squaring rule was the freeze at the end of
   every swipe in the app. `on` inside a `:has()` with a sibling combinator makes Chrome invalidate
   the WHOLE DOCUMENT whenever any element anywhere gains or loses the class `on` — and `placeGrid`
   moves `on` onto the column and the page in front at every page turn and every column change.
   Measured from the trace (5 Oct): every release restyled all 4,381–5,054 elements, 53–64ms of
   CPU at 1x for a page turn, against 261–272 elements and 3–5ms with this rule gone. Nothing about
   it said navigation, which is why nothing measuring navigation ever looked at it.

   THE SECOND CELL ALREADY PAINTS THE BRIDGE, so it paints over the first cell's two right-hand
   corners too: the gold block below starts `--r-sm` further left, inside the left cell, and the
   rounding there is covered by the same gold it was rounding off. Identical on screen, and a run
   of hours is still squared only on its inside corners. `check/swipe.js` holds the cost: a page
   turn restyles fewer than a thousand elements. */
```

### ---------- AND THE BRIDGE IS PAINTED BY THE SECOND CELL, LEFTWARDS

before `.hr.on + .hr.on::before`

```
/* ---------- AND THE BRIDGE IS PAINTED BY THE SECOND CELL, LEFTWARDS ------------------------------
   THE FIRST VERSION HUNG IT OFF THE LEFT CELL, reaching `right: -3px` into the gutter — and an
   absolutely positioned child that sticks out to the RIGHT pushes its ancestor's `scrollWidth`, so
   `check/ui.js` reported `button.hr overflows by 3px` at eight combinations. Nothing was clipped
   and nothing looked wrong; the box had simply started scrolling sideways when it was not told it
   could, which is the exact question that check asks.

   PAINTED THE OTHER WAY IT IS THE SAME THREE PIXELS OF GOLD IN THE SAME GUTTER, and overflow to
   the LEFT does not enter `scrollWidth` at all. A real asymmetry in the platform rather than a
   trick: the check goes on measuring what it measured, and the picture is identical. */
```

### NOT AVAILABLE — greyed, never removed.

before `.hr.shut`

```
/* NOT AVAILABLE — greyed, never removed. A grid that changes shape as you choose things cannot be
   read: you cannot tell a day the tutor does not work from one that was never offered, and the row
   moving under your thumb as you pick a venue is the fault the dropdowns were fixed for. */
```

### ---------- IT SAID `width: 0; height: 0` AND THE ELEMENT MEASURED 24 × 44

before `.hr input`

```
/* ---------- IT SAID `width: 0; height: 0` AND THE ELEMENT MEASURED 24 × 44 -----------------------
   `input, select, textarea` up at line 535 sets `min-height: max(44px, 2.9rem)` and
   `padding: .7rem .75rem` on every input in this stylesheet, and NEITHER of those is `width` or
   `height`: a `min-height` clamps a height of zero back up to 44, and `box-sizing: border-box`
   will not take a width below its own padding. So this rule read as "take no room" and the box
   was a fingertip tall and twenty-four wide, invisible, for as long as it has existed.

   NOTHING COULD SEE IT UNTIL THE BRIDGE ARRIVED. It is `position: absolute`, so it was laid out
   against whatever positioned ancestor it found — a card or a pane, wide enough to swallow it.
   Giving `.hr` `position: relative` for the joined-bar bridge made the CELL that ancestor, and
   `check/ui.js` reported `label.hr overflows by 4px` at 320px the first run after a tutor's grid
   was put on the screen. The `.price.faint` shape again: a declaration that reads as a decision
   and behaves as nothing, found the moment something finally measured it.

   THE THREE PROPERTIES THAT WERE MISSING are the three the global rule sets. */
```

### ---------- A WIDGET THAT IS THE WHOLE PAGE

before `.widget-full`

```
/* ---------- A WIDGET THAT IS THE WHOLE PAGE ------------------------------------------------------
   Choose Tools or Games and there is nothing else on the list, so each one gets a screen of its
   own and is already running — a game you have to open is not a game.

   These are the rules that used to be here for the Tools and Arcade tabs, back for the case they
   were always right for: ONE widget, filling ONE screen. The difference is the selector. They were
   `.page > .card`, which matched any card that happened to be a page's first child — and when the
   widgets moved out, the credits card on Find inherited it and pushed everything below it off the
   bottom. `.widget-full` matches only a widget that IS the page, which is a thing that cannot
   happen by accident. */
```

### A WIDGET IS AS TALL AS IT NEEDS TO BE.

before `.widget-full`

```
/* A WIDGET IS AS TALL AS IT NEEDS TO BE. These grew to fill the page, which was right when a
   widget WAS the screen — and the pane is now as tall as what is on it, so a growing widget grows
   the pane and puts a keypad in the middle of an empty field. Nothing here needs the height: a
   board is square from its own width, a game is 3:2 from its own width, a keypad is as tall as its
   rows. */
```

### The layout of the clock is set ONCE, in the LED block near the foot of this file — it is a grid there, so that the lit numerals and the dead segments behind

before `.widget-full #timer-display`

```
/* The layout of the clock is set ONCE, in the LED block near the foot of this file — it is a grid
   there, so that the lit numerals and the dead segments behind them share one cell. This rule set
   `display: flex` and a margin that both lost to it. */
```

### SQUARE, and centred in whatever is left — a board that stretched would be a board where a knight moves further sideways than forwards.

before `.widget-full .chess`

```
/* SQUARE, and centred in whatever is left — a board that stretched would be a board where a knight
   moves further sideways than forwards. `width: 100%`, never `auto`: a grid with an auto width in
   a flex column has nothing to measure against and collapses, and the pieces are sized in `cqw`,
   a fraction of that width, so they go with it. */
```

### A SIDE-SCROLLER NEEDS WIDTH, NOT HEIGHT.

before `.widget-full .flappy`

```
/* A SIDE-SCROLLER NEEDS WIDTH, NOT HEIGHT. Filling the page gives it a portrait box where pipes
   arrive with no room to react to them. It keeps its shape and floats in the middle, like the
   board. The canvas ELEMENT is resized in script.js to match: a canvas stretched by CSS alone
   draws at its old resolution, so everything blurs and the collisions stop matching what you see. */
```

### THE REEL STATES ITS OWN SIZE, like the board and the game either side of it.

before `.widget-full .feed`

```
/* THE REEL STATES ITS OWN SIZE, like the board and the game either side of it. This said
   `flex: 1 1 auto; aspect-ratio: auto` — take everything going, and never mind the ratio — which
   was right when a widget WAS the page and the card stretched to the screen. That stretch is gone
   (see the note by `.widget-full > .card`), so what was left was a box told to fill a parent that
   no longer grows, with its ratio removed: nothing to give it height. And EVERY part of a reel is
   absolutely positioned inside it, so the contents could not give it height either. The card ended
   at the sub-heading and the reel was a nought-pixel strip under it.
   THE RATIO IS THE HEIGHT NOW, 9/16 from the base rule, exactly as the board is square from its own
   width. `max-height` is the one thing a ratio cannot know: a 9/16 box off a full-width card is
   taller than a short phone, and the pane behind a widget clips rather than scrolls. */
```

### ---------- THE FIGURE, AND THE THINGS IT WEARS

before `.av-wrap`

```
/* ---------- THE FIGURE, AND THE THINGS IT WEARS ---------------------------------------------------
   Drawn, not photographed — so it costs nothing to load, never 404s, and is the same on every
   phone. The one visual on this site that belongs to the person rather than to the business.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE WARDROBE IS ONE CARD, SO EVERY PART OF IT IS A LINE

before `.av-top`

```
/* ---------- THE WARDROBE IS ONE CARD, SO EVERY PART OF IT IS A LINE ---------------------------------
   *"the avatar bit is split into like 4 widgets. should just be 1. make things smaller to fit on a
   screen if need be."* The arithmetic is over `wardrobeCard_` in me.js. Every line is a label column
   and a strip; the label column is sized for `SHOULDERS`, the longest slot name, at this size.
   `.av-slot` and `.av-name` went with the pages — a block per slot with its name above it, and each
   option's name under its drawing. */
```

### A DRAWING AND NOTHING ELSE, on a 29px square — six to a row fits the strip of a 320px card.

before `.av-opts`

```
/* A DRAWING AND NOTHING ELSE, on a 29px square — six to a row fits the strip of a 320px card. The
   name is the button's `aria-label` and `title`; the drawing is what anybody reads, and a dropdown of
   names would ask somebody to know what "goggles" looks like before choosing it. `auto-fill` WRAPS
   rather than scrolling sideways, so a seventh hairstyle added from the shop tab is a second row
   rather than a hidden one. */
```

### NOT YOURS YET. Dimmed rather than removed, and it says what it would take — a wardrobe showing only what you own tells you nothing about what is next, which is

before `.av-opt.locked > :not(.av-why)`

```
/* NOT YOURS YET. Dimmed rather than removed, and it says what it would take — a wardrobe showing
   only what you own tells you nothing about what is next, which is the entire point of a level.
   A PILL ACROSS ITS FOOT rather than a line under it, because there is no line under a 29px square;
   its full sentence is in the button's `aria-label`. */
```

### ---------- WHEN I CAN TEACH, AS A TIDY WEEK

before `.me-week-say`

```
/* ---------- WHEN I CAN TEACH, AS A TIDY WEEK ---------------------------------------------------------
   *"refine availability bit it looks weird, like scruffy."* The note over `availGrid_` in me.js says
   what was scruffy; this is the shape instead. A GRID, not a flex row, for both the header and the
   hours, so the numbers and the cells are one set of columns by construction — `--hours` is the
   count the builder already knows. SQUARE CELLS, because a week is read by its shape and a column
   of 19 by 20 rectangles has no shape. Days in the dim ink the card's other labels use and in their
   own case (`Mon`), because capitals at this size read as a code rather than a word.
   The booking week and the receipt are untouched: `.me-week` is on this card and the Tools widget
   that draws the same grid, and nowhere else. */
```

### A WIDGET IS AN OBJECT, AND AN OBJECT HAS AN EDGE

before `.widget-full > .card`

```
/* ==================================================================================================
   A WIDGET IS AN OBJECT, AND AN OBJECT HAS AN EDGE

   THE FAULT UNDERNEATH ALL OF THIS: `.card` has `background: none` and `border: 0`. A card is not
   a surface anywhere in this app — every "card" anybody has ever seen is the PANE's glass showing
   through behind it. That is fine for a list of cards, which is what the class was written for.

   It is not fine for a widget. A widget is one object filling one pane, so the instant anything
   makes that pane transparent — or the pane measures itself before a canvas has drawn — the widget
   has no edge at all and spills into the black. Which is what a calendar with no calendar round it
   looks like.

   So a widget carries its own surface, always, whatever the pane does. Everything below is a SKIN
   over that surface rather than a replacement for it, which means a skin that fails to match still
   leaves an object with an edge instead of a hole.
================================================================================================== */
```

### AND IT MAY NOT GROW PAST ITS PANE.

before `.widget-full`

```
/* AND IT MAY NOT GROW PAST ITS PANE. A canvas, a board and a map have no size until they have
   drawn, so a pane measured before that is the wrong size and a widget inside it had nothing
   stopping it. A floor so there is always an object, a ceiling so it always fits the cell.

   ON EVERY PAGE OF THIS SCREEN, not only the ones with a widget on them. Find blanks the pages you
   are far from, and a blanked pane asked for `:has(.widget-full)` no longer matches it — so it
   lost its floor, measured zero, and the grid spaced it out as though it were a whole screen tall.
   That is why the tools and games sat miles apart while the posts sat close. The floor is a fact
   about the page, not about what happens to be on it at this instant. */
```

### THE CARD IS THE CARD, not something floating in the middle of one.

before `.widget-full`

```
/* THE CARD IS THE CARD, not something floating in the middle of one.

   A short widget used to sit centred in a full-height pane. Every card was then a different size,
   so the space you could SEE between one card and the next depended on how tall each happened to
   be — which is precisely the thing the fixed step was meant to end. The step was fixed; the cards
   were not, so the gaps were not either.

   The widget fills its pane, so the card is always the same 90% of the screen in both directions
   and the gap between any two is always the 16px the grid puts there. What is ON the card centres
   inside it, which is where a short thing should be short. */
```

### A WIDGET IS AS TALL AS IT IS.

before `.widget-full`

```
/* A WIDGET IS AS TALL AS IT IS. It filled its pane while panes were a fixed height; now the pane
   is as tall as the widget, so making the widget fill the pane would be each of them asking the
   other how big to be. The widget states its size and the pane follows it — which is the same way
   round as a post and its pane, so there is one rule on this screen rather than two. */
```

### NO PADDING, and none rather than a little:

in `.pane:has(> .widget-full)`

```
/* NO PADDING, and none rather than a little: the pane's own is 1rem at the top and 1.25rem at
     the bottom, so anything inside it sat a few pixels high of centre. With the card filling the
     pane there is nothing left to pad — the card IS the cell. */
```

### WIDGETS THAT ARE OBJECTS, NOT CARDS The pane is frosted glass because most of what sits on it is CONTENT — a post, a receipt, a list — and glass says

before `.widget-full:has(.chess) .chess`

```
/* ==================================================================================================
   WIDGETS THAT ARE OBJECTS, NOT CARDS

   The pane is frosted glass because most of what sits on it is CONTENT — a post, a receipt, a list
   — and glass says "this is a surface something is written on". Four of these are not content. A
   chessboard, a calculator, a calendar and a handheld game are THINGS, and a thing floating inside
   a sheet of glass reads as a picture of the thing rather than one you can touch.

   So each takes over its own pane. Same mechanism as the receipts above: `:has()` asks what is on
   the pane and the pane steps back, so nothing has to be tagged and no JavaScript is involved.

   A browser without `:has()` keeps the glass. Everything still works and still reads, which is the
   right way for decoration to fail.
================================================================================================== */
```

### ---------- THE CALCULATOR IS AN INSTRUMENT

before `.widget-full.solid > .card`

```
/* ---------- THE CALCULATOR IS AN INSTRUMENT -----------------------------------------------------
   It was already `solid`, which turned the glass into a dark case. What it was not was SHAPED like
   a calculator: it filled whatever width the pane had, so on a wide phone it was a keypad stretched
   across the screen. A calculator is narrow and upright, and it is held.
--------------------------------------------------------------------------------------------- */
```

### NO CAP ON THE CASE — narrowing a calculator was the right instinct in the wrong place:

before `.widget-full.solid:has(.mc-display) .mc-grid, .widget-full.solid:has(.mc-display) .mc-display`

```
/* NO CAP ON THE CASE — narrowing a calculator was the right instinct in the wrong place: it made
   this one card a different width from every other, on a screen whose whole point is that they are
   all the same. The KEYS are what wanted narrowing, so they are what is narrowed. */
```

### ---------- THE CALENDAR IS PAPER, ON A WIRE

before `.widget-full:has(.cal-head) > .card`

```
/* ---------- THE CALENDAR IS PAPER, ON A WIRE -----------------------------------------------------
   A wall calendar: white paper, a bound top edge, and the rings the pages hang from. The glass goes
   entirely — paper on glass is two surfaces where there is one object.

   The binding is drawn rather than pictured. A repeating gradient makes the wire, and two rules
   make the strip it is punched through; nothing here is an image, so it costs nothing and scales to
   any width.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE CALENDAR IS PAPER, AND PAPER IS NOT THIS APP'S PALETTE

before `.widget-full:has(.cal-head) > .card`

```
/* ---------- THE CALENDAR IS PAPER, AND PAPER IS NOT THIS APP'S PALETTE ---------------------------
   SIX WARM LITERALS ACROSS SIX RULES — cream, ink, the punched strip, two greys for the wire, and a
   muted ink for the arrows. They are deliberate: the whole card is pretending to be a paper
   calendar on a wire binding, and the app is black and gold. Swapping them for `--bg` and `--ink`
   would delete the idea rather than tidy it.

   NAMED HERE FOR THE SAME REASON AS THE CHESS BOARD: six literals spread over six rules means
   "warm the paper up" is a search rather than an edit, and nothing in the file says which greys
   belong to the wire and which to the page. Scoped to the card, so the names exist exactly where
   the paper does. */
```

### ---------- THE HANDHELD, AND WHY IT IS NOT HERE ANY MORE

before `.board`

```
/* ---------- THE HANDHELD, AND WHY IT IS NOT HERE ANY MORE ---------------------------------------
   ABOUT THIRTY LINES STOOD HERE: a charcoal shell, a bezel deeper at the foot than at the head, a
   power light to the left of the panel, a line of tiny type reading DOT MATRIX · @family., and a
   raked speaker grille. Every cue was on the real object and none of them was a control that did
   nothing, which is why it worked.

   IT WENT WHEN THE PANEL DID, AND ITS OWN ARGUMENT IS WHAT DECIDED THAT. It said, in as many
   words, that "a shell round a sky-blue game is a costume, while a shell round an olive panel is
   the object itself" — so the moment the screen became a sky again (asked for as "make it look
   more like flappy bird. blue scky green pipes and the bird"; see the palette in `initFlappy`) the
   case was the fancy dress its own note had refused. Keeping it would have been a Game Boy bezel
   with a power light and a maker's mark around somebody else's game.

   SO THE CARD IS AN ORDINARY WIDGET, like the chess board and the maze beside it, and nothing here
   retones its heading, its rows, its note or its board any more — all four go back to the app's own
   tokens, which is what every other game in this column already uses. The one thing kept is the
   screen: see `.flappy` under "TIMES TABLES AND FLAPPY", which carries a hairline frame so the sky
   reads as a picture rather than as a coloured rectangle in a card. */
```

### ---------- THE HIGH SCORES

before `.board`

```
/* ---------- THE HIGH SCORES ------------------------------------------------------------------------
   TWO GAMES, ONE BOARD, AND IT SITS INSIDE WHICHEVER CARD DREW IT — so it borrows that card's own
   row colours rather than declaring a second set. The flappy card retones `.row .k` and `.row .v`
   for its dark shell and the times-table card does not; a board with colours of its own would look
   right in one of them and pasted into the other.

   WHICH IS ALSO WHY YOUR OWN LINE IS A RULE DOWN THE LEFT RATHER THAN GOLD TEXT.
   It was written that way against `.widget-full:has(.flappy) .row .k`, which scored (0,3,1) —
   `:has()` takes the specificity of its own argument — so a colour on `.board .row.is-me .k` would
   have tied at (0,3,1) and the cascade would have settled which ink won by which rule happened to
   sit later in this file. That was `.price.faint` exactly. The rule it tied with has gone with the
   handheld shell above, so the tie has gone with it; the edge stays, because it was never only a
   way round a race. Nothing anywhere sets `box-shadow` or `padding-left` on a `.row`, so it cannot
   lose one it does not look like it is in — and a gold rule down the left is already what this app
   means by "yours", which is what `.msg.unread` used before the bubbles took the edge away.

   THE ROWS ARE `.row` AND NOTHING ELSE. The board sits directly under `Score` and `Best`, and a
   list whose baselines and rules line up with the two rows above it reads as part of the same
   object rather than as a widget inside a widget. */
```

### ---------- A LIST IS NOT A SHEET

before `.board .row`

```
/* ---------- A LIST IS NOT A SHEET ----------------------------------------------------------------
   `.row` IS `.44rem 0` AND `.88rem`, which is right for a sheet you read a line at a time — Subject,
   Level, Where — and too generous for a ranked list you scan. Five of them at that leading is 170px,
   and the card they sit in already holds a canvas inside a pane that cannot grow: see `SCORE_TOP` in
   map.js for the measurement. Tighter here rather than a smaller `SCORE_TOP` alone, because the
   rows genuinely are a different kind of object from the two above them. */
```

### ---------- AND HERE THE LABEL IS THE CONTENT

before `.board .row .k`

```
/* ---------- AND HERE THE LABEL IS THE CONTENT ----------------------------------------------------
   `.row .k` IS `flex: 0 0 auto` AND ITS OWN NOTE SAYS WHY: "Credits", "You have", "Where" are two
   words and there is always room. A board's label is a place and a handle — up to the twenty
   characters `check-handles.js` allows — and `min-width: 0` alone does nothing for it, because
   `flex-shrink` is still 0. Measured with a twenty-character handle: the row ran 53px past the card
   at 320px and took the pane with it, which `check/ui.js` named the first run that could see this
   state. The value is the one that cannot shrink here; it is at most three digits. */
```

### The heading took a muted ink of its own while the flappy card was a charcoal handheld with greys of its own.

before `.page > .pane:has(.widget-full)`

```
/* The heading took a muted ink of its own while the flappy card was a charcoal handheld with greys
   of its own. That card is an ordinary one again, so there is one board on two cards and both of
   them are the app's — `var(--dim)` above is the whole of it. */
```

### ---------- AND NOTHING MAY BE UNBOUNDED

before `.page > .pane:has(.widget-full)`

```
/* ---------- AND NOTHING MAY BE UNBOUNDED --------------------------------------------------------
   A widget that draws itself — a canvas, a board, a map — has no size until it has drawn, so a pane
   measured before that is a pane the wrong size, and one measured after is a pane that jumped. When
   it went wrong the widget spilled past the pane entirely and looked like it had no card at all.

   A floor and a ceiling, on the pane rather than on each widget: it can never be shorter than
   something worth looking at, and never taller than the cell it has to fit inside. Whatever the
   contents turn out to be, the object is bounded before they arrive. */
```

### ---------- MESSAGES IS A CARD, ON A SCREEN OF ROWS

before `.card:has(> .msg-body)`

```
/* ---------- MESSAGES IS A CARD, ON A SCREEN OF ROWS ----------------------------------------------
   Every "card" on the You screen is a row in one glass pane, separated by a hairline — which is
   right for Name, Role, Credits and the rest, because those are a list of facts about you and a
   list should read as a list.
   A thread is not a fact. It is a thing with contents, and it needs an edge of its own to be told
   apart from the settings it sits among. So this one gets a surface where the others do not. */
```

### ---------- A CONVERSATION TAKES THE HEIGHT IT IS GIVEN

before `#s-dm .card:has(> .msg-body)`

```
/* ---------- A CONVERSATION TAKES THE HEIGHT IT IS GIVEN ------------------------------------------
   22rem WAS A NUMBER FROM THE YOU SCREEN, where a thread sat among a list of settings and had to
   leave room for them. On the Messages column it is the only card on its page, and 22rem left the
   card ending halfway down a 390×844 phone — 326px of conversation and 300px of empty glass under
   the composer, with the thread scrolling inside a box half the size it could have been.

   SO THE CARD IS CAPPED AT THE PANE'S OWN CAP AND THE THREAD TAKES WHAT IS LEFT. The pane's
   `max-height` is the formula below less its own padding and border, the card's margin and border
   — written out rather than a percentage, because a pane is `height: fit-content` and a percentage
   of that resolves to no cap at all (see `.pane`). The thread is the one child that may shrink, so
   a composer that grows as somebody types takes its lines out of the thread rather than pushing
   itself past the bottom of the pane, which is `overflow: hidden` and would simply have cut it off.

   A SHORT THREAD IS STILL SHORT. Nothing grows: the card is as tall as what is in it, up to the cap,
   which is the pane's own rule one level down. */
```

### ---------- THE ARCADE CABINET

before `.widget-full:has(.map) > .card`

```
/* ---------- THE ARCADE CABINET ------------------------------------------------------------------
   The Overworld is a map you move along, which is the one widget here that is genuinely a PLACE
   rather than a tool. A cabinet is the right frame for it: a black shell, a screen set deep into a
   bezel, and the maker's name silkscreened along the top where it always is.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE SPRINT, IN NEON

before `.widget-full:has(#tt-idle) > .card`

```
/* ---------- THE SPRINT, IN NEON -----------------------------------------------------------------
   Sixty seconds against a clock is the one thing in here that is pure arcade, so it is dressed as
   one: a dark violet field, a magenta and cyan grid running to a horizon, and everything on it
   glowing rather than printed.
   The glow is `text-shadow`, not an image — it costs nothing, scales to any size, and is the
   actual way neon reads: the colour bleeding past the edge of the letter.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE DOCKET IS A CLIPBOARD

before `.widget-full:has(#docket-body) > .card`

```
/* ---------- THE DOCKET IS A CLIPBOARD -----------------------------------------------------------
   Hardboard, a steel clip at the top, and the list on paper under it. The clip is drawn: a dark
   band for the body and a lighter strip for the lever that catches the light.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE NOTEPAD IS A NOTEPAD

before `.widget-full:has(#notepad) > .card`

```
/* ---------- THE NOTEPAD IS A NOTEPAD ------------------------------------------------------------
   Ruled paper with a red margin down the left and a glued top edge, which is what a pad is: sheets
   held at the head rather than bound. The rules are a gradient, so they line up with the text at
   any size and cost nothing.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE TIMER READS LIKE A DIGITAL CLOCK

before `.widget-full:has(#timer-display) > .card`

```
/* ---------- THE TIMER READS LIKE A DIGITAL CLOCK ------------------------------------------------
   Numerals on a dark panel, in the amber of an LED, with the SEGMENTS SHOWING BEHIND THEM.

   That last part is what makes a digital clock look like one rather than like large text: on a real
   display every segment of every digit is physically there, and the ones that are off are still
   faintly visible against the panel. So the figure is drawn twice — a dim `88:88` underneath, and
   the live time over the top of it. Nothing is measured or positioned by hand; the two sit in the
   same grid cell, so they line up at any size on any phone.

   `tabular-nums` is what stops the whole thing shuffling sideways once a second: a 1 is narrower
   than a 0 in almost every font, so 11:11 and 10:00 are different widths without it.
--------------------------------------------------------------------------------------------- */
```

### THE SIZE COMES FROM THE FIRST RULE for this selector, further up:

in `.widget-full #timer-display`

```
/* THE SIZE COMES FROM THE FIRST RULE for this selector, further up: `clamp(2.1rem, 14vw, 4rem)`,
     which grows with the phone. A flat 2.6rem was written here and silently beat it — the same
     selector twice, the later one winning, which is exactly what `check-css.js` now reports.
     Stated once, in the responsive form, because a clock that does not fit a small screen is worse
     than one that is not quite as large as it could be on a big one. */
```

### THE SEGMENTS THAT ARE OFF.

before `.widget-full #timer-display::before`

```
/* THE SEGMENTS THAT ARE OFF. `88:88` is every segment of every digit lit at once, so drawn faintly
   underneath it is exactly the shape a real display shows when it is dark. `attr` is not used —
   this never changes, so it is written here rather than kept in step from JavaScript. */
```

### ---------- THE THINGS THAT KEEP THE FINGER FOR THEMSELVES

before `[data-noswipe], .msg-body, #docket-body, .feed-text, .widget-squeeze`

```
/* ---------- THE THINGS THAT KEEP THE FINGER FOR THEMSELVES ---------------------------------------
   `#screen` says `touch-action: none` so the grid gets every gesture by default. These are the
   exceptions, and they are the same list `axisFree` in script.js names: a control that consumes a
   drag for its own reasons. Written in both places on purpose — the stylesheet decides whether the
   browser hands the movement over, the script decides what to do with it once it has, and neither
   can do the other's half. */
```

### `select` WAS FIRST IN THIS LIST, beside `[data-noswipe]`, and goes with it in `axisFree` — a swipe that begins on a dropdown moves the column like a swipe

before `[data-noswipe], .msg-body, #docket-body, .feed-text, .widget-squeeze`

```
/* `select` WAS FIRST IN THIS LIST, beside `[data-noswipe]`, and goes with it in `axisFree` — a swipe
   that begins on a dropdown moves the column like a swipe anywhere else on the card, which is what it
   did for the week the app's own panel made every select `pointer-events: none` (note 315). */
```

### THE FEW BOXES THAT STILL SCROLL, and every one of them is a thing you are IN rather than a card you are swiping past:

before `.msg-body, #docket-body, .feed-text, .widget-squeeze`

```
/* THE FEW BOXES THAT STILL SCROLL, and every one of them is a thing you are IN rather than a card
   you are swiping past: a notepad you type in, a docket you tick off, a thread you read. Losing a
   swipe to one of those is not a fault — it is what you reached for.
   The sheet is the other one, and it is not listed here because it covers everything: while it is
   open there is no grid behind it to compete with. `axisFree` refuses every drag then. */
```

### ---------- A TEXTAREA IS NOT A DIV, AND `touch-action` IS THE ONLY THING THAT SETTLES IT

before `textarea`

```
/* ---------- A TEXTAREA IS NOT A DIV, AND `touch-action` IS THE ONLY THING THAT SETTLES IT --------
   MEASURED WITH REAL TOUCH EVENTS, counting what actually reaches the page. A DIV with `pan-y` and
   nothing to scroll hands the gesture straight back — `#docket-body` at 28/28 turns the page on a
   swipe up, exactly as a card does. A TEXTAREA never does, at any value the ancestors carry,
   because a drag inside a text control is a SELECTION: the browser sends one `pointermove` and
   then `pointercancel`, and the app has nothing left to steer with. Measured on `.cmt-text`:
   `down 1, move 1, cancel 1`, with `.pane` and `#screen` both saying `none` over it. An ancestor
   cannot fix this; only the element can.

   WHICH IS WHY `none` RATHER THAN LEAVING IT OUT. `auto` loses BOTH axes to the selection, `pan-y`
   loses the vertical to a pan that often has nothing to pan, and `none` hands the app everything —
   which is what every card in this app already does. The blanket `pan-y` that used to be here meant
   you could land on the notepad, the comment box, the message composer or the answer box on a
   question card and not be able to swipe off it in either direction; the tab bar was the only way
   out, and that is the "navigating on widgets" hiccup this was found from.

   WHAT IT COSTS, written here rather than discovered: you cannot drag a long answer up and down
   inside its own box. These are two rows tall, typed into rather than read, and the caret scrolls
   them as you type. The one textarea that is genuinely a thing you are IN is the notepad, and it
   is not named here at all — `padReach_` in find.js sets it from its own measured overflow, because
   whether it can scroll is a fact about what somebody has typed and a stylesheet cannot ask. One
   writer, so there is no cascade to lose. */
```

### `.pane.scrolls` was here — the class that gave a pane back its vertical gesture once it had overflowed.

before `*`

```
/* `.pane.scrolls` was here — the class that gave a pane back its vertical gesture once it had
   overflowed. The measurement that set it went from shell.js with it.

   THE SENTENCE THAT STOOD HERE WAS "A PANE CANNOT OVERFLOW NOW", AND IT WAS NOT TRUE. Measured at
   390×844 with six conversations on the Messages column: 1,298px of content inside an 805px pane,
   which is 493px of somebody's messages on the page with no scroll and no page to turn to. The
   claim was an assertion about every screen in the app made from one screen, and it is exactly why
   the fault survived — a pane that cannot overflow needs nothing measuring it.

   A PANE CAN OVERFLOW ANY TIME SOMETHING STACKS MORE INTO IT THAN FITS, and the answer is the one
   `.pane`'s own note gives: page it. `check/ui.js` asks the question now, on every pane of every
   screen at four widths — OUT OF REACH — so the next column to do it says so instead of being
   found by somebody with a full inbox. */
```

### ---------- NO SCROLLBAR ANYWHERE, ON ANYTHING

before `*`

```
/* ---------- NO SCROLLBAR ANYWHERE, ON ANYTHING -----------------------------------------------
   Belt and braces: the panes cannot scroll, but the few boxes that still do — a notepad, a docket,
   a thread — should not draw a bar either. A bar on a phone is a thing you can catch with a thumb
   while trying to swipe, which is the fault this whole change is about. */
```

### ---------- THE BLANK ONE

before `#splash`

```
/* ---------- THE BLANK ONE ------------------------------------------------------------------------
   Same paper, same torn ends, every field where it will be once it is filled in — so what you are
   offered reads as "one of these, empty" rather than as a control that happens to sit in a column
   of documents.

   It has to be told apart from a session that is simply MISSING things, though, which looks nearly
   the same: no tutor, no venue, no price. So the writing is faint and the paper is a shade paler,
   the way an unused form is paler than one somebody has filled in. Nothing is added — no badge, no
   "new" label — because the emptiness is the message and a label would be explaining it. */
```

### `.rc-blank` WAS THE EMPTY STUB — "Nothing booked / Tap to start" — and it goes with the rest of the stub stylesheet.

before `#splash`

```
/* `.rc-blank` WAS THE EMPTY STUB — "Nothing booked / Tap to start" — and it goes with the rest of
   the stub stylesheet. Two of its arguments are worth keeping in one place, because both apply to
   any empty state this app builds next:

     THE EMPTINESS IS THE MESSAGE. No badge, no "new" label; a card that is visibly empty does not
     need telling you so.

     AND IT MUST NOT BE DIMMED. This was `opacity: .72` to read as an unused form, and dimming a
     whole card is how every app there has ever been says "you cannot press this" — on the primary
     action of a screen that is exactly wrong. The difference belongs in the FIELDS: the heading in
     ink, the parts not filled in yet the colour of a placeholder. */
```

### THE SPLASH — what covers the app while the payload is on its way.

before `#splash`

```
/* ==================================================================================================
   THE SPLASH — what covers the app while the payload is on its way.

   WHAT IT IS FOR. The first request reads a dozen tabs and a cold Apps Script instance can take a
   couple of seconds over it. What the app looked like for those seconds was a black rectangle,
   which reads as broken rather than as busy — and the difference between those two is whether
   somebody waits or closes it.

   ONLY WHAT THE BOOKS TEACH. "delete all animations for loading which dont come from text books or
   arnt educational." — the owner, 10 Oct. Thirteen splashes were drawn here — the tag, the 1974
   readout, the torch, the tube, the columns, the blocks, the ring and six calm ones — and every rule
   and keyframe of theirs went with them (docs/history/322). What the splash draws now is one of the
   textbooks' teaching animations, from the copy the device kept (its CSS is its row's, in a
   `<style data-anim>`, never here); or, with nothing kept, the still name and the app's one loader.

   ALL CSS, NO SCRIPT. It has to keep moving while the main thread is parsing eighteen files and
   building four screens, and a spinner driven by JavaScript stops precisely then — at the one
   moment it was needed. An animation the compositor owns does not care how busy the page is.
================================================================================================== */
```

### GONE, AND GONE FOR GOOD.

before `#splash.done`

```
/* GONE, AND GONE FOR GOOD. `load()` adds this when the payload lands. Faded rather than cut,
   because the app appearing underneath is the reward and it should not be startling — and
   `visibility` follows on a delay so a finished splash cannot swallow a tap. */
```

### ---------- THE SLOW-LOAD CAPTION

before `#boot-slow`

```
/* ---------- THE SLOW-LOAD CAPTION -----------------------------------------------------------------
   ON the splash, because the splash is z-index 200 and the banner is 29 — a message in the banner
   while the loading screen is up is a message behind a wall, which is why the watchdog used to take
   the splash off in order to be read. `pointer-events` back on for this one element: the splash
   turns them off for everything under it, and the address in here has to be selectable while it is
   showing. */
```

### ---------- WITH NOTHING KEPT: THE NAME, STILL, AND THE ONE LOADER UNDER IT

before `#splash-still`

```
/* ---------- WITH NOTHING KEPT: THE NAME, STILL, AND THE ONE LOADER UNDER IT -----------------------
   A FIRST VISIT HAS NO COPY OF THE BOOKS' DRAWINGS YET, and neither has a device whose copy failed
   its check or was given up for a child's answer. What it gets is the name, set plainly and not
   moving — it used to be written on as a tag, which taught nothing — and under it the loader every
   card waits with (`loading_()`, shell.js; the block headed "WAITING: ONE LOADER"). Nothing here
   dresses the loader: its own block sizes and colours it, and a rule for `.loading` outside that
   block is a second loader (`check-loading.js`). This only stacks the two and centres them.

   SHOWN ONLY BY ITS STATE CLASS. The picker sets `is-an` when it draws a book's animation and leaves
   `is-still` (the markup's own) when it does not; `splashOff_` puts `is-still` back for a Try again.
   One rule hides it and one rule shows it, and nothing else may say how it is displayed — the rule
   `check-css` keeps, because a splash with its own opinion about `display` is how two loading
   screens once came to be drawn at once.

   THE NAME IS PAPER ON BLACK, as the tag was — the splash is one of the paper things (see the second
   palette) — and the size the tag's letters stood at on a 390 phone, in `rem`: nothing here is
   pressed. `nowrap`, because "@family." broken over two lines is not the name. */
```

### ---------- THE LINE THAT ONLY A SLOW LOAD EVER SEES

before `#splash-wait`

```
/* ---------- THE LINE THAT ONLY A SLOW LOAD EVER SEES ---------------------------------------------
   BELOW THE ART AND OUT OF ITS WAY. The splash centres one thing — a drawing, or the still name and
   its loader; this sits under it rather than beside it, so neither has to know the other exists.

   QUIET ON PURPOSE. It is not an alarm — the request may still land — so it is the faint ink this
   app uses for an aside, at the size of one. The second line is quieter still because it is the
   explanation rather than the fact.

   NO ANIMATION. The drawing or the loader above it is moving, and a message that also moved would
   read as part of the picture rather than as something that has just been said. */
```

### IF IT CAN BE TAPPED, IT LOOKS LIKE IT THE PROBLEM.

before `[data-do]`

```
/* ==================================================================================================
   IF IT CAN BE TAPPED, IT LOOKS LIKE IT

   THE PROBLEM. Buttons look like buttons. Everything else that responds to a press — a card, a row,
   a receipt, a date on the calendar, a word in a caption — looked exactly like the things that do
   not. The only signal was `cursor: pointer`, which is invisible on a phone, and a press state you
   could not discover without pressing. So the app had two kinds of thing that look identical and
   behave differently, and the only way to tell them apart was to try.

   `[data-do]` IS THE DEFINITION OF TAPPABLE HERE. One delegated listener reads that attribute and
   nothing else; an element with it responds and an element without it does not. So the affordance
   is hung on the same attribute rather than on a `tap` class somebody has to remember — a class can
   be left off and the thing still works, which is precisely how a control comes to look like text.
   Written this way, anything made tappable from now on looks tappable without anybody doing
   anything.

   THREE SIGNALS, in order of how much they cost the design:

     PRESS — everything gets it. The surest sign a thing is a control is that it answers you, and
             this answers on touch rather than on hover, which phones do not have.
     CHEVRON — only for the block-shaped ones: a card, a row, a receipt. A thing the width of the
             screen with a mark at the end of it reads as "there is more this way", which is what
             those actually do.
     UNDERLINE — for the ones inside a line of text, where a chevron would be litter and a press
             state is not visible until pressed.
================================================================================================== */
```

### NO PRESS ANIMATION, AND THAT WAS A MISTAKE TO ADD.

before `[data-do]`

```
/* NO PRESS ANIMATION, AND THAT WAS A MISTAKE TO ADD.

   This was `transition: transform` on everything with a `data-do`, and `transform: scale(.97)` when
   pressed. The brief was "make it look clickable" and I answered a different one — "make it react
   when clicked" — which is more than was asked and which put a transform on every control in the
   app including `<select>` and `<input>`. A transformed element is its own containing block, and a
   select whose box has been scaled is a select whose dropdown has somewhere new to be.

   What was actually wanted is on the elements themselves: a chevron on the block-shaped ones, a
   dotted underline on the ones inside a line of text, a real edge and a ghost tick on a checkbox.
   Those say a thing can be pressed while it is sitting still, which is the whole point — an
   affordance you only see once you have pressed it is not an affordance.

   `cursor` stays, because it costs nothing and is right on a desktop. The tap highlight stays off
   because the browser's own is a blue rectangle that fits nothing on this screen. */
```

### ---------- THE BLOCK-SHAPED ONES

before `.card.tap, .row.tap, .rc-stub.tap`

```
/* ---------- THE BLOCK-SHAPED ONES ---------------------------------------------------------------
   A chevron at the end, quiet until it is pressed. On a card the width of the screen this is the
   difference between a paragraph and a door.

   `:has()` is not needed and `::after` is: these are containers with their own contents, so the
   mark goes in the corner rather than in the flow. */
```

### ---------- A ROW THAT ENDS IN A NUMBER HAS NO ROOM FOR ONE

before `.row.tap.counted::after`

```
/* ---------- A ROW THAT ENDS IN A NUMBER HAS NO ROOM FOR ONE ---------------------------------------
   THE CHEVRON IS PINNED TO THE RIGHT EDGE AND SO IS THE COUNT, so the two were in the same place:
   beside the digit on `5`, underneath the digits on `1083`. What you saw was chevrons on two rows
   out of five, and the two were simply the ones with short numbers.

   THE COUNT IS THE BETTER MARK ANYWAY. It says the row leads somewhere AND how much is behind it,
   which is the thing a chevron only gestures at. */
```

### ---------- THE ONES INSIDE A LINE OF TEXT

before `span[data-do]:not(.act):not(.chip):not(.react):not(.map-arrow):not(.cal-arrow):not(.qw), .text-actio …`

```
/* ---------- THE ONES INSIDE A LINE OF TEXT -------------------------------------------------------
   A word in a caption, a date on the calendar, an action at the end of a row. A chevron would be
   litter here and a press state cannot be seen before it is pressed, so they are underlined the way
   anything you can follow has been underlined since the first web page.

   Dotted rather than solid: solid is a link to somewhere else, dotted is a thing that acts here.
   That is a distinction people read without being taught it.

   NOT ON A GLYPH, THOUGH, AND `⋯` IS WHY. This underlines WORDS — a dotted line under a word reads
   as an invitation because the word is above it and the line is not part of it. Under a row of
   three dots it reads as three more dots, slightly lower and slightly apart: the control looked
   duplicated, as though it had been drawn twice and misaligned. It was matched twice over, by the
   `span[data-do]` rule and by name, so both had to say no.
   ANY SINGLE-GLYPH CONTROL WOULD HAVE THE SAME PROBLEM. A chevron, an arrow, a cross — an
   underline under a mark that small is not an affordance, it is a second mark. */
```

### `.post-edit` WAS IN THIS EXCEPTION LIST and there is no `.post-edit` — the post's ⋯ became a tile with everything else you can do to a post.

before `span[data-do]:not(.act):not(.chip):not(.react):not(.map-arrow):not(.cal-arrow):not(.qw), .text-actio …`

```
/* `.post-edit` WAS IN THIS EXCEPTION LIST and there is no `.post-edit` — the post's ⋯ became a tile
   with everything else you can do to a post. Dropped rather than left: an exception naming nothing
   is a line somebody has to look up to find out it means nothing. */
```

### `.qw` IS NOT UNDERLINED EITHER:

before `span[data-do]:not(.act):not(.chip):not(.react):not(.map-arrow):not(.cal-arrow):not(.qw), .text-actio …`

```
/* `.qw` IS NOT UNDERLINED EITHER: it is every word of a passage you ring words in (`circWords_`), and
   a dotted line under every word of a paragraph reads as a paragraph of links -- the screenshot of
   the first version did. The whole passage is the control and the line under it says how to use it. */
```

### ---------- AND THE ONES THAT ARE ALREADY OBVIOUS

before `.btn::after, .chip::after, .react::after, button.tap::after`

```
/* ---------- AND THE ONES THAT ARE ALREADY OBVIOUS ------------------------------------------------
   A button, a chip, a reaction, an arrow, a swatch, a tile on the map. Each is already a shape you
   press and adding a chevron or an underline to it would be explaining a door. */
```

### ---------- A POST THAT IS WAITING

before `.post-wait`

```
/* ---------- A POST THAT IS WAITING ----------------------------------------------------------------
   Amber, which is the colour this app already uses for "not settled yet" — the same word a booking
   uses before it is confirmed. Not red: nothing is wrong with it, it simply has not been looked at.
   The two buttons sit under the post itself rather than on a list somewhere, because the decision
   is about the photograph and the caption and you are already looking at both. */
```

### THREE THINGS THAT ARE WHAT THEY ARE The receipt works because a booking genuinely produces a receipt — the form is not a costume, it is the honest shape of the

before `.prof-top`

```
/* ==================================================================================================
   THREE THINGS THAT ARE WHAT THEY ARE

   The receipt works because a booking genuinely produces a receipt — the form is not a costume, it
   is the honest shape of the thing. These three follow the same rule and no other: a past paper
   drawn as the cover of a past paper, a tutor as the pass they would wear, a venue as the booking
   slip on its door. Each one is recognised before it is read, which is the only reason to do this.

   The test each had to pass: could the data have been designed for the form? Board, tier, paper,
   year and wave ARE an exam cover. Photo, name, subjects and DBS ARE a pass. Rooms, capacity and
   rate ARE a booking slip. Nothing here needed a field inventing, and anything that had would have
   been decoration.
================================================================================================== */
```

### `.paper`, `.paper-top`, `-board`, `-tier`, `-mid`, `-subject`, `-name`, `-of`, `-box`, `-foot` AND `.paper.is-off` WERE HERE — about fifty lines that drew a

before `.prof-top`

```
/* `.paper`, `.paper-top`, `-board`, `-tier`, `-mid`, `-subject`, `-name`, `-of`, `-box`, `-foot`
   AND `.paper.is-off` WERE HERE — about fifty lines that drew a past paper as the cover of one, on
   cream, squared off, set in a plain face because an exam paper is the least designed object a
   student handles. `paperCard` in find.js emitted it and `paperCard` is gone: the funnel lists
   questions and not the documents they came out of. See the note above `questionItems`. */
```

### ---------- A PERSON, AS A WIDGET

before `.prof-top`

```
/* ---------- A PERSON, AS A WIDGET ----------------------------------------------------------------
   `.pass`, `.pass-hole`, `-top`, `-org`, `-role`, `-body`, `-pic`, `-none`, `-who`, `-name`,
   `-line`, `-rate`, `-foot`, `-dbs`, `-off`, `-where` AND `.pass.is-off` STOOD HERE — about sixty
   lines drawing a tutor as a staff pass on a lanyard, with a punched hole at the top so the eye
   would read it as something worn round a neck.

   IT WAS ASKED TO GO, TWICE. The shape argument was real and it lost to two better ones: one object
   among nine widgets reads as unfinished rather than as designed, and a card 3.4rem wide has
   nowhere to put the thirteen public facts `doget.gs` has been sending about every tutor since it
   was written. `findCard` in cards.js carries the whole argument.

   DELETED RATHER THAN LEFT. A rule for a class nothing produces is a rule somebody will one day try
   to work out the purpose of — which is the sentence this file already carries about `.live-row`
   and about the card-opened-in-place styling.

   THE CONTAINER IS `.card.is-widget`, which is declared far below and is the calculator's box, the
   notepad's box and now a person's box. Nothing here redeclares it; everything below is what goes
   INSIDE it, which is the whole of what "standardised like the other widgets" means. */
```

### WRAPS. `.pass-name` was one line with `text-overflow: ellipsis` on the lines under it, because a pass is a fixed object and a name that does not fit gets cut.

before `.is-prof`

```
/* WRAPS. `.pass-name` was one line with `text-overflow: ellipsis` on the lines under it, because a
   pass is a fixed object and a name that does not fit gets cut. A widget is as tall as it needs to
   be, so a long name takes two lines instead of losing its end. */
```

### ---------- THE ONE RED THIS CARD USES, DECLARED ONCE AND RAISED TO READABLE

before `.is-prof`

```
/* ---------- THE ONE RED THIS CARD USES, DECLARED ONCE AND RAISED TO READABLE --------------------
   IT WAS `#b9544a`, WRITTEN OUT TWICE — on `No DBS on file` and on `· not listed`. `check/ui.js`
   measured it at 4.15:1 against `--bg` the first run that could see either of them, which is under
   WCAG AA's 4.5 for small text. `#c4655a` is 5.02:1 and the same hue: nothing about the card reads
   differently and the two things it says can now be read.

   NEITHER HAD EVER BEEN ON A SCREEN THIS FILE MEASURED. `check/fixture.json`'s one tutor is listed
   and carries `dbs: true`, so both states were unreachable until the unlisted-tutor state went into
   `check/states.js` — and the moment one of them was drawn, the other was already wrong in the same
   way. Repaired as a token rather than at the instance, which is the `cost: 0` sentence this
   repository writes about every fault it has had to fix twice.

   ON THE COMPONENT, NOT AT `:root`, because it is this card's own word for "something is not right
   here" and nothing else in the app should be offered it — the rule the house style states with the
   chess board's cream and charcoal. */
```

### ---------- THE HANDLE, IN GOLD AND SMALLER THAN THE NAME

before `.prof-handle`

```
/* ---------- THE HANDLE, IN GOLD AND SMALLER THAN THE NAME ----------------------------------------
   IT IS NOT THE NAME AND MUST NOT COMPETE WITH IT. `.prof-name` is 1.05rem at 700; this is the
   thing you sign in with rather than the thing you are called, so it sits under the name at the
   size the second line of this block has always used.

   GOLD, BECAUSE IT IS YOURS IN THE SENSE THIS APP ALREADY MEANS BY GOLD — the one starred thing,
   the ticked hour, the chosen answer. It is also what separates `@BrightOtter42` from the place
   name directly beneath it at the same size and font, which `--dim` alone would not.

   `overflow-wrap` FOR THE REASON `.prof-name` HAS IT. A handle is up to twenty characters with
   nothing to break at, which at this size is 85px — under the column at every width the app is
   measured at, and one `HANDLE_SHAPE` change away from not being. */
```

### `.prof-dbs` — a green DBS CHECKED or a red NO DBS ON FILE under the name — WAS HERE.

before `.prof-say`

```
/* `.prof-dbs` — a green DBS CHECKED or a red NO DBS ON FILE under the name — WAS HERE. Asked to go:
   *"enhanced dbs check shouldnt appear up there. treat it like an extra qualification thing."* A
   tutor who holds one ticks `Enhanced DBS` among their extra qualifications and it is a dashed chip
   there. What that costs: the card no longer says a DBS is MISSING. */
```

### A TUTOR'S OTHER PHOTOGRAPHS — `findCard`.

before `.prof-photos`

```
/* A TUTOR'S OTHER PHOTOGRAPHS — `findCard`. Four squares to a row, and they stay squares: a tap opened
   one across the row until the owner asked for that to go (10 Oct), so a square is a picture, not a
   control, and has no tap-target floor or zoom cursor to keep. */
```

### ---------- AND THE ROWS ARE A NOTCH SMALLER THAN AN ORDINARY ROW, because a profile has twice as

before `.is-prof .row`

```
/* ---------- AND THE ROWS ARE A NOTCH SMALLER THAN AN ORDINARY ROW, because a profile has twice as
   many of them. Reported with a screenshot of a tutor's card running past the bottom of a phone:
   "I don't like scrolling. If you need to leave things more compact or smaller font." `paneReach_`
   now shrinks any card that still does not fit, and this is the half that means a profile rarely
   needs it — the rows are labels and values read down a card, not paragraphs, and .44rem of air
   above and below each one was the difference between fitting and not. */
```

### THE SUBJECTS, AS THE ADJECTIVES' CHIPS.

before `.prof-teach .prof-tag`

```
/* THE SUBJECTS, AS THE ADJECTIVES' CHIPS. Same pill, same line; the case is the sheet's own rather
   than upper, because a subject shouted reads as a heading (see `findCard`). The specialism takes
   the gold edge and the ink — gold is what this app means by "the one", and it is the only chip on
   the card that is a claim about depth rather than range. Two chip rows in a row need a gap. */
```

### THE LEVELS, RAISED AFTER THE SUBJECT — `teachChip_` in cards.js.

before `.prof-lv`

```
/* THE LEVELS, RAISED AFTER THE SUBJECT — `teachChip_` in cards.js. *"Subject ^level, level, level …
   no brackets."*
   A FLOOR OF 8px, IN px. The chip is .64rem, which is 8.6px on a 320px phone, and a browser's own
   superscript is "smaller" — about 7px, which is a level nobody can read. `max()` keeps the raise as
   what says "this belongs to the word before it" and stops the size doing the work as well.
   `line-height: 0` SO THE RAISE DOES NOT GROW THE CHIP: a chip with levels and a chip without one
   sit on the same line at the same height, which is what lets a row of them read as a row.
   `--dim` RATHER THAN AN OPACITY, so the levels step back on the gold-edged chip as well, and so
   `check/ui.js`'s contrast rule can read the colour: it composites a colour's alpha and not an
   element's opacity, and a level faded that way would be measured as the subject's ink. */
```

### A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — `profQualChip_` in cards.js.

before `.prof-q-end`

```
/* A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — `profQualChip_` in cards.js. *"Maths subscript to it is
   grade and super script is the level."* The level and the grade are one block on the subject's
   right, the level over the grade, both left-aligned so they start at the same x as notation does.
   A COLUMN RATHER THAN A `<sup>` AND A `<sub>` LEFT INLINE: inline, the two sit side by side and a
   reader pairs them up by squinting; stacked, they share an x and the pair reads as one mark.
   SAME FLOOR AND THE SAME INK AS THE TEACHES LEVELS (`.prof-lv`): 8px in px, because a browser's own
   superscript on a .64rem chip is about 7px; `--dim` rather than an opacity, so `check/ui.js`'s
   contrast rule reads the colour that is actually drawn.
   NEGATIVE MARGINS SO THE STACK DOES NOT GROW THE CHIP. Two 8px lines are taller than the chip's own
   line, and `.prof-tags` is a flex row whose items stretch to the tallest — so one tall chip would
   stretch every chip beside it and leave their words at the top of taller pills. The margin takes the
   stack's own height out of the line box and lets it sit in the chip's padding, which is what the
   padding is there for. Measured: 20.8px with the stack and 20.8 without at 320, 22.6 and 22.6 at 390;
   held there by `check/states.js`'s "a tutor's qualifications, written like isotopes".
   `1ch` OF AIR BEFORE IT, BECAUSE THAT IS WHAT THE TEACHES LEVEL HAS. Its gap is the `&nbsp;` inside
   its own 8px mono `<sup>`, and one `ch` of the stack's same 8px mono is that same width. It was `.22em`,
   measured 1.75px against the Teaches level's 4.69 at both widths: side by side, "Maths ^GCSE" had air
   and the qualification all but touched its subject — one card, one notation, two distances. The same
   state now holds the two gaps within half a pixel of each other. */
```

### ONE OF THE TWO KEEPS ITS OWN HALF.

before `.prof-iso sup:only-child`

```
/* ONE OF THE TWO KEEPS ITS OWN HALF. *"No grade → just the raised level"* — a level alone, centred
   like the pair, would sit level with the subject and say nothing about being a level; so the empty
   half is held open by a margin one line tall, and a level stays up and a grade stays down. */
```

### A CAPTION OVER EACH ROW OF CHIPS — "Teaches", "Qualifications", "Tutors at" — because two rows of identical pills could not be told apart:

before `.prof-cap`

```
/* A CAPTION OVER EACH ROW OF CHIPS — "Teaches", "Qualifications", "Tutors at" — because two rows of
   identical pills could not be told apart: *"its hard to tell what they teach and what they have
   qualification in"*. Small and faint, a label rather than a heading. */
```

### ---------- A CARD BEING EDITED — `cardEditHtml_` in me.js (docs/history/330)

before `.card-ed .ce-what`

```
/* ---------- A CARD BEING EDITED — `cardEditHtml_` in me.js (docs/history/330) -------------------------
   THE CARD'S OWN CLOTHES WITH ITS FORM INSIDE. The owner, 10 Oct: *"all of this stuff should be editable
   directly on the tutors card for that respective tutor."* The boxes are Settings' own (`.field`,
   `.f-row`, the shelf, the picker, the week), so nothing here restyles them. What is new is the seam
   between one section and the next — a hairline in the card's soft line, so the form reads in the
   card's own sections and in its order — and the word beside the role saying the card is being edited,
   in gold, because a form that looked exactly like the public card would be read as the public card. */
```

### `.kid-sec` IS "MANAGE YOUR CHILD"'S SECTION (docs/history/339) — the children linked to you, then making an account, then linking one — and it is drawn as the

before `.ce-sec + .ce-sec, .kid-sec + .kid-sec`

```
/* `.kid-sec` IS "MANAGE YOUR CHILD"'S SECTION (docs/history/339) — the children linked to you, then making an
   account, then linking one — and it is drawn as the card editor's are, one hairline between sections, because
   both are one card in sections and two looks for that would be two rules to keep in step. Its two forms are
   headed and not captioned, below — the one way the two differ, and why. */
```

### ITS TWO FORMS ARE HEADED, NOT CAPTIONED (the review of docs/history/339).

before `.kid-sec > .kid-h`

```
/* ITS TWO FORMS ARE HEADED, NOT CAPTIONED (the review of docs/history/339). "Make your child's account" and "Add
   your child" are the words the confirmation email and `makeChild`'s refusal send a parent to find, and as the
   card editor's `.prof-cap` they were its smallest text — 8px, faint, upper case. A heading one step under the
   card's own title (`.card > h3`, 1rem), in ink, so they read as what they are: the two things this card does. */
```

### WHAT AN EXTRA SEAT ADDS, UNDER ITS TWO PARTS — `cardRateHtml_` in me.js (docs/history/345).

before `.ce-seat`

```
/* WHAT AN EXTRA SEAT ADDS, UNDER ITS TWO PARTS — `cardRateHtml_` in me.js (docs/history/345). The seat as the card
   will print it, in the card's own `.prof-seat` type, so the form's answer and the card's number look like one
   thing; the line under it pulled up to it, because the two are one sentence about one seat. */
```

### ---------- A CHILD LINKED TO YOU, ONE LINE EACH — `kidListSec_` in me.js (docs/history/339)

before `.kid-row`

```
/* ---------- A CHILD LINKED TO YOU, ONE LINE EACH — `kidListSec_` in me.js (docs/history/339) --------------------
   The face, the first name over the handle, and New PIN at the far end — a line of a list rather than a whole
   card, because the child's own card is on the You column already and this is the list a parent manages from.
   The face is the card's own circle a size down (`.prof-pic`'s line and fill, drawn through `personFace_`); the
   name and the handle wrap rather than push the tile off a 320 card; the tile sits at the end of the line, its
   own row's top margin taken off so it lines up with the name. */
```

### ---------- SAVE AND CANCEL STAY IN REACH: THE ROW IS STUCK TO THE FOOT OF THE PANE

before `.tile-row.ce-tiles`

```
/* ---------- SAVE AND CANCEL STAY IN REACH: THE ROW IS STUCK TO THE FOOT OF THE PANE -----------------------
   ONE SAVE FOR THE WHOLE CARD, AND IT WAS UNDER THE WEEK — the form is every section of the card, about two
   thousand pixels at 320 and 390, so a tutor who changed their name scrolled past the photographs, the
   qualifications, the venues, the map and the week to keep it (measured: Save 1,952px down at 390x844,
   reachable only at scrollTop 1,185; Settings had a Save under each short card). Still ONE Save, as the
   brief has it, but the row is `sticky` at the bottom of the pane that scrolls (`paneReach_`, find.js), so
   Save and Cancel are under the thumb wherever the form is, and at the end of the form it rests in its own
   place above Sign out. In the card's own fill (`--raised`, what `.card.is-widget` is drawn in), the width
   of the card and flush under it, so it reads as the card's foot; a hairline above it says where the form
   goes under.
   `bottom: -1rem` AND `1rem` MORE PADDING UNDER THE TILES, because a sticky box stops at the pane's PADDING
   edge, not its glass: stuck at `bottom: 0` the row floated 1rem (the pane's bottom padding, `.pane`) above
   the glass with the form showing through the gap under it — measured at 390, the row's foot at 828 in a
   pane ending at 844, a line of the headline cut in half beneath it. At rest at the end of the form the same
   1rem is a gap between the form's two tiles and the account's own row (Sign out), which is the line between
   them anyway. KNOWN, AND ONE PIXEL: where a pane sits on a half pixel (top 18.5 at 390x844 in the lab)
   Chromium clips the stuck row on the exact edge and the form under it on the rounded-out one, so the last
   pixel row inside the glass can show the tops of a box's letters. Tried and measured, none changed it: one
   pixel more of row, `will-change`, `translateZ(0)`, a positioned input, `clip-path` on the pane. */
```

### AND THE ONE LINE THAT SAYS WHAT THE MARK MEANS.

before `.prof-hid`

```
/* AND THE ONE LINE THAT SAYS WHAT THE MARK MEANS. `.prof-say` is the tutor's own words, so this
   borrows its type and takes the card's own warning ink to say it is not theirs — the same token
   the heading's `· not listed` and the DBS stamp use, declared on `.is-prof` because it is this
   card's word for "something is not right here" and nothing else in the app is offered it.
   NOT ITALIC AND NOT QUOTED. `.prof-say` is set as something somebody said; this is the app
   talking, and a sentence in the same voice as the description would read as part of the profile. */
```

### `.slip` AND ITS NINE PARTS WERE HERE — the cream tear-off booking slip a venue was drawn as, with a perforation, a stub and its own palette.

before `.pane:has(.paper) .paper + .paper`

```
/* `.slip` AND ITS NINE PARTS WERE HERE — the cream tear-off booking slip a venue was drawn as, with
   a perforation, a stub and its own palette. Asked to go ("venues have unique css. i dont want that
   anymore"): a venue is an ordinary `.card` with `row`s now, see `findCard` in cards.js, and its
   entries in `.pane:has(...)` below went with it. */
```

### `.join` AND `.join-say` STOOD HERE — the block a stranger saw under somebody else's session, with the seats, the price, the list's tally and a gold button.

before `.pane:has(.paper) .paper + .paper`

```
/* `.join` AND `.join-say` STOOD HERE — the block a stranger saw under somebody else's session, with
   the seats, the price, the list's tally and a gold button. *"The session booking thing at the
   bottom of receipt should be a line in the booking"*: the seats are the receipt's `Sharing` row,
   the tally its `Can come` row and the button a tile in its foot, so there is nothing under the
   paper for a rule to style. See `joinBlock`'s tombstone in book.js. */
```

### `.live-row`, `.live-what` AND `.live-stage` STOOD HERE — the line above each roster saying what the session is, when, and where it has got to.

before `.pane:has(.paper) .paper + .paper`

```
/* `.live-row`, `.live-what` AND `.live-stage` STOOD HERE — the line above each roster saying what
   the session is, when, and where it has got to. Nothing draws them. Gone with the stub stylesheet
   above, and found by the same two repairs to `check-css`. */
```

### `.money-note` STOOD HERE — the business's arithmetic floating under the paper.

before `.pane:has(.paper) .paper + .paper`

```
/* `.money-note` STOOD HERE — the business's arithmetic floating under the paper. It is two rows of
   the total now (`.rc-more` above), because the owner asked that nothing float under a receipt and
   because the only thing that ever kept those figures from a client was this block's own `isAdmin`
   test; the payload keeps them now. */
```

### THE GAP BETWEEN THEM, once the glass is gone.

before `.pane:has(.paper) .paper + .paper`

```
/* THE GAP BETWEEN THEM, once the glass is gone. On the pane they were rows in a list and the pane
   held them together; standing on the app's own black they are separate objects, and objects need
   air between them or they read as one long strip of paper folded several times. */
```

### The styling for a card opened in place was here, and has gone with the mechanism — see the note in shell.js.

before `.map.ow`

```
/* The styling for a card opened in place was here, and has gone with the mechanism — see the note
   in shell.js. Removed rather than left: a rule for a class nothing produces is a rule somebody
   will one day try to work out the purpose of. */
```

### ---------- THE OVERWORLD BOARD

before `.map.ow`

```
/* ---------- THE OVERWORLD BOARD ------------------------------------------------------------------
   The card the 3D board draws into. It needs a HEIGHT of its own: a canvas in a div with no height
   collapses to nothing, the renderer is sized to zero, and the card looks like a feature that did
   not load rather than one that has no room. `position:relative` is what the name plate and the
   warning box are positioned against — they used to be fixed to a page that no longer exists. */
```

### ---------- THE FRAME, WHICH SCROLLS SIDEWAYS

before `.map.ow`

```
/* ---------- THE FRAME, WHICH SCROLLS SIDEWAYS ----------------------------------------------------
   A STREET IS LONGER THAN A PHONE IS WIDE, and the first version dealt with that by scaling the
   whole town down to the width of the card — which turned a board into a strip a finger tall with
   buildings a few pixels across. Correct arithmetic, unreadable result.

   So the board is drawn at a fixed scale and this scrolls to it, the way every map on a phone
   works. `overflow-x: auto` and nothing else: the SVG states its own width in pixels, so there is
   no aspect ratio to negotiate and nothing to recompute when the card resizes.

   `overscroll-behavior-x: contain` STOPS THE SWIPE ESCAPING. Without it, reaching the end of the
   board hands the gesture to the tab carousel underneath and somebody scrolling the street lands on
   a different screen — which is the one thing that would make this feel broken. */
```

### `.map` SETS `aspect-ratio: 3/4` — A PORTRAIT BOX, for the old flat map that filled it.

in `.map.ow`

```
/* `.map` SETS `aspect-ratio: 3/4` — A PORTRAIT BOX, for the old flat map that filled it. This
     board is a street: it is 460px tall whatever the town, and its width is however wide the town
     is. Inheriting a 3:4 box meant the container was tall and narrow while the board inside it was
     short and wide, which is the other half of why it looked lost in the middle of the card.
     The height is the board's own, stated once here so the card is exactly as tall as what is in
     it — no gap above, no gap below. */
```

### `.ow-name` AND `.ow-say` STOOD HERE — a floating plate naming whatever the walker was standing on, and a red box for a landmark that would not fit.

before `.fest`

```
/* `.ow-name` AND `.ow-say` STOOD HERE — a floating plate naming whatever the walker was standing
   on, and a red box for a landmark that would not fit. Both belonged to the three.js board: there
   is no walker now and nothing to fail to fit, because every landmark is drawn where the sheet says
   it is. Deleted rather than left: a rule styling an element nothing produces is a rule somebody
   reads and assumes is doing something. */
```

### FOUR OBJECTS BECAME ONE, AND THIS IS WHERE THE OTHER THREE LIVED.

before `.fest`

```
/* ==================================================================================================
   FOUR OBJECTS BECAME ONE, AND THIS IS WHERE THE OTHER THREE LIVED.

   `.rc` is drawn by one function and it is four things the app does: the booking form, the basket,
   the application you have handed in, and the session you have paid for. Each had its own skin —

     .scr   a dark terminal with scan lines and a blinking cursor
     .app   white paper, a red filing edge, an angled PENDING stamp
     .wl    an amber queue ticket with a dashed border
     .rc    cream, torn at both ends, a barcode

   — and each was argued for well, one at a time, on the grounds that a form is not a receipt and a
   queue ticket is neither. Every one of those arguments is true about the real objects. What they
   miss together is that the SAME BOOKING wore three of them over its life, so the document a family
   filled in, the document they were waiting on and the document they ended up holding could not be
   compared with each other — and none of the four was the black and gold that every other card on
   this site is drawn in.

   THE COST IS THE PART THAT IS NOT A MATTER OF TASTE. Four palettes on one markup means every
   control this document ever gains has to be coloured four times by hand, and the fourth is written
   by somebody who has forgotten the other three exist. `.rc .bk-*` was eleven rules doing exactly
   that for cream alone, four of them in raw hex.

   SO: ONE DOCUMENT, THE APP'S OWN CLOTHES, AND THE STAGE SAID IN WORDS. `jobSaid_` already returns
   the sentence — "Accepted, waiting for payment", "On the waiting list" — and a sentence is
   readable, translatable, and the same size in every skin, none of which a rubber stamp is.

   These 90 lines were reachable by nothing the moment the basket stopped asking for `kind:
   'screen'`; they are deleted rather than left commented, because a stylesheet should be the size
   of the app rather than the size of its history. The argument is kept because it is the expensive
   half: it took four goes to find out that the thing wrong with four good costumes is that there
   are four of them.
================================================================================================== */
```

### A FESTIVE EVENT IS AN INVITATION.

before `.fest`

```
/* ==================================================================================================
   A FESTIVE EVENT IS AN INVITATION.

   Not a receipt, not a form, not a queue ticket — it is the thing that arrives before any of those
   exist, and it is the only card on this site that goes to every family whether or not they have
   ever booked anything. So it is drawn as an invitation: the occasion large, the details under it,
   and a deckle edge rather than a torn one.

   GOLD, WHICH NOTHING ELSE HERE CLAIMS. Green is a subject, purple a venue, red a tutor, pink a
   level, amber a queue. Gold is the one colour the palette had spare, and an invitation is exactly
   the thing worth spending it on.
================================================================================================== */
```

### `.wk` AND ITS PARTS WERE HERE — the grid `Your week` drew.

before `.ow-c`

```
/* `.wk` AND ITS PARTS WERE HERE — the grid `Your week` drew. That widget is folded into the Timetable
   (see `tmtBooked_` in games.js), and its one idea, that a booked session is GREEN because a session
   is a subject, went with it to `.tmt-row.is-booked`. */
```

### THE OVERWORLD. ONE STREET, SEEN FROM THE SIDE, drawn as SVG.

before `.ow-c`

```
/* ==================================================================================================
   THE OVERWORLD.

   ONE STREET, SEEN FROM THE SIDE, drawn as SVG. It replaced a three.js scene that fetched 600KB to
   draw a dozen buildings at a camera angle that never moved — nothing here rotates, nothing is lit,
   and none of it needed a depth buffer. What makes it read as depth is the draw order and a shade,
   both of which cost nothing.
================================================================================================== */
```

### ---------- THE SVG KEEPS ITS OWN SIZE

before `.ow-c`

```
/* ---------- THE SVG KEEPS ITS OWN SIZE ------------------------------------------------------------
   `width: 100%; height: auto` WAS HERE AND IT UNDID THE WHOLE THING. The board states its width in
   pixels — 760 for Colliers Wood — and this forced it back to the card's width, about 360 on a
   phone. `height: auto` then scaled the height to match, so a board 460px tall drew at 218px: a
   third of the card, everything half size, and nothing to scroll because it had been made to fit.

   That rule was left over from the version before this one, where the SVG was meant to scale. It is
   the exact opposite of what this board needs, and it survived because a stylesheet rule that
   shrinks something is invisible unless you know what size it should have been.

   `flex: none` MATTERS TOO: inside a flex container an SVG will otherwise be squeezed to fit no
   matter what its width attribute says, which is the same fault wearing different clothes. */
```

### THE SVG BOARD'S RULES STOOD HERE — `.ow-b` for a wall, `.ow-w` for a lit window band, `.ow-n` for a node on the street, `.ow-leg` for the walker's legs.

before `.ow-tags`

```
/* THE SVG BOARD'S RULES STOOD HERE — `.ow-b` for a wall, `.ow-w` for a lit window band, `.ow-n`
   for a node on the street, `.ow-leg` for the walker's legs. None of them exist any more: the board
   is a canvas, and every colour in it is computed when the mesh is built and handed to the GPU as a
   vertex attribute. There is no element for CSS to reach.
   Deleted rather than kept — a rule styling something nothing produces is a rule somebody reads and
   believes is doing work. */
```

### ---------- THE NAMES ON THE BOARD

before `.ow-tags`

```
/* ---------- THE NAMES ON THE BOARD ---------------------------------------------------------------
   HTML over the canvas, positioned by the same camera matrix that draws the buildings. Text in
   WebGL means a font atlas and a quad per glyph; this is the browser's own type, at the phone's own
   size, and it took one projection rather than a rendering subsystem.

   `pointer-events: none` ON THE LAYER and `auto` on the labels — so the empty space between them
   passes the finger through to the board underneath and holding there still walks. A transparent
   div over a game that eats every touch is the classic version of this bug. */
```

### THE SIGNATURE UNDER A BOOK'S DRAWING ON THE SPLASH.

before `.sp-sig`

```
/* THE SIGNATURE UNDER A BOOK'S DRAWING ON THE SPLASH. A row's markup carries no name — a chapter page
   has its book's — so the picker in index.html adds this line as it draws one, and every loading
   screen says whose app it is. It stood under a header for the eleven visual proofs that were drawn
   here; they are rows of data/textbooks.json now (docs/history/304) and this is all that is left. */
```

### ---------- WHEN THE FAMILIES ON A WAITING LIST CAN COME

before `.wc`

```
/* ---------- WHEN THE FAMILIES ON A WAITING LIST CAN COME ------------------------------------------
   A tally, not a timetable. Each family answered for themselves and the class has no day yet — so
   this shows how many offered each slot, longest bar first, with the one everybody offered marked.
   Read by a tutor deciding what day to run it on, which is the only open question a waiting list
   has. */
```

### ---------- IT IS THE ANSWER CELL OF A RECEIPT ROW NOW, NOT A BLOCK UNDER THE RECEIPT

before `.wc`

```
/* ---------- IT IS THE ANSWER CELL OF A RECEIPT ROW NOW, NOT A BLOCK UNDER THE RECEIPT -------------
   `Can come`, see `jobRows`. So it takes the row's own type rather than setting its own — the
   `.76rem` and `.72rem` it carried were sized for a block standing alone on black, and inside `.bk`
   the row is the one place this card's font size is declared (see the note on `.bk`). The heading
   `.wc-say` went with the block: the row's label in `Q` says what the bars are. It was also the one
   PAPER colour in this group, on a card that has not been paper since the receipt took the app's
   own clothes — a token from the wrong palette, which is what CLAUDE.md's two-palette rule is for.

   LEFT-ALIGNED inside a right-aligned column, because a bar grows from the left and a count read
   down a list wants one edge. `.bk-v` right-aligns a short answer to sit against its figures; a
   bar has no figures beside it, and the row is bare so it spans to the card's edge anyway. */
```

### ---------- AND THE BARS TAKE THE THREE FIGURE TRACKS, ON THIS ROW ONLY

before `.bk-row.bk-tally .bk-v`

```
/* ---------- AND THE BARS TAKE THE THREE FIGURE TRACKS, ON THIS ROW ONLY ---------------------------
   MEASURED ON ITS FIRST SCREENSHOT: in the answer column alone the bars were 71px wide at 390 and
   58 at 320, and `Monday evening` came out as `Monda…` over `even…` — the row's own words clipped
   by the bar they sit on. The answer column on a receipt is sized for `GCSE` and `Autumn 2026`.

   THE ROW IS BARE — no multiplier, no rate, no total — so `is-bare` has already hidden the three
   spans those tracks hold, and the tracks are empty on this line. The bars START where every answer
   starts, at track 2, which is the one edge the note over `is-bare` says a reader runs down; they
   end at the card's edge, where the column heads and the total row already end. The rule that once
   did this for EVERY bare row was removed for making the dashes end in two places — a dash is a
   value, and a chart is not, so this is scoped to the one row that draws one. */
```

### A RIPPLE, A TIDE AND A SUNRISE WERE HERE — three loading splashes that taught nothing, gone on 10 Oct with their keyframes and their still (docs/history/322).

before `.bk:has(> .is-wide)`

```
/* A RIPPLE, A TIDE AND A SUNRISE WERE HERE — three loading splashes that taught nothing, gone on
   10 Oct with their keyframes and their still (docs/history/322). The solar system that stood among
   them is Kepler's third law and lives in Physics chapter 12 (docs/history/304). */
```

### ---------- A ROW WITH NOTHING IN THE FIGURE COLUMNS

before `.bk:has(> .is-wide)`

```
/* ---------- A ROW WITH NOTHING IN THE FIGURE COLUMNS ---------------------------------------------
   The multiplier, rate and total are a fixed 151px plus gaps on every row, reserved whether or not
   there is anything to put in them — so "Status · unconfirmed" had 59px for a word needing 74 and
   the two ran together. A row with no figures lets the value have that space instead.
   The columns still line up down the card: a row that spans has no figures to line up with. */
```

### THE SAME TWO COLUMNS AS EVERY OTHER ROW, so a card of mixed rows lines up down its left edge.

before `.bk:has(> .is-wide)`

```
/* THE SAME TWO COLUMNS AS EVERY OTHER ROW, so a card of mixed rows lines up down its left edge. This
   said `3ch 4.4rem` — the widths the main rule used before it was widened for "Possession" — so a
   bare row's label started in a different place from a priced one's, on the same card. Third copy of
   the same fault: a width stated twice and the second one forgotten. */
```

### AND THE TEMPLATE IS GONE, because a row inside `.bk` subgrids onto the card's tracks and a second template here would override it — the `.price.faint` shape

before `.bk:has(> .is-wide)`

```
/* AND THE TEMPLATE IS GONE, because a row inside `.bk` subgrids onto the card's tracks and a
   second template here would override it — the `.price.faint` shape, and on the one rule whose
   whole job is that the columns agree. What `is-bare` MEANS is unchanged and is stated below by
   hiding the three figure spans: a hidden span is not placed, so the label and the answer take
   tracks 1 and 2 and the money columns stand empty. The arithmetic above is kept because it is why
   the label track is `minmax` and not `max-content`. */
```

### ---------- AND THE LABEL COLUMN GIVES WAY WHEREVER NOTHING BESIDE IT WANTS THE ROOM

before `.bk:has(> .is-wide)`

```
/* ---------- AND THE LABEL COLUMN GIVES WAY WHEREVER NOTHING BESIDE IT WANTS THE ROOM -------------
   THE RULE OVER `.bk-row.is-blank` SAYS "a row with a real value keeps the fixed column, because
   there the two columns are genuinely competing for the width" — and on the RECEIPT they are not.
   Measured at 390px on a real session: `Per session` had a 68x30 label box, on two lines, beside a
   230px value column holding "1.5 hours". The label broke in half while two thirds of the room
   next to it went unused.

   SO THE FIX LANDED ON THE DASHES AND NOT ON THE ROWS SOMEBODY READS, which is this repository's
   own sentence about `cost: 0` and `paper: true` — repaired in the instance, not in the rule. It
   is the third round of the same fault: four labels shortened, then `max-content` for the blanks,
   and `Per session` still wrapping on every receipt in between.

   `minmax` RATHER THAN `max-content`, which is what the main rule tried and reverted: an unbounded
   `max-content` lets a long label hold the column open and squeeze the value ("No prefer- / ence").
   A floor of 6.2em keeps every receipt's labels starting in the same place as the form's, and the
   ceiling is the label itself — so it takes what it needs and not a pixel more, at any length
   somebody adds later.

   `rc-total` IS THE SAME SHAPE ONE ROW DOWN. Its figure is in the LAST column, so the three
   columns beside the label are empty — and `It would come to` is sixteen characters in a 6.2em
   column, which the note over `aside` already noticed and worked around by deleting something
   else. There is nothing there for a wider label to take. */
```

### ---------- `.bk-row.rc-total`'s THREE COLUMNS WERE HERE, AND THE ROW HAS NONE NOW

before `.bk:has(> .is-wide)`

```
/* ---------- `.bk-row.rc-total`'s THREE COLUMNS WERE HERE, AND THE ROW HAS NONE NOW ----------------
   IT DECLARED `auto minmax(0, 1fr) max-content` at its own block and lost that to `.bk-row` sixty
   lines later — a declaration that read as a decision and behaved as nothing, the fourth conviction
   of that rule in this stylesheet after `.price.faint`, `--fly-ink` and `.bk-row.is-blank`. It was
   restated here, where it wins, and the restatement lasted until the owner asked for the total to be
   *"styled like everything else"*.

   THE ROW IS INSIDE `.bk` NOW AND SUBGRIDS LIKE THE REST, so it has no template of its own to win
   or lose with — which is the one arrangement where the fault cannot come back. The argument is
   kept because the SHAPE is what recurs: a row given its own `grid-template-columns` at one
   specificity, beside a `.bk-row` rule at the same one, is decided by file order. */
```

### ---------- AND THE FIGURE COLUMN WAS NEVER WIDE ENOUGH FOR THE FIGURE

before `.bk:has(> .is-wide)`

```
/* ---------- AND THE FIGURE COLUMN WAS NEVER WIDE ENOUGH FOR THE FIGURE ---------------------------
   `£270.00` OVERFLOWED ITS OWN COLUMN BY 18px, and `£2050.00` in the basket by 28. Three facts
   meet and each is reasonable on its own: the track is `7.5ch`, `ch` is measured against the ROW's
   proportional font, and `.bk-t` renders in `--mono` — at `1.05rem` and `700` on the total row,
   which is the one place the figure is deliberately bigger than everything around it. A column
   sized for seven narrow characters, handed eight wide ones in bold.

   `max-content` ON THE LAST COLUMN ONLY, and only on the two rows where nothing competes for it:
   a total row has an empty value column beside it, and a basket line is a title and a price. Every
   other row keeps the fixed 7.5ch, because there the figures have to line up DOWN the card and a
   per-row width is exactly what would stop them.

   NEITHER OF THESE HAD EVER BEEN LOOKED AT. `check/ui.js` had no receipt state until now, and the
   basket draws nothing unless `CART` has something in it — which a fixture cannot put there,
   because it lives in `localStorage`. Both are declared states in that file now, and both findings
   came from their first run. */
```

### A BASKET CARD IS TWO COLUMNS, SO IT SAYS SO ON THE CARD.

before `.bk:has(> .is-wide)`

```
/* A BASKET CARD IS TWO COLUMNS, SO IT SAYS SO ON THE CARD. The template moved off the row for the
   reason over `is-bare`: inside `.bk` a row subgrids, and a template here would win on order and
   take the alignment back. `:has` reads the rows the card actually holds — a basket is never mixed
   with booking rows, so the card either is one or is not. */
```

### ---------- AND A BLANK ROW'S LABEL COLUMN GIVES WAY INSTEAD OF THE LABEL

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* ---------- AND A BLANK ROW'S LABEL COLUMN GIVES WAY INSTEAD OF THE LABEL -------------------------
   THE COLUMN GIVES WAY, NOT THE LABEL, and the first version of this got that backwards. `Extra
   subj.` and `Per session` are the only two of the spine's twenty-eight labels one character too
   long for 6.2em, so on an empty form those two blank rows were 30px where the other eleven were
   15 — twice the height of a row with nothing in it, on the two rows with nothing in it. Setting
   `white-space: nowrap` on them fixed the height and broke the width: `check/ui.js` named
   `span.bk-k overflows by 3px` at four widths, which is the row taking the card sideways rather
   than the row being tall.

   `max-content` ASKS FOR EXACTLY WHAT THE LABEL NEEDS and the dash takes what is left, so nothing
   wraps AND nothing overflows, at any label length somebody adds later. A row with a real value
   keeps the fixed column, because there the two columns are genuinely competing for the width.

   HERE RATHER THAN BESIDE `.bk-row.is-blank`, which is where it was written and where it did
   nothing: both selectors are two classes, `.is-bare` comes 3,000 lines later, and the cascade
   settles a tie by order. The measurement is what caught it — the rows went back to 481px under a
   rule that read as though it had fixed them. Same fault as `.price.faint`. */
```

### ---------- AND THE DASH ENDS WHERE EVERY OTHER VALUE ENDS

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* ---------- AND THE DASH ENDS WHERE EVERY OTHER VALUE ENDS ---------------------------------------
   TWELVE OF THE FORM'S TWENTY-EIGHT ROWS ARE A DASH, and on two columns their dash landed at the
   card's right EDGE while an answered row's value ended two-thirds of the way across — where the
   ordinary five-track grid stops its value column and hands the rest to the multiplier, the rate
   and the total. So the right side of the card zigzagged between two x positions, twenty-eight
   times down a document whose whole job is to look printed. Photographed, which is the only way it
   was ever going to be found: nothing overflowed, nothing was clipped, and every row measured
   exactly what it asked for.

   THE THREE TRAILING TRACKS ARE KEPT AND LEFT EMPTY. `.bk-row.is-bare` already hides `.bk-m`,
   `.bk-r` and `.bk-t` on these rows, so nothing is placed in them — but a track that exists still
   takes its width, which puts the end of the value column in the same place on every row of the
   card. The alternative is a right margin computed from the other three widths, which is the same
   number written twice and the fault this stylesheet keeps paying for.

   `max-content` ON THE LABEL STAYS. `Extra subj.` and `Per session` are the two labels one
   character too long for 6.2em, and the note over `is-bare` records what the fixed column did to
   them. Where the label overhangs, the value column gives way — which changes where the dash
   STARTS and not where it ends, and the end is the edge somebody reads. */
```

### AND THIS TEMPLATE IS GONE TOO, for the reason over `is-bare` — and it is the rule that made the fault visible.

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* AND THIS TEMPLATE IS GONE TOO, for the reason over `is-bare` — and it is the rule that made the
   fault visible. `max-content` here was PER ROW, so `Dates` started its dash at 44.3, `Status` at
   50.8 and `Extra subj.` at 83 while every answered row started at 80.1: four left edges down one
   card, on the rows that have nothing to say. The card's own `minmax(6.2em, max-content)` resolves
   once across every label, so the dash starts where every other answer starts. */
```

### ---------- A ROW WITH NO FIGURES DRAWS NO FIGURES, AND KEEPS THE TRACKS ANYWAY

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* ---------- A ROW WITH NO FIGURES DRAWS NO FIGURES, AND KEEPS THE TRACKS ANYWAY -------------------
   ALL THIS DOES NOW IS HIDE THREE EMPTY SPANS. It used to hand their width to the answer as well —
   `.bk-v { grid-column: 2 / -1 }`, removed above with the measurement that convicted it — so the
   part that is left is the part that was never the problem: an empty `.bk-m` and no `.bk-m` render
   the same, and hiding them is what `is-bare` already means one rule along.
   THE TRACKS STAY BECAUSE THE CARD OWNS THEM. They are declared on `.bk` and every row subgrids, so
   a row that draws nothing in the money columns still lines up with the row above it that does.
   That is the whole of *"each field in its correct column"*, and it is why this rule can be about
   ink rather than about width.
   THE HEADER IS EXCLUDED FROM ITS OWN TEST. `spineHead_` writes `+` into a `.bk-t`, so a header row
   would otherwise read itself as priced — harmless now that nothing here moves a column, and kept
   because the exclusion is what says the head is not a row of the document.
   `.is-wide` is the basket, whose card is two columns by its own rule and must not be touched. */
```

### ---------- AND A DAY ROW IS THE ONE THAT CARRIES A MULTIPLIER WITHOUT A TOTAL

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* ---------- AND A DAY ROW IS THE ONE THAT CARRIES A MULTIPLIER WITHOUT A TOTAL --------------------
   THE TEST IS `.bk-t`, WHICH IS THE RIGHT QUESTION FOR EVERY OTHER ROW: a priced row has a running
   total, and a row with no total has no figures at all. A day row breaks that in one direction — its
   `× 3` is how many hours that day is, and a day has no running total, because the price is a
   product over the whole week rather than per day.

   SO WITHOUT THIS THE FIGURE WOULD HAVE BEEN WRITTEN AND HIDDEN, which is the worst of the three
   outcomes: the markup says `× 3`, the card shows nothing, and nothing anywhere says why. Narrowed
   to `.bk-wk` rather than widened to "any non-empty figure" — that wider rule also un-hides the `—`
   a rate multiplier of exactly 1 writes into its own column, which is a separate decision on
   twenty-odd other rows and not this one's to make. */
```

### ---------- AND THE DATES ROW IS THE SECOND OF THOSE, ASKED FOR BY NAME

before `.bk-row:not(.is-cols):not(.is-wide):not(.bk-wk):not(:has(.bk-dates)):not(:has(.bk-t:not(:empty))) .b …`

```
/* ---------- AND THE DATES ROW IS THE SECOND OF THOSE, ASKED FOR BY NAME --------------------------
   `× 36` IS HOW MANY DATES THE ROW LISTS, and a list of dates has no running total for the same
   reason a day has none: the price is a product over the whole booking rather than per date. So the
   count would have been written into the markup and painted nowhere, which is exactly what happened
   to `× 3` the first time and took a browser to find.
   `:has(.bk-dates)` RATHER THAN A CLASS ON THE ROW, because `dates: true` already puts that span on
   this row and nothing else — a second flag naming the same row is a second thing to keep in step.
   STILL AS NARROW AS `.bk-wk` IS, and the general rule is still refused for the reason above. Worth
   recording what that refusal now costs: `out.mul = '—'` on a `rate-mult` whose multiplier is
   exactly 1 is written, has no total beside it, and is therefore hidden on every card — so the
   comment defending it ("it read as a blank row, which looks like a value that failed to load") is
   describing a dash nobody has ever seen. A real finding, on twenty-odd rows, and not this one's to
   act on. */
```

### ---------- AND THE ANSWER STAYS IN THE ANSWER COLUMN

before `.bk-row.is-cols`

```
/* ---------- AND THE ANSWER STAYS IN THE ANSWER COLUMN --------------------------------------------
   THE LINE HERE SAID `.bk-v { grid-column: 2 / -1 }` and it is the other half of why nothing lined
   up. A row with no figures gave its answer the three money tracks as well, so on one priced card
   `Subject` ended at 319.9 and `Tutor` at 158.3 — two right edges, twenty-eight rows apart, under a
   head that named five columns.
   *"each field in its correct column"* is what settles it: an answer is column A whether or not the
   row beside it happens to carry a price. What the three money columns hold on such a row is
   nothing, which is the honest reading of a row that costs nothing.
   WHAT IT COSTS IS THE ANSWER COLUMN'S WIDTH and it is real: at 390 a value box goes from 240px to
   78. Every priced row was already 78 — that is what "two editable fields, one above the other, in
   two sizes" meant — so this is the card settling on the narrower of two widths it already had,
   not a new one. The hiding below stays: an empty `.bk-t` and no `.bk-t` render the same, and the
   hiding is what `is-bare` already means. */
```

### ---------- THE FIGURE COLUMNS STAY ON AN UNPRICED CARD, FOURTH TIME OF ASKING

before `.bk-row.is-cols`

```
/* ---------- THE FIGURE COLUMNS STAY ON AN UNPRICED CARD, FOURTH TIME OF ASKING --------------------
   A RULE THAT COLLAPSED THEM WAS HERE AND IS GONE. It hid `.bk-m`, `.bk-r` and `.bk-t` on every row
   of a card carrying no totals, and let the value span `2 / -1` to take the width back — written
   from *"I want all input fields in 1 column"*, and reported the next morning with a photograph of
   a form headed `ANSWER` and nothing else: *"now there's only 2 columns again. Resume the 4-5
   columns."* Written, reverted, written, reverted. It is not coming back a third time; the header
   row names the columns and the columns are always there, which is what "resume" means.

   WHAT IT COSTS IS THE ANSWER COLUMN, and the number is the whole reason it kept being written:
   with the three figure tracks present a value is **56.3px at 320, 75.3px at 390 and 80.9px at
   768**, measured off the card's own `grid-template-columns`. That is what an answer had before any
   of this and it is what it has again — and since the card became one grid it is what EVERY answer
   has, priced or not, which is the half that was missing every previous time.

   AND THE WEEK IS AN ANSWER LIKE ANY OTHER NOW, WHICH IS THE THIRD ROUND OF ONE ASK.
   *"Have the grid be in only one column. The second column. The input column."* Its LEFT edge was
   always that column; its right edge spanned into the multiplier for one commit, on the argument
   that a day row could never fill that track. It fills it — a day's hours are a `× 3` — so the
   week stops at the answer column's own edge and every field on the card, the week included, is
   one column wide.

   WHAT IT COSTS: ten hours and their gutters in the answer track's 56.3 / 75.3 / 80.9px is a
   **4.7 / 6.6 / 7.2px** cell, down from 8.97 / 11.69 / 12.48. That is the largest compromise on
   `ACCEPTED_TAP`'s list and it was asked for in those words — *"i dont care if its really thin
   now"*. Turning the week on its side does not save it — seven day-columns in 75.3px is 10px —
   and the figure tracks cannot give the room back, because they hold `× 6`, `£12.00/h` and
   `£144.00` and those are 148px of digits.
   THE HOUR NUMBERS COULD NOT SURVIVE IT and say their span instead — see `.wk-hh.wk-rule`. */
```

### ---------- AND THE SMALL ROW THAT SAYS WHICH COLUMN IS WHICH

before `.bk-row.is-cols`

```
/* ---------- AND THE SMALL ROW THAT SAYS WHICH COLUMN IS WHICH -------------------------------------
   *"Label each column at the top. Small"* — and small is the requirement, not the decoration. The
   headings this card carried before were deleted for being *"the widest band of text on the card"*,
   so this is .58rem of tracked uppercase in the faint ink: read once, then scanned past. It reads
   as a caption rather than as a row of the document, which is what stops it being counted among the
   twenty-eight lines somebody already said were too many.

   NO DASHED UNDERLINE ON ITS VALUE. `.bk-v` carries one on every ordinary row because that is where
   an answer goes; under a column NAME it would read as a field waiting to be filled in. The rule
   under the whole row is what closes the header off, and it is the same dashed line the card uses
   everywhere else.

   AND ITS FIGURES ARE NOT IN `--mono`. `.bk-m`, `.bk-r` and `.bk-t` are monospaced because they hold
   digits that have to line up down a column; `×`, `+/h` and `+` are not figures.

   IT NAMES ALL FIVE ON EVERY CARD NOW. It used to collapse to two with the columns it named, under
   the rule that hid them on an unpriced form — which is what produced a form headed `ANSWER` and
   the report that the columns had gone again. The columns are permanent; so is the header. Its own
   job is exactly that: the empty space right of a dash is three named columns waiting for a price,
   which is the only thing that makes the card's two right edges read as a layout rather than as a
   row that stopped early. */
```

### ---------- AND IT IS TRIMMED TO WHAT THE TIGHTEST CARD CAN PAY

before `.bk-row.is-cols`

```
/* ---------- AND IT IS TRIMMED TO WHAT THE TIGHTEST CARD CAN PAY -----------------------------------
   THE WAITING-LIST BRANCH IS THE ONE THAT DECIDES THESE FOUR NUMBERS, not taste. It runs 812px of
   content into an 805px pane at 768 the moment anything is added — its own note records it arriving
   with three pixels spare at 390 and eight at 768 — so a header at an ordinary line-height put it
   11px past the fold and `check/ui.js` named it. Eight came back by letting this row's rule replace
   the `.rc-rule` above it; the rest is here: 1.15 rather than 1.4, almost no padding under the
   words, and no margin at all under the rule, because a `.bk-row` has none either and the border IS
   the separation. Measured at 17.8px and 12.1px, and `under` at 7 and 0. */
```

### ---------- AND `text-transform: uppercase` WENT WHEN THE WORDS BECAME SYMBOLS

before `.bk-row.is-cols`

```
/* ---------- AND `text-transform: uppercase` WENT WHEN THE WORDS BECAME SYMBOLS --------------------
   IT WAS HERE FOR `ANSWER`, `RATE` AND `TOTAL`. The five headings are `Q A × +/h +` now, and the only
   letter left for it to touch is the `h` of `+/h` — which it raised to `H`, a header spelling the
   unit one way over a column of `£12.00/h` spelling it the other. Nothing else in the row changes
   under it, so it bought one wrong character and nothing at all. The tracking stays: it is what
   still reads these five as a label rather than as a row of the document. */
```

### THE GAP ABOVE IT WAS THE DELETED RULE'S.

before `.bk:has(.bk-row.is-cols)`

```
/* THE GAP ABOVE IT WAS THE DELETED RULE'S. `.bk` opens with `.4rem` of margin because a `.rc-rule`
   and its own `.22rem` used to sit above that; with the header doing the separating there is one
   line where there were two, and the margin is sized for the pair. Off `:has` rather than a class
   on `.bk`, so it is true exactly when the header is drawn and there is no second place to set it. */
```

### ---------- AND `Q` TOOK THE LABEL COLUMN'S OWN INK

before `.bk-row.is-cols .bk-k`

```
/* ---------- AND `Q` TOOK THE LABEL COLUMN'S OWN INK -----------------------------------------------
   `.bk-k { color: var(--dim) }` IS A DECLARATION ON THE SPAN and `.bk-row.is-cols { color:
   var(--faint) }` is on the row, so the row only ever INHERITS — and a direct declaration beats
   inheritance at any specificity. Measured: `Q` came out `#9a9a9a` at 6.99:1 and `A × +/h +` came
   out `#808080` at 4.98:1, which is `Venue` and `Subject` and every other label in that column
   EXACTLY. One heading a step louder than the other four, in the ink of the rows it heads, starting
   at the same x — which is the one thing the row's own tracking is there to prevent.
   THE OTHER FOUR EACH CARRY `color: inherit` AND WERE WRITTEN TO DEFEAT THIS. `.bk-k` has none
   because until the heads went on it was EMPTY, and a rule that paints nothing cannot be seen to be
   wrong. `.price.faint` again, and the twelfth conviction of it in this stylesheet.
   NEITHER CHECK CAN SEE IT, and that is worth knowing rather than assuming: `check/cascade.js` pairs
   two rules matching ONE element at equal specificity, and here the loser is inheritance rather than
   a rule; `check/ui.js`'s contrast rule wants under 4.5:1 and both of these pass. */
```

### ---------- A NAME AND A PRICE, WHICH IS NOT WHAT SIX COLUMNS ARE FOR

before `.bk-row.is-wide .bk-n, .bk-row.is-wide .bk-k, .bk-row.is-wide .bk-m, .bk-row.is-wide .bk-r`

```
/* ---------- A NAME AND A PRICE, WHICH IS NOT WHAT SIX COLUMNS ARE FOR --------------------------------
   THE BASKET IS THE OTHER SHAPE. A booking row is a short label and a short answer with three
   figures beside it; a basket row is one long title and one number. In the 4.5em value column a
   paper's name came out a word per line, six lines tall, with the price clipped off the right.

   TWO COLUMNS: the name takes everything going, the total keeps its width. The label, the line
   number, the multiplier and the rate are not hidden because they are unwanted — they are empty,
   and an empty column is width taken from the only one that needs it. */
```

### `:not(.is-wide)` BECAUSE A BASKET LINE CAN BE BOTH.

before `.bk-row.is-bare:not(.is-wide) .bk-m, .bk-row.is-bare:not(.is-wide) .bk-r, .bk-row.is-bare .bk-t`

```
/* `:not(.is-wide)` BECAUSE A BASKET LINE CAN BE BOTH. A paper with no page count has no figure, so
   `receiptRow` marks it bare as well as wide, and two rules at one specificity both hiding `.bk-m`
   and `.bk-r` is a tie settled by file order — harmless while they agree, and the first thing that
   goes wrong the day one of them changes. `is-wide` already says what those two columns are on a
   basket line, so this one stands aside. */
```

### AN OPEN WAITING LIST — A TICKET, NOT A CARD.

before `.cpn`

```
/* ==================================================================================================
   AN OPEN WAITING LIST — A TICKET, NOT A CARD.

   It was the same grey stub as a booking you already own, which is the right treatment for a thing
   you have and the wrong one for a thing being offered. Two different kinds of object, drawn alike.

   THE TORN EDGE IS THE WHOLE DEVICE. A row of half-circles bitten out of the left side, in the page
   colour, so it reads as something detached from a sheet. One gradient, no images, and it is the
   difference between a card and a coupon.
================================================================================================== */
```

### ---------- THE FAVOURITE STAR

before `.favwrap`

```
/* ---------- THE FAVOURITE STAR ---------------------------------------------------------------------
   `.favwrap` HAD NO RULES AT ALL and the button was called `.fav`, which was already the FAVICON on
   a link card — absolutely positioned, eighty per cent of the card, with a solid background. Every
   star came out as a black rectangle over the thing it was meant to mark.

   The wrapper only exists to give the button something to be positioned against, so it does the
   least a wrapper can: it becomes the containing block and changes nothing else. */
```

### ---------- `.star` WAS HERE

before `.fm-bar`

```
/* ---------- `.star` WAS HERE ----------------------------------------------------------------------
   A round button pinned to the top-right corner of every card. It is a tile in the action row now —
   see `favTile_` — so the corner is empty and these rules had nothing left to position.

   `.favwrap.is-fav` STAYS and is used below: a kept card still marks itself as kept, which is a fact
   about the card and outlives the button that set it. */
```

### THE FLYER MAKER — every rule under `.fm`, and every colour `--fly-` prefixed.

before `.fm-bar`

```
/* ==================================================================================================
   THE FLYER MAKER — every rule under `.fm`, and every colour `--fly-` prefixed.

   IT LIVED IN A SECOND FILE and the reasons were real: a print tool wants a fixed 210mm page and
   this app is fluid and phone-first. Two things made it worth solving here instead — a second file
   is a second thing to deploy and remember, and it carried its own copy of the brand and the venue
   rates, which drift from the sheet the first time a price changes.

   THE COLOURS ARE PREFIXED BECAUSE THEY WOULD OTHERWISE REPAINT THE APP. A flyer sets its own ink,
   accent and ground; written as `--ink` they would land on the same custom property this stylesheet
   uses everywhere and take the whole interface with them. Uglier names, and nothing to go wrong.
================================================================================================== */
```

### ---------- THE CONTROLS, PACKED

before `.fm-bar`

```
/* ---------- THE CONTROLS, PACKED --------------------------------------------------------------
   AS A WRAPPING FLEX ROW THEY FILLED A PHONE SCREEN before any paper was visible — five labels,
   each on its own line, and the flyer somewhere below the fold. The point of drawing it underneath
   is that you see the change as you make it, and that is lost if you have to scroll to find it.
   A grid of even columns instead: three across on a phone, more on anything wider. */
```

### ---------- A ROW FOR AN ANSWER IN WORDS, HALF A ROW FOR A WORD, A SIXTH FOR A COLOUR

before `.fm-bar`

```
/* ---------- A ROW FOR AN ANSWER IN WORDS, HALF A ROW FOR A WORD, A SIXTH FOR A COLOUR ---------------
   EVEN COLUMNS CUT THE ANSWERS. With the flyer's eight dropdowns in the select rule's own field (note
   315), two even columns at 390 left 96px of room beside the arrow, and the review of 9 October found
   half the defaults cut there — `Back to …`, `Waiting …`, `Colliers…`, `A5 · hal…` — where the old
   small boxes had cut two. The answers are the campaign's name, the venue's, a size in words: data, in
   a monospace face, twenty-one characters for `Colliers Wood Library`. The card is under 380px wide at
   every size measured (218 / 272 / 376 / 342 at 320 / 390 / 768 / 1280), so no two of those can ever
   sit side by side in it whole.

   SO SIX TRACKS, AND EACH CONTROL TAKES WHAT ITS ANSWER NEEDS: a select whose answer is words is the
   whole row (the labels with no class), one whose answer is a number is half (`fm-half`: Hours, To a
   class), and a colour well a third (`fm-ink`), the three wells one row. Style is a word and has a row:
   beside the three wells it left each a sixth, 31px at 320, and a well is a fingertip's target like
   any other (`check/ui.js` said so the first time this was tried). Two rows taller than the even grid,
   and the controls already scroll inside `.widget-squeeze`. */
```

### `.fm-bar select` WAS HERE AT .78rem IN A 1.7rem BOX — a flyer's eight dropdowns drawn smaller than every other select in the app, under the 16px an iPhone

before `.fm-bar select`

```
/* `.fm-bar select` WAS HERE AT .78rem IN A 1.7rem BOX — a flyer's eight dropdowns drawn smaller than
   every other select in the app, under the 16px an iPhone zooms on and under a fingertip. They are the
   select rule's own field now (note 315: one dropdown everywhere), 44px and 16px.

   EXCEPT UNDER 348px WIDE, WHERE THE WORDS GIVE WAY BEFORE THE ANSWER IS CUT. A whole row at 320 is
   184px of room and `Colliers Wood Library` is 197px at 16px, so the answer comes down with the screen:
   `4.6vw` is 14.7px at 320, where both twenty-character defaults fit, and 16px from 348 up. In `vw`
   because the root's rem stops shrinking at 13.5px, under this width. The box stays 44px, which is the
   fingertip; iOS does not zoom into it, for the reason the booking row gives (`maximum-scale=1`). */
```

### ---------- A TICKBOX HAS TO BE VISIBLE ON A BLACK SCREEN

before `.fm-adds input`

```
/* ---------- A TICKBOX HAS TO BE VISIBLE ON A BLACK SCREEN --------------------------------------
   `accent-color` ONLY COLOURS A TICKED ONE. An unticked native checkbox on this theme is a dark
   square on a dark background — every switch looked off, including the seven that were on, so the
   one control that says what is on the flyer said nothing at all.
   Given a border and a lighter ground it reads either way. */
```

### DRAWN, NOT STYLED. Giving a native checkbox a background is what killed it:

before `.fm-adds input`

```
/* DRAWN, NOT STYLED. Giving a native checkbox a background is what killed it: the browser stops
   drawing its own control and there is nothing to replace the tick, so a ticked box and an unticked
   one looked identical — every switch appeared off, including the seven that were on.
   `appearance: none` takes it over completely, and the tick is a rotated L drawn in the box. */
```

### `min-height: max(44px, 2.9rem)` IS SET ON EVERY INPUT in this stylesheet — the touch-target rule, and right for a field somebody types in.

in `.fm-adds input`

```
/* `min-height: max(44px, 2.9rem)` IS SET ON EVERY INPUT in this stylesheet — the touch-target
     rule, and right for a field somebody types in. A tickbox is not that: it stretched to 44px tall
     and 16px wide, so every switch was a coloured domino. `min-height` has to be unset by name,
     because `height` alone loses to it. The touch target is kept on the LABEL instead, which is
     what a thumb actually lands on. */
```

### ---------- 2rem IS 27px ON A PHONE, AND THIS IS THE THIRD TIME

before `.fm-adds label`

```
/* ---------- 2rem IS 27px ON A PHONE, AND THIS IS THE THIRD TIME -----------------------------------
   THE NOTE ABOVE GETS IT RIGHT AND THE NUMBER GETS IT WRONG: the tickbox is 17px by design and the
   touch target is kept on the label, which is what a thumb lands on. The label was then given
   `2rem`, and line 121 sets the root to `clamp(13.5px, 3.8vw, 16px)` — so 2rem is 27px at 320 and
   30px at 390. The target that was moved to the label was never 44px anywhere.

   CLAUDE.md ALREADY HAS THIS ENTRY TWICE: `.btn.tiny` at `max(38px, 2.3rem)` and `.post-act` at
   `min-width: 2.2rem`, both fixed, both written up, and the rule stated — tap targets in px,
   everything else in rem, because a fingertip is the same size on every screen. This is the same
   mistake a third time in a widget nothing was measuring. */
```

### THE THREE SHAPES A FLYER CAN BE — and they are buttons, which means a finger has to land on them.

before `.fm-pre`

```
/* THE THREE SHAPES A FLYER CAN BE — and they are buttons, which means a finger has to land on them.
   They were 21px tall at 320 and 23 at 390: `padding: .2rem .45rem` on a .66rem line, which is a
   size chosen by what looked right beside the switches rather than by what a thumb needs. 44px in
   px, like every other target on this site, and the row already wraps so the extra height costs
   nothing but the row's own height. */
```

### ---------- THE PAPER

before `.fm-out`

```
/* ---------- THE PAPER --------------------------------------------------------------------------
   Sized in millimetres, because that is what it is. Scaled to the screen by `flyFit`, which sets
   the transform — the origin is top left so the scaled sheet does not drift off to one side. */
```

### ---------- HIDDEN, AND NOTHING IS HIDDEN BY IT

before `.fm-out`

```
/* ---------- HIDDEN, AND NOTHING IS HIDDEN BY IT --------------------------------------------------
   I CHANGED THIS TO `overflow-x: auto` AND THE REASON WAS WRONG. `check/ui.js` reported it
   overflowing by 593px at 320 and I believed it, because CLAUDE.md already carried the same finding
   about `.mat-out` — "a fixed paper width clipped with no way to reach the rest of the page you are
   about to print". Two entries agreeing, neither measured.

   `flyFit` SCALES THE SHEET TO THE BOX, with a transform, exactly as `matFit` does for the cheat
   sheet. `scrollWidth` is a LAYOUT width and a transform is painted after layout, so a 794px A4
   page drawn at 0.3533 still reports 794 inside a 280px box. Measured with rectangles, which do
   account for transforms: the sheet's rendered right edge is 335 and the box's right edge is 335.
   Nothing was ever clipped, at any width.

   SO IT IS HIDDEN AGAIN, and `check/ui.js` now asks the second question in pixels somebody can see
   — see the note on its overflow pass. `overflow-x: auto` was not harmless either: it put a real
   scrollbar under a sheet that is entirely on screen. */
```

### ---------- AND NOW THERE IS NO PREVIEW AT ALL

before `.fm-out`

```
/* ---------- AND NOW THERE IS NO PREVIEW AT ALL -----------------------------------------------------
   Asked for as "for make a flyer remove the preview". `.fm-out` is the paper `fm-print` builds at the
   end of `body` for the length of a print dialogue and removes afterwards; on screen it is never
   seen and never takes a tap, and the print rules below make it visible. What the card shows in its
   place is `.fm-said`, one line saying what the Print button will put on the paper. */
```

### ---------- THE ONE PLACE A BACKGROUND MUST SURVIVE THE PRINTER

before `.fm-fly`

```
/* ---------- THE ONE PLACE A BACKGROUND MUST SURVIVE THE PRINTER ----------------------------------
   EVERYWHERE ELSE ON THIS SHEET A FILL WAS REMOVED, because a browser drops backgrounds when it
   prints and a mark that only exists on screen is a mark that lies. A flyer is the exception and
   the opposite: the ground colour IS the flyer. Dropped, a loud one prints as pale ink on white
   paper — which is not a plainer flyer, it is an unreadable one.
   SO IT IS ASKED FOR EXPLICITLY, on the flyer and nothing else. It inherits, so the rule, the QR
   panel and anything else inside come with it, and no cheat sheet component is affected. This costs
   ink on purpose and only when a flyer is on the paper. */
```

### ---------- THE FOUR STYLES

before `.fm-s-minimal .fm-head`

```
/* ---------- THE FOUR STYLES --------------------------------------------------------------------
   They differ in how much the page says and how loudly, which is the only distinction worth four
   options. Anything more would be four arrangements of one idea. */
```

### LOUD — the cheap advert.

before `.fm-s-loud`

```
/* LOUD — the cheap advert. The joke is the format, so the format has to be right: yellow ground,
   black bars, everything shouting, a number set larger than it has any right to be. It reads as a
   gag because it is doing the opposite of the other three, and a parody of restraint is only funny
   next to restraint. The genre is borrowed — every minicab card through a letterbox — not any
   particular thing. */
```

### ---------- SMALLER SIZES ARE NOT THE SAME FLYER SHRUNK

before `.fm-z-a6 .fm-fly`

```
/* ---------- SMALLER SIZES ARE NOT THE SAME FLYER SHRUNK ----------------------------------------
   Scaling everything by a third gives 5pt facts nobody reads and a headline that stops looking
   deliberate. Each size gets its own padding and headline, so an A6 is a small flyer and a sticker
   is a different object. */
```

### ---------- THE QR, AND WHAT HAPPENS WITH NO SIGNAL

before `.fm-qr`

```
/* ---------- THE QR, AND WHAT HAPPENS WITH NO SIGNAL --------------------------------------------
   The code is drawn by a public service, so offline the image fails — and a failed image prints an
   empty box with a broken-picture icon in it. `onerror` marks the flyer and the whole block goes,
   padding included, so an offline flyer is simply one without a QR: a complete object. */
```

### ---------- WITH ALMOST NOTHING ON IT, IT CENTRES

before `.fm-fly.bare`

```
/* ---------- WITH ALMOST NOTHING ON IT, IT CENTRES ----------------------------------------------
   A name and a QR pushed to the top left looks like something that failed to load. Centred, the
   little that is left reads as deliberate, which is the difference between a sticker and an
   accident. */
```

### PRINTING FROM INSIDE THE APP.

before `@media print`

```
/* ==================================================================================================
   PRINTING FROM INSIDE THE APP.

   A BROWSER PRINTS THE WHOLE DOCUMENT. Without this, printing would put the column, the tab bar and
   the sheet's own chrome on the paper — which is the real reason this lived in a separate file.

   `printing-fly` IS SET ONLY WHILE PRINTING, so a print started anywhere else in the app is
   untouched. Everything is hidden, then the paper alone is lifted out of the flow at the top left
   of the page at its true size.
================================================================================================== */
```

### ---------- THE BODY IS STILL A 26.5rem COLUMN, AND THAT IS WHAT CLIPS THE PAGE

in `@media print`

```
/* ---------- THE BODY IS STILL A 26.5rem COLUMN, AND THAT IS WHAT CLIPS THE PAGE ----------------
     THE SAME FAULT THE CHEAT SHEET HAD, and it is still here. `body` is a centred column about
     115mm wide with `overflow-x: clip` and `position: relative`, so a 210mm sheet positioned
     `absolute; left: 0` inside it starts where the COLUMN starts rather than where the paper does,
     and everything past 115mm is clipped off the page. What comes out is a flyer shifted right by
     half the margin with its right-hand half missing.

     `printing-mat` turns those three things off — see the block at the foot of the mat rules —
     and this one never did, so one of the two printable tools in this app prints correctly and the
     other does not. Same three lines, same reason.

     AND THE WIDTH IS STATED. `.fm-out` is as wide as the column it sits in; the paper is 210mm.
     Without this the sheet is laid out to the phone-width box and then told not to scale. */
```

### THE MATHS MAT — every rule prefixed `mat-`, and every colour its own.

before `.mat-pick`

```
/* ==================================================================================================
   THE MATHS MAT — every rule prefixed `mat-`, and every colour its own.

   THE SHEET IS A PIECE OF PAPER INSIDE A DARK APP, so it sets its own ink and ground rather than
   inheriting. Prefixed names because `.hun`, `.tt` and `.nl` are the kind of short class that will
   collide with something eventually — and the flyer maker already taught this lesson, where `.fav`
   was a favicon and a star button at the same time and every star came out as a black rectangle.
================================================================================================== */
```

### ---------- THE CHOICES, ONE ABOVE THE OTHER

before `.mat-pick`

```
/* ---------- THE CHOICES, ONE ABOVE THE OTHER --------------------------------------------------------
   THEY WERE FIFTEEN PILLS IN FIVE ROWS — ten levels, two tiers, three "given" filters — and 288px of
   a 534px pane on a 320x568 phone before the first piece. The pills had been made hittable the hard
   way (44px in px, because 2.75rem is 40.75px on a phone — measured, and the reason is written up
   where tap targets are), and a hittable pill is still a pill. Two selects say the same two things
   in two rows, and each is the global `select` rule's own 44px control — nothing here sets a height.

   STACKED, AND NOT SIDE BY SIDE, AT EVERY WIDTH. The text is 16px because anything smaller makes
   iOS zoom the page on focus (see the global rule), and at 16px of this face "GCSE Foundation" and
   "Every subject" do not fit half a card — side by side at 390 the level read "Every le…". And the
   card never gets wide enough for the two to share a row, because `--app` caps the column at 26.5rem
   on a laptop as on a phone. The first version said "they sit together on a tablet" over a
   `flex-basis` that could never be met; a grid of one column says what actually happens.

   THE ARROW WAS DRAWN HERE, on the wrapper, as the one select in the app that looked like a dropdown
   — a `▾` in `::after`, because the global rule takes the platform's off. Every select carries that
   arrow now, from the select rule itself (note 315), so the wrapper's went rather than draw a second. */
```

### NO PADDING NOW, because the row is already 44px and there are three selects above it rather than two:

before `.check.mat-given`

```
/* NO PADDING NOW, because the row is already 44px and there are three selects above it rather than
   two: the .2rem either side was the box's air in a form, and on this card it was the last few
   pixels between a ten-row group and the 0.85 floor (see `MAT_GROUPS`). */
```

### ---------- SHORTER ROWS, SO MORE OF THEM FIT ACROSS

before `.mat-list`

```
/* ---------- SHORTER ROWS, SO MORE OF THEM FIT ACROSS ----------------------------------------------
   9rem WAS THE WIDTH A THREE-WORD NAME NEEDED. A face is rarely more than eight characters, so the
   column can be narrower and a phone gets three where it got two — twenty-five rows in nine lines
   rather than thirteen, and no row wrapping onto a second line. */
```

### `align-items: start` SO A ROW WITH A NOTE DOES NOT PULL ITS NEIGHBOUR OUT OF LINE.

before `.mat-list`

```
/* `align-items: start` SO A ROW WITH A NOTE DOES NOT PULL ITS NEIGHBOUR OUT OF LINE. Stretched to
   the height of the ruler's row (face, then "prints at true size" underneath), the label beside it
   centred its one line in the extra height, so `100 square` sat half a line below `|·| ruler` at
   the top of every list — two ticks in one row that did not look like one row. */
```

### ---------- NO FLOOR AND NO SCROLL, BECAUSE THE LIST IS NOT A SCROLLER ANY MORE

before `.mat-list label`

```
/* ---------- NO FLOOR AND NO SCROLL, BECAUSE THE LIST IS NOT A SCROLLER ANY MORE --------------------
   IT CARRIED `.widget-squeeze`, with a 6rem floor measured against the picker above it and Print
   below, so the list scrolled inside the card. Taken off on "the cheat sheet maker should not have a
   scroll thing" — see the note over the list in `initMat`. The card is now as tall as its list, and
   a card taller than its pane is `paneReach_`'s, exactly as on every other column. The flyer keeps
   `.widget-squeeze`; its rules below are untouched. */
```

### ---------- AND THE ROWS THEMSELVES, FOR THE SAME REASON

before `.mat-list label`

```
/* ---------- AND THE ROWS THEMSELVES, FOR THE SAME REASON ------------------------------------------
   1.7rem IS 27 PIXELS AND THE CHECKBOX INSIDE IT IS 14, so the row was a half-height target wrapped
   round a quarter-height one. The whole label is clickable, which is right, and it was still too
   short to land on.

   THIS ONE COSTS SOMETHING AND THE NOTE ABOVE SAYS WHAT: the list was tuned to fit twenty-five rows
   in nine lines, and taller rows mean more scrolling. It is paid anyway, because the alternative is
   a list of twenty-five things you have to aim at — and this is the screen where somebody picks
   fifteen of them in a row, so the mis-tap is not a one-off, it is the whole task.

   THE COLUMNS ARE UNTOUCHED. `auto-fit, minmax(7.5rem, 1fr)` still decides how many fit across, so
   a phone gets three and a laptop gets six exactly as before. Only the row height moved. */
```

### ---------- A GRID, SO THE FIRST LINE OF EVERY ROW IS THE SAME 44px

before `.mat-list label`

```
/* ---------- A GRID, SO THE FIRST LINE OF EVERY ROW IS THE SAME 44px ------------------------------
   IT WAS A WRAPPING FLEX ROW WITH `min-height: 44px`, which is 44px round the whole label — so a row
   carrying a note under its face ("prints at true size", "given in the exam") put its tick at
   the top of a taller box while the row beside it centred its tick in 44. Measured: `|·| ruler` and
   `100 square`, the first two things on every list, sat ten pixels apart in one row. Two columns
   of ticks are read across as well as down, and a row that is not a row reads as a list that has
   slipped.
   THE FIRST LINE IS THE TARGET AND IT IS 44px WHATEVER IS UNDER IT; the note takes a line of its own
   below, across the whole row — under the face it wrapped "prints at true size" onto two lines at
   320. Tucked up a little so it reads as belonging to the line above rather than floating between
   two rows. */
```

### ---------- AND THE NOTE IS INSIDE THE 44px, UNDER THE FACE

before `.mat-list label .mat-txt`

```
/* ---------- AND THE NOTE IS INSIDE THE 44px, UNDER THE FACE ------------------------------------
   IT HAD A GRID LINE OF ITS OWN across the whole row, tucked up by .6rem — 15px of height per note,
   and with the list cut into groups of twelve (`MAT_GROUPS` in mat.js) the notes were the difference
   between a ten-row group fitting a 320x568 pane at 0.84 and at 0.85, the floor `check/states.js`
   holds. The face is one line of .82rem and a note one or two of .62rem: both together are under
   44px, so stacked in the face's own cell they cost the row nothing. The tick stays centred on the
   44px line, which is what the note above was protecting. */
```

### THE MATHS, SET AS MATHS.

before `.mat-face`

```
/* THE MATHS, SET AS MATHS. Mono keeps the columns of the list from jittering as the glyphs change
   width, and it is the face of the block rather than a label about it, so it takes the row's ink
   rather than the muted grey a caption would.

   ---------- THE NOWRAP THAT TOOK THE WHOLE SCREEN SIDEWAYS WITH IT -------------------------------
   THIS WAS `white-space: nowrap` AND IT WAS 22 OF THE 25 SIDEWAYS SCROLLS check/ui.js REPORTED. A
   face that pairs a symbol with a word — `◡ protractor`, `km→m units` — cannot shrink to a
   `minmax(7.5rem, 1fr)` column when it may not wrap, so the label overflowed by up to 59px and
   pushed `.mat-list`, then `.card`, then `.pane`. One cause, a cascade, and the whole tools screen
   scrolling sideways on a phone.

   CLAUDE.md RECORDED THIS AS A DESIGN CALL AND MISREAD THE COMMENT IT WAS QUOTING. It said the note
   above this rule defends nowrap as stopping the columns jittering. The note says MONO does that —
   the sentence directly above — and mono is untouched here. The nowrap had no stated reason at all.

   AND THE OTHER OBJECTION WAS MEASURED RATHER THAN ARGUED. The note on `.mat-list` rejects a 6.5rem
   column because faces would wrap and "cost more height than the extra width does" — a fair worry,
   and worth a number rather than a guess. Measured in the browser at four widths, with `.mat-note`
   moved to its own line (see that rule): the list is 860px at 320, 464px at 390, 467px at 768 and
   1280. Those are the SAME numbers nowrap produced, to the pixel, and not one face wraps at all.

   THE COST IS NOTHING, WHICH IS NOT WHAT THE FIRST TWO ATTEMPTS COST. Truncating with
   `overflow: hidden` and an ellipsis fixed the cascade, left eleven findings where the faces clipped
   themselves, and cut the end off every long name on a phone, which has no hover to reveal a
   `title`. Wrapping alone fixed it at +15px and broke ten faces onto two lines. Both were beaten by
   finding the thing that was actually eating the width — a note that had asked for its own line and
   been refused one — and neither would have been if the first green result had been trusted.

   `overflow-wrap: break-word` RATHER THAN `anywhere`: `anywhere` lets the intrinsic minimum fall to
   a single character, so the flex row squeezed the face to ~30px and `ruler` came out as `rul` /
   `er`. `break-word` keeps a whole word as the minimum and still breaks a token genuinely too long
   for its column. `min-width: 0` because this is a flex item, and a flex item will not shrink below
   its content without it. */
```

### DRAWN, NOT STYLED — a background on a native checkbox stops the browser drawing its own control and there is nothing left to replace the tick.

before `.mat-list input`

```
/* DRAWN, NOT STYLED — a background on a native checkbox stops the browser drawing its own control
   and there is nothing left to replace the tick. And `min-height` must be unset by name, or the
   touch-target rule on every input stretches it into a domino. */
```

### ---------- THE PAPER'S OWN QUESTIONS

before `.mat-blank-pick`

```
/* ---------- THE PAPER'S OWN QUESTIONS ----------------------------------------------------------------
   THE KIND IS CHOSEN IN THE SUBJECT SELECT (see `initMat`); what it asks next is a stack of its own,
   laid out as `.mat-pick` is, for the same reason (at 16px two do not fit side by side on a phone).
   The text box is the global input at 16px; `width: 100%` because an input's intrinsic width is
   about twenty characters, which at 320 is wider than the card. */
```

### ---------- THE PRINT SHEET IS A SHEET OF PAPER, AND PAPER DOES NOT REFLOW

before `.mat-paper`

```
/* ---------- THE PRINT SHEET IS A SHEET OF PAPER, AND PAPER DOES NOT REFLOW ------------------------
   `overflow: hidden` CLIPPED IT AND CALLED THAT FITTING. The preview is a fixed paper width, so on a
   320px phone it ran 593px past the card — and hidden does not mean "it fits", it means the right
   two thirds of the page you are about to print are cut off with no way to reach them. The one thing
   a print preview is for is seeing what will come out of the printer.

   `auto` IS THE HONEST ANSWER rather than a workaround for the check. The sheet genuinely is wider
   than the phone and genuinely should not be resized — a paper width that changes with the viewport
   is not a preview of anything — so the box is TOLD it may scroll, and now can be read by dragging
   it. check/ui.js stops reporting it for the same reason it should: it asks whether a box scrolls
   sideways when it was not told it could, and this one is now told.

   Y STAYS CLIPPED, said explicitly. With one axis `visible` and the other not, `visible` computes to
   `auto` and the sheet would grow a vertical scrollbar of its own inside a page that already
   scrolls. */
```

### HIDDEN, FOR THE REASON SET OUT ON `.fm-out`.

before `.mat-paper`

```
/* HIDDEN, FOR THE REASON SET OUT ON `.fm-out`. This was changed to `overflow-x: auto` in an earlier
   session on the strength of `check/ui.js` reporting it clipped, and CLAUDE.md was written up to
   match. `matFit` scales the sheet to the box with a transform; `scrollWidth` does not see
   transforms. Measured with rectangles: sheet right edge 335, box right edge 335, nothing lost. */
```

### `.mat-out` IS GONE — there is no preview on the card (see `matProbe` in mat.js).

before `.mat-paper`

```
/* `.mat-out` IS GONE — there is no preview on the card (see `matProbe` in mat.js). What is left on
   screen is the paper built for the printer, which exists only between `mat-print` and `afterprint`
   and must not be seen or take a tap in that moment. The print rules below make it visible. */
```

### ---------- THE PAPER'S NINE GREYS, NAMED

before `:root`

```
/* ---------- THE PAPER'S NINE GREYS, NAMED ---------------------------------------------------------
   THE SHEET WAS THE ONLY PART OF THE STYLESHEET WITH NO PALETTE. The app has --gold, --dim, --faint
   and the rest; the paper had `var(--mono)` for its typeface and forty-nine colour literals for
   everything else. To darken the block headings I had to know that #77776c meant "secondary text",
   find which of its fourteen uses were headings, and change those without touching the others.

   AND I MADE IT WORSE. Darkening the headings added #44443c and the row rule added #ddd7c6, so the
   paper now runs #44443c, #66665c, #77776c, #8d8878, #9a9488, #b4ae9c, #c9c3b2, #ddd7c6 — eight
   greys between ink and white, several a couple of percent apart, none of them named, and no way to
   tell from a hex which job it was doing.

   NOTHING IS MERGED HERE. Every literal keeps its own value and gets its own name, so this changes
   the page in no way at all — it only makes the next change a one-line one. What it does do is put
   the near-duplicates next to each other where they can be argued about: --pa-head, --pa-label and
   --pa-mid are three greys for what may be two jobs, and --pa-line and --pa-rule are two hairlines
   that differ by about four percent. Collapsing those is a decision about the sheet, not a tidy-up,
   so it is left to you.

   SCOPED TO THE PAPER. #14140f and #77776c are also used by the app chrome, where they mean
   something else; these names only cover the sheet. */
```

### NO LINE DOWN THE EDGE.

before `.mat-rule`

```
/* NO LINE DOWN THE EDGE. The ruler had a border on its right, which on a 297mm page is a 286mm
   vertical rule running the whole height of the sheet — the single longest mark on it, drawn to
   separate a margin from a page that is already separated by being empty. The ticks are the ruler.
   A box round them is a box round nothing. */
```

### ---------- A LINE ON PAPER IS A BORDER, NEVER A BACKGROUND

before `.mat-rule i`

```
/* ---------- A LINE ON PAPER IS A BORDER, NEVER A BACKGROUND --------------------------------------
   THE RULER'S TICKS WERE FILLED DIVS, and a browser drops background fills when it prints. So the
   one component whose whole job is to be measured against printed as twenty-eight numbers down the
   edge of an empty margin — every tick gone, and nothing on the screen to say so, because on the
   screen they are there.
   A BORDER PRINTS. It is the same hairline, the same colour, the same place; the box is flattened
   to nothing and the border is the mark. Same for the number line below, which is a rule and two
   sets of ticks and would otherwise have printed as a row of fractions floating in white. */
```

### THE TICKS ARE A SCALE, NOT A PATTERN.

before `.mat-rule i`

```
/* THE TICKS ARE A SCALE, NOT A PATTERN. At one weight, twenty-eight full-width lines down the
   margin read as hatching and pulled the eye off the sheet. Every fifth is the long dark one you
   actually count by; the rest are short and pale, which is how a real rule is engraved. */
```

### THE CALIBRATION NOTE, along the foot of the ruler strip.

before `.mat-rule-say`

```
/* THE CALIBRATION NOTE, along the foot of the ruler strip. Rotated because the strip is 20mm wide
   and the words are not — upright it would either wrap to four lines or run out over the page. Set
   in the faintest ink on the sheet: it is an instruction for the one time the ruler is wrong, not a
   label competing with the scale it sits beside. */
```

### ---------- THE GAP IS WHAT WAS BREAKING THE COLUMN RULES

before `.mat-cols`

```
/* ---------- THE GAP IS WHAT WAS BREAKING THE COLUMN RULES ----------------------------------------
   5mm OF GAP SITS BETWEEN THE RUNS, and the rule between two columns is drawn on the column, so it
   can only be as tall as the run it belongs to. Every gap therefore cut the line: on a page with
   three runs the two column rules came out as three separate pieces each, 422, 394 and 339 pixels
   long with 30-pixel holes between them — six stubs of four different lengths where there should
   have been two lines.

   SO THE AIR MOVES INSIDE THE COLUMN. A border runs the full height of its element including the
   padding, so putting the same 5mm underneath each column instead of between the runs leaves the
   spacing exactly as it was and lets the rule run through it. Consecutive runs now meet, and the
   line is continuous from the first block to the last.

   A FULL-WIDTH BLOCK STILL BREAKS IT, and should — there is no second column to divide from while
   one block is spanning both, and a line running behind it would be drawing a division that is not
   there for those few millimetres. */
```

### A SLOT IS ITS AREA AND NOT A MILLIMETRE MORE.

before `.mat-cols > .mat-box`

```
/* A SLOT IS ITS AREA AND NOT A MILLIMETRE MORE. `overflow: hidden` is what makes the size fixed;
   `matPaint` grows a slot its drawing overflows before this could ever clip anything, and says so.
   The 3mm under each block is inside the slot, so the air between two blocks is part of what each
   one costs rather than a gap that depends on what is next to it. */
```

### ---------- THE PAGE IS A GRID OF FIXED SLOTS

before `.mat-box`

```
/* ---------- THE PAGE IS A GRID OF FIXED SLOTS ------------------------------------------------------
   The notes above this rule are about runs and columns that no longer exist: every component owns a
   fixed slot now (asked for as "make all components of cheat sheet maker fixed in area"), `span`
   tracks wide and a whole number of `--mat-row`s tall, both set on the block by `matPaint`. The
   three numbers come from mat.js — `MAT_TRACKS`, `MAT_GUT`, `MAT_ROW` — through the inline custom
   properties on `.mat-cols`, so the picker's prices and the paper's widths are one source; the
   fallbacks are those same numbers, for a sheet drawn before the script has set them.
   `dense` puts a narrow block into the third left beside a two-thirds grid; `start` stops the grid
   stretching its rows to fill the sheet, which would make every slot a different height again.
   THE COLUMN RULES WENT WITH THE COLUMNS. A slot grid has no continuous columns for a line to run
   down — a vertical rule would stop and start at every wide block — so the gutter alone divides.
   `.mat-col` and `.mat-two-up` are gone, and their gap and rule arguments with them. */
```

### ---------- WHERE THE HAIRLINE ABOVE A BLOCK BELONGS, NOW THAT BLOCKS STACK

before `.mat-box`

```
/* ---------- WHERE THE HAIRLINE ABOVE A BLOCK BELONGS, NOW THAT BLOCKS STACK -----------------------
   THE FIRST BLOCK IN EACH COLUMN TAKES NO RULE. It is already under the heading rule or under a
   full-width block's own line, and three short lines at the top of three columns read as a broken
   one. Every block BELOW it keeps its rule, which is what separates a stack.

   THE OLD EXCEPTION HAD TO GO WITH IT: `.mat-cols > :first-child .mat-box` took the rule off EVERY
   block in the first row, which when a row became a column meant the whole first column lost its
   separators. */
```

### WHERE ONE COMPONENT ENDS AND THE NEXT BEGINS — a hairline ABOVE the block, not under its heading.

before `.mat-box`

```
/* WHERE ONE COMPONENT ENDS AND THE NEXT BEGINS — a hairline ABOVE the block, not under its heading.
   Under the heading it separated a heading from its own content, which is the one boundary that did
   not need marking; the boundary that did was invisible, and 2.8mm of gap between two blocks of
   dense small type is not enough to find it.

   ABOVE, IT COSTS NO HEIGHT, because it replaces the rule that was already there. On a 262mm budget
   that matters more than it sounds: space is the obvious separator and the one thing this sheet
   cannot spend.

   IT ALSO LINES UP ACROSS A PAIR. Two half-width blocks side by side each take the rule at the same
   height, so it reads as one line drawn across the sheet rather than as two decorations.

   NOT ON THE FIRST ONE, which already has the heavy rule under the title above it. Two lines 2mm
   apart is a mistake that looks deliberate. */
```

### ---------- A HEADING IS ALREADY A DIVISION

before `.mat-box`

```
/* ---------- A HEADING IS ALREADY A DIVISION -------------------------------------------------------
   EVERY COMPONENT DREW ITS OWN FRAME and the page ended up as eight boxes arguing. A rule above the
   heading, a black border round the grid, a hairline between every cell and a heavier one under the
   header row is four different ways of saying "this is a separate thing" — and four lines saying one
   thing is three lines too many. The heading in small capitals says it on its own; what the rule
   added was weight. Space does the same work and does not have to be looked at. */
```

### ---------- RESTORED: THE HAIRLINE ABOVE EVERY BLOCK

before `.mat-box`

```
/* ---------- RESTORED: THE HAIRLINE ABOVE EVERY BLOCK ----------------------------------------------
   THE RULE THE COMMENT ABOVE DESCRIBES WAS NOT THERE. `.mat-box` set `padding-top: 0` and nothing
   else, while the very next rule existed only to take a `border-top` off the first child — an
   exception to a rule that had been deleted, and three paragraphs explaining a line the sheet did
   not draw. With it gone the page had no separator of any kind: no rule, no frame, and 2.8mm of gap
   between blocks of 2.7mm type, which is less than the height of one line. Eight components ran
   together as one grey field and the headings, in pale grey small capitals, were not enough on their
   own to break it.

   THIS IS THE LINE THE COMMENT ASKED FOR. Above the heading, so it costs no height it was not
   already spending; hairline, so it separates without weighing; and it lines up across a pair. */
```

### DARKER THAN IT WAS. At var(--pa-mid) the heading was lighter than the values under it, so scanning for 'where does probability start' meant reading the block

before `.mat-box h4`

```
/* DARKER THAN IT WAS. At var(--pa-mid) the heading was lighter than the values under it, so scanning for
   'where does probability start' meant reading the block rather than seeing it. It is the label for
   everything below it and it should be the first thing found, not the last. */
```

### ---------- PRACTICE PAPER: THE NAME ROW AND THE RULINGS

before `.mat-name`

```
/* ---------- PRACTICE PAPER: THE NAME ROW AND THE RULINGS -------------------------------------------
   EVERY COLOUR IS A `--pa-` TOKEN, the sheet's own palette, so the paper kinds print in exactly the
   inks the cheat sheet does and "make the lines fainter" is one token, not a hunt.
   THE RULINGS ARE SVG STROKES IN MILLIMETRES (see `matBlankSvg_` in mat.js) — a stroke prints where
   a background is dropped. The widths are in viewBox units, which are millimetres: .2mm is the
   finest line a home printer draws solidly, the baseline is half as heavy again because it is the
   line everything stands on, and the x-height is dashed because that is how every handwriting book
   prints it. `vector-effect` is not used: a scaled line would print at the wrong weight. */
```

### THE WORDS TO TRACE: pale letters with a fine dotted edge — the pale fill is what a pencil goes over, the dots are what a child follows when the pale is too

before `.mat-trace`

```
/* THE WORDS TO TRACE: pale letters with a fine dotted edge — the pale fill is what a pencil goes
   over, the dots are what a child follows when the pale is too pale to see on a cheap printer.
   THE SIZE AND THE FACE ARE SET ON THE ELEMENT by `matHandRows_`, from the face's own measured
   x-height (`matXRatio_`), so a lower-case `a` fills the middle band exactly. */
```

### ---------- THE COMPONENTS

before `.mat-hun`

```
/* ---------- THE COMPONENTS ----------------------------------------------------------------------
   NOTHING HERE IS SAID WITH A BACKGROUND. A browser DROPS background fills when it prints — that is
   the default, everywhere, and it is why the trig header came out as white text on nothing and the
   shaded columns came out blank. Every fill in these blocks was carrying meaning that only existed
   on screen.

   SO THE MEANING IS CARRIED BY WEIGHT AND BY RULES, both of which print. It is also the plainer
   thing to look at: five decorative colours across nine blocks — cream, pale blue, sand, black, red
   — read as five unrelated ideas, and a reference sheet has one idea. Ink, a grey for what is
   secondary, and a hairline. */
```

### ---------- `1fr` IS NOT "A THIRTEENTH OF THE WIDTH"

before `.mat-hun`

```
/* ---------- `1fr` IS NOT "A THIRTEENTH OF THE WIDTH" ---------------------------------------------
   THE TIMES TABLE RAN OFF THE EDGE OF THE PAPER and had done since it was written. `1fr` is short
   for `minmax(auto, 1fr)`, and that `auto` is a MIN-CONTENT FLOOR: no column may shrink below its
   widest cell. In a thirteen-column table the widest cell is 144, so the grid refused to fit the
   half-page column it was in and simply overflowed — silently, because the sheet clips.
   `minmax(0, 1fr)` removes the floor and the columns share the width they actually have. */
```

### ---------- 269 RECTANGLES

before `.mat-hun`

```
/* ---------- 269 RECTANGLES ------------------------------------------------------------------------
   A HUNDRED SQUARE IS A HUNDRED BOXES AND A TIMES TABLE IS ANOTHER HUNDRED AND SIXTY-NINE, and
   every one was drawn with four lines. Lightening them was the wrong repair: the page did not have
   heavy lines, it had far too MANY, and a thousand pale marks is still a thousand marks.

   NUMBERS IN A GRID DO NOT NEED BOXES. They are already in columns, which is what a grid IS, and
   the alignment does every job the ruling was doing. What the lines added was the look of a
   spreadsheet, which is not what a child reads.

   WHAT IS KEPT IS WHAT CARRIES MEANING. The tens still print bold and the fives still print grey,
   so the structure a hundred square is FOR survives with no lines at all. */
```

### BIGGER, asked for by name:

before `.mat-hun i`

```
/* BIGGER, asked for by name: the square is two thirds of the page now (about 121mm, cells of 12mm
   rather than 8.8), so the digits go from 2.9mm to 4.2mm — the same share of the cell as before.
   6:5 RATHER THAN SQUARE, and the arithmetic is why. Square cells at 121mm make each grid about
   130mm tall with its heading, and the two together 264mm — two millimetres more than the page, so
   the one sheet both were built for (SATs) could never hold both. At 6:5 they are 110mm each and
   leave a band across the foot of the page for the number line or the place value chart. */
```

### THE ONLY TWO LINES LEFT, and they are the two that mean something:

before `.mat-tt i:nth-child(-n+13)`

```
/* THE ONLY TWO LINES LEFT, and they are the two that mean something: everything below this line and
   right of that one is an ANSWER; everything outside them is a heading. A table with no rules at
   all loses that, and it is the one distinction a times table exists to make. */
```

### ---------- THE PERIODIC TABLE

before `.mat-ph`

```
/* ---------- THE PERIODIC TABLE --------------------------------------------------------------------
   EIGHTEEN COLUMNS AND ELEVEN ROWS: the group numbers, seven periods, a gap, and the f-block. Every
   cell is placed by `grid-area` from `matPtAt`, so the gaps in periods 1–3 are simply cells nobody
   was put in. The gap row is a third of a period, which is how every printed table separates the
   lanthanides and actinides from the body.
   BORDERS, NOT FILLS, for the reason at the head of this section — a browser drops fills on paper. */
```

### INSET BY HALF A LABEL EACH SIDE.

before `.mat-nl`

```
/* INSET BY HALF A LABEL EACH SIDE. The 0 and the 1 are centred on the ends of the line, so half of
   each hangs outside it — invisible while a block could spill, and cut in half once every block
   became a fixed slot that clips (`.mat-cols > .mat-box`). The line is 4mm shorter; its labels are
   whole. */
```

### ---------- THE NUMBER LINE WITH NEGATIVES (M52) — the numbers UNDER the line, as a textbook prints it --

before `.mat-neg`

```
/* ---------- THE NUMBER LINE WITH NEGATIVES (M52) — the numbers UNDER the line, as a textbook prints it --
   INSET 5mm EACH SIDE for the arrows. The line runs 3mm past −10 and 10 into that margin and ends in
   a head, so the arrow says "and on" without a tick of its own; the heads are border triangles
   rather than fills, because a browser drops fills on paper and keeps borders.
   ZERO IS THE ONE THAT IS DIFFERENT: a longer, thicker tick and a bigger, bold label. Nothing else is
   picked out — a line with the negatives in a second colour is a key somebody has to read. */
```

### BOLD AND NOTHING ELSE, BECAUSE A BIGGER ZERO SAT LOWER THAN ITS NEIGHBOURS.

before `.mat-pv`

```
/* BOLD AND NOTHING ELSE, BECAUSE A BIGGER ZERO SAT LOWER THAN ITS NEIGHBOURS. It was 3.6mm against the
   others' 2.9 with its `top` nudged to centre the two line boxes — and centring line boxes is not
   lining up digits: a digit sits on its BASELINE, and where the baseline falls inside a line box
   depends on the font's own metrics. Measured on the printed sheet, the zero's baseline came out
   0.44mm below the 1's and the −1's, which read as a dropped 0 on the one label the line turns on.
   The same size and the same `top` puts every label on one baseline by construction, in any font;
   the long, thick tick above it is what does the picking out. */
```

### ---------- ONE LINE, WHERE THE POINT IS

before `.mat-pv`

```
/* ---------- ONE LINE, WHERE THE POINT IS ---------------------------------------------------------
   SEVEN COLUMNS, A BOX ROUND THEM AND A DIVIDER BETWEEN EVERY PAIR was eight lines to say a thing
   the headings already say: Th, H, T, U are four words in four columns and nobody needs ruling to
   see that. The one boundary that carries meaning is the decimal point, because that is the whole
   subject of the chart — which side of it a digit falls on. So that is the only one left. */
```

### ---------- THE ALPHABET, PRINT OVER JOINED

before `.mat-abc`

```
/* ---------- THE ALPHABET, PRINT OVER JOINED ---------------------------------------------------------
   TWENTY-SIX COLUMNS ACROSS THE WHOLE PAGE, each letter's two shapes one above the other — the way a
   child copies them, rather than two alphabets a line apart. The print row is a plain sans because
   the site's mono face is not how anybody teaches a letter; the joined row is whatever script face
   the printer has, `cursive` last, so it is a model rather than a promise about a font. */
```

### ---------- A PIECE THAT IS ALREADY A FINISHED THING

before `.mat-box.bare`

```
/* ---------- A PIECE THAT IS ALREADY A FINISHED THING ---------------------------------------------
   `bare` says the block carries its own name and its own edge, so it gets no heading and no rule
   above it. The flyer sizes that used to live here went with the flyer maker when it became its
   own tool again — a stylesheet keeping rules for a thing that can no longer be drawn is how a
   file grows a decade of scenery nobody dares delete. */
```

### ---------- THE PAIR BLOCKS, WHICH ARE MOST OF THE SHEET

before `.mat-fr`

```
/* ---------- THE PAIR BLOCKS, WHICH ARE MOST OF THE SHEET ------------------------------------------
   THIRTY-FOUR OF THE FORTY-SEVEN COMPONENTS ARE THIS ONE LAYOUT, so whatever it does wrong, the
   sheet does wrong everywhere. What it did wrong was `min-width: 17mm` on an inline-block label: a
   label SHORTER than 17mm left the value starting at 17mm, a label LONGER pushed its value out to
   wherever it happened to end, and a value that wrapped came back to the far left underneath the
   label. So no two rows in a block began in the same place and the wrapped ones ran under the wrong
   thing. That is the ragged look, and it was one declaration.

   `display: contents` IS WHAT FIXES IT. The `i` stops being a box and its label and value become
   cells of the block's own grid, so every label in a block shares one column and every value shares
   the next — real alignment rather than each row guessing. Fewer declarations than before, and no
   arithmetic to keep in step.

   `fit-content(40%)` CAPS THE LABEL COLUMN — as a share of the block, not a fixed width. Plain
   `max-content` would let one long label ('completing the square') set the width for every row
   beneath it and squeeze the values into nothing. A FIXED cap does the same thing in half the
   cases: 24mm of a full-width block is a third of it and reasonable, but 24mm of a half-width
   block is most of it, leaving 15mm for the value — a ribbon of wrapped fragments. One number
   cannot be right for two widths, and a share of the space is right for both.

   THE VALUE IS THE INK AND THE LABEL IS THE GREY, which is the way round they were not. You come to
   a sheet like this knowing what you are looking for and needing what it equals. */
```

### A FRACTION. Two spans stacked by a one-column grid, with the bar as the top border of the lower — so the bar is exactly as wide as the wider half and never

before `.mat-fr`

```
/* A FRACTION. Two spans stacked by a one-column grid, with the bar as the top border of the lower —
   so the bar is exactly as wide as the wider half and never needs a width setting.
   IT IS SET SMALLER THAN ITS LINE, at .9em, because a full-size stacked fraction is two lines tall
   and would open a gap in every row it appears in. `vertical-align` sits the bar on the baseline of
   the text around it, which is where a reader expects to find it. */
```

### TIGHTER, AND SITTING HIGHER.

before `.mat-fr`

```
/* TIGHTER, AND SITTING HIGHER. At .9em and 1.12 line-height a fraction is a shade over two full
   lines tall, so any row holding one — sin, cos, tan, the quadratic formula — came out twice the
   height of the rows around it and the block lost its rhythm. And at -.42em the whole stack hangs
   below the line it is on, which is why `V = 4/3 πr³` reads as a 4 that has slipped: the bar should
   sit ON the line of the text beside it, with the numerator above and the denominator below. */
```

### HALF THE WIDTH, HALF THE COLUMNS.

before `.mat-box.is-narrow .mat-two`

```
/* HALF THE WIDTH, HALF THE COLUMNS. `.mat-two-up > *` is exactly the half-width case and it already
   exists, so the fix needs no new class and no change to the markup or to `matPairs`.
   45% RATHER THAN 40% because a two-column grid has one label column carrying every label in the
   block, and the longest of them — 'mixed → improper', 'vertically opposite' — sets it. At 40% those
   wrap and take the value column's alignment with them. */
```

### 40% AND A NARROWER GUTTER, because the cell is 60mm now rather than 99mm.

before `.mat-box.is-narrow .mat-two`

```
/* 40% AND A NARROWER GUTTER, because the cell is 60mm now rather than 99mm. At 45% the label column
   caps at 27mm, which is where 'product of primes' and 'completing the square' start wrapping — and
   a wrapped label pushes its own value down and takes the row's alignment with it. Giving the label
   less and the value more means the wrapping happens in the values, where a second line is a second
   line and nothing moves. */
```

### AND THE HALF-GAP GOES WITH IT.

before `.mat-box.is-narrow .mat-two i:nth-child(odd) em`

```
/* AND THE HALF-GAP GOES WITH IT. `nth-child(odd) em` puts 4mm on the right of the first value
   column to separate the two halves of the wide grid. In two columns there is no second half, so
   that padding is 4mm bitten out of the only value column there is. */
```

### ---------- OPTIONAL, AND ARGUABLE

before `.mat-two i b`

```
/* ---------- OPTIONAL, AND ARGUABLE ----------------------------------------------------------------
   A HAIRLINE PER ROW. The comment in the sheet section argues against frames and is right — eight
   boxes arguing was the disease. This is not a frame. A frame says where a block ends, which the
   heading already says; this says where a row ends, which nothing currently says, and on a block of
   ten label/value pairs at 2.7mm the eye loses which value belongs to which label about six rows in.

   ON THE ROW, NOT BETWEEN THE COLUMNS. A vertical rule would be the frame argument all over again.

   DELETE THIS BLOCK IF YOU DISAGREE — everything above it is the fix and stands without it. */
```

### ---------- WHY THE ROW RULE HAD TO CHANGE TWICE

before `.mat-two i b`

```
/* ---------- WHY THE ROW RULE HAD TO CHANGE TWICE -------------------------------------------------
   IT WAS DRAWN UNDER EACH CELL SEPARATELY AND THE TWO ENDS DID NOT MEET. Two faults at once, and
   both are visible on the trig block:

   STAGGERED, because the grid was `align-items: baseline` and a fraction is two lines tall. The
   label sat on the first baseline and its rule was drawn under that; the value's rule was drawn
   under a box twice as tall. One row, two rules, 3mm apart — which reads as a fault in the printer
   rather than as a line.

   AND BROKEN, because a 3mm column gap sits between the two cells, so even where they lined up the
   rule came out as two dashes with a hole in the middle.

   STRETCH FIXES THE FIRST: both cells take the row's full height, so both rules are drawn at the
   bottom of the same row. The label now sits at the top of its cell rather than on the value's
   baseline, which is where it should be anyway when the value is two lines tall.

   AND THE COLUMN GAP BECOMES PADDING, which fixes the second: the space is still there, but it is
   inside the label's cell, so the rule runs under it and the two halves meet. */
```

### IN THE WIDE GRID THE LAST ROW IS THE LAST TWO ITEMS, not the last one.

before `.mat-box.is-wide .mat-two i:nth-last-child(2) b, .mat-box.is-wide .mat-two i:nth-last-child(2) em`

```
/* IN THE WIDE GRID THE LAST ROW IS THE LAST TWO ITEMS, not the last one. Addressed through the
   full-width block rather than `:not(.mat-two-up .mat-two)` — a full-width `.mat-box` is a direct
   child of `.mat-cols` and a half-width one is not, which the stylesheet already relies on at
   `.mat-cols > .mat-box:first-child`. Reusing that beats a `:not()` holding a descendant selector,
   which is a Selectors-4 feature doing work an existing structural fact already does. */
```

### TWO LINES' WORTH, ALWAYS.

before `.mat-circ .rim`

```
/* TWO LINES' WORTH, ALWAYS. Six captions fit on one line and two do not, and letting them differ
   drops the short ones' baselines above the long ones' — eight figures that were the same size
   stop looking it. A fixed height costs 2mm once and holds the row flat. */
```

### UPRIGHT. `matPairs` wraps each row in `<i>` as its grid handle, and `<i>` is italics — so every label on every block has been italic since the day it was

before `.mat-two i b`

```
/* UPRIGHT. `matPairs` wraps each row in `<i>` as its grid handle, and `<i>` is italics — so every
   label on every block has been italic since the day it was written, and only the value ever said
   otherwise, because `em` sets `font-style: normal` and `b` never did. Bold grey italic is the
   hardest of the three to read at 2.7mm and it was being used for the word you scan for. */
```

### A LITTLE AIR BETWEEN THE TWO HALVES, put on the first value column rather than as a gap, because one gap value would have to space the label from its value too

before `.mat-two i:nth-child(odd) em`

```
/* A LITTLE AIR BETWEEN THE TWO HALVES, put on the first value column rather than as a gap, because
   one gap value would have to space the label from its value too — and those belong together.
   THE 3mm GAP ABOVE IS A FLOOR, NOT A PREFERENCE. At 2.7mm type a 1.6mm gap is half a character
   wide, and where a label fills its column — 'completing the square' does — half a character reads
   as no gap at all. Three is the width of a space you would notice missing. */
```

### THE ROOT IS DRAWN, NOT TYPED.

before `.mat-tk`

```
/* THE ROOT IS DRAWN, NOT TYPED. A √ character sits beside the numbers at whatever size the font
   makes it, and its bar covers only the first — so it reads as the root of one number rather than
   of the row, which is the one thing the trick depends on saying. */
```

### ---------- PRINTING FROM INSIDE THE APP

before `@media print`

```
/* ---------- PRINTING FROM INSIDE THE APP -------------------------------------------------------
   A browser prints the whole document, so without this the column, the tab bar and the card's own
   chrome go on the paper. Set only while printing, so a print started anywhere else is untouched. */
```

### THE PAPER IS A COPY AT THE END OF THE BODY, not the sheet inside the card.

before `@media print`

```
/* THE PAPER IS A COPY AT THE END OF THE BODY, not the sheet inside the card. `body` is a centred
   26.5rem column that clips what overflows it sideways, so a 210mm sheet positioned against the
   column is positioned against the wrong box AND cut off at 115mm — which is a right-hand half
   missing from every print, with nothing wrong on screen to say so.
   THE BODY'S OWN RULES HAVE TO GO WITH IT. A copy at the end of the body is still inside the body,
   so its width, its centring and its clip all still apply until they are turned off — which is
   what these three lines do, and only while printing. */
```

### ---------- "OR THE 212 PAPERS THESE ARE IN"

before `.qans`

```
/* ---------- "OR THE 212 PAPERS THESE ARE IN" -----------------------------------------------------
   ABOVE THE FUNNEL'S ANSWERS AND QUIETER THAN THEY ARE. It offers a second way to read the same
   results rather than being one of the answers — so it must not look like a row you could pick, or
   the first question would appear to have an extra option on it. `.text-action` already carries the
   app's underlined pressable-text look; this only places it. */
```

### QUESTIONS IN THE FUNNEL.

before `.qans`

```
/* ==================================================================================================
   QUESTIONS IN THE FUNNEL.

   A CARD IS SCANNED, NOT READ. A list of ninety parts is something somebody runs an eye down, so
   the card carries a reference, the marks and the first line — and the question itself opens on a
   tap. Showing the whole thing on every card would be ninety pages in a list.
================================================================================================== */
```

### ---------- THE OPENED QUESTION

before `.qans`

```
/* ---------- THE OPENED QUESTION ------------------------------------------------------------------
   Stem, then lead, then the part, in the order it is printed. The stem is dimmed because it is
   context — somebody who opened 2c wants to find 2c, not read three paragraphs first. */
```

### ---------- THE ANSWER: THE RESULT, ON ITS OWN PAGE, AND NOTHING UNDER IT

before `.qans`

```
/* ---------- THE ANSWER: THE RESULT, ON ITS OWN PAGE, AND NOTHING UNDER IT ----------------------
   `.qans-why`, `.qans-more` AND `.qans-note` WERE HERE -- the "Why" fold, the working hanging from
   it by a rule down the left, and the examiner's note set apart inside it. Gone with the markup, on
   the owner's word: *"Also remove all 'why's. I just want it to have answer."* See `answerBlock_`. */
```

### ---------- A LABEL, AND THE SAME ONE THE ANSWER BOX WEARS

before `.qans-head`

```
/* ---------- A LABEL, AND THE SAME ONE THE ANSWER BOX WEARS ------------------------------------------
   `.qans-open` WAS A `<summary>`, then `.qans-head` was a gold "Answer" with the answer's kind in
   faint italics beside it -- which read as one phrase, "Answer explain". The page's header already
   says `Q3 · answer`, so this is the small-capitals caption `.qp-ans-k` puts over the box on the
   question card -- "ANSWER · CALCULATION" here, "YOUR ANSWER" there -- the two halves of one act in
   one voice. A label, not a control: no height, no cursor. */
```

### THE ANSWER READS AS THE PAPER DOES, because it is the same material — see `answerBlock_`.

before `.qans-body`

```
/* THE ANSWER READS AS THE PAPER DOES, because it is the same material — see `answerBlock_`. Both are
   the site's own coding font now: asked for as "the text for questions is still that qwirky text.
   Should be the coding font universally for whole site." Georgia was here to make a question read
   as printed paper; one face across the app won over that. */
```

### THE RESULT, LARGE. It is the one thing on this page, and 259 cut it to a word or a line -- median seven characters, none past 120 -- so it can be the size of a

before `.qans-body`

```
/* THE RESULT, LARGE. It is the one thing on this page, and 259 cut it to a word or a line -- median
   seven characters, none past 120 -- so it can be the size of a heading without a long one ever
   filling the screen. Ink and weight rather than gold: gold on this card is the question's number,
   and an answer in the accent would read as a second title. */
```

### QUESTIONS IN THE FUNNEL.

before `.qcard`

```
/* ==================================================================================================
   QUESTIONS IN THE FUNNEL.

   THE CARD IS THE WHOLE QUESTION, and the first version of it was not — it showed 96 characters
   with a `.qcard-peek` clipped to one line, and the rest opened in a panel. That split only made
   sense while the rest lived somewhere else, and it never did: the stem, the lead and the part are
   three fields on the row the card is already drawn from. A question is SHORT; if it were a page it
   would be a paper. So the peek is gone and the tap it cost on every single card is gone with it.

   WHAT IS SCANNED IS THE HEADER ROW — `Q5b` hard left in gold mono, the marks hard right — so a
   list is still something you run an eye down even though each card carries its whole question.
================================================================================================== */
```

### ---------- ONE RHYTHM DOWN THE CARD, WHERE THERE WERE FOUR GAPS AND NO REASON BETWEEN THEM

before `.qcard`

```
/* ---------- ONE RHYTHM DOWN THE CARD, WHERE THERE WERE FOUR GAPS AND NO REASON BETWEEN THEM ---------
   ASKED FOR AS "refine the question widget stuff ... make it nice more sleek, fresh stable". Looked
   at in screenshots at 320 and 390 before anything moved: the gaps down the card were .25, .5, .5 and
   .5rem, so the tags sat a hair under the reference, the question a hair under the tags, and
   "YOUR ANSWER" ran straight on from the last line of the question as though it were one more
   paragraph of it. Three steps now -- tight inside a group (.4rem), a group from the next (.75rem),
   the question from the answer (1rem) -- so header, question and answer read as three blocks before a
   word of them is read. The padding grew on the vertical only: at 320 the column is about 222px of
   text and sideways room is the one thing it cannot spare. */
```

### ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR

before `.tile-row .qcard-verdict`

```
/* ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR -------------------------------------------------
   IT WAS `Done 4 Oct` -- the day you last did it, in the marks' dim mono, deliberately NOT a verdict's
   colour: "green would read as Correct, which a date is not". THE OWNER, 9 Oct: *"The kids don't need to
   see the day they did something. Just whether it's right or not."* So it IS the verdict now, the latest
   submission's (`subSlot_` in find.js), and takes the verdict line's own voice: its face and weight, its
   `--good` and `--warn`, and its two marks drawn here rather than typed -- a tick, and for "not yet" the
   turning arrow that says "go round again" (see `.qp-verdict` below for why never a cross). The AI's
   "3/4" takes them as its own verdict line does -- full marks the tick, fewer the arrow -- and "Sent"
   takes none, in the dim ink: nobody marked it. The slot is there and empty until there is a verdict, so a press writes into it; the
   row is 44px tiles tall whatever it holds, so nothing moves. `:empty` takes the gap off. */
```

### ---------- THE CARD'S TAGS

before `.qtags`

```
/* ---------- THE CARD'S TAGS -------------------------------------------------------------------------
   ASKED FOR AS *"it has the title of it in one text name when it should still remain as tags."* The
   paper's name taken apart into the facts it is made of -- since 18 Oct every card's row is `tagRow_`
   in find.js, each tag a finder answer in its facet's colour (docs/history/355). Labels, not controls:
   smaller than a chip, not pressable, so nothing here is a tap target and a card of them is a card that
   still has room for its question. A facet with no kind -- What kind, Marks -- keeps the plain outline
   and the dim ink, as its chip does.

   AND THEY ARE THE TOP OF THE CARD NOW, nothing above them: *"the marks should also be a tag. also
   the question numbers should also be a tag."* `.qcard-tags` is the row `tagRow_` draws on every card
   and every page of a question -- the same facts on each, only the page's own number differing. */
```

### A RADIUS IN px, NOT 999px.

before `.qtag`

```
/* A RADIUS IN px, NOT 999px. A long worksheet title -- "Multiplying and Dividing by 10, 100, 1000
   etc" -- wraps to two lines at 320, and a 999px radius on a two-line box drew a lozenge with the
   words running into its pointed ends. 9px is a full pill on a one-line tag (about 17px tall) and a
   rounded box on a two-line one, so one rule is right for both. */
```

### NO TAG IS DRAWN DIFFERENTLY FROM ANOTHER.

before `.qcard .qsheet`

```
/* NO TAG IS DRAWN DIFFERENTLY FROM ANOTHER. The page's kind was a solid pill and its number a step
   heavier; the owner, 18 Oct: *"Please eliminate all unique conditional rules which treat them
   differently."* Every tag is the outline above in its facet's colour (docs/history/355). */
```

### `.qcard-sat` AND `.qcard-needs` WERE HERE -- the day the paper was sat, a faint line under the tags, and what to bring, a gold one under that.

before `.qcard .qsheet`

```
/* `.qcard-sat` AND `.qcard-needs` WERE HERE -- the day the paper was sat, a faint line under the tags,
   and what to bring, a gold one under that. What to bring is the What you need answers in the row
   (`--tag-needs`), once -- the gold line said "No calculator" under a grey tag that said
   "Non-Calculator", which is the fault that was reported -- and the day it was sat is the paper's cover
   line over its end (`paperCover_`, 355), no finder answer saying it. */
```

### ---------- WORDS THAT GO ON OVER THE PAGE SAY SO

before `.qsheet-more`

```
/* ---------- WORDS THAT GO ON OVER THE PAGE SAY SO ---------------------------------------------------
   A long part or stem is cut between paragraphs (`packBlocks_`), and "Continued on the next page" is one
   quiet line at the foot of each page but the last: a label, not a control -- the page turns the way every
   page does -- and `--faint`, because it is a pointer and not a fact about the question. It was
   `.qsheet-figref`, which said "Figure on the next page" as well until the figure moved into its card
   (356): a pointer to a picture that is not on the page is the "graph widget below" the owner objected to. */
```

### ---------- THE TYPESETTING, AND IT HAS MOVED TWICE

before `.qsheet`

```
/* ---------- THE TYPESETTING, AND IT HAS MOVED TWICE --------------------------------------------
   IT WAS `.qsheet …`, then `.qpaper …`, and it is `.qsheet …` again. Worth writing down, because
   the middle move was made for a reason that was true at the time: `questionCard_` had been deleted
   in favour of printing the whole paper, so `.qsheet` was emitted by nothing while `.qpaper` — the
   paper page — had no rule for a table, a roman-numeral list or an SVG figure anywhere in this
   file. Every diagram and every mark table was arriving unstyled, which was most of what made that
   page look wrong.

   BOTH OF THOSE ARE NOW GONE and the question card is back, so these rules are back on the wrapper
   they were written for. `.qsheet` is the ancestor of the stem, the lead and the part, so one
   prefix covers all three.

   THE FIGURE RULES ARE THE ONES THAT MATTER MOST NOW. `figure svg { width: min(100%, 20rem) }` is
   what keeps a diagram inside a 320px phone, and the label classes below are what let an SVG drawn
   in black ink on white paper read on a black screen — they all take `currentColor`, so there is
   one drawing rather than two. See the `diagram` column in js/library.js. */
```

### ---------- A PREAMBLE THAT IS STANDING IN FOR THE REAL ONE

before `.qsheet-stem.is-standin`

```
/* ---------- A PREAMBLE THAT IS STANDING IN FOR THE REAL ONE ---------------------------------------
   AN AQA ENGLISH INSERT IS A SEPARATE BOOKLET AND THIRD-PARTY COPYRIGHT, so the source is not in
   the question paper and cannot be reproduced here. What sits in the row is a description accurate
   enough to teach around — and a student looking at an exam question has to be able to tell at a
   glance which of the two they are reading.

   THE DASHED EDGE ALL THE WAY ROUND, where an ordinary preamble has one underneath it. Same line,
   same colour, no new token: it reads as a box waiting to be filled rather than as a warning, which
   is what it is. The same argument as the credit under a drawn figure. */
```

### ---------- A BLANK THE PAPER FILLS IN

before `.qsheet .gap`

```
/* ---------- A BLANK THE PAPER FILLS IN --------------------------------------------------------
   THE AQA ENGLISH SKELETONS ARE THE REAL QUESTION WITH ITS SOURCE-SPECIFIC WORDS MISSING — "look
   in detail at the extract from [the lines the paper names]". The wording is the specification's
   and is the same every series; the bracketed part is the only thing that changes, and it is the
   only thing that could not be read, because every Google host is blocked from the agent's
   environment and the papers are in Drive.

   SO IT HAS TO LOOK LIKE A BLANK RATHER THAN LIKE TEXT. A dashed underline and the dim ink say
   "something goes here" without a sentence explaining it — and the row also carries
   `placeholder: True`, so the whole card already sits in the dashed box `.qsheet-stem.is-standin`
   draws and `check-library.js` lists it by name on every run. Two signals for one fact, and that
   is deliberate: this is content somebody must not mistake for the exam's own. */
```

### `.cam-row .btn.is-rec` WAS HERE — the red outline on a rectangular `Video` button that changed its own label to `Stop`.

before `.qsheet .gap`

```
/* `.cam-row .btn.is-rec` WAS HERE — the red outline on a rectangular `Video` button that changed
   its own label to `Stop`. The record control is a disc now and says so by changing shape, so this
   rule matched nothing: `check-css.js` reports a class no markup produces, and a stylesheet keeping
   rules for markup that is gone is how 448KB of it happens. Its argument survives on `.cam-rec` —
   red is the one colour here that means "something is running that you have to end", and it is not
   an animation, because a blinking control on a card somebody is filming with is a distraction in
   the frame. */
```

### ---------- A STEM ON ITS OWN PAGE IS THE PAGE, NOT A PREFACE TO IT

before `.qstem .qsheet-stem`

```
/* ---------- A STEM ON ITS OWN PAGE IS THE PAGE, NOT A PREFACE TO IT ---------------------------------
   The dimming and the dashed rule above said "this is the paragraph the part below hangs from", on a
   card that also held the part. A stem is its own page now, in front of its parts (`questionStemCard_`
   in find.js), so there is no part below it to defer to: full ink, and no rule leading to nothing. */
```

### BUT A STAND-IN'S DASHED EDGE IS ITS BOX, NOT THAT RULE (`.qsheet-stem.is-standin` above: "the dashed edge all the way round"), so on its own page it keeps the

before `.qstem .qsheet-stem.is-standin`

```
/* BUT A STAND-IN'S DASHED EDGE IS ITS BOX, NOT THAT RULE (`.qsheet-stem.is-standin` above: "the dashed edge
   all the way round"), so on its own page it keeps the bottom of it. Two rules of one specificity decided by
   file order alone: check/cascade.js found it once Find's window held a stand-in's card at the moment it
   looked (docs/history/341 — the whole window is drawn now, not five either side). */
```

### WHICH SPAN OF THE SOURCE A PART COVERS — "Lines 10–19".

before `.qsheet-lines`

```
/* WHICH SPAN OF THE SOURCE A PART COVERS — "Lines 10–19". A label rather than prose, so it reads
   as an index into the insert instead of as the first sentence of it: the gold is `.qsheet-pn`'s,
   which already marks a question number, and this is the same job one level out. Only drawn when
   the row carries `lines`, so a single-part insert is untouched. */
```

### THE PART LETTER SITS OUTSIDE THE TEXT, in the margin, the way it is printed — indented body text under a hanging (a) is what makes a multi-part question

before `.qsheet-part`

```
/* THE PART LETTER SITS OUTSIDE THE TEXT, in the margin, the way it is printed — indented body text
   under a hanging (a) is what makes a multi-part question readable at a glance. `.qsheet-marks`
   from the first version is NOT back: `questionCard_` prints the marks in its own header row, hard
   right beside the reference, which is where somebody scanning a list looks for them. */
```

### ---------- A LINE TO WRITE ON IS ONE LONG WORD

before `.qsheet-pb`

```
/* ---------- A LINE TO WRITE ON IS ONE LONG WORD -------------------------------------------------
   FIFTY-ONE QUESTIONS CARRY A RUN OF DOTS OR UNDERSCORES — the answer line the printed paper has —
   and the longest is 128 characters with no space in it. To a browser that is a single word, so it
   cannot be wrapped and it takes the card, the pane and the page sideways with it.

   `min-width: 0` WAS ALREADY HERE AND IS NOT ENOUGH. It lets the flex child give way; it does not
   let the TEXT inside it break, so the box shrank to zero and the word ran out of it anyway. That
   is the same half-fix `.row .k` needed, recorded a few thousand lines up.

   `break-word` RATHER THAN `anywhere`, because the difference is what happens to ordinary prose:
   `anywhere` will split a word mid-letter whenever it helps the layout, and a maths question broken
   across "coeffi / cient" is the `|·| rul / er` fault this repository already has a paragraph
   about. `break-word` only breaks a word that cannot fit on a line of its own, which is exactly the
   dotted rule and nothing else. */
```

### ---------- AND THE LAST PARAGRAPH'S BOTTOM MARGIN, WHICH NOTHING NEEDED

before `.qsheet p:first-child`

```
/* ---------- AND THE LAST PARAGRAPH'S BOTTOM MARGIN, WHICH NOTHING NEEDED --------------------------
   `p:first-child` HAS HAD ITS TOP MARGIN TAKEN OFF SINCE THIS WAS WRITTEN and the other end was
   left on: a browser's own `1em` under the last paragraph of every question, measured at 14.8px,
   sitting between the question's last line and a container that already supplies the gap. One
   paragraph of white space per card, on every card in a list somebody scrolls. */
```

### ---------- A WIDE TABLE SCROLLS IN ITS OWN BOX, AND NOTHING ELSE DOES

before `.qsheet table`

```
/* ---------- A WIDE TABLE SCROLLS IN ITS OWN BOX, AND NOTHING ELSE DOES ----------------------------
   `check/cards.js` CAUGHT THE FIRST TABLE THAT COULD NOT FIT. Table 1 of AQA Physics 8463/1H is
   four columns — method, energy stored per 100 kg, percentage wasted, installation — and it went
   26px past a 320px column the moment it was transcribed. Every table in the library before it had
   three columns or fewer, so the rule had never been tested against one that could not shrink.

   CLAUDE.md ALREADY SAYS WHICH WAY THIS GOES: the page body never scrolls sideways, and "only wide
   tables, code and diagrams may run past it — each gets `overflow-x: auto` on its own container".
   So the table is wrapped rather than the card widened, and the scrollbar is on the one element
   that has more to show. Squeezing the columns instead would have been the `.mat-face` mistake:
   the label that cannot shrink to its column is the one that breaks, and a header reading
   "Percentage of stored energy wasted" is four words that have to stay.

   `display: block` IS WHAT MAKES A TABLE SCROLLABLE. A `table` box ignores `overflow` — it is not
   a block container — so the wrapper is the table itself, re-laid as a block with the rows inside
   it kept as a table by `table-layout` on an inner row group. One element rather than a `<div>`
   round every table in the data, because the data is written by a transcription script and a
   wrapper somebody has to remember is a wrapper that will be forgotten. */
```

### `pan-x`, BECAUSE A SCROLLER STARTS ITS OWN `touch-action`.

in `.qsheet table`

```
/* `pan-x`, BECAUSE A SCROLLER STARTS ITS OWN `touch-action`. `overflow-x: auto` makes the table a
     scroll container, and the `none` the pane declares stops at one — so the table was `auto`, and a
     swipe up that began on it at the foot of a scrolled pane went to the browser and never reached
     the grid: the page did not turn. Found when the figures moved off the question cards and a tall
     card's table landed under the thumb. Sideways stays the table's, which is what the scroller is
     for; up and down are the app's. */
```

### THE BOX A PAPER LEAVES FOR AN ANSWER.

before `.qsheet span.box`

```
/* THE BOX A PAPER LEAVES FOR AN ANSWER. Thirty-five rows write `<span class='box'>` where the
   printed page has an empty box -- `□ = 9,171 − 530`, a gap in a table, a missing term -- and
   nothing styled it, so it drew as four spaces: the question opened on a bare "=" and a table's
   blank cell looked like a cell that failed to load. Drawn as the outline it stands for, in the
   page's own ink. `.check .box` is the tickbox control and is untouched: this is scoped to
   `.qsheet` and to a `span`. */
```

### THE FIGURES COME THROUGH AS SVG using `currentColor`, so a diagram drawn for white paper reads on this black screen without a second copy of it.

before `.qsheet figure, .gd figure`

```
/* THE FIGURES COME THROUGH AS SVG using `currentColor`, so a diagram drawn for white paper reads
   on this black screen without a second copy of it.

   `.gd` JOINED EVERY ONE OF THESE SELECTORS rather than getting rules of its own. The practical
   guide draws apparatus — a circuit, a clamp stand, a condenser — and an apparatus drawing is the
   same OBJECT as a transcribed exam figure: an inline SVG laid out inside `W = 340`, inked in
   `currentColor`, labelled with `.lbl`, `.num` and `.cap`. A second set of rules describing it
   would be the `.reel .over` fault, where a subject, a heading, a paragraph and a credit over a
   picture were written twice in this stylesheet and drifted the first time either was touched. */
```

### A PHOTOGRAPH OR A SCAN, WHERE `figure svg` IS A DRAWING.

before `.qsheet .qpic`

```
/* A PHOTOGRAPH OR A SCAN, WHERE `figure svg` IS A DRAWING. It is sized to the column rather than to
   itself — a scan of an exam page is whatever resolution the scanner felt like, and a picture that
   sets its own width is the one thing on a card that can push the card sideways. `height: auto`
   with `max-width` keeps the aspect ratio without anybody stating it. */
```

### ---------- A DRAWING'S LABELS ARE SERIF, AND THAT IS MEASURED RATHER THAN PREFERRED

before `.qsheet .lbl, .gd .lbl, .qp-area .lbl, .pad-loupe .lbl`

```
/* ---------- A DRAWING'S LABELS ARE SERIF, AND THAT IS MEASURED RATHER THAN PREFERRED -------------
   THE SITE'S OWN FACE IS A CODING FONT NOW — `--font` in one place, asked for as "universal ... on
   the whole site" — AND IT CANNOT COME IN HERE. A monospace face is about a quarter wider than a
   serif at the same size, and every one of the 132 drawings in this repository was laid out against
   13px and 12px serif metrics: a caption is positioned by its CENTRE and its width decides how far
   it reaches either side. Put `var(--font)` on these four classes and `check/cards.js` reports
   **183 labels painted outside their own `<svg>`** — 53px on the Eratosthenes drawing, 39px on an
   AQA chemistry profile — where the same run with serif reports none. The outermost `<svg>` clips
   to its viewport, so each of those is a sentence a reader simply does not get.

   THE ALTERNATIVE IS NOT A SMALLER FONT. Shrinking to fit would be about 9.5px on a phone, which is
   under what anybody reads, and it would rescale the balance of every drawing to serve a typeface
   choice. The other alternative is re-laying out 132 committed drawings, which is a redraw of the
   whole library to change a font.

   AND IT IS A DIFFERENT OBJECT ANYWAY. These four classes ink an exam figure — a printed diagram
   redrawn from a paper — where `--font` is the app's own voice. Measured before it was kept, which
   is the only reason this is a decision rather than a thing the font change missed. */
```

### `.qp-area` TOO: WHATEVER THE PEN IS ON INKS ITSELF ON THE CARD.

before `.qsheet .lbl, .gd .lbl, .qp-area .lbl, .pad-loupe .lbl`

```
/* `.qp-area` TOO: WHATEVER THE PEN IS ON INKS ITSELF ON THE CARD. Every figure was only ever drawn inside a
   `.qsheet`, on its own page; the card's drawing face stands in the answer box's place, outside the sheet,
   and the first screenshot of a made-up surface there was an empty card -- a squared grid with no squares
   and a blank space with no dashed edge, the lines present and unstroked (327, which added `.qsurf` to
   three of these rules). The paper's own figures moved onto the card on 11 Oct (337) and they use every
   class here: without them a Venn diagram is unlabelled circles, a number line's numbers fall back to the
   pen note's 0.62rem coding font anchored at their left ends, and a histogram loses its grid. So the area
   is in every rule, beside the sheet and the guide -- one container named once, not a list of the kinds
   of picture that might be drawn in it. check-css.js holds every figure-ink rule to naming it. */
```

### ---------- COINS, PRICE TAGS, AND SAYING WHO DREW THEM

before `.qsheet .coin, .qp-area .coin, .pad-loupe .coin`

```
/* ---------- COINS, PRICE TAGS, AND SAYING WHO DREW THEM -------------------------------------------
   THE SIZES CARRY INFORMATION, which is why the coins are not all one circle: a child recognises a
   50p by being the big seven-sided one, so the real diameters are scaled and 20p and 50p are drawn
   as heptagons. A picture that is drawn to scale is measured rather than eyeballed — CLAUDE.md
   makes that rule about READING a diagram and it applies just as much to drawing one.

   `currentColor` THROUGHOUT, like the two diagrams that were here before, so one drawing works on
   both of this app's palettes without a second copy of it. */
```

### `.fig-by` WAS HERE: the line under every drawing saying who redrew it.

before `.frac`

```
/* `.fig-by` WAS HERE: the line under every drawing saying who redrew it. The owner, 18 Oct: *"I don't
   like that extra text which disclaims it's drawn from blah blah. Get rid of that. Everywhere."* The
   paper is named by the card's tags (docs/history/355). */
```

### BOXING — THE FIGHTER AND THE FIGHT `boxer-nick` AND `boxer-rec` WERE NEVER STYLED.

before `.frac`

```
/* ==================================================================================================
   BOXING — THE FIGHTER AND THE FIGHT

   `boxer-nick` AND `boxer-rec` WERE NEVER STYLED. The card has been writing both since it was
   built, and both have been arriving as plain body text — a nickname in quotes reading as part of
   the name, and a record reading as a sentence. Not broken, so nothing complained; just never
   finished.

   THE WINNER IS A WEIGHT, NOT A LABEL. Two names, one bold, and the eye has the result before it
   has read a word. A draw leaves both light, which says draw without a line saying draw.
================================================================================================== */
```

### ---------- A FRACTION WRITTEN THE WAY THE PAPER PRINTS ONE

before `.frac`

```
/* ---------- A FRACTION WRITTEN THE WAY THE PAPER PRINTS ONE -----------------------------------
   THE LIBRARY ALREADY HAD `<sup>a</sup>&frasl;<sub>b</sub>`, and it is right for a bare fraction
   inside a sentence -- two thirds, five ninths. It is wrong for an EXPRESSION: Q19(a) of the June
   2024 Foundation Paper 2 is the square root of 35.2 + 1.7 cubed, all over 4.6 squared minus 8.91,
   and a numerator that long set as a superscript is unreadable at any size.

   THE CLASS NAMES ARE `frac-n` AND `frac-d`, NOT `num` AND `den`, and that is deliberate rather
   than fussy: `.qsheet .num` already exists in this file as the SVG label class for a drawn
   diagram, and these cards render INSIDE `.qsheet`. A second `.num` would have inherited a 13px
   serif and a text-anchor meant for an SVG -- the `.price.faint` collision again, where a class
   reads as a decision and behaves as something else.

   `inline-block` so it sits in the line of prose it belongs to, and the rule between the two halves
   is a border rather than a character, so it is exactly as wide as the wider half. */
```

### ---------- AND IT IS EVERY FRACTION NOW, NOT ONLY THE LONG ONES

before `.frac`

```
/* ---------- AND IT IS EVERY FRACTION NOW, NOT ONLY THE LONG ONES ----------------------------------
   THE PARAGRAPH ABOVE CALLED THE SLANTED FORM RIGHT FOR A BARE FRACTION, and that was a builder's
   choice the owner has since overruled: "it shouldnt be 4/5 it should be 4 over the five like how
   it is supposed to be." So `typeset_` in find.js turns every stored `<sup>a</sup>&frasl;<sub>b</sub>`
   into this markup when the card is drawn -- the stored shape stays, because set-accept.py reads it.

   `.frac-mixed` IS A MIXED NUMBER'S WHOLE PART AND ITS FRACTION, ON ONE LINE. A browser may break a
   line either side of an inline-block, so without it "3" can end one line and "4 over 5" start the
   next, which reads as two numbers. The fraction inside wraps normally again, so a long numerator
   is still free to fold rather than push the card sideways.

   `.frac-s` IS THE SLASH, THERE AND NOT SHOWN: a screen reader says "4 slash 5" instead of "4 5",
   and copying the question pastes 4/5 instead of 45. Clipped rather than `display: none`, which a
   screen reader would skip as well.

   ITS OWN WIDTH, CLIPPED TO NOTHING, PINNED TO THE FRACTION'S CORNER. The usual recipe squeezes the
   box to 1px with `overflow: hidden`, and that is a 7px slash in a 1px box: `check/cards.js` asks
   every element whether it scrolls sideways when nobody told it could, and it named `.frac-s` on
   431 cards. Left at its own width and clipped by `clip-path`, nothing overflows anything; pinned
   to the top-left of a `position: relative` fraction, it sits inside a box that is always wider
   than one slash. Not an in-flow zero-size box instead: between two block halves that opens a line
   of its own and pushes the denominator down by a whole line-height. */
```

### THE FIND CARD — FIVE PARTS, ONE SCALE, EVERY KIND THAT IS NOT A QUESTION

before `.fc`

```
/* ==================================================================================================
   THE FIND CARD — FIVE PARTS, ONE SCALE, EVERY KIND THAT IS NOT A QUESTION

   ASKED FOR AS *"didn't I ask you to sleekerise the whole widget system in the finder for questions
   and so on?"* — "nice more sleek, fresh stable". The question family has a polish of its own (note
   261); this is everything else Find draws: practicals and their pages, projects and theirs, the
   textbook and its chapters, boxers and fights, and the same cards kept on Saved. (Films too, until
   they left Find on 10 Oct; they are found in Games → Videos.)

   THEY WERE ONE SYSTEM BY ACCIDENT AND FOUR BY DEFAULT. The practical's `prac-*` classes had become
   the head, the kicker, the meta line and the section of the project, the textbook, the film and
   the quiz — under a name that said "practical" — while the boxer was drawn as a SHOP row (a
   0.92rem title, the record pinned in a corner), the fight as a bare paragraph of names at body
   size, the quiz with a round level pill where everybody else has a square kind flag, and the film
   with two rows of tiles. Measured at 390px: four title sizes (17.3, 14.8, 14.8 and 13.6px) for
   cards that each own a whole page, and nine different margins between their lines (.15rem to
   .65rem).

   SO THE PARTS HAVE NEUTRAL NAMES AND EVERY KIND IS BUILT FROM THEM:

     `.fc`        on the card — carries the spacing scale below, so every gap is one of three
     `.fc-head`   the title; the card's tag row (`.qtags`, every card's one renderer) goes under it
     `.fc-kick`   the small caption above a PAGE's title: whose page this is
     `.fc-meta`   the gold mono line of numbers that decide whether you read on (30 min · 7+)
     `.fc-sec`    a section, its `h4` the label (KEY WORDS, THINGS YOU COULD CHANGE)
     `.fc-list`   the list inside one — bullets for a kit, numbers for an order

   and three kinds of prose: `.fc-lede` (what it is, in ink), `.fc-say` (a labelled line, the label
   gold: "You end up with") and `.fc-note` (a quiet aside). The kind-specific classes that are left
   (`prac-haz`, `prac-no`, `tb-*`, `fight-who`) are the parts no other kind has.

   THE SCALE IS THREE STEPS, the shape note 261 gave the question card: `--fc-in` between a label
   and what it labels, `--fc-line` between lines of one group, `--fc-group` between groups. In rem,
   because none of it is a tap target. */
```

### ---------- A PRACTICAL

before `.fc-head`

```
/* ---------- A PRACTICAL ---------------------------------------------------------------------------
   ON THE BLACK, NOT ON PAPER. The two-palette rule turns on what a thing STANDS IN FOR: a receipt,
   a job stub or a print sheet is paper and takes the cream tokens. A practical is not a document
   you hand anybody — it is a card you read off a phone in a room, so it belongs to the screen.

   NO TAP TARGET ANYWHERE IN IT, which is why there is no `px` in this block. Every rule here sizes
   text, and text is the one thing that SHOULD scale with the root; the px rule is about fingertips
   and this card has nothing to press. */
```

### ---------- IT WRAPS NOW, BECAUSE THERE ARE TWO FLAGS

before `.fc-head`

```
/* ---------- IT WRAPS NOW, BECAUSE THERE ARE TWO FLAGS ---------------------------------------------
   `Build` AND `Extra` are two chips where there was one, and at 320px a long title beside both is
   more than the row holds. `min-width: 0` on the h3 is what stopped the title overflowing (see
   below) and it cannot help the flags, which are `flex: 0 0 auto` on purpose — a flag that shrinks
   is a flag with a word cut off. Wrapping is the only version where neither has to give: the flags
   drop under the title on the narrowest phone and sit beside it everywhere else. `check/cards.js`
   lays out all 82 of these at 320px, which is what says whether that is true. */
```

### ---------- THE WHOLE PRACTICAL IS ON THIS CARD, AND NOTHING HERE HAD TO CHANGE FOR IT

before `.fc-head`

```
/* ---------- THE WHOLE PRACTICAL IS ON THIS CARD, AND NOTHING HERE HAD TO CHANGE FOR IT ------------
   REPORTED AS "Same layout. Diagram, ingredients, steps, work. It seems you've moved it all to pop
   up after pressing a tile. I HATE THIS. I HATE POP UP. Even if it doesn't fit on screen we'll
   cross that bridge when we get there."

   THE BRIDGE WAS ALREADY BUILT, and finding that out is the whole of this entry. With the guide
   drawn inline a practical card is a MEDIAN 1,581px at 390x844 and 77 of the 82 are over the cap —
   so the obvious move was a `max-height` and an `overflow-y: auto` on `.card.prac`, and it was
   written, and it worked, and it was WRONG. `paneReach_` in find.js already measures every funnel
   pane after a paint and writes `overflow-y: auto` inline on the ones that overflow, for the 431
   question cards that had the same fault; `scrollHost_` in overworld.js then scrolls that pane from
   the app's own drag and hands the next swipe to the grid. A practical card is a funnel result, so
   it has been covered since the day that was written.

   MEASURED, THE NEW RULE MADE IT WORSE: the card scrolled 266px, and then the PANE scrolled a
   further 81, because a card capped at the pane's outer height does not fit inside the pane's
   padding. Two scrollers down one card, and a swipe eaten between them. The instrumented run said
   it outright — `scrollHost_` answered `card prac` on the first swipe and `pane` on the second.

   SO THERE IS NO RULE HERE. One card, everything on it, the pane scrolls it, and the swipe after
   the end turns the page. `--cell-max` was extracted at `:root` for the same wrong reason and went
   back with it. The measurement is kept because it is what says the reachability is real rather
   than assumed. */
```

### ---------- AND NOW THE FLAGS SIT ABOVE THE TITLE, ALWAYS

before `.fc-head`

```
/* ---------- AND NOW THE FLAGS SIT ABOVE THE TITLE, ALWAYS ----------------------------------------
   THE WRAP ABOVE WAS RIGHT ABOUT OVERFLOW AND IT GAVE EVERY CARD TWO LAYOUTS. A short title had its
   flags at the far right of its line; a long one had them dropped to a line of their own, LEFT
   aligned, between the title and the subject line — so `FIGHT` sat beside `Jack Dempsey v Jess
   Willard` and alone under `Jack Johnson v James J. Jeffries` one card earlier, and which you got
   depended on the length of somebody's name. Measured over all 435 cards of these kinds with the old
   wrapping head: 227 wrapped in the 326px pane of a 390px phone, and all 435 at 320px.

   SO THE FLAGS ARE THE PAGE'S KICKER: one small row above the title on every card, in the slot a
   part page uses for whose page it is (`.fc-kick`). Every page of every kind now reads kicker,
   title, line, numbers. `column-reverse` rather than moving the markup, so a screen reader still
   hears the title first and the flags after it — the order of importance — and the overflow fault
   cannot come back: nothing shares a line with the title any more. */
```

### ---------- `min-width: 0`, AND WITHOUT IT FOUR CARDS RAN PAST THE COLUMN

before `.fc-head h3`

```
/* ---------- `min-width: 0`, AND WITHOUT IT FOUR CARDS RAN PAST THE COLUMN -------------------------
   A FLEX ITEM'S MINIMUM IS `auto`, WHICH IS ITS MIN-CONTENT — the widest unbreakable word, not
   nothing. So a one-word title beside a `flex: 0 0 auto` flag could not shrink to the card, and
   `Photosynthesis`, `Field investigations`, `Chromatography` and `I–V characteristics` each took
   `.fc-head` and then `.card` up to 19px past a 320px column.

   NOTHING HAD EVER LOOKED. `check/cards.js` lays out every row of `data/questions.json` and
   `check/ui.js` measures nine screens — and a practical card is in neither, because the funnel
   fills five pages either side of where you are and never happened to stop on one of these four.
   That is this file's own "a sample is not a sweep", one data file along, and it is why
   `check/cards.js` now lays these out too. Found by laying all 56 out while adding ten more. */
```

### ONE TITLE SIZE FOR A CARD THAT OWNS A PAGE, and a part page's title is one too — "Steps" under its kicker is the page's name exactly as

before `.fc .fc-head h3, .fc.prac-part > h3`

```
/* ONE TITLE SIZE FOR A CARD THAT OWNS A PAGE, and a part page's title is one too — "Steps" under
   its kicker is the page's name exactly as "Animal behaviour logging" is the card's. It was the
   browser's own h3 (1.17em, 17.3px) on the cards with a head, 1rem on their pages, 0.92rem on a
   boxer and 1rem of loose spans on a fight. `.fc` in front so it outranks `.card > h3` instead of
   tying with it — a tie is what `check/cascade.js` exists to catch. */
```

### THE LINE UNDER THE TITLE SITS UNDER IT.

before `.fc .fc-head + .sub`

```
/* THE LINE UNDER THE TITLE SITS UNDER IT. `.card .sub` pulls a subtitle up with a negative margin,
   which is right under a bare `h3` and wrong under a head row whose flags have wrapped: the subject
   line was jammed against `EXPERIMENT · EXTRA` with nothing between them. A fixed step instead. */
```

### `.prac-kit` IS BACK ON THESE THREE GROUPS, because it holds a list again.

before `.fc-list`

```
/* `.prac-kit` IS BACK ON THESE THREE GROUPS, because it holds a list again. The kit was chips —
   "like how Google has chips in documents" — and they were reverted on "the google chip idea didnt
   work how i wanted to so revert back", so `.kit-chips`, `.kit-chip`, `.kit-n` and `.kit-q` went
   with them and these are the rules the kit had before, restored as they were: one item a line, a
   bullet's indent, the guide's dim ink. The quantity is text on the line — see `kitList_`.

   The tenth conviction of `.price.faint` was recorded against `.prac-kit ul` beside those chips — a
   class plus a type (0,1,1) that would have out-specified `.kit-chips`' (0,1,0) and indented the
   block by a bullet's width. With no chip rule left there is nothing for it to beat; it is the only
   rule styling that list, as it was before them. */
```

### ---------- A NUMBER IS WIDER THAN A BULLET, AND `10.` IS WIDER STILL

before `ol.fc-list`

```
/* ---------- A NUMBER IS WIDER THAN A BULLET, AND `10.` IS WIDER STILL -----------------------------
   EVERY LIST HERE HAD THE BULLET'S 1.1rem INDENT, and a marker hangs in that indent right-aligned —
   so at 320px the textbook's contents had `10.` to `16.` sticking out past the card's own padding,
   two characters further left than `1.` to `9.` above them. An ordered list gets the room its
   numbers need, and a list that reaches ten gets the room for two digits. */
```

### `.prac-safety` AND `.prac-maths` WERE HERE, and the guide was the only thing that drew either.

before `.fc-note`

```
/* `.prac-safety` AND `.prac-maths` WERE HERE, and the guide was the only thing that drew either.
   The safety line was a gold-ruled paragraph and its note is worth keeping: the house rule puts one
   paragraph under a row rather than three words on a tile, because "Adult operates the microwave"
   does not survive being trimmed to fit. Both went when the guide was cut to five things — the
   name, the picture, the kit, the method and the three worksheet questions. `safety` and
   `maths_link` are still columns and `check-practicals.js` still counts them, so a guide that wants
   either back needs these two rules and nothing else. */
```

### `.fc-note p` WAS HERE, a margin between the paragraphs of a note that held several.

before `.prac-tab`

```
/* `.fc-note p` WAS HERE, a margin between the paragraphs of a note that held several. The practical
   guide split its pipe-listed `notes` that way and stopped drawing them; the FILM card was the last
   thing to put a `<p>` inside a `.fc-note`, and it went with the films (10 Oct, *"films should not
   appear in the finder it cannot be found there"*). Every `.fc-note` left IS the paragraph. The day
   something splits the pipes again, each part wants its own line — three asides run together are
   three things nobody reads — and these two rules are what to put back. */
```

### THE HOME EXPERIMENTS.

before `.prac-tab`

```
/* ==================================================================================================
   THE HOME EXPERIMENTS.

   Ten of the fifty-six run in somebody's front room rather than a lab, and five more were
   considered and turned down. Everything below draws a column the 41 lab practicals do not carry,
   so every one of these rules is on an element that is simply absent on those — no rule here
   changes a card that existed before.
================================================================================================== */
```

### ---------- WHAT IS GOING ON WAS HERE

before `.prac-tab`

```
/* ---------- WHAT IS GOING ON WAS HERE ------------------------------------------------------------
   `.prac-why` DREW THE `science` PARAGRAPH and went with the cut to five things. The argument for
   the ink it had is the part worth keeping: `aim` is one line and `outcome` is what you end up
   with, and this was the paragraph that actually teaches — the one a tutor reads before deciding
   whether they can explain it. `science` is still filled on all 77 live rows and still counted, so
   it is a column held rather than a column lost; three rules bring it back. */
```

### ---------- THE TWO HALVES OF THE CANDIDATE TABLE

before `.prac-tab`

```
/* ---------- THE TWO HALVES OF THE CANDIDATE TABLE ------------------------------------------------
   IT WAS THE RESULTS TABLE UNTIL THE GUIDE WAS CUT TO FIVE THINGS. There is no results section now;
   what draws this is the Worksheet's own scaffolding — things you could change beside things you
   could measure — and the argument below is unchanged, because it was always about the PAIR.
   SIDE BY SIDE WHERE THERE IS ROOM, and stacked on a phone. They are two columns of one table —
   "what I changed" and "what I measured" — and the whole point of drawing them together is that
   the pair is the method. `minmax(0, 1fr)` rather than `1fr`: a grid track's default minimum is
   `auto`, which is the widest word rather than nothing, so a long item would push the pair
   sideways instead of wrapping. That is the `.bk-row` fault one card along. */
```

### A COLUMN LABEL, NOT A SECTION HEAD, AND IT WAS DRAWN AS BOTH.

before `.fc-sec .prac-tab h4`

```
/* A COLUMN LABEL, NOT A SECTION HEAD, AND IT WAS DRAWN AS BOTH. This was byte-for-byte
   `.fc-sec h4` — same font, same size, same weight, same tracking, same ink — which was invisible
   while six sections carried that style and the pair sat side by side at 30rem. With the guide cut
   to three sections it is the only nesting left, and at 320px the table stacks: WORKSHEET, THINGS
   YOU COULD CHANGE and THINGS YOU COULD MEASURE came out as three identical lines, so the section
   head read as a section with nothing in it and its own table read as two sections beside it.

   WEIGHT RATHER THAN SIZE, because at this size there is nothing else to spend. `.68rem` is 9.2px
   on a 320px phone and `.62rem` is 8.4 — under a pixel, which nobody reads as a rank. 400 against
   600 is a stroke a reader can see at any size, and it keeps the mono uppercase that is this app's
   own idiom for a label. Found on a screenshot, which is the only thing that could have: both
   rules are correct and nothing measures wrong.

   AND IT HAS TO OUT-SPECIFY `.fc-sec h4` RATHER THAN OUT-SIT IT. These two labels are `<h4>`s
   inside a `.prac-tab` inside a `.fc-sec`, so both rules match them, both are (0,1,1), and while
   they said the same thing it did not matter which came later. The moment they differ, order alone
   would decide — which is the `.price.faint` fault this stylesheet has now been convicted of
   eleven times (`.prac-kit ul` four hundred lines up is the tenth), and `check/cascade.js` is the
   rule that reports it. `.fc-sec .prac-tab h4` is (0,2,1) and wins wherever it is written. */
```

### ---------- THE HAZARD WORD

before `.prac-haz`

```
/* ---------- THE HAZARD WORD ----------------------------------------------------------------------
   IT SITS IN THE STRIP AND IT IS THE ONE THING ON THE CARD THAT IS NOT GOLD. Every other figure up
   there is a fact about the session — how long, how old, what it costs — and this one is the
   triage: a tutor reading `medium hazard` on a card about burning steel wool in a client's garden
   should not have to find it among five other gold words.

   `--warn` AND `--red` ARE ALREADY TOKENS. Nothing new is declared: the house style says a colour
   used by more than one component is a `:root` token, and both of these are. */
```

### ---------- AND THE ONES THAT ARE NOT RUN

before `.prac.is-off`

```
/* ---------- AND THE ONES THAT ARE NOT RUN --------------------------------------------------------
   A CARD THAT COULD BE MISTAKEN FOR SOMETHING TO DO IS THE WHOLE RISK of keeping these rows at
   all. The flag changes word and colour, the reason is the first thing under the subtitle, and the
   card itself is dimmed — three signals for one fact, deliberately, which is the same doubling
   `placeholder: True` already gets on a question whose source could not be reproduced.

   THE HEADING AND THE REASON STAY AT FULL STRENGTH inside the dimmed card, because a refusal
   nobody can read is a refusal that gets ignored. */
```

### ---------- ONE SENTENCE THAT BELONGED TO THE VENUE, NOT TO ANY ROW

before `.prac-cost`

```
/* ---------- ONE SENTENCE THAT BELONGED TO THE VENUE, NOT TO ANY ROW ------------------------------
   `.prac-home` DREW THE PUBLIC-LIABILITY LINE — true of every experiment run in somebody else's
   house, drawn from `venue` so there was one copy of the wording rather than one per row. It went
   with the risk assessment when the guide was cut to five things. **That is the one deletion here
   with a cost outside the layout**, and it is written where the rule was rather than only in
   CLAUDE.md: nothing in the app now says that a practical at a client's house wants the cover
   checked and the parent's agreement in writing. The fact is still `venue === 'home'` on 34 of the
   77 live rows, so the sentence is one rule and one line of markup away. */
```

### ---------- A PRACTICAL'S OTHER THREE PAGES — WHOSE PAGE IT IS, THEN WHAT IT IS

before `.fc-kick`

```
/* ---------- A PRACTICAL'S OTHER THREE PAGES — WHOSE PAGE IT IS, THEN WHAT IT IS ---------------
   "Split into widgets. diagram, equipment, steps, worksheet bit." The kit, the method and the
   worksheet are pages of their own after the practical's card (see `practicalPart_`), and a page
   you can land on from a flick four results away has to say which practical it belongs to. So the
   practical's name sits SMALL above the section's own heading — the name is context and the
   heading is what this page is, which is the order of importance on it. `--faint` and the mono
   label size because it is a caption; the `<h3>` takes the card's ordinary heading rules. The name
   wraps rather than clipping, for the `.fc-head h3` reason: a long title is one unbreakable
   flex item's worth of text on a 320px phone. */
```

### A CONTENT CARD'S TAG ROW, UNDER ITS TITLE (347, part 2).

before `.ct > .qtags`

```
/* A CONTENT CARD'S TAG ROW, UNDER ITS TITLE (347, part 2). A question's row is the first thing on its card;
   here it follows the head, and with no gap the first line of pills sat on the title's descenders —
   measured on Indices, surds and standard form at 390. Half a line apart, and the same again before the
   key words, so the row reads as the card's label and not as the first line of its content. */
```

### ---------- THE @family. TEXTBOOK — WHAT A BOOK HAS THAT A PROJECT DOES NOT (each chapter is a content card now)

before `.tb-h`

```
/* ---------- THE @family. TEXTBOOK — WHAT A BOOK HAS THAT A PROJECT DOES NOT (each chapter is a content card now) -----------------
   "the @family textbook should be bare bones for now". Everything else on its pages is `.prac` and
   the guide's `.fc-sec`, so these are the only three things it adds: the Higher mark, a key word's
   own term, and a formula drawn on a line of its own.

   THE MARK IS A LETTER IN A BOX, in a hairline outline and the screen's ink, NOT gold: Higher is not
   "the board makes you". It marks a LINE inside the card; the card's own tier is its [Higher] tag.
   `vertical-align: .1em` sits it on the text it qualifies rather than on the line under. */
```

### A FORMULA'S NAME ABOVE IT, THE FORMULA IN THE CARD'S OWN INK AND A SIZE UP — it is the thing on the page somebody came for, and a stacked fraction at .8rem is

before `.tb-math ul`

```
/* A FORMULA'S NAME ABOVE IT, THE FORMULA IN THE CARD'S OWN INK AND A SIZE UP — it is the thing on
   the page somebody came for, and a stacked fraction at .8rem is two numbers too small to read.
   `overflow-wrap: anywhere` because a long standardised-rate formula is one unbreakable run of
   words on a 320px phone, and `.frac` is inline-block, so it moves to the next line whole. */
```

### ---------- A CHAPTER'S ANIMATION: ITS STAGE, AND THE ONES NOT IN FRONT HELD STILL

before `.tb-an-stage`

```
/* ---------- A CHAPTER'S ANIMATION: ITS STAGE, AND THE ONES NOT IN FRONT HELD STILL -----------------
   THE DRAWING'S OWN CSS IS NOT HERE. It is the row's, in data/textbooks.json, and arrives as one
   `<style data-anim>` per animation (`animStyle_`); this is only the box it stands in. Centred, as the
   splash centres it, because every drawing was sized and balanced for that.
   PAUSED UNLESS IN FRONT, AND `!important` IS THE ONLY WAY TO SAY IT. Each drawing sets its motion
   with the `animation` shorthand, which resets `animation-play-state` to running, and its `<style>` is
   later in the cascade than this file — so without it every page Find keeps filled either side of you
   ran its drawing out of sight, and the one you swiped to was already half way through its story.
   `tbAnimWatch_` puts `.is-on` on the page in front and restarts it there. The index laws light their
   tiles with an `::after`, which `*` does not reach.
   A SIZE CONTAINER, so a drawing sized to the phone can also be sized to the card: the sieve's line of
   seventeen numbers is `min(… vw, … cqi)`, and `cqi` is this box. */
```

### ---------- THE BIBLE — A COVER, AND A CARD A VERSE

before `.bb-who`

```
/* ---------- THE BIBLE — A COVER, AND A CARD A VERSE ---------------------------------------------------
   "i want to add the bible to resources as a book", and then, 6 Oct, *"it should be like the other
   stuff. tags in finder ... each verse is a widget."* So there is almost nothing here: the cover is
   the textbook's card (`.prac`, `.fc-*`), a verse's tags are the question card's row (`.qtags`), and
   the questions are the funnel's own answer chips — the grid they are drawn in for a chapter or a
   verse is with `.answers` below, because it is the funnel's, not the Bible's. These are what reading
   one verse needs that nothing else on Find does.
   WHAT WENT: the three lists of book buttons, the chapter-number buttons, the measured pages and the
   tiles back up between them (`.bb-books`, `.bb-book`, `.bb-grid`, `.bb-ch`, `.bb-verses`, `.bb-n` and
   the rest) — the reader those drew is gone, and a rule for a class nothing writes is a rule nobody
   can see is dead.

   WHO CAN SEE IT, IN THE COLOUR THAT SAYS SO. `--admin` is this app's "only you can see this" (the
   tile rules near the end of this file), and the cover is the one card on Find that is exactly that. */
```

### ---------- THE VERSE

before `.bb-v`

```
/* ---------- THE VERSE ------------------------------------------------------------------------------
   THE CARD IS THE VERSE, SO IT IS SET LIKE ONE: 1.2rem — 16px at 320, 18px at 390 — where the old
   pages of a whole chapter were 1rem, because a card holding one sentence has the room a page of
   twenty did not, and a verse is read slowly. Esther 8:9, the longest at 534 characters, is the one
   that fills a small phone's pane; `paneReach_` draws that one card a step smaller, as it does any
   card, and every other verse is drawn at this size. */
```

### THE GUIDE. FIVE THINGS:

before `.gd > :first-child`

```
/* ==================================================================================================
   THE GUIDE. FIVE THINGS: the sheet's own title, the drawing, the kit, the method, and a
   worksheet holding the three variables.

   THREE RULES, BECAUSE EVERYTHING ELSE IN IT ALREADY HAD ONE. The drawing is `.gd figure`, which
   is `.qsheet figure`'s own rule with `.gd` added to the selector — one description of an inline
   drawing, laid out inside the `min(100%, 20rem)` every picture in this app shares. The kit list,
   the method and the two-column candidate table are the CARD's blocks, moved, so the guide draws
   them with the card's own classes. The answer box is `ansBox_`'s box, `.qp-ans` and `.qp-ans-in`.
   A second set of rules describing one object is the `.reel .over` fault, where a subject, a
   heading, a paragraph and a credit over a picture were written twice here and drifted.

   IT DREW EIGHT ANSWER BOXES AND A RISK ASSESSMENT UNTIL 2026-09-25 — eleven headings, of which
   five are left — and four rules went with the cut:
   `.prac-safety`, `.prac-maths`, `.prac-home` and `.gd-none`, each with its argument kept as prose
   where the rule was. What went is written out over `practicalGuide_` rather than here, because
   the list belongs beside the markup that stopped producing it.

   WHY IT IS IN THE SHEET AND NOT ON THE CARD, measured before a word of it was written: `.pane` is
   `overflow: hidden` and caps at 805px on an 844px phone, and **51 of the 56 practical cards were
   already taller than that**, median 921px. More than half the set had its kit, its method and its
   safety line cut off with no scroll and no page to turn to. `#sheet-body` scrolls, which is this
   app's own answer for anything longer than a card.

   NO PAPER TOKENS. A guide is not a document you hand anybody — it is read off a phone in a room,
   exactly as the card is, so it belongs to the screen. Same argument as `.prac-*` above it.
================================================================================================== */
```

### ---------- THE QUESTION, AND THE LINE THAT SAYS WHY IT IS BEING ASKED

before `.gd-ask`

```
/* ---------- THE QUESTION, AND THE LINE THAT SAYS WHY IT IS BEING ASKED ---------------------------
   THE HINT IS THE HALF THAT TEACHES. "Independent variable" is a phrase a student has heard and
   cannot use; "one only, everything else has to stay still or you will not know which of them did
   it" is the rule. It is faint because it is read once and the question is read every time.

   NOT UPPERCASE AND NOT LETTER-SPACED, which is what `.qp-ans-k` beside it is — see `guideBox_`. */
```

### ---------- `.gd-none` WAS HERE: AN INSTRUCTION, WHICH IS NOT A FACT

before `.gd-box`

```
/* ---------- `.gd-none` WAS HERE: AN INSTRUCTION, WHICH IS NOT A FACT ------------------------------
   IT WENT WITH THE SECTIONS IT SPOKE IN. "Rule the table up before you start" and "no hazards have
   been written out for this one yet" were the guide talking, in the results and risk sections; the
   guide draws neither now, so nothing produces the class. Three things it settled are kept here,
   because each one is a fault that has cost this stylesheet before:

   `--dim` IN THE GUIDE MEANS A FACT FROM THE DATABASE AND `--faint` MEANS IT DOES NOT. That is the
   convention `.gd-hint` still follows — a question is a fact, the sentence explaining why it is
   being asked is not.

   A DESCENDANT RULE FOR IT WOULD HAVE BEEN A TRAP. `.fc-sec p` is one class plus a type, (0,1,1),
   against `.prac-safety`'s and `.prac-home`'s (0,1,0) — both `<p>` inside a `.fc-sec` — so it
   would have won every declaration they made and flattened the gold-ruled warning into ordinary
   body text. Caught before it was written, which is the one place in this stylesheet's list of
   `.price.faint` convictions that reads that way. Those two rules are gone now, so nothing is left
   for `.fc-sec p` to beat — and it is still the wrong shape to reach for, because the next
   paragraph added inside a section is the one it would flatten.

   AND A SCREENSHOT IS WHAT FOUND THE FAULT IT FIXED. Before it existed, the guide's maths line and
   its tutor notes were bare `<p>`s and drew at the browser's default 16px — a third larger than
   every other paragraph on the card. Valid markup, no overflow, nothing to measure. */
```

### ---------- A BOX PER SECTION, AND THE FLOOR IS A FINGERTIP

before `.gd-box`

```
/* ---------- A BOX PER SECTION, AND THE FLOOR IS A FINGERTIP ---------------------------------------
   `textarea` IS `min-height: 5.8rem` GLOBALLY, which is a page-long box seven times over. These are
   two or three lines each and the card is already long. In `px` at the floor and `rem` above it,
   which is the shape the global rule uses and the reason it survives a fluid root — 4.2rem is 62px
   on a 390px phone and 44px is the fingertip underneath it. Sixth conviction of that rule.

   THE BOX IS THE PAD'S NOW (`kpField_`, keypad.js, 8 Oct: *"I just want self contained system
   really"*), so what was the textarea's look -- the `--sunk` ground, the ruled line, gold on focus --
   is the FIELD's, and the height and the ink are its drawing's (`.kp-show`): the textarea is invisible
   under it. The caret is gold, because the drawing's own caret is the paper's ink and vanishes on
   black, and the empty box says "Type your answer" in `--faint`, 5.4:1 on the sunk ground. */
```

### ---------- AND A SEND BESIDE EACH BOX, SIGNED IN

before `.qp-mark.gd-mark`

```
/* ---------- AND A SEND BESIDE EACH BOX, SIGNED IN ---------------------------------------------------
   *"I just want system to record each submition"* (9 Oct): a worksheet's answer reaches the account when
   it is SENT, so each box has the plain Send (`guideBox_`). The box is `.qp-mark` -- the name the handler,
   the verdict's colours and the input listener find a box by -- but laid out as a grid, not the verdict
   row `.qp-mark` is everywhere else. THE LABEL'S OWN PARTS ARE ITS ITEMS (`display: contents`): the
   question and its hint across the width, the field and the gold Send side by side under them -- the
   disc at the field's foot, as at the chat bar -- then the verdict and where it went, a line each, the
   verdict's reserved so "Sent" lands in a space that was already there. Send was a 48px row of its own
   under each box at first, and three of them took the worksheet at 320 to the 70% floor and a scroll.
   The label is still the label: a tap on the question still focuses its box. */
```

### `gap` WHOLE, not `column-gap`:

before `.qp-mark.gd-mark`

```
/* `gap` WHOLE, not `column-gap`: `.qp-mark` is a flex row with `gap: .7rem`, and on a grid that is a
   ROW gap too — 10px between the question and its hint, the hint and its box, that the box signed out
   does not have (seen in the first shots, 390). */
```

### ---------- A QUESTION CARD'S CHOICES

before `.qp-opts`

```
/* ---------- A QUESTION CARD'S CHOICES ---------------------------------------------------------------
   THESE WERE `.quiz-opts` AND `.quiz-opt` UNTIL THE QUIZZES WENT. The recap quizzes drew the same
   column of options first and the question card borrowed it under the quizzes' name; with the
   quizzes deleted ("completely made up bullshit") the name said a feature that no longer exists, so
   the box is `.qp-opts` and the base rules folded into `.qp-opt`, which every option already carried.

   44px IN PX, WHICH IS THE ONE MEASUREMENT IN THIS STYLESHEET THAT DOES NOT SCALE. A fingertip is
   the same size on every screen, and `2.75rem` is 40.75px on a 390px phone — this rule has six
   convictions behind it already (`.btn.tiny`, `.post-act`, `.fm-adds label`, the filter chips,
   `.qp-check`, `.reel-sound`). `min-height` and not `height`, because a four-word choice wraps.

   A COLUMN AND NOT A GRID. "The spreading of particles from high concentration to low
   concentration" is one of four options on one question, and two of those side by side at 320px is
   two words a line. Reading is what this control is for.

   TEXT-ALIGN LEFT, because they are sentences rather than labels — a centred paragraph with a
   ragged left edge is the thing that makes a list of options hard to scan. */
```

### ---------- THE QUESTION CARD'S OPTIONS, WHICH TAKE THE VERDICT'S COLOURS

before `.qp-opt`

```
/* ---------- THE QUESTION CARD'S OPTIONS, WHICH TAKE THE VERDICT'S COLOURS --------------------------
   ON THE QUESTION CARD THE OPTIONS SIT DIRECTLY ABOVE A
   verdict that is green for right and amber for "not yet" -- while the right option was outlined in
   GOLD and the pressed wrong one in RED. So one screen said the answer in gold and "not yet" in gold,
   and called a miss red one line above the sentence that was written not to. On the card the options
   now speak the verdict's language: the right one green with a tick, the pressed miss amber.

   A RING TO SAY "PRESS ME", because a column of dark boxes with grey numbers in them read as a list
   of facts. Filled when chosen, a tick when it is the answer. Painted by `::before` in the padding
   the button already has, so the option's own markup -- italics, a stacked fraction -- is untouched:
   a flex button would have made every text node and `<i>` in it a separate flex item.

   THE PRESS DOES NOT MOVE THE WORDS. A 2px border on the picked option pushes the text in by a
   pixel on the tap that chose it; so the second pixel is an inset shadow, drawn
   inside the box, so the option you pressed stays exactly where your finger left it.

   ONCE MARKED THE OTHERS STEP BACK. `is-done` (choiceBox_) is only set when the question is settled,
   which the handler already enforces -- so the unchosen ones fade and stop looking pressable, and
   what is left in full ink is what you picked: green with a tick if it was right, amber if not.
   `.is-ans` IS ONLY EVER YOUR OWN PICK NOW. A miss used to tick the right option beside it, which
   is the answer shown on the question card without Show -- see `choiceBox_`. */
```

### INK ON EVERY OPTION OF A QUESTION CARD, by SPECIFICITY rather than by being written later:

before `.qcard .qp-choices .qp-opt`

```
/* INK ON EVERY OPTION OF A QUESTION CARD, by SPECIFICITY rather than by being written later: the box
   and card in front make it (0,3,0) against the base `.qp-opt`'s (0,1,0), so `check/cascade.js` can
   see why it wins. The faded options below are more specific again. */
```

### ---------- AN ORDERING: A STRIP OF SLOTS ON PAPER, THE ITEMS UNDER IT

before `.qp-order`

```
/* ---------- AN ORDERING: A STRIP OF SLOTS ON PAPER, THE ITEMS UNDER IT --------------------------------
   See `orderBox_`. THE STRIP IS THE PAPER PALETTE, because it is the answer space -- the line on the
   sheet the order is written on, the chat bar's argument (`.qp-bar`): cream on the card in the sun is
   17:1 where `--sunk` on `--raised` was 1.04. Its empty slots are dashed in `--paper-dim` (5.3:1), the
   way the keypad draws an empty slot, and a filled one is ringed in the paper's own ink.

   THE ITEMS ARE ON THE CARD, as the options are, with a `--dim` edge rather than `--line`: an item is a
   thing to press and its plate has to be found in glare. A placed item is a ghost of itself -- dashed,
   faint, the same size in the same place, and `disabled` -- so the row never closes up under a finger
   and a quick second tap on it does nothing.

   44px IN px, the one measurement here that does not scale (CLAUDE.md): every slot and every item, and
   `min-` both ways, because an item is as wide as its words. Both rows WRAP, so five numbers, or eight
   fractions, fit 320 by going onto a second line, never sideways.

   THE TWO ENDS ARE A LINE OVER THE SLOTS, "Smallest" at the left edge and "Largest" at the right with
   an arrow between, at the verdict's .78rem in the paper's ink. They were .62rem capitals in
   `--paper-dim` at the two ends of the slots' own row (9.2px at 390, 8.4px at 320 -- the smallest words
   on the card, for KS1), and as flex items in that row they forced a wrap at every width: at 768
   "LARGEST" sat alone on a line under slot 5. A line of their own costs its height and gives the slots
   the whole width back, and over all 71 orderings at 320x568 it comes out about even (signed out: 24
   cards drawn smaller and 2 scrolling, where it was 22 and 5; signed in, 48 and 8 where it was 52 and
   8). Q4 is a line taller at 320 -- four slots and one, under the ends -- and signed in its card is
   drawn at 92% where it was 95%.

   EVERY SLOT IS THE WIDEST ITEM'S WIDTH, empty or full (`--qp-ch`, the widest item's characters, set
   on the strip by `orderBox_`; the face is monospaced), so a tap never pushes the slots after it along.
   Side padding 6px and a 5px gap, so four of Q4's slots fit one line at 320.

   THE RING TAKES THE VERDICT'S COLOUR, as the chat bar's does -- green or amber 3px outside the strip,
   on the card. The verdict is the reserved `.qp-mark` line under the items, Clear and Send at its end,
   so marking moves nothing (261). */
```

### THE ENDS ARE A LINE OF THEIR OWN, the first at the strip's left edge and the last at its right, like the two ends of a number line, with an arrow between them

before `.qp-ends`

```
/* THE ENDS ARE A LINE OF THEIR OWN, the first at the strip's left edge and the last at its right, like
   the two ends of a number line, with an arrow between them pointing the way the row runs. The whole
   width (`flex-basis: 100%`), so the slots under it start a line of their own and nothing wraps alone. */
```

### THE ARROW IS DRAWN INSIDE ITS OWN BOX -- the shaft a 1.5px band across the middle, the head a border triangle at the right edge.

before `.qp-way`

```
/* THE ARROW IS DRAWN INSIDE ITS OWN BOX -- the shaft a 1.5px band across the middle, the head a border
   triangle at the right edge. Hung 6px past the end of a zero-height line, the head made the span
   scroll sideways by 6px (`check/ui.js`, SIDEWAYS SCROLL, at 320 on every ordering). */
```

### THE TILES DO NOT GIVE WAY TO THE VERDICT.

before `.qp-order > .qp-mark > .tile`

```
/* THE TILES DO NOT GIVE WAY TO THE VERDICT. "Not yet — have another go" is `flex: 1 1 auto`, and the
   tiles could shrink, so marking a wrong order at 320 squeezed Send from 48x48 to 39x48 (the disc an
   oval) and Clear from 44 to 36 wide, under the tap target, and moved them 9 and 17px -- marking moved
   things after all, and only the short "Correct" had been measured. The verdict wraps inside its own
   slot instead, as it does beside the typed bar's tiles (`.qp-bar > .tile`). */
```

### THE FIGHTER'S PROFILE — the boxer card as a tale of the tape.

before `.boxer, .fight`

```
/* ==================================================================================================
   THE FIGHTER'S PROFILE — the boxer card as a tale of the tape. See the long note over `boxerCard_`
   in find.js for what is on it and in what order; this is how it looks.

   ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer. and make it look nicer.
   the wins losses etc."* The record was one small gold line; it is the biggest type on the page now.

   ON THE BLACK, NOT ON PAPER — a fighter's page is read off a phone, like a practical, so it takes
   the screen's palette. THE RESULT COLOURS ARE THIS CARD'S OWN NAMES for the app's tokens, defined
   on the card per the house rule: a record is always coloured won / lost / drawn, and nothing else
   in the app means those three things, so `--boxer-w` is offered here and nowhere else. The fight
   card carries the same names because its faces are the same frames.
     --boxer-w    a win      gold, which on this card means "what he won" and nothing else
     --boxer-l    a loss     the ring's red — the placeholder ring's middle rope and gloves
     --boxer-d    a draw     the quiet ink
     --boxer-nc   no contest fainter again: it is not a result at all
================================================================================================== */
```

### ---------- THE PROFILE IS A GRID, SO THE PICTURE CAN STAND BESIDE THE NAME

before `.card.fc.boxer:not(.is-fights)`

```
/* ---------- THE PROFILE IS A GRID, SO THE PICTURE CAN STAND BESIDE THE NAME ----------------------
   THE PHOTO COMES AFTER THE HEAD, THE SUB-LINE AND THE STATUS IN THE MARKUP, AND TO THEIR LEFT ON
   THE SCREEN — a fight poster's layout, the face in the left two-fifths and the name beside it. A
   grid is the only way to say that without moving the markup, and the markup stays put so a screen
   reader hears the name first and every Find card opens on its `.fc-head` (see `boxerCard_`).

   FOUR ROWS ON THE RIGHT, THE LAST ONE `1fr`. The picture spans all four; the head, the sub-line and
   the status take the first three, and when the picture is the taller side it is the fourth row
   that grows — so the three lines stay packed under each other at the top rather than spreading out
   down the photo's height. Everything after them (`> *`) spans both columns.

   NOTHING ELSE MOVES: every part of a Find card states its own top margin and none relies on one
   collapsing into its neighbour's, which is the one thing a grid does differently. `min-width: 0`
   for `.fc-head h3`'s reason — an item's minimum is its widest word, and 320px is narrower than some.

   THE FIGHTS PAGE IS AN ORDINARY PART PAGE and is left out, so its kicker and title stack as every
   other part page's do. */
```

### ---------- THE NAME, THE NICKNAME UNDER IT

before `.boxer-nick`

```
/* ---------- THE NAME, THE NICKNAME UNDER IT ------------------------------------------------------
   THE NICKNAME WAS A DIM SPAN IN THE SAME LINE, so "Muhammad Ali “The Greatest”" wrapped wherever
   the width said and read as one long name. On a line of its own, in the italic a ring announcer's
   voice is set in, and gold — it is the one thing on the head a fan would shout. Smaller than the
   name (`em`, so it follows the title's one size rather than setting a second). */
```

### ---------- WHAT HE IS NOW

before `.boxer-status`

```
/* ---------- WHAT HE IS NOW --------------------------------------------------------------------------
   A STATE, SET AS A LABEL — the mono capitals every label here uses — with a mark before it in the
   state's colour: a dot, green for a man still fighting (`--good`, the app's word for "live"), the
   quiet ink for retired, and a dagger for the dead, which is how a record book marks one.
   NOT A PILL. It was drawn in a bordered pill first and the screenshot at 320px is what ended it:
   beside the photo the right-hand column is 134px, "† DECEASED · 1942–2016" is wider than that, and
   a pill that wraps is a box with two lines of capitals in it. A label wraps like words do. The
   marks are characters for the same reason — they wrap with the words rather than sitting apart. */
```

### ---------- THE PHOTO

before `.boxer-pic`

```
/* ---------- THE PHOTO ------------------------------------------------------------------------------
   A FIXED 4:5 BOX, SO NOTHING JUMPS. The box is its own size before a byte of the picture arrives,
   and the ring placeholder fills it until then — so a slow photo is a ring that turns into a face,
   never a gap that turns into a picture and pushes the record down the screen. 4:5 because it is a
   portrait's shape: a Commons photograph of a fighter is head and shoulders in a tall frame.

   `cover`, AND AIMED A LITTLE HIGH, so a frame that is not quite 4:5 loses chest rather than
   forehead.

   THE STAGE LIGHT IS THE GOLD AT 16%, from the top — the one flourish on the card, behind the
   placeholder's initials, the name on the corner banner. IT IS SPENT ABOVE THE TOP ROPE (44% tall,
   gone by 30% of the frame, the fight card's square crop included): until 10 Oct's review it reached
   the fighter's head, and there it was a warm brown the deepest skin and black hair sank into. The
   ring draws the dark behind him itself (`bf-stage`, find.js), so this light can only ever be above.

   THE RING AND THE FIGHTER ARE DRESSED BELOW, after `.boxer-ini`, in colours of their own — they no
   longer share the splash's `--bx-mat` or its `.bx-*` rules. */
```

### THE FOOT OF A PHOTO SINKS INTO THE PAGE.

before `.boxer-pic:not(.is-none) .boxer-frame::after`

```
/* THE FOOT OF A PHOTO SINKS INTO THE PAGE. A hard bottom edge on a bright photograph against the
   black reads as a sticker; a short fade to the background at a third of its strength reads as a
   picture set into the card. Only over a photo — the ring placeholder has its own floor. */
```

### ---------- THE RING AND THE FIGHTER IN IT: THE CARD'S OWN DRAWING, IN ITS OWN COLOURS

before `.boxer-ring`

```
/* ---------- THE RING AND THE FIGHTER IN IT: THE CARD'S OWN DRAWING, IN ITS OWN COLOURS ----------------
   IT NO LONGER MIRRORS THE LOADING SCREEN. The ring and the gold fighter began as the "box" splash's,
   painted by that block's `.bx-*` rules with its `--bx-mat` shared between the two; the splash taught
   nothing and went on 10 Oct (docs/history/322), and the cards did not go blank with it. So every part here is a
   `.bf-*` under `.boxer-ring` and needs NOTHING from the splash's block: the same posts, ropes, pads,
   mat and apron in the same tokens, the mat named here as `--bf-mat`.

   THE FIGHTER'S COLOURS ARE HIS OWN, NAMED HERE AND NOWHERE ELSE — six skin tones, eight hair
   colours, seventeen trunk colours and the leopard's spot. They belong to this one drawing (a pair of
   maroon trunks is no other component's colour), so they are defined on `.boxer-ring`, the chess
   board's rule, rather than offered to the whole stylesheet from `:root`; and none is a paper colour.
   `boxerFigure_` (find.js) points each part at one through a custom property on the fighter's group —
   `--bf-skin: var(--bf-s4)` — and every rule below says what a part is when the property is not set.

   A PART NOBODY RECORDED CLAIMS NOTHING (the review of 10 Oct; find.js has the whole account). Until
   then a blank was the old stand-in's part — paper skin, grey or gold hair, gold or blue trunks with
   an ink waistband — and beside a described man every one of those read as a claim: a pale blond
   Cleveland Williams, a gold-and-white pair of trunks on 80 profiles that nobody had recorded. So:
     `--bf-ghost`         skin and hair of a fighter with no row: ONE shadow tone, a silhouette. It is
                          neither a skin nor a hair colour, and it clears 2:1 against the stage and
                          against the muted trunks it mostly stands in.
     `--bf-unsaid-l/-r`   trunks with no word on file: the corner's gold or blue MUTED to a dusky
                          ochre or slate that no trunks word uses (check/states.js holds each at
                          least 50 away, in RGB, from every `--bf-tk-*`; the vocabulary's gold and sky
                          are nowhere near), with a waistband one shade darker in the same colour and NO side
                          stripe — a waistband, not a trim. `--bf-corner` is the one the group's side
                          takes. Her top (`bf-top`) is the trunks' colour, so it follows them.

   THE SKIN TONES ARE SIX STEPS FROM LIGHT TO DEEP, chosen by eye to read as six on the black card and
   nothing more. EVERY COLOUR OF THE FIGURE CLEARS 2:1 AGAINST `--bf-stage`, the dark he stands in —
   check/states.js measures each skin, hair colour, trunks colour and fallback, in the colours a
   browser paints. Measured at 4x before 10 Oct's review, black hair (#2e2925) was 1.29:1 and black
   trunks (#2b2b30) 1.40:1: Tyson was a face and a pair of legs, Lennox Lewis's dreads a smudge. So
   BLACK, DARK BROWN, NAVY AND MAROON ARE LIFTED to just over 2:1, and the skins are NOT lightened —
   the deepest clears 2:1 because the stage light no longer reaches his head (see `.boxer-frame`).
   ON THE FACE, BLACK IS BLACK AGAIN (`--bf-fh-black`): a beard sits against skin, not the stage, and
   the lifted charcoal on the deepest skin was 1.07:1 — Joshua's beard was not there. The deep black
   clears 2:1 on every skin.

   `.bf-seen` IS A FIGHTER WE CAN DESCRIBE, and on him a hair colour nobody stated is his own skin
   mixed halfway to the black — a shape with no colour claimed. A beard with no colour on file is the
   same shadow. */
```

### THE CREDIT IS SMALL AND IT IS NEVER HIDDEN.

before `.boxer-credit`

```
/* THE CREDIT IS SMALL AND IT IS NEVER HIDDEN. The licence makes naming the author and the licence
   the condition of showing the picture at all, so it is in the faint ink at the caption size every
   other small print here uses — legible, not decorative — and nothing on the card covers it.
   `.62rem`, NOT THE `.56` IT WAS: measured, that was 8.3px on a 390px phone and about 6px on a
   320x568 one once the card had shrunk to fit — a credit nobody can read is a credit in name only.
   `.62` is the floor the record's labels and the tape's already stand on. */
```

### ---------- AND IT IS A LINK, SO IT IS A TAP TARGET

before `.boxer-src`

```
/* ---------- AND IT IS A LINK, SO IT IS A TAP TARGET -------------------------------------------------
   THE CREDIT LINKS TO THE PHOTO'S COMMONS PAGE (see `boxerCredit_`), and a link the size of
   `.62rem` small print is a 12px target — the thing `check/ui.js` exists to refuse. So the link is a
   block at least 44px tall, in px because a fingertip does not scale with the type, and the words
   keep their size, centred in it from top to bottom. On the profile it is the full-width line under
   the photo (see `boxerPic_`), two lines of words in a 44px row. Underlined in the line colour, so
   it reads as a link without shouting louder than the photo it credits. */
```

### THE RESULT IN WORDS, FOR A SCREEN READER ONLY — `#splash-say`'s pattern:

before `.boxer-say`

```
/* THE RESULT IN WORDS, FOR A SCREEN READER ONLY — `#splash-say`'s pattern: off the screen rather
   than hidden, because `display: none` would take it from the reader too. The row is its containing
   block, so the 1px box sits inside the row it belongs to rather than wherever an ancestor is. */
```

### ---------- THE RECORD: THE BIG NUMBERS

before `.boxer-rec`

```
/* ---------- THE RECORD: THE BIG NUMBERS -------------------------------------------------------------
   ONE BOX, THE ONLY BOXED THING ON THE CARD, because it is the one thing on it that is the answer.
   Every other part is a section with a label; this is the scoreboard. The faint gold wash at the top
   is the stage light again, at half the strength, so the box belongs to the photo above it.

   THE COLUMNS ARE EQUAL, HOWEVER MANY THERE ARE — three, or four with no contests — through
   `grid-auto-columns` rather than a count, so a fourth column needs no second rule. A hairline
   between them, which is how a scoreboard is ruled. */
```

### THE NUMBERS IN THE APP'S OWN MONO, BIG AND TABULAR, so 56 and 5 sit on the same baseline as the same kind of thing at the same width per digit.

before `.boxer-n b`

```
/* THE NUMBERS IN THE APP'S OWN MONO, BIG AND TABULAR, so 56 and 5 sit on the same baseline as the
   same kind of thing at the same width per digit. 2.4rem is 36px on a 390px phone: a scoreboard,
   not a headline, and three digits still fit a quarter of a 320px card. */
```

### A NOUGHT IS "NONE", AND NONE IS QUIET.

before `.boxer-tally .boxer-n.is-zero b`

```
/* A NOUGHT IS "NONE", AND NONE IS QUIET. Usyk's `0` under LOSSES in the loss colour shouted the one
   thing he has not got; in the faint ink it reads as what it is, and the gold beside it does the
   talking. The tally in front so it outranks the colour rules above by specificity rather than by
   coming after them — `check/cascade.js`'s rule. */
```

### ---------- THE TALE OF THE TAPE

before `.boxer-tape dl`

```
/* ---------- THE TALE OF THE TAPE ---------------------------------------------------------------------
   A LABEL AT THE LEFT AND ITS VALUE AT THE RIGHT, ONE HAIRLINE BETWEEN ROWS — the broadcast's
   graphic, laid flat for one fighter. The value wraps at the right rather than pushing the label:
   "17 Jan 1942 · Louisville, USA" is two lines on a 320px phone and that is fine.
   `.22rem` A ROW, NOT `.3`: on a 320x568 phone fifty profiles were drawn smaller to fit their pane,
   and the tape's seven rows are the longest run of the card; a hairline between rows is what keeps
   them apart, so the padding can be the smaller part of the gap without the rows running together. */
```

### ---------- THE BELTS AND THE HONOURS

before `.boxer-belt`

```
/* ---------- THE BELTS AND THE HONOURS ------------------------------------------------------------------
   THE TITLES ARE A SENTENCE WITH A GOLD RULE BESIDE IT — the rule `.prac-no` draws in red for a
   refusal, here in the colour of what he won. The honours are badges in the flag's own shape, gold
   because they are yes-or-no facts and the yes is the point. */
```

### THE HEADING AND THE BADGES SHARE ONE LINE — the label at the left, the honours pinned at the right (see `boxerTitles_`).

before `.boxer-titles-head`

```
/* THE HEADING AND THE BADGES SHARE ONE LINE — the label at the left, the honours pinned at the right
   (see `boxerTitles_`). It wraps rather than squeezes: two badges beside "Honours" on a 320px phone
   is wider than the card, and a badge on the next line is still a badge. The heading's own bottom
   margin moves to the row, so the belts sit the same distance under it either way. */
```

### ---------- WHO HE BEAT, WHO BEAT HIM

before `.boxer-vs`

```
/* ---------- WHO HE BEAT, WHO BEAT HIM ----------------------------------------------------------------
   A LABEL COLUMN AND A WRAPPING ROW OF NAMES, each name edged on the left in the result's colour —
   so the two rows are told apart at a glance and a long list folds rather than running off the card.
   `.boxer` in front of the list rules because `.fc-sec li` (0,1,1) would otherwise tie with them and
   the file's order would decide — the `.price.faint` fault `check/cascade.js` exists to catch. */
```

### ---------- HIS FIGHTS ON FILE

before `.boxer .boxer-bouts ul`

```
/* ---------- HIS FIGHTS ON FILE ---------------------------------------------------------------------
   THE RESULT IN A SQUARE, THE OPPONENT, AND HOW AND WHEN UNDER THE NAME — a printed record's line in
   two rows, because the record's single row is a table forty characters wide and a phone is not.
   A win is a filled gold square, a loss an outlined red one: filled against outlined survives a
   colour-blind reader and a screenshot in grey, where gold against red alone would not. */
```

### A TITLE FIGHT SAYS SO IN GOLD, after how and when it ended.

before `.boxer-tt`

```
/* A TITLE FIGHT SAYS SO IN GOLD, after how and when it ended. The belts' own words are its tooltip:
   "WBA, WBC, The Ring heavyweight" on every line of Ali's is a paragraph, and the fact a fan scans
   for is only whether the belt was on the line. NOT BOXED: it was a gold outlined tag first, and on
   Ali's page — fourteen title fights out of fourteen — the screenshot was a column of fourteen gold
   boxes louder than the results beside them. A word in the line's own size, the dot before it in
   the line's own ink. */
```

### ---------- THE FIGHT CARD'S TWO FACES

before `.fight-faces`

```
/* ---------- THE FIGHT CARD'S TWO FACES --------------------------------------------------------------
   THE SAME FRAME AS THE PROFILE'S, SQUARE AND SMALL, either side of a `v`, lifted over the title the
   way the profile's photo is. The winner's frame is ruled in gold — the same weight-not-label idea
   as his name in bold under it. A draw leaves both plain. */
```

### THE CREDITS FOR BOTH FACES, centred under them at the card's foot, at the profile's caption size.

before `.fight-credit`

```
/* THE CREDITS FOR BOTH FACES, centred under them at the card's foot, at the profile's caption
   size. Each is its own `.boxer-src` so a face that fails can take its own credit away and leave the
   other — and each is a 44px link block now (see `.boxer-src`), so two photos are two lines rather
   than one line joined by a dot: two tap targets cannot share one line of small print. */
```

### THE TWO NAMES ARE THE TITLE NOW — an `h3` in the shared head — so they take the title's size and lose the 1rem they set for themselves.

before `.fight-line`

```
/* THE TWO NAMES ARE THE TITLE NOW — an `h3` in the shared head — so they take the title's size and
   lose the 1rem they set for themselves. The row still wraps between the names rather than inside
   one, and the `v` keeps its small mono. */
```

### `.fight-how` AND `.fight-note` WERE HERE:

before `.btn-note`

```
/* `.fight-how` AND `.fight-note` WERE HERE: the method in gold capitals and the story in its own
   dim paragraph. They are the shared meta line and lede now — sentence case, like every other
   kind's — and "a note is a sentence somebody wrote, so it reads as prose" is what `.fc-lede` is. */
```

### THE PAPER PAGE WAS HERE — `.qpaper`, `.qp-head`, `.qp-sec`, `.qp-q`, `.qp-part`, `.qp-body`, `.qp-marks`, `.qp-end` and a print rule — about sixty lines that

before `.btn-note`

```
/* ==================================================================================================
   THE PAPER PAGE WAS HERE — `.qpaper`, `.qp-head`, `.qp-sec`, `.qp-q`, `.qp-part`, `.qp-body`,
   `.qp-marks`, `.qp-end` and a print rule — about sixty lines that typeset a whole past paper read
   end to end. `paperBody_` emitted it and nothing does now: the funnel lists questions, one card
   each, and `questionCard_` writes `.qcard` / `.qsheet` below. See the note above `questionItems`
   in find.js.

   TWO THINGS IN IT ARE WORTH NOT LOSING, because both were paid for in screenshots:

     `.screen h2` (0,1,1) BEAT `.qp-sec` (0,1,0) ON EVERY PROPERTY THEY SHARED. A paper's section
     heading rendered as the app's terminal rule — a border top as well as bottom, `display: flex;
     justify-content: space-between` and `::before { content: '> ' }` — so "Section A" came out as
     `>` at the far left and `SECTION A` at the far right, between two lines. `check-css` passed,
     because it looks for a property set twice in ONE rule and this was one rule beating another.
     A heading class that has to survive `.screen h2` needs two parts to its selector.

     AND A LONG SHEET THAT SIMPLY STOPS reads as the rest having failed to load, which is why there
     was an "END OF QUESTIONS" line. A card does not have that problem; a list of them might.
================================================================================================== */
```

### AND THE TEXT BLOCK IS 184mm EITHER WAY, because every slot is a fixed width now (see `.mat-cols`).

before `.mat-sheet`

```
/* AND THE TEXT BLOCK IS 184mm EITHER WAY, because every slot is a fixed width now (see `.mat-cols`).
   With the ruler off the 14mm it gives back is shared between the two sides rather than left as a
   wider right margin, so the page stays centred instead of leaning left. */
```

### ---------- GIVEN IN THE EXAM, SAID ON THE FEW ROWS IT IS TRUE OF

before `.mat-list label.given .mat-face`

```
/* ---------- GIVEN IN THE EXAM, SAID ON THE FEW ROWS IT IS TRUE OF -------------------------------
   THIS WAS A RED NAME ON EVERY PIECE THE EXAM DOES NOT PRINT, with a row of three pills above the
   list — All, Not given, Given — to say what the red meant. It was right that a warning should be in
   the warning colour; what it marked was the majority, twenty of twenty-five on GCSE Higher, so the
   page was mostly red and needed a key to read. The key was the pills, and the pills are gone —
   see `matChoices` in mat.js.

   SO THE MINORITY IS MARKED INSTEAD, IN WORDS. A piece the exam hands you carries a note saying so
   and recedes a step, because it is the one on the list least worth the paper; the box above the
   list takes those rows off it altogether. No colour to learn, and nothing to decode. */
```

### ---------- `display: block` ASKED FOR ITS OWN LINE AND A FLEX ROW DOES NOT GRANT ONE

before `.mat-note`

```
/* ---------- `display: block` ASKED FOR ITS OWN LINE AND A FLEX ROW DOES NOT GRANT ONE -------------
   THIS NOTE WAS BREAKING THE WORD NEXT TO IT. `.mat-list label` is a flex row, and a flex item's
   `display` is blockified — so `block` here bought nothing, the note sat on the SAME line as the
   face, and `margin-top: .1rem` nudged a thing that was never below anything.

   It is on two rows out of twenty-five, and they are the two that looked worst: the note took
   roughly a third of a 150px column away from the face beside it, leaving `|·| ruler` about 30px to
   fit in, so it wrapped as `|·|` / `rul` / `er`. A word broken mid-word, on exactly the rows
   carrying an explanation, because of a rule that was trying to put that explanation underneath.

   `flex-basis: 100%` IS THE FLEX SPELLING OF WHAT `display: block` MEANT. The row wraps, the note
   takes the line below, and the face gets the whole column width it was always supposed to have.

   FOUND BY LOOKING AT IT. check/ui.js reported nothing either way — the layout measured clean with
   the word broken, because a mid-word break is not an overflow. CLAUDE.md already says layout facts
   come from the browser; this is the other half of that, which is that "no measurement failed" and
   "it looks right" are different claims, and only one of them a screenshot can settle.

   AND THEN THE ROW BECAME A GRID — see `.mat-list label` — which gives the note a line of its own
   with `grid-column` and gives the tick a 44px line whatever is under it. The flex-basis went with
   the flex row it was written for; everything above is why the note is on a line of its own. */
```

### ---------- TILES: THE CONTROLS THAT USED TO BE IN A SHEET

before `.tile-row`

```
/* ---------- TILES: THE CONTROLS THAT USED TO BE IN A SHEET ---------------------------------------
   A STACK, NOT A GRID. Three across meant every button had to be argued into the same width — flex
   basis, placeholders standing in for actions that did not exist, glyphs picked for being one
   character wide. Full-width rows keep that promise for nothing: there is only one width and every
   row has it.

   KEY LEFT, VALUE RIGHT — the same shape as every other row on the card, so the actions read as
   part of it rather than as a control panel bolted underneath. */
```

### ---------- A ROW OF MARKS, NOT A STACK OF RECTANGLES

before `.tile-row`

```
/* ---------- A ROW OF MARKS, NOT A STACK OF RECTANGLES ---------------------------------------------
   THESE WERE FULL-WIDTH BUTTONS, one per line, each with a word in it. Four of them under a past
   paper was a control panel taller than the paper, and it sat ON the paper — `.paper` is a sheet of
   off-white exam stationery and the buttons were printed across the bottom of it.

   THE MARK IS THE BUTTON NOW. A row, not a column; no fill and no border, because a square of
   chrome around a symbol is the rectangle all over again. What makes it a button is that it is big
   enough to hit and it moves when you press it.

   44px, WHICH IS BIGGER THAN IT LOOKS. The mark is 18px and the target is 44 — the smallest thing
   a thumb finds reliably — so the space around each symbol is doing work even though it is
   invisible. Shrinking it to fit the drawing would make a row nobody can press accurately. */
```

### ---------- THE ADMIN MARKS SIT AT THE FAR END

before `.tile-group.is-admin`

```
/* ---------- THE ADMIN MARKS SIT AT THE FAR END ----------------------------------------------------
   THIS IS WHAT REPLACES THE SECOND ROW, and it does the job the second row was there for: keeping a
   bin away from a trolley. A bin BENEATH a trolley is a thumb's width away; a bin at the opposite
   end of the row is the width of the card away — and a thumb moving sideways is a deliberate
   movement in a way that a thumb moving down is not. */
```

### ---------- EVERY MARK ON A CARD IS THE SAME KIND OF OBJECT

before `.tile`

```
/* ---------- EVERY MARK ON A CARD IS THE SAME KIND OF OBJECT ---------------------------------------
   THERE WERE TWO SPECIES AND NO REASON FOR IT. The ordinary marks — star, HTML, Paper — were bare
   glyphs on `background: none; border: 0`. The admin marks were on tinted plates. Both are the same
   act: press a mark and something happens to this card. Drawing one as text and the other as a
   button said they were different sorts of thing, and the only real difference is who may press.

   SO EVERY TILE IS A PLATE and what varies is the colour — one idea instead of two. It also makes
   an unpressed star look like a control rather than like decoration, which is what it always was
   and never looked like. */
```

### ---------- THE MARK BESIDE THE WORD

before `.tile-i`

```
/* ---------- THE MARK BESIDE THE WORD ---------------------------------------------------------------
   FIRST IN THE ROW, so a column of tiles reads as a column of marks down the left edge and the eye
   finds "the trolley one" without reading four labels. That is the whole job — it is never the only
   thing on a tile, and `tile_` says at length why not.

   `currentColor` IS THE POINT. A gold buy tile, a silver admin tile and an ordinary one all colour
   their own mark, so nothing here needs a rule per tone and none of them can drift apart.

   `align-items` ON THE TILE IS `baseline`, which a graphic has none of — an SVG would hang off the
   bottom of the text it sits with. `align-self: center` opts this one child out of that, which is
   cheaper than changing the alignment the label and the number already rely on. */
```

### `.tile-v` WAS THE DETAIL BESIDE THE LABEL — "23 questions", "£0.46 · 23pp" — and there is no label any more, so nothing emits one.

before `.tile-none`

```
/* `.tile-v` WAS THE DETAIL BESIDE THE LABEL — "23 questions", "£0.46 · 23pp" — and there is no
   label any more, so nothing emits one. The detail lives in the button's title and aria-label now;
   see `tile_`. `.tile:active` and `.tile[disabled]` are stated with the rest of `.tile` above. */
```

### ---------- SEND IS A GOLD DISC, THE ANSWER BAR'S ONE ACTION

before `.tile.is-send`

```
/* ---------- SEND IS A GOLD DISC, THE ANSWER BAR'S ONE ACTION -------------------------------------------
   *"the answer box should look like a chatbox. with send tile."* (8 Oct.) `tone: 'send'` from `ansBox_`
   -- Send where the question has a scheme, Mark with AI where its answer is words. The one tile in the
   app that is FILLED rather than a plate with a mark on it, because it is the one a child has to find
   in glare: gold on the card is 11:1 where a plate's edge was 1.10:1. Round, as every phone draws send
   beside its message bar; 48px, a little over the floor, because it is the most-pressed control on the
   page. Its mark is ink on gold, drawn heavier than the 1.4 of a plate's. Tokens only (`check-css`
   refuses a `.tile` colour spelt out). */
```

### ---------- SILVER MEANS ONLY YOU CAN SEE THIS

before `.tile.is-admin`

```
/* ---------- SILVER MEANS ONLY YOU CAN SEE THIS ---------------------------------------------------
   NOT A HUE, ON PURPOSE. Green is a subject, purple a venue, pink a wearable, red a tutor — every
   colour in this palette names what a thing IS, and there were none left, because admin is not that
   kind of fact. It names who can SEE the control. A neutral says so without taking a fifth slot in
   a palette that was declared full at four.

   COOL, NOT GREY. `--dim` is #9a9a9a, so a neutral grey here would read as "switched off" — the one
   meaning it must never carry. The blue cast is what makes it look deliberate rather than faded. */
```

### ---------- AND IT IS YELLOW NOW, NOT SILVER

before `.tile.is-admin`

```
/* ---------- AND IT IS YELLOW NOW, NOT SILVER -----------------------------------------------------
   THE ARGUMENT ABOVE STILL HOLDS — admin is not a fact about what a thing is — but silver was
   chosen when these sat in a row of their own, where being quiet was affordable. In one row with
   everything else, quiet is indistinguishable from switched off, and these are the controls that
   change or destroy a row: they should catch the eye of the one person who can press them.

   NOT `--gold`, WHICH IS TAKEN. `--gold` is the buy action and the trolley on this very row is
   drawn in it, so reusing it would put the bin and the basket in one colour — the exact confusion
   the two-row layout existed to prevent. This is a cooler, brighter yellow: unmistakably yellow,
   and unmistakably not the trolley beside it. */
```

### THE TONE IS THE TOKEN, THINNED -- `color-mix` with `transparent` paints exactly what `rgb(242 210 75 / .07)` did, and names which colour it is.

before `.tile.is-admin`

```
/* THE TONE IS THE TOKEN, THINNED -- `color-mix` with `transparent` paints exactly what
   `rgb(242 210 75 / .07)` did, and names which colour it is. Written out by hand, these five were the
   pattern `.tile.is-lead` was copied from: it changed its `color` to `--gold` and kept this yellow in
   its border, so a gold padlock sat in an admin-yellow frame on a tile every student sees. A literal
   cannot say which token it meant, so nothing could tell. `check-css` now fails a `.tile` rule that
   writes a token's colour out by hand. */
```

### `.card .ticks` AND ITS TWO CHILDREN WERE HERE — the row that put the count in words at the left and the three boxes at the right, the same shape as a tile

before `.widget-slot:empty`

```
/* `.card .ticks` AND ITS TWO CHILDREN WERE HERE — the row that put the count in words at the left
   and the three boxes at the right, the same shape as a tile, which is why the two sat together
   without either being restyled. Gone with the boxes; see above. */
```

### ---------- WHAT THE CARDS NEEDED ONCE THEY STOPPED OPENING PANELS

before `.widget-slot:empty`

```
/* ---------- WHAT THE CARDS NEEDED ONCE THEY STOPPED OPENING PANELS -------------------------------
   `.pass-where` STOOD HERE — the place a tutor is, added when the cards stopped opening panels, and
   declared six hundred lines away from every other pass rule. Found only by deleting the pass, which
   is the argument for keeping a component's rules together: a stray that nothing else names survives
   exactly as long as nobody removes the thing it belonged to.
   `.prof-where` later went too, on request. */
```

### ---------- FILLED MEANS DONE

before `.tile.is-buy.on`

```
/* ---------- FILLED MEANS DONE --------------------------------------------------------------------
   THE STAR'S RULE, APPLIED TO EVERY TILE. `.favwrap.is-fav .star` fills and colours, and nothing
   else about the card moves — that is the whole interaction, and it is why the star has always felt
   right where a button that reloads the screen does not.

   A FILLED TILE IS PAST TENSE. "In your basket", "Wearing it", "Listed" — each is a statement about
   something that has already happened, so it stops asking to be pressed: quieter, not louder, and
   the fill is what carries it. Gold means "the one action" on this card and a done thing is not one.

   `[disabled]` IS NOT DIMMED WHEN IT IS FILLED, and that is deliberate. A dimmed tile reads as
   broken, and these are the opposite of broken. */
```

### ---------- AND THE MARK ITSELF FILLS, WHICH IS WHAT THE PARAGRAPH ABOVE PROMISED

before `.tile.on .tile-i-star, .tile.on .tile-i-wear, .tile.on .tile-i-spot`

```
/* ---------- AND THE MARK ITSELF FILLS, WHICH IS WHAT THE PARAGRAPH ABOVE PROMISED ----------------
   IT NAMED `.favwrap.is-fav .star` AND THAT RULE IS NOWHERE IN THIS FILE. Deleted at some point
   with the sentence left over it, so "filled means done" has been a description of nothing: a
   saved star was the same outline as an unsaved one and the only difference was a background at
   9% white, which on this ground is invisible. Reported from the Saved column — *"after i
   fabourite it the tile should be filled in"* — and true of every star in the app.

   THREE MARKS, NOT ALL OF THEM, and the names are why `tileIcon_` now writes one. A star, a jumper
   and a lamp are closed silhouettes and read as filled; the trolley is a body and two wheels drawn
   as open paths, so filling it paints a wedge between the handle and the basket. `.tile.is-buy.on`
   one line up already says "in your basket" by going quiet, which is the same statement in the
   register that mark can carry.

   THE STROKE STAYS. Fill alone loses the 1.4 of weight that makes these marks the same colour as
   the words beside them at 18px. */
```

### ---------- SECOND PASS, FROM LOOKING AT IT

before `.tile-row.is-admin`

```
/* ---------- SECOND PASS, FROM LOOKING AT IT -------------------------------------------------------
   THREE THINGS WERE WRONG AND THEY WERE ALL ONE THING: everything on the card had the same weight,
   so nothing had any.

   1. THE SILVER WAS NOT READING AS SILVER. #aab6c8 on near-black at 0.8rem is white — the whole
      "only you can see this" idea was invisible, which is worse than not having tried, because the
      admin rows then look like ordinary actions a client is failing to get a response from.

   2. THE ADMIN ROWS OUTNUMBER THE REAL ONES. Two ways in and three things only you can do means the
      card is mostly maintenance. Colour alone was never going to fix a majority.

   3. THE TICKS WERE THE LOUDEST THING ON IT. Gold filled squares above, and the paper copy — the
      one row that takes money — quiet underneath. Gold means "the one action" everywhere else in
      this app and it was being spent on a checkbox.

   SO SIZE CARRIES IT NOW, not hue. Admin rows are smaller, tighter and dimmer; they read as a
   footer to the card rather than as three more of the same. A glance sees two actions and a strip
   of small print, which is what the card actually is. */
```

### ---------- SILVER, AND SMALLER

before `.tile-row.is-admin`

```
/* ---------- SILVER, AND SMALLER --------------------------------------------------------------------
   ITS OWN ROW, UNDERNEATH. Silver means only an admin can see it, and the one arrangement that rule
   exists to prevent is a bin sitting in the same row as a trolley — one mis-tap from deleting a
   thing you meant to buy. A gap and a smaller mark say "different set" without a border. */
```

### ---------- THE BOOKER IS THE PAPER, AND NOTHING ELSE

before `.pane:has(> #bookr)`

```
/* ---------- THE BOOKER IS THE PAPER, AND NOTHING ELSE --------------------------------------------
   IT WAS AN `.rc` INSIDE A `.card` INSIDE A `.pane` — a receipt, in a panel, in glass. Three
   containers for one object, and only the innermost had anything to say: the receipt is torn at
   both ends and printed on its own colour, which makes it the most obviously bounded thing in the
   app. The two boxes round it were framing a photograph that came framed.

   SO THE PANE ON BOOK'S FIRST PAGE STOPS BEING A BOX. Visual only — it keeps its sizing, its
   containment and its `touch-action`, which are about being a page in the swipe grid rather than
   about how it is painted. The same move the Find controls page needed, for the opposite reason:
   that one holds several widgets and had to stop being one box so each could be its own; this one
   holds a single widget that already is one.

   `.bookr` HAS NO EDGES OF ITS OWN. It exists to be found by `redrawBooker_`, which restores the
   scroll position across a redraw, and to keep the note box and the send buttons with the paper
   they belong to. */
```

### ---------- THE BOOKER'S PAGE, WHEREVER IT SITS

before `.pane:has(> #bookr)`

```
/* ---------- THE BOOKER'S PAGE, WHEREVER IT SITS ----------------------------------------------------
   `#s-book` WAS ITS OWN COLUMN. The booker is a page on Find now, behind "What for · Booking", so
   the rule targets the paper rather than a screen id — `.pane:has(> #bookr)` is "whichever page is
   holding the booker", which survives the page moving again.

   The receipt is already a box: torn at both ends, printed on its own colour. A pane behind it was
   a glass panel wrapped round a piece of paper. Visual only — the pane keeps its sizing, its
   containment and its `touch-action`, which are about being a page in the swipe grid. */
```

### ---------- WHAT YOU DO WITH THE BOOKING, PRINTED ON IT

before `.rc-do`

```
/* ---------- WHAT YOU DO WITH THE BOOKING, PRINTED ON IT ---------------------------------------------
   These were markup after the receipt. The page they sat on has a transparent pane — the paper is
   the box — so they floated on black under a card they obviously belonged to, with a gap between
   that read as a bug rather than as spacing. They are inside the document now, above the barcode,
   where a till roll puts its total and its terms.

   RULED OFF ABOVE, because they are not another row of the booking — everything above is what was
   asked for and everything here is what to do about it. */
```

### `.rc-do` WAS THE FULL-WIDTH GOLD BAR.

before `.rc-do`

```
/* `.rc-do` WAS THE FULL-WIDTH GOLD BAR. Sending is a tile in the row beside sharing now — see the
   note in `drawBooker_`. The basket still uses this class for its Pay button, which names a price
   and is the one place a bar is right: there is no receipt under it, only a total. */
```

### NOT CENTRED AND NOT RULED OFF ANY MORE.

before `.rc-tiles`

```
/* NOT CENTRED AND NOT RULED OFF ANY MORE. *"The booking thing has tiles which are floating below it.
   This isn't consistent with other stuff on site"* — every other card ends in a plain `.tile-row`
   at its left edge; this one centred two tiles in a band of their own under a rule, which read as
   a separate panel hanging off the receipt. The row's own gap and margin, like the rest. */
```

### ---------- 40px, IN px, ON THE TWO CONTROLS THE WHOLE CARD EXISTS TO REACH

before `.rc-tiles .tile`

```
/* ---------- 40px, IN px, ON THE TWO CONTROLS THE WHOLE CARD EXISTS TO REACH ----------------------
   "Ask for it" and "Share this booking" were 40x40 at every width. CLAUDE.md's own rule is that tap
   targets go in px precisely so they cannot come out under 44 by accident — and these were in px
   and under 44 on purpose, shrunk to sit politely on a receipt.

   THE RECEIPT IS NOT THERE ANY MORE and it was never a good enough reason: sending a booking is the
   one irreversible thing on this card. 44px, which is the floor, and the row has the height. */
```

### THE TERMS. This was `var(--paper-dim)` with a note saying `.faint` is a dark-theme grey and the terms sit on off-white — which was true of the paper and is the

before `.rc-terms`

```
/* THE TERMS. This was `var(--paper-dim)` with a note saying `.faint` is a dark-theme grey and the
   terms sit on off-white — which was true of the paper and is the whole reason the paper had to
   go: every quiet line in this document needed its own grey picked by hand against cream, and the
   app already had one. It is `.faint` now, the same quiet as every other small print on the site. */
```

### ---------- A BASKET LINE IS A NAME, THEN ONE STRIP OF CONTROLS

before `.bk-row.is-wide > .bk-v`

```
/* ---------- A BASKET LINE IS A NAME, THEN ONE STRIP OF CONTROLS -------------------------------------
   THE ✕ WRAPPED ONTO A LINE OF ITS OWN. The name, the page count, the laminate switch and the ✕
   were four inline things wrapping wherever the width ran out, and two of them are 44px targets —
   so a paper was three lines and 115px tall at 390, with the ✕ alone on the last. The name is a line
   and the strip is the next, wrapping as a unit; the ✕ goes to the strip's far end, beside the
   price it takes away. `min-width: 0` so a long library-wide name wraps inside its column rather
   than pushing the total off the card, which is the fault this document was adopted to fix. */
```

### ---------- AND NOW THE NAME RUNS ON A LEADER TO ITS PRICE, AND THE STRIP IS ONLY THERE WHEN USED --

before `.bk-row.is-wide > .bk-v`

```
/* ---------- AND NOW THE NAME RUNS ON A LEADER TO ITS PRICE, AND THE STRIP IS ONLY THERE WHEN USED --
   ASKED FOR AS *"refine basket to look nicer."* Two faults measured at 390 with a mixed basket. The
   dashed rule under the name was `.bk-v`'s own bottom border, so it stopped where the value column
   stopped — three quarters of the way across, with the price past its end — and the row's solid
   `bk-end` rule ran under it, two lines a line. And a shop line, with no switch to hold, still drew
   the strip, so its ✕ sat alone on a second row: 72px a line for a one-word name.

   `display: contents` ON THE VALUE CELL hands its three parts to the row's own two columns (the card
   is `minmax(0, 1fr) max-content` — see `.bk:has(> .is-wide)`): the name line in the first, the price
   in the second on the same line, and the strip, when there is one, across both. So the leader is a
   dotted line from the end of the name to the price, the ✕ ends it beside the figure, and a strip's
   ✕ lines up under the price instead of under nothing. The row's own rule stays the only rule. */
```

### THE LEADER IS AN EMPTY BOX WITH A BOTTOM BORDER, and an empty flex item's baseline is its bottom edge — so on a baseline row its dots sit on the text's

before `.bk-row.is-wide .cart-lead`

```
/* THE LEADER IS AN EMPTY BOX WITH A BOTTOM BORDER, and an empty flex item's baseline is its bottom
   edge — so on a baseline row its dots sit on the text's baseline without any arithmetic. A floor of
   a rem so a name that fills the line still points at its price. */
```

### DOCUMENTS — the agreements and policies, read in a sheet.

before `.doc`

```
/* ==================================================================================================
   DOCUMENTS — the agreements and policies, read in a sheet. See terms.js.
   THE PROSE IS THE ONLY THING HERE. A contract sets its own rhythm with headings and paragraphs, so
   what it needs is measure and spacing, not decoration — a policy that looks designed reads as
   marketing, and this is the one screen where somebody has to believe every word was meant.
================================================================================================== */
```

### AN ANSWER IS A THING YOU PRESS.

before `.row.tap.counted`

```
/* ==================================================================================================
   AN ANSWER IS A THING YOU PRESS.

   `.row.tap.counted` — the answers under a funnel question — drew as text on a line with a number
   at the end and a hairline under it, which is the same thing `.row` draws for `Credits · 40` on a
   receipt. One is a fact and the other is the only control on the screen, and they looked identical.
   Nothing said the label was pressable except that it happened to be.

   THE CHEVRON CANNOT DO IT. `.row.tap` pins one to the right edge, and so does the count — so it
   was turned off for counted rows (see above) and there has been no press affordance since. The
   count is the better mark for what is BEHIND a row; it says nothing about whether it is a control.

   SO THE ROW BECOMES A SURFACE. A background, a border and a radius are what everything else in
   this app already uses to say "this is a thing" — `.card`, `.chip`, `.btn`. Reusing them costs no
   new idea and no new colour, and an answer now reads as the same class of object as the chips
   above it, which is what it is.
================================================================================================== */
```

### ---------- THEY WERE SURFACES ALREADY, AND NOBODY COULD TELL

before `.row.tap.counted`

```
/* ---------- THEY WERE SURFACES ALREADY, AND NOBODY COULD TELL -----------------------------------
   A 2.2%-WHITE FILL ON A `--line-soft` HAIRLINE IS A SURFACE ON PAPER AND A ROW ON A PHONE. The
   rules below already said card — background, border, radius — at strengths so low that in daylight
   the whole question read as one panel with lines in it. "Tools" and "Games" are two different
   errands and two different screens, and they looked like two rows of a table.

   NOTHING ABOUT THE STRUCTURE CHANGES HERE. They were always separate elements; they now look it.
   The fill moves to `--raised`, which is the token this app already uses for a thing sitting on the
   page, and the border to `--line`, which is the one that is meant to be seen. Same two tokens the
   cards below the question use, so an answer and a result read as the same class of object.

   44px MINIMUM, in px and not rem — a fingertip does not scale with the viewport, and the root here
   is `clamp(13.5px, 3.8vw, 16px)` so `2.75rem` comes out at 40.75. Measured, not assumed: these
   were 33px tall. */
```

### ---------- AND NOW THE ROW IS A CHIP, ONE OF SEVERAL ON A LINE

in `.row.tap.counted`

```
/* ---------- AND NOW THE ROW IS A CHIP, ONE OF SEVERAL ON A LINE ---------------------------------
     REPORTED AS "turn the finder options to look more like the google chips tags … they dont need to
     appear one above the other but can fill like from left to right top to down like writing a
     paragraph." Measured before: seven answers stacked at 44px plus a gap each were 308px of a
     575px question card at 390, to show seven words.

     A CHIP IS AS WIDE AS ITS WORDS and `.answers` wraps them like text, so a column of one-word
     answers (Summer, Autumn, Higher, Foundation) is one or two lines rather than one per answer.
     An outline and no fill at rest, a light fill under a finger — Google's own filter chip. The
     radius is half the height, so a one-line chip is a pill; a long answer ("Angles in Triangles &
     Quadrilaterals") still wraps INSIDE its chip at `max-width: 100%`, and with that radius a
     two-line chip stays a rounded box rather than a lozenge.

     44px STAYS, in px, AND IN BOTH DIRECTIONS. "As wide as its words" has a floor the words do not
     set: the letter ranges the funnel groups a long list into are often ONE letter (`G`, `P`, `S`),
     and a one-letter chip measured 34x44 — under the floor sideways, on the narrowest answers on the
     screen. `min-width` keeps it a fingertip wide and `justify-content` keeps the letter in the
     middle of the circle it then makes. A fingertip is the same size whatever the shape. */
```

### ---------- 32px TALL NOW, AND THE FINGER STILL GETS ITS 44

in `.row.tap.counted`

```
/* ---------- 32px TALL NOW, AND THE FINGER STILL GETS ITS 44 ----------------------------------
     THE OWNER, 6 Oct: *"Make the tags smaller because this will help to make sure more fit in even
     when there's lots of names for the user to parse through."* The funnel draws a whole list now
     rather than letter ranges of it (see `bucketLabels_`), so a question can hold thirty answers
     where it held seven buckets, and 44px pills put a third of them below the card. 32px is what a
     chip is in every filter row people already know. THE REACH IS KEPT, the way `.qw` keeps a
     word's: the `::before` below adds 6px above and below, so the hit area is 44px tall while the
     drawn chip is 32 -- and `min-width` keeps a one-word answer a fingertip wide. */
```

### THE BOX THE CHIPS WRAP IN.

before `.answers, .tag-answers, .chips, .qtags, .reacts, .rx-head`

```
/* THE BOX THE CHIPS WRAP IN. `--chip-line` is declared HERE rather than at `:root` because it is this
   family's own outline and nothing else should be offered it — the house rule the chess board's
   cream and charcoal set. `--line` is a hairline between rows, and as the only edge of a chip on
   black it measured as nearly nothing; this is the step a reader can see without it competing with
   the words. The card's TAGS are the third member: a tag with no kind keeps this outline, so it is
   offered to `.qtags` too rather than written out there as `#3d3d3d` a second time.
   A POST'S REACTIONS ARE THE FOURTH, and the sheet's heading pill for each face with them: the faces
   are pills in this family's shape since the owner's *"Looks abit scuffed"* (9 Oct), and the outline
   that made a chip visible on black is the one their old `--line-soft` boxes were missing. */
```

### ---------- AND IT IS THE ONLY THING ON THE ROW NOW, SO IT MAY USE THE ROW

before `.row.tap.counted::before`

```
/* ---------- AND IT IS THE ONLY THING ON THE ROW NOW, SO IT MAY USE THE ROW -----------------------
   `.row .k` IS `flex: 0 0 auto` AND THAT WAS RIGHT WHEN IT WAS A LABEL. "Credits", "You have",
   "Where" — two words beside a value, and a label that shrinks away from its own number is worse
   than one that does not. The note a few thousand lines up adds `min-width: 0` for the basket,
   where the title went in the `k` slot; `min-width: 0` lets a flex child give way and `flex-shrink:
   0` then refuses to, so it only ever helped the case that also overflowed.

   TAKING THE COUNT OFF THE ANSWER ROWS MADE THIS VISIBLE. There is no `.v` beside it any more, so
   the row holds one child and that child is the answer — "Angles in Triangles & Quadrilaterals" ran
   past the card and was CLIPPED, not wrapped, with nothing reporting it: the pane hides its
   overflow, so no box scrolled sideways and `check/ui.js` measures exactly that. The measurement
   was green and the layout was wrong, which this repository has now written down three times.

   `flex: 1 1 auto` — take the room, and give way when there is not enough, at which point the
   `overflow-wrap` it already carries does the rest. */
```

### A CHIP'S WORDS ARE ITS WHOLE WIDTH now, so they take what they need and give way only when the chip is already the width of the card — `0 1 auto` rather than

before `.row.tap.counted::before`

```
/* A CHIP'S WORDS ARE ITS WHOLE WIDTH now, so they take what they need and give way only when the chip
   is already the width of the card — `0 1 auto` rather than the `1 1 auto` a row needed to fill its
   line. 500 rather than 600: seven bold words side by side is a wall, seven medium ones a list. */
```

### ---------- AND `.is-pressed` IS THE SAME STATE, HELD LONG ENOUGH TO BE SEEN

before `.row.tap.counted:active, .row.tap.counted.is-pressed`

```
/* ---------- AND `.is-pressed` IS THE SAME STATE, HELD LONG ENOUGH TO BE SEEN --------------------
   `:active` ENDS WHEN THE FINGER LIFTS and the funnel's answer takes 130 ms to arrive at 8x CPU —
   so a tap was a flash, an eighth of a second of an unchanged screen, and then the answer. Worse on
   the platform that cannot be tested from here: `:active` on touch is a browser heuristic, and
   Safari has wanted a touch listener on the element itself where every listener this app has is on
   the window. `pressMark_` in shell.js puts the class on at `pointerdown` and takes it off two
   frames after the handler ran.

   IT IS ADDED TO THE `:active` RULES RATHER THAN GIVEN ITS OWN, here and on the nine other press
   states in this file. Two descriptions of one look is the `.reel .over` fault, and these two would
   sit on the same element a tenth of a second apart — which is the version somebody notices. */
```

### ---------- "DOESN'T MATTER" IS A WAY OUT, NOT AN ANSWER

before `.row.tap.counted[data-tag]:not(:active):not(.is-pressed)`

```
/* ---------- "DOESN'T MATTER" IS A WAY OUT, NOT AN ANSWER ------------------------------------------
   IT IS THE SAME OBJECT AS AN ANSWER AND IT MUST NOT READ AS ONE. Everything the class above gives
   it is wanted — 44px, the radius, the press that moves a pixel — and the FILL is the one thing
   that is not: a filled row in a column of filled rows is a sixth answer, and the last one, which
   is where the eye stops. Taking the background off and leaving the border leaves it plainly
   pressable and plainly not one of the choices.

   NO NEW COLOUR. `--dim` is the token an unemphasised label already uses on every `.row` in the
   app; this is the answer row handing back the foreground colour the block above gave it. */
```

### AN ANSWER OF A KIND IS OUTLINED AND LETTERED IN ITS COLOUR, and pressing it makes a chip of the same colour -- so `Paper 1` is red on the menu, red as a chip

before `.row.tap.counted[data-tag]:not(:active):not(.is-pressed)`

```
/* AN ANSWER OF A KIND IS OUTLINED AND LETTERED IN ITS COLOUR, and pressing it makes a chip of the
   same colour -- so `Paper 1` is red on the menu, red as a chip and red on the card. Unfilled, as
   every answer is: the colour says what kind of answer, the fill would say it was already chosen.
   NOT WHILE IT IS PRESSED. The two rules are equally specific, so this one, coming later, won the
   border off the press and every tagged answer -- which is nearly every answer below the two doors
   -- lost the gold edge the press block exists to show. Said by `:not` rather than by moving the
   line above the press block: order alone deciding it is what broke it, and `check/cascade.js`
   reports exactly that kind of win. */
```

### ---------- A NUMBERED RUN IS A GRID, NOT A PARAGRAPH OF PILLS

before `.answers.is-grid`

```
/* ---------- A NUMBERED RUN IS A GRID, NOT A PARAGRAPH OF PILLS ----------------------------------------
   `grid: true` ON A FACET (the Bible's Chapter and Verse, in find.js): 150 chapters of Psalms drawn as
   chips are pills of one, two and three digits wrapping like words, so `9` and `10` never sit in the
   same column and a thumb looking for 119 reads the lot. In a grid the numbers stand in columns —
   five at 320px, six at 390 — the way a printed Bible's chapter index is set, and the eye goes down a
   column by tens.
   THE SAME CHIP, NOT A NEW CONTROL: 32px drawn and the 6px `::before` reach above and below, so 44px
   to a finger — the owner's 6 Oct "make the tags smaller" — and `minmax(44px, …)` keeps every cell a
   fingertip wide. Squarer corners, because a cell in a grid is a square and a pill in a grid is a
   row of lozenges. The digits in the mono face with tabular figures, so 111 and 118 are the same
   width and line up. A grid taller than the pane is drawn smaller by `paneReach_` and then scrolls,
   as every card does: 176 cells at 44px are more area than a 320x568 pane has, and no layout changes
   that. "Doesn't matter" keeps its pill and takes a row of its own. */
```

### REELS — one reel per widget, one widget per page

before `.reel`

```
/* ==================================================================================================
   REELS — one reel per widget, one widget per page

   THE COLUMN'S OWN SCROLLER IS GONE AND THE APP'S PAGER DOES IT. `.reels` was a box inside a card
   with `height: min(62svh, 30rem)`, `overflow-y: scroll`, `scroll-snap-type: y mandatory` and
   `touch-action: pan-y` — a second implementation of the vertical movement every other column in
   this app already has, sitting inside a pane whose `touch-action: none` had to be undone for it.
   Reported as "multiple widgets for each reel. One widget per reel", and that is what it is now:
   `pages('reel', …)` gives each clip its own page, its own pane and its own `.card.is-widget`, the
   same shape `widgetColumn_` builds for every tool and every game.

   WHAT IS LEFT HERE IS THE FRAME, and the height is the load-bearing half of it. `.feed-art` is
   `position: absolute; inset: 0`, so the box around it has to state a height or there is nothing
   for `inset: 0` to resolve against — which is the circularity this stylesheet already recorded
   under `.page.reel-page`, where a scroller asked for `height: 100%` of a page that had none. The
   number is the one the scroller used to carry: tall enough that one clip fills the screen, short
   enough that the pane does not push the column past it.
================================================================================================== */
```

### ---------- AND ON A LAPTOP IT WAS A SMALL BOX PINNED TO THE TOP OF THE SCREEN

in `.reel`

```
/* ---------- AND ON A LAPTOP IT WAS A SMALL BOX PINNED TO THE TOP OF THE SCREEN ---------------
     REPORTED AS *"fix how the reels appear at the top of screen on my pc."* Measured at 1440x900,
     signed in: the column's card began at y39 and ended at y555, so a 900px screen was showing a
     502px card and 345px of nothing under it. The card is placed correctly — every column starts
     on that same line, which is what `COLUMNS OUT OF LINE` exists to keep true — so what was wrong
     is that the CARD was short, and it was short because of the number below.

     `30rem` IS 480px WHEREVER THE ROOT IS 16px, which is every screen wider than about 420. So the
     rem cap, not the viewport term, decided the height on every laptop — and a column whose whole
     content is a video showed a third of the screen and stopped.

     BOTH TERMS MOVED AND THE `min()` IS THE POINT. 78svh fills a tall window; 40rem stops the box
     growing past a shape a reel is still a reel in. Measured after: 640px at 900 tall, 592 at 844,
     443 at 568 — bigger on a phone too, and inside `.pane`'s own cap at all three, which is the
     number that must not be crossed (see OUT OF REACH).

     IT IS NOT TALLER STILL, AND THE CLIPS ARE WHY. `.feed-vid` is `object-fit: cover`, and both
     clips in the column are 576x576 — square. A 9:16 box would be the right shape for a reel shot
     as one and would crop half the picture off these. */
```

### ---------- A SLIDE IS THE "ONE MORE THING" CARD, AND THESE RULES WENT WITH IT

before `.reel > .feed-art`

```
/* ---------- A SLIDE IS THE "ONE MORE THING" CARD, AND THESE RULES WENT WITH IT --------------------
   `.reel-art`, `.reel .over`, `.reel .credit` WERE A SECOND DESCRIPTION OF `.feed-art`. The same
   object — a heading, a subject, a paragraph and a credit over a picture — written twice in one
   stylesheet, with its own gradient, its own scrim and its own type sizes, drifting from the other
   copy every time either was touched. This repository's oldest shape, and here it was visible:
   the two surfaces showing one fact did not look alike.

   `feedSlide` draws both now, so what is left here is the FRAME and nothing about what a slide
   contains. `--h` went with the markup: `feedColours` picks a slide's gradient from its subject,
   which is a fact about the fact rather than about its position in a list. */
```

### ---------- A CLIP

before `.feed-vid`

```
/* ---------- A CLIP ------------------------------------------------------------------------------
   THE VIDEO IS THE PICTURE. It sits where `background-image` sits on a photograph slide, fills the
   frame the same way `background-size: cover` does, and everything over it — the scrim, the words,
   the credit — is the photograph slide's own furniture, unchanged.

   THE THREE LAYERS ARE NUMBERED RATHER THAN LEFT TO DOM ORDER. `::before` is the first child in the
   box tree and `<video>` is a real element after it, so without a stated order the video paints
   over the scrim that exists to make the words readable — white text on a moving picture, which is
   legible until the picture is a white wall. Paint order by accident is the fault CLAUDE.md records
   under `.price.faint`: it reads as a decision and behaves as nothing. */
```

### TRANSPARENT, NOT BLACK, AND A SCREENSHOT IS WHAT SETTLED IT.

before `.feed-vid`

```
/* TRANSPARENT, NOT BLACK, AND A SCREENSHOT IS WHAT SETTLED IT. Painted black the element covers
   `.feed-art`'s gradient from the first frame of the page, so a clip that has not loaded — or one
   whose address the browser will not follow — is a black rectangle where every other slide is a
   finished thing. That is the fault the gradient exists to prevent, written one rule along: "fifty-
   eight slides that each flash grey first is a column that looks broken while it works." */
```

### AND NOTHING PAINTS THE CLIP'S SLIDE BLACK ANY MORE.

before `.feed-art.is-clip::before`

```
/* AND NOTHING PAINTS THE CLIP'S SLIDE BLACK ANY MORE. The film's mask let whatever was behind the
   clip show through, so `.reel > .feed-art.is-clip.has-photo` was painted black for it — at the cost
   of a black slide before the poster landed and for good when one 404'd. The film is gone and that
   rule went with it, so a clip waits on its subject gradient again, as the note above wants. */
```

### ---------- A YOUTUBE SHORT

before `.feed-poster`

```
/* ---------- A YOUTUBE SHORT ---------------------------------------------------------------------
   FOUR LAYERS IN THE PLACE ONE `<video>` HOLDS, numbered for the reason the three above are:

     .feed-poster    the Short's own thumbnail, filling the frame as the mp4 reels' posters do
     .feed-yt        the player's place — empty until `reelYtPlay_` (posts.js) builds one
       iframe        YouTube's player, INVISIBLE until it says it is playing (`is-live`), so its black
                     box, spinner, title, pause screen and error screen are never on the slide
       .feed-yt-veil a clear layer over it that takes every touch for the column (see posts.js)

   COVER, BY ARITHMETIC. An `<iframe>` has no `object-fit`, and YouTube's player inside it letterboxes
   — so the frame is made the size that a 9:16 picture needs to COVER the slide and the slide crops it,
   which is what `object-fit: cover` does for the videos. The slide is not 9:16: at 390x844 it is
   272x593, narrower, so the Short is cropped about 31px each side. Sized in the box's own `cq`
   units, which is why `.feed-yt` is a size container; a browser without them gets the frame the size
   of the slide, letterboxed, which is the worst case and still a picture. */
```

### ---------- AND WHEN IT CANNOT PLAY: THE POSTER, AND ONE WAY OUT

before `.feed-yt-out`

```
/* ---------- AND WHEN IT CANNOT PLAY: THE POSTER, AND ONE WAY OUT ------------------------------------
   Drawn from the first paint and shown only on `is-dead`, so nothing moves when it appears. In the
   middle, where the ▶ would be — a dead Short cannot be held, so that place is free — and in the
   same charcoal wash as the Sound tile, which is what a control over a picture looks like
   everywhere this feature draws one. In px, the house rule for anything a finger aims at. */
```

### ---------- A STOPPED REEL SAYS SO

before `.reel.is-held::after`

```
/* ---------- A STOPPED REEL SAYS SO ----------------------------------------------------------------
   A VIDEO THAT IS PAUSED ON ITS FIRST FRAME LOOKS EXACTLY LIKE ONE THAT IS PLAYING A STILL SHOT,
   and the tap that stopped it left nothing on the screen to say it had worked. That is the sentence
   this stylesheet already carries about the pen's gold frame: a mode you cannot see is a mode that
   surprises you.

   OVER THE MIDDLE, WHERE THE FINGER JUST WAS, and `pointer-events: none` so the mark is not a
   second thing to hit — the whole slide is the control and the mark is only the state. The disc is
   the same charcoal wash the scrim uses rather than a new colour, so it reads on a bright frame and
   on a dark one. */
```

### ---------- THE SOUND IS A TILE, AND THIS RULE ONLY SAYS WHERE IT SITS

before `.reel-sound`

```
/* ---------- THE SOUND IS A TILE, AND THIS RULE ONLY SAYS WHERE IT SITS -----------------------------
   THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* It was a
   `.btn tiny` with "Sound off" in it; it is `tile_()` now (`reelSoundTile_`, posts.js), so its size,
   its 44px target, its press and its mark come from `.tile` like every other action in the app, and
   what is left here is the place. The plate it wears over the picture is `.tile.is-over`, below.

   TOP-RIGHT, WHERE THE BUTTON SAT, because the words are bottom-left and a control over what somebody
   is reading is a control they hit by accident — and the ▶ of a held reel and a dead Short's door
   are both in the middle, so the corner is the one place on the slide nothing else is drawn. The
   44px is `.tile`'s, in px, the house rule for anything a finger aims at: `2.75rem` is 40.75px on a
   phone, and CLAUDE.md has four convictions behind that sentence.

   WHAT THE BUTTON TAUGHT AND THE TILE KEEPS: `.btn` was gold and full-width, so absolutely placed it
   was a gold slab across the top of the clip, the loudest thing on a card whose whole content is
   the picture — "the `.reel-sound` correction", which four notes in this file and two in posts.js
   (the shelf's Add another, `.btn-row .btn`, `.mz-key`, the Messages column) still cite by this name.
   A tile is neither gold nor full-width, so the two overrides that answered it (`width: auto`, the
   wash on `.btn`) went with the button.

   THE WORD GOES INTO THE NAME, as on every tile. The old note here kept the word on the button
   because "a crossed-out speaker can be read as press to turn the sound off". The tile answers that
   by drawing the STATE as the word did — waves while it plays aloud, the slash while it is silent,
   which is what every phone's video player puts over a muted clip — and the word is still there in
   `aria-label` and `title`, with `aria-pressed` beside it. */
```

### ---------- A TILE ON A PICTURE WEARS THE PICTURE'S WASH

before `.tile.is-over`

```
/* ---------- A TILE ON A PICTURE WEARS THE PICTURE'S WASH ---------------------------------------------
   EVERY OTHER TILE'S PLATE IS 3% WHITE ON THE APP'S BLACK, and that is right on a card: the mark is
   the button and the plate only says where it ends. Laid over a clip it is nothing — on a white wall
   the mark is `--dim` grey on white and the edge is invisible. So `tone: 'over'` (`tile_` writes
   `is-over`) gives it the wash the ▶ and the Short's door already wear over the same picture:
   `--over-wash` under white ink with the hairline edge, which reads on a bright frame and a dark one
   alike. Tokens only, the three named at `:root` for exactly this — no fourth copy of the charcoal.

   PRESSED, THE EDGE GOES WHITE rather than the plate going lighter, because the plate lighter is
   the wash thinning over a bright picture — the one moment the mark must not fade is the moment
   somebody's thumb is on it. `.tile`'s own scale does the rest. */
```

### THE SEARCH BOX, AND A RESULT A SEARCH ENGINE'S RESULT IS THREE LINES AND NO SURFACE:

before `.search`

```
/* ==================================================================================================
   THE SEARCH BOX, AND A RESULT

   A SEARCH ENGINE'S RESULT IS THREE LINES AND NO SURFACE: where it came from, what it is called,
   and enough of it to judge. Everything a card would add — a border, a fill, a corner — is a frame
   around something that is already legible, and down a list of twenty, twenty frames are twenty
   things between the eye and the answer.

   THE BREADCRUMB GOES ABOVE THE TITLE, which is the one structural thing a search result does that
   almost nothing else does. Scanning a list, the eye lands on the same spot in every row, and what
   it should meet FIRST is what kind of thing this is — so a row can be ruled out without reading
   its name. Half of searching is ruling things out.
================================================================================================== */
```

### ---------- THE BOX

before `.search`

```
/* ---------- THE BOX ------------------------------------------------------------------------------
   A PILL, because a rounded field reads as somewhere to type in a way a rectangle does not — it is
   the one control on the screen that should look like an invitation rather than a slot.

   It is the only place in this app with a radius this large, and that is the point: nothing else
   should look like it. */
```

### ---------- THE BOX AND THE BIN, ONE ROW

before `.find-search`

```
/* ---------- THE BOX AND THE BIN, ONE ROW ----------------------------------------------------------
   Find's search box with Clear beside it — `filterClear_` in find.js says why Clear is a tile here
   and not a chip in the row below. The box takes what the tile leaves (`min-width: 0`, or a flex
   item will not shrink below its own placeholder), and the row carries the gap under it that the box
   carried alone. The tile is the tile renderer's own 44px plate and this rule says no size of its
   own; when a long answer list zooms the whole question card to fit (`paneReach_`), it shrinks with
   the box beside it, as every control on that card does — measured 31px at 390x844 six answers in,
   the trade `check/ui.js` records under its zoom line. `:empty` because before the first answer the
   slot holds nothing, and a gap beside nothing would push the box in from the edge for no reason.
   BOTH FINDERS' SLOTS — Find's `#stuff-clear` and the second finder's `#res-clear` (docs/history/329):
   one draw writes both, under the finder's own id. */
```

### ---------- THE BREADCRUMB

before `.card .crumb`

```
/* ---------- THE BREADCRUMB -----------------------------------------------------------------------
   SMALL, QUIET, AND MONOSPACED, because it is a path rather than a sentence: 1stclassmaths · KS2 ·
   Year 4. Middots and not commas — a comma joins things of one kind, a middot steps through levels. */
```

### ---------- A BUNDLE: THE PAPERS ON THE SCREEN, LISTED

before `.card.bundle .bundle-list`

```
/* ---------- A BUNDLE: THE PAPERS ON THE SCREEN, LISTED -------------------------------------------
   NUMBERED, because a bundle is read as "how many, and which" and a count down the edge answers the
   first without anybody adding up. SMALL AND TIGHT, because up to twenty-four of them share one
   card on a 568px phone (`BUNDLE_MAX` in find.js says why twenty-four) and a list that pushes the
   trolley below the fold is a bundle you cannot add. Each name wraps rather than truncating: two
   papers can differ only in their last word — `May 2017` against `November 2017` — and an ellipsis
   would put the one word that tells them apart behind it. Tokens only, so the card follows the
   theme it is drawn in. */
```

### ---------- AND IT IS A QUESTION CARD'S SHAPE NOW

before `.card.qcard.bundle`

```
/* ---------- AND IT IS A QUESTION CARD'S SHAPE NOW ----------------------------------------------------
   `bundleCard_` gives it `.qcard` and the question's header row (find.js says why). `.card` is a
   ROW in this app -- no box, a hairline under it, and `.card:last-child` / `.page .card` take even
   that off -- so the box has to be said again at two classes, written after all three so it wins
   on order as well as on weight. The same edge, radius and padding as the questions after it, which
   is the whole of "one family": a bundle and the papers in it read as the same kind of thing. */
```

### ---------- EACH WIDGET IS ITS OWN THING

before `.card.is-widget`

```
/* ---------- EACH WIDGET IS ITS OWN THING ----------------------------------------------------------
   A CARD EACH, with its own edge, because that is what makes nine tools nine tools rather than one
   long screen with headings in it. The calculator ends where the calculator ends.

   FLATTENING THEM WAS WRONG. It was done to stop the column reading as a stack of pop-ups, and the
   thing actually causing that was one PANE per widget — nine lit rectangles floating separately on
   black. One pane holding nine cards is a list. Nine panes is a pile. The card was never the
   problem, and taking its edge away took the separation with it. */
```

### A SURFACE OF ITS OWN.

in `.card.is-widget`

```
/* A SURFACE OF ITS OWN. A plain `.card` draws nothing but a bottom hairline, which is right for a
     row in a list of results and wrong here: a hairline between a calculator and a notepad is not
     enough to say where one ends and the other begins, because both are full of their own edges
     already. This gives each one a body to sit in. */
```

### ---------- THE LIBRARY CARDS' WIDGET GIVES ITS FACES THE FRAME'S SIDES (docs/history/339)

before `.card.is-widget:has(.lib-shelf)`

```
/* ---------- THE LIBRARY CARDS' WIDGET GIVES ITS FACES THE FRAME'S SIDES (docs/history/339) ----------------------
   *"move library card widget to the tools column."* On Settings a face had the pane's whole width; in a widget it
   sits inside the widget's own body as well, and that `.9rem` a side is what a bank card's shape could not spare at
   320: a face's height has a floor (its two 44px boxes, the caption and the bars), and below about 223px wide the
   floor wins over `aspect-ratio`, so the 85.6:54 card came out 214 by 138 — measured, 3% off the shape `check/states.js`
   holds it to. The one widget whose height follows its width, so the one whose body is narrower at the sides;
   the star, the title, the faces and the tick all keep one left edge. Three classes, so it wins on count and not
   on the line below it. */
```

### ---------- ONE REGION INSIDE A WIDGET GIVES UP ITS HEIGHT FIRST

before `.card.is-widget:has(.widget-squeeze), .card.is-widget:has(.widget-squeeze) :has(.widget-squeeze)`

```
/* ---------- ONE REGION INSIDE A WIDGET GIVES UP ITS HEIGHT FIRST ---------------------------------
   REPORTED AS "I can't scroll down on some". Measured on the Tools column at 320/390/768: the cheat
   sheet maker's card is 1263px inside an 805px pane and the flyer's is 1252px — so **409 to 494
   pixels are clipped**, and what is in them is the whole point of both tools. The A4 preview starts
   34px below the cut, the Print button is off the bottom entirely, and the pane is
   `touch-action: none`, so dragging up to look for them moves to the next widget instead.

   THE PANE'S OWN NOTE IS RIGHT AND STAYS RIGHT. `overflow: hidden` on a card is what makes every
   vertical drag belong to the grid, and it says the cost out loud: *"a card taller than the screen
   has its bottom cut off… Anything genuinely long should be PAGED."* These two are that card. What
   was missing is not permission to scroll the card — it is a way to say WHICH PART of a widget
   should shrink when there is not enough room.

   THE PRECEDENT IS ALREADY IN THIS FILE, twenty lines from here, and it is exactly this bug already
   solved: `.widget-full #docket-body { flex: 1 1 auto; overflow-y: auto }`, with the reason written
   beside it — *"the list scrolls INSIDE the card so the add-a-line box stays on screen with twenty
   things on the docket — a control that scrolls away is a control you have to go and find."* That
   is the Print button, word for word. It did not apply here because `.widget-full` matches a widget
   that IS the page in the FUNNEL, and on a column the markup is `.card.is-widget`.

   SO IT IS DECLARED RATHER THAN DERIVED, which is the move CLAUDE.md argues for under "replace
   emergent properties with declared ones": a widget says which of its own children is the elastic
   one, and everything else on the card keeps its natural height. A tool added tomorrow gets this by
   adding one class, and a tool that does not need it is untouched — `:has()` means a card with no
   squeeze region is not made into a flex column at all, so nothing else on any column moves.

   `axisFree` NEEDS NO CHANGES. It walks up from the finger looking for a box with `overflow: auto`
   that has more than six pixels to scroll, hands that box the drag, and takes it back at the ends —
   so the grid keeps the gesture everywhere except inside this one region. That is why the region
   has to be a real scroll container rather than a taller card. */
```

### ---------- AND IT IS THE WHOLE CHAIN, NOT THE CARD

before `.card.is-widget:has(.widget-squeeze), .card.is-widget:has(.widget-squeeze) :has(.widget-squeeze)`

```
/* ---------- AND IT IS THE WHOLE CHAIN, NOT THE CARD ----------------------------------------------
   THE FIRST VERSION WROTE `:has(> .widget-squeeze, > * > .widget-squeeze)` AND CHANGED NOTHING.
   Measured after it: 1263px inside 805px, exactly as before. The region is FOUR boxes down —
   `.card.is-widget > .widget-slot > .card > #mat-box > .widget-squeeze` — because `widgetColumn_`
   wraps every widget in a slot and the widget's own markup carries its own `.card`. So the selector
   matched nothing, and a rule that matches nothing looks exactly like a rule that did not work.

   ONE SHRINKING BOX IS NOT ENOUGH EITHER: a flex item refuses to shrink below its content unless it
   is told `min-height: 0`, so every box between the card and the region has to be a flex column
   that is allowed to shrink. Any one of them left at `min-height: auto` pins the whole card open —
   which is what `.card.is-widget` itself was doing here.

   SO THE CHAIN IS SELECTED RATHER THAN ENUMERATED. `:has(.widget-squeeze)` inside the card matches
   exactly the ancestors of the region and nothing else, at whatever depth they happen to be — so a
   widget that nests its markup one box deeper tomorrow needs no rule added. Everything hanging off
   those boxes keeps its own height; the chain and the region take the squeeze, and the chain rules
   win on specificity (0,4,0 against 0,3,0) rather than on order. */
```

### ---------- THE FLOOR, AND IT IS A JUDGEMENT WITH NUMBERS UNDER IT

in `.widget-squeeze`

```
/* ---------- THE FLOOR, AND IT IS A JUDGEMENT WITH NUMBERS UNDER IT ----------------------------
     MEASURED AT 320px, WHICH IS THE TIGHTEST CASE, with the cheat sheet maker — the one widget where
     the list and the preview genuinely compete for the same card:
       4.5rem → list  67px (a row and a half), sheet 302px
       6rem   → list  81px,                    sheet 302px
       8rem   → list 108px (about three rows), sheet 290px
       10rem  → list 135px,                    sheet 263px
     EIGHT. Three rows is enough to see that it IS a list and to work down it; the twelve pixels it
     takes off the sheet are its bottom margin. Below that the list reads as a slot that something
     failed to load into, which is the fault this repository keeps recording in other columns. */
```

### THE CAMERA CARD. The 📷 column drew "＋ New post" — a card describing a photograph rather than a way to take one, and the identical card sat one swipe away at

before `.cam-card .cam-stage`

```
/* ==================================================================================================
   THE CAMERA CARD.

   The 📷 column drew "＋ New post" — a card describing a photograph rather than a way to take one,
   and the identical card sat one swipe away at the top of the feed. This is the viewfinder that
   replaced it. See `cameraCard` in posts.js.

   THE STAGE HOLDS ITS SHAPE BEFORE THERE IS ANYTHING IN IT. `aspect-ratio` rather than a height, so
   the card is the same size with the camera off as with it on — otherwise turning it on grows the
   card under your thumb and the button you just pressed moves out from under it.

   3/4 BECAUSE A PHONE HOLDS A PHONE'S SHAPE. A 16/9 stage on a portrait photograph is two black
   bars and a stripe.
================================================================================================== */
```

### THE BUTTONS WRAP. `Again`, `Save it` and `Try the camera again` all live on this row now, and at most two are ever shown at once — but "Try the camera again"

before `.cam-card .cam-row`

```
/* THE BUTTONS WRAP. `Again`, `Save it` and `Try the camera again` all live on this row now, and at
   most two are ever shown at once — but "Try the camera again" is a long label and 320px is a real
   width. The row is empty until there is a picture to save or a refusal to retry, and an empty
   flex row is no height at all. */
```

### THE FOUR CONTROLS. ASKED FOR BY SHAPE AND COLOUR — "white circle for take pic, Red for record, and switch camera, and photos".

before `.cam-bar`

```
/* ==================================================================================================
   THE FOUR CONTROLS.

   ASKED FOR BY SHAPE AND COLOUR — "white circle for take pic, Red for record, and switch camera,
   and photos". What was here was five `.btn quiet` rectangles under a viewfinder, which is a form's
   buttons where every camera anybody has used puts a shutter.

   THE TWO COLOURS ARE THE CAMERA'S, NOT THIS APP'S, and that is why they are declared here rather
   than at `:root`. The house style settles this case with the chessboard: a colour belonging to ONE
   component — that board's own cream and charcoal, this control's own white and red — is named on
   the component so it is available without being offered to the whole stylesheet. Nothing else on a
   black-and-gold screen may reach for a white disc.

   SPACE-BETWEEN, NOT CENTRED. `Photos` and `Switch` are the two ends of a camera's bar on every
   phone — the roll you came from on the left, the lens you are not using on the right — and the
   shutters sit between them. `Switch` is often absent (one camera, or a browser that will not say),
   so the two discs are centred in what is left rather than pinned to a column that may not exist.
================================================================================================== */
```

### ---------- THE SHUTTER AND THE RECORD DISC

before `.cam-shot, .cam-rec`

```
/* ---------- THE SHUTTER AND THE RECORD DISC -------------------------------------------------------
   A RING, A GAP AND A FILL, which is what makes a disc read as a shutter rather than as a dot. The
   gap is `--raised` because that is the card these sit on; an `inset` shadow rather than a second
   element, so the whole control is one box and one tap target.

   64 AND 52. The shutter is the bigger of the two because it is the one you reach for without
   looking, and both are comfortably past the 44px floor — which is the one measurement in this
   stylesheet that must not scale, so both are in px.

   `border-radius: 50%` AND NOT `var(--r-sm)`. These are the only round things in the app. */
```

### ---------- A CAMERA STARTING UP SHOWS A GREYED SHUTTER

before `.cam-shot:disabled, .cam-rec:disabled`

```
/* ---------- A CAMERA STARTING UP SHOWS A GREYED SHUTTER -------------------------------------------
   IT DOES NOT REMOVE IT. These used to be `hidden` until the first frame arrived, so the row grew
   under the thumb that was reaching for it — and on the path anybody actually takes the record
   button was never revealed at all. See `camLive_`. */
```

### RECORDING IS A SQUARE.

before `.cam-rec.is-rec`

```
/* RECORDING IS A SQUARE. The disc has no room for the word `Stop`, and a record control that looks
   the same while it is recording is a mode you cannot see — which is the fault this file already
   records for a reel paused with nothing on it saying so. `aria-label` moves with the shape; see
   `camRecMark_`. */
```

### `.cam-compose` WAS HERE — the composer's strip under the viewfinder.

before `[hidden]`

```
/* `.cam-compose` WAS HERE — the composer's strip under the viewfinder. The `Write a post` button it
   held was removed from `cameraCard` on request, so these four rules styled nothing. Deleted rather
   than left: `check-css.js` reports a class nothing produces, and a stylesheet that keeps rules for
   markup that is gone is how 448KB of it happens. The handler behind that button is still in
   posts.js and is noted there.

   THE `Photos` LABEL NEEDS NOTHING OF ITS OWN. `.btn` is a class selector, not `button.btn`, so a
   `<label class="btn quiet">` is already a button in every respect the eye can check — the same
   flex centring, radius, 44px floor and press animation. A second rule to make a label look like a
   button would be a second place for the button to change. */
```

### `hidden` HAS TO ACTUALLY HIDE.

before `[hidden]`

```
/* ==================================================================================================
   `hidden` HAS TO ACTUALLY HIDE.

   The attribute works by a UA rule setting `display: none`, and ANY author rule that sets `display`
   beats it — so `.btn { display: flex }` made three hidden buttons on the camera card show, and
   `.cam-stage canvas { display: block }` did the same to the still. The markup said hidden, the
   screen said otherwise, and the card offered "Take one" before the camera was on.

   MEASURED BEFORE IT WAS ADDED, across all nine screens: four elements were marked hidden and
   displayed anyway, and all four were the camera's. So this fixes those and changes nothing that
   was already on screen — it is not a rule with unknown reach.

   `!important` BECAUSE THAT IS THE ONLY THING THAT WINS. The alternative is remembering, in every
   rule that sets `display` for ever, that the element might be hidden. One line here, or a
   permanent obligation everywhere else.
================================================================================================== */
```

### ONE LINE ABOUT THE PICTURE, AND IT IS A BARE INPUT RATHER THAN A `label.field`.

before `.cam-card .cam-cap`

```
/* ONE LINE ABOUT THE PICTURE, AND IT IS A BARE INPUT RATHER THAN A `label.field`. Every other
   single box in this app — the search, the comment, the notepad, the message composer — is a
   placeholder and no label, and the placeholder is what a screen reader reads out when there is
   nothing else. The margin is what `label.field` was supplying; the rest comes from the global
   `input` rule, so the box is the same 44px and the same padding as every other field here. */
```

### AND A GAP UNDER WHO-IT-GOES-UP-AS, WHICH IT HAD NONE OF.

before `.cam-card .cam-as`

```
/* AND A GAP UNDER WHO-IT-GOES-UP-AS, WHICH IT HAD NONE OF. Both rows are `.btn-row` with no margin,
   so the bottom edge of `@family.` was the top edge of `Again` — 789px in both cases, measured — and
   with a gold fill on the chosen one of each row the two read as one block overlapping another
   rather than as two rows. `.5rem` is the gap `.cam-row` already uses between its own buttons, so
   the spacing down the card is one number rather than two. It costs nothing when there is no
   picture, because the row is `hidden` and `[hidden]` takes it out of the flow entirely. */
```

### ---------- WHAT IS ALREADY IN THIS POST

before `.cam-card .cam-tray`

```
/* ---------- WHAT IS ALREADY IN THIS POST ---------------------------------------------------------
   A ROW OF SQUARES, WRAPPING, and never a sideways scroller — this card is a page of a column you
   swipe, and a strip you swipe along would eat the gesture. 48px because each is a control (a tap
   takes it out) and a fingertip does not scale; in px for that reason. A clip has no picture to show
   until it is decoded, so it is a ▶ on the sunk ground. */
```

### AND AN EMPTY STATUS LINE TAKES NO ROOM.

before `#cam-said:empty`

```
/* AND AN EMPTY STATUS LINE TAKES NO ROOM. `#cam-said` is blank until something has to be said, and
   a `p`'s own margin is 10.7px at 390 whether or not there is a sentence in it — vertical space on
   a card that is 26px from the pane's fold, spent on nothing. It is back the moment it has words.
   An id and a pseudo-class, so nothing of equal specificity can be on the other side of it. */
```

### CONNECT 4, OTHELLO AND HERD MENTALITY THE BOARDS ARE GRIDS OF REAL BUTTONS.

before `.c4, .oth`

```
/* ==================================================================================================
   CONNECT 4, OTHELLO AND HERD MENTALITY

   THE BOARDS ARE GRIDS OF REAL BUTTONS. `aspect-ratio: 1` on the cell keeps every square square
   without anybody computing a height, and `1fr` columns mean the board is whatever the card is
   wide — so it fits a 320px phone and a 1280px laptop from the same two lines.

   THE TAP TARGET IS THE THING THAT DECIDES THE SIZE. Seven columns of 44px is 308px, and a card on
   a 320px phone is narrower than that — so the cells are as wide as they can be and the 44px floor
   is met on the OTHER axis, which is the one a thumb aiming at a column actually needs. A Connect 4
   column is a 6-cell-tall strip: easy to hit, and measured as such by check/ui.js on each cell.
================================================================================================== */
```

### ---------- THE ASPECT-RATIO GOES ON THE BOARD, NOT ON THE SQUARES

before `.c4, .oth`

```
/* ---------- THE ASPECT-RATIO GOES ON THE BOARD, NOT ON THE SQUARES ---------------------------------
   FIRST VERSION PUT `aspect-ratio: 1` ON THE CELL and both boards rendered as a 3px stripe. A grid
   row is `auto` by default and a button has no intrinsic height, so the row collapsed to nothing and
   the cell's ratio had nothing to be a ratio OF.

   THE CHESS BOARD ALREADY SOLVED THIS, twelve rules up: ratio on the CONTAINER, and rows declared as
   well as columns. Its comment says "without the rows each one sizes itself to its tallest piece and
   the board comes out ribbed" — the same fault, found the same way, and I reproduced it rather than
   reading it. Copied here rather than invented again.

   7:6 AND 1:1 BECAUSE THAT IS WHAT THE GAMES ARE. Connect 4 is seven columns of six; Othello is
   square. The ratio is the board's shape, so the squares come out square without anybody saying so. */
```

### ---------- A BOARD SQUARE CANNOT BE 44px AND THE ARITHMETIC IS THE WHOLE REASON

before `.c4`

```
/* ---------- A BOARD SQUARE CANNOT BE 44px AND THE ARITHMETIC IS THE WHOLE REASON ------------------
   SEVEN COLUMNS OF 44px IS 308px, plus six 3px gaps and the board's own padding: 332px. A phone this
   app supports is 320px WIDE. So a Connect 4 column cannot meet the tap-target minimum edge to edge,
   let alone inside a card — and Othello, at eight columns, is further off again.

   I TRIED TO BUY THE WIDTH BACK AND IT WAS NOT THERE. Bleeding the board out through the card's
   padding, the way the old skeleton's picture did, took the columns from 25px to 29px and bought two
   sideways scrolls doing it. Four pads instead of two got 33px and three scrolls. The rule is not failing
   because of a padding I can reclaim; it is failing because 332 is bigger than 320.

   SO THE BOARD STAYS IN THE CARD and `check/ui.js` is told why a board cell is exempt — see the note
   beside `MIN_TAP` there. Contorting the layout for a number that cannot be reached would have cost
   the layout and still not reached it. */
```

### ---------- AND THIS RULE WAS DELETED, WHICH IS WHY THE BOARD WAS A BLACK STRIPE

before `.c4`

```
/* ---------- AND THIS RULE WAS DELETED, WHICH IS WHY THE BOARD WAS A BLACK STRIPE ------------------
   REPORTED AS "connect 4 ... its blacked out right now". `.c4` had this line and lost it in the
   commit above — "A board square cannot be 44px, and the arithmetic is the reason" — which rewrote
   the block around it and took the `.c4` half with it. `.oth` kept its own and was fine.

   WHAT A GRID WITH NO TEMPLATE DOES is one column, 42 rows, each `auto` — and a `<button>` with
   `height: 100%` has no intrinsic height, so every row collapsed to nothing and what was left was
   `.c4`'s own `background: var(--line)` and its 3px of padding. A 6px dark bar. Nothing threw,
   nothing overflowed, and `check/ui.js` measures tap targets and sideways scroll rather than
   whether a box has a size at all.

   THE COMMENT ABOVE SURVIVED THE RULE IT DESCRIBES, which is how it went unnoticed: "7:6 AND 1:1
   BECAUSE THAT IS WHAT THE GAMES ARE" was still sitting over a block that only said 1:1. Same shape
   as `.favwrap.is-fav`, as the dead `kind === 'paper'` guard, and as `resource_type` in `VOCAB`. */
```

### A CELL THAT CANNOT BE PLAYED IS NOT GREYED OUT.

before `.c4-cell[disabled], .oth-cell[disabled]`

```
/* A CELL THAT CANNOT BE PLAYED IS NOT GREYED OUT. `disabled` on a board square means "not a legal
   move", which is most of the board most of the time — dimming them all would make the board look
   broken. It only stops the tap; the disc it already holds still shows. */
```

### TWO PLAYERS MEANS TWO EQUAL COLOURS, AND THAT IS WHY GOLD LEFT BOTH BOARDS

before `.c4, .c4-turn`

```
/* ==================================================================================================
   TWO PLAYERS MEANS TWO EQUAL COLOURS, AND THAT IS WHY GOLD LEFT BOTH BOARDS

   IT WAS GOLD AGAINST `--dim` and gold against `#15130f`, which was right while one side was YOU and
   the other was the machine: gold is what this app means by yours, and dim is what it means by the
   other thing. Reported as "connect 4 should be not against pc but 2 player" and "othello ... the
   black blends with the backgorund. do red and blue". Both halves follow from the first: with two
   people at one phone there is no "yours", so a bright side and a faded side reads as one player
   being switched off, and a near-black disc on a near-black card is not a disc at all.

   DECLARED ON THE COMPONENT, NOT AT `:root`, which is the rule the house style states with the chess
   board's cream and charcoal: a colour that belongs to ONE thing is named on that thing so it is
   available without being offered to a black-and-gold stylesheet. Nothing else in this app may reach
   for a red disc.

   CONNECT 4 IS RED AND YELLOW because that is what is in the box, and Othello is red and blue
   because that is what was asked for — its own discs are black and white, and black is the one pair
   this ground cannot carry. */
```

### ---------- THE COUNTER IS A DISC IN A HOLE, NOT THE HOLE'S OWN COLOUR

before `.c4-cell`

```
/* ---------- THE COUNTER IS A DISC IN A HOLE, NOT THE HOLE'S OWN COLOUR ------------------------------
   IT WAS `.c4-cell.p1 { background: red }` — the square WAS the counter. That is fine for a counter
   that appears and wrong for one that falls: animate the square and the hole goes with it, so the
   slot the counter is falling into shows the board's gap colour for a third of a second rather than
   an empty hole. So the square stays a hole (`--sunk`, from the rule above) and the counter is its
   `::after`, which is what moves. Positioned, so a counter falling past the empty holes above it
   is drawn over them, which is how it looks through the front of a real board. */
```

### ---------- THE DROP

before `.c4`

```
/* ---------- THE DROP ---------------------------------------------------------------------------------
   ASKED FOR AS "refine connect 4 add dropping animation of counters." From one row above the top
   edge into its own square: `--c4-fall` is its row plus one, set on the square by `c4Paint`, and a
   row is the counter's own height plus the board's 3px gap — so `100%` here is one square, and the
   distance is right at every width without a pixel written down. `.c4`'s `overflow: hidden` is what
   hides it until it enters.

   GRAVITY, THEN ONE SMALL BOUNCE. It accelerates down (ease-in), lands at 70%, rises a seventh of a
   square and settles. The time grows with the distance — 190ms into the top row of a nearly full
   column, 440ms to the bottom of an empty one — because a counter that falls six rows in the time it falls one
   reads as sliding, not dropping.

   TRANSFORM ONLY, so it is the compositor's work and costs no layout: a board rebuilt on every tap
   must not also be re-laid-out sixty times a second while a counter falls. And NOT FOR ANYBODY WHO
   HAS ASKED FOR LESS MOTION, for whom the counter is simply there, as it always was. */
```

### THE FOUR THAT WON, RINGED in the app's ink rather than its gold:

before `.c4-cell.c4-win::after`

```
/* THE FOUR THAT WON, RINGED in the app's ink rather than its gold: gold is the yellow counter's own
   colour near enough to vanish on it, and a ring that shows on one side's win and not the other's is
   no ring. Inset on the counter and out into the 3px gap, so it reads on red, on yellow and against
   the board. */
```

### ---------- AND THE LEGAL-MOVE RINGS ARE GONE

before `.mz`

```
/* ---------- AND THE LEGAL-MOVE RINGS ARE GONE --------------------------------------------------
   `.oth-cell.can` DREW A GOLD RING ON EVERY SQUARE THE PLAYER COULD USE, argued for as teaching:
   Othello's legal moves are not obvious and a beginner tapping dead squares learns nothing. Asked
   for outright — "dont show the locations players can pic" — and the argument does not survive two
   players anyway: the rings are one player's answer drawn on a board the other one is looking at.
   Reading the board is the game. An illegal tap says so in the line under the board, which answers
   the press without answering the question. */
```

### ---------- MAZE

before `.mz`

```
/* ---------- MAZE -----------------------------------------------------------------------------------
   THE WALLS ARE BORDERS ON THE CELLS, so the grid is the maze rather than a picture of one: a cell
   carries its four walls and the two sides of any wall are drawn by the two cells that share it.
   `gap: 0` for the same reason — a gap between cells would be a corridor nobody can walk down.

   ITS THREE COLOURS ARE DECLARED ON THE COMPONENT, not at `:root`. A maze's walls are that maze's
   convention and nothing else in this app wants them, which is the rule the house style states with
   the chess board's cream and charcoal. `--line` is right for a hairline between rows of text and
   too faint to read as a wall on a phone at twenty-four pixels a cell — measured by looking at it.

   ELEVEN SQUARES AND THE SAME ARITHMETIC AS THE OTHER BOARDS. A cell cannot be 44px: eleven of them
   is 484px and a phone this app supports is 320px wide. That is fine here in a way it is not for
   Connect 4, because NOTHING IN THE MAZE IS TAPPED — the four keys under it are, and each of those
   is a real fingertip. See the note over `MIN_TAP` in check/ui.js for the board case. */
```

### `mz-` ON THE WALLS, BECAUSE `.ws` IS THE WORD SEARCH'S GRID.

before `.mz-cell.mz-n`

```
/* `mz-` ON THE WALLS, BECAUSE `.ws` IS THE WORD SEARCH'S GRID. These were `.wn` `.we` `.ws` `.ww`,
   and the word search's bare `.ws { display: grid; margin: .55rem auto 0; max-width: 24rem }`
   landed on every maze cell with a south wall: 71 of 121 cells 16.6px tall in 24.7px rows at 390,
   so walls doubled, missed each other and left gaps in the outer edge. See `mazePaint`.
   `check/ui.js` now asks that every square of a board is one size, which is the measurement that
   would have caught it on the first run. */
```

### ---------- THE FOUR KEYS

before `.mz-pad`

```
/* ---------- THE FOUR KEYS ---------------------------------------------------------------------
   IN `px`, WHICH IS THE ONE MEASUREMENT IN THIS STYLESHEET THAT MUST NOT SCALE. A fingertip is the
   same size on every screen, and this file carries five convictions of that rule already.

   NOT `.btn`, WHICH IS `width: 100%`. That is right for the one action on a card and absurd for an
   arrow; `.reel-sound` and `.btn-row .btn` both record the same correction. */
```

### ---------- THE ONE CHOICE EACH OF THESE TWO GAMES ASKS, AT THE TOP OF ITS CARD

before `.ws-top`

```
/* ---------- THE ONE CHOICE EACH OF THESE TWO GAMES ASKS, AT THE TOP OF ITS CARD -------------------
   The cheat sheet's drawn select, full width. It shared a row with "New puzzle" first, and at 320px
   that left it eighty pixels and the label "Spelling…" — a choice nobody can read is not a choice. */
```

### ---------- WORD SEARCH

before `.ws`

```
/* ---------- WORD SEARCH ------------------------------------------------------------------------
   THE MAZE'S ARITHMETIC, AND THE OPPOSITE ANSWER ABOUT TAPPING. Ten letters across a 320px phone is
   20px a cell, measured (eight are 25px), which no fingertip hits reliably — and here, unlike the maze, the cells ARE
   tapped, because a drag would fight the pager (see `WS_THEMES` in games.js). So a cell is as big as
   the card allows and no bigger, and `ACCEPTED_TAP` in check/ui.js carries the numbers. A wrong tap
   costs nothing: the next tap replaces it.

   ITS COLOURS ARE THE APP'S OWN, deliberately not declared on the component the way the maze's walls
   are: gold is what this app means by "yours" — the start you picked, the words you found — and a
   word search has no convention of its own to keep. */
```

### ---------- SENTENCE SCRAMBLE

before `.ss-built`

```
/* ---------- SENTENCE SCRAMBLE --------------------------------------------------------------------
   THE SENTENCE BEING BUILT IS A STRIP OF PAPER WRITTEN OUT, and the chips under it never move. A used
   chip stays where it was, dimmed, so the word your finger was going for next is where it was a
   moment ago — see the note over `SS_SENTENCES` in games.js.

   CHIPS ARE 44px IN px, the one measurement here that does not scale. The strip is not a control. */
```

### SCRABBLE ITS FOUR PREMIUM COLOURS AND ITS CREAM BOARD ARE DECLARED ON THE COMPONENT, which is the rule the house style states with the chess board's cream and

before `.scr`

```
/* ==================================================================================================
   SCRABBLE

   ITS FOUR PREMIUM COLOURS AND ITS CREAM BOARD ARE DECLARED ON THE COMPONENT, which is the rule the
   house style states with the chess board's cream and charcoal and Othello's red and blue: a colour
   that belongs to ONE component is named on that component rather than offered to a black-and-gold
   stylesheet. Light blue, dark blue, pink and red on cream are not a taste — they are what is
   printed on the board, and a Scrabble board in gold would have to be read rather than recognised.

   THE SQUARES SAY WHAT THEY ARE BY COLOUR AND NOT BY WORDS. The printed board writes DOUBLE LETTER
   SCORE across three lines of a square; fifteen squares across a phone is about seventeen pixels
   each, where that is not small type, it is no type. A legend under the board was the other option
   and it costs a row of height on a card that is already at the pane's limit.

   A SQUARE CANNOT BE 44px AND HERE THAT IS THE POINT rather than a concession: fifteen of them is
   660px, wider than any phone, and the same argument `.c4` and `.oth` already record. Everything
   that is a CONTROL rather than a square — the rack, the four actions, the blank's letters — is a
   real fingertip, in px, which is this stylesheet's seventh conviction of that rule.
================================================================================================== */
```

### THE POINTER ONLY WHERE THERE IS SOMETHING TO PRESS.

before `button.scr-sq`

```
/* THE POINTER ONLY WHERE THERE IS SOMETHING TO PRESS. Before a game starts the squares are drawn as
   `<i>` rather than buttons — see `scrCellsHtml_` — and a cursor saying otherwise is the same small
   lie as a control that looks pressable and does nothing. */
```

### ---------- A TILE COVERS WHATEVER IS UNDER IT, AND SAYS SO IN THE SELECTOR

before `.scr-sq.dl:not(.has)`

```
/* ---------- A TILE COVERS WHATEVER IS UNDER IT, AND SAYS SO IN THE SELECTOR --------------------
   THAT IS TRUE ON THE TABLE and it was true here only because `.scr-sq.has` is written afterwards:
   `check/cascade.js` named ten longhands on these five squares settled by file order alone. With
   `:not(.has)` there is no contest to settle — the premium colour is what an EMPTY premium square
   looks like, which is the fact the stylesheet was trying to state. Ninth conviction of
   `.price.faint`, and the first caught before anybody looked at a screenshot. */
```

### THE STAR. It is a double word and it is also where the first move has to go, so it is marked differently from the other double words rather than the same

before `.scr-sq.mid:not(.has)`

```
/* THE STAR. It is a double word and it is also where the first move has to go, so it is marked
   differently from the other double words rather than the same — that is the one square whose
   meaning somebody has to find before the game starts. */
```

### `:not(.has)` RATHER THAN LETTING THE LATER RULE WIN.

before `.scr-sq.mid:not(.has)`

```
/* `:not(.has)` RATHER THAN LETTING THE LATER RULE WIN. A tile covers the star exactly as it covers
   every other premium, and with a bare `.scr-sq.mid` that was true only because `.scr-sq.has` is
   written afterwards — `check/cascade.js` named nine longhands settled by file order alone on this
   one square. The selector says the thing now: the star shows while the square is empty. */
```

### AND IT SETS ONLY THE RING.

before `.scr-sq.mid:not(.has)`

```
/* AND IT SETS ONLY THE RING. The centre IS a double word — `scrPrem_(112)` returns `D`, so the
   square already carries `.dw` — and restating that colour here was one fact in two rules saying
   the same thing, which `check/cascade.js` reports as nine longhands decided by file order. What is
   only true of this square is the ring. */
```

### ---------- WHAT THE BLANK STANDS FOR

before `.scr-acts`

```
/* ---------- WHAT THE BLANK STANDS FOR ----------------------------------------------------------
   ONE CONTROL, NOT TWENTY-SIX. See `scrRackHtml_` in games.js for what an alphabet of 44px keys did
   to this card's height. `.scr-sel` drew its own box here — .9rem, 600, a padding of its own — and is
   the select rule's field now, like every other select (note 315), so no rule names the class. */
```

### ---------- HERD MENTALITY

before `.herd-card .herd-q`

```
/* ---------- HERD MENTALITY ------------------------------------------------------------------------
   THE QUESTION IS THE WHOLE CARD. It is read aloud to a room, so it is set large enough to be read
   at arm's length across a table rather than at phone-reading distance. */
```

### ---------- WRITING ON THE PAPER

before `.qp-ans`

```
/* ---------- WRITING ON THE PAPER -------------------------------------------------------------------
   A BOX PER PART, under the question it belongs to. See `ansBox_` in find.js for why it is kept
   in the browser rather than sent anywhere: these cards are rebuilt on every repaint, and a
   `<textarea>` rebuilt is a `<textarea>` emptied.

   THE RULED LINE BELOW IS THE GUIDE'S BOX NOW (`guideBox_`, `.gd-box`), which writes on a page of
   notes. A QUESTION'S BOX IS THE CHAT BAR further down (`.qp-bar`): this note said a bordered field
   "would promise a submit button that does not exist", and since 8 Oct the button exists -- Send. */
```

### `.qp-ans-in`'s OWN LOOK WAS HERE -- a `--sunk` box with a ruled line, gold on focus -- and its textarea's in the bar below.

before `.qp-compose`

```
/* `.qp-ans-in`'s OWN LOOK WAS HERE -- a `--sunk` box with a ruled line, gold on focus -- and its
   textarea's in the bar below. Since 8 Oct every `.qp-ans-in` is the pad's invisible box inside a
   `.kp-field` (keypad.js), so none of it was ever drawn: the ruled look is the worksheet field's
   (`.gd-box .kp-field`) and the chat bar's is the pill's. */
```

### THE RULE UNDER THE BOX TOOK THE VERDICT'S COLOUR here, through `.qcard:has(> .qp-mark.is-right)`, because the verdict came after the box.

before `.qp-compose`

```
/* THE RULE UNDER THE BOX TOOK THE VERDICT'S COLOUR here, through `.qcard:has(> .qp-mark.is-right)`,
   because the verdict came after the box. The bar holds both now, so the ring round the field does it
   from inside `.qp-mark` with no `:has` -- see `.qp-bar`. */
```

### ---------- THE ANSWER BAR: A PAPER FIELD, AND SEND BESIDE IT

before `.qp-compose`

```
/* ---------- THE ANSWER BAR: A PAPER FIELD, AND SEND BESIDE IT ---------------------------------------
   THE OWNER, 8 Oct, after a lesson on a pupil's iPad in the sun: *"the answer box should look like a
   chatbox. with send tile. we found it hard to find answer box in the ipad in the sun."* Measured on
   that page: the box was `--sunk` on a `--raised` card, 1.04:1, its rule 1.25:1, and Check a dark plate
   at 1.05:1 -- in glare an empty black rectangle on a black card, which is a box nobody can find.

   THE FIELD IS THE PAPER PALETTE, and tokens only (CLAUDE.md: a paper colour is never a literal). It
   always stood in for the sheet the answer is written on, and cream on the card is 17:1, its words
   13:1, "Type your answer" and the dashed slots 5.3:1. Rounded at half its height, the shape every
   phone's message bar has, so it reads as "type here" before a word of it is read.

   SEND IS OUTSIDE IT, on the dark card (`.tile.is-send`, a gold disc): gold inside the cream measured
   1.56:1, on the card 11:1. A RING, NOT A RULE, says what is happening to the field -- gold while it is
   being typed in, green or amber once marked -- 3px outside it, on the card, where each reads at about
   11:1. `check/ui.js` holds the field and Send to 3:1 against what is behind them (EDGE, WCAG 1.4.11),
   which is the rule nothing measured while all of this sat at 1.04.

   THE VERDICT IS A LINE OF ITS OWN UNDER THE BAR, ONE LINE TALL BEFORE IT SAYS ANYTHING, so "Correct"
   and "Not yet" land in a space that was already there and marking moves nothing (261,
   `check/states.js`). */
```

### A WORDED ANSWER IN THE BAR:

before `.qp-bar > .qp-ans:focus-within`

```
/* A WORDED ANSWER IN THE BAR: ONE LINE, GROWING to about five lines, then it scrolls inside -- the
   message bar's shape, which the textarea had through `field-sizing` and a height set on every key. It
   is the DRAWING that grows now (`.kp-words > .kp-show` below), and the invisible textarea is laid over
   whatever height that is. */
```

### THE RING TAKES THE VERDICT'S COLOUR, so what was marked and what it was marked as are joined on the screen, not only in the sentence under it.

before `.qp-mark.is-right > .qp-bar > .qp-ans`

```
/* THE RING TAKES THE VERDICT'S COLOUR, so what was marked and what it was marked as are joined on the
   screen, not only in the sentence under it. Cleared by typing -- see the `input` listener in find.js,
   which takes the verdict off as soon as the answer it was about has changed. */
```

### ---------- AN ESSAY'S SHEET

before `.qp-essay`

```
/* ---------- AN ESSAY'S SHEET -----------------------------------------------------------------------------
   THE OWNER, 9 Oct, about a pupil on a forty-mark creative writing question: *"firstly it doesnt let him
   do paragraphs and also i want it to mark with ai."* The pill above is five lines and then a letterbox;
   an essay is four or five paragraphs. So a box that asks for extended writing (`ansEssay_`, keypad.js)
   is a SHEET: the card's full width, the paper palette in tokens only (CLAUDE.md, two palettes), ruled in
   the paper's own hairline (`--paper-rule`) one rule per line of writing, so the page reads as "write
   here, at length" before a word is on it -- and a blank line between paragraphs is a ruled line with
   nothing on it, which is what a paragraph break looks like on paper.

   SIZED IN LINES OF WRITING, IN px. The ink is 16px (iOS zooms into anything smaller, keypad.js) on a
   24px line, so a line is a pixel number on every screen and the rules land under the words. EIGHT LINES
   TO START ON A PHONE, TWELVE ON A TABLET (`--sheet-lines`), growing with the essay to THE ROOM ABOVE THE
   PAD and then scrolling inside, the line being typed kept in view (`kpCaretSeen_`). The room is the
   screen less the pad's own height -- measured by keypad.js when it comes up (`--kp-h`) and the pad's
   five rows of 48px until then -- less the paper's edges, the row under it and the 12px the pad is kept
   clear by: 112px. The SAME CAP WITH THE PAD DOWN, so the sheet is the same height whether or not the
   pad is up and putting it away moves nothing; and a capped sheet is what keeps a long essay from making
   its card taller than its pane, which `paneReach_` answers by drawing the whole card smaller. Never less
   than five lines, however short the screen. */
```

### THE DRAWING IS THE SHEET'S WRITING AREA:

before `.qp-sheet > .kp-field.kp-essay > .kp-show`

```
/* THE DRAWING IS THE SHEET'S WRITING AREA: no padding of its own (the paper's is the margin), so line n
   is 24n to 24n+24 from its top and its rule at 24n+23. `local`, so the rules scroll with the words. Four
   classes, over the chat bar's `.kp-field.kp-words > .kp-show`. */
```

### HOW TO MAKE A PARAGRAPH, SAID WHERE THE PARAGRAPHS GO -- the question the owner asked, answered on the empty sheet.

before `.qp-sheet > .kp-field.kp-essay.is-blank > .kp-show::before`

```
/* HOW TO MAKE A PARAGRAPH, SAID WHERE THE PARAGRAPHS GO -- the question the owner asked, answered on the
   empty sheet. GONE WITH THE FIRST LETTER, AND NOT BEFORE: this was `:empty`, and the caret is a span in
   the drawing, so the hint went the moment the sheet was tapped -- the review of 9 Oct, on an iPad, saw
   it on the sheet and then a blank ruled page with the pad up and "0 words", at the one moment it is
   for. So it hangs on `is-blank`, which the field carries while nothing is written (`kpCount_`), and it
   is laid BEHIND the caret, absolutely, so the caret blinks at the start of the first line over it as a
   phone's placeholder does. */
```

### THE TILE'S NAME BESIDE IT (`ansBox_`):

before `.qp-ai-say`

```
/* THE TILE'S NAME BESIDE IT (`ansBox_`): a mark alone was a sparkle nobody had been told the meaning of,
   under the one action the sheet ends in. In the verdict's own voice, so it reads as the tile's caption
   and not as a second control. */
```

### AN ESSAY'S MARK, KEPT WHILE IT IS REVISED (`aiKeptPaint_`, keypad.js):

before `.qp-essay.is-stale > .qp-verdict`

```
/* AN ESSAY'S MARK, KEPT WHILE IT IS REVISED (`aiKeptPaint_`, keypad.js): said to be stale by its words
   ("· before your changes") and by losing its colour -- the verdict in the plain dim of a line with no
   verdict, and no green or amber ring on a sheet that is no longer the text that was marked. */
```

### THE VERDICT AND THE SAVED LINE SIT UNDER THE ROW, in line with the paper's edge rather than the pill's text, which is 14px in from a rounded end the sheet does

before `.qp-compose.qp-essay > .qp-verdict`

```
/* THE VERDICT AND THE SAVED LINE SIT UNDER THE ROW, in line with the paper's edge rather than the pill's
   text, which is 14px in from a rounded end the sheet does not have.
   `.qp-compose.qp-essay`, NOT `.qp-essay`: the chat bar's own margins are `.qp-compose > …` at the same
   weight, and a rule that wins only by coming later is the one `check/cascade.js` exists to refuse --
   move either block and the essay's lines would silently take the pill's 14px back. */
```

### ---------- MARKING YOUR OWN WORK

before `.qp-mark`

```
/* ---------- MARKING YOUR OWN WORK ----------------------------------------------------------------
   TAP TARGETS IN px. 44 is the floor and `rem` cannot be trusted to reach it — the root is
   `clamp(13.5px, 3.8vw, 16px)`, so 2.75rem is 40.75px on a phone. Fifth conviction of that rule
   after `.btn.tiny`, `.post-act`, `.fm-adds label` and the filter chips. */
```

### ---------- AND MARKING MOVES NOTHING

before `.qp-mark`

```
/* ---------- AND MARKING MOVES NOTHING --------------------------------------------------------------
   THE ROW WRAPPED, AND THE CARD JUMPED. `flex-wrap: wrap` let "Not yet — have another go" drop under
   the button at 320, so pressing Check grew the card by a line -- 21.8px, measured -- and everything
   under it moved the moment you were told your answer. The verdict stays beside the button now and
   wraps INSIDE its own slot, two short lines in a 44px row, so the row is the button's height whatever
   it says. A tapped question's row has no button; its verdict line is reserved instead (below), so
   the sentence lands in a space that was already there. `check/states.js` measures both. */
```

### GREEN AND AMBER, NOT GREEN AND RED.

before `.qp-verdict`

```
/* GREEN AND AMBER, NOT GREEN AND RED. The verdict says "not yet" rather than "wrong" and the
   colour has to agree with the words: these are practice sheets a child works through alone, and
   a red cross reads as final where the whole value of self-marking is the next attempt. */
```

### THE TOKENS RATHER THAN A HEX:

before `.qp-verdict`

```
/* THE TOKENS RATHER THAN A HEX: `--good` and `--warn` are what this stylesheet means by "worked" and
   "look again" everywhere else, and the green here was its own `#6ee7a8`, the one place a right
   answer was a different green from a paid invoice.

   A MARK BESIDE THE WORDS, because colour alone is lost to anyone who cannot tell these two apart
   and at arm's length to everyone. A tick for right; a turning arrow for "not yet", which says
   "go round again" -- a cross would say the thing the wording was chosen not to. Drawn by CSS, so a
   screen reader hears the sentence and not "check mark". "Write something first" has neither: it is
   not a verdict. */
```

### ---------- WHERE THE ANSWER WENT

before `.qp-saved`

```
/* ---------- WHERE THE ANSWER WENT -------------------------------------------------------------------
   *"it doesnt seem to save their answers"* and *"i feel very insecure when signing into the kids
   accounts"* — the answer WAS kept, on that iPad, and nothing on the screen said so or said whose it
   was. One line under the box, from `ansSavedSay_` (js/answers.js): "Saved to Ada’s account",
   "Saving…", or "On this device only — sign in to keep it". Small and `--faint`, the voice every
   caption on the card already uses, because it is a reassurance and not a control.

   ONE LINE, RESERVED, so nothing moves — the rule 261 made for the verdict. The line is there and empty
   before anything is typed, and "Saving…" becoming "Saved…" is one line becoming another of the same
   height. `nowrap` with an ellipsis rather than a wrap: at 320 the longest sentence just fits, and a
   long first name must cost letters, never a second line under the box. */
```

### ---------- THE MATHS BOX: THE ANSWER DRAWN, THE INPUT INVISIBLE OVER IT

before `.kp-field`

```
/* ---------- THE MATHS BOX: THE ANSWER DRAWN, THE INPUT INVISIBLE OVER IT ---------------------------
   See keypad.js. `.kp-show` is what is read — drawing the value through `typeset_` so a fraction
   stacks as it does in the question above — and the real `<input>` lies over it with its ink
   transparent, so it takes the tap and the focus and nothing of its own text shows. 16px on the input
   because iOS zooms into anything smaller on focus. IT SITS IN THE BAR'S PAPER FIELD (`.qp-bar`), so
   it is paper ink on no ground of its own; it was a `--sunk` box with a ruled line, 1.04:1 on the card.

   "TYPE YOUR ANSWER" WHILE IT IS EMPTY, drawn here because the input that would carry a placeholder is
   the invisible one. `:empty` is exact: `kpDraw_` draws nothing at all for an empty value, and the
   caret's own span the moment the box has the focus, so the words go as the pad comes up.

   ---------- THE FINGER LANDS ON THE DRAWING, NEVER ON THE BOX (8 Oct) ------------------------------
   *"I just want self contained system really."* The box is `readonly` and `inputmode="none"`
   (keypad.js says why both), and here it is also `pointer-events: none`: a tap goes through it to
   the drawing inside the `<label>`, which keypad.js answers by focusing the box itself and putting the
   caret where the finger was. With nothing editable under the finger, iOS has nowhere to open its
   edit menu, its magnifier or its selection handles -- and the drawing is unselectable and has no
   callout, so a long press on it is a long press on nothing. `touch-action: manipulation`, because two
   quick taps to place the caret must not double-tap-zoom an iPad. NOT `user-select: none` on the box
   itself: older iOS will not let such a field take the focus. */
```

### ---------- A WORDED ANSWER IS DRAWN AS TEXT

before `.kp-field.kp-words > .kp-show`

```
/* ---------- A WORDED ANSWER IS DRAWN AS TEXT ---------------------------------------------------------
   THE MESSAGE BAR'S SHAPE: one line, growing a line at a time to about five, then scrolling inside
   (keypad.js keeps the caret's line in view). Its own newlines kept (`pre-wrap`), a long word broken
   rather than pushing the pill wider than the card. 16px/1.35, which is what the textarea it replaced
   was set in. */
```

### AND A MATHS ONE, which cannot be one `<mark>` -- half a fraction is not an element.

before `.kp-sel-a, .kp-sel-b`

```
/* AND A MATHS ONE, which cannot be one `<mark>` -- half a fraction is not an element. Its two ends are
   empty spans the height of the caret, and the band between them is laid over the drawing
   (`kpSelBand_`, keypad.js) in the same rule colour, MULTIPLIED, so the ink under it stays ink. The
   flex gap a direct child adds is taken back, so selecting does not move the answer sideways. */
```

### A SLOT IS A DASHED BOX, the shape Hegarty draws for "something goes here".

before `.kp-hole`

```
/* A SLOT IS A DASHED BOX, the shape Hegarty draws for "something goes here". In `em` so it is the
   size of a digit whether it sits on the line or up in a power. In the paper's second voice, 5.3:1 on
   the cream -- `--dim` was drawn for the black box and is 2.6:1 there. */
```

### ---------- THE PAD

before `#kp`

```
/* ---------- THE PAD ---------------------------------------------------------------------------------
   ONE PAD ON <body>, FIXED TO THE FOOT OF THE APP'S COLUMN like `#toast` and `#sheet` — inside a pane
   it would ride the pane's transform. Six keys across, in px, because a fingertip does not scale with
   the root font: at 320 that is (320 − 32 − 20) ÷ 6 = 44.7px a key, which is why there are six and not
   seven, and why the gaps stay 4px. Under the toast (50), which still has to be readable while the pad
   is up. */
```

### ---------- LIGHT KEYS ON THE BLACK PAD, FOR SUNLIGHT

before `#kp`

```
/* ---------- LIGHT KEYS ON THE BLACK PAD, FOR SUNLIGHT -------------------------------------------------
   THE OWNER, 8 Oct: *"when using the ipad in the sun its hard to see keypad and each button especially
   backspace, which i thing should be red."* The keys were `--sunk` on black with a `--line` edge:
   1.03:1 for the face and 1.34:1 for the edge, measured, so in glare only the glyphs were left
   floating on nothing. Now every key is a lit face: digits near-white with black ink (18.8:1 against
   the pad, 16.9:1 for the digit), the structures a pale amber with brown ink (16.6:1, 6.3:1) so the
   keys that make a maths answer are still the ones found at a glance, the moves a mid grey with white
   (3.9:1, 5.3:1), ✓ gold. ⌫ IS RED BECAUSE THE OWNER ASKED FOR RED -- and because it is the one key
   that destroys; `--bad` means "something is wrong" everywhere else in this app (`:root`), and this is
   the stated exception. Its glyph is black, 7:1 on that red, where white would be 2.99:1.

   THE PAD'S OWN PALETTE, NAMED ON THE PAD, as the chess board's is on `.chess` (CLAUDE.md): these
   colours are this component's and nothing else in the app should be offered them. `--bad` and
   `--gold` are borrowed by name, because those two ARE the app's. `check/ui.js` holds every key's face
   to 3:1 against the pad (EDGE).

   AND THE PAD ITSELF TAKES NO GESTURE BUT A TAP: `touch-action: manipulation` on the whole pad, not
   only on the keys, because two quick taps in a 4px gap or the 8px edge could double-tap-zoom the page
   on an iPad, which ignores `user-scalable=no`; no selection and no callout, so a held key is a held
   key and not a magnifier. */
```

### PRESSED IS `.is-pressed` AS WELL AS `:active`:

before `.kp-key:active, .kp-key.is-pressed`

```
/* PRESSED IS `.is-pressed` AS WELL AS `:active`: Safari withholds `:active` on touch unless the element
   has a touch listener of its own, and every listener here is on the window (see `pressMark_` in
   shell.js, which puts the class on at `pointerdown`). Without it a key on the iPad gave no sign it
   had been touched. */
```

### ---------- THE LETTERS: THE SAME PAD, TURNED OVER (`abc`)

before `#kp.is-abc`

```
/* ---------- THE LETTERS: THE SAME PAD, TURNED OVER (`abc`) ---------------------------------------------
   THE OWNER, 8 Oct: *"Make the keypad never need to use their own keyboard … I just want self contained
   system really."* `abc` turned the box over to the phone's keyboard; now it turns the pad over to
   these, and `123` turns it back (keypad.js, `KP_ABC`).

   SIXTY COLUMNS, NO GAP BETWEEN THEM, AND THE GAP INSIDE EACH KEY: a transparent 2px border either side
   with the face painted inside it, so a key's box is its whole cell and every pixel of a row is some
   key's -- a letter is narrower than a finger (28.8px at 320), and the 4px between faces is where a
   finger between two of them lands. Five rows at the maths pad's own heights, so the pad does not
   change height when it turns over and the card above it does not move.

   WIDER ON A TABLET: the maths pad keeps the app's column (`--app`), whose 60px keys are plenty; ten
   letters in it would be 38px, so the letters take up to 640px, where they are 60. A width in px for the
   same reason the keys' heights are. */
```

### AN ESSAY'S RETURN (`KP_RETURN`, keypad.js):

before `.kp-key.kp-ret`

```
/* AN ESSAY'S RETURN (`KP_RETURN`, keypad.js): two letters wide at the end of the space bar's row, where a
   phone keeps it, and SAYING "return" under its arrow -- the `↵` alone, a glyph the size of ← and →, was
   the new line nobody found (*"it doesnt let him do paragraphs"*, 9 Oct). The arrow over the word, so
   both fit the 54px face it has at 320. */
```

### ---------- THE LETTER UNDER THE FINGER, SHOWN ABOVE IT

before `.kp-key.kp-ch.is-pressed, .kp-key.kp-ch:active`

```
/* ---------- THE LETTER UNDER THE FINGER, SHOWN ABOVE IT ------------------------------------------------
   A FINGER COVERS A 29px KEY WHOLE, so the key says which it was where it can be seen, as the phone's
   does -- while it is pressed (`.is-pressed`, put on at `pointerdown` by shell.js) and no longer. The
   key itself does not darken: the bubble is the sign, and a darkening under it would be a filter on
   the bubble too. */
```

### ---------- MARK WITH AI

before `.qp-ai.is-busy .qp-verdict`

```
/* ---------- MARK WITH AI ------------------------------------------------------------------------------
   SEND'S PLACE, SEND'S DISC — it is the same act for a worded answer (keypad.js, `aiTile_`). The
   feedback is one sentence UNDER the verdict's line rather than in it, which is one line and is where
   "2 of 3 marks" goes. Greyed, not removed, when the backend says there is no key: the tile stays where
   the student's eye already is and the line under it says why.
   `.qp-ai-go`'s 120px width and its grey disabled fill WERE HERE, for the gold button it was; a tile
   draws its own disabled state (`.tile.is-send[disabled]`), so there is nothing left to say. */
```

### ---------- `.resume` WAS HERE

before `.qans-tiles`

```
/* ---------- `.resume` WAS HERE --------------------------------------------------------------------
   TWO RULES FOR THE "carry on" BLOCK over the funnel's first question. Removed with the feature:
   the owner's answer to it was that persisting an answer is the whole ask, and that is `ansKey_`
   rather than a surface. The entries were `.row.tap.counted` — the funnel's own answer row — so
   nothing here was deleted that anything else uses, which is why this is two lines and a note
   rather than a list of orphaned classes. See the removal note in `js/find.js`. */
```

### ---------- `.qp-who` WAS HERE

before `.qans-tiles`

```
/* ---------- `.qp-who` WAS HERE -------------------------------------------------------------------
   THE "who is this?" CONTROL beside every answer box, which set a typed name the answer key was
   filed under. Removed with its handler: the app already knows who is signed in, and two ways of
   saying who you are is two things to keep in step. See `whoIs_` in find.js. */
```

### THE ANSWER, WAITING -- FOR EVERYBODY.

before `.qans-tiles`

```
/* THE ANSWER, WAITING -- FOR EVERYBODY. `.qans.is-shut` WAS HERE, hiding with `display: none` an
   answer that was in the document -- "still readable by anyone who looks", as its own note said. The
   answer page draws no answer at all until it is shown (`questionAnsCard_`), and it is shown to a
   tutor exactly as to a child: on the tap.

   ONE ROW, ABOVE THE ANSWER, THE SAME HEIGHT SHOWN OR HIDDEN -- *"and can hide them again. simple is
   best."* The tile is Show or Hide and stands in the same place for both, so a thumb that showed it
   finds Hide where it pressed; the sentence beside it is in the dim of a caption, not a warning, and
   the answer arrives under the row rather than pushing the row down. `.qans-wait` (the block that held
   the sentence over a tile under it) went with that order. */
```

### A FIGURE NOBODY HAS DRAWN YET (`figHtml_`):

before `.qfig-missing`

```
/* A FIGURE NOBODY HAS DRAWN YET (`figHtml_`): one line in the card where the picture would stand, in a
   dashed outline -- a known hole, not a figure that failed to load. It was a whole page (`nofig`) until
   figures moved into their cards (356), so it is a line's height now. Screen palette: this is the app
   saying something, not a stand-in for paper. */
```

### ---------- A DIAGRAM YOU CAN WRITE ON

before `.qpad`

```
/* ---------- A DIAGRAM YOU CAN WRITE ON -----------------------------------------------------------
   THE PEN IS OFF UNTIL THE PAD SAYS `is-drawing`, and that is not a nicety. `touch-action: none` is
   what stops a finger scrolling the page while it draws, and a region with it that is taller than
   the phone is a region you cannot scroll past — so the app would trap you on a box-plot grid. Off,
   the ink layer is `pointer-events: none` and the pad is an ordinary picture.

   THE FRAME IS THE MODE MADE VISIBLE. A surface that has quietly taken the finger, with nothing on
   screen saying so, is the funnel "changing its mind" one screen along.

   AND THE OFF STATE HAD NOTHING SAYING SO EITHER, which is the half this paragraph missed for as
   long as it has existed. Off, the pad is an ordinary picture — and on these cards the picture is a
   blank grid, which is the single most inviting thing on the card to put a finger on. The control
   is the padlock now and the picture itself is a door; see `.qpad-art[data-do]` below.

   `.qpad-art` IS THE SHARED BOX. The drawing sizes it (`.qsheet figure svg` rules, 20rem cap) and
   the ink layer is laid over it absolutely, so the two cannot disagree about where the picture is —
   which is the only thing that makes a stored mark land back on the axis it was drawn against. */
```

### ---------- A PEN ON A QUESTION'S CARD

before `.qcard .qpad`

```
/* ---------- A PEN ON A QUESTION'S CARD ------------------------------------------------------------------
   A QUESTION ANSWERED BY DRAWING IS DRAWN ON ITS CARD (356): its figure under the pen among its words, or a
   made-up surface where the box would be (`.qp-area`, `ansArea_`). The owner, 18 Oct: *"why would there be
   an option for text answer in the first place?"* -- so there is no face to switch, and these rules apply to
   every pen on a card rather than to a face of one. 327's and 337's `.qp-area.is-draw` rules were these
   under another selector.
   A MADE-UP SURFACE IS HELD SHORTER THAN THE PAPER'S FIGURES: it shares the screen with the ask and the
   pen's bar, and a square has nothing to read in it, so a cap on its width is a cap on its height. `svh`,
   the smallest the screen is, because the bar a browser hides on scroll comes back exactly when a finger
   is reaching for the row. THE PAPER'S OWN FIGURE IS NOT CAPPED SO (`svg.qsurf` only): it carries labels
   and grid lines at the paper's scale, and its shape is anything from a 35-unit number line to a graph
   nearly twice as tall as it is wide -- a `max-height` would letterbox it and put every mark beside the
   point it was drawn on (the ink is stretched to the box, `padWrap_`). What a card too tall gives up, and
   in what order, is `cardFigFit_`'s (find.js). */
```

### AND THE PICTURE'S BOX HELD TO IT TOO, OR THE INK IS NOT OVER THE GRID.

before `.qp-area .qpad-art:has(> svg.qsurf:first-child)`

```
/* AND THE PICTURE'S BOX HELD TO IT TOO, OR THE INK IS NOT OVER THE GRID. `.qpad-art` is an inline-block sized by
   what is in it, and a picture whose width is a percentage gives a shrink-to-fit box its default 300px; the
   ink layer stretches to that box (`padWrap_`). Wherever the `44svh` cap binds -- a phone on its side -- the
   grid was drawn 141px wide in a 293px box at 568x320, the ink 152px wider than the squares (337's review).
   Upright the cap never binds and this changes nothing. */
```

### ONE LINE OF SMALL PRINT UNDER THE BAR.

before `.qcard .qpad-bar`

```
/* ONE LINE OF SMALL PRINT UNDER THE BAR. "Saved to Ada's account" is the pad's only footnote -- the credit
   that ran on before it went on 18 Oct (355) -- set inline at its own size, so it takes one line of a 568px
   phone and not a body-line's height; `ansSavedPaint_` still rewrites it to "Not saved" in place. */
```

### THE PICTURE IS THE SECOND DOOR, AND IT IS THE ONE A FINGER FINDS.

before `.qpad-art[data-do]`

```
/* THE PICTURE IS THE SECOND DOOR, AND IT IS THE ONE A FINGER FINDS. Measured with real touch
   events on Q7 of the June 2024 Foundation paper: with the pen off, a stroke across the grid took
   the app from `stuff` to `dm` sideways and back a page downwards, and drew nothing — which is the
   report, word for word. A picture that looks exactly like paper and answers a pen by sliding away
   is an affordance that lies, and the remedy sat in a row of three identical grey buttons
   underneath a credit line. `padWrap_` puts the action on `.qpad-art` while the pen is off, so the
   gesture people actually make is a door; a DRAG is still the grid's, because `PRESS_MOVED`
   swallows the click a swipe produces. */
```

### ---------- A FINGER HELD ON THE ARMED CARD SELECTS NOTHING

before `.pane:has(.qpad.is-drawing), .qpad.is-drawing`

```
/* ---------- A FINGER HELD ON THE ARMED CARD SELECTS NOTHING ----------------------------------------------
   iOS SELECTS THE NEAREST TEXT ON A HELD PRESS, `preventDefault` or not (note 301), and the nearest text to
   a pad is the question's own words and the pane's next heading -- a child holding a finger still to aim
   a dot got a selection and a callout instead. So while the pen is on, the pane and the pad are not
   selectable and give no callout: the flappy card's rule (above), the pane as well as the card. ONLY WHILE
   ARMED -- a question is text somebody may want to copy. The pad's own selector is written as well,
   because `:has()` needs iOS 15.4. And a box to type in stays one: on iOS an input inside an unselectable
   box can stop taking a caret (338). */
```

### ---------- `?pen=sizes`: THE LAST EIGHT CONTACTS' WIDTHS, FOR ONE READING ON AN iPAD

before `.pad-sizes`

```
/* ---------- `?pen=sizes`: THE LAST EIGHT CONTACTS' WIDTHS, FOR ONE READING ON AN iPAD ----------------------
   Increment 2's size rules wait for one screenshot of this (338): a fingertip, a palm and a thumb, as the
   device reports them. Shown only with `?pen=sizes` in the address; it presses nothing and says nothing to
   a screen reader. */
```

### THE COMPASS'S POINT AND ITS WIDTH, WHILE IT IS OPEN -- and the ruler's first end.

before `.qpad-aid path`

```
/* THE COMPASS'S POINT AND ITS WIDTH, WHILE IT IS OPEN -- and the ruler's first end. Drawn only during
   a drag (`padAid_`) and never stored, so they are told from a mark by shape rather than by colour:
   the point a fat round dot, the width a dashed line, both in the pen's gold because they belong to
   the hand that is drawing. Widths in screen pixels (`vector-effect` on each), like the pen's. */
```

### ---------- THE LOUPE (357, `padLoupe_`)

before `.pad-loupe`

```
/* ---------- THE LOUPE (357, `padLoupe_`) ---------------------------------------------------------------
   ON `<body>`, fixed, out of every touch's way (`pointer-events: none`) and hidden from a screen reader -- it is
   a magnified copy of what is already on the card. Moved by a transform each frame and never laid out again
   (`contain: strict`), so following the finger costs no layout. The card's own colours, so the picture in it
   reads as the picture; on the whiteboard, the paper's. Its crosshair IS the point the lift keeps. */
```

### ---------- THE BAR IS A ROW OF TILES

before `.tile.is-lead`

```
/* ---------- THE BAR IS A ROW OF TILES ---------------------------------------------------------------
   `.qpad-btn` WAS HERE -- three word buttons 44px tall, the lock on a full-width line of its own in
   gold outline. The owner: *"lock should be a tile too. same as undo and clear. it should all be
   tiles."* So the bar is a `.tile-row` and every control in it a `.tile`, whose 44px square (a
   fingertip in px, not rem), plate and press are `tile_`'s, with nothing to restate here.

   THE LEAD, BECAUSE ARMING IS THE FIRST STEP AND THE OTHERS ARE NOT. A row of identical grey plates
   says nothing about which to press first, while Undo and Clear act on marks that cannot exist until
   the pen is on. So the lock's mark is gold -- what this app means by "the one thing to press" -- and
   armed it is a gold FILL (`.on`), which is the difference between an invitation and a state. A TONE
   and not a rule on `.qpad-lock`, because a tile's `cls` is a name a check finds it by, never a look.

   THE FRAME IS GOLD TOO, FROM THE TOKEN. It was `rgb(242 210 75 / .35)` -- `--admin`'s yellow, copied
   from `.tile.is-admin` with only the `color` changed -- and sampled off a screenshot the border came
   out (95,84,37) round a (255,180,84) padlock: two yellows on one tile, one of them meaning "only you
   can see this" on a control every student sees. */
```

### TWO GROUPS, AND THE ROW BREAKS BETWEEN THEM:

before `.qpad-group`

```
/* TWO GROUPS, AND THE ROW BREAKS BETWEEN THEM: the lock with the tools it arms, then Undo and Clear.
   Measured at 390 with no groups, six tiles wrapped the bin alone onto a second line. The same gap
   inside a group as the row puts between them, so one row of six reads as one row. */
```

### ---------- AN EARLIER PART'S MARKS, WHICH THIS PAGE CANNOT CHANGE

before `.qseen`

```
/* ---------- AN EARLIER PART'S MARKS, WHICH THIS PAGE CANNOT CHANGE ------------------------------------
   "Use your graph" -- see `usesOf_`. Two places: UNDER a pad's own marks (`.qpad .qpad-was`), where
   they must read as the earlier part's and not as this one's, because Undo and Clear will not touch
   them -- the same gold at a little over half strength, so the line of (i) is plainly there and plainly
   not the line you are drawing now; and ON A PICTURE WITH NO PEN (`.qseen`), the page in front of
   "use your graph", where they are the only marks and are read off -- full gold, the pen's own width,
   so a value read from your curve is read from the curve you drew.

   `.qseen` IS THE PAD'S BOX WITHOUT THE PAD: `.qpad-art` and `.qpad-ink` place the ink over the
   picture exactly as they do under a pen, and nothing here takes a finger. */
```

### THE BOX IS AS WIDE AS THE PICTURE, SAID OUTRIGHT:

before `.qseen .qpad-art`

```
/* THE BOX IS AS WIDE AS THE PICTURE, SAID OUTRIGHT: `.qpad-art` is an inline-block sized by its drawing,
   and a drawing whose width is a percentage has no width of its own to give it -- in the Figure sheet
   (`q-fig`) the box took the sheet's 291px while the grid stopped at 270, so the ink layer, stretched
   to the box, put the child's curve 21px off the grid it was drawn on. The cap the drawing has
   (`.qpad-art > svg`) moves to the box, and the drawing fills it. */
```

### ---------- THE WHITEBOARD: THE PEN ABOVE, ON A BLANK SHEET OF PAPER

before `.wb`

```
/* ---------- THE WHITEBOARD: THE PEN ABOVE, ON A BLANK SHEET OF PAPER ----------------------------------
   `WB_ITEM` in find.js is the argument for it being this pen rather than a second one, so everything
   above applies unchanged -- the frame, the `touch-action` that only an armed pad carries, the bar.
   What is the board's own is its paper and its shape.

   PAPER, FROM THE TOKENS. It stands in for a physical board, which is the second palette's job (the
   receipt, the calendar, the splash); and the ink is `--paper-ink`, not the pen's gold. Gold is right
   on a question because the figure is printed in `currentColor` and your line must be told from its
   axis. Here nothing is on the board but you, and gold on cream is a line you can hardly see.

   ONE SHAPE, ALWAYS 3:4, AND THAT IS A PROMISE TO THE MARKS ALREADY STORED. The ink is stretched to its
   box (`preserveAspectRatio="none"`, see `padWrap_`): 340 units across and 340 down, whatever the box.
   A board that was the card's width and the screen's height would be a different shape on every
   phone and on the same iPad turned round, and every stroke on it would be stretched with it --
   yesterday's circle back as an ellipse. So the shape is fixed and only the SIZE follows the screen.
   3:4 is the iPad's own, and on a 320x568 phone it is the shape that is still the card's full width.
   Changing it later redraws every board anybody has, squashed; it wants a stored shape first.

   THE WIDTH IS THE CARD'S, UNTIL THE SCREEN IS TOO SHORT FOR THAT. `.pane` is capped at the screen
   (`100dvh` less 2.5rem), and a board taller than what is left under the heading would push the bar
   out of the bottom of a pane that clips -- a padlock you cannot reach, on a board you cannot draw on.
   So the board is at most as tall as the screen less `--wb-chrome`, everything else the card holds
   at that height: the pane's cap and padding, the card's padding, the star's row, the heading, the
   bar and the note. Two 44px rows of tiles in px (a fingertip, CLAUDE.md), the rest in rem, MEASURED
   signed in at 320x568, 390x844, 768x1024, 1280x800 and 1920x1080 as the screen's height less the
   most the board could have been without the pane clipping: 88px and 13.13 to 13.16rem every time,
   so 13.6 leaves about six pixels to spare. Signed out there is no star, and the board simply has
   44px more than it needs. At every one of those five sizes the WIDTH decides (the board is the
   card's width, 3:4); the cap is for the screen that is wide and short -- a laptop at 720, measured:
   a 316x421 board in a pane 674px inside its 681 -- and a phone on its side, where the board is small
   but the bar is still there. Without it the bar is the first thing cut off. `check/ui.js
   --screen=tools` measures the pane at all five, and the whiteboard's state in check/states.js puts a
   drawing on it there. */
```

### A LINE THAT RUNS OFF THE PAPER STOPS AT ITS EDGE, as a pen does at the edge of a sheet.

in `.wb .qpad-art`

```
/* A LINE THAT RUNS OFF THE PAPER STOPS AT ITS EDGE, as a pen does at the edge of a sheet. The pen
     captures the finger so a stroke survives leaving the picture (`pointerdown`), and `.qpad-ink` is
     `overflow: visible` so a question's line of best fit can run to the axis's end -- so on the board
     a drag off the side drew on across the gold frame and over the card, dark on dark (found by the
     review, 10-edges). The points past the edge are still stored, and clipped the same way wherever
     the board is drawn again, which is what paper does with a pen that went off it and came back. */
```

### CLEAR OF THE FRAME. Locked, the gold outline stands 6px outside the paper (`outline-offset: 4px`, 2px wide), and the tile row's own .5rem left it a pixel from

before `.wb .qpad-bar`

```
/* CLEAR OF THE FRAME. Locked, the gold outline stands 6px outside the paper (`outline-offset: 4px`,
   2px wide), and the tile row's own .5rem left it a pixel from the padlock -- a frame round the whole
   page reads as touching the controls under it. The extra .35rem is in `--wb-chrome`. */
```

### ---------- ON ITS SIDE, THE BOARD TAKES THE HEIGHT AND EVERYTHING ELSE GOES BESIDE IT

before `@media (orientation: landscape) and (max-height: 500px)`

```
/* ---------- ON ITS SIDE, THE BOARD TAKES THE HEIGHT AND EVERYTHING ELSE GOES BESIDE IT ------------------
   FOUND BY BOTH REVIEWS OF THE BOARD: a phone on its side drew it as a postage stamp -- 16x21px at 568x320
   (an iPhone SE turned round), 55x74 at 667x375, 68x91 at 844x390 -- because the cap above takes the
   star's row, the heading, the bar and the note off a screen that is only 320 to 430px tall, and what
   was left was ten pixels of board. Nothing was cut off, which is what the cap was for, and nothing
   could be drawn either. The note above said "small but the bar is still there"; it was smaller than
   a fingertip.
   THE SHAPE CANNOT GIVE WAY (the 3:4 note above), SO THE LAYOUT DOES. A wide, short card has room across
   and none down, so the board takes the card's whole height on the left and the star, the heading, the
   bar and the note stand in a column beside it. `display: contents` on the four boxes between the card
   and them (the slot, `.wb-box`, `.wb`, `.qpad`) makes them all items of ONE grid without a line of
   markup changing -- the same markup the portrait card and the Saved column draw. The height is the
   pane's cap less what lies between it and the card's content: the pane's border and padding (2px and
   1.85rem), the card's (2px and 1.8rem), and three pixels to spare -- `--wb-side`.
   MEASURED after, signed in and out, in a phone-shaped context (`hasTouch`, `isMobile`): the board
   163x218 at 568x320, 205x273 at 667x375, 216x288 at 844x390 and 246x328 at 932x430; every tile 44x44,
   nothing past its pane, no zoom from `paneReach_`. A portrait 320x568 phone's is 218x290 -- the same
   order of thing rather than a stamp. The heading's own margins are cut to .45rem here, because at
   568x320 the column beside the board (the bar in two rows) is otherwise the taller of the two and
   `paneReach_` drew the whole card at 0.94, the tiles at 41px.
   500px TALL AND UNDER, ON ITS SIDE: every phone turned round, and no tablet or laptop -- a laptop at
   720 keeps the portrait card with its cap, which there leaves a 316x421 board. */
```

### ---------- A PASSAGE THAT IS ITS OWN ANSWER SURFACE: RING A WORD BY TAPPING IT

before `.qsheet-part.is-text .qsheet-pb`

```
/* ---------- A PASSAGE THAT IS ITS OWN ANSWER SURFACE: RING A WORD BY TAPPING IT ----------------------
   "Circle the three adjectives in the passage below." `circWords_` makes every word of the part a
   tap target; see it for why a tap and not a pen.

   THE LINES OPEN UP AND THE WORDS DO NOT MOVE. A ring drawn with `outline` takes no space, so ringing
   a word moves nothing beside it -- a passage that reflowed under the finger at every tap would put
   the next word somewhere else. The extra line height is room for the ring above and below, and for
   the HIT AREA: vertical padding on an inline box grows what a finger can hit without moving a single
   line, which is as close to the 44px rule as a word in a sentence can come. In px, for that rule's
   reason. See `ACCEPTED_TAP` in check/ui.js for the rest of the argument.

   GOLD, BECAUSE IT IS YOURS -- the pen's ink (`.qpad-g path`) is gold for the same reason: the paper's
   own ink is `currentColor`, and a mark you made has to look like one. */
```

### THE HIT AREA IS A PSEUDO-ELEMENT AND NOT PADDING, because an outline is drawn round the padding box:

before `.qsheet-part.is-text .qsheet-pb`

```
/* THE HIT AREA IS A PSEUDO-ELEMENT AND NOT PADDING, because an outline is drawn round the padding box:
   the first version padded the word and its ring came out a tall lozenge reaching into the lines above
   and below, round the space as much as the word. The `::before` belongs to the span for hit-testing
   and to nothing for drawing, so the ring hugs the word and the finger still gets the line's height. */
```

### ---------- ARTICULATE

before `.art`

```
/* ---------- ARTICULATE ---------------------------------------------------------------------------
   THE WORD IS THE WHOLE CARD, because the one thing somebody is doing with this screen is reading
   a word across a table to somebody else. Everything round it — the category, the clock, the count
   — is small on purpose.

   ITS OWN COLOURS, DECLARED ON THE COMPONENT, which is the rule the house style states with the
   chess board's cream and charcoal: a colour that belongs to ONE thing is named on that thing
   rather than offered to a black-and-gold stylesheet. Articulate's board is six coloured wedges and
   the categories are the game's own convention, not this app's. */
```

### ---------- ONE BUTTON, NOT SIX

before `.art-go`

```
/* ---------- ONE BUTTON, NOT SIX ------------------------------------------------------------------
   `.art-cat` WAS HERE — the six category chips. The owner's note is the whole argument: "less
   friction if it just decides topic and the thing". A menu between somebody and a party game is a
   decision nobody wanted to make, and on the board the category is decided by where your counter
   lands rather than by choosing. `roundPick_` chooses; the chip on the card says which came up.

   44px, IN PX, and it is the only thing on the card you press to begin — so it is bigger than the
   floor rather than at it. A fingertip is the one measurement here that does not scale. */
```

### ---------- IMPOSTER

before `.imp-count`

```
/* ---------- IMPOSTER -------------------------------------------------------------------------------
   THE ARTICULATE CARD, BECAUSE IT IS THE SAME OBJECT: one thing read across a table, with a gold
   button under it. What is new is the player count, the Read aloud switch, the speaker, and — since
   the owner's 11 Oct *"Add symbols to imposter"* — a picture over every word.

   THE STEPPERS ARE 44px IN px, the one measurement here that does not scale, and a real circle so
   `−` and `+` read as controls rather than as the maths symbols they also are. */
```

### `.imp-pass` IS THE PARTY GAMES' SENTENCE NOW AND NOT IMPOSTER'S.

before `.imp-pass`

```
/* `.imp-pass` IS THE PARTY GAMES' SENTENCE NOW AND NOT IMPOSTER'S. It was the line that handed this
   card on ("Hand the phone to Player 2", "Nobody else knows. Blend in.", "goes first. One word each,
   round the circle — then vote."), and the owner, 8 Oct: "info over load on the reading parts". No
   sentence is written on this card any more; the timed games' paused card (`partyHeld_`) and 20
   Questions' hand-over still borrow the rule, so it stays, under the name it was born with. */
```

### ---------- THE BIG LINE AND THE BUTTON STAY WHERE THEY ARE

before `.imp-lab`

```
/* ---------- THE BIG LINE AND THE BUTTON STAY WHERE THEY ARE ------------------------------------
   PASS, CARD, IMPOSTER AND PLAY ARE ONE FRAME — picture, big line, small line, button and, with
   Read aloud on, the speaker's room, drawn by `impFrame_` with a slot left empty rather than left
   out — and these rules are what make an empty slot keep its height. It is the CARD'S height that
   has to hold, not just the order inside it: the column centres the whole widget in the pane, so a
   card 72px taller puts its button 36px higher on the glass. The first version hung the card from its
   top instead, and the screenshots at 320 and 390 showed Hide 36px above where Show had been.

   THE BIG LINE HOLDS TWO LINES' ROOM, centred in it, because "computer programmer" wraps on a 320px
   phone and "pizza" does not — and a big line that grew with its word would move the button under
   it between one player and the next. `em`, so it is two lines of whatever `.art-word`'s clamp made.
   (The small line is `.art-cat-of`, `.7rem/1`, so an empty one is held at exactly a full one.) */
```

### THE PICTURE OVER THE WORD — an emoji, big enough to be the card for a child who cannot read the word under it, and drawn on the reveal over the word as well.

before `.imp-sym`

```
/* THE PICTURE OVER THE WORD — an emoji, big enough to be the card for a child who cannot read the
   word under it, and drawn on the reveal over the word as well. A FIXED HEIGHT, in `em` of its own
   size, and NOT a floor: the hand-over draws this slot empty, and the card has to be one height with
   a picture or without (see above). A height rather than a line-height alone because a colour-emoji
   font's ascent and descent are its own, and Noto's and Apple's are not the same box.

   `rem`, NOT `px`, because it is not a tap target: nobody presses the picture, and it should grow
   with the type it stands over. THE FONTS NAMED, emoji first: the app's own face is monospace, and a
   monospace font that carries a plain ♠ or ✖ would win over the coloured one for the cards whose
   picture is one of those older symbols — a black outline where everybody else's card has colour. */
```

### AND A HAIRLINE OF `--ink` ROUND EVERY PICTURE, because some of them are drawn in black and this card is nearly black.

before `.imp-sym`

```
/* AND A HAIRLINE OF `--ink` ROUND EVERY PICTURE, because some of them are drawn in black and this card
   is nearly black. Measured in Chromium with Noto on the card at 390 (the review of 11 October), as
   the share of a picture's drawn pixels reaching 3:1 against the card: ♠️ 0%, ♣️ 0%, 🕸️ 0%, 🕶️ 3%,
   ➖ ➕ 4%, ➗ ✖️ 🧥 8% — a dark shape on a dark card, for the child the picture is for. Apple's font,
   on the family's iPads, draws ♠ ♣ ➕ ➖ ➗ and the music notes in solid black. TWO `drop-shadow`s
   of the token, each a fiftieth of the picture, rather than a disc of paper behind it: a disc is a
   second shape on the card and paper is the other palette; an outline only shows where the picture
   would have vanished into the card, and is a sticker's edge on the ones that never did. NOT
   `color-mix()` for a softer glow: an iPad on iOS 15 drops the whole declaration over it. */
```

### THE IMPOSTER'S "?" — see `impFrame_`:

before `.imp-sym.is-imp`

```
/* THE IMPOSTER'S "?" — see `impFrame_`: the one word on the imposter's card a child who cannot read
   needs, said as a mark learnt once. Gold on the app's black, the colour of the one action; set on
   the picture's lower right, INSIDE the picture's slot, so the card keeps its height and is still a
   big picture over a line of text from across the table. In `rem` — it is not pressed, and it
   should grow with the picture it sits on.

   SET FROM THE PICTURE'S OWN RIGHT EDGE, INSIDE ROOM MADE FOR IT, not from its middle. `.art` centres
   its children, so this box is exactly as wide as the emoji, and the first version (`left: 50% +
   1rem`) hung the mark 5px past it: `check/ui.js` reported the picture scrolling sideways at 320 and
   390. Padding on both sides, so the emoji stays in the middle of the card. */
```

### SHOW AND HIDE CARRY A MARK, an open eye and a shut one from `TILE_ICONS`, for the children who know the button by picture.

before `.imp-go`

```
/* SHOW AND HIDE CARRY A MARK, an open eye and a shut one from `TILE_ICONS`, for the children who
   know the button by picture. A floor on the width so the two are the same gold shape in the same
   place, and a target that is a thumb whatever word is in it. */
```

### LISTEN IS THE BIGGEST THING A CHILD PRESSES HERE, and round, the speaker every phone puts on its volume.

before `.tile.is-listen`

```
/* LISTEN IS THE BIGGEST THING A CHILD PRESSES HERE, and round, the speaker every phone puts on its
   volume. 64px in px, under the button and never instead of it. Gold, because on this card it is the
   one action a non-reader is looking for; tokens only (`check-css` refuses a `.tile` colour spelt out).

   20px CLEAR OF HIDE, IN px, because it is a gap between two fingertips and a fingertip does not
   scale. It was the card's `.5rem` gap, 7.4px at 390 (Hide's bottom 559.9, Listen's top 567.3), and
   Hide is the one press here that cannot be taken back — it hands the round to the next player. A
   small finger aimed at the top of the speaker was a finger on Hide. */
```

### ---------- THE READ ALOUD SWITCH IS A TILE, AND HAS NO RULE HERE

before `.party-clock`

```
/* ---------- THE READ ALOUD SWITCH IS A TILE, AND HAS NO RULE HERE -----------------------------------
   IT WAS A PILL OF ITS OWN — the speaker, the words, a sliding knob gold when on — and on 10 Oct the
   owner's *"the sound on or off should be a tile like everything else"* made it `tile_()` (games.js,
   `impAloudTile_`, note 323): the reels' `sound` / `mute` pair, `.tile.on` for the eye and
   `aria-pressed` for a screen reader. Its 44px, its plate and its press are `.tile`'s, so nothing is
   left to say here; `.imp-aloud` is the name it is found by, never a look (see `tile_`'s `cls`). */
```

### ---------- JUST A MINUTE, TABOO, HOT SEAT, 20 QUESTIONS

before `.party-clock`

```
/* ---------- JUST A MINUTE, TABOO, HOT SEAT, 20 QUESTIONS ----------------------------------------------
   THE ARTICULATE CARD AGAIN, for Imposter's reason: one thing read across a room, with a gold button
   under it. What is new is a clock big enough to read from the back of the room and Taboo's five
   forbidden words. (Alibi's case and question list had rules here too, and went with the game.)

   THE CLOCK IS `--mono`, so the digits do not change width as they count and the line does not
   twitch four times a second. */
```

### THREE TALLIES ACROSS A 320px CARD is about 80px each, and "Repetition" at a button's own size is wider than that — so the name is small and the count under it

before `.btn.party-call`

```
/* THREE TALLIES ACROSS A 320px CARD is about 80px each, and "Repetition" at a button's own size is
   wider than that — so the name is small and the count under it is the large thing, which is also
   the half somebody glances at. Still a 52px target, in px. */
```

### EACH ONE IN ITS OWN OUTLINE, because five words wrapped across two lines with only a space between them read as a sentence

before `.tab-ban li`

```
/* EACH ONE IN ITS OWN OUTLINE, because five words wrapped across two lines with only a space between
   them read as a sentence — "science experiment school project show" — and the describer needs five.
   A dot between them was the first try and left a dot at the start of the second line. Not a
   control: nothing here is pressed, so it is an outline and not a 44px chip. */
```

### SHARING A BOOKING IS A PICTURE OF IT — THE ELEMENT ON THE SCREEN, DRAWN BY THE BROWSER.

before `.rc.rc-snap .rc-tiles, .rc.rc-snap .rc-more`

```
/* ==================================================================================================
   SHARING A BOOKING IS A PICTURE OF IT — THE ELEMENT ON THE SCREEN, DRAWN BY THE BROWSER.

   ASKED FOR AS *"just make sure sharing booking is an identical jpg or png or whatevers best of the
   booking reciept."* It was a print (`body.printing-rc`, A4, `--rc-k` scaling the card onto the
   sheet) and before that a canvas that redrew the card; both are gone, and the whole account is over
   `on('book-share')` in receipt.js.

   `.rc-snap` IS ON THE CARD FOR ONE SYNCHRONOUS TASK — measured, cloned, taken off — so it is never
   painted. It hides the same two things the print hid: the tiles, because a picture of a Send button
   is a control nobody can press, and an admin's `Tutor earns` / `Admin earns`, because sharing is for
   somebody else and those two lines must not travel. `Client pays` stays: it is what the document is
   about. Hidden with `display: none` rather than cut from the clone, so the card is MEASURED without
   them and the picture's height is the height of what is in it.
================================================================================================== */
```

### ---------- THE TUTOR AGREEMENT (DRAFT)

before `.agree-draft`

```
/* ---------- THE TUTOR AGREEMENT (DRAFT) ---------------------------------------------------------
   A Settings card (see `agreementCard_` in me.js). The admin's cut card that sat beside it went to each
   tutor's own card in docs/history/345, and its one rule with it. The draft mark is its own
   class rather than `.chip`, which is the funnel's 44px filter with a ✕ on it. The list is small
   type because it is ten sentences on one pane; a locked box recedes so it reads as done rather
   than as a control waiting for a tap. */
```

### ---------- BUSINESS RECORDS: ADMIN PAGES OF THE SETTINGS COLUMN — see js/records.js

before `.biz-item + .biz-item`

```
/* ---------- BUSINESS RECORDS: ADMIN PAGES OF THE SETTINGS COLUMN — see js/records.js ------------
   A caption per item with its boxes side by side on `.lib-row`, which is the library shelf's shape,
   so the page reads like every other settings card. The caption carries what the date MEANS, in the
   faint ink, because a date input draws no placeholder; and a flag, in the colour of how late. */
```

### ---------- CHECK UPLOADS: AN ADMIN TOOL — see `uploadsHtml_` in me.js

before `.up-list`

```
/* ---------- CHECK UPLOADS: AN ADMIN TOOL — see `uploadsHtml_` in me.js -----------------------------
   Four questions, each a mark and a sentence. The mark is a ✓ or a ✗ AND a colour, never the colour
   alone; the sentence under each label is the server's, so a long folder name or a Google error has
   to wrap rather than push the card sideways. The steps are an ordered list because their order is
   the point — the Allow before the new version, the new version before checking again. */
```

### ---------- WHERE A TUTOR TUTORS, AS A HEAT MAP — see `profHeat_` in cards.js

before `.prof-heat`

```
/* ---------- WHERE A TUTOR TUTORS, AS A HEAT MAP — see `profHeat_` in cards.js ---------------------
   A fixed-height window onto map tiles placed in pixels from its own centre. The tiles are 256px
   CSS pixels from OpenStreetMap. They and the glows are background layers of two children of the
   box (see `profHeat_` for why not elements); the glows are listed first, so they paint on top, and
   where two venues are close their gradients overlap into a warmer patch — which is what makes it a
   heat map rather than a scatter of pins. Nothing in it is pressable. */
```

### TWO LAYERS, because the tiles are filtered and the glows must not be.

before `.prof-heat .heat-tiles, .prof-heat .heat-glow`

```
/* TWO LAYERS, because the tiles are filtered and the glows must not be. OpenStreetMap's standard
   tiles are light; inverting them and turning the hue back round gives a dark street map in the
   app's own palette, and the orange glows go on a separate layer above so they keep their colour. */
```

### ---------- A TUTOR'S WEEK ON THEIR CARD — see `profAvail_` in cards.js

before `.prof-week .slot-grid`

```
/* ---------- A TUTOR'S WEEK ON THEIR CARD — see `profAvail_` in cards.js ----------------------------
   The receipt's week, read rather than answered: the cells are disabled buttons, so they do not
   take the pointer, shrink when touched or look like something to tick. SLIMMER THAN THE SETTINGS
   WEEK, which is square because it is a page of its own; this is the last thing on a card that is
   already near its pane's height. A day nobody works is not drawn at all — the owner, 10 Oct: *"no
   need to display monday if they dont have any hours on monday"* — so the two `is-shut` rules that
   made it a thin rule have gone. A busy hour is `shut` like an hour they do not work — both are
   hours that cannot be booked — and has a look of its own on top (`is-busy`, below). */
```

### THE ARROW, BY SPECIFICITY AND NOT BY ORDER.

before `.prof-week .hr:not(.shut), .prof-week .hr.shut`

```
/* THE ARROW, BY SPECIFICITY AND NOT BY ORDER. `.hr.shut` gives a shut hour `not-allowed` everywhere
   else, and the plain `.prof-week .hr` matched it at the same weight, so only coming later made it
   win — `check/cascade.js` names exactly that. Nothing here is pressable, shut or open, so both say
   default at a weight `.hr.shut` cannot reach. */
```

### ---------- A TAUGHT HOUR LOOKS TAUGHT, BECAUSE A WHOLE DAY CAN BE KEPT FOR IT

before `.prof-week .hr.is-busy`

```
/* ---------- A TAUGHT HOUR LOOKS TAUGHT, BECAUSE A WHOLE DAY CAN BE KEPT FOR IT --------------------
   IT WAS THE SAME DARK CELL AS AN HOUR NEVER TICKED, and the difference lived in the `title` — which
   a phone never shows. That cost nothing while every day was drawn. Since the owner, 10 Oct, *"no
   need to display monday if they dont have any hours on monday"*, a day is drawn BECAUSE it has a
   ticked hour, and a Thursday whose only ticked hour is already taught came out as ten identical
   empty cells: exactly the row of nothing the owner asked to drop, kept on purpose and saying so to
   nobody. Found in the review's screenshot of a tutor ticked Thu 16 and Fri 10, teaching Thu 16.

   SO IT IS THE HOUR, STRUCK THROUGH. A gold edge says "one of their hours" — the same gold as a lit
   one — and the hatching across it says "and gone", which is the convention for a slot that is
   taken. Full opacity rather than `.hr.shut`'s .28, or the hatch is too faint to read at 12px tall.
   ONE KEY UNDER THE WEEK says it in words (`.prof-key`), drawn only when a taught hour is, because a
   pattern nobody has been told about is only a different kind of guess.

   ON THE CARD AND NOWHERE ELSE. The booking form greys a taught hour too, but there it sits in a
   week that draws every hour of every worked day and says why in its own sentence; this is the one
   week where a day exists only to show an hour. Three classes deep, so it beats `.hr.shut` by
   weight and not by being written later — `check/cascade.js` names a tie won by order. */
```

