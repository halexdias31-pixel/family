#!/usr/bin/env node
/* @family. — tools/docket-look.js THE DOCKET LOOKS LIKE GOOGLE TASKS (owner, 25 Nov; owner-only): Tools › Docket › a list is one docket card
   (js/map.js dkCard_, through the one maker), its list's name its only heading. On an iPhone 13, signed in as the owner on a made-up two-list docket:
   (a) every line is a fold (js/cards-render.js cardFold_) whose line holds the tick and the title only (no tag, tile, note or time);
   (b) tapping a line opens its details (the Edit tile, the item's times) and a redraw keeps it open; Edit opens the form;
   (c) ticked items sit only under one "Done (n)" line at the foot, closed until tapped, n counted right; a tick moves an item there and the line stays shut;
   (d) a slot option picked ticks the item (Prayer). Counted: each rule; one wrong fails the build. Run by tools/build.js. */
'use strict';
const SB = require('./lib/site-browser.js');
const { report, main, text } = require('./lib/gen.js');
/* THE BACKEND'S DOCKET (fix/docket-fresh-guard): the page reads the cell fresh (docketImport read) and saves with its base; todoBase_ is js/map.js's, as served. */
const todoBase_ = new Function(/\nfunction todoBase_\(cell\) \{[\s\S]*?\n\}\n/.exec(text('js/map.js'))[0] + '; return todoBase_;')();
const STALE = { n: 0 }, SAVED = { n: 0 };
function backend(cell) {
  return q => {
    if (q.action === 'docketImport' && q.read) return { success: true, todo: cell, base: todoBase_(cell) };
    if (q.action === 'item' && q.item === 'todo') { if (q.base !== todoBase_(cell)) return (STALE.n++,  { error: 'stale', stale: true, todo: cell, base: todoBase_(cell) }); SAVED.n++; cell = q.todo; return { success: true, base: todoBase_(cell) }; }
    return null;
  };
}

const DOCKET = { v: 1, slots: [{ name: 'Prayer', need: 1, options: [{ name: 'Psalm' }, { name: 'Office' }] }], lists: [
  { name: 'Every 8 hours', start: '00:00', items: [{ title: 'Prayer', slot: 'Prayer', repeat: '8h' }, { title: 'Drink water', repeat: '8h', note: 'A full glass', minutes: 2 },
    { title: 'Brush teeth', repeat: '8h', minutes: 2 }, { title: 'Tidy desk', repeat: '8h', time: '09:00' }] },
  { name: '@ Desk', items: [{ title: 'Reply to messages' }, { title: 'Print worksheets', done: true, doneOn: '2999-01-01' }] }] };

const lines = () => [...document.querySelectorAll('#screen .kc-docket .dk-line')].filter(d => !d.closest('.dk-done')).map(d => {
  const s = d.querySelector(':scope > summary'), kids = [...s.children];
  return { only: kids.length === 1 && kids[0].matches('label.check') && !s.querySelector('[data-do], .tag, .tags, .tile-row, p:not(:empty)'),
    title: s.textContent.trim(), open: d.open };
});
const doneFold = () => { const f = document.querySelector('#screen .kc-docket .dk-done'); if (!f) return null;
  return { said: f.querySelector(':scope > summary').textContent.trim(), n: f.querySelectorAll('.dk-line').length, open: f.open, last: f === f.parentNode.querySelector(':scope > .kc-fold:last-of-type') }; };

async function run() {
  const bad = [];
  const pg = await SB.open({ user: Object.assign({}, SB.USERS.admin, { owner: true, todo: JSON.stringify(DOCKET) }), answer: backend(JSON.stringify(DOCKET)) });
  try {
    for (const t of ['Tools', 'Docket', 'Every 8 hours']) await SB.tap(pg, t);
    const heads = await pg.evaluate(() => [...document.querySelectorAll('#screen .kc-docket')].map(c => c.getAttribute('aria-label')));
    if (heads.length !== 1 || !/Every 8 hours/.test(heads[0] || '')) bad.push('(heading) the list is not one card named for it: ' + JSON.stringify(heads));
    /* (a) */
    const L = await pg.evaluate(lines);
    if (L.length !== 4) bad.push('(a) ' + L.length + ' lines, not 4');
    L.filter(l => !l.only).forEach(l => bad.push('(a) the line "' + l.title + '" shows more than its tick and title'));
    if (L.some(l => l.open)) bad.push('(a) a line is open before it is tapped');
    /* (b) tap the words of the line: it opens, shows its details, and a redraw keeps it open */
    await pg.evaluate(() => { [...document.querySelectorAll('#screen .dk-line > summary')].find(s => /Drink water/.test(s.textContent)).click(); });
    await pg.waitForTimeout(300);
    const opened = await pg.evaluate(() => { const d = [...document.querySelectorAll('#screen .dk-line')].find(x => /Drink water/.test(x.querySelector('summary').textContent));
      return { open: d.open, edit: !!d.querySelector('[data-do="dk-fedit"]') && d.querySelector('[data-do="dk-fedit"]').offsetWidth > 0, words: d.querySelector('.kc-fold-in').textContent }; });
    if (!opened.open || !opened.edit || !/2 min/.test(opened.words) || !/A full glass/.test(opened.words)) bad.push('(b) tapping a line does not open its details: ' + JSON.stringify(opened));
    await pg.evaluate(() => { document.querySelector('#screen .dk-line[open] [data-do="dk-fedit"]').click(); });
    await pg.waitForTimeout(800);
    const ed = await pg.evaluate(() => ({ save: !!document.querySelector('#screen .dk-line[open] [data-do="dk-fsave"]'), any: !!document.querySelector('[data-do="dk-fsave"]'), edit: DKF.edit, open: [...CARD_OPEN] }));
    if (!ed.save) bad.push('(b) Edit does not open the form in its open line: ' + JSON.stringify(ed));
    await pg.evaluate(() => { const b = document.querySelector('#screen [data-do="dk-fedit"]'); if (b) b.click(); });
    await pg.waitForTimeout(800);
    /* (c) tick Brush teeth: it goes under Done, which stays shut and counts it */
    await pg.evaluate(() => { const s = [...document.querySelectorAll('#screen .dk-line > summary')].find(x => /Brush teeth/.test(x.textContent)); s.querySelector('label.check').click(); });
    await pg.waitForTimeout(1200);
    const after = await pg.evaluate(lines), fold = await pg.evaluate(doneFold);
    if (after.some(l => /Brush teeth/.test(l.title))) bad.push('(c) a ticked item is still among the open lines');
    if (!fold || fold.said !== 'Done (1)' || fold.n !== 1 || fold.open || !fold.last) bad.push('(c) the ticked item is not folded into one shut "Done (1)" line at the foot: ' + JSON.stringify(fold));
    await pg.evaluate(() => document.querySelector('#screen .dk-done > summary').click());
    await pg.waitForTimeout(300);
    if (!(await pg.evaluate(() => { const f = document.querySelector('#screen .dk-done'); return f.open && [...f.querySelectorAll('.dk-line')].some(d => d.offsetHeight > 0 && /Brush teeth/.test(d.textContent)); })))
      bad.push('(c) tapping Done does not show the ticked item');
    /* (d) a slot option picked ticks Prayer */
    await pg.evaluate(() => { [...document.querySelectorAll('#screen .dk-line > summary')].find(s => /Prayer/.test(s.textContent)).click(); });
    await pg.waitForTimeout(300);
    await pg.evaluate(() => { const b = [...document.querySelectorAll('#screen [data-do="dk-ffood"]')].find(x => x.offsetWidth > 0); if (b) b.click(); });
    await pg.waitForTimeout(1200);
    if (!(await pg.evaluate(() => (dkLoad_()[0].items.find(i => i.title === 'Prayer') || {}).pick && document.querySelector('#screen .dk-done').textContent.includes('Prayer'))))
      bad.push('(d) picking a slot option does not tick the item');
    if (STALE.n || !SAVED.n) bad.push('(save) ' + SAVED.n + ' saves landed, ' + STALE.n + ' refused as stale');
  } catch (e) { bad.push(String((e && e.message) || e).split('\n')[0]); } finally { await pg.close(); await SB.done(); }
  console.log('docket-look: 5 rules (one card, tick+title lines, tap opens, Done folds, a pick ticks); ' + (bad.length ? bad.length + ' wrong' : 'all pass'));
  report('docket-look', bad, 'docket look rule(s) broken');
}
module.exports = { run };
main(module, run);
