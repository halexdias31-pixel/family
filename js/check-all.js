#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-all.js

   ONE COMMAND, ONE VERDICT.

   There are eleven checkers and running them by hand meant eleven commands, which in practice meant running
   the two you remembered. A safety net you have to assemble by hand each time is a safety net with
   holes in it wherever your memory has them — and the two that got skipped were reliably the slow
   ones, which are the ones that check the most.

     node check-all.js

   WHAT EACH ONE IS FOR, in the order they run — cheapest first, so a syntax error stops you in two
   seconds rather than after a minute of booting browsers:

     check          every name declared, nothing read before it exists   (a compiler's job)
     check-strings  no ${…} stranded inside quotes, drawn as characters
     check-css      no dead rules, no silent overrides, no contradictions
     check-tabs     every tab the backend reads is routed to a file that exists
     check-columns  every column the backend reads and writes exists
     check-doors    every handler has a button and every button a handler
     check-dead     functions nothing calls, on both sides
     check-booking  the state machine folded over real event sequences — where the money is
     check-flow     the app actually boots, draws, and can be pressed

   TWO OF THEM REPORT RATHER THAN FAIL. `check-dead` and `check-doors` name things that are
   suspicious rather than wrong — a function reached only from the console, a handler waiting for a
   button somebody has not built yet. They exit non-zero, and this treats that as WORTH READING
   rather than as broken, because a red that is permanently red is a red nobody reads.

   EVERYTHING ELSE IS PASS OR FAIL and a failure means something is actually wrong.
================================================================================================== */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = __dirname;

/* `soft` — reports rather than fails. See above: these two name things to look at, and treating a
   list to look at as a broken build is how a team learns to ignore the build. */
const SUITE = [
  { file: 'check.js',         what: 'names and load order' },
  { file: 'check-strings.js', what: 'templates that do not interpolate' },
  { file: 'check-css.js',     what: 'the stylesheet' },
  /* ---------- IT EXISTED AND NEVER RAN -------------------------------------------------------
     `check-scope.js` was written for the two faults that got past all the others — a name declared
     inside a block and read outside it, which throws the moment that line runs. It was never added
     to this list, so the one checker built for the faults nothing else can see has never been part
     of the safety net it belongs to.
     A checker that is not in the suite is a checker that does not run, and this file IS the suite. */
  { file: 'check-scope.js',   what: 'names declared in a block, used outside it' },
  { file: 'check-canvas.js', what: 'the shared picture, column by column' },
  /* backend/files.json must name every backend file — sync.gs pulls by that list, and a name
     missing from it is a file DELETED from the live project on the next pull. */
  { file: 'check-manifest.js', what: 'the backend file list sync.gs pulls by' },
  /* THE BACKEND'S OWN `check.js`. Apps Script loads every `.gs` into one scope exactly as the
     browser concatenates `js/`, so a name declared twice is a name declared once — and nothing
     warned. It ran before `check-columns` because a project that cannot load has no columns. */
  { file: 'check-backend.js', what: 'one scope, one declaration per name' },
  /* ---------- BEFORE THE COLUMNS, BECAUSE A TAB NOBODY CAN OPEN HAS NO COLUMNS -------------------
     The database is three spreadsheets now and `WHERE` says which tab is in which. A tab with no
     line there resolves to no file and reads back as an empty list — the same shape as an empty
     database, which is precisely how five unreachable tabs went unnoticed until all four of the old
     spreadsheets were read by hand. */
  { file: 'check-tabs.js',    what: 'every tab routed to a file that can hold it' },
  { file: 'check-columns.js', what: 'every column the backend touches' },
  /* ---------- THE SAME QUESTION, ASKED OF ONE TAB AT A TIME -------------------------------------
     `check-columns` asks "is this a column ANYWHERE", because it works by regex and a bare `r.name`
     carries no clue which tab it came from. That union is why seven reads of `r.link` on rows that
     had no `link` passed clean — `venues` has one. This parses instead, binds each row back to its
     `read(TAB.x)`, and asks the narrower question. Both are worth running: the union catches a
     column NO tab has, this catches a column the WRONG tab has. */
  { file: 'check-rows.js',    what: 'each column read, against the tab the row came from' },
  /* ---------- THE FAULT CLAUDE.md CALLS THE WORST ONE HERE --------------------------------------
     "A key the site asks for and the backend does not send fails silently." Nothing checked it, and
     `missingKeys()` only knows about screens somebody opened while signed in as the right person.
     This reads the files, so it sees every read whether or not anybody performed it. */
  { file: 'check-payload.js', what: 'DATA keys read vs DATA keys sent' },
  /* ---------- I DELETED THREE GAMES AND EVERY CHECK STAYED GREEN --------------------------------
     Removing one widget, I cut from its entry to the next one I could see, and three sat in
     between. Nothing noticed: the functions were still declared, the flow journeys do not know
     what belongs on a column, and the UI check measures what is drawn. This asks whether a
     widget's machinery exists with no widget to reach it — the question that would have. */
  { file: 'check-widgets.js', what: 'the widget contract, and the roster' },
  { file: 'check-access.js', what: 'every action past the permissions gate' },
  /* AND WHO THE ACTION IS ABOUT. `check-access` asks whether an action may be performed; this asks
     whether the person it names can be found again tomorrow. */
  { file: 'check-post.js', what: 'an action that names a person by a cell they can edit' },
  { file: 'check-doors.js',   what: 'buttons and handlers', soft: true },
  { file: 'check-dead.js',    what: 'code nothing calls', soft: true },
  { file: 'check-booking.js', what: 'the booking machine, run not read' },
  /* ---------- THREE CHECKS EXISTED AND NONE OF THEM RAN -------------------------------------------
     `check-lifecycle`, `check-spine` and `check-surfaces` were written, committed, and left off this
     list. All three pass, and all three have passed in silence for however long they have been
     here — CLAUDE.md even cites `check-spine.js` finding two missing receipt rows "the first time it
     ran", which is the last time anything ran it.

     A CHECK THAT IS NOT IN THE ROSTER SAYS NOTHING, which is the same fault as `check-booking`
     printing "nothing to check" and exiting 0 — recorded a few paragraphs up this very file. The
     roster is the only thing that makes a check real, so it is the thing to add to. */
  { file: 'check-lifecycle.js', what: 'every booking path ends where it should' },
  { file: 'check-spine.js',     what: 'one row order, both documents' },
  { file: 'check-surfaces.js',  what: 'nothing opens over the app' },
  /* ---------- AND THE DATA ITSELF, WHICH NOTHING HAD EVER READ ------------------------------------
     Every check above this line reads the CODE. `data/questions.json` is 4,264 rows of committed
     content — the library the whole Find screen is about — and no check had ever opened it. A wrong
     row does not throw; it is simply a question somebody is taught wrongly. */
  { file: 'check-library.js', what: 'the library: ids, marks, and the closed facet vocabulary' },
  { file: 'check-flow.js',    what: 'the app, actually running' },
];

let failed = 0, noted = 0;
const notes = [];

console.log('');
for (const c of SUITE) {
  const p = path.join(dir, c.file);
  if (!fs.existsSync(p)) {
    console.log('  ????  ' + c.file.padEnd(18) + 'not here');
    continue;
  }
  let out = '', ok = true;
  const t0 = Date.now();
  try {
    out = execFileSync(process.execPath, [p], { cwd: dir, encoding: 'utf8',
                                                timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    ok = false;
    out = String((e.stdout || '') + (e.stderr || ''));
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  if (ok) {
    console.log('  PASS  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
  } else if (c.soft) {
    noted++;
    console.log('  note  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
    /* THE INTERESTING LINES ONLY. These two print their whole report; what somebody wants here is
       the things they named, which are the indented ones under a heading. */
    notes.push({ file: c.file, lines: out.split('\n')
      .filter(l => /^ {2}\S/.test(l) && !/^ {2}none$/.test(l)).slice(0, 12) });
  } else {
    failed++;
    console.log('  FAIL  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
    out.split('\n').filter(Boolean).slice(-14).forEach(l => console.log('          ' + l));
  }
}

if (notes.length) {
  console.log('');
  console.log('WORTH A LOOK — not failures, but things nothing can reach or nothing calls:');
  notes.forEach(n => {
    if (!n.lines.length) return;
    console.log('  ' + n.file);
    n.lines.forEach(l => console.log('  ' + l));
  });
}

console.log('');
if (failed) {
  console.log('FAILED — ' + failed + ' of ' + SUITE.length + ' checks found something wrong.');
} else if (noted) {
  console.log('OK — nothing is broken. ' + noted + ' check(s) have something worth a look above.');
} else {
  console.log('OK — all ' + SUITE.length + ' checks clean.');
}
process.exit(failed ? 1 : 0);
