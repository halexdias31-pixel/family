#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-payload.js

   THE SITE ASKS `DATA` FOR THINGS. THE BACKEND DECIDES WHAT IS IN IT. NOTHING MADE THEM AGREE.

   CLAUDE.md ALREADY NAMES THIS AS THE WORST FAILURE THIS APP HAS: "A key the site asks for and the
   backend does not send fails silently. `|| []` turns it into an empty list, which looks exactly
   like an empty database." It has happened at least four times that left a trace in the comments —
   `liveJobs`, `messages`, `resources`, `people` — and each was found by somebody noticing a feature
   had quietly stopped, not by anything reporting it.

   `missingKeys()` EXISTS AND IS THE WRONG INSTRUMENT. It records a key the moment something reaches
   for one that is not there, so it only knows about the screens you happened to open, in the state
   you happened to be in, as the person you happened to be signed in as. A key read only by an admin
   on the print queue is invisible to it until an admin opens the print queue. This reads the files,
   so it sees every read whether or not anybody performed it.

   --------------------------------------------------------------------------------------------------
   TWO DIRECTIONS, AND THEY ARE NOT THE SAME SEVERITY.

   READ AND NEVER SENT is a feature that silently does nothing. The guard beside it — `|| []`,
   `|| {}` — was written to survive a key being absent and does its job perfectly, which is exactly
   why nobody finds out. This is the one that fails the build.

   SENT AND NEVER READ is weight: a tab walked, rows mapped, JSON serialised and shipped to a phone
   on every single load for nobody. Worth knowing and worth deleting, but it breaks nothing — so it
   is reported and does not fail.

   --------------------------------------------------------------------------------------------------
   COMMENTS ARE STRIPPED FIRST, AND THAT IS NOT A DETAIL.

   This codebase is 64% prose, and a great deal of that prose is about keys that USED to exist:

       `DATA.people` AND `hasRole_` BOTH NEVER EXISTED — I wrote them from memory…
       `DATA.config` is not a thing the payload sends…
       `|| DATA.avatarItems` was here, and the payload has never had that key…

   A scan that counts those finds ten missing keys where there are seven, and three of its findings
   are sentences explaining that the problem was already fixed. A checker that reports the fix as
   the fault is a checker nobody finishes reading.

     node js/check-payload.js
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- ACCEPTED, WITH A REASON EACH -----------------------------------------------------------
   A key here is one the site reads and the backend deliberately does not send. Every entry needs a
   sentence, because "we know about that one" is how a real fault gets added to a list of excuses and
   never looked at again. An empty list is the goal. */
const ACCEPTED = {
  // (nothing yet — see the report)
};

const WHERE = [path.join(__dirname, '..', 'backend'), path.join(__dirname, 'backend'),
               path.join(__dirname, '..'), __dirname];
const findGs = name => {
  for (const w of WHERE) {
    for (const n of [name, name.toLowerCase()]) {
      const p = path.join(w, n);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
};

/* Block and line comments out. Crude on purpose: a `//` inside a string would be cut too, and the
   only thing that costs is a missed READ, which the other direction of this check would then report
   as "sent and never read" — visible either way.

   A BLOCK COMMENT IS REPLACED BY ITS OWN NEWLINES, NOT BY A SPACE. The first version collapsed each
   one to ' ', which is correct for finding reads and wrong for reporting them: this codebase is 64%
   prose, so a file's comments are most of its lines, and every line number after the first block
   comment came out short by however many lines that comment ran. The first run of this check pointed
   at `me:601`, which is the middle of a paragraph about double-tapping Sign in. A checker that names
   the wrong line is one you stop believing before you stop running it. */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/^([ \t]*)\/\/.*$/gm, '$1');

/* ---------- WHAT THE SITE ASKS FOR --------------------------------------------------------------- */
const jsDir = fs.existsSync(path.join(__dirname, 'shell.js')) ? __dirname
            : path.join(__dirname, 'js');
const siteFiles = fs.readdirSync(jsDir)
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js');

const reads = new Map();                     // key -> "file:line, file:line"
siteFiles.forEach(f => {
  const src = decomment(fs.readFileSync(path.join(jsDir, f), 'utf8'));
  src.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/\bDATA\s*\.\s*([A-Za-z_][\w]*)/g)) {
      const at = f.replace(/\.js$/, '') + ':' + (i + 1);
      reads.set(m[1], (reads.get(m[1]) ? reads.get(m[1]) + ', ' : '') + at);
    }
  });
});

/* index.html reaches for a couple of its own before any file is loaded. */
const indexPath = path.join(jsDir, '..', 'index.html');
if (fs.existsSync(indexPath)) {
  const src = decomment(fs.readFileSync(indexPath, 'utf8'));
  for (const m of src.matchAll(/\bDATA\s*\.\s*([A-Za-z_][\w]*)/g)) {
    if (!reads.has(m[1])) reads.set(m[1], 'index.html');
  }
}

/* ---------- WHAT THE BACKEND SENDS ----------------------------------------------------------------
   Three shapes, because doGet uses all three: a key in the `const payload = { … }` literal, a later
   `payload.x = …`, and `payload.x.push(…)` filling one declared empty up top. */
const gsPath = findGs('doget.gs') || findGs('doGet.gs') || findGs('60_doGet.gs');
if (!gsPath) {
  console.log('FAILED — doget.gs not found, so NOTHING was checked. Looked in:\n  ' + WHERE.join('\n  '));
  process.exit(1);
}
const gs = decomment(fs.readFileSync(gsPath, 'utf8'));

const sent = new Set();

/* THE LITERAL IS WALKED, NOT PATTERN-MATCHED, AND THE FIRST VERSION SHOWS WHY.
   It took keys with `/^ {6}(\w+)\s*:/gm` — the literal's own indent, anchored to the line. That
   reads every key that STARTS a line and none of the ones after it, and this literal packs related
   keys together:

       links: [], shop: [], promotions: [], intervals: [], landmarks: [],
       profileFields: PROFILE_GROUPS, clientFields: CLIENT_GROUPS,

   so `links` and `profileFields` counted as sent and `promotions` and `clientFields` did not. Both
   were then reported as features the backend never sends, which is the worst thing this check can
   do: it is here to be believed about exactly that, and two of its nine findings were its own regex.
   Walking depth costs twenty lines and cannot be wrong about where a key sits. */
const scanLiteral = src => {
  const at = src.indexOf('const payload = {');
  if (at === -1) return [];
  const keys = [];
  let i = src.indexOf('{', at), depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    /* Strings are skipped whole. A `:` inside one is prose, and `'a: b'` at depth 1 would otherwise
       read as a key. Template literals nest `${}` and are skipped the same crude way — anything
       they contain is a value, never a key of this object. */
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      for (i++; i < src.length && src[i] !== q; i++) if (src[i] === '\\') i++;
      continue;
    }
    if (c === '{' || c === '[') { depth++; continue; }
    if (c === '}' || c === ']') { depth--; if (depth === 0) break; continue; }
    /* Depth 1 is the payload's own keys. Deeper is a value's insides — `gallery: { error: '' }`
       must not put `error` on the sent list, or a real missing key hides behind it. */
    if (depth === 1 && /[A-Za-z_]/.test(c)) {
      const m = /^([A-Za-z_]\w*)\s*:/.exec(src.slice(i, i + 80));
      if (m && !/\w/.test(src[i - 1] || '')) { keys.push(m[1]); i += m[1].length - 1; }
    }
  }
  return keys;
};
scanLiteral(gs).forEach(k => sent.add(k));

/* Later assignments and the fill loops: `payload.x = …`, `payload.x.push(…)`. */
for (const m of gs.matchAll(/\bpayload\s*\.\s*([A-Za-z_][\w]*)/g)) sent.add(m[1]);

/* ---------- THE TWO LISTS ------------------------------------------------------------------------- */
const readNotSent = [...reads.keys()].filter(k => !sent.has(k) && !(k in ACCEPTED)).sort();
const sentNotRead = [...sent].filter(k => !reads.has(k)).sort();
const accepted    = [...reads.keys()].filter(k => !sent.has(k) && (k in ACCEPTED)).sort();

console.log('');
console.log('THE SITE READS IT AND THE BACKEND NEVER SENDS IT  (' + readNotSent.length + ')');
if (!readNotSent.length) console.log('  none');
readNotSent.forEach(k => {
  console.log('  DATA.' + k);
  console.log('      read at ' + reads.get(k));
  console.log('      → silently empty. The `|| []` beside it is why nobody finds out.');
});

console.log('');
console.log('THE BACKEND SENDS IT AND NOTHING READS IT  (' + sentNotRead.length + ')');
console.log('  ' + (sentNotRead.length ? sentNotRead.join(', ') : 'none'));
if (sentNotRead.length) {
  console.log('  → a tab walked and shipped to every phone on every load, for nobody.');
  console.log('    Not a fault; weight. Delete the ones nothing is waiting for.');
}

if (accepted.length) {
  console.log('');
  console.log('ACCEPTED, WITH A REASON  (' + accepted.length + ')');
  accepted.forEach(k => console.log('  DATA.' + k + ' — ' + ACCEPTED[k]));
}

console.log('');
console.log('keys read: ' + reads.size + '   keys sent: ' + sent.size);
console.log(readNotSent.length
  ? 'FAILED — each of those is a feature that does nothing and says nothing.'
  : 'OK — everything the site reads, the backend sends.');
process.exit(readNotSent.length ? 1 : 0);
