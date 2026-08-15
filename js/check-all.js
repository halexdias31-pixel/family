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
  { file: 'check-columns.js', what: 'every column the backend touches' },
  { file: 'check-access.js', what: 'every action past the permissions gate' },
  { file: 'check-doors.js',   what: 'buttons and handlers', soft: true },
  { file: 'check-dead.js',    what: 'code nothing calls', soft: true },
  { file: 'check-booking.js', what: 'the booking machine, run not read' },
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
