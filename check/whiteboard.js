#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/whiteboard.js THE MATHS NOTEBOOK UNDER A FINGER (390x844, real touches) AND A MOUSE (1280x800),
   on the Tools column's whiteboard (board.js, docs/history/377). Each line it prints is one thing it proved. */
/* Flags: --shots writes check/shots/wb-*.png (or WB_SHOTS=dir); -v prints every line. Port: WB_PORT. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.WB_PORT || 0);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SHOTS = process.env.WB_SHOTS || (process.argv.includes('--shots') ? path.join(__dirname, 'shots') : '');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
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

const bad = [];
let proved = 0;
const want = (ok, what, got) => { if (ok) { proved++; console.log('  ok   ' + what); } else bad.push(what + ' — ' + got); };
const shot = async (page, name) => {
  if (!SHOTS) return;
  try { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, 'wb-' + name + '.png') }); } catch (e) {}
};

async function boot(browser, W, H, port, touch) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch,
                                         serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof initBoard_ === 'function', null, { timeout: 90000 });
  await sleep(800);
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp, errs };
}
/* TO THE BOARD, AND EMPTY: the Tools column in front, the whiteboard's page turned to, its key and state forgotten. */
async function fresh(env, keep) {
  const ok = await env.page.evaluate(async keep => {
    if (AT !== 'tools') go('tools', false, true);
    goPage('tools', widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard'), true);
    for (let i = 0; i < 60 && !document.querySelector('#s-tools #wgt-whiteboard .nb'); i++) await new Promise(r => setTimeout(r, 100));
    const k = padKey_(WB_ITEM);
    if (!keep) { try { ansStore_(k, null); } catch (e) {} NB_STATE.delete(k); }
    initBoard_();
    return !!document.querySelector('#s-tools #wgt-whiteboard .nb');
  }, !!keep);
  await sleep(500);
  return ok;
}
/* WHERE THINGS ARE: the pad's and the page's boxes, the pad's scale, its baseline and x-height in px, the state. */
const geo = env => env.page.evaluate(() => {
  const host = document.querySelector('#s-tools #wgt-whiteboard .nb-box');
  const b = host && host.NB;
  if (!b) return null;
  const st = nbState_(b.k), m = nbMap_(b, st);
  const r = e => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, w: x.width, h: x.height }; };
  const lay = m.tm ? st.lays.get(m.tm.id) : null;
  return { pad: r(b.pad.box), book: r(b.book.box), S: m.s, x0: m.x0, y0: m.y0, py0: m.py0, xh: 12 / m.s,
           caret: st.caret, mode: st.mode, pv: st.pv.x, nv: st.nv, runR: st.runR, n: st.items.length, lay,
           sel: st.sel ? st.sel.length : 0 };
});
const items = env => env.page.evaluate(() => {
  const st = nbState_(padKey_(WB_ITEM));
  return st.items.map(i => i.t ? { t: i.t, id: i.id, x: i.x, y: i.y }
    : { b: i.b, e: i.e, line: i.line, n: i.pts.length, box: i.box, pts: i.pts.length <= 4 ? i.pts : null });
});
const stored = env => env.page.evaluate(() => { try { return JSON.parse(localStorage.getItem(padKey_(WB_ITEM)) || '[]'); } catch (e) { return ['unreadable']; } });

/* ---------- FINGERS ---------- */
const P = (x, y, id = 1, r = 8) => ({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, id, radiusX: r, radiusY: r, force: 1 });
const T = (env, type, pts) => env.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
async function stroke(env, pts, o) {
  o = o || {};
  await T(env, 'touchStart', [P(pts[0][0], pts[0][1], 1, o.r)]);
  for (const p of pts.slice(1)) { await T(env, 'touchMove', [P(p[0], p[1], 1, o.r)]); await sleep(o.dt || 8); }
  if (o.hold) {
    /* STILL, BUT REPORTING: a real finger held down sends the same point now and then. */
    const l = pts[pts.length - 1];
    for (let t = 0; t < o.hold; t += 100) { await sleep(100); await T(env, 'touchMove', [P(l[0] + 0.3, l[1], 1, o.r)]); }
  }
  await T(env, 'touchEnd', []);
}
async function tapN(env, at) {
  await T(env, 'touchStart', at.map((p, i) => P(p[0], p[1], i + 1)));
  await sleep(60);
  await T(env, 'touchEnd', []);
  await sleep(80);
}
const line = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
/* AN x, h px tall, its left at pad x `x`, sitting on the pad's baseline, in page coordinates. */
async function writeX(env, g, x, h) {
  h = h || g.xh;
  const L = g.pad.l + x, B = g.pad.t + g.py0;
  await stroke(env, line([L, B - h], [L + h * 0.8, B], 12));
  await stroke(env, line([L + h * 0.8, B - h], [L, B], 12));
}
const padX = (g, nx) => (nx - g.x0) / g.S;

(async () => {
  const server = await serve();
  const port = server.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  try {
    /* ==================== A PHONE, ONE FINGER ==================== */
    const env = await boot(browser, 390, 844, port, true);
    if (!(await fresh(env))) { bad.push('no whiteboard notebook on the Tools column — NOTHING was checked'); throw new Error('stop'); }
    await shot(env.page, '390-empty');
    let g = await geo(env);
    want(g && g.pad.h >= 150 && g.book.h >= 120, 'the pad and the page are both big enough to use at 390x844', JSON.stringify(g && { pad: g.pad, book: g.book }));
    const free = await env.page.evaluate(() => [axisFree(document.querySelector('#s-tools .nb-pad'), 'x', -1), axisFree(document.querySelector('#s-tools .nb-book'), 'x', -1)]);
    want(!free[0] && free[1], 'a drag on the pad never slides the column; a swipe that starts on the page still may', JSON.stringify(free));

    /* WRITE BIG, LAND SMALL. */
    await writeX(env, g, 40);
    {
      const g1 = await geo(env);
      want(Math.abs(g1.pad.t - g.pad.t) < 0.5 && Math.abs(g1.pad.h - g.pad.h) < 0.5, 'the pad does not move when the first stroke lands (nothing under it comes or goes)', JSON.stringify([g.pad, g1.pad]));
    }
    await sleep(100);
    let it = await items(env);
    const xh = it.length === 2 ? Math.max(it[0].box.b - it[0].box.t, it[1].box.b - it[1].box.t) : 0;
    want(it.length === 2 && xh > 8 && xh < 16 && Math.abs(it[0].box.b - 40) < 3,
         'an x written ' + Math.round(g.xh) + 'px tall in the pad lands about 12 units tall on the first line\'s baseline', JSON.stringify(it.map(i => i.box)));
    want((await stored(env)).length === 2, 'both strokes are stored under the board\'s key', JSON.stringify(await stored(env)).slice(0, 100));

    /* TWO FINGERS UNDO, THREE REDO. */
    await tapN(env, [[g.pad.l + 100, g.pad.t + 80], [g.pad.l + 160, g.pad.t + 90]]);
    const afterUndo = (await items(env)).length;
    await tapN(env, [[g.pad.l + 80, g.pad.t + 80], [g.pad.l + 140, g.pad.t + 90], [g.pad.l + 200, g.pad.t + 85]]);
    const afterRedo = (await items(env)).length;
    want(afterUndo === 1 && afterRedo === 2, 'a two-finger tap takes the last stroke off and a three-finger tap puts it back', afterUndo + ' then ' + afterRedo);

    /* A PALM: a contact 60px wide draws nothing. */
    await stroke(env, line([g.pad.l + 60, g.pad.t + 60], [g.pad.l + 200, g.pad.t + 120], 10), { r: 30 });
    want((await items(env)).length === 2, 'a palm-sized contact across the pad draws nothing', (await items(env)).length + ' items');

    /* RUBBED OUT: a scribble over the x takes it away and is not kept. */
    g = await geo(env);
    {
      const bx = (await items(env))[1].box, l = g.pad.l + padX(g, bx.l) - 4, r = g.pad.l + padX(g, bx.r) + 4, B = g.pad.t + g.py0;
      const zig = [];
      for (let i = 0; i <= 6; i++) zig.push(...line([i % 2 ? r : l, B - g.xh * (0.2 + i * 0.12)], [i % 2 ? l : r, B - g.xh * (0.26 + i * 0.12)], 6));
      await stroke(env, zig, { dt: 4 });
    }
    await sleep(100);
    it = await items(env);
    want(it.length === 0, 'a scribble over the x rubs out both its strokes and leaves no mark of its own', it.length + ' items left');

    /* HELD STILL AT THE END: ruled, and level. */
    if (!(await fresh(env))) throw new Error('stop');
    g = await geo(env);
    {
      const B = g.pad.t + g.py0 - g.xh * 0.5, pts = [];
      for (let i = 0; i <= 30; i++) pts.push([g.pad.l + 30 + i * 5, B + Math.sin(i / 2) * 2.5 + i * 0.12]);
      await stroke(env, pts, { hold: 800 });
    }
    it = await items(env);
    const ruled = it.length === 1 && it[0].n === 2 && it[0].pts && Math.abs(it[0].pts[0][1] - it[0].pts[1][1]) < 0.01;
    want(ruled, 'a wobbly line held still at its end is stored as one exactly level line of two points', JSON.stringify(it));
    await shot(env.page, '390-ruled');

    /* THE PAD MOVES ON, AND THE LINE WRAPS. */
    if (!(await fresh(env))) throw new Error('stop');
    g = await geo(env);
    const pv0 = g.pv, c0 = g.caret.x;
    await writeX(env, g, g.pad.w * 0.55);
    await sleep(700);
    g = await geo(env);
    want(g.pv > pv0 + 5 && g.caret.x > c0 + 5, 'writing past the middle of the pad slides it on after the pause, and the caret follows', `pad ${pv0.toFixed(1)} -> ${g.pv.toFixed(1)}, caret ${c0.toFixed(1)} -> ${g.caret.x.toFixed(1)}`);
    let wraps = 0;
    for (let i = 0; i < 40 && !wraps; i++) {
      g = await geo(env);
      await writeX(env, g, Math.max(4, padX(g, g.caret.x) + 2));
      await sleep(520);
      if ((await geo(env)).caret.line > 0) wraps = i + 1;
    }
    g = await geo(env);
    want(wraps > 0 && g.caret.line === 1 && g.caret.x < 30, 'a full line wraps the caret to the start of the next one, with no tap', `after ${wraps} more x's: line ${g.caret.line}, x ${g.caret.x.toFixed(1)}`);
    await shot(env.page, '390-wrapped');

    /* A TAP ON THE PAGE MOVES THE CARET THERE. */
    {
      const a = g.book.w / 360 * g.nv.z, y = g.book.t + ((3 * 64 + 40) - g.nv.y) * a - 4;
      if (y < g.book.t + g.book.h - 4) {
        await tapN(env, [[g.book.l + g.book.w * 0.5, y]]);
        await sleep(150);
        g = await geo(env);
        want(g.caret.line === 3 && g.caret.x > 100, 'a tap on an empty line of the page puts the caret there', JSON.stringify(g.caret));
      } else want(false, 'a tap on the page moves the caret', 'line 3 is not on screen (' + y + ')');
    }

    /* = AFTER = STARTS THE NEXT LINE, UNDER THE FIRST =. */
    if (!(await fresh(env))) throw new Error('stop');
    const eq = async () => {
      const q = await geo(env), x = Math.max(4, padX(q, q.caret.x) + 6), w = q.xh * 0.7, B = q.pad.t + q.py0;
      await stroke(env, line([q.pad.l + x, B - q.xh * 0.75], [q.pad.l + x + w, B - q.xh * 0.75], 8));
      await stroke(env, line([q.pad.l + x, B - q.xh * 0.3], [q.pad.l + x + w, B - q.xh * 0.3], 8));
      await sleep(500);
    };
    const glyph = async () => { const q = await geo(env); await writeX(env, q, Math.max(4, padX(q, q.caret.x) + 4)); await sleep(500); };
    await glyph(); await eq(); await glyph(); await eq();
    it = await items(env);
    const eqs = it.filter(i => i.e);
    const first = eqs.filter(i => i.line === 0), second = eqs.filter(i => i.line === 1);
    const l0 = Math.min(...first.map(i => i.box.l)), l1 = Math.min(...second.map(i => i.box.l));
    want(first.length === 2 && second.length === 2 && Math.abs(l0 - l1) < 1, 'the second = is moved to the next line, its left edge under the first =',
         `= strokes on line 0: ${first.length}, line 1: ${second.length}, lefts ${l0.toFixed(1)} / ${l1.toFixed(1)}`);
    g = await geo(env);
    want(g.caret.line === 1, 'and the caret goes with it, ready for the right-hand side', JSON.stringify(g.caret));
    await glyph();
    await shot(env.page, '390-equals');

    /* WRITTEN HIGH: AN EXPONENT. */
    if (!(await fresh(env))) throw new Error('stop');
    await glyph();
    {
      const q = await geo(env), x = q.pad.l + padX(q, q.caret.x) + 2, top = q.pad.t + q.py0 - q.xh * 2.1, h = q.xh * 0.85;
      await stroke(env, [...line([x, top + h * 0.2], [x + h * 0.4, top], 4), ...line([x + h * 0.4, top], [x + h * 0.6, top + h * 0.3], 4),
                         ...line([x + h * 0.6, top + h * 0.3], [x, top + h], 6), ...line([x, top + h], [x + h * 0.7, top + h], 4)]);
      await sleep(700);
      it = await items(env);
      const sup = it[it.length - 1], hh = sup.box.b - sup.box.t;
      want(it.length === 3 && hh < h * q.S * 0.75 && sup.box.b < 40 - 12 * 0.4,
           'a small stroke written above the x-height, right of the x, is shrunk and raised into an exponent', `height ${hh.toFixed(1)} (written ${(h * q.S).toFixed(1)}), bottom ${sup.box.b.toFixed(1)}`);
    }

    /* A FRACTION: what is written above the bar goes in its top, below in its bottom, beside it back on the line. */
    if (!(await fresh(env))) throw new Error('stop');
    {
      const t = await env.page.evaluate(() => { const r = document.querySelector('#s-tools .nb-shape[data-shape="frac"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await tapN(env, [t]);
      await sleep(300);
      g = await geo(env);
      const at = (nx, ny) => [g.pad.l + (nx - g.x0) / g.S, g.pad.t + (ny - g.y0) / g.S + g.py0];
      const nb = g.lay && g.lay.boxes.n, db = g.lay && g.lay.boxes.d;
      if (!g.mode || !nb || !db) want(false, 'the Fraction tile puts a fraction at the caret and the pad on it', JSON.stringify(g));
      else {
        const sx = async (box) => {
          const a = at(box.x + 1, box.base - 9), b = at(box.x + 7, box.base - 1);
          await stroke(env, line(a, b, 10)); await stroke(env, line([b[0], a[1]], [a[0], b[1]], 10));
        };
        await sx(nb); await sx(db);
        it = await items(env);
        const tm = it.find(i => i.t === 'frac');
        const inN = it.filter(i => tm && i.b === tm.id + ':n').length, inD = it.filter(i => tm && i.b === tm.id + ':d').length;
        want(!!tm && inN === 2 && inD === 2, 'strokes written above the bar fill the numerator and below it the denominator', `numerator ${inN}, denominator ${inD}`);
        g = await geo(env);
        const lay = g.lay, beside = at(lay.r + 10, lay.t + (lay.b - lay.t) * 0.55);
        await stroke(env, line(beside, [beside[0] + 30, beside[1] + 30], 10));
        await sleep(200);
        g = await geo(env);
        it = await items(env);
        const out = it.filter(i => !i.t && !i.b);
        want(!g.mode && out.length === 1 && out[0].box.l > lay.r, 'a stroke written beside the fraction leaves it and lands on the line after it', `mode ${g.mode}, ${out.length} on the line`);
        await shot(env.page, '390-fraction');
      }
    }

    /* A LONG PRESS ON WRITING PICKS UP ITS TERM; THE SAME FINGER MOVES IT. */
    if (!(await fresh(env))) throw new Error('stop');
    await glyph();
    {
      g = await geo(env);
      const bx = (await items(env))[0].box, a = g.book.w / 360 * g.nv.z;
      const cx = g.book.l + ((bx.l + bx.r) / 2 - g.nv.x) * a, cy = g.book.t + ((bx.t + bx.b) / 2 - g.nv.y) * a;
      await T(env, 'touchStart', [P(cx, cy)]);
      for (let t = 0; t < 750; t += 50) { await sleep(50); await T(env, 'touchMove', [P(cx + 0.3, cy)]); }
      const picked = (await geo(env)).sel;
      for (let i = 1; i <= 10; i++) { await T(env, 'touchMove', [P(cx + i * 4, cy + i * 2)]); await sleep(12); }
      await T(env, 'touchEnd', []);
      await sleep(150);
      const nbx = (await items(env)).map(i => i.box);
      const dx = Math.min(...nbx.map(b => b.l)) - bx.l;
      want(picked === 2 && Math.abs(dx - 40 / a) < 2, 'a long press on the x picks up both its strokes, and dragging moves them', `picked ${picked}, moved ${dx.toFixed(1)} units, wanted ${(40 / a).toFixed(1)}`);
    }

    /* AFTER A RELOAD THE BOARD IS STILL THERE. */
    {
      const n = (await stored(env)).length;
      await env.page.reload({ waitUntil: 'domcontentloaded' });
      await env.page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof initBoard_ === 'function', null, { timeout: 90000 });
      await sleep(600);
      await fresh(env, true);
      want(n > 0 && (await items(env)).length === n, 'a reload draws the same board from the device', `${n} stored, ${(await items(env)).length} drawn`);
    }
    want(!env.errs.length, 'no page errors on the phone', env.errs.join(' | '));
    await env.ctx.close();

    /* ==================== A LAPTOP, A MOUSE AND A KEYBOARD ==================== */
    const dk = await boot(browser, 1280, 800, port, false);
    if (!(await fresh(dk))) { bad.push('no whiteboard notebook at 1280x800'); throw new Error('stop'); }
    g = await geo(dk);
    {
      const m = dk.page.mouse, B = g.pad.t + g.py0;
      await m.move(g.pad.l + 40, B - g.xh); await m.down();
      for (let i = 1; i <= 12; i++) { await m.move(g.pad.l + 40 + i * 3, B - g.xh + i * g.xh / 12); await sleep(8); }
      await m.up();
      want((await items(dk)).length === 1, 'a mouse drag in the pad writes a stroke', (await items(dk)).length + ' items');
      await dk.page.keyboard.press('Control+z');
      const u = (await items(dk)).length;
      await dk.page.keyboard.press('Control+Shift+z');
      want(u === 0 && (await items(dk)).length === 1, 'Ctrl+Z undoes it and Ctrl+Shift+Z puts it back', u + ' then ' + (await items(dk)).length);
      await m.click(g.book.l + g.book.w * 0.6, g.book.t + (2 * 64 + 40) * (g.book.w / 360) - 4);
      await sleep(150);
      g = await geo(dk);
      want(g.caret.line === 2, 'a click on the page moves the caret', JSON.stringify(g.caret));
      /* A WORKING TALLER THAN THE PAGE: the wheel scrolls it, and the column stays where it is until the page is at its end. */
      await dk.page.evaluate(() => { const st = nbState_(padKey_(WB_ITEM)); st.caret = { line: 12, x: 20 }; });
      const page0 = await dk.page.evaluate(() => PAGE.tools);
      await m.move(g.book.l + 50, g.book.t + 50);
      await m.wheel(0, 120);
      await sleep(300);
      const after = await dk.page.evaluate(() => [nbState_(padKey_(WB_ITEM)).nv.y, PAGE.tools, AT]);
      want(after[0] > 0 && after[1] === page0 && after[2] === 'tools', 'the wheel scrolls a long page and leaves the column where it is', JSON.stringify({ page0, after }));
      await shot(dk.page, '1280');
    }
    want(!dk.errs.length, 'no page errors on the laptop', dk.errs.join(' | '));
    await dk.ctx.close();
  } catch (e) {
    if (e.message !== 'stop') bad.push('the check itself failed: ' + (e.stack || e.message).slice(0, 400));
  } finally {
    await browser.close();
    server.close();
  }
  if (bad.length) {
    console.log('FAILED — the whiteboard notebook, ' + bad.length + ' of ' + (bad.length + proved) + ':');
    bad.forEach(b => console.log('  ' + b));
    process.exit(1);
  }
  console.log('OK — the whiteboard notebook: ' + proved + ' things a finger and a mouse do, each as wanted');
})();
