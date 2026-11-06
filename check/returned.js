#!/usr/bin/env node
/* @family. — check/returned.js THE RETURNED FEATURES (1040 batch B), one 390x844 walk as an admin on the fixture, to data/returned-health.json. */
/*   Each feature the owner brought back is opened where it now lives (a Find card under its front answer, or its column) and recorded: */
/*   loads (drawn at all), errors (page errors while it was open), blank (no words and no picture), controls respond (one safe press changes */
/*   something). tools/health.js reads the file as `returned-features`: ideal 0, budget today's count (structure-budgets owner).            */
'use strict';
const fs = require('fs'), path = require('path');
const glass = require('./glass.js');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'data', 'returned-health.json');
const SHOTS = process.env.RF_SHOTS || '';
const wait = ms => new Promise(r => setTimeout(r, ms));
/* WHERE EACH RETURNED WIDGET IS: its front answer in Find. */
const WIDGETS = {
  Tools: ['calculator', 'timer', 'notepad', 'whiteboard', 'typing', 'speedread', 'countdowns', 'calendar', 'termdates', 'timetable', 'docket', 'mat',
    'favlinks', 'console', 'spotify', 'rewrite', 'pixel', 'libcards'],
  Games: ['boardgames', 'wordgames', 'console'], Videos: ['videos'], Reels: ['reels'], Newspaper: ['newspaper'], Flyers: ['flyers'], Posters: ['poster'],
  Verse: ['verse'], Shop: ['cart'],
};
WIDGETS.Tools = WIDGETS.Tools.filter(w => w !== 'console');
const COLUMNS = ['spotlight', 'feed', 'reel', 'dm', 'saved', 'booking', 'shop', 'web', 'tutors', 'students', 'parents', 'apprentices', 'apprentice'];
/* A SAFE PRESS: not a card's own extras (star, lock, suggest, share, edit, hide, delete, move), which every card has and prove nothing. */
const SKIP = /del|bin|lock|star|suggest|share|save|top|edit|hide|eye|lay-|help|sign|out|report|facet|chip/i;

/* IN THE PAGE: what a host draws, and one safe press inside it. */
async function probe(page, sel, label) {
  return page.evaluate(async ({ sel, skip }) => {
    const host = document.querySelector(sel);
    if (!host) return { loads: false };
    host.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 2000));
    const text = (host.innerText || '').replace(/\s+/g, ' ').trim();
    const pics = host.querySelectorAll('canvas, img, svg, video, iframe').length;
    const re = new RegExp(skip);
    const ctl = [...host.querySelectorAll('button, [data-do], input, select, textarea')].filter(e => e.offsetParent !== null && !e.disabled);
    const press = ctl.find(e => !(e.closest('.tile-row.card-x, .card-extras')) && !re.test((e.dataset && e.dataset.do) || '') && !re.test(e.getAttribute('aria-label') || '') && e.tagName !== 'INPUT' && e.tagName !== 'TEXTAREA' && e.tagName !== 'SELECT');
    let responds = null, pressed = '';
    if (press) {
      pressed = (press.dataset && press.dataset.do) || press.getAttribute('aria-label') || press.textContent.trim().slice(0, 30);
      const before = document.body.innerHTML.length + ':' + host.innerHTML, sc = location.hash;
      press.click();
      await new Promise(r => setTimeout(r, 1500));
      responds = (document.body.innerHTML.length + ':' + host.innerHTML) !== before || location.hash !== sc;
    }
    return { loads: true, words: text.length, sample: text.slice(0, 80), pics, controls: ctl.length, pressed, responds };
  }, { sel, skip: SKIP.source });
}
function judge(name, where, r, errs) {
  const W = [], add = say => W.push({ kind: 'returned-features', where: name + ' (' + where + ')', say });
  if (!r.loads) { add('does not load: nothing drawn where it lives'); return W; }
  if (r.words < 15 && !r.pics) add(`blank: ${r.words} characters and no picture ("${r.sample}")`);
  errs.forEach(e => add('page error: ' + e));
  if (!r.controls) add('no controls to press');
  else if (r.responds === null) add(`${r.controls} controls, none a safe press (only the card's own extras or text boxes)`);
  else if (!r.responds) add(`pressed "${r.pressed}" and nothing changed`);
  return W;
}

(async () => {
  const server = await glass.serve('RF_PORT'), port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  let errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', d => d.dismiss().catch(() => {}));
  const user = Object.assign({ token: 'rf-token' }, glass.VIEWERS.find(v => v.as === 'admin').user);
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* the walk shows it */ } }, user);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: r.request().method() === 'POST' ? '{"success":true}' : glass.FIXTURE }));
  const load = async () => { await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 }); await wait(2500);
    await page.evaluate(() => go('stuff')); await wait(2500);
    /* FIND REMEMBERS ITS CHOSEN ANSWERS ACROSS A RELOAD: start each feature from the front menu. */
    if (await page.evaluate(() => { const c = document.querySelector('#s-stuff [data-do="filter-clear"]'); if (c) c.click(); return !!c; })) await wait(2500); };
  const each = [], work = [];
  await load();
  const front = await page.evaluate(() => [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')].map(e => (e.querySelector('.k') || e).textContent.trim()));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'rf-find-front.png') });
  for (const top of Object.keys(WIDGETS)) {
    await load(); errs = [];
    const ok = await page.evaluate(t => { const e = [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')].find(e => (e.querySelector('.k') || e).textContent.trim() === t); if (e) e.click(); return !!e; }, top);
    await wait(2500);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'rf-' + top.toLowerCase() + '.png') });
    for (const id of WIDGETS[top]) {
      errs = [];
      const r = ok ? await probe(page, '#s-stuff #wgt-' + id) : { loads: false };
      const w = ok ? judge(id, 'Find › ' + top, r, errs) : [{ kind: 'returned-features', where: id + ' (Find › ' + top + ')', say: `no "${top}" answer on Find's front menu` }];
      each.push({ feature: id, where: 'Find › ' + top, r, findings: w.map(x => x.say) }); work.push(...w);
    }
  }
  for (const col of COLUMNS) {
    await load(); errs = [];
    const went = await page.evaluate(c => { try { go(c); return true; } catch (e) { return String(e.message); } }, col);
    await wait(2500);
    const r = went === true ? await probe(page, '#s-' + col) : { loads: false };
    if (SHOTS && ['web', 'tutors', 'booking', 'feed'].includes(col)) await page.screenshot({ path: path.join(SHOTS, 'rf-col-' + col + '.png') });
    const w = judge(col, 'column', r, errs);
    each.push({ feature: col, where: 'column', r, findings: w.map(x => x.say) }); work.push(...w);
  }
  await browser.close(); server.close();
  fs.writeFileSync(OUT, JSON.stringify({ front, each, work }, null, 1) + '\n');
  console.log(`returned-features: ${work.length} findings over ${each.length} features; front menu: ${front.join(' | ')}`);
  each.filter(e => e.findings.length).forEach(e => console.log('  ' + e.feature + ' (' + e.where + '): ' + e.findings.join('; ')));
  process.exit(0);
})().catch(e => { console.error('returned: ' + (e && e.stack || e)); process.exit(2); });
