#!/usr/bin/env node
/* @family. — tools/one-shown.js THE ONE-SHOWN CHECK (rule 1.75, owner 26 Nov: "Practice shows only the @family generated questions"):
   one switch, data/settings/settings.json `library.show` ("generated" or "all"), read by js/library.js libShown_. On a phone for a child,
   with the switch on: no question or insert that is not a generated set's (paper P-FAM-GEN-*) reaches Find, and the generated ones all do;
   flipped off in the page: everything offered returns (every question, the inserts). The rows are never cut (data/questions.json keeps them),
   and every offered question is still held by its key (saved answers, history, progress) either way; the off count is measured, never written here. A break (libShown_ ignored) is made every run and must be caught. Run by tools/build.js after `bundle`. */
'use strict';
const { main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');
const SD = require('./lib/site-data.js');
const SET = SD.raw('data/settings/settings.json');

/* WHAT FIND LISTS right now (the funnel, stuffItems) and what it still holds by key (stuffItemsAll_: saved answers, history, progress),
   with the switch as given, the memos emptied first; `broken` ignores the switch. */
const measure = (pg, show, broken) => pg.evaluate(([show, broken]) => {
  if (show) SHARED_SETTINGS.library = Object.assign({}, SHARED_SETTINGS.library, { show });
  const was = libShown_;
  if (broken) libShown_ = () => true;
  ALL_MEMO = {}; FUNNEL_MEMO = {}; ITEM_MEMO = {};
  const gen = x => libGenRow_(x);
  const listed = stuffItems(), q = listed.filter(x => x && x.kind === 'question'), ins = listed.filter(x => x && x.kind === 'insert');
  const held = stuffItemsAll_().filter(x => x && x.kind === 'question');
  const offered = questionItems().filter(x => typeof qOffered_ !== 'function' || qOffered_(x));
  libShown_ = was;
  ALL_MEMO = {}; FUNNEL_MEMO = {}; ITEM_MEMO = {};
  return { q: q.length, notGen: q.filter(x => !gen(x)).length, ins: ins.length, held: held.length,
           genOffered: offered.filter(gen).length, offered: offered.length };
}, [show, broken]);

async function run() {
  const bad = [];
  if (!SET.library || ['generated', 'all'].indexOf(SET.library.show) === -1) bad.push('settings.json library.show is "' + ((SET.library || {}).show || '') + '", not "generated" or "all"');
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().length > 0 && typeof libShown_ === 'function' });
  let on, off, brk;
  try {
    on = await measure(pg, 'generated', false);
    off = await measure(pg, 'all', false);
    brk = await measure(pg, 'generated', true);
    await measure(pg, SET.library && SET.library.show, false);
  } finally { await pg.close(); }
  /* ON: only the generated sets, all of them, no insert. */
  if (on.notGen) bad.push('switch on: ' + on.notGen + ' question(s) not of a generated set reach Find');
  /* KEPT: every offered question still found by its key (a saved answer, history, progress), switch on or off. */
  if (on.held !== on.offered || off.held !== off.offered) bad.push('a saved answer could lose its question: ' + on.held + ' held with the switch on, ' + off.held + ' off, of ' + on.offered);
  if (on.ins) bad.push('switch on: ' + on.ins + ' insert(s) reach Find');
  if (!on.genOffered || on.q !== on.genOffered) bad.push('switch on: ' + on.q + ' questions in Find, not the ' + on.genOffered + ' generated ones offered');
  /* OFF: everything returns. */
  if (off.q !== off.offered || !off.notGen) bad.push('switch off: ' + off.q + ' questions in Find, not all ' + off.offered + ' offered (' + off.notGen + ' not generated)');
  if (!off.ins) bad.push('switch off: no insert came back');
  /* THE BREAK: the switch ignored must show. */
  if (!brk.notGen) bad.push('the break (libShown_ ignored) was not caught: the check sees nothing');
  console.log('one-shown: settings.json library.show "' + (SET.library || {}).show + '" — on: ' + on.q + ' generated questions in Find, ' + on.ins + ' inserts; off: '
    + off.q + ' questions (' + off.notGen + ' not generated), ' + off.ins + ' inserts; the break caught (' + brk.notGen + ')');
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-shown: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
