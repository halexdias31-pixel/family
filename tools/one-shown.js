#!/usr/bin/env node
/* @family. — tools/one-shown.js THE ONE-SHOWN CHECK (rule 1.75, owner 26 Nov: "Practice shows only the @family generated questions"; 26 Nov again: "past papers show too, for now"):
   one switch, data/settings/settings.json `library.show` (a list: "generated", "past-papers"; or "all"), read by js/library.js libShown_. On a phone for a child,
   with the switch on: what reaches Find is exactly the generated sets' questions (paper P-FAM-GEN-*), the exam boards' past papers' (libPastRow_: an exam_board
   and a year on the paper's row) and the inserts those come with — never a worksheet site's — and every one of those does;
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
  LIB_PAST_INS = { from: null, ids: null };
  const was = libShown_;
  if (broken) libShown_ = () => true;
  ALL_MEMO = {}; FUNNEL_MEMO = {}; ITEM_MEMO = {};
  const gen = x => libGenRow_(x) || libPastRow_(x), pastIns = libPastInserts_();
  const insOk = x => [(x.row || {}).id].concat((x.row || {}).parents || []).some(id => pastIns.has(id));
  const listed = stuffItems(), q = listed.filter(x => x && x.kind === 'question'), ins = listed.filter(x => x && x.kind === 'insert');
  const held = stuffItemsAll_().filter(x => x && x.kind === 'question');
  const offered = questionItems().filter(x => typeof qOffered_ !== 'function' || qOffered_(x));
  libShown_ = was;
  ALL_MEMO = {}; FUNNEL_MEMO = {}; ITEM_MEMO = {};
  return { q: q.length, notGen: q.filter(x => !gen(x)).length, ins: ins.length, insBad: ins.filter(x => !insOk(x)).length, held: held.length,
           genOffered: offered.filter(gen).length, offered: offered.length, made: offered.filter(libGenRow_).length, past: offered.filter(libPastRow_).length,
           insAll: stuffItemsAll_().filter(x => x && x.kind === 'insert').length, insWant: stuffItemsAll_().filter(x => x && x.kind === 'insert' && insOk(x)).length };
}, [show, broken]);

async function run() {
  const bad = [];
  const SHOW = [].concat((SET.library || {}).show || []);
  if (!SHOW.length || SHOW.some(v => ['generated', 'past-papers', 'all'].indexOf(v) === -1)) bad.push('settings.json library.show is ' + JSON.stringify((SET.library || {}).show) + ', not a list of "generated", "past-papers" or "all"');
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().length > 0 && typeof libShown_ === 'function' });
  let on, off, brk;
  try {
    on = await measure(pg, ['generated', 'past-papers'], false);
    off = await measure(pg, 'all', false);
    brk = await measure(pg, ['generated', 'past-papers'], true);
    await measure(pg, SET.library && SET.library.show, false);
  } finally { await pg.close(); }
  /* ON: the generated sets and the past papers, all of them, and only their inserts. */
  if (on.notGen) bad.push('switch on: ' + on.notGen + ' question(s) neither generated nor a past paper\'s reach Find');
  if (!on.made || !on.past) bad.push('switch on: ' + on.made + ' generated and ' + on.past + ' past-paper questions offered — one of the two is missing');
  /* KEPT: every offered question still found by its key (a saved answer, history, progress), switch on or off. */
  if (on.held !== on.offered || off.held !== off.offered) bad.push('a saved answer could lose its question: ' + on.held + ' held with the switch on, ' + off.held + ' off, of ' + on.offered);
  if (on.insBad) bad.push('switch on: ' + on.insBad + ' insert(s) no shown past paper comes with reach Find');
  if (on.ins !== on.insWant) bad.push('switch on: ' + on.ins + ' inserts in Find, not the ' + on.insWant + ' the past papers come with');
  if (!on.genOffered || on.q !== on.genOffered) bad.push('switch on: ' + on.q + ' questions in Find, not the ' + on.genOffered + ' generated and past-paper ones offered');
  /* OFF: everything returns. */
  if (off.q !== off.offered || !off.notGen) bad.push('switch off: ' + off.q + ' questions in Find, not all ' + off.offered + ' offered (' + off.notGen + ' not generated)');
  if (!off.ins) bad.push('switch off: no insert came back');
  /* THE BREAK: the switch ignored must show. */
  if (!brk.notGen) bad.push('the break (libShown_ ignored) was not caught: the check sees nothing');
  console.log('one-shown: settings.json library.show ' + JSON.stringify((SET.library || {}).show) + ' — shown: ' + on.q + ' questions (' + on.made + ' generated, ' + on.past + ' past papers), '
    + on.ins + ' inserts; hidden: ' + (on.offered - on.q) + ' questions, ' + (on.insAll - on.ins) + ' inserts; off: '
    + off.q + ' questions (' + off.notGen + ' neither), ' + off.ins + ' inserts; the break caught (' + brk.notGen + ')');
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-shown: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
