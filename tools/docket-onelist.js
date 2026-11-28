#!/usr/bin/env node
/* @family. — tools/docket-onelist.js THE DOCKET IS ONE LIST, NAMES ONLY (rule 1.75, 1.82; owner 25 Nov night: "simplest, most stable").
   (1) THE CYCLES (06:00, 12:00, 18:00; owner 28 Nov): js/map.js dkOn_/dkIsDone_/dkTick_, as served on a made-up list: an 8h item ticked in one cycle is back in the next, a one-off
   keeps its tick and day; each rule proved by mutating the served source. (The order itself is the plan's, owner 27 Nov: tools/docket-plan.js.)
   (2) THE ONE-OFF JOB: backend/access.gs docketOneList25NovRun_ in the backend vm on a made-up two-list docket: one list "Docket", cycle items first,
   each item only title, repeat ('8h'), date and done state ("10-minute tidy" renamed "Tidy room"; a slot item its options' names only, 27 Nov; the cell's `slots` gone); the backup
   tab holds the whole old cell, first; a re-run is a no-op; a cell that is not the two lists is refused unchanged; over the size cap nothing is saved;
   each rule proved by mutation. No real item text here, by design. Run by tools/build.js. */
'use strict';
const { report, main, text } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');

const OWNER = 'owner@example.test', DAY = '2026-11-25';
/* THE BACKEND VM WITH ONE OWNER whose `todo` cell holds `docket()`'s lists (and `extra` beside them); tools/docket-inbox.js uses it too. */
function world(docket, extra) {
  const ctx = load({ at: true, google: { Utilities: { formatDate: (d, tz, f) => (f === 'yyyy-MM-dd' ? DAY : DAY + ' 10:00'), getUuid: () => 'u' } } }), B = book();
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify(Object.assign({ v: 1 }, extra || {}, { lists: docket() })) };
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1'], ['owner_email', 'setting', JSON.stringify({ key: 'owner_email', value: OWNER })],
    ['P-OWN', 'person', JSON.stringify(person)]]);
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  B.tabs.items.getParent = () => B.ss;
  const cell = () => JSON.parse(B.tabs.items.v.find(r => r[0] === 'P-OWN')[2]).todo;
  const setCellRaw = s => { const r = B.tabs.items.v.find(x => x[0] === 'P-OWN'), p = JSON.parse(r[2]); p.todo = s; r[2] = JSON.stringify(p); };
  return { ctx, B, cell, setCellRaw, onelist: () => { ctx.clearCache(); return ctx.docketOneList25NovRun_(); } };
}

/* ---------- (1) THE ORDER ---------- */
const sorter = src => {
  const c = n => { const m = new RegExp('\\nconst ' + n + ' = (.*);\\n').exec(src); if (!m) throw new Error('docket-onelist: no ' + n + ' in js/map.js'); return 'const ' + n + ' = ' + m[1] + ';\n'; };
  const f = n => { const m = new RegExp('\\nfunction ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src); if (!m) throw new Error('docket-onelist: no ' + n + ' in js/map.js'); return m[0]; };
  return new Function(c('dkMin_') + c('dkIso_') + c('dkEv_') + c('dkRep_') + c('DK_CYCLE') + c('dkOn_') + c('dkIsDone_') + f('dkOccur_') + f('dkSlot_') + f('dkTick_') + f('dkOption_') + 'return { dkTick_, dkIsDone_ };')();
};
const LIST = () => [{ title: 'Undated A' }, { title: 'Cycle B', repeat: '8h', doneOn: DAY + '/1' }, { title: 'Cycle C', repeat: '8h', doneOn: DAY + '/2' },
  { title: 'Later D', date: '2026-12-01' }, { title: 'Soon E', date: '2026-11-28' }, { title: 'Late F', date: '2026-11-20' }, { title: 'Late G', date: '2026-11-01' },
  { title: 'Done H', done: true, doneOn: DAY }, { title: 'Undated I' }, { title: 'Today J', date: DAY }, { title: 'Cycle K', repeat: '8h' }, { title: 'Cycle L', repeat: '8h', runs: 60 }, { title: 'Cycle M', repeat: '8h', runs: 120 }];
const T = (items, ix) => ix.map(i => items[i].title).join('|');
const ORDER_RULES = [
  ['an 8h item ticked in the 12:00 cycle is done there, back at 18:00; one of the 06:00 cycle is open at 13:00; the ticked one-off stays done', Sx => { const L = LIST();
    return Sx.dkIsDone_(L[2], DAY + ' 13:00') && !Sx.dkIsDone_(L[2], DAY + ' 18:00') && !Sx.dkIsDone_(L[1], DAY + ' 13:00') && Sx.dkIsDone_(L[7], DAY + ' 23:00') && !Sx.dkIsDone_(L[0], DAY + ' 10:00'); }],
  ['the cycles start at 06:00, 12:00, 18:00: ticked at 11:59 it is open again at 12:00; ticked at 18:30 it stays done until 06:00; an untick clears it', Sx => { const L = LIST();
    Sx.dkTick_(L, 10, true, DAY + ' 11:59'); const a = L[10].doneOn === DAY + '/1' && Sx.dkIsDone_(L[10], DAY + ' 11:59') && !Sx.dkIsDone_(L[10], DAY + ' 12:00');
    Sx.dkTick_(L, 10, true, DAY + ' 18:30'); const b = L[10].doneOn === DAY + '/3' && Sx.dkIsDone_(L[10], '2026-11-26 05:59') && !Sx.dkIsDone_(L[10], '2026-11-26 06:00');
    Sx.dkTick_(L, 10, false, DAY + ' 18:30'); return a && b && !L[10].doneOn; }],
  ['a one-off tick sets done and the day', Sx => { const L = LIST(); Sx.dkTick_(L, 0, true, DAY + ' 10:00'); return L[0].done === true && L[0].doneOn === DAY; }],
];
const ORDER_MUTS = [
  ['the first cycle at 08:00', s => s.replace("const DK_CYCLE = ['06:00', '12:00', '18:00'];", "const DK_CYCLE = ['08:00', '12:00', '18:00'];")],
  ['a new cycle at midnight', s => s.replace("if (n) return now.slice(0, 10) + '/' + n;", "return now.slice(0, 10) + '/' + n;")],
  ['an 8h item done all day', s => s.replace("const dkIsDone_ = (i, now) => (dkRep_(i) ? i.doneOn === dkOn_(now)", "const dkIsDone_ = (i, now) => (dkRep_(i) ? String(i.doneOn || '').slice(0, 10) === String(now).slice(0, 10)")],
  ['a one-off tick without its day', s => s.replace("it.doneOn = on ? String(now).slice(0, 10) : '';", "it.doneOn = '';")],
  ['an 8h untick left ticked', s => s.replace("if (dkRep_(it)) it.doneOn = on ? dkOn_(now) : '';", "if (dkRep_(it)) it.doneOn = dkOn_(now);")],
];

/* ---------- (2) THE ONE-OFF JOB ---------- */
const it = (title, x) => Object.assign({ title }, x || {});
const TWO = () => [
  { name: 'Every 8 hours', start: '00:00', items: [it('Prayer', { repeat: '8h', slot: 'prayer', note: 'made-up note', pick: 'x', pickOn: DAY + '/1' }),
    it('Glass of water', { repeat: '8h', doneOn: DAY + '/1', minutes: 2, place: 'home', runs: 60 }), it('10-minute tidy', { repeat: '8h', effort: 'easy', runs: 0 }),
    it('Protein', { repeat: '8h', slot: 'Protein' }), it('Exercise', { repeat: 'daily', slot: 'Exercise', doneOn: DAY })] },
  { name: '@ Desk', items: [it('Made-up one-off', { note: 'made-up desk note', minutes: 20 }), it('Made-up dated', { date: '2026-12-02', time: '09:00' }),
    it('Made-up ticked', { done: true, doneOn: DAY, covers: ['x'] }), it('', { note: 'no title' })] },
];
const KEEP = ['title', 'repeat', 'date', 'done', 'doneOn', 'runs', 'options'];
const ITEMS = m => m.after.lists[0].items;
const JOB_RULES = [
  ['one list named Docket', m => m.after.lists.length === 1 && m.after.lists[0].name === 'Docket' && Object.keys(m.after.lists[0]).join() === 'name,items'],
  ['the cycle first, then the desk, every titled item kept, in order', m => ITEMS(m).map(i => i.title).join('|') === 'Prayer|Glass of water|Tidy room|Protein|Exercise|Made-up one-off|Made-up dated|Made-up ticked'],
  ['each item keeps only title, repeat, date and done state', m => ITEMS(m).every(i => Object.keys(i).every(k => KEEP.indexOf(k) >= 0))],
  ['8h stays 8h, daily becomes 8h, one-offs repeat nothing', m => ITEMS(m).slice(0, 5).every(i => i.repeat === '8h') && ITEMS(m).slice(5).every(i => !i.repeat)],
  ['done state kept: the third of an 8h item, a one-off\'s done and day', m => ITEMS(m)[1].doneOn === DAY + '/1' && !ITEMS(m)[4].doneOn
    && ITEMS(m)[7].done === true && ITEMS(m)[7].doneOn === DAY && !ITEMS(m)[5].done],
  ['runs (minutes by itself) kept where set, none where 0', m => ITEMS(m)[1].runs === 60 && !('runs' in ITEMS(m)[2])],
  ['a one-off\'s date kept', m => ITEMS(m)[6].date === '2026-12-02' && !ITEMS(m)[5].date],
  ['10-minute tidy renamed Tidy room', m => !ITEMS(m).some(i => /10-minute/i.test(i.title)) && ITEMS(m)[2].title === 'Tidy room'],
  ['a slot item keeps its slot\'s option names as options, no note; a slot with none, none', m => JSON.stringify(ITEMS(m)[0].options) === '["made-up option"]' && !('options' in ITEMS(m)[3])],
  ['the cell keeps no slots, start, note or planner field', m => !('slots' in m.after) && !/"(slot|slots|note|minutes|place|effort|covers|pick|time|start)"/.test(m.cell)],
  ['the backup holds the whole old cell, once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was && /one list "Docket"/.test(m.backup.v[0][2])],
  ['under DOCKET_CELL_MAX', m => m.cell.length <= m.cap],
];
function scene() {
  const w = world(TWO, { slots: [{ name: 'Prayer', need: 1, options: [{ name: 'made-up option', note: 'made-up text' }] }] }), was = w.cell();
  const said = w.onelist(), cell = w.cell(), again = w.onelist();
  return { said, again, was, cell, cellAgain: w.cell(), after: JSON.parse(cell), backup: w.B.tabs.backup_docket_onelist_25nov,
    backupAgain: w.B.tabs.backup_docket_onelist_25nov.v.length, cap: w.ctx.$('DOCKET_CELL_MAX') };
}
const OTHER = [
  ['a re-run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell && m.backupAgain === 1],
  ['a cell that is not the two lists is refused, unchanged, no backup', () => { const w = world(() => [{ name: 'Morning', items: [it('a')] }]), was = w.cell();
    let threw = false; try { w.onelist(); } catch (e) { threw = true; } return threw && w.cell() === was && !w.B.tabs.backup_docket_onelist_25nov; }],
  ['over the size cap nothing is saved', () => { const w = world(TWO), cap = w.ctx.$('DOCKET_CELL_MAX');
    const big = () => [{ name: 'Every 8 hours', items: [] }, { name: '@ Desk', items: Array.from({ length: Math.ceil(cap / 280) + 5 }, (_, k) => it('m' + k + 'x'.repeat(280))) }];
    const w2 = world(big), was = w2.cell(); let threw = false; try { w2.onelist(); } catch (e) { threw = true; } return threw && w2.cell() === was; }],
];
function proveJob(m) {
  const cp = o => JSON.parse(JSON.stringify(o)), wa = a => Object.assign({}, m, { after: a, cell: JSON.stringify(a) });
  const breaks = [
    a => { a.lists.push({ name: '@ Desk', items: [] }); }, a => { a.lists[0].name = 'Every 8 hours'; }, a => { a.lists[0].items.reverse(); },
    a => { a.lists[0].items.pop(); }, a => { a.lists[0].items[0].note = 'x'; }, a => { a.lists[0].items[4].repeat = 'daily'; },
    a => { delete a.lists[0].items[1].doneOn; }, a => { a.lists[0].items[7].done = false; }, a => { delete a.lists[0].items[6].date; }, a => { delete a.lists[0].items[1].runs; },
    a => { a.lists[0].items[2].title = '10-minute tidy'; }, a => { delete a.lists[0].items[0].options; }, a => { a.lists[0].items[0].options = [{ name: 'made-up option', note: 'made-up text' }]; }, a => { a.slots = []; }, a => { a.lists[0].start = '00:00'; },
  ].map(b => () => { const a = cp(m.after); b(a); return wa(a); });
  breaks.push(() => Object.assign({}, m, { backup: null }), () => Object.assign({}, m, { backup: { v: [[0, '{}', 'one list "Docket"']] } }),
    () => Object.assign({}, m, { cell: 'x'.repeat(m.cap + 1) }));
  const missed = breaks.map((f, i) => (JOB_RULES.some(([, r]) => { try { return !r(f()); } catch (x) { return true; } }) ? -1 : i)).filter(i => i >= 0);
  if (OTHER[0][1](Object.assign({}, m, { backupAgain: 2 }))) missed.push('rerun');
  return missed;
}

function run() {
  const bad = [], checks = [], src = text('js/map.js');
  let Sx = null; try { Sx = sorter(src); } catch (e) { bad.push(String(e.message)); }
  if (Sx) ORDER_RULES.forEach(([n, f]) => checks.push([n, () => f(Sx)]));
  checks.push(['the order: every mutation of dkSort_ caught', () => { const missed = ORDER_MUTS.filter(([, mut]) => { const s2 = mut(src);
    if (s2 === src) return true; let S2; try { S2 = sorter(s2); } catch (e) { return false; } return ORDER_RULES.every(([, f]) => { try { return f(S2); } catch (e) { return false; } }); });
    if (missed.length) console.log('missed', missed.map(x => x[0])); return !missed.length; }]);
  let m = null; try { m = scene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['docketOneList25NovRun_ ran', () => false]);
  else {
    JOB_RULES.concat(OTHER).forEach(([n, f]) => checks.push([n, () => f(m)]));
    checks.push(['the job: every break caught', () => { const p = proveJob(m); if (p.length) console.log('missed', p); return !p.length; }]);
    const acc = text('backend/access.gs');
    checks.push(['run by MIGRATIONS (docket-onelist-25nov, retried until it works)', () => /\{ id: 'docket-onelist-25nov',\s*retry: true,[\s\S]*?run: \(\) => docketOneList25NovRun_\(\) \}/.test(acc)]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-onelist: ' + checks.length + ' rules (the order, the one-off job' + (m ? ': ' + m.said : '') + '); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-onelist', bad, 'one-list rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run, world };
main(module, run);
