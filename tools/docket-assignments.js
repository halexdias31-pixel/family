#!/usr/bin/env node
/* @family. — tools/docket-assignments.js ASSIGNMENTS ARE DOCKET TO-DOS (rule 1.75; owner 27 Nov: "assignments stop being their own store: each becomes a
   Docket to-do with a date (due), minutes (estimated from its word count) and extra columns course / weight / mark / no-AI. Migrate the 6 existing
   assignments, don't drop them"). backend/access.gs assignmentsToDocket27NovRun_ in the backend vm on six made-up assignments of two made-up people:
   every one is on its person's own Docket (none dropped, one already there by title not twice), its due day the date, its time the finish-by, its words
   the minutes, its course, weight, mark and noAI kept; a handed-in one ticked for good and still there after a save; a person with no Docket gets the
   one list; the backup tab holds both old cells first; the assignments cell emptied; a re-run a no-op; MIGRATIONS runs it; the Assignments tool and its
   actions are gone. Each rule proved by breaking the result (--prove prints the count). No real text here, by design. Run by tools/build.js. */
'use strict';
const { report, main, text } = require('./lib/gen.js');
const { world } = require('./docket-onelist.js');

const ASG = () => [
  { id: 'a1', title: 'Made-up essay', course: 'COURSE1', kind: 'essay', amount: 2000, unit: 'words', due: '2026-12-10', time: '17:00', weight: 40, status: 'in-progress', noAI: true, note: 'made-up note' },
  { id: 'a2', title: 'Made-up report', course: 'COURSE2', amount: 500, unit: 'words', due: '2026-12-01', weight: 20, status: 'marked', mark: '68%' },
  { id: 'a3', title: 'Made-up quiz', course: 'COURSE1', due: '2026-11-30', status: 'submitted' },
  { id: 'a4', title: 'Made-up existing', course: 'COURSE3', due: '2026-12-05', status: 'not-started' },
];
const KID = () => [{ id: 'b1', title: 'Made-up poster', course: 'COURSE4', due: '2026-12-03', status: 'not-started' },
  { id: 'b2', title: 'Made-up reading', amount: 30, unit: 'pages', status: 'not-started' }];
function scene() {
  const w = world(() => [{ name: 'Docket', items: [{ title: 'Made-up cycle', repeat: '8h' }, { title: 'made-up EXISTING' }] }]);
  const rows = w.B.tabs.items.v, own = rows.find(r => r[0] === 'P-OWN'), p = JSON.parse(own[2]);
  p.assignments = JSON.stringify({ v: 1, assignments: ASG() }); own[2] = JSON.stringify(p);
  rows.push(['P-KID', 'person', JSON.stringify({ person_id: 'P-KID', role: 'student', first_name: 'Made', last_name: 'Kid', email: 'kid@example.test', assignments: JSON.stringify({ v: 1, assignments: KID() }) })]);
  const person = id => JSON.parse(rows.find(r => r[0] === id)[2]), was = { own: w.cell(), asg: p.assignments };
  const run = () => { w.ctx.clearCache(); return w.ctx.assignmentsToDocket27NovRun_(); };
  const said = run(), cellOwn = w.cell(), kid = person('P-KID'), again = run();
  w.ctx.clearCache();
  const saved = JSON.parse(w.ctx.todoTidy_(cellOwn)).lists[0].items;
  return { said, again, was, cellOwn, cellOwnAgain: w.cell(), own: JSON.parse(cellOwn).lists[0].items, kid: JSON.parse(kid.todo || '{}'), kidAsg: kid.assignments,
    ownAsg: person('P-OWN').assignments, saved, backup: w.B.tabs.backup_assignments_docket_27nov };
}
const T = (items, t) => items.find(i => i.title === t) || null;
const RULES = [
  ['none dropped: the owner\'s three new ones after the two already there, in order', m => m.own.map(i => i.title).join('|') === 'Made-up cycle|made-up EXISTING|Made-up essay|Made-up report|Made-up quiz'],
  ['one already there by title (any case) is not added twice', m => m.own.filter(i => /existing/i.test(i.title)).length === 1],
  ['the due day is the date, the time the finish-by', m => { const e = T(m.own, 'Made-up essay'); return e.date === '2026-12-10' && e.until === '17:00'; }],
  ['minutes from the words (2000 words: 480; 500: 120); no words, no minutes', m => T(m.own, 'Made-up essay').minutes === 480 && T(m.own, 'Made-up report').minutes === 120 && T(m.own, 'Made-up quiz').minutes === undefined],
  ['course, weight and mark kept', m => { const e = T(m.own, 'Made-up essay'), r = T(m.own, 'Made-up report'); return e.course === 'COURSE1' && e.weight === 40 && r.mark === '68%' && r.weight === 20; }],
  ['noAI kept (tracked only)', m => T(m.own, 'Made-up essay').noAI === true && !T(m.own, 'Made-up report').noAI],
  ['a handed-in one is ticked for good, the rest not', m => T(m.own, 'Made-up report').done === true && T(m.own, 'Made-up quiz').done === true && !T(m.own, 'Made-up essay').done],
  ['a ticked one is still there after a save', m => !!T(m.saved, 'Made-up report') && !!T(m.saved, 'Made-up quiz')],
  ['a person with no Docket gets the one list, both theirs on it', m => Array.isArray(m.kid.lists) && m.kid.lists[0].name === 'Docket' && m.kid.lists[0].items.map(i => i.title).join('|') === 'Made-up poster|Made-up reading'],
  ['the backup holds each person\'s old assignments and todo cells, once', m => !!m.backup && m.backup.v.length === 2 && m.backup.v[0][2] === m.was.asg && m.backup.v[0][3] === m.was.own],
  ['the assignments cells are emptied', m => m.ownAsg === '' && m.kidAsg === ''],
  ['a re-run is a no-op', m => /nothing to do/.test(m.again) && m.cellOwnAgain === m.cellOwn && m.backup.v.length === 2],
];
function prove(m) {
  const cp = o => JSON.parse(JSON.stringify(o));
  const breaks = [x => { x.own.pop(); }, x => { x.own.push({ title: 'Made-up existing' }); }, x => { delete x.own[2].date; }, x => { delete x.own[2].until; },
    x => { x.own[2].minutes = 2000; }, x => { delete x.own[3].minutes; }, x => { delete x.own[2].course; }, x => { delete x.own[3].mark; }, x => { delete x.own[2].noAI; },
    x => { delete x.own[3].done; }, x => { x.own[2].done = true; }, x => { x.saved = []; }, x => { x.kid = {}; }, x => { x.backup = null; }, x => { x.ownAsg = 'x'; },
    x => { x.cellOwnAgain = 'x'; }];
  return breaks.map((b, i) => { const x = Object.assign({}, m, { own: cp(m.own), saved: cp(m.saved), kid: cp(m.kid) }); b(x);
    return RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0).length ? breaks.length : 0;
}
function run() {
  const bad = [], checks = [];
  let m = null; try { m = scene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['assignmentsToDocket27NovRun_ ran', () => false]);
  else {
    RULES.forEach(([n, f]) => checks.push([n, () => f(m)]));
    checks.push(['every break of the result caught', () => { const missed = prove(m);
      if (missed || process.argv.includes('--prove')) console.log('  --prove: ' + (missed ? 'a break was missed' : 'every break caught'));
      return !missed; }]);
  }
  const acc = text('backend/access.gs'), map = text('js/map.js'), actions = text('data/settings/actions.json');
  checks.push(['MIGRATIONS runs it, retried until it works', () => /\{ id: 'assignments-docket-27nov',\s*retry: true,[\s\S]*?run: \(\) => assignmentsToDocket27NovRun_\(\) \}/.test(acc)]);
  checks.push(['the Assignments tool and its actions are gone', () => !/id: 'assignments'/.test(map) && !/assignmentsSave|assignmentsOf|assignmentsImport|assignment:save/.test(actions)]);
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-assignments: ' + checks.length + ' rules' + (m ? ' (' + m.said + ')' : '') + '; ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-assignments', bad, 'assignment move rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
