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
     grip     a thumb gripping the screen's edge pans 40px with a finger (two fingers: nothing), then STAYS DOWN,
              still, while two lines are drawn: both are kept -- a hand gone still is not half of a pan (after review)
     settle   a thumb that rolls 9px as a line starts, a palm on the card that settles 12px, a palm that lands 120ms
              into a line and settles 10px: every line is kept -- a settle is not a second finger (after review)
     phase    a two-finger pan whose second finger reports 5ms out of phase, eight times: nothing, every time
     types    a stylus draws and a palm lands as the primary TOUCH; a finger draws and a mouse clicks beside the
              board: the stylus's line and the finger's line -- "primary" is per kind of pointer (after review)
     pin      on November 2019 1H Q4, a pin held on the compass's centre (and a ruler's end) and a second finger
              swinging round it: nothing stored, as before 338 -- a pin is not a palm (after review) -- and nothing
              either when the pin rolls 6px as the other swings (second review)
     palmtool on the same card, a palm (radius 25) resting on the picture, then a finger uses the pen, the ruler or
              the compass while the palm drifts 6px: never a mark at the palm. The palm down 120ms before: the
              finger's line, every tool; 400ms before: the pen's line, and the ruler's and compass's are the cost
              338 section 4 chose -- by movement a resting palm is a pin (second review)
     hold     a finger held 1.1s on the armed card: nothing selected, and the callout rule in style.css
     inv      the geometry the rules rest on: no zoomed ancestor, the ink's box is the picture's, 16px from the edges
     samples  a 1,200-sample zigzag at 8ms, 4x CPU: at least 95% of the distinct samples kept (about a third
              were, before); Q7's 120-sample drag keeps 114 or more; ONE box read per pen event and no path
              written inside one; NO FORCED LAYOUT inside a pen event, counted from a Chromium trace; at most
              TWO live `d`s written in any frame (the open chunk and one being frozen -- a frame's cost does not
              grow with the stroke); the path PAINTED IN THE FIRST FRAME after the event for 95% of events (no
              latency added); the live chunks, at a frame, are exactly `padPath_` of the points so far, and the
              path after the lift is `padPath_` of what was stored. All counts. Printed, not judged: the
              handler's p50/p95 (wall clock and the trace's thread time), the frames over 33ms, and how long
              from an event to the path's next write
     round    a fast circle (one turn in 200ms and in 120ms) is stored with no chord longer than 1.5 x its
              share of the circle, and on Q7 is DRAWN within 1.5px of round; a STARVED circle -- nine events a
              turn, what an iPad without coalesced events gives -- is drawn within 1.5px of round between its
              ends, where its polygon was 6% of the radius off, on the board and on Q7

   COUNTS AND GEOMETRY ARE PASS OR FAIL; TIMINGS ARE PRINTED. The machine is shared and a frame time is
   noise, but a coalesced sample arrives whatever the frame rate, and "what was stored" is not noise. The first
   build also JUDGED the handler's p95 against a backstop, gated on how many frames ran slow: the review found it
   almost never judged under load, failed once on unchanged code, and passed a mutation that added a frame of
   latency and one that forced a layout per event. Those two are counted now, and the time is printed.
   A section that cannot reach its subject -- no board, the pen not armed, no Q7 -- FAILS saying so.

     node check/pen.js                 everything
     node check/pen.js --only=two,palm some of it, for proving one rule by mutation
     node check/pen.js --verbose       every gesture's numbers, not only the failures
     node check/pen.js --shots         and pictures of what was drawn, for a person to read
   PEN_PORT pins the port; unset, the OS picks a free one. PEN_RATE=1 runs at full speed. PEN_QUERY=pen=sizes loads
   every page with the sizes line up.
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
/* November 2019 Higher, Q4: a construction, so its bar offers a Ruler and a Compass. */
const COMPASS_Q = 'Q-1MA1-1911-1H-4';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.webmanifest': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
/* THE PEN'S POINTERMOVE AT 4x CPU, p95: 3.3-3.4ms before note 338, a forced layout and a whole path per event;
   1.6-2.6ms after on a quiet machine (p50 0.2-0.6). PRINTED BESIDE ITS REFERENCE, NOT JUDGED (after review): the
   exact budgets are counted -- one box read and no path written per event, no forced layout in a trace, two live
   writes a frame, the path painted in the first frame -- and a time measures the neighbours on a shared machine. */
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
    /* THE BUDGET, COUNTED: inside the document's pointermove listeners while a stroke is drawn, how many times
       the ink's box was read and how many `d`s were written -- and, timed for the record, how long they took
       and when the live path was next written. A capture listener added now runs after the app's own capture
       listeners and before the pen's; a bubble listener added now runs after the pen's. */
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
/* NOW, ON THE GESTURE'S OWN CLOCK -- for a stroke planned after waits whose length the machine decides. */
const since = env => Date.now() - (env.t0 || 0);

/* ---------- A CHROMIUM TRACE: FORCED LAYOUTS INSIDE THE PEN'S EVENTS, COUNTED --------------------------------
   A layout or a style recalculation INSIDE a `pointermove`'s dispatch is a read after a write -- the cost 1b took out
   of the pen. Counted from the browser's own trace, so load cannot move it: the review's positive control was
   `?pen=sizes` as first built, 78 forced in 78 events. Thread time (`tdur`) is printed beside the wall clock. */
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

/* A PLAN OF FRAMES, PLAYED ON THE WALL CLOCK -- for gestures where a hand and a finger each do their own thing. A track is
   one contact's `{t, p: [x, y, id, radius]}`, down from its first entry to its last; `plan` merges tracks into frames
   that list every point down at each moment (each contact where it last was), with a frame 8ms after each track's last
   entry from which it is gone. `play` sends them: a point new since the last frame goes down (`touchStart` lists every
   point down), a point gone goes up (`touchEnd` lists the ones that go -- CDP releases the points it lists), the rest
   move. As `stream`, it does not wait for each to be delivered. */
const track = (id, r, from, to, dt, at) => { const o = []; for (let u = 0; from + u <= to + 1e-9; u += dt) o.push({ t: Math.round(from + u), p: [...at(u), id, r] }); return o; };
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
    if (!['two', 'palm', 'large', 'tap', 'cancel', 'lost', 'bar', 'drift', 'grip', 'settle', 'phase', 'types', 'inv', 'samples', 'round'].some(want)) break;
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
          /* CDP's `touchEnd` RELEASES THE POINTS IT LISTS (an empty list releases every one) -- measured by both reviews of
             11 Oct, and the first build had the two orders the wrong way round. So the palm first lists the palm. And the
             order is asked of the pen itself between the two lifts, so a label can never again say the other one. */
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
      /* A THUMB GRIPPING THE SCREEN'S EDGE (radius 11) DOWN FIRST; a finger lands on the board and the two pan 40px
         SIDEWAYS together -- two fingers, nothing. (Sideways: a thumb on the column moving up or down is the browser's own
         scroll, which cancels the thumb's pointer -- measured, the first try of this section.) The finger lifts and the
         THUMB STAYS, still, while two lines are drawn: both kept. The pen as first built held the thumb in the dead
         gesture and drew neither (the review's `stuck.js`). */
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
      /* A TWO-FINGER PAN, 150px UP, WITH THE SECOND FINGER'S REPORTS 5ms OUT OF PHASE -- each finger's moves in their own
         dispatch, as a digitizer scanning them apart sends them. Eight times: judged by when each one's event arrived, the
         review drew 8 pans in 28 at 820 and 1024. Judged at each finger's samples' own time, none. */
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
        /* EACH FRAME'S CALLBACKS BEGIN: `performance.now()` in a frame callback asked for before any of the pen's,
           so a write in a frame's callbacks comes after its tick and a write in an event handler before the next.
           And the live `d`s written since the last tick -- one frame's -- are put down at each. */
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
      if (want('pin')) for (const name of ['compass', 'ruler']) for (const drift of [0, 6]) {
        if (!(await choose('pin', name))) continue;
        /* FINGER 1 ON THE CENTRE, HELD, TREMBLING UNDER A PIXEL; FINGER 2 LANDS 300ms LATER AT THE RADIUS AND SWINGS 270 DEGREES
           ROUND IT IN 60 MOVES 10ms APART (the compass), or slides 40px (the ruler). Nothing stored, as before 338. AND THE
           PIN THAT ROLLS (second review): from the moment finger 2 lands it drifts `drift` px over 300ms, as a fingertip held
           on a point does. Refused the swap, the pin was made the stroke again with 4px to go: a ruler line or a ring of
           radius 8 round itself, at 390 and 820. */
        const cx = c.ink.l + c.ink.w * 0.45, cy = c.ink.t + c.ink.h * 0.5, R0 = 0.28 * Math.min(c.ink.w, c.ink.h);
        const pin = [];
        for (let t = 0; t <= 920; t += 10) pin.push({ t, p: [cx + (t < 300 || !drift ? (t % 20 ? 0.4 : -0.4) : drift * Math.min(1, (t - 300) / 300)), cy, 1, 8] });
        const f2 = name === 'compass' ? track(2, 8, 300, 900, 10, u => { const g = 1.5 * Math.PI * u / 600; return [cx + R0 * Math.cos(g), cy + R0 * Math.sin(g)]; })
          : track(2, 8, 300, 500, 10, u => [cx + R0 + 2 * u / 10, cy]);
        const r = await gesture(env, k, CARD, () => play(env, plan(pin, f2)));
        const what = drift ? `a pin held on the ${name}'s centre that rolled ${drift}px while a second finger moved` : `a pin held on the ${name}'s centre and a second finger moving`;
        if (r.stored.length) fail('pin', at + ' ' + name, `${what} stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing`);
        if (r.live || r.busy || r.touch) fail('pin', at + ' ' + name, 'the pen did not let go after both fingers lifted');
        say(`pin ${at} ${name} drift ${drift} ${JSON.stringify(r.stored).slice(0, 80)}`);
        if (name === 'compass' && !drift) await shot(env.page, `${at}-pin-compass`);
        await reset(env, k);
      }
      /* A PALM (radius 25) RESTING ON THE PICTURE AT (0.85, 0.85), trembling under a pixel for `gap` ms; then a fingertip lands
         at (0.25, 0.4) and draws a 120px ruler line or a pen line, or opens the compass 60px and swings it, while the palm
         drifts 6px in its first 120ms. Never a mark at the palm (the review: the palm's own 7-unit line and a ring of 10
         points round it, the finger's lost). The finger's line at 120ms, every tool, and with the pen at 400ms; with the
         ruler and the compass at 400ms nothing at all -- the cost chosen in 338 section 4, printed and not failed, so that
         a later decision to give tools the palm-first swap back changes only the note and this comment. */
      if (want('palmtool')) for (const name of ['pen', 'ruler', 'compass']) for (const gap of [400, 120]) {
        if (!(await choose('palmtool', name))) continue;
        const pm = [c.ink.l + c.ink.w * 0.85, c.ink.t + c.ink.h * 0.85], f0 = [c.ink.l + c.ink.w * 0.25, c.ink.t + c.ink.h * 0.4];
        const palm = [];
        for (let t = 0; t <= gap; t += 10) palm.push({ t, p: [pm[0] + (t % 20 ? 0.4 : -0.4), pm[1], 1, 25] });
        for (let i = 1; i <= 12; i++) palm.push({ t: gap + 10 * i, p: [pm[0] + 6 * i / 12, pm[1], 1, 25] });
        palm.push({ t: gap + 500, p: [pm[0] + 6, pm[1], 1, 25] });
        const fin = name === 'compass'
          ? track(2, 8, gap, gap + 400, 10, u => { const g = Math.PI * u / 400; return u < 100 ? [f0[0] + 0.6 * u, f0[1]] : [f0[0] + 60 * Math.cos(g - Math.PI / 4), f0[1] + 60 * Math.sin(g - Math.PI / 4)]; })
          : track(2, 8, gap, gap + 300, 10, u => [f0[0] + 0.4 * u, f0[1] + 0.1 * u]);
        const r = await gesture(env, k, CARD, () => play(env, plan(palm, fin)));
        const toU = q => [(q[0] - c.ink.l) / c.ink.w * 340, (q[1] - c.ink.t) / c.ink.h * 340];
        const pu = toU(pm), fu = toU(f0);
        const near = (st, q, d) => { for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - q[0], st[i + 1] - q[1]) < d) return true; return false; };
        const where = `${at} ${name} palm ${gap}ms before`;
        if (r.stored.some(st => near(st, pu, 25))) fail('palmtool', where, `a mark at the PALM: ${JSON.stringify(r.stored).slice(0, 100)} — wanted nothing there`);
        /* THE FINGER'S LINE STARTS WHERE THE FINGER WENT DOWN; the compass's arc is centred there, every point 60px off it. */
        const sx = c.ink.w / 340, sy = c.ink.h / 340;
        const atFinger = st => {
          if (name !== 'compass') return st.length >= 2 && Math.hypot(st[0] - fu[0], st[1] - fu[1]) < 4;
          for (let i = 0; i + 1 < st.length; i += 2) if (Math.abs(Math.hypot((st[i] - fu[0]) * sx, (st[i + 1] - fu[1]) * sy) - 60) > 6) return false;
          return st.length >= 8;
        };
        if (r.stored.some(st => !atFinger(st))) fail('palmtool', where, `a mark that is not the finger's: ${JSON.stringify(r.stored).slice(0, 100)}`);
        const lost = name !== 'pen' && gap > 200;
        if (!lost && (r.stored.length !== 1 || !atFinger(r.stored[0]))) fail('palmtool', where, `stored ${JSON.stringify(r.stored).slice(0, 100)} — wanted the finger's ${name} line`);
        if (r.live || r.busy || r.touch) fail('palmtool', where, 'the pen did not let go after both lifted');
        say(`palmtool ${where} ${lost && !r.stored.length ? '(the cost: the finger\'s line lost) ' : ''}${JSON.stringify(r.stored).slice(0, 80)}`);
        await reset(env, k);
      }
      await env.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
    if (env.errs.length) fail('ERRORS', at + ' pin', env.errs.slice(0, 3).join(' | '));
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
