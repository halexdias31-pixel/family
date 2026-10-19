# check/states.js

The full text of comments in `check/states.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/states.js THE STATES A SCREEN CAN BE IN, DECLARED ONCE AND READ BY BOTH INSTRUMENTS.

top level, before `STATES`

```
/* ==================================================================================================
   @family. — check/states.js

   THE STATES A SCREEN CAN BE IN, DECLARED ONCE AND READ BY BOTH INSTRUMENTS.

   `check/ui.js` MEASURES whether a screen can be read and hit; `check/press.js` PRESSES it and asks
   whether anything happened. They are two questions about the same nine screens, and both of them
   were blind in the same way before states existed: a screen has more than one, and `go(id)` only
   ever shows the one it opens in.

   THIS LIVES IN ITS OWN FILE BECAUSE A SECOND COPY WOULD DRIFT. That is the sentence this
   repository has already written about `documents_()`, about `paperIdOf_`, about `factsNow_` and
   about `childrenOf` — two readers of one fact are two chances to disagree about it, and here the
   disagreement would be silent in the worst direction: a state added for the measuring pass and not
   the pressing one is a surface nobody presses, which is exactly the hole the booking grid lived in.

   EVERY FUNCTION HERE RUNS IN THE BROWSER, not in node. They are passed across as source
   (`String(state.enter)`) and evaluated in the page, so they may use the app's own globals — `go`,
   `paint`, `openSheet`, `STUFF`, `MESSAGES` — and may not use anything from this file.
================================================================================================== */
```

### A SCREEN IS NOT ONE PICTURE, AND THIS FILE HAD ONLY EVER TAKEN ONE OF EACH.

top level, before `STATES`

```
/* ==================================================================================================
   A SCREEN IS NOT ONE PICTURE, AND THIS FILE HAD ONLY EVER TAKEN ONE OF EACH.

   `go(id)` PUTS A SCREEN IN FRONT OF YOU IN THE STATE IT OPENS IN, and for the Find screen that
   state is the funnel's question — a search box, some chips and a short list of answers. The
   RESULTS are pages you swipe to, and they are where every question card in the library is drawn.
   So this check has measured 72 combinations, on every run, for as long as it has existed, and
   NEVER ONCE RENDERED A QUESTION. The app's largest surface, four thousand rows of it.

   IT COST EXACTLY WHAT YOU WOULD EXPECT. Fifty-one questions carry the printed paper's dotted
   answer line, the longest 128 characters with no space in it — one unbreakable word that took the
   card, the pane and the page sideways at every width. `check/ui.js` measures sideways scroll and
   would have named it on the first run. Nothing did, because nothing ever turned the page.

   THIS IS THE `check-flow` STUB AGAIN, AND THE `check-booking` PATH BEFORE IT: a check that cannot
   reach its subject reporting a pass. The count in the summary said 72 combinations and meant it;
   what it did not say is that 72 combinations is nine screens seen once each.

   SO A SCREEN DECLARES ITS STATES. A state is a name and a line of the app's own code — no new
   navigation, no reaching past `go()`, just the same calls a finger would make. Anything not listed
   here is measured exactly as it was before, in the one state it opens in.

   AND A STATE THAT DOES NOT ARRIVE FAILS LOUDLY, for the same reason the signed-in seed does: a
   search that finds nothing would render an empty results page and report it as a clean sweep of
   the library. It asserts what it expects to be looking at. */
```

### A WORD THAT IS IN THOUSANDS OF QUESTIONS, so the results are real cards rather than a lucky one.

in `stuff`

```
/* A WORD THAT IS IN THOUSANDS OF QUESTIONS, so the results are real cards rather than a lucky
       one. `goPage` is what the pager calls, and `stuffFirstResult_` is the app's own answer to
       "which page is the first result" — asking it rather than assuming page 1 is the whole
       reason that function exists. */
```

### ---------- AND THE SECONDS BEFORE THE LIBRARY LANDS

in `stuff`

```
/* ---------- AND THE SECONDS BEFORE THE LIBRARY LANDS ---------------------------------------
       REPORTED AS "when i click on questions it takes long to load". Measured on a 1.6 Mbps link
       at 4x CPU: `data/questions.json` is 605 KB gzipped, its body takes about eight seconds, and
       for every one of them the Find screen read "Nothing in the shop or the library yet." — this
       repository's oldest fault, on its main screen, on every first visit.

       `LIBRARY_ROWS` IS THE STATE AND IT IS THE APP'S OWN. `null` until the file lands, `[]` when
       it legitimately holds nothing — so this seeds through the same door the boot uses rather
       than inventing a flag, which is what every other state here does. The memo has to go with
       it, or `stuffItems` hands back the list it built when the library WAS there.

       `leave` PUTS IT BACK, because states run in order down one page and every state after this
       one would otherwise be measuring an app with no library. */
```

### EVERY LIST, NOT JUST THE QUESTIONS.

in `enter`

```
/* EVERY LIST, NOT JUST THE QUESTIONS. CLAUDE.md records why the empty-state branch is hard
           to reach at all: "on this site the list is NEVER empty, because the payload carries
           tutors and venues" — so clearing `DATA.questions` alone leaves the funnel drawing a
           question about three venues and this state measures the wrong screen. Before `load()`
           has finished, nothing is there; that is what this is. */
```

### EVERY MEMO, AND `DATA` IS WHAT THEY ARE KEYED ON.

in `enter`

```
/* EVERY MEMO, AND `DATA` IS WHAT THEY ARE KEYED ON. `stuffItems` and `stuffFiltered` both
           hold `from: DATA` by object identity, so emptying its arrays leaves all three handing
           back the 5,587 items they built when the payload was whole -- which is a state the app
           is never in and would have measured the wrong screen.
           `stuffForget_` RATHER THAN THE THREE BY NAME: there are two finders now (docs/history/329), and
           the names are the bound one's; the app's own forgetting empties every finder's. */
```

### THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN — the owner, 9 Oct:

in `stuff`

```
/* THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN — the owner, 9 Oct: *"They should all have a
         simplistic simple loading thing."* It said "The questions are still coming" until then. Still
         never "nothing in the library", which is what this state was written to stop. */
```

### ---------- AND THE FUNNEL SEVERAL ANSWERS DEEP

in `stuff`

```
/* ---------- AND THE FUNNEL SEVERAL ANSWERS DEEP -------------------------------------------
       THE FIRST QUESTION IS "WHAT FOR" AND ITS ANSWERS ARE ONE WORD EACH. Every answer row this
       check had ever measured was `Learning`, `Shop`, `Games` — so the row layout was proved
       against the shortest labels in the app and nothing else. Six answers down it is asking about
       TOPICS, where an answer is "Angles in Triangles & Quadrilaterals", and that is where the row
       was clipping its own text.

       THE PATH IS THE ONE FROM THE COMPLAINT, including the skipped question, because a state
       reached by a route nobody takes is a state nobody is in. */
```

### `Level · SATs` AND THEN `Key stage · KS2`.

in `STUFF.filters`

```
/* `Level · SATs` AND THEN `Key stage · KS2`. This was `Key stage · KS2`,
                            then `Level · KS2 SATs` when a primary sheet's key stage became its
                            qualification -- *"I prefer GCSE or SATs over grey areas"* -- and is two
                            answers now: *"sats is one tag not ks2 sats"*. The level is SATs and
                            Key stage is asked inside it, and only there (see `keystage` in find.js). */
```

### ---------- AND THE CHIPS SAY ONLY WHAT WAS CHOSEN, WITH CLEAR BESIDE THE BOX

in `stuff`

```
/* ---------- AND THE CHIPS SAY ONLY WHAT WAS CHOSEN, WITH CLEAR BESIDE THE BOX ----------------
         The owner, 8 Oct, on a pupil's iPad: *"i dont need the category of the tag to appear with the
         choisen option in the finder"*, and *"clear button looks like a tag which it isnt."* This is
         the state both were said about — seven chips, one of them a skip — so this is where the
         pictures are asked for: no field name on any chip, Subject's chip `Maths✕` and nothing more
         (still in Subject's colour), the skip saying `Any school year✕`, and Clear the pen's bin tile in
         its slot beside the search box, not a chip among the tags. `check/ui.js` measures that tile's
         reach and contrast here like every other control. */
```

### ---------- THE SITTING, ASKED AS THE YEAR AND THEN THE MONTH

in `stuff`

```
/* ---------- THE SITTING, ASKED AS THE YEAR AND THEN THE MONTH ------------------------------------
       REPORTED AS "some tags are like summer 2018 when it should just be summer then 2018", and as
       "they dont need to appear one above the other but can fill like from left to right". Then the
       season went: "I don't want it to ask summer or autumn I'd rather it just do the months. Like
       may or November" -- and the year comes FIRST, as the outer folder. So these are two states,
       one for each folder: Higher chosen and the question on the page is Year, its answers bare
       years; then 2017 chosen and the question is Month, its answers bare months.

       THE EXPECT ASKS THE THINGS A SCREENSHOT SHOWED, because none is a measurement any rule in
       check/ui.js makes: no answer carries a month and a year together, no answer is a season, and at
       least two answers sit on one line — chips stacked one per row measure perfectly and are the
       shape that was reported. (`Topic area` and `Topic` were skipped here with Doesn't matter until
       a past paper stopped answering either — see `topicArea WAS HERE` in find.js.) */
```

### ---------- THE PAPER FOLDER WITH THE YEAR SKIPPED

in `stuff`

```
/* ---------- THE PAPER FOLDER WITH THE YEAR SKIPPED ------------------------------------------------
       *"Fix this why it say June and year in same chip"* — with `Doesn't matter` on Year and a month
       pressed, the Paper answers read `Paper 1 — May 2017 | Paper 1 — May 2018 | …`: the month the
       person had just chosen, said again on every answer, fused to the year. Now they read `Paper 1 ·
       2017 | Paper 1 · 2018 | …`, the half nobody has said. GCSE Higher in May is the route that
       draws them as answers rather than letter ranges: four sittings, one Paper 1 each. */
```

### ---------- A PAPER CHOSEN, AND NOTHING MORE ASKED

in `stuff`

```
/* ---------- A PAPER CHOSEN, AND NOTHING MORE ASKED -----------------------------------------------
       ASKED FOR AS *"no more asking for questions 1-10 or question part 1 or b."* This route used to go
       on to `Question number 1–10 | 11–20 | 21–30`, then `1–2 | 3–4`, then `1 | 2`. Now the paper is the
       last folder (`FACET_ENDS`): the funnel page draws no answers and says to swipe up, and the next
       page is the paper's first question. The state turns to that page, so the card a thumb lands on
       is what gets measured — and the funnel page is asked about from there, since it is still in
       the strip. */
```

### AND THE CARD'S SITTING IS TWO TAGS, `2017` THEN `June` — *"Fix this why it say June and year in same chip"* was a screenshot of one purple `June 2024` pill on

in `stuff`

```
/* AND THE CARD'S SITTING IS TWO TAGS, `2017` THEN `June` — *"Fix this why it say June and year
         in same chip"* was a screenshot of one purple `June 2024` pill on exactly this card. The day it
         was sat is NOT a tag since 18 Oct -- no finder answer says it -- but the paper's cover line,
         over its end (`paperCover_`, docs/history/355). */
```

### ---------- A LONG LIST, DRAWN WHOLE

in `stuff`

```
/* ---------- A LONG LIST, DRAWN WHOLE ------------------------------------------------------------
       THIS WAS "AN ANSWER ONE LETTER LONG" -- the `S`, `G` and `P` chips the letter ranges made -- and
       those cannot exist any more: the owner, 6 Oct, *"I no longer want to have that a-g method or
       h-n. Just display."* What the change made possible instead is a question drawing a dozen or
       more answers at once, in the smaller 32px chips asked for with it, so that is what is measured:
       Year 5's Corbettmaths worksheets, thirteen titles at the time of writing, every one its own
       chip and none of them a range. */
```

### ---------- A BUNDLE OF PAPERS, WHICH ONLY A NARROWED LIST OFFERS

in `stuff`

```
/* ---------- A BUNDLE OF PAPERS, WHICH ONLY A NARROWED LIST OFFERS ------------------------------
       THE CARD EXISTS ONLY WHEN THE RESULTS ARE WHOLE PAPERS — see `bundleOf_` — so `go('stuff')`
       never shows one, and neither does any state above: a search for "work out" is questions from
       everywhere, and six answers into the worksheets is not a set of papers. Nothing here would
       ever have measured it, which is the hole the receipt, the message thread and the basket were
       each in before a state put them on the screen.

       THE WIDEST ONE ANYBODY REACHES BY ANSWERING, on purpose: Edexcel GCSE Higher in 2017 is two
       sittings of papers, grouped a line per sitting. It was the `2017 & 2018` bucket, twelve papers
       in four, until the years stopped being paired (6 Oct) -- one year is the widest answer now. A
       three-paper bundle would measure the easy case.

       FOUND BY THE PAGE IT IS ON rather than by a number, because the leading pages in front of the
       results change with what else is offered, and a literal would land on the wrong one.

       AND IT PUTS THE BASKET BACK AS WELL AS THE FUNNEL. `check/press.js` presses the trolley here,
       which writes twelve lines to `localStorage` — and states run in order down one page, so a
       basket left full would be measured on the Shop column as though somebody had filled it. */
```

### ---------- AND THE DOCUMENT BEHIND THE TILE

in `stuff`

```
/* ---------- AND THE DOCUMENT BEHIND THE TILE -----------------------------------------------
       THE LONGEST SURFACE IN THE APP, AND IT IS NOT ON A SCREEN. A practical's guide opens in the
       sheet, which is where it had to go: 51 of the 56 practical cards were already taller than
       the pane before a word of it was written, so a guide on the card would have been a guide
       below the fold. `#sheet` is a sibling of the screens rather than a child of one, so nothing
       here could see it until `inspect` was taught to — see the note there.

       THE KIT, THE METHOD AND THREE TEXTAREAS, none of it measured for a tap target, a contrast
       ratio or a sideways scroll until this.

       IT OPENED A SHEET AND THERE IS NO SHEET ANY MORE. "I HATE POP UP" — so `practicalCard_`
       draws the guide inline and the tile, its handler and `openSheet` are all gone from this
       path. A state that opened a surface the app no longer has would be measuring something
       nobody can see, which is this repository's oldest fault pointed at its own lab. It answers
       the funnel down to the practicals and turns to the first result instead, which is the app's
       own door and the state a person is actually in.

       IT WAS EIGHT BOXES AND A RISK LIST until the guide was cut to the five things its own note
       names.

       LAST IN THE LIST, AND IT PUTS THE FUNNEL BACK. States run in order down one page, so a
       funnel left narrowed to the practicals would be measured again as part of Tools and Games.
       `leave` is what says so. */
```

### ONTO THE WORKSHEET, which is the fourth page of the first practical now — "split into widgets. diagram, equipment, steps, worksheet bit."

in `enter`

```
/* ONTO THE WORKSHEET, which is the fourth page of the first practical now — "split into
           widgets. diagram, equipment, steps, worksheet bit." Found off the app's own
           `stuffPages_` rather than counted as `+ 3`, because a practical with no method would have
           three pages and a literal would land on the next practical's card. The pager keeps five
           pages either side filled, so the card, the kit and the method are all in the DOM too
           and the expect below asks about all four. */
```

### THE NUMBER IS ASSERTED RATHER THAN DESCRIBED — `>= 3` would pass on a guide that had quietly grown a fourth question nobody decided on, and this state is the

in `stuff`

```
/* THE NUMBER IS ASSERTED RATHER THAN DESCRIBED — `>= 3` would pass on a guide that had
         quietly grown a fourth question nobody decided on, and this state is the only thing that
         renders one. And the kit is asked for as a LIST — `.prac-kit ul > li` — and as nothing
         else: it was Google-Docs-style chips for a while and went back to bullets on "the google
         chip idea didnt work how i wanted to so revert back", so a `.kit-chip` turning up again is
         the reverted shape coming back and fails here rather than passing as "a kit was drawn". */
```

### ONE CARD, NOT THE SCREEN.

in `expect`

```
/* ONE CARD, NOT THE SCREEN. The windowed pager keeps about six result pages in the DOM at
           once, so counting `.gd-box` across `#s-stuff` counts six guides and answers 18 — which
           is what the first version of this did, and it reported the state unreachable on a screen
           that was drawing it perfectly. The count is per card because the claim is per card. */
```

### FOUR CARDS, EACH ASKED ABOUT ITS OWN JOB.

in `expect`

```
/* FOUR CARDS, EACH ASKED ABOUT ITS OWN JOB. The worksheet holds exactly the three boxes;
           the kit page holds the list; and the practical's own card holds NEITHER — a first card
           that still carried the guide would pass the other two tests while being the one long
           card this split replaced. And no part page carries a drawing: the picture is on the
           first card and only there. */
```

### ---------- A PROJECT, ON ITS LAST PAGE

in `stuff`

```
/* ---------- A PROJECT, ON ITS LAST PAGE ----------------------------------------------------
       "the projects are like practicles, but not practicles. so should be a new tag in the finder
       called projects." The practical's state one kind along: the funnel's own `What kind` answer,
       then the first project's SHARE page found off `stuffPages_` — so the card, the materials and
       the steps are in the DOM beside it and all four are measured for a tap target, a contrast
       ratio and a sideways scroll. The share page is the one with a tile on it. */
```

### ---------- A COURSEWORK, ON ITS STAGES PAGE

in `stuff`

```
/* ---------- A COURSEWORK, ON ITS STAGES PAGE ------------------------------------------------
       "i would like to add course works. make it bare bones. its within projects in finder." — the
       owner, 9 Oct. The project's state with the type chosen, as the funnel's own two answers:
       Projects, then Coursework, then the coursework's STAGES page — so the card with the board on
       its strip, the Stages list and the share tile beside them are the ones measured, and the
       longest strip and longest list any project card carries is the one at 320px. */
```

### ---------- A QUESTION ANSWERED BY DRAWING, DRAWN ON ITS OWN FIGURE IN ITS CARD (docs/history/356)

in `stuff`

```
/* ---------- A QUESTION ANSWERED BY DRAWING, DRAWN ON ITS OWN FIGURE IN ITS CARD (docs/history/356) ----------------
       THE OWNER, 18 Oct, over this card -- June 2024 1F Q7, "On the grid, draw a suitable diagram or chart for this
       information" -- with a box, a Draw tile, "Figure on the next page" and the grid a page away: *"why would there
       be an option for text answer in the first place?"* Now ONE card: the ask and the paper's own grid under the pen
       among its words, the lock, Undo and Clear, and no box, no Draw tile and no line pointing on. Measured in a
       browser because only it lays the card out: the pen's tiles a fingertip, nothing drawn smaller whole, and the
       grid never narrower than its floor (`cardFigFit_`). By id, so it follows the row. */
```

### ---------- A STEM'S MAP UNDER A PART'S OWN PEN, AND ITS BOX AT THE FOOT

in `stuff`

```
/* ---------- A STEM'S MAP UNDER A PART'S OWN PEN, AND ITS BOX AT THE FOOT ------------------------------------------
       1st Class Maths bearings Q2: the stem's map is drawn under the part's pen, in the part's card -- the drawing is
       working -- and the bearing it asks for in the box at the foot (`accept`): BOTH, in the card's order. The stem's
       own page does not draw the map again (`stemPenned_`). */
```

### ---------- THE TALLEST FIGURE UNDER A PEN, AT 320 TOO

in `stuff`

```
/* ---------- THE TALLEST FIGURE UNDER A PEN, AT 320 TOO ---------------------------------------------------------------
       The transformations-of-graphs stem: four sine grids, nearly twice as tall as wide, under part 8's pen. The one
       rule (`cardFigFit_`): the words give way first, then the figure narrows, never under its floor, and the card is
       never drawn smaller whole -- what is left scrolls. Tiles a fingertip at every width. */
```

### ---------- A MULTIPLE-CHOICE QUESTION, ANSWERED BY TAPPING

in `stuff`

```
/* ---------- A MULTIPLE-CHOICE QUESTION, ANSWERED BY TAPPING ---------------------------------
       ITS OPTIONS ARE BUTTONS AND THERE IS NO TEXT BOX — asked for in as many words. Narrowed by
       its own paper, exactly as the pen state above, and landed on its own page. The expect asks
       for the buttons AND the absence of a textarea on that card, because a card drawing both
       measures perfectly and is the thing that was asked to stop. */
```

### ---------- A MULTI-PART QUESTION WITH A DIAGRAM, IN THE PAPER'S ORDER

in `stuff`

```
/* ---------- A MULTI-PART QUESTION WITH A DIAGRAM, IN THE PAPER'S ORDER ------------------------------
       ASKED FOR AS *"evaluate how questions appear when there's multiple parts and a diagram"* and
       *"diagram widgets shouldn't have a question number on them"*. One row, named: Q5 of the June 2022
       A-level Statistics paper -- a stem ("Of the 80 people...") with a Venn diagram, then six parts, the
       third of which is "complete the Venn diagram above". Two pictures: the stem's own page, headed
       `Q5` with no part (`· 1 of 2`: its table is long enough to be cut), and the Venn diagram on the page after it, headed `Figure` with no number of either
       kind. Both land on the pages in front of (a), where the strip puts them once for all six. */
```

### THE ITEM'S OWN TAGS, the same on its opening as on its card (`tagRow_`, 355):

in `stuff`

```
/* THE ITEM'S OWN TAGS, the same on its opening as on its card (`tagRow_`, 355): What kind, then
         [Q5] [a] -- the part the opening stands in front of -- and no page number, an opening not being
         one of the part's reading pages. */
```

### ---------- A MADE-UP SURFACE AND A BOX: THE HEXAGON (docs/history/356)

in `stuff`

```
/* ---------- A MADE-UP SURFACE AND A BOX: THE HEXAGON (docs/history/356) -------------------------------------------------
       KS1 "How many sides has a hexagon?" -- the owner's 10 Oct screenshot, a one-word answer whose row gives it a
       blank space to count on. It has an `accept`, so it is BOTH: the blank space under the pen where the box would
       be, and the box under it -- no switch, no page. */
```

### ---------- A MADE-UP SURFACE AND NOTHING ELSE

in `stuff`

```
/* ---------- A MADE-UP SURFACE AND NOTHING ELSE -----------------------------------------------------------------------------
       June 2024 1F Q11(c): drawn on a blank space the site makes, with no `accept` -- the surface under the pen where the
       box would be, and no box. */
```

### ---------- "USE YOUR GRAPH", WITH THE GRAPH IN FRONT OF ITS WORDS, IN ITS CARD

in `stuff`

```
/* ---------- "USE YOUR GRAPH", WITH THE GRAPH IN FRONT OF ITS WORDS, IN ITS CARD ------------------------------------------
       June 2024 2F Q24(c) "Use your graph..." uses (b). The curve (b) asks for is put on (b)'s grid as the pen stores a
       stroke, and (c)'s card is opened: (b)'s picture with the curve on it in front of (c)'s words, no pen, no control,
       no header, no line about whose marks they are. It was a page of its own until 18 Oct (356). */
```

### ---------- AND ITS FIGURE TILE, WITH THE SAME GRAPH ON IT

in `stuff`

```
/* ---------- AND ITS FIGURE TILE, WITH THE SAME GRAPH ON IT ----------------------------------------------
       Found in review: on Q24(c) the Figure tile opened (b)'s grid EMPTY while the page before showed the
       child's curve. Now the sheet carries the marks (`figsBefore_`) -- and, measured here because only a
       browser lays it out, ON the grid: in the sheet `.qpad-art` first took the sheet's whole width while
       the grid stopped at its 20rem cap, so the ink layer stretched past the picture and the curve sat
       21px off the axes it was drawn on. The tile is pressed through its own handler, as a finger does. */
```

### ---------- A CONSTRUCTION, WITH A RULER'S LINE AND A COMPASS'S RING ON IT

in `stuff`

```
/* ---------- A CONSTRUCTION, WITH A RULER'S LINE AND A COMPASS'S RING ON IT -----------------------------
       *"some questions require a compass or ruler. so should have a tile for these things."* November 2019
       Higher Paper 1, Q4: "Use a ruler and compasses to construct the line from the point P perpendicular
       to the line CD" -- the one pen question in the library whose own row asks for compasses, found by
       id. On its card switched to its figure (the pen is the card's other face since 337; it was on the
       figure page), with the Compass in hand (pressed as a finger would, which also locks the card) and
       two marks made the way the tools make them: a ruler's two-point line and a closed ring built by the
       app's own `padArc_` from the ink's real box, so it is round at every width. Measured armed, because
       the bar's lit tile and the gold-filled lock are what is new here. */
```

### ---------- A PASSAGE WITH TWO WORDS RINGED

in `stuff`

```
/* ---------- A PASSAGE WITH TWO WORDS RINGED -----------------------------------------------------------
       "Circle the three adjectives in the passage below" -- KS2 grammar, June 2025. NO ROW CARRIES
       `surface: "text"` YET (the data workflow is writing it), so this gives the real row the value it
       will carry, for the length of the state, through the app's own memo (`CHUNK_MEMO` keeps a part's
       pages, and they change when its surface does). Two words are rung through the real handler, as a
       finger would, and taken off again on the way out with everything else. */
```

### ---------- A PART TOO LONG FOR ONE PAGE, CUT BETWEEN PARAGRAPHS

in `stuff`

```
/* ---------- A PART TOO LONG FOR ONE PAGE, CUT BETWEEN PARAGRAPHS --------------------------------------
       *"each widget is smaller than a phone screen"*. Named: Q3.5 of the June 2024 A-level Biology
       Paper 3 -- the tallest question card in the library before the cut, 1,241px past a 320 pane. Its
       first page (`pre0`): the reading, no box, saying it continues; the card after it keeps the ask. */
```

### ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR

in `stuff`

```
/* ---------- HOW YOUR LAST ANSWER WENT, BESIDE THE STAR -------------------------------------------------
       THE OWNER, 9 OCT: *"The kids don't need to see the day they did something. Just whether it's right
       or not."* So the slot that said `Done 4 Oct` says how the LATEST submission went (`subSlot_`, js/
       submit.js): "Correct" with the tick, "Not yet" with the turning arrow, "Sent" in the dim ink. Three
       states, one verdict each, so `ui.js` measures every one at every width — "Not yet" is the longest
       beside the star, and the row is 44px tiles that must not wrap. Signed in only: signed out there is
       no slot. The latest is written where this device keeps it (`subLast:<who>`), and taken off again on
       the way out so no other state is pictured marked. No card says a day. */
```

### ---------- A KS2 SATs QUESTION: `SATs` AND `KS2`, TWO TAGS, AND WHAT TO BRING AS ITS OWN

in `stuff`

```
/* ---------- A KS2 SATs QUESTION: `SATs` AND `KS2`, TWO TAGS, AND WHAT TO BRING AS ITS OWN ---------
       *"why is ks2 sats one tag? it should be sats. if they want to specify key stage then it should be
       its own thing."* and *"why do the questions say non calculator but its not a tag?"* One row, named:
       the May 2024 Reasoning paper's first question, which asks for a ruler -- so the card wears the
       page's own tags, the level and the key stage as two blue pills, and a needs pill in its own
       colour, every one of which `ui.js` measures for contrast and for fitting at 320. Reached by the
       funnel's Paper answer, as a thumb reaches it. */
```

### ---------- THE ANSWER PAGE: HIDDEN, TURNED TO, AND SHOWN

in `stuff`

```
/* ---------- THE ANSWER PAGE: HIDDEN, TURNED TO, AND SHOWN ----------------------------------------
       ASKED FOR AS "what I want was answers to be short and to be their own widget" -- the answer is
       the page after its question (`questionAnsCard_`) -- and then *"remove all 'why's. I just want
       it to have answer. And you should have to click to reveal the answer. Should behave the same
       whether it's a tutor or child."* Three pictures, because a finger can put it in three states,
       and each is something `ui.js` measures: the waiting sentence and its 44px control; the page a
       question's tile turns to; and the result shown by its own button, with nothing under it. NO
       `only:` ON ANY OF THEM -- the hidden page used to be skipped for staff, because a tutor's was
       open; it is the same page for both visitors now, so both are pictured.

       ONE ROW, NAMED, on purpose: June 2018 Higher 1, question 3 -- "No", then working that holds a
       stacked fraction. Picked because it was a 207-character paragraph before 259's rewrite, so
       the pictures show the change on a real answer rather than on whichever sorts first. Landed on
       by `stuffPageOf_(it, 'ans')`, the app's own map from a part to a page. AFTER A TICK, because
       the page is drawn by `goPage` and is not there to press until then.

       `ANS_SHOWN` IS EMPTIED ON THE WAY IN AND OUT. States run in order down one page, and an answer
       shown by one would be measured as already shown by the next -- the hidden state would then be
       a picture of the open one, and pass. */
```

### THE RESULT EXPECTED IS THE ONE THE APP SAYS, not a word copied in here.

in `stuff`

```
/* THE RESULT EXPECTED IS THE ONE THE APP SAYS, not a word copied in here. These states wanted
       /^No$/ until the data caught up with "remove all whys" and Q3's head became the whole result
       ("No: salesmen get £180 each, …") -- the page was right and the check was a stale copy of the
       data. So the head is asked of `answerParts_` and drawn through `typeset_`, the same two calls
       `answerBlock_` makes, and the page must show exactly that -- inline in each `expect`, because a
       state is evaluated in the page as its own source and a helper declared in this file is not there. */
```

### ---------- SWIPED TO, NOT TURNED TO BY A TILE

in `stuff`

```
/* ---------- SWIPED TO, NOT TURNED TO BY A TILE ----------------------------------------------------
       THIS WAS "THE ANSWER, TURNED TO FROM ITS QUESTION", pressing the question card's ↓ `To the answer`
       tile. The tile went on the owner's word, 8 Oct: *"there doesnt need to be a scroll down tile on
       questions."* So the question's page is landed on, it is asked to carry NO such tile, and the strip
       is swiped one page on -- `goPage(PAGE + 1)`, the landing a swipe ends in, animated as one -- and
       that page must be the question's answer, still hidden, with Show waiting. A paper chosen and no
       kind: the one place answers follow their questions. */
```

### ---------- QUESTIONS CHOSEN: THE PAGE AFTER A QUESTION IS THE NEXT QUESTION

in `stuff`

```
/* ---------- QUESTIONS CHOSEN: THE PAGE AFTER A QUESTION IS THE NEXT QUESTION --------------------------
       THE OWNER, 8 Oct, on an iPad: *"answers shouldnt even be showing up when all ive done is clicked
       questions. the answers still show up."* Measured that morning on the Corbettmaths subtraction
       sheet: 59 pages, 27 of them answers, `subtraction-1, its answer, subtraction-2, its answer...`.
       With Questions chosen, Q1's card and one swipe on is Q2's card -- and no answer card anywhere on
       the strip, not merely shut. */
```

### ---------- WHAT KIND: QUESTIONS FIRST

in `stuff`

```
/* ---------- WHAT KIND: QUESTIONS FIRST -------------------------------------------------------------
       The chips were the alphabet, so `Answers` was the first one -- top left, where a thumb lands -- and
       one tap on it opens every answer for anybody. In `KIND_BUCKET`'s order now: Questions, then
       Answers beside it. Pictured, because which chip is first is a fact about the screen. */
```

### ---------- AND HIDDEN AGAIN, WITH THE TILE WHERE THE THUMB LEFT IT

in `stuff`

```
/* ---------- AND HIDDEN AGAIN, WITH THE TILE WHERE THE THUMB LEFT IT -----------------------------
       *"answers should just stay hidden unless user unhides them. and can hide them again. simple is
       best."* Show, then Hide, by real clicks; the tile's box is measured at each step, because "the
       same place" is a fact about pixels and jsdom has none (check-flow holds the markup half). The
       tile and the card's top may not move by half a pixel either way, and the page ends hidden with
       no answer in it. */
```

### ---------- MARKED, AND NOTHING MOVED

in `stuff`

```
/* ---------- MARKED, AND NOTHING MOVED --------------------------------------------------------
       ASKED FOR AS "make it nice more sleek, fresh stable". The unstable part was measured before it
       was fixed: at 320 "Not yet — have another go" wrapped under Check and grew the card by 21.8px,
       and a tapped wrong option grew it by 13.7px as its verdict line arrived from nowhere -- the
       card jumped at the moment it told you your answer. Neither is visible in a picture taken
       afterwards, so these states take the picture's measurements BEFORE the press as well, the way
       a finger would see it: the question's top, the answer box's top and the card's height, then
       Check (or the tap), then the same three again. A wrong verdict may move NOTHING; a right one
       may grow the card only BELOW the box -- and it does not open the answer page any more: the
       verdict is "Correct", and the page after waits for its own tap, for everybody.

       NAMED ROWS, so the pictures are the same question every run: `Q0664` is 5/8 = ?/24 (typed,
       accepts 15, its stem a stacked fraction), and the Corbettmaths ×10 question is a one-answer
       tapped one. The stored answer is cleared first and again on the way out -- a pick left over
       from an earlier run is a question already settled, and would measure the wrong card. */
```

### THE ANSWER PAGE STAYS SHUT -- asked of `ansOpen_`, the one rule the page is drawn by, because the page may not be built yet and is not the one on screen.

in `expect`

```
/* THE ANSWER PAGE STAYS SHUT -- asked of `ansOpen_`, the one rule the page is drawn by, because
           the page may not be built yet and is not the one on screen. A right answer used to open it;
           *"you should have to click to reveal the answer"*. */
```

### ---------- AN ORDERING, HALF PLACED, AND THEN SENT RIGHT

in `stuff`

```
/* ---------- AN ORDERING, HALF PLACED, AND THEN SENT RIGHT -------------------------------------------
       THE OWNER, 8 Oct: *"I would prefer it be like an ordering system?? … simpler to mark for a
       machine."* (`orderBox_`, docs/history/303.) The real June 2024 1F Q4, its five numbers tapped by
       CLICKS on the real buttons. Half placed is the strip with two items in it, two ghosts in the row
       under it and three dashed slots -- the picture worth measuring at 320, where the strip wraps.
       Then the whole row WRONG, and Send, and then right, and Send: the question, the strip, the
       verdict's line and the card's height measured before and after each, because marking moves
       nothing (261) -- and Send and Clear too, because the long "Not yet — have another go" took room
       from them: at 320 Send went from 48x48 to 39x48 and Clear from 44 to 36 wide, and they moved 9
       and 17px. Only the short "Correct" had been measured, and it never squeezes the row. */
```

### WRONG FIRST: the row reversed, its long verdict beside the two tiles.

in `run`

```
/* WRONG FIRST: the row reversed, its long verdict beside the two tiles. Measured by the verdict's
             ROW (`.qp-mark`), its top and height, not the sentence's own top: "Not yet — have another go"
             wraps to two lines INSIDE its slot at 320 and 390, as the typed bar's verdict does by design,
             so its first line starts higher in a row that has not moved -- nothing else is there to move. */
```

### ---------- AN ORDERING OF POWERS: A POWER IS RAISED IN THE ROW AS IT IS IN THE QUESTION

in `stuff`

```
/* ---------- AN ORDERING OF POWERS: A POWER IS RAISED IN THE ROW AS IT IS IN THE QUESTION ------------
       5-a-day 3 June Q1, "2² ∛27 1³ √25". A slot and an item are `inline-flex`, and a bare `<sup>` in one
       was a flex item of its own: not raised, centred beside its digit, so the row read "22 ∛27 13 √25"
       -- and standard form "6 × 104" -- and a child who reads them that way orders them wrong. Measured
       at 390 before the fix: the exponent level with its digit (sup 488-503, digit 487-504) where the
       question prints it 6px up. 2² is placed, so a slot holds one too, and every `<sup>` in the strip
       and the row must sit at least 2px above the bottom of the digit before it. Fractions never showed
       it -- `typeset_` draws one as a single element -- which is why the first shots missed it. */
```

### ---------- THE MATHS KEYPAD, UP, WITH A FRACTION HALF BUILT

in `stuff`

```
/* ---------- THE MATHS KEYPAD, UP, WITH A FRACTION HALF BUILT ------------------------------------
       ASKED FOR AS "make the input better … like hegarty maths … desmos". The pad is one element on
       <body>, fixed to the foot of the app's column, and it is the one surface in this app that is
       drawn OVER the screens rather than in one — so it is exactly what `ui.js` has to measure at
       320: six keys across at 44px, nothing sideways, the caret and the slots inside the box. Q0664
       is a `calculation` with a scheme, the same row the two marking states use. The keys are CLICKED,
       not called, so the delegated handler and the pad's own `mousedown` guard are what run — a key
       that took the focus off the box would close the pad and fail `expect`. Three, then →, then
       nothing: a fraction with a top and an empty dashed bottom, which is the picture worth looking
       at. */
```

### ASKED AGAIN UNTIL THE CARD IS THERE, rather than once at a guessed delay:

in `enter`

```
/* ASKED AGAIN UNTIL THE CARD IS THERE, rather than once at a guessed delay: the page is built
           by `goPage`, and on a loaded machine 150ms was sometimes before it — measured, once in two
           runs at 320. Every 20ms, inside `ui.js`'s half second, then `expect` says so. */
```

### ---------- THE KEYPAD UP ON A PART WITH A FIGURE BEHIND IT: THE FIGURE TILE STAYS ABOVE THE PAD

in `stuff`

```
/* ---------- THE KEYPAD UP ON A PART WITH A FIGURE BEHIND IT: THE FIGURE TILE STAYS ABOVE THE PAD ---
       THE REVIEW OF THE MULTI-PART MERGE, at 320x568: 1F Q23b's box raised the pad (top 315) and Check,
       Figure and the old way to the answer stood at 322-437, under it -- the Figure tile exists to show the Venn
       WHILE answering, and was hidden exactly then; a tap where it had been typed a key. The tile now
       stands at the end of the box's own line (`ansBox_`), so wherever the box clears the pad, it does.
       Expect: the box AND the Figure tile wholly above the pad's top edge, at every width. */
```

### AFTER THE COLUMN HAS STOPPED, as a finger would:

in `enter`

```
/* AFTER THE COLUMN HAS STOPPED, as a finger would: the box is tapped on a page that is still.
           Focused 20ms after `goPage`, the slide's own settle (`afterSlide_`) let go of the hold the pad
           had just lifted the card on (and the page was not yet `.on`, so the lift never ran), and the box sat under the pad at 320 -- a fault of the state's
           timing, not the app's: opened on the settled page, the lift is 45px and both clear it. */
```

### ---------- THE ANSWER BOX AT REST: A PAPER FIELD SAYING WHAT IT IS FOR, AND SEND

in `stuff`

```
/* ---------- THE ANSWER BOX AT REST: A PAPER FIELD SAYING WHAT IT IS FOR, AND SEND ----------------------
       THE OWNER, 8 Oct: *"the answer box should look like a chatbox. with send tile. we found it hard to
       find answer box in the ipad in the sun."* It was `--sunk` on the card, 1.04:1, with nothing in it.
       At rest and empty: the field is the paper (`--paper`, read off the stylesheet rather than written
       here), it says "Type your answer", and Send is the gold tile beside it. `check/ui.js` measures its
       edges against the card (EDGE). Q0664, the row the marking states use. */
```

### ---------- THE KEYPAD UP, IN ITS SUNLIGHT COLOURS

in `stuff`

```
/* ---------- THE KEYPAD UP, IN ITS SUNLIGHT COLOURS ----------------------------------------------------
       *"its hard to see keypad and each button especially backspace, which i thing should be red."* The
       keys were 1.03:1 on the pad. Lit faces now, ⌫ the app's red with a black mark, and the heights in
       px: 44 on a short screen, 56 from 700px, 48 between. The whole pad takes only a tap
       (`touch-action: manipulation`), so a double tap in a gap cannot zoom the iPad's page. */
```

### ---------- A REPAINT WITH THE KEYPAD UP

in `stuff`

```
/* ---------- A REPAINT WITH THE KEYPAD UP --------------------------------------------------------------
       *"they keypad was a bit unstable. it wasnt working at first for some reason."* Signing in repaints,
       and `load()` repaints again about fifteen seconds later; each replaces the box being typed in. Here,
       in Chromium -- which fires `focusout` for the removed box, where the iPad fires nothing (check-flow
       holds that half): 7, `repaint()`, a beat for the focus to land, then 5. Wanted: the pad still up,
       on a box that is in the page, holding 7 before the 5 and 75 after it.
       TWO LAYERS SINCE 8 OCT, and this asks both. `findKeep_` (js/answers.js) holds a repaint of Find
       back while a box is focused or the pad is up, so `repaint()` must leave the SAME box in place; and
       a redraw that comes anyway -- `paintStuff(true)`, which no keep stands in front of -- must still
       land the pad on the new box. Merged, the state's old `repaint()` met the first layer and never
       reached the second: "shows no ... the pad still up on the new box" at every width. */
```

### ---------- AND A WORDED ANSWER, WITH "MARK WITH AI" BESIDE IT

in `stuff`

```
/* ---------- AND A WORDED ANSWER, WITH "MARK WITH AI" BESIDE IT ------------------------------------
       In the answer bar where Send stands on a box with a scheme (8 Oct, `aiTile_`), its verdict and its
       sentence on the lines under the bar.
       The fixture is a deployment with the action and no key (`aiMarking: false`), which is what
       `doGet` sends until the owner adds one — so this says yes for the length of the state, the way
       a key in Script Properties would, and puts it back. Q33 of AQA Biology June 2024 Foundation is
       a three-mark `explain` with a scheme and no `accept`: exactly the question the button is for. */
```

### SIGNED IN, IT IS MARKED — by a stand-in for `api` that answers the way `aiMark` does, so the picture is of the verdict and the sentence as they are really

in `enter`

```
/* SIGNED IN, IT IS MARKED — by a stand-in for `api` that answers the way `aiMark` does, so the
           picture is of the verdict and the sentence as they are really drawn, by the real handler.
           There is no Gemini in a check. Signed out, the press says to sign in, which is the other
           thing worth seeing. `api` is put back on the way out. */
```

### ---------- A WORDED ANSWER, THE PAD UP ON ITS LETTERS

in `stuff`

```
/* ---------- A WORDED ANSWER, THE PAD UP ON ITS LETTERS ---------------------------------------------
       THE OWNER, 8 Oct: *"Make the keypad never need to use their own keyboard the key pad seems to allow
       ios keyboard to show I just want self contained system really"*. A worded box was a textarea and the
       iPad's keyboard; it is the pad's box now, opening on the letters (keypad.js, `KP_ABC`). Pictured so
       `check/ui.js` measures the letters as it measures the maths keys -- every key's face against the
       pad (EDGE), its size (the letters are narrower than 44px and carry their reason, `ACCEPTED_TAP`),
       its contrast -- at every width. Q33 of AQA Biology June 2024 Foundation, the explain question the
       Mark-with-AI state uses, focused and typed into by the pad's own keys: "Hi" with its capital put in
       by itself. Expect: the letters face up (sixty columns, 39 keys, the bottom row the maths pad's),
       every key as tall as the maths keys for the screen, the box still locked and its pill wholly above
       the pad, and the drawing saying what was typed. */
```

### ---------- AN ESSAY, WRITTEN ON ITS SHEET IN PARAGRAPHS, THE PAD UP

in `stuff`

```
/* ---------- AN ESSAY, WRITTEN ON ITS SHEET IN PARAGRAPHS, THE PAD UP ---------------------------------
       THE OWNER, 9 Oct, about a pupil on AQA English Language Paper 1, June 2017, Section B: *"firstly it
       doesnt let him do paragraphs and also i want it to mark with ai."* The real Q-R0398-5 -- forty marks
       of writing -- drawn as a SHEET (`ansEssay_`, keypad.js; `.qp-sheet` in style.css), focused, and three
       paragraphs written into it through the pad: words on the letters' keys, each paragraph break on
       the essay's own RETURN key (two presses, a blank line), the rest of each paragraph handed to the
       pad's edit as a laptop's keys are. Pictured so `check/ui.js` measures the sheet and the essay's
       letters at every width -- the return key's size and face, the paper against the card (EDGE), the
       word count's contrast. Expect: the pad up on the essay's letters (40 keys, one return, labelled),
       the value holding two paragraph breaks, the drawing the same, the count right, the row under the
       sheet (and so the sheet) wholly above the pad, and the line being written -- the caret -- inside
       the sheet's window and above the pad, the thing "growing, then scrolling inside" is for. */
```

### ---------- WHERE A TYPED ANSWER IS KEPT, SAID UNDER THE BOX

in `stuff`

```
/* ---------- WHERE A TYPED ANSWER IS KEPT, SAID UNDER THE BOX ----------------------------------------
       *"it doesnt seem to save their answers"* and *"i am very dissapointed it didnt have his answers
       already written in when he went to see them on the computer"* — js/answers.js. Two states, one per
       visitor: SIGNED IN, the box on a fresh device filled from the account by `answersPull_` and the line
       under it naming whose account it is on; SIGNED OUT, an answer typed and the line saying it is on
       this device only. The fixture is a deployment from before `saveAnswers`, and its signed-in visitor
       has no token, so both are lent for the length of the state — and `api` answers `myAnswers` the way
       the backend does — and put back. Measured at 320 because the line is one line and must stay one. */
```

### ---------- THE FILMS, WHICH ONLY ONE VISITOR IS SENT — AND WHICH FIND DOES NOT HAVE

in `stuff`

```
/* ---------- THE FILMS, WHICH ONLY ONE VISITOR IS SENT — AND WHICH FIND DOES NOT HAVE ----------------
       `only:` FOR THE SECOND TIME IN THIS FILE, and for a stronger reason than the flyer widget's.
       That one is a roster gate on the phone; this is the PAYLOAD — `doGet` builds `films` inside
       `if (viewerIsAdmin)` and sends `[]` to everybody else, so a signed-out visitor has no rows and
       their Find has no films whatever the code does. Asking them would pass with the fault in place.

       THIS STATE OPENED `Learning → Films` AND MEASURED THE FILM CARDS — the fixture's long title, its
       series and its placeholder, and the Watch tile in the row under the card. THE OWNER, 10 Oct:
       *"films should not appear in the finder it cannot be found there"*. So it is the admin's first
       question in Find now, drawn WITH the fixture's three films in the payload: it measures the page an
       admin is shown, and it arrives only if nothing on it, nothing What kind could answer over Find's
       whole list, and nothing a film's title finds in Find's search, is a film. A film is measured where
       it is found — "the films in the videos card, an admin’s", on Games.
       NOT `Learning`'s What kind ANY MORE, which is what the films branch asked for: the second finder
       took the textbooks to its own column for two days (docs/history/329; Find holds them again since
       347), and over the fixture Learning in Find then held one kind, so What kind was skipped and the page
       drew Year. A state that wants a second What kind answer on Find depends on what the fixture happens
       to hold — so this asks What kind's answers of the facet over the whole list instead, which is the
       same question without the funnel's skip. */
```

### ---------- THE TWO WAYS THE FUNNEL ENDS WITHOUT A QUESTION

in `stuff`

```
/* ---------- THE TWO WAYS THE FUNNEL ENDS WITHOUT A QUESTION ------------------------------------
       NEITHER WAS A STATE. `Nothing matches` is what a search for nothing says, and "Nothing left to
       narrow" is the last line under the chips when every question is answered — an inline
       `style="margin:.6rem 0 0"` in the faintest ink until it had a class. Both are measured for
       contrast here for the first time. */
```

### AND A SEARCH A CHIP HIDES.

in `stuff`

```
/* AND A SEARCH A CHIP HIDES. It was "a search only Resources answers" — a boxer's name typed into Find
       while the boxers were one column over, which drew "1 in Resources" and an Open tile that carried the
       words across (329's review, finding 1). Both finders hold the boxers now (347) and the tile is gone:
       what is left to measure is the sentence a chip leaves — faint words, which is a contrast ratio, and
       which only a browser measures — and that no tile to the other column is drawn under it. */
```

### ---------- "STABLE": AN ANSWER PRESSED MOVES NOTHING ABOVE IT

in `stuff`

```
/* ---------- "STABLE": AN ANSWER PRESSED MOVES NOTHING ABOVE IT ---------------------------------
       *"nice more sleek, fresh stable"*. Pressing an answer adds a chip and asks the next question,
       so the list UNDER the chips moves by design — but the search box and the chips already chosen
       must not move a pixel, or the thing you were about to press next is somewhere else. Measured
       before and after a real click on the first answer, relative to the pane. */
```

### ---------- AND A CARD'S OWN PAGES FILLING MOVE NOTHING ON IT

in `stuff`

```
/* ---------- AND A CARD'S OWN PAGES FILLING MOVE NOTHING ON IT ----------------------------------
       The pager fills pages either side of the one in front as you swipe, so a practical's diagram,
       kit and steps are drawn into the DOM while you are reading its card. Measured on the card:
       its title and its foot, relative to its pane, before and after turning two pages on and
       back. THREE PAGES WAS NOT ENOUGH and the first version measured nothing: with `STUFF_NEAR` at 5
       every page it passed was already drawn. `STUFF_NEAR + 3` on was far enough that the card's OWN
       page was emptied, so coming back drew it again from nothing — the moment a card loads.
       SINCE docs/history/341 NOTHING INSIDE THE WINDOW IS EMPTIED (`STUFF_NEAR` is gone, and the window is
       forty-one pages, all filled): only a recycle releases a card. So the walk goes past the whole window,
       `STUFF_WIN + 3` on, which moves it off the card's page; coming back draws the card again from nothing,
       as before. `fillStuffPages(true)` is the whole window, now. */
```

### THE CARD'S PAGE BY THE APP'S OWN `domIndex_`, NOT THE N-TH CHILD AND NOT `.page.on`:

in `enter`

```
/* THE CARD'S PAGE BY THE APP'S OWN `domIndex_`, NOT THE N-TH CHILD AND NOT `.page.on`: the
           pager keeps a window of result pages and recycles them, so the strip's children are not
           numbered by page, and `.on` moves on the next frame rather than inside `goPage`. */
```

### THE PAGES ARE FILLED BY `fillStuffPages`, CALLED HERE RATHER THAN WAITED FOR, AND NOTHING IN THIS STATE WAITS ON A TIMER.

in `enter`

```
/* THE PAGES ARE FILLED BY `fillStuffPages`, CALLED HERE RATHER THAN WAITED FOR, AND NOTHING
           IN THIS STATE WAITS ON A TIMER. The pager fills on the settle after a swipe; the first
           version waited for it, then waited 60ms twice for its own measurements — and with the
           whole suite running at once those timers fired after the half second `check/ui.js` gives
           a state, so it reported the card missing at every width. Calling the app's own filler
           (`all`, so the far pages are not left to a timer either) is the same drawing, and reading
           a box forces the layout, so the whole thing is synchronous. The title node is kept so the
           expect can tell the card was drawn AGAIN rather than left standing. */
```

### FIND 2, RIGHT OF FIND (docs/history/329, 347)

in `STATES`

```
/* ================================================================================================
     FIND 2, RIGHT OF FIND (docs/history/329, 347)

     THE OWNER, 10 Oct, built this column for the resources; on 12 Oct: *"Return to that origional finder
     having everything and now there is just an identical second finder."* The textbook, Bible, boxer and
     fight states moved here with the resources (329) and STAY here now that both finders hold them,
     because they are what proves the second column draws as Find does — the column a student keeps the
     reading up in. Each runs in the second finder's binding (`inFinder_`, find.js — inside it `STUFF` IS
     this column's state, so the code reads as it did), turns `goPage('res', …)` and looks in `#s-res`.
     They set the shelf's chip without `What for · Learning` and `What kind · Resources` in front of it:
     the shelf narrows to the same list a finger reaches through those two doors, so the page drawn is the
     page a finger reaches.
  ================================================================================================ */
```

### ---------- A CONTENT CARD, REACHED BY WHAT KIND · CONTENT AND ITS SUBJECT

in `res`

```
/* ---------- A CONTENT CARD, REACHED BY WHAT KIND · CONTENT AND ITS SUBJECT ---------------------
       It was `a textbook chapter`, reached by the `@family. textbooks` shelf and the book's own chip; each
       chapter is a content card since 12 Oct (docs/history/347, part 2), so it is reached the way a
       student reaches one: What kind · Content, then the subject. Measures of spread, because it is the
       card with everything a card can carry: the tag row, key words, Higher lines, and the standard
       deviation formulas, whose stacked fractions under a root are the widest thing on any card. The
       cards either side are in the DOM beside it, so they are measured too, for a tap target, a
       contrast ratio and a sideways scroll. */
```

### ---------- A CONTENT CARD'S ANIMATION, ON ITS PAGE AFTER ITS CARD

in `res`

```
/* ---------- A CONTENT CARD'S ANIMATION, ON ITS PAGE AFTER ITS CARD -------------------------------
       "Add the animations from loading to respective subject text books." — the owner, 8 Oct. Three of
       the twenty-seven, chosen for what they stress in a card: Pythagoras is the TALLEST drawing,
       Bayes the WIDEST (a 20rem root that came out at 288px in a 244px card at 320 before its size
       stopped at the box), and standard form the one that SCROLLED SIDEWAYS — its point hops past the
       row of digits it stands on. Each is reached by What kind · Content and its subject, and turned
       to by its page; the pages either side are in the DOM beside it and are measured too. */
```

### ---------- THE BIBLE, WHICH ONLY THE ADMIN VISITOR IS SHOWN

in `res`

```
/* ---------- THE BIBLE, WHICH ONLY THE ADMIN VISITOR IS SHOWN ----------------------------------
       "i want to add the bible to resources as a book. but only admin can see the bible." `only`, for
       the films' reason one state up — signed out there is no item, no shelf answer and no fetch, and
       asking a stranger to reach it would report a fault about the check (check-flow proves the
       absence; this measures the presence).

       AND REDONE ON 6 OCT AS SIX QUESTIONS AND A CARD A VERSE (*"it should be like the other stuff.
       tags in finder ... each verse is a widget"*), so these are the screens that are new: the one
       question with one answer, the two longest grids the funnel draws — Psalms's 150 chapters and
       Psalm 119's 176 verses, which are where a grid is drawn smaller to fit and then scrolls — a
       verse card with its tags and its Chapter tile, and Esther 8:9, the longest verse, at every
       width. `check/ui.js` measures every pane in the strip, so each is measured with the pages
       either side of it.
       THE BOOKS ARE ASKED FOR IN THE FIRST STATE, for the ones after it: a state's `enter` has the
       500ms every state gets, and a book fetched there by the app's own call is held for the visit,
       so the cards after it are drawn from memory as a second visit would draw them. */
```

### THE FIND CARD'S SHARED PARTS, ON THE KINDS THAT HAD NONE OF THEM

in `res`

```
/* ==============================================================================================
       THE FIND CARD'S SHARED PARTS, ON THE KINDS THAT HAD NONE OF THEM

       ASKED FOR AS *"didn't I ask you to sleekerise the whole widget system in the finder"* — and
       two kinds in Find had never been on a screen this file drew: the boxer and the fight. The
       boxer was a SHOP row (a 0.92rem title, the record pinned in a corner) and the fight a loose
       paragraph of names, and nothing measured either, because no state reached Resources ›
       Boxing. These do, and each asks for the shared shape rather than just "a card": the title in
       `.fc-head` at the one title size, the kind flag drawn ABOVE it (the kicker slot every page
       now has), and the numbers on the gold meta line.

       `fcHead` IS WRITTEN OUT IN EACH, not shared, because these functions are passed to the
       browser as source one at a time and cannot see each other — the note at the top of the file.
    ============================================================================================== */
```

### ---------- AND THE PROFILE IT BECAME

in `res`

```
/* ---------- AND THE PROFILE IT BECAME ------------------------------------------------------------
         ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer ... the wins losses
         etc."* The record left the gold meta line for a scoreboard of its own, and the photo stands
         beside the name — so this asks what only a browser can answer about that: the picture box is
         the 4:5 it was told to be, it sits to the LEFT of the name rather than over it (the grid in
         style.css, not the markup, puts it there), the scoreboard is whole numbers or says there is no
         record, and nothing on the card scrolls sideways at this width. The shared head's rules: one
         title size, and the card's tag row under it ([Boxers], the answer that found it -- it was a
         flag above the title until 355). */
```

### ---------- THE PHOTO'S CREDIT, AS A LINK A FINGER CAN HIT

in `res`

```
/* ---------- THE PHOTO'S CREDIT, AS A LINK A FINGER CAN HIT ------------------------------------------
       THE CREDIT IS A LINK NOW, to the photo's Commons file page — a CC BY or BY-SA licence asks for
       one — and a link is a tap target, so it is a 44px block rather than a 12px line of small print
       (`a.boxer-src` in style.css). Only a browser can say how tall a block is, so this asks one, at
       every width: Ali's credit is a link, at least 44px tall AT ITS OWN SIZE (a profile drawn smaller
       to fit its pane is the zoom's cost, counted by `check/ui.js` on its own line), straight under
       the picture and across the card rather than in the photo's column, and its words at least
       `.62rem` — the size the review measured the old `.56` against and found unreadable.

       THE PICTURE CANNOT ARRIVE HERE. This browser has no route to upload.wikimedia.org, so Ali's
       photo fails and takes its credit with it — which is `boxerPicFail_` doing its job. So the line
       is put back under the picture box by the card's own `boxerCredit_`, with the failed address
       forgotten first, and measured in the real stylesheet; what is measured is exactly the markup
       the card draws when the photo loads. */
```

### AND THE PANE IS FITTED AGAIN, as it is when a loaded photo's credit is there from the first paint:

in `expect`

```
/* AND THE PANE IS FITTED AGAIN, as it is when a loaded photo's credit is there from the
             first paint: without it the card was measured at the zoom it had WITHOUT the line, and
             the rest of this file reported 42px below the fold that no real phone ever has. */
```

### AND NO `.note` PARAGRAPHS.

in `res`

```
/* AND NO `.note` PARAGRAPHS. The title and the venue were two of them a browser's default
         margin apart; they are one `.fc-note` line now, and the method is in sentence case like
         every other meta line rather than in capitals. */
```

### ---------- THE FIGHTER IN THE RING LOOKS LIKE HIM, IN THE COLOURS A BROWSER ACTUALLY PAINTS

in `res`

```
/* ---------- THE FIGHTER IN THE RING LOOKS LIKE HIM, IN THE COLOURS A BROWSER ACTUALLY PAINTS -------
       THE OWNER, 10 Oct: *"make the boxers retro avatar actually look more like the boxers and their
       shorts in the fight."* `check-flow` asks which words each figure was drawn with; only a browser
       can say what colour comes out after the custom properties, their fallbacks and `.boxer-ring`'s
       own palette have all been resolved — a token renamed on one side of that chain paints the
       corner's colour and says nothing. So these ask for the computed `fill` of each part, against the
       palette entry the row's word names, at every width, as two visitors:

         a profile   Lennox Lewis — his dreads (hair drawn OUTSIDE the old head, and still inside the
                     frame), his goatee (in the face's deeper black), his skin and his usual white
                     trunks, none of them the gold stand-in's colours, the picture box still the 4:5 it
                     was told to be.
         a fight     Ali v Frazier, 1971: red trunks trimmed white in the red corner, green trimmed gold
                     in the blue, the blue corner mirrored to face left — and a corner with no trunks
                     on file, drawn beside them for the asking, painted the corner's MUTED colour by
                     the stylesheet's fallbacks, its waistband the same colour darker, no stripe.
         a stranger  Tyson v Berbick, 1986: Berbick has no row, so beside Tyson in his own skin he is
                     the silhouette — skin and hair one shadow tone, NOT the old stand-in's paper and
                     gold, which made him a pale blond man in his own black trunks.
         the dark    every skin, hair colour, trunks colour, the silhouette and both unrecorded trunks,
                     drawn for the asking, each clearing 2:1 against the stage he stands in; a black
                     beard 2:1 on every skin; and the unrecorded trunks well away from every trunks word.

       `rgb` IS WRITTEN OUT IN EACH, not shared, for the reason `fcHead` is: these functions are passed
       to the browser as source one at a time and cannot see each other. */
```

### ---------- A FIGHTER WITH NO ROW IS A SILHOUETTE, NOT A PALE BLOND MAN

in `res`

```
/* ---------- A FIGHTER WITH NO ROW IS A SILHOUETTE, NOT A PALE BLOND MAN ------------------------------
       THE REVIEW OF 10 OCT: the 53 corners with no boxer row kept the old stand-in's paper skin and, in
       the blue corner, its gold hair — while being dressed in their real trunks beside an opponent in
       his real skin. Trevor Berbick, Cleveland Williams, Andy Ruiz and Benny Paret were drawn as a pale
       blond man. A corner with no row claims no skin and no hair colour: both are ONE shadow tone.
       `paint` asks the browser what a token resolves to on a scrap element in the same ring, because a
       `color-mix` token reads back as its formula, not as a colour. */
```

### ---------- EVERY COLOUR OF THE FIGURE SHOWS AGAINST THE DARK HE STANDS IN

in `res`

```
/* ---------- EVERY COLOUR OF THE FIGURE SHOWS AGAINST THE DARK HE STANDS IN --------------------------
       THE REVIEW OF 10 OCT measured the 4x shots: black hair 1.29:1 against the stage, black trunks
       1.40:1, the deepest skin 1.97:1, a black beard on it 1.53:1. Tyson was a face and a pair of legs
       and Joshua's head a dark hood. So every colour the figure can wear is drawn here, for the asking,
       by the card's own renderer, and its computed fill is held to 2:1 against the computed fill of
       `bf-stage`, the dark behind him: six skins, eight hair colours, seventeen trunks, the silhouette
       and both unrecorded pairs. A black beard is held to 2:1 against each skin, because it sits on the
       face. The unrecorded pairs are held at least 50 apart (RGB) from every trunks word — the old
       blue fallback and the vocabulary's sky were the same light blue twice. And Mike Tyson's own
       profile is measured as drawn: his hair and trunks against his ring's stage, and the stage
       reaching above his hair, so the gold light behind the initials cannot creep back over his head.
       A failure is left on `window.__bfDark` for whoever opens the page. */
```

### ---------- THE LONGEST TAG ROW, EVERY TAG INSIDE THE CARD

in `res`

```
/* ---------- THE LONGEST TAG ROW, EVERY TAG INSIDE THE CARD -----------------------------------------
       IT WAS "the textbook's contents, every number inside the card" — sixteen chapter numbers whose
       `10.` hung past the padding at 320px. The contents card went with the books (347, part 2); what
       is widest on a content card now is its tag row, and the widest of those is Data and statistics:
       thirteen topics on a GCSE Maths card, `Scatter Graphs & Correlation` the longest pill. A pill
       is a box, so this asks that every one of them sits inside the card it is on. */
```

### ---------- THE TWO WIDGETS THAT ARE TALLER THAN A SCREEN

in `STATES`

```
/* ---------- THE TWO WIDGETS THAT ARE TALLER THAN A SCREEN ------------------------------------
     `--screen=tools` MEASURED PAGE ONE AND NOTHING ELSE. The Tools column is one widget per page,
     so nine widgets were being reported on as one — and the two that did not fit were both further
     down. Reported by the owner as "I can't scroll down on some"; measured at 390px, the cheat
     sheet maker's card was 1263px inside an 805px pane and the flyer's 1252px, so 458px and 447px
     were clipped, taking the A4 preview and the Print button with them.

     THIS IS THE `check/cards.js` LESSON, one column along: the summary said eight combinations and
     meant it, and what it did not say is that eight combinations is one page seen eight times. The
     fix is not a new rule — `ui.js` already measures sideways scroll, tap targets and contrast, and
     would have measured these — it is a STATE, which is the sentence CLAUDE.md already carries
     about the funnel's answer rows.

     BY NAME, NOT BY PAGE NUMBER. `widgetColumn_` builds from the roster, so a widget added or
     switched off moves every index after it — and a state that silently lands on the wrong widget
     is worse than one that fails, because it reports a pass about something it did not look at.
     `expect` is what makes that loud. */
```

### ---------- THE SAVED COLUMN, IN BOTH OF ITS STATES

in `STATES`

```
/* ---------- THE SAVED COLUMN, IN BOTH OF ITS STATES --------------------------------------------
     IT IS EMPTY FOR EVERY VISITOR ON A FRESH BROWSER, which is the state `check/press.js` and
     `check/ui.js` would both have measured and the only one they could reach — the same hole the
     booking receipt and the message thread were in, and the one the removed Carry-on block was in
     when a whole feature went unpressed. A column whose contents come from `localStorage` needs a
     state that seeds it or the lab reports a clean sweep of a card it never saw.

     SEEDED THROUGH `toggleFav`, THE APP'S OWN WRITER, rather than by writing the key out here: the
     prefix is `WIDGET_KEY`'s and a second spelling of it would be a second thing to keep in step.
     `leave` takes them back off, because states run in order down one page. */
```

### ---------- AN UNLISTED TUTOR, WHICH ONLY AN ADMIN IS SENT

in `STATES`

```
/* ---------- AN UNLISTED TUTOR, WHICH ONLY AN ADMIN IS SENT --------------------------------------
     REPORTED AS "where did george dissapear off to?" — and this column had been filtering unlisted
     tutors back out on the phone after `doGet` had deliberately sent them to an admin, so that
     `findCard`'s dimmed `· not listed` row and `asItem_`'s `off` flag were both unreachable code.

     NO FIXTURE CAN HOLD THIS ONE. `check/fixture.json` has a single tutor and she is listed, so the
     only account column the lab has ever measured is the one where every row is live — which is the
     hole the booking receipt, the message thread and the basket were each in. Seeded onto
     `DATA.tutors`, which is where `accountPages_` reads from and what `load()` fills.

     `only:` BECAUSE A NON-ADMIN IS NEVER SENT ONE. `doget.gs` gates it on `viewerIsAdmin`, so
     asking a stranger to reach this state would report a fault about the check rather than the app
     — the same argument as the films two blocks up. */
```

### ---------- THE SHEET THAT MAKES AN ACCOUNT

in `account`

```
/* ---------- THE SHEET THAT MAKES AN ACCOUNT ----------------------------------------------------
       ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account
       button."* The third tile opens a four-box form a signed-out visitor is the only one to see —
       and `#sheet` is a sibling of the screens, so without a state of its own neither the measuring
       pass nor the pressing pass would ever have it open. Entered through the tile's own handler. */
```

### IT OPENS ON ONE QUESTION NOW — "who is the account for?"

in `account`

```
/* IT OPENS ON ONE QUESTION NOW — "who is the account for?" — with the boxes under it not yet
       shown; the walk after 273 found a parent made a student because nobody asked. So the sheet as it
       opens is the two answers, and the two states after this one are the form each answer draws. */
```

### `offsetHeight`, NOT `getBoundingClientRect`, IN BOTH EXPECTATIONS BELOW.

in `account`

```
/* `offsetHeight`, NOT `getBoundingClientRect`, IN BOTH EXPECTATIONS BELOW. The sheet opens with a
       scale from the card it came from (`#sheet`'s transition), and a bounding box is measured through
       that transform — so on a loaded machine `check/press.js`, which looks 340ms after entering,
       caught the boxes mid-grow at under 44px and reported the state as never arrived. Layout height is
       what "is it drawn at full size" means; the tap sizes themselves are `check/ui.js`'s to measure. */
```

### ---------- AND ANSWERED "A PARENT"

in `account`

```
/* ---------- AND ANSWERED "A PARENT" ------------------------------------------------------------
       The form a parent fills: the two names on one row, their own email, a PIN, the button and the
       note saying where their child's account is made — and no grown-up's-email tick, which is a
       student's. 320x568 is where the note ran under the fold before the names shared a row. */
```

### ---------- AND WITH "I HAVE NO EMAIL" TICKED

in `account`

```
/* ---------- AND WITH "I HAVE NO EMAIL" TICKED ----------------------------------------------------
       *"so all kids can login easily with their handle and pin."* The tick is a `.check` row inside the
       sheet, between the email box and the PIN — the one line on the form a child with no address
       reads — so it is measured ticked at four widths: the label is the longest line on the sheet and
       320 is where it would wrap under its box. */
```

### ---------- SIGNING IN ON A SHARED iPAD

in `account`

```
/* ---------- SIGNING IN ON A SHARED iPAD -------------------------------------------------------------
       *"the logging in and everything feels so janky and unresponsive and slow… i feel very insecure when
       signing into the kids accounts"* (docs/history/296). Three pictures of the card nobody signed in
       sees: the handles this device has signed in as chips, Sign in pressed and waiting, and a wrong PIN
       — the box emptied, focused and edged red. `api` answers `verifyLogin` for the length of the state
       (never, or with the server's wrong-PIN refusal) and is put back. */
```

### ---------- A CHILD WITH NO HANDLE, ON AN ADMIN'S PEOPLE COLUMN

in `account`

```
/* ---------- A CHILD WITH NO HANDLE, ON AN ADMIN'S PEOPLE COLUMN ------------------------------------
       The card says "no handle yet" where the handle goes, and carries New PIN beside Message. Seeded
       into `DATA.everyone`, which the fixture does not carry, because the admin's list is built only
       for an admin's token. */
```

### ---------- A NEW PIN, SHOWN ONCE

in `account`

```
/* ---------- A NEW PIN, SHOWN ONCE ------------------------------------------------------------------
       The sheet New PIN ends in: the paper slip with the handle and the six digits, and Done. Drawn the
       way `kid-pin-go` draws it — `pinSlip_` into the sheet — so the measuring pass sees the slip at 320
       without posting a reset to anybody. */
```

### ---------- THE HANDLE, WITH EXACTLY ONE `@` IN FRONT OF IT

in `account`

```
/* ---------- THE HANDLE, WITH EXACTLY ONE `@` IN FRONT OF IT ----------------------------------
       ASKED FOR AS *"each person should have … handle llik \"@_____\""*, and the visible half of that
       had never existed: `doGet` has sent `handle` on every tutor since it was written and the only
       place the `@` appeared anywhere in `js/` was a toast.

       ONE, NOT AT LEAST ONE, AND THAT IS THE ASSERTION RATHER THAN A DETAIL. The fixture stated the
       handle as `@ada` — a shape `HANDLE_SHAPE` refuses and no row can hold — so a card drawing `@` +
       the cell rendered `@@ada`, and a rule that only asked whether an `@` was present would have
       passed on it. `check-handles.js` now refuses such a fixture; this refuses such a card. */
```

### ---------- THE AGES THEY TEACH, AS A CHIP UNDER "AT A GLANCE"

in `account`

```
/* ---------- THE AGES THEY TEACH, AS A CHIP UNDER "AT A GLANCE" ---------------------------------
       `check/fixture.json`'s tutor teaches 8 to 16, which is what `doGet` sends as `ageMin: 8,
       ageMax: 16`. The chip sits among the other facts rather than as a row of its own, and the
       assertion is the WORDS — a chip reading "8 – 16" or "Ages: 8, 16" is the card saying it
       differently from `profAges_`, which `check-flow.js` holds to every one-ended shape. */
```

### THE PAGE NUMBER COMES FROM THE BUILDER THE COLUMN IS DRAWN FROM, not from a second re-derivation of `others` here — which is the fault the flyer state above

in `enter`

```
/* THE PAGE NUMBER COMES FROM THE BUILDER THE COLUMN IS DRAWN FROM, not from a second
           re-derivation of `others` here — which is the fault the flyer state above records, where
           a count of one list indexed a column built from another. `termsPages_()` is concatenated
           after these, so counting from the end would land on a legal document. */
```

### ---------- AND THE LINE THAT SAYS WHAT THE MARK MEANS

in `account`

```
/* ---------- AND THE LINE THAT SAYS WHAT THE MARK MEANS -----------------------------------
         THE THREE SIGNALS THIS STATE ALREADY MEASURED ALL SAY A STATE AND NONE SAYS WHAT TO DO.
         The card dims, the role reads `· not listed`, the tile shows a crossed-out eye — and
         `tile_` puts a tile's label in `title` and `aria-label` only, so on a phone the way back
         is an unlabelled icon in a row of icons. Reported three times as *"i still dont see
         george"* about a tutor who was on the screen. The sentence is admin-only, so this is the
         only state in the file that can reach it. */
```

### ---------- A TUTOR'S OTHER PHOTOGRAPHS, FOUR SQUARES TO A ROW, AND NONE OF THEM OPENS

in `account`

```
/* ---------- A TUTOR'S OTHER PHOTOGRAPHS, FOUR SQUARES TO A ROW, AND NONE OF THEM OPENS ---------
       ASKED FOR AS *"tutors should be able to add more pics"*. This state opened one across the row,
       until the owner, 10 Oct: *"i dont like how you made it so people can enlarge a photo of tutor.
       the extra ones"*. So it now presses one and asks that nothing happened — the squares are still
       squares, none is a button, and nothing says it can be made bigger. `check/fixture.json`'s tutor
       carries three local pictures so the squares have something real in them. */
```

### ---------- WHAT THEY TEACH: ONE CHIP A SUBJECT, ITS LEVELS RAISED — see `teachGroups_`

in `account`

```
/* ---------- WHAT THEY TEACH: ONE CHIP A SUBJECT, ITS LEVELS RAISED — see `teachGroups_` ------
       *"Subject ^level, level, level … no brackets."* The fixture's tutor teaches one level of two
       subjects, so every chip it draws has one level and nothing wraps — which is the arrangement
       that cannot go wrong. So this seeds the one that can: a subject at four levels, and a subject
       with a long name, so a raised list has to break at 320px and the lab measures where it went —
       sideways scroll, contrast of the raised levels, and the card against its pane. Seeded onto
       `DATA.tutors` in the server's own shape, as the switched-off tutor above is, and put back. */
```

### AND THE COLUMN GOES BACK TO THE PAGE IT WAS ON.

in `account`

```
/* AND THE COLUMN GOES BACK TO THE PAGE IT WAS ON. Taking the seeded tutor out takes a page out
         from under the one this state turned to, so a bare repaint left `PAGE.account` naming a page
         that is no longer there — and `COLUMNS OUT OF LINE` reported the account column 500px off
         every other column, which was this state's own debris rather than the app. */
```

### ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — see `profQualChip_` in cards.js

in `account`

```
/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE — see `profQualChip_` in cards.js ---------
       *"for the qualifications bit, should be for example Maths subscript to it is grade and super
       script is the level."* `check-flow` reads the markup; what it cannot read is whether the CSS
       STACKS it — the level over the grade, sharing an x, on the subject's right, inside the pill and
       without making the pill taller than the chips beside it. So this seeds a tutor with every case
       (both halves, a level alone, a grade alone, still studying, a long subject, a certificate) in
       the server's own shape, and measures each chip in the browser at every width — which also puts
       the notation's contrast and the row's sideways scroll in front of `check/ui.js`. Put back after,
       the page included, for the reason the state above gives. */
```

### `teachesSpec` IS SET HERE AND NOT BORROWED FROM THE FIXTURE'S TUTOR:

in `enter`

```
/* `teachesSpec` IS SET HERE AND NOT BORROWED FROM THE FIXTURE'S TUTOR: the gap below is measured
           against a Teaches chip on the same card, and a fixture edited to teach nothing would turn that
           comparison into a silent pass. */
```

### THE SAME AIR AS THE TEACHES LEVEL.

in `expect`

```
/* THE SAME AIR AS THE TEACHES LEVEL. The brief said match the Teaches chips, and the first build
           put the stack 1.75px from its subject where the Teaches level sits 4.69px from its own — on one
           card, two notations at two distances. Measured from the subject's last letter to the first
           thing raised, on each kind of chip; no Teaches chip at all is a failure, not a pass. */
```

### ONE LINE OF TEXT IS ONE PLAIN PILL TALL.

in `ok`

```
/* ONE LINE OF TEXT IS ONE PLAIN PILL TALL. A subject long enough to wrap is taller because
             of its words, which is not what is being asked; the stack must still sit beside its last
             word — the same line — and inside the pill. */
```

### ---------- WHERE THEY TUTOR, AS A HEAT MAP — see `profHeat_` in cards.js

in `account`

```
/* ---------- WHERE THEY TUTOR, AS A HEAT MAP — see `profHeat_` in cards.js ------------------
       *"just let it be a heat map of the areas"*. The fixture's tutor ticks three: one venue WITH
       coordinates, one WITHOUT (left off rather than guessed), and Online (a chip, not a place). So
       the map must carry exactly one glow, the Online chip must be under it, and no venue's name may
       be printed on the card — which is the whole point of the change. Also the five captions and no
       sixth: *"there should be x number of titles"*. */
```

### AND `Available` AFTER IT, which is the one caption added since the five were asked for — "tutors availability should appear on their card."* It is the week

in `expect`

```
/* AND `Available` AFTER IT, which is the one caption added since the five were asked for —
           *"tutors availability should appear on their card."* It is the week, drawn by `profAvail_`
           only for a tutor who has ticked an hour, so it may follow the map and nothing else may. */
```

### ---------- A TUTOR'S HOURS ON THEIR CARD — see `profAvail_` in cards.js

in `account`

```
/* ---------- A TUTOR'S HOURS ON THEIR CARD — see `profAvail_` in cards.js -----------------------
       *"tutors availability should appear on their card."* The fixture's tutor sends what `doGet`
       sends — 77 codes, nine of them 'TRUE' (Mon 16-18, Tue 10-11, Wed 16, Sat 10-12) — and is
       already teaching Mon 17. So eight hours lit, Mon 17 greyed, and the three days nothing is
       ticked on (Thu, Fri, Sun) NOT DRAWN — they were thin collapsed rows until the owner, 10 Oct:
       *"no need to display monday if they dont have any hours on monday."* Measured at every width
       because it is the last thing on a card that is already near its pane's height.

       AND MONDAY 17 MUST NOT LOOK LIKE MONDAY 9. A taught hour was `hr shut`, the same dark cell as an
       hour never ticked, with the difference in a `title` no phone shows — so a day kept only for a
       taught hour was a row of nothing (found in review). Asked of the browser's COMPUTED style, not
       the class: a class with no rule behind it is the fault itself. And the key that says what the
       hatching means is under the week, because Ada is teaching one of her hours. */
```

### ---------- YOUR FAMILY, A CARD EACH

in `account`

```
/* ---------- YOUR FAMILY, A CARD EACH ------------------------------------------------------------
       ASKED FOR AS *"students should be able to see their parents and likewise"*. `DATA.family` is a
       key the fixture cannot carry — `doGet` builds it from the signed-in person's own accepted
       links — so it is seeded here, which is the state a payload with a family in it produces: one
       parent and one child, so both labels are drawn and measured. Long names on purpose, because
       the name is the widest thing on the card. */
```

### ---------- YOUR OWN CARD WHILE YOUR EMAIL IS UNPROVED

in `account`

```
/* ---------- YOUR OWN CARD WHILE YOUR EMAIL IS UNPROVED ---------------------------------------------
       The PR #130 review: `notify` sends a PENDING address nothing, and nothing on the phone said so —
       a parent whose link went to spam booked and heard nothing. Now a line under your own card says
       the mail waits for the link, with "Send the link again" beside Sign out. `pendingEmail` is a key
       of the sign-in reply the fixture visitor does not carry, so it is set here, and the address is a
       long one with no space in it on purpose: it is the widest thing on the line. */
```

### ---------- YOUR OWN CARD, BEING EDITED — `cardEditHtml_` in me.js (docs/history/330)

in `account`

```
/* ---------- YOUR OWN CARD, BEING EDITED — `cardEditHtml_` in me.js (docs/history/330) ----------------------
       The owner, 10 Oct: *"all of this stuff should be editable directly on the tutors card for that
       respective tutor."* The visitor is the fixture's admin, who has no tutor row, so one is put in the
       payload under their id — a copy of the fixture tutor's — and their `USER.profile` is filled the way
       `myProfile` fills it, the WIDEST case rather than the tidiest: the longest headline and words a card
       holds, three qualifications, three photographs, three venues and a week with hours on four days. The
       form is every section of the card at once, so it is the tallest thing on the column and is measured at
       every width — the boxes, the shelf, the picker and the week each in a card narrower than Settings'. */
```

### SAVE AND CANCEL IN REACH WITH THE FORM AT ITS TOP — the review of 330:

in `expect`

```
/* SAVE AND CANCEL IN REACH WITH THE FORM AT ITS TOP — the review of 330: the one Save sat under the
             week, 1,952px down at 390. The row is stuck to the foot of the pane (`.ce-tiles`, style.css), so
             with the pane scrolled to its top the Save tile is inside the pane's visible box. */
```

### ---------- AND ANOTHER TUTOR'S CARD, EDITED BY AN ADMIN

in `account`

```
/* ---------- AND ANOTHER TUTOR'S CARD, EDITED BY AN ADMIN ---------------------------------------------------
       Decision 3 of the brief: `updateProfile` already lets an admin write another person's row, so an admin's
       Edit on the fixture tutor opens the same form — filled from `getProfile`, which the lab's backend cannot
       answer, so the copy it would have returned is put where the answer goes. The picture is shown and not
       offered (`savePhoto` writes the admin's own row), with one line saying why. */
```

### ---------- EVERYBODY'S OWN CARD, BEING EDITED — THE FIGURE AND THE HANDLE ON IT (docs/history/339)

in `account`

```
/* ---------- EVERYBODY'S OWN CARD, BEING EDITED — THE FIGURE AND THE HANDLE ON IT (docs/history/339) ---------------
       THE OWNER, 11 Oct: *"the random name generator should be one of the editable things in the profile settings of
       the profile card. your figure should also be in your profile card editing."* Edit on your own card is
       everybody's now, and for somebody with no public card — the lab's admin, a parent, a student — the form is the
       four sections their card prints: the picture, the figure (the wardrobe, which was the last page of Settings),
       the name and the handle (Randomise, which was on Settings' Signing in card). Each is measured at every width,
       as the visitor the lab has (an admin with no tutor row) and then as a parent and a student, by giving the
       same visitor that role the way the exam-dates state on Settings does. `USER.profile` is filled the way
       `myProfile` fills it (`phone_cc`), or the form waits for a copy it can trust. */
```

### ---------- YOUR HANDLE, ON YOUR OWN CARD: SHOWN, WITH RANDOMISE, AND NO BOX

in `account`

```
/* ---------- YOUR HANDLE, ON YOUR OWN CARD: SHOWN, WITH RANDOMISE, AND NO BOX ----------------------------------
       ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise it but it will
       follow that general name."* — and on 11 Oct, *"the random name generator should be one of the editable things in
       the profile settings of the profile card"*, so it is the handle section of your own card's Edit, where the card
       prints it under your name (it was on Settings' Signing in card). FOUR THINGS TOGETHER, because each on its own
       passes a section that got one of the others wrong: exactly one shown handle and it is `USER.handle`, exactly one
       `@` in front of it (the `@@ada` fault `check-handles.js` guards in the fixture), one Randomise TILE, and nothing to
       type into — and a fifth, the line under it saying Cancel does not put the old one back, because the press saves at
       once. The pane is scrolled so the section is on the glass, and that is asked too. */
```

### ---------- THE WARDROBE, ON YOUR OWN CARD — ONE SECTION, AND A PICK THAT REDRAWS IT

in `account`

```
/* ---------- THE WARDROBE, ON YOUR OWN CARD — ONE SECTION, AND A PICK THAT REDRAWS IT -------------------------------
       It was the last page of Settings, "Your figure", one card since *"should just be 1"*; on 11 Oct, *"your figure
       should also be in your profile card editing"*, so it is the figure section of your own card's Edit, straight
       under the picture. ONE section holding the swatches, all six slots and ONE figure; the pane scrolled to it, so it
       is measured on the glass at every width. And a pick, the same tick as the press (`avatarSave` redraws before the
       server answers; the lab's stub answers with the payload, which carries no `avatar`): the figure redrawn, the
       picked item ringed, AND THE PICTURE'S "YOUR FIGURE" ONE SECTION UP REDRAWN WITH IT — the figure is what the
       picture draws (docs/history/324), so the two must never disagree on one form. */
```

### ---------- YOUR PICTURE, CHOSEN — `photoPicker_` in me.js

in `account`

```
/* ---------- YOUR PICTURE, CHOSEN — `photoPicker_` in me.js ------------------------------------
       *"everyone should have a profile picture selector widget in account settings"* — the picture section of
       your own card's Edit since docs/history/339, for everybody, so these three states are the You column's. Seeded with a
       picture already kept, so the preview is a photograph rather than the initial and `Remove` is
       live: a square preview, `Choose photo` and `Remove` as tiles, the hidden file input that takes
       images, and no link box. At four widths, because the preview sits beside two tap targets and
       a line of text and is the one row on the card that could wrap at 320. */
```

### ---------- YOUR PICTURE, ONE OF ELEVEN — AT REST, AND WITH THE FOX CHOSEN

in `account`

```
/* ---------- YOUR PICTURE, ONE OF ELEVEN — AT REST, AND WITH THE FOX CHOSEN ---------------------
       THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like
       xbox dp selector, which allow you to use your avatar as a dp."* The grid under the preview: your
       figure first, then the ten, every one a 44px target or more, in one block that fits the card —
       FOUR TO A ROW where the picker is under 294px wide (three rows) and SIX where it is not (two
       rows), the line under the grid rather than beside the tiles. At rest nothing is ringed and the
       preview is your initial; with the fox chosen the preview IS the fox, the gold ring is on it and
       only it, and Remove is live because there is a picture to remove. Measured by `check/ui.js` at
       every width for the tap targets, the contrast and the sideways scroll; asserted here for the
       shape, because a grid of eleven that wraps 5-5-1 or runs off the card measures as eleven fine
       buttons. */
```

### ---------- THE SETTINGS COLUMN, WHICH THIS FILE HAD NEVER DECLARED A STATE FOR

in `STATES`

```
/* ---------- THE SETTINGS COLUMN, WHICH THIS FILE HAD NEVER DECLARED A STATE FOR ----------------
     IT HAS THIRTEEN PAGES AND THE LAB HAD ONLY EVER SEEN THE FIRST. `check/ui.js` measures the page
     a column opens on, so `About you` was the whole of Settings as far as this file was concerned.
     Same fault as the Find screen measured only on its first question, one column along: what was
     missing was never a rule, it was a state. (The library cards, the wardrobe, the handle and the
     picture were pages here and are measured where they are now — Tools, and your own card's Edit on
     the You column — since docs/history/339.)

     EVERY CARD IS FOUND BY ASKING THE DOM. A literal page number would drift the moment a
     deployment sends one `profileFields` group fewer, and a state that lands on the wrong page fails loudly
     through `expect` rather than measuring the wrong card in silence. */
```

### ---------- YOUR CHILD'S ACCOUNT, MADE: THE SLIP ON "MANAGE YOUR CHILD"

in `settings`

```
/* ---------- YOUR CHILD'S ACCOUNT, MADE: THE SLIP ON "MANAGE YOUR CHILD" -----------------------------------------
       *"so all kids can login easily with their handle and pin."* After "Make their account" the make section of
       "Manage your child" (one card since docs/history/339, the make and the add forms under the children linked to
       you) grows a paper slip with the handle and the PIN, held as `KID_MADE` for the signed-in parent. The admin
       visitor holds the role the card is for, so it is drawn; the slip is set straight into the state, as `kid-make`
       sets it, and the page holding the card is turned to. The card is the tallest thing on the column with the slip
       on it — both forms and the slip — so it is measured at every width. */
```

### A FORM LEFT UNSAVED OR SENDING BY WHATEVER RAN BEFORE -- `check/press.js` presses every Save on this column first -- makes `paint` keep the column rather than

in `enter`

```
/* A FORM LEFT UNSAVED OR SENDING BY WHATEVER RAN BEFORE -- `check/press.js` presses every Save
           on this column first -- makes `paint` keep the column rather than throw typing away
           (`settingsKeep_`), so the slip was set and never drawn: "did not arrive" in the full suite,
           green alone. Cleared as the photographs state below clears them. */
```

### ---------- AND HELD FOR THE LINK: A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED

in `settings`

```
/* ---------- AND HELD FOR THE LINK: A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED ------------------------
       The PR #130 review: no child is put on an account until its address is confirmed (`confirmFirst_`
       in people.gs), so a PENDING parent's "Manage your child" holds ONE sentence where the two child forms
       would be — the address and "Send the link again". It was a card of its own drawn instead of two; it is
       the same one card either way since docs/history/339. Seeded through `USER.pendingEmail`, which the
       sign-in reply carries and the fixture visitor does not, with a long address that has no space in it. */
```

### ---------- MANAGE YOUR CHILD, WITH CHILDREN LINKED, AND WITH NONE (docs/history/339)

in `settings`

```
/* ---------- MANAGE YOUR CHILD, WITH CHILDREN LINKED, AND WITH NONE (docs/history/339) ----------------------------
       The owner, 11 Oct: *"chagne the add/make you child widget into one widget which is manage you child."* The card
       opens with the children already linked to you — a face, a first name, a handle and New PIN at the end of each
       line — and then the two forms. `DATA.family` is built by `doGet` for the signed-in person and the fixture cannot
       carry it, so it is seeded as the family state on the You column seeds it, stamped as this visitor's: three
       children, the longest first name and handle a line will hold, one face a photograph, one the fox and one an
       initial. And with none linked, the one line that says so. */
```

### NEVER DRAWN SMALLER (the review of docs/history/339):

in `expect`

```
/* NEVER DRAWN SMALLER (the review of docs/history/339): two forms and a New PIN per child are there to be
           typed into and pressed, so the card is at full size and its pane scrolls — `paneReach_`'s card-editor
           rule. At 320x568 it was drawn at 70-84%, every control under 44px. And the two forms are headed in a
           readable size, because the server's email sends a parent to find those words. */
```

### ---------- A NEW ADDRESS WAITING FOR ITS LINK, ON THE CONTACT CARD

in `settings`

```
/* ---------- A NEW ADDRESS WAITING FOR ITS LINK, ON THE CONTACT CARD ----------------------------------
       Round three of the PR #130 review: a new address typed in Settings is not written until the account,
       signed in, opens the link sent to it (`authMove*_` in booking.gs). The box keeps the waiting address,
       a line under the row names both — the new one and the one that still signs in — and "Send the link
       again" sits beside Save. Seeded through `USER.profile.email_moving`, which `profileOf_` sends and the
       fixture visitor does not, with two long addresses that have no space in them. */
```

### ---------- THE PHOTOGRAPHS PAGE: THE FACE, THE CLIP, AND A SHELF OF EIGHT

in `settings`

```
/* ---------- THE PHOTOGRAPHS PAGE: THE FACE, THE CLIP, AND A SHELF OF EIGHT ------------------
       Eight boxes are IN the form whether or not they are drawn — `photosIn` rebuilds the whole cell
       from what arrives, so a box missing from the form is a photograph deleted on Save — and only
       the filled ones SHOW, each with a thumbnail of the link beside it and one `Add another` under
       them. Seeded through `USER.profile`, which is what the column is drawn from. */
```

### ---------- THE FOUR FIELDS THAT ARE THE QUOTE, WHICH THE FIXTURE HAD NEVER SENT

in `settings`

```
/* ---------- THE FOUR FIELDS THAT ARE THE QUOTE, WHICH THE FIXTURE HAD NEVER SENT -------------
       `Group size` AND `Your rate` WERE TWO PAGES WITH A SAVE EACH and are one page now, because
       they are one decision and one monthly clock — asked for as *"…all together. and they can only
       change once a month."* `check/fixture.json` carried neither group, so the lab has never
       rendered a pricing box at all: the same hole the booking receipt, the message thread and the
       basket were each in, and the third time in three commits that the fixture was found stating a
       shape `doGet` does not send.

       FOUND BY ASKING THE DOM for the rate box, exactly as the wardrobe state below does. A literal
       page number drifts the moment a deployment sends one group fewer. */
```

### EXACTLY SEVEN, NOT MERELY SOME.

in `settings`

```
/* EXACTLY SEVEN, NOT MERELY SOME. `expect` is read as a truthy value, so a page holding two
         boxes would pass a bare count — and two is precisely what splitting the group back into
         `Group size` and `Your rate` produces. The whole point is that they are on ONE page, so the
         number is the assertion. SIX SINCE docs/history/330: the four pricing boxes and the session
         length (`SESSION_FIELDS`, constants.gs — on this page, not under its clock), which a tutor
         with a card edits on the card and a tutor not yet listed edits here. Two ranges, four boxes.
         SEVEN SINCE docs/history/345: the business's cut of an extra seat (`extra_seat_cut`), beside the
         tutor's own share — a box for the lab's admin, who sets it, and enabled for them. */
```

### ---------- THE AGES A TUTOR TEACHES, ON ABOUT YOU AND NOT ON THE PAGE ABOVE

in `settings`

```
/* ---------- THE AGES A TUTOR TEACHES, ON ABOUT YOU AND NOT ON THE PAGE ABOVE ------------------
       ONE `[youngest] – [oldest]` ROW OF TWO SELECTS, and the assertion is that shape rather than the
       presence of two fields: two plain boxes would mean `validations` never carried `AGE_OPTIONS`, and
       the form would be offering free text to a server that refuses anything off the list. The
       options are read off `DATA.validations` rather than written out here — a list typed into this
       file would be a third copy of one the backend owns.
       NOT ON THE RATE PAGE, which the state above counts at exactly four boxes: an age range prices
       nothing, so it is not under the month's clock. Seeded through `USER.profile` with one end the
       word `Adults`, because that is the option a number-shaped reader would get wrong. */
```

### ---------- THE TUTOR AGREEMENT, BOTH OF ITS STATES

in `settings`

```
/* ---------- THE TUTOR AGREEMENT, BOTH OF ITS STATES --------------------------------------------
       The signed-in visitor is an admin, and `isTutorRole()` is tutor-or-admin, so the card is on
       the column. Seeded as SIGNED through `USER` — the field `loginReplyFor_` sends — because the
       locked box is the half that is easy to get wrong: a ticked box a repaint draws unticked is the
       `REEL_HELD` fault, and a signed agreement that can be clicked again is the whole complaint.
       `leave` puts the visitor back as unsigned, since states run in order down one page. */
```

### A CLEAN COLUMN FIRST.

in `enter`

```
/* A CLEAN COLUMN FIRST. `paint('settings')` is refused while a card has something typed in
           it — `settingsKeep_`, so a Save's reload cannot throw away another card's typing — and
           `check/press.js` has been typing into these cards for a minute before any state runs. The
           refused paint left the state measuring the card from before its own seed, and reported
           two settings states as not arriving that `check/ui.js`, which types nothing, found fine. */
```

### ---------- YOUR ROLES, WITH A TUTOR TICK WAITING — `rolesCard_` in me.js

in `settings`

```
/* ---------- YOUR ROLES, WITH A TUTOR TICK WAITING — `rolesCard_` in me.js ---------------------
       *"each account should have a widget in account settings which say what the roles are … like
       multiselect."* The lab signs in as an admin, and an admin is never pending — so the state plays
       a parent who has ticked Tutor and been told to wait: `role`, `roles` and `tutorPending` as the
       sign-in reply sends them. That is the card's fullest drawing: two ticks of three, two-line
       labels, and the waiting sentence under the tile — the one row that could wrap at 320 and the
       three 44px targets that must not shrink with it. `leave` puts the admin back exactly. */
```

### ---------- THE WEEKLY PARENT EMAIL'S CARD AND ITS PREVIEW WERE TWO STATES HERE

in `settings`

```
/* ---------- THE WEEKLY PARENT EMAIL'S CARD AND ITS PREVIEW WERE TWO STATES HERE --------------------
       The card is gone from the phone (the owner, 12 Oct: *"sounds dumb delete that widget"*), with its
       Preview sheet and its file, js/digest.js; the Sunday email stays on the server, switched off
       (docs/history/346). Progress's journey state asks that no card of it is drawn anywhere. */
```

### ---------- THE QUALIFICATIONS: ONE LINE A QUALIFICATION, AND IT FITS

in `settings`

```
/* ---------- THE QUALIFICATIONS: ONE LINE A QUALIFICATION, AND IT FITS ---------------------------
       ASKED FOR AS *"can you make the qualifications widget more efficient, elegant, intuitive and take
       up less space."* Measured before: seven qualifications were 900px at 320x568 — drawn at 70%,
       the floor, and still scrolling. What this asserts, at every width, is the shape and the DATA
       CONTRACT under it:
       - all seventy `qual_*` boxes in the form, drawn or not, because `qualsIn` rebuilds the person's
         rows from what arrives and a slot missing from the form is a qualification deleted on Save;
       - one line a qualification, each subject named once, the level over the grade in the profile
         chip's own `.prof-iso`, and the DBS written plain;
       - Teach and Can teach as HIDDEN TRUE/FALSE boxes, no checkbox and no glyph to decode;
       - one `+` tile and no Save — every answer saves itself;
       - AND THE CARD FITS ITS PANE AT FULL SIZE: its own height (a zoomed card's `clientHeight` is
         still its height at zoom 1) is no more than the pane's. That is the "less space", as a number
         this file can fail on, rather than as a screenshot somebody has to remember to take.
       FOUND BY ASKING THE DOM for the tenth slot's place box, which exists whether or not it shows. */
```

### THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the column is drawn from — the tutor the redesign was measured with.

in `enter`

```
/* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the
           column is drawn from — the tutor the redesign was measured with. Written out in each state
           rather than shared, because a state is sent to the page as source. */
```

### AND THE PHYSICS A-LEVEL OPEN, through a tap on its own line.

in `settings`

```
/* AND THE PHYSICS A-LEVEL OPEN, through a tap on its own line. One thing open, in place — every
       other line still on the card — the three-way control with `Can teach` lit (that is what it
       holds), every box captioned, `Still studying` offered in Finished, and the tick and the bin at
       opposite ends of their row. */
```

### THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the column is drawn from — the tutor the redesign was measured with.

in `enter`

```
/* THREE SUBJECTS AT TWO LEVELS AND AN ENHANCED DBS, through `USER.profile`, which is what the
           column is drawn from — the tutor the redesign was measured with. Written out in each state
           rather than shared, because a state is sent to the page as source. */
```

### AND THE DBS OPEN — A CERTIFICATE'S EDITOR.

in `settings`

```
/* AND THE DBS OPEN — A CERTIFICATE'S EDITOR. *Walked at 390:* it offered Grade and Teach / Can teach /
       Not teaching, neither of which a certificate has, and Teach would have listed the DBS under Teaches
       on the profile. Now: no grade, no three-way control, the year and the issuer side by side under
       their certificate captions, and the tick and the bin. Mutation: `.is-cert` off the slot — the grade
       and the control come back, and the issuer drops to a row of its own. */
```

### AND A LINE BEING ADDED, through the `+`.

in `settings`

```
/* AND A LINE BEING ADDED, through the `+`. *Walked:* its face said `New qualification` in the
       subject's 10ch column — "New / qualificat / ion", the first thing seen after `+` — over the boxes
       that say the same. A line not yet saved has no face: its editor, under the gold rule, is the line.
       Mutation: the `[data-new] > .q-line` rule removed — the face is drawn again. */
```

### THE SUBJECT BOX TAKES THE FOCUS a tick later (`qualNext_`) — it opened the app's own list here until the dropdowns were the platform's again (note 315), and

in `enter`

```
/* THE SUBJECT BOX TAKES THE FOCUS a tick later (`qualNext_`) — it opened the app's own list here
           until the dropdowns were the platform's again (note 315), and this shut that list so the card
           was what got measured. A focused box is part of the card a person is looking at, so it stays. */
```

### ---------- THE THREE DATE-OF-BIRTH BOXES, ON A GROUP THE FIXTURE DID NOT HAVE

in `settings`

```
/* ---------- THE THREE DATE-OF-BIRTH BOXES, ON A GROUP THE FIXTURE DID NOT HAVE ---------------
       `check/fixture.json` SENT NO `Contact` GROUP, so nothing in this lab had ever drawn a date of
       birth at all — the fourth time that file has been found stating a shape `doGet` does not
       send, after `focus` as a string, the receipt's `sessionDates` against `dates`, and the job's
       `students` and `venue`. `PROFILE_GROUPS` has had `['email','phone','date_of_birth']` since it
       was written; the fixture has it now too, in the same place.

       EXACTLY THREE, NOT MERELY SOME. `expect` is read as a truthy value, so a page holding one box
       passes a bare count — and one box is precisely what the version before this drew. The number
       IS the assertion, which is the same reason the pricing state counts to four.

       FOUND BY ASKING THE DOM, like every other state on this column: `settingsPages_`'s length
       varies with what the backend sends, so a literal page number drifts the moment a deployment
       sends one group fewer. */
```

### ---------- THE TWO EXAM DATES, WHICH ONLY A STUDENT IS OFFERED

in `settings`

```
/* ---------- THE TWO EXAM DATES, WHICH ONLY A STUDENT IS OFFERED ------------------------------
       ASKED FOR AS *"allow student accounts to be able to write exam dates. like Small exam: _____
       big exam:_____."* The group is in `STUDENT_GROUPS` and in neither of the other two maps, which
       is what makes it appear for a student and for nobody else — so it is unreachable as the admin
       every other state on this column is measured as, and would have gone unmeasured for exactly
       that reason.

       `USER.role` IS THE APP'S OWN DOOR AND IS WHY THIS IS NOT A POKE. `loginReplyFor_` sends the
       role and `data.js` writes it onto `USER`, so a state that sets it and repaints is the state a
       student's own sign-in produces — the same argument as the message thread seeded through
       `MESSAGES`, which is what `loadMessages` writes.

       `studentFields` WAS `[]` IN THE FIXTURE, which is not what `doGet` sends — it sends
       `STUDENT_GROUPS`, an object — so `Object.keys([]).length` was 0, `settingsPages_` fell through
       to the tutor's map, and a student's whole settings column has never been drawn here at all.
       The FIFTH time that file has been found stating a shape the server does not send.

       IT PUTS THE ROLE BACK, because states run in order down one page and a lab left holding a
       student would measure every column after this one as the wrong visitor. */
```

### BOTH, AND BOTH A REAL DATE PICKER.

in `settings`

```
/* BOTH, AND BOTH A REAL DATE PICKER. `expect` is truthy-read, so a bare count passes on a page
         holding two plain text boxes — which is precisely what `FIELD_IS_DATE` failing to match
         produces, and the whole point of the `_date` suffix. So the type is the assertion. */
```

### ---------- A SEVERAL-OF-A-LIST FIELD, OPEN, WITH A BOX TICKED

in `settings`

```
/* ---------- A SEVERAL-OF-A-LIST FIELD, OPEN, WITH A BOX TICKED ---------------------------------
       IT WAS A BUTTON THAT HUNG `#drop`, the booking form's floating panel, which is a sibling of the
       screens — so the only way this lab ever saw the panel, or the press pass ever reached
       `me-many-pick`, was a state that opened it. On 9 October the owner asked for *"a more stable
       standard simple conventional drop down list"* (note 315), and the field is a `<details>` now:
       its summary is the field, and open, its ticks are real checkboxes under it IN the card, pushing
       the card longer — which is exactly what `check/ui.js` has to lay out and measure at every width.

       OPENED THROUGH THE SUMMARY, the browser's own door, and ONE BOX TICKED the way a finger ticks it —
       the box flips and `change` bubbles — so what is measured is the field with an answer in it, and
       what is asserted is that the answer reached the hidden box `me-save` reads. Shut and put back on
       the way out, because states run in order down one page. */
```

### ---------- AN ORDINARY SELECT, ANSWERED

in `settings`

```
/* ---------- AN ORDINARY SELECT, ANSWERED ------------------------------------------------------------
       THIS WAS "A DROPDOWN OPEN" — a click AT a settings select, which hung the app's own panel off it
       for this lab to measure (note 226). The open list is the platform's again (note 315) and no page
       can draw, measure or press it, so there is no open state to enter. What a select still does to a
       card is be ANSWERED: the value moves, `change` bubbles, the card is marked as holding an unsaved
       answer. Answered here the way the platform's list answers — the value, then `input` and `change`,
       bubbling — and put back on the way out. */
```

### "ALSO TEACH, OPEN" WENT WITH THE PAGE.

in `settings`

```
/* "ALSO TEACH, OPEN" WENT WITH THE PAGE. What a tutor teaches is two ticks on each
       qualification now — `the qualifications` above counts them — and `teaches_also` is derived
       from those on save, so there is no panel on this column to open. */
```

### `repaint`, AS THE STAR ON SAVED DOES (`on('fav')` in find.js), NOT `paint`:

in `enter`

```
/* `repaint`, AS THE STAR ON SAVED DOES (`on('fav')` in find.js), NOT `paint`: `paint` draws the
           markup and starts nothing, so this measured two widgets that had never started — which since 9
           Oct is two widgets under the loader (`widgetOnColumn_`), and was always two widgets nobody
           could have been looking at. `repaint` draws and starts them. */
```

### ---------- THINGS KEPT, DRAWN AS FIND DRAWS THEM

in `saved`

```
/* ---------- THINGS KEPT, DRAWN AS FIND DRAWS THEM ------------------------------------------
       THE STATE ABOVE KEEPS WIDGETS, and a kept practical, boxer or pencil had never been drawn
       here. Each was wrapped in `.card.is-widget` — a widget's own framed body — inside the pane,
       which draws that frame already: a card in a box in a box, 14px narrower each side than the
       same card on Find. Seeded through `toggleFav`, the app's own writer, one of each kind that is
       drawn differently; `leave` takes them back off. */
```

### ---------- THE LIBRARY CARDS STARRED ONTO SAVED, TYPED INTO, AND A REPAINT (the review of docs/history/339)

in `saved`

```
/* ---------- THE LIBRARY CARDS STARRED ONTO SAVED, TYPED INTO, AND A REPAINT (the review of docs/history/339) --------
       A library card has no draft (its PIN is on it), so what keeps typing on the starred copy is the hold: Saved's
       `.widget-slot .me-form` in `KEEP_FORMS_` marks it dirty, `settingsKeep_('saved')` holds the column, and a
       repaint leaves the box — the same element, the same words. Asked HERE, in a browser, because check-flow
       cannot reach a starred copy: jsdom has no `CSS.escape`, so `$('lib-box')` falls back to the first copy, the
       one on Tools. Measured in the review with either half of the hold taken away: the box was replaced and said
       "Merton", the sheet's copy, over what was typed. Starred, typed into once the Saved copy is drawn, repainted,
       and what the box is and holds written down for `expect`. */
```

### ---------- THE SHOP WINDOW, EMPTY AND FULL, AND THE EMPTY ONE IS TWO DIFFERENT CARDS

in `STATES`

```
/* ---------- THE SHOP WINDOW, EMPTY AND FULL, AND THE EMPTY ONE IS TWO DIFFERENT CARDS --------
     `check/fixture.json` SENDS `spotlight: []`, so the unnamed state below is the empty column —
     and it is not one card but two, because the sentence an ADMIN is shown says how to fill it and
     the one everybody else is shown says what the column is for. Both are measured, because the
     unnamed state runs for both visitors.

     SEEDED THROUGH THE PAYLOAD AND `adoptSpotlight_`, which is the app's own door: `DATA.spotlight`
     is what the backend sends and that function is the only thing that reads it. Poking `SPOT`
     directly would measure a shape `doGet` does not send, which is the fixture fault this file has
     now been caught committing four times.

     TWO KEYS OFF `stuffItemsAll_()` RATHER THAN A LITERAL. A key written in here is a key that goes
     stale the moment the fixture changes, and the column's whole job is to draw the cards those
     keys name — a state that seeds a key nothing matches measures the EMPTY column while claiming
     to measure the full one. */
```

### ---------- THE BUSINESS RECORDS, A COLUMN OF THEIR OWN AND ONLY AN ADMIN'S

in `STATES`

```
/* ---------- THE BUSINESS RECORDS, A COLUMN OF THEIR OWN AND ONLY AN ADMIN'S ------------------------
     They were pages of an admin's Settings, measured there by the two states below; *"the business
     checklist stuff should go in their own column at the end"* (the owner, 10 Oct) moved them, and the
     states moved with them (docs/history/334). EVERY STATE HERE IS `only:` AN ADMIN, the unnamed one
     included — for anybody else the column is not in `TABS`, `go('biz')` lands on the front door, and
     measuring that as this column would be a finding about the check. `check/ui.js` and
     `check/press.js` skip a column a visitor is not given as well, so a state that forgot its `only`
     still measures nothing in the stranger's name.

     THE UNNAMED STATE ASKS WHAT IT IS LOOKING AT, for Progress's reason: the column a person lands on,
     the five cards in order, each with its Save — and ANSWERED, no loader left on it. Arriving asks
     `listRecords` (`bizStart_`), and the first run measured 390 with the dots still over the boxes
     because a loaded machine answered late; the wait is `the business records still coming`, below,
     held on purpose, and this one is the column once the answer is in. */
```

### THE INSURANCE CARD WITH SOMETHING RECORDED.

in `biz`

```
/* THE INSURANCE CARD WITH SOMETHING RECORDED. `only:` for the flyer's reason: nobody else is drawn
       one, so asking a stranger to reach it would be a finding about the check. SEEDED THROUGH
       `BIZ.list`, which is what `listRecords` writes — the fixture answers every POST with the payload,
       so without a seed the page is measured with every box empty and no flag, which is half of what
       the card can draw. One item due in ten days, so the Due soon flag is on the screen and measured. */
```

### AND EACH ROW'S TWO BOXES ARE ONE WIDTH.

in `expect`

```
/* AND EACH ROW'S TWO BOXES ARE ONE WIDTH. The row is `.lib-row.q-row`, a class pair borrowed
             from the qualification editor — and when that editor was redrawn, its `.lib-row.q-row` rule
             went with it and these rows fell back to `.lib-row`'s wide box beside a 7rem one, with
             nothing here to notice. The rule is back, and this is what says so. */
```

### THREE WIDGETS WAITING ON A REAL REQUEST, HELD, AND THEN LET GO — this one, and the Videos card and the camera, which are declared with their own columns

in `biz`

```
/* ==============================================================================================
       THREE WIDGETS WAITING ON A REAL REQUEST, HELD, AND THEN LET GO — this one, and the Videos card
       and the camera, which are declared with their own columns

       THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic
       simple loading thing while it's info or whatever is loading."* `loading_()` (shell.js) is that
       thing now, and these are the states that put it on the screen where `check/ui.js` can measure
       it: the business records (`listRecords`, a POST), the Videos card (`data/videos.json`, a file)
       and the camera (`getUserMedia`, the device). Each is HELD — the request is made by the app's
       own code and its answer kept back — so what is measured is the wait the app really draws,
       not a picture of one.

       `release` LETS IT GO, and `landed` says the content has arrived. `check/ui.js` measures the
       loader while it is held (one box, the same size on every card, centred), takes the card's
       height, releases, waits for `landed`, and takes it again: a loader that holds its room leaves
       the card the height it was. `leave` puts back what was there before and DROPS the held answer
       rather than delivering it — `check/press.js` never releases, and an answer arriving after the
       state has gone would land in the middle of the next one.

       THESE ARE THE KIND THAT HOLDS THE CARD — the loader drawn OVER what is already there, which is
       the only kind that can: a verse or a list whose length is not known until it lands is drawn
       where it lands, and the card is the size of what came. */
```

### ---------- PROGRESS: THE PLACEHOLDER, OR A STUDENT'S JOURNEY — EITHER WAY ASSERTED

in `STATES`

```
/* ---------- PROGRESS: THE PLACEHOLDER, OR A STUDENT'S JOURNEY — EITHER WAY ASSERTED ------------------
     NOT LEFT TO THE DEFAULT. A column with no entry here is measured in the state it opens in with
     nothing asked of it, and "nothing to press" printed by `check/press.js` is the same silence
     whether the column drew its card or drew nothing. So the unnamed state says what it must be looking
     at, for each visitor: signed out, the placeholder — "Not built yet." and not a control on it, which
     is the placeholder rule (`drill` in map.js) measured in a real browser rather than read off markup;
     signed in as this lab's admin, "Your journey", which came here off Settings on 12 Oct for a student
     and an admin (*"This should be moved to appropriate column"*, docs/history/346) — one card, headed
     so, no placeholder beside it, and nothing on the column to press.

     BOTH HALVES OF THE PLACEHOLDER RULE, the three questions `placeholderFaults_` asks in check-flow.js —
     written out again here because `expect` is sent to the page as a string and can reach nothing of
     this file. The first version asked only "is there a control", with a selector that did not name a
     `<summary>`: a card given "Streak: 0 days · 0% of the course done", a bar at nought per cent and
     a `<details>` was measured as this state, and `check/ui.js` went red on it only because the
     summary was too small to tap (review, 9 October). So: nothing pressable anywhere in the column,
     by tag or by attribute; nothing in the pane but `drill`'s markup; and no digit. The journey card is
     not `drill`'s markup — it has rows, and a countdown — so only the first question is asked of it. */
```

### ---------- YOUR JOURNEY, WITH THE ONE LIVE LINE DRAWN

in `progress`

```
/* ---------- YOUR JOURNEY, WITH THE ONE LIVE LINE DRAWN ----------------------------------------
       For a student and an admin; the lab signs in as an admin. Seeded with a big exam a fortnight out
       so the countdown draws — the one line on the card whose length depends on the person — and the
       column drawn again for it, as `progressRedraw_` does when About you is saved. AND NOTHING OF THE
       WEEKLY PARENT EMAIL'S CARD ANYWHERE IN THE PAGE: it went from Settings the same day this card
       came here, and an admin is the one person it was ever drawn for. */
```

### ---------- THE SHOP

in `STATES`

```
/* ---------- THE SHOP ------------------------------------------------------------------------
     THE UNNAMED STATE IS PAGE 0, the basket, empty — which is what every visitor lands on. The two
     below are what a fixture with no shop rows could never have drawn: a shelf of shop cards, and a
     basket with something in it. `check/fixture.json` sends ten shop rows now, shaped as `doGet`
     sends them, for exactly this. */
```

### THE FIRST SHELF. Found by its heading rather than by a number, because how many widgets sit above the things is the roster's business — and asked of the cards

in `shop`

```
/* THE FIRST SHELF. Found by its heading rather than by a number, because how many widgets sit
       above the things is the roster's business — and asked of the cards that are there, tiles and
       all, since a shelf drawing headings over nothing is the failure that looks finished. */
```

### ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL

in `shop`

```
/* ---------- AND THE BASKET, WHICH A FIXTURE CANNOT REACH AT ALL ---------------------------
       `CART` LIVES IN `localStorage`, NOT IN THE PAYLOAD, so no fixture can put anything in it:
       whichever surface the basket has been on, this file has only ever seen it empty. It was a
       page of the booking column, then a tool — asked for as *"i want the cart to be a tool in the
       tool column"* — and is the first page of the Shop column now, so the state moved with it
       again, seeded exactly as before.

       SEEDED THE WAY THE APP FILLS IT. `CART` is what `cartCard_` reads and `cart-add` writes, and
       `initCart()` is the widget's own `start` — which is what `toolsStart_('shop')` calls when the
       column arrives, so this is the state a moment after somebody pressed the trolley on a card in Find.

       A PRICE IN THE THOUSANDS ON PURPOSE. The figure column is the thing that breaks here — it is
       sized in `ch` of a proportional font and drawn in mono — and `£2050.00` is one character
       wider than `£270.00`, which is the difference between a finding and a pass. */
```

### ---------- AND WHAT A BUNDLE PUTS IN IT, which is most of what a basket holds now

in `shop`

```
/* ---------- AND WHAT A BUNDLE PUTS IN IT, which is most of what a basket holds now --------------
       Three papers under the title of the bundle they came from, one of them laminated, and a paper
       nobody has counted the pages of — so the group's caption, the `✓ laminated` switch, the `? pp`
       and the `tbc` in the figure column are all on the screen at once. The first version of the
       laminated switch said `laminated £7.00 · plain` and put the ✕ on a line of its own at 320px;
       a basket seeded with shop items only could never have shown that. Invented lines, shaped the
       way `cartAddBundle_` writes them. */
```

### AND THE SHOP LINES THE BASKET MOSTLY HOLDS:

in `CART`

```
/* AND THE SHOP LINES THE BASKET MOSTLY HOLDS: a pence-priced one-word item (the line
                   that was 72px tall with its ✕ alone on a row) and one bought with credits, so the
                   head's credits line is drawn too. Shaped as `cartPrice_` writes them. */
```

### `widgetsOf_`, NOT `allWidgets()` — the note over the flyer state below says why, and this state was still doing the thing it describes:

in `tools`

```
/* `widgetsOf_`, NOT `allWidgets()` — the note over the flyer state below says why, and this
         state was still doing the thing it describes: the flyer maker and the tutors' hours are
         gated out of a stranger's column, so `allWidgets()` put the cheat sheet two pages further
         down than the column draws it and a signed-out run turned to the calendar instead. The
         expect went on passing because every page of the column is in the document at once. */
```

### NO PREVIEW, AND THAT IS PART OF WHAT IS ASSERTED.

in `tools`

```
/* NO PREVIEW, AND THAT IS PART OF WHAT IS ASSERTED. The sheet is built off screen for the
         gauge and the printer (see `matProbe`); a `.mat-sheet` back inside the card would be the
         preview returning, which the owner asked to be rid of. The gauge's sentence is what says
         the page was laid out and measured at all. */
```

### ---------- AND FILLED, WHICH IS THE CARD SOMEBODY ACTUALLY PRINTS FROM

in `tools`

```
/* ---------- AND FILLED, WHICH IS THE CARD SOMEBODY ACTUALLY PRINTS FROM ------------------------
       THE STATE ABOVE IS THE CARD AS IT OPENS — every level, nothing ticked, so the row holding
       Fill and Clear is not drawn at all and not one tick on the list is set. That is the least
       interesting version of the card to measure and the only one this file had: a subject and a
       level chosen, the page filled, the "given in the exam" notes under their rows and Print lit
       is the state the tool exists to reach, and none of it had been laid out at any width.
       ENTERED THROUGH THE CONTROLS rather than by setting `MAT_LEVEL`, because the selects and the
       button are the doors, and a state reached round them proves the drawing and not the tool.
       `leave` PUTS THE MAKER BACK AS IT OPENS, and forgets what it remembered on this device —
       states run in order down one page, and `matRecall` would otherwise open every later visit to
       the tool on a filled GCSE sheet. */
```

### A TOPIC AT A TIME NOW (`MAT_GROUPS`), and no GCSE topic holds five, so the ticks are taken across the topics the way a person would make a sheet — and the view

in `enter`

```
/* A TOPIC AT A TIME NOW (`MAT_GROUPS`), and no GCSE topic holds five, so the ticks are taken
           across the topics the way a person would make a sheet — and the view is put back on the
           first, Number, which is where the negative number line asserted below lives. */
```

### AND ASKED OF THE COMPUTED STYLE, NOT ONLY THE CLASS:

in `expect`

```
/* AND ASKED OF THE COMPUTED STYLE, NOT ONLY THE CLASS: a rule giving `.mat-list` its own
           `overflow-y: auto` would put the scroll bar straight back with no `widget-squeeze` anywhere,
           and the class test above would go on passing. Nothing from the list up to its card may
           scroll; the pane above the card is the one scroller, and it is `paneReach_`'s. */
```

### ---------- AND EVERY VIEW OF IT FITS, WHICH IS WHAT THE OWNER ASKED

in `tools`

```
/* ---------- AND EVERY VIEW OF IT FITS, WHICH IS WHAT THE OWNER ASKED -------------------------------
       ASKED FOR AS *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to
       make it fit on screen without scrolling"*. It was 1206px in a 532px pane at 320x568 on the view
       it opened on. The answer was a third select, the topic, that cuts the list to eight rows at most
       (`MAT_GROUPS` in mat.js) — and a fit is a property of every view, not of the one a state
       happens to land on, so this walks the lot: every subject the select offers, every level of
       it, every topic of that, set through the selects' own `change` events. After each, the app's
       own `paneReach_` is asked to fit the pane, and the answer must be: nothing scrolls, and the
       card was not drawn smaller than 0.85 to get there. 0.85 rather than `PANE_ZOOM_MIN`'s 0.7,
       because a card that "fits" at 0.7 is the thing the owner was complaining about wearing a
       smaller font.
       AT THE TWO PHONES, 320x568 and 390x844, which are the sizes the complaint is about; a tablet
       and a laptop pass this trivially and are measured for everything else as before.
       `MAT_FIT_MISS` NAMES THE FIRST VIEW THAT FAILED, because `expect` can only say yes or no and
       "some view did not fit" is a sentence nobody can act on. Read it in the page, or run
       `node check/ui.js --screen=tools` with a console.log of it. */
```

### NOT WALKED AT ALL AWAY FROM THE PHONES.

in `expect`

```
/* NOT WALKED AT ALL AWAY FROM THE PHONES. Each view is a full `matPaint`, which lays out the
           A4 sheet off screen to measure the gauge — two hundred of them per visitor per size, and
           with all four sizes walked `check/ui.js` ran past `check-all`'s ten-minute limit. */
```

### ---------- AND THIS ONE IS NOT THERE FOR EVERYBODY

in `tools`

```
/* ---------- AND THIS ONE IS NOT THERE FOR EVERYBODY -------------------------------------
       `flyers` CARRIES `admin: true`, so it is not in a signed-out visitor's roster at all — and
       "could not reach it" is the wrong sentence for a widget that correctly does not exist. A
       warning nobody can act on is the kind of red this file's own `ACCEPTED_TAP` note is about.
       `only` says who a state belongs to. It is skipped rather than failed, and the summary lists
       it as not reachable — which is the honest answer and still not silence. */
```

### ---------- THE PAGE NUMBER COMES FROM THE LIST THE COLUMN IS BUILT FROM

in `tools`

```
/* ---------- THE PAGE NUMBER COMES FROM THE LIST THE COLUMN IS BUILT FROM --------------------
       THIS COUNTED `allWidgets()` AND THE COLUMN DRAWS `widgetsOf_()`, which is that list with the
       gated ones taken out. The two agreed for an admin, who is gated out of nothing, so the flyer
       state was right by luck rather than by construction — and the moment a widget appeared that
       an admin does NOT see, every index after it would have pointed one page off with nothing
       saying so. Same fault as a pager that counts for itself: two readings of one list.
       `expect` would have caught it, loudly, which is the other half of why states declare one. */
```

### ---------- CHECK UPLOADS, ANSWERED — THE ADMIN'S, LIKE THE FLYER

in `tools`

```
/* ---------- CHECK UPLOADS, ANSWERED — THE ADMIN'S, LIKE THE FLYER ---------------------------
       The card as it reads on the day it matters: a deployment that can read Drive and not write
       to it, so two crosses, Google's own sentence under one of them, and the fix as numbered steps
       with a link. The longest thing on it is that sentence and the folder's name, and both are the
       server's — which is why the state seeds the reply rather than a tidy one of its own. `leave`
       puts the card back as it opens, before anybody has pressed it. */
```

### ---------- A TUTOR'S TEACHING HOURS

in `tools`

```
/* ---------- A TUTOR'S TEACHING HOURS -----------------------------------------------------
       THE SEVENTY-SEVEN CELLS OF A WEEK GRID, on a card nobody had measured, in the one place this
       file could not reach before: `widgetsOf_` shows it to a tutor or an admin and to nobody
       else, and the column fills whichever pages it happens to stop on. A state is the only thing
       that puts it on the screen every run — which is the sentence this project already writes
       about the booking receipt and the message thread. */
```

### ---------- A TIMETABLE WITH A WEEK IN IT

in `tools`

```
/* ---------- A TIMETABLE WITH A WEEK IN IT ------------------------------------------------------
       KEPT ON THE DEVICE, so no fixture can fill it — the basket's sentence. Seeded through the app's
       own key (`tmtKey_`) with the weekend on, so all seven chips are measured going four and three,
       and with one lesson OPEN, so the editor's time box and subject box are measured side by side
       at 320 rather than only the summary lines. One subject and one note deliberately long, because
       the longest thing a row ever holds is something somebody typed. */
```

### ---------- THE TIMETABLE WITH YOUR BOOKED SESSIONS LOCKED IN IT

in `tools`

```
/* ---------- THE TIMETABLE WITH YOUR BOOKED SESSIONS LOCKED IN IT ------------------------------
       `Your week` is folded into the Timetable, so the one week view now holds two kinds of row: what
       somebody wrote, and a session booked here (`.tmt-row.is-booked`, green, a second line of hours
       and place). Seeded through the payload — `myJobs_` reads `DATA.liveJobs` — with a session on
       Monday and Saturday and no dates (a request not yet in the diary is on every week its days come
       round), between lessons at nine, three and six, so the booked row is measured among the others
       and the Saturday shows all seven chips with the weekend box unticked. Signed in only: a visitor
       has no sessions. */
```

### ---------- A CALENDAR WITH EVERY KIND OF DATE ON IT

in `tools`

```
/* ---------- A CALENDAR WITH EVERY KIND OF DATE ON IT ----------------------------------------
       The calendar learned six kinds of date — sessions, terms, half terms, bank holidays, closed
       days, events — and a key under the month. The fixture holds none of them in THIS month (it
       has no exams, and the bank holidays it carries are whatever month they fall in), so they are
       seeded through the payload for the month on screen, several on one day so the dots are
       measured crowded, and put back on the way out. Signed in, because sessions are somebody's. */
```

### ---------- TOUCH TYPING, HALF WAY ALONG A LINE WITH A KEY WRONG

in `tools`

```
/* ---------- TOUCH TYPING, HALF WAY ALONG A LINE WITH A KEY WRONG ----------------------------
       KEPT ON THE DEVICE, so no fixture can climb the ladder — seeded through the app's own key with
       three rungs open and the third chosen, so the rungs are measured on, open and shut together.
       The line is SET rather than drawn at random, half typed and with a wrong key held, so the
       measured card carries every class it can: letters done, the lit letter in its miss colour, the
       wrong key red on the keyboard, a capital's shift lit, a score under the line. And the hidden
       box FOCUSED, through the app's own handler, because the card draws differently when it is
       listening and that is the state somebody is looking at it in. */
```

### ---------- THE WHITEBOARD, LOCKED, WITH SOMETHING ON IT

in `tools`

```
/* ---------- THE WHITEBOARD, LOCKED, WITH SOMETHING ON IT --------------------------------------
       KEPT ON THE DEVICE, so it opens blank and unlocked on every run -- a cream rectangle measures
       perfectly. The state somebody is actually in is the other one: the padlock lit, the gold frame
       round the board, marks on it, and the bar and the note still inside a pane that clips. That is
       the case the board's height is capped for (`.wb` in style.css), at 320x568 above all.
       Seeded through the app's own key (`padKey_(WB_ITEM)`) and the app's own writer (`ansStore_`),
       and locked the way a repaint finds it (`PAD_ON`), so nothing here spells the key out. A ruled
       line across the top, a triangle and a ring: a stroke that touches the board's edges is the one
       that would show a board drawn the wrong shape. */
```

### ---------- THREE, FOUR AND FIVE LIBRARY CARDS, DRAWN AS CARDS — `libraryShelf_` in me.js; docs/history/332

in `tools`

```
/* ---------- THREE, FOUR AND FIVE LIBRARY CARDS, DRAWN AS CARDS — `libraryShelf_` in me.js; docs/history/332 -----
       ON TOOLS SINCE docs/history/339 — *"move library card widget to the tools column."* — a widget card now, with its
       star above the shelf, so the page is the shelf and a row taller than it was on Settings, and these three states
       are the Tools column's. Everything they ask is what they asked of the Settings page.
       THE OWNER, 10 Oct: *"make each look like a card. with fake barcode."* Seeded with invented libraries (the
       longest name the shelf has ever been measured with among the first three, because the name is the box
       that gives), the rest of the five slots empty. Asked of each card, at every width: its three boxes are ON
       it; it is a bank card's shape (85.6:54, within 3%) and nothing inside it spills past that shape; the ink
       of every box is 4.5:1 or better on the card's own paper, which `check/ui.js`'s text rule cannot ask
       because a box's value is not a text node; and the bars are decoration (`aria-hidden`) and different on
       every card. `Add another` is on the page while a slot is left to reveal, and not once all five show.

       FOUR AND FIVE AS WELL AS THREE, BECAUSE THE CARD'S SHAPE IS WHAT MAKES THE PAGE TALL. A face's height
       follows its width, so at the column's full width three cards were the most a 390x844 phone drew at full
       size: the fit rule took four to 81% and five to its 70% floor there, and at 1280x800 three to 81% —
       every card with a blank band between its name and its bars. The review of 10 Oct found this file seeded
       three, so `check/ui.js` had never once drawn the page where it cost most. Now it draws all three counts.
       And the cards give that band back first (`libFit_` in me.js, called by `paneReach_`): they narrow,
       keeping the shape, until the page fits or the band runs out, and only the rest is drawn smaller. Asked
       of every count, at every width: A PAGE DRAWN SMALLER HAS NO BLANK BAND LEFT ON ITS CARDS (3px of
       slack for the last pass's rounding) — red before `libFit_`, when four cards at 390 were at 81% with
       45px of blank on each and three at 1280 at 81% with 68; and the fit rule's own promise, that the page
       is no smaller than the app's `PANE_ZOOM_MIN` and the tick is on the glass or the pane scrolls to it.
       The cost that is left prints as `CARD DRAWN SMALLER TO FIT` with its percentage, beside every other
       card that pays it.

       WHY `new Function`: every state is carried into the page as its source and run there (the
       notifications states below say so at length), so a closure over `n` would arrive empty. Each state is
       the one source below with its count written in as a literal. */
```

### ---------- A HIGH-SCORE BOARD WITH SCORES ON IT

in `STATES`

```
/* ---------- A HIGH-SCORE BOARD WITH SCORES ON IT ---------------------------------------------
     `check/fixture.json` HAS NO STUDENTS AND ITS ONE TUTOR SCORES NOUGHT, so the only state the lab
     could reach is the board's empty card — which is this file's own sentence about the booking
     receipt, the message thread and the basket, for a fourth time. A board of one row and a board
     of six are different objects to measure: the second is where a long handle meets a `flex: 0 0
     auto` label, and where the mark for your own line has to be visible against the rows either
     side of it. (It was also written when that card was a charcoal handheld with row colours of
     its own — see "THE HANDHELD, AND WHY IT IS NOT HERE ANY MORE" in style.css. Both boards are on
     the app's own ground now; the rest of the argument is untouched by that.)

     SEEDED THROUGH THE PAYLOAD, which is the same door `load()` uses — `scoreRanks_` reads
     `DATA.students` and `DATA.tutors` and nothing else, so putting rows there is the app arriving
     at this state rather than the harness reaching past it.

     AND THE SEEDED TUTOR IS DELIBERATELY EIGHTH. If the visitor were in the top five the board
     would never draw its other branch — your own row, appended underneath with the place you are
     actually in — and that branch is the whole reason the board is not simply `slice(0, 5)`. */
```

### ---------- AND THE VISITOR HAS TO BE ON IT, OR THE OTHER BRANCH NEVER DRAWS

in `enter`

```
/* ---------- AND THE VISITOR HAS TO BE ON IT, OR THE OTHER BRANCH NEVER DRAWS ---------
           THE FIRST VERSION PUT A SCORE ON THE FIXTURE'S ONE TUTOR AND CALLED THAT "YOU". It is
           not: the seeded visitor is `Test Admin` / `testadmin` / `P001` and the fixture's tutor is
           `Ada Tutor` / `@ada` / `P-@ada`, so `mineIs_` correctly matched nobody and the board drew
           five rows with no mark on any of them. The assertion failed and it was right to — the
           state was wrong, not the app. Seeded off `USER` itself, so it is whoever the lab is
           signed in as rather than a name written twice. */
```

### `repaint` RATHER THAN `paint`, and the difference is the whole state.

in `enter`

```
/* `repaint` RATHER THAN `paint`, and the difference is the whole state. `paint(id)` replaces
           the markup and stops there; the widgets that were running inside it are restarted by
           `startScreen_`, which only `repaint` and `go` call — so a bare `paint` here rebuilt the
           card and left the board an empty div, which is exactly what the first run of this state
           reported. Its own note says so: "a repaint rebuilds the markup it was running in". */
```

### ONE MORE ROW THAN `SCORE_TOP`, and the number is READ OFF THE APP rather than written here:

in `games`

```
/* ONE MORE ROW THAN `SCORE_TOP`, and the number is READ OFF THE APP rather than written here:
         the seed puts the visitor eighth on purpose, so the board draws the top N and then their
         own line. A literal would be the same figure in two files and the copy in this one is the
         one nobody re-reads — which is what happened the first time, when `SCORE_TOP` went from
         five to three for a measured reason and an assertion of `>= 5` failed every state.

         Signed out there is no visitor to mark, so the extra row and the mark are both asserted
         only where there is somebody to mark — the alternative is a state that fails for the
         stranger it is correctly not about. */
```

### `repaint` RATHER THAN `paint`, and the difference is the whole state.

in `leave`

```
/* `repaint` RATHER THAN `paint`, and the difference is the whole state. `paint(id)` replaces
           the markup and stops there; the widgets that were running inside it are restarted by
           `startScreen_`, which only `repaint` and `go` call — so a bare `paint` here rebuilt the
           card and left the board an empty div, which is exactly what the first run of this state
           reported. Its own note says so: "a repaint rebuilds the markup it was running in". */
```

### THE SAME RENDERER IN THE OTHER CARD, and still worth its own state although the reason it was written for has gone.

in `games`

```
/* THE SAME RENDERER IN THE OTHER CARD, and still worth its own state although the reason it
       was written for has gone. That reason was that the flappy card retoned `.row .k` and `.row
       .v` for a charcoal shell and the times-table card did not, so a contrast finding on one said
       nothing about the other; the shell went with the Game Boy panel and both boards sit on the
       app's own ground now. What is left is that `paintBoard_` is called from two `init`s and this
       is the only thing that reaches the second one — a board drawn by `initTables` and not by
       `initFlappy` is a card that measures itself into existence on one column and not the other,
       which is precisely what an empty div looked like the first time this state ran. */
```

### ---------- AND A SCRABBLE GAME PART-WAY THROUGH

in `games`

```
/* ---------- AND A SCRABBLE GAME PART-WAY THROUGH ------------------------------------------
       THE WIDGET OPENS ON THREE BUTTONS — 2, 3 or 4 players — and that is the only state `go()`
       can reach. Everything the game actually is lives past them: a board with tiles on it, a
       rack, four actions and the hand-over card between turns. Fifteen columns of squares over
       seven 44px tiles is also the tallest card in this column, and it was 17px past the pane's
       own fold the first time anything measured it.

       SEEDED THROUGH THE GAME'S OWN FUNCTIONS — `scrNew_` deals the bag, `scrPlace_` puts a tile
       down — rather than from a board written out here. A fixture board would be a second
       description of what a game looks like, and the copy in this file is the one nobody
       re-reads. */
```

### THE HAND-OVER IS ITS OWN STATE because it is the one that draws NO rack:

in `games`

```
/* THE HAND-OVER IS ITS OWN STATE because it is the one that draws NO rack: the card between two
       players is what makes a secret rack possible on one screen, and it has different content and
       a different height from every other. */
```

### ---------- THE FOUR CLASSROOM GAMES, EACH ON ITS BUSIEST CARD

in `games`

```
/* ---------- THE FOUR CLASSROOM GAMES, EACH ON ITS BUSIEST CARD ----------------------------
       ALL FOUR ARE INSIDE THE WORD GAMES WIDGET NOW and are reached through its dropdown.
       EVERY ONE OPENS ON A SINGLE BUTTON, which is the only state `go()` reaches — so everything
       these games are (a clock, Taboo's forbidden words, 20 Questions' count) is past it and
       nothing would measure it without a state. Entered through the app's own handlers, and then
       given the LONGEST entry its deck holds: a round is dealt at random, so a state that measured
       whatever came up would measure a different card every run, and the one worth measuring is
       the one that wraps. */
```

### ---------- IMPOSTER, EVERY SCREEN OF A ROUND

in `games`

```
/* ---------- IMPOSTER, EVERY SCREEN OF A ROUND -----------------------------------------------
       The owner, 8 Oct: "info over load on the reading parts", and "so young ones who can’t read can
       play. Like it will read it out for them." Every screen after Deal is past the one `go()` reaches,
       and two of them — the switch and Listen — exist only with Read aloud on, so none of it had ever
       been measured. Entered through the game's own handlers; then the LONGEST word and the LONGEST
       category in `IMP_DECK` are put on the card — with their pictures, read through the game's own
       `impCards_` (note 343) — the Articulate states' rule, because the one worth
       measuring is the one that wraps — and the big line is meant to hold two lines without moving the
       button under it. A real Chromium has `speechSynthesis`, so the switch is drawn; a state that
       finds no switch fails, which is what it should do on a browser with no voice.

       READ ALOUD IS TURNED OFF AGAIN ON THE WAY OUT, because it is remembered on the device and every
       state after these would otherwise be measured with it on. */
```

### AND THE PICTURE HAS ITS HAIRLINE AND NO "?":

in `games`

```
/* AND THE PICTURE HAS ITS HAIRLINE AND NO "?": the outline is what keeps ♠ and 🕸️ from vanishing
         into a nearly black card (style.css, `.imp-sym`), and the "?" is the imposter's alone. Asked of
         the real stylesheet, because jsdom draws neither. */
```

### AND THE "?" DRAWN ON IT — the mark a child who cannot read "Imposter" knows this card by (impFrame_, note 343).

in `games`

```
/* AND THE "?" DRAWN ON IT — the mark a child who cannot read "Imposter" knows this card by
         (impFrame_, note 343). The class is the journey's to see; whether the stylesheet draws
         anything for it only a real browser can say. */
```

### THE BIG LINE AND THE BUTTON, MEASURED STAYING WHERE THEY ARE.

in `games`

```
/* THE BIG LINE AND THE BUTTON, MEASURED STAYING WHERE THEY ARE. "The gold one under the big word"
       has to be one place on every screen a child presses alone, and the first build broke it — Hide
       36px above where Show had been — where only a screenshot saw it. The six states above only ask
       that each thing EXISTS: with `.imp-foot` set to `display: none` and `.imp-big`'s two-line floor
       taken out, so Hide sat 36px above Show and a two-line word moved the button, they and the whole
       of check/ui.js still said "nothing NEW to report" (the review of 8 October).

       SO ONE ROUND IS WALKED THROUGH THE HANDLERS, the `Q0664` way above: the top of the big line and
       of the gold button on the pass screen, a player's card holding the LONGEST word in the deck, the
       next pass, the imposter's card holding the LONGEST category, and play — every one read in the
       same tick, so nothing moves between them but the card itself. With Read aloud on, which is the
       card with the speaker under it, and again with it off. Each top within 0.5px of the first.

       AND THE PICTURE'S TOP AS WELL, since every card has one (the owner, 11 Oct: "Add symbols to
       imposter"; note 343). The hand-over draws that slot EMPTY, so a slot that took its height from
       its emoji would be 0px tall there and put the name and Show a picture's height higher than the
       word and Hide that follow — the 36px fault again, from the other end of the card. */
```

### EACH TOP READ TWO FRAMES AFTER ITS PRESS, NOT IN THE SAME TICK.

in `enter`

```
/* EACH TOP READ TWO FRAMES AFTER ITS PRESS, NOT IN THE SAME TICK. A card that changes height is
           put back in the middle of the pane by the `ResizeObserver` in find.js (`holdColumn_`), after
           layout and before paint — so a reading taken straight after the press is the card before it
           was re-centred, which no finger ever sees. The first version here read every screen in one
           tick and had Read aloud on and off at identical heights: blind to exactly the 36px it is for. */
```

### AND AT REST: a slide the column is still running is a card on its way, not where it stops — `settled` in check/ui.js asks the same of a whole screen.

in `enter`

```
/* AND AT REST: a slide the column is still running is a card on its way, not where it stops —
           `settled` in check/ui.js asks the same of a whole screen. Bounded, and a card still moving
           after it is measured where it is and fails, which is right. */
```

### `an alibi case card` AND `an alibi interview` WERE HERE, and went with the game ("delete alibi game.") — a state that enters a widget nobody can open fails

in `games`

```
/* `an alibi case card` AND `an alibi interview` WERE HERE, and went with the game ("delete alibi
       game.") — a state that enters a widget nobody can open fails loudly, which is right, and a
       state measuring nothing has no business being kept to say so. */
```

### ---------- A WORD SEARCH PART-FOUND, AND A SENTENCE PART-BUILT

in `games`

```
/* ---------- A WORD SEARCH PART-FOUND, AND A SENTENCE PART-BUILT ------------------------------
       Both widgets OPEN on a fresh deal, which is the one state `go()` reaches — and a fresh deal is
       the state with nothing struck through, nothing highlighted, no start ring and an empty strip.
       Every mark either game puts on its card is past it. Seeded through the games' own functions
       (`wsBuild_`, `wsPick_`, `ssDeal_`) and their own handlers, never a board written out here: a
       grid in this file would be a second description of a puzzle, and the one nobody re-reads.
       THE OLDER THEME, because it is the ten-by-ten grid — the tallest card either game draws, and
       the one a 320px phone has least room for. */
```

### ---------- A CONNECT 4 GAME, WON

in `games`

```
/* ---------- A CONNECT 4 GAME, WON --------------------------------------------------------------
       THE WIDGET OPENS ON AN EMPTY BOARD, which is the one state `go()` reaches — and an empty board
       has no counter, no falling counter and no ring, so nothing "refine connect 4 add dropping
       animation of counters" added would ever be measured or pressed. Played through the board's
       own handler, Red down the first column, so the four that won are ringed, the line under the
       board carries its disc, and the last counter is the one that fell.

       AND THE EXPECTATION ASKS THE BROWSER WHAT ONLY A BROWSER KNOWS: that the counter marked to
       fall really has the `c4-drop` animation on its `::after`. `check-flow.js` can ask which
       square is marked; it cannot ask whether the stylesheet still does anything with the mark. */
```

### ---------- THE VIDEOS CARD: THE BAR, FOUR RESULTS, A FILM PLAYING, AND THE GLASS FILLED

in `games`

```
/* ---------- THE VIDEOS CARD: THE BAR, FOUR RESULTS, A FILM PLAYING, AND THE GLASS FILLED -----------
       *"at first all you see is a search bare, then you search and you see relevant result underneath.
       max 4 results show. you click on one, then it shows video. you can click fullscreen to make it
       fullscreen"* — the owner, 10 Oct (note 321). FOUR STATES FOR FOUR THINGS THE CARD IS, because
       `go()` reaches only the first: the bar alone; four results with the line under them (and, for an
       admin, the Sync row at the foot); a result playing in their place; and the app's own full screen.
       Seeded through the card's own list (`VIDEOS_LIST`, what `data/videos.json` would have filled)
       with the LONGEST title a row is likely to carry, because a title is the one thing on this card
       that can take it sideways at 320. The video is the repository's own reel, so the lab plays a real
       file and never reaches for YouTube. */
```

### ---------- A FILM FROM THE FOLDER, PLAYING IN DRIVE'S PLAYER, WITH THE DOOR BESIDE IT

in `games`

```
/* ---------- A FILM FROM THE FOLDER, PLAYING IN DRIVE'S PLAYER, WITH THE DOOR BESIDE IT --------------
       The one watch view with TWO tiles beside its title — Full screen and Open in Drive — which is the
       narrowest the title gets at 320. The film is invented and added to the admin's films for this
       state alone; its frame asks Drive for a file that does not exist, which this lab cannot reach
       anyway — what is measured is the card round it. */
```

### ---------- AND THE APP'S OWN FULL SCREEN, WHERE THE BROWSER HAS NONE

in `games`

```
/* ---------- AND THE APP'S OWN FULL SCREEN, WHERE THE BROWSER HAS NONE --------------------------------
       Safari on an iPhone has no full screen for anything but a `<video>`'s own player; this lab is
       Chromium, so the Fullscreen API is TAKEN AWAY for the state — and the `<video>` here has no
       `webkitEnterFullscreen` in Chromium either, so the tile reaches the app's own, as an iframe on an
       iPhone does. Pressed through the tile, after the card is placed. What is measured is the block in
       the top layer over the whole glass: the Exit tile's 44px, nothing sideways, and the pane under it
       where it was. Put back on `leave`, API and all. */
```

### AND WHAT "FULL SCREEN" MEANS, ASKED IN PIXELS AT EVERY WIDTH:

in `games`

```
/* AND WHAT "FULL SCREEN" MEANS, ASKED IN PIXELS AT EVERY WIDTH: the block is the viewport, a point
         in each corner and the middle of the glass lands inside it (nothing of the app is above it or
         reachable through it), the film is 16:9, wholly on the glass and as large as the room allows —
         the width of the glass, its height, or the width less the Exit tile beside it — and the Exit
         tile is on the glass and off the picture. A rule that put the block in a corner, or a film the size of the card,
         arrives here as a state that did not arrive. */
```

### AND THE CARD LET GO OF, AS A FINGER LEAVING IT WOULD.

in `leave`

```
/* AND THE CARD LET GO OF, AS A FINGER LEAVING IT WOULD. Going full screen hands the focus to the Exit
           tile and coming back hands it to Full screen, and a focus on the card in front HOLDS its top
           (`HOLD_AT`, shell.js) — right for somebody using it, and here it outlived the state: every later
           state on this page then grew and shrank the card downward from a held top, and the column ended
           the run 94-143px off the line `check/ui.js` holds every column to. */
```

### ---------- THE FILMS IN THE VIDEOS CARD — THE ADMIN'S, AND NOBODY ELSE'S

in `games`

```
/* ---------- THE FILMS IN THE VIDEOS CARD — THE ADMIN'S, AND NOBODY ELSE'S ------------------------
       *"Let admin be able to search up films which are in the notflix folder on gdrive."* Two states for
       one card, `only:` each way round, because what the card holds is the PAYLOAD's decision: the
       admin is served the fixture's three invented films and a sync stamp, and the signed-out visitor
       what `doGet` sends a stranger — no film and no stamp (`FIXTURE_ANON` in ui.js). The admin's card
       carries a row nobody else's has — the silver Sync from Drive tile and the line beside it — and a
       film not in the Drive yet, dimmed; both are new widths to fit at 320. Since note 321 both are a
       SEARCH ("film"), because an idle card shows neither. */
```

### ---------- AND WHILE ITS LIST IS ON ITS WAY: THE BAR, AND THE ONE LOADER WHERE THE RESULTS GO

in `games`

```
/* ---------- AND WHILE ITS LIST IS ON ITS WAY: THE BAR, AND THE ONE LOADER WHERE THE RESULTS GO --------
       One of three widgets held on a real request — see `the business records still coming` for the
       whole note. `data/videos.json` is asked for by the card's own `initVideos` and its answer kept
       back; here the payload is in, so an admin's card already has its films and is not waiting, and
       this is the stranger's.
       THE BAR IS NOT VEILED (note 321): it is the first thing on the card and it can be typed into
       before the list lands. A word is typed here, so the one loader stands where the results will be
       — and the state releases into three real rows the word finds. A list's length is not known until
       it lands, so the card GROWS by the rows (`grows`, read by `check/ui.js`): what is asked is that
       the loader's room was not more than came, and that the three rows arrive. */
```

### ---------- A SCRABBLE GAME PART-WAY THROUGH

in `STATES`

```
/* ---------- A SCRABBLE GAME PART-WAY THROUGH -------------------------------------------------
     THE WIDGET OPENS ON THREE BUTTONS — 2, 3 or 4 players — and that is the only state `go()` can
     reach. Everything this game actually is lives past them: a board with tiles on it, a rack, four
     actions, and the hand-over card between turns. Fifteen columns of squares and seven 44px tiles
     are also the tallest thing in the games column, and the card was 17px past the pane's own fold
     the first time anything measured it.

     SEEDED THROUGH THE GAME'S OWN FUNCTIONS — `scrNew_` deals the bag and `scrPlace_` puts a tile
     down — rather than by writing a board literal here. A fixture board would be a second
     description of what a game looks like, and the one in this file is the one nobody re-reads. */
```

### ---------- AND A SESSION RECEIPT, WHICH THIS FILE HAS NEVER HAD ON THE SCREEN

in `STATES`

```
/* ---------- AND A SESSION RECEIPT, WHICH THIS FILE HAS NEVER HAD ON THE SCREEN ----------------
     MEASURED, SIGNED IN, AGAINST THE REAL FIXTURE: the booking column draws ONE page and it is the
     form. `myJobs_()` keeps the sessions whose `client` or `tutor` is the visitor, and the
     fixture's one job names neither — so `bookBlocks` returns the form and nothing else, and
     `booking: nothing to report` has meant that single page at four widths on every run.

     THE RECEIPT IS THE MOST-COMPLAINED-ABOUT CARD IN THE APP and it was outside the measurement
     the whole time. That is the `dm` note one column along, and the booking-screen-signed-out note
     before it, for a third time — and it is what let `Per session` wrap its label on every receipt
     ever drawn while a hundred and four combinations came back clean.

     SEEDED THROUGH THE PAYLOAD, NOT THE MARKUP. `DATA.liveJobs` is what `myJobs_` reads, so a job
     naming the signed-in visitor as its client is the state the app is in a moment after `load()`
     — the app's own door, the same move the seeded thread and the seeded visitor both make.

     ONE SESSION WITH EVERY ROW FILLED IN, because the fault this state exists to catch is a label
     or a value that does not fit its column, and a row with nothing in it cannot show one. Six
     dates so the `Dates` row has a range and a count; a price so the total row draws; a venue name
     as long as a real one. */
```

### ---------- THE CAMERA WITH A PICTURE ON IT

in `STATES`

```
/* ---------- THE CAMERA WITH A PICTURE ON IT ----------------------------------------------------
     THE CAMERA OPENS ON A VIEWFINDER AND NOTHING ELSE. `Again`, `Post it`, `Save a copy`,
     the caption box and the row that says who it goes up as are all `hidden` until there is a
     photograph — so HALF THE CAMERA has been outside this lab for as long as it has existed, and
     `check/press.js` reported `cam-post`, `cam-save` and `cam-again` as untouched rather than as
     faults, because an action on no screen is one it cannot reach.

     WHAT THAT COST, MEASURED THE DAY THIS WAS WRITTEN: with a picture on the card the column ran
     55px BELOW THE SCREEN at 390 and 36px past the pane's own fold at 768. Neither is visible to
     the two rules that were watching — the pane's `scrollHeight` equals its `clientHeight`, so
     nothing is overflowing; it is the PANE that hangs off the bottom, because `columnShift_`
     places the page once and nothing re-placed it when the card grew. (It centred the page on the
     day those two numbers were taken, then put every card on one line, and centres it again since 5
     October; whichever, a card that
     grows after the placement is still a card the placement never saw.)

     THROUGH THE APP'S OWN PICKER, not by drawing on the canvas. `on('cam-pick')` reads
     `el.files[0]`, so a `DataTransfer` carrying a real one-pixel PNG is the same event a finger
     makes — which matters here more than usual, because the thing being measured is what that
     handler reveals. A container has no camera, so `cam-shoot` is not a door this can use.

     AND IT IS PUT BACK. States run in order down one page and `camAgain_` is the app's own way to
     throw a picture away, so the next state and the next screen are not measured with a photograph
     still on the card — the same reason the guide state closes its sheet. */
```

### THE CAMERA IS A PAGE OF THE FEED NOW, directly above the newest post — the `make` column is gone.

in `STATES`

```
/* THE CAMERA IS A PAGE OF THE FEED NOW, directly above the newest post — the `make` column is
     gone. So the state turns to that page first, through the app's own `goPage` and `feedCamAt_`,
     and measures the card where it now sits. */
```

### ---------- AND THE MOMENT BEFORE THE FIRST FRAME: THE ONE LOADER IN THE VIEWFINDER

in `feed`

```
/* ---------- AND THE MOMENT BEFORE THE FIRST FRAME: THE ONE LOADER IN THE VIEWFINDER ----------------
       One of three widgets held on a real request — see `the business records still coming` (biz)
       for the whole note. The ask is the camera's own (`camStart_`) and the browser's answer is kept
       back, which is what a permission prompt left open does; released, it is handed a stream drawn
       from a canvas, which is a real `MediaStream` a container without a camera can make. The loader
       sits over the viewfinder, whose size is the card's, so the first frame lands in its place. */
```

### AFTER ANY ASK STILL OUT.

in `enter`

```
/* AFTER ANY ASK STILL OUT. The state before this one put its picture back with `camAgain_`,
           which asks the real camera — and a container has none, so that ask is refused, and on a
           loaded machine the refusal can land after this has asked: it wrote "The camera did not
           start." over the viewfinder this is measuring. So it waits for that one to finish first
           (bounded), and then asks through the held door. */
```

### ---------- AND A BROWSER WITH NO CAMERA AT ALL: A FACT, AND NO LOADER OVER IT

in `feed`

```
/* ---------- AND A BROWSER WITH NO CAMERA AT ALL: A FACT, AND NO LOADER OVER IT ------------------
       Found by review: with `navigator.mediaDevices` missing, `camStart_` wrote "This browser has no
       camera support." under the card and left the viewfinder holding the loader `cameraCard` drew —
       dots pulsing over a sentence saying nothing was coming, for as long as the page was up. The
       container HAS `mediaDevices`, so it is taken away for the state (an own property over the
       prototype's getter) and put back by deleting it. */
```

### ---------- A POST'S FACES, IN EVERY STATE THEY ARE DRAWN IN

in `feed`

```
/* ---------- A POST'S FACES, IN EVERY STATE THEY ARE DRAWN IN ---------------------------------
       THE OWNER, 9 Oct: *"Also refine how the post reactions look. Looks abit scuffed right bow"* —
       and this lab had never drawn the row. The fixture's post sent `{"👍": 3}`, a shape `doGet` has
       never sent, which `reacts()` draws as nothing; so tap size, contrast and sideways overflow had
       been measured across every width on a post with no faces on it. The fixture sends the real
       shape now (six house faces, counts, total, yours, by) and these are the states the row is in:
       nobody, some, yours, a post's own set of more than six with three-digit and four-digit counts,
       and the who-reacted sheet open. Signed out is the other visitor, and runs all but "yours".

       SEEDED THROUGH `DATA.posts`, THE APP'S OWN DOOR — the post's `reactions` is exactly what the
       payload's arrival puts there — then `repaint` and `goPage` to the post, which is what a finger
       does. `PO1` because it is the fixture's post with a picture, so the row is where it is on most
       posts: directly under the photograph. AND PUT BACK, because states run in order down one page
       and the next would otherwise be measuring this one's counts. */
```

### EVERY FACE COUNTED IN TWO DIGITS AND ONE OF THEM YOURS — the widest the house row gets on a busy post, and the gold one with its heavier count inside a 41px

in `feed`

```
/* EVERY FACE COUNTED IN TWO DIGITS AND ONE OF THEM YOURS — the widest the house row gets on a
       busy post, and the gold one with its heavier count inside a 41px cell at 320.
       AND ALL SIX ON ONE LINE, which is the redesign's whole claim: the scuff was a row that wrapped
       🎉 onto a line of its own, and a count that grew reflowing the row. Nothing held it — a grid
       changed to wrap the six as 5+1 at 320 passed this file clean, because this asked only for
       `.mine` and six counts. The same idiom as the wrapping state: one distinct top, one line. */
```

### A POST'S OWN CELL NAMING NINE FACES, with three- and four-digit counts:

in `feed`

```
/* A POST'S OWN CELL NAMING NINE FACES, with three- and four-digit counts: the one case the row
       wraps (into the same columns, six and three), and the one case a count steps down a size
       (`is-long`) or rounds (`1k`). Yours too when signed in, on a three-digit face. */
```

### WHO REACTED, OPEN — the sheet is outside `#s-feed`, and `check/ui.js` measures it when one is open.

in `feed`

```
/* WHO REACTED, OPEN — the sheet is outside `#s-feed`, and `check/ui.js` measures it when one is
       open. Groups most-used first, a long name, and yours the gold pill when signed in. Opened
       through the total's own handler, and shut on the way out (a sheet survives `go()`). */
```

### ---------- A TAP ON A FACE, AND THE CARD IT IS ON DOES NOT MOVE

in `feed`

```
/* ---------- A TAP ON A FACE, AND THE CARD IT IS ON DOES NOT MOVE ---------------------------------
       THE OWNER, 10 Oct: *"The post section is a bit buggy. When I click a reaction it bugs out a bit.
       On only some of them."* Every state above draws the row and looks at it; none of them pressed it,
       so none could see what a press did to the card around it. A face called `repaint()`, which
       rebuilt the whole column — so the post's picture was a new `<img>` with no pixels and no size,
       held at the 4:5 stand-in until it was read again (`.page .post-pic { aspect-ratio: auto 4 / 5 }`),
       and the card changed height and zoom under the finger, then changed back (docs/history/335).
       THIS LAB STANDS IN FOR THE PHONE THAT CANNOT HAND THE PICTURE STRAIGHT BACK: `page.route` turns
       the browser's cache off, so a rebuilt picture is fetched again here every time.

       A SINGLE SQUARE PHOTOGRAPH, because that is a post the fault reached and the fixture's PO1 is a
       grid, whose cells are fixed squares and only blinked. Square is not 4:5, so a rebuilt picture
       is a taller card for as long as it waits. Signed in only: signed out, a face goes to sign in.

       WHAT IS HELD, from the frame before the tap, in the tap's own task and on every frame for half a
       second after it: the same `<article>`, the same pane, the same `<img>`, and the card's height,
       zoom and top and the picture's height to within a pixel. Measured inside the page because the
       fault lasts a few frames and `check/ui.js` looks once; the result is read by `expect`, and `why`
       says what moved. A TOKEN, so a `leave` that comes first (cascade.js does not wait for `expect`)
       stops the tap rather than letting it land on the post `leave` just put back. */
```

### AND THE CARD STILL BEFORE THE TAP.

in `enter`

```
/* AND THE CARD STILL BEFORE THE TAP. `repaint(true)` and `goPage` above leave the column gliding
           onto its line for a few hundred milliseconds at 768 and wider — measured with the tap taken
           out, the card's top went 58 → 103.5 at 1920 with nothing pressed — and a tap in the middle
           of that would charge the glide to the tap. So five frames running with the same top and
           height first; if the column never stops within 1.2s the tap goes ahead and the top is not
           compared, rather than failing on a movement that is not the tap's. Every wait here is
           bounded to fit inside the 3s `check/ui.js` and `check/press.js` give `expect`. */
```

### AND THE HOLD THE TAP TOOK IS LET GO.

in `leave`

```
/* AND THE HOLD THE TAP TOOK IS LET GO. A press on the card in front holds its top where it is
           (`HOLD_AT`, shell.js) so a card that changes under a finger grows downward — right for a
           person, and wrong here, where the lab is swapping the post's square photograph back for
           the fixture's grid, 90px taller at 1920. Held, the grid hung 43.8px below the middle and
           the columns-in-line rule named it after every screen had been visited. Nobody is using
           the card once the state is over, which is what arriving anywhere else would say too. */
```

### ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK, AND THE CARD DOES NOT MOVE --

in `feed`

```
/* ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK, AND THE CARD DOES NOT MOVE --
       THE STATE ABOVE PRESSES A DATED POST, and the fix it holds held for every dated post and no other.
       A row typed into the posts tab by hand without a date column arrives as `at: 0, when: ''`; with no
       reactions it drew no time line, so the first face fell back to rebuilding the column (a 16:9 card
       428.5 → 689px at 390 and thrown off the glass for a frame or two) and taking the last face back
       removed the line (the card 36.6px shorter, the tile row jumping up under the thumb). The line is
       there now whenever a post has faces, empty until somebody reacts (`postWhen_`, docs/history/335).
       THE SAME SQUARE PHOTOGRAPH AND THE SAME MEASURES as the state above, over TWO taps on 👍 a quarter
       of a second apart — the first face, then the last taken back — each held against the card as it
       was before the first: the same `<article>`, pane and `<img>`, the same height, zoom and top. */
```

### ---------- THE WAITING-LIST BRANCH, WHICH IS A DIFFERENT FORM

in `booking`

```
/* ---------- THE WAITING-LIST BRANCH, WHICH IS A DIFFERENT FORM ----------------------------
       `isWaiting_()` CHANGES SIX ROWS AND THE WHOLE WEEK. An ordinary booking ticks eleven hours a
       day and a waiting list ticks three blocks — different grid, different cell count, different
       height — and until this state existed the lab had only ever seen the first. That is the same
       hole the session receipt and the message thread were each in: a branch the fixture cannot
       reach, measured by nothing, on the app's most control-dense card.

       IT COST THE CARD'S LAST THREE PIXELS TO FIND OUT. Measured on its first run: 803px of card in
       an 807px pane, `under: 3`. There is no headroom on this branch at all, which is why the block
       grid's cells are 20px rather than 44 and why the row above it spans — both written up where
       they are.

       SEEDED THROUGH `BOOKING.how` AND `drawBooker()`, which is exactly what the Kind dropdown's
       own `change` handler does. `isWaiting_` tests for "wait", so the string is the option's own
       words rather than a shape that happens to match.

       AND TWO BLOCKS ARE TICKED, because one is not a summary. `blockSay_` groups by block and
       collapses runs of days, and a single cell exercises none of that — `Mon · Tue evenings` is
       the shortest answer that proves the row is a sentence rather than a list of phrases. */
```

### ---------- AND A VENUE, BECAUSE WITHOUT ONE THE BRANCH RETURNS ON ITS SECOND LINE

in `enter`

```
/* ---------- AND A VENUE, BECAUSE WITHOUT ONE THE BRANCH RETURNS ON ITS SECOND LINE --------
           `bookPrice` ANSWERS `null` FOR A WAITING LIST WITH NO VENUE — *"the venue is the only
           answer it needs"* — and `breakdownRows` does `const w = bookPrice(); if (!w) return rows;`
           right at the top of the waiting block. So every run of this state has measured the card
           WITHOUT `A seat`, `Shared by`, `Per session`, `Term` or `About` on it: five of the rows
           that only exist on this branch, on the state written to measure this branch.

           IT NEEDED A SEAT PRICE IN THE FIXTURE TOO. `DATA.waitlistSeat` is a venue-keyed map the
           backend computes, and the fixture had no such key — so the lab could not have drawn this
           card however the state was seeded. Both halves in one commit, or the state reads as
           seeded and still measures the empty branch. */
```

### PUT BACK, because states run in order down one page and the receipt state after this one would otherwise be measuring a waiting list's form.

in `booking`

```
/* PUT BACK, because states run in order down one page and the receipt state after this one
         would otherwise be measuring a waiting list's form. `resetBooking_` is the app's own way to
         empty it — the same call every send path ends with. */
```

### ---------- A SEVERAL-ANSWERS ROW, OPEN UNDER ITSELF, WITH A BOX TICKED

in `booking`

```
/* ---------- A SEVERAL-ANSWERS ROW, OPEN UNDER ITSELF, WITH A BOX TICKED -------------------------
       `check/press.js` REPORTED THE HOLE BEFORE A STATE EXISTED: *"named on a screen and then not found
       to press (2): booking/book-many-pick, booking/book-many-done"*. The ticks are drawn only once a
       row has been pressed, and the press pass builds its queue from what is on the screen — so they
       were pressed by nothing.

       IT WAS `#drop`, a panel outside the screens, and this state's root was the panel. Since 9 October
       (note 315) the list is checkboxes IN the card, under the row it answers, pushing the rows below
       it down — so the measured root is `#s-booking` like every other booking state, and the card is
       longer while it is open: twelve subjects at 44px a row is the arithmetic note 147 ruled the
       in-flow shape out on, before `paneReach_` zoomed and scrolled a long card instead of clipping it.
       `check/ui.js` lays that out at every width now, on every commit.

       SEEDED THROUGH `BOOKING.picking` AND `drawBooker()`, which is what `book-many` does, and ONE BOX
       TICKED the way a finger ticks it — the box flips and `change` bubbles to `book-many-pick`. The step
       is found rather than named: which questions take several answers is `BOOK_STEPS`'s to say. */
```

### THE BOX IS TICKED ONCE IT IS DRAWN, asked again for up to two seconds.

in `enter`

```
/* THE BOX IS TICKED ONCE IT IS DRAWN, asked again for up to two seconds. `check/ui.js` found it
           missing once at 390 on a loaded machine and never in a replay of the same states, so the
           repaint can land late; a box that never comes is still reported, by `expect`. */
```

### ---------- AND A SINGLE ANSWER, CHOSEN

in `booking`

```
/* ---------- AND A SINGLE ANSWER, CHOSEN --------------------------------------------------------------
       THIS WAS "A SINGLE ANSWER OPEN" — a click AT a booking select, which hung the multi-select list's
       panel off it (note 226). The open list is the platform's again (note 315); nothing on the page
       draws it, so there is no open state for this lab to measure. What is left to measure is the card
       ANSWERED through that list — the value, then `input` and `change`, which is all a platform's list
       ever does — and that it reached `BOOKING` through the one `book-set` handler. */
```

### ---------- A ROOM CHOSEN, AND THE ROW SAYING WHICH

in `booking`

```
/* ---------- A ROOM CHOSEN, AND THE ROW SAYING WHICH ------------------------------------------------
       *"colliers would library has 3 rooms within it"* — the owner, 10 Oct (docs/history/336). Once a
       venue has rooms the Venue row's answers are one string until the last word, and a select cannot
       wrap: review chose each of the fixture's three rooms at 390 and every one read "Colliers …", on the
       form and in the picture the Share tile makes. The row draws its answer as words now (`wrap` on the
       `loc` step, `stepSelect_`), with the select laid over them.

       THE LARGE ROOM, CHOSEN THROUGH THE SELECT'S OWN `change`, because it is the one whose words differ
       from a small room's only at the end. What arrives is asked in the real cascade, at every width:
       the words on the row are the chosen option's whole text and none of them is cut off, and the
       select still covers them — so the words are the answer and a tap on them is a tap on the control.
       `check/share.js` takes this state's `enter` for its picture of the form with a room on it. */
```

### ---------- A TUTOR CHOSEN: THE WEEK IS THE DAYS THEY WORK — see `days` in `slotGrid`

in `booking`

```
/* ---------- A TUTOR CHOSEN: THE WEEK IS THE DAYS THEY WORK — see `days` in `slotGrid` ---------------
       THE OWNER, 10 Oct: *"availability of tutors should just show the days they have an availibility
       up. no need to display monday if they dont have any hours on monday."* The form the lab has
       always measured names nobody, so it draws seven days — and the week with a tutor named is a
       different HEIGHT of card, three rows shorter here, which nothing measured. The fixture's Ada
       ticks Monday, Tuesday, Wednesday and Saturday (Monday 17 already taught), so those four and no
       other — and no `Thursday —` put back by the spine, which is the second half of the change. Two
       hours ticked on her Tuesday, so a lit run is on the card the lab looks at. */
```

### ---------- `maxKids` AND `location`, WHICH ARE THE NAMES `doGet` SENDS

in `DATA.liveJobs`

```
/* ---------- `maxKids` AND `location`, WHICH ARE THE NAMES `doGet` SENDS --------------
             THIS SEEDED `students` AND `venue` AND THE PAYLOAD CARRIES NEITHER. Both were read by
             `jobRows`, so on every real receipt the `Students` row was absent entirely — `push`
             skips a row with no value — and `Venue` with it. The state was seeding the names the
             CODE reads rather than the names the SERVER sends, so the lab drew two rows nobody
             holding a real booking has ever seen. Same fault as `sessionDates` below it, found the
             same way: every field this receipt reads, compared against every key `doGet` puts on a
             job. `clientHosts` and `splitEmails` are sent now, so they keep their names. */
```

### ---------- `dates`, BECAUSE THAT IS THE NAME `doGet` SENDS

in `DATA.liveJobs`

```
/* ---------- `dates`, BECAUSE THAT IS THE NAME `doGet` SENDS ---------------------------
             THIS SAID `sessionDates` AND THE PAYLOAD HAS NEVER CARRIED THAT KEY. `doGet` ships the
             run as `dates: dates.join(', ')`, so `jobRows` — which read `j.sessionDates` — found
             nothing on every real job and the `Dates` row printed a dash on every receipt anybody
             has been handed. The state was seeding the name the CODE reads rather than the name the
             SERVER sends, which is the fault CLAUDE.md records about the fixture stating `focus` as
             a string `doGet` does not send: the lab measured a shape that does not exist and
             reported the row working.

             A PAID SEAT AND A FUTURE START, so the five stage ticks are THREE ON AND TWO OFF.
             `jobAccepted_` takes `Booked` and `jobStage_` reads it as a receipt, so `Requested`,
             `Accepted` and `Paid` are true; the dates are still ahead, so `Started` and `Completed`
             are not. A state where all five agreed would measure one box five times. */
```

### ---------- THE JOB'S OWN LOG, WHICH IS WHERE TWO OF THE FIVE DATES COME FROM

in `DATA.liveJobs`

```
/* ---------- THE JOB'S OWN LOG, WHICH IS WHERE TWO OF THE FIVE DATES COME FROM --------
             `doGet` HAS PUT `events: eventsForJob(jobId)` ON EVERY JOB SINCE THE ROSTER WAS
             DERIVED FROM IT (since 342, every job the viewer is ON, or every job for an admin — this
             viewer is on it), and this state seeded none — so `Accepted` and `Paid` could tick with
             no date and the lab could not tell that from a date that failed to draw.

             TWO FAMILIES, EACH ACCEPTING AND PAYING ON A DIFFERENT DAY, because that is the only
             shape that proves the two rules are opposite ends of the list: `Accepted` needs every
             seat, so it takes the LAST Accept (25th, not the 24th); `Paid` needs one booked seat
             on a session, so it takes the FIRST Confirm (26th, not the 28th). A log where everyone
             moved on one day would pass whichever way round they were read.

             `at` IS `dd/mm/yyyy` HERE because that is what `eventsForJob` sends — it puts the cell
             through `fmtDate` on the backend. `createdAt` is the same. The card's own `fmtDate`
             shortens both to the `dd/mm/yy` the `Dates` row above them already uses, and seeding
             the long form is what measures that rather than assuming it. */
```

### `adminKeeps`, BECAUSE THE LAB SIGNS IN AS AN ADMIN and an admin is sent all three figures — so this card draws `Client pays`, `Tutor earns` and `Admin earns`

in `DATA.liveJobs`

```
/* `adminKeeps`, BECAUSE THE LAB SIGNS IN AS AN ADMIN and an admin is sent all three
             figures — so this card draws `Client pays`, `Tutor earns` and `Admin earns` as three
             total rows, which is the tallest the total block gets and the one worth measuring. */
```

### AND THE ADMIN'S THREE FIGURES ARE ROWS OF IT, AND ITS TILES ARE ON IT.

in `booking`

```
/* AND THE ADMIN'S THREE FIGURES ARE ROWS OF IT, AND ITS TILES ARE ON IT. *"no floating tiles
         for already booked sessions"* — every action on the session's page is inside the paper, and
         a session already booked offers no Pay. Asked of the one page in front, since the column
         also holds the form — found by its own reference rather than by `.page.on`. */
```

### ---------- AND SOMEBODY ELSE'S CLASS, WITH SEATS, SEEN BY A FAMILY NOT ON IT

in `booking`

```
/* ---------- AND SOMEBODY ELSE'S CLASS, WITH SEATS, SEEN BY A FAMILY NOT ON IT -----------------
       *"The session booking thing at the bottom of receipt should be a line in the booking."* The
       way in was a block UNDER the paper — seats, price, the list's tally, a gold button, a faint
       paragraph — and this lab had never drawn it: every receipt state here is the admin's own, and
       the block only ever drew for somebody `canAsk` let in. It is a `Take a seat` tile in the
       foot, a `Sharing` row and a `Can come` row now, and those three are what this measures: the
       tally's bars across the answer and figure tracks at 320, and a fifth tile-height thing on a
       card `paneReach_` already shrinks to fit.

       AS A PARENT, NOT AS THE LAB'S ADMIN. `doGet` never sends `canAsk` to an admin — an admin is
       `iAmIn` on every session — so seeding it under the lab's own visitor would measure a card
       nobody can be shown: Take a seat beside Accept, Decline and Delete. The visitor is swapped for
       the length of the state and put back in `leave`, the way `the library still coming` holds
       and returns the payload.

       THE SHAPE `doGet` SENDS A STRANGER: no names on the seats, no `splitEmails`, `canAsk` and
       `seatsGoing` worked out by the server, and `whenCould` as `waitlistWhen` builds it — the
       longest block phrase the grid can write (`Wednesday afternoon`) among them, because the bar
       is the track that has to hold it. */
```

### ---------- AND THE OTHER KIND OF JOINING: A SESSION A FAMILY BOOKED

in `booking`

```
/* ---------- AND THE OTHER KIND OF JOINING: A SESSION A FAMILY BOOKED --------------------------
       THE SAME THREE PIECES, MINUS THE TALLY, AND THE OTHER WORD. `Ask to join` is the tile and
       `job-join` its handler, and until this state nothing in either instrument had ever drawn it —
       `check/press.js` pressed `job-take-seat` for the first time with the state above, and would
       otherwise never press this one at all. `Sharing` is the row that said "Just you" to the very
       visitor this card offers a seat to; it says the seats now, and this asks that it does. */
```

### ---------- THE PICTURE OF IT, IN A SHEET

in `booking`

```
/* ---------- THE PICTURE OF IT, IN A SHEET -------------------------------------------------------
       *"make sure sharing booking is an identical … png … of the booking reciept."* Sharing makes a
       PNG of the receipt and hands it to the phone's share sheet; where there is none, or Safari
       refuses one this late after the press, the picture is offered in a sheet instead — the one
       surface that path draws, and the only place in the app a whole receipt is shown as an image at
       the sheet's width. Measured like every other sheet: does it fit, can its button be hit.

       ENTERED THROUGH `rcOffer_`, which is what the share path calls when it cannot share, with a
       picture the shape of a receipt (a phone card at 2x) made SYNCHRONOUSLY. The first version made
       the real one with `rcPng_` and was not measured at 320 on a loaded machine: a picture is
       asynchronous, `enter` is not awaited, and the sheet was not open yet when it was looked at.
       What the picture holds is `check/share.js`'s question; this one is the sheet around it. */
```

### ---------- AND THE MESSAGES COLUMN, WHICH THIS FILE HAS ONLY EVER SEEN EMPTY

in `STATES`

```
/* ---------- AND THE MESSAGES COLUMN, WHICH THIS FILE HAS ONLY EVER SEEN EMPTY -----------------
     MESSAGES ARE A POST ACTION, NOT A PAYLOAD KEY — deliberately, because a conversation is private
     and the GET payload goes out whole to whoever asks for it. So `check/fixture.json` cannot carry
     one, the column has always drawn "Nothing yet.", and `dm: nothing to report` has meant that
     card and nothing else. The same sentence this file already carries about the booking screen
     signed out, one column along.

     SO THE THREAD IS SEEDED. `MESSAGES` is what `messageThreads_` reads and `loadMessages` writes,
     so setting it is the state the app is in a moment after a successful fetch — the app's own
     door, exactly as the signed-in visitor is seeded through `localStorage` rather than by poking
     `USER`.

     TWO PEOPLE AND A RUN OF THREE, because those are the two things the layout is about: which
     side a bubble is on, and a turn that is several messages long collapsing to one tail and one
     timestamp. One message from one person would measure neither.

     A LONG ONE ON PURPOSE. The widest thing a bubble ever holds is a sentence somebody typed, and
     78% of 320px is where it would clip if `max-width` and `overflow-wrap` disagreed. */
```

### THE EMPTY COLUMN STAYS ON THE LIST.

in `dm`

```
/* THE EMPTY COLUMN STAYS ON THE LIST. Declaring states REPLACES the single unnamed one every
       screen has by default — so naming only the seeded thread would stop this file ever measuring
       the "Nothing yet." card again, which is the state a signed-out visitor and an empty inbox are
       both in. `tools` has the same first line for the same reason. */
```

### ONE PICTURE AND ONE FILE, because a thread of words alone never drew an attachment and the bubble that holds one is laid out differently — no padding round a

in `MESSAGES`

```
/* ONE PICTURE AND ONE FILE, because a thread of words alone never drew an attachment and
             the bubble that holds one is laid out differently — no padding round a photograph, a
             chip for a PDF. The picture is a data: URL so the lab needs no network for it; the file
             is only a link, which is all a file is on the card. */
```

### ---------- AND THE COLUMN POLLS NOW, SO THE SEED HAS TO READ AS FRESH

in `enter`

```
/* ---------- AND THE COLUMN POLLS NOW, SO THE SEED HAS TO READ AS FRESH --------------------
           `dmSync_` ASKS THE BACKEND WHENEVER THE LAST ANSWER IS OVER `DM_EVERY` OLD, which is how
           the Refresh button came off the column — so a state that seeds `MESSAGES` and says
           nothing about when is a state one tick away from being replaced by the harness's own
           empty fixture. `DM_LAST` is when the column last asked, and this state IS an answer
           having just arrived: seeding it is not a test hook, it is the other half of the state
           being declared. */
```

### ---------- AND AN INBOX, WHICH IS THE STATE THE FAULT WAS IN

in `dm`

```
/* ---------- AND AN INBOX, WHICH IS THE STATE THE FAULT WAS IN ---------------------------------
       ONE CONVERSATION IS NOT AN INBOX. The state above seeds a single thread — deliberately, for
       what it measures: which side a bubble sits on and how a run of three collapses. It fits on one
       pane, so for as long as it was the only seeded state this column could not have shown the
       fault it actually had: `screen('dm')` stacked EVERY conversation into one `.pane`, which is
       `overflow: hidden`, and at 390×844 with six of them 493px of somebody's messages were on the
       page with no scroll and no page to turn to.

       I WROTE THE RULE FIRST AND IT REPORTED NOTHING, which is the only reason this state exists:
       putting the `stack()` back did not fire it either, because two cards fit. A rule that cannot
       fail is not a rule — this file has deleted one for exactly that — and what was missing was
       never the rule, it was the state. Same sentence as the filter chips six answers deep.

       SIX, BECAUSE FIVE FITS. Measured at the tallest of the four widths: five conversations sit
       inside the pane and the sixth is what pushes it over, so this is the smallest inbox that can
       answer the question at every width rather than at 320 alone. */
```

### SIX PAGES, NOT SEVEN.

in `dm`

```
/* SIX PAGES, NOT SEVEN. It was `>= 7` while the column opened with a head card carrying a
         heading and a Refresh button — a page with no message on it, which is the card the owner
         asked to be rid of. Six conversations are six pages. */
```

### ---------- AND THE STATES THE CHAT POLISH WAS ABOUT

in `dm`

```
/* ---------- AND THE STATES THE CHAT POLISH WAS ABOUT ------------------------------------------
       *"also refine the chat widgetts. looks fine but refine please."* Every fault that pass found
       was in a state this file had never drawn: the composer with something in it, a refusal, and a
       thread long enough to need all of the pane. Each is declared here so the widths it was fixed
       at are measured at every run, not once by hand.

       A LONG THREAD, AND THE COMPOSER STILL ON THE GLASS. The thread used to stop at 22rem; it now
       takes the pane's own cap less what the head and the composer need, and the pane is `overflow:
       hidden` — so a wrong sum would put the box you reply in under the bottom edge, where nothing
       but a screenshot would see it. `expect` asks the geometry directly: the composer's foot is
       inside the pane, and the thread is taller than the 22rem it used to be held to.

       AND THE CARD IS NOT ZOOMED. A sum that comes out too tall does not clip the composer — it
       is caught first by `paneReach_` in find.js, which draws a card taller than its pane SMALLER,
       so the composer stays on the glass at 85% and every 44px target in it becomes 37px. Proved
       by mutation: with the cap 6rem too generous the first version of this `expect` passed and the
       only trace was a "known" card-drawn-smaller line. So it asks the card's own `zoom` as well. */
```

### A REFUSAL AND A SEND IN FLIGHT, which are the two pending shapes `messagesHtml_` draws.

in `dm`

```
/* A REFUSAL AND A SEND IN FLIGHT, which are the two pending shapes `messagesHtml_` draws. The
       refusal's two controls are the 44px targets this file exists to measure, and its sentence is
       the server's own — the longest is the five-minute one, used here. */
```

### ---------- A PHOTOGRAPH THE DEPLOYMENT COULD NOT KEEP, AS AN ADMIN READS IT

in `dm`

```
/* ---------- A PHOTOGRAPH THE DEPLOYMENT COULD NOT KEEP, AS AN ADMIN READS IT -----------------
       *"i cant send images, or videos in the chat to people."* The refusal `sendMessage` gives when
       Drive says no — the admin's version, because the visitor here IS the admin, and it is the
       widest thing a bubble's red line ever holds: several lines and a consent address with no
       space in it for a hundred characters, in 78% of 320px. And the THIRD control, Words only,
       which is drawn only for `why: 'files'` with something typed — so this is the one state that
       puts three 44px targets in that row. */
```

### THE COMPOSER IN USE:

in `dm`

```
/* THE COMPOSER IN USE: a paragraph typed and two files waiting. The row that wrapped `Send`
       under the `+` at 320px did it with the box EMPTY; with a paragraph in it the box is at its
       tallest, and the tray of chips is the one part of the form that only exists here. `leave`
       empties both, because a queued file counts as typing (`dmTyping_`) and would hold every
       repaint after this one. */
```

### EMPTIED AS A PERSON EMPTIES IT, with `input`:

in `dm`

```
/* EMPTIED AS A PERSON EMPTIES IT, with `input`: the paragraph is a DRAFT now (data.js; docs/history
         317), kept as it was typed and drawn back by every redraw of Messages — set to '' without telling
         anybody, it came back in the next state's composer. */
```

### ---------- NOTIFICATIONS, AS EACH ROLE IS SENT THEM — `notifyCard_` in js/me.js

top level, before `real`

```
/* ---------- NOTIFICATIONS, AS EACH ROLE IS SENT THEM — `notifyCard_` in js/me.js ----------------------------
   *"Also let parents select their communication preferences like notification. And kids and tutors too I
   guess"* (the owner, 9 Oct). The card draws whatever list the server sends on the profile, so a state is a
   ROLE and that role's LIST — and a list typed out here would be this file's belief about the server, the
   fault CLAUDE.md records as "a fixture must send what doGet really sends". So the lists are not typed: they
   are `notifyOf_` itself, asked of the real backend (js/check-gas-load.js) when this file is loaded, and
   written into each state's `enter` as data. A label or a note changed in NOTIFY_KINDS is measured on the
   next run without anybody touching this file.

   WHY `new Function`: every state is carried into the page as its source (`String(state.enter)`) and run
   there, so a closure over a value computed here would arrive empty. A function BUILT from source with the
   list already in it is the same thing the other states are — a line of the app's own code — with the
   server's answer as a literal.

   THE WIDEST CASE EACH: a parent on an address with no space in it, a parent whose address is still waiting
   for its link (the one extra paragraph), a kid with no email (one sentence, nothing to tick), a tutor, the
   admin who is the signed-in visitor, and a backend older than the site (one sentence). The role is played
   through `USER` as the sign-in reply sends it, and `DATA.features` says whether the backend has `setNotify`
   — the fixture's own list predates it. `leave` puts the visitor back exactly. */
```

### ---------- AND THE STORED VISITOR PUT BACK, NOT ONLY THE ONE IN MEMORY

in `state`

```
/* ---------- AND THE STORED VISITOR PUT BACK, NOT ONLY THE ONE IN MEMORY ----------------------------------
       FOUND BY `check/press.js`: a tick pressed in "a parent" is a real save, and a real save writes `USER` to
       `familyUser` — as the parent this state was playing. Every reload after it (`freshen`, the next screen's
       visit) then signed the run in as that parent, and the Games column's swipes and the booking form's
       dropdown were measured for somebody who is not the visitor: two swipes "landed on page 2", wanted 3. So
       the stored visitor is kept in `sessionStorage` by `enter` and written back here, and `USER` is put back
       from it rather than from a copy a reload may have taken of the parent. */
```

