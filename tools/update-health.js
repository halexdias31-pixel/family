#!/usr/bin/env node
/* @family. — tools/update-health.js A NEW BUILD ARRIVES WITHOUT DISTURBING ANYONE (970): one headless walk, data/update-health.json. */
/* Signs in on the fixture, types an answer on the keypad, deploys (the index's ETag moves), and asserts the page reloads onto the new */
/* build only once nothing is focused, back on the same card with the answer, chips and page intact. Then the same for a settings box. */
/* Run occasionally (a browser walk); tools/health.js only reads the file. */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'update-health.json');
const glass = require('../check/glass.js');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const IDLE = 3000, BOUND = 20000;
let DEPLOY = 0;

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const lib = require('../check/lib-full.js').serve(p);
      if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(lib); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      if (/index\.html$/.test(p)) {
        res.writeHead(200, { 'Content-Type': 'text/html', ETag: '"b' + DEPLOY + '"', 'Cache-Control': 'no-cache' });
        return res.end(req.method === 'HEAD' ? '' : fs.readFileSync(p, 'utf8') + '\n<!-- deploy ' + DEPLOY + ' -->\n');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(0, () => ok(s));
  });
}

/* EVERY UNLOAD WRITES DOWN WHAT HAD FOCUS, so a reload under a finger is caught. */
function watcher() {
  window.BUILD_IDLE_MS = 3000;
  window.__life = Math.random();
  window.addEventListener('pagehide', () => {
    try {
      const a = document.activeElement, l = JSON.parse(sessionStorage.getItem('uh:unloads') || '[]');
      l.push({ focus: !!(a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)), kp: document.documentElement.classList.contains('kp-up') });
      sessionStorage.setItem('uh:unloads', JSON.stringify(l));
    } catch (e) { /* a refused store only loses this check's note */ }
  });
}

(async () => {
  const t0 = Date.now();
  const server = await serve(), port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(watcher);
  const ADMIN = glass.VIEWERS.find(v => v.as === 'admin').user;
  await page.route('**://script.google.com/**', r => {
    if (r.request().method() !== 'POST') return r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE_ANON });
    let a = {}; try { a = JSON.parse(r.request().postData() || '{}'); } catch (e) { a = {}; }
    const body = a.action === 'verifyLogin' ? Object.assign({ success: true }, ADMIN) : { success: true };
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  const loaded = () => page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 60000 });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await loaded();
  const signed = await page.evaluate(() => new Promise(ok => {
    try { go('account'); } catch (e) { return ok(false); }
    setTimeout(() => {
      const n = document.getElementById('in-name'), p = document.getElementById('in-pin'), b = document.querySelector('[data-do="do-signin"]');
      if (!n || !p || !b) return ok(false);
      n.value = 'test@example.org'; p.value = '0000'; b.click();
      const t = setInterval(() => { if (typeof USER !== 'undefined' && USER) { clearInterval(t); p.value = ''; ok(true); } }, 50);
      setTimeout(() => { clearInterval(t); ok(false); }, 15000);
    }, 400);
  }));
  const cases = [];

  /* ONE DEPLOY: typed while focused, deployed, held while focused, let go, and then the new build must arrive with everything back. */
  async function deployCase(name, before, readState) {
    const r = { name, pass: false, why: [] };
    try {
      const was = await readState();
      if (!was || !was.value) { r.why.push('could not set the case up: ' + JSON.stringify(was)); return r; }
      const life = await page.evaluate(() => window.__life);
      DEPLOY++;
      await page.evaluate(() => { BUILD_ASKED = 0; return checkBuild_(); });
      await page.waitForTimeout(IDLE + 2500);
      if ((await page.evaluate(() => window.__life).catch(() => null)) !== life) r.why.push('the page reloaded while the box still had focus');
      await page.evaluate(() => { try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) { /* no pad */ } if (document.activeElement) document.activeElement.blur(); });
      const at = Date.now();
      const moved = await page.waitForFunction(l => window.__life !== l && typeof LOADED !== 'undefined' && LOADED, life, { timeout: BOUND, polling: 200 }).then(() => true, () => false);
      r.ms = Date.now() - at;
      if (!moved) { r.why.push(`no reload onto the new build within ${BOUND / 1000} s of letting go`); return r; }
      await loaded();
      await page.waitForTimeout(3500);
      const tag = await page.evaluate(() => BUILD_TAG);
      if (tag !== '"b' + DEPLOY + '"') r.why.push('the page is not on the new build (' + tag + ')');
      const now = await readState();
      ['tab', 'page', 'chips', 'card', 'value'].forEach(k => { if (k in was && JSON.stringify(was[k]) !== JSON.stringify(now && now[k])) r.why.push(`${k} was ${JSON.stringify(was[k])}, after ${JSON.stringify(now && now[k])}`); });
      const unloads = await page.evaluate(() => JSON.parse(sessionStorage.getItem('uh:unloads') || '[]'));
      if (unloads.some(u => u.focus || u.kp)) r.why.push('an unload happened with a box focused or the keypad up');
      const left = await page.evaluate(() => sessionStorage.getItem('familyResume'));
      if (left) r.why.push('the resume note was left behind');
      r.pass = !r.why.length;
    } catch (e) { r.why.push('the walk failed: ' + String(e.message).slice(0, 120)); }
    return r;
  }

  /* 1. A MATHS ANSWER ON THE KEYPAD, IN FIND, ON A CHIP. */
  const qState = () => page.evaluate(() => {
    const el = document.querySelector('#s-stuff .page.on .kp-in[data-do="qp-ans"]') || document.querySelector('#s-stuff .kp-in[data-do="qp-ans"]');
    return { tab: AT, page: PAGE.stuff || 0, chips: (STUFF.filters || []).map(f => f.field + '=' + f.value), card: el ? el.getAttribute('data-k') : null, value: el ? el.value : '' };
  });
  if (signed) {
    const opened = await page.evaluate(async () => {
      const wait = ms => new Promise(ok => setTimeout(ok, ms));
      go('stuff'); await wait(500);
      const qs = stuffItemsAll_().filter(x => x && x.kind === 'question');
      for (let i = 0; i < Math.min(qs.length, 200); i += 7) {
        finderOpen_(qs[i], null, FINDERS.stuff); await wait(150);
        const el = document.querySelector('#s-stuff .page.on .kp-in[data-do="qp-ans"]');
        if (el && !el.value) return true;
      }
      return false;
    });
    if (opened) {
      await page.locator('#s-stuff .page.on .kp-in[data-do="qp-ans"]').first().click({ force: true });
      for (let i = 0; i < 2; i++) await page.locator('.kp-key:visible').filter({ hasText: /^[a-z0-9]$/i }).first().click().catch(() => {});
      cases.push(await deployCase('keypad answer in Find', null, qState));
    } else cases.push({ name: 'keypad answer in Find', pass: false, why: ['no maths question with a keypad box was found'] });

    /* 2. A HALF-FILLED SETTINGS BOX. */
    const sel = await page.evaluate(async () => {
      const wait = ms => new Promise(ok => setTimeout(ok, ms));
      for (const t of TABS) {
        go(t.id); await wait(400);
        const el = [...document.querySelectorAll('#s-' + t.id + ' input[data-draft^="set:"]')].find(e => (e.type === 'text' || !e.getAttribute('type')) && !e.disabled && e.offsetParent);
        if (el) return { tab: t.id, spec: el.getAttribute('data-draft') };
      }
      return null;
    });
    if (sel) {
      const box = `#s-${sel.tab} input[data-draft="${sel.spec}"]`;
      await page.locator(box).first().fill('half typed 970');
      await page.locator(box).first().focus();
      cases.push(await deployCase('settings box', null, () => page.evaluate(b => {
        const el = document.querySelector(b); return { tab: AT, value: el ? el.value : '' };
      }, box)));
    } else cases.push({ name: 'settings box', pass: false, why: ['no settings box with a draft was found'] });
  } else cases.push({ name: 'sign-in', pass: false, why: ['the fixture sign-in did not finish'] });

  await browser.close(); server.close();
  const out = { walked: { ms: Date.now() - t0, idleMs: IDLE, boundMs: BOUND }, pass: cases.every(c => c.pass), cases, errors: errors.slice(0, 10) };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log('update-health: ' + (out.pass ? 'PASS' : 'FAIL') + ' — ' + cases.map(c => c.name + ': ' + (c.pass ? 'ok' + (c.ms ? ' (' + c.ms + ' ms)' : '') : c.why.join('; '))).join(' | '));
  process.exit(out.pass ? 0 : 1);
})().catch(e => { console.error('update-health: ' + (e && e.stack || e)); process.exit(2); });
