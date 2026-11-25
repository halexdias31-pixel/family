#!/usr/bin/env node
/* @family. — tools/one-list-kind.js THE ONE LIST KIND (rule 1.75, owner 22 Nov: UNIFY NEXT 6): the owner's own lists (Docket, Assignments, Tasks, Food)
   are one list kind, declared as kinds.json `list`, each item an Item.
   (a) DECLARED: exactly those four kinds have a `list`, each of shape Item with its fields; Assignments marked noAI stay tracked only (no generative AI).
   (b) SAVED THROUGH THE ONE TIDY (tools/lib/backend-vm.js): every route that writes a list (saveTodo, docketImport, the private address, the
       migration, assignmentsSave/Import, an `item` write of a task or food row) reaches post-account.gs listTidy_ for its kind, and no other item
       tidy is left (assignmentsTidy_, docketPlanTidy_, docketPlanOf_). Run in the vm: a made-up docket and assignments tidied twice come back the same.
   (c) DRAWN AS ONE ITEM: the Docket and Assignments widgets' items by js/map.js listItem_, Find's docket cards by shapeCard_('docket'), Tasks and
       Food by the store card (kinds.json `find.from: store`); no other `dk-item` group is written in js/.
   Counted: each list kind against each of (a)–(c); one wrong fails the build. Run by tools/build.js. */
'use strict';
const { text, report, main, bare } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const BV = require('./lib/backend-vm.js');

const KINDS = ['docket', 'assignment', 'task', 'food'];
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
  const track = (((K.assignment || {}).list || {}).trackOnly || []).find(t => t.field === 'noAI');
  if (!track || !/no generative ai/i.test(track.say || '')) bad.push('assignment.list.trackOnly has lost the noAI "No generative AI" rule (track only)');

  /* (b) THE ROUTES, read from the backend as served. */
  const be = text('backend/post-account.gs'), items = text('backend/items.gs'), acc = text('backend/access.gs');
  const calls = (src, fn, re, what) => { const body = fnOf(src, fn); if (!body) bad.push('backend has no ' + fn); else if (!re.test(body)) bad.push(fn + ' does not save through ' + what); };
  calls(be, 'postSaveTodo_', /todoTidy_\(/, 'todoTidy_');
  calls(be, 'todoTidy_', /listTidy_\('docket'/, "listTidy_('docket')");
  calls(be, 'docketTidy_', /listTidy_\('docket'/, "listTidy_('docket')");
  calls(be, 'postDocketImport_', /docketTidy_\(/, 'docketTidy_');
  calls(be, 'docketAddress_', /todoTidy_\(/, 'todoTidy_');
  if (!/docketTidy_\(/.test(acc)) bad.push('the docket migration (access.gs) does not tidy through docketTidy_');
  ['assignmentsRead_', 'postAssignmentsSave_', 'postAssignmentsImport_'].forEach(f => calls(be, f, /listTidy_\('assignment'/, "listTidy_('assignment')"));
  calls(items, 'itemWrite_', /LIST_KINDS\[kind\]\)\s*given = listTidy_\(kind/, 'listTidy_ (a task or food row)');
  const all = BV.files(require('path').join(require('./lib/gen.js').ROOT, 'backend')).map(f => bare(text('backend/' + f), { comments: true })).join('\n');
  ['assignmentsTidy_', 'docketPlanTidy_', 'docketPlanOf_'].forEach(n => { if (new RegExp('\\b' + n + '\\b').test(all)) bad.push('backend still has ' + n + ' — tidy through listTidy_'); });

  /* (b) IN THE VM: every list kind is known to listTidy_, and a tidy twice is a tidy once. */
  const C = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } }), seen = {};
  const real = C.listTidy_;
  C.listTidy_ = function (kind, a, b) { seen[kind] = (seen[kind] || 0) + 1; return real(kind, a, b); };
  const docket = { v: 1, lists: [{ name: 'Morning', start: '07:00', items: [{ title: 'Jesus prayer', repeat: 'daily', doneOn: '2026-11-20', minutes: 10 },
    { title: 'Eggs', pick: 'Eggs on toast', pickOn: '2026-11-20', date: '', note: '' }, { title: 'Bank', done: true, doneOn: '2026-11-01' }, { title: 'Laundry', runs: 60, effort: 'hard' }] }] };
  const cell = C.todoTidy_(JSON.stringify(docket));
  if (C.todoTidy_(cell) !== cell) bad.push('the docket save changes a cell it has already saved');
  if (JSON.parse(cell).lists[0].items.some(i => i.title === 'Bank')) bad.push('the docket save kept a one-off ticked before today');
  if (!JSON.parse(cell).lists[0].items.some(i => i.pick === 'Eggs on toast')) bad.push('the docket save lost a field it does not know (pick)');
  C.docketTidy_(docket.lists);
  const asg = JSON.stringify(C.listTidy_('assignment', [{ id: 'a1', title: 'Essay', course: 'COURSE1', noAI: true, status: 'In progress', weight: '40%' }]));
  if (JSON.stringify(C.listTidy_('assignment', JSON.parse(asg))) !== asg) bad.push('an assignment saved twice is not the same');
  if (JSON.parse(asg)[0].course !== 'COURSE1') bad.push('an assignment save lost its course');
  if (JSON.parse(asg)[0].noAI !== true) bad.push('an assignment save lost its noAI mark');
  ['task', 'food'].forEach(k => { const row = k === 'task' ? { title: 'Call the vet', due: '2026-11-25', done: 'no' } : { name: 'Rice', meal: 'dinner', price: '1.20' };
    if (JSON.stringify(C.listTidy_(k, [row], 'as-is')[0]) !== JSON.stringify(row)) bad.push('a ' + k + ' row in shape is changed by listTidy_'); });
  KINDS.forEach(k => { if (!seen[k]) bad.push(k + ' never reached listTidy_'); });

  /* (c) DRAWN AS ONE ITEM. */
  const js = text('js/map.js'), jsBare = bare(js, { comments: true });
  ['dkItem_', 'dkNowNext_'].forEach(f => { if (!/listItem_\('docket'/.test(fnOf(js, f))) bad.push('js/map.js ' + f + ' does not draw through listItem_'); });
  if (!/listItem_\('assignment'/.test(fnOf(js, 'asgItem_'))) bad.push('js/map.js asgItem_ does not draw through listItem_');
  if (!/asgTrackOnly_\(/.test(fnOf(js, 'asgItem_'))) bad.push('js/map.js asgItem_ does not say a tracked-only (noAI) assignment');
  if (!/shapeCard_\('docket'/.test(fnOf(js, 'dkCard_'))) bad.push("js/map.js dkCard_ does not draw through shapeCard_('docket')");
  ['task', 'food'].forEach(k => { if (((K[k] || {}).find || {}).from !== 'store') bad.push(k + ' is not drawn by the store card (find.from: store)'); });
  const groups = (jsBare.match(/look: 'dk-item'/g) || []).length;
  if (groups !== 1) bad.push('js/map.js writes ' + groups + " `dk-item` groups; only listItem_ may");
  require('fs').readdirSync(require('path').join(require('./lib/gen.js').ROOT, 'js')).filter(f => f !== 'map.js' && f.endsWith('.js')).forEach(f => {
    if (/look: 'dk-item'/.test(bare(text('js/' + f), { comments: true }))) bad.push('js/' + f + ' draws a list item of its own'); });

  report('one-list-kind', bad, 'list kind(s) not one');
  console.log('one-list-kind: ' + KINDS.length + ' list kinds (' + KINDS.join(', ') + ') declared, saved through listTidy_ and drawn as one Item; 0 wrong');
}
module.exports = { run };
main(module, run);
