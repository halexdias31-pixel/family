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

(async () => {
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
