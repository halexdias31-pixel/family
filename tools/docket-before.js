#!/usr/bin/env node
/* @family. — tools/docket-before.js ONE THING BEFORE ANOTHER (rule 1.75; owner 28 Nov: "Brush teeth has to go before breakfast ... make this docket
   sophisticated"). What the owner would notice, on a made-up morning (no real item text here, by design):
   (1) THE ORDER, js/map.js dkSort_ run as served: brush teeth (`before: meal`) shows ahead of every open Protein/Carbs/Dairy/Veg/Fruit, even once a meal
       began; a name matches any case; a constraint never lifts an item above the wake items; a cycle still lists both, in a fixed order, and returns;
       a ticked target binds nothing; with no `before` the order is the plan's as it was. Each rule proved by mutating the served source (--prove).
   (2) ONE PLAN, TWO PLACES: backend/cards-gen.gs gives the site's order at every half hour, and a changed copy is caught.
   (3) THE JOB: backend/access.gs docketBefore28NovRun_ sets the brush-teeth item's `before` to meal, only when it has none; backup first; a re-run a
       no-op; MIGRATIONS runs it after the one list. kinds.json declares `before` on the docket list and in its edit form. Run by tools/build.js. */
'use strict';
const { report, main, text } = require('./lib/gen.js');
const { planner } = require('./docket-plan.js');
const { world } = require('./docket-onelist.js');
const DAY = '2026-11-28';
const MEALS = ['Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit'];
/* A MADE-UP MORNING: the wake item, a glass of water (wake too), brush teeth, a shower, the five meal slots; Protein ticked this third (a meal began). */
const LIST = () => [{ title: 'Prayer', repeat: '8h', anchor: 'wake', minutes: 5 }, { title: 'Glass of water', repeat: '8h', anchor: 'wake', minutes: 1 }]
  .concat(MEALS.map((t, n) => ({ title: t, repeat: '8h', anchor: 'meal', minutes: 5, doneOn: n ? '' : DAY + '/1' })))
  .concat([{ title: 'Shower', repeat: '8h', minutes: 10, place: 'home' }, { title: 'Brush teeth', repeat: '8h', minutes: 3, place: 'home', before: ['meal'] }]);
const at = (P, L, hm) => P.dkSort_(L, DAY + ' ' + (hm || '07:30'), []).open;
const pos = (L, o, t) => o.indexOf(L.findIndex(x => x.title === t));
const names = (L, o) => o.map(i => L[i].title).join('|');
const RULES = [
  ['brush teeth shows before every open meal slot, though a meal began', P => { const L = LIST(), o = at(P, L), b = pos(L, o, 'Brush teeth');
    return b >= 0 && MEALS.slice(1).every(t => pos(L, o, t) > b); }],
  ['a slot named in any case ("carbs", "DAIRY") is gone before; each pulled up just ahead of its slot, the rest in place', P => { const L = LIST(); L[8].before = ['carbs']; L[7].before = ['DAIRY'];
    const o = at(P, L); return pos(L, o, 'Brush teeth') < pos(L, o, 'Carbs') && pos(L, o, 'Shower') < pos(L, o, 'Dairy') && names(L, o) === 'Glass of water|Prayer|Brush teeth|Carbs|Shower|Dairy|Veg|Fruit'; }],
  ['a constraint never lifts an item above the wake items', P => { const L = LIST(); L[8].before = ['meal', 'Glass of water', 'Prayer'];
    const o = at(P, L); return pos(L, o, 'Glass of water') === 0 && pos(L, o, 'Prayer') === 1 && pos(L, o, 'Brush teeth') === 2; }],
  ['a cycle lists both, every item once, in the same order each time', P => { const L = LIST(); L[7].before = ['Brush teeth']; L[8].before = ['Shower'];
    const a = at(P, L), b = at(P, LIST().map((x, i) => Object.assign(x, L[i].before ? { before: L[i].before } : {})));
    return pos(L, a, 'Shower') >= 0 && pos(L, a, 'Brush teeth') >= 0 && a.length === new Set(a).size && a.length === 8 && names(L, a) === names(L, b); }],
  ['a ticked target binds nothing: the order is as without it', P => { const L = LIST(), M = LIST(); L[7].before = ['Protein']; L[7].minutes = 30; M[7].minutes = 30;
    return names(L, at(P, L)) === names(M, at(P, M)) && pos(L, at(P, L), 'Shower') > pos(L, at(P, L), 'Fruit'); }],
  ['with no before anywhere, the plan is the plan: wake (fewest minutes first), the begun meal, home by minutes', P => { const L = LIST(); delete L[8].before;
    return names(L, at(P, L)) === 'Glass of water|Prayer|Carbs|Dairy|Veg|Fruit|Brush teeth|Shower'; }],
];
const MUTS = [
  ['before ignored', s => s.replace('  g.open = out;\n', '')],
  ['meal word ignored', s => s.replace("(nm(x) === 'meal' && anc(B) === 'meal')", 'false')],
  ['case matters', s => s.replace("const nm = v => String(v == null ? '' : v).trim().toLowerCase()", "const nm = v => String(v == null ? '' : v)")],
  ['wake items jumpable', s => s.replace('top = g.open.filter(i => tier(items[i]) <= 0), rest = g.open.filter(i => tier(items[i]) > 0)', 'top = [], rest = g.open.slice()')],
  ['a cycle drops both', s => s.replace("if (out.indexOf(b) >= 0 || path.indexOf(b) >= 0) return;", "if (out.indexOf(b) >= 0) return; if (path.indexOf(b) >= 0) { out.push(-1); return; }")],
  ['a cycle never ends', s => s.replace("|| path.indexOf(b) >= 0) return;", ") return;")],
  ['a ticked target binds', s => s.replace('  const top = g.open.filter', '  g.open = g.open.concat(g.done.filter(i => items.some(a => Array.isArray(a.before) && a.before.some(x => nm(x) === nm(items[i].title)))));\n  const top = g.open.filter')],
  ['the rest reordered', s => s.replace('rest.forEach(b => put(b, []));', 'rest.slice().reverse().forEach(b => put(b, []));')],
  ['pulled to the end, not up', s => s.replace('rest.forEach(a => { if (must(a, b)) put(a, path.concat(b)); }); if (out.indexOf(b) < 0) out.push(b);', 'if (out.indexOf(b) < 0) out.push(b); rest.forEach(a => { if (must(a, b)) put(a, path.concat(b)); });')],
];
const ok = P => RULES.every(([, f]) => { try { return f(P); } catch (e) { return false; } });
const same = (P, B) => { for (let h = 0; h < 48; h++) { const hm = String(Math.floor(h / 2)).padStart(2, '0') + ':' + (h % 2 ? '30' : '00');
  for (const L of [LIST(), LIST().map((x, i) => (i === 7 ? Object.assign(x, { before: ['Brush teeth'] }) : x))])
    if (JSON.stringify(P.dkSort_(L, DAY + ' ' + hm, [])) !== JSON.stringify(B.dkSort_(L, DAY + ' ' + hm, []))) return false; } return true; };

/* (3) THE JOB */
const JOB_ITEMS = () => [{ name: 'Docket', items: [{ title: 'brush  Teeth', repeat: '8h', anchor: 'bed', minutes: 3 }, { title: 'Brush teeth', repeat: '8h', before: ['Shower'] },
  { title: 'Made-up other', repeat: '8h' }] }];
function jobScene() {
  const w = world(JOB_ITEMS), was = w.cell(), run = () => { w.ctx.clearCache(); return w.ctx.docketBefore28NovRun_(); };
  const said = run(), cell = w.cell(), again = run(), cellAgain = w.cell();
  return { said, again, was, cell, cellAgain, items: JSON.parse(cell).lists[0].items, old: JSON.parse(was).lists[0].items, backup: w.B.tabs.backup_docket_before_28nov };
}
const JOB_RULES = [
  ['brush teeth (any case, any spacing) gets before: meal, the rest of it kept', m => JSON.stringify(m.items[0]) === JSON.stringify(Object.assign({}, m.old[0], { before: ['meal'] }))],
  ['one that already has a before is left alone', m => JSON.stringify(m.items[1]) === JSON.stringify(m.old[1])],
  ['an unmatched item is left exactly as it was', m => JSON.stringify(m.items[2]) === JSON.stringify(m.old[2])],
  ['the backup holds the whole old cell, once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was],
  ['a re-run is a no-op', m => /nothing to do/.test(m.again) && m.cellAgain === m.cell && m.backup.v.length === 1],
];
function proveJob(m) {
  const cp = o => JSON.parse(JSON.stringify(o));
  const breaks = [x => { delete x.items[0].before; }, x => { delete x.items[0].anchor; }, x => { x.items[1].before = ['meal']; }, x => { x.items[2].before = ['meal']; },
    x => { x.backup = null; }, x => { x.cellAgain = 'x'; }];
  return breaks.map((b, i) => { const x = Object.assign({}, m, { items: cp(m.items) }); b(x);
    return JOB_RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
}

function run() {
  const bad = [], checks = [], js = text('js/map.js'), form = text('js/form.js'), gen = text('backend/cards-gen.gs'), acc = text('backend/access.gs');
  let P = null; try { P = planner(js, form); } catch (e) { bad.push(String(e.message)); }
  if (P) RULES.forEach(([n, f]) => checks.push(['(1) ' + n, () => f(P)]));
  checks.push(['(1) every mutation of before caught', () => { const missed = MUTS.filter(([, mut]) => { const s2 = mut(js);
    if (s2 === js) return true; let P2; try { P2 = planner(s2, form); } catch (e) { return false; } return ok(P2); });
    if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (MUTS.length - missed.length) + '/' + MUTS.length + ' breaks caught' + (missed.length ? '; missed ' + missed.map(x => x[0]).join(', ') : ''));
    return !missed.length; }]);
  checks.push(['(2) the backend gives the site\'s order at every half hour, a cycle or none', () => same(P, planner(gen))]);
  checks.push(['(2) a changed backend copy is caught', () => { const g2 = MUTS[0][1](gen); return g2 !== gen && !same(P, planner(g2)); }]);
  let m = null; try { m = jobScene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['(3) docketBefore28NovRun_ ran', () => false]);
  else {
    JOB_RULES.forEach(([n, f]) => checks.push(['(3) ' + n, () => f(m)]));
    checks.push(['(3) every break of the job caught', () => { const p = proveJob(m); if (p.length) console.log('missed', p); return !p.length; }]);
    checks.push(['(3) before the one list it refuses, unchanged, no backup', () => { const w = world(() => [{ name: 'Every 8 hours', items: [{ title: 'Brush teeth' }] }, { name: '@ Desk', items: [] }]), was = w.cell();
      let threw = false; try { w.ctx.docketBefore28NovRun_(); } catch (e) { threw = true; } return threw && w.cell() === was && !w.B.tabs.backup_docket_before_28nov; }]);
  }
  checks.push(['(3) MIGRATIONS runs it after docket-onelist-25nov, retried until it works', () => { const a = acc.indexOf("id: 'docket-onelist-25nov'"), b = acc.indexOf("id: 'docket-before-28nov'");
    return a > 0 && b > a && /\{ id: 'docket-before-28nov',\s*retry: true,[\s\S]*?run: \(\) => docketBefore28NovRun_\(\) \}/.test(acc); }]);
  checks.push(['(3) kinds.json declares before on the docket list and in its edit form', () => { const k = JSON.parse(text('data/settings/kinds.json')), s = JSON.stringify(k);
    const i = s.indexOf('"docket-item"'); return /"f":"before","type":"titles"/.test(s) && i > 0 && /"f":"before"/.test(s.slice(i, i + 600)) && /data-dke="before"/.test(js); }]);
  checks.forEach(([name, f]) => { let good = false; try { good = f(); } catch (x) { good = false; } if (!good) bad.push(name); });
  console.log('docket-before: ' + checks.length + ' rules (the order, one plan front and back, the job' + (m ? ': ' + m.said : '') + '); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-before', bad, 'before rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
