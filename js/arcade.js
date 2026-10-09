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
/* ---------- WHO MAY OPEN A WIDGET, ASKED IN ONE PLACE ---------------------------------------------
   ASKED FOR AS *"make a flyer should only be visible to admin"*. On the Tools column it already was
   — `admin: true` and the two filters that used to sit here — but that pair was written out TWICE,
   here and again in `savedWidgets_`, and two more doors asked nothing at all: `widget-open` in
   tiles.js looks a widget up by id in `allWidgets()` and draws it, and `startWidget_` in find.js
   starts whatever it is handed. Neither can reach the flyer today, because tools are out of the
   funnel and no card carries its id; both would open it for anybody the day one does, which is the
   shape of every leak this repository records — a rule on the door somebody thought of and not on
   the one next to it.

   SO IT IS ONE PREDICATE AND EVERY DOOR ASKS IT. Two copies of "who may see this" is the fault
   `MESSAGING` records one file along; four would have been the same thing waiting to happen twice.
   ON THE PHONE, because that is where the flyer maker lives: it never talks to the backend, so
   there is no server rule for this to be a second copy of. */
function widgetFor_(w) {
  if (!w) return false;
  if (w.admin && !(typeof isAdmin === 'function' && isAdmin())) return false;
  if (w.tutor && !(typeof isTutorRole === 'function' && isTutorRole())) return false;
  return true;
}

function widgetsOf_(kind) {
  return allWidgets()
    .filter(w => w.kind === kind)
    .filter(widgetFor_);
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
    .map(w => widgetOnColumn_(w));
}

/* ---------- ONE WIDGET, ONE CARD, AND A STAR ON IT ------------------------------------------------
   ASKED FOR AS "add a favourite column so i can see the widgets i favoutited ... after i fabourite
   it the tile should be filled in."

   THE STAR IS `favTile_`'S STAR, not a second one. Same renderer, same 44px target, same `Save` /
   `Saved` pair that fills when it is on, same `fav` handler and the same `FAVS` set a question or a
   tutor is kept in — so "the tile should be filled in" is a thing that already worked everywhere
   else and had simply never been offered here. A glyph of its own would have been a second control
   meaning one thing, which is the `.reel .over` fault one file along.

   `WIDGET_KEY` IS DECLARED ONCE AND READ THREE TIMES — here, by the Saved column, and by the check.
   `toggleFav`'s own note says the key goes across whole and is never split, so the prefix is only
   ever a namespace: it stops a widget called `chess` colliding with a tutor of that name.

   IT IS DRAWN ON EVERY WIDGET, INCLUDING IN THE SAVED COLUMN ITSELF, because the star is how you
   take one back OUT again — and a saved list you can only add to is the fault this file records
   about a count that could only ever go up. */
const WIDGET_KEY = w => 'w:' + String(w.id);

/* NAMED FOR THE COLUMN, because `find.js` already has a `widgetCard_` and it is a different object:
   that one is the card a widget gets in the FUNNEL — a name and nothing else, because the widget
   itself opens in a sheet. This is the card it gets on a COLUMN, which carries the widget. Two
   things one word apart is the `childrenOf` trap with a shorter fuse, and `check.js` caught it. */
/* ---------- AND UNTIL IT HAS STARTED, IT IS WAITING, AND IT LOOKS IT --------------------------------
   THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple
   loading thing while it's info or whatever is loading."* This is where most of them were: the
   markup goes in when the column is drawn and `start` fills it a beat later — on arrival the page in
   front and its neighbours at once, the rest one per task behind them (`widgetsWake_`). In between,
   each showed its own unfinished self, measured on 9 Oct with the queue held: Connect 4 and Othello a
   grey board, Flabby Pird a black canvas, Scrabble an empty cream board, the maze an empty grid, Word
   Search and Sentence Scramble an empty dropdown, the calendar "‹ Calendar ›" with no month, Videos,
   the cheat-sheet maker and four more a heading on its own. Nineteen looks for one fact.

   SO A WIDGET THAT HAS A `start` IS DRAWN WAITING: its slot `aria-busy`, the one loader over it, the
   markup underneath at its own size and out of sight, so the box the dots sit in is the box the
   widget fills (shell.js, `loading_`). `widgetUp_` takes it off as it starts. One without a `start`
   — the contest, Practice, the LEGO trade-in — never waits for anything and is drawn as it is. */
function widgetOnColumn_(w) {
  const waits = typeof w.start === 'function' && typeof loading_ === 'function';
  return `<div class="card is-widget">
      ${typeof favTile_ === 'function'
        ? `<div class="tile-row wgt-keep">${favTile_({ key: WIDGET_KEY(w), kind: 'widget' })}</div>`
        : ''}
      <div class="widget-slot" id="wgt-${esc(String(w.id))}"${waits ? ' aria-busy="true"' : ''}>${
        w.html}${waits ? loading_() : ''}</div>
    </div>`;
}

/* ---------- THE SAVED COLUMN, WHICH THIS APP HAS HAD BEFORE ---------------------------------------
   `TABS`'S OWN NOTE LISTS IT AMONG THE DEAD: *"Every column this app has had was eventually folded
   into the funnel — Spotlight, Book, Basket, Library, Arcade, Tools, Favourites."* It went because
   it was a second way to reach what the funnel already reached. It is back at the owner's word, and
   what has changed since is the half that makes it not a duplicate: **a widget could not be starred
   at all**, so there was nothing in this column the funnel could have been showing instead.

   AND THE SAVED PAGES LEFT THE FUNNEL IN THE SAME COMMIT. Two homes for one list is the fault this
   repository records under `documents_()`, `factsNow_` and `childrenOf`, and here it had a second
   cost that was reported as a bug in its own right — see `paintStuff`. A star used to insert a page
   in FRONT of the results, so the page you were reading became a different card under your thumb.
   With the saved things on their own column, pressing a star changes nothing about the strip you
   are standing on.

   WIDGETS FIRST, THEN EVERYTHING ELSE. A starred tool is an instrument you came here to open and it
   draws itself; a starred question is a card you came here to find again. Both are things you kept,
   so they are one column — and the order is the one that puts what is usable at the top. */
function savedWidgets_() {
  if (typeof isFav !== 'function') return [];
  /* THROUGH `widgetFor_`. A star outlives the role that made it — `FAVS` is kept on the device
     between payloads — so a flyer starred by an admin must not come back on the Saved column of
     whoever is signed in next. */
  /* `shop` TOO, since the basket moved there: a basket starred while it was a tool is the same
     `w:cart` key, and it would have dropped off Saved the day it changed column. */
  return allWidgets().filter(w => (w.kind === 'tool' || w.kind === 'game' || w.kind === 'shop')
                               && isFav(WIDGET_KEY(w)))
    .filter(widgetFor_);
}

function savedCards_() {
  /* SIGNED OUT THERE IS NO LIST, because `FAVS` is this device's and `savedPages_` has always said
     so. One sentence rather than an empty column — the `nothingHere` rule. */
  if (typeof USER === 'undefined' || !USER) {
    return [`<div class="card"><h3>Saved</h3><p class="note">Sign in and the things you star are
      kept here.</p></div>`];
  }
  const wgts = savedWidgets_().map(widgetOnColumn_);
  const rest = typeof savedPages_ === 'function' ? savedPages_() : [];
  /* ---------- A KEPT CARD IS DRAWN AS FIND DRAWS IT, NOT IN A BOX INSIDE THE PANE'S BOX ------------
     EACH OF THESE WAS WRAPPED IN `.card.is-widget`, which is a WIDGET'S body — its own border, fill
     and radius — inside the page's pane, which already draws exactly that. So a practical on Saved
     sat in a frame inside a frame, 14px narrower each side than the same card on Find, and a page
     of Saved read as a different card system from the column the card was starred on. Widgets
     still get their body (`widgetOnColumn_`); a kept thing is the card and its tile row, as Find
     and the Spotlight column draw it. */
  /* ---------- AND WHAT IS STILL COMING IS NOT "NOTHING KEPT" ----------------------------------------
     THE STARS ARRIVE WITH THE PAYLOAD (`adoptMarks_`) and a starred question needs the library to
     be drawn, so before both have landed this column could not know what you kept — and said
     "Nothing kept yet" anyway, to somebody with a column of things kept. Measured on 9 Oct with the
     payload held. Until both are in, the one loader follows whatever is already drawn (a starred
     widget is on this device and needs neither); the owner's word, 9 Oct, is that every wait looks
     the same: *"They should all have a simplistic simple loading thing."* */
  const coming = (typeof LOADED !== 'undefined' && !LOADED)
    || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED);
  const cards = wgts.concat(rest, coming ? [loading_()] : []);
  if (cards.length) return cards;
  return [`<div class="card"><h3>Saved</h3><p class="note">Nothing kept yet.<br>
    <span class="faint">Press <b>Save</b> on a tool, a game or anything you find and it turns up
    here.</span></p></div>`];
}

/* STARTED AND STOPPED LIKE THE OTHER TWO COLUMNS. A starred timer is a running timer, and a canvas
   loop behind a screen nobody is looking at is the flat battery `toolsStop_` already exists for. */
function savedStart_(arriving) {
  toolsStop_();
  widgetsWake_(savedWidgets_(), 'saved', arriving);
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

function toolsStart_(kind, arriving) {
  toolsStop_();
  widgetsWake_(widgetsOf_(kind), kind === 'tool' ? 'tools' : kind === 'game' ? 'games' : kind, arriving);
}

/* ---------- ALL OF THEM STILL, BUT NOT ALL IN ONE TASK WHEN A COLUMN IS ARRIVED AT ----------------
   REPORTED AS PART OF *"can you make swiping and so on more stable"*, and measured as "the second
   swipe sometimes doesn't take" on Tools and Games. Every widget's `start` forces a layout of the
   whole document — 37–64ms of CPU each at 1x, because the document holds every page of every
   column — and arriving started all of them in ONE task: about 560ms on Games and 800ms on Tools,
   the cheat-sheet maker alone 226ms. A finger that went down in that window was not answered until
   it ended: one measured second swipe 450ms after arriving first moved the card 1,425ms after the
   finger touched.

   SO ON ARRIVAL, THE ONES YOU CAN SEE START NOW — the page in front and one either side — and the
   rest follow ONE PER TASK, nearest the page in front first, asked again at every step so a column
   swiped down meanwhile wakes what is now near. Each step waits out a finger on the grid and a
   settle that is running, as `afterSlide_` does, so a swipe lands between two widgets and never
   behind all of them. The note above still holds: every widget on the column is running a moment
   later, and nothing is stopped for having been scrolled past.

   A REPAINT IS NOT AN ARRIVAL and keeps the old shape — everything, now, in one go. It has just
   replaced every widget's markup, and `check-flow` reads a widget straight after `repaint()`. */
let TOOLS_WAIT = [];      // { w, col } still to start, on the column TOOLS_ON belongs to
let TOOLS_WAKE = 0;       // the booked step

/* ONE WAY A WIDGET STARTS, WHICHEVER OF THE THREE ASKS — this was written out three times, here, in
   `widgetsLater_` and in `widgetsNear_`, and the loader has to come off in all three or a widget
   started by the one that forgot would sit working under the dots. The loader comes off AFTER
   `start`, so what it uncovers is the widget drawn rather than its markup; and in `finally`, because
   a widget that threw has stopped waiting too — a loader over it for ever would be a wait drawn over
   a failure, the one thing `loading_`'s note says it must never be.
   THE SLOT ON THE COLUMN BEING STARTED, NOT `$()`'s. A starred widget is drawn on Tools and on Saved,
   every screen is in the document at once, and `$('wgt-…')` hands back whichever comes first — the
   note over `cartPaint_` records what that cost once. Started from Saved, it is Saved's that stops
   waiting; the copy on Tools waits until Tools is arrived at and starts it. */
function widgetUp_(w, col) {
  TOOLS_ON.push(w);
  try { w.start && w.start(); }
  catch (e) { console.warn('[widget]', w.id, e); }
  finally {
    const host = col && $('s-' + col);
    const slot = host ? [...host.querySelectorAll('.widget-slot')].find(el => el.id === 'wgt-' + w.id)
                      : $('wgt-' + w.id);
    if (typeof loaded_ === 'function') loaded_(slot);
  }
}

function widgetsWake_(list, col, arriving) {
  const start = w => widgetUp_(w, col);
  if (!arriving) { list.forEach(start); return; }
  const far = list.filter(w => widgetDistance_(w, col) > 1);
  list.filter(w => far.indexOf(w) === -1).forEach(start);
  TOOLS_WAIT = far.map(w => ({ w, col }));
  if (TOOLS_WAIT.length) widgetsLater_();
}

/* HOW MANY PAGES FROM THE ONE IN FRONT a widget's slot sits — read off the page that holds
   `#wgt-<id>`, which is what `widgetOnColumn_` writes, so it holds on Saved where the order is
   whatever was starred. A slot it cannot find counts as near: starting one too early is the
   behaviour before this existed. */
function widgetDistance_(w, col) {
  try {
    const slot = $('wgt-' + w.id), host = $('s-' + col);
    const pg = slot && slot.closest('.page');
    if (!pg || !host) return 0;
    const i = [...host.querySelectorAll(':scope > .page')].indexOf(pg);
    return i < 0 ? 0 : Math.abs(i - domIndex_(col, PAGE[col] || 0));
  } catch (e) { return 0; }
}

let TOOLS_BUSY_SINCE = 0;   // when `widgetsLater_` first found a finger down, for its cap
function widgetsLater_() {
  if (TOOLS_WAKE) return;
  TOOLS_WAKE = setTimeout(function step() {
    TOOLS_WAKE = 0;
    if (!TOOLS_WAIT.length) return;
    const now = performance.now();
    /* A FINGER DOWN AT ALL, NOT ONLY ONE WHOSE DIRECTION IS DECIDED: the first 10px of a swipe are
       still a swipe, and a widget's start landing in them is a stall under a thumb that has just
       touched. AND A TAPPED PAGE TURN STILL GLIDING (`SLIDE_UNTIL`), which `SETTLE_ON` — a release's
       own curve — never covered. Both from the review of 5 October. */
    const busy = (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && now < SETTLE_ON.until)
              || (typeof SWIPE !== 'undefined' && SWIPE.live)
              || (typeof SLIDE_UNTIL !== 'undefined' && now < SLIDE_UNTIL);
    /* BUT NOT FOR EVER. A finger resting on the glass — or a `pointerup` the browser never sent — is
       `SWIPE.live` with nothing moving, and a column of widgets that never starts is worse than one
       that starts under a still thumb. A second and a half of waiting, then on regardless. */
    if (busy && !(TOOLS_BUSY_SINCE && now - TOOLS_BUSY_SINCE > 1500)) {
      if (!TOOLS_BUSY_SINCE) TOOLS_BUSY_SINCE = now;
      TOOLS_WAKE = setTimeout(step, 60); return;
    }
    if (!busy) TOOLS_BUSY_SINCE = 0;
    TOOLS_WAIT.sort((a, b) => widgetDistance_(a.w, a.col) - widgetDistance_(b.w, b.col));
    const next = TOOLS_WAIT.shift();
    widgetUp_(next.w, next.col);
    /* A GAP, NOT NOUGHT: `setTimeout(…, 0)` would queue the next start ahead of a touch that is
       already waiting to be delivered on a busy phone. One frame's worth is enough for it to land. */
    if (TOOLS_WAIT.length) TOOLS_WAKE = setTimeout(step, 16);
  }, 0);
}

/* AND A PAGE TURNED TO BEFORE ITS TURN CAME starts its widget NOW, with the ones either side of it —
   called by `goPage` before the column moves, so a tile that jumps eight widgets down the column
   arrives at a working widget rather than at its markup waiting in the queue. A turn to a page that
   is already running costs one walk of a short list. */
function widgetsNear_(col) {
  if (!TOOLS_WAIT.length) return;
  const now = TOOLS_WAIT.filter(q => q.col === col && widgetDistance_(q.w, col) <= 1);
  if (!now.length) return;
  TOOLS_WAIT = TOOLS_WAIT.filter(q => now.indexOf(q) === -1);
  now.forEach(q => widgetUp_(q.w, q.col));
}

function toolsStop_() {
  /* WHAT IS STILL WAITING IS FORGOTTEN WITH WHAT IS RUNNING — a widget queued for a column that has
     been left must not start behind the column you are on now. */
  TOOLS_WAIT = [];
  if (TOOLS_WAKE) { clearTimeout(TOOLS_WAKE); TOOLS_WAKE = 0; }
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
screen('saved', () => pages('saved', savedCards_()));
/* THE SHOP WINDOW. Built like Saved and for the same reason — one card per thing, a pager that
   counts the same array the screen is built from, and a sentence rather than a blank when there is
   nothing in it. It starts and stops nothing, because a spotlit thing is a card rather than a
   widget: nothing on this column runs. */
screen('spotlight', () => pages('spotlight', spotlightCards_()));
/* ---------- PROGRESS: A COLUMN WAITING TO BE BUILT, AND IT SAYS SO ------------------------------
   ASKED FOR AS "i want to add a new column for students to track their progress and everythinh. you
   can leave it at the end of the columns for now. just leave a place holder for now." (9 Oct) Why
   it is a column rather than an answer to a question is in `TABS`'s note in shell.js.

   A PLACEHOLDER THAT LOOKS FINISHED IS WORSE THAN AN EMPTY ONE — `drill`'s rule in map.js, and
   `contest` and `legotrade` follow it. A streak, a bar at nought per cent or a greyed-out tile is a
   thing to tap that does nothing, and the app reads as broken rather than as unbuilt. So it is
   `drill`'s markup and nothing more: a heading, one line on what it will be, "Not built yet." No
   tile, no `data-do`, nothing `check/press.js` could find that does nothing — and no number.
   `placeholderFaults_` in check-flow.js asks both halves of that of every placeholder.

   THE SAME CARD FOR EVERYBODY, signed out included. Who sees whose progress — a student their own,
   a parent their children's, a tutor their students', an admin anybody's — is the first decision
   of building it, and deciding it now would be deciding it for a card with nothing on it to show.

   WHAT IT WILL DRAW FROM, written here because it is the first thing whoever builds it needs: what
   the app already keeps about each person's work. Every answer — typed, picked, drawn or ringed —
   is on the person's account (the `answers` tab; `js/answers.js` is the phone's half), and which
   questions each person has done, and when, is the `attempts` tab (`SCHEMA.attempts`). "What you
   got right" and "what to work on next" are questions about those rows, not a new tab. ONLY TABS
   THAT EXIST ARE NAMED HERE: a record of how each answer was marked was being built elsewhere the
   day this was written, and naming it before it landed would send whoever builds this looking for
   something that might arrive under another name or not at all. Look in `TAB` in
   backend/constants.gs for what has joined or replaced these two since.

   NOTHING STARTS OR STOPS, Spotlight's reason above: nothing on this column runs. */
function progressCards_() {
  return [`<div class="card">
    <h3>Progress</h3>
    <p class="sub">Coming soon: everything you have done in one place — the questions you have
      answered, what you got right, and what to work on next.</p>
    <p class="empty">Not built yet.</p>
  </div>`];
}
screen('progress', () => pages('progress', progressCards_()));
screen('tools', () => pages('tools', widgetColumn_('tool')));
screen('games', () => pages('games', widgetColumn_('game')));
