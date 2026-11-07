#!/usr/bin/env node
/* @family. — check/later.js NO SCREEN READS A LATER FILE'S NAME BEFORE IT HAS ARRIVED (720): every column is started with the LATER files held, then they are let go one by one and none may show early. Port LATER_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.LATER_PORT || 8171);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const LATER = [...(/window\.LATER\s*=\s*\[([\s\S]*?)\]/.exec(html) || [, ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
/* THE LAZY FILES (1080) are asked for only when a widget of theirs starts, so they are not held or waited for here. */
const LAZY = [...(/window\.LAZY\s*=\s*\[([\s\S]*?)\]/.exec(html) || [, ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
LAZY.forEach(f => { const i = LATER.indexOf(f); if (i !== -1) LATER.splice(i, 1); });
if (!LATER.length) { console.log('FAIL — check/later.js cannot read window.LATER out of index.html, so NOTHING was checked'); process.exit(1); }

/* ONE NAME EACH LATER FILE DECLARES, to ask whether it is in yet. */
const MARK = {};
LATER.forEach(f => { const m = /^function ([A-Za-z_$][\w$]*)/m.exec(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')); if (m) MARK[f] = m[1]; });
/* THE LATER FILES WAIT HERE, by name, until the check lets them go. */
const held = new Map();
let open = false;
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      const send = () => { rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f)); };
      const m = /^\/js\/([\w-]+)\.js$/.exec(url);
      if (m && LATER.indexOf(m[1]) !== -1 && !open) held.set(m[1], send); else send();
    });
    srv.on('error', e => { console.log('FAIL — check/later.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
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
    page.on('console', m => { if (m.type() === 'error' && /is not defined|before initialization/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
    await page.addInitScript(p => {
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
    const ids = await page.evaluate(() => TAB_ORDER.slice());
    for (const id of ids) {
      await page.evaluate(id => { try { go(id, true); } catch (e) { window.__reports.push('go threw: ' + e.message + ' (screen ' + id + ')'); } }, id);
      await page.waitForTimeout(450);    // past afterSlide_'s 300ms, where a column's widgets are started
    }
    const still = await page.evaluate(() => typeof LATER_IN !== 'undefined' && !LATER_IN);
    if (!still) fails.push('the LATER files were in before the walk ended, so it proved nothing');
    /* ONE AT A TIME (720): none of their names may appear until the last is in, or a column can read a half-loaded app (WIDGETS, 670). */
    const names = Object.values(MARK);
    const FILES = [...(/window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html) || [, ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    let served = 0;
    for (let k = 0; served < LATER.length && k < 600; k++) {
      if (!held.size) { await page.waitForTimeout(50); continue; }
      const f = FILES.find(x => held.has(x));    // the order they run in
      held.get(f)(); held.delete(f); served++;
      if (served === LATER.length) break;
      await page.waitForTimeout(120);
      const seen = await page.evaluate(ns => ns.filter(n => { try { return eval('typeof ' + n) === 'function'; } catch (e) { return false; } }), names);
      if (seen.length) { fails.push('with ' + served + ' of ' + LATER.length + ' LATER files in, ' + seen.slice(0, 4).join(', ') + ' could already be read and the rest could not — they must arrive in one task'); break; }
    }
    open = true; [...held.values()].forEach(f => f()); held.clear();
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && LATER_IN, null, { timeout: 60000 })
      .catch(() => fails.push('once the LATER files were let go the app never loaded'));
    await page.waitForTimeout(800);
    const reps = await page.evaluate(() => window.__reports.slice());
    reps.forEach(r => fails.push('reported while the LATER files were away: ' + r));
    errs.forEach(e => fails.push(e));
    if (process.env.VERBOSE === '1' || process.argv.includes('-v')) console.log('   walked ' + ids.length + ' columns with ' + LATER.length + ' LATER files held');
    await ctx.close();
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (fails.length) { [...new Set(fails)].forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — later files: every column gone to and started while the ' + LATER.length + ' LATER files were away, and nothing read a name they declare');
})();
