#!/usr/bin/env node
/* @family. — tools/live-load.js THE REAL SITE'S FIRST MENU, TIMED (1000): the local walks use a fixture, so a slow Apps Script was never seen. */
/* doGet cold/warm and KB; Find's first screen on a throttled 390x844 phone, first and return visit. Signed out: no credential. Story: docs/history/1000. */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'live-health.json');
const SITE = process.env.LIVE_URL || 'https://atfamily.co.uk/';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const API = (/var url = '(https:\/\/script\.google\.com\/macros\/s\/[^']+\/exec)'/.exec(html) || [])[1];
if (!API) { console.error('live-load: cannot read the API URL out of index.html'); process.exit(2); }
/* A PHONE ON AN ORDINARY LINK: Lighthouse's mobile numbers (150 ms, 1.6 Mbit/s down, 4x slower CPU). */
const NET = { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 };
const CPU = 4;
const LIMIT = 60000;
/* FIND'S FRONT: a member's menu (Practice), or the Members-only card signed out. */
const MENU = '[data-do="facet-pick"][data-field="kindLabel"][data-value="Practice"], [data-do="facet-pick"][data-field="kindLabel"][data-value="Settings"]';

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const r0 = n => Math.round(n);

async function timeGet(page) {
  return page.evaluate(async api => {
    const t = performance.now();
    const res = await fetch(api + '?_=' + Date.now(), { cache: 'no-store' });
    const text = await res.text();
    return { ms: performance.now() - t, status: res.status, text };
  }, API);
}

async function visit(ctx, label) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const t0 = Date.now();
  const got = [];
  page.on('requestfinished', r => {
    const u = r.url();
    if (/script\.google(usercontent)?\.com|\/data\/|\/js\/|style\.css/.test(u)) got.push({ at: Date.now() - t0, url: /googleusercontent/.test(u) ? 'doGet' : u.replace(/\?.*$/, '').replace(SITE, '') });
  });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e).slice(0, 200)));
  await page.goto(SITE, { waitUntil: 'commit', timeout: LIMIT });
  let menuMs = null, dotsMs = null;
  const end = t0 + LIMIT;
  while (Date.now() < end) {
    const s = await page.evaluate(m => ({ menu: !!document.querySelector(m) && !document.querySelector('#s-stuff .loading'), dots: !!document.querySelector('.loading') }), MENU).catch(() => ({}));
    if (s.dots && dotsMs === null) dotsMs = Date.now() - t0;
    if (s.menu) { menuMs = Date.now() - t0; break; }
    await page.waitForTimeout(100);
  }
  const doGet = got.find(g => g.url === 'doGet');
  await page.close();
  return { label, menuMs, dotsMs, doGetAt: doGet ? doGet.at : null, library: got.filter(g => /\/data\//.test(g.url) && g.at <= (menuMs || LIMIT)).map(g => g.url + ' @' + g.at), errors };
}

/* ---------- --local: A SIGNED-IN PHONE, doGet HELD (1070) -------------------------------------------------- */
/* The repo served here, the fixture as doGet after DOGET_DELAY ms (10 s, a cold Apps Script), a signed-in student; first visit, then return. */
const LOCAL = process.argv.includes('--local');
const DELAY = Number(process.env.DOGET_DELAY || 10000);
/* WHAT THE PAGE REACHED AND WHEN, in its own clock: code, later code, library, payload, Find usable, the last place back. */
function stamps(sel) {
  const S = window.__stamps = {};
  const at = (k, ok) => { try { if (S[k] == null && ok()) S[k] = Math.round(performance.now()); } catch (e) { /* not yet declared */ } };
  /* FIND'S FRONT PAGE: the search box and the menu, and no loader on that page (a later page still waiting is not in the way). */
  const findFront = () => { const q = document.querySelector('#stuff-q'), pane = q && q.closest('.pane'); return !!pane && !!pane.querySelector(sel) && !pane.querySelector('.loading'); };
  const tick = () => {
    at('code', () => typeof go === 'function');
    at('later', () => LATER_IN);
    at('library', () => LIBRARY_ROWS !== null);
    at('cached', () => !!window.PAYLOAD_KEPT);
    at('payload', () => window.PAYLOAD_IN);
    /* WHAT THE PHONE SHOWS: no loader on the first screen (a signed-in phone stacks a column above Find), and Find's search and menu drawn. */
    const shown = () => ![...document.querySelectorAll('.loading')].some(l => { const r = l.getBoundingClientRect(); return r.height && r.top < innerHeight && r.bottom > 0; });
    at('screen', () => go && shown() && document.querySelector('#screen section:not(.hidden) .pane'));
    at('menu', () => findFront());
    at('usable', () => findFront() && shown());
    at('place', () => (STUFF.filters || []).length > 0);
    if (S.loaded == null || S.place == null || S.usable == null || S.menu == null) setTimeout(tick, 20);
    at('loaded', () => LOADED);
  };
  tick();
}
async function localVisit(ctx, url, label, keep) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e).slice(0, 200)));
  await page.addInitScript(stamps, MENU);
  await page.goto(url, { waitUntil: 'commit', timeout: LIMIT });
  await page.waitForFunction(() => window.__stamps && window.__stamps.menu != null, null, { timeout: LIMIT, polling: 20 }).catch(() => {});
  /* THE OWNER'S TAPS (1070): from the moment Find is usable, press the first answer of each menu three times; each must show its next answers, not a loader. */
  const taps = [];
  if (!keep) {
    const t0 = await page.evaluate(() => Math.round(performance.now()));
    for (let i = 0; i < 3; i++) {
      const at = await page.evaluate(() => {
        const b = document.querySelector('#s-stuff [data-do="facet-pick"]:not([data-value="*"])');
        if (!b) return null;
        b.scrollIntoView(); b.click();
        return Math.round(performance.now());
      });
      if (at == null) break;
      const done = await page.waitForFunction(() => (() => { const q = document.querySelector('#stuff-q'), pane = q && q.closest('.pane'); return pane && !pane.querySelector('.loading') && pane.querySelector('[data-do="facet-pick"], .q-card, .card'); })()
        ? Math.round(performance.now()) : false, null, { timeout: 30000, polling: 20 }).then(h => h.jsonValue(), () => null);
      taps.push(done == null ? null : done - at);
      await page.waitForTimeout(150);
    }
    taps.unshift(t0);
  }
  await page.waitForFunction(() => window.__stamps && window.__stamps.loaded != null && window.PAYLOAD_IN, null, { timeout: LIMIT, polling: 100 }).catch(() => {});
  if (keep) {
    /* THE PLACE TO COME BACK TO: one chip pressed, kept the way the page keeps it. */
    await page.click(MENU).catch(() => {});
    await page.waitForTimeout(1500);
    await page.evaluate(() => { try { findPlaceKeep_(); } catch (e) { /* no finder: no place */ } });
    await page.waitForTimeout(500);
  } else await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const r = performance.getEntriesByType('resource');
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const end = re => Math.round(Math.max(0, ...r.filter(e => re.test(e.name)).map(e => e.responseEnd)));
    const S = window.__stamps || {};
    return { html: Math.round(nav.responseEnd || 0), eagerJs: end(/\/js\/.*\.js/), library: end(/\/data\/.*\.json/), dcl: Math.round(nav.domContentLoadedEventEnd || 0),
      code: S.code, screen: S.screen, menu: S.menu, later: S.later, libraryIn: S.library, cached: S.cached == null ? null : S.cached, payload: S.payload, usable: S.usable, place: S.place == null ? null : S.place, loaded: S.loaded,
      jsKB: Math.round(r.filter(e => /\/js\//.test(e.name)).reduce((a, e) => a + (e.encodedBodySize || 0), 0) / 1024),
      jsFiles: r.filter(e => /\/js\//.test(e.name)).length };
  });
  await page.close();
  return Object.assign({ label }, out, { tapsFrom: taps[0] == null ? null : taps[0], tapsMs: taps.slice(1), errors });
}
/* SERVED GZIPPED, as GitHub Pages serves it: glass.serve sends raw bytes, which on a 1.6 Mbit link triples the first visit. */
function gzipServe() {
  const http = require('http');
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      let body = require('../check/lib-full.js').serve(p);
      if (body === null) {
        if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
        body = fs.readFileSync(p);
      }
      const ext = path.extname(p);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webp': 'image/webp' }[ext] || 'application/octet-stream';
      /* AN ETAG AND NO FRESHNESS: a return hours later, when the browser's own copy has expired and only the service worker's store holds. */
      const tag = '"' + require('crypto').createHash('md5').update(body).digest('hex').slice(0, 16) + '"';
      if (req.headers['if-none-match'] === tag) { res.writeHead(304, { ETag: tag }); return res.end(); }
      const zip = /text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '');
      res.writeHead(200, Object.assign({ 'Content-Type': type, ETag: tag, 'Cache-Control': 'no-cache' }, zip ? { 'Content-Encoding': 'gzip' } : {}));
      res.end(zip ? zlib.gzipSync(body) : body);
    });
    s.listen(Number(process.env.LIVE_PORT || 0), () => ok(s));
  });
}
async function local() {
  const glass = require('../check/glass.js');
  const server = await gzipServe();
  const url = `http://localhost:${server.address().port}/index.html`;
  const browser = await chromium.launch();
  const student = glass.VIEWERS.find(v => v.as === 'student').user;
  const out = { at: new Date().toISOString(), site: 'local, signed in, doGet held ' + DELAY + ' ms', net: '150ms 1.6Mbit/s, CPU x' + CPU };
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await ctx.addInitScript(u => { try { if (!localStorage.getItem('familyUser')) localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* no storage */ } }, student);
    await ctx.route('**://script.google.com/**', r => setTimeout(() => r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE_ANON }).catch(() => {}), DELAY));
    const cold = await localVisit(ctx, url, 'first visit', false);
    /* A SECOND VISIT FILLS THE SERVICE WORKER'S STORE (it starts after the first page's load) and leaves a place; the third is the return measured. */
    await localVisit(ctx, url, 'second visit', true);
    const warm = await localVisit(ctx, url, 'return visit', false);
    await ctx.close();
    out.coldUsableMs = cold.usable; out.returnUsableMs = warm.usable; out.returnPlaceMs = warm.place;
    /* THE SLOWEST OF THE THREE TAPS, each pressed the moment the menu is there. */
    out.coldTapMs = Math.max(...cold.tapsMs.map(t => (t == null ? 30000 : t)), 0); out.returnTapMs = Math.max(...warm.tapsMs.map(t => (t == null ? 30000 : t)), 0);
    out.visits = [cold, warm];
  } finally { await browser.close(); server.close(); }
  const file = path.join(ROOT, 'data', 'load-health.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  const s = v => (v == null ? 'never' : (v / 1000).toFixed(2) + ' s');
  console.log(`live-load --local: Find usable ${s(out.coldUsableMs)} first visit, ${s(out.returnUsableMs)} return (place back ${s(out.returnPlaceMs)}); slowest of 3 menu taps ${s(out.coldTapMs)} first, ${s(out.returnTapMs)} return; doGet held ${DELAY / 1000} s. Wrote data/load-health.json`);
  out.visits.forEach(v => console.log(JSON.stringify(v)));
}

if (LOCAL) local().catch(e => { console.error('live-load: ' + (e && e.stack || e)); process.exit(2); });
else (async () => {
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {});
  const out = { at: new Date().toISOString(), site: SITE, net: '150ms 1.6Mbit/s, CPU x' + CPU };
  try {
    /* 1. THE API ALONE, unthrottled: the first call may meet a cold Apps Script, the second a warm one. */
    const ctx0 = await browser.newContext();
    const p0 = await ctx0.newPage();
    await p0.goto(SITE, { waitUntil: 'domcontentloaded', timeout: LIMIT });
    const a = await timeGet(p0), b = await timeGet(p0);
    out.doGetColdMs = r0(a.ms); out.doGetWarmMs = r0(b.ms);
    out.payloadKB = r0(Buffer.byteLength(b.text) / 1024);
    out.payloadGzipKB = r0(zlib.gzipSync(b.text).length / 1024);
    await ctx0.close();
    /* 2. A PHONE: a first visit (nothing on the device), then a return visit in the same profile (service worker, storage). */
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const cold = await visit(ctx, 'first visit');
    const warm = await visit(ctx, 'return visit');
    await ctx.close();
    out.coldMenuMs = cold.menuMs; out.returnMenuMs = warm.menuMs;
    out.visits = [cold, warm];
  } finally { await browser.close(); }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  const s = v => (v == null ? 'never (' + LIMIT / 1000 + ' s)' : (v / 1000).toFixed(1) + ' s');
  console.log(`live-load: doGet ${s(out.doGetColdMs)} cold, ${s(out.doGetWarmMs)} warm, ${out.payloadKB} KB (${out.payloadGzipKB} KB gzip); `
    + `Find's menu ${s(out.coldMenuMs)} first visit, ${s(out.returnMenuMs)} return visit. Wrote data/live-health.json`);
})().catch(e => { console.error('live-load: ' + (e && e.stack || e)); process.exit(2); });
