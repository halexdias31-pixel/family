#!/usr/bin/env node
/* @family. — check/timelines.js THE TIMELINES (1040 batch F): every timeline card an animation, walked at 390x844 as a student on the fixture. */
/*   Static: each data/timelines.json row has five events at least, each an event row, and is a card under Library › History › Timelines. */
/*   Walked: History asks histKind first, each card draws its stage within 300 ms, Next and Play move the event shown, and the three     */
/*   tiles stay where they were (stable-controls). To data/timeline-health.json, read by tools/health.js as `timeline-anim`, ideal 0.    */
/*   TL_SHOTS=<dir> also saves three moments of the first timeline.                                                                       */
'use strict';
const fs = require('fs'), path = require('path');
const glass = require('./glass.js');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'data', 'timeline-health.json');
const SHOTS = process.env.TL_SHOTS || '', DRAW_MS = 300;
const wait = ms => new Promise(r => setTimeout(r, ms));
const work = [], add = (where, say) => work.push({ kind: 'timeline-anim', where, say });

const tls = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'timelines.json'), 'utf8')); } catch (e) { return null; } })();
const evIds = new Set((JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'timeline.json'), 'utf8')) || []).map(e => e.id));
if (!tls || !tls.length) add('data/timelines.json', 'missing or empty — run python3 tools/timelines.py');
(tls || []).forEach(t => {
  if ((t.events || []).length < 5) add(t.id, (t.events || []).length + ' events — five at least');
  (t.events || []).forEach(e => { if (!evIds.has(e.id)) add(t.id, e.id + ' is no event in data/timeline.json'); if (!Array.isArray(e.px) || e.px.length !== 16) add(t.id, e.id + ' has no 16x16 scene'); });
});

const pick = (page, t) => page.evaluate(t => { const e = [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')].find(e => (e.querySelector('.k') || e).textContent.trim() === t); if (e) e.click(); return !!e; }, t);
const asked = page => page.evaluate(() => [...document.querySelectorAll('#s-stuff [data-do="facet-pick"]')].map(e => (e.querySelector('.k') || e).textContent.trim()));
const rects = (page, key) => page.evaluate(k => { const s = [...document.querySelectorAll('.tl-anim')].find(e => e.getAttribute('data-tl') === k);
  return s ? [...s.querySelectorAll('.tl-ctl button')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top - s.getBoundingClientRect().top), Math.round(r.width)].join(','); }).join(' ') : ''; }, key);
const shown = (page, key) => page.evaluate(k => { const s = [...document.querySelectorAll('.tl-anim')].find(e => e.getAttribute('data-tl') === k); return s ? (s.querySelector('.tl-label') || {}).textContent || '' : ''; }, key);

(async () => {
  let walked = 0, firstAsk = '';
  if (tls && tls.length) {
    const server = await glass.serve('TL_PORT'), port = server.address().port;
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    const user = Object.assign({ token: 'tl-token' }, glass.VIEWERS.find(v => v.as === 'student').user);
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* the walk says so */ } }, user);
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: r.request().method() === 'POST' ? '{"success":true}' : glass.FIXTURE }));
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 });
    await page.evaluate(() => go('stuff'));
    await page.waitForFunction(() => typeof DATA !== 'undefined' && (DATA.timelines || []).length && finderSettled_(), null, { timeout: 90000 }).catch(() => {});
    await wait(1500);
    for (const step of ['Library', 'History']) { if (!(await pick(page, step))) add('Find', 'no "' + step + '" answer (asked: ' + (await asked(page)).slice(0, 8).join(', ') + ')'); await wait(1500); }
    const kinds = await asked(page);
    firstAsk = kinds.join(', ');
    ['Manuscripts', 'People', 'Works', 'Events', 'Timelines'].forEach(k => { if (kinds.indexOf(k) < 0) add('Library › History', 'does not ask "' + k + '" first (asked: ' + kinds.slice(0, 8).join(', ') + ')'); });
    await pick(page, 'Timelines'); await wait(1500);
    for (let n = 0; n < 4 && !(await page.$('.tl-anim')); n++) { await pick(page, "Doesn't matter"); await wait(1200); }
    const keys = await page.evaluate(() => histTimelines_().map(x => x.key));
    if (keys.length !== tls.length) add('Find', keys.length + ' timeline cards for ' + tls.length + ' rows');
    for (const key of keys) {
      /* DRAWN ON OPEN: the card built and laid out in a fresh host, timed. */
      const ms = await page.evaluate(k => { const x = histTimelines_().find(y => y.key === k), d = document.createElement('div'), t0 = performance.now();
        d.innerHTML = stuffCard(x); document.body.appendChild(d); d.getBoundingClientRect(); const ok = !!d.querySelector('.tl-track .tl-ev'); d.remove();
        return ok ? performance.now() - t0 : -1; }, key);
      if (ms < 0) add(key, 'its card has no animation stage');
      else if (ms > DRAW_MS) add(key, 'took ' + Math.round(ms) + ' ms to draw (budget ' + DRAW_MS + ')');
    }
    /* TWO WALKED: scrolled to, stepped, played; the tiles must not move. */
    for (const key of keys.slice(0, 2)) {
      const there = await page.evaluate(k => { const s = [...document.querySelectorAll('.tl-anim')].find(e => e.getAttribute('data-tl') === k); if (s) s.scrollIntoView({ block: 'center' }); return !!s; }, key);
      if (!there) { add(key, 'not drawn in Find under Timelines'); continue; }
      walked++;
      await wait(400);
      await page.evaluate(() => { if (typeof tlStop_ === 'function') tlStop_(); });
      const r0 = await rects(page, key), s0 = await shown(page, key);
      if (SHOTS && walked === 1) await page.screenshot({ path: path.join(SHOTS, 'tl-1-start.png') });
      await page.evaluate(k => { const s = [...document.querySelectorAll('.tl-anim')].find(e => e.getAttribute('data-tl') === k); s.querySelector('[data-do="tl-step"][data-by="1"]').click(); }, key);
      await wait(1100);
      const r1 = await rects(page, key), s1 = await shown(page, key);
      if (s1 === s0) add(key, 'Next did not change the event shown');
      if (r1 !== r0) add(key, 'the controls moved on Next (' + r0 + ' → ' + r1 + ')');
      if (SHOTS && walked === 1) await page.screenshot({ path: path.join(SHOTS, 'tl-2-next.png') });
      await page.evaluate(k => { const s = [...document.querySelectorAll('.tl-anim')].find(e => e.getAttribute('data-tl') === k); s.querySelector('[data-do="tl-play"]').click(); }, key);
      await wait(5800);
      const r2 = await rects(page, key), s2 = await shown(page, key);
      if (s2 === s1) add(key, 'Play did not move on in 5.8 s');
      if (r2 !== r0) add(key, 'the controls moved while playing (' + r0 + ' → ' + r2 + ')');
      if (SHOTS && walked === 1) await page.screenshot({ path: path.join(SHOTS, 'tl-3-playing.png') });
      await page.evaluate(() => tlStop_());
    }
    if (SHOTS) { await page.evaluate(() => { const s = document.querySelectorAll('.tl-anim')[1]; if (s) s.scrollIntoView({ block: 'center' }); }); await wait(500); await page.screenshot({ path: path.join(SHOTS, 'tl-4-second.png') }); }
    errs.forEach(e => add('page', 'page error: ' + e));
    await browser.close(); server.close();
  }
  fs.writeFileSync(OUT, JSON.stringify({ timelines: (tls || []).length, walked, historyAsks: firstAsk, count: work.length, work }, null, 1) + '\n');
  if (work.length) { work.forEach(w => console.log('timeline-anim: ' + w.where + ' — ' + w.say)); process.exit(1); }
  console.log('timeline-anim: ' + tls.length + ' timelines, ' + walked + ' walked — each an animation, drawn in time, controls still');
})().catch(e => { console.error('timeline-anim: COULD NOT RUN — ' + e.message); process.exit(2); });
