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
  ['7', '7', ''], ['8', '8', ''], ['9', '9', ''], ['/', '÷', 'op'],
  ['4', '4', ''], ['5', '5', ''], ['6', '6', ''], ['*', '×', 'op'],
  ['1', '1', ''], ['2', '2', ''], ['3', '3', ''], ['-', '−', 'op'],
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