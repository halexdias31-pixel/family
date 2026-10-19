#!/usr/bin/env node
/* @family. — check/reach.js WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE. § */
'use strict';
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.REACH_PORT || 0);
const VERBOSE = process.argv.includes('--verbose') || process.env.VERBOSE === '1';
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] || '';
const WIDTH = Number(arg('width') || 0);
const ONLY = arg('only').split(',').filter(Boolean);
const CPU = Number(arg('cpu') || 4);
const want = k => !ONLY.length || ONLY.indexOf(k) !== -1;
const SIZES = [[390, 844], [820, 1180]].filter(s => !WIDTH || s[0] === WIDTH);
const STUDENT = { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12' };
const FLICKS = 15, PERIOD = 200, BURST = 4;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- THE FIXTURE, WITH ENOUGH IN IT TO SHOW A FEED AND A SAVED COLUMN § */
function heavy_() {
  const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
  const drive = n => 'https://drive.google.com/file/d/1Fk' + String(n).padStart(5, '0') + 'xQwErTyUiOpAsDfGhJkLzX/view';
  const base = P.posts[0];
  const posts = [];
  for (let n = 0; n < 40; n++) {
    const at = base.at - n * 86400000;
    const d = new Date(at);
    const when = String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
    const media = n % 5 === 0 ? [drive(n), drive(n + 100), drive(n + 200)] : [drive(n)];
    posts.push(Object.assign({}, base, { id: 'PH' + n, image: media[0], media, at, when, rowIndex: 10 + n,
      caption: ['Fractions at the library #maths', 'Spelling bee practice', 'Times tables race', 'Science fair volcano',
        'Reading corner, week ' + n, 'Chess club final'][n % 6],
      comments: { total: 0, list: [] }, reactions: Object.assign({}, base.reactions, { by: [], yours: '' }) }));
  }
  P.posts = posts.concat(P.posts.slice(1));
  (P.shop || []).forEach((s, i) => { s.image = drive(500 + i); if (s.fields) s.fields.photo = drive(500 + i); });
  P.favourites = ['w:calculator', 'w:timer', 'w:notepad', 'w:calendar', 'w:typing', 'w:chess', 'w:tables', 'w:connect4',
    'w:maze', 'w:wordsearch', 'Scientific calculator', 'Ruler (30cm)', 'Ada Tutor'];
  return JSON.stringify(P);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };
function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT_WANTED, () => ok(s));
  });
}

/* ---------- IN THE PAGE, BEFORE ANY APP SCRIPT: WHAT EVERY PAINTED FRAME SHOWS ---------------------------- */
function READER() {
  const R = window.__rc = { on: false, seg: '', bad: [], frames: 0, reels: 0, cam: 0, picsWatch: false };
  /* WHICH PICTURES WERE ASKED TO DECODE — `picsAhead_`'s builder job calls `decode()` on the next two. */
  try {
    const d0 = HTMLImageElement.prototype.decode;
    if (d0) HTMLImageElement.prototype.decode = function () { this.__dec = true; return d0.apply(this, arguments); };
  } catch (e) {}
  const vis = (r, W, H) => r.width > 0 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
  function scan() {
    const W = innerWidth, H = innerHeight;
    const out = [];
    let reels = 0, cam = 0;
    for (const host of document.querySelectorAll('#screen > .screen')) {
      const hr = host.getBoundingClientRect();
      if (Math.min(hr.right, W) - Math.max(hr.left, 0) < 40) continue;
      const hcs = getComputedStyle(host);
      if (hcs.display === 'none') continue;
      const id = host.id.slice(2);
      const hop = hcs.visibility === 'hidden' ? 0 : +hcs.opacity;
      const pages = host.querySelectorAll(':scope > .page');
      if (hop <= 0.05) {
        /* A COLUMN WITH SOMETHING POSITIONED ON THE GLASS is a blank; one parked off it is not. */
        const any = [...pages].some(p => { const r = p.getBoundingClientRect(); return vis(r, W, H) && Math.min(r.bottom, H) - Math.max(r.top, 0) > 40; });
        if (any) out.push(['TRANSPARENT', id, -1, window.__rcDebug ? JSON.stringify({ inl: host.style.opacity, vis: host.style.visibility, cs: hcs.opacity, left: Math.round(hr.left), T: typeof TRAIL_X !== 'undefined' ? TRAIL_X : null, now: Math.round(performance.now()), ti: TABS.findIndex(t => t.id === AT), i: TABS.findIndex(t => t.id === id) }) : '']);
        continue;
      }
      for (let i = 0; i < pages.length; i++) {
        const el = pages[i];
        const r = el.getBoundingClientRect();
        const oy = Math.min(r.bottom, H) - Math.max(r.top, 0), ox = Math.min(r.right, W) - Math.max(r.left, 0);
        if (oy < 24 || ox < 24) continue;
        const cs = getComputedStyle(el);
        const op = (cs.visibility === 'hidden' ? 0 : +cs.opacity) * hop;
        const log = typeof logIndex_ === 'function' ? logIndex_(id, i) : i;
        if (op <= 0.05) {
          out.push(['HOLE', id, log, window.__rcDebug ? JSON.stringify({ top: Math.round(r.top), h: Math.round(r.height), off: el.offsetTop, vis: cs.visibility, op: cs.opacity, inl: el.style.opacity + '/' + el.style.visibility,
            far: el.classList.contains('far'), T: host.TRAIL ? { top: Math.round(host.TRAIL.top), bot: Math.round(host.TRAIL.bot), left: Math.round(host.TRAIL.until - performance.now()) } : null,
            placed: typeof colPlaced_ === 'function' ? colPlaced_(host) : null, now: typeof colNow_ === 'function' ? colNow_(host).map(Math.round) : null, at: PAGE[id] }) : '']);
          continue;
        }
        const pane = el.querySelector(':scope > .pane') || el;
        if (!pane.firstElementChild && !pane.textContent.trim()) { out.push(['EMPTY', id, log]); continue; }
        /* A PICTURE ON THE CARD IN FRONT NOT DRAWN, while a run asks it (the Feed landed on at rest): it was
           drawn when the run began, so one not drawn now is one a landing replaced. */
        if (R.picsWatch && id === AT && el.classList.contains('on')) {
          for (const img of pane.querySelectorAll('img')) {
            const ir = img.getBoundingClientRect();
            if (vis(ir, W, H) && ir.height > 8 && !(img.complete && img.naturalWidth)) { out.push(['PICTURE GONE', id, log]); break; }
          }
        }
        for (const l of pane.querySelectorAll('.loading')) {
          const lr = l.getBoundingClientRect();
          if (!vis(lr, W, H) || getComputedStyle(l).visibility === 'hidden') continue;
          /* THE TWO ALLOWED: the reels widget veiled because its fact is a clip (`feedPaint_`), and the camera being asked for on the Feed's page in front — a wait for the § */
          if (l.closest('#wgt-reels')) { reels++; continue; }
          if (l.closest('#cam-off') && id === AT && el.classList.contains('on')) { cam++; continue; }
          out.push(['LOADER', id, log]);
          break;
        }
      }
    }
    return { out, reels, cam };
  }
  const mc = new MessageChannel();
  mc.port1.onmessage = () => {
    if (!R.on) return;
    let s;
    try { s = scan(); } catch (e) { s = { out: [['READ FAILED', String(e && e.message).slice(0, 60), -1]], reels: 0, cam: 0 }; }
    R.frames++;
    if (s.reels) R.reels++;
    if (s.cam) R.cam++;
    s.out.forEach(x => { if (R.bad.length < 400) R.bad.push([R.seg, x[0], x[1], x[2], typeof AT !== 'undefined' ? AT : '', PAGE[AT] || 0, x[3] || '']); });
    requestAnimationFrame(() => mc.port2.postMessage(0));
  };
  R.start = seg => { R.seg = seg; R.bad = []; R.frames = 0; R.reels = 0; R.cam = 0; if (!R.on) { R.on = true; requestAnimationFrame(() => mc.port2.postMessage(0)); } };
  R.stop = () => { R.on = false; return { bad: R.bad, frames: R.frames, reels: R.reels, cam: R.cam }; };
  /* AT REST: the slide over, the queue empty, the builder done, the card in front the same height twice. */
  R.still = async (cap) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const t0 = performance.now();
    let lastH = -1, steady = 0;
    await wait(120);
    for (;;) {
      const host = document.getElementById('s-' + AT);
      const moving = host && host.getAnimations().some(a => a.playState === 'running');
      const booked = !!PLACE_FRAME || !!AFTER_SLIDE || AFTER_SLIDE_JOBS.size > 0
        || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length > 0) || (typeof aheadBusy_ === 'function' && aheadBusy_());
      const front = host && host.querySelector(':scope > .page.on');
      const fh = front ? front.offsetHeight : 0;
      steady = fh === lastH ? steady + 1 : 0;
      lastH = fh;
      if ((!moving && !booked && steady >= 1 && performance.now() > SLIDE_UNTIL) || performance.now() - t0 > (cap || 30000)) break;
      await wait(80);
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { at: AT, p: PAGE[AT] || 0, waited: Math.round(performance.now() - t0), busy: typeof aheadBusy_ === 'function' && aheadBusy_() };
  };
  R.place = async (col, p) => {
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    go(col, false, true);
    await new Promise(r => setTimeout(r, 60));
    if (p !== undefined && AXES.y.count(col) > 1) goPage(col, p, true);
    return R.still();
  };
  /* WHERE A FINGER CAN GO DOWN AND THE GRID WILL TAKE IT, at the left or right edge (a page not in front
     takes no presses, and the column's bare edge answers the hit test). */
  R.safe = (side, fy) => {
    const W = innerWidth, y = Math.round(innerHeight * (fy || 0.5));
    for (let k = 0; k < 40; k++) {
      const x = side === 'right' ? W - 6 - k * 3 : 6 + k * 3;
      const el = document.elementFromPoint(x, y);
      if (el && (el.id === 'screen' || el.classList.contains('screen') || el === document.body || el === document.documentElement)) return { x, y };
    }
    return null;
  };
  /* A COLUMN STILL HOLDING THE BOOT'S MARKUP WHERE THE LANDING SHOWS IT — on the glass, or on a phone the column
     either side (the peek, and the first thing a drag reveals). `PRE_PAYLOAD` is the app's own list of them. */
  R.bootGlass = () => {
    const out = [];
    try {
      const W = innerWidth, ti = TABS.findIndex(t => t.id === AT);
      TABS.forEach((t, i) => {
        if (t.id === AT || !PRE_PAYLOAD.has(t.id)) return;
        const host = document.getElementById('s-' + t.id);
        const r = host && host.getBoundingClientRect();
        const on = r && Math.min(r.right, W) - Math.max(r.left, 0) > 8;
        if (on || (!WIDE && Math.abs(i - ti) === 1)) out.push(t.id);
      });
    } catch (e) { out.push('could not read: ' + e.message); }
    return out;
  };
  /* THE PICTURES A PLACEMENT ASKS FOR AHEAD, asked at rest (`picsAhead_` and the builder's `pics` job). */
  R.pics = () => {
    const out = [];
    try {
      const lazy = pg => !!(pg && pg.querySelector('img[loading="lazy"]'));
      const pagesOf = id => [...document.querySelectorAll('#s-' + id + ' > .page')];
      const id = AT, pages = pagesOf(id), k = domIndex_(id, PAGE[id] || 0), dir = AHEAD.dir.y[id] || 1;
      for (let j = -2; j <= 6; j++) if (lazy(pages[k + dir * j])) out.push(id + ' page ' + logIndex_(id, k + dir * j) + ' (in front ' + (PAGE[id] || 0) + ') is still lazy');
      const ti = TABS.findIndex(t => t.id === AT);
      const nb = WIDE ? GLASS.cols.filter(c => c !== AT) : [TABS[ti - 1], TABS[ti + 1]].filter(Boolean).map(t => t.id);
      nb.forEach(c => {
        const ps = pagesOf(c), kk = domIndex_(c, PAGE[c] || 0);
        for (let j = -1; j <= 2; j++) if (lazy(ps[kk + j])) out.push(c + ' page ' + logIndex_(c, kk + j) + ', beside the column in front, is still lazy');
      });
      for (let j = 1; j <= 2; j++) {
        const pg = pages[k + dir * j];
        if (pg) pg.querySelectorAll('img').forEach(img => { if (!(img.complete && img.naturalWidth) && !img.__dec) out.push(id + ' page ' + logIndex_(id, k + dir * j) + ': a picture neither drawn nor asked to decode'); });
      }
    } catch (e) { out.push('could not read: ' + e.message); }
    return out;
  };
  /* A WIDGET RUNNING BESIDE THE COLUMN IN FRONT WITH NO SLOT ON THE GLASS — check/ui.js's rule, asked at rest. */
  R.offGlass = () => {
    const sc = document.getElementById('screen');
    const box = sc.getBoundingClientRect();
    const off = [];
    try {
      TOOLS_ON.forEach(e => {
        if (!e || e.col === AT) return;
        const sl = e.slot, col = sl && sl.isConnected && sl.closest('.screen');
        let ok = false;
        if (col) {
          const cs = getComputedStyle(col), pg = sl.closest('.page'), ps = pg && getComputedStyle(pg);
          const r = sl.getBoundingClientRect();
          ok = +cs.opacity > 0 && cs.visibility !== 'hidden' && !(ps && (+ps.opacity === 0 || ps.visibility === 'hidden'))
            && Math.min(r.right, box.right) - Math.max(r.left, box.left) > 24 && Math.min(r.bottom, box.bottom) - Math.max(r.top, box.top) > 24;
        }
        if (!ok) off.push(e.col + ' #wgt-' + String(e.w && e.w.id));
      });
    } catch (err) {}
    return off;
  };
}

/* ---------- THE FINGER: check/swipe.js's, each move stamped with the time it was meant to happen ---------- */
async function finger(cdp, x0, y0, dx, dy) {
  const T0 = Date.now(), dur = 80;
  const send = (type, x, y, ms) => cdp.send('Input.dispatchTouchEvent', { type, timestamp: (T0 + ms) / 1000,
    touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }] }).catch(() => {});
  send('touchStart', x0, y0, 0);
  let ms = 0;
  for (;;) {
    ms += 8;
    const t = Math.min(1, ms / dur);
    const wake = T0 + ms - Date.now();
    if (wake > 1) await sleep(wake);
    send('touchMove', Math.round(x0 + dx * t * t), Math.round(y0 + dy * t * t), ms);
    if (t >= 1) break;
  }
  ms += 4; const wake = T0 + ms - Date.now(); if (wake > 1) await sleep(wake);
  send('touchEnd', 0, 0, ms);
}
async function paced(fn) { const t0 = Date.now(); await fn(); const rest = PERIOD - (Date.now() - t0); if (rest > 0) await sleep(rest); }

const found = [];
const fail = (rule, where, msg) => found.push({ rule, where, msg });
const note = s => { if (VERBOSE) console.log('  ' + s); };

async function boot(browser, W, H, body, hold) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, STUDENT);
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; window.prompt = () => ''; window.open = () => null; });
  if (process.env.REACH_DEBUG) await page.addInitScript(() => { window.__rcDebug = true; });
  await page.addInitScript(READER);
  /* HELD: the builder never runs, so what is on the glass is what the landings drew (the boot-loader run). */
  if (hold) await page.addInitScript(() => { window.__aheadHold = true; });
  const JPG = fs.readFileSync(path.join(ROOT, 'data/reels/archetest.jpg'));
  await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, async r => {
    const u = r.request().url();
    if (/script\.google(usercontent)?\.com/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body }).catch(() => {});
    if (r.request().resourceType() === 'image') { await sleep(120); return r.fulfill({ status: 200, contentType: 'image/jpeg', body: JPG }).catch(() => {}); }
    return r.fulfill({ status: 204, body: '' }).catch(() => {});
  });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
  /* THE PAYLOAD PAINTED, THE LIBRARY IN, AND THE INBOX'S LANDING BEHIND US — then the builder's quiet. */
  await page.waitForFunction(() => typeof FIRST_PAINT_DONE !== 'undefined' && FIRST_PAINT_DONE
    && typeof LIBRARY_ROWS !== 'undefined' && Array.isArray(LIBRARY_ROWS) && LIBRARY_ROWS.length && window.__rc, null, { timeout: 180000, polling: 250 });
  await sleep(4000);
  await page.evaluate(() => window.__rc.still(60000));
  return { ctx, page, cdp, errs };
}

/* ONE RUN: set up and come to rest, the reading on, the flicks, a moment for what they leave behind, the
   reading off, and at rest again the widgets asked. */
async function run(env, where, setup, flicks, o) {
  const { page } = env;
  const ok = await page.evaluate(setup);
  if (!ok || ok.err) { fail('REACH', where, (ok && ok.err) || 'the run could not be set up, so nothing was measured'); return null; }
  await page.evaluate(() => window.__rc.still(60000));
  if (o && o.pics) {
    const p = await page.evaluate(() => window.__rc.pics());
    if (p.length) fail('NOT ASKED AHEAD', where, p.slice(0, 4).join('; ') + (p.length > 4 ? ` (${p.length} in all)` : ''));
  }
  await page.evaluate(seg => window.__rc.start(seg), where);
  await flicks();
  await sleep(1500);
  const r = await page.evaluate(() => window.__rc.stop());
  const rest = await page.evaluate(() => window.__rc.still(60000));
  const off = await page.evaluate(() => window.__rc.offGlass());
  return Object.assign(r, { ok, rest, off });
}

function judge(where, r, minFrames) {
  if (!r) return;
  if (r.frames < minFrames) { fail('REACH', where, `${r.frames} painted frames were read — the run did not happen, so nothing about it was measured`); return; }
  const by = {};
  r.bad.forEach(b => { const k = b[1]; (by[k] = by[k] || []).push(b); });
  note(`${where}: ${r.frames} frames read; ${Object.keys(by).map(k => k + ' ' + by[k].length).join(', ') || 'nothing wrong on the glass'}`
    + (r.reels ? `; the reels widget's clip under its loader in ${r.reels} (allowed)` : '')
    + (r.cam ? `; the camera starting on the page in front in ${r.cam} (allowed)` : ''));
  Object.keys(by).forEach(k => {
    const first = by[k][0];
    const cols = [...new Set(by[k].map(b => b[2]))];
    if (process.env.REACH_DEBUG) by[k].slice(0, 12).forEach(b => console.log('    ' + k + ' ' + b[2] + ' ' + b[6]));
    fail(k, where, `${by[k].length} time(s) in ${r.frames} painted frames — first ${first[2]} page ${first[3]}, with ${first[4]} page ${first[5]} in front`
      + (cols.length > 1 ? `; columns: ${cols.join(', ')}` : ''));
  });
  if (r.off.length) fail('RUNNING OFF GLASS', where, `${r.off.join(', ')} running beside the column in front with no slot on the glass, at rest after the run`);
}

let PORT = 0;
(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.log('reach: could not serve — ' + e.message); process.exit(1); }
  PORT = server.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  /* NO SWIPE-BACK: a backward flick past the first column is an overscroll, which Chromium answers with
     history navigation — not the app's behaviour and not what this measures. */
  const browser = await chromium.launch(Object.assign(exe ? { executablePath: exe } : {},
    { args: ['--overscroll-history-navigation=0', '--disable-features=OverscrollHistoryNavigation',
             '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }));
  const body = heavy_();
  const t0 = Date.now();
  let runs = 0;
  for (const [W, H] of SIZES) {
    const at = `${W}x${H} at ${CPU}x`;
    let env;
    try { env = await boot(browser, W, H, body); }
    catch (e) { fail('REACH', at, 'the app did not load: ' + e.message); continue; }
    const { page, cdp } = env;
    const vflicks = async () => {
      const S = await page.evaluate(() => window.__rc.safe('left', 0.62));
      const S2 = await page.evaluate(() => window.__rc.safe('left', 0.38));
      if (!S || !S2) throw new Error('no spot at the edge the grid would take');
      const dy = Math.min(240, Math.round(H * 0.28));
      for (let k = 0; k < FLICKS; k++) await paced(() => finger(cdp, S.x, S.y, 0, -dy));
      await sleep(1000);
      for (let k = 0; k < FLICKS; k++) await paced(() => finger(cdp, S2.x, S2.y, 0, dy));
    };
    const go_ = async (where, setup, flicks, min, o) => {
      runs++;
      try { judge(where, await run(env, where, setup, flicks || vflicks, o), min || 20); }
      catch (e) { fail('REACH', where, 'the run threw: ' + String(e && e.message || e).slice(0, 160)); }
    };
    if (want('find')) await go_(`${at} find`, async () => {
      await window.__rc.place('stuff', 0);
      STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: 'P-AQA-8461-2406-2F' }];
      paintStuff();
      goPage('stuff', stuffFirstResult_(), true);
      const n = AXES.y.count('stuff') - stuffFirstResult_();
      return n >= 30 ? { n } : { err: `the 2F paper is ${n} page(s) on Find — the run needs 30` };
    });
    if (want('res')) await go_(`${at} resources, boxing`, async () => {
      await window.__rc.place('res', 0);
      return inFinder_(finderOf_('res'), () => {
        const x = stuffItemsAll_().find(it => it.kind === 'boxer');
        if (!x) return { err: 'no boxer on the Resources column' };
        STUFF.q = ''; STUFF.filters = [{ field: 'shelf', value: x.shelf }];
        paintStuff();
        let first = stuffFirstResult_();
        if (AXES.y.count('res') <= first + 2) {
          const pick = document.querySelector('#res-groups [data-do="facet-pick"][data-value*="oxer"], #res-groups [data-do="facet-pick"]');
          if (pick) { STUFF.filters.push({ field: pick.getAttribute('data-field'), value: pick.getAttribute('data-value') }); paintStuff(); first = stuffFirstResult_(); }
        }
        goPage('res', first, true);
        const n = AXES.y.count('res') - first;
        return n >= 16 ? { n } : { err: `the boxing shelf is ${n} page(s) — the run needs 16` };
      });
    }, null, 20, { pics: true });
    if (want('feed')) await go_(`${at} feed`, async () => {
      await window.__rc.place('feed', 0);
      const n = AXES.y.count('feed');
      return n >= 30 ? { n } : { err: `the feed is ${n} page(s) — the run needs 30` };
    }, null, 20, { pics: true });
    /* THE FEED LANDED ON, AT REST — three landings that change nothing, as the inbox's does two seconds after every signed-in open. § */
    if (want('feedland')) await go_(`${at} feed landed on`, async () => {
      await window.__rc.place('feed', 3);
      const front = document.querySelector('#s-feed > .page.on');
      const imgs = front ? [...front.querySelectorAll('img')] : [];
      for (let k = 0; k < 40 && imgs.some(i => !(i.complete && i.naturalWidth)); k++) await new Promise(r => setTimeout(r, 100));
      if (!imgs.length) return { err: 'the Feed\'s page 3 has no picture, so a landing has nothing to drop' };
      if (imgs.some(i => !(i.complete && i.naturalWidth))) return { err: 'the Feed\'s page 3 never drew its pictures, so nothing was asked' };
      window.__rc.picsWatch = true;
      return { pics: imgs.length };
    }, async () => {
      for (let k = 0; k < 3; k++) { await page.evaluate(() => landRepaint_()); await sleep(400); }
      await page.evaluate(() => { window.__rc.picsWatch = false; });
    }, 8);
    /* FIND REPAINTED WITH THE CARD IN FRONT THREE INTO THE PAPER, then turned once — a star, a save or a landing draws the window again from nothing; on an iPad the § */
    if (want('findland')) await go_(`${at} find repainted`, async () => {
      await window.__rc.place('stuff', 0);
      STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: 'P-AQA-8461-2406-2F' }];
      paintStuff();
      goPage('stuff', stuffFirstResult_() + 3, true);
      const n = AXES.y.count('stuff') - stuffFirstResult_();
      return n >= 30 ? { n } : { err: `the 2F paper is ${n} page(s) on Find — the run needs 30` };
    }, async () => {
      const S = await page.evaluate(() => window.__rc.safe('left', 0.62));
      if (!S) throw new Error('no spot at the edge the grid would take');
      const dy = Math.min(240, Math.round(H * 0.28));
      await page.evaluate(() => repaint());
      await paced(() => finger(cdp, S.x, S.y, 0, -dy));
      await sleep(1500);
      await page.evaluate(() => window.__rc.still(60000));
      await page.evaluate(() => landRepaint_());
      await paced(() => finger(cdp, S.x, S.y, 0, dy));
    }, 10);
    if (want('sweep')) await go_(`${at} sweep`, async () => {
      await window.__rc.place(TABS[0].id);
      return { n: TABS.length };
    }, async () => {
      const L = await page.evaluate(() => window.__rc.safe('left', 0.5));
      const Rr = await page.evaluate(() => window.__rc.safe('right', 0.5));
      if (!L || !Rr) throw new Error('no spot at the edges the grid would take');
      const dx = Math.min(240, Math.round(W * 0.55));
      for (const dir of [1, -1]) {
        for (let burst = 0; burst < 8; burst++) {
          const i = await page.evaluate(() => TABS.findIndex(t => t.id === AT));
          const n = await page.evaluate(() => TABS.length);
          if ((dir > 0 && i >= n - 1) || (dir < 0 && i <= 0)) break;
          for (let k = 0; k < BURST; k++) await paced(() => dir > 0 ? finger(cdp, Rr.x, Rr.y, -dx, 0) : finger(cdp, L.x, L.y, dx, 0));
          await sleep(500);
        }
      }
    });
    /* TOOLS, ARRIVED AT AFTER A LANDING AND THE QUIET THAT FOLLOWS — the builder has drawn what the landing
       marked; the arrival must find it drawn. */
    if (want('tools')) await go_(`${at} tools after a landing`, async () => {
      const i = TABS.findIndex(t => t.id === 'tools');
      if (i < 1) return { err: 'no column left of Tools to arrive from' };
      await window.__rc.place(TABS[i - 1].id);
      landRepaint_();
      await window.__rc.still(60000);
      return { from: TABS[i - 1].id };
    }, async () => {
      const Rr = await page.evaluate(() => window.__rc.safe('right', 0.5));
      if (!Rr) throw new Error('no spot at the edge the grid would take');
      const from = await page.evaluate(() => AT);
      /* THE ARRIVAL IS WHAT IS ASKED HERE, NOT THE GESTURE (swipe.js asks that). § */
      const reached = async () => { for (let k = 0; k < 30; k++) { if (await page.evaluate(() => AT) === 'tools') return true; await sleep(100); } return false; };
      await paced(() => finger(cdp, Rr.x, Rr.y, -Math.min(240, Math.round(W * 0.55)), 0));
      if (!(await reached())) await paced(() => finger(cdp, Rr.x, Rr.y, -Math.round(W * 0.55), 0));
      const there = (await reached()) ? 'tools' : await page.evaluate(() => AT);
      if (there !== 'tools') throw new Error('the flick across from ' + from + ' (from ' + Rr.x + ',' + Rr.y + ') landed on ' + there + ', not Tools');
      await vflicks();
    });
    if (env.errs.length) fail('PAGE ERROR', at, env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
    /* A FRESH LOAD, THE BUILDER HELD, THE ROW FLICKED SIDEWAYS FOUR TIMES: § */
    if (want('bootglass')) {
      runs++;
      const where = `${at} sideways after a load, the builder held`;
      let held;
      try {
        held = await boot(browser, W, H, body, true);
        const hp = held.page;
        const Rr = await hp.evaluate(() => window.__rc.safe('right', 0.5));
        if (!Rr) throw new Error('no spot at the edge the grid would take');
        const left0 = await hp.evaluate(() => [...PRE_PAYLOAD]);
        if (!left0.length) throw new Error('no column was left on the boot\'s markup after the load, so nothing was asked');
        for (let k = 0; k < 4; k++) {
          await paced(() => finger(held.cdp, Rr.x, Rr.y, -Math.min(240, Math.round(W * 0.55)), 0));
          await hp.evaluate(() => window.__rc.still(20000));
          const left = await hp.evaluate(() => window.__rc.bootGlass());
          const at2 = await hp.evaluate(() => AT);
          note(`${where}: landing ${k + 1} on ${at2}; boot's markup shown: ${left.join(', ') || 'none'}`);
          if (left.length) { fail('BOOT LOADER', where, `landing ${k + 1} on ${at2} shows ${left.join(', ')} still on the boot's loader`); break; }
        }
        if (held.errs.length) fail('PAGE ERROR', where, held.errs.slice(0, 3).join(' | '));
      } catch (e) { fail('REACH', where, 'the run threw: ' + String(e && e.message || e).slice(0, 160)); }
      if (held) await held.ctx.close();
    }
  }
  await browser.close();
  server.close();
  const secs = Math.round((Date.now() - t0) / 1000);
  const narrowed = ONLY.length || WIDTH || CPU !== 4;
  if (narrowed) console.log(`reach: NARROWED to ${ONLY.join(',') || 'every run'} at ${SIZES.map(s => s[0]).join(' and ')}, ${CPU}x — not the whole check`);
  if (!found.length) {
    console.log(`reach: ${runs} runs at ${SIZES.map(s => s.join('x')).join(' and ')}, ${CPU}x CPU, ${secs}s`);
    console.log('OK — every card a flick reached was drawn before it got there: no hole, no empty card, no loader, no transparent column, nothing running off the glass.');
    process.exit(0);
  }
  const by = {};
  found.forEach(f => { (by[f.rule] = by[f.rule] || []).push(f); });
  Object.keys(by).forEach(rule => {
    console.log('');
    console.log(`${rule}  (${by[rule].length})`);
    by[rule].forEach(f => console.log(`  ${f.where}: ${f.msg}`));
  });
  console.log('');
  console.log(`FAILED — ${found.length} finding(s) across ${runs} runs, ${secs}s`);
  process.exit(1);
})().catch(e => { console.log('reach: the check failed to run — ' + (e && e.stack || e)); process.exit(1); });
