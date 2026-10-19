/* THE APPS SCRIPT PROJECT IS ONE SCOPE, THE SAME WAY `js/` IS. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const fs = require('fs');
const path = require('path');

/* THE SAME SEARCH EVERY OTHER BACKEND CHECK DOES, and for the reason CLAUDE.md sets out: § */
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

/* COMMENTS OUT FIRST. This file's own prose names `childrenOf` a dozen times and the house style means every backend file is mostly prose — `check-css.js` § */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ''))
  /* NOT `//` INSIDE A URL. `https://…` in a string is the common case and eating to end-of-line
     from there takes real code with it. A `//` after a `:` is a scheme. */
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, a) => a);

const files = fs.readdirSync(dir).filter(f => f.endsWith('.gs')).sort();

/* ---------- WHAT EACH FILE DECLARES AT THE TOP LEVEL § */
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

/* ---------- AND THE THREE WAYS A SHEET CHANGES, WHICH MUST ALL BE THE THREE FUNCTIONS § */
const WRITERS = /\.(deleteRow)\s*\(/;
const strays = [];
files.forEach(f => {
  const src = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  let inDelRow = false, inComment = false;
  src.forEach((line, i) => {
    /* ---------- THE COMMENT DESCRIBING THE FAULT IS NOT THE FAULT § */
    const before = inComment;
    if (!inComment && line.includes('/*') && !line.includes('*/')) inComment = true;
    else if (inComment && line.includes('*/')) inComment = false;
    if (before || inComment) return;
    if (/^\s*\/\//.test(line)) return;
    if (/^function\s+delRow\s*\(/.test(line)) inDelRow = true;
    else if (inDelRow && /^\}/.test(line)) inDelRow = false;
    if (inDelRow) return;
    const m = WRITERS.exec(line);
    if (m) strays.push([f + ':' + (i + 1), line.trim().slice(0, 78)]);
  });
});
say('A SHEET CHANGED WITHOUT `delRow`, so the stored payload keeps the deleted row',
  strays,
  'route it through delRow(t, row) — it sets POST_WROTE, which is what retires the payload.');

/* ---------- AND A NAME IS NOT PROOF OF WHO IS ASKING § */
const CLAIMS = /\bp\.(name|person)\b/;
const claims = [];
(function () {
  const f = 'doget.gs';
  let src;
  try { src = fs.readFileSync(path.join(dir, f), 'utf8').split('\n'); } catch (e) { src = null; }
  /* A FILE THAT CANNOT BE READ IS A FAILURE, NOT AN EMPTY PASS. "I did not manage to look" printed
     as "I looked and it was fine" is the fault this repository keeps finding in its own checks. */
  if (!src) { claims.push([f, 'could not be read, so NOTHING was checked — not a pass']); return; }
  let inRun = false, inComment = false;
  src.forEach((line, i) => {
    const before = inComment;
    if (!inComment && line.includes('/*') && !line.includes('*/')) inComment = true;
    else if (inComment && line.includes('*/')) inComment = false;
    if (before || inComment) return;
    if (/^\s*\/\//.test(line)) return;
    if (/^\s*if \(p\.run\) \{/.test(line)) inRun = true;
    else if (inRun && /^    \}$/.test(line)) inRun = false;
    if (inRun) return;
    if (CLAIMS.test(line)) claims.push([f + ':' + (i + 1), line.trim().slice(0, 78)]);
  });
})();
say('WHO IS ASKING TAKEN FROM A NAME OR AN ID IN THE URL, which anybody can type', claims,
  'resolve the session token instead — authWhoIs_(p.token), as accessDenied already does for POST.');

/* ---------- AND A NEW PIN MUST CLEAR THE GUESSES AT THE OLD ONE § */
const SETS_PIN = /\bauthSetPin_\s*\(/;
const CLEARS   = /\bauthClearThrottle_\s*\(/;
const SCOPE    = /^\s*(?:function\s+(\w+)\s*\(|if \(action === '(\w+)'\))/;
const PIN_OK   = new Set(['authCheckPin_']);   // see above — the migration path, not a change
const pins = [];
files.forEach(f => {
  let src;
  try { src = fs.readFileSync(path.join(dir, f), 'utf8').split('\n'); } catch (e) { src = null; }
  if (!src) { pins.push([f, 'could not be read, so NOTHING was checked — not a pass']); return; }
  const clean = decomment(src.join('\n')).split('\n');
  /* Where each scope starts, so a call can be attributed to the handler it is in rather than to
     whatever happens to sit forty lines below it. */
  const marks = [];
  clean.forEach((line, i) => {
    const m = SCOPE.exec(line);
    if (m) marks.push([i, m[1] || m[2]]);
  });
  clean.forEach((line, i) => {
    if (!SETS_PIN.test(line)) return;
    /* The function's own `function authSetPin_(` line is not a call to it. Without this the
       rule reports the definition, which is a finding nobody can act on — and a report that
       is mostly noise is a report nobody reads. */
    if (/^\s*function\s/.test(line)) return;
    let at = -1;
    for (let k = 0; k < marks.length; k++) if (marks[k][0] <= i) at = k;
    if (at < 0) return;
    const name = marks[at][1];
    if (PIN_OK.has(name)) return;
    /* PER CALL, NOT PER SCOPE, and that distinction is the whole of it. § */
    const end = Math.min(at + 1 < marks.length ? marks[at + 1][0] : clean.length, i + 10);
    const body = clean.slice(i, end).join('\n');
    if (!CLEARS.test(body)) {
      pins.push([f + ':' + (i + 1), name + ' sets a new PIN and never clears tries/locked_until']);
    }
  });
});
say('A PIN ISSUED WITHOUT CLEARING THE LOCKOUT, so the new one is refused for up to an hour', pins,
  'call authClearThrottle_(t, row) beside authSetPin_ — see its note in booking.gs.');

console.log('');
console.log(files.length + ' file(s) in ' + path.relative(path.join(__dirname, '..'), dir)
          + '   top-level functions: ' + fn.size + '   values: ' + val.size);
/* THE SUMMARY NAMES WHAT ACTUALLY FAILED. § */
console.log(fail
  ? 'FAILED — see above: a name declared twice, or a sheet changed outside setCell/addRow/delRow.'
  : 'OK — every top-level name is declared once, every deletion goes through delRow, and a new '
    + 'PIN clears the lockout.');
process.exit(fail ? 1 : 0);
