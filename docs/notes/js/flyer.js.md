# js/flyer.js

The full text of comments in `js/flyer.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — js/flyer.js (18 of 18) THE FLYER MAKER, INSIDE THE APP.

top level, before `FLY_ROWS`

```
/* ==================================================================================================
   @family. — js/flyer.js   (18 of 18)

   THE FLYER MAKER, INSIDE THE APP. Campaign, style, colours, size and ten switches; the flyer is
   drawn underneath and printed straight from here.

   IT WAS A SEPARATE FILE and that was a reasonable answer to a real problem: a print tool wants a
   fixed 210mm page and this app is phone-first and fluid, and the two fight. Two things made it
   worth solving properly rather than living in a second file — a second file is a second thing to
   deploy and remember, and it had its own copy of the brand and the venue rates, which would drift
   from the sheet the first time a price changed.

   THE THREE PROBLEMS, AND WHAT EACH COSTS:

     COLOUR NAMES.  The flyer sets its own ink, accent and ground. Written as `--ink` they would
     collide with this stylesheet's own `--ink` and repaint half the app. Every one is `--fly-`
     prefixed, and the cost is that the names are uglier.

     PRINTING.  A browser prints the whole document, so printing from inside the app would put the
     column, the tab bar and the sheet chrome on the paper. `@media print` hides everything and
     lifts the sheet out of the flow — see the `.fm-out` rule in the stylesheet.

     WIDTH.  A 210mm page does not fit a phone. It WAS scaled down to fit the card and scaled back to
     1 for printing; the preview has since been removed on request, so the paper is only ever built
     at true size, at the end of `body`, for the length of a print — see `fm-print`.
================================================================================================== */
```

### ---------- THE CAMPAIGNS

top level, before `FLY_ROWS`

```
/* ---------- THE CAMPAIGNS ------------------------------------------------------------------------
   Each carries its own style and colourway, so choosing one loads a whole recipe rather than
   leaving four more things to set. The colours follow the season rather than a palette: the autumn
   ones warm, January cold, the exam ones plain. */
```

### THE CAMPAIGNS ABOVE ARE NOW A FALLBACK, NOT THE SOURCE.

top level, before `FLY_LIVE`

```
/* ==================================================================================================
   THE CAMPAIGNS ABOVE ARE NOW A FALLBACK, NOT THE SOURCE.

   `FLY_ROWS` held every word on every flyer — eleven headlines and eleven paragraphs, in code. So
   changing "Better call Halex." to "Better call Halex today." was a developer job, which is an
   absurd thing to say about a slogan. The words belong in the sheet, next to the campaign they
   belong to, where the person writing them can reach them.

   WHY IT IS STILL HERE. A tab that is empty, a phone that is not signed in as an admin, a load that
   failed — all three end with no campaigns, and a flyer maker with no campaigns is a blank page. So
   the sheet REPLACES these rows when it has something to say and is ignored when it does not. The
   worst case is the flyers you have today.

   ONE ROW PER WORDING IS WHY `copy` IS ITS OWN TAB. A campaign has one accent colour, so that is a
   column on the campaign. It does not have one headline — the whole point is four and a choice —
   and columns cannot hold four of anything without becoming head_1, head_2, head_3, which caps you
   at whatever number somebody guessed on the day.
================================================================================================== */
```

### The working set: the same eight-column shape as `FLY_ROWS`, so nothing downstream knows or cares where a campaign came from.

top level, before `FLY_LIVE`

```
/* The working set: the same eight-column shape as `FLY_ROWS`, so nothing downstream knows or cares
   where a campaign came from. Built once and then MUTATED IN PLACE by the colour pickers — which is
   why this is a variable holding an array rather than a function returning a fresh one. Rebuilding
   it on every read would throw away a half-picked colour on every keystroke. */
```

### THE CAMPAIGNS AS THE APP SHOULD SEE THEM.

top level, before `flyRows`

```
/* THE CAMPAIGNS AS THE APP SHOULD SEE THEM. Sheet first, code second, and never a mixture: a half
   of each would mean a campaign whose colours came from one place and whose words came from
   another, which is the exact confusion this whole change exists to end. */
```

### THE STYLE CLASSES, WRITTEN OUT — same reason as the sizes above.

top level, before `FLY_STYLES`

```
/* THE STYLE CLASSES, WRITTEN OUT — same reason as the sizes above. `fm-s-${style}` is a name no
   grep will find, so the four rules that style them look unused and get deleted by somebody tidying
   up. Twice now `check-css` has caught this in one file, which is the checker doing its job and me
   reaching for the shorter thing. */
```

### THE CLASS NAME IS WRITTEN OUT rather than built as `'fm-z-' + z`.

top level, before `FLY_PER`

```
/* THE CLASS NAME IS WRITTEN OUT rather than built as `'fm-z-' + z`. `check-css` reports a class it
   cannot find in the source, and it is right to: a name assembled from pieces is a name nobody can
   grep for, and the rule that styles it looks unused and gets deleted. Spelling all three out costs
   two lines and keeps the checker useful. */
```

### ---------- THE SUM THE SITE ALREADY DOES

top level, before `FLY_RATES`

```
/* ---------- THE SUM THE SITE ALREADY DOES --------------------------------------------------------
   A SEAT is the room plus the open tutor rate plus the extra-seat charge for the seats past the
   first, split between the families. Rounded AT THE SEAT, because the seat is what somebody is
   charged and rounding the total first leaves four seats that do not add up to it.

   AN INSTANT CLASS IS A FLOOR AND SAYS "FROM". The real price multiplies by level, day, time and
   subject count, and a flyer cannot ask any of that. Room plus a tutor for the hours is true. */
```

### IS THIS BLOCK SWITCHED ON?

top level, before `FLY_DEFAULT`

```
/* IS THIS BLOCK SWITCHED ON? `dflt` IS FOR WHEN THE SWITCH IS NOT THERE AT ALL. A flyer is drawn in
   two places now — its own tool, where every checkbox exists, and the paper maker, where a flyer is
   one piece among forty and has no checkboxes of its own. Without a default, `flyOn` read a missing
   control as OFF and a flyer placed on a mixed sheet came out as an empty coloured rectangle: every
   block switched off by a switch that was never on the screen.
   THE DEFAULTS ARE THE FLYER TOOL'S OWN. Whatever a checkbox starts as when you open the flyer
   maker is what a flyer piece draws without being asked, so the two agree without either knowing
   about the other. */
```

### ---------- ONE FLYER

top level, before `flyOne`

```
/* ---------- ONE FLYER ---------------------------------------------------------------------------
   Every block is optional, because a sticker is a name and a QR and nothing else, and there should
   be no way to be forced into carrying a paragraph you do not want. */
```

### NO VENUE PICKER MEANS THE MAIN VENUE, NOT A FREE ROOM.

in `flyOne`

```
/* NO VENUE PICKER MEANS THE MAIN VENUE, NOT A FREE ROOM. Drawn inside the paper maker there is no
     `fm-v` on the screen, and reading a missing control as zero priced every seat as though the
     hall cost nothing — a flyer quoting a price that is not the price, printed thirty times. The
     fallback is the same one `initFlyer` uses when the venues tab is empty. */
```

### WHAT IS BEING ADVERTISED CHANGES THE OFFER.

in `flyOne`

```
/* WHAT IS BEING ADVERTISED CHANGES THE OFFER. A flyer for a waiting list and one for an instant
     class are different bargains, and one price for both would be a wrong one. "Neither" is a real
     answer — a poster with no offer on it at all. */
```

### BARE WHEN THE MIDDLE IS EMPTY.

in `flyOne`

```
/* BARE WHEN THE MIDDLE IS EMPTY. A name and a QR pushed to the top left looks like something that
     failed to load; centred, it looks deliberate. Worked out from what is switched on rather than
     from which preset was pressed, so it stays right after you depart from one. */
```

### THE NUMBER, BIG, ON THE LOUD ONE — and only when there is one.

in `flyOne`

```
/* THE NUMBER, BIG, ON THE LOUD ONE — and only when there is one. The fallback used to be the
          site address at thirty point, which wrapped across three lines: not a joke about cheap
          adverts, just a bad advert. Put a phone in the brand tab and this appears. */
```

### THE QR IS DRAWN BY A PUBLIC SERVICE, and that is a real dependency:

top level, before `flyQr`

```
/* THE QR IS DRAWN BY A PUBLIC SERVICE, and that is a real dependency: no signal, no code. Everything
   else here is type, so a flyer made offline is complete apart from one square — which is why it is
   a switch rather than a fixture, and why a failed image removes itself rather than printing a hole. */
```

### ---------- THE SHEET

top level, before `flyControls`

```
/* ---------- THE SHEET ---------------------------------------------------------------------------
   Controls, then the paper. One line of them rather than a table: you are making one flyer at a
   time, and a table of eleven rows is eleven times the interface for one job. */
```

### ---------- IT IS A WIDGET NOW, NOT A SHEET

top level, before `flyControls`

```
/* ---------- IT IS A WIDGET NOW, NOT A SHEET -------------------------------------------------------
   IT OPENED IN A SHEET FROM A CARD ON THE YOU SCREEN, which worked and put a making-things tool in
   a column of settings — next to "Edit your details" and "Sign out". Tools is where somebody looks
   for a thing that makes something.

   A WIDGET RENDERS INTO ITS OWN BOX rather than opening over the app, which is what every other
   tool here does and what makes the section coherent. The markup is unchanged; only where it lands
   is different. */
```

### ---------- THE CONTROLS, WHICH NOW LIVE SOMEWHERE ELSE

top level, before `flyControls`

```
/* ---------- THE CONTROLS, WHICH NOW LIVE SOMEWHERE ELSE -------------------------------------------
   THIS WAS `initFlyer`, AND IT BUILT A WHOLE SECOND TOOL. The flyer maker had its own page, its own
   sheet, its own print button and these controls; the paper maker has all four of those already and
   places a flyer as one piece among fifty-eight. Two tools that both cut A4 is one tool and a
   duplicate.

   IT HAD TO GO RATHER THAN SIT BESIDE IT. Every control here has an id — `fm-c`, `fm-k1`, `fm-h` —
   and pages are now built five ahead, so the flyer page and the paper maker page are in the
   document AT THE SAME TIME. Two elements with one id is not a style problem: `$('fm-h')` returns
   the first one in the document, so the paper maker would have read the hours off a page nobody
   was looking at. `check-css` sweeps for exactly this.

   WHAT IS LEFT IS THE MARKUP AND THE BINDING, called by whoever is hosting the flyer. */
```

### HOW MANY OF IT. One flyer on a mixed sheet, or the sheet filled with the same one to be guillotined — which is what the old tool's "2 up / 4 up / 9 up" was

in `flyControls`

```
/* HOW MANY OF IT. One flyer on a mixed sheet, or the sheet filled with the same one to be
            guillotined — which is what the old tool's "2 up / 4 up / 9 up" was, kept as a choice
            rather than as three sizes that each secretly meant a count. */
```

### EVERY CONTROL REDRAWS.

top level, before `flyBind`

```
/* EVERY CONTROL REDRAWS. Collected from the markup rather than listed, so adding a switch is adding
   a checkbox and nothing else — a list kept in two places is a list that drifts.
   `redraw` IS PASSED IN because the flyer no longer owns the paper it is drawn on. */
```

### CHOOSING A CAMPAIGN SETS EVERY OPTION AND THEN GETS OUT OF THE WAY.

top level, before `flyLoad`

```
/* CHOOSING A CAMPAIGN SETS EVERY OPTION AND THEN GETS OUT OF THE WAY. It set the style and the
   three colours and stopped there, which meant "Better Call Halex" arrived as the right colours
   round the wrong flyer — a shouting yellow poster still carrying a header code and a paragraph,
   because those were whatever the last campaign had left ticked. A recipe that sets four of eleven
   things is not a recipe.
   THE EIGHTH COLUMN IS THE REST OF IT: which blocks that campaign wants. Applied to the tickboxes
   exactly as the shape presets below do it, so there is one idea here and not two — a campaign is
   a preset that also brings colours.
   IT OVERWRITES WHAT YOU HAD TICKED, and that is the point: pressing a preset is asking for its
   look. Departing from it afterwards is the next thing you do, and nothing here stops you. */
```

### `flyDraw` AND `flyFit` WENT ONCE, when the flyer was a piece of the cheat sheet, and `flyDraw` came back with the flyer's own page.

top level, before `flyMenu`

```
/* `flyDraw` AND `flyFit` WENT ONCE, when the flyer was a piece of the cheat sheet, and `flyDraw` came
   back with the flyer's own page. It is a sentence now rather than a picture — the preview was
   removed on request, `flyFit` with it — and the sheet is built by `flySheet` only when it prints. */
```

### ---------- PRESETS, WHICH ONLY TICK BOXES

top level, before `flyMenu`

```
/* ---------- PRESETS, WHICH ONLY TICK BOXES -------------------------------------------------------
   A sticker is not a mode — it is most of the switches off and a smaller size, and you can watch it
   happen. A preset that hid what it did would be a fourth thing to learn and a thing to get stuck
   inside. */
```

### ---------- THE WORDING MENU

top level, before `flyMenu`

```
/* ---------- THE WORDING MENU ----------------------------------------------------------------------
   ONLY WHEN THERE IS A CHOICE. One headline is not a decision, and a dropdown with a single entry
   is a control that teaches you to ignore controls. Two or more and it appears. */
```

### THE PRINT HANDLER AND THE RESIZE HOOK ARE GONE TOO.

top level, before `initFlyer`

```
/* THE PRINT HANDLER AND THE RESIZE HOOK ARE GONE TOO. `mat-print` prints the paper, from a copy
   lifted out of the app column, and `matFit` answers the resize — one path to paper for everything
   this app puts on paper. `printing-fly` and the `.fm-out` rules in the stylesheet went with them.

   WHAT SURVIVES OF THIS FILE is the part that was always the interesting bit: the campaigns, the
   sum that prices a seat, the brand read, and `flyOne` — which draws one flyer and does not care
   what it is drawn onto. */
```

### THE FLYER MAKER IS ITS OWN TOOL AGAIN.

top level, before `initFlyer`

```
/* ==================================================================================================
   THE FLYER MAKER IS ITS OWN TOOL AGAIN.

   It was folded into the maths mat on the argument that a flyer is a piece and A5 is half of A4 —
   which is true, and was never the problem. The problem was what the fold COST: the flyer maker
   stopped having a page. Its preview, its print button and its scaling all went, and what was left
   was a strip of controls that could only draw onto somebody else's sheet. To print one flyer you
   opened the maths mat, ticked a flyer onto it, and printed a maths mat that happened to be a
   flyer. Two tools had become one tool wearing the other as a hat.

   SO THE PAGE COMES BACK AND THE RENDERER STAYS SHARED. `flyOne` still draws one flyer and is still
   the only thing that knows how — nothing is duplicated, and that was the half of the merge worth
   keeping. What returns is everything around it: a sheet to see it on, a scale that fits the phone,
   and a print that puts the flyer on the paper instead of the mat.

   `flyControls` IS REUSED RATHER THAN REBUILT. The old version of this file wrote the same two rows
   of controls a second time, in its own markup, which is how two copies of one thing start drifting
   apart. The controls are built once, here and in whatever else asks for them.
================================================================================================== */
```

### ---------- ADMIN ONLY, AND THE TOOL ITSELF SAYS SO

in `initFlyer`

```
/* ---------- ADMIN ONLY, AND THE TOOL ITSELF SAYS SO -----------------------------------------
     ASKED FOR AS *"make a flyer should only be visible to admin"*. The roster already hides it
     (`admin: true`, `widgetFor_`), and this is the second lock rather than the first: a flyer prices
     the business's classes and prints its advertising, so the one function that builds the controls
     refuses anybody else outright and leaves the box empty rather than half-built. */
```

### ---------- THE CONTROLS ARE THE PART THAT GIVES UP ITS HEIGHT

in `initFlyer`

```
/* ---------- THE CONTROLS ARE THE PART THAT GIVES UP ITS HEIGHT --------------------------------
     MEASURED ON THE TOOLS COLUMN AT 390px: two `.fm-bar` rows (185 each), `.fm-adds` (189) and a
     note (50) come to 609px of controls, and with a 378px flyer and a 44px button under them the
     card is 1252px inside an 805px pane. **447px clipped** — the whole flyer and the whole Print
     button — and this file's own note says the tool got its page back precisely to undo that loss:
     *"Its preview, its print button and its scaling all went."*

     WRAPPED, BECAUSE THE ELASTIC PART IS FOUR ELEMENTS AND NOT ONE. `flyControls()` builds them and
     is shared with whatever else asks for it, so the wrapper goes here rather than inside it — the
     shared builder should not know which column it is being drawn on. `widget-squeeze` is the
     declared class; see style.css beside `.card.is-widget`.

     THE PREVIEW HAS GONE, asked for as "for make a flyer remove the preview". It was an A4 page
     scaled to about a third of a phone, where none of its words could be read, and it was most of
     the card. What replaces it is one line saying what the Print button will put on the paper —
     the size, how many to a sheet, and which blocks are on — because without a picture that is the
     one thing somebody can no longer see for themselves. */
```

### ---------- AND NOT BEFORE THE VENUES ARE IN

in `initFlyer`

```
/* ---------- AND NOT BEFORE THE VENUES ARE IN --------------------------------------------------------
     The rooms and the campaigns come with the payload, so before it lands the venue menu was empty and
     a Print would have priced every seat off the fallback room rate of 15 — a flyer quoting a price
     that is not the price, which is the fault `flyOne`'s own note was written against. Nothing on the
     card said it was early. So until the payload is in, the controls are drawn and veiled by the one
     loader (`loading_`, shell.js), the card keeps its size, and the payload's repaint starts this
     again with the real rooms. The owner, 9 Oct: *"They should all have a simplistic simple loading
     thing while it's info or whatever is loading."* */
```

### THE SHEET, FILLED WITH AS MANY AS FIT.

top level, before `flySheet`

```
/* THE SHEET, FILLED WITH AS MANY AS FIT. `FLY_PER` knows how many of each size go on a page — two
   A5, four A6, nine stickers — so the paper is one flyer repeated rather than a layout to maintain.
   BUILT ONLY FOR THE PRINTER NOW. It used to be drawn into the card on every change and scaled down
   with `flyFit`; with the preview gone it is drawn at the moment it is printed, from exactly the
   controls on the screen, so there is nothing on the card to keep in step with them. */
```

### ---------- WHAT WILL PRINT, IN WORDS

top level, before `FLY_SIZE_SAY`

```
/* ---------- WHAT WILL PRINT, IN WORDS ------------------------------------------------------------
   THE CONTROLS STILL NEED AN ANSWER, and with no picture a change you cannot see is a change you
   cannot trust. One line: the campaign, the size and how many go on a sheet, and the blocks that are
   switched on — read off the same checkboxes `flyOn` reads, so the sentence and the paper cannot
   disagree about what is on it. */
```

### ---------- PRINTING

top level, before `paper`

```
/* ---------- PRINTING ------------------------------------------------------------------------------
   THE SHEET IS BUILT AT THE END OF `body`, NOT INSIDE THE CARD. It used to be the preview, printed in
   place — and the card is inside a column that `placeCells` moves with a transform, which makes that
   column the containing block for anything positioned inside it, and `body` is a centred 26.5rem
   column that clips at 115mm. So "left: 0" meant the column's edge, not the paper's. `mat-print`
   learned this first and builds its paper at the foot of the body; this is the same shape.
   THE CLASS IS SET ONLY WHILE PRINTING, so a print started anywhere else in the app is unaffected,
   and the paper is removed afterwards so nothing of it is left in the document. */
```

