/* ==================================================================================================
   A NAME IS AN EDITABLE CELL, AND SIX ACTIONS WERE USING ONE AS AN IDENTITY.

   `findPerson(nameOrId, altId)` in `backend/people.gs` prefers the id and falls back to matching the
   NAME. That fallback is right — it is what lets a row typed into the sheet by hand be found before
   anybody has an id — and it is why leaving the id out is invisible: everything works, for one
   person, until two people share a display name or somebody renames themselves.

   THEN IT GOES WRONG QUIETLY AND IN DIFFERENT WAYS PER ACTION. A reaction lands on whichever row
   holds that name first. A pass tick is credited to somebody else. A game score overwrites a
   stranger's. And on `changePin`, the PIN you typed is checked against THEIR pin and you are told
   "That is not your current PIN" — which is confidently wrong about the one thing you are certain
   of, and leaves you unable to change yours at all. Not a way in, since the current PIN is still
   required; a denial rather than a breach.

   SIX WERE SENDING ONLY THE NAME: addPost, changePin, reactPost, saveScore, toggleTopicTick,
   votePoll. All six had `USER.personId` to hand and most of the other thirty actions were already
   sending it, which is what makes this a check rather than a decision — there is no judgement in
   it, only a list that had drifted.

   WHY THIS AND NOT EVERY FIELD. A first version compared every key the site posts against every
   `body.x` the handler reads, in both directions, the way `check-payload.js` does for `DATA`. It
   found twenty "read but never sent" and most were fine: a POST field is usually optional and the
   handler is written to cope. A report that is mostly noise is a report nobody reads — the lesson
   `check-css.js` has already written up. So this asks one question it can be certain about.
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

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

/* Comments out first, for the reason every other check in this project now does it: the house style
   is that a comment is a bug report, so the names this file is about are all over the prose. */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ''))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, a) => a);

/* A string is skipped whole. An apostrophe in a comment is gone by now, but `"it's"` in a message
   string is not, and reading from there to the next quote swallows real code. */
const skipStr = (s, j) => { const q = s[j]; for (j++; j < s.length && s[j] !== q; j++) if (s[j] === '\\') j++; return j; };

/* The balanced span starting at `from`, for either bracket family. */
const spanFrom = (s, from, open, close) => {
  let d = 0;
  for (let j = from; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'" || c === '`') { j = skipStr(s, j); continue; }
    if (c === open) d++;
    else if (c === close) { d--; if (d === 0) return s.slice(from, j + 1); }
  }
  return '';
};

/* ---------- WHAT EACH HANDLER READS --------------------------------------------------------------
   THE BLOCK IS FOUND FROM THE `if (`, NOT FROM THE MATCH. A first version took the first `{` after
   `action === 'x'`, which for a condition like `if (action === 'a' || action === 'b') {` is fine and
   for `if (action === 'saveNotepad') return savePerson('notepad', S(body.notepad));` is a brace that
   belongs to something else entirely — it read a neighbouring handler's fields and reported them
   against this one. Seven of the twenty findings in that version were that.

   AND A ONE-LINE HANDLER HAS NO BLOCK AT ALL. Several are `if (…) return savePerson(…);`, so the
   body runs to the `;` at depth zero rather than to a closing brace. Missing those read as
   "this handler reads nothing", which is a silent pass. */
const reads = new Map();          // action -> Set of body.<field>
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.gs'))) {
  const gs = decomment(fs.readFileSync(path.join(dir, f), 'utf8'));
  const re = /\bif\s*\(/g;
  let m;
  while ((m = re.exec(gs))) {
    const cond = spanFrom(gs, m.index + m[0].length - 1, '(', ')');
    const acts = [...cond.matchAll(/action\s*===\s*'([a-zA-Z]\w*)'/g)].map(x => x[1]);
    if (!acts.length) continue;
    let k = m.index + m[0].length - 1 + cond.length;
    while (k < gs.length && /\s/.test(gs[k])) k++;
    let body = '';
    if (gs[k] === '{') {
      body = spanFrom(gs, k, '{', '}');
    } else {
      let d = 0;
      for (let j = k; j < gs.length; j++) {
        const c = gs[j];
        if (c === '"' || c === "'" || c === '`') { j = skipStr(gs, j); continue; }
        if (c === '(' || c === '{' || c === '[') d++;
        else if (c === ')' || c === '}' || c === ']') d--;
        else if (c === ';' && d === 0) { body = gs.slice(k, j + 1); break; }
      }
    }
    const fields = [...body.matchAll(/\bbody\.([A-Za-z_]\w*)/g)].map(x => x[1]);
    acts.forEach(a => {
      if (!reads.has(a)) reads.set(a, new Set());
      fields.forEach(x => reads.get(a).add(x));
    });
  }
}

/* ---------- WHAT THE SITE POSTS ------------------------------------------------------------------
   EVERY OBJECT LITERAL CARRYING AN `action:`. Walked outwards from the `action` key to the brace
   that opens its own object, then forwards to the matching one — so a call spread over eight lines
   with nested objects in it is read whole, and the keys taken are the literal's own rather than
   anything nested inside a value. */
const sends = new Map();          // action -> Map of key -> 'file:line'
const jsDir = fs.existsSync(path.join(__dirname, 'shell.js')) ? __dirname
                                                             : path.join(__dirname, '..', 'js');
for (const f of fs.readdirSync(jsDir).filter(x => x.endsWith('.js') && !x.startsWith('check'))) {
  const src = decomment(fs.readFileSync(path.join(jsDir, f), 'utf8'));
  const re = /action:\s*'([a-zA-Z]\w*)'/g;
  let m;
  while ((m = re.exec(src))) {
    let depth = 0, start = -1;
    for (let j = m.index; j >= 0; j--) {
      const c = src[j];
      if (c === '}') depth++;
      else if (c === '{') { if (depth === 0) { start = j; break; } depth--; }
    }
    if (start < 0) continue;
    const body = spanFrom(src, start, '{', '}');
    if (!body) continue;
    const at = f + ':' + src.slice(0, m.index).split('\n').length;
    if (!sends.has(m[1])) sends.set(m[1], new Map());
    let d = 0;
    for (let j = 0; j < body.length; j++) {
      const c = body[j];
      if (c === '"' || c === "'" || c === '`') { j = skipStr(body, j); continue; }
      if (c === '{' || c === '[') d++;
      else if (c === '}' || c === ']') d--;
      else if (d === 1 && /[A-Za-z_]/.test(c) && !/\w/.test(body[j - 1] || '')) {
        let k = j - 1;
        while (k >= 0 && /\s/.test(body[k])) k--;
        if (body[k] === '{' || body[k] === ',') {
          const km = /^([A-Za-z_]\w*)\s*[:,}]/.exec(body.slice(j, j + 80));
          if (km) { sends.get(m[1]).set(km[1], at); j += km[1].length - 1; }
        }
      }
    }
  }
}

/* ---------- THE ONE QUESTION -------------------------------------------------------------------- */
const bad = [];
for (const [action, keys] of sends) {
  const r = reads.get(action);
  if (!r || !r.has('personId')) continue;      // this handler does not identify anybody by id
  if (keys.has('personId')) continue;
  bad.push([action, [...keys.values()][0] || '?']);
}

console.log('');
console.log('AN ACTION THAT IDENTIFIES A PERSON BY NAME ALONE  (' + bad.length + ')');
if (!bad.length) {
  console.log('  none — every action whose handler reads `personId` is sent one.');
}
bad.forEach(([a, at]) => {
  console.log('  ' + a + '  (' + at + ')');
  console.log('      the handler reads `body.personId` and the site sends only `name`, so');
  console.log('      `findPerson` falls back to matching an editable cell. Add');
  console.log('      `personId: (USER && USER.personId) || \'\'` to the call.');
});

console.log('');
console.log('actions posted: ' + sends.size + '   handlers found: ' + reads.size
          + '   handlers that resolve a person by id: '
          + [...reads.values()].filter(s => s.has('personId')).length);
console.log(bad.length
  ? 'FAILED — a name is an editable cell and these are using one as an identity.'
  : 'OK — nothing identifies a person by a name the person can change.');
process.exit(bad.length ? 1 : 0);
