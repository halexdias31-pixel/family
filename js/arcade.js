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
/* AND `signedIn`, A THIRD AUDIENCE: everybody with an account and nobody without one — the library cards
   (docs/history/339), which hold your own cards and their PINs and were a Settings page, which a visitor
   signed out never had. On the phone for the flyer's reason; the server asks the token on every save. */
function widgetFor_(w) {
  if (!w) return false;
  if (w.admin && !(typeof isAdmin === 'function' && isAdmin())) return false;
  if (w.tutor && !(typeof isTutorRole === 'function' && isTutorRole())) return false;
  if (w.signedIn && !(typeof USER !== 'undefined' && USER)) return false;
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
  const coming = (typeof awaiting_ === 'function' && awaiting_())
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
   screen nobody is looking at is a flat battery for nothing, and that argument has not changed.
   "LEAVES" MEANS LEAVES THE GLASS NOW, not "stops being the column in front" — see `widgetsGlass_`
   below, and docs/history/331. */
/* ONE ENTRY PER WIDGET, NOT ONE PER COPY: `{ w, col, slot, who }` — the widget, the column it was
   started on, the slot it was started in and whom it was started for. A starred widget is drawn on its
   own column and on Saved, and it is one widget with one set of state behind it (a timer's clock, a
   board's game), so it is started once and drives one copy; `slot` is how anything here tells which,
   and how a paint that threw the markup away is noticed (`isConnected`). `who` is `widgetWho_()`. */
let TOOLS_ON = [];

/* WHOM A WIDGET WAS STARTED FOR — the person signed in, or nobody. A widget's state can be a person's
   (the notepad's words, the whiteboard's strokes), and the next person to pick up the shared iPad is not
   them: what was started for somebody else is neither carried through a paint nor kept running beside
   the column in front (`widgetsHeld_`, `widgetsGlass_`). */
function widgetWho_() {
  try { return typeof USER !== 'undefined' && USER ? String(USER.personId || USER.name || '') : ''; }
  catch (e) { return ''; }
}

/* ---------- A PAINT DOES NOT THROW AWAY THE SLOT A WIDGET IS RUNNING IN ----------------------------------
   FOUND BY THE REVIEW OF 331, on the owner's own path: open the app on Settings at ~1194, and the
   calculator on Tools beside it is drawn and running. About two seconds in the inbox lands and `repaint`
   marks every column but Settings `STALE` — Tools keeps its markup, because a column is redrawn when it
   is arrived at and not before. So the first arrival at Tools redrew it under the running calculator:
   the slot it ran in was thrown away, the new one was drawn under the loader, and 240–690ms later the
   calculator was started again in it, from nothing. Drawn, three dots, drawn — on the column the owner
   had complained about — and a sum typed into it beside Settings came back as 0. A press on its "7"
   beside Settings (which is a press that takes you there) lost the 7 the same way.
   SO `paint` HANDS BACK EVERY SLOT A WIDGET IS RUNNING IN ON THE COLUMN IT IS DRAWING: `widgetsHeld_`
   before the new markup goes in, and `widgetsBack_` after, which puts each running slot where the new
   markup drew that widget's — the card, its star and every other widget are the new markup, and the
   widget is the one that was running, as it was. The arrival then finds it running in a slot still in
   the document and leaves it (`widgetsWake_`). A widget the new markup no longer draws (signed out of
   the role that showed it) has nowhere to go, and is stopped like any widget whose slot has gone.
   NOT ACROSS A CHANGE OF PERSON (`who`), because then what the slot holds is the last person's. And NOT
   FOR A REPAINT OF THE COLUMN IN FRONT, which draws it from nothing and starts its widgets again at once
   (`paint(AT, true)`, `startScreen_`): a repaint is the facts changing under the column you are on, and
   that has always been a restart. */
/* ---------- AND A DRAWING MADE FROM OLD FACTS, OR FOR SOMEBODY ELSE, GOES BACK UNDER ITS LOADER --------------
   A WIDGET THAT HAS DRAWN AND IS NOT RUNNING keeps its drawing — a calendar's month, a notepad's words, a
   board's scores — and when a landing finds its column's markup unchanged nothing is written (`paint`'s
   identical-markup skip, shell.js), so that drawing would stay, made from the facts before the landing. So
   every such slot that READS FACTS is put back under the one loader (its markup, as `widgetOnColumn_` draws
   it), to be drawn again from the new facts in the next quiet moment (`ahead_`) or on arrival. A widget
   declared `pure` in `WIDGETS` draws nothing from the facts — a calculator, a timer, a board game — and
   cannot go stale, so it keeps its drawing; `check-widgets.js` proves the declaration (the slot's markup
   the same under two payloads and two people), so it cannot drift. `who`: A CHANGE OF PERSON — then every
   drawn slot whose drawing was somebody else's goes, pure or not (the shared iPad: the last child's notepad
   must not sit drawn on a column a sign-out marked stale). A slot a widget is running in is left to 331's
   rules, which stop and start it. docs/history/341.
   AND A DRAWING MADE FROM THE PERSON'S OWN DEVICE COPY, NOT FROM THE FACTS (`slot.OWN`, which only the
   whiteboard's `wbPaint_` stamps), is kept when only the facts change: `signedOut_` and `signedIn_` draw
   the board for the person arriving and then repaint, and the repaint's own mark put that board straight
   back under its loader — found by the whiteboard journey on the final run. A change of person still
   takes it (`who`), unless it was drawn for whoever is here now. */
/* ---------- AT A CHANGE OF PERSON, EVERY SLOT ON THE COLUMN — NOT THE NEW PERSON'S LIST --------------------------
   `widgetsOn_(col)` is the list for whoever is signed in NOW, and a change of person is exactly when it differs
   from what the column holds: signed out, Saved's stars are gone and an admin's flyer maker, availability and
   uploads are not anybody's tools. Walked by that list, all fourteen of an admin's drawn slots — Tools' three
   admin tools and the whiteboard, ten starred on Saved — kept the admin's drawing after a sign-out until the
   builder drew those columns again, 8–15s at 4x (review, 12 Oct), where a drag towards the column could show
   them. So `who` walks every slot the column holds and finds each one's widget by its id. */
function widgetsReveilAll_(col) {
  const host = document.getElementById('s-' + col);
  if (!host) return [];
  const all = typeof allWidgets === 'function' ? allWidgets() : [];
  return [...host.querySelectorAll('.widget-slot[id^="wgt-"]')].map(slot => {
    const id = slot.id.slice(4);
    const w = all.find(x => String(x.id) === id);
    return w ? { w, slot } : null;
  }).filter(Boolean);
}
function widgetsReveil_(col, who) {
  if (WIDGET_COLS.indexOf(col) === -1 || typeof loading_ !== 'function') return;
  const me = widgetWho_();
  (who ? widgetsReveilAll_(col) : widgetsOn_(col).map(w => ({ w, slot: slotOn_(col, String(w.id)) }))).forEach(({ w, slot }) => {
    if (typeof w.start !== 'function' && typeof w.draw !== 'function') return;
    if (!slot || slot.getAttribute('aria-busy')) return;
    if (TOOLS_ON.some(e => e.slot === slot)) return;
    if (who ? slot.WHO === me : (w.pure || (slot.OWN !== undefined && slot.OWN === me))) return;
    slot.innerHTML = w.html + loading_();
    slot.setAttribute('aria-busy', 'true');
    delete slot.AHEAD;
    delete slot.WHO;
    delete slot.LENT;
    delete slot.OWN;
  });
}

/* `pre`: THE COLUMN STILL HOLDS THE BOOT'S MARKUP (`PRE_PAYLOAD`, shell.js) — then only a slot started after the
   payload landed is carried; one started before it drew without the payload and is started again (331). */
function widgetsHeld_(col, pre) {
  const who = widgetWho_();
  const run = TOOLS_ON.filter(e => e.col === col && e.slot && e.slot.isConnected && e.who === who && (!pre || e.slot.UP_PAID));
  /* AND EVERY SLOT DRAWN AHEAD FOR THIS PERSON BY A WIDGET THAT READS NO FACTS (`pure`) — its drawing cannot
     be stale, so it crosses the paint as it is, and keeps the clocks it was drawn under: on arrival it is
     started again behind its own drawing rather than adopted, because the paint has moved them (341). A
     drawing that reads facts is not carried; the new markup puts it back under its loader, and the builder
     draws it again from the new facts. */
  const pure = [];
  widgetsOn_(col).forEach(w => {
    if (!w.pure) return;
    const sl = slotOn_(col, String(w.id));
    if (sl && sl.AHEAD && sl.AHEAD.who === who && !run.some(e => e.slot === sl)) pure.push({ w, col, slot: sl, who });
  });
  return run.concat(pure);
}
function widgetsBack_(col, held) {
  held.forEach(e => {
    const fresh = slotOn_(col, String(e.w.id));
    if (fresh && fresh !== e.slot) fresh.replaceWith(e.slot);
  });
}

function toolsStart_(kind, arriving) {
  widgetsWake_(widgetsOf_(kind), kind === 'tool' ? 'tools' : kind === 'game' ? 'games' : kind, arriving);
}

/* WHICH WIDGETS A COLUMN HOLDS, by its id — the lists `toolsStart_` and `savedStart_` start from,
   asked by `widgetsGlass_` of a column beside the one in front. Every column that draws widgets with
   `widgetOnColumn_`, and no other: Find's widget card is `startWidget_`'s, one at a time, and is not
   this file's to start. */
const WIDGET_COLS = ['shop', 'tools', 'games', 'saved'];
function widgetsOn_(col) {
  if (col === 'saved') return savedWidgets_();
  if (col === 'tools') return widgetsOf_('tool');
  if (col === 'games') return widgetsOf_('game');
  if (col === 'shop') return widgetsOf_('shop');
  return [];
}

/* THE SLOT ON THAT COLUMN, NOT `$()`'s — the note on `widgetUp_` says why. BY ITS ID, SCOPED TO THE
   COLUMN, because a browser answers `#id` from its own map of ids even inside an element and even when
   the id is on the page twice. The first version walked every `.widget-slot` under the column — the
   whole Games column, the Scrabble board's 225 squares and the chess board's 64 — for each widget, twice
   per comparison of the queue's sort, in the steps that run between a swipe and the next. Measured with
   check/press.js's chained flick on Games at 390, repeated: 14 of 48 second flicks dropped against 8 of
   48 on the base commit at the same load; with this, 12 of 48 against 12. That probe is noisy at a load
   average of thirty and the walk may not have been the whole of it, but it was work done for nothing.
   The walk is kept for a browser with no `CSS.escape` (jsdom), where it is the only way. */
function slotOn_(col, id) {
  const host = col && document.getElementById('s-' + col);
  if (!host) return null;
  const want = 'wgt-' + id;
  try { return host.querySelector('#' + CSS.escape(want)); }
  catch (e) { return [...host.querySelectorAll('.widget-slot')].find(el => el.id === want) || null; }
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
/* `{ w, col }` still to start — on the column in front, or on a column beside it whose card is on the
   glass (`widgetsGlass_`). */
let TOOLS_WAIT = [];
let TOOLS_WAKE = 0;       // the booked step

/* ONE WAY A WIDGET STARTS, WHICHEVER OF THE THREE ASKS — this was written out three times, here, in
   `widgetsLater_` and in `widgetsNear_`, and the loader has to come off in all three or a widget
   started by the one that forgot would sit working under the dots. The loader comes off AFTER
   `start`, so what it uncovers is the widget drawn rather than its markup; and in `finally`, because
   a widget that threw has stopped waiting too — a loader over it for ever would be a wait drawn over
   a failure, the one thing `loading_`'s note says it must never be.
   THE SLOT ON THE COLUMN BEING STARTED, NOT `$()`'s. A starred widget is drawn on Tools and on Saved,
   every screen is in the document at once, and `$('wgt-…')` hands back whichever comes first — the
   note over `cartPaint_` records what that cost once. Started from Saved, it is Saved's copy that it
   draws into: `WIDGET_HOME` (data.js) tells `$` which copy is this widget's while the screen in front
   has none of its own, which is the case a widget started BESIDE the column in front is in.
   AND EVERY OTHER COPY ON THE GLASS STOPS WAITING TOO. It was "the copy on Tools waits until Tools is
   arrived at and starts it" — true while only the column in front ran anything, and on a wide window
   it left a copy on the glass under the loader for a widget that had started: the owner's picture of
   10 Oct. One widget drives one copy (see `TOOLS_ON`); a second copy on the glass shows its own
   markup, drawn, until its column comes in front and the widget is started there instead. The loader
   is for a widget that has not started, and this one has. A copy OFF the glass keeps its veil — on a
   phone that is every copy but the one in front, and a swipe towards Saved shows the loader it always
   showed — and `widgetsGlass_` takes it off if the copy comes onto the glass while the widget runs. */
/* ---------- AND ONE DRAWN AHEAD WITH NOTHING CHANGED SINCE IS ADOPTED, NOT STARTED ----------------------
   THE BUILDER DRAWS A WIDGET WITH NO `stop` BY ITS OWN `start` before anybody arrives (`aheadDrawWidget_`,
   below), and keeps it out of `TOOLS_ON`: it is drawn, not running, and nothing it did runs on. When it is
   then asked to start — on arrival, from the queue, beside the column in front — and NOTHING HAS MOVED since
   it was drawn (the same person; no action dispatched, `ACT_EPOCH`; no repaint or landing, `DRAW_EPOCH`; and
   no copy of the same widget started meanwhile, `WIDGET_UPS`), starting it again would draw exactly what is
   on the glass, so it is entered as running and its `start` is not called. Measured on 11 Oct (341): a start
   is one task of up to 291ms at 4x (chess), and after the slide it was the next flick's stall. Any of those
   clocks having moved, it is started as before — a press is always a restart (Connect 4's "rebuilt every time
   it opens"). A widget with a `stop` is never adopted: its `draw` runs none of what its `start` does. */
const WIDGET_UPS = {};
function widgetAdoptable_(w, slot) {
  const a = slot && slot.AHEAD;
  return !!(a && !w.stop && slot.isConnected && a.who === widgetWho_() && a.act === ACT_EPOCH
    && a.draw === DRAW_EPOCH && a.ups === (WIDGET_UPS[String(w.id)] || 0));
}
function widgetUp_(w, col) {
  const id = String(w.id);
  const slot = col ? slotOn_(col, id) : $('wgt-' + id);
  const adopt = widgetAdoptable_(w, slot);
  TOOLS_ON.push({ w, col, slot, who: widgetWho_() });
  if (slot && col) WIDGET_HOME[slot.id] = col;
  /* WHOM ITS DRAWING IS FOR, kept on the slot after the widget stops — see `widgetsReveil_`. And ANY other
     copy drawn ahead is no longer what this widget's state would draw (`WIDGET_UPS`). */
  /* AND NOT LENT ANY MORE (`LENT`, below): this copy is the one running now. */
  if (slot) { slot.WHO = widgetWho_(); delete slot.AHEAD; delete slot.LENT; slot.UP_PAID = typeof FIRST_PAINT_DONE !== 'undefined' && !!FIRST_PAINT_DONE; }
  WIDGET_UPS[id] = (WIDGET_UPS[id] || 0) + 1;
  try { if (!adopt && w.start) w.start(); }
  catch (e) { console.warn('[widget]', w.id, e); }
  finally {
    if (typeof loaded_ === 'function') {
      loaded_(slot);
      widgetCopies_(id).forEach(el => { if (el !== slot && widgetLit_(el)) { loaded_(el); el.LENT = true; } });
    }
  }
}

/* EVERY SLOT OF ONE WIDGET IN THE DOCUMENT — its own column's and Saved's — and whether the last
   placement left a slot's card on the glass (`GLASS.pages`, shell.js). */
function widgetCopies_(id) {
  return WIDGET_COLS.map(c => slotOn_(c, id)).filter(Boolean);
}
function widgetLit_(el) {
  try { return typeof GLASS !== 'undefined' && GLASS.pages.indexOf(el.closest('.page')) !== -1; } catch (e) { return false; }
}

/* AND STOPPED, the one way — its own `stop`, and `$` told the copy is nobody's now. */
function widgetDown_(e) {
  try { e.w.stop && e.w.stop(); } catch (err) {}
  if (e.slot && WIDGET_HOME[e.slot.id] === e.col) delete WIDGET_HOME[e.slot.id];
}

/* ---------- THE COLUMN IN FRONT: WHAT IT HOLDS IS STARTED, AND WHAT IS ALREADY RUNNING IS LEFT ------
   ON AN ARRIVAL, A WIDGET ALREADY RUNNING ON THIS COLUMN'S OWN COPY IS LEFT AS IT IS. That only happens
   now that a column beside the one in front runs its widgets on a wide window: Tools beside Settings
   has its calculator going, and arriving at Tools used to stop it and start it again 300ms later —
   which is what dealt a Connect 4 game in progress a fresh board, the fault the note over
   `startScreen_`'s booking in `go` was written about. A widget running on ANOTHER column's copy (a
   starred one, running on Saved beside) is stopped and started here, because the copy in front is the
   one a press can reach. A widget whose slot was replaced (`STALE`, painted on the way in) is started
   again, because what it was running in has gone.
   A REPAINT RESTARTS THE COLUMN'S OWN, ALL OF THEM, NOW — its markup has just been replaced. Widgets
   running on the columns beside it are not touched: their markup was not. */
function widgetsWake_(list, col, arriving) {
  const ids = new Set(list.map(w => String(w.id)));
  const keep = e => !ids.has(String(e.w.id)) || (arriving && e.col === col && e.slot && e.slot.isConnected);
  toolsStop_(keep, q => !ids.has(String(q.w.id)));
  const up = list.filter(w => !TOOLS_ON.some(e => String(e.w.id) === String(w.id)));
  if (!arriving) { up.forEach(w => widgetUp_(w, col)); return; }
  /* ARRIVING: WHAT WAS DRAWN AHEAD WITH NOTHING CHANGED IS ADOPTED NOW, every one of them — it costs nothing
     (`widgetUp_`). A slot still under its loader near the page in front is started now, as it always was:
     that is the floor, for an arrival that beat the builder. A drawn slot that cannot be adopted is NOT
     started here; it is queued, and the queue starts it one per task behind the slide — its drawing is on
     the glass meanwhile, so a 291ms start (chess) is never a stall the next flick waits behind (341). */
  const veiled = w => { const sl = slotOn_(col, String(w.id)); return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT; };
  const adopt = up.filter(w => widgetAdoptable_(w, slotOn_(col, String(w.id))));
  adopt.forEach(w => widgetUp_(w, col));
  const rest = up.filter(w => adopt.indexOf(w) === -1);
  const now = rest.filter(w => veiled(w) && widgetDistance_(w, col) <= 1);
  now.forEach(w => widgetUp_(w, col));
  rest.filter(w => now.indexOf(w) === -1).forEach(w => TOOLS_WAIT.push({ w, col }));
  if (TOOLS_WAIT.length) widgetsLater_();
}

/* HOW MANY PAGES FROM ITS COLUMN'S OWN PAGE IN FRONT a widget's slot sits — read off the page that
   holds `#wgt-<id>` ON THAT COLUMN, which is what `widgetOnColumn_` writes, so it holds on Saved
   where the order is whatever was starred. It was `$('wgt-…')`, which for a starred widget is the
   first copy in the document — Tools' — measured against Saved's pages. A slot it cannot find counts
   as near: starting one too early is the behaviour before this existed. */
function widgetDistance_(w, col) {
  try {
    const slot = slotOn_(col, String(w.id)), host = $('s-' + col);
    const pg = slot && slot.closest('.page');
    if (!pg || !host) return 0;
    const i = [...host.querySelectorAll(':scope > .page')].indexOf(pg);
    return i < 0 ? 0 : Math.abs(i - domIndex_(col, PAGE[col] || 0));
  } catch (e) { return 0; }
}

/* ON THE GLASS FIRST, THEN NEAREST ITS COLUMN'S PAGE IN FRONT — what is being looked at before what a
   swipe would bring. `GLASS.pages` is placeGrid's answer to which cards are on the glass. */
function widgetRank_(q) {
  let lit = false;
  try {
    const slot = slotOn_(q.col, String(q.w.id));
    lit = !!(slot && typeof GLASS !== 'undefined' && GLASS.pages.indexOf(slot.closest('.page')) !== -1);
  } catch (e) {}
  return (lit ? 0 : 1000) + widgetDistance_(q.w, q.col);
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
    /* AND A COLUMN CHANGE NOT YET PLACED (`GLASS.at`). `go` moves `AT` at once and the grid a frame
       later, and it is that placement which says what is on the glass and stops and forgets what has
       left it (`widgetsGlass_`). This used to be `toolsStop_()` inside `go`, synchronous; asked from
       the placement instead, a step in between would start a widget for a column already left, in the
       very frame its slide begins. */
    const busy = (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && now < SETTLE_ON.until)
              || (typeof SWIPE !== 'undefined' && SWIPE.live)
              || (typeof SLIDE_UNTIL !== 'undefined' && now < SLIDE_UNTIL)
              || (typeof GLASS !== 'undefined' && GLASS.at !== AT);
    /* BUT NOT FOR EVER. A finger resting on the glass — or a `pointerup` the browser never sent — is
       `SWIPE.live` with nothing moving, and a column of widgets that never starts is worse than one
       that starts under a still thumb. A second and a half of waiting, then on regardless. */
    if (busy && !(TOOLS_BUSY_SINCE && now - TOOLS_BUSY_SINCE > 1500)) {
      if (!TOOLS_BUSY_SINCE) TOOLS_BUSY_SINCE = now;
      TOOLS_WAKE = setTimeout(step, 60); return;
    }
    if (!busy) TOOLS_BUSY_SINCE = 0;
    /* EACH ASKED ONCE, NOT ONCE PER COMPARISON — a rank reads the column's pages. */
    const rank = new Map(TOOLS_WAIT.map(q => [q, widgetRank_(q)]));
    TOOLS_WAIT.sort((a, b) => rank.get(a) - rank.get(b));
    const next = TOOLS_WAIT.shift();
    /* ALREADY RUNNING — started meanwhile by `widgetsNear_` or an arrival — is left alone: one widget,
       one start, whichever of the three asked first. */
    if (!TOOLS_ON.some(e => String(e.w.id) === String(next.w.id))) {
      widgetUp_(next.w, next.col);
      /* A WIDGET BESIDE THE COLUMN IN FRONT GROWS ITS CARD AS IT DRAWS, and nothing re-centres a column
         that is not in front (`startScreen_` places the one in front after its own starts) — so its
         card would sit off the line every other card is centred on, which `check/ui.js`'s COLUMNS OUT
         OF LINE measures. One booked placement, instant, coalesced with anything else this frame. */
      if (next.col !== AT && typeof placeCells === 'function') placeCells('y', true);
    }
    /* A GAP, NOT NOUGHT: `setTimeout(…, 0)` would queue the next start ahead of a touch that is
       already waiting to be delivered on a busy phone. One frame's worth is enough for it to land. */
    if (TOOLS_WAIT.length) TOOLS_WAKE = setTimeout(step, 16);
  }, 0);
}

/* AND A PAGE TURNED TO BEFORE ITS TURN CAME starts its widget NOW, with the ones either side of it —
   called by `goPage` before the column moves, so a tile that jumps eight widgets down the column
   arrives at a working widget rather than at its markup waiting in the queue. A turn to a page that
   is already running costs one walk of a short list. */
/* IN THE RELEASE, ONLY A SLOT STILL UNDER ITS LOADER IS STARTED (the floor), and one drawn ahead with nothing
   changed is adopted, which costs nothing. A drawn slot that has to be started again stays queued and is
   started after the slide: its drawing is already on the glass, and a start inside a release is the stall
   this note's first paragraph was written about (docs/history/341). */
function widgetsNear_(col) {
  if (!TOOLS_WAIT.length) return;
  const now = TOOLS_WAIT.filter(q => {
    if (q.col !== col || widgetDistance_(q.w, col) > 1) return false;
    const sl = slotOn_(q.col, String(q.w.id));
    return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT || widgetAdoptable_(q.w, sl);
  });
  if (!now.length) return;
  TOOLS_WAIT = TOOLS_WAIT.filter(q => now.indexOf(q) === -1);
  now.forEach(q => { if (!TOOLS_ON.some(e => String(e.w.id) === String(q.w.id))) widgetUp_(q.w, q.col); });
}

/* STOPS EVERY RUNNING WIDGET `keep` DOES NOT KEEP, AND FORGETS EVERY WAITING ONE `wait` DOES NOT —
   with neither, everything, which is what this always did. WHAT IS STILL WAITING IS FORGOTTEN WITH
   WHAT IS RUNNING: a widget queued for a column that has left the glass must not start behind the
   column you are on now. Out of the list BEFORE its `stop` runs, so a `stop` that repaints finds
   nothing here still claiming the widget. */
/* AND A QUEUE EMPTIED HERE FORGETS WHEN IT FIRST FOUND A FINGER DOWN. `TOOLS_BUSY_SINCE` was only ever
   cleared by a step that found nothing busy, so a queue emptied in the middle of a swipe kept the old
   moment, and the next queue's first busy step was already "a second and a half" past it — and started
   its widget under the finger. That cap is also all that would let a step past an unplaced column change
   (`GLASS.at`), so the stale moment would have let a widget start for a column already left. */
function toolsStop_(keep, wait) {
  TOOLS_WAIT = wait ? TOOLS_WAIT.filter(wait) : [];
  if (!TOOLS_WAIT.length) {
    if (TOOLS_WAKE) { clearTimeout(TOOLS_WAKE); TOOLS_WAKE = 0; }
    TOOLS_BUSY_SINCE = 0;
  }
  const off = keep ? TOOLS_ON.filter(e => !keep(e)) : TOOLS_ON;
  TOOLS_ON = keep ? TOOLS_ON.filter(keep) : [];
  off.forEach(widgetDown_);
}

/* ==================================================================================================
   A WIDGET WHOSE CARD IS ON THE GLASS IS STARTED, WHICHEVER COLUMN IT IS IN

   THE OWNER, 10 Oct, with a screenshot of a 1194px window — Settings in front, About you on it, and the
   column beside it two widget cards with nothing in them but the gold dots and a star: *"these remain
   loading untill i scroll to them. i dont like this"*.

   WHAT HE WAS LOOKING AT. Only the column in front ever started its widgets (`startScreen_` → the two
   functions above), and leaving it stopped them all (`toolsStop_`, called from `go`). On a phone that
   is the whole of what can be seen; on a wide window it is not — from 700px the columns either side
   are whole cards (THE GRID SHOWS MORE OF ITSELF, shell.js), three across at 1194 and five at 1920.
   Settings sits beside Tools, so at 1194 the calculator sat under the loader for as long as Settings
   was in front, and at 1920 four widgets on two columns did. Each loader was right that the widget had
   not started; nothing was ever going to start it but going there.

   SO THE QUESTION IS WHAT IS ON THE GLASS, AND `placeGrid` ALREADY KNOWS. It places every column and
   every page, so it is where "which cards can be seen" is answered — `GLASS` in shell.js: the column in
   front, every column beside it showing more of its card than the edge the layout leaves on purpose
   (`WIDE_EDGE`), and down each the pages whose cards are inside the window. No IntersectionObserver:
   the reel column had one over a scroller of its own and it went for exactly this reason ("a ratio
   measuring a thing the app had already decided", the note in `goPage`). Asked after every placement
   that is not a finger's drag — a column change, a page turn, a resize, a repaint — and cheap when
   nothing has changed: a walk of a short list.

   WHAT IT DOES WITH THE ANSWER:
     · A WIDGET ON THE GLASS BESIDE THE COLUMN IN FRONT IS QUEUED, and started by the same queue as a
       far widget of the column in front — one per task, never while a finger is on the glass or a
       slide is settling (`widgetsLater_`), ahead of anything off the glass. Within a moment of being
       on the glass it is drawn, and a swipe never waits behind it.
     · A WIDGET THAT HAS LEFT THE GLASS IS STOPPED, as leaving a column always stopped it — swiped
       away, or the window narrowed until its column is a phone's edge again — once the slide that took
       it away has settled (`widgetsSettle_`). A canvas loop or a clock behind a screen nobody can see
       is still the flat battery this file has always refused; a third of a second of one is not.
     · THE COLUMN IN FRONT IS LEFT TO `startScreen_`: all of its widgets run, the near ones at once
       and the rest one per task, as before; this only keeps from stopping them.
     · ONE WIDGET, ONE START. A starred widget on Tools and on Saved, both on the glass, is started
       once, on the copy nearest the column in front; it is not stopped while that copy is on the
       glass, and when that copy leaves and the other is still there it is started on the other.
     · A SLOT A PAINT REPLACED IS A NEW SLOT. What ran in the old one is stopped (`isConnected`), and
       the new one is on the glass and not running, so it is queued like any other — and keeps its
       veil until it is started. (It was unveiled at once because the widget "was running", and sat
       there as markup nobody had started until the slide settled.) A paint that only redraws a column no longer replaces a
       running slot at all (`widgetsHeld_`); what is left is the first payload, which empties every
       column before it draws them, and a widget a column stopped drawing. That is how a widget
       beside you that started before the payload — and drew the one loader over its own part that
       waits for it: the calendar's month, the flyer's rooms, a score board — is drawn when the payload
       lands without anybody going to it: the first payload empties every column and draws it again
       (`load`'s landing), and this restarts what was on the glass in the new markup. A later payload
       repaints only the column in front and marks the rest `STALE`, and by then `awaiting_()` has no
       wait left to draw. (A `widgetsAgain_` that restarted every waiting widget beside you on every
       repaint was written for that case and taken out again: no wait in the app reached it, and its
       journey stayed green with it deleted.)
     · A WIDGET BESIDE YOU RUNS FOR WHOEVER IS SIGNED IN. A sign-out on Settings marks Tools `STALE`
       and leaves its markup, so the admin's flyer maker and the last person's notepad went on running
       on the glass beside the next person until somebody went there. The column in front is restarted
       by the repaint a change of person makes; a widget beside it started for somebody else is now
       stopped once the slide has settled, and started again if its column still draws it for the
       person here now — in the slot it was in, which is still that widget's markup.
   ON A PHONE `GLASS` is the column in front and nothing else — a neighbour there is a 23px edge, which
   shows no widget — so this does what `go`'s `toolsStop_()` did: everything not in front stops.
================================================================================================== */
function widgetsGlass_(settled) {
  if (typeof GLASS === 'undefined' || !GLASS || GLASS.at !== AT) return;
  const lit = new Set(GLASS.pages);
  const glassy = (col, slot) => col !== AT && !!slot && slot.isConnected && lit.has(slot.closest('.page'));
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  /* THE COPIES ON THE GLASS BESIDE THE COLUMN IN FRONT, nearest it first — the order a starred
     widget's copy is chosen in. A widget with no `start` never waits and is not this file's to start. */
  const ti = TABS.findIndex(t => t.id === AT);
  const far = c => Math.abs(TABS.findIndex(t => t.id === c) - ti);
  const beside = new Map();
  GLASS.cols.filter(c => c !== AT && WIDGET_COLS.indexOf(c) !== -1)
    .sort((a, b) => far(a) - far(b) || TABS.findIndex(t => t.id === a) - TABS.findIndex(t => t.id === b))
    .forEach(col => widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function') return;
      const slot = slotOn_(col, id);
      if (!glassy(col, slot)) return;
      if (!beside.has(id)) beside.set(id, []);
      beside.get(id).push({ w, col });
    }));
  /* STOP WHAT HAS LEFT THE GLASS and forget what was waiting for it. A widget of the column in front
     stays while that column holds it; one beside it stays while its own copy is on the glass. */
  /* A SLOT THAT IS GONE is markup a paint replaced, and what ran in it is stopped; a widget the column
     in front started with no slot of its own at all (`savedStart_` signed out) is left as it was. */
  /* AND ONE BESIDE IT ONLY FOR WHOEVER IS SIGNED IN NOW — see the last point of the note above. */
  const who = widgetWho_();
  const keep = e => (e.col === AT ? front.has(String(e.w.id)) && (!e.slot || e.slot.isConnected)
                                  : glassy(e.col, e.slot) && e.who === who);
  const wait = q => (q.col === AT ? front.has(String(q.w.id)) : glassy(q.col, slotOn_(q.col, String(q.w.id))));
  /* THE WAITING ONES ARE FORGOTTEN NOW AND THE RUNNING ONES STOPPED AFTER THE SLIDE. Forgetting is a
     filter; a `stop` is the widget's own code, and some of them repaint their card — measured at 390
     with the CPU at a quarter, one took 41ms, and from here it would have been the first frame of the
     slide the release just began. `go`'s `toolsStop_()` paid that before the slide too, but a move
     between two columns of widgets used to stop the old one from `startScreen_`, after it, and that is
     where every stop goes now: `afterSlide_`, which waits out the settle and a finger. A column that
     comes back before then is simply not stopped. */
  if (!settled && TOOLS_ON.some(e => !keep(e))) afterSlide_(widgetsSettle_, 'glass');
  toolsStop_(settled ? keep : () => true, wait);
  /* AND QUEUE WHAT IS ON IT AND NOT RUNNING. Not one the column in front holds: `startScreen_` starts
     those, on the copy a press can reach, and starting it here first would be the second start. One
     that IS running, on another copy, has started — so a copy of it that has just come onto the glass
     is not left under the loader for it (`widgetUp_`'s note). RUNNING MEANS KEPT: one about to be
     stopped — its markup gone, its copy off the glass, started for somebody else — has not started for
     anybody looking, and the copy on the glass keeps the loader until the settle has stopped that one
     and the queue has started this. */
  beside.forEach((copies, id) => {
    /* ---------- AND A COPY OF A WIDGET RUNNING IN FRONT, DRAWN AGAIN BY THE BUILDER, IS NOT LEFT VEILED --------
       `widgetUp_` takes the veil off every copy of a widget on the glass when it starts (one widget, one
       start) — once. Since docs/history/341 the builder draws a stale column beside the one in front in the
       quiet, AFTER that widget started, so the copy on it (chess starred into Saved, beside Games on an iPad)
       came back under its veil and stayed there for as long as Games was in front: measured, up to 91 frames
       of loader beside a running game. So it is said again at every placement, for the widgets the column in
       front is running. `LENT`: unveiled for a run in another copy, not drawn by itself — an arrival starts
       such a copy at once, as one still under its loader (`widgetsWake_`, `widgetsNear_`). */
    if (front.has(id)) {
      if (TOOLS_ON.some(e => String(e.w.id) === id && e.col === AT)) copies.forEach(c => {
        const sl = slotOn_(c.col, id);
        if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; }
      });
      return;
    }
    if (TOOLS_ON.some(e => String(e.w.id) === id && keep(e))) {
      copies.forEach(c => { const sl = slotOn_(c.col, id); if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; } });
      return;
    }
    if (TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
    TOOLS_WAIT.push({ w: copies[0].w, col: copies[0].col });
  });
  if (TOOLS_WAIT.length) widgetsLater_();
}
/* THE SAME QUESTION ASKED AGAIN ONCE THE SLIDE HAS SETTLED, and this time what has left is stopped — and
   a starred widget whose copy left while its other copy stayed is queued on the one still there. */
function widgetsSettle_() { widgetsGlass_(true); }

/* ==================================================================================================
   EVERY WIDGET SLOT IS DRAWN BEFORE IT IS NEEDED — AND NOTHING RUNS FOR NOBODY

   THE OWNER, 11 Oct: *"If I scrol fast left right up or down it's still clunky … Increase loading scope."*
   Measured that day (docs/history/341): a widget slot was drawn only by STARTING it, and a widget is started
   only once its column is in front and the slide has settled — so every arrival at Tools, Games, the shop or
   Saved showed cards under the loader for 1–4s at 4x, and a sweep across the row showed loaders in 19–77% of
   its frames. `start` cannot simply run earlier: some starts run things — a frame loop, a clip, the network,
   the shared classroom round — and those must run only for somebody looking.

   SO A SLOT IS DRAWN IN THE QUIET, ONE PER SLICE (`ahead_`, shell.js), BY WHATEVER DRAWS IT AND RUNS NOTHING:
     · a widget with no `stop` — whose own note says nothing of it runs on — by its `start`;
     · a widget WITH a `stop`, by its declared `draw` (map.js): `initTables`, `flappyStill_`, `wgPaint_`,
       `vidPaint_`, `feedPaint_`. `check-widgets.js` runs every draw ahead in a sandbox and fails on a fetch, a
       media source or `play()`, sound or speech, the camera, an interval, a timer or frame still pending
       400ms later, or a write outside the slot — so a draw cannot start running something by accident.
   It is drawn into its own slot (`WIDGET_HOME` says which copy for that one call), the loader comes off, and
   the slot is stamped with whom and under which clocks it was drawn. It is NOT entered in `TOOLS_ON`: it is
   not running, so `check/ui.js`'s "a widget off the glass started" still counts what it counted. On arrival it
   is adopted if nothing has changed since (`widgetUp_`), or started behind its drawing after the slide.
   ONLY A SLOT NOTHING IS USING: not on the column in front (`startScreen_` starts those, and `$` resolves to
   that copy), not running or queued anywhere (`initTables` would clear a running sprint), on a column already
   drawn (the paint goes first). A reels fact that is a clip stays under its loader (`feedPaint_` says why). */
function aheadDrawWidget_(w, col) {
  const id = String(w.id);
  const slot = slotOn_(col, id);
  if (!slot || !slot.getAttribute('aria-busy')) return;
  const had = Object.prototype.hasOwnProperty.call(WIDGET_HOME, slot.id) ? WIDGET_HOME[slot.id] : undefined;
  WIDGET_HOME[slot.id] = col;
  let drawn = true;
  try { drawn = (typeof w.draw === 'function' ? w.draw() : w.start()) !== false; }
  catch (e) { drawn = false; try { console.warn('[widget ahead]', id, e); } catch (x) {} }
  finally { if (had === undefined) delete WIDGET_HOME[slot.id]; else WIDGET_HOME[slot.id] = had; }
  if (!drawn) { slot.NOAHEAD = true; return; }
  if (typeof loaded_ === 'function') loaded_(slot);
  delete slot.LENT;
  slot.AHEAD = { who: widgetWho_(), act: ACT_EPOCH, draw: DRAW_EPOCH, ups: WIDGET_UPS[id] || 0, pure: !!w.pure };
  slot.WHO = widgetWho_();
  /* AND ITS COLUMN PLACED AGAIN, NOW: a widget grows its card as it draws (`widgetsLater_`'s reason). */
  if (typeof placeOne_ === 'function') placeOne_(col);
}
/* THE BUILDER'S WIDGET JOBS — every slot `aheadDrawWidget_` may draw, with how far it is.
   A SLOT IS AS FAR AS ITS COLUMN, and its page only orders it within that column (`/16`). It was the moves to
   reach it, columns plus pages, so Games' slots eight pages down the column beside you came after whole paints
   of columns three and four away — and the band draws those pages as a slide carries them across the glass:
   review, 12 Oct, Games pages 8–10 on the glass as the loader with the target page 4, 3.9s of it per run at
   390. A column's widgets are drawn before the next column out is painted. */
function aheadWidgetJobs_() {
  const out = [];
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  WIDGET_COLS.forEach(col => {
    if (col === AT || STALE[col] || !TABS.some(t => t.id === col)) return;
    const host = document.getElementById('s-' + col);
    if (!host || !host.firstElementChild) return;
    let pages = null;
    widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
      if (front.has(id)) return;
      if (TOOLS_ON.some(e => String(e.w.id) === id) || TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
      const slot = slotOn_(col, id);
      if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD) return;
      if (!pages) pages = [...host.querySelectorAll(':scope > .page')];
      const pos = pages.indexOf(slot.closest('.page'));
      const dp = pos < 0 ? 0 : Math.abs(logIndex_(col, pos) - (PAGE[col] || 0));
      out.push({ key: 'widget:' + col + ':' + id, kind: 'widget', d: aheadDist_(col, null) + Math.min(15, dp) / 16,
        run: () => aheadDrawWidget_(w, col) });
    });
  });
  return out;
}
AHEAD_KINDS.push(aheadWidgetJobs_);


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

   THE SAME CARD FOR EVERYBODY, signed out included — UNTIL 12 OCT, AND NOW FOR EVERYBODY BUT A
   STUDENT AND AN ADMIN, who get "Your journey" in its place (below). Who sees whose progress — a
   student their own, a parent their children's, a tutor their students', an admin anybody's — is
   still the first decision of building it; what is settled is only that a student's own column holds
   their own journey card, which was already theirs, on Settings.

   WHAT IT WILL DRAW FROM, written here because it is the first thing whoever builds it needs: what
   the app already keeps about each person's work. EVERY ANSWER SENT is a row of the `submissions`
   tab (`SCHEMA.submissions`; `js/submit.js` is the phone's half, note 308): the question, the answer
   as it was sent, how it was marked (right, wrong, sent, the AI's marks) and when — one row per
   press, never updated, so "what you got right" is each question's latest row and "what to work on
   next" is the questions whose latest row is not right. Drawings and ringed words, which have no
   Send, are on the account as they are drawn (the `answers` tab; `js/answers.js`). The `attempts`
   tab this note first named (a first day, a last day, a count) was retired by the submissions on 9
   Oct and is left in the sheet unread. Look in `TAB` in backend/constants.gs for what has joined or
   replaced these since.

   NOTHING STARTS OR STOPS, Spotlight's reason above: nothing on this column runs. */
/* ---------- YOUR JOURNEY, MOVED HERE FROM THE SETTINGS COLUMN ------------------------------------------
   ASKED FOR AS *"make a journey widget to go in account settings. its for student to track and
   organise their progess. fo know you can just make it as a place holder."* So this is the card's
   place and its outline, and nothing on it pretends to work: no button that does nothing, which is
   the fault `check/press.js` exists to report. The one live line is the countdown to the two exam
   dates a student keeps on About you, on the Settings column, because that is progress the app
   already knows. For a student, and for an admin so the owner can see it.

   MOVED, 12 OCT. The owner, with a screenshot of an admin's Settings ending on this card and the weekly
   email's: *"This should be moved to appropriate column."* It was the one card on Settings that is not
   a setting — tracking a student's progress is what this column was made for (9 Oct, above) — and two
   "coming soon" cards about one thing in one column would say it twice. So for whom it is drawn it IS
   the column's card, in place of the generic placeholder, and the placeholder stays for everybody
   else: signed out, a parent, a tutor. docs/history/346.

   THE COLUMN NOW DEPENDS ON WHO IS SIGNED IN, which it did not before, and it follows them the way
   every other column does: `repaint` — which every sign-in, sign-out and saved role ends in — marks it
   `STALE`, and `go` draws it again on the way in. The exam dates are the one fact on it that changes
   without a change of person, so a Save on About you, your own card's Save and a `myProfile` landing
   draw it again as well (`progressRedraw_`, below, called from `meSave_`, `card-save` and
   `profileRefresh_` in me.js).
   check-flow's journey for this card signs a student in and out and in again and asks each time.

   `hasRole`, NOT A RAW `indexOf`: the role cell is matched through `ROLE_ALIASES` everywhere else, so
   a learner whose cell says `pupil` is a student to every other card and was not one to this. */
function mayJourney_() {
  if (typeof hasRole !== 'function') return false;
  return hasRole('student') || hasRole('admin');
}
function journeyCard_() {
  const prof = (USER && USER.profile) || {};
  /* `Math.round`, NOT `Math.ceil`: both ends are local midnights, so the gap is a whole number of days
     give or take the hour the clocks move — and across the last Sunday of October in London it is
     fourteen days and an hour, which `ceil` counted as fifteen. Found moving the card (12 Oct, thirteen
     days before the clocks go back), measured with TZ=Europe/London. */
  const days = iso => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    const t = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date();
    return Math.round((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  };
  const exams = [['Small exam', prof.exam_small_date], ['Big exam', prof.exam_big_date]]
    .map(([k, v]) => [k, days(v)]).filter(([, d]) => d !== null && d >= 0)
    .map(([k, d]) => `<div class="row"><span class="k">${esc(k)}</span><span>${d === 0 ? 'today'
      : d + (d === 1 ? ' day' : ' days') + ' to go'}</span></div>`).join('');
  return `<div class="card journey">
    <h3>Your journey</h3>
    <p class="sub">Where you are, where you are going, and what you have done on the way. Coming soon.</p>
    ${exams}
    <div class="row"><span class="k">Goals</span><span class="faint">what you are aiming for</span></div>
    <div class="row"><span class="k">Milestones</span><span class="faint">the steps on the way</span></div>
    <div class="row"><span class="k">Worked through</span><span class="faint">papers and topics you have done</span></div>
  </div>`;
}
/* THE EXAM DATES CHANGED UNDER THE COLUMN, so it is REDRAWN IF IT IS DRAWN — the rule `profileRefresh_`
   keeps for Settings, whose About you holds the same two dates. Drawn whether or not it is in front,
   because on a wide window it can be beside the column you are on and in sight; `paintNeighbours`'
   pair — the markup, then the pager, which puts the new page where the old one was — and nothing
   started or stopped, because nothing on this column runs. A column never drawn is drawn on arrival. */
function progressRedraw_() {
  try {
    if (typeof screenHasMarkup_ === 'function' && !screenHasMarkup_('progress')) return;
    paint('progress');
    paintPager('progress', true);
  } catch (e) {}
}
function progressCards_() {
  if (mayJourney_()) return [journeyCard_()];
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
