#!/usr/bin/env node
/* @family. — tools/wait.js WHAT A SLOW BACKEND FEELS LIKE: every screen under an artificial Apps Script delay, measured for layout shift and time to first content. */
/* `--latency=ms` (default 2000) is the knob; `--json=file` writes the numbers; `--shots=dir` photographs each screen mid-wait. Health reads it as kind `wait`. */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const LAT = Number(arg('latency') || 2000);
const PORT = Number(process.env.WAIT_PORT || 8763);
const SHOTS = arg('shots');
const FIXTURE = fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8');
const person = (role, name, id, handle) => ({ name, personId: id, person_id: id, role, roles: [role], handle, token: 't-' + role });
const PEOPLE = [
  { as: 'pupil', user: person('student', 'Sam Student', 'P9', 'sam_quick12') },
  { as: 'admin', user: person('admin', 'Test Admin', 'P001', 'testadmin') },
].filter(p => !arg('who') || arg('who').split(',').indexOf(p.as) !== -1);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

function serve() {
  const lib = require('../check/lib-full.js');
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const libBody = lib.serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* IN THE PAGE, BEFORE ANYTHING: every layout shift not caused by a tap is summed, as the web's CLS is; a screen leaving (height 0, or no longer in front) is the slide, not a jump. */
function watch_() {
  window.__shift = 0;
  try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput && (e.sources || []).some(x => x.currentRect.height > 0 && !(x.node && x.node.classList && x.node.classList.contains('screen') && !x.node.classList.contains('is-front')))) window.__shift += e.value; })).observe({ type: 'layout-shift', buffered: true }); } catch (e) { /* no observer: zero */ }
}
/* IN THE PAGE: the screen in front, its loaders and whether it shows anything yet. */
function state_(id) {
  const s = document.getElementById('s-' + id) || document.querySelector('.screen.is-front') || document.body;
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; };
  const dots = [...s.querySelectorAll('.loading')].filter(vis).length;
  const cards = [...s.querySelectorAll('.pane > :not(.loading)')].filter(c => vis(c) && !c.querySelector(':scope > .loading:only-child')).length;
  return { dots, cards, shift: window.__shift || 0 };
}

async function until(page, id, t0, cap) {
  let first = null, done = null, peakDots = 0;
  while (Date.now() - t0 < cap) {
    const s = await page.evaluate(state_, id).catch(() => ({ dots: 0, cards: 0, shift: 0 }));
    peakDots = Math.max(peakDots, s.dots);
    if (first === null && s.cards > 0) first = Date.now() - t0;
    if (s.cards > 0 && s.dots === 0) { done = Date.now() - t0; break; }
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(400);
  const end = await page.evaluate(state_, id).catch(() => ({ shift: 0 }));
  return { first, done, dots: peakDots, shift: +end.shift.toFixed(4) };
}

async function visit(browser, who, warm, out) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const asked = new Map();
  await page.addInitScript(watch_);
  await page.addInitScript(u => { try { if (!sessionStorage.getItem('w')) { localStorage.clear(); sessionStorage.setItem('w', 1); } localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* blocked */ } }, who.user);
  await page.route('**://script.google.com/**', async r => {
    let a = 'get'; try { a = JSON.parse(r.request().postData() || '{}').action || 'get'; } catch (e) { /* a GET */ }
    asked.set(a, (asked.get(a) || 0) + 1);
    await new Promise(ok => setTimeout(ok, LAT));
    r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }).catch(() => {});
  });
  const go = async () => { const t0 = Date.now(); await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' }); return t0; };
  let t0 = await go();
  if (warm) { await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(1600); await page.evaluate(() => { window.__shift = 0; }); t0 = await go(); }
  const first = await page.evaluate(() => (document.querySelector('.screen.is-front') || {}).id || '').catch(() => '');
  const load = await until(page, String(first).replace(/^s-/, ''), t0, LAT * 4 + 8000);
  out.push(Object.assign({ who: who.as, warm, screen: 'first-load' }, load));
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {});
  const ids = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS : []).map(t => t.id)).catch(() => []);
  for (const id of ids) {
    await page.evaluate(() => { window.__shift = 0; });
    const t = Date.now();
    await page.evaluate(sid => { try { go(sid, false, true); } catch (e) { /* stays */ } }, id);
    if (SHOTS) { await page.waitForTimeout(Math.min(600, LAT / 2)); await page.screenshot({ path: path.join(SHOTS, `${who.as}--${id}--wait.png`) }).catch(() => {}); }
    out.push(Object.assign({ who: who.as, warm, screen: id }, await until(page, id, t, LAT * 3 + 5000)));
  }
  await ctx.close();
  return asked;
}

async function run() {
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const server = await serve(), browser = await chromium.launch();
  const out = [], asked = {};
  try {
    for (const who of PEOPLE) {
      for (const warm of [false, true]) (await visit(browser, who, warm, out)).forEach((n, a) => { asked[a] = (asked[a] || 0) + n; });
    }
  } finally { await browser.close(); server.close(); }
  const sum = { latency: LAT, shift: +out.reduce((s, r) => s + r.shift, 0).toFixed(4),
    waits: out.filter(r => r.dots > 0).length, firstLoadCold: out.filter(r => r.screen === 'first-load' && !r.warm).map(r => r.first),
    firstLoadWarm: out.filter(r => r.screen === 'first-load' && r.warm).map(r => r.first), rows: out, asked };
  if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify(sum, null, 1));
  out.forEach(r => console.log(`${r.who.padEnd(6)} ${r.warm ? 'warm' : 'cold'} ${r.screen.padEnd(12)} first ${String(r.first).padStart(5)}ms  done ${String(r.done).padStart(5)}ms  dots ${r.dots}  shift ${r.shift}`));
  console.log(`latency ${LAT}ms  total shift ${sum.shift}  screens that waited ${sum.waits}/${out.length}  api: ${JSON.stringify(asked)}`);
  return sum;
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e); process.exit(1); });
