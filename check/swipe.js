#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/swipe.js

   A FINGER ON THE GLASS: DOES THE CARD GO WHERE IT WAS SENT, AND ONLY THERE?

   ASKED FOR ON 5 OCTOBER: *"can you make swiping and so on more stable. like the widgets and all. a
   more pleasant experience. also focused widgets should be in centre of screen. also those widgets
   not in focus should actually look slightly out of focus effect."*

   `check/press.js` ALREADY SWIPES — with a mouse across every column and with real touch from the
   middle of a pane, from a control, twice in quick succession on the same axis. What it never asked,
   and the lab that measured "unstable" on 5 October found (history: pending-swipefocus), is the
   rest of what a thumb does:

     · a peek and a change of mind: 70px held still, or a drag pulled part of the way back and let go moving
       home — both turned the page, 8 times in 8;
     · a diagonal on a column with nowhere to go up or down — 45° on Saved did nothing, 12 in 12;
     · a second flick on the OTHER axis while the first is still settling — the first one's slide
       stopped dead and the card jumped 81–614px in one frame;
     · a tap on a card still sliding — it pressed whatever happened to be under the finger;
     · a text field focused and then swiped away — the keypad stayed up over a card that had gone;
     · and, found while centring them, an answer pressed on the funnel moving the search box down the
       screen, because the card was put back in the middle every time its height changed;
     · and the release itself: every page turn restyled all ~5,000 elements of the document.

   AND THE TWO THINGS THE OWNER ASKED TO SEE: the card in front sits in the middle of the screen,
   within a pixel, on every column at 320 and 390 wide; and the cards beside it carry the
   out-of-focus look while it does not — easing with the finger mid-drag, and dimmed rather than
   blurred for somebody who asked for less motion.

   REAL TOUCH THROUGH CDP, every move carrying the time it was MEANT to happen, so the speed the app
   fits from `e.timeStamp` is the finger's even when a busy machine delivers late — the lesson
   `check/press.js` records about its first flick being a slow drag. Outcomes are asked, not frame
   timings: on this shared machine milliseconds are noise and "which page did it land on" is not.

   EVERYTHING FAILS THAT IS FOUND, and a rule that could not reach its subject — no Tools column, no
   page to turn to, no field to focus — fails too, saying so. A check that cannot reach what it
   measures is not a pass.

     node check/swipe.js            both widths
     node check/swipe.js --verbose  every gesture, not only the failures
     node check/swipe.js --only=cell,focus --width=390
                                    some of it: cell folded axis tile slide other centre focus
                                    field hold widgets cost reduced — for proving one rule by mutation
                                    without waiting six minutes for all of them. A run narrowed
                                    this way says so, and is never what the roster runs.
   SWIPE_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.SWIPE_PORT || 0);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const VERBOSE = process.argv.includes('--verbose');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
/* THE TWO PHONES THE OWNER'S FAMILIES HOLD: a current iPhone and the small one. */
const WIDTH = Number((process.argv.find(a => a.startsWith('--width=')) || '').split('=')[1] || 0);
const SIZES = [[390, 844], [320, 568]].filter(s => !WIDTH || s[0] === WIDTH);
const ONLY = ((process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const want = k => !ONLY.length || ONLY.indexOf(k) !== -1;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.webmanifest': 'application/json' };

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT_WANTED, () => ok(s));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- THE FINGER ----------------------------------------------------------------------------
   `path(t)` gives the offset at t in 0..1 over `dur` ms. Moves go every 8ms WITHOUT waiting for the
   last to be delivered — a phone keeps reporting while the page is busy — and each carries its planned
   time. `end: false` leaves the finger down so a rule can look mid-drag. */
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
  if (end) { ms += 4; const wake = T0 + ms - Date.now(); if (wake > 1) await sleep(wake); await send('touchEnd', 0, 0, ms); }
  return { lift: () => send('touchEnd', 0, 0, Date.now() - T0) };
}
/* THE SHAPES A THUMB MAKES. `flick` accelerates to the lift; `still` decelerates to a stop and holds;
   `back` goes out and is pulled part of the way home, still moving home as it lifts. */
const ease = { flick: t => t * t, still: t => 1 - (1 - t) * (1 - t) };
const G = {
  flick: (dx, dy, dur = 100) => ({ dur, path: t => [dx * ease.flick(t), dy * ease.flick(t)] }),
  still: (dx, dy, dur = 420, hold = 320) => ({ dur, hold, path: t => [dx * ease.still(t), dy * ease.still(t)] }),
  /* PULLED BACK TO A POINT STILL PAST THE BAR — 120px is beyond a third of every step this asks
     (100px across at 390, 89px down Games), so only the speed home can stop it turning. Pulled back
     to 80, as the lab first did, it fell under the bar the release now uses and proved nothing about
     the speed: the mutant without `backing` passed. */
  back: (dx, dy, out = 180, home = 120) => ({ dur: 450, path: t => {
    const k = t < 0.667 ? out * ease.still(t / 0.667) : out - (out - home) * ((t - 0.667) / 0.333);
    return [Math.sign(dx) * k, Math.sign(dy) * k];
  } }),
  diag: (deg, sx, len = 160) => ({ dur: 180, path: t => {
    const r = deg * Math.PI / 180; return [sx * Math.cos(r) * len * t, -Math.sin(r) * len * t];
  } }),
  drift: (sy, sx) => ({ dur: 320, path: t => [sx * 90 * t * t, sy * 220 * t] }),
};

/* ---------- IN THE PAGE ---------------------------------------------------------------------------
   Installed before any app script: every action that RUNS (the dispatcher's own table, wrapped once
   the app has built it), and every axis the grid claims during a gesture, read after the app's own
   `pointermove` has decided it. */
function RECORDER() {
  const R = window.__sw = { acts: [], axes: [] };
  R.arm = () => {
    Object.keys(ACTIONS).forEach(k => {
      const f = ACTIONS[k];
      if (f.__sw) return;
      const w = function () { R.acts.push({ act: k, at: performance.now() }); return f.apply(this, arguments); };
      w.__sw = 1; ACTIONS[k] = w;
    });
    addEventListener('pointermove', () => {
      try { if (SWIPE.axis && R.axes[R.axes.length - 1] !== SWIPE.axis) R.axes.push(SWIPE.axis); } catch (e) {}
    }, { passive: true });
  };
  R.reset = () => { R.acts = []; R.axes = []; };
  /* ON A COLUMN AND PAGE, AND STILL. Instant, then waited out until nothing on the column is moving —
     not a fixed sleep, which is either too short on a loaded machine or slow everywhere else. */
  R.place = async (col, p) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    if (typeof closeSheet === 'function') try { closeSheet(); } catch (e) {}
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    go(col, false, true);
    await wait(60);
    if (p !== undefined && AXES.y.count(col) > 1) goPage(col, p, true);
    return R.still(col);
  };
  R.still = async col => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const t0 = performance.now();
    await wait(120);
    /* STILL MEANS NOTHING LEFT TO HAPPEN: no column moving, no pane holding a layer, no slide window
       open, no placement booked, and nothing booked for after the slide — a widget started 300ms after
       arriving can grow its card, and the column re-centres on it then, not before. */
    for (;;) {
      const host = document.getElementById('s-' + (col || AT));
      const moving = host && host.getAnimations().some(a => a.playState === 'running');
      const panes = [...document.querySelectorAll('#screen .pane')].some(g => g.style.willChange === 'filter');
      /* AND NO PICTURE ON THE CARD IN FRONT STILL ON ITS WAY. A post reserves 4:5 while its photograph
         loads and takes the photograph's own shape when it lands; the column re-centres on that in the
         `ResizeObserver`'s delivery, which is the frame AFTER the layout a measurement forces. One full
         run caught the feed's first card 40.7px low in exactly that frame. */
      const pics = host && [...host.querySelectorAll(':scope > .page.on img')].some(i => !i.complete);
      const booked = !!PLACE_FRAME || !!AFTER_SLIDE || AFTER_SLIDE_JOBS.size > 0 || !!pics
        || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length > 0);
      if ((!moving && !panes && !booked && performance.now() > SLIDE_UNTIL) || performance.now() - t0 > 6000) break;
      await wait(60);
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { AT, P: PAGE[AT] || 0 };
  };
  /* WHERE A THUMB CAN LAND AND THE GRID WILL TAKE IT: bare card, not a control, nothing under it that
     scrolls — the spot `check/press.js`'s own touch rules look for. `on` asks for a control instead. */
  R.spot = (on, ys, xs) => {
    const host = document.getElementById('s-' + AT);
    const pane = host && host.querySelector(':scope > .page.on > .pane');
    if (!pane) return null;
    const pr = pane.getBoundingClientRect();
    if (on) {
      for (const el of pane.querySelectorAll(on)) {
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 14 || r.top < 40 || r.bottom > innerHeight - 30) continue;
        const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
        const hit = document.elementFromPoint(x, y);
        if (hit && el.contains(hit)) return { x, y, act: el.getAttribute('data-do') || el.tagName };
      }
      return null;
    }
    const top = Math.max(60, pr.top), bot = Math.min(pr.bottom, innerHeight - 40);
    for (const fy of ys || [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8]) {
      for (const fx of xs || [0.5, 0.35, 0.65, 0.25, 0.75]) {
        const x = Math.round(pr.left + pr.width * fx), y = Math.round(top + (bot - top) * fy);
        const el = document.elementFromPoint(x, y);
        if (!el || !pane.contains(el)) continue;
        if (el.closest('[data-do], select, textarea, input, canvas, button, a, label, video, iframe, [data-noswipe]')) continue;
        if (scrollHost_(el, 'y', 1) || scrollHost_(el, 'y', -1) || scrollHost_(el, 'x', 1) || scrollHost_(el, 'x', -1)) continue;
        return { x, y };
      }
    }
    return null;
  };
}

async function boot(browser, W, H, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && /^\[[a-z0-9-]+\]/i.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.addInitScript(() => {
    window.confirm = () => true; window.alert = () => {}; window.prompt = () => ''; window.open = () => null;
    window.print = () => window.dispatchEvent(new Event('afterprint'));
  });
  await page.addInitScript(RECORDER);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof placeGrid === 'function' && typeof SLIDE_UNTIL === 'number'
    && document.querySelector('#s-tools .page') && document.querySelector('#s-games .page'), null, { timeout: 30000 });
  await sleep(1500);
  await page.evaluate(() => window.__sw.arm());
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp, errs };
}

let PORT = 0;
const found = [];
const said = [];
const fail = (rule, where, msg) => found.push({ rule, where, msg });
const note = s => { if (VERBOSE) console.log('  ' + s); said.push(s); };

/* ONE GESTURE: placed, a spot found, the finger run, the outcome read. */
/* `p` MAY BE A LIST: the first of those pages with a spot the grid would take is used — a card that
   is all controls (the cheat-sheet maker at 390) has nowhere a thumb can land to swipe it, and that
   is the card, not the grid. */
async function gesture(env, o) {
  const { page, cdp } = env;
  let s0 = null, sp = null;
  for (const p of [].concat(o.p === undefined ? [undefined] : o.p)) {
    s0 = await page.evaluate(([c, p]) => window.__sw.place(c, p), [o.col, p]);
    sp = await page.evaluate(([on, ys, xs]) => window.__sw.spot(on, ys, xs), [o.on || null, o.ys || null, o.xs || null]);
    if (sp) break;
  }
  if (!sp) return { err: `no spot on ${o.col} pages ${[].concat(o.p)} the grid would take${o.on ? ' (' + o.on + ')' : ''}` };
  await page.evaluate(() => window.__sw.reset());
  await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, o.g));
  const s1 = await page.evaluate(() => window.__sw.still());
  const rec = await page.evaluate(() => ({ acts: window.__sw.acts.map(a => a.act), axes: window.__sw.axes.slice() }));
  return { s0, s1, sp, acts: rec.acts, axes: rec.axes };
}

(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.log('swipe: could not serve — ' + e.message); process.exit(1); }
  PORT = server.address().port;
  /* THE CHROMIUM THIS MACHINE HAS, as `check/press.js` finds it — Playwright's own download may be a
     version it has not fetched. */
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const t0 = Date.now();
  let reached = 0;

  for (const [W, H] of SIZES) {
    const at = `${W}x${H}`;
    const env = await boot(browser, W, H);
    const { page, cdp } = env;
    const tabs = await page.evaluate(() => TABS.map(t => t.id));
    const next = id => tabs[tabs.indexOf(id) + 1];
    const prev = id => tabs[tabs.indexOf(id) - 1];
    const count = await page.evaluate(() => Object.fromEntries(TABS.map(t => [t.id, AXES.y.count(t.id) || 1])));
    if ((count.tools || 0) < 3 || (count.games || 0) < 3) {
      fail('REACH', at, `Tools has ${count.tools} pages and Games ${count.games}; the gestures need three each — nothing was asked`);
      await env.ctx.close(); continue;
    }
    /* A ONE-PAGE COLUMN WITH A COLUMN AFTER IT — named rather than found first in the row. The feed
       counts one page while its posts are still arriving and several a moment later, and a 45° drag
       on a column that HAS a page below is rightly a page turn: found by a run that picked it. Saved
       and the Spotlight are one card by construction in this fixture; each is asked again just
       before the gesture. */
    const one = ['saved', 'spotlight', 'booking', 'dm'].find(id => count[id] === 1 && next(id));
    /* PAGES WITH BARE CARD ON THEM, and a page below each for a turn up to land on. */
    const TOOLS = [1, 2, 4, 5, 6, 7], GAMES = [1, 3, 4, 5, 6];
    if (!one) fail('REACH', at, 'there is no one-page column to ask the diagonal of');

    /* ---------- 1. ONE CELL, OR BACK WHERE IT WAS -------------------------------------------------
       Exactly one page or column for a gesture that commits, and none for one that does not — the
       two that turned the page against the person's mind first among them. */
    const turn = async (name, o, want) => {
      const r = await gesture(env, o);
      reached++;
      if (r.err) return fail('REACH', `${at} ${name}`, r.err);
      const got = r.s1.AT + '/' + r.s1.P, exp = want(r.s0);
      note(`${at} ${name}: ${r.s0.AT}/${r.s0.P} → ${got} (wanted ${exp}) axis ${r.axes.join('') || '-'} acts ${r.acts.join(',') || '-'}`);
      if (got !== exp) fail('ONE CELL', `${at} ${name}`, `landed on ${got}, wanted ${exp} (started ${r.s0.AT}/${r.s0.P})`);
      /* THE AXIS IS DECIDED ONCE. Two different axes inside one gesture is the grid changing its
         mind under the finger. */
      if (r.axes.length > 1) fail('AXIS KEPT', `${at} ${name}`, `the grid took ${r.axes.join(' then ')} inside one gesture`);
      if (r.acts.length) fail('NO TAP AFTER A DRAG', `${at} ${name}`, `the gesture pressed ${r.acts.join(', ')}`);
      return r;
    };
    const same = s => s.AT + '/' + s.P;
    const down1 = s => s.AT + '/' + (s.P + 1);
    const up1 = s => s.AT + '/' + (s.P - 1);
    const nextCol = s => next(s.AT) + '/' + (count[next(s.AT)] > 1 ? '*' : 0);
    /* A column change lands on whatever page that column remembers, so only the column is asked. */
    const colOnly = want => s => want(s).split('/')[0];
    const turnCol = async (name, o, want) => {
      const r = await gesture(env, o);
      reached++;
      if (r.err) return fail('REACH', `${at} ${name}`, r.err);
      const exp = colOnly(want)(r.s0);
      note(`${at} ${name}: ${r.s0.AT}/${r.s0.P} → ${r.s1.AT}/${r.s1.P} (wanted column ${exp}) axis ${r.axes.join('') || '-'}`);
      if (r.s1.AT !== exp) fail('ONE CELL', `${at} ${name}`, `landed on column ${r.s1.AT}, wanted ${exp} (started ${r.s0.AT})`);
      if (r.axes.length > 1) fail('AXIS KEPT', `${at} ${name}`, `the grid took ${r.axes.join(' then ')} inside one gesture`);
      if (r.acts.length) fail('NO TAP AFTER A DRAG', `${at} ${name}`, `the gesture pressed ${r.acts.join(', ')}`);
    };

    if (want('cell')) {
    await turn('flick up', { col: 'tools', p: TOOLS, g: G.flick(0, -90) }, down1);
    await turn('flick down', { col: 'tools', p: [2, 4, 5, 6, 7], g: G.flick(0, 90) }, up1);
    await turnCol('flick left', { col: 'tools', p: TOOLS, g: G.flick(-90, 0) }, nextCol);
    await turnCol('flick right', { col: 'games', p: GAMES, g: G.flick(90, 0) }, s => prev(s.AT) + '/0');
    await turn('40px up, held still', { col: 'games', p: GAMES, g: G.still(0, -40) }, same);
    await turn('70px up, held still — a peek, not a turn', { col: 'games', p: GAMES, g: G.still(0, -70) }, same);
    await turn('70px left, held still — a peek, not a turn', { col: 'tools', p: TOOLS, g: G.still(-70, 0) }, same);
    await turn('180px up, pulled back to 120 and let go moving home', { col: 'games', p: GAMES, ys: [0.75, 0.65, 0.55, 0.5], g: G.back(0, -1) }, same);
    await turn('180px left, pulled back to 120 and let go moving home', { col: 'tools', p: TOOLS, xs: [0.78, 0.7, 0.62], g: G.back(-1, 0) }, same);
    /* AND THE CONTROL: a deliberate drag most of the way, held still, still turns the page. */
    await turn('half a card up, held still', { col: 'games', p: GAMES, g: G.still(0, -Math.round(H * 0.45)) }, down1);
    }

    /* ---------- 1b. THE CARD STAYS UNDER THE FINGER WHEN THE MOVES ARRIVE FOLDED TOGETHER ---------
       Found by these screenshots, not by the lab: on a busy machine the first two moves of a drag
       arrived at 7px and 132px, the grid took off the whole 132 as "slop", and the card followed the
       finger 132px behind it for the rest of the gesture. Sent here as exactly that — one move inside
       the dead zone and the next far past it — so it does not depend on how loaded the machine is.
       The card may trail by the ten pixels of slop and no more. */
    if (want('folded')) {
      let sp = null;
      for (const p of TOOLS) { await page.evaluate(p => window.__sw.place('tools', p), p); sp = await page.evaluate(() => window.__sw.spot()); if (sp) break; }
      if (!sp) fail('REACH', `${at} folded moves`, 'no Tools card had a spot the grid would take');
      else {
        const send = (type, x) => cdp.send('Input.dispatchTouchEvent', { type,
          touchPoints: type === 'touchEnd' ? [] : [{ x, y: sp.y, id: 1, radiusX: 8, radiusY: 8 }] });
        await send('touchStart', sp.x);
        await sleep(30); await send('touchMove', sp.x - 6);
        await sleep(30); await send('touchMove', sp.x - 130);
        await sleep(30); await send('touchMove', sp.x - 131);
        const r = await page.evaluate(async () => {
          await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
          return { axis: SWIPE.axis, d: SWIPE.d, px: SWIPE.px };
        });
        await send('touchEnd', 0);
        await page.evaluate(() => window.__sw.still());
        reached++;
        note(`${at} folded moves: finger ${r.d}px, card ${(r.px || 0).toFixed(1)}px (axis ${r.axis})`);
        if (r.axis !== 'x') fail('REACH', `${at} folded moves`, `the drag was not the grid's (axis ${r.axis})`);
        else if (Math.abs(r.d - r.px) > 10.5) fail('UNDER THE FINGER', `${at} folded moves`, `the finger is ${r.d}px along and the card ${r.px.toFixed(1)}px — it trails by ${Math.abs(r.d - r.px).toFixed(0)}px, more than the ten of slop`);
      }
    }

    /* ---------- 2. THE AXIS, AND A DIAGONAL WITH NOWHERE TO GO UP OR DOWN ---------------------- */
    if (want('axis')) {
    if (one && await page.evaluate(id => AXES.y.count(id) <= 1, one)) {
      await turnCol(`45° on ${one} (one page)`, { col: one, g: G.diag(45, -1) }, s => next(s.AT) + '/0');
      await turnCol(`55° on ${one} (one page)`, { col: one, g: G.diag(55, -1) }, s => next(s.AT) + '/0');
    } else if (one) fail('REACH', `${at} ${one}`, `${one} had grown past one page by the time the diagonal was asked`);
    await turnCol('25° on tools', { col: 'tools', p: TOOLS, g: G.diag(25, -1) }, nextCol);
    await turn('up, drifting 90px sideways', { col: 'tools', p: TOOLS, g: G.drift(-1, -1) }, down1);
    }

    /* ---------- 3. A SWIPE THAT BEGINS ON A CONTROL PRESSES NOTHING ----------------------------- */
    if (want('tile')) await turn('up, starting on a tile', { col: 'games', p: GAMES, on: '.tile-row [data-do], .tile[data-do]', g: G.flick(0, -140, 130) }, down1);

    /* ---------- 4. A TAP ON A CARD STILL SLIDING IS NOT A PRESS ---------------------------------
       ASKED OF THE MECHANISM, IN ONE TASK. The first version tapped the arriving card with a real
       finger 90ms after a flick, and it could not fail: a card still moving at that speed has slid
       out from under the finger between touch-down and lift, so the click lands on whatever they
       share and nothing is pressed either way — the mutant with the guard taken out passed. So the
       page is turned, the arriving card's star is pressed the way a finger presses it (`pointerdown`,
       `pointerup`, `click`) while the slide is running, and nothing may happen; then the same star,
       pressed once the card has landed, must answer — or the first half proved nothing. */
    if (want('slide')) {
      const r = await page.evaluate(async () => {
        const press = el => {
          const o = { bubbles: true, cancelable: true, isPrimary: true, pointerType: 'touch', pointerId: 7 };
          el.dispatchEvent(new PointerEvent('pointerdown', o));
          el.dispatchEvent(new PointerEvent('pointerup', o));
          el.click();
        };
        await window.__sw.place('games', 1);
        AXES.y.go((PAGE.games || 0) + 1);
        placeNow_('y', false, 0);
        const pg = document.querySelector('#s-games > .page.on');
        const star = pg && pg.querySelector('[data-do="fav"]');
        if (!star) return { none: true };
        const out = { sliding: performance.now() < SLIDE_UNTIL - 60 };
        window.__sw.reset();
        press(star);
        out.mid = window.__sw.acts.map(a => a.act);
        await window.__sw.still();
        window.__sw.reset();
        const again = document.querySelector('#s-games > .page.on [data-do="fav"]');
        if (again) press(again);
        out.after = window.__sw.acts.map(a => a.act);
        /* AND THE STAR PUT BACK THE WAY IT WAS. */
        if (again && out.after.length) { await window.__sw.still(); press(document.querySelector('#s-games > .page.on [data-do="fav"]')); }
        return out;
      });
      reached++;
      note(`${at} tap mid-slide: sliding ${r.sliding}; pressed ${(r.mid || []).join(',') || 'nothing'}; after landing pressed ${(r.after || []).join(',') || 'nothing'}`);
      if (r.none) fail('REACH', `${at} tap mid-slide`, 'the card turned to on Games has no star to press');
      else if (!r.sliding) fail('REACH', `${at} tap mid-slide`, 'the page turn was not sliding when the star was pressed — nothing was asked');
      else {
        if (r.mid.length) fail('NO PRESS WHILE SLIDING', `${at} games`, `a press on the card still sliding ran ${r.mid.join(', ')}`);
        if (!r.after.length) fail('NO PRESS WHILE SLIDING', `${at} games`, 'the same star pressed after the card landed ran nothing either, so the rule above proved nothing');
      }
    }

    /* ---------- 5. A SECOND GESTURE ON THE OTHER AXIS LEAVES THE FIRST ONE SLIDING ---------------
       Asked of the mechanism, deterministically, because the symptom is a one-frame jump and frames
       are what a loaded machine cannot promise: a slide is started on one axis, a drag frame on the
       other is placed exactly as `pointermove` places it, and the first slide must still be running
       and still on its way. Then once with a real finger for the outcome. */
    if (want('other')) {
      const r = await page.evaluate(async () => {
        /* EVERYTHING IN ONE TASK, with a style read forcing each step: the slide is started, the drag
           frame placed, and the first slide asked after — no frame in between for a loaded machine
           to stretch past the slide's own length. */
        const out = {};
        await window.__sw.place('games', 1);
        await window.__sw.place('tools', 1);
        const ti = TABS.findIndex(t => t.id === 'tools');
        AXES.x.go(ti + 1);
        placeNow_('x', false, 0);
        const host = document.getElementById('s-' + AT);
        void getComputedStyle(host).transform;
        out.xBefore = host.getAnimations().some(a => a.transitionProperty === 'transform');
        SWIPE.live = true; SWIPE.axis = 'y';
        placeCells('y', false, -30);
        void getComputedStyle(host).transform;
        out.xAfter = host.getAnimations().some(a => a.transitionProperty === 'transform');
        out.xLeft = Math.abs(colNow_(host)[0] - colPlaced_(host)[0]);
        SWIPE.live = false; SWIPE.axis = null;
        placeCells('y');
        await window.__sw.still();
        await window.__sw.place('games', 1);
        const yProp = colProp_('y');
        const g = document.getElementById('s-games');
        AXES.y.go((PAGE.games || 0) + 1);
        placeNow_('y', false, 0);
        void getComputedStyle(g).translate;
        out.yBefore = g.getAnimations().some(a => a.transitionProperty === yProp);
        SWIPE.live = true; SWIPE.axis = 'x';
        placeCells('x', false, -30);
        void getComputedStyle(g).translate;
        out.yAfter = g.getAnimations().some(a => a.transitionProperty === yProp);
        out.yLeft = Math.abs(colNow_(g)[1] - colPlaced_(g)[1]);
        SWIPE.live = false; SWIPE.axis = null;
        placeCells('x');
        await window.__sw.still();
        return out;
      });
      reached++;
      note(`${at} other axis: x sliding ${r.xBefore} → after a vertical drag frame ${r.xAfter} (${r.xLeft.toFixed(0)}px to go); y sliding ${r.yBefore} → after a sideways drag frame ${r.yAfter} (${r.yLeft.toFixed(0)}px to go)`);
      if (!r.xBefore || !r.yBefore) fail('REACH', `${at} other axis`, 'the first slide was not running when the second gesture began — nothing was asked');
      else {
        if (!r.xAfter || r.xLeft < 1) fail('OTHER AXIS KEEPS SLIDING', `${at} sideways then up`, 'a vertical drag stopped the sideways slide dead — the column jumps the rest of the way in one frame');
        if (!r.yAfter || r.yLeft < 1) fail('OTHER AXIS KEEPS SLIDING', `${at} up then sideways`, 'a sideways drag stopped the vertical slide dead — the column jumps the rest of the way in one frame');
      }
      /* AND WITH A REAL FINGER: sideways, then up 60ms later, lands one column over and one page down. */
      let sp = null;
      for (const p of TOOLS) { await page.evaluate(p => window.__sw.place('tools', p), p); sp = await page.evaluate(() => window.__sw.spot()); if (sp) break; }
      if (sp) {
        const want = await page.evaluate(() => {
          const id = TABS[TABS.findIndex(t => t.id === AT) + 1].id;
          return id + '/' + ((PAGE[id] || 0) + 1);
        });
        await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(-90, 0)));
        await sleep(60);
        await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(0, -90)));
        const s1 = await page.evaluate(() => window.__sw.still());
        note(`${at} sideways then up 60ms later: ${s1.AT}/${s1.P} (wanted ${want})`);
        if (s1.AT + '/' + s1.P !== want) fail('ONE CELL', `${at} sideways then up`, `landed on ${s1.AT}/${s1.P}, wanted ${want}`);
      } else fail('REACH', `${at} sideways then up`, 'no Tools card had a spot the grid would take');
    }

    /* ---------- 6. THE CARD IN FRONT IS IN THE MIDDLE OF THE SCREEN ------------------------------
       Every column, its first three pages: the pane's centre against `#screen`'s, across and down,
       within a pixel. Down is asked only of a card shorter than the screen — `.pane`'s cap makes that
       every card today, and a card taller than the glass is placed at its top instead. */
    if (want('centre')) {
      const off = await page.evaluate(async () => {
        const res = [];
        for (const t of TABS) {
          const n = AXES.y.count(t.id) || 1;
          for (let p = 0; p < Math.min(n, 3); p++) {
            await window.__sw.place(t.id, p);
            const pane = document.querySelector('#s-' + t.id + ' > .page.on > .pane');
            if (!pane) { res.push({ id: t.id, p, none: true }); continue; }
            const r = pane.getBoundingClientRect(), sc = document.getElementById('screen').getBoundingClientRect();
            res.push({ id: t.id, p, h: r.height, H: sc.height,
              dx: r.left + r.width / 2 - (sc.left + sc.width / 2), dy: r.top + r.height / 2 - (sc.top + sc.height / 2) });
          }
        }
        return res;
      });
      reached++;
      const tall = off.filter(o => !o.none && o.h >= o.H).length;
      off.forEach(o => {
        if (o.none) return fail('CENTRED', `${at} ${o.id}/${o.p}`, 'there is no card in front to measure');
        if (Math.abs(o.dx) > 1) fail('CENTRED', `${at} ${o.id}/${o.p}`, `the card is ${o.dx.toFixed(1)}px off the middle across`);
        if (o.h < o.H && Math.abs(o.dy) > 1) fail('CENTRED', `${at} ${o.id}/${o.p}`, `the card (${o.h.toFixed(0)}px tall) is ${o.dy.toFixed(1)}px off the middle down`);
      });
      note(`${at} centred: ${off.length} cards measured, ${tall} taller than the screen; worst across ${Math.max(...off.map(o => Math.abs(o.dx || 0))).toFixed(1)}px, down ${Math.max(...off.filter(o => o.h < o.H).map(o => Math.abs(o.dy || 0))).toFixed(1)}px`);
    }

    /* ---------- 7. THE CARDS NOT IN FRONT ARE OUT OF FOCUS, AND THE ONE IN FRONT IS NOT ------------
       At rest: the card in front sharp; the ones above and below it and the card peeking in from the
       column either side blurred (or dimmed, for a pane that repaints itself); nothing two columns
       away or four pages down carrying it; no pane left holding a layer once nothing moves.
       Mid-drag: the card leaving and the card arriving are both part-way, so the look is following
       the finger rather than snapping at the lift. */
    if (want('focus')) {
      const rest = await page.evaluate(async () => {
        await window.__sw.place('tools', 1);
        const blur = el => { const m = /blur\(([\d.]+)px\)/.exec(getComputedStyle(el.querySelector(':scope > .pane')).filter || ''); return m ? +m[1] : 0; };
        const host = document.getElementById('s-tools');
        const pages = [...host.querySelectorAll(':scope > .page')];
        const at = PAGE.tools;
        const ti = TABS.findIndex(t => t.id === 'tools');
        const side = [TABS[ti - 1], TABS[ti + 1]].filter(Boolean)
          .map(t => document.querySelectorAll('#s-' + t.id + ' > .page')[domIndex_(t.id, PAGE[t.id] || 0)]).filter(Boolean);
        const far = TABS.filter((t, i) => Math.abs(i - ti) >= 2).flatMap(t => [...document.querySelectorAll('#s-' + t.id + ' > .page.soft')]);
        return {
          front: { soft: pages[at].classList.contains('soft'), blur: blur(pages[at]), filter: getComputedStyle(pages[at].querySelector(':scope > .pane')).filter },
          near: [pages[at - 1], pages[at + 1]].filter(Boolean).map(p => ({ soft: p.classList.contains('soft'), dim: p.classList.contains('soft-dim'), blur: blur(p) })),
          side: side.map(p => ({ soft: p.classList.contains('soft'), dim: p.classList.contains('soft-dim'), blur: blur(p) })),
          deep: pages.filter((p, i) => Math.abs(i - at) >= 3).filter(p => p.classList.contains('soft')).length,
          far: far.length,
          layers: [...document.querySelectorAll('#screen .pane')].filter(g => g.style.willChange || getComputedStyle(g).willChange !== 'auto').length,
          screenFilter: [...document.querySelectorAll('#screen > .screen')].filter(s => getComputedStyle(s).filter !== 'none').length,
          blurPx: SOFT_BLUR,
        };
      });
      reached++;
      note(`${at} out of focus at rest: front ${rest.front.filter}; near ${JSON.stringify(rest.near)}; side ${JSON.stringify(rest.side)}`);
      if (rest.front.soft || rest.front.blur > 0) fail('OUT OF FOCUS', `${at} tools/1`, `the card in front is blurred (${rest.front.filter})`);
      if (rest.near.length < 2 || rest.side.length < 2) fail('REACH', `${at} tools/1`, 'tools/1 should have a card above, below and either side');
      [...rest.near, ...rest.side].forEach((p, i) => {
        if (!p.soft) fail('OUT OF FOCUS', `${at} tools/1`, `a card beside the one in front is not marked out of focus (${i < rest.near.length ? 'above/below' : 'the next column'})`);
        else if (!p.dim && Math.abs(p.blur - rest.blurPx) > 0.05) fail('OUT OF FOCUS', `${at} tools/1`, `a card beside the one in front is drawn at blur ${p.blur}px, not ${rest.blurPx}px`);
      });
      if (rest.deep) fail('OUT OF FOCUS', `${at} tools`, `${rest.deep} page(s) three or more away carry the blur — off the screen, and paid for anyway`);
      if (rest.far) fail('OUT OF FOCUS', `${at} tools`, `${rest.far} page(s) two columns away carry the blur — off the screen, and paid for anyway`);
      if (rest.layers) fail('OUT OF FOCUS', `${at} tools`, `${rest.layers} pane(s) still hold a will-change layer with nothing moving`);
      if (rest.screenFilter) fail('OUT OF FOCUS', `${at} tools`, `${rest.screenFilter} column(s) carry a filter — a blurred layer is redrawn on every frame`);

      /* MID-DRAG, with the finger held half way — on a card with bare card to hold, above one that is
         blurred rather than dimmed, so both halves of the easing can be read. */
      let sp = null;
      for (const p of [4, 5, 6, 1, 2]) {
        await page.evaluate(p => window.__sw.place('tools', p), p);
        const ok = await page.evaluate(() => {
          const a = document.querySelector('#s-tools > .page.on'), b = a && a.nextElementSibling;
          return !!(b && !b.classList.contains('soft-dim') && !softDim_(a));
        });
        sp = ok ? await page.evaluate(() => window.__sw.spot(null, [0.8, 0.7, 0.9, 0.6, 0.5])) : null;
        if (sp) break;
      }
      const half = await page.evaluate(() => {
        const a = document.querySelector('#s-tools > .page.on'), b = a && a.nextElementSibling;
        return a && b ? Math.round(Math.abs((b.offsetTop + b.offsetHeight / 2) - (a.offsetTop + a.offsetHeight / 2)) * 0.45) : 0;
      });
      if (!sp || !half) fail('REACH', `${at} tools mid-drag`, 'no Tools card with bare card to hold and a blurred card below it');
      else {
        const go = Math.min(half, sp.y - 30);
        const h = await finger(cdp, { x0: sp.x, y0: sp.y, dur: 360, hold: 400, end: false,
          path: t => [0, -go * ease.still(t)] });
        /* READ ONCE THE PAGE HAS CAUGHT UP WITH THE FINGER — moves are sent without waiting, and on a
           loaded machine the last of them can still be queued. */
        const mid = await page.evaluate(async want => {
          const wait = ms => new Promise(r => setTimeout(r, ms));
          for (let k = 0; k < 40 && !(SWIPE.axis && Math.abs(SWIPE.px || 0) >= want); k++) await wait(50);
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          const a = document.querySelector('#s-tools > .page.on'), b = a && a.nextElementSibling;
          const blur = el => { const m = /blur\(([\d.]+)px\)/.exec(getComputedStyle(el.querySelector(':scope > .pane')).filter || ''); return m ? +m[1] : 0; };
          const step = Math.abs((b.offsetTop + b.offsetHeight / 2) - (a.offsetTop + a.offsetHeight / 2));
          return { a: blur(a), b: blur(b), axis: SWIPE.axis, bDim: b.classList.contains('soft-dim'),
                   f: Math.min(1, Math.abs(SWIPE.px || 0) / step) };
        }, Math.round((go - 12) * 0.8));
        await h.lift();
        await page.evaluate(() => window.__sw.still());
        reached++;
        note(`${at} mid-drag: ${(mid.f * 100).toFixed(0)}% of the way — leaving card blur ${mid.a}px, arriving card ${mid.b}px (axis ${mid.axis})`);
        if (mid.axis !== 'y') fail('REACH', `${at} tools mid-drag`, `the held drag was not the grid's (axis ${mid.axis})`);
        else if (!(mid.f > 0.15 && mid.f < 0.85)) fail('REACH', `${at} tools mid-drag`, `the finger was held ${(mid.f * 100).toFixed(0)}% of the way, not part-way`);
        else {
          /* IN STEP WITH THE FINGER: the card leaving at f of the blur, the card arriving at 1 - f. */
          const wantA = rest.blurPx * mid.f, wantB = rest.blurPx * (1 - mid.f);
          if (Math.abs(mid.a - wantA) > 0.25) fail('OUT OF FOCUS', `${at} tools mid-drag`, `the card being dragged away is at blur ${mid.a}px ${(mid.f * 100).toFixed(0)}% of the way — it should be about ${wantA.toFixed(2)}px, easing out of focus with the finger`);
          if (!mid.bDim && Math.abs(mid.b - wantB) > 0.25) fail('OUT OF FOCUS', `${at} tools mid-drag`, `the card coming in is at blur ${mid.b}px ${(mid.f * 100).toFixed(0)}% of the way — it should be about ${wantB.toFixed(2)}px, easing into focus with the finger`);
        }
        const left = await page.evaluate(() => [...document.querySelectorAll('#screen .pane')].filter(g => g.style.willChange || g.style.filter).length);
        if (left) fail('OUT OF FOCUS', `${at} tools after a drag`, `${left} pane(s) kept an inline filter or will-change after the slide ended`);
      }
    }

    /* ---------- 8. A FIELD ON A CARD THAT HAS GONE IS LET GO OF -----------------------------------
       The keypad and a phone's keyboard both close on `focusout`; nothing took the focus away when
       its card left. A focused field on a Tools card, then a swipe up from bare card. */
    if (want('field')) {
      const ok = await page.evaluate(async () => {
        const n = AXES.y.count('tools');
        for (let p = 0; p < n - 1; p++) {
          await window.__sw.place('tools', p);
          const f = [...document.querySelectorAll('#s-tools > .page.on input, #s-tools > .page.on textarea')]
            .find(e => !e.disabled && e.offsetParent && (e.tagName === 'TEXTAREA' || /^(text|search|number|tel|email|url)$/.test(e.type)));
          if (f) { f.focus(); return document.activeElement === f ? p : -1; }
        }
        return -1;
      });
      if (ok < 0) fail('REACH', `${at} focused field`, 'no text field on a Tools card could be focused — nothing was asked');
      else {
        const sp = await page.evaluate(() => window.__sw.spot());
        if (!sp) fail('REACH', `${at} focused field`, 'no bare spot on the card holding the field');
        else {
          await finger(cdp, Object.assign({ x0: sp.x, y0: sp.y }, G.flick(0, -100)));
          const r = await page.evaluate(async () => {
            await window.__sw.still();
            const fe = document.activeElement, pg = fe && fe.closest && fe.closest('#screen .page');
            return { moved: PAGE.tools, kept: !!(pg && !pg.classList.contains('on')), what: fe ? fe.tagName : '' };
          });
          reached++;
          note(`${at} focused field: page ${ok} → ${r.moved}; focus kept on a card that left: ${r.kept}`);
          if (r.moved === ok) fail('REACH', `${at} focused field`, 'the swipe off the card with the field did not turn the page');
          else if (r.kept) fail('FIELD LET GO', `${at} tools/${ok}`, `a ${r.what} on a card that has left the screen still has the focus — the keypad stays up over the wrong card`);
        }
      }
    }

    /* ---------- 8b. A CARD YOU ARE USING STAYS WHERE IT IS, AND THE NEXT ONE IS CENTRED ----------
       Centring is where a card ARRIVES (`HOLD_AT` in shell.js). The first version re-centred on every
       change of height, so a real tap on the funnel's answer — which shortens the card — moved the
       search box 38px down the screen; the owner's "stable" state measures against the pane and could
       not see it. So: a real tap on the first answer, and the search box must not move ON THE
       SCREEN; then a page away and back, and the funnel must be centred again — a hold that is never
       let go is the same fault the other way up. */
    if (want('hold')) {
      const a = await page.evaluate(async () => {
        await window.__sw.place('stuff', 0);
        STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('stuff', 0, true);
        await window.__sw.still('stuff');
        const q = document.getElementById('stuff-q');
        const pg = document.querySelector('#s-stuff > .page.on');
        const row = pg && [...pg.querySelectorAll('#stuff-groups .answers > .row[data-do="facet-pick"]')].find(r => {
          const b = r.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          return b.height > 10 && hit && r.contains(hit);
        });
        if (!q || !pg || !row) return null;
        const b = row.getBoundingClientRect();
        return { q: q.getBoundingClientRect().top, h: pg.offsetHeight, n: AXES.y.count('stuff'),
                 x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
      });
      if (!a) fail('REACH', `${at} held card`, 'the funnel has no search box or no answer a finger can reach — nothing was asked');
      else {
        const T0 = Date.now();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', timestamp: T0 / 1000, touchPoints: [{ x: a.x, y: a.y, id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
        await sleep(60);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', timestamp: (T0 + 60) / 1000, touchPoints: [] });
        const b = await page.evaluate(async () => {
          await window.__sw.still('stuff');
          const pg = document.querySelector('#s-stuff > .page.on');
          return { q: document.getElementById('stuff-q').getBoundingClientRect().top, h: pg.offsetHeight,
                   picked: STUFF.filters.length, n: AXES.y.count('stuff') };
        });
        reached++;
        note(`${at} held card: answer picked ${b.picked}; card ${a.h} → ${b.h}px; search box ${a.q.toFixed(1)} → ${b.q.toFixed(1)}`);
        if (!b.picked || b.h === a.h) fail('REACH', `${at} held card`, `the tap ${b.picked ? 'did not change the card\'s height' : 'picked nothing'} — nothing was asked`);
        else if (Math.abs(b.q - a.q) > 0.5) fail('HELD WHILE USED', `${at} stuff/0`, `pressing an answer moved the search box ${(b.q - a.q).toFixed(1)}px on the screen — the card was put back in the middle under the finger`);
        /* AND LET GO: a page away and back, by the app's own turn, and the funnel is centred again. */
        const c = await page.evaluate(async () => {
          if (AXES.y.count('stuff') < 2) return null;
          goPage('stuff', 1); await window.__sw.still('stuff');
          goPage('stuff', 0); await window.__sw.still('stuff');
          const pg = document.querySelector('#s-stuff > .page.on'), sr = document.getElementById('screen').getBoundingClientRect();
          const r = pg.getBoundingClientRect();
          return { dy: (r.top + r.height / 2) - (sr.top + sr.height / 2), h: r.height, H: sr.height };
        });
        if (!c) fail('REACH', `${at} held card`, 'the funnel had no second page to leave for — the letting go was not asked');
        else {
          note(`${at} held card let go: back on the funnel ${c.dy.toFixed(1)}px off the middle`);
          if (c.h < c.H && Math.abs(c.dy) > 1) fail('HELD WHILE USED', `${at} stuff/0`, `a page away and back, the funnel is ${c.dy.toFixed(1)}px off the middle — the hold was never let go`);
        }
        await page.evaluate(() => { STUFF.filters = []; paintStuff(); goPage('stuff', 0, true); });
      }
    }

    /* ---------- 9. ARRIVING AT A COLUMN OF WIDGETS STARTS THEM A FEW AT A TIME --------------------
       Every widget's `start` lays the whole document out, and Tools arrived starting all twelve in
       one task — a second swipe waited behind every one. Counted per task: a task boundary is a
       `setTimeout(0)` the wrapper books on the first start it sees. And every one of them running
       shortly after, or the cure is a column of dead widgets. */
    if (want('widgets')) {
      const r = await page.evaluate(async () => {
        const wait = ms => new Promise(res => setTimeout(res, ms));
        await window.__sw.place('games', 0);
        /* THE ROSTER'S OWN OBJECTS ONLY: a widget made from data (a session you are in) is a fresh
           object per call, so wrapping it here would wrap a copy nobody starts. */
        const ws = widgetsOf_('tool').filter(w => typeof WIDGETS !== 'undefined' && WIDGETS.indexOf(w) !== -1);
        let n = 0, most = 0, booked = false, all = 0;
        const seen = new Set();
        ws.forEach(w => {
          if (!w.start || w.start.__sw) return;
          const f = w.start;
          w.start = function () {
            seen.add(w.id); n++;
            if (!booked) { booked = true; setTimeout(() => { most = Math.max(most, n); n = 0; booked = false; }, 0); }
            return f.apply(this, arguments);
          };
          w.start.__sw = f;
        });
        go('tools', false);
        for (let k = 0; k < 80 && seen.size < ws.filter(w => w.start).length; k++) await wait(100);
        await wait(50);
        most = Math.max(most, n);
        all = ws.filter(w => w.start).length;
        ws.forEach(w => { if (w.start && w.start.__sw) w.start = w.start.__sw; });
        return { most, seen: seen.size, all };
      });
      reached++;
      note(`${at} arriving at Tools: ${r.seen} of ${r.all} widgets started, at most ${r.most} in one task`);
      if (r.all < 4) fail('REACH', `${at} tools`, `Tools has ${r.all} widgets with a start — too few to ask`);
      else {
        if (r.most > 3) fail('WIDGETS A FEW AT A TIME', `${at} tools`, `${r.most} widgets started in one task on arrival — a swipe waits behind every one`);
        if (r.seen < r.all) fail('WIDGETS A FEW AT A TIME', `${at} tools`, `only ${r.seen} of ${r.all} widgets had started 8s after arriving`);
      }
    }

    /* ---------- 10. A RELEASE RESTYLES THE CARDS THAT CHANGED, NOT THE DOCUMENT -------------------
       From Chrome's own trace: every `UpdateLayoutTree` in the task a page turn and a column change
       run in. It was 4,381–5,054 elements for both — one `:has()` on the hour grid naming the class
       `on`, which `placeGrid` moves at every turn — and a column change also laid out the whole
       document, for a camera that was never on. Asked at 390 only: the count does not depend on the
       width, and a trace is the slowest thing here. */
    if (W === 390 && want('cost')) {
      const events = [];
      cdp.on('Tracing.dataCollected', d => events.push(...d.value));
      /* WARMED UP: both columns visited once, because the first visit after the payload lands is a
         REPAINT of the column by design (`STALE`) — the cost of new data, not of a swipe. */
      await page.evaluate(async () => { await window.__sw.place('games', 1); await window.__sw.place('tools', 1); });
      const traced = async (name, code) => {
        events.length = 0;
        await page.evaluate(() => window.__sw.place('tools', 1));
        const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
        await cdp.send('Tracing.start', { transferMode: 'ReportEvents',
          traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing'] } });
        await sleep(100);
        await page.evaluate(c => { performance.mark('sw-a'); (0, eval)(c); placeNow_('x', false, 0); void document.body.offsetHeight; performance.mark('sw-b'); }, code);
        await sleep(100);
        await cdp.send('Tracing.end'); await done;
        const a = events.find(e => e.name === 'sw-a'), b = events.find(e => e.name === 'sw-b');
        if (!a || !b) return fail('REACH', `${at} ${name}`, 'the trace has no marks — nothing was measured');
        const inn = events.filter(e => e.ts >= a.ts && e.ts <= b.ts);
        const style = inn.filter(e => e.name === 'UpdateLayoutTree').map(e => (e.args && e.args.elementCount) || 0);
        reached++;
        note(`${at} ${name}: restyles ${style.join(', ') || 'none'}`);
        const worst = Math.max(0, ...style);
        if (worst >= 1000) fail('RELEASE COST', `${at} ${name}`, `one style recalculation touched ${worst} elements — something is invalidating the whole document`);
      };
      await traced('a page turn', "AXES.y.go((PAGE.tools || 0) + 1)");
      await traced('a column change', "AXES.x.go(TABS.findIndex(t => t.id === 'tools') + 1)");
      /* AND THE CAMERA IS LET GO OF ONLY BY LEAVING THE FEED. `camStop_` reset the camera card's
         markup on every column change, which forced a layout of the whole document at the release
         (230ms here on the base commit, warmed up). Asked by counting the calls, because a layout's
         cost is the one number on this machine that load decides. */
      const cam = await page.evaluate(async () => {
        if (typeof camStop_ !== 'function') return null;
        const real = camStop_;
        let n = 0;
        window.camStop_ = function () { n++; return real.apply(this, arguments); };
        const out = {};
        await window.__sw.place('tools', 1);
        n = 0; go('games', false); await window.__sw.still(); out.across = n;
        await window.__sw.place('feed');
        n = 0; go(TABS[TABS.findIndex(t => t.id === 'feed') + 1].id, false); await window.__sw.still(); out.leaving = n;
        window.camStop_ = real;
        return out;
      });
      reached++;
      note(`${at} camStop_: ${cam ? cam.across + ' call(s) from Tools to Games, ' + cam.leaving + ' leaving the feed' : 'not reachable'}`);
      if (!cam) fail('REACH', `${at} camera`, 'camStop_ is not reachable — nothing was asked');
      else {
        if (cam.across) fail('RELEASE COST', `${at} Tools to Games`, `camStop_ ran ${cam.across} time(s) on a column change that never touched the feed — a whole-document layout for a camera that was never on`);
        if (cam.leaving !== 1) fail('RELEASE COST', `${at} leaving the feed`, `camStop_ ran ${cam.leaving} time(s) leaving the feed, not once — the camera must still be let go`);
      }
    }

    if (env.errs.length) fail('PAGE ERROR', at, env.errs.slice(0, 3).join(' | '));
    await env.ctx.close();
  }

  /* ---------- 11. LESS MOTION ASKED FOR: DIMMED, NEVER BLURRED -------------------------------------- */
  if (want('reduced')) {
    const env = await boot(browser, 390, 844, { reduced: true });
    const r = await env.page.evaluate(async () => {
      await window.__sw.place('tools', 1);
      const soft = [...document.querySelectorAll('#s-tools > .page.soft')];
      return { n: soft.length, blurred: soft.filter(p => /blur/.test(getComputedStyle(p.querySelector(':scope > .pane')).filter)).length,
               dimmed: soft.filter(p => +getComputedStyle(p.querySelector(':scope > .pane')).opacity < 1).length };
    });
    reached++;
    note(`reduced motion: ${r.n} soft card(s), ${r.blurred} blurred, ${r.dimmed} dimmed`);
    if (!r.n) fail('REACH', 'reduced motion', 'no card was marked out of focus');
    if (r.blurred) fail('OUT OF FOCUS', 'reduced motion', `${r.blurred} card(s) are blurred for somebody who asked for less motion`);
    if (r.n && r.dimmed < r.n) fail('OUT OF FOCUS', 'reduced motion', `${r.n - r.dimmed} out-of-focus card(s) are not even dimmed`);
    await env.ctx.close();
  }

  await browser.close();
  server.close();

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  if (ONLY.length || WIDTH) console.log(`swipe: NARROWED to ${ONLY.join(', ') || 'every rule'} at ${SIZES.map(s => s[0]).join(' and ')} — not the whole check`);
  if (!found.length) {
    console.log(`swipe: ${reached} gestures and measurements at ${SIZES.map(s => s.join('x')).join(' and ')}, ${secs}s`);
    console.log('OK — every swipe lands one card away or back where it was, the card in front is centred, and the cards beside it are out of focus.');
    process.exit(0);
  }
  const by = {};
  found.forEach(f => (by[f.rule] = by[f.rule] || []).push(f));
  Object.keys(by).forEach(k => {
    console.log(`\n${k}  (${by[k].length})`);
    by[k].forEach(f => console.log(`  ${f.where}: ${f.msg}`));
  });
  console.log(`\nFAILED — ${found.length} finding(s) across ${reached} gestures and measurements, ${secs}s`);
  process.exit(1);
})().catch(e => { console.log('swipe: the run itself failed — ' + (e && e.stack || e)); process.exit(1); });
