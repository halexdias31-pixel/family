#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/types.js EVERY INTERACTION TYPE, ANSWERED AS A CHILD ANSWERS IT (385). § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.TYPES_PORT || 22801);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const arg = k => ((process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const ONLY_T = arg('type'), ONLY_R = arg('row'), ONLY_E = arg('env');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.webmanifest': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIN_PX = 44;
/* THE PHONES ARE TOUCH AND THE DESKTOP IS A MOUSE: the same card, the two ways a child reaches it. */
const ENVS = [
  { id: 'phone', W: 390, H: 844, touch: true },
  { id: 'ipad', W: 820, H: 1180, touch: true },
  { id: 'desktop', W: 1280, H: 800, touch: false },
];
/* NOT DRIVEN, with the reason: nothing on the card marks them by machine, so there is no Correct to reach. */
const UNDRIVEN = { essay: 'marked by AI against the scheme, never by machine', print: 'answered on the printed sheet; nothing on screen' };
/* THEO'S QUESTION (385): five options, one pair of brackets, and taps that did nothing after the first. */
const PINNED = { choose1: ['Q-1MA1-2406-1F-11c'], measure: ['Q-1MA1-2406-2F-7b', 'Q-1MA1-2406-2F-7a', 'Q-CBM-angles-measuring-drawing-13'] };
const PER_TYPE = 2;
/* KNOWN, with the reason, and still printed: */
const ACCEPTED = {
  'desktop Q-1MA1-2406-1H-13a': 'a mouse\'s held corner is straightened onto the printed grid (368); this histogram\'s example heights sit 2 units off its grid lines, so one bar lands outside 0.3 of a square. Open: reported in 385',
  'Q-1MA1-1911-1H-4': 'the scheme\'s example arcs swing below the printed figure (to 421 of 340); arcs a child draws on the picture are another drawing, and this row\'s marker is proven on its example in check-flow',
};

/* ---------- WHICH ROWS: real, machine-marked, Corbettmaths first, then GCSE Maths, then SATs */
function pickRows() {
  const Q = vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'qtypes.js'), 'utf8') + ';({ qType_, qtMachine_, QTYPE_ORDER })', vm.createContext({}));
  const rows = require('./lib-full.js').rows('questions');
  const by = {};
  rows.forEach(r => {
    if (String(r.active).toLowerCase() === 'false') return;
    let t = ''; try { t = Q.qType_(r); } catch (e) { return; }
    let m = false; try { m = Q.qtMachine_(r); } catch (e) {}
    if (m) (by[t] = by[t] || []).push(r);
  });
  const rank = r => /^Q-CBM-/.test(r.row_id) ? 0 : /^Q-1MA1-/.test(r.row_id) ? 1 : /STA|SATS|KS2/i.test(r.row_id + r.paper_id) ? 2 : 3;
  const out = {};
  Q.QTYPE_ORDER.forEach(t => {
    const l = (by[t] || []).slice().sort((a, b) => rank(a) - rank(b));
    const seen = new Set(), pick = [];
    (PINNED[t] || []).forEach(id => { pick.push(id); seen.add(id); });
    /* one from each source in rank order, then more of the best, so two rows are never the same paper's twins */
    for (const g of [0, 1, 2, 3]) { const r = l.find(x => rank(x) === g && !seen.has(x.row_id)); if (r) { pick.push(r.row_id); seen.add(r.row_id); } }
    l.forEach(r => { if (!seen.has(r.row_id)) { pick.push(r.row_id); seen.add(r.row_id); } });
    out[t] = pick;
  });
  return { order: Q.QTYPE_ORDER, rows: out };
}

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT, () => ok(s));
  });
}

const found = [];
let driven = 0, steps = 0;
const fail = (env, t, row, msg) => found.push(`${env.id} ${t} ${row}: ${msg}`);

async function boot(browser, E) {
  const ctx = await browser.newContext({ viewport: { width: E.W, height: E.H }, deviceScaleFactor: 2,
    isMobile: E.touch, hasTouch: E.touch, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; window.open = () => null; });
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS
    && typeof stuffItemsAll_ === 'function', null, { timeout: 90000 });
  await sleep(1200);
  const cdp = E.touch ? await ctx.newCDPSession(page) : null;
  return { ctx, page, cdp, errs, E };
}

/* ---------- THE CARD, on Find, on its paper's page, its store emptied first */
async function open(env, row) {
  return env.page.evaluate(async r => {
    go('stuff', false, true);
    const hit = stuffItemsAll_().find(x => x.row && x.row.row_id === r);
    if (!hit) return { err: 'not in the library' };
    try { localStorage.removeItem(ansKey_(hit)); } catch (e) {}
    try { if (typeof padKey_ === 'function') ansStore_(padKey_(hit), null); } catch (e) {}
    try { const all = JSON.parse(localStorage.getItem('subLast:' + whoIs_()) || '{}') || {}; delete all[subKeyOf_(ansKey_(hit))];
      try { delete all[subKeyOf_(padKey_(hit))]; } catch (e) {} localStorage.setItem('subLast:' + whoIs_(), JSON.stringify(all)); } catch (e) {}
    try { subForget_(); } catch (e) {}
    try { ORDER_HOLE.clear(); } catch (e) {}
    STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
    paintStuff(true);
    await new Promise(z => setTimeout(z, 600));
    const h2 = stuffFiltered().find(x => x.row && x.row.row_id === r) || hit;
    goPage('stuff', stuffPageOf_(h2) + stuffFirstResult_(), true);
    await new Promise(z => setTimeout(z, 1400));
    const k = ansKey_(h2), pk = typeof padKey_ === 'function' ? padKey_(h2) : '';
    const page = document.querySelector('#s-stuff .page.on');
    const card = page && [...page.querySelectorAll('.qcard')].find(c =>
      c.querySelector(`[data-k="${CSS.escape(k)}"]`) || (pk && c.querySelector(`.qpad[data-k="${CSS.escape(pk)}"]`)));
    if (!card) return { err: 'its card is not on the page it was sent to' };
    document.querySelectorAll('.qcard.__tq').forEach(c => c.classList.remove('__tq'));
    card.classList.add('__tq');
    window.__tk = { k, pk };
    return { k, pk };
  }, row);
}
const C = '#s-stuff .page.on .qcard.__tq';

/* ---------- A TARGET, MEASURED WHERE THE FINGER WILL LAND: centre, size, and what is really under it */
async function measure(env, sel, i) {
  return env.page.evaluate(([sel, i]) => {
    const all = [...document.querySelectorAll(sel)];
    const el = all[i || 0];
    if (!el) return null;
    let r = el.getBoundingClientRect();
    if (r.top < 60 || r.bottom > innerHeight - 20) {
      /* INTO VIEW BY ITS OWN SCROLLING COLUMN, never the window: the screens sit side by side */
      let p = el.parentElement;
      while (p && !(p.scrollHeight > p.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
      if (p) { p.scrollTop += r.top - innerHeight / 2 + r.height / 2; r = el.getBoundingClientRect(); }
    }
    /* AND SIDEWAYS BY A BOX THAT WAS TOLD IT MAY SCROLL SIDEWAYS (a wide table), as a finger would slide it */
    for (let q = el.parentElement; q && !q.classList.contains('page'); q = q.parentElement) {
      if (q.scrollWidth > q.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(q).overflowX)) {
        const b = q.getBoundingClientRect();
        if (r.left < b.left || r.right > b.right) { q.scrollLeft += r.left - (b.left + b.width / 2) + r.width / 2; r = el.getBoundingClientRect(); }
        break;
      }
    }
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const h = document.elementFromPoint(x, y);
    const st = getComputedStyle(el);
    return { x, y, w: r.width, h: r.height, l: r.left, t: r.top,
      hit: !!h && (h === el || el.contains(h)), on: h ? (h.tagName + '.' + String(h.className && h.className.baseVal != null ? h.className.baseVal : h.className).split(' ').slice(0, 2).join('.')) : 'nothing',
      letters: !!el.closest('.kp-key') && typeof KP_LAYER !== 'undefined' && KP_LAYER === 'abc',
      off: !!el.disabled || el.getAttribute('aria-disabled') === 'true' || st.pointerEvents === 'none' || st.visibility === 'hidden' };
  }, [sel, i || 0]);
}
/* A TAP ON IT, after asking that it can be tapped -- the asking is the check */
async function tap(env, ctx, sel, i, what, o) {
  const m = await measure(env, sel, i);
  steps++;
  if (!m) { fail(env.E, ctx.t, ctx.row, `${what}: not on the card (${sel})`); return false; }
  if (!m.hit) fail(env.E, ctx.t, ctx.row, `${what}: under its centre is ${m.on}, not the ${what} -- a tap there lands on something else`);
  if (m.off) fail(env.E, ctx.t, ctx.row, `${what}: drawn disabled or pointer-events none -- it cannot be pressed`);
  /* THE LETTERS ARE TEN ACROSS, as on the phone's own keyboard: 44px tall, and as wide as a tenth of the pad allows (32px at 390) */
  if (m.letters ? (m.h < MIN_PX || m.w < 32) : Math.min(m.w, m.h) < MIN_PX) fail(env.E, ctx.t, ctx.row, `${what}: ${Math.round(m.w)}x${Math.round(m.h)}px, under ${MIN_PX}px for a fingertip`);
  if (env.cdp) {
    await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: m.x, y: m.y, radiusX: 8, radiusY: 8, force: 1 }] });
    await sleep(60);
    await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await env.page.mouse.click(m.x, m.y);
  }
  await sleep((o && o.wait) || 260);
  return true;
}

/* ---------- WHAT THE CARD SAYS: every verdict line with words in it, and how many times each is said */
async function verdict(env) {
  return env.page.evaluate(sel => {
    const card = document.querySelector(sel);
    if (!card) return { says: [], dup: 'no card' };
    const k = window.__tk || {};
    const pads = k.pk ? [...document.querySelectorAll(`#s-stuff .page.on .qpad-send[data-pad="${CSS.escape(k.pk)}"] .qp-verdict`)] : [];
    const els = [...new Set([...card.querySelectorAll('.qp-verdict')].concat(pads))];
    const says = els.map(e => e.textContent.trim()).filter(Boolean);
    /* SAID TWICE: the same words in two visible places on the card, wherever the second one is */
    let dup = '';
    says.forEach(s => {
      const n = [...card.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === s && e.getClientRects().length).length;
      if (n > 1) dup = `"${s}" is said ${n} times on the card`;
    });
    if (new Set(says).size < says.length) dup = 'two verdict lines say the same';
    return { says, dup };
  }, C);
}
async function expectSay(env, ctx, want, when) {
  const v = await verdict(env);
  const s = v.says.join(' / ');
  const ok = want === 'wrong'
    ? v.says.length && v.says.every(x => /^Not yet|^\d+ of \d+ (marks?|cells right)/.test(x) && !/^(\d+) of \1 /.test(x))
    : v.says.length && v.says.some(x => /^Correct|^(\d+) of \1 marks?/.test(x));
  if (!ok) fail(env.E, ctx.t, ctx.row, `${when}: the card says "${s || 'nothing'}" -- wanted ${want === 'wrong' ? '"Not yet"' : '"Correct"'}`);
  if (/see Answers/.test(s)) fail(env.E, ctx.t, ctx.row, `${when}: the verdict points at "Answers", and nothing on the card is called that`);
  if (v.dup) fail(env.E, ctx.t, ctx.row, `${when}: ${v.dup}`);
  return ok;
}

/* ---------- TYPING, the child's way: on a phone the box is tapped and the gold keypad's keys tapped; on a desktop the keyboard */
async function keysFor(env) {
  return env.page.evaluate(() => [...document.querySelectorAll('.kp-key')].filter(k => k.getClientRects().length)
    .map(k => k.getAttribute('data-v')));
}
async function typeInto(env, ctx, sel, i, text, what, face) {
  /* A KEYPAD BOX IS TAPPED ON ITS FACE (`.kp-field`), which draws what is typed over the read-only input */
  if (!(await tap(env, ctx, face || sel, i, what))) return false;
  if (!env.cdp) {
    await env.page.keyboard.press('End');
    for (let n = 0; n < 40; n++) await env.page.keyboard.press('Backspace');
    /* A LAPTOP HAS NO − OR ⁄ KEY: it types - and / */
    await env.page.keyboard.type(text.replace(/\u2212/g, '-').replace(/\u2044/g, '/'), { delay: 15 });
    await sleep(150);
    return true;
  }
  /* A NATIVE BOX (a cell) TAKES THE PHONE'S OWN KEYBOARD */
  const native = await env.page.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; return !!e && !e.readOnly; }, [sel, i]);
  if (native) {
    await env.page.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; e.select && e.select(); }, [sel, i]);
    await env.page.keyboard.press('Backspace');
    await env.page.keyboard.type(text, { delay: 15 });
    await sleep(150);
    return true;
  }
  const KEY = v => `.kp-key[data-v="${v.replace(/["\\]/g, '\\$&')}"]`;
  const visibleKey = async v => (await keysFor(env)).indexOf(v) !== -1;
  const val = () => env.page.evaluate(([sel, i]) => (document.querySelectorAll(sel)[i] || {}).value || '', [sel, i]);
  /* EMPTIED FIRST, AS A CHILD EMPTIES IT: → to the end (the tap put the caret where the finger was), then ⌫ until nothing is left */
  let len = (await val()).length;
  for (let n = 0; n < len; n++) await tap(env, ctx, KEY('!right'), 0, 'the → key', { wait: 40 });
  for (let n = 0; n < len * 3 + 2 && (await val()).length; n++) await tap(env, ctx, KEY('!back'), 0, 'the ⌫ key', { wait: 40 });
  if ((await val()).length) { fail(env.E, ctx.t, ctx.row, `${what}: ⌫ could not empty "${await val()}"`); return false; }
  /* THE KEYS FOR THE TEXT: a fraction is the fraction key, its bottom, then →; a power the same; a capital ⇧ then the letter */
  const plan = [];
  const T = [...text];
  for (let i = 0; i < T.length; i++) {
    const ch = T[i];
    if (ch === '/' || ch === '\u2044' || ch === '^') {
      plan.push(ch === '^' ? '!pow' : '!frac');
      while (i + 1 < T.length && /[0-9a-z.]/i.test(T[i + 1])) plan.push(T[++i]);
      plan.push('!right');
    } else plan.push(ch === '\u2212' ? '-' : ch === '*' ? '\u00d7' : ch);
  }
  for (let v of plan) {
    const cap = /^[A-Z]$/.test(v);
    if (cap) v = v.toLowerCase();
    if (!(await visibleKey(v))) {
      for (const flip of ['!abc', '!123']) if (!(await visibleKey(v)) && (await visibleKey(flip))) await tap(env, ctx, KEY(flip), 0, `the ${flip} key`, { wait: 120 });
    }
    if (!(await visibleKey(v))) { fail(env.E, ctx.t, ctx.row, `typing "${text}": no key on the pad gives "${v}"`); return false; }
    const shifted = await env.page.evaluate(() => typeof KP_SHIFT !== 'undefined' && KP_SHIFT !== 'off');
    if (cap !== shifted && /^[a-z]$/.test(v)) await tap(env, ctx, KEY('!shift'), 0, 'the ⇧ key', { wait: 60 });
    await tap(env, ctx, KEY(v), 0, `the "${v}" key`, { wait: 60 });
  }
  await sleep(120);
  return true;
}
const KEYPAD_SAFE = s => /^[0-9a-zA-Z .,()+\-\u2212=×÷<>π:%\/\u2044^]*$/.test(s);

/* ---------- STROKES, the child's way: a finger on the phone, the mouse on the desktop, through the points in pad units (340) */
async function stroke(env, ink, pts) {
  /* ONLY WHAT IS ON THE PICTURE: an example arc may swing past its edge, and a finger landing off the pad is a swipe, not ink */
  const P = []; for (let i = 0; i + 1 < pts.length; i += 2) if (pts[i] >= 1 && pts[i] <= 339 && pts[i + 1] >= 1 && pts[i + 1] <= 339) P.push([ink.l + pts[i] / 340 * ink.w, ink.t + pts[i + 1] / 340 * ink.h]);
  if (!P.length) return;
  /* A POLYLINE IS DRAWN AS A CHILD DRAWS A SHAPE: a pause at each corner, which the pen straightens (368); a curve's many points are not corners */
  const corners = P.length > 2 && P.length <= 12 && !process.env.TYPES_NOPAUSE;
  const dense = [P[0]], hold = new Set();
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6));
    for (let j = 1; j <= n; j++) dense.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
    if (corners && i < P.length - 1) hold.add(dense.length - 1);
  }
  if (dense.length === 1) dense.push([P[0][0] + 1, P[0][1] + 1]);
  if (env.cdp) {
    const tp = p => [{ x: Math.round(p[0] * 100) / 100, y: Math.round(p[1] * 100) / 100, radiusX: 8, radiusY: 8, force: 1, id: 1 }];
    await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(dense[0]) });
    for (let i = 1; i < dense.length; i++) {
      await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(dense[i]) }); await sleep(8);
      if (hold.has(i)) for (let t = 0; t < 14; t++) { await sleep(45); await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([dense[i][0] + (t % 2) * 0.5, dense[i][1]]) }); }
    }
    await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await env.page.mouse.move(dense[0][0], dense[0][1]);
    await env.page.mouse.down();
    for (let i = 1; i < dense.length; i++) {
      await env.page.mouse.move(dense[i][0], dense[i][1]); await sleep(4);
      if (hold.has(i)) for (let t = 0; t < 14; t++) { await sleep(45); await env.page.mouse.move(dense[i][0] + (t % 2) * 0.5, dense[i][1]); }
    }
    await env.page.mouse.up();
  }
  await sleep(250);
}

/* A RING IS DRAWN FINGER-SIZED ON GLASS: § */
function fingerRings(eg, ink) {
  const px = eg.map(s => { const P = []; for (let i = 0; i + 1 < s.length; i += 2) P.push([s[i] / 340 * ink.w, s[i + 1] / 340 * ink.h]); return P; });
  const ring = P => P.length > 6 && Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 2;
  const info = px.map(P => { if (!ring(P)) return null; const m = P.reduce((a, p) => [a[0] + p[0] / P.length, a[1] + p[1] / P.length], [0, 0]);
    return { m, r: Math.max(...P.map(p => Math.hypot(p[0] - m[0], p[1] - m[1]))) }; });
  return px.map((P, i) => {
    const o = info[i];
    if (!o) {
      /* AND A SHORT STROKE (a fill's tick, a cross's arm) is drawn at least 14px long, about its middle -- shorter is a dot to a finger */
      const L = P.length > 1 ? Math.hypot(P[P.length - 1][0] - P[0][0], P[P.length - 1][1] - P[0][1]) : 0;
      if (!(L > 0 && L < 14)) return eg[i];
      const c = [(P[0][0] + P[P.length - 1][0]) / 2, (P[0][1] + P[P.length - 1][1]) / 2], g = 14 / L;
      return [].concat(...P.map(p => [(c[0] + (p[0] - c[0]) * g) / ink.w * 340, (c[1] + (p[1] - c[1]) * g) / ink.h * 340]));
    }
    const R = Math.max(...info.filter(q => q && Math.hypot(q.m[0] - o.m[0], q.m[1] - o.m[1]) < 3).map(q => q.r));
    const f = R > 0 && R < 10 ? 10 / R : 1;
    return [].concat(...P.map(p => [(o.m[0] + (p[0] - o.m[0]) * f) / ink.w * 340, (o.m[1] + (p[1] - o.m[1]) * f) / ink.h * 340]));
  });
}

/* ---------- THE PROTOCOLS: one driver per surface, every type in QTYPE_PROTOCOL reaching one of them */
const TYPED = ['value', 'unit', 'fraction', 'expr', 'words', 'reason', 'multi', 'coords'];
const CELLS = ['match', 'table'];
const DRAWN = ['label', 'points', 'line', 'shape', 'shade', 'hand', 'graph', 'construct', 'numline'];

async function driveChoice(env, ctx) {
  const o = await env.page.evaluate(sel => {
    const box = document.querySelector(sel + ' .qp-choices');
    if (!box) return null;
    return { n: box.querySelectorAll('.qp-opt').length, need: +box.getAttribute('data-need') || 1,
             right: (box.getAttribute('data-right') || '').split(',').map(Number).filter(Boolean) };
  }, C);
  if (!o || !o.right.length) return 'no options with a credited choice on the card';
  const OPT = C + ' .qp-opt';
  const wrongs = []; for (let n = 1; n <= o.n; n++) if (o.right.indexOf(n) === -1) wrongs.push(n);
  if (!wrongs.length) return 'every option is right';
  /* WRONG: all but one of the right ones, and a wrong one -- then a second wrong one, a child guessing on */
  const miss = o.right.slice(0, o.need - 1).concat(wrongs[0]);
  for (const n of miss) await tap(env, ctx, OPT, n - 1, 'option ' + n);
  await expectSay(env, ctx, 'wrong', 'after a wrong pick');
  if (wrongs.length > 1 && o.need === 1) {
    await tap(env, ctx, OPT, wrongs[1] - 1, 'option ' + wrongs[1] + ' (a second try)');
    await expectSay(env, ctx, 'wrong', 'after a second wrong pick');
  }
  /* RIGHT: take the wrong one off (choose several), then the missing right one */
  if (o.need > 1) await tap(env, ctx, OPT, (o.need === 1 ? wrongs[1] || wrongs[0] : wrongs[0]) - 1, 'the wrong option, taken back');
  for (const n of o.right) {
    const on = await env.page.evaluate(([sel, n]) => !!document.querySelector(`${sel} .qp-opt[data-n="${n}"].is-picked`), [C, n]);
    if (!on) await tap(env, ctx, OPT, n - 1, 'option ' + n + ' (right)');
  }
  await expectSay(env, ctx, 'right', 'after the right pick');
  return '';
}

async function driveOrder(env, ctx) {
  const o = await env.page.evaluate(sel => {
    const x = stuffItemsAll_().find(it => ansKey_(it) === window.__tk.k);
    return x ? { ways: orderWays_(x), n: x.choices.length } : null;
  }, C);
  if (!o || !o.ways.length) return 'no right order on the row';
  const right = o.ways[0].map(Number);
  let wrong = right.slice().reverse();
  if (o.ways.some(w => w.join(',') === wrong.join(','))) wrong = right.slice(1).concat(right[0]);
  const ITEM = n => `${C} .qp-item[data-n="${n}"]`;
  for (const n of wrong) await tap(env, ctx, ITEM(n), 0, 'item ' + n);
  await tap(env, ctx, C + ' .qp-order-send', 0, 'Check');
  await expectSay(env, ctx, 'wrong', 'after a wrong order');
  await tap(env, ctx, C + ' .qp-order-clear', 0, 'Clear');
  for (const n of right) await tap(env, ctx, ITEM(n), 0, 'item ' + n);
  await tap(env, ctx, C + ' .qp-order-send', 0, 'Check');
  await expectSay(env, ctx, 'right', 'after the right order');
  return '';
}

async function driveTyped(env, ctx) {
  const o = await env.page.evaluate(sel => {
    const card = document.querySelector(sel);
    const mark = card && card.querySelector('.qp-mark');
    if (!mark) return null;
    const boxes = card.querySelectorAll('.qp-ans-in').length;
    const accept = mark.getAttribute('data-accept') || '', rule = mark.getAttribute('data-rule') || '';
    const check = mark.querySelector('[data-do="qp-check"]') ? 'qp-check' : mark.querySelector('[data-do="qp-rule"]') ? 'qp-rule' : '';
    const ways = accept.split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
    const parts = w => {
      if (boxes <= 1) return [w];
      const c = w.match(/^\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)$/);
      if (c) return [c[1], c[2]];
      return (typeof multiSplit_ === 'function' ? multiSplit_(w) : w.split(',')).map(s => s.replace(/^[a-z]\s*=\s*/i, '').trim()).filter(Boolean);
    };
    const cands = ways.map(parts).filter(p => p.length === boxes);
    /* BY RULE: the first way of every point, which the rule gives a mark each */
    const ruled = rule ? [rule.split(';').map(p => p.split('|')[0].replace(/\+/g, ' ').trim()).filter(Boolean).join('. ')] : [];
    const wrong = boxes > 1 ? Array.from({ length: boxes }, (_, i) => String(9971 + i)) : [/[a-z]{3,}/i.test(ways[0] || ruled[0] || '') ? 'zzz' : '9973'];
    return { boxes, check, cands, ruled, wrong, accept };
  }, C);
  if (!o) return 'no answer box and Check on the card';
  if (!o.check) return 'no Check (qp-check or qp-rule) beside the box';
  let right = o.cands.find(p => p.every(s => !env.cdp || KEYPAD_SAFE(s))) || o.cands[0];
  if (!right && o.ruled.length) right = o.ruled;
  if (!right) return 'no accepted way splits into its ' + o.boxes + ' box(es)';
  const BOX = C + ' .qp-ans-in';
  const fill = async (vals, when) => {
    for (let i = 0; i < vals.length; i++) if (!(await typeInto(env, ctx, BOX, i, vals[i], 'answer box ' + (i + 1), C + ' .kp-field'))) return false;
    return true;
  };
  if (!(await fill(o.wrong))) return '';
  await tap(env, ctx, C + ` .qp-mark [data-do="${o.check}"]`, 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'wrong', 'after a wrong answer (' + o.wrong.join(', ') + ')');
  if (!(await fill(right))) return '';
  await tap(env, ctx, C + ` .qp-mark [data-do="${o.check}"]`, 0, 'Check', { wait: 400 });
  if (process.env.TYPES_DEBUG) console.log('DEBUG', await env.page.evaluate(sel => [...document.querySelectorAll(sel + ' .qp-ans-in, ' + sel + ' .qp-multi-val')].map(e => e.className + '=' + JSON.stringify(e.value)).join(' ; ') + ' accept=' + document.querySelector(sel + ' .qp-mark').getAttribute('data-accept'), C));
  await expectSay(env, ctx, 'right', 'after the right answer (' + right.join(', ') + ')');
  return '';
}

/* ---------- MEASURE (385): the Protractor or Ruler tile, the tool dragged onto the figure and turned along an arm, the reading typed, Correct */
async function driveMeasure(env, ctx) {
  const has = await env.page.evaluate(sel => [...document.querySelectorAll(sel + ' .q-meast')].map(t => t.getAttribute('data-tool')), C);
  if (!has.length) {
    const fig = await env.page.evaluate(sel => !!document.querySelector(sel + ' figure > svg') && /measure/i.test(document.querySelector(sel).textContent), C);
    if (fig) fail(env.E, ctx.t, ctx.row, 'a "measure" part with a figure has no Protractor or Ruler tile');
    return driveTyped(env, ctx);
  }
  /* EVERY FIGURE HAS BOTH (502): the scheme's unit says which one this part is read with */
  const unit = await env.page.evaluate(() => String((stuffItemsAll_().find(it => ansKey_(it) === window.__tk.k) || {}).accept || ''));
  const tool = /\b(cm|mm)\b/i.test(unit) && has.indexOf('ruler') !== -1 ? 'ruler' : has.indexOf('protractor') !== -1 ? 'protractor' : has[0];
  /* THE FIGURE READ BY THIS CHECK ITSELF: its corners, where arms meet, in figure units and on the screen */
  const geo = () => env.page.evaluate(sel => {
    const o0 = document.querySelector('#s-stuff svg.meas'), svg = o0 ? [...o0.parentNode.children].find(c => c.tagName.toLowerCase() === 'svg' && c !== o0) : document.querySelector(sel + ' figure svg');
    const G = measGeom_(svg), m = svg.getScreenCTM();
    const scr = p => { const q = svg.createSVGPoint(); q.x = p[0]; q.y = p[1]; const r = q.matrixTransform(m); return [r.x, r.y]; };
    const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    const arms = p => { const out = []; G.segs.forEach(s => { if (Math.hypot(s[0] - p[0], s[1] - p[1]) < 1) out.push([s[2], s[3]]); if (Math.hypot(s[2] - p[0], s[3] - p[1]) < 1) out.push([s[0], s[1]]); }); return out; };
    const corners = G.pts.map(p => ({ p, s: scr(p), arms: arms(p).map(q => ({ q, a: ang(p, q), s: scr(q) })) })).filter(c => c.arms.length >= 2);
    const longest = G.segs.map(s => ({ s, L: Math.hypot(s[2] - s[0], s[3] - s[1]) })).sort((a, b) => b.L - a.L)[0];
    const o = document.querySelector('#s-stuff svg.meas');
    return { corners, longest, ends: longest ? [scr([longest.s[0], longest.s[1]]), scr([longest.s[2], longest.s[3]])] : null,
      c: o ? o.getAttribute('data-c').split(',').map(Number) : null, cs: o ? scr(o.getAttribute('data-c').split(',').map(Number)) : null, rot: o ? +o.getAttribute('data-rot') : null,
      cm: typeof MEAS !== 'undefined' && MEAS ? MEAS.cm : null, accept: String((stuffItemsAll_().find(it => ansKey_(it) === window.__tk.k) || {}).accept || '') };
  }, C);
  const home = await env.page.evaluate(() => PAGE.stuff);
  /* ON A PHONE THE TOOLS FOLD BEHIND ONE TOOLS TILE (round 3, qtools.js): opened with a real tap first, as a child would */
  const folded = await env.page.evaluate(sel => {
    const r = document.querySelector(sel + ' .qt-row'), f = r && r.querySelector('.qt-fold');
    return !!f && !r.classList.contains('is-open') && getComputedStyle(f).display !== 'none';
  }, C);
  if (folded) await tap(env, ctx, `${C} .qt-row .qt-fold`, 0, 'the Tools tile');
  await tap(env, ctx, `${C} .q-meast[data-tool="${tool}"]`, 0, tool === 'protractor' ? 'the Protractor tile' : 'the Ruler tile');
  await sleep(300);
  let g = await geo();
  if (!g.c) { fail(env.E, ctx.t, ctx.row, `the ${tool} tile put no ${tool} on the figure`); return ''; }
  /* WHICH CORNER: the one whose angle the scheme's band holds, for a protractor; the longest line's first end, for a ruler */
  const band = (() => { const m = /(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)/.exec(g.accept); if (m) return [+m[1], +m[2]]; const n = g.accept.split('|').map(w => parseFloat(w)).filter(v => !isNaN(v)); return n.length ? [Math.min(...n), Math.max(...n)] : null; })();
  if (!band) return 'no band in accept to read against';
  const diff = (a, b) => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; };
  let target, armA, armB;
  if (tool === 'protractor') {
    const pick = g.corners.map(c => { let best = null; for (let i = 0; i < c.arms.length; i++) for (let j = i + 1; j < c.arms.length; j++) { const v = diff(c.arms[i].a, c.arms[j].a); if (v >= band[0] - 0.5 && v <= band[1] + 0.5) best = { c, i, j, v }; } return best; }).filter(Boolean)[0];
    if (!pick) { fail(env.E, ctx.t, ctx.row, `no corner of the figure makes an angle inside the scheme's ${band.join(' to ')}`); return ''; }
    target = Object.assign(pick.c.s.slice(), { p: pick.c.p }); armA = pick.c.arms[pick.i]; armB = pick.c.arms[pick.j];
  } else {
    if (!g.ends) return 'no line to measure';
    target = g.ends[0];
  }
  /* DRAG IT: from a point on its body near its centre (or zero) to a few pixels off the corner -- the snap does the rest */
  const grab = await env.page.evaluate(([sel, tool]) => { const b = document.querySelector('#s-stuff svg.meas .meas-body').getBoundingClientRect(); return tool === 'protractor' ? [b.left + b.width / 2, b.bottom - Math.min(14, b.height * 0.2)] : [b.left + b.width * 0.4, b.top + b.height / 2]; }, [C, tool]);
  const off = [grab[0] - g.cs[0], grab[1] - g.cs[1]];
  const drag = async (from, to) => {
    const n = 14;
    if (env.cdp) {
      const tp = p => [{ x: p[0], y: p[1], radiusX: 6, radiusY: 6, force: 1, id: 1 }];
      await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(from) });
      for (let i = 1; i <= n; i++) { await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([from[0] + (to[0] - from[0]) * i / n, from[1] + (to[1] - from[1]) * i / n]) }); await sleep(16); }
      await env.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await env.page.mouse.move(from[0], from[1]); await env.page.mouse.down(); await env.page.mouse.move(to[0], to[1], { steps: n }); await env.page.mouse.up(); }
    await sleep(250);
  };
  const s0 = await env.page.evaluate(() => ({ at: AT, page: PAGE.stuff }));
  await drag(grab, [target[0] + off[0] + 6, target[1] + off[1] - 5]);
  g = await geo();
  steps++;
  if (process.env.TYPES_DEBUG) console.log('DEBUG meas', JSON.stringify({ grab, target, off, cs: g.cs, c: g.c, corners: g.corners.map(c => c.p) }));
  /* THE CORNER WHERE IT IS NOW: the page may settle a pixel while the finger is down (502) */
  const tp = target.p;
  if (tp) { const cn = g.corners.find(c => Math.hypot(c.p[0] - tp[0], c.p[1] - tp[1]) < 0.01); if (cn) target = Object.assign(cn.s.slice(), { p: tp }); }
  else if (g.ends) target = g.ends[0];
  if (!g.cs || Math.hypot(g.cs[0] - target[0], g.cs[1] - target[1]) > 0.75) fail(env.E, ctx.t, ctx.row, `the ${tool} dropped 8px from the corner sits at ${g.cs && g.cs.map(v => v.toFixed(1))} (c ${g.c}), not snapped onto ${target.map(v => v.toFixed(1))}`);
  const s1 = await env.page.evaluate(() => ({ at: AT, page: PAGE.stuff }));
  if (s1.at !== s0.at || s1.page !== s0.page) fail(env.E, ctx.t, ctx.row, 'dragging the tool moved the screen');
  /* TURN IT: by the round handle, to about 5° off the arm -- the snap lays it along */
  const want = tool === 'protractor' ? armA.a : (() => { const L = g.longest.s; return Math.atan2(L[3] - L[1], L[2] - L[0]) * 180 / Math.PI; })();
  if (diff(g.rot, want) > 0.5) {
    const h = await env.page.evaluate(sel => { const b = document.querySelector('#s-stuff svg.meas .meas-turn').getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2, e = document.elementFromPoint(x, y); return [x, y, e ? String(e.getAttribute('class') || e.tagName) : 'nothing', Math.min(b.width, b.height)]; }, C);
    steps++;
    if (!/meas-turn/.test(h[2])) fail(env.E, ctx.t, ctx.row, `the ${tool}'s turning handle: under its centre is ${h[2]}`);
    if (h[3] < MIN_PX) fail(env.E, ctx.t, ctx.row, `the ${tool}'s turning handle is ${Math.round(h[3])}px, under ${MIN_PX}px`);
    /* THE HANDLE KEEPS ITS PLACE ON THE TOOL: turned by (want + 5 - rot) about the centre */
    const r = Math.hypot(h[0] - g.cs[0], h[1] - g.cs[1]), a = Math.atan2(h[1] - g.cs[1], h[0] - g.cs[0]) + (want + 5 - g.rot) * Math.PI / 180;
    await drag(h, [g.cs[0] + r * Math.cos(a), g.cs[1] + r * Math.sin(a)]);
    if (process.env.TYPES_DEBUG) console.log('DEBUG turn', JSON.stringify({ h, cs: g.cs, rot0: g.rot, want, a: a * 180 / Math.PI, r, after: await env.page.evaluate(() => [MEAS.rot, MEAS.h, MEAS.c]) }));
    g = await geo();
  }
  steps++;
  const along = tool === 'protractor' ? [armA.a, armA.a + 180] : [want];
  if (!along.some(w => diff(g.rot, w) < 0.5)) fail(env.E, ctx.t, ctx.row, `turned to 5° off the arm, the ${tool} lies at ${g.rot.toFixed(1)}°, not snapped along it (${want.toFixed(1)}°)`);
  /* READ IT, as the child reads the scale: the other arm against the baseline, or the line's far end against the cm marks */
  const reading = tool === 'protractor' ? Math.round(diff(armB.a, armA.a))
    : Math.round(g.longest.L / g.cm * 10) / 10;
  if (!(reading >= band[0] && reading <= band[1])) fail(env.E, ctx.t, ctx.row, `the ${tool} reads ${reading}, outside the scheme's ${band.join(' to ')} -- its scale does not read true to the paper`);
  /* BACK TO THE BOX, where the tool turned the page to the figure (a part whose words ran on): the swipe back, by the app's own page turn */
  await env.page.evaluate(h => { if (PAGE.stuff !== h) goPage('stuff', h, true); }, home);
  await sleep(300);
  await typeInto(env, ctx, C + ' .qp-ans-in', 0, '1', 'answer box 1', C + ' .kp-field');
  await tap(env, ctx, C + ' .qp-mark [data-do="qp-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'wrong', 'after a wrong reading (1)');
  await typeInto(env, ctx, C + ' .qp-ans-in', 0, String(reading), 'answer box 1', C + ' .kp-field');
  await tap(env, ctx, C + ' .qp-mark [data-do="qp-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'right', `after the ${tool}'s reading (${reading})`);
  await tap(env, ctx, `${C} .q-meast[data-tool="${tool}"]`, 0, 'the tile again, to put it away');
  await sleep(200);
  if (await env.page.evaluate(() => !!document.querySelector('#s-stuff svg.meas'))) fail(env.E, ctx.t, ctx.row, `the ${tool} tile pressed again left the ${tool} on the figure`);
  return '';
}

async function driveCells(env, ctx) {
  const o = await env.page.evaluate(sel => {
    const x = stuffItemsAll_().find(it => ansKey_(it) === window.__tk.k);
    const cells = x ? cellsOf_(x) : [];
    /* EACH CELL BY ITS OWN data-n: a `-` in `cells` is a given, drawn as no cell at all */
    const els = [...document.querySelectorAll(sel + ' .qp-cell')];
    const way = c => String((c && c.ways) || '').split('|')[0].trim();
    return { n: els.length, right: els.map(e => way(cells[+e.getAttribute('data-n')])), raw: JSON.stringify(cells).slice(0, 200) };
  }, C);
  if (!o.n) return 'no cells on the card';
  if (o.right.some(v => !v)) return 'cannot read a right value per cell from cellsOf_: ' + o.raw;
  const CELL = C + ' .qp-cell';
  for (let i = 0; i < o.n; i++) await typeInto(env, ctx, CELL, i, i === 0 ? 'zzz9' : o.right[i], 'cell ' + (i + 1));
  await tap(env, ctx, C + ' [data-do="qp-cells-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'wrong', 'after one cell wrong');
  await typeInto(env, ctx, CELL, 0, o.right[0], 'cell 1, refilled');
  await tap(env, ctx, C + ' [data-do="qp-cells-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'right', 'after every cell right');
  return '';
}

async function driveDrawn(env, ctx) {
  const PAD = `#s-stuff .page.on .qpad[data-k="${await env.page.evaluate(() => CSS.escape(window.__tk.pk))}"]`;
  const SEND = `#s-stuff .page.on .qpad-send[data-pad="${await env.page.evaluate(() => CSS.escape(window.__tk.pk))}"]`;
  const has = await env.page.evaluate(([p, s]) => !!document.querySelector(p) && !!document.querySelector(s), [PAD, SEND]);
  if (!has) {
    /* A LABEL MAY BE CELLS OR A BOX RATHER THAN THE PEN (QTYPE_PROTOCOL.label): driven by what the card draws */
    const k = await env.page.evaluate(sel => document.querySelector(sel + ' .qp-cell') ? 'cells' : document.querySelector(sel + ' .qp-ans-in') ? 'typed' : '', C);
    if (k === 'cells') return driveCells(env, ctx);
    if (k === 'typed') return driveTyped(env, ctx);
    return 'no pen pad, cells or box on the card';
  }
  const eg = await env.page.evaluate(([p, s]) => {
    const pad = document.querySelector(p), row = document.querySelector(s), art = pad.querySelector('.qpad-art > svg:first-child');
    return DRAW_MARK.example(row.getAttribute('data-draw'), drawFig_(art ? (art.__src || art.outerHTML) : ''));
  }, [PAD, SEND]);
  if (!eg.length) return 'draw_answer gives no example drawing';
  const inkM = await measure(env, PAD + ' .qpad-ink', 0);
  if (!inkM) return 'no ink layer on the pad';
  const ink = { l: inkM.l, t: inkM.t, w: inkM.w, h: inkM.h };
  if (!inkM.hit) fail(env.E, ctx.t, ctx.row, `the ink: under its centre is ${inkM.on} -- a finger there does not reach the pen`);
  const stored = () => env.page.evaluate(() => { try { return JSON.parse(ansValue_(window.__tk.pk) || '[]').length; } catch (e) { return -1; } });
  /* WRONG: a short tick in a corner, the first thing the child does with the pen -- it must be kept, not eaten by arming */
  await stroke(env, ink, [20, 20, 34, 30]);
  if ((await stored()) < 1) {
    fail(env.E, ctx.t, ctx.row, 'the first stroke on the pad was not kept -- the child\'s first mark vanishes');
    await stroke(env, ink, [20, 20, 34, 30]);
  }
  await tap(env, ctx, SEND + ' [data-do="pad-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'wrong', 'after a wrong drawing');
  await tap(env, ctx, PAD + ' [data-do="pad-clear"]', 0, 'Clear');
  if ((await stored()) !== 0) fail(env.E, ctx.t, ctx.row, 'Clear left marks on the pad');
  for (const s of env.cdp ? fingerRings(eg, ink) : eg) await stroke(env, ink, s);
  if (process.env.TYPES_DEBUG) console.log('DEBUG mark', await env.page.evaluate(([p, s, eg, sc]) => {
    const pad = document.querySelector(p), row = document.querySelector(s), art = pad.querySelector('.qpad-art > svg:first-child');
    const f = drawFig_(art.__src || art.outerHTML), d = row.getAttribute('data-draw');
    const m = v => JSON.stringify(DRAW_MARK.mark(v, d, f, row.getAttribute('data-marks')));
    return JSON.stringify(padRead_(window.__tk.pk)).slice(0,900) + ' SC ' + JSON.stringify(sc.map(x => x.map(Math.round))).slice(0,900) + ' stored ' + m(padRead_(window.__tk.pk)) + ' eg ' + m(eg) + ' scaled ' + m(sc);
  }, [PAD, SEND, eg, fingerRings(eg, ink)]));
  if (process.env.TYPES_DEBUG) console.log('DEBUG eg', JSON.stringify(eg).slice(0, 300), 'stored', await stored(), 'ink', JSON.stringify(ink), await env.page.evaluate(() => JSON.stringify({ at: AT, page: PAGE.stuff, v: ansValue_(window.__tk.pk) }).slice(0, 400)));
  await tap(env, ctx, SEND + ' [data-do="pad-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'right', 'after the example drawing');
  return '';
}

/* ---------- EDITING WHAT IS WRITTEN, LIKE iOS (385): "editing a text box of text you've already written is hard and clunky" */
const EDIT_ROWS = { maths: ['Q-CBM-times-tables-1', 'Q-1MA1-2406-1H-9'], words: ['Q-1MA1-2406-1H-2b', 'Q-CBM-bar-charts-7'] };
async function edits(env) {
  const ctx = { t: 'editing', row: '' };
  const st = () => env.page.evaluate(sel => { const i = document.querySelector(sel + ' .qp-ans-in'); return i ? { v: i.value, a: i.selectionStart, b: i.selectionEnd, live: KP_AT === i, at: AT, page: PAGE.stuff,
    loupe: !!document.querySelector('#kp-loupe:not([hidden])'), handles: document.querySelectorAll(sel + ' .kp-handle').length } : null; }, C);
  /* WHERE CHARACTER i STARTS, measured on the drawing itself: the text's own glyph boxes, not the app's hit test */
  const xAt = (i) => env.page.evaluate(([sel, i]) => {
    const show = document.querySelector(sel + ' .kp-show');
    const w = document.createTreeWalker(show, NodeFilter.SHOW_TEXT), r = document.createRange();
    let n = 0, last = null;
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      for (let j = 0; j < t.length; j++) {
        r.setStart(t, j); r.setEnd(t, j + 1);
        const b = r.getBoundingClientRect();
        if (n === i) return { x: b.left + 1, y: b.top + b.height / 2 };
        last = b; n++;
      }
    }
    return last ? { x: last.right - 1, y: last.top + last.height / 2 } : null;
  }, [C, i]);
  const touch = async (type, x, y) => env.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 6, radiusY: 6, force: 1 }] });
  const tapAt = async (x, y) => { if (env.cdp) { await touch('touchStart', x, y); await sleep(50); await touch('touchEnd'); } else await env.page.mouse.click(x, y); await sleep(220); };
  const key = v => `.kp-key[data-v="${v}"]`;
  const press = async v => { if (env.cdp) await tap(env, ctx, key(v), 0, `the "${v}" key`, { wait: 80 }); else { await env.page.keyboard.type(v); await sleep(80); } };
  const back = async () => { if (env.cdp) await tap(env, ctx, key('!back'), 0, 'the ⌫ key', { wait: 80 }); else { await env.page.keyboard.press('Backspace'); await sleep(80); } };
  const want = (got, v, what) => { steps++; if (!got || got.v !== v) fail(env.E, 'editing', ctx.row, `${what}: the box says ${JSON.stringify(got && got.v)}, wanted ${JSON.stringify(v)}`); return got && got.v === v; };

  if (env.cdp && process.env.TYPES_DEBUG) await env.page.evaluate(() => { window.__pm = []; document.addEventListener('pointermove', e => window.__pm.push(Math.round(e.clientX) + (KP_EDIT ? KP_EDIT.mode : KP_SPACE ? 'S' + KP_SPACE.on : '-')), true); });
  for (const kind of ['maths', 'words']) {
    let row = null;
    for (const r of EDIT_ROWS[kind]) { const o = await open(env, r).catch(() => ({ err: 1 })); if (!o.err && await env.page.evaluate(sel => !!document.querySelector(sel + ' .qp-ans-in'), C)) { row = r; break; } }
    if (!row) { found.push(`${env.E.id} editing: no ${kind} box to edit among ${EDIT_ROWS[kind].join(', ')}`); continue; }
    ctx.row = row;
    const text = kind === 'maths' ? '12345' : 'The bars are tall';
    if (!(await typeInto(env, ctx, C + ' .qp-ans-in', 0, text, 'the box', C + ' .kp-field'))) continue;
    const s0 = await st();
    /* 1. A TAP INSIDE THE TEXT PUTS THE CARET EXACTLY THERE, and a key types there, not at the end */
    const p2 = await xAt(2);
    await tapAt(p2.x, p2.y);
    await press(kind === 'maths' ? '9' : 'x');
    want(await st(), text.slice(0, 2) + (kind === 'maths' ? '9' : 'x') + text.slice(2), 'a tap between the 2nd and 3rd characters, then a key');
    await back();
    want(await st(), text, '⌫ at the caret');
    /* 2. HELD, THE LOUPE COMES UP AND THE CARET FOLLOWS THE FINGER; the page does not move */
    if (env.cdp) {
      const a = await xAt(1), b = await xAt(4);
      await touch('touchStart', a.x, a.y); await sleep(480);
      const mid = await st();
      if (!mid.loupe) fail(env.E, 'editing', row, 'a finger held on the text brought up no loupe');
      for (let i = 1; i <= 10; i++) { await touch('touchMove', a.x + (b.x - a.x) * i / 10, a.y); await sleep(20); }
      await touch('touchEnd'); await sleep(250);
      const s2 = await st();
      steps++;
      if (process.env.TYPES_DEBUG) console.log('DEBUG', a.x, b.x, await env.page.evaluate(([x, y]) => { const r = window.__pm.join(' '); window.__pm = []; return r + ' place=' + kpPlace_(document.querySelector('.__tq .qp-ans-in'), x, y); }, [b.x, b.y]));
      if (s2.a !== 4 || s2.b !== 4) fail(env.E, 'editing', row, `held at character 1 and dragged to 4, the caret is at ${s2.a}-${s2.b}`);
      if (s2.loupe) fail(env.E, 'editing', row, 'the loupe stayed up after the finger lifted');
      if (s2.at !== s0.at || s2.page !== s0.page) fail(env.E, 'editing', row, `dragging the caret moved the screen (${s0.at}/${s0.page} to ${s2.at}/${s2.page})`);
      await press(kind === 'maths' ? '7' : 'y');
      want(await st(), text.slice(0, 4) + (kind === 'maths' ? '7' : 'y') + text.slice(4), 'typed where the dragged caret was left');
      await back();
      /* 3. THE SPACE BAR AS A TRACKPAD: slid left three steps, the caret goes three back, and no space is typed */
      const sp = await measure(env, key(' '), 0);
      if (sp) {
        const c0 = (await st()).a;
        await touch('touchStart', sp.x, sp.y); await sleep(60);
        for (let i = 1; i <= 9; i++) { await touch('touchMove', sp.x - 27 * i / 9 - 4, sp.y); await sleep(20); }
        await touch('touchEnd'); await sleep(250);
        const s3 = await st();
        steps++;
        if (s3.v !== text) fail(env.E, 'editing', row, `sliding on the space bar typed: the box says ${JSON.stringify(s3.v)}`);
        if (s3.a !== Math.max(0, c0 - 3)) fail(env.E, 'editing', row, `the space bar slid 31px left moved the caret from ${c0} to ${s3.a}, wanted ${Math.max(0, c0 - 3)}`);
      } else fail(env.E, 'editing', row, 'no space bar on the pad to slide');
    }
    /* 4. A DOUBLE TAP SELECTS THE WORD, its handles come up, and ⌫ takes the selection */
    const w = kind === 'maths' ? [0, 5] : [4, 8];
    const p = await xAt(w[0] + 1);
    if (env.cdp) { await touch('touchStart', p.x, p.y); await sleep(40); await touch('touchEnd'); await sleep(120); await touch('touchStart', p.x, p.y); await sleep(40); await touch('touchEnd'); await sleep(250); }
    else { await tapAt(p.x, p.y); await env.page.mouse.click(p.x, p.y); await sleep(250); }
    const s4 = await st();
    steps++;
    if (s4.a !== w[0] || s4.b !== w[1]) fail(env.E, 'editing', row, `a double tap on "${text.slice(w[0], w[1])}" selected ${s4.a}-${s4.b}, wanted ${w[0]}-${w[1]}`);
    else {
      if (s4.handles !== 2) fail(env.E, 'editing', row, `a selection shows ${s4.handles} handle(s), wanted 2`);
      /* 5. THE END HANDLE DRAGGED BACK ONE CHARACTER shortens the selection (a mouse drags it the same way) */
      const hb = await env.page.evaluate(sel => { const h = document.querySelector(sel + ' .kp-handle-b'); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.left + 1, y: r.bottom + 14 }; }, C);
      const to = await xAt(w[1] - 1);
      if (hb && to) {
        if (env.cdp) { await touch('touchStart', hb.x, hb.y); for (let i = 1; i <= 8; i++) { await touch('touchMove', hb.x + (to.x - hb.x) * i / 8, hb.y); await sleep(20); } await touch('touchEnd'); }
        else { await env.page.mouse.move(hb.x, hb.y); await env.page.mouse.down(); await env.page.mouse.move(to.x, hb.y, { steps: 6 }); await env.page.mouse.up(); }
        await sleep(250);
        const s5 = await st();
        steps++;
        if (s5.a !== w[0] || s5.b !== w[1] - 1) fail(env.E, 'editing', row, `the end handle dragged back one character left the selection ${s5.a}-${s5.b}, wanted ${w[0]}-${w[1] - 1}`);
      }
      await back();
      const s6 = await st();
      want(s6, text.slice(0, w[0]) + text.slice(w[0] + (s6.v.length === text.length - (w[1] - w[0]) ? w[1] - w[0] : w[1] - 1 - w[0])), '⌫ on a selection takes the selection');
    }
    /* 6. A MOUSE DRAGS TO SELECT, and the arrow keys move the caret */
    if (!env.cdp) {
      await typeInto(env, ctx, C + ' .qp-ans-in', 0, text, 'the box', C + ' .kp-field');
      const a = await xAt(0), b = await xAt(3);
      await env.page.mouse.move(a.x, a.y); await env.page.mouse.down(); await env.page.mouse.move(b.x, b.y, { steps: 6 }); await env.page.mouse.up(); await sleep(250);
      const s7 = await st();
      steps++;
      if (s7.a !== 0 || s7.b !== 3) fail(env.E, 'editing', row, `a mouse drag over the first three characters selected ${s7.a}-${s7.b}`);
      await env.page.keyboard.press('ArrowRight'); await env.page.keyboard.press('ArrowLeft'); await sleep(120);
      const s8 = await st();
      steps++;
      if (s8.a !== 2 || s8.b !== 2) fail(env.E, 'editing', row, `→ then ← after the selection left the caret at ${s8.a}-${s8.b}, wanted 2`);
    }
    console.log(`  ${env.E.id} editing ${kind} ${row}: done`);
  }
  await env.page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); kpClose_(); } catch (e) {} });
}

/* ---------- A TRANSLATION ANSWERED WITH THE KEYPAD'S COLUMN VECTOR (385): June 2024 Foundation 1, Q19, "nothing on the keypad for vectors" */
async function vector(env) {
  const row = 'Q-1MA1-2406-1F-19', ctx = { t: 'vector', row };
  const o = await open(env, row).catch(e => ({ err: e.message }));
  if (o.err) { found.push(`${env.E.id} vector ${row}: ${o.err}`); return; }
  const tag = await env.page.evaluate(sel => /Printed sheet/.test(document.querySelector(sel).textContent), C);
  if (tag) fail(env.E, 'vector', row, 'the card says "Printed sheet" though it is answered and marked on screen');
  if (!(await tap(env, ctx, C + ' .kp-field', 0, 'the answer box'))) return;
  const vk = await measure(env, '#kp .kp-key[data-v="!vec"]', 0);
  if (!vk) { fail(env.E, 'vector', row, 'no column-vector key on the pad for a translation'); return; }
  const st = () => env.page.evaluate(sel => { const i = document.querySelector(sel + ' .qp-ans-in'); const v = document.querySelector(sel + ' .kp-show .vec'); return { v: i.value, vec: v ? [...v.children].map(c => c.textContent.trim()) : null }; }, C);
  if (env.cdp) {
    await typeInto(env, ctx, C + ' .qp-ans-in', 0, 'Translation ', 'the answer box', C + ' .kp-field');
    await tap(env, ctx, '#kp .kp-key[data-v="!vec"]', 0, 'the column-vector key', { wait: 100 });
    for (const k of ['!123', '5', '!right', '-', '4']) { if (k === '!123' && !(await env.page.evaluate(() => !!document.querySelector('#kp .kp-key[data-v="!123"]')))) continue; await tap(env, ctx, `#kp .kp-key[data-v="${k}"]`, 0, `the "${k}" key`, { wait: 80 }); }
  } else {
    await typeInto(env, ctx, C + ' .qp-ans-in', 0, 'Translation ', 'the answer box', C + ' .kp-field');
    await env.page.keyboard.press('End');
    await tap(env, ctx, '#kp .kp-key[data-v="!vec"]', 0, 'the column-vector key', { wait: 100 });
    await env.page.keyboard.type('5'); await env.page.keyboard.press('ArrowRight'); await env.page.keyboard.type('-4');
  }
  await sleep(150);
  const s1 = await st();
  steps++;
  if (s1.v !== 'Translation \u27ee5,-4\u27ef') fail(env.E, 'vector', row, `the box holds ${JSON.stringify(s1.v)}, wanted "Translation ⟮5,-4⟯"`);
  if (!s1.vec || s1.vec[0] !== '5' || !/^[-\u2212]4$/.test(s1.vec[1])) fail(env.E, 'vector', row, `the box draws the vector as ${JSON.stringify(s1.vec)}, wanted 5 over -4`);
  await tap(env, ctx, C + ' .qp-mark [data-do="qp-rule"], ' + C + ' .qp-mark [data-do="qp-check"]', 0, 'Check', { wait: 400 });
  await expectSay(env, ctx, 'right', 'after "Translation" and the vector');
  console.log(`  ${env.E.id} vector ${row}: ${JSON.stringify(s1.v)} drawn ${JSON.stringify(s1.vec)}`);
  await env.page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); kpClose_(); } catch (e) {} });
}

(async () => {
  const { order, rows } = pickRows();
  let server;
  try { server = await serve(); } catch (e) { console.log('types: could not serve on ' + PORT + ' -- ' + e.message); process.exit(1); }
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  let browser;
  try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); }
  catch (e) { console.log('types: no browser -- ' + e.message); server.close(); process.exit(1); }
  const skipped = [];
  for (const E of ENVS.filter(e => !ONLY_E.length || ONLY_E.indexOf(e.id) !== -1)) {
    let env;
    try { env = await boot(browser, E); } catch (e) { found.push(`${E.id}: the app did not load -- ${e.message}`); continue; }
    if (!ONLY_T.length || ONLY_T.indexOf('vector') !== -1) await vector(env).catch(e => found.push(`${E.id} vector: the driver threw -- ${String(e.message).slice(0, 200)}`));
    if (!ONLY_T.length || ONLY_T.indexOf('editing') !== -1) await edits(env).catch(e => found.push(`${E.id} editing: the driver threw -- ${String(e.message).slice(0, 200)}`));
    for (const t of order) {
      if (ONLY_T.length && ONLY_T.indexOf(t) === -1) continue;
      if (UNDRIVEN[t]) { skipped.push(`${t}: ${UNDRIVEN[t]}`); continue; }
      const drive = t === 'choose1' || t === 'chooseN' ? driveChoice : t === 'order' ? driveOrder : t === 'measure' ? driveMeasure
        : TYPED.includes(t) ? driveTyped : CELLS.includes(t) ? driveCells : DRAWN.includes(t) ? driveDrawn : null;
      if (!drive) { found.push(`${t}: a type in QTYPE_PROTOCOL with no driver here -- add one`); continue; }
      let done = 0;
      const tried = [];
      for (const row of rows[t] || []) {
        if (done >= (PINNED[t] ? PER_TYPE + 1 : PER_TYPE)) break;
        if (ONLY_R.length && ONLY_R.indexOf(row) === -1) continue;
        const o = await open(env, row).catch(e => ({ err: e.message }));
        if (o.err) { tried.push(row + ': ' + o.err); continue; }
        const before = found.length;
        /* A DRIVER THAT THROWS IS A FAULT, never a row passed over */
        const why = await drive(env, { t, row }).catch(e => { fail(E, t, row, 'the driver threw: ' + String(e.message).split('\n')[0].slice(0, 200)); return ''; });
        /* A ROW THE DRIVER CANNOT READ IS PASSED OVER FOR THE NEXT ONE, and printed */
        if (why) { tried.push(row + ': ' + why); found.length = before; continue; }
        const acc = ACCEPTED[row] || ACCEPTED[E.id + ' ' + row];
        if (acc && found.length > before) { console.log(`  ${E.id} ${t} ${row}: accepted -- ${acc}`); found.length = before; done++; driven++; continue; }
        done++; driven++;
        console.log(`  ${E.id} ${t} ${row}: ${found.length === before ? 'wrong, changed, right' : (found.length - before) + ' fault(s)'}`);
      }
      if (!done && !ONLY_R.length) found.push(`${E.id} ${t}: no row could be driven -- ${tried.slice(0, 4).join(' | ') || 'none machine-marked'}`);
      else if (tried.length) console.log(`  ${E.id} ${t}: passed over ${tried.slice(0, 3).join(' | ')}`);
    }
    if (env.errs.length) found.push(`${E.id}: page errors -- ${[...new Set(env.errs)].slice(0, 3).join(' | ')}`);
    await env.ctx.close();
  }
  await browser.close();
  server.close();
  [...new Set(skipped)].forEach(s => console.log('  not driven, ' + s));
  if (found.length) {
    console.log(`types: ${found.length} fault(s) in ${driven} row(s) driven`);
    [...new Set(found)].forEach(f => console.log('  ' + f));
    process.exit(1);
  }
  console.log(`types: ${driven} row(s) across every interaction type, wrong then right, by touch and by mouse, ${steps} taps each a reachable target`);
})();
