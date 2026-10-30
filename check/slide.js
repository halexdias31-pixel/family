#!/usr/bin/env node
/* @family. — check/slide.js THE SLIDE BETWEEN COLUMNS, AS iOS DOES IT (527): real touches at 390px, sampled every frame. Flags: --shots=DIR, -v. Port: SLIDE_PORT */
'use strict';
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* WHAT IT PROVES, each with a finger sent through CDP as a phone sends one: */
/* 1. LANDING: a flick turns however short; a slow drag under halfway springs back; one let go coasting past halfway turns; one pulled home stays. */
/* 2. NO HALF-WAY: after each gesture every column is within half a pixel of its place, nothing animating, and no frame sails past the column landed on. */
/* 3. RUBBER BAND: past the first and last column the row gives less than the finger (iOS's curve), and springs back. */
/* 4. INTERRUPT: a finger landing mid-slide holds the row; lifted, it goes on; dragged, it moves from there; a second flick lands two on. */
/* 5. VERTICAL: a drag up, drifting sideways, never moves the row. 6. TRACKING: mid-drag the row is the finger's travel less the slop. */
/* 7. LESS MOTION: with prefers-reduced-motion a flick lands at once and books no settle. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const W = 390, H = 844;

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const lib = require('./lib-full.js').serve(p);
      if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(lib); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(Number(process.env.SLIDE_PORT || 0), () => ok(s));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* THE FINGER: one touch every 8ms along `path(t)`, t from 0 to 1 over `dur`, then `hold` ms still, with the event's own
   timestamps (what `releaseV_` fits). `end: false` leaves it down and returns `lift`. */
async function finger(cdp, { x0, y0, path: at, dur, hold = 0, end = true }) {
  const T0 = Date.now();
  const send = (type, x, y, ms) => cdp.send('Input.dispatchTouchEvent', { type, timestamp: (T0 + ms) / 1000,
    touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }] }).catch(() => {});
  await send('touchStart', x0, y0, 0);
  let last = [0, 0], ms = 0;
  for (;;) {
    ms += 8;
    const t = Math.min(1, ms / dur);
    last = at(t);
    const wake = T0 + ms - Date.now();
    if (wake > 1) await sleep(wake);
    send('touchMove', Math.round(x0 + last[0]), Math.round(y0 + last[1]), ms);
    if (t >= 1) break;
  }
  const until = ms + hold;
  while (ms < until) {
    ms += 8;
    const wake = T0 + ms - Date.now();
    if (wake > 1) await sleep(wake);
    send('touchMove', Math.round(x0 + last[0]), Math.round(y0 + last[1]), ms);
  }
  const lift = async () => { const t = Date.now() - T0; await send('touchEnd', 0, 0, t); };
  if (end) { ms += 4; const wake = T0 + ms - Date.now(); if (wake > 1) await sleep(wake); await send('touchEnd', 0, 0, ms); }
  return { lift };
}
const ease = { flick: t => t * t, still: t => 1 - (1 - t) * (1 - t), even: t => t };
const G = {
  flick: (dx, dy, dur = 100) => ({ dur, path: t => [dx * ease.flick(t), dy * ease.flick(t)] }),
  still: (dx, dy, dur = 420, hold = 320) => ({ dur, hold, path: t => [dx * ease.still(t), dy * ease.still(t)] }),
  /* AT AN EVEN SPEED TO THE LIFT: `dx` over `dur`, so it lets go still moving at dx/dur px/ms. */
  even: (dx, dy, dur) => ({ dur, path: t => [dx * t, dy * t] }),
  /* OUT TO 200 AND PULLED BACK TO 130, STILL MOVING HOME AS IT LIFTS. */
  back: dx => ({ dur: 450, path: t => { const k = t < 0.667 ? 200 * ease.still(t / 0.667) : 200 - 70 * ((t - 0.667) / 0.333); return [Math.sign(dx) * k, 0]; } }),
};

/* ---------- IN THE PAGE: placing, a spot to touch, where the row is, and every frame of it ---------- */
function PAGE_KIT() {
  const S = window.__sl = {};
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const frames = n => new Promise(r => { const f = k => (k ? requestAnimationFrame(() => f(k - 1)) : r()); f(n); });
  /* HOW FAR EVERY COLUMN IS FROM WHERE ITS COLUMN SAYS, drawn and asked for, and whether anything still moves. */
  S.rest = () => {
    const ti = TABS.findIndex(t => t.id === AT), step = stepX_();
    let worst = 0, moving = 0;
    TABS.forEach((t, i) => {
      const h = document.getElementById('s-' + t.id);
      if (!h) return;
      const want = (i - ti) * step, placed = colPlaced_(h), now = colNow_(h);
      worst = Math.max(worst, Math.abs(now[0] - want), placed ? Math.abs(placed[0] - want) : 0);
      if (h.getAnimations().some(a => a.playState === 'running' && a.transitionProperty === 'transform')) moving++;
    });
    return { at: AT, worst: +worst.toFixed(2), moving, step };
  };
  S.still = async () => {
    const t0 = performance.now();
    await wait(80);
    for (;;) {
      const r = S.rest();
      if ((!r.moving && !SWIPE.live && !PLACE_FRAME && performance.now() > SLIDE_UNTIL) || performance.now() - t0 > 5000) break;
      await wait(40);
    }
    await frames(2);
    return S.rest();
  };
  /* THE RELEASE IS PLACED ON THE NEXT FRAME (`PLACE_FRAME`): wait for it, not for a guessed few ms a busy machine overruns. */
  S.placed = () => new Promise(r => {
    const t0 = performance.now();
    const f = () => ((SWIPE.live || PLACE_FRAME) && performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r());
    f();
  });
  S.place = async (col, p) => {
    try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
    go(col, false, true);
    await wait(60);
    if (p !== undefined && AXES.y.count(col) > p) goPage(col, p, true);
    return S.still();
  };
  /* BARE CARD UNDER THE THUMB: not a control, nothing that scrolls — the grid's to take. */
  S.spot = () => {
    const host = document.getElementById('s-' + AT);
    const pane = host && host.querySelector(':scope > .page.on > .pane');
    if (!pane) return null;
    const pr = pane.getBoundingClientRect();
    const top = Math.max(60, pr.top), bot = Math.min(pr.bottom, innerHeight - 40);
    for (const fy of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9]) for (const fx of [0.5, 0.35, 0.65, 0.25, 0.75]) {
      const x = Math.round(pr.left + pr.width * fx), y = Math.round(top + (bot - top) * fy);
      const el = document.elementFromPoint(x, y);
      if (!el || !pane.contains(el)) continue;
      if (el.closest('[data-do], select, textarea, input, canvas, button, a, label, video, iframe, [data-noswipe]')) continue;
      if (scrollHost_(el, 'y', 1) || scrollHost_(el, 'y', -1) || scrollHost_(el, 'x', 1) || scrollHost_(el, 'x', -1)) continue;
      return { x, y };
    }
    return null;
  };
  /* EVERY FRAME: the column in front, and how far its row is from rest (0 when it is centred). */
  S.rec = { on: false, f: [] };
  S.recStart = () => {
    S.rec = { on: true, f: [] };
    const step = () => {
      if (!S.rec.on) return;
      const h = document.getElementById('s-' + AT);
      S.rec.f.push({ t: performance.now(), at: AT, x: h ? colNow_(h)[0] : NaN, up: !SWIPE.live });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  S.recStop = () => { S.rec.on = false; return S.rec.f; };
  S.row = () => { const h = document.getElementById('s-' + AT); return h ? +colNow_(h)[0].toFixed(2) : NaN; };
}

async function boot(browser, reduced) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    serviceWorkers: 'block', reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; window.open = () => null; });
  await page.addInitScript(PAGE_KIT);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof placeGrid === 'function' && typeof grabRow_ === 'function' && document.querySelector('#s-tools .page'), null, { timeout: 30000 });
  await page.waitForFunction(() => typeof AHEAD === 'undefined' || AHEAD.open, null, { timeout: 60000 }).catch(() => {});
  await sleep(1200);
  return { ctx, page, cdp: await ctx.newCDPSession(page), errs };
}

let PORT = 0;
const found = [];
let asked = 0;
const fail = (rule, where, msg) => found.push({ rule, where, msg });
const note = s => console.log('  ' + s);

/* THE SETTLE'S FRAMES, from the lift, on the column it landed on: none past rest on the far side, the last at rest. */
function settleFrames(frames, at) {
  const mine = frames.filter(f => f.up && f.at === at && isFinite(f.x));
  if (!mine.length) return { n: 0 };
  const from = Math.sign(mine.find(f => Math.abs(f.x) > 1.5)?.x || 0);
  const past = from ? Math.max(0, ...mine.map(f => -from * f.x)) : 0;
  return { n: mine.length, past: +past.toFixed(2), last: +mine[mine.length - 1].x.toFixed(2) };
}

(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.log('slide: could not serve — ' + e.message); process.exit(1); }
  PORT = server.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  let browser;
  try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); } catch (e) { console.log('slide: no browser — ' + e.message); process.exit(2); }
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

  const env = await boot(browser, false);
  const { page, cdp } = env;
  const tabs = await page.evaluate(() => TABS.map(t => t.id));
  const nx = (id, k = 1) => tabs[tabs.indexOf(id) + k];
  const step = await page.evaluate(() => stepX_());
  const linear = await page.evaluate(() => SPRING_LINEAR);
  note(`${tabs.length} columns, a step of ${step.toFixed(1)}px, the spring written as ${linear ? 'linear()' : 'a bezier'}`);

  /* ONE GESTURE FROM REST ON `col`, recorded every frame; the landing, the rest after it and the settle's frames. */
  const run = async (col, g, opts = {}) => {
    await page.evaluate(([c, p]) => window.__sl.place(c, p), [col, opts.p]);
    const sp = await page.evaluate(() => window.__sl.spot());
    if (!sp) return { err: `no bare spot on ${col}` };
    await page.evaluate(() => window.__sl.recStart());
    await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, g));
    const r = await page.evaluate(() => window.__sl.still());
    const frames = await page.evaluate(() => window.__sl.recStop());
    return { r, frames, sp };
  };
  const SETTLE_TOL = 1;
  const landed = async (name, col, g, want, opts) => {
    const o = await run(col, g, opts);
    asked++;
    if (o.err) return fail('REACH', name, o.err);
    const s = settleFrames(o.frames, o.r.at);
    note(`${name}: ${col} → ${o.r.at} (wanted ${want}); worst ${o.r.worst}px off rest, ${o.r.moving} moving; settle ${s.n} frames, ${s.past}px past`);
    if (o.r.at !== want) fail('LANDING', name, `landed on ${o.r.at}, wanted ${want}`);
    if (o.r.worst > 0.5 || o.r.moving) fail('NO HALF-WAY', name, `a column is ${o.r.worst}px from where it belongs with ${o.r.moving} still moving once it was still`);
    if (s.n && s.past > SETTLE_TOL) fail('NO HALF-WAY', name, `the settle sailed ${s.past}px past the column it landed on`);
    return o;
  };

  /* ---------- 1 AND 2. LANDING AT SEVERAL SPEEDS AND DISTANCES, AND NOTHING LEFT HALF-WAY ---------- */
  const half = Math.min(180, step / 2);
  await landed('flick left, 40px in 60ms', 'tools', G.flick(-40, 0, 60), nx('tools'));
  await landed('flick left, 90px in 100ms', 'tools', G.flick(-90, 0, 100), nx('tools'));
  await landed('flick right, 90px in 100ms', 'games', G.flick(90, 0, 100), nx('games', -1));
  await landed('drag left 120px and hold — under halfway', 'tools', G.still(-120, 0), 'tools');
  await landed(`drag left ${Math.round(half * 0.85)}px and hold — just under halfway`, 'tools', G.still(-Math.round(half * 0.85), 0), 'tools');
  await landed(`drag left ${Math.round(half * 1.25)}px and hold — past halfway`, 'tools', G.still(-Math.round(half * 1.25), 0), nx('tools'));
  /* LET GO STILL MOVING at 0.3px/ms — under a flick — from 150px: where it would coast to is past halfway. */
  await landed('150px at 0.3px/ms, let go moving — coasts past halfway', 'tools', G.even(-150, 0, 500), nx('tools'));
  await landed('out 200px, pulled back to 130 and let go moving home', 'tools', G.back(-1), 'tools');

  /* THE SPRING IS ON THE COLUMNS. */
  {
    await page.evaluate(() => window.__sl.place('tools'));
    const sp = await page.evaluate(() => window.__sl.spot());
    if (sp) {
      await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-90, 0)));
      await page.evaluate(() => window.__sl.placed());
      const tf = await page.evaluate(() => document.getElementById('s-' + AT).style.transitionTimingFunction.split(/,\s*(?![^(]*\))/)[0]);
      asked++;
      if (linear && !/^linear\(/.test(tf)) fail('SPRING', 'a flick', `the settle's curve is ${tf.slice(0, 50)}, not the spring's linear()`);
      await page.evaluate(() => window.__sl.still());
    }
  }

  /* ---------- 3. RUBBER BAND AT BOTH ENDS ---------- */
  for (const [col, dir] of [[tabs[0], 1], [tabs[tabs.length - 1], -1]]) {
    await page.evaluate(c => window.__sl.place(c), col);
    const sp = await page.evaluate(() => window.__sl.spot());
    asked++;
    if (!sp) { fail('REACH', `rubber band on ${col}`, 'no bare spot'); continue; }
    await page.evaluate(() => window.__sl.recStart());
    const f = await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y, end: false }, G.still(dir * 200, 0, 380, 120)));
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const held = await page.evaluate(() => window.__sl.row());
    await f.lift();
    const r = await page.evaluate(() => window.__sl.still());
    const s = settleFrames(await page.evaluate(() => window.__sl.recStop()), r.at);
    const d = step, x = 190, band = (1 - 1 / (x * 0.55 / d + 1)) * d;
    note(`rubber band on ${col}: finger ${dir * 200}px, row ${held}px (iOS's curve says ${(dir * band).toFixed(1)}); back to ${r.at}, ${r.worst}px off, ${s.past}px past`);
    if (!(held * dir > 20)) fail('RUBBER BAND', col, `pulled 200px past the end the row moved ${held}px — it should give, a little`);
    else if (!(held * dir < 200 * 0.6)) fail('RUBBER BAND', col, `pulled 200px past the end the row moved ${held}px — that is not resisting`);
    else if (Math.abs(Math.abs(held) - band) > 8) fail('RUBBER BAND', col, `the row gave ${held}px for a 190px pull; iOS's band gives ${band.toFixed(1)}`);
    if (r.at !== col || r.worst > 0.5 || r.moving) fail('RUBBER BAND', col, `let go, it ended on ${r.at}, ${r.worst}px off rest`);
    if (s.past > SETTLE_TOL) fail('RUBBER BAND', col, `springing back it went ${s.past}px past rest`);
  }

  /* ---------- 4. INTERRUPT: HELD WHERE IT IS, THEN ON, OR CARRIED ON BY THE FINGER ---------- */
  const catchAt = async (lead = 70) => {
    await page.evaluate(() => window.__sl.place('tools'));
    const sp = await page.evaluate(() => window.__sl.spot());
    if (!sp) return null;
    await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-90, 0, 90)));
    await page.evaluate(() => window.__sl.placed());
    await sleep(lead);
    return sp;
  };
  {
    const sp = await catchAt();
    asked++;
    if (!sp) fail('REACH', 'interrupt', 'no bare spot on tools');
    else {
      const f = await finger(cdp, { x0: sp.x, y0: sp.y, dur: 8, hold: 140, end: false, path: () => [0, 0] });
      const a = await page.evaluate(() => window.__sl.row());
      await sleep(120);
      const b = await page.evaluate(() => window.__sl.row());
      await f.lift();
      const r = await page.evaluate(() => window.__sl.still());
      note(`a touch mid-slide: row at ${a}px, ${b}px 120ms later; lifted, it went on to ${r.at}, ${r.worst}px off`);
      if (!(Math.abs(a) > step * 0.04 && Math.abs(a) < step * 0.96)) fail('REACH', 'interrupt', `the row was at ${a}px when the finger landed — not mid-slide`);
      else if (Math.abs(b - a) > 1) fail('INTERRUPT', 'a touch mid-slide', `the row went on ${(b - a).toFixed(1)}px under a still finger — it should be held`);
      if (r.at !== nx('tools') || r.worst > 0.5 || r.moving) fail('INTERRUPT', 'lifted mid-slide', `it ended on ${r.at}, ${r.worst}px off rest — it should go on to ${nx('tools')}`);
    }
  }
  {
    const sp = await catchAt();
    asked++;
    if (!sp) fail('REACH', 'interrupt and drag', 'no bare spot');
    else {
      const f = await finger(cdp, { x0: sp.x, y0: sp.y, dur: 16, hold: 60, end: false, path: () => [0, 0] });
      const a = await page.evaluate(() => window.__sl.row());
      await f.lift();
      const g = await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y, end: false }, G.still(-40, 0, 200, 100)));
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const b = await page.evaluate(() => ({ x: window.__sl.row(), d: SWIPE.d, at: AT }));
      await g.lift();
      await page.evaluate(() => window.__sl.still());
      note(`caught at ${a}px and dragged 40px: the row is at ${b.x}px (finger ${b.d}px)`);
      /* THE SECOND TOUCH CATCHES IT WHERE THE FIRST LET IT GO ON FROM — so the drag is from about there, less the slop. */
      if (!isFinite(b.x) || Math.abs(b.x - a) > 80) fail('INTERRUPT', 'caught and dragged', `the row jumped from ${a}px to ${b.x}px under a 40px drag`);
    }
  }
  {
    const sp = await catchAt(60);
    asked++;
    if (!sp) fail('REACH', 'a second flick', 'no bare spot');
    else {
      await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-60, 0, 70)));
      const r = await page.evaluate(() => window.__sl.still());
      note(`a second flick mid-slide: ${r.at} (wanted ${nx('tools', 2)}), ${r.worst}px off`);
      if (r.at !== nx('tools', 2) || r.worst > 0.5) fail('INTERRUPT', 'a second flick', `landed on ${r.at} ${r.worst}px off — wanted ${nx('tools', 2)} at rest`);
    }
  }

  /* ---------- 5. A VERTICAL DRAG NEVER SLIDES THE ROW ---------- */
  for (const [name, g] of [['up 160px drifting 25px sideways', { dur: 300, path: t => [-25 * t, -160 * t] }],
                           ['up 60px, held', G.still(0, -60)]]) {
    const o = await run('tools', g, { p: 1 });
    asked++;
    if (o.err) { fail('REACH', name, o.err); continue; }
    const moved = Math.max(0, ...o.frames.filter(f => f.at === 'tools').map(f => Math.abs(f.x)));
    note(`vertical, ${name}: stayed on ${o.r.at}; the row moved at most ${moved.toFixed(2)}px`);
    if (o.r.at !== 'tools') fail('VERTICAL', name, `the column changed to ${o.r.at}`);
    if (moved > 0.5) fail('VERTICAL', name, `the row moved ${moved.toFixed(1)}px sideways during a vertical drag`);
  }

  /* ---------- 6. 1:1 UNDER THE FINGER ---------- */
  {
    await page.evaluate(() => window.__sl.place('tools'));
    const sp = await page.evaluate(() => window.__sl.spot());
    asked++;
    if (!sp) fail('REACH', 'tracking', 'no bare spot');
    else {
      const f = await finger(cdp, { x0: sp.x, y0: sp.y, dur: 400, end: false, path: t => [-100 * t, 0] });
      /* THE LAST MOVES ARE SENT UNAWAITED: a moment, then two frames, so the row read was placed for the finger read. */
      await sleep(60);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const r = await page.evaluate(() => ({ x: window.__sl.row(), d: SWIPE.d, lock: SWIPE.lock }));
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'slide-390-mid-drag.png') });
      await f.lift();
      await page.evaluate(() => window.__sl.still());
      note(`tracking: finger ${r.d}px, row ${r.x}px, slop ${r.lock}px`);
      if (Math.abs(r.x - (r.d - r.lock)) > 1.5) fail('TRACKING', 'a slow drag', `the row is at ${r.x}px with the finger ${r.d}px along — not 1:1 past the slop`);
    }
  }

  /* ---------- SCREENSHOTS: mid-slide and settled ---------- */
  if (SHOTS) {
    await page.evaluate(() => window.__sl.place('tools'));
    const sp = await page.evaluate(() => window.__sl.spot());
    if (sp) {
      await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-90, 0)));
      await sleep(70);
      await page.screenshot({ path: path.join(SHOTS, 'slide-390-mid-settle.png') });
      await page.evaluate(() => window.__sl.still());
      await page.screenshot({ path: path.join(SHOTS, 'slide-390-settled.png') });
    }
  }
  if (env.errs.length) fail('PAGE ERROR', '390', env.errs.slice(0, 3).join(' | '));
  await env.ctx.close();

  /* ---------- 7. LESS MOTION: A FLICK LANDS AT ONCE ---------- */
  {
    const e2 = await boot(browser, true);
    await e2.page.evaluate(() => window.__sl.place('tools'));
    const sp = await e2.page.evaluate(() => window.__sl.spot());
    asked++;
    if (!sp) fail('REACH', 'reduced motion', 'no bare spot');
    else {
      await finger(e2.cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-90, 0)));
      await e2.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
      const r = await e2.page.evaluate(() => Object.assign(window.__sl.rest(), {
        settle: SETTLE_ON !== null }));
      note(`reduced motion: a flick is on ${r.at} three frames after the lift, ${r.worst}px off, ${r.moving} moving; a settle ${r.settle ? 'booked' : 'not booked'}`);
      if (r.at !== nx('tools')) fail('LESS MOTION', 'a flick', `landed on ${r.at}`);
      else if (r.worst > 0.5 || r.moving) fail('LESS MOTION', 'a flick', `three frames after the lift a column is ${r.worst}px off with ${r.moving} still sliding — it should snap`);
      /* THE STYLESHEET ALREADY CUTS EVERY TRANSITION TO .01ms HERE; the app must not book one either, or `afterSlide_` waits out a settle nobody sees. */
      if (r.settle) fail('LESS MOTION', 'a flick', 'the release booked a settle (`SETTLE_ON`) — a spring nobody sees, and afterSlide_ waits it out');
    }
    await e2.ctx.close();
  }

  await browser.close();
  server.close();
  if (!asked) { console.log('FAILED — slide asked nothing'); process.exit(1); }
  if (found.length) {
    found.forEach(f => console.log(`  FAIL [${f.rule}] ${f.where}: ${f.msg}`));
    console.log(`FAILED — ${found.length} of ${asked} slide question(s) at ${W}px`);
    process.exit(1);
  }
  console.log(`OK — ${asked} slide questions at ${W}px: landings at several speeds, nothing half-way, the rubber band, a held row, vertical drags, 1:1 tracking, less motion`);
})().catch(e => { console.log('FAILED — slide crashed: ' + (e && e.stack || e)); process.exit(1); });
