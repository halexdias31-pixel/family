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
const { execFileSync, execFile } = require('child_process');
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
  /* ---------- AND A CONSTANT BEING ASSIGNED TO, WHICH THROWS AND IS OFTEN SILENT ----------------
     `shell.js` had `d = libraryInto_(d, …)` where `d` is `const`. It threw on every load, the
     surrounding try swallowed it, and nothing looked wrong because the function MUTATES `d` before
     returning it — so the useful work was already done when the assignment blew up. What it cost
     was that nothing after that line inside the try could ever run, which stayed invisible until
     something was finally put there. */
  { file: 'check-const.js',   what: 'nothing declared const is assigned to' },
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
  /* ---------- AND WHETHER A REFUSAL IS REPORTED AS ONE -------------------------------------------
     `api()` RESOLVES ON `{ error: … }`; `send()` THROWS. A caller that posts through the first and
     then toasts "Sent" tells somebody a write worked on the strength of an answer it never read —
     written after making exactly that mistake on the Message control, where a stubbed refusal
     closed the sheet, discarded what had been typed, and said it had gone. */
  { file: 'check-replies.js', what: 'a refusal reported as a refusal' },
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
  /* ---------- THE ONE PIECE OF THIS APP THAT TELLS A CHILD THEY ARE WRONG -----------------------
     Everything above measures whether the app works. This measures whether the marking is FAIR,
     and it is here because it caught a live one: the library spells a fraction with U+2044, a
     phone types `/`, and `5/9` was marked wrong against `5⁄9` on a paper somebody was sitting. */
  { file: 'check-marking.js', what: 'a right answer marked right, a wrong one wrong' },
  /* ---------- AND EVERY TIMESTAMP ANYBODY SEES ---------------------------------------------------
     `parseWhen` read `2026-09-15` as 26 September 2015, because its day-month-year match was not
     anchored and the engine slid past the four-digit year. A plausible date, wrong by eleven years,
     on every surface that prints a time. On the roster because the roster is the only thing that
     makes a check real — three good checks once sat on disk for months. */
  { file: 'check-dates.js', what: 'a written date read as the date it says' },
  /* ---------- THE PRACTICALS, AND WHETHER THEIR TOPICS NAME ANYTHING REAL ----------------------
     A practical's whole value is the join: name the topics a question names and a tutor looking at
     perimeter finds the trundle wheel. The export's own spelling, `Perimeter and area`, reached one
     question out of ninety-four — a join that looks like a feature and returns the wrong list. */
  { file: 'check-practicals.js', what: 'the practicals, and the topics they join to' },
  { file: 'check-quizzes.js', what: 'the quizzes: an answer that can be reached, and why' },
  /* ---------- AND WHETHER A REEL IS A FILE THAT IS THERE ------------------------------------------
     A clip whose path is one character wrong does not draw a broken link. `reelPlay_` swaps the
     element for an iframe on the same address, so a missing file reads as Google's player or as a
     black rectangle — the feature half-working rather than a file nobody uploaded. The README in
     `data/reels/` asked for this the day there was a clip to check, and there are two. */
  { file: 'check-reels.js', what: 'every clip a file a phone can fetch and start' },
  /* ---------- AND WHAT A PERSON MAY CALL THEMSELVES ----------------------------------------------
     The second check here that measures whether the app is SAFE rather than whether it works, after
     `check-marking.js`. A rude handle reaches a parent; a real name refused reaches somebody who
     has done nothing. And the rule that is not about words at all: `findPerson` answers to
     `full_name`, `handle` AND `username`, so a handle that duplicates one of those makes
     `changePin` check a PIN against the wrong row. It caught a real one on its first run. */
  { file: 'check-handles.js', what: 'what a person may call themselves' },
  /* ---------- AND THE CELLS ON THAT SAME TAB THAT HOLD MORE THAN ONE FACT -------------------------
     `availability` AND `library_card` ARE PACKED, each because the alternative is a numbered column,
     and neither packer had ever been run by anything. It is the one shape where a fault is
     completely silent: a dropped field writes a shorter cell, the form reloads with an empty box,
     and the person who typed it assumes they forgot. */
  { file: 'check-people.js', what: 'the packed cells on the people tab, round-tripped' },
  /* ---------- AND WHETHER A CREDENTIAL IS SITTING IN THE SOURCE -----------------------------------
     The third check here about SAFETY rather than about working, after `check-marking.js` and
     `check-handles.js` — and the only one whose subject is this repository rather than the app.
     `constants.gs` carried a real admin's real name and real four digits in a usage line for
     months, under a heading about deployment, where nothing renders and nobody re-reads. Public
     repository, permanent history: deleting the line stops the next reader finding it and
     un-publishes nothing. One question with one right answer — a PIN literal here must be the
     `0000` placeholder — and it caught its own author on its first run, naming the two lines the
     header had pasted in to explain the fault. */
  { file: 'check-secrets.js', what: 'no PIN written into the source' },
  /* ---------- AND WHETHER THE QUESTIONS IT ASKS ARE WORTH ASKING ----------------------------------
     `check-library` reads the data file and `check-flow` presses the app. Neither can see a facet
     that loads fine, draws fine and narrows NOTHING — which is what "the Find screen feels
     arbitrary" turns out to mean. Three of those had accumulated behind twenty-two green checks:
     a question fed by a literal, a sitting spelled three ways, and one word answering two
     questions with different result sets. This runs the real funnel over the real library and
     asks the arithmetic. */
  /* ---------- AND THE NINE TABS THAT BECAME FILES -------------------------------------------------
     `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns` and `copy` left
     the Settings spreadsheet and are `data/settings/*.json` now, which makes them the source of
     truth. Nothing checked that the columns `settingsInto_` reads are the columns those files have
     — and that is the fault `check-rows.js` was written for, one layer along: folding two tabs
     together once left SEVEN reads of `r.link` on rows that call the URL `source_url`, every
     checklist topic arriving with no link on it, and nothing throwing. */
  { file: 'check-settings.js', what: 'the settings files, against what the app reads off them' },
  { file: 'check-funnel.js', what: 'every question the funnel asks can narrow something' },
  { file: 'check-flow.js',    what: 'the app, actually running' },
  /* ---------- AND THE LIBRARY ITSELF, LAID OUT ---------------------------------------------------
     `check/ui.js` MEASURES THE APP AND SAMPLES THE LIBRARY. The Find screen's results are pages
     filled five either side of where you are, so one run renders about six question cards out of
     four thousand — and fifty-one rows carrying an unbreakable 128-character dotted answer line
     took the card, the pane and the page sideways at every width while `ui.js` reported nothing on
     every commit for weeks. It was measuring exactly that fault and never landed on a row with one.
     A sample is not a sweep. This lays every question out in a 320px column and asks whether it
     fits — one page load, no navigation, no lazy fill. */
  { file: 'check/cards.js',   what: 'every question in the library, laid out at phone width', slow: true },
  /* ---------- AND WHETHER A PUSH ACTUALLY ARRIVES ------------------------------------------------
     REPORTED AS "when i first go on site it shows old reels... then i hard refresh then it works
     fine???" — the service worker decided what a navigation was from `url.pathname === '/'`, and
     GitHub Pages serves this site from `/family/`. So the entry point fell through to the file
     branch and matched itself for ever: every visitor pinned to the build that first filed it
     away. `check/load.js` could never have caught it — it serves the repository at `/`, where the
     guess is true, and it measures TIMES AND BYTES, both of which a stale load flatters. This one
     asks the question neither can: after a deploy, does the browser run the new code. Deterministic,
     seven seconds, and it runs at both base paths because the base path is what hid the fault. */
  { file: 'check/deploy.js',  what: 'a deploy reaching a browser that already has the site', slow: true },
  /* ---------- AND WHETHER PRESSING ANYTHING DOES ANYTHING ----------------------------------------
     REPORTED BY THE OWNER AS "grid not working when click", and it was true: `paintBook_` repainted
     `s-stuff`, which on the Booking column is not merely the wrong element but a dead one. Every
     press on the app's main form set the right state and rebuilt nothing.

     NOT ONE CHECK HERE COULD SEE IT, and each was right about what it asks. `check-doors.js` found
     a `data-do` with a handler and a handler with a door — the wiring was perfect and the wire went
     nowhere. `check/ui.js` measures whether a control can be read and hit, which a dead one passes
     perfectly. `check-flow.js` drives bookings through `BOOKING` and never presses a cell. And the
     dispatcher catches every handler error on purpose, so `pageerror` never fires either.

     IT IS ON THE ROSTER RATHER THAN BESIDE `load.js` AND `splash.js` because its answer does not
     move with the machine — it presses and asks whether anything changed, which is the same answer
     on a busy container as on an idle one — and because the roster is the only thing that makes a
     check real. Fifty-seven seconds for both visitors. */
  { file: 'check/press.js',   what: 'press every control and see whether anything happens', slow: true },
  /* ---------- AND THE INSTRUMENT THAT WAS NEVER ON THIS LIST --------------------------------------
     `check/ui.js` IS THE APP'S MAIN MEASUREMENT — every combination of screen, state, width and
     visitor, for sideways scroll, tap targets, contrast, JS errors and content below a pane's own
     fold — and it was not on the roster. CLAUDE.md says in two places that it "has run on every
     commit for weeks"; it has run when somebody typed `npm run check:ui`. That is the exact fault
     this file records under "Three checks existed and none of them ran", and the sentence there is
     the answer: the roster is the only thing that makes a check real.

     WHAT KEPT IT OFF WAS THE CLOCK, and that is what the parallel start below is for: ninety seconds
     added to a sequential run is ninety seconds every session pays, and run beside the other three
     browser checks it costs nothing it was not already costing. */
  /* THE NUMBER IS NOT IN THIS LINE, AND IT USED TO BE. It said `132 combinations` for as long as
     there were 132 and went on saying it at 140, because a state added to `check/states.js` does
     not touch this file — the run prints its own count and this is a label somebody reads instead
     of it. Same fault as "all 18 checks pass", "one of the eighteen names" and the prose over
     `CARD_W` naming 88% and 4% while the code said 80 and 8. */
  { file: 'check/ui.js',      what: 'every screen, state, width and visitor, measured', slow: true },
  /* ---------- AND WHICH CSS RULE ACTUALLY WINS ----------------------------------------------------
     THIS STYLESHEET HAS LOST THE SAME ARGUMENT SEVEN TIMES — `.price.faint`, `--fly-ink`,
     `.bk-row.is-blank`, `.rc-total`, an SVG `text-anchor`, `.gd-sec p`, and the docket's ＋ written
     at 1.1rem and rendering at 0.80rem since the day it was written. Every one was found by a person
     reading two blocks side by side or looking at a screenshot. Seven repairs and no rule is the
     sentence this file keeps writing about `cost: 0`.

     IT ASKS ONE NARROW QUESTION: two DIFFERENT rules, the same property, the same specificity, a
     shared class, neither contained in the other, and a real element in the rendered app matching
     both — so only the order in the file decides which wins. The general form reported 1,001
     findings and was the `check-rows.js` noise generator; this reports none. */
  { file: 'check/cascade.js', what: 'which CSS rule wins, and whether order alone decided it', slow: true },
];

let failed = 0, noted = 0;
const notes = [];

/* ---------- THE FOUR THAT DRIVE A BROWSER START TOGETHER, AT THE TOP -------------------------------
   THEY ARE NOT CPU-BOUND AND NEVER WERE. Measured: `check/press.js` spends 77 seconds of wall clock
   and 4.5 seconds of processor — the rest is waiting for a page to settle, which is exactly the
   thing four processes can do at once on a four-core machine. Sequentially the four cost about three
   minutes; started together they cost the slowest of them.

   THAT IS WHAT LETS `check/ui.js` BE ON THIS LIST AT ALL. Ninety seconds added to a sequential run
   is ninety seconds every session start pays; ninety seconds beside three other browsers is free.

   EACH NEEDS ITS OWN PORT, and two of them did not have one: `check/ui.js` and `check/deploy.js`
   both defaulted to 8731, which cost nothing while they ran one after another and would have been
   one of them dying on EADDRINUSE here. Fixed in `ui.js`, with the reason written beside it.

   THE OUTPUT DOES NOT MOVE. They are printed in roster order, in their place, when the fast ones
   have finished — so a run reads exactly as it did, and a failure is still named where somebody
   expects to find it. */
const running = new Map();
for (const c of SUITE) {
  if (!c.slow) continue;
  const p = c.file.includes('/') ? path.join(dir, '..', c.file) : path.join(dir, c.file);
  if (!fs.existsSync(p)) continue;
  const t0 = Date.now();
  running.set(c.file, new Promise(done => {
    execFile(process.execPath, [p], { cwd: dir, encoding: 'utf8', timeout: 300000,
                                      maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => done({ ok: !err, out: String(stdout || '') + String(stderr || ''),
                                      secs: ((Date.now() - t0) / 1000).toFixed(1) }));
  }));
}

/* THE RUN ITSELF, IN AN ASYNC WRAPPER. The four browser checks are started above and awaited in
   their place below, and `await` at the top level of a CommonJS file is a syntax error Node
   reports as an ambiguous module format — which is four lines removed from the cause. */
(async () => {
  console.log('');
  for (const c of SUITE) {
    /* A CHECK MAY LIVE OUTSIDE `js/`. `check/cards.js` needs a browser, which is what puts it in
       `check/` beside `ui.js` rather than here — and the roster is the only thing that makes a check
       real, so the roster has to be able to name it. A `/` in the entry means "from the repo root". */
    const p = c.file.includes('/') ? path.join(dir, '..', c.file) : path.join(dir, c.file);
    if (!fs.existsSync(p)) {
      console.log('  ????  ' + c.file.padEnd(18) + 'not here');
      continue;
    }
    let out = '', ok = true, secs = '0.0';
    if (running.has(c.file)) {
      const r = await running.get(c.file);
      ok = r.ok; out = r.out; secs = r.secs;
    } else {
      const t0 = Date.now();
      try {
        out = execFileSync(process.execPath, [p], { cwd: dir, encoding: 'utf8',
                                                    timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (e) {
        ok = false;
        out = String((e.stdout || '') + (e.stderr || ''));
      }
      secs = ((Date.now() - t0) / 1000).toFixed(1);
    }

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
      /* ---------- AND IT SAYS WHEN THE TAIL IS NOT THE REPORT ---------------------------------
         `slice(-14)` IS THE LAST FOURTEEN LINES AND A LONG REPORT ENDS WITH ITS ACCEPTED LIST. So
         `check/press.js` failed here once and the fourteen lines printed under it were the twelve
         controls that are correctly quiet and a count — the part that is fine. Two full suite runs
         went into finding out what that failure said, and it could not be found from this output at
         all. That is this repository's oldest shape pointed at its own runner: "I did not manage to
         look", printed as a report.

         THE TAIL STAYS, because for most checks it IS the finding. What is added is the one fact it
         cannot carry — that there was more — and the command that prints the whole thing. */
      const lines = out.split('\n').filter(Boolean);
      lines.slice(-14).forEach(l => console.log('          ' + l));
      if (lines.length > 14) console.log('          … ' + (lines.length - 14)
        + ' earlier line(s) not shown — `node '
        + (c.file.includes('/') ? c.file : 'js/' + c.file) + '` for the whole report');
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

})();
