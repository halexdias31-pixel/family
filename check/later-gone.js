#!/usr/bin/env node
/* @family. — check/later-gone.js A SECOND BATCH THAT DOES NOT ARRIVE THROWS NOTHING § */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.LATER_GONE_PORT || 8173);
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
/* WITH SPOTLIGHT DATA, so `adoptSpotlight_` and the spotlight column have something to read. */
FIX.spotlight = [{ id: 'sp1', title: 'Spotlight check', body: 'One spotlight', on: true }];
const FIXTURE = JSON.stringify(FIX);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const LATER = [...(/window\.LATER\s*=\s*\[([\s\S]*?)\]/.exec(html) || [, ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
if (!LATER.length) { console.log('FAIL — check/later-gone.js cannot read window.LATER out of index.html, so NOTHING was checked'); process.exit(1); }

let refused = 0, gone = true;
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      const m = /^\/js\/([\w-]+)\.js$/.exec(url);
      if (gone && (url === '/bundle/later.js' || (m && LATER.indexOf(m[1]) !== -1))) { refused++; rs.writeHead(503); return rs.end(); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f));
    });
    srv.on('error', e => { console.log('FAIL — check/later-gone.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}

(async () => {
  const fails = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('uncaught: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && /is not defined/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
    await page.addInitScript(p => {
      try { localStorage.setItem('familyUser', JSON.stringify({ personId: 'P1', name: 'Check Person', token: 't' })); } catch (e) {}
      const real = window.fetch;
      window.__reports = [];
      window.fetch = function (u, o) {
        if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
          if (o && o.method === 'POST') {
            try { const b = JSON.parse(o.body); if (b.action === 'clientError') window.__reports.push(b.message + ' (' + b.where + ', screen ' + b.screen + ')'); } catch (e) {}
            return Promise.resolve(new Response('{}'));
          }
          return Promise.resolve(new Response(p, { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return real.apply(this, arguments);
      };
    }, FIXTURE);
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
    await page.waitForFunction(() => typeof go === 'function' && typeof TAB_ORDER !== 'undefined' && document.querySelector('.screen'), null, { timeout: 30000 });
    await page.waitForFunction(() => typeof oops_ === 'function', null, { timeout: 30000 });
    await page.waitForTimeout(2500);
    if (!refused) fails.push('no LATER request was refused, so it proved nothing');
    for (const id of ['stuff', 'spotlight']) {
      await page.evaluate(id => { try { if (typeof SCREENS !== 'undefined' && SCREENS[id]) go(id, true); } catch (e) { window.__reports.push('go threw: ' + e.message + ' (screen ' + id + ')'); } }, id);
      await page.waitForTimeout(450);
    }
    /* AND THEN THEY ARRIVE: the app picks them up by itself. */
    gone = false;
    await page.waitForFunction(() => typeof LATER_IN !== 'undefined' && LATER_IN && typeof spotlightCards_ === 'function', null, { timeout: 30000 })
      .catch(() => fails.push('once the LATER files could be fetched again the app never took them in'));
    await page.waitForTimeout(800);
    const reps = await page.evaluate(() => window.__reports.slice());
    reps.filter(r => /is not defined/.test(r)).forEach(r => fails.push('reported while the LATER files were away: ' + r));
    errs.forEach(e => fails.push(e));
    await ctx.close();
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (fails.length) { [...new Set(fails)].forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — later gone: with the second batch refused (' + refused + ' asks) nothing read a LATER name, and it was taken in once it could be fetched');
})();
