#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-doors.js

   AN ACTION WITH NO DOOR, AND A DOOR WITH NO ROOM.

   `on('x', …)` registers a handler and `data-do="x"` is the only thing that ever reaches it. The two
   are joined by a STRING, so neither side fails when they stop matching. A handler nothing can reach
   is dead weight that reads as a working feature — `friends` and `scan-posts` are the two already
   known about. A `data-do` with no handler is worse: the thing is on screen, it looks pressable, and
   pressing it does nothing at all. `subject` was exactly that for the life of the Who screen.

   Neither check.js nor check-dead.js can see this. Both sides are alive by their own reckoning: the
   handler is called (by the dispatcher, dynamically) and the markup is emitted. The join is a string
   and nothing checks strings.

   Same for screens: `screen('name', …)` registers one and `go('name')` is how you get there.

     node check-doors.js
================================================================================================== */
const fs = require('fs'), path = require('path');
const dir = __dirname;
/* ---------- THE FILE LIST COMES FROM index.html, BECAUSE A SECOND ONE DRIFTS -----------------------
   THIS WAS A HAND-KEPT `ORDER` ARRAY AND IT HAD DRIFTED TWICE. The note that stood here recorded
   the first time: *"`select`, `collections` AND `tiles` WERE MISSING. index.html loads twenty three
   files and this listed twenty, so three were never read — and `tiles.js` is where every card
   action in the app is built, which made all of them invisible to this audit."*

   IT HAD HAPPENED AGAIN, to `library.js`, `settings.js` and `terms.js`. index.html loads
   twenty-six files; this listed twenty-three. So every `on()`, every `data-do` and every `go()` in
   those three was outside the audit — `terms.js` alone has two handlers and both their doors — and
   the summary line at the foot has been understating what it looked at for as long as that was
   true.

   THE FIX IS THE ONE `check.js` ALREADY MAKES: read the list off `window.FILES` in index.html,
   which is the list the browser itself uses. A list kept by hand beside another list kept by hand
   is this repository's oldest shape, and the answer every time has been to delete one of them.

   ORDER IS PRESERVED, because it is the load order and this file reasons about it. */
const html  = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8');
const listed = html.match(/FILES\s*=\s*\[([\s\S]*?)\]/);
if (!listed) {
  console.log('check-doors: cannot find window.FILES in index.html — nothing was checked.');
  process.exit(1);
}
const ORDER = [...listed[1].matchAll(/'([\w-]+)'/g)].map(m => m[1])
  .filter(n => fs.existsSync(path.join(dir, n + '.js')));

const files = ORDER.map(n => ({ n, src: fs.readFileSync(path.join(dir, n + '.js'), 'utf8') }));
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '');


const handlers = new Map();   // action -> file
/* Handlers whose whole body is `{}` — see the note where this is filled in. */
const deliberatelyIdle = new Set();
const doors    = new Map();   // action -> Set(files)
const screens  = new Map();
const gotos    = new Map();

files.forEach(({ n, src }) => {
  const code = strip(src);
  /* ---------- A HANDLER THAT DOES NOTHING IS NOT A HANDLER WITH NO DOOR --------------------------
     `on('noop', () => {})` IN tiles.js WAS REPORTED EVERY RUN and was right every time, in the sense
     that nothing on screen carries `data-do="noop"`. It is also exactly what that line is for: the
     note beside it says "this exists so a stray tap is explicitly nothing rather than accidentally
     something later". Same for `on('ticks', () => {})` in find.js, which absorbs taps aimed at a
     checkbox so they do not walk up to the card behind it.

     A RED THAT IS ALWAYS RED IS A RED NOBODY READS — this project's own words, in check-flow.js —
     and this one had been red since the day it was written. One permanent false alarm is enough to
     teach somebody that the whole report is noise.

     AN EMPTY BODY IS THE RULE, not a list of names to keep in step. A handler registered with
     nothing in it cannot do anything whether or not it is reachable, so it has nothing to report:
     the entire point of it is to swallow a press. Give it a body and it becomes checkable again,
     which is the right moment for the check to start caring. */
  for (const m of code.matchAll(/\bon\(\s*'([a-z0-9-]+)'\s*,\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*\}/g)) {
    deliberatelyIdle.add(m[1]);
  }
  for (const m of code.matchAll(/\bon\(\s*'([a-z0-9-]+)'/g)) {
    if (handlers.has(m[1])) handlers.set(m[1], handlers.get(m[1]) + ', ' + n);
    else handlers.set(m[1], n);
  }
  /* ---------- A `change` LISTENER IS A HANDLER TOO --------------------------------------------------
     `on()` IS FOR PRESSES, and a dropdown is never pressed — choosing from it fires `change` and
     never a click, so the three controls on the booking paper bind it directly:
     `closest('[data-do="book-set"]')` inside a document listener.

     They are doors with handlers and were reported as doors with none, which is the same false
     alarm as the tiles above, in the other direction. Matched on the same string the door is
     written with, so the two cannot drift apart. */
  for (const m of code.matchAll(/closest\(\s*['"]\[data-do="([a-z0-9-]+)"\]['"]/g)) {
    if (handlers.has(m[1])) handlers.set(m[1], handlers.get(m[1]) + ', ' + n);
    else handlers.set(m[1], n);
  }
  for (const m of code.matchAll(/data-do="([a-z0-9-]+)"/g)) {
    if (!doors.has(m[1])) doors.set(m[1], new Set());
    doors.get(m[1]).add(n);
  }
  /* data-do set from a variable rather than written out — the audit cannot follow these, so they
     are listed rather than judged. */
  /* ---------- A DOOR MADE IN JAVASCRIPT IS STILL A DOOR --------------------------------------
     `setAttribute('data-do', 'ow-tap')` reaches the same handler as `data-do="ow-tap"` written in
     markup, and this only read the markup — so a door built on an element created in code looked
     like no door at all, and its handler was reported as unreachable.

     It found a real fault the first time it fired that way and then went on reporting it after the
     fault was fixed, which is the shape of alarm people learn to skip. */
  for (const m of code.matchAll(/setAttribute\(\s*['"]data-do['"]\s*,\s*['"]([a-z0-9-]+)['"]/g)) {
    if (!doors.has(m[1])) doors.set(m[1], new Set());
    doors.get(m[1]).add(n);
  }

  /* ---------- A TILE'S `act` IS A DOOR --------------------------------------------------------------
     `tile_({ act: 'fav' })` WRITES `data-do="fav"`, in one place, in tiles.js. Every card action in
     the app goes through it — the star, the trolley, HTML, Watch, Spotlight, Edit, Delete — so from
     this file's point of view all of them vanished the day tiles stopped being written out by hand.

     TEN FALSE ALARMS, WHICH IS WORSE THAN NONE. `fav`, `wear`, `cart-add`, `paper-read`,
     `topic-edit`, `topic-delete`, `book-with`, `set-listed`, `book-more`, `book-share` were all
     reported as handlers nothing can reach, on a screen where every one of them is a button you can
     press. A list that is ten parts noise is a list nobody reads, and this one is meant to be read
     the moment it is not empty.

     The same goes for `stepSelect_` and `stepInput_`, which build `data-do` the same way. */
  for (const m of code.matchAll(/\bact:\s*['"]([a-z0-9-]+)['"]/g)) {
    if (!doors.has(m[1])) doors.set(m[1], new Set());
    doors.get(m[1]).add(n);
  }

  for (const m of code.matchAll(/data-do="\$\{([^}]+)\}"/g)) {
    if (!doors.has('${…}')) doors.set('${…}', new Set());
    doors.get('${…}').add(n + ': ' + m[1].trim().slice(0, 40));
  }
  for (const m of code.matchAll(/\bscreen\(\s*'([a-z0-9-]+)'/g)) screens.set(m[1], n);
  for (const m of code.matchAll(/\bgo\(\s*'([a-z0-9-]+)'/g)) {
    if (!gotos.has(m[1])) gotos.set(m[1], new Set());
    gotos.get(m[1]).add(n);
  }
});

/* THE TAB BAR IS A DOOR, and it does not look like one. It navigates with `go(TABS[at].id)` — a
   value, not a literal — so every tab screen read as unreachable on the first run. A check that is
   mostly wrong is one nobody reads, so the tab ids are collected and counted as ways in.

   SAME FOR A `data-do` BUILT FROM AN EXPRESSION. find.js emits `data-do="${x.kind === 'shop' ?
   'shop-item' : 'topic'}"`, so `shop-item` has a door that no search for the literal string finds.
   Both branches are pulled out of the expression rather than guessed at. */
const tabIds = new Set();
const dynamicDoors = new Set();
files.forEach(({ src }) => {
  const code = strip(src);
  const m = code.match(/const TABS = \[([\s\S]*?)\n\];/);
  if (m) for (const t of m[1].matchAll(/id:\s*'([a-z0-9-]+)'/g)) tabIds.add(t[1]);
  for (const d of code.matchAll(/data-do="\$\{([^}]+)\}"/g))
    for (const lit of d[1].matchAll(/'([a-z0-9-]+)'/g)) dynamicDoors.add(lit[1]);
});

/* ---------- A PAGING TABLE KEYED BY A SCREEN THAT DOES NOT EXIST ----------------------------------
   `PAGER`, `PAGE_HOME` and `PAGE` are all keyed by screen id, and two of their keys were `me` and
   `posts` — names the screens had before the columns were folded in. The screens are `account` and
   `feed`.

   NOTHING THREW. `paint` does `classList.toggle('paged', !!PAGER[id])`, and an undefined lookup is
   just false, so the class never went on and the screen simply did not page. Moving up and down on
   the feed and on You did nothing at all: no error, no jump, no flicker. Two of the nine screens
   lost an axis and the only evidence was that a swipe achieved nothing.

   It is the same rename that left `go('me')` behind, which this file already catches — so the fix
   is to ask the same question of these three tables. */
const SCREEN_KEYED = ['PAGER', 'PAGE_HOME', 'PAGE'];
const strayPageKeys = [];
files.forEach(({ n, src }) => {
  SCREEN_KEYED.forEach(name => {
    /* The object literal, from `const NAME = {` to the line that closes it at column 0. Good enough
       for a file that formats its top-level declarations this way, and it is checked by eye once. */
    const open = src.indexOf('const ' + name + ' = {');
    if (open === -1) return;
    const close = src.indexOf('\n};', open);
    if (close === -1) return;
    const body = src.slice(open, close);
    /* A key at the start of a line inside that literal. Keys inside comments are skipped by
       requiring the line to begin with it. */
    for (const m of body.matchAll(/^\s{0,4}([a-z][a-z0-9_]*)\s*:/gm)) {
      const key = m[1];
      if (!screens.has(key)) strayPageKeys.push(name + '.' + key + '  (' + n + ')');
    }
  });
});

/* ---------- AND THE SAME QUESTION ASKED THE OTHER WAY ROUND -----------------------------------------
   THE BLOCK ABOVE ASKS WHETHER A TABLE KEY NAMES A REAL SCREEN. It cannot ask whether a real screen
   has its key — and that is the direction every one of these faults has actually come from:

     · `booking` and `reel` used `pages()` with no `PAGER` entry, so neither had a vertical axis.
     · `tools` and `games` used `stack()`, so about sixty per cent of each was unreachable.
     · `dm` did both, and at 390×844 with six conversations 493px of somebody's messages were on the
       page with no scroll and no page to turn to.

   FOUR TABLES AND A FILE OF MARKUP HAVE TO AGREE ABOUT WHAT A SCREEN IS — `TABS`, `TAB_ORDER`,
   `PAGER`, `screen()`, and a `<section id="s-…">` in index.html — and adding a column means editing
   all five. `TABS`'s own note records the one that shipped: *"a column that swipes to a blank is
   worse than a column that is not there, and it is the fault that shipped once already — TABS
   pushed without the matching section in index.html."* Nothing has ever compared them.

   EVERY ONE OF THESE FAILS SILENTLY, which is why they are worth a check rather than a convention:
   `paint` does `$('s-' + id)?.classList` and an absent section is `undefined`; `AXES.x.cells` does
   `.filter(Boolean)`, so a tab with no section simply drops out of the sideways axis and the column
   is skipped; `PAGER[id]` undefined is just false; and `TABS.sort` on `TAB_ORDER.indexOf` puts an
   unknown id at −1, which is the FRONT. */
const sections = new Set([...html.matchAll(/id="s-([a-z0-9-]+)"/g)].map(m => m[1]));
const pagerKeys = new Set();
const tabOrder = [];
files.forEach(({ src }) => {
  const open = src.indexOf('const PAGER = {');
  if (open !== -1) {
    const body = src.slice(open, src.indexOf('\n};', open));
    for (const m of body.matchAll(/^\s{0,4}([a-z][a-z0-9_]*)\s*:/gm)) pagerKeys.add(m[1]);
  }
  const ord = src.match(/const TAB_ORDER = \[([\s\S]*?)\];/);
  if (ord) for (const m of ord[1].matchAll(/'([a-z0-9-]+)'/g)) tabOrder.push(m[1]);
});
/* `pages(id, …)` is the only thing that builds a screen out of more than one page. `stack()` is
   one page by construction, so it needs no entry — and whether a stack holds more than fits is a
   question about pixels, which `check/ui.js` asks as OUT OF REACH. */
const paged = new Set();
files.forEach(({ src }) => {
  for (const m of strip(src).matchAll(/\bpages\(\s*'([a-z0-9-]+)'/g)) paged.add(m[1]);
});

const noSection  = [...tabIds].filter(t => !sections.has(t)).sort();
const noDraw     = [...tabIds].filter(t => !screens.has(t)).sort();
const noPager    = [...paged].filter(t => !pagerKeys.has(t)).sort();
const orderOff   = [...new Set([...tabIds].filter(t => !tabOrder.includes(t))
                     .concat(tabOrder.filter(t => !tabIds.has(t))))].sort();

const noDoor = [...handlers.keys()]
  .filter(a => !doors.has(a) && !dynamicDoors.has(a) && !deliberatelyIdle.has(a)).sort();
const noHandler = [...doors.keys()].filter(a => a !== '${…}' && !handlers.has(a)).sort();
const noWayTo = [...screens.keys()].filter(s => !gotos.has(s) && !tabIds.has(s)).sort();
const noScreen = [...gotos.keys()].filter(s => !screens.has(s)).sort();

const say = (title, list, how) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) return console.log('  none');
  list.forEach(a => console.log('  ' + a.padEnd(22) + how(a)));
};

say('A PAGING TABLE KEYED BY A SCREEN THAT IS NOT REGISTERED — that screen silently cannot page',
    strayPageKeys, f => '');

say('A TAB WITH NO SECTION IN index.html — the column swipes to a blank and drops out of the axis',
    noSection, t => 'TABS has \'' + t + '\', index.html has no <section id="s-' + t + '">');
say('A TAB NOTHING DRAWS — paint() finds no screen registered for it',
    noDraw, t => 'TABS has \'' + t + '\', no screen(\'' + t + '\', …) anywhere');
say('A PAGED SCREEN WITH NO PAGER ENTRY — no `paged` class, no vertical axis, pages nothing reaches',
    noPager, t => 'pages(\'' + t + '\', …) is built, PAGER has no \'' + t + '\'');
say('TABS AND TAB_ORDER NAME DIFFERENT SCREENS — an unknown id sorts to the FRONT, at index −1',
    orderOff, t => 'in one and not the other');

say('HANDLER WITH NO DOOR — nothing on screen can reach it', noDoor,
    a => 'on(\'' + a + '\') in ' + handlers.get(a) + '.js, no data-do anywhere');
say('DOOR WITH NO HANDLER — it looks pressable and does nothing', noHandler,
    a => 'data-do in ' + [...doors.get(a)].join(', ') + ' — no on(\'' + a + '\')');
say('SCREEN WITH NO WAY TO IT', noWayTo, s => 'screen(\'' + s + '\') in ' + screens.get(s) + '.js');
say('go() TO A SCREEN THAT IS NOT REGISTERED', noScreen,
    s => 'from ' + [...gotos.get(s)].join(', '));

if (doors.has('${…}')) {
  console.log('');
  console.log('DATA-DO BUILT FROM A VARIABLE — not checkable either way  (' + doors.get('${…}').size + ')');
  [...doors.get('${…}')].forEach(x => console.log('  ' + x));
}

console.log('');
console.log('handlers: ' + handlers.size + '   doors: ' + (doors.size - (doors.has('${…}') ? 1 : 0))
            + '   screens: ' + screens.size);
process.exit(noDoor.length + noHandler.length + noScreen.length + strayPageKeys.length
             + noSection.length + noDraw.length + noPager.length + orderOff.length ? 1 : 0);
