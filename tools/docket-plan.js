#!/usr/bin/env node
/* @family. — tools/docket-plan.js THE DOCKET IS A PLAN (rule 1.75; owner 27 Nov: "When I wake up I want to look at a list and run from the top down
   without it giving me a bad order"). What the owner would notice, on a made-up Saturday (no real item text here, by design):
   (1) THE ORDER, js/map.js dkSort_ run as served: the wake item first on waking; laundry never offered before 09:00, nor once it cannot finish by
       21:00, nor when a leave (an event away from home) comes before it finishes, each later one saying when ("from 09:00"); an overdue one-off is not on
       top but folded as missed; a far deadline does not jump an efficient item, a deadline that waiting would miss does; the longest unattended item
       first; place orders nothing; the fewest minutes first, no minutes counting as 15; one cycle from 06:00, 12:00, 18:00; a deadline a week out waits; bed items last; a slot's
       line says its least recently ticked option and a tick records it; the same input, the same order. Each rule proved by mutating the served source.
   (2) ONE PLAN, TWO PLACES: backend/cards-gen.gs's copies (the private address, do=list, the e-ink screen) give the site's order, row for row.
   (3) THE JOB: backend/access.gs docketPlan27NovRun_ in the backend vm writes the plan's numbers onto matching items, nothing else; backup first; a
       re-run a no-op; before the one list it refuses, unchanged; MIGRATIONS runs it after docket-onelist-25nov. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const { report, main, text } = require('./lib/gen.js');
const text_ = SD.textOf();
const fnOf = (src, n) => { const m = new RegExp('\\nfunction ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src); if (!m) throw new Error('docket-plan: no ' + n); return m[0]; };
const lineOf = (src, n) => { const m = new RegExp('\\nconst ' + n + ' = .*;\\n').exec(src); if (!m) throw new Error('docket-plan: no const ' + n); return m[0]; };
const CONSTS = ['dkMin_', 'dkIso_', 'dkEv_', 'dkRep_', 'DK_CYCLE', 'dkOn_', 'dkIsDone_'], FNS = ['dkOccur_', 'dkSlot_', 'dkTick_', 'dkSort_', 'dkLeaves_', 'dkOption_', 'dkTitle_', 'dkWhen_', 'dkNowNextOf_'];
/* THE PLANNER FROM A SOURCE: js/map.js (with js/form.js's clash readers), or backend/cards-gen.gs, which holds both. */
function planner(src, clash) {
  clash = clash || src;
  return new Function('text_', lineOf(clash, 'CLASH_DAYS') + fnOf(clash, 'clashDays_') + fnOf(clash, 'clashMin_') + CONSTS.map(n => lineOf(src, n)).join('')
    + FNS.map(n => fnOf(src, n)).join('') + 'return { ' + FNS.concat(CONSTS).join(', ') + ' };')(text_);
}
const DAY = '2026-11-28';   // a Saturday
const LIST = () => [
  { title: 'Prayer', repeat: '8h', before: ['*'], minutes: 5, options: ['Option A', 'Option B', 'Option C'], picks: ['Option A'] },
  { title: 'Glass of water', repeat: '8h', minutes: 1 },
  { title: 'Laundry', repeat: '8h', minutes: 5, runs: 60, place: 'home', stay: true, from: '09:00', until: '21:00' },
  { title: 'Charge batteries', repeat: '8h', minutes: 1, runs: 120, place: 'home' },
  { title: 'Shopping', repeat: '8h', minutes: 20, place: 'out', from: '07:00', until: '22:00' },
  { title: 'Shower', repeat: '8h', minutes: 10, place: 'home' },
  { title: 'Protein', repeat: '8h', minutes: 5, group: 'meal' },
  { title: 'Floss', repeat: '8h', minutes: 2, place: 'home' },
  { title: 'Old made-up errand', date: '2026-11-20', minutes: 5 },
  { title: 'Made-up call', date: DAY, until: '09:00', minutes: 5, place: 'phone' },
  { title: 'Far made-up errand', date: '2026-12-20', minutes: 10, place: 'desk' },
  { title: 'Short walk', repeat: '8h', minutes: 15, place: 'out', from: '07:00', until: '21:00' },
  { title: 'Minox', repeat: '8h', minutes: 1, place: 'home' },
  { title: 'Made-up weekday thing', repeat: '8h', minutes: 3, days: 'mon-fri' },
];
const T = (L, ix) => ix.map(i => L[i].title).join('|');
const at = (P, hhmm, L, leaves) => P.dkSort_(L || LIST(), DAY + ' ' + hhmm, leaves || []);
const idx = (L, t) => L.findIndex(x => x.title === t);
/* A LEAVE IS AN EVENT AWAY FROM HOME (the Timetable tool went, owner 27 Nov): a made-up outing 10:00-12:00. */
const OUTING = [{ title: 'Made-up outing', start: DAY + 'T10:00', minutes: 120, place: 'out' }];
const LEAVE = P => P.dkLeaves_(OUTING, DAY + ' 09:30');
const RULES = [
  ['Prayer (before: *) is first at 06:00, 10:30 (still in bed), 12:30 and 23:00 with nothing ticked; without it, it drops', P => { const L = LIST(), M = LIST(); delete M[0].before;
    return ['06:00', '10:30', '12:30', '23:00'].every(h => at(P, h, L).open[0] === 0) && at(P, '10:30', M).open[0] !== 0; }],
  ['Prayer ticked is not first, and back on top next cycle', P => { const L = LIST(); P.dkTick_(L, 0, true, DAY + ' 10:30');
    return at(P, '10:31', L).open[0] !== 0 && at(P, '10:31', L).done.indexOf(0) >= 0 && at(P, '12:00', L).open[0] === 0; }],
  ['no wake or bed tier: anchors order nothing (the same order with every anchor set)', P => { const L = LIST(), M = LIST(); M[1].anchor = 'wake'; M[7].anchor = 'bed'; M[6].anchor = 'meal';
    return JSON.stringify(at(P, '09:00', L)) === JSON.stringify(at(P, '09:00', M)); }],
  ['floss comes up every cycle like the rest: ticked at 07:00, done at 11:59, open at 12:00, not last', P => { const L = LIST(), f = idx(L, 'Floss'); P.dkTick_(L, f, true, DAY + ' 07:00');
    const o = at(P, '12:00', L).open; return at(P, '11:59', L).done.indexOf(f) >= 0 && o.indexOf(f) >= 0 && o[o.length - 1] !== f; }],
  ['no cycle tier: with no before: one-offs, a 2-minute one-off goes ahead of a longer cycle item (least total time)', P => { const L = LIST(); L.push({ title: 'Made-up quick one-off', minutes: 2 });
    const o = at(P, '09:00', L).open, q = o.indexOf(L.length - 1); return q > 0 && o.slice(q + 1).some(i => L[i].repeat === '8h'); }],
  ['with before: one-offs on every cycle item (the owner\'s data), a 2-minute one-off never precedes an open cycle item; Prayer still first', P => {
    const L = LIST().map(x => (x.repeat ? Object.assign(x, { before: (x.before || []).concat('one-offs') }) : x)); L.push({ title: 'Made-up quick one-off', minutes: 2 });
    const o = at(P, '09:00', L).open, q = o.indexOf(L.length - 1); return o[0] === 0 && q >= 0 && o.every((i, n) => !(n > q && L[i].repeat === '8h')); }],
  ['laundry is not offered at 08:59, and is "from 09:00"', P => { const L = LIST(), g = at(P, '08:59', L), i = idx(L, 'Laundry');
    return g.open.indexOf(i) < 0 && g.later.indexOf(i) >= 0 && P.dkWhen_(g.when[i], DAY + ' 08:59') === 'from 09:00'; }],
  ['laundry is offered at 09:00 and at 19:55 (done by 21:00)', P => { const L = LIST(), i = idx(L, 'Laundry'); return at(P, '09:00', L).open.indexOf(i) >= 0 && at(P, '19:55', L).open.indexOf(i) >= 0; }],
  ['laundry is not offered at 19:56 (it would end 21:01): tomorrow from 09:00', P => { const L = LIST(), g = at(P, '19:56', L), i = idx(L, 'Laundry');
    return g.open.indexOf(i) < 0 && P.dkWhen_(g.when[i], DAY + ' 19:56') === 'from Sun 09:00'; }],
  ['laundry is not offered at 09:30 with a leave at 10:00, and is "from 12:00" (back from it); the shower still is', P => { const L = LIST(), g = at(P, '09:30', L, LEAVE(P)), i = idx(L, 'Laundry');
    return g.open.indexOf(i) < 0 && P.dkWhen_(g.when[i], DAY + ' 09:30') === 'from 12:00' && g.open.indexOf(idx(L, 'Shower')) >= 0; }],
  ['laundry is offered at 08:50 on a day with no leave', P => { const L = LIST(); L[2].from = '08:00'; return at(P, '08:50', L).open.indexOf(2) >= 0; }],
  ['an overdue one-off is never open: it sits in missed', P => { const L = LIST(), g = at(P, '07:30', L), i = idx(L, 'Old made-up errand'); return g.open.indexOf(i) < 0 && T(L, g.missed) === 'Old made-up errand'; }],
  ['a far deadline does not jump an efficient item (the 10-minute errand after the shorter ones)', P => { const L = LIST(), o = at(P, '09:00', L).open;
    return o.indexOf(idx(L, 'Far made-up errand')) > o.indexOf(idx(L, 'Shower')) && o.indexOf(idx(L, 'Far made-up errand')) > o.indexOf(idx(L, 'Minox')); }],
  ['a deadline that waiting would miss goes ahead of the unattended ones (08:00: the call due by 09:00)', P => { const L = LIST(), o = at(P, '08:00', L).open;
    return o.indexOf(idx(L, 'Made-up call')) >= 0 && o.indexOf(idx(L, 'Made-up call')) < o.indexOf(idx(L, 'Charge batteries')); }],
  ['the same call with time to spare (07:00, due 23:00) does not jump', P => { const L = LIST(); L[9].until = '23:00'; const o = at(P, '07:00', L).open;
    return o.indexOf(9) > o.indexOf(idx(L, 'Charge batteries')); }],
  ['the longest unattended first: charge batteries (120) then laundry (60), ahead of the hands-only items', P => { const L = LIST(), o = at(P, '09:00', L).open, c = idx(L, 'Charge batteries'), l = idx(L, 'Laundry');
    return o.indexOf(c) === o.indexOf(l) - 1 && o.indexOf(l) < o.indexOf(idx(L, 'Minox')); }],
  ['place orders nothing: every place swapped, the same order (owner: "ignore place and order only by efficiency")', P => { const L = LIST(), M = LIST(), ps = ['out', 'home', 'desk', 'phone', 'anywhere'];
    M.forEach((x, n) => { x.place = ps[n % ps.length]; }); return JSON.stringify(at(P, '09:00', L).open) === JSON.stringify(at(P, '09:00', M).open); }],
  ['the fewest minutes first (Minox 1 before Shower 10 before Shopping 20)', P => { const L = LIST(), o = at(P, '09:00', L).open; return o.indexOf(idx(L, 'Minox')) < o.indexOf(idx(L, 'Shower')) && o.indexOf(idx(L, 'Shower')) < o.indexOf(idx(L, 'Shopping')); }],
  ['one cycle: ticked at 11:59 it is open again at 12:00; ticked at 18:30 it stays done until 06:00, then open', P => { const L = LIST(), sh = idx(L, 'Shower');
    P.dkTick_(L, sh, true, DAY + ' 11:59'); const a = at(P, '11:59', L).done.indexOf(sh) >= 0 && at(P, '12:00', L).open.indexOf(sh) >= 0;
    P.dkTick_(L, sh, true, DAY + ' 18:30'); const N = '2026-11-29'; return a && P.dkSort_(L, N + ' 05:59', []).done.indexOf(sh) >= 0 && P.dkSort_(L, N + ' 06:00', []).open.indexOf(sh) >= 0; }],
  ['an item with no minutes counts as 15: after a 10-minute one, before a 20-minute one', P => { const L = LIST();
    L.push({ title: 'Made-up unknown', repeat: '8h', place: 'home' }, { title: 'Made-up twenty', repeat: '8h', place: 'home', minutes: 20 });
    const o = at(P, '09:00', L).open, u = o.indexOf(idx(L, 'Made-up unknown')); return u > o.indexOf(idx(L, 'Shower')) && u < o.indexOf(idx(L, 'Made-up twenty')); }],
  ['a deadline a week out does not jump the queue: it waits behind the home items', P => { const L = LIST(); L.push({ title: 'Made-up week', date: '2026-12-03', minutes: 30, place: 'desk' });
    const o = at(P, '09:00', L).open; return o.indexOf(idx(L, 'Made-up week')) > o.indexOf(idx(L, 'Minox')) && o.indexOf(idx(L, 'Made-up week')) > o.indexOf(idx(L, 'Shower')); }],
  ['after waking (prayer ticked in the 06:00 cycle), at 12:30 the wake item is not pinned on top', P => { const L = LIST(); L[0].doneOn = DAY + '/1'; L.push({ title: 'Second wake', repeat: '8h', anchor: 'wake', minutes: 1 });
    return at(P, '12:30', L).open[0] !== L.length - 1; }],
  ['an item outside its days is not offered, and says when', P => { const L = LIST(), g = at(P, '09:00', L), i = idx(L, 'Made-up weekday thing');
    return g.open.indexOf(i) < 0 && P.dkWhen_(g.when[i], DAY + ' 09:00') === 'from Mon 00:00'; }],
  ['later items in the order they next become possible', P => { const L = LIST(), x = L[2]; L[2] = L[13]; L[13] = x; const g = at(P, '08:30', L); return T(L, g.later) === 'Laundry|Made-up weekday thing'; }],
  ['the slot line says the least recently ticked option ("Prayer · Option B")', P => P.dkTitle_(LIST()[0], DAY + ' 07:30') === 'Prayer · Option B'],
  ['a tick records the option, and the next line offers the next least recent', P => { const L = LIST(); P.dkTick_(L, 0, true, DAY + ' 07:30');
    const ok = L[0].pick === 'Option B' && L[0].picks.join() === 'Option A,Option B' && P.dkTitle_(L[0], DAY + ' 07:31') === 'Prayer · Option B';
    return ok && P.dkTitle_(L[0], DAY + ' 12:00') === 'Prayer · Option C'; }],
  ['an option tapped is the one recorded; an untick takes it off', P => { const L = LIST(); P.dkTick_(L, 0, true, DAY + ' 07:30', 'Option C'); const a = L[0].pick === 'Option C';
    P.dkTick_(L, 0, false, DAY + ' 07:30'); return a && !L[0].pick && L[0].picks.join() === 'Option A'; }],
  ['the e-ink and address rows: the open, then the later saying when, then the missed', P => { const L = LIST(), m = P.dkNowNextOf_(L, DAY + ' 06:05', []), r = m.rows;
    const lau = r.find(x => x.title === 'Laundry'), old = r[r.length - 1];
    return r[0].title === 'Prayer · Option B' && lau && lau.tags.join() === 'from 09:00' && old.missed && old.title === 'Old made-up errand' && !r.slice(0, -1).some(x => x.missed); }],
  ['the same input gives the same order', P => JSON.stringify(at(P, '09:00')) === JSON.stringify(at(P, '09:00'))],
];
const MUTS = [
  ['a wake tier', s => s.replace('return dkEv_(it) ? -1 :', "return dkEv_(it) ? -1 : it.anchor === 'wake' ? 0 :")],
  ['* ignored', s => s.replace('(star(A) && (!star(B) || a < b)) || ', '')],
  ['the cycle tier back', s => s.replace('ls < free - mins(it) ? 2 : 3; };', 'ls < free - mins(it) ? 2 : dkRep_(it) ? 3 : 4; };')],
  ['one-offs ignored', s => s.replace(" || (nm(x) === 'one-offs' && !dkRep_(B) && !dkEv_(B))", '')],
  ['no window start', s => s.replace('let s = Math.max(at - d * 1440, f == null ? 0 : f);', 'let s = at - d * 1440;')],
  ['no window end', s => s.replace('if (u != null && s + need > u) break;', '')],
  ['stay ignored', s => s.replace('const hit = it.stay ?', 'const hit = false ?')],
  ['overdue on top', s => s.replace("if (!dkRep_(it) && it.date && String(it.date) < day) return g.missed.push(i);", '')],
  ['every deadline jumps', s => s.replace('ls != null && ls < free - mins(it) ? 2', 'ls != null ? 2')],
  ['no deadline tier', s => s.replace('ls != null && ls < free - mins(it) ? 2', 'false ? 2')],
  ['runs shortest first', s => s.replace('r > 0 ? -r : mins(it), i]', 'r > 0 ? r : mins(it), i]')],
  ['no runs first', s => s.replace('k === 2 ? last(it) : r > 0 ? 0 : 1, k === 2 ? 0 : r > 0 ? -r : mins(it), i]', 'k === 2 ? last(it) : 1, k === 2 ? 0 : mins(it), i]')],
  ['place orders', s => s.replace('return [k, k === 2 ? last(it)', "return [k, ['out', 'home', 'anywhere', 'desk', 'phone'].indexOf(it.place), k === 2 ? last(it)")],
  ['longest first', s => s.replace('r > 0 ? -r : mins(it), i]', 'r > 0 ? -r : -mins(it), i]')],
  ['unknown is 0', s => s.replace('const DK_UNKNOWN_MIN = 15;', 'const DK_UNKNOWN_MIN = 0;')],
  ['cycle at 08:00', s => s.replace("const DK_CYCLE = ['06:00', '12:00', '18:00'];", "const DK_CYCLE = ['08:00', '12:00', '18:00'];")],
  ['no days', s => s.replace('if (days.length && days.indexOf(w) < 0) continue;', '')],
  ['later unsorted', s => s.replace('g.later.sort(', '[].sort(')],
  ['most recent option', s => s.replace('o.find(x => p.indexOf(x) < 0) || p.find(x => o.indexOf(x) >= 0)', 'p.slice().reverse().find(x => o.indexOf(x) >= 0)')],
  ['option not recorded', s => s.replace('    it.pick = got;\n', '')],
  ['no slot words', s => s.replace("(o ? ' · ' + o : '')", "''")],
  ['when in hours only', s => s.replace("(d ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][wd] + ' ' : '') + hhmm", 'hhmm')],
  ['later rows left out', s => s.replace('g.open.map(i => row(i, [])).concat(g.later.map', 'g.open.map(i => row(i, [])).concat([].map')],
];

/* ---------- (3) THE JOB ---------- */
const { world } = require('./docket-onelist.js');
const JOB_ITEMS = () => [{ name: 'Docket', items: [{ title: 'Laundry', repeat: '8h', runs: 30, doneOn: '2026-11-25/1' }, { title: 'Prayer', repeat: '8h', options: ['made-up'] },
  { title: 'Made-up unmatched', date: '2026-12-01' }, { title: 'Tidy room', repeat: '8h' }, { title: 'protein ', repeat: '8h' }] }];
function jobScene() {
  const w = world(JOB_ITEMS), was = w.cell(), run = () => { w.ctx.clearCache(); return w.ctx.docketPlan27NovRun_(); };
  const said = run(), cell = w.cell(), again = run(), cellAgain = w.cell();
  w.ctx.clearCache(); w.ctx.docketOneList25NovRun_();
  return { said, again, was, cell, cellAgain, oneAfter: w.cell(), items: JSON.parse(cell).lists[0].items, backup: w.B.tabs.backup_docket_plan_27nov };
}
const JOB_RULES = [
  ['laundry gets 5 minutes, runs 60, home, stay, 09:00-21:00, its repeat and done state kept', m => { const l = m.items[0];
    return l.minutes === 5 && l.runs === 60 && l.place === 'home' && l.stay === true && l.from === '09:00' && l.until === '21:00' && l.repeat === '8h' && l.doneOn === '2026-11-25/1'; }],
  ['prayer gets before * and 5 minutes, no anchor, its options kept', m => m.items[1].before.join() === '*' && m.items[1].within === undefined && m.items[1].anchor === undefined && m.items[1].minutes === 5 && m.items[1].options.join() === 'made-up'],
  ['an unmatched item is left exactly as it was', m => JSON.stringify(m.items[2]) === JSON.stringify({ title: 'Made-up unmatched', date: '2026-12-01' })],
  ['the renamed tidy and a title in another case are matched', m => m.items[3].minutes === 10 && m.items[3].place === 'home' && m.items[4].group === 'meal' && m.items[4].minutes === 5],
  ['the backup holds the whole old cell, once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was],
  ['a re-run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell && m.backup.v.length === 1],
  ['the one-list job run late leaves the numbers whole', m => m.oneAfter === m.cell],
];
function proveJob(m) {
  const cp = o => JSON.parse(JSON.stringify(o));
  const breaks = [x => { x.items[0].runs = 30; }, x => { delete x.items[0].stay; }, x => { delete x.items[0].doneOn; }, x => { x.items[1].before = []; },
    x => { x.items[1].options = []; }, x => { x.items[2].minutes = 5; }, x => { delete x.items[3].minutes; }, x => { delete x.items[4].group; },
    x => { x.backup = null; }, x => { x.cellAgain = 'x'; }, x => { x.oneAfter = 'x'; }];
  return breaks.map((b, i) => { const x = Object.assign({}, m, { items: cp(m.items), backup: m.backup }); b(x);
    return JOB_RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
}

function run() {
  const bad = [], checks = [], js = text('js/map.js'), form = text('js/form.js'), gen = text('backend/cards-gen.gs');
  let P = null; try { P = planner(js, form); } catch (e) { bad.push(String(e.message)); }
  if (P) RULES.forEach(([n, f]) => checks.push(['(1) ' + n, () => f(P)]));
  checks.push(['(1) every mutation of the plan caught', () => { const missed = MUTS.filter(([, mut]) => { const s2 = mut(js);
    if (s2 === js) return true; let P2; try { P2 = planner(s2, form); } catch (e) { return false; } return RULES.every(([, f]) => { try { return f(P2); } catch (e) { return false; } }); });
    if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (MUTS.length - missed.length) + '/' + MUTS.length + ' breaks caught' + (missed.length ? '; missed ' + missed.map(x => x[0]).join(', ') : ''));
    return !missed.length; }]);
  /* (2) */
  checks.push(['(2) the backend copy is the site\'s, word for word', () => FNS.every(n => fnOf(js, n) === fnOf(gen, n)) && CONSTS.every(n => lineOf(js, n) === lineOf(gen, n))]);
  checks.push(['(2) the backend gives the site\'s order at every half hour, leave or none', () => { const B = planner(gen);
    for (let h = 0; h < 48; h++) { const hm = String(Math.floor(h / 2)).padStart(2, '0') + ':' + (h % 2 ? '30' : '00');
      for (const lv of [[], OUTING]) {
        const a = JSON.stringify(P.dkNowNextOf_(LIST(), DAY + ' ' + hm, P.dkLeaves_(lv, DAY + ' ' + hm))), b = JSON.stringify(B.dkNowNextOf_(LIST(), DAY + ' ' + hm, B.dkLeaves_(lv, DAY + ' ' + hm)));
        if (a !== b) return false; } }
    return true; }]);
  /* (3) */
  let m = null; try { m = jobScene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['(3) docketPlan27NovRun_ ran', () => false]);
  else {
    JOB_RULES.forEach(([n, f]) => checks.push(['(3) ' + n, () => f(m)]));
    checks.push(['(3) every break of the job caught', () => { const p = proveJob(m); if (p.length) console.log('missed', p); return !p.length; }]);
    checks.push(['(3) before the one list it refuses, unchanged, no backup', () => { const w = world(() => [{ name: 'Every 8 hours', items: [{ title: 'Laundry' }] }, { name: '@ Desk', items: [] }]), was = w.cell();
      let threw = false; try { w.ctx.docketPlan27NovRun_(); } catch (e) { threw = true; } return threw && w.cell() === was && !w.B.tabs.backup_docket_plan_27nov; }]);
    const acc = text('backend/access.gs');
    checks.push(['(3) MIGRATIONS runs it after docket-onelist-25nov, retried until it works', () => { const a = acc.indexOf("id: 'docket-onelist-25nov'"), b = acc.indexOf("id: 'docket-plan-27nov'");
      return a > 0 && b > a && /\{ id: 'docket-plan-27nov',\s*retry: true,[\s\S]*?run: \(\) => docketPlan27NovRun_\(\) \}/.test(acc); }]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-plan: ' + checks.length + ' rules (the order, one plan front and back, the job' + (m ? ': ' + m.said : '') + '); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-plan', bad, 'plan rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run, planner };
main(module, run);
