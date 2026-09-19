/* ==================================================================================================
   @family. — arcade.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   arcade.js is number 12 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- ARCADE ------------------------------------------------------------------------------
   Four things to do rather than four things to use.

   As with Tools, the ids are the ones the carried-over functions look for — `flappy-canvas`,
   `tt-question`, `timer-display`. Twelve of them were wrong at once here, and every single one
   would have failed in silence.
--------------------------------------------------------------------------------------------- */
/* TWELVE function keys, not ten. Ten into a four-column grid is two and a half rows, so `7` and
   `8` finished the row `π` and `⌫` started and the number pad never lined up — a keypad whose 5
   is not under the 8 is one you have to read rather than reach for.
   The four arrows fill it and do the two jobs the calculator was missing: left and right move the
   caret, up and down walk back through what you have already worked out. */
const CALC_KEYS = [
  ['sin(', 'sin', 'fn'], ['cos(', 'cos', 'fn'], ['tan(', 'tan', 'fn'], ['sqrt(', '√', 'fn'],
  ['^2', 'x²', 'fn'],    ['^', 'xʸ', 'fn'],     ['(', '(', 'fn'],      [')', ')', 'fn'],
  ['pi', 'π', 'fn'],     ['left', '◀', 'nav'],  ['right', '▶', 'nav'], ['del', '⌫', 'del'],
  /* ---------- THE KEY PUTS IN WHAT THE KEY SAYS -------------------------------------------------
     THE BUTTONS ALREADY READ ÷ × − AND THE DISPLAY SHOWED / * -. So the one place a student looks
     to check what they typed was written in a different alphabet from the keypad they typed it on,
     and `*` in particular is a programmer's multiply — no exam paper, textbook or Casio has ever
     printed one.

     THE GLYPH IS NOW THE VALUE, and `calcNormalise_` in games.js turns it back into arithmetic at
     the moment of `=`. That is the right way round: the display is what a person reads, and the
     translation belongs next to the evaluator that needs it, once, rather than in the label of
     every key that does not. */
  ['7', '7', ''], ['8', '8', ''], ['9', '9', ''], ['\u00f7', '\u00f7', 'op'],
  ['4', '4', ''], ['5', '5', ''], ['6', '6', ''], ['\u00d7', '\u00d7', 'op'],
  ['1', '1', ''], ['2', '2', ''], ['3', '3', ''], ['\u2212', '\u2212', 'op'],
  ['0', '0', ''], ['.', '.', ''], ['C', 'C', 'op'], ['+', '+', 'op'],
  ['up', '▲', 'nav'], ['down', '▼', 'nav'], ['=', '=', 'eq'],
];

/* ================================================================================================
   THE WIDGETS — nine things you USE rather than things you find.

   They had two tabs between them, Tools and Arcade, and both are gone. Not because the widgets
   changed: a calculator is a calculator. Because a tab is an expensive thing — eight of them and
   the labels are dropped on a small phone — and these are nine items in a list of six hundred that
   the funnel can already narrow in one tap.

   ONE TABLE, and it does four jobs that were spread across four places: what the card says, what
   the markup is, what starts it, and where to look to see whether it started. The last one is what
   was missing when a blank card looked like a widget nobody had finished building.

   THEY OPEN IN THE SHEET rather than on a page of their own. The sheet is already the thing that
   takes the whole screen for anything needing full attention, and a calculator needs exactly that
   — full width, nothing behind it, and a way out that is the same gesture as everywhere else.
================================================================================================ */
/* ================================================================================================
   THE OVERWORLD.

   Your venues as a map you move across, and the point of it is the thing a real map cannot do:
   nodes you have not reached yet are shut. Ticking topics moves you along it.

   DRAWN, NOT PHOTOGRAPHED, and that is a decision rather than a shortcut. Map tiles would need a
   key that is public in this site, come with terms about how they may be redrawn, weigh more than
   the whole app, and — the part that actually decides it — aerial London is grey roofs. An
   overworld is nodes, paths and a few landmarks with everything else deleted, which is why it
   reads at a glance.

   REAL POSITIONS WHERE THERE ARE ANY. A venue with coordinates sits where it really is, so Morden
   is south of Colliers Wood on the map because it is south of it in London. Without them the
   venues are laid on a winding path in the order they come, which is a worse map and a perfectly
   good game — so this works today and gets truer the moment the postcodes are filled in.
================================================================================================ */

/* Somewhere you can stand. `Online` and a client's own house are not places — they have no
   coordinates and never will, and putting them on a map would be inventing a location for the
   two entries whose whole meaning is not having one. */
const mapPlaces = () => (DATA.venues || []).filter(v => {
  if (!v.title) return false;
  /* BY NAME, NOT BY RATE. This used `isHome`, which answers a PRICING question — does this place
     charge room hire — and returns true for anything free. So a community centre that costs
     nothing was read as somebody's front room and vanished from the map, which is the entire
     Colliers Wood Community Centre and any other free venue.
     What is being asked here is different: is this a PLACE. Online is not, and a client's own
     house is not one we can point at. Both are recognisable by name, which is the only thing that
     actually distinguishes them. */
  return !/^online$/i.test(String(v.title).trim())
      && !/\b(home|house|client\s*(house|home|place)|your venue)\b/i.test(v.title);
});

/* ==================================================================================================
   TOOLS AND GAMES, AS COLUMNS

   THEY WERE ALREADY REACHABLE — `What for · Tools` and `What for · Games` are answers in the funnel
   and always have been. A column is not a second copy of that: it is the door for somebody who has
   not come with a question. Wanting the calculator is not an errand you narrow down to.

   `WIDGETS` IS THE SINGLE SOURCE, filtered by kind. Adding a tool is adding a row there and it
   appears in both places at once, which is the only arrangement that cannot drift.
================================================================================================== */

/* ---------- WHAT THIS PERSON MAY OPEN -------------------------------------------------------------
   `admin` HIDES A WIDGET FROM EVERYONE ELSE — the flyer maker is the only one, and it speaks for
   the business.

   `solid` DOES NOT APPLY HERE. It decides whether a widget is offered when it has no data behind
   it, and that question belongs to the funnel, which is choosing what to show among everything.
   A column is the place you go to see all of them; hiding half of it because the calendar is empty
   this week is the column failing to be a place. */
/* ---------- ONE LIST, ASKED BY BOTH THE RENDER AND THE COUNT --------------------------------------
   `widgetColumn_` AND `toolsStart_` EACH WROTE THIS FILTER OUT, and `PAGER` now needs it a third
   time. Three copies of "which widgets are on this screen" is three things to get right when a
   widget gains an `admin` flag — and a pager that disagrees with its own screen is a widget that
   exists and cannot be swiped to, which is the failure the note on `PAGER` describes. */
/* `admin` AND `tutor` ARE TWO FLAGS BECAUSE THEY ARE TWO AUDIENCES. The flyer maker is the
   business's own stationery and belongs to whoever runs it; a tutor's teaching hours belong to the
   tutor, and an admin needs them too — `isTutorRole()` already answers "tutor or admin", which is
   the shape every other staff test in this app uses. A single `staff` flag would have put the
   flyer in front of every tutor to save declaring one word. */
function widgetsOf_(kind) {
  return allWidgets()
    .filter(w => w.kind === kind)
    .filter(w => !w.admin || isAdmin())
    .filter(w => !w.tutor || (typeof isTutorRole === 'function' && isTutorRole()));
}

function widgetColumn_(kind) {
  return widgetsOf_(kind)
    /* ---------- THE WIDGET IS THE CARD. THERE IS NOTHING TO PRESS -------------------------------
       IT USED TO BE A HEADING AND AN `Open` BUTTON, and the button was the whole complaint: a
       column of tools where every tool is a name and a control that reveals it is a column of
       nine things to click before anything is usable. A calculator you have to open is a menu
       entry, not a calculator.

       THAT BUTTON MADE SENSE IN THE FUNNEL and only there. Searching "timer" alongside three
       resources gives a mixed list, and a running clock in the middle of a list of worksheets is
       a thing nobody asked for — so there it stays a card that opens. HERE the whole screen is
       tools, every one of them was asked for by coming to this column, and drawing them is the
       answer rather than the offer.

       SO THE MARKUP CARRIES THE WIDGET ITSELF, in the slot the card has always had, and
       `toolsStart_` brings them to life once they are in the document. No tiles, no Open, no
       press. */
    /* ---------- AND THE NAME IS PRINTED ONCE ------------------------------------------------------
       THIS PUT AN `<h3>` ABOVE THE WIDGET AND EVERY WIDGET'S OWN MARKUP ALREADY HAS ONE. Measured
       on the tools column: "Calculator || Calculator", "Timer || Timer", and the cheat sheet worse
       than either — "Cheat sheet maker (maths mat) || Cheat sheet maker || Cheat sheet — SATs",
       three headings under two different names, because the roster's `name` and the card's own
       heading had drifted apart with nothing comparing them.

       THE WIDGET'S OWN HEADING IS THE ONE THAT STAYS. It is the one that has been on screen, it is
       the one the widget was designed around, and it is inside the markup it belongs to — where the
       roster's `name` has three other jobs (the search, the tile, the pager) and is a label rather
       than a title. Two sources for one heading is the fault this repo records under `kinds`, under
       `link`/`source_url` and under `childrenOf`; the difference here is that both were being drawn
       at once, so it was visible rather than silent.

       `widget-slot` STAYS, and so does its id. `tiles.js` looks up `wgt-<id>` to drop a widget into
       a card in the funnel, and `startWidget_` finds its parts inside it. */
    .map(w => `<div class="card is-widget">
      <div class="widget-slot" id="wgt-${esc(String(w.id))}">${w.html}</div>
    </div>`);
}

/* ---------- AND THEN THEY ARE STARTED ---------------------------------------------------------
   MARKUP FIRST, `start` SECOND, ALWAYS. Every one of these finds its parts by id, and an id cannot
   be found before the markup carrying it is in the document — which is the entire content of the
   note that used to sit above `on('widget')`.

   ALL OF THEM, NOT ONE. `startWidget_` keeps a single widget alive because in the funnel only one
   is open at a time; a column has nine on screen at once, and a calculator that stops working
   because somebody scrolled past a timer is worse than the battery it saves.

   `stop` IS STILL CALLED WHEN THE COLUMN LEAVES — see `toolsStop_`. A canvas loop running behind a
   screen nobody is looking at is a flat battery for nothing, and that argument has not changed. */
let TOOLS_ON = [];

function toolsStart_(kind) {
  toolsStop_();
  TOOLS_ON = widgetsOf_(kind);
  TOOLS_ON.forEach(w => {
    try { w.start && w.start(); }
    catch (e) { console.warn('[widget]', w.id, e); }
  });
}

function toolsStop_() {
  TOOLS_ON.forEach(w => { try { w.stop && w.stop(); } catch (e) {} });
  TOOLS_ON = [];
}


/* ---------- A WIDGET IS A SCREEN, NOT AN ITEM IN A LIST -------------------------------------------
   THESE USED `stack`, AND ABOUT SIXTY PER CENT OF BOTH SCREENS WAS UNREACHABLE.

   `stack` puts every card in ONE page and ONE pane, and stands the vertical axis down on the
   grounds that there is nothing to page to — its note says "the drag falls through to ordinary
   scrolling". It does not. `.pane` is `overflow-y: hidden`, so with one page there is no paging AND
   no scrolling. Measured at 390x844: games had 2058px of content in an 805px pane, tools had
   3122px. You could see the first three and there was no gesture that reached the rest.

   `pages` GIVES EACH ONE ITS OWN PAGE AND ITS OWN PANE, which is what the funnel already does the
   moment you narrow to Tools — `showingWidgets` in find.js draws one widget to a screen and has
   since it was written. Two routes to the same nine tools disagreed about what a tool was: a
   full screen down one and a sixth of a column down the other.

   AND IT SUITS THEM. A chess board and a Flabby Pird canvas want the screen, not a sixth of it.
   The note on `stack` is right that eight small panes read as a stack of pop-ups — that is an
   argument about eight SMALL things, and these are not small.

   `PAGER.tools` AND `PAGER.games` ARE NOT OPTIONAL. Without them `paint` never adds the `paged`
   class and the pages sit there unreachable, which is precisely what had happened to the feed and
   to You. Pages without a pager is the same bug wearing a different hat. */
screen('tools', () => pages('tools', widgetColumn_('tool')));
screen('games', () => pages('games', widgetColumn_('game')));
