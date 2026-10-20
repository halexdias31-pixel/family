#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/pen.js A FINGER ON THE PEN: § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.PEN_PORT || 0);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const VERBOSE = process.argv.includes('--verbose') || process.env.VERBOSE === '1';
const ONLY = ((process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const want = k => !ONLY.length || ONLY.indexOf(k) !== -1;
/* `--shots` WRITES WHAT A HUMAN SHOULD LOOK AT to check/shots/ (ignored by git), or to PEN_SHOTS. */
const SHOTS = process.env.PEN_SHOTS || (process.argv.includes('--shots') ? path.join(__dirname, 'shots') : '');
const shot = async (page, name) => {
  if (!SHOTS) return;
  try { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, 'pen-' + name + '.png') }); } catch (e) {}
};
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
/* June 2024 Foundation, Q7: a grid figure, 180px wide at 320 -- the smallest pad a child draws on. */
const Q7 = 'Q-1MA1-2406-1F-7';
/* November 2019 Higher, Q4: a construction, so its bar offers a Ruler and a Compass. */
const COMPASS_Q = 'Q-1MA1-1911-1H-4';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.webmanifest': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
/* THE PEN'S POINTERMOVE AT 4x CPU, p95: § */
const PEN_P95_MS = Number(process.env.PEN_P95_MS || 3.0);
const PAINTED_MIN = 0.95;     // events whose path is painted in the first frame after them: 100% measured, 37-40% with a frame added
const FRAME_WRITES_MAX = 2;   // live `d`s written in one frame: the open chunk, and one being frozen
const PAD_CHUNK_EXPECT = 130;
/* THE CPU THROTTLE THE GESTURES RUN UNDER: 4x, a slow phone, unless PEN_RATE says otherwise -- `PEN_RATE=1` for
   the numbers at full speed (338 prints both). Counts and geometry are judged at any rate. */
const RATE = Number(process.env.PEN_RATE || 4);
/* AN ADDRESS QUERY FOR EVERY PAGE -- `PEN_QUERY=pen=sizes` runs the gestures with the sizes line up, where the iPad
   reading is to be taken: 'samples' must then count no forced layout either (the review found 78 in 78). */
const QUERY = process.env.PEN_QUERY || '';

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT_WANTED, () => ok(s));
  });
}

const found = [];
const fail = (sec, where, msg) => found.push(`${sec} ${where}: ${msg}`);
const say = s => { if (VERBOSE) console.log('  ' + s); };
let reached = 0;

async function boot(browser, W, H, port) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
                                         serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; window.open = () => null; });
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${port}/index.html${QUERY ? '?' + QUERY : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof initWhiteboard === 'function', null, { timeout: 90000 });
  await sleep(1200);
  const cdp = await ctx.newCDPSession(page);
  /* WHAT THE GRID TOOK DURING A GESTURE: a listener on the window registered after overworld.js's, so it
     reads `SWIPE` after the grid has decided. */
  await page.evaluate(() => {
    /* THE BUDGET, COUNTED: § */
    const M = window.__pm = { on: false, reads: [], writes: [], dur: [], t0s: [], t1s: [], dw: [], fw: 0 };
    let inH = false, r = 0, wr = 0, t0 = 0;
    const gbcr = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () { if (inH && this.classList && this.classList.contains('qpad-ink')) r++; return gbcr.call(this); };
    const sa = Element.prototype.setAttribute;
    /* AND EVERY LIVE `d` WRITTEN, counted into the frame it was written in (the frame tick in 'samples' empties it). */
    Element.prototype.setAttribute = function (n, v) {
      if (n === 'd') { if (inH) wr++; if (M.on && this.hasAttribute && this.hasAttribute('data-live')) M.fw++; }
      return sa.call(this, n, v);
    };
    document.addEventListener('pointermove', () => { if (!M.on) return; inH = true; r = 0; wr = 0; t0 = performance.now(); }, true);
    document.addEventListener('pointermove', () => {
      if (!M.on || !inH) return;
      inH = false;
      try { if (!PAD_GO) return; } catch (e) { return; }
      const t1 = performance.now(); M.dur.push(t1 - t0); M.reads.push(r); M.writes.push(wr); M.t0s.push(t0); M.t1s.push(t1);
    });
    new MutationObserver(list => {
      if (!M.on) return;
      const t = performance.now();
      if (list.some(m => m.attributeName === 'd' && m.target.hasAttribute && m.target.hasAttribute('data-live'))) M.dw.push(t);
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['d'] });
    window.__pen = { axis: null };
    addEventListener('pointermove', () => { try { if (SWIPE.axis) window.__pen.axis = SWIPE.axis + (SWIPE.scroll ? ' (pane)' : ''); } catch (e) {} });
  });
  return { ctx, page, cdp, errs, W, H };
}

/* ---------- THE FINGERS § */
const T = (env, type, pts, ms) => env.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts,
  timestamp: ((env.t0 || 0) + (ms || 0)) / 1000 }).catch(() => {});
const pt = (x, y, id = 1, r = 8) => ({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, id, radiusX: r, radiusY: r, force: 1 });
async function stream(env, frames, dt, from) {
  const start = Date.now(), ps = [];
  for (let i = 0; i < frames.length; i++) {
    const due = start + i * dt;
    while (Date.now() < due) await new Promise(r => setImmediate(r));
    ps.push(T(env, 'touchMove', frames[i], (from || 0) + (i + 1) * dt));
  }
  await Promise.all(ps);
}
const begin = env => { env.t0 = Date.now(); };
/* NOW, ON THE GESTURE'S OWN CLOCK -- for a stroke planned after waits whose length the machine decides. */
const since = env => Date.now() - (env.t0 || 0);

/* ---------- A CHROMIUM TRACE: FORCED LAYOUTS INSIDE THE PEN'S EVENTS, COUNTED § */
async function traceStart(env) {
  env.trace = [];
  env.onTrace = d => { env.trace.push(...d.value); };
  env.cdp.on('Tracing.dataCollected', env.onTrace);
  await env.cdp.send('Tracing.start', { categories: 'devtools.timeline', transferMode: 'ReportEvents' });
}
async function traceEnd(env) {
  const done = new Promise(r => env.cdp.once('Tracing.tracingComplete', r));
  await env.cdp.send('Tracing.end');
  await done;
  env.cdp.off('Tracing.dataCollected', env.onTrace);
  const ev = env.trace || [];
  env.trace = null;
  const disp = ev.filter(e => e.name === 'EventDispatch' && e.ph === 'X' && e.args && e.args.data && e.args.data.type === 'pointermove');
  const lay = ev.filter(e => (e.name === 'Layout' || e.name === 'UpdateLayoutTree') && (e.ph === 'X' || e.ph === 'B'));
  let forced = 0;
  disp.forEach(d => { if (lay.some(l => l.pid === d.pid && l.tid === d.tid && l.ts >= d.ts && l.ts < d.ts + (d.dur || 0))) forced++; });
  return { n: disp.length, forced, tdur: disp.map(e => (e.tdur || e.dur || 0) / 1000) };
}

/* A PLAN OF FRAMES, PLAYED ON THE WALL CLOCK -- for gestures where a hand and a finger each do their own thing. § */
const track = (id, r, from, to, dt, at) => { const o = []; for (let u = 0; from + u <= to + 1e-9; u += dt) o.push({ t: Math.round(from + u), p: [...at(u), id, r] }); return o; };
/* A HAND'S STROKE STARTS SLOWLY AND ENDS SLOWLY: the minimum-jerk profile, 0 to 1 over `u` 0 to 1 (fourth review -- a finger
   that starts slowly is what let a settled palm's last few px beat it). */
const mj = u => { u = Math.max(0, Math.min(1, u)); return 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5; };
function plan(...tracks) {
  tracks = tracks.filter(tr => tr.length);
  const times = [...new Set([].concat(...tracks.map(tr => tr.map(f => f.t).concat([tr[tr.length - 1].t + 8]))))].sort((a, b) => a - b);
  return times.map(t => ({ t, pts: tracks.filter(tr => t >= tr[0].t && t <= tr[tr.length - 1].t).map(tr => { let f = tr[0]; for (const g of tr) if (g.t <= t) f = g; return f.p; }) }));
}
async function play(env, frames) {
  let prev = [];
  const start = Date.now(), t0 = since(env), ps = [];
  const P = q => pt(q[0], q[1], q[2], q[3] || 8);
  for (const f of frames) {
    while (Date.now() < start + f.t) await new Promise(r => setImmediate(r));
    const ids = f.pts.map(q => q[2]), pids = prev.map(q => q[2]);
    const gone = prev.filter(q => ids.indexOf(q[2]) < 0), added = f.pts.some(q => pids.indexOf(q[2]) < 0);
    if (gone.length) ps.push(T(env, 'touchEnd', f.pts.length ? gone.map(P) : [], t0 + f.t));
    if (added) ps.push(T(env, 'touchStart', f.pts.map(P), t0 + f.t));
    else if (!gone.length && f.pts.length) ps.push(T(env, 'touchMove', f.pts.map(P), t0 + f.t));
    prev = f.pts;
  }
  await Promise.all(ps);
  if (prev.length) await T(env, 'touchEnd', [], t0 + frames[frames.length - 1].t + 5);
}
/* A MOUSE OR A STYLUS, through CDP's mouse events -- `pointerType: 'pen'` is a stylus. */
const MO = (env, type, x, y, kind, buttons) => env.cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1, pointerType: kind }).catch(() => {});

/* ---------- THE BOARD ------------------------------------------------------------------------------- */
async function board(env) {
  return env.page.evaluate(async () => {
    if (AT !== 'tools') go('tools', false, true);
    goPage('tools', widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard'), true);
    for (let i = 0; i < 100; i++) {
      const busy = (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length) || (typeof AFTER_SLIDE !== 'undefined' && AFTER_SLIDE)
        || (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && performance.now() < SETTLE_ON.until);
      /* THE PEN'S BLANK SHEET, mounted where the board was: the whiteboard is the maths notebook since 377 (board.js), and this check is the pen's. */
      const slot = document.querySelector('#s-tools #wgt-whiteboard');
      if (!busy && i >= 4 && slot && !slot.querySelector('.wb-box')) {
        const nb = slot.querySelector('.nb-box');
        if (nb) nb.style.display = 'none';
        const host = document.createElement('div');
        host.className = 'wb-box';
        (nb ? nb.parentNode : slot).insertBefore(host, nb ? nb.nextSibling : null);
        initWhiteboard();
      }
      if (!busy && i >= 4 && document.querySelector('#s-tools #wgt-whiteboard .qpad')) break;
      await new Promise(r => setTimeout(r, 100));
    }
    const pad = document.querySelector('#s-tools #wgt-whiteboard .qpad');
    if (!pad) return null;
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const card = pad.closest('.card') || pad.closest('#wgt-whiteboard');
    return { k: pad.getAttribute('data-k'), armed: PAD_ON === pad.getAttribute('data-k'), at: AT, page: PAGE.tools,
             ink: box(pad.querySelector('.qpad-ink')), art: box(pad.querySelector('.qpad-art')), lock: box(pad.querySelector('.qpad-lock')),
             undo: box(pad.querySelector('.qpad-undo')), note: box(pad.querySelector('.qpad-note')), card: box(card) };
  });
}
async function arm(env, b, get) {
  for (let i = 0; i < 4; i++) {
    b = await get(env);
    if (!b) return null;
    if (b.armed) return b;
    begin(env);
    await T(env, 'touchStart', [pt(b.lock.x, b.lock.y)], 0); await sleep(40); await T(env, 'touchEnd', [], 40);
    await sleep(700);
  }
  b = await get(env);
  return b && b.armed ? b : null;
}
/* EVERYTHING THE PEN HOLDS FOR THIS PAD, AND ITS MARKS, PUT BACK TO NOTHING -- and the pad drawn again. */
const reset = (env, k, also) => env.page.evaluate(([k, also]) => {
  try { ansStore_(k, also ? JSON.stringify(also) : null); } catch (e) {}
  if (typeof padDrop_ === 'function') padDrop_(); else { PAD_ST = null; PAD_GO = null; }
  if (typeof initWhiteboard === 'function' && /^board:/.test(k)) initWhiteboard();
  /* AND EVERY COPY OF A QUESTION'S PAD DRAWN AGAIN FROM THE NOW EMPTY STORE -- the last gesture's marks off it. */
  document.querySelectorAll('.qpad').forEach(p => { if (p.getAttribute('data-k') === k) padRepaint_(p, padRead_(k)); });
  window.__pen.axis = null;
}, [k, also || null]);
/* WHAT IS THERE NOW: the store, what is drawn, the column, the lock, and whether the pen has let go. */
const look = (env, k, sel) => env.page.evaluate(([k, sel]) => {
  let stored = []; try { stored = JSON.parse(ansValue_(k) || '[]'); } catch (e) { stored = ['unreadable']; }
  const pads = [...document.querySelectorAll(sel)].filter(p => p.getAttribute('data-k') === k);
  const pad = pads[0];
  return { stored, paths: pad ? pad.querySelectorAll('.qpad-g path').length : -1,
           live: !!document.querySelector('.qpad-ink [data-live]'), aid: !!(pad && pad.querySelector('.qpad-aid').firstChild),
           at: AT, page: Object.assign({}, PAGE), armed: PAD_ON === k, axis: window.__pen.axis,
           busy: typeof padBusy_ === 'function' ? padBusy_() : null, touch: typeof PAD_TOUCH !== 'undefined' ? PAD_TOUCH.size : null };
}, [k, sel]);
const BOARD = '#s-tools #wgt-whiteboard .qpad';
/* WHAT THE PICTURE SHOWED FROM THE SECOND CONTACT'S LANDING, frame by frame (third review): § */
const shownWatch = env => env.page.evaluate(() => {
  if (!window.__shownOn) {
    window.__shownOn = true;
    document.addEventListener('pointerdown', e => {
      const S = window.__shown;
      if (S && S.on) { S.ids[e.pointerId] = 1; if (Object.keys(S.ids).length >= 2) S.second = true; }
    }, true);
    const tick = () => {
      const S = window.__shown;
      if (S && S.on && S.second) {
        S.frames++;
        const live = document.querySelector('.qpad-ink [data-live]');
        const aid = [...document.querySelectorAll('.qpad .qpad-aid')].some(a => a.firstChild);
        /* AND THE LOUPE (357): a magnified copy of a mark that cannot be kept is that mark shown. */
        const lp = !!document.querySelector('body > .pad-loupe.on');
        if (live || aid || lp) { S.shown++; if (!S.what) S.what = live ? 'a preview ' + (live.getAttribute('d') || '').slice(0, 40) : aid ? 'the aid' : 'the loupe'; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  window.__shown = { on: true, ids: {}, second: false, frames: 0, shown: 0, what: '' };
});
const shownRead = env => env.page.evaluate(() => {
  const S = window.__shown || {};
  S.on = false;
  return { frames: S.frames || 0, shown: S.shown || 0, what: S.what || '' };
});

/* THE QUESTION CARD, its pen on it -- a question answered by drawing is drawn on its card, with no face to
   turn to (docs/history/356). */
async function card(env, row) {
  const k = await env.page.evaluate(async r => {
    go('stuff', false, true);
    const hit = stuffItemsAll_().find(x => x.row && x.row.row_id === r);
    if (!hit) return null;
    STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
    paintStuff(true);
    await new Promise(z => setTimeout(z, 600));
    const h2 = stuffFiltered().find(x => x.row && x.row.row_id === r) || hit;
    goPage('stuff', stuffPageOf_(h2) + stuffFirstResult_(), true);
    await new Promise(z => setTimeout(z, 1400));
    window.__k = padKey_(h2);
    return window.__k;
  }, row);
  return k;
}
const cardBox = env => env.page.evaluate(() => {
  const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === window.__k);
  if (!pad) return null;
  const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const words = pad.closest('.qcard') && pad.closest('.qcard').querySelector('.qsheet');
  return { k: window.__k, armed: PAD_ON === window.__k, ink: box(pad.querySelector('.qpad-ink')), art: box(pad.querySelector('.qpad-art')),
           lock: box(pad.querySelector('.qpad-lock')), words: box(words), at: AT, page: PAGE.stuff };
});
const CARD = '#s-stuff .page.on .qpad';

/* A CIRCLE OF RADIUS r ROUND (cx, cy), one turn in n samples `dt` ms apart, from angle 0. */
async function circle(env, cx, cy, r, n, dt) {
  const fr = [];
  for (let i = 1; i <= n; i++) { const a = 2 * Math.PI * i / n; fr.push([pt(cx + r * Math.cos(a), cy + r * Math.sin(a))]); }
  await T(env, 'touchStart', [pt(cx + r, cy)], 0);
  await stream(env, fr, dt);
  await T(env, 'touchEnd', [], n * dt + 8);
}
/* HOW FAR THE DRAWN PATH IS FROM ROUND, ON THE SCREEN: § */
const roundness = (env, k, sel, cx, cy, r) => env.page.evaluate(([k, sel, cx, cy, r]) => {
  const pad = [...document.querySelectorAll(sel)].find(p => p.getAttribute('data-k') === k);
  const paths = pad ? pad.querySelectorAll('.qpad-g path') : [];
  const path = paths[paths.length - 1];
  let st = []; try { st = JSON.parse(ansValue_(k) || '[]').pop() || []; } catch (e) {}
  if (!path || st.length < 8) return null;
  const box = pad.querySelector('.qpad-ink').getBoundingClientRect();
  const L = path.getTotalLength(), n = st.length;
  const c1 = Math.hypot(st[2] - st[0], st[3] - st[1]) * 1.05, c2 = Math.hypot(st[n - 2] - st[n - 4], st[n - 1] - st[n - 3]) * 1.05;
  let worst = 0;
  for (let i = 0; i <= 240; i++) {
    const p = path.getPointAtLength(c1 + (L - c1 - c2) * i / 240);
    worst = Math.max(worst, Math.abs(Math.hypot(box.left + p.x / 340 * box.width - cx, box.top + p.y / 340 * box.height - cy) - r));
  }
  let chord = 0;
  for (let i = 2; i + 1 < n; i += 2) chord = Math.max(chord, Math.hypot((st[i] - st[i - 2]) * box.width / 340, (st[i + 1] - st[i - 1]) * box.height / 340));
  return { worst: Math.round(worst * 100) / 100, points: n / 2, chord: Math.round(chord * 10) / 10, curves: /C/.test(path.getAttribute('d') || '') };
}, [k, sel, cx, cy, r]);

/* ONE GESTURE, AND WHAT IT LEFT. `plan` runs the fingers; the rest is the same every time. */
async function gesture(env, k, sel, plan) {
  begin(env);
  await plan();
  await sleep(700);
  return look(env, k, sel);
}
const nothing = (sec, where, r, b) => {
  if (r.stored.length) fail(sec, where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing`);
  if (r.paths > 0) fail(sec, where, `${r.paths} mark(s) drawn — wanted none`);
  unmoved(sec, where, r, b);
};
const unmoved = (sec, where, r, b) => {
  if (r.live) fail(sec, where, 'a live preview was left on the picture');
  if (r.axis) fail(sec, where, `the swipe engine took the gesture (${r.axis})`);
  if (r.at !== b.at || (b.page !== undefined && r.page[r.at] !== b.page)) fail(sec, where, `the column or page moved: ${b.at} ${b.page} -> ${r.at} ${r.page[r.at]}`);
  if (!r.armed) fail(sec, where, 'the pad was no longer armed');
  if (r.busy) fail(sec, where, 'padBusy_ still holds the swipe engine off after every finger lifted');
  if (r.touch) fail(sec, where, `${r.touch} contact(s) left behind after every finger lifted`);
};

(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.log('pen: could not serve — ' + e.message); process.exit(1); }
  const port = server.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const started = Date.now();

  /* ==================== THE BOARD, AT A PHONE AND AN iPAD ==================== */
  for (const [W, H] of [[390, 844], [820, 1180]]) {
    const at = `${W}x${H}`;
    if (!['two', 'palm', 'large', 'tap', 'cancel', 'lost', 'bar', 'drift', 'grip', 'settle', 'phase', 'types', 'steady', 'inv', 'samples', 'round'].some(want)) break;
    const env = await boot(browser, W, H, port);
    let b = await board(env);
    if (!b) { fail('REACH', at, 'no whiteboard on Tools'); await env.ctx.close(); continue; }
    await reset(env, b.k);
    b = await arm(env, b, board);
    if (!b) { fail('REACH', at, 'the board could not be armed with a real tap on its lock'); await env.ctx.close(); continue; }
    reached++;
    const k = b.k;
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    const A = () => ({ x: b.ink.l + b.ink.w * 0.35, y: b.ink.t + b.ink.h * 0.3 });
    const B = () => ({ x: b.ink.l + b.ink.w * 0.65, y: b.ink.t + b.ink.h * 0.32 });
    const fresh = async () => { await reset(env, k); b = (await arm(env, b, board)) || b; };

    if (want('inv')) {
      const inv = await env.page.evaluate(() => {
        const ink = document.querySelector('#s-tools #wgt-whiteboard .qpad-ink');
        const zooms = [];
        for (let el = ink; el && el !== document.documentElement; el = el.parentElement) {
          const z = getComputedStyle(el).zoom; if (z && z !== '1' && z !== 'normal') zooms.push(String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) + ':' + z);
        }
        const a = ink.getBoundingClientRect(), r = ink.closest('.qpad-art').querySelector('svg').getBoundingClientRect();
        return { zooms, d: Math.max(Math.abs(a.left - r.left), Math.abs(a.top - r.top), Math.abs(a.width - r.width), Math.abs(a.height - r.height)),
                 left: a.left, right: innerWidth - a.right, bottom: innerHeight - a.bottom };
      });
      if (inv.zooms.length) fail('inv', at + ' board', 'a zoomed ancestor of the armed ink: ' + inv.zooms.join(', '));
      if (inv.d > 0.5) fail('inv', at + ' board', `the ink box is ${inv.d.toFixed(1)}px off the picture's`);
      if (inv.left < 16 || inv.right < 16 || inv.bottom < 16) fail('inv', at + ' board', `the ink is ${Math.round(inv.left)} / ${Math.round(inv.right)} / ${Math.round(inv.bottom)}px from the left, right and bottom edges — under 16`);
      say(`inv ${at} board ${JSON.stringify(inv)}`);
    }

    if (want('two')) {
      /* A TWO-FINGER TAP, 40ms apart, lifted together. */
      let r = await gesture(env, k, BOARD, async () => {
        const a = A(), c = B();
        await T(env, 'touchStart', [pt(a.x, a.y, 1)], 0); await sleep(40);
        await T(env, 'touchStart', [pt(a.x, a.y, 1), pt(c.x, c.y, 2)], 40); await sleep(60);
        await T(env, 'touchEnd', [], 100);
      });
      nothing('two', at + ' tap', r, b); say(`two ${at} tap ${JSON.stringify(r.stored)}`);
      await fresh();
      /* A PAN, 150px up together over 250ms. */
      r = await gesture(env, k, BOARD, async () => {
        const a = A(), c = B(), fr = [];
        await T(env, 'touchStart', [pt(a.x, a.y + 150, 1)], 0); await sleep(40);
        await T(env, 'touchStart', [pt(a.x, a.y + 150, 1), pt(c.x, c.y + 150, 2)], 40);
        for (let i = 1; i <= 30; i++) fr.push([pt(a.x, a.y + 150 - 5 * i, 1), pt(c.x, c.y + 150 - 5 * i, 2)]);
        await stream(env, fr, 8, 40);
        await T(env, 'touchEnd', [], 300);
      });
      nothing('two', at + ' pan', r, b); say(`two ${at} pan ${JSON.stringify(r.stored)}`);
      await fresh();
      /* A PINCH, 60px each way. */
      r = await gesture(env, k, BOARD, async () => {
        const a = A(), c = B(), fr = [];
        await T(env, 'touchStart', [pt(a.x, a.y, 1)], 0); await sleep(40);
        await T(env, 'touchStart', [pt(a.x, a.y, 1), pt(c.x, c.y, 2)], 40);
        for (let i = 1; i <= 25; i++) fr.push([pt(a.x - 2.4 * i, a.y, 1), pt(c.x + 2.4 * i, c.y, 2)]);
        await stream(env, fr, 8, 40);
        await T(env, 'touchEnd', [], 260);
      });
      nothing('two', at + ' pinch', r, b); say(`two ${at} pinch ${JSON.stringify(r.stored)}`);
      if (W === 390) await shot(env.page, `${at}-two`);
      await fresh();
    }

    if (want('palm')) {
      /* THE PALM FIRST (radius 25, near the foot), the fingertip 40ms later drawing 120px; the palm trembles. */
      const palm = { x: b.ink.l + b.ink.w * 0.7, y: b.ink.t + b.ink.h * 0.88 }, a = A();
      const r = await gesture(env, k, BOARD, async () => {
        const fr = [];
        await T(env, 'touchStart', [pt(palm.x, palm.y, 1, 25)], 0); await sleep(40);
        await T(env, 'touchStart', [pt(palm.x, palm.y, 1, 25), pt(a.x, a.y, 2)], 40);
        for (let i = 1; i <= 30; i++) fr.push([pt(palm.x + (i % 3) * 0.6, palm.y, 1, 25), pt(a.x + 4 * i, a.y + 2 * i, 2)]);
        await stream(env, fr, 8, 40);
        await T(env, 'touchEnd', [], 300);
      });
      const st = r.stored[0] || [];
      const u = (x, y) => [(x - b.ink.l) / b.ink.w * 340, (y - b.ink.t) / b.ink.h * 340];
      const fu = u(a.x, a.y), pu = u(palm.x, palm.y);
      if (r.stored.length !== 1) fail('palm', at, `stored ${r.stored.length} stroke(s) — wanted the finger's one`);
      else {
        if (Math.hypot(st[0] - fu[0], st[1] - fu[1]) > 2) fail('palm', at, `the stroke starts at ${st.slice(0, 2)}, not at the finger's down ${fu.map(Math.round)}`);
        for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - pu[0], st[i + 1] - pu[1]) < 20) { fail('palm', at, 'the stroke has a point at the palm'); break; }
        if (st.length < 4) fail('palm', at, 'the finger\'s stroke is a dot, not its line');
      }
      unmoved('palm', at, r, b);
      say(`palm ${at} ${JSON.stringify(r.stored)}`);
      if (W === 390) await shot(env.page, `${at}-palm`);
      await fresh();
    }

    if (want('large')) {
      const a = A();
      const r = await gesture(env, k, BOARD, async () => {
        const fr = [];
        await T(env, 'touchStart', [pt(a.x, a.y, 1, 25)], 0);
        for (let i = 1; i <= 8; i++) fr.push([pt(a.x + 3 * i, a.y + 1.5 * i, 1, 25)]);
        await stream(env, fr, 8);
        await T(env, 'touchEnd', [], 80);
      });
      if (r.stored.length !== 1 || (r.stored[0] || []).length < 4) fail('large', at, `a large contact alone stored ${JSON.stringify(r.stored)} — size decides nothing yet, so it should draw`);
      unmoved('large', at, r, b);
      await fresh();
    }

    if (want('tap')) {
      const a = A();
      const r = await gesture(env, k, BOARD, async () => { await T(env, 'touchStart', [pt(a.x, a.y)], 0); await sleep(60); await T(env, 'touchEnd', [], 60); });
      if (r.stored.length !== 1 || r.stored[0].length > 6) fail('tap', at, `a tap stored ${JSON.stringify(r.stored)} — wanted one dot`);
      unmoved('tap', at, r, b);
      await fresh();
    }

    if (want('cancel')) {
      const a = A();
      let r = await gesture(env, k, BOARD, async () => {
        const fr = [];
        await T(env, 'touchStart', [pt(a.x, a.y)], 0);
        for (let i = 1; i <= 5; i++) fr.push([pt(a.x + 6 * i, a.y)]);
        await stream(env, fr, 8);
        await sleep(10);
        await T(env, 'touchCancel', [], 50);
      });
      if (r.stored.length) fail('cancel', at, `a cancel 50ms in stored ${JSON.stringify(r.stored)} — wanted nothing`);
      unmoved('cancel', at, r, b);
      await fresh();
      r = await gesture(env, k, BOARD, async () => {
        const fr = [], d = Math.min(200, b.ink.w * 0.6) / 50;
        await T(env, 'touchStart', [pt(b.ink.l + 20, a.y)], 0);
        for (let i = 1; i <= 50; i++) fr.push([pt(b.ink.l + 20 + d * i, a.y + (i % 2))]);
        await stream(env, fr, 10);
        await sleep(30);
        await T(env, 'touchCancel', [], 540);
      });
      if (r.stored.length !== 1) fail('cancel', at, `a cancel after 500ms and a real line stored ${JSON.stringify(r.stored)} — wanted the line kept`);
      unmoved('cancel', at, r, b);
      await fresh();
    }

    if (want('bar') && b.undo) {
      /* A PALM ON UNDO DURING A STROKE, lifted before the finger and then after it. The board holds one
         stroke first, so an Undo that got through would take it. */
      const prev = [[40, 40, 300, 40]];
      for (const order of ['palm first', 'finger first']) {
        await reset(env, k, prev);
        b = (await arm(env, b, board)) || b;
        const a = A(), u = b.undo;
        const r = await gesture(env, k, BOARD, async () => {
          const fr = [];
          await T(env, 'touchStart', [pt(a.x, a.y, 1)], 0); await sleep(30);
          for (let i = 1; i <= 6; i++) fr.push([pt(a.x + 5 * i, a.y, 1)]);
          await stream(env, fr, 8);
          await T(env, 'touchStart', [pt(a.x + 30, a.y, 1), pt(u.x, u.y, 2, 25)], 90); await sleep(80);
          const fr2 = [];
          for (let i = 1; i <= 6; i++) fr2.push([pt(a.x + 30 + 5 * i, a.y, 1), pt(u.x, u.y, 2, 25)]);
          await stream(env, fr2, 8, 170);
          /* CDP's `touchEnd` RELEASES THE POINTS IT LISTS (an empty list releases every one) -- measured by both reviews of 11 Oct, and the first build had the two orders § */
          await T(env, 'touchEnd', [order === 'palm first' ? pt(u.x, u.y, 2, 25) : pt(a.x + 60, a.y, 1)], 230); await sleep(60);
          const between = await env.page.evaluate(() => ({ go: !!PAD_GO, n: PAD_TOUCH.size }));
          if (order === 'palm first' && !between.go) fail('bar', at + ' ' + order, 'after the first lift the stroke had ended — the finger lifted first, not the palm');
          if (order === 'finger first' && (between.go || between.n !== 1)) fail('bar', at + ' ' + order, `after the first lift the stroke ${between.go ? 'was still being drawn' : 'had ended'} with ${between.n} contact(s) down — wanted the finger gone and the palm still down`);
          await T(env, 'touchEnd', [], 290);
        });
        if (JSON.stringify(r.stored[0]) !== JSON.stringify(prev[0]) || r.stored.length !== 2) fail('bar', at + ' ' + order, `a palm lifting off Undo during a stroke left ${JSON.stringify(r.stored).slice(0, 90)} — wanted the earlier stroke and the new one`);
        if (r.paths !== r.stored.length) fail('bar', at + ' ' + order, `${r.paths} drawn for ${r.stored.length} stored`);
        say(`bar ${at} ${order} ${JSON.stringify(r.stored).slice(0, 80)}`);
      }
      await fresh();
    }

    if (want('drift') && b.note) {
      /* THE PALM ON THE CARD UNDER THE BOARD, DOWN FIRST AND SO PRIMARY; a finger draws; the palm drifts 30px. */
      const palm = { x: Math.min(b.note.x, W - 40), y: Math.min(b.note.y, H - 30) }, a = A();
      const r = await gesture(env, k, BOARD, async () => {
        const fr = [];
        await T(env, 'touchStart', [pt(palm.x, palm.y, 1, 25)], 0); await sleep(300);
        await T(env, 'touchStart', [pt(palm.x, palm.y, 1, 25), pt(a.x, a.y, 2)], 300);
        for (let i = 1; i <= 15; i++) fr.push([pt(palm.x, palm.y, 1, 25), pt(a.x + 4 * i, a.y + 2 * i, 2)]);
        for (let i = 1; i <= 15; i++) fr.push([pt(palm.x + 2 * i, palm.y, 1, 25), pt(a.x + 60 + 4 * i, a.y + 30, 2)]);
        await stream(env, fr, 10, 300);
        await T(env, 'touchEnd', [pt(palm.x + 30, palm.y, 1, 25)], 620); await sleep(40);
        await T(env, 'touchEnd', [], 660);
      });
      if (r.stored.length !== 1) fail('drift', at, `the finger's stroke under a drifting palm stored ${r.stored.length} stroke(s) — wanted 1`);
      unmoved('drift', at, r, b);
      say(`drift ${at} ${JSON.stringify(r.stored).slice(0, 60)} axis ${r.axis}`);
      await fresh();
    }


    /* A LINE ACROSS THE BOARD AT A CHILD'S 300px/s (2.4px every 8ms), from 15% to 85% of its width at `f` of its height. */
    const nL = Math.round(b.ink.w * 0.7 / 2.4);
    const lineT = (id, f, from) => track(id, 8, from, from + 8 * nL, 8, u => [b.ink.l + b.ink.w * 0.15 + 2.4 * u / 8, b.ink.t + b.ink.h * f]);
    const lines = (r, want, sec, name) => {
      if (r.stored.length !== want || r.stored.some(st => st.length < 4)) fail(sec, at + ' ' + name, `stored ${JSON.stringify(r.stored).slice(0, 120)} — wanted ${want} line(s)`);
      unmoved(sec, at + ' ' + name, r, b);
      say(`${sec} ${at} ${name} ${JSON.stringify(r.stored).slice(0, 80)}`);
    };

    if (want('grip')) {
      /* A THUMB GRIPPING THE SCREEN'S EDGE (radius 11) DOWN FIRST; a finger lands on the board and the two pan 40px SIDEWAYS together -- two fingers, nothing. § */
      const th = [6, b.ink.t + b.ink.h * 0.6], a = A(), l3 = 1100, l4 = 1100 + 8 * nL + 300;
      const thumb = [{ t: 0, p: [th[0], th[1], 1, 11] }];
      for (let i = 1; i <= 10; i++) thumb.push({ t: 400 + 8 * i, p: [th[0] + 4 * i, th[1], 1, 11] });
      thumb.push({ t: l4 + 8 * nL + 200, p: [th[0] + 40, th[1], 1, 11] });
      const f2 = [{ t: 400, p: [a.x, a.y, 2, 8] }];
      for (let i = 1; i <= 10; i++) f2.push({ t: 400 + 8 * i, p: [a.x + 4 * i, a.y, 2, 8] });
      const r = await gesture(env, k, BOARD, () => play(env, plan(thumb, f2, lineT(3, 0.35, l3), lineT(4, 0.55, l4))));
      lines(r, 2, 'grip', 'thumb left down after a two-finger pan');
      if (W === 390) await shot(env.page, `${at}-grip`);
      await fresh();
    }

    if (want('settle')) {
      /* A THUMB AT THE EDGE ROLLS 9px UP IN THE FIRST 48ms OF A LINE, then is still; a second line 300ms after. */
      const th = [6, b.ink.t + b.ink.h * 0.6], l2 = 1000 + 8 * nL + 300;
      const thumb = [{ t: 0, p: [th[0], th[1], 1, 11] }];
      for (let i = 1; i <= 6; i++) thumb.push({ t: 1000 + 8 * i, p: [th[0], th[1] - 1.5 * i, 1, 11] });
      thumb.push({ t: l2 + 8 * nL + 200, p: [th[0], th[1] - 9, 1, 11] });
      let r = await gesture(env, k, BOARD, () => play(env, plan(thumb, lineT(2, 0.35, 1000), lineT(3, 0.55, l2))));
      lines(r, 2, 'settle', 'thumb-roll-9');
      await fresh();
      /* A PALM ON THE CARD BELOW THE BOARD (radius 28), STILL FOR A SECOND, SETTLES 12px SIDEWAYS IN THE FIRST 80ms. */
      if (b.note) {
        const pm = [Math.min(b.note.x, W - 40), Math.min(b.note.y, H - 30)];
        const palm = [{ t: 0, p: [pm[0], pm[1], 1, 28] }];
        for (let i = 1; i <= 10; i++) palm.push({ t: 1000 + 8 * i, p: [pm[0] + 1.2 * i, pm[1], 1, 28] });
        palm.push({ t: 1000 + 8 * nL + 200, p: [pm[0] + 12, pm[1], 1, 28] });
        r = await gesture(env, k, BOARD, () => play(env, plan(palm, lineT(2, 0.35, 1000))));
        lines(r, 1, 'settle', 'palm-card-settle-12');
        await fresh();
      }
      /* A PALM LANDS ON THE BOARD 120ms INTO A LINE, 110px BELOW THE FINGER, AND ITS CENTRE SETTLES 10px IN 60ms. */
      const ln = lineT(1, 0.35, 0), at120 = ln.find(f => f.t >= 120).p;
      const palm2 = [{ t: 122, p: [at120[0], at120[1] + 110, 2, 28] }];
      for (let i = 1; i <= 7; i++) palm2.push({ t: 122 + 8 * i, p: [at120[0] + 10 * i / 7, at120[1] + 110, 2, 28] });
      palm2.push({ t: 8 * nL - 4, p: [at120[0] + 10, at120[1] + 110, 2, 28] });
      r = await gesture(env, k, BOARD, () => play(env, plan(ln, palm2)));
      lines(r, 1, 'settle', 'palm-lands-settles');
      const st = r.stored[0] || [], py = (at120[1] + 110 - b.ink.t) / b.ink.h * 340;
      for (let i = 1; i < st.length; i += 2) if (Math.abs(st[i] - py) < 40) { fail('settle', at + ' palm-lands-settles', 'the stroke has a point where the palm was'); break; }
      await fresh();
    }

    if (want('phase')) {
      /* A TWO-FINGER PAN, 150px UP, WITH THE SECOND FINGER'S REPORTS 5ms OUT OF PHASE -- each finger's moves in their own dispatch, as a digitizer scanning them apart § */
      let drew = 0;
      for (let rep = 0; rep < 8; rep++) {
        const a = A(), c = B();
        const f1 = track(1, 8, 0, 240, 8, u => [a.x, a.y + 150 - 5 * u / 8]);
        const f2 = track(2, 8, 5, 245, 8, u => [c.x, c.y + 150 - 5 * u / 8]);
        const r = await gesture(env, k, BOARD, () => play(env, plan(f1, f2)));
        if (r.stored.length) { drew++; say(`phase ${at} rep ${rep}: stored ${JSON.stringify(r.stored).slice(0, 60)}`); }
        unmoved('phase', at + ' rep ' + rep, r, b);
        await fresh();
      }
      if (drew) fail('phase', at, `${drew} of 8 two-finger pans with the second finger out of phase stored a line — wanted none`);
      console.log(`  phase ${at} ${RATE}x: ${drew} of 8 out-of-phase pans drew`);
    }

    if (want('types')) {
      /* A STYLUS DRAWS 250px; HALF WAY A PALM (a touch, radius 25) LANDS ON THE BOARD -- the primary TOUCH, while the stylus
         is down -- and lifts; the stylus goes on. The stylus's line, and nothing of the palm. */
      const a = { x: b.ink.l + b.ink.w * 0.1, y: b.ink.t + b.ink.h * 0.25 }, palm = { x: b.ink.l + b.ink.w * 0.7, y: b.ink.t + b.ink.h * 0.85 };
      const step = Math.min(5, b.ink.w * 0.8 / 50);
      let r = await gesture(env, k, BOARD, async () => {
        await MO(env, 'mousePressed', a.x, a.y, 'pen', 1);
        for (let i = 1; i <= 50; i++) {
          if (i === 21) await T(env, 'touchStart', [pt(palm.x, palm.y, 7, 25)], since(env));
          if (i === 41) await T(env, 'touchEnd', [], since(env));
          await MO(env, 'mouseMoved', a.x + step * i, a.y + 2 * i, 'pen', 1); await sleep(8);
        }
        await MO(env, 'mouseReleased', a.x + step * 50, a.y + 100, 'pen', 0);
      });
      const st = r.stored[0] || [], pu = [(palm.x - b.ink.l) / b.ink.w * 340, (palm.y - b.ink.t) / b.ink.h * 340];
      if (r.stored.length !== 1 || st.length < 4) fail('types', at + ' stylus', `a stylus line with a palm landing stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted the stylus's one line`);
      for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - pu[0], st[i + 1] - pu[1]) < 20) { fail('types', at + ' stylus', 'the stroke has a point at the palm'); break; }
      unmoved('types', at + ' stylus', r, b);
      say(`types ${at} stylus ${JSON.stringify(r.stored).slice(0, 80)}`);
      await fresh();
      /* A FINGER DRAWS; HALF WAY A MOUSE CLICKS ON THE CARD BESIDE THE BOARD -- a touchscreen laptop. The finger's line. */
      r = await gesture(env, k, BOARD, async () => {
        const fr1 = [], fr2 = [];
        for (let i = 1; i <= 20; i++) fr1.push([pt(a.x + step * i, a.y + 2 * i, 3)]);
        for (let i = 21; i <= 50; i++) fr2.push([pt(a.x + step * i, a.y + 2 * i, 3)]);
        await T(env, 'touchStart', [pt(a.x, a.y, 3)], 0);
        await stream(env, fr1, 8);
        await MO(env, 'mousePressed', Math.max(4, b.ink.l - 6), b.ink.t + 20, 'mouse', 1); await sleep(30);
        await MO(env, 'mouseReleased', Math.max(4, b.ink.l - 6), b.ink.t + 20, 'mouse', 0);
        await stream(env, fr2, 8, since(env));
        await T(env, 'touchEnd', [], since(env) + 8);
      });
      if (r.stored.length !== 1 || (r.stored[0] || []).length < 4) fail('types', at + ' mouse', `a finger line with a mouse click beside the board stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted the finger's line`);
      unmoved('types', at + ' mouse', r, b);
      say(`types ${at} mouse ${JSON.stringify(r.stored).slice(0, 80)}`);
      await fresh();
    }

    if (want('steady')) {
      /* A SHAKY MOUSE (368): a 220px level line with +-3px of jitter each sample, then a lift. The stored line is steadier than the hand, ends at the lift, and a finger's same line is kept as it went */
      const a = { x: b.ink.l + b.ink.w * 0.12, y: b.ink.t + b.ink.h * 0.5 }, L = Math.min(220, b.ink.w * 0.76), N = 60;
      const jit = i => [Math.sin(i * 2.7) * 3, Math.cos(i * 1.9) * 3];
      const pathOf = i => [a.x + L * i / N + (i && i < N ? jit(i)[0] : 0), a.y + (i && i < N ? jit(i)[1] : 0)];
      const rough = (pts, sy) => { let s = 0; for (let i = 2; i < pts.length; i++) s += Math.abs(pts[i][1] - 2 * pts[i - 1][1] + pts[i - 2][1]) * sy; return s / Math.max(1, pts.length - 2); };
      const sy = b.ink.h / 340, toPad = q => [(q[0] - b.ink.l) / b.ink.w * 340, (q[1] - b.ink.t) / b.ink.h * 340];
      const raw = Array.from({ length: N + 1 }, (_, i) => toPad(pathOf(i)));
      /* the board stores its strokes thinned; a question's pad keeps every point, so the board is asked as a question's would be */
      await env.page.evaluate(() => { window.__thin = ansSimplify_; ansSimplify_ = st => st; });
      for (const kind of ['mouse', 'pen']) {
        const r = await gesture(env, k, BOARD, async () => {
          await MO(env, 'mousePressed', a.x, a.y, kind, 1);
          for (let i = 1; i <= N; i++) { const q = pathOf(i); await MO(env, 'mouseMoved', q[0], q[1], kind, 1); await sleep(8); }
          await MO(env, 'mouseReleased', a.x + L, a.y, kind, 0);
        });
        const st = r.stored[0] || [], pts = [];
        for (let i = 0; i + 1 < st.length; i += 2) pts.push([st[i], st[i + 1]]);
        const end = pts[pts.length - 1], lift = toPad([a.x + L, a.y]);
        const rr = rough(raw, sy), rs = rough(pts, sy);
        if (r.stored.length !== 1 || pts.length < 4) fail('steady', at + ' ' + kind, 'a shaky line stored ' + JSON.stringify(r.stored).slice(0, 100));
        else {
          if (!(rs < rr * 0.5)) fail('steady', at + ' ' + kind, `the stored line is ${rs.toFixed(2)}px rough a sample, the hand ${rr.toFixed(2)} -- wanted under half`);
          if (Math.hypot(end[0] - lift[0], end[1] - lift[1]) > 1.5) fail('steady', at + ' ' + kind, `the line ends at ${end} -- the pointer lifted at ${lift.map(Math.round)}: it lags`);
        }
        console.log(`  steady ${at} ${kind}: ${rs.toFixed(2)}px rough a sample where the hand was ${rr.toFixed(2)}, ${pts.length} points, ending at the lift`);
        await fresh();
      }
      /* THE FINGER, UNSTEADIED: its own jitter is in what is kept (357: a freehand line stays under the finger) */
      const r = await gesture(env, k, BOARD, async () => {
        await T(env, 'touchStart', [pt(a.x, a.y, 3)], 0);
        await stream(env, Array.from({ length: N }, (_, j) => { const q = pathOf(j + 1); return [pt(q[0], q[1], 3)]; }), 8);
        await T(env, 'touchEnd', [], since(env) + 8);
      });
      const st = r.stored[0] || [], pts = [];
      for (let i = 0; i + 1 < st.length; i += 2) pts.push([st[i], st[i + 1]]);
      if (pts.length < N * 0.6 || !(rough(pts, sy) > rough(raw, sy) * 0.5)) fail('steady', at + ' finger', `a finger's shaky line kept ${pts.length} points of ${N} -- the finger is steadied too`);
      await env.page.evaluate(() => { ansSimplify_ = window.__thin; });
      await fresh();
    }

    if (want('samples')) {
      /* A ZIGZAG OVER THE WHOLE BOARD, 1,200 samples at 8ms -- a 120Hz digitizer -- sent on the wall clock. */
      const Lx = b.ink.l + b.ink.w * 0.06, Rx = b.ink.l + b.ink.w * 0.94, Ty = b.ink.t + b.ink.h * 0.05, By = b.ink.t + b.ink.h * 0.95;
      const N = 1200, rows = 12, frames = [], sent = [[Lx, Ty]];
      for (let i = 1; i <= N; i++) {
        const u = i / N, row = Math.min(rows - 1, Math.floor(u * rows)), f = u * rows - row;
        const x = row % 2 ? Rx - (Rx - Lx) * f : Lx + (Rx - Lx) * f, y = Ty + (By - Ty) * (row + f) / rows;
        frames.push([pt(x, y)]); sent.push([x, y]);
      }
      /* THE SAMPLES THE PEN COULD KEEP: each in units, a repeat of the one before not counted. */
      let distinct = 0, px = null, py = null;
      sent.forEach(([x, y]) => {
        const ux = Math.round((Math.round(x * 100) / 100 - b.ink.l) / b.ink.w * 340), uy = Math.round((Math.round(y * 100) / 100 - b.ink.t) / b.ink.h * 340);
        if (ux !== px || uy !== py) distinct++;
        px = ux; py = uy;
      });
      await env.page.evaluate(() => { const M = window.__pm; M.reads = []; M.writes = []; M.dur = []; M.t0s = []; M.t1s = []; M.dw = []; M.fw = 0; M.on = true;
        /* EACH FRAME'S CALLBACKS BEGIN: § */
        window.__fr = []; window.__ft = []; window.__fw = [];
        const tick = t => { if (!M.on) return; window.__fr.push(t); window.__ft.push(performance.now()); window.__fw.push(M.fw); M.fw = 0; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      await traceStart(env);
      begin(env);
      await T(env, 'touchStart', [pt(Lx, Ty)], 0);
      await stream(env, frames, 8);
      await sleep(300);
      /* MID-STROKE, A FRAME AFTER THE LAST MOVE: the live chunks against `padPath_` of the points so far. */
      const mid = await env.page.evaluate(() => {
        const pad = document.querySelector('#s-tools #wgt-whiteboard .qpad');
        const k = Number(pad.getAttribute('data-aspect')) || 1;
        const ch = [...pad.querySelectorAll('.qpad-g [data-live]')].map(p => p.getAttribute('d'));
        const joined = ch.map((d, i) => (i ? d.replace(/^M[^LC]*/, '') : d)).join('');
        return { points: PAD_ST ? PAD_ST.length / 2 : 0, chunks: ch.length, same: joined === padPath_(PAD_ST, k) };
      });
      await T(env, 'touchEnd', [], 8 * N + 300);
      await sleep(800);
      const tr = await traceEnd(env);
      const m = await env.page.evaluate(k => {
        const M = window.__pm; M.on = false;
        const pad = document.querySelector('#s-tools #wgt-whiteboard .qpad');
        const ka = Number(pad.getAttribute('data-aspect')) || 1;
        let st = []; try { st = JSON.parse(ansValue_(k) || '[]'); } catch (e) {}
        const paths = [...pad.querySelectorAll('.qpad-g path')];
        const lat = M.t0s.map(t => { const w = M.dw.find(x => x >= t); return w === undefined ? null : w - t; }).filter(x => x !== null);
        const gaps = []; for (let i = 1; i < window.__fr.length; i++) gaps.push(window.__fr[i] - window.__fr[i - 1]);
        /* WAS THE PATH STILL DRAWN IN THE FIRST FRAME AFTER THE EVENT? A write inside the handler is painted by the
           next frame; a write in a frame's callbacks by that frame. The same frame either way is "no latency added". */
        const ft = window.__ft;
        let same = 0, n = 0;
        M.t1s.forEach((t1, i) => {
          const w = M.dw.find(x => x >= M.t0s[i]);
          if (w === undefined) return;
          n++;
          const first = ft.find(x => x >= t1);
          const inHandler = w <= t1;
          const wf = inHandler ? first : ft.filter(x => x <= w).pop();
          if (wf !== undefined && wf === first) same++;
        });
        return { reads: Math.max(0, ...M.reads), writes: M.writes.reduce((a, b) => a + b, 0), dur: M.dur, lat, gaps, moves: M.dur.length, same, n,
                 fw: Math.max(0, ...window.__fw), fwn: window.__fw.length,
                 stored: st, drawn: paths.length === 1 && paths[0].getAttribute('d') === padPath_(st[0] || [], ka) };
      }, k);
      const q = (a, p) => { if (!a.length) return null; const z = a.slice().sort((x, y) => x - y); return Math.round(z[Math.min(z.length - 1, Math.floor(p * z.length))] * 100) / 100; };
      if (mid.points < distinct * 0.95) fail('samples', at, `the zigzag kept ${mid.points} of ${distinct} distinct samples — under 95%`);
      if (!mid.same) fail('samples', at, `a frame after the last move the ${mid.chunks} live chunk(s) are not padPath_ of the points so far`);
      if (mid.points > PAD_CHUNK_EXPECT && mid.chunks < 2) fail('samples', at, `${mid.points} points drawn as ${mid.chunks} live path(s) — the frame rewrites the whole stroke`);
      if (m.reads > 1) fail('samples', at, `a pen event read the ink's box ${m.reads} times — the budget is one, shared by its samples`);
      if (m.writes) fail('samples', at, `${m.writes} path write(s) inside pen events — the path is written once a frame`);
      if (m.stored.length !== 1 || !m.drawn) fail('samples', at, 'after the lift the board does not draw padPath_ of the one stroke stored');
      const p95 = q(m.dur, 0.95);
      /* THE COUNTS THAT STAND FOR THE TIME (after review): a frame's cost does not grow with the stroke, nothing is painted
         a frame late, and no event forces a layout. */
      if (m.fw > FRAME_WRITES_MAX) fail('samples', at, `a frame wrote ${m.fw} live \`d\`s — the open chunk and one being frozen is ${FRAME_WRITES_MAX}: the frame redraws more of the stroke than it grew by`);
      if (!m.fwn) fail('samples', at, 'no frame was counted — the live writes were NOT checked');
      if (!m.n) fail('samples', at, 'no event was followed by a live path write — the first-frame paint was NOT checked');
      else if (m.same / m.n < PAINTED_MIN) fail('samples', at, `the path was painted in the first frame after its event for ${Math.round(m.same / m.n * 100)}% of ${m.n} events — under ${PAINTED_MIN * 100}%: a frame of latency was added`);
      if (!tr.n) fail('samples', at, 'the trace held no pointermove dispatch — forced layouts were NOT counted');
      else if (tr.forced) fail('samples', at, `${tr.forced} of ${tr.n} pen pointermoves forced a layout or a style recalculation in the browser's trace — a read after a write inside the event`);
      const line = `zigzag ${at} ${RATE}x: ${m.moves} pen events, ${mid.points} of ${distinct} distinct samples kept (${Math.round(mid.points / distinct * 100)}%), ${mid.chunks} chunk(s) live; `
        + `at most ${m.fw} live write(s) in a frame of ${m.fwn}; forced layouts ${tr.forced} of ${tr.n} traced; `
        + `handler p50 ${q(m.dur, 0.5)} / p95 ${p95} (reference ${PEN_P95_MS}, printed) / max ${q(m.dur, 1)}ms, thread time p50 ${q(tr.tdur, 0.5)} / p95 ${q(tr.tdur, 0.95)}ms; event -> next path write p50 ${q(m.lat, 0.5)} / p95 ${q(m.lat, 0.95)}ms, `
        + `painted in the first frame after the event ${m.n ? Math.round(m.same / m.n * 100) : '-'}% of ${m.n}; `
        + `frames over 33ms ${m.gaps.filter(g => g > 33).length} of ${m.gaps.length}; stored ${m.stored[0] ? m.stored[0].length / 2 : 0} points, ${JSON.stringify(m.stored).length} chars`;
      console.log('  ' + line);
      await fresh();
    }

    if (want('round')) {
      const cx = b.ink.x, cy = b.ink.y, R = Math.min(b.ink.w, b.ink.h) * 0.36;
      for (const [ms, name] of [[200, 'circle200'], [120, 'circle120']]) {
        const n = Math.round(ms / 8);
        await gesture(env, k, BOARD, () => circle(env, cx, cy, R, n, 8));
        const r = await roundness(env, k, BOARD, cx, cy, R);
        if (!r) fail('round', at + ' ' + name, 'nothing was stored');
        else {
          const cap = 1.5 * 2 * Math.PI * R / n;
          if (r.chord > cap) fail('round', at + ' ' + name, `the longest stored chord is ${r.chord}px — over ${cap.toFixed(1)}px, 1.5 x the circle's share of a sample (114px before 338)`);
          console.log(`  ${name} ${at} board ${RATE}x: ${r.points} points stored, longest chord ${r.chord}px, ${r.worst}px off round between its ends${r.curves ? ', drawn with curves' : ''}`);
        }
        if (W === 390 && name === 'circle200') await shot(env.page, `${at}-board-circle200`);
        await fresh();
      }
      /* STARVED: nine events a turn, far enough apart that none is folded -- an iPad without coalesced events. */
      await gesture(env, k, BOARD, () => circle(env, cx, cy, R, 9, 30));
      const r = await roundness(env, k, BOARD, cx, cy, R), poly = R * (1 - Math.cos(Math.PI / 9));
      if (!r) fail('round', at + ' starved', 'nothing was stored');
      else {
        if (!(r.worst <= 1.5)) fail('round', at + ' starved', `a circle of ${r.points} points is drawn ${r.worst}px off round between its ends — wanted 1.5px (its polygon is ${poly.toFixed(1)}px off)`);
        console.log(`  starved circle ${at} board: ${r.points} points, drawn ${r.worst}px off round (the polygon ${poly.toFixed(1)}px)${r.curves ? ', with curves' : ''}`);
      }
      if (W === 390) await shot(env.page, `${at}-board-starved`);
      await fresh();
    }

    if (want('lost')) {
      /* A CONTACT WHOSE LIFT NEVER CAME, then a real swipe on the card above the board: the column moves. */
      const stale = await env.page.evaluate(k => {
        if (typeof PAD_TOUCH === 'undefined') return false;
        PAD_TOUCH.set(99, { id: 99, type: 'touch', t0: 0, p0: [0, 0], p: [0, 0], pm: [0, 0], tm: 0, far: 0, onInk: true, ink: null, k: k,
                            size: 0, big: 0, role: 'rest', pts: null, m0: null, h0: null, late: false, busy: '' });
        return padBusy_();
      }, k);
      if (stale === false) say(`lost ${at}: no PAD_TOUCH here (the pen before 338) — the stale contact cannot be planted`);
      else if (!stale) fail('lost', at, 'setup: a planted contact on the armed ink did not make padBusy_ true — NOT checked');
      else {
        const p0 = b.page, x = b.card.x, y = Math.max(b.card.t + 12, 40);
        begin(env);
        await T(env, 'touchStart', [pt(x, y)], 0);
        const fr = []; for (let i = 1; i <= 25; i++) fr.push([pt(x, y + 10 * i)]);
        await stream(env, fr, 8);
        await T(env, 'touchEnd', [], 210);
        await sleep(1200);
        const r = await look(env, k, BOARD);
        if (r.page.tools === p0 && r.at === 'tools') fail('lost', at, 'after a lift that never came, a real swipe down the card did not turn the page — the column is stuck');
        say(`lost ${at} page ${p0} -> ${r.page.tools}`);
        b = await board(env);
        await reset(env, k);
        b = (await arm(env, b, board)) || b;
      }
    }
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    if (env.errs.length) fail('ERRORS', at, env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* ==================== THE QUESTION CARD: Q7 AT 320, 390 AND 820 ==================== */
  for (const [W, H] of [[320, 568], [390, 844], [820, 1180]]) {
    const at = `${W}x${H}`;
    if (!['pinchoff', 'hold', 'inv', 'samples', 'round'].some(want)) break;
    if (W === 820 && !want('inv')) continue;
    const env = await boot(browser, W, H, port);
    await env.page.waitForFunction(r => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => x.row && x.row.row_id === r), Q7, { timeout: 90000 }).catch(() => {});
    const k = await card(env, Q7);
    let c = k ? await cardBox(env) : null;
    if (!c) { fail('REACH', at, 'June 2024 1F Q7\'s drawing face is not on the screen'); await env.ctx.close(); continue; }
    c = await arm(env, c, cardBox);
    if (!c) { fail('REACH', at, 'Q7\'s pad could not be armed with a real tap on its lock'); await env.ctx.close(); continue; }
    reached++;
    await reset(env, k);
    c = (await cardBox(env)) || c;

    if (want('inv')) {
      const inv = await env.page.evaluate(k => {
        const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === k);
        const ink = pad.querySelector('.qpad-ink');
        const zooms = [];
        for (let el = ink; el && el !== document.documentElement; el = el.parentElement) {
          const z = getComputedStyle(el).zoom; if (z && z !== '1' && z !== 'normal') zooms.push(String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) + ':' + z);
        }
        const a = ink.getBoundingClientRect(), r = ink.closest('.qpad-art').querySelector('svg').getBoundingClientRect();
        return { zooms, d: Math.max(Math.abs(a.left - r.left), Math.abs(a.top - r.top), Math.abs(a.width - r.width), Math.abs(a.height - r.height)),
                 left: a.left, right: innerWidth - a.right, bottom: innerHeight - a.bottom, w: a.width, h: a.height };
      }, k);
      if (inv.zooms.length) fail('inv', at + ' Q7', 'a zoomed ancestor of the armed ink: ' + inv.zooms.join(', '));
      if (inv.d > 0.5) fail('inv', at + ' Q7', `the ink box is ${inv.d.toFixed(1)}px off the picture's`);
      if (inv.left < 16 || inv.right < 16 || inv.bottom < 16) fail('inv', at + ' Q7', `the ink is ${Math.round(inv.left)} / ${Math.round(inv.right)} / ${Math.round(inv.bottom)}px from the left, right and bottom edges — under 16`);
      say(`inv ${at} Q7 ${JSON.stringify(inv)}`);
    }

    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    if (want('samples') && W !== 820) {
      /* 120 SAMPLES AT 8ms ACROSS Q7's GRID: a question keeps every point, so the store says how many arrived. */
      const Lx = c.ink.l + c.ink.w * 0.1, Rx = c.ink.l + c.ink.w * 0.9, fr = [];
      for (let i = 1; i <= 120; i++) fr.push([pt(Lx + (Rx - Lx) * i / 120, c.ink.t + c.ink.h * (0.3 + 0.4 * Math.sin(i / 10)))]);
      const r = await gesture(env, k, CARD, async () => {
        await T(env, 'touchStart', [pt(Lx, c.ink.t + c.ink.h * 0.3)], 0);
        await stream(env, fr, 8);
        await T(env, 'touchEnd', [], 970);
      });
      const n = r.stored[0] ? r.stored[0].length / 2 : 0;
      if (n < 114) fail('samples', at + ' Q7', `a 120-sample drag kept ${n} points — wanted 114 or more (about 40 were kept before)`);
      console.log(`  Q7 ${at} ${RATE}x: a 120-sample drag kept ${n} points`);
      await reset(env, k);
    }
    if (want('round') && W === 390) {
      const cx = c.ink.x, cy = c.ink.y, R = Math.min(c.ink.w, c.ink.h) * 0.36;
      await gesture(env, k, CARD, () => circle(env, cx, cy, R, 25, 8));
      let r = await roundness(env, k, CARD, cx, cy, R);
      if (!r) fail('round', at + ' Q7', 'nothing was stored');
      else {
        if (!(r.worst <= 1.5)) fail('round', at + ' Q7', `a 200ms circle is drawn ${r.worst}px off round — wanted 1.5px`);
        console.log(`  circle200 ${at} Q7 ${RATE}x: ${r.points} points, longest chord ${r.chord}px, drawn ${r.worst}px off round${r.curves ? ', with curves' : ''}`);
      }
      await shot(env.page, `${at}-q7-circle200`);
      await reset(env, k);
      await gesture(env, k, CARD, () => circle(env, cx, cy, R, 9, 30));
      r = await roundness(env, k, CARD, cx, cy, R);
      const poly = R * (1 - Math.cos(Math.PI / 9));
      if (!r) fail('round', at + ' Q7 starved', 'nothing was stored');
      else {
        if (!(r.worst <= 1.5)) fail('round', at + ' Q7 starved', `a circle of ${r.points} points is drawn ${r.worst}px off round between its ends — wanted 1.5px (its polygon is ${poly.toFixed(1)}px off)`);
        console.log(`  starved circle ${at} Q7: ${r.points} points, drawn ${r.worst}px off round (the polygon ${poly.toFixed(1)}px)${r.curves ? ', with curves' : ''}`);
      }
      await shot(env.page, `${at}-q7-starved`);
      await reset(env, k);
      /* REPORTED, NOT JUDGED: the same fast circle with `getCoalescedEvents` gone, as on iPadOS before 18.2. */
      await env.page.evaluate(() => { window.__gce = PointerEvent.prototype.getCoalescedEvents; delete PointerEvent.prototype.getCoalescedEvents; });
      await gesture(env, k, CARD, () => circle(env, cx, cy, R, 25, 8));
      r = await roundness(env, k, CARD, cx, cy, R);
      await env.page.evaluate(() => { PointerEvent.prototype.getCoalescedEvents = window.__gce; });
      if (r) console.log(`  circle200 ${at} Q7 ${RATE}x, no coalesced events: ${r.points} points, longest chord ${r.chord}px, drawn ${r.worst}px off round${r.curves ? ', with curves' : ''}`);
      await reset(env, k);
    }
    if (want('pinchoff') && W === 320) {
      /* ONE FINGER ON THE 180px FIGURE, THE OTHER JUST OFF IT, PINCHING OUT. */
      const a = { x: c.ink.l + c.ink.w * 0.8, y: c.ink.y }, o = { x: Math.min(W - 6, c.ink.r + 14), y: c.ink.y + 6 };
      const r = await gesture(env, k, CARD, async () => {
        const fr = [];
        await T(env, 'touchStart', [pt(o.x, o.y, 1)], 0); await sleep(40);
        await T(env, 'touchStart', [pt(o.x, o.y, 1), pt(a.x, a.y, 2)], 40);
        for (let i = 1; i <= 20; i++) fr.push([pt(Math.min(W - 2, o.x + 0.3 * i), o.y + 2 * i, 1), pt(a.x - 3 * i, a.y - 2 * i, 2)]);
        await stream(env, fr, 8, 40);
        await T(env, 'touchEnd', [], 220);
      });
      nothing('pinchoff', at, r, { at: c.at, page: c.page });
      say(`pinchoff ${at} ${JSON.stringify(r.stored)}`);
      await shot(env.page, `${at}-pinchoff`);
      await reset(env, k);
    }
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    if (want('hold') && W === 390) {
      /* A FINGER HELD 1.1s ON THE ARMED INK, JUST UNDER THE QUESTION'S WORDS. */
      await env.page.evaluate(() => {
        window.__ev = [];
        ['contextmenu', 'selectstart'].forEach(t => document.addEventListener(t, e => window.__ev.push(t + (e.defaultPrevented ? ' (prevented)' : '')), true));
        try { getSelection().removeAllRanges(); } catch (e) {}
      });
      const x = c.ink.x, y = c.ink.t + 6;
      begin(env);
      await T(env, 'touchStart', [pt(x, y)], 0); await sleep(1100); await T(env, 'touchEnd', [], 1100);
      await sleep(500);
      const h = await env.page.evaluate(() => ({ ev: window.__ev, sel: String(getSelection()) }));
      if (h.sel) fail('hold', at, `a held finger selected "${h.sel.slice(0, 40)}"`);
      if (h.ev.some(e => e === 'selectstart')) fail('hold', at, 'a held finger started a selection');
      if (h.ev.some(e => e === 'contextmenu')) fail('hold', at, 'a held finger opened a context menu');
      await shot(env.page, `${at}-hold`);
      await reset(env, k);
      say(`hold ${at} ${JSON.stringify(h)}`);
    }
    if (env.errs.length) fail('ERRORS', at, env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* A PALM LANDING AFTER AN AIMING FINGER: § */
  if (want('palmafter')) for (const [W, H] of [[390, 844], [820, 1180]]) for (const surf of ['board', 'q7']) {
    const at = `${W}x${H} ${surf}`;
    const env = await boot(browser, W, H, port);
    let get, sel, k, b;
    if (surf === 'board') {
      get = board; sel = BOARD;
      b = await board(env);
      if (b) { k = b.k; await reset(env, k); b = await arm(env, b, board); }
    } else {
      get = cardBox; sel = CARD;
      await env.page.waitForFunction(r => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => x.row && x.row.row_id === r), Q7, { timeout: 90000 }).catch(() => {});
      k = await card(env, Q7);
      b = k ? await cardBox(env) : null;
      if (b) b = await arm(env, b, cardBox);
      if (b) { await reset(env, k); b = (await cardBox(env)) || b; }
    }
    if (!b) { fail('REACH', at + ' palmafter', 'the pad is not on the screen armed — a palm after an aiming finger was NOT checked'); await env.ctx.close(); continue; }
    reached++;
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    const near = (st, q, d) => { for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - q[0], st[i + 1] - q[1]) < d) return true; return false; };
    const cases = [];
    for (const [gap, S, wait] of [[300, 9, 400], [300, 12, 400], [300, 12, 150], [300, 16, 400], [1500, 12, 400]]) cases.push({ how: 'aim', gap, S, wait });
    cases.push({ how: 'aim', gap: 300, S: 12, wait: 400, card: true }, { how: 'brush', gap: 300, S: 12, wait: 400 }, { how: 'tap', gap: 300, S: 12, wait: 400 }, { how: 'retap', gap: 300, S: 12, wait: 400 });
    for (const { how, gap, S, wait, card: off } of cases) {
      const ink = b.ink;
      const pm = off ? [ink.l + ink.w * 0.7, Math.min(ink.b + 40, H - 30)] : [ink.l + ink.w * 0.8, ink.t + ink.h * 0.85];
      const f0 = [ink.l + ink.w * 0.2, ink.t + ink.h * 0.35];
      const go = gap + wait, end = go + 400;
      const q = t => (t % 20 ? 0.3 : -0.3);
      const fin = how === 'tap' || how === 'retap' ? track(2, 8, 0, gap + 250, 10, u => [f0[0] + q(u), f0[1]])
        : track(2, 8, 0, end, 10, u => u < go ? [f0[0] + q(u), f0[1]] : [f0[0] + 0.5 * ink.w * (u - go) / 400, f0[1] + 20 * (u - go) / 400]);
      const fin3 = how === 'retap' ? track(3, 8, gap + 400, gap + 1000, 10, u => u < 200 ? [f0[0] + q(u), f0[1]] : [f0[0] + 0.5 * ink.w * (u - 200) / 400, f0[1] + 20 * (u - 200) / 400]) : [];
      const palm = [];
      for (let t = gap; t <= (how === 'brush' ? gap + 250 : how === 'retap' ? gap + 1100 : end + 100); t += 10) palm.push({ t, p: [pm[0] - S * Math.min(1, (t - gap) / 80) - (how === 'retap' ? 12 * Math.max(0, Math.min(1, (t - gap - 410) / 100)) : 0) + q(t), pm[1], 1, 25] });
      await shownWatch(env);
      const r = await gesture(env, k, sel, () => play(env, plan(palm, fin, fin3)));
      const sh = await shownRead(env);
      const toU = p => [(p[0] - ink.l) / ink.w * 340, (p[1] - ink.t) / ink.h * 340];
      const pu = toU(pm), fu = toU(f0);
      const where = `${at} ${how} palm ${gap}ms after${off ? ', on the card' : ''}, settling ${S}px${how === 'aim' ? `, the finger drawing ${wait}ms after it landed` : how === 'retap' ? ', then a finger landing and the palm drifting 12px more' : ''}`;
      if (r.stored.some(st => near(st, pu, 25))) fail('palmafter', where, `a mark at the PALM: ${JSON.stringify(r.stored).slice(0, 100)} — the finger was the one drawing`);
      const line = st => st.length >= 4 && Math.hypot(st[0] - fu[0], st[1] - fu[1]) < 6;
      if (how === 'tap') {
        if (r.stored.length) fail('palmafter', where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing (the tap's dot is section 4's cost, and the palm never marks)`);
        if (sh.frames < 3) fail('palmafter', where, `only ${sh.frames} frame(s) were watched after the palm landed — what was shown was NOT checked`);
        else if (sh.shown) fail('palmafter', where, `${sh.what} on the picture in ${sh.shown} of ${sh.frames} frames after the palm landed — for a mark that cannot be kept`);
      } else {
        const cost = how === 'aim' && S > 15 && !r.stored.length;
        if (!cost && (r.stored.length !== 1 || !line(r.stored[0]))) fail('palmafter', where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted the finger's line`);
        if (!cost && !sh.shown) fail('palmafter', where, `the finger's line was not shown in any of ${sh.frames} frames as it was drawn`);
        if (cost) say(`palmafter ${where} (section 4's cost: a settle over 15px read as moving with the finger) nothing stored`);
      }
      if (r.live || r.busy || r.touch) fail('palmafter', where, 'the pen did not let go after both lifted');
      say(`palmafter ${where} ${JSON.stringify(r.stored).slice(0, 80)} shown ${sh.shown}/${sh.frames}`);
      if (r.stored.some(st => near(st, pu, 25))) await shot(env.page, `${W}x${H}-${surf}-palmafter-${how}-${gap}-${S}`);
      await reset(env, k);
      b = (await get(env)) || b;
    }
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    if (env.errs.length) fail('ERRORS', at + ' palmafter', env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* ==================== A PIN HELD ON THE CENTRE, AND A PALM ON THE PICTURE: November 2019 1H Q4 ==================== */
  /* AT 390 AND 820 (second review: the pin's roll and the palm's drift stored a mark at both). */
  if (want('pin') || want('palmtool')) for (const [W, H] of [[390, 844], [820, 1180]]) {
    const at = `${W}x${H}`;
    const env = await boot(browser, W, H, port);
    await env.page.waitForFunction(r => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => x.row && x.row.row_id === r), COMPASS_Q, { timeout: 90000 }).catch(() => {});
    const k = await card(env, COMPASS_Q);
    const toolBox = () => env.page.evaluate(() => {
      const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === window.__k);
      const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      return pad ? { compass: box(pad.querySelector('.qpad-tool[data-tool="compass"]')), ruler: box(pad.querySelector('.qpad-tool[data-tool="ruler"]')),
                     pen: box(pad.querySelector('.qpad-tool[data-tool="pen"]')), tool: PAD_TOOL.get(window.__k) || 'pen' } : null;
    });
    let c = k ? await cardBox(env) : null;
    if (c) c = await arm(env, c, cardBox);
    const tb = c ? await toolBox() : null;
    if (!c || !tb || !tb.compass || !tb.ruler || !tb.pen) fail('REACH', at + ' pin', 'November 2019 1H Q4\'s pad, armed, with a Pen, a Compass and a Ruler tile, is not on the screen — the held pin and the palm were NOT checked');
    else {
      reached++;
      await reset(env, k);
      await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
      /* THE TOOL CHOSEN WITH A REAL TAP ON ITS TILE; false if the tap did not choose it. */
      const choose = async (sec, name) => {
        begin(env);
        const tile = (await toolBox())[name];
        await T(env, 'touchStart', [pt(tile.x, tile.y, 9)], 0); await sleep(40); await T(env, 'touchEnd', [], 40);
        await sleep(600);
        if ((await toolBox()).tool !== name) { fail(sec, at + ' ' + name, `a tap on the ${name} tile did not choose it — NOT checked`); return false; }
        c = (await cardBox(env)) || c;
        return true;
      };
      /* A MARK THAT CANNOT BE KEPT, SHOWN: frames counted from the second contact's landing (`shownWatch`). */
      const unseen = (sec, where, sh) => {
        if (sh.frames < 3) fail(sec, where, `only ${sh.frames} frame(s) were watched after the second contact landed — what was shown was NOT checked`);
        else if (sh.shown) fail(sec, where, `${sh.what} on the picture in ${sh.shown} of ${sh.frames} frames after the second contact landed — for a mark that cannot be kept`);
      };
      if (want('pin')) for (const name of ['compass', 'ruler']) for (const drift of [0, 6, 12, 16, 24]) {
        if (!(await choose('pin', name))) continue;
        /* FINGER 1 ON THE CENTRE, HELD, TREMBLING UNDER A PIXEL; FINGER 2 LANDS 300ms LATER AT THE RADIUS AND SWINGS 270 DEGREES ROUND IT IN 60 MOVES 10ms APART § */
        const cx = c.ink.l + c.ink.w * 0.45, cy = c.ink.t + c.ink.h * 0.5, R0 = 0.28 * Math.min(c.ink.w, c.ink.h);
        const pin = [];
        for (let t = 0; t <= 920; t += 10) pin.push({ t, p: [cx + (t < 300 || !drift ? (t % 20 ? 0.4 : -0.4) : drift * Math.min(1, (t - 300) / 300)), cy, 1, 8] });
        const f2 = name === 'compass' ? track(2, 8, 300, 900, 10, u => { const g = 1.5 * Math.PI * u / 600; return [cx + R0 * Math.cos(g), cy + R0 * Math.sin(g)]; })
          : track(2, 8, 300, 500, 10, u => [cx + R0 + 2 * u / 10, cy]);
        await shownWatch(env);
        const r = await gesture(env, k, CARD, () => play(env, plan(pin, f2)));
        const sh = await shownRead(env);
        const spot = name === 'ruler' ? 'end' : 'centre';
        const what = drift ? `a pin held on the ${name}'s ${spot} that rolled ${drift}px while a second finger moved` : `a pin held on the ${name}'s ${spot} and a second finger moving`;
        if (r.stored.length) fail('pin', at + ' ' + name, `${what} stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing`);
        if (r.live || r.busy || r.touch) fail('pin', at + ' ' + name, 'the pen did not let go after both fingers lifted');
        unseen('pin', `${at} ${name} drift ${drift}`, sh);
        say(`pin ${at} ${name} drift ${drift} ${JSON.stringify(r.stored).slice(0, 80)} shown ${sh.shown}/${sh.frames}`);
        if (name === 'compass' && !drift) await shot(env.page, `${at}-pin-compass`);
        await reset(env, k);
      }
      /* AND A PIN THAT SETTLED AS IT WAS PUT DOWN (fourth review): § */
      if (want('pin')) for (const name of ['ruler', 'compass']) for (const [pre, more] of [[9, 3], [8, 5], [0, 12]]) {
        if (!(await choose('pin', name))) continue;
        const cx = c.ink.l + c.ink.w * 0.45, cy = c.ink.t + c.ink.h * 0.5, R0 = 0.28 * Math.min(c.ink.w, c.ink.h);
        const pin = [];
        for (let t = 0; t <= 920; t += 10) pin.push({ t, p: [cx + pre * Math.min(1, t / 80) + more * Math.max(0, Math.min(1, (t - 300) / 200)) + (t % 20 ? 0.3 : -0.3), cy, 1, 8] });
        const f2 = name === 'compass' ? track(2, 8, 300, 900, 10, u => { const g = 1.5 * Math.PI * mj(u / 600); return [cx + R0 * Math.cos(g), cy + R0 * Math.sin(g)]; })
          : track(2, 8, 300, 900, 10, u => [cx + R0 + 60 * mj(u / 600), cy]);
        await shownWatch(env);
        const r = await gesture(env, k, CARD, () => play(env, plan(pin, f2)));
        const sh = await shownRead(env);
        const what = `a pin on the ${name}'s ${name === 'ruler' ? 'end' : 'centre'} that settled ${pre}px as it was put down, then rolled ${more}px while a slow second finger moved`;
        if (r.stored.length) fail('pin', at + ' ' + name, `${what} stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing`);
        if (r.live || r.busy || r.touch) fail('pin', at + ' ' + name, 'the pen did not let go after both fingers lifted');
        unseen('pin', `${at} ${name} settled ${pre} rolled ${more}`, sh);
        say(`pin ${at} ${name} settled ${pre} rolled ${more} ${JSON.stringify(r.stored).slice(0, 80)} shown ${sh.shown}/${sh.frames}`);
        await reset(env, k);
      }
      /* A PALM (radius 25) RESTING ON THE PICTURE AT (0.85, 0.85), trembling under a pixel for `gap` ms; then a fingertip lands at (0.25, 0.4) and draws a 120px ruler § */
      const cases = [];
      if (want('palmtool')) {
        for (const name of ['pen', 'ruler', 'compass']) for (const gap of [400, 120]) cases.push({ name, gap, drift: 6, how: 'first' });
        for (const name of ['ruler', 'compass']) for (const drift of [12, 16, 24]) cases.push({ name, gap: 400, drift, how: 'spread' });
        for (const name of ['ruler', 'compass']) cases.push({ name, gap: 400, drift: 12, how: 'after' });
        cases.push({ name: 'ruler', gap: 300, drift: 12, how: 'aim', along: 40 });
        for (const name of ['ruler', 'compass']) {
          cases.push({ name, gap: 120, drift: 12, how: 'aim', along: 0 }, { name, gap: 120, drift: 12, how: 'brush' }, { name, gap: 120, drift: 12, how: 'tap' });
          for (const more of [2, 3, 4]) cases.push({ name, gap: 400, drift: 9, more, how: 'headstart' });
          cases.push({ name, gap: 400, drift: 9, more: 22, how: 'pause' });
        }
        cases.push({ name: 'pen', gap: 400, drift: 15, how: 'alone', then: true }, { name: 'pen', gap: 400, drift: 15, how: 'alone' }, { name: 'ruler', gap: 100, drift: 15, how: 'alone' });
      }
      for (const { name, gap, drift, how, along, more, then } of cases) {
        if (!(await choose('palmtool', name))) continue;
        const pm = [c.ink.l + c.ink.w * 0.85, c.ink.t + c.ink.h * 0.85], f0 = [c.ink.l + c.ink.w * 0.25, c.ink.t + c.ink.h * 0.4];
        const line = name === 'compass' ? 400 : 300, palm = [];
        let fin, fin2 = [];
        const q = t => (t % 20 ? 0.4 : -0.4);
        if (how === 'brush' || how === 'tap' || (how === 'aim' && !along)) {
          /* THE FINGER FIRST, held on its point; the palm at `gap` settling `drift` px in 80ms, then trembling; the finger draws its 120px over 400ms § */
          const go = gap + 400, end = go + 400;
          fin = how === 'tap' ? track(2, 8, 0, gap + 250, 10, u => [f0[0] + q(u), f0[1]])
            : track(2, 8, 0, end, 10, u => u < go ? [f0[0] + q(u), f0[1]]
              : name === 'compass' ? (u - go < 160 ? [f0[0] + 60 * (u - go) / 160, f0[1]] : [f0[0] + 60 * Math.cos(Math.PI * (u - go - 160) / 240), f0[1] + 60 * Math.sin(Math.PI * (u - go - 160) / 240)])
              : [f0[0] + 120 * (u - go) / 400, f0[1] + 20 * (u - go) / 400]);
          for (let t = gap; t <= (how === 'brush' ? gap + 250 : end + 100); t += 10) palm.push({ t, p: [pm[0] - drift * Math.min(1, (t - gap) / 80) + q(t), pm[1], 1, 25] });
        } else if (how === 'pause') {
          /* THE PALM FIRST, settling `drift` px in 80ms and trembling; the finger at `gap` goes 12px in 40ms and pauses until +440, the palm drifting `more` px from +250 § */
          for (let t = 0; t <= 80; t += 10) palm.push({ t, p: [pm[0] + drift * t / 80, pm[1], 1, 25] });
          for (let t = 90; t <= gap + 1000; t += 10) palm.push({ t, p: [pm[0] + drift + more * Math.max(0, Math.min(1, (t - gap - 250) / 150)) + q(t), pm[1], 1, 25] });
          fin = track(2, 8, gap, gap + 840, 10, u => u <= 40 ? [f0[0] + 12 * u / 40, f0[1]] : u <= 440 ? [f0[0] + 12 + q(u), f0[1]]
            : name === 'compass' ? (u <= 560 ? [f0[0] + 12 + 48 * (u - 440) / 120, f0[1]] : [f0[0] + 60 * Math.cos(Math.PI * (u - 560) / 280), f0[1] + 60 * Math.sin(Math.PI * (u - 560) / 280)])
            : [f0[0] + 12 + 108 * (u - 440) / 400, f0[1] + 20 * (u - 440) / 400]);
        } else if (how === 'headstart') {
          /* THE PALM FIRST, settling `drift` px in its first 80ms and trembling; the finger at `gap`, starting slowly: § */
          for (let t = 0; t <= 80; t += 10) palm.push({ t, p: [pm[0] + drift * t / 80, pm[1], 1, 25] });
          for (let t = 90; t < gap; t += 10) palm.push({ t, p: [pm[0] + drift + q(t), pm[1], 1, 25] });
          for (let t = gap; t <= gap + 700; t += 10) palm.push({ t, p: [pm[0] + drift + more * Math.min(1, (t - gap) / 200) + q(t), pm[1], 1, 25] });
          fin = name === 'compass'
            ? track(2, 8, gap, gap + 600, 10, u => { const tau = u / 600; if (tau < 0.8) return [f0[0] + 60 * mj(tau / 0.8), f0[1]]; const g = Math.PI * (tau - 0.8) / 0.2; return [f0[0] + 60 * Math.cos(g), f0[1] + 60 * Math.sin(g)]; })
            : track(2, 8, gap, gap + 600, 10, u => [f0[0] + 120 * mj(u / 600), f0[1] + 20 * mj(u / 600)]);
        } else if (how === 'alone') {
          /* THE PALM FIRST, trembling; at `gap` a finger 0.25 of the picture below the line's start ticks 20px in 100ms and lifts; the palm slides `drift` px from +250 to § */
          const ft = [f0[0], f0[1] + 0.25 * c.ink.h], end = then ? gap + 1100 : gap + 600;
          for (let t = 0; t <= end; t += 10) palm.push({ t, p: [pm[0] - drift * Math.max(0, Math.min(1, (t - gap - 250) / 150)) + q(t), pm[1], 1, 25] });
          fin = track(2, 8, gap, gap + 100, 10, u => [ft[0] + 0.2 * u, ft[1]]);
          if (then) fin2 = track(3, 8, gap + 600, gap + 1000, 10, u => [f0[0] + 0.3 * u, f0[1] + 0.05 * u]);
        } else if (how === 'aim') {
          /* THE FINGER FIRST, held on its point; the palm at `gap`, settling, still; then the finger draws its 120px over 600ms while the palm slides 40px along. § */
          const go = gap + 600, slow = 600;
          fin = track(2, 8, 0, go + slow, 10, u => u < go ? [f0[0] + (u % 20 ? 0.4 : -0.4), f0[1]] : [f0[0] + 120 * (u - go) / slow, f0[1] + 30 * (u - go) / slow]);
          for (let t = gap; t <= gap + 80; t += 10) palm.push({ t, p: [pm[0] - drift * (t - gap) / 80, pm[1], 1, 25] });
          for (let t = go; t <= go + slow; t += 10) palm.push({ t, p: [pm[0] - drift - 40 * (t - go) / slow, pm[1], 1, 25] });
          palm.push({ t: go + slow + 100, p: [pm[0] - drift - 40, pm[1], 1, 25] });
        } else {
          for (let t = 0; t <= gap; t += 10) palm.push({ t, p: [pm[0] + (t % 20 ? 0.4 : -0.4), pm[1], 1, 25] });
          if (how === 'first') for (let i = 1; i <= 12; i++) palm.push({ t: gap + 10 * i, p: [pm[0] + drift * i / 12, pm[1], 1, 25] });
          if (how === 'spread') for (let t = gap + 10; t <= gap + line; t += 10) palm.push({ t, p: [pm[0] + drift * (t - gap) / line, pm[1], 1, 25] });
          if (how === 'after') for (let t = gap + line + 100; t <= gap + line + 700; t += 10) palm.push({ t, p: [pm[0] + drift * (t - gap - line - 100) / 600, pm[1], 1, 25] });
          const end = how === 'after' ? gap + line + 800 : gap + 500;
          palm.push({ t: end, p: [pm[0] + (how === 'first' || how === 'spread' || how === 'after' ? drift : 0), pm[1], 1, 25] });
          fin = name === 'compass'
            ? track(2, 8, gap, gap + 400, 10, u => { const g = Math.PI * u / 400; return u < 100 ? [f0[0] + 0.6 * u, f0[1]] : [f0[0] + 60 * Math.cos(g - Math.PI / 4), f0[1] + 60 * Math.sin(g - Math.PI / 4)]; })
            : track(2, 8, gap, gap + 300, 10, u => [f0[0] + 0.4 * u, f0[1] + 0.1 * u]);
        }
        await shownWatch(env);
        const r = await gesture(env, k, CARD, () => play(env, plan(palm, fin, fin2)));
        const sh = await shownRead(env);
        const toU = q => [(q[0] - c.ink.l) / c.ink.w * 340, (q[1] - c.ink.t) / c.ink.h * 340];
        const pu = toU(pm), fu = toU(f0);
        const near = (st, q, d) => { for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - q[0], st[i + 1] - q[1]) < d) return true; return false; };
        const where = how === 'aim' ? `${at} ${name} finger aiming, a palm ${gap}ms after settling ${drift}px` + (along ? ` and sliding ${along}px along` : '')
          : how === 'brush' ? `${at} ${name} finger aiming, a palm ${gap}ms after settling ${drift}px and lifting, then the finger drew`
          : how === 'tap' ? `${at} ${name} finger tapping still, a palm ${gap}ms after settling ${drift}px`
          : how === 'headstart' ? `${at} ${name} palm ${gap}ms before, settled ${drift}px, drifting ${more}px under a slow-starting finger`
          : how === 'pause' ? `${at} ${name} palm ${gap}ms before, settled ${drift}px, drifting ${more}px while the refused finger paused`
          : how === 'alone' ? `${at} ${name} palm ${gap}ms before, a 20px tick, the palm sliding ${drift}px` + (then ? ', then a 120px line' : ' and lifting')
          : `${at} ${name} palm ${gap}ms before, ` + (how === 'after' ? `sliding ${drift}px after the finger lifted` : `drifting ${drift}px ${how === 'first' ? 'in 120ms' : 'over the line'}`);
        if (r.stored.some(st => near(st, pu, 25))) fail('palmtool', where, `a mark at the PALM: ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing there`);
        /* THE FINGER'S LINE STARTS WHERE THE FINGER WENT DOWN; the compass's arc is centred there, every point 60px off it. */
        const sx = c.ink.w / 340, sy = c.ink.h / 340;
        const atFinger = st => {
          if (name !== 'compass') return st.length >= 2 && Math.hypot(st[0] - fu[0], st[1] - fu[1]) < 4;
          for (let i = 0; i + 1 < st.length; i += 2) if (Math.abs(Math.hypot((st[i] - fu[0]) * sx, (st[i + 1] - fu[1]) * sy) - 60) > 6) return false;
          return st.length >= 8;
        };
        if (r.stored.some(st => !atFinger(st))) fail('palmtool', where, `a mark that is not the finger's: ${JSON.stringify(r.stored).slice(0, 100)}`);
        const lost = how !== 'aim' && name !== 'pen' && gap > 200;
        if (how === 'tap' || (how === 'alone' && !then)) {
          if (r.stored.length) fail('palmtool', where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing`);
          unseen('palmtool', where, sh);
        } else {
          if (!lost && (r.stored.length !== 1 || !atFinger(r.stored[0]))) fail('palmtool', where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted the finger's ${name} line`);
          if (lost) unseen('palmtool', where, sh);
          if ((how === 'aim' || how === 'brush') && !sh.shown) fail('palmtool', where, `the finger's line was not shown in any of ${sh.frames} frames as it was drawn`);
        }
        if (r.live || r.busy || r.touch) fail('palmtool', where, 'the pen did not let go after both lifted');
        say(`palmtool ${where} ${lost && !r.stored.length ? '(the cost: the finger\'s line lost) ' : ''}${JSON.stringify(r.stored).slice(0, 80)} shown ${sh.shown}/${sh.frames}`);
        await reset(env, k);
      }
      await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
    if (env.errs.length) fail('ERRORS', at + ' pin', env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* A POINT PUT DOWN EXACTLY (docs/history/357): § */
  const PLACE = ['plot', 'plotfine', 'rulersnap', 'curve', 'straight', 'zoom', 'loupe', 'samples'];
  /* A SEEDED WOBBLE, so a failure can be run again exactly. */
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const SEEDS = [11, 23, 37];
  const QUAD = 'Q-CBM-quadrilaterals-8';      // a made-up squared grid (`surfaceSvg_`), no figure of its own
  const FINE = 'Q-1MA1-2005-1H-12b';          // a cumulative frequency grid, 3.3px squares at 390
  /* THE GRID AS THE APP READS IT, in client px and in units. */
  const latOf = env => env.page.evaluate(() => {
    const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === window.__k);
    if (!pad) return null;
    const r = pad.querySelector('.qpad-ink').getBoundingClientRect();
    const L = padLattice_(pad, r);
    return L ? { xp: L.xp.map(v => v + r.left), yp: L.yp.map(v => v + r.top), xu: L.xu, yu: L.yu, pitch: L.pitch, sx: r.width / 340, sy: r.height / 340,
                 tools: [...pad.querySelectorAll('.qpad-tool')].map(t => t.getAttribute('data-tool')) } : { none: true };
  });
  /* SIX INTERSECTIONS SPREAD OVER THE GRID, none on its edge. */
  const sixOf = L => {
    const nx = L.xp.length, ny = L.yp.length, at = (fx, fy) => [Math.max(1, Math.min(nx - 2, Math.round(fx * (nx - 1)))), Math.max(1, Math.min(ny - 2, Math.round(fy * (ny - 1))))];
    return [[0.2, 0.25], [0.45, 0.6], [0.7, 0.3], [0.3, 0.8], [0.8, 0.75], [0.55, 0.15]].map(([a, b]) => at(a, b));
  };
  /* A TAP AIMED AT (x, y): landing at aim + U(+-J)^2, then 4-6 moves at aim + U(+-J)^2, 16ms apart. Returns what was sent. */
  async function jtap(env, x, y, R, J) {
    const j = () => (R() * 2 - 1) * J, sent = [[x + j(), y + j()]];
    const n = 4 + Math.floor(R() * 3), fr = [];
    for (let i = 0; i < n; i++) { const p = [x + j(), y + j()]; sent.push(p); fr.push([pt(p[0], p[1])]); }
    begin(env);
    await T(env, 'touchStart', [pt(sent[0][0], sent[0][1])], 0);
    await stream(env, fr, 16);
    await T(env, 'touchEnd', [], (n + 1) * 16);
    await sleep(260);
    return sent;
  }
  const tapTool = async (env, name) => {
    const b = await env.page.evaluate(n => {
      const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === window.__k);
      const t = pad && pad.querySelector('.qpad-tool[data-tool="' + n + '"]');
      if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, name);
    if (!b) return false;
    begin(env); await T(env, 'touchStart', [pt(b.x, b.y)], 0); await sleep(40); await T(env, 'touchEnd', [], 40); await sleep(500);
    return true;
  };
  /* A CARD OPENED AND ARMED; null (and a REACH failure) when it cannot be. */
  async function open(env, row, at) {
    await env.page.waitForFunction(r => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(x => x.row && x.row.row_id === r), row, { timeout: 90000 }).catch(() => {});
    const k = await card(env, row);
    let c = k ? await cardBox(env) : null;
    if (!c) { fail('REACH', at, row + '\'s pen is not on the screen'); return null; }
    await reset(env, k);
    c = await arm(env, c, cardBox);
    if (!c) { fail('REACH', at, row + '\'s pad could not be armed with a real tap on its lock'); return null; }
    reached++;
    return { k, c: (await cardBox(env)) || c };
  }
  /* THE LOUPE, FRAME BY FRAME, judged inside the pen's own frame (`padFrame_` wrapped): once it has been shown, is it on
     and where the finger is -- its centre 112px above the finger, or beside it near the top -- in every frame after. */
  const loupeWatch = env => env.page.evaluate(() => {
    if (!window.__lw0) {
      const f = window.padFrame_;
      window.__lw0 = true;
      window.padFrame_ = function () {
        f.apply(this, arguments);
        const S = window.__lw, g = PAD_GO;
        if (!S || !S.on || !g || !g.c) return;
        const el = document.querySelector('body > .pad-loupe.on');
        if (el) S.seen = true;
        if (!S.seen) return;
        S.frames++;
        if (!el) return;
        const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(el.style.transform || '');
        if (!m) return;
        const cx = +m[1] + 64, cy = +m[2] + 64, p = g.c.p;
        const over = Math.abs(cx - Math.max(68, Math.min(innerWidth - 68, p[0]))) < 1.5 && Math.abs(cy - (p[1] - 112)) < 1.5;
        const beside = Math.abs(cy - Math.max(68, p[1])) < 1.5 && Math.abs(Math.abs(cx - p[0]) - 112) < 70;
        if (over || beside) S.follow++;
      };
    }
    window.__lw = { on: true, seen: false, frames: 0, follow: 0 };
  });
  const loupeRead = env => env.page.evaluate(() => { const S = window.__lw || {}; S.on = false; return { frames: S.frames || 0, follow: S.follow || 0, on: !!document.querySelector('body > .pad-loupe.on') }; });

  if (PLACE.some(want)) for (const [W, H] of [[390, 844], [320, 568]]) {
    const at = `${W}x${H}`;
    if (W === 320 && !want('plotfine')) continue;
    const env = await boot(browser, W, H, port);
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });

    /* ---- plot: six taps on Q7's own grid and on a made-up squared grid; the board keeps the same tap as it always did ---- */
    if (want('plot') && W === 390) for (const row of [Q7, QUAD]) {
      const o = await open(env, row, at);
      if (!o) continue;
      const L = await latOf(env);
      if (!L || L.none) { fail('plot', at + ' ' + row, 'the app reads no grid in its picture — nothing can snap'); continue; }
      for (const seed of SEEDS) {
        const R = rng(seed), six = sixOf(L);
        for (const [i, j] of six) await jtap(env, L.xp[i], L.yp[j], R, 4);
        const r = await look(env, o.k, CARD);
        const want6 = six.map(([i, j]) => [Math.round(L.xu[i]), Math.round(L.yu[j])]);
        let ok = 0;
        r.stored.forEach((st, n) => {
          const w = want6[n];
          const off = w ? Math.hypot(w[0] * L.sx - L.xu[six[n][0]] * L.sx, w[1] * L.sy - L.yu[six[n][1]] * L.sy) : 99;
          if (st.length === 2 && w && st[0] === w[0] && st[1] === w[1] && off <= 0.6) ok++;
        });
        if (r.stored.length !== 6 || ok !== 6) fail('plot', `${at} ${row} seed ${seed}`, `${ok} of 6 taps stored as the one point of their intersection (${r.stored.length} strokes: ${JSON.stringify(r.stored).slice(0, 120)}; wanted ${JSON.stringify(want6)})`);
        console.log(`  plot ${at} ${row} seed ${seed}: ${ok} of 6 on the intersection, square ${L.pitch.toFixed(1)}px`);
        await reset(env, o.k);
      }
    }
    if (want('plot') && W === 390) {
      /* THE BOARD NEVER SNAPS AND A TAP ON IT IS WHAT IT WAS: the landing and every move, a repeat dropped, thinned. */
      let b = await board(env);
      if (b) { await reset(env, b.k); b = await arm(env, b, board); }
      if (!b) fail('REACH', at, 'the board could not be armed for plot');
      else {
        const sent = await jtap(env, b.ink.l + b.ink.w * 0.4, b.ink.t + b.ink.h * 0.4, rng(5), 4);
        await sleep(300);
        const res = await env.page.evaluate(([k, sent, box]) => {
          const raw = [];
          sent.forEach(([x, y]) => {
            const u = [Math.round((Math.round(x * 100) / 100 - box.l) / box.w * 340), Math.round((Math.round(y * 100) / 100 - box.t) / box.h * 340)];
            if (raw.length && raw[raw.length - 2] === u[0] && raw[raw.length - 1] === u[1]) return;
            raw.push(u[0], u[1]);
          });
          let st = []; try { st = JSON.parse(ansValue_(k) || '[]'); } catch (e) {}
          return { st, want: ansSimplify_(raw, 1) };
        }, [b.k, sent, b.ink]);
        if (JSON.stringify(res.st) !== JSON.stringify([res.want])) fail('plot', at + ' board', `the board stored ${JSON.stringify(res.st)} for a tap it stores as ${JSON.stringify([res.want])} — the board must never snap`);
        await reset(env, b.k);
      }
    }

    /* ---- plotfine: a closed loop on a 3.3px grid -- the finger follows the loupe's crosshair, wobbling ---- */
    if (want('plotfine')) {
      const o = await open(env, FINE, at);
      const L = o ? await latOf(env) : null;
      if (o && (!L || L.none)) fail('plotfine', at, 'no grid read on the fine grid');
      else if (o) {
        const g = await env.page.evaluate(() => PAD_GAIN);
        let exact = 0, tries = 0, slow = 0;
        const times = [];
        for (const seed of SEEDS) {
          const R = rng(seed), six = sixOf(L);
          for (const [i, j] of six) {
            tries++;
            const aim = [L.xp[i], L.yp[j]], want = [Math.round(L.xu[i]), Math.round(L.yu[j])];
            const jj = () => (R() * 2 - 1) * 4;
            let F = [aim[0] + jj(), aim[1] + jj()];
            begin(env);
            const t0 = Date.now();
            await T(env, 'touchStart', [pt(F[0], F[1])], 0);
            let held = 0, ms = 0;
            for (let step = 1; step < 120; step++) {
              await sleep(16); ms = since(env);
              const d = await env.page.evaluate(() => { const el = document.querySelector('body > .pad-loupe.on'); return el ? el.getAttribute('data-at') : null; });
              if (!d) continue;
              const [ax, ay] = d.split(',').map(Number);
              if (ax === want[0] && ay === want[1]) { held += 16; if (held >= 150) break; }
              else held = 0;
              /* THE CHILD MOVES TOWARD WHAT THE LOUPE SHOWS, BY HALF OF WHAT IS LEFT, AT THE GAIN THEY FEEL -- and wobbles. */
              F = [F[0] + 0.5 * (want[0] - ax) * L.sx / g, F[1] + 0.5 * (want[1] - ay) * L.sy / g];
              await T(env, 'touchMove', [pt(F[0] + jj(), F[1] + jj())], ms);
            }
            await T(env, 'touchEnd', [], since(env));
            const took = Date.now() - t0;
            await sleep(200);
            const r = await look(env, o.k, CARD);
            const st = r.stored[r.stored.length - 1] || [];
            if (st.length === 2 && st[0] === want[0] && st[1] === want[1] && took <= 1500) exact++;
            if (took > 1500) slow++;
            times.push(took);
            await reset(env, o.k);
          }
        }
        const mean = Math.round(times.reduce((a, b) => a + b, 0) / Math.max(1, times.length));
        console.log(`  plotfine ${at} gain ${g}: ${exact} of ${tries} exact within 1.5s (${slow} slower), mean ${mean}ms, square ${L.pitch.toFixed(2)}px`);
        /* JUDGED AT 390; AT 320 PRINTED (the spec's line): its 2.1px squares measured 17-18 of 18 -- the condition 338 section 9
           named for revisiting pinch-zoom is a 320 that fails outright, and 357 records it. */
        if (W === 390 && exact !== tries) fail('plotfine', at, `${exact} of ${tries} points on a ${L.pitch.toFixed(1)}px grid stored exactly within 1.5s, following the loupe`);
      }
    }

    /* ---- rulersnap: both ends on their intersections from a wobbling finger; a bar side 3 degrees off upright stored upright ---- */
    if (want('rulersnap') && W === 390) {
      const o = await open(env, Q7, at);
      const L = o ? await latOf(env) : null;
      if (o && (!L || L.none || L.tools.indexOf('ruler') === -1)) fail('rulersnap', at, `Q7 offers no Ruler (${L && L.tools}) — every grid gets one`);
      else if (o && await tapTool(env, 'ruler')) {
        for (const seed of SEEDS) {
          const R = rng(seed), jj = () => (R() * 2 - 1) * 4;
          const A = [3, 4], B = [9, 11];
          const a = [L.xp[A[0]] + jj(), L.yp[A[1]] + jj()], b = [L.xp[B[0]] + jj(), L.yp[B[1]] + jj()];
          const fin = track(1, 8, 0, 400, 8, u => [a[0] + (b[0] - a[0]) * mj(u / 400) + (u ? jj() / 4 : 0), a[1] + (b[1] - a[1]) * mj(u / 400) + (u ? jj() / 4 : 0)])
            .concat(track(1, 8, 408, 700, 16, () => [b[0] + jj(), b[1] + jj()]));
          const r = await gesture(env, o.k, CARD, () => play(env, plan(fin)));
          const want = [Math.round(L.xu[A[0]]), Math.round(L.yu[A[1]]), Math.round(L.xu[B[0]]), Math.round(L.yu[B[1]])];
          if (JSON.stringify(r.stored) !== JSON.stringify([want])) fail('rulersnap', `${at} seed ${seed}`, `a ruler line stored ${JSON.stringify(r.stored)} — wanted ${JSON.stringify([want])}, both ends on their intersections`);
          await reset(env, o.k);
          /* A BAR'S SIDE, 5 SQUARES UP, DRAWN 3 DEGREES OFF UPRIGHT. */
          const C = [6, 13], c0 = [L.xp[C[0]] + jj(), L.yp[C[1]] + jj()], len = (L.yp[C[1]] - L.yp[C[1] - 5]);
          const d = [L.xp[C[0]] + len * Math.sin(3 * Math.PI / 180), L.yp[C[1]] - len * Math.cos(3 * Math.PI / 180)];
          const bar = track(1, 8, 0, 300, 8, u => [c0[0] + (d[0] - c0[0]) * mj(u / 300), c0[1] + (d[1] - c0[1]) * mj(u / 300)]).concat(track(1, 8, 308, 600, 16, () => d));
          const r2 = await gesture(env, o.k, CARD, () => play(env, plan(bar)));
          const s = r2.stored[0] || [];
          const wantBar = [Math.round(L.xu[C[0]]), Math.round(L.yu[C[1]]), Math.round(L.xu[C[0]]), Math.round(L.yu[C[1] - 5])];
          if (JSON.stringify(r2.stored) !== JSON.stringify([wantBar])) fail('rulersnap', `${at} seed ${seed} bar`, `a bar side 3 degrees off upright stored ${JSON.stringify(r2.stored)} — wanted ${JSON.stringify([wantBar])}, upright and on the grid`);
          say(`rulersnap ${at} ${seed} ${JSON.stringify(r.stored)} bar ${JSON.stringify(s)}`);
          await reset(env, o.k);
        }
        await tapTool(env, 'pen');
      } else if (o) fail('rulersnap', at, 'the Ruler tile could not be pressed');
    }

    /* ---- curve: six dots, then a freehand curve through them -- the line is the finger's own, round, and the dots stay ---- */
    if (want('curve') && W === 390) {
      const o = await open(env, Q7, at);
      const L = o ? await latOf(env) : null;
      if (o && (!L || L.none)) fail('curve', at, 'no grid on Q7');
      else if (o) for (const seed of SEEDS) {
        const R = rng(seed);
        /* SIX POINTS ON A PARABOLA OF THE GRID, left to right. */
        const cols = [2, 4, 6, 8, 10, 12].map(c => Math.min(L.xp.length - 2, c));
        const rows = [12, 7, 4, 3, 4, 7].map(v => Math.min(L.yp.length - 2, v));
        const dots = cols.map((cI, n) => [L.xp[cI], L.yp[rows[n]]]);
        for (const [x, y] of dots) await jtap(env, x, y, R, 4);
        const before = (await look(env, o.k, CARD)).stored;
        /* THE CURVE: Catmull-Rom through the six, about 2.4px a sample at 8ms (300px/s), +-1.5px of wobble. */
        const cr = (p0, p1, p2, p3, t) => [0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t));
        const P = [dots[0]].concat(dots, [dots[5]]), ideal = [];
        for (let s = 1; s < 6; s++) { const n = Math.ceil(Math.hypot(P[s + 1][0] - P[s][0], P[s + 1][1] - P[s][1]) / 2.4); for (let q = s === 1 ? 0 : 1; q <= n; q++) ideal.push(cr(P[s - 1], P[s], P[s + 1], P[s + 2], q / n)); }
        const sent = ideal.map(p => [p[0] + (R() * 2 - 1) * 1.5, p[1] + (R() * 2 - 1) * 1.5]);
        begin(env);
        await T(env, 'touchStart', [pt(sent[0][0], sent[0][1])], 0);
        await stream(env, sent.slice(1).map(p => [pt(p[0], p[1])]), 8);
        await T(env, 'touchEnd', [], sent.length * 8 + 8);
        await sleep(500);
        const res = await env.page.evaluate(([k, sent, ideal, dots]) => {
          const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === k);
          const box = pad.querySelector('.qpad-ink').getBoundingClientRect();
          let all = []; try { all = JSON.parse(ansValue_(k) || '[]'); } catch (e) {}
          const st = all[all.length - 1] || [];
          const raw = [];
          sent.forEach(([x, y]) => { const u = padMap_(box, Math.round(x * 100) / 100, Math.round(y * 100) / 100); if (raw.length && raw[raw.length - 2] === u[0] && raw[raw.length - 1] === u[1]) return; raw.push(u[0], u[1]); });
          /* EVERY STORED POINT IS ONE OF THE FINGER'S, IN ORDER, to the unit -- a touch reaches the page on the screen's
             half-pixel grid at DPR 2, so a sample can land one unit from where it was sent. A snap would move it 8. */
          let j = 0, own = true;
          const near = (a, b, c, d) => Math.abs(a - c) <= 1 && Math.abs(b - d) <= 1;
          for (let i = 0; i + 1 < st.length; i += 2) { let k = j; while (k + 1 < raw.length && !near(raw[k], raw[k + 1], st[i], st[i + 1])) k += 2; if (k + 1 >= raw.length || k - j > 8) { own = false; break; } j = k; }
          const paths = pad.querySelectorAll('.qpad-g path'), path = paths[paths.length - 1];
          const toS = q => [box.left + q.x / 340 * box.width, box.top + q.y / 340 * box.height];
          const L = path.getTotalLength(), pts = [];
          for (let s = 0; s <= L; s += 2) pts.push(toS(path.getPointAtLength(s)));
          const segD = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy; const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
          let far = 0;
          pts.forEach(p => { let m = Infinity; for (let i = 1; i < ideal.length; i++) m = Math.min(m, segD(p, ideal[i - 1], ideal[i])); far = Math.max(far, m); });
          const dotD = dots.map(d => Math.min(...pts.map(p => Math.hypot(p[0] - d[0], p[1] - d[1]))));
          /* THE TURN AT EACH VERTEX OF THE DRAWN LINE AS A PERSON SEES IT -- read every 12px along it, its end chords left out. § */
          const v = []; for (let s = 12; s < L - 12; s += 12) v.push(toS(path.getPointAtLength(s)));
          let turn = 0;
          for (let i = 1; i + 1 < v.length; i++) { const a1 = Math.atan2(v[i][1] - v[i - 1][1], v[i][0] - v[i - 1][0]), a2 = Math.atan2(v[i + 1][1] - v[i][1], v[i + 1][0] - v[i][0]); let d = Math.abs(a2 - a1) * 180 / Math.PI; if (d > 180) d = 360 - d; turn = Math.max(turn, d); }
          return { all: all.length, first: [st[0], st[1]], rawFirst: [raw[0], raw[1]], own, n: st.length / 2, rawN: raw.length / 2, far, dotD: Math.max(...dotD), turn, dotsNow: all.slice(0, 6) };
        }, [o.k, sent, ideal, dots]);
        const where = `${at} seed ${seed}`;
        if (res.all !== 7) fail('curve', where, `${res.all} strokes stored — wanted the six dots and the curve`);
        if (JSON.stringify(res.dotsNow) !== JSON.stringify(before.slice(0, 6))) fail('curve', where, 'the dots changed when the curve was drawn');
        if (!res.own || Math.abs(res.first[0] - res.rawFirst[0]) > 1 || Math.abs(res.first[1] - res.rawFirst[1]) > 1) fail('curve', where, `the curve stored is not the finger's own samples through padMap_ (first ${res.first} against ${res.rawFirst}) — a line must never snap`);
        if (res.n < res.rawN * 0.95) fail('curve', where, `the curve kept ${res.n} of ${res.rawN} samples`);
        if (!(res.far <= 1.5 + 1.5 + 0.01)) fail('curve', where, `the drawn curve strays ${res.far.toFixed(2)}px from the one aimed at — wanted within the wobble + 1.5px`);
        if (!(res.dotD <= 3)) fail('curve', where, `the curve passes ${res.dotD.toFixed(2)}px from a dot it was drawn through — wanted 3px`);
        if (!(res.turn < 50)) fail('curve', where, `the drawn curve turns ${Math.round(res.turn)} degrees at a vertex — wanted under 50`);
        console.log(`  curve ${where}: ${res.n} of ${res.rawN} samples kept, ${res.far.toFixed(2)}px from the aim, ${res.dotD.toFixed(2)}px from the furthest dot, sharpest turn ${Math.round(res.turn)} degrees`);
        await shot(env.page, `curve-${seed}`);
        await reset(env, o.k);
      }
    }

    /* ---- straight (374): a line paused at its end is straight and on the grid, a ring paused is round, a quick line is kept as drawn,
       a polygon paused at each corner is its corners -- and is marked right ---- */
    if (want('straight') && W === 390) {
      /* A FINGER'S PATH THROUGH WAYPOINTS (px), 2.5px a sample with +-1.5px wobble and a 4px bow; `still` ms of +-2px tremble at each waypoint in `holds` */
      const drawThrough = async (env, way, holds, still, R) => {
        const w = () => (R() * 2 - 1) * 1.5;
        begin(env);
        await T(env, 'touchStart', [pt(way[0][0], way[0][1])], 0);
        for (let s = 1; s < way.length; s++) {
          const a = way[s - 1], b = way[s], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(L / 2.5)), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
          for (let i = 1; i <= n; i++) { const u = i / n, bow = 4 * Math.sin(Math.PI * u); await T(env, 'touchMove', [pt(a[0] + (b[0] - a[0]) * u + nx * bow + (i < n ? w() : 0), a[1] + (b[1] - a[1]) * u + ny * bow + (i < n ? w() : 0))], since(env)); await sleep(8); }
          if (holds.indexOf(s) !== -1) { const t0 = Date.now(); while (Date.now() - t0 < still) { await T(env, 'touchMove', [pt(b[0] + (R() * 2 - 1) * 2, b[1] + (R() * 2 - 1) * 2)], since(env)); await sleep(40); } }
        }
        const e = way[way.length - 1];
        await T(env, 'touchEnd', [pt(e[0], e[1])], since(env));
        await sleep(400);
      };
      const o = await open(env, Q7, at);
      const L = o ? await latOf(env) : null;
      if (o && (!L || L.none)) fail('straight', at, 'no grid on Q7');
      else if (o) {
        const i0 = 2, j0 = Math.min(L.yp.length - 3, 9), i1 = Math.min(L.xp.length - 3, 11), j1 = 3;
        const A = [L.xp[i0], L.yp[j0]], B = [L.xp[i1], L.yp[j1]];
        const wantU = [Math.round(L.xu[i0]), Math.round(L.yu[j0]), Math.round(L.xu[i1]), Math.round(L.yu[j1])];
        /* aimed 3px off each intersection, as a finger lands */
        const A2 = [A[0] + 3, A[1] - 2], B2 = [B[0] - 2, B[1] + 3];
        for (const seed of SEEDS) {
          await drawThrough(env, [A2, B2], [1], 700, rng(seed));
          const r = await look(env, o.k, CARD), st = r.stored[r.stored.length - 1] || [];
          if (r.stored.length !== 1 || JSON.stringify(st) !== JSON.stringify(wantU)) fail('straight', `${at} line seed ${seed}`, `a bowed line held 700ms at its end stored ${JSON.stringify(r.stored).slice(0, 120)} — wanted the straight line between the two intersections ${JSON.stringify(wantU)}`);
          if (seed === SEEDS[0]) await shot(env.page, 'straight-line');
          await reset(env, o.k);
        }
        /* A MOUSE: pressed, dragged with a wobble, held still (no events at all) 700ms, released -- straight too */
        {
          const Rm = rng(4);
          await MO(env, 'mousePressed', A2[0], A2[1], 'mouse', 1);
          const n = 60;
          for (let i = 1; i <= n; i++) { const u = i / n; await MO(env, 'mouseMoved', A2[0] + (B2[0] - A2[0]) * u + (Rm() * 2 - 1) * 2, A2[1] + (B2[1] - A2[1]) * u + 4 * Math.sin(Math.PI * u), 'mouse', 1); await sleep(8); }
          await MO(env, 'mouseMoved', B2[0], B2[1], 'mouse', 1);
          await sleep(700);
          await MO(env, 'mouseReleased', B2[0], B2[1], 'mouse', 0);
          await sleep(400);
          const r = await look(env, o.k, CARD), st = r.stored[0] || [];
          if (r.stored.length !== 1 || JSON.stringify(st) !== JSON.stringify(wantU)) fail('straight', `${at} mouse`, `a mouse line held 700ms stored ${JSON.stringify(r.stored).slice(0, 120)} — wanted ${JSON.stringify(wantU)}`);
          await reset(env, o.k);
        }
        /* THE SAME LINE, LIFTED AT ONCE: kept as the finger drew it */
        await drawThrough(env, [A2, B2], [], 0, rng(5));
        let r = await look(env, o.k, CARD), st = r.stored[0] || [];
        if (r.stored.length !== 1 || st.length / 2 < 20) fail('straight', at + ' quick', `a line lifted without a pause stored ${st.length / 2} points — it was straightened, wanted the finger's own`);
        console.log(`  straight ${at}: held lines stored as two intersections, a quick line kept ${st.length / 2} points`);
        await reset(env, o.k);
        /* A PAUSE THAT IS TOO SHORT (300ms, a child's ordinary hesitation) changes nothing */
        await drawThrough(env, [A2, B2], [1], 300, rng(6));
        r = await look(env, o.k, CARD); st = r.stored[0] || [];
        if (st.length / 2 < 20) fail('straight', at + ' 300ms', `a line paused 300ms at its end was straightened (${st.length / 2} points) — the hold is ${500}ms`);
        await reset(env, o.k);
        /* A RING: a wobbly, slightly oval circle, closed and held -- every stored point on one circle, closed */
        const cx = o.c.ink.l + o.c.ink.w * 0.5, cy = o.c.ink.t + o.c.ink.h * 0.5, rad = Math.min(o.c.ink.w, o.c.ink.h) * 0.3, ring = [];
        for (let i = 0; i <= 48; i++) { const t = 2 * Math.PI * i / 48; ring.push([cx + rad * 1.05 * Math.cos(t), cy + rad * 0.96 * Math.sin(t)]); }
        ring.push([ring[0][0] + 4, ring[0][1] + 6]);
        const Rg = rng(7);
        begin(env);
        await T(env, 'touchStart', [pt(ring[0][0], ring[0][1])], 0);
        for (let i = 1; i < ring.length; i++) { await T(env, 'touchMove', [pt(ring[i][0] + (Rg() * 2 - 1) * 1.5, ring[i][1] + (Rg() * 2 - 1) * 1.5)], since(env)); await sleep(10); }
        { const e = ring[ring.length - 1], t0 = Date.now(); while (Date.now() - t0 < 700) { await T(env, 'touchMove', [pt(e[0] + (Rg() * 2 - 1) * 2, e[1] + (Rg() * 2 - 1) * 2)], since(env)); await sleep(40); } }
        await T(env, 'touchEnd', [], since(env)); await sleep(400);
        r = await look(env, o.k, CARD); st = r.stored[0] || [];
        const sx = o.c.ink.w / 340, sy = o.c.ink.h / 340, P = []; for (let i = 0; i + 1 < st.length; i += 2) P.push([st[i] * sx, st[i + 1] * sy]);
        const m = P.reduce((s, p) => [s[0] + p[0] / P.length, s[1] + p[1] / P.length], [0, 0]), ds = P.map(p => Math.hypot(p[0] - m[0], p[1] - m[1]));
        const spread = ds.length ? Math.max(...ds) - Math.min(...ds) : 99, closed = st.length >= 4 && st[0] === st[st.length - 2] && st[1] === st[st.length - 1];
        if (r.stored.length !== 1 || P.length < 20 || !closed || spread > 2.5) fail('straight', at + ' ring', `a wobbly oval held at its close stored ${P.length} points, closed ${closed}, radius spread ${spread.toFixed(1)}px — wanted a closed ring within 2.5px`);
        console.log(`  straight ${at} ring: ${P.length} points, closed ${closed}, radius spread ${spread.toFixed(2)}px`);
        await shot(env.page, 'straight-ring');
        await reset(env, o.k);
      }
      /* A QUADRILATERAL IN ONE STROKE, paused at each corner, on Corbettmaths coordinates Q8: its corners, closed, and Check marks it right */
      const POLY = 'Q-CBM-coordinates-8';
      const q = await open(env, POLY, at);
      if (q) {
        const eg = await env.page.evaluate(k => {
          const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === k);
          /* the Check row is at the card's foot, under the words, and names its pad (381) */
          const row = document.querySelector(`#s-stuff .page.on .qpad-send[data-pad="${CSS.escape(k)}"]`), art = pad.querySelector('.qpad-art > svg:first-child');
          return DRAW_MARK.example(row.getAttribute('data-draw'), drawFig_(art.__src || art.outerHTML));
        }, q.k);
        const poly = (eg[0] || []).map(Math.round), way = [];
        for (let i = 0; i + 1 < poly.length; i += 2) way.push([q.c.ink.l + poly[i] / 340 * q.c.ink.w + 2, q.c.ink.t + poly[i + 1] / 340 * q.c.ink.h - 2]);
        if (way.length < 4) fail('straight', at + ' ' + POLY, 'no example drawing to aim at');
        else {
          await drawThrough(env, way, way.map((_, i) => i).slice(1), 650, rng(9));
          const r = await look(env, q.k, CARD), st = r.stored[0] || [];
          const v = await env.page.evaluate(k => {
            const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === k);
            const row = document.querySelector(`#s-stuff .page.on .qpad-send[data-pad="${CSS.escape(k)}"]`);
            const res = padCheck_(row, padOfRow_(row));
            return { got: res && res.got, of: res && res.of, say: row.querySelector('.qp-verdict').textContent };
          }, q.k);
          if (r.stored.length !== 1 || st.length / 2 !== way.length) fail('straight', at + ' ' + POLY, `a quadrilateral paused at each corner stored ${JSON.stringify(r.stored).slice(0, 120)} — wanted its ${way.length} corners`);
          if (!(v.got >= 1 && v.got === v.of)) fail('straight', at + ' ' + POLY, `the straightened quadrilateral is marked ${v.got}/${v.of} (${v.say}) — wanted right`);
          console.log(`  straight ${at} ${POLY}: ${st.length / 2} corners stored, marked ${v.got}/${v.of} "${v.say}"`);
          await shot(env.page, 'straight-poly');
        }
        await reset(env, q.k);
      }
    }

    /* ---- zoom (374): two fingers pinch the armed figure closer, one finger then puts a point exactly, a line is stored in the
       picture's own units, and pinching back lets go -- nothing stored by the pinch, the column unmoved ---- */
    if (want('zoom') && W === 390) {
      const o = await open(env, Q7, at);
      if (o) {
        const c = o.c, mx = c.ink.l + c.ink.w * 0.5, my = c.ink.t + c.ink.h * 0.5;
        const zoomOf = () => env.page.evaluate(k => { const z = PAD_ZOOM.get(k); const pad = [...document.querySelectorAll('#s-stuff .page.on .qpad')].find(p => p.getAttribute('data-k') === k); return { s: z ? z.s : 1, cls: !!(pad && pad.classList.contains('is-zoomed')) }; }, o.k);
        const L0 = await latOf(env);
        const pinch = (d0, d1) => gesture(env, o.k, CARD, () => play(env, plan(track(1, 8, 0, 360, 12, u => [mx - (d0 + (d1 - d0) * mj(u / 360)) / 2, my]), track(2, 8, 20, 360, 12, u => [mx + (d0 + (d1 - d0) * mj(u / 360)) / 2, my]))));
        let r = await pinch(40, 160);
        let z = await zoomOf();
        nothing('zoom', at + ' pinch out', r, { at: c.at, page: c.page });
        if (!(z.s >= 2.5 && z.cls)) fail('zoom', at + ' pinch out', `two fingers spreading 40px to 160px left the picture at ${z.s.toFixed(2)}x (class ${z.cls}) — wanted about 4x`);
        await shot(env.page, 'zoom-in');
        /* A TAP ON AN INTERSECTION OF THE ZOOMED GRID: the point stored is that intersection's own units */
        const L = await latOf(env);
        let cell = null;
        for (let i = 1; i < L.xp.length - 1 && !cell; i++) for (let j = 1; j < L.yp.length - 1 && !cell; j++) {
          const x = L.xp[i], y = L.yp[j];
          if (x > c.ink.l + 20 && x < c.ink.r - 20 && y > c.ink.t + 20 && y < c.ink.b - 20) cell = [i, j];
        }
        if (!cell) fail('zoom', at, 'no intersection of the zoomed grid is inside the picture');
        else {
          await jtap(env, L.xp[cell[0]], L.yp[cell[1]], rng(3), 4);
          r = await look(env, o.k, CARD);
          const want1 = [Math.round(L.xu[cell[0]]), Math.round(L.yu[cell[1]])];
          if (JSON.stringify(r.stored) !== JSON.stringify([want1])) fail('zoom', at + ' tap', `a tap on the zoomed grid stored ${JSON.stringify(r.stored)} — wanted [${want1}], the picture's own units`);
          if (L.pitch < L0.pitch * 2.4) fail('zoom', at, `the zoomed square is ${L.pitch.toFixed(1)}px, unzoomed ${L0.pitch.toFixed(1)}px — the snap is not reading the zoomed box`);
          console.log(`  zoom ${at}: ${z.s.toFixed(2)}x, square ${L0.pitch.toFixed(1)}px -> ${L.pitch.toFixed(1)}px, a tap stored ${JSON.stringify(r.stored)} (wanted [${want1}])`);
        }
        /* PINCHED BACK IN: whole again, the mark kept */
        r = await pinch(160, 30);
        z = await zoomOf();
        if (z.s !== 1 || z.cls) fail('zoom', at + ' pinch in', `pinching back left the picture at ${z.s.toFixed(2)}x (class ${z.cls}) — wanted whole`);
        if (r.stored.length !== 1) fail('zoom', at + ' pinch in', `the mark made zoomed was not kept: ${JSON.stringify(r.stored)}`);
        unmoved('zoom', at + ' pinch in', r, { at: c.at, page: c.page });
        /* A PALM SLIDING WITH A FINGER (spread unchanged) does not zoom */
        await reset(env, o.k);
        r = await gesture(env, o.k, CARD, () => play(env, plan(track(1, 8, 0, 300, 12, u => [mx - 40 + u * 0.15, my]), track(2, 8, 20, 300, 12, u => [mx + 40 + u * 0.15, my + 2]))));
        z = await zoomOf();
        if (z.s !== 1) fail('zoom', at + ' pan', `two fingers moving together at 1x zoomed the picture to ${z.s.toFixed(2)}x`);
        /* ZOOMED, THEN DONE DRAWING: the card is whole again */
        await pinch(40, 160);
        const lk = await cardBox(env);
        begin(env); await T(env, 'touchStart', [pt(lk.lock.x, lk.lock.y)], 0); await sleep(40); await T(env, 'touchEnd', [], 40);
        await sleep(500);
        z = await zoomOf();
        if (z.s !== 1 || z.cls) fail('zoom', at + ' done', 'the picture stayed zoomed after Done drawing');
        await reset(env, o.k);
      }
    }

    /* ---- loupe: up from the touch for every stroke (359); follows a freehand line; never with a second finger; gone after every end ---- */
    if (want('loupe') && W === 390) {
      const isOn = () => env.page.evaluate(() => !!document.querySelector('body > .pad-loupe.on'));
      const o = await open(env, FINE, at);
      if (o) {
        const c = o.c;
        /* THE FIRST FRAME: a frame asked for from a `pointerdown` listener added after the app's runs after the pen's frame. */
        await env.page.evaluate(() => { window.__first = null; if (!window.__fl) { window.__fl = 1; document.addEventListener('pointerdown', () => { requestAnimationFrame(() => { if (window.__first === null) window.__first = !!document.querySelector('body > .pad-loupe.on'); }); }); } });
        await loupeWatch(env);
        const x0 = c.ink.l + c.ink.w * 0.4, y0 = c.ink.t + c.ink.h * 0.5, fr = [];
        for (let i = 1; i <= 40; i++) fr.push([pt(x0 + Math.sin(i / 4) * 8, y0 + Math.cos(i / 5) * 8)]);
        begin(env);
        await T(env, 'touchStart', [pt(x0, y0)], 0);
        await stream(env, fr, 16);
        const fl = await env.page.evaluate(() => window.__first);
        await T(env, 'touchEnd', [], 41 * 16);
        await sleep(300);
        const lw = await loupeRead(env);
        if (fl !== true) fail('loupe', at + ' fine', 'the loupe was not on in the first frame after a finger landed on a 3.3px grid');
        if (!lw.frames || lw.follow / lw.frames < 0.95) fail('loupe', at + ' fine', `the loupe followed the finger in ${lw.follow} of ${lw.frames} frames — under 95%`);
        if (lw.on) fail('loupe', at + ' fine', 'the loupe was left on after the lift');
        console.log(`  loupe ${at} fine: on in the first frame ${fl}, followed ${lw.follow}/${lw.frames}`);
        /* A SECOND FINGER: nothing on the screen from its landing -- the loupe counted with the preview (`shownWatch`). */
        await reset(env, o.k);
        await shownWatch(env);
        /* A TWO-FINGER PAN: both land within 80ms and move together. */
        const two = await gesture(env, o.k, CARD, () => play(env, plan(track(1, 8, 0, 400, 16, u => [x0 + u * 0.12, y0 - u * 0.05]), track(2, 8, 80, 400, 16, u => [x0 + 60 + (u - 80) * 0.12, y0 + 30 - (u - 80) * 0.05]))));
        const sh = await shownRead(env);
        if (sh.shown) fail('loupe', at + ' two fingers', `the picture showed ${sh.what} in ${sh.shown} of ${sh.frames} frames from the second finger's landing`);
        if (two.stored.length) fail('loupe', at + ' two fingers', 'two fingers stored ' + JSON.stringify(two.stored).slice(0, 80));
        /* A CANCEL AND `padDrop_` mid-stroke take it away too. */
        await reset(env, o.k);
        begin(env); await T(env, 'touchStart', [pt(x0, y0)], 0); await sleep(120);
        if (!await isOn()) fail('loupe', at + ' cancel', 'the loupe was not up before the cancel');
        await T(env, 'touchCancel', [], 120); await sleep(200);
        if (await isOn()) fail('loupe', at + ' cancel', 'the loupe was left on after a touchCancel');
        begin(env); await T(env, 'touchStart', [pt(x0, y0)], 0); await sleep(120);
        await env.page.evaluate(() => padDrop_()); await sleep(100);
        if (await isOn()) fail('loupe', at + ' padDrop_', 'the loupe was left on after padDrop_');
        await T(env, 'touchEnd', [], 300); await sleep(200);
        await reset(env, o.k);
      }
      /* ELSEWHERE -- Q7's 17px squares, a FREEHAND stroke with no pause -- up from the touch and following (359). */
      const q = await open(env, Q7, at);
      if (q) {
        const c = q.c, x0 = c.ink.l + c.ink.w * 0.45, y0 = c.ink.t + c.ink.h * 0.55;
        await loupeWatch(env);
        begin(env); await T(env, 'touchStart', [pt(x0, y0)], 0);
        const fr = []; for (let i = 1; i <= 60; i++) fr.push([pt(x0 + i * 1.5 + Math.sin(i / 3) * 6, y0 - i + Math.cos(i / 4) * 5)]);
        await stream(env, fr.slice(0, 8), 16);
        const early = await isOn();
        await stream(env, fr.slice(8), 16, 8 * 16);
        const lw = await loupeRead(env);
        await T(env, 'touchEnd', [], 61 * 16); await sleep(300);
        const after = await isOn();
        if (!early) fail('loupe', at + ' Q7 freehand', 'the loupe was not up 130ms into a freehand stroke on a coarse grid — wanted from the touch');
        if (!lw.frames || lw.follow / lw.frames < 0.95) fail('loupe', at + ' Q7 freehand', `the loupe followed the finger in ${lw.follow} of ${lw.frames} frames — under 95%`);
        if (after) fail('loupe', at + ' Q7 freehand', 'the loupe was left on after the lift');
        console.log(`  loupe ${at} Q7 freehand: up at 130ms ${early}, followed ${lw.follow}/${lw.frames}`);
        await reset(env, q.k);
      }
    }

    /* ---- samples, with the loupe open: the pen's budgets hold while it follows -- 0 forced layouts, 2 live writes a frame,
       painted in the first frame -- the loupe being written only in the pen's frame ---- */
    if (want('samples') && W === 390) {
      const o = await open(env, FINE, at);
      if (o) {
        const c = o.c, Lx = c.ink.l + c.ink.w * 0.15, Rx = c.ink.l + c.ink.w * 0.85, y0 = c.ink.t + c.ink.h * 0.5, fr = [];
        for (let i = 1; i <= 240; i++) fr.push([pt(Lx + (Rx - Lx) * i / 240, y0 + Math.sin(i / 12) * c.ink.h * 0.2)]);
        await env.page.evaluate(() => { const M = window.__pm; M.reads = []; M.writes = []; M.dur = []; M.t0s = []; M.t1s = []; M.dw = []; M.fw = 0; M.on = true;
          window.__fr = []; window.__ft = []; window.__fw = []; window.__lup = 0;
          const tick = t => { if (!M.on) return; window.__fr.push(t); window.__ft.push(performance.now()); window.__fw.push(M.fw); M.fw = 0; if (document.querySelector('body > .pad-loupe.on')) window.__lup++; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
        await traceStart(env);
        begin(env);
        await T(env, 'touchStart', [pt(Lx, y0)], 0);
        await sleep(200);
        await stream(env, fr, 8, 200);
        await T(env, 'touchEnd', [], 200 + 241 * 8);
        await sleep(600);
        const tr = await traceEnd(env);
        const m = await env.page.evaluate(() => {
          const M = window.__pm; M.on = false;
          const ft = window.__ft;
          let same = 0, n = 0;
          M.t1s.forEach((t1, i) => {
            const w = M.dw.find(x => x >= M.t0s[i]);
            if (w === undefined) return;
            n++;
            const first = ft.find(x => x >= t1), wf = w <= t1 ? first : ft.filter(x => x <= w).pop();
            if (wf !== undefined && wf === first) same++;
          });
          return { reads: Math.max(0, ...M.reads), writes: M.writes.reduce((a, b) => a + b, 0), fw: Math.max(0, ...window.__fw), fwn: window.__fw.length, same, n, lup: window.__lup };
        });
        const where = at + ' with the loupe open';
        if (!m.lup) fail('samples', where, 'the loupe was never on — its cost was NOT measured');
        if (m.reads > 1) fail('samples', where, `a pen event read the ink's box ${m.reads} times`);
        if (m.writes) fail('samples', where, `${m.writes} path write(s) inside pen events`);
        if (m.fw > FRAME_WRITES_MAX) fail('samples', where, `a frame wrote ${m.fw} live \`d\`s — at most ${FRAME_WRITES_MAX}`);
        if (!m.n) fail('samples', where, 'no event was followed by a live path write');
        else if (m.same / m.n < PAINTED_MIN) fail('samples', where, `painted in the first frame for ${Math.round(m.same / m.n * 100)}% of ${m.n} events — under ${PAINTED_MIN * 100}%`);
        if (!tr.n) fail('samples', where, 'the trace held no pointermove dispatch');
        else if (tr.forced) fail('samples', where, `${tr.forced} of ${tr.n} pen pointermoves forced a layout — the loupe written inside the event?`);
        console.log(`  samples ${where}: loupe on in ${m.lup} frames, forced layouts ${tr.forced} of ${tr.n}, at most ${m.fw} live write(s) a frame, painted in the first frame ${m.n ? Math.round(m.same / m.n * 100) : '-'}% of ${m.n}`);
        await reset(env, o.k);
      }
    }
    if (env.errs.length) fail('ERRORS', at + ' placements', env.errs.slice(0, 3).join(' | '));
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await env.ctx.close();
  }

  /* SHORT STROKES ALWAYS INK (368): a mouse's and a stylus's tick, arrowhead pair, cross and click, on a card and the board -- each stored down to up and seen. A finger's tick stays 357's dot */
  if (want('short')) for (const [W, H] of [[390, 844], [820, 1180]]) {
    const at = `${W}x${H}`;
    const env = await boot(browser, W, H, port);
    /* SEEN: the pixels round the mark, before and after, compared in the page */
    const grab = async q => (await env.page.screenshot({ clip: { x: q[0] - 14, y: q[1] - 14, width: 28, height: 28 } })).toString('base64');
    const inked = (a, b) => env.page.evaluate(async ([a, b]) => {
      const px = async s => { const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob()); const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d'); x.drawImage(bm, 0, 0); return x.getImageData(0, 0, bm.width, bm.height).data; };
      const A = await px(a), B = await px(b);
      let n = 0;
      for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 60) n++;
      return n;
    }, [a, b]);
    const surfaces = [['card', async () => { const o = await open(env, Q7, at); return o ? { k: o.k, c: o.c, get: cardBox, sel: CARD } : null; }],
                      ['board', async () => { let b = await board(env); if (b) { await reset(env, b.k); b = await arm(env, b, board); } if (!b) fail('REACH', at, 'the board could not be armed for short'); return b ? { k: b.k, c: b, get: board, sel: BOARD } : null; }]];
    for (const [surf, get] of surfaces) {
      const o = await get();
      if (!o) continue;
      const ink = o.c.ink, U = q => [Math.round((q[0] - ink.l) / ink.w * 340), Math.round((q[1] - ink.t) / ink.h * 340)];
      const P0 = [ink.l + ink.w * 0.35, ink.t + ink.h * 0.45];
      const off = (q, d) => [q[0] + d[0], q[1] + d[1]];
      const Lsh = Math.round(Math.min(100, ink.w * 0.3));
      /* each mark: its strokes, each a list of offsets from P0 in px -- the first the press, the last the release */
      const MARKS = {
        tick: [[[0, 0], [2, 2], [3, 3], [4, 0], [5, -3]]],
        arrow: [Array.from({ length: 21 }, (_, i) => [Math.round(-Lsh + Lsh * i / 20), 0]), [[0, 0], [-3, -2], [-6, -5]], [[0, 0], [-3, 2], [-6, 5]]],
        cross: [[[0, 0], [1, 1], [2, 2], [3, 3]], [[3, 0], [2, 1], [1, 2], [0, 3]]],
        dot: [[[0, 0]]],
      };
      for (const kind of ['mouse', 'pen']) for (const name of Object.keys(MARKS)) {
        const strokes = MARKS[name], where = `${at} ${surf} ${kind} ${name}`;
        const before = await grab(P0);
        for (const s of strokes) {
          const q = s.map(d => off(P0, d));
          await MO(env, 'mousePressed', q[0][0], q[0][1], kind, 1); await sleep(16);
          for (let i = 1; i < q.length; i++) { await MO(env, 'mouseMoved', q[i][0], q[i][1], kind, 1); await sleep(16); }
          await MO(env, 'mouseReleased', q[q.length - 1][0], q[q.length - 1][1], kind, 0); await sleep(120);
        }
        await sleep(300);
        const r = await look(env, o.k, o.sel), seen = await inked(before, await grab(P0));
        if (r.stored.length !== strokes.length) fail('short', where, `${strokes.length} stroke(s) drawn, ${r.stored.length} stored: ${JSON.stringify(r.stored).slice(0, 140)}`);
        else strokes.forEach((s, n) => {
          const st = r.stored[n], a = U(off(P0, s[0])), z = U(off(P0, s[s.length - 1])), m = st.length;
          const near = (p, x, y) => Math.abs(p[0] - x) <= 1 && Math.abs(p[1] - y) <= 1;
          if (s.length > 1 && m < 4) fail('short', where, `stroke ${n + 1} kept ${m / 2} point(s) -- a moved stroke keeps its down and its up point: ${JSON.stringify(st)}`);
          /* a click on a card's grid is a plotted point, put on the intersection as a finger's is (357) */
          if (name === 'dot' && surf === 'card') { if (m !== 2 || Math.hypot((st[0] - a[0]) * ink.w / 340, (st[1] - a[1]) * ink.h / 340) > 20) fail('short', where, `a click stored ${JSON.stringify(st)}, clicked at ${a}`); return; }
          if (!near(a, st[0], st[1])) fail('short', where, `stroke ${n + 1} starts at ${st.slice(0, 2)}, pressed at ${a}`);
          if (!near(z, st[m - 2], st[m - 1])) fail('short', where, `stroke ${n + 1} ends at ${st.slice(-2)}, released at ${z}`);
        });
        if (r.paths !== r.stored.length) fail('short', where, `${r.stored.length} stored, ${r.paths} drawn`);
        if (seen < 6) fail('short', where, `the mark changed ${seen} screen pixels round it -- not visible`);
        say(`short ${where}: ${JSON.stringify(r.stored).slice(-80)}, ${seen} px changed`);
        await reset(env, o.k);
      }
      /* THE FINGER, UNCHANGED: on a card its 5px tick is 357's placement, one point; on the board it is kept as the finger went */
      {
        const q = MARKS.tick[0].map(d => off(P0, d));
        begin(env);
        await T(env, 'touchStart', [pt(q[0][0], q[0][1])], 0);
        await stream(env, q.slice(1).map(p => [pt(p[0], p[1])]), 16);
        await T(env, 'touchEnd', [], q.length * 16 + 8);
        await sleep(400);
        const r = await look(env, o.k, o.sel), st = r.stored[0] || [];
        if (r.stored.length !== 1) fail('short', `${at} ${surf} finger tick`, `stored ${JSON.stringify(r.stored).slice(0, 100)} -- wanted one mark`);
        else if (surf === 'card' && st.length !== 2) fail('short', `${at} card finger tick`, `a finger's 5px tick stored ${st.length / 2} points -- 357 keeps it a placed dot`);
        say(`short ${at} ${surf} finger tick: ${JSON.stringify(r.stored)}`);
        await reset(env, o.k);
      }
      console.log(`  short ${at} ${surf}: a tick, an arrowhead pair, a cross and a click from a mouse and a stylus, each stored end to end and seen`);
    }
    if (env.errs.length) fail('ERRORS', at + ' short', env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* THE CALLOUT IS READ FROM THE STYLESHEET ITSELF: Chromium drops `-webkit-touch-callout`, a property it
     does not know, so no computed style can say it is there (check/swipe.js 8e's precedent). */
  if (want('hold')) {
    const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
    const rule = /\.pane:has\(\.qpad\.is-drawing\),\s*\.qpad\.is-drawing\s*\{[^}]*-webkit-touch-callout:\s*none[^}]*user-select:\s*none/.test(css)
      || /\.pane:has\(\.qpad\.is-drawing\),\s*\.qpad\.is-drawing\s*\{[^}]*user-select:\s*none[^}]*-webkit-touch-callout:\s*none/.test(css);
    if (!rule) fail('hold', 'style.css', 'no rule makes the armed pane and pad unselectable with no callout');
  }

  await browser.close();
  server.close();
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  if (!reached) found.push('REACH: no board and no card was reached — nothing was checked');
  if (found.length) {
    console.log(`\npen: ${found.length} finding(s) in ${secs}s${ONLY.length ? ' (only ' + ONLY.join(',') + ')' : ''}`);
    found.forEach(f => console.log('  FAIL  ' + f));
    process.exit(1);
  }
  console.log(`\npen: OK — every gesture kept what was drawn and nothing else, in ${secs}s${ONLY.length ? ' (only ' + ONLY.join(',') + ')' : ''}`);
})().catch(e => { console.log('pen: the check itself failed — ' + (e && e.stack || e)); process.exit(1); });
