# js/map.js

The full text of comments in `js/map.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — map.js ONE FILE, SPLIT.

top level, before `MAP_WORLD`

```
/* ==================================================================================================
   @family. — map.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   map.js is number 13 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- WORLDS

top level, before `MAP_WORLD`

```
/* ---------- WORLDS ---------------------------------------------------------------------------------
   A borough is a world. Not a metaphor stretched to fit — a borough is exactly what an overworld
   world is: a handful of places close enough to walk between, with a name everybody already knows,
   and a boundary somebody else drew.

   ORDERED BY HOW MANY PLACES ARE IN THEM, so the borough you work in most is World 1. Merton has
   the most venues, so Merton is where the map opens — and that stays true on its own as the estate
   changes, rather than because a number was typed somewhere.
--------------------------------------------------------------------------------------------- */
```

### `|| 0` before the clamp, because NaN passes through Math.min and Math.max unchanged — clamping it does nothing at all, and the list is then indexed with it.

in `mapWorld`

```
/* `|| 0` before the clamp, because NaN passes through Math.min and Math.max unchanged — clamping
     it does nothing at all, and the list is then indexed with it. A guard that cannot fail is
     better here than one that depends on nobody upstream producing a NaN. */
```

### WHERE EACH NODE SITS, in a 0-100 box.

top level, before `mapLayout`

```
/**
 * WHERE EACH NODE SITS, in a 0-100 box.
 *
 * Coordinates are projected against the SPREAD of the venues rather than against London — eleven
 * places inside six miles would otherwise be a cluster of dots in the middle of an empty square.
 * The map is of your estate, so it is scaled to your estate.
 *
 * Latitude is flipped because north is up and y counts down, which is the one arithmetic mistake
 * that makes a map look plausible and be upside down.
 */
```

### NOTHING INVENTED. There used to be a winding fallback path for venues with no coordinates — places drawn somewhere they are not, on a map whose entire value is

in `mapLayout`

```
/* NOTHING INVENTED. There used to be a winding fallback path for venues with no coordinates —
     places drawn somewhere they are not, on a map whose entire value is being right about where
     things are. A venue without a postcode is simply not on the map, and the map says how many
     are missing. */
```

### WHERE A COORDINATE LANDS IN THE BOX, and the only place that decides it.

top level, before `mapProject`

```
/**
 * WHERE A COORDINATE LANDS IN THE BOX, and the only place that decides it.
 *
 * Scaled to the SPREAD of the venues rather than to London — eleven places inside six miles would
 * otherwise be a cluster of dots in an empty square. The map is of your estate, so it is scaled to
 * your estate; the river and everything else is projected through this same function so it cannot
 * disagree with where the nodes are.
 */
```

### ONE VENUE IS STILL A WORLD.

in `mapProject`

```
/* ONE VENUE IS STILL A WORLD. This refused anything under two, on the reasoning that a single
     point has no spread to scale by — true, and the wrong conclusion: Richmond and Sutton have one
     venue each, so both came out with no ground at all, no roads and no parks, which reads as a
     borough nobody has mapped rather than as a borough with one library in it.
     A single point has no spread but it does have a PLACE, and the minimum reach below supplies
     the rest. */
```

### A SPREAD OF ZERO IS ZERO.

in `mapProject`

```
/* A SPREAD OF ZERO IS ZERO. It used to fall back to 1 — a guard against dividing by nothing,
     from when the two axes were scaled independently and a zero would have. One degree is a
     hundred kilometres, so a world with a single venue in it came out scaled to most of southern
     England and drew every park in the file.
     Nothing divides by this any more, and the floor under `reach` below is what stops a zero
     spread collapsing the map. A guard that is no longer guarding anything is just a wrong
     number. */
```

### ONE SCALE FOR BOTH AXES.

in `mapProject`

```
/* ONE SCALE FOR BOTH AXES. They were stretched independently to fill the box, which is why
     Richmond Park came out as a long thin slab and the roads met at angles they do not meet at:
     the map was being squeezed differently across than down. A map with two scales is not a map.

     And PADDED, generously. The venues used to touch the edges, so half the terrain around them
     was clipped off and the nodes had nothing to sit among. A world wants room around it. */
```

### HOW MUCH WORLD AROUND THE VENUES.

in `mapProject`

```
/* HOW MUCH WORLD AROUND THE VENUES. 1.9 was too tight — the three Merton libraries are all in
     the east of the borough, so a map scaled to them stopped short of Wimbledon Common, which is
     the most recognisable thing in Merton. An overworld is mostly scenery with a path through it;
     the path should not fill the frame. */
```

### AND A FLOOR UNDER IT.

in `mapProject`

```
/* AND A FLOOR UNDER IT. Two venues a few streets apart — York Gardens and Battersea Reach are
     barely a mile — would otherwise scale the map to a mile across, so the world is two dots and
     the corner of one park. About three miles is the least that shows a borough: near enough to
     recognise the streets, far enough to hold the commons.
     0.045 degrees of latitude is roughly five kilometres. */
```

### AND A FLOOR UNDER IT — applied AFTER the multiplier, not before.

in `mapProject`

```
/* AND A FLOOR UNDER IT — applied AFTER the multiplier, not before. Before it, the minimum was
     multiplied too and every world came out thirteen kilometres across, which is most of south
     London: Richmond's map showed Sutton's parks and Merton's showed everybody's.
     0.040 degrees of latitude is about four and a half kilometres, which is the least that reads
     as a borough — near enough to recognise the streets, wide enough to hold the commons. */
```

### ---------- THE GROUND

top level, before `WANDLE`

```
/* ---------- THE GROUND ----------------------------------------------------------------------------
   Rivers, roads and greenery — and only one of the three is real.

   NO TABLE, and that is the decision worth explaining. A terrain tab means somebody typing a grid
   of tiles into a spreadsheet: hours of work for something nobody examines closely, wrong the day a
   venue moves, and a second description of a place the venues already describe. Real map data —
   OpenStreetMap — gives proper parks and streets at the cost of a large fetch, an attribution, and
   a map that is ACCURATE rather than LEGIBLE. An overworld is not trying to be right about London.
   It is trying to be readable at a glance.

   So the ground is ROLLED FROM A SEED, the same trick as the sticky notes and the reel
   backgrounds: same venues, same world, for ever. Nobody maintains it and it cannot go stale.

   THE RIVER IS THE EXCEPTION, because it is the one feature that makes a map of London
   recognisable, and because York Gardens sits on it. Approximate — eleven points rather than a
   survey — which is the right amount of truth for a map whose venues are drawn as circles.
--------------------------------------------------------------------------------------------- */
```

### ---------- THE REAL GROUND

top level, before `WANDLE`

```
/* ---------- THE REAL GROUND ---------------------------------------------------------------------
   Approximate, and deliberately so. Every figure below is the rough centre or corridor of a thing
   that is genuinely there — not a survey. On a map whose venues are drawn as circles a few hundred
   metres of error is invisible, and the alternative was a seeded texture that looked like terrain
   and meant nothing.

   BIG THINGS ONLY. The streets of south London are thousands of lines and would read as grey
   noise; its parks include every square and green. What is here is what somebody would name if you
   asked them what is around Merton: the commons, the royal parks, and the four roads everything
   else hangs off.
--------------------------------------------------------------------------------------------- */
```

### IT RISES IN SUTTON. The line used to start at Beddington, which is a mile north-east of where the river actually begins — so a map of Sutton had no water on it

in `WANDLE`

```
/* IT RISES IN SUTTON. The line used to start at Beddington, which is a mile north-east of where
     the river actually begins — so a map of Sutton had no water on it at all, in the borough the
     Wandle comes from. Carshalton Ponds and the Croydon arm are where it starts. */
```

### ---------- THE GROUND

top level, before `PARKS`

```
/* ---------- THE GROUND ----------------------------------------------------------------------------
   Green and roads, and nothing else. No trees, no landmarks, no buildings but the venues — those
   were detail piled on a floor that was not right yet, and detail on a wrong floor is what made the
   board unreadable.

   OUTLINES, PROPERLY. Every green below is a real boundary walked round in eight to fourteen
   points, not a rectangle standing in for one: Wimbledon Common has its long west edge on Beverley
   Brook and its straight east side on Parkside, Morden Hall Park is the thin strip the Wandle runs
   down, Mitcham Common is the wedge the tram cuts through. Those shapes are what make a place
   recognisable from above — a box says only that something is there.

   ROADS ARE CARRIAGEWAYS, not hairlines. Drawn the way every road map draws them: a dark casing
   with a lighter fill on top, so a road has EDGES. A one-pixel stroke is a wire diagram.

   Accurate to a hundred metres or so, which is the limit of what can be written down without a
   survey and more than enough at this size.
--------------------------------------------------------------------------------------------- */
```

### ---------- BUILDINGS

top level, before `BUILDINGS`

```
/* ---------- BUILDINGS ------------------------------------------------------------------------------
   The ones you would use to say where you are, and nothing else.

   NOT EVERY BUILDING. A borough is tens of thousands of footprints; drawn at this size they are
   grey noise, and fetching them would be megabytes for a texture. What is here is what somebody
   would name — the tower, the station, the shopping centre, the hospital, the stadium — which is
   what a landmark IS: a building whose name locates you.

   `size` is roughly how big it is on the ground, in metres, so the Power Station is not the same
   square as a station entrance. Positions are to about fifty metres.
--------------------------------------------------------------------------------------------- */
```

### THE GROUND, projected.

top level, before `onFrame_`

```
/**
 * THE GROUND, projected.
 *
 * Nothing here is generated any more. It was — a seed rolled blobs and curves that looked like
 * terrain and described nowhere — and the argument for it was that hand-drawing terrain is a lot
 * of typing. Which is true of a TILE GRID and false of this: the big things are a dozen lines,
 * they are facts rather than decoration, and a park in the right place is worth more than nine in
 * plausible ones.
 *
 * NOTHING WITHOUT COORDINATES. Real parks around invented venue positions would be a map that is
 * half true, which is worse than one that is honestly not — the same rule the river follows.
 */
```

### WHAT IS ACTUALLY IN VIEW.

in `mapTerrain`

```
/* WHAT IS ACTUALLY IN VIEW. Everything used to be drawn and clipped by the frame, so a map of
     Merton filled with the edges of things miles away. A map of a world shows that world.
     The radius-scaling that lived here went with the circles: a park is an outline now, and an
     outline is already in the right units. */
```

### A road is kept if ANY of it crosses the frame — unlike a park, which is judged by its middle.

in `roads`

```
/* A road is kept if ANY of it crosses the frame — unlike a park, which is judged by its
         middle. A road is long and mostly elsewhere by nature; the A3 belongs on a Merton map for
         the corner of it that clips the north-west, and dropping it for having its centre in
         Kingston would be dropping it for being a road. */
```

### EVERY RIVER, CULLED LIKE A ROAD — kept if any part of it crosses the frame, because a river is long and mostly elsewhere by nature.

in `mapTerrain`

```
/* EVERY RIVER, CULLED LIKE A ROAD — kept if any part of it crosses the frame, because a river
       is long and mostly elsewhere by nature. This was the one layer nothing culled, so the Wandle
       was drawn on a map of Richmond and the Crane on a map of Sutton: a line ruled straight across
       a borough it is nowhere near, which is worse than a missing river because it looks like one.
       Named separately because the Thames is drawn wider than the rest — it is wider — and because
       a world usually has one that matters more: the Wandle in Merton, the Beverley Brook in
       Richmond. */
```

### THE BUILDINGS, as footprints.

in `mapTerrain`

```
/* THE BUILDINGS, as footprints. `size` is metres on the ground, and a metre is about
       0.000009 degrees of latitude — so a 250-metre power station comes out four times the width
       of a 60-metre theatre, which is the point of storing a size rather than drawing every
       building the same square. */
```

### GENEROUS, because a building past the edge is clipped by the frame anyway and there are only forty of them — where being tight cost the two most recognisable

in `buildings`

```
/* GENEROUS, because a building past the edge is clipped by the frame anyway and there are only
       forty of them — where being tight cost the two most recognisable buildings in two of the
       worlds: Twickenham Stadium sat eight units off the left of Richmond and Battersea Power
       Station six off the top of Wandsworth. */
```

### THE GAME LAYER IS GONE, for now.

top level, before `shortName`

```
/* THE GAME LAYER IS GONE, for now.
   There was a path drawn between the venues in the order they came, a gold stretch showing how far
   ticked topics had carried you, a node lit as "here", and locking that could shut the ones ahead.
   None of it was true of anything: the path was not a route anybody walks, the order was the order
   the sheet happened to be in, and "here" was a division sum.
   What is left is a map of where the venues actually are, on ground that is actually there. The
   progression can come back once the ground is right, and it will be worth more sitting on
   something accurate than it was sitting on something invented.
--------------------------------------------------------------------------------------------- */
```

### A NAME SHORT ENOUGH TO SIT UNDER A PIN.

top level, before `shortName`

```
/* A NAME SHORT ENOUGH TO SIT UNDER A PIN. "Library" and "Centre" go because every one of them is a
   library or a centre — what tells them apart is the place, which is the part worth keeping.

   This was defined next to the projection maths and went out with it when the fake third dimension
   was removed. Nothing complained: it is only called inside a template string, so the file parsed,
   every check passed, and the map would have thrown the moment anybody opened it. That is the exact
   failure `stub-run` exists for, and the map is not in it — which is worth more than the fix. */
```

### Every casing first, then every fill — not casing-then-fill road by road, which would let one road's dark edge cut across the road beside it at every junction.

in `host.innerHTML`

```
/* Every casing first, then every fill — not casing-then-fill road by road, which would let
          one road's dark edge cut across the road beside it at every junction. Two passes is how a
          road map is drawn and the only way junctions look joined. */
```

### BUILDINGS, on top of the roads because they front onto them.

in `host.innerHTML`

```
/* BUILDINGS, on top of the roads because they front onto them. Top-down like everything
          else — a footprint, not a little house seen from the side. Squares mostly, because from
          above most buildings are, and a station is drawn longer than it is wide because a
          platform is. */
```

### WRITTEN OUT, not assembled.

in `host.innerHTML`

```
/* WRITTEN OUT, not assembled. `map-bld-${kind}` produces the same markup and is invisible
              to the check that every styled class is actually emitted — which is the check that has
              now caught three rules outliving their purpose. A class built by concatenation is a
              class that check cannot see. */
```

### A VENUE IS A BUILDING TOO, and the only one that is coloured — everything else on the map is where you are, this is where you are going.

in `host.innerHTML`

```
/* A VENUE IS A BUILDING TOO, and the only one that is coloured — everything else on the map
          is where you are, this is where you are going. Drawn as a footprint like the rest so it
          sits in the same world rather than floating over it as a pin. */
```

### A DIRECTION, OR NOTHING HAPPENS.

top level, before `by`

```
/* A DIRECTION, OR NOTHING HAPPENS. Without the guard a press carrying no `data-by` gives
     `Number(undefined)` — NaN — and NaN survives every clamp below it, so `MAP_WORLD` becomes NaN,
     `mapWorld()` indexes the list with it, and the map throws on `.venues` of undefined from then
     on. One malformed press and the screen is dead until a reload. */
```

### `initOverworld()` WAS HERE and did nothing but call `drawOverworld()`.

top level, before `SCORE_TOP`

```
/* `initOverworld()` WAS HERE and did nothing but call `drawOverworld()`. Nothing called it: the
   widget points at `initOverworldBoard`, and the SVG map is drawn by `drawOverworld` directly.
   A function that only forwards is a name to maintain and a thing to read; the note below still
   says which of the two the widget uses, which is the part that was worth keeping. */
```

### THE HIGH SCORES — ONE BOARD, TWO GAMES, AND NOTHING NEW ON THE WIRE

top level, before `SCORE_TOP`

```
/* ==================================================================================================
   THE HIGH SCORES — ONE BOARD, TWO GAMES, AND NOTHING NEW ON THE WIRE

   ASKED FOR AS "add a high scores chart to times table and flabby pird". Measured before anything
   was built: `doget.gs` has sent `highscore: N(r.high_score_flappy)` and
   `ttHighscore: N(r.high_score_tables)` on EVERY tutor row and EVERY student row since those games
   were written, and the only thing that has ever read either is the player's own `Best` line. Two
   columns shipped to every phone on every load and drawn for one person — this repository's oldest
   shape, already recorded under `figure`, `orderPrints`, the four message actions, `exam_date` and
   `wow`. So the board needs no backend change, no new tab and no new column: it is the second
   reader of something already there.

   WHO IS ON IT IS THE SERVER'S DECISION AND IS NOT REPEATED HERE. `doget.gs` sends `payload.students`
   only when `maySeeChildren` — an admin, a parent, or a student — so a signed-out stranger is sent
   no children at all and the board simply has fewer rows. Filtering them off on the phone instead
   would be the `MESSAGING` fault: one policy written in two places, and the copy on the phone is the
   one that gets forgotten. Absent by construction, the way the films list already is.

   ONE RENDERER, BECAUSE THE TWO BOARDS ARE ONE OBJECT. They differ in a single column name. A second
   copy is a second chance to sort them differently, round them differently, or fix one and not the
   other — `documents_()`, `factsNow_`, `paperIdOf_` and `childrenOf` are the four times this file
   has paid for that.

   AND IT SAYS WHICH EMPTY IT IS. A payload that never arrived and a game nobody has played both
   produce an empty list, and showing the second for the first is how a network blip reads as
   everything having been deleted. `scoreBoard_` counts the PEOPLE it was given before it counts the
   scores, so "no people at all" says the scores have not arrived and "people, no scores" says
   nobody has played.
================================================================================================== */
```

### THREE, AND THEN YOU — AND THE NUMBER IS MEASURED RATHER THAN CHOSEN.

top level, before `SCORE_TOP`

```
/* THREE, AND THEN YOU — AND THE NUMBER IS MEASURED RATHER THAN CHOSEN.
   A leaderboard you are not on is a leaderboard you stop looking at, so if your own score is outside
   the three the board shows it underneath with the place it is actually in. Five rows is the most
   this can ever be, whatever the list holds.

   THREE BECAUSE `.pane` IS `overflow: hidden` AND CANNOT GROW. Measured on the Flabby Pird card,
   which is the tight one of the two: the pane caps at 803px at 768 and 1280, and the card without a
   board is 634px — so the board has about 140px, and everything past that is below a fold with no
   scroll and no page to turn to. At five plus your own line it was 251px, and `check/ui.js` said so
   on the first run that could reach this state: ".pane holding card hides 111px below its own
   fold". Three plus yours, on the tighter rows `.board` declares, is 140px at every width, measured
   with the longest handle in the seeded list wrapping onto two lines.

   THE BOARD IS THE NEWCOMER, SO THE BOARD GIVES WAY. The alternative is a smaller canvas, and
   shrinking the game to make room for a list about the game is the wrong way round. The times-table
   card has room for more and gets the same number anyway: one board, one renderer, one figure —
   two numbers is two things to keep in step, and the second one goes stale. */
```

### THE SAME SCORE IS THE SAME PLACE.

in `scoreRanks_`

```
/* THE SAME SCORE IS THE SAME PLACE. Two children on forty shown as third and fourth is the board
     inventing a difference the game did not make, and the one who got fourth is the one who reads
     it that way. Standard competition ranking: equal scores share a place and the next one skips. */
```

### THE ROW IS THE APP'S OWN `.row`, not a thing of its own:

top level, before `boardRow_`

```
/* THE ROW IS THE APP'S OWN `.row`, not a thing of its own: it sits directly under `Score` and
   `Best` in the same card, and a list that lines up with the rows above it is a list that reads as
   part of the same object. Written out rather than built with `row()` because the mark for your own
   line belongs on the ROW — see `.board .row.is-me` in style.css, where a gold rule down the left
   cannot lose a specificity race to the flappy card's own row colours the way a text colour would. */
```

### ---------- AND "NOT ARRIVED" WHILE THEY ARE ON THEIR WAY IS THE ONE LOADER

in `scoreBoard_`

```
/* ---------- AND "NOT ARRIVED" WHILE THEY ARE ON THEIR WAY IS THE ONE LOADER ------------------------
     The people come with the payload, so before it lands this said "Scores have not arrived yet." —
     true, and a wait drawn in words of its own, two cards apart from a dozen others drawn some other
     way. The owner, 9 Oct: *"They should all have a simplistic simple loading thing."* While the
     payload is on its way the board is `loading_()` (shell.js); `paintBoard_` runs from the game's own
     `start`, which the payload's repaint calls again, so the scores replace it where it stands. The
     sentence stays for the case it is a FACT: a payload that came, or failed for good, with nobody in
     it. ON ITS WAY IS `awaiting_`, not `!LOADED`: a failed first payload the app is asking again for
     is still on its way, and this said "not arrived" under "Reconnecting…" until review found it. */
```

### ASKED OF THE ROWS ON SCREEN RATHER THAN OF THE PLACE.

in `scoreBoard_`

```
/* ASKED OF THE ROWS ON SCREEN RATHER THAN OF THE PLACE. `pos > SCORE_TOP` reads correctly and is
     wrong the moment two people tie: sharing a place means the fourth ROW can be in third PLACE, so
     somebody would be neither in the list nor under it. Whether your line is already drawn is a
     question about the list, and the list is right here. */
```

### Called from `initFlappy` and `initTables`, which is to say from `startScreen_` — so the board is rebuilt on every paint of the column, which is what puts the

top level, before `paintBoard_`

```
/* Called from `initFlappy` and `initTables`, which is to say from `startScreen_` — so the board is
   rebuilt on every paint of the column, which is what puts the payload's figures on it the moment
   `load()` lands. Silent when the card is not on the screen. */
```

### ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES

top level, before `WIDGETS`

```
/* ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES ----------------
   Every widget slot is drawn in the quiet before it is needed (`aheadDrawWidget_`, arcade.js; docs/history/
   341). A widget with no `stop` is drawn by its `start`, whose note says nothing of it runs on. A widget WITH
   a `stop` runs something a stop has to end — a clock, a frame loop, a clip, the network, the classroom
   round — so it declares a `draw` that puts down its card and runs none of it, and is started exactly as it
   always was, on arrival. `check-widgets.js` runs every draw ahead in a sandbox and fails on a fetch, a media
   source, sound, the camera, an interval, a timer still pending, or a write outside the slot.
   `pure: true` SAYS THE DRAWING READS NO FACTS — nothing from the payload and nothing a landing changes: a
   calculator, a timer, a board game. Such a drawing cannot go stale, so a paint carries it across and a
   landing leaves it; every other drawing goes back under its loader when the facts move and is drawn again
   from the new ones. It is not taken on trust: `check-widgets.js` draws each widget for two people over two
   payloads and fails a `pure` whose drawing differs, and a drawing that never differs without one. */
```

### THE BOARD, AND NOTHING ELSE.

in `WIDGETS`

```
/* THE BOARD, AND NOTHING ELSE.
       A title saying "Chess" above a chessboard, and a line explaining that chess has castling in
       it. Then three controls under it — New game, Take back, and a difficulty menu — which is
       three decisions to read past before the first move.
       A board is self-explanatory in a way almost nothing else in this app is. What is left is the
       board and one line telling you whose move it is, which is the only thing a board cannot say
       for itself. */
```

### AND THEN TWO PLAYERS, WHICH PUT TWO BUTTONS BACK.

in `WIDGETS`

```
/* AND THEN TWO PLAYERS, WHICH PUT TWO BUTTONS BACK. With a computer opponent there was nothing
       to take back and a new game was leaving the page; with two people at one phone a finger slips
       and the person opposite agrees it did not count, and a game ends and another starts. The
       whose-move line went ABOVE the board, because it is what the person being handed the phone
       reads first. `chess-game` is the class `drawChess` draws into — see the note there. */
```

### DRAWN AHEAD BY ITS OWN START (`draw`, docs/history/341):

in `WIDGETS`

```
/* DRAWN AHEAD BY ITS OWN START (`draw`, docs/history/341): `initTables` writes the idle card and the
       board and runs nothing — the clock is the Start button's. It clears `ttState`, which is why the
       builder only draws a widget that is running nowhere (`aheadDrawWidget_`, arcade.js). */
```

### THE BOARD, NOT THE DRAWING.

in `WIDGETS`

```
/* THE BOARD, NOT THE DRAWING. `initOverworld` draws the flat SVG map of venues; the board that
     came out of overworld.html is the tiled one with the real Colliers Wood outlines on it, and it
     goes in the same card through the same id. The SVG one is still here and still works — see the
     note beside `drawOverworld` — so putting this back is changing one word. */
```

### `The Overworld` WAS A WIDGET HERE and is gone on request:

in `WIDGETS`

```
/* `The Overworld` WAS A WIDGET HERE and is gone on request: it did not work well enough to keep
     and nobody was opening it. `drawOverworld` and `initOverworldBoard` are still in this file and
     in overworld.js — the map they draw is used elsewhere, and deleting a working renderer because
     one entry point closed is how a codebase loses things it still needs. `check-dead` will name
     anything that is genuinely now unreachable, which is the right way to find that out. */
```

### ---------- THREE THAT NEED NO `stop`

in `WIDGETS`

```
/* ---------- THREE THAT NEED NO `stop` ----------------------------------------------------------
     Flabby Pird has one because it runs sixty frames a second whether or not anybody is looking.
     These three move only when tapped, so parked off-screen they cost exactly nothing and there is
     nothing to tear down. Worth saying here rather than leaving the absence to be read as an
     oversight. */
```

### ---------- BOTH BOARDS ARE TWO PLAYERS ON ONE PHONE

in `WIDGETS`

```
/* ---------- BOTH BOARDS ARE TWO PLAYERS ON ONE PHONE --------------------------------------------
     THEY PLAYED AGAINST THE APP and were asked to stop — "connect 4 should be not against pc but 2
     player", "should be 2 player not against cpu". The subtitle is the only place the app can say
     so, and a board game whose subtitle still says "you are black" is a board game somebody sets up
     wrongly. See `c4Reply_` and `othReply_` in games.js, where both opponents were deleted and the
     argument for them is kept. */
```

### A PAD, NOT A SWIPE. Up, down, left and right are the four gestures this app navigates by, so a maze that read them would fight the pager on the one screen it

in `WIDGETS`

```
/* A PAD, NOT A SWIPE. Up, down, left and right are the four gestures this app navigates by, so a
     maze that read them would fight the pager on the one screen it lives on -- see `initMaze`. The
     four buttons are 44px in px, which is the one measurement in this app that does not scale. */
```

### ---------- WORD GAMES — EIGHT GAMES, ONE WIDGET

in `WIDGETS`

```
/* ---------- WORD GAMES — EIGHT GAMES, ONE WIDGET ---------------------------------------------------
     ASKED FOR AS "Merge word games into one widget. Like articulate and charades". They were seven
     cards in a row on the Games column — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20
     Questions and Imposter — every one a round of somebody saying words while the room guesses, and
     seven swipes to get past them to the maze. Herd Mentality is the eighth, moved in afterwards.

     ONE CARD, A DROPDOWN, AND THE CHOSEN GAME UNDERNEATH. `WORD_GAMES` in games.js holds each game's
     body and its own start and stop, and nothing about the engines changed: `ROUND_GAMES`, `PARTY`
     and Imposter each still draw into their own `<k>-card`, which is simply inside `#wg-slot` now.
     The choice is remembered on the device.

     `stop` STOPS ALL EIGHT, not just the one on screen. A game switched away from mid-round has had
     its card taken out of the document, so its own stop is exactly the "column left" case each one
     already handles — Articulate's clock stops, a party game pauses, Imposter hides its word.

     HERD MENTALITY WAS LEFT OUT, AND THE OWNER PUT IT IN — "heard mentality is a word game so should
     go there." It was kept separate on the builder's reasoning, that a question everybody answers at
     once is not a word to get across; that was a call nobody had asked for, and the owner's line
     overrides it. Alibi was the other one left out, and is deleted — see where its card was, below. */
```

### A GETTER, SO THE CHOSEN GAME IS IN THE MARKUP `paint` PUTS DOWN.

in `WIDGETS`

```
/* A GETTER, SO THE CHOSEN GAME IS IN THE MARKUP `paint` PUTS DOWN. A repaint is a stop and a
       start a moment apart, and the party games' stop asks whether their own card is on the screen
       in front to tell a repaint from a leave — with an empty slot until `start` filled it, every
       repaint read as the column being left and paused the round under somebody's finger. */
```

### ---------- AND THIS ONE KEEPS ITS GAME

in `WIDGETS`

```
/* ---------- AND THIS ONE KEEPS ITS GAME ------------------------------------------------------
     EVERY OTHER BOARD HERE IS REBUILT ON EVERY PAINT and says why: the widget is reopened by a
     swipe, so a half-played position is a game you have forgotten starting. A Scrabble game is
     forty minutes and up to four people, and `repaint` runs whenever a payload lands or anything
     saves — so `initScrabble` redraws whatever is in progress rather than dealing again. `New game`
     is the only thing that throws one away, which is the only thing that should. */
```

### `alibi` WAS HERE, a card of its own between Scrabble and the maze, and is deleted on request ("delete alibi game.") — the note where its engine was in games.js

in `WIDGETS`

```
/* `alibi` WAS HERE, a card of its own between Scrabble and the maze, and is deleted on request
     ("delete alibi game.") — the note where its engine was in games.js says what went with it. A
     star on it no longer matches a widget, so `savedWidgets_` simply stops drawing it. */
```

### ---------- WORD SEARCH — TWO TAPS, NOT A DRAG

in `WIDGETS`

```
/* ---------- WORD SEARCH — TWO TAPS, NOT A DRAG ----------------------------------------------------
     The note over `WS_THEMES` in games.js is the argument, and it is the maze's argument: a drag
     across the grid would fight the pager for the one gesture this app navigates by. Tap the first
     letter, then the last. NEW PUZZLE IS UNDER THE GRID, the maze's place for New maze, and not
     beside the select: on one row at 320px the select had eighty pixels and read "Spelling…",
     which is a choice nobody can read. */
```

### ---------- SENTENCE SCRAMBLE — CUT-UP PAPER ON A PHONE

in `WIDGETS`

```
/* ---------- SENTENCE SCRAMBLE — CUT-UP PAPER ON A PHONE ------------------------------------------
     The note over `SS_SENTENCES` in games.js is the argument. The chips and Check are built by
     `ssPaint`, so nothing here can be pressed before there is a sentence. Skip is built there too,
     beside Check, rather than beside the select — see the word search above for what that row
     did to the select's label. */
```

### `herd` WAS HERE, Herd Mentality's own card, and it is a game inside Word games now — see the note over the `wordgames` entry above.

in `WIDGETS`

```
/* `herd` WAS HERE, Herd Mentality's own card, and it is a game inside Word games now — see the
     note over the `wordgames` entry above. Its engine and its markup moved unchanged; a star on the
     old id stops matching, as it did for the seven before it. */
```

### `stop` IS THE CLIP. This card deals a fact on a tap and some of those facts are videos, so leaving the column with one playing left it playing — the same fault

in `WIDGETS`

```
/* `stop` IS THE CLIP. This card deals a fact on a tap and some of those facts are videos, so
     leaving the column with one playing left it playing — the same fault the Reels column had,
     with less to find it by: there is no column to come back to, just sound from a screen you are
     not on. `clipsStop_` is the one the column uses. */
```

### DRAWN AHEAD AS THE FACT'S CARD AND NOTHING ELSE (`feedPaint_`, overworld.js):

in `WIDGETS`

```
/* DRAWN AHEAD AS THE FACT'S CARD AND NOTHING ELSE (`feedPaint_`, overworld.js): `drawFeed` would set
       a clip's source (up to 7MB) and fetch its photograph. A fact that is a `<video>` clip is left under
       the loader — a video with no source is a black box, and the loader is the honest face of it. */
```

### ---------- CONTEST — A PLACEHOLDER, AND IT SAYS SO

in `WIDGETS`

```
/* ---------- CONTEST — A PLACEHOLDER, AND IT SAYS SO --------------------------------------------
     ASKED FOR AS "make a widget in games column purley dedicatied for contest. make it a place holder
     for now." So it is the card and the slot, and nothing that can be pressed. That is `drill`'s
     argument, on the Tools column further down: a placeholder that looks finished is worse than an
     empty one, because somebody taps the thing that looks like a control and the app reads as broken
     rather than as unbuilt. No `start`, no `into`, no button, so `check/press.js` finds nothing
     that does nothing.

     LAST ON THE COLUMN, AND APPENDED RATHER THAN PLACED. `PAGE.games` remembers a page by its index,
     so an entry inserted anywhere above would move every saved position after it by one — somebody
     who left the column on the maze would come back to the card before it.

     NOT `solid`, so the funnel does not offer it as a search result: a card that says "not built
     yet" is not an answer to anybody's question. */
```

### A GETTER, SO THE NAME IS THE SHEET'S.

in `WIDGETS`

```
/* A GETTER, SO THE NAME IS THE SHEET'S. `brand('name')` is read when the card is drawn rather
       than when this file loads, which is before the payload has said what the business is called.
       THE BRAND'S OWN FULL STOP ENDS THE SENTENCE, so the line does not break before a dash and
       start its second row with one, which is what "… on @family. — coming soon" did at 390. A
       name in the sheet without one gets one, so the sentence ends either way. */
```

### ---------- VIDEOS — TYPE, TAP, WATCH

in `WIDGETS`

```
/* ---------- VIDEOS — TYPE, TAP, WATCH -----------------------------------------------------------
     ASKED FOR AS "videos would be in the games column. its one new widget. its a video searcher you
     type in. and there should be a full screen button." — and before that as "Video cool videos
     database for reals and movies". So it is ONE card: a box you type in, a list that narrows as you
     type, a player in the card, and a Full screen tile under it. The engine is `initVideos` in
     games.js, with the long note on where the list comes from and why YouTube is embedded here when
     the reels' embeds were taken out.
     AND SINCE 10 OCT IT OPENS ON THE BAR ALONE: *"at first all you see is a search bare, then you
     search and you see relevant result underneath. max 4 results show."* — four results as you type,
     a tap plays in the card in their place, Full screen fills the glass (note 321).

     LAST ON THE COLUMN, after `contest`, for `contest`'s own reason: `PAGE.games` remembers a page by
     its index, and an entry placed anywhere above would move every saved position after it by one.

     NOT `solid`, like every other game: the funnel drawing a search box inside a search result is a
     search inside a search. `.vid-box` is a class as well as an id — the timetable's reason, the
     Saved column draws this markup again and `vidPaint_` writes every copy.

     `name` WAS "Videos (films, reels and clips)". The reels left the card a while ago (*"the video
     widget shouldn't acknowledge reels"*), and "films" was a word every visitor read for a list only
     an admin is sent — the one sign, on a student's screen, that the films exist. */
```

### `solid` — AN INSTRUMENT, NOT A CARD.

in `WIDGETS`

```
/* `solid` — AN INSTRUMENT, NOT A CARD.
     The pane is frosted glass because most of what sits on it is CONTENT: a post, a receipt, a list
     of things to find, and glass says "this is a surface something is written on".
     A calculator is not written on the surface, it IS the object. Frosted glass with a keypad
     floating in it reads as a picture of a calculator; an opaque casing reads as one you can press.
     Declared here beside the widget's own markup rather than in the sheet: the sheet decides
     WHETHER and WHERE a widget appears, which can differ per deployment, and this cannot — a
     calculator is an instrument everywhere or the word means nothing. */
```

### MESSAGES, as a widget.

in `WIDGETS`

```
/* MESSAGES, as a widget. It is a thing you read, which is what these are — and a whole pane
     shows a conversation where a card on the You screen could only ever say how many were unread.
     `solid` because it is a device you look INTO rather than a surface something is written on. */
```

### MESSAGES IS NOT A WIDGET ANY MORE.

in `WIDGETS`

```
/* MESSAGES IS NOT A WIDGET ANY MORE. It lived here, in Find, alongside the calculator and the
     games — on the reasoning that it is a thing you READ, which is what the widgets are.
     It is not the same kind of thing. A calculator, a board and a timer are instruments: you go
     looking for one because you want to do something with it. A message is somebody trying to
     reach YOU, and it belongs where everything else about you is — beside your credits, your
     details and the way out. Nobody hunts through a list of tools to find out whether anybody has
     written to them.
     Moved to the You screen; see `meBlocks`. */
```

### A DIV, not an input.

in `html`

```
/* A DIV, not an input. A readonly input shows no caret on a phone, and one that is not
          readonly opens the keyboard over the keypad you are trying to press — so the caret is
          drawn, which is what makes the arrows mean anything. */
```

### THE FLYER MAKER WAS FOLDED INTO THE CHEAT SHEET MAKER ONCE, AND IS ITS OWN TOOL AGAIN — the `flyers` entry below.

in `WIDGETS`

```
/* THE FLYER MAKER WAS FOLDED INTO THE CHEAT SHEET MAKER ONCE, AND IS ITS OWN TOOL AGAIN — the
     `flyers` entry below. This note used to say the opposite, that a flyer was a piece you ticked on
     the cheat sheet, and went on saying it after the pieces went back: `MAT_PARTS` holds no flyer and
     `matDraw` draws none, so the cheat sheet maker is not a way to a flyer for anybody. Asked again as
     *"make a flyer should only be visible to admin"* — which is `admin: true` on that entry, asked
     through `widgetFor_` by every door that can show or open a widget. */
```

### THE CHEAT SHEET MAKER.

in `WIDGETS`

```
/* THE CHEAT SHEET MAKER. A tool rather than a game, and `solid` like the others in this section,
     so it is listed and searchable with everything else.
     IT WAS "Maths mat", which is what a tutor calls it and not what a student searching for one
     would type. The id stays `mat` — it is written into `mat-box`, into every `mat-` handler and
     into the checkers, and an id is a wire rather than a label.
     SEARCH MATCHES THE NAME AND NOTHING ELSE for a widget (`find.js` gives them an empty `sub`),
     so the old word has to be IN the name or it stops being findable — which is why this reads
     "maths mat" at the end rather than dropping it. */
```

### THE FLYER MAKER, WHICH IS A TOOL AND NOT A PIECE OF THE CHEAT SHEET.

in `WIDGETS`

```
/* THE FLYER MAKER, WHICH IS A TOOL AND NOT A PIECE OF THE CHEAT SHEET. It was folded into the
     sheet and lost its own page doing it — see the note at the foot of flyer.js. This is that page
     back: its own paper, its own print, and `flyOne` still the only thing that draws a flyer. */
```

### THE HOURS A TUTOR CAN TEACH.

in `WIDGETS`

```
/* THE HOURS A TUTOR CAN TEACH. It existed and could only be reached by opening *Your details*
     and scrolling past everything else — see the note over `initAvail`. `tutor: true` is the
     flyer's `admin: true` one role along, and the name carries the word somebody would type:
     search matches a widget's name and nothing else. */
```

### NOT "TICK THE HOURS YOU CAN TEACH".

in `html`

```
/* NOT "TICK THE HOURS YOU CAN TEACH". `availGrid_` prints that line itself, directly below
          this one, because in the details sheet it is the only instruction there is — so writing
          it here put the same sentence on the card twice, one under the other, in the same
          feature I had just been asked to take the duplication out of. This says the half the
          grid cannot: what ticking them DOES. */
```

### NO BLURB. It said "one sheet of A4, tick what goes on it" over a list of tickboxes on a page showing a sheet of A4 — three sentences describing what is already

in `WIDGETS`

```
/* NO BLURB. It said "one sheet of A4, tick what goes on it" over a list of tickboxes on a page
       showing a sheet of A4 — three sentences describing what is already on the screen, read once
       and then skipped forever while still taking the top of every visit. The two facts worth
       keeping were that the ruler and protractor print at true size, and those belong on those two
       components rather than in a paragraph about the whole tool. */
```

### ---------- `Your week` WAS HERE, AND IS IN THE TIMETABLE NOW

in `WIDGETS`

```
/* ---------- `Your week` WAS HERE, AND IS IN THE TIMETABLE NOW -------------------------------------
     A grid of the sessions booked here, built from `liveJobs` on opening. It sat beside the Timetable,
     which is the week somebody writes down, and the two never met — *"calander and time table and
     availability ... it seems they clash"*. The Timetable draws the booked sessions now, locked among
     your own lessons, and tapping one opens it as the grid's blocks did. One week view, not two.
     REMOVED FROM THE MIDDLE OF THE LIST, which moves every tool after it up one on `PAGE.tools` for
     anybody whose remembered page was past it — a one-off jump to the next tool, said here because
     the note over `legotrade` is why nothing is ever inserted above `calendar`. */
```

### ---------- THE `live` WIDGET WAS HERE

in `WIDGETS`

```
/* ---------- THE `live` WIDGET WAS HERE ------------------------------------------------------------
   ONE WIDGET HOLDING EVERY SESSION. It is one widget PER session now, built from the data by
   `liveWidgets_` in book.js the way `msgWidgets_` builds one per conversation — so each is named
   for itself, counted on its own under Booking, and findable by typing its subject.
   Nothing static is left to declare: a session is not a fixture of the app, it is a row. */
```

### ---------- THE TIMETABLE, THE ONE WEEK VIEW

in `WIDGETS`

```
/* ---------- THE TIMETABLE, THE ONE WEEK VIEW ----------------------------------------------------
     The week somebody writes down themselves — a school timetable, a tutor's standing hours — with
     the sessions BOOKED here drawn into it, locked (`Your week` used to be a second widget for those).
     Kept on the account when signed in, on the device when not; see the note over `tmtRead_` in
     games.js.

     `.tmt-box` IS A CLASS AS WELL AS AN ID, the basket's reason: the Saved column draws this markup
     again and `tmtPaint_` writes every copy. */
```

### NOT `pure`, though it was until the review of 12 Oct:

in `WIDGETS`

```
/* NOT `pure`, though it was until the review of 12 Oct: it draws the person's own week (`USER.timetable`)
     AND the sessions booked here, locked into it — a booking is a fact, and a landing that brings one must
     not leave the week drawn without it. It passed `check-widgets.js` only because nobody in that check had
     a week or a booking; one there has a week now, and the check says what this says. */
```

### NO `.card` OF ITS OWN.

in `WIDGETS`

```
/* NO `.card` OF ITS OWN. `widgetOnColumn_` already draws the card, and the inner one only added
       .85rem above and below and a hairline — height a full Monday on a 320x568 phone does not have.
       The basket makes the same choice. */
```

### ---------- TOUCH TYPING

in `WIDGETS`

```
/* ---------- TOUCH TYPING ----------------------------------------------------------------------
     ASKED FOR AS *"Add a widget for keyboard practice with no eyes like that one website in links"*
     — TypingClub, L082 in links.json — and again as *"add keyboard tool widget."* One widget answers
     both; `piano` in Skills is the other thing "keyboard" could have meant, and nothing asked for it
     to be played here.

     A TOOL, NOT A GAME. It is practice somebody comes back to, with a ladder that remembers where
     they are, which is the timetable's and the notepad's kind of thing rather than a round of
     something. `solid` with the other instruments.

     NO `stop`. Nothing in it runs between keystrokes — see the note over `KT_LESSONS` in games.js —
     so it is drawn with its page. `.kt-box` is a class as well as an id, the timetable's reason. */
```

### ---------- A PLACEHOLDER, AND IT SAYS SO

in `WIDGETS`

```
/* ---------- A PLACEHOLDER, AND IT SAYS SO ------------------------------------------------------
     ASKED FOR AS "a Duolingo substitute" with "don't do too much for now". So this is the widget and
     the slot it will grow into, and nothing more: a card that names what it is going to be and does
     not pretend to be it yet.

     A PLACEHOLDER THAT LOOKS FINISHED IS WORSE THAN AN EMPTY ONE. Give it a streak counter and three
     greyed-out buttons and somebody taps them, nothing happens, and the app reads as broken rather
     than as unbuilt. Saying "not built yet" is the honest version and costs one sentence.

     WHERE IT WILL COME FROM. A drill is a question, an answer and a level — which is `SCHEMA.questions`
     with `answer` and `answer_type` already on it, the same three columns the past papers use. So
     when this is built it is a different way of ASKING what is already in the sheet, not a new tab.
     Written down here because that decision is the whole design and it is easy to forget. */
```

### ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES

in `WIDGETS`

```
/* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES ------------------------------------
     ASKED FOR AS *"i want the cart to be a tool in the tool column."* It has been a column, a sheet,
     a page of Find and a page of Booking, and every one of those had the same trouble: a basket is
     empty most of the time, so it was either a swipe that usually led to nothing or a page that
     appeared and vanished under somebody's thumb. A tool is always there and says what state it is
     in — see the long note over `cartCard_`.

     NO `.card` OF ITS OWN, and that is the one thing different about this entry. `widgetOnColumn_`
     already wraps every widget in `.card.is-widget`, and what `cartCard_` returns is an `.rc` — a
     receipt, which has its own edges, its own colour and is the most obviously bounded thing in the
     app. `bookerCard`'s note settles it one screen along: a `.card` holding an `.rc` is *"a glass
     panel with a paper receipt inside it — two containers for one object"*.

     `solid` IS NOT SET, so the funnel does not offer an empty basket as a search result. The column
     draws it either way — `widgetsOf_` does not read that flag, deliberately.

     AND IT IS THE SHOP'S NOW, NOT THE TOOLS'. `kind: 'shop'` is the whole move: `widgetsOf_('shop')`
     puts it on top of the Shop column, beside the things that fill it, and Tools stops drawing it.
     See `shopCards_` in collections.js for why there and why first. */
```

### BOTH AN ID AND A CLASS.

in `html`

```
/* BOTH AN ID AND A CLASS. The id is what `into` and `startWidget_` look the widget up by; the
          class is what `cartPaint_` writes to, because the Saved column draws this same markup and
          two elements under one id is the `$('msg-text')` fault. */
```

### ---------- LEGO TRADE-IN — A PLACEHOLDER, AND IT SAYS SO

in `WIDGETS`

```
/* ---------- LEGO TRADE-IN — A PLACEHOLDER, AND IT SAYS SO --------------------------------------
     ASKED FOR AS "the lego trade in should be a widget in tools. you dont have to make it just leave
     a placeholder." So it is `contest`'s shape on the Tools column: a heading, one line on what it
     will be, "Not built yet." and nothing to press — `drill`'s argument, that a control with nothing
     behind it reads as broken rather than unbuilt.

     LAST ON THE COLUMN, AND APPENDED RATHER THAN PLACED: `PAGE.tools` remembers a page by its index,
     so anything inserted above `calendar` would move every saved position after it by one.

     NOT `solid`, so the funnel does not offer "not built yet" as an answer to a search. The sets it
     will trade against are already listed — `data/lego-sets.json`, the shop's LEGO rows — and that
     is written here because it is the first thing whoever builds this will need to know. */
```

### ---------- CHECK UPLOADS — FOR AN ADMIN, AFTER A DEPLOY

in `WIDGETS`

```
/* ---------- CHECK UPLOADS — FOR AN ADMIN, AFTER A DEPLOY ---------------------------------------
     ASKED FOR AS *"i cant send images, or videos in the chat to people."* What stood in the way was
     the owner's to fix — a Ledger column and a Drive scope — and this says, from the deployment
     that is serving the site, which of them is still undone. See `uploadsHtml_` in me.js and
     `uploadsCheck_` in content.gs. `admin: true` — the flyer maker's lock — because it names the
     business's Drive folder and the scopes its Google account has granted.
     APPENDED, for `legotrade`'s reason above, and an admin's column is the only one it lengthens.
     NOT `solid`: a diagnostic is not an answer to a search. */
```

### NO BLURB: the line under the tile says what a press does until it is pressed, and then the answer is what the card is for — at 320px a standing paragraph above

in `html`

```
/* NO BLURB: the line under the tile says what a press does until it is pressed, and then the
          answer is what the card is for — at 320px a standing paragraph above it was the difference
          between the steps fitting and the card being drawn at 70%. `mat`'s argument, one tool along.
          BOTH AN ID AND A CLASS, `cart-box`'s reason: the id is what `into` names, the class is what
          `uploadsPaint_` writes to. */
```

### ---------- THE WHITEBOARD

in `WIDGETS`

```
/* ---------- THE WHITEBOARD ----------------------------------------------------------------------
     ASKED FOR AS *"Can you also add a whiteboard widget in tools. Make it bare bones for now."* So it
     is a blank sheet, the padlock that holds the column still while you draw, Undo and Clear -- and
     nothing else, on purpose; the note over `WB_ITEM` in find.js says what would come next and why
     none of it is here yet.

     THE QUESTION PAGES' PEN, NOT A NEW ONE. `initWhiteboard` hands `padWrap_` a pseudo-item and an
     empty surface, so the faults that pen has already been through -- a stroke that slid the column,
     a lock a repaint forgot, a drawing shared between two children on one iPad -- were paid for once.
     NOT ALL OF THEM, it turned out: a board the size of a page found four a question's small picture
     never had (a palm taking over the stroke, a repaint cutting one off Find, a Clear with no way back,
     a full device), fixed in the pen for both -- the note over `WB_ITEM` lists them. Its marks are
     `board:<who>:whiteboard` on the device, never `pad:`, so nothing that reads answers takes a
     scribble for a question somebody answered.

     A TOOL AND `solid`, the notepad's kind of thing: an instrument rather than a card, the calculator's
     note above. NOTHING ON THE TOOLS COLUMN READS IT -- `solid` is read only where a widget is the whole
     page of Find (`.widget-full.solid`), and tools left the funnel on the owner's word (find.js, "THE
     WIDGETS ARE NOT IN THE FUNNEL"), so it is said for what the board is, not for anything it changes
     today. NO `stop` -- nothing runs between strokes. NO `.card` OF ITS OWN, the timetable's
     reason: `widgetOnColumn_` already draws one, and the inner one was height a board on a 320x568
     phone does not have. `.wb-box` IS A CLASS AS WELL AS AN ID, because the Saved column draws this
     markup again and `wbPaint_` writes every copy.

     APPENDED LAST, after `uploads`, for `legotrade`'s reason above: `PAGE.tools` remembers a page by
     its index, and a widget inserted higher up moves everybody's remembered page by one. */
```

### ---------- YOUR LIBRARY CARDS (docs/history/339)

in `WIDGETS`

```
/* ---------- YOUR LIBRARY CARDS (docs/history/339) ---------------------------------------------------
     THE OWNER, 11 Oct: *"move library card widget to the tools column."* They were the `Library cards`
     page of Settings; they are this card now, drawn by `initLibCards_` (me.js) with every behaviour 332
     gave them and saved exactly as they were — `me-save`, `updateProfile`, the fifteen `libN_*` cells.
     `signedIn: true` is the flyer's `admin: true` for a wider audience: everybody signed in saw the page
     (every role's map carries the group), and nobody signed out did.
     APPENDED LAST, after the whiteboard, for `legotrade`'s reason above — and it was not, at first. It went in
     straight after the hours, so a parent found it second; but its gate is SIGNING IN, which comes and goes
     inside a visit, and a widget above ten others that appears when you sign in moves every one of them a
     page: measured in the review of 339, somebody on the calendar who signed in was put on Practice, and
     signing out put them back. Last, signing in or out lengthens only the end of the column, which is the
     rule `uploads` keeps for an admin. Found by its name, as every widget is: the name carries the word
     somebody would type. */
```

### The calculator keys go through the same delegated handler as everything else.

top level, before `k`

```
/* The calculator keys go through the same delegated handler as everything else. The old app kept a
   `window._mcClick` and the carried-over function still sets it — so this hands the press to it
   rather than reimplementing arithmetic that already works. */
```

