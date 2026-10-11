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
     samples  a 1,200-sample zigzag at 8ms, 4x CPU: at least 95% of the distinct samples kept (about a third
              were, before); Q7's 120-sample drag keeps 114 or more; ONE box read per pen event and no path
              written inside one (the budget -- counted, not timed); the live chunks, at a frame, are exactly
              `padPath_` of the points so far, and the path after the lift is `padPath_` of what was stored.
              Printed, not judged: the handler's p50/p95, the frames over 33ms, and how long from an event
              to the path's next write
     round    a fast circle (one turn in 200ms and in 120ms) is stored with no chord longer than 1.5 x its
              share of the circle, and on Q7 is DRAWN within 1.5px of round; a STARVED circle -- nine events a
              turn, what an iPad without coalesced events gives -- is drawn within 1.5px of round between its
              ends, where its polygon was 6% of the radius off, on the board and on Q7

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
/* THE PEN'S POINTERMOVE AT 4x CPU, p95: 3.3-3.4ms before note 338, a forced layout and a whole path per event;
   1.6-2.6ms after, run to run on this shared machine (p50 0.2-0.6). The COUNTED budgets -- one box read per
   event, no path written inside one -- are the exact ones and catch that regression by name; this time is the
   backstop for a cost nobody counted, set where the old pen's p95 sat so noise does not cross it. */
const PEN_P95_MS = Number(process.env.PEN_P95_MS || 3.0);
const PAD_CHUNK_EXPECT = 130;

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
    /* THE BUDGET, COUNTED: inside the document's pointermove listeners while a stroke is drawn, how many times
       the ink's box was read and how many `d`s were written -- and, timed for the record, how long they took
       and when the live path was next written. A capture listener added now runs after the app's own capture
       listeners and before the pen's; a bubble listener added now runs after the pen's. */
    const M = window.__pm = { on: false, reads: [], writes: [], dur: [], t0s: [], t1s: [], dw: [] };
    let inH = false, r = 0, wr = 0, t0 = 0;
    const gbcr = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () { if (inH && this.classList && this.classList.contains('qpad-ink')) r++; return gbcr.call(this); };
    const sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (n, v) { if (inH && n === 'd') wr++; return sa.call(this, n, v); };
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

/* A CIRCLE OF RADIUS r ROUND (cx, cy), one turn in n samples `dt` ms apart, from angle 0. */
async function circle(env, cx, cy, r, n, dt) {
  const fr = [];
  for (let i = 1; i <= n; i++) { const a = 2 * Math.PI * i / n; fr.push([pt(cx + r * Math.cos(a), cy + r * Math.sin(a))]); }
  await T(env, 'touchStart', [pt(cx + r, cy)], 0);
  await stream(env, fr, dt);
  await T(env, 'touchEnd', [], n * dt + 8);
}
/* HOW FAR THE DRAWN PATH IS FROM ROUND, ON THE SCREEN: the last stroke's `<path>` sampled with
   `getPointAtLength`, between its two end segments (a stroke's ends take the chord's direction -- 338), each
   point taken to the screen through the ink's box and measured against the circle the finger drew. */
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
    if (!['two', 'palm', 'large', 'tap', 'cancel', 'lost', 'bar', 'drift', 'inv', 'samples', 'round'].some(want)) break;
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
      await env.page.evaluate(() => { const M = window.__pm; M.reads = []; M.writes = []; M.dur = []; M.t0s = []; M.t1s = []; M.dw = []; M.on = true;
        /* EACH FRAME'S CALLBACKS BEGIN: `performance.now()` in a frame callback asked for before any of the pen's,
           so a write in a frame's callbacks comes after its tick and a write in an event handler before the next. */
        window.__fr = []; window.__ft = []; const tick = t => { if (!M.on) return; window.__fr.push(t); window.__ft.push(performance.now()); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
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
                 stored: st, drawn: paths.length === 1 && paths[0].getAttribute('d') === padPath_(st[0] || [], ka) };
      }, k);
      const q = (a, p) => { if (!a.length) return null; const z = a.slice().sort((x, y) => x - y); return Math.round(z[Math.min(z.length - 1, Math.floor(p * z.length))] * 100) / 100; };
      if (mid.points < distinct * 0.95) fail('samples', at, `the zigzag kept ${mid.points} of ${distinct} distinct samples — under 95%`);
      if (!mid.same) fail('samples', at, `a frame after the last move the ${mid.chunks} live chunk(s) are not padPath_ of the points so far`);
      if (mid.points > PAD_CHUNK_EXPECT && mid.chunks < 2) fail('samples', at, `${mid.points} points drawn as ${mid.chunks} live path(s) — the frame rewrites the whole stroke`);
      if (m.reads > 1) fail('samples', at, `a pen event read the ink's box ${m.reads} times — the budget is one, shared by its samples`);
      if (m.writes) fail('samples', at, `${m.writes} path write(s) inside pen events — the path is written once a frame`);
      if (m.stored.length !== 1 || !m.drawn) fail('samples', at, 'after the lift the board does not draw padPath_ of the one stroke stored');
      const p95 = q(m.dur, 0.95), slow = m.gaps.filter(g => g > 33).length;
      /* JUDGED ONLY ON A MACHINE THAT KEPT UP: more than 8% of frames over 33ms says the processor was taken by
         something else, and then a time measures the neighbours -- printed, not judged (it passed re-run alone). */
      if (slow > m.gaps.length * 0.08) console.log(`  NOTE samples ${at}: ${slow} of ${m.gaps.length} frames over 33ms — the machine was busy, so the handler's ${p95}ms p95 is printed and not judged`);
      else if (p95 > PEN_P95_MS) fail('samples', at, `the pen's pointermove p95 is ${p95}ms at 4x — over the ${PEN_P95_MS}ms backstop (it was 3.3-3.4 before 338)`);
      const line = `zigzag ${at} 4x: ${m.moves} pen events, ${mid.points} of ${distinct} distinct samples kept (${Math.round(mid.points / distinct * 100)}%), ${mid.chunks} chunk(s) live; `
        + `handler p50 ${q(m.dur, 0.5)} / p95 ${p95} / max ${q(m.dur, 1)}ms; event -> next path write p50 ${q(m.lat, 0.5)} / p95 ${q(m.lat, 0.95)}ms, `
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
          console.log(`  ${name} ${at} board 4x: ${r.points} points stored, longest chord ${r.chord}px, ${r.worst}px off round between its ends${r.curves ? ', drawn with curves' : ''}`);
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

    await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
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
      console.log(`  Q7 ${at} 4x: a 120-sample drag kept ${n} points`);
      await reset(env, k);
    }
    if (want('round') && W === 390) {
      const cx = c.ink.x, cy = c.ink.y, R = Math.min(c.ink.w, c.ink.h) * 0.36;
      await gesture(env, k, CARD, () => circle(env, cx, cy, R, 25, 8));
      let r = await roundness(env, k, CARD, cx, cy, R);
      if (!r) fail('round', at + ' Q7', 'nothing was stored');
      else {
        if (!(r.worst <= 1.5)) fail('round', at + ' Q7', `a 200ms circle is drawn ${r.worst}px off round — wanted 1.5px`);
        console.log(`  circle200 ${at} Q7 4x: ${r.points} points, longest chord ${r.chord}px, drawn ${r.worst}px off round${r.curves ? ', with curves' : ''}`);
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
      if (r) console.log(`  circle200 ${at} Q7 4x, no coalesced events: ${r.points} points, longest chord ${r.chord}px, drawn ${r.worst}px off round${r.curves ? ', with curves' : ''}`);
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
