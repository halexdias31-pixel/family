#!/usr/bin/env node
/* @family. — tools/docket-steps.js THE ONE LIST HOLDS, AND AN ITEM OF STEPS (rule 1.75; owner 28 Nov). What the owner would notice, made-up items only:
   (1) THE ONE LIST HOLDS: a two-list save (an old cached page) is stored as the one list "Docket" with every field (course, weight, minutes, until,
       runs, place) and a title met twice merged, the richer kept; any write of the `todo` cell folds the same (core.gs setCell); a one-list save is
       stored as sent. The job docketOneList28NovRun_ folds the owner's two-list cell keeping course/weight/minutes and the slots; backup first; a
       re-run a no-op; MIGRATIONS runs it before docket-plan-27nov.
   (2) STEPS AND STANDING, js/map.js as served: a stepped item lists its steps in order under it (a step's note behind a tap) and is ticked once, as a
       whole, its 8h repeat as before; a standing line is above everything, never open, never ticked, never in Done; kinds.json declares both.
   (3) THE PRAYER JOB, docketPrayer28NovRun_ with made-up keys: one item of steps in the given order, each option's note kept, the reading item gone, the
       three standing lines, the empty slot gone, still 8h and wake; a re-run a no-op; MIGRATIONS runs it after the one list.
   (4) NO PRAYER TEXT IN THE REPO: no run of up to four words in the changed files is any of the job's keys (bar the item's own name).
   --prove breaks each and must be caught. Run by tools/build.js. */
'use strict';
const { execFileSync } = require('child_process');
const { ROOT, report, main, text } = require('./lib/gen.js');
const { planner } = require('./docket-plan.js');
const { world } = require('./docket-onelist.js');
/* backend/access.gs docketPlanKey_ (a const, so not on the vm's global): the todoBase_ of a title's first four words. */
const keyOf = ctx => t => ctx.todoBase_((String(t == null ? '' : t).toLowerCase().match(/[a-z0-9]+/g) || []).slice(0, 4).join(' '));
const DAY = '2026-11-28';
const PROVE = process.argv.includes('--prove');

/* ---------- (1) THE ONE LIST HOLDS ---------- */
const TWO = () => [{ name: 'Every 8 hours', items: [{ title: 'Made-up shower', repeat: '8h', minutes: 10, place: 'home' }, { title: 'Made-up meal', repeat: '8h', slot: 'Made-up slot' }] },
  { name: '@ Desk', items: [{ title: 'Made-up essay', date: '2026-12-10', until: '17:00', minutes: 90, course: 'Made-up course', weight: 40 }, { title: 'made-up SHOWER ', runs: 5 }] }];
const SLOTS = { slots: [{ name: 'Made-up slot', options: [{ name: 'Made-up A', note: 'made-up note A' }, { name: 'Made-up B', note: '' }] }] };
function oneScene(ctx0) {
  const out = {};
  { const w = world(TWO, SLOTS); if (ctx0) ctx0(w.ctx); const base = w.ctx.todoBase_(w.cell());
    const sent = JSON.stringify({ v: 1, lists: TWO() });
    w.ctx.jsonOut = x => ({ getContent: () => JSON.stringify(x) }); w.ctx.clearCache(); out.save = JSON.parse(w.ctx.postSaveTodo_({ personId: 'P-OWN', todo: sent, base }, 'saveTodo').getContent()); out.saved = JSON.parse(w.cell()); }
  { const w = world(() => [{ name: 'Docket', items: [{ title: 'Made-up' }] }]); if (ctx0) ctx0(w.ctx); w.ctx.clearCache();
    w.ctx.jsonOut = x => ({ getContent: () => JSON.stringify(x) });
    const put = c => { w.ctx.clearCache(); w.ctx.postSavePerson_({ personId: 'P-OWN' }, 'todo', c); };
    put(JSON.stringify({ v: 1, lists: TWO() })); out.direct = JSON.parse(w.cell());
    const one = JSON.stringify({ v: 1, lists: [{ name: 'Docket', items: [{ title: 'Made-up one', minutes: 3 }] }] });
    put(one); out.oneKept = w.cell() === one; }
  { const w = world(TWO, SLOTS); if (ctx0) ctx0(w.ctx); out.was = w.cell(); const r = () => { w.ctx.clearCache(); return w.ctx.docketOneList28NovRun_(); };
    out.said = r(); out.cell = w.cell(); out.again = r(); out.cellAgain = w.cell(); out.backup = w.B.tabs.backup_docket_onelist_28nov; out.job = JSON.parse(out.cell); }
  return out;
}
const items = c => (c && c.lists && c.lists.length === 1 && c.lists[0].name === 'Docket' ? c.lists[0].items : null);
const ONE_RULES = [
  ['a two-list save is stored as the one list "Docket", every field kept, a title met twice merged', o => { const L = items(o.saved); if (!o.save.success || !L || L.length !== 3) return false;
    const sh = L[0], es = L.find(x => x.title === 'Made-up essay');
    return sh.minutes === 10 && sh.place === 'home' && sh.runs === 5 && sh.repeat === '8h' && es && es.course === 'Made-up course' && es.weight === 40 && es.until === '17:00' && es.minutes === 90; }],
  ['any other write of the cell folds too (postSavePerson_, through setCell), a one-list cell stored as sent', o => { const L = items(o.direct); return !!L && L.length === 3 && L[2].course === 'Made-up course' && o.oneKept; }],
  ['the job folds the owner\'s two lists keeping course, weight, minutes, a slot\'s options, the slots', o => { const L = items(o.job); if (!L) return false;
    const es = L.find(x => x.title === 'Made-up essay'), me = L.find(x => x.title === 'Made-up meal');
    return es.course === 'Made-up course' && es.weight === 40 && es.minutes === 90 && me.options.join() === 'Made-up A,Made-up B' && o.job.slots[0].options[0].note === 'made-up note A'; }],
  ['the job backs up the whole old cell, once; a re-run is a no-op', o => !!o.backup && o.backup.v.length === 1 && o.backup.v[0][1] === o.was && /nothing to do/.test(o.again) && o.cellAgain === o.cell],
];
const ONE_BREAKS = [['the fold gone', c => { c.todoOneList_ = t => t; }], ['the write guard gone', c => { c.todoOneCell_ = x => x; }]];

/* ---------- (2) STEPS AND STANDING ---------- */
const constOf = (src, n) => { const m = new RegExp('\\nconst ' + n + ' = .*;\\n').exec(src); if (!m) throw new Error('no ' + n); return m[0]; };
const fnOf = (src, n) => { const m = new RegExp('\\nfunction ' + n + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src); if (!m) throw new Error('no ' + n); return m[0]; };
const stepsOf = js => new Function('cardFold_', constOf(js, 'dkStep_') + fnOf(js, 'dkSteps_') + 'return dkSteps_;')((k, head, kids) => ({ head, kids }));
const SL = () => [{ title: 'Made-up stepped', repeat: '8h', anchor: 'wake', minutes: 5, steps: ['Made-up first\nmade-up note one', 'Made-up second', 'Made-up third\nnote three'] },
  { title: 'Made-up standing', standing: true, done: true, doneOn: DAY }, { title: 'Made-up shower', repeat: '8h', minutes: 10 }];
const STEP_RULES = [
  ['a stepped item lists its steps in order, a note behind a tap', (P, S) => { const b = S(SL()[0], 0), w = x => (x.head ? x.head.text : x.text);
    return b.length === 3 && w(b[0]) === '1. Made-up first' && b[0].kids[0].text === 'made-up note one' && w(b[1]) === '2. Made-up second' && !b[1].kids && w(b[2]) === '3. Made-up third'; }],
  ['a stepped item is ticked once, as a whole, and back next third', (P) => { const L = SL(); P.dkTick_(L, 0, true, DAY + ' 07:30');
    const g = P.dkSort_(L, DAY + ' 07:35', []); return g.done.indexOf(0) >= 0 && g.open.indexOf(0) < 0 && P.dkSort_(L, DAY + ' 16:00', []).open.indexOf(0) === 0; }],
  ['a standing line is on top, never open, never ticked, never in Done', (P) => { const L = SL(), g = P.dkSort_(L, DAY + ' 07:30', []);
    return g.standing.join() === '1' && g.open.indexOf(1) < 0 && g.done.indexOf(1) < 0 && P.dkTick_(L, 1, true, DAY + ' 07:30') === false && P.dkSort_(L, '2026-12-05 07:30', []).standing.join() === '1'; }],
];
const STEP_MUTS = [
  ['steps reversed', s => s.replace(".filter(x => x.name).map((x, n) =>", ".filter(x => x.name).reverse().map((x, n) =>")],
  ['note dropped', s => s.replace("[{ type: 'text', look: 'note', text: x.note }]", '[]')],
  ['standing open', s => s.replace('    if (it.standing === true) return g.standing.push(i);\n', '')],
  ['standing tickable', s => s.replace('if (!it || it.standing === true) return false;', 'if (!it) return false;')],
  ['standing not drawn first', s => s.replace('body: g.standing.map(i => dkStandLine_(i)).concat(g.open.map(i => dkLine_(i)))', 'body: g.open.map(i => dkLine_(i)).concat(g.standing.map(i => dkStandLine_(i)))')],
  ['steps not drawn', s => s.replace('    ...dkSteps_(it, i),\n', '')],
];
const drawn = js => /body: g\.standing\.map\(i => dkStandLine_\(i\)\)\.concat\(g\.open\.map/.test(js) && /\n    \.\.\.dkSteps_\(it, i\),\n/.test(js);
const stepsOk = js => { let P, S; try { P = planner(js, text('js/form.js')); S = stepsOf(js); } catch (e) { return false; }
  return drawn(js) && STEP_RULES.every(([, f]) => { try { return f(P, S); } catch (e) { return false; } }); };

/* ---------- (3) THE PRAYER JOB, made-up keys ---------- */
const STEP_NAMES = ['Made-up one', 'Made-up two', 'Made-up three'];
const PRAY = () => [{ name: 'Docket', items: [{ title: 'Made-up prayer', repeat: '8h', anchor: 'wake', minutes: 5, slot: 'Made-up prayer', options: ['Made-up two', 'Made-up one'], picks: ['Made-up two'] },
  { title: 'Made-up reading', repeat: '8h', minutes: 5 }, { title: 'Made-up stand one', repeat: '8h', doneOn: DAY + '/1' }, { title: 'Made-up stand two' }, { title: 'Made-up other', repeat: '8h' }, { title: 'Made-up look at the list', repeat: '8h' }, { title: 'Made-up food item', repeat: '8h', anchor: 'meal' }] }];
const PSLOTS = { slots: [{ name: 'Made-up prayer', options: [{ name: 'Made-up two', note: 'note two' }, { name: 'Made-up one', note: 'note one' }] }, { name: 'Made-up food', options: [{ name: 'x' }] }] };
function prayScene(ctx0) {
  const w = world(PRAY, PSLOTS), k = t => keyOf(w.ctx)(t);
  w.ctx.dkPrayerKeys_ = () => ({ item: [k('Made-up prayer')], steps: [[k('Made-up one')], [k('Made-up two')], [k('nope'), k('Made-up reading')]],
    gone: [k('Made-up reading'), k('Made-up look at the list')], standing: [k('Made-up stand one'), k('Made-up stand two')] });
  if (ctx0) ctx0(w.ctx);
  const was = w.cell(), r = () => { w.ctx.clearCache(); return w.ctx.docketPrayer28NovRun_(); };
  const said = r(), cell = w.cell(), again = r();
  return { said, again, was, cell, cellAgain: w.cell(), c: JSON.parse(cell), backup: w.B.tabs.backup_docket_prayer_28nov };
}
const PRAY_RULES = [
  ['Prayer is one item of steps in the given order, each option\'s note kept, no longer a slot, still 8h, within 15, no anchor', m => { const p = m.c.lists[0].items[0];
    return JSON.stringify(p.steps) === JSON.stringify(['Made-up one\nnote one', 'Made-up two\nnote two', 'Made-up reading']) && !p.options && !p.picks && !p.slot && p.repeat === '8h' && p.within === 15 && p.anchor === undefined; }],
  ['the reading item and the look-at-the-list item are gone, the others stay', m => m.c.lists[0].items.map(x => x.title).join('|') === 'Made-up prayer|Made-up stand one|Made-up stand two|Made-up other|Made-up food item'],
  ['a meal anchor becomes the group meal; no anchor is left', m => m.c.lists[0].items[4].group === 'meal' && m.c.lists[0].items.every(x => x.anchor === undefined)],
  ['the named lines are standing, their tick gone; the other is not', m => { const L = m.c.lists[0].items;
    return L[1].standing === true && !L[1].doneOn && L[2].standing === true && !L[3].standing; }],
  ['the prayer slot is gone, the other slot kept', m => m.c.slots.map(x => x.name).join() === 'Made-up food'],
  ['the backup holds the whole old cell, once; a re-run is a no-op', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was && /nothing to do/.test(m.again) && m.cellAgain === m.cell],
];
function provePray(m) {
  const breaks = [c => { c.lists[0].items[0].steps.reverse(); }, c => { c.lists[0].items[0].steps[0] = 'Made-up one'; }, c => { c.lists[0].items.splice(1, 0, { title: 'Made-up reading' }); },
    c => { delete c.lists[0].items[1].standing; }, c => { c.lists[0].items[3].standing = true; }, c => { c.slots.unshift({ name: 'Made-up prayer' }); }, c => { c.lists[0].items[0].repeat = ''; }, c => { delete c.lists[0].items[0].within; }, c => { delete c.lists[0].items[4].group; }];
  return breaks.map((b, i) => { const x = Object.assign({}, m, { c: JSON.parse(m.cell) }); b(x.c); return PRAY_RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; })
    .filter(i => i >= 0).concat([m].map(x => { const y = Object.assign({}, x, { backup: null }); return PRAY_RULES.some(([, r]) => { try { return !r(y); } catch (e) { return true; } }) ? -1 : 'nobackup'; }).filter(i => i !== -1));
}

/* ---------- (4) NO PRAYER TEXT ---------- */
function changedFiles() {
  let names = [];
  try { names = execFileSync('git', ['diff', '--name-only', 'claude/focused-wright-blx2g6'], { cwd: ROOT, encoding: 'utf8' }).split('\n'); } catch (e) { names = []; }
  try { names = names.concat(execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n')); } catch (e) { /* none */ }
  return [...new Set(names.filter(Boolean))].filter(f => { try { text(f); return true; } catch (e) { return false; } });
}
function textHits(key, keys, files) {
  const hits = [];
  files.forEach(f => { const w = String(text(f)).toLowerCase().match(/[a-z0-9]+/g) || [];
    for (let i = 0; i < w.length; i++) for (let n = 1; n <= 4 && i + n <= w.length; n++) if (keys.has(key(w.slice(i, i + n).join(' ')))) { hits.push(f); return; } });
  return hits;
}

function run() {
  const bad = [], checks = [], js = text('js/map.js'), acc = text('backend/access.gs'), kinds = JSON.stringify(JSON.parse(text('data/settings/kinds.json')));
  let o = null; try { o = oneScene(); } catch (e) { console.log(e.stack); }
  if (!o) checks.push(['(1) the one list scenes ran', () => false]);
  else {
    ONE_RULES.forEach(([n, f]) => checks.push(['(1) ' + n, () => f(o)]));
    checks.push(['(1) every break of the one list caught', () => { const missed = ONE_BREAKS.filter(([, b]) => { let x; try { x = oneScene(b); } catch (e) { return false; }
      return ONE_RULES.every(([, f]) => { try { return f(x); } catch (e) { return false; } }); });
      const more = [x => { x.backup = null; }, x => { x.cellAgain = 'x'; }, x => { x.job.lists[0].items[2].course = ''; }].filter(b => { const x = JSON.parse(JSON.stringify(o)); b(x);
        return ONE_RULES.every(([, f]) => { try { return f(x); } catch (e) { return false; } }); });
      if (PROVE || missed.length || more.length) console.log('  --prove (1): ' + (ONE_BREAKS.length + 3 - missed.length - more.length) + '/' + (ONE_BREAKS.length + 3) + ' breaks caught');
      return !missed.length && !more.length; }]);
  }
  checks.push(['(1) MIGRATIONS runs docket-onelist-28nov before docket-plan-27nov and the jobs after it', () => { const a = acc.indexOf("{ id: 'docket-onelist-28nov',"), b = acc.indexOf("{ id: 'docket-plan-27nov',");
    return a > 0 && b > a && acc.indexOf("{ id: 'docket-prayer-28nov',") > a && acc.indexOf("{ id: 'docket-before-28nov',") > a && /\{ id: 'docket-onelist-28nov',\s*retry: true,[\s\S]*?run: \(\) => docketOneList28NovRun_\(\) \}/.test(acc); }]);
  checks.push(['(2) a stepped item and a standing line, as served', () => stepsOk(js)]);
  checks.push(['(2) every mutation of steps and standing caught', () => { const missed = STEP_MUTS.filter(([, mu]) => { const s2 = mu(js); return s2 === js || stepsOk(s2); });
    if (PROVE || missed.length) console.log('  --prove (2): ' + (STEP_MUTS.length - missed.length) + '/' + STEP_MUTS.length + ' breaks caught' + (missed.length ? '; missed ' + missed.map(x => x[0]).join(', ') : ''));
    return !missed.length; }]);
  checks.push(['(2) kinds.json declares steps and standing on the docket list', () => /"f":"steps","type":"titles"/.test(kinds) && /"f":"standing","type":"flag"/.test(kinds)]);
  let m = null; try { m = prayScene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['(3) the prayer job ran', () => false]);
  else {
    PRAY_RULES.forEach(([n, f]) => checks.push(['(3) ' + n, () => f(m)]));
    checks.push(['(3) every break of the prayer job caught', () => { const p = provePray(m); if (PROVE || p.length) console.log('  --prove (3): ' + (10 - p.length) + '/10 breaks caught'); return !p.length; }]);
    checks.push(['(3) a step missing from the cell: it throws, nothing changed', () => { const w = world(PRAY, PSLOTS), k = t => keyOf(w.ctx)(t), was = w.cell();
      w.ctx.dkPrayerKeys_ = () => ({ item: [k('Made-up prayer')], steps: [[k('nope')]], gone: [], standing: [] }); let threw = false; try { w.ctx.docketPrayer28NovRun_(); } catch (e) { threw = true; }
      return threw && w.cell() === was && !w.B.tabs.backup_docket_prayer_28nov; }]);
  }
  checks.push(['(3) MIGRATIONS runs docket-prayer-28nov after the one list, retried', () => /\{ id: 'docket-prayer-28nov',\s*retry: true,[\s\S]*?run: \(\) => docketPrayer28NovRun_\(\) \}/.test(acc)]);
  /* (4) */
  let key = null, K = null; try { const w = world(PRAY); key = keyOf(w.ctx); K = w.ctx.dkPrayerKeys_; } catch (e) { key = null; }
  const files = changedFiles();
  checks.push(['(4) no prayer text in the changed files (' + files.length + ')', () => { const k = K(), keys = new Set([].concat(...k.steps, k.standing, k.gone));
    const hits = textHits(key, keys, files); if (hits.length) console.log('  prayer text in: ' + hits.join(', ')); return files.length > 0 && !hits.length; }]);
  checks.push(['(4) the text check catches a planted key', () => { const k = K(), keys = new Set([key('made up planted')].concat(...k.steps));
    return textHits(key, keys, ['tools/docket-steps.js']).length === 1; }]);
  checks.forEach(([name, f]) => { let good = false; try { good = f(); } catch (x) { good = false; } if (!good) bad.push(name); });
  console.log('docket-steps: ' + checks.length + ' rules (the one list holds, steps and standing, the prayer job' + (m ? ': ' + m.said : '') + ', no prayer text); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-steps', bad, 'steps rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
