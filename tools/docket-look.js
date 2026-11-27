#!/usr/bin/env node
/* @family. — tools/docket-look.js THE DOCKET LOOKS LIKE GOOGLE TASKS (owner, 25 Nov; one list, names only, 25 Nov night; owner-only): Tools › Docket is
   one docket card (js/map.js dkCard_, through the one maker) named Docket, no list menu. On an iPhone 13, signed in as the owner on a made-up one-list docket:
   (a) every open line is a fold (js/cards-render.js cardFold_) whose line holds the tick and its words only, in the plan's order (dkSort_, owner
       27 Nov): the wake item on top, its slot's least recent option on its line ("Prayer · Option B"); an overdue one-off never among them but folded
       under "Missed — new date? (n)"; tapping the slot line lists its every option;
   (b) tapping a line shows only Edit and Delete (no note, time, minutes or option); Edit opens the title alone, and Save renames it;
   (c) ticked items sit only under one "Done (n)" line at the foot, closed until tapped; a tick moves an item there;
   (d) the quick add puts an undated one-off at the end of the undated ones. Every save lands on the server's base.
   A 390px dark screenshot goes to .cache/docket-look/onelist.png. Counted: each rule; one wrong fails the build. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const SB = require('./lib/site-browser.js');
const { ROOT, report, main, text } = require('./lib/gen.js');
/* THE BACKEND'S DOCKET (fix/docket-fresh-guard): the page reads the cell fresh (docketImport read) and saves with its base; todoBase_ is js/map.js's, as served. */
const todoBase_ = new Function(/\nfunction todoBase_\(cell\) \{[\s\S]*?\n\}\n/.exec(text('js/map.js'))[0] + '; return todoBase_;')();
const STALE = { n: 0 }, SAVED = { n: 0 }, CELL = { now: '' };
function backend(cell) {
  CELL.now = cell;
  return q => {
    if (q.action === 'docketImport' && q.read) return { success: true, todo: CELL.now, base: todoBase_(CELL.now) };
    if (q.action === 'item' && q.item === 'todo') { if (q.base !== todoBase_(CELL.now)) return (STALE.n++, { error: 'stale', stale: true, todo: CELL.now, base: todoBase_(CELL.now) }); SAVED.n++; CELL.now = q.todo; return { success: true, base: todoBase_(CELL.now) }; }
    return null;
  };
}
/* Made-up items only. Dates far from today either way, so the order holds whatever day the build runs. */
const DOCKET = { v: 1, lists: [{ name: 'Docket', items: [{ title: 'Reply to messages' }, { title: 'Prayer', repeat: '8h', anchor: 'wake', minutes: 5, options: ['Option A', 'Option B'], picks: ['Option A'] }, { title: 'Drink water', repeat: '8h' }, { title: 'Book the dentist', date: '2999-03-01' },
  { title: 'Return the parcel', date: '2000-01-05' }, { title: 'Brush teeth', repeat: '8h' }, { title: 'Renew the card', date: '2999-01-10' },
  { title: 'Print worksheets', done: true, doneOn: '2999-01-01' }, { title: 'Tidy room', repeat: '8h' }] }] };
const ORDER = 'Prayer · Option B|Reply to messages|Drink water|Book the dentist|Brush teeth|Renew the card|Tidy room';

const lines = () => [...document.querySelectorAll('#screen .kc-docket .dk-line')].filter(d => !d.closest('.dk-done, .dk-missed')).map(d => {
  const s = d.querySelector(':scope > summary'), kids = [...s.children];
  return { only: kids.length === 1 && kids[0].matches('label.check') && !s.querySelector('[data-do], .tag, .tags, .tile-row, p:not(:empty)'),
    title: s.textContent.trim(), open: d.open };
});
const doneFold = () => { const f = document.querySelector('#screen .kc-docket .dk-done'); if (!f) return null;
  return { said: f.querySelector(':scope > summary').textContent.trim(), n: f.querySelectorAll('.dk-line').length, open: f.open, last: f === f.parentNode.querySelector(':scope > .kc-fold:last-of-type') }; };

async function run() {
  const bad = [];
  const pg = await SB.open({ user: Object.assign({}, SB.USERS.admin, { owner: true, todo: JSON.stringify(DOCKET) }), answer: backend(JSON.stringify(DOCKET)), dark: true });
  try {
    for (const t of ['Tools', 'Docket']) await SB.tap(pg, t);
    await pg.waitForTimeout(600);
    const heads = await pg.evaluate(() => [...document.querySelectorAll('#screen .kc-docket')].map(c => c.getAttribute('aria-label')));
    if (heads.length !== 1 || !/Docket/.test(heads[0] || '')) bad.push('(card) the Docket is not one card named Docket: ' + JSON.stringify(heads));
    if (await pg.evaluate(() => !!document.querySelector('#screen [data-do="dk-list"], #screen [data-do="dk-newlist"]'))) bad.push('(card) a list menu is still drawn');
    /* (a) */
    const L = await pg.evaluate(lines);
    if (L.map(l => l.title).join('|') !== ORDER) bad.push('(a) the order is ' + L.map(l => l.title).join('|') + ', not ' + ORDER);
    L.filter(l => !l.only).forEach(l => bad.push('(a) the line "' + l.title + '" shows more than its tick and title'));
    if (L.some(l => l.open)) bad.push('(a) a line is open before it is tapped');
    const missed = await pg.evaluate(() => { const f = document.querySelector('#screen .kc-docket .dk-missed'); return f && { said: f.querySelector(':scope > summary').textContent.trim(), n: f.querySelectorAll('.dk-line').length, open: f.open }; });
    if (!missed || missed.said !== 'Missed — new date? (1)' || missed.n !== 1 || missed.open) bad.push('(a) the overdue one-off is not alone under a shut "Missed — new date? (1)": ' + JSON.stringify(missed));
    await pg.evaluate(() => [...document.querySelectorAll('#screen .dk-line > summary')].find(x => /^Prayer/.test(x.textContent.trim())).click());
    await pg.waitForTimeout(300);
    const opts = await pg.evaluate(() => { const d = [...document.querySelectorAll('#screen .dk-line')].find(x => /^Prayer/.test(x.querySelector('summary').textContent.trim()));
      return [...d.querySelectorAll('.kc-fold-in [data-do="dk-pick"]')].map(b => b.textContent.trim()); });
    if (opts.join('|') !== 'Option A|Option B') bad.push('(a) tapping the slot line does not list its options: ' + JSON.stringify(opts));
    await pg.evaluate(() => [...document.querySelectorAll('#screen .dk-line > summary')].find(x => /^Prayer/.test(x.textContent.trim())).click());
    await pg.waitForTimeout(300);
    fs.mkdirSync(path.join(ROOT, '.cache', 'docket-look'), { recursive: true });
    await pg.screenshot({ path: path.join(ROOT, '.cache', 'docket-look', 'onelist.png'), fullPage: false });
    /* (b) tap a line: only Edit and Delete */
    await pg.evaluate(() => [...document.querySelectorAll('#screen .dk-line > summary')].find(x => x.textContent.trim() === 'Drink water').click());
    await pg.waitForTimeout(300);
    const det = await pg.evaluate(() => { const d = [...document.querySelectorAll('#screen .dk-line')].find(x => /Drink water/.test(x.querySelector('summary').textContent));
      const acts = [...d.querySelectorAll('.kc-fold-in [data-do]')].filter(b => b.offsetWidth > 0).map(b => b.getAttribute('data-do'));
      return { open: d.open, acts, words: d.querySelector('.kc-fold-in').textContent.replace(/Edit|Delete/g, '').trim() }; });
    if (!det.open || det.acts.join() !== 'dk-fedit,dk-fdel' || det.words) bad.push('(b) a tapped line shows more than Edit and Delete: ' + JSON.stringify(det));
    await pg.evaluate(() => document.querySelector('#screen .dk-line[open] [data-do="dk-fedit"]').click());
    await pg.waitForTimeout(800);
    const ed = await pg.evaluate(() => { const d = document.querySelector('#screen .dk-line[open]'); if (!d) return null;
      return { fields: [...d.querySelectorAll('[data-dke]')].map(x => x.getAttribute('data-dke')), save: !!d.querySelector('[data-do="dk-fsave"]') }; });
    if (!ed || ed.fields.join() !== 'title' || !ed.save) bad.push('(b) Edit does not open the title alone: ' + JSON.stringify(ed));
    await pg.evaluate(() => { const d = document.querySelector('#screen .dk-line[open]'), i = d.querySelector('[data-dke="title"]'); i.value = 'Drink a glass of water'; d.querySelector('[data-do="dk-fsave"]').click(); });
    await pg.waitForTimeout(1200);
    if (!(await pg.evaluate(() => [...document.querySelectorAll('#screen .dk-line > summary')].some(s => s.textContent.trim() === 'Drink a glass of water'))))
      bad.push('(b) Save does not rename the item');
    /* (c) tick Brush teeth: it goes under Done, which stays shut and counts it */
    await pg.evaluate(() => { const s = [...document.querySelectorAll('#screen .dk-line > summary')].find(x => /Brush teeth/.test(x.textContent)); s.querySelector('label.check').click(); });
    await pg.waitForTimeout(1200);
    const after = await pg.evaluate(lines), fold = await pg.evaluate(doneFold);
    if (after.some(l => /Brush teeth/.test(l.title))) bad.push('(c) a ticked item is still among the open lines');
    if (!fold || fold.said !== 'Done (2)' || fold.n !== 2 || fold.open || !fold.last) bad.push('(c) the ticked items are not folded into one shut "Done (2)" line at the foot: ' + JSON.stringify(fold));
    /* (d) the quick add */
    await pg.evaluate(() => { const i = document.querySelector('#screen .dk-qadd'); i.value = 'Water the plants'; document.querySelector('#screen [data-do="dk-qadd"]').click(); });
    await pg.waitForTimeout(1200);
    const last = await pg.evaluate(lines);
    if (!last.length || last[last.length - 1].title !== 'Water the plants') bad.push('(d) the quick add is not the last undated line: ' + last.map(l => l.title).join('|'));
    const saved = JSON.parse(CELL.now);
    if (saved.lists.length !== 1 || !saved.lists[0].items.some(i => i.title === 'Water the plants' && Object.keys(i).join() === 'title')) bad.push('(d) the quick add did not save an undated one-off in the one list');
    if (STALE.n || !SAVED.n) bad.push('(save) ' + SAVED.n + ' saves landed, ' + STALE.n + ' refused as stale');
  } catch (e) { bad.push(String((e && e.message) || e).split('\n')[0]); } finally { await pg.close(); await SB.done(); }
  console.log('docket-look: 8 rules (one card, the plan\'s order, tick+words lines, missed folds, slot options, Edit/Delete only, Done folds, quick add); ' + (bad.length ? bad.length + ' wrong' : 'all pass'));
  report('docket-look', bad, 'docket look rule(s) broken');
}
module.exports = { run };
main(module, run);
