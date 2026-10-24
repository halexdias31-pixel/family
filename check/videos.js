#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/videos.js THE VIDEOS CARD IN A REAL BROWSER: § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.VIDEOS_PORT || 0);
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
const ONLY = ((process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const want = k => !ONLY.length || ONLY.indexOf(k) !== -1;

const ADMIN = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
/* WHAT `doGet` SENDS A STRANGER: no film and no sync stamp (`FIXTURE_ANON` in ui.js says why). */
const ANON = JSON.parse(JSON.stringify(FIXTURE));
ANON.films = [];
delete ANON.filmsSync;

/* SIX ROWS THAT "sun" FINDS AT EVERY DEPTH, so the first letters draw four and a "more" line and the
   later ones narrow to one — the shrink the bar used to drop with. Ids are eleven made-up characters. */
const ROWS = [
  { title: 'Sun', url: 'https://www.youtube.com/watch?v=SUNaaaaaaa1', kind: 'clip', tags: 'space star', age: '', notes: '', active: true },
  { title: 'Sunsets explained', url: 'https://youtu.be/SUNSETaaaa2', kind: 'clip', tags: 'sky light', age: '', notes: '', active: true },
  { title: 'The sun and the moon', url: 'https://www.youtube.com/watch?v=SUNMOONaaa3', kind: 'clip', tags: 'space', age: '7+', notes: '', active: true },
  { title: 'Tsunami waves', url: 'https://www.youtube.com/shorts/TSUNAMIaaa4', kind: 'clip', tags: 'ocean', age: '', notes: '', active: true },
  { title: 'Weather report for kids', url: 'https://www.youtube.com/watch?v=WEATHERaaa5', kind: 'clip', tags: 'sun rain cloud', age: '', notes: '', active: true },
  { title: 'How the moon makes tides', url: 'https://www.youtube.com/watch?v=MOONTIDEaa6', kind: 'clip', tags: 'space ocean', age: '', notes: '', active: true },
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
               '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webmanifest': 'application/json' };

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel === '/data/videos.json') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(ROWS));
      }
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not here'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.on('error', no);
    s.listen(PORT_WANTED, () => ok(s));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let PORT = 0;
const found = [];
const said = [];
const fail = (rule, where, msg) => found.push({ rule, where, msg });

/* NOTHING IS READ WHILE A COLUMN IS STILL SLIDING — `check/ui.js`'s `settled`, for the same reason: the
   bar's top is a question about where the card RESTS, and the column's own transition takes it there. */
async function settled(page, min = 250) {
  await sleep(min);
  try {
    await page.evaluate(async () => {
      const t0 = performance.now();
      for (;;) {
        const moving = [...document.querySelectorAll('.screen')].some(c =>
          typeof c.getAnimations === 'function' && c.getAnimations().some(a => a.playState === 'running'));
        const booked = typeof PLACE_FRAME !== 'undefined' && !!PLACE_FRAME;
        if ((!moving && !booked) || performance.now() - t0 > 4000) break;
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
  } catch (e) { /* measured as it stands */ }
}

/* ONE PAGE, ONE VISITOR, THE GAMES COLUMN TURNED TO THE CARD. § */
async function boot(browser, W, H, who, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const loads = [];
  await page.addInitScript(([u, noFs]) => {
    try { if (u) localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
    if (noFs) {
      delete Element.prototype.requestFullscreen;
      delete Element.prototype.webkitRequestFullscreen;
      try { delete HTMLElement.prototype.webkitRequestFullscreen; } catch (e) {}
    }
  }, [who === 'admin' ? ADMIN : null, !!opts.noFs]);
  const payload = JSON.parse(JSON.stringify(who === 'admin' ? FIXTURE : ANON));
  if (opts.star) payload.favourites = ['w:videos'];
  const body = JSON.stringify(payload);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body }));
  await page.route('**://i.ytimg.com/**', r => r.fulfill({ status: 200, contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#2a6"/></svg>' }));
  /* THE PLAYER'S HOST COUNTS EVERY LOAD — a frame that reloads is a film that restarts. */
  await page.route('**://*.youtube-nocookie.com/**', r => {
    loads.push(r.request().url());
    r.fulfill({ status: 200, contentType: 'text/html', headers: { 'Cache-Control': 'no-store' },
      body: '<!doctype html><body style="margin:0;background:#522"></body>' });
  });
  await page.route('**://drive.google.com/**', r => r.fulfill({ status: 404, body: '' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com|openstreetmap|wikimedia/, r => r.fulfill({ status: 404, body: '' }));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED
    && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).catch(() => {});
  const n = await page.evaluate(() => {
    go('reel', false, true);
    return widgetsOf_('reel').findIndex(w => String(w.id) === 'videos');
  }).catch(() => -1);
  await settled(page, 500);
  if (n >= 0) await page.evaluate(n => goPage('reel', n, true), n);
  /* THE CARD IS THE LAST OF A LONG COLUMN AND WAKES LAST — waited for, bounded (`partyBoot_`'s rule). */
  await page.waitForFunction(() => !!document.querySelector('#s-reel #wgt-videos .vid-q')
    && typeof VIDEOS_LIST !== 'undefined' && VIDEOS_LIST !== null, null, { timeout: 20000 }).catch(() => {});
  await settled(page, 500);
  const ok = n >= 0 && await page.evaluate(() => !!document.querySelector('#s-reel #wgt-videos .vid-q'));
  return { ctx, page, errs, loads, ok, n };
}

const CARD = '#s-reel #wgt-videos';
const barTop = (page, card = CARD) => page.evaluate(c => {
  const b = document.querySelector(c + ' .vid-search');
  return b ? Math.round(b.getBoundingClientRect().top) : null;
}, card);
const rowsOf = (page, card = CARD) => page.evaluate(c => document.querySelectorAll(c + ' .vid-results .vid-row').length, card);

/* ---------- HOLD: THE BAR DOES NOT COME BACK DOWN WHILE A SEARCH IS TYPED § */
async function hold(browser) {
  for (const [W, H, who] of [[320, 568, 'admin'], [320, 568, 'out'], [844, 390, 'out'], [390, 844, 'admin']]) {
    const at = `${W}x${H} ${who}`;
    const { ctx, page, errs, ok } = await boot(browser, W, H, who);
    if (!ok) { fail('HOLD', at, 'the videos card never drew its search box on the Games column — nothing was asked'); await ctx.close(); continue; }
    await page.click(CARD + ' .vid-q');
    await settled(page);
    const steps = [];
    for (const k of ['s', 'u', 'n', 's', 'e', 't']) {
      await page.keyboard.type(k);
      await settled(page, 300);
      steps.push([await page.evaluate(c => document.querySelector(c + ' .vid-q').value, CARD), await barTop(page)]);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Backspace');
      await settled(page, 300);
      steps.push([await page.evaluate(c => document.querySelector(c + ' .vid-q').value, CARD), await barTop(page)]);
    }
    const line = steps.map(([v, y]) => `${v || '∅'} ${y}`).join(' → ');
    said.push(`HOLD ${at}: ${line}`);
    const rows4 = steps[0] && steps[0][1] !== null;
    if (!rows4) { fail('HOLD', at, 'no bar to measure after the first letter'); await ctx.close(); continue; }
    for (let i = 1; i < steps.length; i++) {
      if (steps[i][1] > steps[i - 1][1] + 1) {
        fail('HOLD', at, `the bar came back down ${steps[i][1] - steps[i - 1][1]}px at "${steps[i][0]}" in the middle of a search: ${line}`);
        break;
      }
    }
    /* AND A SEARCH THAT BEGINS BY LEAVING A FILM: § */
    await page.keyboard.type('unset');
    await settled(page, 300);
    const play = CARD + ' .vid-results .vid-row[data-do="vid-play"]';
    if (await page.$(play)) {
      await page.click(play);
      await settled(page, 500);
      const watching = await barTop(page);
      await page.click(CARD + ' .vid-q');
      await page.keyboard.press('End');
      await page.keyboard.press('Backspace');
      await settled(page, 400);
      const edited = await barTop(page);
      said.push(`HOLD ${at}: watching ${watching} → an edit over the film ${edited}`);
      if (edited > watching + 1) fail('HOLD', at, `an edit over the film dropped the bar ${edited - watching}px (${watching} → ${edited})`);
    } else fail('HOLD', at, 'no result that plays, so the edit over a film was not asked');
    if (errs.length) fail('HOLD', at, 'the page threw: ' + errs.join(' | '));
    await ctx.close();
  }
}

/* ---------- SEARCH: THE KEYBOARD'S SEARCH KEY LETS GO, AND THE RESULTS STAY ------------------------- */
async function search(browser) {
  const at = '390x844 out';
  const { ctx, page, errs, ok } = await boot(browser, 390, 844, 'out');
  if (!ok) { fail('SEARCH', at, 'the videos card never drew its search box — nothing was asked'); await ctx.close(); return; }
  await page.click(CARD + ' .vid-q');
  await page.keyboard.type('sun', { delay: 40 });
  await settled(page, 300);
  const before = { rows: await rowsOf(page), top: await barTop(page) };
  await page.keyboard.press('Enter');
  await settled(page, 300);
  const after = await page.evaluate(c => ({
    focused: document.activeElement === document.querySelector(c + ' .vid-q'),
    q: document.querySelector(c + ' .vid-q').value,
    rows: document.querySelectorAll(c + ' .vid-results .vid-row').length,
    playing: !!document.querySelector(c + ' .vid-watch.on'),
  }), CARD);
  after.top = await barTop(page);
  said.push(`SEARCH ${at}: before ${JSON.stringify(before)}, after Enter ${JSON.stringify(after)}`);
  if (before.rows !== 4) fail('SEARCH', at, `"sun" drew ${before.rows} results before Enter — wanted four to keep`);
  if (after.focused) fail('SEARCH', at, 'Enter left the focus in the box, so a phone keeps its keyboard up over the results');
  if (after.rows !== before.rows || after.q !== 'sun' || after.playing) fail('SEARCH', at, `Enter changed what the card shows: ${JSON.stringify(after)}`);
  if (after.top !== before.top) fail('SEARCH', at, `the bar moved ${after.top - before.top}px when Enter put the keyboard away`);
  if (errs.length) fail('SEARCH', at, 'the page threw: ' + errs.join(' | '));
  await ctx.close();
}

/* ---------- ONE: ONE TAP IS ONE PLAYER, IN THE COPY THAT WAS TAPPED --------------------------------- */
async function one(browser) {
  const at = '390x844 admin, the card starred';
  const { ctx, page, errs, loads, ok } = await boot(browser, 390, 844, 'admin', { star: true });
  if (!ok) { fail('ONE', at, 'the videos card never drew on the Games column — nothing was asked'); await ctx.close(); return; }
  await page.evaluate(() => go('saved', false, true));
  await page.waitForFunction(() => !!document.querySelector('#s-saved .vid-box .vid-q'), null, { timeout: 15000 }).catch(() => {});
  await settled(page, 500);
  const SAVED = '#s-saved';
  if (!await page.$(SAVED + ' .vid-box .vid-q')) { fail('ONE', at, 'the starred card did not draw on the Saved column — nothing was asked'); await ctx.close(); return; }
  await page.click(SAVED + ' .vid-q');
  await page.keyboard.type('sunsets', { delay: 30 });
  await settled(page, 300);
  const row = SAVED + ' .vid-results .vid-row[data-do="vid-play"]';
  if (!await page.$(row)) { fail('ONE', at, 'the Saved copy drew no result that plays for "sunsets"'); await ctx.close(); return; }
  loads.length = 0;
  await page.click(row);
  await settled(page, 700);
  const got = await page.evaluate(() => ({
    frames: [...document.querySelectorAll('.vid-player')].map(f => (f.closest('.screen') || {}).id || '?'),
    gamesRows: document.querySelectorAll('#s-reel .vid-results .vid-row').length,
    gamesWatch: !!document.querySelector('#s-reel .vid-watch.on'),
  }));
  said.push(`ONE ${at}: players in ${JSON.stringify(got.frames)}, ${loads.length} load(s) of the player's host, Reels copy ${got.gamesRows} result(s)`);
  if (got.frames.length !== 1 || got.frames[0] !== 's-saved')
    fail('ONE', at, `one tap in the Saved copy built ${got.frames.length} player(s), in ${got.frames.join(', ') || 'none'} — wanted one, in s-saved`);
  if (loads.length !== 1) fail('ONE', at, `one tap asked the player's host ${loads.length} times`);
  if (got.gamesWatch || !got.gamesRows) fail('ONE', at, 'the copy that was not tapped does not show the results for what was typed');
  if (errs.length) fail('ONE', at, 'the page threw: ' + errs.join(' | '));
  await ctx.close();
}

/* ---------- FULL: THE APP'S OWN FULL SCREEN, UPRIGHT AND ON ITS SIDE § */
const measure = page => page.evaluate(c => {
  const w = document.querySelector(c + ' .vid-watch');
  if (!w) return null;
  let open = false;
  try { open = w.matches(':popover-open'); } catch (e) {}
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  const r = w.getBoundingClientRect(), st = w.querySelector('.vid-stage').getBoundingClientRect();
  const x = w.querySelector('.vid-acts .tile[data-do="vid-unfull"]');
  const xr = x ? x.getBoundingClientRect() : null;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const g = 44 + 1.5 * rem;
  const room = vw > vh ? Math.min(vw - g, vh * 16 / 9) : Math.min(vw, (vh - g) * 16 / 9);
  const over = [[2, 2], [vw - 3, 2], [2, vh - 3], [vw - 3, vh - 3], [vw / 2, vh / 2]]
    .every(([px, py]) => { const e = document.elementFromPoint(px, py); return !!e && w.contains(e); });
  const R = a => a.map(Math.round);
  return {
    vp: vw + 'x' + vh, open, fs: w.classList.contains('is-fs'),
    whole: Math.abs(r.left) < 1 && Math.abs(r.top) < 1 && Math.abs(r.width - vw) < 1 && Math.abs(r.height - vh) < 1,
    over, block: R([r.left, r.top, r.width, r.height]), film: R([st.left, st.top, st.width, st.height]), room: Math.round(room),
    wide: Math.abs(st.width / st.height - 16 / 9) < 0.02 && st.width >= room - 2
      && st.left >= -1 && st.top >= -1 && st.right <= vw + 1 && st.bottom <= vh + 1,
    exit: xr && R([xr.left, xr.top, xr.width, xr.height]),
    clear: !!xr && xr.width >= 44 && xr.height >= 44 && xr.left >= 0 && xr.top >= 0 && xr.right <= vw && xr.bottom <= vh
      && (xr.right <= st.left || xr.left >= st.right || xr.bottom <= st.top || xr.top >= st.bottom),
  };
}, CARD);

async function full(browser) {
  for (const [W, H] of [[390, 844], [844, 390], [320, 568]]) {
    const at0 = `${W}x${H} admin, no Fullscreen API`;
    const { ctx, page, errs, loads, ok } = await boot(browser, W, H, 'admin', { noFs: true });
    if (!ok) { fail('FULL', at0, 'the videos card never drew its search box — nothing was asked'); await ctx.close(); continue; }
    await page.click(CARD + ' .vid-q');
    await page.keyboard.type('sunsets', { delay: 30 });
    await settled(page, 300);
    const row = CARD + ' .vid-results .vid-row[data-do="vid-play"]';
    if (!await page.$(row)) { fail('FULL', at0, 'no result that plays for "sunsets"'); await ctx.close(); continue; }
    await page.click(row);
    await settled(page, 600);
    const tile = CARD + ' .vid-acts .tile[data-do="vid-full"]';
    if (!await page.$(CARD + ' .vid-stage iframe.vid-player') || !await page.$(tile)) {
      fail('FULL', at0, 'the tapped clip drew no frame or no Full screen tile'); await ctx.close(); continue;
    }
    await page.click(tile);
    await settled(page, 400);
    const asks = (where, m) => {
      const at = `${where} (${m ? m.vp : '?'})`;
      if (!m || !m.open || !m.fs) { fail('FULL', at, 'the player\'s block is not in the top layer, marked full screen'); return; }
      if (!m.whole || !m.over) fail('FULL', at, `the block is not the whole glass: ${JSON.stringify(m.block)}, every corner and the middle on it: ${m.over}`);
      if (!m.wide) fail('FULL', at, `the film is ${m.film[2]}x${m.film[3]} at ${JSON.stringify(m.film.slice(0, 2))} — wanted 16:9, on the glass, at least ${m.room} wide`);
      if (!m.clear) fail('FULL', at, `the Exit tile is ${m.exit ? m.exit[2] + 'x' + m.exit[3] + ' at ' + m.exit[0] + ',' + m.exit[1] : 'not there'} — wanted 44px, on the glass and off the picture`);
      said.push(`FULL ${at}: film ${m.film.join(',')} (room ${m.room}), exit ${m.exit ? m.exit.join(',') : '-'}`);
    };
    asks(`${W}x${H} on`, await measure(page));
    await page.setViewportSize({ width: H, height: W });
    await settled(page, 700);
    asks(`${W}x${H} turned to ${H}x${W} while on`, await measure(page));
    await page.setViewportSize({ width: W, height: H });
    await settled(page, 700);
    asks(`${W}x${H} turned back`, await measure(page));
    await page.keyboard.press('Escape');
    await settled(page, 400);
    const off = await page.evaluate(c => {
      const w = document.querySelector(c + ' .vid-watch');
      let open = false;
      try { open = w.matches(':popover-open'); } catch (e) {}
      return { open, fs: w.classList.contains('is-fs'), tile: !!document.querySelector(c + ' .vid-acts [data-do="vid-full"]') };
    }, CARD);
    if (off.open || off.fs || !off.tile) fail('FULL', at0, `Escape did not give the screen back: ${JSON.stringify(off)}`);
    /* ONCE: the tap loaded it, and nothing since — on, two turns, Escape — loaded it again. */
    if (loads.length !== 1) fail('FULL', at0, `the player's frame loaded ${loads.length} times through full screen and two turns — wanted once; the film restarted`);
    if (errs.length) fail('FULL', at0, 'the page threw: ' + errs.join(' | '));
    await ctx.close();
  }
}

(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.log('videos: could not serve — ' + e.message); process.exit(1); }
  PORT = server.address().port;
  /* THE CHROMIUM THIS MACHINE HAS, as `check/press.js` finds it. */
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  let browser;
  try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); }
  catch (e) { console.log('videos: could not start a browser — ' + e.message); server.close(); process.exit(1); }
  const t0 = Date.now();
  const rules = [['hold', hold], ['search', search], ['one', one], ['full', full]].filter(([k]) => want(k));
  for (const [k, fn] of rules) {
    try { await fn(browser); } catch (e) { fail(k.toUpperCase(), '-', 'could not run: ' + String(e.message || e).slice(0, 200)); }
  }
  await browser.close();
  server.close();
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (process.argv.includes('--verbose')) said.forEach(s => console.log('  ' + s));
  if (ONLY.length) console.log(`  (narrowed to ${ONLY.join(', ')} — not what the roster runs)`);
  if (found.length) {
    console.log(`\nvideos: ${found.length} finding(s) in ${secs}s\n`);
    found.forEach(f => console.log(`  ${f.rule.padEnd(7)} ${f.where}\n          ${f.msg}`));
    console.log('');
    process.exit(1);
  }
  console.log(`videos: ${rules.map(r => r[0]).join(', ')} — nothing found, ${said.length} measurements, in ${secs}s.`);
})().catch(e => { console.log('videos: could not run — ' + (e && e.stack || e)); process.exit(1); });
