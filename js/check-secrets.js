/* ==================================================================================================
   A PIN WRITTEN INTO THE SOURCE IS PUBLISHED, AND IT STAYS PUBLISHED.

   `backend/constants.gs` carried two usage lines for months, in the comment block explaining how to
   run a job from a URL — `/exec?run=checkEverything&name=...&pin=...`, with a real admin's real
   name and real four digits filled in where the placeholders belong.

   THEY ARE NOT REPRODUCED HERE, and that is this check catching its own author: the first version
   of this header pasted both lines out of `constants.gs` to show what the fault looked like, and
   the first run named `check-secrets.js:7` and `:8`. A check that quotes the credential it found is
   the credential in one more file. This repository is PUBLIC and git history
   is permanent, so the PIN was published the moment it was committed and is still published now
   that the line has been changed — removing it stops the next reader finding it and un-publishes
   nothing. The only repair that repairs anything is changing the PIN.

   FOUND WHILE ANSWERING "why can't I sign in", WHICH IS THE ONLY REASON IT IS NOT STILL THERE. No
   check read it, nothing rendered it, and it sat in prose under a heading about deployment — the
   shape CLAUDE.md records every time: a fault nobody was looking for, in a file nobody re-reads.

   AND THE RULE RATHER THAN THE INSTANCE, which is this file's whole reason to exist. CLAUDE.md
   writes that sentence about `cost: 0`, about `paper: true`, about the spelling fold and about
   `delRow` — each repaired where it was found, each back a month later in a new column. A comment
   saying "use a placeholder" is a thing somebody has to remember.

   ONE QUESTION, AND IT HAS EXACTLY ONE RIGHT ANSWER: a PIN literal in this repository must be
   `0000`. Not "must look like a placeholder", which is a judgement — a single reserved value, so
   there is nothing to argue about and nothing to tune. Measured across every source file here:
   three occurrences, all of them `0000`, all of them in a usage line telling somebody to substitute
   their own. Anything else is either a credential or an example that should have been that one.

   IT IS DELIBERATELY NOT A SEARCH FOR SECRETS IN GENERAL. An API key, a token, a password: each
   would need a rule that decides what a high-entropy string is, and CLAUDE.md already records what
   a check with ninety-five findings and two real ones is worth. Four digits beside the word `pin`
   is the one shape this app actually has, because four digits beside the word `pin` is what this
   app's credential IS.
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* THE ONE ALLOWED VALUE. A reserved placeholder rather than a list of them: `0000` is not a PIN
   anybody would choose and `changePin` refuses a run of one digit outright, so it cannot be a real
   one by accident. */
const PLACEHOLDER = '0000';

/* WHAT IS READ. Source and prose — the two places a person types an example. `data/` is excluded
   because it is exports and transcriptions rather than anything anybody writes a usage line in, and
   `node_modules/` because it is not ours. */
const EXT = ['.gs', '.js', '.html', '.css', '.md', '.json', '.py', '.sh', '.yml', '.yaml'];
const SKIP = new Set(['node_modules', '.git', 'data', 'shots']);

/* `pin` then four or more digits, with up to six characters of punctuation between them — which
   covers `pin=0000`, `pin: '0000'`, `"pin": "0000"` and `pin -> 0000` alike. The word boundary is
   what keeps `spin`, `pinned` and `pinch` out of it. */
const RE = /\bpins?\b[^A-Za-z0-9]{0,6}(\d{4,})/gi;

function walk(dir, out) {
  let names;
  try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  names.forEach(e => {
    if (SKIP.has(e.name)) return;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return void walk(full, out);
    if (EXT.indexOf(path.extname(e.name)) >= 0) out.push(full);
  });
  return out;
}

function run() {
  const files = walk(ROOT, []);
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST SAY SO. CLAUDE.md records `check-booking.js` printing
     "nothing to check" and exiting 0 for months — "I did not manage to look" is not the same answer
     as "I looked and it was fine". */
  if (!files.length) {
    console.log('FAILED — no source files found under ' + ROOT + ', so nothing was checked.');
    process.exitCode = 1;
    return;
  }

  const bad = [];
  let seen = 0;
  files.forEach(f => {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
    text.split('\n').forEach((line, i) => {
      RE.lastIndex = 0;
      let m;
      while ((m = RE.exec(line))) {
        seen++;
        if (m[1] === PLACEHOLDER) continue;
        bad.push({ where: path.relative(ROOT, f) + ':' + (i + 1), digits: m[1] });
      }
    });
  });

  console.log('\nA PIN WRITTEN INTO THE SOURCE  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  /* THE DIGITS ARE NOT PRINTED. A check that names the credential it found is the credential in one
     more place — the same argument `check-handles.js` makes about never quoting a refused word
     back. The line is what somebody needs; they can open it. */
  bad.forEach(b => console.log('  ' + b.where + '  — ' + b.digits.length
    + ' digits beside the word "pin", and they are not ' + PLACEHOLDER));

  console.log('\nfiles read: ' + files.length + ', PIN literals found: ' + seen);
  if (bad.length) {
    console.log('FAILED — this repository is public and its history is permanent, so a PIN here is '
              + 'published and deleting the line does not unpublish it. Change the PIN, then write '
              + PLACEHOLDER + ' in its place.');
    process.exitCode = 1;
  } else {
    console.log('OK — every PIN in the source is the ' + PLACEHOLDER + ' placeholder.');
  }
}

run();
