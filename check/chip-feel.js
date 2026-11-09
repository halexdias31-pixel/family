#!/usr/bin/env node
/* @family. — check/chip-feel.js A TAP ON A FIND ANSWER IS SEEN AT ONCE AND NEVER LOST (720): at 4x CPU the tapped answer is lit in a frame before the funnel's redraw, and three taps in a row are three answers. Port CHIPFEEL_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.CHIPFEEL_PORT || 8172);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const LIT_MS = 250;   // a lit frame later than this, at 4x, is a press that felt ignored

function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f));
    });
    srv.on('error', e => { console.log('FAIL — check/chip-feel.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}

(async () => {
  const fails = [], said = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.addInitScript(p => {
      /* SIGNED IN AS check/ui.js's admin, whose Find asks the whole funnel. */
      try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin', profile: { first_name: 'Test', last_name: 'Admin' } })); } catch (e) {}
      const real = window.fetch;
      window.fetch = function (u, o) {
        if (String((u && u.url) || u).indexOf('script.google.com') !== -1) return Promise.resolve(new Response(o && o.method === 'POST' ? '{}' : p, { status: 200, headers: { 'content-type': 'application/json' } }));
        return real.apply(this, arguments);
      };
    }, FIXTURE);
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && LATER_IN && !(typeof LIBRARY_LATE !== 'undefined' && LIBRARY_LATE), null, { timeout: 90000 });
    await page.evaluate(() => go('stuff', true));
    await page.waitForTimeout(2500);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluate(() => {
      window.__F = [];
      /* EVERY FRAME, whether a lit answer is on Find's front page; and when the funnel's redraw starts. */
      const tick = () => { window.__F.push(['frame', performance.now(), !!document.querySelector('#s-stuff [data-do="facet-pick"].is-pressed')]); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-do="facet-pick"]')) window.__F.push(['click', performance.now()]); }, true);
      const real = window.paintStuff;
      window.paintStuff = function () { window.__F.push(['paint', performance.now()]); return real.apply(this, arguments); };
    });
    for (let k = 0; k < 3; k++) {
      /* A TAP COUNTED LIVE SHOWS THE LOADER FIRST (1100, paintStuffSoon_): the next answers are waited for, as a finger does. */
      await page.waitForSelector('#s-stuff .page.on [data-do="facet-pick"]', { timeout: 30000 }).catch(() => {});
      const el = page.locator('#s-stuff .page.on [data-do="facet-pick"]').first();
      if (!(await el.count())) { fails.push('tap ' + (k + 1) + ': Find\'s front page has no answer to tap, so the rule was NOT checked'); break; }
      const before = await page.evaluate(() => inFinder_(FINDERS[0], () => STUFF.filters.length));
      await page.evaluate(() => { window.__F = window.__F.filter(x => x[0] === 'never'); });
      await el.tap({ timeout: 10000 });
      await page.waitForFunction(n => inFinder_(FINDERS[0], () => STUFF.filters.length) > n, before, { timeout: 30000 })
        .catch(() => fails.push('tap ' + (k + 1) + ': the answer was tapped and no answer was taken — a lost tap'));
      await page.waitForFunction(() => window.__F.some(x => x[0] === 'paint'), null, { timeout: 30000 }).catch(() => {});
      const F = await page.evaluate(() => window.__F.slice());
      const click = F.find(x => x[0] === 'click'), paint = F.find(x => x[0] === 'paint');
      if (!click || !paint) { fails.push('tap ' + (k + 1) + ': no click or no redraw was seen'); continue; }
      const lit = F.find(x => x[0] === 'frame' && x[1] >= click[1] && x[1] <= paint[1] && x[2]);
      if (!lit) fails.push('tap ' + (k + 1) + ': no frame showed the tapped answer lit before the funnel redrew (redraw began ' + Math.round(paint[1] - click[1]) + ' ms after the click)');
      else if (lit[1] - click[1] > LIT_MS) fails.push('tap ' + (k + 1) + ': the answer was lit ' + Math.round(lit[1] - click[1]) + ' ms after the click, over ' + LIT_MS);
      else said.push('tap ' + (k + 1) + ': lit ' + Math.round(lit[1] - click[1]) + ' ms after the click');
      /* THE NEXT TAP AT ONCE, as a person does. */
    }
    await ctx.close();
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (process.env.VERBOSE === '1' || process.argv.includes('-v')) said.forEach(s => console.log('   ' + s));
  if (fails.length) { fails.forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — chip feel: at 4x CPU each tapped answer on Find is lit in a frame before the redraw, and three taps in a row are three answers');
})();
