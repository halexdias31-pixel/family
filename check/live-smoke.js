#!/usr/bin/env node
/* @family. — check/live-smoke.js THE LIVE SITE, SIGNED OUT, AT A PHONE AND A DESK (780). § */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const URL_ = process.env.LIVE_URL || 'https://atfamily.co.uk/';
const ORIGIN = new URL(URL_).origin;
const shotsArg = process.argv.find(a => a.startsWith('--shots='));
const SHOTS = shotsArg ? shotsArg.slice(8) : '';
const EXPECT = String(process.env.EXPECT_CSS || '').trim().replace(/^"|"$/g, '');
const WIDTHS = [390, 1440];

(async () => {
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const bad = [];
  let visited = 0;
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, isMobile: width < 600, hasTouch: width < 600 });
    const page = await ctx.newPage();
    let where = 'load';
    /* "Failed to load resource" names no URL; same-origin ones are caught below by URL, others are not ours. */
    page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) bad.push(width + 'px ' + where + ': console error: ' + m.text().slice(0, 300)); });
    page.on('pageerror', e => bad.push(width + 'px ' + where + ': page error: ' + String(e && e.message || e).slice(0, 300)));
    /* ERR_ABORTED is a request the page itself cancelled (a navigation replaced), not a failure. */
    page.on('requestfailed', r => { if (r.url().startsWith(ORIGIN) && !/ERR_ABORTED/.test((r.failure() || {}).errorText || '')) bad.push(width + 'px ' + where + ': request failed: ' + r.url() + ' (' + ((r.failure() || {}).errorText || '?') + ')'); });
    page.on('response', r => { if (r.url().startsWith(ORIGIN) && r.status() >= 400) bad.push(width + 'px ' + where + ': ' + r.status() + ' ' + r.url()); });
    await page.goto(URL_, { waitUntil: 'load', timeout: 60000 });
    /* THE PAYLOAD HAS ARRIVED when awaiting_() says so (CLAUDE.md: never !LOADED). */
    try {
      await page.waitForFunction(() => typeof awaiting_ === 'function' && !awaiting_(), null, { timeout: 60000 });
    } catch (e) { bad.push(width + 'px: the payload was still awaited after 60 s'); }
    if (EXPECT) {
      const live = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--css-version').trim().replace(/^"|"$/g, ''));
      if (live !== EXPECT) bad.push(width + 'px: live --css-version is "' + live + '", main has "' + EXPECT + '" — the deploy has not landed');
    }
    const ids = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS : []).map(t => t && t.id).filter(Boolean));
    if (!ids.length) bad.push(width + 'px: no columns in TABS — nothing could be visited');
    for (const id of ids) {
      where = id;
      try {
        await page.evaluate(i => go(i, false, true), id);
        await page.waitForTimeout(700);
        visited++;
        if (SHOTS) await page.screenshot({ path: path.join(SHOTS, width + '-' + id + '.png') });
      } catch (e) { bad.push(width + 'px ' + id + ': go() threw: ' + String(e.message).slice(0, 200)); }
    }
    await ctx.close();
  }
  await browser.close();
  if (bad.length) {
    console.log('FAILED — ' + bad.length + ' problem(s) on ' + URL_ + ' (' + visited + ' column visits):');
    bad.forEach(b => console.log('  ' + b));
    process.exit(1);
  }
  console.log('OK — ' + URL_ + ': ' + visited + ' column visits at ' + WIDTHS.join(' and ') + ' px, no error' + (EXPECT ? ', css ' + EXPECT : ''));
})().catch(e => { console.log('FAILED — the smoke test itself threw: ' + e.message); process.exit(1); });
