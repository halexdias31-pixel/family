#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/pen.js

   A FINGER ON THE PEN: WHAT IT KEEPS, AND WHAT IT LETS ONTO THE PAGE (docs/history/338).

   *"they are just using their fingers"* -- the owner, 11 Oct, asked what the children draw with. The
   brief before it: *"drawing or editing with a finger (especially on tablets like an iPad or
   touchscreens) feels finicky, imprecise, and frustrating"*, naming *"accidental stray ink blobs while
   trying to pan"*.

   `js/check-flow.js` ASKS EVERY RULE OF THE CONTACT MODEL that jsdom can see. What only a browser can say
   is asked here, with REAL TOUCH through CDP (`Input.dispatchTouchEvent`, each contact its own id and
   radius, each move its planned timestamp) on the Tools whiteboard and on June 2024 1F Q7's card:

     two      a two-finger tap, pan and pinch on the armed board store and draw nothing, and the column,
              the page and the lock stay where they were
     pinchoff a pinch with one finger off the 180px figure at 320 (it lands on the card, not the ink)
     palm     a palm (radius 25) first, then a fingertip draws: the finger's line and nothing of the palm
     large    one large contact alone still draws -- size decides nothing until a device is measured
     tap      one fingertip tap is a dot
     cancel   a `touchCancel` 50ms in withdraws; one after 500ms and 200px keeps the line
     lost     a contact whose lift never came, then a real swipe off the pad: the column moves
     bar      a palm on Undo during a stroke, lifted before and after the finger: nothing undone
     drift    a palm down first beside the pad (the primary pointer), a finger draws, the palm drifts 30px
              sideways: the column does not move and the stroke is kept
     hold     a finger held 1.1s on the armed card: nothing selected, and the callout rule in style.css
     inv      the geometry the rules rest on: no zoomed ancestor, the ink's box is the picture's, 16px from the edges

   COUNTS AND GEOMETRY ARE PASS OR FAIL; TIMINGS ARE PRINTED. The machine is shared and a frame time is
   noise, but a coalesced sample arrives whatever the frame rate, and "what was stored" is not noise.
   A section that cannot reach its subject -- no board, the pen not armed, no Q7 -- FAILS saying so.

     node check/pen.js                 everything
     node check/pen.js --only=two,palm some of it, for proving one rule by mutation
     node check/pen.js --verbose       every gesture's numbers, not only the failures
     node check/pen.js --shots         and pictures of what was drawn, for a person to read
   PEN_PORT pins the port; unset, the OS picks a free one.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.PEN_PORT || 0);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const VERBOSE = process.argv.includes('--verbose');
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
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.webmanifest': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof initWhiteboard === 'function', null, { timeout: 90000 });
  await sleep(1200);
  const cdp = await ctx.newCDPSession(page);
  /* WHAT THE GRID TOOK DURING A GESTURE: a listener on the window registered after overworld.js's, so it
     reads `SWIPE` after the grid has decided. */
  await page.evaluate(() => {
    window.__pen = { axis: null };
    addEventListener('pointermove', () => { try { if (SWIPE.axis) window.__pen.axis = SWIPE.axis + (SWIPE.scroll ? ' (pane)' : ''); } catch (e) {} });
  });
  return { ctx, page, cdp, errs, W, H };
}

/* ---------- THE FINGERS ------------------------------------------------------------------------------
   `T` sends one touch frame with its planned time. `stream` sends a list of frames on the wall clock
   WITHOUT waiting for each to be delivered -- a digitizer keeps reporting while the page is busy, which is
   what makes the renderer fold samples together under load, as a phone's does. */
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

/* ---------- THE BOARD ------------------------------------------------------------------------------- */
async function board(env) {
  return env.page.evaluate(async () => {
    if (AT !== 'tools') go('tools', false, true);
    goPage('tools', widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard'), true);
    for (let i = 0; i < 100; i++) {
      const busy = (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length) || (typeof AFTER_SLIDE !== 'undefined' && AFTER_SLIDE)
        || (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && performance.now() < SETTLE_ON.until);
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

/* THE QUESTION CARD, its face turned to the drawing -- the way `qcard.js` in note 338's map opened it. */
async function card(env, row) {
  const k = await env.page.evaluate(async r => {
    go('stuff', false, true);
    const hit = stuffItemsAll_().find(x => x.row && x.row.row_id === r);
    if (!hit) return null;
    STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
    paintStuff(true);
    await new Promise(z => setTimeout(z, 600));
    const h2 = stuffFiltered().find(x => x.row && x.row.row_id === r) || hit;
    padFaceSet_(padKey_(h2), 'draw');
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
    if (!['two', 'palm', 'large', 'tap', 'cancel', 'lost', 'bar', 'drift', 'inv'].some(want)) break;
    const env = await boot(browser, W, H, port);
    let b = await board(env);
    if (!b) { fail('REACH', at, 'no whiteboard on Tools'); await env.ctx.close(); continue; }
    await reset(env, b.k);
    b = await arm(env, b, board);
    if (!b) { fail('REACH', at, 'the board could not be armed with a real tap on its lock'); await env.ctx.close(); continue; }
    reached++;
    const k = b.k;
    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
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
          if (order === 'palm first') {
            await T(env, 'touchEnd', [pt(a.x + 60, a.y, 1)], 230); await sleep(60);
            await T(env, 'touchEnd', [], 290);
          } else {
            await T(env, 'touchEnd', [pt(u.x, u.y, 2, 25)], 230); await sleep(60);
            await T(env, 'touchEnd', [], 290);
          }
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
    if (!['pinchoff', 'hold', 'inv'].some(want)) break;
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

    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
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
