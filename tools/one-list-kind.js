#!/usr/bin/env node
/* @family. — tools/one-list-kind.js THE ONE LIST KIND (rule 1.75, owner 22 Nov: UNIFY NEXT 6): the owner's own lists (Docket, Tasks, Food, Archive (owner 27 Nov); Assignments
   went into the Docket, owner 27 Nov) are one list kind, declared as kinds.json `list`, each item an Item.
   (a) DECLARED: exactly those four kinds have a `list`, each of shape Item with its fields; a Docket to-do marked noAI stays tracked only (no generative AI).
   (b) SAVED THROUGH THE ONE TIDY (tools/lib/backend-vm.js): every route that writes a list (saveTodo, docketImport, the private address, the
       migration, an `item` write of a task or food row) reaches post-account.gs listTidy_ for its kind, and no other item
       tidy is left (assignmentsTidy_, docketPlanTidy_, docketPlanOf_). Run in the vm: a made-up docket (an event and a moved assignment among it) tidied twice comes back the same.
   (c) DRAWN AS ONE ITEM: the Docket's one card by shapeCard_('docket') (a noAI to-do saying so), Tasks and Food by the store card
       (kinds.json `find.from: store`); no `dk-item` group of its own is written in js/.
   Counted: each list kind against each of (a)–(c); one wrong fails the build. Run by tools/build.js. */
'use strict';
const { text, report, main, bare } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const BV = require('./lib/backend-vm.js');

const KINDS = ['docket', 'task', 'food', 'archive'];
const fnOf = (src, name) => { const m = new RegExp('\\n(?:function ' + name + '\\([^)]*\\) \\{|const ' + name + ' = )[\\s\\S]*?\\n\\}?\\n(?=\\S|$)').exec(src); return m ? m[0] : ''; };

function run() {
  const bad = [], K = SD.kinds();
  /* (a) */
  const listed = Object.keys(K).filter(k => K[k].list);
  listed.filter(k => KINDS.indexOf(k) < 0).forEach(k => bad.push(k + ' has a kinds.json `list` but is not one of the owner\'s lists'));
  KINDS.forEach(k => { const L = (K[k] || {}).list;
    if (!L) return bad.push(k + ' has no kinds.json `list`');
    if (K[k].bodyAs !== 'item') bad.push(k + ' draws its body as ' + K[k].bodyAs + ', not an item');
    if (!L.name || !Array.isArray(L.fields) || !L.fields.length || !L.store || ['whole', 'as-is'].indexOf(L.save) < 0) bad.push(k + '.list needs a name, store, fields and save (whole or as-is)'); });
  const track = (((K.docket || {}).list || {}).trackOnly || []).find(t => t.field === 'noAI');
  if (!track || !/no generative ai/i.test(track.say || '')) bad.push('docket.list.trackOnly has lost the noAI "No generative AI" rule (track only)');

  /* (b) THE ROUTES, read from the backend as served. */
  const be = text('backend/post-account.gs'), items = text('backend/items.gs'), acc = text('backend/access.gs');
  const calls = (src, fn, re, what) => { const body = fnOf(src, fn); if (!body) bad.push('backend has no ' + fn); else if (!re.test(body)) bad.push(fn + ' does not save through ' + what); };
  calls(be, 'postSaveTodo_', /todoTidy_\(/, 'todoTidy_');
  calls(be, 'todoTidy_', /listTidy_\('docket'/, "listTidy_('docket')");
  calls(be, 'docketTidy_', /listTidy_\('docket'/, "listTidy_('docket')");
  calls(be, 'postDocketImport_', /docketTidy_\(/, 'docketTidy_');
  calls(be, 'docketAddress_', /todoTidy_\(/, 'todoTidy_');
  if (!/todoTidy_\(/.test(fnOf(acc, 'docketOneList25NovRun_'))) bad.push('the docket migration (access.gs docketOneList25NovRun_) does not tidy through todoTidy_');
  calls(items, 'itemWrite_', /LIST_KINDS\[kind\]\)\s*given = listTidy_\(kind/, 'listTidy_ (a task or food row)');
  const all = BV.files(require('path').join(require('./lib/gen.js').ROOT, 'backend')).map(f => bare(text('backend/' + f), { comments: true })).join('\n');
  ['assignmentsTidy_', 'docketPlanTidy_', 'docketPlanOf_'].forEach(n => { if (new RegExp('\\b' + n + '\\b').test(all)) bad.push('backend still has ' + n + ' — tidy through listTidy_'); });

  /* (b) IN THE VM: every list kind is known to listTidy_, and a tidy twice is a tidy once. */
  const C = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } }), seen = {};
  const real = C.listTidy_;
  C.listTidy_ = function (kind, a, b) { seen[kind] = (seen[kind] || 0) + 1; return real(kind, a, b); };
  const docket = { v: 1, lists: [{ name: 'Docket', items: [{ title: 'Made-up routine item', repeat: '8h', doneOn: '2026-11-20', minutes: 10 },
    { title: 'Eggs', pick: 'Eggs on toast', pickOn: '2026-11-20', date: '', note: '' }, { title: 'Bank', done: true, doneOn: '2026-11-01' }, { title: 'Laundry', runs: 60, effort: 'hard' }] }] };
  const cell = C.todoTidy_(JSON.stringify(docket));
  if (C.todoTidy_(cell) !== cell) bad.push('the docket save changes a cell it has already saved');
  if (JSON.parse(cell).lists[0].items.some(i => i.title === 'Bank')) bad.push('the docket save kept a one-off ticked before today');
  if (!JSON.parse(cell).lists[0].items.some(i => i.pick === 'Eggs on toast')) bad.push('the docket save lost a field it does not know (pick)');
  C.docketTidy_(docket.lists);
  const asg = JSON.stringify(C.listTidy_('docket', [{ title: 'Essay', course: 'COURSE1', noAI: true, weight: '40%', date: '2026-12-01', minutes: 60 },
    { title: 'Made-up lesson', start: '2026-12-02T18:00', rrule: 'FREQ=WEEKLY;BYDAY=WE', rdate: ['2026-11-28T14:30'], exdate: ['2026-12-09T18:00'], moved: ['2026-12-16T18:00=2026-12-17T19:00'] }]));
  if (JSON.stringify(C.listTidy_('docket', JSON.parse(asg))) !== asg) bad.push('a docket to-do or event saved twice is not the same');
  if (JSON.parse(asg)[0].course !== 'COURSE1' || JSON.parse(asg)[0].weight !== 40) bad.push('a moved assignment save lost its course or weight');
  if (JSON.parse(asg)[0].noAI !== true) bad.push('a moved assignment save lost its noAI mark');
  if (JSON.parse(asg)[1].start !== '2026-12-02T18:00' || JSON.parse(asg)[1].moved[0] !== '2026-12-16T18:00=2026-12-17T19:00') bad.push('an event save lost its start or a moved occurrence');
  ['task', 'food', 'archive'].forEach(k => { const row = k === 'task' ? { title: 'Call the vet', due: '2026-11-25', done: 'no' } : k === 'archive' ? { title: 'Made-up card', fields: 'Card number: 000', text: '' } : { name: 'Rice', meal: 'dinner', price: '1.20' };
    if (JSON.stringify(C.listTidy_(k, [row], 'as-is')[0]) !== JSON.stringify(row)) bad.push('a ' + k + ' row in shape is changed by listTidy_'); });
  KINDS.forEach(k => { if (!seen[k]) bad.push(k + ' never reached listTidy_'); });

  /* (c) DRAWN AS ONE ITEM. */
  const js = text('js/map.js'), jsBare = bare(js, { comments: true });
  if (!/trackOnly/.test(fnOf(js, 'dkLine_'))) bad.push('js/map.js dkLine_ does not say a tracked-only (noAI) to-do');
  if (!/shapeCard_\('docket'/.test(fnOf(js, 'dkCard_'))) bad.push("js/map.js dkCard_ does not draw through shapeCard_('docket')");
  ['task', 'food', 'archive'].forEach(k => { if (((K[k] || {}).find || {}).from !== 'store') bad.push(k + ' is not drawn by the store card (find.from: store)'); });
  const groups = (jsBare.match(/look: 'dk-item'/g) || []).length;
  if (groups) bad.push('js/map.js writes ' + groups + " `dk-item` groups of its own");
  require('fs').readdirSync(require('path').join(require('./lib/gen.js').ROOT, 'js')).filter(f => f !== 'map.js' && f !== 'kinds.js' && f.endsWith('.js')).forEach(f => {
    if (/look: 'dk-item'/.test(bare(text('js/' + f), { comments: true }))) bad.push('js/' + f + ' draws a list item of its own'); });

  report('one-list-kind', bad, 'list kind(s) not one');
  console.log('one-list-kind: ' + KINDS.length + ' list kinds (' + KINDS.join(', ') + ') declared, saved through listTidy_ and drawn as one Item; 0 wrong');
}
module.exports = { run };
main(module, run);
