#!/usr/bin/env node
/* @family. — check/kp-centred.js FIND STAYS CENTRED WITH THE KEYPAD UP (720): at 390x844 the card is centred above the pad, its box holds still as you type, and it is centred again when the pad goes. Port KPCENTRED_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.KPCENTRED_PORT || 8174);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SLACK = 10;   // px off the middle that still reads as centred

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
    srv.on('error', e => { console.log('FAIL — check/kp-centred.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}
/* WHERE THE FRONT CARD, THE BOX AND THE PAD ARE, in window pixels. */
const geo = (page, col) => page.evaluate(col => {
  const pg = document.querySelector('#s-' + col + ' > .page.on'), r = pg && pg.getBoundingClientRect();
  const kp = document.getElementById('kp'), up = !!(kp && !kp.hidden && kp.getBoundingClientRect().height);
  const box = document.querySelector('#s-' + col + ' > .page.on input');
  return { mid: r ? (r.top + r.bottom) / 2 : null, h: r ? r.height : 0, padTop: up ? kp.getBoundingClientRect().top : null,
           box: box ? box.getBoundingClientRect().top : null, vh: innerHeight };
}, col);

(async () => {
  const fails = [], said = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.addInitScript(p => {
      try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin', profile: { first_name: 'Test', last_name: 'Admin' } })); } catch (e) {}
      const real = window.fetch;
      window.fetch = function (u, o) {
        if (String((u && u.url) || u).indexOf('script.google.com') !== -1) return Promise.resolve(new Response(o && o.method === 'POST' ? '{}' : p, { status: 200, headers: { 'content-type': 'application/json' } }));
        return real.apply(this, arguments);
      };
    }, FIXTURE);
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && LATER_IN && !(typeof LIBRARY_LATE !== 'undefined' && LIBRARY_LATE), null, { timeout: 90000 });
    for (const col of ['stuff', 'res']) {
      await page.evaluate(col => go(col, true), col);
      await page.waitForTimeout(2000);
      const box = page.locator('#s-' + col + ' > .page.on input').first();
      if (!(await box.count())) { fails.push(col + ': no box on the card in front, so NOTHING was checked'); continue; }
      for (const round of [1, 2]) {
        await box.tap(); await page.waitForTimeout(900);
        const a = await geo(page, col);
        if (a.padTop === null) { fails.push(col + ': the @family. keypad did not open on the box'); break; }
        const want = (a.padTop - 12) / 2 + 0;   // the middle of what shows above the pad (`glassSeenH_`)
        if (Math.abs(a.mid - want) > SLACK + 6) fails.push(col + ' (open ' + round + '): the card\'s middle is at ' + Math.round(a.mid) + ', not the middle of what shows above the pad (' + Math.round(want) + ')');
        if (a.box > a.padTop - 12) fails.push(col + ' (open ' + round + '): the box is under the keypad');
        let last = a.box;
        for (const ch of 'phot') {
          await page.keyboard.type(ch); await page.waitForTimeout(500);
          const b = await geo(page, col);
          if (Math.abs(b.box - last) > 1) { fails.push(col + ' (open ' + round + '): the box moved ' + Math.round(b.box - last) + 'px as "' + ch + '" was typed'); break; }
          last = b.box;
        }
        await page.evaluate(() => { document.activeElement && document.activeElement.blur(); kpClose_(); });
        await page.waitForTimeout(900);
        const c = await geo(page, col);
        if (Math.abs(c.mid - c.vh / 2) > SLACK) fails.push(col + ' (close ' + round + '): with the pad gone the card\'s middle is at ' + Math.round(c.mid) + ', not ' + c.vh / 2);
        said.push(col + ' round ' + round + ': above the pad ' + Math.round(a.mid) + ' (want ' + Math.round(want) + '), closed ' + Math.round(c.mid));
        await page.evaluate(col => { const i = document.querySelector('#s-' + col + ' > .page.on input'); if (i) { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); } }, col);
        await page.waitForTimeout(900);
      }
    }
    await ctx.close();
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (process.env.VERBOSE === '1' || process.argv.includes('-v')) said.forEach(s => console.log('   ' + s));
  if (fails.length) { fails.forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — keypad: Find and Find 2 are centred above the pad, their box holds still as you type, and they are centred again when it goes');
})();
