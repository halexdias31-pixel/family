/* ==================================================================================================
   @family. — check-lifecycle.js

   AUDITING A PROCESS, WITHOUT ANYBODY HAVING TO BOOK ANYTHING.

   A static card can be checked by looking at it. A LIFECYCLE cannot: to see what a booking looks
   like after a tutor applies, is chosen, is paid for and then withdraws, somebody has to do all
   five of those things, in order, with two accounts, and then look. That is twenty minutes to test
   one path, and there are a dozen paths, so in practice none of them is ever tested twice — which
   is exactly how a client-side Accept sat in `createJob` marking every family as having agreed to a
   session nobody had read.

   THE WAY OUT IS THAT THE RULES ARE ALREADY PURE. `participantsOf` reads a list of event rows and
   folds them into a roster. It touches no spreadsheet: `eventsForJob` hands it rows and everything
   after that is arithmetic on names and words. So the events can be FABRICATED — written here, in
   order, the way a booking would have written them — and the real rule run over them.

   WHAT THIS IS NOT. It is not a copy of the rules. It reads `booking.gs` off disk and runs the
   actual `participantsOf`, so a change to the fold changes what this tests. A test that
   reimplements the thing it tests passes for ever and proves nothing.

   RUN IT:  node js/check-lifecycle.js

================================================================================================== */

const fs = require('fs');
const path = require('path');

/* ---------- THE REAL RULE, LIFTED OUT AND GIVEN FAKE EVENTS --------------------------------------
   `participantsOf` and the four functions that read it are cut out of booking.gs by name and
   evaluated with stubs for the two things they touch that we are not testing: `S` (string-ify) and
   `eventsForJob` (the sheet). Everything else — the vocabulary, the fold, the withdrawal rule — is
   the deployed code.

   IF THE CUT FAILS the harness says so and stops, rather than quietly testing nothing. A checker
   that silently tests an empty string is worse than no checker. */
function loadRules(dir) {
  const gs = p => fs.readFileSync(path.join(dir, p), 'utf8');
  let booking, constants;
  try { booking = gs('booking.gs'); constants = gs('constants.gs'); }
  catch (err) { return { error: 'cannot read the .gs files beside this checker: ' + err.message }; }

  const take = (src, name, until) => {
    const i = src.indexOf('function ' + name + '(');
    if (i < 0) return null;
    const j = until ? src.indexOf('\nfunction ' + until, i) : -1;
    return src.slice(i, j > 0 ? j : src.indexOf('\n}\n', i) + 3);
  };

  const BM  = (constants.match(/const BM\s*=\s*\{[\s\S]*?\};/) || [])[0];
  const ACT = (constants.match(/const ACT\s*=\s*\{[\s\S]*?\};/) || [])[0];
  const fold = take(booking, 'participantsOf', 'clientsIn');
  const rest = ['clientsIn', 'tutorsIn', 'tutorStatusOf', 'jobStatusOf']
    .map(n => take(booking, n)).filter(Boolean).join('\n');

  const missing = [!BM && 'BM', !ACT && 'ACT', !fold && 'participantsOf'].filter(Boolean);
  if (missing.length) return { error: 'could not find ' + missing.join(', ') + ' — has it been renamed?' };

  let EVENTS = [];
  const sandbox = { EVENTS: [] };
  const src = `
    ${BM}
    ${ACT}
    const S = v => (v === null || v === undefined) ? '' : String(v).trim();
    const norm = v => S(v).toLowerCase();
    const eventsForJob = () => EVENTS;
    ${fold}
    ${rest}
    ({ participantsOf, clientsIn, tutorsIn, tutorStatusOf, jobStatusOf,
       BM, ACT, feed: rows => { EVENTS = rows; } });
  `;
  try { return eval(src); } catch (err) { return { error: 'the rules did not evaluate: ' + err.message }; }
}

/* ---------- A BOOKING, WRITTEN AS THE THINGS THAT HAPPENED --------------------------------------
   Each step is one event, in the order the app would have written it. Reading a case top to bottom
   IS reading the story, which is the property that makes this worth having: a path nobody has
   walked in the app can be walked here in four lines. */
const ev = (actor, role, action, target) => ({ actor, role, action, target: target || '' });

function run() {
  const R = loadRules(__dirname.replace(/\/js$/, '/backend'));
  if (R.error) { console.log('COULD NOT RUN — ' + R.error); process.exitCode = 1; return; }
  const { BM } = R;

  /* WHAT EACH PATH SHOULD LEAVE BEHIND. Written as the answer a person would give, not as the
     internal words, so a wrong expectation reads as wrong rather than as unfamiliar. */
  const cases = [

    { name: 'Path A — family names a tutor, nobody has accepted yet',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.ACCEPT),
      ],
      /* THE ONE THIS HARNESS WAS WRITTEN FOR. Until 1 Sep the third event was
         `Daniel · client · Accept · target Sasha`, and the mutual-agreement rule marked DANIEL
         agreed as well — so the card offered a Pay button on a request nobody had read. Stated as
         an expectation, that failure can never come back unnoticed. */
      want: { Daniel: BM.WAITING, Sasha: BM.AGREED } },

    { name: 'Path A — then the business accepts',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.ACCEPT),
        ev('Daniel', 'client', R.ACT.ACCEPT, 'Sasha'),
      ],
      want: { Daniel: BM.AGREED, Sasha: BM.AGREED } },

    { name: 'Path B — three apply, one is chosen, the others go',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.REQUEST),
        ev('George', 'tutor',  R.ACT.REQUEST),
        ev('Halex',  'tutor',  R.ACT.REQUEST),
        ev('Daniel', 'client', R.ACT.ACCEPT,  'Sasha'),
        ev('Daniel', 'client', R.ACT.DECLINE, 'George'),
        ev('Daniel', 'client', R.ACT.DECLINE, 'Halex'),
      ],
      want: { Daniel: BM.AGREED, Sasha: BM.AGREED },
      gone: ['George', 'Halex'] },

    { name: 'Paid, then the family withdraws — the seat MUST stay, with the money owed',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.ACCEPT),
        ev('Daniel', 'client', R.ACT.ACCEPT, 'Sasha'),
        ev('Daniel', 'client', R.ACT.PAY),
        ev('Daniel', 'client', 'Confirm'),
        ev('Daniel', 'client', R.ACT.WITHDRAW),
      ],
      /* THE WHOLE REASON THE WITHDRAWAL RULE IS NOT A `delete`. If this ever passes with Daniel
         absent, a refund has become invisible and nothing else in the system will mention it. */
      stays: 'Daniel' },

    { name: 'Never paid, then withdraws — the seat goes',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Daniel', 'client', R.ACT.WITHDRAW),
      ],
      gone: ['Daniel'] },

    { name: 'Terms edited — everyone drops to un-ready, including whoever changed them',
      events: [
        ev('Daniel', 'client', R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.REQUEST),
        ev('Sasha',  'tutor',  R.ACT.ACCEPT),
        ev('Daniel', 'client', R.ACT.ACCEPT, 'Sasha'),
        ev('Daniel', 'client', R.ACT.EDIT),
      ],
      /* A CHANGE NOBODY RE-APPROVES MUST NOT PROCEED TO PAYMENT. That is the whole point of the
         lobby, and it is one line in the fold that nothing else tests. */
      want: { Daniel: BM.WAITING, Sasha: BM.WAITING } },
  ];

  const bad = [];
  cases.forEach(c => {
    R.feed(c.events.map((e, i) => Object.assign({ job_id: 'J1', at: i }, e)));
    const who = {};
    R.participantsOf('J1').forEach(p => { who[p.name] = p.status; });

    Object.keys(c.want || {}).forEach(name => {
      if (who[name] !== c.want[name]) {
        bad.push(c.name + '\n    ' + name + ' should be "' + c.want[name]
                 + '" and is "' + (who[name] === undefined ? 'not on the roster' : who[name]) + '"');
      }
    });
    (c.gone || []).forEach(name => {
      if (who[name] !== undefined) {
        bad.push(c.name + '\n    ' + name + ' should be off the roster and is "' + who[name] + '"');
      }
    });
    if (c.stays && who[c.stays] === undefined) {
      bad.push(c.name + '\n    ' + c.stays + ' is off the roster entirely — a refund owed has become'
               + ' invisible, and nothing else in this system mentions it');
    }
  });

  console.log('BOOKING LIFECYCLES  (' + cases.length + ' paths, ' + bad.length + ' wrong)');
  if (!bad.length) { console.log('  every path ends where it should.'); return; }
  bad.forEach(b => console.log('  ✗ ' + b));
  process.exitCode = 1;
}

run();
