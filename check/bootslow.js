#!/usr/bin/env node
/* @family. — check/bootslow.js THE SLOW BOX TELLS THE TRUTH (503): a cold load at 390px fetches no lazy library data; a hung or 404 data file never stops the boot; the box goes once the payload lands. Port BOOTSLOW_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.BOOTSLOW_PORT || 8167);
/* WHAT ONLY A CARD MAY ASK FOR — scripture, works, the icon masters, the race map, the e-ink sets. */
const LAZY = /^\/data\/(bible|quran|talmud|works|icons\/master)\/|^\/data\/(race-map|eink-)/;
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');

/* PER PAGE, by a header the page cannot forge: each scenario names what hangs and what is missing in its own query. */
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const [url, q = ''] = rq.url.split('?');
      const ref = new URLSearchParams(((rq.headers.referer || '').split('?')[1]) || '');
      if (ref.get('hang') && url.indexOf(ref.get('hang')) !== -1) return;           // never answers
      if (ref.get('gone') && url.indexOf(ref.get('gone')) !== -1) { rs.writeHead(404); return rs.end(); }
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f));
    });
    srv.on('error', e => { console.log('FAIL — check/bootslow.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}

async function visit(browser, { query, backendMs }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const asked = [];
  page.on('request', r => { try { asked.push({ path: new URL(r.url()).pathname, at: Date.now() }); } catch (e) {} });
  await page.addInitScript(([p, ms]) => {
    const real = window.fetch;
    window.fetch = function (u) {
      if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
        return new Promise(d => setTimeout(() => d(new Response(p, { status: 200, headers: { 'content-type': 'application/json' } })), ms));
      }
      return real.apply(this, arguments);
    };
  }, [FIXTURE, backendMs]);
  await page.goto(`http://localhost:${PORT}/index.html?${query}`, { waitUntil: 'commit' });
  return { ctx, page, asked };
}
const loaded = page => page.evaluate(() => typeof LOADED !== 'undefined' && LOADED === true);
const boxUp = page => page.evaluate(() => { const b = document.getElementById('boot-slow'); return !!b && !b.classList.contains('hidden'); });

(async () => {
  const fails = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const cold = await visit(browser, { query: 'v=cold', backendMs: 700 });
    const stuck = await visit(browser, { query: 'hang=textbooks.json&gone=practicals.json', backendMs: 700 });
    const late = await visit(browser, { query: 'v=late', backendMs: 33000 });
    await cold.page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && FIRST_PAINT_DONE, null, { timeout: 60000 })
      .catch(() => fails.push('a cold load at 390px did not finish within 60 seconds'));
    await new Promise(r => setTimeout(r, 2000));
    const lazy = cold.asked.filter(a => LAZY.test(a.path)).map(a => a.path);
    if (lazy.length) fails.push('a cold load fetched library data before any card asked for it: ' + [...new Set(lazy)].join(', '));
    /* PAST THE 30-SECOND WATCHDOG, with the late payload landing at 33. */
    await new Promise(r => setTimeout(r, 38000));
    if (!(await loaded(stuck.page))) fails.push('with data/textbooks.json hanging and data/practicals.json 404, the boot never finished');
    if (await boxUp(stuck.page)) fails.push('with a hung and a missing data file, the slow box came up after the code and payload had arrived');
    if (!(await loaded(late.page))) fails.push('a payload that answered at 33 seconds was never taken');
    if (await boxUp(late.page)) fails.push('the slow box stayed up after a late payload landed');
    if (await boxUp(cold.page)) fails.push('the slow box is up on a load that finished in seconds');
    if (process.env.VERBOSE === '1' || process.argv.includes('-v')) {
      console.log('   cold load asked for ' + cold.asked.length + ' files, none of them lazy library data');
    }
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (fails.length) { fails.forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — boot: no lazy data on a cold load; a hung or missing data file never holds it; the slow box only while code or payload is missing');
})();
