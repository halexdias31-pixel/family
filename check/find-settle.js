#!/usr/bin/env node
/* @family. — check/find-settle.js HOW LONG A FIND TAP TAKES TO SETTLE (tap → next question drawn whole, no loader), at 4x CPU, phone and iPad, admin and student. */
/* Prints a table; --max=<ms> fails a slower tap; --as=admin,child --on=phone,ipad pick. Same server and sign-in as check/chip-feel.js. Port FINDSETTLE_PORT. */
'use strict';
require('./quiet');
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.FINDSETTLE_PORT || 8173);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1];
const MAX = Number(arg('max') || 0);
const USERS = {
  admin: { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin', profile: { first_name: 'Test', last_name: 'Admin' } },
  child: { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12' },
};
const DEVICES = { phone: { width: 390, height: 844 }, ipad: { width: 820, height: 1180 } };
/* THE TAPS: a value by name, the first answer offered ('*'), or Back (the last chip dropped). */
const STEPS = [['Practice', 'Practice'], ['Questions', 'Questions'], ['Maths', 'Maths'], ['a board', '*'], ['a year', '*'],
  ['Back', 'BACK'], ['Back', 'BACK'], ['Back', 'BACK'], ['Back', 'BACK'], ['Back', 'BACK'], ['Library', 'Library'], ['a Library subject', '*']];

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
    srv.listen(PORT, () => done(srv));
  });
}

async function run(browser, who, dev) {
  const ctx = await browser.newContext({ viewport: DEVICES[dev], isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.addInitScript(([p, u]) => {
    try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* signed out, then */ }
    const real = window.fetch;
    window.fetch = function (x, o) {
      if (String((x && x.url) || x).indexOf('script.google.com') !== -1) return Promise.resolve(new Response(o && o.method === 'POST' ? '{}' : p, { status: 200, headers: { 'content-type': 'application/json' } }));
      return real.apply(this, arguments);
    };
  }, [FIXTURE, USERS[who]]);
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && LATER_IN && finderSettled_(), null, { timeout: 180000, polling: 500 });
  await page.evaluate(() => go('stuff', true));
  await page.waitForTimeout(3000);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const out = [];
  for (const [name, want] of STEPS) {
    const r = await page.evaluate(want => new Promise(done => {
      const groups = document.getElementById('stuff-groups');
      const n0 = inFinder_(FINDERS[0], () => STUFF.filters.length);
      let el = null;
      if (want === 'BACK') el = document.querySelector('#stuff-chips [data-do="filter-drop"][data-i="' + (n0 - 1) + '"]');
      else {
        const all = [...groups.querySelectorAll('[data-do="facet-pick"]')];
        el = want === '*' ? all[0] : all.find(b => b.dataset.value === want);
      }
      if (!el) return done({ miss: true });
      const label = el.dataset.value || 'back';
      const t0 = performance.now();
      const look = () => {
        const n = inFinder_(FINDERS[0], () => STUFF.filters.length);
        if (n !== n0 && groups.children.length && !groups.querySelector('.loading')) return done({ ms: performance.now() - t0, label });
        if (performance.now() - t0 > 90000) return done({ ms: -1, label });
        requestAnimationFrame(look);
      };
      el.click();
      requestAnimationFrame(look);
    }), want);
    out.push([name, r.miss ? null : r.ms, r.label]);
    await page.waitForTimeout(400);
  }
  await ctx.close();
  return out;
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const fails = [];
  try {
    for (const who of (arg('as') || 'admin,child').split(',')) for (const dev of (arg('on') || 'phone,ipad').split(',')) {
      const rows = await run(browser, who, dev);
      console.log(who + ' / ' + dev);
      rows.forEach(([n, ms, l]) => {
        console.log('  ' + (n + ' (' + (l || '-') + ')').padEnd(40) + (ms == null ? 'not offered' : Math.round(ms) + ' ms'));
        if (MAX && ms != null && (ms < 0 || ms > MAX)) fails.push(who + '/' + dev + ' ' + n + ': ' + Math.round(ms) + ' ms');
      });
    }
  } finally { await browser.close(); srv.close(); }
  if (fails.length) { fails.forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — find settle' + (MAX ? ': every tap under ' + MAX + ' ms' : ''));
})();
