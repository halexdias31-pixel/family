#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-widgets.js

   EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS.

   `WIDGETS` in map.js is the list of things this app can open. A widget is an object, and the
   contract is entirely by convention: an `id`, a `kind`, a `name`, some `html`, and — if it has
   anything to run — an `into` naming the element to run in and a `start` to run. Nothing enforced
   any of it, so the failures were all of the same family and all silent:

     • `into` NAMING AN ID THE HTML DOES NOT CONTAIN. `start` runs, looks the element up, finds
       nothing and returns. The card draws, the widget is dead, and nothing anywhere says so. This
       is the `DATA.messages` fault in another costume — wired at one end.
     • `start` WITH NO `into`. Same outcome, one line earlier.
     • A DUPLICATE `id`. `widgetsOf_` returns both, the pager counts both, and `$(into)` finds the
       first — so the second is a page you can swipe to that shows somebody else's widget.
     • A `kind` THAT IS NEITHER `tool` NOR `game`. `widgetsOf_` filters on exactly those two
       strings, so anything else is a widget that exists and appears on no column at all.

   WHY THIS IS PARSED AND NOT GREPPED. I wrote the first version of this audit as a regex over
   `map.js` and it silently missed three widgets — the three I had added that day — because their
   `html` contains `${}` and braces. A checker that quietly skips what it cannot parse reports a
   clean bill of health for the part it did not read, which is the worst answer it could give.
   acorn is already a dependency; the file is parsed and the array is walked.

     node js/check-widgets.js
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const jsDir = fs.existsSync(path.join(__dirname, 'map.js')) ? __dirname : path.join(__dirname, 'js');
const mapPath = path.join(jsDir, 'map.js');
if (!fs.existsSync(mapPath)) {
  console.log('FAILED — map.js not found, so NOTHING was checked. Looked in: ' + jsDir);
  process.exit(1);
}

const src = fs.readFileSync(mapPath, 'utf8');
let ast;
try {
  ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script' });
} catch (err) {
  console.log('FAILED — map.js does not parse: ' + err.message);
  process.exit(1);
}

/* The `WIDGETS` array literal, found by name rather than by position. */
let arr = null;
(function walk(n) {
  if (!n || typeof n !== 'object' || arr) return;
  if (n.type === 'VariableDeclarator' && n.id && n.id.name === 'WIDGETS'
      && n.init && n.init.type === 'ArrayExpression') { arr = n.init; return; }
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v.type === 'string') walk(v);
  }
})(ast);

if (!arr) {
  console.log('FAILED — no `WIDGETS` array in map.js, so NOTHING was checked.');
  process.exit(1);
}

/* Every widget, as {key: rawSourceText}. The VALUES are kept as source rather than evaluated: an
   `html` is a template string full of calls that cannot run outside a browser, and all this needs
   to know is what the text contains. */
const widgets = arr.elements.filter(Boolean).filter(e => e.type === 'ObjectExpression').map(obj => {
  const w = { _keys: [] };
  obj.properties.forEach(p => {
    if (!p.key) return;
    const k = p.key.name || p.key.value;
    w._keys.push(k);
    w[k] = src.slice(p.value.start, p.value.end);
  });
  return w;
});

const str = v => (v == null ? '' : String(v).replace(/^['"`]|['"`]$/g, ''));

const missingKey = [], badKind = [], dupes = [], orphanInto = [], startNoInto = [], intoNoStart = [];
const seen = {};

widgets.forEach(w => {
  const id = str(w.id) || '(no id)';

  /* THE FOUR THAT EVERY WIDGET HAS. `what` is not among them — it is the pager's caption and a
     widget without one is untidy, not broken. */
  ['id', 'kind', 'name', 'html'].forEach(k => {
    if (!w._keys.includes(k)) missingKey.push(id + ' has no `' + k + '`');
  });

  const kind = str(w.kind);
  if (kind && kind !== 'tool' && kind !== 'game') {
    badKind.push(id + " has kind '" + kind + "' — `widgetsOf_` only ever asks for 'tool' or 'game', "
                    + 'so this widget is on no column at all');
  }

  if (seen[id]) dupes.push(id); else seen[id] = 1;

  const into = str(w.into);
  const hasStart = w._keys.includes('start');

  /* THE ONE THAT CATCHES A DEAD WIDGET. `into` names the element `start` draws into, and the html
     is the only thing that can contain it. */
  if (into && w.html && w.html.indexOf(into) === -1) {
    orphanInto.push(id + " points `into: '" + into + "'` and its own html never mentions that id — "
                       + 'so `start` will look it up, find nothing, and the card will draw empty');
  }
  if (hasStart && !into) {
    startNoInto.push(id + ' has a `start` and no `into` — nothing tells it where to draw');
  }
  if (into && !hasStart) {
    intoNoStart.push(id + " names `into: '" + into + "'` and has no `start` to fill it");
  }
});

/* ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED --------------------------
   I DELETED CONNECT 4, OTHELLO AND HERD MENTALITY BY ACCIDENT AND EVERY CHECK STAYED GREEN.

   Removing The Overworld, I cut from its entry to the next one I could see — and those three sat in
   between. 45 lines went. `check.js` was happy (the functions were still declared), `check-flow`
   was happy (it does not know what should be on a column), and `check/ui.js` was happy (it measures
   what is drawn, and three fewer pages measure fine). The app lost three games in silence.

   THE ONE SIGNAL THAT EXISTED WAS A SOFT NOTE. `check-dead` named `initHerd` among six other
   function names on a single comma-separated line, in a check that reports rather than fails. It
   did not name `initConnect4` or `initOthello` at all, because `on('c4-again')` still called them —
   so the code looked alive while nothing could reach it.

   SO THIS ASKS THE QUESTION FROM THE OTHER END. Not "does this widget work" but "is there machinery
   here for a widget that no longer exists": a function named like a widget's starter, in the files
   widgets are built from, that no widget's `start` mentions. A game's engine with no entry in
   WIDGETS is either a widget somebody deleted or one somebody forgot to add, and both are worth
   stopping for. The test is whether the name appears inside any widget's `start`, so a starter
   reached by a widget passes however it is spelled. */
/* KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js
   use, and for the same reason: a permanently red check is one nobody opens, and a deliberate
   orphan is not a fault. An entry here is a promise that somebody looked. */
const ACCEPTED_ENGINE = {
  initOverworldBoard: 'The Overworld widget was removed on request; the board renderer stays because '
                    + 'the map it draws is used elsewhere in overworld.js. Deleting a working '
                    + 'renderer because one entry point closed is how a codebase loses things it '
                    + 'still needs.',
};

const starters = widgets.map(w => String(w.start || '')).join(' ');
const engineFiles = ['games.js', 'map.js', 'book.js', 'me.js', 'overworld.js', 'find.js', 'receipt.js'];
const orphanEngine = [];
engineFiles.forEach(f => {
  const fp = path.join(jsDir, f);
  if (!fs.existsSync(fp)) return;
  const txt = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of txt.matchAll(/^function (init[A-Z]\w*)\s*\(/gm)) {
    const name = m[1];
    if (starters.indexOf(name) === -1 && !(name in ACCEPTED_ENGINE)) {
      orphanEngine.push(name + ' (' + f + ') \u2014 a widget starter that no widget start names');
    }
  }
});

const say = (title, list, soft) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  return soft ? 'soft' : 'hard';
};

let bad = 0, noted = 0;
[[ 'A WIDGET MISSING ONE OF THE FOUR KEYS EVERY WIDGET HAS', missingKey ],
 [ 'A `kind` NO COLUMN ASKS FOR', badKind ],
 [ 'THE SAME `id` TWICE', dupes ],
 [ 'AN `into` NAMING AN ID ITS OWN HTML DOES NOT CONTAIN', orphanInto ],
 [ 'A `start` WITH NOWHERE TO DRAW', startNoInto ],
 [ 'A WIDGET STARTER WITH NO WIDGET \u2014 deleted by accident, or never added', orphanEngine ],
].forEach(([t, l]) => { if (say(t, l) === 'hard') bad += l.length; });

/* SOFT: a slot waiting for its widget is how a placeholder looks, and `drill` is deliberately one. */
if (say('AN `into` WITH NO `start` YET — a placeholder, or a widget half-wired', intoNoStart, true)) {
  noted += intoNoStart.length;
}

console.log('');
/* THE ROSTER, PRINTED EVERY RUN. A count alone does not say WHICH \u2014 and the whole failure above
   was three names quietly leaving a list. Printed in full so a disappearance shows in a diff of this
   check's own output, which is the cheapest alarm there is. */
const acceptedEngine = Object.keys(ACCEPTED_ENGINE);
if (acceptedEngine.length) {
  console.log('');
  console.log('A STARTER KEPT ON PURPOSE, WITH A REASON  (' + acceptedEngine.length + ')');
  acceptedEngine.forEach(k => console.log('  ' + k + ' \u2014 ' + ACCEPTED_ENGINE[k]));
}

console.log('');
console.log('  tools: ' + widgets.filter(w => str(w.kind) === 'tool').map(w => str(w.id)).join(', '));
console.log('  games: ' + widgets.filter(w => str(w.kind) === 'game').map(w => str(w.id)).join(', '));
console.log('');
console.log('widgets: ' + widgets.length
          + '   tools: ' + widgets.filter(w => str(w.kind) === 'tool').length
          + '   games: ' + widgets.filter(w => str(w.kind) === 'game').length);
console.log(bad
  ? 'FAILED — each of those is a widget that draws and does nothing.'
  : 'OK — every widget has the four keys, a kind a column asks for, a unique id, and an `into` its '
    + 'own html contains.');
process.exit(bad ? 1 : 0);
