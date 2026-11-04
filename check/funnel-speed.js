#!/usr/bin/env node
/* @family. — check/funnel-speed.js A FIND TAP IS QUICK (805): at 4x CPU on a 390x844 phone, each answer tapped down five funnel paths is drawn, next question and all, within the budget. Port FUNNELSPEED_PORT; FUNNEL_BUDGET_MS, -v. */
'use strict';
require('./quiet');
const glass = require('./glass.js');

/* A TAP'S BUDGET, tap to the frame after it, at 4x: deep steps sit near 150-300 ms, a tap on the whole library 400-850 (805, was 1-14 s). */
const BUDGET = Number(process.env.FUNNEL_BUDGET_MS || 1200);
/* AND THE MEDIAN OVER EVERY TAP, which is what a person feels walking down. */
const MEDIAN = Number(process.env.FUNNEL_MEDIAN_MS || 450);
const VERBOSE = process.argv.includes('-v') || process.env.VERBOSE === '1';
/* FIVE PATHS, by the answer's first letters; a number is "the nth answer offered". */
const PATHS = [
  ['Practice', 'Questions', 'Maths', 'Past paper', 0],
  ['Practice', 'Questions', 'Biology', 'A-Level', 'AQA'],
  ['Library', 0, 0],
  ['Practice', 'Answers', 0, 0],
  ['Practice', 'Questions', 'Chemistry', 'GCSE', 0],
];

(async () => {
  const server = await glass.serve('FUNNELSPEED_PORT');
  let browser;
  try { browser = await require('playwright').chromium.launch(); }
  catch (e) { console.log('FAIL — check/funnel-speed.js: no browser — ' + e.message); server.close(); process.exit(2); }
  const fails = [], lines = [], all = [];
  try {
    const v = glass.VIEWERS.find(x => x.as === 'student');
    const s = await glass.open(browser, server.address().port, v, 390, 844, { settle: 300 });
    if (!s.ready) throw new Error('the payload never landed');
    const page = s.page;
    const reset = () => { inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; }); paintStuff(); };
    await page.evaluate(() => go('stuff'));
    await page.waitForTimeout(3000);
    await page.evaluate(reset);
    await page.waitForTimeout(5000);
    /* WHAT IS READ IN THE QUIET (`facetIndexJobs_`: the columns, then every card's pages) is part of what is measured: a phone left
       a few seconds has it. */
    await page.waitForFunction(() => typeof facetIndexJobs_ === 'function' && !facetIndexJobs_().length && !aheadBusy_(), null, { timeout: 180000, polling: 250 })
      .catch(() => fails.push('the quiet reading (facet columns, pages) was still going after three minutes'));
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    for (const p of PATHS) {
      await page.evaluate(reset);
      await page.waitForTimeout(800);
      const out = [];
      for (const want of p) {
        const r = await page.evaluate(async want => {
          const bs = [...document.querySelectorAll('#s-stuff #stuff-groups [data-do="facet-pick"]')];
          if (!bs.length) return null;
          const b = typeof want === 'string' ? bs.find(x => (x.dataset.value || '').indexOf(want) === 0) : bs[Math.min(want, bs.length - 1)];
          if (!b) return { missing: want, offered: bs.map(x => x.dataset.value).slice(0, 12).join(', ') };
          const label = b.dataset.field + '=' + b.dataset.value;
          const t0 = performance.now();
          pressAct_(b, {});
          void document.body.offsetHeight;
          await new Promise(ok => requestAnimationFrame(() => setTimeout(ok, 0)));
          return { label, ms: Math.round(performance.now() - t0) };
        }, want);
        if (!r) break;
        if (r.missing !== undefined) { fails.push(`path ${JSON.stringify(p)}: no answer starting "${r.missing}" (offered ${r.offered})`); break; }
        out.push(r);
        all.push(r.ms);
        if (r.ms > BUDGET) fails.push(`${r.label} took ${r.ms} ms at 4x CPU, over the ${BUDGET} ms budget (path ${JSON.stringify(p)})`);
        await page.waitForTimeout(400);
      }
      if (!out.length) fails.push(`path ${JSON.stringify(p)}: nothing could be tapped`);
      lines.push(out.map(r => r.label + ' ' + r.ms).join(' | '));
    }
    if (s.errors.length) fails.push('page errors: ' + s.errors.slice(0, 3).join(' / '));
  } catch (e) {
    fails.push('could not measure: ' + e.message);
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
  const sorted = all.slice().sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  if (!sorted.length) fails.push('no tap was measured');
  else if (median > MEDIAN) fails.push(`the median tap took ${median} ms at 4x CPU, over the ${MEDIAN} ms budget`);
  if (VERBOSE || fails.length) lines.forEach(l => console.log('  ' + l));
  if (fails.length) {
    fails.forEach(f => console.log('FAIL — ' + f));
    process.exit(1);
  }
  console.log(`OK — ${all.length} Find taps down ${PATHS.length} paths at 4x CPU: median ${median} ms, slowest ${sorted[sorted.length - 1]} ms (budget ${BUDGET}, median ${MEDIAN})`);
})().catch(e => { console.log('FAIL — check/funnel-speed.js: ' + e.message); process.exit(1); });
