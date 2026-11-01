#!/usr/bin/env node
/* @family. — check/press-deadline.js A POST THAT NEVER ANSWERS (534): pressed, the control says aria-busy and takes no second press; 61 s later it is free and a sentence says why. */
/* Admin at 390, every POST held for ever, the page clock moved on 61 s. --screen=<id> -v. Port: DEADLINE_PORT. */
'use strict';
require('./quiet');
const glass = require('./glass.js');

/* SENDING PRESSES THE FIXTURE ALWAYS DRAWS FOR AN ADMIN; each one found is measured, and none found fails. */
/* A star or a face is not here: its screen changes at once and its save runs in the background (pressFree_), so it holds nothing. */
const CANDIDATES = [
  { sid: 'feed', sel: '[data-do="post-approve"][data-on="1"]', what: 'Approve on a waiting post' },
];

async function main() {
  const ONLY = glass.arg('screen');
  const server = await glass.serve('DEADLINE_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('press-deadline: no browser — ' + e.message); server.close(); process.exit(2); }
  const fail = [], notes = [];
  let measured = 0;
  try {
    const admin = glass.VIEWERS.find(v => v.as === 'admin');
    const s = await glass.open(browser, port, admin, 390, 844, { settle: 300 });
    const page = s.page;
    try {
      /* THE CLOCK FIRST, then the app again under it, so api()'s timer is one the run can move. */
      await page.clock.install();
      const posts = [];
      await page.route('**://script.google.com/**', r => {
        if (r.request().method() !== 'POST') return r.fallback();
        try { posts.push(JSON.parse(r.request().postData() || '{}').action || '?'); } catch (e) { posts.push('?'); }
        /* NEVER ANSWERED: the request stays out until the page gives up on it. */
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      const ready = await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED
        && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).then(() => true, () => false);
      if (!ready) { fail.push('the payload or the library never arrived under the installed clock — nothing measured'); }
      for (const c of CANDIDATES.filter(x => ready && (!ONLY || x.sid === ONLY))) {
        await page.evaluate(sid => { try { closeSheet(); } catch (e) {} go(sid, false, true); }, c.sid);
        await page.waitForTimeout(700);
        /* ITS PAGE TO THE FRONT, wherever in the column it is drawn. */
        await page.evaluate(sel => {
          const el = document.querySelector('#s-' + AT + ' ' + sel), pg = el && el.closest('.page');
          if (!pg || pg.classList.contains('on')) return;
          const pos = [...pg.parentElement.querySelectorAll(':scope > .page')].indexOf(pg);
          try { goPage(AT, typeof logIndex_ === 'function' ? logIndex_(AT, pos) : pos); } catch (e) {}
        }, c.sel);
        await page.waitForTimeout(700);
        const at = await page.evaluate(sel => {
          const el = document.querySelector('#s-' + AT + ' > .page.on ' + sel);
          if (!el) return null;
          for (let p = el.parentElement; p && p.id !== 'screen'; p = p.parentElement) {
            if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight + 1) {
              const b = el.getBoundingClientRect(), pb = p.getBoundingClientRect();
              p.scrollTop += (b.top + b.height / 2) - (pb.top + pb.height / 2); break;
            }
          }
          const b = el.getBoundingClientRect();
          window.__dl = el;
          return { x: b.left + b.width / 2, y: b.top + b.height / 2, disabled: !!el.disabled };
        }, c.sel);
        if (!at) { notes.push(`${c.what}: not drawn on ${c.sid} — not measured`); continue; }
        posts.length = 0;
        await page.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
        await page.touchscreen.tap(at.x, at.y);
        await page.waitForTimeout(150);
        const busy = await page.evaluate(() => __dl.getAttribute('aria-busy'));
        if (!posts.length) { notes.push(`${c.what}: the press posted nothing — not measured`); continue; }
        measured++;
        if (busy !== 'true') fail.push(`${c.what}: with its request out the control does not say aria-busy="true"`);
        /* A SECOND PRESS PAST THE 350 ms WINDOW, while the first is still out, is dropped too. */
        await page.waitForTimeout(450);
        await page.evaluate(() => { if (__dl.isConnected) __dl.click(); });
        await page.waitForTimeout(100);
        if (posts.length > 1) fail.push(`${c.what}: pressed again with its request still out, it posted again (${posts.join(', ')})`);
        await page.clock.fastForward(61000);
        await page.waitForTimeout(200);
        const after = await page.evaluate(was => {
          const el = window.__dl, t = document.getElementById('toast');
          return { busy: !!el && el.getAttribute('aria-busy') === 'true', ring: !!el && (el.classList.contains('is-busy') || el.classList.contains('is-sending')),
                   disabled: !!el && !was && !!el.disabled, said: t ? t.textContent.trim() : '' };
        }, at.disabled);
        if (after.busy || after.ring || after.disabled) fail.push(`${c.what}: 61 s after a POST that never answered it is still ${after.busy ? 'aria-busy' : after.ring ? 'drawn busy' : 'disabled'}`);
        if (!after.said) fail.push(`${c.what}: 61 s after a POST that never answered nothing says what happened`);
        else if (/TypeError|Failed to fetch|AbortError|Exception/.test(after.said)) fail.push(`${c.what}: the deadline is said as raw error text: ${after.said}`);
      }
    } finally { await s.ctx.close(); }
  } finally { await browser.close(); server.close(); }
  if (!measured) fail.push('no sending press was measured — the deadline was not checked');
  if (notes.length) { console.log(`press-deadline: notes (${notes.length}):`); notes.forEach(n => console.log('  ' + n)); }
  if (fail.length) { console.error(`press-deadline: ${fail.length} finding(s)`); fail.forEach(f => console.error('  ! ' + f)); process.exit(1); }
  console.log(`press-deadline: a request that never answers lets its control go after a minute and says so — ${measured} press(es) measured`);
}
main().catch(e => { console.error('press-deadline: ' + e.stack); process.exit(2); });
