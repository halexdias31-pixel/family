#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/share.js

   IS THE SHARED PICTURE THE RECEIPT ON THE SCREEN? Measured, pixel by pixel.

   ASKED FOR AS *"just make sure sharing booking is an identical jpg or png or whatevers best of the
   booking reciept."* "Identical" is a claim about pixels, so the only honest instrument is one that
   looks at pixels: this presses the Share tile through the app's own dispatcher, catches the file
   handed to `navigator.share`, screenshots the same element at the same device scale, and compares
   the two. `check-flow` proves the plumbing (a PNG, a File, the share sheet or a download); it runs in
   jsdom, which has no layout and no canvas, and so cannot say one word about what the picture LOOKS
   like. This is the half it cannot reach.

   WHAT IS COMPARED IS WHAT IS SHARED. The tiles and an admin's two extra money rows are hidden for
   the picture (`.rc-snap`, see receipt.js), so the screenshot is taken with that same class on. Any
   other difference is a fault.

   TWO RECEIPTS AT TWO WIDTHS: the booking form as somebody fills it in (a dozen dropdowns on paper,
   which is where a clone most easily gets the answer wrong), and a saved session — the state
   `check/states.js` already builds, entered through its own `enter`, so this cannot drift from what
   `ui.js` measures. 320 because everything breaks there first; 390 because it is the common phone.

   NO PORT. The files are served by Playwright's own router on an address that never touches the
   network, because every other browser check here holds a port and this machine runs several
   worktrees' checks at once. The backend is the fixture, exactly as `ui.js` stands it in.

   A RESIDUE IS EXPECTED AND IT IS BOUNDED. The card sits at a fractional position on the screen,
   inside a column `placeCells` has translated, and at 0,0 in the picture — so the browser snaps each
   line of text to a whole device pixel from a different starting point, and a row can land one
   device pixel (half a CSS pixel) higher or lower. Measured on the first run: 0.3–1.7% of pixels
   different at the exact best alignment, every one of them a glyph edge a pixel out. So a pixel is
   WRONG only when nothing within one device pixel of it on the screen is within 64 of it on any
   channel (a quarter of the range), and the run fails above 0.5% wrong. A missing row, the fallback
   typeface, a select showing its first option or a tick drawn grey are each wrong over far more
   than that. All three figures are printed, so the residue is visible rather than averaged away.

     node check/share.js             compare, exit 1 on a mismatch
     node check/share.js --shots=DIR also write each pair and a diff to DIR
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { STATES } = require('./states.js');

const ROOT = path.join(__dirname, '..');
const BASE = 'http://share.check/';
const WIDTHS = [320, 390];
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* A CHANNEL DIFFERENCE BELOW THIS IS A SHADE OF ANTI-ALIASING; ABOVE IT IS A DIFFERENT PIXEL. */
const LOUD = 64;
const MAX_PCT = 0.5;
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
                '.html': 'text/html', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
                '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

/* THE SIGNED-IN ADMIN `ui.js` USES, trimmed to who they are: an admin is sent all three money rows,
   so the session's picture is the case where two of them must be left off. */
const ADMIN = { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                role: 'admin', roles: ['admin'], handle: 'testadmin' };

/* ---------- IN THE PAGE: PRESS SHARE ON THIS RECEIPT AND HAND BACK THE FILE ------------------------
   `navigator.share` is answered by a stand-in that keeps the file — the phone's share sheet is the
   one thing a headless browser has not got. `canShare` says yes to files, which is the iPhone and
   Android path; the download path is `check-flow`'s. */
async function shareOf(page, pick) {
  return page.evaluate(async pick => {
    window.__shared = null;
    navigator.canShare = d => !!(d && d.files && d.files.length);
    navigator.share = d => { window.__shared = d; return Promise.resolve(); };
    const rc = pick === 'form'
      ? document.querySelector('#bookr .rc')
      : [...document.querySelectorAll('#s-booking .page .rc')]
          .find(r => /J-UI/.test((r.querySelector('.rc-ref') || {}).textContent || ''));
    if (!rc) return { err: 'no ' + pick + ' receipt on the Booking column' };
    const tile = rc.querySelector('[data-do="book-share"]');
    if (!tile) return { err: 'the ' + pick + ' receipt has no Share tile' };
    rc.scrollIntoView({ block: 'start' });
    tile.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 100 && !window.__shared; i++) await new Promise(r => setTimeout(r, 50));
    const d = window.__shared;
    if (!d) return { err: 'pressing Share on the ' + pick + ' receipt never reached navigator.share' };
    const f = d.files && d.files[0];
    if (!f) return { err: 'navigator.share was given no file' };
    const url = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(f); });
    const box = rc.getBoundingClientRect();
    return { name: f.name, type: f.type, size: f.size, url, w: box.width, h: box.height, x: box.left, y: box.top };
  }, pick);
}

/* ---------- IN THE PAGE: TWO PNGs, PIXEL BY PIXEL, AT THE BEST REGISTRATION ---------------------
   THE CARD SITS AT A FRACTIONAL POSITION ON THE SCREEN and at 0,0 in the picture. Measured on its
   first run: 259.6 CSS pixels wide at 320, so the screenshot — which rounds its clip OUTWARD — is a
   device pixel wider and taller than the picture and starts half a pixel earlier. Compared at 0,0
   that is every edge in the card one pixel out and 4.9% "different" on two images a person could not
   tell apart. So the picture is slid over the screenshot up to three device pixels each way and the
   best fit is the one reported: a registration, not a tolerance — a missing row or a wrong colour
   does not get better at any offset. */
async function compare(page, a, b) {
  return page.evaluate(async ([a, b, LOUD]) => {
    const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const px = img => { const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, c.width, c.height).data; };
    const pa = px(ia), pb = px(ib);
    const AW = ia.naturalWidth, AH = ia.naturalHeight, BW = ib.naturalWidth, BH = ib.naturalHeight;
    const R = 3;
    /* Over the picture's own area less the R-pixel frame every offset can reach. */
    const x0 = R, y0 = R, x1 = Math.min(AW, BW) - R, y1 = Math.min(AH, BH) - R;
    const score = (dx, dy) => {
      let any = 0, loud = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const i = (y * AW + x) * 4, j = ((y + dy) * BW + (x + dx)) * 4;
        const m = Math.max(Math.abs(pa[i] - pb[j]), Math.abs(pa[i + 1] - pb[j + 1]), Math.abs(pa[i + 2] - pb[j + 2]));
        if (m) any++;
        if (m > LOUD) loud++;
      }
      return { any, loud };
    };
    let best = null;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const s = score(dx, dy);
      if (!best || s.loud < best.loud || (s.loud === best.loud && s.any < best.any)) best = { dx, dy, ...s };
    }
    /* ---------- AND THEN A PIXEL'S WORTH OF SLACK, LOCALLY -------------------------------------------
       ONE REGISTRATION IS NOT ENOUGH, measured: with the best global offset found, whole ROWS still
       came out red — `Level`, `Tutor`, `Dates` — each one device pixel above or below where the
       screen put it, and the rows between them exact. That is the browser snapping each line's
       baseline to a whole device pixel, from a fractional starting point that differs between the
       screen (where the column is a composited layer `placeCells` has translated) and the picture
       (which starts at 0,0). The words, the face, the colours and the order are the same; the snap is
       not something the page controls.

       SO A PIXEL IS A FAULT ONLY IF NOTHING WITHIN ONE DEVICE PIXEL OF IT ON THE SCREEN MATCHES. Half
       a CSS pixel. A row that is missing, a word in the fallback typeface, an answer that came out as
       the select's first option, a gold tick drawn grey — every one of those is wrong over many
       pixels in every direction and survives this untouched. Both figures are printed; the strict
       one is the honest size of the residue, this one is what fails the run. */
    const near = (x, y) => {
      const i = (y * AW + x) * 4;
      let lo = 255;
      for (let oy = -1; oy <= 1 && lo > LOUD; oy++) for (let ox = -1; ox <= 1; ox++) {
        const xx = x + best.dx + ox, yy = y + best.dy + oy;
        if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) continue;
        const j = (yy * BW + xx) * 4;
        const m = Math.max(Math.abs(pa[i] - pb[j]), Math.abs(pa[i + 1] - pb[j + 1]), Math.abs(pa[i + 2] - pb[j + 2]));
        if (m < lo) lo = m;
      }
      return lo;
    };
    const dc = document.createElement('canvas'); dc.width = x1 - x0; dc.height = y1 - y0;
    const dg = dc.getContext('2d'); const dd = dg.createImageData(dc.width, dc.height);
    let wrong = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * AW + x) * 4, k = ((y - y0) * (x1 - x0) + (x - x0)) * 4;
      const bad = near(x, y) > LOUD;
      if (bad) wrong++;
      /* THE DIFF A PERSON LOOKS AT: the picture dimmed to a quarter, and every pixel that is wrong
         even with the slack in solid red. */
      dd.data[k] = bad ? 255 : pa[i] >> 2; dd.data[k + 1] = bad ? 0 : pa[i + 1] >> 2;
      dd.data[k + 2] = bad ? 0 : pa[i + 2] >> 2; dd.data[k + 3] = 255;
    }
    dg.putImageData(dd, 0, 0);
    const n = (x1 - x0) * (y1 - y0);
    return { aw: AW, ah: AH, bw: BW, bh: BH, dx: best.dx, dy: best.dy, wrong: wrong / n * 100,
             any: best.any / n * 100, loud: best.loud / n * 100, diff: dc.toDataURL('image/png') };
  }, [a, b, LOUD]);
}

(async () => {
  /* THE BROWSER THIS MACHINE HAS, found the way `ui.js` finds it — the bundled one is a different
     build from the one the package expects. */
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome']
              .find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const bad = [];
  let n = 0;
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const sessionState = (STATES.booking || []).find(s => s.name === 'a session receipt');
  if (!sessionState) { console.log('check/share.js: check/states.js has no "a session receipt" state — renamed?'); process.exit(1); }

  for (const width of WIDTHS) {
    /* TALL, so neither receipt is clipped by the pane it is in — a screenshot of a clipped element
       would be compared against a picture of the whole one and fail for the wrong reason. */
    const ctx = await browser.newContext({ viewport: { width, height: 2600 }, deviceScaleFactor: 2,
                                           serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, ADMIN);
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.route(BASE + '**', r => {
      const rel = decodeURI(new URL(r.request().url()).pathname).replace(/^\/+/, '') || 'index.html';
      const f = path.join(ROOT, rel);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' });
      r.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'text/plain', body: fs.readFileSync(f) });
    });
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    /* THE FONT HAS TO HAVE ARRIVED ON THE SCREEN TOO, or the screenshot is the fallback face and the
       picture the right one — a mismatch that is the screen's fault, not the share's. */
    await page.evaluate(() => document.fonts && document.fonts.ready);

    for (const pick of ['form', 'session']) {
      await page.evaluate(([pick, enter]) => {
        go('booking', false, true);
        if (pick === 'session') (0, eval)('(' + enter + ')')();
        else if (typeof goPage === 'function') goPage('booking', 0, true);
      }, [pick, String(sessionState.enter)]);
      await page.waitForTimeout(700);
      /* ---------- A FORM WITH AN ANSWER ON IT --------------------------------------------------------
         THE BLANK FORM SHOWS THE FIRST OPTION OF EVERY SELECT, so a clone that forgot what had been
         picked would photograph it correctly. One row is answered — through the select's own
         `change`, which is what a finger does — with an option that is NOT the first, so a picture
         showing the first option is a picture showing the wrong answer. */
      if (pick === 'form') {
        const chose = await page.evaluate(() => {
          const s = [...document.querySelectorAll('#bookr select.bk-sel:not(:disabled)')]
            .find(x => x.options.length > 2);
          if (!s) return '';
          s.value = s.options[s.options.length - 1].value;
          s.dispatchEvent(new Event('change', { bubbles: true }));
          if (typeof selShut_ === 'function') selShut_();
          return s.options[s.options.length - 1].text;
        });
        if (!chose) bad.push(`form at ${width}px: no select on the form with three options to answer`);
        await page.waitForTimeout(400);
      }
      const got = await shareOf(page, pick);
      const label = `${pick} at ${width}px`;
      n++;
      if (got.err) { bad.push(label + ': ' + got.err); continue; }
      if (got.type !== 'image/png' || !/\.png$/.test(got.name)) bad.push(`${label}: shared ${got.type} "${got.name}", not a PNG`);

      /* THE SAME ELEMENT, AS THE SCREEN DRAWS IT, with the picture's two exclusions on — and its box
         measured in that state, which is the size the picture has to be. */
      const rcSel = pick === 'form' ? '#bookr .rc' : '#s-booking .rc.rc-cmp';
      const snap = await page.evaluate(pick => {
        const rc = pick === 'form' ? document.querySelector('#bookr .rc')
          : [...document.querySelectorAll('#s-booking .page .rc')]
              .find(r => /J-UI/.test((r.querySelector('.rc-ref') || {}).textContent || ''));
        rc.classList.add('rc-snap'); rc.classList.add('rc-cmp');
        const b = rc.getBoundingClientRect();
        /* WHAT MUST BE OFF THE PICTURE, AND WHETHER IT IS THERE TO BE LEFT OFF. A run where the card
           had no tiles and no admin rows would pass this vacuously, so the count is reported too. */
        const off = [...rc.querySelectorAll('.rc-tiles, .rc-more')];
        return { w: b.width, h: b.height, off: off.length,
                 shown: off.filter(x => x.getClientRects().length).length };
      }, pick);
      if (!snap.off) bad.push(`${label}: the card has no tiles to leave off the picture — nothing proved`);
      if (snap.shown) bad.push(`${label}: ${snap.shown} of the tiles / admin money rows would be in the picture`);
      if (pick === 'session' && snap.off < 3) bad.push(`${label}: the session card has ${snap.off} of a tile row and two admin money rows`);
      const shot = await page.locator(rcSel).first().screenshot({ scale: 'device', animations: 'disabled' });
      await page.evaluate(sel => { const rc = document.querySelector(sel); rc.classList.remove('rc-snap', 'rc-cmp'); }, rcSel);
      const shotUrl = 'data:image/png;base64,' + shot.toString('base64');
      const cmp = await compare(page, got.url, shotUrl);

      /* THE PICTURE IS THE CARD'S OWN SIZE TIMES TWO, to the pixel the rounding allows. Against the
         box rather than the screenshot, because a screenshot's clip is rounded OUTWARD from a
         fractional position and comes out a pixel or two larger than the thing in it. */
      const ew = Math.ceil(snap.w * 2), eh = Math.ceil(snap.h * 2);
      const sizeOk = Math.abs(cmp.aw - ew) <= 1 && Math.abs(cmp.ah - eh) <= 1;
      console.log(`  ${label}: ${cmp.aw}x${cmp.ah} PNG for a ${snap.w.toFixed(1)}x${snap.h.toFixed(1)} card, `
        + `${(got.size / 1024).toFixed(0)} KB — ${cmp.wrong.toFixed(3)}% wrong `
        + `(${cmp.loud.toFixed(2)}% strictly at (${cmp.dx},${cmp.dy}), ${cmp.any.toFixed(1)}% off by any shade)`);
      if (!sizeOk) bad.push(`${label}: the picture is ${cmp.aw}x${cmp.ah} and the card at 2x is ${ew}x${eh}`);
      if (cmp.wrong > MAX_PCT) bad.push(`${label}: ${cmp.wrong.toFixed(2)}% of the picture differs from the screen (over ${MAX_PCT}%)`);
      if (SHOTS) {
        const b64 = u => Buffer.from(u.split(',')[1], 'base64');
        fs.writeFileSync(path.join(SHOTS, `${pick}-${width}-shared.png`), b64(got.url));
        fs.writeFileSync(path.join(SHOTS, `${pick}-${width}-screen.png`), shot);
        fs.writeFileSync(path.join(SHOTS, `${pick}-${width}-diff.png`), b64(cmp.diff));
      }
    }
    if (errs.length) bad.push(`${width}px: the page threw — ${errs[0]}`);
    await ctx.close();
  }
  await browser.close();
  console.log('');
  if (bad.length) {
    bad.forEach(b => console.log('  FAIL  ' + b));
    console.log('\nFAILED — the shared picture is not the receipt on the screen');
    process.exit(1);
  }
  console.log(`OK — ${n} shared pictures, each the receipt on the screen.`);
})().catch(e => { console.log('check/share.js could not run: ' + e.message); process.exit(1); });
