/* ==================================================================================================
   THE APPS SCRIPT PROJECT IS ONE SCOPE, THE SAME WAY `js/` IS.

   `index.html` lists the front end's files and the browser concatenates them into one global scope;
   `js/check.js` exists because of that, and reports any name used but never declared. The backend
   has exactly the same property and had no equivalent: Apps Script loads every `.gs` in the project
   into one scope, so two files declaring the same function is two files declaring one function, and
   whichever the loader reaches second is the one that exists.

   IT HAD HAPPENED, AND IT WAS KNOWN ABOUT AND LEFT. `people.gs` declared `childrenOf` twice — once
   taking a person row and returning NAMES, once taking a parent id and returning ROWS — and
   CLAUDE.md carried "the second silently wins. Not yet fixed; be careful around it" for as long as
   it took somebody to stop being careful. The two callers wanted different halves:

     doget.gs    childrenOf(S(r.person_id)).map(personDisplayName)   wanted the id version
     dopost.gs   out.kids = childrenOf(r)                            wanted the other

   so one of them was handed a row where an id was expected, matched nothing, and returned an empty
   list. For every parent, on every sign-in, silently.

   NOTHING COULD HAVE TOLD YOU. Apps Script does not warn about a redeclared `function`; it is legal
   JavaScript and the last one wins. `check.js` reads `js/` and never looks here. `check-access.js`
   reads a handful of named files rather than the directory. This reads all of them.

   WHY `const` AND `let` COUNT DOUBLE. A redeclared `function` is quietly wrong; a redeclared `const`
   at top level is a SyntaxError that takes the whole project down at load — every handler, every
   trigger, the web app itself. There is no version of that which is survivable, so it is reported
   as the harder of the two.
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

/* THE SAME SEARCH EVERY OTHER BACKEND CHECK DOES, and for the reason CLAUDE.md sets out: three
   checks hand-rolled their own path to `backend/` and all three had it wrong, one of them exiting 0
   while checking nothing. Nearest first, and a directory that cannot be found is a failure rather
   than an empty pass. */
const WHERE = [path.join(__dirname, '..', 'backend'), path.join(__dirname, 'backend'),
               path.join(__dirname, '..'), __dirname];
const dir = WHERE.find(d => {
  try { return fs.readdirSync(d).some(f => f.endsWith('.gs')); } catch (e) { return false; }
});
if (!dir) {
  console.log('FAILED — no .gs files found, so NOTHING was checked. Looked in:\n  '
            + WHERE.join('\n  '));
  process.exit(1);
}

/* COMMENTS OUT FIRST. This file's own prose names `childrenOf` a dozen times and the house style
   means every backend file is mostly prose — `check-css.js` learned the same lesson the expensive
   way, proving a deleted class alive on the strength of its own obituary. Block comments are
   replaced by their own newlines so the line numbers below still point at the code. */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ''))
  /* NOT `//` INSIDE A URL. `https://…` in a string is the common case and eating to end-of-line
     from there takes real code with it. A `//` after a `:` is a scheme. */
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, a) => a);

const files = fs.readdirSync(dir).filter(f => f.endsWith('.gs')).sort();

/* ---------- WHAT EACH FILE DECLARES AT THE TOP LEVEL ----------------------------------------------
   ANCHORED TO THE START OF THE LINE, which is what "top level" means in these files and is the only
   test that does not need a parser. A `function` nested inside another is indented, and a nested one
   is scoped to its parent and cannot collide with anything. Being wrong in that direction costs a
   missed report; being wrong the other way would report every callback in the project. */
const fn = new Map();      // name -> ['file:line', …]
const val = new Map();     // name -> ['file:line', …] for const/let/var
const add = (map, name, at) => map.set(name, (map.get(name) || []).concat(at));

for (const f of files) {
  const src = decomment(fs.readFileSync(path.join(dir, f), 'utf8'));
  src.split('\n').forEach((line, i) => {
    const at = f + ':' + (i + 1);
    const m = /^function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(line);
    if (m) add(fn, m[1], at);
    /* `const X =` and `const { a, b } =` are different questions; only a plain name can be compared
       across files without unpacking the pattern, and a destructured one at top level is not
       something these files do. */
    const v = /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(line);
    if (v) add(val, v[1], at);
  });
}

const dupFn  = [...fn].filter(([, at]) => at.length > 1);
const dupVal = [...val].filter(([, at]) => at.length > 1);
/* A NAME THAT IS BOTH a function and a const is the same collision wearing two hats. */
const crossed = [...fn].filter(([k]) => val.has(k));

let fail = 0;
const say = (title, list, tail) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(([name, at]) => {
    console.log('  ' + name + ' — ' + (Array.isArray(at) ? at.join(', ') : at));
    if (tail) console.log('      ' + tail);
  });
  fail = 1;
};

say('A `const`, `let` OR `var` DECLARED TWICE — this is a SyntaxError and takes the whole project '
  + 'down at load', dupVal,
  'every handler, every trigger and the web app itself stop working, not just this name.');

say('A FUNCTION DECLARED TWICE — the last one loaded wins, silently', dupFn,
  'callers of the other one get the surviving body, with whatever it makes of their arguments.');

say('A NAME THAT IS BOTH A FUNCTION AND A VALUE', crossed.map(([k]) =>
  [k, (fn.get(k) || []).concat(val.get(k) || [])]),
  'the same collision; whichever is loaded second is the one that exists.');

console.log('');
console.log(files.length + ' file(s) in ' + path.relative(path.join(__dirname, '..'), dir)
          + '   top-level functions: ' + fn.size + '   values: ' + val.size);
console.log(fail
  ? 'FAILED — one scope, two declarations. Rename one of each pair.'
  : 'OK — every top-level name in the Apps Script project is declared exactly once.');
process.exit(fail ? 1 : 0);
