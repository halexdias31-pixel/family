#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-doors.js AN ACTION WITH NO DOOR, AND A DOOR WITH NO ROOM. § */
const fs = require('fs'), path = require('path');
const dir = __dirname;
/* ---------- THE FILE LIST COMES FROM index.html, BECAUSE A SECOND ONE DRIFTS § */
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
  /* ---------- A HANDLER THAT DOES NOTHING IS NOT A HANDLER WITH NO DOOR § */
  for (const m of code.matchAll(/\bon\(\s*'([a-z0-9-]+)'\s*,\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*\}/g)) {
    deliberatelyIdle.add(m[1]);
  }
  for (const m of code.matchAll(/\bon\(\s*'([a-z0-9-]+)'/g)) {
    if (handlers.has(m[1])) handlers.set(m[1], handlers.get(m[1]) + ', ' + n);
    else handlers.set(m[1], n);
  }
  /* ---------- A `change` LISTENER IS A HANDLER TOO § */
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
  /* ---------- A DOOR MADE IN JAVASCRIPT IS STILL A DOOR § */
  for (const m of code.matchAll(/setAttribute\(\s*['"]data-do['"]\s*,\s*['"]([a-z0-9-]+)['"]/g)) {
    if (!doors.has(m[1])) doors.set(m[1], new Set());
    doors.get(m[1]).add(n);
  }

  /* ---------- A TILE'S `act` IS A DOOR § */
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

/* THE TAB BAR IS A DOOR, and it does not look like one. § */
const tabIds = new Set();
/* AND WHICH OF THEM ARE AN ADMIN'S — `admin: true` on the entry, read off the same literal. Each entry is
   one line, so the flag is looked for between its `id:` and the brace that closes it. */
const adminTabs = new Set();
const dynamicDoors = new Set();
files.forEach(({ src }) => {
  const code = strip(src);
  const m = code.match(/const TABS = \[([\s\S]*?)\n\];/);
  if (m) for (const t of m[1].matchAll(/id:\s*'([a-z0-9-]+)'/g)) tabIds.add(t[1]);
  if (m) for (const t of m[1].matchAll(/\{\s*id:\s*'([a-z0-9-]+)'[^}]*\badmin:\s*true\b/g)) adminTabs.add(t[1]);
  for (const d of code.matchAll(/data-do="\$\{([^}]+)\}"/g))
    for (const lit of d[1].matchAll(/'([a-z0-9-]+)'/g)) dynamicDoors.add(lit[1]);
});

/* ---------- A PAGING TABLE KEYED BY A SCREEN THAT DOES NOT EXIST § */
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

/* ---------- AND THE SAME QUESTION ASKED THE OTHER WAY ROUND § */
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
/* `pages(id, …)` is the only thing that builds a screen out of more than one page. § */
const paged = new Set();
files.forEach(({ src }) => {
  for (const m of strip(src).matchAll(/\bpages\(\s*'([a-z0-9-]+)'/g)) paged.add(m[1]);
});

/* ---------- AN ADMIN'S COLUMN IS THE OTHER WAY ROUND § */
const noSection  = [...tabIds].filter(t => !sections.has(t) && !adminTabs.has(t)).sort();
const adminWritten = [...adminTabs].filter(t => sections.has(t)).sort();
const sectionMaker = files.some(({ src }) => /function columnsFor_\s*\(/.test(src)
  && /createElement\(\s*'section'\s*\)/.test(src) && /\.admin\b/.test(src));
const adminUnmade = sectionMaker ? [] : [...adminTabs].sort();
const noDraw     = [...tabIds].filter(t => !screens.has(t)).sort();
const noPager    = [...paged].filter(t => !pagerKeys.has(t)).sort();
const orderOff   = [...new Set([...tabIds].filter(t => !tabOrder.includes(t))
                     .concat(tabOrder.filter(t => !tabIds.has(t))))].sort();

/* ---------- AND THE SIXTH PLACE, WHICH IS THE ONE THE PHONE ACTUALLY OBEYS § */
let colRows = null;
try {
  colRows = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'columns.json'), 'utf8'));
} catch (e) { colRows = null; }
const colNamed = new Set(Array.isArray(colRows)
  ? colRows.map(r => String((r && r.screen) || '').trim()).filter(Boolean) : []);
const noColumnRow = !Array.isArray(colRows) ? ['(data/settings/columns.json could not be read)']
  : [...new Set([...tabIds].filter(t => !colNamed.has(t))
       .concat([...colNamed].filter(t => !tabIds.has(t))))].sort();

/* ONE LAYOUT, FILE OR NO FILE: `TAB_ORDER` draws the row until columns.json lands, so any disagreement moves columns under a thumb (392). */
const fileOrder = !Array.isArray(colRows) ? [] : colRows.filter(r => r && String(r.active).toUpperCase() !== 'FALSE')
  .map((r, i) => ({ id: String(r.screen || '').trim(), n: Number(r.sort_order), i }))
  .sort((a, b) => ((isFinite(a.n) ? a.n : 1e9) - (isFinite(b.n) ? b.n : 1e9)) || a.i - b.i).map(r => r.id);
const codeOrder = tabOrder.filter(t => fileOrder.includes(t));
const orderDiffers = Array.isArray(colRows) && codeOrder.join() !== fileOrder.filter(t => tabOrder.includes(t)).join()
  ? ['TAB_ORDER: ' + codeOrder.join(' '), 'file:      ' + fileOrder.join(' ')] : [];

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
say('AN ADMIN\'S COLUMN WRITTEN INTO index.html — every visitor\'s document names a column only an admin is given',
    adminWritten, t => 'TABS marks \'' + t + '\' admin: true, and index.html has <section id="s-' + t + '">');
say('AN ADMIN\'S COLUMN NOTHING MAKES A SECTION FOR — the admin swipes to a blank',
    adminUnmade, t => 'TABS marks \'' + t + '\' admin: true, and no columnsFor_ makes its <section>');
say('A TAB NOTHING DRAWS — paint() finds no screen registered for it',
    noDraw, t => 'TABS has \'' + t + '\', no screen(\'' + t + '\', …) anywhere');
say('A PAGED SCREEN WITH NO PAGER ENTRY — no `paged` class, no vertical axis, pages nothing reaches',
    noPager, t => 'pages(\'' + t + '\', …) is built, PAGER has no \'' + t + '\'');
say('TABS AND TAB_ORDER NAME DIFFERENT SCREENS — an unknown id sorts to the FRONT, at index −1',
    orderOff, t => 'in one and not the other');
say('TABS AND data/settings/columns.json NAME DIFFERENT SCREENS — a tab with no row is on no phone',
    noColumnRow, t => t.startsWith('(') ? ''
      : tabIds.has(t) ? 'TABS has it, no row in columns.json' : 'a row, and no tab in TABS');

say('TAB_ORDER AND data/settings/columns.json PUT THE COLUMNS IN DIFFERENT ORDERS — the row rearranges itself when the file lands',
    orderDiffers, t => '');

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
            + '   screens: ' + screens.size + '   an admin\'s alone: ' + ([...adminTabs].join(', ') || 'none'));
process.exit(noDoor.length + noHandler.length + noScreen.length + strayPageKeys.length
             + noSection.length + adminWritten.length + adminUnmade.length
             + noDraw.length + noPager.length + orderOff.length
             + noColumnRow.length + orderDiffers.length ? 1 : 0);
