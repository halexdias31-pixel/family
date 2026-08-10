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
const ORDER = ['core','price-rows','chess','data','shell','cards','me','posts','links','find',
               'resource','arcade','map','book','receipt','games','overworld','boot'];

const files = ORDER.map(n => ({ n, src: fs.readFileSync(path.join(dir, n + '.js'), 'utf8') }));
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '');

const handlers = new Map();   // action -> file
const doors    = new Map();   // action -> Set(files)
const screens  = new Map();
const gotos    = new Map();

files.forEach(({ n, src }) => {
  const code = strip(src);
  for (const m of code.matchAll(/\bon\(\s*'([a-z0-9-]+)'/g)) {
    if (handlers.has(m[1])) handlers.set(m[1], handlers.get(m[1]) + ', ' + n);
    else handlers.set(m[1], n);
  }
  for (const m of code.matchAll(/data-do="([a-z0-9-]+)"/g)) {
    if (!doors.has(m[1])) doors.set(m[1], new Set());
    doors.get(m[1]).add(n);
  }
  /* data-do set from a variable rather than written out — the audit cannot follow these, so they
     are listed rather than judged. */
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

const noDoor = [...handlers.keys()].filter(a => !doors.has(a) && !dynamicDoors.has(a)).sort();
const noHandler = [...doors.keys()].filter(a => a !== '${…}' && !handlers.has(a)).sort();
const noWayTo = [...screens.keys()].filter(s => !gotos.has(s) && !tabIds.has(s)).sort();
const noScreen = [...gotos.keys()].filter(s => !screens.has(s)).sort();

const say = (title, list, how) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) return console.log('  none');
  list.forEach(a => console.log('  ' + a.padEnd(22) + how(a)));
};

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
process.exit(noDoor.length + noHandler.length + noScreen.length ? 1 : 0);
