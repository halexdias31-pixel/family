#!/usr/bin/env node
/* @family. — tools/one-answer.js THE ONE-ANSWER-FORMAT CHECK (rule 1.75, owner 23 Nov: UNIFY AFTER 7): every pick question (two or more
   `choices`, not an ordering) keeps its right answer as `choice_right` in the options' letters ("C", "A,D": distinct, A-first, each an
   option it has), the one key the site's card, the Sunday email and the markers read; its working is the note in `answer`, with no
   letter head that only repeats the key. Counted site-wide: every question row of the library. A pick with no key yet is counted, not failed.
   Fails the build on any other key. Run by tools/build.js. */
'use strict';
const L = require('./lib/lib-full.js'), P = require('./lib/pick-key.js');
const { main } = require('./lib/gen.js');

function run() {
  L.needWords('the pick questions\' keys');
  const words = L.readPrivate('questions') || {}, cards = P.cardsById(), bad = [];
  let picks = 0, keyed = 0, open = 0;
  for (const id of Object.keys(words)) {
    const w = words[id];
    if (!P.isPick(w, cards[id])) continue;
    picks++;
    const why = P.keyBad(w);
    if (why === 'no key') { open++; continue; }
    if (why) { bad.push(id + ': ' + why); continue; }
    if (P.noteOf(w.answer, w.choice_right) !== null) { bad.push(id + ': its note opens with its key ("' + String(w.answer).slice(0, 40) + '")'); continue; }
    keyed++;
  }
  console.log('one-answer: ' + keyed + '/' + (picks - open) + ' keyed pick questions with their key in letters (' + picks + ' pick questions of '
    + Object.keys(words).length + ' rows; ' + open + ' with no key yet)');
  bad.slice(0, 20).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('one-answer: ' + bad.length + ' pick question(s) not in the one answer format (node tools/content.js picks --apply)');
}
module.exports = { run };
main(module, run);
